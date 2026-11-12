// 할일 메뉴의 '오늘 · 내일 · 다음 주 · 어제' 는 언제나 **진짜 오늘** 기준 (HB 2026-11-12)
//
// HB 신고: 오늘이 아닌 날(11/7)을 보면서 이동 · 복제를 하면, 보이는 날을 오늘로 쳐서 옮겼다
//          (11/7 에서 '내일로' → 11/8). HB 결정: "항상 진짜 오늘, 진짜 내일 — 보이고 있는 날이 아니라."
// 규칙
//  ① 이동 · 복제 · 지금 완료 후 다음의 목적지 = 진짜 오늘 + n (옮겨 오는 쪽은 보이는 날 그대로)
//  ② 메뉴 줄 옆 개수 · 구간 판도 같은 날을 본다 (보여 주는 숫자와 실제로 가는 곳이 같아야 한다)
//  ③ 보이는 날 = 목적지 · 같은 구간이면 옮기지 않고 알린다 — '어제 완료' 면 그 자리에서 완료만
//  ④ 수동 이월은 '내일로' 로 **앞으로** 갔을 때만 센다
//  ⑤ 검색 화면의 '복제'(같은 날에 하나 더)는 그 할일의 날 그대로
//  ⑥ 하루가 바뀌는 시각: 진짜 오늘은 todayKey() 를 따른다
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
const MOVESRC = SUBHELP + '\n' + slice('function _movedTaskCopy(item,days){', '// "8월 17일 월요일');
const REAL = slice('// ── 진짜 오늘 기준', '// toSec — 보낼 시간 구간');
const NEXTSRC = slice('// 두 날짜 사이가 며칠인지', '// toSec — 보낼 시간 구간') + '\n' +
  slice("// '내일 오전으로' · '다음 주 밤으로'", '// 복제된 할일은') + '\n' + slice('// 원본을 완료로 —', 'function duplicateTaskTo(') + '\n' +
  slice('// ── 완료 후 다음 할일 ──', 'let _secPickSpec=null;');
const FILL = slice('function _fillTaskMenuCounts(', '// ══════════ 구간 판');
const SPECF = slice('function _secPickSpecFor(', 'function _secPickRender(');

const TODAY = '2026-11-12';          // 진짜 오늘 (목)
const z = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
const dateOf = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };

function makeEnv(viewK, items, opts) {
  opts = opts || {};
  const ST = { days: {} };
  const log = { toasts: [], jumps: [], render: [], go: [], nav: [] };
  const env = {
    ST, DR: { active: false },
    _taskMenuCtx: { type: 'big', secId: 'am', idx: 0 },
    viewDate: dateOf(viewK),
    z, addDays,
    tKey: d => keyOf(d || dateOf(viewK)),
    todayKey: () => opts.today || TODAY,
    save() {}, beforeSave() {}, rawSave() {},
    renderSecBody: id => log.render.push(id), updateTotal() {}, refreshTaskViewsLive() {},
    closeTaskMenu() {}, cancelDragKeepingItem() {}, _tmSubReset() {}, _secPickBack() {},
    showToast: t => log.toasts.push(t),
    _toastWithJump: (t, k) => log.jumps.push([t, k]),
    _withSecRo: (d, sec) => d + ' ' + ({ am: '오전', pm: '오후' }[sec] || sec) + '으로',
    _euroRo: () => '로',
    _dayLabel: k => k,
    _moveDateToastMsg: (k, sec, verb) => k + ' ' + ({ am: '오전', pm: '오후' }[sec] || sec) + '으로 ' + (verb || '이동') + '했어요',
    _secPickOn: () => false, _secPickOpen() {}, _datePickArmed: () => true,
    _subSetAll: (it, d) => (it.subs || []).forEach(s => { s.done = !!d; }),
    _clearUrgentOnDone: it => { delete it.urgent; },
    _revealSec: () => false,
    navigateDate: n => log.nav.push(n), goToDate: k => log.go.push(k),
    _focusNewTaskInput() {},
    SECS: [{ id: 'am', name: '오전' }, { id: 'pm', name: '오후' }],
    document: { getElementById: () => ({ style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} } }),
                querySelector: () => ({ id: 'tabD' }), activeElement: null },
    setTimeout: f => f(),
  };
  env.getBigs = (k, id) => { const d = (ST.days[k] = ST.days[k] || { big: {}, small: {} }); return (d.big[id] = d.big[id] || []); };
  env.getSmalls = (k, id) => { const d = (ST.days[k] = ST.days[k] || { big: {}, small: {} }); return (d.small[id] = d.small[id] || []); };
  env.getBigs(viewK, 'am').push(...items);
  const names = Object.keys(env);
  const src = (opts.next ? NEXTSRC : MOVESRC) + '\nreturn {' +
    (opts.next ? 'nextAfterDoneTo,_realDayKey' : 'moveTaskTo,duplicateTaskTo,_realDayKey') + '};';
  const api = new Function(...names, src)(...names.map(n => env[n]));
  return { ST, api, log };
}
const at = (ST, k, sec) => ((ST.days[k] && ST.days[k].big && ST.days[k].big[sec || 'am']) || []).map(x => x.text);
const task = (o) => Object.assign({ text: '분파셀들 보고서', done: false }, o || {});

console.log('시나리오 1 — ⭐ HB 신고 그대로: 11/7 을 보며 이동 (진짜 오늘 11/12)');
{
  const cases = [[1, '내일로', '2026-11-13'], [7, '다음 주로', '2026-11-19'], [-1, '어제로', '2026-11-11']];
  cases.forEach(([days, name, want]) => {
    const { ST, api, log } = makeEnv('2026-11-07', [task()]);
    api.moveTaskTo(days);
    sc.eq(`${name} → ${want}`, at(ST, want), ['분파셀들 보고서']);
    sc.eq(`${name}: 보던 날(11/7)에서는 빠진다`, at(ST, '2026-11-07'), []);
    sc.eq(`${name}: 보이는 날 기준(예전) 자리로는 안 간다`, at(ST, keyOf(addDays(dateOf('2026-11-07'), days))), []);
    sc.eq(`${name}: '보러 가기' 도 그 날을 가리킨다`, log.jumps[0][1], want);
  });
}

console.log("\n시나리오 2 — '어제 완료' · '오늘 다른 구간으로' (다른 날을 보는 중)");
{
  let e = makeEnv('2026-11-07', [task({ subs: [{ text: '김', done: false }] })]);
  e.api.moveTaskTo(-1, undefined, true);
  const y = e.ST.days['2026-11-11'].big.am[0];
  sc.eq('진짜 어제(11/11)로 가서 완료', [y.text, y.done, y.subs[0].done], ['분파셀들 보고서', true, true]);
  e = makeEnv('2026-11-07', [task()]);
  e.api.moveTaskTo(0, 'pm');
  sc.eq('오늘 다른 구간 → 진짜 오늘(11/12) 오후', at(e.ST, TODAY, 'pm'), ['분파셀들 보고서']);
  e = makeEnv('2026-11-07', [task()]);
  e.api.moveTaskTo(0, 'am');
  sc.eq('다른 날에서는 같은 구간을 골라도 오늘로 온다', [at(e.ST, TODAY, 'am'), at(e.ST, '2026-11-07')], [['분파셀들 보고서'], []]);
}

console.log('\n시나리오 3 — 보이는 날이 곧 목적지면 옮기지 않는다');
{
  let e = makeEnv('2026-11-13', [task(), task({ text: '둘째' })]);
  e.api.moveTaskTo(1);
  sc.eq('내일(11/13)을 보며 내일로 → 자리 그대로 (맨 아래로 밀리지 않는다)', at(e.ST, '2026-11-13'), ['분파셀들 보고서', '둘째']);
  sc.eq('이미 그 날이라고 알린다', /이미 내일 오전 할일이에요/.test((e.log.jumps[0] || [])[0]), true);
  e = makeEnv('2026-11-13', [task()]);
  e.api.moveTaskTo(1, 'pm');
  sc.eq('구간이 다르면 그 날 안에서 구간만 옮긴다', [at(e.ST, '2026-11-13', 'am'), at(e.ST, '2026-11-13', 'pm')], [[], ['분파셀들 보고서']]);
  e = makeEnv('2026-11-11', [task({ urgent: true })]);
  e.api.moveTaskTo(-1, undefined, true);
  const it = e.ST.days['2026-11-11'].big.am[0];
  sc.eq("어제(11/11)를 보며 '어제 완료' → 그 자리에서 완료 · 긴급 풀림", [at(e.ST, '2026-11-11'), it.done, it.urgent], [['분파셀들 보고서'], true, undefined]);
  sc.eq('완료했다고 알린다', /완료 체크했어요/.test((e.log.jumps[0] || [])[0]), true);
}

console.log('\n시나리오 4 — 수동 이월은 내일로 앞으로 갔을 때만');
{
  let e = makeEnv('2026-11-07', [task({ manualCarryCount: 2 })]);
  e.api.moveTaskTo(1);
  sc.eq('지난날(11/7) → 내일(11/13): 하나 올린다', e.ST.days['2026-11-13'].big.am[0].manualCarryCount, 3);
  e = makeEnv('2026-11-20', [task({ manualCarryCount: 2 })]);
  e.api.moveTaskTo(1);
  sc.eq('앞날(11/20) → 내일(11/13): 당겨 온 것이라 그대로', e.ST.days['2026-11-13'].big.am[0].manualCarryCount, 2);
  e = makeEnv('2026-11-10', [task({ manualCarryCount: 2 })]);
  e.api.moveTaskTo(-1);
  sc.eq("'어제로'(11/10 → 11/11, 하루 앞)도 세지 않는다", e.ST.days['2026-11-11'].big.am[0].manualCarryCount, 2);
}

console.log('\n시나리오 5 — 복제도 진짜 오늘 기준');
{
  [[0, TODAY], [1, '2026-11-13'], [7, '2026-11-19'], [-1, '2026-11-11']].forEach(([days, want]) => {
    const { ST, api } = makeEnv('2026-11-07', [task()]);
    api.duplicateTaskTo(days);
    sc.eq(`복제 ${days} → ${want} · 원본은 11/7 에 그대로`, [at(ST, want), at(ST, '2026-11-07')], [['분파셀들 보고서'], ['분파셀들 보고서']]);
  });
  const { ST, api, log } = makeEnv('2026-11-07', [task()]);
  api.duplicateTaskTo(0, undefined, '2026-11-07');
  sc.eq('검색 화면의 복제(날을 콕 집음) → 그 할일의 날(11/7)에 하나 더', at(ST, '2026-11-07'), ['분파셀들 보고서', '분파셀들 보고서']);
  sc.eq('그때 안내는 그 날 이름으로 (오늘이라고 하지 않는다)', /^2026-11-07 오전으로 복제했어요/.test(log.jumps[0][0]), true);
}

console.log('\n시나리오 6 — 지금 완료 후 다음도 진짜 오늘 기준');
{
  const { ST, api, log } = makeEnv('2026-11-07', [task()], { next: true });
  api.nextAfterDoneTo(1);
  sc.eq('원래 것은 11/7 에서 완료', ST.days['2026-11-07'].big.am[0].done, true);
  sc.eq('다음 할일은 진짜 내일(11/13)', at(ST, '2026-11-13'), ['분파셀들 보고서 완료했고, 이제']);
  sc.eq('D 화면은 11/7 → 11/13 으로 6일 넘긴다', log.nav, [6]);
  const e = makeEnv('2026-11-07', [task()], { next: true });
  e.api.nextAfterDoneTo(0, 'pm');
  sc.eq('오늘 다른 구간 → 진짜 오늘 오후', at(e.ST, TODAY, 'pm'), ['분파셀들 보고서 완료했고, 이제']);
}

console.log('\n시나리오 7 — 메뉴 줄 옆 개수 · 구간 판도 같은 날을 본다');
{
  const rows = ['1', '7', '-1', '0'].map(d => ({ dataset: { cntDays: d }, _kids: [] })).concat([{ dataset: { yd: '1' }, _kids: [] }]);
  const mkEl = () => ({ className: '', textContent: '', style: {}, _kids: [], set innerHTML(v) { this._kids = []; },
    appendChild(el) { this._kids.push(el); }, classList: { toggle() {} } });
  rows.forEach(r => { r.querySelector = sel => r._kids.find(k => ('.' + k.className) === sel) || null;
    r.appendChild = el => { const i = r._kids.indexOf(el); if (i >= 0) r._kids.splice(i, 1); r._kids.push(el); }; });
  const asked = [];
  const doc = { querySelectorAll: () => rows, createElement: mkEl };
  const viewDate = dateOf('2026-11-07');
  const fill = new Function('document', 'tKey', 'addDays', 'viewDate', 'todayKey', '_dayTaskCount', '_dayTaskSecs',
    `${REAL}\n${FILL}; return _fillTaskMenuCounts;`)(doc, d => keyOf(d || viewDate), addDays, viewDate, () => TODAY,
    k => { asked.push(k); return 0; }, () => []);
  fill();
  sc.eq('내일 · 다음 주 · 어제 · 오늘 · (어제 완료 후) 내일 줄이 세는 날', asked, ['2026-11-13', '2026-11-19', '2026-11-11', TODAY, '2026-11-13']);

  const spec = new Function('tKey', 'addDays', 'viewDate', 'todayKey', `${REAL}\n${SPECF}; return _secPickSpecFor;`)(
    d => keyOf(d || viewDate), addDays, viewDate, () => TODAY);
  sc.eq('구간 판: 이동 · 내일 = 11/13', spec({ dataset: { act: 'move', cntDays: '1' } }).toKey, '2026-11-13');
  sc.eq('구간 판: 복제 · 오늘 = 11/12', spec({ dataset: { act: 'dup', cntDays: '0' } }).toKey, TODAY);
  sc.eq('구간 판: 지금 완료 후 다음 · 다음 주 = 11/19', spec({ dataset: { act: 'next', cntDays: '7' } }).toKey, '2026-11-19');
  sc.eq('구간 판: 어제 완료 후 다음 · 오늘 = 11/12', spec({ dataset: { act: 'nextY', yd: '0' } }).toKey, TODAY);
}

console.log('\n시나리오 8 — 하루가 바뀌는 시각: 진짜 오늘은 todayKey() 를 따른다');
{
  // 새벽 1시(하루 시작 2시)면 todayKey() 가 어제 날짜를 준다 — '내일로' 는 그 다음 날
  const { ST, api } = makeEnv('2026-11-07', [task()], { today: '2026-11-11' });
  api.moveTaskTo(1);
  sc.eq('todayKey()=11/11 이면 내일 = 11/12', at(ST, '2026-11-12'), ['분파셀들 보고서']);
}

console.log('\n시나리오 9 — 메뉴 쪽에 보이는 날 기준 계산이 남아 있지 않다');
{
  const menu = slice('// ── 진짜 오늘 기준', 'function _secPickRender(');
  sc.eq('addDays(viewDate,…) 가 없다', /addDays\(viewDate/.test(menu), false);
  const srch = slice('function _srchActDo(a){', 'function _srchActDate(');
  sc.eq('검색 화면 복제는 그 할일의 날을 넘긴다', srch.includes('duplicateTaskTo(0,undefined,r.k)'), true);
}

sc.done();
