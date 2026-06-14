const CACHE_NAME = 'antigravity-v1';
const urlsToCache = ['/', '/jobs', '/login', '/register'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request).catch(() => new Response('Offline', { status: 503 })))
  );
});
