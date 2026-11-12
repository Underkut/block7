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
const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, Promise, isFinite, TextEncoder, TextDecoder, Uint8Array };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, SEEN_KEY, PREF_KEY, WEEKS_LOADED, addDays, weeksBack, weekLabel, pickMine, isSubmitted, stateOf, streakOf, streakText,
  catsOf, groupIssues, issueMatrix, issNorm, issPick, issState, collectPrayers, unseenComments, mergeSeen, attendanceSeries, attendanceSummary, trimBeforeStart, attTaken, pool, normName, nameScore, normPhone, fmtPhone, parseVcf, matchContacts, prepContacts, autoFill, linkVisits, buildPeople, personStats, careList, dropping, newFaces, cellHealth, periodStats, thrNorm, THR_DEFAULT, leaderSignals, leaderLevel, anonText, deanon, textKey, aiPrompt, aiTrim, aiSync, aiBodyKey, aiAlias, aiModelOrder, sseTexts, AI_MODELS, aiChunks, aiBatchPrompt, aiParseArr, AI_CHUNK, AI_KEY, AI_STORE, AI_MAX };`, ctx);
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
  sc.eq('② 책임 · 지금 배정 · 확인 가능 · 내가 인도(HB 11/6), 담임 직접 · 지난 배정은 뺀다', J(A.pickMine(rows, asg, 'me', '2026-11-06')), ['a', 'b', 'e', 'f']);
  sc.eq('② 내가 인도하는 셀은 담임 직접 확인이어도 넣는다', J(A.pickMine([{ cell_id: 'h', review_mode: 'senior_direct', i_am_leader: true }], [], 'me', '2026-11-06')), ['h']);
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
  sc.eq('④ 미제출이 12주 꽉 차면 "11주 넘게 미제출" (넘게째 아님)', A.streakText(A.streakOf(mk('------------'), W)), '지난주까지 11주 넘게 미제출');
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

// ⑤-2 셀 × 이슈 표 (HB 11/6: 셀 거르기 + 이슈 거르기를 한 판에)
{
  const notes = [
    { _cell: 'c2', _cellName: '샘플 2셀', categories: ['health', 'family'], leadership_attention_required: true },
    { _cell: 'c1', _cellName: '샘플 1셀', categories: ['faith'] },
    { _cell: 'c1', _cellName: '샘플 1셀', categories: ['health'] },
    { _cell: 'c2', _cellName: '샘플 2셀', categories: ['health'] },
  ];
  const mx = A.issueMatrix(notes);
  sc.eq('⑤-2 줄 = 셀 이름순', J(mx.cells), ['c1', 'c2']);
  sc.eq('⑤-2 열 = 확인 필요 먼저, 그다음 정해 둔 이슈 순', J(mx.tags), ['attn', 'faith', 'health', 'family']);
  sc.eq('⑤-2 칸 숫자', J([mx.count['c2|health'], mx.count['c1|health'], mx.count['c2|attn'], mx.count['c1|family'] || 0]), [2, 1, 1, 0]);
  sc.eq('⑤-2 줄 합계는 근황 건수(태그 여럿이어도 한 건)', J([mx.rowTotal.c1, mx.rowTotal.c2, mx.total]), [2, 2, 4]);
  sc.eq('⑤-2 열 합계 · 가장 큰 칸', J([mx.colTotal.health, mx.max]), [3, 2]);
  sc.eq('⑤-2 확인 필요가 없으면 그 열도 없다', A.issueMatrix([notes[1]]).tags.includes('attn'), false);
}

// ⑤-3 표 여럿 고르기 · 축 접기 (HB 11/6 2차)
{
  let v = A.issNorm({ cell: 'c1', tag: 'all' });
  sc.eq('⑤-3 예전 모양({cell, tag})도 읽는다', J(v), { cells: ['c1'], tags: [], foldCell: false, foldTag: false });
  v = A.issPick(v, 'c2|all'); v = A.issPick(v, 'all|health'); v = A.issPick(v, 'all|faith');
  sc.eq('⑤-3 셀 · 이슈를 여럿 고른다', J([v.cells, v.tags]), [['c1', 'c2'], ['health', 'faith']]);
  v = A.issPick(v, 'c1|all');
  sc.eq('⑤-3 다시 누르면 뺀다', J(v.cells), ['c2']);
  v = A.issPick(v, 'c3|family');
  sc.eq('⑤-3 칸을 누르면 그 셀 · 그 이슈를 함께 넣는다', J([v.cells, v.tags]), [['c2', 'c3'], ['health', 'faith', 'family']]);
  v = A.issPick(v, 'c3|family');
  sc.eq('⑤-3 둘 다 골라진 칸을 다시 누르면 둘 다 뺀다', J([v.cells, v.tags]), [['c2'], ['health', 'faith']]);
  const mx = { cells: ['c1', 'c2'], tags: ['health', 'family'] };
  sc.eq('⑤-3 표에 없는 것은 거르는 값에서 버린다', J(A.issState(mx, v)), { foldCell: false, foldTag: false, cells: ['c2'], tags: ['health'] });
  sc.eq('⑤-3 셀 축을 접으면 이슈로만 거른다', J(A.issState(mx, { ...v, foldCell: true }).cells), []);
  sc.eq('⑤-3 이슈 축을 접으면 셀로만 거른다', J(A.issState(mx, { ...v, foldTag: true })), { foldCell: false, foldTag: true, cells: ['c2'], tags: [] });
  sc.eq('⑤-3 전체를 누르면 고른 것을 지운다 (접기는 그대로)', J(A.issPick({ ...v, foldTag: true }, 'all|all')), { cells: [], tags: [], foldCell: false, foldTag: true });
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
  sc.eq('⑧ 표에 쓰는 동작(.insert · .update · .upsert · from(..).delete)이 없다', /\.(insert|upsert|update)\s*\(/.test(code.replace(/reg\.update\(/g, '')) || /from\([^)]*\)[^;]*\.delete\(/.test(code), false);
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

// ⑫ 사람 단위 — 출석 흐름 · 연락할 분 · 줄어드는 분 · 새 얼굴 (L8~L10)
{
  const rowsOf = (id, cell, pat, extra) => [...pat].map((ch, i) => ch === '.' ? null : Object.assign({ member_id: id, cellId: cell, week: W[i], status: ch === 'o' ? 'present' : 'absent' }, extra ? extra(i) : {})).filter(Boolean);
  const members = [{ id: 'm1', name: '김하나', cell_id: 'c1', member_type: 'member' }, { id: 'm2', name: '이두리', cell_id: 'c1', member_type: 'member' },
    { id: 'm3', name: '박세나', cell_id: 'c2', member_type: 'member', joined_at: W[5] }, { id: 'm4', name: '서하늘', cell_id: 'c2', member_type: 'visitor' }];
  const rows = [].concat(
    rowsOf('m1', 'c1', 'xxx.oooooooo'),             // 이번 주부터 3번 결석 (셀이 안 낸 주는 건너뜀)
    rowsOf('m2', 'c1', 'oxoxoooooooo'),             // 최근 4주 50% ← 이전 100%
    rowsOf('m3', 'c2', 'ooooooo.....'),             // 방문(들어온 주 전) → 셀원
    rowsOf('m4', 'c2', '......o.....', () => ({ visitor: true })));
  const P = A.buildPeople(rows, members);
  sc.eq('⑫ 사람마다 주별 출석', J([P.size, P.get('m1').wk.get(W[0]), P.get('m1').wk.has(W[3])]), [4, 'absent', false]);
  const s1 = A.personStats(P.get('m1'), W);
  sc.eq('⑫ 연속 결석은 기록 있는 주만 센다', s1.absentRun, 3);
  const s2 = A.personStats(P.get('m2'), W);
  sc.eq('⑫ 최근 4주 · 이전 8주 출석률', J([s2.recentRate, s2.prevRate]), [0.5, 1]);
  sc.eq('⑫ 들어온 날 전에 온 주는 방문으로 읽는다', J([...P.get('m3').visitorWeeks]), [W[6]]);
  const CL = A.careList(P, W, [{ member_id: 'm2', _cell: 'c1', categories: ['health'], leadership_attention_required: true, content: '수술' }], [{ cellId: 'c2', kind: 'contact', note: '심방 부탁' }]);
  sc.eq('⑫ 연락할 분: 확인 필요 + 건강이 3주 결석보다 앞', J(CL.map(x => x.id || x.cellId)), ['m2', 'm1', 'c2']);
  sc.eq('⑫ 이유 칩', J(CL[1].reasons.map(r => r.t)), ['3주 결석']);
  sc.eq('⑫ 셀리더 요청은 셀 단위로', J([CL[2].kind, CL[2].reasons[0].t]), ['cell', '셀리더 요청 · 연락 또는 상담']);
  sc.eq('⑫ 방문자는 결석으로 올리지 않는다', CL.some(x => x.id === 'm4'), false);
  sc.eq('⑫ 줄어드는 분: 많이 줄어든 순 (100→25%, 100→50%)', J(A.dropping(P, W).map(x => x.p.id)), ['m1', 'm2']);
  const NF = A.newFaces(P, W);
  sc.eq('⑫ 새 얼굴: 끊긴 분이 먼저 · 셀원 된 분', J(NF.map(x => [x.p.id, x.state])), [['m4', 'gone'], ['m3', 'joined']]);
}

// ⑬ 셀 건강 · 셀리더 신호 (L11)
{
  const R = (st, pres, extra) => Object.assign({ report_id: st === 's' ? 'r' : null, status: st === 's' ? 'submitted' : null, members_present: pres }, extra || {});
  const rows = [R('s', 2), R('-'), R('-'), R('s', 3), R('s', 5), R('s', 5), R('s', 6), R('s', 5)];
  const reps = [{ rep: { leader_message: 'advice', leader_message_note: '조언 부탁', meeting_held: false, meeting_cancel_reason: '출장', submitted_at: '2026-11-08T10:00:00+09:00', meeting_date: '2026-11-03' }, notes: [{ categories: ['long_absence'] }] },
    { rep: { leader_message: 'none', meeting_held: true, submitted_at: '2026-10-31T10:00:00+09:00', meeting_date: '2026-10-27' }, notes: [] }];
  const m8 = new Map(rows.map((r, i) => [W[i], r.report_id ? Object.assign({ members_absent: 1 }, r) : r]));
  const st = A.periodStats(m8, W.slice(0, 8), 8, true);
  const h = A.cellHealth(rows, reps, st);
  sc.eq('⑬ 8주 통계: 이번 주를 냈으니 8주 전부 센다 (미제출 2 · 쉼 0 · 모임 6)', J([st.n, st.mis, st.off, st.held]), [8, 2, 0, 6]);
  sc.eq('⑬ 신호등: 미제출 25%(2/8) → 주황 · 쉼 0 → 초록 · 요청 1번 → 주황', J([h.sub.lv, h.rest.lv, h.req.lv]), ['warn', 'ok', 'warn']);
  sc.eq('⑬ 제출 글', h.sub.text, '미제출 2/8주 25%');
  const sig = A.leaderSignals(rows, reps);
  sc.eq('⑬ 셀리더 신호: 연속 미제출 · 늦은 제출 · 모임 못 함 · 조언 요청', J(sig.map(x => x.t)), ['2주 연속 미제출', '모임 뒤 사흘 넘겨 제출 2번', '모임 못 함 1번', '조언 요청 1번']);
}

// ⑬-2 기간 통계 · 신호등 % 기준 (HB 11/6: 이번 주 탭 정렬과 같은 계산)
{
  const E = (pres, abs) => ({ report_id: 'r', status: 'submitted', members_present: pres, members_absent: abs });
  const OFF = { report_id: 'r', status: 'submitted', members_present: 0, members_absent: 0 };
  const MISS = { report_id: null, status: null };
  const mk = (list) => new Map(list.map((r, i) => [W[i], r]));
  // 이번 주 아직 안 냄(뺀다) · 3 출석 1 결석 · 안 냄 · 쉼
  const a = A.periodStats(mk([MISS, E(3, 1), MISS, OFF]), W.slice(0, 4), 3, true);
  sc.eq('⑬-2 이번 주 마감 전 미제출은 센 주에서 뺀다 (뒤 3주를 센다)', J([a.ex, a.n, a.held, a.mis, a.off]), [true, 3, 1, 1, 1]);
  sc.eq('⑬-2 출석 = 3 ÷ (4+4+4) · 쉼과 미제출은 결석', a.pct, 25);
  const ha = A.cellHealth([], [], a);
  sc.eq('⑬-2 출석 25% → 빨강 · 미제출 1/3 → 주황 · 쉼 1/3 → 주황', J([ha.att.lv, ha.sub.lv, ha.rest.lv]), ['bad', 'warn', 'warn']);
  const b = A.periodStats(mk([MISS, E(3, 1), MISS, OFF]), W.slice(0, 4), 3, false);
  sc.eq('⑬-2 지난 주를 보는 중이면 그 주 미제출도 결석으로 센다', J([b.ex, b.n, b.mis]), [false, 3, 2]);
  const good = A.periodStats(mk([E(4, 0), E(4, 0), E(4, 0), E(3, 1)]), W.slice(0, 4), 4, true);
  const hg = A.cellHealth([], [], good);
  sc.eq('⑬-2 잘 오는 셀: 출석 94% 초록 · 미제출 0 초록 · 쉼 0 초록', J([good.pct, hg.att.lv, hg.sub.lv, hg.rest.lv]), [94, 'ok', 'ok', 'ok']);
  const mid = A.periodStats(mk([E(3, 2), E(3, 2), E(3, 2), E(3, 2)]), W.slice(0, 4), 4, true);
  sc.eq('⑬-2 출석 60% → 주황', A.cellHealth([], [], mid).att.lv, 'warn');
  const none = A.periodStats(mk([MISS, MISS, MISS, MISS]), W.slice(0, 4), 4, true);
  sc.eq('⑬-2 모임이 한 번도 없으면 명단 수를 몰라도 출석 0% · 미제출 3/3 → 빨강', J([none.pct, none.n, A.cellHealth([], [], none).sub.lv]), [0, 3, 'bad']);
  const hn = A.cellHealth([MISS, MISS, MISS], [], none);
  sc.eq('⑬-2 계속 미제출이면 출석 · 제출은 빨강, 쉼 · 이슈 · 요청은 초록이 아니라 회색(알 수 없음)', J([hn.att.lv, hn.sub.lv, hn.rest.lv, hn.issue.lv, hn.req.lv]), ['bad', 'bad', 'na', 'na', 'na']);
  const fresh = A.periodStats(mk([E(3, 1)]), W.slice(0, 4), 4, true);
  const hf = A.cellHealth([], [], fresh);
  sc.eq('⑬-2 보고서가 1주뿐인 새 셀은 판단 보류(회색)', J([hf.att.lv, hf.sub.lv, hf.rest.lv]), ['na', 'na', 'na']);
}

// ⑬-3 신호 기준값 (HB 11/6: 설정에서 정한다)
{
  const E = (pres, abs) => ({ report_id: 'r', status: 'submitted', members_present: pres, members_absent: abs });
  const mk = (list) => new Map(list.map((r, i) => [W[i], r]));
  const st = A.periodStats(mk([E(3, 2), E(3, 2), E(3, 2), E(3, 2)]), W.slice(0, 4), 4, true);   // 출석 60%
  sc.eq('⑬-3 처음값: 출석 60% → 주황', A.cellHealth([], [], st).att.lv, 'warn');
  sc.eq('⑬-3 초록 경계를 60 으로 낮추면 → 초록', A.cellHealth([], [], st, { attOk: 60, attWarn: 30 }).att.lv, 'ok');
  sc.eq('⑬-3 주황 경계를 70 으로 올리면(초록 80) → 빨강', A.cellHealth([], [], st, { attOk: 80, attWarn: 70 }).att.lv, 'bad');
  const one = A.periodStats(mk([{ report_id: null }, E(4, 0), { report_id: null }, E(4, 0)]), W.slice(0, 4), 3, true);   // 미제출 1/3
  sc.eq('⑬-3 제출 빨강 경계 50 이면 33% 는 주황 · 30 이면 빨강', J([A.cellHealth([], [], one).sub.lv, A.cellHealth([], [], one, { ratioBad: 30 }).sub.lv]), ['warn', 'bad']);
  const two = A.periodStats(mk([E(3, 1), E(3, 1)]), W.slice(0, 2), 2, true);
  sc.eq('⑬-3 회색 경계: 2주 자료는 처음값에선 판단 · 3주 미만이면 보류', J([A.cellHealth([], [], two).att.lv, A.cellHealth([], [], two, { minN: 3 }).att.lv]), ['ok', 'na']);
  sc.eq('⑬-3 정리: 잘못된 값은 처음값 · 주황 ≥ 초록이면 둘 다 처음값', J([A.thrNorm({ attOk: 'abc', ratioBad: 500, minN: 0 }), A.thrNorm({ attOk: 50, attWarn: 60 }), A.thrNorm(null)]),
    [{ attOk: 75, attWarn: 40, ratioBad: 50, minN: 2 }, { attOk: 75, attWarn: 40, ratioBad: 50, minN: 2 }, { attOk: 75, attWarn: 40, ratioBad: 50, minN: 2 }]);
  sc.eq('⑬-3 메뉴에 신호 기준이 있고 기준은 이 기기(PREF)에만 둔다', /data-act="thr">신호 기준/.test(HTML) && !/cellbook[\s\S]{0,80}thr/.test(HTML), true);
}

// ⑭ 시작 전 주 · 모임 못 한 주 (HB 11/6 3차: 이흥배 셀 — 5주 다 냈는데 제출이 주황, 0명 막대)
{
  const S_ = (sub) => sub ? { report_id: 'r', status: 'submitted', members_present: 3, members_absent: 1 } : { report_id: null };
  const m = new Map([[W[0], S_(1)], [W[1], S_(1)], [W[2], S_(1)], [W[3], S_(0)], [W[4], S_(0)]]);
  sc.eq('⑭ 처음 낸 주보다 옛 주(셀은 있었지만 시작 전)는 뺀다', J([...A.trimBeforeStart(m, W).keys()]), [W[0], W[1], W[2]]);
  const never = new Map([[W[0], S_(0)], [W[1], S_(0)]]);
  sc.eq('⑭ 한 번도 안 낸 셀은 그대로 (진짜 미제출)', A.trimBeforeStart(never, W).size, 2);
  const off = { report_id: 'r', status: 'submitted', members_present: 0, members_absent: 0, visitors_present: 0 };
  sc.eq('⑭ 참석 0 · 결석 0 은 출석을 안 받은 주(쉼)', A.attTaken(off), false);
  const ser = A.attendanceSeries(new Map([[W[0], off]]), [W[0]]);
  sc.eq('⑭ 막대: 쉼으로 표시하고 평균에 넣지 않는다', J([ser[0].has, ser[0].off, A.attendanceSummary(ser).avg]), [false, true, null]);
  sc.eq('⑭ 셀 케어 시작(2026-10) 전 주는 보여 주지 않는다', /const CC_START = '2026-10-01'/.test(HTML) && /w >= CC_START/.test(HTML), true);
}

// ⑮ 명단 · 전화번호 (L15) — 연락처 파일 · 이름 맞추기 · 번호 모양
{
  sc.eq('⑮ 이름 다듬기: 괄호 · 직분 · 빈칸을 뗀다', J(['김하나 집사님(청년부)', '이 두리', '박세나 권사', '정다운형제'].map(A.normName)), ['김하나', '이두리', '박세나', '정다운']);
  sc.eq('⑮ 같음 1 · 품음 .8 · 한 글자 다름 .6 · 다름 0', J([A.nameScore('김하나', '김하나 집사'), A.nameScore('하나', '김하나'), A.nameScore('윤소망이', '윤소방이'), A.nameScore('김하나', '이두리')]), [1, 0.8, 0.6, 0]);
  sc.eq('⑮ 두 글자 이름은 한 글자 다름으로 맞추지 않는다', A.nameScore('한결', '한별'), 0);
  sc.eq('⑮ 번호 모양', J(['01012345678', '+82 10-1234-5678', '02 123 4567', '031-1234-5678'].map(A.fmtPhone)), ['010-1234-5678', '010-1234-5678', '02-123-4567', '031-1234-5678']);
  const vcf = ['BEGIN:VCARD', 'VERSION:3.0', 'N:김;하나;;;', 'FN:김하나 집사', 'TEL;type=CELL;type=VOICE;type=pref:010-1111-2222', 'item1.TEL:+82 10 1111 2222', 'END:VCARD',
    'BEGIN:VCARD', 'VERSION:3.0', 'FN:이두리', 'TEL;TYPE=CELL:010-3333-', ' 4444', 'END:VCARD',
    'BEGIN:VCARD', 'FN:번호없는분', 'END:VCARD',
    'BEGIN:VCARD', 'N:박;세나;;;', 'TEL:02-555-6666', 'END:VCARD'].join('\r\n');
  const C = A.parseVcf(vcf);
  sc.eq('⑮ vCard: FN(없으면 N) · 같은 번호 한 번 · 접힌 줄 펴기 · 번호 없는 분 버림', J(C.map(c => ({ name: c.name, tels: c.tels }))), [{ name: '김하나 집사', tels: ['010-1111-2222'] }, { name: '이두리', tels: ['010-3333-4444'] }, { name: '박세나', tels: ['02-555-6666'] }]);
  sc.eq('⑮ 셀원 이름에 맞는 후보 (점수 순)', J(A.matchContacts('김하나', C.concat([{ name: '김하나B', tels: ['010-9999-0000'] }])).map(x => [x.tel, x.score])), [['010-1111-2222', 1], ['010-9999-0000', 0.8]]);
  // HB 11/6: 연락처에 분명히 있는데 못 찾던 것
  const nfd = ['BEGIN:VCARD', 'FN:' + '김하나'.normalize('NFD'), 'TEL:010-1111-2222', 'END:VCARD'].join('\n');
  sc.eq('⑮ 맥 · 아이폰 파일의 풀어 쓴 한글(NFD)도 같은 이름', A.matchContacts('김하나', A.parseVcf(nfd)).length, 1);
  const qp = ['BEGIN:VCARD', 'VERSION:2.1', 'FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:=EA=B9=80=ED=95=98=EB=82=98', 'TEL;CELL:010-7777-8888', 'END:VCARD',
    'BEGIN:VCARD', 'VERSION:2.1', 'FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:=EC=9D=B4=EB=91=90=', '=EB=A6=AC', 'TEL;CELL:010-1212-3434', 'END:VCARD'].join('\r\n');
  sc.eq('⑮ 안드로이드 파일의 QUOTED-PRINTABLE 이름 (줄 잇기 포함)', J(A.parseVcf(qp).map(c => c.name)), ['김하나', '이두리']);
  const P2 = A.prepContacts(C);
  const auto = A.autoFill([{ id: 'a', name: '김하나' }, { id: 'b', name: '이두리' }, { id: 'c', name: '최기쁨' }], { b: { p: '010-0000-0000' } }, (m) => A.matchContacts(m.name, P2, 3));
  sc.eq('⑮ 후보 하나 · 번호 없음 → 바로 넣고 어느 연락처인지 남긴다 (이미 번호 있으면 그대로)', J(auto), { a: { p: '010-1111-2222', src: '김하나 집사' } });
  const P3 = A.prepContacts([{ name: '김하나B', tels: ['010-9999-0000'] }, { name: '김 하나', tels: ['010-1111-2222'] }, { name: '박세나1', tels: ['010-5555-1111'] }, { name: '박세나2', tels: ['010-5555-2222'] }]);
  const auto2 = A.autoFill([{ id: 'a', name: '김하나' }, { id: 's', name: '박세나' }], {}, (m) => A.matchContacts(m.name, P3, 3));
  sc.eq('⑮ 띄어쓰기만 다른 꼭 같은 이름이 있으면 먼저 넣는다 · 이름이 통째로 든 연락처(박세나1)도 넣고 표시 (나머지는 교체 후보)', J(auto2), { a: { p: '010-1111-2222', src: '김 하나' }, s: { p: '010-5555-1111', src: '박세나1', nick: true } });
  // HB 11/6: 성 칸 · 이름 칸이 바뀌어 저장된 연락처
  const sw = A.prepContacts(A.parseVcf(['BEGIN:VCARD', 'N:하나;김;;;', 'FN:하나 김', 'TEL:010-2020-3030', 'END:VCARD',
    'BEGIN:VCARD', 'FN:두리이', 'TEL:010-4040-5050', 'END:VCARD', 'BEGIN:VCARD', 'N:세나;박;;;', 'TEL:010-6060-7070', 'END:VCARD'].join('\n')));
  sc.eq('⑮ 성 · 이름이 바뀐 연락처를 찾고 표시한다 (띄운 것 · 붙은 것 · N 칸만 있는 것)', J(['김하나', '이두리', '박세나'].map(n => { const c = A.matchContacts(n, sw); return c[0] ? [c[0].tel, !!c[0].swapped] : null; })),
    [['010-2020-3030', true], ['010-4040-5050', true], ['010-6060-7070', true]]);
  const aw = A.autoFill([{ id: 'x', name: '김하나' }], {}, (m) => A.matchContacts(m.name, sw, 3));
  sc.eq('⑮ 바뀐 것도 꼭 같으면 바로 넣고 표시를 남긴다', J(aw), { x: { p: '010-2020-3030', src: '하나 김', swapped: true } });
  // HB 11/6: 별명 · 소속이 이름과 함께 저장된 연락처
  const nk = A.prepContacts([{ name: '하나엄마 김하나', tels: ['010-1000-2000'] }, { name: '청년부박세나', tels: ['010-3000-4000'] }, { name: '한결 형제 (찬양팀)', tels: ['010-5000-6000'] }, { name: '한결같은집', tels: ['010-7000-8000'] }]);
  const an = A.autoFill([{ id: 'h', name: '김하나' }, { id: 's', name: '박세나' }, { id: 'g', name: '한결' }], {}, (m) => A.matchContacts(m.name, nk, 3));
  sc.eq('⑮ 별명 · 소속과 함께 저장된 연락처도 바로 넣고 표시 (두 글자 이름은 따로 띄운 말일 때만)', J(Object.fromEntries(Object.entries(an).map(([k, v]) => [k, [v.p, !!v.nick]]))),
    { h: ['010-1000-2000', true], s: ['010-3000-4000', true], g: ['010-5000-6000', false] });
  sc.eq('⑮ 맞는 사람이 없으면 비움', A.matchContacts('최기쁨', C).length, 0);
  sc.eq('⑮ 번호는 cellbook/{uid} 에만 — users 는 심방 노트 설정(data/care) 읽기 하나뿐', /collection\('cellbook'\)/.test(HTML) && (HTML.match(/collection\('users'\)/g) || []).length === 1 && /collection\('users'\)\.doc\(FB\.user\.uid\)\.collection\('data'\)\.doc\('care'\)\.get\(\)/.test(HTML), true);
  sc.eq('⑮ 저장은 한 번에 몰아서 (번호마다 기다리지 않음)', /function setPhones\(changes\)/.test(HTML) && !/async function savePhone/.test(HTML), true);
  sc.eq('⑮ 연락처 파일 내용은 저장하지 않는다 (이 기기에도)', /lsSet\([^)]*contacts|localStorage\.setItem\([^)]*contacts/i.test(HTML), false);
}

// ⑯ J 심방 노트와 잇기 — 이름으로 맞추기 (지어낸 이름)
{
  const mem = [{ id: 'a', name: '강믿음' }, { id: 'b', name: '이두리' }, { id: 'c', name: '김하나' }, { id: 'd', name: '김하나' }, { id: 'e', name: '조은빛' }];
  const vis = [{ name: '강믿음', ymd: '2026-09-14', text: 'x' }, { name: '강믿음 집사', ymd: '2026-10-20', text: 'y' }, { name: '두리 이', ymd: '2026-11-01', text: 'z' },
    { name: '김하나', ymd: '2026-11-02' }, { name: '청년부조은빛', ymd: '2026-08-01' }, { name: '보관된분', ymd: '2020-01-01', archived: true }];
  const L = A.linkVisits(mem, vis, '2026-11-06');
  sc.eq('⑯ 같은 이름(직분 무시) · 성 이름 바뀜 · 이름이 통째로 든 것은 맞춘다', J(Object.keys(L).sort()), ['a', 'b', 'e']);
  sc.eq('⑯ 같은 이름 셀원이 둘이면 맞추지 않는다', !!(L.c || L.d), false);
  sc.eq('⑯ 마지막 심방 · 횟수 · 며칠 전 · 최근 순', J([L.a.last, L.a.n, L.a.days, L.a.recent.map(v => v.ymd)]), ['2026-10-20', 2, 17, ['2026-10-20', '2026-09-14']]);
  sc.eq('⑯ 심방 노트 읽기 규칙은 care-core 를 그대로 불러 쓴다 (따로 베끼지 않음)', /script id="care-core"/.test(HTML) && /return \{ buildModel, findResponsesTab, parseAttend: typeof parseAttend === \\'function\\' \? parseAttend : null, prayMarkIndex: typeof prayMarkIndex === \\'function\\' \? prayMarkIndex : null, prayJoin: typeof prayJoin === \\'function\\' \? prayJoin : null \}/.test(HTML), true);
  const CARE_HTML = fs.readFileSync(path.join(__dirname, '..', 'care', 'index.html'), 'utf8');
  const cm = CARE_HTML.match(/<script id="care-core">([\s\S]*?)<\/script>/);
  sc.eq('⑯ 심방 노트 care-core 에 셀 한눈에가 쓰는 두 함수가 있다 (이름이 바뀌면 여기서 걸린다)', !!cm && /function buildModel\(/.test(cm[1]) && /function findResponsesTab\(/.test(cm[1]), true);
  sc.eq('⑯ (1108-A3) 출석 · 기도노트 색 읽기도 care-core 것을 그대로 — 세 함수가 있다', ['parseAttend', 'prayMarkIndex', 'prayJoin'].every(f => new RegExp('function ' + f + '\\(').test(cm[1])), true);
  sc.eq('⑯ (1108-A3) 기도노트 · 출석은 읽기만 — pray 문서에 쓰는 곳이 없다', /collection\('pray'\)\.doc\(FB\.user\.uid\)/.test(HTML) && !/collection\('pray'\)[^;]*\.(set|update|delete)\(/.test(HTML), true);
  { const att = [{ name: '이두리 집사', ymd: '2026-11-08' }, { name: '이 두리', ymd: '2026-11-01' }, { name: '처음손님', ymd: '2026-11-08' }];
    const L2 = A.linkVisits([{ id: 'm1', name: '이두리' }], att, '2026-11-08');
    sc.eq('⑯ (1108-A3) 출석도 같은 이름 맞추기 — 직분 · 띄어쓰기 무시 · 셀원 아닌 이름은 붙지 않는다', J([L2.m1.n, L2.m1.last, Object.keys(L2)]), [2, '2026-11-08', ['m1']]); }
  // 1112-M 한 심방에 여러 분 — 심방 노트가 나눠 준 이름(v.names) 하나하나로 · 그 분 몫 글(v.notes)이 있으면 그것 · 셀 표시만 적은 기록은 안 붙음
  { const vm3 = [{ name: '가나다 셀, 강믿음, 이 두리', names: ['강믿음', '이 두리'], groups: ['가나다 셀'], ymd: '2026-11-10', text: '함께 이야기', notes: [{ name: '이두리', text: '이직 준비' }] },
      { name: '가나다 셀', names: [], groups: ['가나다 셀'], ymd: '2026-11-11', text: '셀 모임' }, { name: '강믿음, 강 믿음', names: ['강믿음', '강 믿음'], ymd: '2026-11-01', text: '같은 분 두 번' }];
    const L3 = A.linkVisits([{ id: 'a', name: '강믿음' }, { id: 'b', name: '이두리' }, { id: 'g', name: '가나다' }], vm3, '2026-11-12');
    sc.eq('⑯ (1112-M) 여러 분 기록은 한 분씩 · 그 분 몫 글 먼저 · 셀 표시만 있는 기록은 셀리더에게도 안 붙음 · 한 기록에 같은 분 두 번이면 한 번',
      J([L3.a.n, L3.a.recent[0].text, L3.b.n, L3.b.recent[0].text, !!L3.g]), [2, '함께 이야기', 1, '이직 준비', false]); }
}

// ⑰ 11/7 HB 실기기: 앱을 바꿨다 돌아오면 판이 밀려 있던 것 · 심방 기록 늦게 오면 열린 사람 화면이 비던 것 · 셀리더도 심방과 맞춘다
{
  sc.eq('⑰ 끌다 앱이 바뀌면(touchcancel · pageshow · visibilitychange) 끌던 흔적을 걷는다', /document\.addEventListener\('touchcancel'/.test(HTML) && /addEventListener\('pageshow', unstick\)/.test(HTML) && /function unstick\(\)/.test(HTML), true);
  sc.eq('⑰ 심방 기록을 다 받으면 열려 있는 사람 화면도 다시 그린다', /S\.pview && pv && !pv\.hidden\) \{ const top = pv\.scrollTop; pv\.innerHTML = personHtml\(\)/.test(HTML), true);
  sc.eq('⑰ 연결이 안 되면 사람 화면에 이유를 보여 준다(말없이 숨기지 않음)', /nosheet: '심방 노트에서 아직 시트를 고르지 않았습니다\.', nogoogle:[^}]*err: CARE\.err \}\[CARE\.state\]/.test(HTML), true);
  const lead = [{ id: 'L1:0', name: '송재혁' }, { id: 'L2:0', name: '안성일' }];
  const LL = A.linkVisits(lead, [{ name: '안성일 셀리더', ymd: '2026-11-07' }, { name: '송재혁', ymd: '2026-10-01' }], '2026-11-07');
  sc.eq('⑰ 셀리더(이름 글자만 있음)도 같은 규칙으로 맞춘다', J([LL['L1:0'].days, LL['L2:0'].days]), [37, 0]);
  sc.eq('⑰ 셀리더 알약 색: 없음 빨강 · 30일 넘음 주황 · 14일 넘음 노랑 · 이내 초록', J([null, 30, 45, 14, 29, 13, 0].map(d => A.leaderLevel(d))), ['bad', 'warn', 'warn', 'yel', 'yel', 'ok', 'ok']);
  sc.eq('⑰ 셀 카드의 셀리더 줄에 심방 알약을 붙인다', /careLeaderChip\(c\)\}\$\{sig\.map/.test(HTML), true);
}

// ⑱ L17 AI 요약 — 바깥으로 보내기 전에 이름 가리기 · 돌아오면 되돌리기 · 이 기기에만 (지어낸 이름)
{
  const names = ['강믿음', '이두리', '조은빛', '박하'];
  const r = A.anonText('강믿음 성도는 이직 고민. 두리 자매가 함께 기도하기로. 강 믿음 집사님 가정도 평안. 은빛이가 결석. 은빛 하늘은 맑음. 박하 차를 마심', names);
  sc.eq('⑱ 성 이름 · 띄어 쓴 이름 · 이름만(뒤에 자매 · 이가) 을 셀원 A, B … 로 바꾼다', r.text, '셀원 A 성도는 이직 고민. 셀원 B 자매가 함께 기도하기로. 셀원 A 집사님 가정도 평안. 셀원 C이가 결석. 은빛 하늘은 맑음. 셀원 D 차를 마심');
  sc.eq('⑱ 표는 처음 나온 순서', J(r.map), { A: '강믿음', B: '이두리', C: '조은빛', D: '박하' });
  sc.eq('⑱ 보낸 글에 원래 이름이 남지 않는다', ['강믿음', '이두리', '조은빛'].some(n => r.text.includes(n)), false);
  sc.eq('⑱ 돌아온 요약은 이름으로 되돌린다 (모르는 표는 그대로)', A.deanon('· 셀원 A 이직 기도 · 셀원 B 동행 · 셀원 Z', r.map), '· 강믿음 이직 기도 · 이두리 동행 · 셀원 Z');
  sc.eq('⑱ 이름이 없으면 글 그대로', A.anonText('평안한 한 주', []).text, '평안한 한 주');
  sc.eq('⑱ 요약 열쇠: 빈칸 차이는 같은 글 · 글이 다르면 다른 열쇠', [A.textKey('가 나  다') === A.textKey(' 가 나 다 '), A.textKey('가나다') === A.textKey('가나라')], [true, false]);
  sc.eq('⑱ 요청 글: 이름표를 그대로 쓰라고 한다', /"셀원 A" 는 이 글의 주인공이니 이름 없이 생략/.test(A.aiPrompt('x')) && /다른 사람\("셀원 B" 같은 표기\)은 바꾸지 말고/.test(A.aiPrompt('x')), true);
  const st = {}; for (let i = 0; i < 5; i++) st['k' + i] = { s: 'x', at: i };
  sc.eq('⑱ 저장한 요약은 상한까지만(오래된 것부터 버림)', Object.keys(A.aiTrim(st, 3)).sort(), ['k2', 'k3', 'k4']);
  sc.eq('⑱ 저장 이름이 다른 앱과 겹치지 않는다', [A.AI_KEY, A.AI_STORE].every(k => /^cell_/.test(k)), true);
  // 빠르게 (HB 11/7)
  sc.eq('⑱ 가벼운(생각 없는) 모델부터 · 된 모델은 맨 앞으로', J([A.AI_MODELS[0], A.aiModelOrder('gemini-2.5-flash')[0], A.aiModelOrder('엉뚱')[0], A.aiModelOrder('gemini-2.5-flash').length]), ['gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest', 4]);
  const sse = A.sseTexts('data: {"candidates":[{"content":{"parts":[{"text":"· 가"}]}}]}\n\ndata: {"candidates":[{"content":{"parts":[{"thought":true,"text":"생각"},{"text":"나"}]}}]}\ndata: {"cand');
  sc.eq('⑱ 흘려 받기: 줄마다 글만 · 생각 글은 뺌 · 덜 온 줄은 남김', J([sse.texts, sse.rest]), [['· 가', '나'], 'data: {"cand']);
  sc.eq('⑱ 흘려 받는 주소 · 답 길이 상한', /:streamGenerateContent\?alt=sse/.test(HTML) && /maxOutputTokens: 600/.test(HTML), true);
  // 계정 맞추기 (HB 11/7)
  const loc = { a: { s: '이 기기 것', at: 1 }, b: { s: '둘 다', at: 2 } }, cl = { key: 'K1', sum: { b: { s: '둘 다', at: 2 }, c: { s: '다른 기기 것', at: 3 } } };
  const first = A.aiSync(loc, cl, false, 'K0');
  sc.eq('⑱ 처음 맞출 때: 합치고, 이 기기에만 있던 요약만 올린다 · 열쇠는 계정 것', J([Object.keys(first.store).sort(), Object.keys(first.push.sum), first.push.key, first.key]), [['a', 'b', 'c'], ['a'], undefined, 'K1']);
  sc.eq('⑱ 계정에 열쇠가 없으면 이 기기 열쇠를 올린다', A.aiSync({}, null, false, 'K0').push, { key: 'K0' });
  const later = A.aiSync(loc, { sum: { c: { s: 'x', at: 3 } } }, true, 'K0');
  sc.eq('⑱ 한 번 맞춘 뒤엔 계정이 기준 (다른 기기에서 지운 요약 · 열쇠는 따라 지운다, 되살려 올리지 않음)', J([Object.keys(later.store), later.key, later.push]), [['c'], '', null]);
  sc.eq('⑱ 계정 칸은 cellbook 의 ai 하나 — users/{uid} 에는 두지 않는다', /collection\('cellbook'\)\.doc\(FB\.user\.uid\)\.set\(\{ ai: patch/.test(HTML) && !/collection\('users'\)[^\n]*\bai\b/.test(HTML), true);
  sc.eq('⑱ 접힌 긴 글마다 별 단추(더보기 옆)', /'<button class="morebtn" data-act="more" aria-label="더 보기"><i><\/i><\/button>' \+ aiBtn\(k\)/.test(HTML), true);
  sc.eq('⑱ 요약 길이: 한 · 두 · 세 문장을 요청 글에 담는다', [1, 2, 3, undefined].map(n => /(한|두|세) 문장으로 요약/.exec(A.aiPrompt('x', n))[1]), ['한', '두', '세', '두']);
  sc.eq('⑱ 설정창 이름 · 처음값 두 문장 · 별 누르면 펼침', /한 문장으로|\$\{AI_LENS\[n\]\}으로/.test(HTML) && /\? n : 2/.test(HTML) && /AI\.opened\.add\(el\)/.test(HTML), true);
  sc.eq('⑱ 앱 이름 셀 inside', /<title>셀 inside<\/title>/.test(HTML), true);
  // HB 11/8: PC 에서 만든 요약 · 열쇠가 폰에 없었다 — 셀 케어 로그인과 계정 로그인이 따로라, 계정에 로그인 안 한 기기는 조용히 이 기기에만 남겼다
  sc.eq('⑱ 계정에 못 올리면 조용히 넘기지 않는다 (catch 가 비어 있지 않음 · 토스트)', !/\{ ai: patch, at: Date\.now\(\) \}, \{ merge: true \}\)\.catch\(\(\) => \{\}\)/.test(HTML) && /AI 요약을 계정에 올리지 못했습니다/.test(HTML), true);
  sc.eq('⑱ AI 설정창이 계정 상태를 보여 준다 (이메일 · 계정에 있는 열쇠 · 요약 · 핵심 수 · 로그인 단추)', /<span id="aiacct">\$\{aiAcctHtml\(\)\}<\/span>/.test(HTML) && /data-act="ai-login"/.test(HTML) && /case 'ai-login': closeThr\(\); return openBook\(null\);/.test(HTML) && /AI\.cloud = \{ key: !!\(ai && ai\.key\)/.test(HTML), true);
  // 1109-K1 (HB 11/9: PC 와 폰에서 같은 글의 요약이 따로 만들어져 달랐다)
  const body = '모친과의 관계 회복을 시도하는 한편\n두려움이 다시 올라왔습니다.';
  sc.eq('⑱ K1 이름표는 표시를 뗀 본문 — 기도 알약 · 🙏 · 이번 주: 가 달라도 같은 이름표', new Set([A.aiBodyKey(body, ''), A.aiBodyKey('🙏 ' + body, '🙏 '), A.aiBodyKey('이번 주: ' + body, '이번 주: '), A.aiBodyKey('  ' + body.replace('\n', '  '), '')]).size, 1);
  sc.eq('⑱ K1 다른 글은 다른 이름표', A.aiBodyKey(body, '') !== A.aiBodyKey(body + '!', ''), true);
  sc.eq('⑱ K1 NFD(맥에서 온 글자)도 같은 이름표', A.aiBodyKey(body.normalize('NFD'), ''), A.aiBodyKey(body, ''));
  const old = { o: { s: '옛 두 문장', at: 1 }, 'o#3': { s: '옛 세 문장', at: 1 }, 'n#1': { s: '새 한 문장', at: 2 } };
  sc.eq('⑱ K1 옛 이름표 것을 새 이름표로 옮김 (길이 꼬리까지 · 새 쪽에 있으면 안 덮음)', J(A.aiAlias(old, 'o', 'n')), { n: { s: '옛 두 문장', at: 1 }, 'n#3': { s: '옛 세 문장', at: 1 } });
  sc.eq('⑱ K1 이름표가 같으면 옮길 것 없음', A.aiAlias(old, 'o', 'o'), {});
  sc.eq('⑱ K1 별을 누르면 계정 내용이 올 때까지 기다린 뒤 없을 때만 AI 를 부른다', /if \(!aiGet\(k\) && !DEMO\) \{ btn\.classList\.add\('busy'\); try \{ await aiReady\(\); \}/.test(HTML) && /AI\.loaded = true;/.test(HTML), true);
  sc.eq('⑱ K1 다른 기기에서 온 요약을 지금 화면에 입힌다', /aiRefreshShown\(\); aiAcctUi\(\);/.test(HTML) && /if \(s && s !== el\.dataset\.aiv\) aiShow\(el, b, s, true\)/.test(HTML), true);
  sc.eq('⑱ K1 로그인 안 한 기기에서 만들면 한 번 알린다', /aiCloud\(\{ sum: patch \}\); aiLocalNote\(\);/.test(HTML) && /aiCloud\(\{ kw: patch \}\); aiLocalNote\(\);/.test(HTML), true);
  sc.eq('⑱ K3 보내기 뜻 아이콘은 단추가 아니다(span · aria-hidden) · 주인공 있는 글에만', /<span class="sendico" aria-hidden="true"/.test(HTML) && /\(DEMO && subjOf\(el\) \? sendRowHtml\(\) : ''\)/.test(HTML), true);
  sc.eq('⑱ K3 화면 폭이 바뀌어 다시 접을 때 보내기 줄도 함께 걷는다 (겹쳐 쌓이지 않게)', /r\.classList\.contains\('sendrow'\)\) r\.remove\(\)/.test(HTML), true);
  sc.eq('⑱ 보내기 전에 anonText 를 거친다', /const \{ text: anon, map \} = anonText\(text, aiNames\(\), subject\)/.test(HTML) && /parts: \[\{ text: aiPrompt\(anon, aiLen\(\)\) \}\]/.test(HTML), true);
}

// ⑳ 1107-2 셀 inside C1 · C2 — 여러 글 한 번에 (지어낸 글)
{
  const L = Array.from({ length: 23 }, (_, i) => ({ text: '가'.repeat(i === 5 ? 6000 : 100) }));
  sc.eq('⑳ 묶음: 10개씩 · 글자가 너무 많으면 일찍 끊는다', A.aiChunks(L, A.AI_CHUNK, 6000).map(c => c.length), [5, 1, 10, 7]);
  const pk = A.aiBatchPrompt(['셀원 A 이직 고민', '기도 부탁'], 'kw', 2), ps = A.aiBatchPrompt(['x'], 'sum', 1);
  sc.eq('⑳ 핵심 요청: 명사형 · 번호 · JSON 배열 · 이름표 그대로', [/명사형 핵심어/.test(pk), /\[1\]\n셀원 A 이직 고민/.test(pk), /\[2\]\n기도 부탁/.test(pk), /문자열 2개가 든 JSON 배열/.test(pk), /"셀원 A" 는 그 글의 주인공이니 이름 없이 생략/.test(pk)], [true, true, true, true, true]);
  sc.eq('⑳ 요약 요청은 설정한 길이를 따른다', /한 문장으로 요약/.test(ps), true);
  sc.eq('⑳ 답 꺼내기: ```json 감싸기 · 앞말 · 개수 넘침 · 깨진 답', [J(A.aiParseArr('```json\n["가 · 나", "다"]\n```', 2)), J(A.aiParseArr('여기 있습니다: ["a","b","c"]', 2)), A.aiParseArr('엉망', 2)], [['가 · 나', '다'], ['a', 'b'], null]);
  sc.eq('⑳ 탭 아래 오른쪽 별 둘(모두 요약 · 핵심 보기)', /data-act="ai-all"/.test(HTML) && /data-act="ai-kw"/.test(HTML) && /id="aibar"/.test(HTML), true);
  sc.eq('⑳ 묶어 보낼 때도 anonText 를 거친다', /const a = anonText\(x\.text, names, sj\)/.test(HTML) && /aiBatchPrompt\(an\.map\(a => a\.text\)/.test(HTML), true);
  sc.eq('⑳ 한꺼번에 요약 · 핵심 만들기 전에 확인을 받는다', /confirm\(`이 화면의 접힌 글 \$\{miss\.length\}개를 AI 로 요약할까요/.test(HTML) && /confirm\(`이 화면의 본문 \$\{miss\.length\}개를 AI 로 핵심만/.test(HTML), true);
  sc.eq('⑳ 핵심도 계정 ai 칸(kw)에 · 이 기기 이름 cell_', /aiCloud\(\{ kw: patch \}\)/.test(HTML) && /const AI_KW = 'cell_ai_kw'/.test(HTML), true);
}

// ㉑ HB 11/7 셀 inside 다듬기 — 주인공 생략 · 기도 표시 남김 · 탭마다 따로 · 기도 접기 (지어낸 이름)
{
  const r = A.anonText('이두리 성도와 강믿음 집사가 함께 기도', ['강믿음', '이두리'], '강믿음');
  sc.eq('㉑ 글의 주인공은 늘 셀원 A · 다른 성도는 B 부터', [r.text, J(r.map)], ['셀원 B 성도와 셀원 A 집사가 함께 기도', { A: '강믿음', B: '이두리' }]);
  sc.eq('㉑ 돌아온 요약에서 주인공(셀원 A)은 생략 · 다른 성도는 이름으로', A.deanon('· 셀원 A는 셀원 B 성도와 기도함\n· 셀원 A 집사님이 이직 고민', r.map, true), '· 이두리 성도와 기도함\n· 이직 고민');
  sc.eq('㉑ 주인공을 모르면(셀 전체 카드) 생략하지 않는다', A.deanon('· 셀원 A 기도', { A: '강믿음' }, false), '· 강믿음 기도');
  sc.eq('㉑ 주인공이 글에 없어도 A 자리는 주인공 몫', J(A.anonText('이두리 소식', ['이두리'], '강믿음').map), { A: '강믿음', B: '이두리' });
  sc.eq('㉑ 요약 · 핵심으로 바꿔도 글 앞 표시(🙏 · 이번 주:)를 남긴다', /function markOf\(el\)/.test(HTML) && /el\.innerHTML = `\$\{markHtml\(el\)\}\$\{NOLBL_TABS/.test(HTML), true);
  sc.eq('㉑ 이슈 · 기도제목 · 코멘트 탭은 줄마다 핵심 알약을 달지 않는다', /const NOLBL_TABS = \['issue', 'prayer', 'comment'\]/.test(HTML), true);
  sc.eq('㉑ 모두 요약 · 핵심 보기는 탭마다 따로 (한 탭에서 켜도 다른 탭 단추는 꺼진 모양)', /const kwOn = \(\) => !!\(PREF\.aiKwT && PREF\.aiKwT\[PREF\.tab\]\)/.test(HTML) && !/PREF\.aiKw\b(?!T)/.test(HTML) && !/PREF\.aiAll\b(?!T)/.test(HTML), true);
  sc.eq('㉑ 이슈 탭: 별 아래 기도 보기 / 접기 (모드와 상관없이)', /data-act="pray-tg">\$\{pr \? '기도 접기' : '기도 보기'\}/.test(HTML) && /\.hidepray \.pray,/.test(HTML), true);
}

sc.eq('㉒ 기도 표시는 작은 \'기도\' 알약 (HB 11/7 시안 B · 🙏 없음)', !/pray clamp">🙏/.test(HTML) && (HTML.match(/<div class="pray clamp"><span class="praytag">기도<\/span>/g) || []).length === 3, true);

// ⑲ 파일 전체 문법 — 화면 쪽 스크립트에 문법 오류가 나면 앱이 통째로 안 뜬다 (11/7 고치다 한 번 걸림)
{
  const bad = []; const re = /<script(?: id="[^"]+")?>([\s\S]*?)<\/script>/g; let mm;
  while ((mm = re.exec(HTML))) { try { new Function(mm[1]); } catch (e) { bad.push(e.message); } }
  sc.eq('⑲ 모든 스크립트 덩어리가 문법상 읽힌다', bad, []);
}

// ⑩ 집 주소 · 버전
sc.eq('⑩ block7.my 로 열리면 sweeter.my/cell/ 로 넘긴다', HTML.includes("location.replace('https://sweeter.my/cell/'"), true);
sc.eq('⑩ 2번째 줄 버전 주석 = APP_VERSION', HTML.split('\n')[1].includes(A.APP_VERSION), true);
// ⑪ 홈 화면 앱 (HB 11/6) · 아이폰 확대 넘침
{
  const man = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cell', 'manifest.json'), 'utf8'));
  sc.eq('⑪ 홈 화면에서 따로 열린다 (standalone · /cell/ 안에서만)', [man.display, man.start_url, man.scope], ['standalone', '/cell/', '/cell/']);
  sc.eq('⑪ 아이콘 파일이 있다', ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'].every(f => fs.existsSync(path.join(__dirname, '..', 'cell', f))), true);
  sc.eq('⑪ 페이지가 manifest · 아이폰 아이콘을 건다', HTML.includes('rel="manifest" href="manifest.json"') && HTML.includes('rel="apple-touch-icon"'), true);
  sc.eq('⑪ 입력칸 글자 16px (작으면 아이폰이 확대해 옆으로 넘친다)', /input\[type=email\],input\[type=text\],input\[type=password\]\{[^}]*font-size:16px/.test(HTML), true);
}
sc.eq('⑩ 검색에 안 잡히게 (noindex)', /name="robots" content="noindex/.test(HTML), true);

// pool — 동시에 n 개까지, 실패해도 나머지는 받는다
(async () => {
  let live = 0, peak = 0;
  const out = await A.pool([1, 2, 3, 4, 5, 6, 7], 3, async (x) => { live++; peak = Math.max(peak, live); await new Promise(r => setTimeout(r, 5)); live--; if (x === 4) throw new Error('x'); return x * 2; });
  sc.eq('pool: 동시에 3개까지', peak, 3);
  sc.eq('pool: 실패한 것만 표시, 나머지는 받는다', J(out.map(o => o && o.__err ? 'err' : o)), [2, 4, 6, 'err', 10, 12, 14]);
  sc.done();
})();
