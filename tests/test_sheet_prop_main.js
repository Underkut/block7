// 명제는 늘 '명제 DB' 탭의 행으로 — PC (v26-1010-16) · 휴대폰 (v26-1010-17), HB.
//
// HB: "명제 파일로 갈 때 갈 필요 없는 '성도 공유용' 탭으로 가는 게 너무 불편하다. 늘 '명제 DB' 로."
//     (v26-1010-16 뒤) "아직도 성도 공유용 탭으로 가고 있어. 제발 명제 DB 로."
//
// 까닭 — 앱은 명제마다 **마지막으로 받아 온 탭** 의 행(gid·row)만 기억한다. 두 탭에 다 있는
//   명제(2026-10-10 실제 시트 455개 중 261개)는 성도 공유용을 나중에 받아 그 탭으로 갔다.
//   v16 은 PC 만 고쳤는데, 휴대폰 시트 앱은 행은 무시해도 **탭 번호는 따른다** — 휴대폰이
//   넘기는 주소에 여전히 성도 공유용 탭 번호가 있었다.
// 고친 길 — 그 모음의 시트를 새로 읽어, 명제마다 그 명제가 있는 탭 가운데 앱이 읽는 칸이
//   가장 많은 탭(명제 DB)의 행을 고른다. 휴대폰은 명제를 띄울 때(그리고 누르고 있을 때),
//   PC 는 커서를 올릴 때 미리 읽고 모음마다 들고 있다 (휴대폰 10분 · PC 1분).
//   저장은 하나도 안 바꾼다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 시계 (setTimeout · Date.now) ──
let now = 1000000, seq = 0, timers = [];
global.setTimeout = (fn, ms) => { const id = ++seq; timers.push({ id, at: now + (ms || 0), fn }); return id; };
global.clearTimeout = id => { timers = timers.filter(t => t.id !== id); };
Date.now = () => now;
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
const settle = () => new Promise(r => setImmediate(r));

global.document = { visibilityState: 'visible', addEventListener: () => {},
  getElementById: id => (id === 'vfCat' ? EL : id === '_toast' ? null : null) };
function z(n){return String(n).padStart(2,'0');}
eval(slice('function _parseCsv(', '// rows → items'));
eval(slice('function _parseVDate(', 'function _looksLikeRef(').replace(/^const /gm,'var '));
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('// ══ 명제집(설교 명제 DB) 시트 읽기', '// 파일/직접용 임포트'));
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm'));
function _bookOfRef(ref){const m=String(ref||'').trim().match(/^([가-힣0-9\s]+?)\s*\d/);return m?m[1].trim():'';}
function _bookNorm(n){return String(n||'').trim();}
function _calKey(){return '2026-10-10';}
let COLLS = [];
global.getVerseCollections = () => COLLS;
eval(slice('function _sheetUrlForVerse(', '// 대분류 탭 — 롱터치로'));

// ── 둘레 흉내 ──
let log = [], SHEETS = {}, POPUP = true, CUR = null, BUSY = false, EL = null, DEV = true;
global._isDevAccount = () => DEV;
global._vfCurrentVerse = () => CUR;
global.showToast = m => log.push('토스트 ' + m);
global._dismissToast = () => {};
global.showBusyToast = m => { BUSY = true; log.push('기다림 ' + m); };
global.hideBusyToast = () => { BUSY = false; };
global._dlog = () => {};
global._vgOpenFromReels = k => log.push('타일뷰 ' + k);
global._sheetGo = url => log.push('열기 ' + url);
global._sheetCopyPending = keep => log.push('붙잡은 채 복사');
global._fallbackCopy = txt => { log.push('복사'); return true; };
// 시트 읽기 — 끝나는 때를 시험이 정한다
let pending = [];
global._fetchSheetCsv = url => new Promise(res => {
  const gid = (url.match(/gid=(\d+)/) || [])[1];
  log.push('읽기 ' + gid);
  pending.push(fail => res(fail ? { err: '못 읽음' } : (SHEETS[gid] == null ? { err: '없음' } : { text: SHEETS[gid] })));
});
async function done(fail) { const p = pending; pending = []; p.forEach(f => f(fail)); await settle(); await settle(); }
let WIN = null;
global.window = { open: () => {
  if (!POPUP) return null;
  WIN = { opener: {}, document: { title: '', body: { innerHTML: '' } }, url: null,
          location: { replace(u) { WIN.url = u; } } };
  return WIN;
} };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: '', platform: 'MacIntel', maxTouchPoints: 0 }, writable: true, configurable: true });
// 맨 앞의 const·let 은 var 로 — 시험이 '1분 기억' 칸(_sheetMainCache)을 비우려면 보여야 한다
eval(slice('// 대분류 탭 — 롱터치로', '// 시트 열기는 **기기에 따라 정반대로**').replace(/^(let|const) /gm, 'var '));

// ── 가짜 대분류 요소 ──
function makeEl() {
  const h = {};
  return { textContent: '주일예배',
    addEventListener(type, fn) { (h[type] = h[type] || []).push(fn); },
    fire(type, ev) { (h[type] || []).forEach(f => f(Object.assign({ stopPropagation() {}, preventDefault() {} }, ev || {}))); } };
}
const at = (x, y) => ({ touches: [{ clientX: x, clientY: y }] });
function click() { vfCatTap(); EL.fire('click'); }

// ── 시트 흉내 (2026-10-10 실제 머리글) ──
const DB_HEAD = ['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','인용 본문',
  '명제','대표 문구 1','대표 문구 2','분류','대표 명제','핵심 주제','주제 태그','조직신학',
  '성경신학/구속사','성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치',
  '한 줄 요약','원문 상태','관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
const SH_HEAD = ['주제','상황/필요','명제','본문','분류','묵상 질문','설교 제목','날짜','명제 ID',
  '공개 여부','검수 상태','공개 제목','공개 해설','기도문','공유 슬러그','공개 순서'];
const LIST_HEAD = ['날짜','카테고리','설교 제목','설교자','영상 링크','영상 시각','주요 본문','핵심 주제',
  '주제 태그','Best 1','Best 2','Best 3','명제 수','원문 상태'];
const cell = s => /[",\n\r]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : String(s);
const csv = (head, lines) => [head.map(cell).join(',')].concat(lines.map(o =>
  o ? head.map(h => cell(o[h] == null ? '' : o[h])).join(',') : head.map(() => '').join(','))).join('\n') + '\n';
const IDS = ['P0001', 'P0002', 'P0003', 'P0004', 'P0005'];
const TXT = id => '명제 본문 ' + id + ' — 빛과 소금으로 사는 제자';
const db = () => IDS.map(id => ({ '명제 ID': id, '날짜': '2026-06-21', '카테고리': '주일예배',
  '설교 제목': '언덕 위의 도시', '설교 본문': '마태복음 5:13-16', '명제': TXT(id), '대표 문구 1': '빛과 소금',
  '주제 태그': '제자도', '상황 태그': '흔들릴 때', '데이터 상태': '활성' }));
const share = ['P0004', 'P0001', 'P0003'].map(id => ({ '주제': '정체성', '상황/필요': '흔들릴 때', '명제': TXT(id),
  '본문': '마태복음 5:13-16', '묵상 질문': '오늘 나는?', '설교 제목': '언덕 위의 도시', '날짜': '2026-06-21', '명제 ID': id }));
const list = [{ '날짜': '2026-06-21', '카테고리': '주일예배', '설교 제목': '언덕 위의 도시', '영상 링크': '' }];
const ID = 'PROPDB';
const LINKS = {
  0: { name: '명제 DB', url: `https://docs.google.com/spreadsheets/d/${ID}/edit#gid=0` },
  777: { name: '성도 공유용', url: `https://docs.google.com/spreadsheets/d/${ID}/edit?gid=777#gid=777` },
  222: { name: '설교 목록', url: `https://docs.google.com/spreadsheets/d/${ID}/edit?gid=222#gid=222` },
};
const UA = {
  pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
};
// HB 의 실제 연결 순서: 명제 DB → 성도 공유용 → 설교 목록
function setup(order, ua, pid) {
  now += 3600000; timers = []; pending = []; log = []; WIN = null; BUSY = false; POPUP = true; DEV = true;
  _sheetMainCache.clear();
  navigator.userAgent = ua; navigator.maxTouchPoints = ua === UA.pc ? 0 : 5;
  SHEETS = { 0: csv(DB_HEAD, db()), 777: csv(SH_HEAD, share), 222: csv(LIST_HEAD, list) };
  const c = { id: 'c1', name: '명제집', verses: [], google: order.map(g => Object.assign({}, LINKS[g])) };
  _syncCollSheets(c, c.google.map(g => ({ g, rows: _parseCsv(SHEETS[(g.url.match(/gid=(\d+)/) || [])[1]]) })));
  COLLS = [c];
  const v = c.verses.find(x => x.pid === (pid || 'P0001'));
  CUR = { ref: v.ref, cat: v.cat, topic: v.topic, krText: v.krText, pid: v.pid };
  EL = makeEl(); _initVfCatSheet();
  log = [];
  return c;
}
const opened = () => log.filter(x => x.startsWith('열기 ')).map(x => x.slice(3));
const gidOf = u => (String(u).match(/#gid=(\d+)/) || [])[1];
const rowOf = u => +((String(u).match(/range=A(\d+):/) || [])[1] || 0);
const reads = () => log.filter(x => x.startsWith('읽기')).length;

(async () => {
  // ═══ 1. 아이폰 — 붙잡은 동안 미리 읽고, 손을 떼면 명제 DB 탭으로 (HB "아직도 성도 공유용") ═══
  console.log('시나리오 1 — 아이폰: 명제 DB 탭 번호로 넘긴다');
  {
    setup([0, 777, 222], UA.iphone, 'P0001');
    sc.eq('기억해 둔 탭은 성도 공유용이었다 (예전에 휴대폰이 넘기던 번호)', gidOf(_sheetUrlForVerse(CUR).url), '777');
    EL.fire('touchstart', at(10, 10)); tick(499);
    sc.eq('0.5초 전에는 읽지 않는다 (짧은 탭이면 헛수고)', reads(), 0);
    tick(1);
    sc.eq('토스트가 뜰 때 그 모음의 시트를 읽기 시작한다', reads(), 3);
    await done();
    EL.fire('touchend'); click();
    sc.eq('떼면 복사하고 곧장 연다', log.filter(x => x === '복사' || x.startsWith('열기')).length, 2);
    sc.eq('복사가 먼저', log.indexOf('복사') < log.findIndex(x => x.startsWith('열기')), true);
    sc.eq('명제 DB 탭 · 그 행', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 2]);
    sc.eq('기다림 토스트는 안 띄웠다 (이미 읽었다)', BUSY, false);
  }

  // ═══ 2. 아이폰 — 다 읽기 전에 손을 뗐다 ═══
  console.log('\n시나리오 2 — 아이폰: 다 읽기 전에 떼면 잠깐 기다렸다 명제 DB 로');
  {
    setup([0, 777, 222], UA.iphone, 'P0004');
    EL.fire('touchstart', at(10, 10)); tick(500);
    EL.fire('touchend'); click();
    sc.eq('복사는 떼는 순간 이미 했다', log.includes('복사'), true);
    sc.eq('아직 열지 않고 기다린다', [opened().length, BUSY], [0, true]);
    await done();
    sc.eq('다 읽으면 명제 DB 의 5행 (성도 공유용에서는 첫 줄이어도)', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 5]);
    sc.eq('기다림 토스트를 내린다', BUSY, false);
    tick(5000);
    sc.eq('늦게 두 번 열지 않는다', opened().length, 1);
  }

  // ═══ 3. 아이폰 — 시트를 못 읽으면 2.5초 뒤 기억해 둔 주소로 ═══
  console.log('\n시나리오 3 — 못 읽으면 예전 주소');
  {
    setup([0, 777, 222], UA.iphone, 'P0001');
    const stored = _sheetUrlForVerse(CUR).url;
    EL.fire('touchstart', at(10, 10)); tick(500); EL.fire('touchend'); click();
    tick(2499);
    sc.eq('2.5초까지는 기다린다', opened().length, 0);
    tick(1);
    sc.eq('2.5초가 지나면 기억해 둔 주소로', opened(), [stored]);
    await done();
    sc.eq('뒤늦게 읽혀도 두 번 열지 않는다', opened().length, 1);
    setup([0, 777, 222], UA.iphone, 'P0001');
    EL.fire('touchstart', at(10, 10)); tick(500);
    await done(true);   // 읽기 실패
    EL.fire('touchend'); click();
    await done();
    sc.eq('읽기에 실패했으면 다시 읽어 보고', reads(), 6);
    await done();
    sc.eq('그래도 명제 DB 로', gidOf(opened()[0]), '0');
  }

  // ═══ 4. 안드로이드 — 붙잡은 채로 복사하고, 다 읽으면 명제 DB 로 ═══
  console.log('\n시나리오 4 — 안드로이드도 명제 DB');
  {
    setup([0, 777, 222], UA.android, 'P0003');
    EL.fire('touchstart', at(10, 10)); tick(500);
    sc.eq('0.5초에 복사하고 읽기 시작', [log.includes('붙잡은 채 복사'), reads()], [true, 3]);
    await done();
    sc.eq('명제 DB 의 4행', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 4]);
  }

  // ═══ 5. PC — 커서를 올릴 때 미리 읽어 두면 우클릭에 곧장 ═══
  console.log('\n시나리오 5 — PC: 커서를 올리면 미리 읽고 우클릭에 곧장');
  {
    setup([0, 777, 222], UA.pc, 'P0001');
    EL.fire('mouseenter');
    sc.eq('커서를 올리면 읽기 시작', reads(), 3);
    await done();
    EL.fire('contextmenu');
    sc.eq('새 탭을 미리 띄울 필요 없이 곧장 연다', WIN, null);
    sc.eq('명제 DB 탭 · 그 행', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 2]);
    // 1분 안에 같은 모음의 다른 명제 — 다시 읽지 않는다
    log = []; CUR = Object.assign({}, CUR, { pid: 'P0004', krText: TXT('P0004') });
    EL.fire('mouseenter'); EL.fire('contextmenu');
    sc.eq('1분 안에는 다시 읽지 않는다', [reads(), gidOf(opened()[0]), rowOf(opened()[0])], [0, '0', 5]);
    tick(61000); log = [];
    EL.fire('mouseenter');
    sc.eq('1분이 지나면 새로 읽는다', reads(), 3);
  }

  // ═══ 6. PC — 커서를 안 올리고 곧장 우클릭 (v16 길) ═══
  console.log('\n시나리오 6 — PC: 미리 못 읽었으면 새 탭을 먼저 띄우고 다 읽으면 넘긴다');
  {
    setup([0, 777, 222], UA.pc, 'P0004');
    EL.fire('contextmenu');
    sc.eq('새 탭을 먼저 띄운다', !!WIN, true);
    await done();
    sc.eq('명제 DB 의 5행으로 넘긴다', [gidOf(WIN.url), rowOf(WIN.url)], ['0', 5]);
    sc.eq('새 탭과 이 앱의 끈을 끊는다', WIN.opener, null);
    setup([0, 777, 222], UA.pc, 'P0001');
    POPUP = false;
    EL.fire('contextmenu');
    sc.eq('새 탭이 막히면 기억해 둔 주소로 (예전 길)', gidOf(opened()[0]), '777');
  }

  // ═══ 7. 연결 순서 · 동기화 뒤 줄 끼움 · 시트에서 사라짐 ═══
  console.log('\n시나리오 7 — 순서가 달라도 · 줄을 끼워도 · 사라졌으면');
  {
    setup([777, 0, 222], UA.iphone, 'P0003');
    EL.fire('touchstart', at(10, 10)); tick(500); await done(); EL.fire('touchend'); click();
    sc.eq('성도 공유용을 먼저 연결했어도 명제 DB 의 4행', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 4]);
    setup([0, 777, 222], UA.pc, 'P0004');
    SHEETS[0] = csv(DB_HEAD, [{ '명제 ID': 'P0101', '명제': '새 명제 1', '데이터 상태': '활성' },
      { '명제 ID': 'P0102', '명제': '새 명제 2', '데이터 상태': '활성' }, null].concat(db()));
    EL.fire('mouseenter'); await done(); EL.fire('contextmenu');
    sc.eq('동기화 뒤 맨 위에 줄 셋을 끼워도 지금 행(8)', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 8]);
    setup([0, 777, 222], UA.iphone, 'P0002');
    const stored = _sheetUrlForVerse(CUR).url;
    SHEETS[0] = csv(DB_HEAD, db().filter(o => o['명제 ID'] !== 'P0002'));
    EL.fire('touchstart', at(10, 10)); tick(500); await done(); EL.fire('touchend'); click();
    sc.eq('시트에서 지워진 명제는 기억해 둔 주소로', opened(), [stored]);
  }

  // ═══ 8. 말씀은 그대로 ═══
  console.log('\n시나리오 8 — 말씀은 읽지 않고 기억한 행으로');
  {
    setup([0, 777, 222], UA.iphone, 'P0001');
    const vc = { id: 'cv', name: '암송', verses: [{ ref: '요한복음 3:16', cat: '주일예배', topic: '사랑', krText: '하나님이 세상을',
      src: 'google', gid: 'gv', row: 7 }], google: [{ id: 'gv', url: 'https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5' }] };
    COLLS = [vc]; CUR = { ref: '요한복음 3:16', cat: '주일예배', topic: '사랑', krText: '하나님이 세상을', pid: '' };
    EL.fire('touchstart', at(10, 10)); tick(500); EL.fire('touchend'); click();
    sc.eq('읽지 않고 곧장', [reads(), opened()], [0, ['https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5&range=A7:G7']]);
  }

  // ═══ 9. 휴대폰 — 명제를 띄우면 미리 읽어 두어, 손을 떼는 click 안에서 곧장 넘어간다 ═══
  // 손을 뗀 뒤 1~2초 지나서 넘기면 아이폰은 그 이동을 사용자가 한 것으로 보지 않아
  // 막거나 '열까요?' 를 물을 수 있다 — 그래서 붙잡기 전에 읽어 둔다.
  console.log('\n시나리오 9 — 휴대폰: 명제를 띄우면 미리 읽기 (손을 떼는 순간 곧장)');
  {
    sc.eq('전체화면을 그리고 1초 머물면 미리 읽는다',
      /_warmTimer=setTimeout\(\(\)=>\{if\(_verseFullIsOpen\(\)\)_sheetMainWarm\(_vfCurrentVerse\(\)\);\},1000\)/
        .test(slice('function _verseFullRender(', '// ── 장절 줄')), true);
    setup([0, 777, 222], UA.iphone, 'P0004');
    _sheetMainWarm(CUR);
    sc.eq('명제를 띄우면 그 모음의 시트를 읽는다', reads(), 3);
    await done();
    log = [];
    EL.fire('touchstart', at(10, 10)); tick(500);
    sc.eq('붙잡을 때는 다시 읽지 않는다 (이미 있다)', reads(), 0);
    EL.fire('touchend'); click();
    sc.eq('떼는 click 안에서 곧장 — 명제 DB 의 5행', [gidOf(opened()[0]), rowOf(opened()[0])], ['0', 5]);
    sc.eq('기다림 토스트도 없다', log.some(x => x.startsWith('기다림')), false);
    // 휴대폰은 10분 들고 있다 — 시트 앱은 탭 번호만 따르므로 행이 좀 낡아도 탈이 없다
    tick(9 * 60000); log = [];
    _sheetMainWarm(CUR);
    sc.eq('9분 뒤에 다시 띄워도 다시 읽지 않는다', reads(), 0);
    tick(61000); log = [];
    _sheetMainWarm(CUR);
    sc.eq('10분이 지나면 새로 읽는다', reads(), 3);
    // 안드로이드도 같다 — 0.5초에 붙잡은 채로 넘어가는데, 그때 이미 주소가 있다
    setup([0, 777, 222], UA.android, 'P0003');
    _sheetMainWarm(CUR); await done(); log = [];
    EL.fire('touchstart', at(10, 10)); tick(500);
    sc.eq('안드로이드 — 0.5초에 곧장 명제 DB 의 4행', [reads(), gidOf(opened()[0]), rowOf(opened()[0])], [0, '0', 4]);
    // 미리 읽지 않는 경우
    setup([0, 777, 222], UA.pc, 'P0001');
    _sheetMainWarm(CUR);
    sc.eq('PC 는 띄울 때 읽지 않는다 (커서를 올릴 때 읽는다 · 1분)', reads(), 0);
    setup([0, 777, 222], UA.iphone, 'P0001');
    DEV = false; _sheetMainWarm(CUR);
    sc.eq('개발자 계정이 아니면 읽지 않는다 (이 기능 자체가 HB 전용)', reads(), 0);
    DEV = true;
    _sheetMainWarm({ ref: '요한복음 3:16', cat: '주일예배', krText: '하나님이 세상을', pid: '' });
    sc.eq('말씀은 읽지 않는다', reads(), 0);
    _sheetMainWarm(null);
    sc.eq('띄운 것이 없어도 탈이 없다', reads(), 0);
  }

  sc.done();
})();
