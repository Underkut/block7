// 제품별 설정 가르기 — BLOCK7 과 Sweeter 가 같은 계정을 써도
// "공유할 설정"과 "따로 둘 설정"이 섞이지 않는지.
//
// ⚠️ 가장 중요한 것은 마지막 갈래다: APP_PRODUCT 가 기본값인 동안
//    이 장치는 **아무 일도 하지 않아야 한다.** 지금 쓰는 사람들의 저장 내용이
//    한 글자도 바뀌면 안 된다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };

// 제품 계층 (상수는 const 라 통째로 떠서 두 벌 만든다 — 아래에서 제품별로 eval)
const LAYER = slice('const _PRODUCT_SCOPED=[', '// Auth screen');
const MERGE = slice('let _fbBaseJson=null;', '// 원격/병합 상태를 화면');

function clone(o){return JSON.parse(JSON.stringify(o));}

// 한 제품으로 동작하는 계층을 만든다 (APP_PRODUCT 를 갈아끼워 eval)
function asProduct(name){
  const box={};
  const src='const APP_PRODUCT='+JSON.stringify(name)+';'
          + 'const APP_PRODUCT_DEFAULT="block7";'
          + 'const _PRODUCT_SCOPED=[' + LAYER.split('const _PRODUCT_SCOPED=[')[1];
  const fn=new Function(src+'\nreturn {_psIsDefault,_psOverlay,_psProject,_PRODUCT_SCOPED};');
  Object.assign(box,fn());
  return box;
}
const B7=asProduct('block7');
const SW=asProduct('sweeter');

// ═══ 1. 목록이 제대로 실려 있는가 ═══
console.log('시나리오 1 — 갈라야 할 설정 목록');
{
  sc.eq('유저 등급은 제품별',B7._PRODUCT_SCOPED.includes('uiLevel'),true);
  sc.eq('알림은 제품별',B7._PRODUCT_SCOPED.includes('verseAlarm'),true);
  sc.eq('전체화면 글자 크기는 제품별',B7._PRODUCT_SCOPED.includes('vfTextScale'),true);
  sc.eq('말씀 모음 필터는 공유(목록에 없음)',B7._PRODUCT_SCOPED.includes('verseCountScope'),false);
  sc.eq('제외 기준은 공유(목록에 없음)',B7._PRODUCT_SCOPED.includes('vgTagExcludeMax'),false);
}

// ═══ 2. BLOCK7 은 아무것도 달라지지 않는다 ═══
console.log('시나리오 2 — 기본 제품에서는 장치가 잠들어 있다');
{
  const st={settings:{uiLevel:'power',vfTextScale:0.6,verseCountScope:'all'},days:{}};
  sc.eq('덮어쓰기 안 함',B7._psOverlay(st.settings,{sweeter:{uiLevel:'easy'}}).uiLevel,'power');
  sc.eq('올릴 때도 그대로',B7._psProject(st,null),st);
  sc.eq('productSettings 를 만들지도 않음',B7._psProject(st,null).productSettings,undefined);
}

// ═══ 3. Sweeter 에서 바꾼 개인 설정이 BLOCK7 것을 덮지 않는다 ═══
console.log('시나리오 3 — Sweeter 가 글자를 키워도 BLOCK7 글자는 그대로');
{
  const cloud={settings:{uiLevel:'power',vfTextScale:0.6,verseCountScope:'all'},productSettings:{}};
  // Sweeter 기기: 받아서 → 등급을 이지로, 글자를 키움
  const shown=SW._psOverlay(clone(cloud.settings),cloud.productSettings);
  sc.eq('처음엔 BLOCK7 값을 보여준다',shown.uiLevel,'power');
  const edited=Object.assign({},shown,{uiLevel:'easy',vfTextScale:0.9,verseCountScope:'today'});
  const out=SW._psProject({settings:edited,productSettings:{}},cloud);

  sc.eq('BLOCK7 등급은 그대로',out.settings.uiLevel,'power');
  sc.eq('BLOCK7 글자 크기도 그대로',out.settings.vfTextScale,0.6);
  sc.eq('Sweeter 등급은 따로 보관',out.productSettings.sweeter.uiLevel,'easy');
  sc.eq('Sweeter 글자 크기도 따로 보관',out.productSettings.sweeter.vfTextScale,0.9);
  sc.eq('공유 설정은 그대로 공유된다',out.settings.verseCountScope,'today');
  sc.eq('공유 설정은 개인 칸에 안 들어간다',out.productSettings.sweeter.verseCountScope,undefined);
}

// ═══ 4. 다시 열면 Sweeter 는 자기 설정을 본다 ═══
console.log('시나리오 4 — 왕복');
{
  const cloud={settings:{uiLevel:'power',vfTextScale:0.6},
               productSettings:{sweeter:{uiLevel:'easy',vfTextScale:0.9}}};
  const sw=SW._psOverlay(clone(cloud.settings),cloud.productSettings);
  sc.eq('Sweeter 는 자기 등급을 본다',sw.uiLevel,'easy');
  sc.eq('Sweeter 는 자기 글자 크기를 본다',sw.vfTextScale,0.9);
  const b7=B7._psOverlay(clone(cloud.settings),cloud.productSettings);
  sc.eq('BLOCK7 은 자기 등급을 본다',b7.uiLevel,'power');
  sc.eq('BLOCK7 은 자기 글자 크기를 본다',b7.vfTextScale,0.6);
}

// ═══ 5. 병합 — 두 제품의 개인 설정이 서로를 지우지 않는다 ═══
console.log('시나리오 5 — 병합에서 두 제품 칸이 공존한다');
{
  eval(MERGE);
  const base={settings:{uiLevel:'power'},productSettings:{sweeter:{uiLevel:'easy'}}};
  const cloud=clone(base);                       // Sweeter 기기가 글자 크기를 바꿈
  cloud.productSettings.sweeter.vfTextScale=0.9;
  const local=clone(base);                       // BLOCK7 기기가 자기 등급을 바꿈
  local.settings.uiLevel='mid';
  const m=_fbMerge(base,local,cloud);
  sc.eq('BLOCK7 변경 보존',m.settings.uiLevel,'mid');
  sc.eq('Sweeter 변경 보존',m.productSettings.sweeter.vfTextScale,0.9);
  sc.eq('Sweeter 기존 설정 보존',m.productSettings.sweeter.uiLevel,'easy');
}

// ═══ 6. ⚠️ BLOCK7 이 Sweeter 칸을 들고 가지 않으면 어떻게 되는가 ═══
// applyRemoteState 가 productSettings 를 ST 에 안 옮기면 이 일이 난다.
// 그래서 옮기게 해 뒀고, defaultState 에도 자리를 만들어 뒀다.
console.log('시나리오 6 — 남의 제품 칸을 안 들고 가면 지워진다 (그래서 들고 간다)');
{
  const base={settings:{},productSettings:{sweeter:{uiLevel:'easy'}}};
  const cloud=clone(base);
  const forgetful=clone(base);
  delete forgetful.productSettings;              // 안 들고 간 BLOCK7 기기
  const bad=_fbMerge(base,forgetful,cloud);
  sc.eq('안 들고 가면 Sweeter 설정이 사라진다',(bad.productSettings||{}).sweeter,undefined);

  const careful=clone(base);                     // 그대로 들고 간 BLOCK7 기기
  const good=_fbMerge(base,careful,cloud);
  sc.eq('들고 가면 보존된다',good.productSettings.sweeter.uiLevel,'easy');
}

sc.done();
