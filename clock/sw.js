// CLOCK — 오프라인에서도 열리게 하는 서비스워커. 늘 새것을 먼저 받고, 못 받으면 저장해 둔 것을 쓴다.
const C = 'clock-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png', 'bebas.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k.startsWith('clock-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !u.pathname.includes('/clock/')) return;
  const net = () => fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; });
  e.respondWith(net().catch(() => caches.match(e.request, { ignoreSearch: true })));
});
