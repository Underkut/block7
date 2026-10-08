// 용돈장 — 오프라인에서도 열리게 하는 작은 서비스워커. 인터넷이 되면 항상 새 것을 받는다.
const C = 'wallet-v3';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.hostname === 'api.github.com') return;                           // 곡 목록 확인은 항상 직접(저장해 두지 않는다)
  if (/\.(mp3|m4a|aac|ogg|wav)$/i.test(u.pathname)) return;   // 소리 파일은 브라우저가 직접(구간 요청 때문)
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request)));
});
