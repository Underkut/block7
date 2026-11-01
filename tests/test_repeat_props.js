// 반복 할일의 보조 속성(하위 · 메모 · 중요 · 연락할 일)을 바꿨을 때 — 이 할일만 / 이후 / 모두
// (HB 2026-11-01 B1: "반복 할일에 하위를 넣으면 그날만 생겨")
//
// 반복 실체는 원본에서 이 넷을 물려받는다(materializeRepeatsFor). 예전엔 그 날 것만 바뀌어
//   · 실체에 넣은 하위는 다른 날에 안 퍼졌고
//   · 원본(첫 날)에 넣은 하위는 묻지도 않고 앞날에 퍼졌다.
// ⚠️ 저장 계층(ST.days)에 쓰는 기능이다 — 지난 날의 기록 · 그 날 해 둔 체크를 잃지 않는지 함께 본다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const RULE = slice('function _repRule(rep){', 'function getDisplayEvents(k,secId){');
const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
const PRUNE = slice('function _subPrune(item){', 'function _subKey(');
const TASK = slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days,toSec,markDone){');

const T = '2026-11-01';   // 오늘
function makeEnv(days) {
  const ST = { days: days || {} };
  const log = { toasts: [], renders: 0 };
  const env = {
    ST, SECS: [{ id: 'am' }],
    z: n => String(n).padStart(2, '0'),
    todayKey: () => T, tKey: () => T,
    weekOfMonth: d => Math.ceil(d.getDate() / 7),
    getDay: k => {
      if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} };
      return ST.days[k];
    },
    rawSave() {}, save() {}, beforeSave() {},
    sendToTrash() {}, renderSecBody() { log.renders++; }, renderSmList() {}, updateTotal() {},
    renderSecEvents() {}, refreshTaskViewsLive() {}, renderToday() { log.renders++; },
    showToast: t => log.toasts.push(t), esc: s => String(s || ''),
    _sortEventsKeepingTimeless: a => a, _eventModalSecId: null,
    document: { getElementById: () => null },
  };
  env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  env.getEvents = (k, id) => { const d = env.getDay(k); if (!d.events) d.events = {}; if (!d.events[id]) d.events[id] = []; return d.events[id]; };
  const names = Object.keys(env);
  const body = RULE + '\n' + SUBHELP + '\n' + PRUNE + '\n' + TASK + '\nreturn {' +
    ['materializeRepeatsFor', '_repHiddenOn', '_taskTextApply', '_repPropSnap', '_repPropKey',
     '_repPropApply', '_taskRepRootOf', 'eventRepeatsOnDate'].join(',') + '};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api, log };
}
const rep = over => Object.assign({ daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] }, over || {});
const sub = (t, d) => ({ text: t, done: !!d });
const day = arr => ({ big: { am: arr }, small: {}, trash: [], events: {} });
const at = (ST, k) => (ST.days[k] && ST.days[k].big.am) || [];
const texts = it => (it && it.subs || []).map(s => s.text);
const clone = o => JSON.parse(JSON.stringify(o));

// 원본은 10/30, 지난 실체 10/31, 오늘 실체 11/1, 앞날 실체 11/2 (11/3 은 아직 안 생김)
function series(extra) {
  const base = Object.assign({ text: '운동', subs: [sub('스트레칭')] }, extra || {});
  return {
    '2026-10-30': day([Object.assign(clone(base), { done: true, subs: [sub('스트레칭', true)], daily: true, rid: 'r1', repeat: rep() })]),
    '2026-10-31': day([Object.assign(clone(base), { done: true, subs: [sub('스트레칭', true)], daily: true, rid: 'r1' })]),
    '2026-11-01': day([Object.assign(clone(base), { done: false, subs: [sub('스트레칭', true)], daily: true, rid: 'r1' })]),
    '2026-11-02': day([Object.assign(clone(base), { done: false, daily: true, rid: 'r1' })]),
  };
}
// 오늘 실체에 하위 '달리기' 를 넣는다 (화면이 하는 일 그대로: 먼저 떠 두고, 그 다음 바꾼다)
function addSubToday(ST, api, t) {
  const it = at(ST, T)[0];
  const before = api._repPropSnap(it);
  it.subs.push(sub(t || '달리기'));
  return before;
}

console.log('시나리오 1 — 오늘 실체에 하위를 넣고 "모든 할일" → 원본 · 앞날에도, 지난 기록은 그대로');
{
  const { ST, api, log } = makeEnv(series());
  const before = addSubToday(ST, api);
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'all');
  sc.eq('원본에도 생긴다', texts(at(ST, '2026-10-30')[0]), ['스트레칭', '달리기']);
  sc.eq('이미 생긴 앞날 실체에도', texts(at(ST, '2026-11-02')[0]), ['스트레칭', '달리기']);
  sc.eq('지난 실체(기록)는 그대로', texts(at(ST, '2026-10-31')[0]), ['스트레칭']);
  sc.eq('오늘 해 둔 체크는 지킨다', at(ST, T)[0].subs.map(s => s.done), [true, false]);
  sc.eq('원본(지난 날)의 새 하위는 부모의 완료를 따른다', at(ST, '2026-10-30')[0].subs.map(s => s.done), [true, true]);
  sc.eq('원본은 여전히 완료 (기록이 안 흔들린다)', at(ST, '2026-10-30')[0].done, true);
  api.materializeRepeatsFor('2026-11-03');
  sc.eq('아직 안 생긴 날도 새 하위로 생긴다', texts(at(ST, '2026-11-03')[0]), ['스트레칭', '달리기']);
  sc.eq('앞날 하위는 안 한 상태', at(ST, '2026-11-03')[0].subs.map(s => s.done), [false, false]);
  sc.eq('토스트에 무엇을 · 어디까지', log.toasts[0], '하위 할일\n반복 전체에 바꿨어요');
}

console.log('시나리오 2 — 오늘 실체에서 "이 할일만" → 다른 날은 하나도 안 바뀐다');
{
  const { ST, api } = makeEnv(series());
  const snap = clone(ST.days);
  const before = addSubToday(ST, api);
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'one');
  sc.eq('오늘 것만 새 하위', texts(at(ST, T)[0]), ['스트레칭', '달리기']);
  sc.eq('원본 그대로', at(ST, '2026-10-30'), snap['2026-10-30'].big.am);
  sc.eq('앞날 그대로', at(ST, '2026-11-02'), snap['2026-11-02'].big.am);
  sc.eq('묶음에서 떨어지지 않는다(반복 표시 유지)', at(ST, T)[0].rid, 'r1');
  api.materializeRepeatsFor('2026-11-03');
  sc.eq('새로 생기는 날도 예전 하위', texts(at(ST, '2026-11-03')[0]), ['스트레칭']);
}

console.log('시나리오 3 — 원본(첫 날)에 하위를 넣고 "이 할일만" → 앞날에 새지 않는다 (예전엔 몰래 퍼졌다)');
{
  const days = {
    [T]: day([{ text: '운동', done: false, daily: true, rid: 'r1', repeat: rep(), subs: [sub('스트레칭', true)], urgent: true, urgentRank: 1 }]),
  };
  const { ST, api } = makeEnv(days);
  const root = at(ST, T)[0];
  const before = api._repPropSnap(root);
  root.subs.push(sub('달리기'));
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'one');
  const [r, one] = at(ST, T);
  sc.eq('원본은 예전 하위로 되돌린다', texts(r), ['스트레칭']);
  sc.eq('원본은 그 날 감춰진다', api._repHiddenOn(r, T), true);
  sc.eq('감춰진 원본은 긴급을 내려놓는다(하루 2개 한도)', !!r.urgent, false);
  sc.eq('그 날엔 따로 선 할일이 새 하위로', texts(one), ['스트레칭', '달리기']);
  sc.eq('따로 선 할일은 체크 · 긴급을 그대로', [one.subs[0].done, one.urgent], [true, true]);
  sc.eq('따로 선 할일은 같은 묶음 · 규칙은 없음', [one.rid, one.repeat], ['r1', undefined]);
  api.materializeRepeatsFor('2026-11-02');
  sc.eq('내일은 예전 하위로 생긴다', texts(at(ST, '2026-11-02')[0]), ['스트레칭']);
  api.materializeRepeatsFor(T);
  sc.eq('그 날 두 벌이 되지 않는다', at(ST, T).length, 2);
}

console.log('시나리오 4 — 오늘 실체에서 "이번 및 이후" → 원본은 어제까지, 오늘이 새 원본. 앞날 실체는 지우지 않고 옮겨 단다');
{
  const d = series();
  d['2026-11-02'].big.am[0].subs = [sub('스트레칭', true)];   // 앞날에 미리 체크해 둔 것
  d['2026-11-02'].big.am[0].urgent = true;
  const { ST, api } = makeEnv(d);
  const before = addSubToday(ST, api);
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'future');
  const root = at(ST, '2026-10-30')[0], today = at(ST, T)[0], next = at(ST, '2026-11-02')[0];
  sc.eq('옛 원본은 어제까지', root.repeat.until, '2026-10-31');
  sc.eq('옛 원본의 하위는 그대로', texts(root), ['스트레칭']);
  sc.eq('지난 실체도 그대로', [at(ST, '2026-10-31')[0].rid, texts(at(ST, '2026-10-31')[0])], ['r1', ['스트레칭']]);
  sc.eq('오늘이 새 원본(규칙을 든다)', !!(today.repeat && today.repeat.daily), true);
  sc.eq('새 묶음 이름표', today.rid !== 'r1', true);
  sc.eq('앞날 실체는 새 묶음으로 옮겨 달린다', next.rid, today.rid);
  sc.eq('앞날 실체에 새 하위', texts(next), ['스트레칭', '달리기']);
  sc.eq('앞날에 해 둔 체크 · 긴급은 지킨다', [next.subs[0].done, next.urgent], [true, true]);
  api.materializeRepeatsFor('2026-11-02');
  sc.eq('다시 열어도 두 벌이 되지 않는다', at(ST, '2026-11-02').length, 1);
  api.materializeRepeatsFor('2026-11-03');
  sc.eq('새로 생기는 날은 새 원본을 따른다', [at(ST, '2026-11-03').length, texts(at(ST, '2026-11-03')[0])], [1, ['스트레칭', '달리기']]);
}

console.log('시나리오 5 — 원본에서 "이번 및 이후" = 원본과 앞날 모두 (원본이 첫 날이라 쪼갤 것이 없다)');
{
  const d = {
    [T]: day([{ text: '운동', done: false, daily: true, rid: 'r1', repeat: rep() }]),
    '2026-11-02': day([{ text: '운동', done: false, daily: true, rid: 'r1' }]),
  };
  const { ST, api } = makeEnv(d);
  const root = at(ST, T)[0];
  const before = api._repPropSnap(root);
  root.flag = true;
  api._repPropApply('big', 'am', 0, T, ['flag'], before, 'future');
  sc.eq('원본은 그대로 원본', !!root.repeat && !root.repeat.until, true);
  sc.eq('앞날 실체도 중요 표시', at(ST, '2026-11-02')[0].flag, true);
}

console.log('시나리오 6 — 메모 · 연락할 일 표시도 같은 길 (지우기도 퍼진다)');
{
  const d = series({ memo: '헬스장 6시', contactTask: true });
  const { ST, api } = makeEnv(d);
  const it = at(ST, T)[0];
  const before = api._repPropSnap(it);
  delete it.memo; it.contactTask = false;
  api._repPropApply('big', 'am', 0, T, ['memo', 'contactTask'], before, 'all');
  sc.eq('원본의 메모가 지워진다', 'memo' in at(ST, '2026-10-30')[0], false);
  sc.eq('앞날 메모도', 'memo' in at(ST, '2026-11-02')[0], false);
  sc.eq('연락할 일 표시도 풀린다', [at(ST, '2026-10-30')[0].contactTask, at(ST, '2026-11-02')[0].contactTask], [false, false]);
  sc.eq('지난 실체의 메모는 기록이라 그대로', at(ST, '2026-10-31')[0].memo, '헬스장 6시');
}

console.log('시나리오 7 — 하위 지우기 · 순서 바꾸기도 글자 목록 그대로 퍼진다 · 다 지우면 판도 닫힌다');
{
  const d = series();
  ['2026-10-30', '2026-10-31', T, '2026-11-02'].forEach(k => { d[k].big.am[0].subs = [sub('A'), sub('B', k === '2026-11-02'), sub('C')]; d[k].big.am[0].subOpen = true; });
  const { ST, api } = makeEnv(d);
  const it = at(ST, T)[0];
  let before = api._repPropSnap(it);
  it.subs = [it.subs[2], it.subs[1]];   // A 지우고 C·B 순서로
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'all');
  sc.eq('앞날도 C · B', texts(at(ST, '2026-11-02')[0]), ['C', 'B']);
  sc.eq('앞날 B 의 체크는 따라 움직인다', at(ST, '2026-11-02')[0].subs.map(s => s.done), [false, true]);
  before = api._repPropSnap(it);
  delete it.subs; delete it.subOpen;
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'all');
  sc.eq('다 지우면 앞날도 subs · subOpen 키가 사라진다', ['subs' in at(ST, '2026-11-02')[0], 'subOpen' in at(ST, '2026-11-02')[0]], [false, false]);
}

console.log('시나리오 8 — 앞날 실체에 하위가 생기면 그 날 부모의 완료가 풀린다 (하위가 다 끝나야 완료)');
{
  const d = series();
  d['2026-11-02'].big.am[0].done = true;
  d['2026-11-02'].big.am[0].subs = [sub('스트레칭', true)];
  const { ST, api } = makeEnv(d);
  const before = addSubToday(ST, api);
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'all');
  sc.eq('11/2 부모는 미완료로', at(ST, '2026-11-02')[0].done, false);
}

console.log('시나리오 9 — 물을지 말지: 하위는 글자만 본다 (체크만 바뀐 건 묻지 않는다)');
{
  const { api } = makeEnv({});
  const a = { text: 'x', subs: [sub('A')] }, b = { text: 'x', subs: [sub('A', true)] };
  sc.eq('체크만 다르면 같은 것', api._repPropKey(api._repPropSnap(a), ['subs']) === api._repPropKey(api._repPropSnap(b), ['subs']), true);
  b.subs.push(sub('B'));
  sc.eq('하위가 늘면 다른 것', api._repPropKey(api._repPropSnap(a), ['subs']) === api._repPropKey(api._repPropSnap(b), ['subs']), false);
  sc.eq('메모 차이도 잡는다', api._repPropKey(api._repPropSnap({ memo: '1' }), ['memo']) === api._repPropKey(api._repPropSnap({}), ['memo']), false);
}

console.log('시나리오 10 — 반복 아닌 할일은 손대지 않는다');
{
  const { ST, api, log } = makeEnv({ [T]: day([{ text: '빨래', done: false, subs: [sub('A')] }]) });
  const it = at(ST, T)[0];
  const before = api._repPropSnap(it);
  it.subs.push(sub('B'));
  sc.eq('0 을 돌려준다', api._repPropApply('big', 'am', 0, T, ['subs'], before, 'all'), 0);
  sc.eq('토스트도 없다', log.toasts.length, 0);
}

console.log('시나리오 11 — 매주 반복을 "이번 및 이후" 로 쪼개도 매주로 남는다');
{
  const wk = { daily: false, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: true, weeksOfMonth: [1, 2, 3, 4, 5] };
  const d = {
    '2026-10-25': day([{ text: '주간회의', done: true, daily: true, rk: 'w', rid: 'w1', repeat: wk }]),
    [T]: day([{ text: '주간회의', done: false, daily: true, rk: 'w', rid: 'w1' }]),
  };
  const { ST, api } = makeEnv(d);
  const it = at(ST, T)[0];
  const before = api._repPropSnap(it);
  it.subs = [sub('안건')];
  api._repPropApply('big', 'am', 0, T, ['subs'], before, 'future');
  sc.eq('새 원본도 매주', [it.repeat.weekly, it.repeat.daily, it.rk], [true, false, 'w']);
  api.materializeRepeatsFor('2026-11-05');
  sc.eq('주중엔 안 생긴다', at(ST, '2026-11-05').length, 0);
  api.materializeRepeatsFor('2026-11-08');
  sc.eq('다음 주 같은 요일에 새 하위로', texts(at(ST, '2026-11-08')[0]), ['안건']);
}

console.log('시나리오 12 — (덤) 원본의 글자를 "이 할일만" 고치면 그 날 것에 하위 · 메모가 따라간다');
{
  const d = { [T]: day([{ text: '운동', done: false, daily: true, rid: 'r1', repeat: rep(), subs: [sub('스트레칭', true)], memo: '6시' }]) };
  const { ST, api } = makeEnv(d);
  at(ST, T)[0].text = '아침 운동';
  api._taskTextApply('big', 'am', 0, '운동', '아침 운동', 'one', T);
  const one = at(ST, T)[1];
  sc.eq('그 날 것의 글자', one.text, '아침 운동');
  sc.eq('하위가 체크까지 따라간다 (예전엔 빠졌다)', one.subs, [sub('스트레칭', true)]);
  sc.eq('메모도', one.memo, '6시');
}

sc.done();
