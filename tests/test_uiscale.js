// 화면 확대(uiScale)와 뷰포트 폭 — '가장자리 흰 줄' 회귀 (v26-0918-3, HB 신고)
//
// 무엇이 문제였나 —
//   앱은 화면 확대를 쓸 때(배율 sc>1) viewport meta 를 `width=w, initial-scale=sc`
//   로 다시 쓴다. 이때 페이지가 화면에 보이는 폭은 **w × sc** 다.
//   w 를 반올림으로 잡으면 그 값이 화면 폭보다 **작아지는** 배율이 생긴다.
//   예) 393px 기기에서 1.1배 → round(357.27)=357 → 357×1.1 = 392.7  (0.3px 모자람)
//   모자란 자리는 페이지 **바깥**이라 앱이 무슨 색을 칠해도 못 덮는다.
//   거기 보이는 것은 브라우저 바탕(흰색)이고, 그것이 HB 가 본 '한 픽셀 흰 줄'이다.
//   높이는 폭에서 따라오므로 아래쪽에도 같이 생긴다 — "우측 끝이나 아래 끝".
//   배율에 따라 생기기도 하고 안 생기기도 해서 규칙이 안 보였다 (아래 시나리오 2).
//
// ⚠️ 고침은 **올림(Math.ceil)** 하나다. w×sc ≥ 화면폭 이 언제나 참이 된다.
//    배율(sc)은 사용자가 고른 값 그대로 두어야 한다 — 배율을 만지면 고른 크기와
//    실제 크기가 어긋난다. 되돌려서 반올림으로 만들지 말 것.

const { slice, makeScorer, SRC } = require('./_load');
const sc_ = makeScorer();

// 두 곳이 같은 계산을 해야 한다: ①첫 로드(head 부트 스크립트) ②설정에서 바꿀 때
const BOOT = slice('var baseW=de&&de.clientWidth', '</script>');
const NOW  = slice('function applyUiScaleNow(){', 'function uiScaleSet(');

console.log('시나리오 1 — 두 곳 모두 올림으로 잡는다');
{
  sc_.eq('첫 로드 계산이 올림', BOOT.includes('Math.ceil(baseW/sc)'), true);
  sc_.eq('설정에서 바꿀 때도 올림', NOW.includes('Math.ceil(baseW/sc)'), true);
  sc_.eq('반올림은 어느 쪽에도 안 남았다',
    BOOT.includes('Math.round(baseW/sc)') || NOW.includes('Math.round(baseW/sc)'), false);
  // 배율 자체는 고른 값 그대로 — 여기서 손대면 고른 크기와 보이는 크기가 어긋난다
  sc_.eq('배율은 고른 값 그대로 쓴다',
    NOW.includes('initial-scale=${sc}, minimum-scale=${sc}, maximum-scale=${sc}'), true);
  // 하한·상한은 예전 그대로 (2배 확대 같은 극단에서 동작이 바뀌면 안 된다)
  sc_.eq('하한 200 · 상한 화면폭은 그대로',
    BOOT.includes('Math.max(200,Math.min(baseW,') && NOW.includes('Math.max(200,Math.min(baseW,'), true);
}

console.log('\n시나리오 2 — 어떤 기기·배율에서도 화면보다 좁아지지 않는다');
{
  // 코드에서 계산식을 그대로 떠서 돌린다 (문자열 검사가 아니라 **값**으로 지킨다)
  const m = /Math\.max\(200,Math\.min\(baseW,([^)]+\))\)\)/.exec(BOOT);
  sc_.eq('계산식을 떠 왔다', !!m, true);
  const widthOf = new Function('baseW', 'sc', 'return Math.max(200,Math.min(baseW,' + m[1] + '));');

  const DEVS = [[393,852],[390,844],[430,932],[375,812],[414,896],
                [360,800],[412,915],[834,1194],[1024,1366],[820,1180],[768,1024]];
  const SCALES = [1.05,1.1,1.15,1.2,1.25,1.3,1.35,1.4,1.5,1.6,1.75];
  const narrow = [];      // 화면보다 좁아진 경우 = 흰 줄이 생기는 경우
  let maxOver = 0;
  DEVS.forEach(([W]) => SCALES.forEach(s => {
    const w = widthOf(W, s);
    if (w <= 200) return;                       // 하한에 걸린 극단은 예전과 같은 동작
    if (W - w * s > 0.02) narrow.push(W + 'px @' + s + '배 → ' + (w * s).toFixed(2));
    maxOver = Math.max(maxOver, w * s - W);
  }));
  sc_.eq('화면보다 좁아지는 조합이 하나도 없다', narrow, []);
  // 넘치는 쪽은 html{overflow-x:hidden} 이 잘라 낸다. 그래도 한 픽셀 남짓이어야 한다.
  sc_.eq('넘쳐도 1.5px 이내', maxOver <= 1.5 + 0.001, true);

  // 예전 계산(반올림)이었다면 실제로 틈이 생겼다는 것 — 이 검사가 지키는 것이 무엇인지 남긴다
  const roundW = (W, s) => Math.max(200, Math.min(W, Math.round(W / s)));
  const wouldFail = [];
  DEVS.forEach(([W]) => SCALES.forEach(s => {
    const w = roundW(W, s);
    if (w > 200 && W - w * s > 0.02) wouldFail.push(W + '@' + s);
  }));
  sc_.eq('반올림이었다면 틈이 생기는 조합이 많았다', wouldFail.length > 10, true);
}

console.log('\n시나리오 3 — 확대를 안 쓰면 손대지 않는다');
{
  // 배율 1(기본)에서는 meta 를 그대로 둔다. 건드리면 기본 화면까지 흔들린다.
  sc_.eq('배율이 1 이하면 부트 스크립트가 그냥 빠져나간다', BOOT.includes('if(!(sc>1))return;'), true);
  sc_.eq('설정 쪽도 1 이하면 기본 meta 로 되돌린다', NOW.includes('content=_VP_DEFAULT_CONTENT;'), true);
  sc_.eq('기본 meta 는 device-width',
    SRC.includes('content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"'), true);
}

sc_.done();
