// Sweeter 운영본 (sweeter.my) — v26-0919-6
//
// ⚠️⚠️ 이 시험이 답하는 물음은 **하나**다. CLAUDE.md 가 올리기 전에 반드시
//   실제로 돌려 보라고 못 박아 둔 그 물음 —
//
//        "빈 기기로 로그인하면 클라우드가 어떻게 되는가"
//
//   Sweeter 운영본은 **비어 있는 새 도메인**에서 시작한다. 저장 칸도, 기준점도,
//   소유자 표시도 전부 없다. 그 상태로 HB 계정에 로그인하면 —
//   2026-08-31 에 데이터를 날린 그 조건과 **겉모습이 똑같다.**
//   다른 것은 딱 하나, v26-0919-5 에서 기준점 키를 제품별로 가른 것뿐이다.
//   그 한 가지로 정말 충분한지를 여기서 끝까지 따진다.
//
// 지키는 것:
//  ① 로그인 경로가 **병합을 아예 타지 않는다** (통째로 받는 길로 간다)
//  ② 그래도 혹시 병합을 타면 클라우드가 살아남는다 (두 겹으로 막는다)
//  ③ 받은 뒤 처음 저장할 때 BLOCK7 의 화면 설정을 **되돌려 놓는다**
//  ④ 말씀·할일·연락처·기록이 한 줄도 안 줄어든다
//  ⑤ 빌드 스크립트가 로그인 꺼진 앱이나 BLOCK7 을 sweeter.my 로 내보내지 않는다
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
const fs = require('fs'), path = require('path');

global.document={visibilityState:'visible',addEventListener:()=>{},getElementById:()=>null};
global.window={addEventListener:()=>{}};

// ── 두 제품이 **다른 도메인**에 있다: 저장소가 통째로 따로다 ──
const STORE_BLOCK7={}, STORE_SWEETER={};
let STORE=STORE_SWEETER;
global.localStorage={
  getItem:k=>(STORE[k]===undefined?null:STORE[k]),
  setItem:(k,v)=>{STORE[k]=String(v);},
  removeItem:k=>{delete STORE[k];}
};

let APP_PRODUCT='sweeter';
const APP_PRODUCT_DEFAULT='block7';
let LS_KEY='b7v1_sweeter';
eval(sliceDev('function _lsk(name){', '\n'));

// 제품 칸막이 · 기기 칸막이 · 기본 상태 — 전부 진짜를 떠온다
eval(sliceDev('const _PRODUCT_SCOPED=[', '// ── 이 기기에서 알림 받기')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('function _psIsDefault(){', '\n// Auth screen')
       .replace(/^(?:const|let) /gm,'var '));
let ST={},SECS=null;
function _secNormalizeTimes(){}
eval(sliceDev('function defaultState(){', 'function load(){')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('function applyRemoteState(remote){', '\n// Start listening'));
// 소유자 표시 · 기준점 — 진짜를 떠온다
eval(sliceDev('function _localOwner(){', '\n// 로컬 상태를 기본값으로'));
let _fbUser={uid:'hb'},_fbBaseJson=null,_fbLastSeenRev=-1;
eval(sliceDev('function _fbSetBase(json,rev,uid){', '// ── 3자 병합 엔진 ──')
       .replace(/^const _FB_BASE_KEY=.*$/m,
                'var _FB_BASE_KEY=_lsk("syncbase"),_FB_META_KEY=_lsk("syncmeta");')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
       .replace(/^(?:const|let) /gm,'var '));

// ⚠️ 진짜 앱에서는 빌드마다 LS_KEY 가 하나로 굳는다. 이 시험은 한 프로세스에서
//    두 제품을 번갈아 흉내내야 하므로, 제품을 바꿀 때 **키 이름을 다시 만든다.**
//    (한 번 빠뜨렸더니 BLOCK7 이 Sweeter 칸에 적는 엉뚱한 상황이 됐다)
function useProduct(prod,lsKey,store){
  APP_PRODUCT=prod;LS_KEY=lsKey;STORE=store;
  _FB_BASE_KEY=_lsk('syncbase');_FB_META_KEY=_lsk('syncmeta');
  _fbBaseJson=null;_fbLastSeenRev=-1;
}

// ── HB 의 진짜 모양에 가까운 클라우드 문서 ──
function cloudDoc(){
  const verses=[];
  for(let i=1;i<=120;i++)verses.push({id:'v'+i,ref:'요 3:'+i,krText:'본문 '+i,cat:'주일설교',tags:['사랑']});
  const props=[];
  for(let i=1;i<=275;i++)props.push({id:'p'+i,ref:'롬 8:'+i,krText:'명제 '+i,cat:'로마서',pid:'P'+i,kind:'prop'});
  const days={};
  for(let i=1;i<=30;i++)days['2026-08-'+String(i).padStart(2,'0')]=
    {big:{am:[{text:'할일 '+i,done:i%2===0}]},small:{},trash:[],events:{}};
  return{
    vis:['am','pm','night'],prevVis:null,preset:null,collapsed:[],days,
    verseCollections:[{id:'vc1',name:'2026 주일설교',verses},
                      {id:'vc2',name:'로마서 명제집',verses:props}],
    contacts:[{id:'c1',name:'김집사'},{id:'c2',name:'이권사'},{id:'c3',name:'박목사'}],
    memorizationLog:{'2026-09-01':{am:[{ref:'요 3:16',time:'07:00'}]}},
    verseLikeLog:{'2026-09-02':[{ref:'요 3:16',time:'08:00'}]},
    verseShareLog:{},verseDeeperLog:{},verseEvenDeeperLog:{},
    verseKeepLog:{'2026-09-03':[{ref:'롬 8:28',time:'09:00'}]},
    secs:[{id:'am',name:'오전',startTime:'06:00',endTime:'12:00'}],
    secArchive:[],productSettings:{},
    settings:{activeColls:['vc1','vc2'],collFilters:{vc1:{mode:'all'}},
              // ↓ BLOCK7 이 고른 화면 취향 — Sweeter 가 건드리면 안 되는 것들
              theme:'dark',uiLevel:'power',vfTextScale:1.4,swTiles:undefined,
              // ↓ 두 제품이 같이 쓰는 것
              dayStartHour:3,bigLimit:9}
  };
}
const J=o=>JSON.stringify(o);
const nV=s=>(s.verseCollections||[]).reduce((a,c)=>a+(c.verses||[]).length,0);

// ═══ 1. 로그인 경로는 병합을 타지 않는다 ═══
console.log('시나리오 1 — 빈 기기는 "통째로 받는" 길로 간다');
{
  // BLOCK7 은 제 도메인에서 오래 써 왔다
  useProduct('block7','b7v1',STORE_BLOCK7);
  _setLocalOwner('hb');_fbSetBase(J(cloudDoc()),41,'hb');
  sc.eq('BLOCK7 은 제 칸에 소유자를 적어 뒀다', STORE_BLOCK7['b7v1_owner'], 'hb');

  // 이제 Sweeter 를 sweeter.my 에서 처음 연다 — 저장소가 통째로 따로다
  useProduct('sweeter','b7v1_sweeter',STORE_SWEETER);

  sc.eq('소유자 표시가 없다 → 상태를 기본값으로 되돌린다', _localOwner(), null);
  sc.eq('기준점도 없다 → 병합할 기준이 없다', _fbLoadPersistedBase('hb'), null);
  // 로그인 코드의 갈림길: persisted 가 없으면 applyRemoteState(클라우드) 한 줄이다.
  sc.eq('소스의 갈림길이 그대로인가',
        SRC.includes('if(persisted&&persisted.json!==JSON.stringify(ST)){'), true);
  sc.eq('아니면 통째로 받는다',
        SRC.includes('applyRemoteState(JSON.parse(data.json));'), true);
}

// ═══ 2. 통째로 받으면 무엇이 남는가 ═══
console.log('\n시나리오 2 — 받은 뒤의 내 상태');
{
  useProduct('sweeter','b7v1_sweeter',STORE_SWEETER);
  const cloud=cloudDoc();
  ST=defaultState();
  sc.eq('받기 전에는 비어 있다', nV(ST), 0);
  applyRemoteState(JSON.parse(J(cloud)));
  sc.eq('말씀·명제가 전부 왔다', nV(ST), 395);
  sc.eq('할일 30일치', Object.keys(ST.days).length, 30);
  sc.eq('연락처 3명', ST.contacts.length, 3);
  sc.eq('암송·좋아요·담아둔 것', [Object.keys(ST.memorizationLog).length,
        Object.keys(ST.verseLikeLog).length,Object.keys(ST.verseKeepLog).length], [1,1,1]);
  sc.eq('켜 둔 모음도 그대로', ST.settings.activeColls, ['vc1','vc2']);
  sc.eq('같이 쓰는 설정도 그대로', ST.settings.dayStartHour, 3);
  // 아직 Sweeter 몫이 없으니 BLOCK7 이 고른 것을 물려받는다 (한 번은 물려받는 것이 맞다)
  sc.eq('화면 취향은 일단 물려받는다', ST.settings.theme, 'dark');
}

// ═══ 3. ⚠️ 받은 뒤 처음 저장하면 클라우드가 어떻게 되는가 ═══
console.log('\n시나리오 3 — 처음 저장이 클라우드를 해치지 않는가');
{
  useProduct('sweeter','b7v1_sweeter',STORE_SWEETER);
  const cloud=cloudDoc();
  ST=defaultState();
  applyRemoteState(JSON.parse(J(cloud)));
  _fbSetBase(J(cloud),41,'hb');            // 로그인 코드가 하는 그대로

  // Sweeter 에서 화면 취향을 제 것으로 바꾼다
  ST.settings.theme='light';ST.settings.vfTextScale=2.0;
  ST.settings.swTiles=[{k:'last',s:0}];

  // 저장 경로: 클라우드가 앞서지 않으므로 outState=ST, prior=_fbBaseObj()
  const prior=_fbBaseObj();
  const out=JSON.parse(J(_dsProject(_psProject(ST,prior),prior)));

  sc.eq('말씀·명제가 한 줄도 안 줄었다', nV(out), 395);
  sc.eq('할일도 그대로', Object.keys(out.days).length, 30);
  sc.eq('연락처도 그대로', out.contacts.length, 3);
  sc.eq('담아둔 것도 그대로', Object.keys(out.verseKeepLog).length, 1);
  // ── 여기가 핵심 ──
  sc.eq('⭐ BLOCK7 의 테마가 되돌려졌다', out.settings.theme, 'dark');
  sc.eq('⭐ BLOCK7 의 글자 크기도 되돌려졌다', out.settings.vfTextScale, 1.4);
  sc.eq('Sweeter 몫은 제 칸으로 들어갔다', out.productSettings.sweeter.theme, 'light');
  sc.eq('Sweeter 의 타일 구성도 제 칸으로', out.productSettings.sweeter.swTiles, [{k:'last',s:0}]);
  sc.eq('같이 쓰는 설정은 공용 칸에 남는다', out.settings.dayStartHour, 3);
  sc.eq('켜 둔 모음도 공용 칸에 남는다', out.settings.activeColls, ['vc1','vc2']);
}

// ═══ 4. 두 번째 겹 — 혹시 병합을 타더라도 ═══
console.log('\n시나리오 4 — 병합을 타더라도 클라우드가 이긴다');
{
  // 리스너·복구 경로 등 다른 길로 병합이 도는 경우. 기준점을 모르므로
  // 대량 손실 방어가 켜진다 (이것이 두 번째 겹이다).
  useProduct('sweeter','b7v1_sweeter',STORE_SWEETER);
  const cloud=cloudDoc();
  const out=_fbMergeGuarded(null,defaultState(),cloud,false);
  sc.eq('말씀·명제가 살아남는다', nV(out), 395);
  sc.eq('할일도 살아남는다', Object.keys(out.days).length, 30);
  sc.eq('연락처도 살아남는다', out.contacts.length, 3);
}

// ═══ 5. 로그아웃해도 상대 도메인은 못 건드린다 ═══
console.log('\n시나리오 5 — 한쪽을 지워도 다른 쪽은 그대로');
{
  sc.eq('BLOCK7 칸에 소유자가 남아 있다', STORE_BLOCK7['b7v1_owner'], 'hb');
  sc.eq('BLOCK7 칸에 기준점도 남아 있다', STORE_BLOCK7['b7v1_syncbase']!==undefined, true);
  useProduct('sweeter','b7v1_sweeter',STORE_SWEETER);
  _setLocalOwner(null);_fbClearBase();
  sc.eq('Sweeter 쪽만 지워졌다',
        [STORE_SWEETER['b7v1_sweeter_owner'],STORE_SWEETER['b7v1_sweeter_syncbase']],
        [undefined,undefined]);
  sc.eq('BLOCK7 은 멀쩡하다',
        [STORE_BLOCK7['b7v1_owner'],STORE_BLOCK7['b7v1_syncbase']!==undefined], ['hb',true]);
}

// ═══ 6. 빌드 스크립트 — 잘못된 것을 sweeter.my 로 내보내지 않는가 ═══
console.log('\n시나리오 6 — 무엇을 올리는가');
{
  const mk=fs.readFileSync(path.join(__dirname,'..','tools','make-sweeter-prod.sh'),'utf8');
  sc.eq('제품을 sweeter 로 바꾼다',
        mk.includes(`'const APP_PRODUCT = "block7";','const APP_PRODUCT = "sweeter";'`), true);
  // ⛔️ 개발본 스크립트와 **딱 하나 다른 곳** — DEV_MODE 를 건드리지 않는다
  sc.eq('DEV_MODE 를 true 로 바꾸지 않는다',
        /const DEV_MODE = false;','const DEV_MODE = true;/.test(mk), false);
  sc.eq('대신 false 인지 확인만 한다', mk.includes("out.count('const DEV_MODE = false;')!=1"), true);
  sc.eq('제목·앱이름을 Sweeter 로', mk.includes("'<title>Sweeter</title>'")
        && mk.includes('content="Sweeter"'), true);
  sc.eq('공유 카드 주소도 sweeter.my 로', mk.includes('https://sweeter.my/'), true);

  // 커밋하면 안 되는 산출물이라 .gitignore 에 있어야 한다
  const gi=fs.readFileSync(path.join(__dirname,'..','.gitignore'),'utf8');
  sc.eq('⭐ build-sweeter/ 는 커밋하지 않는다', /^build-sweeter\/$/m.test(gi), true);
  // ⚠️ 커밋되면 block7.my/… 로도 나간다 = 같은 도메인에 로그인 두 벌
  sc.eq('⭐ 저장소에 운영본이 없다',
        fs.existsSync(path.join(__dirname,'..','sweeter.html')), false);

  // 호스팅 설정
  const fb=JSON.parse(fs.readFileSync(path.join(__dirname,'..','firebase.json'),'utf8'));
  const h=(Array.isArray(fb.hosting)?fb.hosting:[fb.hosting]).filter(Boolean);
  sc.eq('사이트는 sweeter7', h.map(x=>x.site), ['sweeter7']);
  sc.eq('올리는 폴더는 build-sweeter', h.map(x=>x.public), ['build-sweeter']);
  sc.eq('functions 설정은 그대로 남아 있다', fb.functions.source, 'functions');

  // 배포 워크플로 — 열쇠가 없어도 빨개지지 않아야 한다
  const wf=fs.readFileSync(path.join(__dirname,'..','.github','workflows','deploy-sweeter.yml'),'utf8');
  sc.eq('열쇠가 없으면 건너뛴다', wf.includes("steps.key.outputs.have == 'yes'"), true);
  sc.eq('올리기 전에 한 번 더 확인한다',
        wf.includes(`grep -q 'const DEV_MODE = false;'`), true);
}

sc.done();
