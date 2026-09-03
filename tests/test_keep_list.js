// 저장 목록 고르기와 내 순서 터치 동작을 고정한다 (v26-0902-21)
const { SRC, makeScorer } = require('./_load');
const sc = makeScorer();

const css = SRC.slice(SRC.indexOf('.keep-pick-row{'), SRC.indexOf('.keep-pick-nm{'));
const drag = SRC.slice(SRC.indexOf('const _KEEP_HOLD_MS='), SRC.indexOf('function openKeepListPopup('));
const picker = SRC.slice(SRC.indexOf('function _renderKeepPicker(){'), SRC.indexOf('function keepPickToggle('));

console.log('시나리오 1 — 내 순서에서 터치는 홀드 뒤에만 끌기');
sc.eq('터치 홀드 시간은 할일과 같은 280ms', drag.includes('const _KEEP_HOLD_MS=280'), true);
sc.eq('홀드 전에는 세로 스크롤 허용', css.includes('touch-action:pan-y'), true);
sc.eq('터치 즉시 끌기 금지', drag.includes("else holdTimer=setTimeout(()=>begin(e),_KEEP_HOLD_MS)"), true);
sc.eq('스크롤 거리 7px이면 홀드 취소', drag.includes('Math.abs(lastY-grabY)>=7'), true);
sc.eq('마우스는 기존처럼 즉시 끌기', drag.includes("if(e.pointerType==='mouse')begin(e)"), true);

console.log('\n시나리오 2 — 새 목록 행은 언제나 목록보다 위');
const addAt = picker.indexOf('keep-pick-row keep-pick-new');
const rowsAt = picker.indexOf('<div id="keepPickRows">');
sc.eq('새 목록 행이 목록 묶음보다 먼저', addAt >= 0 && addAt < rowsAt, true);
sc.eq('새 목록 행은 드래그 묶음 밖', picker.slice(rowsAt).includes('keep-pick-row keep-pick-new'), false);


// v26-0903-1 — 좌상단 저장 목록은 독립적으로 스크롤하고, 팝업 뒤에서도 상태를 보존한다.
console.log('\n시나리오 3 — 좌상단 저장 목록의 스크롤과 돌아갈 자리');
const menuCss = SRC.slice(SRC.indexOf('#logoMenu,.task-menu-sub-float{'), SRC.indexOf('}', SRC.indexOf('#logoMenu,.task-menu-sub-float{')) + 1);
const openPopup = SRC.slice(SRC.indexOf('function openKeepListPopup('), SRC.indexOf('// 제목 = 지금 보고 있는 목록 이름'));
sc.eq('긴 목록은 메뉴 자체에서 스크롤', menuCss.includes('overflow-y:auto'), true);
sc.eq('목록 끝의 스크롤이 할일 뷰로 번지지 않음', menuCss.includes('overscroll-behavior:contain'), true);
sc.eq('좌상단 폴더 목록이 열려 있는지 확인', openPopup.includes("keepSub.style.display!=='none'"), true);
sc.eq('좌상단에서 열었으면 뒤의 폴더 목록을 닫지 않음', openPopup.includes('if(!returnToKeepMenu)closeLogoMenu();'), true);

sc.done();
