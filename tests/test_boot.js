// 부팅 순서 개선(5-3 첫 화면 지연)이 기대는 성질을 고정한다 (v26-0803-2)
//
// 새 부팅 순서: 로컬(localStorage)로 화면을 먼저 그리고, 클라우드가 도착하면
// 기존 병합·적용 경로가 다시 그린다. 그 사이에 사용자가 편집할 수 있으므로
// "클라우드 fetch 가 끝나기 전에 만든 편집이 부팅 병합에서 살아남는다"가
// 이 설계의 전제다. 부팅 코드(19880줄 근처)와 같은 결정 규칙을 그대로 재현해
// 그 전제를 시나리오로 고정한다. 이 테스트가 깨지면 이른 그리기(paint-first)를
// 되돌리거나 병합 경로부터 고쳐야 한다.
// ⚠️ 병합 엔진은 **개발본(index-dev.html)** 에서 떠온다. 운영본(index.html)은
//    HB 가 개발본으로 확인하기 전까지 커밋되지 않기 때문이다 (CLAUDE.md 규칙).
//    두 산출물의 앱 코드는 글자 하나까지 같다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

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

// ═══ 3. 같은 날짜·같은 구간을 양쪽에서 편집 — **둘 다 산다** (v26-0828-5에서 바뀜) ═══
//
// ⚠️ 이 시나리오는 v26-0828-4 까지 "충돌 난 날짜는 로컬 판이 통째로 이긴다" 를
//    **정답으로** 못 박고 있었다. 즉 다른 기기가 같은 구간에 넣은 할일이 사라지는
//    것이 설계상 의도였다. 그것이 HB가 매일 겪던 동기화 손실의 정체였다.
//
//    v26-0828-5 부터 구간 배열을 **항목 단위**로 합친다. 서로 다른 항목을 하나씩
//    더한 것은 충돌이 아니므로 둘 다 살린다. 삭제·재정렬이 섞이면 예전 규칙으로
//    물러선다 — 그 경계는 tests/test_taskmerge.js 가 지킨다.
console.log('\n시나리오 3 — 같은 날짜·같은 구간 동시 추가는 둘 다 산다');
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
  sc.eq('다른 기기의 할일도 생존',texts.includes('다른 기기의 할일'),true);
  sc.eq('셋이 된다',texts.length,3);
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
