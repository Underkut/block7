// 알림 → 전체화면 열기 (v26-0803-5 전면 재작성)
//
// 여러 번 재발한 영역이라 "실패했던 경로"를 시나리오로 못 박는다.
// 이 테스트가 깨지면 아래 증상 중 하나가 반드시 되살아난다.
//
//  8-4-1 전체화면 A 를 보는 중에 온 알림 B 를 눌러도 아무 반응 없음
//  8-4-2 다른 앱에 있다가 알림 B 를 눌러도 기존 A 가 그대로
//  8-4-3 A 를 닫고 다시 눌러도 이제는 앱 기본 화면만 (기록이 이미 지워져서)
//  8-4-5 그 뒤로 계속 예전 전체화면만 유지
//  + 같은 장절 알림이 다시 와도 5초 안이면 무시되던 문제
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 브라우저 흉내 ──
let NOW = 1000000;
global.Date = class extends Date { static now(){ return NOW; } };
const timers = [];
global.setTimeout = (fn, ms) => { timers.push({ fn, at: NOW + (ms || 0) }); return timers.length; };
global.clearTimeout = () => {};
// 예약된 타이머를 시간 순으로 흘려보낸다
function runTimers(limit = 200) {
  for (let i = 0; i < limit; i++) {
    const t = timers.filter(x => !x.done).sort((a, b) => a.at - b.at)[0];
    if (!t) return;
    t.done = true;
    NOW = Math.max(NOW, t.at);
    t.fn();
  }
}

// ── 앱 상태 흉내 ──
let SCREEN = { open: false, ref: '' };   // 지금 전체화면에 떠 있는 것
let PENDING = null;                      // 서비스워커가 남긴 전달용 기록
let LOG = [];
let VERSES = [];
let RENDER_LAG = 0;                      // 렌더가 n번 늦게 반영되는 기기 흉내

global._vfOverrideVerse = null;
global._vfNotifRestore = null;
global._notifLog = m => LOG.push(String(m));
global._clearPendingVerse = () => { PENDING = null; };
global._vfNotifHideCovers = () => null;
global._verseFullIsOpen = () => SCREEN.open;
global._vfCurrentVerse = () => (SCREEN.open ? { ref: SCREEN.ref } : null);
global._findVerseByRefLoose = ref => VERSES.find(v => _refNorm(v.ref) === _refNorm(ref)) || null;
let pendingPaint = null;
global.openVerseFull = () => { SCREEN.open = true; pendingPaint = _vfOverrideVerse; };
global._verseFullRender = () => {
  if (RENDER_LAG > 0) { RENDER_LAG--; return; }        // 이번엔 아직 안 그려짐
  if (pendingPaint) SCREEN.ref = pendingPaint.ref;
};

// 실제 코드에서 장절 정규화 + 알림 열기 엔진을 떠온다
eval(slice('const _REF_ABBR2FULL=', 'function _findVerseByRefLoose'));
eval(slice('let _notifTarget=null;', '// ③ 서비스워커가 남긴 기록 읽기'));

function reset(verses) {
  NOW += 100000;
  timers.length = 0;
  SCREEN = { open: false, ref: '' };
  PENDING = null; LOG = []; RENDER_LAG = 0; pendingPaint = null;
  _vfOverrideVerse = null;
  _notifStop(); _notifDoneTok = 0;
  VERSES = verses.map(r => ({ ref: r }));
}
// 서비스워커가 알림 탭을 처리한 것처럼 — 기록을 남기고 토큰을 돌려준다
function tapNotification(ref) { const tok = ++NOW; PENDING = { ref, ts: tok }; return tok; }

// ═══ 1. 기본: 알림을 누르면 그 말씀이 뜨고 기록이 지워진다 ═══
console.log('시나리오 1 — 알림 하나를 누른다');
{
  reset(['요한복음 1:18', '로마서 8:14']);
  const tok = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', tok);
  runTimers();
  sc.eq('그 말씀이 떠 있다', SCREEN.ref, '요한복음 1:18');
  sc.eq('전달용 기록이 지워졌다', PENDING, null);
}

// ═══ 2. 8-4-1/8-4-2: 이미 다른 말씀 전체화면을 보는 중에 새 알림 ═══
console.log('\n시나리오 2 — 전체화면 A 를 보는 중에 알림 B (8-4-1·8-4-2)');
{
  reset(['요한복음 1:18', '로마서 8:14']);
  const t1 = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', t1);
  runTimers();
  sc.eq('먼저 A 가 떠 있다', SCREEN.ref, '요한복음 1:18');

  const t2 = tapNotification('로마서 8:14');
  _openVerseByRef('로마서 8:14', 'SW 메시지', t2);
  runTimers();
  sc.eq('새 말씀 B 로 바뀐다', SCREEN.ref, '로마서 8:14');
  sc.eq('B 의 기록도 지워졌다', PENDING, null);
}

// ═══ 3. 8-4-3의 핵심: 안 떴으면 기록을 지우면 안 된다 ═══
// 렌더가 늦어 첫 시도에 안 그려져도, 재시도로 반드시 따라잡아야 한다.
console.log('\n시나리오 3 — 렌더가 늦는 기기에서도 끝내 열린다 (8-4-3)');
{
  reset(['요한복음 1:18', '로마서 8:14']);
  const t1 = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', t1);
  runTimers();

  RENDER_LAG = 3;                        // 세 번은 그려지지 않는 상황
  const t2 = tapNotification('로마서 8:14');
  _openVerseByRef('로마서 8:14', '남긴 기록', t2);
  runTimers();
  sc.eq('재시도 끝에 B 가 떴다', SCREEN.ref, '로마서 8:14');
  sc.eq('확인된 뒤에야 기록을 지운다', PENDING, null);
}

// ═══ 4. 끝내 못 열면 기록을 남겨 둔다 (다음 폴링이 다시 집어가도록) ═══
console.log('\n시나리오 4 — 끝내 못 열면 기록을 남긴다');
{
  reset(['요한복음 1:18']);
  RENDER_LAG = 999;                      // 아무리 해도 안 그려지는 상황
  const tok = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', tok);
  runTimers();
  sc.eq('전체화면이 확인되지 않았다', SCREEN.ref, '');
  sc.eq('기록은 지우지 않고 남겨 둔다', PENDING && PENDING.ref, '요한복음 1:18');
}

// ═══ 5. 같은 장절이 다시 와도 새 알림이면 열린다 (옛 5초 무시 버그) ═══
console.log('\n시나리오 5 — 같은 장절 알림이 연속으로 와도 매번 연다');
{
  reset(['요한복음 1:18', '로마서 8:14']);
  const t1 = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', t1);
  runTimers();
  // 사용자가 닫고, 곧바로 같은 장절 알림이 또 온다
  SCREEN = { open: false, ref: '' };
  const t2 = tapNotification('요한복음 1:18');
  const started = _openVerseByRef('요한복음 1:18', '남긴 기록', t2);
  runTimers();
  sc.eq('새 알림이므로 다시 연다', started, true);
  sc.eq('같은 말씀이 다시 떴다', SCREEN.ref, '요한복음 1:18');
}

// ═══ 6. 같은 알림이 여러 통로로 동시에 와도 한 번만 처리 ═══
console.log('\n시나리오 6 — 메시지·브로드캐스트·기록이 동시에 들어와도 한 번만');
{
  reset(['요한복음 1:18']);
  const tok = tapNotification('요한복음 1:18');
  const a = _openVerseByRef('요한복음 1:18', 'SW 메시지', tok);
  const b = _openVerseByRef('요한복음 1:18', '브로드캐스트', tok);
  const c = _openVerseByRef('요한복음 1:18', '남긴 기록', tok);
  runTimers();
  sc.eq('첫 통로만 시작한다', [a, b, c], [true, false, false]);
  sc.eq('말씀은 정상적으로 떴다', SCREEN.ref, '요한복음 1:18');
  const opens = LOG.filter(m => m.indexOf('열기 시작') >= 0).length;
  sc.eq('열기 시작은 한 번만', opens, 1);
}

// ═══ 7. 처리 끝난 알림은 폴링이 다시 집어가도 무시 ═══
console.log('\n시나리오 7 — 이미 처리한 알림은 폴링이 다시 열지 않는다');
{
  reset(['요한복음 1:18']);
  const tok = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', tok);
  runTimers();
  SCREEN = { open: false, ref: '' };                 // 사용자가 닫았다
  const again = _openVerseByRef('요한복음 1:18', '남긴 기록', tok);  // 같은 토큰
  runTimers();
  sc.eq('같은 토큰은 다시 열지 않는다', again, false);
  sc.eq('닫은 화면을 억지로 되살리지 않는다', SCREEN.open, false);
}

// ═══ 8. 표기가 달라도 같은 구절로 알아본다 ═══
console.log('\n시나리오 8 — 장절 표기가 달라도 확인된다');
{
  reset(['요한복음 1:18']);
  const tok = tapNotification('요1:18');             // 약칭으로 온 알림
  _openVerseByRef('요1:18', '남긴 기록', tok);
  runTimers();
  sc.eq('정식 표기 구절이 떴다', SCREEN.ref, '요한복음 1:18');
  sc.eq('확인되어 기록이 지워졌다', PENDING, null);
}

// ═══ 9. 목록에 없는 장절이면 조용히 포기하고 기록도 정리 대상이 아니다 ═══
console.log('\n시나리오 9 — 목록에 없는 장절');
{
  reset(['요한복음 1:18']);
  const tok = tapNotification('창세기 1:1');
  _openVerseByRef('창세기 1:1', '남긴 기록', tok);
  runTimers();
  sc.eq('전체화면은 열리지 않는다', SCREEN.open, false);
  sc.eq('못 찾았다고 기록에 남긴다', LOG.some(m => m.indexOf('못 찾아') >= 0), true);
}

// ═══ 10. 앱이 알림으로 "막 켜지는" 중 — 말씀 목록이 아직 없다 ═══
// 종료 상태에서 알림을 눌러 앱이 시작되면, 클라우드에서 말씀을 받아오기 전이라
// 그 순간엔 목록이 비어 있다. 한 번 만에 포기하면 "앱만 뜨고 전체화면은 안 뜸"이 된다.
console.log('\n시나리오 10 — 앱이 막 켜지는 중이라 말씀 목록이 아직 없음');
{
  reset([]);                                   // 아직 말씀 목록이 비어 있다
  const tok = tapNotification('요한복음 1:18');
  _openVerseByRef('요한복음 1:18', '남긴 기록', tok);
  // 몇 차례 시도하는 동안 목록이 뒤늦게 준비된다
  const t = timers.filter(x => !x.done).sort((a, b) => a.at - b.at)[0];
  if (t) { t.done = true; NOW = t.at; t.fn(); }        // 1차 시도 — 아직 없음
  sc.eq('아직 안 열렸다', SCREEN.open, false);
  sc.eq('여기서 포기하지 않는다', timers.some(x => !x.done), true);
  VERSES = [{ ref: '요한복음 1:18' }];                  // 이제 목록이 도착
  runTimers();
  sc.eq('목록이 준비되자 열린다', SCREEN.ref, '요한복음 1:18');
  sc.eq('확인 후 기록을 지운다', PENDING, null);
}

// ═══ 11. 끝까지 목록에 없으면 그때는 포기한다 (무한 재시도 방지) ═══
console.log('\n시나리오 11 — 끝까지 없으면 포기');
{
  reset([]);
  const tok = tapNotification('창세기 1:1');
  _openVerseByRef('창세기 1:1', '남긴 기록', tok);
  runTimers();
  sc.eq('전체화면은 열리지 않는다', SCREEN.open, false);
  sc.eq('여러 번 시도한 뒤 포기했다고 남긴다',
    LOG.some(m => m.indexOf('못 찾아') >= 0 && m.indexOf('번 시도') >= 0), true);
  sc.eq('남은 타이머가 없다 (무한 재시도 아님)', timers.some(x => !x.done), false);
}

sc.done();
