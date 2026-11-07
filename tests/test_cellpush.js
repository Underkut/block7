// 셀 inside 새 코멘트 알림 서버(wallet-functions/src/cellpush-core.js · cellpush.js) — 지어낸 이름만 (공개 저장소)
//
// 지키는 것:
//   ① 셀 케어에 **읽기만** — 부르는 함수는 세 개(get_my_context · get_week_status · senior_comment_list)와 담당 표 읽기뿐
//   ② '내 담당 셀' · '냈는가' 판정이 셀 inside 앱(cell-core)과 같다 (같은 자료로 나란히 돌린다)
//   ③ 처음 켤 때 이미 있는 코멘트는 알리지 않는다 · 그 뒤 처음 보는 것만 · 본 목록은 상한까지
//   ④ 알림에는 누가 · 어느 셀만 — **코멘트 내용을 싣지 않는다**
//   ⑤ 10분에 한 번 · 이번 주와 지난주 (서울 날짜 기준 월요일)
//   ⑥ 맡긴 열쇠는 cellpush/{uid} 에만 · 받자마자 새 열쇠로 바꿔 적는다 · 끊기면 끄고 알린다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const C = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'cellpush-core.js'));
const SRV = fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'cellpush.js'), 'utf8');
const CORE = fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'cellpush-core.js'), 'utf8');
const APP = fs.readFileSync(path.join(__dirname, '..', 'cell', 'index.html'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

console.log('\n① 읽기만');
{
  const code = SRV + CORE;
  sc.eq('① 쓰는 요청(PATCH · DELETE · PUT)을 셀 케어로 보내지 않는다', /method:\s*"(PATCH|DELETE|PUT)"/.test(CORE), false);
  sc.eq('① 부르는 함수는 읽기 셋뿐', J(C.READ_RPCS), ['get_my_context', 'get_week_status', 'senior_comment_list']);
  let threw = false; try { C.rpcReq('save_report', {}, 'x'); } catch (e) { threw = true; }
  sc.eq('① 목록에 없는 함수를 부르려 하면 멈춘다', threw, true);
  sc.eq('① 서버 코드가 부르는 함수 이름이 모두 읽기 목록 안', [...code.matchAll(/rpcReq\("([a-z_]+)"/g)].map(m => m[1]).every(n => C.READ_RPCS.includes(n)), true);
  sc.eq('① 앱과 같은 셀 케어 주소 · 공개 키', APP.includes(C.CC_URL) && APP.includes(C.CC_KEY), true);
}

console.log('\n② 앱과 같은 판정');
{
  const m = APP.match(/<script id="cell-core">([\s\S]*?)<\/script>/);
  const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date }; vm.createContext(ctx);
  vm.runInContext(m[1] + '\nthis.A = { pickMine, isSubmitted };', ctx);
  const rows = [
    { cell_id: 'c1', i_am_leader: true }, { cell_id: 'c2', review_mode: 'leadership', i_can_review: true },
    { cell_id: 'c3', review_mode: 'senior_direct' }, { cell_id: 'c4', review_mode: 'leadership', responsible_leadership_id: 'me' },
    { cell_id: 'c5', review_mode: 'leadership' }, { cell_id: 'c6', review_mode: 'leadership' },
  ];
  const asg = [{ cell_id: 'c5', start_date: '2026-01-01', end_date: null }, { cell_id: 'c6', start_date: '2025-01-01', end_date: '2025-12-31' }];
  sc.eq('② 내 담당 셀 = 앱 판정', J(C.pickMine(rows, asg, 'me', '2026-11-07')), J(ctx.A.pickMine(rows, asg, 'me', '2026-11-07')));
  const st = [null, {}, { report_id: 'r', status: 'submitted' }, { report_id: 'r', status: 'revision_requested' }, { report_id: 'r', status: 'draft', submission_no: 1 }, { report_id: 'r', status: 'draft' }];
  sc.eq('② 냈는가 = 앱 판정', st.map(C.isSubmitted), st.map(ctx.A.isSubmitted));
  const w1 = [{ cell_id: 'c1', i_am_leader: true, report_id: 'a', status: 'submitted', cell_name: '샘플 1셀' }, { cell_id: 'c3', review_mode: 'senior_direct', report_id: 'x', status: 'submitted' }, { cell_id: 'c1', i_am_leader: true }];
  const w0 = [{ cell_id: 'c1', report_id: 'b', status: 'draft', cell_name: '샘플 1셀' }, { cell_id: 'c1', report_id: 'a', status: 'submitted', cell_name: '샘플 1셀' }];
  sc.eq('② 물어볼 보고서: 담당 셀 · 낸 것 · 두 주 · 겹치면 한 번', J(C.reportsToCheck([w1, w0], [], 'me', '2026-11-07')), [{ id: 'a', cell: '샘플 1셀' }]);
  sc.eq('② 담당이 하나도 안 걸리면 볼 수 있는 셀 전체', C.reportsToCheck([[{ cell_id: 'z', review_mode: 'senior_direct', report_id: 'q', status: 'submitted' }]], [], 'me', '2026-11-07').length, 1);
}

console.log('\n③ 처음 보는 코멘트만');
{
  const L = [{ id: 1 }, { id: 2 }];
  const a = C.diffComments(null, L);
  sc.eq('③ 처음 켤 때는 알리지 않고 지금 것을 본 것으로', J([a.fresh, a.seen]), [[], ['1', '2']]);
  const b = C.diffComments(a.seen, [{ id: 1 }, { id: 2 }, { id: 3 }]);
  sc.eq('③ 그 뒤엔 처음 보는 것만', J([b.fresh.map(x => x.id), b.seen]), [[3], ['1', '2', '3']]);
  const many = Array.from({ length: 900 }, (_, i) => String(i));
  sc.eq('③ 본 목록은 상한까지 (최근 것을 남김)', (() => { const r = C.diffComments(many, [{ id: 'new' }]); return [r.seen.length, r.seen[r.seen.length - 1]]; })(), [C.SEEN_CAP, 'new']);
}

console.log('\n④ 알림 글');
{
  const one = C.messageOf([{ id: 1, author_name: '담임 목사님', content: '비밀 내용 수술 소식', _cell: '샘플 1셀' }]);
  sc.eq('④ 한 건: 제목 = 셀 · 본문 = 누가', [one.title, one.body], ['새 코멘트 · 샘플 1셀', '담임 목사님 코멘트가 달렸습니다']);
  sc.eq('④ 코멘트 내용은 싣지 않는다', JSON.stringify(one).includes('비밀'), false);
  const many = C.messageOf([{ id: 1, author_name: '담임 목사님', _cell: '샘플 1셀' }, { id: 2, author_name: '사모님', _cell: '샘플 2셀' }]);
  sc.eq('④ 여러 건: 건수 · 셀들 · 누가', [many.title, many.body], ['새 코멘트 2건', '샘플 1셀 · 샘플 2셀 — 담임 목사님 · 사모님']);
  sc.eq('④ 없으면 보내지 않는다', C.messageOf([]), null);
  sc.eq('④ 누르면 셀 inside 코멘트 탭', one.link, 'https://sweeter.my/cell/?tab=comment');
}

console.log('\n⑤ 언제 · 어느 주');
{
  const t = Date.parse('2026-11-08T23:30:00+09:00');   // 일요일 밤 (서울)
  sc.eq('⑤ 서울 날짜 기준 이번 주(월) · 지난주', C.weeksToCheck(t), ['2026-11-02', '2026-10-26']);
  sc.eq('⑤ 월요일 0시 넘으면 새 주', C.weeksToCheck(Date.parse('2026-11-09T00:10:00+09:00'))[0], '2026-11-09');
  sc.eq('⑤ 10분에 한 번', [0, 1, 9, 10].map(m => C.due(Date.parse('2026-11-07T00:00:00Z') + m * 60000)), [true, false, false, true]);
}

console.log('\n⑥ 열쇠 다루기');
{
  sc.eq('⑥ 열쇠는 cellpush/{uid} 에만', /db\(\)\.doc\(`cellpush\/\$\{uid\}`\)/.test(SRV), true);
  sc.eq('⑥ 들어갈 때마다 새 열쇠로 바꿔 적는다 (수파베이스 돌려쓰기)', /await keyRef\(uid\)\.set\(\{ rt: j\.refresh_token/.test(SRV), true);
  sc.eq('⑥ 끊기면 끄고 열쇠를 지우고 한 번 알린다', /on: false, rt: FieldValue\.delete\(\)/.test(SRV) && /셀 inside 알림이 꺼졌습니다/.test(SRV), true);
  sc.eq('⑥ 1분 틱(studyTick)에 얹는다 · 묶음에 내보낸다', /require\("\.\/cellpush"\)\.cellDue\(\)/.test(fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'study.js'), 'utf8')) && /exports\.cellpush = require\("\.\/cellpush"\)\.cellpush/.test(fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'index.js'), 'utf8')), true);
  sc.eq('⑥ 앱은 서버 몫 로그인을 따로 만든다 (앱 열쇠를 넘기지 않음)', /persistSession: false/.test(APP) && /pushFn\('\/link', \{ rt \}\)/.test(APP), true);
  sc.eq('⑥ 앱 로그아웃은 이 기기만 (전체 로그아웃이면 서버 몫도 끊긴다)', /sb\.auth\.signOut\(\{ scope: 'local' \}\)/.test(APP), true);
}
sc.done();
