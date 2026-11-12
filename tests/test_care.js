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
//  ⑮ (1109-T) 나눈 이야기 주제 칸 — 시트 한 칸 글 ↔ 칸 · 옛 글 · 폼 글은 그대로 메모 · 기록 태그 = 칸 태그 ∪ 직접 고른 것 · 안 바꾸면 칸이 안 바뀐다
//  ⑭ 지우기 → 휴지통 — 원래 줄을 {머리글: 값} 으로 통째로 · 되살리면 지금 머리글 자리에 · 그사이 열이 밀려도 · 없는 칸은 알린다
//  ⑯ 속성 · 폼 맞추기 — 처음엔 폼 선택지를 탭으로 · 폼에서 새로 → 앱에 · 앱에서 새로 → 폼에 · 폼에서 뺌 → 앱에서 숨김 · 앱에서 숨김 → 폼에서 뺌(상한) · 한 번 맞추면 다시 맞춰도 할 일 없음
//  ㉟ (1112-M) 한 심방에 여러 이름 — 이름 칸 쉼표 · 셀 표시('이름 셀') · 사람별 내용('◆ 이름' 줄) · 성도 모음 · 제목 · 셀 명단 찾기 · 안 바꾸면 칸이 안 바뀐다
//  ㉞ (1110-Q) 다음 심방 질문 — 플라우드 붙여넣기 → 체크리스트 · 시트 칸 글 '[ ] / [x]' · 탭 한 줄 = 기록 하나 · BLOCK7 쪽지에 하위 항목(안 물어본 것만)
//  ⑱ 할 일 → BLOCK7 할일 — 보낼 글은 종류 · 이름뿐 · 쪽지 모양(BLOCK7 받기와 같은 꼴, sec 비움) · 빈 글 · 틀린 날짜는 안 보냄 · 보낸 날은 'BLOCK7 할일' 칸에만
//  ⑲ 기록도 '심방' 캘린더에 — 2026-10-01 부터 · ✓ 하루 종일 · 계획에서 온 기록은 건너뜀 · 날짜 · 이름은 시트가 이김 · 지운 기록의 일정은 지움(상한 · 우리 표식만 · 시트를 못 읽었으면 안 지움) · 여벌
//  ⑰ 계획 · '심방' 캘린더 — 계획 줄 읽기 · 일정 모양(제목은 이름만 + 앞뒤 글자, 표식만) · 캘린더에서 옮김 → 계획 따라감 · 지움 → 취소됨 · 만들다 끊긴 일정 이어 붙이기 · 두 기기 여벌 지우기(상한) · 기록됨 → ✓
//  ⑳ 출석 — 메모 꼴 붙여 넣기를 칸으로 · 예배 · 모임 · 개인 기도 · 탭은 머리글 이름으로 · 띄어쓰기 무시로 사람 맞춤 · 바뀐 칸만 고침
//  ㉑ 기도노트 표시색 — 기도노트 규칙대로(사람 색 · 묶음 · 분류에 이은 색, 앞 차례가 이김) · 색 이름은 기도노트 것 · 덩어리는 wid 가 같을 때만
//  ㉓ 출석 입력 새로 — '언제 보였나' · 알약 목록(탭 · 기본값 · 더하기 · 옮기기 · 이름 바꾸기 · 지우기 · 상한) · 이름 쉼표로 여럿 · 날짜 단추
//  ㊱ (1112-N) vNext 칸 — 오른쪽 끝에 더한 열만 · 열이 없는 시트는 예전과 같다 · 긴 글은 줄바꿈까지 · 5만 자 · 다음 질문은 탭 · 시험 시트는 이 기기에만 · 이름 후보 명단 넓힘
//  ㊲ (1112-N 2·3·4) 붙여넣어 채우기 — 규격 검사(JSON) · Markdown 규칙 읽기(추측 없음) · 초안 · 속성 대조 · 성도 연결(이름만 → 후보) · 중복(원본ID · 해시) · 할 일(세부 칸 · 미채택은 상세 기록 끝) · 모임
//  ㊳ (1112-N 5) AI 입력대기함 — 대기 줄만 · 규격 오류는 '오류' + 사유(상한) · 접수ID 붙이기 · 줄 다시 찾기(접수ID · 없으면 같은 패킷) · 완료 칸 · ChatGPT 지시문(지금 시트 주소)
//  ㊴ (1112-N 6) 화면 정리 — 상세 기록 Markdown 안전하게(제목 · 목록 · 굵게만, 나머지는 글자) · 성도 화면 요약(최근 핵심 · 장기 관찰 · 다음 질문 = 기록 + 계획) · 같은 날 계획 찾기
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
  joinMulti, splitEtc, blankRecord, parseTalk, talkText, talkTags, talkPreview, talkTopicsOf, talkTagCounts, talkNext, talkCycle, talkPaste, talkTagSync, recordTags, recordFromVisit, validateRecord, recordCells, newRowValues, editPatch, conflictCells, findRowById, a1,
  actionKey, parseActionTab, checkPlan, b7Text, b7Note, b7MarkPlan, parseAddenda, attachExtras, ACT_TAB_HEAD, ID_PATCH_MAX, sheetSerial,
  TRASH_TAB, TRASH_HEAD, trashRow, restoreRow, parseTrash,
  PLAN_NOCAL, PLAN_ST, CAL_DEL_MAX, REC_CAL_FROM, REC_CREATE_MAX, REC_DEL_MAX, recEventBody, recCalSync, evOurs, evRecId, parsePlans, calTitle, evWhen, calEventBody, evCareId, planCalSync, recordFromPlan, planRow, planWhyFor,
  ATTR_MANAGED, FORM_REMOVE_MAX, parseAttrRows, planAttrSync, formUpdateRequests, placeQuestionRequest, etcCandidates, rowHasId, trashHeadState, backupMatches,
  ymdAdd, daysBetween, weekStartOf, monthCells, relDay, buildModel, filterVisits, filterOptions, peopleList, strip10, weeklyDepth, roleHeat, splitPeriods, countBy, ARCHIVE_DEFAULT,
  ATT_TAB, ATT_HEAD, ATT_SVC, parseAttendText, parseAttend, attendOf, attHabit, attRow, attPatch, validateAttend, attendOnlyPeople, prayMarkIndex, prayPeople, prayJoin, attQuiet, ATT_QUIET_DAYS,
  ATT_OPT_TAB, ATT_OPT_FIELDS, ATT_OPT_MAX, attOptDefaults, attOptsParse, attOptsUse, attOptsRows, attOptAdd, attOptRemove, attOptRename, attOptMove, splitNames, attDays, formQOf, PAY_DEFAULT, verNum, isNewer, isDevEmail, optsParse, optsRows, VIS_OPT_TAB, VIS_OPT_FIELDS, visOptDefaults, visOptsUse, recentNames, cellToken, cellGroups, CELL_SB_KEY, QN_TAB, QN_HEAD, QN_MAX, qnParse, qnEncode, qnDecode, parseQnTab, qnPlan, qnB7Text, qnSubs,
  groupCanon, parseWho, whoKeys, whoMerge, whoRemove, whoShort, splitNotes, joinNotes, visitPreview, personNote, cellFind, cellPeople, groupFromHistory,
  NX_COLS, NX_TABS, ACT_NX, NX_PRIO, NX_BASIS, CELL_MAX, NX_LIVE, nxReady, nxPlan, qnMerge, qnText, cfgView, nameCands, newRowValues, editPatch, recordCells, qnEncode,
  PK_VER, PK_AI_HEAD, pkValidate, pkJsonText, pkParse, mdToPacket, pkDate, pkCleanName, pkNormText, pkHash, pkDraft, pkAttrIssues, pkApplyAttrs, pkLinkCands, pkBodyNames, pkLinkRows, pkLinkOpen, pkResolve, pkNewPeople, pkDups, pkMeetDup, parseMeetTab, parseRosterTab, pkEtcText, pkActRows, pkUnadopted, pkRecordOut, pkMeetRow, pkActTabRow, importRowValues,
  INBOX_TAB, INBOX_ST, parseInbox, inboxCheck, inboxFind, inboxDoneCells, chatgptGuide, mdSafe, personSummary, planForRecord };`, ctx);
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
  sc.eq('⑪ 올리는 칸 — 파일 · 기준값 · 일정 제목 앞뒤 글자 · 대화 보기뿐(심방 내용 · 시험 상태 없음)', J(A.CFG_FIELDS), ['sheet', 'form', 'responder', 'cutoff', 'stale', 'calPre', 'calSuf', 'talk']);
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

// ⑮ (1109-T) 나눈 이야기 — 주제 칸 · 주고받기. 시트에는 한 칸 글 그대로
{
  const P = x => J(A.parseTalk(x)), L = (w, t) => ({ w, t });
  sc.eq('⑮ 그냥 글(옛 기록 · 폼) = 주제 하나 · 메모 — 붙은 줄은 한 메모, 빈 줄이 가른다', P('허리가 아프셔서 기도함\n다음 달 다시 연락\n\n둘째 문단'),
    [{ title: '', tags: [], lines: [L('n', '허리가 아프셔서 기도함\n다음 달 다시 연락'), L('n', '둘째 문단')] }]);
  sc.eq('⑮ 그냥 글은 다시 써도 한 글자도 같다(■ 줄을 붙이지 않는다)', A.talkText(A.parseTalk('허리가 아프셔서 기도함\n다음 달 다시 연락\n\n둘째 문단')), '허리가 아프셔서 기도함\n다음 달 다시 연락\n\n둘째 문단');
  sc.eq("⑮ 예전 '나눈 이야기 N' 제목 줄도 주제 칸으로", J(A.parseTalk('나눈 이야기 1\n이사 준비로 바쁨\n\n나눈 이야기 2\n딸 수능 기도 부탁').map(tp => [tp.title, tp.lines.map(l => l.t)])), [['', ['이사 준비로 바쁨']], ['', ['딸 수능 기도 부탁']]]);
  const TXT = '■ 어머님 수술 #건강 #가정\n성도: 다음 주 화요일에 수술해요.\n나: 전날 같이 기도해요.\n성도: 사흘 입원\n\n목소리가 지쳐 있었음\n\n■ #자녀 문제\n성도: 큰아이가 입대해요.\n\n■ 구역 모임\n나: 천천히 오셔도 돼요.';
  const T = A.parseTalk(TXT);
  sc.eq('⑮ ■ 줄 = 제목 · 태그(띄어쓰기 든 태그도 \' #\' 로 가른다)', J(T.map(tp => [tp.title, tp.tags])), [['어머님 수술', ['건강', '가정']], ['', ['자녀 문제']], ['구역 모임', []]]);
  sc.eq('⑮ 줄 맨 앞 성도: · 나: = 누가 한 말 · 빈 줄 뒤 이름표 없는 줄 = 메모', J(T[0].lines), [L('s', '다음 주 화요일에 수술해요.'), L('m', '전날 같이 기도해요.'), L('s', '사흘 입원'), L('n', '목소리가 지쳐 있었음')]);
  sc.eq('⑮ 새 모양 글 → 칸 → 글 이 같다', A.talkText(T), TXT);
  sc.eq('⑮ 한 말이 여러 줄이면 이어 붙는다 · 글 가운데의 나: 는 그냥 글 · 전각 콜론', J(A.parseTalk('성도: 첫 줄\n둘째 줄 나: 여기\n나：좋아요')[0].lines), [L('s', '첫 줄\n둘째 줄 나: 여기'), L('m', '좋아요')]);
  sc.eq('⑮ 메모는 앞 말과 빈 줄로 떼어 쓴다(안 그러면 다시 읽을 때 앞 말에 붙는다)', A.talkText([{ title: '', tags: [], lines: [L('s', '가'), L('n', '나'), L('n', '다'), L('m', '라')] }]), '성도: 가\n\n나\n\n다\n나: 라');
  sc.eq('⑮ 빈 말 · 빈 칸은 빠지고, 한 말 안의 빈 줄은 접힌다', A.talkText([{ title: '', tags: [], lines: [L('s', '  '), L('n', '')] }, { title: '둘', tags: [' 건강 ', '건강'], lines: [L('s', '가\n\n나 ')] }, { title: '', tags: [], lines: [] }]), '■ 둘 #건강\n성도: 가\n나');
  sc.eq('⑮ 맨 앞 칸이 제목 없이 말만 있고 뒤에 칸이 있으면 뒤 칸만 ■', A.talkText([{ title: '', tags: [], lines: [L('n', '가')] }, { title: '', tags: [], lines: [L('n', '나')] }]), '가\n\n■\n나');
  sc.eq('⑮ 칸 태그 모으기 · 목록 한 줄(이름표 · ■ 없이)', J([A.talkTags(T), A.talkPreview(TXT), A.talkPreview('■ 제목만'), A.talkPreview('')]), [['건강', '가정', '자녀 문제'], '다음 주 화요일에 수술해요.', '제목만', '']);
  sc.eq('⑮ 입력줄 차례 — 성도 ↔ 나, 메모는 그대로 · 이름표 누르면 성도 → 나 → 메모', J(['s', 'm', 'n'].map(A.talkNext).concat(['s', 'm', 'n'].map(A.talkCycle))), ['m', 's', 'n', 'm', 'n', 's']);
  sc.eq('⑮ 여러 줄 붙여 넣기 — 이름표 · ■ 는 알아보고, 없는 줄은 고른 사람 말로', J(A.talkPaste('■ 새 주제\n첫 말\n나: 내 말\n둘째 말', 's').map(tp => [tp.title, tp.lines])), [['새 주제', [L('s', '첫 말'), L('m', '내 말'), L('s', '둘째 말')]]]);
  sc.eq('⑮ 메모로 붙여 넣으면 붙은 줄은 한 메모', J(A.talkPaste('가\n나', 'n')[0].lines), [L('n', '가\n나')]);
  // 기록 태그 = 칸 태그 ∪ 직접 고른 것
  const H = HEAD.concat(['기록ID', '출처', '심방일', '수정', '확인', '보관']), map = A.headerMap(H).map;
  const row = ['', '11/9', '가나다', '장년부', '전화', TXT, '건강, 가정, 자녀 문제, 신앙', '', '깊음', 'C1', '앱', '2026-11-09', '', '', ''];
  const v = A.buildModel([H, row], { tags: OPT.tags, cutoff: '' }).visits[0], r = A.recordFromVisit(v);
  sc.eq('⑮ (T6) 고치기 입력 꼴의 태그 = 기록 태그 그대로(칸 태그도 정리 알약에 켜짐)', J([r.tags, r.tagsEtc]), [['건강', '가정', '신앙'], '자녀 문제']);
  sc.eq('⑮ 저장하면 태그 칸 그대로', A.recordCells(r).tags, '건강, 가정, 신앙, 자녀 문제');
  sc.eq('⑮ 안 바꾸고 저장 → 칸이 하나도 안 바뀐다(태그 순서만 다른 것도 같은 값)', A.editPatch(H, map, row, r, 0).cells.length, 0);
  const r2 = J(r); A.talkTagSync(r2, ['건강', '가정', '자녀 문제'], ['자녀 문제'], OPT.tags); r2.text = A.talkText(A.parseTalk(TXT).slice(1));
  sc.eq('⑮ 칸을 지우면 그 칸에만 있던 태그는 꺼진다(직접 고른 것은 남음)', A.recordCells(r2).tags, '신앙, 자녀 문제');
  const r3 = { tags: ['신앙'], tagsEtc: '' }; A.talkTagSync(r3, [], ['건강', '새말'], OPT.tags);
  sc.eq('⑮ 칸에서 켠 태그 → 알약에 있으면 알약, 없으면 직접 적기 · 이미 켜진 것은 그대로', J([r3.tags, r3.tagsEtc]), [['신앙', '건강'], '새말']);
  A.talkTagSync(r3, ['건강', '새말'], [], OPT.tags);
  sc.eq('⑮ 칸에서 끄면 정리 태그에서도 꺼짐', J([r3.tags, r3.tagsEtc]), [['신앙'], '']);
  sc.eq('⑮ 새 기록 — 칸 태그만 있어도 태그 칸에 들어간다', A.recordCells(Object.assign(A.blankRecord('2026-11-09', null), { name: '가', text: '■ #건강\n성도: 가' })).tags, '건강');
  // 성도 화면 주제로 보기
  const V = [{ key: 'a', ymd: '2026-11-09', text: TXT, allTags: ['건강'] }, { key: 'b', ymd: '2026-10-12', text: '그냥 메모', allTags: ['건강', '신앙'] }, { key: 'c', ymd: '2026-09-01', text: '가\n\n■ 둘\n나', allTags: ['직장'] }];
  const it = A.talkTopicsOf(V);
  sc.eq('⑮ 주제 펼치기 — 칸마다 · 칸 하나뿐인 옛 기록은 기록 태그 · 칸 여럿인데 태그 없는 칸은 태그 없음', J(it.map(x => [x.key, x.i, x.tags])), [['a', 0, ['건강', '가정']], ['a', 1, ['자녀 문제']], ['a', 2, []], ['b', 0, ['건강', '신앙']], ['c', 0, []], ['c', 1, []]]);
  sc.eq('⑮ 태그별 칸 수 — 많은 순 · 같으면 가나다', J(A.talkTagCounts(it)), [{ t: '건강', n: 2 }, { t: '가정', n: 1 }, { t: '신앙', n: 1 }, { t: '자녀 문제', n: 1 }]);
}
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
  sc.eq("㉔ HB 폼의 실제 제목 'PAY'(대소문자 무시)도 사주심 칸", [A.headerMap(['성도 이름', '내용', '장소', 'PAY']).map.pay, A.headerMap(['성도 이름', '내용', 'Pay']).map.pay, A.headerMap(['성도 이름', '내용', 'PAYMENT 메모']).map.pay], [3, 2, undefined]);
  sc.eq("㉔ 폼 질문 'PAY' 의 선택지를 읽는다", J(A.formQOf(A.formSummary({ items: [{ itemId: 'i8', title: 'PAY', questionItem: { question: { questionId: 'q8', choiceQuestion: { type: 'RADIO', options: [{ value: '사주심' }, { value: '사드림' }, { isOther: true }] } } } }] }), 'pay').options), ['사주심', '사드림']);
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

// ㉕ (1109-D) 새 버전 받기 · 개발자 배지 · 장소 · 사주심 알약 목록
{
  sc.eq('㉕ 버전 견주기 — 같은 날 빌드 번호 · 날짜 · 해', [A.isNewer('v. 26-1109-5', 'v. 26-1109-4'), A.isNewer('v. 26-1109-10', 'v. 26-1109-9'), A.isNewer('v. 26-1110-1', 'v. 26-1109-12'), A.isNewer('v. 27-0101-1', 'v. 26-1231-9')], [true, true, true, true]);
  sc.eq('㉕ 같거나 옛것 · 꼴이 이상하면 새 버전이 아니다(다시 열기 되풀이 막기)', [A.isNewer('v. 26-1109-4', 'v. 26-1109-4'), A.isNewer('v. 26-1109-3', 'v. 26-1109-4'), A.isNewer('', 'v. 26-1109-4'), A.isNewer('<html>', 'v. 26-1109-4')], [false, false, false, false]);
  sc.eq('㉕ 지금 앱 버전도 그 꼴이다', A.verNum(A.APP_VERSION) > 0, true);
  sc.eq('㉕ 개발자 배지는 HB 계정에만(대소문자 무시)', [A.isDevEmail('denartist@gmail.com'), A.isDevEmail('DenArtist@Gmail.com'), A.isDevEmail('test@example.com'), A.isDevEmail(undefined)], [true, true, false, false]);
  sc.eq("㉕ 탭 이름 '심방 선택지' · 칸 장소 · 사주심", [A.VIS_OPT_TAB, J(A.VIS_OPT_FIELDS.map(f => f[0]))], ['심방 선택지', ['place', 'pay']]);
  const vis = [{ place: '역 앞 카페' }, { place: '역 앞 카페' }, { place: '교회 카페' }, { place: '' }];
  const d0 = A.visOptDefaults(vis, {});
  sc.eq('㉕ 탭이 비면 — 장소는 자주 쓴 것, 사주심은 사주심 · 사드림', J([d0.place, d0.pay]), [['역 앞 카페', '교회 카페'], ['사주심', '사드림']]);
  const d1 = A.visOptDefaults(vis, { places: ['교회', '집'], pays: ['사주심', '사드림', '각자'] });
  sc.eq('㉕ 폼 질문에 선택지가 있으면 그것을 처음 목록으로', J([d1.place, d1.pay]), [['교회', '집'], ['사주심', '사드림', '각자']]);
  const P = A.optsParse([['칸', '값'], ['장소', '스타벅스'], ['장소', '집'], ['출석 칸', 'x'], ['사주심 / 사드림', '사드림']], A.VIS_OPT_FIELDS);
  sc.eq('㉕ 탭 읽기 — 칸 이름으로 · 모르는 칸은 버림', J([P.place, P.pay]), [['스타벅스', '집'], ['사드림']]);
  const U = A.visOptsUse(A.optsParse([['칸', '값'], ['장소', '스타벅스']], A.VIS_OPT_FIELDS), vis, {});
  sc.eq('㉕ 탭에 없는 칸(사주심)은 기본값으로', J([U.place, U.pay]), [['스타벅스'], ['사주심', '사드림']]);
  sc.eq('㉕ 탭에 쓸 줄', J(A.optsRows({ place: ['집'], pay: ['사주심'] }, A.VIS_OPT_FIELDS)), [['칸', '값'], ['장소', '집'], ['사주심 / 사드림', '사주심']]);
  sc.eq('㉕ 출석 선택지 읽기 · 쓰기는 예전 그대로', J(A.attOptsRows(A.attOptsParse([['칸', '값'], ['자리', '맨 앞']]))), [['칸', '값'], ['자리', '맨 앞']]);
}

// ㉖ (1109-E2) '누구를' 아래 최근 이름 — 심방 · 출석 합쳐 최근 순
{
  const V = [{ name: '가나다', ymd: '2026-10-01' }, { name: '라마바', ymd: '2026-11-05' }, { name: '가 나다', ymd: '2026-11-01' }, { name: '', ymd: '2026-11-09' }];
  const T = [{ name: '사아자', date: '2026-11-08' }, { name: '라마바', date: '2026-10-01' }, { name: '차카타', date: '2026-11-05' }];
  sc.eq('㉖ 마지막 날 최근 순 · 띄어쓰기만 다른 이름은 하나 · 같은 날은 가나다 순 · 빈 이름 뺌', J(A.recentNames(V, T)), ['사아자', '라마바', '차카타', '가나다']);
  sc.eq('㉖ 비어 있으면 빈 목록', J(A.recentNames([], null)), []);
  // 1109-J 10-1 보관 기준 — 마지막 날이 기준보다 옛 이름은 알약에서 뺀다(보관 기준 없으면 그대로)
  sc.eq('㉖ 보관 기준(2026-11-01) — 옛 이름은 알약에서 빠짐 · 경계 당일은 남음 · 기준 없으면 전부', J([A.recentNames(V, T, '2026-11-02'), A.recentNames(V, T, '2026-11-01'), A.recentNames(V, T, null).length]), [['사아자', '라마바', '차카타'], ['사아자', '라마바', '차카타', '가나다'], 4]);
}

// ㉗ (1109-E3) '셀' 단추 — 셀 한눈에 로그인 읽기만 · 내 분파셀 셀원 · 셀 케어엔 읽기 넷뿐
{
  const now = Date.parse('2026-11-09T01:00:00Z'), sec = Math.floor(now / 1000);
  sc.eq('㉗ 로그인 없음 · 깨진 값 · 만료(1분 안 남음) · 살아 있음 · 옛 꼴(currentSession)', J([
    A.cellToken(null, now).state, A.cellToken('{깨짐', now).state, A.cellToken(JSON.stringify({ access_token: 'a', expires_at: sec + 30 }), now).state,
    A.cellToken(JSON.stringify({ access_token: 'a', expires_at: sec + 3600 }), now), A.cellToken(JSON.stringify({ currentSession: { access_token: 'b', expires_at: sec + 3600 } }), now).tok]),
    ['none', 'none', 'expired', { state: 'ok', tok: 'a' }, 'b']);
  sc.eq('㉗ 열쇠 이름 = 셀 한눈에(supabase 기본 이름)', A.CELL_SB_KEY, 'sb-mcbbhsvvzqvtrxlbdcks-auth-token');
  const G = A.cellGroups([{ cell_id: 'c2', cell_name: '나무셀', leader_names: '가리더' }, { cell_id: 'c1', cell_name: '하늘셀', leader_names: '나리더', i_am_leader: true }],
    [{ cell_id: 'c2', name: '가 리더' }, { cell_id: 'c2', name: '다다', active: true }, { cell_id: 'c2', name: '가가' }, { cell_id: 'c2', name: '빠짐', active: false }, { cell_id: 'c2', name: '떠남', left_at: '2026-01-01' }, { cell_id: 'c1', name: '라라' }, { cell_id: 'c2', name: '가가' }]);
  sc.eq('㉗ 내가 인도하는 셀 먼저 · 셀리더 따로(셀원 명단에선 뺌, 띄어쓰기 무시) · 셀원은 가나다 순 · 쉬는 분 · 떠난 분 · 겹침 뺌', J(G.map(g => [g.name, g.lead, g.leaders, g.members])), [['하늘셀', true, ['나리더'], ['라라']], ['나무셀', false, ['가리더'], ['가가', '다다']]]);
  sc.eq('㉗ 셀리더가 둘이면 둘 다 (쉼표 · 가운뎃점)', J(A.cellGroups([{ cell_id: 'x', cell_name: 'x', leader_names: '가가, 나나 · 다다' }], []).map(g => g.leaders)), [['가가', '나나', '다다']]);
  const code = HTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\/[^\n]*/g, '');
  const calls = [...code.matchAll(/ccFetch\('([a-z_\/]+)/g)].map(x => x[1]).sort();
  sc.eq('㉗ 셀 케어에 부르는 것은 읽기 넷뿐', J([...new Set(calls)]), ['cell_members', 'leadership_assignments', 'rpc/get_my_context', 'rpc/get_week_status']);
  sc.eq('㉗ 갱신 열쇠를 쓰지 않는다 · supabase 도구를 싣지 않는다(로그인을 건드릴 길이 없게)', [/refresh_token|grant_type/.test(code), /supabase-js|createClient\(/.test(code)], [false, false]);
  const cell = fs.readFileSync(path.join(__dirname, '..', 'cell', 'index.html'), 'utf8');
  sc.eq("㉗ 셀 한눈에의 cell-core 에 pickMine 이 있다(심방 노트가 그대로 불러 씀)", /<script id="cell-core">[\s\S]*?function pickMine\(/.test(cell), true);
}

// ㉞ 다음 심방 질문 (1110-Q) — 이름은 지어낸 것
{
  const PLAUD = '7. 다음 심방 질문\n\n1. 가가 님께서 내려오신 이후 혼자 계시는 시간대는 어떻게 조정되고 있나요?\n2. 2026-11-07 섬김 이후 나나 자매의 마음은 지금 어떻게\n정리되었나요?\n3. 다다와 토요일 대화로 정리된 부분이 이어지고 있는지요?\n';
  sc.eq('㉞ 플라우드 붙여넣기 — 제목 줄 버림 · 번호 뗌 · 줄바꿈된 질문은 앞 질문에 이어 붙임', J(A.qnParse(PLAUD)),
    ['가가 님께서 내려오신 이후 혼자 계시는 시간대는 어떻게 조정되고 있나요?', '2026-11-07 섬김 이후 나나 자매의 마음은 지금 어떻게 정리되었나요?', '다다와 토요일 대화로 정리된 부분이 이어지고 있는지요?']);
  sc.eq('㉞ 번호 없는 목록은 한 줄 = 하나 · 글머리(- • □ 1) )도 뗀다', J(A.qnParse('- 가\n• 나\n□ 다\n2) 라\n')), ['가', '나', '다', '라']);
  sc.eq('㉞ 번호가 하나도 없으면 줄마다 하나', J(A.qnParse('첫 질문\n둘째 질문')), ['첫 질문', '둘째 질문']);
  sc.eq('㉞ 빈 글 · 제목만 → 없음 · 30개까지 · 300자까지', [A.qnParse('').length, A.qnParse('다음 심방 질문').length, A.qnParse(Array.from({ length: 40 }, (_, i) => (i + 1) + '. q' + i).join('\n')).length, A.qnParse('가'.repeat(500))[0].length], [0, 0, 30, 300]);
  const items = [{ t: '가 질문', done: false }, { t: '나 질문', done: true }];
  sc.eq("㉞ 시트 칸 글 — '[ ] ' 아직 · '[x] ' 물어봄 · 한 줄에 하나", A.qnEncode(items), '[ ] 가 질문\n[x] 나 질문');
  sc.eq('㉞ 칸 글 → 목록 (되읽기 그대로 · 표시 없는 줄은 아직 · 사람이 [X] · [✓] 로 고쳐도 읽음)', [J(A.qnDecode(A.qnEncode(items))), J(A.qnDecode('맨 글\n[X] 큰 엑스\n[✓] 체크'))],
    [J(items), [{ t: '맨 글', done: false }, { t: '큰 엑스', done: true }, { t: '체크', done: true }]]);
  const tab = [A.QN_HEAD, ['C1', '가가', '[ ] 하나', 's'], ['C2', '나나', '[x] 둘', 's'], ['C2', '나나', '[ ] 겹침', 's'], ['', 'x', 'y', '']];
  const m = A.parseQnTab(tab);
  sc.eq('㉞ 탭 읽기 — 기록ID 로 · 줄 번호 · 같은 기록ID 둘이면 dup', [m.C1.row, J(m.C1.items), !!m.C2.dup, Object.keys(m).length], [2, [{ t: '하나', done: false }], true, 2]);
  sc.eq('㉞ 머리글이 다르면 아무것도 읽지 않는다', J(A.parseQnTab([['가', '나'], ['C1', 'x']])), {});
  const v = { id: 'C1', name: '가가' };
  sc.eq('㉞ 쓰기 — 줄이 있으면 질문 · 수정 칸만', J(A.qnPlan(m, v, items, '2026-11-10 10:00')), { update: { row: 2, cells: { '질문': '[ ] 가 질문\n[x] 나 질문', '수정': '2026-11-10 10:00' } } });
  sc.eq('㉞ 쓰기 — 줄이 없으면 머리글 순서대로 한 줄 (사람이 열을 옮겨도)', J(A.qnPlan({}, { id: 'C9', name: '다다' }, items, 'T', ['질문', '기록ID', '수정', '성도'])), { append: ['[ ] 가 질문\n[x] 나 질문', 'C9', 'T', '다다'] });
  sc.eq('㉞ 쓰기 — 같은 기록ID 줄이 둘이면 쓰지 않는다', J(A.qnPlan(m, { id: 'C2', name: '나나' }, items, 'T')), { dup: true });
  sc.eq("㉞ BLOCK7 로 — '이름 심방' · 하위 항목은 안 물어본 것만", [A.qnB7Text(v), J(A.qnSubs(items))], ['가가 심방', ['가 질문']]);
  const n = A.b7Note('가가 심방', '2026-11-10', 1, 'N', A.qnSubs(items));
  sc.eq('㉞ 쪽지 — 받는 꼴 그대로 + subs', J(n), { id: 'N', from: 'care', date: '2026-11-10', sec: '', text: '가가 심방', at: 1, subs: ['가 질문'] });
  sc.eq('㉞ 하위 항목이 없으면 subs 칸도 없다(예전 쪽지와 같은 꼴)', 'subs' in A.b7Note('a', '2026-11-10', 1, 'N', []), false);
  sc.eq('㉞ 하위 항목도 공백 정리 · 200자 · 30개까지', [A.b7Note('a', '2026-11-10', 1, 'N', ['  가   나 ', '', 'ㄱ'.repeat(300)]).subs.map(x => x.length), A.b7Note('a', '2026-11-10', 1, 'N', Array(40).fill('q')).subs.length], [[3, 200], 30]);
}

// ㉟ (1112-M) 한 심방에 여러 이름 · 셀 표시 · 사람별 내용 — 시트 모양은 그대로(이름 칸 쉼표 · 내용 칸 '◆ 이름' 줄)
{
  // 셀 표시 — '이름 셀'(빈칸 한 칸) · 세 글자 넘는 이름 + 셀. 두 글자 + 셀(사람 이름일 수 있음)은 사람으로
  sc.eq('㉟ 셀 표시 알아보기 — 빈칸 · 빈칸 여럿 · 붙여 씀(긴 이름) · 짧게 붙여 씀은 사람 · 그냥 이름', J(['가나다 셀', '가나다   셀', '가나다라셀', '가나셀', '가나다', '셀'].map(A.groupCanon)),
    ['가나다 셀', '가나다 셀', '가나다라 셀', '', '', '']);
  sc.eq('㉟ 이름 칸 → 사람 · 셀 표시 (쉼표 · 전각 쉼표 · 、, 띄어쓰기만 다른 같은 이름은 하나)', J(A.parseWho(' 가나다 셀, 가나다，라마바、 라 마바 ,사아자')),
    { names: ['가나다', '라마바', '사아자'], groups: ['가나다 셀'] });
  sc.eq('㉟ 한 분 · 빈 칸', J([A.parseWho('가나다'), A.parseWho('')]), [{ names: ['가나다'], groups: [] }, { names: [], groups: [] }]);
  sc.eq('㉟ 이어 붙일 사람 — 사람이 있으면 사람들 · 셀 표시만 있으면 그 표시 · 빈 칸이면 없음', J([A.whoKeys('가나다 셀, 라마바, 사아자'), A.whoKeys('가나다 셀'), A.whoKeys(''), A.whoKeys('가나다')]),
    [['라마바', '사아자'], ['가나다 셀'], [], ['가나다']]);
  sc.eq('㉟ 더하기 — 셀 표시는 앞에 · 이미 있는 이름은 건너뜀 · 빼기', [A.whoMerge('라마바', ['가나다 셀', '라 마바', '사아자']), A.whoMerge('', ['가나다']), A.whoRemove('가나다 셀, 라마바, 사아자', '라마바'), A.whoRemove('가나다 셀, 라마바', '가나다셀')],
    ['가나다 셀, 라마바, 사아자', '가나다', '가나다 셀, 사아자', '라마바']);
  sc.eq('㉟ 짧은 제목(캘린더 · BLOCK7) — 한 분은 예전 그대로 · 셋까지 · 넘으면 외 N명 · 셀 표시가 있으면 그것만',
    J(['가나다', '가나다, 라마바', '가나다, 라마바, 사아자', '가나다, 라마바, 사아자, 차카타', '가나다 셀, 라마바, 사아자', ''].map(A.whoShort)),
    ['가나다', '가나다, 라마바', '가나다, 라마바, 사아자', '가나다, 라마바 외 2명', '가나다 셀', '']);
  sc.eq('㉟ 캘린더 제목 · BLOCK7 할 일 글도 짧은 제목으로 (한 분이면 예전과 같다)', [A.calTitle('가나다, 라마바, 사아자, 차카타', '심방 · ', ''), A.calTitle('가나다', '', ' 심방'),
    A.b7Text({ name: '가나다 셀, 라마바' }, { t: '중보', x: '' }), A.qnB7Text({ name: '가나다 셀, 라마바' })],
    ['심방 · 가나다, 라마바 외 2명', '가나다 심방', '중보 · 가나다 셀', '가나다 셀 심방']);

  // 사람별 내용 — '내용' 칸 글 끝에 '◆ 이름' 줄로 칸을 나눈다
  const raw = '■ 근황\n성도: 다들 잘 지내요.\n\n◆ 라마바\n이직 준비 중.\n기도 부탁.\n\n◆ 사아자\n허리가 아프다.';
  const sp = A.splitNotes(raw);
  sc.eq('㉟ 내용 칸 → 함께 나눈 이야기 + 사람별 (여러 줄 그대로)', J(sp), { main: '■ 근황\n성도: 다들 잘 지내요.', notes: [{ name: '라마바', text: '이직 준비 중.\n기도 부탁.' }, { name: '사아자', text: '허리가 아프다.' }] });
  sc.eq('㉟ 다시 쓰면 한 글자도 같다', A.joinNotes(sp.main, sp.notes), raw);
  sc.eq('㉟ ◆ 줄이 없는 옛 글은 그대로 (끝 빈칸까지)', J(A.splitNotes('그냥 글\n둘째 줄 ')), { main: '그냥 글\n둘째 줄 ', notes: [] });
  sc.eq('㉟ 사람별만 있고 함께 이야기가 없으면 ◆ 부터', A.joinNotes('', [{ name: '라마바', text: '가' }]), '◆ 라마바\n가');
  sc.eq('㉟ 빈 사람별 칸은 빠지고, 다 비면 예전 글 그대로 · 사람별 글 안의 ◆ 줄은 ◇ 로(다시 읽을 때 칸이 갈라지지 않게)',
    [A.joinNotes('본문', [{ name: '라마바', text: '  ' }, { name: '', text: 'x' }]), A.joinNotes('본문', [{ name: '라마바', text: '◆ 가\n나' }])], ['본문', '본문\n\n◆ 라마바\n◇ 가\n나']);

  // 읽기 — 줄 → 기록: 이름은 사람마다, 이야기는 함께 몫만(목록 · 미리보기 · 주제 칸이 사람별 글을 섞지 않게)
  const H = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이', '기록ID', '출처', '심방일'];
  const rows = [H,
    ['11/10/2026 9:00:00', '11/10', '가나다 셀, 라마바, 사아자', '셀원', '식사', raw, '', '중보', '깊음', 'C1', '앱', '2026-11-10'],
    ['11/3/2026 9:00:00', '11/3', '라마바', '셀원', '티타임', '지난주 이야기', '', '', '중간', 'C2', '앱', '2026-11-03'],
    ['11/1/2026 9:00:00', '11/1', '가나다 셀', '', '', '셀 모임', '', '', '', 'C3', '폼', '2026-11-01']];
  const M = A.buildModel(rows, { cutoff: '2025-01-01' }), v1 = M.visits.find(v => v.id === 'C1');
  sc.eq('㉟ 기록 — 이름 칸은 그대로 · 사람 · 셀 표시 · 이야기는 함께 몫 · 사람별 따로', J([v1.name, v1.names, v1.groups, v1.who, v1.text, v1.notes.map(n => n.name)]),
    ['가나다 셀, 라마바, 사아자', ['라마바', '사아자'], ['가나다 셀'], ['라마바', '사아자'], '■ 근황\n성도: 다들 잘 지내요.', ['라마바', '사아자']]);
  sc.eq('㉟ 성도 모음은 사람 하나하나로 · 셀 표시만 적은 기록은 그 표시로', J(Object.keys(M.people).sort()), ['가나다 셀', '라마바', '사아자']);
  const PL = A.peopleList(M, M.visits, '2026-11-12', 21), ra = PL.find(p => p.name === '라마바');
  sc.eq('㉟ 성도 목록 — 라마바는 함께 한 심방 + 혼자 한 심방 둘 다 · 마지막은 함께 한 날', J([ra.visits.map(v => v.id), ra.last, PL.find(p => p.name === '사아자').visits.length]), [['C1', 'C2'], '2026-11-10', 1]);
  sc.eq('㉟ 찾기 — 사람별 글로도 찾힌다', J(A.filterVisits(M.visits, {}, '', false, '허리').map(v => v.id)), ['C1']);
  sc.eq('㉟ 최근 이름 — 사람 하나하나 + 셀 표시도 한 알약', J(A.recentNames(M.visits, [])), ['가나다 셀', '라마바', '사아자']);
  sc.eq('㉟ 미리보기 — 함께 이야기 첫 말 · 없으면 첫 사람별 글', [A.visitPreview(v1), A.visitPreview({ text: '', notes: [{ name: '라마바', text: '\n첫 줄\n둘째' }] })], ['다들 잘 지내요.', '라마바 · 첫 줄']);
  sc.eq('㉟ 그 분 몫 — 사람별 글이 있으면 그것(띄어쓰기 무시) · 없으면 빈 글', [A.personNote(v1, '사 아자'), A.personNote(v1, '차카타'), A.personNote({ text: 'x' }, '라마바')], ['허리가 아프다.', '', '']);

  // 쓰기 — 고치기 꼴 ↔ 칸
  const f = A.recordFromVisit(v1);
  sc.eq('㉟ 고치기 꼴 — 이름 칸 그대로 · 이야기는 함께 몫 · 사람별은 이름 열쇠로', J([f.name, f.text, f.pn]),
    ['가나다 셀, 라마바, 사아자', '■ 근황\n성도: 다들 잘 지내요.', { '라마바': { name: '라마바', text: '이직 준비 중.\n기도 부탁.' }, '사아자': { name: '사아자', text: '허리가 아프다.' } }]);
  const hm = A.headerMap(H).map, cur = rows[1].slice();
  sc.eq('㉟ 안 바꾸고 저장하면 칸이 하나도 안 바뀐다', J(A.editPatch(H, hm, cur, f, 1).cells), []);
  sc.eq('㉟ 이름 칸 띄어쓰기 · 쉼표 꼴만 다르면 같은 값', J(A.editPatch(H, hm, cur, Object.assign({}, f, { name: '가나다 셀,라마바,  사아자' }), 1).cells), []);
  const f2 = A.recordFromVisit(v1); f2.name = A.whoMerge(f2.name, ['차카타']); f2.pn['차카타'] = { name: '차카타', text: '처음 오심' }; f2.pn['사아자'].text = '';
  const p2 = A.editPatch(H, hm, cur, f2, Date.parse('2026-11-12T01:00:00Z')).cells;
  sc.eq('㉟ 한 분 더 · 한 분 글 지움 → 이름 칸 · 내용 칸만 (빈 사람별 칸은 빠짐 · 차례는 이름 차례)', J(p2.map(c => [c.k, c.value])),
    [['name', '가나다 셀, 라마바, 사아자, 차카타'], ['text', '■ 근황\n성도: 다들 잘 지내요.\n\n◆ 라마바\n이직 준비 중.\n기도 부탁.\n\n◆ 차카타\n처음 오심']]);
  const f3 = A.recordFromVisit(v1); f3.name = A.whoRemove(f3.name, '사아자');
  sc.eq('㉟ 이름을 빼도 그 분 글은 남아 있으면 끝에 그대로 적는다(지우는 것은 화면에서 따로 — 모르게 사라지지 않게)', A.recordCells(f3).text, raw);
  sc.eq('㉟ 이름 칸 꼴 · 필수 — 셀 표시만으로도 · 이야기 없이 사람별 글만 있어도 통과', J([A.recordCells(Object.assign(A.blankRecord('2026-11-12'), { name: '가나다 셀, 라마바', text: 'x' })).name,
    A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '가나다 셀', text: 'x' })),
    A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '라마바, 사아자', pn: { '라마바': { name: '라마바', text: '글' } } })),
    A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: ' , ', text: 'x' }))]),
    ['가나다 셀, 라마바', [], [], ['성도 이름을 적어 주세요']]);
  sc.eq('㉟ 새 기록의 빈 꼴에 사람별 칸', J(A.blankRecord('2026-11-12').pn), {});
  sc.eq('㉟ 계획 → 기록 — 여러 이름 그대로 · 구분은 첫 분 것', J(A.recordFromPlan({ name: '라마바, 사아자', date: '2026-11-12', method: '', place: '' }, M.people)).roles, ['셀원']);

  // 셀 명단 — '가나다 셀' 로 찾기 (셀 이름 · 셀리더 이름 · 띄어쓰기 · 끝 '셀' 무시) · 못 찾으면 지난 그 셀 심방 명단
  const G = [{ name: '가나다셀', leaders: ['가나다'], members: ['라마바', '사아자'] }, { name: '하늘셀', leaders: ['차카타'], members: ['파하'] }, { name: '두리셀', leaders: ['자차'], members: [] }];
  sc.eq('㉟ 셀 찾기 — 셀 이름으로 · 셀리더 이름으로 · 셀 표시가 아니면 · 모르는 셀', J([A.cellFind(G, '가나다 셀'), A.cellFind(G, '차카타 셀') && A.cellFind(G, '차카타 셀').name, A.cellFind(G, '가나다'), A.cellFind(G, '없는 셀')]),
    [G[0], '하늘셀', null, null]);
  sc.eq('㉟ 셀 이름과 셀리더가 다른 셀로 갈리면 셀 이름 쪽', A.cellFind([{ name: '자차셀', leaders: ['가'], members: [] }, { name: '다른셀', leaders: ['자차'], members: [] }], '자차 셀').name, '자차셀');
  sc.eq('㉟ 셀 사람 — 셀리더 먼저 · 겹침 없이', J(A.cellPeople({ leaders: ['가나다'], members: ['라마바', '가 나다'] })), ['가나다', '라마바']);
  sc.eq('㉟ 지난 그 셀 심방 명단 — 가장 최근 것 · 사람 없는 기록은 건너뜀 · 없으면 빈 목록',
    J([A.groupFromHistory(M.visits.concat([{ name: '가나다 셀, 차카타', ymd: '2026-10-01', names: ['차카타'], groups: ['가나다 셀'] }]), '가나다셀'), A.groupFromHistory(M.visits, '하늘 셀')]),
    [['라마바', '사아자'], []]);
}

// ㊱ 1112-N vNext — 핵심 한줄 · 상세 기록 · 장기 관찰 · 우선순위 · 정보 성격 · 시험 시트 · 이름 후보
{
  const J = x => JSON.parse(JSON.stringify(x));
  const H0 = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이', '장소', 'PAY', '기록ID', '출처', '심방일', '수정', '확인', '보관'];
  const H1 = H0.concat(A.NX_COLS);
  sc.eq('㊱ 더할 열 — 응답 탭 끝(R 부터) 아홉(2·3·4단계 언급된 성도 포함) · 다음 질문 열은 없음(탭을 쓴다)', J(A.nxPlan({ header: H0, cols: 17 }, null, []).resp), { add: A.NX_COLS.slice(), start: 17, grow: 9 });
  sc.eq('㊱ 1단계에서 여덟 칸을 더한 시트 → 언급된 성도 한 칸만 더 붙는다', J(A.nxPlan({ header: H0.concat(A.NX_COLS.slice(0, 8)), cols: 26 }, null, []).resp), { add: ['언급된 성도'], start: 25, grow: 0 });
  sc.eq('㊱ 여덟 칸만 있으면 아직 새 칸을 안 보인다(한 칸 더 눌러야)', A.nxReady(A.headerMap(H0.concat(A.NX_COLS.slice(0, 8))).map), false);
  sc.eq('㊱ 첫 새 열은 R', A.colLetter(A.nxPlan({ header: H0, cols: 26 }, null, []).resp.start), 'R');
  sc.eq('㊱ 다음 질문은 열로 만들지 않는다', !A.NX_COLS.includes('다음 질문'), true);
  const ACT = ['액션ID', '기록ID', '성도', '종류', '세부', '내용', '기한', '상태', '완료일', 'BLOCK7 할일'];
  const pl = A.nxPlan({ header: H0, cols: 17 }, { header: ACT, cols: 10 }, ['Form Responses 1', '액션', '모임']);
  sc.eq('㊱ 액션 탭은 K 에 실행근거 · 없는 새 탭만', J([pl.act, A.colLetter(pl.act.start), pl.tabs]), [{ add: ['실행근거'], start: 10, grow: 1 }, 'K', ['AI 입력대기']]);
  sc.eq('㊱ 이미 더했으면 더할 것이 없다(여러 번 눌러도 같다)', J(A.nxPlan({ header: H1, cols: 26 }, { header: ACT.concat(['실행근거']), cols: 11 }, ['모임', 'AI 입력대기'])), { resp: { add: [], start: 26, grow: 0 }, act: { add: [], start: 11, grow: 0 }, tabs: [] });
  sc.eq('㊱ 새 탭 머리글', J(A.NX_TABS), { '모임': ['모임ID', '날짜', '제목', '유형', '공통 핵심', '공통 상세 기록', '원본ID', '원본 링크', '미확인 화자', '만든 시각'], 'AI 입력대기': ['접수ID', '접수시각', '스키마버전', '패킷JSON', '상태', '오류', '원본ID', '생성된 기록ID', '처리시각'] });
  sc.eq('㊱ 운영 시트에 열 더하기는 아직 잠김(7단계 HB 승인 뒤)', A.NX_LIVE, false);

  const m0 = A.headerMap(H0).map, m1 = A.headerMap(H1).map;
  sc.eq('㊱ 열이 모두 있어야 새 칸을 보인다', [A.nxReady(m0), A.nxReady(m1), A.nxReady(A.headerMap(H0.concat(['핵심 한줄'])).map)], [false, true, false]);
  sc.eq('㊱ 새 열이 폼 질문으로 잘못 잡히지 않는다(폼에 없는 열 경고에도 안 뜸)', A.formVsSheet([{ title: '성도 이름' }], H1).notInForm.filter(h => A.NX_COLS.includes(h)), []);
  // 열 순서가 섞여도 이름으로
  const Hx = H1.slice(0, 11).concat(['상세 기록'], H1.slice(11).filter(h => h !== '상세 기록'));
  const row = new Array(Hx.length).fill(''), put = (h, v) => { row[Hx.indexOf(h)] = v; };
  put('성도 이름', '가나다'); put('심방 날짜', '11/11'); put('Timestamp', '11/11/2026 10:00:00'); put('내용', '짧은 메모'); put('기록ID', 'C1'); put('심방일', '2026-11-11');
  put('핵심 한줄', '어머니 수술 앞두고 불안'); put('상세 기록', '## 상황\r\n- 다음 주 수술\n\n- 기도 부탁'); put('장기 관찰', '가정 돌봄 부담'); put('우선순위', '이번주'); put('정보 성격', '전언'); put('원본ID', 'plaud-1');
  const v = A.rowToVisit(row, A.headerMap(Hx).map, {});
  sc.eq('㊱ 줄 → 기록 — 새 칸을 이름으로 읽고, 긴 글은 줄바꿈 그대로(\\r 만 뺌)', J([v.core, v.detail, v.longObs, v.prio, v.basis, v.srcId, v.meetId, v.text]),
    ['어머니 수술 앞두고 불안', '## 상황\n- 다음 주 수술\n\n- 기도 부탁', '가정 돌봄 부담', '이번주', '전언', 'plaud-1', '', '짧은 메모']);
  const vOld = A.rowToVisit(['11/1/2026 9:00:00', '11/1', '가나다', '', '', '옛 글'], A.headerMap(H0).map, {});
  sc.eq('㊱ 열이 없는 옛 시트는 새 칸이 모두 비어 있다', J([vOld.core, vOld.detail, vOld.prio, vOld.basis]), ['', '', '', '']);

  // 쓰기
  const f = A.recordFromVisit(Object.assign({ names: ['가나다'], groups: [], notes: [], roles: [], rolesEtc: [], tags: [], tagsEtc: [], acts: [], actsEtc: [], methodEtc: '', method: '' }, v));
  sc.eq('㊱ 안 바꾸고 저장하면 칸이 하나도 안 바뀐다(긴 글 \\r 포함)', J(A.editPatch(Hx, A.headerMap(Hx).map, row, f, 1).cells.map(c => c.k)), []);
  const f2 = Object.assign({}, f, { detail: '## 상황\n- 다음 주 수술\n- 기도 부탁', prio: '긴급' });
  sc.eq('㊱ 상세 기록은 줄바꿈만 바뀌어도 값이 바뀐 것 · 우선순위', J(A.editPatch(Hx, A.headerMap(Hx).map, row, f2, 1).cells.map(c => c.k)), ['@상세 기록', '@우선순위', '@수정']);
  const nr = A.newRowValues(H1, m1, Object.assign(A.blankRecord('2026-11-12'), { name: '라마바', core: '한줄', detail: '줄1\n줄2', basis: '직접' }), 'C9', Date.parse('2026-11-12T01:00:00Z'));
  sc.eq('㊱ 새 줄 — 새 칸에 이름으로 · 빈 칸은 비움', J([nr.row[H1.indexOf('핵심 한줄')], nr.row[H1.indexOf('상세 기록')], nr.row[H1.indexOf('정보 성격')], nr.row[H1.indexOf('우선순위')], nr.lost]), ['한줄', '줄1\n줄2', '직접', '', []]);
  const nr0 = A.newRowValues(H0, m0, Object.assign(A.blankRecord('2026-11-12'), { name: '라마바', text: 'x' }), 'C9', 1);
  sc.eq('㊱ 열 없는 시트에 새 칸 비워 적으면 잃는 것 없음 · 줄 길이 그대로', J([nr0.lost, nr0.row.length]), [[], 17]);
  const nr0b = A.newRowValues(H0, m0, Object.assign(A.blankRecord('2026-11-12'), { name: '라마바', text: 'x', core: '한줄' }), 'C9', 1);
  sc.eq('㊱ 열 없는 시트에 새 칸을 적으면 잃은 칸으로 알린다(조용히 버리지 않음)', J(nr0b.lost), ['@핵심 한줄']);
  sc.eq('㊱ 핵심 한줄 · 상세 기록만 있어도 저장할 수 있다', J([A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '가', core: '한줄' })), A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '가', detail: '길게' }))]), [[], []]);
  const big = 'ㄱ'.repeat(A.CELL_MAX + 1);
  sc.eq('㊱ 상세 기록 5만 자 넘으면 저장 전에 막는다', A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '가', detail: big })).some(x => /상세 기록이 너무 깁니다/.test(x)), true);
  sc.eq('㊱ 딱 5만 자는 된다', A.validateRecord(Object.assign(A.blankRecord('2026-11-12'), { name: '가', detail: 'ㄱ'.repeat(A.CELL_MAX) })), []);

  // 다음 질문 — 입력 칸(줄바꿈) ↔ 탭 항목
  const old = [{ t: '수술 날짜는 정해졌나요?', done: true }, { t: '가족은 어떠세요?', done: false }];
  const qm = A.qnMerge(old, '1. 수술 날짜는 정해졌나요?\n2. 새 질문\n');
  sc.eq('㊱ 다음 질문 — 줄마다 하나 · 번호 떼기 · 물어봄 표시는 같은 질문이면 이어받음', J(qm), [{ t: '수술 날짜는 정해졌나요?', done: true }, { t: '새 질문', done: false }]);
  sc.eq('㊱ 다음 질문 → 입력 칸 글', A.qnText(old), '수술 날짜는 정해졌나요?\n가족은 어떠세요?');
  sc.eq('㊱ 다음 질문 탭 칸 글은 예전 꼴 그대로', A.qnEncode(qm), '[x] 수술 날짜는 정해졌나요?\n[ ] 새 질문');

  // 시험 시트 — 이 기기에만
  const raw = { sheet: { id: 'LIVE', name: '운영' }, form: { id: 'F', name: '폼' }, responder: 'https://f', cutoff: '2025-01-01', at: 5, trial: { sheet: { id: 'TEST', name: '사본' } }, lmode: 'brief' };
  const vw = A.cfgView(raw);
  sc.eq('㊱ 시험 시트 — 보이는 시트는 사본 · 폼은 없음(선택지 맞춤 안 돎) · 운영 값은 따로 들고 있음', J([vw.sheet.id, vw.form, vw.responder, vw.trialOn, vw.live.sheet.id, vw.cutoff, vw.lmode]), ['TEST', null, '', true, 'LIVE', '2025-01-01', 'brief']);
  sc.eq('㊱ 시험 시트는 계정에 안 올린다 — 올리는 값은 운영 시트 그대로', J(A.pickCfg(raw)), { sheet: { id: 'LIVE', name: '운영' }, form: { id: 'F', name: '폼' }, responder: 'https://f', cutoff: '2025-01-01', at: 5 });
  sc.eq('㊱ 다른 기기에서 계정 설정이 내려와도 이 기기 시험 시트는 그대로', J(A.mergeCfg(raw, { sheet: { id: 'LIVE2', name: '운영2' }, at: 9 }, 10).local.trial), { sheet: { id: 'TEST', name: '사본' } });
  sc.eq('㊱ 시험이 없으면 예전과 같다', J(A.cfgView({ sheet: { id: 'LIVE' }, form: { id: 'F' } })), { sheet: { id: 'LIVE' }, form: { id: 'F' } });
  sc.eq('㊱ 시험 시트 id 가 비면 시험 아님', A.cfgView({ sheet: { id: 'LIVE' }, trial: { sheet: { id: '' } } }).sheet.id, 'LIVE');

  // 이름 후보 — 심방 + 기도노트 + 셀
  const people = { '가나다': { roles: ['셀원'], last: '2026-11-01' }, '라 마바': { roles: [], last: '2026-10-01' }, '(이름 없음)': { roles: [] } };
  const cands = A.nameCands(people, ['라마바', '사아자', '가나다 셀'], [{ name: '하늘셀', leaders: ['차카타'], members: ['사아자', '파하'] }]);
  sc.eq('㊱ 이름 후보 — 셋을 띄어쓰기 무시로 하나로 · 심방 기록 꼴 먼저 · 어디서 왔는지 · 셀 표시는 뺌', J(cands.map(c => [c.name, c.src, c.cell])),
    [['가나다', ['심방'], ''], ['라 마바', ['심방', '기도'], ''], ['사아자', ['기도', '셀'], '하늘셀'], ['차카타', ['셀'], '하늘셀'], ['파하', ['셀'], '하늘셀']]);
  sc.eq('㊱ 심방 기록 성도의 구분 · 최근 날은 그대로', J([cands[0].roles, cands[0].last]), [['셀원'], '2026-11-01']);
}

// ㊲ 1112-N 2·3·4 — 붙여넣어 채우기 (이름 · 내용은 지어낸 것. 실제 샘플은 저장소에 넣지 않는다)
{
  const J = x => JSON.parse(JSON.stringify(x));
  const act = (text, authority, kind, extra) => Object.assign({ text, authority, owner: null, due_date: null, priority: '일반', kind, target_person: null }, extra || {});
  const rec = (name, extra) => Object.assign({ person_name: name, person_confirmed: true, speaker_label: null, category: null, contact_method: '전화', depth: '중간', summary_line: name + ' 핵심', brief_note: name + ' 짧은 메모',
    detailed_note_markdown: '### 경과\n' + name + ' 자세히', priority: '일반', long_term_watch: '', information_basis: '직접', tags: [], next_questions: [], actions: [] }, extra || {});
  const P1 = { schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: 'f_test_call', source_url: null, title: '11/12 가미정 통화', recorded_at: '2026-11-12T16:18:46+09:00', duration_ms: 220340 },
    event: { kind: 'call', date: '2026-11-12', title: '가미정 — 섬김 이야기', group_summary: '', details_markdown: '', location: null },
    records: [rec('가미정', { category: '부산', summary_line: '봉사 오해가 배움으로 이어졌다는 소식.', information_basis: '전언', tags: ['관계', '교회', '사역'], next_questions: ['마음이 어떻게 정리되었나?', '안내 방식을 보완할 수 있나?'],
      actions: [act('가미정 성도에게 감사 인사, 짧게', 'AI 제안', '연락', { owner: '목회자', target_person: '가미정' }), act('다음 봉사 안내 보완', 'AI 제안', '기타')] })],
    unknown_speakers: [], mentioned_people: ['윤정(이 통화에서 성씨 미확인)', '형만(이 통화에서 성씨 미확인)'], import_notes: '전언만' };
  const P2 = { schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: 'f_test_cell', source_url: null, title: '11-11 셀 모임', recorded_at: null, duration_ms: null },
    event: { kind: 'group', date: '2026-11-11', title: '셀모임 — 첫사랑', group_summary: '기도 · 말씀 생활 나눔', details_markdown: '### 공동체 권면\n예배 · 기도', location: null },
    records: [rec('나호근', { contact_method: '셀모임', depth: '깊음', priority: '장기관찰', actions: [act('개인 예배 회복 경청', 'AI 제안', '중보')] }),
      rec('다종만', { contact_method: '셀모임', priority: '장기관찰', actions: [act('새벽기도 시도 확인', 'AI 제안', '연락')] }),
      rec('라요한', { contact_method: '셀모임', priority: '장기관찰', actions: [act('라요한 성도가 연주할 쉬운 코드 찬양곡 찾아주기', '실제 약속', '연락', { owner: '목회자' })] })],
    unknown_speakers: ['화자3: 말씀 읽기를 시도하겠다는 발언자. 실명 미확인.'], mentioned_people: [] };

  // 규격 검사
  sc.eq('㊲ 규격 — 두 샘플 꼴은 통과', [A.pkValidate(P1), A.pkValidate(P2)], [[], []]);
  const bad = J(P1); bad.records[0].priority = '급함'; bad.event.date = '2026-02-30'; bad.extra = 1; delete bad.records[0].brief_note; bad.records[0].actions[0].due_date = '내일';
  sc.eq('㊲ 규격 — 틀린 값 · 없는 날 · 모르는 칸 · 빠진 칸 · 기한 꼴을 모두 알린다(어디가 왜)', A.pkValidate(bad), [
    "(맨 바깥) — 모르는 칸 'extra' (규격에 없음)", 'event.date — 날짜(2026-11-12 꼴)여야 합니다', "records[0] — 'brief_note' 칸이 없습니다",
    'records[0].priority — "급함" 는 허용 값(긴급 · 이번주 · 장기관찰 · 일반)이 아닙니다', 'records[0].actions[0].due_date — 날짜(2026-11-12 꼴) 또는 null']);
  sc.eq('㊲ 규격 — 버전 · 기록 없음', A.pkValidate(Object.assign(J(P1), { schema_version: 'hb-care.v2', records: [] })), ['schema_version — "hb-care.v2" — \'hb-care.v1\' 이어야 합니다', 'records — 기록이 하나 이상 든 목록이어야 합니다']);
  sc.eq('㊲ 규격 — 구분은 null · 글 · 글 목록 · 태그는 겹치면 안 됨', A.pkValidate(Object.assign(J(P1), { records: [rec('가', { category: ['셀원', '부산'], tags: ['교회', '교회'] })] })), ['records[0].tags — 같은 값이 두 번 있습니다']);
  // 읽기
  const txt = JSON.stringify(P1, null, 2);
  sc.eq('㊲ 읽기 — 그냥 JSON · ```json 울타리 · 앞뒤 말이 붙은 것 모두 JSON 으로', [A.pkParse(txt).kind, A.pkParse('```json\n' + txt + '\n```').ok, A.pkParse('정리했습니다:\n' + txt + '\n끝').ok], ['json', true, true]);
  sc.eq('㊲ 읽기 — 깨진 JSON 은 오류 · 빈 글', [A.pkParse('{"schema_version": "hb-care.v1",').errs[0].startsWith('JSON 을 읽지 못했습니다'), A.pkParse('  ').errs], [true, ['붙여 넣은 글이 비어 있습니다']]);
  sc.eq('㊲ 읽기 — 알아볼 것이 없는 글', A.pkParse('그냥 아무 메모입니다.\n둘째 줄').ok, false);

  // Markdown — 제목 · 굵은 이름표 · '이름표: 값'
  const MD = ['# 11/12 가미정 통화 정리', '', '성도: 가미정 성도', '날짜: 2026년 11월 12일', '**방식**: 전화', '대화 깊이: 중간', '', '## 핵심 한줄', '봉사 오해가 배움으로.', '', '## 내용', '처음 맡은 봉사 이야기.', '요약: 이 줄은 내용 칸 안의 글', '',
    '## 상세 기록', '### 경과', '준비량이 전달되지 않음.', '- 동환 : 다른 사람 이야기', '', '### 목양 판단', '**전언.**', '', '우선순위: 장기 관찰', '정보 성격: 전해 들음', '', '## 장기 관찰', '소통 · 역할 안내', '',
    '## 다음 질문', '1. 마음은 정리되었나?', '2. 안내를 보완할까?', '', '## 실제 약속', '- [연락] 찬양곡 찾아 보내기 (기한 2026-11-20)', '', '## AI 제안', '- 감사 인사하기', '- 연결: 봉사팀장과 이야기',
    '', '태그: #관계 #교회, 사역', '언급된 사람: 윤정, 형만', '원본ID: f_md_1'].join('\n');
  const pm = A.pkParse(MD), r0 = pm.packet.records[0];
  sc.eq('㊲ Markdown — 기록 하나 · 성도(호칭 그대로 둠 — 연결에서 뗀다) · 날짜 · 방식 · 깊이', [pm.kind, pm.packet.records.length, r0.person_name, pm.packet.event.date, r0.contact_method, r0.depth], ['md', 1, '가미정 성도', '2026-11-12', '전화', '중간']);
  sc.eq('㊲ Markdown — 긴 글 칸 안의 \'요약:\' · 소제목 · \'이름 : 글\' 은 그 칸 글로 둔다', [r0.brief_note, r0.detailed_note_markdown], ['처음 맡은 봉사 이야기.\n요약: 이 줄은 내용 칸 안의 글', '### 경과\n준비량이 전달되지 않음.\n- 동환 : 다른 사람 이야기\n\n### 목양 판단\n**전언.**']);
  sc.eq('㊲ Markdown — 우선순위 \'장기 관찰\' → 장기관찰 · \'전해 들음\' → 전언 · 장기 관찰 · 다음 질문 목록', [r0.priority, r0.information_basis, r0.long_term_watch, r0.next_questions], ['장기관찰', '전언', '소통 · 역할 안내', ['마음은 정리되었나?', '안내를 보완할까?']]);
  sc.eq('㊲ Markdown — 할 일: 실제 약속([종류] · 기한) · AI 제안(종류: 글) · 그냥 글은 기타', J(r0.actions.map(a => [a.authority, a.kind, a.text, a.due_date])),
    [['실제 약속', '연락', '찬양곡 찾아 보내기', '2026-11-20'], ['AI 제안', '기타', '감사 인사하기', null], ['AI 제안', '연결', '봉사팀장과 이야기', null]]);
  sc.eq('㊲ Markdown — 태그(# · 쉼표 · 띄어쓰기) · 언급된 사람 · 원본ID · 제목 · 못 찾은 칸 없음', [r0.tags, pm.packet.mentioned_people, pm.packet.source.source_id, pm.packet.event.title, pm.missing], [['관계', '교회', '사역'], ['윤정', '형만'], 'f_md_1', '11/12 가미정 통화 정리', []]);
  const pm2 = A.mdToPacket('### 핵심 한줄: 짧은 통화\n내용: 안부만\n성도: 가\n우선순위: 아주 급함\n날짜: 11/12');
  sc.eq('㊲ Markdown — 못 찾은 칸은 비워 두고 알린다(연도 없는 날짜 · 모르는 우선순위 값 · 방식) — 추측하지 않는다', [pm2.packet.event.date, pm2.packet.records[0].priority, J(pm2.missing)],
    ['', '', [{ rec: 0, k: '방식' }, { rec: 0, k: '우선순위' }, { rec: -1, k: '날짜(연도까지 적힌 날짜가 아님: 11/12)' }]]);
  const pm3 = A.mdToPacket('# 셀모임\n날짜: 2026-11-11\n## 공통 핵심\n함께 나눔\n## 미확인 화자\n- 화자3: 누군지 모름\n\n## 성도: 나호근\n핵심 한줄: 첫사랑\n내용: 회상\n방식: 셀모임\n## 성도: 다종만\n핵심 한줄: 아침 기도\n내용: 3분 기도\n방식: 셀모임');
  sc.eq('㊲ Markdown — 성도마다 새 기록 · 모임 공통 · 미확인 화자 → 모임', [pm3.packet.records.map(r => [r.person_name, r.summary_line, r.brief_note]), pm3.packet.event.kind, pm3.packet.event.group_summary, pm3.packet.unknown_speakers],
    [[['나호근', '첫사랑', '회상'], ['다종만', '아침 기도', '3분 기도']], 'group', '함께 나눔', ['화자3: 누군지 모름']]);
  sc.eq('㊲ 날짜 꼴', [A.pkDate('2026-11-12'), A.pkDate('2026.11.2'), A.pkDate('2026년 11월 12일 (목)'), A.pkDate('11/12'), A.pkDate('2026-02-30')], ['2026-11-12', '2026-11-02', '2026-11-12', '', '']);

  // 초안
  const d1 = A.pkDraft(P1, 'json'), d2 = A.pkDraft(P2, 'json'), f1 = d1.recs[0].form;
  sc.eq('㊲ 초안 — 통화는 모임 없음 · 칸 채움(핵심 한줄 · 내용 · 상세 · 우선순위 · 정보 성격 · 구분 · 태그 · 다음 질문)', [d1.meet, f1.name, f1.ymd, f1.core, f1.text, f1.detail, f1.prio, f1.basis, f1.roles, f1.tags, f1.qn],
    [false, '가미정', '2026-11-12', '봉사 오해가 배움으로 이어졌다는 소식.', '가미정 짧은 메모', '### 경과\n가미정 자세히', '일반', '전언', ['부산'], ['관계', '교회', '사역'], '마음이 어떻게 정리되었나?\n안내 방식을 보완할 수 있나?']);
  sc.eq('㊲ 초안 — AI 제안은 체크 안 됨 · 실제 약속은 체크됨', [d1.recs[0].acts.map(a => a.on), d2.recs[2].acts.map(a => a.on)], [[false, false], [true]]);
  sc.eq('㊲ 초안 — 셀모임은 모임 하나 · 미확인 화자는 모임에만', [d2.meet, d2.recs.length, d2.unknown, d2.recs.map(r => r.form.name)], [true, 3, ['화자3: 말씀 읽기를 시도하겠다는 발언자. 실명 미확인.'], ['나호근', '다종만', '라요한']]);

  // 속성 대조
  const known = { '구분': ['셀원', '부산'], '전화 / 만남': ['전화', '식사'], '태그': ['관계', '교회', '신앙'], '액션': ['중보', '연결', '보고', '연락'] };
  const is1 = A.pkAttrIssues(d1, known), is2 = A.pkAttrIssues(d2, known);
  sc.eq('㊲ 속성 — 없는 값만 · 기록 번호와 함께 · 기타 할 일은 늘 됨', [J(is1.map(x => [x.attr, x.val, x.recs])), J(is2.map(x => [x.attr, x.val, x.recs]))], [[['태그', '사역', [0]]], [['전화 / 만남', '셀모임', [0, 1, 2]]]]);
  const d1b = A.pkDraft(P1, 'json'), is1b = A.pkAttrIssues(d1b, Object.assign({}, known, { '액션': ['중보'] }));
  is1b.forEach(x => { if (x.val === '사역') { x.mode = 'map'; x.to = '교회'; } if (x.val === '연락') x.mode = 'drop'; });
  A.pkApplyAttrs(d1b, is1b);
  sc.eq('㊲ 속성 — 기존 값으로 바꿈(겹치면 하나로) · 할 일 종류 버림 → 기타', [d1b.recs[0].form.tags, d1b.recs[0].acts.map(a => a.kind)], [['관계', '교회'], ['기타', '기타']]);
  const d2b = A.pkDraft(P2, 'json'), is2b = A.pkAttrIssues(d2b, known); is2b[0].mode = 'add'; A.pkApplyAttrs(d2b, is2b);
  sc.eq('㊲ 속성 — 새 선택지로 더하기는 값 그대로', d2b.recs.map(r => r.form.method), ['셀모임', '셀모임', '셀모임']);

  // 성도 연결
  const C = A.nameCands({ '나호근': { roles: ['셀원'], last: '2026-11-08' }, '김윤정': { roles: [], last: '' } }, ['박윤정', '윤정민'], [], ['차형만']);
  sc.eq('㊲ 연결 — 성까지 같으면 하나 · 이름만이면 끝이 같은 분들 · 호칭 · 괄호 떼기', J([A.pkLinkCands('나호근 성도', C), A.pkLinkCands('윤정(이 통화에서 성씨 미확인)', C), A.pkLinkCands('형만', C), A.pkLinkCands('가미정', C)]),
    [{ name: '나호근', exact: '나호근', list: ['나호근'] }, { name: '윤정', exact: null, list: ['김윤정', '박윤정'] }, { name: '형만', exact: null, list: ['차형만'] }, { name: '가미정', exact: null, list: [] }]);
  const rows1 = A.pkLinkRows(d1, C);
  sc.eq('㊲ 확인 창 — 기록 성도(명단에 없음 → 새 성도) · 언급(후보 여럿 → 고르기 전 · 후보 하나 → 저절로)', J(rows1.map(x => [x.role, x.raw, x.list, x.pick, x.mode])),
    [['rec', '가미정', [], '가미정', 'new'], ['men', '윤정(이 통화에서 성씨 미확인)', ['김윤정', '박윤정'], '', ''], ['men', '형만(이 통화에서 성씨 미확인)', ['차형만'], '차형만', 'auto']]);
  sc.eq('㊲ 확인 창 — 후보 여럿을 안 고르면 남은 줄', A.pkLinkOpen(rows1).map(x => x.id), ['m0']);
  rows1[1].mode = 'ok'; rows1[1].pick = '박윤정';
  const res1 = A.pkResolve(d1, rows1);
  sc.eq('㊲ 확인 끝 — 기록은 가미정 하나 · 언급은 고른 분들(그 분 기록은 안 만듦)', J(res1.map(x => x && [x.person, x.mentions])), [['가미정', ['박윤정', '차형만']]]);
  sc.eq('㊲ 새 성도 목록', A.pkNewPeople(rows1), ['가미정']);
  const rows2 = A.pkLinkRows(d2, C);
  sc.eq('㊲ 셀모임 — 있는 분은 저절로 · 없는 분은 새 성도', J(rows2.map(x => [x.raw, x.mode])), [['나호근', 'auto'], ['다종만', 'new'], ['라요한', 'new']]);
  rows2[1].mode = 'skip';
  sc.eq('㊲ 기록 성도를 취소하면 그 기록은 저장하지 않는다', A.pkResolve(d2, rows2).map(x => x && x.person), ['나호근', null, '라요한']);
  const dB = A.pkDraft(Object.assign(J(P1), { mentioned_people: [], records: [rec('가미정', { brief_note: '나호근 집사와 차 형만 이야기' })] }), 'json');
  sc.eq('㊲ 본문에서 찾은 이름(세 글자 이상 · 띄어쓰기 무시)도 확인 창에', J(A.pkLinkRows(dB, C).filter(x => x.role === 'body').map(x => [x.pick, x.mode, x.rec])), [['나호근', 'auto', 0], ['차형만', 'auto', 0]]);

  // 해시 · 중복
  const h = A.pkHash('2026-11-12', '가미정', A.pkNormText('봉사 오해가, 배움으로!|### 경과'));
  sc.eq('㊲ 해시 — 띄어쓰기 · 기호가 달라도 같고 · 사람 · 날짜 · 글이 다르면 다르다', [h === A.pkHash('2026-11-12', '가 미정', A.pkNormText('봉사오해가 배움으로|경과')), h === A.pkHash('2026-11-12', '나미정', A.pkNormText('봉사 오해가, 배움으로!|### 경과')), h === A.pkHash('2026-11-13', '가미정', A.pkNormText('봉사 오해가, 배움으로!|### 경과'))], [true, false, false]);
  const V = [{ key: 'C1', id: 'C1', who: ['나호근'], srcId: 'f_test_cell', meetId: 'G1', hash: 'hx' }, { key: 'C2', id: 'C2', who: ['가미정'], srcId: '', meetId: '', hash: A.pkResolve(d1, rows1)[0].hash }, { key: 'C3', id: 'C3', who: ['라요한'], srcId: 'f_test_cell', meetId: '', hash: '' }];
  sc.eq('㊲ 중복 — 원본ID + 성도 + 모임(개인 기록이면 모임 아닌 것) · 원본ID 없으면 같은 내용', J(A.pkDups(d2, A.pkResolve(d2, A.pkLinkRows(d2, C)), V).map(x => x && x.why)), ['원본ID', null, null]);
  const d1n = A.pkDraft(Object.assign(J(P1), { source: Object.assign({}, P1.source, { source_id: null }) }), 'json');
  sc.eq('㊲ 중복 — 원본ID 를 지운 같은 내용은 해시로 잡는다', J(A.pkDups(d1n, A.pkResolve(d1n, rows1), V).map(x => x && [x.why, x.id])), [['같은 내용', 'C2']]);
  const MT = A.parseMeetTab([['모임ID', '날짜', '제목', '유형', '공통 핵심', '공통 상세 기록', '원본ID', '원본 링크', '미확인 화자', '만든 시각'], ['G1', '2026-11-11', '셀모임 — 첫사랑', '모임', '기도 · 말씀 생활 나눔', '### 공동체 권면\n예배 · 기도', 'f_test_cell', '', '화자3', '']]);
  sc.eq('㊲ 모임 중복 — 원본ID · (원본ID 없으면) 날짜 + 같은 글', [!!A.pkMeetDup(d2, MT), !!A.pkMeetDup(Object.assign({}, d2, { src: { id: '' } }), MT), !!A.pkMeetDup(Object.assign({}, d2, { src: { id: 'other' } }), MT)], [true, true, false]);

  // 저장할 것
  const acts = [{ text: '감사 인사, 짧게', auth: 'AI 제안', kind: '연락', on: true, prio: '이번주' }, { text: '찬양곡 찾아주기', auth: '실제 약속', kind: '연락', on: true, due: '2026-11-20', prio: '일반' },
    { text: '안내 보완, 다음에', auth: 'AI 제안', kind: '기타', on: true, prio: '일반' }, { text: '팀장과 이야기', auth: 'AI 제안', kind: '연결', on: false, owner: '목회자', prio: '일반' }];
  sc.eq('㊲ 할 일 줄 — 같은 종류는 한 줄(세부 줄바꿈) · 기타는 글마다(쉼표는 ·) · 근거 · 기한 · 우선순위 표시', J(A.pkActRows(acts)),
    [{ t: '연락', x: '', det: '(이번주) 감사 인사, 짧게\n찬양곡 찾아주기', due: '2026-11-20', why: 'AI 제안 채택 · 실제 약속' }, { t: '기타', x: '안내 보완 · 다음에', det: '안내 보완, 다음에', due: '', why: 'AI 제안 채택' }]);
  sc.eq('㊲ 체크 안 한 제안 → 상세 기록 끝 글', A.pkUnadopted(acts), '### AI 제안(미채택)\n- 팀장과 이야기 · 연결 · 담당 목회자');
  const res = A.pkResolve(d1, rows1)[0], out = A.pkRecordOut(d1, d1.recs[0], res, '', Date.parse('2026-11-12T08:00:00Z'));
  sc.eq('㊲ 기록 하나 — AI 제안 둘 안 체크 → 할 일 없음 · 상세 기록 끝에 글로만 · 출처 AI · 확인 시각 · 원본ID · 해시 · 언급', [out.acts, out.form.acts, out.form.detail.split('\n').slice(-3), out.extra['@출처'], !!out.extra['@확인'], out.extra['@원본ID'], out.extra['@가져오기 해시'] === res.hash, out.extra['@언급된 성도'], out.extra['@모임ID']],
    [[], [], ['### AI 제안(미채택)', '- 가미정 성도에게 감사 인사, 짧게 · 연락 · 담당 목회자', '- 다음 봉사 안내 보완'], 'AI', true, 'f_test_call', true, '박윤정, 차형만', '']);
  sc.eq('㊲ 다음 질문은 탭 항목으로', J(out.qn), [{ t: '마음이 어떻게 정리되었나?', done: false }, { t: '안내 방식을 보완할 수 있나?', done: false }]);
  const r2 = A.pkResolve(d2, A.pkLinkRows(d2, C)), o2 = A.pkRecordOut(d2, d2.recs[2], r2[2], 'G9', 0);
  sc.eq('㊲ 셀모임 라요한 — 실제 약속은 할 일(연락)로 · 모임ID', [o2.form.acts, J(o2.acts), o2.extra['@모임ID']], [['연락'], [{ t: '연락', x: '', det: '라요한 성도가 연주할 쉬운 코드 찬양곡 찾아주기', due: '', why: '실제 약속' }], 'G9']);
  const HD = ['Timestamp', '심방 날짜', '성도 이름', '구분', '전화 / 만남', '내용', '태그', '액션', '대화 깊이', '기록ID', '출처', '심방일', '수정', '확인', '보관'].concat(A.NX_COLS);
  const ir = A.importRowValues(HD, A.headerMap(HD).map, o2.form, 'C77', Date.parse('2026-11-12T08:00:00Z'), o2.extra), at = n => ir.row[HD.indexOf(n)];
  sc.eq('㊲ 새 줄 — 출처 AI · 확인 · 모임ID · 원본ID · 해시 · 핵심 한줄 · 내용(짧은 메모) · 액션 칸', [at('출처'), !!at('확인'), at('모임ID'), at('원본ID'), !!at('가져오기 해시'), at('핵심 한줄'), at('내용'), at('액션'), at('우선순위'), at('기록ID'), ir.lost],
    ['AI', true, 'G9', 'f_test_cell', true, '라요한 핵심', '라요한 짧은 메모', '연락', '장기관찰', 'C77', []]);
  sc.eq('㊲ 모임 줄 — 머리글 차례대로 · 미확인 화자', A.pkMeetRow(null, d2, 'G9', 0).slice(0, 9), ['G9', '2026-11-11', '셀모임 — 첫사랑', '모임', '기도 · 말씀 생활 나눔', '### 공동체 권면\n예배 · 기도', 'f_test_cell', '', '화자3: 말씀 읽기를 시도하겠다는 발언자. 실명 미확인.']);
  const AH = A.ACT_TAB_HEAD.concat(['실행근거']), arow = A.pkActTabRow(AH, o2.acts[0], 'C77', '라요한', 'A1');
  sc.eq('㊲ 액션 탭 줄 — 세부 · 상태 할 일 · 실행근거(K)', arow, ['A1', 'C77', '라요한', '연락', '라요한 성도가 연주할 쉬운 코드 찬양곡 찾아주기', '', '', '할 일', '', '', '실제 약속']);
  const st = A.parseActionTab([AH, arow]), vv = { id: 'C77', actions: [{ t: '연락', x: '', k: 'k4' }] }; A.attachExtras({ visits: [vv] }, st, {});
  sc.eq('㊲ 기존 체크 화면이 그대로 이어받는다(열쇠 기록ID|종류|) · 세부 · 근거', [Object.keys(st), vv.actions[0].det, vv.actions[0].why, vv.actions[0].done], [['C77|연락|'], '라요한 성도가 연주할 쉬운 코드 찬양곡 찾아주기', '실제 약속', false]);
  sc.eq('㊲ 성도 탭 → 이름 · 이름 후보에 성도 탭', [A.parseRosterTab([['성도ID', '이름'], ['P1', '가미정'], ['P2', ' 가미정 '], ['P3', '']]), A.nameCands({}, [], [], ['가미정'])[0].src], [['가미정'], ['성도']]);
}

// ㊳ 1112-N 5 AI 입력대기함 (이름 · 내용은 지어낸 것)
{
  const J = x => JSON.parse(JSON.stringify(x));
  const pk = (name, src) => JSON.stringify({ schema_version: 'hb-care.v1', source: { kind: 'plaud', source_id: src, source_url: null, title: name + ' 통화', recorded_at: null, duration_ms: null },
    event: { kind: 'call', date: '2026-11-12', title: name, group_summary: '', details_markdown: '', location: null },
    records: [{ person_name: name + ' 성도', person_confirmed: true, contact_method: '전화', depth: '얕음', summary_line: '안부', brief_note: '안부 통화', detailed_note_markdown: '', priority: '일반', long_term_watch: '', information_basis: '직접', tags: [], next_questions: [], actions: [] }], unknown_speakers: [] });
  const H = ['접수ID', '접수시각', '스키마버전', '패킷JSON', '상태', '오류', '원본ID', '생성된 기록ID', '처리시각'];
  const bad = JSON.parse(pk('나쁨', 'f3')); bad.records[0].priority = '급함';
  const V = [H, ['Q1', '2026-11-12 10:00', 'hb-care.v1', pk('가나다', 'f1'), '대기', '', 'f1', '', ''], ['', '2026-11-12 10:05', 'hb-care.v1', '```json\n' + pk('라마바', 'f2') + '\n```', '대기', '', '', '', ''],
    ['Q3', '', '', JSON.stringify(bad), '대기', '', 'f3', '', ''], ['Q4', '', '', pk('사아자', 'f4'), '완료', '', 'f4', 'C1', '2026-11-11 09:00'], ['Q5', '', '', '그냥 글입니다', '대기', '', '', '', ''], [], ['Q6', '', '', pk('차카타', 'f6'), '자동', '', '', '', '']];
  const items = A.parseInbox(V);
  sc.eq('㊳ 대기함 읽기 — 빈 줄은 건너뜀 · 상태 그대로', J(items.map(x => [x.row, x.id, x.st])), [[2, 'Q1', '대기'], [3, '', '대기'], [4, 'Q3', '대기'], [5, 'Q4', '완료'], [6, 'Q5', '대기'], [8, 'Q6', '자동']]);
  const ck = A.inboxCheck(items, Date.parse('2026-11-12T03:00:00Z'));
  sc.eq('㊳ 대기 중 맞는 것만 기다림 목록(울타리 친 JSON 도) · 제목 · 이름(호칭 뗌) · 원본ID', J(ck.waiting.map(x => [x.row, x.title, x.names, x.srcId, !!x.id])), [[2, '가나다 통화', ['가나다'], 'f1', true], [3, '라마바 통화', ['라마바'], 'f2', true]]);
  sc.eq('㊳ 고칠 것 — 접수ID 붙이기 · 규격 오류는 오류 + 사유 + 처리시각 · 완료 · 다른 상태(자동)는 손대지 않음', J(ck.patches.map(p => [p.row, Object.keys(p.cells), p.cells['상태'] || ''])),
    [[3, ['접수ID'], ''], [4, ['상태', '오류', '처리시각'], '오류'], [6, ['상태', '오류', '처리시각'], '오류']]);
  sc.eq('㊳ 오류 사유 — 어디가 왜', [ck.patches[1].cells['오류'], ck.patches[2].cells['오류']], ['records[0].priority — "급함" 는 허용 값(긴급 · 이번주 · 장기관찰 · 일반)이 아닙니다', '패킷JSON 칸이 JSON 이 아닙니다']);
  sc.eq('㊳ 붙인 접수ID 가 기다림 목록에도', ck.waiting[1].id, ck.patches[0].id);
  sc.eq('㊳ 고치는 줄 상한', A.inboxCheck(items, 0, 1).patches.length, 1);
  sc.eq('㊳ 줄 다시 찾기 — 접수ID 로 · 앞줄이 지워져 밀려도', A.inboxFind([H, V[2], V[1]], items[0]).row, 3);
  sc.eq('㊳ 접수ID 가 없던 줄은 같은 패킷 글로 · 같은 접수ID 가 둘이면 쓰지 않음', [A.inboxFind(V, items[1]).row, A.inboxFind([H, V[1], V[1]], items[0])], [3, null]);
  sc.eq('㊳ 완료 칸 — 상태 · 생성된 기록ID · 처리시각 · 오류 비움', A.inboxDoneCells('완료', ['C1', 'C2'], Date.parse('2026-11-12T03:00:00Z')), { '상태': '완료', '생성된 기록ID': 'C1, C2', '처리시각': '2026-11-12 12:00', '오류': '' });
  const g = A.chatgptGuide('SHEET123');
  sc.eq('㊳ ChatGPT 지시문 — 규격 · 탭 이름 · 상태 · 지금 시트 주소', [g.includes('hb-care.v1'), g.includes("'AI 입력대기' 탭"), g.includes('| 대기 |'), g.endsWith('https://docs.google.com/spreadsheets/d/SHEET123/edit')], [true, true, true, true]);
}

// ㊴ 1112-N 6 화면 정리
{
  const J = x => JSON.parse(JSON.stringify(x));
  sc.eq('㊴ Markdown — 제목 · 목록 · 번호 목록 · 굵게 · 문단', A.mdSafe('### 경과\n- 하나\n- **둘**\n\n1. 첫째\n2. 둘째\n그냥 글\n이어진 줄'),
    '<div class="md-h">경과</div><ul><li>하나</li><li><b>둘</b></li></ul><ol><li>첫째</li><li>둘째</li></ol><p>그냥 글<br>이어진 줄</p>');
  sc.eq('㊴ Markdown — HTML · 링크 · 속성은 글자로만(XSS 막기)', A.mdSafe('<img src=x onerror=alert(1)>\n[눌러](javascript:alert(1)) "따옴표" \'홑\'\n**<b>굵게</b>**'),
    '<p>&lt;img src=x onerror=alert(1)&gt;<br>[눌러](javascript:alert(1)) &quot;따옴표&quot; &#39;홑&#39;<br><b>&lt;b&gt;굵게&lt;/b&gt;</b></p>');
  sc.eq('㊴ Markdown — 빈 글', A.mdSafe(''), '');
  const V = [
    { key: 'a', id: 'C1', ymd: '2026-11-01', who: ['가나다'], core: '옛 핵심', longObs: '가정 돌봄', srcId: 'f1', meetId: 'G1' },
    { key: 'b', id: 'C2', ymd: '2026-11-10', who: ['가나다', '라마바'], core: '', longObs: '가정  돌봄', srcId: '' },
    { key: 'c', id: 'C3', ymd: '2026-11-08', who: ['가나다'], core: '최근 핵심', prio: '이번주', basis: '전언', longObs: '직장 스트레스', srcId: 'f2' },
    { key: 'd', id: 'C4', ymd: '2026-11-11', who: ['가나다'], core: '보관된 것', archived: true },
    { key: 'e', id: 'C5', ymd: '2026-11-11', who: ['라마바'], core: '남의 것' }];
  const QN = { C1: { items: [{ t: '수술은?', done: true }, { t: '가족은?', done: false }] }, C3: { items: [{ t: '직장은 어떠세요?', done: false }, { t: '가족은?', done: false }] } };
  const PL = [{ id: 'P1', name: '가나다', date: '2026-11-15', status: '예정', why: '1. 이사 날짜\n2. 직장은 어떠세요?' }, { id: 'P2', name: '가나다', date: '2026-11-01', status: '예정', why: '지난 계획' }, { id: 'P3', name: '라마바, 가나다', date: '2026-11-20', status: '취소됨', why: '취소' }];
  const ps = A.personSummary(V, QN, PL, '가나다', '2026-11-12', [{ id: 'G1', url: 'https://plaud.example/1' }]);
  sc.eq('㊴ 성도 요약 — 최근 핵심(핵심이 있는 가장 최근 · 보관 · 남의 것 빼고)', J(ps.core), { text: '최근 핵심', ymd: '2026-11-08', key: 'c', prio: '이번주', basis: '전언' });
  sc.eq('㊴ 성도 요약 — 장기 관찰(최근 차례 · 같은 글은 하나)', ps.obs.map(x => x.text), ['가정  돌봄', '직장 스트레스']);
  sc.eq('㊴ 성도 요약 — 다음 질문: 앞으로의 예정 계획 \'물어볼 것\' 먼저 · 기록의 안 물어본 것 · 겹침 하나', J(ps.qs.map(x => [x.t, x.from])), [['이사 날짜', '계획'], ['직장은 어떠세요?', '계획'], ['가족은?', '기록']]);
  sc.eq('㊴ 성도 요약 — 원본(모임 원본 링크)', J(ps.src.map(x => [x.id, x.url])), [['f2', ''], ['f1', 'https://plaud.example/1']]);
  sc.eq('㊴ 같은 날 예정 계획 — 이름 하나하나로 · 취소된 것 · 다른 날은 아님', [A.planForRecord(PL, '가나다', '2026-11-15').id, A.planForRecord(PL, '가나다', '2026-11-20'), A.planForRecord(PL, '라마바', '2026-11-15'), A.planForRecord([{ id: 'P9', name: '라마바, 가나다', date: '2026-11-11', status: '예정' }], '가 나다', '2026-11-11').id], ['P1', null, null, 'P9']);
}

sc.done();
