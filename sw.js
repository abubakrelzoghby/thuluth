/**
 * Thuluth Meeting — Service Worker
 * App-shell caching for offline startup; network-first for API and CDN assets.
 */

'use strict';

const CACHE_VERSION = 'thuluth-meeting-v2';
const PRECACHE_URLS = [
  './',
  './index.html',
  './app.js',
  './sw.js',
  './manifest.json',
  './manifest.ar.json',
  './manifest.en.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';

const API_HOST = 'api.aladhan.com';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => cache.add(FONT_STYLESHEET).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate'
    || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isApiRequest(url) {
  return url.hostname === API_HOST;
}

function isSameOriginAppAsset(url, origin) {
  return url.origin === origin && !url.pathname.endsWith('sw.js');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  // Prayer times API — network only (offline handled in app UI)
  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Google Fonts stylesheet — cache when available, refresh in background
  if (url.origin === 'https://fonts.googleapis.com') {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Google Fonts files — stale-while-revalidate
  if (url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);
        return cached || (await fetchPromise) || Response.error();
      })
    );
    return;
  }

  // Tailwind CDN — network first (large; optional at runtime)
  if (url.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // HTML navigation — network first, fallback to cached shell
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_VERSION);
          return (
            (await cache.match('./index.html'))
            || (await cache.match('./'))
            || (await cache.match('index.html'))
          );
        })
    );
    return;
  }

  // Same-origin static assets — cache first, then network
  if (isSameOriginAppAsset(url, self.location.origin)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
