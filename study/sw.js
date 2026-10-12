// 공부 친구들 — 오프라인에서도 열리게 하는 서비스워커 + 공부 시간 알림(S-4) 받기.
// ⚠️ 알림 누르기(notificationclick)는 importScripts 보다 **먼저** 등록한다 (용돈 친구들 wallet/sw.js 와 같은 까닭).
const C = 'study-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('notificationclick', e => {
  const d = (e.notification && e.notification.data) || {}, f = d.FCM_MSG || {};
  const fd = f.data || d;
  let url = fd.url || (f.fcmOptions && f.fcmOptions.link) || './';
  // 알림의 [시작] [미루기] 단추 (안드로이드). 아이폰은 단추 없이 알림 자체를 누른다 → 앱 안 알림 화면
  if (e.action === 'start' || e.action === 'snooze') url = url + (url.includes('?') ? '&' : '?') + 'act=' + e.action;
  e.notification.close(); e.stopImmediatePropagation();
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    for (const c of cs) { if (c.url.includes('/study/')) { c.postMessage({go: url}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k.startsWith('study-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  if (!u.pathname.includes('/study/') && u.origin === location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request)));
});
// 알림(FCM): 앱이 닫혀 있을 때 온 알림을 [시작] [미루기] 단추와 함께 띄운다. 못 불러와도 위의 기능은 그대로 돈다.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({apiKey:'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE', authDomain:'block7-8f24e.firebaseapp.com', projectId:'block7-8f24e', storageBucket:'block7-8f24e.firebasestorage.app', messagingSenderId:'517626689480', appId:'1:517626689480:web:92ea52eeebc24277ef72fd'});
  firebase.messaging();
} catch (err) {}
