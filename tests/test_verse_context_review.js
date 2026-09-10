// v26-0909-18 — 우클릭 메뉴 검토값 GitHub 공유
const fs=require('fs');
const {makeScorer}=require('./_load');
const sc=makeScorer();
const page=fs.readFileSync('docs/verse-context-menu-review.html','utf8');
const state=JSON.parse(fs.readFileSync('docs/verse-context-menu-review-state.json','utf8'));

console.log('시나리오 1 — 검토값은 저장소 파일에서 시작한다');
sc.eq('공유 상태 파일 경로',page.includes("STATE_PATH='docs/verse-context-menu-review-state.json'"),true);
sc.eq('기기 전용 검토 localStorage 제거',page.includes("localStorage.getItem(KEY)"),false);
sc.eq('운영 메뉴 15개가 기준값에 있음',state.rows.filter(r=>r.type==='item').length,15);
sc.eq('가로선 3개도 화면마다 체크/해제된다',state.rows.filter(r=>r.type==='separator').length,3);
sc.eq('현재 운영 체크가 18행×14화면 조합에 있음',Object.keys(state.checks).length,7*2*18);
sc.eq('저장 목록에서 이 목록에서 빼기 사용',state.checks['keep:verse:item-11'],true);
sc.eq('아직 없는 저장 풀기는 미사용',state.checks['keep:verse:item-12'],false);
sc.eq('활동 목록도 삭제 대신 이 목록에서 빼기로 통일 (v26-0910-3, HB)',state.checks['activity:verse:item-11'],true);
sc.eq('활동 목록엔 삭제 문구가 더는 없음',state.checks['activity:verse:item-10'],false);
sc.eq('말씀카드 위젯도 통일',state.checks['card:prop:item-11'],true);
sc.eq('말씀목록 위젯도 통일',state.checks['listwidget:verse:item-11'],true);
sc.eq('현재 운영 공유 아이콘은 종이비행기',state.iconChoice['item-7'],'plane');
sc.eq('가로선 1은 말씀 상단에도 있음',state.checks['top:verse:sep-1'],true);
sc.eq('가로선 2는 말씀목록 위젯 명제에도 있음',state.checks['listwidget:prop:sep-2'],true);
sc.eq('가로선 3(말씀 설정·삭제 사이)은 활동 목록에 있음',state.checks['activity:verse:sep-3'],true);
sc.eq('가로선 3은 말씀 상단(메뉴 자체가 다름)엔 없음',state.checks['top:verse:sep-3'],false);
sc.eq('말씀 설정(상단 깜빡)은 말씀 상단에서만',state.checks['top:verse:settings-top'],true);
sc.eq('말씀 설정(상단 깜빡)은 전체화면엔 없음',state.checks['full:verse:settings-top'],false);
sc.eq('말씀 설정(모음 깜빡)은 전체화면에 있음',state.checks['full:verse:settings-coll'],true);
sc.eq('말씀 설정(모음 깜빡)은 말씀 상단엔 없음',state.checks['top:verse:settings-coll'],false);
sc.eq('말씀 설정(깜빡 없음)은 아직 어디서도 안 씀',state.checks['top:verse:settings-plain'],false);

console.log('\n시나리오 2 — GitHub 공유 브랜치와 운영본 PR');
sc.eq('고정 공유 브랜치',page.includes("SHARED_BRANCH='verse-context-menu-review'"),true);
sc.eq('Contents API로 저장',page.includes("method:'PUT'"),true);
sc.eq('PR 생성 API',page.includes("api('/pulls',{method:'POST'"),true);
sc.eq('운영본 PR 버튼',page.includes('id="make-pr">운영본 PR 만들기'),true);
sc.eq('토큰은 GitHub API에만 전달',page.includes("headers.Authorization=`Bearer ${token()}`"),true);

sc.done();
