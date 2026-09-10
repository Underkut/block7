// 할일의 '매일 반복' — 다음 날로 넘어오는가 (2026-09-10 HB 신고)
//
// HB 신고: "할일뷰에서 매일반복을 걸어도 아무 일도 안 일어난다."
// 까닭 — ensureDailyRepeats() 는 "가장 최근 과거 날짜"에서 daily 표시된
// 할일을 오늘로 베껴 온다. 그런데 ST.days 에는 **빈 날짜 껍데기**가 섞인다
// (D뷰에서 다른 날로 넘겨보기만 해도 getDay() 가 만든다). 껍데기가 가장
// 최근 과거 날짜로 잡히면 베껴올 것이 없어 오늘도 빈 껍데기로 남고,
// 그래서 다음 날도 똑같이 멈춘다 — 한 번 걸리면 스스로 풀리지 않는다.
//
// ⚠️ 저장 계층(ST.days)에 **쓰는** 기능이다. 시나리오 3 이 "베껴오다 겹쳐
//    쌓지 않는가"를 지킨다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const CODE = slice('function _dayHasTasks(d){', 'function moveTaskTo(days){');

function makeEnv(days, todayK) {
  const ST = { days, lastDailyRepeatKey: null };
  const SECS = [{ id: 'am' }, { id: 'pm' }];
  const todayKey = () => todayK;
  const getDay = k => {
    if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} };
    return ST.days[k];
  };
  const getBigs = (k, id) => { const d = getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
  const getSmalls = (k, id) => { const d = getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
  const rawSave = () => {};
  const fn = new Function('ST', 'SECS', 'todayKey', 'getBigs', 'getSmalls', 'rawSave',
    CODE + '\nreturn ensureDailyRepeats;');
  return { ST, run: fn(ST, SECS, todayKey, getBigs, getSmalls, rawSave) };
}
const bigsOf = (ST, k) => (ST.days[k]?.big?.am || []).map(b => b.text);

console.log('시나리오 1 — 어제 매일반복 할일이 오늘로 넘어온다');
{
  const { ST, run } = makeEnv({
    '2026-09-09': { big: { am: [{ text: '매일할일', done: true, daily: true }, { text: '한번할일', done: true }] }, small: {}, trash: [], events: {} }
  }, '2026-09-10');
  run();
  sc.eq('매일 표시된 것만 넘어온다', bigsOf(ST, '2026-09-10'), ['매일할일']);
  sc.eq('넘어온 것은 안 한 상태', ST.days['2026-09-10'].big.am[0].done, false);
  sc.eq('매일 표시도 함께 온다', ST.days['2026-09-10'].big.am[0].daily, true);
}

console.log('\n시나리오 2 — 어제가 빈 껍데기여도 멈추지 않는다 (신고된 고장)');
{
  const { ST, run } = makeEnv({
    '2026-09-08': { big: { am: [{ text: '매일할일', done: true, daily: true }] }, small: {}, trash: [], events: {} },
    '2026-09-09': { big: {}, small: {}, trash: [], events: {} }   // 넘겨보기만 해서 생긴 껍데기
  }, '2026-09-10');
  run();
  sc.eq('껍데기를 건너뛰고 그저께에서 가져온다', bigsOf(ST, '2026-09-10'), ['매일할일']);
}

console.log('\n시나리오 2-2 — 껍데기가 여러 날 이어져도 가져온다');
{
  const { ST, run } = makeEnv({
    '2026-09-05': { big: { am: [{ text: '매일할일', done: true, daily: true }] }, small: {}, trash: [], events: {} },
    '2026-09-06': { big: { am: [] }, small: { am: [] }, trash: [], events: {} },
    '2026-09-07': { big: {}, small: {}, trash: [], events: { am: [{ id: 'e1', text: '일정만' }] } },
    '2026-09-09': { big: {}, small: {}, trash: [], events: {} }
  }, '2026-09-10');
  run();
  sc.eq('할일이 든 마지막 날에서 가져온다', bigsOf(ST, '2026-09-10'), ['매일할일']);
}

console.log('\n시나리오 3 — 같은 할일을 두 번 쌓지 않는다');
{
  const { ST, run } = makeEnv({
    '2026-09-09': { big: { am: [{ text: '매일할일', done: true, daily: true }] }, small: {}, trash: [], events: {} },
    '2026-09-10': { big: { am: [{ text: '매일할일', done: false, daily: true }] }, small: {}, trash: [], events: {} }
  }, '2026-09-10');
  run();
  sc.eq('이미 있으면 그대로', bigsOf(ST, '2026-09-10'), ['매일할일']);
}

console.log('\n시나리오 4 — 하루에 한 번만 돈다');
{
  const { ST, run } = makeEnv({
    '2026-09-09': { big: { am: [{ text: '매일할일', done: true, daily: true }] }, small: {}, trash: [], events: {} }
  }, '2026-09-10');
  run();
  ST.days['2026-09-10'].big.am.length = 0;   // 사용자가 오늘 것을 지웠다
  run();                                      // 다시 그려도 되살아나지 않는다
  sc.eq('지운 것을 되살리지 않는다', bigsOf(ST, '2026-09-10'), []);
  sc.eq('돈 날짜를 기억한다', ST.lastDailyRepeatKey, '2026-09-10');
}

console.log('\n시나리오 5 — 과거에 할일이 하나도 없으면 조용히 넘어간다');
{
  const { ST, run } = makeEnv({ '2026-09-09': { big: {}, small: {}, trash: [], events: {} } }, '2026-09-10');
  run();
  sc.eq('아무것도 만들지 않는다', ST.days['2026-09-10'], undefined);
  sc.eq('돈 날짜는 기억한다', ST.lastDailyRepeatKey, '2026-09-10');
}

sc.done();
