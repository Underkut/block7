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

sc.done();
