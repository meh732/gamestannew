// GameStan Progressive Web App Service Worker
const CACHE_NAME = 'gamestan-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Cache-first or network fallback for smooth offline play
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          return caches.match('/');
        })
      );
    })
  );
});
