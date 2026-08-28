// 서비스워커의 알림 클릭 처리 — "어느 단계에서 끊겼는가" 를 증명할 수 있는가
//
// ⚠️ 지금까지 tests/test_notif.js 는 **앱 쪽 엔진만** 검사했다. 그 테스트는
//    "클릭 의도가 이미 앱에 도착했다" 를 전제로 시작하므로, 정작 아이폰에서
//    끊기는 자리(notificationclick · openWindow 콜드 스타트 · 저장 시간초과)를
//    한 번도 지나가지 않았다. 이 파일이 그 구간을 맡는다.
//
// 검사 대상은 **대기본** firebase-messaging-sw-next.js 다 (운영 배포 전).
// importScripts 앞부분(우리 코드)만 떠서 가짜 워커 환경에서 돌린다.
const fs = require('fs');
const path = require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const SW_FILE = path.join(__dirname, '..', 'firebase-messaging-sw-next.js');
if (!fs.existsSync(SW_FILE)) {
  console.error('firebase-messaging-sw-next.js 를 찾지 못했어요.');
  process.exit(2);
}
const RAW = fs.readFileSync(SW_FILE, 'utf-8');
const cut = RAW.indexOf('// ── 여기서부터 Firebase');
if (cut < 0) { console.error('[로더] Firebase 시작 표시를 찾지 못했어요.'); process.exit(2); }
const CODE = RAW.slice(0, cut);

// ── 가짜 서비스워커 환경 ──────────────────────────────────────────
function makeEnv(opts) {
  opts = opts || {};
  const env = {
    handlers: {},
    logs: [],
    posted: [],        // {to, msg}
    store: {},         // IndexedDB 대역
    cache: {},         // caches 대역
    opened: [],        // openWindow 로 연 주소
    focused: 0
  };
  function client(name, extra) {
    const c = Object.assign({
      id: name, url: 'https://block7.my/', visibilityState: 'visible', focused: false,
      postMessage: m => env.posted.push({ to: name, msg: m }),
      focus: function () { env.focused++; return Promise.resolve(this); }
    }, extra || {});
    return c;
  }
  env.client = client;
  const clientList = opts.clients || [];

  const sandbox = {
    self: {
      addEventListener: (t, fn) => { (env.handlers[t] = env.handlers[t] || []).push(fn); },
      registration: { showNotification: () => Promise.resolve() },
      crypto: { randomUUID: () => 'uuid-' + (++env.uuidN || (env.uuidN = 1)) },
      BroadcastChannel: null
    },
    clients: {
      matchAll: () => Promise.resolve(clientList),
      openWindow: url => {
        env.opened.push(url);
        if (opts.openWindowFails) return Promise.reject(new Error('열 수 없음'));
        const c = client('new');
        env.newClient = c;
        return Promise.resolve(opts.openWindowNoHandle ? null : c);
      },
      claim: () => Promise.resolve()
    },
    caches: {
      open: () => {
        if (opts.cacheHangs) return new Promise(() => {});
        return Promise.resolve({
          put: (k, v) => { env.cache[k] = v; return Promise.resolve(); },
          match: k => Promise.resolve(env.cache[k] || null),
          delete: k => { delete env.cache[k]; return Promise.resolve(true); }
        });
      }
    },
    indexedDB: {
      open: () => {
        const req = {};
        if (opts.idbHangs) return req;                  // 영영 onsuccess 가 안 온다 (iOS 멈춤)
        setTimeout(() => {
          req.result = {
            objectStoreNames: { contains: () => true },
            transaction: () => {
              const tx = {};
              const st = {
                put: (v, k) => { env.store[k] = v; setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); },
                get: k => { const q = {}; setTimeout(() => { q.result = env.store[k]; q.onsuccess && q.onsuccess(); }, 0); return q; },
                delete: k => { delete env.store[k]; setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); }
              };
              tx.objectStore = () => st;
              return tx;
            },
            close: () => {}
          };
          req.onsuccess && req.onsuccess();
        }, 0);
        return req;
      }
    },
    Response: class { constructor(body) { this.body = body; } json() { return Promise.resolve(JSON.parse(this.body)); } },
    setTimeout, clearTimeout, setInterval, clearInterval,
    Promise, Date, JSON, Math, String, Array, Object, Error, console
  };
  sandbox.self.crypto = { randomUUID: () => 'uuid-' + Math.random().toString(36).slice(2, 8) };

  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(CODE, sandbox);
  env.sandbox = sandbox;
  env.fire = (type, ev) => {
    const list = env.handlers[type] || [];
    list.forEach(fn => fn(ev));
  };
  return env;
}

// notificationclick 이벤트 하나를 만든다
function clickEvent(data) {
  let waited = null;
  return {
    waited: () => waited,
    stopImmediatePropagation() {},
    notification: { data, close() {} },
    waitUntil(p) { waited = p; }
  };
}
const wait = ms => new Promise(r => setTimeout(r, ms));

// ═══ 1. 열린 창이 하나도 없다 (앱 완전 종료 상태에서 알림 클릭) ═══
(async () => {
console.log('시나리오 1 — 앱이 완전히 종료된 상태에서 알림 클릭');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '요한복음 1:18' });
  env.fire('notificationclick', ev);
  await ev.waited();
  sc.eq('새 창을 연다', env.opened.length, 1);
  sc.eq('주소에 장절이 실린다', /verse=/.test(env.opened[0]), true);
  sc.eq('주소에 고유번호(vi)도 실린다', /[?&]vi=/.test(env.opened[0]), true);
  const rec = env.store['__pending_verse'];
  sc.eq('전달용 기록이 남는다', !!(rec && rec.ref === '요한복음 1:18'), true);
  sc.eq('기록에 intentId 가 있다', typeof rec.intentId === 'string' && rec.intentId.length > 3, true);
  sc.eq('옛 앱이 읽는 ts 자리도 남긴다', typeof rec.ts, 'number');
}

// ═══ 2. openWindow 로 연 창에 **다시 보낸다** (이번 수정의 핵심) ═══
console.log('\n시나리오 2 — 새로 연 창에 클릭 의도를 다시 보낸다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '로마서 8:28' });
  env.fire('notificationclick', ev);
  await ev.waited();
  const toNew = env.posted.filter(p => p.to === 'new' && p.msg.type === 'block7-open-verse');
  sc.eq('새 창에 최소 한 번은 보냈다', toNew.length >= 1, true);
  sc.eq('여러 번 보내 앱이 늦게 붙어도 받는다', toNew.length >= 2, true);
  sc.eq('보낸 내용에 장절이 있다', toNew[0].msg.ref, '로마서 8:28');
  sc.eq('보낸 내용에 intentId 가 있다', !!toNew[0].msg.intentId, true);
}

// ═══ 3. 이미 열린 창이 있으면 focus + 재전달 (창을 새로 열지 않는다) ═══
console.log('\n시나리오 3 — 이미 열린 창이 있을 때');
{
  const posted = [];
  let focused = 0;
  const old = {
    id: 'old', url: 'https://block7.my/', visibilityState: 'visible', focused: false,
    postMessage: m => posted.push(m),
    focus: function () { focused++; return Promise.resolve(this); }
  };
  const env = makeEnv({ clients: [old] });
  const ev = clickEvent({ ref: '시편 23:1' });
  env.fire('notificationclick', ev);
  await ev.waited();
  sc.eq('새 창을 열지 않는다', env.opened.length, 0);
  sc.eq('창을 앞으로 가져온다', focused, 1);
  const toOld = posted.filter(m => m.type === 'block7-open-verse');
  sc.eq('기존 창에 두 번 보낸다(깨우기 전·후)', toOld.length, 2);
  sc.eq('두 번 다 같은 고유번호다', toOld[0].intentId === toOld[1].intentId, true);
}

// ═══ 4. ref 를 FCM 이 감싸 보내도 꺼낸다 ═══
console.log('\n시나리오 4 — FCM 이 감싼 모양에서도 장절을 꺼낸다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ FCM_MSG: { data: { ref: '빌립보서 4:13' } } });
  env.fire('notificationclick', ev);
  await ev.waited();
  sc.eq('감싼 자리에서도 꺼낸다', env.store['__pending_verse'].ref, '빌립보서 4:13');
}

// ═══ 5. 알림에 심어 둔 intentId 를 그대로 쓴다 (클릭 경로 테스트가 쓰는 길) ═══
console.log('\n시나리오 5 — 앱이 심어 둔 고유번호를 그대로 이어 쓴다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '요한복음 3:16', intentId: 'test-abc-123' });
  env.fire('notificationclick', ev);
  await ev.waited();
  sc.eq('심어 둔 번호를 그대로 쓴다', env.store['__pending_verse'].intentId, 'test-abc-123');
  sc.eq('주소에도 그 번호가 실린다', /vi=test-abc-123/.test(env.opened[0]), true);
}

// ═══ 6. ⚠️ IndexedDB 가 멈춰도 창에 알리는 일은 그대로 진행된다 ═══
//     그리고 진단 기록에 **'완료'가 아니라 '시간초과'** 로 남아야 한다.
console.log('\n시나리오 6 — 저장이 멈춰도 창 전달은 되고, 기록은 시간초과라고 적는다');
{
  const env = makeEnv({ clients: [], idbHangs: true });
  const ev = clickEvent({ ref: '이사야 41:10' });
  env.fire('notificationclick', ev);
  const t0 = Date.now();
  await ev.waited();
  sc.eq('새 창은 그대로 열렸다', env.opened.length, 1);
  const toNew = env.posted.filter(p => p.to === 'new' && p.msg.type === 'block7-open-verse');
  sc.eq('새 창에 의도도 전달됐다', toNew.length >= 1, true);
  const line = (env.cache['/__notif_log'] ? JSON.parse(env.cache['/__notif_log'].body) : [])
    .map(e => e.m).join(' ');
  sc.eq('IDB 저장을 시간초과로 적는다', /IDB 저장 시간초과/.test(line), true);
  sc.eq('시간초과를 성공/완료로 적지 않는다', /IDB 저장 성공|기록 저장 완료/.test(line), false);
  sc.eq('저장을 기다리느라 2.5초를 넘기지 않는다', (Date.now() - t0) < 2500, true);
}

// ═══ 7. 앱 ready handshake 로 다시 건넨다 (메시지가 유실된 경우의 그물) ═══
console.log('\n시나리오 7 — 앱이 준비됐다고 알려오면 의도를 다시 건넨다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '마태복음 6:33' });
  env.fire('notificationclick', ev);
  await ev.waited();
  const before = env.posted.length;
  const late = env.client('late');
  env.fire('message', { data: { type: 'block7-app-ready', appVersion: 'v. 26-0828-4' },
                        source: late, waitUntil() {} });
  await wait(30);
  const toLate = env.posted.filter(p => p.to === 'late' && p.msg.type === 'block7-open-verse');
  sc.eq('늦게 붙은 창에도 건넨다', toLate.length, 1);
  sc.eq('장절이 그대로다', toLate[0].msg.ref, '마태복음 6:33');
  sc.eq('전에 보낸 것은 그대로 남는다', env.posted.length > before, true);
}

// ═══ 8. ack 를 받으면 전달용 기록을 지운다 (앱이 전체화면을 확인한 뒤) ═══
console.log('\n시나리오 8 — 앱이 확인했다고 알려오면 기록을 지운다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '누가복음 1:37' });
  env.fire('notificationclick', ev);
  await ev.waited();
  sc.eq('먼저 기록이 있다', !!env.store['__pending_verse'], true);
  env.fire('message', { data: { type: 'block7-intent-ack' }, source: env.client('app'), waitUntil() {} });
  await wait(60);
  sc.eq('ack 뒤에는 기록이 없다', !!env.store['__pending_verse'], false);
  const late = env.client('late2');
  env.fire('message', { data: { type: 'block7-app-ready' }, source: late, waitUntil() {} });
  await wait(30);
  sc.eq('ack 뒤에는 다시 건네지 않는다', env.posted.filter(p => p.to === 'late2').length, 0);
}

// ═══ 9. 워커 버전 묻기 (앱 버전과 따로 보여주기 위한 것) ═══
console.log('\n시나리오 9 — 워커 버전을 물으면 답한다');
{
  const env = makeEnv({ clients: [] });
  const asker = env.client('asker');
  env.fire('message', { data: { type: 'block7-sw-ping' }, source: asker, waitUntil() {} });
  const pong = env.posted.filter(p => p.to === 'asker' && p.msg.type === 'block7-sw-pong');
  sc.eq('버전을 돌려준다', pong.length, 1);
  sc.eq('버전 모양이 맞다', /^v\. \d{2}-\d{4}-\d+$/.test(pong[0].msg.swVersion), true);
}

// ═══ 10. openWindow 가 창 핸들을 안 줘도 터지지 않는다 (사파리) ═══
console.log('\n시나리오 10 — openWindow 가 창을 안 돌려줘도 끝까지 간다');
{
  const env = makeEnv({ clients: [], openWindowNoHandle: true });
  const ev = clickEvent({ ref: '베드로전서 5:7' });
  env.fire('notificationclick', ev);
  await ev.waited();
  const line = (env.cache['/__notif_log'] ? JSON.parse(env.cache['/__notif_log'].body) : [])
    .map(e => e.m).join(' ');
  sc.eq('창 핸들이 없다고 적는다', /창 핸들 없음/.test(line), true);
  sc.eq('전달용 기록은 그래도 남는다', !!env.store['__pending_verse'], true);
}

// ═══ 11. 한 알림의 모든 단계가 같은 번호로 이어 적힌다 ═══
console.log('\n시나리오 11 — 진단 기록이 하나의 번호로 이어진다');
{
  const env = makeEnv({ clients: [] });
  const ev = clickEvent({ ref: '히브리서 11:1', intentId: 'zzz-track-9' });
  env.fire('notificationclick', ev);
  await ev.waited();
  const lines = (env.cache['/__notif_log'] ? JSON.parse(env.cache['/__notif_log'].body) : []).map(e => e.m);
  const mine = lines.filter(m => m.indexOf('#z-track-9') === 0 || m.indexOf('#') === 0);
  sc.eq('번호가 붙은 줄이 있다', mine.length >= 1, true);
  const joined = lines.join(' ');
  sc.eq('클릭 시작 단계가 적힌다', /notificationclick 시작/.test(joined), true);
  sc.eq('ref 추출 결과가 적힌다', /ref 추출 성공/.test(joined), true);
  sc.eq('열린 client 수가 적힌다', /열린 client 0개/.test(joined), true);
  sc.eq('openWindow 결과가 적힌다', /openWindow 성공/.test(joined), true);
}

sc.done();
})();
