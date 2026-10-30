// 반복(일정·할일)의 범위 고르기 — 이것만 / 이번 및 이후 / 모두
//
// 구글 캘린더(iCalendar RFC 5545)와 같은 모양을 쓴다:
//   · 규칙(RRULE)   — 언제 되풀이되나
//   · 끝날(UNTIL)   — rep.until. '이후 모두' 가 여기를 채운다
//   · 뺀 날(EXDATE) — rep.ex[]. '이 날만 삭제' 가 여기에 쌓인다
//   · 하루만 고친 것 — 그 날짜에 따로 서는 항목(rid 로만 묶음에 매여 있다)
//
// ⚠️ 저장 계층(ST.days)에 쓰는 기능이다. 한 걸음마다 확인한다 —
//    특히 "원본을 지우면 묶음이 통째로 사라진다"는 성질(시나리오 2-2).
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const RULE = slice('function _repRule(rep){', 'function getDisplayEvents(k,secId){');
// 하위·메모를 실어 나르는 순수 함수 — _movedTaskCopy·_freshTaskCopy 등
// 항목을 새로 만드는 자리들이 모두 이것을 쓴다 (tests/test_subtask.js 가 규칙을 지킨다)
const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
const TASK = SUBHELP + '\n' + slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days,toSec,markDone){');

function makeEnv(days, todayK, extra) {
  const ST = { days: days || {} };
  const SECS = [{ id: 'am' }, { id: 'pm' }];
  const log = { toasts: [], trash: [] };
  const env = {
    ST, SECS,
    z: n => String(n).padStart(2, '0'),
    todayKey: () => todayK,
    weekOfMonth: d => Math.ceil(d.getDate() / 7),
    getDay: k => {
      if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} };
      if (!ST.days[k].events) ST.days[k].events = {};
      return ST.days[k];
    },
    tKey: () => todayK,
    rawSave() {}, save() {}, beforeSave() {},
    sendToTrash: (k, type, secId, it) => log.trash.push({ k, type, secId, it }),
    renderSecBody() {}, renderSmList() {}, updateTotal() {}, updateSmCnt() {},
    renderSecEvents() {}, refreshTaskViewsLive() {}, renderToday() {},
    showToast: t => log.toasts.push(t),
    esc: s => String(s || ''),
    _sortEventsKeepingTimeless: a => a,
    _eventModalSecId: null,
    document: { getElementById: () => null },
  };
  Object.assign(env, extra || {});   // 시나리오마다 갈아끼울 것 (_secIdForTime · _gcalCfg)
  env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  env.getEvents = (k, id) => { const d = env.getDay(k); if (!d.events[id]) d.events[id] = []; return d.events[id]; };

  const names = Object.keys(env);
  const body = RULE + '\n' + TASK + '\nreturn {' +
    ['_repBlocked', '_dayKeyBefore', '_newRid', '_repRule',
     'eventRepeatsOnDate', 'eventOccursOnOwnDate',
     '_taskRepDefault', '_isRepRoot', '_taskRepRoots', '_taskRepRootOf', '_taskRepInstances',
     '_migrateTaskRepeats', 'materializeRepeatsFor', 'ensureDailyRepeats', 'ensureRepeatsForView',
     'getDisplayTasks', '_repPurgeTasks', '_repPurgeEvents', '_repAddEx', '_repHiddenOn',
     '_evRepRootOf', '_evInSeries', '_evEditApply', '_evDeleteApply',
     '_evMoveApply', '_evScopeRows', '_evMd', '_evSecFor', '_evGcalNote',
     '_taskDeleteApply', '_taskTextApply',
     '_taskRepWeekly', '_repKindOf', '_taskSetRepeat'].join(',') + '};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api, log };
}
const rep = over => Object.assign({ daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] }, over || {});
const api0weekly = () => ({ daily: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: true, weeksOfMonth: [1, 2, 3, 4, 5] });
const bigsOn = (ST, k, sec) => ((ST.days[k] && ST.days[k].big && ST.days[k].big[sec]) || []).map(b => b.text);
const T = '2026-09-11';

console.log('시나리오 1 — 앞날을 열면 그 날의 반복 할일이 생긴다');
{
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView('2026-09-13');
  sc.eq('모레 칸에 생긴다', bigsOn(ST, '2026-09-13', 'am'), ['성경읽기']);
  sc.eq('묶음 이름표를 물려받는다', ST.days['2026-09-13'].big.am[0].rid, 'r1');
  sc.eq('안 한 상태로 생긴다', ST.days['2026-09-13'].big.am[0].done, false);
  sc.eq('규칙은 원본만 갖는다', ST.days['2026-09-13'].big.am[0].repeat, undefined);
  api.ensureRepeatsForView('2026-09-13');
  sc.eq('다시 열어도 겹쳐 쌓이지 않는다', bigsOn(ST, '2026-09-13', 'am').length, 1);
}

console.log('\n시나리오 2 — 이 날짜만 지우기 (EXDATE)');
{
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView('2026-09-12');
  api.ensureRepeatsForView('2026-09-13');
  // 12일의 실체를 '이 할일만' 으로 지운다 (오늘이 12일인 것처럼)
  const e2 = makeEnv(ST.days, '2026-09-12');
  e2.api._taskDeleteApply('big', 'am', 0, 'one');
  sc.eq('그 날에서는 사라진다', bigsOn(ST, '2026-09-12', 'am'), []);
  sc.eq('뺀 날로 적힌다', ST.days[T].big.am[0].repeat.ex, ['2026-09-12']);
  sc.eq('다시 열어도 되살아나지 않는다',
        (e2.api.ensureRepeatsForView('2026-09-12'), bigsOn(ST, '2026-09-12', 'am')), []);
  sc.eq('다른 날은 그대로', bigsOn(ST, '2026-09-13', 'am'), ['성경읽기']);
}

console.log('\n시나리오 2-2 — 원본이 있는 날을 "이것만" 지워도 묶음은 살아 있다');
{
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api._taskDeleteApply('big', 'am', 0, 'one');
  sc.eq('원본은 지워지지 않는다 (규칙을 들고 있다)', ST.days[T].big.am.length, 1);
  sc.eq('대신 그 날은 감춘다', api._repHiddenOn(ST.days[T].big.am[0], T), true);
  api.ensureRepeatsForView('2026-09-12');
  sc.eq('다음 날은 그대로 생긴다', bigsOn(ST, '2026-09-12', 'am'), ['성경읽기']);
}

console.log('\n시나리오 3 — 이번 및 이후 지우기 (UNTIL)');
{
  const { ST, api } = makeEnv({
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView(T);
  api.ensureRepeatsForView('2026-09-12');
  const e = makeEnv(ST.days, T);
  e.api._taskDeleteApply('big', 'am', 0, 'future');
  sc.eq('오늘 것이 사라진다', bigsOn(ST, T, 'am'), []);
  sc.eq('앞날에 이미 만들어 둔 것도 사라진다', bigsOn(ST, '2026-09-12', 'am'), []);
  sc.eq('지난 기록은 남는다', bigsOn(ST, '2026-09-09', 'am'), ['성경읽기']);
  sc.eq('끝날이 전날로 잡힌다', ST.days['2026-09-09'].big.am[0].repeat.until, '2026-09-10');
  e.api.ensureRepeatsForView('2026-09-20');
  sc.eq('끝난 뒤로는 더 생기지 않는다', bigsOn(ST, '2026-09-20', 'am'), []);
}

console.log('\n시나리오 4 — 모두 지우기');
{
  const { ST, api } = makeEnv({
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView(T);
  const e = makeEnv(ST.days, T);
  e.api._taskDeleteApply('big', 'am', 0, 'all');
  sc.eq('오늘 것도', bigsOn(ST, T, 'am'), []);
  sc.eq('지난 기록도 사라진다', bigsOn(ST, '2026-09-09', 'am'), []);
  e.api.ensureRepeatsForView('2026-09-20');
  sc.eq('앞날에도 더 생기지 않는다', bigsOn(ST, '2026-09-20', 'am'), []);
}

console.log('\n시나리오 5 — 지난 날짜에는 실체를 만들지 않는다');
{
  const { ST, api } = makeEnv({
    '2026-09-01': { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView('2026-09-05');
  sc.eq('지난 날짜는 비어 있다', bigsOn(ST, '2026-09-05', 'am'), []);
  api.ensureRepeatsForView(T);
  sc.eq('오늘부터는 생긴다', bigsOn(ST, T, 'am'), ['성경읽기']);
}

console.log('\n시나리오 6 — 글자 고치기: 이 날짜만 / 이후 / 모두');
{
  // 이 날짜만 (실체를 고친 경우) — 묶음에서 떨어져 나온다
  const a = makeEnv({
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  a.api.ensureRepeatsForView(T);
  a.ST.days[T].big.am[0].text = '성경읽기(오늘만)';
  a.api._taskTextApply('big', 'am', 0, '성경읽기', '성경읽기(오늘만)', 'one');
  sc.eq('오늘 것만 바뀐다', bigsOn(a.ST, T, 'am'), ['성경읽기(오늘만)']);
  sc.eq('묶음에서 떨어진다', a.ST.days[T].big.am[0].rid, undefined);
  sc.eq('원본 글자는 그대로', a.ST.days['2026-09-09'].big.am[0].text, '성경읽기');

  // 이후 모두 — 원본은 끊기고 오늘부터 새 묶음
  const b = makeEnv({
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  b.api.ensureRepeatsForView(T);
  b.ST.days[T].big.am[0].text = '성경 두 장';
  b.api._taskTextApply('big', 'am', 0, '성경읽기', '성경 두 장', 'future');
  sc.eq('옛 묶음은 어제까지', b.ST.days['2026-09-09'].big.am[0].repeat.until, '2026-09-10');
  sc.eq('오늘 것이 새 원본이 된다', !!b.ST.days[T].big.am[0].repeat, true);
  sc.eq('새 이름표를 받는다', b.ST.days[T].big.am[0].rid !== 'r1', true);
  b.api.ensureRepeatsForView('2026-09-14');
  sc.eq('앞날에는 새 글자로 생긴다', bigsOn(b.ST, '2026-09-14', 'am'), ['성경 두 장']);
  sc.eq('지난 기록은 옛 글자 그대로', b.ST.days['2026-09-09'].big.am[0].text, '성경읽기');

  // 모두 — 오늘 이후 전부 바뀐다 (지난 기록은 그대로)
  const c = makeEnv({
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  c.api.ensureRepeatsForView(T);
  c.api.ensureRepeatsForView('2026-09-12');
  c.ST.days[T].big.am[0].text = '성경 두 장';
  c.api._taskTextApply('big', 'am', 0, '성경읽기', '성경 두 장', 'all');
  sc.eq('원본 글자가 바뀐다', c.ST.days['2026-09-09'].big.am[0].text, '성경 두 장');
  sc.eq('이미 만들어 둔 앞날 것도 바뀐다', bigsOn(c.ST, '2026-09-12', 'am'), ['성경 두 장']);
}

console.log('\n시나리오 7 — 요일을 고른 반복 (화·목만)');
{
  // 2026-09-11 은 금요일. 화(2)·목(4) 만 고르면 다음은 15일(화)
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '운동', done: false, daily: true, rid: 'r1', repeat: rep({ daysOfWeek: [2, 4] }) }] }, small: {}, trash: [], events: {} }
  }, T);
  ['2026-09-12', '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-17'].forEach(k => api.ensureRepeatsForView(k));
  sc.eq('토요일엔 없다', bigsOn(ST, '2026-09-12', 'am'), []);
  sc.eq('월요일엔 없다', bigsOn(ST, '2026-09-14', 'am'), []);
  sc.eq('화요일엔 있다', bigsOn(ST, '2026-09-15', 'am'), ['운동']);
  sc.eq('목요일엔 있다', bigsOn(ST, '2026-09-17', 'am'), ['운동']);
}

console.log('\n시나리오 8 — 옛 자료 옮겨심기 (daily 플래그만 있던 것)');
{
  const { ST, api } = makeEnv({
    '2026-09-08': { big: { am: [{ text: '성경읽기', done: true, daily: true }] }, small: {}, trash: [], events: {} },
    '2026-09-09': { big: { am: [{ text: '성경읽기', done: true, daily: true }] }, small: {}, trash: [], events: {} },
    '2026-09-10': { big: {}, small: {}, trash: [], events: {} }   // 넘겨보기만 해서 생긴 껍데기
  }, T);
  api._migrateTaskRepeats();
  const r9 = ST.days['2026-09-09'].big.am[0], r8 = ST.days['2026-09-08'].big.am[0];
  sc.eq('가장 최근 것이 원본이 된다', !!r9.repeat, true);
  sc.eq('지난 것은 원본이 아니다', !!r8.repeat, false);
  sc.eq('둘은 같은 묶음', r8.rid === r9.rid && !!r9.rid, true);
  api.ensureRepeatsForView(T);
  sc.eq('빈 껍데기를 건너뛰고 오늘 생긴다', bigsOn(ST, T, 'am'), ['성경읽기']);
}

console.log('\n시나리오 9 — 일정: 이 날짜만 지우기·고치기');
{
  const mk = () => ({
    '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep() }] } }
  });
  // 이 날짜만 지우기 → 뺀 날에 적힌다
  const a = makeEnv(mk(), T);
  a.api._evDeleteApply({ dateKey: '2026-09-09', idx: 0, secId: 'am', occ: T }, 'one');
  sc.eq('원본은 남는다', a.ST.days['2026-09-09'].events.am.length, 1);
  sc.eq('오늘이 뺀 날로 적힌다', a.ST.days['2026-09-09'].events.am[0].repeat.ex, [T]);
  sc.eq('오늘은 안 비친다', a.api.eventRepeatsOnDate(a.ST.days['2026-09-09'].events.am[0], '2026-09-09', T), false);
  sc.eq('내일은 비친다', a.api.eventRepeatsOnDate(a.ST.days['2026-09-09'].events.am[0], '2026-09-09', '2026-09-12'), true);

  // 이 날짜만 고치기 → 그 날에 따로 서는 일정이 생긴다
  const b = makeEnv(mk(), T);
  b.api._evEditApply({ text: '기도회(장소 변경)', time: '10:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'one');
  sc.eq('그 날에 따로 선다', (b.ST.days[T].events.am || []).map(e => e.text), ['기도회(장소 변경)']);
  sc.eq('따로 선 것은 규칙이 없다', b.ST.days[T].events.am[0].repeat, undefined);
  sc.eq('같은 묶음으로 이어져 있다', b.ST.days[T].events.am[0].rid, 'r1');
  sc.eq('원본 글자는 그대로', b.ST.days['2026-09-09'].events.am[0].text, '기도회');
  sc.eq('원본은 그 날을 뺀다', b.ST.days['2026-09-09'].events.am[0].repeat.ex, [T]);
}

console.log('\n시나리오 10 — 일정: 이번 및 이후 고치기 (묶음이 갈라진다)');
{
  const { ST, api } = makeEnv({
    '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep() }] } }
  }, T);
  api._evEditApply({ text: '기도회(새벽)', time: '06:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'future');
  sc.eq('옛 묶음은 어제까지', ST.days['2026-09-09'].events.am[0].repeat.until, '2026-09-10');
  sc.eq('오늘부터 새 원본', (ST.days[T].events.am || []).map(e => e.text), ['기도회(새벽)']);
  sc.eq('새 원본은 규칙을 갖는다', !!ST.days[T].events.am[0].repeat, true);
  sc.eq('새 이름표', ST.days[T].events.am[0].rid !== 'r1', true);
  sc.eq('옛 원본 글자는 그대로', ST.days['2026-09-09'].events.am[0].text, '기도회');
}

console.log('\n시나리오 11 — 일정: 모두 고치기·모두 지우기');
{
  const { ST, api } = makeEnv({
    '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep() }] } }
  }, T);
  api._evEditApply({ text: '연합 기도회', time: '09:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'all');
  sc.eq('원본이 바뀐다', ST.days['2026-09-09'].events.am[0].text, '연합 기도회');
  api._evDeleteApply({ dateKey: '2026-09-09', idx: 0, secId: 'am', occ: T }, 'all');
  sc.eq('모두 지우면 원본이 사라진다', ST.days['2026-09-09'].events.am.length, 0);
}

console.log('\n시나리오 12 — 끝날·뺀 날은 규칙을 다시 저장해도 잃지 않는다');
{
  const { ST, api } = makeEnv({
    '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep({ ex: ['2026-09-12'] }) }] } }
  }, T);
  // 규칙만 담긴(끝날·뺀 날 없는) 새 규칙으로 '모두 고치기'
  api._evEditApply({ text: '기도회', time: '09:30', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'all');
  sc.eq('뺀 날이 살아 있다', ST.days['2026-09-09'].events.am[0].repeat.ex, ['2026-09-12']);
}

console.log('\n시나리오 12-2 — 모두 고치기는 하루만 고쳐 둔 날을 원래 자리로 돌린다 (구글과 같다, HB 2026-10-24)');
{
  // 오늘 하루만 고친 뒤(따로 선 일정 + 원본의 뺀 날) '모두 고치기' → 따로 선 것은 사라지고 그 날은 다시 원본이 비친다
  // 사람이 '이 날만 지움' 한 날(2026-09-12)은 그대로 빠져 있어야 한다
  const { ST, api } = makeEnv({
    '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep({ ex: ['2026-09-12'] }) }] } }
  }, T);
  api._evEditApply({ text: '기도회(장소 변경)', time: '10:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'one');
  sc.eq('하루만 고치면 그 날이 뺀 날에 든다', ST.days['2026-09-09'].events.am[0].repeat.ex.slice().sort(), ['2026-09-12', T].sort());
  api._evEditApply({ text: '연합 기도회', time: '09:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'all');
  sc.eq('따로 선 것은 사라진다', (ST.days[T].events.am || []).length, 0);
  sc.eq('그 날은 뺀 날에서 풀린다 · 사람이 지운 날은 그대로', ST.days['2026-09-09'].events.am[0].repeat.ex, ['2026-09-12']);
  sc.eq('그 날에 다시 원본이 비친다', api.eventRepeatsOnDate(ST.days['2026-09-09'].events.am[0], '2026-09-09', T), true);
}

console.log('\n시나리오 12-3 — 하루만·이후 모두 고친 것은 원본의 구글 캘린더를 물려받는다 (HB 2026-10-24)');
{
  const mkG = () => ({ '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep(), g: { c: 'church', i: 'b7eve1', u: 'u', h: 'h', d: 60 } }] } } });
  const a = makeEnv(mkG(), T);
  a.api._evEditApply({ text: '기도회(장소 변경)', time: '10:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'one');
  sc.eq('하루만 고친 것 → 원본 캘린더', a.ST.days[T].events.am[0].gc, 'church');
  sc.eq('따로 선 것은 고리를 갖지 않는다 (새로 넣는다)', a.ST.days[T].events.am[0].g, undefined);
  const b = makeEnv(mkG(), T);
  b.api._evEditApply({ text: '기도회(새벽)', time: '06:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'future');
  sc.eq('이후 모두 → 새 묶음도 원본 캘린더', b.ST.days[T].events.am[0].gc, 'church');
  const c = makeEnv({ '2026-09-09': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep() }] } } }, T);
  c.api._evEditApply({ text: '기도회(장소 변경)', time: '10:00', repeat: rep(), secId: 'am', dateKey: '2026-09-09', editIdx: 0, occ: T }, 'one');
  sc.eq('구글과 상관없는 일정은 캘린더 표시가 없다', c.ST.days[T].events.am[0].gc, undefined);
}

console.log('\n시나리오 13 — 주간·월간뷰는 앞날을 비추기만 한다 (저장하지 않는다)');
{
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  const shown = api.getDisplayTasks('2026-09-14', 'am', 'big').map(b => b.text);
  sc.eq('앞날 칸에 비친다', shown, ['성경읽기']);
  sc.eq('그래도 저장되지는 않는다', ST.days['2026-09-14'], undefined);
}

console.log('\n시나리오 14 — 묻는 동안 날짜를 넘겨도 처음 고른 날짜에 적용된다');
{
  // 팝업을 띄운 날짜(12일)를 넘겨받아, 지금 보는 날짜(오늘)가 아니라 그 날짜에 적용해야 한다
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView('2026-09-12');
  api._taskDeleteApply('big', 'am', 0, 'one', '2026-09-12');
  sc.eq('12일 것이 지워진다', bigsOn(ST, '2026-09-12', 'am'), []);
  sc.eq('오늘 것은 그대로', bigsOn(ST, T, 'am'), ['성경읽기']);
  sc.eq('뺀 날도 12일로 적힌다', ST.days[T].big.am[0].repeat.ex, ['2026-09-12']);
}

console.log('\n시나리오 15 — 매주 반복: 같은 요일에만 생긴다');
{
  // 2026-09-11 은 금요일. 매주면 9/18, 9/25 (금)에만 생겨야 한다.
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '주간회의', done: false, daily: true, rk: 'w', rid: 'rw', repeat: api0weekly() }] }, small: {}, trash: [], events: {} }
  }, T);
  ['2026-09-12','2026-09-14','2026-09-17','2026-09-18','2026-09-25'].forEach(k => api.ensureRepeatsForView(k));
  sc.eq('다음 날(토)엔 없다', bigsOn(ST, '2026-09-12', 'am'), []);
  sc.eq('월요일엔 없다', bigsOn(ST, '2026-09-14', 'am'), []);
  sc.eq('목요일엔 없다', bigsOn(ST, '2026-09-17', 'am'), []);
  sc.eq('다음 주 금요일엔 있다', bigsOn(ST, '2026-09-18', 'am'), ['주간회의']);
  sc.eq('그 다음 주 금요일에도', bigsOn(ST, '2026-09-25', 'am'), ['주간회의']);
  sc.eq('실체도 매주 표시를 물려받는다', ST.days['2026-09-18'].big.am[0].rk, 'w');
}

console.log('\n시나리오 16 — 매주 반복도 범위 세 갈래가 그대로 된다');
{
  const mk = () => ({
    [T]: { big: { am: [{ text: '주간회의', done: false, daily: true, rk: 'w', rid: 'rw', repeat: api0weekly() }] }, small: {}, trash: [], events: {} }
  });
  // 이 날짜만 — 9/18 만 빠지고 9/25 는 남는다
  const a = makeEnv(mk(), T);
  a.api.ensureRepeatsForView('2026-09-18');
  a.api.ensureRepeatsForView('2026-09-25');
  const a2 = makeEnv(a.ST.days, '2026-09-18');
  a2.api._taskDeleteApply('big', 'am', 0, 'one');
  sc.eq('그 주만 빠진다', bigsOn(a.ST, '2026-09-18', 'am'), []);
  sc.eq('다음 주는 그대로', bigsOn(a.ST, '2026-09-25', 'am'), ['주간회의']);

  // 이번 및 이후 — 9/18 부터 끊긴다
  const b = makeEnv(mk(), T);
  b.api.ensureRepeatsForView('2026-09-18');
  const b2 = makeEnv(b.ST.days, '2026-09-18');
  b2.api._taskDeleteApply('big', 'am', 0, 'future');
  sc.eq('끝날이 전날로 잡힌다', b.ST.days[T].big.am[0].repeat.until, '2026-09-17');
  b2.api.ensureRepeatsForView('2026-09-25');
  sc.eq('그 뒤로는 안 생긴다', bigsOn(b.ST, '2026-09-25', 'am'), []);
  sc.eq('원본이 있는 오늘은 남는다', bigsOn(b.ST, T, 'am'), ['주간회의']);
}

console.log('\n시나리오 17 — 매일 ↔ 매주 갈아타기 (오늘부터, 지난 기록은 그대로)');
{
  // 어제부터 매일 반복이던 할일을 오늘 '매주' 로 바꾼다
  const { ST, api } = makeEnv({
    '2026-09-10': { big: { am: [{ text: '성경읽기', done: true, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} }
  }, T);
  api.ensureRepeatsForView(T);
  sc.eq('오늘 것이 있다', bigsOn(ST, T, 'am'), ['성경읽기']);
  const e = makeEnv(ST.days, T);
  e.api._taskSetRepeat('big', 'am', 0, 'w');
  sc.eq('옛 매일 묶음은 어제까지', ST.days['2026-09-10'].big.am[0].repeat.until, '2026-09-10');
  sc.eq('오늘 것이 새 매주 원본', !!ST.days[T].big.am[0].repeat, true);
  sc.eq('매주 규칙이다', ST.days[T].big.am[0].repeat.weekly && !ST.days[T].big.am[0].repeat.daily, true);
  sc.eq('매주 표시가 붙는다', e.api._repKindOf(ST.days[T].big.am[0]), 'w');
  sc.eq('지난 기록은 그대로', bigsOn(ST, '2026-09-10', 'am'), ['성경읽기']);
  e.api.ensureRepeatsForView('2026-09-12');
  sc.eq('내일은 이제 안 생긴다', bigsOn(ST, '2026-09-12', 'am'), []);
  e.api.ensureRepeatsForView('2026-09-18');
  sc.eq('다음 주 같은 요일엔 생긴다', bigsOn(ST, '2026-09-18', 'am'), ['성경읽기']);
}

console.log('\n시나리오 18 — 켜져 있는 쪽을 다시 누르면 꺼진다');
{
  const { ST, api } = makeEnv({
    [T]: { big: { am: [{ text: '주간회의', done: false, daily: true, rk: 'w', rid: 'rw', repeat: api0weekly() }] }, small: {}, trash: [], events: {} }
  }, T);
  api._taskSetRepeat('big', 'am', 0, 'w');   // 매주인데 매주를 다시 누름 = 끄기
  const it = ST.days[T].big.am[0];
  sc.eq('규칙이 사라진다', it.repeat, undefined);
  sc.eq('묶음 이름표도', it.rid, undefined);
  sc.eq('매주 표시도', it.rk, undefined);
  sc.eq('할일 자체는 남는다', bigsOn(ST, T, 'am'), ['주간회의']);
}

console.log('\n시나리오 19 — 반복 종류를 무엇으로 읽는가 (_repKindOf)');
{
  const { api } = makeEnv({}, T);
  sc.eq('규칙 없는 할일', api._repKindOf({ text: 'x' }), null);
  sc.eq('매일 원본', api._repKindOf({ repeat: rep() }), 'd');
  sc.eq('매주 원본', api._repKindOf({ repeat: api0weekly() }), 'w');
  sc.eq('매주 실체(표시만)', api._repKindOf({ rid: 'rw', rk: 'w', daily: true }), 'w');
  sc.eq('매일 실체', api._repKindOf({ rid: 'r1', daily: true }), 'd');
}

console.log('\n시나리오 20 — 일정: 주간뷰에서 누른 날만 지우기 (v. 26-1030-5, HB)');
{
  // 8/28(금)에 만든 매주 일정을 주간뷰 10/30(금) 칸에서 눌러 '이 일정만' 지운다.
  // 저장 자리는 원본 날(8/28), 누른 날(occ)은 10/30 — 지우는 기준은 언제나 누른 날이다.
  const O = '2026-08-28', OCC = '2026-10-30';
  const mk = () => ({ [O]: { big: {}, small: {}, trash: [], events: { pm: [{ id: 'e1', time: '13:40', text: '기독교 역사', rid: 'r1', repeat: api0weekly(),
    g: { c: 'church', i: 'b7eve1', u: 'u1', h: 'h' } }] } } });
  const a = makeEnv(mk(), OCC, { _gcalCfg: () => ({ on: true }) });
  a.api._evDeleteApply({ dateKey: O, idx: 0, secId: 'pm', occ: OCC }, 'one');
  const root = a.ST.days[O].events.pm[0];
  sc.eq('원본은 그대로 남는다 (지우면 반복이 통째로 사라진다)', !!(root && root.repeat), true);
  sc.eq('누른 날만 뺀 날에 적힌다', root.repeat.ex, [OCC]);
  sc.eq('10/30 에는 안 보인다', a.api.eventRepeatsOnDate(root, O, OCC), false);
  sc.eq('다음 주 11/6 에는 보인다', a.api.eventRepeatsOnDate(root, O, '2026-11-06'), true);
  sc.eq('토스트: 이름 · 날짜 · 구글 한 줄', a.log.toasts[0], '기독교 역사\n10/30(금) 하루만 지웠어요\n반복은 그대로예요\n구글 캘린더에도 곧 반영돼요');
  // 구글에 안 이은 일정 · 구글을 끈 기기에서는 구글 줄이 없다
  const b = makeEnv(mk(), OCC);
  b.api._evDeleteApply({ dateKey: O, idx: 0, secId: 'pm', occ: OCC }, 'one');
  // 이름이 길면 줄여서 첫 줄에
  const c = makeEnv({ [O]: { big: {}, small: {}, trash: [], events: { pm: [{ id: 'e2', time: '13:40', text: '아주 아주 긴 일정 이름이 들어가면 토스트가 넘치니까 줄인다', rid: 'r2', repeat: api0weekly() }] } } }, OCC);
  c.api._evDeleteApply({ dateKey: O, idx: 0, secId: 'pm', occ: OCC }, 'all');
  sc.eq('긴 이름은 24자로 줄여 첫 줄에', c.log.toasts[0].split('\n')[0], '아주 아주 긴 일정 이름이 들어가면 토스트…');
  sc.eq('할일을 지워도 이름이 먼저', (() => { const t = makeEnv({ [OCC]: { big: { am: [{ text: '성경읽기', done: false, daily: true, rid: 'r1', repeat: rep() }] }, small: {}, trash: [], events: {} } }, OCC); t.api._taskDeleteApply('big', 'am', 0, 'one', OCC); return t.log.toasts[0]; })(), '성경읽기\n이 날짜만 지웠어요');
  sc.eq('구글을 안 켰으면 구글 줄은 없다', b.log.toasts[0], '기독교 역사\n10/30(금) 하루만 지웠어요\n반복은 그대로예요');
}

console.log('\n시나리오 21 — 범위 묻기 문구에 날짜를 적는다');
{
  const { api } = makeEnv({ '2026-08-28': { big: {}, small: {}, trash: [], events: { pm: [{ id: 'e1', time: '13:40', text: '기독교 역사', rid: 'r1', repeat: api0weekly() }] } },
                            '2026-10-23': { big: {}, small: {}, trash: [], events: { pm: [{ id: 'o1', time: '14:00', text: '기독교 역사(보강)', rid: 'r1' }] } } }, '2026-10-30');
  const rows = api._evScopeRows('delete', '2026-10-30', { rid: 'r1', repeat: api0weekly() }, '2026-08-28');
  sc.eq('세 갈래 차례', rows.map(r => r[0]), ['one', 'future', 'all']);
  sc.eq('이 일정만 = 누른 날', rows[0][2], '10/30(금) 하루만 지워요');
  sc.eq('이후 = 누른 날부터', rows[1][2], '10/30(금)부터 앞으로 모두 지워요');
  sc.eq('모두 = 원본 날부터', rows[2][2], '8/28(금)부터 지난 것까지 반복 전체를 지워요');
  const ov = api._evScopeRows('edit', '2026-10-23', { rid: 'r1' }, '2026-10-23');
  sc.eq('하루만 고친 것을 눌러도 원본 날을 찾아 적는다', ov[2][2], '8/28(금)부터 지난 것까지 반복 전체를 고쳐요');
}

console.log('\n시나리오 22 — 반복 일정의 날짜를 바꾸면: 이 날만 옮기기');
{
  const O = '2026-09-11', OCC = '2026-09-18', TO = '2026-09-19';   // 금 → 토
  const mk = (extraOcc) => ({
    [O]: { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: api0weekly(), g: { c: 'church', i: 'b7eve1', u: 'u1', h: 'h' } }] } },
    ...(extraOcc ? { [OCC]: { big: {}, small: {}, trash: [], events: { am: [extraOcc] } } } : {})
  });
  const a = makeEnv(mk(), O);
  a.api._evMoveApply({ text: '기도회', time: '09:00', repeat: api0weekly(), secId: 'am', dateKey: O, editIdx: 0, occ: OCC, to: TO }, 'one');
  const root = a.ST.days[O].events.am[0], moved = a.ST.days[TO].events.am[0];
  sc.eq('누른 날은 뺀 날', root.repeat.ex, [OCC]);
  sc.eq('반복 규칙은 그대로 (끝날 없음)', root.repeat.until, undefined);
  sc.eq('보낸 날에 하루짜리가 선다', moved && moved.text, '기도회');
  sc.eq('하루짜리는 묶음에서 떨어진다 (rid 없음 — 구글이 엉뚱한 회차를 고치지 않게)', [moved.rid, moved.repeat], [undefined, undefined]);
  sc.eq('원본의 구글 캘린더를 물려받는다', moved.gc, 'church');
  sc.eq('구글 고리는 물려받지 않는다 (구글엔 새 일정)', moved.g, undefined);
  sc.eq('토스트: 무엇을 / 어디서 어디로 / 반복은', a.log.toasts[0], '일정을 옮겼어요\n9/18(금) → 9/19(토)\n반복은 그대로예요');

  // 누른 날이 '하루만 고친 일정' 이었으면 그것은 걷고 구글에서도 지우라고 적는다
  const ov = { id: 'o1', time: '10:00', text: '기도회(장소 변경)', rid: 'r1', g: { c: 'church', i: 'b7eve1_20260918T010000Z', u: 'u1', h: 'h' } };
  const b = makeEnv(mk(ov), O, { _gcalTomb: (k, ev) => { const d = b.ST.days[k]; (d.gdel = d.gdel || []).push(ev.g.c + '|' + ev.g.i); } });
  const rootB = b.ST.days[O].events.am[0];
  rootB.repeat.ex = [OCC];
  b.api._evMoveApply({ text: '기도회(장소 변경)', time: '10:00', repeat: null, secId: 'am', dateKey: OCC, editIdx: 0, occ: OCC, to: TO }, 'one');
  sc.eq('하루만 고친 일정은 걷힌다', b.ST.days[OCC].events.am.length, 0);
  sc.eq('구글 예외 회차를 지우라는 표시', b.ST.days[OCC].gdel, ['church|b7eve1_20260918T010000Z']);
  sc.eq('보낸 날엔 고친 모양 그대로', b.ST.days[TO].events.am.map(e => [e.text, e.time, e.rid]), [['기도회(장소 변경)', '10:00', undefined]]);
  sc.eq('뺀 날은 두 번 적히지 않는다', rootB.repeat.ex, [OCC]);
}

console.log('\n시나리오 23 — 반복 일정의 날짜를 바꾸면: 이후 반복도 함께 옮기기');
{
  const O = '2026-09-11';
  const a = makeEnv({ [O]: { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: Object.assign(api0weekly(), { ex: ['2026-10-02'] }) }] } } }, O);
  a.api._evMoveApply({ text: '기도회', time: '09:00', repeat: api0weekly(), secId: 'am', dateKey: O, editIdx: 0, occ: '2026-09-18', to: '2026-09-19' }, 'future');
  const root = a.ST.days[O].events.am[0], fresh = a.ST.days['2026-09-19'].events.am[0];
  sc.eq('옛 반복은 누른 날 전날까지', root.repeat.until, '2026-09-17');
  sc.eq('보낸 날부터 새 묶음', !!(fresh.repeat && fresh.rid && fresh.rid !== 'r1'), true);
  sc.eq('새 묶음은 끝날·뺀 날 없이 시작', [fresh.repeat.until, fresh.repeat.ex], [undefined, []]);
  sc.eq('매주라 새 요일(토)에 되풀이', [a.api.eventRepeatsOnDate(fresh, '2026-09-19', '2026-09-26'), a.api.eventRepeatsOnDate(fresh, '2026-09-19', '2026-09-25')], [true, false]);

  // 앞으로 당겨 옮기면(매일 12일 → 10일) 그 사이가 두 벌이 되지 않는다
  const D0 = '2026-09-09';
  const b = makeEnv({ [D0]: { big: {}, small: {}, trash: [], events: { am: [{ id: 'd1', time: '06:00', text: '새벽기도', rid: 'rd', repeat: rep() }] } } }, D0);
  b.api._evMoveApply({ text: '새벽기도', time: '06:00', repeat: rep(), secId: 'am', dateKey: D0, editIdx: 0, occ: '2026-09-12', to: '2026-09-10' }, 'future');
  sc.eq('옛 반복은 보낸 날 전날까지', b.ST.days[D0].events.am[0].repeat.until, '2026-09-09');
  const freshD = b.ST.days['2026-09-10'].events.am[0];
  sc.eq('10~11일은 새 묶음 하나만 (옛 것은 9일까지)', [b.api.eventRepeatsOnDate(b.ST.days[D0].events.am[0], D0, '2026-09-10'), b.api.eventRepeatsOnDate(b.ST.days[D0].events.am[0], D0, '2026-09-11'), !!freshD.repeat], [false, false, true]);

  // 첫 회(원본 날)를 옮기면 옛 묶음은 통째로 걷히고 새 묶음만 남는다
  const c = makeEnv({ [O]: { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: api0weekly() }] } } }, O);
  c.api._evMoveApply({ text: '기도회', time: '09:00', repeat: api0weekly(), secId: 'am', dateKey: O, editIdx: 0, occ: O, to: '2026-09-12' }, 'future');
  sc.eq('원본 날 자리는 빈다', c.ST.days[O].events.am.length, 0);
  sc.eq('새 날에 새 묶음', !!c.ST.days['2026-09-12'].events.am[0].repeat, true);
}

console.log('\n시나리오 24 — 반복 일정 시각을 바꾸면 구간도 따라간다 (한 번짜리와 같은 규칙)');
{
  const secFor = t => (t >= '12:00' ? 'pm' : 'am');
  const mk = () => ({ [T]: { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', time: '09:00', text: '기도회', rid: 'r1', repeat: rep() }] } } });
  const a = makeEnv(mk(), T, { _secIdForTime: secFor });
  a.api._evEditApply({ text: '기도회', time: '15:00', repeat: rep(), secId: 'am', dateKey: T, editIdx: 0, occ: '2026-09-12' }, 'one');
  sc.eq('이 날만: 하루만 고친 것이 오후 구간에', (a.ST.days['2026-09-12'].events.pm || []).map(e => e.time), ['15:00']);
  sc.eq('이 날만: 오전 구간엔 없다', (a.ST.days['2026-09-12'].events.am || []).length, 0);
  // 그 하루만 고친 것을 다시 오전으로 — 오후에 있던 것은 걷힌다
  const a2 = makeEnv(a.ST.days, T, { _secIdForTime: secFor });
  a2.api._evEditApply({ text: '기도회', time: '08:00', repeat: null, secId: 'pm', dateKey: '2026-09-12', editIdx: 0, occ: '2026-09-12' }, 'one');
  sc.eq('다시 고치면 옛 구간 것은 걷히고 새 구간에 하나', [(a.ST.days['2026-09-12'].events.pm || []).length, (a.ST.days['2026-09-12'].events.am || []).map(e => e.time)], [0, ['08:00']]);

  const b = makeEnv(mk(), T, { _secIdForTime: secFor });
  b.api._evEditApply({ text: '기도회', time: '19:00', repeat: rep(), secId: 'am', dateKey: T, editIdx: 0, occ: '2026-09-12' }, 'all');
  sc.eq('모두: 원본이 오후 구간으로 옮겨 간다 (같은 날)', [(b.ST.days[T].events.am || []).length, (b.ST.days[T].events.pm || []).map(e => [e.id, e.time])], [0, [['e1', '19:00']]]);
  sc.eq('모두: 규칙은 그대로', !!b.ST.days[T].events.pm[0].repeat, true);

  const c = makeEnv(mk(), T, { _secIdForTime: secFor });
  c.api._evEditApply({ text: '기도회', time: '13:00', repeat: rep(), secId: 'am', dateKey: T, editIdx: 0, occ: '2026-09-14' }, 'future');
  sc.eq('이후: 새 묶음이 오후 구간에서 시작', (c.ST.days['2026-09-14'].events.pm || []).map(e => e.time), ['13:00']);
  sc.eq('이후: 옛 묶음은 오전 그대로 · 전날까지', [c.ST.days[T].events.am[0].time, c.ST.days[T].events.am[0].repeat.until], ['09:00', '2026-09-13']);

  // 시각이 없으면 있던 구간에 머문다
  const d = makeEnv(mk(), T, { _secIdForTime: secFor });
  d.api._evEditApply({ text: '기도회', time: null, repeat: rep(), secId: 'am', dateKey: T, editIdx: 0, occ: '2026-09-12' }, 'one');
  sc.eq('시각 없는 하루만 고친 것은 있던 구간에', (d.ST.days['2026-09-12'].events.am || []).length, 1);
}

sc.done();
