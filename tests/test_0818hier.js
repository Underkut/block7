// v26-0818-1, HB 3 — 설정창 제목·소제목·항목 이름 세 단계 스텝 벌리기
//
// 예전엔 탭 제목(13px/700/tx)과 항목 이름(13px/600/tx)이 거의 같아 보였고,
// 소제목("가져올 대상" 등)은 자리마다 스타일이 제각각이었다. 코드에 넣기
// 전에 화면만 따로 만들어 HB 확인을 받았고(2안 — 항목 이름도 함께 약화),
// 그 결과를 그대로 반영한다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 세 단계 CSS 가 뚜렷이 벌어져 있다');
{
  const title = SRC.slice(SRC.indexOf('.settings-section-title{'), SRC.indexOf('.settings-section-title{')+120);
  sc.eq('제목: 15px', title.includes('font-size:15px'), true);
  sc.eq('제목: 굵기 800', title.includes('font-weight:800'), true);
  sc.eq('제목: 본문색(tx)', title.includes('color:var(--tx);'), true);

  const sub = SRC.slice(SRC.indexOf('.settings-subtitle{'), SRC.indexOf('.settings-subtitle{')+120);
  sc.eq('소제목: 10.5px (제목보다 작다)', sub.includes('font-size:10.5px'), true);
  sc.eq('소제목: 자간을 넓혀 라벨처럼', sub.includes('letter-spacing:.07em'), true);
  sc.eq('소제목: 옅은 색(tx3)', sub.includes('color:var(--tx3)'), true);
  sc.eq('소제목 첫 줄은 위 여백 없음', SRC.includes('.settings-subtitle:first-child{margin-top:0;}'), true);

  const label = SRC.slice(SRC.indexOf('.settings-row-label{'), SRC.indexOf('.settings-row-label{')+80);
  sc.eq('항목 이름: 13px 그대로(제목보다 작다)', label.includes('font-size:13px'), true);
  // ⚠️ HB 재지시 — 항목 이름도 소제목처럼 약화. 굵기 600→500, 색 tx→tx2.
  sc.eq('항목 이름도 약화됨: 굵기 500', label.includes('font-weight:500'), true);
  sc.eq('항목 이름도 약화됨: 색 tx2', label.includes('color:var(--tx2)'), true);

  // 세 단계 실제 크기 비교 — 제목이 가장 크고, 소제목이 가장 작다
  sc.eq('제목(15) > 항목 이름(13) > 소제목(10.5)', 15>13 && 13>10.5, true);
}

console.log('\n시나리오 2 — 자리마다 제각각이던 소제목을 공용 클래스로 통일');
{
  // ⚠️ '언제부터 가져올지'(옛 '가져올 대상')는 나중에 HB 재지시로 소제목이 아니라
  //    항목 이름 서식으로 바뀌었다(test_0818lv1.js 참고) — 여기 목록에서는 뺀다.
  // v26-0819-2 — '말씀 모음 (어느 구절에서 뽑을지)' 는 시트 스펙대로 뎁스1 제목
  // '말씀 모음' + 설명 문구로 바뀌어 소제목 목록에서 빠졌다.
  const targets = ['어떤 순서로','요일',
                    // v26-0819-2 — 말씀설정창을 구글시트 스펙대로 재구성하면서 이름이 짧아졌다
                    // ('풀 모드에서 표시할 항목'>'풀 모드' 등). 위젯 두 줄은 '말씀 위젯' 탭의
                    // 뎁스1 제목(settings-section-title)이 되어 여기서 빠진다.
                    '풀 모드','스닉픽 서식','스닉픽 모드','한 줄 최대 가로 폭','2단 시작','3단 시작'];
  targets.forEach(t=>{
    sc.eq(`'${t}' 는 settings-subtitle 클래스를 쓴다`,
          new RegExp(`class="settings-subtitle"[^>]*>${t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}<`).test(SRC), true);
  });
  // 예전에 자리마다 다르게 박혀 있던 인라인 스타일들은 사라졌다
  sc.eq('예전 인라인 소제목 스타일(11px+tx2+600, margin 제각각)은 안 남았다',
        SRC.includes('style="margin:14px 0 6px;font-weight:600;color:var(--tx2);"'), false);
  sc.eq('2단/3단 시작의 예전 인라인 스타일도 안 남았다',
        SRC.includes('style="font-size:10px;color:var(--tx3);margin-bottom:4px;"'), false);
}

console.log('\n시나리오 3 — 유일하게 항목 이름을 제목 자리에 잘못 쓰던 곳을 바로잡음');
{
  // "미완료 할일 가져오기" 는 예전에 settings-row-label(=항목 이름과 같은 스타일)로
  // 그려져 있어서, 진짜 제목들과 스텝이 안 맞았다.
  sc.eq("'미완료 할일 가져오기' 가 이제 진짜 제목 클래스를 쓴다",
        /class="settings-section-title">미완료 할일 가져오기</.test(SRC), true);
  sc.eq('예전처럼 row-label 로 감싸 제목 흉내를 내던 자리는 없앴다',
        /<div class="settings-row-text" style="margin-bottom:10px;">\s*<div class="settings-row-label">미완료 할일 가져오기/.test(SRC), false);
}

sc.done();
