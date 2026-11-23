// 심방 녹음(plaudhub) — 늘 새것을 먼저 받고, 못 받으면 저장해 둔 것을 쓴다. 도우미 파일(helper.mjs · install.sh)은 저장하지 않는다.
const C = 'plaudhub-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k.startsWith('plaudhub-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !u.pathname.includes('/plaudhub/') || /\.(mjs|sh)$/.test(u.pathname)) return;
  const net = () => fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; });
  e.respondWith(net().catch(() => caches.match(e.request, { ignoreSearch: true })));
});
