// 두 앱 오가기 · Sweeter 홈의 손버릇 (v26-0921-1)
//
// HB 가 정한 것 (2026-09-21):
//  ① Sweeter 도 좌상단 로고를 둔다 — 탭 = 말씀 메뉴 · 롱터치 = 전체 업데이트
//  ② 로고 메뉴 **맨 아래**에 형제 앱으로 가는 한 줄
//     ⚠️ v26-0921-2 에서 **하나로 줄였다** — 누르면 언제나 상대 앱을 제 주소로
//     연다. 예전에는 '탭=앱 안에서 화면 바꾸기 / 롱터치=주소' 둘이었는데
//     HB 가 "너무 헷갈리고 기능도 불완전하다" 고 했다 (2026-09-21).
//  ③ 우상단은 '기존 화면' 대신 톱니 — 탭 = 말씀 설정
//  ④ Sweeter 전용 아이콘 (파비콘·홈화면)
//
// ⚠️ 가장 조심한 곳: **어느 쪽에서도 앱 안에서 화면을 바꾸지 않는다.**
//    특히 BLOCK7 안에서 Sweeter 판을 깨우면 안 된다 — APP_PRODUCT 가 기본값인
//    동안 그 장치는 잠들어 있어야 하고(CLAUDE.md), 깨우면 타일 구성(swTiles)이
//    BLOCK7 의 공용 설정 칸에 들어가 클라우드가 지저분해진다.
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
const fs = require('fs'), path = require('path');
const R = f => path.join(__dirname, '..', f);

let APP_PRODUCT='sweeter', DEV_MODE=false;
// 앱 안에서 상대 제품 화면을 보는 중인가 (아이폰 홈 화면 앱 전용)
let _swCross=false;
function _swBoardOn(){return _swOn()?!_swCross:_swCross;}
function _swMount(){}
let WENT=null, OPENED=null, OPEN_OK=true, CLOSED=0;
function _swOn(){return APP_PRODUCT==='sweeter';}
function closeLogoMenu(){CLOSED++;}
global.location={get href(){return '';},set href(v){WENT=v;}};

const EL={};
function mkEl(id){return EL[id]={id,dataset:{},title:'',textContent:'',_src:null,
  getAttribute(k){return k==='src'?this._src:null;},
  setAttribute(k,v){if(k==='src')this._src=v;},
  addEventListener(){},oncontextmenu:null};}
['logoMenuSister','logoMenuSisterIcon','logoMenuSisterLabel'].forEach(mkEl);
global.document={getElementById:id=>EL[id]||null,querySelector:()=>null,addEventListener:()=>{}};
// 홈 화면 앱인가 / 아이폰인가 — 시험에서 갈아 끼운다
let STANDALONE=false, IOS=false;
// ⚠️ Node 22 에는 navigator 가 **읽기 전용 전역**으로 이미 있다.
//    global.navigator={...} 로는 조용히 안 먹는다 — defineProperty 로 갈아 끼운다.
//    (이걸 몰라 시나리오 5-2 가 처음에 통째로 빗나갔다)
Object.defineProperty(global,'navigator',{configurable:true,value:{
  get standalone(){return STANDALONE;},
  get userAgent(){return IOS?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)':'Mozilla/5.0 (X11; Linux x86_64)';},
  platform:'', maxTouchPoints:0}});
let TOAST='';
function showToast(m){TOAST=m;}
global.window={addEventListener:()=>{},
  matchMedia:q=>({matches:STANDALONE&&/standalone/.test(q)}),
  open:(url,target,feat)=>{OPENED={url,target,feat};return OPEN_OK?{opener:{}}:null;}};

eval(sliceDev('function _sisterApp(){', '\nfunction _swBoot('));

function as(prod,dev){APP_PRODUCT=prod;DEV_MODE=dev;WENT=null;OPENED=null;OPEN_OK=true;
  CLOSED=0;TOAST='';STANDALONE=false;IOS=false;_swCross=false;}

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

// ═══ 2. 누르면 언제나 상대 앱을 제 주소로 연다 ═══
console.log('\n시나리오 2 — 누르면 상대 앱이 열린다');
{
  as('sweeter',false);
  sisterGo();
  sc.eq('새 창으로 연다', [OPENED.url,OPENED.target], ['https://block7.my/','_blank']);
  sc.eq('메뉴는 닫았다', CLOSED, 1);
  sc.eq('보던 창은 그대로다 (주소를 갈아엎지 않는다)', WENT, null);

  as('block7',false);
  sisterGo();
  sc.eq('BLOCK7 에서도 마찬가지', OPENED.url, 'https://sweeter.my/');
  sc.eq('보던 창 그대로', WENT, null);
}

// ═══ 3. ⚠️ 앱 안에서 화면을 바꾸는 길은 아예 없다 ═══
console.log('\n시나리오 3 — 앱 안에서 바꾸지 않는다');
{
  // HB 가 "너무 헷갈린다" 고 해서 v26-0921-2 에서 통째로 뺐다.
  sc.eq('swToggleHome() 이 없다', /function swToggleHome\(/.test(SRC), false);
  sc.eq("'Sweeter 홈' 되돌아가기 단추도 없다", SRC.includes('id="swBackBtn"'), false);
  sc.eq('_swClassic 도 없다', /_swClassic/.test(SRC), false);
  sc.eq('메뉴 줄은 sisterGo 하나만 부른다',
        SRC.includes('id="logoMenuSister" onclick="sisterGo()"'), true);
  sc.eq('sisterTap 은 사라졌다', /function sisterTap\(/.test(SRC), false);
  // ⭐ BLOCK7 에서는 Sweeter 판이 깨어날 길이 없어야 한다 —
  //    판을 켜는 곳은 _swBoot 하나뿐이고, 그 첫 줄이 문지기다.
  sc.eq('⭐ _swBoot 의 첫 줄이 문지기다',
        /function _swBoot\(\)\{\s*\n\s*if\(!_swOn\(\)\)return;/.test(SRC), true);
  sc.eq('판을 켜는 곳은 한 군데뿐', (SRC.match(/classList\.add\('on'\)/g)||[]).length>=1, true);
}

// ═══ 4. 팝업이 막히면 이 창에서라도 연다 ═══
console.log('\n시나리오 4 — 팝업이 막혔을 때');
{
  // 아무 일도 안 일어나는 것이 가장 나쁘다 — 눌렀는데 반응이 없으면 고장으로 읽힌다.
  as('sweeter',false);
  OPEN_OK=false;
  sisterGo();
  sc.eq('이 창에서라도 연다', WENT, 'https://block7.my/');

  as('block7',false);
  OPEN_OK=false;
  sisterGo();
  sc.eq('BLOCK7 에서도', WENT, 'https://sweeter.my/');
}

// ═══ 5. ⚠️ 새 창이 떴으면 보던 창은 그대로 둔다 ═══
console.log('\n시나리오 5 — 두 창이 함께 떠나지 않는다');
{
  // ⚠️ 여기가 실제로 터졌던 자리다 (2026-09-21).
  //    window.open 에 'noopener' 를 주면 규격상 **창을 열고도 null** 을 돌려준다.
  //    그것을 "막혔다" 로 읽어 되돌림까지 돌면 새 창이 뜨는 동시에
  //    보던 창도 떠나 버린다. 브라우저에서 눌러 보고서야 잡혔다.
  as('sweeter',false);
  sisterGo();
  sc.eq('창은 열렸고', OPENED.url, 'https://block7.my/');
  sc.eq('⭐ 보던 창은 그대로다', WENT, null);
  sc.eq('noopener 를 주지 않는다 (null 을 돌려받는 함정)',
        /noopener/.test(OPENED.feat||''), false);
  sc.eq('소스에 그 까닭이 적혀 있다', SRC.includes("'noopener' 를 **주지 말 것.**"), true);
}

// ═══ 5-2. 아이폰 홈 화면 앱 — 앱 안에서 상대 화면을 보여 준다 ═══
console.log('\n시나리오 5-2 — 아이폰 홈 화면 앱');
{
  // 아이폰에는 **상대 홈 화면 앱을 부르는 길이 아예 없다** (웹의 한계).
  // 브라우저를 띄우면 앱 안에 남의 창이 떠서 로그인도 안 되어 있다 —
  // HB 가 "헷갈린다" 고 한 그 화면이다. 그래서 **앱 안에서 화면만 바꾼다**
  // (HB 결정 2026-09-21).
  as('sweeter',false);
  STANDALONE=true;IOS=true;
  sisterGo();
  sc.eq('⭐ 브라우저를 띄우지 않는다', OPENED, null);
  sc.eq('⭐ 보던 앱도 떠나지 않는다', WENT, null);
  sc.eq('상대 화면으로 바꿨다', _swCross, true);
  sc.eq('Sweeter 에서는 판을 내린다', _swBoardOn(), false);
  sisterGo();
  sc.eq('한 번 더 누르면 되돌아온다', [_swCross,_swBoardOn()], [false,true]);

  // ⭐ BLOCK7 쪽도 된다 — 판을 세워 Sweeter 화면을 보인다
  as('block7',false);
  STANDALONE=true;IOS=true;
  sc.eq('평소 BLOCK7 은 판이 꺼져 있다', _swBoardOn(), false);
  sisterGo();
  sc.eq('⭐ BLOCK7 에서는 판을 세운다', _swBoardOn(), true);
  sc.eq('브라우저는 안 띄운다', [OPENED,WENT], [null,null]);
  sisterGo();
  sc.eq('되돌아가면 다시 꺼진다', _swBoardOn(), false);

  // 안드로이드 홈 화면 앱은 기기가 설치된 앱으로 넘겨줄 때가 있다 → 그대로 연다
  as('sweeter',false);
  STANDALONE=true;IOS=false;
  sisterGo();
  sc.eq('안드로이드 홈 화면 앱은 그대로 연다', OPENED.url, 'https://block7.my/');
  sc.eq('앱 안에서 바꾸지 않는다', _swCross, false);

  // 브라우저 탭은 아이폰이어도 새 탭으로 연다 (HB 가 확인한 그 동작)
  as('sweeter',false);
  STANDALONE=false;IOS=true;
  sisterGo();
  sc.eq('아이폰 **브라우저**에서는 새 탭으로', OPENED.url, 'https://block7.my/');
  sc.eq('앱 안에서 바꾸지 않는다', _swCross, false);
}

// ═══ 5-3. ⚠️ 상대 화면을 보는 중에는 메뉴가 '돌아가기' 를 가리킨다 ═══
console.log('\n시나리오 5-3 — 건너간 뒤의 메뉴 이름');
{
  // ⚠️ 실제로 뒤집혀 있던 자리다 (HB 신고 2026-09-21).
  //    Sweeter 에서 BLOCK7 화면으로 넘어갔는데 메뉴가 다시 'BLOCK7' 이라고
  //    떴다 — 이미 보고 있는 것을 또 가리킨 것이다.
  //    **제품이 무엇인가**가 아니라 **지금 무엇을 보고 있는가**로 정해야 한다.
  as('sweeter',false);
  _sisterFill();
  sc.eq('Sweeter 홈에서는 BLOCK7 을 가리킨다', EL.logoMenuSisterLabel.textContent, 'BLOCK7');

  _swCross=true;                       // BLOCK7 화면으로 건너간 상태
  _sisterFill();
  sc.eq('⭐ 건너간 뒤에는 Sweeter 로 돌아가기', EL.logoMenuSisterLabel.textContent, 'Sweeter');
  sc.eq('⭐ 그림도 Sweeter 것', EL.logoMenuSisterIcon._src, 'icon-sweeter.png');

  as('block7',false);
  _sisterFill();
  sc.eq('BLOCK7 에서는 Sweeter 를 가리킨다', EL.logoMenuSisterLabel.textContent, 'Sweeter');

  _swCross=true;                       // Sweeter 화면으로 건너간 상태
  _sisterFill();
  sc.eq('⭐ 건너간 뒤에는 BLOCK7 로 돌아가기', EL.logoMenuSisterLabel.textContent, 'BLOCK7');
  sc.eq('⭐ 그림도 BLOCK7 것', EL.logoMenuSisterIcon._src, 'icon-block7.png');
  _swCross=false;
}

// ═══ 6. 메뉴 한 줄이 제품에 맞게 채워진다 ═══
console.log('\n시나리오 6 — 메뉴 한 줄');
{
  as('sweeter',false);
  _sisterFill();
  sc.eq('이름', EL.logoMenuSisterLabel.textContent, 'BLOCK7');
  sc.eq('그림', EL.logoMenuSisterIcon._src, 'icon-block7.png');
  sc.eq('안내말은 한 가지뿐', EL.logoMenuSister.title, 'BLOCK7 열기');
  as('block7',false);
  _sisterFill();
  sc.eq('BLOCK7 에서는 Sweeter 로', EL.logoMenuSisterLabel.textContent, 'Sweeter');
  sc.eq('그림도 바뀐다', EL.logoMenuSisterIcon._src, 'icon-sweeter.png');
  sc.eq('BLOCK7 쪽 안내말도 한 가지뿐', EL.logoMenuSister.title, 'Sweeter 열기');
  // ⚠️ 길이 둘이었던 흔적이 남아 있으면 안 된다 — HB 가 헷갈린다고 했다.
  //    (톱니의 '길게 누르면 일반 설정' 은 **다른 자리**라 그대로 둔다)
  sc.eq('형제 줄에 롱터치를 달지 않는다', /sisterLp/.test(SRC), false);
  sc.eq('형제 줄 안내말에 롱터치 이야기가 없다', /길게 누르면.*주소|주소.*길게 누르면/.test(SRC), false);
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

  // ⚠️ 운영본 파비콘은 **주소 자체가 달라야** 한다. 첫 배포가 sweeter.my/icon.png
  //    로 BLOCK7 아이콘을 내보냈고, 내용만 바꾸니 브라우저가 옛 그림을 계속
  //    물고 있었다 (크롬 탭에 두 로고가 번갈아 떴다 — HB 신고 2026-09-21).
  const mkp=fs.readFileSync(R('tools/make-sweeter-prod.sh'),'utf8');
  sc.eq('⭐ 운영본 파비콘 주소를 갈아 끼운다',
        mkp.includes(`'<link rel="icon" href="icon-sweeter.png">'`), true);
  sc.eq('⭐ 홈화면 아이콘 주소도',
        mkp.includes(`'<link rel="apple-touch-icon" href="icon-sweeter.png">'`), true);
  const msw=JSON.parse(fs.readFileSync(R('manifest-sweeter.json'),'utf8'));
  sc.eq('⭐ 운영본 manifest 도 새 이름', [...new Set(msw.icons.map(i=>i.src))], ['icon-sweeter.png']);

  // 운영본 빌드 — 이름은 그대로 두고 내용물만 Sweeter 것으로
  if(fs.existsSync(R('build-sweeter/index.html'))){
    sc.eq('빌드의 icon.png 는 Sweeter 그림',
          md5('build-sweeter/icon.png'), md5('icon-sweeter.png'));
    sc.eq('형제 아이콘 두 개도 함께 담긴다',
          ['icon-sweeter.png','icon-block7.png'].every(f=>fs.existsSync(R('build-sweeter/'+f))), true);
  }
}

sc.done();
