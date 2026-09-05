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
  // v26-0905-2, HB — 말씀 모음 설정에 비해 작아 보여 17×20 → 19×23 으로 키웠다
  // (세로가 가로보다 긴 비율 20:24 는 그대로).
  sc.eq('책갈피는 세로가 긴 비율 그대로 조금 커졌다', SRC.includes("const _VF_KEEP_MENU_SVG='<svg width=\"19\" height=\"23\""), true);
  // ⚠️ 상수와 화면의 단추가 **같은 그림**이어야 한다. 상수만 고치면 화면은 안 바뀐다
  //    (지금 이 상수를 쓰는 곳이 따로 없어서, 어긋나도 눈에 안 띈다).
  sc.eq('화면의 책갈피 단추도 같은 크기',
        (SRC.match(/<svg width="19" height="23" viewBox="0 0 20 24"/g)||[]).length, 2);
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
  // ⚠️⚠️ v26-0905-2, HB 신고 — "필터가 꺼져 전체가 됐는데 홈 단추가 채워지지
  //    않고 **사라진다.**" 화면을 맞추는 곳은 _vfSyncTopBar 하나뿐인데, 바로 위
  //    _vfClearNav() 안에서 그것이 이미 한 번 돌아 버린다. 그때는 _vfHomeAtCollection
  //    이 아직 false 라 단추를 감추고, 그 다음 줄에서 값만 true 로 되돌리니
  //    값은 맞는데 단추는 숨은 채로 남았다. → 값을 정한 **뒤에** 다시 맞춘다.
  sc.eq('채운 상태로 바꾼 뒤 윗줄을 다시 맞춘다',
        action.indexOf('_vfSyncTopBar();') > action.indexOf('_vfHomeAtCollection=true;'), true);
  sc.eq('_vfClearNav 가 부르는 것만 믿지 않는다', action.includes('_vfSyncTopBar();'), true);
  // 홈 아이콘도 말씀 모음 설정에 견줘 작아 보여 17 → 21 로 키웠다 (v26-0905-2, HB).
  // ⚠️ 아웃라인과 채움이 **같은 크기**여야 한다 — 다르면 필터를 풀 때 아이콘이 튄다.
  sc.eq('홈 아이콘이 조금 커졌다',
        (SRC.match(/_VF_HOME(?:_FILLED)?_SVG='<svg width="21" height="21" viewBox="0 0 20 20"/g)||[]).length, 2);
  sc.eq('홈은 좌상단 첫 자리다', /\.vf-home\{[^}]*left:14px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)/.test(SRC), true);
  sc.eq('순환·셔플은 홈 오른쪽 자리다', /\.vf-cycle\{[\s\S]{0,120}left:52px;top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)/.test(SRC), true);
  sc.eq('홈 색은 순환·셔플과 같다', /\.vf-home\{[^}]*color:var\(--vf-tx,var\(--tx\)\);opacity:\.2/.test(SRC), true);
  sc.eq('말씀 모음 전체를 보는 위젯은 처음부터 채운 홈 상태를 넘긴다',
        SRC.includes('_vfSetNav(list,Math.max(0,keys.indexOf(ref)),_vcScopeLabel(sc),\n              _vcScopeIsHome(sc)?null:(sc.ks[0]||\'keep\'),_vcScopeIsHome(sc),_vcScopeParts(sc));'), true);
  const cardOpen = slice('function vcOpenFull(id){', 'function _vcUnplacedForKind');
  sc.eq('카드 모습으로 연 위젯도 범위가 말씀 모음 전체면 채운 홈 상태를 넘긴다',
        cardOpen.includes("_vcScopeIsHome(sc)?null:(sc.ks[0]||'keep'),_vcScopeIsHome(sc)"), true);
}

// ═══ 3-2. 실제로 눌러 본다 (v26-0905-2) ═══
// ⚠️ 위 시나리오는 "코드가 그렇게 생겼는가" 를 볼 뿐이다. 이 버그는 **부르는
//    차례** 때문에 났으므로, 진짜로 함수를 돌려 단추가 어떤 꼴이 되는지 본다.
console.log('\n시나리오 3-2 — 홈을 눌렀을 때 단추가 실제로 어떻게 되는가');
{
  const asVar = t => t.replace(/^(?:const|let) /gm, 'var ');
  // 화면 대신 쓸 가짜 요소들. 홈 단추만 진짜로 들여다본다.
  const hb = { style:{display:''}, innerHTML:'', setAttribute(){} };
  const dummy = { style:{display:''}, innerHTML:'', classList:{ add(){}, remove(){}, contains:()=>false, toggle(){} },
                  onclick:null, contains:()=>false, scrollTop:0, querySelectorAll:()=>[] };
  global.document = { getElementById: id => (id==='vfHomeBtn'?hb:(id==='vfTopLabel'?null:dummy)),
                      addEventListener(){} };
  global._VLIST_KIND_TITLE = { keep:'저장', like:'좋아요' };
  global._rollHTML=()=>''; global._rollFit=()=>{}; global._rollStart=()=>{};
  global._vfShufReset=()=>{};
  // ⚠️ 순환·셔플 아이콘은 이 시험의 관심사가 아니다. 진짜를 끌어오면 ST 까지
  //    딸려 와야 해서 가짜로 둔다 — 다만 _vfSyncTopBar 가 이것을 부르므로
  //    **함수 선언이 이것을 덮어쓰지 않도록** 아래 eval 범위를 좁게 잡는다.
  global._vfSyncCycleIcon=()=>{};
  global.closeVfKeepSwitch=()=>{}; global._verseFullRender=()=>{}; global.showToast=()=>{};
  global._vfOverrideVerse=null; global._vfHomeAtCollection=false;
  global._vfNavList=null; global._vfNavIdx=0; global._vfNavLabel=''; global._vfNavParts=null; global._vfNavKind=null;

  const one = (mark) => SRC.slice(SRC.indexOf(mark), SRC.indexOf('\n', SRC.indexOf(mark))+1);
  eval(asVar(one("const _VF_HOME_SVG=")));
  eval(asVar(one("const _VF_HOME_FILLED_SVG=")));
  eval(asVar(slice('function _vfSetNav(list,idx,label,kind,atCollection,parts){', 'function _vfClearNav')));
  eval(asVar(one('function _vfClearNav()')));
  eval(asVar(slice('function vfHomeAction(){', 'function vfOpenCollSettings')));
  eval(asVar(slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse')));

  // ① 필터(목록) 안에 들어와 있다 — 선 홈이 보인다
  _vfSetNav([{ref:'요 3:16'}], 0, '좋아요', 'like', false);
  sc.eq('필터 안 — 홈이 보인다', hb.style.display, 'flex');
  sc.eq('필터 안 — 선 홈이다', hb.innerHTML === _VF_HOME_SVG, true);

  // ② 홈을 누른다 → 필터가 풀리고 말씀 모음 전체가 된다
  vfHomeAction();
  // ⚠️⚠️ 여기가 HB 가 신고한 자리다. 고치기 전에는 display 가 'none' 이었다 —
  //    _vfClearNav() 안에서 윗줄이 이미 한 번 맞춰지고, 그 뒤에 값만 true 로
  //    되돌렸기 때문이다.
  sc.eq('홈을 누른 뒤 — 단추가 사라지지 않는다', hb.style.display, 'flex');
  sc.eq('홈을 누른 뒤 — 채운 홈이다', hb.innerHTML === _VF_HOME_FILLED_SVG, true);
  sc.eq('홈을 누른 뒤 — 필터는 실제로 풀렸다', _vfNavList, null);

  // ③ 다시 필터로 들어가면 선 홈으로 돌아간다 (한쪽으로 굳지 않는다)
  _vfSetNav([{ref:'롬 5:8'}], 0, '저장함', 'keep', false);
  sc.eq('다시 필터 안 — 선 홈으로 돌아온다', hb.innerHTML === _VF_HOME_SVG, true);
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
