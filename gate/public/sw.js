const CACHE_NAME = 'gate2028-cache-v17';
const urlsToCache = [
  '/',
  '/index.html',
  '/widget.html',
  '/storage/cache.js',
  '/storage/syncEngine.js',
  '/storage/storage.js',
  '/data/data.js',
  '/data/pyq_intelligence.js',
  '/data/dataset_v6_pyq_quiz.js',
  '/data/dataset_examside.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Bypass waiting to immediately install new worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // If network fails, try to return from cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Immediately take control of all open pages
      return self.clients.claim();
    })
  );
});

// TASK 3 — Weekly Digest: Background Sync trigger
// When supported, fires weekly-digest to prompt the main thread to generate a digest.
// Falls back gracefully to the DOMContentLoaded check in index.html if not supported.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'weekly-digest') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'TRIGGER_DIGEST' }));
      })
    );
  }
});
