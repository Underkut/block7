// GNB 모양과 화면 스크롤 (v26-0903-2, HB 신고 세 가지)
//
// ① GNB 우상단 휴지통·톱니바퀴의 네모는 **옅고 얇게**(--bd, .8px). 없애 봤다가 되살렸다
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
  sc.eq('휴지통에 옅고 얇은 네모(.8px)', /border:\.8pxsolidvar\(--bd\);/.test(trash.replace(/\s+/g, '')), true);
  sc.eq('휴지통에 진한 --bd2 를 쓰지 않는다', /border:1pxsolidvar\(--bd2\)/.test(trash.replace(/\s+/g, '')), false);

  const aib = SRC.slice(SRC.indexOf('.ai-b{'), SRC.indexOf('.settings-btn-icon{'));
  sc.eq('톱니바퀴에 옅고 얇은 네모(.8px)', /border:\.8pxsolidvar\(--bd\);/.test(aib.replace(/\s+/g, '')), true);
  sc.eq('톱니바퀴에 진한 --bd2 를 쓰지 않는다', /border:1pxsolidvar\(--bd2\)/.test(aib.replace(/\s+/g, '')), false);

  // 손가락이 닿는 넓이는 그대로 둔다 — 테두리만 없앤 것이지 버튼을 줄인 게 아니다
  sc.eq('휴지통 상자는 32×24 그대로', /width:32px;height:24px/.test(trash.replace(/\s+/g, '')), true);
  sc.eq('톱니바퀴 상자도 32×24 그대로', /\.settings-btn-icon\{ width:32px;height:24px/.test(css), true);
}

// ═══ 2. 문서 스크롤 상자 — sticky 헤더가 살아 있는가 ═══
console.log('\n시나리오 2 — 가로 자르기는 html 에서 (sticky GNB)');
{
  // ⚠️ 주석을 걷어내고 본다. 이 파일이 검사하는 규칙들은 하나같이 "예전에 이런
  //    줄이 있었다" 를 주석으로 남겨 뒀어서, 그냥 찾으면 설명글이 걸린다.
  const css = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  sc.eq('html 이 가로 넘침을 자른다', /html\{[^}]*overflow-x:hidden/.test(css), true);
  // ⚠️ 이 줄이 되살아나면 스크롤할 때 GNB 가 사라진다
  // 주석은 걷어내고 본다 — "html 로 옮겼다" 는 설명글에도 같은 글자가 들어 있다
  const body = SRC.slice(SRC.indexOf('body{\n'), SRC.indexOf('input,textarea{'))
                  .replace(/\/\*[\s\S]*?\*\//g, '');
  sc.eq('body 에는 overflow-x:hidden 이 없다', /overflow-x:\s*hidden/.test(body), false);
  // ⚠️ 여기가 GNB 가 사라지던 **진짜 원인**이었다 (v26-0903-3).
  //    미디어쿼리 밖의 맨몸 header{position:relative} 가, 위쪽의
  //    header{position:sticky} 와 특이도가 같으면서 뒤에 있어 덮어 버렸다.
  //    한 줄이면 되살아나는 종류의 버그라 여기서 못 박는다.
  sc.eq('헤더는 sticky', /header\{ position:sticky;top:0/.test(css), true);
  const stickyAt = css.indexOf('header{ position:sticky;top:0');
  sc.eq('sticky 뒤에 header 의 position 을 다시 정하는 규칙이 없다',
        /header\{ ?position:/.test(css.slice(stickyAt + 20)), false);
  // 고무줄(오버스크롤)은 그대로 둔다 — 없애면 스크롤이 딱딱해진다 (HB)
  sc.eq('세로 오버스크롤을 막지 않는다', /overscroll-behavior-y:none/.test(css), false);
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

// ═══ 4. GNB 높이 · 끌기 중 손가락 밀기 ═══
console.log('\n시나리오 4 — GNB 높이와 내순서 끌기');
{
  const c = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  // 상태바(safe-area)는 못 줄인다. 줄일 수 있는 앞자리를 46 → 38 로 (HB)
  sc.eq('GNB 앞자리 높이는 38px',
        /height:calc\(38px \+ env\(safe-area-inset-top, 0px\)\)/.test(c), true);
  sc.eq('46px 로 되돌아가 있지 않다', /height:calc\(46px \+ env\(safe-area/.test(c), false);
  sc.eq('상태바 자리는 그대로 더한다', /calc\(38px \+ constant\(safe-area-inset-top/.test(c), true);

  // '내순서' 끌기 — 끄는 동안에는 손가락 밀기를 통째로 삼킨다.
  // pointermove 의 preventDefault 만으로는 늦는다(브라우저가 이미 스크롤을
  // 시작하면 그 이벤트가 cancelable 이 아니게 된다).
  sc.eq('끌기 중 touchmove 를 수동으로 잡는다',
        /box\.addEventListener\('touchmove',e=>\{\s*if\(el&&!holdTimer&&e\.cancelable\)e\.preventDefault\(\);\s*\},\{passive:false\}\)/.test(SRC), true);
  // 홀드 전에는 흘려 보내야 목록 스크롤이 된다
  sc.eq('홀드 전(=아직 끌기 전)에는 막지 않는다', SRC.includes('if(el&&!holdTimer&&e.cancelable)'), true);
  sc.eq('줄에는 pan-y 가 그대로 (쓱 밀면 스크롤)',
        /\.keep-drag-zone \[data-keepname\]\{touch-action:pan-y;\}/.test(c), true);

  // 스크롤할 것이 없는 메뉴에서도 뒤로 새지 않게
  sc.eq('메뉴 스크롤 잠금 함수가 있다', SRC.includes('function _menuLockScroll(el){'), true);
  const lock = SRC.slice(SRC.indexOf('function _menuLockScroll(el){'), SRC.indexOf('function openLogoMenu(anchorEl){'));
  sc.eq('touchmove 를 수동으로 잡는다', lock.includes('{passive:false}'), true);
  sc.eq('양쪽 끝을 모두 본다', lock.includes('canUp') && lock.includes('canDown'), true);
  sc.eq('높이를 잴 때 같이 걸어 준다', SRC.includes('_menuLockScroll(el);\n}'), true);
}

sc.done();
