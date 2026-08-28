// 알림 클릭 의도(intent) — 앱 쪽 (v26-0828-4)
//
// ⚠️ tests/test_notif.js 는 "클릭 의도가 이미 앱에 도착했다" 를 전제로 엔진만
//    검사한다. 이 파일은 그 앞 구간 — **의도를 어디서 어떻게 받아 두는가** 를 맡는다.
//    아이폰에서 실제로 끊기던 자리가 여기다:
//      · 앱이 막 켜지는 중이라 말씀 목록이 없다
//      · 워커의 IndexedDB 저장이 시간초과돼 전달용 기록이 없다
//      · 주소(?verse=)가 무시된다
//    셋이 겹치면 예전 코드에는 장절을 받을 통로가 **하나도** 남지 않았다.
//
// ⚠️ 검사 대상은 **개발본(index-dev.html)** 이다. 운영본은 HB 확인 전까지
//    커밋되지 않기 때문이다 (CLAUDE.md 규칙). 앱 코드는 둘이 같다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 브라우저 ────────────────────────────────────────────────
let NOW = 1700000000000;
const RealDate = Date;
global.Date = class extends RealDate { static now(){ return NOW; } };

const timers = [];
global.setTimeout = (fn, ms) => { const t = { fn, at: NOW + (ms || 0), kind: 't' }; timers.push(t); return t; };
global.clearTimeout = t => { if (t) t.done = true; };
global.setInterval = (fn, ms) => { const t = { fn, at: NOW + (ms || 0), every: ms || 1, kind: 'i' }; timers.push(t); global.__lastInterval = t; return t; };
global.clearInterval = t => { if (t) t.done = true; };
function runTimers(limit = 300) {
  for (let i = 0; i < limit; i++) {
    const t = timers.filter(x => !x.done).sort((a, b) => a.at - b.at)[0];
    if (!t) return;
    NOW = Math.max(NOW, t.at);
    if (t.kind === 'i') t.at = NOW + t.every; else t.done = true;
    t.fn();
    if (t.kind === 'i' && i > 40) t.done = true;   // 폴링은 몇 바퀴만
  }
}
const tick = () => new Promise(r => process.nextTick(r));

// localStorage
const LSTORE = {};
global.localStorage = {
  getItem: k => (k in LSTORE ? LSTORE[k] : null),
  setItem: (k, v) => { LSTORE[k] = String(v); },
  removeItem: k => { delete LSTORE[k]; }
};

// document / window / navigator
const listeners = { doc: {}, win: {} };
let AUTH_VISIBLE = false;      // 로그인 화면이 떠 있는가
global.document = {
  visibilityState: 'visible',
  addEventListener: (t, fn) => { (listeners.doc[t] = listeners.doc[t] || []).push(fn); },
  getElementById: id => (id === 'authScreen'
    ? { classList: { contains: c => (c === 'hidden' ? !AUTH_VISIBLE : false) } }
    : null)
};
global.window = { addEventListener: (t, fn) => { (listeners.win[t] = listeners.win[t] || []).push(fn); } };
const swPosted = [];
// ⚠️ node 22 의 globalThis.navigator 는 **읽기 전용 getter** 다. 그냥 대입하면
//    조용히 무시되고 진짜 node navigator(serviceWorker 없음)가 쓰인다.
const NAV = {
  serviceWorker: {
    controller: { postMessage: m => swPosted.push(m) },
    ready: Promise.resolve({ active: { postMessage: m => swPosted.push(m) } }),
    addEventListener: () => {},
    startMessages: () => {},
    set onmessage(fn) { global.__swOnMessage = fn; },
    get onmessage() { return global.__swOnMessage; }
  }
};
Object.defineProperty(globalThis, 'navigator', { value: NAV, writable: true, configurable: true });
let bcCount = 0;
global.BroadcastChannel = class { constructor(){ bcCount++; } set onmessage(f){ global.__bcOnMessage = f; } };
global.window.BroadcastChannel = global.BroadcastChannel;   // 'BroadcastChannel' in window 판정용
global.URLSearchParams = require('url').URLSearchParams;
let URL_SEARCH = '';
global.location = { get search(){ return URL_SEARCH; }, pathname: '/', hash: '' };
global.history = { replaceState: () => { URL_SEARCH = ''; } };
global.APP_VERSION = 'v. 26-0828-4';
global.DEV_MODE = false;
global.console = console;

// 앱 대역
let LOG = [];
global._notifLog = m => { LOG.push(String(m)); };
global._notifLogLSPush = () => {};
let PENDING = null;                       // 서비스워커가 남긴 전달용 기록 (IndexedDB)
let IDB_MODE = 'ok';                      // 'ok' | 'timeout'
global._idbGetOutcome = () => Promise.resolve(
  IDB_MODE === 'timeout' ? { how: 'timeout', ms: 1500, label: 'idbGet' }
                         : { how: 'ok', ms: 1, value: PENDING });
global._idbDel = () => { PENDING = null; return Promise.resolve(); };
global.showToast = () => {};

let SCREEN = { open: false, ref: '' };
let VERSES = [];
let pendingPaint = null;
global._vfOverrideVerse = null;
global._verseFullIsOpen = () => SCREEN.open;
global._vfCurrentVerse = () => (SCREEN.open ? { ref: SCREEN.ref } : null);
global.openVerseFull = () => { SCREEN.open = true; pendingPaint = global._vfOverrideVerse; };
global._verseFullRender = () => { if (pendingPaint) SCREEN.ref = pendingPaint.ref; };

// ── 실제 코드 떠오기 ────────────────────────────────────────────
const CODE = [
  sliceDev('const _REF_ABBR2FULL=', 'function _findVerseByRefLoose'),
  sliceDev('function _withOutcome(', 'let _idbConn=null;'),
  sliceDev('const _NOTIF_INTENT_KEY=', '//  알림 → 전체화면'),
  sliceDev('let _notifTarget=null;', '// ③ 서비스워커가 남긴 기록 읽기'),
  sliceDev('let _pendReadWarnAt=0;', '// ② 서비스워커 메시지 (앱이 이미 열려 있는 경우)'),
  sliceDev('let _notifBridgeReady=false;', '// ⚠️⚠️ **여기서 곧바로 한 번 놓는다.**'),
  // 바깥에서 부를 창구 (eval 안의 let/const 는 새어 나오지 않는다)
  `global.X = {
     initBridge: _initVerseNotifBridge,
     openFromLink: _openVerseFromLink,
     takeIntent: _notifTakeIntent,
     intentFrom: _notifIntentFrom,
     intentLoad: _notifIntentLoad,
     intentSave: _notifIntentSave,
     intentClear: _notifIntentClear,
     withOutcome: _withOutcome,
     outcomeText: _outcomeText,
     stop: _notifStop,
     doneIds: _notifDoneIds,
     resetDone: () => { _notifDoneIds.clear(); _notifDoneTok = 0; },
     announceReady: _notifAnnounceReady
   };`
].join('\n');
global._findVerseByRefLoose = null;   // 아래 eval 이 진짜를 덮어쓴다
eval(CODE);
// 말씀 목록 대역 — 실제 _findVerseByRefLoose 대신 간단한 짝짓기를 쓴다
global._findVerseByRefLoose = ref => VERSES.find(v => _refNorm(v.ref) === _refNorm(ref)) || null;

function reset(verses) {
  NOW += 1000000;
  timers.length = 0;
  SCREEN = { open: false, ref: '' }; pendingPaint = null;
  LOG = []; PENDING = null; IDB_MODE = 'ok'; URL_SEARCH = ''; AUTH_VISIBLE = false;
  swPosted.length = 0;
  Object.keys(LSTORE).forEach(k => delete LSTORE[k]);
  global._vfOverrideVerse = null;
  X.stop(); X.resetDone();
  VERSES = (verses || []).map(r => ({ ref: r }));
}
// 서비스워커가 알림 탭을 처리한 것처럼 — IndexedDB 에 기록을 남긴다
function swSavedPending(ref, intentId) {
  PENDING = { ref, ts: NOW, createdAt: NOW, intentId: intentId || ('sw-' + NOW), swVersion: 'v. 26-0828-4' };
  return PENDING.intentId;
}

(async () => {

// ═══ 1. 클릭 의도 레코드가 정해진 모양을 갖춘다 ═══
console.log('시나리오 1 — 클릭 의도 레코드의 모양');
{
  reset(['요한복음 1:18']);
  const it = X.intentFrom({ ref: '요한복음 1:18', ts: NOW, intentId: 'abc', swVersion: 'v. 26-0828-4' }, 'SW 메시지');
  sc.eq('필요한 칸이 모두 있다',
    ['intentId','ref','createdAt','source','swVersion','appVersion','stage','retryCount','expiresAt']
      .every(k => it[k] !== undefined), true);
  sc.eq('앱 버전이 기록된다', it.appVersion, 'v. 26-0828-4');
  sc.eq('유효기간이 미래다', it.expiresAt > NOW, true);
}

// ═══ 2. 옛 서비스워커 기록(intentId 없음)도 받아들인다 ═══
console.log('\n시나리오 2 — 옛 워커가 남긴 {ref, ts} 기록');
{
  reset(['요한복음 1:18']);
  const it = X.intentFrom({ ref: '요한복음 1:18', ts: 1234567 }, '남긴 기록');
  sc.eq('ts 로 고유번호를 만든다', it.intentId, 'ts:1234567');
  sc.eq('장절은 그대로', it.ref, '요한복음 1:18');
}

// ═══ 3. ⚠️ 시간초과를 '성공'으로 적지 않는다 ═══
console.log('\n시나리오 3 — 시간초과와 성공을 구분한다');
{
  const ok = await X.withOutcome(Promise.resolve(7), 50, 'x');
  sc.eq('성공은 ok', ok.how, 'ok');
  sc.eq('성공 글자', /^성공/.test(X.outcomeText(ok)), true);
  const er = await X.withOutcome(Promise.reject(new Error('꽝')), 50, 'x');
  sc.eq('오류는 error', er.how, 'error');
  sc.eq('오류 글자', /^오류/.test(X.outcomeText(er)), true);
  // 시간초과는 가짜 타이머로 만든다
  const p = X.withOutcome(new Promise(() => {}), 50, 'x');
  runTimers();
  const to = await p;
  sc.eq('시간초과는 timeout', to.how, 'timeout');
  sc.eq('시간초과 글자', /^시간초과/.test(X.outcomeText(to)), true);
  sc.eq('시간초과를 성공이라 적지 않는다', /성공|완료/.test(X.outcomeText(to)), false);
}

// ═══ 4. 브리지는 몇 번을 불러도 리스너·타이머가 하나 ═══
console.log('\n시나리오 4 — 브리지 초기화가 두 번 불려도 하나만');
{
  reset([]);
  const bc0 = bcCount;
  X.initBridge(); X.initBridge(); X.initBridge();
  sc.eq('visibilitychange 리스너 1개', (listeners.doc['visibilitychange'] || []).length, 1);
  sc.eq('focus 리스너 1개', (listeners.win['focus'] || []).length, 1);
  sc.eq('pageshow 리스너 1개', (listeners.win['pageshow'] || []).length, 1);
  sc.eq('브로드캐스트 채널 1개', bcCount - bc0, 1);
  sc.eq('폴링 타이머 1개', timers.filter(t => t.kind === 'i' && !t.done).length, 1);
  sc.eq('앱 준비 신호를 워커에 보낸다', swPosted.some(m => m.type === 'block7-app-ready'), true);
}

// ═══ 5. 주소에 실려 온 의도 (맥·안드로이드) ═══
console.log('\n시나리오 5 — 주소로 들어온 알림');
{
  reset(['요한복음 1:18']);
  URL_SEARCH = '?verse=' + encodeURIComponent('요한복음 1:18') + '&vt=' + NOW + '&vi=win-1';
  await X.openFromLink();
  runTimers();
  sc.eq('그 말씀이 떴다', SCREEN.ref, '요한복음 1:18');
  sc.eq('주소는 정리됐다', URL_SEARCH, '');
}

// ═══ 6. 남긴 기록으로 들어온 의도 (아이폰의 주 통로) ═══
console.log('\n시나리오 6 — IndexedDB 에 남긴 기록으로 들어온 알림');
{
  reset(['로마서 8:28']);
  swSavedPending('로마서 8:28', 'idb-1');
  await X.openFromLink();
  runTimers();
  sc.eq('그 말씀이 떴다', SCREEN.ref, '로마서 8:28');
  sc.eq('확인된 뒤에만 기록이 지워졌다', PENDING, null);
}

// ═══ 7. ⚠️ IDB 는 실패하고 메시지만 성공한 경우 — 예전엔 통로가 없었다 ═══
console.log('\n시나리오 7 — 저장은 시간초과, 메시지만 도착 (아이폰)');
{
  reset(['시편 23:1']);
  IDB_MODE = 'timeout';                       // 워커의 저장이 멈춰 기록이 없다
  X.initBridge();
  // 워커 메시지가 도착
  X.takeIntent({ ref: '시편 23:1', ts: NOW, intentId: 'msg-only-1', swVersion: 'v. 26-0828-4' }, 'SW 메시지');
  sc.eq('의도가 이 기기에 적혔다', !!X.intentLoad(), true);
  runTimers();
  sc.eq('그 말씀이 떴다', SCREEN.ref, '시편 23:1');
  sc.eq('확인된 뒤 보관도 지워졌다', X.intentLoad(), null);
}

// ═══ 8. ⚠️ 콜드 스타트: 말씀 목록이 아직 없다 → 뒤늦게라도 열린다 ═══
//     예전에는 메시지로만 온 의도가 재시도 차례를 다 쓰면 **영영 사라졌다.**
console.log('\n시나리오 8 — 앱이 막 켜지는 중이라 말씀 목록이 없음');
{
  reset([]);                                   // 목록이 비어 있다
  IDB_MODE = 'timeout';                        // 저장 기록도 없다
  X.initBridge();
  X.takeIntent({ ref: '빌립보서 4:13', ts: NOW, intentId: 'cold-1' }, 'SW 메시지');
  runTimers();                                 // 재시도를 다 써도 못 연다
  sc.eq('아직 못 열었다', SCREEN.open, false);
  sc.eq('의도는 사라지지 않았다', !!X.intentLoad(), true);
  sc.eq('의도의 장절이 그대로다', X.intentLoad().ref, '빌립보서 4:13');
  // Firestore 에서 말씀이 도착
  VERSES = [{ ref: '빌립보서 4:13' }];
  await X.openFromLink();                      // 폴링이 하는 일과 같다
  runTimers();
  sc.eq('말씀이 도착한 뒤 열린다', SCREEN.ref, '빌립보서 4:13');
  sc.eq('열린 뒤에는 보관을 지운다', X.intentLoad(), null);
}

// ═══ 9. 같은 고유번호가 여러 통로로 들어와도 한 번만 ═══
console.log('\n시나리오 9 — 같은 알림이 메시지·브로드캐스트·기록으로 동시에');
{
  reset(['요한복음 3:16']);
  const id = 'dup-1';
  const a = X.takeIntent({ ref: '요한복음 3:16', ts: NOW, intentId: id }, 'SW 메시지');
  const b = X.takeIntent({ ref: '요한복음 3:16', ts: NOW, intentId: id }, '브로드캐스트');
  const c = X.takeIntent({ ref: '요한복음 3:16', ts: NOW, intentId: id }, '남긴 기록');
  runTimers();
  sc.eq('첫 통로만 처리한다', [a, b, c], [true, false, false]);
  sc.eq('그 말씀이 떴다', SCREEN.ref, '요한복음 3:16');
  const again = X.takeIntent({ ref: '요한복음 3:16', ts: NOW, intentId: id }, '남긴 기록');
  sc.eq('처리된 뒤 다시 와도 무시', again, false);
}

// ═══ 10. 같은 장절이라도 **새 알림**이면 다시 연다 ═══
console.log('\n시나리오 10 — 같은 장절의 새 알림');
{
  reset(['요한복음 3:16', '로마서 8:28']);
  X.takeIntent({ ref: '요한복음 3:16', ts: NOW, intentId: 'n1' }, 'SW 메시지');
  runTimers();
  sc.eq('첫 알림으로 떴다', SCREEN.ref, '요한복음 3:16');
  SCREEN.ref = '로마서 8:28';                   // 사람이 다른 말씀으로 넘겼다
  const ok = X.takeIntent({ ref: '요한복음 3:16', ts: NOW + 1, intentId: 'n2' }, 'SW 메시지');
  runTimers();
  sc.eq('새 알림은 새로 연다', ok, true);
  sc.eq('그 말씀으로 돌아왔다', SCREEN.ref, '요한복음 3:16');
}

// ═══ 11. 이미 다른 말씀 전체화면이 열린 상태에서 새 알림 ═══
console.log('\n시나리오 11 — 전체화면 A 를 보는 중에 알림 B');
{
  reset(['요한복음 1:18', '로마서 8:28']);
  SCREEN = { open: true, ref: '요한복음 1:18' };
  X.takeIntent({ ref: '로마서 8:28', ts: NOW, intentId: 'switch-1' }, 'SW 메시지');
  runTimers();
  sc.eq('B 로 바뀐다', SCREEN.ref, '로마서 8:28');
}

// ═══ 12. 오래된 의도는 스스로 버린다 (10분) ═══
console.log('\n시나리오 12 — 오래 지난 의도는 버린다');
{
  reset(['시편 23:1']);
  X.intentSave({ intentId: 'old-1', ref: '시편 23:1', createdAt: NOW, expiresAt: NOW + 1000 });
  sc.eq('아직은 살아 있다', !!X.intentLoad(), true);
  NOW += 2000;
  sc.eq('유효기간이 지나면 없다', X.intentLoad(), null);
}

// ═══ 13. 확인 전에는 절대 지우지 않는다 ═══
console.log('\n시나리오 13 — 목록에 없는 말씀이면 기록을 남겨 둔다');
{
  reset(['요한복음 1:18']);                     // 목표 말씀이 목록에 없다
  swSavedPending('없는책 9:9', 'keep-1');
  await X.openFromLink();
  runTimers();
  sc.eq('전체화면은 안 떴다', SCREEN.open, false);
  sc.eq('전달용 기록을 지우지 않았다', !!PENDING, true);
  sc.eq('보관한 의도도 그대로', !!X.intentLoad(), true);
}

// ═══ 14. 진단 기록이 단계를 하나의 번호로 잇는다 ═══
console.log('\n시나리오 14 — 진단 기록이 한 번호로 이어진다');
{
  reset(['요한복음 1:18']);
  X.takeIntent({ ref: '요한복음 1:18', ts: NOW, intentId: 'trace-abcdef12' }, 'SW 메시지');
  runTimers();
  const mine = LOG.filter(l => l.indexOf('#abcdef12') === 0);
  sc.eq('그 번호로 여러 단계가 남는다', mine.length >= 3, true);
  sc.eq('열기 시작 단계', mine.some(l => /전체화면 열기 시작/.test(l)), true);
  sc.eq('render 호출 단계', mine.some(l => /전체화면 render 호출/.test(l)), true);
  sc.eq('표시 확인 단계', mine.some(l => /목표 말씀 표시 확인/.test(l)), true);
  sc.eq('pending 삭제 단계', mine.some(l => /pending 삭제/.test(l)), true);
}

// ═══ 15. 앱이 오래 멈췄다 깨어나면 다시 확인한다 ═══
console.log('\n시나리오 15 — 백그라운드에서 오래 멈췄다 재개');
{
  reset(['시편 121:1']);
  X.initBridge();                               // 이미 설치돼 있으므로 아무 일도 안 한다
  // reset 이 지운 폴링 타이머를 되살린다 (브리지는 하나만 설치되므로 새로 안 생긴다)
  const poll = global.__lastInterval;
  poll.done = false; poll.at = NOW + 1500;
  timers.push(poll);
  swSavedPending('시편 121:1', 'wake-1');
  NOW += 60000;                                 // 타이머가 얼어 있던 시간
  runTimers();
  await tick(); await tick(); await tick();
  runTimers();
  sc.eq('깨어난 것을 기록한다', LOG.some(l => /오래 멈췄다 깨어남/.test(l)), true);
  sc.eq('깨어나서 말씀을 연다', SCREEN.ref, '시편 121:1');
}

// ═══ 16. 로그인 화면이 떠 있으면 기다렸다 연다 ═══
//     ⚠️ 다리를 로그인보다 먼저 놓았기 때문에 새로 생긴 경우다.
//     의도를 버리면 안 되고, 로그인 뒤에 열려야 한다.
console.log('\n시나리오 16 — 로그인 화면이 떠 있는 동안 도착한 알림');
{
  reset(['에베소서 2:8']);
  AUTH_VISIBLE = true;
  const ok = X.takeIntent({ ref: '에베소서 2:8', ts: NOW, intentId: 'auth-1' }, 'SW 메시지');
  runTimers();
  sc.eq('아직 열지 않는다', ok, false);
  sc.eq('전체화면도 안 떴다', SCREEN.open, false);
  sc.eq('의도는 남아 있다', !!X.intentLoad(), true);
  sc.eq('기다린다고 기록한다', LOG.some(l => /로그인 화면이라 대기/.test(l)), true);
  AUTH_VISIBLE = false;                       // 로그인 완료
  await X.openFromLink();                     // 폴링이 하는 일
  runTimers();
  sc.eq('로그인 뒤에 열린다', SCREEN.ref, '에베소서 2:8');
}

// ═══ 17. ⚠️ 낡은 전달용 기록이 **새 의도**를 데려가지 않는다 ═══
//     워커의 저장이 시간초과된 새 알림은 메시지로만 들어와 '보관분'에만 있다.
//     그때 IndexedDB 에 남아 있던 낡은 기록을 치우면서 새 의도까지 지우면
//     그 알림은 영영 못 연다.
console.log('\n시나리오 17 — 낡은 기록을 치우면서 새 의도를 지우지 않는다');
{
  reset(['골로새서 3:2']);
  // 5분이 훨씬 지난 낡은 기록이 저장소에 남아 있다
  PENDING = { ref: '아주오래된 1:1', ts: NOW - 400000, createdAt: NOW - 400000, intentId: 'stale-1' };
  // 그 사이 새 알림이 메시지로만 도착했다 (워커의 저장은 시간초과)
  X.takeIntent({ ref: '골로새서 3:2', ts: NOW, intentId: 'fresh-1' }, 'SW 메시지');
  X.stop();                                  // 아직 못 열었다고 치고 엔진만 멈춘다
  sc.eq('새 의도가 보관돼 있다', X.intentLoad().intentId, 'fresh-1');
  await X.openFromLink();                    // 폴링이 낡은 기록을 만난다
  runTimers();
  sc.eq('낡은 기록은 치워졌다', PENDING, null);
  sc.eq('새 의도는 살아 있다', !!X.intentLoad() || SCREEN.ref === '골로새서 3:2', true);
  sc.eq('새 의도로 말씀이 열린다', SCREEN.ref, '골로새서 3:2');
}

sc.done();
})();
