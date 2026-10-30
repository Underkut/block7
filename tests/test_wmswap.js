// 주간 ⇄ 월간 [W|M] (v. 26-1030-8, HB) — 2·3단 위젯 헤더의 미끄러지는 단추.
//   누르면 그 자리 위젯이 주간(weekly) ↔ 월간(monthSingle) 으로 바뀐다.
//   HB (다): 둘 다 그 화면 단수 배치에 있으면 단추를 숨긴다 (맞바꿈 · 합치기 없음).
//   너비(1칸/2칸)는 그 자리를 따라가되, 들어오는 쪽이 다른 단수 배치에서 쓰이면 안 건드린다
//   (wkWide · mWide 는 2단 · 3단 공용이라 그 화면을 흔든다).
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

let MODE = 3, SPLIT = true, SAVED = 0, SNAP = 0;
global.document = { body: { classList: { contains: c => (c === 'split-d' ? SPLIT : false) } } };
global.ST = { settings: {} };
global._layMode = () => MODE;
global._lay = () => ST.settings.layout;
global.save = () => { SAVED++; };
global.beforeSave = () => { SNAP++; };
global.logicalNow = () => new Date(2026, 9, 30, 9, 0);   // 2026-10-30 (금)
global._vcIs = t => typeof t === 'string' && t.indexOf('card#') === 0;
global._vcIdOf = t => t.slice(5);
global._vcRemove = () => {};
global.wOffset = 0;
global._rpMonthState = { single: null, triple: null };
global._tfQuiet = () => true;

eval(slice('// 화면 단수마다 배치가 따로다', '// 주간뷰 두 칸 (v. 26-1030-2)')
   + slice('// ── 주간 ⇄ 월간 바꾸기 [W|M]', 'function rpSwapWM(')
   + ';Object.assign(globalThis,{_rpWMSegOn,_rpWMSegHTML,_rpWMSwap});');

const lay = (cols, cols2, extra) => {
  ST.settings.layout = Object.assign({ cols, cols2 }, extra || {});
  return ST.settings.layout;
};

console.log('시나리오 1 — 단추가 보이는 때');
{
  MODE = 3; SPLIT = true;
  lay({ left: ['todo'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] });
  sc.eq('3단 · 주간만 있으면 주간에 단추', [_rpWMSegOn('weekly'), _rpWMSegOn('monthSingle')], [true, false]);
  sc.eq('HTML 도 나온다 · W 가 켜짐', /class="on"[^>]*>W</.test(_rpWMSegHTML('weekly')), true);
  sc.eq('⭐ HB (다): 둘 다 있으면 숨김', (lay({ left: ['todo', 'monthSingle'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] }), [_rpWMSegOn('weekly'), _rpWMSegOn('monthSingle')]), [false, false]);
  sc.eq('월간 트리플은 상관없다', (lay({ left: ['todo', 'monthTriple'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] }), _rpWMSegOn('weekly')), true);
  MODE = 2;
  sc.eq('2단은 2단 배치를 본다 (3단에 있어도 2단에 없으면 없음)', _rpWMSegOn('weekly'), false);
  lay({ left: ['todo', 'monthSingle'], center: ['weekly'], right: [] }, { left: ['todo'], right: ['weekly'] });
  sc.eq('2단 배치엔 주간만 → 단추 (3단에 월간이 있어도)', _rpWMSegOn('weekly'), true);
  MODE = 1;
  sc.eq('1단(폰)은 위젯이 없다', _rpWMSegOn('weekly'), false);
  MODE = 3; SPLIT = false;
  sc.eq('D 화면이 아니면 없다', _rpWMSegOn('weekly'), false);
  SPLIT = true;
}

console.log('\n시나리오 2 — 그 자리에서 바뀐다');
{
  MODE = 3; SAVED = 0; SNAP = 0;
  const L = lay({ left: ['todo'], center: ['card#a', 'weekly', 'card#b'], right: [] }, { left: ['todo'], right: ['weekly'] });
  sc.eq('바뀐다', _rpWMSwap('weekly', 'monthSingle'), true);
  sc.eq('같은 칸 같은 순서', L.cols.center, ['card#a', 'monthSingle', 'card#b']);
  sc.eq('2단 배치는 그대로', L.cols2.right, ['weekly']);
  sc.eq('되돌리기 기록 · 저장', [SNAP, SAVED], [1, 1]);
  sc.eq('되돌아간다', (_rpWMSwap('monthSingle', 'weekly'), L.cols.center), ['card#a', 'weekly', 'card#b']);
  lay({ left: ['todo', 'monthSingle'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] });
  sc.eq('이미 있으면 안 바꾼다', _rpWMSwap('weekly', 'monthSingle'), false);
}

console.log('\n시나리오 3 — 너비는 자리를 따라간다 (다른 화면을 흔들지 않을 때만)');
{
  MODE = 3;
  let L = lay({ left: ['todo'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] }, { wkWide: true });
  _rpWMSwap('weekly', 'monthSingle');
  sc.eq('두 칸 주간 → 두 칸 월간', !!L.mWide, true);
  L = lay({ left: ['todo'], center: ['monthSingle'], right: [] }, { left: ['todo'], right: [] }, { wkWide: true });
  _rpWMSwap('monthSingle', 'weekly');
  sc.eq('한 칸 월간 → 한 칸 주간', !!L.wkWide, false);
  L = lay({ left: ['todo'], center: ['monthSingle'], right: [] }, { left: ['todo'], right: ['weekly'] }, { wkWide: true });
  _rpWMSwap('monthSingle', 'weekly');
  sc.eq('⭐ 2단 화면에서 쓰는 주간이면 그 너비를 안 건드린다', !!L.wkWide, true);
}

console.log('\n시나리오 4 — 보던 때를 이어 간다');
{
  MODE = 3;
  lay({ left: ['todo'], center: ['weekly'], right: [] }, { left: ['todo'], right: [] });
  wOffset = 5;   // 10/30 + 35일 = 12/4
  _rpWMSwap('weekly', 'monthSingle');
  sc.eq('주 → 그 주의 달 (12월)', _rpMonthState.single, { y: 2026, m: 11 });
  _rpWMSwap('monthSingle', 'weekly');
  sc.eq('달 → 그 달 첫 주 (12/1 이 든 주 = 5주 뒤)', wOffset, 5);
  _rpWMSwap('weekly', 'monthSingle');
  _rpMonthState.single = { y: 2026, m: 9 };   // 이번 달로 넘겨 놓고
  _rpWMSwap('monthSingle', 'weekly');
  sc.eq('이번 달이면 이번 주', wOffset, 0);
  _rpWMSwap('weekly', 'monthSingle');
  _rpMonthState.single = { y: 2026, m: 7 };   // 8월
  _rpWMSwap('monthSingle', 'weekly');
  sc.eq('지난 달 → 그 달 첫 주 (8/1 이 든 주)', wOffset, -13);
}

sc.done();
