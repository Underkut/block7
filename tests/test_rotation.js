// 교역자 로테이션(rotation/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="rotation-core">)를 떼어 시험한다.
// 사람 이름은 지어낸 것이다 (공개 저장소). 날짜는 실제 달력.
//
// 지키는 것:
//  ① 한 주 = **주일~토**(HB 11/14). 주일 · 화 · 수 · 금이 그 주일 하나로 묶인다. 부산 방문(금토일)은 방문 주일 기준(visitSun)
//  ② 부산 금요예배(금1 · 금2 · 금3) = 그 달 첫째~셋째 금요일 — 시트 실제 표시와 맞춘다
//  ③ 다듬기: 모르는 예배 · 역할 · 날짜가 안 맞는 자리는 버린다 · 방문은 주일이 아니어도 된다(성탄 목 · 송구영신 수)
//  ④ 맞추기: 줄마다 나중에 고친 것이 이긴다 · 한쪽에만 있는 줄은 남는다(지우지 않는다) · 순서와 상관없이 같은 답
//  ⑤ 지우기 표지: 내용을 비우고 남는다 · 낡은 기기의 줄이 되살리지 못한다
//  ⑥ 계정 맞추기: 계정이 비면 기기 것을 올린다 · 같으면 안 올린다 · 빈 기기 + 계정 = 계정 그대로(빈 기기가 계정을 지우지 않음)
//  ⑦ 한 주 보기 · 같은 사람 여러 예배 묶기 · 지운 사람 표시
//  ⑨ 머무는 날 → 실제 날짜 · 부산에 있는 날
//  ⑩ 겹침 검사: 부산에 머무는 날의 판교 자리(주일 · 금요 · 수요) = 빨강, 맡지 않는 일 · 두 주 연속 · 숙소 미정 · 극동방송 동행 없음 = 노랑
//  ⑪ 자리 넣고 빼기: 비면 지우기 표지 · 같은 값이면 안 씀
//  ⑫ 예배마다 들어가는지(HB 11/14): 일을 맡아도 빼 둔 예배가 있다 · 예전 자료는 '모두'
//  ㉔ 가능 일정(R6c): 고르기 판 '가능 일정' · 자동 배열이 먼저 고려(부산 +60 · 분당 자리 먼저) · 두 주 연속은 못 넘음
//  ㉓ 함께 쓰기(R6): 들어올 이메일 · 교역자 칸 · 받아들이기(자기 것만 · 칸마다 나중 것)
//  ⑬ 낡은 앱과 함께: 새 앱은 b2 칸에만 쓰고 book · b2 를 합쳐 읽는다 · 같은 때면 긴 사본이 이긴다
//  ⑭ 시트 기록 가져오기: 이름 → 사람 · 이미 적은 칸은 그대로 · 지운 것 안 살아남 · 두 번 해도 같음 · 지우지 않음
//  ⑮ 화요예배(옛 기록) · 지난 주 노랑 안 깔기
//  ⑰ 자동 배열 제안(R4): 빈 칸만 · 지운 칸 · 잠근 칸 그대로 · 부산 오래 안 간 분 먼저 · 두 주 연속 피함 · 겹침 피함 · 헌금 두 사람 · 인도 둘 다르게
//  ⑱ 보기 틀(R4b) 읽기: 사람 × 주 · 내 일정 · 하루
//  ⑲ R5: 부재(빨강) · 고정 조건(노랑) · 자동 배열이 피함 · 챙길 것 · 지난 방문 복사 · 시트로 내보내기 · 사람 한눈에
//  ⑳ HB 3차(R5b): 금요 이름 · WN 광고(마지막 금요일만) · 설교 접기(빈 칸 무시) · 담임 · 초청 사람 · 글 → 사람 · 계정 이메일 · 월 달력 줄 · 금요 · 수요 표 날들
//  ㉒ 부산 입력 A안(R5b-C): 고르는 목록(숙소 · 교통편 · 특이사항 갈래) 기본값 · 더하기 · 순서 · 고치기(지난 기록도) · 합치기 · 지우기 · 맞추기 / 특이사항 / 박수 / 가져오기 3판
//  ㉕ 내 일정(R8b): 오늘 · 다음 차례 · 가까운 부산 · 그다음 · 횟수 / 한 줄이 한 주 / 부산 준비 / 내 화면 취향(첫 화면 · 이름 서식) · 책에 안 섞임 / 내 이름 자리
//  ㉖ 예약 읽기(R9): AI 답 다듬기 · 맞는 방문 · 초안 채우기(목록 이름 · 원화만 금액 · 취소 기한 · 환불 불가 · 취소됨) · 예약번호 저장 · 책은 안 고침
//  ㉗ 메일에서 찾기(R9b): 찾는 말 · 메일 글 다듬기(주소 · 전화 · 링크 지움, 날짜 · 예약번호 남김) · 나중 메일이 이김 · 지난 예약 빼기 · 넣을 자리 · 열쇠 서버(메일 열쇠 따로 · 읽기만)
//  ⑧ 저장 자리: rota/{uid} 한 장 · users · cellbook 는 안 건드림 · block7.my 로 열리면 sweeter.my 로 넘김
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'rotation', 'index.html'), 'utf8');
const m = HTML.match(/<script id="rotation-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('rotation-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Array, String, Date, Map, Set, isNaN };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, SVC, GRID, sunOf, busanFri, monthSundays, addMonths, svcDate, slotId, visitId, markId,
  normBook, mergeBook, sameBook, pickBook, isEmptyBook, put, drop, live, weekPlan, groupRole, whoText, stayState, slotLabel,
  stayPeriod, stayWhole, myAhead, myWeeks, tripChecks, normUi, homeTo, nameSpans, HOMES, dayGap, stayDates, busyOn, conflicts, conflictText, levelMap, pickNote, countRole, setSlot, weekVisits, defaultDays, canDo, pickDoc, importBook, personIdFor, svcShown, sortDays, dayChoices, weekLabel, propose, applyProposal, weekTags, myItems, dayItems, visitSun, weekFriName, weekStays, nearCls, busanOn, optList, optAdd, optMove, optEdit, optMerge, optId, ensureOpts, strayStays, autoNights, teamOf, normStaff, absorb, staffPatch, staffMerge, personByEmail, staffEdits, canOn, awayOn, pinOn, chores, copyVisit, sheetTSV, personStats, friName, isLastFri, preachFold, textToPerson, countTextFor, dayLines, weekdayRows, bookingPrompt, normBooking, parseBookings, bookingNights, bookingVisit, bookingSeen, bookingToDraft, bookingLine, normStay, MAIL_Q, htmlText, mailClean, mailPrompt, mailBookings, mailRows, mailSlot };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// ① 한 주
sc.eq('① 수요일(11/11)의 주는 11/8 주일에 시작', A.sunOf('2026-11-11'), '2026-11-08');
sc.eq('① 토요일(11/14)도 11/8 주', A.sunOf('2026-11-14'), '2026-11-08');
sc.eq('① 주일은 그 날 자신', A.sunOf('2026-11-15'), '2026-11-15');
sc.eq('① 월요일(11/16)은 11/15 주', A.sunOf('2026-11-16'), '2026-11-15');
sc.eq('① 부산 방문의 주일: 금(11/13) → 11/15 · 주일은 그 날', [A.visitSun('2026-11-13'), A.visitSun('2026-11-15')], ['2026-11-15', '2026-11-15']);
sc.eq('① 그 주 금요일의 부산 금요예배 이름 (11/15 주의 금요일 11/20 = 셋째)', A.weekFriName('2026-11-15'), 'ENCOUNTER');
sc.eq('① 그 주 금요 · 수요 날짜', [A.svcDate('2026-11-15', 'fri'), A.svcDate('2026-11-15', 'wed'), A.svcDate('2026-11-15', 'tue')], ['2026-11-20', '2026-11-18', '2026-11-17']);
sc.eq('① 2026년 11월 주일 다섯', A.monthSundays('2026-11'), ['2026-11-01', '2026-11-08', '2026-11-15', '2026-11-22', '2026-11-29']);
sc.eq('① 달 넘기기 (해 넘김 포함)', [A.addMonths('2026-12', 1), A.addMonths('2026-01', -1)], ['2027-01', '2025-12']);

// ② 시트 '로테이션 25-0412 세로' 의 금요 열과 맞춘다 (주일 → 금n, 빈칸은 0)
const sheet = { '2025-01-05': 1, '2025-01-12': 2, '2025-01-19': 3, '2025-01-26': 0, '2025-02-02': 0, '2025-02-09': 1, '2025-03-02': 0,
  '2025-03-30': 0, '2025-04-06': 1, '2025-06-01': 0, '2025-06-08': 1, '2025-11-02': 0, '2025-11-09': 1, '2025-11-30': 0,
  '2025-12-07': 1, '2025-12-21': 3, '2026-01-11': 2, '2026-01-18': 3, '2026-01-25': 0, '2026-03-08': 1, '2026-05-24': 0 };
sc.eq('② 금1 · 금2 · 금3 이 시트 21곳과 모두 같다', Object.keys(sheet).map(s => A.busanFri(s)), Object.values(sheet));

// ③ 다듬기
const raw = A.normBook({ at: 5, people: [{ id: 'p1', name: ' 가나다 ', roles: ['busan', 'preach', 'dance'], at: 1 }, { id: 'p2', name: '', at: 1 }, { name: 'id 없음' }],
  slots: [{ id: '2026-11-15|sun2|offer', who: ['p1', 'p1'], at: 1 }, { id: '2026-11-15|sun2|dance', at: 1 }, { id: '2026-11-15|wed|preach', at: 1 },
    { id: '2026-11-11|wed|preach', who: ['p1'], at: 1 }, { id: '2026-11-15|sun1|lead', at: 1 }],
  visits: [{ id: 'v|2026-11-15', who: ['p1'], days: '토일', stay: [{ kind: 'x', name: '호텔 A', status: '??' }], at: 1 }, { id: 'v|2026-12-31', days: '수목x', at: 1 }, { id: 'v|2026-13-01', at: 1 }, { id: 'x|2026-11-15', at: 1 }],
  marks: [{ id: 'm|2026-11-15', tags: ['성찬주', '성찬주', ''], at: 1 }] });
sc.eq('③ 이름 다듬기 · 모르는 역할 버림 · 이름 없는 사람 · id 없는 사람 버림', J(raw.people), [{ id: 'p1', at: 1, by: '', name: '가나다', roles: ['preach', 'busan'] }]);
sc.eq('③ 자리: 모르는 역할 · 수요일이 아닌 수요 자리 · 시트에 없는 칸(1부 예배인도) 버림, 같은 사람 두 번은 한 번', raw.slots.map(s => [s.id, s.who]), [['2026-11-11|wed|preach', ['p1']], ['2026-11-15|sun2|offer', ['p1']]]);
sc.eq('③ 방문: 없는 날짜 · 모르는 머리글은 버림 · 숙소 모르는 값은 기본값 · 수요일 방문도 된다', J(raw.visits.map(v => [v.id, v.stay])), [['v|2026-11-15', [{ kind: 'hotel', name: '호텔 A', status: '', cost: 0, nights: 0, for: '' }]], ['v|2026-12-31', []]]);
sc.eq('③ 머무는 날은 요일 글자만', raw.visits[1].days, '수목');
sc.eq('③ 교회 일정 표시: 같은 표시 한 번 · 빈 것 버림', raw.marks[0].tags, ['성찬주']);
sc.eq('③ 아무것도 아닌 것 → 빈 책', J(A.normBook(null)), { v: 1, at: 0, people: [], slots: [], visits: [], marks: [], opts: [] });

// ④ 맞추기
const base = A.normBook(null);
A.put(base, 'people', { id: 'pa', name: '가가', roles: ['busan'] }, 'u', 100);
A.put(base, 'slots', { id: '2026-11-15|sun1|offer', who: ['pa'] }, 'u', 100);
const phone = J(base), pc = J(base);
A.put(phone, 'people', { id: 'pa', name: '가가', roles: ['busan', 'preach'] }, 'u', 200);   // 폰: 역할 더함
A.put(pc, 'people', { id: 'pb', name: '나나', roles: [] }, 'u', 150);                      // PC: 사람 더함
A.put(pc, 'slots', { id: '2026-11-15|sun1|offer', who: ['pb'] }, 'u', 300);                // PC: 자리 바꿈 (더 나중)
A.put(phone, 'slots', { id: '2026-11-15|sun1|offer', who: ['pa'], txt: '' }, 'u', 250);
const m1 = A.mergeBook(phone, pc), m2 = A.mergeBook(pc, phone);
sc.eq('④ 두 기기가 다른 줄을 고치면 둘 다 남는다', m1.people.map(p => [p.id, p.roles]), [['pa', ['preach', 'busan']], ['pb', []]]);
sc.eq('④ 같은 줄은 나중에 고친 쪽이 이긴다', m1.slots[0].who, ['pb']);
sc.eq('④ 어느 순서로 맞춰도 같은 답', JSON.stringify(m1), JSON.stringify(m2));
const tie1 = A.normBook({ people: [{ id: 'x', name: '가', at: 9 }] }), tie2 = A.normBook({ people: [{ id: 'x', name: '나', at: 9 }] });
sc.eq('④ 고친 때가 같아도 두 기기가 같은 답', JSON.stringify(A.mergeBook(tie1, tie2)), JSON.stringify(A.mergeBook(tie2, tie1)));
sc.eq('④ 맞춘 책의 at 은 둘 중 큰 것', m1.at, 300);

// ⑤ 지우기 표지
const del = J(m1);
sc.eq('⑤ 지우기는 한 번만', [A.drop(del, 'people', 'pb', 'u', 400), A.drop(del, 'people', 'pb', 'u', 401)], [true, false]);
sc.eq('⑤ 표지는 내용 없이 남는다', J(del.people.find(p => p.id === 'pb')), { id: 'pb', at: 400, by: 'u', del: true });
sc.eq('⑤ 낡은 기기(지우기 전 사본)와 맞춰도 되살아나지 않는다', A.live(A.mergeBook(m1, del).people).map(p => p.id), ['pa']);
sc.eq('⑤ 지운 뒤 다시 고치면(더 나중) 살아난다 — 사람이 한 일이 이긴다', A.live(A.mergeBook(del, A.normBook({ people: [{ id: 'pb', name: '나나', at: 500 }] })).people).map(p => p.id), ['pa', 'pb']);
const delSlot = J(m1); A.drop(delSlot, 'slots', '2026-11-15|sun1|offer', 'u', 400);
sc.eq('⑤ 자리 지우기 표지도 다듬기를 통과한다(날짜 · 예배 · 역할을 지님)', A.normBook(delSlot).slots.length, 1);
const delVisit = A.normBook(null); A.put(delVisit, 'visits', { id: 'v|2026-11-15', who: ['pa'] }, 'u', 1); A.drop(delVisit, 'visits', 'v|2026-11-15', 'u', 2);
sc.eq('⑤ 방문 지우기 표지도 남는다', J(A.normBook(delVisit).visits), [{ id: 'v|2026-11-15', at: 2, by: 'u', del: true, date: '2026-11-15' }]);

// ⑥ 계정 맞추기
sc.eq('⑥ 계정이 비었고 기기에 자료가 있으면 올린다', A.pickBook(m1, null).push, true);
sc.eq('⑥ 둘 다 비었으면 올리지 않는다', A.pickBook(null, null).push, false);
sc.eq('⑥ 같으면 올리지 않는다', A.pickBook(m1, J(m1)).push, false);
const empty = A.pickBook(null, J(m1));
sc.eq('⑥ ⭐ 빈 기기로 로그인 → 계정 자료 그대로, 올리지 않는다(지우지 않는다)', [empty.push, A.live(empty.book.people).length, empty.book.slots.length], [false, 2, 1]);
const ahead = J(m1); A.put(ahead, 'people', { id: 'pc', name: '다다', roles: [] }, 'u', 900);
sc.eq('⑥ 기기에만 있는 새 줄은 합쳐서 올린다', [A.pickBook(ahead, J(m1)).push, A.pickBook(ahead, J(m1)).book.people.length], [true, 3]);
const half = J(m1); half.people = half.people.slice(0, 1);
sc.eq('⑥ 계정에 줄이 빠져 와도(일부만) 기기의 줄은 남는다', A.pickBook(m1, half).book.people.length, 2);

// ⑦ 한 주 보기
const wk = A.normBook(null);
A.put(wk, 'people', { id: 'p1', name: '가가', roles: [] }, 'u', 1);
A.put(wk, 'people', { id: 'p2', name: '나나', roles: [] }, 'u', 1);
for (const s of ['sun1', 'sun2', 'sun3', 'll']) A.put(wk, 'slots', { id: A.slotId('2026-11-15', s, 'preach'), txt: '담임목사님' }, 'u', 1);
A.put(wk, 'slots', { id: A.slotId('2026-11-15', 'sun1', 'offer'), who: ['p1'] }, 'u', 1);
A.put(wk, 'slots', { id: A.slotId('2026-11-15', 'sun2', 'offer'), who: ['p2'] }, 'u', 1);
A.put(wk, 'slots', { id: A.slotId('2026-11-15', 'sun3', 'offer'), who: ['p1'] }, 'u', 1);
A.put(wk, 'slots', { id: A.slotId('2026-11-20', 'fri', 'preach'), who: ['p2'] }, 'u', 1);
A.put(wk, 'visits', { id: A.visitId('2026-11-15'), who: ['p2'], stay: [{ name: '호텔 A', status: 'done' }, { kind: 'home', status: 'ask' }] }, 'u', 1);
const pl = A.weekPlan(wk, '2026-11-15');
sc.eq('⑦ 한 주에 금요 · 수요 날짜와 그 금요일의 부산 금n', [pl.fri, pl.wed, pl.busanFri], ['2026-11-20', '2026-11-18', 3]);
sc.eq('⑦ 그 주 금요 자리를 찾는다', A.whoText(wk, pl.slots['fri|preach'].who, ''), '나나');
sc.eq('⑦ 같은 사람이 여러 예배 → 한 줄로 묶음', J(A.groupRole(wk, pl, 'preach', ['sun1', 'sun2', 'sun3', 'll'])), [{ text: '담임목사님', svcs: ['sun1', 'sun2', 'sun3', 'll'] }]);
sc.eq('⑦ 헌금: 가가(1 · 3부) · 나나(2부)', J(A.groupRole(wk, pl, 'offer', ['sun1', 'sun2', 'sun3', 'll'])), [{ text: '가가', svcs: ['sun1', 'sun3'] }, { text: '나나', svcs: ['sun2'] }]);
sc.eq('⑦ 숙소 하나라도 대화 중이면 미정', A.stayState(pl.visits[0]), 'open');
sc.eq('⑦ 취소한 숙소는 셈하지 않는다', A.stayState(A.normBook({ visits: [{ id: 'v|2026-11-15', stay: [{ status: 'cancel' }, { status: 'done' }] }] }).visits[0]), 'done');
const two = A.normBook({ visits: [{ id: 'v|2025-12-25', days: '목' }, { id: 'v|2025-12-28' }, { id: 'v|2025-12-31', days: '수목' }, { id: 'v|2026-01-04' }] });
sc.eq('⑦ 한 주에 방문이 여럿 — 주일~토로 묶는다 (시트 2025-12 성탄 · 송구영신 실제 모양)', [A.weekVisits(two, '2025-12-21').map(v => v.date), A.weekVisits(two, '2025-12-28').map(v => v.date), A.weekVisits(two, '2026-01-04').map(v => v.date)], [['2025-12-25'], ['2025-12-28', '2025-12-31'], ['2026-01-04']]);
sc.eq('⑦ 머무는 날이 걸친 방문: 토일 방문(12/28)은 앞 주(토 12/27)에도 보인다', [A.weekStays(two, '2025-12-21').map(v => v.date), A.weekStays(two, '2025-12-28').map(v => v.date)], [['2025-12-25', '2025-12-28'], ['2025-12-28', '2025-12-31', '2026-01-04']]);
A.drop(wk, 'people', 'p1', 'u', 2);
sc.eq('⑦ 지운 사람이 맡은 자리는 이름 대신 (지운 사람)', A.whoText(wk, ['p1', 'p2'], ''), '(지운 사람) · 나나');
sc.eq('⑦ 칸 이름', [A.slotLabel('sun2', 'lead'), A.slotLabel('fri', 'offer'), A.slotLabel('ll', 'offer'), A.slotLabel('wed', 'offer'), A.slotLabel('fri', 'notice')], ['2부 예배인도', '금요 헌금', 'LL 헌금인도', '수요 헌금', 'WN 광고']);
sc.eq('⑦ 시트 예배 구성의 칸은 열넷 + 옛 화요예배 둘 + WN 광고', A.GRID.length, 17);

// ⑨ 머무는 날
const V = (date, days) => A.normBook({ visits: [{ id: 'v|' + date, days }] }).visits[0];
sc.eq('⑨ 주일 + 비어 있음 → 토일', A.stayDates(V('2026-11-15', '')), ['2026-11-14', '2026-11-15']);
sc.eq('⑨ 주일 + 금토일월', A.stayDates(V('2026-11-15', '금토일월')), ['2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16']);
sc.eq('⑨ 주일 + 목금토일 (성탄 주간)', A.stayDates(V('2025-12-28', '목금토일')), ['2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28']);
sc.eq('⑨ 수요일 + 수목 (송구영신)', A.stayDates(V('2025-12-31', '수목')), ['2025-12-31', '2026-01-01']);
sc.eq('⑨ 목요일 + 비어 있음 → 그 날 하루', A.stayDates(V('2025-12-25', '')), ['2025-12-25']);
sc.eq('⑨ 머무는 기간 글 (R10): 금토주일 · 달 넘김 · 하루 · 비어 있음(토~주일)', [A.stayPeriod(V('2026-11-15', '금토일')), A.stayPeriod(V('2026-11-01', '토일')), A.stayPeriod(V('2025-12-31', '')), A.stayPeriod(V('2026-11-15', ''))],
  ['11/13(금)~15(주일)', '10/31(토)~11/1(주일)', '12/31(수)', '11/14(토)~15(주일)']);
sc.eq('⑨ 머무는 날이 이어지는가: 금토일 예 · 수토일 아니오', [A.stayWhole(V('2026-11-15', '금토일')), A.stayWhole(V('2026-11-15', '수토일'))], [true, false]);
sc.eq('⑨ 기본 머무는 날', [A.defaultDays('2026-11-15'), A.defaultDays('2025-12-31')], ['토일', '수']);

// ⑩ 겹침 검사
const cb = A.normBook(null);
for (const [id, nm, roles] of [['a', '가가', ['preach', 'offer', 'lead', 'busan']], ['b', '나나', ['preach', 'offer', 'lead', 'busan']], ['c', '다다', ['offer']]]) A.put(cb, 'people', { id, name: nm, roles }, 'u', 1);
A.put(cb, 'visits', { id: 'v|2026-11-15', who: ['a'], days: '금토일' }, 'u', 1);
A.put(cb, 'slots', { id: '2026-11-15|sun2|offer', who: ['a'] }, 'u', 1);      // 빨강: 주일
A.put(cb, 'slots', { id: '2026-11-13|fri|preach', who: ['a'] }, 'u', 1);      // 빨강: 금요 (금토일)
A.put(cb, 'slots', { id: '2026-11-11|wed|preach', who: ['a'] }, 'u', 1);      // 괜찮음: 수요는 머무는 날 아님
A.put(cb, 'slots', { id: '2026-11-15|sun1|offer', who: ['b'] }, 'u', 1);      // 괜찮음
A.put(cb, 'slots', { id: '2026-11-15|ll|lead', who: ['c'] }, 'u', 1);         // 노랑: 예배인도 안 맡는 분
const cf = A.conflicts(cb, '2026-11-09', '2026-11-15', '');
sc.eq('⑩ 빨강 둘(주일 · 금요) — 수요는 머무는 날이 아니라 괜찮다', cf.filter(c => c.level === 'bad').map(c => c.slot), ['2026-11-13|fri|preach', '2026-11-15|sun2|offer']);
sc.eq('⑩ 노랑 — 맡지 않는 일', cf.filter(c => c.level === 'warn').map(c => [c.kind, c.pid]), [['role', 'c']]);
sc.eq('⑩ 빨강이 먼저 · 글', A.conflictText(cb, cf[0]), '가가 — 11/13(금) 부산에 있는데 분당 금요 설교');
sc.eq('⑩ 칸 표시: 자리 · 방문 모두 빨강', [A.levelMap(cf)['2026-11-15|sun2|offer'], A.levelMap(cf)['v|2026-11-15'], A.levelMap(cf)['2026-11-15|ll|lead']], ['bad', 'bad', 'warn']);
A.put(cb, 'visits', { id: 'v|2026-11-15', who: ['a'], days: '토일' }, 'u', 2);
sc.eq('⑩ 머무는 날을 토일로 줄이면 금요는 풀린다', A.conflicts(cb, '2026-11-09', '2026-11-15', '').filter(c => c.level === 'bad').map(c => c.slot), ['2026-11-15|sun2|offer']);
A.put(cb, 'visits', { id: 'v|2025-12-31', who: ['b'], days: '수목' }, 'u', 1);
A.put(cb, 'slots', { id: '2025-12-31|wed|preach', who: ['b'] }, 'u', 1);
sc.eq('⑩ 수요일 방문(수목)이면 그 주 수요 자리가 빨강', A.conflicts(cb, '2025-12-29', '2026-01-04', '').filter(c => c.level === 'bad').map(c => c.slot), ['2025-12-31|wed|preach']);
A.put(cb, 'visits', { id: 'v|2026-11-22', who: ['a'] }, 'u', 1);
A.put(cb, 'visits', { id: 'v|2026-11-29', who: ['c'], stay: [{ status: 'ask' }] }, 'u', 1);
const cf2 = A.conflicts(cb, '2026-11-16', '2026-11-29', '2026-11-20');
sc.eq('⑩ 두 주 연속 부산', cf2.filter(c => c.kind === 'twice').map(c => [c.pid, c.prev, c.date]), [['a', '2026-11-15', '2026-11-22']]);
sc.eq('⑩ 부산 안 맡는 분이 방문', cf2.filter(c => c.kind === 'role').map(c => c.pid), ['c']);
sc.eq('⑩ 오늘부터 2주 안 · 숙소 미정 (11/22 없음, 11/29 대화 중)', cf2.filter(c => c.kind === 'stay').map(c => c.date), ['2026-11-22', '2026-11-29']);
sc.eq('⑩ 오늘을 모르면 숙소는 묻지 않는다', A.conflicts(cb, '2026-11-16', '2026-11-29', '').some(c => c.kind === 'stay'), false);
A.put(cb, 'marks', { id: 'm|2026-11-22', tags: ['극동방송'] }, 'u', 1);
sc.eq('⑩ 극동방송 주인데 동행 없음', A.conflicts(cb, '2026-11-16', '2026-11-22', '').filter(c => c.kind === 'staff').map(c => c.date), ['2026-11-22']);
A.put(cb, 'visits', { id: 'v|2026-11-22', who: ['a'], staff: '스텝 한 명' }, 'u', 3);
sc.eq('⑩ 동행을 적으면 풀린다', A.conflicts(cb, '2026-11-16', '2026-11-22', '').some(c => c.kind === 'staff'), false);
A.drop(cb, 'people', 'b', 'u', 5);
sc.eq('⑩ 지운 사람이 자리에 남아 있으면 노랑', A.conflicts(cb, '2026-11-15', '2026-11-15', '').filter(c => c.kind === 'gone').map(c => c.slot), ['2026-11-15|sun1|offer']);
sc.eq('⑩ 고르기 판 — 부산에 있는 날 · 안 맡는 일 · 괜찮음', [A.pickNote(cb, 'a', '2026-11-15', 'offer'), A.pickNote(cb, 'c', '2026-11-08', 'preach'), A.pickNote(cb, 'a', '2026-11-08', 'offer')],
  [{ level: 'bad', text: '11/15 부산' }, { level: 'warn', text: "'설교' 안 맡음" }, null]);
sc.eq('⑩ 그 달 맡은 횟수', [A.countRole(cb, 'a', 'offer', '2026-11'), A.countRole(cb, 'a', 'busan', '2026-11')], [1, 2]);

// ⑪ 자리 넣고 빼기
const sb = A.normBook(null);
sc.eq('⑪ 넣기', [A.setSlot(sb, '2026-11-15|sun1|offer', ['a'], '', 'u', 1), A.live(sb.slots).length], [true, 1]);
sc.eq('⑪ 같은 값이면 안 씀(고친 때가 바뀌지 않는다)', [A.setSlot(sb, '2026-11-15|sun1|offer', ['a'], '', 'u', 2), sb.slots[0].at], [false, 1]);
sc.eq('⑪ 글만 넣기', [A.setSlot(sb, '2026-11-15|sun1|preach', [], '담임목사님', 'u', 3), sb.slots.find(s => s.id === '2026-11-15|sun1|preach').txt], [true, '담임목사님']);
sc.eq('⑪ 다 빼면 지우기 표지', [A.setSlot(sb, '2026-11-15|sun1|offer', [], '', 'u', 4), J(sb.slots.find(s => s.id === '2026-11-15|sun1|offer'))], [true, { id: '2026-11-15|sun1|offer', at: 4, by: 'u', del: true, date: '2026-11-15', svc: 'sun1', role: 'offer' }]);
sc.eq('⑪ 없는 자리를 비우면 아무 일 없음', A.setSlot(sb, '2026-11-22|sun1|offer', [], '', 'u', 5), false);

// ⑫ 예배마다
const nb = A.normBook({ people: [{ id: 'x', name: '가가', roles: ['preach', 'offer', 'lead'], no: ['sun1|preach', 'fri|preach', 'sun1|lead', 'zz|preach', 7] }, { id: 'y', name: '나나', roles: ['offer'] }] });
sc.eq('⑫ 빼 둔 예배: 있는 칸만 남긴다(1부 예배인도 · 모르는 것 버림), 시트 순서로', nb.people[0].no, ['sun1|preach', 'fri|preach']);
sc.eq('⑫ 빼 둔 게 없으면 칸 자체가 없다 (예전 자료와 같은 모양)', 'no' in nb.people[1], false);
const px = nb.people[0];
sc.eq('⑫ 맡나', [A.canDo(px, 'sun1', 'preach'), A.canDo(px, 'sun2', 'preach'), A.canDo(px, 'fri', 'preach'), A.canDo(px, 'sun1', 'offer'), A.canDo(nb.people[1], 'sun1', 'preach')], [false, true, false, true, false]);
A.put(nb, 'slots', { id: '2026-11-15|sun1|preach', who: ['x'] }, 'u', 1);
A.put(nb, 'slots', { id: '2026-11-15|sun2|preach', who: ['x'] }, 'u', 1);
const nc = A.conflicts(nb, '2026-11-15', '2026-11-15', '');
sc.eq('⑫ 빼 둔 예배에 넣으면 노랑 (막지는 않음)', nc.map(c => [c.kind, c.slot]), [['role', '2026-11-15|sun1|preach']]);
sc.eq('⑫ 글', A.conflictText(nb, nc[0]), '가가 — 1부 설교에 들어가지 않는 분인데 11/15');
sc.eq('⑫ 고르기 판: 네 예배 모두 같게 고를 때 빠진 예배를 알려 줌', A.pickNote(nb, 'x', '2026-11-15', 'preach', ['sun1', 'sun2', 'sun3', 'll']), { level: 'warn', text: '1부 안 들어감' });

// ⑬ 낡은 앱(R1)과 함께 — R1 은 수요일 방문 · 빼 둔 예배를 몰라 떨군 채 'book' 칸에 다시 쓴다
const full = A.normBook({ people: [{ id: 'x', name: '가가', roles: ['preach'], no: ['sun1|preach'], at: 5 }], visits: [{ id: 'v|2025-12-31', days: '수목', who: ['x'], at: 5 }, { id: 'v|2025-12-28', who: ['x'], at: 5 }] });
const stripped = J(full); delete stripped.people[0].no; stripped.visits = stripped.visits.filter(v => v.date !== '2025-12-31');   // R1 이 떨군 모양 (같은 at)
sc.eq('⑬ 같은 때(at)면 칸이 더 많은 사본이 이긴다 — 어느 순서로 합쳐도', [A.mergeBook(full, stripped).people[0].no, A.mergeBook(stripped, full).people[0].no], [['sun1|preach'], ['sun1|preach']]);
const d1 = A.pickDoc(full, { b7: J(full), b6: stripped, b5: stripped, b4: stripped, b3: stripped, b2: stripped, book: stripped });
sc.eq('⑬ 낡은 앱이 옛 칸(book ~ b6)을 떨군 채 써도 b7 과 합쳐 모두 남고, 옛 칸을 치우려 한 번 쓴다', [d1.book.visits.length, d1.book.people[0].no, d1.push], [2, ['sun1|preach'], true]);
const d1b = A.pickDoc(full, { b7: J(full) });
sc.eq('⑬ b7 만 있고 같으면 다시 쓰지 않는다(핑퐁 없음)', d1b.push, false);
const d2 = A.pickDoc(null, { book: J(full) });
sc.eq('⑬ R1 때 자료(book 만) → 빈 기기에서도 그대로 읽고 b7 로 옮겨 쓴다', [d2.book.visits.length, d2.push], [2, true]);
const d2b = A.pickDoc(null, { b2: J(full) });
sc.eq('⑬ R2~ 자료(b2 만) → 그대로 읽고 b7 로 옮겨 쓴다', [d2b.book.visits.length, d2b.book.people[0].no, d2b.push], [2, ['sun1|preach'], true]);
const old2 = J(stripped); old2.people.push({ id: 'y', name: '나나', roles: [], at: 9 });
const d3 = A.pickDoc(full, { b6: old2, b7: J(full) });
sc.eq('⑬ 낡은 앱(b6)에서 새로 적은 줄도 받아 b7 로 올린다', [d3.book.people.map(p => p.id), d3.push], [['x', 'y'], true]);
sc.eq('⑬ 빈 문서 · 빈 기기 → 아무것도 안 씀', A.pickDoc(null, {}).push, false);
sc.eq('⑬ 쓰는 칸은 WRITE_FIELD 하나, 옛 칸은 지운다', /\[WRITE_FIELD\]: S\.book/.test(HTML) && /FieldValue\.delete\(\)/.test(HTML) && !/\.set\(\{ (book|b2|b3):/.test(HTML) && /WRITE_FIELD = 'b7'/.test(HTML), true);

// ⑭ 가져오기 (지어낸 이름)
const hb = A.normBook(null);
A.put(hb, 'people', { id: 'p1', name: '가가가', roles: ['preach', 'offer', 'lead', 'busan'] }, 'u', 500);
A.put(hb, 'people', { id: 'p2', name: '나나나', roles: ['offer'] }, 'u', 500);
A.put(hb, 'slots', { id: '2026-11-15|sun1|offer', who: ['p2'] }, 'u', 600);         // 앱에서 이미 적은 칸
A.put(hb, 'visits', { id: 'v|2026-11-22', who: ['p1'] }, 'u', 600); A.drop(hb, 'visits', 'v|2026-11-22', 'u', 700);   // 앱에서 지운 방문
const imp = { kind: 'rota-import', v: 1, from: '시험',
  visits: [{ date: '2026-11-15', names: ['가가가'], days: '금토일', fri: true, stay: [{ kind: 'hotel', name: '호텔 가', status: 'done', cost: 80000, nights: 1 }], staff: '스텝', note: '메모' },
           { date: '2026-11-22', names: ['다다다'] }, { date: '2025-12-31', names: ['라라라', '가가가'], days: '수목' }],
  slots: [{ id: '2026-11-15|sun1|offer', names: ['가가가'], txt: '' }, { id: '2026-11-15|sun2|offer', names: ['다다다'], txt: '' },
          { id: '2026-11-15|sun1|preach', names: [], txt: '담임목사님' }, { id: '2026-05-12|tue|preach', names: ['나나나'], txt: '' }, { id: '2026-11-15|zz|preach', names: ['가가가'] }],
  marks: [{ sun: '2026-11-15', tags: ['성찬주'], note: '성찬주' }] };
const ir = A.importBook(hb, imp, 'u');
sc.eq('⑭ 가져오기 파일이 아니면 아무것도 안 함', [A.importBook(hb, { kind: 'x' }, 'u'), A.importBook(hb, null, 'u')], [null, null]);
sc.eq('⑭ 없는 이름은 새 사람(맡는 일 없음), 있는 이름은 그 사람', [ir.created, A.live(ir.book.people).filter(p => !p.roles.length).map(p => p.name)], [['다다다', '라라라'], ['다다다', '라라라']]);
sc.eq('⑭ 새 사람 id 는 이름에서 정해진다(두 기기가 따로 가져와도 한 사람)', ir.book.people.some(p => p.id === A.personIdFor('다다다')), true);
sc.eq('⑭ 앱에서 이미 적은 칸은 그대로 (시트 값으로 안 바뀜)', ir.book.slots.find(s => s.id === '2026-11-15|sun1|offer').who, ['p2']);
sc.eq('⑭ 앱에서 지운 방문은 되살아나지 않는다', A.live(ir.book.visits).some(v => v.date === '2026-11-22'), false);
sc.eq('⑭ 새 칸은 들어온다 (방문 · 자리 · 글 · 화요 · 일정), 모르는 칸은 버림', [A.live(ir.book.visits).map(v => v.date), A.live(ir.book.slots).map(s => s.id), A.live(ir.book.marks).length],
  [['2025-12-31', '2026-11-15'], ['2026-05-12|tue|preach', '2026-11-15|sun1|offer', '2026-11-15|sun1|preach', '2026-11-15|sun2|offer'], 1]);
sc.eq('⑭ 방문의 숙소 · 머무는 날 · 금요 · 메모도 들어온다', (v => [v.days, v.fri, v.stay[0].name, v.stay[0].cost, v.staff, v.note])(ir.book.visits.find(v => v.id === 'v|2026-11-15')), ['금토일', true, '호텔 가', 80000, '스텝', '메모']);
sc.eq('⑭ 셈: 새로 · 고침 · 그대로', ir.counts, { visits: 2, visitsUpd: 0, visitsKept: 1, slots: 3, slotsUpd: 0, slotsKept: 1, marks: 1, marksUpd: 0, marksKept: 0 });
const ir2 = A.importBook(ir.book, imp, 'u');
sc.eq('⑭ 두 번 가져와도 같다', [A.sameBook(ir.book, ir2.book), ir2.created, ir2.counts.slots], [true, [], 0]);
sc.eq('⑭ 가져오기는 아무것도 지우지 않는다 (가져오기 전 줄이 모두 남음)', hb.people.concat(hb.slots, hb.visits).every(x => ir.book[x.id.startsWith('v|') ? 'visits' : x.id.includes('|') ? 'slots' : 'people'].some(y => y.id === x.id && JSON.stringify(y) === JSON.stringify(x))), true);
const later = J(ir.book); A.put(later, 'slots', { id: '2026-11-15|sun2|offer', who: ['p1'] }, 'u', 800);
sc.eq('⑭ 가져온 뒤 앱에서 고치면 그게 이긴다 (다시 가져와도)', A.importBook(later, imp, 'u').book.slots.find(s => s.id === '2026-11-15|sun2|offer').who, ['p1']);

// ⑮ 화요예배 · 지난 주 노랑
sc.eq('⑮ 화요 자리는 화요일만', [A.normBook({ slots: [{ id: '2026-05-12|tue|offer' }, { id: '2026-05-13|tue|offer' }] }).slots.map(s => s.id)], [['2026-05-12|tue|offer']]);
sc.eq('⑮ 화요는 그 달에 자료가 있을 때만 보인다', [A.svcShown(ir.book, 'tue', ['2026-05-10']), A.svcShown(ir.book, 'tue', ['2026-11-15']), A.svcShown(ir.book, 'wed', ['2026-11-15'])], [true, false, true]);
const pastB = A.normBook(null);
A.put(pastB, 'people', { id: 'o', name: '옛분', roles: [] }, 'u', 1);
A.put(pastB, 'slots', { id: '2026-10-04|sun1|offer', who: ['o'] }, 'u', 1);
A.put(pastB, 'slots', { id: '2026-11-15|sun1|offer', who: ['o'] }, 'u', 1);
A.put(pastB, 'visits', { id: 'v|2026-10-04', who: ['o'] }, 'u', 1);
const pcf = A.conflicts(pastB, '2026-10-01', '2026-11-15', '2026-11-12');
sc.eq('⑮ 지난 주들의 노랑은 깔지 않고(옛 기록), 이번 주부터 · 빨강은 지난 것도', [pcf.filter(c => c.level === 'warn').map(c => c.date), pcf.filter(c => c.level === 'bad').map(c => c.date)], [['2026-11-15'], ['2026-10-04']]);

// ⑯ 11/14 HB 2차 피드백: 요일 하나씩 · 숙소 칸 · 성도 인도자 · 주간 이름 · 가져오기 2판
sc.eq('⑯ 요일 순서는 방문 날짜 기준 (주일 방문: 목 금 토 일 월)', [A.sortDays('2026-11-15', '월일토금'), A.sortDays('2025-12-31', '목수'), A.sortDays('2026-11-15', '수일x')], ['금토일월', '수목', '수일']);
sc.eq('⑯ 띄엄띄엄 고른 요일도 그 날짜들 (금 · 일)', A.stayDates(V('2026-11-15', '금일')), ['2026-11-13', '2026-11-15']);
sc.eq('⑯ 주일 방문 + 수 → 그 주 수요일', A.stayDates(V('2026-11-15', '수토일')), ['2026-11-11', '2026-11-14', '2026-11-15']);
sc.eq('⑯ 고를 요일 판 (주일 방문 → 화 ~ 월)', A.dayChoices('2026-11-15'), ['화', '수', '목', '금', '토', '일', '월']);
sc.eq('⑯ 주간 이름 (주일~토, 달이 넘어가면 달도)', [A.weekLabel('2026-11-29'), A.weekLabel('2026-11-15'), A.weekLabel('2026-12-06'), A.weekLabel('2027-01-03')].slice(1), ['11/15~21', '12/6~12', '1/3~9']);
const st = A.normBook({ visits: [{ id: 'v|2026-11-15', stay: [{ name: '호텔 가', cancelBy: '2026-11-12', cancelAt: '18:00', nofree: 1, imgs: ['abc123xyz', 'BAD!', 7] }, { name: '호텔 나', cancelBy: 'x', cancelAt: '18:00' }] }] }).visits[0].stay;
sc.eq('⑯ 숙소: 취소 기한 · 시각(기한 있을 때만) · 환불 불가 · 사진 id', J(st), [{ kind: 'hotel', name: '호텔 가', status: '', cost: 0, nights: 0, for: '', cancelBy: '2026-11-12', cancelAt: '18:00', nofree: true, imgs: ['abc123xyz'] }, { kind: 'hotel', name: '호텔 나', status: '', cost: 0, nights: 0, for: '' }]);
sc.eq('⑯ 성도 인도자 구분 (없으면 교역자 — 예전 자료 그대로)', A.normBook({ people: [{ id: 'a', name: '가', kind: 'lay' }, { id: 'b', name: '나', kind: 'x' }] }).people.map(p => p.kind || '교역자'), ['lay', '교역자']);
const v1 = A.importBook(hb, imp, 'u').book;
const imp2 = J(imp); imp2.v = 2; imp2.visits[0].stay = [{ kind: 'hotel', name: '호텔 다', status: 'done', cost: 190000, nights: 2, cancelBy: '2026-11-12' }];
imp2.people = [{ name: '다다다', kind: 'lay' }, { name: '가가가', kind: 'lay' }];
const v2 = A.importBook(v1, imp2, 'u');
sc.eq('⑯ 가져오기 2판은 1판으로 들어온 것을 고친다 (숙소)', v2.book.visits.find(v => v.id === 'v|2026-11-15').stay[0].name, '호텔 다');
sc.eq('⑯ 2판 셈: 1판으로 들어온 방문 하나를 고침으로 센다 (새로 0)', [v2.counts.visits, v2.counts.visitsUpd], [0, 1]);
sc.eq('⑯ 2판의 사람 구분은 가져오기로 생긴 사람만 (앱에서 넣은 사람은 그대로)', [v2.book.people.find(p => p.name === '다다다').kind, v2.book.people.find(p => p.name === '가가가').kind || '교역자'], ['lay', '교역자']);
const edited = J(v1); A.put(edited, 'visits', Object.assign({}, edited.visits.find(v => v.id === 'v|2026-11-15'), { staff: 'HB 가 고침' }), 'u', 900);
sc.eq('⑯ 앱에서 고친 방문은 2판이 덮지 않는다', A.importBook(edited, imp2, 'u').book.visits.find(v => v.id === 'v|2026-11-15').staff, 'HB 가 고침');
sc.eq('⑯ 모르는 판(4)은 안 받는다', A.importBook(hb, Object.assign(J(imp), { v: 4 }), 'u'), null);

// ⑰ 자동 배열 제안 — 2026년 11월 (주일 11/1 · 8 · 15 · 22 · 29), 지어낸 이름
const ab = A.normBook(null);
const P4 = ['가가', '나나', '다다', '라라', '마마'];
P4.forEach((n, i) => A.put(ab, 'people', { id: 'q' + i, name: n, roles: ['preach', 'offer', 'lead', 'busan'] }, 'u', 1));
A.put(ab, 'people', { id: 'qL', name: '바바', kind: 'lay', roles: ['lead'] }, 'u', 1);
A.put(ab, 'visits', { id: 'v|2026-10-25', who: ['q0'] }, 'u', 1);          // 가가: 바로 앞 주에 다녀옴
A.put(ab, 'visits', { id: 'v|2026-10-04', who: ['q1'] }, 'u', 1);          // 나나: 오래전
A.put(ab, 'visits', { id: 'v|2026-11-15', who: ['q3'] }, 'u', 1);          // 11/15 은 이미 정함
A.put(ab, 'visits', { id: 'v|2026-11-22', who: ['q2'] }, 'u', 1); A.drop(ab, 'visits', 'v|2026-11-22', 'u', 2);   // 11/22 은 사람이 비움
A.put(ab, 'slots', { id: '2026-11-01|sun1|offer', who: ['q4'] }, 'u', 1);  // 마마: 11/1 분당 헌금 → 11/1 부산 못 감
A.put(ab, 'slots', { id: '2026-11-08|sun2|lead', who: ['q2'], lock: true }, 'u', 1);
const pr = A.propose(ab, '2026-11');
const vby = Object.fromEntries(pr.visits.map(v => [v.date, v.pid]));
sc.eq('⑰ 부산 제안은 비어 있는 주일만 (11/15 정함 · 11/22 사람이 비움은 건너뜀)', Object.keys(vby), ['2026-11-01', '2026-11-08', '2026-11-29']);
sc.eq('⑰ 11/1: 바로 앞 주 다녀온 가가 · 분당 자리 있는 마마는 빼고, 기록 없는 분(다다) → 그다음 나나', [vby['2026-11-01'] !== 'q0' && vby['2026-11-01'] !== 'q4', vby['2026-11-01']], [true, 'q2']);
sc.eq('⑰ 성도 인도자는 부산 제안에 안 들어감', pr.visits.some(v => v.pid === 'qL' || (v.alts || []).includes('qL')), false);
sc.eq('⑰ 앞 주일 제안도 셈에 넣어 같은 분이 연달아 나오지 않음', new Set(Object.values(vby)).size, 3);
sc.eq('⑰ 이유 글', typeof pr.visits[0].why === 'string' && pr.visits[0].why.length > 0, true);
const sl = Object.fromEntries(pr.slots.map(s => [s.id, s.pid]));
sc.eq('⑰ 이미 적힌 칸 · 잠근 칸은 제안하지 않음', ['2026-11-01|sun1|offer', '2026-11-08|sun2|lead'].some(id => id in sl), false);
sc.eq('⑰ 주일 설교는 제안하지 않음', Object.keys(sl).some(id => id.includes('|preach') && /sun|ll/.test(id.split('|')[1])), false);
sc.eq('⑰ 주일 헌금: 1 · 3부 같은 분, 2부 · LL 같은 분, 두 무리는 다른 분 (11/8)', (k => [sl[k + 'sun1|offer'] === sl[k + 'sun3|offer'], sl[k + 'sun2|offer'] === sl[k + 'll|offer'], sl[k + 'sun1|offer'] !== sl[k + 'sun2|offer']])('2026-11-08|'), [true, true, true]);
sc.eq('⑰ 11/1 은 1부가 이미 마마 → 3부만 채우고, 2부 · LL 은 마마가 아닌 분', [!!sl['2026-11-01|sun3|offer'], sl['2026-11-01|sun2|offer'] !== 'q4'], [true, true]);
sc.eq('⑰ 2부 · LL 인도는 서로 다른 분 (잠근 2부 인도 다다와도 다름, 11/8)', sl['2026-11-08|ll|lead'] !== 'q2', true);
sc.eq('⑰ 성도 인도자도 인도 후보', Object.entries(sl).some(([k, v]) => k.endsWith('|lead') && v === 'qL'), true);
sc.eq('⑰ 금요 · 수요 설교와 헌금은 다른 분', pr.slots.filter(s => /fri|wed/.test(s.id)).every(s => { const [d, sv, r] = s.id.split('|'); const o = sl[d + '|' + sv + '|' + (r === 'preach' ? 'offer' : 'preach')]; return !o || o !== s.pid; }), true);
sc.eq('⑰ 제안한 부산 방문자는 그 주 분당 자리에 안 들어감 (겹침 없음)', (() => { const nb = A.normBook(J(ab)); A.applyProposal(nb, pr, 'u', 9); return A.conflicts(nb, '2026-10-26', '2026-11-29', '').filter(c => c.level === 'bad').length; })(), 0);
const ap = A.normBook(J(ab)); A.put(ap, 'slots', { id: '2026-11-08|sun1|offer', who: ['q1'] }, 'u', 5);   // 그 사이 다른 기기가 채움
const pr2 = J(pr); pr2.slots.find(s => s.id === '2026-11-01|sun3|offer').on = false;
const nApplied = A.applyProposal(ap, pr2, 'u', 9);
sc.eq('⑰ 적용: 끈 줄 · 그 사이 채워진 칸은 건너뜀', [ap.slots.find(s => s.id === '2026-11-08|sun1|offer').who, ap.slots.some(s => s.id === '2026-11-01|sun3|offer'), nApplied], [['q1'], false, pr.visits.filter(v => v.pid).length + pr.slots.length - 2]);
sc.eq('⑰ 제안은 원래 책을 바꾸지 않는다', A.live(ab.visits).length, 3);

// ⑱ 보기 틀 읽기 (지어낸 이름)
const vb = A.normBook(null);
A.put(vb, 'people', { id: 'a', name: '가가', roles: ['preach', 'offer', 'lead', 'busan'] }, 'u', 1);
for (const sv of ['sun1', 'sun3']) A.put(vb, 'slots', { id: '2026-11-15|' + sv + '|offer', who: ['a'] }, 'u', 1);
A.put(vb, 'slots', { id: '2026-11-15|sun2|lead', who: ['a'] }, 'u', 1);
A.put(vb, 'slots', { id: '2026-11-13|fri|preach', who: ['a'] }, 'u', 1);
A.put(vb, 'slots', { id: '2026-11-18|wed|offer', who: ['a'] }, 'u', 1);
A.put(vb, 'visits', { id: 'v|2026-11-22', who: ['a'], days: '금토일' }, 'u', 1);
sc.eq('⑱ 사람 × 주(주일~토): 주일 헌금(1 · 3부 하나로) · 주일 인도 · 그 주 수요 헌금', J(A.weekTags(vb, 'a', '2026-11-15').map(t => [t.t, t.svc])), [['헌', 'sun'], ['인', 'sun'], ['헌', 'wed']]);
sc.eq('⑱ 사람 × 주: 금요일(11/13)은 앞 주(11/8)에', J(A.weekTags(vb, 'a', '2026-11-08').map(t => [t.t, t.svc])), [['설', 'fri']]);
sc.eq('⑱ 사람 × 주: 부산 방문', J(A.weekTags(vb, 'a', '2026-11-22').map(t => [t.t, t.svc])), [['부', 'bs']]);
const mi = A.myItems(vb, 'a', '2026-11-01', '2026-11-30');
sc.eq('⑱ 내 일정: 날짜순(같은 날은 설교 → 헌금 → 인도), 같은 날 같은 일의 주일 예배는 한 줄, 부산은 머무는 첫날에', J(mi.map(r => [r.kind, r.date, r.svcs || r.end])), [['slot', '2026-11-13', ['fri']], ['slot', '2026-11-15', ['sun1', 'sun3']], ['slot', '2026-11-15', ['sun2']], ['slot', '2026-11-18', ['wed']], ['visit', '2026-11-20', '2026-11-22']]);
sc.eq('⑱ 하루: 그 날 자리 · 그 날 부산에 머무는 방문', [A.dayItems(vb, '2026-11-15').slots.map(s => s.id), A.dayItems(vb, '2026-11-21').visits.map(v => v.id)], [['2026-11-15|sun1|offer', '2026-11-15|sun3|offer', '2026-11-15|sun2|lead'], ['v|2026-11-22']]);

// ⑲ R5 (지어낸 이름)
const rb = A.normBook({ people: [
  { id: 'a', name: '가가', roles: ['preach', 'offer', 'lead', 'busan'], away: [{ from: '2026-11-20', to: '2026-11-23', note: '수술' }, { from: 'x' }, { from: '2026-12-01' }], pin: ['성찬주', '성찬주', ''] },
  { id: 'b', name: '나나', roles: ['preach', 'offer', 'lead', 'busan'] }, { id: 'c', name: '다다', roles: ['preach', 'offer', 'lead', 'busan'] }] });
sc.eq('⑲ 부재 다듬기: 날짜 없는 것 버림 · 끝 없으면 하루 · 고정 표시 한 번씩', [J(rb.people[0].away), rb.people[0].pin], [[{ from: '2026-11-20', to: '2026-11-23', note: '수술' }, { from: '2026-12-01', to: '2026-12-01' }], ['성찬주']]);
sc.eq('⑲ 부재 · 고정이 없으면 칸도 없다 (예전 자료 그대로)', ['away' in rb.people[1], 'pin' in rb.people[1]], [false, false]);
A.put(rb, 'slots', { id: '2026-11-22|sun1|offer', who: ['a'] }, 'u', 1);
A.put(rb, 'marks', { id: 'm|2026-12-06', tags: ['성찬주'] }, 'u', 1);
A.put(rb, 'visits', { id: 'v|2026-12-06', who: ['a'] }, 'u', 1);
const rc = A.conflicts(rb, '2026-11-16', '2026-12-06', '');
sc.eq('⑲ 부재인 날 자리 = 빨강, 고정 조건 주의 부산 = 노랑', rc.filter(c => c.kind === 'away' || c.kind === 'pin').map(c => [c.level, c.kind, c.date]), [['bad', 'away', '2026-11-22'], ['warn', 'pin', '2026-12-06']]);
sc.eq('⑲ 글', rc.filter(c => c.kind === 'away' || c.kind === 'pin').map(c => A.conflictText(rb, c)), ['가가 — 11/22 부재(수술)인데 분당 1부 헌금인도', '가가 — 성찬주 주에는 분당에 있어야 하는데 부산 방문 (12/6)']);
sc.eq('⑲ 고르기 판: 부재가 먼저 보인다', A.pickNote(rb, 'a', '2026-11-21', 'offer'), { level: 'bad', text: '부재 · 수술' });
const rp = A.propose(A.normBook(Object.assign(J(rb), { visits: [] , slots: [] })), '2026-11');
sc.eq('⑲ 자동 배열: 부재인 주(11/22) 부산 · 그 날 분당 자리에 가가를 넣지 않는다', [rp.visits.find(v => v.date === '2026-11-22').pid !== 'a', rp.slots.filter(x => x.id.startsWith('2026-11-22') && x.pid === 'a').length], [true, 0]);
const rp2 = A.propose(A.normBook(Object.assign(J(rb), { visits: [], slots: [] })), '2026-12');
sc.eq('⑲ 자동 배열: 성찬주(12/6)에 분당 고정인 가가는 부산 후보에서 빠진다', rp2.visits.find(v => v.date === '2026-12-06').pid !== 'a', true);
const cb2 = A.normBook({ visits: [
  { id: 'v|2026-11-22', stay: [] }, { id: 'v|2026-11-29', stay: [{ status: 'done', name: '호텔 가', cancelBy: '2026-11-16', cancelAt: '18:00' }] },
  { id: 'v|2026-12-27', stay: [] }, { id: 'v|2026-11-08', stay: [] }] });
sc.eq('⑲ 챙길 것: 3주 안 숙소 미정 · 사흘 안 취소 기한 (지난 것 · 먼 것 빼고), 날짜순', J(A.chores(cb2, '2026-11-14').map(c => [c.kind, c.date])), [['cancel', '2026-11-16'], ['stay', '2026-11-22']]);
const src = A.normBook({ visits: [{ id: 'v|2026-11-08', stay: [{ kind: 'hotel', name: '호텔 가', status: 'done', cost: 80000, nights: 1, cancelBy: '2026-11-05', imgs: ['abc123def'] }, { name: '취소한 곳', status: 'cancel' }], travel: [{ dir: 'down', mode: 'KTX', time: '토 14:38' }], staff: '스텝', group: '청년셀' }] }).visits[0];
const dst = A.normBook({ visits: [{ id: 'v|2026-11-29', who: ['b'], days: '토일', note: '그대로', group: '희남셀' }] }).visits[0];
const cv = A.copyVisit(src, dst);
sc.eq('⑲ 복사: 숙소는 상태 미정으로(기한 · 사진 · 취소한 곳 빼고) · 교통 · 동행, 사람 · 날짜 · 메모 · 이미 적힌 모임은 그대로', [J(cv.stay), cv.travel[0].mode, cv.staff, cv.group, cv.who, cv.date, cv.note],
  [[{ kind: 'hotel', name: '호텔 가', status: '', cost: 80000, nights: 1, for: '' }], 'KTX', '스텝', '희남셀', ['b'], '2026-11-29', '그대로']);
const tb = A.normBook(null);
A.put(tb, 'people', { id: 'a', name: '가가', roles: [] }, 'u', 1); A.put(tb, 'people', { id: 'b', name: '나나', roles: [] }, 'u', 1);
for (const sv of ['sun1', 'sun2', 'sun3', 'll']) A.put(tb, 'slots', { id: '2026-11-01|' + sv + '|preach', txt: '담임목사님' }, 'u', 1);
A.put(tb, 'slots', { id: '2026-11-01|sun1|offer', who: ['a'] }, 'u', 1); A.put(tb, 'slots', { id: '2026-11-01|sun2|lead', who: ['b'] }, 'u', 1);
A.put(tb, 'visits', { id: 'v|2026-11-01', who: ['b'] }, 'u', 1); A.put(tb, 'slots', { id: '2026-11-06|fri|preach', who: ['a', 'b'] }, 'u', 1);
const tsv = A.sheetTSV(tb, '2026-11').split('\n');
sc.eq('⑲ 내보내기: 머리 · 첫 주 설교 줄(인도 · 부산 포함) · 헌금 줄', [tsv[1].split('\t').length, tsv[2], tsv[3]], [9, '11/1\t설교\t담임목사님\t담임목사님\t담임목사님\t담임목사님\t나나\t\t나나', '\t헌금인도\t가가\t\t\t\t\t\t']);
sc.eq('⑲ 내보내기: 금요 표 (여럿은 · 로, 부산 금요 이름)', tsv.find(r => r.startsWith('11/6\t')), '11/6\t가가 · 나나\t\t\tAWAKE');
const ps1 = A.personStats(Object.assign(A.normBook(J(rb)), {}), 'a', '2026-11-14');
sc.eq('⑲ 사람 한눈에: 다가오는 자리 · 앞으로의 부재', [ps1.next.map(r => r.date), ps1.away.length], [['2026-11-22', '2026-12-05'], 2]);

// ⑳ HB 3차 (지어낸 이름)
sc.eq('⑳ 금요 이름: 첫째 AWAKE · 둘째 REVIVED · 셋째 ENCOUNTER · 넷째 없음', ['2026-11-08', '2026-11-15', '2026-11-22', '2026-11-29'].map(A.friName), ['AWAKE', 'REVIVED', 'ENCOUNTER', '']);
sc.eq('⑳ 마지막 금요일', ['2026-11-27', '2026-11-20', '2026-10-30', '2026-11-29'].map(A.isLastFri), [true, false, true, false]);
sc.eq('⑳ WN 광고 칸은 마지막 금요일에만 (다른 금요일 칸은 버림)', A.normBook({ slots: [{ id: '2026-11-27|fri|notice' }, { id: '2026-11-20|fri|notice' }, { id: '2026-11-29|sun1|notice' }] }).slots.map(s => s.id), ['2026-11-27|fri|notice']);
const nb2 = A.normBook({ people: [{ id: 'p', name: '가가', roles: ['offer'] }, { id: 'q', name: '나나', roles: ['preach'] }] });
sc.eq('⑳ WN 광고는 헌금 맡는 분이', [A.canDo(nb2.people[0], 'fri', 'notice'), A.canDo(nb2.people[1], 'fri', 'notice')], [true, false]);
sc.eq('⑳ WN 광고 고르기 판 표시도 헌금 기준', [A.pickNote(nb2, 'p', '2026-11-27', 'notice'), A.pickNote(nb2, 'q', '2026-11-27', 'notice')], [null, { level: 'warn', text: "'헌금' 안 맡음" }]);
const fb = A.normBook(null);
A.put(fb, 'slots', { id: '2026-11-01|sun2|preach', txt: '담임목사님' }, 'u', 1); A.put(fb, 'slots', { id: '2026-11-01|sun3|preach', txt: '담임목사님' }, 'u', 1);
const fp = A.weekPlan(fb, '2026-11-01');
sc.eq('⑳ 설교 접기: 빈 칸(1부)이 있어도 나머지가 같으면 접는다', A.preachFold(fb, fp), true);
A.put(fb, 'slots', { id: '2026-11-01|ll|preach', txt: '초청 강사' }, 'u', 1);
sc.eq('⑳ 설교 접기: 다른 설교자가 있으면 안 접는다', A.preachFold(fb, A.weekPlan(fb, '2026-11-01')), false);
const tp = A.normBook({ people: [{ id: 'pastor', name: '담임 목사님', kind: 'other', roles: ['preach'], alias: ['목사님 (영상)', ''], email: ' Someone@Example.COM ' }, { id: 'x', name: '가가', roles: [], email: 'nope' }] });
sc.eq('⑳ 담임 · 초청 구분 · 다른 이름 · 계정 이메일(소문자, 모양 틀리면 버림)', [tp.people[0].kind, tp.people[0].alias, tp.people[0].email, 'email' in tp.people[1]], ['other', ['목사님 (영상)'], 'someone@example.com', false]);
for (const [id, txt] of [['2026-11-01|sun1|preach', '담임목사님'], ['2026-11-01|sun2|preach', '담임목사님(녹화)'], ['2026-11-01|sun3|preach', '담임목사님 / 가가 나나'], ['2026-11-06|fri|preach', '초청 강사'], ['2026-11-08|ll|preach', '목사님(영상)']]) A.put(tp, 'slots', { id, txt }, 'u', 1);
sc.eq('⑳ 글 → 사람: 옮길 칸 셈', A.countTextFor(tp, 'pastor'), 3);
sc.eq('⑳ 글 → 사람: 옮긴 수', A.textToPerson(tp, 'pastor', 'u', 5), 3);
sc.eq('⑳ 글 → 사람: 이름만이면 글 비움 · 괄호는 남김 · 다른 글이 붙은 칸 · 초청 강사는 그대로', A.live(tp.slots).map(s => [s.id.split('|')[1], s.who, s.txt]),
  [['sun1', ['pastor'], ''], ['sun2', ['pastor'], '(녹화)'], ['sun3', [], '담임목사님 / 가가 나나'], ['fri', [], '초청 강사'], ['ll', ['pastor'], '']]);
sc.eq('⑳ 글 → 사람: 두 번 해도 같다', A.textToPerson(tp, 'pastor', 'u', 6), 0);
const dl = A.normBook({ people: [{ id: 'a', name: '가가', roles: [] }, { id: 'b', name: '나나', roles: [] }],
  slots: [{ id: '2026-11-29|sun2|offer', who: ['b'] }, { id: '2026-11-29|sun1|offer', who: ['a'] }, { id: '2026-11-29|sun2|lead', who: ['a'] }, { id: '2026-11-27|fri|notice', who: ['b'] }, { id: '2026-11-27|fri|offer', who: ['a'] }],
  visits: [{ id: 'v|2026-11-29', who: ['b'], days: '금토일' }] });
sc.eq('⑳ 월 달력 줄: 헌금(주일은 예배마다, 시트 순서) · WN 광고도 헌금에', [A.dayLines(dl, '2026-11-29', 'offer').map(x => x.label + ' ' + x.text), A.dayLines(dl, '2026-11-27', 'offer').map(x => x.label + ' ' + x.text)], [['1부 가가', '2부 나나'], ['금요 가가', 'WN 나나']]);
sc.eq('⑳ 월 달력 줄: 예배인도 · 부산(머무는 날마다)', [A.dayLines(dl, '2026-11-29', 'lead').map(x => x.text), A.dayLines(dl, '2026-11-27', 'busan').map(x => x.text)], [['가가'], ['나나']]);
sc.eq('⑳ 금요 · 수요 표의 날: 그 달 안만 · 앞 · 뒤 주 펼치기', [A.weekdayRows('2026-11', 'fri', 0, 0), A.weekdayRows('2026-11', 'wed', 1, 1)], [['2026-11-06', '2026-11-13', '2026-11-20', '2026-11-27'], ['2026-10-28', '2026-11-04', '2026-11-11', '2026-11-18', '2026-11-25', '2026-12-02']]);

// ㉑ 칠할 칸 · 금요일에 부산에 있는 분
sc.eq('㉑ 오늘 = tdy, 뒤 엿새 안 = soon, 어제 · 이레 뒤 = 없음', ['2026-11-14', '2026-11-15', '2026-11-20', '2026-11-21', '2026-11-13'].map(d => A.nearCls(d, '2026-11-14')), ['tdy', 'soon', 'soon', '', '']);
sc.eq('㉑ 그 금요일에 부산에 있는 방문 (금토일 방문의 금요일)', [A.busanOn(vb, '2026-11-20').map(v => v.id), A.busanOn(vb, '2026-11-13').length], [['v|2026-11-22'], 0]);

// ㉒ 고르는 목록 (지어낸 이름)
const ob = A.normBook({ visits: [
  { id: 'v|2026-11-01', stay: [{ kind: 'hotel', name: '호텔 가', status: 'done' }, { kind: 'home', name: '가정 하나', status: 'ask' }], travel: [{ dir: 'down', mode: 'KTX' }], issues: [{ cat: '예배팀', text: '건반 없음' }, { cat: '', text: 'x' }, { cat: '시설', text: '' }] },
  { id: 'v|2026-11-08', stay: [{ kind: 'hotel', name: '호텔 가' }, { kind: 'hotel', name: '호텔 나' }, { kind: 'hotel', name: '취소한 곳', status: 'cancel' }] }] });
sc.eq('㉒ 특이사항: 갈래 · 글이 다 있는 것만', J(ob.visits[0].issues), [{ cat: '예배팀', text: '건반 없음' }]);
sc.eq('㉒ 특이사항이 없으면 칸도 없다 (예전 자료 그대로)', 'issues' in ob.visits[1], false);
sc.eq('㉒ 손대지 않은 목록은 기본값: 교통편 · 갈래', [A.optList(ob, 'mode').map(o => o.name), A.optList(ob, 'cat').length, ob.opts.length], [['KTX', '자차'], 10, 0]);
sc.eq('㉒ 숙소 기본값은 지금까지 적힌 이름(많이 쓴 순, 취소한 곳 빼고)', A.optList(ob, 'stay').map(o => o.kind + ':' + o.name), ['hotel:호텔 가', 'home:가정 하나', 'hotel:호텔 나']);
const o2 = J(ob); A.optAdd(o2, 'mode', 'SRT', null, 'u', 10);
sc.eq('㉒ 처음 더하면 기본값도 같이 적힌다 (정해진 id)', [A.optList(o2, 'mode').map(o => o.name), o2.opts.some(o => o.id === A.optId('mode', 'KTX'))], [['KTX', '자차', 'SRT'], true]);
sc.eq('㉒ 같은 이름을 또 더하면 그대로', [A.optAdd(o2, 'mode', 'SRT', null, 'u', 11) === A.optId('mode', 'SRT'), A.optList(o2, 'mode').length], [true, 3]);
A.optMove(o2, 'mode', A.optId('mode', 'SRT'), -1, 'u', 12);
sc.eq('㉒ 순서 바꾸기', A.optList(o2, 'mode').map(o => o.name), ['KTX', 'SRT', '자차']);
sc.eq('㉒ 맨 위를 더 올리면 아무 일 없음', A.optMove(o2, 'mode', A.optId('mode', 'KTX'), -1, 'u', 13), false);
A.drop(o2, 'opts', A.optId('mode', '자차'), 'u', 14);
sc.eq('㉒ 지우면 목록에서 빠지고(표지는 남음), 기본값으로 되살아나지 않는다', [A.optList(o2, 'mode').map(o => o.name), o2.opts.filter(o => o.type === 'mode').length], [['KTX', 'SRT'], 3]);
const o3 = J(ob); A.optAdd(o3, 'mode', '비행기', null, 'v', 9);   // 다른 기기가 따로 처음 손댐
const om = A.mergeBook(o2, o3);
sc.eq('㉒ 두 기기가 따로 처음 손대도 기본값은 한 줄씩 · 지운 것은 지워진 채 · 각자 더한 것은 다 남음', A.optList(om, 'mode').map(o => o.name).sort(), ['KTX', 'SRT', '비행기']);
const o4 = J(ob); A.ensureOpts(o4, 'stay', 'u', 20);
const idA = A.optId('stay', '호텔 가', 'hotel'), idB = A.optId('stay', '호텔 나', 'hotel');
sc.eq('㉒ 숙소 이름 · 평소 금액 고치기 → 지난 방문 기록 2건의 이름도 같이', [A.optEdit(o4, idA, { name: '호텔 가나다', cost: 95000 }, 'u', 21), o4.visits.map(v => v.stay[0].name), A.optList(o4, 'stay')[0].cost], [2, ['호텔 가나다', '호텔 가나다'], 95000]);
sc.eq('㉒ 합치기: 호텔 나 → 호텔 가나다 (기록 1건 바뀌고 목록에서 빠짐)', [A.optMerge(o4, idB, idA, 'u', 22), o4.visits[1].stay.map(x => x.name), A.optList(o4, 'stay').map(o => o.name)], [1, ['호텔 가나다', '호텔 가나다', '취소한 곳'], ['호텔 가나다', '가정 하나']]);
sc.eq('㉒ 목록에 없고 기록에만 있는 이름', A.strayStays(o4).map(x => x.name), ['취소한 곳']);
const o5 = J(ob); A.optAdd(o5, 'cat', '주차', null, 'u', 30); A.optEdit(o5, A.optId('cat', '예배팀'), { name: '찬양팀' }, 'u', 31);
sc.eq('㉒ 갈래 이름을 고치면 적힌 특이사항의 갈래도 같이', [o5.visits[0].issues[0].cat, A.optList(o5, 'cat').length], ['찬양팀', 11]);
sc.eq('㉒ 박수는 요일에서: 토일 1 · 금토일 2 · 금토일월 3 · 하루 1', ['', '금토일', '금토일월'].map(d => A.autoNights(V('2026-11-15', d))).concat(A.autoNights(V('2025-12-25', '목'))), [1, 2, 3, 1]);
const imp3 = { kind: 'rota-import', v: 3, visits: [{ date: '2026-11-01', names: [], stay: [{ kind: 'hotel', name: '호텔 정리됨', status: 'done' }] }], slots: [], marks: [], opts: [{ type: 'stay', name: '호텔 정리됨', kind: 'hotel', cost: 80000 }, { type: 'stay', name: '가정 하나', kind: 'home' }] };
const i1 = A.importBook(A.normBook({ visits: [{ id: 'v|2026-11-01', stay: [{ name: '호텔 2박 아무개' }], at: 2 }] }), imp3, 'u');
sc.eq('㉒ 가져오기 3판: 앞 판으로 들어온 방문의 숙소를 바로잡고 숙소 목록도 넣는다', [i1.book.visits[0].stay[0].name, A.optList(i1.book, 'stay').map(o => o.name + ':' + o.cost)], ['호텔 정리됨', ['호텔 정리됨:80000', '가정 하나:0']]);

// ⑧ 저장 자리 · 집 주소
sc.eq('⑧ 계정 문서는 rota/{uid}', /collection\('rota'\)\.doc\(u\.uid\)/.test(HTML) && /collection\('rota'\)\.doc\(FB\.user\.uid\)/.test(HTML), true);
sc.eq('⑧ users 는 부르지 않는다 · cellbook 은 AI 열쇠 읽기 한 곳뿐(R9)', [/collection\('users'\)/.test(HTML), (HTML.match(/collection\('cellbook'\)/g) || []).length, /collection\('cellbook'\)\.doc\(FB\.user\.uid\)\.get\(\)/.test(HTML)], [false, 1, true]);
sc.eq('⑧ 로그인 칸 이름은 rota (다른 앱 로그인과 섞이지 않게)', HTML.includes("firebase.initializeApp(FB_CFG, 'rota')"), true);
sc.eq('⑧ block7.my 로 열리면 sweeter.my/rotation/ 으로', HTML.includes("location.replace('https://sweeter.my/rotation/'"), true);
sc.eq('⑧ 버전 두 곳이 같다(2번째 줄 주석 · APP_VERSION)', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑧ 미리보기는 따로 저장 칸(rota_demo_v1) — 진짜 사본을 덮지 않는다', /DEMO \? 'rota_demo_v1' : 'rota_book_v1'/.test(HTML), true);
sc.eq('⑧ 가져오기 파일 칸은 메뉴 밖에 한 번만 (메뉴가 다시 그려져도 고른 파일을 잃지 않게, 11/14)', (HTML.match(/id="imp-file"/g) || []).length === 1 && !/renderMenu\(\)[\s\S]{0,1500}id="imp-file"/.test(HTML.split('function renderMenu')[1].slice(0, 1600)), true);
// 판 종류마다 그리는 함수가 다 있어야 한다 (11/14: 다시 쓰다 내보내기 함수를 빠뜨려 모든 판이 안 열렸다)
{ const m2 = HTML.match(/\{ (pick: panePick[^}]*)\}\[S\.pane\.kind\]/); const fns = m2 ? m2[1].split(',').map(x => x.split(':')[1].trim()) : ['?'];
  sc.eq('⑧ 판 그리는 함수가 모두 있다', fns.filter(f => !new RegExp('function ' + f + '\\(').test(HTML)), []); }
sc.eq('⑧ 페이지는 옆으로 움직이지 않는다 (아이폰 왼쪽 잘림 11/14) · 표 가로 스크롤은 막지 않는다(touch-action 없음)', /html\{overflow-x:hidden/.test(HTML) && /\.stage\{overflow:hidden/.test(HTML) && !/touch-action:pan-y/.test(HTML), true);

// ㉓ 함께 쓰기 (R6) — 지어낸 이름 · 이메일
{
  const T0 = 1000;
  const bk = A.normBook({
    people: [{ id: 'pa', name: '가나다', roles: ['preach'], email: 'Ga@Example.com', at: T0 }, { id: 'pb', name: '라마바', roles: [], email: 'ra@example.com', at: T0 },
      { id: 'pc', name: '사아자', roles: [], at: T0 }, { id: 'pd', name: '지운분', email: 'del@example.com', at: T0, del: true }],
    visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', note: '처음', stay: [{ kind: 'hotel', name: '첫 호텔', status: '' }], at: T0 },
      { id: 'v|2026-11-29', who: ['pb'], days: '토일', at: T0 }, { id: 'v|2026-12-06', who: ['pa', 'pb'], days: '토일', at: T0 }] });
  const hotel = (n) => [{ kind: 'hotel', name: n, status: 'done', cost: 90000 }];
  sc.eq('㉓ 들어올 이메일 = 사람 탭 계정 이메일(작은 글자 · 지운 분 · 이메일 없는 분 빼고)', A.teamOf(bk), ['ga@example.com', 'ra@example.com']);
  sc.eq('㉓ 로그인 이메일 → 그 사람 (대소문자 상관없이)', [A.personByEmail(bk, 'GA@example.com').id, A.personByEmail(bk, 'zz@example.com'), A.personByEmail(bk, '')], ['pa', null, null]);
  // 교역자 칸 다듬기
  const st = A.normStaff({ email: 'GA@example.com', at: 5, visits: { 'v|2026-11-22': { stay: hotel('새 호텔'), stayAt: 2000, who: ['pb'], note: '몰래' }, 'bad': { stay: [], stayAt: 9 }, 'v|2026-13-01': { stay: [], stayAt: 9 }, 'v|2026-11-29': { travel: [{ dir: 'down', mode: 'KTX' }] } }, away: [{ from: '2026-12-01', to: '2026-12-03', note: '수술' }], awayAt: 2100, role: 'owner' });
  sc.eq('㉓ 교역자 칸: 이메일은 작은 글자 · 모르는 칸(who · note · role) · 틀린 날짜 · 고친 때 없는 칸은 버린다', [st.email, Object.keys(st.visits), Object.keys(st.visits['v|2026-11-22']), st.away.length, st.role], ['ga@example.com', ['v|2026-11-22'], ['stay', 'stayAt'], 1, undefined]);
  sc.eq('㉓ 이메일이 없거나 틀린 칸은 통째로 버린다', [A.normStaff({ visits: {} }), A.normStaff({ email: 'nope' }), A.normStaff(null)], [null, null, null]);
  // 받아들이기
  const sA = { email: 'ga@example.com', visits: { 'v|2026-11-22': { stay: hotel('새 호텔'), stayAt: 2000 }, 'v|2026-11-29': { stay: hotel('남의 방문'), stayAt: 2000 } }, away: [{ from: '2026-12-01', to: '2026-12-03' }], awayAt: 2100 };
  const r1 = A.absorb(bk, [sA]);
  const v1 = r1.book.visits.find(v => v.id === 'v|2026-11-22');
  sc.eq('㉓ 자기가 든 방문의 숙소를 받는다 — 고친 때 · 누가(그 사람) · 줄 at 은 커진다', [v1.stay[0].name, v1.stayAt, v1.stayBy, v1.at > T0, v1.note], ['새 호텔', 2000, 'pa', true, '처음']);
  sc.eq('㉓ 자기가 안 든 방문은 받지 않는다', r1.book.visits.find(v => v.id === 'v|2026-11-29').stay, []);
  sc.eq('㉓ 자기 부재를 받는다', [r1.book.people.find(p => p.id === 'pa').away, r1.book.people.find(p => p.id === 'pa').awayBy], [[{ from: '2026-12-01', to: '2026-12-03' }], 'pa']);
  sc.eq('㉓ 넣은 책은 그대로 (새 책을 돌려준다)', bk.visits.find(v => v.id === 'v|2026-11-22').stay[0].name, '첫 호텔');
  sc.eq('㉓ 바뀐 줄 id', r1.changed.sort(), ['pa', 'v|2026-11-22']);
  const r1b = A.absorb(r1.book, [sA]);
  sc.eq('㉓ 두 번 받아도 같다(바뀐 줄 없음 · 책 같음)', [r1b.changed, JSON.stringify(r1b.book) === JSON.stringify(r1.book)], [[], true]);
  sc.eq('㉓ 사람 탭에서 이메일을 지우면 그 분 칸은 받지 않는다', A.absorb(A.normBook(Object.assign(J(bk), { people: bk.people.map(p => p.id === 'pa' ? Object.assign({}, p, { email: '' }) : p) })), [sA]).changed, []);
  sc.eq('㉓ 지운 분의 이메일로는 받지 않는다', A.absorb(bk, [{ email: 'del@example.com', away: [{ from: '2026-12-01' }], awayAt: 3000 }]).changed, []);
  // HB 가 나중에 숙소를 고쳤으면 HB 가 이긴다 / 메모만 고쳤으면 교역자 숙소는 그대로 받는다
  const hb1 = J(bk); hb1.visits[0] = Object.assign({}, hb1.visits[0], { stay: hotel('HB 호텔'), stayAt: 2500, at: 2500 });
  sc.eq('㉓ HB 가 그 뒤에 숙소를 고쳤으면 HB 것', A.absorb(A.normBook(hb1), [sA]).book.visits.find(v => v.id === 'v|2026-11-22').stay[0].name, 'HB 호텔');
  const hb2 = J(bk); hb2.visits[0] = Object.assign({}, hb2.visits[0], { note: 'HB 메모', at: 2500 });
  const r2 = A.absorb(A.normBook(hb2), [sA]).book.visits.find(v => v.id === 'v|2026-11-22');
  sc.eq('㉓ HB 가 그 뒤에 메모만 고쳤으면 메모는 HB · 숙소는 교역자 (줄 at 이 아니라 칸마다 고친 때)', [r2.note, r2.stay[0].name, r2.at > 2500], ['HB 메모', '새 호텔', true]);
  // 두 분이 함께 간 방문: 나중 것이 이기고 순서와 상관없다
  const sB = { email: 'ra@example.com', visits: { 'v|2026-12-06': { stay: hotel('라 호텔'), stayAt: 3000 } } };
  const sA2 = { email: 'ga@example.com', visits: { 'v|2026-12-06': { stay: hotel('가 호텔'), stayAt: 2900 }, 'v|2026-12-06x': {} } };
  const o1 = A.absorb(bk, [sA2, sB]).book, o2 = A.absorb(bk, [sB, sA2]).book;
  sc.eq('㉓ 함께 간 방문 — 나중에 적은 분 것 · 순서 상관없이 같은 책', [o1.visits.find(v => v.id === 'v|2026-12-06').stay[0].name, JSON.stringify(o1) === JSON.stringify(o2)], ['라 호텔', true]);
  // 두 HB 기기: A 는 받아들였고 B 는 모른 채 메모를 고쳤다 → 합치면 숙소가 밀렸다가, 다시 받아들이면 돌아온다
  const devA = r1.book, devB = A.normBook(J(bk)); devB.visits[0] = A.normBook({ visits: [Object.assign({}, devB.visits[0], { note: 'B 메모', at: v1.at + 5 })] }).visits[0];
  const merged = A.mergeBook(devA, devB), healed = A.absorb(merged, [sA]).book.visits.find(v => v.id === 'v|2026-11-22');
  sc.eq('㉓ 두 HB 기기가 엇갈려도 교역자 칸을 다시 받으면 숙소가 돌아온다(교역자 칸은 지우지 않으므로)', [healed.note, healed.stay[0].name], ['B 메모', '새 호텔']);
  // 교역자가 숙소를 다 지웠으면 빈 것으로
  sc.eq('㉓ 교역자가 나중에 비우면 빈 숙소', A.absorb(r1.book, [{ email: 'ga@example.com', visits: { 'v|2026-11-22': { stay: [], stayAt: 4000 } } }]).book.visits.find(v => v.id === 'v|2026-11-22').stay, []);
  // 맞추기 · 계정 칸에 고친 때가 남는다
  const rt = A.normBook(J(r1.book));
  sc.eq('㉓ 고친 때 · 누가 · 가능 일정은 다듬기를 지나도 남는다', [rt.visits.find(v => v.id === 'v|2026-11-22').stayAt, A.normBook({ people: [{ id: 'q', name: '하하', can: [{ from: '2026-12-20' }], canAt: 7, canBy: 'q' }] }).people[0].can], [2000, [{ from: '2026-12-20', to: '2026-12-20' }]]);
  // 교역자 앱이 쓰는 조각
  const pt = A.staffPatch('ga@example.com', 'stay', 'v|2026-11-22', hotel('조각'), 5000);
  sc.eq('㉓ 쓰는 조각 — 그 방문 · 그 칸만', pt, { email: 'ga@example.com', at: 5000, visits: { 'v|2026-11-22': { stay: hotel('조각'), stayAt: 5000 } } });
  const doc0 = { email: 'ga@example.com', visits: { 'v|2026-11-22': { travel: [{ dir: 'down', mode: 'KTX' }], travelAt: 10 }, 'v|2026-12-06': { stay: [], stayAt: 9 } }, away: [], awayAt: 3 };
  const doc1 = A.staffMerge(doc0, pt);
  sc.eq('㉓ 조각을 합쳐도 다른 방문 · 다른 칸은 그대로', [doc1.visits['v|2026-11-22'].travelAt, doc1.visits['v|2026-11-22'].stayAt, doc1.visits['v|2026-12-06'].stayAt, doc1.awayAt], [10, 5000, 9, 3]);
  // HB 가 고칠 때(put): 숙소 · 교통 · 부재가 바뀌면 그 칸의 고친 때가 지금, 다른 칸만 바뀌면 그대로
  { const b = A.normBook(J(r1.book)); const v = J(b.visits.find(x => x.id === 'v|2026-11-22'));
    A.put(b, 'visits', Object.assign({}, v, { note: '메모만' }), 'hb', 6000);
    const a1 = b.visits.find(x => x.id === 'v|2026-11-22');
    sc.eq('㉓ HB 가 메모만 고치면 숙소의 고친 때 · 누가는 그대로', [a1.stayAt, a1.stayBy, a1.at], [2000, 'pa', 6000]);
    A.put(b, 'visits', Object.assign({}, J(a1), { stay: hotel('HB 가 바꿈') }), 'hb', 7000);
    const a2 = b.visits.find(x => x.id === 'v|2026-11-22');
    sc.eq('㉓ HB 가 숙소를 고치면 숙소의 고친 때 = 지금, 누가 표시는 지움 · 교통은 그대로', [a2.stayAt, a2.stayBy, a2.travelAt], [7000, undefined, undefined]);
    sc.eq('㉓ … 그 뒤 예전 교역자 칸은 HB 것을 못 이긴다', A.absorb(b, [sA]).book.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, 'HB 가 바꿈');
    const p0 = J(b.people.find(x => x.id === 'pa')); A.put(b, 'people', Object.assign({}, p0, { away: [] }), 'hb', 8000);
    const p1 = b.people.find(x => x.id === 'pa');
    sc.eq('㉓ HB 가 부재를 지우면 부재의 고친 때 = 지금(교역자 예전 부재가 되살아나지 않음)', [p1.away, p1.awayAt, A.absorb(b, [sA]).changed], [undefined, 8000, []]);
    const nb = A.normBook({}); A.put(nb, 'visits', { id: 'v|2026-12-13', who: [], note: 'x' }, 'hb', 9000);
    sc.eq('㉓ 숙소 없는 새 방문은 고친 때를 두지 않는다', nb.visits[0].stayAt, undefined);
  }
  // 콘솔에 붙이는 덩어리(문서) = 에뮬레이터로 시험한 규칙(tests/rules/rota.rules)
  { const blk = (txt) => { const m = txt.match(/^[ \t]*\/\/ ── 교역자 로테이션\(rota\) — 여기서부터 ──[\s\S]*?^[ \t]*\/\/ ── 교역자 로테이션 — 여기까지 ──/m); return m ? m[0].split('\n').map(l => l.trim()).filter(Boolean).join('\n') : null; };
    const doc = blk(fs.readFileSync(path.join(__dirname, '..', 'docs', 'rotation', 'firestore-rules.md'), 'utf8')), rules = blk(fs.readFileSync(path.join(__dirname, 'rules', 'rota.rules'), 'utf8'));
    sc.eq('㉓ 문서의 규칙 덩어리 = 에뮬레이터로 시험한 규칙', [!!doc, doc === rules], [true, true]);
    sc.eq('㉓ 규칙: 교역자 칸에 넣을 수 있는 칸 = normStaff 가 읽는 칸 + 내 화면 취향(ui)', /hasOnly\(\['email', 'at', 'v', 'visits', 'away', 'awayAt', 'can', 'canAt', 'ui'\]\)/.test(rules || ''), true); }
  // 교역자 앱이 고친 방문 → 자기 칸에 쓸 것
  { const v0 = J(bk.visits.find(x => x.id === 'v|2026-11-22'));
    const v1 = Object.assign(J(v0), { stay: hotel('바꾼 호텔'), note: '몰래 메모', who: ['pb'] });
    sc.eq('㉓ 교역자가 고친 방문 → 숙소만 쓴다(메모 · 교역자는 버림)', A.staffEdits(v0, v1).map(x => [x.kind, x.val[0].name]), [['stay', '바꾼 호텔']]);
    sc.eq('㉓ 교통만 바꾸면 교통만', A.staffEdits(v0, Object.assign(J(v0), { travel: [{ dir: 'down', mode: 'KTX', time: '금 09:10', who: '' }] })).map(x => x.kind), ['travel']);
    sc.eq('㉓ 아무것도 안 바뀌면 없음 · 다른 방문이면 없음', [A.staffEdits(v0, J(v0)), A.staffEdits(v0, Object.assign(J(v0), { id: 'v|2026-11-29' }))], [[], []]);
  }
  // 교역자 화면은 HB 책에 쓰지 않는다 (실제 흐름은 tests/rules/rota.e2e.mjs)
  sc.eq('㉓ 계정에 쓰는 것은 주인(HB)만 · 교역자 화면은 이 기기 HB 칸에도 안 씀', [/function cloudSave\(\) \{\n  if \(DEMO \|\| !FB\.user \|\| !FB\.db \|\| FB\.role !== 'owner'\) return;/.test(HTML), /function saveBook\(\) \{\n  if \(isStaff\(\)\) return;/.test(HTML)], [true, true]);
  sc.eq('㉓ 교역자 누름은 한 곳에서 거른다(클릭 · 글자 칸)', [/if \(isStaff\(\) && !staffOk\(t, d\)\) return toast/.test(HTML), /if \(isStaff\(\) && !t\.closest\('#pane'\)\) return;/.test(HTML)], [true, true]);
  sc.eq('㉓ 교역자가 고친 방문은 자기 칸에만(staffEdits → staffWrite)', /if \(isStaff\(\)\) \{ if \(!myVisit\(v\)\) return toast\(staffNoMsg\(\)\); for \(const x of staffEdits\(v, next\)\) staffWrite/.test(HTML), true);
  sc.eq('㉓ 모르는 갈래는 조각을 만들지 않는다', A.staffPatch('ga@example.com', 'note', 'v|2026-11-22', 'x', 1), null);
}

// ㉔ 가능 일정 (R6c) — 지어낸 이름
{
  const mk = () => { const b = A.normBook(null);
    ['가가', '나나', '다다'].forEach((n, i) => A.put(b, 'people', { id: 'c' + i, name: n, roles: ['preach', 'offer', 'lead', 'busan'] }, 'u', 1));
    A.put(b, 'visits', { id: 'v|2026-10-04', who: ['c0'] }, 'u', 1); A.put(b, 'visits', { id: 'v|2026-10-11', who: ['c1'] }, 'u', 1); A.put(b, 'visits', { id: 'v|2026-10-18', who: ['c2'] }, 'u', 1);
    return b; };
  const b0 = mk(), p0 = A.propose(b0, '2026-11'), v0 = p0.visits.find(v => v.date === '2026-11-01');
  sc.eq('㉔ (기준) 가능 일정이 없으면 가장 오래 안 간 분(가가)', v0.pid, 'c0');
  const b1 = mk(); A.put(b1, 'people', Object.assign({}, b1.people.find(p => p.id === 'c1'), { can: [{ from: '2026-10-31', to: '2026-11-01', note: '이 주 좋아요' }] }), 'u', 2);
  const p1 = A.propose(b1, '2026-11'), v1 = p1.visits.find(v => v.date === '2026-11-01');
  sc.eq('㉔ 그 주 가능 일정을 적은 분(나나)이 먼저 · 이유 글에 표시', [v1.pid, /가능 일정 적음/.test(v1.why)], ['c1', true]);
  sc.eq('㉔ 고르기 판에 \'가능 일정 · 까닭\'(초록)', [A.canOn(b1, 'c1', '2026-11-01').note, (A.pickNote(b1, 'c1', '2026-11-01', 'offer', ['sun1']) || {}).level, (A.pickNote(b1, 'c1', '2026-11-01', 'offer', ['sun1']) || {}).text], ['이 주 좋아요', 'ok', '가능 일정 · 이 주 좋아요']);
  sc.eq('㉔ 부재가 가능 일정보다 먼저(같은 날이면 빨강)', (() => { const b = mk(); A.put(b, 'people', Object.assign({}, b.people.find(p => p.id === 'c1'), { can: [{ from: '2026-11-01' }], away: [{ from: '2026-11-01' }] }), 'u', 2); return A.pickNote(b, 'c1', '2026-11-01', 'offer', ['sun1']).level; })(), 'bad');
  const b2 = mk(); A.put(b2, 'visits', { id: 'v|2026-10-25', who: ['c1'] }, 'u', 1);
  A.put(b2, 'people', Object.assign({}, b2.people.find(p => p.id === 'c1'), { can: [{ from: '2026-11-01' }] }), 'u', 2);
  sc.eq('㉔ 바로 앞 주에 다녀왔으면 가능 일정이 있어도 두 주 연속은 피한다', A.propose(b2, '2026-11').visits.find(v => v.date === '2026-11-01').pid !== 'c1', true);
  const b3 = mk(); A.put(b3, 'people', Object.assign({}, b3.people.find(p => p.id === 'c2'), { can: [{ from: '2026-11-04' }] }), 'u', 2);
  const s3 = Object.fromEntries(A.propose(b3, '2026-11').slots.map(s => [s.id, s.pid]));
  sc.eq('㉔ 분당 자리도 그 날 가능 일정을 적은 분이 먼저(11/4 수요 설교)', s3['2026-11-04|wed|preach'], 'c2');
}

// ㉕ 내 일정 (R8b) — 지어낸 이름. 오늘 = 2026-11-15(주일)
{
  const mk = () => { const b = A.normBook(null);
    A.put(b, 'people', { id: 'a', name: '가가', roles: ['preach', 'offer', 'lead', 'busan'], email: 'ga@example.com', away: [{ from: '2026-12-24', to: '2026-12-26', note: '휴가' }] }, 'u', 1);
    A.put(b, 'people', { id: 'b', name: '나나', roles: ['preach', 'offer', 'lead', 'busan'] }, 'u', 1);
    A.put(b, 'slots', { id: '2026-11-08|sun1|offer', who: ['a'] }, 'u', 1);   // 지난 것
    A.put(b, 'slots', { id: '2026-11-15|ll|offer', who: ['a'] }, 'u', 1);     // 오늘
    A.put(b, 'slots', { id: '2026-11-18|wed|preach', who: ['a'] }, 'u', 1);   // 다음 차례
    for (const sv of ['sun1', 'sun3']) A.put(b, 'slots', { id: '2026-11-22|' + sv + '|offer', who: ['a'] }, 'u', 1);
    A.put(b, 'visits', { id: 'v|2026-11-29', who: ['a', 'b'], days: '금토일', fri: true, stay: [{ kind: 'hotel', name: '호텔 나', status: 'done', cancelBy: '2026-11-25' }], travel: [{ dir: 'down', mode: 'KTX', time: '금 09:10' }] }, 'u', 1);
    A.put(b, 'slots', { id: '2026-12-11|fri|offer', who: ['a'] }, 'u', 1);
    A.put(b, 'slots', { id: '2026-12-13|ll|lead', who: ['a'] }, 'u', 1);
    A.put(b, 'visits', { id: 'v|2027-01-03', who: ['a'], days: '금토일', fri: true }, 'u', 1);   // 3주 밖 부산
    A.put(b, 'slots', { id: '2027-01-17|sun2|preach', who: ['a'] }, 'u', 1);   // 8주 밖
    return b; };
  const b = mk(), ah = A.myAhead(b, 'a', '2026-11-15', 8);
  sc.eq('㉕ 8주 창 = 이번 주 주일부터 8주(1/9 토)', [ah.from, ah.to], ['2026-11-15', '2027-01-09']);
  sc.eq('㉕ 오늘 것 · 다음 차례(오늘 뒤 가장 가까운 분당 자리)', [ah.todays.map(r => r.id), ah.next.id], [['2026-11-15|ll|offer'], '2026-11-18|wed|preach']);
  sc.eq('㉕ 가까운 부산 = 3주 안에 떠나는 방문(머무는 첫날 11/27)', [ah.trip.id, ah.trip.date, ah.trip.end], ['v|2026-11-29', '2026-11-27', '2026-11-29']);
  sc.eq('㉕ 그다음: 오늘 · 다음 차례 · 가까운 부산은 빼고 날짜순 — 3주 밖 부산은 줄로 남는다 · 지난 것 · 8주 밖은 없음', ah.rest.map(r => r.id), ['2026-11-22|sun1|offer', '2026-12-11|fri|offer', '2026-12-13|ll|lead', 'v|2027-01-03']);
  sc.eq('㉕ 8주 횟수(같은 날 주일 예배는 한 번)', ah.tally, { preach: 1, offer: 3, lead: 1, busan: 2 });
  sc.eq('㉕ 지금 머무는 방문도 가까운 부산', A.myAhead(b, 'a', '2026-11-28', 8).trip.id, 'v|2026-11-29');
  sc.eq('㉕ 맡은 것이 없는 분: 모두 비고 횟수 0', (x => [x.todays, x.next, x.trip, x.rest, x.tally.offer])(A.myAhead(b, 'b', '2026-12-06', 8)), [[], null, null, [], 0]);
  sc.eq('㉕ 날 수 세기', [A.dayGap('2026-11-15', '2026-11-18'), A.dayGap('2026-12-30', '2027-01-02'), A.dayGap('2026-11-15', '2026-11-15')], [3, 3, 0]);
  const wk = A.myWeeks(b, 'a', '2026-11-15', 8);
  sc.eq('㉕ 한 줄이 한 주: 여덟 줄 · 주일마다', wk.map(w => w.sun), ['2026-11-15', '2026-11-22', '2026-11-29', '2026-12-06', '2026-12-13', '2026-12-20', '2026-12-27', '2027-01-03']);
  sc.eq('㉕ 11/15 주: 주일 헌금 · 수요 설교', [wk[0].sunItems.map(r => r.role), wk[0].mid.map(r => r.id), wk[0].fri, wk[0].bs], [['offer'], ['2026-11-18|wed|preach'], [], []]);
  sc.eq('㉕ 주를 넘는 부산(금토 + 다음 주일): 떠나는 주에 적고 다음 주에는 이어짐(cont)', [wk[1].bs.map(x => [x.id, x.cont]), wk[2].bs.map(x => [x.id, x.cont])], [[['v|2026-11-29', false]], [['v|2026-11-29', true]]]);
  sc.eq('㉕ 금요 · 예배인도 · 내가 적은 부재는 그 주 줄에', [wk[3].fri.map(r => r.id), wk[4].sunItems.map(r => r.role), wk[5].away.map(a => a.note), wk[4].away], [['2026-12-11|fri|offer'], ['lead'], ['휴가'], []]);
  const tc = A.tripChecks(b, b.visits.find(v => v.id === 'v|2026-11-29'), 'a'), by = Object.fromEntries(tc.items.map(x => [x.key, x]));
  sc.eq('㉕ 부산 준비: 숙소 됨(취소 기한) · 내려감 됨 · 올라옴 아직 · 넷째 금요일은 금요 이름 없음 · 겹침 없음', [by.stay.state, by.stay.cancelBy, by.down.state, by.down.text, by.up.state, 'fri' in by, by.clash.state, 'staff' in by], ['done', '2026-11-25', 'done', 'KTX 금 09:10', 'todo', false, 'done', false]);
  sc.eq('㉕ 부산 준비 셈: 알림은 빼고 넷 가운데 셋', [tc.done, tc.total], [3, 4]);
  const b2 = mk(); A.put(b2, 'slots', { id: '2026-11-29|sun2|offer', who: ['a'] }, 'u', 2); A.put(b2, 'marks', { id: 'm|2026-11-29', tags: ['극동방송'] }, 'u', 2);
  const tc2 = A.tripChecks(b2, b2.visits.find(v => v.id === 'v|2026-11-29'), 'a'), by2 = Object.fromEntries(tc2.items.map(x => [x.key, x]));
  sc.eq('㉕ 부산에 있는 날 분당 자리 = 겹침(빨강) · 극동방송 주에 동행이 비면 아직', [by2.clash.state, by2.clash.slots, by2.staff.state, tc2.done, tc2.total], ['bad', ['2026-11-29|sun2|offer'], 'todo', 2, 5]);
  sc.eq('㉕ 숙소가 없거나 대화 중이면 아직 · 첫째 금요일 = AWAKE(알림만) · 부재인 날이면 겹침', (() => { const v = b.visits.find(x => x.id === 'v|2027-01-03'); const x = A.tripChecks(b, v, 'a').items; const c = mk(); A.put(c, 'visits', { id: 'v|2026-12-27', who: ['a'], days: '토일', stay: [{ name: '댁', kind: 'home', status: 'ask' }] }, 'u', 3);
    const y = Object.fromEntries(A.tripChecks(c, c.visits.find(q => q.id === 'v|2026-12-27'), 'a').items.map(q => [q.key, q])); return [x[0].state, x.find(q => q.key === 'fri').state + ' ' + x.find(q => q.key === 'fri').text, y.stay.state, y.stay.open, y.clash.state, y.clash.away]; })(), ['todo', 'info AWAKE', 'todo', true, 'bad', '2026-12-26']);
  // 내 화면 취향
  sc.eq('㉕ 처음 값: HB = 마지막에 본 화면 · 교역자 = 내 일정 · 이름은 굵게 + 노랑', [A.normUi(null), A.normUi(null, true)], [{ home: 'last', name: { b: true, c: '', h: 'yellow' }, at: 0 }, { home: 'month:mine', name: { b: true, c: '', h: 'yellow' }, at: 0 }]);
  sc.eq('㉕ 모르는 화면 · 색은 버린다 · 굵게 끔 · 음영 없음은 그대로 남는다', A.normUi({ home: 'nowhere', name: { b: 0, c: 'neon', h: '' }, at: 9, extra: 1 }), { home: 'last', name: { b: false, c: '', h: '' }, at: 9 });
  sc.eq('㉕ 교역자에게 없는 화면(사람 탭)은 내 일정으로', [A.normUi({ home: 'people' }, true).home, A.normUi({ home: 'people' }).home], ['month:mine', 'people']);
  sc.eq('㉕ 첫 화면 → 탭 · 보기 (마지막에 본 화면은 손대지 않음)', [A.homeTo('last'), A.homeTo('week'), A.homeTo('month:mine'), A.homeTo('busan'), A.homeTo('x')], [null, { tab: 'week' }, { tab: 'month', mview: 'mine' }, { tab: 'busan' }, null]);
  sc.eq('㉕ 고를 수 있는 첫 화면은 탭 · 보기 이름 그대로', [A.HOMES.filter(h => h.startsWith('month:')).map(h => h.slice(6)).every(k => new RegExp('\\n  ' + k + ': \\{ name:').test(HTML)), A.HOMES.length], [true, 10]);
  const pt = A.staffPatch('ga@example.com', 'ui', '', { home: 'busan', name: { b: true, c: 'blue', h: '' } }, 7000);
  sc.eq('㉕ 교역자가 쓰는 조각 — ui 한 칸(고친 때 포함)', pt, { email: 'ga@example.com', at: 7000, ui: { home: 'busan', name: { b: true, c: 'blue', h: '' }, at: 7000 } });
  sc.eq('㉕ ⚠️ 책에는 섞이지 않는다 — 받아들이기는 ui 를 읽지 않고(바뀐 줄 없음), 교역자 칸 다듬기에도 없다', [A.absorb(b, [pt]).changed, 'ui' in A.normStaff(pt), JSON.stringify(A.absorb(b, [pt]).book) === JSON.stringify(A.normBook(b))], [[], false, true]);
  sc.eq('㉕ 조각을 합쳐도 숙소 · 부재는 그대로', (d => [d.awayAt, d.ui.home])(A.staffMerge({ email: 'ga@example.com', away: [], awayAt: 5 }, pt)), [5, 'busan']);
  sc.eq('㉕ 내 이름 자리: 여러 번 · 앞뒤가 한글이면(다른 이름의 일부) 건너뜀 · 가운뎃점 · 빈칸 · 괄호 옆은 찾음', [A.nameSpans('가가 · 나나 / 가가', '가가'), A.nameSpans('가가다 · 다가가 · (가가)', '가가'), A.nameSpans('가가', ''), A.nameSpans('', '가가')], [[[0, 2], [10, 12]], [[13, 15]], [], []]);
  sc.eq('㉕ HB 의 ui 는 책 밖 맨 위 칸에 · 교역자는 자기 칸에(거절돼도 이 기기엔 남음)', [/\.doc\(FB\.user\.uid\)\.set\(\{ ui: UI_OF\(\) \}, \{ merge: true \}\)/.test(HTML), /staffPatch\(FB\.user\.email, 'ui', '', UI_OF\(\), Date\.now\(\)\)/.test(HTML)], [true, true]);
  sc.eq('㉕ 사람 알약: 열 때마다 내가 먼저(이 기기에 기억한 사람보다 앞)', /function mePerson\(ps\) \{ return ps\.find\(p => p\.id === S\.mine\) \|\| ps\.find\(p => p\.id === selfPid\(\)\) \|\| ps\.find\(p => p\.id === PREF\.me\) \|\| ps\[0\]; \}/.test(HTML), true);
}

// ㉖ 예약 읽기 (R9) — 지어낸 숙소 이름
{
  const P = A.parseBookings;
  sc.eq('㉖ 울타리 · 앞말이 붙어도 배열만 읽는다', P('여기 있습니다\n```json\n[{"hotel":"바다 호텔","checkIn":"2026-11-27","checkOut":"2026-11-29","total":"₩180,000","currency":"krw","ref":12345}]\n```').map(b => [b.hotel, b.checkIn, b.checkOut, b.total, b.currency, b.ref]), [['바다 호텔', '2026-11-27', '2026-11-29', 180000, 'KRW', '12345']]);
  sc.eq('㉖ 객체 하나 · 점 날짜 · 빈 답 · 깨진 답', [P('{"hotel":"언덕 스테이","checkIn":"2026.12.04"}')[0].checkIn, P('[]'), P('예약 없음'), P('[{"hotel":"","checkIn":""}]')], ['2026-12-04', [], [], []]);
  sc.eq('㉖ 체크아웃이 체크인보다 앞이면 버림 · 환불 불가면 기한 지움 · 시각 두 자리', (b => [b.checkOut, b.cancelBy, b.nofree])(A.normBooking({ hotel: 'x', checkIn: '2026-11-27', checkOut: '2026-11-26', cancelBy: '2026-11-20', nofree: true })).concat(A.normBooking({ hotel: 'x', checkIn: '2026-11-27', cancelBy: '2026-11-20', cancelAt: '9:00' }).cancelAt), ['', '', true, '09:00']);
  sc.eq('㉖ 박수 = 체크인 ~ 체크아웃', [A.bookingNights({ checkIn: '2026-11-27', checkOut: '2026-11-29' }), A.bookingNights({ checkIn: '2026-11-27', checkOut: '' })], [2, 0]);

  const b = A.normBook({ people: [{ id: 'a', name: '가가', roles: ['busan'] }], visits: [
    { id: 'v|2026-11-29', who: ['a'], days: '금토일', stay: [{ kind: 'hotel', name: '바다 호텔', ref: 'R-1', status: 'done' }] },
    { id: 'v|2026-12-13', who: ['a'], days: '토일', stay: [] }] });
  const V = (ci) => (A.bookingVisit(b, { checkIn: ci }) || {}).id || null;
  sc.eq('㉖ 맞는 방문: 머무는 날 안 · 첫날 하루 전 · 밖이면 없음', [V('2026-11-27'), V('2026-11-28'), V('2026-12-11'), V('2026-12-12'), V('2026-12-01'), V('')], ['v|2026-11-29', 'v|2026-11-29', 'v|2026-12-13', 'v|2026-12-13', null, null]);
  sc.eq('㉖ 예약번호 저장(다듬기에서 살아남음) · 이미 넣은 예약', [b.visits[0].stay[0].ref, A.bookingSeen(b, { ref: 'R-1' }), A.bookingSeen(b, { ref: 'R-2' }), A.bookingSeen(b, { ref: '' })], ['R-1', true, false, false]);

  const list = [{ kind: 'hotel', name: '바다 호텔' }, { kind: 'hotel', name: '언덕스테이 해변점' }, { kind: 'home', name: '어느 댁' }];
  const d0 = { kind: 'home', name: '', status: '', cost: 0, nights: 1, for: '남', imgs: ['iabcdef1'] };
  const bk = A.normBooking({ hotel: 'Hotel 바다', checkIn: '2026-11-27', checkOut: '2026-11-29', total: 180000, currency: 'KRW', ref: 'R-9', cancelBy: '2026-11-24', cancelAt: '23:59' });
  const d1 = A.bookingToDraft(d0, bk, list);
  sc.eq('㉖ 초안: 목록의 같은 숙소 이름으로 · 호텔 · 박 · 금액 · 예약 완료 · 기한 · 예약번호 · 누가 · 사진은 그대로', [d1.kind, d1.name, d1._new, d1.nights, d1.cost, d1.status, d1.cancelBy, d1.cancelAt, d1.ref, d1.for, d1.imgs], ['hotel', '바다 호텔', false, 2, 180000, 'done', '2026-11-24', '23:59', 'R-9', '남', ['iabcdef1']]);
  sc.eq('㉖ 원래 초안은 그대로(복사본에 채움)', [d0.kind, d0.name], ['home', '']);
  const d2 = A.bookingToDraft(Object.assign({}, d0, { cost: 50000, cancelBy: '2026-11-01' }), A.normBooking({ hotel: '처음 보는 숙소', checkIn: '2026-11-27', total: 120, currency: 'USD', nofree: true, cancelled: true }), list);
  sc.eq('㉖ 목록에 없으면 새 호텔 · 원화가 아니면 금액 그대로 · 환불 불가 · 취소됨', [d2.name, d2._new, d2.cost, d2.nofree, d2.cancelBy, d2.status], ['처음 보는 숙소', true, 50000, true, undefined, 'cancel']);
  sc.eq('㉖ 띄어쓰기 · 덧말이 달라도 목록 이름과 맞춘다', A.bookingToDraft(d0, A.normBooking({ hotel: '언덕 스테이 해변점 (부산)', checkIn: '2026-11-27' }), list).name, '언덕스테이 해변점');
  sc.eq('㉖ 한 줄 알림', [A.bookingLine(bk), A.bookingLine(A.normBooking({ hotel: 'x', checkIn: '2026-11-27', total: 120, currency: 'USD', cancelled: true }))], ['Hotel 바다 · 11/27~11/29 · 180,000원', 'x · 11/27 · USD 120 · 취소됨']);
  sc.eq('㉖ AI 에 보낼 말: JSON 배열 · 짐작 금지 · 사진/메일 갈림', [/JSON 배열/.test(A.bookingPrompt('img')), /짐작해서 채우지 말 것/.test(A.bookingPrompt('mail')), /메일/.test(A.bookingPrompt('mail')), /그림/.test(A.bookingPrompt('img'))], [true, true, true, true]);
  sc.eq('㉖ ⚠️ 읽은 것은 초안에만 — 책을 고치는 저장(visitApply · saveBook)을 부르지 않는다', (() => { const f = HTML.slice(HTML.indexOf('function fillStay('), HTML.indexOf('async function readStayImg(')); return [f.length > 50, /visitApply|saveBook|cloudSave/.test(f)]; })(), [true, false]);
  sc.eq('㉖ 열쇠: 셀 inside 사본 → 계정 cellbook 읽기만(쓰지 않음) · 교역자는 안 됨', [/lsGet\('cell_ai_key', ''\)/.test(HTML), /collection\('cellbook'\)\.doc\(FB\.user\.uid\)\.get\(\)/.test(HTML), /collection\('cellbook'\)[^;]*\.(set|update|delete)\(/.test(HTML), /function aiCan\(\) \{ return DEMO \|\| \(!!FB\.user && !isStaff\(\)\); \}/.test(HTML)], [true, true, false, true]);
}

// ㉗ 메일에서 찾기 (R9b) — 지어낸 숙소 · 메일
{
  sc.eq('㉗ 찾는 말: 아고다 · 트립닷컴 · 1년', [/agoda\.com/.test(A.MAIL_Q), /trip\.com/.test(A.MAIL_Q), /newer_than:365d/.test(A.MAIL_Q)], [true, true, true]);
  sc.eq('㉗ HTML → 글: 스타일 · 태그 빼고 줄 나눔 · 글자 표시 풀기', A.htmlText('<style>.x{}</style><div>바다&nbsp;호텔</div><table><tr><td>체크인</td><td>2026-11-27</td></tr></table>A &amp; B').replace(/\n+/g, '\n'), '바다 호텔\n체크인 2026-11-27\nA & B');
  const c = A.mailClean('예약자 hb@example.com 연락처 010-1234-5678 / +82 51 123 4567\n체크인 2026-11-27 예약번호 1234567890 https://x.example/a?b=1');
  sc.eq('㉗ 다듬기: 메일 주소 · 전화 · 링크 지움, 날짜 · 예약번호는 남김', [/@/.test(c), /1234-5678/.test(c), /123 4567/.test(c), /https/.test(c), /2026-11-27/.test(c), /1234567890/.test(c)], [false, false, false, false, true, true]);
  sc.eq('㉗ 길이 상한', A.mailClean('가'.repeat(9000)).length, 5000);
  sc.eq('㉗ 메일 번호를 함께 받게 묻는다', /"mail": 그 메일 번호/.test(A.mailPrompt()), true);
  const mails = [
    { at: 100, b: [{ hotel: '바다 호텔', checkIn: '2026-11-27', checkOut: '2026-11-29', ref: 'R1', total: 180000 }] },
    { at: 300, b: [{ hotel: '바다 호텔', checkIn: '2026-11-27', checkOut: '2026-11-29', ref: 'R1', cancelled: true }] },
    { at: 200, b: [{ hotel: '언덕 스테이', checkIn: '2026-12-11', ref: '' }, { hotel: '언덕스테이', checkIn: '2026-12-11', total: 90000 }, { hotel: '', checkIn: '' }] },
    { at: 50, b: [{ hotel: '옛 호텔', checkIn: '2026-10-01', ref: 'OLD' }] }];
  const bk = A.mailBookings(mails);
  sc.eq('㉗ 같은 예약번호는 나중 메일이 이김(예약 → 취소) · 번호 없으면 숙소 + 체크인으로 하나 · 빈 예약 버림 · 체크인 순', bk.map(b => [b.hotel, b.ref, b.cancelled]), [['옛 호텔', 'OLD', false], ['바다 호텔', 'R1', true], ['언덕스테이', '', false]]);
  sc.eq('㉗ 메일 순서가 바뀌어도 같은 답', JSON.stringify(A.mailBookings(mails.slice().reverse())) === JSON.stringify(bk), true);
  const b = A.normBook({ people: [{ id: 'a', name: '가가', roles: ['busan'] }], visits: [
    { id: 'v|2026-11-29', who: ['a'], days: '금토일', stay: [{ kind: 'home', name: '어느 댁' }, { kind: 'hotel', name: '바다 호텔', status: 'ask' }] },
    { id: 'v|2026-12-13', who: ['a'], days: '금토일', stay: [{ kind: 'hotel', name: '언덕스테이', status: 'done', ref: 'Q9' }] }] });
  const rows = A.mailRows(b, bk, '2026-11-15');
  sc.eq('㉗ 화면 줄: 이레 넘게 지난 예약은 뺌 · 맞는 방문 · 들어 있음', rows.map(r => [r.bk.hotel, (r.visit || {}).id || null, r.seen]), [['바다 호텔', 'v|2026-11-29', false], ['언덕스테이', 'v|2026-12-13', false]]);
  sc.eq('㉗ 넣을 자리: 같은 예약번호 → 예약 완료 아닌 호텔 줄 → 새 줄', [A.mailSlot(b.visits[0], { ref: 'R1' }), A.mailSlot(b.visits[1], { ref: 'Q9' }), A.mailSlot(b.visits[1], { ref: 'Z' })], [1, 0, -1]);
  sc.eq('㉗ ⚠️ 넣기는 초안까지 — mailPut 은 저장을 부르지 않는다', (() => { const f = HTML.slice(HTML.indexOf('function mailPut('), HTML.indexOf('async function mailConnect(')); return [f.length > 50, /fillStay\(/.test(f), /visitApply|saveBook|cloudSave/.test(f)]; })(), [true, true, false]);
  sc.eq('㉗ 메일은 이 기기에 저장하지 않는다 — 기억하는 것은 메일 id 별 뽑은 예약(at · b)뿐', /cache\[g\.id\] = \{ at: \+g\.internalDate \|\| 0, b: got\.filter/.test(HTML), true);
  sc.eq('㉗ 옛 서버면(mail 을 안 돌려줌) 연결 화면으로 보내지 않는다', /if \(!j\.mail\) return toast\(/.test(HTML), true);

  const src = fs.readFileSync(path.join(__dirname, '..', 'gcal-functions', 'src', 'index.js'), 'utf8');
  const MS = new Function(src.match(/^const MAIL_SCOPES = .*$/m)[0].replace('const MAIL_SCOPES =', 'return'))();
  const okRet = new Function(src.match(/^const okRet = .*$/m)[0].replace('const okRet =', 'return'))();
  sc.eq('㉗ 서버: 메일 권한은 읽기만(gmail.readonly) — 보내기 · 지우기 · 전체 권한 없음', [MS.includes('https://www.googleapis.com/auth/gmail.readonly'), MS.some(x => /gmail\.(send|modify|compose)|mail\.google\.com/.test(x)), MS.some(x => /calendar|drive/.test(x))], [true, false, false]);
  sc.eq('㉗ 서버: 메일 열쇠는 따로(gmailTokens) · 캘린더 권한과 합치지 않음(include_granted_scopes 빼기)', [/mail \? "gmailTokens" : "gcalTokens"/.test(src), /\.\.\.\(mail \? \{\} : \{ include_granted_scopes: "true" \}\)/.test(src), /set\(\{ uid, ret, mail, exp/.test(src), /tokDoc\(s\.uid, s\.mail === true\)/.test(src)], [true, true, true, true]);
  sc.eq('㉗ 서버: 돌아갈 자리 — 로테이션 · 심방 노트 · BLOCK7 만', ['https://sweeter.my/rotation/', 'https://sweeter.my/care/', 'https://block7.my/', 'https://sweeter.my/', 'https://sweeter.my/cell/', 'https://sweeter.my.evil.com/rotation/'].map(okRet), [true, true, true, false, false, false]);
}

sc.done();
