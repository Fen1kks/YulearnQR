const CACHE_NAME = 'yulearn-qr-v1';
const BASE_PATH = self.location.pathname.replace('/sw.js', '') || '';
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/scanner.js',
  '/js/validator.js',
  '/js/i18n.js',
  '/js/utils/dom.js',
  '/js/ui/status.js',
  '/js/ui/history.js',
  '/js/ui/redirect.js',
  '/js/ui/settings.js',
  '/js/vendor/qr-scanner.min.js',
  '/js/vendor/qr-scanner-worker.min.js',
  '/manifest.json',
  '/assets/icons/icon.svg'
];
const APP_SHELL = APP_SHELL_FILES.map((f) => BASE_PATH + f);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
