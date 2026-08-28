// 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3)
//
// '순환' = 지금까지의 기본 동작 — 필터(타일뷰에서 들어옴)가 있으면 그 목록
// 순서대로, 없으면 성경순(ACTIVE_VERSES idx) 다음/이전.
// '셔플' = 필터가 있으면 그 필터 안에서, 없으면 말씀모음 설정의 활성 목록
// 전체(randomVerseManual, ACTIVE_VERSES 기준)에서 무작위.
//
// 아이콘은 HB 가 스케치로 확정한 모양 그대로다. 닫기와 함께 30×30이며,
// 태그 그림과 같은 색·투명도로 좌우 대칭인 상단 자리에 놓인다.
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
  // 선 굵기(1.4)는 유지하고 아이콘·버튼 크기를 30px로 통일한다.
  sc.eq('아이콘은 사각 테두리 없이 선만',
        SRC.includes('const _VF_CYCLE_SVG=\'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"'), true);
  sc.eq('셔플 아이콘도 같은 스타일',
        SRC.includes('const _VF_SHUFFLE_SVG=\'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"'), true);
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
  sc.eq('순환·셔플 버튼은 좌상단 30×30',
        /\.vf-cycle\{[\s\S]{0,180}left:14px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);[\s\S]{0,100}width:30px;height:30px/.test(SRC), true);
  sc.eq('닫기 버튼은 우상단 30×30',
        /\.vf-close\{[\s\S]{0,180}top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);right:14px;[\s\S]{0,120}width:30px;height:30px/.test(SRC), true);
  sc.eq('두 버튼은 태그 그림과 같은 색·기본 투명도',
        (SRC.match(/color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/g)||[]).length >= 3, true);
  sc.eq('모바일도 태그 그림과 같은 투명도',
        SRC.includes('@media(hover:none){.vf-cycle,.vf-close{opacity:.3;}}'), true);
  sc.eq('필터가 있어도 버튼을 아래로 내리지 않는다', SRC.includes('vf-cycle-below'), false);
  sc.eq('전체 목록 버튼은 좌측 버튼과 겹치지 않는다', SRC.includes('.vf-home{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);left:52px;'), true);
}

console.log('\n시나리오 4 — 아이콘과 버튼이 모두 30×30이다');
{
  sc.eq('닫기 X 아이콘 30×30', SRC.includes('<svg width="30" height="30" viewBox="0 0 20 20"'), true);
  sc.eq('테두리·박스 없다', /\.vf-cycle\{[^}]*background:none;border:none/.test(SRC), true);
}

console.log('\n시나리오 5 — 넘길 때 순환/셔플이 갈린다 (핵심 로직)');
{
  const fn = slice('function _vfNavCommit(d){', 'function verseFullNav');
  sc.eq('지금 모드를 한 번만 읽어 둔다', fn.includes("const shuffle=_vfCycleMode()==='shuffle';"), true);

  // 필터(타일뷰 목록) 있는 경우
  sc.eq('필터+셔플이면 목록 안에서 무작위', fn.includes('if(shuffle&&_vfNavList.length>1){'), true);
  sc.eq('직전과 같은 자리는 다시 안 뽑는다', /do\{ni=Math\.floor\(Math\.random\(\)\*_vfNavList\.length\);\}while\(ni===_vfNavIdx\);/.test(fn), true);
  sc.eq('필터+순환이면 예전 그대로 순서대로',
        fn.includes('_vfNavIdx=(_vfNavIdx+(d>0?1:-1)+_vfNavList.length)%_vfNavList.length;'), true);

  // 필터 없는 경우 (else 갈래)
  sc.eq('필터 없고 셔플이면 활성 목록 전체에서 무작위(기존 함수 재사용)',
        fn.includes('if(shuffle)randomVerseManual();')||/if\(shuffle\)randomVerseManual\(\);/.test(fn), true);
  sc.eq('필터 없고 순환이면 예전 그대로 성경순 다음/이전',
        fn.includes('else if(d>0)nextVerseManual();else prevVerseManual();'), true);
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
