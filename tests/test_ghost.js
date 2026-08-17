// 스몰그룹 입력창(고스트)이 롱터치에서 손 뗄 때 사라지던 것 (v26-0817-6)
//
// ⚠️ 이 버그는 PC 브라우저로 재현되지 않아 여러 번 헛짚었다. 개발본 진단 로그를
//    붙여 HB 아이폰에서 받은 실측이 원인을 확정해 줬다:
//
//      4775ms  [+] touchend  롱터치=true
//      4777ms  [+] touchend 에서 focus 다시걺   고스트있음=true
//      4914ms  [+] focus 건 뒤            ← focus() 가 137ms 동안 멈춰 있었다
//      4918ms  [고스트] blur → 100ms 뒤 커밋 예약
//      5021ms  [고스트] 커밋 실행 → 고스트 사라짐
//
//    ① 이미 포커스가 있는 입력창에 focus() 를 또 부르자 아이폰이 137ms 멈췄다가
//       곧바로 blur 를 냈다.
//    ② 그 blur 가 100ms 뒤 커밋을 돌렸고, 아직 한 글자도 안 친 고스트라
//       빈 값으로 커밋되며 사라졌다.
//
//    고침: 롱터치 직후(600ms 안)의 빈 고스트 blur 는 커밋하지 말고 포커스를
//    한 번만 되돌린다.
//    ⚠️ 0817-6 에서 "이미 포커스가 있으면 focus() 를 건너뛴다"까지 했다가
//       커서가 아예 안 들어가게 만들어 0817-10 에서 되돌렸다. touchend 의
//       focus() 는 조건 없이 불러야 아이폰 키보드가 올라온다(시나리오 2).
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 롱터치 직후의 가짜 blur 로는 고스트를 지우지 않는다');
{
  // 스몰 갈래의 blur 처리 (빅 갈래에도 같은 모양의 코드가 있어 시작점을 잡고 자른다)
  const from = SRC.indexOf('const smList=document.getElementById(`sl-${secId}`);');
  sc.eq('스몰 갈래를 찾았다', from > -1, true);
  const smPart = SRC.slice(from, SRC.indexOf('function closeInlineInput(', from));

  sc.eq('비어 있고 롱터치 직후면 커밋하지 않는다',
        /if\(!inp\.value\.trim\(\)\s*&&\s*inp\._lpAt\s*&&\s*Date\.now\(\)-inp\._lpAt<600/.test(smPart), true);
  sc.eq('대신 포커스를 되돌린다', smPart.includes('inp.focus({preventScroll:true});'), true);
  sc.eq('되돌리기는 한 번만 (무한 반복 방지)', smPart.includes('!_lpRetried'), true);
  // 진짜로 나갔을 때의 정리는 그대로 남아 있어야 한다 — 안 그러면 빈 고스트가 박힌다
  sc.eq('진짜 blur 의 100ms 커밋은 그대로', /_blurT=setTimeout\(\(\)=>\{[\s\S]{0,400}commit\(\);/.test(smPart), true);
  sc.eq('다시 포커스되면 커밋 취소도 그대로',
        smPart.includes('if(document.activeElement===inp)return;'), true);
}

console.log('\n시나리오 2 — touchend 의 focus() 는 조건 없이 불러야 한다');
{
  // ⚠️ v26-0817-10 — 0817-6 에서 "이미 포커스가 있으면 건너뛰기"로 바꿨다가
  //    **커서가 아예 안 들어가게** 만들었다(HB 신고).
  //    타이머(500ms) 안의 focus() 는 제스처 밖이라 document.activeElement 만
  //    바꿀 뿐 아이폰 키보드를 못 올린다. 실제로 커서가 들어가는 것은 제스처
  //    안인 이 touchend 의 focus() 덕분이다 → 조건을 걸면 안 된다.
  //    이 focus() 가 부르는 아이폰의 되받아치는 blur 는 시나리오 1 의
  //    blur 가드(_lpAt, 600ms)가 막는다. 역할이 나뉘어 있다.
  const from = SRC.indexOf("addTaskBtn.addEventListener('touchend'");
  sc.eq('+ 버튼 touchend 를 찾았다', from > -1, true);
  const te = SRC.slice(from, SRC.indexOf("addTaskBtn.addEventListener('touchcancel'", from));

  sc.eq('조건 없이 focus 를 건다', te.includes('gi.focus({preventScroll:true});'), true);
  sc.eq('포커스 유무로 건너뛰지 않는다',
        te.includes('if(document.activeElement!==gi){'), false);
  sc.eq('롱터치로 열린 시각을 적어 둔다 (가짜 blur 판정용)',
        te.includes('gi._lpAt=Date.now();'), true);
}

console.log('\n시나리오 3 — 처음 열 때도 화면을 끌어올리지 않는다');
{
  // 실측: 키보드가 올라오며 화면이 160px 튀었다 (scroll=160/vv160)
  const from = SRC.indexOf('const smList=document.getElementById(`sl-${secId}`);');
  const smPart = SRC.slice(from, SRC.indexOf('function closeInlineInput(', from));
  sc.eq('고스트를 붙인 뒤 preventScroll 로 포커스',
        smPart.includes('inp.focus({preventScroll:true});'), true);
}

sc.done();
