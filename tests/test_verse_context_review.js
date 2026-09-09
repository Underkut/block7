// v26-0909-18 — 우클릭 메뉴 검토값 GitHub 공유
const fs=require('fs');
const {makeScorer}=require('./_load');
const sc=makeScorer();
const page=fs.readFileSync('docs/verse-context-menu-review.html','utf8');
const state=JSON.parse(fs.readFileSync('docs/verse-context-menu-review-state.json','utf8'));

console.log('시나리오 1 — 검토값은 저장소 파일에서 시작한다');
sc.eq('공유 상태 파일 경로',page.includes("STATE_PATH='docs/verse-context-menu-review-state.json'"),true);
sc.eq('기기 전용 검토 localStorage 제거',page.includes("localStorage.getItem(KEY)"),false);
sc.eq('운영 메뉴 13개가 기준값에 있음',state.rows.filter(r=>r.type==='item').length,13);
sc.eq('현재 운영 체크가 모든 14개 화면 조합에 있음',Object.keys(state.checks).length,7*2*13);
sc.eq('저장 목록에서 이 목록에서 빼기 사용',state.checks['keep:verse:item-11'],true);
sc.eq('아직 없는 저장 풀기는 미사용',state.checks['keep:verse:item-12'],false);
sc.eq('현재 운영 공유 아이콘은 종이비행기',state.iconChoice['item-7'],'plane');

console.log('\n시나리오 2 — GitHub 공유 브랜치와 운영본 PR');
sc.eq('고정 공유 브랜치',page.includes("SHARED_BRANCH='verse-context-menu-review'"),true);
sc.eq('Contents API로 저장',page.includes("method:'PUT'"),true);
sc.eq('PR 생성 API',page.includes("api('/pulls',{method:'POST'"),true);
sc.eq('운영본 PR 버튼',page.includes('id="make-pr">운영본 PR 만들기'),true);
sc.eq('토큰은 GitHub API에만 전달',page.includes("headers.Authorization=`Bearer ${token()}`"),true);

sc.done();
