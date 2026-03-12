(function(global) {
  function createEngine(options) {
    const state = {
      queue: [],
      intervalId: null,
      isSyncing: false,
      supabaseClient: null
    };

    function getSupabaseConfig() {
      return {
        url: options.supabaseUrl || '',
        anonKey: options.supabaseAnonKey || ''
      };
    }

    function getSupabaseClient() {
      if (state.supabaseClient) return state.supabaseClient;
      if (global.supabaseClient) {
        state.supabaseClient = global.supabaseClient;
        return state.supabaseClient;
      }

      const config = getSupabaseConfig();
      if (!config.url || !config.anonKey) return null;
      if (!global.supabase || typeof global.supabase.createClient !== 'function') {
        return null;
      }

      state.supabaseClient = global.supabase.createClient(config.url, config.anonKey);
      return state.supabaseClient;
    }

    function enqueue(reason) {
      state.queue.push({
        reason: reason || 'change',
        enqueued_at: new Date().toISOString()
      });
    }

    async function pullFromCloud() {
      const client = getSupabaseClient();
      if (!client) return null;

      try {
        const { data, error } = await client
          .from('user_progress')
          .select('user_id, progress, updated_at')
          .eq('user_id', options.getUserId())
          .maybeSingle();

        if (error) throw error;
        if (!data || !data.progress) return null;

        const localCache = options.loadCache();
        const localTime = Date.parse(localCache.updated_at || 0) || 0;
        const cloudTime = Date.parse(data.updated_at || 0) || 0;

        if (cloudTime > localTime) {
          options.onRemoteProgress(data.progress, data.updated_at);
          return data;
        }
      } catch (error) {
        options.onError(error);
      }

      return null;
    }

    async function pushToCloud(force) {
      if (state.isSyncing) return false;
      if (!force && state.queue.length === 0) return false;

      const client = getSupabaseClient();
      if (!client) return false;

      state.isSyncing = true;
      try {
        const cache = options.loadCache();
        const payload = {
          user_id: options.getUserId(),
          progress: cache.progress,
          updated_at: cache.updated_at || new Date().toISOString()
        };

        const { error } = await client
          .from('user_progress')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) throw error;
        state.queue = [];
        return true;
      } catch (error) {
        options.onError(error);
        return false;
      } finally {
        state.isSyncing = false;
      }
    }

    async function syncWithCloud(force) {
      await pullFromCloud();
      return pushToCloud(!!force);
    }

    function start() {
      if (state.intervalId) return;

      state.intervalId = global.setInterval(() => {
        syncWithCloud(false);
      }, options.intervalMs || 30000);

      global.setTimeout(() => {
        syncWithCloud(true);
      }, options.initialPullDelayMs || 300);

      global.addEventListener('online', () => {
        syncWithCloud(true);
      });
    }

    return {
      enqueue,
      pullFromCloud,
      pushToCloud,
      syncWithCloud,
      start
    };
  }

  global.GateTrackerSyncEngine = {
    createEngine
  };
})(window);