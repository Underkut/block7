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
//  ⑫ (C3) 계획 ↔ '심방' 캘린더 — 만들기 · 캘린더에서 옮김/지움 따라가기 · 제목 앞뒤 글자 · 만들다 끊긴 일정 이어 붙이기 · 여벌 지우기 ·
//     계획 → 기록(✓) · 캘린더에만 있는 일정 가져오기 · 앱에서 취소 → 일정 지움 · 캘린더에 안 넣기
//  ⑬ (C3b) 할 일 → BLOCK7 할일 — 쪽지함에 쪽지 한 줄(종류 · 이름 · 날짜만, 나눈 이야기 없음) · 액션 탭에 보낸 날 · 보낸 뒤 단추에 날짜 · 쪽지함 쓰기가 실패하면 시트에 아무것도 안 적는다
//  ⑭ (C3c) 기록도 '심방' 캘린더에 — 2026-10-01 부터 기록마다 ✓ 하루 종일 하나 · 계획에서 온 기록은 건너뜀 · 기록 날짜를 고치면 일정도 · 캘린더에서 옮겨도 기록 날짜로 · 지운 기록의 일정은 지움 · 다시 맞춰도 그대로
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
const HOOK = { failDel: false, shift: false, failForm: false, failPlanSet: 0 };
const CAL = { seq: 0, events: [] };   // 가짜 '심방' 캘린더의 일정들   // 일부러 일으키는 사고
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
  if (u.host === 'www.googleapis.com') {   // 가짜 구글 캘린더 — '심방' 캘린더 하나
    const P = u.pathname.replace('/calendar/v3/', ''), q = u.searchParams;
    if (P === 'users/me/calendarList') return json({ items: [{ id: 'cal1', summary: '심방' }, { id: 'cal2', summary: '개인' }] });
    let mm;
    if (P === 'calendars/cal1/events') {
      if (m === 'POST') { const e = Object.assign({ id: 'ev' + (++CAL.seq), status: 'confirmed', htmlLink: 'https://example.invalid/ev' }, body); CAL.events.push(e); LOG.push([e.extendedProperties && e.extendedProperties.private && e.extendedProperties.private.careRec ? 'calR+' : 'cal+', e.summary]); return json(e); }
      const pe = q.get('privateExtendedProperty');
      let items = CAL.events.filter(e => q.get('showDeleted') === 'true' || e.status !== 'cancelled');
      if (pe) { const [k, v] = pe.split('='); items = items.filter(e => e.extendedProperties && e.extendedProperties.private && e.extendedProperties.private[k] === v); }
      return json({ items: JSON.parse(JSON.stringify(items)) });
    }
    if ((mm = P.match(/^calendars\/cal1\/events\/(.+)$/))) {
      const e = CAL.events.find(x => x.id === decodeURIComponent(mm[1]));
      if (!e) return r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":{"message":"Not Found"}}' });
      if (m === 'DELETE') { if (e.status === 'cancelled') return r.fulfill({ status: 410, contentType: 'application/json', body: '{"error":{"message":"Gone"}}' }); e.status = 'cancelled'; LOG.push(['cal-', e.id]); return r.fulfill({ status: 204, body: '' }); }
      if (m === 'PATCH') {
        const pr = body.extendedProperties && body.extendedProperties.private;
        Object.assign(e, body); if (pr) e.extendedProperties = { private: Object.assign({}, pr) };
        LOG.push(['cal~', e.id, Object.keys(body)]); return json(e);
      }
      return json(JSON.parse(JSON.stringify(e)));
    }
    return r.fulfill({ status: 404, contentType: 'application/json', body: '{"error":{"message":"Not Found"}}' });   // 다른 계정의 캘린더 등
  }
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
    if (HOOK.failPlanSet > 0 && body.data.some(d => decodeURIComponent(d.range).startsWith("'계획'!"))) { HOOK.failPlanSet--; return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"message":"잠깐 끊김"}}' }); }
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
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 420, height: 900 }, timezoneId: 'Asia/Seoul' });
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

  // ⑫ 계획 ↔ '심방' 캘린더
  const PT = () => tab('계획').rows, PH = () => PT()[0], prow = n => { const r = PT().find(x => x[1] === n) || []; const o = {}; PH().forEach((h, i) => { o[h] = r[i] == null ? '' : r[i]; }); return o; };
  const evOf = id => CAL.events.find(e => e.id === id) || {};
  const ymdP = d => { const t = new Date(); t.setDate(t.getDate() + d); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };
  const D2 = ymdP(2), D3 = ymdP(3), D1 = ymdP(1);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await page.click('.ph-nav [data-act="tab"][data-v="plan"]'); await tidy();
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="name"]', '하하하');
  await page.fill('.layer [data-f="date"]', D2); await page.fill('.layer [data-f="time"]', '14:00');
  await page.fill('.layer [data-f="why"]', '지난번 이야기 이어서');
  await page.click('.layer [data-act="fone"][data-k="method"][data-v="티타임"]');
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/planedit.png' });
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1800);
  let ph = prow('하하하'), ev = evOf(ph['캘린더 일정ID']);
  eq('⑫ 새 계획 → 계획 탭 한 줄(예정 · 방식 · 물어볼 것) · 캘린더 일정ID', [ph['날짜'], ph['시간'], ph['방식'], ph['물어볼 것'], ph['상태'], /^ev/.test(ph['캘린더 일정ID'])], [D2, '14:00', '티타임', '지난번 이야기 이어서', '예정', true]);
  eq('⑫ 일정 — 제목은 이름만 · 14시부터 한 시간 · 보이지 않는 표식 · 물어볼 것은 일정에 없다', [ev.summary, ev.start && ev.start.dateTime, ev.end && ev.end.dateTime, ev.extendedProperties.private.careId === ph['계획ID'], JSON.stringify(ev).includes('지난번')], ['하하하', D2 + 'T14:00:00', D2 + 'T15:00:00', true, false]);
  eq('⑫ 계획 화면에 카드', await page.$$eval('.pcard .nm', x => x.map(e => e.textContent)), ['하하하']);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/plan.png' });
  // 캘린더에서 옮김 → 계획이 따라간다
  ev.start = { dateTime: D3 + 'T15:30:00+09:00' }; ev.end = { dateTime: D3 + 'T16:30:00+09:00' };
  await reload();
  ph = prow('하하하');
  eq('⑫ 캘린더에서 옮김 → 계획 날짜 · 시간이 따라간다', [ph['날짜'], ph['시간']], [D3, '15:30']);
  // 제목 앞 글자
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy();
  await page.fill('#calPre', '심방 · '); await page.press('#calPre', 'Tab'); await page.waitForTimeout(1800);
  eq('⑫ 설정에서 앞 글자 → 이미 넣은 일정 제목도 바뀐다', evOf(ph['캘린더 일정ID']).summary, '심방 · 하하하');
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  // 캘린더에서 지움 → 계획 취소됨
  evOf(ph['캘린더 일정ID']).status = 'cancelled';
  await reload();
  eq('⑫ 캘린더에서 지움 → 계획 취소됨', prow('하하하')['상태'], '취소됨');
  // 만들다 끊긴 일정 이어 붙이기 + 두 기기가 같이 만든 여벌
  const hd = PH(), mk = o => hd.map(h => o[h] == null ? '' : o[h]);
  tab('계획').rows.push(mk({ '계획ID': 'P_cut', '성도': '거거거', '날짜': D2, '시간': '', '상태': '예정', '캘린더 일정ID': '' }));
  CAL.events.push({ id: 'evcut', status: 'confirmed', summary: '심방 · 거거거', start: { date: D2 }, end: { date: D3 }, extendedProperties: { private: { careApp: 'care', careId: 'P_cut' } } });
  tab('계획').rows.push(mk({ '계획ID': 'P_dup', '성도': '너너너', '날짜': D2, '시간': '', '상태': '예정', '캘린더 일정ID': 'evd1' }));
  CAL.events.push({ id: 'evd1', status: 'confirmed', summary: '심방 · 너너너', start: { date: D2 }, end: { date: D3 }, extendedProperties: { private: { careApp: 'care', careId: 'P_dup' } } });
  CAL.events.push({ id: 'evd2', status: 'confirmed', summary: '심방 · 너너너', start: { date: D2 }, end: { date: D3 }, extendedProperties: { private: { careApp: 'care', careId: 'P_dup' } } });
  const nIns = LOG.filter(x => x[0] === 'cal+').length;
  await reload();
  eq('⑫ 만들다 끊긴 계획 → 있던 일정을 이어 붙이고 새로 만들지 않는다', [prow('거거거')['캘린더 일정ID'], LOG.filter(x => x[0] === 'cal+').length], ['evcut', nIns]);
  eq('⑫ 같은 계획의 여벌 일정 → 계획이 가리키는 것만 남긴다', [evOf('evd1').status, evOf('evd2').status], ['confirmed', 'cancelled']);
  // 계획 → 기록
  await page.click('.pcard:has-text("거거거") [data-act="plan2rec"]'); await tidy();
  eq('⑫ 기록 쓰기 — 이름 · 날짜가 채워져 있다', [await page.inputValue('.layer [data-f="name"]'), await page.$eval('.layer [data-f="ymd"]', e => e.value).catch(() => '?')], ['거거거', D2]);
  await page.fill('.layer [data-f="text"]', '계획대로 만남');
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(2000);
  const gr = R.rows.find(r => r[2] === '거거거') || [];
  eq('⑫ 기록 저장 → 계획 기록됨 · 기록ID 이어짐 · 일정 제목에 ✓', [!!gr.length, prow('거거거')['상태'], prow('거거거')['기록ID'] === gr[9], evOf('evcut').summary], [true, '기록됨', true, '✓ 심방 · 거거거']);
  // 캘린더에만 있는 일정 → 계획으로
  CAL.events.push({ id: 'evx', status: 'confirmed', summary: '심방 · 더더더', start: { dateTime: D1 + 'T19:00:00+09:00' }, end: { dateTime: D1 + 'T20:00:00+09:00' }, htmlLink: 'https://example.invalid/evx' });
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await reload();
  await page.click('.ph-nav [data-act="tab"][data-v="plan"]'); await tidy();
  await page.click('[data-act="calimport"][data-v="evx"]'); await page.waitForTimeout(1800);
  ph = prow('더더더');
  eq("⑫ '심방' 캘린더에만 있던 일정 → 계획으로 (앞 글자 떼고 이름만) · 일정에 표식", [ph['날짜'], ph['시간'], ph['캘린더 일정ID'], evOf('evx').extendedProperties.private.careId === ph['계획ID']], [D1, '19:00', 'evx', true]);
  eq('⑫ 가져온 뒤엔 "계획으로" 단추가 사라진다 · 카드로 보인다', [await page.$$eval('[data-act="calimport"]', x => x.length), await page.$$eval('.pcard .nm', x => x.map(e => e.textContent).includes('더더더'))], [0, true]);
  // 앱에서 취소 → 일정 지움
  await page.click('.pcard:has-text("더더더") [data-act="planopen"]'); await tidy();
  await page.click('.layer [data-act="plancancel"]'); await page.waitForTimeout(1800);
  eq('⑫ 앱에서 계획 취소 → 계획 취소됨 · 일정 지움', [prow('더더더')['상태'], evOf('evx').status], ['취소됨', 'cancelled']);
  // 캘린더에 안 넣기
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="name"]', '러러러'); await page.fill('.layer [data-f="date"]', D3);
  await page.click('.layer [data-act="plancal"]');
  const nIns2 = LOG.filter(x => x[0] === 'cal+').length;
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1800);
  await reload();
  eq("⑫ 캘린더에 안 넣기 → 일정ID '없음' · 일정 안 만든다(다시 맞춰도)", [prow('러러러')['캘린더 일정ID'], LOG.filter(x => x[0] === 'cal+').length], ['없음', nIns2]);
  // (코덱스 검토 PR 977) ① 기록은 저장됐는데 계획 표시가 끊김 → 같은 기록을 두 번 만들지 않고, 다음에 '기록됨' 으로
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="name"]', '머머머'); await page.fill('.layer [data-f="date"]', D1);
  await page.click('.layer [data-act="plancal"]');
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1500);
  await page.click('.pcard:has-text("머머머") [data-act="plan2rec"]'); await tidy();
  await page.fill('.layer [data-f="text"]', '만났음');
  HOOK.failPlanSet = 9;
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(2000);
  const nMe = () => R.rows.filter(r => r[2] === '머머머').length;
  eq('⑫ 계획 표시가 끊기면 — 기록은 하나 저장 · 계획은 아직 예정 · (장치 확인) 끊김이 정말 일어남', [nMe(), prow('머머머')['상태'], HOOK.failPlanSet <= 7], [1, '예정', true]);
  HOOK.failPlanSet = 0;
  await page.click('.pcard:has-text("머머머") [data-act="plan2rec"]'); await page.waitForTimeout(1500);
  eq('⑫ 남은 계획에서 다시 \'기록 쓰기\' → 새 기록 창을 열지 않고 \'기록됨\' 으로 맞춘다', [await page.$$eval('.layer [data-act="saverec"]', x => x.length), nMe(), prow('머머머')['상태'], prow('머머머')['기록ID'] === (R.rows.find(r => r[2] === '머머머') || [])[9]], [0, 1, '기록됨', true]);
  // ② 엉뚱한 캘린더(다른 계정 것)를 보고 있으면 — 캘린더를 못 읽었으니 계획을 하나도 취소하지 않는다
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="name"]', '버버버'); await page.fill('.layer [data-f="date"]', D3);
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1800);
  await page.evaluate(() => { DATA.calId = 'calOld'; DATA.calOurs = []; });
  await reload();
  eq('⑫ 다른 캘린더를 보고 있어도 예정 계획이 취소되지 않는다', prow('버버버')['상태'], '예정');
  await page.evaluate(() => { DATA.calId = null; });
  // ③ 못 찾는 일정이 여럿이면(엉뚱한 곳을 보는 신호) 취소하지 않는다 · 하나면 취소
  const mk2 = (id, n, ev) => tab('계획').rows.push(PH().map(h => ({ '계획ID': id, '성도': n, '날짜': D3, '상태': '예정', '캘린더 일정ID': ev })[h] || ''));
  mk2('P_g1', '서서서', 'evnone1'); mk2('P_g2', '어어어', 'evnone2'); mk2('P_g3', '저저저', 'evnone3');
  await reload();
  eq('⑫ 못 찾는 일정이 셋 → 하나도 취소하지 않는다', ['서서서', '어어어', '저저저'].map(n => prow(n)['상태']), ['예정', '예정', '예정']);
  tab('계획').rows = tab('계획').rows.filter(r => !['P_g2', 'P_g3'].includes(r[0]));
  await reload();
  eq('⑫ 못 찾는 일정이 하나 → 그 계획은 취소됨', prow('서서서')['상태'], '취소됨');
  // 다시 맞춰도 아무것도 안 바뀐다
  const nCal = LOG.filter(x => /^cal/.test(x[0])).length, nSet = LOG.filter(x => x[0] === 'set').length;
  await reload();
  eq('⑫ 다시 맞춰도 캘린더 · 계획 탭을 또 고치지 않는다', [LOG.filter(x => /^cal/.test(x[0])).length, LOG.filter(x => x[0] === 'set').length], [nCal, nSet]);

  // ⑬ 할 일 → BLOCK7 할일
  await page.evaluate(() => {
    window.__inbox = []; window.__inboxFail = 0;
    window.firebase = { firestore: { FieldValue: { arrayUnion: x => ({ __u: x }) } } };
    DB = { doc: p => ({ set: async (o, m) => { if (window.__inboxFail > 0) { window.__inboxFail--; throw new Error('잠깐 끊김'); } window.__inbox.push([p, o.items.__u, m]); } }) };
  });
  const T0 = await page.evaluate(() => today());
  R.rows.push(['11/8/2026 09:00:00', +T0.slice(5, 7) + '/' + +T0.slice(8), '파파파', '셀원', '전화', '보낼 할 일이 있는 아주 사적인 기록', '', '중보, 연결', '중간', 'C950', '폼', T0]);
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await reload();
  await page.click('.ph-nav [data-act="tab"][data-v="collect"]'); await tidy();
  await page.click('[data-act="grp"][data-v="act"]'); await tidy();
  const row = k => '.kgrp:has-text("' + k + '") .todo:has-text("파파파") [data-act="b7open"]';
  await page.click(row('중보')); await tidy();
  eq('⑬ 보낼 글 — 종류 · 이름', await page.inputValue('.layer [data-f="text"]'), '중보 · 파파파');
  await page.click('.layer [data-act="b7date"]:has-text("내일")');
  await page.fill('.layer [data-f="text"]', '중보 · 파파파 (전화)');
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/b7send.png' });
  await page.click('.layer [data-act="b7send"]'); await page.waitForTimeout(1800);
  const ib = await page.evaluate(() => window.__inbox), D1s = await page.evaluate(() => ymdAdd(today(), 1));
  const nt = (ib[0] || [])[1] || {};
  eq('⑬ 쪽지함에 쪽지 한 줄 — 내 쪽지함 · 고친 글 · 내일 · sec 비움 · merge', [ib.length, (ib[0] || [])[0], nt.from, nt.text, nt.date, nt.sec, JSON.stringify((ib[0] || [])[2])], [1, 'pray/u/c/b7inbox', 'care', '중보 · 파파파 (전화)', D1s, '', '{"merge":true}']);
  eq('⑬ 쪽지에 나눈 이야기는 없다', JSON.stringify(ib).includes('사적인'), false);
  const AT = () => tab('액션').rows, aRow = (rec, t) => AT().find(r => r[1] === rec && r[3] === t) || [];
  eq("⑬ 액션 탭 — 그 할 일 줄에 'BLOCK7 할일' = 보낸 날 · 상태는 '할 일'", [aRow('C950', '중보')[9], aRow('C950', '중보')[7]], [D1s, '할 일']);
  eq('⑬ 보낸 뒤 단추에 날짜', await page.$$eval('.kgrp:has-text("중보") .todo:has-text("파파파") .b7b.sent', x => x.length), 1);
  // 쪽지함 쓰기가 실패하면 시트에 아무것도 안 적는다
  await page.evaluate(() => { window.__inboxFail = 1; });
  const nAct = AT().length;
  await page.click(row('연결')); await tidy();
  await page.click('.layer [data-act="b7send"]'); await page.waitForTimeout(1500);
  eq('⑬ 쪽지함이 끊기면 — 쪽지 없음 · 액션 탭 그대로 · 창은 열린 채', [(await page.evaluate(() => window.__inbox)).length, AT().length, await page.$$eval('.layer [data-act="b7send"]', x => x.length)], [1, nAct, 1]);
  await page.click('.layer [data-act="b7send"]'); await page.waitForTimeout(1500);
  eq("⑬ 다시 누르면 보내지고 줄이 생긴다", [(await page.evaluate(() => window.__inbox)).length, aRow('C950', '연결')[9] === await page.evaluate(() => today())], [2, true]);

  // ⑭ 기록도 '심방' 캘린더에
  const recEv = () => CAL.events.filter(e => e.status !== 'cancelled' && e.extendedProperties && e.extendedProperties.private && e.extendedProperties.private.careRec);
  const evFor = id => recEv().filter(e => e.extendedProperties.private.careRec === id);
  R.rows.push(['9/20/2026 10:00:00', '9/20', '하하옛', '셀원', '전화', '기준 날짜 앞 기록', '', '', '얕음', 'C960', '폼', '2026-09-20']);
  R.rows.push(['11/8/2026 11:00:00', '11/1', '폼사람', '셀원', '식사', '폼으로 적은 기록(기록ID 는 앱이 붙임)', '', '', '중간']);
  await reload(); await reload();
  const want = await page.evaluate(() => { const cov = new Set((DATA.plans || []).filter(p => p.recId && p.evId && p.evId !== '없음').map(p => p.recId)); return M().visits.filter(v => v.id && v.ymd >= '2026-10-01' && !v.archived && !cov.has(v.id)).map(v => [v.id, v.name, v.ymd]).sort(); });
  eq('⑭ 2026-10-01 부터의 기록마다 일정 하나 — ✓ 제목 · 그날 하루 종일', recEv().map(e => [e.extendedProperties.private.careRec, e.summary, e.start.date]).sort(), want.map(w => [w[0], '✓ 심방 · ' + w[1], w[2]]));
  eq('⑭ 폼으로 들어온 기록도 들어간다 · 기준 날짜 앞(9/20)은 안 들어간다', [want.some(w => w[1] === '폼사람'), evFor('C960').length], [true, 0]);
  const ggId = prow('거거거')['기록ID'];
  eq('⑭ 계획에서 온 기록(거거거)은 계획 일정이 있어 따로 안 만든다', [!!ggId, evFor(ggId).length], [true, 0]);
  // 기록 날짜를 고치면 일정도 · 캘린더에서 옮기면 기록 날짜로 되돌림
  const pr = R.rows.find(r => r[2] === '파파파'); pr[1] = '10/15'; pr[11] = '2026-10-15';
  evFor('C900')[0] && (evFor('C900')[0].start = { date: '2026-10-25' });
  await reload();
  eq('⑭ 기록 날짜를 고치면 일정도 그날로', evFor('C950').map(e => [e.start.date, e.end.date]), [['2026-10-15', '2026-10-16']]);
  eq('⑭ 캘린더에서 옮긴 기록 일정은 기록 날짜로 돌아온다', evFor('C900').map(e => e.start.date), ['2026-11-07']);
  // 지운 기록 → 일정 지움
  R.rows.splice(R.rows.indexOf(pr), 1);
  await reload();
  eq('⑭ 기록이 시트에서 빠지면 그 일정을 지운다', evFor('C950').length, 0);
  const nR = LOG.filter(x => /^cal/.test(x[0])).length;
  await reload();
  eq('⑭ 다시 맞춰도 캘린더를 또 고치지 않는다', LOG.filter(x => /^cal/.test(x[0])).length, nR);
  eq("⑭ 기록 일정은 '캘린더에만 있는 일정' 에 안 나온다", await page.evaluate(() => calOthers().filter(e => e.title.startsWith('✓')).length), 0);

  eq('⑦ 화면 오류 없음', errs, []);
  await b.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
