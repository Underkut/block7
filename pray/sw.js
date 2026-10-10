// 기도노트 — 오프라인에서도 열리게 하는 작은 서비스워커 (범위 /pray/).
// ⚠️ 언제나 **네트워크 먼저**. 새 버전이 올라가면 다음 열기에 바로 받는다.
//    못 받을 때(비행기 모드 등)만 저장해 둔 것을 내준다.
// ⚠️ 범위가 /pray/ 라 sweeter.my 의 Sweeter(범위 /)와 섞이지 않는다.
const C = 'pray-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('pray-') && k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) || u.hostname === 'cdn.jsdelivr.net';
  if (u.origin !== location.origin && !font) return;            // 남의 사이트 파일은 직접
  if (u.origin === location.origin && !u.pathname.startsWith('/pray/')) return;   // Sweeter 파일은 건드리지 않는다
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); }
    return r;
  }).catch(() => caches.match(e.request)));
});
