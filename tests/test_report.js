// 사역 한눈에(report/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="report-core">)를 떼어 시험한다.
// 부서 이름은 지어낸 것이다 (공개 저장소).
//
// 지키는 것:
//  ① 한 주는 일요일부터 토요일 (교회 보고서 규칙)
//  ② 시간칸 반복: 매주 · 격주(기준 날짜부터 2주마다) · 몇째 주(1~5 · 마지막)
//  ③ 시간표 다듬기: 모르는 값은 버리고 기본값 · 빈 부서는 버림
//  ④ 기기 사본 ↔ 계정: 나중에 고친 쪽(at) · 계정이 비면 기기 것을 올린다
//  ⑤ 한 주 일정: 날짜순 · 같은 날은 끝나는 시각순 · 쓰는/봐 주는 부서 모두
//  ⑥ 셀 한눈에와 로고로 겹 화면 전환 · 같은 로그인 칸('cell') · 시간표는 cellbook 문서의 report 칸 · users 는 안 건드림
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'report', 'index.html'), 'utf8');
const CELL = fs.readFileSync(path.join(__dirname, '..', 'cell', 'index.html'), 'utf8');
const m = HTML.match(/<script id="report-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('report-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Array, String, Date };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, DOW, FREQ, weekStartSun, nthOf, isLastOf, occursOn, normSlot, normBook, pickBook, weekPlan, slotText, addDays, parseDeptList, PRESET };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// ① 한 주
sc.eq('① 2026-11-07(토)의 주는 11/1(일)부터', A.weekStartSun('2026-11-07'), '2026-11-01');
sc.eq('① 일요일은 그 날이 주의 시작', A.weekStartSun('2026-11-08'), '2026-11-08');

// ② 반복
sc.eq('② 매주 — 그 요일이면 언제나', [A.occursOn({ dow: 0, freq: 'weekly' }, '2026-11-08'), A.occursOn({ dow: 0, freq: 'weekly' }, '2026-11-09')], [true, false]);
sc.eq('② 몇째 주 — 11/1 은 첫째 일요일, 11/8 은 둘째', [A.nthOf('2026-11-01'), A.nthOf('2026-11-08'), A.nthOf('2026-11-29')], [1, 2, 5]);
const first = { dow: 0, freq: 'nth', nth: [1] };
sc.eq('② 첫째 주일만', ['2026-11-01', '2026-11-08', '2026-12-06'].map(d => A.occursOn(first, d)), [true, false, true]);
const last = { dow: 0, freq: 'nth', nth: ['last'] };
sc.eq('② 마지막 주일 — 11월은 29일, 12월은 27일', ['2026-11-29', '2026-11-22', '2026-12-27'].map(d => A.occursOn(last, d)), [true, false, true]);
const two = { dow: 6, freq: 'biweekly', anchor: '2026-11-07' };
sc.eq('② 격주 — 기준 날짜부터 2주마다 (앞쪽도)', ['2026-11-07', '2026-11-14', '2026-11-21', '2026-10-24'].map(d => A.occursOn(two, d)), [true, false, true, true]);
sc.eq('② 격주인데 기준 날짜가 없으면 매주처럼 보인다 (빠뜨리지 않게)', A.occursOn({ dow: 6, freq: 'biweekly' }, '2026-11-14'), true);

// ③ 다듬기
const b = A.normBook({ depts: [{ name: '조명팀', role: '???', slots: [{ dow: 9, end: '25시', freq: 'monthly', nth: [1], label: 'x'.repeat(60) }] }, { name: '', slots: [] }] });
sc.eq('③ 빈 부서는 버리고 · 모르는 역할은 씀 · 요일은 0~6 · 이상한 시각 · 반복은 기본값', J([b.depts.length, b.depts[0].role, b.depts[0].slots[0].dow, b.depts[0].slots[0].end, b.depts[0].slots[0].freq, b.depts[0].slots[0].nth, b.depts[0].slots[0].label.length]), [1, 'write', 6, '', 'weekly', [], 40]);
sc.eq('③ 몇째 주 값은 1~5 · 마지막만', J(A.normSlot({ freq: 'nth', nth: [0, 2, 7, 'last', 'x'] }).nth), [2, 'last']);

// ④ 기기 ↔ 계정
const L = { at: 20, depts: [{ name: '로컬', slots: [] }] }, C = { at: 10, depts: [{ name: '계정', slots: [] }] };
sc.eq('④ 기기 것이 나중이면 기기 것 · 계정에 올림', J([A.pickBook(L, C).book.depts[0].name, !!A.pickBook(L, C).push]), ['로컬', true]);
sc.eq('④ 계정 것이 나중이면 계정 것 · 올리지 않음', J([A.pickBook({ at: 5, depts: L.depts }, C).book.depts[0].name, A.pickBook({ at: 5, depts: L.depts }, C).push]), ['계정', null]);
sc.eq('④ 계정이 비었으면 기기 것을 올린다', !!A.pickBook(L, null).push, true);
sc.eq('④ 둘 다 비었으면 아무것도 안 올린다', A.pickBook({}, null).push, null);

// ⑤ 한 주 일정
const book = A.normBook({ depts: [
  { name: '조명팀', role: 'write', slots: [{ dow: 0, end: '13:30', freq: 'weekly' }] },
  { name: '성찬위원', role: 'write', slots: [{ dow: 0, end: '12:00', freq: 'nth', nth: [1] }] },
  { name: '송번역팀', role: 'view', slots: [{ dow: 3, end: '21:00', freq: 'weekly' }] }] });
const plan = A.weekPlan(book, '2026-11-01');
sc.eq('⑤ 첫째 주: 일요일 성찬(12:00) → 조명(13:30) → 수요일 송번역', J(plan.map(x => [x.day, x.dept.name])), [['2026-11-01', '성찬위원'], ['2026-11-01', '조명팀'], ['2026-11-04', '송번역팀']]);
sc.eq('⑤ 둘째 주에는 성찬위원이 없다', A.weekPlan(book, '2026-11-08').map(x => x.dept.name).includes('성찬위원'), false);
sc.eq('⑤ 시간칸 글', A.slotText(book.depts[1].slots[0]), '1째 주 일요일 · 12:00 끝');

// ⑤-2 부서 고르기 — 교회 보고서 화면에서 복사한 글을 부서 이름으로 (지어낸 화면 글)
{
  const pasted = ['TLC 교회 보고서', '이번 주 11/1(일) - 11/7(토)', '내 파트 · 이번 주', '▾ 예배/기술팀 5/5', '● 예배팀', '● 조명팀', '● 성찬위원', '● PD', '● 송번역팀',
    '▾ 부산캠퍼스 1/1', '● 부산 캠퍼스', '● 보고 있음 ● 임시저장 ○ 아직 없음', '주간 요약', '로그아웃'].join('\n');
  sc.eq('⑤-2 붙여 넣은 글에서 부서 이름만 (머리 숫자 · 날짜 · 메뉴 · 표시 글은 버림)', J(A.parseDeptList(pasted)),
    ['TLC 교회 보고서', '예배/기술팀', '예배팀', '조명팀', '성찬위원', 'PD', '송번역팀', '부산캠퍼스', '부산 캠퍼스']);
  sc.eq('⑤-2 같은 이름은 한 번 · 빈 글은 빈 목록', J([A.parseDeptList('조명팀\n조명팀\n'), A.parseDeptList('')]), [['조명팀'], []]);
  const nb = A.normBook({ catalog: ['조명팀', '조명팀', '', 'x'.repeat(30)], depts: [] });
  sc.eq('⑤-2 가져온 목록은 시간표와 함께 저장 (겹침 없이 · 20자까지)', J([nb.catalog.length, nb.catalog[1].length]), [2, 20]);
  sc.eq('⑤-2 자주 있는 이름 목록이 있다', A.PRESET.includes('조명팀') && A.PRESET.includes('성찬위원'), true);
}

// ⑥ 셀 한눈에와 잇기 · 저장 자리
sc.eq('⑥ 사역 → 셀: 로고가 /cell/ 을 겹 화면으로', /case 'switch': return openLayer\('\/cell\/'/.test(HTML), true);
sc.eq('⑥ 셀 → 사역: 로고가 /report/ 를 겹 화면으로', /case 'switch': return openLayer\('\/report\/'/.test(CELL), true);
sc.eq('⑥ 겹 안에서 로고를 누르면 겹이 걷힌다 (두 앱 모두)', [HTML, CELL].every(h => /parent\.postMessage\(\{ type: 'b7-layer-close' \}/.test(h) && /b7-layer-close'\) closeLayer\(false\)/.test(h)), true);
sc.eq('⑥ 셀 한눈에와 같은 로그인 칸(앱 이름 cell)', /firebase\.initializeApp\(FB_CFG, 'cell'\)/.test(HTML), true);
sc.eq('⑥ 시간표는 cellbook/{uid} 의 report 칸에만 · users 는 안 건드림', /collection\('cellbook'\)\.doc\(FB\.user\.uid\)\.set\(\{ report: S\.book \}, \{ merge: true \}\)/.test(HTML) && !/collection\('users'\)/.test(HTML), true);

// ⑦ 집 주소 · 버전
sc.eq('⑦ block7.my 로 열리면 sweeter.my/report/ 로 넘긴다', HTML.includes("location.replace('https://sweeter.my/report/'"), true);
sc.eq('⑦ 2번째 줄 버전 주석 = APP_VERSION', HTML.split('\n')[1].includes(A.APP_VERSION), true);
const man = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'report', 'manifest.json'), 'utf8'));
sc.eq('⑦ 홈 화면 앱은 /report/ 안에서', [man.display, man.start_url, man.scope], ['standalone', '/report/', '/report/']);
sc.eq('⑦ 아이콘 파일이 있다', ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png'].every(f => fs.existsSync(path.join(__dirname, '..', 'report', f))), true);

sc.done();
