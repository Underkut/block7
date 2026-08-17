// v26-0818-2, HB 3 재조정 — 토글·버튼이 딸린 '행'인데 실은 1뎁스 제목인 것들
//
// v26-0818-1 에서 항목 이름(2뎁스)을 전부 옅게(500/tx2) 낮췄는데, 그중 10곳은
// settings-row-label 로 그려져 있어도 실제로는 그 섹션의 유일한/첫 제목이라
// 1뎁스(제목)로 보여야 한다. 새 수정자 클래스 .lv1 로 그 10곳만 되돌린다.
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

console.log('\n시나리오 2 — 지정된 10곳에만 .lv1 이 붙었다');
{
  const targets = ['연락처','하루 할일 보고','시간 구간 할일 보고','알림에 스몰 블럭 포함','알림 테스트',
                    '글자 크기','테마','요일 표기','이월 횟수 표시','레이아웃 분할 기준'];
  targets.forEach(t=>{
    sc.eq(`'${t}' 에 lv1 이 붙었다`,
          SRC.includes(`<div class="settings-row-label lv1">${t}</div>`), true);
  });
}

console.log('\n시나리오 3 — 옆에 있던 진짜 소제목·항목 이름은 그대로 2뎁스');
{
  // '가져올 대상'(소제목)은 여전히 settings-subtitle — .lv1 을 잘못 옮겨 붙이지 않았다
  sc.eq("'가져올 대상'은 여전히 소제목 클래스", SRC.includes('<div class="settings-subtitle">가져올 대상</div>'), true);
  // '자동'(진짜 항목 이름, 미완료 할일 가져오기 섹션의 하위 토글)은 기본 스타일 그대로
  sc.eq("'자동'에는 lv1 을 안 붙였다", SRC.includes('<div class="settings-row-label lv1">자동</div>'), false);
  // '알림 시각'도 '하루 할일 보고' 아래 하위 항목이라 기본 스타일 그대로
  sc.eq("'알림 시각'에는 lv1 을 안 붙였다", SRC.includes('<div class="settings-row-label lv1">알림 시각</div>'), false);
  // '주일을 RED 표시'도 '요일 표기' 섹션의 하위 토글이라 기본 스타일 그대로
  sc.eq("'주일을 RED 표시'에는 lv1 을 안 붙였다", SRC.includes('<div class="settings-row-label lv1">주일을 RED 표시</div>'), false);
  // '스몰 블럭 사용'도 '블럭' 섹션의 하위 토글이라 기본 스타일 그대로 (다른 탭의 '알림에 스몰 블럭 포함'과 다른 항목)
  sc.eq("'스몰 블럭 사용'에는 lv1 을 안 붙였다", SRC.includes('<div class="settings-row-label lv1">스몰 블럭 사용</div>'), false);
}

sc.done();
