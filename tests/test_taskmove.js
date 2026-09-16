// 할일을 다른 날짜로 옮기거나 복제할 때 **성격 표시가 따라가는지** 지킨다.
//
// 2026-09-16 HB 지적: 연락할 일로 표시한 할일을 '내일로' 옮기면 표시가 풀렸다.
// 까닭은 옮기는 자리마다 새 항목을 **손으로 나열해** 만들었기 때문이다 —
// 한 곳에 칸을 더해도 나머지 자리는 모르고 지나간다. 그래서 옮기기는
// `_movedTaskCopy`, 복제는 `_freshTaskCopy` 한 곳씩만 쓰게 모았고,
// 이 테스트가 네 가지 길(내일로·다음 주로·어제로·날짜 지정)을 모두 지나간다.
//
// 규칙 — 들고 가는 것: 글자·완료 여부·매일 반복·중요·연락할 일·이월 횟수
//        두고 가는 것: 긴급 표시(날짜마다 2개 한도가 따로 있다)
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const SRC = slice('function _movedTaskCopy(item,days){', '// "8월 17일 월요일');

const T = '2026-09-16';
function makeEnv(items, todayK) {
  const ST = { days: {} };
  const log = { toasts: [] };
  const fakeEl = () => ({ style: {}, dataset: {}, classList: { add() {}, remove() {} } });
  const env = {
    ST,
    DR: { active: false },
    _taskMenuCtx: { type: 'big', secId: 'am', idx: 0 },
    viewDate: new Date(2026, 8, 16),
    z: n => String(n).padStart(2, '0'),
    tKey: d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : (todayK || T),
    addDays: (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; },
    getDay: k => {
      if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} };
      return ST.days[k];
    },
    save() {}, beforeSave() {},
    renderSecBody() {}, updateTotal() {}, refreshTaskViewsLive() {},
    closeTaskMenu() {}, cancelDragKeepingItem() {},
    showToast: t => log.toasts.push(t),
    _toastWithJump: t => log.toasts.push(t),
    _moveDateToastMsg: () => '날짜로 이동했어요',
    document: { getElementById: () => fakeEl() },
  };
  env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  env.getBigs(todayK || T, 'am').push(...items);
  const names = Object.keys(env);
  const body = SRC + '\nreturn {_movedTaskCopy,_dayKeyDiff,moveTaskTo,_freshTaskCopy,' +
    'duplicateTaskTo,moveTaskToPickedDate,duplicateTaskToPickedDate};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api, log };
}
const marked = () => ({
  text: '김집사님께 전화', done: false,
  flag: true, contactTask: true, daily: true,
  urgent: true, urgentRank: 1, urgentAt: 1000,
  manualCarryCount: 2, autoCarryCount: 3,
});
const at = (ST, k) => ((ST.days[k] && ST.days[k].big && ST.days[k].big.am) || []);

console.log('시나리오 1 — 메뉴로 옮기면 성격 표시가 따라간다 (HB 가 만난 버그)');
{
  const { ST, api } = makeEnv([marked()], T);
  api.moveTaskTo(1);
  const it = at(ST, '2026-09-17')[0];
  sc.eq('원래 날짜에서는 사라진다', at(ST, T).length, 0);
  sc.eq('연락할 일 표시가 따라간다', it.contactTask, true);
  sc.eq('중요 표시도 따라간다', it.flag, true);
  sc.eq('매일 반복도 따라간다', it.daily, true);
  sc.eq('긴급 표시는 두고 간다', it.urgent, undefined);
  sc.eq('긴급 순위도 두고 간다', [it.urgentRank, it.urgentAt], [undefined, undefined]);
  sc.eq("'내일로' 는 수동 이월을 하나 올린다", it.manualCarryCount, 3);
  sc.eq('자동 이월 횟수는 그대로', it.autoCarryCount, 3);
}

console.log('\n시나리오 2 — 다음 주로 · 어제로도 같다');
{
  const { ST, api } = makeEnv([marked()], T);
  api.moveTaskTo(7);
  const it = at(ST, '2026-09-23')[0];
  sc.eq('연락할 일 표시 유지', it.contactTask, true);
  sc.eq('큰 뜀은 수동 이월을 올리지 않는다', it.manualCarryCount, 2);
}
{
  const { ST, api } = makeEnv([marked()], T);
  api.moveTaskTo(-1);
  sc.eq('어제로도 연락할 일 표시 유지', at(ST, '2026-09-15')[0].contactTask, true);
}

console.log('\n시나리오 3 — 완료한 할일을 옮겨도 완료가 풀리지 않는다');
{
  const done = Object.assign(marked(), { done: true });
  const { ST, api } = makeEnv([done], T);
  api.moveTaskTo(1);
  const it = at(ST, '2026-09-17')[0];
  sc.eq('완료 표시 유지', it.done, true);
  sc.eq('완료한 것은 미룬 게 아니라 이월을 세지 않는다', it.manualCarryCount, 2);
}

console.log("\n시나리오 4 — '날짜 지정' 이동도 메뉴와 똑같이 굴러간다");
{
  const { ST, api } = makeEnv([marked()], T);
  api.moveTaskToPickedDate('2026-09-20');
  const it = at(ST, '2026-09-20')[0];
  sc.eq('원래 날짜에서 사라진다', at(ST, T).length, 0);
  sc.eq('연락할 일 표시가 따라간다', it.contactTask, true);
  sc.eq('중요 표시도 따라간다', it.flag, true);
  sc.eq('긴급 표시는 두고 간다 — 그 날의 2개 한도를 몰래 넘기지 않는다', it.urgent, undefined);
}
{
  const { ST, api } = makeEnv([marked()], T);
  api.moveTaskToPickedDate('2026-09-17');
  sc.eq("내일을 고르면 '내일로' 와 같이 수동 이월을 올린다",
        at(ST, '2026-09-17')[0].manualCarryCount, 3);
}

console.log('\n시나리오 5 — 복제도 성격 표시를 물려받되 진행 상태는 새로 시작한다');
{
  const done = Object.assign(marked(), { done: true });
  const { ST, api } = makeEnv([done], T);
  api.duplicateTaskTo(1);
  const it = at(ST, '2026-09-17')[0];
  sc.eq('원본은 그대로 남는다', at(ST, T).length, 1);
  sc.eq('연락할 일 표시를 물려받는다', it.contactTask, true);
  sc.eq('중요 표시도 물려받는다', it.flag, true);
  sc.eq('사본은 안 한 상태로 시작한다', it.done, false);
  sc.eq('이월 횟수는 물려받지 않는다', [it.manualCarryCount, it.autoCarryCount], [undefined, undefined]);
  sc.eq('긴급 표시는 물려받지 않는다', it.urgent, undefined);
}
{
  const { ST, api } = makeEnv([marked()], T);
  api.duplicateTaskToPickedDate('2026-09-25');
  sc.eq("'날짜 지정' 복제도 연락할 일 표시를 물려받는다",
        at(ST, '2026-09-25')[0].contactTask, true);
}

console.log('\n시나리오 6 — 옮기기와 복제는 성격 표시 목록을 함께 쓴다');
{
  const { api } = makeEnv([marked()], T);
  const moved = api._movedTaskCopy(marked(), 0);
  const copied = api._freshTaskCopy(marked());
  const marks = o => ['daily', 'flag', 'contactTask'].filter(k => o[k]);
  sc.eq('두 길이 같은 표시를 들고 간다', marks(moved), marks(copied));
  sc.eq('세 가지 표시가 모두 들어 있다', marks(moved), ['daily', 'flag', 'contactTask']);
}

sc.done();
