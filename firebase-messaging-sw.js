/* BLOCK7 — FCM background push service worker.
   index.html과 같은 위치(리포지토리 루트)에 두세요:
   underkut.github.io/block7/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE",
  authDomain: "block7-8f24e.firebaseapp.com",
  projectId: "block7-8f24e",
  storageBucket: "block7-8f24e.firebasestorage.app",
  messagingSenderId: "517626689480",
  appId: "1:517626689480:web:92ea52eeebc24277ef72fd"
});

const messaging = firebase.messaging();

// Background messages: show a system notification.
// 서버는 data 전용 메시지를 보낸다 (notification 필드가 있으면 FCM SDK가
// 자동 표시 + 여기서도 표시해서 배너가 2개 뜨기 때문). 표시는 여기서만.
messaging.onBackgroundMessage(payload => {
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'BLOCK7', {
    body: d.body || '',
    tag: d.tag || 'block7',   // same tag replaces the previous banner instead of stacking
    data: { url: d.url || './' }
  });
});

// Tapping the notification focuses the app (or opens it).
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow(event.notification.data?.url || './');
    })
  );
});
