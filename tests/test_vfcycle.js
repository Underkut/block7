// 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3)
//
// '순환' = 지금까지의 기본 동작 — 필터(타일뷰에서 들어옴)가 있으면 그 목록
// 순서대로, 없으면 성경순(ACTIVE_VERSES idx) 다음/이전.
// '셔플' = 필터가 있으면 그 필터 안에서, 없으면 말씀모음 설정의 활성 목록
// 전체(randomVerseManual, ACTIVE_VERSES 기준)에서 무작위.
//
// 아이콘은 HB 가 스케치로 확정한 모양 그대로다. 보이는 크기는 17×17이고,
// 30×30 버튼 안에서 태그 그림과 같은 색·투명도로 좌우 대칭인 상단 자리에 놓인다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 기본값과 상태 읽기');
{
  sc.eq('기본은 순환', SRC.includes("vfCycleMode:'repeat'"), true);
  sc.eq("_vfCycleMode 는 'shuffle' 이 아니면 전부 순환으로 본다",
        SRC.includes("function _vfCycleMode(){return ST.settings.vfCycleMode==='shuffle'?'shuffle':'repeat';}"), true);
}

console.log('\n시나리오 2 — 누르면 뒤집힌다');
{
  const fn = slice('function vfToggleCycleMode(){', 'function _vfSyncCycleIcon');
  sc.eq('beforeSave 가 먼저', fn.indexOf('beforeSave();') < fn.indexOf('ST.settings.vfCycleMode='), true);
  sc.eq('저장한다', fn.includes('save();'), true);
  sc.eq('아이콘을 다시 그린다', fn.includes('_vfSyncCycleIcon();'), true);
}

console.log('\n시나리오 3 — 아이콘·색·문구가 상태를 따른다');
{
  const fn = slice('function _vfSyncCycleIcon(){', 'function _vfSetNav');
  sc.eq('셔플이면 셔플 아이콘', fn.includes('btn.innerHTML=shuffle?_VF_SHUFFLE_SVG:_VF_CYCLE_SVG;'), true);
  sc.eq('상태를 클래스로도 표시해 둔다(색과는 무관)', fn.includes("btn.classList.toggle('vf-cycle-shuffle',shuffle);"), true);
  // ⚠️ v26-0905-4, HB — 선 굵기는 이제 **화면에 찍히는 굵기 1.35px** 하나로
  //    맞춘다. 그래서 stroke-width 숫자는 아이콘마다 다르다: 이 둘은 도안이
  //    24 짜리 상자에 17px 로 들어가(배율 0.708) 1.91 이어야 1.35 가 된다.
  //    (test_vf_top.js 가 네 아이콘을 한꺼번에 지킨다)
  sc.eq('아이콘은 사각 테두리 없이 선만',
        SRC.includes('const _VF_CYCLE_SVG=\'<svg width="17" height="17" viewBox="0 -2.5 24 24" fill="none" stroke="currentColor" stroke-width="1.91"'), true);
  sc.eq('셔플 아이콘도 같은 스타일',
        SRC.includes('const _VF_SHUFFLE_SVG=\'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.91"'), true);
  // ⚠️ 순환만 viewBox y 가 -2.5 다. 도안이 상자 안에서 그만큼 위로 치우쳐 있어
  //    그대로 두면 옆의 홈·제목·닫기와 높이가 안 맞는다 (v26-0905-4, HB 2번).
  sc.eq('순환 도안은 상자를 내려 한가운데로 앉힌다',
        /_VF_CYCLE_SVG='<svg [^>]*viewBox="0 -2\.5 24 24"/.test(SRC), true);
  sc.eq('셔플 도안은 이미 한가운데라 그대로',
        /_VF_SHUFFLE_SVG='<svg [^>]*viewBox="0 0 24 24"/.test(SRC), true);
  // ⚠️ 0817-16 에선 화살촉을 한 줄(상단 절반)만 썼는데, HB 가 "위아래 둘 다
  //    완성해 달라"고 다시 요청해 작은 V 로 되돌렸다 — 다리 길이(2,2)는 그대로.
  sc.eq('셔플 화살촉은 위아래 다 있는 작은 V',
        SRC.includes('<path d="M18 15l2 2-2 2"/><path d="M18 5l2 2-2 2"/>'), true);
  // v26-0817-18 — 순환 아이콘: 아래 두 코너 모두 안 둥글었다(오른쪽 아래는
  // 0817-17 에서 한 번 고쳤지만 반경이 너무 작아 눈에 안 띄었고, 왼쪽 아래는
  // 아예 손대지 않았었다). 네 코너 전부 같은 반경(4)의 아크로 그린다 —
  // gap 은 아래 가운데로 옮기고 화살촉이 그 자리에 들어간다.
  sc.eq('순환 — 네 코너 모두 라운딩된 한 path',
        SRC.includes('<path d="M9 15H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4h-3"/>'), true);
}

console.log('\n시나리오 3-1 — 닫기와 크기·높이·색·투명도를 통일한다');
{
  sc.eq('순환·셔플 버튼은 홈 오른쪽의 30×30',
        /\.vf-cycle\{[\s\S]{0,180}left:52px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);[\s\S]{0,100}width:30px;height:30px/.test(SRC), true);
  sc.eq('닫기 버튼은 우상단 30×30',
        /\.vf-close\{[\s\S]{0,180}top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);right:14px;[\s\S]{0,120}width:30px;height:30px/.test(SRC), true);
  sc.eq('두 버튼은 태그 그림과 같은 색·기본 투명도',
        (SRC.match(/color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/g)||[]).length >= 3, true);
  sc.eq('모바일도 태그 그림과 같은 투명도',
        SRC.includes('@media(hover:none){.vf-cycle,.vf-close{opacity:.3;}}'), true);
  sc.eq('필터가 있어도 버튼을 아래로 내리지 않는다', SRC.includes('vf-cycle-below'), false);
  // ⚠️ v26-0904-4, HB — 좌상단 세로줄에 '말씀 모음 설정'이 끼어들었다.
  //    위에서부터 홈·순환/셔플(12) → 말씀 모음 설정(50) → 저장 폴더 책갈피(88),
  //    그리고 책갈피가 여는 목록이 그 아래(122)에서 펼쳐진다.
  //    한 자리라도 어긋나면 버튼이 서로 겹쳐 아래 것이 안 눌린다.
  const topAt = (cls, px) =>
    SRC.includes(cls + '{position:absolute;top:calc(env(safe-area-inset-top,0px) + ' + px + 'px);left:14px;');
  sc.eq('말씀 모음 설정은 순환·셔플 바로 아래', topAt('.vf-collset', 50), true);
  sc.eq('저장 폴더 버튼은 그 아래', topAt('.vf-keepmenu', 88), true);
  sc.eq('저장 폴더 목록은 다시 그 아래에서 펼쳐진다',
        SRC.includes('.vf-keep-switch{position:absolute;z-index:13;top:calc(env(safe-area-inset-top,0px) + 122px);left:14px;'), true);
  sc.eq('말씀 모음 설정도 같은 색·투명도',
        /\.vf-collset\{[\s\S]{0,300}color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/.test(SRC), true);
  sc.eq('누르면 말씀설정의 말씀 모음 탭으로 간다',
        SRC.includes('onclick="event.stopPropagation();vfOpenCollSettings()"'), true);
  // 되돌아갈 팝업을 비워 둔다 — 설정을 닫으면 아래 깔린 전체화면이 그대로 보인다
  sc.eq('되돌아갈 팝업을 비운다',
        /function vfOpenCollSettings\(\)\{[\s\S]{0,200}?_vsetBackTo=null;_vsetBackId=null;[\s\S]{0,60}?_vsetGoColl\(\);/.test(SRC), true);
}

console.log('\n시나리오 4 — 보이는 아이콘 크기와 버튼 30×30');
{
  // ⚠️ v26-0905-5, HB — 닫기 X 가 옆의 것들보다 작고 흐려 보여 17 → 19 (홈과 같은 크기).
  //    크기·굵기는 test_vf_top.js 가 네 아이콘을 함께 재서 지킨다.
  sc.eq('닫기 X 아이콘 19×19', SRC.includes('<svg width="19" height="19" viewBox="0 0 20 20"'), true);
  sc.eq('테두리·박스 없다', /\.vf-cycle\{[^}]*background:none;border:none/.test(SRC), true);
}

console.log('\n시나리오 5 — 넘길 때 순환/셔플이 갈린다 (핵심 로직)');
{
  const fn = slice('function _vfNavCommit(d){', 'function verseFullNav');
  sc.eq('지금 모드를 한 번만 읽어 둔다', fn.includes("const shuffle=_vfCycleMode()==='shuffle';"), true);

  // v26-0831-19, HB — 셔플의 '뒤로'는 **방금 본 말씀**이다. 그래서 무작위로
  //   집는 일은 _vfShufPickRandom 한 곳으로 옮겼고, 넘기는 함수는 자취를
  //   쌓고 되짚는 일만 한다.
  const pick = slice('function _vfShufPickRandom(){', 'function verseFullNav');
  sc.eq('무작위 집기는 한 곳에서', fn.includes('_vfShufPickRandom();'), true);
  sc.eq('필터가 있으면 목록 안에서 무작위', pick.includes('if(_vfNavList.length>1){'), true);
  sc.eq('직전과 같은 자리는 다시 안 뽑는다',
        /do\{ni=Math\.floor\(Math\.random\(\)\*_vfNavList\.length\);\}while\(ni===_vfNavIdx\);/.test(pick), true);
  sc.eq('필터가 없으면 활성 목록 전체에서 무작위(기존 함수 재사용)',
        pick.includes('randomVerseManual();'), true);

  // 순환(반복)은 예전 그대로다
  sc.eq('필터+순환이면 순서대로',
        fn.includes('_vfNavIdx=(_vfNavIdx+(d>0?1:-1)+_vfNavList.length)%_vfNavList.length;'), true);
  sc.eq('필터 없고 순환이면 예전 그대로 성경순 다음/이전',
        fn.includes('if(d>0)nextVerseManual();else prevVerseManual();'), true);
}

// ═══ 5-2. 셔플의 '뒤로' = 방금 본 말씀 (v26-0831-19, HB) ═══
console.log('\n시나리오 5-2 — 셔플에서 뒤로 가면 방금 본 말씀');
{
  // HB — "다음말씀은 랜덤이지만, 이전말씀은 랜덤 말고 방금 봤던 말씀이 나오게"
  const fn = slice('function _vfNavCommit(d){', 'function _vfShufPickRandom');
  sc.eq('앞으로 갈 때 자취를 쌓는다', fn.includes('_vfShufPush(_vfShufBack,here);'), true);
  sc.eq('뒤로 갈 때 자취를 되짚는다',
        fn.includes('if(_vfShufBack.length&&_vfShufGo(_vfShufBack[_vfShufBack.length-1])){'), true);
  sc.eq('되짚은 자리는 앞으로 자취에 쌓는다', fn.includes('_vfShufPush(_vfShufFwd,here);'), true);
  sc.eq('다시 앞으로 가면 그 자리로', fn.includes('if(_vfShufFwd.length&&_vfShufGo(_vfShufFwd[_vfShufFwd.length-1])){'), true);
  sc.eq('자취가 없으면 예전처럼 무작위', fn.includes('_vfShufPickRandom();'), true);

  // ⚠️ 새 저장 항목을 만들지 않는다 — 화면을 닫으면 사라지는 값이다
  sc.eq('저장 항목을 만들지 않는다', SRC.includes('ST.vfShufHist'), false);
  sc.eq('걸음 수에 상한이 있다', SRC.includes('const _VF_SHUF_MAX=30;'), true);
  sc.eq('상한을 넘으면 앞에서 버린다',
        SRC.includes('if(stack.length>_VF_SHUF_MAX)stack.shift();'), true);
  // ⚠️ 보던 목록이 바뀌면 자취를 버린다 (다른 목록의 자리를 쓰면 엉뚱해진다)
  sc.eq('목록이 바뀌면 자취를 버린다',
        /function _vfSetNav\(list,idx,label,kind,atCollection,parts\)\{\s*\n\s*_vfShufReset\(\);/.test(SRC), true);
  sc.eq('목록을 지울 때도 버린다', SRC.includes('function _vfClearNav(){_vfShufReset();'), true);

  // ── 실제로 돌려 본다 ──
  const box = {};
  const src = slice('const _VF_SHUF_MAX=30;', 'function _vfSetNav(');
  new Function('box','ST','setVerseIdx',
    src.replace(/^(?:const|let) /gm,'var ')
    + ';box.pos=_vfShufPos;box.go=_vfShufGo;box.push=_vfShufPush;'
    + 'box.back=()=>_vfShufBack;box.fwd=()=>_vfShufFwd;box.reset=_vfShufReset;'
    + 'box.setNav=(l,i)=>{_vfNavList=l;_vfNavIdx=i;};box.idx=()=>_vfNavIdx;'
    + 'var _vfNavList=null,_vfNavIdx=0,_vfOverrideVerse=null;'
  )(box, {settings:{verseCurrentIdx:7}}, ()=>{});
  box.setNav(['a','b','c'],1);
  sc.eq('목록 안이면 자리를 적는다', box.pos(), {k:'nav',i:1});
  box.push(box.back(), {k:'nav',i:0});
  sc.eq('자취가 쌓인다', box.back().length, 1);
  sc.eq('되짚으면 그 자리로', [box.go({k:'nav',i:2}), box.idx()], [true, 2]);
  // 서른한 걸음을 밀어 넣으면 맨 앞이 밀려난다
  box.reset();
  for(let i=0;i<35;i++)box.push(box.back(),{k:'nav',i});
  sc.eq('서른 걸음까지만 남는다', box.back().length, 30);
  sc.eq('맨 오래된 것부터 버린다', box.back()[0], {k:'nav',i:5});
}

console.log('\n시나리오 5-3 — 알림으로 연 말씀도 자취에 담긴다 (v26-0901-3, HB)');
{
  // HB 신고 — "알림으로 연 전체화면은 다음으로 갔다가 이전으로 돌아오면
  //   실제 이전 명제가 아니라 엉뚱한 것이 나온다."
  // 까닭 — '지금 자리'가 목록 번호 아니면 순번(verseCurrentIdx)뿐이었다.
  //   알림·구절메뉴로 연 화면은 둘 다 아닌 **지정 구절**을 보고 있다.
  sc.eq('지정 구절도 자리로 적는다',
        SRC.includes("if(_vfOverrideVerse)return{k:'ov',v:_vfOverrideVerse};"), true);
  sc.eq('되짚을 때 그 구절로 돌아간다',
        /if\(p\.k==='ov'\)\{[\s\S]{0,120}_vfOverrideVerse=p\.v;/.test(SRC), true);
  // ⚠️ 새 저장 항목이 아니다 — 화면을 닫으면 사라지는 값이다
  sc.eq('저장 항목을 만들지 않는다', SRC.includes('ST.vfShufOv'), false);

  // ── 실제로 돌려 본다 ──
  const box = {};
  const src = slice('const _VF_SHUF_MAX=30;', 'function _vfSetNav(');
  let setIdxCalls = [];
  new Function('box','ST','setVerseIdx',
    src.replace(/^(?:const|let) /gm,'var ')
    + ';box.pos=_vfShufPos;box.go=_vfShufGo;'
    + 'box.setOv=v=>{_vfOverrideVerse=v;};box.ov=()=>_vfOverrideVerse;'
    + 'var _vfNavList=null,_vfNavIdx=0,_vfOverrideVerse=null;'
  )(box, {settings:{verseCurrentIdx:7}}, i=>setIdxCalls.push(i));

  // 알림으로 연 상황 — 목록은 없고 지정 구절만 있다
  const prop = {pid:'P0007', ref:'전도서 3:1', hi:'때가 있다'};
  box.setOv(prop);
  const here = box.pos();
  sc.eq('지정 구절이 자리가 된다', here.k, 'ov');
  // 앞으로 넘겨 다른 것을 본 뒤…
  box.setOv({pid:'P0099'});
  // 뒤로 되짚으면 **그 명제 그대로** 돌아온다
  sc.eq('되짚으면 성공', box.go(here), true);
  sc.eq('바로 그 명제다', box.ov(), prop);
  sc.eq('순번은 건드리지 않는다', setIdxCalls.length, 0);

  // 지정 구절이 없으면 예전 그대로 순번을 쓴다 (말씀 화면은 안 달라진다)
  box.setOv(null);
  sc.eq('평소엔 예전 그대로', box.pos(), {k:'seq',idx:7});
  sc.eq('되짚으면 순번으로', [box.go({k:'seq',idx:3}), setIdxCalls], [true,[3]]);
}

console.log('\n시나리오 4-1 — 위아래 이동 영역과 화살표가 대칭이다');
{
  sc.eq('위아래 버튼은 각각 화면 높이 1/4',
        /\.vf-nav\{[\s\S]{0,100}height:25%;/.test(SRC), true);
  sc.eq('두 화살표는 같은 크기와 선으로 그린다',
        /\.vf-nav i\{[\s\S]{0,180}width:14px;height:14px;[\s\S]{0,180}border-top:1\.5px solid/.test(SRC), true);
  sc.eq('위 화살표 각도', SRC.includes('.vf-nav-u i{transform:rotate(-45deg);}'), true);
  sc.eq('아래 화살표 각도', SRC.includes('.vf-nav-d i{transform:rotate(135deg);}'), true);
  sc.eq('버튼 영역 호버가 화살표를 밝힌다', SRC.includes('.vf-nav:hover i{opacity:.8;}'), true);
}

console.log('\n시나리오 6 — randomVerseManual 은 활성 모음(말씀설정) 전체를 쓴다');
{
  // ⚠️ "필터가 없을 때는 말씀모음 설정에서 정해 놓은 목록 안에서" — 그 목록이
  //    바로 ACTIVE_VERSES() (getActiveColls 로 켠 모음들의 필터된 구절)다.
  const fn = slice('function randomVerseManual(){', 'function toggleVerseBarOn');
  sc.eq('ACTIVE_TOTAL (=ACTIVE_VERSES 길이) 안에서 고른다', fn.includes('ACTIVE_TOTAL()'), true);
  sc.eq('직전과 같은 구절은 다시 안 뽑는다(구절 2개 이상일 때)',
        fn.includes('idx===ST.settings.verseCurrentIdx&&ACTIVE_TOTAL()>1'), true);
}

console.log('\n시나리오 7 — PC 말씀영역(vb-shuffle) 아이콘도 같은 디자인으로 교체');
{
  sc.eq('vb-shuffle 버튼이 새 셔플 아이콘을 쓴다',
        /class="vb-shuffle"[\s\S]{0,220}<svg width="13" height="13" viewBox="0 0 24 24"[\s\S]{0,220}<path d="M3 7h5c4 0 4 10 8 10h4"\/>/.test(SRC), true);
  sc.eq('vb-shuffle 화살촉도 위아래 다 있는 작은 V',
        SRC.includes('<path d="M18 15l2 2-2 2"/><path d="M18 5l2 2-2 2"/></svg></button></div>'), true);
  sc.eq('예전 두 줄짜리 갈매기형 아이콘은 없앴다',
        SRC.includes('<path d="M4 5h4l8 10h4"/><path d="M4 15h4l2.5-3.1"/>'), false);
  // 로직(vbShuffleVerse) 자체는 안 건드렸다 — 아이콘만 바꾼 것
  sc.eq('클릭 동작은 그대로 vbShuffleVerse', SRC.includes('onclick="event.stopPropagation();vbShuffleVerse()"'), true);
}

sc.done();
