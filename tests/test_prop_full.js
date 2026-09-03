// 명제 전체화면 (v26-0831-3)
//
// 명제집은 암송 말씀과 **같은 화면**을 쓰되 세 가지가 다르다:
//   ① 대표 문구가 화면 위쪽 **타이틀**로 선다 (자리는 좌·중앙·우 무작위)
//   ② 명제 본문은 산문이라 **좌정렬 + 자연스러운 줄바꿈**이다
//   ③ 강조 칠하기를 **끈다** — 대표 문구는 본문 안의 구절이 아니라 제목이라
//      본문에서 찾을 것이 없다 (우연히 걸리면 엉뚱한 자리가 칠해진다)
//
// ⚠️ 여기서 지키려는 것은 "명제가 달라진다"가 아니라 **"말씀은 안 달라진다"**
//    이기도 하다. 갈림길이 하나라도 새면 암송 말씀 화면이 함께 바뀐다.
const { SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 명제인지 판정하는 곳은 한 곳뿐');
{
  // pid 가 명제의 신분증이다 (kind 는 pid 에서 파생된다 — test_share_prop 참고).
  sc.eq('판정 함수가 있다',
        SRC_DEV.includes("function _vfIsProp(v){return !!(v&&(v.pid||v.kind==='prop'));}"), true);
  // 화면 곳곳이 각자 판정하면 한쪽만 고쳐져 어긋난다 → 전부 이 함수를 지난다
  const uses = (SRC_DEV.match(/_vfIsProp\(/g) || []).length;
  sc.eq('여러 곳이 그 함수를 쓴다', uses >= 4, true);
  sc.eq('kind 를 직접 비교하는 갈림길은 없다',
        /\bv\.kind==='prop'\s*\?/.test(SRC_DEV), false);
}

console.log('\n시나리오 2 — 타이틀 자리·기울기는 넘길 때 한 번만 뽑는다');
{
  // ⚠️ 그리는 쪽에서 뽑으면 다시 그릴 때(글자 크기 변경·회전·화면 회전)마다
  //    자리가 튀어 어지럽다. 뽑는 곳은 _vfRollProp() 하나뿐이어야 한다.
  sc.eq('뽑는 함수가 있다', SRC_DEV.includes('function _vfRollProp(){'), true);
  sc.eq('넘길 때마다 부른다',
        /function _vfRollVariant\(\)\{[\s\S]{0,400}_vfRollProp\(\);/.test(SRC_DEV), true);
  // ⚠️ v26-0901-4, HB 정정 — "모든 경우에 중앙 정렬하라는 것이 아니라, 30자가
  //    넘어서 줄을 가르는 그 경우에만. 다른 경우는 좌정렬 랜덤 살려놔."
  sc.eq('좌·중앙 둘 중에서 뽑는다',
        SRC_DEV.includes("const _VF_PT_ALIGN=['al-l','al-c'];"), true);
  sc.eq('우정렬은 안 뽑는다', /_VF_PT_ALIGN=\[[^\]]*'al-r'/.test(SRC_DEV), false);
  // ⚠️ v26-0901-6, HB — "1번 규칙 적용 안 되고 있어." 규칙의 주어는 **본문**이다.
  //    (‘기존 기본 줄바꿈 규칙’은 본문 엔진이고, 2번이 본문 줄 수를 말한다)
  //    가운데로 세울지는 **본문이 몇 줄이 되는가**로 정한다 — 한 곳(_vfPropMid).
  sc.eq('판정이 한 곳에', SRC_DEV.includes('let _vfPropMid=false;'), true);
  sc.eq('대표 문구 길이로 정하던 옛 길은 없앴다', SRC_DEV.includes('_vfPropWide='), false);
  sc.eq('본문이 한 줄이면 가운데',
        SRC_DEV.includes('_vfPropMid=(lines.length<=1);'), true);
  sc.eq('자리는 한 함수가 붙인다', SRC_DEV.includes('function _vfApplyPropAlign(){'), true);
  // ⚠️ 본문을 앉혀 봐야 몇 줄인지 안다 → 앉힌 **뒤에** 자리를 붙인다
  sc.eq('본문을 앉힌 뒤에 붙인다',
        /_vfLayoutPropText\(el,raw,availW,availH\);[\s\S]{0,1400}_vfApplyPropAlign\(\);/.test(SRC_DEV), true);
  // 그리는 함수 안에서 다시 뽑지 않는다
  const draw = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle('),
                             SRC_DEV.indexOf('function _vfPropInk('));
  sc.eq('그릴 때는 다시 안 뽑는다', draw.includes('_vfRollProp('), false);
  sc.eq('뽑아 둔 자리를 쓴다', draw.includes('_vfPropAlign'), true);
  // 세 자리 CSS 가 다 있다
  ['al-l','al-c'].forEach(k=>{
    sc.eq(k+' 자리 CSS', SRC_DEV.includes('.vf-ptitle.'+k+'{'), true);
  });
}

console.log('\n시나리오 3 — 명제 본문은 좌정렬 · 자연스러운 줄바꿈');
{
  sc.eq('명제일 때만 prop 클래스',
        SRC_DEV.includes("text.classList.toggle('prop',_vfIsProp(v));"), true);
  // v26-0901-4, HB — 명제 본문은 좌정렬로 되돌리고, **줄을 가른 명제만** 가운데
  sc.eq('좌정렬 CSS', SRC_DEV.includes('#vfText.prop{text-align:left;}'), true);
  sc.eq('넓으면 가운데 CSS', SRC_DEV.includes('#vfText.prop.prop-mid{text-align:center;}'), true);
  sc.eq('본문도 같은 판정을 쓴다',
        SRC_DEV.includes("tx.classList.toggle('prop-mid',tx.classList.contains('prop')&&_vfPropMid);"), true);
  // ⚠️ 공유 이미지도 그 자리를 따라야 한다 (늘 가운데로 찍으면 이미지만 어긋난다)
  sc.eq('이미지도 자리를 따른다',
        SRC_DEV.includes("const pal=cs.textAlign==='left'?'left':'center';"), true);
  // ⚠️ 말씀의 줄바꿈(_vfWrapFit)은 짧은 구절을 의미 단위로 끊기 위한 것이다.
  //    산문에 씌우면 낱말 하나가 혼자 한 줄에 남는다 → 명제는 그 앞에서 갈린다.
  sc.eq('명제는 말씀 줄바꿈을 안 쓴다',
        /if\(el\.classList\.contains\('prop'\)\)\{[\s\S]{0,200}_vfLayoutPropText\(/.test(SRC_DEV), true);
  const idxBranch = SRC_DEV.indexOf("if(el.classList.contains('prop')){");
  const idxWrap = SRC_DEV.indexOf('_vfWrapFit(words,ctx,availW)');
  sc.eq('갈림길이 줄바꿈보다 앞에 있다', idxBranch > 0 && idxBranch < idxWrap, true);
  sc.eq('산문 줄간격을 따로 둔다', SRC_DEV.includes('const _VF_PROP_LH=1.62;'), true);
}

console.log('\n시나리오 3-1 — 명제 전체화면 롱홀드 메뉴');
{
  sc.eq('명제는 좋아요·저장·공유만 남긴다',
        SRC_DEV.includes("const keep=el.id==='verseMemLikeItem'||el.id==='verseMemKeepItem'||el.id==='verseMemShareItem';"), true);
  sc.eq('저장은 현재 명제를 목록 고르기로 보낸다',
        SRC_DEV.includes("id=\"verseMemKeepItem\" style=\"display:none\" onclick=\"closeVerseMemMenu();openKeepPicker(_reactKey(_vfCurrentVerse()))\""), true);
  sc.eq('공유 메뉴도 종이비행기',
        /id="verseMemShareItem"[\s\S]{0,500}M22 2 11 13[\s\S]{0,100}M22 2 15 22 11 13 2 9 22 2Z/.test(SRC_DEV), true);
}

console.log('\n시나리오 3-2 — 본문 줄바꿈 규칙 (v26-0901-6, HB)');
{
  // HB 규칙 — "두 줄 이하로 줄이 형성 되는데, 첫줄에 글자수가 스페이스 제외
  //   30자가 넘으면, 기존 기본 줄바꿈 규칙에서 가장 점수 높은 곳에서 1회
  //   줄바꿈. 그 뒤 한 줄이 또 30자를 넘거나 두 줄 차이가 10자를 넘으면
  //   긴 줄을 또 1회." + "본문이 1줄로 끝나면 대표문구와 본문 모두 중앙정렬."
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _vfLayoutPropText('),
                           SRC_DEV.indexOf('function _vfApplyPropAlign('));
  // ⚠️⚠️ 30자를 세는 자리는 **화면에 실제로 그려진 첫 줄**이다 (HB 확인 26-0901).
  //   HB 는 **PC 풀스크린**을 보며 이 규칙을 만들었다 — 넓은 화면은 한 줄에
  //   마흔 자 넘게 들어가서 줄이 길어지면 읽기 힘들다.
  //   ⚠️ 폰에서는 한 줄에 열일곱 자쯤이라 **안 걸리는 것이 정상**이다.
  //      (v26-0901-6 에 '본문 전체 글자수'로 바꿨다가 폰에서 서른 자 남짓한
  //       명제까지 억지로 갈라 되돌렸다)
  sc.eq('그려진 첫 줄로 잰다', fn.includes("_ptLen(lines[0]||'')>_PT_LINE_MAX"), true);
  sc.eq('본문 전체로 재지 않는다', fn.includes('_ptLen(raw)>_PT_LINE_MAX'), false);
  // '두 줄 이하' 는 조건 — 저절로 길게 흐르는 명제는 안 건드린다
  sc.eq('두 줄 이하일 때만', fn.includes('lines.length<=2&&'), true);
  // 가르는 규칙은 **한 벌**만 쓴다 (대표 문구와 같은 함수·같은 점수표)
  sc.eq('같은 가르개를 쓴다', fn.includes('const cut=_ptWrapTitle(raw);'), true);
  // 줄이 하나 늘면 예전 크기로는 넘칠 수 있다 → 크기를 다시 고른다
  sc.eq('가른 뒤 크기를 다시 고른다',
        /el\.innerHTML=cut\.map\(esc\)\.join\('<br>'\);\s*\n\s*fit\(\);/.test(fn), true);
  // 공유 이미지는 이 줄 배열을 그대로 그린다 — 우리가 정한 줄이 곧 그 줄이다
  sc.eq('가른 줄을 그대로 싣는다', fn.includes('lines=cut;'), true);
  // 2번 규칙
  sc.eq('한 줄이면 가운데', fn.includes('_vfPropMid=(lines.length<=1);'), true);
  sc.eq('가른 명제도 가운데', /if\(cut\.length>1\)\{[\s\S]{0,300}_vfPropMid=true;/.test(fn), true);
}

console.log('\n시나리오 4 — 강조는 명제에서 끈다 (말씀은 그대로)');
{
  sc.eq('명제면 빈 값을 싣는다',
        SRC_DEV.includes("text.setAttribute('data-hi',_vfIsProp(v)?'':(v.hi||''));"), true);
  // 말씀 쪽 길이 살아 있는지 — 이게 깨지면 암송 말씀의 강조가 통째로 사라진다
  sc.eq('말씀은 예전처럼 hi 를 싣는다',
        SRC_DEV.includes("_vfIsProp(v)?'':(v.hi||'')"), true);
  sc.eq('본문 그리는 입구는 그대로',
        SRC_DEV.includes('el.innerHTML=_hiHTML(el,pick.lines);'), true);
}

console.log('\n시나리오 5 — 타이틀이 본문보다 작아지지 않는다');
{
  // ⚠️ 처음엔 글자 수만 보고 크기를 정했더니 대표 문구가 길 때 본문보다
  //    작아져 위계가 뒤집혔다 (실측: 타이틀 17px, 본문 19px).
  //    이제 **본문이 쓸 수 있는 가장 큰 크기**에 배수를 곱한다.
  // v26-0902-13 — 크기 잡는 일은 _vfSizePropTitle 로 떨어져 나갔다
  //   (본문을 앉힌 **뒤에** 줄 수를 알고 다시 잡아야 하기 때문이다)
  const draw = SRC_DEV.slice(SRC_DEV.indexOf('function _vfSizePropTitle('),
                             SRC_DEV.indexOf('function _vfRenderPropTitle('));
  sc.eq('본문 최대 크기를 기준으로 잡는다', draw.includes('bodyMax'), true);
  // 배수는 전부 1 이상이어야 한다 (하나라도 1 미만이면 뒤집힐 수 있다)
  const m = draw.match(/const k=([^;]+);/);
  sc.eq('배수 식을 찾았다', !!m, true);
  if (m) {
    const ks = (m[1].match(/\d+\.\d+/g) || []).map(Number);
    sc.eq('배수가 다섯 단계', ks.length, 5);
    sc.eq('전부 1 이상', ks.every(k => k >= 1), true);
    sc.eq('짧을수록 크다', ks.join(',') === [...ks].sort((a,b)=>b-a).join(','), true);
  }
}

console.log('\n시나리오 5-2 — 타이틀 크기는 본문 줄 수를 따라간다 (v26-0902-13, HB)');
{
  // HB — "지금 잡은 기준이 본문이 3줄일 때 기준 같아. 한 줄 줄 때마다 일정 %로
  //       줄이고, 한 줄 늘 때마다 늘리자. 7% 어때?"
  sc.eq('기준은 세 줄', SRC_DEV.includes('const _PT_LINE_BASE=3;'), true);
  sc.eq('줄어들 때는 한 줄에 7%', SRC_DEV.includes('const _PT_LINE_STEP=0.07;'), true);
  sc.eq('줄어들 때는 곱해 내려간다',
        SRC_DEV.includes('k=Math.pow(1+_PT_LINE_STEP,L-_PT_LINE_BASE);'), true);
  // v26-0902-14, HB — "늘어날 때는 %를 점점 줄여라" (7 · 6 · 5 · 4 …)
  //   ⚠️ 같은 7%를 계속 곱하면 줄이 많은 명제에서 타이틀이 본문을 밀어낸다.
  sc.eq('늘어날 때는 몫이 줄어든다',
        SRC_DEV.includes('const _PT_LINE_UP=[0.07,0.057,0.044,0.031,0.018,0.005];'), true);
  sc.eq('한 단씩 꺼내 곱한다',
        SRC_DEV.includes('for(let i=0;i<L-_PT_LINE_BASE;i++)k*=1+(_PT_LINE_UP[i]||0);'), true);
  // ⚠️⚠️ 묶지 않으면 되먹임이 생긴다 — 타이틀이 커지면 본문 높이가 줄어 줄이
  //    또 늘고, 그러면 타이틀이 또 커진다. (이제는 표가 먼저 0 이 되어 멎는다)
  sc.eq('위아래로 묶는다',
        SRC_DEV.includes('return Math.max(0.85,Math.min(1.35,k));'), true);
  // 그리는 차례상 타이틀이 먼저다 → 본문을 앉힌 **뒤** 다시 잡는다
  sc.eq('크기를 잡는 함수가 따로 있다', SRC_DEV.includes('function _vfSizePropTitle(n){'), true);
  sc.eq('처음엔 기준으로 잡는다', SRC_DEV.includes('_vfSizePropTitle(_PT_LINE_BASE);'), true);
  sc.eq('앉힌 뒤 줄 수로 다시 잡는다',
        SRC_DEV.includes("if(_vfSizePropTitle((el._lines||[]).length)){"), true);
  // ⚠️ 다시 앉히는 것은 **한 번만** — 되풀이하면 오락가락한다
  const br = SRC_DEV.slice(SRC_DEV.indexOf("if(el.classList.contains('prop')){"),
                           SRC_DEV.indexOf('_vfApplyPropAlign();'));
  sc.eq('본문을 두 번까지만 앉힌다', (br.match(/_vfLayoutPropText\(/g)||[]).length, 2);
  // 바뀌지 않았으면 다시 앉히지 않는다 (헛일을 안 한다)
  // 바뀌지 않았으면 다시 앉히지 않는다 (헛일을 안 한다)
  sc.eq('안 바뀌면 그대로', SRC_DEV.includes('if(px===was)return false;'), true);
  sc.eq('바꾸기 전 크기를 기억한다',
        SRC_DEV.includes('const was=Math.round(parseFloat(el.style.fontSize)||0);'), true);
}

console.log('\n시나리오 6 — 타이틀이 차지하는 자리를 본문 계산이 안다');
{
  // ⚠️ 빼지 않으면 긴 명제가 화면 밖으로 밀린다
  sc.eq('타이틀 높이를 잰다',
        SRC_DEV.includes("const ptEl=document.getElementById('vfPTitle');"), true);
  sc.eq('여백까지 함께 센다',
        SRC_DEV.includes("ptH=ptEl.offsetHeight+(parseFloat(pcs.marginBottom)||0);"), true);
  sc.eq('쓸 수 있는 높이에서 뺀다',
        SRC_DEV.includes('const availH=Math.max(60,inner.clientHeight-padV-refH-ptH-6);'), true);
  // 태그 그림도 타이틀을 피해야 한다 (본문 기준으로 잡으면 타이틀 위에 겹친다)
  sc.eq('태그 그림이 타이틀을 기준으로 잡는다',
        SRC_DEV.includes("const anchor=(pt&&pt.classList.contains('on')&&pt.offsetHeight)?pt:tx;"), true);
}

console.log('\n시나리오 7 — 손으로 그은 획은 앱의 붓을 그대로 쓴다');
{
  // ⚠️ _hiWavePoly 는 **점 배열**을 준다 (path 문자열이 아니다). 앱의 물결
  //    덮개(_hiOverlay 의 put)와 같은 방식으로 이어야 같은 그림이 된다.
  //    한때 반환값을 그대로 d 속성에 넣어 **아무것도 안 그려졌다.**
  sc.eq('앱의 붓을 쓴다', SRC_DEV.includes('_hiWavePoly(lw,fs*0.92,_vfPropSeed)'), true);
  sc.eq('점 배열을 path 로 잇는다',
        SRC_DEV.includes("'M'+pts.map(q=>(q.x+x).toFixed(2)+' '+(q.y+y).toFixed(2)).join('L')+'Z'"), true);
  sc.eq('빈 배열이면 조용히 나간다', SRC_DEV.includes('if(!pts||!pts.length)return;'), true);
  // 세로 자리도 앱이 이미 정해 둔 값을 쓴다 (제 값을 지어내지 않는다)
  sc.eq('앱의 물결 위치를 쓴다',
        SRC_DEV.includes('last.height*HI_POS.wave'), true);
  // ⚠️ 획은 자리를 차지하면 안 된다 — 차지하면 문구가 밀려난다
  sc.eq('획은 자리를 차지하지 않는다',
        /\.vf-ptitle \.pt-ink\{position:absolute;/.test(SRC_DEV), true);
  sc.eq('마지막 줄에만 긋는다', SRC_DEV.includes('const last=rects[rects.length-1];'), true);
}

// ═══ 8. 말씀 모음 목록에서 명제집을 알아본다 (v26-0831-4) ═══
console.log('\n시나리오 8 — 목록의 명제집 표시');
{
  // ⚠️ 명제집은 **따로 저장하는 표시를 만들지 않는다.** 새 항목을 만들면
  //    병합·백업 다섯 곳에 등록해야 하고 그만큼 잃을 자리가 는다 (26-0831 사고).
  //    들어 있는 것을 보고 그때그때 판단하면 저장 구조가 한 글자도 안 바뀐다.
  sc.eq('판정 함수가 있다', SRC_DEV.includes('function _collIsProp(c){'), true);
  sc.eq('저장하는 표시를 새로 만들지 않았다',
        /c\.isProp|coll\.isProp|kind:'propcoll'/.test(SRC_DEV), false);

  // 실제로 돌려 본다
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _collIsProp(c){'),
                           SRC_DEV.indexOf('let _collLpTimer='));
  const _collIsProp = new Function('c', fn.replace(/^function _collIsProp\(c\)\{/, '').replace(/\}\s*$/, ''));
  sc.eq('명제가 있으면 명제집',
        _collIsProp({verses:[{pid:'P0001',kind:'prop'}]}), true);
  sc.eq('말씀만 있으면 아니다',
        _collIsProp({verses:[{ref:'요한복음 1:1'}]}), false);
  sc.eq('빈 모음은 아니다', _collIsProp({verses:[]}), false);
  sc.eq('모음이 없어도 안전', _collIsProp(null), false);
  sc.eq('verses 가 없어도 안전', _collIsProp({}), false);
  // ⚠️ 지운(휴지통) 명제만 남았으면 명제집이 아니다 — 표시가 유령처럼 남는다
  sc.eq('지운 명제만 있으면 아니다',
        _collIsProp({verses:[{pid:'P1',kind:'prop',del:'simple'}]}), false);
  sc.eq('섞여 있으면 명제집',
        _collIsProp({verses:[{ref:'요 1:1'},{pid:'P1',kind:'prop'}]}), true);

  // UI 원칙 — 테두리·박스 금지, 글자만
  sc.eq('표시 CSS 가 있다', SRC_DEV.includes('.coll-propmark{'), true);
  const css = SRC_DEV.slice(SRC_DEV.indexOf('.coll-propmark{'),
                            SRC_DEV.indexOf('}', SRC_DEV.indexOf('.coll-propmark{')));
  sc.eq('테두리를 두르지 않는다', /border:/.test(css), false);
  sc.eq('박스를 만들지 않는다', /background:/.test(css), false);
  sc.eq('목록이 그 판정을 쓴다',
        SRC_DEV.includes("mkBtn(c.id,c.name||'말씀 모음',true,_collIsProp(c))"), true);
}

// ═══ 9. 대표 문구 글씨체 (v26-0831-5, HB — "붓 느낌이 없는데?") ═══
console.log('\n시나리오 9 — 손글씨(붓) 글씨체');
{
  // ⚠️ 한글 완본은 수 MB다. 늘 받으면 첫 화면이 느려진다 →
  //    **명제를 볼 때만** 받는다 (고운바탕 _vfEnsureFont 와 같은 방식).
  sc.eq('늘 받지는 않는다',
        /@import[^;]*Nanum\+Brush/.test(SRC_DEV), false);
  sc.eq('볼 때 받는 함수가 있다', SRC_DEV.includes('function _ptEnsureFont(text,quiet){'), true);
  sc.eq('그릴 때 부른다',
        /function _vfRenderPropTitle\(v\)\{[\s\S]{0,600}_ptEnsureFont\(t\);/.test(SRC_DEV), true);

  // 지금 글씨체(본문과 같은 것)는 없애지 않고 보관한다 (HB 지시)
  sc.eq('예전 글씨체를 보관한다', SRC_DEV.includes('.vf-ptitle.pf-plain{'), true);
  sc.eq('붓', SRC_DEV.includes(".vf-ptitle.pf-brush{font-family:'Nanum Brush Script'"), true);
  // v26-0901-5, HB — 펜은 뺐고("너무 가볍다") 붓과 섞어 쓸 셋을 더했다
  sc.eq('펜은 뺐다', SRC_DEV.includes(".vf-ptitle.pf-pen{"), false);
  sc.eq('동해독도', SRC_DEV.includes(".vf-ptitle.pf-dokdo{font-family:'East Sea Dokdo'"), true);
  sc.eq('연성', SRC_DEV.includes(".vf-ptitle.pf-yeon{font-family:'Yeon Sung'"), true);
  sc.eq('송명', SRC_DEV.includes(".vf-ptitle.pf-song{font-family:'Song Myung'"), true);
  sc.eq('처음 쓰는 사람은 붓 하나', SRC_DEV.includes("propTitleFonts:['brush']"), true);

  // ⚠️ 손글씨체는 크게 흘려 써서 배율을 크게 준다. 그런데 **글씨체를 못 받으면**
  //    (사내망·오프라인) 그 배율이 본문 글씨체에 그대로 걸려 타이틀만 우스꽝스럽게
  //    커진다 → 실제로 받아졌는지 재 보고, 아니면 본문 글씨체로 되돌린다.
  sc.eq('받아졌는지 재 본다', SRC_DEV.includes('function _ptFontLoaded(fam,text){'), true);
  sc.eq('폭을 재서 판단한다', SRC_DEV.includes("c.font=\"72px '\"+fam+\"', monospace\";"), true);
  // 글씨체 이름은 한 표(_PT_FACES)에서만 정한다 — 늘리기 쉽고 어긋날 자리가 없다.
  // 나머지(_PT_FAMS·_PT_FONTS·설정창 단추·미리 받아 두기)가 전부 그 표에서 나온다.
  sc.eq('글씨체 표가 한 곳', SRC_DEV.includes('const _PT_FACES=['), true);
  sc.eq('이름표는 그 표에서 만든다',
        SRC_DEV.includes("const _PT_FAMS=(function(){const m={};_PT_FACES.forEach(f=>{m[f.k]=f.fam;});return m;})();"), true);
  // ⚠️ v26-0901-9 — 저장소에 직접 올린 것(self)은 구글 주소에 넣지 않는다
  sc.eq('글꼴 주소도 그 표에서',
        SRC_DEV.includes("_PT_FACES.filter(f=>!f.self).map(f=>'family='+f.fam.replace(/ /g,'+')).join('&')"), true);
  // v26-0831-18 — **못 받은 것이 확실할 때만** 되돌린다. 오는 중에 되돌리면
  //   명조가 0.몇 초 보였다가 붓으로 바뀌어 깜빡인다 (HB 신고, 시나리오 12).
  // v26-0901-4 — **포기하기 전에는** 되돌리지 않는다 (HB: "계속 기본폰트야")
  sc.eq('포기하기 전엔 안 되돌린다',
        SRC_DEV.includes("if(fam&&!_ptFontLoaded(fam,t)&&!_ptStillTrying(fam,t))pf='plain';"), true);
  sc.eq('아직 애쓰는 중인지 가리는 자', SRC_DEV.includes('function _ptStillTrying(fam,text){'), true);
  sc.eq('받을 기회가 남았으면 손글씨 그대로',
        SRC_DEV.includes('return _ptFontPending(fam,text)||(_ptTries[fam]||0)<_PT_TRY_MAX;'), true);
  // 배율은 CSS 한 곳에서만 정한다 (글씨체를 더할 때 JS 를 안 고치게)
  sc.eq('배율을 CSS 에서 읽는다',
        SRC_DEV.includes("getComputedStyle(el).getPropertyValue('--pt-k')"), true);
}

// ═══ 10. 공유 이미지가 화면과 같은 줄로 그린다 (v26-0831-5) ═══
console.log('\n시나리오 10 — 공유 이미지 줄 배열');
{
  // ⚠️ v26-0831-3 에 명제 본문의 줄 배열을 **비워 뒀다.** 공유 이미지는
  //    줄 배열이 없으면 글 전체를 **한 줄로** 그려 좌우로 넘친다 (HB 신고).
  sc.eq('명제도 줄 배열을 채운다',
        SRC_DEV.includes('let lines=_vfReadWrappedLines(el);')
        && SRC_DEV.includes('el._lines=lines;'), true);
  sc.eq('비워 두지 않는다', SRC_DEV.includes('el._lines=null;'), false);
  sc.eq('접힌 줄을 읽는 함수가 있다',
        SRC_DEV.includes('function _vfReadWrappedLines(el){'), true);
  // 브라우저가 접은 자리를 Range 로 읽는다 (줄바꿈 규칙을 흉내내지 않는다)
  sc.eq('Range 로 읽는다', SRC_DEV.includes('const rg=document.createRange();'), true);
  sc.eq('윗변이 바뀌는 자리가 줄이 바뀐 자리',
        SRC_DEV.includes('if(prevTop!==null&&top!==prevTop){'), true);
  // 못 읽어도 글이 사라지면 안 된다
  sc.eq('실패해도 본문은 살린다', SRC_DEV.includes('catch(e){return[raw];}'), true);
  sc.eq('공유가 그 배열을 쓴다',
        SRC_DEV.includes("const lines=tEl._lines||[(tEl.getAttribute('data-raw')||'').trim()];"), true);
}

// ═══ 11. 명제집은 축 이름이 다르다 (v26-0831-5, HB) ═══
console.log('\n시나리오 11 — 명제집의 켜고 끄는 칩 이름');
{
  // 대분류=예배 · 소주제=설교 제목. ⚠️ **이름표만** 갈린다 —
  // 거르는 장치(cat/topic/tag/book)는 한 벌 그대로여야 한다.
  sc.eq('명제집 칩 이름',
        SRC_DEV.includes("[['all','전체'],['cat','예배별'],['topic','제목별'],['tag','태그별'],['book','성경별']]"), true);
  sc.eq('말씀 모음은 예전 그대로',
        SRC_DEV.includes("[['all','전체'],['cat','대분류별'],['topic','소주제별'],['tag','태그별'],['book','성경별']]"), true);
  sc.eq('명제집인지 보고 고른다', SRC_DEV.includes('const isP=_collIsProp(findColl(id));'), true);
  // 거르는 축 이름 자체는 안 바뀐다 (바뀌면 저장된 필터가 통째로 무효가 된다)
  sc.eq('축 이름은 그대로', /\['book','성경별'\]\]\s*:\s*\[\['all','전체'\]/.test(SRC_DEV), true);
}

// ═══ 12. 붓이 안 붙던 것 (v26-0831-7 · -18 회귀) ═══
console.log('\n시나리오 12 — 글꼴이 늦게 와도 붓으로 바뀐다');
{
  // ⚠️⚠️ v26-0831-18, HB 신고 — "첫 명제는 붓이 안 붙고, 다음으로 넘겼다가
  //    돌아오면 붙어 있다."
  //    까닭 — 한글 웹폰트는 Google 이 **쓰인 글자 조각(서브셋)만** 준다.
  //    그런데 '받아졌나' 를 재는 자가 늘 **고정 문구**로 쟀다. 첫 명제의 조각만
  //    받아진 상태에서는 그 고정 문구가 아직 없어 "못 받았다" 가 나왔고
  //    → 다시 그리지 않아 첫 명제는 명조로 남았다.
  //    → 잴 때도 **그 문구 그대로** 잰다. 기억도 문구별로 남긴다.
  sc.eq('잴 때 그 문구로 잰다',
        SRC_DEV.includes('function _ptFontLoaded(fam,text){'), true);
  sc.eq('문구별로 기억한다',
        SRC_DEV.includes("const probe=_ptSample(text),ck=fam+'\\u0001'+probe;"), true);
  sc.eq('못 받았다는 답은 캐시하지 않는다',
        SRC_DEV.includes('if(ok)_ptFontOkCache[ck]=true;'), true);
  sc.eq('글씨체만으로 기억하던 옛 길은 없앴다',
        SRC_DEV.includes('if(_ptFontOkCache[fam])return true;'), false);
  // 그리고 **적극적으로 기다렸다가** 도착하면 다시 그린다
  // v26-0901-4 — 지금 쓰는 글씨체 **하나만** 받는다 (예전엔 붓·펜을 늘 함께 받았다)
  sc.eq('글꼴을 기다린다', SRC_DEV.includes('document.fonts.load("16px \'"+fam+"\'",t)'), true);
  sc.eq('안 쓰는 글씨체는 안 받는다',
        SRC_DEV.includes("Promise.all(Object.values(_PT_FAMS).map(f=>"), false);
  sc.eq('도착하면 다시 그린다',
        SRC_DEV.includes("if(!quiet&&typeof _verseFullIsOpen==='function'&&_verseFullIsOpen())_verseFullRender();"), true);
  sc.eq('다시 재 보게 캐시를 비운다', SRC_DEV.includes('_ptFontOkCache={};'), true);
  sc.eq('실제 문구를 넘긴다', SRC_DEV.includes('_ptEnsureFont(t);'), true);
  sc.eq('기다림에 시간 제한이 있다',
        SRC_DEV.includes('const timeout=new Promise(r=>setTimeout(r,6000));'), true);

  // ── 깜빡임 막기 (HB 신고: "미적용 폰트가 0.몇 초 보였다가 붓으로 바뀐다") ──
  // ⚠️ **오는 중에는 명조로 되돌리지 않는다.** 못 받은 것이 확실할 때만 되돌린다.
  sc.eq('오는 중이면 손글씨 그대로',
        SRC_DEV.includes("if(fam&&!_ptFontLoaded(fam,t)&&!_ptStillTrying(fam,t))pf='plain';"), true);
  sc.eq('오는 중인지 가리는 자가 있다', SRC_DEV.includes('function _ptFontPending('), true);
  // 글꼴 URL 이 display=block 이라 오는 동안 글자가 **비어 있을 뿐** 안 깜빡인다
  sc.eq('display=block 으로 받는다', SRC_DEV.includes('&display=block'), true);
  sc.eq('swap 은 쓰지 않는다', SRC_DEV.includes('Nanum+Pen+Script&display=swap'), false);
  // 명제집이 있으면 미리 받아 둔다 (첫 전체화면에서 기다리지 않게)
  sc.eq('미리 받아 둔다', SRC_DEV.includes('function _ptWarmup('), true);
  sc.eq('시작할 때 부른다', SRC_DEV.includes('setTimeout(()=>{try{_ptWarmup();}catch(e){}},1800);'), true);

  // 판정 함수를 **실제로 돌려 본다** — 못 받은 상태에서 두 번 물어도
  // 두 번 다 새로 재야 한다 (한 번이라도 캐시하면 이 회귀가 되살아난다)
  let measured = 0;
  global.document = { createElement: () => ({ getContext: () => ({
    set font(v){}, measureText(){ measured++; return { width: 100 }; } }) }) };
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('let _ptFontOkCache={};'),
                           SRC_DEV.indexOf('function _vfRollProp(){'));
  const box = {};
  new Function('box','document','_ptSample','_ptKey',
    fn + ';box.f=_ptFontLoaded;box.c=()=>_ptFontOkCache;'
  )(box, global.document,
    t=>String(t||'').slice(0,80)||'한글',
    (f,t)=>f+'|'+t);
  sc.eq('못 받았으면 false', box.f('없는글꼴','문구'), false);
  const n1 = measured;
  box.f('없는글꼴','문구');
  sc.eq('두 번째도 다시 잰다 (캐시 안 함)', measured > n1, true);
  sc.eq('캐시가 비어 있다', Object.keys(box.c()).length, 0);
}

// ═══ 13. 명제에서 안 쓰는 단추를 감춘다 (v26-0903-10) ═══
console.log('\n시나리오 13 — 명제 화면의 반응 단추');
{
  // 암송·Even 은 말씀 전용으로 감추되, Deeper 는 명제와 연결된 설교 본문으로
  // 들어가는 길이므로 다시 보인다.
  sc.eq('말씀 전용 둘만 감춘다',
        SRC_DEV.includes("['mem','even'].forEach(k=>{"), true);
  sc.eq('Deeper 는 감추지 않는다',
        SRC_DEV.includes("['mem','deeper','even'].forEach(k=>{"), false);
  sc.eq('명제일 때만',
        SRC_DEV.includes("if(b)b.classList.toggle('vf-act-off',isProp);"), true);
  sc.eq('감춤 CSS', SRC_DEV.includes('.vf-act.vf-act-off{display:none!important;}'), true);
  // ⚠️ style.display 를 직접 건드리면 등급(data-lv) 같은 다른 장치가 감춰 둔
  //    것까지 되살아난다 (CLAUDE.md 의 lv-hide 와 같은 규칙)
  const blk = SRC_DEV.slice(SRC_DEV.indexOf("['mem','even'].forEach(k=>{"),
                            SRC_DEV.indexOf("['mem','even'].forEach(k=>{")+260);
  sc.eq('display 를 직접 안 건드린다', /style\.display/.test(blk), false);
  // 좋아요·공유는 남는다
  sc.eq('좋아요는 안 감춘다', /\['mem','even'[^\]]*'like'/.test(SRC_DEV), false);
}

// ═══ 14. 한 명제가 여러 성경권에 걸린다 (v26-0831-7, HB 승인) ═══
console.log('\n시나리오 14 — 성경권 여럿');
{
  // ⚠️ 장절 글자("롬 5:8; 엡 2:8-9")를 앱이 헤아리게 하지 않는다.
  //    시트의 '성경권' 열을 그대로 쓴다 (목사님이 이미 적어 두신 값).
  // v26-0831-20 — 열 이름이 조금 달라도 찾도록 col() 로 바뀌었다
  sc.eq('시트에서 성경권을 읽는다', SRC_DEV.includes("const iBooks=col('성경권');"), true);
  sc.eq('이름이 달라도 찾는다', SRC_DEV.includes('const col=(...names)=>{'), true);
  // ⚠️ '명제 ID' 를 '명제' 보다 먼저 정한다 — 안 그러면 '명제' 가 그 열을 집어간다
  sc.eq('명제 ID 를 먼저 정한다',
        SRC_DEV.indexOf("const iId=col('명제 ID');")<SRC_DEV.indexOf("const iText=col('명제');"), true);
  // ⚠️ v26-0831-21, HB — 성경권은 **설교 본문에서 뽑은 것이 전부**다.
  //   시트의 '성경권' 열은 인용 본문까지 헤아려 적힌 값이라 읽지 않는다
  //   (전도서 설교의 명제가 마태복음 필터에 걸리던 까닭).
  sc.eq('여러 개로 나눈다', SRC_DEV.includes("function _propBooks(refs){"), true);
  sc.eq('설교 본문에서만 뽑는다',
        SRC_DEV.includes("books:_propBooks(_propRefs(refCell(r)))"), true);
  sc.eq('인용 본문은 소속에 안 쓴다',
        SRC_DEV.includes("const iRefCols=[iSermon,iOldRef].filter(x=>x>=0);"), true);
  sc.eq('구절에 실어 화면까지 보낸다', SRC_DEV.includes('books:v.books||[]'), true);
  sc.eq('발행·구독에도 실린다',
        SRC_DEV.includes('function _booksOf(v){'), true);

  // 세는 곳·거르는 곳이 모두 그 함수를 지나야 한다
  sc.eq('거를 때 여러 권을 본다',
        SRC_DEV.includes('if(!bs.length||!bs.some(b=>_bookSel(f,b)))return false;'), true);
  sc.eq('셀 때도 여러 권으로',
        SRC_DEV.includes('const groups=_groupVersesByMulti(inTab,_booksOf);'), true);
  sc.eq('신구약 탭도 여러 권으로',
        SRC_DEV.includes('const isOT=_booksOf(v).some(b=>BIBLE_ORDER_OT.includes(b));'), true);
}

// ═══ 15. 전체화면이 멈추던 사고 (v26-0831-8 회귀) ═══
console.log('\n시나리오 15 — 글꼴 기다리기가 무한히 되풀이되지 않는다');
{
  // ⚠️⚠️ v26-0831-7 에서 "글꼴이 도착하면 다시 그린다"를 넣었는데, 다시
  //    그리면 _ptEnsureFont 가 또 불리고 **또 기다리기를 시작**했다.
  //        그리기 → 기다리기 → 즉시 끝 → 그리기 → …
  //    가 쉬지 않고 돌아 **PC·모바일 둘 다 화면이 멈췄다** (HB 신고).
  // v26-0831-18 — 고리를 끊는 자물쇠가 '문구별 표시'로 바뀌었다. 한 번 받아 본
  //    문구는 다시 받지 않으므로, 다시 그리기가 돌아와도 곧장 나간다.
  // v26-0901-3 — 자물쇠가 '문구별'에서 **'글자별'** 로 바뀌었다. 이미 받아 둔
  //   글자만으로 된 문구는 아예 받으러 가지 않으므로 고리가 생기지 않는다.
  sc.eq('받아 둔 글자뿐이면 안 받는다', SRC_DEV.includes('if(!miss.length)return;'), true);
  sc.eq('글자 단위로 기억한다', SRC_DEV.includes('function _ptMissing(fam,text){'), true);
  // ⚠️ v26-0901-9 — 시도 횟수는 **글씨체마다 따로** 센다. 하나로 세면 글씨체가
  //   여럿일 때 앞의 것들이 횟수를 다 써서 뒤의 것은 아예 못 받는다.
  sc.eq('시도 횟수도 막는다',
        SRC_DEV.includes('if((_ptTries[fam]||0)>=_PT_TRY_MAX)return;'), true);
  sc.eq('글씨체마다 따로 센다', SRC_DEV.includes('_ptTries[fam]=(_ptTries[fam]||0)+1;'), true);
  sc.eq('하나로 세던 옛 길은 없앴다', SRC_DEV.includes('_ptFontTries'), false);
  // ⚠️⚠️ v26-0901-4 — **정말 받아졌을 때만** 기억한다. 성패와 무관하게 적었더니
  //   못 받았는데도 '다 받았다'가 되어 기다림도 다시 받기도 사라져 명조로 굳었다.
  sc.eq('정말 받았을 때만 적는다',
        SRC_DEV.includes('miss.forEach(c=>{busy.delete(c); if(ok)have.add(c);});'), true);
  sc.eq('받아졌는지 실제로 재 본다',
        SRC_DEV.includes('const ok=_ptFontLoaded(fam,t);'), true);
  // 재는 자는 브라우저에게 직접 묻는다 (폭 재기는 한글에서 같은 폭이 나와 틀린다)
  sc.eq('브라우저에게 직접 묻는다',
        SRC_DEV.includes('ok=document.fonts.check("16px \'"+fam+"\'",probe);'), true);

  // ── 실제로 돌려 본다: 고리가 도는지 세어 본다 ──
  let renders = 0;
  const fonts = { load: () => Promise.resolve(null) };   // 이미 받아진 글꼴처럼 즉시 끝난다
  const doc = {
    getElementById: () => ({}),                          // <link> 는 이미 있다고 본다
    createElement: () => ({ getContext: () => ({
      set font(v){ this._f = v; },
      measureText(){ return { width: /Nanum/.test(this._f) ? 200 : 100 }; } }) }),
    fonts
  };
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_TRY_MAX='),
                            SRC_DEV.indexOf('function _vfRollProp(){'));
  const box = {};
  new Function('box','document','setTimeout','_ptFont','_PT_FAMS','_verseFullIsOpen',
    '_verseFullRender','ACTIVE_VERSES','_vfIsProp',
    src + ";box.ensure=_ptEnsureFont;box.tries=()=>(_ptTries['Nanum Brush Script']||0);"
  )(box, doc, (fn)=>{ /* 시간 끊기는 안 쓴다 */ },
    ()=>'brush',
    {brush:'Nanum Brush Script',pen:'Nanum Pen Script'},
    ()=>true,
    ()=>{ renders++; if(renders<50) box.ensure('문구'); },   // 다시 그리면 또 부른다
    ()=>[], v=>false);

  box.ensure('문구');
  return new Promise(r=>setTimeout(r,60)).then(()=>{
    // 한 번 받고, 한 번 다시 그리고, 거기서 **멈춘다**
    sc.eq('한 번만 받는다', box.tries(), 1);
    sc.eq('다시 그리기가 안 돈다', renders, 1);
    console.log('\n시나리오 16 — 명제는 설교 본문의 성경 **전부**에 속한다 (v26-0831-19, HB)');
{
  // HB 신고 — "어떤 명제는 소속 성경이 없고, 대개 첫 성경에만 소속된다.
  //   '설교 본문'에 창세기·요한복음·로마서가 있으면 **세 군데 다** 있어야 한다."
  // 까닭 — 거르는 자가 _bookOfRef(v.ref) 로 **첫 성경 하나**만 봤다.
  //   장절 칸이 비었으면 아예 아무 데도 안 걸렸다.
  sc.eq('거를 때 여러 권을 다 본다',
        SRC_DEV.includes("if(kind==='book') return _booksOf(v).includes(val);"), true);
  sc.eq('첫 권만 보던 옛 길은 없앴다',
        SRC_DEV.includes("if(kind==='book') return _bookOfRef(v.ref)===val;"), false);
  // 성경별 칩의 개수도 걸린 권마다 다 센다
  sc.eq('개수도 권마다 다 센다',
        SRC_DEV.includes("_booksOf(v).forEach(b=>{ if(b)cnt.set(b,(cnt.get(b)||0)+1); });"), true);
  // Sweeter '성경' 타일도 마찬가지
  sc.eq('Sweeter 타일도 권마다',
        SRC_DEV.includes("const bs=_booksOf(v);\n    (bs.length?bs:['그 밖']).forEach(k=>{"), true);
  // ⚠️ **묶어 보일 때**는 한 타일이 한 묶음에만 놓일 수 있다 → 첫 권을 쓴다.
  //    (거르기와 묶기는 다른 일이다. 헷갈리면 타일이 세 번 그려진다)
  sc.eq('묶을 때는 첫 권', SRC_DEV.includes('function _vgBookOne(v){'), true);
  sc.eq('묶음 열쇠가 그것을 쓴다',
        SRC_DEV.includes("function _vgGroupKey(v){return _vgState.sortMode==='bible'?_vgBookOne(v):"), true);
}

console.log('\n시나리오 17 — 타일뷰의 갈래 탭과 명제 표시 (v26-0831-19, HB)');
{
  sc.eq('탭 줄이 있다', SRC_DEV.includes('<div class="vg-tabrow" id="vgTabRow"></div>'), true);
  // 목록 팝업과 **같은 값**을 쓴다 (이름이 어긋나면 두 곳이 따로 논다)
  sc.eq('같은 탭 표를 쓴다', SRC_DEV.includes('row.innerHTML=_VL_TABS.map('), true);
  sc.eq('거르는 자리는 한 곳',
        SRC_DEV.includes("if(_tab!=='all')pool=pool.filter(v=>_vfIsProp(v)===(_tab==='prop'));"), true);
  // '명제' 표시는 목록 팝업과 같은 음영 칩, '전체' 탭에서만
  sc.eq('같은 음영 칩을 쓴다',
        SRC_DEV.includes("'<span class=\"vli-propmark vg-propmark\">명제</span>'"), true);
  sc.eq('전체 탭에서만 단다', SRC_DEV.includes("const mk=(_vgTab()==='all'&&_vfIsProp(v))?"), true);
  sc.eq('장절만 보이는 5열에도 단다', SRC_DEV.includes('onclick="vgPick(${i})">${mk}${esc(_vgShortRef(v.ref))}'), true);
  // 탭 줄 높이는 최소로 (목록 팝업과 같은 .vl-tab 을 쓴다)
  // v26-0831-20, HB — 탭은 **가운데**로
  sc.eq('가운데 정렬', /\.vg-tabrow\{[^}]*justify-content:center;/.test(SRC_DEV), true);
  sc.eq('높이를 최소로', /\.vg-tabrow\{[^}]*padding:0 12px 4px;/.test(SRC_DEV), true);
}

console.log('\n시나리오 18 — 대표 문구 줄바꿈 규칙 (v26-0901-3, HB)');
{
  // HB — "첫줄 글자수가 스페이스 제외 30자가 넘으면 가장 점수 높은 곳에서 1회
  //       줄바꿈. 그 뒤 한 줄이 또 30자를 넘거나 두 줄 차이가 10자를 넘으면
  //       긴 줄을 또 1회 줄바꿈."
  sc.eq('상한이 한 곳에 있다', SRC_DEV.includes('const _PT_LINE_MAX=30;'), true);
  sc.eq('차이 상한도', SRC_DEV.includes('const _PT_DIFF_MAX=10;'), true);
  // ⚠️ 점수는 본문 줄바꿈 엔진의 등급을 그대로 쓴다 — 두 벌이 되면 어긋난다
  sc.eq('본문 엔진의 등급을 쓴다',
        SRC_DEV.includes('const _PT_BREAK_SCORE={forced:4,must:3,ok:2,soft:1,no:0};'), true);
  sc.eq('그 등급 함수를 부른다',
        /function _ptSplitOnce\(text\)\{[\s\S]{0,600}_vfBreakClass\(/.test(SRC_DEV), true);
  sc.eq('줄 배열을 이미지도 쓰게 남긴다', SRC_DEV.includes('el._lines=lines;'), true);
  sc.eq('<br> 로 그린다',
        SRC_DEV.includes("el.innerHTML='<span class=\"pt-w\">'+lines.map(esc).join('<br>')+'</span>';"), true);

  // ── 실제로 돌려 본다 ──
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_LINE_MAX='),
                            SRC_DEV.indexOf('// ── 명제 대표 문구 타이틀 ─'));
  const box = {};
  // 등급은 흉내만 낸다 — 이 시험의 관심사는 **자르는 규칙**이지 등급표가 아니다.
  // '~하고/~하니' 로 끝나면 끊어도 되는 자리(ok), 그 밖은 soft.
  const cls = w => /(고|니|며|면)$/.test(w) ? 'ok' : 'soft';
  new Function('box','_vfBreakClass', src + ';box.wrap=_ptWrapTitle;box.len=_ptLen;')
    (box, cls);

  // ① 30자 이하는 한 줄 그대로
  sc.eq('짧으면 안 자른다', box.wrap('주님은 나의 목자시니'), ['주님은 나의 목자시니']);
  // ② 30자를 넘으면 한 번 자른다 — 점수 높은 자리(ok)에서
  const t2 = '하나님은 오늘도 우리를 부르시고 우리를 세우시며 끝내 우리를 온전하게 하신다';
  const r2 = box.wrap(t2);
  sc.eq('길면 자른다', r2.length >= 2, true);
  sc.eq('자른 자리가 점수 높은 곳', /(고|며)$/.test(r2[0].split(/\s+/).pop()), true);
  sc.eq('글자는 하나도 안 잃는다', r2.join(' '), t2);
  // ③ 자른 뒤에도 한 줄이 30자를 넘으면 긴 줄을 한 번 더 자른다 (세 줄까지)
  const t3 = '우리가 함께 걸어가며 서로를 돌아보고 마침내 한 몸으로 자라나기까지 주께서 우리를 붙드시니 끝내 우리는 흔들리지 않는다';
  const r3 = box.wrap(t3);
  sc.eq('세 줄까지 간다', r3.length, 3);
  sc.eq('세 줄도 글자를 안 잃는다', r3.join(' '), t3);
  sc.eq('네 줄로는 안 간다', r3.length <= 3, true);
  // ④ 낱말이 하나뿐이면 가를 수 없다 — 그대로 둔다
  sc.eq('한 낱말은 그대로', box.wrap('가'.repeat(40)), ['가'.repeat(40)]);
  // ⑤ 글자 수는 **공백을 뺀다**
  sc.eq('공백은 안 센다', box.len('가 나 다'), 3);
}

console.log('\n시나리오 19 — 공유 이미지에도 대표 문구가 들어간다 (v26-0901-3, HB)');
{
  // HB 신고 — "명제집 공유 이미지에 대표 문구가 빠져서 저장되고 있어."
  // ⚠️ 캔버스는 화면 요소를 자동으로 옮겨 주지 않는다. 화면에 그린 것마다
  //    _shotDraw 안에 한 자리씩 있어야 한다.
  const shot = SRC_DEV.slice(SRC_DEV.indexOf('function _shotDraw(o){'),
                             SRC_DEV.indexOf('function _fmtRefForText('));
  sc.eq('타이틀을 찾는다', shot.includes("document.getElementById('vfPTitle')"), true);
  sc.eq('켜져 있을 때만', shot.includes("ptEl.classList.contains('on')"), true);
  // 줄 배열은 화면이 정한 그대로 (여기서 다시 접으면 화면과 다른 그림이 된다)
  sc.eq('화면의 줄 배열을 쓴다', shot.includes('ptEl._lines&&ptEl._lines.length'), true);
  sc.eq('가운데에 찍는다', shot.includes("lines.forEach((ln,i)=>ctx.fillText(ln,pcx,Y(r.top+lh*(i+0.5))));"), true);
  // 손으로 그은 획도 **화면에 그려진 그 path 그대로** 옮긴다 (씨앗을 다시 뽑지 않는다)
  sc.eq('획도 옮긴다', shot.includes("ptEl.querySelector('.pt-ink path')"), true);
  sc.eq('획을 다시 계산하지 않는다', shot.includes('_hiWavePoly(lw'), false);
  // 본문보다 **먼저** 그린다 (화면에서도 타이틀이 위에 있다)
  sc.eq('본문보다 먼저',
        shot.indexOf("getElementById('vfPTitle')") < shot.indexOf("getElementById('vfText')"), true);
}

console.log('\n시나리오 20 — 대표 문구 글씨체를 고를 자리 (v26-0901-3, HB)');
{
  // HB — "붓폰트 외에 펜폰트도 넣는다고 하지 않았어? 적용된 케이스가 안 보이던데"
  // 까닭 — 값(_PT_FONTS)과 CSS 는 있었는데 **고를 자리가 없었다.**
  // v26-0901-5, HB — 넷을 켜고 끌 수 있고, 켠 것들 안에서 명제마다 하나가 정해진다
  // v26-0902-8, HB — 스물둘을 더해 서른둘이 됐고, 무리(g)로 묶어 보여 준다
  sc.eq('구글 다섯이 그대로 있다',
        SRC_DEV.includes("{k:'brush', g:'h',ko:'나눔붓',   fam:'Nanum Brush Script'}")
        && SRC_DEV.includes("{k:'dokdo', g:'h',ko:'동해독도', fam:'East Sea Dokdo'}")
        && SRC_DEV.includes("{k:'yeon',  g:'h',ko:'연성',     fam:'Yeon Sung'}")
        && SRC_DEV.includes("{k:'song',  g:'m',ko:'송명',     fam:'Song Myung'},")
        && SRC_DEV.includes("{k:'gowun', g:'m',ko:'고운바탕', fam:'Gowun Batang'}"), true);
  // ⚠️ 칸 수를 못 박지 않는다 — 글씨체가 늘면 저절로 다음 줄로 접힌다
  sc.eq('단추 줄이 늘어난다',
        SRC_DEV.includes('grid-template-columns:repeat(auto-fill,minmax(74px,1fr))'), true);
  sc.eq('켜고 끄는 함수', SRC_DEV.includes('function togglePropTitleFont(k){'), true);
  sc.eq('설정창에 자리가 있다', SRC_DEV.includes('id="ptFontRow"'), true);
  sc.eq('제목은 명제 타이틀',
        SRC_DEV.includes('<div class="settings-section-title">명제 타이틀</div>'), true);
  // ⚠️ HB — 파워 등급에만 보인다
  sc.eq('파워 등급',
        /data-lv="p">\s*<div class="settings-section-title">명제 타이틀</.test(SRC_DEV), true);
  sc.eq('처음 쓰는 사람은 붓 하나', SRC_DEV.includes("propTitleFonts:['brush']"), true);
  sc.eq('저장값과 맞춘다', SRC_DEV.includes('function _ptSyncFontUI(){'), true);
  // ⚠️ 설정창을 다시 열 때 반드시 맞춰 준다 (안 맞추면 정반대로 저장된다)
  sc.eq('설정창을 열 때 맞춘다',
        /function _vfArtSyncUI\(\)\{[\s\S]{0,200}_ptSyncFontUI\(\);/.test(SRC_DEV), true);
  // ⚠️ 마지막 하나는 못 끈다 — 다 끄면 뽑을 것이 없어진다
  sc.eq('마지막 하나는 못 끈다',
        SRC_DEV.includes("if(on.length<=1){showToast('글씨체는 하나 이상 켜져 있어야 해요');return;}"), true);
  sc.eq('하나도 없으면 붓으로 본다', SRC_DEV.includes("return list.length?list:['brush'];"), true);
  // 새로 켠 글씨체로는 아직 글자가 하나도 없다 → 그 자리에서 데운다
  sc.eq('켜면 미리 받아 둔다',
        /function togglePropTitleFont\(k\)\{[\s\S]{0,700}_ptWarmup\(\)/.test(SRC_DEV), true);
  // ⚠️ v26-0901-9 — 켠 것을 미리 데우되, **저장소에 직접 올린 것은 건너뛴다.**
  //   여덟 벌을 앱 켤 때 다 받으면 3MB다 (구글 것은 쓰인 글자 조각만 와서 가볍다).
  sc.eq('켠 것을 모두 데운다', SRC_DEV.includes('_ptFontsOn().forEach(k=>{'), true);
  sc.eq('직접 올린 것은 미리 안 받는다',
        SRC_DEV.includes('if(f&&f.self)return;'), true);
  // 직접 올린 글씨체 여덟이 표에 있고 @font-face 도 함께 있다
  // v26-0902-7, HB — 받아쓰기·재민체·문해는 뺐다 (파일·@font-face 는 남겨 둠)
  const _facesAt = SRC_DEV.indexOf('const _PT_FACES=[');
  const faceTbl = SRC_DEV.slice(_facesAt, SRC_DEV.indexOf('];', _facesAt));
  sc.eq('직접 올린 글씨체가 표에 있다',
        (faceTbl.match(/self:1\}/g)||[]).length, 8);
  // ── v26-0902-8, HB — 스물둘을 더하고 무리로 나눠 배치 ──────────────────
  // 무리는 표의 g 하나로 정해진다 (m 명조 · g 고딕 · h 손글씨)
  sc.eq('무리 표가 있다',
        SRC_DEV.includes("const _PT_GROUPS=[{g:'h',ko:'손글씨'},{g:'m',ko:'명조'},{g:'g',ko:'고딕'}];"), true);
  sc.eq('무리마다 묶어 그린다',
        SRC_DEV.includes("const list=_PT_FACES.filter(f=>(f.g||'h')===g.g);"), true);
  sc.eq('무리 이름줄을 그린다', SRC_DEV.includes('<div class="pt-g-title${op?\' open\':\'\'}"'), true);
  // ⚠️ g 를 안 적은 글씨체가 있으면 설정창에서 사라진다 (기본값 h 가 받아 준다)
  sc.eq('모든 글씨체에 무리가 있다',
        (faceTbl.match(/\{k:'/g)||[]).length, (faceTbl.match(/g:'[mgh]'/g)||[]).length);
  // 새로 더한 스물둘이 표와 글꼴 파일에 다 있다
  // ⚠️⚠️ v26-0902-17, HB — **라이선스가 확인된 것만 남기고 나머지는 파일까지 지웠다.**
  //    표에서 빼는 것으로 끝내면 저장소가 공개라 앱에서 안 써도 내려받을 수 있다.
  //    남은 여덟은 전부 SIL Open Font License 로 확인된 것이다.
  [['barun','barun','1.20'],['uridal','uridal','1.20'],['daegwang','daegwang','1.38'],
   ['bombaram','bombaram','0.93'],['sangjang','sangjang','0.91'],['nmyet','nmyet','0.97'],
   ['gmarketL','gmarket_l','1.06'],['gmarketB','gmarket_b','0.97']].forEach(([k,f,v])=>{
    sc.eq(k+' 표에 있다', faceTbl.indexOf("{k:'"+k+"'") >= 0, true);
    sc.eq(k+' 글꼴 파일',
      SRC_DEV.includes("src:url('fonts/"+f+".woff2')format('woff2');font-display:block;"), true);
    sc.eq(k+' 배율 '+v,
      new RegExp("\\.vf-ptitle\\.pf-"+k+"\\{[^}]*--pt-k:"+v.replace('.','\\.')+";").test(SRC_DEV), true);
  });
  // 지운 것들은 표에도, @font-face 에도, CSS 에도 남아 있지 않다
  ['chosunN','chosunS','sungkok','mapogold','mapoflower','agape','nexonL','nexonR','nexonB',
   'dream1','dream8','esamanL','esamanB','yes24','incheon','kyobo','kotra','tvn','griun',
   'hakgyo','jaemin','lxgw'].forEach(k=>{
    sc.eq(k+' 는 표에서 지웠다', faceTbl.indexOf("{k:'"+k+"'") >= 0, false);
    sc.eq(k+' 는 CSS 에서도 지웠다',
      new RegExp("\\.vf-ptitle\\.pf-"+k+"\\{").test(SRC_DEV), false);
  });
  ['chosunnm','chosunsg','sungkok','mapogold','mapoflower','mapoagape','nexon_l','nexon_r',
   'nexon_b','scdream1','scdream8','esaman_l','esaman_b','yes24','incheon','kyobo','kotra',
   'tvn','griun','hakgyo','jaemin','lxgw'].forEach(f=>
    sc.eq(f+' 글꼴 주소가 없다', SRC_DEV.includes("url('fonts/"+f+".woff2')"), false));
  // 구글 다섯은 그대로 (전부 OFL)
  sc.eq('구글 다섯은 남는다',
        (faceTbl.match(/\{k:'/g)||[]).length, 13);
  // ⚠️ 고운바탕 배율 — HB 가 화면을 보고 정한 값 (재서 나온 값이 아니다)
  sc.eq('고운바탕 배율',
        SRC_DEV.includes(".vf-ptitle.pf-gowun{font-family:'Gowun Batang',var(--vf-font,inherit);--pt-k:1.03;"), true);
  // ⚠️ 오는 동안 딴 글씨체로 그리면 깜빡인다 → 반드시 block
  sc.eq('오는 동안 감춘다', SRC_DEV.includes('font-display:swap') , false);
  // ⚠️⚠️ v26-0902-18, HB — "구글 다섯 벌만 단추에 미리보기가 안 된다."
  //    까닭: 구글 글꼴 주소를 **명제를 그릴 때만** 붙였다. 명제를 한 번도
  //    안 열고 설정창을 열면 안 붙어 있어 기본 글씨체로 보였다.
  //    (직접 올린 것은 미리보기 글꼴이 따로 있어 멀쩡했고 구글 것만 티가 났다)
  sc.eq('주소 붙이는 일이 따로 떨어져 있다',
        SRC_DEV.includes('function _ptLinkGoogle(){'), true);
  sc.eq('설정창도 부른다',
        /function _ptSyncFontUI\(\)\{[\s\S]{0,400}_ptLinkGoogle\(\);/.test(SRC_DEV), true);
  sc.eq('명제 그릴 때도 부른다',
        /function _ptEnsureFont\(text,quiet\)\{\s*_ptLinkGoogle\(\);/.test(SRC_DEV), true);
  sc.eq('한 번만 붙인다',
        SRC_DEV.includes("if(document.getElementById('ptHandLink'))return;"), true);
  // ⚠️ 직접 올린 것은 구글 주소에 넣지 않는다 (구글에 없는 이름이다)
  sc.eq('self 는 주소에 안 넣는다',
        SRC_DEV.includes('_PT_FACES.filter(f=>!f.self).map('), true);
  // ⚠️⚠️ 설정창을 여는 것만으로 여덟 벌(2.6MB)을 받으면 안 된다.
  //    단추에는 **이름표 글자만 담은 1KB 글꼴**을 먼저 세운다 (합계 9KB).
  sc.eq('미리보기 글꼴을 먼저 세운다',
        SRC_DEV.includes("const pfam=f=>f.self?`'${f.fam.replace('B7 ','B7P ')}',`:'';"), true);
  sc.eq('단추가 그것을 쓴다',
        SRC_DEV.includes("font-family:${pfam(f)}'${f.fam}',var(--font-ui);"), true);
  sc.eq('미리보기 글꼴 자리',
        SRC_DEV.includes("@font-face{font-family:'B7P Brush'"), false);   // 구글 것은 없다
  sc.eq('직접 올린 것마다 미리보기가 있다',
        (SRC_DEV.match(/@font-face\{font-family:'B7P /g)||[]).length, 8);
  // ⚠️ 고운바탕만 배율을 재서 나온 값보다 크게 준다 — 본문(명조)과 갈라야 한다
  sc.eq('고운바탕 배율 (26-0902 에 1.30 → 1.19 로 살짝 줄임)',
        SRC_DEV.includes(".vf-ptitle.pf-gowun{font-family:'Gowun Batang',var(--vf-font,inherit);--pt-k:1.03;"), true);
  // ⚠️ 오는 동안 딴 글씨체로 그리면 깜빡인다 → 반드시 block
  sc.eq('오는 동안 감춘다', SRC_DEV.includes('font-display:swap') , false);

  // ⚠️⚠️ 무작위지만 **명제마다 고정**이다 — 같은 명제를 다시 열면 같은 글씨체.
  //    열 때마다 바뀌면 산만하고, 다시 그릴 때마다 글씨체가 튄다.
  sc.eq('명제 ID 에서 고른다', SRC_DEV.includes('function _ptFontFor(v){'), true);
  sc.eq('그리기 전에 정한다', SRC_DEV.includes('_vfPropFont=_ptFontFor(v);'), true);
  sc.eq('넘길 때 뽑지 않는다',
        /function _vfRollProp\(\)\{[\s\S]{0,200}_vfPropFont=/.test(SRC_DEV), false);

  // ── 실제로 돌려 본다 ──
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_FACES=['),
                            SRC_DEV.indexOf('// 손글씨체는 **명제를 볼 때만**'));
  const box = {};
  const ST = { settings: {} };
  new Function('box','ST','_hiHash',
    src.replace(/^(?:const|let) /gm,'var ')
    + ';box.on=_ptFontsOn;box.forV=_ptFontFor;box.faces=_PT_FACES;'
  )(box, ST, function(x){ let h=0; for(let i=0;i<x.length;i++)h=(h*31+x.charCodeAt(i))|0; return h; });

  sc.eq('아무것도 없으면 붓', box.on(), ['brush']);
  ST.settings.propTitleFonts = [];
  sc.eq('빈 배열이어도 붓', box.on(), ['brush']);
  ST.settings.propTitleFonts = ['brush','dokdo','yeon'];
  const a1 = box.forV({pid:'P0007'}), a2 = box.forV({pid:'P0007'});
  sc.eq('같은 명제는 늘 같은 글씨체', a1, a2);
  sc.eq('켠 것 중에서 고른다', ST.settings.propTitleFonts.includes(a1), true);
  // 명제가 다르면 갈린다 (한 벌로만 몰리지 않는다)
  const spread = new Set();
  for(let i=0;i<60;i++)spread.add(box.forV({pid:'P'+String(i).padStart(4,'0')}));
  sc.eq('명제마다 갈린다', spread.size >= 2, true);
  // 하나만 켜면 늘 그것
  ST.settings.propTitleFonts = ['song'];
  sc.eq('하나만 켜면 늘 그것', box.forV({pid:'P0007'}), 'song');
  // 없는 이름은 무시한다 (옛 저장값에 'pen' 이 남아 있어도 안 걸린다)
  ST.settings.propTitleFonts = ['pen','plain'];
  sc.eq('없는 이름은 걸러진다', box.on(), ['brush']);
}


console.log('\n시나리오 21 — 명제의 장 단위 성경 연결');
{
  const start=SRC_DEV.indexOf('  _parseRef(ref){');
  const end=SRC_DEV.indexOf('\n\n  // 대한성서공회 새 모바일 플랫폼 URL',start);
  const method=SRC_DEV.slice(start,end).replace(/^  _parseRef\(ref\)\{/,'').replace(/\},?\s*$/,'');
  const parse=new Function('ref',method);
  sc.eq('시편의 편 표기를 1절로 연결',parse('시편 52편'),{bookName:'시편',chapter:52,verse:1});
  sc.eq('일반 장 표기를 1절로 연결',parse('사무엘상 22장'),{bookName:'사무엘상',chapter:22,verse:1});
  sc.eq('기존 장절은 그대로 연결',parse('요한복음 3:16'),{bookName:'요한복음',chapter:3,verse:16});
}

sc.done();
  });
}
