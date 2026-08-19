// v26-0819-6/7/8, HB — 전체화면 줄바꿈 규칙에 실험적으로 확장 필수 행갈이를 추가.
// HB 가 이 규칙을 "HB 줄바꿈 S2" 라는 이름으로 부르기로 했다 — 나중에
// "HB 줄바꿈 S2 취소해" 라고 하면 _VF_EXP_BREAK_RULES 를 찾으면 된다.
// 운영에서 일정 기간 실사용해보고 문제가 있으면 상수 하나만 false 로 바꿔 롤백한다.
//
// v26-0819-7 — "하라"(2글자)처럼 짧은 낱말이 '라'로 끝나도 줄바꿈이 안 되는
// 게 재신고됐다. S2 가 다루는 글자는 길이 제한을 아예 없앴다.
//
// v26-0819-8 — HB 가 실사용 중 "니"가 필수인데도 안 끊기는 경우를 재신고했다.
// 진짜 원인은 S2 가 아니라 DP 알고리즘 자체의 결함이었다: '전성어미·조사·
// 보조적 연결어미(no)'가 8단어(_VF_MAXW) 넘게 연달아 나오면 그 구간 안에는
// 끊을 자리가 아예 없어서 DP 가 답을 못 찾고(best[n]=INF), must/no 규칙을
// 통째로 무시하는 안전망(폭 기준 단순 줄바꿈)으로 떨어졌다. 단어 수 상한을
// 하드컷 대신 페널티로 바꿔 고쳤다. 같은 요청으로 '고' 를 필수 목록에
// 추가하고, "따라"를 예외로 뺐다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 이름 붙은 실험 플래그로 감싸져 있다(롤백 쉬움)');
{
  sc.eq('실험 플래그가 있다', SRC.includes('const _VF_EXP_BREAK_RULES=true;'), true);
  sc.eq('니·라·사·여·요·즉·고 확장 필수 규칙',
        SRC.includes('const _VF_EXP_END_MUST=/(니|라|사|여|요|즉|고)$/;'), true);
  sc.eq("'따라' 예외", SRC.includes('const _VF_EXP_EXCEPT=/^(따라)$/;'), true);
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  sc.eq('_vfBreakClass 안에서 플래그·예외를 함께 확인한다(끄면 즉시 무효화), 길이 제한 없음',
        fn.includes("if(_VF_EXP_BREAK_RULES&&!_VF_EXP_EXCEPT.test(w)&&_VF_EXP_END_MUST.test(w))return 'must';"), true);
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
  sc.eq("'~고'로 끝나면 필수(예: 거스르고, v26-0819-8 추가)", _vfBreakClass('거스르고'), 'must');
  sc.eq("'~한'은 여전히 금지(예: 거룩한)", _vfBreakClass('거룩한'), 'no');
  sc.eq("'~의'는 여전히 금지(예: 하나님의)", _vfBreakClass('하나님의'), 'no');
  sc.eq("'~지'는 여전히 금지(예: 알지)", _vfBreakClass('알지'), 'no');
  sc.eq("'~게'는 여전히 금지(예: 되게)", _vfBreakClass('되게'), 'no');
  sc.eq("'~라'는 그대로 필수(예: 충만하니라, 3글자 이상)", _vfBreakClass('충만하니라'), 'must');
  sc.eq("'~라'는 2글자여도 필수(예: 하라)", _vfBreakClass('하라'), 'must');
  sc.eq("'따라'는 예외라 필수가 아니다(v26-0819-8)", _vfBreakClass('따라'), 'soft');
}

console.log('\n시나리오 4 — DP 단어 수 상한은 하드컷이 아니라 페널티(v26-0819-8, 실사용 재신고 수정)');
{
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  if(best[n]===INF)');
  sc.eq('i 의 시작을 더는 j-_VF_MAXW 로 자르지 않는다(전체 구간을 살핀다)',
        fn.includes('for(let i=0;i<j;i++){'), true);
  sc.eq('예전의 하드컷 for(let i=Math.max(0,j-_VF_MAXW)... 는 없앴다',
        fn.includes('for(let i=Math.max(0,j-_VF_MAXW)'), false);
  sc.eq('8단어 초과는 이제 페널티로만 억제한다', fn.includes("if(wc>_VF_MAXW)c+=(wc-_VF_MAXW)*140;"), true);

  // 실제 문제 사례 재현 — '이 둘이 서로 대적함으로 너희가 원하는 것을 하지
  // 못하게 하려' 처럼 8단어 넘게 끊을 자리가 없는 no 연속 구간이 있어도
  // DP 가 안전망(rule 무시)으로 떨어지지 않고 '니' 뒤에서 끊는 걸 확인한다.
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfWrapFit[\s\S]*?\n\}\n/);
  eval(m[0]);
  const raw='육체의 소욕은 성령을 거스르고 성령은 육체를 거스르나니 이 둘이 서로 대적함으로 너희가 원하는 것을 하지 못하게 하려 함이니라';
  const words=raw.split(/\s+/);
  const ctx={measureText:(t)=>({width:t.length*12})};
  const lines=_vfWrapFit(words,ctx,600);
  sc.eq("실사용 재신고 문장 — '거스르나니'(니) 뒤에서 실제로 끊긴다",
        lines[0].endsWith('거스르나니'), true);
}

sc.done();
