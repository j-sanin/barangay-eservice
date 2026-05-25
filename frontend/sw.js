const CACHE_NAME = 'barangay-eservice-v5';

const urlsToCache = [
  '/index.html',
  '/login.html',
  '/register.html',
  '/dashboard.html',
  '/documents.html',
  '/track.html',
  '/profile.html',
  '/offline.html',
  '/css/styles.css',
  '/css/login.css',
  '/css/dashboard.css',
  '/css/documents.css',
  '/css/register.css',
  '/css/profile.css',
  '/icon.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Never cache JS files - always fetch fresh
  if (event.request.url.includes('.js')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          return caches.match('/offline.html');
        });
      })
  );
});