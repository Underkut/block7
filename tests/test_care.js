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
this.A = { APP_VERSION, CARE_KEY, APP_COLS, TABS, C0_MAX_ROWS, headerMap, findResponsesTab, colLetter, planColumns, planTabs, serialYmd, tsYmd, visitYmd,
  splitMulti, splitOne, rowToVisit, formSummary, formVsSheet, optionsOf, canWriteC0, newId, testRowValues, verifyAfterForm, idPatches };`, ctx);
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
sc.eq('⑨ 이 기기 저장 이름이 다른 앱과 겹치지 않는다', ['b7v1', 'b7timer_v1', 'pray.v1', 'b7wallet'].includes(A.CARE_KEY), false);

sc.done();
