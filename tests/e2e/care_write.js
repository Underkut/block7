// (1108-S2 뒤: 지우기는 열람 화면 우상단 휴지통 단추 — ⋯ 메뉴는 없어졌다)
// 심방 노트 C2 쓰기 — 실제 화면을 누르며 가짜 구글 시트에 쓰이는 것을 본다 (node tests/e2e/care_write.js)
// 구글 시트 · 폼 · 캘린더 · 열쇠 서버는 이 파일 안의 가짜가 대신한다. 이름 · 내용은 모두 지어낸 것.
//
// 지키는 것:
//  ① 처음 쓰기 → '시트 준비' 를 묻고, 응답 탭 끝에 앱 열 · 탭 다섯 · 있던 줄에 기록ID(빈 칸에만)
//  ② 새 기록 → 이름으로 찾은 칸에만 한 줄 (출처 앱 · 심방일 · 여럿 칸 ', ')
//  ③ 고치기 → 바꾼 칸 + 수정 시각만 쓴다 · 되돌리기 → 그 칸이 예전 값으로
//  ④ 안 바꾸고 저장 → 시트에 아무것도 안 쓴다
//  ⑤ 할 일 체크 → '액션' 탭에 한 줄 · 풀기 → 같은 줄의 상태만
//  ⑥ 덧붙이기 → '덧붙임' 탭에 한 줄, 원래 이야기는 그대로
//  ⑦ 폼 줄(타임스탬프 · 질문 칸)은 앱 열 말고는 한 글자도 안 바뀐다
//  ⑨ (코덱스 검토 PR 962) 지우다 멈춘 뒤 다시 지워도 휴지통 백업은 하나 · 휴지통 탭이 비었거나 머리글 없이 백업이 먼저 들어가도 바로잡는다
//  ⑩ (같은 검토) 지우는 도중 다른 기기가 앞줄을 지워 한 줄 밀려도 엉뚱한 기록을 휴지통에 넣지 않는다
//  ⑪ (C2-4) 폼 ↔ '속성' 탭 — 처음엔 폼 선택지를 탭으로 · 폼에서 더함 → 탭 · 앱에서 더함/숨김/다시 쓰기 → 폼 · '기타' 글을 선택지로 · 폼에 '장소 · 메모' 질문 · 다시 맞춰도 폼을 또 고치지 않는다
//  ⑧ 지우기 → 휴지통 탭에 원래 줄 · 응답 탭에서 그 한 줄만 빠진다 · 되돌리기 · 휴지통에서 되살리기 · 완전히 지우기
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', '..', 'care', 'index.html');

let pass = 0, fail = 0;
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); } };

// ── 가짜 시트 ──
const HEAD = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이'];
const ROWS = [
  ['11/6/2026 10:40:51', '10/31', '가나다', '장년부', '지나가다 대화', '첫 이야기', '신앙, 교회', '중보, 보고', '깊음'],
  ['11/6/2026 10:37:06', '11/4', '라마바', '청년부', '식사', '학교 이야기', '학교', '중보', '중간'],
  ['5/21/2020 10:37:02', '5/21', '사아자', '두나미스', '보고 차카타', '옛 기록', '', '', ''],
];
const SHEET = { tabs: [{ id: 0, title: 'Form Responses 1', cols: 26, rows: [HEAD.slice()].concat(ROWS.map(r => r.slice())) }] };
const LOG = [];
const HOOK = { failDel: false, shift: false, failForm: false };   // 일부러 일으키는 사고
const tab = t => SHEET.tabs.find(x => x.title === t);
const colN = L => L.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
function parseRange(r) {
  const m = decodeURIComponent(r).match(/^'((?:[^']|'')*)'!(.*)$/); const title = m[1].replace(/''/g, "'"), ref = m[2];
  let mm;
  if ((mm = ref.match(/^([A-Z]+)(\d+)$/))) return { title, row: +mm[2], col: colN(mm[1]) };
  if ((mm = ref.match(/^(\d+):(\d+)$/))) return { title, rowOnly: +mm[1] };
  if ((mm = ref.match(/^([A-Z]+):([A-Z]+)$/))) return { title, colOnly: colN(mm[1]) };
  return { title, all: true };
}
function setCell(t, row, col, v) { const T = tab(t); while (T.rows.length < row) T.rows.push([]); const r = T.rows[row - 1]; while (r.length <= col) r.push(''); r[col] = v; }
function trim(rows) { return rows.map(r => { const c = r.slice(); while (c.length && (c[c.length - 1] === '' || c[c.length - 1] == null)) c.pop(); return c; }); }
const FORM = { revisionId: 'rev1', responderUri: 'https://example.invalid/form', items: [
  ['구분', 'CHECKBOX', ['예배인도자', '예배팀', '셀리더', '셀원', '장년부', '청년부', '중고등부']],
  ['전화 / 만남', 'RADIO', ['지나가다 대화', '티타임', '식사', '전화', '카톡, 문자']],
  ['태그', 'CHECKBOX', ['신앙', '교회', '가정', '직장', '학교', '건강']],
  ['액션', 'CHECKBOX', ['중보', '연결', '보고']],
  ['대화 깊이', 'RADIO', ['깊음', '중간', '얕음']],
].map(([title, type, ops], i) => ({ itemId: 'it' + i, title, questionItem: { question: { questionId: 'q' + i, choiceQuestion: { type, options: ops.map(v => ({ value: v })).concat([{ isOther: true }]) } } } })) };

async function route(r) {
  const u = new URL(r.request().url()), m = r.request().method(), body = r.request().postData() ? JSON.parse(r.request().postData()) : null;
  const json = (o) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
  if (u.host.includes('cloudfunctions')) return json(u.pathname.endsWith('/status') ? { connected: true, email: 'test@example.com' } : { access_token: 'fake', expires_in: 3600 });
  if (u.host === 'forms.googleapis.com') {
    if (m === 'POST' && HOOK.failForm) { HOOK.failForm = false; return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"message":"잠깐 끊김"}}' }); }
    if (m === 'POST') {   // forms.batchUpdate — 판 번호가 다르면 거절
      if (!body.writeControl || body.writeControl.requiredRevisionId !== FORM.revisionId) return r.fulfill({ status: 400, contentType: 'application/json', body: '{"error":{"message":"revision"}}' });
      body.requests.forEach(q => {
        if (q.updateItem) { const it = FORM.items[q.updateItem.location.index]; it.questionItem.question.choiceQuestion.options = q.updateItem.item.questionItem.question.choiceQuestion.options; }
        if (q.createItem) FORM.items.splice(q.createItem.location.index, 0, Object.assign({ itemId: 'new' + FORM.items.length }, q.createItem.item));
      });
      FORM.revisionId = 'rev' + (+FORM.revisionId.slice(3) + 1); LOG.push(['form', body.requests.length]);
      return json({});
    }
    return json(FORM);
  }
  if (u.host === 'www.googleapis.com') return json({ items: [] });
  if (u.host !== 'sheets.googleapis.com') return r.abort();
  const p = u.pathname.replace('/v4/spreadsheets/S', '');
  if (p === '' && m === 'GET') return json({ properties: { title: '시험 시트' }, sheets: SHEET.tabs.map(t => ({ properties: { sheetId: t.id, title: t.title, gridProperties: { columnCount: t.cols } } })) });
  if (p === ':batchUpdate') {
    if (HOOK.failDel && body.requests.some(q => q.deleteDimension && q.deleteDimension.range.sheetId === 0)) { HOOK.failDel = false; return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"message":"잠깐 끊김"}}' }); }
    body.requests.forEach(q => {
      if (q.insertDimension) { const g = q.insertDimension.range; SHEET.tabs.find(t => t.id === g.sheetId).rows.splice(g.startIndex, 0, ...Array.from({ length: g.endIndex - g.startIndex }, () => [])); }
      if (q.appendDimension) tab(SHEET.tabs.find(t => t.id === q.appendDimension.sheetId).title).cols += q.appendDimension.length;
      if (q.addSheet) SHEET.tabs.push({ id: SHEET.tabs.length, title: q.addSheet.properties.title, cols: 26, rows: [] });
      if (q.deleteDimension) { const g = q.deleteDimension.range; SHEET.tabs.find(t => t.id === g.sheetId).rows.splice(g.startIndex, g.endIndex - g.startIndex); }
    });
    LOG.push(['struct', body.requests.map(q => Object.keys(q)[0])]); return json({});
  }
  if (p === '/values:batchUpdate') {
    body.data.forEach(d => { const R = parseRange(d.range); d.values[0].forEach((v, i) => setCell(R.title, R.row, R.col + i, v)); LOG.push(['set', d.range, d.values[0]]); });
    return json({});
  }
  let mm;
  if ((mm = p.match(/^\/values\/(.+):append$/))) { const R = parseRange(mm[1]); body.values.forEach(v => { tab(R.title).rows.push(v.slice()); LOG.push(['append', R.title, v]); }); return json({}); }
  if ((mm = p.match(/^\/values\/(.+)$/))) {
    const R = parseRange(mm[1]), T = tab(R.title); if (!T) return r.fulfill({ status: 400, body: '{}' });
    if (HOOK.shift && R.title === 'Form Responses 1' && R.rowOnly > 2) { HOOK.shift = false; T.rows.splice(1, 1); }   // 다른 기기가 앞줄(2번째 줄)을 막 지웠다
    let vals = trim(T.rows);
    if (R.rowOnly) vals = [vals[R.rowOnly - 1] || []];
    else if (R.colOnly != null) vals = vals.map(x => [x[R.colOnly] == null ? '' : x[R.colOnly]]);
    return json({ values: vals });
  }
  return r.abort();
}

(async () => {
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 420, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }); googleStatus(); });
  await page.waitForSelector('.card');
  const formRowsBefore = JSON.stringify(ROWS);
  const tidy = () => page.waitForTimeout(500);

  // ①② 새 기록
  await page.click('[data-act="addrec"]'); await tidy();
  await page.fill('[data-f="name"]', '새사람');
  await page.fill('[data-f="text"]', '새로 적은 이야기\n둘째 줄');
  await page.click('.layer [data-act="fone"][data-k="method"][data-v="카톡, 문자"]');
  await page.click('.layer [data-act="fone"][data-k="depth"][data-v="깊음"]');
  await page.click('.layer [data-act="ftog"][data-k="tags"][data-v="학교"]');
  await page.click('.layer [data-act="ftog"][data-k="acts"][data-v="중보"]');
  await page.fill('[data-f="actsEtc"]', '병문안 가기');
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/edit.png', fullPage: false });
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(1200);
  const R = tab('Form Responses 1'), H = R.rows[0];
  eq('① 앱 열 여섯이 마지막 머리글 뒤에', H.slice(9, 15), ['기록ID', '출처', '심방일', '수정', '확인', '보관']);
  eq('① 탭 다섯', SHEET.tabs.map(t => t.title), ['Form Responses 1', '성도', '액션', '덧붙임', '계획', '속성']);
  eq('① 있던 줄마다 기록ID · 출처 폼 · 심방일 (연도 붙여)', R.rows.slice(1, 4).map(r => [!!r[9], r[10], r[11]]), [[true, '폼', '2026-10-31'], [true, '폼', '2026-11-04'], [true, '폼', '2020-05-21']]);
  const nr = R.rows[4] || [];
  eq('② 새 줄 — 이름 · 방식 · 이야기 · 태그 · 할 일(기타 끝에) · 깊이 · 출처 앱', [nr[2], nr[4], nr[5], nr[6], nr[7], nr[8], nr[10]], ['새사람', '카톡, 문자', '새로 적은 이야기\n둘째 줄', '학교', '중보, 병문안 가기', '깊음', '앱']);
  eq('② 새 줄 기록ID · 심방일(오늘)', [/^C/.test(nr[9] || ''), (nr[11] || '').length], [true, 10]);
  eq('⑦ 폼 줄의 질문 칸은 그대로', JSON.stringify(R.rows.slice(1, 4).map(r => r.slice(0, 9))), formRowsBefore);
  await page.waitForSelector('.card');
  eq('② 목록에 새 기록이 뜬다', await page.$$eval('.card .nm', x => x.map(e => e.textContent).includes('새사람')), true);

  // ③ 고치기 · 되돌리기 — '라마바' 의 깊이를 중간 → 얕음
  await page.click('.card:has-text("라마바")'); await tidy();
  await page.click('.layer [data-act="edit"]'); await tidy();
  await page.click('.layer:last-child [data-act="fone"][data-k="depth"][data-v="얕음"]');
  const n0 = LOG.length;
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(1000);
  const sets = LOG.slice(n0).filter(x => x[0] === 'set').map(x => x[1].replace(/\d+$/, '') + '=' + (String(x[2][0]).length > 12 ? '시각' : x[2][0]));
  eq('③ 깊이 칸 + 수정 시각만 썼다', sets, ["'Form Responses 1'!I=얕음", "'Form Responses 1'!M=시각"]);
  eq('③ 시트의 그 줄 깊이', R.rows[2][8], '얕음');
  await page.click('.toast-act'); await page.waitForTimeout(1000);
  eq('③ 되돌리기 → 중간 · 수정 칸도 빈 값', [R.rows[2][8], R.rows[2][12] || ''], ['중간', '']);

  // ④ 안 바꾸고 저장
  await page.waitForTimeout(300);
  const top = await page.$$('.layer'); for (let i = 0; i < top.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
  await page.click('.card:has-text("가나다")'); await tidy();
  await page.click('.layer [data-act="edit"]'); await tidy();
  const n1 = LOG.length;
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(900);
  eq('④ 안 바꾸고 저장하면 아무것도 안 쓴다', LOG.slice(n1).filter(x => x[0] !== 'struct').length, 0);

  // ⑤ 할 일 체크 — 가나다의 '중보'
  await page.waitForSelector('.layer [data-act="tick"]');
  await page.click('.layer [data-act="tick"][data-k="0"]'); await page.waitForTimeout(1000);
  const A = tab('액션').rows;
  eq('⑤ 체크 → 액션 탭에 한 줄 (기록ID · 성도 · 종류 · 마침)', A.slice(1).map(r => [r[1] === R.rows[1][9], r[2], r[3], r[7]]), [[true, '가나다', '중보', '마침']]);
  await page.click('.layer [data-act="tick"][data-k="0"]'); await page.waitForTimeout(1000);
  eq('⑤ 풀기 → 같은 줄 상태 할 일 · 완료일 비움 (줄은 그대로 하나)', A.slice(1).map(r => [r[7], r[8]]), [['할 일', '']]);

  // ⑥ 덧붙이기
  await page.click('.layer [data-act="addnopen"]'); await tidy();
  await page.fill('#addnText', '나중에 들은 이야기');
  await page.click('.layer [data-act="addnsave"]'); await page.waitForTimeout(1000);
  const D = tab('덧붙임').rows;
  eq('⑥ 덧붙임 탭에 한 줄 (기록ID · 쓴 사람 · 내용)', D.slice(1).map(r => [r[0] === R.rows[1][9], r[2], r[3]]), [[true, 'test@example.com', '나중에 들은 이야기']]);
  eq('⑥ 원래 이야기는 그대로', R.rows[1][5], '첫 이야기');
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/detail.png' });
  eq('⑥ 상세에 덧붙임이 보인다', await page.$$eval('.layer .addn', x => x.map(e => e.textContent).join('')).then(t => t.includes('나중에 들은 이야기')), true);

  // ⑧ 지우기 — '새사람'
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  const before = R.rows.map(r => JSON.stringify(r)), victim = R.rows.find(r => r[2] === '새사람'), vid = victim[9];
  const others = before.filter(x => !x.includes('"새사람"'));
  const del = async () => {
    await page.click('.card:has-text("새사람")'); await tidy();
    await page.click('.layer [data-act="delrec"]'); await page.waitForTimeout(1200);
  };
  await del();
  const T = () => tab('휴지통').rows;
  eq('⑧ 응답 탭에서 그 한 줄만 빠졌다 (나머지 줄은 그대로)', [R.rows.length, JSON.stringify(R.rows.map(r => JSON.stringify(r)))], [before.length - 1, JSON.stringify(others)]);
  eq('⑧ 휴지통 탭에 기록ID · 이름 · 원래 줄', [T()[0][0], T()[1][0] === vid, T()[1][1], JSON.parse(T()[1][5])['내용']], ['기록ID', true, '새사람', '새로 적은 이야기\n둘째 줄']);
  eq('⑧ 목록에서 사라졌다', await page.$$eval('.card .nm', x => x.map(e => e.textContent).includes('새사람')), false);
  await page.click('.toast-act'); await page.waitForTimeout(1200);
  const back = R.rows.find(r => r[9] === vid);
  eq('⑧ 되돌리기 → 같은 기록ID · 같은 칸으로 돌아오고 휴지통은 비었다', [JSON.stringify(back) === JSON.stringify(victim), T().length], [true, 1]);
  await del();
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy();
  await page.click('.layer [data-act="trash"]'); await page.waitForTimeout(900);
  eq('⑧ 설정 › 휴지통에 보인다', await page.$$eval('.layer .trow b', x => x.map(e => e.textContent)), ['새사람']);
  await page.click('.layer [data-act="trestore"]'); await page.waitForTimeout(1200);
  eq('⑧ 휴지통에서 되살리기 → 돌아오고 휴지통 비움', [!!R.rows.find(r => r[9] === vid), T().length], [true, 1]);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await del();
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy();
  await page.click('.layer [data-act="trash"]'); await page.waitForTimeout(900);
  await page.click('.layer [data-act="tpurge"]'); await page.waitForTimeout(1200);
  eq('⑧ 완전히 지우기 → 휴지통 · 응답 탭 어디에도 없다', [T().length, !!R.rows.find(r => r[9] === vid)], [1, false]);
  eq('⑧ 할 일 · 덧붙임 탭은 지우기와 상관없이 그대로', [tab('액션').rows.length, tab('덧붙임').rows.length], [2, 2]);

  // ⑨ 지우다 멈춘 뒤 다시 — 휴지통 탭은 비어 있는(머리글도 없는) 상태에서 시작
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  tab('휴지통').rows = [];
  const lmb = R.rows.find(r => r[2] === '라마바'), lid = lmb[9];
  HOOK.failDel = true;
  await page.click('.card:has-text("라마바")'); await tidy();
  await page.click('.layer [data-act="delrec"]'); await page.waitForTimeout(1200);
  eq('⑨ 지우기가 끊기면 원래 줄은 그대로 · 빈 휴지통 탭에 머리글이 생기고 백업 하나', [!!R.rows.find(r => r[9] === lid), T()[0][0], T().length], [true, '기록ID', 2]);
  await page.click('.layer [data-act="delrec"]'); await page.waitForTimeout(1200);
  eq('⑨ 다시 지우면 지워지고 휴지통 백업은 여전히 하나', [!!R.rows.find(r => r[9] === lid), T().filter(r => r[0] === lid).length], [false, 1]);
  // ⑨ 머리글 없이 백업 줄이 첫 줄에 들어간 휴지통 — 머리글을 끼워 넣고 둘 다 읽힌다
  tab('휴지통').rows = T().slice(1);
  // ⑩ 지우는 도중 다른 기기가 앞줄(가나다)을 지운다 — 대상은 사아자(보관 기록)
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await page.evaluate(() => { S.showArch = true; render(); });
  const sid = R.rows.find(r => r[2] === '사아자')[9];
  await page.click('.card:has-text("사아자")'); await tidy();
  HOOK.shift = true;
  await page.click('.layer [data-act="delrec"]'); await page.waitForTimeout(1500);
  const sa = T().find(r => r[0] === sid);
  eq('⑨ 머리글이 다시 맨 위 · 앞서 지운 백업도 그대로 남았다', [T()[0][0], !!T().find(r => r[0] === lid)], ['기록ID', true]);
  eq('⑩ (장치 확인) 지우는 도중 앞줄이 정말 사라졌다 · 끊김도 정말 일어났다', [HOOK.shift, HOOK.failDel], [false, false]);
  eq('⑩ 휴지통에 들어간 것은 사아자 자신 (밀린 다른 기록이 아님)', [!!sa, sa && JSON.parse(sa[5])['성도 이름'], sa && JSON.parse(sa[5])['기록ID'] === sid], [true, '사아자', true]);
  eq('⑩ 응답 탭 — 사아자만 빠지고(가나다는 다른 기기가 지움) 머리글만 남음', R.rows.map(r => r[2]), ['성도 이름']);

  // ⑪ 속성 · 폼 맞추기
  const A_ = () => tab('속성').rows.slice(1), opts = t => FORM.items.find(i => i.title === t).questionItem.question.choiceQuestion.options.map(o => o.isOther ? '(기타)' : o.value);
  const reload = async () => { await page.evaluate(() => loadData(true)); await page.waitForTimeout(1500); };
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await reload();
  eq('⑪ 처음 — 폼 선택지가 속성 탭으로 (구분 7 · 방식 5 · 태그 6 · 액션 3, 대화 깊이는 빼고)', [A_().length, A_().every(r => r[6])], [21, true]);
  FORM.items[2].questionItem.question.choiceQuestion.options.splice(6, 0, { value: '진로' }); FORM.revisionId = 'rev50';
  await reload();
  eq('⑪ 폼에서 더함 → 속성 탭에 한 줄', !!A_().find(r => r[0] === '태그' && r[1] === '진로'), true);
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy();
  await page.click('.layer [data-act="layer"][data-v="attrs"]'); await page.waitForTimeout(600);
  await page.fill('#aadd2', '관계'); await page.click('.layer [data-act="attradd"][data-k="태그"]'); await page.waitForTimeout(1500);
  eq('⑪ 앱에서 더함 → 폼 선택지 끝(기타 앞)에 · 탭에 맞춘 표시', [opts('태그').slice(-2), !!A_().find(r => r[1] === '관계' && r[6])], [['관계', '(기타)'], true]);
  await page.click('.layer [data-act="attrhide"][data-k="태그"][data-v="건강"]'); await page.waitForTimeout(1500);
  eq('⑪ 앱에서 숨김 → 폼에서 빠지고 탭에 숨김', [opts('태그').includes('건강'), (A_().find(r => r[1] === '건강') || [])[4]], [false, '숨김']);
  await page.click('.layer [data-act="attrhide"][data-k="태그"][data-v="건강"]'); await page.waitForTimeout(1500);
  eq('⑪ 다시 쓰기 → 폼에 다시 · 숨김 풀림', [opts('태그').includes('건강'), (A_().find(r => r[1] === '건강') || [])[4]], [true, '']);
  // '기타' 글을 선택지로 — 구분에 '두나미스' 가 기타로 적힌 기록
  R.rows.push(['11/7/2026 10:00:00', '11/7', '차카타', '셀원, 두나미스', '전화', '기타 구분이 든 기록', '', '', '얕음', 'C900', '폼', '2026-11-07']);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await reload();
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy();
  await page.click('.layer [data-act="layer"][data-v="attrs"]'); await page.waitForTimeout(600);
  eq("⑪ '기타' 로 들어온 글이 후보로 보인다", await page.$$eval('.layer .etcc', x => x.map(e => e.textContent).join(' ')).then(t => t.includes('두나미스')), true);
  if (process.env.SHOT) { await page.evaluate(() => document.querySelector('.layer:last-child').scrollTo(0, 0)); await page.screenshot({ path: process.env.SHOT + '/attrs.png' }); }
  await page.click('.layer [data-act="etcpromote"][data-v="두나미스"]'); await page.waitForTimeout(1500);
  eq("⑪ 선택지로 → 폼 구분에 더해지고 지난 기록도 선택지로 읽힌다", [opts('구분').includes('두나미스'), await page.evaluate(() => { const v = M().visits.find(x => x.name === '차카타'); return v && v.roles.includes('두나미스') && !v.rolesEtc.length; })], [true, true]);
  // '장소 · 메모' 질문
  await page.click('.layer [data-act="addplace"]'); await page.waitForTimeout(1500);
  eq("⑪ 폼에 '장소 · 메모' — '전화 / 만남' 바로 뒤에", FORM.items.map(i => i.title).slice(1, 3), ['전화 / 만남', '장소 · 메모']);
  // (코덱스 검토 PR 976) ① 폼 고치기가 한 번 실패 → 맞춘 표시가 안 남고, 다음 맞춤에 폼에 더해진다(숨겨지지 않는다)
  HOOK.failForm = true;
  await page.fill('#aadd2', '봉사'); await page.click('.layer [data-act="attradd"][data-k="태그"]'); await page.waitForTimeout(1500);
  const bs = () => A_().find(r => r[1] === '봉사') || [];
  eq('⑪ 폼 고치기가 실패하면 탭엔 줄만 있고 맞춘 표시는 없다 · 폼엔 아직 없다', [bs()[1], bs()[6] || '', opts('태그').includes('봉사'), HOOK.failForm], ['봉사', '', false, false]);
  await page.click('.layer [data-act="attrsync"]'); await page.waitForTimeout(1500);
  eq('⑪ 다음 맞춤 → 폼에 더해지고 숨겨지지 않는다', [opts('태그').includes('봉사'), !!bs()[6], bs()[4] || ''], [true, true, '']);
  // ② 앱을 켜 둔 채 폼에서 선택지를 지운다 → 입력 칩에서도 빠진다
  FORM.items[0].questionItem.question.choiceQuestion.options = FORM.items[0].questionItem.question.choiceQuestion.options.filter(o => o.value !== '셀원'); FORM.revisionId = 'rev90';
  await page.click('.layer [data-act="attrsync"]'); await page.waitForTimeout(1800);
  eq('⑪ 폼에서 지운 선택지 → 탭에선 숨김 · 입력 칩(폼 선택지)에서도 빠진다', [(A_().find(r => r[1] === '셀원') || [])[4], await page.evaluate(() => DATA.opts.roles.includes('셀원'))], ['숨김', false]);
  // 다시 맞춰도 폼을 또 고치지 않는다
  const nForm = LOG.filter(x => x[0] === 'form').length;
  await reload(); await reload();
  eq('⑪ 다시 맞춰도 폼 · 탭을 또 고치지 않는다', [LOG.filter(x => x[0] === 'form').length, A_().length], [nForm, 25]);

  eq('⑦ 화면 오류 없음', errs, []);
  await b.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
