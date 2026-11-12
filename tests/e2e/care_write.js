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
//  ㉟ (1112-M) 여러 이름 — 쉼표 · Enter 로 알약 · × 와 되돌리기 · '○○ 셀' → 셀 케어 명단 / 지난 심방 명단 · 한 분씩 → 내용 칸 ◆ 줄 · 열람 · 성도 화면 · 안 바꾸면 그대로
//  ㉞ (1110-Q) 다음 심방 질문 — 붙여넣기 · 한 줄 적기 · 체크 · 지우기 → '다음 질문' 탭 한 줄 · BLOCK7 로 '이름 심방' + 하위 항목
//  ⑬ (C3b) 할 일 → BLOCK7 할일 — 쪽지함에 쪽지 한 줄(종류 · 이름 · 날짜만, 나눈 이야기 없음) · 액션 탭에 보낸 날 · 보낸 뒤 단추에 날짜 · 쪽지함 쓰기가 실패하면 시트에 아무것도 안 적는다
//  ⑭ (C3c) 기록도 '심방' 캘린더에 — 2026-10-01 부터 기록마다 ✓ 하루 종일 하나 · 계획에서 온 기록은 건너뜀 · 기록 날짜를 고치면 일정도 · 캘린더에서 옮겨도 기록 날짜로 · 지운 기록의 일정은 지움 · 다시 맞춰도 그대로
//  ⑮ (1108-A) 출석 — 처음 적을 때 출석 탭 · 한 줄 · 붙여 넣기로 여럿 · 사람 화면 출석 · 고치기는 바뀐 칸만 · 지우기는 그 한 줄 · 되돌리기 · 출석만 있는 새 이름도 성도 목록에
//  ⑯ (1108-A2) 기도노트 표시색 — 덩어리를 읽기만 · 기도노트가 붙인 색 이름 · 묶음에 이어 둔 색 · 성도 목록 · 사람 화면 · 사람 화면에서 BLOCK7 할일(쪽지만)
//  ⑰ (1108-A5) 요즘 안 보이는 분 — 성도 탭 요약에 수 · 출석 목록 맨 위에 늘 오던 분만
//  ⑱ (1108-B) 휴대폰 — 칸 글자 16(아이폰 확대 막기) · 날짜 칸 폭 · 알약은 다시 그리지 않음(스크롤 · 쓰던 칸 그대로) · 쓰는 동안 아래 단추 감춤 · 쓰는 칸을 보이는 자리로
//  ⑲ (1108-B2) 처음 열 때 시트 요청 두 번(탭 목록 + 모든 탭 한꺼번에) · 로딩 뼈대
//  ⑳ (1108-B3) 출석 입력 — 직접 적기는 접힘 · 날짜 단추 · 이름 여럿(한 줄씩) · 알약 더하기 → '출석 선택지' 탭 · 끌어 옮기기 · 오른쪽 단추 메뉴(이름 바꾸기 · 지우기) · 지난 기록은 그대로
//  ㉑ (1108-B4) 닫기 손짓 — 가장자리 밀기 · 머리줄 내려끌기 · 못 미치면 제자리 · 굴리기는 아님 · 쓰던 글은 묻는다
//  ㉒ (1108-B4) 달력 — 심방 · 출석 켜고 끄기 (둘 다 끌 수 없음 · 기억)
//  ㉓ (1108-C1) 보기 조건 시트 끌어내려 닫기 · (C2 출석 탭 · C3 이름 글자색은 ⑮ ⑯ ⑰ 에)
//  ㉔ (1109) HB 가 폼에 '장소' · '사주심/사드림' 질문을 더함 → 시트 끝에 열 → 입력 · 고치기 화면에 칸 · 알약 → 그 열에 쓴다
//  ㉚ (1109-J D) 다시 그려도 튀지 않기(바뀐 곳만 고침) · 끌어 옮기기 밀려나기 · '완료' 단추 숨은 채 남지 않기 · 알약 더하기 칸 자판 위 · 최근 이름 줄 옆으로
//  ㉘ (1109-T) 나눈 이야기 주제 칸 — 입력줄 Enter · 성도 ↔ 나 번갈아 · 이름표 바꾸기 · 줄 고치기 · 새 칸 · 칸 태그 · 붙여 넣기 · 칸 옮기기 · 합치기 · 지우기 → 시트 한 칸 글 · 다시 열면 그대로 · 안 바꾸면 안 쓴다
//  ㉙ (1109-T4 · T5) 열람 대본 · 말풍선 · 접기 · 제목만 / 설정 탭 넷(보기 · BLOCK7 · 연결 · 그 밖에) · 마지막 탭 기억 / 성도 화면 칸 태그로 모아 보기
//  ㉛ (1109-G1) 목록 자세히(날짜 기둥) / 간략히(한 줄) · 이 기기에 기억
//  ㉜ (1109-G2) 새 기록 — 넓은 화면 카드(A) · 폰 접힌 줄(C) · 폭 넘나들면 다시 그림 · 폰에서 적은 것이 시트에
//  ㊱ (1112-N) 시험 시트(이 기기만 · 캘린더 · BLOCK7 꺼짐) · 새 칸 더하기(오른쪽 끝 · 액션 K · 새 탭 둘) · 핵심 한줄 · 상세 기록 · 우선순위 · 정보 성격 · 장기 관찰 · 다음 질문(탭) · 이름 후보에 기도노트
//  ㊲ (1112-N 2·3·4) 붙여넣어 채우기 — JSON(통화 · 셀모임) · 규격 오류 · 속성 대조 · 성도 연결(후보 여럿 · 이름 고치기 · 새 성도) · 언급만 · 할 일 체크 → 액션 탭 · 미채택은 상세 기록 끝 · 모임 탭 · 중복(원본ID · 해시 · 갱신) · Markdown · 저장 중 끊김 → 다시 시도
//  ㊳ (1112-N 5) AI 입력대기함 — 탭에 넣은 줄 → 첫 화면 'N건' · 규격 오류는 '오류' + 사유 · 접수ID 붙임 · 열기 → 같은 미리보기 · 저장 → 다시 읽어 확인 뒤 '완료' + 기록ID · 빼기 → '취소' · ChatGPT 지시문 복사
//  ⑧ 지우기 → 휴지통 탭에 원래 줄 · 응답 탭에서 그 한 줄만 빠진다 · 되돌리기 · 휴지통에서 되살리기 · 완전히 지우기
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', '..', 'care', 'index.html');

let pass = 0, fail = 0;
const J0 = v => JSON.stringify(v);
// 1109-T 나눈 이야기는 주제 칸의 입력줄로 넣는다 — [[누가(s 성도 · m 나 · n 메모), 글], …]
// 1109-T5 설정은 탭 넷 — 그 탭을 먼저 누른다(넘기는 움직임 0.45초)
const stab = async (pg, name) => { await pg.click('.layer:last-child [data-act="stab"]:text-is("' + name + '")'); await pg.waitForTimeout(500); };
const talk = async (pg, lines, scope) => { scope = scope || '.layer:last-child'; for (const [w, t] of lines) { await pg.click(scope + ' [data-act="tkw"][data-v="' + w + '"]'); await pg.fill(scope + ' [data-f="tk:in"]', t); await pg.click(scope + ' [data-act="tkadd"]'); } };
// 1109-G2 심방 입력은 '+ 더하기' 하나 → 누르면 '알약으로 더하기 · 이번 기록에만'. 그 둘을 꺼내 둔다
const plus = async (pg, scope, k) => { if (await pg.$(scope + ' [data-act="aplus"][data-k="' + k + '"]')) { await pg.click(scope + ' [data-act="aplus"][data-k="' + k + '"]'); await pg.waitForTimeout(150); } };
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); } };

// ── 가짜 시트 ──
const HEAD = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이'];
const ROWS = [
  ['11/6/2026 10:40:51', '10/31', '가나다', '장년부', '지나가다 대화', '첫 이야기', '신앙, 교회', '중보, 보고', '깊음'],
  ['11/6/2026 10:37:06', '11/4', '라마바', '청년부', '식사', '학교 이야기', '학교', '중보', '중간'],
  ['5/21/2020 10:37:02', '5/21', '사아자', '두나미스', '보고 차카타', '옛 기록', '', '', ''],
];
const SHEET = { tabs: [{ id: 0, title: 'Form Responses 1', cols: 26, rows: [HEAD.slice()].concat(ROWS.map(r => r.slice())) }] };
const LOG = [], REQ = { sheets: 0 };
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
  if (u.host.endsWith('supabase.co')) {   // 1109-E3 가짜 셀 케어 — 지어낸 이름 · 읽기만 받는다
    if (m !== 'GET' && !u.pathname.startsWith('/rest/v1/rpc/')) { LOG.push(['cc-write', u.pathname]); return r.fulfill({ status: 403, body: '{}' }); }
    LOG.push(['cc', u.pathname.replace('/rest/v1/', '')]);
    if (u.pathname.endsWith('/rpc/get_my_context')) return json({ profile: { id: 'me' }, this_week: '2026-11-08', today: '2026-11-09' });
    if (u.pathname.endsWith('/rpc/get_week_status')) return json([{ cell_id: 'c1', cell_name: '하늘셀', leader_names: '가리더', review_mode: 'leadership', responsible_leadership_id: 'me' }, { cell_id: 'c2', cell_name: '나무셀', leader_names: '나리더', i_am_leader: true }, { cell_id: 'c9', cell_name: '남의셀', review_mode: 'leadership' }]);
    if (u.pathname.endsWith('/leadership_assignments')) return json([]);
    if (u.pathname.endsWith('/cell_members')) return json([{ cell_id: 'c1', name: '셀원하나', active: true }, { cell_id: 'c1', name: '셀원둘' }, { cell_id: 'c2', name: '셀원셋' }, { cell_id: 'c1', name: '쉬는분', active: false }]);
    return r.fulfill({ status: 404, body: '[]' });
  }
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
    REQ.cal = (REQ.cal || 0) + 1;
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
  REQ.sheets++;
  if (p === '/values:batchGet') return json({ valueRanges: u.searchParams.getAll('ranges').map(x => { const R = parseRange(encodeURIComponent(x)), T = tab(R.title); return { range: x, values: T ? trim(T.rows) : [] }; }) });
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
    body.data.forEach(d => { const R = parseRange(d.range); d.values.forEach((row, ri) => row.forEach((v, i) => setCell(R.title, R.row + ri, R.col + i, v))); LOG.push(['set', d.range, d.values[0]]); });
    return json({});
  }
  let mm;
  if ((mm = p.match(/^\/values\/(.+):clear$/))) { const m2 = decodeURIComponent(mm[1]).match(/^'((?:[^']|'')*)'!A(\d+):B$/), T = tab(m2[1]); for (let i = +m2[2] - 1; i < T.rows.length; i++) { if (T.rows[i]) { T.rows[i][0] = ''; T.rows[i][1] = ''; } } LOG.push(['clear', m2[1], +m2[2]]); return json({}); }
  if ((mm = p.match(/^\/values\/(.+):append$/))) { const R = parseRange(mm[1]);
    if (HOOK.failAppend && R.title === HOOK.failAppend) { HOOK.failAppend = ''; return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"message":"잠깐 끊김"}}' }); }
    body.values.forEach(v => { tab(R.title).rows.push(v.slice()); LOG.push(['append', R.title, v]); }); return json({}); }
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
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 760, height: 900 }, timezoneId: 'Asia/Seoul' });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  eq('⑲ 여는 동안엔 화면 뼈대 + 단계 막대', await page.evaluate(() => { AUTH_READY = true; USER = { uid: 'u' }; G.checked = false; render(); const r = [!!document.querySelector('.sk .sk-card'), !!document.querySelector('.sk .sk-bar b')]; USER = null; return r; }), [true, true]);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }); googleStatus(); });
  await page.waitForSelector('.card');
  eq('⑲ (1108-B2) 처음 열 때 시트에 묻는 것은 두 번 — 탭 목록 · 모든 탭 한꺼번에', REQ.sheets, 2);
  const formRowsBefore = JSON.stringify(ROWS);
  const tidy = () => page.waitForTimeout(500);

  // ①② 새 기록
  await page.click('[data-act="addrec"]'); await tidy();
  await page.fill('[data-f="nameq"]', '새사람');
  await talk(page, [['s', '새로 적은 이야기'], ['m', '둘째 줄']]);
  await page.click('.layer [data-act="fone"][data-k="method"][data-v="카톡, 문자"]');
  await page.click('.layer [data-act="fone"][data-k="depth"][data-v="깊음"]');
  await page.click('.layer [data-act="ftog"][data-k="tags"][data-v="학교"]');
  await page.click('.layer [data-act="ftog"][data-k="acts"][data-v="중보"]');
  await plus(page, '.layer:last-child', 'acts'); await page.click('.layer [data-act="aetc"][data-k="acts"]'); await page.waitForTimeout(150);   // 1109-E1 직접 적기는 접혀 있다 · G2 '+ 더하기' 안에
  await page.fill('[data-f="actsEtc"]', '병문안 가기');
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/edit.png', fullPage: false });
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(1200);
  const R = tab('Form Responses 1'), H = R.rows[0];
  eq('① 앱 열 여섯이 마지막 머리글 뒤에', H.slice(9, 15), ['기록ID', '출처', '심방일', '수정', '확인', '보관']);
  eq('① 탭 다섯', SHEET.tabs.map(t => t.title), ['Form Responses 1', '성도', '액션', '덧붙임', '계획', '속성']);
  eq('① 있던 줄마다 기록ID · 출처 폼 · 심방일 (연도 붙여)', R.rows.slice(1, 4).map(r => [!!r[9], r[10], r[11]]), [[true, '폼', '2026-10-31'], [true, '폼', '2026-11-04'], [true, '폼', '2020-05-21']]);
  const nr = R.rows[4] || [];
  eq('② 새 줄 — 이름 · 방식 · 이야기 · 태그 · 할 일(기타 끝에) · 깊이 · 출처 앱', [nr[2], nr[4], nr[5], nr[6], nr[7], nr[8], nr[10]], ['새사람', '카톡, 문자', '성도: 새로 적은 이야기\n나: 둘째 줄', '학교', '중보, 병문안 가기', '깊음', '앱']);
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
  eq('⑧ 휴지통 탭에 기록ID · 이름 · 원래 줄', [T()[0][0], T()[1][0] === vid, T()[1][1], JSON.parse(T()[1][5])['내용']], ['기록ID', true, '새사람', '성도: 새로 적은 이야기\n나: 둘째 줄']);
  eq('⑧ 목록에서 사라졌다', await page.$$eval('.card .nm', x => x.map(e => e.textContent).includes('새사람')), false);
  await page.click('.toast-act'); await page.waitForTimeout(1200);
  const back = R.rows.find(r => r[9] === vid);
  eq('⑧ 되돌리기 → 같은 기록ID · 같은 칸으로 돌아오고 휴지통은 비었다', [JSON.stringify(back) === JSON.stringify(victim), T().length], [true, 1]);
  await del();
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, '그 밖에');
  await page.click('.layer [data-act="trash"]'); await page.waitForTimeout(900);
  eq('⑧ 설정 › 휴지통에 보인다', await page.$$eval('.layer .trow b', x => x.map(e => e.textContent)), ['새사람']);
  await page.click('.layer [data-act="trestore"]'); await page.waitForTimeout(1200);
  eq('⑧ 휴지통에서 되살리기 → 돌아오고 휴지통 비움', [!!R.rows.find(r => r[9] === vid), T().length], [true, 1]);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  await del();
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, '그 밖에');
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
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, '연결');
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
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, '연결');
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
  await page.fill('.layer [data-f="nameq"]', '하하하');
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
  await page.click('[data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, 'BLOCK7');
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
  eq('⑫ 기록 쓰기 — 이름 · 날짜가 채워져 있다', [await page.evaluate(() => topLayer().form.name), await page.$eval('.layer [data-f="ymd"]', e => e.value).catch(() => '?')], ['거거거', D2]);
  await talk(page, [['n', '계획대로 만남']]);
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
  await page.fill('.layer [data-f="nameq"]', '러러러'); await page.fill('.layer [data-f="date"]', D3);
  await page.click('.layer [data-act="plancal"]');
  const nIns2 = LOG.filter(x => x[0] === 'cal+').length;
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1800);
  await reload();
  eq("⑫ 캘린더에 안 넣기 → 일정ID '없음' · 일정 안 만든다(다시 맞춰도)", [prow('러러러')['캘린더 일정ID'], LOG.filter(x => x[0] === 'cal+').length], ['없음', nIns2]);
  // (코덱스 검토 PR 977) ① 기록은 저장됐는데 계획 표시가 끊김 → 같은 기록을 두 번 만들지 않고, 다음에 '기록됨' 으로
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="nameq"]', '머머머'); await page.fill('.layer [data-f="date"]', D1);
  await page.click('.layer [data-act="plancal"]');
  await page.click('.layer [data-act="saveplan"]'); await page.waitForTimeout(1500);
  await page.click('.pcard:has-text("머머머") [data-act="plan2rec"]'); await tidy();
  await talk(page, [['n', '만났음']]);
  HOOK.failPlanSet = 9;
  await page.click('[data-act="saverec"]'); await page.waitForTimeout(2000);
  const nMe = () => R.rows.filter(r => r[2] === '머머머').length;
  eq('⑫ 계획 표시가 끊기면 — 기록은 하나 저장 · 계획은 아직 예정 · (장치 확인) 끊김이 정말 일어남', [nMe(), prow('머머머')['상태'], HOOK.failPlanSet <= 7], [1, '예정', true]);
  HOOK.failPlanSet = 0;
  await page.click('.pcard:has-text("머머머") [data-act="plan2rec"]'); await page.waitForTimeout(1500);
  eq('⑫ 남은 계획에서 다시 \'기록 쓰기\' → 새 기록 창을 열지 않고 \'기록됨\' 으로 맞춘다', [await page.$$eval('.layer [data-act="saverec"]', x => x.length), nMe(), prow('머머머')['상태'], prow('머머머')['기록ID'] === (R.rows.find(r => r[2] === '머머머') || [])[9]], [0, 1, '기록됨', true]);
  // ② 엉뚱한 캘린더(다른 계정 것)를 보고 있으면 — 캘린더를 못 읽었으니 계획을 하나도 취소하지 않는다
  await page.click('.fab[data-act="addplan"]'); await tidy();
  await page.fill('.layer [data-f="nameq"]', '버버버'); await page.fill('.layer [data-f="date"]', D3);
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
  // (코덱스 검토 PR 983) 예전에 고른 다른 시트의 기록 일정은 지우지 않는다
  CAL.events.push({ id: 'evOther', status: 'confirmed', summary: '✓ 심방 · 다른시트', start: { date: '2026-10-20' }, end: { date: '2026-10-21' }, extendedProperties: { private: { careApp: 'care', careRec: 'CZ1', careSheet: 'S_OTHER' } } });
  await reload();
  eq('⑭ 다른 시트의 기록 일정은 그대로 · 이 시트 일정엔 시트 표시', [evOf('evOther').status, recEv().filter(e => e.id !== 'evOther').every(e => e.extendedProperties.private.careSheet === 'S')], ['confirmed', true]);
  const nR = LOG.filter(x => /^cal/.test(x[0])).length;
  await reload();
  eq('⑭ 다시 맞춰도 캘린더를 또 고치지 않는다', LOG.filter(x => /^cal/.test(x[0])).length, nR);
  eq("⑭ 기록 일정은 '캘린더에만 있는 일정' 에 안 나온다", await page.evaluate(() => calOthers().filter(e => e.title.startsWith('✓')).length), 0);

  // ⑮ 출석 (1108-A)
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  eq('⑮ (1108-C2) 아래 탭 차례 — 심방 · 출석 · 성도 · 달력 · 계획 · 한눈에', await page.$$eval('.ph-nav button', x => x.map(e => e.textContent)), ['심방', '출석', '성도', '달력', '계획', '한눈에']);
  await page.click('.ph-nav [data-act="tab"][data-v="people"]'); await page.waitForTimeout(700);
  eq('⑮ (1108-C2) 성도 탭에는 출석 요약 칸이 없고 단추는 + 기록', [await page.$$eval('.attsum', x => x.length), await page.$$eval('.fab[data-act="addrec"]', x => x.length)], [0, 1]);
  await page.click('.ph-nav [data-act="tab"][data-v="attend"]'); await page.waitForTimeout(700);
  eq('⑮ 출석 탭 단추는 + 출석', await page.$$eval('.fab[data-act="attadd"]', x => x.length), 1);
  await page.click('.fab[data-act="attadd"]'); await tidy();
  await page.fill('.layer [data-f="name"]', '새손님');
  await page.click('.layer [data-act="aone"][data-k="svc"][data-v="개인 기도"]');
  await page.click('.layer [data-act="aetc"][data-k="seat"]'); await page.waitForTimeout(200);
  await page.fill('.layer [data-f="seat"]', '기도실');
  await page.click('[data-act="attsave"]'); await page.waitForTimeout(1500);
  const AT_ = () => tab('출석').rows, tH = () => AT_()[0], tc = (r, k) => r[tH().indexOf(k)];
  const todayK = await page.evaluate(() => today());
  eq("⑮ 처음 적으면 '출석' 탭 + 머리글", tab('출석') ? tH() : null, ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '메모', '적은 시각']);
  eq('⑮ 한 줄 — 이름 · 예배 · 모임 · 자리 · 날짜(오늘) · 출석ID', AT_().slice(1).map(r => [tc(r, '성도'), tc(r, '예배 · 모임'), tc(r, '자리'), tc(r, '날짜') === todayK, /^T/.test(tc(r, '출석ID'))]), [['새손님', '개인 기도', '기도실', true, true]]);
  eq('⑮ (시험 준비) 머머머는 심방 기록이 있는 분', await page.evaluate(() => !!M().people['머머머']), true);
  await page.click('.ph-head [data-act="attpaste"]'); await tidy();
  await page.fill('.layer:last-child [data-f="paste"]', ['기록', '', '머머머', '11/8', '주일3부', '처음부터 참석', '맨 앞 자리', '끝까지 참석', '', '타파하', '11/8', '라이프라인', '헌금부터 참석', '음향부스 뒷자리', '(기도 때 일찍 나감?)', '남편과 함께', '다음 주도 오신다 함'].join('\n'));
  await tidy();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/att_paste.png' });
  eq('⑮ 붙여 넣기 미리 보기 — 두 분 · 머리말은 건너뜀', await page.$eval('#attPrev .h-sec small', e => e.textContent), '2명 · 건너뜀 1');
  await page.click('[data-act="attpastesave"]'); await page.waitForTimeout(1500);
  const byN = n => AT_().slice(1).find(r => tc(r, '성도') === n) || [];
  eq('⑮ 붙여 넣기 → 칸마다 나뉘어 적힌다', ['머머머', '타파하'].map(n => { const r = byN(n); return [tc(r, '날짜'), tc(r, '예배 · 모임'), tc(r, '언제 왔나'), tc(r, '언제 갔나'), tc(r, '자리'), tc(r, '함께'), tc(r, '메모')]; }),
    [['2026-11-08', '주일 3부', '처음부터', '끝까지', '맨 앞 자리', '', ''], ['2026-11-08', '라이프라인', '헌금부터', '기도 때 일찍 나감?', '음향부스 뒷자리', '남편', '다음 주도 오신다 함']]);
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  eq('⑮ 출석 탭에 적은 출석이 날짜별로', await page.$$eval('#app .tl .planbadge.att', x => x.length) >= 3, true);
  await page.click('.ph-nav [data-act="tab"][data-v="people"]'); await page.waitForTimeout(700);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/att_people.png', fullPage: true });
  eq('⑮ 출석만 있는 새 이름(새손님 · 타파하)도 성도 목록에 — 심방 기록 있는 머머머는 원래 목록', (await page.$$eval('.prow .nm', x => x.map(e => e.textContent))).filter(n => ['새손님', '타파하', '머머머'].includes(n)).sort(), ['머머머', '새손님', '타파하']);
  eq('⑮ 출석만 적은 분 칸 — 새손님 · 타파하 (심방 기록 있는 머머머는 아님)', await page.evaluate(() => attendOnlyPeople(AT(), Object.keys(M().people)).map(x => x.name).sort()), ['새손님', '타파하']);
  // 1108-C 고침: 심방 기록이 모두 보관된 분도 출석이 있으면 '출석만 적은 분' 칸에 (예전엔 어디에도 안 나왔다)
  { const r = await page.evaluate(() => {
      const vs = M().visits.filter(v => v.name === '머머머'), was = vs.map(v => v.archived); vs.forEach(v => { v.archived = true; }); render();
      const rows = [...document.querySelectorAll('.prow')].filter(e => e.querySelector('.nm').textContent === '머머머').map(e => e.querySelector('.roles').textContent);
      vs.forEach((v, i) => { v.archived = was[i]; }); render(); return rows; });
    eq('⑮ (1108-C) 심방 기록이 모두 보관된 분도 출석이 있으면 성도 탭에 — 한 번만 · 보관됨 표시', r, ['지난 심방은 보관됨']); }
  await page.click('.prow:has-text("머머머")'); await tidy();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/att_person.png', fullPage: true });
  eq('⑮ 사람 화면에 출석', await page.$$eval('.layer:last-child .tl .planbadge.att', x => x.map(e => e.textContent)), ['주일 3부']);
  await page.click('.layer:last-child [data-act="attopen"]'); await tidy();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/att_edit.png', fullPage: true });
  if (!(await page.$('.layer:last-child [data-f="seat"]'))) { await page.click('.layer:last-child [data-act="aetc"][data-k="seat"]'); await page.waitForTimeout(200); }
  await page.fill('.layer:last-child [data-f="seat"]', '둘째 줄');
  const n5 = LOG.length;
  await page.click('[data-act="attsave"]'); await page.waitForTimeout(1500);
  eq('⑮ 고치기 — 자리 칸 하나만 쓴다', LOG.slice(n5).filter(x => x[0] === 'set').map(x => decodeURIComponent(x[1]).replace(/\d+$/, '') + '=' + x[2][0]), ["'출석'!H=둘째 줄"]);
  const nRows = AT_().length;
  await page.click('.layer:last-child [data-act="attopen"]'); await tidy();
  await page.click('.layer:last-child [data-act="attdel"]'); await page.waitForTimeout(1500);
  eq('⑮ 지우기 — 그 한 줄만 빠진다', [AT_().length, !!byN('머머머').length, !!byN('타파하').length], [nRows - 1, false, true]);
  await page.click('.toast-act'); await page.waitForTimeout(1500);
  eq('⑮ 되돌리기 — 같은 출석ID 로 돌아온다', [AT_().length, tc(byN('머머머'), '자리')], [nRows, '둘째 줄']);

  // ⑯ 기도노트 표시색 (1108-A2) — pray/{uid} 덩어리를 읽기만 한다
  await page.evaluate(() => {
    const pdb = { T: [{ id: 'p1', kind: 'person', name: '머머머', mark: 'yellow' }, { id: 'p2', kind: 'person', name: '새 손님', mark: '' }, { id: 'p3', kind: 'person', name: '기도만', mark: 'gray' }],
      G: [{ id: 'g1', name: '새가족반', lines: [{ segs: [['p2']] }] }], marks: { yellow: '이슈', orange: '난해' }, markLinks: { red: { t: 'group', id: 'g1' }, orange: { t: 'group', id: 'g1' } } };
    const s = JSON.stringify(pdb), half = Math.ceil(s.length / 2), parts = [s.slice(0, half), s.slice(half)];
    window.__prayReads = 0; window.__prayWrites = 0;
    const old = DB;
    DB = { doc: p => {
      if (p === 'pray/u') return { get: async () => { window.__prayReads++; return { exists: true, data: () => ({ wid: 'W1', n: 2 }) }; }, set: async () => { window.__prayWrites++; },
        collection: () => ({ doc: i => ({ get: async () => ({ exists: true, data: () => ({ wid: 'W1', s: parts[+i] }) }) }) }) };
      return old.doc(p);
    } };
  });
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => loadPray(true)); await page.waitForTimeout(600);
  const pmOf = n => page.evaluate(n => { const x = DATA.pray.idx[nameKey(n)]; return x ? [x.m, x.label] : null; }, n);
  eq('⑯ 사람 표시색 · 기도노트가 붙인 이름 (노랑 = 이슈)', await pmOf('머머머'), ['yellow', '이슈']);
  eq('⑯ 묶음에 이어 둔 색(주황 = 난해) — 빨강은 이어 두기를 받지 않는다(기도노트 규칙) · 띄어쓰기 무시(새 손님 = 새손님)', await pmOf('새손님'), ['orange', '난해']);
  eq('⑯ 회색은 뜻이 고정(쉬는 분)', await pmOf('기도만'), ['gray', '쉬는 분']);
  const hueRows = () => page.$$eval('.prow', x => x.filter(e => /머머머|새손님/.test(e.querySelector('.nm').textContent)).map(e => { const c = e.querySelector('.nm .hue-ic'); return e.querySelector('.nm').textContent + ':' + (c ? c.getAttribute('style') : ''); })).then(a => a.sort());
  eq('⑯ (1108-C3) 성도 목록 — 이름 글자가 표시색 · 색점 · 색 이름 글자는 없다', [await hueRows(), await page.$$eval('.pm', x => x.length)], [['머머머:--hc:var(--mk-yellow)', '새손님:--hc:var(--mk-orange)'], 0]);
  await page.click('.ph-head [data-act="layer"][data-v="settings"]'); await tidy(); await stab(page, '보기');
  await page.click('.layer:last-child [data-act="hueinfo"]'); await tidy();
  eq('⑯ (1108-C3) 설정 i — 표시색 설명(기도노트 이름 · 몇 분, 회색은 뺌)', await page.$$eval('.layer:last-child .hue-leg div', x => x.map(e => e.textContent)), ['난해1분', '이슈1분']);
  await page.click('.layer:last-child [data-act="hue"]'); await tidy();
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  eq('⑯ (1108-C3) 색 단추로 끄면 이름이 그냥 글자', await hueRows(), ['머머머:', '새손님:']);
  await page.evaluate(() => { hueSet(true); render(); });
  eq('⑯ 기도노트에는 아무것도 쓰지 않는다', await page.evaluate(() => window.__prayWrites), 0);
  // 사람 화면 → BLOCK7 할일로 (쪽지만, 시트에는 안 씀)
  await page.click('.prow:has-text("머머머")'); await tidy();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/pray_person.png', fullPage: true });
  eq('⑯ 사람 화면 이름이 표시색', await page.$eval('.layer:last-child .dt-name .hue-ic', e => e.textContent), '머머머');
  const nIn = (await page.evaluate(() => window.__inbox)).length, nLog = LOG.length;
  await page.click('.layer:last-child [data-act="b7person"]'); await tidy();
  await page.click('.layer:last-child [data-act="b7send"]'); await page.waitForTimeout(1200);
  eq('⑯ 사람 화면에서 BLOCK7 할일로 — 쪽지 하나 · 시트에는 안 씀', [(await page.evaluate(() => window.__inbox)).length - nIn, LOG.slice(nLog).filter(x => x[0] !== 'struct' && !/^cal/.test(x[0])).length], [1, 0]);

  // ⑰ 요즘 안 보이는 분 (1108-A5)
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  { const h = tab('출석').rows[0], row = (id, n, d) => h.map(k => ({ '출석ID': id, '성도': n, '날짜': d, '예배 · 모임': '주일 1부' })[k] || '');
    tab('출석').rows.push(row('TQ1', '뜸한분', '2026-09-20'), row('TQ2', '뜸한분', '2026-10-04'), row('TQ3', '한번분', '2026-09-20')); }
  await reload();
  await page.click('.ph-nav [data-act="tab"][data-v="attend"]'); await page.waitForTimeout(700);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/att_quiet.png' });
  eq('⑰ 출석 목록 맨 위에 — 늘 오던 분만(한 번 온 분은 아님)', await page.$$eval('#app .todo .lab', x => x.map(e => e.childNodes[0].textContent)), ['뜸한분']);

  // ⑱ (1108-B) 휴대폰 — 확대 · 밀림 · 튐 · 자판 가림
  {
    const { devices } = require('playwright');
    const mc = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'Asia/Seoul', viewport: { width: 375, height: 520 } }));
    const mp = await mc.newPage(); mp.on('pageerror', e => errs.push('폰: ' + e.message)); mp.on('dialog', d => d.accept());
    await mp.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
    await mp.addInitScript(() => { const mm = matchMedia; matchMedia = q => (q.includes('reduce') ? { matches: true, addEventListener() {}, addListener() {} } : mm.call(window, q)); });
    await mp.goto(FILE); await mp.waitForTimeout(400);
    await mp.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }); googleStatus(); });
    await mp.waitForSelector('.card');
    await mp.evaluate(() => openEdit(null)); await mp.waitForTimeout(500);
    const fs16 = await mp.$$eval('.layer:last-child .inp', x => x.map(e => parseFloat(getComputedStyle(e).fontSize)).filter(n => n < 16).length);
    eq('⑱ 휴대폰에선 입력 칸 글자가 모두 16 이상 (아이폰이 칸을 누를 때 확대하지 않게)', fs16, 0);
    eq('⑱ 날짜 칸이 칸 폭을 넘지 않는다 · 화면이 옆으로 넓어지지 않는다', await mp.evaluate(() => { const d = document.querySelector('.layer:last-child input[type=date]'), p = d.parentElement.getBoundingClientRect(), r = d.getBoundingClientRect(); return r.right <= p.right + 1 && document.documentElement.scrollWidth <= innerWidth; }), true);
    // 알약을 눌러도 화면을 다시 그리지 않는다 — 스크롤 · 쓰던 칸 그대로
    const lay = '.layer:last-child';
    await mp.evaluate(q => { document.querySelector(q + ' [data-act="crow"][data-k="roles"]').click(); document.querySelector(q + ' [data-act="aplus"][data-k="roles"]').click(); document.querySelector(q + ' [data-act="aetc"][data-k="roles"]').click(); }, lay); await mp.waitForTimeout(400);   // G2 폰은 고르는 칸이 접힌 줄
    await mp.evaluate(l => { document.querySelector(l).scrollTop = 260; }, lay);
    await mp.focus(lay + ' [data-f="rolesEtc"]'); await mp.waitForTimeout(500);
    const before = await mp.evaluate(l => { const L = document.querySelector(l); window.__inp = document.activeElement; return L.scrollTop; }, lay);
    await mp.evaluate(q => document.querySelector(q).click(), lay + ' [data-act="ftog"][data-k="tags"][data-v="학교"]');   // (tap 은 Playwright 가 먼저 굴려 보여 주므로 쓰지 않는다) await mp.waitForTimeout(200);
    await mp.evaluate(q => document.querySelector(q).click(), lay + ' [data-act="fone"][data-k="depth"][data-v="깊음"]');   // (tap 은 Playwright 가 먼저 굴려 보여 주므로 쓰지 않는다) await mp.waitForTimeout(200);
    const after = await mp.evaluate(l => { const L = document.querySelector(l); return { st: L.scrollTop, same: document.querySelector(l + ' [data-f="rolesEtc"]') === window.__inp, form: [topLayer().form.tags.slice(), topLayer().form.depth], pressed: [...document.querySelectorAll(l + ' [aria-pressed="true"]:not([data-act="adate"]):not([data-act="aetc"]):not([data-act="aplus"]):not([data-act="tkw"])')].map(x => x.dataset.v) }; }, lay);
    eq('⑱ 알약을 눌러도 스크롤이 그대로 · 쓰던 칸이 새로 만들어지지 않는다', [after.st === before, after.same], [true, true]);
    eq('⑱ 알약 값은 그대로 들어가고 눌린 모양도 맞다', [after.form, after.pressed.sort()], [[['학교'], '깊음'], ['깊음', '학교']]);
    // 이름 후보를 고르는 것처럼 다시 그려야 할 때도 스크롤 자리는 그대로
    await mp.evaluate(l => { document.querySelector(l).scrollTop = 120; render(); }, lay);
    eq('⑱ 다시 그려도 겹 화면 스크롤 자리 그대로', await mp.evaluate(l => document.querySelector(l).scrollTop, lay), 120);
    // 자판: 쓰는 동안 아래 단추를 감추고, 쓰는 칸을 보이는 자리로
    await mp.evaluate(l => { document.querySelector(l).scrollTop = 0; }, lay);
    await mp.focus(lay + ' [data-f="tk:in"]'); await mp.waitForTimeout(800);
    const kb = await mp.evaluate(l => { const f = document.querySelector(l + ' .ph-foot'), t = document.querySelector(l + ' [data-f="tk:in"]').getBoundingClientRect(); return { typing: document.body.classList.contains('typing'), foot: getComputedStyle(f).display, inView: t.top >= 0 && t.top < innerHeight - 40 }; }, lay);
    eq("⑱ 글을 쓰는 동안 '시트에 적기' 단추를 감추고 · 쓰는 칸이 화면 안으로 올라온다", [kb.typing, kb.foot, kb.inView], [true, 'none', true]);
    await mp.evaluate(() => document.activeElement.blur()); await mp.waitForTimeout(400);
    eq('⑱ 다 쓰면(자판 닫힘) 단추가 돌아온다', await mp.evaluate(l => getComputedStyle(document.querySelector(l + ' .ph-foot')).display, lay), 'block');
    if (process.env.SHOT) await mp.screenshot({ path: process.env.SHOT + '/b1_phone.png' });
    // ㉑ (1108-B4) 겹 화면 닫기 손짓 — 왼쪽 가장자리 밀기 · 머리줄 내려끌기 · 못 미치면 제자리
    const swipe = (x0, y0, x1, y1, ms) => mp.evaluate(([x0, y0, x1, y1, ms]) => new Promise(res => {
      const el = document.elementFromPoint(x0, y0), T = (x, y) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [T(x0, y0)], changedTouches: [T(x0, y0)], bubbles: true, cancelable: true }));
      let i = 0; const n = 8, step = () => { i++; const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        document.dispatchEvent(new TouchEvent('touchmove', { touches: [T(x, y)], changedTouches: [T(x, y)], bubbles: true, cancelable: true }));
        if (i < n) setTimeout(step, ms / n); else { document.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [T(x, y)], bubbles: true, cancelable: true })); setTimeout(res, 450); } };
      setTimeout(step, ms / n);
    }), [x0, y0, x1, y1, ms]);
    const nLay = () => mp.evaluate(() => S.layers.length);
    await mp.evaluate(() => { S.layers = []; render(); openLayer('person', { name: '머머머' }); }); await mp.waitForTimeout(500);
    await swipe(10, 300, 60, 302, 500);
    eq('㉑ 가장자리에서 조금만 밀면 제자리 (닫히지 않음 · 판도 제자리)', [await nLay(), await mp.evaluate(() => document.querySelector('#layers > .layer').style.transform)], [1, '']);
    await swipe(10, 300, 260, 305, 400);
    eq('㉑ 왼쪽 가장자리에서 ¼ 넘게 밀면 닫힌다', await nLay(), 0);
    await mp.evaluate(() => openLayer('person', { name: '머머머' })); await mp.waitForTimeout(500);
    await swipe(200, 30, 200, 200, 300);
    eq('㉑ 맨 위에서 머리줄을 ¼ 넘게 내려 끌면 닫힌다', await nLay(), 0);
    await mp.evaluate(() => openLayer('person', { name: '머머머' })); await mp.waitForTimeout(500);
    await swipe(200, 300, 200, 500, 500);
    eq('㉑ 머리줄이 아닌 곳을 끌면(굴리기) 닫히지 않는다', await nLay(), 1);
    await mp.evaluate(() => { openAttEdit(null); topLayer().form.memo = 'x'; topLayer().dirty = true; window.confirm = () => false; }); await mp.waitForTimeout(500);
    await swipe(10, 300, 300, 300, 400);
    eq('㉑ 쓰던 글이 있으면 묻고, 버리지 않으면 그대로', await nLay(), 2);
    // ㉓ (1108-C1) 보기 조건(필터) 시트 — 손잡이를 잡아 끌어내리면 닫힌다
    await mp.evaluate(() => { window.confirm = () => true; S.layers = []; S.view = 'list'; S.sheet = true; render(); }); await mp.waitForTimeout(500);
    const grab = async () => mp.evaluate(() => { const r = document.querySelector('.sheet .grab').getBoundingClientRect(); return [r.left + r.width / 2, r.top + 2]; });
    let g = await grab();
    await swipe(g[0], g[1], g[0], g[1] + 25, 500);
    eq('㉓ 손잡이를 조금만 내리면 제자리 (열린 채 · 판도 제자리)', [await mp.evaluate(() => S.sheet), await mp.evaluate(() => document.querySelector('.sheet').style.transform)], [true, '']);
    g = await grab();
    await swipe(g[0], g[1], g[0], g[1] + 260, 400);
    eq('㉓ 손잡이를 ¼ 넘게 끌어내리면 닫힌다', [await mp.evaluate(() => S.sheet), await mp.$$eval('.sheet', x => x.length)], [false, 0]);
    await mp.evaluate(() => { S.sheet = true; render(); }); await mp.waitForTimeout(400);
    g = await grab();
    await swipe(g[0] + 80, g[1] + 120, g[0] + 80, g[1] - 40, 400);
    eq('㉓ 안쪽을 위로 굴리는 것은 닫기가 아니다', await mp.evaluate(() => S.sheet), true);
    // ㉚ (1109-J D) 다시 그려도 튀지 않기 · 끌어 옮기기 밀려나기 · '완료' 단추가 숨은 채 남지 않기 · 알약 더하기 칸은 자판 바로 위 · 최근 이름 줄 옆으로
    await mp.evaluate(() => { S.sheet = false; S.layers = []; render(); openAttEdit(null); }); await mp.waitForTimeout(500);
    const AL = '.layer:last-child';
    const m1 = await mp.evaluate(l => { const L = document.querySelector(l); L.scrollTop = 200; const st = L.scrollTop, memo = L.querySelector('[data-f="memo"]'), pill = L.querySelector('.pills .opt'); render(); return [st > 0, L.scrollTop === st, L.querySelector('[data-f="memo"]') === memo, L.querySelector('.pills .opt') === pill]; }, AL);
    eq('㉚ 다시 그려도 스크롤 그대로 · 칸 · 알약은 새로 만들지 않고 그 자리에서 고친다', m1, [true, true, true, true]);
    const m2 = await mp.evaluate(l => { const L = document.querySelector(l), memo = L.querySelector('[data-f="memo"]'); memo.focus(); memo.value = '쓰는 중'; render(); return [document.activeElement === memo, memo.value]; }, AL);
    eq('㉚ 쓰고 있는 칸은 다시 그려도 포커스 · 글 그대로', m2, [true, '쓰는 중']);
    await mp.evaluate(() => { document.activeElement.blur(); topLayer().form.memo = ''; render(); });
    // 끌어 옮기기 — 아래쪽('어떻게' 의 첫 칸) 알약을 끌어도 화면이 맨 위로 가지 않는다
    const k0 = await mp.evaluate(() => Object.keys(ATTO()).find(k => k !== 'svc' && (ATTO()[k] || []).length > 1 && document.querySelector('.layer:last-child .pills[data-k="' + k + '"]')));
    const pre = await mp.evaluate(([l, k]) => { const L = document.querySelector(l), p = L.querySelector('.pills[data-k="' + k + '"]'); L.scrollTop = 0; L.scrollTop = p.getBoundingClientRect().top - 220; const o = [...p.querySelectorAll('.opt[data-act="aone"]')].map(e => { const r = e.getBoundingClientRect(); return [e.dataset.v, r.x + r.width / 2, r.y + r.height / 2]; }); return { st: L.scrollTop, o }; }, [AL, k0]);
    await mp.mouse.move(pre.o[1][1], pre.o[1][2]); await mp.mouse.down(); await mp.mouse.move(pre.o[1][1] - 8, pre.o[1][2], { steps: 3 }); await mp.mouse.move(pre.o[0][1] - 4, pre.o[0][2], { steps: 10 }); await mp.mouse.up(); await mp.waitForTimeout(900);
    eq('㉚ 끌어 옮긴 뒤에도 스크롤 그대로(맨 위로 튀지 않음) · 순서는 바뀜', [pre.st > 0, await mp.evaluate(l => document.querySelector(l).scrollTop, AL) === pre.st, await mp.evaluate(k => ATTO()[k][0], k0)], [true, true, pre.o[1][0]]);
    eq('㉚ 밀려나는 알약은 제자리에서 새 자리로 미끄러진다(움직임 켜짐일 때)', await mp.evaluate(k => { RM.matches = false; const box = document.querySelector('.layer:last-child .pills[data-k="' + k + '"]'), a = box.children[0], b = box.children[1]; flipMove(box, () => box.insertBefore(b, a)); const n = [a, b].filter(x => x.getAnimations().length).length; RM.matches = true; document.getAnimations().forEach(x => x.finish()); return n; }, k0), 2);
    await mp.evaluate(() => render());
    // '완료' 단추 — 알약 더하기 칸을 쓰다가 그 칸이 다시 그리기로 사라져도(아이폰은 focusout 이 없음) 단추가 돌아온다
    await mp.evaluate(k => document.querySelector('.layer:last-child [data-act="aoptadd"][data-k="' + k + '"]').click(), k0); await mp.waitForTimeout(400);
    eq('㉚ 알약 더하기 칸을 쓰는 동안은 단추를 감춘다', await mp.evaluate(() => [document.activeElement.dataset.optadd != null, document.body.classList.contains('typing')]), [true, true]);
    await mp.evaluate(() => { const i = document.activeElement; i.addEventListener('blur', e => e.stopImmediatePropagation(), true); document.addEventListener('focusout', e => { if (e.target === i) e.stopImmediatePropagation(); }, { capture: true, once: true }); topLayer().adding = null; render(); }); await mp.waitForTimeout(300);
    eq("㉚ 그 칸이 사라지면 '완료' 단추가 돌아온다 (typing 이 남지 않음)", await mp.evaluate(l => [document.body.classList.contains('typing'), getComputedStyle(document.querySelector(l + ' .ph-foot')).display], AL), [false, 'block']);
    // 알약 더하기 칸은 자판 바로 위로 (자판 = 가짜 visualViewport 높이 260)
    const pin = await mp.evaluate(async k => {
      const vv = { offsetTop: 0, height: 260, addEventListener() {} }; Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true });
      document.querySelector('.layer:last-child [data-act="aoptadd"][data-k="' + k + '"]').click(); await new Promise(r => setTimeout(r, 900));
      const i = document.activeElement; keepInView(i); await new Promise(r => setTimeout(r, 100));
      const b1 = Math.round(i.getBoundingClientRect().bottom);
      document.querySelector('.layer:last-child').scrollTop -= 120; keepInView(i); await new Promise(r => setTimeout(r, 100));
      return [b1, Math.round(i.getBoundingClientRect().bottom)];
    }, k0);
    eq('㉚ 알약 더하기 칸은 가려졌든 위에 있든 늘 자판 바로 위(240px 언저리)', pin.map(b => Math.abs(b - 240) <= 3), [true, true]);
    await mp.evaluate(() => { document.activeElement.blur(); delete window.visualViewport; topLayer().adding = null; topLayer().dirty = false; S.layers = []; render(); });
    // 최근 이름 줄 — 접혀 있어도 옆으로 민다 · 넘친 쪽만 흐림 · 다시 그려도 민 자리 그대로
    await mp.evaluate(() => { for (let i = 0; i < 30; i++) DATA.attend.push({ name: '지은이름' + i, date: today() }); openEdit(null); }); await mp.waitForTimeout(500);
    const rl = await mp.evaluate(async () => {
      const r = document.querySelector('.layer:last-child .recent .rlist'), a = [getComputedStyle(r).overflowX, r.scrollWidth > r.clientWidth, r.classList.contains('fl'), r.classList.contains('fr')];
      r.scrollLeft = 80; r.dispatchEvent(new Event('scroll')); await new Promise(x => setTimeout(x, 50)); render(); await new Promise(x => setTimeout(x, 50));
      const r2 = document.querySelector('.layer:last-child .recent .rlist'); return a.concat([r2 === r, r2.scrollLeft, r2.classList.contains('fl')]);
    });
    eq('㉚ 최근 이름 줄 — 옆으로 굴림 · 처음엔 오른쪽만 흐림 · 민 뒤 왼쪽도 · 다시 그려도 그 자리', rl, ['auto', true, false, true, true, 80, true]);
    await mp.evaluate(() => { DATA.attend.splice(-30, 30); S.layers = []; render(); });
    await mc.close();
  }

  {
  // ⑳ (1108-B3) 출석 입력 새로 — 이름 여럿 · 날짜 단추 · 알약 더하기 · 끌어 옮기기 · 이름 바꾸기 · 지우기 · 직접 적기는 접어 둠
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => goTab('attend')); await page.waitForTimeout(500);
  await page.click('.fab[data-act="attadd"]'); await tidy();
  const LY = '.layer:last-child';
  eq('⑳ 직접 적기 칸은 처음엔 접혀 있다 · 날짜 단추 그제 · 어제 · 오늘 + 달력', [await page.$$eval(LY + ' [data-etc]', x => x.length), await page.$$eval(LY + ' [data-act="adate"]', x => x.map(e => e.textContent)), await page.$$eval(LY + ' .calbtn input[type=date]', x => x.length)], [0, ['그제', '어제', '오늘'], 1]);
  await page.fill(LY + ' [data-f="name"]', '가가, 나나');
  eq('⑳ 이름 여럿 안내', await page.$eval('#nameHint', e => e.textContent), '2분 — 같은 내용으로 한 분씩 한 줄씩 적힙니다.');
  await page.click(LY + ' [data-act="adate"]:has-text("어제")');
  await page.click(LY + ' [data-act="aoptadd"][data-k="svc"]'); await page.waitForTimeout(200);
  await page.fill(LY + ' [data-optadd="svc"]', '새벽기도'); await page.press(LY + ' [data-optadd="svc"]', 'Enter'); await page.waitForTimeout(1200);
  const OT = () => (tab('출석 선택지') || { rows: [] }).rows.slice(1).filter(r => r[0] === '예배 · 모임').map(r => r[1]);
  eq("⑳ 알약 더하기 → '출석 선택지' 탭에 (기본 알약 + 새 것) · 바로 골라진다", [OT().slice(-2), await page.$eval(LY + ' [data-act="aone"][data-k="svc"][aria-pressed="true"]', e => e.dataset.v)], [['개인 기도', '새벽기도'], '새벽기도']);
  await page.click(LY + ' [data-act="aone"][data-k="seen"][data-v="말씀 때"]');
  const nR = tab('출석').rows.length;
  await page.click('[data-act="attsave"]'); await page.waitForTimeout(1500);
  const y1 = await page.evaluate(() => ymdAdd(today(), -1)), H2 = tab('출석').rows[0], col = k => H2.indexOf(k);
  eq('⑳ 두 분 → 한 줄씩 · 같은 날(어제) · 같은 예배 · 언제 보였나', tab('출석').rows.slice(nR).map(r => [r[col('성도')], r[col('날짜')] === y1, r[col('예배 · 모임')], r[col('언제 보였나')]]), [['가가', true, '새벽기도', '말씀 때'], ['나나', true, '새벽기도', '말씀 때']]);
  // 끌어 옮기기 (마우스: 바로 끌기) — '새벽기도' 를 맨 앞으로
  await page.click('.fab[data-act="attadd"]'); await tidy();
  const box = async v => { const r = await page.$eval(LY + ' [data-act="aone"][data-k="svc"][data-v="' + v + '"]', e => { const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }); return r; };
  const [sx, sy] = await box('새벽기도'), [tx, ty] = await box('주일 1부');
  await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + 10, sy, { steps: 3 }); await page.mouse.move(tx - 8, ty, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(1200);
  eq('⑳ 끌어 옮기면 순서가 탭에 그대로', OT().slice(0, 2), ['새벽기도', '주일 1부']);
  eq('⑳ 끌기는 고르기가 아니다(눌린 것 없음)', await page.$$eval(LY + ' [data-act="aone"][data-k="svc"][aria-pressed="true"]', x => x.length), 0);
  // 오른쪽 단추 → 메뉴 → 이름 바꾸기 · 지우기
  await page.click(LY + ' [data-act="aone"][data-k="svc"][data-v="새벽기도"]', { button: 'right' }); await page.waitForTimeout(300);
  eq('⑳ 오른쪽 단추 = 메뉴', await page.$$eval(LY + ' .omenu button', x => x.map(e => e.textContent)), ['이름 바꾸기', '지우기', '취소']);
  await page.evaluate(() => { window.prompt = () => '새벽 기도회'; });
  await page.click(LY + ' [data-act="aoptren"]'); await page.waitForTimeout(1200);
  eq('⑳ 이름 바꾸기 → 탭에서도', OT().slice(0, 1), ['새벽 기도회']);
  await page.click(LY + ' [data-act="aone"][data-k="svc"][data-v="새벽 기도회"]', { button: 'right' }); await page.waitForTimeout(300);
  await page.click(LY + ' [data-act="aoptdel"]'); await page.waitForTimeout(1200);
  eq('⑳ 지우기 → 탭에서 빠지고 남는 아랫줄도 정리', [OT().includes('새벽 기도회'), tab('출석 선택지').rows.filter(r => r.length && r[0]).length - 1, (await page.evaluate(() => ATTO().svc.length))], [false, (await page.evaluate(() => Object.values(ATTO()).reduce((n, l) => n + l.length, 0))), await page.evaluate(() => ATTO().svc.length)]);
  const lp = q => page.evaluate(q => { const el = document.querySelector(q), r = el.getBoundingClientRect(), o = { bubbles: true, pointerType: 'touch', clientX: r.x + 5, clientY: r.y + 5 }; el.dispatchEvent(new PointerEvent('pointerdown', o)); return new Promise(res => setTimeout(() => { el.dispatchEvent(new PointerEvent('pointerup', o)); el.click(); res(); }, 600)); }, q);
  await lp(LY + ' [data-act="aone"][data-k="from"][data-v="처음부터"]'); await page.waitForTimeout(300);
  eq('⑳ 손가락으로 길게(0.45초) 누르면 메뉴 · 뒤따르는 누름은 고르기가 아니다', [await page.$$eval(LY + ' .omenu', x => x.length), await page.evaluate(() => topLayer().form.from)], [1, '']);
  await page.click(LY + ' .omenu [data-act="aoptx"]'); await page.waitForTimeout(200);
  eq('⑳ 메뉴를 띄운 바로 뒤 취소도 먹히지 않는다', await page.$$eval(LY + ' .omenu', x => x.length), 0);
  const sp = q => page.evaluate(q => { const el = document.querySelector(q), r = el.getBoundingClientRect(), o = { bubbles: true, pointerType: 'touch', clientX: r.x + 5, clientY: r.y + 5 }; el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointermove', Object.assign({}, o, { clientY: r.y + 40 }))); el.dispatchEvent(new PointerEvent('pointerup', o)); }, q);
  await sp(LY + ' [data-act="aone"][data-k="from"][data-v="처음부터"]'); await page.waitForTimeout(600);
  eq('⑳ 누르자마자 움직이면(화면 굴리기) 메뉴도 끌기도 아니다', await page.$$eval(LY + ' .omenu', x => x.length), 0);
  eq('⑳ 지난 출석 기록은 그대로', tab('출석').rows.slice(nR).map(r => r[col('예배 · 모임')]), ['새벽기도', '새벽기도']);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }

  // ㉒ (1108-B4) 달력에 출석 켜고 끄기
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => { S.wk = 0; goTab('week'); }); await page.waitForTimeout(500);
  eq('㉒ 달력 기본은 심방만 · 출석 줄 없음', [await page.$$eval('.calsw [aria-pressed="true"]', x => x.map(e => e.textContent)), await page.$$eval('.wl.att', x => x.length)], [['심방'], 0]);
  await page.click('.calsw [data-v="a"]'); await page.waitForTimeout(400);
  const wkAtt = await page.evaluate(() => { const s = weekStartOf(today()), e = ymdAdd(s, 6); return AT().filter(a => a.date >= s && a.date <= e).length; });
  eq('㉒ 출석을 켜면 그 주 출석이 날마다', [await page.$$eval('.wl.att', x => x.length), wkAtt > 0], [wkAtt, true]);
  await page.click('.calsw [data-v="v"]'); await page.waitForTimeout(400);
  eq('㉒ 심방을 끄면 출석만', [await page.$$eval('.day .wl:not(.att)', x => x.length), await page.$$eval('.wl.att', x => x.length)], [0, wkAtt]);
  await page.click('.calsw [data-v="a"]'); await page.waitForTimeout(400);
  eq('㉒ 둘 다 끌 수는 없다 — 출석을 끄면 심방이 켜진다', await page.$$eval('.calsw [aria-pressed="true"]', x => x.map(e => e.textContent)), ['심방']);
  await page.click('.calsw [data-v="a"]'); await page.evaluate(() => goTab('month')); await page.waitForTimeout(500);
  eq('㉒ 월간에도 출석 이름 · 기억해 둔 켜짐 그대로', [await page.$$eval('.cal .nmc.at', x => x.length) > 0, await page.$$eval('.calsw [aria-pressed="true"]', x => x.length)], [true, 2]);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/b4_month.png', fullPage: true });

  // ㉔ (1109) 폼에 '장소' · '사주심/사드림' 질문이 생김 → 시트 끝에 열 두 개
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  { const RT = tab('Form Responses 1'); RT.rows[0].push('장소', '사주심/사드림'); const cP = RT.rows[0].length - 2, cY = cP + 1;
    await page.evaluate(() => loadData(true)); await page.waitForTimeout(800);
    await page.evaluate(() => openEdit(null)); await tidy();
    eq('㉔ 입력 화면에 장소 알약 칸 · 사주심 / 사드림 알약', [await page.$$eval('.layer:last-child .pills[data-k="place"]', x => x.length), await page.$$eval('.layer:last-child [data-act="aone"][data-k="pay"]', x => x.map(e => e.dataset.v))], [1, ['사주심', '사드림']]);
    eq("㉔ 심방 입력 날짜 — 제목 '언제 · 어디서 · 어떻게' · 그제 · 어제 · 오늘 · 달력 + 고른 날 요일", [await page.$$eval('.layer:last-child .fsec', x => x.map(e => e.firstChild.textContent.trim()).includes('언제 · 어디서 · 어떻게')), await page.$$eval('.layer:last-child [data-act="adate"][data-k="ymd"]', x => x.map(e => e.textContent)), await page.$eval('.layer:last-child .dsel', e => e.textContent)],
      [true, ['그제', '어제', '오늘'], await page.evaluate(() => dayName(today()))]);
    await page.click('.layer:last-child [data-act="adate"][data-k="ymd"]:has-text("그제")'); await page.waitForTimeout(200);
    eq('㉔ 그제를 누르면 날짜 · 요일 글자가 따라감', [await page.evaluate(() => topLayer().form.ymd), await page.$eval('.layer:last-child .dsel', e => e.textContent)], await page.evaluate(() => { const y = ymdAdd(today(), -2); return [y, dayName(y)]; }));
    await page.click('.layer:last-child [data-act="adate"][data-k="ymd"]:has-text("오늘")'); await page.waitForTimeout(200);
    await page.fill('.layer:last-child [data-f="nameq"]', '장소사람');
    await talk(page, [['n', '카페에서 만남']]);
    eq('㉔ 장소는 알약 + 더하기(직접 적기 칸은 접힘)', [await page.$$eval('.layer:last-child .pills[data-k="place"] [data-act="aplus"]', x => x.length), await page.$$eval('.layer:last-child [data-f="place"]', x => x.length)], [1, 0]);
    await plus(page, '.layer:last-child', 'place'); await page.click('.layer:last-child [data-act="aetc"][data-k="place"]'); await page.waitForTimeout(200);
    await page.fill('.layer:last-child [data-f="place"]', '역 앞 카페');
    await page.click('.layer:last-child [data-act="aone"][data-k="pay"][data-v="사드림"]');
    await page.click('.layer:last-child [data-act="saverec"]'); await page.waitForTimeout(1500);
    const row = () => RT.rows.find(r => r[2] === '장소사람') || [];
    eq('㉔ 새 기록 — 장소 · 사드림이 그 열에', [row()[cP], row()[cY]], ['역 앞 카페', '사드림']);
    await page.evaluate(() => openEdit(M().visits.find(v => v.name === '장소사람').key)); await tidy();
    eq('㉔ 고치기 화면 — 사드림 · 장소 알약이 눌려 있다', [await page.$eval('.layer:last-child [data-act="aone"][data-k="pay"][aria-pressed="true"]', e => e.dataset.v), await page.$eval('.layer:last-child .pills[data-k="place"] [aria-pressed="true"]', e => e.dataset.v)], ['사드림', '역 앞 카페']);
    await page.click('.layer:last-child [data-act="aone"][data-k="pay"][data-v="사주심"]');
    const n9 = LOG.length;
    await page.click('.layer:last-child [data-act="saverec"]'); await page.waitForTimeout(1500);
    eq('㉔ 고치기 — 사주심 칸 + 수정 시각만', [row()[cY], LOG.slice(n9).filter(x => x[0] === 'set').length], ['사주심', 2]);
    // 1109-D2 장소 알약 — 입력 화면에서 더하기 → '심방 선택지' 탭 · 길게 눌러 이름 바꾸기 · 지우기(지난 기록은 그대로)
    await page.evaluate(() => openEdit(M().visits.find(v => v.name === '장소사람').key)); await tidy();
    eq('㉔ 탭이 비면 지난 기록에 쓴 장소가 알약으로', await page.$$eval('.layer:last-child .pills[data-k="place"] [data-act="aone"]', x => x.map(e => e.dataset.v).includes('역 앞 카페')), true);
    await plus(page, '.layer:last-child', 'place'); await page.click('.layer:last-child .pills[data-k="place"] [data-act="aoptadd"]'); await page.waitForTimeout(200);
    await page.fill('.layer:last-child [data-optadd="place"]', '교회 카페'); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    const vt = () => (tab('심방 선택지') || { rows: [] }).rows;
    eq("㉔ 알약 더하기 → '심방 선택지' 탭에 장소 줄 · 고른 것이 됨", [J0(vt().filter(r => r[0] === '장소').map(r => r[1])).includes('교회 카페'), await page.$eval('.layer:last-child .pills[data-k="place"] [aria-pressed="true"]', e => e.dataset.v)], [true, '교회 카페']);
    await page.click('.layer:last-child .pills[data-k="place"] [data-v="교회 카페"]', { button: 'right' }); await page.waitForTimeout(300);
    eq('㉔ 우클릭 → 메뉴(이름 바꾸기 · 지우기)', await page.$$eval('.layer:last-child .omenu button', x => x.map(e => e.textContent)), ['이름 바꾸기', '지우기', '취소']);
    await page.evaluate(() => { window.prompt = () => '교회 1층 카페'; });
    await page.click('.layer:last-child .omenu [data-act="aoptren"]'); await page.waitForTimeout(1200);
    eq('㉔ 이름 바꾸기 → 탭 · 고른 값도 따라감', [vt().some(r => r[1] === '교회 1층 카페'), vt().some(r => r[1] === '교회 카페'), await page.evaluate(() => topLayer().form.place)], [true, false, '교회 1층 카페']);
    await page.click('.layer:last-child .pills[data-k="place"] [data-v="교회 1층 카페"]', { button: 'right' }); await page.waitForTimeout(300);
    await page.click('.layer:last-child .omenu [data-act="aoptdel"]'); await page.waitForTimeout(1200);
    eq('㉔ 지우기 → 탭에서 빠짐 · 지난 기록 글자는 그대로', [vt().some(r => r[1] === '교회 1층 카페'), row()[cP]], [false, '역 앞 카페']);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/pay.png' });
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }

  // 1109-E1 · E2 — 구분 · 태그 · 할 일 알약(+ · 직접 적기 접힘 · 우클릭 메뉴) · 최근 이름 한 줄
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => openEdit(null)); await page.waitForTimeout(500);
  { const LE = '.layer:last-child';
    eq("㉖ (G2) 구분 · 태그 · 할 일 — 끝에 '+ 더하기' 하나, 직접 적기 칸은 접혀 있다", await page.evaluate(L => ['roles', 'tags', 'acts'].map(k => [!!document.querySelector(L + ' .pills[data-k="' + k + '"] [data-act="aplus"]'), !!document.querySelector(L + ' .pills[data-k="' + k + '"] [data-act="aoptadd"]'), !!document.querySelector(L + ' .pills[data-k="' + k + '"] [data-act="aetc"]'), !!document.querySelector(L + ' [data-f="' + k + 'Etc"]')]), LE), [[true, false, false, false], [true, false, false, false], [true, false, false, false]]);
    await plus(page, LE, 'roles');
    eq("㉖ (G2) '+ 더하기' 를 누르면 '알약으로 더하기 · 이번 기록에만' 둘", await page.$$eval(LE + ' .pills[data-k="roles"] .pk', x => x.map(e => e.dataset.act + ':' + e.textContent)), ['aoptadd:알약으로 더하기', 'aetc:이번 기록에만']);
    await plus(page, LE, 'roles');
    const rn = await page.$$eval(LE + ' .recent .rn:not(.cellbtn)', x => x.map(e => e.textContent));
    eq('㉖ 최근 이름 한 줄 — 심방 · 출석 합쳐 최근 순(앱 규칙과 같게) · 한 줄 · 끝에 ›', [J0(rn) === J0(await page.evaluate(() => recentNames(M().visits, AT()).slice(0, 24))), await page.$eval(LE + ' .recent .rlist', e => getComputedStyle(e).flexWrap), await page.$eval(LE + ' .recent .rmore', e => e.getAttribute('aria-label'))], [true, 'nowrap', '더 보기']);
    await page.click(LE + ' .recent .rmore'); await page.waitForTimeout(200);
    eq('㉖ › 누르면 펼침', await page.$eval(LE + ' .recent .rlist', e => getComputedStyle(e).flexWrap), 'wrap');
    await page.click(LE + ' .recent .rn:not(.cellbtn)'); await page.waitForTimeout(200);
    eq('㉖ 최근 이름을 누르면 이름 칸에', await page.evaluate(() => topLayer().form.name), rn[0]);
    const n0 = (tab('속성').rows || []).length;
    await plus(page, LE, 'tags'); await page.click(LE + ' .pills[data-k="tags"] [data-act="aoptadd"]'); await page.waitForTimeout(200);
    await page.fill(LE + ' [data-optadd="tags"]', '봉사'); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
    eq("㉖ 태그 + → 바로 골라지고 '속성' 탭 · 폼에 더해진다", [await page.evaluate(() => topLayer().form.tags.includes('봉사')), tab('속성').rows.some(r => r[0] === '태그' && r[1] === '봉사'), FORM.items.some(it => it.title === '태그' && JSON.stringify(it).includes('봉사'))], [true, true, true]);
    await page.click(LE + ' .pills[data-k="tags"] [data-v="봉사"]', { button: 'right' }); await page.waitForTimeout(300);
    eq('㉖ 태그 알약 우클릭 → 메뉴', await page.$$eval(LE + ' .omenu button', x => x.map(e => e.textContent)), ['이름 바꾸기', '지우기', '취소']);
    await page.evaluate(() => { window.prompt = () => '섬김'; });
    await page.click(LE + ' .omenu [data-act="aoptren"]'); await page.waitForTimeout(3000);
    const tagRow = v => tab('속성').rows.find(r => r[0] === '태그' && r[1] === v) || [];
    eq('㉖ 이름 바꾸기 → 새 이름 더하고 옛 이름 숨김 · 고른 값도 따라감', [!!tagRow('섬김').length, tagRow('봉사')[4], await page.evaluate(() => topLayer().form.tags.includes('섬김'))], [true, '숨김', true]);
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }

  // 1109-E3 '셀' 단추 — 셀 한눈에 로그인을 읽기만 · 내 분파셀 · 셀원 골라 넣기
  {
    const cellCoreSrc = require('fs').readFileSync(path.join(__dirname, '..', '..', 'cell', 'index.html'), 'utf8').match(/<script id="cell-core">([\s\S]*?)<\/script>/)[1];
    await page.evaluate(src => { cellCore.c = new Function(src + '\n;return { pickMine };')(); }, cellCoreSrc);   // file:// 에선 ../cell/ 을 못 받아 미리 넣는다
    await page.evaluate(() => { try { localStorage.removeItem(CELL_SB_KEY); } catch (e) { } CELLS.state = 'idle'; openEdit(null); }); await page.waitForTimeout(400);
    const LE = '.layer:last-child';
    eq("㉗ '누구를' 최근 이름 줄 맨 앞에 '셀' 단추 — 이름 알약과 다른 모양(목록 아이콘 · ›)", [await page.$eval('.layer .recent > :first-child', e => e.className + '|' + e.textContent + '|' + !!e.querySelector('svg')), await page.$eval('.layer .recent .cellbtn', e => getComputedStyle(e).borderRadius !== getComputedStyle(document.querySelector('.layer .recent .rn')).borderRadius)], ['cellbtn|셀|true', true]);
    eq('㉗ › 는 이름 칸 밖 제자리(이름과 겹치지 않음)', await page.evaluate(() => { const m = document.querySelector('.layer .recent .rmore').getBoundingClientRect(), l = document.querySelector('.layer .recent .rlist').getBoundingClientRect(); return m.left >= l.right - 0.5; }), true);
    await page.click('.layer .recent .cellbtn'); await page.waitForTimeout(400);
    eq('㉗ 셀 한눈에 로그인이 없으면 안내 · 셀 한눈에 열기', [await page.$eval(LE + ' .empty', e => e.textContent.includes('로그인이 없습니다')), await page.$$eval(LE + ' a[href="../cell/"]', x => x.length)], [true, 1]);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.evaluate(() => localStorage.setItem(CELL_SB_KEY, JSON.stringify({ access_token: 'tok', refresh_token: 'rt', expires_at: Math.floor(Date.now() / 1000) + 3600 })));
    const nCc = LOG.length;
    await page.click('.layer .recent .cellbtn'); await page.waitForTimeout(800);
    eq('㉗ 내 분파셀만(내 셀 먼저) · 리더 포함 사람 수(쉬는 분 뺌)', await page.$$eval(LE + ' .cgrp', x => x.map(e => e.querySelector('b').textContent + ' ' + e.querySelector('.muted').textContent)), ['나무셀 2명', '하늘셀 3명']);
    eq('㉗ 셀 케어엔 읽기만 · 로그인 열쇠는 그대로', [LOG.slice(nCc).filter(x => x[0] === 'cc-write').length, await page.evaluate(() => JSON.parse(localStorage.getItem(CELL_SB_KEY)).refresh_token)], [0, 'rt']);
    eq('㉗ 셀마다 한 행 — 첫 알약은 셀리더, 그다음 셀원', await page.$$eval(LE + ' .cmem', x => x.map(r => [...r.querySelectorAll('[data-act="cellname"]')].map(e => (e.classList.contains('lead') ? '리더:' : '') + e.dataset.v))), [['리더:나리더', '셀원셋'], ['리더:가리더', '셀원둘', '셀원하나']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/cells.png' });
    await page.click(LE + ' .cmem [data-v="셀원하나"]'); await page.waitForTimeout(300);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/recent.png', clip: { x: 0, y: 0, width: 420, height: 260 } });
    // 1112-M 여럿 고르기 — 누르면 넣고(창은 그대로) 다시 누르면 뺀다 · '셀 전체' 는 셀 표시 + 모두를 넣고 닫는다
    const under = () => page.evaluate(() => S.layers[S.layers.length - 2].form.name);
    eq('㉗ 셀원을 누르면 이름 칸에 들어가고 창은 그대로 (눌린 모양)', [await page.evaluate(() => topLayer().type), await under(), await page.getAttribute(LE + ' .cmem [data-v="셀원하나"]', 'aria-pressed')], ['cellpick', '셀원하나', 'true']);
    await page.click(LE + ' .cmem [data-v="셀원둘"]'); await page.waitForTimeout(200);
    await page.click(LE + ' .cmem [data-v="셀원하나"]'); await page.waitForTimeout(200);
    eq('㉗ 하나 더 · 다시 누르면 빠진다', await under(), '셀원둘');
    await page.click(LE + ' .cgrp:has-text("하늘셀") [data-act="cellall"]'); await page.waitForTimeout(300);
    eq("㉗ '셀 전체' → 셀 표시 + 셀리더 + 셀원 (이미 있던 분은 그대로) · 창 닫힘", [await page.evaluate(() => topLayer().type), await page.evaluate(() => topLayer().form.name)], ['edit', '하늘 셀, 셀원둘, 가리더, 셀원하나']);
    eq('㉗ 이름 알약 — 셀 표시 + 세 분', await page.$$eval(LE + ' .who .wc', x => x.map(e => (e.classList.contains('grp') ? '셀:' : '') + e.textContent)), ['셀:하늘 셀', '셀원둘', '가리더', '셀원하나']);
    await page.evaluate(() => { topLayer().dirty = false; localStorage.removeItem(CELL_SB_KEY); }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }

  // ㉘ (1109-T) 나눈 이야기 — 주제 칸 · 주고받기 → 시트 한 칸 글
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => openEdit(null)); await page.waitForTimeout(500);
  { const LE = '.layer:last-child', IN = LE + ' [data-f="tk:in"]', RT = tab('Form Responses 1');
    const on = () => page.$eval(LE + ' [data-act="tkw"][aria-pressed="true"]', e => e.dataset.v);
    const lines = i => page.$$eval(LE + ' .tp[data-tp="' + i + '"] .ln', x => x.map(e => e.classList[1] + ':' + (e.querySelector('textarea') ? e.querySelector('textarea').value : e.querySelector('.tx').textContent)));
    await page.fill(LE + ' [data-f="nameq"]', '주제사람');
    eq('㉘ 처음엔 칸 하나 · 입력줄은 성도 차례', [await page.$$eval(LE + ' .tp', x => x.length), await on()], [1, 's']);
    await page.fill(LE + ' [data-f="tk:t:0"]', '어머님 수술');
    await page.click(LE + ' [data-act="tktags"][data-k="0"]'); await page.waitForTimeout(150);
    await page.click(LE + ' [data-act="tktag"][data-k="0"][data-v="건강"]'); await page.waitForTimeout(100);
    await page.click(LE + ' [data-act="tktag"][data-k="0"][data-v="가정"]'); await page.waitForTimeout(100);
    await page.click(LE + ' [data-act="tktags"][data-k="0"]'); await page.waitForTimeout(150);
    await page.fill(IN, '다음 주 수술해요'); await page.evaluate(q => { window.__in = document.querySelector(q); }, IN); await page.press(IN, 'Enter');
    eq('㉘ (T6) 입력 칸에서 Enter = 줄바꿈(넣지 않음)', [await page.inputValue(IN), await lines(0)], ['다음 주 수술해요\n', []]);
    await page.fill(IN, '다음 주 수술해요'); await page.click(LE + ' [data-act="tkadd"]');
    eq('㉘ 넣기 → 성도 말 한 줄 · 다음 차례는 저절로 나 · 입력 칸은 그대로 남아 자판이 안 내려간다', [await lines(0), await on(), await page.evaluate(q => document.querySelector(q) === window.__in && document.activeElement === window.__in && window.__in.value === '', IN)], [['s:다음 주 수술해요'], 'm', true]);
    await page.fill(IN, '같이 기도해요'); await page.click(LE + ' [data-act="tkadd"]');
    await page.fill(IN, '사흘 입원'); await page.click(LE + ' [data-act="tkadd"]');
    await talk(page, [['n', '목소리가 지쳐 있었음']]);
    eq('㉘ 성도 ↔ 나 번갈아 · 메모는 차례를 안 바꾼다', [await lines(0), await on()], [['s:다음 주 수술해요', 'm:같이 기도해요', 's:사흘 입원', 'n:목소리가 지쳐 있었음'], 'n']);
    await page.click(LE + ' [data-act="tkwho"][data-k="0:2"]'); await page.waitForTimeout(100);
    eq('㉘ 이름표를 누르면 성도 → 나', (await lines(0))[2], 'm:사흘 입원');
    await page.click(LE + ' [data-act="tkwho"][data-k="0:2"]'); await page.click(LE + ' [data-act="tkwho"][data-k="0:2"]'); await page.waitForTimeout(100);
    eq('㉘ 나 → 메모 → 성도', (await lines(0))[2], 's:사흘 입원');
    await page.click(LE + ' [data-act="tkedit"][data-k="0:1"]'); await page.waitForTimeout(150);
    await page.press(LE + ' [data-f="tk:l:0:1"]', 'Enter');
    eq('㉘ (T6) 고치는 줄에서 Enter = 줄바꿈(마치지 않음)', await page.inputValue(LE + ' [data-f="tk:l:0:1"]'), '같이 기도해요\n');
    await page.fill(LE + ' [data-f="tk:l:0:1"]', '전날 같이 기도해요'); await page.click(LE + ' .tp-n'); await page.waitForTimeout(200);
    eq('㉘ 글을 누르면 고치고, 다른 곳을 누르면 마침', (await lines(0))[1], 'm:전날 같이 기도해요');
    await page.click(LE + ' [data-act="tknew"]'); await page.waitForTimeout(400);
    eq('㉘ 새 주제 칸 → 칸 둘 · 입력줄이 새 칸으로 · 성도 차례', [await page.$$eval(LE + ' .tp', x => x.length), await page.$$eval(LE + ' .tp.on', x => x.map(e => e.dataset.tp)), await on(), await page.evaluate(() => document.activeElement.dataset.f)], [2, ['1'], 's', 'tk:in']);
    await talk(page, [['s', '큰아이가 입대해요']]);
    await page.click(LE + ' [data-act="tktags"][data-k="1"]'); await page.waitForTimeout(150);
    eq('㉘ (T6) 칸에서 고른 태그는 정리 태그 알약에도 켜짐', await page.$$eval(LE + ' .pills[data-k="tags"] [aria-pressed="true"]', x => x.map(e => e.dataset.v).sort()), ['가정', '건강']);
    await page.click(LE + ' [data-act="tkplus"][data-k="1"]'); await page.waitForTimeout(150);
    await page.fill(LE + ' [data-f="tk:g:1"]', '자녀 문제'); await page.press(LE + ' [data-f="tk:g:1"]', 'Enter'); await page.waitForTimeout(2500);
    eq("㉘ (T6) 칸 '+ 더하기' → 알약으로 더해 속성 탭에 · 칸 · 정리 태그에 켜짐", [tab('속성').rows.some(r => r[0] === '태그' && r[1] === '자녀 문제'), await page.$$eval(LE + ' .tp[data-tp="1"] .tp-tag', x => x.map(e => e.textContent)), await page.evaluate(() => topLayer().form.tags.includes('자녀 문제'))], [true, ['#자녀 문제'], true]);
    await page.click(LE + ' [data-act="tktags"][data-k="1"]'); await page.waitForTimeout(150);
    await page.click(LE + ' [data-act="tkw"][data-v="s"]');
    await page.evaluate(q => { const dt = new DataTransfer(); dt.setData('text/plain', '그래도 걱정돼요\n나: 기도할게요'); document.querySelector(q).dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); }, IN); await page.waitForTimeout(300);
    eq('㉘ 여러 줄 붙여 넣기 → 줄마다 나눔(이름표는 알아보고, 없으면 고른 사람)', await lines(1), ['s:큰아이가 입대해요', 's:그래도 걱정돼요', 'm:기도할게요']);
    await page.click(LE + ' [data-act="tkmenu"][data-k="1"]'); await page.waitForTimeout(150);
    eq('㉘ 칸 메뉴 — 위로 · 아래로 · 앞 칸과 합치기 · 지우기', await page.$$eval(LE + ' .tp-menu button', x => x.map(e => e.textContent + (e.disabled ? '(끔)' : ''))), ['위로', '아래로(끔)', '앞 칸과 합치기', '지우기']);
    await page.click(LE + ' [data-act="tkmove"][data-k="1"][data-v="-1"]'); await page.waitForTimeout(200);
    eq('㉘ 위로 → 칸 차례가 바뀐다', await page.$$eval(LE + ' .tp-t', x => x.map(e => e.value)), ['', '어머님 수술']);
    await page.click(LE + ' [data-act="tkmove"][data-k="0"][data-v="1"]'); await page.waitForTimeout(200);
    await page.click(LE + ' [data-act="tknew"]'); await page.waitForTimeout(300); await talk(page, [['n', '덧말']]);
    await page.click(LE + ' [data-act="tkmenu"][data-k="2"]'); await page.waitForTimeout(150);
    await page.click(LE + ' [data-act="tkmerge"][data-k="2"]'); await page.waitForTimeout(200);
    eq('㉘ 앞 칸과 합치기 → 말이 앞 칸 끝에', [await page.$$eval(LE + ' .tp', x => x.length), (await lines(1)).slice(-1)[0]], [2, 'n:덧말']);
    await page.click(LE + ' [data-act="tknew"]'); await page.waitForTimeout(300);
    await page.click(LE + ' [data-act="tkmenu"][data-k="2"]'); await page.waitForTimeout(150);
    await page.click(LE + ' [data-act="tkdel"][data-k="2"]'); await page.waitForTimeout(200);
    eq('㉘ 빈 칸 지우기는 묻지 않음 · 정리 태그 = 칸 태그', [await page.$$eval(LE + ' .tp', x => x.length), (await page.$$eval(LE + ' .pills[data-k="tags"] [aria-pressed="true"]', x => x.map(e => e.dataset.v))).sort()], [2, ['가정', '건강', '자녀 문제']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/talk_edit.png', fullPage: true });
    await page.click(LE + ' [data-act="saverec"]'); await page.waitForTimeout(1500);
    const row = () => RT.rows.find(r => r[2] === '주제사람') || [];
    eq('㉘ 시트 내용 칸 = ■ 줄 · 성도: · 나: · 메모(빈 줄 뒤) — 한 칸 글', row()[5], '■ 어머님 수술 #건강 #가정\n성도: 다음 주 수술해요\n나: 전날 같이 기도해요\n성도: 사흘 입원\n\n목소리가 지쳐 있었음\n\n■ #자녀 문제\n성도: 큰아이가 입대해요\n성도: 그래도 걱정돼요\n나: 기도할게요\n\n덧말');
    eq('㉘ 태그 칸 = 칸 태그 모음', row()[6], '건강, 가정, 자녀 문제');
    await page.evaluate(() => openEdit(M().visits.find(v => v.name === '주제사람').key)); await tidy();
    eq('㉘ 고치기 → 칸 · 제목 · 태그가 그대로 · 정리 태그 알약도 켜져 있다', [await page.$$eval(LE + ' .tp-t', x => x.map(e => e.value)), await page.$$eval(LE + ' .tp[data-tp="1"] .tp-tag', x => x.map(e => e.textContent)), await page.evaluate(() => topLayer().form.tags.slice().sort())], [['어머님 수술', ''], ['#자녀 문제'], ['가정', '건강', '자녀 문제']]);
    const n0 = LOG.length;
    await page.click(LE + ' [data-act="saverec"]'); await page.waitForTimeout(1000);
    eq('㉘ 안 바꾸고 저장 → 시트에 아무것도 안 쓴다', LOG.slice(n0).filter(x => x[0] === 'set').length, 0);
  }

  // ㉙ (1109-T4 · T5) 열람 — 대본 · 말풍선 · 접기 / 설정 탭 넷 · 마지막 탭 기억 / 성도 화면 주제로 보기
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  { const LE = '.layer:last-child', key = await page.evaluate(() => M().visits.find(v => v.name === '주제사람').key);
    await page.evaluate(k => { saveCfg({ talk: 'b' }); openLayer('detail', { key: k }); }, key); await tidy();
    eq('㉙ 열람(대본) — 칸마다 제목(없으면 주제 2) · 태그 · 줄 앞 이름표', [await page.$$eval(LE + ' .tv.b .tv-t', x => x.map(e => e.textContent)), await page.$$eval(LE + ' .tv-g', x => x.map(e => e.textContent)), await page.$$eval(LE + ' .tv-tp[data-i="0"] .ln', x => x.map(e => e.querySelector('.who').textContent + ':' + e.querySelector('.tx').textContent))],
      [['어머님 수술', '주제 2'], ['#건강 #가정', '#자녀 문제'], ['성도:다음 주 수술해요', '나:전날 같이 기도해요', '성도:사흘 입원', '메모:목소리가 지쳐 있었음']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/talk_read_b.png' });
    await page.click(LE + ' [data-act="tvfold"][data-k="0"]'); await page.waitForTimeout(500);
    eq('㉙ 제목을 누르면 접히고 첫 성도 말 한 줄만', [await page.$$eval(LE + ' .tv-tp[data-i="0"] .ln', x => x.length), await page.$eval(LE + ' .tv-tp[data-i="0"] .tv-peek', e => e.textContent)], [0, '다음 주 수술해요']);
    await page.click(LE + ' [data-act="tvall"]'); await page.waitForTimeout(300);
    eq("㉙ '제목만' → 다 접힘 · 단추는 '모두 펴기'", [await page.$$eval(LE + ' .tv-tp.shut', x => x.length), await page.$eval(LE + ' [data-act="tvall"]', e => e.textContent)], [2, '모두 펴기']);
    await page.click(LE + ' [data-act="tvall"]'); await page.waitForTimeout(300);
    eq('㉙ 모두 펴기', await page.$$eval(LE + ' .tv-tp.shut', x => x.length), 0);
    await page.evaluate(() => openLayer('settings')); await tidy();
    eq('㉙ 설정 탭 차례 — 보기 · BLOCK7 · 연결 · 그 밖에', await page.$$eval(LE + ' [data-act="stab"]', x => x.map(e => e.textContent)), ['보기', 'BLOCK7', '연결', '그 밖에']);
    await stab(page, '연결');
    eq("㉙ '연결' 탭 — 로그인 · 구글 · 시트 · 시트 준비 · 폼 · 속성 관리", await page.$$eval(LE + ' #stPane .srow .t', x => x.map(e => e.textContent)), ['로그인', '구글', '심방 시트', '시트 준비', '시험 시트', '심방 폼', '속성 관리']);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.evaluate(() => openLayer('settings')); await tidy();
    eq('㉙ 다시 열면 마지막에 본 탭(이 기기에만 기억)', [await page.$eval(LE + ' [data-act="stab"][aria-pressed="true"]', e => e.textContent), await page.evaluate(() => 'stab' in pickCfg(saved()))], ['연결', false]);
    await stab(page, '보기');
    eq("㉙ '보기' 탭 — 대화 보기 · 이름 색 · 오래 못 만남 · 보관 기준 · 보관 기록", await page.$$eval(LE + ' #stPane .srow .t', x => x.map(e => e.textContent)), ['대화 보기', '이름 색', '오래 못 만남 기준', '보관 기준', '보관 기록 함께 보기']);
    await page.click(LE + ' [data-act="talkmode"][data-v="a"]'); await page.waitForTimeout(300);
    eq('㉙ 말풍선을 고르면 미리 보기도 말풍선 · 계정에 맞출 값(talk)', [await page.$$eval(LE + ' #stPane .tv.a .bb', x => x.length), await page.evaluate(() => pickCfg(saved()).talk)], [3, 'a']);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/settings_view.png' });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    eq('㉙ 열람(말풍선) — 성도 왼쪽 · 나 오른쪽 · 메모 가운데 · 이름은 말이 바뀔 때만', [await page.$$eval(LE + ' .tv.a .tv-tp[data-i="0"] .tv-body > *', x => x.map(e => e.className + ':' + e.textContent)), await page.$eval(LE + ' .tv.a .bb.m', e => getComputedStyle(e).alignSelf)],
      [['bb-who s:성도', 'bb s:다음 주 수술해요', 'bb-who m:나', 'bb m:전날 같이 기도해요', 'bb-who s:성도', 'bb s:사흘 입원', 'bb-n:목소리가 지쳐 있었음'], 'flex-end']);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/talk_read_a.png' });
    await page.evaluate(() => saveCfg({ talk: 'b' }));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.evaluate(() => openLayer('person', { name: '주제사람' })); await tidy();
    eq('㉙ 성도 화면 — 자주 나온 이야기 = 칸 태그(누르는 단추)', await page.$$eval(LE + ' .cloud [data-act="ptag"]', x => x.map(e => e.textContent)), ['#가정', '#건강', '#자녀 문제']);
    await page.click(LE + ' .cloud [data-act="ptag"][data-v="자녀 문제"]'); await page.waitForTimeout(300);
    eq('㉙ 태그를 누르면 그 태그 주제 칸만 — 제목 · 성도 말 · 내 말 · 말 수', await page.$$eval(LE + ' .ptl button', x => x.map(e => [e.querySelector('.pt').firstChild.textContent, e.querySelector('.q').textContent, e.querySelector('.me').textContent, e.querySelector('.more').textContent])), [['주제 2', '성도큰아이가 입대해요', '나기도할게요', '말 3 · 메모 1']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/person_topics.png' });
    await page.click(LE + ' .ptl button'); await tidy();
    eq('㉙ 누르면 그 기록 열람', await page.evaluate(() => topLayer().type + ':' + byKey(topLayer().key).name), 'detail:주제사람');
  }
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }

  // 1109-D1 버전 — 설정 맨 아래 버전은 단추, 좌상단 배지는 개발자 계정에만
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  eq('㉕ 다른 사용자에게는 좌상단 버전 배지가 없다', await page.$$eval('.verbadge', x => x.length), 0);
  await page.evaluate(() => { USER.email = 'denartist@gmail.com'; render(); }); await page.waitForTimeout(200);
  eq('㉕ 개발자 계정이면 좌상단에 버전', await page.$eval('.ph-head .verbadge', e => e.textContent), await page.evaluate(() => APP_VERSION.replace(/^v\.\s*/, 'v')));
  await page.evaluate(() => { USER.email = 'test@example.com'; render(); openLayer('settings'); }); await page.waitForTimeout(400); await stab(page, '그 밖에');
  eq('㉕ 설정 맨 아래 버전은 누르는 단추', await page.$$eval('.layer:last-child button[data-act="vercheck"]', x => x.length), 1);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);

  // ㉛ (1109-G1) 목록 '자세히 / 간략히' — 필터 줄 오른쪽 끝 글자 단추 · 자세히 = 왼쪽 날짜 기둥 · 간략히 = 한 줄씩 · 이 기기에 기억
  { const lays = await page.$$('.layer'); for (let i = 0; i < lays.length; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); } }
  await page.evaluate(() => { S.view = 'list'; S.searching = false; S.q = ''; for (const x in S.filt) S.filt[x] = []; S.quick = ''; save({ lmode: undefined }); render(); }); await page.waitForTimeout(300);
  {
    const want = await page.evaluate(() => { const L = V(); return { n: L.length, days: [...new Set(L.map(v => v.ymd))].length, first: L[0].ymd, dup: L.findIndex((v, i) => i && L[i - 1].ymd === v.ymd) }; });
    eq('㉛ 처음은 자세히 — 단추는 필터 줄 오른쪽 끝, 자세히가 진하게', await page.evaluate(() => { const w = document.querySelector('.fwrap'), b = w && w.lastElementChild; return [!!w, b && b.dataset.act, b && b.querySelector('b.on').textContent, !!document.querySelector('#vlist.vl-full')]; }), [true, 'lmode', '자세히', true]);
    eq('㉛ 자세히 — 날마다 왼쪽 기둥 하나(큰 날짜) · 기록은 오른쪽에 모두', await page.evaluate(() => [document.querySelectorAll('#vlist .dg').length, document.querySelector('#vlist .dg .dcol b').textContent, document.querySelectorAll('#vlist .dg .dcards .card').length]),
      [want.days, String(+want.first.slice(8)), want.n]);
    await page.click('[data-act="lmode"]'); await page.waitForTimeout(400);
    eq('㉛ 누르면 간략히 — 한 기록 한 줄(날 · 이름 · 내용) · 이 기기에 기억', await page.evaluate(() => [!!document.querySelector('#vlist.vl-brief'), document.querySelectorAll('#vlist .lrow').length, [...document.querySelector('#vlist .lrow').children].map(e => e.className.split(' ')[0]), saved().lmode, document.querySelector('.lmode b.on').textContent]),
      [true, want.n, ['bd', 'nm', 'bt'], 'brief', '간략히']);
    eq('㉛ 간략히 — 달 머리가 있고 · 같은 날 둘째 줄부터 날짜를 비운다', await page.evaluate(i => [document.querySelectorAll('#vlist .bmon').length > 0, i < 0 || document.querySelectorAll('#vlist .lrow')[i].querySelector('.bd').classList.contains('same')], want.dup), [true, true]);
    await page.evaluate(() => render()); await page.waitForTimeout(100);
    eq('㉛ 다시 그려도 간략히 그대로', await page.evaluate(() => !!document.querySelector('#vlist.vl-brief')), true);
    await page.click('#vlist .lrow'); await page.waitForTimeout(400);
    eq('㉛ 간략히 줄을 누르면 그 기록 열람', await page.evaluate(() => topLayer() && topLayer().type), 'detail');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    await page.click('[data-act="lmode"]'); await page.waitForTimeout(300);
    eq('㉛ 다시 누르면 자세히', await page.evaluate(() => [!!document.querySelector('#vlist.vl-full'), saved().lmode]), [true, 'full']);
  }

  // ㉜ (1109-G2) 새 기록 — 넓은 화면(700px 이상) = 칸마다 흰 카드(A) · 폰 = 꼭 쓸 것 먼저 + 고르는 칸은 접힌 줄(C)
  await page.evaluate(() => openEdit(null)); await page.waitForTimeout(500);
  { const LE = '.layer:last-child';
    eq('㉜ 넓은 화면 — 카드 넷(누구를 · 언제 · 이야기 · 정리) · 접힌 줄 없음', await page.evaluate(L => [!!document.querySelector(L + ' .edf.e-wide'), [...document.querySelectorAll(L + ' .eblk > .fsec:first-child')].map(e => e.firstChild.textContent.trim()), document.querySelectorAll(L + ' .crow').length], LE),
      [true, ['누구를', '언제 · 어디서 · 어떻게', '나눈 이야기', '정리'], 0]);
    await page.click(LE + ' [data-act="ftog"][data-k="tags"][data-v="학교"]'); await page.waitForTimeout(150);
    eq('㉜ 고른 알약은 꽉 채운 초록', await page.$eval(LE + ' [data-act="ftog"][data-k="tags"][data-v="학교"]', e => getComputedStyle(e).backgroundColor === getComputedStyle(document.querySelector('.layer:last-child .btn.pri')).backgroundColor), true);
    const inf0 = await page.$$eval(LE + ' .einfo-b', x => x.length);
    await page.click(LE + ' [data-act="einfo"][data-k="sum"]'); await page.waitForTimeout(150);
    eq('㉜ 긴 안내는 처음엔 감춤 → i 를 누르면 보임', [inf0, await page.$$eval(LE + ' .einfo-b', x => x.length)], [0, 1]);
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }
  {
    const pc = await b.newContext({ viewport: { width: 375, height: 700 }, timezoneId: 'Asia/Seoul' });
    const pp = await pc.newPage(); pp.on('pageerror', e => errs.push('폰 G2: ' + e.message)); pp.on('dialog', d => d.accept());
    await pp.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
    await pp.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
    await pp.goto(FILE); await pp.waitForTimeout(400);
    await pp.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }); googleStatus(); });
    await pp.waitForSelector('.card');
    await pp.click('[data-act="addrec"]'); await pp.waitForTimeout(500);
    const LE = '.layer:last-child';
    const keys = await pp.$$eval(LE + ' .crow', x => x.map(e => e.dataset.crow));
    eq('㉜ 폰 — 누구 · 언제 · 이야기는 펴 있고, 고르는 칸은 접힌 줄(구분 · 어떻게 · … · 깊이 · 태그 · 할 일)', [await pp.$$eval(LE + ' .edf.e-narrow', x => x.length), keys[0], keys[1], keys.slice(-3), await pp.$$eval(LE + ' .crow.open', x => x.length), await pp.isVisible(LE + ' [data-f="nameq"]'), await pp.isVisible(LE + ' [data-f="tk:in"]')],
      [1, 'roles', 'method', ['depth', 'tags', 'acts'], 0, true, true]);
    eq('㉜ 접힌 줄의 알약은 보이지 않는다', await pp.isVisible(LE + ' [data-act="ftog"][data-k="tags"][data-v="학교"]'), false);
    await pp.click(LE + ' [data-act="crow"][data-k="tags"]'); await pp.waitForTimeout(450);
    await pp.click(LE + ' [data-act="ftog"][data-k="tags"][data-v="학교"]'); await pp.waitForTimeout(150);
    eq('㉜ 줄을 누르면 펴지고 · 고른 값이 줄에 한 줄로', [await pp.$eval(LE + ' .crow[data-crow="tags"] .crow-h', e => e.getAttribute('aria-expanded')), await pp.$eval(LE + ' .crow[data-crow="tags"] .crow-h .v', e => e.textContent)], ['true', '#학교']);
    await pp.click(LE + ' [data-act="crow"][data-k="depth"]'); await pp.waitForTimeout(450);
    await pp.click(LE + ' [data-act="fone"][data-k="depth"][data-v="깊음"]'); await pp.waitForTimeout(150);
    eq('㉜ 다른 줄을 펴면 앞 줄은 접힌다(하나씩)', [await pp.$$eval(LE + ' .crow.open', x => x.map(e => e.dataset.crow)), await pp.$eval(LE + ' .crow[data-crow="depth"] .crow-h .v', e => e.textContent)], [['depth'], '깊음']);
    await pp.fill(LE + ' [data-f="nameq"]', '폰사람');
    await talk(pp, [['s', '폰에서 적은 이야기']]);
    await pp.setViewportSize({ width: 820, height: 700 }); await pp.waitForTimeout(400);
    eq('㉜ 폭이 700px 을 넘으면 카드(A)로 다시 그리고 · 쓰던 것은 그대로', await pp.evaluate(L => [!!document.querySelector(L + ' .edf.e-wide'), document.querySelector(L + ' [data-f="nameq"]').value, topLayer().form.tags.slice(), topLayer().form.depth], LE), [true, '폰사람', ['학교'], '깊음']);
    await pp.setViewportSize({ width: 375, height: 700 }); await pp.waitForTimeout(400);
    await pp.click(LE + ' [data-act="saverec"]'); await pp.waitForTimeout(1500);
    const pr = (tab('Form Responses 1').rows || []).find(r => r[2] === '폰사람') || [];
    eq('㉜ 폰에서 적은 기록 — 태그 · 깊이 · 이야기가 시트에', [pr[6], pr[8], pr[5]], ['학교', '깊음', '성도: 폰에서 적은 이야기']);
    await pc.close();
  }

  // ㉞ (1110-Q) 다음 심방 질문 — 붙여넣기 → 체크리스트 · 한 줄 적기 · 체크 · 지우기 → '다음 질문' 탭 · BLOCK7 로 하위 항목
  {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    await page.evaluate(() => {
      window.__inbox = []; window.__inboxFail = 0;
      window.firebase = { firestore: { FieldValue: { arrayUnion: x => ({ __u: x }) } } };
      DB = { doc: p => ({ set: async (o, m) => { window.__inbox.push([p, o.items.__u, m]); } }) };
    });
    const TQ = await page.evaluate(() => today()), RT = tab('Form Responses 1'), hq = RT.rows[0];
    const nr = hq.map(x => ({ 'Timestamp': '11/10/2026 09:00:00', '심방 날짜': +TQ.slice(5, 7) + '/' + +TQ.slice(8), '성도 이름': '파파파', '구분': '셀원', '전화 / 만남': '전화', '내용': '질문 시험용 아주 사적인 기록', '대화 깊이': '중간', '기록ID': 'C960', '출처': '폼', '심방일': TQ })[x] || '');
    RT.rows.push(nr);
    await reload();
    const key = await page.evaluate(() => (M().visits.find(x => x.id === 'C960') || {}).key);
    await page.evaluate(k => openLayer('detail', { key: k }), key); await tidy();
    const LQ = '.layer:last-child';
    eq('㉞ 기록 창에 다음 심방 질문 칸 · 붙여넣기 단추', [await page.$$eval(LQ + ' .qnsec', x => x.length), await page.$$eval(LQ + ' [data-act="qnpaste"]', x => x.length)], [1, 1]);
    await page.click(LQ + ' [data-act="qnpaste"]'); await page.waitForTimeout(200);
    await page.fill('#qnPasteText', '7. 다음 심방 질문\n\n1. 파파파 님 요즘 잠은 잘 주무시나요?\n2. 지난번 이야기한 모임은\n어떻게 되었나요?\n');
    await page.click(LQ + ' [data-act="qnpastego"]'); await page.waitForTimeout(1200);
    const QT = () => (tab('다음 질문') || { rows: [] }).rows, qrow = () => QT().find(r => r[0] === 'C960') || [];
    eq('㉞ 붙여넣기 → 체크리스트 둘 (제목 · 번호 뗌 · 이어진 줄 합침)', await page.$$eval(LQ + ' .todo.qn .lab', x => x.map(e => e.textContent)), ['파파파 님 요즘 잠은 잘 주무시나요?', '지난번 이야기한 모임은 어떻게 되었나요?']);
    eq("㉞ '다음 질문' 탭이 생기고 머리글 · 그 기록 한 줄", [JSON.stringify(QT()[0]), qrow()[1], qrow()[2]], [JSON.stringify(['기록ID', '성도', '질문', '수정']), '파파파', '[ ] 파파파 님 요즘 잠은 잘 주무시나요?\n[ ] 지난번 이야기한 모임은 어떻게 되었나요?']);
    await page.fill('#qnIn', '셋째 질문'); await page.press('#qnIn', 'Enter'); await page.waitForTimeout(1000);
    await page.click(LQ + ' [data-act="qntick"][data-k="0"]'); await page.waitForTimeout(1000);
    await page.click(LQ + ' [data-act="qndel"][data-k="1"]'); await page.waitForTimeout(1000);
    eq('㉞ 한 줄 적기(Enter) · 체크 · 지우기 → 같은 줄을 고쳐 쓴다(줄 하나)', [QT().filter(r => r[0] === 'C960').length, qrow()[2]], [1, '[x] 파파파 님 요즘 잠은 잘 주무시나요?\n[ ] 셋째 질문']);
    await reload();
    if (process.env.SHOT) { await page.$eval(LQ + ' .qnsec', e => e.scrollIntoView()); await page.screenshot({ path: process.env.SHOT + '/qn.png' }); }
    eq('㉞ 다시 읽어도 그대로', await page.$$eval(LQ + ' .todo.qn', x => x.map(e => (e.classList.contains('done') ? 'x ' : '_ ') + e.querySelector('.lab').textContent)), ['x 파파파 님 요즘 잠은 잘 주무시나요?', '_ 셋째 질문']);
    await page.click(LQ + ' [data-act="qnb7"]'); await tidy();
    eq("㉞ BLOCK7 로 — 글은 '이름 심방' · 하위 항목 미리보기는 안 물어본 것만", [await page.inputValue('.layer:last-child [data-f="text"]'), await page.$$eval('.layer:last-child .qnprev li', x => x.map(e => e.textContent))], ['파파파 심방', ['셋째 질문']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/qnb7.png' });
    await page.click('.layer:last-child [data-act="b7send"]'); await page.waitForTimeout(1200);
    const ib = await page.evaluate(() => window.__inbox), nt = (ib[0] || [])[1] || {};
    eq('㉞ 쪽지 한 줄 — 내 쪽지함 · 이름 심방 · 하위 항목 · 나눈 이야기 없음', [ib.length, (ib[0] || [])[0], nt.text, JSON.stringify(nt.subs), JSON.stringify(ib).includes('사적인')], [1, 'pray/u/c/b7inbox', '파파파 심방', JSON.stringify(['셋째 질문']), false]);
  }

  // ㉟ (1112-M) 한 심방에 여러 이름 · '○○ 셀' 명단 · 한 분씩 → 시트 한 줄(이름 칸 쉼표 · 내용 칸 '◆ 이름' 줄)
  {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    await page.evaluate(() => { CELLS.state = 'idle'; CELLS.groups = null; try { localStorage.removeItem(CELL_SB_KEY); } catch (e) { } openEdit(null); }); await tidy();
    const LM = '.layer:last-child', Q = LM + ' [data-f="nameq"]', RT = tab('Form Responses 1');
    const chips = () => page.$$eval(LM + ' .who .wc', x => x.map(e => (e.classList.contains('grp') ? '셀:' : '') + e.textContent));
    await page.click(Q); await page.keyboard.type('여럿가, 여럿나,'); await page.waitForTimeout(300);
    eq('㉟ 쉼표를 치면 알약 · 입력 칸은 비고 계속 쓰는 중(자판 그대로)', [await chips(), await page.inputValue(Q), await page.evaluate(() => document.activeElement && document.activeElement.dataset.f)], [['여럿가', '여럿나'], '', 'nameq']);
    eq('㉟ 두 분이면 한 분씩 칸 둘', await page.$$eval(LM + ' .pnote .pn-h', x => x.map(e => e.textContent)), ['여럿가', '여럿나']);
    await page.keyboard.type('여럿다'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    eq('㉟ Enter 로도 알약', await chips(), ['여럿가', '여럿나', '여럿다']);
    await page.fill(LM + ' [data-f="pn:1"]', '여럿나 몫 이야기\n둘째 줄');
    await page.click(LM + ' .who .wc:has-text("여럿나") [data-act="whox"]'); await page.waitForTimeout(300);
    eq('㉟ × 로 빼면 그 분 몫 글도 함께 빠지고 되돌리기가 뜬다', [await chips(), await page.evaluate(() => !!topLayer().form.pn['여럿나']), await page.$$eval('.toast-act', x => x.length)], [['여럿가', '여럿다'], false, 1]);
    await page.click('.toast-act'); await page.waitForTimeout(300);
    eq('㉟ 되돌리기 → 이름 · 글 다시', [await chips(), await page.evaluate(() => topLayer().form.pn['여럿나'].text)], [['여럿가', '여럿다', '여럿나'], '여럿나 몫 이야기\n둘째 줄']);
    // '○○ 셀' — 셀 케어 명단(읽기만)
    await page.evaluate(() => localStorage.setItem(CELL_SB_KEY, JSON.stringify({ access_token: 'tok', refresh_token: 'rt', expires_at: Math.floor(Date.now() / 1000) + 3600 })));
    const nCc = LOG.length;
    await page.click(Q); await page.keyboard.type('나무 셀'); await page.waitForTimeout(200);
    eq("㉟ '○○ 셀' 을 치면 후보 맨 앞에 '명단 불러오기'", await page.$eval(LM + ' #nameSugg .grpsg', e => e.textContent), '나무 셀 명단 불러오기');
    await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    eq('㉟ 셀 케어 명단 → 셀 표시(맨 앞) + 셀리더 + 셀원 알약 · 셀 케어엔 읽기만', [await chips(), LOG.slice(nCc).filter(x => x[0] === 'cc-write').length], [['셀:나무 셀', '여럿가', '여럿다', '여럿나', '나리더', '셀원셋'], 0]);
    eq('㉟ 몇 분을 넣었는지 알린다', await page.$eval('.toast', e => e.textContent), '나무 셀 명단에서\n2명을 넣었습니다\n안 오신 분은 × 로 빼 주세요');
    if (process.env.SHOT) { await page.$eval(LM + ' .who', e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200); await page.screenshot({ path: process.env.SHOT + '/multi-who.png' }); }
    await page.fill(LM + ' [data-f="pn:0"]', '여럿가 몫');
    await talk(page, [['s', '함께 나눈 이야기']], LM);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/multi-edit.png' });
    await page.click(LM + ' [data-act="saverec"]'); await page.waitForTimeout(2000);
    const row = (RT.rows || []).find(r => String(r[2]).startsWith('나무 셀')) || [], H = RT.rows[0];
    eq("㉟ 시트 한 줄 — 이름 칸 쉼표(셀 표시 맨 앞) · 내용 칸 끝에 '◆ 이름' 줄(이름 칸 차례, 빈 칸은 빠짐)", [row[2], row[H.indexOf('내용')]],
      ['나무 셀, 여럿가, 여럿다, 여럿나, 나리더, 셀원셋', '성도: 함께 나눈 이야기\n\n◆ 여럿가\n여럿가 몫\n\n◆ 여럿나\n여럿나 몫 이야기\n둘째 줄']);
    await page.waitForTimeout(800);
    eq("㉟ '심방' 캘린더 제목은 셀 표시만(사람 이름을 늘어놓지 않음)", CAL.events.filter(e => e.status !== 'cancelled' && /나무 셀/.test(e.summary || '')).map(e => /여럿/.test(e.summary) ? 'X' : 'ok'), ['ok']);
    // 열람 · 성도 화면
    const key = await page.evaluate(() => (M().visits.find(v => v.name.startsWith('나무 셀')) || {}).key);
    await page.evaluate(k => openLayer('detail', { key: k }), key); await tidy();
    eq('㉟ 열람 — 셀 표시 + 다섯 분 이름(누르면 그 분) · 한 분씩 둘', [await page.$eval(LM + ' .dt-who .grp', e => e.textContent), await page.$$eval(LM + ' .dt-who button[data-act="person"]', x => x.map(e => e.dataset.v)), await page.$$eval(LM + ' .pnv .pn-h', x => x.map(e => e.dataset.v))],
      ['나무 셀', ['여럿가', '여럿다', '여럿나', '나리더', '셀원셋'], ['여럿가', '여럿나']]);
    if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT + '/multi-detail.png' });
    await page.click(LM + ' .dt-who button[data-v="여럿나"]'); await tidy();
    eq('㉟ 성도 화면(여럿나) — 함께한 심방이 그 분 흐름에 · 그 분 몫 글 첫 줄 · 함께 N분', await page.$$eval(LM + ' .tl button[data-act="open"]', x => x.map(e => e.querySelector('.t2').textContent + '|' + ((e.querySelector('.withn') || {}).textContent || ''))), ['여럿나 몫 이야기|함께 4분']);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    // 안 바꾸고 저장 → 시트에 아무것도 안 쓴다
    const before = JSON.stringify(RT.rows);
    await page.click(LM + ' [data-act="edit"]'); await tidy();
    eq('㉟ 고치기 — 알약 · 한 분씩 글 그대로', [await chips(), await page.inputValue(LM + ' [data-f="pn:2"]')], [['셀:나무 셀', '여럿가', '여럿다', '여럿나', '나리더', '셀원셋'], '여럿나 몫 이야기\n둘째 줄']);
    await page.click(LM + ' [data-act="saverec"]'); await page.waitForTimeout(1500);
    eq('㉟ 안 바꾸고 저장하면 시트 그대로', JSON.stringify(RT.rows) === before, true);
    // 셀 케어를 못 읽으면 — 지난번 그 셀 심방 명단
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    await page.evaluate(() => { CELLS.state = 'idle'; CELLS.groups = null; localStorage.removeItem(CELL_SB_KEY); openEdit(null); }); await tidy();
    await page.click(Q); await page.keyboard.type('나무 셀'); await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    eq('㉟ 셀 케어 로그인이 없으면 지난번 그 셀 심방 명단으로', [await chips(), await page.$eval('.toast', e => e.textContent.split('\n')[0])], [['셀:나무 셀', '여럿가', '여럿다', '여럿나', '나리더', '셀원셋'], '지난번 나무 셀 심방 명단에서']);
    await page.click(Q); await page.keyboard.type('없는 셀'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    eq('㉟ 어디에도 없는 셀이면 셀 표시만 두고 알린다', [(await chips())[1], await page.$eval('.toast', e => e.textContent.split('\n')[0])], ['셀:없는 셀', '없는 셀 명단을 찾지 못했습니다']);
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  }

  // ㊱ (1112-N) vNext — 시험 시트 · 새 칸 더하기 · 새 칸 입력
  {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    const LN = '.layer:last-child', RT = tab('Form Responses 1');
    await page.evaluate(() => openEdit(null)); await tidy();
    eq('㊱ 새 칸이 없는 시트 — 새 기록 화면은 예전 그대로(핵심 한줄 · 상세 기록 없음)', await page.$$eval(LN + ' [data-f="core"], ' + LN + ' [data-act="nxdet"]', x => x.length), 0);
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    // 시험 시트로 — 운영은 'LIVE', 사본은 'S'(가짜 시트)
    const accBefore = [];
    await page.evaluate(() => { window.__cfg = []; DB = { doc: p => ({ set: async o => { window.__cfg.push([p, JSON.parse(JSON.stringify(o))]); }, get: async () => ({ exists: false }) }) }; window.firebase = { firestore: { FieldValue: { arrayUnion: x => ({ __u: x }) } } };
      save({ sheet: { id: 'LIVE', name: '운영 시트' }, form: { id: 'F', name: '시험 폼' }, at: 1 }); trialSet({ id: 'S', name: '사본 시트' }); });
    await page.waitForTimeout(1500);
    const c0 = REQ.cal || 0;
    await reload();
    eq('㊱ 시험 시트 — 사본을 열고 · 띠가 보이고 · 계정에는 아무것도 안 올림 · 폼은 없는 것으로', await page.evaluate(() => [saved().sheet.id, saved().form, !$('trialBar').hidden, window.__cfg.length, savedRaw().sheet.id]), ['S', null, true, 0, 'LIVE']);
    eq('㊱ 시험 시트에서는 캘린더에 묻지도 않는다', (REQ.cal || 0) - c0, 0);
    eq('㊱ 시험 시트에서는 BLOCK7 로 안 보낸다', await page.evaluate(() => inboxPush({ t: 'x' }).then(() => 'sent', e => e.message)), '시험 시트에서는 BLOCK7 로 보내지 않습니다');
    // 새 칸 더하기 (설정 › 연결)
    await page.evaluate(() => openLayer('settings')); await tidy(); await stab(page, '연결');
    eq('㊱ 설정 — 시험 끝내기 · 새 칸 더하기 단추', [await page.$$eval(LN + ' [data-act="trialend"]', x => x.length), await page.$$eval(LN + ' [data-act="nxprep"]', x => x.length)], [1, 1]);
    const before = JSON.stringify(RT.rows.slice(1).map(r => r.slice(0, 15)));
    const head0 = RT.rows[0].filter(Boolean).length;
    await page.click(LN + ' [data-act="nxprep"]'); await page.waitForTimeout(2000);
    eq('㊱ 응답 탭 끝에 아홉 칸(R 자리부터 · 다음 질문 열은 없음 · 2·3·4단계 언급된 성도)', RT.rows[0].slice(head0), ['핵심 한줄', '상세 기록', '장기 관찰', '우선순위', '정보 성격', '모임ID', '원본ID', '가져오기 해시', '언급된 성도']);
    eq('㊱ 있던 줄 값은 그대로', JSON.stringify(RT.rows.slice(1).map(r => r.slice(0, 15))), before);
    eq('㊱ 액션 탭 끝에 실행근거 · 새 탭 둘(머리글)', [tab('액션').rows[0].slice(-1), (tab('모임') || { rows: [[]] }).rows[0][0], (tab('AI 입력대기') || { rows: [[]] }).rows[0].slice(0, 5)], [['실행근거'], '모임ID', ['접수ID', '접수시각', '스키마버전', '패킷JSON', '상태']]);
    eq('㊱ 한 번 더 눌러도 더 늘지 않는다(단추가 \'더함\' 으로)', await page.$$eval(LN + ' [data-act="nxprep"]', x => x.length), 0);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    // 새 기록 — 새 칸에 적기
    await page.evaluate(() => { DATA.pray = { idx: {}, people: ['기도만분'], at: Date.now() }; openEdit(null); }); await tidy();
    await page.click(LN + ' [data-f="nameq"]'); await page.keyboard.type('기도만'); await page.waitForTimeout(300);
    eq('㊱ 이름 후보에 기도노트 사람(심방 기록 없어도) · 출처 표시', await page.$$eval(LN + ' #nameSugg button', x => x.map(e => e.textContent)), ['기도만분 기도노트']);
    await page.click(LN + ' #nameSugg button'); await page.waitForTimeout(200);
    await page.fill(LN + ' [data-f="core"]', '수술 앞두고 불안하심');
    eq('㊱ 상세 기록은 처음엔 접혀 있다', await page.$$eval(LN + ' [data-f="detail"]', x => x.length), 0);
    await page.click(LN + ' [data-act="nxdet"]'); await page.waitForTimeout(200);
    await page.fill(LN + ' [data-f="detail"]', '## 상황\n- 다음 주 수술\n\n## 기도\n- 평안');
    for (const [k, v] of [['prio', '이번주'], ['basis', '전언']]) { const sel = LN + ' [data-act="fone"][data-k="' + k + '"][data-v="' + v + '"]'; if (!(await page.isVisible(sel))) await page.click(LN + ' [data-act="crow"][data-k="' + k + '"]').catch(() => {}); await page.click(sel); }
    await page.fill(LN + ' [data-f="longObs"]', '가정 돌봄 부담');
    await page.fill(LN + ' [data-f="qn"]', '1. 수술은 잘 되었나요?\n2. 식사는 어떠세요?');
    await page.click(LN + ' [data-act="saverec"]'); await page.waitForTimeout(2000);
    const H2 = RT.rows[0], nrow = RT.rows.find(r => r[H2.indexOf('성도 이름')] === '기도만분') || [], at = n => nrow[H2.indexOf(n)];
    eq('㊱ 새 줄 — 새 칸에 이름으로 · 상세 기록 줄바꿈 그대로 · 내용 칸은 비어 있음(뜻 그대로)', [at('핵심 한줄'), at('상세 기록'), at('장기 관찰'), at('우선순위'), at('정보 성격'), at('내용') || ''],
      ['수술 앞두고 불안하심', '## 상황\n- 다음 주 수술\n\n## 기도\n- 평안', '가정 돌봄 부담', '이번주', '전언', '']);
    const qt = tab('다음 질문'), qr = qt ? qt.rows.find(r => r[0] === at('기록ID')) : null;
    eq('㊱ 다음 질문은 \'다음 질문\' 탭에(기록ID · 두 줄)', qr ? [qr[1], qr[2]] : null, ['기도만분', '[ ] 수술은 잘 되었나요?\n[ ] 식사는 어떠세요?']);
    eq('㊱ 덧붙임 탭에는 아무것도 안 들어간다', (tab('덧붙임').rows.filter(r => r[0] === at('기록ID'))).length, 0);
    eq('㊱ 시험 시트에서 기록을 적어도 캘린더에는 안 간다', (REQ.cal || 0) - c0, 0);
    // 열람
    const key = await page.evaluate(id => (M().visits.find(v => v.id === id) || {}).key, at('기록ID'));
    await page.evaluate(k => openLayer('detail', { key: k }), key); await tidy();
    eq('㊱ 열람 — 우선순위 · 전해 들음 · 핵심 한줄 · 상세 기록(접힘) · 장기 관찰', [await page.$eval(LN + ' .nx-core-v', e => e.textContent), await page.$$eval(LN + ' .nx-detail', x => x.length), await page.$$eval(LN + ' [data-act="detv"]', x => x.length)],
      ['이번주전해 들음수술 앞두고 불안하심', 0, 1]);
    await page.click(LN + ' [data-act="detv"]'); await page.waitForTimeout(200);
    eq('㊱ 상세 기록 펴기 — 글 그대로(꾸밈 없이 안전하게)', await page.$eval(LN + ' .nx-detail', e => e.textContent), '## 상황\n- 다음 주 수술\n\n## 기도\n- 평안');
    // 고치기 — 안 바꾸면 그대로 · 다음 질문만 바꾸면 탭만
    const snap = JSON.stringify(RT.rows), qsnap = JSON.stringify(qt.rows);
    await page.click(LN + ' [data-act="edit"]'); await tidy();
    eq('㊱ 고치기 — 상세 기록은 펴진 채 · 다음 질문은 탭에서', [await page.inputValue(LN + ' [data-f="detail"]'), await page.inputValue(LN + ' [data-f="qn"]')], ['## 상황\n- 다음 주 수술\n\n## 기도\n- 평안', '수술은 잘 되었나요?\n식사는 어떠세요?']);
    await page.click(LN + ' [data-act="saverec"]'); await page.waitForTimeout(1500);
    eq('㊱ 안 바꾸고 저장 — 시트 · 다음 질문 탭 그대로', [JSON.stringify(RT.rows) === snap, JSON.stringify(qt.rows) === qsnap], [true, true]);
    await page.click(LN + ' [data-act="edit"]'); await tidy();
    await page.fill(LN + ' [data-f="qn"]', '수술은 잘 되었나요?\n새로 여쭐 것');
    await page.click(LN + ' [data-act="saverec"]'); await page.waitForTimeout(1500);
    eq('㊱ 다음 질문만 바꾸면 탭만 바뀐다', [JSON.stringify(RT.rows) === snap, qt.rows.find(r => r[0] === at('기록ID'))[2]], [true, '[ ] 수술은 잘 되었나요?\n[ ] 새로 여쭐 것']);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    // 시험 끝내기
    await page.evaluate(() => trialSet(null)); await page.waitForTimeout(300);
    eq('㊱ 시험 끝 — 운영 시트로 · 띠 사라짐', await page.evaluate(() => [saved().sheet.id, saved().trialOn || false, $('trialBar').hidden]), ['LIVE', false, true]);
    eq('㊱ 운영 시트를 시험 시트로 고를 수 없다', await page.evaluate(() => { trialSet({ id: 'LIVE', name: 'x' }); return saved().trialOn || false; }), false);
    await page.evaluate(() => { save({ sheet: { id: 'S', name: '시험 시트' }, trial: null }); }); await reload();
  }

  // ㊲ (1112-N 2·3·4) 붙여넣어 채우기 — 이름 · 내용은 모두 지어낸 것
  {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    const LN = '.layer:last-child', RT = tab('Form Responses 1');
    const act = (text, authority, kind, x) => Object.assign({ text, authority, owner: null, due_date: null, priority: '일반', kind, target_person: null }, x || {});
    const rec = (name, x) => Object.assign({ person_name: name, person_confirmed: true, speaker_label: null, category: null, contact_method: '전화', depth: '중간', summary_line: name + ' 핵심 한줄', brief_note: name + ' 짧은 메모',
      detailed_note_markdown: '### 경과\n' + name + ' 자세한 이야기', priority: '일반', long_term_watch: name + ' 장기 관찰', information_basis: '직접', tags: [], next_questions: [], actions: [] }, x || {});
    const P1 = { schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: 'f_e2e_call', source_url: null, title: '가미정 통화', recorded_at: null, duration_ms: 1000 },
      event: { kind: 'call', date: '2026-11-12', title: '가미정 — 섬김', group_summary: '', details_markdown: '', location: null },
      records: [rec('가미정', { category: '부산', information_basis: '전언', tags: ['돌봄', '교회', '사역'], next_questions: ['마음은 정리되었나?', '안내를 보완할까?'],
        actions: [act('가미정 성도에게 감사 인사', 'AI 제안', '연락'), act('다음 봉사 안내 보완', 'AI 제안', '기타')] })],
      unknown_speakers: [], mentioned_people: ['윤정(성씨 미확인)', '형만(성씨 미확인)'] };
    const P2 = { schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: 'f_e2e_cell', source_url: null, title: '셀 모임', recorded_at: null, duration_ms: null },
      event: { kind: 'group', date: '2026-11-11', title: '셀모임 — 첫사랑', group_summary: '기도 · 말씀 나눔', details_markdown: '### 권면\n예배 · 기도', location: null },
      records: [rec('나호근', { contact_method: '셀모임', priority: '장기관찰', actions: [act('예배 회복 경청', 'AI 제안', '중보')] }),
        rec('다종만', { contact_method: '셀모임', priority: '장기관찰', actions: [act('새벽기도 확인', 'AI 제안', '중보')] }),
        rec('라요한', { contact_method: '셀모임', priority: '장기관찰', actions: [act('쉬운 코드 찬양곡 찾아주기', '실제 약속', '중보')] })],
      unknown_speakers: ['화자3: 말씀 읽기를 하겠다는 분. 실명 미확인.'], mentioned_people: [] };
    const paste = async (obj) => {
      await page.evaluate(() => openEdit(null)); await tidy();
      await page.click(LN + ' [data-act="impopen"]'); await tidy();
      await page.fill(LN + ' [data-f="ipaste"]', typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2));
      await page.click(LN + ' [data-act="impgo"]'); await tidy();
    };
    const rowsOf = (t, f) => (tab(t) ? tab(t).rows.slice(1).filter(f) : []);
    const col = (r, n) => r[RT.rows[0].indexOf(n)];
    await page.evaluate(() => { DATA.pray = { idx: {}, people: ['김윤정', '박윤정', '차형만', '나호근'], at: Date.now() }; });
    eq('㊲ 새 기록 화면 위에 \'붙여넣어 채우기\'', await page.evaluate(() => { openEdit(null); render(); const n = document.querySelectorAll('.layer:last-child [data-act="impopen"]').length; topLayer().dirty = false; closeLayer(true); return n; }), 1);
    await page.waitForTimeout(300);
    // 규격 오류 — 붙이기 화면에 남고 이유를 보인다
    const badP = JSON.parse(JSON.stringify(P1)); badP.records[0].priority = '급함';
    await paste(badP);
    eq('㊲ 규격 오류 — 저장으로 안 넘어가고 어디가 왜 틀렸는지', [await page.$$eval(LN + ' [data-f="ipaste"]', x => x.length), await page.$eval(LN + ' .imp-err', e => e.textContent)], [1, 'records[0].priority — "급함" 는 허용 값(긴급 · 이번주 · 장기관찰 · 일반)이 아닙니다']);
    // 김미정 통화를 본뜬 것
    await page.fill(LN + ' [data-f="ipaste"]', JSON.stringify(P1)); await page.click(LN + ' [data-act="impgo"]'); await tidy();
    eq('㊲ 미리보기 — 기록 하나 · 모임 없음 · 핵심 한줄 · 전해 들음 · AI 제안 둘은 체크 안 됨', [await page.$$eval(LN + ' .imp-card', x => x.length), await page.$eval(LN + ' .imp-card .imp-core', e => e.textContent), await page.$$eval(LN + ' .imp-card .nx-heard', x => x.map(e => e.textContent)), await page.$$eval(LN + ' .imp-act', x => x.map(e => e.getAttribute('aria-pressed')))],
      [1, '가미정 핵심 한줄', ['전해 들음'], ['false', 'false']]);
    const issues = await page.$$eval(LN + ' .imp-attr > div:first-child', x => x.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    eq('㊲ 속성에 없는 값 — 구분 부산 · 태그 돌봄 · 사역 · 할 일 종류 연락', issues, ['구분 · 부산 가미정', '태그 · 돌봄 가미정', '태그 · 사역 가미정', '액션 · 연락 가미정']);
    if (process.env.SHOT) { await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await page.screenshot({ path: process.env.SHOT + '/imp-review.png' }); await page.setViewportSize({ width: 760, height: 900 }); await page.waitForTimeout(300); }
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    eq('㊲ 속성을 다 고르기 전엔 다음으로 안 간다', await page.$$eval(LN + ' .imp-attr', x => x.length), 4);
    const pickAttr = async (val, mode, to) => { const ix = await page.evaluate(v => topLayer().issues.findIndex(x => x.val === v && !x.done), val); if (ix < 0) { eq('㊲ (시험 자료) 속성에 없는 값이어야 함: ' + val, false, true); return; } await page.click(LN + ' [data-act="impattr"][data-v="' + ix + '|' + mode + '|' + (to || '') + '"]'); await page.waitForTimeout(150); };
    await pickAttr('부산', 'add'); await pickAttr('돌봄', 'add'); await pickAttr('사역', 'map', '교회'); await pickAttr('연락', 'add');
    eq('㊲ 기존 값으로 바꾼 태그 · 더할 것 안내', [await page.evaluate(() => topLayer().d.recs[0].form.tags), await page.$eval(LN + ' .imp > p.muted:last-of-type', e => e.textContent).catch(() => '')].map(String)[0], '돌봄,교회');
    // 고치기 → 새 기록 화면을 그대로 · 고친 것 담기
    await page.click(LN + ' [data-act="impedit"][data-v="0"]'); await tidy();
    eq('㊲ 고치기 — 새 기록 화면에 칸이 채워져 열림(핵심 한줄 · 상세 기록 · 다음 질문)', [await page.inputValue(LN + ' [data-f="core"]'), await page.inputValue(LN + ' [data-f="detail"]'), await page.inputValue(LN + ' [data-f="qn"]'), await page.$eval(LN + ' [data-act="saverec"]', e => e.textContent)],
      ['가미정 핵심 한줄', '### 경과\n가미정 자세한 이야기', '마음은 정리되었나?\n안내를 보완할까?', '고친 것 담기']);
    await page.fill(LN + ' [data-f="core"]', '봉사 오해가 배움으로 이어졌다는 소식');
    const before0 = JSON.stringify(RT.rows);
    await page.click(LN + ' [data-act="saverec"]'); await tidy();
    eq('㊲ 고친 것은 미리보기로 · 시트에는 아직 안 씀', [await page.$eval(LN + ' .imp-card .imp-core', e => e.textContent), JSON.stringify(RT.rows) === before0], ['봉사 오해가 배움으로 이어졌다는 소식', true]);
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    const lk = async () => page.$$eval(LN + ' .lk-row', x => x.map(e => e.querySelector('.lk-raw').textContent + ' → ' + e.querySelector('.lk-to').textContent.trim() + ' | ' + e.querySelector('.lk-st').textContent));
    eq('㊲ 성도 연결 확인 — 기록 성도(명단에 없음 → 새 성도) · 윤정(후보 둘 → 고르기 전) · 형만(후보 하나 → 이름만 같아 붙임)', await lk(),
      ['가미정 → 가미정 새 성도 | 새 성도로 추가', '윤정(성씨 미확인) → 후보 2분 중 고르기 | 골라 주세요', '형만(성씨 미확인) → 차형만 기도노트 · 심방 기록 없음 | 이름만 같아 붙임']);
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(300);
    eq('㊲ 고르기 전엔 저장 안 됨', [await page.$eval('.toast', e => e.textContent.split('\n')[0]), JSON.stringify(RT.rows) === before0], ['골라야 할 이름이 남았습니다', true]);
    // 이름 고치기 — 같은 명단에서 찾아 고르기
    await page.click(LN + ' .lk-row[data-lk="m0"] [data-act="lkfix"]'); await page.waitForTimeout(200);
    await page.fill(LN + ' [data-f="lkq"]', '김윤'); await page.waitForTimeout(150);
    eq('㊲ 이름 고치기 — 새 기록 이름 칸과 같은 명단 · 없으면 새 성도', await page.$$eval(LN + ' #lkSugg button', x => x.map(e => e.textContent)), ['김윤정 기도노트', '새 성도로 추가: 김윤']);
    if (process.env.SHOT) { await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await page.screenshot({ path: process.env.SHOT + '/imp-fix.png' }); await page.setViewportSize({ width: 760, height: 900 }); await page.waitForTimeout(300); }
    await page.click(LN + ' #lkSugg button[data-v="m0|김윤정"]'); await tidy();
    if (process.env.SHOT) { await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await page.screenshot({ path: process.env.SHOT + '/imp-link.png' }); await page.setViewportSize({ width: 760, height: 900 }); await page.waitForTimeout(300); }
    
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(3000);
    eq('㊲ 저장 — 단계마다 ✓ · 다시 읽어 확인', await page.$$eval(LN + ' .imp-step', x => x.map(e => e.className.replace('imp-step ', '') + ':' + e.querySelector('span:last-child').firstChild.textContent.split(' — ')[0].trim())),
      ['ok:\'속성\' 에 새 선택지 3개', 'ok:\'성도\' 탭에 새 성도 가미정', 'ok:가미정', 'ok:가미정', 'ok:시트를 다시 읽어 확인']);
    if (process.env.SHOT) { await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400); await page.screenshot({ path: process.env.SHOT + '/imp-done.png' }); await page.setViewportSize({ width: 760, height: 900 }); await page.waitForTimeout(300); }
    const g = RT.rows.filter(r => col(r, '성도 이름') === '가미정');
    eq('㊲ 가미정 — 개인 기록 한 줄 · 출처 AI · 정보 성격 전언 · 내용 칸은 짧은 메모 · 원본ID · 언급된 성도(연결만)', g.map(r => [col(r, '출처'), !!col(r, '확인'), col(r, '정보 성격'), col(r, '핵심 한줄'), col(r, '내용'), col(r, '원본ID'), col(r, '언급된 성도'), col(r, '모임ID') || '', col(r, '구분'), col(r, '태그')]),
      [['AI', true, '전언', '봉사 오해가 배움으로 이어졌다는 소식', '가미정 짧은 메모', 'f_e2e_call', '김윤정, 차형만', '', '부산', '돌봄, 교회']]);
    const gid = col(g[0], '기록ID');
    eq('㊲ 체크 안 한 AI 제안 둘 — 액션 탭에 없음 · 상세 기록 끝에 글로만', [rowsOf('액션', r => r[1] === gid).length, col(g[0], '상세 기록').split('\n').slice(-3)], [0, ['### AI 제안(미채택)', '- 가미정 성도에게 감사 인사 · 연락', '- 다음 봉사 안내 보완']]);
    eq('㊲ 언급된 윤정 · 형만은 심방 기록이 생기지 않는다', RT.rows.filter(r => ['김윤정', '차형만', '윤정', '형만'].includes(col(r, '성도 이름'))).length, 0);
    eq('㊲ 다음 질문 탭 · 성도 탭 · 속성 탭', [rowsOf('다음 질문', r => r[0] === gid).map(r => r[2]), rowsOf('성도', r => r[1] === '가미정').length, rowsOf('속성', r => ['부산', '돌봄', '연락'].includes(r[1])).map(r => r[0] + ':' + r[1])],
      [['[ ] 마음은 정리되었나?\n[ ] 안내를 보완할까?'], 1, ['구분:부산', '태그:돌봄', '액션:연락']]);
    await page.evaluate(() => openLayer('person', { name: '김윤정' })); await tidy();
    eq('㊲ 언급된 분 화면 — \'다른 기록에서 언급됨\' 에 그 기록', await page.$$eval(LN + ' .h-sec', x => x.map(e => e.textContent).filter(t => t.startsWith('다른 기록에서 언급됨'))), ['다른 기록에서 언급됨1번']);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }

    // 셀모임을 본뜬 것 — 모임 하나 + 기록 셋 · 미확인 화자는 모임에만 · 실제 약속은 액션 탭
    await paste(P2);
    eq('㊲ 셀모임 미리보기 — 모임 카드(미확인 화자) · 기록 셋 · 실제 약속만 체크', [await page.$$eval(LN + ' .imp-card.meet .imp-unk', x => x.length), await page.$$eval(LN + ' .imp-card:not(.meet)', x => x.length), await page.$$eval(LN + ' .imp-act', x => x.map(e => e.getAttribute('aria-pressed')))], [1, 3, ['false', 'false', 'true']]);
    await pickAttr('셀모임', 'add');
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    eq('㊲ 셀모임 연결 — 있는 분은 자동 · 처음 분은 새 성도', await lk(), ['나호근 → 나호근 기도노트 · 심방 기록 없음 | 자동 연결', '다종만 → 다종만 새 성도 | 새 성도로 추가', '라요한 → 라요한 새 성도 | 새 성도로 추가']);
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(3500);
    const mt = rowsOf('모임', r => r[6] === 'f_e2e_cell');
    eq('㊲ 모임 탭 한 줄 — 미확인 화자는 여기에만', mt.map(r => [r[1], r[2], r[3], r[8]]), [['2026-11-11', '셀모임 — 첫사랑', '모임', '화자3: 말씀 읽기를 하겠다는 분. 실명 미확인.']]);
    const cellRows = RT.rows.filter(r => col(r, '원본ID') === 'f_e2e_cell');
    eq('㊲ 기록 셋 — 모두 그 모임ID · 방식 셀모임 · 화자3 이름의 기록 없음', [cellRows.map(r => col(r, '성도 이름')), cellRows.every(r => col(r, '모임ID') === mt[0][0]), cellRows.map(r => col(r, '전화 / 만남'))], [['나호근', '다종만', '라요한'], true, ['셀모임', '셀모임', '셀모임']]);
    const ry = cellRows.find(r => col(r, '성도 이름') === '라요한'), ya = rowsOf('액션', r => r[1] === col(ry, '기록ID'));
    eq('㊲ 라요한 실제 약속 → 액션 탭(세부 · 상태 할 일 · 실행근거) · 기록의 액션 칸', [ya.map(r => [r[3], r[4], r[7], r[10]]), col(ry, '액션')], [[['중보', '쉬운 코드 찬양곡 찾아주기', '할 일', '실제 약속']], '중보']);
    eq('㊲ 나머지 둘의 AI 제안은 액션 탭에 없다', cellRows.filter(r => col(r, '성도 이름') !== '라요한').map(r => rowsOf('액션', x => x[1] === col(r, '기록ID')).length), [0, 0]);
    await page.click(LN + ' [data-act="close"]'); await tidy();
    const kRy = await page.evaluate(id => (M().visits.find(v => v.id === id) || {}).key, col(ry, '기록ID'));
    await page.evaluate(k => openLayer('detail', { key: k }), kRy); await tidy();
    eq('㊲ 기록 화면 할 일 — 가져온 문장(세부) · 근거가 보이고 체크는 예전대로', await page.$eval(LN + ' .todo .tdet', e => e.textContent), '쉬운 코드 찬양곡 찾아주기 실제 약속');
    await page.click(LN + ' .todo .ck'); await page.waitForTimeout(1200);
    eq('㊲ 체크 → 같은 액션 탭 줄의 상태만(줄이 늘지 않음)', rowsOf('액션', r => r[1] === col(ry, '기록ID')).map(r => r[7]), ['마침']);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }

    // 중복 — 같은 것을 다시 · 원본ID 를 지운 같은 내용
    const n0 = RT.rows.length;
    await paste(P2); await page.click(LN + ' [data-act="implink"]'); await tidy();
    eq('㊲ 같은 셀모임을 다시 — 기록 셋 모두 \'이미 있는 기록(원본ID)\' · 모임도 이미 있음', [await page.$$eval(LN + ' .imp-dup b', x => x.map(e => e.textContent)), await page.$$eval(LN + ' .review b', x => x.some(e => e.textContent === '이 모임은 이미 있습니다'))], [['이미 있는 기록 (원본ID)', '이미 있는 기록 (원본ID)', '이미 있는 기록 (원본ID)'], true]);
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(400);
    eq('㊲ 기본은 저장 안 함 — 아무것도 안 들어감', [await page.$eval('.toast', e => e.textContent.split('\n')[0]), RT.rows.length], ['저장할 기록이 없습니다', n0]);
    await page.evaluate(() => { topLayer().dirty = false; }); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const P1n = JSON.parse(JSON.stringify(P1)); P1n.source.source_id = null; P1n.records[0].summary_line = '봉사 오해가 배움으로 이어졌다는 소식!'; P1n.records[0].long_term_watch = '새 장기 관찰';
    P1n.records[0].summary_line = P1.records[0].summary_line + '  ';   // 해시는 붙여 넣은 원래 글(띄어쓰기 · 기호 무시)로
    await paste(P1n); for (const v of ['부산', '돌봄', '사역', '연락']) { const has = await page.evaluate(x => topLayer().issues.some(i => i.val === x && !i.done), v); if (has) await pickAttr(v, v === '사역' ? 'map' : 'add', v === '사역' ? '교회' : ''); }
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    await page.click(LN + ' .lk-row[data-lk="m0"] [data-act="lkpick"][data-v="m0|박윤정"]'); await tidy();
    eq('㊲ 원본ID 없는 같은 내용 → \'같은 내용\' 으로 잡는다', await page.$$eval(LN + ' .imp-dup b', x => x.map(e => e.textContent)), ['이미 있는 기록 (같은 내용)']);
    await page.click(LN + ' [data-act="impdup"][data-v="0|update"]'); await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(3000);
    const g2 = RT.rows.filter(r => col(r, '성도 이름') === '가미정');
    eq('㊲ 그 기록 갱신 — 새 줄 없이 장기 관찰 · 언급(합침)만 바뀜', [g2.length, col(g2[0], '장기 관찰'), col(g2[0], '언급된 성도')], [1, '새 장기 관찰', '김윤정, 차형만, 박윤정']);
    await page.click(LN + ' [data-act="close"]'); await tidy();

    // Markdown 보고서
    const MDT = ['# 마하늘 짧은 통화', '성도: 마하늘', '날짜: 2026-11-10', '방식: 전화', '대화 깊이: 얕음', '## 핵심 한줄', '이사 준비로 바쁨', '## 내용', '이번 주 이사.', '## 상세 기록', '### 경과', '- 짐 정리 중', '우선순위: 이번주', '정보 성격: 직접', '## 다음 질문', '- 이사는 잘 마쳤나요?', '## 실제 약속', '- [중보] 이사 위해 기도 (기한 2026-11-15)'].join('\n');
    await paste(MDT);
    eq('㊲ Markdown — 칸이 채워짐(핵심 한줄 · 우선순위 · 실제 약속 체크)', [await page.$eval(LN + ' .imp-src', e => e.textContent.split(' · ')[0]), await page.$eval(LN + ' .imp-card .imp-core', e => e.textContent), await page.$eval(LN + ' .imp-card .nx-prio', e => e.textContent), await page.$$eval(LN + ' .imp-act', x => x.map(e => e.getAttribute('aria-pressed')))],
      ['Markdown 보고서', '이사 준비로 바쁨', '이번주', ['true']]);
    // 저장 중 끊김 → 다시 시도 (액션 탭 쓰기가 한 번 실패)
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    await (async () => { HOOK.failAppend = '액션'; })();
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(3000);
    eq('㊲ 끊김 — 저장된 것 ✓ · 안 된 것 ✗ · 다시 시도 단추', [await page.$$eval(LN + ' .imp-step', x => x.map(e => e.className.replace('imp-step ', ''))), await page.$$eval(LN + ' [data-act="impretry"]', x => x.length)], [['ok', 'ok', 'ok', 'err', 'wait'], 1]);
    await page.click(LN + ' [data-act="impretry"]'); await page.waitForTimeout(3000);
    const mh = RT.rows.filter(r => col(r, '성도 이름') === '마하늘');
    eq('㊲ 다시 시도 — 이어서 끝냄 · 기록은 한 줄 그대로 · 할 일 한 줄(기한)', [await page.$$eval(LN + ' .imp-step', x => x.map(e => e.className.replace('imp-step ', ''))), mh.length, rowsOf('액션', r => r[1] === col(mh[0], '기록ID')).map(r => [r[3], r[4], r[6]])],
      [['ok', 'ok', 'ok', 'ok', 'ok'], 1, [['중보', '이사 위해 기도', '2026-11-15']]]);
    await page.click(LN + ' [data-act="close"]'); await tidy();
  }

  // ㊳ (1112-N 5) AI 입력대기함 — 이름 · 내용은 지어낸 것
  {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(150); }
    const LN = '.layer:last-child', RT = tab('Form Responses 1'), QT = tab('AI 입력대기'), col = (r, n) => r[RT.rows[0].indexOf(n)];
    const pk = (name, src, x) => JSON.stringify(Object.assign({ schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: src, source_url: null, title: name + ' 통화', recorded_at: null, duration_ms: null },
      event: { kind: 'call', date: '2026-11-12', title: name + ' 안부', group_summary: '', details_markdown: '', location: null },
      records: [{ person_name: name, person_confirmed: true, contact_method: '전화', depth: '얕음', summary_line: name + ' 안부 핵심', brief_note: name + ' 안부 통화', detailed_note_markdown: '', priority: '일반', long_term_watch: '', information_basis: '직접', tags: [], next_questions: [], actions: [] }], unknown_speakers: [] }, x || {}));
    const bad = JSON.parse(pk('바오류', 'f_q3')); bad.records[0].depth = '아주 깊음';
    QT.rows.push(['Q1', '2026-11-12 10:00', 'hb-care.v1', pk('바대기', 'f_q1'), '대기', '', 'f_q1', '', ''], ['', '2026-11-12 10:05', 'hb-care.v1', pk('사대기', 'f_q2'), '대기', '', 'f_q2', '', ''], ['Q3', '2026-11-12 10:06', 'hb-care.v1', JSON.stringify(bad), '대기', '', 'f_q3', '', '']);
    await reload(); await page.waitForTimeout(800);
    eq('㊳ 첫 화면 — 새로 들어온 기록 2건 · 규격 오류 1건', await page.$eval('.inbox-bar', e => e.textContent), '새로 들어온 기록 2건규격 오류 1건');
    eq('㊳ 열 때 — 규격 오류 줄은 \'오류\' + 사유 · 접수ID 없던 줄에 붙임 · 맞는 줄은 그대로 대기', [QT.rows[QT.rows.length - 1][4], QT.rows[QT.rows.length - 1][5], /^Q/.test(QT.rows[QT.rows.length - 2][0]), QT.rows[QT.rows.length - 3][4]],
      ['오류', 'records[0].depth — "아주 깊음" 는 허용 값(얕음 · 중간 · 깊음)이 아닙니다', true, '대기']);
    await page.click('.inbox-bar'); await tidy();
    eq('㊳ 대기함 — 대기 둘 · 오류 하나(사유)', [await page.$$eval(LN + ' .inbox-row', x => x.length), await page.$eval(LN + ' .inbox-bad div', e => e.textContent)], [2, 'records[0].depth — "아주 깊음" 는 허용 값(얕음 · 중간 · 깊음)이 아닙니다']);
    await page.evaluate(() => { window.__clip = ''; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__clip = t; } }, configurable: true }); });
    await page.click(LN + ' [data-act="guidecopy"]'); await page.waitForTimeout(200);
    eq('㊳ ChatGPT 지시문 복사 — 지금 시트 주소 · 대기함 탭', await page.evaluate(() => [window.__clip.startsWith('[심방노트 입력]'), window.__clip.includes("'AI 입력대기' 탭"), window.__clip.endsWith('/spreadsheets/d/S/edit')]), [true, true, true]);
    await page.click(LN + ' .inbox-row'); await tidy();
    eq('㊳ 열기 → 붙이기 없이 바로 미리보기 · 대기함에서 빼기 단추', [await page.$eval(LN + ' .ph-head h3', e => e.textContent), await page.$eval(LN + ' .imp-card .imp-core', e => e.textContent), await page.$$eval(LN + ' [data-act="impcancel"]', x => x.length), await page.$$eval(LN + ' [data-f="ipaste"]', x => x.length)],
      ['들어온 기록', '바대기 안부 핵심', 1, 0]);
    await page.click(LN + ' [data-act="implink"]'); await tidy();
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(3500);
    const q1 = QT.rows.find(r => r[0] === 'Q1'), rb = RT.rows.find(r => col(r, '성도 이름') === '바대기');
    eq('㊳ 저장 — 시트를 다시 읽어 확인한 뒤 대기함 \'완료\' · 생성된 기록ID · 처리시각', [await page.$$eval(LN + ' .imp-step', x => x.map(e => e.className.replace('imp-step ', ''))).then(a => a.slice(-2)), q1[4], q1[7] === col(rb, '기록ID'), !!q1[8], col(rb, '출처')],
      [['ok', 'ok'], '완료', true, true, 'AI']);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    eq('㊳ 첫 화면 — 남은 1건', await page.$eval('.inbox-bar b', e => e.textContent), '새로 들어온 기록 1건');
    await page.click('.inbox-bar'); await tidy(); await page.click(LN + ' .inbox-row'); await tidy();
    const n0 = RT.rows.length;
    await page.click(LN + ' [data-act="impcancel"]'); await page.waitForTimeout(1500);
    const q2 = QT.rows.find(r => r[6] === 'f_q2');
    eq('㊳ 대기함에서 빼기 → \'취소\' · 기록은 안 생김 · 첫 화면 알림은 오류만', [q2[4], RT.rows.length, await page.$eval('.inbox-bar', e => e.textContent)], ['취소', n0, '들어온 기록 없음규격 오류 1건']);
    // 같은 녹음이 다시 들어오면 — 미리보기에서 중복으로 잡힌다(대기함은 기록 저장 전이라 따로 막지 않음)
    QT.rows.push(['Q9', '', 'hb-care.v1', pk('바대기', 'f_q1'), '대기', '', 'f_q1', '', '']);
    await reload(); await page.waitForTimeout(800);
    await page.click('.inbox-bar'); await tidy(); await page.click(LN + ' .inbox-row'); await tidy(); await page.click(LN + ' [data-act="implink"]'); await tidy();
    eq('㊳ 같은 녹음 다시 → 이미 있는 기록(원본ID)', await page.$$eval(LN + ' .imp-dup b', x => x.map(e => e.textContent)), ['이미 있는 기록 (원본ID)']);
    await page.click(LN + ' [data-act="impsave"]'); await page.waitForTimeout(1500);
    eq('㊳ 저장할 것이 없으면 대기함 줄을 \'취소\' 로(묻고)', [QT.rows.find(r => r[0] === 'Q9')[4], RT.rows.filter(r => col(r, '성도 이름') === '바대기').length], ['취소', 1]);
  }

  eq('⑦ 화면 오류 없음', errs, []);
  await b.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message, String(e.stack).split('\n').slice(0, 4).join(' | ')); process.exit(1); });
