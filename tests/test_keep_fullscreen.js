const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 폴더 팝업과 전체화면 제목은 아이콘 없이 폴더 이름이다');
{
  const popup = slice('function _vAggSyncKeepTitle(){', 'function _keepNameKey');
  sc.eq('폴더 팝업 제목에서 책갈피를 쓰지 않는다', popup.includes('_VLIST_KIND_TITLE.keep'), false);
  const open = slice('function _vliOpenFull(ref,kind){', 'function vliAction');
  sc.eq('저장 목록 전체화면에는 폴더 이름을 넘긴다', open.includes("if(kind==='keep')_vfSetNav(list,i,window._vAggKeepList||'',kind);"), true);
  const sync = slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse');
  sc.eq('저장 목록 제목에서는 종류 아이콘을 생략한다', sync.includes("_vfNavKind&&_vfNavKind!=='keep'?_VLIST_KIND_TITLE[_vfNavKind]:''"), true);
}

console.log('\n시나리오 2 — 전체화면이 아래의 폴더 메뉴까지 숨겼다가 복원한다');
{
  const hide = slice('function _vfHideCovers(){', 'function closeVerseFull');
  sc.eq('좌상단 메뉴와 덮개를 숨김 명단에 넣는다', hide.includes("['logoMenuOverlay','logoMenu']"), true);
  sc.eq('숨긴 display 값을 복원한다', hide.includes('jobs.push(()=>{el.style.display=d;});'), true);
}

console.log('\n시나리오 3 — 모든 전체화면의 책갈피에서 폴더를 바꾼다');
{
  const action = slice('function toggleVfKeepSwitch(){', 'function _vfKeepNav');
  sc.eq('어느 진입 경로에서든 폴더 메뉴를 연다', SRC.includes('id="vfKeepMenuBtn" onclick="event.stopPropagation();toggleVfKeepSwitch()"'), true);
  sc.eq('폴더 선택은 해당 폴더 항목으로 내비게이션을 다시 만든다', SRC.includes("_vfSetNav(list,i,name,'keep')"), true);
  sc.eq('책갈피 색은 순환·닫기와 같은 전체화면 전경색이다', /\.vf-keepmenu\{[^}]*color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/.test(SRC), true);
  // v26-0904-4, HB — 순환·셔플(12) 과 책갈피(88) 사이에 '말씀 모음 설정'(50) 이
  // 들어왔다. 책갈피는 그만큼 아래로 내려갔다.
  sc.eq('책갈피는 말씀 모음 설정 아래에 놓인다', /\.vf-keepmenu\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 88px\);left:14px/.test(SRC), true);
  sc.eq('진입 경로와 무관하게 책갈피를 표시한다', SRC.includes('id="vfKeepMenuBtn"'), true);
  sc.eq('책갈피는 가로를 유지하고 세로를 약 1.2배 늘린다', SRC.includes("const _VF_KEEP_MENU_SVG='<svg width=\"17\" height=\"20\""), true);
  sc.eq('책갈피 획은 이전보다 얇은 1.2다', /_VF_KEEP_MENU_SVG=.*stroke-width=\"1\.2\"/.test(SRC), true);
}

console.log('\n시나리오 3-1 — 홈은 필터를 풀어 말씀 모음 전체로 돌아간다');
{
  const action = slice('function vfHomeAction(){', 'function vfOpenCollSettings');
  sc.eq('필터 목록을 비운다', action.includes('_vfClearNav();'), true);
  sc.eq('지정 말씀도 비운다', action.includes('_vfOverrideVerse=null;'), true);
  sc.eq('전체화면을 곧바로 다시 그린다', action.includes('_verseFullRender();'), true);
  const sync = slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse');
  sc.eq('필터·지정 말씀 또는 홈 복귀 상태일 때 홈을 보인다',
        sync.includes("hb.style.display=(_vfNavList||_vfOverrideVerse||_vfHomeAtCollection)?'flex':'none';"), true);
  sc.eq('필터 안에서는 선 홈, 말씀 모음 전체에서는 채운 홈',
        sync.includes('hb.innerHTML=_vfHomeAtCollection?_VF_HOME_FILLED_SVG:_VF_HOME_SVG;'), true);
  sc.eq('홈을 누르면 채운 상태를 남긴다', action.includes('_vfHomeAtCollection=true;'), true);
  sc.eq('홈은 좌상단 첫 자리다', /\.vf-home\{[^}]*left:14px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)/.test(SRC), true);
  sc.eq('순환·셔플은 홈 오른쪽 자리다', /\.vf-cycle\{[\s\S]{0,120}left:52px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)/.test(SRC), true);
  sc.eq('홈 색은 순환·셔플과 같다', /\.vf-home\{[^}]*color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/.test(SRC), true);
  sc.eq('말씀 모음 전체를 보는 위젯은 처음부터 채운 홈 상태를 넘긴다',
        SRC.includes('_vfSetNav(list,Math.max(0,keys.indexOf(ref)),_vcScopeLabel(sc),\n              _vcScopeIsHome(sc)?null:(sc.ks[0]||\'keep\'),_vcScopeIsHome(sc));'), true);
  const cardOpen = slice('function vcOpenFull(id){', 'function _vcUnplacedForKind');
  sc.eq('카드 모습으로 연 위젯도 범위가 말씀 모음 전체면 채운 홈 상태를 넘긴다',
        cardOpen.includes("_vcScopeIsHome(sc)?null:(sc.ks[0]||'keep'),_vcScopeIsHome(sc)"), true);
}

console.log('\n시나리오 4 — 중앙 폴더 이름에서 그 폴더 타일뷰를 연다');
{
  const sync = slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse');
  sc.eq('저장 목록 제목에 타일뷰 동작을 연결한다', sync.includes('lb.onclick=(on&&_vfNavKind===\'keep\')?vfOpenKeepGrid:null;'), true);
  const pool = slice('function _vgFilteredPool(){', 'function _vgHomeLabel');
  sc.eq('저장 폴더 기록만 타일 풀로 만든다', pool.includes("(_vgState.kind==='keep')"), true);
  const pick = slice('function vgPick(i){', 'function vgTapDateSort');
  sc.eq('타일 선택 뒤에도 저장 폴더 문맥을 유지한다', pick.includes("_vgState.kind==='keep'?'keep':null"), true);
}

console.log('\n시나리오 5 — 저장 폴더 메뉴는 차분히 열리고 바깥을 누르면 닫힌다');
{
  sc.eq('메뉴의 열린 상태에 투명도와 이동 전환이 있다', /\.vf-keep-switch\.open\{opacity:1;transform:translateY\(0\) scale\(1\)/.test(SRC), true);
  const action = slice('function closeVfKeepSwitch(){', 'function _vfKeepNav');
  sc.eq('메뉴 버튼 재탭은 열린 클래스를 닫는다', action.includes("box.classList.remove('open')"), true);
  sc.eq('메뉴와 버튼 밖 pointerdown은 메뉴를 닫는다', action.includes("!box.contains(e.target)&&!(btn&&btn.contains(e.target))"), true);
  sc.eq('설명 헤더 없이 정렬 탭 네 개를 바로 그린다', !action.includes('저장 목록 정렬')&&action.includes("tab('alpha'")&&action.includes("tab('count'")&&action.includes("tab('manual'"), true);
  sc.eq('정렬할 때 열린 메뉴를 닫고 다시 열지 않는다', action.includes('function _vfRenderKeepSwitch')&&!action.includes("classList.remove('open');requestAnimationFrame(()=>toggleVfKeepSwitch())"), true);
  const lock = slice('function _menuLockScroll(el){', 'function openLogoMenu');
  sc.eq('메뉴 터치와 휠이 뒤 전체화면으로 전파되지 않는다', lock.includes('e.stopPropagation();')&&lock.includes("addEventListener('wheel',e=>e.stopPropagation()"), true);
}

console.log('\n시나리오 6 — 저장 목록은 꺼진 모음과 하위 필터 밖의 명제도 찾는다');
{
  const all = slice('function getCustomVerses(){', 'function VERSE_TOTAL');
  sc.eq('모든 등록 모음에서 삭제되지 않은 항목을 읽는다', all.includes('(ST.verseCollections||[]).forEach(c=>')&&all.includes('if(!v.del)'), true);
  sc.eq('전체 등록 풀에도 명제 ID와 표시 정보를 보존한다', all.includes("pid:c.pid||''")&&all.includes('books:c.books||[]')&&all.includes('refs:c.refs||[]'), true);
  const find = slice('function _findVerseByRefLoose(ref){', 'function _dupVerseScan');
  sc.eq('활성 모음에서 못 찾으면 전체 등록 풀의 명제 ID를 찾는다', find.includes("(ALL_VERSES()||[]).find(v=>v&&v.pid===want)"), true);
}

sc.done();
