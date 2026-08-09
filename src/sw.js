const CACHE_NAME = 'rename-app-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((res) => {
      return (
        res ||
        fetch(e.request)
          .then((fetchRes) => {
            if (!fetchRes || fetchRes.status !== 200 || fetchRes.type !== 'basic') {
              return fetchRes;
            }
            const resToCache = fetchRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resToCache));
            return fetchRes;
          })
          .catch(() => caches.match('/index.html'))
      );
    })
  );
});
