/**
 * Thuluth Meeting — Service Worker
 * App-shell offline strategy for TWA / PWABuilder compliance.
 */

'use strict';

const CACHE_VERSION = 'thuluth-meeting-v5';
const SW_BASE = new URL('.', self.location.href).href;

/** Core shell files — must open instantly when offline. */
const SHELL_ASSETS = [
  'index.html',
  'app.js',
  'manifest.json',
  'manifest.ar.json',
  'manifest.en.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';

const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

const API_HOST = 'api.aladhan.com';

function shellUrl(relativePath) {
  return new URL(relativePath, SW_BASE).href;
}

function isNavigationRequest(request) {
  return (
    request.mode === 'navigate'
    || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
  );
}

function isApiRequest(url) {
  return url.hostname === API_HOST;
}

function isSameOriginAsset(url) {
  return url.origin === self.location.origin && !url.pathname.endsWith('/sw.js');
}

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
}

/** Cache-first: serve from cache immediately; refresh in background when online. */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      putInCache(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || (await networkPromise) || Response.error();
}

/** Network-first for HTML navigations; fall back to cached app shell when offline. */
async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      putInCache(shellUrl('index.html'), response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(CACHE_VERSION);
    return (
      (await cache.match(shellUrl('index.html')))
      || (await cache.match(SW_BASE))
      || (await caches.match(request))
      || Response.error()
    );
  }
}

async function precacheShell(cache) {
  await Promise.allSettled(
    SHELL_ASSETS.map((asset) => cache.add(shellUrl(asset)))
  );

  // Optional runtime assets — shell still works if these fail during install.
  await Promise.allSettled([
    cache.add(FONT_STYLESHEET),
    cache.add(TAILWIND_CDN),
  ]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => precacheShell(cache))
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

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Prayer times API — always live; never cache stale timings.
  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Google Fonts CSS and WOFF2 files — cache-first for offline typography.
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Tailwind CDN — cache-first so layout survives offline after first visit.
  if (url.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML navigations — network-first with offline fallback to cached index.html.
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Same-origin app assets (app.js, manifest, icons) — cache-first.
  if (isSameOriginAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
