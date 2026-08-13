// 3자 병합 엔진 — 여러 기기 동기화가 서로를 덮어쓰지 않는지
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));


function clone(o){return JSON.parse(JSON.stringify(o));}

// ═══ 시나리오 1: 인계 문서 5-1의 사고 그대로 ═══
// base = 10시 상태. 아이폰(cloud)이 완료 체크 + 새 할일 + 필터 기간 변경.
// 맥(local)은 10시 상태에서 다른 날짜에 할일 하나만 추가하고 저장 시도.
console.log('시나리오 1 — 백그라운드 기기가 최신을 덮어쓰던 사고');
{
  const base={
    days:{'2026-07-30':{big:{am:[{text:'설교 준비',done:false}]},small:{},trash:[]}},
    settings:{periodBaseMode:'calendar',vCustomFrom:'2026-07-11',vCustomTo:'2026-07-30',theme:'dark'},
    verseLikeLog:{}
  };
  const cloud=clone(base); // 아이폰: 완료 체크 + 새 할일 + 직접 기간 변경 (11시 상태)
  cloud.days['2026-07-30'].big.am[0].done=true;
  cloud.days['2026-07-30'].big.am.push({text:'심방 전화',done:false});
  cloud.settings.vCustomFrom='2026-07-21';
  const local=clone(base); // 맥: 다른 날짜에 할일 추가 (10시 상태 기반)
  local.days['2026-07-31']={big:{am:[{text:'주보 인쇄',done:false}]},small:{},trash:[]};
  const m=_fbMerge(base,local,cloud);
  sc.eq('아이폰의 완료 체크 보존',m.days['2026-07-30'].big.am[0].done,true);
  sc.eq('아이폰의 새 할일 보존',m.days['2026-07-30'].big.am[1].text,'심방 전화');
  sc.eq('아이폰의 직접 기간 변경 보존',m.settings.vCustomFrom,'2026-07-21');
  sc.eq('맥의 새 날짜 할일도 보존',m.days['2026-07-31'].big.am[0].text,'주보 인쇄');
}

// ═══ 시나리오 2: 두 기기가 각각 남긴 좋아요·암송 로그 합집합 ═══
console.log('시나리오 2 — 로그 합집합');
{
  const base={verseLikeLog:{'2026-07-31':[{ref:'시 23:1',time:'09:00',sec:'am'}]},memorizationLog:{}};
  const local=clone(base);
  local.verseLikeLog['2026-07-31'].push({ref:'요 3:16',time:'10:00',sec:'am'});
  local.memorizationLog['2026-07-31']={am:[{ref:'시 23:1',time:'10:05'}]};
  const cloud=clone(base);
  cloud.verseLikeLog['2026-07-31'].push({ref:'롬 8:28',time:'11:00',sec:'am'});
  cloud.memorizationLog['2026-07-31']={pm:[{ref:'빌 4:13',time:'13:00'}]};
  const m=_fbMerge(base,local,cloud);
  sc.eq('좋아요 3건 전부 보존',m.verseLikeLog['2026-07-31'].length,3);
  sc.eq('암송 로그 양쪽 구간 공존',Object.keys(m.memorizationLog['2026-07-31']).sort(),['am','pm']);
}

// ═══ 시나리오 3: 같은 날 같은 구간 동시 편집 (진짜 충돌) → 로컬 우선 ═══
console.log('시나리오 3 — 진짜 충돌은 로컬 우선');
{
  const base={days:{'2026-07-31':{big:{am:[{text:'A',done:false}]},small:{},trash:[]}}};
  const local=clone(base);local.days['2026-07-31'].big.am[0].text='A-로컬수정';
  const cloud=clone(base);cloud.days['2026-07-31'].big.am[0].text='A-클라우드수정';
  const m=_fbMerge(base,local,cloud);
  sc.eq('같은 구간 배열 충돌 시 로컬',m.days['2026-07-31'].big.am[0].text,'A-로컬수정');
}

// ═══ 시나리오 4: 삭제 전파 ═══
console.log('시나리오 4 — 삭제');
{
  const base={days:{'2026-07-30':{big:{am:[{text:'X',done:false}]},small:{},trash:[]},
                    '2026-07-29':{big:{am:[{text:'Y',done:false}]},small:{},trash:[]}},
              verseCollections:[{id:'c1',name:'모음1',verses:[]},{id:'c2',name:'모음2',verses:[]}],
              contacts:[{id:'p1',nick:'김'},{id:'p2',nick:'이'}]};
  const local=clone(base);
  local.days['2026-07-30'].big.am=[];              // 할일 삭제(배열 변경)
  delete local.days['2026-07-29'];                 // 빈 날짜 정리로 날짜 자체 삭제
  local.verseCollections=local.verseCollections.filter(c=>c.id!=='c2'); // 모음 삭제
  const cloud=clone(base);
  cloud.contacts.push({id:'p3',nick:'박'});        // 클라우드는 연락처만 추가
  const m=_fbMerge(base,local,cloud);
  sc.eq('할일 삭제 유지',m.days['2026-07-30'].big.am.length,0);
  sc.eq('날짜 삭제 유지',m.days['2026-07-29'],undefined);
  sc.eq('모음 삭제 유지',m.verseCollections.map(c=>c.id),['c1']);
  sc.eq('클라우드의 연락처 추가 보존',m.contacts.map(c=>c.id),['p1','p2','p3']);
}

// ═══ 시나리오 5: 클라우드가 새로 만든 것은 로컬에 없어도 삭제로 오인하지 않음 ═══
console.log('시나리오 5 — 신규 vs 삭제 구분');
{
  const base={days:{}};
  const local={days:{}};
  const cloud={days:{'2026-08-01':{big:{am:[{text:'새 할일',done:false}]},small:{},trash:[]}}};
  const m=_fbMerge(base,local,cloud);
  sc.eq('클라우드 신규 날짜 유입',m.days['2026-08-01'].big.am[0].text,'새 할일');
}

// ═══ 시나리오 6: settings 키 단위 병합 ═══
console.log('시나리오 6 — settings 키 단위');
{
  const base={settings:{periodBaseMode:'calendar',theme:'dark',bigLimit:6}};
  const local=clone(base);local.settings.periodBaseMode='rolling';
  const cloud=clone(base);cloud.settings.theme='light';
  const m=_fbMerge(base,local,cloud);
  sc.eq('로컬의 periodBaseMode',m.settings.periodBaseMode,'rolling');
  sc.eq('클라우드의 theme',m.settings.theme,'light');
  sc.eq('변경 없는 키 유지',m.settings.bigLimit,6);
}

// ═══ 시나리오 7: base 없음(업데이트 직후 첫 실행) — 안전한 축소 동작 ═══
console.log('시나리오 7 — base 없음');
{
  const local={days:{'2026-07-31':{big:{am:[{text:'로컬',done:false}]},small:{},trash:[]}},
               verseLikeLog:{'2026-07-31':[{ref:'시 1:1',time:'09:00'}]}};
  const cloud={days:{'2026-07-30':{big:{am:[{text:'클라우드',done:false}]},small:{},trash:[]}},
               verseLikeLog:{'2026-07-31':[{ref:'시 1:1',time:'09:00'},{ref:'요 1:1',time:'10:00'}]}};
  const m=_fbMerge(null,local,cloud);
  sc.eq('양쪽 날짜 공존(통째 덮어쓰기 아님)',Object.keys(m.days).sort(),['2026-07-30','2026-07-31']);
  sc.eq('로그는 큰 쪽 합집합',m.verseLikeLog['2026-07-31'].length,2);
}

// ═══ 시나리오 8: 로그 항목 삭제(감소분)도 3자에서 반영 ═══
console.log('시나리오 8 — 로그 감소분');
{
  const base={verseLikeLog:{'2026-07-31':[{ref:'시 1:1',time:'09:00'},{ref:'시 1:1',time:'09:00'},{ref:'요 1:1',time:'10:00'}]}};
  const local=clone(base);local.verseLikeLog['2026-07-31'].splice(0,1); // 하나 삭제 → 시1:1 ×1
  const cloud=clone(base);cloud.verseLikeLog['2026-07-31'].push({ref:'롬 1:1',time:'11:00'}); // 하나 추가
  const m=_fbMerge(base,local,cloud);
  const bag={};m.verseLikeLog['2026-07-31'].forEach(e=>{bag[e.ref]=(bag[e.ref]||0)+1;});
  sc.eq('삭제 반영(시1:1 2→1)',bag['시 1:1'],1);
  sc.eq('추가 반영(롬1:1)',bag['롬 1:1'],1);
  sc.eq('무관 항목 유지(요1:1)',bag['요 1:1'],1);
}

// ═══ 시나리오 8: 클라우드를 아직 못 받은 기기가 빈 상태로 덮어쓰던 사고 (0813-2) ═══
// ⚠️ 네 번째 재발. 지금까지의 방어는 "누가 낡았는가"만 봤고 "내 손에 든 것이
//    믿을 만한가"는 보지 않았다. 초기 fetch 가 실패한 기기는 ST 가 기본값인데
//    리스너로 스냅샷이 오면 쓰기가 열리고 곧바로 복구 경로(로컬 우선)를 타서
//    빈 로컬이 충돌에서 이겼다. 합집합인 로그만 살고 할일·설정·배치가 사라졌다.
console.log('\n시나리오 8 — 빈 기기가 남의 데이터를 지우던 것');
{
  // HB 가 아이패드 미니에서 만들어 둔 상태
  const cloud={
    days:{'2026-08-13':{big:{night:[
      {text:'2구간 구매',done:false},{text:'중등 진도표',done:false},
      {text:'블레이즈 요금',done:false},{text:'부산 재정 마무리',done:false}]},small:{},trash:[]}},
    settings:{hiBold:true,hiPen:true,hiWave:true,hiStar:true,hiOverlap:2,
              layout:{cols:{left:['todo'],center:['card#c1'],right:['card#c2','likeList']}}},
    verseLikeLog:{'2026-08-13':[{ref:'시 23:1',time:'09:00',sec:'am'}]},
    verseCollections:[]
  };
  // 갓 열린 기기 — 아직 아무것도 못 받아 기본값뿐
  const fresh={
    // ⚠️ 갓 열린 앱도 '오늘'을 그리면서 날짜 칸을 만든다. 칸이 아예 없으면
    //    합집합이 클라우드를 그대로 두지만, **빈 칸이 있으면** 충돌이 되어 진다.
    days:{'2026-08-13':{big:{night:[]},small:{},trash:[]}},
    settings:{hiBold:true,hiPen:false,hiWave:false,hiStar:false,hiOverlap:1,
              layout:{cols:{left:['todo'],center:[],right:[]}}},
    verseLikeLog:{},verseCollections:[]
  };

  global._fbBaseJson=null;              // 이 계정 클라우드를 한 번도 받은 적 없다
  const m=_fbMergeGuarded(null,clone(fresh),clone(cloud),false);
  sc.eq('할일이 살아남는다',(m.days['2026-08-13']||{}).big.night.length,4);
  sc.eq('첫 할일 그대로',m.days['2026-08-13'].big.night[0].text,'2구간 구매');
  sc.eq('강조 설정이 살아남는다',[m.settings.hiPen,m.settings.hiWave,m.settings.hiStar],[true,true,true]);
  sc.eq('겹쳐쓰기 값도',m.settings.hiOverlap,2);
  sc.eq('말씀카드 위젯이 살아남는다',m.settings.layout.cols.right,['card#c2','likeList']);
  sc.eq('가운데 칸 위젯도',m.settings.layout.cols.center,['card#c1']);
  sc.eq('로그는 원래도 합집합이라 무사',m.verseLikeLog['2026-08-13'].length,1);

  // ⚠️ 고치기 전 동작 — 빈 로컬이 이겨 전부 사라졌다 (이 단언이 사고를 고정한다)
  const before=_fbMerge(null,clone(fresh),clone(cloud),false);
  sc.eq('고치기 전에는 할일이 사라졌다',before.days['2026-08-13'].big.night.length,0);
  sc.eq('고치기 전에는 강조도 꺼졌다',before.settings.hiPen,false);
  sc.eq('고치기 전에도 로그는 살았다',before.verseLikeLog['2026-08-13'].length,1);
}

// ═══ 시나리오 9: 제대로 받아 둔 기기는 예전처럼 로컬이 이겨야 한다 ═══
// (구버전 기기가 지운 것을 되살리는 7-2-2 의 정상 동작 — 깨뜨리면 안 된다)
console.log('\n시나리오 9 — 받아 둔 기기는 그대로 복구한다');
{
  const good={
    days:{'2026-08-13':{big:{night:[{text:'2구간 구매',done:false},{text:'중등 진도표',done:false},
                                     {text:'블레이즈 요금',done:false},{text:'부산 재정 마무리',done:false}]},small:{},trash:[]}},
    settings:{hiPen:true,layout:{cols:{left:['todo'],center:['card#c1'],right:['card#c2']}}},
    verseCollections:[]
  };
  // 구버전 기기가 모르는 위젯을 지우고 올린 상태
  const legacyCloud=clone(good);
  legacyCloud.settings.layout.cols.center=[];
  legacyCloud.settings.layout.cols.right=[];

  global._fbBaseJson=JSON.stringify(good);   // 이 기기는 클라우드를 받아 봤다
  const m=_fbMergeGuarded(null,clone(good),legacyCloud,false);
  sc.eq('지워진 위젯을 되살린다',m.settings.layout.cols.center,['card#c1']);
  sc.eq('오른쪽 위젯도 되살린다',m.settings.layout.cols.right,['card#c2']);
  sc.eq('할일은 그대로',m.days['2026-08-13'].big.night.length,4);
}

// ═══ 시나리오 10: 대량 손실 방어 ═══
console.log('\n시나리오 10 — 절반 넘게 사라지면 클라우드를 채택한다');
{
  const many={text:'x',done:false};
  const cloud={
    days:{'2026-08-13':{big:{night:Array.from({length:10},(_,i)=>({text:'할일'+i,done:false}))},small:{},trash:[]}},
    settings:{layout:{cols:{left:['todo'],center:[],right:[]}}},verseCollections:[]
  };
  const almostEmpty={
    days:{'2026-08-13':{big:{night:[{text:'할일0',done:false}]},small:{},trash:[]}},
    settings:{layout:{cols:{left:['todo'],center:[],right:[]}}},verseCollections:[]
  };
  global._fbBaseJson=JSON.stringify({});     // 받아 본 적은 있다고 두고
  const m=_fbMergeGuarded(null,almostEmpty,clone(cloud),false);
  sc.eq('대량 손실이면 클라우드 채택',m.days['2026-08-13'].big.night.length,10);

  // 세는 방식 — 할일·위젯·모음·연락처를 모두 센다
  sc.eq('할일을 센다',_fbCountItems(cloud),10+1);
  sc.eq('세 겹 구조를 제대로 센다',
        _fbCountItems({days:{d1:{big:{am:[1,2],pm:[3]},small:{night:[4]},trash:[5]}}}),5);
  sc.eq('위젯도 센다',
        _fbCountItems({settings:{layout:{cols:{left:['a','b'],right:['c']}}}}),3);
  sc.eq('모음·연락처도 센다',
        _fbCountItems({verseCollections:['a','b'],contacts:['c']}),3);
  sc.eq('빈 상태는 0',_fbCountItems({}),0);

  // 자료가 적으면(신규 계정 등) 방어가 끼어들지 않는다
  const tiny={days:{'2026-08-13':{big:{night:[{text:'하나',done:false}]},small:{},trash:[]}}};
  sc.eq('적은 자료에는 안 끼어든다',_fbBulkLoss(tiny,{days:{}}),false);
  // base 를 아는 평소 편집 경로는 방어가 손대지 않는다 (사람의 실제 삭제를 막지 않게)
  global._fbBaseJson=JSON.stringify(cloud);
  const del=clone(cloud);del.days['2026-08-13'].big.night=[];
  const m2=_fbMergeGuarded(cloud,del,clone(cloud),false);
  sc.eq('사람이 지운 것은 그대로 지워진다',m2.days['2026-08-13'].big.night.length,0);
  global._fbBaseJson=null;
}

sc.done();
