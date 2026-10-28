// 반복 할일의 미완료 이월 (HB 2026-10-28 B3-0 · B3-1)
//
// 예전: 미완료 반복 할일을 오늘로 '옮기면서' 묶음 이름표(rid)를 달고 왔다 →
//   · 오늘 칸에 이미 그 반복의 오늘 것이 있으면 두 줄 (앞날을 미리 열어 봤거나, 부팅 순서에 따라)
//   · 범위가 '이번 주' 면 지난 며칠 치가 한꺼번에 와서 여러 줄
//   · 미완료가 **원본**(규칙을 든 것)이면 원본을 지난 날에서 빼 버려 반복이 통째로 끊겼다
// 이제 (B3-1, HB 제안을 받아들임):
//   · 지난 날의 반복 할일은 **그 자리에 미완료로 둔다** (rc 표시 — 다시 가져오지 않게)
//   · 오늘 그 반복의 오늘 것이 있거나 생길 날이면 → 가져오지 않는다 (오늘 것이 곧 그 일)
//   · 아니면(매주 반복의 다른 요일 등) → **반복 속성을 뺀** 하루짜리 사본을 오늘에 하나만
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const RULE = slice('function _repRule(rep){', 'function getDisplayEvents(k,secId){');
const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
const TASK = slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days,toSec,markDone){');
const CARRY = slice('// 이월될 항목 수를 미리 센다', '// 7-3 [지금 가져오기]');

function makeEnv(days, todayK) {
  const ST = { days: days || {} };
  const SECS = [{ id: 'am' }, { id: 'pm' }];
  const env = {
    ST, SECS,
    z: n => String(n).padStart(2, '0'),
    todayKey: () => todayK, tKey: () => todayK,
    weekOfMonth: d => Math.ceil(d.getDate() / 7),
    getDay: k => { if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} }; return ST.days[k]; },
    rawSave() {}, save() {}, beforeSave() {}, showToast() {}, esc: s => String(s || ''),
    renderSecBody() {}, renderSmList() {}, updateTotal() {}, renderSecEvents() {}, refreshTaskViewsLive() {}, renderToday() {},
    sendToTrash() {}, _sortEventsKeepingTimeless: a => a, document: { getElementById: () => null },
  };
  env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small) d.small = {}; if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  env.getEvents = (k, id) => { const d = env.getDay(k); if (!d.events[id]) d.events[id] = []; return d.events[id]; };
  const names = Object.keys(env);
  const body = SUBHELP + '\n' + RULE + '\n' + TASK + '\n' + CARRY + '\nreturn {_doCarry,_carryPendingCount,materializeRepeatsFor,ensureRepeatsForView};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api };
}
const D = { daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] };
const W = { daily: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: true, weeksOfMonth: [1, 2, 3, 4, 5] };
const day = big => ({ big: { am: big }, small: {}, trash: [], events: {} });
const texts = (ST, k) => ((ST.days[k] && ST.days[k].big.am) || []).map(b => b.text);
const all = () => true;
// 2026-10-28 수요일
const T = '2026-10-28', Y = '2026-10-27', Y2 = '2026-10-26';

console.log('시나리오 1 — 매일 반복: 오늘 것이 이미 있으면 어제 미완료를 가져오지 않는다 (두 줄 금지)');
{
  const { ST, api } = makeEnv({
    [Y2]: day([{ text: '운동', done: false, rid: 'r1', repeat: { ...D } }]),
    [Y]: day([{ text: '운동', done: false, daily: true, rid: 'r1' }]),
    [T]: day([{ text: '운동', done: false, daily: true, rid: 'r1' }]),   // 어제 오늘을 미리 열어 봐서 이미 생김
  }, T);
  api._doCarry(all);
  sc.eq('오늘은 한 줄', texts(ST, T), ['운동']);
  sc.eq('지난 날 것은 제자리에 미완료로 남는다', [texts(ST, Y), ST.days[Y].big.am[0].done], [['운동'], false]);
  sc.eq('⭐ 원본(규칙)은 지워지지 않는다', !!ST.days[Y2].big.am[0].repeat, true);
}

console.log('시나리오 2 — 매일 반복: 오늘 것이 아직 안 만들어졌어도(부팅 순서) 오늘 생길 날이면 가져오지 않는다');
{
  const { ST, api } = makeEnv({
    [Y]: day([{ text: '운동', done: false, rid: 'r1', repeat: { ...D } }]),
  }, T);
  api._doCarry(all);
  api.materializeRepeatsFor(T);
  sc.eq('오늘은 반복의 오늘 것 한 줄뿐', texts(ST, T), ['운동']);
  sc.eq('오늘 것은 묶음에 매여 있다', ST.days[T].big.am[0].rid, 'r1');
  sc.eq('원본은 어제 자리에 그대로', [texts(ST, Y), !!ST.days[Y].big.am[0].repeat], [['운동'], true]);
}

console.log('시나리오 3 — 매주 반복(월요일): 오늘(수)은 그 요일이 아니다 → 반복 속성 뺀 사본 하나');
{
  const { ST, api } = makeEnv({
    '2026-10-19': day([{ text: '주간보고', done: false, rid: 'w1', repeat: { ...W } }]),
    [Y2]: day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),   // 월요일 것 미완료
  }, T);
  api._doCarry(all);
  const t = ST.days[T].big.am;
  sc.eq('오늘 한 줄', texts(ST, T), ['주간보고']);
  sc.eq('사본은 반복이 아니다 (rid · daily · rk · repeat 없음)', [t[0].rid, t[0].daily, t[0].rk, t[0].repeat], [undefined, undefined, undefined, undefined]);
  sc.eq('넘어온 횟수는 센다', t[0].autoCarryCount, 1);
  sc.eq('월요일 것은 제자리에 미완료로', [texts(ST, Y2), ST.days[Y2].big.am[0].done], [['주간보고'], false]);
  sc.eq('지난주 원본(미완료)도 제자리', !!ST.days['2026-10-19'].big.am[0].repeat, true);
  api.materializeRepeatsFor('2026-11-02');
  sc.eq('다음 월요일 반복은 그대로 생긴다', texts(ST, '2026-11-02'), ['주간보고']);
}

console.log('시나리오 4 — 같은 반복의 미완료가 여러 날 있어도 사본은 하나');
{
  const { ST, api } = makeEnv({
    '2026-10-12': day([{ text: '주간보고', done: false, rid: 'w1', repeat: { ...W } }]),
    '2026-10-19': day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),
    [Y2]: day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),
  }, T);
  api._doCarry(all);
  sc.eq('오늘 한 줄', texts(ST, T), ['주간보고']);
}

console.log('시나리오 5 — 다시 돌려도(내일 아침 · 지금 가져오기) 같은 미완료를 또 가져오지 않는다');
{
  const { ST, api } = makeEnv({
    [Y2]: day([{ text: '주간보고', done: false, daily: true, rk: 'w', rid: 'w1' }]),
    '2026-10-19': day([{ text: '주간보고', done: true, rid: 'w1', repeat: { ...W } }]),
  }, T);
  api._doCarry(all);
  sc.eq('센 개수가 0 이 된다', api._carryPendingCount(all), 0);
  api._doCarry(all);
  sc.eq('오늘은 여전히 한 줄', texts(ST, T), ['주간보고']);
}

console.log('시나리오 6 — 반복이 아닌 할일은 예전 그대로 옮겨진다');
{
  const { ST, api } = makeEnv({ [Y]: day([{ text: '전화', done: false }, { text: '끝낸 일', done: true }]) }, T);
  const r = api._doCarry(all);
  sc.eq('어제에서 빠지고', texts(ST, Y), ['끝낸 일']);
  sc.eq('오늘로 온다', texts(ST, T), ['전화']);
  sc.eq('센 개수', r.movedCount, 1);
}

console.log('시나리오 7 — 반복 원본이 미완료여도(매주, 오늘이 그 요일 아님) 반복은 살아 있다');
{
  const { ST, api } = makeEnv({ [Y2]: day([{ text: '주간보고', done: false, rid: 'w1', repeat: { ...W } }]) }, T);
  api._doCarry(all);
  sc.eq('사본 하나', texts(ST, T), ['주간보고']);
  sc.eq('원본 규칙 그대로', !!ST.days[Y2].big.am[0].repeat, true);
  api.materializeRepeatsFor('2026-11-02');
  sc.eq('다음 월요일에도 생긴다', texts(ST, '2026-11-02'), ['주간보고']);
}
sc.done();
