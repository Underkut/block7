// 두 앱 오가기 · Sweeter 홈의 손버릇 (v26-0921-1)
//
// HB 가 정한 것 (2026-09-21):
//  ① Sweeter 도 좌상단 로고를 둔다 — 탭 = 말씀 메뉴 · 롱터치 = 전체 업데이트
//  ② 로고 메뉴 **맨 아래**에 형제 앱으로 가는 한 줄
//     탭 = 앱 안에서 화면 바꾸기 · 롱터치 = 상대 앱 주소로 진짜 이동
//  ③ 우상단은 '기존 화면' 대신 톱니 — 탭 = 말씀 설정
//  ④ Sweeter 전용 아이콘 (파비콘·홈화면)
//
// ⚠️ 가장 조심한 곳: **BLOCK7 안에서는 Sweeter 판을 깨우지 않는다.**
//    APP_PRODUCT 가 기본값인 동안 Sweeter 장치는 잠들어 있어야 한다(CLAUDE.md).
//    깨우면 타일 구성(swTiles)이 BLOCK7 의 공용 설정 칸에 들어가 클라우드가
//    지저분해진다. 그래서 BLOCK7 → Sweeter 는 **주소로만** 간다 (시나리오 3).
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
const fs = require('fs'), path = require('path');
const R = f => path.join(__dirname, '..', f);

let APP_PRODUCT='sweeter', DEV_MODE=false;
let WENT=null, TOGGLED=0, CLOSED=0;
function _swOn(){return APP_PRODUCT==='sweeter';}
function swToggleHome(){TOGGLED++;}
function closeLogoMenu(){CLOSED++;}
global.location={get href(){return '';},set href(v){WENT=v;}};

const EL={};
function mkEl(id){return EL[id]={id,dataset:{},title:'',textContent:'',_src:null,
  getAttribute(k){return k==='src'?this._src:null;},
  setAttribute(k,v){if(k==='src')this._src=v;},
  addEventListener(){},oncontextmenu:null};}
['logoMenuSister','logoMenuSisterIcon','logoMenuSisterLabel'].forEach(mkEl);
global.document={getElementById:id=>EL[id]||null,querySelector:()=>null,addEventListener:()=>{}};
global.window={addEventListener:()=>{}};

eval(sliceDev('function _sisterApp(){', '\n// ── 켜고 끄기'));

function as(prod,dev){APP_PRODUCT=prod;DEV_MODE=dev;WENT=null;TOGGLED=0;CLOSED=0;}

// ═══ 1. 어느 빌드에서 어디로 가는가 ═══
console.log('시나리오 1 — 형제 앱의 이름·주소·그림');
{
  as('sweeter',false);
  sc.eq('Sweeter 운영본 → BLOCK7',
        [_sisterApp().name,_sisterApp().href,_sisterApp().icon],
        ['BLOCK7','https://block7.my/','icon-block7.png']);
  as('block7',false);
  sc.eq('BLOCK7 운영본 → Sweeter',
        [_sisterApp().name,_sisterApp().href,_sisterApp().icon],
        ['Sweeter','https://sweeter.my/','icon-sweeter.png']);
  as('sweeter',true);
  sc.eq('Sweeter 개발본은 **개발본끼리** 오간다', _sisterApp().href, 'index-dev.html');
  as('block7',true);
  sc.eq('BLOCK7 개발본도 마찬가지', _sisterApp().href, 'sweeter-dev.html');
  // ⚠️ 개발본에서 운영본으로 튀면 진짜 계정 화면이 열린다 — 그러면 안 된다
  as('sweeter',true);
  sc.eq('개발본이 운영 주소로 튀지 않는다', /block7\.my|sweeter\.my/.test(_sisterApp().href), false);
}

// ═══ 2. Sweeter 에서 탭 = 앱 안에서 바꾸기 ═══
console.log('\n시나리오 2 — Sweeter 의 탭은 앱 안에서');
{
  as('sweeter',false);
  sc.eq('앱 안에서 바꿀 수 있다고 표시된다', _sisterApp().inApp, true);
  sisterTap();
  sc.eq('화면만 바꿨다', TOGGLED, 1);
  sc.eq('주소로 가지 않았다', WENT, null);
  sc.eq('메뉴는 닫았다', CLOSED, 1);
}

// ═══ 3. ⚠️ BLOCK7 에서는 Sweeter 판을 깨우지 않는다 ═══
console.log('\n시나리오 3 — BLOCK7 의 탭은 주소로 간다');
{
  as('block7',false);
  sc.eq('앱 안에서 바꾸지 않는다', _sisterApp().inApp, false);
  sisterTap();
  sc.eq('⭐ Sweeter 판을 깨우지 않았다', TOGGLED, 0);
  sc.eq('대신 주소로 갔다', WENT, 'https://sweeter.my/');
  // 소스에도 그 까닭이 적혀 있어야 한다 — 다음 사람이 무심코 뒤집지 않게
  sc.eq('까닭이 소스에 적혀 있다', SRC.includes('Sweeter 장치는 **잠들어 있어야**'), true);
}

// ═══ 4. 롱터치 = 상대 앱 주소로 진짜 이동 ═══
console.log('\n시나리오 4 — 롱터치는 언제나 주소로');
{
  as('sweeter',false);
  sisterGo();
  sc.eq('Sweeter 에서 롱터치 → block7.my', WENT, 'https://block7.my/');
  as('block7',false);
  sisterGo();
  sc.eq('BLOCK7 에서 롱터치 → sweeter.my', WENT, 'https://sweeter.my/');
}

// ═══ 5. 롱터치 뒤 따라오는 탭은 버린다 ═══
console.log('\n시나리오 5 — 롱터치 뒤의 헛탭');
{
  // 손을 뗄 때 click 이 한 번 더 나는 것이 모바일의 버릇이다.
  // 그대로 두면 "주소로 갔다가 곧바로 화면도 바뀌는" 겹침이 난다.
  as('sweeter',false);
  EL.logoMenuSister.dataset.lpFired='1';
  sisterTap();
  sc.eq('헛탭은 아무 일도 안 한다', [TOGGLED,WENT], [0,null]);
  sc.eq('표시는 지워진다', EL.logoMenuSister.dataset.lpFired, '');
  sisterTap();
  sc.eq('그다음 진짜 탭은 먹는다', TOGGLED, 1);
}

// ═══ 6. 메뉴 한 줄이 제품에 맞게 채워진다 ═══
console.log('\n시나리오 6 — 메뉴 한 줄');
{
  as('sweeter',false);
  _sisterFill();
  sc.eq('이름', EL.logoMenuSisterLabel.textContent, 'BLOCK7');
  sc.eq('그림', EL.logoMenuSisterIcon._src, 'icon-block7.png');
  sc.eq('안내말에 롱터치를 알려 준다', /길게 누르면/.test(EL.logoMenuSister.title), true);
  as('block7',false);
  _sisterFill();
  sc.eq('BLOCK7 에서는 Sweeter 로', EL.logoMenuSisterLabel.textContent, 'Sweeter');
  sc.eq('그림도 바뀐다', EL.logoMenuSisterIcon._src, 'icon-sweeter.png');
  sc.eq('앱 안에서 못 바꾸니 그 말은 없다', /길게 누르면/.test(EL.logoMenuSister.title), false);
}

// ═══ 7. 화면에 박아 둔 것들 ═══
console.log('\n시나리오 7 — 로고·톱니·파비콘');
{
  // 로고 메뉴는 열 때마다 형제 줄을 다시 채운다 (제품이 다른 산출물끼리 섞이지 않게)
  sc.eq('메뉴를 열 때 채운다', SRC.includes('try{_sisterFill();}catch(e){}'), true);
  // 좌상단 로고 — BLOCK7 과 같은 손버릇
  sc.eq('로고 탭=말씀메뉴 · 롱터치=전체 업데이트',
        SRC.includes('attachRepeatBtnInteraction(brand,()=>openLogoMenu(brand),()=>verseSyncAllNow())'), true);
  // 톱니 — 탭=말씀설정 · 롱터치=일반설정(계정·로그아웃)
  sc.eq('⭐ 톱니 탭=말씀설정 · 롱터치=일반설정',
        SRC.includes('attachRepeatBtnInteraction(setBtn,()=>openVerseSettingsFromLogo(),()=>openSettings())'), true);
  sc.eq("'기존 화면' 단추는 없앴다", SRC.includes('>기존 화면<'), false);
  sc.eq("되돌아오는 'Sweeter 홈' 단추는 남겨 뒀다", SRC.includes('id="swBackBtn"'), true);
  // 제목 롱터치(가져오기)는 뗐다 — 로고 묶음의 '전체 업데이트' 와 겹친다
  sc.eq('제목 롱터치는 뗐다', /ttl\.dataset\.swlp/.test(SRC), false);
  sc.eq('가져오기는 안내 줄이 맡는다', SRC.includes('function _swSyncNotice()'), true);
  // 파비콘 — 지금까지 아예 없었다
  sc.eq('BLOCK7 에 파비콘이 생겼다', SRC.includes('<link rel="icon" href="icon.png">'), true);
}

// ═══ 8. 아이콘 파일이 빌드마다 같은 이름으로 있는가 ═══
console.log('\n시나리오 8 — 아이콘 파일');
{
  const md5=f=>require('crypto').createHash('md5').update(fs.readFileSync(R(f))).digest('hex');
  ['icon.png','icon-sweeter.png','icon-block7.png'].forEach(f=>
    sc.eq(f+' 있다', fs.existsSync(R(f)), true));
  sc.eq('icon-block7.png 는 BLOCK7 아이콘 그대로', md5('icon-block7.png'), md5('icon.png'));
  sc.eq('icon-sweeter.png 는 다른 그림', md5('icon-sweeter.png')!==md5('icon.png'), true);

  // 개발본은 block7.my 에 얹혀 살아 icon.png 가 BLOCK7 것이다 → 이름을 갈라야 한다
  const swdev=fs.readFileSync(R('sweeter-dev.html'),'utf8');
  sc.eq('개발본 파비콘이 Sweeter 것', swdev.includes('<link rel="icon" href="icon-sweeter.png">'), true);
  sc.eq('개발본 홈화면 아이콘도', swdev.includes('<link rel="apple-touch-icon" href="icon-sweeter.png">'), true);
  const mdev=JSON.parse(fs.readFileSync(R('manifest-sweeter-dev.json'),'utf8'));
  sc.eq('개발본 manifest 도', [...new Set(mdev.icons.map(i=>i.src))], ['icon-sweeter.png']);

  // ⚠️ BLOCK7 운영본의 아이콘은 **예전 그대로**여야 한다
  sc.eq('⭐ BLOCK7 은 icon.png 그대로', SRC.includes('<link rel="apple-touch-icon" href="icon.png">'), true);
  const mb7=JSON.parse(fs.readFileSync(R('manifest.json'),'utf8'));
  sc.eq('BLOCK7 manifest 도 그대로', [...new Set(mb7.icons.map(i=>i.src))], ['icon.png']);

  // 운영본 빌드 — 이름은 그대로 두고 내용물만 Sweeter 것으로
  if(fs.existsSync(R('build-sweeter/index.html'))){
    sc.eq('빌드의 icon.png 는 Sweeter 그림',
          md5('build-sweeter/icon.png'), md5('icon-sweeter.png'));
    sc.eq('형제 아이콘 두 개도 함께 담긴다',
          ['icon-sweeter.png','icon-block7.png'].every(f=>fs.existsSync(R('build-sweeter/'+f))), true);
  }
}

sc.done();
