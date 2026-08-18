// v26-0819-1, HB 1 — 말씀설정창에도 이지/미드/파워 유저 모드.
// 아이콘 헤더 배치는 일반설정창과 같은 방식(탭 내비게이션보다 위)이지만,
// 고른 등급 값은 일반설정창과 따로 저장한다. 아이콘 모양(동물/사각) 세트만 공유.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 말씀설정창 헤더에 등급 버튼 세 개가 있다(탭 내비게이션보다 위)');
{
  const hd = slice('<div class="settings-hd">\n      <div class="settings-title">말씀 설정</div>', '<div class="settings-tab-bar" id="verseSettingsTabBar">');
  sc.eq('이지 버튼', hd.includes(`id="vUiLvEasy"`) && hd.includes(`onclick="setVerseUiLevel('easy')"`), true);
  sc.eq('미드 버튼', hd.includes(`id="vUiLvMid"`) && hd.includes(`onclick="setVerseUiLevel('mid')"`), true);
  sc.eq('파워 버튼', hd.includes(`id="vUiLvPower"`) && hd.includes(`onclick="setVerseUiLevel('power')"`), true);
}

console.log('\n시나리오 2 — 저장값은 일반설정창과 별개(verseUiLevel), 기본값은 power');
{
  sc.eq('기본값 설정에 verseUiLevel:power 가 있다',
        SRC.includes('verseUiLevel:\'power\''), true);
  const fn = slice('function verseUiLevel(){', 'function setVerseUiLevel');
  sc.eq('verseUiLevel() 이 ST.settings.verseUiLevel 을 읽는다', fn.includes('ST.settings||{}).verseUiLevel'), true);
  const setFn = slice('function setVerseUiLevel(v){', 'function applyVerseUiLevel');
  sc.eq('setVerseUiLevel() 이 ST.settings.uiLevel(일반) 이 아니라 verseUiLevel 에 쓴다',
        setFn.includes('ST.settings.verseUiLevel=v;'), true);
}

console.log('\n시나리오 3 — 아이콘 모양(동물/사각) 세트는 일반설정창과 같은 값을 쓴다');
{
  const fn = slice('function _renderVerseUiLevelIcons(){', '}');
  sc.eq('uiLevelIconSet() 을 그대로 쓴다(따로 안 둠)', fn.includes('const set=uiLevelIconSet();'), true);
  const renderAll = slice('function _renderUiLevelIcons(){', 'function _renderVerseUiLevelIcons');
  sc.eq('아이콘 세트를 바꾸면 말씀설정창 헤더도 같이 다시 그린다',
        renderAll.includes('_renderVerseUiLevelIcons();'), true);
}

console.log('\n시나리오 4 — _lvApplyIn 이 명시적 등급을 받을 수 있다(말씀설정창은 항상 verseUiLevel() 을 넘긴다)');
{
  const fn = slice('function _lvApplyIn(root,level){', '}');
  sc.eq('level 을 안 주면 일반 uiLevel() 로 대체', fn.includes('_UILV_KEY[level||uiLevel()]'), true);
  sc.eq('일반설정창은 verseSettingsPanel 을 더는 직접 건드리지 않는다(따로 관리)',
        slice('function applyUiLevel(){','}').includes("getElementById('verseSettingsPanel')"), false);
  const openFn = slice('function openVerseSettingsModal(){', '}');
  sc.eq('말씀설정을 열 때 applyVerseUiLevel() 을 부른다', openFn.includes('applyVerseUiLevel();'), true);
  const applyFn = slice('function applyVerseUiLevel(){', '}');
  sc.eq('verseSettingsPanel 에 verseUiLevel() 을 명시적으로 넘긴다',
        applyFn.includes("_lvApplyIn(document.getElementById('verseSettingsPanel'),verseUiLevel());"), true);
}

sc.done();
