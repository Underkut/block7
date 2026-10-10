// 대분류 길게 누르기 → 시트 앱 (v26-1010-14, HB 결정) — 아이폰은 **손을 뗄 때** 넘어가며 복사한다.
//
// 왜 —
//   HB 가 휴대폰으로 시험해 보니(lab/sheet-link-lab.html) 시트 앱은 어떤 링크 모양이든
//   행을 무시하고 마지막으로 보던 자리를 연다. 그 행으로 가는 길은 '본문 복사 → 앱의
//   찾기에 붙여넣기' 하나뿐이다 (시험 6번 — 손을 뗀 click 에서 복사하고 열기 — 성공).
//   그런데 아이폰은 손가락이 닿아 있는 동안에는 웹앱의 복사를 막는다. 예전처럼
//   붙잡은 채로 넘어가면 복사가 한 번도 안 됐다 (0817-4). HB 가 '손 뗄 때 넘어가기' 를 골랐다.
//
// 지키는 것 —
//   · 아이폰·아이패드: 0.5초 → 화면 가운데 토스트 '놓으면 …' 만 띄우고, click 에서 **복사 먼저, 열기 나중**
//     (v26-1010-16, HB — 대분류 글자를 바꾸던 것은 손가락에 가려 안 보였다. 글자는 그대로 둔다)
//   · 복사하는 것은 본문 **전문** (자르지 않는다 — HB)
//   · 안드로이드: 예전 그대로 붙잡은 채로 넘어간다
//   · 짧은 탭은 예전 그대로 타일뷰, 손가락을 움직이면 없던 일
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 시계 ──
let now = 0, seq = 0, timers = [];
global.setTimeout = (fn, ms) => { const id = ++seq; timers.push({ id, at: now + (ms || 0), fn }); return id; };
global.clearTimeout = id => { timers = timers.filter(t => t.id !== id); };
function tick(ms) {
  const end = now + ms;
  for (;;) {
    timers.sort((a, b) => a.at - b.at);
    const t = timers[0];
    if (!t || t.at > end) break;
    timers.shift(); now = t.at; t.fn();
  }
  now = end;
}
// ── 가짜 대분류 요소 ──
function makeEl(text) {
  const h = {};
  return { textContent: text,
    addEventListener(type, fn) { (h[type] = h[type] || []).push(fn); },
    fire(type, ev) { (h[type] || []).forEach(f => f(Object.assign({ stopPropagation() {}, preventDefault() {} }, ev || {}))); } };
}
let EL = null;
// 가운데 토스트 흉내 — 지금 떠 있는 글과 떠 있는지만 본다
const TOAST = { text: '', shown: false };
let toasts = [];
global.document = { getElementById: id => (id === 'vfCat' ? EL : id === '_toast' ? { textContent: TOAST.shown ? TOAST.text : '' } : null) };
// ⚠️ 노드 22 에는 navigator 가 원래 있고(userAgent 'Node.js/22') 그냥 대입하면 안 바뀐다
//    → 새로 정의한다. 안 그러면 안드로이드 흉내가 조용히 '아이폰' 으로 돈다.
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: '' }, writable: true, configurable: true });
// ── 둘레 함수 흉내 ──
let log = [];
let CUR = null, TARGET = null, COPY_OK = true;
global._isDevAccount = () => true;
global._vfCurrentVerse = () => CUR;
global._sheetUrlForVerse = () => TARGET;
global._sheetGo = url => log.push('열기 ' + url);
global._fallbackCopy = txt => { log.push('복사 ' + txt); return COPY_OK; };
global._sheetCopyPending = keep => log.push('붙잡은 채 복사' + (keep ? '(keep)' : ''));
global.showToast = m => { TOAST.text = m; TOAST.shown = true; toasts.push(m); };
global._dismissToast = () => { TOAST.shown = false; };
global._dlog = () => {};
global._vgOpenFromReels = k => log.push('타일뷰 ' + k);
eval(slice('// 대분류 탭 — 롱터치로 시트를 연 직후의 클릭은 무시한다', '// 시트 열기는 **기기에 따라 정반대로**'));

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
const LONG = '너희는 세상의 소금이니 소금이 만일 그 맛을 잃으면 무엇으로 짜게 하리요 후에는 아무 쓸 데 없어 다만 밖에 버려져 사람에게 밟힐 뿐이니라 너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요 사람이 등불을 켜서 말 아래에 두지 아니하고 등경 위에 두나니';
const URL = 'https://docs.google.com/spreadsheets/d/X/edit#gid=0&range=A5:G5';
const CUE = '놓으면 본문을 복사하고 시트로 가요';
const cueShown = () => TOAST.shown && TOAST.text === CUE;

function fresh(ua, verse) {
  now = 0; timers = []; log = []; toasts = []; TOAST.text = ''; TOAST.shown = false;
  navigator.userAgent = ua;
  CUR = verse || { ref: '마태복음 5:13-16', cat: '주일예배', topic: '빛과 소금', krText: LONG, pid: '' };
  TARGET = { url: URL, row: 5 };
  COPY_OK = true;
  EL = makeEl(CUR.cat);
  _initVfCatSheet();
}
const at = (x, y) => ({ touches: [{ clientX: x, clientY: y }] });
// 브라우저는 HTML 의 onclick="vfCatTap()" 을 먼저, addEventListener 의 click 을 나중에 부른다
function click() { vfCatTap(); EL.fire('click'); }

// ═══ 1. 아이폰 — 0.5초 붙잡으면 표시만, 손을 떼면 복사하고 연다 ═══
console.log('시나리오 1 — 아이폰: 붙잡으면 표시, 떼면 복사하고 열기');
{
  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10));
  tick(499);
  sc.eq('0.5초 전에는 아무 일도 없다', [log, toasts], [[], []]);
  tick(1);
  sc.eq('0.5초가 되면 화면 가운데에 토스트가 뜬다', cueShown(), true);
  sc.eq('대분류 글자는 그대로다 (손가락 밑이라 바꿔도 안 보인다)', EL.textContent, '주일예배');
  sc.eq('붙잡은 동안에는 열지도 복사하지도 않는다', log, []);
  EL.fire('touchend');
  click();
  sc.eq('떼는 click 에서 복사하고 연다 (복사가 먼저)', log, ['복사 ' + LONG, '열기 ' + URL]);
  sc.eq('본문 전문을 그대로 복사한다 (자르지 않는다)', log[0].length - 3, LONG.length);
  sc.eq('열면서 토스트를 내린다', cueShown(), false);
  sc.eq('타일뷰는 열리지 않는다', log.some(x => x.startsWith('타일뷰')), false);
  tick(2000);
  sc.eq('늦게라도 두 번 열지 않는다', log.filter(x => x.startsWith('열기')).length, 1);
}

// ═══ 2. 아이패드 — 맥 행세를 해도 아이폰과 같은 길 (v26-1010-11) ═══
console.log('\n시나리오 2 — 아이패드도 손을 뗄 때');
{
  fresh(IPAD);
  EL.fire('touchstart', at(10, 10));
  tick(600);
  sc.eq('붙잡은 동안 열지 않는다', log, []);
  EL.fire('touchend'); click();
  sc.eq('떼면 복사하고 연다', log, ['복사 ' + LONG, '열기 ' + URL]);
}

// ═══ 3. 명제 — 명제 글 전문을 복사한다 ═══
console.log('\n시나리오 3 — 명제는 명제 글 전문');
{
  const P = '그리스도인의 정체성은 세상과 구별되면서도 세상 속으로 들어가 맛을 내고 어둠을 밝히는 데 있으며, 이것은 우리의 노력이 아니라 주님이 이미 선언하신 사실이다';
  fresh(IPHONE, { ref: '마태복음 5:13-16', cat: '주일예배', topic: '언덕 위의 도시', krText: P, pid: 'P0003' });
  EL.fire('touchstart', at(5, 5)); tick(500); EL.fire('touchend'); click();
  sc.eq('명제 글 그대로', log[0], '복사 ' + P);
}

// ═══ 4. 짧은 탭 — 예전 그대로 타일뷰 ═══
console.log('\n시나리오 4 — 짧게 누르면 예전 그대로');
{
  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10)); tick(200); EL.fire('touchend'); click();
  sc.eq('타일뷰만 열린다', log, ['타일뷰 cat']);
  sc.eq('토스트도 안 뜬다', toasts, []);
}

// ═══ 5. 손가락을 움직이면 없던 일 · 손떨림은 봐준다 ═══
console.log('\n시나리오 5 — 움직이면 취소, 손떨림은 괜찮다');
{
  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10)); tick(600);
  EL.fire('touchmove', at(10, 40));       // 30px — 끌어 넘기려는 것
  sc.eq('움직이면 토스트를 내린다', cueShown(), false);
  EL.fire('touchend'); click(); tick(1000);
  sc.eq('아무것도 열지 않는다 (타일뷰도)', log, []);

  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10));
  EL.fire('touchmove', at(14, 13));       // 4px — 손떨림
  tick(500);
  sc.eq('손떨림으로는 취소되지 않는다', cueShown(), true);
  EL.fire('touchend'); click();
  sc.eq('그대로 복사하고 연다', log, ['복사 ' + LONG, '열기 ' + URL]);

  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10)); tick(600); EL.fire('touchcancel');
  sc.eq('터치가 끊기면 토스트를 내린다', cueShown(), false);
  tick(1000);
  sc.eq('끊기면 아무것도 열지 않는다', log, []);
}

// ═══ 6. 아이폰이 click 을 안 줄 때 — 복사 없이라도 연다 ═══
console.log('\n시나리오 6 — click 이 안 오면 0.6초 뒤 그냥 연다');
{
  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10)); tick(500); EL.fire('touchend');
  tick(599);
  sc.eq('0.6초 전에는 기다린다', log, []);
  tick(1);
  sc.eq('복사 없이라도 연다', log, ['붙잡은 채 복사(keep)', '열기 ' + URL]);
  sc.eq('토스트는 내려가 있다', cueShown(), false);
  click();
  sc.eq('늦게 온 click 이 두 번 열지 않는다', log.filter(x => x.startsWith('열기')).length, 1);
}

// ═══ 7. 안드로이드 — 예전 그대로 붙잡은 채로 넘어간다 ═══
console.log('\n시나리오 7 — 안드로이드는 붙잡은 채로');
{
  fresh(ANDROID);
  EL.fire('touchstart', at(10, 10)); tick(500);
  sc.eq('0.5초에 복사하고 곧장 연다', log, ['붙잡은 채 복사(keep)', '열기 ' + URL]);
  sc.eq('토스트는 띄우지 않는다', toasts, []);
  EL.fire('touchend'); click();
  sc.eq('click 이 오면 한 번 더 복사만 (열지 않는다, 타일뷰도 아니다)',
    log.slice(2), ['붙잡은 채 복사']);
}

// ═══ 8. 시트에서 오지 않은 말씀 ═══
console.log('\n시나리오 8 — 시트에서 오지 않은 말씀');
{
  fresh(IPHONE); TARGET = null;
  EL.fire('touchstart', at(10, 10)); tick(500);
  sc.eq('붙잡으면 바로 알려 준다', toasts, ['이 말씀은 구글 시트에서 가져온 것이 아니에요']);
  EL.fire('touchend'); click(); tick(1000);
  sc.eq('떼도 아무것도 열지 않는다', log, []);
}

// ═══ 8-2. 그사이 다른 토스트가 덮었으면 그것은 내리지 않는다 ═══
console.log('\n시나리오 8-2 — 남의 토스트는 건드리지 않는다');
{
  fresh(IPHONE);
  EL.fire('touchstart', at(10, 10)); tick(500);
  showToast('다른 알림');                      // 붙잡은 사이 다른 토스트가 떴다
  EL.fire('touchmove', at(10, 60));            // 취소
  sc.eq('다른 토스트는 그대로 떠 있다', [TOAST.shown, TOAST.text], [true, '다른 알림']);
}

// ═══ 9. 동기 복사가 안 되면 비동기 복사가 끝난 뒤에 연다 ═══
console.log('\n시나리오 9 — 비동기 복사를 기다렸다 연다');
(async () => {
  fresh(IPHONE); COPY_OK = false;
  let wrote = null;
  navigator.clipboard = { writeText: t => { wrote = t; log.push('비동기 복사'); return Promise.resolve(); } };
  EL.fire('touchstart', at(10, 10)); tick(500); EL.fire('touchend'); click();
  sc.eq('열기 전에 비동기 복사를 건다', log, ['복사 ' + LONG, '비동기 복사']);
  await Promise.resolve(); await Promise.resolve();
  sc.eq('복사가 끝난 뒤에 연다', log, ['복사 ' + LONG, '비동기 복사', '열기 ' + URL]);
  sc.eq('비동기로도 전문', wrote, LONG);
  delete navigator.clipboard;

  // ═══ 10. PC 우클릭 — 예전 그대로 ═══
  console.log('\n시나리오 10 — PC 우클릭은 예전 그대로');
  fresh('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
  EL.fire('contextmenu');
  sc.eq('곧장 연다', log, ['붙잡은 채 복사(keep)', '열기 ' + URL]);
  vfCatTap();
  sc.eq('우클릭 뒤의 click 은 타일뷰로 새지 않는다', log.some(x => x.startsWith('타일뷰')), false);

  sc.done();
})();
