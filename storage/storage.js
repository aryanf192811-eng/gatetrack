(function(global) {
  const cacheApi = global.GateTrackerCache;
  const syncFactory = global.GateTrackerSyncEngine;

  if (!cacheApi || !syncFactory) {
    console.warn('GateTrackerStorage dependencies missing');
    return;
  }

  const nativeStorage = cacheApi.nativeStorage;
  const storageProto = Object.getPrototypeOf(global.localStorage);
  const originalSetItem = storageProto.setItem;
  const originalRemoveItem = storageProto.removeItem;

  const GATE_USER_ID_KEY = 'gateUserId';
  const TRACKED_KEYS = [
    'gate2028_v4',
    'gate_exam_date',
    'gate_lecture_plan_v1',
    'gate_lecture_done_v1',
    'gate_planner_config_v1',
    'gate_prep_start',
    'gate_planner_sync_meta_v1',
    'gate_daily_check_v2',
    'gate_mastery_v1',
    'gate_mastery_meta_v1',
    'gate_exams_taken'
  ];

  const state = {
    initialized: false,
    engine: null,
    userId: null,
    config: null
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function isTrackedKey(key) {
    return TRACKED_KEYS.includes(String(key));
  }

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function generateUserId() {
    if (global.currentUser && global.currentUser.id) {
      return String(global.currentUser.id);
    }

    const existing = nativeStorage.getItem(GATE_USER_ID_KEY);
    if (existing) return existing;

    const next = 'gate-user-' + Math.random().toString(36).slice(2, 10);
    nativeStorage.setItem(GATE_USER_ID_KEY, next);
    return next;
  }

  function readLegacySnapshot() {
    const legacy = {};
    TRACKED_KEYS.forEach((key) => {
      const value = nativeStorage.getItem(key);
      if (value !== null) legacy[key] = value;
    });
    return legacy;
  }

  function buildDerivedProgress(legacy) {
    const appState = safeJsonParse(legacy.gate2028_v4 || 'null', {}) || {};
    const planner = safeJsonParse(legacy.gate_lecture_plan_v1 || '[]', []);
    const plannerDone = safeJsonParse(legacy.gate_lecture_done_v1 || '[]', []);
    const masteryMeta = safeJsonParse(legacy.gate_mastery_meta_v1 || '{}', {});

    const revisionHistory = [];
    const revisionUsers = appState.revision && typeof appState.revision === 'object'
      ? Object.values(appState.revision)
      : [];

    revisionUsers.forEach((subjectMap) => {
      if (!subjectMap || typeof subjectMap !== 'object') return;
      Object.values(subjectMap).forEach((entries) => {
        if (Array.isArray(entries)) revisionHistory.push(...entries);
      });
    });

    const pyqSolved = Object.keys(masteryMeta).filter((key) => {
      const item = masteryMeta[key];
      return item && typeof item === 'object' && Number(item.attempts || 0) > 0;
    });

    let completedSubjects = 0;
    let activeUsers = 0;
    if (appState.progress && typeof appState.progress === 'object') {
      activeUsers = Object.keys(appState.progress).length;
      Object.values(appState.progress).forEach((subjectMap) => {
        if (!subjectMap || typeof subjectMap !== 'object') return;
        Object.values(subjectMap).forEach((entry) => {
          if (entry && Number(entry.pct || 0) >= 100) completedSubjects += 1;
        });
      });
    }

    return {
      flashcardsCompleted: [],
      pyqSolved,
      revisionHistory,
      stats: {
        activeUsers,
        completedSubjects,
        plannedLectures: Array.isArray(planner) ? planner.length : 0,
        completedLectures: Array.isArray(plannerDone) ? plannerDone.length : 0
      }
    };
  }

  function mergeLegacyIntoCache(cache, legacy, updatedAt) {
    const current = cacheApi.normalizeCache(cache);
    const derived = buildDerivedProgress(legacy);

    return cacheApi.normalizeCache({
      progress: {
        flashcardsCompleted: derived.flashcardsCompleted,
        pyqSolved: derived.pyqSolved,
        revisionHistory: derived.revisionHistory,
        stats: derived.stats,
        legacy: legacy
      },
      updated_at: updatedAt || current.updated_at || nowIso(),
      user_id: state.userId || current.user_id || null
    });
  }

  function hydrateLegacyToLocal(cache, source) {
    const normalized = cacheApi.normalizeCache(cache);
    const legacy = normalized.progress.legacy || {};
    const changedKeys = [];

    TRACKED_KEYS.forEach((key) => {
      const nextValue = Object.prototype.hasOwnProperty.call(legacy, key)
        ? legacy[key]
        : null;
      const prevValue = nativeStorage.getItem(key);

      if (nextValue === null) {
        if (prevValue !== null) {
          nativeStorage.removeItem(key);
          changedKeys.push(key);
        }
        return;
      }

      if (prevValue !== nextValue) {
        nativeStorage.setItem(key, nextValue);
        changedKeys.push(key);
      }
    });

    if (changedKeys.length > 0) {
      global.dispatchEvent(new CustomEvent('gate-storage-updated', {
        detail: {
          source: source || 'storage',
          changedKeys: changedKeys
        }
      }));
    }
  }

  function updateTrackedKey(key, value, removed) {
    const cache = cacheApi.loadCache();
    const legacy = Object.assign({}, cache.progress.legacy);

    if (removed) delete legacy[key];
    else legacy[key] = String(value);

    const next = mergeLegacyIntoCache(cache, legacy, nowIso());
    cacheApi.saveCache(next);

    if (state.engine) state.engine.enqueue(key);
    return next;
  }

  function patchLocalStorage() {
    if (storageProto.__gateTrackerPatched) return;

    storageProto.setItem = function(key, value) {
      const result = originalSetItem.call(this, key, value);
      if (this === global.localStorage && isTrackedKey(key)) {
        updateTrackedKey(String(key), value, false);
      }
      return result;
    };

    storageProto.removeItem = function(key) {
      const result = originalRemoveItem.call(this, key);
      if (this === global.localStorage && isTrackedKey(key)) {
        updateTrackedKey(String(key), '', true);
      }
      return result;
    };

    storageProto.__gateTrackerPatched = true;
  }

  function createConfig(customConfig) {
    const runtimeConfig = customConfig && typeof customConfig === 'object'
      ? customConfig
      : {};
    const inlineConfig = global.GATE_STORAGE_CONFIG && typeof global.GATE_STORAGE_CONFIG === 'object'
      ? global.GATE_STORAGE_CONFIG
      : {};

    return {
      trackedKeys: TRACKED_KEYS.slice(),
      intervalMs: 30000,
      initialPullDelayMs: 300,
      supabaseUrl: runtimeConfig.supabaseUrl
        || inlineConfig.supabaseUrl
        || global.GATE_SUPABASE_URL
        || '',
      supabaseAnonKey: runtimeConfig.supabaseAnonKey
        || inlineConfig.supabaseAnonKey
        || global.GATE_SUPABASE_ANON_KEY
        || ''
    };
  }

  function init(customConfig) {
    if (state.initialized) return api;

    state.userId = generateUserId();
    state.config = createConfig(customConfig);

    let cache = cacheApi.loadCache();
    const legacy = readLegacySnapshot();
    const hasCacheLegacy = Object.keys(cache.progress.legacy || {}).length > 0;
    const hasLocalLegacy = Object.keys(legacy).length > 0;

    if (!hasCacheLegacy && hasLocalLegacy) {
      cache = mergeLegacyIntoCache(cache, legacy, cache.updated_at || nowIso());
      cacheApi.saveCache(cache);
    } else {
      cache.user_id = state.userId;
      cacheApi.saveCache(cache);
    }

    hydrateLegacyToLocal(cache, 'bootstrap');
    patchLocalStorage();

    state.engine = syncFactory.createEngine({
      supabaseUrl: state.config.supabaseUrl,
      supabaseAnonKey: state.config.supabaseAnonKey,
      intervalMs: state.config.intervalMs,
      initialPullDelayMs: state.config.initialPullDelayMs,
      getUserId: () => state.userId,
      loadCache: cacheApi.loadCache,
      onRemoteProgress: (progress, updatedAt) => {
        const remoteCache = cacheApi.normalizeCache({
          progress: progress,
          updated_at: updatedAt,
          user_id: state.userId
        });
        cacheApi.saveCache(remoteCache);
        hydrateLegacyToLocal(remoteCache, 'cloud');
      },
      onError: (error) => {
        console.warn('GateTracker sync deferred:', error);
      }
    });

    state.engine.start();
    state.initialized = true;
    return api;
  }

  function getItem(key) {
    return nativeStorage.getItem(key);
  }

  function setItem(key, value) {
    global.localStorage.setItem(key, value);
    return value;
  }

  function getJSON(key, fallback) {
    const raw = getItem(key);
    if (raw === null) return fallback;
    return safeJsonParse(raw, fallback);
  }

  function setJSON(key, value) {
    setItem(key, JSON.stringify(value));
    return value;
  }

  function removeItem(key) {
    global.localStorage.removeItem(key);
  }

  function syncNow() {
    if (!state.engine) return Promise.resolve(false);
    return state.engine.syncWithCloud(true);
  }

  function saveCache(cache) {
    const next = cacheApi.saveCache(cache);
    hydrateLegacyToLocal(next, 'storage');
    if (state.engine) state.engine.enqueue('saveCache');
    return next;
  }

  const api = {
    init,
    trackedKeys: TRACKED_KEYS.slice(),
    loadCache: cacheApi.loadCache,
    saveCache,
    getItem,
    setItem,
    getJSON,
    setJSON,
    removeItem,
    syncNow,
    getCurrentUserId: () => state.userId || generateUserId()
  };

  global.GateTrackerStorage = api;
  api.init();
})(window);
