// There 말씀 — 보던 말씀을 There 화면에 함께 (v. 26-1024-14, HB)
//   들어온 곳의 말씀 · 명제 · 성경 절을 화면에 띄우고, 글자 밝기를 호흡 · 촛불로 일렁이게 한다.
//   ⚠️ 화면만이다 — 기록(verseThereLog)은 예전 그대로 ref 하나. 여기서는 '무엇을 띄우나' 와
//      '얼마나 밝은가' 를 정하는 순수 함수만 떼어 시험한다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

let STORE = {};
global._tfLoad = () => STORE;
eval(slice('// ══ There 말씀 — 보던 말씀을 There 화면에 함께', '// ══ There 말씀 끝 ══'));
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;

console.log('시나리오 1 — 말씀 · 명제에서 띄울 글');
{
  const w = _thereWordFromVerse({ ref: '이사야 41:10', krText: ' 두려워 말라 내가 너와 함께 함이니라 ' });
  sc.eq('말씀 한 장 · 장절 · 본문 다듬기', w, { prop: false, pages: [{ ref: '이사야 41:10', text: '두려워 말라 내가 너와 함께 함이니라' }] });
  const p = _thereWordFromVerse({ pid: 'P0001', krText: '하나님은 기도를 들으신다', refs: ['시편 65:2', '요한일서 5:14'] });
  sc.eq('명제 — prop 표시 · 설교 본문 장절을 이어 쓴다', [p.prop, p.pages[0].ref], [true, '시편 65:2 · 요한일서 5:14']);
  const p1 = _thereWordFromVerse({ pid: 'P0002', krText: '명제', ref: '시편 1:1', refs: ['시편 1:1'] });
  sc.eq('설교 본문이 하나면 그 장절', p1.pages[0].ref, '시편 1:1');
  sc.eq('본문이 없으면 띄우지 않는다 (입자만)', _thereWordFromVerse({ ref: '요 3:16', krText: '' }), null);
  sc.eq('말씀이 없으면 null (GNB · 빈 타일)', _thereWordFromVerse(null), null);
}

console.log('시나리오 2 — 성경 절들: 한 절씩 · 한자 괄호 빼기');
{
  const ch = ['첫 절', '하나님이 세상을 이처럼 사랑하사 독생자(獨生子)를 주셨으니', '셋째 절', ''];
  const w = _thereWordFromBible('요한복음', 3, [2, 3], ch);
  sc.eq('절마다 한 장 · 절 번호', w.pages.map(p => [p.ref, p.n]), [['요한복음 3:2', 2], ['요한복음 3:3', 3]]);
  sc.eq('한자 괄호는 뺀다', w.pages[0].text, '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니');
  sc.eq('한글 괄호는 그대로', _thereStripHanja('예수(그리스도)께서'), '예수(그리스도)께서');
  sc.eq('빈 절은 건너뛴다', _thereWordFromBible('요한복음', 3, [4], ch), null);
  sc.eq('본문이 아직 없으면 null', _thereWordFromBible('요한복음', 3, [1], undefined), null);
}

console.log('시나리오 3 — 세팅 기본값 = HB 가 정한 값 · 기기에 저장한 값이 이긴다');
{
  STORE = {};
  sc.eq('처음엔 촛불만 켜짐', [_tfW('fb'), _tfW('fc'), _tfW('wv')], [false, true, true]);
  sc.eq('호흡 기본값', ['bT', 'br', 'bu', 'bd', 'blo', 'bhi', 'bg', 'bcol'].map(_tfW), [5.5, 25, 0, 0, 100, 40, 100, 'white']);
  sc.eq('촛불 기본값', ['cb', 'ca', 'cs', 'cg', 'cgl', 'ccol'].map(_tfW), [50, 5, 3, 20, 70, 'candle']);
  STORE = { fb: true, fc: false, bT: '8', ccol: 'nope', ws: 'x' };
  sc.eq('켠 것 · 숫자 · 모르는 색은 기본 · 깨진 숫자는 기본', [_tfW('fb'), _tfW('fc'), _tfW('bT'), _tfW('ccol'), _tfW('ws')], [true, false, 8, 'candle', 1]);
  STORE = {};
  const P = _tfFlickerParams(false);
  sc.eq('기본 — 호흡은 꺼져 있고 촛불만', [P.breath, !!P.candle], [null, true]);
  sc.eq('동작 줄이기면 둘 다 끈다', (({ breath, candle }) => [breath, candle])(_tfFlickerParams(true)), [null, null]);
}

console.log('시나리오 4 — 호흡: 들숨 → 머무름 → 날숨 → 머무름');
{
  const b = { T: 10, r: 40, up: 1, dn: 1, lo: 40, hi: 100 };   // 움직이는 8초: 들숨 3.2 · 날숨 4.8
  sc.eq('시작은 가장 어둡다', near(_tfBreathAt(0, b).op, 0.4), true);
  sc.eq('들숨 끝 = 가장 밝다', near(_tfBreathAt(3.2, b).op, 1), true);
  sc.eq('들이쉰 채 머무는 동안 그대로', near(_tfBreathAt(4.0, b).op, 1), true);
  sc.eq('날숨 가운데쯤', near(_tfBreathAt(4.2 + 2.4, b).op, 0.7), true);
  sc.eq('내쉰 채 머무름', near(_tfBreathAt(9.5, b).op, 0.4), true);
  sc.eq('한 번 숨마다 되풀이', near(_tfBreathAt(13.2, b).op, _tfBreathAt(3.2, b).op), true);
  const hb = { T: 5.5, r: 25, up: 0, dn: 0, lo: 100, hi: 40 };   // HB 값 — 어두울 때 > 밝을 때
  const ops = []; for (let t = 0; t < 5.5; t += 0.05) ops.push(_tfBreathAt(t, hb).op);
  sc.eq('HB 값은 40%~100% 사이를 오간다 (작은 쪽이 아래)', [near(Math.min(...ops), 0.4, 1e-3), near(Math.max(...ops), 1, 1e-3)], [true, true]);
  sc.eq('멈춤이 숨보다 길어도 망가지지 않는다', isFinite(_tfBreathAt(2, { T: 3, r: 50, up: 3, dn: 3, lo: 50, hi: 100 }).op), true);
}

console.log('시나리오 5 — 촛불: 평소 밝기 둘레에서 흔들리고, 가끔 깊게 깜빡인다');
{
  const c = { base: 50, amp: 5, sp: 3, gust: 0 };
  let lo = 1, hi = 0; const st = {};
  for (let t = 0; t < 60; t += 0.02) { const o = _tfCandleAt(t, c, st).op; lo = Math.min(lo, o); hi = Math.max(hi, o); }
  sc.eq('바람 없으면 평소 밝기 ±7% 안', [lo >= 0.43 - 1e-9, hi <= 0.57 + 1e-9], [true, true]);
  sc.eq('그래도 움직이긴 한다', hi - lo > 0.02, true);
  let seq = 0; const rnd = () => [0.1, 0.5, 0.5, 0.5][(seq++) % 4];
  const g = { base: 80, amp: 10, sp: 1, gust: 20 }, gs = {};
  let minG = 1; for (let t = 0; t < 20; t += 0.01) minG = Math.min(minG, _tfCandleAt(t, g, gs, rnd).op);
  sc.eq('바람이 스치면 평소 흔들림보다 깊게 떨어진다', minG < 0.8 - 0.1 * 1.4 * 0.6, true);
  const z = _tfCandleAt(1, { base: 70, amp: 0, sp: 1, gust: 0 }, {});
  sc.eq('흔들림 0 이면 그 밝기 그대로', [near(z.op, 0.7), z.k], [true, 0]);
  sc.eq('밝기는 5%~100% 안', _tfCandleAt(0.3, { base: 100, amp: 40, sp: 3, gust: 0 }, {}).op <= 1, true);
}

console.log('시나리오 6 — 둘 다 켜면: 밝기는 곱하고 빛 번짐은 두 겹');
{
  const P = { breath: { T: 10, r: 40, up: 1, dn: 1, lo: 40, hi: 100, glow: 100, col: '255,246,230' },
              candle: { base: 50, amp: 0, sp: 1, gust: 0, glow: 70, col: '255,179,92' } };
  const f = _tfFlickerAt(3.2, P, {});
  sc.eq('밝기 = 호흡(100%) × 촛불(50%)', near(f.op, 0.5), true);
  sc.eq('빛 두 겹 · 각자의 색', f.glows.map(g => g[2]), ['255,246,230', '255,179,92']);
  sc.eq('호흡 꼭대기에서 호흡 빛이 가장 진하다', near(f.glows[0][1], 1), true);
  sc.eq('둘 다 끄면 그대로 (밝기 1 · 빛 없음)', _tfFlickerAt(3, { breath: null, candle: null }, {}), { op: 1, glows: [] });
  sc.eq('빛 번짐 0 이면 그 겹은 없다', _tfFlickerAt(3, { breath: null, candle: { base: 80, amp: 0, sp: 1, gust: 0, glow: 0, col: 'x' } }, {}).glows, []);
}

console.log('시나리오 7 — 들어오는 길마다 말씀을 넘기는가 (빠뜨리면 그 길만 입자뿐)');
{
  const has = (s) => SRC.includes(s);
  sc.eq('전체화면', has("openThere(_reactKey(v),{src:'full',word:_thereWordFromVerse(v)})"), true);
  sc.eq('말씀카드', has("openThere(_vcReactKeyOf(v),{src:'widget',word:_thereWordFromVerse(v)})"), true);
  sc.eq('상단 말씀 영역', has("openThere(b.dataset.ref,{src:'bar',word:_thereWordFromVerse(v)})"), true);
  sc.eq('성경 우상단', has("openThere(_brViewRef(),{src:'bible',word:_thereWordFromBible("), true);
  sc.eq('성경 절 메뉴', has("openThere(ref,{src:'bible-menu',word:_thereWordFromBible("), true);
  sc.eq('Sweeter 타일', has("openThere(tv?_reactKey(tv):'',{src:'tile',word:_thereWordFromVerse(tv)})"), true);
  sc.eq('GNB 는 지금처럼 말씀 없이 (HB)', has(`onclick="openThere('',{src:'gnb'})"`), true);
  sc.eq('Sweeter 홈도 말씀 없이', has(`onclick="openThere('',{src:'home'})"`), true);
}

sc.done();
