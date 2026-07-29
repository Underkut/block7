// BLOCK7 푸시 알림 서비스워커
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE",
  authDomain: "block7-8f24e.firebaseapp.com",
  projectId: "block7-8f24e",
  messagingSenderId: "517626689480",
  appId: "1:517626689480:web:92ea52eeebc24277ef72fd"
});

// 중요:
// onBackgroundMessage 안에서 showNotification() 을 부르면
// 브라우저가 자동으로 띄우는 알림과 겹쳐 "빈 알림"이 하나 더 생긴다.
// 그래서 여기서는 아무것도 띄우지 않는다.
firebase.messaging();

// 알림을 눌렀을 때 — 그 말씀의 전체화면으로 들어간다
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var base = 'https://underkut.github.io/block7/';
  var data = event.notification.data || {};
  // FCM 은 data 를 여기에 넣어 주기도 한다
  var fcm = data.FCM_MSG && data.FCM_MSG.data ? data.FCM_MSG.data : data;
  var ref = fcm.ref || '';
  var url = ref ? (base + '?verse=' + encodeURIComponent(ref)) : base;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      // 이미 열려 있는 창이 있으면 그 창을 쓴다
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('/block7') !== -1 && 'navigate' in c) {
          return c.navigate(url).then(function (w) { return w && w.focus(); });
        }
      }
      return clients.openWindow(url);
    })
  );
});
