// BLOCK7 푸시 알림 서비스워커  (v. 26-0730-4)
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

var SW_VER = 'v. 26-0730-4';
var APP_URL = 'https://block7.my/';
var LOG_URL = '/__notif_log';

// ── 알림 진단 기록 ──
// 서비스워커와 앱이 같은 캐시(block7-msg)에 시간순으로 짧은 기록을 남긴다.
// 앱의 말씀 설정 → 알림 탭 → "알림 진단 기록"에서 볼 수 있다.
function swLog(msg) {
  return caches.open('block7-msg').then(function (c) {
    return c.match(LOG_URL).then(function (r) {
      if (!r) return [];
      return r.json().catch(function () { return []; });
    }).then(function (list) {
      if (!Array.isArray(list)) list = [];
      list.push({ t: Date.now(), s: 'SW', m: String(msg) });
      if (list.length > 60) list = list.slice(list.length - 60);
      return c.put(LOG_URL, new Response(JSON.stringify(list),
        { headers: { 'Content-Type': 'application/json' } }));
    });
  }).catch(function () {});
}

// 새 서비스워커를 바로 쓰게 한다 (교체가 잘 안 먹는 문제 방지)
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    swLog('서비스워커 활성화 ' + SW_VER)   // 이 줄이 보이면 새 SW가 실제로 적용된 것
  ]));
});

// push 도착 자체를 기록만 한다 (알림 표시는 브라우저 자동 표시에 맡김)
self.addEventListener('push', function (e) {
  var txt = '';
  try { txt = e.data ? e.data.text() : ''; } catch (err) {}
  if (txt.length > 100) txt = txt.slice(0, 100) + '…';
  e.waitUntil(swLog('push 도착: ' + (txt || '(내용 없음)')));
});

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
// 앱이 시작하며(또는 1.5초 폴링으로) 이 기록을 읽어 전체화면을 띄운다.
function savePending(ref) {
  return caches.open('block7-msg').then(function (c) {
    return c.put('/__pending_verse',
      new Response(JSON.stringify({ ref: ref, ts: Date.now() }),
        { headers: { 'Content-Type': 'application/json' } }));
  });
}

// ⚠️⚠️ 등록 순서가 핵심 ⚠️⚠️
// 이 notificationclick 은 반드시 아래의 firebase.messaging() 호출보다
// "먼저" 등록해야 한다. FCM 은 자기 클릭 처리기 안에서
// stopImmediatePropagation() 을 불러 뒤에 등록된 처리기를 전부 차단한다.
// (v0730-1 까지 "알림 탭됨" 기록이 한 번도 안 남던 원인이 바로 이것.
//  앱이 닫혀 있을 땐 FCM 이 click_action 주소로 새 창을 열어 우연히 됐고,
//  앱이 열려 있을 땐 FCM 이 주소 이동 없이 포커스만 해서 아무 일도 없었다)
// 우리가 먼저 받고, 우리도 stopImmediatePropagation() 으로 FCM 쪽을 막아
// 열기 동작을 한 군데(여기)서만 결정한다.
self.addEventListener('notificationclick', function (event) {
  event.stopImmediatePropagation();   // FCM 의 클릭 처리기가 겹치지 않게
  event.notification.close();

  var ref = pickRef(event.notification);
  var url = ref ? (APP_URL + '?verse=' + encodeURIComponent(ref)) : APP_URL;

  event.waitUntil((function () {
    return swLog('알림 탭됨: ' + (ref || '(장절 없음)')).then(function () {
      return savePending(ref).then(function () {
        return swLog('전달용 기록 저장 완료');
      }).catch(function (e) {
        return swLog('전달용 기록 저장 실패: ' + (e && e.message || e));
      });
    }).then(function () {
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (list) {
      var desc = list.map(function (c) {
        return (c.url || '?').replace(APP_URL, '~/') +
          '(' + (c.visibilityState || '?') + (c.focused ? '·focus' : '') + ')';
      }).join(' ');
      return swLog('열린 창 ' + list.length + '개' + (desc ? ': ' + desc : ''))
        .then(function () { return list; });
    }).then(function (list) {
      // 브로드캐스트 + 창별 메시지 (앱이 이미 열려 있는 경우)
      try {
        if (self.BroadcastChannel) {
          new BroadcastChannel('block7').postMessage({ type: 'block7-open-verse', ref: ref });
        }
      } catch (e) {}
      for (var i = 0; i < list.length; i++) {
        try { list[i].postMessage({ type: 'block7-open-verse', ref: ref }); } catch (e) {}
      }

      // 앞으로 가져올 창 고르기 — /block7 창 우선, 없으면 아무 창이나
      var target = null;
      for (var j = 0; j < list.length; j++) {
        if ((list[j].url || '').indexOf('/block7') !== -1 && list[j].focus) { target = list[j]; break; }
      }
      if (!target && list.length && list[0].focus) target = list[0];

      if (target) {
        return target.focus().then(function (fc) {
          // 잠들어 있던 앱은 focus 이전의 postMessage 를 놓칠 수 있어
          // 깨어난 "뒤에" 한 번 더 보낸다.
          var cl = fc || target;
          try { cl.postMessage({ type: 'block7-open-verse', ref: ref }); } catch (e) {}
          return swLog('기존 창을 앞으로 가져옴 + 재전달');
        }).catch(function (e) {
          return swLog('창 포커스 실패: ' + (e && e.message || e)).then(function () {
            return clients.openWindow(url);
          });
        });
      }
      return clients.openWindow(url).then(function () {
        return swLog('열린 창이 없어 새 창을 엶');
      }).catch(function (e) {
        return swLog('새 창 열기 실패: ' + (e && e.message || e));
      });
    });
  })());
});

// 중요 1: onBackgroundMessage 안에서 showNotification() 을 부르면
// 브라우저가 자동으로 띄우는 알림과 겹쳐 "빈 알림"이 하나 더 생긴다.
// 그래서 여기서는 아무것도 띄우지 않는다.
// 중요 2: 이 호출은 반드시 위의 notificationclick 등록보다 "뒤"에 있어야
// 한다 (위의 등록 순서 주석 참고).
firebase.messaging();
