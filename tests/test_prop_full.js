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
  sc.eq('볼 때 받는 함수가 있다', SRC_DEV.includes('function _ptEnsureFont(text){'), true);
  sc.eq('그릴 때 부른다',
        /function _vfRenderPropTitle\(v\)\{[\s\S]{0,600}_ptEnsureFont\(t\);/.test(SRC_DEV), true);

  // 지금 글씨체(본문과 같은 것)는 없애지 않고 보관한다 (HB 지시)
  sc.eq('예전 글씨체를 보관한다', SRC_DEV.includes('.vf-ptitle.pf-plain{'), true);
  sc.eq('붓', SRC_DEV.includes(".vf-ptitle.pf-brush{font-family:'Nanum Brush Script'"), true);
  sc.eq('펜', SRC_DEV.includes(".vf-ptitle.pf-pen{font-family:'Nanum Pen Script'"), true);
  sc.eq('기본은 붓', SRC_DEV.includes("propTitleFont:'brush'"), true);

  // ⚠️ 손글씨체는 크게 흘려 써서 배율을 크게 준다. 그런데 **글씨체를 못 받으면**
  //    (사내망·오프라인) 그 배율이 본문 글씨체에 그대로 걸려 타이틀만 우스꽝스럽게
  //    커진다 → 실제로 받아졌는지 재 보고, 아니면 본문 글씨체로 되돌린다.
  sc.eq('받아졌는지 재 본다', SRC_DEV.includes('function _ptFontLoaded(fam,text){'), true);
  sc.eq('폭을 재서 판단한다', SRC_DEV.includes("c.font=\"72px '\"+fam+\"', monospace\";"), true);
  // 글씨체 이름은 한 표(_PT_FAMS)에서만 정한다 — 늘리기 쉽고 어긋날 자리가 없다
  sc.eq('글씨체 이름표가 한 곳',
        SRC_DEV.includes("const _PT_FAMS={brush:'Nanum Brush Script',pen:'Nanum Pen Script'};"), true);
  // v26-0831-18 — **못 받은 것이 확실할 때만** 되돌린다. 오는 중에 되돌리면
  //   명조가 0.몇 초 보였다가 붓으로 바뀌어 깜빡인다 (HB 신고, 시나리오 12).
  sc.eq('못 받으면 본문 글씨체로 되돌린다',
        SRC_DEV.includes("if(fam&&!_ptFontLoaded(fam,t)&&!_ptFontPending(fam,t))pf='plain';"), true);
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
        SRC_DEV.includes('const probe=_ptSample(text),ck=_ptKey(fam,probe);'), true);
  sc.eq('못 받았다는 답은 캐시하지 않는다',
        SRC_DEV.includes('if(ok)_ptFontOkCache[ck]=true;'), true);
  sc.eq('글씨체만으로 기억하던 옛 길은 없앴다',
        SRC_DEV.includes('if(_ptFontOkCache[fam])return true;'), false);
  // 그리고 **적극적으로 기다렸다가** 도착하면 다시 그린다
  sc.eq('글꼴을 기다린다', SRC_DEV.includes('document.fonts.load("16px \'"+f+"\'",t)'), true);
  sc.eq('도착하면 다시 그린다',
        SRC_DEV.includes("if(typeof _verseFullIsOpen==='function'&&_verseFullIsOpen())_verseFullRender();"), true);
  sc.eq('다시 재 보게 캐시를 비운다', SRC_DEV.includes('_ptFontOkCache={};'), true);
  sc.eq('실제 문구를 넘긴다', SRC_DEV.includes('_ptEnsureFont(t);'), true);
  sc.eq('기다림에 시간 제한이 있다',
        SRC_DEV.includes('const timeout=new Promise(r=>setTimeout(r,6000));'), true);

  // ── 깜빡임 막기 (HB 신고: "미적용 폰트가 0.몇 초 보였다가 붓으로 바뀐다") ──
  // ⚠️ **오는 중에는 명조로 되돌리지 않는다.** 못 받은 것이 확실할 때만 되돌린다.
  sc.eq('오는 중이면 손글씨 그대로',
        SRC_DEV.includes("if(fam&&!_ptFontLoaded(fam,t)&&!_ptFontPending(fam,t))pf='plain';"), true);
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

// ═══ 13. 명제에서 안 쓰는 단추를 감춘다 (v26-0831-7, HB 승인) ═══
console.log('\n시나리오 13 — 명제 화면의 반응 단추');
{
  // 암송(책갈피)·Deeper·Even 은 **성경 본문**을 외우고 더 깊이 보는 도구다.
  // 명제는 이미 해석된 글이라 갈 곳이 없다 → 담아두기·좋아요·공유 셋만 남는다.
  sc.eq('셋을 감춘다',
        SRC_DEV.includes("['mem','deeper','even'].forEach(k=>{"), true);
  sc.eq('명제일 때만',
        SRC_DEV.includes("if(b)b.classList.toggle('vf-act-off',isProp);"), true);
  sc.eq('감춤 CSS', SRC_DEV.includes('.vf-act.vf-act-off{display:none!important;}'), true);
  // ⚠️ style.display 를 직접 건드리면 등급(data-lv) 같은 다른 장치가 감춰 둔
  //    것까지 되살아난다 (CLAUDE.md 의 lv-hide 와 같은 규칙)
  const blk = SRC_DEV.slice(SRC_DEV.indexOf("['mem','deeper','even'].forEach(k=>{"),
                            SRC_DEV.indexOf("['mem','deeper','even'].forEach(k=>{")+260);
  sc.eq('display 를 직접 안 건드린다', /style\.display/.test(blk), false);
  // 좋아요·공유는 남는다
  sc.eq('좋아요는 안 감춘다', /\['mem','deeper','even'[^\]]*'like'/.test(SRC_DEV), false);
}

// ═══ 14. 한 명제가 여러 성경권에 걸린다 (v26-0831-7, HB 승인) ═══
console.log('\n시나리오 14 — 성경권 여럿');
{
  // ⚠️ 장절 글자("롬 5:8; 엡 2:8-9")를 앱이 헤아리게 하지 않는다.
  //    시트의 '성경권' 열을 그대로 쓴다 (목사님이 이미 적어 두신 값).
  sc.eq('시트에서 성경권을 읽는다', SRC_DEV.includes("iBooks=at('성경권')"), true);
  // v26-0831-12 — 성경권은 '성경권' 열과 **설교 본문에서 뽑은 것**을 합친다
  //   (설교 본문이 최대 3개까지 들어오므로 그 셋이 모두 걸려야 한다)
  sc.eq('여러 개로 나눈다', SRC_DEV.includes("function _propBooks(rawBooks,refs){"), true);
  sc.eq('성경권 열과 설교 본문을 합친다',
        SRC_DEV.includes("books:_propBooks(iBooks>=0?r[iBooks]:'',_propRefs(refCell(r)))"), true);
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
  sc.eq('받아 본 문구는 다시 안 받는다',
        SRC_DEV.includes('if(_ptLoadDone[k]||_ptLoadBusy[k])return;'), true);
  sc.eq('시도 횟수도 막는다',
        SRC_DEV.includes('if(_ptFontTries>=_PT_TRY_MAX)return;'), true);
  sc.eq('시도할 때마다 센다', SRC_DEV.includes('_ptLoadBusy[k]=true;_ptFontTries++;'), true);
  sc.eq('끝나면 받아 봤다고 적는다',
        SRC_DEV.includes('_ptLoadBusy[k]=false;_ptLoadDone[k]=true;'), true);

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
    src + ';box.ensure=_ptEnsureFont;box.tries=()=>_ptFontTries;'
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
    sc.done();
  });
}
