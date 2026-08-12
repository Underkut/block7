// 핀치(두 손가락)로 글자 크기 옮기기 — 전체화면·말씀카드 공용 (v26-0812-5)
//
// 손가락을 두 배로 벌리면 글자도 대략 두 배 — **벌린 만큼 그대로** 따라간다.
// (0812-4 의 "몇 칸" 방식은 한 칸에 1.35배가 필요해 굼떴다)
// 설정 버튼의 단계 사이사이를 메운 **핀치 전용 촘촘한 표**(_tsFine) 위를 걷는다.
// 양 끝(가장 작은 것·가장 큰 것)은 설정과 똑같고 넘지 않는다.
//
// ⚠️ 이 기능에서 반드시 지켜야 하는 것:
//   ① 두 번째 손가락이 닿는 순간 **롱터치 대기를 끊는다.**
//   ② **손가락은 동시에 떨어지지 않는다.** 하나가 먼저 떨어지면 남은 하나가
//      "새로 미는 손가락"으로 읽혀 말씀이 넘어가거나 화면이 튄다 → 핀치 중과
//      다 뗀 뒤 잠깐(TS_PINCH_TAIL) 은 다른 제스처를 모두 막는다.
//   ③ 손 떨림에 값이 깜빡이지 않게 옆 칸으로 옮기는 문턱을 둔다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.window = {};
eval(
  slice('// ══════ 핀치(두 손가락)로 글자 크기 옮기기', 'function _syncVfTextScaleUI(') +
  ';Object.assign(globalThis,{TS_FINE_ALL,TS_PINCH_TAIL,TS_SNAP_HYST,' +
  '_tsTouchDist,_tsFine,_tsNearest,_tsPinchBusy,_attachTextPinch});'
);

// ── 손가락 흉내 ──
const el = () => {
  const h = {};
  return {
    addEventListener: (n, f) => { (h[n] = h[n] || []).push(f); },
    fire: (n, e) => { (h[n] || []).forEach(f => f(e)); },
  };
};
const touches = d => {          // 가로로 d 만큼 벌어진 두 손가락
  const t = [{ clientX: -d / 2, clientY: 0 }, { clientX: d / 2, clientY: 0 }];
  t.length = 2;
  return t;
};
const one = (() => { const t = [{ clientX: 0, clientY: 0 }]; t.length = 1; return t; })();
const none = (() => { const t = []; t.length = 0; return t; })();
const pd = { preventDefault() {} };

// 배율 v 에서 시작해 손가락을 d0 → d1 로 (여러 번 나눠) 움직인 뒤의 배율
const run = (steps, v, d0, d1, opt) => {
  const o = opt || {};
  const e = el();
  let cur = v, started = 0;
  _attachTextPinch(e, {
    get: () => cur, steps: () => steps, set: x => { cur = x; },
    onStart: () => { started++; },
  });
  e.fire('touchstart', { touches: touches(d0) });
  const n = o.frames || 12;
  for (let i = 1; i <= n; i++) {
    e.fire('touchmove', Object.assign({ touches: touches(d0 + (d1 - d0) * i / n) }, pd));
  }
  if (!o.keepDown) e.fire('touchend', { touches: none });
  return { v: cur, started, el: e };
};

const VC = [0.5, 0.6, 0.8, 1, 1.25];   // 말씀카드 다섯 단계
const VF = [0.5, 0.6, 0.8, 1];         // 전체화면 네 단계

// ═══ 1. 핀치 전용 촘촘한 표 ═══
console.log('시나리오 1 — 단계 사이사이 메우기');
{
  sc.eq('말씀카드 표', _tsFine(VC), [0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 1, 1.12, 1.25]);
  sc.eq('전체화면 표', _tsFine(VF), [0.5, 0.55, 0.6, 0.7, 0.8, 0.9, 1]);
  // ⚠️ 양 끝은 설정과 똑같아야 한다 (더 작아지거나 더 커지면 안 된다)
  sc.eq('가장 작은 것은 그대로', _tsFine(VC)[0], VC[0]);
  sc.eq('가장 큰 것도 그대로', _tsFine(VC).slice(-1)[0], VC[VC.length - 1]);
  sc.eq('전체화면은 1 을 넘지 않는다', _tsFine(VF).slice(-1)[0], 1);
  // 설정에 있는 단계는 하나도 빠지면 안 된다
  sc.eq('설정 단계가 모두 들어 있다', VC.filter(v => !_tsFine(VC).includes(v)).length, 0);
  sc.eq('촘촘해졌다', _tsFine(VC).length > VC.length, true);
  sc.eq('작은 것부터 늘어선다',
        _tsFine(VC).every((v, i, a) => i === 0 || v > a[i - 1]), true);
  // 표에 없는 값을 쓰는 화면이 생겨도 그 값은 살아남는다
  sc.eq('모르는 단계도 챙긴다', _tsFine([0.5, 0.77, 1]).includes(0.77), true);
  sc.eq('빈 표도 안전', _tsFine([]), [1]);
}

// ═══ 2. 가장 가까운 칸 ═══
console.log('\n시나리오 2 — 가장 가까운 칸 고르기');
{
  sc.eq('딱 맞으면 그것', _tsNearest(VC, 0.8), 0.8);
  sc.eq('가까운 쪽으로', _tsNearest(VC, 0.79), 0.8);
  sc.eq('아래로도', _tsNearest(VC, 0.62), 0.6);
  sc.eq('표 밖(위)이면 맨 위', _tsNearest(VC, 9), 1.25);
  sc.eq('표 밖(아래)이면 맨 아래', _tsNearest(VC, 0.01), 0.5);
}

// ═══ 3. 벌린 만큼 따라온다 ═══
console.log('\n시나리오 3 — 손가락을 따라오는 정도');
{
  sc.eq('그대로면 안 바뀐다', run(VC, 0.8, 100, 100).v, 0.8);
  // 0812-4 에서는 1.35배를 벌려야 한 칸이었다. 이제 그보다 훨씬 일찍 움직인다.
  sc.eq('1.15배만 벌려도 움직인다', run(VC, 0.8, 100, 115).v > 0.8, true);
  sc.eq('1.15배는 바로 옆 칸(0.9)', run(VC, 0.8, 100, 115).v, 0.9);
  sc.eq('1.25배면 1', run(VC, 0.8, 100, 125).v, 1);
  sc.eq('1.4배면 1.12', run(VC, 0.8, 100, 140).v, 1.12);
  sc.eq('1.5배면 맨 위 1.25', run(VC, 0.8, 100, 150).v, 1.25);
  sc.eq('오므리면 작아진다', run(VC, 0.8, 100, 85).v, 0.7);
  sc.eq('많이 오므리면 더', run(VC, 0.8, 100, 70).v, 0.55);
  // 문턱 — 아주 살짝은 안 바뀐다 (손 떨림)
  sc.eq('1.03배는 그대로', run(VC, 0.8, 100, 103).v, 0.8);
  sc.eq('0.97배도 그대로', run(VC, 0.8, 100, 97).v, 0.8);
  sc.eq('문턱은 6% 쯤', Math.abs(TS_SNAP_HYST - 0.06) < 1e-9, true);
}

// ═══ 4. 양 끝은 설정 그대로 ═══
console.log('\n시나리오 4 — 최소·최대는 기존대로');
{
  sc.eq('말씀카드 맨 위에서 더 벌려도 1.25', run(VC, 1.25, 100, 500).v, 1.25);
  sc.eq('말씀카드 맨 아래에서 더 오므려도 0.5', run(VC, 0.5, 500, 100).v, 0.5);
  sc.eq('전체화면 맨 위에서 더 벌려도 1', run(VF, 1, 100, 500).v, 1);
  sc.eq('전체화면 맨 아래에서 더 오므려도 0.5', run(VF, 0.5, 500, 100).v, 0.5);
  sc.eq('전체화면은 1.12·1.25 로 못 간다',
        [run(VF, 1, 100, 200).v, run(VF, 0.8, 100, 300).v], [1, 1]);
  sc.eq('크게 벌리면 끝까지', run(VC, 0.5, 100, 300).v, 1.25);
  sc.eq('크게 오므리면 끝까지', run(VC, 1.25, 300, 100).v, 0.5);
}

// ═══ 5. ⚠️ 손가락이 하나씩 떨어질 때 ═══
console.log('\n시나리오 5 — 한 손이 먼저 떨어져도 다른 제스처가 안 걸린다');
{
  const r = run(VC, 0.8, 100, 150, { keepDown: true });
  // 손가락 하나만 떨어짐 → 아직 핀치 중으로 본다
  r.el.fire('touchend', { touches: one });
  sc.eq('한 손만 떼면 아직 막는다', _tsPinchBusy(), true);
  // 남은 손가락이 움직여도 크기는 더 안 바뀐다 (한 손가락은 핀치가 아니다)
  const before = r.v;
  r.el.fire('touchmove', Object.assign({ touches: one }, pd));
  sc.eq('남은 한 손가락으로는 안 바뀐다', r.v, before);
  // 마지막 손가락까지 떨어져도 잠깐은 막는다
  r.el.fire('touchend', { touches: none });
  sc.eq('다 뗀 직후에도 잠깐 막는다', _tsPinchBusy(), true);
  sc.eq('막아 두는 시간이 넉넉하다', TS_PINCH_TAIL >= 300, true);
  sc.eq('가짜 클릭 막을 표식도 남긴다', typeof window._rpLastTouchTs, 'number');
}

// ═══ 6. 롱터치 진입 막기 ═══
console.log('\n시나리오 6 — 롱터치 차단');
{
  sc.eq('닿자마자 한 번 끊는다', run(VC, 0.8, 100, 150).started, 1);
  // 손가락이 하나면 핀치가 아니다 — 롱터치를 끊어서도 안 된다
  const e = el(); let started = 0, cur = 0.8;
  _attachTextPinch(e, { get: () => cur, steps: () => VC, set: x => { cur = x; }, onStart: () => { started++; } });
  e.fire('touchstart', { touches: one });
  e.fire('touchmove', Object.assign({ touches: one }, pd));
  sc.eq('한 손가락은 건드리지 않는다', started, 0);
  sc.eq('한 손가락으로는 크기도 안 바뀐다', cur, 0.8);
}

// ═══ 7. 붙인 자리와 막은 자리 ═══
console.log('\n시나리오 7 — 코드에 실제로 걸려 있는가');
{
  sc.eq('전체화면에 붙였다',
        /_attachTextPinch\(el,\{\s*\n\s*get:\(\)=>_vfTextScale\(\),/.test(SRC), true);
  sc.eq('말씀카드에 붙였다',
        /_attachTextPinch\(body,\{\s*\n\s*get:\(\)=>_vcTextScale\(_vcGet\(id\)\),/.test(SRC), true);
  // ⚠️ 손 떼기 사고를 막는 자리 — 하나라도 빠지면 그 길로 말씀이 넘어간다
  sc.eq('전체화면 세로 드래그 시작', SRC.includes('if(_tsPinchBusy()){dropDrag();return;}'), true);
  sc.eq('전체화면 세로 드래그 중',
        SRC.includes('if(_tsPinchBusy()||e.touches.length>=2){dropDrag();return;}'), true);
  sc.eq('전체화면 손 뗄 때',
        SRC.includes('if(_tsPinchBusy()){dropDrag();return;}     // 핀치 끝자락의 손 떼기'), true);
  sc.eq('전체화면 가짜 클릭',
        SRC.includes('if(_tsPinchBusy()){e.preventDefault();e.stopPropagation();return;}'), true);
  sc.eq('전체화면 가장자리 뒤로가기',
        SRC.includes('if(_tsPinchBusy()){active=false;return;}       // 핀치 중·직후엔'), true);
  const cardGuard = 'if(_tsPinchBusy()){if(dragging)snapBack();active=false;dragging=false;return;}';
  sc.eq('말씀카드 세 곳(시작·이동·뗌)', (SRC.match(new RegExp(cardGuard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 3);
  sc.eq('말씀카드 가짜 클릭', SRC.includes('if(_tsPinchBusy())return;                             // 핀치 끝자락의 가짜 클릭'), true);
  // 사이값(0.7 같은 것)에서도 −/+ 와 설정 버튼이 어긋나지 않아야 한다
  sc.eq('−/+ 는 다음 설정 단계를 찾는다', SRC.includes('? VC_TS_STEPS.find(v=>v>cur+0.001)'), true);
  sc.eq('−/+ 는 이전 설정 단계도', SRC.includes(': VC_TS_STEPS.filter(v=>v<cur-0.001).pop();'), true);
  sc.eq('카드 설정 버튼은 가장 가까운 것에 불', SRC.includes('const onV=_tsNearest(VC_TS_STEPS,cur);'), true);
  sc.eq('전체화면 설정 버튼도', SRC.includes('const onV=_tsNearest(VF_TEXT_STEPS,_vfTextScale());'), true);
  // 예전 방식('몇 칸' 세기)은 남아 있으면 안 된다
  sc.eq('칸 세는 방식은 없앴다', SRC.includes('_tsPinchSteps'), false);
}

sc.done();
