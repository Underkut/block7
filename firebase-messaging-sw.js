// BLOCK7 푸시 알림 서비스워커
// 이 파일은 index.html 과 같은 위치(저장소 최상위)에 있어야 합니다.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE",
  authDomain: "block7-8f24e.firebaseapp.com",
  projectId: "block7-8f24e",
  messagingSenderId: "517626689480",
  appId: "1:517626689480:web:92ea52eeebc24277ef72fd"
});

// 새 서비스워커를 바로 쓰게 한다 (교체가 잘 안 먹는 문제 방지)
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

// 중요: onBackgroundMessage 안에서 showNotification() 을 부르면
// 브라우저가 자동으로 띄우는 알림과 겹쳐 "빈 알림"이 하나 더 생긴다.
// 그래서 여기서는 아무것도 띄우지 않는다.
firebase.messaging();

var APP_URL = 'https://underkut.github.io/block7/';

// 알림에 들어 있는 장절을 꺼낸다 (FCM 이 감싸는 모양이 상황마다 다름)
function pickRef(n) {
  var d = (n && n.data) || {};
  if (d.ref) return d.ref;
  if (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.ref) return d.FCM_MSG.data.ref;
  if (d.FCM_MSG && d.FCM_MSG.notification && d.FCM_MSG.notification.data)
    return d.FCM_MSG.notification.data.ref || '';
  return '';
}

// 앱이 꺼져 있다 열릴 때를 대비해 장절을 잠깐 남겨 둔다.
// 아이폰 PWA 는 알림에서 열 때 주소(?verse=)를 무시하는 경우가 많아서,
// 앱이 시작하며 이 기록을 읽어 전체화면을 띄운다.
function savePending(ref) {
  return caches.open('block7-msg').then(function (c) {
    return c.put('/__pending_verse',
      new Response(JSON.stringify({ ref: ref, ts: Date.now() }),
        { headers: { 'Content-Type': 'application/json' } }));
  }).catch(function () {});
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var ref = pickRef(event.notification);
  var url = ref ? (APP_URL + '?verse=' + encodeURIComponent(ref)) : APP_URL;

  event.waitUntil((function () {
    return savePending(ref).then(function () {
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (list) {
      // 이미 열려 있는 창이 있으면 그 창에 알려주고 앞으로 가져온다
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('/block7') !== -1) {
          try { c.postMessage({ type: 'block7-open-verse', ref: ref }); } catch (e) {}
          if (c.focus) return c.focus();
          return null;
        }
      }
      // 열린 창이 없으면 새로 연다
      return clients.openWindow(url);
    });
  })());
});
