// KAIROS — 오프라인에서도 열리게 하는 서비스워커. 늘 새것을 먼저 받고, 못 받으면 저장해 둔 것을 쓴다.
const C = 'timer-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k.startsWith('timer-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  if (!u.pathname.includes('/timer/') && u.origin === location.origin) return;
  const net = () => fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; });
  // 글꼴은 저장해 둔 것부터 꺼낸다 — 켤 때마다 네트워크를 기다리면 글자가 늦게 바뀌며 깜빡인다
  if (u.origin !== location.origin) { e.respondWith(caches.match(e.request).then(hit => hit || net())); return; }
  e.respondWith(net().catch(() => caches.match(e.request)));
});
