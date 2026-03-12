const CACHE_NAME = "gate-tracker-v5";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/widget.html",
  "/storage/cache.js",
  "/storage/syncEngine.js",
  "/storage/storage.js",
  "/data/data.js",
  "/data/pyq_intelligence.js",
  "/data/dataset_v6_pyq_quiz.js",
  "/data/dataset_examside.js"
];

function canCache(response) {
  return Boolean(response && response.ok && (response.type === "basic" || response.type === "cors"));
}

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(urlsToCache.map(url => cache.add(url).catch(() => null)))
    )
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (
    url.pathname === "/sw.js" ||
    url.pathname === "/favicon.ico"
  ) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (await caches.match("/index.html")) || Response.error();
      })
    );
    return;
  }

  if (url.pathname.startsWith("/data/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(event.request);

        const refresh = fetch(event.request)
          .then(networkResponse => {
            if (canCache(networkResponse)) {
              const cachedResponse = networkResponse.clone();
              event.waitUntil(cache.put(event.request, cachedResponse));
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(refresh.then(() => null));
          return cached;
        }

        return refresh.then(response => response || Response.error());
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const networkResponse = await fetch(event.request);

        if (canCache(networkResponse)) {
          const cachedResponse = networkResponse.clone();
          event.waitUntil(cache.put(event.request, cachedResponse));
        }

        return networkResponse;
      } catch (error) {
        const cached = await cache.match(event.request);
        return cached || Response.error();
      }
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("periodicsync", event => {
  if (event.tag === "weekly-digest") {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: "TRIGGER_DIGEST" });
        });
      })
    );
  }
});
