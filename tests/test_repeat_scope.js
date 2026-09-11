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
const TASK = slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days){');

function makeEnv(days, todayK) {
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
     '_taskDeleteApply', '_taskTextApply'].join(',') + '};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api, log };
}
const rep = over => Object.assign({ daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] }, over || {});
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

sc.done();
