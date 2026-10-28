/**
 * ODCS Official Service Worker
 * Implements Layer 1 & 3 offline resilience for the ODCS institutional platform.
 */

const CACHE_NAME = 'odcs-portal-v1.1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './docs.html',
  './manifest.json',
  './assets/odcs-logo.svg',
  './assets/odcs-symbol.svg',
  './assets/favicon.svg',
  './css/style.css',
  './css/docs.css',
  './js/globe.js',
  './js/main.js',
  './js/simulator.js',
  './js/specs-data.js',
  './js/docs.js',
  './model/ODC-MODEL.md',
  './model/layer-1.md',
  './model/layer-2.md',
  './model/layer-3.md',
  './model/layer-4.md',
  './docs/ARCHITECTURE.md',
  './docs/IMPLEMENTATION-GUIDE.md',
  './docs/BRAND-IDENTITY.md',
  './docs/FAQ.md'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-first falling back to network strategy for offline continuity
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {
          // Silent offline fallback
        });
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback to index if navigating
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
