const CACHE_NAME = '{{CACHE_NAME}}';
const urlsToCache = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for HTML navigation requests, API calls, and auth routes
  // This prevents caching of blank pages when users are not authenticated
  if (request.mode === 'navigate' || 
      request.headers.get('accept')?.includes('text/html') ||
      url.pathname.startsWith('/api/') || 
      url.pathname === '/login' ||
      url.pathname === '/signup' ||
      url.pathname === '/') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Only cache static assets (images, manifest, etc.)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});