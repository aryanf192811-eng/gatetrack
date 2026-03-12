const CACHE_NAME = "gate-tracker-v4";

const urlsToCache = [
  "/",
  "/index.html",
  "/widget.html",
  "/storage/cache.js",
  "/storage/syncEngine.js",
  "/storage/storage.js",
  "/data/data.js",
  "/data/pyq_intelligence.js",
  "/data/dataset_v6_pyq_quiz.js",
  "/data/dataset_examside.js"
];


// INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        urlsToCache.map(url => cache.add(url).catch(() => null))
      )
    )
  );
});


// FETCH
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // NEVER intercept critical PWA files
  if (
    url.pathname === "/manifest.json" ||
    url.pathname === "/sw.js" ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/icons/")
  ) {
    return;
  }

  // Navigation requests (SPA fallback)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Dataset caching strategy (stale-while-revalidate)
  if (url.pathname.startsWith("/data/")) {

    event.respondWith(
      caches.match(event.request).then(cached => {

        const networkFetch = fetch(event.request)
          .then(networkResponse => {

            if (networkResponse && networkResponse.ok) {

              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });

            }

            return networkResponse;

          })
          .catch(() => cached);

        return cached || networkFetch;

      })
    );

    return;
  }

  // Default network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {

        if (networkResponse && networkResponse.ok) {

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });

        }

        return networkResponse;

      })
      .catch(() => caches.match(event.request))
  );

});


// ACTIVATE
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {

          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }

        })
      )
    )

  );

  self.clients.claim();

});


// Weekly Digest Background Sync
self.addEventListener("periodicsync", event => {

  if (event.tag === "weekly-digest") {

    event.waitUntil(

      self.clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(clients => {

        clients.forEach(client => {
          client.postMessage({
            type: "TRIGGER_DIGEST"
          });
        });

      })

    );

  }

});