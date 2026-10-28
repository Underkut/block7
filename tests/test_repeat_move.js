// 반복 할일 옮기기 — '이 날만' / '이후 반복도 함께' (HB 2026-10-28 B3-2)
// 예전: 그날 것을 빼서 daily 표시를 단 사본으로 보냈다 → 그날 반복이 다시 생겨 두 군데 보이고
//       사본엔 반복 아이콘이 남았다. 원본(규칙)을 옮기면 반복 자체가 사라졌다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
const RULE = slice('function _repRule(rep){', 'function getDisplayEvents(k,secId){');
const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
const TASK = slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days,toSec,markDone){');
function makeEnv(days, todayK) {
  const ST = { days: days || {} };
  const env = {
    ST, SECS: [{ id: 'am' }, { id: 'pm' }],
    z: n => String(n).padStart(2, '0'), todayKey: () => todayK, tKey: () => todayK,
    weekOfMonth: d => Math.ceil(d.getDate() / 7),
    getDay: k => { if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} }; return ST.days[k]; },
    rawSave() {}, save() {}, beforeSave() {}, showToast() {}, esc: s => String(s || ''),
    renderSecBody() {}, updateTotal() {}, renderSecEvents() {}, refreshTaskViewsLive() {}, renderToday() {},
    sendToTrash() {}, _sortEventsKeepingTimeless: a => a, document: { getElementById: () => null },
  };
  env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  env.getEvents = (k, id) => { const d = env.getDay(k); if (!d.events[id]) d.events[id] = []; return d.events[id]; };
  const names = Object.keys(env);
  const api = new Function(...names, SUBHELP + RULE + TASK + '\nreturn {_repMoveApply,materializeRepeatsFor,getDisplayTasks,_repHiddenOn,_repKindOf};')(...names.map(n => env[n]));
  return { ST, api };
}
const D = { daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] };
const W = { daily: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: true, weeksOfMonth: [1, 2, 3, 4, 5] };
const day = big => ({ big: { am: big }, small: {}, trash: [], events: {} });
// 보이는 것 = 그 날 저장된 것(감춘 원본 빼고) + 비춰 주는 반복
const seen = (S, k) => S.api.getDisplayTasks(k, 'am', 'big').filter(b => !S.api._repHiddenOn(b, k)).map(b => b.text);
const T = '2026-10-28', T1 = '2026-10-29';   // 수 · 목

console.log('시나리오 1 — 매일 반복의 오늘 것을 "이 날만" 내일로');
{
  const S = makeEnv({
    '2026-10-26': day([{ text: '운동', done: false, rid: 'r1', repeat: { ...D } }]),
    [T]: day([{ text: '운동', done: false, daily: true, rid: 'r1' }]),
  }, T);
  S.api._repMoveApply('big', 'am', 0, T, T1, 'am', 'one');
  S.api.materializeRepeatsFor(T);
  sc.eq('⭐ 오늘엔 다시 생기지 않는다', seen(S, T), []);
  const t1 = S.ST.days[T1].big.am;
  sc.eq('내일엔 옮긴 것 + 내일의 반복', seen(S, T1).sort(), ['운동', '운동']);
  sc.eq('옮긴 것은 하루짜리 (반복 아이콘 없음)', [t1[0].rid, t1[0].daily, S.api._repKindOf(t1[0])], [undefined, undefined, null]);
  sc.eq('모레는 반복 그대로', seen(S, '2026-10-30'), ['운동']);
}

console.log('시나리오 2 — 반복 원본(규칙)을 "이 날만" 옮겨도 반복은 산다');
{
  const S = makeEnv({ [T]: day([{ text: '운동', done: false, rid: 'r1', repeat: { ...D } }]) }, T);
  S.api._repMoveApply('big', 'am', 0, T, T1, 'pm', 'one');
  sc.eq('원본은 제자리에 감춰진다', [S.ST.days[T].big.am.length, seen(S, T)], [1, []]);
  sc.eq('보낸 곳(오후)엔 하루짜리', S.ST.days[T1].big.pm.map(b => [b.text, b.rid]), [['운동', undefined]]);
  S.api.materializeRepeatsFor(T1);
  sc.eq('내일 오전 반복도 그대로 생긴다', seen(S, T1), ['운동']);
}

console.log('시나리오 3 — 매주(월) 반복을 "이후 반복도 함께" 화요일로');
{
  const M = '2026-10-26', TU = '2026-10-27';
  const S = makeEnv({
    '2026-10-19': day([{ text: '주간보고', done: true, rid: 'w1', repeat: { ...W } }]),
    [M]: day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),
    '2026-11-02': day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),   // 미리 생겨 있던 것
  }, '2026-10-26');
  S.api._repMoveApply('big', 'am', 0, M, TU, 'am', 'future');
  sc.eq('지난 기록은 남는다', seen(S, '2026-10-19'), ['주간보고']);
  sc.eq('월요일엔 없다', seen(S, M), []);
  sc.eq('다음 월요일에도 없다 (미리 생긴 것까지 정리)', seen(S, '2026-11-02'), []);
  sc.eq('화요일에 새 반복 원본', [seen(S, TU), !!S.ST.days[TU].big.am[0].repeat], [['주간보고'], true]);
  sc.eq('새 묶음 이름표', S.ST.days[TU].big.am[0].rid !== 'w1', true);
  sc.eq('다음 화요일부터 매주', seen(S, '2026-11-03'), ['주간보고']);
  sc.eq('옛 규칙은 그 전날 끝', S.ST.days['2026-10-19'].big.am[0].repeat.until, '2026-10-25');
}

console.log('시나리오 4 — 원본 자신을 "이후 반복도 함께" 옮기기');
{
  const S = makeEnv({ [T]: day([{ text: '운동', done: false, rid: 'r1', repeat: { ...D } }]), [T1]: day([{ text: '운동', done: false, daily: true, rid: 'r1' }]) }, T);
  S.api._repMoveApply('big', 'am', 0, T, T1, 'am', 'future');
  sc.eq('오늘엔 없다', seen(S, T), []);
  sc.eq('내일 한 줄 (겹치지 않게 옛것 정리)', seen(S, T1), ['운동']);
  sc.eq('모레도 반복', seen(S, '2026-10-30'), ['운동']);
}
sc.done();
