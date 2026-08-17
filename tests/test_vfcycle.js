// 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3)
//
// '순환' = 지금까지의 기본 동작 — 필터(타일뷰에서 들어옴)가 있으면 그 목록
// 순서대로, 없으면 성경순(ACTIVE_VERSES idx) 다음/이전.
// '셔플' = 필터가 있으면 그 필터 안에서, 없으면 말씀모음 설정의 활성 목록
// 전체(randomVerseManual, ACTIVE_VERSES 기준)에서 무작위.
//
// 아이콘은 HB 가 스케치로 확정한 모양 그대로(사각 테두리 없음, 화살촉은
// 위·아래 절반 선 하나씩). 필터 이름(vfTopLabel)이 떠 있으면 그 아래로,
// 없으면 원래 자리 그대로.
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
  sc.eq('셔플이면 강조색 클래스', fn.includes("btn.classList.toggle('vf-cycle-shuffle',shuffle);"), true);
  // v26-0817-17 — HB 재조정: 아이콘 더 작게(15px), 선도 더 얇게(1.4)
  sc.eq('아이콘은 사각 테두리 없이 선만',
        SRC.includes('const _VF_CYCLE_SVG=\'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"'), true);
  sc.eq('셔플 아이콘도 같은 스타일',
        SRC.includes('const _VF_SHUFFLE_SVG=\'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"'), true);
  // ⚠️ 0817-16 에선 화살촉을 한 줄(상단 절반)만 썼는데, HB 가 "위아래 둘 다
  //    완성해 달라"고 다시 요청해 작은 V 로 되돌렸다 — 다리 길이(2,2)는 그대로.
  sc.eq('셔플 화살촉은 위아래 다 있는 작은 V',
        SRC.includes('<path d="M18 15l2 2-2 2"/><path d="M18 5l2 2-2 2"/>'), true);
  // 순환 아이콘 오른쪽 아래 코너 — 예전엔 path 를 둘로 쪼개 그 코너에
  // linejoin 이 안 걸렸다. 한 path 로 이어 그려 stroke-linejoin:round 가
  // 그 코너도 감싸게 했다.
  sc.eq('순환 오른쪽 아래까지 한 path 로 이어 그린다',
        SRC.includes('<path d="M4 15V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v7h-9"/>'), true);
}

console.log('\n시나리오 4 — 필터 이름이 있으면 그 아래로 내려간다');
{
  const sync = slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse');
  sc.eq('필터 표시 여부(on)로 below 클래스를 정한다',
        sync.includes("cb.classList.toggle('vf-cycle-below',on);"), true);
  sc.eq('맞출 때마다 아이콘도 같이 맞춘다', sync.includes('_vfSyncCycleIcon();'), true);

  sc.eq('CSS — 기본 자리', /\.vf-cycle\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 14px\)/.test(SRC), true);
  sc.eq('CSS — 라벨 있을 때 더 내려간다',
        /\.vf-cycle\.vf-cycle-below\{top:calc\(env\(safe-area-inset-top,0px\) \+ 34px\)/.test(SRC), true);
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
