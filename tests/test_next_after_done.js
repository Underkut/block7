// 할일 메뉴 '완료 후 다음 할일' + 글에 '@' 가 새로 들어가면 연락할 일 자동 표시 (HB 2026-10-15)
//
// 규칙
//  ① 누른 할일은 완료로 체크한다 (하위 할일도 따라 완료 · 긴급 표시는 풀린다) — 제자리에 남는다
//  ② 고른 날짜 / 구간에 새 할일이 하나 생긴다. 글은 '(원래 글) 완료했고, 이제' — 글 끝 공백은 한 칸으로
//  ③ 새 할일은 처음부터 하는 일이다: 완료 아님 · 이월 횟수 없음 · 연락할 일 표시는 물려받는다
//  ④ 화면이 그 날로 가고 새 입력창에 커서가 글 맨 끝에 놓인다
//  ⑤ '@' 자동 표시는 새로 적을 때(_newTask)와, 편집을 마칠 때 **새로** 생긴 '@' 에만 — 이미 있던 글은 건드리지 않는다
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = slice('// ── 완료 후 다음 할일 ──', 'let _secPickSpec=null;') + '\n' +
  slice('// 새로 적는 할일 — 글에', 'function toggleTaskContact(){');

const T = '2026-10-15';
function makeEnv(items, tabId) {
  const ST = { days: {} };
  const log = { go: [], focus: [], render: [], toast: [], nav: [] };
  let cur = T;   // goToDate 가 보는 날을 바꾼다
  const inp = { value: '', focus() { log.focus.push('focus'); }, setSelectionRange(a, b) { log.sel = [a, b]; }, scrollIntoView() {} };
  const env = {
    ST,
    _taskMenuCtx: { type: 'big', secId: 'am', idx: 0 },
    viewDate: new Date(2026, 9, 15),
    tKey: d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : cur,
    addDays: (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; },
    getBigs: (k, id) => { const d = (ST.days[k] = ST.days[k] || { big: {}, small: {} }); return (d.big[id] = d.big[id] || []); },
    getSmalls: (k, id) => { const d = (ST.days[k] = ST.days[k] || { big: {}, small: {} }); return (d.small[id] = d.small[id] || []); },
    save() {}, rawSave() {}, beforeSave() {},
    renderSecBody: id => log.render.push(id), updateTotal() {}, refreshTaskViewsLive() {},
    showToast: t => log.toast.push(t),
    _moveLabel: (d, from, to) => (d === 7 ? '다음 주' : d === 1 ? '내일' : '오늘') + ' ' + to + '로',
    _withSecRo: (d, sec) => d + ' ' + sec + '로',
    _dayLabel: k => k,
    _dayKeyDiff: (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000),
    navigateDate: n => { log.nav.push(n); cur = log.nav.length ? cur : cur; },
    closeTaskMenu() {}, goToDate: k => { cur = k; log.go.push(k); },
    _subSetAll: (it, done) => { (it.subs || []).forEach(s => { s.done = !!done; }); },
    _clearUrgentOnDone: it => { delete it.urgent; delete it.urgentRank; },
    _revealSec: id => { log.reveal = (log.reveal || []).concat(id); return false; },
    _datePickArmed: () => true, _secPickOn: () => false, _secPickOpen() {},
    document: { querySelector: sel => (sel === '.tab.on' ? { id: tabId } : inp), activeElement: null },
    setTimeout: f => f(),
  };
  env.getBigs(T, 'am').push(...items);
  const names = Object.keys(env);
  const body = SRC + '\nreturn {nextAfterDoneTo,nextAfterDonePicked,_autoContactMark,_newTask};';
  const api = new Function(...names, body)(...names.map(n => env[n]));
  return { ST, api, log, inp };
}
const at = (ST, k, sec) => ((ST.days[k] && ST.days[k].big && ST.days[k].big[sec || 'am']) || []);

console.log('시나리오 1 — 내일로: 원래 할일은 완료, 내일에 새 할일');
{
  const { ST, api, log, inp } = makeEnv([{ text: '김집사님께 전화  ', done: false, urgent: true, urgentRank: 1, contactTask: true, manualCarryCount: 2,
    subs: [{ text: 'a', done: false }] }]);
  inp.value = '김집사님께 전화 완료했고, 이제';
  api.nextAfterDoneTo(1);
  const old = at(ST, T)[0], nu = at(ST, '2026-10-16')[0];
  sc.eq('원래 할일은 제자리에서 완료', [at(ST, T).length, old.done], [1, true]);
  sc.eq('하위도 따라 완료 · 긴급은 풀림', [old.subs[0].done, old.urgent], [true, undefined]);
  sc.eq('새 할일 글: 끝 공백을 한 칸으로 줄이고 이어 붙인다', nu.text, '김집사님께 전화 완료했고, 이제');
  sc.eq('새 할일은 완료 아님 · 이월 횟수 없음', [nu.done, nu.manualCarryCount, nu.autoCarryCount], [false, undefined, undefined]);
  sc.eq('연락할 일 표시는 물려받는다', nu.contactTask, true);
  sc.eq('화면이 그 날로 간다', log.go, ['2026-10-16']);
  sc.eq('커서가 글 맨 끝', log.sel, [inp.value.length, inp.value.length]);
  sc.eq('토스트로 무슨 일인지 알린다 (완료 체크 · 새 할일이 생긴 곳 · 이어서 적기)',
    /완료 체크했어요/.test(log.toast[0]) && /내일 am로 다음 할일을 만들었어요/.test(log.toast[0]) && /이어서 적어 주세요/.test(log.toast[0]), true);
}

console.log('\n시나리오 1-2 — D 탭에서는 날짜 넘김(navigateDate)으로 스르륵, 그 밖은 바로 이동');
{
  const e = makeEnv([{ text: '심방', done: false }], 'tabD');
  e.inp.value = '심방 완료했고, 이제';
  e.api.nextAfterDoneTo(7);
  sc.eq('D 탭: navigateDate(+7)', [e.log.nav, e.log.go], [[7], []]);
  const f = makeEnv([{ text: '심방', done: false }], 'tabW');
  f.api.nextAfterDoneTo(1);
  sc.eq('W 탭: goToDate', [f.log.nav, f.log.go], [[], ['2026-10-16']]);
}

console.log('\n시나리오 2 — 다음 주로 · 오늘 다른 구간으로');
{
  let e = makeEnv([{ text: '보고서', done: false }]);
  e.api.nextAfterDoneTo(7);
  sc.eq('다음 주 같은 구간에 새 할일', at(e.ST, '2026-10-22')[0].text, '보고서 완료했고, 이제');
  e = makeEnv([{ text: '보고서', done: false }]);
  e.api.nextAfterDoneTo(0, 'pm');
  sc.eq('오늘 오후 구간에 새 할일', at(e.ST, T, 'pm').map(x => x.text), ['보고서 완료했고, 이제']);
  sc.eq('같은 날이라 화면 이동은 없다', e.log.go, []);
  sc.eq('받는 구간도 다시 그린다', e.log.render.includes('pm'), true);
}

console.log('\n시나리오 3 — 날짜 지정');
{
  const e = makeEnv([{ text: '심방', done: false }]);
  e.api.nextAfterDonePicked('2026-11-02');
  sc.eq('고른 날짜에 새 할일', at(e.ST, '2026-11-02')[0].text, '심방 완료했고, 이제');
  sc.eq('그 날로 간다', e.log.go, ['2026-11-02']);
  sc.eq('원래 것은 완료', at(e.ST, T)[0].done, true);
}

console.log('\n시나리오 4 — 이미 완료한 할일도 문제없다 · 없는 할일은 아무 일 없다');
{
  const e = makeEnv([{ text: '끝낸 일', done: true }]);
  e.api.nextAfterDoneTo(1);
  sc.eq('이미 완료 그대로', at(e.ST, T)[0].done, true);
  sc.eq('새 할일은 생긴다', at(e.ST, '2026-10-16').length, 1);
  const f = makeEnv([]);
  f.api.nextAfterDoneTo(1);
  sc.eq('할일이 없으면(이미 사라짐) 만들지 않는다', Object.keys(f.ST.days).filter(k => k !== T && at(f.ST, k).length), []);
}

console.log("\n시나리오 5 — '@' 자동 연락 표시");
{
  const { api } = makeEnv([]);
  let it = { text: '@홍길동 전화', done: false };
  sc.eq("새로 생긴 '@' 는 표시한다", [api._autoContactMark(it, '전화'), it.contactTask], [true, true]);
  it = { text: '@홍길동 전화 급함', done: false };
  sc.eq("이미 '@' 가 있던 글은 건드리지 않는다 (직접 끈 표시를 되살리지 않는다)", [api._autoContactMark(it, '@홍길동 전화'), it.contactTask], [false, undefined]);
  it = { text: '그냥 일', done: false };
  sc.eq("'@' 가 없으면 아무것도 안 한다", [api._autoContactMark(it, '그냥'), it.contactTask], [false, undefined]);
  it = { text: 'a@b', done: false, contactTask: true };
  sc.eq('이미 표시된 것은 그대로', api._autoContactMark(it, 'a'), false);
}

console.log("\n시나리오 6 — 새로 적을 때도 '@' 가 있으면 처음부터 연락할 일");
{
  const { api } = makeEnv([]);
  sc.eq("'@' 가 든 새 할일은 연락할 일", api._newTask('@홍길동 전화'), { text: '@홍길동 전화', done: false, contactTask: true });
  sc.eq("'@' 가 없으면 평범한 새 할일", api._newTask('장보기'), { text: '장보기', done: false });
  sc.eq('글 중간의 @ 도 같다', api._newTask('내일 a@b 에게 메일').contactTask, true);
}

console.log('\n시나리오 7 — 꺼 둔 · 접어 둔 구간은 열어서 보여 준다 (_revealSec · _secClosed)');
{
  const SRC2 = slice('// ── 구간 열어 보이기', 'function _toastWithJump(');
  const mk = (vis, collapsed) => {
    const ST = { vis: vis.slice(), collapsed: collapsed.slice(), preset: 'x', prevVis: ['a'] };
    const SECS = [{ id: 'dawn' }, { id: 'am' }, { id: 'pm' }];
    let saves = 0, rendered = 0;
    const api = new Function('ST', 'SECS', 'beforeSave', 'save', 'renderSecs', SRC2 + '\nreturn {_secClosed,_revealSec};')(ST, SECS, () => {}, () => { saves++; }, () => { rendered++; });
    return { ST, api, n: () => ({ saves, rendered }) };
  };
  let e = mk(['am', 'pm'], []);
  sc.eq('꺼 둔 구간은 닫힘', [e.api._secClosed('dawn'), e.api._secClosed('am')], [true, false]);
  sc.eq('꺼 둔 구간을 켜고 차례대로 끼운다', [e.api._revealSec('dawn'), e.ST.vis, e.ST.preset], [true, ['dawn', 'am', 'pm'], null]);
  sc.eq('다시 그린다', e.n().rendered, 1);
  e = mk(['am', 'pm'], ['pm']);
  sc.eq('접어 둔 구간은 펼친다', [e.api._secClosed('pm'), e.api._revealSec('pm'), e.ST.collapsed], [true, true, []]);
  e = mk(['am'], []);
  sc.eq('이미 열려 있으면 아무 일 없다', [e.api._revealSec('am'), e.n().saves], [false, 0]);
}
sc.done();
