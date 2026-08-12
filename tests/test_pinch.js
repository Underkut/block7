// 핀치(두 손가락)로 글자 크기 옮기기 — 전체화면·말씀카드 공용 (v26-0812-4)
//
// 크기가 몇 단계로 딱딱 끊겨 있으므로, 미리보기로 늘였다가 놓을 때 맞추지 않고
// **미는 동안 바로 그 단계로 바꾼다.** 실제로 보이는 그대로라 손에 잘 붙는다.
//
// ⚠️ 이 기능에서 반드시 지켜야 하는 것:
//   ① 두 번째 손가락이 닿는 순간 **롱터치 대기를 끊는다.** 안 끊으면 크기를
//      바꾸는 도중에 말씀 메뉴가 떠서 제스처가 통째로 끊긴다.
//   ② 밀던 중에 손가락이 하나 더 얹혀도 말씀이 넘어가지 않는다(제자리로).
//   ③ 살짝 벌어진 정도로는 안 바뀐다 — 안 그러면 스크롤할 때마다 크기가 흔들린다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.window = {};
eval(
  slice('// ══════ 핀치(두 손가락)로 글자 크기 옮기기', 'function _syncVfTextScaleUI(') +
  ';Object.assign(globalThis,{_tsTouchDist,_tsPinchSteps,_attachTextPinch});'
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
const noop = { preventDefault() {} };
// 배율 v 에서 시작해 d0 → d1 로 벌린(오므린) 뒤의 배율
const run = (steps, v, d0, d1, hook) => {
  const e = el();
  let cur = v, started = 0;
  _attachTextPinch(e, {
    get: () => cur, steps: () => steps, set: x => { cur = x; },
    onStart: () => { started++; },
  });
  e.fire('touchstart', { touches: touches(d0) });
  if (hook) hook({ started: () => started });
  e.fire('touchmove', Object.assign({ touches: touches(d1) }, noop));
  e.fire('touchend', { touches: [] });
  return { v: cur, started };
};

const VC = [0.5, 0.6, 0.8, 1, 1.25];   // 말씀카드 다섯 단계
const VF = [0.5, 0.6, 0.8, 1];         // 전체화면 네 단계

// ═══ 1. 몇 칸으로 볼지 ═══
console.log('시나리오 1 — 벌린 배율 → 몇 칸');
{
  sc.eq('그대로면 0칸', _tsPinchSteps(1), 0);
  sc.eq('살짝(1.1배)은 0칸', _tsPinchSteps(1.1), 0);
  sc.eq('1.17배부터 한 칸', _tsPinchSteps(1.17), 1);
  sc.eq('1.35배는 한 칸', _tsPinchSteps(1.35), 1);
  sc.eq('1.9배는 두 칸', _tsPinchSteps(1.9), 2);
  sc.eq('오므리면 음수', _tsPinchSteps(1 / 1.35), -1);
  sc.eq('많이 오므리면 -2', _tsPinchSteps(1 / 1.9), -2);
  sc.eq('0.95배는 0칸', _tsPinchSteps(0.95), 0);
  // 이상한 값이 들어와도 움직이지 않는다
  sc.eq('0 은 0칸', _tsPinchSteps(0), 0);
  sc.eq('음수는 0칸', _tsPinchSteps(-2), 0);
  sc.eq('숫자가 아니면 0칸', _tsPinchSteps(NaN), 0);
  sc.eq('무한대도 0칸', _tsPinchSteps(Infinity), 0);
}

// ═══ 2. 손가락 사이 거리 ═══
console.log('\n시나리오 2 — 두 손가락 사이');
{
  sc.eq('가로로 벌린 만큼', Math.round(_tsTouchDist(touches(100))), 100);
  sc.eq('비스듬해도 잰다',
        Math.round(_tsTouchDist([{ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 }])), 5);
}

// ═══ 3. 말씀카드 다섯 단계 ═══
console.log('\n시나리오 3 — 말씀카드에서 벌리고 오므리기');
{
  sc.eq('0.8 에서 벌리면 1', run(VC, 0.8, 100, 140).v, 1);
  sc.eq('많이 벌리면 두 칸 건너 1.25', run(VC, 0.8, 100, 200).v, 1.25);
  sc.eq('0.8 에서 오므리면 0.6', run(VC, 0.8, 140, 100).v, 0.6);
  sc.eq('살짝 벌린 정도로는 안 바뀐다', run(VC, 0.8, 100, 110).v, 0.8);
  sc.eq('살짝 오므린 정도로도 안 바뀐다', run(VC, 0.8, 100, 95).v, 0.8);
  // 끝에서 더 밀어도 넘어가지 않는다
  sc.eq('맨 위에서 더 벌려도 1.25', run(VC, 1.25, 100, 400).v, 1.25);
  sc.eq('맨 아래에서 더 오므려도 0.5', run(VC, 0.5, 400, 100).v, 0.5);
  // 저장된 값이 단계 표에 딱 맞지 않아도 가장 가까운 칸에서 센다
  sc.eq('어중간한 값은 가까운 칸 기준', run(VC, 0.79, 100, 140).v, 1);
}

// ═══ 4. 전체화면 네 단계 ═══
console.log('\n시나리오 4 — 전체화면에서 벌리고 오므리기');
{
  sc.eq('1 에서 오므리면 0.8', run(VF, 1, 140, 100).v, 0.8);
  sc.eq('많이 오므리면 0.6', run(VF, 1, 200, 100).v, 0.6);
  sc.eq('맨 위에서 더 벌려도 1', run(VF, 1, 100, 400).v, 1);
  sc.eq('맨 아래에서 더 오므려도 0.5', run(VF, 0.5, 400, 100).v, 0.5);
  sc.eq('전체화면에는 1.25 가 없다', VF.includes(1.25), false);
}

// ═══ 5. ⚠️ 두 번째 손가락이 닿으면 롱터치를 끊는다 ═══
console.log('\n시나리오 5 — 롱터치 진입 막기');
{
  // onStart 는 두 손가락이 닿는 그 순간 불려야 한다 (움직이기 전에)
  let seen = null;
  run(VC, 0.8, 100, 140, o => { seen = o.started(); });
  sc.eq('닿자마자 끊는다(움직이기 전에)', seen, 1);
  sc.eq('한 제스처에 한 번만', run(VC, 0.8, 100, 140).started, 1);

  // 손가락이 하나면 핀치가 아니다 — 롱터치를 끊어서도 안 된다
  const e = el(); let started = 0, cur = 0.8;
  _attachTextPinch(e, { get: () => cur, steps: () => VC, set: x => { cur = x; }, onStart: () => { started++; } });
  const one = [{ clientX: 0, clientY: 0 }]; one.length = 1;
  e.fire('touchstart', { touches: one });
  e.fire('touchmove', Object.assign({ touches: one }, noop));
  sc.eq('한 손가락은 건드리지 않는다', started, 0);
  sc.eq('한 손가락으로는 크기도 안 바뀐다', cur, 0.8);

  // 가짜 click 을 막는 표식을 남긴다 (핀치 뒤에 카드가 열리면 안 된다)
  sc.eq('가짜 클릭 막을 표식', typeof window._rpLastTouchTs, 'number');
}

// ═══ 6. 두 화면 모두에 실제로 붙어 있는가 ═══
console.log('\n시나리오 6 — 붙인 자리');
{
  sc.eq('전체화면에 붙였다',
        /_attachTextPinch\(el,\{\s*\n\s*get:\(\)=>_vfTextScale\(\),/.test(SRC), true);
  sc.eq('전체화면은 자기 단계표를 쓴다', SRC.includes('steps:()=>[...VF_TEXT_STEPS].sort((a,b)=>a-b),'), true);
  sc.eq('말씀카드에 붙였다',
        /_attachTextPinch\(body,\{\s*\n\s*get:\(\)=>_vcTextScale\(_vcGet\(id\)\),/.test(SRC), true);
  sc.eq('말씀카드는 다섯 단계표를 쓴다', SRC.includes('steps:()=>VC_TS_STEPS,'), true);
  // ⚠️ 전체화면 touchstart 가 두 손가락을 걸러야 한다 (예전에는 안 걸렀다)
  sc.eq('전체화면은 두 손가락이면 롱터치를 끊는다',
        SRC.includes('if(e.touches.length>=2){\n      stopLt();_vfLongFired=false;'), true);
  sc.eq('밀던 중에 손가락이 얹혀도 제자리로',
        SRC.includes("if(e.touches.length>=2){stopLt();if(dragging){snapBack();dragging=false;}dir=null;return;}"), true);
  // 카드는 예전부터 두 손가락이면 active=false 였다 — 그대로 있는지 확인
  sc.eq('카드는 두 손가락이면 밀기를 접는다',
        SRC.includes('if(isCtl(e.target)||e.touches.length!==1){active=false;return;}'), true);
  // ⚠️ 미는 도중에 renderRightPanel() 을 부르면 만지던 카드가 사라진다
  sc.eq('카드는 가벼운 길로 바꾼다', SRC.includes('function vcSetTextScaleLive(id,v)'), true);
  sc.eq('그 카드 하나만 다시 앉힌다', SRC.includes('if(w)_vcLayoutOne(w);'), true);
  sc.eq('핀치 중에 패널 전체를 다시 그리지 않는다',
        /function vcSetTextScaleLive\(id,v\)\{[\s\S]*?\n\}/.exec(SRC)[0].includes('renderRightPanel()'), false);
}

sc.done();
