// v26-0819-6/7/8/9, HB — 전체화면 줄바꿈 규칙에 실험적으로 확장 필수 행갈이를 추가.
// HB 가 이 규칙을 "HB 줄바꿈 S2" 라는 이름으로 부르기로 했다 — 나중에
// "HB 줄바꿈 S2 취소해" 라고 하면 _VF_EXP_BREAK_RULES 를 찾으면 된다.
// 운영에서 일정 기간 실사용해보고 문제가 있으면 상수 하나만 false 로 바꿔 롤백한다.
//
// v26-0819-7 — "하라"(2글자)처럼 짧은 낱말이 '라'로 끝나도 줄바꿈이 안 되는
// 게 재신고됐다. S2 가 다루는 글자는 길이 제한을 아예 없앴다.
//
// v26-0819-8 — "니"가 필수인데도 안 끊기는 경우를 재신고. DP 알고리즘이
// 단어 수 상한(8단어)을 하드컷으로 써서, 못 끊는 낱말이 8개 넘게 연달아
// 나오면 답을 못 찾고 규칙을 통째로 무시하는 안전망으로 떨어졌다. 하드컷을
// 페널티로 바꿔 고쳤다. '고' 추가, "따라" 예외.
//
// v26-0819-9 — 그래도 모바일 세로에서는 안 끊기고, 회전하면 잠깐 맞았다가
// 되돌아가는 깜빡임까지 재신고됐다. 원인은 v26-0819-8 수정 후에도 S2 의
// '필수'가 여전히 DP 비용(-60 정도)일 뿐이라 폭이 좁아지면 다른 비용에
// 밀렸던 것 — 폭에 따라 결과가 달라지니 회전 중 두 리사이즈 이벤트가 서로
// 다른 답을 그려 깜빡였다. S2 를 'forced' 등급으로 올려 폭·비용과 무관한
// 하드 규칙(끊지 않고 지나치는 후보 자체를 무효화)으로 바꿨다 — 이제 어떤
// 폭에서도 항상 같은 자리에서 끊긴다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 이름 붙은 실험 플래그로 감싸져 있다(롤백 쉬움)');
{
  sc.eq('실험 플래그가 있다', SRC.includes('const _VF_EXP_BREAK_RULES=true;'), true);
  sc.eq('니·라·사·여·요·즉·고 확장 필수 규칙',
        SRC.includes('const _VF_EXP_END_MUST=/(니|라|사|여|요|즉|고)$/;'), true);
  sc.eq("'따라' 예외", SRC.includes('const _VF_EXP_EXCEPT=/^(따라)$/;'), true);
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  sc.eq("S2 는 'forced' 등급(폭 무관 하드 규칙)을 돌려준다",
        fn.includes("if(_VF_EXP_BREAK_RULES&&!_VF_EXP_EXCEPT.test(w)&&_VF_EXP_END_MUST.test(w))return 'forced';"), true);
}

console.log('\n시나리오 2 — DP: forced 지점은 폭·비용과 무관하게 무조건 끊는다(v26-0819-9)');
{
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  let {best,prev}=solve(true);');
  sc.eq("금지(no) 판정 뒤에 forced 하드 블록이 있다 — 지나치는 후보 자체를 무효화",
        fn.includes("for(let k=i;k<last;k++)if(cls[k]==='forced'){hasForced=true;break;}") &&
        fn.includes('if(hasForced)continue;'), true);
  sc.eq('isLast 여도 봐주지 않는다(hasForced 체크가 isLast 조건 없이 항상 돈다)',
        fn.indexOf('if(hasForced)continue;') < fn.indexOf("if(!isLast){\n          if(cls[last]==='forced')"), true);
  sc.eq('forced 로 끝나는 줄은 압도적으로 선호된다', fn.includes("cls[last]==='forced')c-=1e6;"), true);
  sc.eq('단어 수 상한은 여전히 하드컷이 아니라 페널티(v26-0819-8 유지)',
        fn.includes('for(let i=0;i<j;i++){') && fn.includes('if(wc>_VF_MAXW)c+=(wc-_VF_MAXW)*140;'), true);
}

console.log('\n시나리오 2-1 — 폭 검사는 2단계(strict → 페널티)로 재시도한다(v26-0819-9 재재신고 수정)');
{
  // forced(하드) + no(하드) 벽 사이 한 덩어리가 통째로 maxW 를 넘으면, 1차
  // strict 시도(폭 하드컷)가 실패하고(best[n]=INF), 2차 시도(폭 페널티)로
  // 다시 풀어서 그래도 must/no/forced 규칙은 지켜야 한다 — 규칙을 통째로
  // 버리는 안전망으로 떨어지면 안 된다.
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  const lines=[];let j=n;');
  sc.eq('strict 모드로 먼저 푼다', fn.includes('function solve(strict){'), true);
  sc.eq('strict 일 때만 폭을 하드 컷한다', fn.includes('if(strict&&lw>maxW&&wc>1)continue;'), true);
  sc.eq('실패하면 폭을 페널티로 낮춰 다시 푼다',
        fn.includes('if(best[n]===INF)({best,prev}=solve(false));'), true);
  sc.eq('2차 시도에서도 forced/no 하드 규칙은 그대로(같은 solve 함수를 재사용)',
        fn.match(/if\(hasForced\)continue;/g).length===1, true);
}

console.log('\n시나리오 3 — 실제 판정 결과 (직접 로드해서 확인)');
{
  const m = SRC.match(/const _VF_CONJ_HEAD[\s\S]*?function _vfShortOK[\s\S]*?\n\}/);
  eval(m[0]);
  sc.eq("'~니'는 forced(예: 하였으니)", _vfBreakClass('하였으니'), 'forced');
  sc.eq("'~사'는 forced(예: 은혜로우사)", _vfBreakClass('은혜로우사'), 'forced');
  sc.eq("'~여'는 forced(예: 사랑하여)", _vfBreakClass('사랑하여'), 'forced');
  sc.eq("'~즉'은 forced(예: 진리즉)", _vfBreakClass('진리즉'), 'forced');
  sc.eq("'~고'는 forced(예: 거스르고)", _vfBreakClass('거스르고'), 'forced');
  sc.eq("'~한'은 여전히 금지(예: 거룩한)", _vfBreakClass('거룩한'), 'no');
  sc.eq("'~의'는 여전히 금지(예: 하나님의)", _vfBreakClass('하나님의'), 'no');
  sc.eq("'~지'는 여전히 금지(예: 알지)", _vfBreakClass('알지'), 'no');
  sc.eq("'~게'는 여전히 금지(예: 되게)", _vfBreakClass('되게'), 'no');
  sc.eq("'~라'는 forced(예: 충만하니라, 하라 — 길이 무관)", _vfBreakClass('충만하니라'), 'forced');
  sc.eq("'따라'는 예외라 forced 가 아니다", _vfBreakClass('따라'), 'soft');
}

console.log('\n시나리오 4 — 폭이 달라져도 forced 지점은 항상 같은 자리에서 끊긴다 (v26-0819-9 재신고 수정)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfWrapFit[\s\S]*?\n\}\n/);
  eval(m[0]);
  const raw='육체의 소욕은 성령을 거스르고 성령은 육체를 거스르나니 이 둘이 서로 대적함으로 너희가 원하는 것을 하지 못하게 하려 함이니라';
  const words=raw.split(/\s+/);
  const ctx={measureText:(t)=>({width:t.length*12})};
  // 세로(좁음)부터 가로(넓음)까지 여러 폭에서 전부 '거스르고'·'거스르나니' 뒤에서 끊기는지
  [150,250,350,500,900,1400].forEach(w=>{
    const lines=_vfWrapFit(words,ctx,w);
    const flat=lines.join('|');
    sc.eq(`maxW=${w}: '거스르고' 뒤에서 끊긴다(줄 경계에 있다)`,
          lines.some(l=>l.endsWith('거스르고')), true);
    sc.eq(`maxW=${w}: '거스르나니'(니) 뒤에서 끊긴다(줄 경계에 있다)`,
          lines.some(l=>l.endsWith('거스르나니')), true);
  });
}

console.log('\n시나리오 5 — 글자 크기 축소 경계를 한 줄 더 관대하게 (v26-0819-10, HB)');
{
  // S2(forced)가 폭과 무관하게 끊다 보니 줄 수가 예전보다 쉽게 늘어, 여백이
  // 남는데도 글자가 작아지는 문제가 생겼다. 줄이는 경계(maxLines)를 +1 해서
  // 완화한다 — S2 자체의 위치·우선순위는 건드리지 않는다.
  const fn = slice('function _vfLayoutText(){', '\n  el.style.fontSize');
  sc.eq('maxLines 에 +1 이 붙었다',
        fn.includes("const maxLines=Math.max(1,Math.ceil(words.length/_VF_MINW))+1;"), true);
}

sc.done();
