// GNB 모양과 화면 스크롤 (v26-0903-2, HB 신고 세 가지)
//
// ① GNB 우상단 휴지통·톱니바퀴를 둘러싼 둥근 네모 테두리를 없앴다
// ② 문서 스크롤 상자 — body 에 overflow-x:hidden 을 주면 body 가 스스로
//    스크롤 상자가 되어 그 자식인 <header> 의 sticky 가 깨진다(스크롤할 때
//    GNB 가 위로 밀려 사라진다). 자르는 자리는 html 이어야 한다.
// ③ 떠 있는 메뉴(저장 목록)의 높이는 '놓인 자리에서 아래로 남은 만큼'이다.
//    화면 밖으로 흘러내리면 메뉴 안에 스크롤할 것이 없어, 손가락 밀기가
//    뒤쪽 할일 뷰로 새어 나간다.
//
const { SRC, makeScorer } = require('./_load');
const sc = makeScorer();
const css = SRC.replace(/\s+/g, ' ');

// ═══ 1. GNB 우상단 아이콘에 테두리가 없다 ═══
console.log('시나리오 1 — 휴지통·톱니바퀴의 테두리를 없앴다');
{
  const trash = SRC.slice(SRC.indexOf('/* 휴지통 버튼 */'), SRC.indexOf('.trash-btn svg{'));
  sc.eq('휴지통에 테두리가 없다', /border:none;background:transparent;/.test(trash.replace(/\s+/g, '')), true);
  sc.eq('휴지통에 1px 테두리를 다시 넣지 않았다', /border:1pxsolidvar\(--bd2\)/.test(trash.replace(/\s+/g, '')), false);

  const aib = SRC.slice(SRC.indexOf('.ai-b{'), SRC.indexOf('.settings-btn-icon{'));
  sc.eq('톱니바퀴에 테두리가 없다', /border:none;background:transparent;/.test(aib.replace(/\s+/g, '')), true);
  sc.eq('톱니바퀴에 1px 테두리를 다시 넣지 않았다', /border:1pxsolidvar\(--bd2\)/.test(aib.replace(/\s+/g, '')), false);

  // 손가락이 닿는 넓이는 그대로 둔다 — 테두리만 없앤 것이지 버튼을 줄인 게 아니다
  sc.eq('휴지통 상자는 32×24 그대로', /width:32px;height:24px/.test(trash.replace(/\s+/g, '')), true);
  sc.eq('톱니바퀴 상자도 32×24 그대로', /\.settings-btn-icon\{ width:32px;height:24px/.test(css), true);
}

// ═══ 2. 문서 스크롤 상자 — sticky 헤더가 살아 있는가 ═══
console.log('\n시나리오 2 — 가로 자르기는 html 에서 (sticky GNB)');
{
  sc.eq('html 이 가로 넘침을 자른다', /html\{[^}]*overflow-x:hidden/.test(css), true);
  // ⚠️ 이 줄이 되살아나면 스크롤할 때 GNB 가 사라진다
  // 주석은 걷어내고 본다 — "html 로 옮겼다" 는 설명글에도 같은 글자가 들어 있다
  const body = SRC.slice(SRC.indexOf('body{\n'), SRC.indexOf('input,textarea{'))
                  .replace(/\/\*[\s\S]*?\*\//g, '');
  sc.eq('body 에는 overflow-x:hidden 이 없다', /overflow-x:\s*hidden/.test(body), false);
  sc.eq('헤더는 여전히 sticky', /header\{ position:sticky;top:0/.test(css), true);
  // 화면 전체가 출렁이던 것(고무줄)을 멈춘다
  sc.eq('세로 오버스크롤을 막는다', /html\{[^}]*overscroll-behavior-y:none/.test(css), true);
}

// ═══ 3. 떠 있는 메뉴의 높이·스크롤 가둠 ═══
console.log('\n시나리오 3 — 저장 목록 메뉴가 뒤쪽을 끌고 다니지 않는다');
{
  sc.eq('높이를 재는 함수가 있다', SRC.includes('function _menuFitHeight(el){'), true);
  const fn = SRC.slice(SRC.indexOf('function _menuFitHeight(el){'), SRC.indexOf('function openLogoMenu(anchorEl){'));
  sc.eq('놓인 자리(top)를 재서 남은 높이를 쓴다',
        fn.includes('getBoundingClientRect().top') && fn.includes('window.innerHeight-top'), true);
  sc.eq('너무 납작해지지는 않는다 (최소 120px)', fn.includes('Math.max(120'), true);
  sc.eq('숨어 있는 메뉴는 재지 않는다', fn.includes("el.style.display==='none'"), true);

  // 자리를 정하는 네 곳에서 모두 다시 잰다
  sc.eq('메뉴를 열 때 잰다', /menu\.style\.top=top\+'px';\s*_menuFitHeight\(menu\);/.test(SRC), true);
  sc.eq('하위 뎁스(터치)에서 다시 잰다', /_menuFitHeight\(document\.getElementById\('logoMenu'\)\);\s*\/\/ 내용이 바뀌었으니/.test(SRC), true);
  sc.eq('하위 뎁스(PC)에서도 잰다', /s\.style\.top=top\+'px';\s*_menuFitHeight\(s\);/.test(SRC), true);
  sc.eq('메인 뎁스로 돌아올 때도 잰다',
        /if\(m\)m\.style\.display='';\s*_menuFitHeight\(document\.getElementById\('logoMenu'\)\);/.test(SRC), true);

  // 스크롤이 뒤로 새어 나가지 않게 하는 두 장치
  sc.eq('메뉴 안에서 스크롤을 끝낸다',
        /#logoMenu,\.task-menu-sub-float\{[^}]*overflow-y:auto;overscroll-behavior:contain/.test(css), true);
  sc.eq('메뉴 바깥(어두운 자리)을 끌어도 뒤가 안 움직인다',
        /\.task-menu-overlay\{position:fixed;inset:0;z-index:199;touch-action:none;\}/.test(css), true);
}

sc.done();
