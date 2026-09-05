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
  // ⚠️ v26-0905-4, HB — 선 굵기는 이제 **화면에 찍히는 1.35px** 로 통일한다.
  //    책갈피는 배율 0.95 라 1.42 여야 1.35 가 된다 (test_vf_top.js 가 넷을 함께 지킨다).
  sc.eq('책갈피 획은 통일된 굵기다', /_VF_KEEP_MENU_SVG=.*stroke-width=\"1\.42\"/.test(SRC), true);
}

console.log('\n시나리오 3-1 — 홈은 필터를 풀어 말씀 모음 전체로 돌아간다');
{
  const action = slice('function vfHomeAction(){', 'function vfOpenCollSettings');
  sc.eq('필터 목록을 비운다', action.includes('_vfClearNav();'), true);
  sc.eq('지정 말씀도 비운다', action.includes('_vfOverrideVerse=null;'), true);
  sc.eq('전체화면을 곧바로 다시 그린다', action.includes('_verseFullRender();'), true);
  const sync = slice('function _vfSyncTopBar(){', 'function _vfCurrentVerse');
  // ⚠️⚠️ v26-0905-4, HB — "채운 홈이 **어떤 동작 뒤에** 나오도록 짜지 말고,
  //    설정한 대로인 상황이면 언제나 나오게." 그래서 이제 상태를 기억하지 않고
  //    _vfAtCollection() 이 그때그때 판정한다. 단추는 **늘 보인다.**
  sc.eq('홈은 늘 보인다', sync.includes("hb.style.display='flex';"), true);
  sc.eq('채움 여부는 그때그때 판정한다', sync.includes('const atColl=_vfAtCollection();'), true);
  sc.eq('필터 안에서는 선 홈, 말씀 모음 전체에서는 채운 홈',
        sync.includes('hb.innerHTML=atColl?_VF_HOME_FILLED_SVG:_VF_HOME_SVG;'), true);
  // 판정은 "걸러 놓은 목록도 없고 지정 구절도 없다" 이다. 말씀카드처럼 '모음
  // 전체'를 목록으로 들고 들어오는 길만 _vfHomeAtCollection 으로 알려 준다.
  const at = slice('function _vfAtCollection(){', '\nfunction vfHomeAction(){');
  sc.eq('목록도 지정 구절도 없으면 모음 그대로다',
        at.includes('!(_vfNavList&&_vfNavList.length) && !_vfOverrideVerse'), true);
  sc.eq('위젯이 넘겨 준 표시도 인정한다', at.includes('!!_vfHomeAtCollection ||'), true);
  // ⚠️ 홈 누름 함수는 이제 표시를 손으로 켜지 않는다 — 그 손댐이 0905-2 버그의
  //    뿌리였다 (값만 켜고 화면은 안 맞춰서 단추가 숨은 채로 남았다).
  sc.eq('홈을 눌러도 표시를 손으로 켜지 않는다', action.includes('_vfHomeAtCollection=true;'), false);
  // 홈 아이콘 크기 — 0905-2 에서 21 로 키웠다가 HB 가 "그 사이 정도" 라 하여 19 (0905-4).
  // ⚠️ 아웃라인과 채움이 **같은 크기**여야 한다 — 다르면 필터를 풀 때 아이콘이 튄다.
  sc.eq('홈 아이콘은 19 다',
        (SRC.match(/_VF_HOME(?:_FILLED)?_SVG='<svg width="19" height="19" viewBox="0 0 20 20"/g)||[]).length, 2);
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
  global._vfHomeBack=null;   // 실제 코드에서는 _vfSetNav 바로 위에서 선언된다

  const one = (mark) => SRC.slice(SRC.indexOf(mark), SRC.indexOf('\n', SRC.indexOf(mark))+1);
  eval(asVar(one("const _VF_HOME_SVG=")));
  eval(asVar(one("const _VF_HOME_FILLED_SVG=")));
  eval(asVar(slice('function _vfSetNav(list,idx,label,kind,atCollection,parts){', 'function _vfClearNav')));
  eval(asVar(one('function _vfClearNav()')));
  eval(asVar(slice('function _vfAtCollection(){', 'function _vfHomeStash(){')));
  eval(asVar(slice('function _vfHomeStash(){', 'function vfOpenCollSettings')));
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

  // ④ ⚠️⚠️ v26-0905-4, HB 신고 — "상단 말씀영역을 더블탭해 전체화면으로 들어오면
  //    설정한 모음 그대로인데도 홈이 사라져 있다." 그 길(openVerseFull)은
  //    _vfOverrideVerse 를 비우고 _vfClearNav() 만 부른다. 홈을 **누른 적이 없어**
  //    예전 표시(_vfHomeAtCollection)는 계속 false 였고, 그래서 단추가 숨었다.
  //    → 이제는 상태만 보고 판정하므로 누른 적이 없어도 채운 홈이 나온다.
  _vfOverrideVerse=null;
  _vfClearNav();                      // openVerseFull() 이 하는 그대로
  sc.eq('더블탭으로 그냥 들어와도 — 단추가 보인다', hb.style.display, 'flex');
  sc.eq('더블탭으로 그냥 들어와도 — 채운 홈이다', hb.innerHTML === _VF_HOME_FILLED_SVG, true);

  // ⑤ 지정 구절 하나만 띄운 경우는 '모음 그대로'가 아니다 → 선 홈
  _vfOverrideVerse={ref:'시 23:1'};
  _vfSyncTopBar();
  sc.eq('지정 구절을 띄운 중 — 선 홈', hb.innerHTML === _VF_HOME_SVG, true);

  // ⑥ 말씀카드처럼 '모음 전체'를 목록으로 들고 들어온 경우 → 채운 홈
  _vfOverrideVerse=null;
  _vfSetNav([{ref:'요 3:16'},{ref:'롬 5:8'}], 0, '말씀 모음', null, true);
  sc.eq('모음 전체를 목록으로 들고 와도 — 채운 홈', hb.innerHTML === _VF_HOME_FILLED_SVG, true);

// ── 3-3. 홈은 스위치처럼 오간다 (v26-0905-5, HB) ──
// HB — "홈버튼 눌러서 활성화되고 필터링이 해제됐을 때, 다시 누르면 직전
//       필터링을 다시 적용해 줘."
  console.log('\n시나리오 3-3 — 홈을 다시 누르면 직전 필터로 되돌아간다');
  const LIST=[{ref:'요 3:16'},{ref:'롬 5:8'},{ref:'시 23:1'}];
  _vfHomeBack=null;
  _vfOverrideVerse=LIST[1];
  _vfSetNav(LIST, 1, '좋아요', 'like', false);
  sc.eq('필터 안 — 선 홈', hb.innerHTML === _VF_HOME_SVG, true);

  // ① 한 번 누른다 → 필터가 풀리고 채운 홈
  vfHomeAction();
  sc.eq('한 번 누름 — 필터가 풀렸다', _vfNavList, null);
  sc.eq('한 번 누름 — 지정 구절도 놓았다', _vfOverrideVerse, null);
  sc.eq('한 번 누름 — 채운 홈', hb.innerHTML === _VF_HOME_FILLED_SVG, true);
  sc.eq('한 번 누름 — 되돌아갈 곳을 적어 뒀다', !!_vfHomeBack, true);

  // ② 다시 누른다 → 놓아둔 그 필터로 정확히 되돌아간다
  vfHomeAction();
  sc.eq('다시 누름 — 목록이 돌아왔다', (_vfNavList||[]).length, 3);
  sc.eq('다시 누름 — 보던 자리까지 그대로', _vfNavIdx, 1);
  sc.eq('다시 누름 — 목록 이름도 그대로', _vfNavLabel, '좋아요');
  sc.eq('다시 누름 — 갈래도 그대로', _vfNavKind, 'like');
  sc.eq('다시 누름 — 보던 구절 그대로', _vfOverrideVerse && _vfOverrideVerse.ref, '롬 5:8');
  sc.eq('다시 누름 — 선 홈으로 돌아온다', hb.innerHTML === _VF_HOME_SVG, true);
  // ⚠️ 되돌린 뒤에는 적어 둔 것을 버린다 — 안 버리면 다음 누름이 되돌리기와
  //    풀기 사이에서 헷갈린다. (한 번 더 누르면 다시 '풀기' 여야 한다)
  sc.eq('되돌린 뒤에는 적어 둔 것을 버린다', _vfHomeBack, null);

  // ③ 또 누르면 다시 풀린다 — 오가는 스위치가 된다
  vfHomeAction();
  sc.eq('또 누름 — 다시 풀린다', _vfNavList, null);
  sc.eq('또 누름 — 채운 홈', hb.innerHTML === _VF_HOME_FILLED_SVG, true);

  // ④ 그 사이에 **다른 길로** 새 필터가 들어오면 옛 필터는 버린다
  //    (낡은 필터로 되돌아가면 "왜 이게 나오지?" 가 된다)
  _vfSetNav([{ref:'창 1:1'}], 0, '저장함', 'keep', false);
  sc.eq('새 필터가 들어오면 옛 것을 버린다', _vfHomeBack, null);
  vfHomeAction();                      // 풀기
  vfHomeAction();                      // 되돌리기
  sc.eq('되돌아간 곳은 방금 그 필터다', _vfNavLabel, '저장함');

  // ⑤ 되돌아갈 것이 없는데 누르면 아무 일도 안 난다 (모음 전체 그대로)
  _vfHomeBack=null; _vfOverrideVerse=null; _vfClearNav();
  vfHomeAction();
  sc.eq('되돌아갈 것이 없으면 그대로', _vfNavList, null);
  sc.eq('그때도 채운 홈', hb.innerHTML === _VF_HOME_FILLED_SVG, true);
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
