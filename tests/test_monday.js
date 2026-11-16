// 교역자 로테이션 R12 C — Monday 광고 읽기 서버(gcal-functions/src/monday-core.js · monday.js) — 지어낸 이름 · 제목만 (공개 저장소)
//
// 지키는 것:
//   ① **읽기만** — 보내는 질문은 QUERIES 셋(모두 query)뿐 · 쓰기 질문이 코드에 없다 · 목록 밖 이름은 멈춘다
//   ② 부산 주보: 그 주일 그룹('YY-MMDD')의 '구두 광고' 숫자 아이템 **제목만**, 숫자 순 · '영상 사용' · '확인 필요' 는 따로 · 나머지는 뺌
//   ③ 영상 소식: 방영일 = 그 주일 · 유튜브 주소 · 업데이트 + 답글 묶음 중 '부산' 이 하나라도 든 묶음째, 최근 것부터(상한) · Monday 주소 · 리포터는 있다 · 없다만(이름 X)
//   ④ 보드 · 열이 바뀌면 짐작하지 않고 알린다
//   ⑤ 서버: 로그인 필수 · 광고는 주인 본인이나 rota/{주인}.team 의 확인된 이메일만 · 주인의 열쇠로 · 결과를 저장하지 않는다
//   ⑥ 열쇠는 mondayKeys/{uid} 에만 · Monday 에 맞는지 물어본 뒤에만 맡긴다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const DIR = path.join(__dirname, '..', 'gcal-functions', 'src');
const C = require(path.join(DIR, 'monday-core.js'));
const SRV = fs.readFileSync(path.join(DIR, 'monday.js'), 'utf8');
const CORE = fs.readFileSync(path.join(DIR, 'monday-core.js'), 'utf8');
const IDX = fs.readFileSync(path.join(DIR, 'index.js'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

console.log('\n① 읽기만');
{
  sc.eq('① 질문은 셋뿐', Object.keys(C.QUERIES).sort(), ['me', 'meta', 'week']);
  sc.eq('① 모두 읽기(query)로 시작', Object.values(C.QUERIES).every(q => /^query\b/.test(q)), true);
  sc.eq('① 쓰기 질문 모양이 코드에 없다', /mutation\s*[({]|["'`]\s*mutation/i.test(SRV + CORE), false);
  sc.eq('① 서버가 묻는 이름이 모두 목록 안', [...SRV.matchAll(/mon\(\w+, "(\w+)"/g)].map(m => m[1]).every(n => n in C.QUERIES), true);
  sc.eq('① 서버는 QUERIES 로만 질문을 고른다', /const query = C\.QUERIES\[name\]/.test(SRV) && /if \(!query\) throw/.test(SRV), true);
  sc.eq('① 값은 변수로만 (질문 글에 이어 붙이지 않음)', /QUERIES\.\w+\s*\+|\$\{/.test(CORE.slice(CORE.indexOf('const QUERIES'), CORE.indexOf('const squash'))), false);
  sc.eq('① gcal 묶음이 monday 를 함께 내보낸다', /exports\.monday = require\("\.\/monday"\)\.monday/.test(IDX), true);
}

console.log('\n② 부산 주보 — 구두 광고 제목만');
{
  sc.eq('② 주일 확인', [C.okSun('2026-11-22'), C.okSun('2026-11-21'), C.okSun('2026-02-30'), C.okSun('26-1122'), C.okSun(null)], [true, false, false, false, false]);
  sc.eq('② 그룹 이름 YY-MMDD', C.groupTitle('2026-11-22'), '26-1122');
  const items = [
    { name: '환영', column_values: [{ text: null }] },
    { name: '가을 소풍 안내', column_values: [{ text: '2' }] },
    { name: '새벽 기도회', column_values: [{ text: '1' }] },
    { name: '겨울 수련회', column_values: [{ text: '10' }] },
    { name: '감사 영상', column_values: [{ text: '영상 사용' }] },
    { name: '꽃꽂이 모집', column_values: [{ text: '확인 필요' }] },
    { name: '지난 광고', column_values: [{ text: '해당 없음' }] },
    { name: '  ', column_values: [{ text: '3' }] },
  ];
  sc.eq('② 숫자 순 · 영상 사용 · 확인 필요 따로 · 나머지 뺌', J(C.spokenOf(items)), {
    spoken: [{ n: 1, title: '새벽 기도회' }, { n: 2, title: '가을 소풍 안내' }, { n: 10, title: '겨울 수련회' }],
    video: ['감사 영상'], check: ['꽃꽂이 모집'],
  });
  sc.eq('② 글 내용 열은 묻지 않는다 (구두 광고 열 하나만)', /column_values\(ids: \$c\)/.test(C.QUERIES.week) && J(C.weekVars({ group: 'g1', spokenCol: 'color1', dateCol: 'd1' }, '2026-11-22').c), ['color1']);
}

console.log('\n③ 영상 소식');
{
  const it = {
    name: '가을 음악회 안내',
    column_values: [{ id: 'd', type: 'date', text: '2026-11-22' }, { id: 'l', type: 'link', text: '제목 - https://youtu.be/AAA', url: 'https://youtu.be/AAA' }],
    updates: [
      { created_at: '2026-11-18T01:00:00Z', text_body: '분당 최종본입니다', replies: [{ created_at: '2026-11-19T02:00:00Z', text_body: '부산은   짧은 버전으로\n올렸습니다' }] },
      { created_at: '2026-11-20T01:00:00Z', text_body: '부산 상영 없음', replies: [] },
      { created_at: '2026-11-10T01:00:00Z', text_body: '부산'.padEnd(1600, '가'), replies: [] },
    ],
  };
  const v = C.videoOf(it);
  sc.eq('③ 제목 · 주소', [v.title, v.url], ['가을 음악회 안내', 'https://youtu.be/AAA']);
  // C4a: 묶음(업데이트 + 답글) 중 하나라도 '부산' 이면 묶음째 · 답글은 그 아래 · 한국 시각
  sc.eq('③ 부산 묶음만 · 최근 업데이트부터 · 본문에 부산이 없어도 답글에 있으면 묶음째(부모와 함께)',
    v.notes.map(n => [n.at, n.text.slice(0, 9), n.replies.map(r => r.text)]),
    [['2026-11-20', '부산 상영 없음', []], ['2026-11-18', '분당 최종본입니다', ['부산은 짧은 버전으로\n올렸습니다']], ['2026-11-10', '부산가가가가가가가', []]]);
  sc.eq('③ 긴 글은 자른다 (1500자)', v.notes[2].text.length, 1501);
  const th = C.busanNotes([
    { id: '901', created_at: '2026-11-19T16:30:00Z', text_body: '부산   교회 버전\n\n\n\n따로   올립니다', replies: [
      { created_at: '2026-11-20T03:00:00Z', text_body: '네 확인했습니다' },
      { created_at: '2026-11-20T01:00:00Z', text_body: '@홍길동 파일 주소 보내 주세요' },
      { created_at: '2026-11-20T05:00:00Z', text_body: '   ' }] },
    { id: '902', created_at: '2026-11-21T01:00:00Z', text_body: '분당 자막 고쳤습니다', replies: [{ created_at: '2026-11-21T02:00:00Z', text_body: '분당만 바꾸면 됩니다' }] },
  ], 'https://example-church.monday.com/boards/1369332975/pulses/555');
  sc.eq('③ 본문만 부산인 업데이트의 답글도 함께 · 답글은 오래된 것부터 · 빈 답글은 뺌 · 부산이 하나도 없는 묶음은 뺌',
    J(th), [{ at: '2026-11-20', tm: '01:30', id: '901', text: '부산 교회 버전\n\n따로 올립니다', link: 'https://example-church.monday.com/boards/1369332975/pulses/555/posts/901',
      replies: [{ at: '2026-11-20', tm: '10:00', text: '@홍길동 파일 주소 보내 주세요' }, { at: '2026-11-20', tm: '12:00', text: '네 확인했습니다' }] }]);
  sc.eq('③ Monday 주소가 아니면 링크를 만들지 않는다', [C.busanNotes([{ id: '1', text_body: '부산' }], 'https://evil.example.com/x')[0].link, C.busanNotes([{ id: 'x"', text_body: '부산' }], 'https://a.monday.com/boards/1/pulses/2')[0].link],
    ['', 'https://a.monday.com/boards/1/pulses/2']);
  const lk = C.videoOf({ name: 'w', url: 'https://example-church.monday.com/boards/1/pulses/7', column_values: [], updates: [{ id: '3', created_at: '2026-11-20T00:00:00Z', text_body: '부산 같음' }] });
  sc.eq('③ 아이템 Monday 주소(Monday에서 보기) · 업데이트 주소', [lk.link, lk.notes[0].link], ['https://example-church.monday.com/boards/1/pulses/7', 'https://example-church.monday.com/boards/1/pulses/7/posts/3']);
  sc.eq('③ 아이템 주소 칸은 읽기 질문에서 (url)', /items \{ id name url /.test(C.QUERIES.week), true);
  const many = { name: 'x', column_values: [], updates: Array.from({ length: 10 }, (_, i) => ({ created_at: '2026-11-1' + i, text_body: '부산 ' + i, replies: [] })) };
  sc.eq('③ 상한 6', C.videoOf(many).notes.length, 6);
  sc.eq('③ 주소 칸이 url 없이 글만이면 끝의 주소', C.videoOf({ name: 'y', column_values: [{ type: 'link', text: '제목 - https://youtu.be/BBB' }] }).url, 'https://youtu.be/BBB');
  sc.eq('③ http 가 아닌 주소는 버린다', C.videoOf({ name: 'z', column_values: [{ type: 'link', url: 'javascript:alert(1)' }] }).url, '');
  sc.eq('③ 리포터: 차 있으면 true · 비면 false · 열을 모르면 null', [C.videoOf({ name: 'a', column_values: [{ id: 'r', text: '홍길동' }] }, 'r').rep, C.videoOf({ name: 'a', column_values: [{ id: 'r', text: '' }] }, 'r').rep, C.videoOf({ name: 'a', column_values: [] }, null).rep], [true, false, null]);
  sc.eq('③ 리포터 이름은 돌려주지 않는다 (있다 · 없다만)', JSON.stringify(C.videoOf({ name: 'a', column_values: [{ id: 'r', text: '홍길동' }] }, 'r')).includes('홍길동'), false);
  sc.eq('③ 방영일 = 그 주일', J(C.weekVars({ group: 'g', spokenCol: 'c', dateCol: 'date__1' }, '2026-11-22').vr), [{ column_id: 'date__1', compare_value: ['EXACT', '2026-11-22'], operator: 'any_of' }]);
}

console.log('\n④ 보드 · 열이 바뀌면');
{
  const meta = (bcols, vcols, groups) => [
    { id: C.BOARDS.busan, columns: bcols, groups },
    { id: C.BOARDS.video, columns: vcols, groups: [] },
  ];
  const B = [{ id: 'color1', title: '구두 광고', type: 'status' }], V = [{ id: 'date__1', title: '방영일', type: 'date' }];
  sc.eq('④ 보드가 없으면 board', C.plan([], '2026-11-22').err, 'board');
  sc.eq('④ 구두 광고 열이 없으면 shape', C.plan(meta([], V, []), '2026-11-22').err, 'shape');
  sc.eq('④ 방영일이 날짜 열이 아니면 shape', C.plan(meta(B, [{ id: 'x', title: '방영일', type: 'text' }], []), '2026-11-22').err, 'shape');
  const p = C.plan(meta(B, V, [{ id: 'g0', title: 'Duplicate of 26-1115' }, { id: 'g1', title: '26 - 1122' }]), '2026-11-22');
  sc.eq('④ 그룹 찾기 (빈칸 무시 · 복사본은 아님) · 리포터 열이 없으면 repCol null', J(p), { group: 'g1', groupTitle: '26-1122', spokenCol: 'color1', dateCol: 'date__1', repCol: null });
  const p2 = C.plan(meta(B, V, [{ id: 'g0', title: 'Duplicate of 26-1115' }]), '2026-11-22');
  sc.eq('④ 그룹이 아직 없으면 found:false', J(C.weekOut({ bus: [{ groups: [] }], vid: [{ items_page: { items: [] } }] }, p2, '2026-11-22').busan), { found: false, group: '26-1122', spoken: [], video: [], check: [] });
}

console.log('\n⑤ ⑥ 서버');
{
  // 파이어베이스 · fetch 를 흉내 내고 monday.js 를 그대로 돌린다
  const store = {}, sent = [];
  const docRef = (p) => ({
    get: async () => ({ exists: p in store, data: () => store[p] }),
    set: async (v) => { store[p] = v; }, delete: async () => { delete store[p]; },
  });
  const users = { tokHB: { uid: 'hbUID0001', email: 'hb@example.com', email_verified: true },
    tokST: { uid: 'stUID0001', email: 'staff@example.com', email_verified: true },
    tokNV: { uid: 'nvUID0001', email: 'staff@example.com', email_verified: false },
    tokXX: { uid: 'xxUID0001', email: 'x@example.com', email_verified: true } };
  let handler = null;
  const fakeRequire = (m) => ({
    'firebase-functions/v2/https': { onRequest: (opt, fn) => { handler = fn; return fn; } },
    'firebase-admin/firestore': { getFirestore: () => ({ doc: docRef }) },
    'firebase-admin/auth': { getAuth: () => ({ verifyIdToken: async (t) => { if (!users[t]) throw new Error('bad'); return users[t]; } }) },
    './monday-core': C,
  })[m];
  const fakeFetch = async (url, o) => {
    const b = JSON.parse(o.body); sent.push({ url, auth: o.headers.Authorization, query: b.query, variables: b.variables });
    if (o.headers.Authorization === 'BADKEY-000000000000000') return { status: 401, ok: false, json: async () => ({}) };
    let data = {};
    if (b.query === C.QUERIES.me) data = { me: { id: '42' } };
    if (b.query === C.QUERIES.meta) data = { boards: [
      { id: C.BOARDS.busan, columns: [{ id: 'color1', title: '구두 광고', type: 'status' }], groups: [{ id: 'g1', title: '26-1122' }] },
      { id: C.BOARDS.video, columns: [{ id: 'date__1', title: '방영일', type: 'date' }, { id: 'rep1', title: '리포터', type: 'dropdown' }], groups: [] }] };
    if (b.query === C.QUERIES.week) data = { bus: [{ groups: [{ title: '26-1122', items_page: { items: [{ name: '새벽 기도회', column_values: [{ text: '1' }] }] } }] }],
      vid: [{ items_page: { items: [{ name: '가을 음악회 안내', column_values: [{ id: 'rep1', type: 'dropdown', text: '홍길동' }], updates: [] }] } }] };
    return { status: 200, ok: true, json: async () => ({ data }) };
  };
  const ctx = { require: fakeRequire, exports: {}, module: {}, fetch: fakeFetch, console: { error() {} }, Date, JSON, Object, String, Array, Error, Promise };
  vm.createContext(ctx); vm.runInContext(SRV, ctx);
  const call = async (p, tok, body) => {
    const out = { code: 200, body: null };
    const res = { status(c) { out.code = c; return this; }, json(v) { out.body = J(v); } };
    await handler({ path: p, method: 'POST', headers: tok ? { authorization: 'Bearer ' + tok } : {}, body: body || {} }, res);
    return out;
  };
  (async () => {
    sc.eq('⑤ 로그인 없으면 401', (await call('/ads', null, {})).code, 401);
    const nk = await call('/ads', 'tokHB', { owner: 'hbUID0001', sun: '2026-11-22' });
    sc.eq('⑤ 열쇠가 없으면 404 nokey', [nk.code, nk.body.code], [404, 'nokey']);
    const bad = await call('/key', 'tokHB', { token: 'BADKEY-000000000000000' });
    sc.eq('⑥ Monday 가 거절한 열쇠는 맡기지 않는다', [bad.code, 'mondayKeys/hbUID0001' in store], [401, false]);
    sc.eq('⑥ 열쇠 모양이 아니면 묻지도 않는다', [(await call('/key', 'tokHB', { token: 'short' })).code, sent.length], [400, 1]);
    const ok = await call('/key', 'tokHB', { token: 'GOODKEY-00000000000000000' });
    sc.eq('⑥ 맞는 열쇠는 자기 칸(mondayKeys/{uid})에만', [ok.code, J(Object.keys(store)), store['mondayKeys/hbUID0001'].token], [200, ['mondayKeys/hbUID0001'], 'GOODKEY-00000000000000000']);
    sc.eq('⑥ 열쇠 값을 돌려주지 않는다', JSON.stringify((await call('/status', 'tokHB')).body).includes('GOODKEY'), false);
    store['rota/hbUID0001'] = { team: ['staff@example.com'] };
    sc.eq('⑤ 날짜가 주일이 아니면 400', (await call('/ads', 'tokHB', { owner: 'hbUID0001', sun: '2026-11-21' })).code, 400);
    sc.eq('⑤ 팀 밖 사람은 403', (await call('/ads', 'tokXX', { owner: 'hbUID0001', sun: '2026-11-22' })).code, 403);
    sc.eq('⑤ 이메일 확인 안 된 사람은 403', (await call('/ads', 'tokNV', { owner: 'hbUID0001', sun: '2026-11-22' })).code, 403);
    const before = J(Object.keys(store)).sort(); sent.length = 0;
    const st = await call('/ads', 'tokST', { owner: 'hbUID0001', sun: '2026-11-22' });
    sc.eq('⑤ 교역자는 주인의 열쇠로 받는다', [st.code, sent.every(s => s.auth === 'GOODKEY-00000000000000000')], [200, true]);
    sc.eq('⑤ 결과 모양', st.body, { sun: '2026-11-22', busan: { found: true, group: '26-1122', spoken: [{ n: 1, title: '새벽 기도회' }], video: [], check: [] }, video: [{ title: '가을 음악회 안내', url: '', link: '', notes: [], rep: true }] });
    sc.eq('⑤ 보낸 질문은 목록 안의 것뿐 (meta · week)', sent.map(s => Object.keys(C.QUERIES).find(k => C.QUERIES[k] === s.query)), ['meta', 'week']);
    sc.eq('⑤ 결과를 저장하지 않는다', J(Object.keys(store)).sort(), before);
    sc.eq('⑤ 교역자는 주인 열쇠를 지우지 못한다 (자기 칸만)', ((await call('/off', 'tokST')), 'mondayKeys/hbUID0001' in store), true);
    await call('/off', 'tokHB');
    sc.eq('⑥ 끊기 = 자기 칸 지움', 'mondayKeys/hbUID0001' in store, false);
    sc.done();
  })().catch(e => { console.error(e); process.exit(1); });
}
