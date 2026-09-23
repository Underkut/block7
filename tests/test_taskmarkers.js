// D뷰의 중요/연락 표시와 두 필터 버튼이 한 구조로 끝까지 이어지는지 지킨다.
const { SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 새 버튼은 파워 모드에서만 보이고 처음에는 꺼져 있다');
sc.eq('깃발 버튼 설정', /data-lv="p"[\s\S]{0,500}id="setShowFlagFilterBtn"/.test(SRC_DEV), true);
sc.eq('연락 버튼 설정', /id="setShowFlagFilterBtn"[\s\S]{0,1400}data-lv="p"[\s\S]{0,900}id="setShowContactFilterBtn"/.test(SRC_DEV), true);
sc.eq('깃발 버튼 기본 OFF', /showFlagFilterBtn:false/.test(SRC_DEV), true);
sc.eq('연락 버튼 기본 OFF', /showContactFilterBtn:false/.test(SRC_DEV), true);

console.log('시나리오 2 — 표시 순서와 필터 판정');
// 지키려는 것은 **차례**다 — 체크 · 손잡이 · 긴급 · 깃발 · 연락, 그 뒤에 글자.
// 그 사이에 표시가 더 붙는 것은 막지 않는다 (v26-0923-4 에 하위 여닫이 단추가
// 연락 표시 다음에 들어왔다). 글자로 딱 맞추면 표시 하나 늘 때마다 여기가 깨진다.
sc.eq('깃발 다음 연락 아이콘',
  /div\.append\(chk,dh,urgentBadge,flagBadge,contactTaskBadge,[\s\S]{0,160}inp\)/.test(SRC_DEV), true);
sc.eq('깃발 필터는 flag 판정', /markerFilter==='flag'[\s\S]{0,120}item\.flag/.test(SRC_DEV), true);
sc.eq('연락 필터는 contactTask 판정', /markerFilter==='contact'[\s\S]{0,120}item\.contactTask/.test(SRC_DEV), true);

console.log('시나리오 3 — 메뉴와 날짜 복사에서도 연락 표시가 보존된다');
sc.eq('중요 표시 바로 아래 연락할 일', /id="flagToggleItem"[\s\S]{0,1200}id="contactTaskToggleItem"[\s\S]{0,500}연락할 일/.test(SRC_DEV), true);
sc.eq('연락 토글 함수', /function toggleTaskContact\(\)[\s\S]{0,400}item\.contactTask=!item\.contactTask/.test(SRC_DEV), true);
sc.eq('반복 복사 보존', /if\(b\.contactTask\)it\.contactTask=true/.test(SRC_DEV), true);

sc.done();
