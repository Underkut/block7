// 긴급 표시(urgent) — 데이터 계층 시나리오.
// CLAUDE.md 규칙: 데이터 계층(저장·동기화)을 고칠 때는 tests/ 에 병합 시나리오를
// 먼저 둔다. 이 파일은 그 시나리오다 — index.html 의 병합 함수를 그대로 끌어와
// 실제로 돌려 본다 (test_merge.js 와 같은 방식).
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

function clone(o){return JSON.parse(JSON.stringify(o));}

// ═══ 시나리오 1: urgent 를 모르는(구버전) 기기가 다른 칸만 고쳐도 유실 없음 ═══
// ⚠️ 구버전 기기는 새 필드를 "지우는" 게 아니다 — 체크박스 클릭 등은
//    arr[i].done=... 처럼 **같은 객체를 그 자리에서 고칠 뿐**이라, 모르는
//    필드(urgent)는 그냥 그대로 실려 돌아온다(JSON 은 모르는 키도 보존한다).
//    그래서 "구버전 기기 문서"는 필드가 사라진 게 아니라 **그대로 있는 채로
//    다른 칸만 바뀐** 모습이다. (진짜 사라지는 경우는 트래시·복제·다른 날짜로
//    옮기기처럼 필드를 하나하나 나열해 새 객체를 만드는 자리뿐인데, urgent 는
//    그런 자리들에 애초에 실어 보내지 않기로 했다 — 위 주석 참고. 그러니
//    "지워졌는데 병합이 못 알아본다"는 일이 안 생긴다.)
console.log('시나리오 1 — 구버전 기기가 다른 칸만 고쳐도 긴급 표시가 살아남는다');
{
  const base={days:{'2026-09-14':{big:{am:[{text:'설교 준비',done:false,urgent:true,urgentRank:1,urgentAt:1000}]},small:{},trash:[]}}};
  const cloud=clone(base);
  cloud.days['2026-09-14'].big.am[0].done=true; // 구버전 기기가 완료 체크만 함 — urgent 는 그대로 실려 있다
  const local=clone(base); // 신버전 기기는 그대로(안 바꿈)
  const m=_fbMerge(base,local,cloud);
  const it=m.days['2026-09-14'].big.am[0];
  sc.eq('구버전 기기의 완료 체크는 반영',it.done,true);
  sc.eq('긴급 표시는 유실되지 않는다',it.urgent,true);
  sc.eq('랭크도 유지',it.urgentRank,1);
}
// ═══ 시나리오 1-2: 정말로 한쪽이 필드를 지웠고 다른 쪽은 base 그대로일 때 ═══
// 이건 urgent 만의 문제가 아니라 병합기 전체가 쓰는 일반 규칙("base 와 같은데
// 상대가 없앴다 → 지운 것으로 본다")이 그대로 적용된 것이다 — flag 등 다른
// 칸도 똑같이 동작한다. 놀랄 동작이 아니라 **의도된 동작**임을 고정해 둔다.
console.log('시나리오 1-2 — 정말로 지워졌을 땐 일반 규칙대로 삭제로 본다(의도된 동작)');
{
  const base={days:{'2026-09-14':{big:{am:[{text:'설교 준비',done:false,urgent:true,urgentRank:1,urgentAt:1000}]},small:{},trash:[]}}};
  const cloud=clone(base);
  delete cloud.days['2026-09-14'].big.am[0].urgent;
  delete cloud.days['2026-09-14'].big.am[0].urgentRank;
  delete cloud.days['2026-09-14'].big.am[0].urgentAt;
  const local=clone(base); // 로컬은 안 바꿈(=base 와 동일)
  const m=_fbMerge(base,local,cloud);
  sc.eq('flag 등 다른 칸과 같은 일반 규칙이 적용된다',m.days['2026-09-14'].big.am[0].urgent,undefined);
}

// ═══ 시나리오 2: flag 와 대칭으로 필드 단위 병합된다(한쪽만 켜도 산다) ═══
console.log('시나리오 2 — flag 와 같은 방식으로 필드 단위 병합');
{
  const base={days:{'2026-09-14':{big:{am:[{text:'주일예배',done:false}]},small:{},trash:[]}}};
  const local=clone(base);local.days['2026-09-14'].big.am[0].done=true;       // 로컬: 완료 체크
  const cloud=clone(base);
  cloud.days['2026-09-14'].big.am[0].urgent=true;                            // 클라우드: 긴급 표시
  cloud.days['2026-09-14'].big.am[0].urgentRank=1;
  cloud.days['2026-09-14'].big.am[0].urgentAt=5000;
  const m=_fbMerge(base,local,cloud);
  const it=m.days['2026-09-14'].big.am[0];
  sc.eq('제목이 같으면 칸 단위로 합쳐진다 — 완료 체크 보존',it.done,true);
  sc.eq('긴급 표시도 함께 보존',it.urgent,true);
}

// ═══ 시나리오 3: 두 제품이 상태를 공유 — 한쪽이 비어 있어도 지운 것으로 오판 안 함 ═══
// (Sweeter 는 이 필드를 안 쓰더라도, 값이 없다고 해서 "지웠다"고 읽으면 안 된다.
//  실제로는 애초에 BLOCK7 문서 자체가 product 별로 안 갈리는 필드라 이 시나리오는
//  이미 시나리오 1 과 같은 경로를 타지만, 명시적으로 한 번 더 고정해 둔다.)
console.log('시나리오 3 — 값이 비어 있다고 지운 것으로 오판하지 않는다');
{
  const base={days:{'2026-09-14':{big:{am:[{text:'심방',done:false,urgent:true,urgentRank:2,urgentAt:2000}]},small:{},trash:[]}}};
  const local=clone(base); // 로컬은 안 바꿈
  const cloud=clone(base); cloud.days['2026-09-14'].big.am[0].text='심방 전화'; // 클라우드는 제목만 바꿈
  const m=_fbMerge(base,local,cloud);
  const it=m.days['2026-09-14'].big.am[0];
  sc.eq('제목 변경 반영',it.text,'심방 전화');
  sc.eq('안 바뀐 쪽(로컬)의 긴급 표시가 그대로 산다',it.urgent,true);
  sc.eq('랭크도 그대로',it.urgentRank,2);
}

// ═══ 시나리오 4: 두 기기가 동시에 각자 다른 할일을 긴급 표시 → 합치면 3개+ ═══
// 병합 후에는 결정론적으로 "가장 먼저 표시된(urgentAt 이른) 2개"만 남기고
// 나머지는 조용히 끈다.
console.log('시나리오 4 — 병합 중 한도(하루 2개) 초과 정리');
{
  const base={days:{'2026-09-14':{
    big:{am:[{text:'A',done:false},{text:'B',done:false}],pm:[{text:'C',done:false}]},
    small:{},trash:[]
  }}};
  const local=clone(base);
  local.days['2026-09-14'].big.am[0].urgent=true;   // A — 로컬이 09:00 에 긴급 표시
  local.days['2026-09-14'].big.am[0].urgentRank=1;
  local.days['2026-09-14'].big.am[0].urgentAt=9000;
  const cloud=clone(base);
  cloud.days['2026-09-14'].big.am[1].urgent=true;   // B — 클라우드가 08:00 에 긴급 표시(더 이름)
  cloud.days['2026-09-14'].big.am[1].urgentRank=1;
  cloud.days['2026-09-14'].big.am[1].urgentAt=8000;
  cloud.days['2026-09-14'].big.pm[0].urgent=true;   // C — 클라우드가 10:00 에 긴급 표시
  cloud.days['2026-09-14'].big.pm[0].urgentRank=2;
  cloud.days['2026-09-14'].big.pm[0].urgentAt=10000;
  const m=_fbMerge(base,local,cloud);
  const day=m.days['2026-09-14'];
  const urgentTexts=[];
  ['am','pm'].forEach(sec=>(day.big[sec]||[]).forEach(it=>{if(it.urgent)urgentTexts.push(it.text);}));
  urgentTexts.sort();
  sc.eq('한도(2개)를 넘지 않는다',urgentTexts.length,2);
  sc.eq('가장 먼저 켠 두 개만 남는다(A 08:00 B, 09:00 A → C 는 탈락)',urgentTexts,['A','B']);
  const bItem=day.big.am[1],aItem=day.big.am[0],cItem=day.big.pm[0];
  sc.eq('C는 긴급 표시가 꺼진다',cItem.urgent,undefined);
  sc.eq('남은 둘은 이른 순서대로 1·2순위를 다시 받는다',[bItem.urgentRank,aItem.urgentRank],[1,2]);
}

// ═══ 시나리오 5: 한도 안이면 그대로 둘 다 살아남는다(오탐 없음) ═══
console.log('시나리오 5 — 한도 안이면 손대지 않는다');
{
  const base={days:{'2026-09-14':{big:{am:[{text:'A',done:false},{text:'B',done:false}]},small:{},trash:[]}}};
  const local=clone(base);
  local.days['2026-09-14'].big.am[0].urgent=true;local.days['2026-09-14'].big.am[0].urgentRank=1;local.days['2026-09-14'].big.am[0].urgentAt=1000;
  const cloud=clone(base);
  cloud.days['2026-09-14'].big.am[1].urgent=true;cloud.days['2026-09-14'].big.am[1].urgentRank=2;cloud.days['2026-09-14'].big.am[1].urgentAt=2000;
  const m=_fbMerge(base,local,cloud);
  const day=m.days['2026-09-14'];
  sc.eq('둘 다 긴급 표시로 남는다',[day.big.am[0].urgent,day.big.am[1].urgent],[true,true]);
}

sc.done();
