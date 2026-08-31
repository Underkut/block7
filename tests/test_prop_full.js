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
  // ⚠️ 우정렬은 뺐다 (HB 26-0831 — 좌·중앙만). 되살리지 말 것.
  sc.eq('좌·중앙 둘 중에서 고른다',
        SRC_DEV.includes("const _VF_PT_ALIGN=['al-l','al-c'];"), true);
  sc.eq('우정렬은 안 뽑는다', /_VF_PT_ALIGN=\[[^\]]*'al-r'/.test(SRC_DEV), false);
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
  sc.eq('좌정렬 CSS', SRC_DEV.includes('#vfText.prop{text-align:left;}'), true);
  // ⚠️ 말씀의 줄바꿈(_vfWrapFit)은 짧은 구절을 의미 단위로 끊기 위한 것이다.
  //    산문에 씌우면 낱말 하나가 혼자 한 줄에 남는다 → 명제는 그 앞에서 갈린다.
  sc.eq('명제는 말씀 줄바꿈을 안 쓴다',
        /if\(el\.classList\.contains\('prop'\)\)\{[\s\S]{0,200}_vfLayoutPropText\(/.test(SRC_DEV), true);
  const idxBranch = SRC_DEV.indexOf("if(el.classList.contains('prop')){");
  const idxWrap = SRC_DEV.indexOf('_vfWrapFit(words,ctx,availW)');
  sc.eq('갈림길이 줄바꿈보다 앞에 있다', idxBranch > 0 && idxBranch < idxWrap, true);
  sc.eq('산문 줄간격을 따로 둔다', SRC_DEV.includes('const _VF_PROP_LH=1.62;'), true);
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
  const draw = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle('),
                             SRC_DEV.indexOf('function _vfPropInk('));
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
  sc.eq('볼 때 받는 함수가 있다', SRC_DEV.includes('function _ptEnsureFont(){'), true);
  sc.eq('그릴 때 부른다',
        /function _vfRenderPropTitle\(v\)\{[\s\S]{0,600}_ptEnsureFont\(\);/.test(SRC_DEV), true);

  // 지금 글씨체(본문과 같은 것)는 없애지 않고 보관한다 (HB 지시)
  sc.eq('예전 글씨체를 보관한다', SRC_DEV.includes('.vf-ptitle.pf-plain{'), true);
  sc.eq('붓', SRC_DEV.includes(".vf-ptitle.pf-brush{font-family:'Nanum Brush Script'"), true);
  sc.eq('펜', SRC_DEV.includes(".vf-ptitle.pf-pen{font-family:'Nanum Pen Script'"), true);
  sc.eq('기본은 붓', SRC_DEV.includes("propTitleFont:'brush'"), true);

  // ⚠️ 손글씨체는 크게 흘려 써서 배율을 크게 준다. 그런데 **글씨체를 못 받으면**
  //    (사내망·오프라인) 그 배율이 본문 글씨체에 그대로 걸려 타이틀만 우스꽝스럽게
  //    커진다 → 실제로 받아졌는지 재 보고, 아니면 본문 글씨체로 되돌린다.
  sc.eq('받아졌는지 재 본다', SRC_DEV.includes('function _ptFontLoaded(fam){'), true);
  sc.eq('폭을 재서 판단한다', SRC_DEV.includes("c.font=\"72px '\"+fam+\"', monospace\";"), true);
  sc.eq('못 받으면 붓 대신 본문 글씨체',
        SRC_DEV.includes("if(pf==='brush'&&!_ptFontLoaded('Nanum Brush Script'))pf='plain';"), true);
  sc.eq('못 받으면 펜도 마찬가지',
        SRC_DEV.includes("else if(pf==='pen'&&!_ptFontLoaded('Nanum Pen Script'))pf='plain';"), true);
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
        SRC_DEV.includes('el._lines=_vfReadWrappedLines(el);'), true);
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

sc.done();
