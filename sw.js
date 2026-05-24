/**
 * Thuluth Meeting — Service Worker
 * Resilient precache + app-shell offline support.
 */

'use strict';

const CACHE_VERSION = 'thuluth-meeting-v3';
const SW_BASE = new URL('.', self.location.href).href;

const PRECACHE_URLS = [
  SW_BASE,
  `${SW_BASE}index.html`,
  `${SW_BASE}app.js`,
  `${SW_BASE}manifest.json`,
  `${SW_BASE}manifest.ar.json`,
  `${SW_BASE}manifest.en.json`,
  `${SW_BASE}icons/icon-192.png`,
  `${SW_BASE}icons/icon-512.png`,
];

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';

const API_HOST = 'api.aladhan.com';

async function precacheAll(cache) {
  await Promise.allSettled(
    PRECACHE_URLS.map((url) => cache.add(url))
  );
  try {
    await cache.add(FONT_STYLESHEET);
  } catch {
    // Fonts are optional for offline shell
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => precacheAll(cache))
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
  return (
    request.mode === 'navigate'
    || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

function isApiRequest(url) {
  return url.hostname === API_HOST;
}

function isSameOriginAppAsset(url, origin) {
  return url.origin === origin && !url.pathname.endsWith('/sw.js');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

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

  if (url.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(`${SW_BASE}index.html`, copy);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_VERSION);
          return (
            (await cache.match(`${SW_BASE}index.html`))
            || (await cache.match(SW_BASE))
            || (await cache.match(request))
          );
        })
    );
    return;
  }

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
