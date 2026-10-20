// Permite abrir la app sin conexión: usa la red si hay, y si no, la última copia guardada.
// data.json no pasa por aquí: siempre se pide fresco a GitHub.
const CACHE = 'cocina-v24';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './icon-192.png', './icon-512.png', './icon-32.png', './apple-touch-icon.png', './manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('data.json')) return;
  e.respondWith(
    // cache:'no-cache' evita que el navegador sirva una copia vieja tras subir cambios a GitHub
    fetch(e.request.url, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
