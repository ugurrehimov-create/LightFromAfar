const CACHE_NAME = 'lightfromafar-v34.13-map-layer-repair-cache';
// v34.13 map repair: restore Aladin's short HiPS IDs and identifier-based layer API.
const APP_SHELL = ['./', './index.html', './astralog.html', './astralog.css', './auth.html', './auth.css', './auth-page.js?v=34.13-cds-hips-id-repair', './auth-config.js', './supabase-client.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME && /^(lightfromafar-|light-from-afar-)/.test(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isDocumentOrStyle = request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.css');
  if (isDocumentOrStyle) {
    event.respondWith(fetch(request).then(response => {
      if (!response || !response.ok) return response;
      return caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone())).then(() => response).catch(() => response);
    }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html'))));
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  }).catch(() => caches.match('./index.html'))));
});
