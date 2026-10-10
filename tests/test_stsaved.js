// 기기 저장 칸이 차면 '기준점이 ST 보다 새것' 이 되어 다음 부팅에 지워지던 것 (v26-1010-12)
//
// ⚠️⚠️ HB 신고 — 읽기 계획 탭이 **두 번** 통째로 사라졌다 (2026-10-09 밤 · 10-10 오후, 둘 다 새 버전을 받아 다시 켠 직후).
//   길은 이렇다 —
//     · 이 기기 저장 칸(localStorage)은 기기 용량과 따로 사이트마다 약 5MB 다
//     · 차면 ST 저장(rawSave)이 **조용히** 실패한다 (try/catch 로 삼킨다)
//     · 그런데 동기화 기준점(base)은 따로 적히고, 그쪽은 들어갈 수 있다
//     · 그러면 기기에 남은 것은 '낡은 ST + 새 기준점'
//     · 다시 켜면 부팅 병합 _fbMerge(기준점, ST, 클라우드) 가 그 차이 — 그사이 생긴 것 전부 — 를
//       "이 기기에서 지웠다" 로 읽고 클라우드까지 지운다. 모든 기기가 따라 지워진다.
//
// 고친 것 셋 (index.html 'ST 적기' · _fbSetBase · _fbLoadPersistedBase):
//   ① ST 를 적을 때마다 시각 도장, 기준점 메타에도 시각 → 켤 때 기준점이 더 새것이면 믿지 않는다
//   ② ST 저장이 실패하면 기준점부터 치우고 한 번 더 적는다
//   ③ 그런 세션에는 기준점을 더 남기지 않는다
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

global.document={visibilityState:'visible',addEventListener:()=>{}};
global.showToast=()=>{};

// ── localStorage 흉내 — 키마다 '못 적게' 만들 수 있다 (저장 칸이 찬 것) ──
const STORE={};let FAIL=new Set();
global.localStorage={
  getItem:k=>(STORE[k]===undefined?null:STORE[k]),
  setItem:(k,v)=>{if(FAIL.has(k)){const e=new Error('QuotaExceededError');e.name='QuotaExceededError';throw e;}STORE[k]=String(v);},
  removeItem:k=>{delete STORE[k];},
  get length(){return Object.keys(STORE).length;},
  key:i=>Object.keys(STORE)[i]
};
function reset(){Object.keys(STORE).forEach(k=>delete STORE[k]);FAIL=new Set();_lsTight=false;_lsWarned=false;_fbBaseJson=null;_fbLastSeenRev=-1;}
// 시계 — 같은 ms 에 두 일이 겹치지 않게 한 칸씩
let NOW=1760000000000;const realNow=Date.now;Date.now=()=>(NOW+=5);

// ── 진짜 소스에서 떠온다 ──
var LS_KEY='b7v1';
eval(sliceDev('function _lsk(name){', '\n'));
var ST={};
eval(sliceDev('var _lsTight=false,_lsWarned=false;', 'function rawSave(){').replace(/^(?:const|let) /gm,'var '));
var _fbUser={uid:'hb'};
eval(sliceDev('let _fbLastSeenRev=-1;', '// ── 3자 병합 엔진 ──')
       .replace(/^const _FB_BASE_KEY=.*$/m,'var _FB_BASE_KEY=_lsk("syncbase"),_FB_META_KEY=_lsk("syncmeta");')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면').replace(/^(?:const|let) /gm,'var '));

// 부팅 병합 — 진짜 소스의 갈림길을 그대로 옮긴다 (아래 시나리오 6 이 소스와 같은지 본다)
function boot(cloudObj){
  const persisted=_fbLoadPersistedBase('hb');
  if(persisted&&persisted.json!==JSON.stringify(ST)){
    return _fbMerge(JSON.parse(persisted.json),ST,cloudObj);
  }
  return cloudObj;
}
const J=o=>JSON.stringify(o);
const TABS={'43.3':{b:43,c:3,at:1},'45.8':{b:45,c:8,at:2},'1.1':{b:1,c:1,at:3}};
function stateV1(){return{days:{'2026-10-09':{big:{am:[{text:'기도'}]},small:{},trash:[],events:{}}},bibleToRead:{},
  bibleInk:{'a':{v:1}},settings:{theme:'dark'}};}
function stateV2(){const s=stateV1();s.bibleToRead=JSON.parse(J(TABS));s.bibleInk.b={v:2};return s;}
const nTabs=o=>Object.keys((o&&o.bibleToRead)||{}).length;

// ═══ 1. ⚠️ 그 길로 정말 지워진다 (병합 엔진은 맞게 일한다 — 받은 재료가 틀렸다) ═══
console.log('시나리오 1 — 낡은 ST + 새 기준점이면 그사이 생긴 것이 지워진다');
{
  const out=_fbMerge(stateV2(),stateV1(),stateV2());
  sc.eq('⚠️ 읽기 계획 탭이 통째로 사라진다', nTabs(out), 0);
  sc.eq('⚠️ 그사이 그은 표시도 사라진다', Object.keys(out.bibleInk).length, 1);
}

// ═══ 2. 기준점이 ST 보다 새것이면 믿지 않는다 ═══
console.log('\n시나리오 2 — ST 를 못 적은 뒤에 적힌 기준점은 버린다');
{
  reset();
  ST=stateV1();_lsPutST();                       // 어제 — ST 도장
  // 오늘: 탭을 담았다. ST 는 못 적었고(칸이 찼다) 기준점만 들어갔다 — 예전 코드의 모양을 그대로 만든다
  localStorage.setItem('b7v1_syncbase',J(stateV2()));
  localStorage.setItem('b7v1_syncmeta',J({rev:9,uid:'hb',at:Date.now()}));
  ST=JSON.parse(STORE['b7v1']);                  // 다시 켰다 — 기기에 남은 낡은 ST
  sc.eq('기준점을 믿지 않는다', _fbLoadPersistedBase('hb'), null);
  const out=boot(stateV2());
  sc.eq('탭이 살아남는다 (클라우드를 그대로 받는다)', nTabs(out), 3);
  sc.eq('그은 표시도 살아남는다', Object.keys(out.bibleInk).length, 2);
}

// ═══ 3. ST 저장이 실패하면 기준점부터 치우고 다시 적는다 ═══
console.log('\n시나리오 3 — 칸이 차면 기준점을 치워 자리를 만든다');
{
  reset();
  ST=stateV1();_lsPutST();
  _fbSetBase(J(stateV1()),8,'hb');
  sc.eq('처음엔 기준점이 있다', STORE['b7v1_syncbase']!==undefined, true);
  // 칸이 찼다 — ST 첫 시도는 실패, 기준점을 치우면 들어간다
  let first=true;const realSet=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k==='b7v1'&&first&&STORE['b7v1_syncbase']!==undefined){first=false;throw new Error('QuotaExceededError');}return realSet(k,v);};
  ST=stateV2();
  sc.eq('두 번째에 적힌다', _lsPutST(), true);
  localStorage.setItem=realSet;
  sc.eq('ST 는 새것', nTabs(JSON.parse(STORE['b7v1'])), 3);
  sc.eq('기준점은 치워졌다', STORE['b7v1_syncbase'], undefined);
  sc.eq('메타도 치워졌다', STORE['b7v1_syncmeta'], undefined);
  sc.eq('이번 세션은 빠듯하다고 적어 둔다', _lsTight, true);
  // 그 뒤 커밋이 기준점을 남기려 해도 남기지 않는다 — ST 가 먼저다
  _fbSetBase(J(stateV2()),9,'hb');
  sc.eq('기준점을 다시 적지 않는다', STORE['b7v1_syncbase'], undefined);
  sc.eq('메모리 기준점은 그대로 (이번 세션 병합은 정상)', _fbBaseJson!==null, true);
  const out=boot(stateV2());
  sc.eq('다시 켜도 탭이 그대로', nTabs(out), 3);
}

// ═══ 4. 끝내 못 적어도 지우지 않는다 ═══
console.log('\n시나리오 4 — ST 를 끝내 못 적는 기기');
{
  reset();
  ST=stateV1();_lsPutST();_fbSetBase(J(stateV1()),8,'hb');
  FAIL.add('b7v1');                                // 이제 ST 는 한 번도 못 적는다
  let toasts=0;global.showToast=()=>{toasts++;};
  ST=stateV2();
  sc.eq('적지 못했다고 알린다', _lsPutST(), false);
  _lsPutST();
  sc.eq('안내는 한 번만', toasts, 1);
  global.showToast=()=>{};
  _fbSetBase(J(stateV2()),9,'hb');                 // 커밋은 클라우드에 올라갔다
  sc.eq('기준점이 남지 않는다', STORE['b7v1_syncbase'], undefined);
  ST=JSON.parse(STORE['b7v1']);                    // 다시 켰다 — 어제 ST
  const out=boot(stateV2());
  sc.eq('클라우드의 탭이 산다', nTabs(out), 3);
}

// ═══ 5. 평소에는 예전과 같다 ═══
console.log('\n시나리오 5 — 평소 동작은 그대로');
{
  reset();
  // 받은 것을 기준점으로 → 화면에 반영하며 ST 저장 (리스너·부팅의 순서)
  _fbSetBase(J(stateV2()),9,'hb');ST=stateV2();_lsPutST();
  const got=_fbLoadPersistedBase('hb');
  sc.eq('ST 를 그 뒤에 적었으면 기준점을 믿는다', !!got&&got.rev, 9);
  // 이 기기에서 탭 하나를 뺐다 (클라우드엔 아직 안 갔다) → 다시 켜도 뺀 것이 산다
  delete ST.bibleToRead['1.1'];_lsPutST();
  ST=JSON.parse(STORE['b7v1']);
  const out=boot(stateV2());
  sc.eq('이 기기에서 뺀 것은 빠진 채로 (삭제가 되살아나지 않는다)', nTabs(out), 2);
  // 옛 메타(at 없음) — 이 판을 처음 받는 기기는 예전처럼 믿는다
  localStorage.setItem('b7v1_syncmeta',J({rev:9,uid:'hb'}));
  sc.eq('옛 메타는 그대로 믿는다', !!_fbLoadPersistedBase('hb'), true);
  sc.eq('다른 계정 기준점은 여전히 안 쓴다', _fbLoadPersistedBase('남'), null);
}

// ═══ 7. 빈 기기로 로그인하면 (CLAUDE.md — 동기화를 고치면 반드시) ═══
console.log('\n시나리오 7 — 빈 기기로 로그인해도 클라우드는 그대로');
{
  reset();
  ST={days:{},bibleToRead:{},bibleInk:{},settings:{theme:'system'}};   // 갓 설치 — 기본값
  sc.eq('빈 기기에는 기준점이 없다', _fbLoadPersistedBase('hb'), null);
  const out=boot(stateV2());
  sc.eq('클라우드를 그대로 받는다 — 탭', nTabs(out), 3);
  sc.eq('클라우드를 그대로 받는다 — 할일', Object.keys(out.days).length, 1);
  // 받은 뒤의 순서(기준점 → ST) 그대로 적으면 다음 부팅에는 기준점을 믿는다
  _fbSetBase(J(out),9,'hb');ST=out;_lsPutST();
  sc.eq('다음 부팅부터는 기준점을 쓴다', !!_fbLoadPersistedBase('hb'), true);
  // 칸이 빠듯한 빈 기기 — ST 를 못 적어도 클라우드에서 아무것도 지우지 않는다
  reset();FAIL.add('b7v1');ST={days:{},bibleToRead:{},settings:{}};
  _fbSetBase(J(stateV2()),9,'hb');_lsPutST();
  sc.eq('빠듯한 빈 기기 — 기준점도 안 남는다', STORE['b7v1_syncbase'], undefined);
  sc.eq('빠듯한 빈 기기 — 다시 켜도 클라우드 그대로', nTabs(boot(stateV2())), 3);
}

// ═══ 6. 소스가 이 시험과 같은 모양인가 ═══
console.log('\n시나리오 6 — 소스 확인');
{
  const direct=(SRC.match(/localStorage\.setItem\(LS_KEY,/g)||[]).length;
  sc.eq('ST 를 직접 적는 곳은 _lsPutST 안 한 곳뿐', direct, 1);
  sc.eq('rawSave 가 _lsPutST 를 부른다', /function rawSave\(\)\{[\s\S]{0,200}_lsPutST\(\);/.test(SRC), true);
  sc.eq('부팅 — 기준점을 적은 뒤에 ST 를 적는다', /_fbSetBase\(data\.json,cloudRev,user\.uid\);\s*_lsPutST\(\);/.test(SRC), true);
  sc.eq('부팅 병합의 갈림길이 시험과 같다', /if\(persisted&&persisted\.json!==JSON\.stringify\(ST\)\)\{/.test(SRC), true);
  sc.eq('원격 반영도 _lsPutST', /applyRemoteState\(stateObj\);\s*_lsPutST\(\);/.test(SRC), true);
  sc.eq('기준점 메타에 시각', /JSON\.stringify\(\{rev:_fbLastSeenRev,uid:[^}]*,at:Date\.now\(\)\}\)/.test(SRC), true);
}

Date.now=realNow;
sc.done();
