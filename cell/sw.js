// 셀 inside 알림 워커 (L4 · 2026-11-07) — 범위 /cell/ (sweeter.my/cell/)
// ⚠️ 알림 누르기 처리를 importScripts 보다 **먼저** 등록한다 — FCM 이 제 처리기에서 뒤 처리기를 막고,
//    gstatic 을 못 받으면 그 줄에서 멈추기 때문이다 (BLOCK7 firebase-messaging-sw.js 와 같은 까닭).
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var d = (e.notification && e.notification.data) || {};
  var url = d.url || (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.url) || '/cell/?tab=comment';
  e.stopImmediatePropagation();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { var c = cs[i]; if (c.url.indexOf('/cell/') >= 0 && 'focus' in c) { try { c.navigate(url); } catch (_) { } return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({ apiKey: 'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE', authDomain: 'block7-8f24e.firebaseapp.com', projectId: 'block7-8f24e',
    storageBucket: 'block7-8f24e.firebasestorage.app', messagingSenderId: '517626689480', appId: '1:517626689480:web:92ea52eeebc24277ef72fd' });
  firebase.messaging();   // 알림(notification) 꼴 메시지는 이 줄만으로 화면에 뜬다
} catch (e) { }
