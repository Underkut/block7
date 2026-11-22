// 분당 예배위원(1122-V) 핵심 규칙 — rotation/index.html 의 <script id="serve-core"> 를 떼어 시험한다
// (rotation-core 의 gsFill · gsN · gsDate · gsSvc 를 빌려 쓰므로 그 덩어리도 함께 싣는다).
// 사람 이름은 모두 지어낸 것이다 (공개 저장소). 시트 모양은 실제 '26.11월' 탭을 본떴다(11/22 저장소 밖에서만 열어 봄).
//
// 지키는 것:
//  ① 탭 이름 '26.11월' · '23.9월' → 달 / 특별 탭('2026 고난주간')은 안 읽음 · 같은 달은 앞 탭
//  ② 구분 글 → 역할 · 자리 ('안내위원(2층 입구)' → 안내 · 2층 입구) · 모르는 글은 null
//  ③ 칸 이름 나누기: 빈칸 · 줄바꿈 · '이름(비전홀)' 은 그 자리 · '*' 뗌 · 'ㅇ' · '-' 는 이름 아님
//  ④ 탭 읽기: 세 블록(주일 · 수요 · 금요) · 합친 날짜 · 수식 날짜(FORMATTED '11월 8일') · 합친 구분 칸 중복 없음 · 옆 메모 · 아래 표 안 읽음 · 다음 달 첫 수요(12/2)
//  ⑤ 다듬기 · 맞추기: 모르는 예배 · 역할 버림 · 줄마다 나중 것 · 한쪽만 있는 칸 남음 · 지우기 표지 · 순서 무관
//  ⑥ 칸 넣고 빼기: 같은 값이면 그대로 · 비우면 지우기 표지
//  ⑦ 가져오기: 빈 칸만 · 이미 적은 칸 · 지운 칸 그대로 · 두 번 해도 같음 · 새 이름 → 명단(pools) · 같은 이름 둘이면 안 이음 · 남의 달 칸 안 넣음
//  ⑧ '지금' / '다가올 섬김'(HB 11/22): 오늘 섬김이 남았으면 지금 · 끝났거나 없으면 다음 날 · 때를 모르면 그 날 끝까지
//  ⑨ 담당 교역자 표시(HB 11/22): 설정 이름이 있으면 '담당 교역자 (이름)' · 없으면 '담당 교역자' · 코드에 실제 이름 없음
//  ⑩ 한 예배 판(함께 섬기는 분들) · 칸 이름
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'rotation', 'index.html'), 'utf8');
const core = HTML.match(/<script id="rotation-core">([\s\S]*?)<\/script>/), serve = HTML.match(/<script id="serve-core">([\s\S]*?)<\/script>/);
if (!core || !serve) { console.error('rotation-core · serve-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Array, String, Date, Map, Set, isNaN };
vm.createContext(ctx);
vm.runInContext(core[1] + '\n' + serve[1] + `
this.A = { SV_SVC, SV_ROLE, svId, svLabel, svLeadLabel, svTabYm, svPickTabs, svRoleOf, svBlockSvc, svNames, svReadTab,
  svNormBoard, svMergeBoard, svSame, svSet, svLive, svNormPeople, svMergePeople, svNameMap, svImport, svMine, svNow, svService };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// ① 탭 이름
sc.eq('① 탭 이름 → 달', ['26.11월', '23.9월', '26.11 월', '25.12월'].map(A.svTabYm), ['2026-11', '2023-09', '2026-11', '2025-12']);
sc.eq('① 특별 탭 · 다른 꼴은 안 읽음', ['2026 고난주간', '26.11월의 사본', '26년 11월 1117-1', '26.13월'].map(A.svTabYm), ['', '', '', '']);
sc.eq('① 고를 탭: 달마다 하나 · 같은 달은 앞(왼쪽) · 없으면 빈칸',
  J(A.svPickTabs(['26.11월', '26.11월 ', '26.10월', '2026 고난주간'], ['2026-10', '2026-11', '2026-12'])),
  [{ ym: '2026-10', title: '26.10월' }, { ym: '2026-11', title: '26.11월' }, { ym: '2026-12', title: '' }]);

// ② 구분 글
sc.eq('② 구분 → 역할 · 자리', ['안내위원(1층)', '안내위원(2층 입구)', '헌금위원', '봉독위원', '성찬위원(1조 빵)', '안내위원(내부주보)'].map(t => J(A.svRoleOf(t))),
  [{ role: 'gd', pl: '1층' }, { role: 'gd', pl: '2층 입구' }, { role: 'of', pl: '' }, { role: 'rd', pl: '' }, { role: 'cm', pl: '1조 빵' }, { role: 'gd', pl: '내부주보' }]);
sc.eq('② 보이지 않는 글자(시트의 \\b)가 붙어도 읽음', J(A.svRoleOf('\b안내위원')), { role: 'gd', pl: '' });
sc.eq('② 모르는 구분은 null', [A.svRoleOf('자막'), A.svRoleOf(''), A.svRoleOf('1부 봉독')], [null, null, null]);
sc.eq('② 블록 이름 → 예배', ['수요 예배 위원 ', '금요 예배 위원', '화요 예배 위원 ', '주일 예배 위원'].map(A.svBlockSvc), ['W', 'F', 'T', '']);

// ③ 이름 나누기
sc.eq('③ 빈칸 · 줄바꿈 · (비전홀) 은 자리', J(A.svNames('하늘 가람\n누리(비전홀)')), [{ n: '하늘', pl: '' }, { n: '가람', pl: '' }, { n: '누리', pl: '비전홀' }]);
sc.eq('③ * 뗌 · ㅇ · - 는 이름 아님 · 빈 칸', [J(A.svNames('다온* 새벽')), J(A.svNames('ㅇ')), J(A.svNames('-')), J(A.svNames(''))],
  [[{ n: '다온', pl: '' }, { n: '새벽', pl: '' }], [], [], []]);
sc.eq('③ 이름은 여덟까지', A.svNames('가 나 다 라 마 바 사 아 자 차').length, 8);

// ④ 탭 읽기 — 실제 '26.11월' 모양을 본뜬 시험 탭(지어낸 이름). 행 · 열 번호는 0 부터(A=0)
const M = (r0, r1, c0, c1) => ({ startRowIndex: r0, endRowIndex: r1, startColumnIndex: c0, endColumnIndex: c1 });
function tab() {
  const g = []; const put = (r, c, v) => { while (g.length <= r) g.push([]); while (g[r].length <= c) g[r].push(''); g[r][c] = v; };
  put(0, 0, '최종'); put(0, 14, '미정');
  put(1, 0, '주일 예배 위원'); put(1, 7, '수요 예배 위원 '); put(1, 11, '금요 예배 위원');
  ['날짜', '구분', '1부', '2부', '3부', '라이프라인 예배', '', '날짜', '구분', '명단', '', '날짜', '구분', '명단'].forEach((v, c) => put(2, c, v));
  const sunD = ['11월 1일', '11월 8일'], wedD = ['11월 4일', '11월 11일'], friD = ['11월 6일', '11월 13일'];
  for (let w = 0; w < 2; w++) { const r = 3 + w * 5;
    put(r, 0, sunD[w]); put(r, 7, wedD[w]); put(r, 11, friD[w]);   // 날짜는 합친 칸 맨 위에만
    put(r, 1, '안내위원(1층)'); put(r, 2, '가람'); put(r, 3, '나래'); put(r, 4, '다온'); put(r, 5, '라온');
    put(r + 1, 1, '안내위원(2층 입구)'); put(r + 1, 2, '마루'); put(r + 1, 3, '바다');
    put(r + 2, 1, '안내위원(2층 내부)'); put(r + 2, 3, '사랑');
    put(r + 3, 1, '헌금위원'); put(r + 3, 2, '아라 자람'); put(r + 3, 5, '라온 차오름\n카이(비전홀)');
    put(r + 4, 1, '봉독위원'); put(r + 4, 2, w ? '타라' : '파랑'); put(r + 4, 3, '하람*');
    put(r, 8, '안내위원'); put(r, 9, '나래');   // 수요: 안내는 세 줄 합친 칸 하나
    put(r + 3, 8, '헌금위원'); put(r + 3, 9, '사랑 아라'); put(r + 4, 8, '봉독위원'); put(r + 4, 9, '바다');
    put(r, 12, '안내위원'); put(r, 13, '가람'); put(r + 1, 13, '마루'); put(r + 2, 13, '다온');   // 금요: 구분은 합쳤고 이름은 줄마다
    put(r + 3, 12, '헌금위원'); put(r + 3, 13, '자람 라온 카이(비전홀)');
  }
  put(3, 16, '나래'); put(3, 17, '1주차, 마지막주 제외');   // 옆 메모 — 안 읽음
  put(13, 0, '11월 15일'); put(13, 1, '봉독위원'); put(13, 2, '다온'); put(13, 7, '12월 2일'); put(13, 8, '봉독위원'); put(13, 9, '나래');   // 다음 달 첫 수요(12/2)
  put(17, 1, '1부 봉독'); put(17, 2, 'ㅇ'); put(25, 1, '이름'); put(25, 2, '근무');   // 아래 체크표 · 특이사항 — 빈 줄 둘 뒤라 안 읽음
  const merges = [M(1, 2, 0, 6), M(1, 2, 7, 10), M(1, 2, 11, 14)];
  for (let w = 0; w < 2; w++) { const r = 3 + w * 5; merges.push(M(r, r + 5, 0, 1), M(r, r + 5, 7, 8), M(r, r + 5, 11, 12), M(r, r + 3, 8, 9), M(r, r + 3, 9, 10), M(r, r + 3, 12, 13)); }
  return { values: g, merges };
}
const T = tab(), R = A.svReadTab(T.values, T.merges, '2026-11'), C = id => { const c = R.cells.find(x => A.svId(x.date, x.svc, x.role, x.pl) === id); return c ? c.names : null; };
sc.eq('④ 경고 없음', J(R.warn), []);
sc.eq('④ 주일 1부 안내 1층 · 2층 입구 (합친 날짜 칸)', [C('2026-11-01|1|gd|1층'), C('2026-11-01|1|gd|2층입구')], [['가람'], ['마루']]);
sc.eq('④ 둘째 주 날짜도(수식 → 11월 8일)', C('2026-11-08|2|gd|2층내부'), ['사랑']);
sc.eq('④ 헌금 두 분 · LL 비전홀은 따로 자리', [C('2026-11-01|1|of|'), C('2026-11-01|LL|of|'), C('2026-11-01|LL|of|비전홀')], [['아라', '자람'], ['라온', '차오름'], ['카이']]);
sc.eq('④ 봉독 · * 뗌', [C('2026-11-01|1|rd|'), C('2026-11-08|1|rd|'), C('2026-11-01|2|rd|')], [['파랑'], ['타라'], ['하람']]);
sc.eq('④ 수요: 합친 안내 칸이 한 번만 · 헌금 · 봉독', [C('2026-11-04|W|gd|'), C('2026-11-04|W|of|'), C('2026-11-11|W|rd|')], [['나래'], ['사랑', '아라'], ['바다']]);
sc.eq('④ 금요: 줄마다 이름이 모여 안내 셋 · 비전홀', [C('2026-11-06|F|gd|'), C('2026-11-13|F|of|'), C('2026-11-13|F|of|비전홀')], [['가람', '마루', '다온'], ['자람', '라온'], ['카이']]);
sc.eq('④ 셋째 주 · 다음 달 첫 수요(12/2)도 읽음', [C('2026-11-15|1|rd|'), C('2026-12-02|W|rd|')], [['다온'], ['나래']]);
sc.eq('④ 옆 메모 · 아래 체크표 · 특이사항은 안 읽음', R.cells.some(c => c.names.includes('근무') || c.names.includes('이름') || c.names.includes('ㅇ')) || R.cells.some(c => c.role === 'rd' && c.date === '2026-11-01' && c.svc === '1' && c.names.length !== 1), false);
sc.eq('④ 칸 수', R.cells.length, 2 * (4 + 2 + 1 + 3 + 2 + 3 + 3) + 2);
const noM = tab(); const R3 = A.svReadTab(noM.values, [], '2026-11');
sc.eq('④ 블록 이름 칸이 합쳐 있지 않아도(왼쪽에만 글) 수요 · 금요를 읽음', [R3.cells.some(c => c.svc === 'W'), R3.cells.some(c => c.svc === 'F'), R3.warn.some(w => w.includes('명단'))], [true, true, false]);
const bad = A.svReadTab([['아무 글'], ['']], [], '2026-11');
sc.eq('④ 구분 칸이 없으면 경고 · 짐작 안 함', [bad.cells.length, bad.warn.length > 0], [0, true]);
const odd = tab(); odd.values[2][4] = '청년부'; odd.values[3 + 3][1] = '자막';
const R2 = A.svReadTab(odd.values, odd.merges, '2026-11');
sc.eq('④ 모르는 예배 칸 · 구분은 경고하고 건너뜀', [R2.warn.some(w => w.includes('청년부')), R2.warn.some(w => w.includes('자막')), R2.cells.some(c => c.svc === '3')], [true, true, false]);

// ⑤ 다듬기 · 맞추기
const cell = (date, svc, role, pl, names, at, extra) => Object.assign({ date, svc, role, pl, w: names.map(n => ({ p: '', n })), at }, extra || {});
const bd = (ym, list, st) => { const o = { ym, st: st || 'draft', at: 1, cells: {} }; for (const c of list) o.cells[A.svId(c.date, c.svc, c.role, c.pl)] = c; return o; };
const nb = A.svNormBoard({ ym: '2026-11', cells: { '2026-11-01|9|gd|': cell('2026-11-01', '9', 'gd', '', ['가람'], 1), '2026-11-01|1|xx|': cell('2026-11-01', '1', 'xx', '', ['가람'], 1),
  '2026-12-06|1|rd|': cell('2026-12-06', '1', 'rd', '', ['가람'], 1), '2026-11-01|1|gd|1층': cell('2026-11-01', '1', 'gd', '1층', ['가람', '가람'], 1),
  '2026-11-01|1|gd|2층': cell('2026-11-01', '1', 'gd', '1층', ['가람'], 1) } });
sc.eq('⑤ 다듬기: 모르는 예배 · 역할 · 남의 달 · 자리 열쇠가 안 맞는 칸 버림 · 같은 이름 한 번', J(Object.keys(nb.cells)), ['2026-11-01|1|gd|1층']);
sc.eq('⑤ 다듬기: 상태는 draft · open 만', [A.svNormBoard({ ym: '2026-11', st: 'x' }).st, A.svNormBoard({ ym: '2026-11', st: 'open' }).st], ['draft', 'open']);
const a = bd('2026-11', [cell('2026-11-01', '1', 'rd', '', ['가람'], 10), cell('2026-11-08', '1', 'rd', '', ['나래'], 5)]);
const b = bd('2026-11', [cell('2026-11-01', '1', 'rd', '', ['다온'], 20), cell('2026-11-15', '1', 'rd', '', ['라온'], 5), Object.assign(cell('2026-11-08', '1', 'rd', '', [], 9), { del: true })]);
const ab = A.svMergeBoard(a, b), ba = A.svMergeBoard(b, a);
sc.eq('⑤ 맞추기: 나중 것 · 한쪽만 있는 칸 남음 · 지우기 표지가 이김', A.svLive(ab).map(c => c.date + ':' + c.w.map(x => x.n)).sort(), ['2026-11-01:다온', '2026-11-15:라온']);
sc.eq('⑤ 맞추기: 순서 무관', A.svSame(ab, ba), true);
sc.eq('⑤ 맞추기: 지운 칸은 표지로 남음(낡은 기기가 못 살림)', [!!ab.cells['2026-11-08|1|rd|'].del, A.svLive(A.svMergeBoard(ab, a)).some(c => c.date === '2026-11-08')], [true, false]);

// ⑥ 칸 넣고 빼기
const s0 = bd('2026-11', [cell('2026-11-01', '1', 'rd', '', ['가람'], 1)]);
const s1 = A.svSet(s0, { date: '2026-11-01', svc: '1', role: 'rd', pl: '' }, [{ p: '', n: '가람' }], 'hb', 50);
sc.eq('⑥ 같은 값이면 그대로(고친 때 안 바뀜)', s1.cells['2026-11-01|1|rd|'].at, 1);
const s2 = A.svSet(s0, { date: '2026-11-01', svc: '1', role: 'rd', pl: '' }, [], 'hb', 60);
sc.eq('⑥ 비우면 지우기 표지', [!!s2.cells['2026-11-01|1|rd|'].del, s2.cells['2026-11-01|1|rd|'].at, A.svLive(s2).length], [true, 60, 0]);
const s3 = A.svSet(s0, { date: '2026-11-08', svc: 'F', role: 'gd', pl: '' }, [], 'hb', 60);
sc.eq('⑥ 없던 칸을 비우면 아무것도 안 생김', Object.keys(s3.cells).length, 1);

// ⑦ 가져오기
const p0 = { people: { pa: { id: 'pa', name: '가람', alias: [], pools: ['1|gd'], at: 1 } } };
const im1 = A.svImport(null, p0, R, 'hb', 100);
sc.eq('⑦ 처음: 11월 칸만 모두 채움(12/2 는 안 넣음)', [im1.filled, im1.kept, Object.keys(im1.board.cells).every(k => k.startsWith('2026-11'))], [R.cells.length - 1, 0, true]);
sc.eq('⑦ 아는 이름은 그 사람 · 새 이름은 명단에', [im1.board.cells['2026-11-01|1|gd|1층'].w[0].p, im1.added.includes('나래'), im1.added.includes('가람')], ['pa', true, false]);
const nr = Object.values(im1.people.people).find(p => p.name === '나래');
sc.eq('⑦ 새 사람의 pools = 들어간 예배 · 역할', J(nr.pools.slice().sort()), ['2|gd', 'W|gd']);
sc.eq('⑦ 아는 사람에게 새 pool 더함', J(im1.people.people.pa.pools.includes('F|gd')), true);
const im2 = A.svImport(im1.board, im1.people, R, 'hb', 200);
sc.eq('⑦ 두 번 해도 같음(채운 칸 0 · 판 · 명단 그대로)', [im2.filled, A.svSame(im1.board, im2.board), JSON.stringify(im1.people) === JSON.stringify(im2.people)], [0, true, true]);
const edited = A.svSet(A.svSet(im1.board, { date: '2026-11-01', svc: '1', role: 'rd', pl: '' }, [{ p: '', n: '마루' }], 'hb', 300), { date: '2026-11-08', svc: '1', role: 'rd', pl: '' }, [], 'hb', 300);
const im3 = A.svImport(edited, im1.people, R, 'hb', 400);
sc.eq('⑦ 앱에서 고친 칸 · 지운 칸은 시트로 덮지 않음', [im3.board.cells['2026-11-01|1|rd|'].w[0].n, !!im3.board.cells['2026-11-08|1|rd|'].del, im3.filled], ['마루', true, 0]);
const pDup = { people: { x1: { id: 'x1', name: '가람', at: 1 }, x2: { id: 'x2', name: '가 람', at: 1 } } };
const im4 = A.svImport(null, pDup, R, 'hb', 100);
sc.eq('⑦ 같은 이름이 둘이면 잇지 않고 글자로', [im4.board.cells['2026-11-01|1|gd|1층'].w[0].p, im4.dup.includes('가람')], ['', true]);
const imDec = A.svImport({ ym: '2026-12', cells: {} }, p0, R, 'hb', 100);
sc.eq('⑦ 12월 판에는 12/2 한 칸만', J(Object.keys(imDec.board.cells)), ['2026-12-02|W|rd|']);
sc.eq('⑦ 지우지 않음: 시트에 없는 앱 칸은 그대로', (() => { const x = A.svSet({ ym: '2026-11', cells: {} }, { date: '2026-11-22', svc: '1', role: 'cm', pl: '1조 빵' }, [{ p: '', n: '하늘' }], 'hb', 5); return A.svLive(A.svImport(x, p0, R, 'hb', 9).board).some(c => c.role === 'cm'); })(), true);

// ⑧ 지금 / 다가올 섬김
const nowB = [bd('2026-11', [cell('2026-11-22', '1', 'of', '', [], 1, { w: [{ p: 'me', n: '나' }, { p: 'o', n: '너' }] }), cell('2026-11-22', 'LL', 'gd', '', [], 1, { w: [{ p: 'me', n: '나' }] }),
  cell('2026-11-27', 'F', 'gd', '', [], 1, { w: [{ p: 'me', n: '나' }] }), cell('2026-11-29', '2', 'rd', '', [], 1, { w: [{ p: 'o', n: '너' }] })])];
const TM = { '1': '09:30', LL: '17:00', F: '20:00' };
const md = r => r.mode + ':' + r.date + ':' + r.items.map(c => c.svc).join(',');
sc.eq('⑧ 주일 아침: 오늘 섬김 둘 → 지금', md(A.svNow(nowB, 'me', { date: '2026-11-22', min: 9 * 60 }, TM)), 'now:2026-11-22:1,LL');
sc.eq('⑧ 1부가 끝난 낮: 남은 LL 만 지금', md(A.svNow(nowB, 'me', { date: '2026-11-22', min: 12 * 60 }, TM)), 'now:2026-11-22:LL');
sc.eq('⑧ 밤(다 끝남) → 다가올 섬김(금요)', md(A.svNow(nowB, 'me', { date: '2026-11-22', min: 22 * 60 }, TM)), 'next:2026-11-27:F');
sc.eq('⑧ 오늘 섬김 없음 → 다가올 섬김', md(A.svNow(nowB, 'me', { date: '2026-11-23', min: 600 }, TM)), 'next:2026-11-27:F');
sc.eq('⑧ 때를 모르면 그 날 끝까지 지금', md(A.svNow(nowB, 'me', { date: '2026-11-22', min: 23 * 60 }, {})), 'now:2026-11-22:1,LL');
sc.eq('⑧ 남은 섬김이 없으면 none', A.svNow(nowB, 'me', { date: '2026-11-30', min: 0 }, TM).mode, 'none');
sc.eq('⑧ 내 섬김 목록: 남의 칸 빼고 날짜 · 때 차례', A.svMine(nowB, 'me', '', '', TM).map(c => c.date.slice(8) + c.svc), ['221', '22LL', '27F']);

// ⑨ 담당 교역자 표시
sc.eq('⑨ 설정 이름이 있으면 괄호로 · 없으면 담당 교역자만', [A.svLeadLabel({ lead: '가나다 목사' }), A.svLeadLabel({}), A.svLeadLabel(null)], ['담당 교역자 (가나다 목사)', '담당 교역자', '담당 교역자']);
sc.eq('⑨ serve-core 에 성도 화면용 HB 글자 없음', /['"`][^'"`\n]*\bHB\b[^'"`\n]*['"`]/.test(serve[1].replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')), false);

// ⑩ 한 예배 판 · 칸 이름
const svB = [bd('2026-11', [cell('2026-11-22', '1', 'rd', '', ['가람'], 1), cell('2026-11-22', '1', 'gd', '2층 입구', ['나래'], 1), cell('2026-11-22', '1', 'gd', '1층', ['다온'], 1), cell('2026-11-22', '1', 'of', '', ['라온'], 1), cell('2026-11-22', '2', 'rd', '', ['마루'], 1)])];
sc.eq('⑩ 한 예배 판: 그 예배만 · 안내 · 헌금 · 봉독 차례', A.svService(svB, '2026-11-22', '1').map(c => c.role + (c.pl ? ':' + c.pl : '')), ['gd:1층', 'gd:2층 입구', 'of', 'rd']);
sc.eq('⑩ 칸 이름', [A.svLabel({ date: '2026-11-22', svc: 'LL', role: 'of', pl: '비전홀' }, true), A.svLabel({ date: '2026-11-27', svc: 'F', role: 'gd', pl: '' })], ['11/22 라이프라인 헌금 · 비전홀', '금요 안내']);

// ⑪ 가져오기 판(S1b) — 코드에서 지킬 것
const ui = HTML.slice(HTML.indexOf('/* ---------- 분당 예배위원 가져오기 (1122-V S1b)'), HTML.indexOf('/* ---------- 구글 자료 (1121-G G1'));
sc.eq('⑪ 판 구역을 찾음', ui.length > 1000, true);
sc.eq('⑪ 시트에 쓰지 않음(method · update · append · batchUpdate · clear 없음) · /off 안 부름', [/method\s*:/.test(ui), /values:(update|append|batchUpdate|clear)|:batchUpdate|valueInputOption/.test(ui), /'\/off'/.test(ui)], [false, false, false]);
sc.eq('⑪ 계정에 쓰는 곳: svmRef · svRef 의 set 뿐 · update · delete 없음 · 책(b16) · 교역자 칸 안 건드림',
  [(ui.match(/\.(set|update|delete)\(/g) || []).length === (ui.match(/(svmRef\([^)]*\)|svRef\([^)]*\))\.set\(/g) || []).length, /\.update\(|\.delete\(/.test(ui), /WRITE_FIELD|saveBook|cloudSave|collection\('staff'\)/.test(ui)], [true, false, false]);
sc.eq('⑪ HB 만(svCan = 미리보기 또는 주인)', /function svCan\(\) \{ return DEMO \|\| \(!!FB\.user && FB\.role === 'owner'\); \}/.test(ui), true);
sc.eq('⑪ 메뉴 단추는 svCan 일 때만', /svCan\(\) \? '<button class="btn ghost" data-act="svopen">/.test(HTML), true);

sc.done();
