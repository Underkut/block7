// 용돈 친구들 — 오프라인에서도 열리게 하는 작은 서비스워커 + 가족 알림(F-4) 받기.
// ⚠️ 알림 누르기(notificationclick)는 importScripts 보다 **먼저** 등록한다 (BLOCK7 firebase-messaging-sw.js 와 같은 까닭:
//    FCM 이 자기 처리기에서 다음 처리기를 막고, importScripts 가 네트워크 탓에 멈추면 뒤의 등록이 하나도 안 된다).
const C = 'wallet-v5';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('notificationclick', e => {
  const d = (e.notification && e.notification.data) || {}, f = d.FCM_MSG || {};
  const url = (f.data && f.data.url) || (f.fcmOptions && f.fcmOptions.link) || d.url || './';
  e.notification.close(); e.stopImmediatePropagation();
  e.waitUntil(self.clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => {
    for (const c of cs) { if (c.url.includes('/wallet/')) { c.postMessage({go:url}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;   // 목표 그림 링크·파이어베이스 등 남의 사이트 파일은 직접(저장 안 함)
  if (u.hostname === 'api.github.com') return;                           // 곡 목록 확인은 항상 직접(저장해 두지 않는다)
  if (/\.(mp3|m4a|aac|ogg|wav)$/i.test(u.pathname)) return;   // 소리 파일은 브라우저가 직접(구간 요청 때문)
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request)));
});
// 가족 알림(FCM): 앱이 닫혀 있을 때 온 알림을 화면에 띄운다. 못 불러와도 위의 기능은 그대로 돈다.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({apiKey:'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE', authDomain:'block7-8f24e.firebaseapp.com', projectId:'block7-8f24e', storageBucket:'block7-8f24e.firebasestorage.app', messagingSenderId:'517626689480', appId:'1:517626689480:web:92ea52eeebc24277ef72fd'});
  firebase.messaging();
} catch (err) {}
