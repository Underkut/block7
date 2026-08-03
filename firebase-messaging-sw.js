// BLOCK7 푸시 알림 서비스워커  (v. 26-0803-8)
// 이 파일은 index.html 과 같은 위치(저장소 최상위)에 있어야 합니다.

// ══════════════════════════════════════════════════════════════
// ⚠️ 이 파일은 "순서"가 곧 기능이다. 아래 두 가지를 바꾸지 말 것.
//
//  ① notificationclick 등록은 importScripts 보다 반드시 "먼저".
//     - FCM 은 자기 클릭 처리기에서 stopImmediatePropagation() 을 불러
//       뒤에 등록된 처리기를 전부 막는다. 우리가 먼저 잡아야 한다.
//     - 게다가 importScripts 는 gstatic 에서 파일을 받아온다. 네트워크가
//       나쁘거나 캐시가 비워진 순간 이 줄에서 스크립트 실행이 통째로
//       멈춘다. 그러면 뒤에 있던 등록이 하나도 안 되고, 알림을 눌러도
//       앱만 앞으로 나오고 아무 일도 안 일어난다.
//       (아이폰·아이패드에서 "한동안 되다가 어느 순간부터 안 되는" 증상)
//     - 위쪽 var 값들과 함수 선언은 이 시점에 이미 준비돼 있으므로
//       Firebase 가 못 올라와도 클릭 처리는 정상 동작한다.
//
//  ② 클릭 처리 안에서는 "전달용 기록 저장"이 제일 먼저, 진단 로그는 맨 뒤.
//     - iOS 는 서비스워커에 짧은 실행 시간만 준다. 예전엔 로그를 먼저
//       남기느라 캐시를 네 번 오가고 나서야 기록을 저장했는데, 그 사이
//       워커가 끊기면 정작 필요한 기록이 없어 전체화면이 안 떴다.
// ══════════════════════════════════════════════════════════════

var SW_VER = 'v. 26-0803-8';
var APP_URL = 'https://block7.my/';
var LOG_URL = '/__notif_log';

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
// 앱이 시작하며(또는 앞으로 나오며) 이 기록을 읽어 전체화면을 띄운다.
// 이 기록은 앱이 실제로 전체화면을 띄운 뒤에 앱이 지운다.
// ts 는 "이 알림 1건"을 가리키는 토큰이기도 하다. 앱은 이 값으로 중복을 막으므로
// 같은 장절이 다시 와도(= 새 ts) 반드시 다시 열린다.
// ── 저장소: IndexedDB 우선, 캐시는 보조 ──
// ⚠️ 아이폰 홈화면 앱에서는 캐시 저장소(caches)에 쓴 것이 남지 않는다.
//    전달용 기록(__pending_verse)이 바로 그 캐시에 있었다 — 인계문서가
//    "아이폰은 이 경로가 핵심"이라 적어 둔 그 기록이 정작 아이폰에서
//    불안정했다는 뜻이다. IndexedDB 는 아이폰 PWA 에서도 남으므로
//    그쪽을 주 저장소로 쓰고, 캐시는 구버전 호환용으로만 함께 쓴다. (v26-0803-8)
function idbOpen() {
  return new Promise(function (res, rej) {
    var r = indexedDB.open('block7', 1);
    r.onupgradeneeded = function () {
      if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv');
    };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function idbSet(k, v) {
  return idbOpen().then(function (db) {
    return new Promise(function (res, rej) {
      var tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(v, k);
      tx.oncomplete = function () { res(); };
      tx.onerror = function () { rej(tx.error); };
    });
  });
}
function idbGet(k) {
  return idbOpen().then(function (db) {
    return new Promise(function (res, rej) {
      var tx = db.transaction('kv', 'readonly');
      var q = tx.objectStore('kv').get(k);
      q.onsuccess = function () { res(q.result); };
      q.onerror = function () { rej(q.error); };
    });
  });
}

function savePending(ref, ts) {
  var rec = { ref: ref, ts: ts };
  // IndexedDB 가 주 — 실패해도 캐시 쪽은 계속 시도한다
  var a = idbSet('__pending_verse', rec).catch(function () {});
  var b = caches.open('block7-msg').then(function (c) {
    return c.put('/__pending_verse',
      new Response(JSON.stringify(rec),
        { headers: { 'Content-Type': 'application/json' } }));
  }).catch(function () {});
  return Promise.all([a, b]);
}

// ── 알림 진단 기록 ── (앱: 말씀 설정 → 알림 탭 → 알림 진단 기록)
// 어디까지나 보조 수단이다. 절대 알림 처리보다 먼저 실행하지 말 것.
function swLog(msg) {
  // ⚠️ 아이폰 홈화면 앱에서는 캐시에 쓴 기록이 남지 않는다. 그래서 열려 있는
  //    창에도 같은 줄을 보내 앱이 localStorage 에 남기게 한다. (v26-0803-7)
  var entry = { t: Date.now(), s: 'SW', m: String(msg) };
  try {
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        try { list[i].postMessage({ type: 'block7-swlog', entry: entry }); } catch (e) {}
      }
    }).catch(function () {});
  } catch (e) {}
  // 알림이 도착하는 순간엔 열려 있는 창이 없어 위 전달이 아무데도 못 간다.
  // 아이폰에서 'push 도착' 줄이 통째로 사라지던 이유다 → IndexedDB 에도 남긴다.
  idbGet('__notif_log').then(function (list) {
    if (!Array.isArray(list)) list = [];
    list.push(entry);
    if (list.length > 80) list = list.slice(list.length - 80);
    return idbSet('__notif_log', list);
  }).catch(function () {});
  return caches.open('block7-msg').then(function (c) {
    return c.match(LOG_URL).then(function (r) {
      if (!r) return [];
      return r.json().catch(function () { return []; });
    }).then(function (list) {
      if (!Array.isArray(list)) list = [];
      list.push(entry);   // 창에 보낸 것과 "같은 줄" — 시각이 달라지면 합칠 때 중복된다
      if (list.length > 60) list = list.slice(list.length - 60);
      return c.put(LOG_URL, new Response(JSON.stringify(list),
        { headers: { 'Content-Type': 'application/json' } }));
    });
  }).catch(function () {});
}

// 창 목록을 짧게 적어 둔다 (어느 창이 살아 있었는지 확인용)
function describeClients(list) {
  return list.map(function (c) {
    return (c.url || '?').replace(APP_URL, '~/') +
      '(' + (c.visibilityState || '?') + (c.focused ? '·focus' : '') + ')';
  }).join(' ');
}

// ── 알림 탭 처리 (importScripts 보다 먼저 등록) ──
self.addEventListener('notificationclick', function (event) {
  event.stopImmediatePropagation();   // FCM 의 클릭 처리기가 겹치지 않게
  event.notification.close();

  var ref = pickRef(event.notification);
  var tok = Date.now();
  var url = ref ? (APP_URL + '?verse=' + encodeURIComponent(ref) + '&vt=' + tok) : APP_URL;
  var notes = [];   // 진단 기록은 모아 두었다가 맨 마지막에 한 번에 남긴다

  event.waitUntil(
    // ① 가장 중요한 것부터: 전달용 기록 저장
    savePending(ref, tok).then(function () {
      notes.push('알림 탭됨: ' + (ref || '(장절 없음)') + ' · 기록 저장 완료');
    }).catch(function (e) {
      notes.push('알림 탭됨: ' + (ref || '(장절 없음)') + ' · 기록 저장 실패: ' + (e && e.message || e));
    })
    // ② 열려 있는 창에 알리기
    .then(function () {
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (list) {
      notes.push('열린 창 ' + list.length + '개' + (list.length ? ': ' + describeClients(list) : ''));
      var msg = { type: 'block7-open-verse', ref: ref, ts: tok };
      try {
        if (self.BroadcastChannel) new BroadcastChannel('block7').postMessage(msg);
      } catch (e) {}
      for (var i = 0; i < list.length; i++) {
        try { list[i].postMessage(msg); } catch (e) {}
      }

      // ③ 창을 앞으로 가져오기 — /block7 또는 block7.my 창 우선
      var target = null;
      for (var j = 0; j < list.length; j++) {
        var u = list[j].url || '';
        if ((u.indexOf('block7.my') !== -1 || u.indexOf('/block7') !== -1) && list[j].focus) {
          target = list[j]; break;
        }
      }
      if (!target && list.length && list[0].focus) target = list[0];

      if (target) {
        return target.focus().then(function (fc) {
          // 잠들어 있던 앱은 focus 이전의 메시지를 놓칠 수 있어 깨운 뒤 한 번 더
          var cl = fc || target;
          try { cl.postMessage(msg); } catch (e) {}
          notes.push('기존 창을 앞으로 가져옴 + 재전달');
          // ⚠️ 여기서 cl.navigate(?verse=) 를 부르지 말 것 (v0803-6에서 제거).
          //    페이지가 통째로 새로고침돼서 ① 알림 전체화면을 닫았을 때 보던
          //    화면으로 돌아가는 기능이 무력화되고 ② 매번 앱이 다시 뜬다.
          //    메시지가 유실돼도 앱이 전달용 기록을 1.5초마다 확인하고,
          //    열릴 때까지 재시도하므로 이 통로는 필요 없다.
        }).catch(function (e) {
          notes.push('창 포커스 실패: ' + (e && e.message || e));
          return clients.openWindow(url);
        });
      }
      return clients.openWindow(url).then(function () {
        notes.push('열린 창이 없어 새 창을 엶');
      }).catch(function (e) {
        notes.push('새 창 열기 실패: ' + (e && e.message || e));
      });
    })
    // ④ 다 끝난 뒤에야 진단 기록
    .then(function () { return swLog(notes.join(' | ')); })
    .catch(function (e) { return swLog('알림 처리 중 오류: ' + (e && e.message || e)); })
  );
});

// 새 서비스워커를 바로 쓰게 한다 (교체가 잘 안 먹는 문제 방지)
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(Promise.all([
    self.clients.claim(),
    swLog('서비스워커 활성화 ' + SW_VER)   // 이 줄이 보이면 새 SW가 실제로 적용된 것
  ]));
});

// ── push 도착 → 알림 표시까지 우리가 직접 한다 ──
// ⚠️ 예전에는 기록만 남기고 표시는 FCM/브라우저에 맡겼다. 그런데 브라우저 규칙상
//    push 를 받고도 알림을 안 띄우면 크롬이 **"이 사이트는 백그라운드에서
//    업데이트되었습니다"** 라는 가짜 알림을 대신 띄운다. importScripts 가
//    gstatic 에서 막히면 FCM 처리기가 아예 등록되지 않으므로 그 상황이 실제로
//    일어났다(HB가 겪은 8-1C). 그래서 우리가 먼저 잡아 직접 띄운다.
// stopImmediatePropagation 으로 FCM 처리기를 막아 알림이 두 번 뜨지 않게 한다.
// 이 처리기는 importScripts 앞에 등록돼 있어 Firebase 가 못 올라와도 동작한다.
self.addEventListener('push', function (e) {
  e.stopImmediatePropagation();
  var payload = null, txt = '';
  try { payload = e.data ? e.data.json() : null; } catch (err) {
    try { txt = e.data ? e.data.text() : ''; } catch (e2) {}
  }
  if (!txt) { try { txt = JSON.stringify(payload || {}); } catch (e3) { txt = '(파싱 실패)'; } }
  if (txt.length > 100) txt = txt.slice(0, 100) + '…';

  var p = payload || {};
  var n = p.notification || (p.FCM_MSG && p.FCM_MSG.notification) || {};
  var d = p.data || (p.FCM_MSG && p.FCM_MSG.data) || {};
  var title = n.title || d.title || 'BLOCK7';
  var body = n.body || d.body || '';
  var ref = d.ref || '';

  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: 'icon.png',
      badge: 'icon.png',
      tag: d.tag || ('block7-' + (ref || 'verse')),
      renotify: true,
      data: { ref: ref, type: d.type || '' }
    }).then(function () {
      return swLog('push 도착 → 알림 표시: ' + (ref || '(장절 없음)') + ' | ' + txt);
    }).catch(function (err) {
      return swLog('push 도착했으나 알림 표시 실패: ' + (err && err.message || err) + ' | ' + txt);
    })
  );
});

// ── 여기서부터 Firebase (위 등록이 끝난 뒤에 불러온다) ──
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE",
  authDomain: "block7-8f24e.firebaseapp.com",
  projectId: "block7-8f24e",
  messagingSenderId: "517626689480",
  appId: "1:517626689480:web:92ea52eeebc24277ef72fd"
});

// onBackgroundMessage 안에서 showNotification() 을 부르면 브라우저가
// 자동으로 띄우는 알림과 겹쳐 "빈 알림"이 하나 더 생긴다. 그래서 아무것도
// 띄우지 않고, 표시는 브라우저에, 클릭 처리는 위 처리기에 맡긴다.
firebase.messaging();
