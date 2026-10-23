// KAIROS — 오프라인에서도 열리게 하는 서비스워커. 늘 새것을 먼저 받고, 못 받으면 저장해 둔 것을 쓴다.
// + 잠금 화면 알림(T-6) 받기. ⚠️ 알림 누르기(notificationclick)는 importScripts 보다 **먼저** 등록한다 (공부 친구들 study/sw.js 와 같은 까닭).
const C = 'timer-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon-192.png'];
self.addEventListener('notificationclick', e => {
  e.notification.close(); e.stopImmediatePropagation();
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    for (const c of cs) { if (c.url.includes('/timer/')) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
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
// 알림(FCM): 앱이 닫혀 있거나 화면이 꺼져 있을 때 온 '끝났어요' 를 띄운다. 못 불러와도 위의 기능은 그대로 돈다.
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({apiKey:'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE', authDomain:'block7-8f24e.firebaseapp.com', projectId:'block7-8f24e', storageBucket:'block7-8f24e.firebasestorage.app', messagingSenderId:'517626689480', appId:'1:517626689480:web:92ea52eeebc24277ef72fd'});
  firebase.messaging();
} catch (err) {}
