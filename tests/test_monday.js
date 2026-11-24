// 교역자 로테이션 R12 C — Monday 광고 읽기 서버(gcal-functions/src/monday-core.js · monday.js) — 지어낸 이름 · 제목만 (공개 저장소)
//
// 지키는 것:
//   ① **읽기만** — 보내는 질문은 QUERIES 셋(모두 query)뿐 · 쓰기 질문이 코드에 없다 · 목록 밖 이름은 멈춘다
//   ② 부산 주보: 그 주일 그룹('YY-MMDD')의 '구두 광고' 숫자 아이템 **제목만**, 숫자 순 · '영상 사용' · '확인 필요' 는 따로 · 나머지는 뺌
//   ③ 영상 소식: 방영일 = 그 주일 · 유튜브 주소 · 업데이트 + 답글 묶음 중 '부산' 이 하나라도 든 묶음째, 최근 것부터(상한) · Monday 주소 · 리포터는 있다 · 없다만(이름 X)
//   ④ 보드 · 열이 바뀌면 짐작하지 않고 알린다
//   ⑤ 서버: 로그인 필수 · 광고는 주인 본인이나 rota/{주인}.team 의 확인된 이메일만 · 주인의 열쇠로 · 결과를 저장하지 않는다
//   ⑥ 열쇠는 mondayKeys/{uid} 에만 · Monday 에 맞는지 물어본 뒤에만 맡긴다
//   ⑦ 설교 본문(1123-B B3b): 'Bible verse for worship service' 의 Date · Bible verse 열만 · 그 부산 주(월 ~ 주일) · 갈래는 아이템 이름에서 · 보드가 바뀌면 알림 · 서버 /verses
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
  sc.eq('① 질문은 넷뿐 (B3b 에 verses 하나 더함)', Object.keys(C.QUERIES).sort(), ['me', 'meta', 'verses', 'week']);
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
  sc.eq('③ 부산 묶음만 · 오래된 업데이트부터(위 = 오래된 글, HB 11/16) · 본문에 부산이 없어도 답글에 있으면 묶음째(부모와 함께)',
    v.notes.map(n => [n.at, n.text.slice(0, 9), n.replies.map(r => r.text)]),
    [['2026-11-10', '부산가가가가가가가', []], ['2026-11-18', '분당 최종본입니다', ['부산은 짧은 버전으로\n올렸습니다']], ['2026-11-20', '부산 상영 없음', []]]);
  sc.eq('③ 긴 글은 자른다 (1500자)', v.notes[0].text.length, 1501);
  sc.eq('③ 작성자가 없으면 빈 글', [v.notes[0].who, v.notes[1].replies[0].who], ['', '']);
  const th = C.busanNotes([
    { id: '901', created_at: '2026-11-19T16:30:00Z', text_body: '부산   교회 버전\n\n\n\n따로   올립니다', creator: { name: ' 김가람 ' }, replies: [
      { created_at: '2026-11-20T03:00:00Z', text_body: '네 확인했습니다', creator: { name: '홍길동' } },
      { created_at: '2026-11-20T01:00:00Z', text_body: '@홍길동 파일 주소 보내 주세요', creator: null },
      { created_at: '2026-11-20T05:00:00Z', text_body: '   ' }] },
    { id: '902', created_at: '2026-11-21T01:00:00Z', text_body: '분당 자막 고쳤습니다', replies: [{ created_at: '2026-11-21T02:00:00Z', text_body: '분당만 바꾸면 됩니다' }] },
  ], 'https://example-church.monday.com/boards/1369332975/pulses/555');
  sc.eq('③ 본문만 부산인 업데이트의 답글도 함께 · 답글은 오래된 것부터 · 빈 답글은 뺌 · 부산이 하나도 없는 묶음은 뺌 · 작성자 이름(앞뒤 빈칸 뺌)',
    J(th), [{ at: '2026-11-20', tm: '01:30', id: '901', who: '김가람', text: '부산 교회 버전\n\n따로 올립니다', link: 'https://example-church.monday.com/boards/1369332975/pulses/555/posts/901',
      replies: [{ at: '2026-11-20', tm: '10:00', who: '', text: '@홍길동 파일 주소 보내 주세요' }, { at: '2026-11-20', tm: '12:00', who: '홍길동', text: '네 확인했습니다' }] }]);
  sc.eq('③ 작성자 이름은 읽기 질문에서 (업데이트 · 답글 모두 creator { name } 만)', /updates\(limit: 30\) \{ id created_at text_body creator \{ name \} replies \{ id created_at text_body creator \{ name \} \} \}/.test(C.QUERIES.week), true);
  sc.eq('③ 작성자 이름은 30자에서 자른다', C.busanNotes([{ text_body: '부산', creator: { name: '가'.repeat(40) } }])[0].who.length, 30);
  sc.eq('③ Monday 주소가 아니면 링크를 만들지 않는다', [C.busanNotes([{ id: '1', text_body: '부산' }], 'https://evil.example.com/x')[0].link, C.busanNotes([{ id: 'x"', text_body: '부산' }], 'https://a.monday.com/boards/1/pulses/2')[0].link],
    ['', 'https://a.monday.com/boards/1/pulses/2']);
  const lk = C.videoOf({ name: 'w', url: 'https://example-church.monday.com/boards/1/pulses/7', column_values: [], updates: [{ id: '3', created_at: '2026-11-20T00:00:00Z', text_body: '부산 같음' }] });
  sc.eq('③ 아이템 Monday 주소(Monday에서 보기) · 업데이트 주소', [lk.link, lk.notes[0].link], ['https://example-church.monday.com/boards/1/pulses/7', 'https://example-church.monday.com/boards/1/pulses/7/posts/3']);
  sc.eq('③ 아이템 주소 칸은 읽기 질문에서 (url)', /items \{ id name url /.test(C.QUERIES.week), true);
  const many = { name: 'x', column_values: [], updates: Array.from({ length: 10 }, (_, i) => ({ created_at: '2026-11-1' + i, text_body: '부산 ' + i, replies: [] })) };
  sc.eq('③ 상한 6 — 최근 6개를 남긴 뒤 오래된 것부터', C.videoOf(many).notes.map(n => n.text), ['부산 4', '부산 5', '부산 6', '부산 7', '부산 8', '부산 9']);
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

console.log('\n⑦ 설교 본문 (B3b)');
{
  // 실제 보드(11/24)에서 본 아이템 이름 꼴 — 이름은 예배 이름뿐이다
  const K = (n) => { const x = C.verseKind(n); return x.k + (x.bu.length ? x.bu.join('') : ''); };
  sc.eq('⑦ 갈래: 주일 오전 · 라이프라인(이름에 다른 낱말이 붙어도 먼저) · 금요(인카운터 · 리바이브드 · 어웨이크) · 수요 · 화요 · 특별 · 다른 나라 · 빈 이름은 모름',
    ['11/22 Sunday Morning', '11/22 Lifeline', '9/27 Lifeline-Great Awakening Movie', '10/11 SPECIAL LIFELINE SERVICE - 비전', '(Lifeline PM)', '11/20 Encounter', '11/13 리바이브드', '인카운터', '어웨이크', '11/18 수요', 'Tuesday', '12/24 Christmas', '리더임명예배', '[America] Sunday Morning', '새로운 worship service', '1', ''].map(K),
    ['sun', 'll', 'll', 'll', 'll', 'fri', 'fri', 'fri', 'fri', 'wed', 'tue', 'sp', 'sp', '', '', '', '']);
  sc.eq('⑦ 주일 오전이 부마다 다르면 그 부', ['8/16 Sunday 1부,3부 Morning', '8/16 Sunday  2부 Morning', 'Sunday Morning (1, 3부)', 'Sunday Morning (2부)', 'Sunday Morning 3rd.', 'Sunday Morning 1st.', '(Sunday AM)'].map(K),
    ['sun13', 'sun2', 'sun13', 'sun2', 'sun3', 'sun1', 'sun']);
  const V = [{ id: 'date4', title: 'Date', type: 'date' }, { id: 'long_text', title: 'Bible verse', type: 'long_text' }];
  sc.eq('⑦ 열은 제목으로(Date 는 날짜 열) · 보드가 없으면 board · 열이 없으면 vshape',
    [J(C.versePlan([{ id: C.BOARDS.verse, columns: V }])), C.versePlan([]).err, C.versePlan([{ id: C.BOARDS.verse, columns: [V[1]] }]).err, C.versePlan([{ id: C.BOARDS.verse, columns: [{ id: 'd', title: 'Date', type: 'text' }, V[1]] }]).err],
    [{ dateCol: 'date4', verseCol: 'long_text' }, 'board', 'vshape', 'vshape']);
  sc.eq('⑦ 그 부산 주(월 ~ 주일) 날짜 사이 · 읽는 열은 Date · Bible verse 둘(Preacher · Title · 파일 열은 묻지 않음)', J(C.verseVars({ dateCol: 'date4', verseCol: 'long_text' }, '2026-11-22')),
    { b: [C.BOARDS.verse], c: ['date4', 'long_text'], r: [{ column_id: 'date4', compare_value: ['2026-11-16', '2026-11-22'], operator: 'between' }] });
  sc.eq('⑦ 질문은 읽기 · 열은 변수로만 · 50개 상한', [/^query \(\$b: \[ID!\], \$c: \[String!\], \$r: \[ItemsQueryRule!\]\)/.test(C.QUERIES.verses), /column_values\(ids: \$c\)/.test(C.QUERIES.verses), /limit: 50/.test(C.QUERIES.verses), /person|people|updates/.test(C.QUERIES.verses)], [true, true, true, false]);
  const it = (name, d, v) => ({ id: 'x', name, column_values: [{ id: 'date4', text: d }, { id: 'long_text', text: v }] });
  const out = C.verseOut({ boards: [{ items_page: { items: [
    it('11/22 Lifeline', '2026-11-22', '2 Samuel 3:1-39 (whole chapter)'), it('11/18 수요', '2026-11-18', '[약1:12-27]'), it('11/22 Sunday Morning', '2026-11-22', '  Matthew 9:14-17\r\n'),
    it('11/15 Sunday Morning', '2026-11-15', '지난주'), it('11/23 Sunday Morning', '2026-11-23', '다음 주'), it('11/20 Encounter', '2026-11-20', ''), it('[America] Sunday Morning', '2026-11-22', 'Mark 1:1'),
    it('11/21 ' + '가'.repeat(80), '2026-11-21', 'x'.repeat(400)), it('날짜 없음', '', 'John 3:16')] } }] }, { dateCol: 'date4', verseCol: 'long_text' }, '2026-11-22');
  sc.eq('⑦ 결과: 그 주 안 · 본문이 있는 것 · 모르는 갈래(다른 나라) 뺌 · 날짜 차례 · 이름 60자 · 본문 300자(영어 그대로 — 한글은 앱이)',
    [out.sun, out.list.map(x => [x.d, x.k, x.v.slice(0, 20)]), out.list[1].n.length, out.list[1].v.length],
    ['2026-11-22', [['2026-11-18', 'wed', '[약1:12-27]'], ['2026-11-21', 'sp', 'xxxxxxxxxxxxxxxxxxxx'], ['2026-11-22', 'll', '2 Samuel 3:1-39 (who'], ['2026-11-22', 'sun', 'Matthew 9:14-17']], 60, 300]);
  sc.eq('⑦ 서버 /verses 는 열쇠가 없으면 /ads 와 같게 nokey · 보드 모양이 바뀌면 vshape 글', [/path === "\/ads" \|\| path === "\/verses"/.test(SRV), /vshape: "Monday 본문 보드 모양이 바뀌었습니다/.test(SRV)], [true, true]);
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
    if (b.query === C.QUERIES.meta && b.variables.ids[0] === C.BOARDS.verse) data = { boards: [{ id: C.BOARDS.verse, columns: [{ id: 'date4', title: 'Date', type: 'date' }, { id: 'long_text', title: 'Bible verse', type: 'long_text' }, { id: 'person', title: 'Preacher', type: 'people' }], groups: [] }] };
    if (b.query === C.QUERIES.verses) data = { boards: [{ items_page: { items: [{ id: '1', name: '11/22 Sunday Morning', column_values: [{ id: 'date4', text: '2026-11-22' }, { id: 'long_text', text: 'Matt. 9:9-13' }] }] } }] };
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
    sent.length = 0;
    const vs = await call('/verses', 'tokST', { owner: 'hbUID0001', sun: '2026-11-22' });
    sc.eq('⑦ /verses: 교역자도 주인 열쇠로 · 결과 모양 · 질문은 meta(본문 보드만) · verses', [vs.code, vs.body, sent.map(s => Object.keys(C.QUERIES).find(k => C.QUERIES[k] === s.query)), sent[0].variables.ids, sent[1].variables.c],
      [200, { sun: '2026-11-22', list: [{ d: '2026-11-22', k: 'sun', bu: [], n: '11/22 Sunday Morning', v: 'Matt. 9:9-13' }] }, ['meta', 'verses'], [C.BOARDS.verse], ['date4', 'long_text']]);
    sc.eq('⑦ /verses: 팀 밖 · 주일 아님은 막음 · 결과를 저장하지 않는다', [(await call('/verses', 'tokXX', { owner: 'hbUID0001', sun: '2026-11-22' })).code, (await call('/verses', 'tokHB', { owner: 'hbUID0001', sun: '2026-11-20' })).code, J(Object.keys(store)).sort()], [403, 400, before]);
    sc.eq('⑤ 교역자는 주인 열쇠를 지우지 못한다 (자기 칸만)', ((await call('/off', 'tokST')), 'mondayKeys/hbUID0001' in store), true);
    await call('/off', 'tokHB');
    sc.eq('⑥ 끊기 = 자기 칸 지움', 'mondayKeys/hbUID0001' in store, false);
    sc.done();
  })().catch(e => { console.error(e); process.exit(1); });
}
