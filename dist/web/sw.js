
const CACHE_NAME = 'void-ide-v1';
const ASSETS = [
  './',
  './index.html',
  './renderer.js',
  './plugins.js',
  './void-ide.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
