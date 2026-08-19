// v26-0819-6, HB — 전체화면 줄바꿈 규칙에 실험적으로 확장 필수 행갈이를 추가.
// HB 가 이 규칙을 "HB 줄바꿈 S2" 라는 이름으로 부르기로 했다 — 나중에
// "HB 줄바꿈 S2 취소해" 라고 하면 _VF_EXP_BREAK_RULES 를 찾으면 된다.
// 운영에서 일정 기간 실사용해보고 문제가 있으면 상수 하나만 false 로 바꿔 롤백한다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 이름 붙은 실험 플래그로 감싸져 있다(롤백 쉬움)');
{
  sc.eq('실험 플래그가 있다', SRC.includes('const _VF_EXP_BREAK_RULES=true;'), true);
  sc.eq('니·사·여·즉 확장 필수 규칙', SRC.includes('const _VF_EXP_END_MUST=/(니|사|여|즉)$/;'), true);
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  sc.eq('_vfBreakClass 안에서 플래그를 직접 확인한다(끄면 즉시 무효화)',
        fn.includes('if(_VF_EXP_BREAK_RULES&&w.length>=2&&_VF_EXP_END_MUST.test(w))return \'must\';'), true);
}

console.log('\n시나리오 2 — 배치 순서: 금지(no) 판정이 실험 규칙보다 먼저 온다');
{
  // '한·의·지·게'로 끝나는 낱말은 이미 no 로 걸러지므로, 실험 규칙이 뒤에
  // 있어도 절대 must 로 뒤집히지 않는다(no 가 먼저 return 되어 버림).
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  const noAuxIdx = fn.indexOf("_VF_NO_AUX.test(w))return 'no';");
  const noTransIdx = fn.indexOf("_VF_NO_TRANS.test(w))return 'no';");
  const expIdx = fn.indexOf('_VF_EXP_BREAK_RULES&&');
  sc.eq('전성어미·조사 금지(한·의 포함)가 실험 규칙보다 앞', noTransIdx >= 0 && noTransIdx < expIdx, true);
  sc.eq('보조적 연결어미 금지(지·게 포함)가 실험 규칙보다 앞', noAuxIdx >= 0 && noAuxIdx < expIdx, true);
}

console.log('\n시나리오 3 — 실제 판정 결과 (직접 로드해서 확인)');
{
  const m = SRC.match(/const _VF_CONJ_HEAD[\s\S]*?function _vfShortOK[\s\S]*?\n\}/);
  eval(m[0]);
  sc.eq("'~니'로 끝나면 필수(예: 하였으니)", _vfBreakClass('하였으니'), 'must');
  sc.eq("'~사'로 끝나면 필수(예: 은혜로우사)", _vfBreakClass('은혜로우사'), 'must');
  sc.eq("'~여'로 끝나면 필수(예: 사랑하여)", _vfBreakClass('사랑하여'), 'must');
  sc.eq("'~즉'으로 끝나면 필수(예: 진리즉)", _vfBreakClass('진리즉'), 'must');
  sc.eq("'~한'은 여전히 금지(예: 거룩한)", _vfBreakClass('거룩한'), 'no');
  sc.eq("'~의'는 여전히 금지(예: 하나님의)", _vfBreakClass('하나님의'), 'no');
  sc.eq("'~지'는 여전히 금지(예: 알지)", _vfBreakClass('알지'), 'no');
  sc.eq("'~게'는 여전히 금지(예: 되게)", _vfBreakClass('되게'), 'no');
  sc.eq("'~라'는 그대로 필수(예: 충만하니라)", _vfBreakClass('충만하니라'), 'must');
}

sc.done();
