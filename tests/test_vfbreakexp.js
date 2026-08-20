// v26-0819-6/7/8/9, HB — 전체화면 줄바꿈 규칙에 실험적으로 확장 필수 행갈이를 추가.
// HB 가 이 규칙을 "HB 줄바꿈 S2" 라는 이름으로 부르기로 했다 — 나중에
// "HB 줄바꿈 S2 취소해" 라고 하면 _VF_EXP_BREAK_RULES 를 찾으면 된다.
// 운영에서 일정 기간 실사용해보고 문제가 있으면 상수 하나만 false 로 바꿔 롤백한다.
//
// (v26-0819-7~12 이력은 git log 참고 — 아래는 v26-0820-1 기준 현재 규칙만 정리)
//
// v26-0820-1 — HB 가 "고린도후서 5:1" 실사용에서 "영원한" 뒤가 끊긴 걸 재신고.
// "한"은 이미 _VF_NO_TRANS 접미사로 금지였는데도 끊긴 건, 3단 DP(strict→폭
// 페널티)가 둘 다 실패해(best[n]=INF) 규칙을 통째로 무시하는 안전망으로
// 떨어졌기 때문으로 보인다 — 예전에도 같은 패턴(forced/no 벽이 두 하드
// 규칙과 충돌)으로 여러 번 재발했다. 이번엔 3차 시도(폭 페널티 + 'no' 도
// 무거운 페널티로 낮춤)를 추가해 안전망 자체가 거의 발동하지 않게 했다.
// 동시에 HB 가 규칙 여섯 가지를 통째로 업데이트했다:
//  1. 필수 글자에 '되·니와·랴·든지' 추가. 1-2-2 — 필수 줄바꿈 결과 두 줄
//     글자 수 합이 14 이하면 합친다(_vfDemoteShortForced), "헛되고 헛되며"
//     만 예외로 항상 나눈다.
//  2. 금지 낱말 '가장·매우·내·모든'을 접미사 규칙(_VF_EXP_NO_END)으로 별도
//     관리 — 예전엔 낱말 전체가 정확히 일치할 때만 걸렸다(_VF_NOEND_WORD).
//  3. 낱말 쌍은 그대로.
//  4. 외톨이 줄 보정 — 줄B가 1·2단어까지 대상, (줄A+줄B 글자수)<=8 이면
//     그냥 한 줄로 합친다(4-1), 9 이상이면서 비율 3 이상일 때만 주어 기준
//     재분배(4-2), 그 외엔 그대로 둔다(4-2-0).
//  5. '위·아래·오른·왼'에 '때·만한' 추가.
//  6. 부사구 10자 이상 규칙은 보류 — "부사구"의 경계를 낱말 목록만으로
//     안정적으로 판정할 방법이 없어(잘못 적용하면 거의 모든 구절 첫머리에
//     불필요한 강제 줄바꿈이 생길 위험), 이번 라운드에서는 넣지 않았다.
//
// v26-0820-2 — HB 가 같은 구절(고린도후서 5:1)로 재신고. 이번엔 원인을 정확히
// 찾았다: DP 는 2-1 을 지켜 "…영원한 집이 우리에게 있는 줄 / 아느니라" 로 끊었는데,
// 그 뒤에 도는 4번(외톨이 줄 보정)이 그걸 받아 "…있는 영원한 / 집이 …" 로 다시
// 나눴다. 두 가지가 겹쳤다 — ① 주어를 "있는"(관형형)으로 오인, ② 4번이 고른 자리를
// 1·2·3·5번 하드 규칙에 비춰보지 않았다. 둘 다 고쳤고, 6번(긴 부사구)도 새로 넣었다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 이름 붙은 실험 플래그로 감싸져 있다(롤백 쉬움)');
{
  sc.eq('실험 플래그가 있다', SRC.includes('const _VF_EXP_BREAK_RULES=true;'), true);
  sc.eq('필수 규칙 글자 확장(v26-0820-1: 되·니와·랴·든지 추가)',
        SRC.includes('const _VF_EXP_END_MUST=/(니|라|사|여|요|즉|고|면서|며|되|니와|랴|든지)$/;'), true);
  sc.eq("'따라' 예외", SRC.includes('const _VF_EXP_EXCEPT=/^(따라)$/;'), true);
  sc.eq("2-1 목록 전체를 한 곳에(_VF_EXP_NO_END: 한·의·지·게·가장·매우·내·모든)",
        SRC.includes('const _VF_EXP_NO_END=/(한|의|지|게|가장|매우|내|모든)$/;'), true);
  sc.eq('1-2-2 짧은 합치기 상한(14) 상수', SRC.includes('const _VF_EXP_SHORT_MERGE_MAX=14;'), true);
  sc.eq('1-2-2-0 헛되고/헛되며 예외 함수', SRC.includes('function _vfIsHeotdoeException(w,next)'), true);
  const fn = slice('function _vfBreakClass(w,next){', '\n}');
  sc.eq("S2 는 'forced' 등급(폭 무관 하드 규칙)을 돌려준다",
        fn.includes("if(_VF_EXP_BREAK_RULES&&!_VF_EXP_EXCEPT.test(w)&&_VF_EXP_END_MUST.test(w))return 'forced';"), true);
  sc.eq("v26-0819-11 — S2 가 no 판정보다 먼저 온다(최상위 우선순위)",
        fn.indexOf("_VF_EXP_END_MUST.test(w))return 'forced';") < fn.indexOf("_VF_NO_TRANS.test(w))return 'no';"), true);
  sc.eq("v26-0820-1 — 2-1 접미사 금지도 forced 바로 다음, 다른 no 판정보다 먼저 온다",
        fn.indexOf("_VF_EXP_NO_END.test(w))return 'no';") < fn.indexOf("_VF_NO_TRANS.test(w))return 'no';"), true);
}

console.log('\n시나리오 2 — DP: forced 지점은 폭·비용과 무관하게 무조건 끊는다(v26-0819-9)');
{
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  // 시도 순서');
  sc.eq("금지(no) 판정 뒤에 forced 하드 블록이 있다 — 지나치는 후보 자체를 무효화",
        fn.includes("for(let k=i;k<last;k++)if(cls[k]==='forced'){hasForced=true;break;}") &&
        fn.includes('if(hasForced)continue;'), true);
  sc.eq('isLast 여도 봐주지 않는다(hasForced 체크가 isLast 조건 없이 항상 돈다)',
        fn.indexOf('if(hasForced)continue;') < fn.indexOf("if(!isLast){\n          if(cls[last]==='forced')"), true);
  sc.eq('forced 로 끝나는 줄은 압도적으로 선호된다', fn.includes("cls[last]==='forced')c-=1e6;"), true);
  sc.eq('단어 수 상한은 여전히 하드컷이 아니라 페널티(v26-0819-8 유지)',
        fn.includes('for(let i=0;i<j;i++){') && fn.includes('if(wc>_VF_MAXW)c+=(wc-_VF_MAXW)*140;'), true);
}

console.log('\n시나리오 2-1 — 시도 순서: 폭을 넘기느니 옛 엔진 선호를 먼저 푼다 (v26-0820-4)');
{
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  const lines=[],lineForced=[];let j=n;');
  sc.eq('solve 가 strict·relaxNo·relaxExp 세 가지를 받는다',
        fn.includes('function solve(strict,relaxNo,relaxExp){'), true);
  sc.eq("'끊지 말라'를 HB 2-1(hardNo)와 옛 엔진 선호(softNo)로 나눠 둔다",
        fn.includes('const isHardNo=!isLast&&hardNo[last];') && fn.includes('const isNoSpot=!isLast&&softNo[last];'), true);
  sc.eq('① 전부 지키는 시도가 먼저', fn.includes('let {best,prev}=solve(true,false,false);'), true);
  sc.eq('② 폭은 지킨 채 옛 엔진 선호만 푼다 (폭 넘김보다 낫다)',
        fn.includes('if(best[n]===INF)({best,prev}=solve(true,true,false));'), true);
  sc.eq('③ 그래도 안 되면 폭을 푼다',
        fn.includes('if(best[n]===INF)({best,prev}=solve(false,true,false));'), true);
  sc.eq('④ HB 2-1 은 맨 마지막에만 푼다',
        fn.includes('if(best[n]===INF)({best,prev}=solve(false,true,true));'), true);
  sc.eq('②가 ③보다 먼저 온다(순서가 핵심)',
        fn.indexOf('solve(true,true,false)') < fn.indexOf('solve(false,true,false)'), true);
  sc.eq('HB 2-1 을 어기는 값이 옛 엔진 선호를 어기는 값보다 훨씬 크다',
        fn.includes('c+=200000;') && fn.includes('c+=5000;'), true);
  sc.eq('네 시도 모두 같은 solve 함수를 재사용한다(forced 하드 블록은 한 곳)',
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
  sc.eq("'~면서'는 forced(예: 걸으면서)", _vfBreakClass('걸으면서'), 'forced');
  sc.eq("홑 '~서'는 금지(예: 여호와께서)", _vfBreakClass('여호와께서'), 'no');
  sc.eq("'~며'는 forced(예: 가며)", _vfBreakClass('가며'), 'forced');
  sc.eq("'~되'는 forced, v26-0820-1 추가(예: 원하되)", _vfBreakClass('원하되'), 'forced');
  sc.eq("'~니와'는 forced, v26-0820-1 추가(예: 가니와)", _vfBreakClass('가니와'), 'forced');
  sc.eq("'~랴'는 forced, v26-0820-1 추가(예: 하랴)", _vfBreakClass('하랴'), 'forced');
  sc.eq("'~든지'는 forced, v26-0820-1 추가 — '~지' 금지보다 우선(예: 무엇이든지)",
        _vfBreakClass('무엇이든지'), 'forced');
  sc.eq("'~한'은 여전히 금지(예: 거룩한)", _vfBreakClass('거룩한'), 'no');
  sc.eq("실사용 재신고 — '영원한'도 금지(고린도후서 5:1)", _vfBreakClass('영원한'), 'no');
  sc.eq("'~의'는 여전히 금지(예: 하나님의)", _vfBreakClass('하나님의'), 'no');
  sc.eq("'~지'는 여전히 금지(예: 알지)", _vfBreakClass('알지'), 'no');
  sc.eq("'~게'는 여전히 금지(예: 되게)", _vfBreakClass('되게'), 'no');
  sc.eq("'가장'은 금지 — 접미사 규칙(v26-0820-1)", _vfBreakClass('가장'), 'no');
  sc.eq("'매우'는 금지 — 접미사 규칙(v26-0820-1)", _vfBreakClass('매우'), 'no');
  sc.eq("'내'는 금지 — 접미사 규칙(v26-0820-1)", _vfBreakClass('내'), 'no');
  sc.eq("'모든'은 금지 — 접미사 규칙(v26-0820-1)", _vfBreakClass('모든'), 'no');
  sc.eq("'~라'는 forced(예: 충만하니라, 하라 — 길이 무관)", _vfBreakClass('충만하니라'), 'forced');
  sc.eq("'따라'는 예외라 forced 가 아니다", _vfBreakClass('따라'), 'soft');
}

console.log('\n시나리오 3-1 — 붙어 다녀야 하는 낱말 쌍은 그 사이를 끊지 않는다 (v26-0819-11, HB 3)');
{
  sc.eq('쌍 목록에 것/같이, 하려/함이니라 가 있다',
        SRC.includes("const _VF_PAIR_KEEP=[['것','같이'],['하려','함이니라']];"), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  const ctx={measureText:(t)=>({width:t.length*12})};
  const raw='소망을 가졌으나 것 같이 보였다';
  [10,20,30,40,60].forEach(w=>{
    const lines=_vfWrapFit(raw.split(' '),ctx,w);
    sc.eq(`maxW=${w}: '것'과 '같이'가 항상 한 줄에 함께 있다`,
          lines.some(l=>l.includes('것 같이')), true);
  });
}

console.log('\n시나리오 3-2 — 외톨이 줄(1·2단어) 보정 — 실제 예시 그대로 검증 (v26-0819-11/12/0820-1, HB 4)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  // 4-1(v26-0820-1) — 두 줄 합쳐 8자 이하면 한 줄로 합친다: 예시 4-1
  sc.eq('4-1 예시 — 그런즉 / 형제들아 → 그런즉 형제들아',
        JSON.stringify(_vfFixWidow(['그런즉','형제들아'])),
        JSON.stringify(['그런즉 형제들아']));
  // 줄B가 2단어여도 합계 8자 이하면 합친다
  sc.eq('4-1 — 줄B가 2단어라도 합계 8자 이하면 합친다',
        JSON.stringify(_vfFixWidow(['너를 사랑해','꼭 해'])),
        JSON.stringify(['너를 사랑해 꼭 해']));
  // 4-2-1 예시 — 주어(그리스도께서) 비중이 커서(ratio>0.5) 주어 바로 뒤에서 끊는다
  sc.eq('4-2-1 예시 — 그리스도께서 단독 줄, 나머지는 아래로',
        JSON.stringify(_vfFixWidow(['그리스도께서 우리를 자유롭게','하려고'])),
        JSON.stringify(['그리스도께서','우리를 자유롭게 하려고']));
  // 4-2-2 예시 — 주어(내가) 비중이 작아서(ratio<=0.5) 주어 다음 의미 덩어리까지만 남긴다
  sc.eq('4-2-2 예시 — 곧 내가 내 평생에 / 여호와의 집에 살면서',
        JSON.stringify(_vfFixWidow(['곧 내가 내 평생에 여호와의 집에','살면서'])),
        JSON.stringify(['곧 내가 내 평생에','여호와의 집에 살면서']));
  // 4-2-0 예시 — 합계 9자 이상이어도 비율 3 미만이면 손대지 않는다
  sc.eq('4-2-0 예시 — 글자수 비율 3 미만이면 손대지 않는다',
        JSON.stringify(_vfFixWidow(['너희는 성령을 따라 행하라','그리하면'])),
        JSON.stringify(['너희는 성령을 따라 행하라','그리하면']));
  // 주어를 못 찾으면 손대지 않는다 (이/가/은/는/께서 로 끝나는 낱말이 전혀 없을 때)
  sc.eq('주어(이/가/은/는/께서)가 없으면 그대로 둔다',
        JSON.stringify(_vfFixWidow(['맑고 아름다운 하늘 아래로','걸어갔다'])),
        JSON.stringify(['맑고 아름다운 하늘 아래로','걸어갔다']));
  // 줄이 1개뿐이면 손대지 않는다
  sc.eq('줄이 하나뿐이면 그대로', JSON.stringify(_vfFixWidow(['한 줄뿐'])), JSON.stringify(['한 줄뿐']));
}

console.log('\n시나리오 3-3 — 2-2 예외: "~게" 뒤가 "하려 함이니라" 로 이어지면 금지를 풀어준다 (v26-0819-12, HB 2-2)');
{
  const fn = slice('function _vfWrapFit(words,ctx,maxW){', '\n  const lines=[],lineForced=[];let j=n;');
  sc.eq('_vfGeException 을 2-1(hardNo) 예외로 쓴다',
        SRC.includes('&&!_vfGeException(words[i],words[i+1],words[i+2]));'), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  const ctx={measureText:(t)=>({width:t.length*12})};
  const raw='구원을 얻게 하려 함이니라';
  [10,15,20,30,60].forEach(w=>{
    const lines=_vfWrapFit(raw.split(' '),ctx,w);
    sc.eq(`maxW=${w}: '얻게' 뒤에서 끊길 수 있다(하려·함이니라 는 항상 함께)`,
          lines.some(l=>l.includes('하려 함이니라')), true);
  });
}

console.log('\n시나리오 3-4 — 5번: 위·아래·오른·왼·때·만한 앞은 끊지 않는다 (v26-0819-12/0820-1, HB 5)');
{
  sc.eq('_VF_NO_BEFORE 정의(때·만한 추가)', SRC.includes('const _VF_NO_BEFORE=/^(위|아래|오른|왼|때|만한)/;'), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  const ctx={measureText:(t)=>({width:t.length*12})};
  // forced(믿으며) 바로 뒤가 '위에' — forced 가 이겨서 '위에'는 다음 줄 첫머리로 밀려도
  // 어차피 forced 지점 자체는 지켜지고, DP 는 항상 답을 찾는다(안전망으로 안 떨어진다)
  const raw='믿으며 위에 있는 것을 바라보라';
  [10,30,60,100].forEach(w=>{
    const lines=_vfWrapFit(raw.split(' '),ctx,w);
    // ⚠️ v26-0820-1 — 1-2-2(짧은 필수 줄 합치기)가 생기면서, 짧은 문장은
    // "믿으며"만 있던 첫 줄이 바로 다음 줄과 합쳐질 수 있다(그래도 순서는
    // 안 바뀐다). 그래서 정확히 '믿으며'인지가 아니라, 첫 줄이 '믿으며'로
    // 시작하는지(즉 forced 지점이 5번 규칙에 밀려 뒤로 안 넘어갔는지)를 본다.
    sc.eq(`maxW=${w}: forced('믿으며')가 첫 줄 맨 앞을 차지한다(5번에 안 밀린다)`,
          lines[0].startsWith('믿으며'), true);
  });
}

console.log('\n시나리오 3-5 — 1-2-2: 필수 줄바꿈으로 생긴 두 줄 합이 14자 이하면 도로 합친다 (v26-0820-1, HB 1-2-2)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  sc.eq('두 줄 합이 14자 이하면 합친다',
        JSON.stringify(_vfDemoteShortForced(['오늘 하였으니','감사하라'],['letter',''])),
        JSON.stringify(['오늘 하였으니 감사하라']));
  sc.eq('14자를 넘으면 그대로 둔다',
        JSON.stringify(_vfDemoteShortForced(['오늘 우리가 여기 모여서 하였으니','다함께 감사하며 찬양하라'],['letter',''])),
        JSON.stringify(['오늘 우리가 여기 모여서 하였으니','다함께 감사하며 찬양하라']));
  sc.eq('"헛되고"+"헛되며" 는 14자 이하여도 예외로 항상 나눈다(1-2-2-0)',
        JSON.stringify(_vfDemoteShortForced(['모든 것이 헛되고','헛되며'],['letter',''])),
        JSON.stringify(['모든 것이 헛되고','헛되며']));
  sc.eq('1-2(부사구)가 세운 줄은 14자 이하여도 되돌리지 않는다 — 1-2-2-1 은 1-1 전용',
        JSON.stringify(_vfDemoteShortForced(['은혜로 말미암아','우리가 받았다'],['phrase',''])),
        JSON.stringify(['은혜로 말미암아','우리가 받았다']));
  sc.eq('1-3(부사절)이 세운 줄도 되돌리지 않는다',
        JSON.stringify(_vfDemoteShortForced(['그가 말함으로','내가 들었다'],['clause',''])),
        JSON.stringify(['그가 말함으로','내가 들었다']));
  sc.eq('forced 로 끝난 줄이 아니면 손대지 않는다',
        JSON.stringify(_vfDemoteShortForced(['짧은 줄','짧은 줄2'],['',''])),
        JSON.stringify(['짧은 줄','짧은 줄2']));
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
    sc.eq(`maxW=${w}: '거스르고' 뒤에서 끊긴다(줄 경계에 있다)`,
          lines.some(l=>l.endsWith('거스르고')), true);
    sc.eq(`maxW=${w}: '거스르나니'(니) 뒤에서 끊긴다(줄 경계에 있다)`,
          lines.some(l=>l.endsWith('거스르나니')), true);
  });
}

console.log('\n시나리오 4-1 — 실사용 재신고 문장(고린도후서 5:1) — "영원한" 뒤에서 끊기지 않는다 (v26-0820-1)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfWrapFit[\s\S]*?\n\}\n/);
  eval(m[0]);
  const raw='만일 땅에 있는 우리의 장막 집이 무너지면 하나님께서 지으신 집 곧 손으로 지은 것이 아니요 하늘에 있는 영원한 집이 우리에게 있는 줄 아느니라';
  const words=raw.split(/\s+/);
  // ⚠️ v26-0820-2 — 예전 테스트는 글자폭 10 으로만 재서 통과했는데, 실제 화면
  //    (글자폭 16 근처)에서는 재현됐다. 폰트 크기가 커질수록 같은 폭에 덜 들어가니
  //    글자폭을 여러 값으로 훑어야 한다. 글자폭 16 이 HB 스크린샷과 같은 5줄이다.
  [12,14,15,16,17,18,20].forEach(cw=>{
    const ctx={measureText:(t)=>({width:[...t].reduce((a,c)=>a+(/\s/.test(c)?cw*0.4:cw),0)})};
    const lines=_vfWrapFit(words,ctx,360);
    sc.eq(`글자폭 ${cw}: '영원한' 뒤에서 끊기지 않는다(2-1)`,
          lines.some((l,i)=>i<lines.length-1&&l.endsWith('영원한')), false);
    // v26-0820-3 — "아느니라"가 혼자 남으면 안 된다(4-2-1 이 걸려야 한다)
    sc.eq(`글자폭 ${cw}: 마지막 줄에 1단어만 남지 않는다(4-2-1)`,
          lines[lines.length-1].split(' ').length===1, false);
  });
}

console.log('\n시나리오 5 — 글자 크기 축소 경계를 한 줄 더 관대하게 (v26-0819-10, HB)');
{
  // S2(forced)가 폭과 무관하게 끊다 보니 줄 수가 예전보다 쉽게 늘어, 여백이
  // 남는데도 글자가 작아지는 문제가 생겼다. 글자 크기를 줄이는 경계(maxLines)를
  // +1 해서 완화한다 — S2 자체의 위치·우선순위는 건드리지 않는다.
  const fn = slice('function _vfLayoutText(){', '\n  el.style.fontSize');
  sc.eq('maxLines 에 +1 이 붙었다',
        fn.includes("const maxLines=Math.max(1,Math.ceil(words.length/_VF_MINW))+1;"), true);
}

console.log('\n시나리오 6 — 4번(외톨이 보정)은 1·2·3·5번 하드 규칙에 지면 물러난다 (v26-0820-2, 실사용 재신고 원인)');
{
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  sc.eq('_vfCanBreakAt 로 자리 검사를 한다', SRC.includes('function _vfCanBreakAt(words,cls,p,hardNo){'), true);
  sc.eq('_vfFixWidow 가 words·cls·hardNo 를 넘겨받는다',
        SRC.includes('return _vfFixWidow(_vfDemoteShortForced(lines,lineForced),words,cls,hardNo);'), true);
  sc.eq('관형형을 주어에서 걸러내는 _vfIsSubject 가 있다', SRC.includes('function _vfIsSubject(w){'), true);
  sc.eq("'있는'은 주어가 아니다(관형형)", _vfIsSubject('있는'), false);
  sc.eq("'지은'도 주어가 아니다(관형형)", _vfIsSubject('지은'), false);
  sc.eq("'하나님께서'는 주어다", _vfIsSubject('하나님께서'), true);
  sc.eq("'너희는'은 주어다", _vfIsSubject('너희는'), true);
  sc.eq("'집이'는 주어다", _vfIsSubject('집이'), true);

  // 실제 재신고 상황 그대로.
  //  · 0820-2 — 4번이 "영원한"(2-1 금지) 뒤를 고르던 걸 막았다.
  //  · 0820-3 — 그런데 너무 넓게 막아서 4-2-1 이 고른 "집이" 뒤까지 막혔고,
  //    "아느니라"가 혼자 남았다. 이제 S2 규칙만 따지므로 제대로 4-2-1 이 걸린다.
  const wordsAll='하늘에 있는 영원한 집이 우리에게 있는 줄 아느니라'.split(' ');
  const cls=wordsAll.map((w,i)=>_vfBreakClass(w,wordsAll[i+1]));
  sc.eq('재신고 재현 — 2-1("영원한")은 피하고 4-2-1("집이" 뒤)은 제대로 적용한다',
        JSON.stringify(_vfFixWidow(['하늘에 있는 영원한 집이 우리에게 있는 줄','아느니라'],wordsAll,cls)),
        JSON.stringify(['하늘에 있는 영원한 집이','우리에게 있는 줄 아느니라']));
  sc.eq("옛 엔진의 금지(조사 '이/가')는 4번을 못 막는다 — S2 가 최상위",
        _vfCanBreakAt(wordsAll,cls,3), true);
  sc.eq("S2 2-1('영원한')은 4번을 막는다",
        _vfCanBreakAt(wordsAll,cls,2), false);
  // words·cls 를 안 넘기면 예전처럼(자리 검사 없이) 동작한다 — 4-2-1 예시는 그대로 통과
  sc.eq('4-2-1 예시는 여전히 정상 동작(자리 검사에 안 걸린다)',
        JSON.stringify(_vfFixWidow(['그리스도께서 우리를 자유롭게','하려고'])),
        JSON.stringify(['그리스도께서','우리를 자유롭게 하려고']));
  sc.eq('4-1 합치기도 1-2-2-0("헛되고 헛되며") 예외를 지킨다',
        JSON.stringify(_vfFixWidow(['헛되고','헛되며'])),
        JSON.stringify(['헛되고','헛되며']));
}

console.log('\n시나리오 7 — 6번(신규): 부사구가 공백 제외 10자 이상이면 그 뒤에서 끊는다 (v26-0820-2, HB 6)');
{
  sc.eq('_VF_ADV_END 종료 표현 목록', SRC.includes('const _VF_ADV_END=/(안에서는|안에서|'), true);
  sc.eq('기준 글자수 10', SRC.includes('const _VF_ADV_MIN=10;'), true);
  sc.eq('cls 계산 뒤에 1-2 를 덮어쓴다', SRC.includes('_vfApplyAdvRule(words,cls,fk);'), true);
  sc.eq('1-3(부사절)도 이어서 적용한다', SRC.includes('_vfApplyClauseRule(words,cls,fk);'), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  const ctx={measureText:(t)=>({width:t.length*14})};
  const run=(raw,maxW)=>_vfWrapFit(raw.split(' '),ctx,maxW||360);
  // HB 예시 그대로
  sc.eq('6 예시 — 그리스도 예수 안에서는(10자) 뒤에서 끊는다',
        JSON.stringify(run('그리스도 예수 안에서는 할례나 무할례나')),
        JSON.stringify(['그리스도 예수 안에서는','할례나 무할례나']));
  sc.eq('6-2 예시 — 그의 풍성한 은혜로 말미암아(11자) 뒤에서 끊는다',
        JSON.stringify(run('그의 풍성한 은혜로 말미암아 우리가 구속을 받았으니')),
        JSON.stringify(['그의 풍성한 은혜로 말미암아','우리가 구속을 받았으니']));
  sc.eq('6-3 예시 — 주어(내가)는 부사구 글자수에서 빼되, 주어만 따로 떼지는 않는다',
        JSON.stringify(run('내가 그리스도 예수 안에서는 자유함을 얻었으니')),
        JSON.stringify(['내가 그리스도 예수 안에서는','자유함을 얻었으니']));
  // 10자 미만이면 6번이 안 걸린다
  sc.eq('10자 미만 부사구("주 안에서" 4자)는 강제로 안 끊는다',
        JSON.stringify(run('주 안에서 항상 기뻐하라')),
        JSON.stringify(['주 안에서 항상 기뻐하라']));
  // 폭과 무관하게 항상 같은 자리(하드 규칙이므로)
  // 1-2 가 요구하는 건 "부사구 **뒤**에서 끊는다" 하나다. 폭이 아주 좁으면 부사구
  // 안이 갈라질 수는 있지만(폭을 넘겨 브라우저에 맡기는 것보다 낫다), '말미암아'가
  // 줄 끝에 온다는 것만은 폭과 무관하게 항상 지켜져야 한다.
  [200,300,400,700,1200].forEach(w=>{
    const ls=run('그의 풍성한 은혜로 말미암아 우리가 구속을 받았으니',w);
    sc.eq(`maxW=${w}: 1-2 — '말미암아'가 줄 끝에 온다(폭과 무관)`,
          ls.some((l,i)=>i<ls.length-1&&l.endsWith('말미암아')), true);
  });
  // 넉넉한 폭에서는 부사구가 통째로 첫 줄이 된다
  sc.eq('넉넉한 폭에서는 부사구가 통째로 한 줄',
        run('그의 풍성한 은혜로 말미암아 우리가 구속을 받았으니',400)[0], '그의 풍성한 은혜로 말미암아');
}

console.log('\n시나리오 8 — 1-3(신규): 자체 주어를 가진 부사절(10자 이상)은 통째로 묶는다 (v26-0820-4, HB 1-3)');
{
  sc.eq('_VF_CLAUSE_END 종료 표현(함으로·으므로·므로)',
        SRC.includes('const _VF_CLAUSE_END=/(함으로|으므로|므로)$/;'), true);
  sc.eq('기준 글자수 10', SRC.includes('const _VF_CLAUSE_MIN=10;'), true);
  sc.eq('자체 주어가 없으면 대상이 아니다(-1 반환)', SRC.includes('if(!seen)return -1;'), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  // HB 예시 그대로 — "이 둘이 서로 대적함으로"(10자)는 갈라지지 않고, 그 뒤에서 끊긴다
  const raw='육체의 소욕은 성령을 거스르고 성령은 육체를 거스르나니 이 둘이 서로 대적함으로 너희가 원하는 것을 하지 못하게 하려 함이니라';
  const words=raw.split(' ');
  [12,14,16,18,20].forEach(cw=>{
    const ctx={measureText:t=>({width:[...t].reduce((a,c)=>a+(/\s/.test(c)?cw*0.4:cw),0)})};
    const lines=_vfWrapFit(words,ctx,360);
    sc.eq(`글자폭 ${cw}: "이 둘이 서로 대적함으로"가 한 줄에 통째로 있다`,
          lines.some(l=>l.includes('이 둘이 서로 대적함으로')), true);
    sc.eq(`글자폭 ${cw}: 그 부사절 뒤에서 끊긴다`,
          lines.some((l,i)=>i<lines.length-1&&l.endsWith('대적함으로')), true);
  });
  // 주어를 꾸미는 관형어('이')까지 끌어와야 10자가 된다 — 그게 HB 예시의 핵심
  sc.eq('주어 앞 관형어까지 포함해서 센다', SRC.includes('_VF_NOEND_WORD.test(words[s-1])||/의$/.test(words[s-1])'), true);
  // 자체 주어가 없으면 1-3 이 아니다 (10자가 넘어도 강제하지 않는다)
  {
    const ctx={measureText:t=>({width:t.length*14})};
    const ls=_vfWrapFit('사랑하고 섬기며 수고하므로 상을 받으리라'.split(' '),ctx,400);
    sc.eq('자체 주어가 없으면 1-3 을 적용하지 않는다',
          ls.some((l,i)=>i<ls.length-1&&l.endsWith('수고하므로')), false);
  }
}

console.log('\n시나리오 9 — 1-4(신규): 긴 목적어구(7자 이상) 뒤에서 끊는다 (v26-0820-5, HB 1-4)');
{
  sc.eq('_VF_OBJ_END 목적격 조사(을/를)', SRC.includes('const _VF_OBJ_END=/(을|를)$/;'), true);
  sc.eq('목적어구 최소 7자', SRC.includes('const _VF_OBJ_MIN=7;'), true);
  sc.eq('서술부 최소 3단어', SRC.includes('const _VF_OBJ_TAIL_MIN=3;'), true);
  sc.eq('1-4 를 1-3 보다 먼저 적용한다', SRC.indexOf('_vfApplyObjRule(words,cls,fk);') < SRC.indexOf('_vfApplyClauseRule(words,cls,fk);'), true);
  const m = SRC.match(/const _VF_MINW[\s\S]*?function _vfFixWidow[\s\S]*?\n}\n/);
  eval(m[0]);
  const ctx=cw=>({measureText:t=>({width:[...t].reduce((a,c)=>a+(/\s/.test(c)?cw*0.4:cw),0)})});
  // HB 예시 그대로
  sc.eq('1-4 예시 — 너희가 원하는 것을 / 하지 못하게 하려 함이니라',
        JSON.stringify(_vfWrapFit('너희가 원하는 것을 하지 못하게 하려 함이니라'.split(' '),ctx(14),400)),
        JSON.stringify(['너희가 원하는 것을','하지 못하게 하려 함이니라']));
  // 1-4-1 — 을/를 붙은 낱말만이 아니라 앞의 관형어·주어까지 묶어서 센다
  //   ('것을' 만 보면 2자라 7자에 못 미친다 — 묶어야 8자가 된다)
  sc.eq('1-4-1 — 주어·관형어까지 묶어서 세지 않으면 걸리지 않는다',
        SRC.includes('function _vfObjStart(words,cls,i){'), true);
  // 목적어구가 짧으면 안 걸린다
  sc.eq("짧은 목적어구('구원을' 3자)는 1-4 대상이 아니다",
        JSON.stringify(_vfWrapFit('구원을 얻게 하려 함이니라'.split(' '),ctx(14),400)),
        JSON.stringify(['구원을 얻게 하려 함이니라']));
  // 서술부가 3단어 미만이면 안 걸린다
  sc.eq('서술부가 3단어 미만이면 1-4 를 적용하지 않는다',
        JSON.stringify(_vfWrapFit('너희가 원하는 것을 주시리라'.split(' '),ctx(14),400)),
        JSON.stringify(['너희가 원하는 것을 주시리라']));
  // ⚠️ 서술부는 문장 끝이 아니라 **그 절 끝까지** 센다.
  //    안 그러면 "육체의 소욕은 성령을 / 거스르고" 처럼 서술부가 한 단어뿐인데도
  //    뒤 절의 단어까지 세어져 1-4 가 잘못 걸린다.
  sc.eq('서술부는 절 끝까지만 센다(_vfObjTailLen)', SRC.includes('function _vfObjTailLen(cls,i,n){'), true);
  const raw='육체의 소욕은 성령을 거스르고 성령은 육체를 거스르나니 이 둘이 서로 대적함으로 너희가 원하는 것을 하지 못하게 하려 함이니라';
  [12,14,16,18,20].forEach(cw=>{
    const ls=_vfWrapFit(raw.split(' '),ctx(cw),360);
    sc.eq(`글자폭 ${cw}: "성령을" 뒤에서는 끊지 않는다(서술부가 '거스르고' 한 단어뿐)`,
          ls.some((l,i)=>i<ls.length-1&&l.endsWith('성령을')), false);
    sc.eq(`글자폭 ${cw}: "너희가 원하는 것을" 뒤에서는 끊는다`,
          ls.some((l,i)=>i<ls.length-1&&l.endsWith('너희가 원하는 것을')), true);
  });
}

sc.done();
