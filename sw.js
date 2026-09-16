// Network first: cached files are an offline fallback, never the online source of truth.
const CACHE = 'nurlan-pwa-v4-network-first';
const PREFIX = 'nurlan-';
const CORE = ['./', './index.html', './styles.css', './script.js', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // A missing optional file or unavailable cache must not block the update.
    await Promise.allSettled(CORE.map(async path => {
      const response = await fetch(new Request(new URL(path, self.registration.scope), { cache: 'no-cache' }));
      if (response.ok) await (await caches.open(CACHE)).put(path, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
    )).catch(() => {});
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope) || req.headers.has('range')) return;

  event.respondWith((async () => {
    let response;
    try {
      // Revalidate the browser's HTTP cache as well as bypassing Cache Storage.
      response = await fetch(req, { cache: 'no-cache' });
    } catch {}
    if (response && response.status < 500) {
      if (response.ok && (req.mode === 'navigate' ||
          ['image', 'font', 'script', 'style', 'manifest'].includes(req.destination))) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copy)).catch(() => {}));
      }
      return response;
    }

    try {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate' &&
          [new URL('./', self.registration.scope).pathname,
           new URL('./index.html', self.registration.scope).pathname].includes(url.pathname)) {
        const home = await cache.match('./index.html');
        if (home) return home;
      }
    } catch {}
    return response || Response.error();
  })());
});

