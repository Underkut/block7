// 셀 한눈에(cell/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="cell-core">)를 떼어 시험한다.
// 셀 · 사람 이름은 모두 지어낸 것이다 (공개 저장소).
//
// 지키는 것:
//  ① 주 목록 — 이번 주부터 거꾸로 7일씩
//  ② '내 분파셀' — 셀 케어 교역자 홈과 같은 판정 (내가 인도하는 셀 · 담임 직접 확인 셀은 빼고, 배정 · 책임 · 확인 가능)
//  ③ 냈는가 — 제출 · 수정 요청 · 고치는 중은 '냈음', 작성 중 · 없음은 '안 냄'
//  ④ 연속 주 수 — 이번 주를 냈으면 이번 주부터, 아직이면 지난주부터 · 셀이 없던 주에서 끊는다 · 12주 꽉 차면 '넘게'
//  ⑤ 이슈 묶기 — 태그 여럿이면 여러 묶음에 · 태그 없으면 기타 · 정해 둔 순서(신앙 · 장기결석 · 근황 · 건강 …)
//  ⑥ 기도제목 — 같은 사람 같은 글은 한 번(가장 최근 주) · 빈 글은 버림 · 셀 → 사람 순
//  ⑦ 새 코멘트 — 처음 여는 기기는 '새 것 없음' · 본 목록은 상한까지만 · 내용은 저장하지 않는다(id 만)
//  ⑧ 읽기만 — 셀 케어에 쓰는 함수 · 표 쓰기를 부르는 글자가 파일에 없다
//  ⑨ 출석 추이 — 낸 주만 숫자 · 평균 · 지난번 대비
//  ⑩ 배포 · 집 주소 — block7.my 로 열리면 sweeter.my/cell/ 로 · 버전 두 곳 같음
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'cell', 'index.html'), 'utf8');
const m = HTML.match(/<script id="cell-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('cell-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, Promise, isFinite };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, SEEN_KEY, PREF_KEY, WEEKS_LOADED, addDays, weeksBack, weekLabel, pickMine, isSubmitted, stateOf, streakOf, streakText,
  catsOf, groupIssues, collectPrayers, unseenComments, mergeSeen, attendanceSeries, attendanceSummary, pool };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// ① 주 목록
const W = A.weeksBack('2026-11-02', 12);
sc.eq('① 이번 주부터 거꾸로 7일씩', J(W.slice(0, 3)), ['2026-11-02', '2026-10-26', '2026-10-19']);
sc.eq('① 12주', W.length, 12);
sc.eq('① 주 이름은 셀 케어와 같이 (그 달 몇째 주)', A.weekLabel('2026-11-02'), '11월 1주차');

// ② 내 분파셀
{
  const rows = [
    { cell_id: 'a', review_mode: 'leadership', responsible_leadership_id: 'me' },
    { cell_id: 'b', review_mode: 'leadership', responsible_leadership_id: 'other' },            // 배정으로
    { cell_id: 'c', review_mode: 'leadership', responsible_leadership_id: 'other' },            // 아무것도 아님
    { cell_id: 'd', review_mode: 'senior_direct', responsible_leadership_id: 'me' },            // 담임 직접 → 뺌
    { cell_id: 'e', review_mode: 'leadership', responsible_leadership_id: 'me', i_am_leader: true }, // 내가 인도 → 뺌
    { cell_id: 'f', review_mode: 'leadership', responsible_leadership_id: 'other', i_can_review: true },
    { cell_id: 'g', review_mode: 'leadership', responsible_leadership_id: 'other' },            // 지난 배정
  ];
  const asg = [{ cell_id: 'b', start_date: '2026-01-01', end_date: null }, { cell_id: 'g', start_date: '2025-01-01', end_date: '2026-06-30' }];
  sc.eq('② 책임 · 지금 배정 · 확인 가능만, 담임 직접 · 내가 인도 · 지난 배정은 뺀다', J(A.pickMine(rows, asg, 'me', '2026-11-06')), ['a', 'b', 'f']);
  sc.eq('② 자료가 없어도 안 깨진다', J(A.pickMine(null, null, 'me', '2026-11-06')), []);
}

// ③ 냈는가
sc.eq('③ 제출', A.isSubmitted({ report_id: 'r', status: 'submitted' }), true);
sc.eq('③ 수정 요청(냈다가 돌려받음)도 냄', A.isSubmitted({ report_id: 'r', status: 'revision_requested' }), true);
sc.eq('③ 고치는 중(한 번 냈음)도 냄', A.isSubmitted({ report_id: 'r', status: 'draft', submission_no: 1 }), true);
sc.eq('③ 처음 작성 중은 안 냄', A.isSubmitted({ report_id: 'r', status: 'draft', submission_no: 0 }), false);
sc.eq('③ 보고서 없음은 안 냄', A.isSubmitted({ report_id: null }), false);
sc.eq('③ 상태 이름', J(['submitted', 'revision_requested', 'draft'].map(s => A.stateOf({ report_id: 'r', status: s, submission_no: 0 })).concat(A.stateOf({ report_id: null }), A.stateOf(null))),
  ['submitted', 'revision', 'draft', 'missing', 'none']);

// ④ 연속 주 수
{
  const mk = (pat) => { const mm = new Map(); [...pat].forEach((ch, i) => { if (ch !== '.') mm.set(W[i], ch === 's' ? { report_id: 'r' + i, status: 'submitted' } : { report_id: null }); }); return mm; };
  const s1 = A.streakOf(mk('sss-ssssssss'), W);
  sc.eq('④ 이번 주 냈으면 이번 주부터 센다', J([s1.thisDone, s1.kind, s1.run]), [true, 'sub', 3]);
  sc.eq('④ 글: 3주 연속 제출', A.streakText(s1), '3주 연속 제출');
  const s2 = A.streakOf(mk('---sssssssss'), W);
  sc.eq('④ 이번 주 아직이면 지난주부터 — 2주째 미제출', J([s2.thisDone, s2.kind, s2.run]), [false, 'miss', 2]);
  sc.eq('④ 글에 "지난주까지" 를 붙인다', A.streakText(s2), '지난주까지 2주째 미제출');
  const s3 = A.streakOf(mk('-sssssss-sss'), W);
  sc.eq('④ 이번 주 아직 · 지난주까지 7주 연속 제출', A.streakText(s3), '지난주까지 7주 연속 제출');
  const s4 = A.streakOf(mk('ssssssssssss'), W);
  sc.eq('④ 12주 꽉 차면 "넘게"', A.streakText(s4), '12주 넘게 연속 제출');
  const s5 = A.streakOf(mk('ssss........'), W);
  sc.eq('④ 셀이 없던 주에서 끊는다 (새 셀은 넘게가 아니다)', A.streakText(s5), '4주 연속 제출');
  const s6 = A.streakOf(mk('-...........'), W);
  sc.eq('④ 이번 주에 새로 생긴 셀은 글이 없다', A.streakText(s6), '');
}

// ⑤ 이슈 묶기
{
  const notes = [
    { id: 1, categories: ['health', 'family'], _week: '2026-10-26' },
    { id: 2, categories: [], category: 'faith', _week: '2026-11-02' },
    { id: 3, _week: '2026-11-02' },
    { id: 4, categories: ['health'], _week: '2026-11-02' },
    { id: 5, categories: ['long_absence'], _week: '2026-11-02' },
  ];
  const g = A.groupIssues(notes);
  sc.eq('⑤ 정해 둔 순서로 묶는다', J(g.map(x => x.key)), ['faith', 'long_absence', 'health', 'family', 'other']);
  sc.eq('⑤ 태그 여럿이면 두 묶음 모두에', J(g.find(x => x.key === 'family').items.map(n => n.id)), [1]);
  sc.eq('⑤ 한 묶음 안은 최근 주 먼저', J(g.find(x => x.key === 'health').items.map(n => n.id)), [4, 1]);
  sc.eq('⑤ 예전 한 칸짜리(category)도 읽는다 · 없으면 기타', J([A.catsOf(notes[1]), A.catsOf(notes[2])]), [['faith'], ['other']]);
  sc.eq('⑤ 이름은 셀 케어 표시 그대로', g[1].label, '장기결석');
}

// ⑥ 기도제목
{
  const P = A.collectPrayers([
    { cellId: 'c2', cellName: '샘플 2셀', who: '정다운', text: '부모님 건강', week: '2026-10-26' },
    { cellId: 'c2', cellName: '샘플 2셀', who: '정다운', text: ' 부모님   건강 ', week: '2026-11-02' },
    { cellId: 'c1', cellName: '샘플 1셀', who: '김하나', text: '수술이 잘 되도록', week: '2026-11-02' },
    { cellId: 'c1', cellName: '샘플 1셀', who: '김하나', text: '', week: '2026-11-02' },
    { cellId: 'c1', cellName: '샘플 1셀', who: '김하나', text: '가정의 평안', week: '2026-10-19' },
  ]);
  sc.eq('⑥ 셀 → 사람 순', J(P.map(p => p.cellName + '/' + p.who)), ['샘플 1셀/김하나', '샘플 2셀/정다운']);
  sc.eq('⑥ 같은 글(빈칸 차이만)은 한 번 · 가장 최근 주', J(P[1].items.map(i => i.week)), ['2026-11-02']);
  sc.eq('⑥ 빈 글은 버리고 최근 것부터', J(P[0].items.map(i => i.text)), ['수술이 잘 되도록', '가정의 평안']);
}

// ⑦ 새 코멘트
{
  const C = [{ id: 'x1' }, { id: 'x2' }, { id: 3 }];
  sc.eq('⑦ 처음 여는 기기(본 목록 없음)는 새 것 없음', J(A.unseenComments(C, null)), []);
  sc.eq('⑦ 본 목록에 없는 것만 새 것 (숫자 id 도)', J(A.unseenComments(C, ['x1']).map(c => c.id)), ['x2', 3]);
  const seen = A.mergeSeen(['x1'], C);
  sc.eq('⑦ 본 목록은 id 글자만 · 겹침 없이', J(seen), ['x1', 'x2', '3']);
  sc.eq('⑦ 본 목록은 상한까지만 (오래된 것부터 버림)', J(A.mergeSeen(['a', 'b', 'c'], [{ id: 'd' }], 2)), ['c', 'd']);
}

// ⑧ 읽기만
{
  const code = HTML.replace(/<!--[\s\S]*?-->/g, '');
  const writes = ['save_report', 'submit_report', 'start_report', 'review_report', 'review_update', 'request_revision', 'senior_comment_add', 'senior_comment_delete',
    'note_comment_add', 'msg_post', 'msg_start', 'notice_create', 'lr_save', 'pastor_msg_save', 'add_attendee', 'move_report_week', 'cellcare_talk_add',
    'cellcare_senior_ack', 'save_push_subscription', 'request_access', 'report_login_problem', 'cellcare_report_open'];
  sc.eq('⑧ 셀 케어에 쓰는 함수를 부르지 않는다', writes.filter(w => code.includes(w)), []);
  sc.eq('⑧ 표에 쓰는 동작(.insert · .update · .upsert · .delete)이 없다', /\.(insert|upsert|update|delete)\s*\(/.test(code.replace(/classList\.[a-z]+\(|\.delete\(\s*\)/g, '')), false);
  const rpcs = [...code.matchAll(/rpc\('([a-z_]+)'/g)].map(x => x[1]).sort();
  sc.eq('⑧ 부르는 함수는 읽기 다섯 개뿐', J([...new Set(rpcs)]), ['get_my_context', 'get_open_prayers', 'get_report_roster', 'get_week_status', 'senior_comment_list']);
  sc.eq('⑧ 계정을 새로 만들지 않는다 (shouldCreateUser:false)', /shouldCreateUser:\s*false/.test(code), true);
  sc.eq('⑧ 이 기기 저장 이름이 다른 앱과 겹치지 않는다', [A.SEEN_KEY, A.PREF_KEY].some(k => /^(b7|pray|b7wallet|care)/.test(k)), false);
}

// ⑨ 출석 추이
{
  const mm = new Map([[W[0], { report_id: 'r', status: 'submitted', members_present: 5, members_absent: 1, visitors_present: 1 }],
    [W[1], { report_id: 'r', status: 'submitted', members_present: 3, members_absent: 3 }], [W[2], { report_id: null }]]);
  const s = A.attendanceSeries(mm, W.slice(0, 3));
  sc.eq('⑨ 옛날 → 이번 주 순, 안 낸 주는 비움', J(s.map(x => [x.week, x.has, x.present])), [[W[2], false, 0], [W[1], true, 3], [W[0], true, 5]]);
  sc.eq('⑨ 평균 · 최근 · 지난번 대비 · 참석률', J(A.attendanceSummary(s)), { avg: 4, last: 5, delta: 2, rate: 83 });
  sc.eq('⑨ 기록이 없으면 비움', J(A.attendanceSummary([])), { avg: null, last: null, delta: null, rate: null });
}

// ⑩ 집 주소 · 버전
sc.eq('⑩ block7.my 로 열리면 sweeter.my/cell/ 로 넘긴다', HTML.includes("location.replace('https://sweeter.my/cell/'"), true);
sc.eq('⑩ 2번째 줄 버전 주석 = APP_VERSION', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑩ 검색에 안 잡히게 (noindex)', /name="robots" content="noindex/.test(HTML), true);

// pool — 동시에 n 개까지, 실패해도 나머지는 받는다
(async () => {
  let live = 0, peak = 0;
  const out = await A.pool([1, 2, 3, 4, 5, 6, 7], 3, async (x) => { live++; peak = Math.max(peak, live); await new Promise(r => setTimeout(r, 5)); live--; if (x === 4) throw new Error('x'); return x * 2; });
  sc.eq('pool: 동시에 3개까지', peak, 3);
  sc.eq('pool: 실패한 것만 표시, 나머지는 받는다', J(out.map(o => o && o.__err ? 'err' : o)), [2, 4, 6, 'err', 10, 12, 14]);
  sc.done();
})();
