// v26-0818-1 — 말씀메뉴 정리(1) · 알림탭 정리(2) · 전체화면 롱터치 메뉴(4)
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1-1 — 로고 메뉴 토글 이름 교체');
{
  sc.eq("HTML 기본 라벨이 '상단 말씀 켜기'",
        SRC.includes('<span id="logoMenuToggleLabel">상단 말씀 켜기</span>'), true);
  sc.eq("옛 이름('말씀 표시')은 이 토글 자리에 안 남았다",
        SRC.includes("ST.settings.verseBarOn?'말씀 표시 끄기':'말씀 표시 켜기';"), false);
  sc.eq("켜짐/꺼짐 문구가 새 이름을 쓴다",
        SRC.includes("ST.settings.verseBarOn?'상단 말씀 끄기':'상단 말씀 켜기';"), true);
}

console.log('\n시나리오 1-2 — LIST 항목을 하위 뎁스로');
{
  sc.eq("'LIST' 라벨을 없앴다", SRC.includes('<div class="task-menu-label">LIST</div>'), false);
  sc.eq("'말씀 목록' 진입 항목이 있다",
        SRC.includes('onclick="logoMenuOpenListSub()"') && SRC.includes('말씀 목록'), true);
  // 메인/서브 두 뎁스로 나뉘어 있다
  sc.eq('메인 뎁스 컨테이너', SRC.includes('<div id="logoMenuMain">'), true);
  // v26-0818-9, HB — PC 에서 hover 로 열고 닫으려고 mouseenter/leave 핸들러가 붙었다
  sc.eq('서브 뎁스 컨테이너(처음엔 숨김)',
        SRC.includes('<div id="logoMenuListSub" style="display:none" onmouseenter="_logoMenuSubCancelClose();" onmouseleave="_logoMenuSubScheduleClose();">'), true);
  // 서브 안에 네 항목(아이콘 포함)이 그대로 있다
  const sub = slice('<div id="logoMenuListSub"', '</div>\n</div>');
  ['좋아요','암송','Deeper','Even Deeper'].forEach(label=>{
    sc.eq(`서브에 '${label}' 항목`, sub.includes(label), true);
  });
  sc.eq('서브 항목도 아이콘을 갖고 있다(task-menu-icon 반복)',
        (sub.match(/task-menu-icon/g)||[]).length>=5, true); // 뒤로가기 포함 5개
}

console.log('\n시나리오 1-2 — 뎁스 전환 로직');
{
  const openFn = slice('function logoMenuOpenListSub(){', 'function _logoMenuSubScheduleClose');
  sc.eq('터치 기기는 메인을 숨긴다', openFn.includes("m.style.display='none';"), true);
  sc.eq('PC(마우스)는 메인을 그대로 두고 오른쪽에 띄운다(v26-0818-9, HB)',
        openFn.includes("s.classList.add('task-menu-sub-float');"), true);
  const backFn = slice('function logoMenuBackToMain(){', 'function _tryCloseLogoMenu');
  sc.eq('서브를 숨긴다', backFn.includes("s.style.display='none';"), true);
  sc.eq('메인을 보인다', backFn.includes("m.style.display='';"), true);
  sc.eq('닫을 때 뜬 위치·float 상태도 함께 지운다',
        backFn.includes("s.classList.remove('task-menu-sub-float');"), true);
  const closeFn = slice('function closeLogoMenu(){', 'function logoMenuOpenListSub');
  sc.eq('닫을 때 메인 뎁스로 되돌린다(다음에 열 때 항상 메인부터)',
        closeFn.includes('logoMenuBackToMain();'), true);
}

console.log('\n시나리오 2-1 — 시간 구간 할일 보고 (이름+구분선)');
{
  sc.eq("'시간구간 시작 알림' 이름은 사라졌다", SRC.includes('>시간구간 시작 알림<'), false);
  sc.eq("새 이름 '시간 구간 할일 보고'", SRC.includes('>시간 구간 할일 보고<'), true);
  const notify = slice('id="stab-notify"', '<div class="settings-tab-content" id="stab-view">');
  const i = notify.indexOf('시간 구간 할일 보고');
  const before = notify.slice(Math.max(0,i-360), i);
  sc.eq('그 바로 위에 구분선(div-line)이 있다', before.includes('<div class="div-line"'), true);
}

console.log('\n시나리오 2-2 — 스몰 블럭 포함을 알림 테스트 앞으로');
{
  const notify = slice('id="stab-notify"', '<div class="settings-tab-content" id="stab-view">');
  const iSmall = notify.indexOf('알림에 스몰 블럭 포함');
  const iTest = notify.indexOf('id="notifyTestRow"');
  sc.eq('스몰 블럭 포함이 알림 테스트보다 앞', iSmall>-1 && iTest>-1 && iSmall<iTest, true);
  // 원래 있던 자리(구간 알림 제목 문구 앞)에는 더 이상 없다
  const iSecTitle = notify.indexOf('구간 알림 제목 문구');
  sc.eq('구간 알림 제목 문구보다는 뒤로 옮겨졌다', iSmall>iSecTitle, true);
  const between = notify.slice(iSmall-260, iTest+260);
  sc.eq('스몰 블럭 포함 위에 구분선', (between.match(/<div class="div-line"/g)||[]).length>=2, true);
}

console.log('\n시나리오 4 — 전체화면 롱터치 메뉴: 본문 복사');
{
  sc.eq('메뉴 첫 항목에 id 를 달았다', SRC.includes('id="verseMemMenuFirstItem"'), true);
  sc.eq('openVerseMemMenu 가 네 번째 인자(fromFull)를 받는다',
        SRC.includes('function openVerseMemMenu(anchorEl,secId,atPoint,fromFull){'), true);
  const openFn = slice('function openVerseMemMenu(anchorEl,secId,atPoint,fromFull){', '\n}');
  sc.eq('열 때마다 첫 항목을 그 상태에 맞춰 다시 그린다', openFn.includes('_vmmSyncFirstItem(!!fromFull);'), true);

  const sync = slice('function _vmmSyncFirstItem(fromFull){', 'function openVerseMemMenu');
  sc.eq("전체화면에서 열렸으면 '본문 복사'로", sync.includes("el.innerHTML='<span") && sync.includes('본문 복사'), true);
  sc.eq('그 onclick 은 vfCopyBodyOnly', sync.includes('closeVerseMemMenu();vfCopyBodyOnly()'), true);
  sc.eq("아니면 '전체 화면'으로 되돌린다", sync.includes('전체 화면'), true);
  sc.eq('그 onclick 은 openVerseFull', sync.includes('closeVerseMemMenu();openVerseFull()'), true);

  // 전체화면 자체의 두 진입 경로(롱터치·우클릭)만 fromFull=true 를 넘긴다
  const vfGest = slice('function _initVerseFullGestures(){', '\n  // 두 손가락으로 벌리면');
  sc.eq('전체화면 롱터치가 fromFull=true 를 넘긴다',
        vfGest.includes('openVerseMemMenu(el,null,{x:sx,y:sy},true);'), true);
  sc.eq('전체화면 우클릭도 fromFull=true 를 넘긴다',
        vfGest.includes('openVerseMemMenu(el,null,{x:e.clientX,y:e.clientY},true);'), true);
  // ⚠️ 다른 진입 경로(타일뷰·말씀영역)는 그대로 둬야 한다 — 거기선 '전체 화면'이 여전히 뜻이 있다
  sc.eq('타일뷰 롱터치는 fromFull 을 안 넘긴다(그대로 전체 화면)',
        SRC.includes('openVerseMemMenu(gd,null,{x:gsx,y:gsy});'), true);
  sc.eq('말씀영역 롱터치도 fromFull 을 안 넘긴다',
        SRC.includes('openVerseMemMenu(bar,null,{x:sx,y:sy}); // null'), true);
}

console.log('\n시나리오 4 — vfCopyBodyOnly: 본문만, 동기적으로 클립보드에');
{
  const fn = slice('function vfCopyBodyOnly(){', '\n}');
  sc.eq('krText 만 쓴다(장절·태그 없음)', fn.includes('const body=(v&&v.krText||\'\').trim();'), true);
  sc.eq('ref 를 붙이지 않는다', fn.includes('v.ref'), false);
  // ⚠️ iOS PWA 규칙 — await 뒤로 미루지 않고 클릭 핸들러에서 곧장 클립보드를 부른다
  sc.eq('clipboard.writeText 를 동기적으로 바로 부른다',
        fn.includes('navigator.clipboard.writeText(body)'), true);
  sc.eq('실패하면 execCommand 폴백', fn.includes('_copyTextFallback(body)'), true);
  sc.eq('본문이 없으면 토스트만 띄우고 끝낸다', fn.includes("showToast('복사할 본문이 없어요');return;"), true);
}

sc.done();
