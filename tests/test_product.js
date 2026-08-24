// 제품 분리(BLOCK7 / Sweeter) 안전 시나리오.
//
// 왜 있나: Sweeter 는 말씀 기능만 쓰는 제품인데, **같은 계정이면 클라우드 문서
// 하나를 BLOCK7 과 함께 쓴다.** 그래서 "할일을 모르는 앱이 할일을 지워 버리는"
// 사고가 날 수 있다 — 2026-08-02 대량 삭제와 같은 부류다.
// 여기서 그 경계를 못박는다. 화면을 만들기 **전에** 이 테스트가 먼저 있어야 한다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbBaseJson=null;', '// 원격/병합 상태를 화면'));

function clone(o){return JSON.parse(JSON.stringify(o));}

// BLOCK7 사용자의 전형적인 클라우드 상태 — 할일도 있고 말씀 기록도 있다
function fullState(){
  return {
    days:{
      '2026-08-20':{big:{am:[{text:'설교 준비',done:false}]},small:{},trash:[]},
      '2026-08-21':{big:{pm:[{text:'심방',done:false}]},small:{},trash:[]}
    },
    verseCollections:[{id:'c1',name:'네비게이토 180',refs:['요 3:16']}],
    contacts:[{id:'p1',name:'김집사'}],
    memorizationLog:{'2026-08-20':{am:[{ref:'요 3:16',time:'09:00'}]}},
    verseLikeLog:{'2026-08-20':[{ref:'시 23:1',time:'09:10',sec:'am'}]},
    settings:{theme:'dark',uiLevel:'power',vfFontStep:2}
  };
}

// ═══ 1. Sweeter 가 말씀만 고쳐도 할일은 온전해야 한다 (정상 편집) ═══
// Sweeter 는 할일 화면을 안 보여줄 뿐, 상태의 모양은 BLOCK7 과 똑같이 들고 있다.
console.log('시나리오 1 — Sweeter 가 말씀 반응을 남겨도 BLOCK7 할일은 그대로');
{
  const base=fullState();
  const cloud=clone(base);
  const local=clone(base);                       // Sweeter 기기: 전체 모양을 그대로 가짐
  local.verseLikeLog['2026-08-20'].push({ref:'롬 8:28',time:'11:00',sec:'am'});
  const m=_fbMerge(base,local,cloud);
  sc.eq('할일 날짜 2개 그대로',Object.keys(m.days).sort(),['2026-08-20','2026-08-21']);
  sc.eq('설교 준비 살아 있음',m.days['2026-08-20'].big.am[0].text,'설교 준비');
  sc.eq('연락처 살아 있음',m.contacts.length,1);
  sc.eq('Sweeter 가 남긴 좋아요 반영',m.verseLikeLog['2026-08-20'].length,2);
}

// ═══ 2. 양쪽에서 동시에 편집해도 서로를 지우지 않는다 ═══
console.log('시나리오 2 — BLOCK7 은 할일, Sweeter 는 말씀을 동시에 고침');
{
  const base=fullState();
  const cloud=clone(base);                       // BLOCK7 기기: 할일 추가
  cloud.days['2026-08-22']={big:{am:[{text:'주보 인쇄',done:false}]},small:{},trash:[]};
  const local=clone(base);                       // Sweeter 기기: 말씀 모음에 구절 추가
  local.verseCollections[0].refs.push('시 23:1');
  const m=_fbMerge(base,local,cloud);
  sc.eq('BLOCK7 이 넣은 할일 보존',m.days['2026-08-22'].big.am[0].text,'주보 인쇄');
  sc.eq('Sweeter 가 넣은 구절 보존',m.verseCollections[0].refs.length,2);
}

// ═══ 3. 없는 필드는 절대 이기지 않는다 (이미 들어 있는 방어) ═══
// _mgWhole 첫 두 줄이 "한쪽에 없으면 있는 쪽을 쓴다" 이다. 덕분에 할일을 아예
// 모르는 앱이 붙어도 클라우드의 할일이 살아남는다. Sweeter 의 안전은 이 두 줄에
// 얹혀 있으므로, 누가 최적화한다며 지우지 못하도록 여기서 못박아 둔다.
console.log('시나리오 3 — 필드를 아예 모르는 앱이 붙어도 남의 데이터는 살아남는다');
{
  const cloud=fullState();
  const unaware={                                // days·contacts 라는 키 자체가 없다
    verseCollections:clone(cloud.verseCollections),
    memorizationLog:clone(cloud.memorizationLog),
    verseLikeLog:clone(cloud.verseLikeLog),
    settings:clone(cloud.settings)
  };
  const m=_fbMerge(null,unaware,cloud,false);    // base 모름 + 로컬 우선 = 가장 불리한 경로
  sc.eq('할일 보존',Object.keys(m.days||{}).sort(),['2026-08-20','2026-08-21']);
  sc.eq('연락처 보존',(m.contacts||[]).length,1);

  // ⚠️ 단, 이 보호는 **base 를 모를 때만** 이다. base 를 아는 평소 편집에서는
  //    "키가 없다" 가 "사용자가 지웠다" 와 구분되지 않는다 — 아래가 그 증거다.
  //    그래서 이 보호에 기대면 안 되고, 상태 모양 자체를 지켜야 한다(3-2).
  const m2=_fbMerge(fullState(),unaware,cloud,false);
  sc.eq('base 를 알면 보호가 없다 — 삭제로 읽힌다',Object.keys(m2.days||{}).length,0);
}

// ═══ 3-2. ⚠️ 진짜 위험한 것 — 키는 있는데 비워서 올리는 경우 ═══
// Sweeter 가 자기만의 applyRemoteState 를 만들어 ST.days 를 안 채우면, ST.days 는
// 기본값 {} 인 채로 남는다. 그건 "모른다"가 아니라 "사용자가 전부 지웠다"로 읽힌다.
// 아래가 그 증거다 — 그래서 Sweeter 는 applyRemoteState 와 defaultState 를
// BLOCK7 과 **같은 것으로** 써야 하고, 화면만 달라야 한다.
console.log('시나리오 3-2 — 키를 비워서 올리면 삭제로 읽힌다 (그래서 상태 계층은 공용)');
{
  const base=fullState();
  const cloud=clone(base);
  const halfAware=clone(base);
  halfAware.days={};                             // 받아 놓고 ST 에 안 옮긴 상태
  const m=_fbMerge(base,halfAware,cloud,false);
  sc.eq('할일이 삭제로 처리된다',Object.keys(m.days||{}).length,0);
}

// ═══ 4. 대량 손실 방어 — 복구 경로에서 절반 넘게 사라지면 클라우드를 택한다 ═══
// _fbMergeGuarded 는 복구 경로에서 결과가 클라우드의 절반 아래로 떨어지면
// 클라우드 쪽을 채택한다. 모양을 깎은 앱이 그 그물에 걸리는지 확인한다.
console.log('시나리오 4 — 대량 손실 방어가 그물 역할을 하는가');
{
  const cloud=fullState();
  const wiped=clone(cloud);
  wiped.days={};                                 // 할일이 통째로 빈 채로 올라온다
  wiped.contacts=[];
  _fbBaseJson='{}';                              // 클라우드를 받아 본 적 있는 기기
  const g=_fbMergeGuarded(null,wiped,cloud,false);
  sc.eq('방어가 걸려 할일이 되살아난다',Object.keys(g.days||{}).sort(),['2026-08-20','2026-08-21']);
  _fbBaseJson=null;
}

// ═══ 5. 말씀 기록만 있는 사용자는 그 그물에 걸리는가 ═══
// Sweeter 전용 사용자는 할일이 없다. 그 사람의 데이터가 통째로 날아갈 때도
// 방어가 작동해야 한다 — 지금 세는 대상에 말씀 기록이 들어 있는지 확인한다.
console.log('시나리오 5 — 말씀 기록만 있는 사용자의 대량 손실');
{
  const cloud={
    days:{}, contacts:[],
    verseCollections:[{id:'c1',name:'내 모음',refs:['요 3:16']}],
    memorizationLog:{
      '2026-08-18':{am:[{ref:'요 3:16',time:'09:00'}]},
      '2026-08-19':{am:[{ref:'시 23:1',time:'09:00'}]},
      '2026-08-20':{am:[{ref:'롬 8:28',time:'09:00'}]},
      '2026-08-21':{am:[{ref:'빌 4:13',time:'09:00'}]},
      '2026-08-22':{am:[{ref:'사 41:10',time:'09:00'}]}
    },
    settings:{theme:'dark'}
  };
  const wiped={days:{},contacts:[],verseCollections:[],memorizationLog:{},settings:{theme:'dark'}};
  sc.eq('세는 대상에 암송 기록이 포함되는가',_fbCountItems(cloud)>=6,true);
  sc.eq('암송 기록이 통째로 날아가면 대량 손실로 잡히는가',_fbBulkLoss(cloud,wiped),true);
}

// ═══ 6. 할일이 많은 사람의 말씀 기록이 통째로 날아가는 경우 ═══
// 갈래별로 세기 전에는 이게 통과됐다 — 할일 개수가 커서 합계로 보면 절반 아래로
// 안 떨어졌기 때문이다. Sweeter 이전에도 BLOCK7 에 있던 구멍이다.
console.log('시나리오 6 — 할일이 많으면 말씀 기록 전멸이 가려지던 문제');
{
  const cloud={days:{},verseLikeLog:{},memorizationLog:{},settings:{}};
  for(let i=1;i<=30;i++){
    cloud.days['2026-07-'+String(i).padStart(2,'0')]=
      {big:{am:[{text:'할일'+i,done:false}]},small:{},trash:[]};
  }
  for(let i=1;i<=8;i++){
    cloud.memorizationLog['2026-08-'+String(i).padStart(2,'0')]=
      {am:[{ref:'요 3:'+i,time:'09:00'}]};
  }
  const wiped=clone(cloud);
  wiped.memorizationLog={};                      // 암송 기록만 전멸, 할일은 멀쩡
  sc.eq('한 갈래만 전멸해도 대량 손실로 잡힌다',_fbBulkLoss(cloud,wiped),true);
}

// ═══ 7. 사람이 실제로 지운 것까지 되돌리면 안 된다 (오작동 확인) ═══
// 방어가 너무 예민하면 "정리 좀 했다" 를 사고로 오해해 되살려 버린다.
// 절반 선을 넘지 않는 정상적인 삭제는 그대로 통과해야 한다.
console.log('시나리오 7 — 정상적인 삭제는 방어에 걸리지 않는다');
{
  const cloud={days:{},memorizationLog:{},settings:{}};
  for(let i=1;i<=20;i++){
    cloud.days['2026-07-'+String(i).padStart(2,'0')]=
      {big:{am:[{text:'할일'+i,done:false}]},small:{},trash:[]};
  }
  const tidied=clone(cloud);
  ['2026-07-01','2026-07-02','2026-07-03','2026-07-04','2026-07-05']
    .forEach(d=>{delete tidied.days[d];});       // 20개 중 5개 정리 (25%)
  sc.eq('4분의 1을 지운 것은 사고가 아니다',_fbBulkLoss(cloud,tidied),false);

  const few={days:{'2026-07-01':{big:{am:[{text:'하나',done:false}]},small:{},trash:[]}}};
  sc.eq('원래 항목이 적으면 아예 세지 않는다',_fbBulkLoss(few,{days:{}}),false);
}

sc.done();
