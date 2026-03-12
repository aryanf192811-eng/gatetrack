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

  const GLOBAL_META_KEY = 'gate_global_meta';
  const PROFILE_PROGRESS_PREFIX = 'gate_progress_';
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
    activeProfileId: null,
    config: null,
    supabaseUser: null
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

  function getProfileKey(profileId) {
    return PROFILE_PROGRESS_PREFIX + (profileId || state.activeProfileId);
  }

  function loadGlobalMeta() {
    const raw = nativeStorage.getItem(GLOBAL_META_KEY);
    const fallback = { profiles: [], activeProfileId: null };
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function saveGlobalMeta(meta) {
    nativeStorage.setItem(GLOBAL_META_KEY, JSON.stringify(meta));
  }

  function getSupabaseUserId() {
    // If we have a supabase client and it's authenticated, use that UID
    if (global.supabaseClient && global.supabaseClient.auth) {
      const { data } = global.supabaseClient.auth.getSession() || {};
      if (data?.session?.user?.id) return data.session.user.id;
    }
    // Fallback for RLS - if not logged in, we can't really sync with RLS=auth.uid()
    // but the app identifies by session if anon or similar. 
    // For this PWA, we assume the user might be anon or logged in.
    return 'authenticated-user'; // Placeholder if RLS is strict, usually you'd get from session
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
      user_id: getSupabaseUserId(), // Cloud identity
      profile_id: state.activeProfileId // Local profile partition
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

    const meta = loadGlobalMeta();
    state.activeProfileId = meta.activeProfileId;
    state.config = createConfig(customConfig);

    // Initial load for the active profile
    if (state.activeProfileId) {
      loadProfileDataIntoLocalStorage(state.activeProfileId);
    }

    patchLocalStorage();
    startSync();

    state.initialized = true;
    return api;
  }

  function loadProfileDataIntoLocalStorage(profileId) {
    const raw = nativeStorage.getItem(getProfileKey(profileId));
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (isTrackedKey(key)) nativeStorage.setItem(key, data[key]);
        });
      }
    } catch (e) {}
  }

  function saveLocalStorageIntoProfileData(profileId) {
    const data = {};
    TRACKED_KEYS.forEach(key => {
      const val = nativeStorage.getItem(key);
      if (val !== null) data[key] = val;
    });
    nativeStorage.setItem(getProfileKey(profileId), JSON.stringify(data));
  }

  function startSync() {
    if (state.engine) {
      state.engine.stop();
    }

    state.engine = syncFactory.createEngine({
      supabaseUrl: state.config.supabaseUrl,
      supabaseAnonKey: state.config.supabaseAnonKey,
      intervalMs: state.config.intervalMs,
      initialPullDelayMs: state.config.initialPullDelayMs,
      getUserId: getSupabaseUserId,
      getProfileId: () => state.activeProfileId,
      loadCache: cacheApi.loadCache,
      onRemoteProgress: (progress, updatedAt) => {
        // progress here is the profile-specific progress from the cloud 'profiles' map
        const remoteCache = cacheApi.normalizeCache({
          progress: progress,
          updated_at: updatedAt,
          user_id: getSupabaseUserId()
        });
        cacheApi.saveCache(remoteCache);
        hydrateLegacyToLocal(remoteCache, 'cloud');
        // Also update the profile-specific storage key
        saveLocalStorageIntoProfileData(state.activeProfileId);
      },
      onError: (error) => {
        console.warn('GateTracker sync deferred:', error);
      }
    });

    state.engine.start();
  }

  function switchUser(newProfileId) {
    if (!newProfileId || newProfileId === state.activeProfileId) return;
    
    console.log(`GateTracker: Switching profile from ${state.activeProfileId} to ${newProfileId}`);
    
    // 1. Save current progress to current profile key before leaving
    if (state.activeProfileId) {
      saveLocalStorageIntoProfileData(state.activeProfileId);
    }

    // 2. Clear current tracked keys and cache to prepare for fresh load
    TRACKED_KEYS.forEach(key => nativeStorage.removeItem(key));
    nativeStorage.removeItem(cacheApi.CACHE_KEY);

    // 3. Update active profile in state and meta
    state.activeProfileId = newProfileId;
    const meta = loadGlobalMeta();
    meta.activeProfileId = newProfileId;
    saveGlobalMeta(meta);

    // 4. Load new profile data into localStorage
    loadProfileDataIntoLocalStorage(newProfileId);

    // 5. Restart sync for new user/profile context
    if (state.initialized) {
      startSync();
      state.engine.syncWithCloud(true);
    }

    // 6. Notify UI
    global.dispatchEvent(new CustomEvent('gate-storage-updated', {
      detail: { source: 'profile-switch', profileId: newProfileId }
    }));
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
    switchUser,
    getCurrentProfileId: () => state.activeProfileId,
    getCurrentUserId: getSupabaseUserId
  };

  global.GateTrackerStorage = api;
  api.init();
})(window);
