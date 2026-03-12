(function(global) {
  const storage = global.localStorage;
  const nativeGetItem = storage.getItem.bind(storage);
  const nativeSetItem = storage.setItem.bind(storage);
  const nativeRemoveItem = storage.removeItem.bind(storage);

  const CACHE_KEY = 'gateTrackerCache';
  const DEFAULT_CACHE = {
    progress: {
      flashcardsCompleted: [],
      pyqSolved: [],
      revisionHistory: [],
      stats: {},
      legacy: {}
    },
    updated_at: null,
    user_id: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeCache(data) {
    const source = data && typeof data === 'object' ? data : {};
    const progress = source.progress && typeof source.progress === 'object'
      ? source.progress
      : {};

    return {
      progress: {
        flashcardsCompleted: Array.isArray(progress.flashcardsCompleted)
          ? progress.flashcardsCompleted
          : [],
        pyqSolved: Array.isArray(progress.pyqSolved)
          ? progress.pyqSolved
          : [],
        revisionHistory: Array.isArray(progress.revisionHistory)
          ? progress.revisionHistory
          : [],
        stats: progress.stats && typeof progress.stats === 'object'
          ? progress.stats
          : {},
        legacy: progress.legacy && typeof progress.legacy === 'object'
          ? progress.legacy
          : {}
      },
      updated_at: source.updated_at || null,
      user_id: source.user_id || null
    };
  }

  function loadCache() {
    try {
      const raw = nativeGetItem(CACHE_KEY);
      if (!raw) return clone(DEFAULT_CACHE);
      return normalizeCache(JSON.parse(raw));
    } catch (error) {
      console.warn('GateTrackerCache load failed:', error);
      return clone(DEFAULT_CACHE);
    }
  }

  function saveCache(data) {
    const next = normalizeCache(data);
    try {
      nativeSetItem(CACHE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('GateTrackerCache save failed:', error);
    }
    return next;
  }

  global.GateTrackerCache = {
    CACHE_KEY,
    DEFAULT_CACHE: clone(DEFAULT_CACHE),
    nativeStorage: {
      getItem: nativeGetItem,
      setItem: nativeSetItem,
      removeItem: nativeRemoveItem
    },
    normalizeCache,
    loadCache,
    saveCache
  };
})(window);
