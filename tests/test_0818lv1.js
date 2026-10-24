// v26-0818-2, HB 3 재조정 — 토글·버튼이 딸린 '행'인데 실은 1뎁스 제목인 것들
//
// v26-0818-1 에서 항목 이름(2뎁스)을 전부 옅게(500/tx2) 낮췄는데, 그중 10곳은
// settings-row-label 로 그려져 있어도 실제로는 그 섹션의 유일한/첫 제목이라
// 1뎁스(제목)로 보여야 한다. 새 수정자 클래스 .lv1 로 그 10곳만 되돌린다.
// (v26-0822-1 에 '테마' 가 '화면 스타일'/'밝기' 둘로 갈라져 11곳이 됐고,
//  v26-0822-5 에 "화면 스타일" 이 "색상 테마" 로 이름이 바뀌었다.)
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — .lv1 수정자 CSS');
{
  const rule = SRC.slice(SRC.indexOf('.settings-row-label.lv1{'), SRC.indexOf('.settings-row-label.lv1{')+90);
  sc.eq('제목과 같은 크기(15px)', rule.includes('font-size:15px'), true);
  sc.eq('제목과 같은 굵기(800)', rule.includes('font-weight:800'), true);
  sc.eq('제목과 같은 색(tx, 흰색 계열)', rule.includes('color:var(--tx);'), true);
  // 기본 .settings-row-label(2뎁스, 옅음)은 그대로 둔다 — .lv1 이 없는 나머지 항목들은 안 바뀐다
  sc.eq('기본 항목 이름 스타일은 그대로(500/tx2)',
        SRC.includes('.settings-row-label{font-size:13px;font-weight:500;color:var(--tx2);}'), true);
}

console.log('\n시나리오 2 — 일반 설정창은 묶음 제목이 1뎁스를 맡는다 (v26-1024-15, HB 설정창 정리)');
{
  // 예전엔 11곳의 항목 이름에 .lv1 을 붙여 '제목처럼' 보이게 했다. 이제 일반 설정창은
  // 묶음(.sg) = 작은 제목(.sg-h) + 카드 로 나뉘어, 1뎁스는 묶음 제목이 맡고 줄 이름은 한 서식이다.
  // .lv1 규칙(위 시나리오 1)은 말씀 설정창이 아직 쓴다 — 지우지 않는다.
  const panel = slice('<div class="settings-panel sp2" id="settingsPanel">', '<!-- /settings-tab-track -->');
  sc.eq('일반 설정창 안에는 lv1 제목 흉내가 없다', panel.includes('settings-row-label lv1'), false);
  ['하루','못 끝낸 할일','입력','블럭','끝냈을 때','모양','할일 글자','주간 · 월간','넘기기','위 단추','설정창','할일','이 기기','색 묶음','시간 구간']
    .forEach(t => sc.eq(`묶음 제목 '${t}'`, panel.includes(`<div class="sg-h">${t}</div>`), true));
}

console.log('\n시나리오 3 — 하위 줄은 들여 쓴다(.sub) — 예전에 lv1 을 안 붙이던 그 줄들');
{
  const panel = slice('<div class="settings-panel sp2" id="settingsPanel">', '<!-- /settings-tab-track -->');
  const sub = t => new RegExp('<div class="settings-row(?: stack)? sub"[^>]*>(?:(?!<div class="settings-row[ "]).){0,700}>' + t + '</div>', 's').test(panel);
  ['보낼 시각','셀 것','주일을 빨갛게','스몰 블럭 경고','연도도 보이기','스몰 블럭도 넣기'].forEach(t => sc.eq(`'${t}' 는 하위 줄`, sub(t), true));
  sc.eq("'하루 할일 요약'(윗줄)은 들여 쓰지 않는다", sub('하루 할일 요약'), false);
}

sc.done();
