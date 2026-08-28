// 구간 헤더에 떨어뜨리면 그 구간의 첫 번째로 (v26-0817-7, HB 13번)
//
// ⚠️ 예전엔 getDropTarget() 이 본문(.ts-body) 안에서만 목표를 찾았다.
//    헤더는 본문 밖이라 null 이 나왔고, 그래서 헤더 위에서는 "어디로 떨어진다"는
//    가로선 표시가 아예 없었다.
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const fn = SRC.slice(SRC.indexOf('function getDropTarget(cx,cy){'),
                     SRC.indexOf('function getStableDt(cx,cy){'));

console.log('시나리오 1 — 헤더도 드롭 대상으로 받는다');
{
  sc.eq('본문 판정은 그대로', fn.includes("document.querySelectorAll('.ts-body')"), true);
  sc.eq('본문에서 못 찾으면 헤더를 본다', fn.includes("document.querySelectorAll('.ts-hd')"), true);
  sc.eq('헤더에서 그 구간의 본문을 찾아낸다',
        fn.includes("targetTb=document.getElementById('tb-'+ts.id.slice(3));"), true);
  // 둘 다 아니면 여전히 아무 데도 아니다 — 화면 바깥에서 오작동하면 안 된다
  sc.eq('그래도 못 찾으면 null', fn.includes('if(!targetTb)return null;'), true);
  sc.eq('헤더 판정이 본문 판정보다 뒤에 온다',
        fn.indexOf(".ts-hd") > fn.indexOf(".ts-body"), true);
}

console.log('\n시나리오 2 — 첫 자리 계산은 기존 Y 로직에 맡긴다');
{
  // 헤더는 목록보다 위에 있으므로, 가장 가까운 항목 = 첫 번째, 그 앞에 넣게 된다.
  // 따로 분기를 두면 빅/스몰 좌우 구분 같은 기존 규칙과 어긋난다.
  sc.eq('Y 거리로 고르는 코드가 그대로 있다', fn.includes('const d=Math.abs(cy-mid);'), true);
  sc.eq('중간보다 아래면 뒤에 넣는 규칙도 그대로',
        fn.includes('const afterBest=cy>best.r.top+best.r.height/2;'), true);
  sc.eq('좌우 절반으로 빅/스몰 가르는 규칙도 그대로',
        fn.includes('const wantSmall=smallEnabled&&cx>screenMid;'), true);
}

console.log('\n시나리오 3 — 순서 변경 뒤에도 할일의 모든 상태를 보존한다');
{
  const endDragStart = SRC.indexOf('function endDrag(cx,cy){');
  const endDrag = SRC.slice(endDragStart,
                            SRC.indexOf("document.addEventListener('mousemove'", endDragStart));
  sc.eq('드래그한 원본 객체를 그대로 새 위치에 넣는다',
        endDrag.includes('arr.splice(Math.max(0,Math.min(toI,arr.length)),0,item);'), true);
  sc.eq('텍스트와 완료 여부만으로 객체를 다시 만들지 않는다',
        endDrag.includes("{text:item.text||'',done:!!item.done}"), false);
}
sc.done();
