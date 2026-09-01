// 토스트 개선 (v26-0817-1, HB 요청)
// ① 유지 시간을 글자 수에 비례하게 — 글자당 200ms, 최소 3.0s, 최대 9.0s
// ② 날짜 이동 안내에 실제 날짜·요일·구간을 담는다
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.ST = { settings: {} };
global.SECS = [
  { id: 'am', name: '오전' },
  { id: 'pm', name: '오후' },
  { id: 'night', name: '밤' }
];

eval(slice('const _KDOW=', '\n// ─ Toast ─')
  + '\nglobal._moveDateToastMsg=_moveDateToastMsg;global._KDOW=_KDOW;');

console.log('시나리오 1 — 날짜 이동 안내 문구');
{
  sc.eq('월/일/요일/구간 순서로 담는다',
        _moveDateToastMsg('2026-08-17', 'am'), '8월 17일 월요일 오전 날짜로 이동했어요');
  sc.eq('다른 요일도 맞는다',
        _moveDateToastMsg('2026-08-18', 'pm'), '8월 18일 화요일 오후 날짜로 이동했어요');
  sc.eq('구간을 못 찾으면 그 자리를 뺀다',
        _moveDateToastMsg('2026-08-17', 'unknown'), '8월 17일 월요일 날짜로 이동했어요');
  // 요일은 항상 한글 — 사용자가 DOW 표기를 L/M/T 로 바꿔 둬도 이 문구는 안 바뀐다
  sc.eq('요일 배열은 한글 고정', _KDOW, ['일', '월', '화', '수', '목', '금', '토']);
}

console.log('\n시나리오 2 — 토스트 유지 시간이 글자 수에 비례한다');
{
  const { SRC } = require('./_load');
  sc.eq('글자당 200ms', SRC.includes('const dur=Math.min(9000,Math.max(3000,s.length*200));'), true);
  sc.eq('예전 문구 길이는 최소값 그대로',
        Math.min(9000, Math.max(3000, '날짜로 이동했어요'.length * 200)), 3000);
  const longMsg = _moveDateToastMsg('2026-08-17', 'am');
  const longDur = Math.min(9000, Math.max(3000, longMsg.length * 200));
  sc.eq('긴 문구는 더 오래 떠 있는다', longDur > 3000, true);
  sc.eq('9초를 넘지 않는다',
        Math.min(9000, Math.max(3000, 'x'.repeat(100).length * 200)), 9000);
}

console.log('\n시나리오 3 — 진행 중 토스트는 결과가 나올 때까지 안 내려간다 (v26-0901-3, HB)');
{
  const { SRC } = require('./_load');
  // HB — "불러오기 결과 요약을 보여주기까지 그 앞 토스트가 유지되면 되지 않을까?
  //       '불러오고 있습니다…' 대신 뭔가 돌아가고 있는 애니메이션이 있으면 좋겠어."
  sc.eq('진행 중 토스트가 있다', SRC.includes('function showBusyToast(msg){'), true);
  sc.eq('내리는 길도 있다', SRC.includes('function hideBusyToast(){'), true);
  // ⚠️ 시간으로 내리지 않는다 — 결과 토스트가 덮어써야만 내려간다
  sc.eq('시간으로 안 내린다', SRC.includes('t._busy=!!busy;\n  if(busy)return;'), true);
  // ⚠️ 화면을 눌러도 안 내려간다 (눌러 사라지면 "끝난 건가?" 하고 기다리게 된다)
  sc.eq('눌러도 안 내려간다', SRC.includes('if(t._busy&&!force)return;'), true);
  sc.eq('결과가 들어오면 자리를 내준다', SRC.includes('t._busy=false;'), true);
  // 돌아가는 표시 — 테두리·박스 없이 선 하나 (UI 원칙)
  sc.eq('도는 표시가 있다', SRC.includes("const _TOAST_SPIN='<svg class=\"toast-spin\""), true);
  sc.eq('돌아간다', SRC.includes('@keyframes toastSpin{to{transform:rotate(360deg);}}'), true);
  sc.eq('숨 쉬듯 살짝', SRC.includes('@keyframes toastBreathe'), true);
  // 실제로 쓰는 자리 두 곳
  sc.eq('시트 불러오기가 쓴다', SRC.includes("showBusyToast('시트를 불러오고 있어요');"), true);
  sc.eq('전체 업데이트도 쓴다', SRC.includes("showBusyToast('말씀 모음을 업데이트하고 있어요');"), true);
  sc.eq('옛 문구는 없앴다', SRC.includes("showToast('시트를 불러오는 중…');"), false);
}

sc.done();
