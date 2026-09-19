// Sweeter — BLOCK7 에서 내 말씀 가져오기 (v26-0919-4)
//
// 이 길은 **데이터 계층**이라 시나리오를 먼저 쓴다 (CLAUDE.md '절대 하지 말 것').
// 지켜야 하는 것 넷:
//  ① BLOCK7 에서는 아무 일도 하지 않는다 — 들여다보지도 않는다.
//  ② BLOCK7 저장 칸은 **읽기만** 한다. 한 글자도 쓰지 않는다.
//  ③ 옮기는 것은 **말씀에 관한 것뿐**이다. 할일·구간·화면 설정은 그대로 둔다.
//  ④ 망가진 값·빈 칸은 조용히 건너뛴다 — 여기서 터지면 Sweeter 가 아예 안 뜬다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT='sweeter';
const LS_KEY='b7v1_sweeter_dev';

// ── localStorage 흉내 — **쓰기를 전부 적어 둔다** (시나리오 ②의 증거) ──
const WROTE=[];
const STORE={};
global.localStorage={
  getItem:k=>(STORE[k]===undefined?null:STORE[k]),
  setItem:(k,v)=>{WROTE.push(k);STORE[k]=String(v);},
  removeItem:k=>{WROTE.push(k);delete STORE[k];}
};
global.document={getElementById:()=>null,querySelector:()=>null,addEventListener:()=>{}};
global.window={addEventListener:()=>{}};

let TOAST='',CONFIRMED=true,CONFIRM_MSG='';
function showToast(m){TOAST=m;}
global.confirm=m=>{CONFIRM_MSG=m;return CONFIRMED;};
let SAVED=0;
function save(){SAVED++;}
let ST={};
let _SW_TILES=[];
function _swRender(){}
function _swEsc(s){return String(s==null?'':s);}
function _invalidateVerseCaches(){}
function renderCollButtons(){}
function _afterActiveVersesChanged(){}

// 진짜 코드를 떠온다 (맨 바깥 const 는 eval 밖으로 안 나오므로 var 로 바꾼다)
eval(sliceDev('// ── BLOCK7 에서 내 말씀 가져오기 ─', '// ── 말씀 모음 타일 ─')
       .replace(/^(?:const|let) /gm,'var '));
function _swOn(){return APP_PRODUCT==='sweeter';}

const COLL=(id,name,refs,del)=>({id,name,
  verses:refs.map(r=>({ref:r,krText:r+' 본문',cat:'설교',topic:'',tags:[]}))
    .concat((del||[]).map(r=>({ref:r,krText:'',del:1})))});
function block7State(){
  return {
    verseCollections:[COLL('vc1','내 모음',['요 3:16','시 1:1','롬 8:28'],['마 5:13']),
                      COLL('vc2','교회 모음',['빌 4:13'])],
    memorizationLog:{'2026-09-01':{am:[{verseIdx:1,time:'07:00'}]}},
    verseLikeLog:{'2026-09-02':[{ref:'요 3:16',time:'08:00'}]},
    verseKeepLog:{'2026-09-03':[{ref:'시 1:1',time:'09:00'}]},
    days:{'2026-09-01':{am:[{t:'할일'}]}},          // ← 옮기면 안 되는 것
    secs:[{id:'am'}],                                // ← 옮기면 안 되는 것
    contacts:[{name:'누구'}],                        // ← 옮기면 안 되는 것
    settings:{activeColls:['vc1','vc2'],collFilters:{vc1:{mode:'all'}},
              theme:'dark',uiLevel:'power',swTiles:[{k:'book',s:0}]}
  };
}
function freshST(){
  return {verseCollections:[],settings:{theme:'light',uiLevel:'easy',
          swTiles:[{k:'last',s:0}],activeColls:['nav180']},
          days:{},contacts:[]};
}
function reset(){
  Object.keys(STORE).forEach(k=>delete STORE[k]);
  WROTE.length=0;TOAST='';CONFIRM_MSG='';CONFIRMED=true;SAVED=0;
  ST=freshST();_SW_TILES=[{k:'last',s:0,p:3}];
  APP_PRODUCT='sweeter';
}

// ═══ 1. BLOCK7 에서는 아무 일도 하지 않는다 ═══
console.log('시나리오 1 — BLOCK7 에서는 잠들어 있다');
{
  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  APP_PRODUCT='block7';
  sc.eq('BLOCK7 에서는 저장 칸을 보지도 않는다', _swBlock7Src(), null);
  sc.eq('가져오기를 불러도 아무 일도 없다', swImportFromBlock7(), false);
  sc.eq('상태가 그대로다', ST.verseCollections.length, 0);
  sc.eq('저장도 안 한다', SAVED, 0);
}

// ═══ 2. 저장 칸을 읽어 말씀 수를 센다 (휴지통은 빼고) ═══
console.log('\n시나리오 2 — 무엇이 얼마나 있는가');
{
  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  const src=_swBlock7Src();
  sc.eq('운영본 칸을 찾았다', src&&src.key, 'b7v1');
  sc.eq('휴지통(del)은 세지 않는다', src&&src.n, 4);
  sc.eq('읽기만 했으므로 쓴 곳이 없다', WROTE, []);
}

// ═══ 3. 말씀 많은 쪽을 고른다 / 빈 칸은 후보가 아니다 ═══
console.log('\n시나리오 3 — 운영본·개발본 가운데 고르기');
{
  reset();
  STORE['b7v1']=JSON.stringify({verseCollections:[]});               // 말씀 0개
  STORE['b7v1_dev']=JSON.stringify({verseCollections:[COLL('d1','개발',['눅 1:1','눅 1:2'])]});
  const src=_swBlock7Src();
  sc.eq('말씀이 있는 쪽을 고른다', src&&src.key, 'b7v1_dev');
  sc.eq('그 수', src&&src.n, 2);

  reset();
  STORE['b7v1']=JSON.stringify({verseCollections:[]});
  sc.eq('말씀이 하나도 없으면 후보가 아니다', _swBlock7Src(), null);
}

// ═══ 4. 망가진 값은 조용히 건너뛴다 ═══
console.log('\n시나리오 4 — 망가진 값');
{
  reset();
  STORE['b7v1']='{이건 JSON 이 아니다';
  let threw=false;try{_swBlock7Src();}catch(e){threw=true;}
  sc.eq('터지지 않는다', threw, false);
  sc.eq('후보도 아니다', _swBlock7Src(), null);

  reset();
  STORE['b7v1']=JSON.stringify([1,2,3]);      // 배열 — 상태가 아니다
  sc.eq('배열은 상태가 아니다', _swBlock7Src(), null);
  reset();
  STORE['b7v1']='null';
  sc.eq('null 도 아니다', _swBlock7Src(), null);
}

// ═══ 5. 옮기는 것은 말씀뿐이다 ═══
console.log('\n시나리오 5 — 말씀만 옮긴다');
{
  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  sc.eq('가져왔다', swImportFromBlock7(), true);
  sc.eq('말씀 수', _swCountVerses(ST), 4);
  sc.eq('모음 두 개가 왔다', ST.verseCollections.map(c=>c.id), ['vc1','vc2']);
  sc.eq('암송 기록도 왔다', Object.keys(ST.memorizationLog), ['2026-09-01']);
  sc.eq('좋아요 기록도 왔다', Object.keys(ST.verseLikeLog), ['2026-09-02']);
  sc.eq('담아둔 것도 왔다', Object.keys(ST.verseKeepLog), ['2026-09-03']);
  sc.eq('켜 둔 모음이 따라왔다', ST.settings.activeColls, ['vc1','vc2']);
  sc.eq('필터도 따라왔다', ST.settings.collFilters.vc1.mode, 'all');
  // ── 안 옮기는 것 ──
  sc.eq('할일은 안 온다', ST.days, {});
  sc.eq('연락처도 안 온다 (Sweeter 것 그대로 빈 채)', ST.contacts, []);
  sc.eq('구간도 안 온다', ST.secs, undefined);
  sc.eq('화면 설정은 Sweeter 것 그대로', ST.settings.theme, 'light');
  sc.eq('유저 등급도 그대로', ST.settings.uiLevel, 'easy');
  sc.eq('타일 구성도 그대로', ST.settings.swTiles, [{k:'last',s:0}]);
  // ── 쓴 곳 ──
  sc.eq('저장은 한 번', SAVED, 1);
  sc.eq('BLOCK7 칸에는 한 글자도 안 썼다', WROTE.filter(k=>k==='b7v1'||k==='b7v1_dev'), []);
  sc.eq('타일은 처음 칸으로 돌아간다', _SW_TILES[0].p, 0);
  sc.eq('알렸다', TOAST, '말씀 4개를 가져왔어요');
}

// ═══ 6. 아니라고 하면 아무 일도 없다 ═══
console.log('\n시나리오 6 — 물어보고 나서 옮긴다');
{
  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  CONFIRMED=false;
  sc.eq('아니라고 했다', swImportFromBlock7(), false);
  sc.eq('한 개도 안 왔다', _swCountVerses(ST), 0);
  sc.eq('저장도 안 했다', SAVED, 0);

  // 덮어쓴다는 말은 **이미 있을 때만** 한다
  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  swImportFromBlock7();
  sc.eq('처음에는 덮어쓴다는 말이 없다', /덮어써집니다/.test(CONFIRM_MSG), false);
  CONFIRM_MSG='';
  swImportFromBlock7();
  sc.eq('두 번째에는 있다', /지금 Sweeter 에 있는 말씀 4개는 덮어써집니다/.test(CONFIRM_MSG), true);
}

// ═══ 7. 찾지 못하면 무엇을 해야 하는지 알려 준다 ═══
console.log('\n시나리오 7 — 못 찾았을 때');
{
  reset();
  sc.eq('가져오지 못했다', swImportFromBlock7(), false);
  sc.eq('할 일을 알려 준다', /사파리|block7\.my/.test(TOAST), true);
  sc.eq('아무것도 안 건드렸다', SAVED, 0);
}

// ═══ 8. 안내 한 줄 — 가져올 것이 있을 때만 ═══
console.log('\n시나리오 8 — 안내 한 줄');
{
  const EL={style:{display:'none'},innerHTML:''};
  global.document.getElementById=id=>(id==='swNotice'?EL:null);

  reset();
  STORE['b7v1']=JSON.stringify(block7State());
  _swSyncNotice();
  sc.eq('비어 있으면 뜬다', EL.style.display, 'flex');
  sc.eq('몇 개인지 말해 준다', /BLOCK7 에 말씀 4개가 있어요/.test(EL.innerHTML), true);
  sc.eq('단추는 가져오기', /가져오기<\/button>/.test(EL.innerHTML), true);
  sc.eq('아직 다시가 아니다', /다시 가져오기/.test(EL.innerHTML), false);

  swImportFromBlock7();
  sc.eq('가져온 뒤엔 사라진다', EL.style.display, 'none');
  sc.eq('내용도 비운다', EL.innerHTML, '');

  // BLOCK7 에 새 설교가 들어왔다
  const b=block7State();
  b.verseCollections[0].verses.push({ref:'약 1:2',krText:'약 1:2 본문'});
  STORE['b7v1']=JSON.stringify(b);
  _swSyncNotice();
  sc.eq('수가 다르면 다시 뜬다', EL.style.display, 'flex');
  sc.eq('양쪽 수를 함께 말한다', /BLOCK7 쪽 말씀은 5개예요 \(여기는 4개\)/.test(EL.innerHTML), true);
  sc.eq('단추는 다시 가져오기', /다시 가져오기/.test(EL.innerHTML), true);

  // BLOCK7 제품에서는 이 줄이 절대 안 뜬다
  APP_PRODUCT='block7';
  EL.style.display='flex';EL.innerHTML='남아 있으면 안 된다';
  _swSyncNotice();
  sc.eq('BLOCK7 에서는 뜨지 않는다', EL.style.display, 'none');
  sc.eq('내용도 지운다', EL.innerHTML, '');
  global.document.getElementById=()=>null;
}

sc.done();
