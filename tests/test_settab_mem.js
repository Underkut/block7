// v26-1024-19 — 설정창은 이 기기에서 마지막에 쓰던 탭으로 열린다 (HB 2026-10-24)
// "설정창 탭은 항상 마지막으로 사용한 탭을 기억해서 열어 주면 좋겠다, 기기별로.
//  특별히 탭으로 보내라고 정해 둔 단추는 예외."
//
// 지키는 것:
//  ① 사람이 탭을 누르거나 밀어 넘긴 것만 기억한다
//  ② 정해 둔 탭으로 보내는 단추(_vsetGoTab · openSettings('account') …)는 기억을 바꾸지 않는다
//  ③ 기억은 이 기기 전용 이름(_lsk) — 제품 · 빌드가 갈리면 따로
//  ④ 기억한 탭이 지금 등급 · 제품에서 안 보이면 첫 탭
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// 기억 함수들을 그대로 떼어 와 돌린다
const memSrc = slice('let _setTabJump=false;', "// '계정' 으로 바로 가는 길 하나");
const store = {};
const env = {};
new Function('env', `
  const LS_KEY='b7v1';
  function _lsk(name){return LS_KEY+'_'+name;}
  const localStorage={getItem:k=>env.store[k]??null,setItem:(k,v)=>{env.store[k]=String(v);}};
  let _vlist=['coll','top','widget','view','full','share','alarm'];
  function _vstabList(){return _vlist;}
  ${memSrc}
  env.api={
    put:_setTabMemPut, get:_setTabMemGet, start:_vsetStartTab,
    jump:(v)=>{_setTabJump=v;}, want:(v)=>{_vsetWantTab=v;},
    setList:(l)=>{_vlist=l;}
  };
`)(Object.assign(env, { store }));
const A = env.api;

console.log('시나리오 1 — 누른 탭을 기억하고 그 탭으로 연다');
{
  sc.eq('처음엔 기억이 없어 첫 탭', A.start(), 'coll');
  A.put('v', 'share');
  sc.eq('공유를 누른 뒤엔 공유로', A.start(), 'share');
  sc.eq('이 기기 전용 이름(_lsk)', store['b7v1_vsetTab'], 'share');
  A.put('g', 'notify');
  sc.eq('일반 설정은 따로 기억', [store['b7v1_setTab'], A.get('g'), A.get('v')], ['notify', 'notify', 'share']);
}

console.log('\n시나리오 2 — 정해 둔 탭으로 보내는 단추는 기억을 바꾸지 않는다');
{
  A.jump(true); A.put('v', 'coll'); A.jump(false);
  sc.eq('보내는 동안 누른 것은 기억 안 함', A.get('v'), 'share');
  A.want('alarm');
  sc.eq('_vsetGoTab 이 정한 탭으로 열린다', A.start(), 'alarm');
  sc.eq('한 번 쓰면 비운다 — 다음엔 다시 기억한 탭', A.start(), 'share');
}

console.log('\n시나리오 3 — 기억한 탭이 지금 안 보이면 첫 탭');
{
  A.setList(['coll', 'top', 'view', 'full', 'alarm']);          // 이지: 위젯 · 공유 없음
  sc.eq('이지에서 공유를 기억했어도 첫 탭', A.start(), 'coll');
  A.setList(['coll', 'view', 'full', 'share', 'alarm', 'account']); // Sweeter
  A.put('v', 'account');
  sc.eq('Sweeter 계정 탭도 기억', A.start(), 'account');
  store['b7v1_vsetTab'] = 'buttons';                                // 없어진 옛 탭 이름
  sc.eq('모르는 이름이면 첫 탭', A.start(), 'coll');
}

console.log('\n시나리오 4 — 배선');
{
  sc.eq('말씀 설정을 열 때 기억한 탭', /function openVerseSettingsModal\(\)\{[^{}]*switchVerseSettingsTab\(_vsetStartTab\(\),null,'direct'\);/.test(SRC), true);
  const sw = slice('function switchSettingsTab(id,btn,direction){', '// Slide the track');
  sc.eq('일반 설정 탭 단추를 누르면 기억', sw.includes("if(btn)_setTabMemPut('g',id);"), true);
  const vw = slice('function switchVerseSettingsTab(id,btn,direction){', "const track=document.getElementById('verseSettingsTabTrack');");
  sc.eq('말씀 설정 탭 단추를 누르면 기억', vw.includes("if(btn)_setTabMemPut('v',id);"), true);
  sc.eq('밀어 넘기기도 기억 (두 창 × 이웃 · 끝에서 돌기)',
        (SRC.match(/_setTabMemPut\('g',_stabList\(\)\[target\.idx\]\)/g) || []).length === 2
        && (SRC.match(/_setTabMemPut\('v',_vstabList\(\)\[target\.idx\]\)/g) || []).length === 2, true);
  const os = slice('function openSettings(tabId,flashTabId){', '// 설정 탭 버튼(둥근 네모)을 3번 반짝인다');
  sc.eq('정해 준 탭(tabId)은 기억 없이', /_setTabJump=true;[\s\S]{0,80}switchSettingsTab\(tabId,btn,'direct'\);\s*_setTabJump=false;/.test(os), true);
  sc.eq('그 밖엔 기억한 탭', os.includes("const mem=_setTabMemGet('g');") && os.includes('_stabList().includes(mem)'), true);
  const go = slice('function _vsetGoTab(id,flash){', '// 화면 곳곳의');
  sc.eq('_vsetGoTab 은 정한 탭으로 열고 기억 안 함', go.includes('_vsetWantTab=id;') && go.includes('_setTabJump=true;') && go.includes('}finally{_setTabJump=false;}'), true);
  sc.eq('저장 키를 고정 이름으로 만들지 않는다', /localStorage\.(get|set)Item\('b7v1_(v?setTab)'/.test(SRC), false);
}

sc.done();
