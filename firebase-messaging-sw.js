// BLOCK7 푸시 알림 서비스워커  (v. 26-0828-7)
// 이 파일은 index.html 과 같은 위치(저장소 최상위)에 있어야 합니다.
//
// ⚠️ 개발본이 따로 없다. 개발본(index-dev.html)은 Firebase 가 꺼져 있어 푸시를 받을 수
//    없고, 같은 스코프(`/`)에 워커를 두 개 등록할 수도 없다 — 등록은 스크립트 주소가
//    아니라 **스코프**로 하나만 잡히므로, 개발용을 등록하면 **운영 워커가 대체된다.**
//    그래서 이 파일을 고치면 곧바로 운영이다. `tests/test_notif_sw.js` 로 먼저 검증할 것.
//
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
//
//  ② 클릭 처리에서 **저장을 기다린 뒤에** 다른 일을 하지 말 것. (v0803-9)
//     - iOS 는 페이지가 같은 IndexedDB 를 쥐고 있으면 워커 쪽 open 이 응답하지
//       않고 멈춘다. 그러면 waitUntil 이 안 끝나고 뒤에 매달린 "창에 알리기 ·
//       창 앞으로 · 진단 기록"이 하나도 실행되지 않는다.
//     - 저장은 시간 제한(withTimeout)을 걸어 **따로** 돌리고, 창에 알리는 일은
//       즉시 한다. 모든 저장소 호출에 시간 제한을 유지할 것.
//
//  ③ (v26-0828-4에서 더함) 알림 1건 = **intentId 하나**.
//     - 워커의 모든 단계와 앱의 모든 단계를 같은 번호로 이어 적는다.
//       그래야 "어느 단계에서 끊겼는지" 를 짐작이 아니라 기록으로 말할 수 있다.
//     - Date.now() 만으로는 중복을 가를 수 없다(같은 밀리초·시계 되돌림).
// ══════════════════════════════════════════════════════════════

var SW_VER = 'v. 26-0828-7';
var APP_URL = 'https://block7.my/';
var LOG_URL = '/__notif_log';

// 이 워커가 마지막으로 처리한 클릭 의도. 앱이 "준비됐다"고 알려 오면 다시 보낸다.
// ⚠️ 워커 메모리는 언제든 사라진다 — **주 통로는 IndexedDB 의 __pending_verse** 이고
//    이건 그것을 한 번 더 밀어 주는 보조일 뿐이다.
var liveIntent = null;

function newIntentId() {
  try { if (self.crypto && self.crypto.randomUUID) return self.crypto.randomUUID(); } catch (e) {}
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
function shortId(id) { id = String(id || ''); return id.length > 8 ? id.slice(-8) : id; }

// 알림에 들어 있는 장절을 꺼낸다 (FCM 이 감싸는 모양이 상황마다 다름)
function pickRef(n) {
  var d = (n && n.data) || {};
  if (d.ref) return d.ref;
  if (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.ref) return d.FCM_MSG.data.ref;
  if (d.FCM_MSG && d.FCM_MSG.notification && d.FCM_MSG.notification.data)
    return d.FCM_MSG.notification.data.ref || '';
  return '';
}
// 앱이 미리 심어 둔 고유번호가 있으면 그것을 쓴다 (클릭 경로 테스트가 이 길을 쓴다)
function pickIntentId(n) {
  var d = (n && n.data) || {};
  if (d.intentId) return d.intentId;
  if (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.intentId) return d.FCM_MSG.data.intentId;
  return '';
}

// ── 시간 제한 ──
// ⚠️ 예전 withTimeout 은 성공·오류·시간초과를 전부 "문자열이거나 아니거나" 로만
//    구분했다. 그래서 클릭 처리기가 Promise.all 의 **배열**을 받고
//    `typeof r === 'string'` 이 거짓이라는 이유로 시간초과를 '기록 저장 완료' 라고
//    적었다. 진단 기록이 거짓말을 하면 고칠 수가 없다 → 결과의 정체를 함께 돌려준다.
function withOutcome(p, ms, label) {
  var t0 = Date.now();
  function stamp(o) { o.label = label; o.ms = Date.now() - t0; return o; }
  return Promise.race([
    Promise.resolve(p).then(
      function (v) { return stamp({ how: 'ok', value: v }); },
      function (e) { return stamp({ how: 'error', err: (e && e.message) || String(e) }); }),
    new Promise(function (res) { setTimeout(function () { res(stamp({ how: 'timeout' })); }, ms); })
  ]);
}
function outcomeText(o) {
  if (!o || !o.how) return '알수없음';
  if (o.how === 'ok') return '성공(' + o.ms + 'ms)';
  if (o.how === 'timeout') return '시간초과(' + o.ms + 'ms)';
  return '오류:' + (o.err || '?') + '(' + o.ms + 'ms)';
}
function withTimeout(p, ms, label) {
  return withOutcome(p, ms, label).then(function (o) {
    return o.how === 'ok' ? o.value : (o.how + ':' + label);
  });
}

// ── IndexedDB ──
// ⚠️ 연결은 하나만 열어 두고 다시 쓴다. iOS 에서 멈추는 자리는 언제나 open 이라
//    (페이지와 워커가 같은 DB 를 붙들면 한쪽 open 이 응답하지 않는다)
//    open 횟수를 줄이는 쪽이 안전하다. 끊기면 보관을 버려 다음에 새로 연다.
var idbConn = null;
function idbForget() { idbConn = null; }
function idbOpen() {
  if (idbConn) return idbConn;
  idbConn = new Promise(function (res, rej) {
    var r;
    try { r = indexedDB.open('block7', 1); } catch (e) { rej(e); return; }
    r.onupgradeneeded = function () {
      if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv');
    };
    r.onsuccess = function () {
      var db = r.result;
      try {
        db.onversionchange = function () { try { db.close(); } catch (e) {} idbForget(); };
        db.onclose = function () { idbForget(); };
      } catch (e) {}
      res(db);
    };
    r.onerror = function () { idbForget(); rej(r.error); };
  });
  idbConn.catch(function () { idbForget(); });
  return idbConn;
}
function idbRaw(mode, fn) {
  return idbOpen().then(function (db) {
    return new Promise(function (res, rej) {
      var tx;
      try { tx = db.transaction('kv', mode); } catch (e) { idbForget(); rej(e); return; }
      tx.onabort = function () { idbForget(); rej(tx.error || new Error('abort')); };
      fn(tx.objectStore('kv'), res, rej, tx);
    });
  });
}
function idbSet(k, v) {
  return idbRaw('readwrite', function (st, res, rej, tx) {
    st.put(v, k);
    tx.oncomplete = function () { res(true); };
    tx.onerror = function () { rej(tx.error); };
  });
}
function idbGet(k) {
  return idbRaw('readonly', function (st, res, rej) {
    var q = st.get(k);
    q.onsuccess = function () { res(q.result); };
    q.onerror = function () { rej(q.error); };
  });
}
function idbDel(k) {
  return idbRaw('readwrite', function (st, res, rej, tx) {
    st.delete(k);
    tx.oncomplete = function () { res(true); };
    tx.onerror = function () { rej(tx.error); };
  });
}

// ── 전달용 기록(pending) ──
// 앱이 꺼져 있다 열릴 때를 대비해 장절을 남겨 둔다. 아이폰 PWA 는 알림에서 열 때
// 주소(?verse=)를 무시하는 경우가 많아서, 앱이 시작하며 이 기록을 읽어 띄운다.
// 이 기록은 **앱이 실제로 전체화면을 띄운 뒤에** 앱이 지운다.
// ⚠️ IndexedDB 가 주 저장소, 캐시는 구버전 호환용 보조다 (아이폰 홈화면 앱에서는
//    캐시에 쓴 것이 남지 않는다 — v26-0803-8).
function makeIntent(ref, intentId) {
  var now = Date.now();
  return {
    intentId: intentId || newIntentId(),
    ref: ref || '',
    createdAt: now,
    ts: now,                 // 옛 앱이 읽는 자리 (토큰) — 지우지 말 것
    source: 'notificationclick',
    swVersion: SW_VER,
    stage: 'clicked',
    retryCount: 0,
    expiresAt: now + 600000
  };
}
// 두 저장소에 **각각** 시간 제한을 걸고, 결과를 각각 돌려준다.
function savePending(rec) {
  var a = withOutcome(idbSet('__pending_verse', rec), 1500, 'idb');
  var b = withOutcome(caches.open('block7-msg').then(function (c) {
    return c.put('/__pending_verse',
      new Response(JSON.stringify(rec), { headers: { 'Content-Type': 'application/json' } }));
  }), 1500, 'cache');
  return Promise.all([a, b]).then(function (r) { return { idb: r[0], cache: r[1] }; });
}
function clearPending() {
  return Promise.all([
    withOutcome(idbDel('__pending_verse'), 1500, 'idbDel'),
    withOutcome(caches.open('block7-msg').then(function (c) {
      return c.delete('/__pending_verse');
    }), 1500, 'cacheDel')
  ]);
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
  withTimeout(idbGet('__notif_log'), 1500, 'idbGet').then(function (list) {
    if (!Array.isArray(list)) list = [];
    list.push(entry);
    if (list.length > 80) list = list.slice(list.length - 80);
    return withTimeout(idbSet('__notif_log', list), 1500, 'idbSet');
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

// 한 창에 클릭 의도를 보낸다
function sendIntentTo(client, intent) {
  try {
    client.postMessage({
      type: 'block7-open-verse',
      ref: intent.ref,
      ts: intent.ts,                 // 옛 앱이 토큰으로 쓰는 자리
      intentId: intent.intentId,
      createdAt: intent.createdAt,
      swVersion: SW_VER
    });
    return true;
  } catch (e) { return false; }
}

// ── 알림 탭 처리 (importScripts 보다 먼저 등록) ──
self.addEventListener('notificationclick', function (event) {
  event.stopImmediatePropagation();   // FCM 의 클릭 처리기가 겹치지 않게
  event.notification.close();

  var ref = pickRef(event.notification);
  var intent = makeIntent(ref, pickIntentId(event.notification));
  liveIntent = intent;
  var tag = '#' + shortId(intent.intentId) + ' ';
  var url = ref
    ? (APP_URL + '?verse=' + encodeURIComponent(ref) + '&vt=' + intent.ts + '&vi=' + encodeURIComponent(intent.intentId))
    : APP_URL;
  var notes = [];   // 진단 기록은 모아 두었다가 맨 마지막에 한 번에 남긴다
  notes.push('notificationclick 시작');
  notes.push(ref ? ('ref 추출 성공: ' + ref) : 'ref 추출 실패(장절 없음)');

  // ⚠️ 저장을 먼저 "기다리지" 않는다 (v26-0803-9에서 순서 변경).
  //    저장이 한 번 멈추면(iOS IndexedDB 멈춤) 그 뒤가 통째로 실행되지 않아
  //    "알림을 눌렀는데 아무 일도 없고 진단 기록조차 안 남던" 상태가 됐다.
  //    이제 저장은 시간 제한을 걸어 **따로** 돌리고, 창에 알리는 일은 즉시 한다.
  var saved = savePending(intent).then(function (r) {
    notes.push('IDB 저장 ' + outcomeText(r.idb));
    notes.push('cache 저장 ' + outcomeText(r.cache));
  }, function (e) {
    notes.push('저장 경로 자체가 터짐: ' + ((e && e.message) || e));
  });

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      notes.push('열린 client ' + list.length + '개' + (list.length ? ': ' + describeClients(list) : ''));
      try {
        if (self.BroadcastChannel) new BroadcastChannel('block7').postMessage({
          type: 'block7-open-verse', ref: intent.ref, ts: intent.ts,
          intentId: intent.intentId, createdAt: intent.createdAt, swVersion: SW_VER
        });
      } catch (e) {}
      var sent = 0;
      for (var i = 0; i < list.length; i++) if (sendIntentTo(list[i], intent)) sent++;
      notes.push('기존 client 메시지 전송 ' + sent + '/' + list.length);

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
          sendIntentTo(fc || target, intent);
          notes.push('focus 성공 + 재전달');
          // ⚠️ 여기서 cl.navigate(?verse=) 를 부르지 말 것 (v0803-6에서 제거).
          //    페이지가 통째로 새로고침돼서 ① 알림 전체화면을 닫았을 때 보던
          //    화면으로 돌아가는 기능이 무력화되고 ② 매번 앱이 다시 뜬다.
          //    메시지가 유실돼도 앱이 전달용 기록을 1.5초마다 확인한다.
        }).catch(function (e) {
          notes.push('focus 실패: ' + ((e && e.message) || e));
          return openAndDeliver(url, intent, notes);
        });
      }
      return openAndDeliver(url, intent, notes);
    })
    // ④ 저장 결과까지 합쳐 마지막에 진단 기록 (저장이 늦어도 최대 1.5초)
    .then(function () { return saved; })
    .then(function () { return swLog(tag + notes.join(' | ')); })
    .catch(function (e) { return swLog(tag + '알림 처리 중 오류: ' + ((e && e.message) || e)); })
  );
});

// ⚠️ 새로 연 창에는 **반드시 다시 보내야 한다** (v26-0828-4).
//    예전에는 openWindow 만 부르고 끝냈다. 아이폰 홈화면 앱은 주소(?verse=)를
//    무시하는 일이 많고, 그때 IndexedDB 저장까지 시간초과되면 앱에 장절을
//    건네줄 통로가 **하나도 남지 않는다** → 앱만 뜨고 말씀은 안 나온다.
//    openWindow 가 돌려주는 창에 곧바로 보내고, 앱이 아직 리스너를 못 붙였을 수
//    있으니 짧게 두 번 더 보낸다. (앱 쪽 handshake 가 나머지를 덮는다)
function openAndDeliver(url, intent, notes) {
  return clients.openWindow(url).then(function (client) {
    notes.push('openWindow 성공' + (client ? '' : '(창 핸들 없음)'));
    if (!client) return;
    sendIntentTo(client, intent);
    return new Promise(function (res) {
      var n = 0;
      var iv = setInterval(function () {
        n++;
        sendIntentTo(client, intent);
        if (n >= 2) { clearInterval(iv); res(); }
      }, 400);
    });
  }).catch(function (e) {
    notes.push('openWindow 실패: ' + ((e && e.message) || e));
  });
}

// ── 앱과의 handshake ──
// 앱의 조기 브리지가 준비되면 block7-app-ready 를 보낸다. 그때 아직 살아 있는
// 클릭 의도가 있으면 그 창에 다시 건넨다. 앱이 전체화면을 확인하면 ack 를 보내고,
// 그때 워커가 들고 있던 것을 지운다.
self.addEventListener('message', function (event) {
  var d = (event && event.data) || {};
  if (d.type === 'block7-sw-ping') {
    try { event.source && event.source.postMessage({ type: 'block7-sw-pong', swVersion: SW_VER }); } catch (e) {}
    return;
  }
  if (d.type === 'block7-app-ready') {
    if (!liveIntent) return;
    if (Date.now() > (liveIntent.expiresAt || 0)) { liveIntent = null; return; }
    var ok = event.source ? sendIntentTo(event.source, liveIntent) : false;
    event.waitUntil(swLog('#' + shortId(liveIntent.intentId) +
      ' 앱 ready handshake — 의도 재전달 ' + (ok ? '성공' : '실패')));
    return;
  }
  if (d.type === 'block7-intent-ack') {
    liveIntent = null;
    event.waitUntil(clearPending().then(function () {}).catch(function () {}));
    return;
  }
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
//    push 를 받고도 알림을 안 띄우면 크롬이 "이 사이트는 백그라운드에서
//    업데이트되었습니다" 라는 가짜 알림을 대신 띄운다.
// stopImmediatePropagation 으로 FCM 처리기를 막아 알림이 두 번 뜨지 않게 한다.
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
  // 알림을 띄우는 이 자리에서 고유번호를 미리 붙여 둔다 — 그래야 '도착'과 '클릭'을
  // 같은 번호로 이어 볼 수 있다.
  var iid = d.intentId || newIntentId();

  e.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: 'icon.png',
      badge: 'icon.png',
      tag: d.tag || ('block7-' + (ref || 'verse')),
      renotify: true,
      data: { ref: ref, type: d.type || '', intentId: iid }
    }).then(function () {
      return swLog('#' + shortId(iid) + ' push 도착 → 알림 표시: ' + (ref || '(장절 없음)') + ' | ' + txt);
    }).catch(function (err) {
      return swLog('#' + shortId(iid) + ' push 도착했으나 알림 표시 실패: ' + ((err && err.message) || err) + ' | ' + txt);
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
