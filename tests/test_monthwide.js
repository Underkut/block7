// 월간뷰 위젯 1단 / 2단 (B1, HB 2026-10-27) — 2단이면 두 칸을 차지한다. 자리 규칙:
//   3단: 주간뷰가 켜져 있으면 주간뷰와 같은 칸 · 아니면 좌 · 중 → 좌+중(lc), 우 → 중+우(cr)
//   2단: 위쪽 전체 폭(full) · 1단(폰) · 1단 선택 · 월간뷰 위젯이 없으면 null(예전 그대로)
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
eval(slice('function _monthWideSide(L,mode){', 'function rpMonthWideMenu('));
const mk = (col, wide, weekly) => ({ mWide: wide, weekly: weekly || 'none', cols: { left: ['todo'].concat(col === 'left' ? ['monthSingle'] : []), center: col === 'center' ? ['monthSingle'] : [], right: col === 'right' ? ['monthSingle'] : [] } });
sc.eq('1단(기본)이면 늘 null — 예전 그대로', [_monthWideSide(mk('right', false), 3), _monthWideSide(mk('right', undefined), 2)], [null, null]);
sc.eq('폰(1단 화면)은 그대로', _monthWideSide(mk('right', true), 1), null);
sc.eq('월간뷰 위젯을 안 쓰면 null', _monthWideSide(mk(null, true), 3), null);
sc.eq('3단 · 우 → 중+우', _monthWideSide(mk('right', true), 3), 'cr');
sc.eq('3단 · 좌 → 좌+중', _monthWideSide(mk('left', true), 3), 'lc');
sc.eq('3단 · 중 → 좌+중', _monthWideSide(mk('center', true), 3), 'lc');
sc.eq('⭐ 3단 · 주간뷰가 켜져 있으면 주간뷰 칸(아래)에 함께', _monthWideSide(mk('right', true, 'lc'), 3), 'lc');
sc.eq('2단 화면 → 위쪽 전체 폭', _monthWideSide(mk('right', true), 2), 'full');
sc.done();
