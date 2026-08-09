var CACHE_NAME = 'flashcards-v1';
var SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache the app shell
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first for app shell, pass through API calls
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Never cache GitHub API calls — app handles offline fallback via localStorage
  if (url.hostname === 'api.github.com') {
    return;
  }

  // For app shell resources: cache-first, falling back to network
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        // Serve from cache, but also update cache in background
        var fetchPromise = fetch(event.request).then(function(response) {
          if (response.ok && url.origin === self.location.origin) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(function() {});
        return cached;
      }
      return fetch(event.request).then(function(response) {
        if (response.ok && url.origin === self.location.origin) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
