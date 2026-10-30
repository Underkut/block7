// 월간뷰 · 주간뷰 위젯 1단 / 2단 — 2단이면 두 칸을 차지한다.
//   월간뷰(B1, HB 2026-10-27) · 주간뷰(v. 26-1030-2, HB — "주간뷰가 3단에서만 보이는 것도 별로")
// 자리 규칙 (둘 다 같다):
//   3단: 좌 · 중 → 좌+중(lc), 우 → 중+우(cr). 월간뷰는 주간뷰도 두 칸이면 그 아래(같은 쪽)
//   2단: 위쪽 전체 폭(full) · 1단(폰) · 1단 선택 · 그 위젯이 없으면 null
// 주간뷰는 예전엔 cols 밖(L.weekly = 'none'|'lc'|'cr')에 살았다 → 이제 cols 안의 'weekly' + L.wkWide.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
eval(slice('function _layColOf(L,t){', 'function rpMonthWideMenu('));

const mk = (col, wide, wk) => {
  const cols = { left: ['todo'], center: [], right: [] };
  if (col) cols[col].push('monthSingle');
  const L = { mWide: wide, cols };
  if (wk) { cols[wk.col].unshift('weekly'); if (wk.wide) L.wkWide = true; }
  return L;
};

console.log('시나리오 1 — 월간뷰 두 칸');
sc.eq('1단(기본)이면 늘 null — 예전 그대로', [_monthWideSide(mk('right', false), 3), _monthWideSide(mk('right', undefined), 2)], [null, null]);
sc.eq('폰(1단 화면)은 그대로', _monthWideSide(mk('right', true), 1), null);
sc.eq('월간뷰 위젯을 안 쓰면 null', _monthWideSide(mk(null, true), 3), null);
sc.eq('3단 · 우 → 중+우', _monthWideSide(mk('right', true), 3), 'cr');
sc.eq('3단 · 좌 → 좌+중', _monthWideSide(mk('left', true), 3), 'lc');
sc.eq('3단 · 중 → 좌+중', _monthWideSide(mk('center', true), 3), 'lc');
sc.eq('⭐ 3단 · 주간뷰도 두 칸이면 주간뷰 칸(아래)에 함께', _monthWideSide(mk('right', true, { col: 'left', wide: true }), 3), 'lc');
sc.eq('주간뷰가 한 칸이면 월간뷰는 제 자리대로', _monthWideSide(mk('right', true, { col: 'left', wide: false }), 3), 'cr');
sc.eq('2단 화면 → 위쪽 전체 폭', _monthWideSide(mk('right', true), 2), 'full');

console.log('\n시나리오 2 — 주간뷰 두 칸');
sc.eq('한 칸이면 null', _wkWideSide(mk(null, false, { col: 'left', wide: false }), 3), null);
sc.eq('주간뷰를 안 쓰면 null', _wkWideSide({ wkWide: true, cols: { left: ['todo'], center: [], right: [] } }, 3), null);
sc.eq('3단 · 좌 → 좌+중', _wkWideSide(mk(null, false, { col: 'left', wide: true }), 3), 'lc');
sc.eq('3단 · 중 → 좌+중', _wkWideSide(mk(null, false, { col: 'center', wide: true }), 3), 'lc');
sc.eq('3단 · 우 → 중+우', _wkWideSide(mk(null, false, { col: 'right', wide: true }), 3), 'cr');
sc.eq('⭐ 2단 화면 → 위쪽 전체 폭 (예전엔 2단에서 안 보였다)', _wkWideSide(mk(null, false, { col: 'right', wide: true }), 2), 'full');
sc.eq('폰(1단 화면)은 위젯이 없다', _wkWideSide(mk(null, false, { col: 'left', wide: true }), 1), null);

console.log('\n시나리오 3 — 3단 경계선이 지킬 쪽 (_laySpanSide)');
sc.eq('주간뷰 두 칸이 먼저', _laySpanSide(mk('right', true, { col: 'left', wide: true })), 'lc');
sc.eq('주간뷰가 없으면 월간뷰 두 칸', _laySpanSide(mk('right', true)), 'cr');
sc.eq('아무것도 두 칸이 아니면 null', _laySpanSide(mk('right', false, { col: 'left', wide: false })), null);

// ═══ 4. 옛 배치 옮기기 (_lay) — 화면은 예전 그대로여야 한다 ═══
console.log('\n시나리오 4 — 옛 주간뷰 자리(L.weekly) 를 cols 로 옮긴다');
{
  global.ST = { settings: {} };
  global._vcIs = t => typeof t === 'string' && t.indexOf('card#') === 0;
  global._vcIdOf = t => t.slice(5);
  global._vcGet = () => ({});
  global._VC_TYPE_KIND = {};
  eval(slice('const RP_WIDGET_DEFS={', 'function _rpGetWidgets(')
     + slice('// 이 버전이 "아는" 위젯인가.', 'function _colKey(')
     + ';globalThis._lay=_lay;');
  const run = L => { ST.settings = { layout: L }; return _lay(); };
  let L = run({ bp2: 600, bp3: 900, weekly: 'lc', cols: { left: ['todo'], center: [], right: ['monthSingle'] }, c3: [.34, .3] });
  sc.eq("'lc' → 좌 칸 맨 위", L.cols.left, ['weekly', 'todo']);
  sc.eq('두 칸 넓이', L.wkWide, true);
  sc.eq('옛 칸은 지운다', 'weekly' in L, false);
  sc.eq('3단 화면은 예전 그대로 (좌+중)', _wkWideSide(L, 3), 'lc');
  L = run({ weekly: 'cr', cols: { left: ['todo'], center: ['monthTriple'], right: [] } });
  sc.eq("'cr' → 우 칸 맨 위", L.cols.right, ['weekly']);
  sc.eq('3단 화면은 예전 그대로 (중+우)', _wkWideSide(L, 3), 'cr');
  L = run({ weekly: 'none', cols: { left: ['todo'], center: [], right: [] } });
  sc.eq("'none' → 안 씀", [L.cols.left, L.cols.center, L.cols.right, !!L.wkWide], [['todo'], [], [], false]);
  L = run({ cols: { left: ['todo', 'weekly'], center: [], right: [] } });
  sc.eq('⭐ cols 안의 주간뷰를 이제 지우지 않는다 (예전 _lay 는 지웠다)', L.cols.left, ['todo', 'weekly']);
  L = run({ cols: { left: ['todo', 'weekly'], center: ['weekly'], right: [] } });
  sc.eq('두 번 들어가면 하나만', [L.cols.left, L.cols.center], [['todo', 'weekly'], []]);
  L = run({ weekly: 'lc', cols: { left: ['todo'], center: ['weekly'], right: [] } });
  sc.eq('이미 cols 에 있으면 그 자리를 따른다', [L.cols.left, L.cols.center], [['todo'], ['weekly']]);
}

// ═══ 5. 주간뷰 높이 (v. 26-1030-3) — 기기별 칸(rpWidgetHeights)에, 범위 안으로 ═══
console.log('\n시나리오 5 — 주간뷰 위젯 높이');
{
  global.ST = { settings: {} };
  global.save = () => {};
  eval(slice('const WK_H_MIN=', '// 말씀 목록 위젯(암송/좋아요/Deeper)의 드래그 지정 높이') + ';Object.assign(globalThis,{_rpWkH,_rpSetWkH,WK_H_MIN,WK_H_MAX});');
  sc.eq('정한 적 없으면 내용 높이(null)', _rpWkH(), null);
  _rpSetWkH(420.4);
  sc.eq('정한 높이', _rpWkH(), 420);
  sc.eq('위젯 높이 칸에 산다 (기기별)', ST.settings.rpWidgetHeights.weekly, 420);
  _rpSetWkH(10);
  sc.eq('너무 작으면 최소', _rpWkH(), WK_H_MIN);
  _rpSetWkH(99999);
  sc.eq('너무 크면 최대', _rpWkH(), WK_H_MAX);
}

sc.done();
