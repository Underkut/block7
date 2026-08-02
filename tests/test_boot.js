// 부팅 순서 개선(5-3 첫 화면 지연)이 기대는 성질을 고정한다 (v26-0803-2)
//
// 새 부팅 순서: 로컬(localStorage)로 화면을 먼저 그리고, 클라우드가 도착하면
// 기존 병합·적용 경로가 다시 그린다. 그 사이에 사용자가 편집할 수 있으므로
// "클라우드 fetch 가 끝나기 전에 만든 편집이 부팅 병합에서 살아남는다"가
// 이 설계의 전제다. 부팅 코드(19880줄 근처)와 같은 결정 규칙을 그대로 재현해
// 그 전제를 시나리오로 고정한다. 이 테스트가 깨지면 이른 그리기(paint-first)를
// 되돌리거나 병합 경로부터 고쳐야 한다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

function clone(o){return JSON.parse(JSON.stringify(o));}

// 부팅 코드의 결정 규칙 재현:
//   base 가 있고 로컬이 base 와 다르면 → 3자 병합
//   로컬이 base 그대로면            → 클라우드로 통째 적용
function bootApply(persistedJson, localST, cloudState){
  if(persistedJson && persistedJson !== JSON.stringify(localST)){
    const baseObj = JSON.parse(persistedJson);
    return cloudState ? _fbMerge(baseObj, localST, cloudState) : localST;
  }
  return cloudState;
}

// ═══ 1. 핵심 전제: 클라우드 도착 전의 이른 편집이 살아남는다 ═══
console.log('시나리오 1 — 화면을 먼저 그린 뒤, fetch 끝나기 전에 편집');
{
  // 어젯밤 마지막 동기화 상태 (base = localStorage 에 남은 병합 기준점)
  const base={
    days:{'2026-08-02':{big:{am:[{text:'설교 준비',done:false}]},small:{},trash:[]}},
    settings:{theme:'dark',vCustomFrom:'2026-07-25'},
    verseLikeLog:{}
  };
  // 아침에 앱을 열자 로컬로 즉시 그려졌고, fetch 가 오래 걸리는 동안 할일을 하나 적었다
  const local=clone(base);
  local.days['2026-08-03']={big:{am:[{text:'아침에 적은 할일',done:false}]},small:{},trash:[]};
  // 그 사이 클라우드에는 다른 기기(아이패드)의 어제 저녁 작업이 있다
  const cloud=clone(base);
  cloud.days['2026-08-02'].big.am[0].done=true;
  cloud.days['2026-08-02'].big.am.push({text:'아이패드에서 추가',done:false});

  const m=bootApply(JSON.stringify(base),local,cloud);
  sc.eq('이른 편집(아침 할일) 생존',m.days['2026-08-03'].big.am[0].text,'아침에 적은 할일');
  sc.eq('아이패드의 완료 체크 생존',m.days['2026-08-02'].big.am[0].done,true);
  sc.eq('아이패드의 새 할일 생존',m.days['2026-08-02'].big.am[1].text,'아이패드에서 추가');
}

// ═══ 2. 편집 없이 그대로 두면 클라우드를 통째로 받는다 (기존 동작 유지) ═══
console.log('\n시나리오 2 — 이른 편집이 없으면 클라우드 우선 (기존과 동일)');
{
  const base={days:{'2026-08-02':{big:{am:[{text:'설교 준비',done:false}]},small:{},trash:[]}},settings:{theme:'dark'}};
  const local=clone(base);                       // 손대지 않음 → base 와 동일
  const cloud=clone(base);
  cloud.days['2026-08-02'].big.am[0].text='설교 준비 (수정됨)';
  const m=bootApply(JSON.stringify(base),local,cloud);
  sc.eq('클라우드 상태를 그대로 적용',m.days['2026-08-02'].big.am[0].text,'설교 준비 (수정됨)');
}

// ═══ 3. 같은 날짜를 양쪽에서 편집한 충돌 — 병합 엔진의 기존 규칙 그대로 ═══
// 날짜(day) 단위로 판정한다: 양쪽 다 base 에서 그 날짜를 바꿨으면 로컬(지금
// 만지는 기기) 쪽 날짜가 통째로 이긴다. 이건 이른 그리기가 새로 만든 규칙이
// 아니라 실시간 리스너가 매일 쓰는 기존 규칙이며, 오프라인 편집도 동일하다.
// (항목 단위 합집합으로 "개선"하려는 시도는 이 테스트를 바꾸는 것부터 시작할 것)
console.log('\n시나리오 3 — 같은 날짜 동시 편집은 날짜 단위로 로컬 우선 (기존 규칙)');
{
  const base={days:{'2026-08-03':{big:{am:[{text:'원래 할일',done:false}]},small:{},trash:[]}},settings:{theme:'dark'}};
  const local=clone(base);
  local.days['2026-08-03'].big.am.push({text:'이 기기의 이른 편집',done:false});
  const cloud=clone(base);
  cloud.days['2026-08-03'].big.am.push({text:'다른 기기의 할일',done:false});
  const m=bootApply(JSON.stringify(base),local,cloud);
  const texts=m.days['2026-08-03'].big.am.map(t=>t.text);
  sc.eq('원래 할일 생존',texts.includes('원래 할일'),true);
  sc.eq('이 기기의 이른 편집 생존',texts.includes('이 기기의 이른 편집'),true);
  sc.eq('충돌 난 날짜는 로컬 판이 통째로 이긴다',texts.includes('다른 기기의 할일'),false);
  sc.eq('다른 날짜가 아니라면 항목 수는 로컬 판 그대로',texts.length,2);
}

// ═══ 4. base 없는 첫 부팅(새 기기)은 이른 편집이 있어도 규칙대로 ═══
console.log('\n시나리오 4 — base 가 없는 새 기기');
{
  const cloud={days:{'2026-08-02':{big:{am:[{text:'기존 데이터',done:false}]},small:{},trash:[]}},settings:{theme:'dark'}};
  const local={days:{},settings:{theme:'dark'}};
  // persisted base 없음 → 부팅 코드는 클라우드를 통째 적용한다 (새 기기에 로컬은 빈 기본값)
  const m=bootApply(null,local,cloud);
  sc.eq('새 기기는 클라우드를 그대로 받는다',m.days['2026-08-02'].big.am[0].text,'기존 데이터');
}

sc.done();
