// 심방 노트(care/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="care-core">)를 떼어 시험한다.
// 시트 · 폼은 HB 의 실제 자료 모양을 본떴지만 **이름 · 내용은 모두 지어낸 것**이다 (공개 저장소).
//
// 지키는 것:
//  ① 열은 순서가 아니라 머리글 이름으로 찾는다 — 폼이 질문을 끼워 넣어 열이 밀려도 같은 칸을 읽는다
//  ② 응답 탭은 이름('Form Responses 1')이 아니라 머리글로 찾는다
//  ③ 날짜 — 폼의 '연도 없는' 날짜("10/31")는 타임스탬프의 해 · 해를 넘긴 기록은 지난해 · 시트 날짜 숫자 · 앱이 적은 심방일이 먼저
//  ④ 여럿 고르기 — 쉼표가 든 선택지('카톡, 문자')를 쪼개지 않는다 · 모르는 글은 기타로
//  ⑤ 앱 열 · 새 탭 계획 — 있는 것은 건너뛰고 마지막 머리글 뒤에 붙인다 · 칸이 모자라면 늘린다 · 열 글자(A · Z · AA)
//  ⑥ 폼 읽기 — 하나/여럿 · 기타 · 날짜(연도 없음) · 시트 머리글과 비교
//  ⑦ C0 쓰기 시험은 10줄 이하(사본)에만 · 폼 줄이 앱 줄을 건드렸으면 잡아낸다 · 기록ID 붙이기는 상한까지만
//  ⑩ C1 열람 — 줄 → 기록 · 보관(지우지 않고 감춤) · 필터(속성 안 '또는', 속성끼리 '그리고') · 성도 · 주 · 달 · 대시보드 셈
//  ⑪ 기기끼리 설정 맞추기 — 고른 시트 · 폼 · 보관 기준만 계정에(users/{uid}/data/care), 나중에 고친 쪽을 따른다 · 심방 내용 · 시험 상태는 안 올린다
//  ⑫ C2 쓰기 — 새 줄은 이름으로 찾은 칸에만 · 안 바꾼 기록을 저장하면 칸이 하나도 안 바뀐다 · 바뀐 칸만 · 그사이 시트에서 고친 칸은 잡는다 · 같은 기록ID 가 둘이면 쓰지 않는다
//  ⑬ 할 일 체크('액션' 탭) · 덧붙임 탭
//  ⑭ 지우기 → 휴지통 — 원래 줄을 {머리글: 값} 으로 통째로 · 되살리면 지금 머리글 자리에 · 그사이 열이 밀려도 · 없는 칸은 알린다
//  ⑯ 속성 · 폼 맞추기 — 처음엔 폼 선택지를 탭으로 · 폼에서 새로 → 앱에 · 앱에서 새로 → 폼에 · 폼에서 뺌 → 앱에서 숨김 · 앱에서 숨김 → 폼에서 뺌(상한) · 한 번 맞추면 다시 맞춰도 할 일 없음
//  ⑱ 할 일 → BLOCK7 할일 — 보낼 글은 종류 · 이름뿐 · 쪽지 모양(BLOCK7 받기와 같은 꼴, sec 비움) · 빈 글 · 틀린 날짜는 안 보냄 · 보낸 날은 'BLOCK7 할일' 칸에만
//  ⑲ 기록도 '심방' 캘린더에 — 2026-10-01 부터 · ✓ 하루 종일 · 계획에서 온 기록은 건너뜀 · 날짜 · 이름은 시트가 이김 · 지운 기록의 일정은 지움(상한 · 우리 표식만 · 시트를 못 읽었으면 안 지움) · 여벌
//  ⑰ 계획 · '심방' 캘린더 — 계획 줄 읽기 · 일정 모양(제목은 이름만 + 앞뒤 글자, 표식만) · 캘린더에서 옮김 → 계획 따라감 · 지움 → 취소됨 · 만들다 끊긴 일정 이어 붙이기 · 두 기기 여벌 지우기(상한) · 기록됨 → ✓
//  ⑳ 출석 — 메모 꼴 붙여 넣기를 칸으로 · 예배 · 모임 · 개인 기도 · 탭은 머리글 이름으로 · 띄어쓰기 무시로 사람 맞춤 · 바뀐 칸만 고침
//  ㉑ 기도노트 표시색 — 기도노트 규칙대로(사람 색 · 묶음 · 분류에 이은 색, 앞 차례가 이김) · 색 이름은 기도노트 것 · 덩어리는 wid 가 같을 때만
//  ㉓ 출석 입력 새로 — '언제 보였나' · 알약 목록(탭 · 기본값 · 더하기 · 옮기기 · 이름 바꾸기 · 지우기 · 상한) · 이름 쉼표로 여럿 · 날짜 단추
//  ⑧ 열쇠 서버: 심방 노트는 '고른 파일만'(drive.file) 권한만 더 묻고, sweeter.my/care/ 로만 돌아간다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
process.env.TZ = 'Asia/Seoul';

const HTML = fs.readFileSync(path.join(__dirname, '..', 'care', 'index.html'), 'utf8');
const m = HTML.match(/<script id="care-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('care-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Array, String, Date, isFinite };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, CARE_KEY, PICKER_KEY, APP_COLS, TABS, C0_MAX_ROWS, headerMap, findResponsesTab, colLetter, planColumns, planTabs, serialYmd, tsYmd, visitYmd,
  splitMulti, splitOne, rowToVisit, formSummary, formVsSheet, optionsOf, canWriteC0, newId, testRowValues, verifyAfterForm, idPatches,
  CFG_FIELDS, CFG_DOC, pickCfg, mergeCfg,
  joinMulti, splitEtc, blankRecord, addTalk, recordFromVisit, validateRecord, recordCells, newRowValues, editPatch, conflictCells, findRowById, a1,
  actionKey, parseActionTab, checkPlan, b7Text, b7Note, b7MarkPlan, parseAddenda, attachExtras, ACT_TAB_HEAD, ID_PATCH_MAX, sheetSerial,
  TRASH_TAB, TRASH_HEAD, trashRow, restoreRow, parseTrash,
  PLAN_NOCAL, PLAN_ST, CAL_DEL_MAX, REC_CAL_FROM, REC_CREATE_MAX, REC_DEL_MAX, recEventBody, recCalSync, evOurs, evRecId, parsePlans, calTitle, evWhen, calEventBody, evCareId, planCalSync, recordFromPlan, planRow, planWhyFor,
  ATTR_MANAGED, FORM_REMOVE_MAX, parseAttrRows, planAttrSync, formUpdateRequests, placeQuestionRequest, etcCandidates, rowHasId, trashHeadState, backupMatches,
  ymdAdd, daysBetween, weekStartOf, monthCells, relDay, buildModel, filterVisits, filterOptions, peopleList, strip10, weeklyDepth, roleHeat, splitPeriods, countBy, ARCHIVE_DEFAULT,
  ATT_TAB, ATT_HEAD, ATT_SVC, parseAttendText, parseAttend, attendOf, attHabit, attRow, attPatch, validateAttend, attendOnlyPeople, prayMarkIndex, prayPeople, prayJoin, attQuiet, ATT_QUIET_DAYS,
  ATT_OPT_TAB, ATT_OPT_FIELDS, ATT_OPT_MAX, attOptDefaults, attOptsParse, attOptsUse, attOptsRows, attOptAdd, attOptRemove, attOptRename, attOptMove, splitNames, attDays, formQOf, PAY_DEFAULT };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// 지금 시트 머리글 (2026-11-06 HB 시트에서 본 그대로) + 폼 선택지 (HB 캡처)
const HEAD = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이'];
const OPT = { roles: ['예배인도자', '예배팀', '셀리더', '셀원', '장년부', '청년부', '중고등부'], methods: ['지나가다 대화', '티타임', '식사', '전화', '카톡, 문자'],
  tags: ['신앙', '교회', '가정', '직장', '학교', '건강'], acts: ['중보', '연결', '보고'] };

// ① 머리글 이름으로
{
  const h = A.headerMap(HEAD).map;
  sc.eq('① 질문 열을 이름으로 찾는다', J([h.ts, h.date, h.name, h.roles, h.method, h.text, h.tags, h.acts, h.depth]), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const moved = ['Timestamp', '심방 날짜', '성도 이름', '대화 깊이', '구분', '장소 · 메모', '전화 / 만남', '내용', '태그', '액션', '기록ID'];
  const h2 = A.headerMap(moved).map;
  sc.eq('① 폼이 질문을 끼워 넣어 열이 밀려도 같은 칸', J([h2.depth, h2.place, h2.method, h2.text, h2['@기록ID']]), [3, 5, 6, 7, 10]);
  sc.eq('① 머리글 앞뒤 빈칸 · 두 칸 빈칸도 같은 이름', A.headerMap([' 성도  이름 ', '내용']).map.name, 0);
  sc.eq('① 한국어 타임스탬프 머리글도', A.headerMap(['타임스탬프', '성도 이름', '내용']).map.ts, 0);
}
// ② 응답 탭 찾기
sc.eq('② 이름이 아니라 머리글로 응답 탭을 찾는다', A.findResponsesTab([{ title: '성도', header: ['성도ID', '이름'] }, { title: '설문지 응답 시트1', header: HEAD }]).title, '설문지 응답 시트1');
sc.eq('② 없으면 null', A.findResponsesTab([{ title: 'x', header: ['a'] }]), null);

// ③ 날짜
sc.eq('③ 연도 없는 날짜 = 타임스탬프의 해', A.visitYmd('10/31', '11/6/2026 10:40:51'), '2026-10-31');
sc.eq('③ 1월 초에 적은 12월 말 심방은 지난해', A.visitYmd('12/30', '1/2/2027 09:00:00'), '2026-12-30');
sc.eq('③ 타임스탬프가 시트 날짜 숫자여도', A.visitYmd('5/21', 43972.44), '2020-05-21');
sc.eq('③ 날짜 칸이 날짜 숫자면 그대로', A.visitYmd(46332, ''), '2026-11-06');
sc.eq('③ 연도가 든 날짜 글은 그대로', A.visitYmd('2026. 11. 4', ''), '2026-11-04');
sc.eq('③ 타임스탬프 없이 연도 없는 날짜는 비운다(지어내지 않는다)', A.visitYmd('10/31', ''), '');
sc.eq('③ 타임스탬프 꼴', J([A.tsYmd('11/6/2026 10:40:51'), A.tsYmd('2026. 11. 6 오전 10:40:51'), A.tsYmd('2026-11-06T01:00:00Z')]), ['2026-11-06', '2026-11-06', '2026-11-06']);
{
  const row = ['', '10/31', '시험성도', '', '', '', '', '', '', '2026-10-30'], h = A.headerMap(HEAD.concat(['심방일'])).map;
  sc.eq('③ 앱이 적은 심방일이 있으면 그것이 먼저', A.rowToVisit(row, h, OPT).ymd, '2026-10-30');
}

// ④ 여럿 고르기
sc.eq('④ 쉼표로 이어진 선택지', J(A.splitMulti('신앙, 교회, 가정', OPT.tags)), { vals: ['신앙', '교회', '가정'], etc: [] });
sc.eq("④ '카톡, 문자' 는 하나", J(A.splitOne('카톡, 문자', OPT.methods)), { val: '카톡, 문자', etc: '' });
sc.eq("④ 여럿 칸 안의 '카톡, 문자' 도 하나", J(A.splitMulti('전화, 카톡, 문자', OPT.methods)), { vals: ['전화', '카톡, 문자'], etc: [] });
sc.eq('④ 모르는 글은 기타로 (구분 여럿 + 기타)', J(A.splitMulti('예배팀, 셀리더, 두나미스', OPT.roles)), { vals: ['예배팀', '셀리더'], etc: ['두나미스'] });
sc.eq('④ 방식 칸의 자유 글("보고 ○○")은 기타', J(A.splitOne('보고 홍길동', OPT.methods)), { val: '', etc: '보고 홍길동' });
sc.eq('④ 빈 칸', J(A.splitMulti('', OPT.tags)), { vals: [], etc: [] });
{
  const h = A.headerMap(HEAD).map;
  const v = A.rowToVisit([46332.44, '11/4', '가나다', '예배팀, 셀리더', '식사', '셀원 근황', '교회, 건강', '중보, 보고', '중간'], h, OPT);
  sc.eq('④ 한 줄 읽기', J([v.ymd, v.name, v.roles, v.method, v.tags, v.acts, v.depth, v.src, v.id]), ['2026-11-04', '가나다', ['예배팀', '셀리더'], '식사', ['교회', '건강'], ['중보', '보고'], '중간', '폼', '']);
}

// ⑤ 열 · 탭 계획
sc.eq('⑤ 열 글자', J([A.colLetter(0), A.colLetter(25), A.colLetter(26), A.colLetter(27), A.colLetter(701), A.colLetter(702)]), ['A', 'Z', 'AA', 'AB', 'ZZ', 'AAA']);
sc.eq('⑤ 앱 열은 마지막 머리글 바로 뒤', J(A.planColumns(HEAD, 26)), { add: A.APP_COLS, start: 9, grow: 0 });
sc.eq('⑤ 칸이 모자라면 늘린다', A.planColumns(HEAD, 10).grow, 5);
sc.eq('⑤ 이미 있는 앱 열은 건너뛴다', J(A.planColumns(HEAD.concat(['기록ID', '출처']), 26).add), ['심방일', '수정', '확인', '보관']);
sc.eq('⑤ 뒤쪽 빈 머리글은 무시하고 붙인다', A.planColumns(HEAD.concat(['', '']), 26).start, 9);
sc.eq('⑤ 새 탭 다섯 · 있는 것은 건너뛴다', J(A.planTabs(['Form Responses 1', '계획'])), ['성도', '액션', '덧붙임', '속성']);

// ⑥ 폼 읽기 (Forms API forms.get 모양)
const FORM = { items: [
  { title: '심방 날짜', questionItem: { question: { questionId: 'q1', dateQuestion: { includeYear: false } } } },
  { title: '성도 이름', questionItem: { question: { questionId: 'q2', textQuestion: {} } } },
  { title: '대화 깊이', questionItem: { question: { questionId: 'q3', choiceQuestion: { type: 'RADIO', options: [{ value: '깊음' }, { value: '중간' }, { value: '얕음' }] } } } },
  { title: '구분', questionItem: { question: { questionId: 'q4', choiceQuestion: { type: 'CHECKBOX', options: OPT.roles.map(v => ({ value: v })).concat([{ isOther: true }]) } } } },
  { title: '전화 / 만남', questionItem: { question: { questionId: 'q5', choiceQuestion: { type: 'RADIO', options: OPT.methods.map(v => ({ value: v })).concat([{ isOther: true }]) } } } },
  { title: '내용', questionItem: { question: { questionId: 'q6', textQuestion: { paragraph: true } } } },
  { title: '태그', questionItem: { question: { questionId: 'q7', choiceQuestion: { type: 'CHECKBOX', options: OPT.tags.map(v => ({ value: v })).concat([{ isOther: true }]) } } } },
  { title: '액션', questionItem: { question: { questionId: 'q8', choiceQuestion: { type: 'CHECKBOX', options: OPT.acts.map(v => ({ value: v })).concat([{ isOther: true }]) } } } },
  { title: '안내 문구', textItem: {} },
] };
{
  const S = A.formSummary(FORM);
  sc.eq('⑥ 질문만 8개 (안내 문구는 뺀다)', S.length, 8);
  sc.eq('⑥ 날짜 · 연도 없음', J([S[0].kind, S[0].includeYear]), ['date', false]);
  sc.eq('⑥ 구분 = 여럿 + 기타 · 선택지 7', J([S[3].multi, S[3].other, S[3].options.length]), [true, true, 7]);
  sc.eq('⑥ 전화 / 만남 = 하나', J([S[4].multi, S[4].options]), [false, OPT.methods]);
  sc.eq('⑥ 긴 글 · 짧은 글', J([S[5].kind, S[1].kind]), ['long', 'short']);
  sc.eq('⑥ 폼과 시트 머리글이 같으면 차이 없음', J(A.formVsSheet(S, HEAD.concat(A.APP_COLS))), { notInSheet: [], notInForm: [] });
  const S2 = S.concat([{ title: '장소 · 메모', kind: 'short', options: [] }]);
  sc.eq('⑥ 폼에 새 질문 → 시트에 아직 없음', J(A.formVsSheet(S2, HEAD).notInSheet), ['장소 · 메모']);
  sc.eq('⑥ 선택지 꺼내기', J(A.optionsOf(S, '액션')), OPT.acts);
}

// ⑦ C0 쓰기 시험
sc.eq('⑦ 10줄 이하만 쓴다 (진짜 시트 36줄은 거절)', J([A.canWriteC0(3), A.canWriteC0(10), A.canWriteC0(36)]), [true, true, false]);
{
  const head = HEAD.concat(A.APP_COLS), h = A.headerMap(head).map;
  const now = Date.parse('2026-11-06T10:00:00+09:00');
  const tr = A.testRowValues(head, h, 'T1', now);
  sc.eq('⑦ 시험 줄 — 이름 · 출처 · 기록ID · 심방일 · 연도 없는 날짜', J([tr[h.name], tr[h['@출처']], tr[h['@기록ID']], tr[h['@심방일']], tr[h.date]]), ['시험 성도 (지워도 됨)', '앱 시험', 'T1', '2026-11-06', '11/6']);
  sc.eq('⑦ 시험 줄 타임스탬프 = 그 시각의 시트 날짜 숫자', A.serialYmd(tr[h.ts]), '2026-11-06');
  const before = [head, tr];
  const formRow = [46332.5, '11/6', '폼시험', '셀원', '전화', '폼으로 낸 줄', '', '', '얕음'];
  const ok = A.verifyAfterForm(before, [head, tr, formRow], 'T1');
  sc.eq('⑦ 폼 줄이 뒤에 붙고 시험 줄은 그대로 → 통과', J([ok.ok, ok.formRows, ok.testRow]), [true, [3], 2]);
  const over = A.verifyAfterForm(before, [head, formRow], 'T1');
  sc.eq('⑦ 폼 줄이 시험 줄을 덮었으면 잡는다', J([over.ok, over.problems[0]]), [false, '앱이 넣은 시험 줄이 사라졌습니다']);
  const changed = tr.slice(); changed[h.text] = '바뀜';
  sc.eq('⑦ 시험 줄 칸이 바뀌었으면 잡는다', A.verifyAfterForm(before, [head, changed, formRow], 'T1').ok, false);
  sc.eq('⑦ 폼을 안 냈으면 그렇다고 말한다', A.verifyAfterForm(before, before, 'T1').problems[0].includes('폼으로 낸 새 줄'), true);
  const dirty = formRow.concat(['', '', '', '', '', '', '']); dirty[h['@출처']] = '폼';
  sc.eq('⑦ 폼 줄의 앱 열에 무언가 있으면 잡는다', A.verifyAfterForm(before, [head, tr, dirty], 'T1').ok, false);
  const ps = A.idPatches([head, tr, formRow, formRow.slice(), ['']], now, 1);
  sc.eq('⑦ 기록ID 붙이기는 빈 줄만 · 상한까지만', J([ps.length, ps[0].row, ps[0].ymd]), [1, 3, '2026-11-06']);
  sc.eq('⑦ 기록ID 열이 없으면 아무것도 안 붙인다', A.idPatches([HEAD, formRow], now, 5).length, 0);
}

// ⑧ 열쇠 서버
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'gcal-functions', 'src', 'index.js'), 'utf8');
  const okLine = src.match(/^const okRet = .*$/m)[0], scLine = src.match(/^const CARE_SCOPES = .*$/m)[0];
  const okRet = new Function(okLine.replace('const okRet =', 'return'))(), CS = new Function(scLine.replace('const CARE_SCOPES =', 'return'))();
  sc.eq('⑧ 심방 노트 권한은 drive.file 하나 (모든 파일 권한 아님)', J(CS), ['https://www.googleapis.com/auth/drive.file']);
  sc.eq('⑧ 돌아갈 자리 — sweeter.my/care/ 와 BLOCK7 은 되고 Sweeter 첫 화면 · 남의 주소는 안 된다',
    J(['https://sweeter.my/care/', 'https://block7.my/', 'https://sweeter.my/', 'https://evil.example/care/', 'https://sweeter.my.evil.com/care/'].map(okRet)), [true, true, false, false, false]);
  sc.eq('⑧ care:true 일 때만 덧붙여 묻는다', /SCOPES\.concat\(req\.body && req\.body\.care === true \? CARE_SCOPES : \[\]\)/.test(src), true);
}
// ⑨ 앱 껍데기
sc.eq('⑨ block7.my 로 열리면 sweeter.my/care/ 로 넘긴다', HTML.includes("location.replace('https://sweeter.my/care/'"), true);
sc.eq('⑨ 2번째 줄 버전 주석 = APP_VERSION', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑨ 로그인은 따로(앱 이름 care) — Sweeter 로그아웃과 묶이지 않게', HTML.includes("firebase.initializeApp(FB_CFG, 'care')"), true);
sc.eq('⑨ 고르기 창은 전용 키로 — 로그인 · 동기화가 쓰는 파이어베이스 키가 아니다',
  [/^AIza/.test(A.PICKER_KEY), A.PICKER_KEY !== 'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE', HTML.includes('.setDeveloperKey(PICKER_KEY)'), HTML.includes('setDeveloperKey(FB_CFG')], [true, true, true, false]);
sc.eq('⑨ 이 기기 저장 이름이 다른 앱과 겹치지 않는다', ['b7v1', 'b7timer_v1', 'pray.v1', 'b7wallet'].includes(A.CARE_KEY), false);

// ⑩ C1 열람 — 지어낸 시트 (HB 시트 모양: 2020년 기록 · 연도 없는 날짜 · '보고 ○○' 기타 글 · 빈 칸)
{
  const H = HEAD.concat(['장소 · 메모']), ts = '11/6/2026 10:40:51';
  const vals = [H,
    [ts, '10/31', '가나다', '장년부', '지나가다 대화', '첫 줄\n둘째 줄', '신앙, 교회', '중보, 보고', '깊음', '바자회'],
    [ts, '11/4', '라마바', '청년부', '티타임', '학교 이야기', '학교', '중보', '중간', ''],
    [ts, '11/3', '사아자', '예배팀, 셀리더', '식사', '근황', '', '', '중간', ''],
    ['5/21/2020 10:37:02', '5/21', '가나다', '두나미스', '보고 차카타', '옛 기록', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    [ts, '11/1', '', '', '', '', '', '', '', ''],
    [ts, '11/5', '라마바', '청년부', '전화', '기타 할 일', '관계', '연결, 상담 연결하기', '얕음', ''],
  ];
  const O = Object.assign({ cutoff: '2025-01-01' }, OPT);
  const m = A.buildModel(vals, O);
  sc.eq('⑩ 빈 줄은 건너뛰고, 이름 · 내용 다 없는 줄은 셈만', J([m.visits.length, m.skipped]), [5, 1]);
  sc.eq('⑩ 최근 것부터 (날짜 내림차순)', J(m.visits.map(v => v.ymd)), ['2026-11-05', '2026-11-04', '2026-11-03', '2026-10-31', '2020-05-21']);
  const old = m.visits.find(v => v.ymd === '2020-05-21');
  sc.eq('⑩ 2020년 기록은 보관(감춤) — 지우지 않고 그대로 있다', J([old.archived, old.text, old.methodLabel, old.allRoles]), [true, '옛 기록', '보고 차카타', ['두나미스']]);
  sc.eq('⑩ 보관 기준을 끄면 보관 안 함', A.buildModel(vals, Object.assign({}, O, { cutoff: '' })).visits.filter(v => v.archived).length, 0);
  const g = m.visits.find(v => v.ymd === '2026-10-31');
  sc.eq('⑩ 깊이 숫자 · 할 일 종류 색 · 장소 · 줄 번호 · 기록ID 없으면 줄 번호로', J([g.depthN, g.actions.map(a => a.k), g.place, g.row, g.key]), [3, ['k1', 'k3'], '바자회', 2, 'r2']);
  const e = m.visits.find(v => v.ymd === '2026-11-05');
  sc.eq("⑩ 폼 '기타' 로 적은 할 일은 기타 + 그 글", J(e.actions), [{ t: '연결', x: '', k: 'k2' }, { t: '기타', x: '상담 연결하기', k: 'k4' }]);
  sc.eq('⑩ 선택지에 없는 태그도 보인다', J(e.allTags), ['관계']);
  sc.eq('⑩ 성도의 구분은 가장 최근 기록 것', J(m.people['가나다'].roles), ['장년부']);
  sc.eq('⑩ 깊이가 빈 옛 기록은 0', old.depthN, 0);
  // 필터
  const live = (f, q) => J(A.filterVisits(m.visits, f, q, false, '').map(v => v.name + v.ymd.slice(5)));
  sc.eq('⑩ 보관 기록은 기본으로 안 보인다', A.filterVisits(m.visits, {}, '', false, '').length, 4);
  sc.eq('⑩ 보관 함께 보기', A.filterVisits(m.visits, {}, '', true, '').length, 5);
  sc.eq('⑩ 같은 속성 안은 또는 (중보 또는 연결)', live({ act: ['중보', '연결'] }), ['라마바11-05', '라마바11-04', '가나다10-31']);
  sc.eq('⑩ 속성끼리는 그리고 (중보 그리고 청년부)', live({ act: ['중보'], role: ['청년부'] }), ['라마바11-04']);
  sc.eq('⑩ 깊이는 숫자로 고른다', live({ depth: [2] }), ['라마바11-04', '사아자11-03']);
  sc.eq('⑩ 여럿 구분 중 하나만 맞아도', live({ role: ['셀리더'] }), ['사아자11-03']);
  sc.eq("⑩ '할 일 있는 기록만'", live({}, 'act'), ['라마바11-05', '라마바11-04', '가나다10-31']);
  sc.eq('⑩ 찾기 — 이름 · 내용', J(A.filterVisits(m.visits, {}, '', false, '학교').map(v => v.name)), ['라마바']);
  const FO = A.filterOptions(m.visits, OPT);
  sc.eq('⑩ 필터 선택지 = 폼 순서 먼저 + 기록에 나온 기타', J([FO.tag.slice(-1)[0], FO.act.includes('기타'), FO.method[0], FO.role.includes('두나미스')]), ['관계', true, '지나가다 대화', false]);
  // 날짜 셈
  sc.eq('⑩ 주는 주일부터', J([A.weekStartOf('2026-11-06'), A.weekStartOf('2026-11-01'), A.weekStartOf('2026-11-07')]), ['2026-11-01', '2026-11-01', '2026-11-01']);
  sc.eq('⑩ 11월 달력 5주 · 첫 칸 11/1 · 3월은 6주가 필요하면 6주', J([A.monthCells('2026-11').length, A.monthCells('2026-11')[0], A.monthCells('2026-08').length]), [35, '2026-11-01', 42]);
  sc.eq('⑩ 날 말', J([A.relDay('2026-11-06', '2026-11-06'), A.relDay('2026-11-05', '2026-11-06'), A.relDay('2026-10-31', '2026-11-06'), A.relDay('', '2026-11-06')]), ['오늘', '어제', '6일 전', '날짜 모름']);
  sc.eq('⑩ 달 넘김 날 셈', A.daysBetween('2026-10-31', '2026-11-06'), 6);
  // 성도
  const P = A.peopleList(m, m.visits.filter(v => !v.archived), '2026-11-30', 21);
  const pg = P.find(p => p.name === '가나다');
  sc.eq('⑩ 성도 — 보관 기록은 빼고 · 마지막 날 · 3주 넘으면 오래 못 만남', J([P.length, pg.visits.length, pg.last, pg.days, pg.stale]), [3, 1, '2026-10-31', 30, true]);
  sc.eq('⑩ 최근 10주 띠 — 그 주 가장 깊은 대화', J(A.strip10(m.visits.filter(v => v.name === '라마바'), '2026-11-06').slice(-1)), [2]);
  // 대시보드
  const wk = A.weeklyDepth(m.visits.filter(v => !v.archived), '2026-11-06', 8);
  sc.eq('⑩ 주별 — 8주 · 이번 주(11/1~)에 3번 · 깊이별 · 그 전 주 1번', J([wk.length, wk[7].t, wk[7].c, wk[6].t]), [8, 3, { 0: 0, 1: 1, 2: 2, 3: 0 }, 1]);
  const hm = A.roleHeat(m.visits, '2026-11-06', ['청년부', '장년부'], 8);
  sc.eq('⑩ 구분 × 주 칸표', J(hm.map(r => r.cells[7].n)), [2, 0]);
  const sp = A.splitPeriods(m.visits.filter(v => !v.archived), '2026-11-06');
  sc.eq('⑩ 최근 4주 / 그 전 4주', J([sp.last4.length, sp.prev4.length]), [4, 0]);
  { const c = A.countBy(sp.last4, v => v.allTags); sc.eq('⑩ 세기 — 여럿 칸은 하나씩', Object.keys(c).sort().map(k => k + c[k]), ['관계1', '교회1', '신앙1', '학교1']); }
}

// ⑪ 기기끼리 설정 맞추기
{
  const NOW = 1000;
  const S1 = { id: 'S1', name: '진짜 시트' }, S2 = { id: 'S2', name: '사본' };
  sc.eq('⑪ 올리는 칸 — 파일 · 기준값 · 일정 제목 앞뒤 글자뿐(심방 내용 · 시험 상태 없음)', J(A.CFG_FIELDS), ['sheet', 'form', 'responder', 'cutoff', 'stale', 'calPre', 'calSuf']);
  sc.eq('⑪ 문서 자리', A.CFG_DOC, 'data/care');
  sc.eq('⑪ 고르기 — 시험 상태 · 모르는 칸은 뺀다', J(A.pickCfg({ sheet: S1, test: { before: [['x']] }, junk: 1, at: 5 })), { sheet: S1, at: 5 });
  // 폰에서 골랐다(시각 없음 — 예전 판), 계정엔 아직 없다 → 지금 시각을 붙여 올린다
  let r = A.mergeCfg({ sheet: S1, form: S2, test: {} }, null, NOW);
  sc.eq('⑪ 계정에 없으면 이 기기 것을 올린다(시각을 붙여)', J([r.local, r.push]), [null, { sheet: S1, form: S2, at: NOW }]);
  // PC: 아무것도 안 골랐다 → 계정 것을 받는다
  r = A.mergeCfg({}, { sheet: S1, form: S2, at: NOW }, NOW + 5);
  sc.eq('⑪ 빈 기기는 계정 것을 받는다 (PC 문제)', J([r.local, r.push]), [{ sheet: S1, form: S2, at: NOW }, null]);
  // PC 에 예전에 사본을 골라 둔 것(시각 없음)이 있어도 계정 것이 이긴다
  r = A.mergeCfg({ sheet: S2 }, { sheet: S1, at: NOW }, NOW + 5);
  sc.eq('⑪ 시각 없는 옛 기기 값보다 계정 것이 먼저', J(r.local.sheet), S1);
  // 둘 다 시각이 있으면 나중 것
  r = A.mergeCfg({ sheet: S2, at: NOW + 9 }, { sheet: S1, at: NOW }, NOW + 10);
  sc.eq('⑪ 이 기기에서 더 나중에 골랐으면 올린다', J([r.local, r.push && r.push.sheet]), [null, S2]);
  r = A.mergeCfg({ sheet: S2, at: NOW }, { sheet: S1, at: NOW + 9 }, NOW + 10);
  sc.eq('⑪ 다른 기기에서 더 나중에 골랐으면 받는다', J(r.local.sheet), S1);
  r = A.mergeCfg({ sheet: S1, at: NOW }, { sheet: S1, at: NOW }, NOW + 10);
  sc.eq('⑪ 같으면 아무것도 안 한다', J([r.local, r.push]), [null, null]);
  r = A.mergeCfg({}, null, NOW);
  sc.eq('⑪ 둘 다 비었으면 아무것도 안 한다', J([r.local, r.push]), [null, null]);
  r = A.mergeCfg({ sheet: S1, test: { id: 'T' } }, { sheet: S2, at: NOW }, NOW + 1);
  sc.eq('⑪ 받을 때 이 기기의 시험 상태는 남긴다', J(r.local.test), { id: 'T' });
}

// ⑫ C2 쓰기
{
  const H = HEAD.concat(['기록ID', '출처', '심방일', '수정', '확인', '보관']), map = A.headerMap(H).map, NOW = Date.parse('2026-11-07T09:30:00+09:00');
  const rec = { name: ' 가나다 ', ymd: '2026-11-06', roles: ['예배팀', '셀리더'], rolesEtc: '두나미스', method: '카톡, 문자', methodEtc: '', place: '카페', text: '첫 줄\r\n둘째 줄 ', depth: '깊음',
    tags: ['신앙'], tagsEtc: '관계, 진로', acts: ['중보', '연결'], actsEtc: '병문안 가기' };
  sc.eq('⑫ 이름 · 이야기는 꼭 (이야기가 없으면 방식이라도)', J(A.validateRecord({ name: '', ymd: '', text: '' })), ['성도 이름을 적어 주세요', '날짜를 골라 주세요', '나눈 이야기나 방식 중 하나는 적어 주세요']);
  sc.eq('⑫ 맞는 기록은 통과', J(A.validateRecord(rec)), []);
  const c = A.recordCells(rec);
  sc.eq('⑫ 칸 꼴 — 날짜는 폼처럼 월/일 · 연도는 심방일 · 여럿은 ", " · 기타는 끝에', J([c.date, c['@심방일'], c.name, c.roles, c.method, c.tags, c.acts, c.text]),
    ['11/6', '2026-11-06', '가나다', '예배팀, 셀리더, 두나미스', '카톡, 문자', '신앙, 관계, 진로', '중보, 연결, 병문안 가기', '첫 줄\n둘째 줄']);
  const nr = A.newRowValues(H, map, rec, 'C1', NOW);
  sc.eq('⑫ 새 줄 — 머리글 길이 · 기록ID · 출처 앱 · 타임스탬프는 시트 날짜 숫자', J([nr.row.length, nr.row[map['@기록ID']], nr.row[map['@출처']], A.serialYmd(nr.row[map.ts])]), [H.length, 'C1', '앱', '2026-11-07']);
  sc.eq('⑫ 시트에 장소 칸이 없으면 쓰지 않고 알린다', J(nr.lost), ['place']);
  sc.eq('⑫ 쓴 줄을 다시 읽으면 같은 기록', J((() => { const v = A.rowToVisit(nr.row, map, OPT); return [v.name, v.ymd, v.roles, v.rolesEtc, v.method, v.tags, v.tagsEtc, v.acts, v.actsEtc, v.depth]; })()),
    ['가나다', '2026-11-06', ['예배팀', '셀리더'], ['두나미스'], '카톡, 문자', ['신앙'], ['관계', '진로'], ['중보', '연결'], ['병문안 가기'], '깊음']);
  // 폼이 쓴 줄을 읽어 그대로 저장 → 아무 칸도 안 바뀐다
  const formRow = [46332.4, '11/4', '라마바', '셀리더, 예배팀', '보고 차카타', '셀원 근황\n건강', '건강, 교회', '보고, 중보', '중간', 'C9', '폼', '2026-11-04', '', '', ''];
  const v0 = A.rowToVisit(formRow, map, OPT);
  sc.eq('⑫ 안 바꾸고 저장하면 칸이 하나도 안 바뀐다 (여럿 칸 순서 · 기타 방식 · 여러 줄)', J(A.editPatch(H, map, formRow, A.recordFromVisit(v0), NOW).cells), []);
  const r2 = A.recordFromVisit(v0); r2.depth = '깊음'; r2.tags = ['교회'];
  const pt = A.editPatch(H, map, formRow, r2, NOW);
  sc.eq('⑫ 바꾼 칸만 + 수정 시각', J(pt.cells.map(x => [x.k, x.value, x.prev])), [['tags', '교회', '건강, 교회'], ['depth', '깊음', '중간'], ['@수정', '2026-11-07T00:30:00.000Z', '']]);
  sc.eq('⑫ 날짜 칸이 날짜 숫자여도 같은 날이면 안 고친다', J(A.editPatch(H, map, Object.assign(formRow.slice(), { 1: 46330 }), A.recordFromVisit(A.rowToVisit(Object.assign(formRow.slice(), { 1: 46330 }), map, OPT)), NOW).cells), []);
  const now = formRow.slice(); now[map.depth] = '얕음';
  sc.eq('⑫ 그사이 시트에서 같은 칸을 고쳤으면 잡는다', J(A.conflictCells(formRow, now, pt.cells)), ['depth']);
  sc.eq('⑫ 다른 칸이 바뀐 것은 부딪침이 아니다', J(A.conflictCells(formRow, Object.assign(formRow.slice(), { 5: '다른 내용' }), pt.cells)), []);
  const ids = [['기록ID'], ['C1'], [''], ['C2'], ['C1x']];
  sc.eq('⑫ 기록ID 로 줄 찾기 · 없으면 -1', J([A.findRowById(ids, 'C2'), A.findRowById(ids, 'C3')]), [4, -1]);
  sc.eq('⑫ 같은 기록ID 가 둘이면 -2 (쓰지 않는다)', A.findRowById([['기록ID'], ['C1'], ['C1']], 'C1'), -2);
  sc.eq("⑫ 칸 주소 — 탭 이름의 ' 는 두 번", A.a1("HB's 탭", 10, 5), "'HB''s 탭'!K5");
  sc.eq('⑫ 새 기록 꼴 — 오늘 · 지난번 구분', J([A.blankRecord('2026-11-07', { roles: ['청년부'] }).ymd, A.blankRecord('2026-11-07', { roles: ['청년부'] }).roles]), ['2026-11-07', ['청년부']]);
}
// ⑬ 할 일 체크 · 덧붙임
{
  const act = [A.ACT_TAB_HEAD, ['A1', 'C1', '가나다', '중보', '', '', '', '마침', '2026-11-06', ''], ['A2', 'C1', '가나다', '기타', '', '병문안 가기', '', '할 일', '', '']];
  const st = A.parseActionTab(act);
  sc.eq('⑬ 액션 탭 읽기 — 열쇠 = 기록ID|종류|내용', J(Object.keys(st)), ['C1|중보|', 'C1|기타|병문안 가기']);
  const v = { id: 'C1', name: '가나다', actions: [{ t: '중보', x: '', k: 'k1' }, { t: '연결', x: '', k: 'k2' }, { t: '기타', x: '병문안 가기', k: 'k4' }] };
  A.attachExtras({ visits: [v] }, st, {});
  sc.eq('⑬ 체크 붙이기 — 마침만 done', J(v.actions.map(a => a.done)), [true, false, false]);
  sc.eq('⑬ 액션 탭에 없는 할 일을 체크 → 한 줄 더한다', J(A.checkPlan(st, v, v.actions[1], true, '2026-11-07', 'A9')), { append: ['A9', 'C1', '가나다', '연결', '', '', '', '마침', '2026-11-07', ''] });
  sc.eq('⑬ 있는 줄은 상태 · 완료일만', J(A.checkPlan(st, v, v.actions[2], true, '2026-11-07', 'A9')), { update: { row: 3, cells: { '상태': '마침', '완료일': '2026-11-07' } } });
  sc.eq('⑬ 풀기 → 할 일 · 완료일 비움', J(A.checkPlan(st, v, v.actions[0], false, '2026-11-07', 'A9')), { update: { row: 2, cells: { '상태': '할 일', '완료일': '' } } });
  sc.eq('⑬ 기록ID 없는 기록(준비 전)은 체크가 안 붙는다', (() => { const w = { id: '', actions: [{ t: '중보', x: '' }] }; A.attachExtras({ visits: [w] }, { '|중보|': { st: '마침' } }, {}); return w.actions[0].done; })(), false);
  const ad = A.parseAddenda([['기록ID', '시각', '쓴 사람', '내용'], ['C1', '2026-11-07 10:00', 'a@b', '둘째'], ['C1', '2026-11-06 09:00', 'a@b', '첫째'], ['C2', '', '', ''], ['', 'x', 'y', '주인 없음']]);
  sc.eq('⑬ 덧붙임 — 기록마다 시각순 · 빈 줄 · 주인 없는 줄은 버린다', J([Object.keys(ad), ad.C1.map(x => x.x)]), [['C1'], ['첫째', '둘째']]);
  sc.eq('⑬ 기록ID 붙이기 상한', A.ID_PATCH_MAX <= 500, true);
}

// ⑭ 지우기 → 휴지통
{
  const H = HEAD.concat(['기록ID', '출처', '심방일', '수정', '확인', '보관']);
  const row = [46332.4, '11/4', '라마바', '청년부', '식사', '학교 이야기\n둘째 줄', '학교', '중보', '중간', 'C7', '폼', '2026-11-04', '', '', ''];
  const tr = A.trashRow(H, row, { id: 'C7', name: '라마바', ymd: '2026-11-04' }, '2026-11-07 10:00', 'a@b');
  sc.eq('⑭ 휴지통 줄 — 기록ID · 이름 · 심방일 · 지운 시각 · 사람 · 원래 줄', J(tr.slice(0, 5)), ['C7', '라마바', '2026-11-04', '2026-11-07 10:00', 'a@b']);
  sc.eq('⑭ 원래 줄은 빈 칸 빼고 머리글: 값', Object.keys(JSON.parse(tr[5])).length, 12);
  sc.eq('⑭ 되살리기 — 같은 머리글이면 같은 줄', J(A.restoreRow(H, tr[5]).row), J(row));
  const H2 = ['Timestamp', '장소 · 메모'].concat(H.slice(1));   // 그사이 폼에 질문이 하나 더 생겨 열이 밀렸다
  const rr = A.restoreRow(H2, tr[5]);
  sc.eq('⑭ 열이 밀려도 이름으로 제자리 · 새 칸은 빈 값', J([rr.row[0], rr.row[1], rr.row[3], rr.row[10]]), [46332.4, '', '라마바', 'C7']);
  const rl = A.restoreRow(H.filter(x => x !== '태그'), tr[5]);
  sc.eq('⑭ 지금 시트에 없는 칸은 lost 로 알린다', J(rl.lost), ['태그']);
  sc.eq('⑭ 깨진 원래 줄은 되살리지 않는다', A.restoreRow(H, '{깨짐').bad, true);
  const T = A.parseTrash([A.TRASH_HEAD, tr, ['C8', '가나다', '2026-10-31', '2026-11-07 11:00', 'a@b', '{"내용":"둘"}'], ['', '', '', '', '', '']]);
  sc.eq('⑭ 휴지통 목록 — 최근에 지운 것부터 · 빈 줄 버림 · 줄 번호', J(T.map(x => [x.id, x.row, x.text])), [['C8', 3, '둘'], ['C7', 2, '학교 이야기\n둘째 줄']]);
  sc.eq('⑭ 휴지통 줄 찾기는 기록ID 로 (같은 함수)', A.findRowById([['기록ID'], ['C7'], ['C8']], 'C8'), 3);
  // 코덱스 검토(PR 962) — 두 기기 · 끊김
  const map = A.headerMap(H).map;
  sc.eq('⑭ 읽은 줄이 그 기록인지 — 다른 기기가 앞줄을 지워 한 줄 밀렸으면 아니다', J([A.rowHasId(map, row, 'C7'), A.rowHasId(map, row, 'C8'), A.rowHasId(map, row, '')]), [true, false, false]);
  sc.eq('⑭ 휴지통 첫 줄 — 머리글 · 비었음 · 만들다 끊겨 백업이 먼저 · 남의 것', J([A.trashHeadState(A.TRASH_HEAD), A.trashHeadState([]), A.trashHeadState(tr), A.trashHeadState(['메모', '아무거나'])]), ['ok', 'empty', 'data', 'other']);
  const tv = [A.TRASH_HEAD, tr];
  sc.eq('⑭ 휴지통에 꼭 하나, 방금 적은 그대로일 때만 원래 줄을 지운다', J([A.backupMatches(tv, 'C7', tr[5]), A.backupMatches(tv, 'C7', '{}'), A.backupMatches([A.TRASH_HEAD, tr, tr], 'C7', tr[5]), A.backupMatches([A.TRASH_HEAD], 'C7', tr[5])]), [true, false, false, false]);
}

// ⑮ 나눈 이야기 나누기 — '나눈 이야기 1 · 2 …' 제목 줄
sc.eq('⑮ 빈 칸에서 누르면 1번 제목', A.addTalk(''), '나눈 이야기 1\n');
sc.eq('⑮ 이미 쓴 글이 있으면 그것을 1번으로 묶고 2번을 연다', A.addTalk('학교 이야기\n둘째 줄'), '나눈 이야기 1\n학교 이야기\n둘째 줄\n\n나눈 이야기 2\n');
sc.eq('⑮ 번호는 가장 큰 번호 다음', A.addTalk('나눈 이야기 1\n가\n\n나눈 이야기 2\n나'), '나눈 이야기 1\n가\n\n나눈 이야기 2\n나\n\n나눈 이야기 3\n');
sc.eq('⑮ 저장은 한 칸 글 그대로 — 제목 줄도 글로 저장된다', A.validateRecord(Object.assign(A.blankRecord('2026-11-08', null), { name: '가나다', text: A.addTalk('가') })).length, 0);
// ⑯ 속성 · 폼 맞추기
{
  const S0 = A.formSummary(FORM), qid = t => S0.find(q => q.title === t).qid;
  const HEADA = A.TABS['속성'];
  // 폼을 그대로 탭에 옮긴 것처럼 줄을 만들어 주는 도구
  const tabFrom = (plan, base, noMark) => { const v = (base || [HEADA]).map(r => r.slice()); plan.append.forEach(r => v.push(r)); plan.update.concat(noMark ? [] : plan.mark).forEach(u => { v[u.row - 1][HEADA.indexOf(u.k)] = u.v; }); return v; };
  const sumWith = (title, opts) => S0.map(q => q.title === title ? Object.assign({}, q, { options: opts }) : q);
  sc.eq('⑯ 폼 요약에 질문 자리 · 종류', J([S0[3].idx, S0[3].ctype]), [3, 'CHECKBOX']);
  const seed = A.planAttrSync(S0, A.parseAttrRows([HEADA]));
  sc.eq('⑯ 처음 — 폼 선택지를 탭으로 (구분 7 · 방식 5 · 태그 6 · 액션 3) · 폼은 안 고친다', J([seed.append.length, Object.keys(seed.form).length, seed.n.fromForm]), [21, 0, 21]);
  sc.eq('⑯ 대화 깊이는 맞추지 않는다', seed.append.some(r => r[0] === '대화 깊이'), false);
  const T1 = tabFrom(seed), R1 = A.parseAttrRows(T1);
  sc.eq('⑯ 한 번 맞추면 다시 맞춰도 할 일 없음', J(A.planAttrSync(S0, R1)), J({ append: [], update: [], mark: [], form: {}, n: { fromForm: 0, toForm: 0, hidFromForm: 0, removeFromForm: 0, heldBack: 0 } }));
  // 폼에서 '진로' 를 더했다
  const p2 = A.planAttrSync(sumWith('태그', OPT.tags.concat(['진로'])), R1);
  sc.eq('⑯ 폼에서 새로 → 탭에 한 줄(맞춘 표시와 함께)', J(p2.append), [['태그', '진로', '', 7, '', '', qid('태그'), '']]);
  // 앱에서 '관계' 를 더했다(폼 질문 번호 없음)
  const T3 = T1.concat([['태그', '관계', '', 7, '', '', '', '']]), p3 = A.planAttrSync(S0, A.parseAttrRows(T3));
  sc.eq('⑯ 앱에서 새로 → 폼 선택지 끝에 · 맞춘 표시는 따로(폼 고치기 뒤에 쓴다)', J([p3.form[qid('태그')], p3.mark, p3.update]), [OPT.tags.concat(['관계']), [{ row: T3.length, k: '폼 질문 번호', v: qid('태그') }], []]);
  // (코덱스 검토 PR 976) 폼 고치기가 실패해 맞춘 표시가 안 남았다 → 다음에도 숨기지 않고 다시 폼에 더하려 한다
  const p3b = A.planAttrSync(S0, A.parseAttrRows(tabFrom(p3, T3, true)));
  sc.eq('⑯ 폼 고치기가 실패했으면 다음 맞춤도 숨기지 않고 다시 폼에 더한다', J([p3b.n.toForm, p3b.n.hidFromForm, p3b.update]), [1, 0, []]);
  sc.eq('⑯ 그다음엔 할 일 없음', A.planAttrSync(sumWith('태그', OPT.tags.concat(['관계'])), A.parseAttrRows(tabFrom(p3, T3))).update.length, 0);
  // 폼에서 '학교' 를 뺐다
  const p4 = A.planAttrSync(sumWith('태그', OPT.tags.filter(x => x !== '학교')), R1);
  sc.eq('⑯ 폼에서 뺌 → 앱에서 숨김 (폼은 안 고침)', J([p4.update.map(u => [T1[u.row - 1][1], u.k]), Object.keys(p4.form)]), [[['학교', '숨김']], []]);
  // 앱에서 '건강' 을 숨겼다
  const T5 = T1.map(r => r.slice()); T5[T5.findIndex(r => r[1] === '건강')][4] = '숨김';
  const p5 = A.planAttrSync(S0, A.parseAttrRows(T5));
  sc.eq('⑯ 앱에서 숨김 → 폼에서 뺀다', J(p5.form[qid('태그')]), OPT.tags.filter(x => x !== '건강'));
  sc.eq('⑯ 숨긴 값이 폼에 없으면 할 일 없음', Object.keys(A.planAttrSync(sumWith('태그', OPT.tags.filter(x => x !== '건강')), A.parseAttrRows(T5)).form).length, 0);
  // 한꺼번에 많이 숨겨도 폼에서는 다섯까지만
  const T6 = T1.map(r => r.slice()); T6.forEach((r, i) => { if (i && r[0] === '구분') r[4] = '숨김'; });
  const p6 = A.planAttrSync(S0, A.parseAttrRows(T6));
  sc.eq('⑯ 폼에서 빼기는 한 번에 다섯까지 · 나머지는 미룬다', J([p6.n.removeFromForm, p6.n.heldBack, p6.form[qid('구분')].length]), [A.FORM_REMOVE_MAX, 2, 2]);
  sc.eq('⑯ 같은 값이 두 줄이어도 하나로 읽는다', A.parseAttrRows(T1.concat([T1[1].slice()])).length, 21);
  // 폼 요청 모양
  const FR = JSON.parse(JSON.stringify(FORM)); FR.items.forEach((it, i) => { it.itemId = 'i' + i; });
  const rq = A.formUpdateRequests(FR, { [qid('태그')]: ['신앙', '관계'] });
  sc.eq('⑯ 폼 요청 — 선택지만 · 기타 칸은 끝에 그대로 · 자리 번호', J([rq.length, rq[0].updateItem.location.index, rq[0].updateItem.updateMask, rq[0].updateItem.item.questionItem.question.choiceQuestion.options]),
    [1, 6, 'questionItem.question.choiceQuestion.options', [{ value: '신앙' }, { value: '관계' }, { isOther: true }]]);
  const pq = A.placeQuestionRequest(FR);
  sc.eq("⑯ '장소 · 메모' 질문 — '전화 / 만남' 바로 뒤에 짧은 글로", J([pq.createItem.location.index, pq.createItem.item.title, pq.createItem.item.questionItem.question.textQuestion.paragraph]), [5, '장소 · 메모', false]);
  sc.eq("⑯ 이미 있으면 더하지 않는다", A.placeQuestionRequest({ items: FR.items.concat([{ title: '장소 · 메모', questionItem: { question: { textQuestion: {} } } }]) }), null);
  // 기타 후보
  const vs = [{ rolesEtc: ['두나미스'], tagsEtc: ['관계'] }, { rolesEtc: ['두나미스', '새가족'], tagsEtc: [] }, { rolesEtc: ['청년부'] }];
  sc.eq('⑯ 기타 글 후보 — 많이 나온 것부터 · 이미 선택지인 것은 빼고', J(A.etcCandidates(vs, '구분', R1)), [{ val: '두나미스', n: 2 }, { val: '새가족', n: 1 }]);
}

// ⑰ 계획 · 캘린더
{
  const PH = ['계획ID', '성도', '날짜', '시간', '방식', '장소', '물어볼 것', '상태', '캘린더 일정ID', '기록ID'];
  const P = A.parsePlans([PH, ['P1', '가나다', '2026-11-10', '14:00', '전화', '', '근황', '', 'E1', ''], ['P2', '라마바', 46340, 0.5625, '', '', '', '예정', '없음', ''], ['', 'x'], ['P3', '사아자', '2026-11-12', '', '', '', '', '기록됨', 'E3', 'C9']]);
  sc.eq('⑰ 계획 줄 — 빈 상태는 예정 · 시트 날짜 숫자 · 시간 숫자 · 계획ID 없는 줄 버림', J(P.map(p => [p.id, p.date, p.time, p.status, p.evId])), [['P1', '2026-11-10', '14:00', '예정', 'E1'], ['P2', '2026-11-14', '13:30', '예정', '없음'], ['P3', '2026-11-12', '', '기록됨', 'E3']]);
  sc.eq('⑰ 일정 제목 = 앞 글자 + 이름 + 뒤 글자', J([A.calTitle('가나다'), A.calTitle(' 가나다 ', '심방 · ', ''), A.calTitle('가나다', '', ' 심방')]), ['가나다', '심방 · 가나다', '가나다 심방']);
  const b1 = A.calEventBody(P[0], '', '', 'Asia/Seoul'), b2 = A.calEventBody(Object.assign({}, P[0], { time: '' })), b3 = A.calEventBody(Object.assign({}, P[0], { time: '23:30' }), '', '', 'Asia/Seoul', true);
  sc.eq('⑰ 일정 — 시간 있으면 한 시간 · 없으면 하루 종일 · 자정 넘김 · 기록됨은 ✓', J([b1.start, b1.end, b2.start, b2.end, b3.end.dateTime, b3.summary]),
    [{ dateTime: '2026-11-10T14:00:00', timeZone: 'Asia/Seoul' }, { dateTime: '2026-11-10T15:00:00', timeZone: 'Asia/Seoul' }, { date: '2026-11-10' }, { date: '2026-11-11' }, '2026-11-11T00:30:00', '✓ 가나다']);
  sc.eq('⑰ 일정엔 표식만 — 장소 · 물어볼 것은 안 싣는다', J([b1.extendedProperties.private, Object.keys(b1).sort()]), [{ careApp: 'care', careId: 'P1' }, ['end', 'extendedProperties', 'start', 'summary']]);
  sc.eq('⑰ 일정 시각 읽기 (이 기기 시각)', J([A.evWhen({ start: { dateTime: '2026-11-10T05:00:00Z' } }), A.evWhen({ start: { date: '2026-11-11' } })]), [{ date: '2026-11-10', time: '14:00' }, { date: '2026-11-11', time: '' }]);
  const ev = (id, care, when, extra) => Object.assign({ id, status: 'confirmed', summary: '가나다', start: when.includes('T') ? { dateTime: when } : { date: when }, extendedProperties: { private: { careApp: 'care', careId: care } } }, extra || {});
  const E1 = ev('E1', 'P1', '2026-11-10T05:00:00Z');
  const none = A.planCalSync([P[0]], [E1]);
  sc.eq('⑰ 같으면 할 일 없음', J([none.planCells, none.create, none.patch, none.del]), [[], [], [], []]);
  const mv = A.planCalSync([P[0]], [ev('E1', 'P1', '2026-11-11T01:00:00Z')]);
  sc.eq('⑰ 캘린더에서 옮김 → 계획 날짜 · 시간이 따라간다', J(mv.planCells), [{ id: 'P1', row: 2, cells: { '날짜': '2026-11-11', '시간': '10:00' } }]);
  const cx = A.planCalSync([P[0]], [ev('E1', 'P1', '2026-11-10T05:00:00Z', { status: 'cancelled' })]);
  sc.eq('⑰ 캘린더에서 지움 → 계획 취소됨 · 일정은 건드리지 않는다', J([cx.planCells, cx.del]), [[{ id: 'P1', row: 2, cells: { '상태': '취소됨' } }], []]);
  sc.eq('⑰ 일정을 목록에서 못 찾으면 아무것도 안 한다', J(A.planCalSync([P[0]], []).planCells), []);
  sc.eq("⑰ '캘린더에 안 넣음' 계획은 건드리지 않는다", J(A.planCalSync([P[1]], [])), J({ planCells: [], create: [], patch: [], del: [], n: { moved: 0, canceled: 0, created: 0, adopted: 0, dup: 0, titled: 0, heldBack: 0 } }));
  const P0n = Object.assign({}, P[0], { evId: '' });
  sc.eq('⑰ 일정ID 가 빈 계획 → 만든다', J(A.planCalSync([P0n], []).create), ['P1']);
  const ad = A.planCalSync([P0n], [E1]);
  sc.eq('⑰ 만들다 끊긴 일정(표식 있음)이 있으면 새로 만들지 않고 이어 붙인다', J([ad.create, ad.planCells]), [[], [{ id: 'P1', row: 2, cells: { '캘린더 일정ID': 'E1' } }]]);
  const dp = A.planCalSync([P[0]], [E1, ev('E1b', 'P1', '2026-11-10T05:00:00Z')]);
  sc.eq('⑰ 두 기기가 같이 만든 여벌 일정은 지운다(계획이 가리키는 것은 남김)', J([dp.del, dp.n.dup]), [['E1b'], 1]);
  const many = A.planCalSync([P[0]], [E1].concat([1, 2, 3, 4, 5, 6, 7].map(i => ev('X' + i, 'P1', '2026-11-10T05:00:00Z'))));
  sc.eq('⑰ 지우기는 한 번에 다섯까지', J([many.del.length, many.n.heldBack]), [A.CAL_DEL_MAX, 2]);
  const other = A.planCalSync([P[0]], [E1, { id: 'Z', status: 'confirmed', summary: '남의 일정', start: { date: '2026-11-10' } }]);
  sc.eq('⑰ 우리 표식이 없는 일정은 절대 안 지운다', J(other.del), []);
  sc.eq('⑰ 제목이 다르면(앞뒤 글자를 바꿈) 일정 제목을 고친다', J(A.planCalSync([P[0]], [E1], '심방 · ', '').patch), [{ evId: 'E1', body: { summary: '심방 · 가나다' } }]);
  const dn = A.planCalSync([P[2]], [ev('E3', 'P3', '2026-11-12', { summary: '사아자' })]);
  sc.eq('⑰ 기록됨 → 일정 제목 앞 ✓', J(dn.patch), [{ evId: 'E3', body: { summary: '✓ 사아자' } }]);
  const cc = A.planCalSync([Object.assign({}, P[0], { status: '취소됨' })], [E1]);
  sc.eq('⑰ 앱에서 취소했는데 일정이 남아 있으면 지운다', J(cc.del), ['E1']);
  sc.eq('⑰ 계획 탭 줄 — 머리글 이름으로 자리', J(A.planRow(['상태', '계획ID', '성도', '메모'], { id: 'P9', name: '가나다', status: '예정' })), ['예정', 'P9', '가나다', '']);
  const rf = A.recordFromPlan(Object.assign({}, P[0], { place: '카페' }), { '가나다': { roles: ['장년부'] } });
  sc.eq('⑰ 계획 → 기록 꼴 — 이름 · 날짜 · 방식 · 장소 · 지난 구분', J([rf.name, rf.ymd, rf.method, rf.place, rf.roles]), ['가나다', '2026-11-10', '전화', '카페', ['장년부']]);
  const why = A.planWhyFor({ visits: [{ ymd: '2026-10-31', text: '\n직장 일이 힘들다고 함\n둘째 줄', actions: [{ t: '중보', done: false }, { t: '기타', x: '병문안', done: false }, { t: '보고', done: true }] }] });
  sc.eq('⑰ 제안의 물어볼 것 — 남은 할 일 · 지난 이야기 첫 줄', why, '남은 할 일: 중보, 병문안\n지난번(10/31): 직장 일이 힘들다고 함');
}

// ⑱ 할 일 → BLOCK7 할일
{
  const v = { id: 'C1', name: ' 가나다 ', text: '아주 사적인 이야기', actions: [] };
  sc.eq('⑱ 보낼 글 — 종류 · 이름 (기타는 그 글, 세부는 붙여서)', [A.b7Text(v, { t: '중보', x: '' }), A.b7Text(v, { t: '기타', x: '병문안 가기' }), A.b7Text(v, { t: '연결', x: '셀' })], ['중보 · 가나다', '병문안 가기 · 가나다', '연결 셀 · 가나다']);
  const n = A.b7Note('  중보 ·\n가나다 ', '2026-11-09', 1700000000000, 'N1');
  sc.eq('⑱ 쪽지 — BLOCK7 받기 꼴 {id, from, date, sec, text, at} · 줄바꿈은 한 칸 · sec 비움(첫 구간)', J(n), { id: 'N1', from: 'care', date: '2026-11-09', sec: '', text: '중보 · 가나다', at: 1700000000000 });
  sc.eq('⑱ 쪽지에 나눈 이야기는 없다', JSON.stringify(n).includes('사적인'), false);
  sc.eq('⑱ 빈 글 · 틀린 날짜는 보내지 않는다 · 200자까지', [A.b7Note('  ', '2026-11-09', 1, 'x'), A.b7Note('a', '11/9', 1, 'x'), A.b7Note('가'.repeat(300), '2026-11-09', 1, 'x').text.length], [null, null, 200]);
  const act = [A.ACT_TAB_HEAD, ['A1', 'C1', '가나다', '중보', '', '', '', '할 일', '', '2026-11-08']];
  const st = A.parseActionTab(act);
  sc.eq("⑱ 액션 탭의 'BLOCK7 할일' 칸을 읽는다", st['C1|중보|'].b7, '2026-11-08');
  const w = { id: 'C1', actions: [{ t: '중보', x: '' }, { t: '연결', x: '' }] }; A.attachExtras({ visits: [w] }, st, {});
  sc.eq('⑱ 할 일에 보낸 날이 붙는다 (안 보낸 것은 빈 칸)', [w.actions[0].b7, w.actions[1].b7], ['2026-11-08', '']);
  sc.eq("⑱ 보낸 날 적기 — 줄이 있으면 'BLOCK7 할일' 칸만 (상태는 그대로)", J(A.b7MarkPlan(st, v, { t: '중보', x: '' }, '2026-11-09', 'A9')), { update: { row: 2, cells: { 'BLOCK7 할일': '2026-11-09' } } });
  const ap = A.b7MarkPlan(st, v, { t: '기타', x: '병문안' }, '2026-11-09', 'A9').append;
  sc.eq("⑱ 줄이 없으면 '할 일' 상태로 한 줄 — 칸 자리는 액션 탭 머리글대로", [ap.length, ap[A.ACT_TAB_HEAD.indexOf('상태')], ap[A.ACT_TAB_HEAD.indexOf('BLOCK7 할일')], ap[A.ACT_TAB_HEAD.indexOf('내용')]], [A.ACT_TAB_HEAD.length, '할 일', '2026-11-09', '병문안']);
}

// ⑲ 기록도 '심방' 캘린더에
{
  const vs = [{ id: 'C1', name: '가나다', ymd: '2026-10-05' }, { id: 'C2', name: '라마바', ymd: '2026-09-30' }, { id: 'C3', name: '사아자', ymd: '2026-11-02' }, { id: '', name: '준비 전', ymd: '2026-11-03' }, { id: 'C5', name: '보관', ymd: '2026-11-04', archived: true }];
  const rev = (id, rec, date, o) => Object.assign({ id, status: 'confirmed', summary: '✓ ' + ({ C1: '가나다', C3: '사아자' }[rec] || rec), start: { date }, end: { date }, extendedProperties: { private: { careApp: 'care', careRec: rec, careSheet: 'S' } } }, o || {});
  const O = (o) => Object.assign({ sheet: 'S', readOk: true }, o || {});
  sc.eq('⑲ 기준 날짜는 HB 결정대로 2026-10-01', A.REC_CAL_FROM, '2026-10-01');
  const r0 = A.recCalSync(vs, [], [], O());
  sc.eq('⑲ 2026-10-01 부터 · 기록ID 있는 것 · 보관 아닌 것만 만든다', J(r0.create), ['C1', 'C3']);
  const b = A.recEventBody(vs[0], '심방 · ', '', 'S');
  sc.eq('⑲ 일정 — ✓ + 제목(앞뒤 글자) · 그날 하루 종일 · 표식 careRec', J([b.summary, b.start, b.end, b.extendedProperties.private]), ['✓ 심방 · 가나다', { date: '2026-10-05' }, { date: '2026-10-06' }, { careApp: 'care', careRec: 'C1', careSheet: 'S' }]);
  sc.eq('⑲ 기록 일정은 계획 표식(careId)이 아니다 · 그래도 우리 것', [A.evCareId(b), A.evRecId(b), A.evOurs(b), A.evOurs({ summary: '남의 것' })], ['', 'C1', true, false]);
  const plans = [{ id: 'P1', recId: 'C3', evId: 'E9', status: '기록됨' }];
  sc.eq('⑲ 계획에서 온 기록(계획 일정이 있음)은 건너뛴다', J(A.recCalSync(vs, plans, [], O()).create), ['C1']);
  sc.eq("⑲ 계획이 '캘린더에 안 넣음' 이었으면 기록 일정은 만든다", J(A.recCalSync(vs, [{ recId: 'C3', evId: '없음' }], [], O()).create), ['C1', 'C3']);
  const same = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02')], O());
  sc.eq('⑲ 같으면 할 일 없음', J([same.create, same.patch, same.del]), [[], [], []]);
  const mv = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-09'), rev('E3', 'C3', '2026-11-02', { summary: '사아자 메모' })], O());
  sc.eq('⑲ 날짜 · 제목은 시트가 이긴다 — 옮긴 일정은 기록 날짜로 · 고친 제목은 되돌림', J(mv.patch), [{ evId: 'E1', body: { start: { date: '2026-10-05' }, end: { date: '2026-10-06' } } }, { evId: 'E3', body: { summary: '✓ 사아자' } }]);
  sc.eq('⑲ 시간 있는 일정으로 바뀌었으면 하루 종일로 되돌림', J(A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05', { start: { dateTime: '2026-10-05T10:00:00+09:00' } }), rev('E3', 'C3', '2026-11-02')], O()).patch.map(x => Object.keys(x.body))), [['start', 'end']]);
  const gone = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02'), rev('EX', 'C99', '2026-10-20'), rev('EO', 'C2', '2026-09-30')], O());
  sc.eq('⑲ 지운 기록 · 기준 날짜 앞 기록의 일정은 지운다', J(gone.del.sort()), ['EO', 'EX']);
  sc.eq('⑲ 시트를 못 읽었으면 하나도 안 지운다', J(A.recCalSync([], [], [rev('EX', 'C99', '2026-10-20')], O({ readOk: false })).del), []);
  sc.eq('⑲ 이미 지운(cancelled) 일정 · 남의 일정은 건드리지 않는다', J(A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02'), rev('EZ', 'C99', '2026-10-20', { status: 'cancelled' }), { id: 'N', status: 'confirmed', summary: '✓ 가나다', start: { date: '2026-10-05' } }], O()).del), []);
  const many = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02')].concat([1, 2, 3, 4, 5, 6, 7].map(i => rev('G' + i, 'Cg' + i, '2026-10-20'))), O());
  sc.eq('⑲ 지우기는 한 번에 다섯까지', J([many.del.length, many.n.heldBack]), [A.REC_DEL_MAX, 2]);
  const dup = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E1b', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02')], O());
  sc.eq('⑲ 같은 기록의 여벌 일정은 하나만 남긴다', J(dup.del), ['E1b']);
  const lots = Array.from({ length: 40 }, (_, i) => ({ id: 'L' + i, name: 'n' + i, ymd: '2026-10-10' }));
  // (코덱스 검토 PR 983) ① 다른 시트의 기록 일정은 지우지 않는다 ② 마지막 기록을 지워 시트가 비어도(제대로 읽었으면) 일정을 지운다
  const other = A.recCalSync(vs, [], [rev('E1', 'C1', '2026-10-05'), rev('E3', 'C3', '2026-11-02'), rev('EA', 'CA1', '2026-10-20', { extendedProperties: { private: { careApp: 'care', careRec: 'CA1', careSheet: 'OTHER' } } }), rev('EN', 'CN1', '2026-10-20', { extendedProperties: { private: { careApp: 'care', careRec: 'CN1' } } })], O());
  sc.eq('⑲ 다른 시트(또는 시트 표시 없는) 기록 일정은 지우지 않는다', J(other.del), []);
  sc.eq('⑲ 마지막 기록을 지워 시트가 비어도 — 제대로 읽었으면 그 일정을 지운다', J(A.recCalSync([], [], [rev('EX', 'C99', '2026-10-20')], O()).del), ['EX']);
  sc.eq('⑲ 만들기는 한 번에 30까지(나머지는 다음에)', J([A.recCalSync(lots, [], [], O()).create.length, A.recCalSync(lots, [], [], O()).n.heldBack]), [A.REC_CREATE_MAX, 10]);
}

// ⑳ 출석 (1108-A) — 이름 · 내용은 모두 지어낸 것
{
  sc.eq("⑳ 탭 이름 '출석' · 머리글 — '예배 · 모임' (예배 · 부서 모임 · 개인 기도)", [A.ATT_TAB, A.ATT_HEAD[3]], ['출석', '예배 · 모임']);
  sc.eq('⑳ 고르는 칩에 모임 · 개인 기도도', ['부서 모임', '개인 기도'].every(x => A.ATT_SVC.includes(x)), true);
  const memo = ['기록', '', '가나다', '11/8 ', '주일3부 ', '처음부터 참석', '예배팀 ', '맨 앞 자리', '끝까지 참석', '', '', '라마바', '11/8 ', '라이프라인 ', '헌금부터 참석', '음향부스 뒷자리', '(기도 때 일찍 나감?)', '', '', '사아자', '11/8', '주일 2부', '라운지에서 ', '아내와 함께', '라이프라인도 오신다 했으나 안 오심'].join('\n');
  const r = A.parseAttendText(memo, '2026-11-08', A.ATT_SVC);
  sc.eq('⑳ 메모 꼴 붙여 넣기 — 세 분 · 머리말 한 덩어리 건너뜀', [r.items.length, r.skipped], [3, 1]);
  sc.eq('⑳ 첫 분 — 주일3부 → 주일 3부 · 처음부터 · 끝까지 · 자리 · 나머지는 메모', J(r.items[0]), { name: '가나다', date: '2026-11-08', svc: '주일 3부', from: '처음부터', seen: '', to: '끝까지', seat: '맨 앞 자리', with: '', memo: '예배팀' });
  sc.eq('⑳ 둘째 — 헌금부터 · 괄호 속 나감 · 뒷자리', J([r.items[1].svc, r.items[1].from, r.items[1].to, r.items[1].seat]), ['라이프라인', '헌금부터', '기도 때 일찍 나감?', '음향부스 뒷자리']);
  sc.eq("⑳ 셋째 — '아내와 함께' · '라이프라인도 …' 는 예배가 아니라 메모", J([r.items[2].svc, r.items[2].seat, r.items[2].with, r.items[2].memo]), ['주일 2부', '라운지에서', '아내', '라이프라인도 오신다 했으나 안 오심']);
  const r2 = A.parseAttendText('차카타\n11/5\n개인 기도\n\n파하\n청년부 모임\n\n거너\n수요 예배\n\n12/30 혼자\n주일 1부', '2026-11-08', A.ATT_SVC);
  sc.eq('⑳ 개인 기도 · ○○ 모임 · 수요 예배 → 수요예배 · 날짜 없으면 오늘', J(r2.items.map(a => [a.name, a.date, a.svc])), [['차카타', '2026-11-05', '개인 기도'], ['파하', '2026-11-08', '청년부 모임'], ['거너', '2026-11-08', '수요예배']]);
  sc.eq('⑳ 한 달 넘게 앞 날짜는 지난해로 (1월에 12/28 을 적을 때)', A.parseAttendText('가나\n12/28\n주일 1부', '2027-01-03', A.ATT_SVC).items[0].date, '2026-12-28');
  const vals = [['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 갔나', '자리', '함께', '메모', '적은 시각'],
    ['T1', '2026-11-01', '가나다', '주일 3부', '', '', '맨 앞', '', '', ''], ['T2', 46334, '가 나다', '주일 3부', '', '', '맨 앞', '', '두 줄\n메모', ''], ['T3', '2026-11-08', '라마바', '개인 기도', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', '', '']];
  const P = A.parseAttend(vals);
  sc.eq('⑳ 탭 읽기 — 최근 먼저(같은 날이면 나중에 적은 줄 먼저) · 날짜 숫자도 · 빈 줄 건너뜀 · 메모 줄바꿈 그대로', J(P.map(a => [a.id, a.date, a.row])), [['T3', '2026-11-08', 4], ['T2', '2026-11-08', 3], ['T1', '2026-11-01', 2]]);
  sc.eq('⑳ 열은 머리글 이름으로 — 순서가 달라도', J(A.parseAttend([['성도', '출석ID', '날짜'], ['가나다', 'T9', '2026-11-08']]).map(a => [a.id, a.name, a.date])), [['T9', '가나다', '2026-11-08']]);
  sc.eq('⑳ 사람 맞추기는 띄어쓰기 무시', A.attendOf(P, '가나다').map(a => a.id), ['T2', 'T1']);
  sc.eq('⑳ 자주 온 예배 · 자리를 새로 적을 때 미리', J(A.attHabit(P, '가나다')), { svc: '주일 3부', seat: '맨 앞' });
  sc.eq('⑳ 줄 만들기 — 머리글 자리대로', J(A.attRow(['성도', '출석ID', '모르는 칸', '날짜'], { id: 'T5', name: '가나다', date: '2026-11-08' })), ['가나다', 'T5', '', '2026-11-08']);
  sc.eq('⑳ 고치기 — 바뀐 칸만', J(A.attPatch(P[2], Object.assign({}, P[2], { seat: '둘째 줄' }))), { '자리': '둘째 줄' });
  sc.eq('⑳ 안 바꾸면 쓸 칸 없음', J(A.attPatch(P[2], Object.assign({}, P[2]))), {});
  sc.eq('⑳ 이름 · 날짜 없으면 안 적는다', J([A.validateAttend({ name: '', date: '2026-11-08' }).length, A.validateAttend({ name: '가', date: '11/8' }).length, A.validateAttend({ name: '가', date: '2026-11-08' }).length]), [1, 1, 0]);
  sc.eq('⑳ 출석만 있는 분 — 심방 이름(띄어쓰기 무시)과 같으면 뺀다', J(A.attendOnlyPeople(P, ['가나다'])), [{ name: '라마바', last: '2026-11-08' }]);
}

// ㉑ 기도노트 표시색 (1108-A2) — 읽기만, 색 이름은 기도노트 것
{
  const db = { T: [{ id: 'a', kind: 'person', name: '가나다', mark: 'blue' }, { id: 'b', kind: 'person', name: '라 마바', mark: '' }, { id: 'c', kind: 'item', name: '주일 예배', mark: 'red' },
    { id: 'd', kind: 'person', name: '사아자', mark: '', cat: 'K' }, { id: 'e', kind: 'person', name: '가나다', mark: 'red' }, { id: 'f', kind: 'person', name: '무색', mark: '' }],
    G: [{ id: 'g', lines: [{ segs: [['b']] }] }, { id: 'g2', parent: 'g', lines: [{ segs: [['f']] }] }], marks: { blue: '새가족', yellow: '' }, markLinks: { yellow: { t: 'group', id: 'g' }, green: { t: 'cat', id: 'K' }, red: { t: 'cat', id: 'K' } } };
  const ix = A.prayMarkIndex(db), g = n => ix[n] ? [ix[n].m, ix[n].label] : null;
  sc.eq('㉑ 같은 이름이 둘이면 앞 차례 색(빨강 1순위)', g('가나다'), ['red', '1순위']);
  sc.eq('㉑ 묶음에 이어 둔 색 · 이름 없는 색은 색 이름 그대로(노랑) · 띄어쓰기 무시', g('라마바'), ['yellow', '노랑']);
  sc.eq('㉑ 큰 묶음에 이은 색은 작은 묶음 사람에게도', g('무색'), ['yellow', '노랑']);
  sc.eq('㉑ 분류에 이은 색 · 빨강 · 회색은 이어 두기를 받지 않는다', g('사아자'), ['green', '초록']);
  sc.eq('㉑ 사람이 아닌 항목은 빼고 · 사람 이름 목록', [g('주일예배'), J(A.prayPeople(db))], [null, ['가나다', '라 마바', '사아자', '가나다', '무색']]);
  sc.eq('㉑ 빈 것 · 모양이 다른 것은 빈 표', [J(A.prayMarkIndex(null)), J(A.prayMarkIndex({}))], [{}, {}]);
  const s = JSON.stringify({ T: [] });
  sc.eq('㉑ 덩어리 잇기 — wid 가 모두 같을 때만', [J(A.prayJoin({ wid: 'W', n: 2 }, [{ wid: 'W', s: s.slice(0, 3) }, { wid: 'W', s: s.slice(3) }])), A.prayJoin({ wid: 'W', n: 2 }, [{ wid: 'W', s: s.slice(0, 3) }, { wid: 'X', s: s.slice(3) }]), A.prayJoin({ wid: 'W', n: 2 }, [{ wid: 'W', s: s }])], [{ T: [] }, null, null]);
}

// ㉒ 요즘 안 보이는 분 (1108-A5)
{
  const L = [{ name: '가나다', date: '2026-10-04', svc: '주일 1부' }, { name: '가 나다', date: '2026-10-18', svc: '주일 2부' }, { name: '라마바', date: '2026-10-18' }, { name: '사아자', date: '2026-10-11' }, { name: '사아자', date: '2026-11-01' }, { name: '차카', date: '2026-10-01' }, { name: '차카', date: '2026-10-25' }];
  const q = A.attQuiet(L, '2026-11-08');
  sc.eq('㉒ 기준 14일 · 두 번 넘게 온 분만 · 띄어쓰기 무시 · 오래된 순 · 마지막 예배', J(q.map(o => [o.name, o.n, o.last, o.days, o.svc])), [['가 나다', 2, '2026-10-18', 21, '주일 2부'], ['차카', 2, '2026-10-25', 14, '']]);
  sc.eq('㉒ 한 번만 온 분(라마바) · 최근에 온 분(사아자)은 빼고 · 기준은 바꿀 수 있다', J([A.ATT_QUIET_DAYS, A.attQuiet(L, '2026-11-08', 30).length, A.attQuiet([], '2026-11-08').length]), [14, 0, 0]);
}

// ㉓ 출석 입력 새로 (1108-B3) — 알약 목록 · 이름 여럿 · 날짜 단추 · '언제 보였나'
{
  sc.eq("㉓ 머리글에 '언제 보였나' — 왔나와 갔나 사이", A.ATT_HEAD.slice(4, 7), ['언제 왔나', '언제 보였나', '언제 갔나']);
  sc.eq("㉓ 붙여 넣기 '찬양 때 보임' → 언제 보였나", A.parseAttendText('가나\n11/8\n주일 1부\n찬양 때 보임', '2026-11-08', A.ATT_SVC).items[0].seen, '찬양 때');
  const hist = [{ seat: '맨 앞' }, { seat: '맨 앞' }, { seat: '2층' }, { with: '아내' }];
  const d = A.attOptDefaults(hist);
  sc.eq('㉓ 탭이 없으면 기본 알약 · 자리 · 함께는 자주 쓴 것', J([d.svc.slice(0, 2), d.seen.length > 0, d.seat, d.with]), [['주일 1부', '주일 2부'], true, ['맨 앞', '2층'], ['아내']]);
  sc.eq('㉓ 빈 탭 · 머리글만 있는 탭은 null (기본값을 쓴다)', [A.attOptsParse([]), A.attOptsParse([['칸', '값']])], [null, null]);
  const P = A.attOptsParse([['칸', '값'], ['예배 · 모임', '주일 3부'], ['예배 · 모임', '청년부 모임'], ['예배 · 모임', '주일 3부'], ['모르는 칸', 'x'], ['자리', ' 맨 앞 '], ['자리', '']]);
  sc.eq('㉓ 탭 읽기 — 줄 차례 = 알약 차례 · 겹침 · 빈 값 · 모르는 칸은 버림', J([P.svc, P.seat, P.from]), [['주일 3부', '청년부 모임'], ['맨 앞'], []]);
  const U = A.attOptsUse(P, hist);
  sc.eq('㉓ 탭에 없는 칸은 기본값으로 채운다(나중에 생긴 칸)', J([U.svc, U.from[0], U.seen[0]]), [['주일 3부', '청년부 모임'], '처음부터', '찬양 때']);
  sc.eq('㉓ 탭에 쓸 줄 — [칸 이름, 값], 칸 차례대로', J(A.attOptsRows({ svc: ['A'], seat: ['B', 'C'] })), [['칸', '값'], ['예배 · 모임', 'A'], ['자리', 'B'], ['자리', 'C']]);
  const o = { svc: ['A', 'B', 'C'] };
  sc.eq('㉓ 더하기 — 겹치거나 빈 것은 안 더함', [A.attOptAdd(o, 'svc', ' D '), A.attOptAdd(o, 'svc', 'A'), A.attOptAdd(o, 'svc', ' '), J(o.svc)], [true, false, false, ['A', 'B', 'C', 'D']]);
  sc.eq('㉓ 옮기기 · 이름 바꾸기(같은 이름이 있으면 안 됨) · 지우기', [A.attOptMove(o, 'svc', 3, 0), J(o.svc), A.attOptRename(o, 'svc', 'B', 'C'), A.attOptRename(o, 'svc', 'B', '비'), A.attOptRemove(o, 'svc', 'A'), J(o.svc)], [true, ['D', 'A', 'B', 'C'], false, true, true, ['D', '비', 'C']]);
  const many = { with: [] }; for (let i = 0; i < 40; i++) A.attOptAdd(many, 'with', 'w' + i);
  sc.eq('㉓ 한 칸 알약은 30개까지', many.with.length, A.ATT_OPT_MAX);
  sc.eq('㉓ 이름 여럿 — 쉼표 · 전각 쉼표 · 、 · 빈칸 정리 · 띄어쓰기만 다른 같은 이름은 하나', J(A.splitNames(' 가나다, 라마바，사 아자、 사아자 ,, ')), ['가나다', '라마바', '사 아자']);
  sc.eq('㉓ 날짜 단추 — 그제 · 어제 · 오늘 (달이 바뀌어도)', J(A.attDays('2026-11-01')), [['2026-10-30', '그제'], ['2026-10-31', '어제'], ['2026-11-01', '오늘']]);
}

// ㉔ HB 가 폼에 직접 더한 '장소' · '사주심/사드림' (2026-11-09) — 제목 꼴이 달라도 알아보고, 입력 · 고치기에서 쓴다
{
  const H = HEAD.concat(['장소', '사주심/사드림', '기록ID', '출처', '심방일', '수정']);
  const m = A.headerMap(H).map;
  sc.eq("㉔ '장소' · '사주심/사드림' 머리글을 알아본다", J([m.place, m.pay, m['@기록ID']]), [9, 10, 11]);
  sc.eq('㉔ 띄어쓰기 · 꼴이 달라도 (사주심 / 사드림 · 사드림 여부)', J([A.headerMap(['성도 이름', '내용', '사주심 / 사드림']).map.pay, A.headerMap(['성도 이름', '내용', '사드림 여부']).map.pay, A.headerMap(['성도 이름', '내용', '장소(카페 등)']).map.place]), [2, 2, 2]);
  sc.eq("㉔ '장소 · 메모' 가 있으면 그것이 먼저", A.headerMap(['장소', '장소 · 메모', '성도 이름', '내용']).map.place, 1);
  sc.eq('㉔ 없으면 칸도 없다(예전 시트 그대로)', [A.headerMap(HEAD).map.place, A.headerMap(HEAD).map.pay], [undefined, undefined]);
  const row = ['11/6/2026 10:40:51', '11/6', '가나다', '셀원', '티타임', '이야기', '', '', '중간', '역 앞 카페', '사주심', 'R1', '앱', '2026-11-06', ''];
  const v = A.rowToVisit(row, m, OPT);
  sc.eq('㉔ 읽기 — 장소 · 사주심', J([v.place, v.pay]), ['역 앞 카페', '사주심']);
  const r = A.recordFromVisit(Object.assign({}, v, { roles: v.roles, rolesEtc: v.rolesEtc, tagsEtc: v.tagsEtc, actsEtc: v.actsEtc }));
  sc.eq('㉔ 그대로 다시 쓰면 바뀐 칸 없음', A.editPatch(H, m, row, r, 1).cells.length, 0);
  r.pay = '사드림'; r.place = '교회 카페';
  const pt = A.editPatch(H, m, row, r, Date.parse('2026-11-09T00:00:00Z')).cells.filter(c => c.k !== '@수정');
  sc.eq('㉔ 고치기 — 바꾼 두 칸만 그 열에', J(pt.map(c => [c.k, c.col, c.value])), [['place', 9, '교회 카페'], ['pay', 10, '사드림']]);
  const b = Object.assign(A.blankRecord('2026-11-09'), { name: '라마바', text: '첫 만남', place: '집 앞', pay: '사드림' });
  const nr = A.newRowValues(H, m, b, 'R2', Date.parse('2026-11-09T00:00:00Z'));
  sc.eq('㉔ 새 기록 — 장소 · 사드림을 제 열에', J([nr.row[9], nr.row[10], nr.lost]), ['집 앞', '사드림', []]);
  sc.eq('㉔ 시트에 사주심 칸이 없으면 쓰지 않고 알린다', J(A.newRowValues(HEAD, A.headerMap(HEAD).map, b, 'R3', 1).lost.filter(k => k[0] !== '@')), ['place', 'pay']);
  const FS = A.formSummary({ items: [{ itemId: 'i9', title: '사주심/사드림', questionItem: { question: { questionId: 'q9', choiceQuestion: { type: 'RADIO', options: [{ value: '사주심' }, { value: '사드림' }, { value: '각자' }] } } } }] });
  sc.eq('㉔ 폼 질문에서 선택지를 읽는다', J(A.formQOf(FS, 'pay').options), ['사주심', '사드림', '각자']);
  sc.eq("㉔ 폼에 '장소' 가 있으면 '장소 · 메모' 를 또 더하자고 하지 않는다", A.placeQuestionRequest({ items: [{ title: '장소', questionItem: { question: { textQuestion: {} } } }] }), null);
  sc.eq('㉔ 사주심 칸은 앱 열로 잡히지 않는다(기록ID 등과 섞이지 않음)', A.headerMap(['성도 이름', '내용', '기록ID']).map.pay, undefined);
}

sc.done();
