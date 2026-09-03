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

console.log('\n시나리오 3 — 전체화면 햄버거에서 폴더를 바꾼다');
{
  const action = slice('function vfHomeAction(){', 'function _vfSyncTopBar');
  sc.eq('저장 목록이면 뒤로 가지 않고 폴더 메뉴를 연다', action.includes("if(_vfNavKind==='keep'){toggleVfKeepSwitch();return;}"), true);
  sc.eq('폴더 선택은 해당 폴더 항목으로 내비게이션을 다시 만든다', action.includes("_vfSetNav(list,i,name,'keep')"), true);
  sc.eq('햄버거 색은 순환·닫기와 같은 전체화면 전경색이다', /\.vf-home\{[^}]*color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/.test(SRC), true);
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

sc.done();
