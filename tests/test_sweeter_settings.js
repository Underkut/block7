// Sweeter 설정창 — BLOCK7 말씀설정창과 갈라지는 자리 (v26-0921-6)
//
// ⚠️ 두 제품이 **같은 설정창 HTML** 을 쓴다. 그래서 Sweeter 에서 무엇을 빼든
//    BLOCK7 에서는 **예전 그대로**여야 한다. 그것을 못 박는 시험이다.
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT='sweeter', LV='power';
function _swOn(){return APP_PRODUCT==='sweeter';}
function verseUiLevel(){return LV;}
const EL={};
function mk(id,tag){return EL[id]={id,textContent:'',className:tag||''};}
mk('vsetTitle');
global.document={getElementById:id=>EL[id]||null,
  querySelector:q=>(q==='#verseSettingsPanel .settings-title'?EL.vsetTitle:null),
  addEventListener:()=>{}};
global.window={addEventListener:()=>{}};

eval(sliceDev('const VERSE_SETTINGS_TABS=', '\nlet _currentVerseSettingsTabIdx')
       .replace(/^const /gm,'var '));

// ═══ 1. Sweeter 는 '상단 말씀'·'말씀 위젯' 탭이 없다 ═══
console.log('시나리오 1 — 탭 목록');
{
  APP_PRODUCT='sweeter';LV='power';
  const t=_vstabList();
  sc.eq('상단 말씀 탭 없음', t.includes('top'), false);
  sc.eq('말씀 위젯 탭 없음', t.includes('widget'), false);
  sc.eq('나머지는 그대로', t, ['view','alarm','full','share','coll']);

  // ⭐ BLOCK7 은 예전 그대로여야 한다
  APP_PRODUCT='block7';
  sc.eq('⭐ BLOCK7 은 일곱 탭 그대로', _vstabList(), VERSE_SETTINGS_TABS);

  // 등급 규칙은 두 제품에서 그대로 걸린다
  LV='easy';
  sc.eq('BLOCK7 이지: 위젯·공유가 빠진다', _vstabList(), ['top','view','alarm','full','coll']);
  APP_PRODUCT='sweeter';
  sc.eq('Sweeter 이지: 넷만 남는다', _vstabList(), ['view','alarm','full','coll']);
  LV='power';
}

// ═══ 2. ⚠️ 첫 탭이 'top' 이 아닐 수 있다 ═══
console.log('\n시나리오 2 — 열 때 어느 탭으로 가나');
{
  // 'top' 을 못 박으면 Sweeter 에서 **아무 탭도 안 열린다** (그 탭이 없으니
  // switchVerseSettingsTab 이 idx<0 으로 그냥 돌아 나간다).
  sc.eq('⭐ 보이는 첫 탭으로 연다',
        SRC.includes("switchVerseSettingsTab(_vstabList()[0]||'view',null,'direct')"), true);
  sc.eq("'top' 을 못 박지 않는다",
        SRC.includes("switchVerseSettingsTab('top',null,'direct')"), false);
  APP_PRODUCT='sweeter';
  sc.eq('Sweeter 의 첫 탭은 뷰', _vstabList()[0], 'view');
  APP_PRODUCT='block7';
  sc.eq('BLOCK7 의 첫 탭은 예전 그대로', _vstabList()[0], 'top');
}

// ═══ 3. 설정창 이름 ═══
console.log('\n시나리오 3 — 설정창 이름');
{
  APP_PRODUCT='sweeter';_vsetTitleSync();
  sc.eq('Sweeter 는 그냥 "설정"', EL.vsetTitle.textContent, '설정');
  APP_PRODUCT='block7';_vsetTitleSync();
  sc.eq('⭐ BLOCK7 은 "말씀 설정" 그대로', EL.vsetTitle.textContent, '말씀 설정');
}

// ═══ 4. 공유 이미지 워드마크 ═══
console.log('\n시나리오 4 — 공유 이미지 우상단');
{
  sc.eq('제품에 따라 갈린다', SRC.includes("const MARK=_mkSw?'Sweeter':'BLOCK7';"), true);
  sc.eq('Sweeter 는 한 덩어리로 그린다',
        SRC.includes("ctx.fillStyle=th.tx2;_cardTextLS(ctx,MARK,lx,fy,LS,'left');"), true);
  sc.eq('⭐ BLOCK7 은 BLOCK + 7(강조색) 그대로',
        SRC.includes("ctx.fillStyle=th.ac;_cardTextLS(ctx,'7',lx,fy,LS,'left');"), true);
  sc.eq('자간도 갈린다 (소문자는 좁게)', SRC.includes('const LS=fs*(_mkSw?0.05:0.18);'), true);
  sc.eq('공유 탭 단추 글자도 제품 이름',
        SRC.includes("_b7btn.textContent=(typeof _swOn==='function'&&_swOn())?'Sweeter':'BLOCK7';"), true);
}

// ═══ 5. 톱니·버전 배지 ═══
console.log('\n시나리오 5 — 톱니와 개발자 버전');
{
  // 톱니는 BLOCK7 설정 단추와 **같은 path** 여야 한다
  const cog=(SRC.match(/M10\.6 3\.2h-1\.2a\.8\.8 0 0 0-\.78\.62/g)||[]).length;
  sc.eq('⭐ BLOCK7 톱니와 같은 그림을 쓴다 (두 곳)', cog, 2);
  sc.eq('테두리·박스는 없다 (.sw-iconbtn)', SRC.includes('.sw-iconbtn{background:none;border:0;'), true);
  // 개발자 버전 — 클래스만 붙이면 _syncDevVerBadge 가 알아서 채운다
  sc.eq('배지가 Sweeter 바에 있다', SRC.includes('class="settings-verbadge sw-verbadge"'), true);
  sc.eq('개발자에게만 보인다 (공용 장치를 그대로 쓴다)',
        /function _syncDevVerBadge\(\)\{[\s\S]{0,120}_isDevAccount\(\)/.test(SRC), true);
  // ⚠️ 자리를 차지하면 안 된다 — 다른 사용자의 화면이 밀리면 안 된다
  sc.eq('⭐ 자리를 차지하지 않는다 (absolute)',
        /\.settings-verbadge\{position:absolute/.test(SRC), true);
  sc.eq('바에 기준점만 준다', SRC.includes('.sw-bar{position:relative;}'), true);
}

sc.done();
