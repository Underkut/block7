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

// PC 는 빈 자리 mousedown 1ms 만에 드래그가 시작된다(LONG_PRESS_MOUSE). 그래서
// 그냥 클릭만 해도 endDrag 가 불렸고, 화면 오른쪽 절반(스몰 자리)을 눌렀으면
// 빅이 스몰로 옮겨지던 버그가 있었다(HB, PC 전용). 실제로 돌려 본다.
console.log('\n시나리오 4 — 거의 안 움직이고 놓으면 옮기지 않는다');
{
  const endDragStart = SRC.indexOf('function endDrag(cx,cy){');
  const body = SRC.slice(endDragStart, SRC.indexOf("document.addEventListener('mousemove'", endDragStart));
  const el = { classList:{remove(){}}, style:{} };
  const stubEl = () => ({ style:{}, className:'', innerHTML:'' });
  function run(DRinit, cx, cy){
    let dropAsked=0, moved=0;
    const ctx = {
      DR: Object.assign({active:true,type:'big',fromId:'am',fromI:0,el,_menuTimer:null}, DRinit),
      document: { getElementById: stubEl, querySelectorAll: () => [], body:{style:{},dataset:{}} },
      clearDropIndicators(){}, tKey: () => '2026-10-08', beforeSave(){}, save(){},
      getBigs: () => { moved++; return [{text:'A'}]; }, getSmalls: () => { moved++; return []; },
      getDropTarget(){ dropAsked++; return {type:'small',toId:'am',toI:0}; },
      renderSecBody(){}, updateTotal(){}, ST:{settings:{}},
      _stableDt:null, _stableY:0,
    };
    const f = new Function(...Object.keys(ctx), body + '\nendDrag(' + cx + ',' + cy + ');');
    f(...Object.values(ctx));
    return { dropAsked, moved, active: ctx.DR.active };
  }
  const click = run({_sx:900,_sy:300,_moved:false}, 900, 300);
  sc.eq('클릭만(움직임 없음) — 떨어뜨릴 자리를 찾지 않는다', click.dropAsked, 0);
  sc.eq('클릭만 — 할일을 옮기지 않는다', click.moved, 0);
  sc.eq('클릭만 — 드래그 상태는 끝난다', click.active, false);
  const jitter = run({_sx:900,_sy:300,_moved:true}, 903, 302);
  sc.eq('손 떨림(6px 미만) — 옮기지 않는다', jitter.moved, 0);
  const real = run({_sx:300,_sy:300,_moved:true}, 900, 300);
  sc.eq('실제로 끌어 옮기면 — 그대로 옮긴다', real.dropAsked>0 && real.moved>0, true);
}

// 빈 자리를 누르기만 해선 끌기를 시작하지 않는다 (v26-1008-4, HB — PC 빈 자리 더블/트리플
// 클릭이 안 먹던 것). 예전엔 1ms 타이머로 즉시 시작해서 클릭마다 끌기 상태가 켜졌다 꺼졌다.
// 크로미움으로 확인: 눌러서 60ms 가만히 두면 예전 DR.active=true, 지금 false.
console.log('\n시나리오 5 — 빈 자리는 움직여야 끌기가 시작된다');
{
  const a = SRC.indexOf('function attachDrag(el,type,i,id){');
  const fn = SRC.slice(a, SRC.indexOf('// ── Desktop: right-click → task move context menu', a));
  sc.eq('글자 아닌 곳은 타이머 없이 움직임을 기다린다', /\}else\{\s*mouseMovePending=true;\s*\}/.test(fn), true);
  sc.eq('1ms 타이머로 바로 시작하지 않는다', fn.includes(':LONG_PRESS_MOUSE)'), false);
  sc.eq('문턱을 넘게 움직이면 시작한다',
        fn.includes('if(Math.abs(dx)>MOUSE_DRAG_START_PX||Math.abs(dy)>MOUSE_DRAG_START_PX)beginMouseDrag();'), true);
  sc.eq('글자 위는 예전처럼 200ms 누르고 있으면 시작',
        fn.includes('mousePressTimer=setTimeout(beginMouseDrag,LONG_PRESS_MOUSE_INPUT);'), true);
  const cancel = fn.slice(fn.indexOf('function cancelMousePress(){'), fn.indexOf("el.addEventListener('mousemove'"));
  sc.eq('떼면 기다리던 것을 지운다', cancel.includes('mouseMovePending=false;'), true);
}
sc.done();
