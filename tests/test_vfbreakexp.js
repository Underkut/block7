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
//
// v26-0819-10 — S2 가 폭과 무관해지면서 줄 수가 늘기 쉬워져, 여백이 남는데도
// 글자가 작아지는 문제가 생겼다. 글자 크기를 줄이는 줄 수 경계(maxLines)를
// +1 로 관대하게 했다 — S2 자체는 건드리지 않았다.
//
// v26-0819-11 — HB 가 "이 규칙은 모든 규칙 위에 최상위 규칙"이라며 네 가지를
// 더 요청했다.
//  1. 필수 글자에 '서·며' 추가, "따라" 예외는 그대로.
//  2. 금지 낱말에 '가장·매우' 추가('한·의·지·게·내·모든'은 이미 있었다).
//  3. 붙어 다녀야 하는 낱말 쌍("것 같이", "하려 함이니라")은 그 사이를 끊지 않는다.
//  4. 마지막 줄이 1단어만 남는 '외톨이 줄'을 주어 기준으로 재분배한다.
// "최상위"를 문자 그대로 반영해 S2 판정을 _vfBreakClass 맨 앞으로 옮겼다 —
// '~께서·~에서'처럼 원래 no 였던 낱말도 '서'로 끝나면 이제 forced 가 이긴다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 이름 붙은 실험 플래그로 감싸져 있다(롤백 쉬움)');
{
  sc.eq('실험 플래그가 있다', SRC.includes('const _VF_EXP_BREAK_RULES=true;'), true);
  sc.eq('니·라·사·여·요·즉·고·서·며 확장 필수 규칙(v26-0819-11: 서·며 추가)',
        SRC.includes('const _VF_EXP_END_MUST=/(니|라|사|여|요|즉|고|서|며)$/;'), true);
  sc.eq("'따라' 예외", SRC.includes('const _VF_EXP_EXCEPT=/^(따라)$/;'), true);
  sc.eq("금지 낱말에 '가장·매우' 추가(v26-0819-11)",
        SRC.includes('|또|또한|곧|가장|매우)$/;'), true);
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  sc.eq("S2 는 'forced' 등급(폭 무관 하드 규칙)을 돌려준다",
        fn.includes("if(_VF_EXP_BREAK_RULES&&!_VF_EXP_EXCEPT.test(w)&&_VF_EXP_END_MUST.test(w))return 'forced';"), true);
  sc.eq("v26-0819-11 — S2 가 no 판정보다 먼저 온다(최상위 우선순위)",
        fn.indexOf("_VF_EXP_END_MUST.test(w))return 'forced';") < fn.indexOf("_VF_NO_TRANS.test(w))return 'no';"), true);
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
  sc.eq("'~서'는 forced, v26-0819-11 추가(예: 여호와께서 — 예전엔 no 였다)", _vfBreakClass('여호와께서'), 'forced');
  sc.eq("'~며'는 forced, v26-0819-11 추가(예: 가며)", _vfBreakClass('가며'), 'forced');
  sc.eq("'~한'은 여전히 금지(예: 거룩한)", _vfBreakClass('거룩한'), 'no');
  sc.eq("'~의'는 여전히 금지(예: 하나님의)", _vfBreakClass('하나님의'), 'no');
  sc.eq("'~지'는 여전히 금지(예: 알지)", _vfBreakClass('알지'), 'no');
  sc.eq("'~게'는 여전히 금지(예: 되게)", _vfBreakClass('되게'), 'no');
  sc.eq("'가장'은 금지, v26-0819-11 추가", _vfBreakClass('가장'), 'no');
  sc.eq("'매우'는 금지, v26-0819-11 추가", _vfBreakClass('매우'), 'no');
  sc.eq("'내'는 이미 금지였다(변화 없음)", _vfBreakClass('내'), 'no');
  sc.eq("'모든'은 이미 금지였다(변화 없음)", _vfBreakClass('모든'), 'no');
  sc.eq("'~라'는 forced(예: 충만하니라, 하라 — 길이 무관)", _vfBreakClass('충만하니라'), 'forced');
  sc.eq("'따라'는 예외라 forced 가 아니다", _vfBreakClass('따라'), 'soft');
}

console.log('\n시나리오 3-1 — 붙어 다녀야 하는 낱말 쌍은 그 사이를 끊지 않는다 (v26-0819-11, HB 3)');
{
  sc.eq('쌍 목록에 것/같이, 하려/함이니라 가 있다',
        SRC.includes("const _VF_PAIR_KEEP=[['것','같이'],['하려','함이니라']];"), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n\}\n/);
  eval(m[0]);
  const ctx={measureText:(t)=>({width:t.length*12})};
  const raw='소망을 가졌으나 것 같이 보였다';
  [10,20,30,40,60].forEach(w=>{
    const lines=_vfWrapFit(raw.split(' '),ctx,w);
    sc.eq(`maxW=${w}: '것'과 '같이'가 항상 한 줄에 함께 있다`,
          lines.some(l=>l.includes('것 같이')), true);
  });
}

console.log('\n시나리오 3-2 — 외톨이 줄(1단어) 보정 — 실제 예시 그대로 검증 (v26-0819-11, HB 4)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n\}\n/);
  eval(m[0]);
  // 4-1 예시 — 주어(그리스도께서) 비중이 커서(ratio>0.5) 주어 바로 뒤에서 끊는다
  sc.eq('4-1 예시 — 그리스도께서 단독 줄, 나머지는 아래로',
        JSON.stringify(_vfFixWidow(['그리스도께서 우리를 자유롭게','하려고'])),
        JSON.stringify(['그리스도께서','우리를 자유롭게 하려고']));
  // 4-2 예시 — 주어(내가) 비중이 작아서(ratio<=0.5) 주어 다음 의미 덩어리까지만 남긴다
  sc.eq('4-2 예시 — 곧 내가 내 평생에 / 여호와의 집에 살면서',
        JSON.stringify(_vfFixWidow(['곧 내가 내 평생에 여호와의 집에','살면서'])),
        JSON.stringify(['곧 내가 내 평생에','여호와의 집에 살면서']));
  // 주어를 못 찾으면 손대지 않는다 (이/가/은/는/께서 로 끝나는 낱말이 전혀 없을 때)
  sc.eq('주어(이/가/은/는/께서)가 없으면 그대로 둔다',
        JSON.stringify(_vfFixWidow(['맑고 아름다운 하늘 아래로','걸어갔다'])),
        JSON.stringify(['맑고 아름다운 하늘 아래로','걸어갔다']));
  // 줄이 1개뿐이면 손대지 않는다
  sc.eq('줄이 하나뿐이면 그대로', JSON.stringify(_vfFixWidow(['한 줄뿐'])), JSON.stringify(['한 줄뿐']));
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
