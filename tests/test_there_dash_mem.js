// There 대시보드 — 기기별 기억 · 탭 고정 · 다시 누르면 오늘 · 좌우 밀기 (HB 2026-10-15)
//
// 규칙
//  ① 열 때 탭: 부른 쪽이 콕 집은 탭 > 고정한 탭 > 마지막으로 연 탭 > 주 · 부른 쪽이 '권하기만'(soft) 하면 고정이 이긴다
//  ② 탭을 길게 누르기(터치) · 우클릭(마우스) = 고정 / 해제. 고정한 탭 글자 위에 점(.pin). 한 번에 하나.
//  ③ 탭마다 마지막으로 본 날 / 주 / 달을 따로 기억한다 — 열려 있는 동안만. 새로 열면 세 탭 모두 오늘 (HB 2026-10-27 P5)
//  ④ 이미 열린 탭을 다시 누르면 오늘 기준
//  ⑤ 화면 어디서든 좌우로 밀면 그 탭 안에서 이전 / 다음 (왼쪽 가장자리 시작과 세로 밀기는 뺀다)
//  ⑥ 기억은 이 기기의 localStorage 에만 (store 이름 칸)
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = fs.readFileSync(path.join(__dirname, '..', 'tools', 'there-dash.js'), 'utf8');

const mem = {};
const ctx = {
  console,
  localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } },
  document: { getElementById: () => null, createElement: () => ({}), head: { appendChild() {} }, addEventListener() {} },
  navigator: {}, Date, JSON, Math, setTimeout, clearTimeout
};
vm.createContext(ctx);
vm.runInContext(SRC + '\nthis.T = TDASH;', ctx);
const T = ctx.T;
const TODAY = '2026-10-15';

function mk(opts) {
  const L = {};
  const el = {
    classList: { add() {} }, scrollTop: 0, innerHTML: '',
    addEventListener(n, f) { (L[n] = L[n] || []).push(f); }
  };
  const m = T.mount(el, Object.assign({ today: TODAY, store: 'tst' }, opts || {}));
  const fire = (n, e) => (L[n] || []).forEach(f => f(e));
  const btn = (td, v) => ({ dataset: { td, v }, disabled: false });
  const click = (td, v) => { const b = btn(td, v); el.onclick({ target: { closest: () => b }, stopPropagation() {} }); };
  const ctxmenu = v => { const b = btn('view', v); let pd = 0; fire('contextmenu', { target: { closest: () => b }, preventDefault() { pd = 1; }, stopPropagation() {} }); return pd; };
  const swipe = (x0, y0, x1, y1) => {
    fire('touchstart', { touches: [{ clientX: x0, clientY: y0 }] });
    fire('touchmove', { touches: [{ clientX: x1, clientY: y1 }] });
    fire('touchend', { changedTouches: [{ clientX: x1, clientY: y1 }] });
  };
  return { m, S: m.state, el, click, ctxmenu, swipe };
}
const wait = ms => { const t = Date.now(); while (Date.now() - t < ms); };   // 길게 누른 직후 0.7초는 따라오는 클릭을 삼킨다
const reset = () => { Object.keys(mem).forEach(k => delete mem[k]); };

console.log('시나리오 1 — 열 때 탭: 처음은 주, 그 뒤엔 마지막으로 연 탭');
{
  reset();
  let d = mk();
  sc.eq('처음은 주', d.S.view, 'week');
  d.click('view', 'month');
  d = mk();
  sc.eq('마지막으로 연 탭(달)으로 열린다', d.S.view, 'month');
  d = mk({ view: 'day', at: '2026-10-10' });
  sc.eq('부른 쪽이 콕 집은 탭이 우선', [d.S.view, d.S.at], ['day', '2026-10-10']);
}

console.log('\n시나리오 2 — 길게 누르기 · 우클릭 = 고정 / 해제');
{
  reset();
  let d = mk();
  d.click('view', 'week');
  sc.eq('우클릭은 기본 메뉴를 막는다', d.ctxmenu('day'), 1);
  sc.eq('D 가 고정된다', d.S.pin, 'day');
  sc.eq('고정한 탭 글자에만 점(.pin)', /class="pin"|class="[^"]*\bpin\b[^"]*" data-td="view" data-v="day"/.test(d.el.innerHTML) && (d.el.innerHTML.match(/\bpin\b/g) || []).length === 1, true);
  d.click('view', 'month');   // 마지막으로 연 탭은 달이지만
  d = mk();
  sc.eq('고정한 탭이 마지막 탭보다 먼저 열린다', d.S.view, 'day');
  d.ctxmenu('week');
  sc.eq('다른 탭을 고정하면 점이 옮겨 간다 (한 번에 하나)', d.S.pin, 'week');
  d.ctxmenu('week');
  sc.eq('다시 누르면 해제', d.S.pin, null);
  sc.eq('점이 사라진다', /\bpin\b/.test(d.el.innerHTML), false);
  d.click('view', 'month');
  sc.eq('길게 누른 직후의 클릭은 삼킨다 (탭이 바뀌지 않는다)', d.S.view, 'day');
  wait(720);
  d.click('view', 'month');
  d = mk();
  sc.eq('해제 뒤에는 마지막으로 열었던 탭을 연다', d.S.view, 'month');
}

console.log('\n시나리오 3 — 탭마다 마지막으로 본 날 / 주 / 달을 따로 기억한다');
{
  reset();
  let d = mk({ view: 'week' });
  d.click('prev');               // 지난주
  sc.eq('주: 한 주 전 월요일', d.S.at, '2026-10-05');
  d.click('view', 'day');
  sc.eq('일간으로 바꾸면 주간의 첫날이 아니라 오늘 (일간의 마지막 날)', d.S.at, TODAY);
  d.click('prev'); d.click('prev');
  sc.eq('일간 이틀 전', d.S.at, '2026-10-13');
  d.click('view', 'week');
  sc.eq('주간으로 돌아가면 아까 보던 주', d.S.at, '2026-10-05');
  d.click('view', 'day');
  sc.eq('일간으로 돌아가면 아까 보던 날', d.S.at, '2026-10-13');
  d = mk({ view: 'day' });
  sc.eq('닫았다 새로 열면 일간은 오늘 (P5)', d.S.at, TODAY);
  d.click('view', 'week');
  sc.eq('새로 연 뒤 주간도 이번 주 (P5)', d.S.at, TODAY);
  d.click('prev');
  d.click('view', 'day'); d.click('view', 'week');
  sc.eq('열린 동안은 옮겨 둔 주를 기억', d.S.at, '2026-10-05');
  d = mk();
  sc.eq('다시 열면 마지막 탭(주)으로, 날짜는 오늘', [d.S.view, d.S.at], ['week', TODAY]);
  d.click('view', 'month');
  d.click('prev');
  sc.eq('달: 한 달 전 1일', d.S.at, '2026-09-01');
}

console.log('\n시나리오 4 — 이미 열린 탭을 다시 누르면 오늘 기준');
{
  reset();
  const d = mk({ view: 'day' });
  d.click('prev'); d.click('prev');
  sc.eq('이틀 전에 있다가', d.S.at, '2026-10-13');
  d.click('view', 'day');
  sc.eq('D 를 다시 누르면 오늘', d.S.at, TODAY);
  d.click('view', 'month'); d.click('prev');
  d.click('view', 'month');
  sc.eq('M 을 다시 누르면 이번 달(오늘이 든 달)', d.S.at, TODAY);
}

console.log('\n시나리오 5 — 좌우 밀기 = 탭 안에서 이전 / 다음 (탭 전환이 아니다)');
{
  reset();
  const d = mk({ view: 'day' });
  d.swipe(200, 300, 300, 305);
  sc.eq('오른쪽으로 밀면 이전 날', [d.S.view, d.S.at], ['day', '2026-10-14']);
  d.swipe(300, 300, 190, 300);
  sc.eq('왼쪽으로 밀면 다음 날 (탭은 그대로)', [d.S.view, d.S.at], ['day', TODAY]);
  d.swipe(300, 300, 190, 300);
  sc.eq('오늘 너머로는 가지 않는다', d.S.at, TODAY);
  d.swipe(10, 300, 150, 300);
  sc.eq('왼쪽 가장자리에서 시작한 밀기는 전체 화면 닫기 몫이라 뺀다', d.S.at, TODAY);
  d.swipe(200, 300, 270, 420);
  sc.eq('세로로 더 많이 움직인 것은 스크롤이다', d.S.at, TODAY);
  d.swipe(200, 300, 230, 300);
  sc.eq('짧은 밀기(60px 미만)는 무시', d.S.at, TODAY);
  d.click('view', 'week');
  d.swipe(200, 300, 320, 300);
  sc.eq('주: 오른쪽으로 밀면 한 주 전', d.S.at, '2026-10-05');
  d.click('view', 'month');
  d.swipe(200, 300, 320, 300);
  sc.eq('달: 오른쪽으로 밀면 한 달 전', d.S.at, '2026-09-01');
}

console.log('\n시나리오 6 — 기억은 이 기기(localStorage) 의 store 칸에만');
{
  reset();
  const d = mk({ view: 'day' });
  d.ctxmenu('month');
  const keys = Object.keys(mem);
  sc.eq('칸 하나만 쓴다', keys, ['tst.v1']);
  const v = JSON.parse(mem['tst.v1']);
  sc.eq('고정 · 마지막 탭만 든다 (탭별 날짜는 남기지 않는다 · P5)', [v.pin, v.last, v.at], ['month', 'day', undefined]);
  mem['tst.v1'] = '{망가진 글';
  const d2 = mk();
  sc.eq('망가진 기억은 무시하고 처음처럼', [d2.S.view, d2.S.pin], ['week', null]);
  mem['tst.v1'] = JSON.stringify({ pin: 'year', last: 'x', at: { day: '2099-01-01', week: 'oops' } });
  const d3 = mk();
  sc.eq('엉뚱한 값과 미래 날짜는 걸러낸다', [d3.S.view, d3.S.pin, d3.S.ats.day, d3.S.ats.week], ['week', null, TODAY, TODAY]);
}
// ①-soft 기도노트 기록 › 합계 줄 = '달' 을 권하기만 — 고정이 이긴다 (HB 2026-10-19 디버그: 점은 보이는데 늘 달로 열림)
{
  for (const k in mem) delete mem[k];
  mem['tst.v1'] = JSON.stringify({ pin: 'day', last: 'week', at: { day: '2026-10-14' } });
  const a = mk({ view: 'month', soft: true, at: '2026-09-01' });
  sc.eq('⭐①-soft 하루로 고정했으면 권한 달이 아니라 하루 · 날짜는 오늘 (권한 날짜를 하루 탭에 쓰지 않는다 · P5)', [a.m.state.view, a.m.state.at], ['day', TODAY]);
  const b = mk({ view: 'month', at: '2026-09-01' });
  sc.eq('①-soft 콕 집은 것(soft 아님)은 예전대로 그 탭', [b.m.state.view, b.m.state.at], ['month', '2026-09-01']);
  mem['tst.v1'] = JSON.stringify({ pin: null, last: 'week' });
  const c = mk({ view: 'month', soft: true, at: '2026-09-01' });
  sc.eq('①-soft 고정이 없으면 권한 탭 · 날짜', [c.m.state.view, c.m.state.at], ['month', '2026-09-01']);
  mem['tst.v1'] = JSON.stringify({ pin: 'month', last: 'week' });
  const d = mk({ view: 'month', soft: true, at: '2026-09-01' });
  sc.eq('①-soft 권한 탭이 고정과 같으면 그 날짜로', [d.m.state.view, d.m.state.at], ['month', '2026-09-01']);
}
sc.done();
