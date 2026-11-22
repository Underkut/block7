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
//  ㉘ 부산 인도(R11): 머무는 날과 따로 · 기본 비움 · 옛 칸 옮겨 읽기
//  ㉙ 부산 인도 세 갈래(R12 A): 금요 · 주일 · LL 마다 교역자 / 성도(이름) / 중계 · 성도 인도자 겹침 · b9 · 낡은 앱(b8)과 합치기 · 방문 창
//  ㉛ 부산 상영 계정 저장(R12 C4b): 주일 줄 shows · b10 · 낡은 앱(b9)과 합치기 · 교역자는 자기 방문 줄에(absorb) · 경고(금 · 토 · 주일 · 읽은 광고 기준) · 경고 자리
//  ㉜ 인도 싣기 · 내보내기 새 판(R12 B): 칸 글(교역자 / 성도 이름 / 중계) · 시트 내보내기 · 부산 요약 · 내 일정(성도 인도자 줄) · 보기마다 글 배열 · CSV · 화면 자리
//  ㉞ 부산 요약 칸 누르기 · 동행 / 모임 나눔(1116-2 B): 칸 → 고칠 판 · 동행 = 성도 인도자 잇기 · 모임 셋 · 옛 글 옮겨 읽기 · b11 · 교역자도 모임(absorb)
//  ㉟ 숙소 판(1116-2 C): 호텔 / 성도님 댁 상태 · 옛 값 옮겨 읽기 · b12 · 숙소 쓰는 사람(동행 있을 때만) · 댁은 취소 기한 없음 · 알약 끌어 순서(optReorder)
//  ㊲ 특별예배(1116-2 D): 부산 일정 이름 · 더한 예배(날짜 · 때 · 이름 · 인도) · 범위 밖 버림 · 날짜순 · 인도 알약 · 성도 인도자 겹침 · 두 주 연속 빼기 ·
//     주일 광고 · 상영은 주일에 머무는 일정만 · 교역자 인도 날 저절로 머무는 날 · 내 일정 · 내보내기 · b13 · 교역자는 못 씀 · 화면 용어
//  ㊴ 이번 주 표(C) 분당 판 축 바꿈(1117-G): 줄 = 설교 · 헌금 · 인도, 칸 = 예배(부산 띠와 같은 결)
//  ㊳ 분당 특별예배(1116-2 E): specs 한 줄 · 자리 '날짜|xk|역할' · 그 날 정해진 예배 쉼 · 부산 겹침 · 내 일정 · 시트 내보내기 · 지우면 자리도 · b14 · 화면
//  ㊵ 숙소 금액 · 취소 기한은 HB 전용(1117-Z 1): 교역자 화면 책에서 걷어 냄 · 교역자 칸의 값은 안 받음(이미 든 값은 그대로) · 교역자는 못 고침 · HB 화면은 그대로
//  (60) 구글 자료 계정에 두기(1121-G G2): 지문(칸 차례 무관) · 다듬기 · 올릴지(같음 · 비면 · 절반 넘게 줄면 멈춤 · 그래도) · 고른 파일 · 한 시간
//  (61) 구글 자료 화면(1121-G G3 · G3b): 한 부산 주(월 ~ 주일) 예배 순서 · 카드 한 줄 · 내 이름(같은 이름 둘은 안 이음) · 월간 예배팀(빈 줄 숨김 · 중계 접기) · 예배위원 · 사람별 횟수(HB 만)
//  (62) 시트와 맞춰 보기(1121-G G4): 부산 교역자(예배팀 교역자 · 예배위원 광고 ↔ who) · 금요 인도 · 주일 · LL 중계 ↔ lead / 이름 맞추기 / 반영은 누를 때만 · 한 칸만 / 넘기기 열쇠 / 알림 판 한 줄(HB 만)
//  (59) 구글 자료(1121-G G1): 탭 이름 · 맨 뒤 판 · 합친 칸 펴기 · 날짜(해 넘김 · 특별예배 글) · 예배팀 / 예배위원 시트 읽기(글자로 찾기 · 판교중계 = 중계 · 옆 표 안 읽음) · 두 달 합치기 · 읽기만
//  ㊶ 알림 판(1117-Z 2): 두 달 안의 미정을 갈래(급함 · 부산 · 분당 · 확인)로 · 취소 기한 7일(오늘 포함) · 예약 완료 호텔만(댁 · 취소 · 예약 전 빼고) ·
//     두 달 경계 · 숙소 미정 기준 하나 · 부산 일정 없는 주일 · 상영은 받은 주일만 · 빈 자리 묶기 · 줄마다 갈 곳 · 교역자에게 판 없음
//  ㊷ 교역자 판 · 주보 담당(1117-Z 2c): 교역자 판 = 겹침 · 확인 + 자기 부산 일정 교통편 · 상영만 · 주보 담당 한 달씩 ㄱㄴㄷ · 그 달만 직접 · 주보 담당의 상영 고르기 받음 · b15
//  ㊸ 알림 판 기간(1117-Z 2b): 처음 값(부산 8주 · 분당 20일까지 이번 달 / 21일부터 다음 달) · 주 · 달 규칙 · 날짜(지나면 처음 값) · 갈래마다 끝날 · 겹침은 긴 쪽 · 내 프리셋 · ui 안 al(책 밖)
//  ㊹ 낡은 앱과 핑퐁 없음(같으면 안 씀) · 판 목록 스크롤 지킴 · 포커스 다시 그리기는 글자 칸만 · 넓은 화면 기둥 자리(1117-Z 2 고침)
//  ㊼ 부산 광고 판(1117-Z 4): 전달용 텍스트 — 고친 글은 책 adtx(공통) · ↻ = 지우기 표지 · 교역자 칸 tx → absorb(상영 고르는 사람만) · b16 · 아래 줄 · 날짜 칸 한 줄
//  ㊽ 숙소 목록 손잡이 · '더 보기' 줄(1117-Z 5): optReorder 가 OPT_MORE 를 받아 more 표시 · b17 · 달력표 꺾쇠 · 부산 목록 줄(날짜 아래 이름 · 인도 알약 · 빨간 특이사항 · 오른쪽 숙소)
//  ㊾ 메모 중요 · 일반(1117-Z 5b): hot = 빨강(목록 · 표) · note = 판 안만 · b18 · 부산 요약 특이사항 칸 · 분당 주일 꺾쇠 · 꺾쇠 삼등분 자리
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
  stayPeriod, dayS, stayWhole, visitLeads, normLead, leadOf, leadIs, leadOpen, leadDate, LEAD_SVC, myAhead, myWeeks, tripChecks, normUi, homeTo, nameSpans, HOMES, dayGap, stayDates, busyOn, conflicts, conflictText, levelMap, wkeysOf, sameWkeys, worshipOn, worshipClash, pickNote, countRole, setSlot, weekVisits, defaultDays, canDo, pickDoc, importBook, personIdFor, svcShown, sortDays, dayChoices, weekLabel, propose, applyProposal, weekTags, myItems, dayItems, visitSun, weekFriName, weekStays, nearCls, busanOn, optList, optAdd, optMove, optEdit, optMerge, optId, ensureOpts, strayStays, autoNights, teamOf, normStaff, absorb, staffPatch, staffMerge, personByEmail, staffEdits, canOn, awayOn, pinOn, chores, copyVisit, sheetTSV, personStats, friName, isLastFri, preachFold, textToPerson, countTextFor, dayLines, weekdayRows, bookingPrompt, normBooking, parseBookings, bookingNights, bookingVisit, bookingSeen, bookingToDraft, bookingLine, normStay, MAIL_Q, htmlText, mailClean, mailPrompt, mailBookings, mailRows, mailSlot, normAds, adsText, adsRep, adsRich, adsLinkLabel, adsByDay, ADS_NOGROUP, showId, normShow, showOf, bsWarnSun, leadCell, leadsAt, leadLine, tsvOf, csvOf, sheetRows, exportRows, itemLabel, mineRange,
  normVisit, normMeet, MEET_K, MEET_G, meetText, mateText, mateLink, linkMates, colTarget, STAFF_COLS, OLD_FIELDS, WRITE_FIELD,
  STAY_ST, stayStOf, stayStName, STAY_FOR, stayForAsk, stayHotel, optReorder, OPT_MORE, normOpt, optList, optId,
  normEvs, evFixDays, evDates, vSun, titleGuess, evNameChips, evLine, TITLE_CHIPS,
  normSpec, specOf, specsIn, restOn, slotLabelB, dropSpec, nextSpecK, specId, isSpec,
  STAY_PRIV, stayPub, stayKeep, hidePriv,
  adtxId, normAdtx, adtxOf, adtxPick, adtxClean, ADTX_MAX,
  alertsOf, alertEnd, cancelSoon, dDay, ddText, ALERT_CATS, CANCEL_DAYS, colTarget: colTarget,
  normBul, bulId, bulOf, bulOrder, monthDiff,
  AL_DEF, AL_PRESETS, normAlC, normAl, alCfg, alEnd, alLabel, monthEndOf, weekWindow, soonText,
  GS_SRC, GS_RELAY, gsTabInfo, gsPickTabs, gsFill, gsDate, gsDateRest, gsSvc, gsNames, gsReadTeam, gsReadServe, gsRead, gsJoin, gsCount, gsLine, gsDemo, gsCanon, gsHash, gsPack, gsUnpack, gsSaveCheck, gsSrcNorm, gsSrcPick, gsStale, GS_STALE_MS,
  gsWeek, gsMain, gsSum, gsKeys, gsMine, gsModes, gsMonthTeam, gsMonthServe, gsPeople, GS_NOCOUNT, HOMES,
  gsWhoMap, gsPid, gsDiff, gsFix, gsSkipNorm, GS_SKIP_MAX };`, ctx);
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
sc.eq('③ 아무것도 아닌 것 → 빈 책', J(A.normBook(null)), { v: 1, at: 0, people: [], slots: [], visits: [], marks: [], opts: [], shows: [], specs: [], buls: [], adtx: [] });

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
sc.eq('⑨ 요일 글 (1116-2 A): 하루만 주일 · 묶을 땐 일', [A.dayS('일'), A.dayS('토일'), A.dayS('금토일'), A.dayS('금')], ['주일', '토일', '금토일', '금']);
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
const d1 = A.pickDoc(full, { b11: J(full), b10: stripped, b9: stripped, b8: stripped, b7: stripped, b6: stripped, b5: stripped, b4: stripped, b3: stripped, b2: stripped, book: stripped });
sc.eq('⑬ 낡은 앱이 옛 칸(book ~ b10)을 떨군 채 써도 b11 과 합쳐 모두 남고, 옛 칸을 치우려 한 번 쓴다', [d1.book.visits.length, d1.book.people[0].no, d1.push], [2, ['sun1|preach'], true]);
const d1b = A.pickDoc(full, { b18: J(full) });
sc.eq('⑬ 지금 칸(b16 — 1117-Z 4)만 있고 같으면 다시 쓰지 않는다(핑퐁 없음)', d1b.push, false);
const d2 = A.pickDoc(null, { book: J(full) });
sc.eq('⑬ R1 때 자료(book 만) → 빈 기기에서도 그대로 읽고 b10 으로 옮겨 쓴다', [d2.book.visits.length, d2.push], [2, true]);
const d2b = A.pickDoc(null, { b2: J(full) });
sc.eq('⑬ R2~ 자료(b2 만) → 그대로 읽고 b10 으로 옮겨 쓴다', [d2b.book.visits.length, d2b.book.people[0].no, d2b.push], [2, ['sun1|preach'], true]);
const old2 = J(stripped); old2.people.push({ id: 'y', name: '나나', roles: [], at: 9 });
const d3 = A.pickDoc(full, { b9: old2, b10: J(full) });
sc.eq('⑬ 낡은 앱(b9)에서 새로 적은 줄도 받아 b10 으로 올린다', [d3.book.people.map(p => p.id), d3.push], [['x', 'y'], true]);
sc.eq('⑬ 빈 문서 · 빈 기기 → 아무것도 안 씀', A.pickDoc(null, {}).push, false);
sc.eq('⑬ 쓰는 칸은 WRITE_FIELD 하나, 옛 칸은 지운다', /\[WRITE_FIELD\]: S\.book/.test(HTML) && /FieldValue\.delete\(\)/.test(HTML) && !/\.set\(\{ (book|b2|b3):/.test(HTML) && /WRITE_FIELD = 'b18'/.test(HTML) && /OLD_FIELDS = \[[^\]]*'b16', 'b17'\]/.test(HTML), true);

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
sc.eq('⑭ 방문의 숙소 · 머무는 날 · 금요 · 메모도 들어온다', (v => [v.days, v.lead && v.lead.fri.m, v.stay[0].name, v.stay[0].cost, A.mateText(ir.book, v), v.note])(ir.book.visits.find(v => v.id === 'v|2026-11-15')), ['금토일', 'staff', '호텔 가', 80000, '스텝', '메모']);
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
const edited = J(v1); A.put(edited, 'visits', Object.assign({}, edited.visits.find(v => v.id === 'v|2026-11-15'), { mates: [{ n: 'HB 가 고침' }] }), 'u', 900);
sc.eq('⑯ 앱에서 고친 방문은 2판이 덮지 않는다', A.importBook(edited, imp2, 'u').book.visits.find(v => v.id === 'v|2026-11-15').mates[0].n, 'HB 가 고침');
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
sc.eq('⑲ 글', rc.filter(c => c.kind === 'away' || c.kind === 'pin').map(c => A.conflictText(rb, c)), ['가가 — 11/22 부재(수술)인데 분당 1부 헌금인도', '가가 — 성찬주 주에는 분당에 있어야 하는데 부산 일정 (12/6)']);
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
sc.eq('⑲ 복사: 숙소는 상태 미정으로(기한 · 사진 · 취소한 곳 빼고) · 교통 · 동행, 사람 · 날짜 · 메모 · 이미 적힌 모임은 그대로', [J(cv.stay), cv.travel[0].mode, J(cv.mates), J(cv.meet), cv.who, cv.date, cv.note],
  [[{ kind: 'hotel', name: '호텔 가', status: '', cost: 80000, nights: 1, for: '' }], 'KTX', [{ n: '스텝' }], { k: 'dept', g: '기타', memo: '희남셀' }, ['b'], '2026-11-29', '그대로']);
const tb = A.normBook(null);
A.put(tb, 'people', { id: 'a', name: '가가', roles: [] }, 'u', 1); A.put(tb, 'people', { id: 'b', name: '나나', roles: [] }, 'u', 1);
for (const sv of ['sun1', 'sun2', 'sun3', 'll']) A.put(tb, 'slots', { id: '2026-11-01|' + sv + '|preach', txt: '담임목사님' }, 'u', 1);
A.put(tb, 'slots', { id: '2026-11-01|sun1|offer', who: ['a'] }, 'u', 1); A.put(tb, 'slots', { id: '2026-11-01|sun2|lead', who: ['b'] }, 'u', 1);
A.put(tb, 'visits', { id: 'v|2026-11-01', who: ['b'] }, 'u', 1); A.put(tb, 'slots', { id: '2026-11-06|fri|preach', who: ['a', 'b'] }, 'u', 1);
const tsv = A.sheetTSV(tb, '2026-11').split('\n');
sc.eq('⑲ 내보내기: 머리 · 첫 주 설교 줄(인도 · 부산 포함) · 헌금 줄', [tsv[1].split('\t').length, tsv[2], tsv[3]], [11, '11/1\t설교\t담임목사님\t담임목사님\t담임목사님\t담임목사님\t나나\t\t나나\t\t', '\t헌금인도\t가가\t\t\t\t\t\t\t\t']);
sc.eq('⑲ 내보내기: 금요 표 (여럿은 · 로, 부산 금요 이름)', tsv.find(r => r.startsWith('11/6\t')), '11/6\t가가 · 나나\t\t\tAWAKE\t');
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
  sc.eq('㉓ 쓰는 조각 — 그 방문 · 그 칸만 (금액은 싣지 않음 — 1117-Z 1)', pt, { email: 'ga@example.com', at: 5000, visits: { 'v|2026-11-22': { stay: [{ kind: 'hotel', name: '조각', status: 'done', cost: 0 }], stayAt: 5000 } } });
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
  sc.eq('㉕ 고를 수 있는 첫 화면은 탭 · 보기 이름 그대로', [A.HOMES.filter(h => h.startsWith('month:')).map(h => h.slice(6)).every(k => new RegExp('\\n  ' + k + ': \\{ name:').test(HTML)), A.HOMES.length], [true, 12]);   // 1121-G G3b: 부산 예배팀 · 예배위원 더함
  const pt = A.staffPatch('ga@example.com', 'ui', '', { home: 'busan', name: { b: true, c: 'blue', h: '' } }, 7000);
  sc.eq('㉕ 교역자가 쓰는 조각 — ui 한 칸(고친 때 포함)', pt, { email: 'ga@example.com', at: 7000, ui: { home: 'busan', name: { b: true, c: 'blue', h: '' }, at: 7000 } });
  sc.eq('㉕ ⚠️ 책에는 섞이지 않는다 — 받아들이기는 ui 를 읽지 않고(바뀐 줄 없음), 교역자 칸 다듬기에도 없다', [A.absorb(b, [pt]).changed, 'ui' in A.normStaff(pt), JSON.stringify(A.absorb(b, [pt]).book) === JSON.stringify(A.normBook(b))], [[], false, true]);
  sc.eq('㉕ 조각을 합쳐도 숙소 · 부재는 그대로', (d => [d.awayAt, d.ui.home])(A.staffMerge({ email: 'ga@example.com', away: [], awayAt: 5 }, pt)), [5, 'busan']);
  sc.eq('㉕ 내 이름 자리: 여러 번 · 앞뒤가 한글이면(다른 이름의 일부) 건너뜀 · 가운뎃점 · 빈칸 · 괄호 옆은 찾음', [A.nameSpans('가가 · 나나 / 가가', '가가'), A.nameSpans('가가다 · 다가가 · (가가)', '가가'), A.nameSpans('가가', ''), A.nameSpans('', '가가')], [[[0, 2], [10, 12]], [[13, 15]], [], []]);
  sc.eq('㉕ HB 의 ui 는 책 밖 맨 위 칸에 · 교역자는 자기 칸에(거절돼도 이 기기엔 남음)', [/\.doc\(FB\.user\.uid\)\.set\(\{ ui: UI_OF\(\) \}, \{ mergeFields: \['ui'\] \}\)/.test(HTML), /staffPatch\(FB\.user\.email, 'ui', '', UI_OF\(\), Date\.now\(\)\)/.test(HTML)], [true, true]);
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

// ㉘ 부산에서 무엇을 인도하나 (R11, HB 11/16) — 머무는 날과 인도는 따로다. 기본값은 비움. (R12 A 부터 모양은 lead 하나 — 옛 칸은 읽을 때 옮김)
{
  const NV = (o) => A.normBook({ visits: [Object.assign({ id: 'v|2026-11-22', days: '금토일', at: 1 }, o)] }).visits[0];
  const v0 = NV({});
  sc.eq('㉘ 기본은 비움 — 인도 칸이 없다(옛 방문도 그대로 같은 모양) · 옛 칸 이름도 남지 않음', ['lead' in v0, 'fri' in v0, 'sunLead' in v0, 'sunLay' in v0, 'll' in v0], [false, false, false, false, false]);
  const v1 = NV({ fri: true, sunLead: 'staff', ll: true });
  sc.eq('㉘ 옛 칸(R11 · b8) 교역자 금요 · 주일 · LL → lead 세 칸 교역자로 옮겨 읽음 · 옛 칸 이름은 버림', [v1.lead, 'fri' in v1, 'sunLead' in v1, 'll' in v1], [{ fri: { m: 'staff' }, sun: { m: 'staff' }, ll: { m: 'staff' } }, false, false, false]);
  const v2 = NV({ sunLead: 'lay', sunLay: 'pl' }), v3 = NV({ sunLead: 'staff', sunLay: 'pl' }), v4 = NV({ sunLead: '아무거나', ll: 'yes' });
  sc.eq('㉘ 옛 칸: 주일예배 성도 인도자(그분 id) · 교역자면 성도 id 를 버림 · 모르는 값은 비움', [v2.lead, v3.lead, v4.lead], [{ sun: { m: 'lay', p: 'pl' } }, { sun: { m: 'staff' } }, { ll: { m: 'staff' } }]);
  const nb = A.normBook({ people: [{ id: 'pl', name: '오세움', kind: 'lay', roles: [] }], visits: [] });
  sc.eq('㉘ 맡은 것 알약 — 금요 이름 · 주일 · LL (그 금요가 금1~3 일 때만 금요 이름)',
    [A.visitLeads(nb, NV({ fri: true, sunLead: 'staff', ll: true })).map(x => x.k + ':' + x.text),
     A.visitLeads(nb, NV({ sunLead: 'lay', sunLay: 'pl' })).map(x => x.k + ':' + x.text),
     A.visitLeads(nb, NV({ sunLead: 'lay' })).map(x => x.k + ':' + x.text),
     A.visitLeads(nb, NV({})).length],
    [['fri:ENCOUNTER 인도', 'sun:주일예배 인도', 'll:LL 인도'], ['lay:주일예배 · 오세움'], ['lay:주일예배 · 성도 인도자'], 0]);
  sc.eq('㉘ 금요일에 머물지 않으면 교역자 금요 인도는 없다 · 주일에 머물지 않으면 교역자 주일 · LL 도 없다',
    [A.visitLeads(nb, NV({ days: '토일', fri: true })).length, A.visitLeads(nb, A.normBook({ visits: [{ id: 'v|2026-11-18', days: '수', sunLead: 'staff', ll: true, at: 1 }] }).visits[0]).length], [0, 0]);
  const pb = A.normBook({ people: [{ id: 'a', name: '가', roles: ['busan'] }], visits: [] });
  const pp = A.propose(pb, '2026-11'), pw = A.applyProposal(J(pb), pp, 'u', 5);
  sc.eq('㉘ 자동 배열 제안 · 적용도 인도를 비워 둔다(머무는 날은 금토일 그대로)', [pp.visits.some(v => v.fri || v.lead), A.live(pb.visits).concat(A.live((pw && pw.book || pb).visits)).some(v => v.lead), pp.visits.filter(v => v.days === '금토일').length > 0], [false, false, true]);
  sc.eq('㉘ 새 방문을 만들 때 인도는 비움', /put\(S\.book, 'visits', Object\.assign\(\{ id, who: \[\], days: [^}]*'' \}, tt \? \{ title: tt \} : \{\}\), byNow\(\)/.test(HTML), true);
}

// ㉙ 부산 인도 세 갈래 (R12 A, HB 11/16) — 금요 · 주일예배 · 라이프라인 모두 '교역자 / 성도(이름) / 중계(인도자 없음)' 중 하나, 기본 비움
{
  const NV = (o, id, days) => A.normBook({ visits: [Object.assign({ id: id || 'v|2026-11-22', days: days || '금토일', at: 1 }, o)] }).visits[0];
  const ppl = [{ id: 'pl', name: '오세움', kind: 'lay', roles: ['lead'] }, { id: 'pm', name: '하로운', kind: 'lay', roles: ['lead'] }, { id: 'a', name: '가', roles: ['busan', 'offer'] }];
  const nb = A.normBook({ people: ppl, visits: [] });
  const all = NV({ lead: { fri: { m: 'lay', p: 'pm' }, sun: { m: 'relay' }, ll: { m: 'lay', p: 'pl' } } });
  sc.eq('㉙ 세 갈래 모두 받는다 — 금요 성도 · 주일 중계 · LL 성도', all.lead, { fri: { m: 'lay', p: 'pm' }, sun: { m: 'relay' }, ll: { m: 'lay', p: 'pl' } });
  const bad = NV({ lead: { fri: { m: 'boss' }, sun: { m: 'relay', p: 'pl' }, ll: 'staff', tue: { m: 'staff' } } });
  sc.eq('㉙ 다듬기: 모르는 갈래 · 모르는 예배 · 모양이 틀린 칸은 버림 · 중계 · 교역자에는 성도 id 가 붙지 않음', bad.lead, { sun: { m: 'relay' } });
  sc.eq('㉙ lead 가 있으면 옛 칸은 보지 않는다(옮긴 뒤 다시 섞이지 않게)', NV({ lead: { sun: { m: 'relay' } }, fri: true, ll: true }).lead, { sun: { m: 'relay' } });
  sc.eq('㉙ 빈 lead 는 칸 자체가 없다', 'lead' in NV({ lead: { fri: null } }), false);
  sc.eq('㉙ 알약 — 성도는 그분 이름, 중계는 \'중계\'(무채색 · 테두리)',
    A.visitLeads(nb, all).map(x => [x.k, x.svc, x.m, x.p, x.date, x.text].join('|')),
    ['lay|fri|lay|pm|2026-11-20|ENCOUNTER · 하로운', 'relay|sun|relay||2026-11-22|주일예배 중계', 'lay|ll|lay|pl|2026-11-22|LL · 오세움']);
  // 교역자가 토요일에 올라와도 주일은 중계 · 성도 인도로 적을 수 있다 — 교역자 인도만 머무는 날을 본다
  const sat = NV({ lead: { fri: { m: 'staff' }, sun: { m: 'relay' }, ll: { m: 'lay', p: 'pl' } } }, 'v|2026-11-22', '금토');
  sc.eq('㉙ 주일에 머물지 않아도 주일 중계 · LL 성도는 보인다(교역자 몫이 아님)', A.visitLeads(nb, sat).map(x => x.k), ['fri', 'relay', 'lay']);
  const sat2 = NV({ lead: { sun: { m: 'staff' } } }, 'v|2026-11-22', '금토');
  sc.eq('㉙ 주일에 머물지 않는데 교역자 주일 인도 = 안 보임(옛 자료)', A.visitLeads(nb, sat2).length, 0);
  sc.eq('㉙ 금4 · 금5 주에는 부산 금요예배가 없다 — 금요 인도는 어느 갈래든 안 보임',
    A.visitLeads(nb, NV({ lead: { fri: { m: 'relay' } } }, 'v|2026-11-29', '금토일')).length, 0);
  sc.eq('㉙ 방문의 요일 범위 밖(수요 방문의 다음 주일)은 받지 않는다',
    [A.leadOpen(NV({}, 'v|2026-11-18', '수'), 'sun'), A.leadOpen(NV({}, 'v|2026-11-22'), 'sun'), A.leadOpen(NV({}, 'v|2026-11-22'), 'fri'), A.leadOpen(NV({}, 'v|2026-11-29'), 'fri')], [false, true, true, false]);
  sc.eq('㉙ 인도 날짜 — 금요 = 방문 주일 이틀 전, 주일 · LL = 방문 주일', [A.leadDate(all, 'fri'), A.leadDate(all, 'sun'), A.leadDate(all, 'll')], ['2026-11-20', '2026-11-22', '2026-11-22']);
  sc.eq('㉙ leadIs · leadOf', [A.leadIs(all, 'sun', 'relay'), A.leadIs(all, 'sun', 'staff'), A.leadOf(all, 'fri').p, A.leadOf(NV({}), 'fri')], [true, false, 'pm', null]);
  // 성도 인도자가 그 날 부산 예배를 인도하는데 분당 자리도 맡으면 빨강
  const cb = A.normBook({ people: ppl, visits: [all], slots: [{ id: '2026-11-22|ll|lead', who: ['pl'], at: 1 }, { id: '2026-11-22|sun2|lead', who: ['pm'], at: 1 }] });
  const cs = A.conflicts(cb, '2026-11-15', '2026-11-28', '2026-11-16').filter(c => c.lead);
  sc.eq('㉙ 겹침: 부산 LL 성도 인도자가 분당 LL 인도도 맡음 = 빨강 한 건(다른 날 · 다른 분은 아님)', cs.map(c => [c.level, c.pid, c.slot, c.lead]), [['bad', 'pl', '2026-11-22|ll|lead', 'll']]);
  sc.eq('㉙ 겹침 글', A.conflictText(cb, cs[0]), '오세움 — 11/22(주일) 부산 라이프라인 인도인데 분당 LL 예배인도');
  sc.eq('㉙ 중계 · 교역자 인도는 이 겹침을 만들지 않는다(교역자는 머무는 날 겹침으로 이미 본다)',
    A.conflicts(A.normBook({ people: ppl, visits: [NV({ lead: { sun: { m: 'relay' }, ll: { m: 'staff' } } })], slots: [{ id: '2026-11-22|ll|lead', who: ['pl'], at: 1 }] }), '2026-11-15', '2026-11-28', '2026-11-16').filter(c => c.lead).length, 0);
  // 맞추기: 나중에 고친 인도가 이긴다 · 낡은 앱(b8)이 lead 를 모른 채 다른 방문을 고쳐 써도 lead 는 남는다
  const nw = A.normBook({ people: ppl, visits: [Object.assign(J(all), { at: 5 }), { id: 'v|2026-11-29', days: '토일', at: 5 }] });
  const ol = J(nw); delete ol.visits[0].lead; ol.visits[0].fri = true; ol.visits[0].at = 5; ol.visits[1].note = '낡은 앱이 고침'; ol.visits[1].at = 9;
  const pk = A.pickDoc(null, { b10: J(nw), b8: ol });
  sc.eq('㉙ 낡은 앱(b8)과 합쳐도 새 칸(b10)의 세 갈래는 그대로 · 낡은 앱이 고친 다른 방문도 받음 · 옛 칸을 치우려 한 번 씀',
    [pk.book.visits[0].lead, pk.book.visits[1].note, pk.push], [all.lead, '낡은 앱이 고침', true]);
  const late = J(nw); late.visits[0].lead = { sun: { m: 'staff' } }; late.visits[0].at = 7;
  sc.eq('㉙ 다른 기기가 나중에 인도를 고치면 그쪽이 이긴다(어느 순서로 합쳐도)', [A.mergeBook(nw, late).visits[0].lead, A.mergeBook(late, nw).visits[0].lead], [{ sun: { m: 'staff' } }, { sun: { m: 'staff' } }]);
  sc.eq('㉙ R11 자료(b8 만, 옛 칸) → 그대로 옮겨 읽고 b10 으로 쓴다',
    (r => [r.book.visits[0].lead, r.push])(A.pickDoc(null, { b8: { visits: [{ id: 'v|2026-11-22', days: '금토일', fri: true, sunLead: 'lay', sunLay: 'pl', ll: true, at: 3 }] } })),
    [{ fri: { m: 'staff' }, sun: { m: 'lay', p: 'pl' }, ll: { m: 'staff' } }, true]);
  // 가져오기 파일(시트의 금n 칸 = fri: true)도 같은 길로 옮겨진다
  const ir = A.importBook(A.normBook({}), { kind: 'rota-import', v: 3, visits: [{ date: '2026-11-22', names: ['가'], days: '금토일', fri: true }] }, 'hb');
  sc.eq('㉙ 시트 기록 가져오기의 금요 표시 → 교역자 금요 인도', ir && ir.book.visits[0].lead, { fri: { m: 'staff' } });
  sc.eq('㉙ 부산 준비: 교역자 금요 인도만 금요예배 이름을 알림(성도 · 중계는 아님)',
    [A.tripChecks(nb, NV({ lead: { fri: { m: 'staff' } } }), 'a').items.some(x => x.key === 'fri'), A.tripChecks(nb, all, 'a').items.some(x => x.key === 'fri')], [true, false]);
  // 화면: 방문 창에 세 예배 × 세 갈래 단추 · 성도 이름 고르기 · 저장할 때 옛 칸을 쓰지 않음
  sc.eq('㉙ 방문 창: 세 갈래 단추(data-dlead) · 성도 이름(data-dlay · data-lp) · 옛 단추(dfri · dsun · dll) 없음',
    [/data-dlead="\$\{svc\}" data-v="\$\{m\}"/.test(HTML), /data-dlay="\$\{svc\}" data-lp=/.test(HTML), /data-act="dfri"|data-dsun=|data-act="dll"/.test(HTML)], [true, true, false]);
  sc.eq('㉙ 저장: lead 하나만 쓰고 옛 칸(fri · sunLead · sunLay · ll)은 지움 · 교역자 인도는 그 요일에 머물 때만', /for \(const k of \['fri', 'sunLead', 'sunLay', 'll'\]\) delete x\[k\]/.test(HTML) && /m === 'staff' && !d\.days\.includes\(LEAD_DAY\[k\]\)/.test(HTML), true);
  sc.eq('㉙ 중계 알약 무채색(테두리) · 교역자 인도 단추는 예배 색', /\.lchip\.relay\{/.test(HTML) && /\{ fri: 'frib', sun: 'sunb', ll: 'llb' \}\[svc\]/.test(HTML), true);
}


// ㉚ 부산 주일 광고 (R12 C) — Monday 는 서버만 읽는다 · 카톡 글 모양 · 교역자는 보기 · 복사만 (지어낸 제목만)
{
  const o = { sun: '2026-11-22', busan: { found: true, group: '26-1122', spoken: [{ n: 3, title: '겨울 수련회' }, { n: 1, title: '새벽 기도회' }], video: ['감사 영상'], check: ['꽃꽂이 모집'] },
    video: [{ title: '가을 음악회 안내', url: 'https://youtu.be/AAA', notes: [{ at: '2026-11-20', text: '부산은 짧은 버전' }] }] };
  // HB 가 준 C 양식 그대로(이름만 지어낸 이름)
  const c15 = { sun: '2026-11-15', busan: { found: true, group: '26-1115', spoken: [{ n: 2, title: '금요 인카운터 예배' }, { n: 1, title: '추수 감사 주일' }], video: ['감사 영상'], check: ['꽃꽂이 모집'] },
    video: [{ title: '2026 추수감사주일', url: 'https://youtu.be/AAA', rep: false, notes: [{ at: '2026-11-14', text: '부산은 짧은 버전' }] }] };
  sc.eq('㉚ 카톡 글 = HB 양식 C (같은 영상 · 리포터 없음) · 유튜브 주소 · 부산 이야기 · 영상 사용 · 확인 필요는 안 넣음', A.adsText(c15, { who: '홍길동', bs: 'same' }),
    '11/15(주일) 부산 주일예배 광고\n\n1부: 홍길동\n2부: 홍길동\n\n0: (영상) 2026 추수감사주일\n분당 있음 / 부산 있음 (1부 중계, 2부 파일)\n\n1. 추수 감사 주일\n2. 금요 인카운터 예배\n> 모두 영상내 비포함\n>> 구두광고 및 슬라이드 필요 @');
  sc.eq('㉚ 부산 상영 세 갈래 · 고르기 전이면 \'부산 상영 미정\' (C4a ②-2)', ['same', 'diff', 'none', undefined, 'x'].map(bs => A.adsText(c15, { who: '홍길동', bs }).split('\n')[6]),
    ['분당 있음 / 부산 있음 (1부 중계, 2부 파일)', '분당 있음 / 부산 버전 따로 있음 (1부 파일, 2부 파일)', '분당 있음 / 부산 없음', '부산 상영 미정', '부산 상영 미정']);
  const r8 = J(c15); r8.video[0].rep = true;
  sc.eq('㉚ 리포터가 배정되면 모두 영상내 포함 · 슬라이드 필요없음', A.adsText(r8, { who: '홍길동' }).split('\n').slice(-2), ['> 모두 영상내 포함', '>> 구두광고 슬라이드 필요없음']);
  sc.eq('㉚ 영상이 없는 주 = 분당 없음 / 부산 없음 · 교역자 미정 · 부산 주보 그룹이 없으면 알림 + 리포터 줄은 뺀다 (C4a ⑤)',
    A.adsText({ sun: '2026-11-29', busan: { found: false, group: '26-1129' }, video: [] }),
    '11/29(주일) 부산 주일예배 광고\n\n1부: 미정\n2부: 미정\n\n0: (영상) 없음\n분당 없음 / 부산 없음\n\n(부산 주보에 아직 이 주일 그룹이 없습니다. 부산 주보 담당 교역자와 확인해주세요)');
  sc.eq('㉚ 그룹이 없으면 리포터가 있어도 리포터 줄을 넣지 않는다', A.adsText({ sun: '2026-11-29', busan: { found: false }, video: [{ title: 'x', rep: true }] }, { bs: 'same' }).includes('영상내'), false);
  sc.eq('㉚ 영상이 없는 주는 구두광고 해야 함', A.adsText({ sun: '2026-11-29', busan: { found: true, spoken: [{ n: 1, title: '새벽 기도회' }] }, video: [] }).split('\n').slice(-3), ['1. 새벽 기도회', '> 모두 영상내 비포함', '>> 구두광고 및 슬라이드 필요 @']);
  const old = J(c15); delete old.video[0].rep;
  sc.eq('㉚ 옛 서버(리포터를 모름)면 짐작하지 않고 알린다', A.adsText(old, { who: '홍길동' }).split('\n').slice(-1), ['> 리포터 배정을 읽지 못했습니다 (서버를 다시 올려 주세요)']);
  sc.eq('㉚ 부산 관련 Monday 글 펼침은 다시 그려도 유지', /details\.adnotes/.test(HTML) && /\(P\.open \|\| \{\}\)\[v\.title\] \? ' open'/.test(HTML), true);
  // C4a — 묶음(업데이트 + 답글) · 링크 · 멘션 · 날짜 묶기 · 더 보기 · 말풍선
  const th = A.normAds({ sun: '2026-11-22', video: [{ title: 'v', link: 'https://example-church.monday.com/boards/1/pulses/2', notes: [
    { id: '11', at: '2026-11-20', tm: '21:40', text: '부산 버전', link: 'https://example-church.monday.com/boards/1/pulses/2/posts/11', replies: [{ at: '2026-11-21', tm: '09:12', who: '김가람', text: '@홍길동 확인' }, { text: '' }] },
    { at: '2026-11-18', text: '부산 옛 서버 글', who: 7 }, { id: 'x"><b', text: '부산', link: 'https://evil.example.com/' }] }] }).video[0];
  sc.eq('㉚ 묶음 모양 · 빈 답글 뺌 · 옛 서버 한 줄은 답글 없는 묶음 · Monday 주소만 링크 · 이상한 id · 글이 아닌 작성자는 버림', J(th), { title: 'v', url: '', link: 'https://example-church.monday.com/boards/1/pulses/2', notes: [
    { id: '11', at: '2026-11-20', tm: '21:40', who: '', text: '부산 버전', link: 'https://example-church.monday.com/boards/1/pulses/2/posts/11', replies: [{ at: '2026-11-21', tm: '09:12', who: '김가람', text: '@홍길동 확인' }] },
    { id: '', at: '2026-11-18', tm: '', who: '', text: '부산 옛 서버 글', link: '', replies: [] }, { id: '', at: '', tm: '', who: '', text: '부산', link: '', replies: [] }], rep: null });
  sc.eq('㉚ 작성자 이름은 시각 옆 (글 · 답글 모두, 없으면 안 그림)', /<span>\$\{esc\(n\.tm\)\}\$\{adsWhoTag\(n\.who\)\}<\/span>/.test(HTML) && /\+ r\.tm\)\}\$\{adsWhoTag\(r\.who\)\}<\/span>/.test(HTML) && /const adsWhoTag = \(w\) => \(w \?/.test(HTML), true);
  sc.eq('㉚ 날짜 묶기: 위가 가장 오래된 날 · 같은 날도 이른 것부터 (아래로 갈수록 최신, HB 11/16)', J(A.adsByDay([{ at: '2026-11-20', tm: '21:40' }, { at: '2026-11-18', tm: '09:00' }, { at: '2026-11-20', tm: '14:20' }]).map(d => [d.at, d.notes.map(n => n.tm)])),
    [['2026-11-18', ['09:00']], ['2026-11-20', ['14:20', '21:40']]]);
  sc.eq('㉚ 다시 그릴 때 \'더 보기\' 높이를 맞춘 뒤 보던 자리를 되돌린다 (아이패드에서 판이 툭 튀던 것, HB 11/16 A → B)', /if \(S\.pane\.kind === 'ads'\) adsFit\(el\);\n  el\.scrollTop = top;/.test(HTML), true);
  sc.eq('㉚ 새로 읽은 것이 같으면 다시 그리지 않고 \'읽은 때\' 만 바꾼다', /JSON\.stringify\(Q\.data\) === JSON\.stringify\(o\)\) \{ Object\.assign\(Q, \{ at, stale: false \}\); const w = \$\('#ads-when'\)/.test(HTML), true);
  sc.eq('㉚ 펼친 글 맨 아래 꺾쇠로 접는다 · 펼침 기억도 함께 · 교역자도', /data-act="adsfold" aria-label="접기"/.test(HTML) && /dt\.open = false; S\.pane\.open = Object\.assign\(\{\}, S\.pane\.open, \{ \[dt\.dataset\.ni\]: false \}\)/.test(HTML) && /'admore', 'adsfold'\]\.includes\(d\.act\)/.test(HTML), true);
  sc.eq('㉚ 카드 머리 색띠: 영상 = 파랑 · 구두 = 초록 · 전달용 텍스트 = 노랑 (라이트 · 다크 모두 값, HB 11/18)', /class="adcard vid"><h4>영상 광고/.test(HTML) && /class="adcard spk"><h4>구두 광고/.test(HTML) && (HTML.match(/--adv-band:/g) || []).length === 3 && (HTML.match(/--ads-band:/g) || []).length === 3 && (HTML.match(/--adt-band:/g) || []).length === 3 && /\.adcard\.txt h4\{background:var\(--adt-band\)/.test(HTML), true);
  sc.eq('㉚ 링크 규칙: 짧은 주소는 그대로(https 빼고) · 긴 주소(30자 넘음)는 사이트 이름만', ['https://youtu.be/AbCdEfGhIjk', 'https://www.youtube.com/watch?v=AbCdEfGhIjk&list=PL0', 'https://drive.google.com/drive/folders/1AbCdEfGh'].map(A.adsLinkLabel),
    ['youtu.be/AbCdEfGhIjk', 'youtube.com', 'drive.google.com']);
  sc.eq('㉚ 글 조각: 주소 · 끝 문장부호는 글로 · 멘션(앞이 빈칸 · 줄 처음) · 메일 주소는 멘션 아님',
    J(A.adsRich('@김예린 파일은 https://youtu.be/abc. 보세요\nhb@example.com (@이하준)')),
    [{ k: '@', v: '@김예린' }, { k: 't', v: ' 파일은 ' }, { k: 'a', v: 'https://youtu.be/abc', label: 'youtu.be/abc' }, { k: 't', v: '. 보세요\nhb@example.com (@이하준)' }]);
  sc.eq('㉚ 글 조각: javascript: 같은 주소는 링크가 아니다 · 빈 글은 빈 목록', [J(A.adsRich('javascript:alert(1)')), J(A.adsRich(''))], [[{ k: 't', v: 'javascript:alert(1)' }], []]);
  sc.eq('㉚ 더 보기는 판에 기억(S.pane.more — 다시 그려도 그대로) · 교역자도 누를 수 있다', /S\.pane\.more = Object\.assign\(\{\}, S\.pane\.more/.test(HTML) && /const open = !!\(S\.pane\.more \|\| \{\}\)\[k\]/.test(HTML) && /'adsback', 'admore', 'adsfold'\]\.includes\(d\.act\)/.test(HTML), true);
  sc.eq('㉚ 말풍선: 고른 단추 자리(--i) · 고르기 전엔 \'아직 고르지 않았습니다\' · 그룹이 없으면 리포터 말풍선 없음', /bi >= 0 \? `<div class="adbub" id="ads-bub" style="--i:\$\{bi\}"/.test(HTML) && /<p class="adyet\$\{warn \? ' warn' : ''\}">아직 고르지 않았습니다<\/p>/.test(HTML) && /!b\.found \? `<p class="adnone">\$\{esc\(ADS_NOGROUP\)\}<\/p>`/.test(HTML), true);
  sc.eq('㉚ 문구: 부산 관련 Monday 글 · Monday에서 보기 · 상영 고르기 설명', ['부산 관련 Monday 글 <span', "'Monday에서 보기'", '위 Monday 내용을 참고하여 부산 상영 여부를 선택해주세요'].every(t => HTML.includes(t)), true);
  sc.eq('㉚ 처음엔 아무것도 안 골라짐 (계정 책에 그 주일 줄이 없으면 빈 값 — C4b)', /function adsOpt\(sun\) \{ return \{ who: adsWho\(sun\), bs: showOf\(S\.book, sun\) \}; \}/.test(HTML) && A.showOf(A.normBook(null), '2026-11-22'), '');
  sc.eq('㉚ 1부 · 2부 = 그 주일 부산 방문의 교역자 · 카톡 글의 상영도 계정 책에서', /vSun\(v\) === sun/.test(HTML) && /adsText\(a, adsOpt\(P\.sun\)\)/.test(HTML), true);
  sc.eq('㉚ 서버 답이 이상해도 깨지지 않는다 · http 아닌 주소는 버림', [A.adsText(null), A.normAds({ sun: '2026-11-22', video: [{ title: 'x', url: 'javascript:alert(1)', rep: 'y' }, {}] }).video], ['', [{ title: 'x', url: '', link: '', notes: [], rep: null }]]);
  sc.eq('㉚ 앱은 Monday 를 직접 부르지 않는다(열쇠가 폰에 오지 않게) — 서버 monday 함수만', [/api\.monday\.com/.test(HTML), /cloudfunctions\.net\/monday'/.test(HTML)], [false, true]);
  sc.eq('㉚ 열쇠는 붙여 넣은 칸에서 바로 비우고 이 기기에 저장하지 않는다', /if \(el\) el\.value = '';/.test(HTML) && !/lsSet\([^)]*token/.test(HTML), true);
  sc.eq('㉚ 교역자: 방문 판 · 내 일정에서 광고를 열 수 있고, 광고 판에서는 보기 · 복사 · 부산 상영 고르기만(열쇠 넣기 · 끊기 아님)',
    [/\(d\.act === 'ads' \|\| d\.act === 'gsweek'\) && !S\.pane\.edit/.test(HTML), /'home', 'ads'(, 'afold'[^\]]*)?\]\)/.test(HTML), /kind === 'ads'\) return \['closepane', 'adsload', 'adscopy', 'adsback', 'admore', 'adsfold'\]\.includes\(d\.act\) \|\| \(\(!!d\.adsbs \|\| d\.act === 'adtxedit' \|\| d\.act === 'adtxreset'\) && bsCan\(S\.pane\.sun\)\);/.test(HTML)], [true, true, true]);
  sc.eq('㉚ 교역자는 주인(HB)의 로테이션으로 묻는다', /mfn\('\/ads', \{ owner: FB\.team \|\| FB\.user\.uid, sun \}\)/.test(HTML), true);
  sc.eq('㉚ 복사는 누른 자리에서 바로(아이폰) — adsCopy 안에 await 가 없다', !/await/.test((HTML.match(/function adsCopy\(\) \{[\s\S]*?\n\}/) || [''])[0]), true);
  sc.eq('㉚ 광고는 책(b10)에 넣지 않는다 — 이 기기 사본만 (미리보기는 따로 — 지어낸 광고가 경고 판단에 섞이지 않게)', /ADS_KEY = DEMO \? 'rota_demo_ads_v1' : 'rota_ads_v1'/.test(HTML) && !/S\.book\.ads/.test(HTML), true);
}


// ㉛ 부산 상영 계정 저장 (R12 C4b) — 주일 줄 shows · b10 · 교역자는 자기 방문 줄에 → absorb · 경고 (지어낸 이름 · 이메일만)
{
  const ppl = [{ id: 'pa', name: '가나다', roles: ['busan'], email: 'ga@example.com', at: 1 }, { id: 'pb', name: '라마바', roles: ['busan'], email: 'gb@example.com', at: 1 }];
  const vis = [{ id: 'v|2026-11-22', who: ['pa', 'pb'], days: '토일', at: 1 }, { id: 'v|2026-11-29', who: ['pb'], days: '토일', at: 1 }, { id: 'v|2026-12-24', who: ['pa'], days: '목', at: 1 }];
  const bk = A.normBook({ people: ppl, visits: vis }), b0 = () => A.normBook({ shows: [{ id: 's|2026-11-22', bs: 'diff', at: 2 }] });
  sc.eq('㉛ 주일 줄 다듬기: 주일이 아닌 날 · 모르는 상영 값은 버림 · 지우기 표지는 남김',
    J(A.normBook({ shows: [{ id: 's|2026-11-22', bs: 'diff', at: 2 }, { id: 's|2026-11-21', bs: 'same', at: 2 }, { id: 's|2026-11-29', bs: 'x', at: 2 }, { id: 's|2026-12-06', del: true, at: 3 }] }).shows),
    [{ id: 's|2026-11-22', at: 2, by: '', sun: '2026-11-22', bs: 'diff' }, { id: 's|2026-12-06', at: 3, by: '', del: true, sun: '2026-12-06' }]);
  const dr = A.normBook(J(b0())); A.drop(dr, 'shows', 's|2026-11-22', 'hb', 9);
  sc.eq('㉛ 지우기 표지는 다듬은 줄과 같은 모양(기기마다 글자까지 같게)', JSON.stringify(dr.shows[0]) === JSON.stringify(A.normBook(J(dr)).shows[0]), true);
  const b1 = A.normBook(J(bk)); A.put(b1, 'shows', { id: A.showId('2026-11-22'), sun: '2026-11-22', bs: 'same' }, 'hb', 100);
  sc.eq('㉛ HB 가 고르면 그 주일 줄 하나 · 다른 주일은 빈 값', [A.showOf(b1, '2026-11-22'), A.showOf(b1, '2026-11-29'), b1.shows.length], ['same', '', 1]);
  const b2 = J(b1); b2.shows[0] = Object.assign({}, b2.shows[0], { bs: 'none', at: 200 });
  sc.eq('㉛ 다른 기기에서 나중에 고친 것이 이긴다(어느 순서로 합쳐도)', [A.showOf(A.mergeBook(b1, b2), '2026-11-22'), A.showOf(A.mergeBook(b2, b1), '2026-11-22')], ['none', 'none']);
  // 낡은 앱(b9)은 shows 를 몰라 떨군 채 b9 에 쓴다 → 새 앱이 b10 과 합치면 상영은 남고 낡은 앱이 고친 것도 받는다
  const ol = J(b1); delete ol.shows; ol.visits[1].note = '낡은 앱이 고침'; ol.visits[1].at = 300;
  const pk = A.pickDoc(null, { b10: J(b1), b9: ol });
  sc.eq('㉛ 낡은 앱(b9)과 합쳐도 상영은 그대로 · 낡은 앱이 고친 방문도 받음 · 옛 칸을 치우려 한 번 씀', [A.showOf(pk.book, '2026-11-22'), pk.book.visits[1].note, pk.push], ['same', '낡은 앱이 고침', true]);
  sc.eq('㉛ 빈 기기 + 계정(b10) = 계정 그대로 · (1116-2 B 부터 쓰는 칸이 바뀌어) 한 번 옮겨 씀 · 지금 칸(b16, 1117-Z 4)이면 다시 안 씀', [(r => [A.showOf(r.book, '2026-11-22'), r.push])(A.pickDoc(null, { b10: J(b1) })), A.pickDoc(null, { b18: J(b1) }).push], [['same', true], false]);
  // 교역자: 자기 칸의 그 방문 줄에 bs · bsAt → absorb 가 그 방문의 주일 줄로
  sc.eq('㉛ 교역자 조각 = 그 방문 줄 안(보안 규칙이 이미 허락하는 visits 칸) · 모르는 값은 안 씀',
    [J(A.staffPatch('ga@example.com', 'bs', 'v|2026-11-22', 'diff', 50)), A.staffPatch('ga@example.com', 'bs', 'v|2026-11-22', 'x', 50)],
    [{ email: 'ga@example.com', at: 50, visits: { 'v|2026-11-22': { bs: 'diff', bsAt: 50 } } }, null]);
  const merged = A.staffMerge({ email: 'ga@example.com', visits: { 'v|2026-11-22': { stay: [{ name: '호텔' }], stayAt: 40 } } }, A.staffPatch('ga@example.com', 'bs', 'v|2026-11-22', 'diff', 50));
  sc.eq('㉛ 같은 방문 줄의 숙소는 그대로 남는다(합치기)', [merged.visits['v|2026-11-22'].stay[0].name, merged.visits['v|2026-11-22'].bs], ['호텔', 'diff']);
  const sA = { email: 'ga@example.com', at: 2000, visits: { 'v|2026-11-22': { bs: 'diff', bsAt: 2000 }, 'v|2026-11-29': { bs: 'none', bsAt: 2000 }, 'v|2026-12-24': { bs: 'same', bsAt: 2000 } } };
  const r1 = A.absorb(bk, [sA]);
  // 1116-2 D(HB 11/17): 주일에 머물지 않는 부산 일정(성탄 목요일만)은 그 주일 상영과 잇지 않는다 — 예전엔 12/27 주일로 받았다
  sc.eq('㉛ 내 방문의 주일 줄만 받는다(11/22) · 주일에 안 머무는 성탄 목요 일정은 12/27 주일과 안 이음 · 남의 방문(11/29)은 안 받음 · 누가 = 교역자',
    [A.showOf(r1.book, '2026-11-22'), A.showOf(r1.book, '2026-12-27'), A.showOf(r1.book, '2026-11-29'), r1.book.shows.find(x => x.sun === '2026-11-22').by, r1.changed.filter(x => x[0] === 's')], ['diff', '', '', 'staff:pa', ['s|2026-11-22']]);
  sc.eq('㉛ 한 번 받은 뒤 또 받아도 바뀌는 것 없음(핑퐁 없음)', A.absorb(r1.book, [sA]).changed, []);
  const hbLate = A.normBook(J(bk)); A.put(hbLate, 'shows', { id: 's|2026-11-22', sun: '2026-11-22', bs: 'none' }, 'hb', 3000);
  sc.eq('㉛ HB 가 그 뒤에 고쳤으면 HB 것 · 교역자가 또 나중에 고치면 교역자 것', [A.showOf(A.absorb(hbLate, [sA]).book, '2026-11-22'),
    A.showOf(A.absorb(hbLate, [{ email: 'ga@example.com', visits: { 'v|2026-11-22': { bs: 'same', bsAt: 4000 } } }]).book, '2026-11-22')], ['none', 'same']);
  const sB = { email: 'gb@example.com', visits: { 'v|2026-11-22': { bs: 'none', bsAt: 2500 } } }, sA2 = { email: 'ga@example.com', visits: { 'v|2026-11-22': { bs: 'same', bsAt: 2500 } } };
  sc.eq('㉛ 같은 주일에 두 분이 고르면 나중 것 · 같은 때면 id 순 — 교역자 순서와 상관없이 같은 답',
    [A.showOf(A.absorb(bk, [sA, sB]).book, '2026-11-22'), A.showOf(A.absorb(bk, [sB, sA]).book, '2026-11-22'), A.showOf(A.absorb(bk, [sA2, sB]).book, '2026-11-22'), A.showOf(A.absorb(bk, [sB, sA2]).book, '2026-11-22')], ['none', 'none', 'same', 'same']);
  sc.eq('㉛ 교역자 칸 다듬기: 모르는 상영 값 · 고친 때 없는 값은 버림, 숙소는 그대로', J(A.normStaff({ email: 'ga@example.com', visits: { 'v|2026-11-22': { bs: 'x', bsAt: 5, stay: [{ name: '호텔' }], stayAt: 5 }, 'v|2026-11-29': { bs: 'same' } } }).visits),
    { 'v|2026-11-22': { stay: [{ kind: 'hotel', name: '호텔', status: '', cost: 0, nights: 0, for: '' }], stayAt: 5 } });
  // 경고: 금 · 토 · 주일에, 그 주일에 영상 광고가 있는데(이 기기에서 읽은 광고) 안 골랐으면
  const ad = (n) => ({ at: 1, o: A.normAds({ sun: '2026-11-22', busan: { found: true }, video: Array.from({ length: n }, () => ({ title: '영상' })) }) });
  const days = ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'];
  sc.eq('㉛ 경고 날: 목 없음 · 금 · 토 · 주일 = 그 주일 · 월 없음', days.map(d => A.bsWarnSun(bk, d, { '2026-11-22': ad(1) })), ['', '2026-11-22', '2026-11-22', '2026-11-22', '']);
  sc.eq('㉛ 읽은 적 없는 주 · 영상 광고가 없는 주 · 이미 고른 주 · 다른 주일의 광고만 읽음 = 경고 없음',
    [A.bsWarnSun(bk, '2026-11-21', {}), A.bsWarnSun(bk, '2026-11-21', null), A.bsWarnSun(bk, '2026-11-21', { '2026-11-22': ad(0) }), A.bsWarnSun(b1, '2026-11-21', { '2026-11-22': ad(1) }), A.bsWarnSun(bk, '2026-11-21', { '2026-11-29': ad(1) }), A.bsWarnSun(bk, 'x', { '2026-11-22': ad(1) })], ['', '', '', '', '', '']);
  // 화면 · 저장 길
  sc.eq('㉛ HB 는 책에(put · saveBook), 교역자는 자기 칸의 그 방문 줄에(staffWrite \'bs\') · 고를 수 있는 사람 = HB · 그 주일 부산에 내려가는 교역자',
    /else \{ put\(S\.book, 'shows', \{ id: showId\(sun\), sun, bs: v \}, byNow\(\), Date\.now\(\)\); saveBook\(\); \}/.test(HTML) && /if \(isStaff\(\)\) staffWrite\('bs', bsVisit\(sun\)\.id, v\);/.test(HTML) && /function bsCan\(sun\) \{ return !isStaff\(\) \|\| !!bsVisit\(sun\); \}/.test(HTML), true);
  sc.eq('㉛ 보안 규칙은 그대로(교역자 칸 visits 안이라 새 칸이 필요 없음)', /hasOnly\(\['email', 'at', 'v', 'visits', 'away', 'awayAt', 'can', 'canAt', 'ui'\]\)/.test(fs.readFileSync(path.join(__dirname, 'rules', 'rota.rules'), 'utf8')), true);
  sc.eq('㉛ 예전 이 기기 선택(rota_adsbs_v1)은 한 번 계정으로 옮기고 지운다 · 다시 읽지 않는다', /localStorage\.removeItem\(ADSBS_KEY\)/.test(HTML) && (HTML.match(/lsGet\(ADSBS_KEY/g) || []).length === 1, true);
  sc.eq('㉛ 경고는 고를 수 있는 사람에게만 · 읽은 광고(ADS_KEY) 기준', /function bsWarn\(\) \{ const s = bsWarnSun\(S\.book, todayYmd\(\), lsGet\(ADS_KEY, \{\}\) \|\| \{\}\); return s && bsCan\(s\) \? s : ''; \}/.test(HTML), true);
  sc.eq('㉛ 경고 자리: 모든 탭 맨 위 줄 · 이번 주(카드 · 주일 카드 부산 줄 · 표 보기) · 부산 탭 · 방문 판 주일 광고 · 내 일정(목록 · 부산 준비) · 달력표 부산 요약 · 광고 판',
    [/function syncBanner\(\) \{ return syncLine\(\) \+ bsBar\(\); \}/.test(HTML), (HTML.match(/\$\{bsP\(v\)\}/g) || []).length, /busanRow\(v, cls, pm, lv\[v\.id\] === 'bad', bsPill\(v, bw\)\)/.test(HTML) && /\$\{bsp \|\| ''\}<\/span>/.test(HTML),
      /주일 광고\$\{bsPill\(v, bsWarn\(\)\) \? ' ' \+ BS_PILL : ''\}<i>/.test(HTML), /<span>\$\{bsPill\(v, bw\)\}\$\{stPill\(v\)\}<\/span>/.test(HTML), /\$\{!vSun\(v\) \? '' : bsPill\(v, bw\) \? `<button class="mck todo" data-act="ads"/.test(HTML),
      /'<span class="muted">—<\/span>'\)\}\$\{bsPill\(v, bw\) \? ' ' \+ BS_PILL : ''\}<\/td>/.test(HTML), /const can = bsCan\(P\.sun\), warn = bi < 0 && bsWarn\(\) === P\.sun;/.test(HTML)],
    [true, 3, true, true, true, true, true, true]);
  sc.eq('㉛ 광고를 새로 읽어 경고가 바뀌면 뒤 화면도 다시 그린다', /if \(bsWarn\(\) !== w0 && !editing\(\)\) render\(\);/.test(HTML), true);
}

// ㉜ 인도 싣기 · 내보내기 새 판 (R12 B, HB 11/16) — 지어낸 이름
{
  const b = A.normBook(null);
  A.put(b, 'people', { id: 'a', name: '가가', roles: ['busan', 'preach'] }, 'u', 1); A.put(b, 'people', { id: 'b', name: '나나', roles: ['busan'] }, 'u', 1);
  A.put(b, 'people', { id: 'l', name: '라라', kind: 'lay', roles: ['lead'] }, 'u', 1);
  // 11/1(금1 주 · AWAKE 11/6 는 다음 주일 11/8 몫) · 11/8 방문: 금 교역자 · 주일 성도 라라 · LL 중계 · 11/22 방문: 토일만(금요 교역자는 안 머물러 안 보임)
  A.put(b, 'visits', { id: 'v|2026-11-08', who: ['a'], days: '금토일', lead: { fri: { m: 'staff' }, sun: { m: 'lay', p: 'l' }, ll: { m: 'relay' } }, stay: [{ name: '호텔 가', status: 'done', cost: 90000, cancelBy: '2026-11-05' }], staff: '스텝' }, 'u', 1);
  A.put(b, 'visits', { id: 'v|2026-11-22', who: ['b'], days: '토일', lead: { fri: { m: 'staff' }, sun: { m: 'staff' } } }, 'u', 1);
  A.put(b, 'slots', { id: '2026-11-08|sun1|preach', who: ['a'] }, 'u', 1);
  const v8 = b.visits.find(v => v.id === 'v|2026-11-08'), v22 = b.visits.find(v => v.id === 'v|2026-11-22');
  sc.eq('㉜ 칸 글: 교역자 = \'교역자\' · 성도 = 그분 이름 · 중계 = \'중계\' · 안 머무는 교역자 인도 · 비움 = 빈칸',
    [A.leadCell(b, v8, 'fri'), A.leadCell(b, v8, 'sun'), A.leadCell(b, v8, 'll'), A.leadCell(b, v22, 'fri'), A.leadCell(b, v22, 'sun'), A.leadCell(b, v22, 'll')], ['교역자', '라라', '중계', '', '교역자', '']);
  sc.eq('㉜ 그 날의 인도(금요는 금요일 날짜로) · 한 줄 글', [A.leadsAt(b, '2026-11-06', 'fri'), A.leadsAt(b, '2026-11-08', 'sun'), A.leadsAt(b, '2026-11-08', 'll'), A.leadsAt(b, '2026-11-15', 'sun'), A.leadLine(b, v8)],
    ['교역자', '라라', '중계', '', 'AWAKE 인도, 주일예배 · 라라, LL 중계']);
  const all = A.exportRows(b, 'all', '2026-11', { today: '2026-11-01' });
  sc.eq('㉜ 이번달 전체 = 시트 모양 그대로(sheetTSV 와 같은 글) + 끝에 부산 주일 · LL 인도 · 금요 인도 열', [A.tsvOf(all) === A.sheetTSV(b, '2026-11'), all[1].slice(-3), all.find(r => r[0] === '11/8' && r[1] === '설교').slice(-3), all.find(r => r[0] === '11/6').slice(-2)],
    [true, ['부산 교역자', '부산 주일 인도', '부산 LL 인도'], ['가가', '라라', '중계'], ['AWAKE', '교역자']]);
  sc.eq('㉜ 예배별 = 제목 줄 없이 같은 표 · 화면에서 편 \'한 주 더\' 도 싣는다', [A.exportRows(b, 'sheet', '2026-11', {})[0][0], A.exportRows(b, 'sheet', '2026-11', { ext: { fri: { b: 1, a: 0 } } }).find(r => r[0] === '10/30') ? 1 : 0], ['주일', 1]);
  const gr = A.exportRows(b, 'grid', '2026-11', {});
  sc.eq('㉜ 주간형 = 줄이 자리, 칸이 주 · 맨 아래 부산 · 금요 · 주일 · LL 인도', [gr[0].length, gr.find(r => r[0] === '1부 설교')[2], gr.slice(-4).map(r => [r[0], r[2], r[3]])],
    [6, '가가', [['부산', '가가', ''], ['부산 금요 인도', '', ''], ['부산 주일 인도', '라라', ''], ['부산 LL 인도', '중계', '']]]);
  sc.eq('㉜ 주간형 금요 인도는 그 주 금요일(11/1 주의 금요일 11/6 = 11/8 방문의 AWAKE)', gr.find(r => r[0] === '부산 금요 인도')[1], '교역자');
  const bs = A.exportRows(b, 'busan', '2026-11', {});
  sc.eq('㉜ 부산 요약: 머리 · 금요 · 주일 · LL 인도 칸 · 숙소 · 금액(숫자) · 취소 기한 · 동행',
    [bs[0].slice(0, 13), bs[1].slice(0, 13), bs[2].slice(4, 8)], [['날짜', '요일', '교역자', '머무는 날', '금요예배', '금요 인도', '주일 인도', 'LL 인도', '숙소', '금액', '취소 기한', '동행', '모임'],
      ['11/8', '주일', '가가', '금토일', 'AWAKE', '교역자', '라라', '중계', '호텔 가', 90000, '11/5(목)', '스텝', ''], ['ENCOUNTER', '', '교역자', '']]);
  const mine = A.exportRows(b, 'mine', '2026-11', { today: '2026-11-01', pid: 'a' });
  sc.eq('㉜ 내 일정(목록): 이름 머리 · 날짜순 · 부산 줄에 인도 한 줄', [mine[0][0], mine[1], mine.slice(2).map(r => [r[0], r[2], r[3], r[4]])],
    ['가가 님의 일정 · 11/1 ~ 12/26', ['날짜', '요일', '갈래', '맡은 일', '부산 인도'], [['11/6~11/8', '부산', '금토일 · 호텔 가', 'AWAKE 인도, 주일예배 · 라라, LL 중계'], ['11/8', '주일', '1부 설교', '']]]);
  const mg = A.exportRows(b, 'mine', '2026-11', { today: '2026-11-01', pid: 'a', grid: true });
  sc.eq('㉜ 내 일정(8주 표): 한 줄이 한 주 · 부산 칸 · 부산 인도 칸', [mg[1], mg.length, mg[2].slice(4)], [['주', '주일', '수', '금', '부산', '부산 인도'], 10, ['11/6~11/8 금토일', 'AWAKE 인도, 주일예배 · 라라, LL 중계']]);
  sc.eq('㉜ 성도 인도자의 내 일정: 부산 방문에 들지 않아도 그 예배 날에 부산 "주일예배 인도" 한 줄(내 이름은 빼고 · 인도 갈래로 셈)',
    [A.myItems(b, 'l', '2026-11-01', '2026-11-30').map(r => [r.kind, r.date, A.itemLabel(r)]), A.myAhead(b, 'l', '2026-11-01', 8).tally.lead, A.myWeeks(b, 'l', '2026-11-08', 1)[0].bl.length,
      A.exportRows(b, 'mine', '2026-11', { today: '2026-11-01', pid: 'l' })[2].slice(2, 4)], [[['blead', '2026-11-08', '주일예배 인도']], 1, 1, ['부산', '주일예배 인도']]);
  sc.eq('㉜ 사람 × 주 · 월 달력(부산이면 인도도) · 모르는 보기 · 고를 사람 없음',
    [A.exportRows(b, 'matrix', '2026-11', {}).find(r => r[0] === '가가').slice(1, 3), A.exportRows(b, 'cal', '2026-11', { calf: 'busan' })[3][0], A.exportRows(b, 'cal', '2026-11', { calf: 'busan' })[2][0], A.exportRows(b, 'x', '2026-11', {}), A.exportRows(b, 'mine', '2026-11', { pid: 'zz' })],
    [['', '설 부'], '8일 가가 · 주일예배 · 라라 · LL 중계', '1일', [], [['사람을 골라 주세요']]]);
  sc.eq('㉜ CSV: 쉼표 · 따옴표는 감싸고 줄바꿈 · 탭은 빈칸 · TSV 는 탭', [A.csvOf([['a,b', 'c"d', 'e\nf'], [1]]), A.tsvOf([['a\tb', 2]])], ['"a,b","c""d",e f\r\n1', 'a b\t2']);
  sc.eq('㉜ 자료 모양은 그대로 — 쓰는 칸 b10 (1116-2 B 에서 b11 · C 에서 b12 로 — ㉞ ㉟)', /OLD_FIELDS = \[[^\]]*'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17'\], WRITE_FIELD = 'b18'/.test(HTML), true);
  // 화면 자리
  sc.eq('㉜ 내보내기 판: 보기 고르기(지금 보던 보기) · 이번달 전체(누르면 고르기가 흐려짐) · 복사 · CSV 오른쪽 · exportRows 한 곳에서',
    [/openPane\(\{ kind: 'exp', v: viewOk\(PREF\.mview\) \? PREF\.mview : 'sheet', all: false \}\)/.test(HTML), /<select class="inp expsel\$\{all \? ' dim' : ''\}" id="exp-view"/.test(HTML) && /if \(t\.id === 'exp-view'\) \{ S\.pane\.v = t\.value; S\.pane\.all = false;/.test(HTML), /data-act="expall" aria-pressed="\$\{all\}"/.test(HTML) && /if \(a === 'expall'\) \{ S\.pane\.all = !S\.pane\.all;/.test(HTML),
      /<span class="spacer"><\/span><button class="btn" data-act="expcopy">복사<\/button><button class="btn ghost" data-act="expcsv">CSV<\/button>/.test(HTML), (HTML.match(/exportRows\(S\.book/g) || []).length], [true, true, true, true, 1]);
  sc.eq('㉜ 주차별: 금요 영역 첫 줄에 금요예배 이름(머리줄 아님) · 마지막 금요일은 WORSHIP NIGHT · 넷째 금요일이 마지막이 아니면 비움',
    [/svc === 'fri' && role === 'preach' \? `<tr\$\{sep\}><td class="rl h-fri">금요예배<\/td>/.test(HTML), /weekFriName\(p\.sun\) \|\| \(isLastFri\(p\.fri\) \? 'WORSHIP NIGHT' : ''\)/.test(HTML), /\$\{weekLabel\(p\.sun\)\}\$\{p\.mark/.test(HTML), ['2026-11-27', '2026-11-20', '2026-11-06', '2026-11-13'].map(d => A.isLastFri(d))], [true, true, true, [true, false, false, false]]);
  sc.eq('㉜ 화면: 부산 요약 \'예배 인도\' 칸 · 내 일정 부산 줄 · 8주 표 부산 칸 · 부산 준비 카드에 인도 알약',
    [/<th class="h-bs">예배 인도<\/th>/.test(HTML), /<td style="text-align:left">\$\{cb_\(v, 'lead', leadChips\(v\)\)\}<\/td>/.test(HTML), (HTML.match(/leadChips\(v, ' · '\)/g) || []).length, /leadChips\(x\.v\)/.test(HTML), /leadChips\(v, ' · '\)\}\$\{others\.length/.test(HTML)], [true, true, 2, true, true]);
}

// ㉝ 예배팀 일정(R13) — 서버가 둔 ext/worship 으로 '부산에 있는데 분당 예배팀' (지어낸 이름)
console.log('\n㉝ 예배팀 일정 겹침');
{
  const b = A.normBook({ people: [{ id: 'pa', name: '가교역', alias: ['가 전도사'], roles: ['busan'] }, { id: 'pb', name: '나교역', roles: ['busan'] }, { id: 'px', name: '지운분', del: true }],
    visits: [{ id: 'v|2026-11-22', date: '2026-11-22', who: ['pa'], days: '금토일' }] });
  sc.eq('㉝ 서버에 줄 명단 = 지우지 않은 분의 이름 + 다른 이름', A.wkeysOf(b), { pa: ['가교역', '가 전도사'], pb: ['나교역'] });
  const ext = { services: [
    { date: '2026-11-22', service: '주일 2부', status: 'confirmed', leaders: [], members: [{ pid: 'pa', part: '건반(1st)' }] },
    { date: '2026-11-20', service: '금요예배', status: 'tentative', leaders: [{ w: 'w1', name: '가교역', pid: 'pa' }], members: [{ pid: 'pa', part: '리더' }] },
    { date: '2026-11-18', service: '수요예배', status: 'confirmed', leaders: [], members: [{ pid: 'pa', part: '싱어' }] },
    { date: '2026-11-22', service: '주일 3부', status: 'changed', leaders: [], members: [{ pid: 'pb', part: '드럼' }] }] };
  const c = A.worshipClash(b, ext, '2026-11-16', '2026-11-30');
  sc.eq('㉝ 머무는 날의 예배팀만 · 확정/변경 = 빨강 · 미정 = 노랑 · 리더는 한 번', c.map(x => [x.date, x.level, x.service, x.part, x.visit]),
    [['2026-11-20', 'warn', '금요예배', '리더', 'v|2026-11-22'], ['2026-11-22', 'bad', '주일 2부', '건반(1st)', 'v|2026-11-22']]);
  sc.eq('㉝ 글', A.conflictText(b, c[0]), '가교역 — 11/20(금) 부산에 있는데 분당 금요예배 예배팀(리더) · 예배팀 로테이션 미정');
  sc.eq('㉝ 기간 밖 · 받은 것 없음 → 없음', [A.worshipClash(b, ext, '2026-11-21', '2026-11-21').length, A.worshipClash(b, null, '2026-11-01', '2026-12-31').length], [0, 0]);
  sc.eq('㉝ 방문 칸이 빨갛게', A.levelMap(c)['v|2026-11-22'], 'bad');
  sc.eq('㉝ 앱은 예배팀 서버를 직접 부르지 않는다(열쇠는 서버에만)', [/tlcworship/.test(HTML), /SCHEDULE_API_KEY/.test(HTML)], [false, false]);
  sc.eq('㉝ 주인만 wkeys · wpull 을 쓰고, 책(WRITE_FIELD) 안에 넣지 않는다', /wkeys: wkeysOf\(S\.book\), wpull: true/.test(HTML) && !/book\.wkeys/.test(HTML), true);
  sc.eq('㉝ 교역자는 지금 받기 단추를 못 누른다', /'wpull'/.test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('const STAFF_ACTS') + 400)), false);
}

// ㉞ 부산 요약 칸 누르기 · 동행 / 모임 나눔 (1116-2 B, HB 11/16) — 지어낸 이름 · 이메일
console.log('\n㉞ 동행 · 모임 · 요약 칸');
{
  const NV = (o) => A.normVisit(Object.assign({ id: 'v|2026-11-22', at: 1 }, o));
  // 옛 글 세 칸(staff · group · edu)은 읽을 때 옮긴다 — 쓰지 않는다
  const o1 = NV({ staff: '가스텝 · 나가족, 다스텝', group: '청년셀 모임', edu: '새가족 2차' });
  sc.eq('㉞ 옛 동행 글 → 이름마다 한 줄(· , 로 나눔) · 옛 칸 이름은 버림', [o1.mates, 'staff' in o1, 'group' in o1, 'edu' in o1], [[{ n: '가스텝' }, { n: '나가족' }, { n: '다스텝' }], false, false, false]);
  sc.eq('㉞ 옛 주일모임 + 교육 글 → 부서모임(청년이 들면 청년셀) · 두 글은 메모에 그대로(잃지 않게)', o1.meet, { k: 'dept', g: '청년셀', memo: '청년셀 모임 / 새가족 2차' });
  sc.eq('㉞ 옛 글: 장년 → 장년셀 · 모르는 모임 → 기타 · 교육만 → 침례(차수) / 새가족(차수)',
    [NV({ group: '여장년' }).meet, NV({ group: '희남셀' }).meet, NV({ edu: '침례교육 3차 토 10시' }).meet, NV({ edu: '새가족 2주차' }).meet, NV({ edu: '새가족 4차' }).meet],
    [{ k: 'dept', g: '장년셀', memo: '여장년' }, { k: 'dept', g: '기타', memo: '희남셀' }, { k: 'bapt', n: 3, memo: '침례교육 3차 토 10시' }, { k: 'new', memo: '새가족 2주차' }, { k: 'new', n: 4, memo: '새가족 4차' }]);
  sc.eq('㉞ 비면 칸이 없다(옛 방문과 같은 모양)', (v => ['mates' in v, 'meet' in v])(NV({ staff: '', group: ' ' })), [false, false]);
  // 새 모양
  sc.eq('㉞ 모임 다듬기: 셋 중 하나 · 부서모임 = 청년셀 · 장년셀 · 기타 + 메모 · 새가족 = 이름 글 + 1~6차 · 침례 = 1~6차 · 모르는 값은 버림',
    [A.normMeet({ k: 'dept', g: '장년셀', memo: ' 남 장년 ', n: 3, who: 'x' }), A.normMeet({ k: 'new', who: '라새가 · 마새가', n: 2, g: '청년셀' }), A.normMeet({ k: 'bapt', n: 7 }), A.normMeet({ k: 'bapt', n: 6 }), A.normMeet({ k: 'party' }), A.normMeet(null), A.normMeet({ k: 'dept', g: '어른셀' })],
    [{ k: 'dept', g: '장년셀', memo: '남 장년' }, { k: 'new', who: '라새가 · 마새가', n: 2 }, { k: 'bapt' }, { k: 'bapt', n: 6 }, null, null, { k: 'dept' }]);
  sc.eq('㉞ 새 칸이 있으면 옛 글은 보지 않는다(meet: null = 일부러 비움)', [NV({ meet: { k: 'bapt', n: 1 }, group: '청년셀' }).meet, 'meet' in NV({ meet: null, group: '청년셀' }), NV({ mates: [], staff: '옛 스텝' }).mates],
    [{ k: 'bapt', n: 1 }, false, undefined]);
  sc.eq('㉞ 동행 다듬기: 이름 없는 줄 버림 · 여덟까지 · 성도 id 는 있을 때만', NV({ mates: [{ n: ' 가 ', p: 'pl' }, { n: '' , p: 'pm' }, { n: '나' }, 'x'].concat(Array.from({ length: 9 }, (_, i) => ({ n: 'm' + i }))) }).mates.slice(0, 3).concat(NV({ mates: Array.from({ length: 12 }, (_, i) => ({ n: 'm' + i })) }).mates.length),
    [{ n: '가', p: 'pl' }, { n: '나' }, { n: 'm0' }, 8]);
  // 글 · 잇기
  const bk = A.normBook({ people: [{ id: 'pl', name: '오세움', kind: 'lay', roles: ['lead'], alias: ['오 집사'] }, { id: 'pa', name: '가교역', roles: ['busan'] }, { id: 'px', name: '지운성도', kind: 'lay', del: true }] });
  sc.eq('㉞ 이름을 치면 성도 인도자와 맞는지(띄어쓰기 무시 · 다른 이름도) — 교역자 · 지운 분은 안 잇는다',
    [A.mateLink(bk, '오세움'), A.mateLink(bk, ' 오 세움 '), A.mateLink(bk, '오집사'), A.mateLink(bk, '가교역'), A.mateLink(bk, '지운성도'), A.mateLink(bk, '오세')], ['pl', 'pl', 'pl', '', '', '']);
  sc.eq('㉞ 저장할 때 잇기: 맞는 이름은 id · 이미 이은 줄 · 안 맞는 이름은 그대로 · 같은 분 두 번은 한 번',
    A.linkMates(bk, [{ n: '오세움' }, { n: '가족' }, { n: '오 집사' }, { n: '바뀐 이름', p: 'pl' }, { n: ' ' }]), [{ n: '오세움', p: 'pl' }, { n: '가족' }]);
  sc.eq('㉞ 동행 글: 이은 분은 지금 이름으로(이름이 바뀌어도 따라감) · 지운 분이면 적어 둔 이름',
    A.mateText(A.normBook({ people: [{ id: 'pl', name: '오새이름', kind: 'lay' }] }), NV({ mates: [{ n: '오세움', p: 'pl' }, { n: '가족' }, { n: '지운', p: 'pzz' }] })), '오새이름 · 가족 · 지운');
  sc.eq('㉞ 모임 글', [A.meetText({ k: 'dept', g: '청년셀', memo: '저녁' }), A.meetText({ k: 'dept', g: '기타', memo: '여전도회' }), A.meetText({ k: 'dept' }), A.meetText({ k: 'new', who: '라새가', n: 2 }), A.meetText({ k: 'bapt', n: 3 }), A.meetText(null)],
    ['청년셀 · 저녁', '기타 · 여전도회', '부서모임', '새가족교육 2차 · 라새가', '침례교육 3차', '']);
  // 겹침 · 복사 · 내보내기가 새 칸을 본다
  const cb = A.normBook({ visits: [{ id: 'v|2026-11-22', who: [], days: '토일', at: 1 }], marks: [{ id: 'm|2026-11-22', tags: ['극동방송'], at: 1 }] });
  sc.eq('㉞ 극동방송 주: 동행이 비면 노랑 · 동행을 넣으면 풀림', [A.conflicts(cb, '2026-11-16', '2026-11-22', '').some(c => c.kind === 'staff'),
    (() => { const b = J(cb); A.put(b, 'visits', Object.assign({}, b.visits[0], { mates: [{ n: '가스텝' }] }), 'u', 2); return A.conflicts(b, '2026-11-16', '2026-11-22', '').some(c => c.kind === 'staff'); })()], [true, false]);
  const src = NV({ id: 'v|2026-11-08', mates: [{ n: '오세움', p: 'pl' }], meet: { k: 'dept', g: '청년셀' } }), src2 = NV({ id: 'v|2026-11-08', meet: { k: 'new', who: '라새가', n: 2 } });
  sc.eq('㉞ 지난 방문 복사: 동행 · 부서모임은 가져오고(비어 있을 때만) · 새가족 · 침례교육(차수)은 안 가져옴',
    [J(A.copyVisit(src, NV({}))).mates, J(A.copyVisit(src, NV({}))).meet, J(A.copyVisit(src, NV({ mates: [{ n: '그대로' }], meet: { k: 'bapt', n: 1 } }))).meet.k, 'meet' in A.copyVisit(src2, NV({}))],
    [[{ n: '오세움', p: 'pl' }], { k: 'dept', g: '청년셀' }, 'bapt', false]);
  // 쓰는 칸 — 동행 · 모임은 새 칸이라 낡은 앱(b10)이 떨군다 → b11
  sc.eq('㉞ 쓰는 칸 b11 · b10 은 옛 칸 (1116-2 C 에서 b12 — ㉟)', [A.OLD_FIELDS.includes('b10'), A.OLD_FIELDS.includes('b11')], [true, true]);
  const nb = A.normBook({ people: J(bk.people), visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', mates: [{ n: '오세움', p: 'pl' }], meet: { k: 'bapt', n: 2 }, at: 50 }, { id: 'v|2026-11-29', who: ['pa'], days: '토일', at: 50 }] });
  const ol = J(nb); for (const v of ol.visits) { delete v.mates; delete v.meet; } ol.visits[1].note = '낡은 앱 메모'; ol.visits[1].at = 60;   // 낡은 앱은 모르는 칸을 떨군 채 b10 에
  const pk = A.pickDoc(null, { b11: J(nb), b10: ol });
  sc.eq('㉞ 낡은 앱(b10)과 합쳐도 동행 · 모임 그대로 · 낡은 앱이 고친 메모도 받음 · 옛 칸을 치우려 한 번 씀',
    [pk.book.visits[0].mates, pk.book.visits[0].meet, pk.book.visits[1].note, pk.push], [[{ n: '오세움', p: 'pl' }], { k: 'bapt', n: 2 }, '낡은 앱 메모', true]);
  sc.eq('㉞ 옛 칸(b10)에만 있는 옛 글 방문도 b11 로 옮겨 읽음', (r => [r.book.visits[0].mates, r.book.visits[0].meet, r.push])(A.pickDoc(null, { b10: { visits: [{ id: 'v|2026-11-22', staff: '가스텝', group: '청년셀', at: 3 }] } })),
    [[{ n: '가스텝' }], { k: 'dept', g: '청년셀', memo: '청년셀' }, true]);
  // 교역자도 모임을 고친다 (HB 11/16) — 자기 칸의 그 방문 줄 meet · meetAt → absorb, 칸마다 고친 때
  const tb = A.normBook({ people: [{ id: 'pa', name: '가교역', roles: ['busan'], email: 'ga@example.com', at: 1 }, { id: 'pb', name: '나교역', roles: ['busan'], email: 'nb@example.com', at: 1 }],
    visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', note: '처음', at: 1000 }, { id: 'v|2026-11-29', who: ['pb'], days: '토일', at: 1000 }] });
  const pt = A.staffPatch('ga@example.com', 'meet', 'v|2026-11-22', { k: 'new', who: '라새가', n: 2 }, 2000);
  sc.eq('㉞ 교역자 조각 = 그 방문 줄 안 · 모든 칸을 적는다(Firestore 합치기가 옛 칸을 남기지 않게) · 비우면 null',
    [J(pt), J(A.staffPatch('ga@example.com', 'meet', 'v|2026-11-22', null, 2100))],
    [{ email: 'ga@example.com', at: 2000, visits: { 'v|2026-11-22': { meet: { k: 'new', g: '', who: '라새가', n: 2, memo: '' }, meetAt: 2000 } } },
      { email: 'ga@example.com', at: 2100, visits: { 'v|2026-11-22': { meet: null, meetAt: 2100 } } }]);
  const d1 = A.staffMerge({ email: 'ga@example.com', visits: { 'v|2026-11-22': { meet: { k: 'dept', g: '청년셀', who: '', n: 0, memo: '저녁' }, meetAt: 1500, stay: [{ name: '호텔' }], stayAt: 1400 } } }, pt);
  sc.eq('㉞ 조각을 합쳐도 같은 방문의 숙소는 그대로 · 모임은 통째로 바뀜(메모가 남지 않음)', [d1.visits['v|2026-11-22'].stay[0].name, A.normStaff(d1).visits['v|2026-11-22'].meet], ['호텔', { k: 'new', who: '라새가', n: 2 }]);
  const sA = { email: 'ga@example.com', visits: { 'v|2026-11-22': { meet: { k: 'new', who: '라새가', n: 2 }, meetAt: 2000 }, 'v|2026-11-29': { meet: { k: 'bapt', n: 1 }, meetAt: 2000 } } };
  const r1 = A.absorb(tb, [sA]), rv = (b, id) => b.visits.find(v => v.id === id);
  sc.eq('㉞ 자기가 든 방문의 모임을 받는다(고친 때 · 누가) · 남의 방문은 안 받음 · 메모는 그대로',
    [rv(r1.book, 'v|2026-11-22').meet, rv(r1.book, 'v|2026-11-22').meetAt, rv(r1.book, 'v|2026-11-22').meetBy, rv(r1.book, 'v|2026-11-22').note, 'meet' in rv(r1.book, 'v|2026-11-29'), r1.changed],
    [{ k: 'new', who: '라새가', n: 2 }, 2000, 'pa', '처음', false, ['v|2026-11-22']]);
  sc.eq('㉞ 두 번 받아도 바뀌는 것 없음(핑퐁 없음)', A.absorb(r1.book, [sA]).changed, []);
  const hbLate = J(r1.book); A.put(hbLate, 'visits', Object.assign({}, rv(hbLate, 'v|2026-11-22'), { meet: { k: 'dept', g: '장년셀' } }), 'hb', 3000);
  sc.eq('㉞ HB 가 그 뒤에 모임을 고치면 HB 것(고친 때 = 지금 · 누가 지움) · 교역자가 또 나중에 고치면 교역자 것',
    [rv(A.absorb(hbLate, [sA]).book, 'v|2026-11-22').meet, rv(hbLate, 'v|2026-11-22').meetAt, rv(hbLate, 'v|2026-11-22').meetBy,
      rv(A.absorb(hbLate, [{ email: 'ga@example.com', visits: { 'v|2026-11-22': { meet: null, meetAt: 4000 } } }]).book, 'v|2026-11-22').meet],
    [{ k: 'dept', g: '장년셀' }, 3000, undefined, undefined]);
  const hbMemo = J(r1.book); A.put(hbMemo, 'visits', Object.assign({}, rv(hbMemo, 'v|2026-11-22'), { note: 'HB 메모' }), 'hb', 3000);
  sc.eq('㉞ HB 가 메모만 고치면 모임의 고친 때는 그대로(교역자 것이 밀리지 않음)', [rv(hbMemo, 'v|2026-11-22').meetAt, rv(hbMemo, 'v|2026-11-22').meetBy], [2000, 'pa']);
  const v0 = J(rv(tb, 'v|2026-11-22'));
  sc.eq('㉞ 교역자 앱이 고친 방문 → 모임만 자기 칸에(동행 · 메모는 버림)', A.staffEdits(v0, Object.assign(J(v0), { meet: { k: 'bapt', n: 3 }, mates: [{ n: '몰래' }], note: '몰래' })).map(x => [x.kind, J(x.val)]), [['meet', { k: 'bapt', n: 3 }]]);
  sc.eq('㉞ 교역자 칸 다듬기: 모르는 모임 = 비움(null) · 고친 때 없는 모임은 버림',
    [J(A.normStaff({ email: 'ga@example.com', visits: { 'v|2026-11-22': { meet: { k: 'x' }, meetAt: 5 } } }).visits), J(A.normStaff({ email: 'ga@example.com', visits: { 'v|2026-11-22': { meet: { k: 'bapt' } } } }).visits)],
    [{ 'v|2026-11-22': { meet: null, meetAt: 5 } }, {}]);
  // 부산 요약 칸 → 고칠 판 · 먼저 보일 자리
  const sv = NV({ stay: [{ name: '취소함', status: 'cancel', cost: 50000, cancelBy: '2026-11-10' }, { kind: 'home', name: '성도 댁' }, { kind: 'hotel', name: '나호텔', cost: 80000, cancelBy: '2026-11-20' }, { kind: 'hotel', name: '다호텔', cancelBy: '2026-11-18' }] });
  sc.eq('㉞ 칸 → 판: 교역자 · 요일은 같은 판(누른 자리 먼저) · 예배 인도는 예배 판(1116-2 D) · 숙소는 그 숙소 · 동행 · 모임',
    ['who', 'days', 'lead', 'mate', 'meet'].map(c => J(A.colTarget(sv, c))).concat([J(A.colTarget(sv, 'stay', 2)), J(A.colTarget(sv, 'stay', 9))]),
    [{ sec: 'who', i: -1, focus: 'who' }, { sec: 'who', i: -1, focus: 'days' }, { sec: 'ev', i: -1, focus: 'lead' }, { sec: 'mate', i: -1, focus: 'mate' }, { sec: 'meet', i: -1, focus: 'meet' },
      { sec: 'stay', i: 2, focus: 'stay' }, { sec: 'stay', i: -1, focus: 'stay' }]);
  sc.eq('㉞ 금액 → 금액 있는 호텔(취소한 곳 빼고) · 취소 기한 → 표에 보이는 가장 이른 기한의 숙소(취소한 곳 빼고)', [J(A.colTarget(sv, 'cost')), J(A.colTarget(sv, 'cancel'))],
    [{ sec: 'stay', i: 2, focus: 'cost' }, { sec: 'stay', i: 3, focus: 'cancel' }]);
  sc.eq('㉞ 숙소가 없으면 새 숙소 판 · 기한이 없으면 첫 숙소(환불 불가 먼저)', [J(A.colTarget(NV({}), 'cost')), J(A.colTarget(NV({ stay: [{ name: '가' }, { name: '나', nofree: true }] }), 'cancel')), J(A.colTarget(NV({ stay: [{ kind: 'home', name: '댁' }] }), 'cost')), A.colTarget(sv, 'xx')],
    [{ sec: 'stay', i: -1, focus: 'cost' }, { sec: 'stay', i: 1, focus: 'cancel' }, { sec: 'stay', i: 0, focus: 'cost' }, null]);
  sc.eq('㉞ 교역자가 자기 방문에서 바로 고칠 수 있는 칸 = 숙소 · 모임 · 교통(알림 판 줄 — 1117-Z 2c) (금액 · 취소 기한은 HB 전용 — 1117-Z 1)', A.STAFF_COLS, ['stay', 'meet', 'travel']);
  // 내보내기 · 화면
  const eb = A.normBook({ people: [{ id: 'pa', name: '가교역', roles: ['busan'] }, { id: 'pl', name: '오세움', kind: 'lay' }], visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', mates: [{ n: '옛이름', p: 'pl' }, { n: '가족' }], meet: { k: 'new', who: '라새가', n: 2 }, at: 1 }] });
  const ex = A.exportRows(eb, 'busan', '2026-11', {});
  sc.eq('㉞ 부산 요약 내보내기: 끝에 동행(이은 분은 지금 이름) · 모임', [ex[0].slice(11, 13), ex[1].slice(11, 13)], [['동행', '모임'], ['오세움 · 가족', '새가족교육 2차 · 라새가']]);
  sc.eq('㉞ 표: 열 아홉(동행 · 모임 따로) · 칸마다 누르면 그 판(data-vcol) · 숙소는 숙소마다',
    [/<th class="h-bs">동행<\/th><th class="h-bs">모임<\/th><\/tr>/.test(HTML), ['who', 'days', 'lead', 'stay', 'cost', 'cancel', 'mate', 'meet'].every(c => HTML.includes(`cb_(v, '${c}'`)) && HTML.includes('data-vcol="${col}"'), /data-vcol="stay" data-i="\$\{v\.stay\.indexOf\(x\)\}"/.test(HTML)], [true, true, true]);
  sc.eq('㉞ 누른 칸으로 열기 · 교역자는 자기 방문의 숙소 · 금액 · 취소 기한 · 모임만', [/if \(d\.visit\) return openVisitCol\(d\.visit, d\.vcol, d\.i\);/.test(HTML), /STAFF_COLS\.includes\(col\) && myVisit\(v\)/.test(HTML)], [true, true]);
  sc.eq('㉞ 교역자 방문 판: 모임 판도 열고 · 그 판에서 저장', /if \(!ed\) return d\.vsec === 'stay' \|\| d\.vsec === 'travel' \|\| d\.vsec === 'meet';/.test(HTML) && /\(ed\.sec === 'stay' \|\| ed\.sec === 'travel' \|\| ed\.sec === 'meet'\)/.test(HTML), true);
  sc.eq('㉞ 금액 · 취소 기한: 빨간 테두리 + 커서(focus)', [/class="inp cost\$\{ed\.focus === 'cost' \? ' redf' : ''\}"/.test(HTML), /data-df="cancelBy"[^>]*\$\{ed\.focus === 'cancel' \? ' redf' : ''\}|\$\{ed\.focus === 'cancel' \? ' redf' : ''\}"[^>]*data-df="cancelBy"/.test(HTML), /\.redf\{/.test(HTML)], [true, true, true]);
  sc.eq('㉞ 보안 규칙은 그대로(교역자 칸 visits 안)', /hasOnly\(\['email', 'at', 'v', 'visits', 'away', 'awayAt', 'can', 'canAt', 'ui'\]\)/.test(fs.readFileSync(path.join(__dirname, 'rules', 'rota.rules'), 'utf8')), true);
}


// ㉟ 숙소 판 (1116-2 C, HB 11/16) — 지어낸 이름 · 이메일
{
  const ST = (o) => A.normStay(o);
  sc.eq('㉟ 상태 목록: 호텔 = 미정 · 예약 전 · 예약 완료 · 취소 / 성도님 댁 = 미정 · 대화 전 · 대화 중 · 대화 완료 · 취소',
    [A.STAY_ST.hotel.map(x => x[1]), A.STAY_ST.home.map(x => x[1])],
    [['미정', '예약 전', '예약 완료', '취소'], ['미정', '대화 전', '대화 중', '대화 완료', '취소']]);
  sc.eq('㉟ 옛 값 옮겨 읽기: 호텔의 ask(옛 글자 \'대화 중\') → 예약 전(pre) · 댁의 ask 는 그대로 · 옛 \'\' · done · cancel 그대로 · 모르는 값 = 미정',
    [ST({ kind: 'hotel', status: 'ask' }).status, ST({ status: 'ask' }).status, ST({ kind: 'home', status: 'ask' }).status, ST({ kind: 'hotel', status: '' }).status, ST({ kind: 'home', status: 'done' }).status, ST({ kind: 'hotel', status: 'cancel' }).status, ST({ kind: 'home', status: 'pre' }).status, ST({ kind: 'hotel', status: 'pre' }).status, ST({ kind: 'home', status: 'zz' }).status, ST({ kind: 'hotel', status: 3 }).status],
    ['pre', 'pre', 'ask', '', 'done', 'cancel', 'pre', 'pre', '', '']);
  sc.eq('㉟ 이름: 호텔 예약 전 · 예약 완료 / 댁 대화 전 · 대화 중 · 대화 완료 · 미정 · 취소',
    [{ kind: 'hotel', status: 'pre' }, { kind: 'hotel', status: 'done' }, { kind: 'home', status: 'pre' }, { kind: 'home', status: 'ask' }, { kind: 'home', status: 'done' }, { kind: 'home', status: '' }, { kind: 'hotel', status: 'cancel' }, { kind: 'hotel', status: 'ask' }].map(A.stayStName),
    ['예약 전', '예약 완료', '대화 전', '대화 중', '대화 완료', '미정', '취소', '예약 전']);
  const NV = (stay, o) => A.normVisit(Object.assign({ id: 'v|2026-11-22', at: 1, stay }, o || {}));
  sc.eq('㉟ 숙소 미정 판단: 미정 · 예약 전 · 대화 전 · 대화 중 = 아직, 모두 완료면 완료 (취소한 곳은 셈 안 함)',
    [NV([{ status: 'pre' }]), NV([{ kind: 'home', status: 'ask' }]), NV([{ kind: 'home', status: 'pre' }, { status: 'done' }]), NV([{ kind: 'home', status: 'done' }, { status: 'cancel' }])].map(A.stayState),
    ['open', 'open', 'open', 'done']);
  sc.eq('㉟ 숙소 쓰는 사람: 함께 · 남 숙소 · 여 숙소 (값은 예전 그대로 \'\' · 남 · 여)', A.STAY_FOR, [['', '함께'], ['남', '남 숙소'], ['여', '여 숙소']]);
  sc.eq('㉟ 묻는 때: 동행 스텝이 있을 때 · 이미 적혀 있을 때(지울 수 있게) · 다른 숙소가 있을 때(남 · 여 따로) — 혼자 한 숙소면 안 물음',
    [A.stayForAsk(NV([{ name: '가' }]), 0, { for: '' }), A.stayForAsk(NV([{ name: '가' }], { mates: [{ n: '스텝' }] }), 0, { for: '' }), A.stayForAsk(NV([]), -1, { for: '여' }),
      A.stayForAsk(NV([{ name: '가' }]), -1, { for: '' }), A.stayForAsk(NV([{ name: '가', status: 'cancel' }]), -1, { for: '' })],
    [false, true, true, true, false]);
  // 성도님 댁은 취소 기한 · 예약 화면이 없다 — 옛 기록에 기한이 남아 있어도 알림 · 표 · 판 이동은 호텔만
  const b = A.normBook({ people: [{ id: 'a', name: '가가', roles: ['busan'] }], visits: [{ id: 'v|2026-11-22', who: ['a'], days: '토일', stay: [{ kind: 'home', name: '어느 댁', status: 'done', cancelBy: '2026-11-18' }, { kind: 'hotel', name: '바다', status: 'done', cancelBy: '2026-11-19' }] }] });
  sc.eq('㉟ 댁의 옛 취소 기한은 알림에 안 뜸(호텔 것만) · 부산 준비의 기한도 호텔 것 · 표의 취소 기한 칸 → 호텔', [A.chores(b, '2026-11-17').filter(c => c.kind === 'cancel').map(c => c.name), A.tripChecks(b, b.visits[0], 'a').items[0].cancelBy, J(A.colTarget(b.visits[0], 'cancel'))],
    [['바다'], '2026-11-19', { sec: 'stay', i: 1, focus: 'cancel' }]);
  sc.eq('㉟ 댁만 있으면 취소 기한 칸 → 그 댁(새 숙소 판이 아니라) · stayHotel', [J(A.colTarget(NV([{ kind: 'home', name: '댁' }]), 'cancel')), A.stayHotel({ kind: 'home' }), A.stayHotel({ kind: 'hotel' })], [{ sec: 'stay', i: 0, focus: 'cancel' }, false, true]);
  // 알약 끌어 순서 — 보이는 쪽(호텔 · 댁)만 다시 놓고 다른 쪽 자리는 그대로
  const ob = A.normBook({ opts: [
    { id: A.optId('stay', '호텔 가', 'hotel'), type: 'stay', name: '호텔 가', kind: 'hotel', ord: 0, at: 1 },
    { id: A.optId('stay', '가정 하나', 'home'), type: 'stay', name: '가정 하나', kind: 'home', ord: 1, at: 1 },
    { id: A.optId('stay', '호텔 나', 'hotel'), type: 'stay', name: '호텔 나', kind: 'hotel', ord: 2, at: 1 },
    { id: A.optId('stay', '호텔 다', 'hotel'), type: 'stay', name: '호텔 다', kind: 'hotel', ord: 3, at: 1 }] });
  const hid = (n) => A.optId('stay', n, 'hotel');
  const r1 = J(ob), ch = A.optReorder(r1, 'stay', [hid('호텔 다'), hid('호텔 가'), hid('호텔 나')], 'u', 50);
  sc.eq('㉟ 끌어 순서: 호텔 셋을 다 · 가 · 나 로 → 댁 자리는 그대로 · 0,1,2… 다시 매김 · 바뀌었다', [ch, A.optList(r1, 'stay').map(o => o.name), A.optList(r1, 'stay').map(o => o.ord)],
    [true, ['호텔 다', '가정 하나', '호텔 가', '호텔 나'], [0, 1, 2, 3]]);
  const r2 = J(ob), same = A.optReorder(r2, 'stay', [hid('호텔 가'), hid('호텔 나'), hid('호텔 다'), 'o|stay|모름', hid('호텔 가')], 'u', 60);
  sc.eq('㉟ 차례가 그대로면 아무것도 안 씀 · 모르는 id · 겹친 id 는 버림', [same, JSON.stringify(r2) === JSON.stringify(ob)], [false, true]);
  const r3 = A.normBook({ visits: [{ id: 'v|2026-11-01', stay: [{ kind: 'hotel', name: '가호텔', status: 'done' }, { kind: 'hotel', name: '나호텔', status: 'done' }, { kind: 'hotel', name: '나호텔', status: 'done' }] }] });
  sc.eq('㉟ 목록을 저장한 적 없으면(기본값) 먼저 적어 두고 다시 놓음', [A.optReorder(r3, 'stay', [hid('가호텔'), hid('나호텔')], 'u', 70), A.optList(r3, 'stay').map(o => o.name), r3.opts.length], [true, ['가호텔', '나호텔'], 2]);
  const dev2 = J(ob); A.optEdit(dev2, hid('호텔 나'), { name: '호텔 나', cost: 70000 }, 'u2', 40);
  sc.eq('㉟ 다른 기기가 앞서 금액만 고쳤어도 순서는 나중 것(줄마다 나중 것이 이김)', A.optList(A.mergeBook(r1, dev2), 'stay').map(o => o.name), ['호텔 다', '가정 하나', '호텔 가', '호텔 나']);
  // 새 값(pre)을 낡은 앱(b11)이 '미정' 으로 떨군다 → 쓰는 칸 b12
  sc.eq('㉟ 쓰는 칸 b12 · b11 은 옛 칸 (1116-2 D 에서 b13 — ㊲)', [A.OLD_FIELDS.includes('b11'), A.OLD_FIELDS.includes('b12')], [true, true]);
  const nb = A.normBook({ visits: [{ id: 'v|2026-11-22', days: '토일', stay: [{ kind: 'hotel', name: '바다', status: 'pre' }], at: 50 }, { id: 'v|2026-11-29', days: '토일', at: 50 }] });
  const ol = J(nb); ol.visits[0].stay[0].status = ''; ol.visits[1].note = '낡은 앱 메모'; ol.visits[1].at = 60;
  const pk = A.pickDoc(null, { b12: J(nb), b11: ol });
  sc.eq('㉟ 낡은 앱(b11)과 합쳐도 예약 전은 그대로 · 낡은 앱이 고친 메모도 받음 · 옛 칸을 치우려 한 번 씀', [pk.book.visits[0].stay[0].status, pk.book.visits[1].note, pk.push], ['pre', '낡은 앱 메모', true]);
  sc.eq('㉟ b11 에만 있는 옛 호텔 \'대화 중\' → 예약 전으로 읽고 b12 로 씀', (r => [r.book.visits[0].stay[0].status, r.push])(A.pickDoc(null, { b11: { visits: [{ id: 'v|2026-11-22', stay: [{ kind: 'hotel', name: '바다', status: 'ask' }], at: 3 }] } })), ['pre', true]);
  // 교역자 칸 — 숙소는 예전처럼 그 방문 줄 안(보안 규칙 그대로), 새 상태도 지나간다
  const sp = A.normStaff({ email: 'ga@example.com', visits: { 'v|2026-11-22': { stay: [{ kind: 'home', name: '댁', status: 'pre' }, { kind: 'hotel', name: '호', status: 'ask' }], stayAt: 9 } } });
  sc.eq('㉟ 교역자 칸 숙소: 대화 전 그대로 · 옛 호텔 대화 중은 예약 전', sp.visits['v|2026-11-22'].stay.map(x => x.status), ['pre', 'pre']);
  // 화면
  const f = HTML.slice(HTML.indexOf("} else if (ed.sec === 'stay') {"), HTML.indexOf("} else if (ed.sec === 'travel') {"));
  sc.eq('㉟ 숙소 판 순서: 숙소 쓰는 사람(묻는 때만) → 호텔 · 성도님 댁 → 알약 → 상태(종류마다)',
    [f.indexOf('stayForAsk(v, ed.i, d)') > 0 && f.indexOf('stayForAsk(v, ed.i, d)') < f.indexOf("seg3('kind'"), f.indexOf("seg3('kind'") < f.indexOf('class="tg spill'), f.indexOf('class="tg spill') < f.indexOf("seg3('status', STAY_ST[d.kind]"), /seg3\('for', STAY_FOR, d\.for\)/.test(f)], [true, true, true, true]);
  sc.eq('㉟ 성도님 댁: 금액 · 취소 기한 · 예약 화면을 감춤(호텔일 때만 그림)', (() => { const k = f.indexOf('${hotel && own ? `'), e = f.indexOf("` : ''}\n", k); const h = f.slice(k, e); return [k > 0, /취소 기한/.test(h), /예약 화면 캡쳐 이미지 첨부/.test(h), /data-dcost/.test(h)]; })(), [true, true, true, true]);
  sc.eq('㉟ 저장: 댁은 금액 · 취소 기한 · 환불 불가를 비움 · 상태는 종류에 맞춤 · 종류를 바꾸면 상태도 맞춤',
    [/if \(s\.kind !== 'hotel'\) \{ s\.cost = 0; delete s\.cancelBy; delete s\.cancelAt; delete s\.nofree; \}/.test(HTML), /s\.status = stayStOf\(s\.kind, s\.status\);/.test(HTML), /dd\.status = stayStOf\(dd\.kind, dd\.status\);/.test(HTML)], [true, true, true]);
  const g = HTML.slice(HTML.indexOf('function spInit('), HTML.indexOf('function spInit(') + 4000);
  sc.eq('㉟ 알약: 꾹(0.45초) = 들림 → 떼면 고치기 · 끌면 순서(놓을 때 optReorder 한 번) · 마우스는 바로 끌기 · 오른쪽 단추 = 고치기 · 교역자는 고르기만',
    [/setTimeout\(lift, 450\)/.test(g), /optReorder\(S\.book, 'stay'/.test(HTML.slice(HTML.indexOf('function spDrop('), HTML.indexOf('function spDrop(') + 600)), /'contextmenu'/.test(g), /isStaff\(\)/.test(g), /passive: false/.test(g), /spInit\(\);/.test(HTML)],
    [true, true, true, true, true, true]);
}

// ㊱ (1117-3) 계정에서 온 이름 명단(wkeys)을 칸 차례 없이 견준다 — 파이어베이스는 칸을 이름순으로 돌려준다.
//   차례로 견주면 언제나 '다르다' → 저장 → 받음 → 또 저장이 끝없이 돌아 화면이 쉬지 않고 다시 그려졌다(터치가 먹히지 않고 깜박임)
{
  const mine = { pb: ['나'], p0: ['가', '가가'] }, cloud = { p0: ['가', '가가'], pb: ['나'] };
  sc.eq('㊱ 칸 차례만 다르면 같다 · 이름 · 다른 이름 · 사람 수가 다르면 다르다 · 계정에 없으면 다르다',
    [A.sameWkeys(mine, cloud), A.sameWkeys(mine, { p0: ['가'], pb: ['나'] }), A.sameWkeys(mine, { p0: ['가', '가가'] }), A.sameWkeys(mine, undefined), A.sameWkeys({}, undefined)],
    [true, false, false, false, true]);
  sc.eq('㊱ 계정에서 받을 때 wkeys 는 sameWkeys 로 견준다(JSON 차례 비교 금지)', /!sameWkeys\(wkeysOf\(S\.book\), d\.data\(\)\.wkeys\)/.test(HTML) && !/JSON\.stringify\(wkeysOf/.test(HTML), true);
}

// ㊲ 특별예배 (1116-2 D, HB 11/17) — 성탄 12/24(목) 저녁 · 12/25(금) 오전처럼 주일이 아닌 날 중심의 부산 일정
{
  const SB = A.normBook({
    people: [{ id: 'pa', name: '가가', roles: ['busan', 'offer'], email: 'ga@example.com' }, { id: 'pd', name: '다다', roles: ['busan'] }, { id: 'pl', name: '나나', kind: 'lay', roles: ['lead'] }],
    slots: [{ id: '2026-12-25|fri|offer', who: ['pl'], at: 1 }],
    marks: [{ id: 'm|2026-12-20', tags: ['성탄'], at: 1 }],
    visits: [
      { id: 'v|2026-12-20', who: ['pd'], days: '금토일', at: 1 },
      { id: 'v|2026-12-24', who: ['pa'], days: '목', title: '  성탄  ', at: 1, evs: [
        { d: '2026-12-25', t: '10:30', n: '성탄 예배', m: 'lay', p: 'pl' }, { d: '2026-12-24', t: '저녁', n: '성탄 전야 예배', m: 'staff' },
        { d: '2026-12-25', t: '오후', n: '성탄 발표회', m: '??' }, { d: '2026-12-27', n: '범위 밖(+3)' }, { d: '2026-12-24', n: '' }, { d: 'x', n: '날짜 틀림' }] },
      { id: 'v|2026-12-27', who: ['pa', 'pd'], days: '토일', at: 1 }] });
  const sv = SB.visits.find(v => v.id === 'v|2026-12-24');
  sc.eq('㊲ 이름은 다듬어 둠 · 예배는 날짜 · 때 순 · 범위(앞 닷새 ~ 다음 날) 밖 · 이름 없음 · 날짜 틀림은 버림 · 모르는 인도는 미정',
    [sv.title, sv.evs.map(e => [e.d.slice(5), e.t, e.n, e.m || '', e.p || ''])],
    ['성탄', [['12-24', '저녁', '성탄 전야 예배', 'staff', ''], ['12-25', '10:30', '성탄 예배', 'lay', 'pl'], ['12-25', '오후', '성탄 발표회', '', '']]]);
  sc.eq('㊲ 옛 일정(두 칸 없음)은 모양이 그대로 — 칸 자체가 없다', ['title', 'evs'].map(k => k in SB.visits[0]), [false, false]);
  sc.eq('㊲ 예배 날짜로 고를 수 있는 날 = 12/19 ~ 12/25 (머무는 요일 고르기와 같은 범위)', [A.evDates('2026-12-24')[0], A.evDates('2026-12-24')[6], A.evDates('2026-12-24').length], ['2026-12-19', '2026-12-25', 7]);
  const ls = A.visitLeads(SB, sv);
  sc.eq('㊲ 인도 알약: 정해진 셋은 안 열림(주일 범위 밖 · 넷째 금요일) · 더한 예배는 요일 + 때 + 이름 + 인도 · 미정은 none',
    ls.map(x => [x.k, x.text, x.date.slice(5)]), [['ev', '목 저녁 성탄 전야 예배 인도', '12-24'], ['lay', '금 10:30 성탄 예배 · 나나', '12-25'], ['none', '금 오후 성탄 발표회', '12-25']]);
  // 겹침
  const cf = A.conflicts(SB, '2026-12-01', '2026-12-31', '2026-12-01');
  const ov = cf.find(c => c.kind === 'overlap' && c.pid === 'pl');
  sc.eq('㊲ 성도 인도자가 부산 성탄 예배를 인도하는 날 분당 금요 헌금 = 빨강 · 글에 예배 이름', [!!ov, ov && A.conflictText(SB, ov)], [true, '나나 — 12/25(금) 부산 성탄 예배 인도인데 분당 금요 헌금']);
  sc.eq('㊲ 두 주 연속: 주일에 안 머무는 성탄 일정(12/24)은 셈하지 않음 — 가가(12/24 → 12/27)는 없고 다다(12/20 → 12/27)는 그대로',
    cf.filter(c => c.kind === 'twice').map(c => c.pid), ['pd']);
  sc.eq('㊲ 주일에 머무는가: 12/24(목만) 아님 · 12/20(금토일) · 12/27(토일) 그 주일', [A.vSun(sv), A.vSun(SB.visits[0]), A.vSun(SB.visits[2])], ['', '2026-12-20', '2026-12-27']);
  // 교역자 인도 날은 머무는 날에
  sc.eq('㊲ 교역자가 인도하는 예배 날(12/25)이 머무는 날 밖이면 더함 · 성도 · 미정은 그대로 · 이미 있으면 그대로',
    [A.evFixDays('2026-12-24', '목', [{ d: '2026-12-25', n: '가', m: 'staff' }, { d: '2026-12-23', n: '나', m: 'lay' }]), A.evFixDays('2026-12-24', '목금', [{ d: '2026-12-25', n: '가', m: 'staff' }])].map(J),
    [{ days: '목금', added: ['2026-12-25'] }, { days: '목금', added: [] }]);
  // 이름 짐작 · 예배 이름 알약
  sc.eq('㊲ 이름 짐작: 그 주 교회 일정 표시가 성탄이고 주일이 아닌 날이면 \'성탄\' · 주일 · 표시 없는 주는 비움',
    [A.titleGuess(SB, '2026-12-24'), A.titleGuess(SB, '2026-12-20'), A.titleGuess(SB, '2026-12-31')], ['성탄', '', '']);
  sc.eq('㊲ 이름 알약 기본 = 성탄 · 송구영신 · 특별예배 (HB 11/17) + 직접 쓰기', J(A.TITLE_CHIPS), ['성탄', '송구영신', '특별예배']);
  sc.eq('㊲ 예배 이름 알약 = 같은 이름의 지난 일정에서 쓴 것 + \'이름 예배\' · 특별예배는 덧붙이지 않음',
    [A.evNameChips(SB, '성탄'), A.evNameChips(SB, '특별예배'), A.evNameChips(SB, '송구영신')], [['성탄 발표회', '성탄 예배', '성탄 전야 예배'], [], ['송구영신 예배']]);
  // 내 일정 · 부산 준비
  const ni = A.myItems(SB, 'pl', '2026-12-20', '2026-12-31').filter(r => r.kind === 'blead');
  sc.eq('㊲ 나나(성도 인도자) 내 일정: 일정에 들지 않아도 12/25 성탄 예배 인도 한 줄', ni.map(r => [r.date, r.text]), [['2026-12-25', '금 10:30 성탄 예배 인도']]);
  const tc = A.tripChecks(SB, sv, 'pa');
  sc.eq('㊲ 가가 부산 준비: 예배 줄(알림만 — 셈에 안 넣음)', [tc.items.filter(x => x.key === 'ev').map(x => [x.state, x.text]), tc.total], [[['info', '목 저녁 성탄 전야 예배 인도 · 금 10:30 성탄 예배 · 나나 · 금 오후 성탄 발표회']], 4]);
  // 내보내기 · 달력
  const ex = A.exportRows(SB, 'busan', '2026-12', {}), r24 = ex.find(r => r[0] === '12/24');
  sc.eq('㊲ 부산 요약 내보내기: 앞 열 차례 그대로 + 끝에 이름 · 예배', [ex[0].slice(-3), r24.slice(-2), ex.find(r => r[0] === '12/20').slice(-2)],
    [['모임', '이름', '예배'], ['성탄', '12/24 저녁 성탄 전야 예배(교역자), 12/25 10:30 성탄 예배(나나), 12/25 오후 성탄 발표회'], ['', '']]);
  sc.eq('㊲ 예배별 시트: 그 주 부산 교역자 칸 = \'다다 / 가가(성탄 12/24)\'', A.sheetRows(SB, '2026-12').find(r => r[0] === '12/20')[8], '다다 / 가가(성탄 12/24)');
  sc.eq('㊲ 월 달력 \'부산\': 머무는 날 줄에 이름 · 그 날 더한 예배 이름', [A.dayLines(SB, '2026-12-24', 'busan').map(l => l.text), A.dayLines(SB, '2026-12-25', 'busan').map(l => l.text)],
    [['가가 · 성탄', '저녁 성탄 전야 예배 인도'], ['10:30 성탄 예배 · 나나', '오후 성탄 발표회']]);
  const cal = A.exportRows(SB, 'cal', '2026-12', { calf: 'busan' }), c25 = cal.flat().find(x => /^25일/.test(x));
  sc.eq('㊲ 월 달력 내보내기: 더한 예배가 두 번 나오지 않음', (c25.match(/성탄 예배/g) || []).length, 1);
  // 저장 칸 · 낡은 앱 · 교역자
  sc.eq('㊲ 쓰는 칸 b13 · b12 는 옛 칸 (title · evs 를 낡은 앱이 떨군다 — 1116-2 E 에서 b14, ㊳)', [A.OLD_FIELDS.includes('b12'), A.OLD_FIELDS.includes('b13')], [true, true]);
  const old = J(SB); old.visits.forEach(v => { delete v.title; delete v.evs; });
  const pk = A.pickDoc(null, { b13: J(SB), b12: old });
  sc.eq('㊲ 낡은 앱(b12) 사본과 합쳐도(같은 때) 이름 · 예배는 남음 · 옛 칸을 치우려 한 번 씀', [pk.book.visits[1].title, pk.book.visits[1].evs.length, pk.push], ['성탄', 3, true]);
  sc.eq('㊲ b12 에만 있으면 그대로 읽고 b13 으로 옮겨 씀', (r => [r.book.visits.length, r.push])(A.pickDoc(null, { b12: old })), [3, true]);
  const st = A.normStaff({ email: 'ga@example.com', visits: { 'v|2026-12-24': { evs: [{ d: '2026-12-24', n: '바꿈', m: 'relay' }], evsAt: 99, title: '바꿈', titleAt: 99 } } });
  const ab = A.absorb(SB, [st]);
  sc.eq('㊲ 교역자 칸의 이름 · 예배는 받지 않는다(HB 만 — 11/17)', [J(st.visits), ab.book.visits[1].title, ab.book.visits[1].evs.length], [{}, '성탄', 3]);
  sc.eq('㊲ 교역자 상영(bs): 주일에 안 머무는 일정이면 주일 줄로 안 감', A.absorb(SB, [{ email: 'ga@example.com', visits: { 'v|2026-12-24': { bs: 'same', bsAt: 99 } } }]).book.shows.length, 0);
  sc.eq('㊲ 지난 일정 복사는 이름 · 예배를 가져오지 않음', ['title', 'evs'].map(k => k in A.copyVisit(sv, SB.visits[2])), [false, false]);
  // 화면 (글자 · 자리)
  const pv = HTML.slice(HTML.indexOf('function paneVisit('), HTML.indexOf('function openVEdit('));
  sc.eq('㊲ 부산 일정 판: \'교역자 · 요일\' 과 \'예배\' 칸 따로 · 주일 광고는 주일에 머무는 일정만 · 버튼 글자 \'부산 일정\'',
    [/sec\('who', '교역자 · 요일',/.test(pv), /sec\('ev', '예배'/.test(pv), /\$\{!vSun\(v\) \? '' : `<button class="vsec" data-act="ads"/.test(pv), /이 부산 일정 지우기/.test(pv), /지난 부산 일정에서 복사/.test(pv)], [true, true, true, true, true]);
  const pe = HTML.slice(HTML.indexOf("} else if (ed.sec === 'ev') {"), HTML.indexOf("} else if (ed.sec === 'stay') {"));
  sc.eq('㊲ 예배 판: 이름 알약 + 직접 쓰기 · 정해진 인도(leadField) · 예배마다 날짜 · 때 · 이름 · 인도 · + 예배 더하기',
    [/TITLE_CHIPS\.map/.test(pe), /직접 쓰기/.test(pe), /leadField\(d, v\)/.test(pe), ['data-devd', 'data-devt', 'data-devtm', 'data-df="evs.${k}.n"', 'data-devm', 'data-devp', 'data-devrm'].every(k => pe.includes(k)), /\+ 예배 더하기/.test(pe)], [true, true, true, true, true]);
  sc.eq('㊲ 교역자 · 요일 판에는 인도가 없다 · 표의 \'예배 인도\' 칸 → 예배 판', [/leadField\(d, v\)/.test(HTML.slice(HTML.indexOf("if (ed.sec === 'who') {"), HTML.indexOf("} else if (ed.sec === 'ev') {"))), J(A.colTarget(sv, 'lead'))], [false, { sec: 'ev', i: -1, focus: 'lead' }]);
  sc.eq('㊲ 교역자는 예배 판을 못 연다(staffOk 는 숙소 · 교통 · 모임만)', /return d\.vsec === 'stay' \|\| d\.vsec === 'travel' \|\| d\.vsec === 'meet';/.test(HTML), true);
  // 화면 글자에서 '방문' 이 사라졌는가 — 주석 · 특이사항 갈래 '방문자' 는 그대로 (HB 11/17: 방문 → 부산 일정)
  const ui = HTML.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').split('\n').filter(l => !/^\s*(\/\/|\/\*|\*|<!--)/.test(l)).map(l => l.replace(/\s\/\/\s.*$/, '').replace(/\/\*.*?\*\//g, '')).filter(l => /방문/.test(l.replace(/방문자/g, '')));
  sc.eq('㊲ 화면 글자에 \'방문\' 없음(\'부산 일정\' 으로) · \'방문자\' 갈래는 남음', [ui.length, /'방문자'/.test(HTML)], [0, true]);
}

// ㊳ 분당 특별예배 (1116-2 E, HB 11/17) — 정해진 예배(주일 · 수 · 금) 밖의 분당 예배: 12/24(목) 저녁 성탄 전야 · 12/25(금) 오전 성탄 · 12/31(목) 송구영신
{
  const XB = A.normBook({
    people: [{ id: 'pa', name: '가가', roles: ['preach', 'offer', 'busan'] }, { id: 'pb', name: '라라', roles: ['offer', 'lead'] }, { id: 'pc', name: '마마', roles: ['offer'] }],
    specs: [{ id: 'x|2026-12-24|1', n: ' 성탄 전야 예배 ', t: '저녁', roles: ['preach', 'offer', 'lead', '??'], at: 1 }, { id: 'x|2026-12-25|1', n: '성탄 예배', t: '10:30', rest: true, at: 1 },
      { id: 'x|2026-12-24|2', n: '', at: 1 }, { id: 'x|2026-12-24|0', n: '틀린 번호', at: 1 }, { id: 'x|2026-12-31|1', n: '송구영신 예배', rest: true, at: 1 }],
    slots: [{ id: '2026-12-24|x1|preach', who: ['pa'], at: 1 }, { id: '2026-12-25|x1|offer', who: ['pb'], at: 1 }, { id: '2026-12-24|x1|notice', who: ['pa'], at: 1 }, { id: '2026-12-24|x9|lead', who: ['pb'], at: 1 }],
    visits: [{ id: 'v|2026-12-25', who: ['pb'], days: '금', at: 1 }] });
  sc.eq('㊳ 다듬기: 이름 · 때 · 자리(모르는 자리 버림, 없으면 설교 · 헌금) · 쉼은 수 · 금요일만 · 이름 없음 · 번호 0 은 버림',
    XB.specs.map(x => [x.id, x.n, x.t || '', x.roles.join(','), !!x.rest]),
    [['x|2026-12-24|1', '성탄 전야 예배', '저녁', 'preach,offer,lead', false], ['x|2026-12-25|1', '성탄 예배', '10:30', 'preach,offer', true], ['x|2026-12-31|1', '송구영신 예배', '', 'preach,offer', false]]);
  sc.eq('㊳ 자리: 특별예배 자리(아무 날 · 설교 · 헌금 · 예배인도)는 남고 · 광고는 버림', XB.slots.map(x => x.id), ['2026-12-24|x1|preach', '2026-12-24|x9|lead', '2026-12-25|x1|offer']);
  sc.eq('㊳ 이름 찾기 · 자리 이름 · 그 날 쉼 · 기간 안 차례', [A.specOf(XB, '2026-12-24', 'x1').n, A.slotLabelB(XB, '2026-12-25', 'x1', 'offer'), !!A.restOn(XB, '2026-12-25'), !!A.restOn(XB, '2026-12-24'), A.specsIn(XB, '2026-12-20', '2026-12-31').map(x => x.date)],
    ['성탄 전야 예배', '성탄 예배 헌금인도', true, false, ['2026-12-24', '2026-12-25', '2026-12-31']]);
  // 겹침: 부산에 있는 날(12/25) 성탄 예배 헌금 = 빨강, 글에 예배 이름
  const cf = A.conflicts(XB, '2026-12-20', '2026-12-31', '2026-12-01'), ov = cf.find(c => c.kind === 'overlap');
  sc.eq('㊳ 부산에 있는 날 분당 특별예배 자리 = 빨강 · 글에 예배 이름', [ov && ov.slot, ov && A.conflictText(XB, ov)], ['2026-12-25|x1|offer', '라라 — 12/25(금) 부산에 있는데 분당 성탄 예배 헌금인도']);
  sc.eq('㊳ 맡지 않는 일이면 노랑(라라는 설교 안 맡음)', (() => { const b = A.normBook(J(XB)); A.setSlot(b, '2026-12-24|x1|preach', ['pb'], '', 'u', 5); return A.conflicts(b, '2026-12-24', '2026-12-24', '2026-12-01').some(c => c.kind === 'role' && c.pid === 'pb'); })(), true);
  // 내 일정 · 사람 × 주 · 월 달력
  const mi = A.myItems(XB, 'pa', '2026-12-20', '2026-12-31').filter(r => r.kind === 'slot');
  sc.eq('㊳ 내 일정: 특별예배 줄은 이름과 함께 · 예배가 없는 자리(x9)는 안 보임', mi.map(r => [r.date, r.grp, A.itemLabel(r)]), [['2026-12-24', 'sp', '성탄 전야 예배 설교']]);
  sc.eq('㊳ 내 일정(라라): 성탄 예배 헌금 · 지워진 예배(x9) 자리는 안 보임', A.myItems(XB, 'pb', '2026-12-20', '2026-12-31').filter(r => r.kind === 'slot').map(r => A.itemLabel(r)), ['성탄 예배 헌금인도']);
  sc.eq('㊳ 사람 × 주: 특별예배는 한 무리 sp · 예배가 없는 자리(x9)는 안 보임', [A.weekTags(XB, 'pa', '2026-12-20').map(t => [t.t, t.svc]), A.weekTags(XB, 'pb', '2026-12-20').map(t => [t.t, t.svc])], [[['설', 'sp']], [['헌', 'sp'], ['부', 'bs']]]);
  sc.eq('㊳ 월 달력 \'설교\': 그 날 특별예배 줄(이름표 \'특별\')', A.dayLines(XB, '2026-12-24', 'preach').map(l => [l.label, l.text, l.grp]), [['특별', '가가', 'sp']]);
  // 시트 내보내기
  const sr = A.sheetRows(XB, '2026-12'), at = sr.findIndex(r => r[0] === '특별예배');
  sc.eq('㊳ 예배 구성 시트: 맨 아래 특별예배 표(없는 자리는 —)', sr.slice(at), [['특별예배', '때', '예배', '설교', '헌금인도', '예배인도'], ['12/24', '저녁', '성탄 전야 예배', '가가', '', ''], ['12/25', '10:30', '성탄 예배', '', '라라', '—'], ['12/31', '', '송구영신 예배', '', '', '—']]);
  sc.eq('㊳ 특별예배가 없는 달은 표가 없다(예전 모양 그대로)', A.sheetRows(XB, '2026-11').some(r => r[0] === '특별예배'), false);
  // 자동 배열: 쉬는 금요일(12/25)은 채우지 않음
  const pr = A.propose(XB, '2026-12');
  sc.eq('㊳ 자동 배열: 특별예배로 쉬는 금요일(12/25) 칸은 제안하지 않고 다른 금요일은 그대로', [pr.slots.some(x => x.id.startsWith('2026-12-25|fri')), pr.slots.some(x => x.id.startsWith('2026-12-18|fri'))], [false, true]);
  // 지우기 · 번호
  const db = A.normBook(J(XB)); A.dropSpec(db, 'x|2026-12-24|1', 'u', 9);
  sc.eq('㊳ 지우면 예배와 그 자리들(지운 표지) · 다음 번호', [A.specOf(db, '2026-12-24', 'x1'), db.slots.find(x => x.id === '2026-12-24|x1|preach').del, A.nextSpecK(db, '2026-12-24'), A.nextSpecK(XB, '2026-12-26')], [null, true, 2, 1]);
  // 저장 칸 · 낡은 앱 · 빈 기기
  sc.eq('㊳ b14 · b13 은 옛 칸 (낡은 앱은 specs · 특별예배 자리를 떨군다 — 1117-Z 4 에서 쓰는 칸 b16)', [A.WRITE_FIELD, A.OLD_FIELDS.slice(-5, -3)], ['b18', ['b13', 'b14']]);
  const old = J(XB); delete old.specs; old.slots = old.slots.filter(x => !A.isSpec(x.svc));
  const pk = A.pickDoc(null, { b18: J(XB), b13: old });
  sc.eq('㊳ 낡은 앱(b13) 사본과 합쳐도 특별예배 · 자리 그대로 · 바뀐 게 없으면 다시 쓰지 않는다(낡은 앱과 핑퐁 없음 — 1117-Z 2 고침)', [pk.book.specs.length, pk.book.slots.filter(x => A.isSpec(x.svc)).length, pk.push], [3, 3, false]);
  sc.eq('㊳ 빈 기기 + 계정(b16) = 계정 그대로 · 다시 안 씀', (r => [r.book.specs.length, r.push])(A.pickDoc(null, { b18: J(XB) })), [3, false]);
  sc.eq('㊳ 교역자 칸에는 특별예배가 없다(받지 않음)', J(A.normStaff({ email: 'ga@example.com', specs: [{ id: 'x|2026-12-24|1', n: '바꿈' }], visits: {} })).specs, undefined);
  // 화면
  const vw = HTML.slice(HTML.indexOf('function viewWeek('), HTML.indexOf('/* ---------- 달력표 보기 틀'));
  sc.eq('㊳ 이번 주: 특별예배 카드(A) · 표 줄(C) · 쉬는 날 옅게 · HB 만 \'+ 분당 특별예배 더하기\'',
    [/specsIn\(S\.book, ws, sat\)\.forEach\(sp => out\.push/.test(vw), /specsIn\(S\.book, ws, addDays\(ws, 6\)\)\.forEach\(sp => rows\.push/.test(vw), /restC\(plan\.fri\)/.test(vw) && /restN\(plan\.wed\)/.test(vw), /own \? `<button class="txtbtn" data-act="specnew"/.test(vw)], [true, true, true, true]);
  const ps = HTML.slice(HTML.indexOf('function paneSpec('), HTML.indexOf('function specClick('));
  sc.eq('㊳ 특별예배 판: 날짜(새로만) · 때 · 이름(알약) · 자리 · 수 · 금요일이면 쉼 · 지우기 · 저장',
    ['data-spf="date"', 'data-spt=', 'data-spf="tm"', 'data-spf="n"', 'data-spn=', 'data-spr=', 'data-act="sprest"', 'data-act="spdel"', 'data-act="spsave"'].every(k => ps.includes(k)), true);
  sc.eq('㊳ 고르기 판 · 보기 판 · 겹침 글은 특별예배 이름으로(slotLabelB) · SVC 를 바로 찾지 않음(svcI)', [/slotLabelB\(S\.book, date, svc, role\)/.test(HTML.slice(HTML.indexOf('function panePick('), HTML.indexOf('function pickApply('))), /canAll = svcI\(svc\)\.off === 0/.test(HTML), /slotLabelB\(S\.book, date, svc, role\)/.test(HTML.slice(HTML.indexOf('function paneSlotView('), HTML.indexOf('function paneMyAvail(')))], [true, true, true]);
  sc.eq('㊳ 교역자는 특별예배 판을 못 연다(그리는 단추도 HB 만 · staffOk 에 없음)', [!/'specnew'/.test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('const STAFF_ACTS') + 1500)), /if \(d\.tab \|\| d\.week[^\n]*d\.spec/.test(HTML)], [true, false]);
}

// ㊴ 분당 판 축 바꿈 (1117-G, HB 11/17 — 시안 A): 줄 = 자리, 칸 = 예배. 부산 띠처럼 날짜가 가로로 흐른다.
{
  const vw = HTML.slice(HTML.indexOf('function viewWeek('), HTML.indexOf('/* ---------- 달력표 보기 틀'));
  sc.eq('㊴ 머리 줄 = 예배(rows 의 th) · 몸 줄 = 설교 · 헌금 · 인도 · 빈 자리는 –',
    [/<thead><tr><th><\/th>\$\{rs\.map\(r => r\.h\.th\)/.test(vw), /\['설교', '헌금', '인도'\]\.map\(\(lab, i\)/.test(vw), /<span class="muted">–<\/span>/.test(vw), !/<th>설교<\/th><th>헌금<\/th><th>인도<\/th>/.test(vw)], [true, true, true, true]);
}

// ㊵ 숙소 금액 · 취소 기한은 HB 전용 (1117-Z 1, HB 11/17) — 지어낸 이름 · 이메일
{
  const T0 = 1000, V = 'v|2026-11-22';
  const hbStay = [{ kind: 'hotel', name: '바다 호텔', status: 'done', cost: 120000, cancelBy: '2026-11-19', cancelAt: '23:59', ref: 'R1', imgs: ['abcdef12'] },
    { kind: 'hotel', name: '언덕 호텔', status: 'pre', nofree: true, cost: 80000 }, { kind: 'home', name: '성도 가정', status: 'ask', for: '여' }];
  const bk = A.normBook({ people: [{ id: 'pa', name: '가나다', roles: ['busan'], email: 'ga@example.com', at: T0 }],
    visits: [{ id: V, who: ['pa'], days: '토일', stay: hbStay, stayAt: T0, at: T0 }],
    opts: [{ id: A.optId('stay', '바다 호텔', 'hotel'), type: 'stay', kind: 'hotel', name: '바다 호텔', cost: 60000, ord: 0, at: T0 }] });
  // 교역자 화면 책
  const hv = A.hidePriv(bk), hs = hv.visits[0].stay;
  sc.eq('㊵ 교역자 화면 책: 숙소 금액 · 취소 기한 · 시각 · 환불 불가 · 예약 화면이 없다(이름 · 상태 · 남녀 · 예약번호는 남음)',
    [hs.map(s => [s.name, s.status, s.cost, s.cancelBy, s.cancelAt, s.nofree, s.imgs]), hs[2].for, hs[0].ref],
    [[['바다 호텔', 'done', 0, undefined, undefined, undefined, undefined], ['언덕 호텔', 'pre', 0, undefined, undefined, undefined, undefined], ['성도 가정', 'ask', 0, undefined, undefined, undefined, undefined]], '여', 'R1']);
  sc.eq('㊵ 교역자 화면 책: 숙소 목록의 평소 금액도 없다', hv.opts.find(o => o.type === 'stay').cost, 0);
  sc.eq('㊵ hidePriv 는 넣은 책을 고치지 않는다(HB 책 그대로)', [bk.visits[0].stay[0].cost, bk.visits[0].stay[0].cancelBy, bk.opts.find(o => o.type === 'stay').cost], [120000, '2026-11-19', 60000]);
  const txt = JSON.stringify(hv);
  sc.eq('㊵ 교역자 화면 책 글 어디에도 금액 · 기한 날짜가 없다', [/120000|80000|60000/.test(txt), /2026-11-19|23:59|nofree|abcdef12/.test(txt)], [false, false]);
  // 교역자 화면에 쓰이는 글 — 챙길 것 · 부산 준비 · 내보내기
  sc.eq('㊵ 교역자 화면: 챙길 것에 취소 기한 줄이 없다 (HB 화면에는 있다)', [A.chores(hv, '2026-11-17').filter(c => c.kind === 'cancel').length, A.chores(bk, '2026-11-17').filter(c => c.kind === 'cancel').length], [0, 1]);
  const vh = hv.visits[0], vb = bk.visits[0];
  sc.eq('㊵ 교역자 화면: 부산 준비의 숙소 줄에 취소 기한이 없다 (HB 는 11/19)', [A.tripChecks(hv, vh, 'pa').items[0].cancelBy, A.tripChecks(bk, vb, 'pa').items[0].cancelBy], ['', '2026-11-19']);
  const exS = A.exportRows(hv, 'busan', '2026-11', { noPriv: true }), exH = A.exportRows(bk, 'busan', '2026-11', {});
  sc.eq('㊵ 교역자 내보내기: 금액 · 취소 기한 열이 없다 · HB 는 그대로(열 차례 · 값)',
    [exS[0].includes('금액') || exS[0].includes('취소 기한'), exS[0].length, exS[1].length, exH[0].slice(8, 11), exH[1].slice(9, 11)],
    [false, 13, 13, ['숙소', '금액', '취소 기한'], [200000, '11/19(목)']]);
  // 교역자가 쓰는 조각 · 받아들이기
  const pt = A.staffPatch('ga@example.com', 'stay', V, [{ kind: 'hotel', name: '바다 호텔', status: 'done', cost: 1, cancelBy: '2026-12-31', nofree: true, imgs: ['zzzzzz99'] }], 5000);
  sc.eq('㊵ 교역자가 쓰는 조각에 금액 · 기한 · 사진을 싣지 않는다', pt.visits[V].stay, [{ kind: 'hotel', name: '바다 호텔', status: 'done', cost: 0 }]);
  // 낡은 교역자 앱이 금액 · 기한을 바꿔 보냈다 — 이름 · 상태 · 차례는 받고, 금액 · 기한은 HB 책 것 그대로
  const old = { email: 'ga@example.com', visits: { [V]: { stayAt: 3000, stay: [
    { kind: 'hotel', name: '언덕 호텔', status: 'done', cost: 1, nofree: false, cancelBy: '2026-12-31' },
    { kind: 'hotel', name: '바다 호텔', status: 'cancel', cost: 999, cancelBy: '2026-12-30', imgs: ['zzzzzz99'] },
    { kind: 'hotel', name: '새 호텔', status: 'pre', cost: 50000, cancelBy: '2026-12-01' }] } } };
  const ab = A.absorb(bk, [old]).book.visits[0].stay;
  sc.eq('㊵ absorb: 교역자의 이름 · 상태 · 차례는 받는다',
    ab.map(s => [s.name, s.status]), [['언덕 호텔', 'done'], ['바다 호텔', 'cancel'], ['새 호텔', 'pre']]);
  sc.eq('㊵ absorb: 금액 · 기한 · 환불 불가 · 사진은 HB 책의 같은 숙소 것 그대로 · 새 숙소는 비움',
    ab.map(s => [s.cost, s.cancelBy, s.cancelAt, s.nofree, s.imgs]),
    [[80000, undefined, undefined, true, undefined], [120000, '2026-11-19', '23:59', undefined, ['abcdef12']], [0, undefined, undefined, undefined, undefined]]);
  sc.eq('㊵ absorb: 예약번호(ref)는 교역자 것 그대로(감추는 칸 아님)', A.absorb(bk, [{ email: 'ga@example.com', visits: { [V]: { stayAt: 3000, stay: [{ kind: 'hotel', name: '바다 호텔', status: 'done', ref: 'NEW' }] } } }]).book.visits[0].stay[0].ref, 'NEW');
  sc.eq('㊵ absorb: 이름이 빈 숙소는 같은 자리 · 같은 종류일 때만 되입힘',
    A.stayKeep([{ kind: 'hotel', name: '', cost: 7 }, { kind: 'hotel', name: '', cost: 8 }], [{ kind: 'hotel', name: '' }, { kind: 'home', name: '' }]).map(s => s.cost), [7, 0]);
  // 교역자 앱의 화면(staffView) = hidePriv(absorb(…)) — 자기가 고친 숙소도 금액 없이 보인다
  const sv = A.hidePriv(A.absorb(bk, [old]).book).visits[0].stay;
  sc.eq('㊵ 교역자 앱이 받아들인 뒤 그린 책에도 금액 · 기한이 없다', sv.every(s => s.cost === 0 && !s.cancelBy && !s.nofree && !s.imgs), true);
  // 화면 코드 — 교역자에게 감추고 막는 자리
  sc.eq('㊵ 교역자 앱의 책은 staffView 한 곳에서 hidePriv 를 거친다', /function staffView\(\) \{[^\n]*S\.book = hidePriv\(absorb\(/.test(HTML), true);
  const ped = HTML.slice(HTML.indexOf("} else if (ed.sec === 'stay') {"), HTML.indexOf("} else if (ed.sec === 'travel') {"));
  sc.eq('㊵ 숙소 판: 금액 · 취소 기한 · 환불 불가 · 예약 화면 칸은 HB 만(hotel && own)', [/\$\{hotel && own \? `<div class="frow"><span class="flabel">금액<\/span>/.test(ped),
    ped.indexOf('hotel && own') < ped.indexOf('data-df="cancelBy"') && ped.indexOf('hotel && own') < ped.indexOf('data-act="dimg"') && ped.indexOf('hotel && own') < ped.indexOf('data-act="dnofree"')], [true, true]);
  const so = HTML.slice(HTML.indexOf('function staffOk('), HTML.indexOf('function staffNoMsg('));
  sc.eq('㊵ staffOk: 숙소 판에서 금액 −/+ · 환불 불가 · 기한 지우기 · 사진 더하기 · 읽기 · 빼기를 막는다',
    /if \(ed\.sec === 'stay' && \(d\.dstep === 'cost' \|\| \['dnofree', 'dnocancel', 'dimg', 'dread'\]\.includes\(d\.act\) \|\| d\.delimg\)\) return false;/.test(so), true);
  sc.eq('㊵ 금액 칸 · 취소 기한 날짜 · 시각을 쳐도 교역자는 초안에 안 담긴다', [/if \(t\.dataset\.dcost && !isStaff\(\)\)/.test(HTML), /if \(isStaff\(\) && \(t\.dataset\.df === 'cancelBy' \|\| t\.dataset\.df === 'cancelAt'\)\) return;/.test(HTML)], [true, true]);
  const bb = HTML.slice(HTML.indexOf('function bodyBusan('), HTML.indexOf('function bodyBusan(') + 4000);
  sc.eq('㊵ 부산 요약 표: 금액 · 취소 기한 열(머리 · 칸)은 HB 만(pv)', [/const pv = !isStaff\(\)[,;]/.test(bb), /\$\{pv \? `<td>\$\{cb_\(v, 'cost'/.test(bb), /\$\{pv \? '<th class="h-bs">금액<\/th><th class="h-bs">취소 기한<\/th>' : ''\}/.test(bb)], [true, true, true]);
  sc.eq('㊵ 교역자 내보내기: noPriv = isStaff()', /noPriv: isStaff\(\) \};/.test(HTML), true);
  sc.eq('㊵ 숙소 목록 관리 · AI 사진 읽기 · 메일은 교역자에게 원래 없다', [/own = !isStaff\(\)/.test(ped), /function aiCan\(\) \{ return DEMO \|\| \(!!FB\.user && !isStaff\(\)\); \}/.test(HTML)], [true, true]);
}

// ㊶ 알림 판 (1117-Z 2, HB 11/17 — 좁을 때 B · 넓을 때 B + 옆 기둥) — 지어낸 이름. 오늘 = 2026-11-18(수)
{
  const TD = '2026-11-18';
  sc.eq('㊶ 두 달 경계: 같은 날짜(그 달에 없으면 마지막 날 · 윤년)', [A.alertEnd(TD), A.alertEnd('2026-12-31'), A.alertEnd('2027-12-31'), A.alertEnd('2026-01-31')], ['2027-01-18', '2027-02-28', '2028-02-29', '2026-03-31']);
  const H = (cancelBy, o) => Object.assign({ kind: 'hotel', name: '호텔', status: 'done', cancelBy }, o || {});
  sc.eq('㊶ 취소 기한 7일(오늘 포함): 오늘 · D-6 은 빨강, D-7 · 어제는 아님', [TD, '2026-11-24', '2026-11-25', '2026-11-17'].map(d => A.cancelSoon(H(d), TD)), [true, true, false, false]);
  sc.eq('㊶ 취소 기한 빨강은 예약 완료 호텔만 — 성도님 댁 · 취소한 숙소 · 예약 전 · 기한 없음은 아님',
    [A.cancelSoon(H(TD, { kind: 'home' }), TD), A.cancelSoon(H(TD, { status: 'cancel' }), TD), A.cancelSoon(H(TD, { status: 'pre' }), TD), A.cancelSoon(H(undefined), TD)], [false, false, false, false]);
  sc.eq('㊶ D-day 글', [0, 3, -1].map(A.ddText), ['오늘', 'D-3', 'D+1']);
  const bk = A.normBook({ people: [{ id: 'pa', name: '가가', roles: ['busan', 'preach', 'offer'] }, { id: 'pb', name: '나나', roles: ['offer'] }],
    slots: [{ id: '2026-11-22|sun1|preach', who: ['pa'] }, { id: '2026-11-22|sun2|preach', txt: '담임목사님' }, { id: '2026-11-22|sun3|preach', txt: '담임목사님' }, { id: '2026-11-22|ll|preach', txt: '담임목사님' },
      { id: '2026-11-22|sun1|offer', who: ['pb'] }, { id: '2026-11-22|sun2|offer', who: [] }, { id: '2026-11-25|wed|preach', who: ['pb'] }],
    specs: [{ id: 'x|2026-12-25|1', n: '성탄 예배', t: '오전', roles: ['preach'], rest: true }],
    visits: [
      { id: 'v|2026-11-15', who: [], days: '토일' },   // 지난 것
      { id: 'v|2026-11-22', who: ['pa'], days: '토일', lead: { fri: { m: 'relay' }, sun: { m: 'staff' }, ll: { m: 'relay' } },
        travel: [{ dir: 'down', mode: 'KTX' }, { dir: 'up', time: '일 19:10' }],
        stay: [H('2026-11-24', { name: '바다 호텔', cancelAt: '18:00' }), H('2026-11-25', { name: '언덕 호텔' }), { kind: 'home', name: '성도 가정', status: 'done' },
          H('2026-11-19', { name: '취소 호텔', status: 'cancel' }), H(TD, { name: '오늘 호텔' })] },
      { id: 'v|2026-11-29', who: [], days: '토일' },
      { id: 'v|2026-12-24', who: ['pa'], days: '목', title: '성탄', evs: [{ d: '2026-12-24', n: '성탄 전야 예배' }], travel: [{ dir: 'down', mode: 'KTX' }] },
      { id: 'v|2027-01-17', who: ['pa'], days: '토일', stay: [{ kind: 'hotel', name: '끝 호텔', status: 'done' }], travel: [{ dir: 'down', mode: 'KTX' }, { dir: 'up', mode: 'KTX' }], lead: { fri: { m: 'lay' }, sun: { m: 'staff' }, ll: { m: 'staff' } } },
      { id: 'v|2027-01-24', who: [], days: '토일' }] });   // 두 달 밖
  const ext = { services: [{ date: '2026-11-21', service: '토요 기도', status: 'tentative', leaders: [], members: [{ pid: 'pa', part: '건반' }] }] };
  const R = A.alertsOf(bk, TD, { ext, bs: '2026-11-22' }), of = (c) => R.items.filter(x => x.cat === c);
  sc.eq('㊶ 범위 = 오늘 ~ 두 달 · 갈래 넷 · 개수', [R.from, R.to, A.ALERT_CATS.map(c => c[0]), Object.keys(R.n), R.n.urgent + R.n.busan + R.n.bd + R.n.chk === R.items.length], [TD, '2027-01-18', ['urgent', 'busan', 'bd', 'chk'], ['urgent', 'busan', 'bd', 'chk'], true]);
  sc.eq('㊶ 급함: 7일 안 취소 기한(예약 완료 호텔만, 숙소마다) + 겹침 — 날짜순 · 갈 곳',
    J(of('urgent').map(x => [x.kind, x.date, x.main, x.dd, x.to])),
    [['cancel', TD, '오늘 호텔 취소 기한', 0, { visit: 'v|2026-11-22', col: 'cancel', i: 4 }],
     ['overlap', '2026-11-22', '가가 — 11/22(주일) 부산에 있는데 분당 1부 설교', 4, { pick: '2026-11-22|sun1|preach' }],
     ['cancel', '2026-11-24', '바다 호텔 취소 기한 18:00', 6, { visit: 'v|2026-11-22', col: 'cancel', i: 0 }]]);
  sc.eq('㊶ 급함 줄의 덧글: 그 부산 일정 · 교역자 / 겹침', [of('urgent')[0].sub, of('urgent')[1].sub, of('urgent')[1].go, of('urgent')[0].go], ['11/22 부산 · 가가', '겹침', '고르기 판', '숙소 판']);
  sc.eq('㊶ 확인: 노랑(맡지 않는 일 · 예배팀 미정) — 숙소 미정(옛 2주 노랑)은 여기 없다',
    J(of('chk').map(x => [x.kind, x.date, x.sub])), [['worship', '2026-11-21', '예배팀 미정'], ['role', '2026-11-25', '맡지 않는 일']]);
  const bz = of('busan');
  sc.eq('㊶ 부산: 상영(받은 주일) · 교역자 · 숙소(두 달 기준 하나 · 하루 일정은 안 물음) · 교통(빠진 쪽) · 예배 인도 · 일정 없는 주일 — 지난 것 · 두 달 밖은 없음',
    J(bz.map(x => [x.date, x.kind, x.main])),
    [['2026-11-22', 'show', '부산 상영 미정'], ['2026-11-29', 'who', '교역자 미정'], ['2026-11-29', 'stay', '숙소 미정'], ['2026-11-29', 'travel', '교통 미정'], ['2026-11-29', 'lead', '예배 인도 미정'],
     ['2026-12-06', 'novisit', '부산 일정이 아직 없습니다'], ['2026-12-13', 'novisit', '부산 일정이 아직 없습니다'], ['2026-12-20', 'novisit', '부산 일정이 아직 없습니다'],
     ['2026-12-24', 'travel', '교통 미정 · 올라옴'], ['2026-12-24', 'lead', '예배 인도 미정'],
     ['2026-12-27', 'novisit', '부산 일정이 아직 없습니다'], ['2027-01-03', 'novisit', '부산 일정이 아직 없습니다'], ['2027-01-10', 'novisit', '부산 일정이 아직 없습니다']]);
  sc.eq('㊶ 부산 줄의 갈 곳: 상영 = 광고 · 숙소 = 숙소 판 · 교통 = 교통 판 · 인도 = 예배 판 · 일정 없음 = 그 날짜로 더하기',
    J([bz[0].to, bz[2].to, bz[3].to, bz[4].to, bz[5].to, bz[1].to]),
    [{ ads: '2026-11-22', vid: 'v|2026-11-22' }, { visit: 'v|2026-11-29', col: 'stay', i: -1 }, { visit: 'v|2026-11-29', col: 'travel' }, { visit: 'v|2026-11-29', col: 'lead' }, { newvisit: '2026-12-06' }, { visit: 'v|2026-11-29', col: 'who' }]);
  sc.eq('㊶ 예배 인도 미정: 정해진 예배(주일 · LL — 금요예배가 없는 넷째 주) · 더한 예배 이름', [bz[4].sub, bz[9].sub], ['주일예배 · LL', '성탄 전야 예배 — 가가 · 성탄']);
  sc.eq('㊶ 금1~3 주(11/20 ENCOUNTER)의 금요 인도를 비우면 미정', A.alertsOf(A.normBook({ visits: [{ id: 'v|2026-11-22', who: [], days: '토일', lead: { sun: { m: 'staff' }, ll: { m: 'staff' } } }] }), TD).items.find(x => x.kind === 'lead').sub, 'ENCOUNTER');
  sc.eq('㊶ 11/22 은 인도(ENCOUNTER · 주일 · LL) · 숙소 · 교통을 다 정함(교통 시각만 적어도 정함) — 상영만 남음', bz.filter(x => x.date === '2026-11-22').map(x => x.kind), ['show']);
  const bd = of('bd'), bd1 = bd.filter(x => x.date <= '2026-11-29');
  sc.eq('㊶ 분당: 오늘(수) 자리부터 · 주일 설교 · 헌금은 묶고 빈 예배만 · 2부 / LL 인도 · 마지막 금요일 WN 광고',
    J(bd1.map(x => [x.date, x.main, x.sub])),
    [['2026-11-18', '수요예배 설교', ''], ['2026-11-18', '수요예배 헌금인도', ''], ['2026-11-20', '금요예배 설교', ''], ['2026-11-20', '금요예배 헌금인도', ''],
     ['2026-11-22', '주일 헌금인도', '2부 · 3부 · LL'], ['2026-11-22', '2부 예배인도', ''], ['2026-11-22', 'LL 예배인도', ''],
     ['2026-11-25', '수요예배 헌금인도', ''], ['2026-11-27', '금요예배 설교', ''], ['2026-11-27', '금요예배 헌금인도', ''], ['2026-11-27', 'WN 광고', ''],
     ['2026-11-29', '주일 설교', '1~3부 · LL'], ['2026-11-29', '주일 헌금인도', '1~3부 · LL'], ['2026-11-29', '2부 예배인도', ''], ['2026-11-29', 'LL 예배인도', '']]);
  sc.eq('㊶ 분당 갈 곳: 고르기 판(빈 첫 예배 · 넷 다 비면 모두 같게)', J([bd1[4].to, bd1[11].to, bd1[0].to]), [{ pick: '2026-11-22|sun2|offer', all: false }, { pick: '2026-11-29|sun1|preach', all: true }, { pick: '2026-11-18|wed|preach' }]);
  sc.eq('㊶ 특별예배 자리도 · 그 날 쉬는 금요예배는 빼고', [bd.filter(x => x.date === '2026-12-25').map(x => [x.main, x.sub, x.to.pick])], [[['성탄 예배 설교', '오전', '2026-12-25|x1|preach']]]);
  sc.eq('㊶ 두 달 끝날(1/17 주일)까지 · 그 뒤는 없음', [R.items.some(x => x.date === '2027-01-17'), R.items.some(x => x.date > '2027-01-18')], [true, false]);
  sc.eq('㊶ 상영 미정은 받은 주일(bs)이 없으면 없다(짐작 안 함)', A.alertsOf(bk, TD, { ext }).items.some(x => x.kind === 'show'), false);
  sc.eq('㊶ 교역자 화면 책(hidePriv)에는 취소 기한 줄이 없다', A.alertsOf(A.hidePriv(bk), TD).items.some(x => x.kind === 'cancel'), false);
  sc.eq('㊶ colTarget: 알림의 취소 기한 줄은 그 숙소 · 교통 줄은 교통 판', J([A.colTarget(bk.visits.find(v => v.id === 'v|2026-11-22'), 'cancel', 4), A.colTarget(bk.visits[0], 'travel')]),
    [{ sec: 'stay', i: 4, focus: 'cancel' }, { sec: 'travel', i: -1, focus: '' }]);
  sc.eq('㊶ colTarget: 숫자 없는 취소 기한(부산 요약 표)은 예전처럼 가장 이른 기한', A.colTarget(bk.visits.find(v => v.id === 'v|2026-11-22'), 'cancel').i, 4);
  // 화면 코드 — 판은 HB 만 · 네 탭 같은 판 · 옛 알림 자리 걷음 · 접기는 이 기기에만 · 표 · 숙소 판 기한도 같은 기준
  sc.eq('㊶ (1117-Z 2c 에서 바뀜) 교역자 판은 따로 거른 판 — ㊷', /function alertData\(over\) \{[^\n]*\n\s*return alertsOf\(/.test(HTML), true);
  sc.eq('㊶ 네 탭이 같은 판(topBanner) — 탭마다 그리던 alertList · choreList · 취소 기한 줄 · 그다음 줄은 없다',
    [(HTML.match(/\$\{topBanner\(\)\}/g) || []).length, /function alertList\(|function choreList\(|class="wafter"|\$\{alertList\(/.test(HTML)], [4, false]);
  sc.eq('㊶ 접기는 이 기기(PREF — localStorage)에만, 책 · 계정에 넣지 않음', [/PREF\.afold = !PREF\.afold; savePref\(\);/.test(HTML), /afold/.test(HTML.slice(HTML.indexOf('function cloudSave('), HTML.indexOf('function cloudSave(') + 1500))], [true, false]);
  sc.eq('㊶ 알림 줄은 줄어들지 않는다(flex:none) — 폰에서 목록 높이를 막으면 줄이 눌려 글자가 겹쳤다(v. 26-1118-2)', /\.arow\{flex:none;/.test(HTML), true);
  sc.eq('㊶ 부산 요약 표 · 숙소 판의 취소 기한도 같은 기준(cancelSoon)', (HTML.match(/cancelSoon\(/g) || []).length >= 5, true);
}

// ㊷ 교역자 판 · 주보 담당 (1117-Z 2c, HB 11/18) — 지어낸 이름 · 이메일
{
  const TD = '2026-11-18';
  const P = [{ id: 'pa', name: '가가', roles: ['busan', 'preach'], bul: true, email: 'ga@example.com' }, { id: 'pb', name: '나나', roles: ['busan', 'preach'], bul: true, email: 'na@example.com' },
    { id: 'pc', name: '다다', roles: ['busan'], bul: true, email: 'da@example.com' }, { id: 'pd', name: '라라', roles: ['busan'] }];
  const bk = A.normBook({ people: P, buls: [{ id: 'u|2026-11', p: 'pb' }, { id: 'u|bad', p: 'pa' }, { id: 'u|2026-13', p: 'pa' }, { id: 'u|2026-10' }] });
  sc.eq('㊷ 주보 담당 줄: 달(YYYY-MM)만 · 사람이 없으면 버림', bk.buls.map(x => [x.id, x.p]), [['u|2026-11', 'pb']]);
  sc.eq('㊷ 순번 = 주보 담당 표시한 분만, ㄱㄴㄷ 순', A.bulOrder(bk).map(p => p.name), ['가가', '나나', '다다']);
  sc.eq('㊷ 정한 달부터 한 달씩 ㄱㄴㄷ 으로 돈다 · 정한 달 앞은 아무도 아님', ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02'].map(ym => A.bulOf(bk, ym)), ['', 'pb', 'pc', 'pa', 'pb']);
  const bk2 = A.normBook(Object.assign(J(bk), { buls: J(bk.buls).concat({ id: 'u|2027-01', p: 'pd' }) }));
  sc.eq('㊷ 그 달만 직접(순번 밖 분도) — 그 뒤는 그 분 이름 다음부터 ㄱㄴㄷ', ['2026-12', '2027-01', '2027-02', '2027-03'].map(ym => A.bulOf(bk2, ym)), ['pc', 'pd', 'pa', 'pb']);
  sc.eq('㊷ 지우기 표지는 달을 남긴다', (b => { A.drop(b, 'buls', 'u|2026-11', 'hb', 9); return [b.buls[0].ym, b.buls[0].del, A.bulOf(b, '2026-12')]; })(J(bk)), ['2026-11', true, '']);
  sc.eq('㊷ 사람의 주보 담당 표시는 true 만', A.normBook({ people: [{ id: 'x', name: '가', bul: 'yes' }, { id: 'y', name: '나', bul: true }] }).people.map(p => !!p.bul), [false, true]);
  // 상영 고르기 — 그 달 주보 담당은 남의 부산 일정이라도 상영만 받는다
  const V = 'v|2026-12-06';
  const vb = A.normBook(Object.assign(J(bk), { visits: [{ id: V, who: ['pa'], days: '토일', at: 1 }] }));
  const r1 = A.absorb(vb, [{ email: 'da@example.com', visits: { [V]: { bs: 'same', bsAt: 50, stay: [{ kind: 'hotel', name: '몰래 호텔' }], stayAt: 50 } } }]).book;
  sc.eq('㊷ 12월 주보 담당(다다)의 상영은 받고, 숙소는 안 받는다(자기가 든 일정이 아님)', [A.showOf(r1, '2026-12-06'), r1.visits[0].stay.length], ['same', 0]);
  const r2 = A.absorb(vb, [{ email: 'na@example.com', visits: { [V]: { bs: 'diff', bsAt: 50 } } }]).book;
  sc.eq('㊷ 그 달 담당이 아닌 교역자(나나 — 11월 담당)의 상영은 안 받는다', A.showOf(r2, '2026-12-06'), '');
  sc.eq('㊷ 그 일정에 든 교역자(가가)는 예전처럼 받는다', A.showOf(A.absorb(vb, [{ email: 'ga@example.com', visits: { [V]: { bs: 'none', bsAt: 50 } } }]).book, '2026-12-06'), 'none');
  // 교역자 판 — 겹침 · 확인은 모두, 부산은 자기 일정의 교통편 · 상영만, 나머지는 HB 만
  const sb = A.normBook({ people: P.concat({ id: 'pe', name: '마마', roles: ['offer'] }),
    slots: [{ id: '2026-11-22|sun1|preach', who: ['pb'] }, { id: '2026-11-25|wed|preach', who: ['pe'] }],
    visits: [{ id: 'v|2026-11-22', who: ['pb'], days: '토일', stay: [{ kind: 'hotel', name: '바다', status: 'done', cancelBy: '2026-11-19' }] },
      { id: 'v|2026-11-29', who: ['pa'], days: '토일', travel: [{ dir: 'down', mode: 'KTX' }] }, { id: 'v|2026-12-06', who: [], days: '토일' }] });
  const H = A.alertsOf(sb, TD), G = A.alertsOf(sb, TD, { staff: 'pa', bs: '2026-11-22' });
  sc.eq('㊷ HB 판에는 취소 기한 · 숙소 · 분당 · 일정 없는 주일이 있다', [H.items.some(x => x.kind === 'cancel'), H.items.some(x => x.kind === 'stay'), H.n.bd > 0, H.items.some(x => x.kind === 'novisit')], [true, true, true, true]);
  sc.eq('㊷ 교역자 판: 겹침(남의 것도) · 확인 · 내 일정 교통편 · 상영 — 그 밖은 없다', J(G.items.map(x => [x.cat, x.kind, x.date])),
    [['urgent', 'overlap', '2026-11-22'], ['busan', 'show', '2026-11-22'], ['chk', 'role', '2026-11-25'], ['busan', 'travel', '2026-11-29']]);
  sc.eq('㊷ 교역자 판 개수: 분당 0', [G.n.urgent, G.n.busan, G.n.bd, G.n.chk], [1, 2, 0, 1]);
  sc.eq('㊷ 사람 탭에 이름이 없는 교역자(빈 id)는 판이 HB 처럼 되지 않는다', A.alertsOf(sb, TD, { staff: '?' }).items.some(x => x.kind === 'cancel' || x.cat === 'bd'), false);
  // 화면 코드
  sc.eq('㊷ 교역자 판은 alertData 한 곳에서 staff 를 넘긴다 · 분당 알약은 HB 만', [/staff: isStaff\(\) \? \(myPid\(\) \|\| '\?'\) : ''/.test(HTML), /ALERT_CATS\.filter\(c => !isStaff\(\) \|\| c\[0\] !== 'bd'\)/.test(HTML)], [true, true]);
  sc.eq('㊷ 상영 경고 글 · 주보 담당도 고름', [/부산 상영 여부를 아직 고르지 않았습니다/.test(HTML), /bulOf\(S\.book, sun\.slice\(0, 7\)\) === pid/.test(HTML)], [true, true]);
}

// ㊸ 알림 판 기간 (1117-Z 2b, HB 11/18) — 계정마다(ui.al)
{
  const TD = '2026-11-18';
  sc.eq('㊸ 처음 값: 부산 8주(이번 주 포함, 토요일까지) · 분당 달 규칙 21일', [A.alEnd(A.alCfg(null, 'busan', TD), TD), A.alEnd(A.alCfg(null, 'bd', TD), TD)], ['2027-01-09', '2026-11-30']);
  sc.eq('㊸ 달 규칙: 20일까지는 이번 달 말일 · 21일부터 다음 달 말일 · 해 넘김 · 2월', ['2026-11-20', '2026-11-21', '2026-11-30', '2026-12-25', '2027-01-21'].map(d => A.monthEndOf(d, 21)), ['2026-11-30', '2026-12-31', '2026-12-31', '2027-01-31', '2027-02-28']);
  sc.eq('㊸ 고른 날짜: 오늘 · 앞날은 그대로, 지난 날이면 처음 값', [A.alCfg({ busan: { m: 'date', d: TD } }, 'busan', TD), A.alCfg({ busan: { m: 'date', d: '2026-11-17' } }, 'busan', TD)], [{ m: 'date', d: TD }, { m: 'weeks', w: 8 }]);
  sc.eq('㊸ 다듬기: 주 1~26 · 넘어가는 날 2~28 · 모르는 값은 버림 · 프리셋은 날짜 · 기본 셋 · 같은 것 빼고 6개까지',
    J(A.normAl({ busan: { m: 'weeks', w: 30 }, bd: { m: 'month', cut: 15 }, pre: [{ m: 'weeks', w: 8 }, { m: 'weeks', w: 4 }, { m: 'weeks', w: 4 }, { m: 'date', d: TD }, { m: 'month', cut: 25 }, { m: 'x' }] })),
    { bd: { m: 'month', cut: 15 }, pre: [{ m: 'weeks', w: 4 }, { m: 'month', cut: 25 }] });
  sc.eq('㊸ 아무것도 없으면 null(ui 에 al 칸을 만들지 않음)', [A.normAl({}), A.normAl({ busan: { m: 'weeks', w: 0 } })], [null, null]);
  sc.eq('㊸ 이름: 8주 · 달 규칙 · 날짜', [A.alLabel({ m: 'weeks', w: 8 }), A.alLabel({ m: 'month', cut: 21 }), A.alLabel({ m: 'date', d: '2026-12-20' })], ['8주', '이번 달까지 · 21일부터 다음 달', '12/20까지']);
  sc.eq('㊸ 내 화면 취향(ui)에 al 이 들고 · 없으면 칸도 없다(예전 모양 그대로)', [J(A.normUi({ al: { bd: { m: 'weeks', w: 3 } } }, false).al), 'al' in A.normUi({}, false)], [{ bd: { m: 'weeks', w: 3 } }, false]);
  // 갈래마다 끝날
  const bk = A.normBook({ people: [{ id: 'pa', name: '가가', roles: ['busan', 'preach'] }],
    slots: [{ id: '2026-12-13|sun1|preach', who: ['pa'] }],
    visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일' }, { id: 'v|2026-12-13', who: ['pa'], days: '토일' }, { id: 'v|2027-01-03', who: [], days: '토일' }] });
  const R = A.alertsOf(bk, TD, { endB: '2026-11-30', endD: '2026-12-20' });
  sc.eq('㊸ 부산 갈래는 부산 끝날까지 · 분당은 분당 끝날까지 · 겹침은 긴 쪽(12/13 겹침은 부산 끝 뒤라도 나옴)',
    [R.toB, R.toD, R.to, R.items.filter(x => x.cat === 'busan').every(x => x.date <= '2026-11-30'), R.items.filter(x => x.cat === 'bd').some(x => x.date > '2026-11-30' && x.date <= '2026-12-20'), R.items.some(x => x.cat === 'bd' && x.date > '2026-12-20'), R.items.some(x => x.kind === 'overlap' && x.date === '2026-12-13')],
    ['2026-11-30', '2026-12-20', '2026-12-20', true, true, false, true]);
  sc.eq('㊸ 끝날을 안 주면 예전처럼 두 달', A.alertsOf(bk, TD).to, '2027-01-18');
  // 화면 코드
  const HTMLx = HTML;
  sc.eq('㊸ 기간은 계정의 ui 에(saveUi) — 책 · 이 기기 PREF 에 넣지 않는다', [/saveUi\(\{ al: /.test(HTMLx), /PREF\.al\b/.test(HTMLx), /book\.al\b|S\.book\.al\b/.test(HTMLx)], [true, false, false]);
  sc.eq('㊸ ui 칸은 통째로 바꿔 쓴다(mergeFields) — merge 면 지운 기간 · 프리셋이 계정에 남는다(실제 화면 ⑱ 에서 잡힘)', [/\.set\(\{ ui: UI_OF\(\) \}, \{ mergeFields: \['ui'\] \}\)/.test(HTMLx), /mergeFields: \['v', 'email', 'at', 'ui'\]/.test(HTMLx)], [true, true]);
  sc.eq('㊸ 판 머리의 필터 아이콘 · 설정 판', [/data-act="alset"/.test(HTMLx), /function alSetHtml\(/.test(HTMLx)], [true, true]);
}

// ㊹ 낡은 앱과 핑퐁 없음 · 판 스크롤 지킴 · 넓은 화면 기둥 자리 (1117-Z 2 고침, HB 11/18)
{
  const T = 5, bk = A.normBook({ people: [{ id: 'pa', name: '가가', roles: ['busan'], at: T }], visits: [{ id: 'v|2026-11-29', who: ['pa'], days: '토일', at: T }] });
  sc.eq('㊹ 지금 칸(b16)과 같은 옛 칸(b15 — 낡은 앱이 씀)만 있으면 다시 쓰지 않는다(옛 칸을 지우려 쓰면 낡은 앱이 또 써서 끝없이 돈다)', A.pickDoc(bk, { b18: J(bk), b17: J(bk) }).push, false);
  const ch = J(bk); ch.visits[0].note = '낡은 앱 메모'; ch.visits[0].at = 9;
  sc.eq('㊹ 낡은 앱이 실제로 고친 것이 있으면 합쳐서 쓴다', (r => [r.push, r.book.visits[0].note])(A.pickDoc(bk, { b18: J(bk), b15: ch })), [true, '낡은 앱 메모']);
  sc.eq('㊹ 지금 칸이 없으면(옛 칸만) 옮겨 쓴다', A.pickDoc(null, { b14: J(bk) }).push, true);
  sc.eq('㊹ 다시 그려도 챙길 것 목록 스크롤 자리를 지킨다(같은 갈래일 때)', [/function keepScroll\(\)/.test(HTML), /const ks = keepScroll\(\);/.test(HTML)], [true, true]);
  sc.eq('㊹ 포커스가 빠질 때 다시 그리기는 글자 칸에서만(누른 단추가 다시 그려져 사라질 때마다 또 그리지 않게)', /document\.addEventListener\('focusout', \(e\) => \{ if \(!e\.target \|\| !\/INPUT\|TEXTAREA\|SELECT\/\.test\(e\.target\.tagName\)\) return;/.test(HTML), true);
  sc.eq('㊹ 넓은 화면 기둥: 붙는 높이 = 원래 자리(머리줄 바로 아래) — 짧은 목록 · 긴 목록에서 같은 자리', [/\.wrap\.sided #side\{[^}]*top:var\(--hdr,100px\);/.test(HTML), /top:calc\(var\(--hdr,100px\) \+ 10px\)/.test(HTML)], [true, false]);
}

// ㊺ 메뉴 세 탭 · 부산 탭 지난 일정 단추 (1117-Z 3, HB 11/18)
{
  const mp = HTML.slice(HTML.indexOf('function menuPage('), HTML.indexOf('function menuHead('));
  const part = (k) => { const a = mp.indexOf(`if (tab === '${k}')`); return a < 0 ? '' : mp.slice(a, mp.indexOf('\n  if (tab', a + 5) > 0 ? mp.indexOf('\n  if (tab', a + 5) : mp.indexOf('const acct', a)); };
  const view = part('view'), dev = part('dev'), acct = mp.slice(mp.indexOf('const acct'));
  sc.eq('㊺ 세 탭 이름 · 교역자는 보기 · 계정만', [/const MTAB_NAME = \{ view: '보기', acct: '계정', dev: '개발' \}/.test(HTML), /function menuTabs\(\) \{ return isStaff\(\) \? \['view', 'acct'\] : \['view', 'acct', 'dev'\]; \}/.test(HTML)], [true, true]);
  sc.eq('㊺ 보기 = 밝기 테마 · 첫 화면 정하기', [/data-theme=/.test(view), /data-act="home"/.test(view), /data-act="wpull"|data-act="login"/.test(view)], [true, true, false]);
  sc.eq('㊺ 계정 = 로그인 · 로그아웃 · 내 부재', [/data-act="glogin"/.test(acct), /data-act="login"/.test(acct), /data-act="logout"/.test(acct), /data-act="myavail"/.test(acct), /data-act="wpull"|data-theme/.test(acct)], [true, true, true, true, false]);
  sc.eq('㊺ 개발 = 예배팀 받기 · 시트 가져오기 · 버전', [/data-act="wpull"/.test(dev), /data-act="importpick"/.test(dev), /data-act="upd"/.test(dev), /data-theme|data-act="login"/.test(dev)], [true, true, true, false]);
  sc.eq('㊺ 로그인 전엔 계정 탭부터 · 고른 탭은 이 기기(PREF) — 계정 ui 에 넣지 않음', [/S\.mtab = !DEMO && !FB\.user \? 'acct'/.test(HTML), /PREF\.mtab = id; savePref\(\)/.test(HTML), /saveUi\(\{ mtab/.test(HTML)], [true, true, false]);
  sc.eq('㊺ 탭 넘김: 손가락을 따라가고 quiet() 이면 끔 · 닫기는 × 하나', [/function menuSwipe\(sh\)/.test(HTML), /if \(quiet\(\) \|\| !pg \|\| !pg\.animate\)/.test(HTML), /data-act="close" aria-label="닫기"/.test(HTML.slice(HTML.indexOf('function menuHead('), HTML.indexOf('function renderMenu(')))], [true, true, true]);
  sc.eq('㊺ 교역자도 탭은 넘긴다(staffOk) · 지난 일정 단추도', [/if \(d\.tab \|\| d\.mtab \|\|/.test(HTML), /STAFF_ACTS = new Set\(\['menu', 'pastmore', 'pastless',/.test(HTML)], [true, true]);
  const vb = HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function pastMonths('));
  sc.eq('㊺ 부산 탭: \'다가오는 … n번\' 글 없음 · 맨 위에 \'지난 부산 일정 보기\'(숫자 없음) · 맨 아래 펼침 없음', [/다가오는 부산 일정/.test(vb), />지난 부산 일정 보기</.test(vb), /past\.length\}번/.test(vb), /details class="more"/.test(vb)], [false, true, false, false]);
}

// ㊻ 지난 부산 일정은 한 달씩 · 해가 바뀌면 가로띠 (1117-Z 3b, HB 11/18)
{
  const src = HTML.slice(HTML.indexOf('function pastMonths('), HTML.indexOf('\n', HTML.indexOf('function pastMonths(')));
  const pastMonths = new Function(src + '; return pastMonths;')();
  const P = ['2026-11-08', '2026-10-25', '2026-10-04', '2026-08-30', '2025-12-28'].map(date => ({ date }));
  sc.eq('㊻ 달마다 묶음 · 지난 일정이 있는 달만 · 오래된 달이 앞(위로 더해짐)', pastMonths(P).map(([k, l]) => k + ':' + l.map(v => v.date.slice(8)).join(',')), ['2025-12:28', '2026-08:30', '2026-10:04,25', '2026-11:08']);
  const vb = HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function pastMonths('));
  sc.eq('㊻ 단추: 처음엔 글자 · 펴면 세 칸(+ 한 달 더 · − 한 달 접기 · ↺ 모두 접기) · 해가 바뀌면 가로띠', [/data-act="pastmore">지난 부산 일정 보기/.test(vb), /class="pseg"[^`]*data-act="pastmore"[^`]*data-act="pastless"[^`]*data-act="pastreset"/.test(vb), /aria-label="모두 접기"/.test(vb), /class="yband">\$\{y\}년/.test(vb), /pm2\.slice\(pm2\.length - n\)/.test(vb)], [true, true, true, true, true]);
}

// ㊿ 1118 — 모두 접기 · 달력표 한 칸에 여러 분 · 새 아이콘
{
  sc.eq('㊿ 모두 접기는 S.pastN = 0 으로(처음 화면) · 교역자도 누를 수 있음', [/function pastReset\(\)[^\n]*S\.pastN = 0; render\(\)/.test(HTML), /if \(d\.act === 'pastreset'\) return pastReset\(\)/.test(HTML), /STAFF_ACTS = new Set\(\[[^\]]*'pastreset'/.test(HTML)], [true, true, true]);
  const ca = HTML.slice(HTML.indexOf('const cellAt = '), HTML.indexOf('const cell = (p, svc'));
  sc.eq('㊿ 칸에 여러 분이면 자르지 않고 줄마다 한 분(nstack) · 한 분이면 예전처럼', [/ns\.length > 1 \? `<span class="nstack">/.test(ca), /esc\(short\(t\)\)/.test(ca), /\.nstack>span\+span\{border-top/.test(HTML)], [true, true, true]);
  sc.eq('㊿ 아이콘 새로 받기(?v=2)', [/href="favicon\.png\?v=2"/.test(HTML), /href="apple-touch-icon\.png\?v=2"/.test(HTML)], [true, true]);
}

// ㊼ 부산 광고 판 다듬기 (1117-Z 4, HB 사진 11/18 E ~ K) — 지어낸 이름 · 이메일
{
  const SUN = '2026-11-22', V = 'v|2026-11-22';
  const P = [{ id: 'pa', name: '가가', roles: ['busan'], bul: true, email: 'ga@example.com' }, { id: 'pb', name: '나나', roles: ['busan'], bul: true, email: 'na@example.com' }, { id: 'pc', name: '다다', roles: ['busan'], email: 'da@example.com' }];
  const bk = A.normBook({ people: P, visits: [{ id: V, who: ['pa'], days: '토일', at: 1 }], buls: [{ id: 'u|2026-11', p: 'pb' }],
    adtx: [{ id: 't|' + SUN, tx: '고친 글\r\n둘째 줄', at: 5 }, { id: 't|2026-11-21', tx: '토요일', at: 5 }, { id: 't|2026-11-29', tx: '   ', at: 5 }, { id: 'x|2026-11-29', tx: 'a' }] });
  sc.eq('㊼ 줄 = 주일만 · 빈 글은 버림 · 줄바꿈은 \\n 하나로', bk.adtx.map(x => [x.id, x.tx]), [['t|' + SUN, '고친 글\n둘째 줄']]);
  sc.eq('㊼ 너무 긴 글은 잘라 둔다', A.normAdtx({ id: 't|' + SUN, tx: 'ㄱ'.repeat(A.ADTX_MAX + 50) }).tx.length, A.ADTX_MAX);
  sc.eq('㊼ 고친 글이 있으면 그것 · 없거나 만든 글과 같으면 만든 글', [A.adtxPick(bk, SUN, '만든 글'), A.adtxPick(bk, '2026-11-29', '만든 글'), A.adtxPick(bk, SUN, '고친 글\n둘째 줄')],
    [{ text: '고친 글\n둘째 줄', edited: true }, { text: '만든 글', edited: false }, { text: '고친 글\n둘째 줄', edited: false }]);
  const b2 = J(bk); A.drop(b2, 'adtx', 't|' + SUN, 'hb', 9);
  sc.eq('㊼ ↻ = 지우기 표지(주일을 남김) → 만든 글로 · 맞추기에서 되살아나지 않음', [b2.adtx[0].del, b2.adtx[0].sun, A.adtxOf(b2, SUN), A.adtxOf(A.mergeBook(bk, b2), SUN)], [true, SUN, '', '']);
  sc.eq('㊼ 두 기기가 고치면 나중 것', A.adtxOf(A.mergeBook(bk, A.normBook({ adtx: [{ id: 't|' + SUN, tx: '나중 글', at: 7 }] })), SUN), '나중 글');
  sc.eq('㊼ 상영 줄과 따로 — 상영을 바꿔도 고친 글은 그대로', (b => { A.put(b, 'shows', { id: 's|' + SUN, sun: SUN, bs: 'same' }, 'hb', 20); return [A.showOf(b, SUN), A.adtxOf(b, SUN)]; })(J(bk)), ['same', '고친 글\n둘째 줄']);
  // 교역자 — 자기 칸 그 방문 줄 tx · txAt → absorb
  const pt = A.staffPatch('ga@example.com', 'tx', V, '교역자 글', 50);
  sc.eq('㊼ 교역자 조각 = 그 방문 줄 안 tx · txAt (보안 규칙이 이미 허락하는 visits 칸)', pt, { email: 'ga@example.com', at: 50, visits: { [V]: { tx: '교역자 글', txAt: 50 } } });
  sc.eq('㊼ 빈 글 조각 = 원래 글로(\'\')', A.staffPatch('ga@example.com', 'tx', V, '  ', 51).visits[V], { tx: '', txAt: 51 });
  sc.eq('㊼ normStaff 는 tx 를 읽는다(글이 아니면 버림)', [A.normStaff(pt).visits[V], A.normStaff({ email: 'ga@example.com', visits: { [V]: { tx: 3, txAt: 9 } } }).visits], [{ tx: '교역자 글', txAt: 50 }, {}]);
  sc.eq('㊼ 그 일정 교역자(가가)의 글을 받는다', A.adtxOf(A.absorb(bk, [pt]).book, SUN), '교역자 글');
  sc.eq('㊼ 그 달 주보 담당(나나)의 글도 받는다', A.adtxOf(A.absorb(bk, [A.staffPatch('na@example.com', 'tx', V, '주보 담당 글', 50)]).book, SUN), '주보 담당 글');
  sc.eq('㊼ 상영을 못 고르는 교역자(다다)의 글은 안 받는다', A.adtxOf(A.absorb(bk, [A.staffPatch('da@example.com', 'tx', V, '몰래', 50)]).book, SUN), '고친 글\n둘째 줄');
  sc.eq('㊼ HB 가 그 뒤에 고쳤으면 HB 것(나중 것)', A.adtxOf(A.absorb(bk, [A.staffPatch('ga@example.com', 'tx', V, '옛 글', 3)]).book, SUN), '고친 글\n둘째 줄');
  const rr = A.absorb(bk, [A.staffPatch('ga@example.com', 'tx', V, '', 60)]);
  sc.eq('㊼ 교역자의 ↻ = 지우기 표지로 → 만든 글', [A.adtxOf(rr.book, SUN), rr.book.adtx[0].del, rr.changed], ['', true, ['t|' + SUN]]);
  sc.eq('㊼ 없는 글을 되돌리면 할 일 없음(바뀐 것 없음)', A.absorb(A.normBook({ people: P, visits: [{ id: V, who: ['pa'], at: 1 }] }), [A.staffPatch('ga@example.com', 'tx', V, '', 60)]).changed, []);
  sc.eq('㊼ 한 번 받은 뒤 다시 맞춰도 바뀐 것 없음(핑퐁 없음)', A.absorb(A.absorb(bk, [pt]).book, [pt]).changed, []);
  sc.eq('㊼ adtx 는 b16 부터(1117-Z 5 에서 b17) · b15 는 옛 칸(낡은 앱은 adtx 를 떨군다)', [A.WRITE_FIELD, A.OLD_FIELDS.slice(-3)[0], A.pickDoc(null, { b18: J(bk) }).push, A.adtxOf(A.pickDoc(null, { b18: J(bk), b15: Object.assign(J(bk), { adtx: [] }) }).book, SUN)], ['b18', 'b15', false, '고친 글\n둘째 줄']);
  // 화면
  const pa = HTML.slice(HTML.indexOf('function paneAds('), HTML.indexOf('function adsFit('));
  sc.eq('㊼ 제목 밑 \'Monday 에서 읽기만 합니다\' 없음 → 맨 아래 오른쪽 줄(읽기만 · 읽은 때 · 다시 읽기 · 연결 끊기 HB 만)', [/<span class="sub">Monday 에서 읽기만/.test(pa), /class="adfoot"><span>Monday 에서 읽기만 합니다<\/span><span id="ads-when">[^\n]*data-act="adsload">다시 읽기<\/button>\$\{isStaff\(\) \? '' : '<button class="txtbtn" data-act="adsoff">Monday 연결 끊기/.test(pa), /\.adfoot\{display:grid;justify-items:end/.test(HTML)], [false, true, true]);
  sc.eq('㊼ \'카톡용 복사\' 단추 없음 → 전달용 텍스트 카드(말풍선 · 아이콘 셋 ↻ ✎ 복사 · 머리줄 복사 없음)', [/>카톡용 복사</.test(pa), /<h4>전달용 텍스트<\/h4>/.test(pa), /ib\('adtxreset'[^\n]*ib\('adtxedit'[^\n]*ib\('adscopy'/.test(pa)], [false, true, true]);
  sc.eq('㊼ 고치기 · 되돌리기는 상영을 고르는 사람만(bsCan) · 복사는 모두 · ↻ 는 고친 글일 때만', [/icons = \(can \? ib\('adtxreset', 'reset', '원래 글로 되돌리기', !cur\.edited \|\| ed\)/.test(pa), /if \(!bsCan\(sun\)\) return false;/.test(HTML)], [true, true]);
  sc.eq('㊼ 복사는 지금 보이는 글(고친 글 · 고치는 중이면 그 글) · 누른 자리에서 바로', /tx = ta \? ta\.value : adsTxNow\(P\)\.text/.test(HTML), true);
  sc.eq('㊼ 고치는 중 다시 그려도 글 그대로(txDraft) · 칸을 벗어나면 조용히 저장 · 뒤로 가기 전에 칸을 벗어남', [/P\.txDraft != null \? P\.txDraft : cur\.text/.test(pa), /t\.id !== 'ads-tx'[^\n]*adtxSave\(S\.pane\.sun, t\.value\)/.test(HTML), /d\.act === 'adsback'\) \{ if \(document\.activeElement && document\.activeElement\.blur\) document\.activeElement\.blur\(\);/.test(HTML)], [true, true, true]);
  sc.eq('㊼ 교역자는 자기 칸으로(staffWrite tx) · HB 는 책에(put / drop adtx)', /staffWrite\('tx', v\.id, t\)[\s\S]{0,200}put\(S\.book, 'adtx'[\s\S]{0,120}drop\(S\.book, 'adtx'/.test(HTML), true);
  sc.eq('㊼ (E) 날짜 칸 빈 글자는 한 줄 · 줄지 않음(아이패드에서 세로로 쪼개짐)', /\.inp\[type=date\]:invalid::before,\.inp\[type=time\]:invalid::before\{content:attr\(placeholder\);color:var\(--tx3\);white-space:nowrap;flex:none\}/.test(HTML), true);
}

// ㊽ 숙소 목록 손잡이 · '더 보기' 줄 · 달력표 꺾쇠 · 부산 목록 줄 (1117-Z 5, HB 11/18 L ~ W) — 지어낸 이름
{
  const hid = (n, k) => A.optId('stay', n, k || 'hotel');
  const names = ['호텔 가', '호텔 나', '호텔 다', '호텔 라'];
  const bk = A.normBook({ opts: names.map((n, i) => ({ id: hid(n), name: n, kind: 'hotel', ord: i, at: 1 })).concat([{ id: hid('댁 가', 'home'), name: '댁 가', kind: 'home', ord: 4, at: 1 }]) });
  const order = (b) => A.optList(b, 'stay').filter(o => o.kind === 'hotel').map(o => o.name + (o.more ? '*' : ''));
  sc.eq('㊽ normOpt 는 숙소 줄의 more 를 지킨다(1 로) · 다른 종류 · 없으면 칸 없음', [A.normOpt({ id: hid('x'), name: 'x', more: true }).more, 'more' in A.normOpt({ id: hid('y'), name: 'y' }), 'more' in A.normOpt({ id: A.optId('mode', 'KTX'), name: 'KTX', more: 1 })], [1, false, false]);
  const b1 = J(bk), c1 = A.optReorder(b1, 'stay', [hid('호텔 가'), hid('호텔 나'), A.OPT_MORE, hid('호텔 다'), hid('호텔 라')], 'hb', 10);
  sc.eq('㊽ \'더 보기\' 줄을 둘째 뒤로 = 아래 둘에 more · 차례 그대로', [c1, order(b1)], [true, ['호텔 가', '호텔 나', '호텔 다*', '호텔 라*']]);
  const b2 = J(b1), c2 = A.optReorder(b2, 'stay', [hid('호텔 가'), hid('호텔 다'), hid('호텔 나'), A.OPT_MORE, hid('호텔 라')], 'hb', 20);
  sc.eq('㊽ 아래 줄을 \'더 보기\' 위로 끌면 more 가 풀리고 위 줄은 아래로', [c2, order(b2)], [true, ['호텔 가', '호텔 다', '호텔 나', '호텔 라*']]);
  sc.eq('㊽ 같은 차례 · 같은 더 보기면 아무것도 안 씀', A.optReorder(J(b2), 'stay', [hid('호텔 가'), hid('호텔 다'), hid('호텔 나'), A.OPT_MORE, hid('호텔 라')], 'hb', 30), false);
  const b3 = J(b2); A.optReorder(b3, 'stay', [hid('호텔 가'), hid('호텔 다'), hid('호텔 나'), hid('호텔 라'), A.OPT_MORE], 'hb', 30);
  sc.eq('㊽ \'더 보기\' 를 맨 아래로 = 모두 보임', order(b3), ['호텔 가', '호텔 다', '호텔 나', '호텔 라']);
  const b4 = J(b2); A.optReorder(b4, 'stay', [hid('호텔 라'), hid('호텔 가')], 'hb', 40);
  sc.eq('㊽ 숙소 판 알약 끌기(더 보기 표 없음)는 more 를 건드리지 않는다', order(b4), ['호텔 라*', '호텔 다', '호텔 나', '호텔 가']);
  sc.eq('㊽ 성도님 댁 줄은 그대로(한쪽만 넘김)', A.optList(b2, 'stay').find(o => o.kind === 'home').more, undefined);
  sc.eq('㊽ 두 기기: 나중에 고친 줄이 이김(more 도 함께)', order(A.mergeBook(b1, b2)), order(b2));
  sc.eq('㊽ 교통편 목록은 OPT_MORE 를 무시', (b => { A.optReorder(b, 'mode', ['-more-', A.optId('mode', '자차'), A.optId('mode', 'KTX')], 'hb', 5); return A.optList(b, 'mode').map(o => o.name + (o.more ? '*' : '')); })(A.normBook({})), ['자차', 'KTX']);
  sc.eq('㊽ 쓰는 칸 b17 · b16 은 옛 칸(낡은 앱은 more 를 떨군다) · 옛 칸 사본과 합쳐도 more 그대로', [A.WRITE_FIELD, A.OLD_FIELDS.slice(-2)[0], A.optList(A.pickDoc(null, { b18: J(b2), b16: (o => { o.opts.forEach(x => delete x.more); return o; })(J(b2)) }).book, 'stay').filter(o => o.more).length], ['b18', 'b16', 1]);
  // 화면
  const pm = HTML.slice(HTML.indexOf('function paneManage('), HTML.indexOf('/* ---- 숙소 알약'));
  sc.eq('㊽ (L) 목록 관리: 꺾쇠(data-mmove) 없음 → 손잡이(mghd) · (M) 숙소에만 \'더 보기\' 줄', [/data-mmove/.test(pm), /class="mghd"/.test(pm), /data-mid="\$\{OPT_MORE\}"/.test(pm), /type === 'stay' \?/.test(pm)], [false, true, true, true]);
  const ps = HTML.slice(HTML.indexOf("} else if (ed.sec === 'stay') {"), HTML.indexOf("} else if (ed.sec === 'travel') {"));
  sc.eq('㊽ (M) 숙소 판: more 줄은 \'더 보기\' 를 눌러야(고른 숙소가 그 안이면 펴 둠)', [/o\.more/.test(ps), /data-act="spmore"/.test(ps)], [true, true]);
  sc.eq('㊽ (N) 꺾쇠 둘레 알약 바탕 없음 · 선만 끊김 · (P) 표 아래 여백 줄 없음', [/\.edge\{[^}]*border-radius:9px/.test(HTML), /\.edge button::before\{/.test(HTML), /\.tblwrap\.ext\{padding-bottom:9px\}/.test(HTML)], [false, true, false]);
  const bb = HTML.slice(HTML.indexOf('function bodyBusan('), HTML.indexOf('function viewMonth('));
  sc.eq('㊽ 끄는 중엔 판을 다시 그리지 않음(계정 맞추기가 들린 줄을 지우지 않게) · 토스트는 누름을 아래로 보냄(바로 다시 끌게) · 달력표 단추 줄 .mbar 와 메뉴 밑줄 이름 안 겹침', [/if \(MG\.el\) \{ MG\.again = true; return; \}/.test(HTML), /#toast\{[^}]*pointer-events:none/.test(HTML), /\n\.mbar\{position:absolute/.test(HTML), /\.mtabs \.mbar\{position:absolute/.test(HTML)], [true, true, false, true]);
  sc.eq('㊽ (Q) 부산 요약 표에도 위 · 아래 꺾쇠(앞 · 뒤 주)', [/edgeHtml\('busan', 'top'/.test(bb), /edgeHtml\('busan', 'bot'/.test(bb)], [true, true]);
  const vb = HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function pastMonths('));
  sc.eq('㊽ 부산 목록 줄(1117-Z 7 에서 시안 B 로 바뀜): 이름 = 초록 글씨(vttl) · 인도 안 하는 금요 회색 · 특이사항 · 중요 빨강 · 숙소는 오른쪽 · 다른 화면의 인도 알약(leadChips)은 안 씀', [/class="vttl"/.test(vb), /friGray/.test(vb), /class="vred"/.test(vb), /class="vst"/.test(vb), /leadChips\(v\)/.test(vb)], [true, true, true, true, false]);
}

// ㊾ 메모 중요 · 일반 · 부산 요약 특이사항 칸 · 분당 주일 꺾쇠 · 꺾쇠 삼등분 (1117-Z 5b, HB 11/18 R · N' · V') — 지어낸 이름
{
  const V = 'v|2026-11-22';
  const bk = A.normBook({ people: [{ id: 'pa', name: '가가', roles: ['busan'] }], visits: [{ id: V, who: ['pa'], note: '일반 메모', hot: '  중요 메모  ', issues: [{ cat: '중고등부', text: '설교 필요' }], at: 1 }, { id: 'v|2026-11-29', who: ['pa'], hot: '   ', at: 1 }] });
  sc.eq('㊾ normVisit: hot(중요)는 다듬어 둠 · 비면 칸 없음 · note(일반)는 그대로', [bk.visits[0].hot, bk.visits[0].note, 'hot' in bk.visits[1]], ['중요 메모', '일반 메모', false]);
  sc.eq('㊾ 두 기기 맞추기: 나중 줄이 이김(hot 함께)', A.mergeBook(bk, A.normBook({ visits: [{ id: V, who: ['pa'], hot: '나중', at: 5 }] })).visits.find(v => v.id === V).hot, '나중');
  sc.eq('㊾ 쓰는 칸 b18 · b17 옛 칸(낡은 앱은 hot 을 떨군다) · 옛 칸 사본과 합쳐도 hot 그대로', [A.WRITE_FIELD, A.OLD_FIELDS.slice(-1)[0], A.pickDoc(null, { b18: J(bk), b17: (o => { o.visits.forEach(v => delete v.hot); return o; })(J(bk)) }).book.visits.find(v => v.id === V).hot], ['b18', 'b17', '중요 메모']);
  // 화면
  const vb = HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function pastMonths('));
  sc.eq('㊾ (V\') 부산 목록 빨간 글자 = 특이사항 + 중요만 · 일반 메모는 흐린 줄로(1117-Z 7, HB 11/18 에 바꿈)', [/concat\(v\.hot \? \[v\.hot\] : \[\]\)/.test(vb), /v\.note \|\| ''\]/.test(vb)], [true, true]);
  const pe = HTML.slice(HTML.indexOf("} else body = `<div class=\"field\"><label for=\"df-hot\">"), HTML.indexOf("} else body = `<div class=\"field\"><label for=\"df-hot\">") + 900);
  sc.eq('㊾ (V\') 메모 판 = \'중요\'(빨강) · \'일반\' 두 칸', [/data-df="hot"/.test(pe), /data-df="note"/.test(pe), /중요/.test(pe), /일반/.test(pe)], [true, true, true, true]);
  sc.eq('㊾ (V\') 이번 주 카드 · 목록도 중요만(일반 메모는 판 안에서)', [/v\.note \? row\('메모', v\.note\)/.test(HTML), /issuesT\(v\), v\.note\]/.test(HTML)], [false, false]);
  const bb = HTML.slice(HTML.indexOf('function bodyBusan('), HTML.indexOf('function viewMonth('));
  sc.eq('㊾ (R) 부산 요약 표 맨 왼쪽 \'특이사항\' 칸(빨강 = 특이사항 + 중요)', [/<tr><th class="h-bs">특이사항<\/th><th class="h-bs">날짜<\/th>/.test(bb), /class="vred"/.test(bb)], [true, true]);
  const vm = HTML.slice(HTML.indexOf('function viewMonth('), HTML.indexOf('function specTable('));
  sc.eq('㊾ (N\') 분당 주일 표에도 위 · 아래 꺾쇠(앞 · 뒤 주)', [/edgeHtml\('sun', 'top'\)/.test(vm), /edgeHtml\('sun', 'bot'\)/.test(vm)], [true, true]);
  sc.eq('㊾ 꺾쇠는 날짜 칸 가로 삼등분 자리(^ 1/3 · v 2/3) — 붙어 있어 잘못 눌리던 것', [/\.edge \.eu\{left:33\.3%\}/.test(HTML), /\.edge \.ed\{left:66\.7%\}/.test(HTML)], [true, true]);
}

// (51) 1117-Z 7 — 부산 목록 한 줄 시안 B '요일 칸' (HB 11/18 고름) · 폰도 숙소 세부는 오른쪽 위 · 보조 항목은 한 줄에 하나
{
  const vb = HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function pastMonths('));
  const row = HTML.slice(HTML.indexOf('function busanRow('), HTML.indexOf('// 지난 부산 일정 — 달마다 묶음'));
  sc.eq('(51) viewBusan 은 busanRow 한 곳으로 그린다', [/const line = \(v, cls\) => busanRow\(/.test(vb), row.length > 500], [true, true]);
  sc.eq('(51) 요일 칸: 머무는 날 = on(초록 띠) · 띠 양 끝 first/last · 주말 밖 요일 = x · 맡은 일은 그 날짜 칸(x.date === d)', [/ds\.has\(d\)/.test(row), /'first'/.test(row) && /'last'/.test(row), /on && c !== '토' && c !== '일' \? 'x' : ''/.test(row), /ls\.filter\(x => x\.date === d\)/.test(row)], [true, true, true, true]);
  sc.eq('(51) 맡은 일: 색 = 어느 예배(h-fri · h-sun · h-ll · h-ev) · 모양 = 누가(staff · lay · relay · none)', [/h-\$\{hue\(x\)\}/.test(row), /x\.ev \? 'ev' : x\.svc/.test(row), /x\.m \|\| 'none'/.test(row)], [true, true, true]);
  sc.eq('(51) 보조 줄은 한 항목 한 줄(가운데 점으로 잇지 않음) · 빨강(특이사항 · 중요)이 먼저 · 일반 메모는 흐림', [/red\.map\(t => `<span class="vred">/.test(row), /gray\.map\(t => `<span>/.test(row), /join\(' · '\)\}<\/span>`\)\.join/.test(row), /\.vrow \.vaux\{[^}]*flex-direction:column/.test(HTML)], [true, true, false, true]);
  sc.eq('(51) 숙소: 상태 아래 세부, 폰도 오른쪽 위(옛 폰 규칙 display:contents 없음)', [/\.vrow \.vst\{grid-column:3;grid-row:1;[^}]*align-items:flex-end/.test(HTML), /\.vrow \.vst\{display:contents\}/.test(HTML), /\.vrow \.vwk\{grid-column:2\/4;grid-row:2/.test(HTML)], [true, false, true]);
  sc.eq('(51) 색은 이 목록에서만(--bz-*) — 라이트 하나 · 다크 둘(시스템 · 고름) · 공용 --fri 는 그대로', [(HTML.match(/--bz-fri:/g) || []).length, /--fri:#7b4fc4/.test(HTML)], [3, true]);
  sc.eq('(51) 보통은 목 ~ 주일 네 칸(줄마다 같은 자리) · 많아도 8칸', [/addDays\(sun, -3\)/.test(HTML.slice(HTML.indexOf('function busanCols('), HTML.indexOf('function busanRow('))), /cols\.length < 8/.test(HTML)], [true, true]);
}

// (52) 1117-Z 7b — HB 11/18 사진: A 요일 글자 · B 이름 줄바꿈 · C 같은 요일 같은 세로 자리
{
  const row = HTML.slice(HTML.indexOf('function busanRow('), HTML.indexOf('// 지난 부산 일정 — 달마다 묶음'));
  sc.eq('(52) A 내려가는 날만 색(주말 밖 빨강 · 토 · 주일 기본) · 안 내려가는 날은 옅게(off)', [/on \? 'on' : 'off'/.test(row), /\.vrow \.vdl\.off\{color:var\(--tx3\);opacity/.test(HTML), /\.vrow \.vdl\.x\{color:var\(--bz-day\)\}/.test(HTML)], [true, true, true]);
  sc.eq('(52) B 이름은 줄바꿈 안 함(내 이름 형광이 붙어도)', /\.vrow \.vwho>span:first-child\{white-space:nowrap\}/.test(HTML), true);
  sc.eq('(52) C 칸 폭은 요일로만 정함(맡은 일 유무로 안 바뀜) · 맡은 일은 다음 요일 앞까지 빈 칸을 씀 · 좁으면 끝까지(계단)', [/grid-template-columns:\$\{cols\.map\(d => wOf\(d\) \+ 'fr'\)/.test(row), /us\.length \? '1\.4fr'|full \? '1\.4fr'/.test(row), /return w >= 1\.1 \? nx \+ 1 : -1;/.test(row), /grid-auto-flow:row dense/.test(HTML)], [true, false, true, true]);
}

// (53) 1119 B · E — 광고 읽는 중 토스트 · 숙소 목록 줄 가운데로 끌기 (HB 11/18)
{
  const bt = HTML.slice(HTML.indexOf('function busyToast('), HTML.indexOf('function todayYmd('));
  sc.eq('(53) B 읽는 중이면 가운데 토스트에 Monday 로고(빨강 · 노랑 막대 + 초록 점) · 판이 닫히거나 읽기가 끝나면 걷음', [/P\.kind === 'ads' && P\.state === 'busy'/.test(bt), /#FF3D57/.test(bt), /#FFCB00/.test(bt), /#00D647/.test(bt), /t\.hidden = true/.test(bt), /busyToast\(\);\s*const done/.test(HTML), /el\.scrollTop = top; busyToast\(\);/.test(HTML)], [true, true, true, true, true, true, true]);
  sc.eq('(53) B 로고는 차례로 통통(키프레임) · reduced-motion 이면 멈춤 · 다른 토스트는 busy 표지를 지움', [/@keyframes mhop/.test(HTML), /prefers-reduced-motion:reduce\)\{#toast \.mlogo>\*\{animation:none/.test(HTML), /delete t\.dataset\.busy; t\.textContent = msg/.test(HTML)], [true, true, true]);
  const mg = HTML.slice(HTML.indexOf('function mgInit('), HTML.indexOf('mgInit();'));
  sc.eq('(53) E 줄 가운데(.mgname)도 끌기 — 손가락 0.45초 꾹 · 8px 먼저 움직이면 화면 스크롤 · 그냥 누르면 고치기', [/#mglist \.mghd, #mglist \.mgname, #mglist \.mgmore/.test(mg), /setTimeout\(\(\) => \{[^]*?\}, 450\)/.test(mg), /< 8\) return/.test(mg), /clearTimeout\(MG\.t\); MG\.pend = null/.test(mg), /MG\.eat/.test(mg)], [true, true, true, true, true]);
}

// (54) 1119 H · I — 사진 보기 하나를 카드 아이콘 · 숙소 판 썸네일이 함께 씀 (HB 11/19 사진)
{
  const pv = HTML.slice(HTML.indexOf('function openPhotos('), HTML.indexOf('/* ---------- 메일에서 숙소 예약 찾기'));
  const row = HTML.slice(HTML.indexOf('function busanRow('), HTML.indexOf('// 지난 부산 일정 — 달마다 묶음'));
  sc.eq('(54) 옛 openLightbox 는 없고 사진 보기 하나(openPhotos) · id 는 그대로 lightbox(ESC · × 길 공용)', [/function openLightbox\(/.test(HTML), /el\.id = 'lightbox'/.test(pv), /if \(\$\('#lightbox'\)\) return closePhotos\(\);/.test(HTML), /if \(a === 'closelb'\) return closePhotos\(\);/.test(HTML)], [false, true, true, true]);
  sc.eq('(54) 여러 장: 손가락을 따라(4분의 1 · 빠른 튕김 40px · 끝은 고무줄 0.25) · \'2 / 3\' · PC 좌우 단추 · 방향키', [/Math\.abs\(dx\) > w \/ 4 \|\| fast/.test(pv), /Math\.abs\(dx\) > 40/.test(pv), /mx \* 0\.25/.test(pv), /\(PV\.i \+ 1\) \+ ' \/ ' \+ PV\.ids\.length/.test(pv), /data-act="pvprev"/.test(pv) && /data-act="pvnext"/.test(pv), /ArrowLeft/.test(pv) && /ArrowRight/.test(pv), /\.pview\.many \.pvnav\{display:grid\}/.test(HTML)], [true, true, true, true, true, true, true]);
  sc.eq('(54) 다운로드: 폰은 기다림 없이 파일로 바꿔 공유(await 없음) · 아니면 a[download] · 빼기는 숙소 판에서 열 때만', [/navigator\.share\(\{ files: \[f\] \}\)/.test(pv), /a\.download = name/.test(pv), /await/.test(pv.slice(pv.indexOf('function pvSave('))), /\$\{del \? `<button class="del" data-act="pvdel">/.test(pv)], [true, true, false, true]);
  sc.eq('(54) 빼기는 초안에서만(저장해야 반영) · 썸네일 = 그 사진부터 + 빼기 · 카드 아이콘 = 그 일정 숙소 사진 전부, 빼기 없음', [/if \(d\.act === 'pvdel'\) \{[^\n]*\n[^\n]*ed\.d\.imgs = \(ed\.d\.imgs \|\| \[\]\)\.filter\(x => x !== id\)/.test(HTML), /openPhotos\(dd\.imgs \|\| \[\], \+d\.pvi, true\)/.test(HTML), /openPhotos\(visitPics\(v\), 0, false\)/.test(HTML), /<button class="thb" data-pvi=/.test(HTML)], [true, true, true, true]);
  sc.eq('(54) 카드: \'예약 화면 N장\' 글은 없고 숙소 상태 왼쪽에 사진 아이콘(span[data-act] — 카드 열기와 따로) · 교역자는 없음', [/예약 화면 ' \+ s\.imgs\.length/.test(HTML), /<span class="vpic" data-act="vpics" data-vid=/.test(row), /const pics = isStaff\(\) \? \[\] : visitPics\(v\)/.test(row), row.indexOf('class="vpic"') < row.indexOf('class="vss')], [false, true, true, true]);
  const vm2 = require('vm'), ctx = {}; vm2.runInNewContext(HTML.match(/function visitPics\(v\) \{[^\n]*\}/)[0] + ';this.f = visitPics;', ctx);
  sc.eq('(54) visitPics: 숙소 여럿의 사진을 차례대로 · 겹치면 한 번', JSON.stringify(ctx.f({ stay: [{ imgs: ['a', 'b'] }, {}, { imgs: ['b', 'c'] }] })), JSON.stringify(['a', 'b', 'c']));
}

// (55) 1119-2 — 사진 보기에서 아래로 끌어내리면 닫힘 (HB 11/19)
{
  const sw = HTML.slice(HTML.indexOf('function pvSwipe('), HTML.indexOf('// 다운로드 — dataURL'));
  sc.eq('(55) 세로로 먼저 움직이면 끌어내리기(axis y) · 높이 6분의 1 또는 빠른 튕김 40px 넘으면 닫기 · 못 미치면 제자리 · 위로는 고무줄', [/axis = Math\.abs\(my\) > Math\.abs\(mx\) \? 'y' : 'x'/.test(sw), /dy > h \/ 6 \|\| fast/.test(sw), /closePhotos\(true\)/.test(sw), /el\.style\.backgroundColor = ''; pvPlace\(true, from\)/.test(sw), /my \* 0\.2/.test(sw)], [true, true, true, true, true]);
}

// (56) 1119-3 — 판 손짓 닫기(A) · 판이 열린 동안 뒤 화면 잠금(C) (HB 11/19 사진)
{
  const pn = HTML.slice(HTML.indexOf('function openPane('), HTML.indexOf('const xBtn = '));
  const pg = pn.slice(pn.indexOf('function paneGest('));
  sc.eq('(56) A 제목줄 끌어내리기 · 왼쪽 가장자리 24px 밀기 · 4분의 1 또는 빠른 튕김 40px · 반대쪽 고무줄 · 그늘 옅어짐', [/const PG_EDGE = 24;/.test(pn), /tg\.closest\('\.phead'\)/.test(pg), /g\.d > big \/ 4 \|\| fast/.test(pg), /g\.d > 40/.test(pg), /Math\.max\(v \* 0\.2, -16\)/.test(pg), /bg\.style\.opacity = String\(1 - /.test(pg)], [true, true, true, true, true, true]);
  sc.eq('(56) A 닫기는 × 와 같은 길 — 편집 중이면 요약으로(paneStays), 표에서 바로 연 항목은 놓은 자리에서 이어 나감(closeVEdit → closePane(o))', [/if \(!paneStays\(\)\) return closePane\(\{ from, to:/.test(pg), /return closeVEdit\(false, o\)/.test(pn), /if \(S\.pane\.direct\) return closePane\(o\);/.test(HTML), /function paneStays\(\) \{ const P = S\.pane; return !!\(P && P\.kind === 'visit' && P\.edit && \(P\.edit\.manage \|\| !P\.direct\)\); \}/.test(pn)], [true, true, true, true]);
  sc.eq('(56) A 목록 끌기(MG) · 알약 끌기(SP) · 사진 보기 · 글자 칸과 안 엉킴 · 손짓 끝 누름은 버림 · 제목줄 touch-action:none', [/MG\.el \|\| MG\.pend \|\| \(SP\.el && \(SP\.lift \|\| SP\.drag\)\) \|\| \$\('#lightbox'\)/.test(pg), /tg\.closest\('input,textarea,select'\)/.test(pg), /PG\.eat = Date\.now\(\)/.test(pg), /\.phead\{touch-action:none/.test(HTML)], [true, true, true, true]);
  sc.eq('(56) C 판을 붙이기 전에 뒤 화면 잠금 · 닫힌 뒤(다른 판 없으면) 풀고 보던 자리로 · body fixed · 붙은 것(제목줄 · 기둥)은 제자리', [pn.indexOf('pageLock(true)') < pn.indexOf("el.id = 'pane'"), /if \(!\$\('#pane'\)\) pageLock\(false\)/.test(pn), /window\.scrollTo\(0, PL\.y\)/.test(pn), /html\.plock body\{position:fixed/.test(HTML), /header\.top, #side/.test(pn)], [true, true, true, true, true]);
  sc.eq('(56) 닫히는 중에 다시 열면 닫기 움직임을 멈추고 그 판을 다시 올림', /if \(el && el\.dataset\.closing\) \{ delete el\.dataset\.closing;/.test(pn), true);
}

// (57) 1119-W — 다가오는 한 주 (HB 11/19 시안 E): 이번 주 탭은 처음에 '오늘부터 7일', 스위치로 달력 주
{
  const W1 = A.weekWindow('up', '2026-11-19', '2026-11-15');
  sc.eq('(57) 목요일 오늘 → 11/19 ~ 11/25, 두 달력 주(11/15 · 11/22)에 걸침', J(W1), { from: '2026-11-19', to: '2026-11-25', suns: ['2026-11-15', '2026-11-22'] });
  sc.eq('(57) 주일 오늘 → 그 주 하나(주일 ~ 토)', J(A.weekWindow('up', '2026-11-22', '2026-11-15')), { from: '2026-11-22', to: '2026-11-28', suns: ['2026-11-22'] });
  sc.eq('(57) 달력 주(cal) → 고른 주의 주일 ~ 토 그대로', J(A.weekWindow('cal', '2026-11-19', '2026-11-29')), { from: '2026-11-29', to: '2026-12-05', suns: ['2026-11-29'] });
  sc.eq('(57) 해를 넘는 주(토요일 오늘)', J(A.weekWindow('up', '2026-12-26', '2026-12-20')).suns, ['2026-12-20', '2026-12-27']);
  sc.eq('(57) 알약: 오늘 · 내일 · N일 뒤(두 주 안) · 지난 날 · 먼 날은 비움', ['2026-11-19', '2026-11-20', '2026-11-22', '2026-12-02', '2026-12-03', '2026-11-18'].map(d => A.soonText('2026-11-19', d)), ['오늘', '내일', '3일 뒤', '13일 뒤', '', '']);
  const vw = HTML.slice(HTML.indexOf('function viewWeek() {'), HTML.indexOf('/* ---------- 달력표 보기 틀'));
  sc.eq('(57) 처음 값은 다가오는 한 주 · 기억하지 않음(PREF 아님) · 달력표에서 그 주로 오면 달력 주', [/wm: 'up'/.test(HTML), !/PREF\.wm/.test(HTML), /S\.sun = d\.gowk; S\.wm = 'cal';/.test(HTML)], [true, true, true]);
  sc.eq('(57) 화면: 스위치 둘 · 7일 띠(카드 보기만) · 지난 날 접힘(다가오는 한 주만) · 오늘 줄 · 다음 주로 이어서 · 알약', [/data-act="wmode" data-v="up"/.test(vw), /data-v="cal"/.test(vw), /if \(lay === 'a'\) \{\s*const days/.test(vw), /if \(up\) \{\s*if \(past\.length\)/.test(vw), /오늘 \$\{mdd\(today\)\}/.test(vw), /다음 주로 이어서/.test(vw), /class="dday/.test(vw)], [true, true, true, true, true, true, true]);
  sc.eq('(57) 지난 날 = 이번 주에서 오늘 전에 다 끝난 것만(다음 주 것은 안 접힘)', /it\.ds\.every\(x => x < today\) && it\.ds\[0\] >= thisSun/.test(vw), true);
  sc.eq('(57) 표 보기도 같은 날들(두 주의 예배를 모아 오늘부터 7일만)', /for \(const ws of W\.suns\)/.test(vw) && /rows\.filter\(r => r\.d\.slice\(0, 10\) >= W\.from && r\.d\.slice\(0, 10\) <= W\.to\)/.test(vw), true);
  sc.eq('(57) 교역자도 누를 수 있음(보기 동작)', ['wmode', 'wpast', 'wday'].every(x => new RegExp("'" + x + "'").test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('const STAFF_ACTS') + 800))), true);
}

// (58) 1119-2 자잘이 (HB 11/19 사진 A ~ J)
{
  const vw = HTML.slice(HTML.indexOf('function viewWeek() {'), HTML.indexOf('/* ---------- 달력표 보기 틀'));
  const row = HTML.slice(HTML.indexOf('function busanRow('), HTML.indexOf('// 지난 부산 일정 — 달마다 묶음'));
  sc.eq('(58) A 맨 아래 꺾쇠가 잘리지 않게 판 아래 여백', /#panel\{[^}]*padding-bottom:14px/.test(HTML), true);
  sc.eq('(58) B 챙길 것 알약 자리도 펴기 · 접기', /<button class="acb" data-act="afold"/.test(HTML), true);
  sc.eq('(58) C 안내 글은 ★ 내 일정 · 7일 띠의 내 날은 빨간 별', [/★<\/b> 내 일정/.test(vw), /x === 'me' \? '★'/.test(vw), /노란 점/.test(vw)], [true, true, false]);
  sc.eq('(58) D 이번 주 스위치 · 주 넘김은 효과 없이 바로', [/S\.wm = v; S\.sun = sunOf\(todayYmd\(\)\); return render\(\);/.test(HTML), /if \(PREF\.tab === 'week'\) \{ S\.sun = to; return render\(\); \}/.test(HTML)], [true, true]);
  sc.eq('(58) E 네 예배 같은 헌금인도도 1, 2, 3부, LL 작게', /role === 'offer' && x\.text \? ' <span class="muted tiny">1, 2, 3부, LL<\/span>'/.test(vw), true);
  sc.eq('(58) F 부산 요약 머리 첫 칸은 붙지 않음', /table\.tsheet\.bt th:first-child\{position:static\}/.test(HTML), true);
  sc.eq('(58) G · H 표 상자는 화면 폭 안(grid minmax 0) — 가로 스크롤', /\.sheets\{display:grid;gap:14px;grid-template-columns:minmax\(0,1fr\)\}/.test(HTML), true);
  sc.eq('(58) I 메일에서 숙소 예약 찾기는 메뉴 개발 탭으로(부산 탭 줄에 없음)', [/data-act="mailscan"/.test(HTML.slice(HTML.indexOf('function menuPage('), HTML.indexOf('function menuPage(') + 2500)), /data-act="mailscan"/.test(HTML.slice(HTML.indexOf('function viewBusan('), HTML.indexOf('function busanRow(')))], [true, false]);
  sc.eq('(58) J 간략히가 처음 값(PREF.bdet 가 true 일 때만 자세히) · 날짜 · 요일 · 이름 · 요일 묶음만 · 교역자도 누름', [/if \(PREF\.bdet !== true\) return `<button class="vrow brief/.test(row), /<span class="vbd">\$\{daysHtml\(sortDays/.test(row), /'bdet'/.test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('const STAFF_ACTS') + 300))], [true, true, true]);
}

// (59) 1121-G G1 — 부산 예배팀 · 예배위원 구글 시트 읽기 (HB 11/21). 이름은 모두 지어낸 것.
//      시트 모양은 실제 두 시트(11/21 열어 봄)를 본떴다: 합친 칸 · 오른쪽 옆 표(준비물 · 청소 당번 · 횟수 · 이름 줄) · 특별예배 글
{
  // 칸 주소로 지어낸 탭을 만든다 — 'B3' 처럼
  const grid = () => { const v = [], mg = [], at = a => { const m = /^([A-Z]+)(\d+)$/.exec(a); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return [+m[2] - 1, c - 1]; };
    return { v, mg, set(a, x) { const [r, c] = at(a); while (v.length <= r) v.push([]); while (v[r].length < c) v[r].push(''); v[r][c] = x; },
      merge(a, b) { const [r0, c0] = at(a), [r1, c1] = at(b); mg.push({ startRowIndex: r0, endRowIndex: r1 + 1, startColumnIndex: c0, endColumnIndex: c1 + 1 }); },
      top() { /* 합친 칸 정보 없이 왼쪽 위만 남긴 모양 = 구글 값 그대로 */ return v; } }; };
  const col = n => { let s = ''; n++; while (n) { s = String.fromCharCode(65 + (n - 1) % 26) + s; n = Math.floor((n - 1) / 26); } return s; };

  // ── 탭 이름 · 맨 뒤 판
  sc.eq('(59) 탭 이름 YY년 M월 MMDD-N · YY-MMDD-N · 판 없음 · 사본 · 13월은 안 읽음',
    ['26년 11월 1117-1', '26년 2월 26-0214-1', '26년 12월', '26년 11월 1117-1의 사본', '26년 13월 1201-1', '부산 예배팀'].map(t => { const x = A.gsTabInfo(t); return x && [x.ym, x.ver]; }),
    [['2026-11', '1117-1'], ['2026-02', '26-0214-1'], ['2026-12', ''], null, null, null]);
  sc.eq('(59) 판 순서: 1월 탭을 12월에 만든 판(1228-1 · 25-1227-1)은 1월에 만든 판보다 앞', [A.gsTabInfo('27년 1월 1228-1').rank < A.gsTabInfo('27년 1월 0103-1').rank, A.gsTabInfo('26년 1월 25-1227-1').rank < A.gsTabInfo('26년 1월 26-0102-1').rank, A.gsTabInfo('26년 11월 1117-2').rank > A.gsTabInfo('26년 11월 1117-1').rank], [true, true, true]);
  const T = ['26년 11월 1117-1', '26년 11월 1029-1', '26년 10월 1024-1', '26년 12월 1120-2', '26년 12월 1120-1', '26년 12월 1118-1', '26년 11월 1117-1의 사본'];   // 실제 시트처럼 새 탭이 앞
  sc.eq('(59) 이번 달 · 다음 달 하나씩, 같은 달이면 맨 뒤 판', J(A.gsPickTabs(T, '2026-11-21')), [{ ym: '2026-11', title: '26년 11월 1117-1', ver: '1117-1' }, { ym: '2026-12', title: '26년 12월 1120-2', ver: '1120-2' }]);
  sc.eq('(59) 다음 달 탭이 아직 없으면 빈 이름 · 해 넘김(12월 → 1월)', J(A.gsPickTabs(['26년 12월 1201-1', '25년 12월 1129-1'], '2026-12-05')), [{ ym: '2026-12', title: '26년 12월 1201-1', ver: '1201-1' }, { ym: '2027-01', title: '', ver: '' }]);
  sc.eq('(59) 판 이름이 같은 탭 둘이면 시트에서 앞(왼쪽) 것', A.gsPickTabs(['26년 11월 1117-1', '26년 11월  1117-1'], '2026-11-01')[0].title, '26년 11월 1117-1');

  // ── 날짜 · 예배 · 이름
  sc.eq('(59) 날짜: 탭의 달로 해를 정함 · 12월 탭의 1/3 = 다음 해 · 1월 탭의 12/28 = 앞 해 · 없는 날 · 시각 · 판 표시는 날짜 아님',
    [['11/1', '2026-11'], ['1/3', '2026-12'], ['12/28', '2027-01'], ['2/30', '2026-02'], ['11:30', '2026-11'], ['2026.11', '2026-11'], ['v.1117-1', '2026-11'], ['목 11:30', '2026-12'], ['2026-11-15', '2026-11'], ['11월 8일', '2026-11']].map(([t, ym]) => A.gsDate(t, ym)),
    ['2026-11-01', '2027-01-03', '2026-12-28', '', '', '', '', '', '2026-11-15', '2026-11-08']);
  sc.eq('(59) 특별예배 칸(실제 2025-12): 날짜 + 뒤 글', ['12/24(수) 8PM 워십나잇', '12/19 7:30PM\n크리스마스 콘서트\n(꿈동산 생중계)', '11/6'].map(t => J(A.gsDateRest(t, '2025-12'))),
    [{ date: '2025-12-24', rest: '8PM 워십나잇' }, { date: '2025-12-19', rest: '7:30PM 크리스마스 콘서트 (꿈동산 생중계)' }, { date: '2025-11-06', rest: '' }]);
  sc.eq('(59) 예배 칸 머리: 1부 · 2부 예배 (안내: 4층만) · 라이프라인 예배 · LL · 모르는 것', ['1부', '2부 예배\n(안내: 4층만)', '라이프라인 예배', 'LL', '3부', '어쿠스틱', '성탄 예배'].map(A.gsSvc), ['1', '2', 'LL', 'LL', '3', '', '']);
  sc.eq('(59) 이름 나누기: 쉼표 · 빈칸 · 줄바꿈 · 판교중계는 이름 아님 · A/B 표시는 그대로', [A.gsNames('하늬, 다솜'), A.gsNames('김하늬A 김하늬B'), A.gsNames('가온\n나린'), A.gsNames('판교중계'), A.gsNames('')], [['하늬', '다솜'], ['김하늬A', '김하늬B'], ['가온', '나린'], [], []]);
  sc.eq('(59) 합친 칸 펴기 — 왼쪽 위 글을 범위 전체에, 빈 줄도 만든다', J(A.gsFill([['', '가'], [], ['x']], [{ startRowIndex: 0, endRowIndex: 2, startColumnIndex: 1, endColumnIndex: 3 }])), [['', '가', '가'], ['', '가', '가'], ['x']]);

  // ── 부산 예배팀 — 실제 11월 탭과 같은 자리 · 같은 합친 칸
  const tm = (() => { const G = grid(); G.set('B1', '최종'); G.merge('B1', 'D1'); G.set('E1', '12월부터 조명 더함');
    G.set('B3', '주  일  예  배'); G.set('C3', 'v.1117-1'); G.set('D3', '미정'); G.set('B4', '2026.11'); G.merge('B4', 'B5');
    const R = ['예배 인도', '싱어1', '싱어2', '싱어3', '메인 건반', '세컨 건반', '어쿠스틱', '드럼', '베이스', '일렉', '비올라', '조명', '음향 & 중계', '자막', '봉독', '교역자', '토요모임'];
    R.forEach((x, i) => G.set('B' + (6 + i), x));
    ['11/1', '11/8', '11/15', '11/22', '11/29'].forEach((d, w) => { const c = 2 + w * 3, C = k => col(c + k);
      G.set(C(0) + '4', d); G.merge(C(0) + '4', C(2) + '4'); ['1부', '2부', '라이프라인'].forEach((x, k) => G.set(C(k) + '5', x));
      G.set(C(0) + '6', '판교중계'); G.merge(C(0) + '6', C(0) + '16');   // 1부는 늘 중계(예배 인도 ~ 비올라 합친 칸)
      if (w !== 0) { G.set(C(2) + '6', '판교중계'); G.merge(C(2) + '6', C(2) + '16'); }   // 라이프라인은 첫 주만 부산 팀
      G.set(C(1) + '6', '한바다'); G.set(C(1) + '7', '윤슬기'); G.set(C(1) + '8', '서하람'); G.set(C(1) + '10', w === 4 ? '조은솔' : '차나무'); G.set(C(1) + '13', w % 2 ? '진우람' : '문이든');
      G.set(C(0) + '17', '문이든'); G.merge(C(0) + '17', C(0) + '18'); G.set(C(1) + '17', '진우람'); G.set(C(1) + '18', '진우람');
      G.set(C(2) + '17', '조은솔, 길하랑'); G.merge(C(2) + '17', C(2) + '18');
      G.set(C(0) + '19', '정다온'); G.set(C(1) + '19', '정다온'); G.set(C(1) + '20', '고은결'); G.set(C(1) + '21', '목사' + (w + 1)); G.set(C(1) + '22', '기도회, 곡연습'); });
    G.set('C6', '판교중계'); G.set('E6', '한바다'); G.set('E7', '윤슬기'); G.set('E12', '한바다'); G.set('E13', '문이든');   // 첫 주 라이프라인은 부산 팀(어쿠스틱 겸 인도)
    G.set('AD4', '예배 인도'); G.set('AE4', '마이크'); G.set('AD5', '어쿠스틱'); G.set('AD6', '싱어1');   // 오른쪽 준비물 표 — 안 읽음
    G.set('B25', '금 요 예 배'); ['어웨이크', '리바이브드', '인카운터', '워십나잇'].forEach((x, i) => G.set(col(2 + i) + '25', x));
    ['11/6', '11/13', '11/20', '11/27'].forEach((x, i) => G.set(col(2 + i) + '26', x));
    R.slice(0, 14).forEach((x, i) => G.set('B' + (27 + i), x));
    for (const C of ['C', 'F']) { G.set(C + '27', '판교중계'); G.merge(C + '27', C + '37'); }
    G.set('D27', '목사3'); G.set('D28', '정다온'); G.set('D31', '목사3'); G.set('E27', '목사4'); G.set('E28', '정다온'); G.set('E33', '목사4'); G.set('E34', '문이든');
    G.set('C38', '문이든'); G.set('D38', '길하랑'); G.set('E38', '하나래'); G.set('F38', '조은솔');
    G.set('K25', '예배팀 청소(토요일)'); G.merge('K25', 'L25'); ['11/7', '11/14', '11/21', '11/28', '12/5'].forEach((x, i) => G.set(col(11 + i) + '26', x));   // 청소 당번 표 — 안 읽음
    G.set('K27', '강단'); G.merge('K27', 'K28'); G.set('L27', '차나무'); G.set('Y26', '9'); G.set('Z26', '윤슬기'); G.set('AA26', '싱어 2부 매주4');   // 횟수 집계 — 안 읽음
    return G; })();
  const t1 = A.gsReadTeam(tm.v, tm.mg, '2026-11');
  sc.eq('(59) 예배팀: 경고 없음 · 주일 5주 × 3 · 금요 4', [J(t1.warn), t1.sun.length, t1.fri.length, A.gsCount(t1)], [[], 15, 4, '주일 5 · 금요 4']);
  sc.eq('(59) 예배팀: 역할 줄 이름(시트 그대로) · 금요 판은 자막까지', [t1.roles.sun.map(r => r.label).join(','), t1.roles.fri.length, t1.roles.fri[13].k], ['예배 인도,싱어1,싱어2,싱어3,메인 건반,세컨 건반,어쿠스틱,드럼,베이스,일렉,비올라,조명,음향 & 중계,자막,봉독,교역자,토요모임', 14, '자막']);
  const e = (d, sv) => t1.sun.find(x => x.date === d && x.svc === sv);
  sc.eq('(59) 예배팀 11/22 2부: 칸마다 이름 · 교역자 · 토요모임', J(e('2026-11-22', '2').cells), { '예배인도': ['한바다'], '싱어1': ['윤슬기'], '싱어2': ['서하람'], '메인건반': ['차나무'], '드럼': ['진우람'], '조명': ['진우람'], '음향&중계': ['진우람'], '자막': ['정다온'], '봉독': ['고은결'], '교역자': ['목사4'], '토요모임': ['기도회', '곡연습'] });
  sc.eq('(59) 예배팀 판교중계: 1부는 중계(예배 인도 ~ 비올라는 이름 없음) · 조명 · 음향 · 자막은 부산 사람 그대로', [e('2026-11-22', '1').relay, J(e('2026-11-22', '1').cells)], [true, { '조명': ['문이든'], '음향&중계': ['문이든'], '자막': ['정다온'] }]);
  sc.eq('(59) 예배팀 라이프라인: 첫 주는 부산 팀 · 다음 주부터 중계 · 한 칸 두 분(쉼표)', [e('2026-11-01', 'LL').relay, e('2026-11-01', 'LL').cells['예배인도'], e('2026-11-08', 'LL').relay, e('2026-11-08', 'LL').cells['조명']], [false, ['한바다'], true, ['조은솔', '길하랑']]);
  sc.eq('(59) 예배팀 금요: 예배 이름 · 날짜 · 중계 · 인도', t1.fri.map(f => [f.date, f.name, f.relay, (f.cells['예배인도'] || []).join()]), [['2026-11-06', '어웨이크', true, ''], ['2026-11-13', '리바이브드', false, '목사3'], ['2026-11-20', '인카운터', false, '목사4'], ['2026-11-27', '워십나잇', true, '']]);
  sc.eq('(59) 예배팀: 오른쪽 옆 표(준비물 · 청소 당번 · 횟수)는 안 읽음 — 날짜 12/5 · 이름 차나무(청소) 가 금요에 없음', [t1.fri.some(f => f.date === '2026-12-05'), t1.sun.some(x => x.svc === '' || !x.date), JSON.stringify(t1).includes('마이크')], [false, false, false]);
  const t1b = A.gsReadTeam(tm.top(), [], '2026-11');
  sc.eq('(59) 합친 칸 정보가 없어도(왼쪽 위만) 날짜를 잇고 중계를 알아봄', [J(t1b.warn), t1b.sun.length, e('2026-11-22', '1').relay === t1b.sun.find(x => x.date === '2026-11-22' && x.svc === '1').relay, t1b.fri[0].relay], [[], 15, true, true]);

  // ── 부산 예배위원 — 실제 11월 탭과 같은 자리
  const sv = (() => { const G = grid(); G.set('B1', '최종'); G.merge('B1', 'E1'); G.set('B2', ' 2026년 11월 예배 위원_부산 캠퍼스'); G.merge('B2', 'H2'); G.set('F3', 'v. 1117-1');
    ['주일', '구분', '1부 예배', '2부 예배\n(안내: 4층만)', '라이프라인 예배'].forEach((x, k) => G.set(col(1 + k) + '4', x)); G.set('I4', '헌금 위원'); G.set('J4', '안내 위원');
    ['11/1', '11/8', '11/15', '11/22', '11/29'].forEach((d, w) => { const r = 5 + w * 4; G.set('B' + r, d); G.merge('B' + r, 'B' + (r + 3));
      ['안내위원', '헌금위원', '봉독위원', '광고위원'].forEach((x, k) => G.set('C' + (r + k), x));
      G.set('E' + r, '나은솔'); G.set('F' + r, '김하늬A'); G.set('D' + (r + 1), '임가온'); G.set('E' + (r + 1), '나은솔 김하늬B'); G.set('F' + (r + 1), '박새롬');
      G.set('E' + (r + 2), '고은결'); G.set('D' + (r + 3), '목사' + (w + 1)); G.set('E' + (r + 3), '목사' + (w + 1)); });
    G.set('H5', '금요예배'); ['11/6', '11/13', '11/20', '11/27'].forEach((d, i) => G.set('H' + (6 + i), d));
    G.set('I6', '김하늬A'); G.set('I7', '박새롬'); G.set('I9', '김하늬A, 임가온'); G.set('J8', '이나래'); G.set('J9', '이나래');
    ['한바다', '진우람', '문이든'].forEach((x, i) => G.set('L' + (5 + i), x));   // 맨 오른쪽 이름 줄 — 안 읽음
    return G; })();
  const s1 = A.gsReadServe(sv.v, sv.mg, '2026-11'), se = (d, s) => s1.sun.find(x => x.date === d && x.svc === s);
  sc.eq('(59) 예배위원: 경고 없음 · 주일 5 × 3 · 금요 4 · 역할 넷 · 금요 둘', [J(s1.warn), s1.sun.length, s1.fri.length, s1.roles.sun.map(r => r.k).join(), s1.roles.fri.map(r => r.k).join()], [[], 15, 4, '안내,헌금,봉독,광고', '헌금,안내']);
  sc.eq('(59) 예배위원 11/15 2부: 한 칸 두 분은 빈칸으로 · 광고 = 교역자', J(se('2026-11-15', '2').cells), { '안내': ['나은솔'], '헌금': ['나은솔', '김하늬B'], '봉독': ['고은결'], '광고': ['목사3'] });
  sc.eq('(59) 예배위원 1부 · 라이프라인', [J(se('2026-11-15', '1').cells), J(se('2026-11-15', 'LL').cells)], [{ '헌금': ['임가온'], '광고': ['목사3'] }, { '안내': ['김하늬A'], '헌금': ['박새롬'] }]);
  sc.eq('(59) 예배위원 금요(머리는 한 줄 위) · 쉼표 두 분 · 맨 오른쪽 이름 줄 안 읽음', [s1.fri.map(f => f.date + ':' + (f.cells['헌금'] || []).join('+') + ':' + (f.cells['안내'] || []).join('+')).join(' '), JSON.stringify(s1).includes('한바다')], ['2026-11-06:김하늬A: 2026-11-13:박새롬: 2026-11-20::이나래 2026-11-27:김하늬A+임가온:이나래', false]);
  const s1b = A.gsReadServe(sv.top(), [], '2026-11');
  sc.eq('(59) 예배위원: 합친 칸 정보 없이도 날짜를 아래로 이어 같은 답', JSON.stringify(s1b.sun), JSON.stringify(s1.sun));

  // ── 12월(특별예배) — 실제 2025-12 탭처럼: 주일 판에 성탄(목) 12/25 · 금요 판에 '12/24(수) 8PM 워십나잇'
  const dc = (() => { const G = grid(); ['주일', '구분', '1부 예배', '2부 예배', '라이프라인 예배'].forEach((x, k) => G.set(col(1 + k) + '4', x));
    [['12/21', 5], ['12/25', 9], ['1/4', 13]].forEach(([d, r]) => { G.set('B' + r, d); ['안내위원', '헌금위원', '봉독위원', '광고위원'].forEach((x, k) => G.set('C' + (r + k), x)); G.set('E' + (r + 3), '목사' + r); });
    G.set('B10', '목 11:30'); G.set('I4', '헌금 위원'); G.set('H5', '금요예배'); G.set('H6', '12/19 7:30PM\n크리스마스 콘서트'); G.set('H7', '12/24(수) 8PM 워십나잇'); G.set('I7', '김하늬A');
    G.set('H9', '12/23(화) 극동방송 홀에서 진행되는 워십나잇은'); return G; })();
  const d1 = A.gsReadServe(dc.v, dc.mg, '2025-12');
  sc.eq('(59) 12월: 성탄 12/25 도 주일 판 그대로 · 다음 달 1/4 는 다음 해 · 날짜 아래 시각 줄은 무시', [[...new Set(d1.sun.map(x => x.date))], d1.sun.find(x => x.date === '2025-12-25' && x.svc === '2').cells['광고'], J(d1.warn)], [['2025-12-21', '2025-12-25', '2026-01-04'], ['목사9'], []]);
  sc.eq('(59) 12월 금요: 날짜 + 특별예배 이름 · 빈 줄 아래 안내 글은 안 읽음', d1.fri.map(f => [f.date, f.name]), [['2025-12-19', '7:30PM 크리스마스 콘서트'], ['2025-12-24', '8PM 워십나잇']]);

  // ── 못 찾으면 짐작하지 않고 알림
  sc.eq('(59) 엉뚱한 시트: 예배팀 · 예배위원 모두 경고(멈추지 않음) · 읽은 것 없음', [A.gsReadTeam([['아무', '표']], [], '2026-11').warn.length, A.gsReadServe([['아무', '표']], [], '2026-11').warn.length, A.gsReadTeam(null, null, '2026-11').sun.length], [2, 2, 0]);
  const odd = grid(); odd.set('B3', '주일예배'); odd.set('C4', '11/1'); odd.set('D4', '11/1'); odd.set('E4', '11/1'); odd.set('C5', '2부'); odd.set('D5', '성탄 예배'); odd.set('E5', '라이프라인'); odd.set('B6', '예배 인도'); odd.set('C6', '한바다'); odd.set('D6', '윤슬기');
  const o1 = A.gsReadTeam(odd.v, [], '2026-11');
  sc.eq("(59) 모르는 예배 칸('성탄 예배')은 짐작해 넣지 않고 알림 · 그 너머 칸은 그대로 읽음", [o1.sun.map(x => x.svc).join(), o1.warn.some(w => /성탄 예배' 칸은 읽지 않았습니다/.test(w))], ['2,LL', true]);

  // ── 두 달 합치기 · 한 줄 글
  const j = A.gsJoin([{ ym: '2026-11', sun: [{ date: '2026-11-29', svc: '2', cells: { a: ['가'] } }, { date: '2026-12-06', svc: '2', cells: { a: ['11월 탭'] } }], fri: [], roles: { sun: [{ k: 'a', label: '인도' }], fri: [] } },
    { ym: '2026-12', sun: [{ date: '2026-12-06', svc: '2', cells: { a: ['12월 탭'] } }, { date: '2026-12-06', svc: '1', relay: true, cells: {} }], fri: [{ date: '2026-12-04', name: '어웨이크', cells: {} }], roles: { sun: [{ k: 'a', label: '인도' }, { k: 'b', label: '싱어' }], fri: [] } }]);
  sc.eq('(59) 두 달 합치기: 같은 날은 그 날의 달 탭이 이김 · 날짜순 · 같은 날 1부 → 2부 · 역할 합침', [j.sun.map(x => x.date + x.svc + ':' + ((x.cells.a || [])[0] || '')).join(' '), j.fri.length, j.roles.sun.map(r => r.k).join()], ['2026-11-292:가 2026-12-061: 2026-12-062:12월 탭', 1, 'a,b']);
  sc.eq('(59) 한 줄 글: 역할 차례대로 · 중계면 앞에', [A.gsLine({ cells: { a: ['가', '나'] } }, [{ k: 'b', label: '싱어' }, { k: 'a', label: '인도' }]), A.gsLine({ relay: true, cells: { b: ['다'] } }, [{ k: 'b', label: '조명' }])], ['인도 가 나', '분당 중계 · 조명 다']);

  // ── 미리보기 탭(지어낸 이름)도 같은 규칙으로 읽힘
  const dm = ['bteam', 'bserve'].map(k => { const x = A.gsDemo(k, '2026-12'); return [A.gsTabInfo(x.title).ym, J(A.gsRead(k, x.values, x.merges, '2026-12').warn), A.gsCount(A.gsRead(k, x.values, x.merges, '2026-12'))]; });
  sc.eq('(59) 미리보기 탭 두 시트: 그 달 탭 이름 · 경고 없음 · 주일 · 금요 수', dm, [['2026-12', [], '주일 4 · 금요 4'], ['2026-12', [], '주일 4 · 금요 4']]);

  // ── (60) 계정에 두기 (G2) — 지어낸 이름
  const RES = (sun, fri, tabs) => ({ tabs: tabs || [{ ym: '2026-11', title: '26년 11월 1117-1', ver: '1117-1' }, { ym: '2026-12', title: '', ver: '' }],
    parts: [{ tab: '26년 11월 1117-1', warn: ['가 줄을 못 찾았습니다'] }], joined: { sun, fri: fri || [], roles: { sun: [{ k: '예배인도', label: '예배 인도' }], fri: [] } } });
  const sunN = (n, ym) => Array.from({ length: n }, (_, i) => ({ date: (ym || '2026-11') + '-' + String(i + 1).padStart(2, '0'), svc: '2', relay: false, cells: { 예배인도: ['김가람'] } }));
  const p1 = A.gsPack(RES(sunN(4)), 1000);
  sc.eq('(60) 문서 모양: 판 · 읽은 때 · 칸 수 · 지문 · 탭 · 경고(탭 이름 붙임)', [p1.v, p1.at, p1.n, typeof p1.h, p1.tabs.length, p1.warn], [1, 1000, 4, 'string', 2, ['26년 11월 1117-1 — 가 줄을 못 찾았습니다']]);
  sc.eq('(60) 지문은 읽은 때와 상관없음 · 칸 이름 차례와도 상관없음(파이어베이스가 이름순으로 돌려줘도 같음)', [A.gsPack(RES(sunN(4)), 9999).h === p1.h, A.gsCanon({ b: 1, a: [{ y: 2, x: 1 }] }) === A.gsCanon({ a: [{ x: 1, y: 2 }], b: 1 })], [true, true]);
  sc.eq('(60) 이름이 하나라도 바뀌면 지문이 바뀜', A.gsPack(RES(sunN(4).map((e, i) => i === 2 ? Object.assign({}, e, { cells: { 예배인도: ['이나래'] } }) : e)), 1000).h === p1.h, false);
  const up = A.gsUnpack(J(p1));
  sc.eq('(60) 계정 → 화면: 그대로 돌아옴(joined · 탭 · 경고 · 지문)', [up.joined.sun.length, up.joined.sun[0].cells['예배인도'], up.tabs[0].ver, up.warn.length, up.h === p1.h, up.n], [4, ['김가람'], '1117-1', 1, true, 4]);
  sc.eq('(60) 모양이 틀린 문서는 버림(판 다름 · 지문 없음 · 빈 것)', [A.gsUnpack({ v: 2, h: 'x' }), A.gsUnpack({ v: 1 }), A.gsUnpack(null), A.gsUnpack('x')], [null, null, null, null]);
  const dirty = A.gsUnpack({ v: 1, h: 'x', at: 5, sun: [{ date: '2026-11-01', svc: '2', cells: { a: ['가'.repeat(50), 3, '', '나'], b: 'x', ['c'.repeat(60)]: ['다'] } }, { date: '11/8', svc: '2', cells: {} }, { date: '2026-11-08', svc: '9', cells: {} }, null],
    fri: [{ date: '2026-11-06', name: '이'.repeat(80), relay: 'yes', cells: {} }], roles: { sun: [{ k: 'a' }, { label: 'k없음' }], fri: 'x' }, warn: ['w', 3] });
  sc.eq('(60) 계정에서 온 것 다듬기: 긴 이름 자름 · 글 아닌 이름 · 틀린 날짜 · 모르는 예배 · 긴 칸 이름 · 줄 relay 는 참 거짓만', [dirty.joined.sun.length, dirty.joined.sun[0].cells.a.map(x => x.length), Object.keys(dirty.joined.sun[0].cells).map(k => k.length), dirty.joined.fri[0].name.length, dirty.joined.fri[0].relay, dirty.joined.roles.sun.map(r => r.label), dirty.joined.roles.fri, dirty.warn],
    [1, [20, 1], [1, 40], 40, false, ['a'], [], ['w']]);
  sc.eq('(60) 칸 수 상한(400) — 이상한 시트가 와도', A.gsPack(RES(Array.from({ length: 900 }, (_, i) => ({ date: '2026-11-01', svc: '2', cells: { a: ['가' + i] } }))), 1).sun.length, 400);
  // 올릴까
  const prev = A.gsUnpack(J(p1));
  sc.eq('(60) 처음(계정에 없음) → 올림 · 같으면 안 올림(same)', [A.gsSaveCheck(null, p1).ok, A.gsSaveCheck(prev, A.gsPack(RES(sunN(4)), 5000))], [true, { ok: false, same: true, why: '' }]);
  sc.eq('(60) 이번에 읽은 날이 하나도 없으면 계정 표를 그대로 둠 (빈 시트 · 탭 이름 바뀜)', [A.gsSaveCheck(prev, A.gsPack(RES([]), 1)).ok, /하나도 없어/.test(A.gsSaveCheck(prev, A.gsPack(RES([]), 1)).why)], [false, true]);
  sc.eq('(60) 같은 달 칸이 절반 넘게 줄면 멈춤(잘못 읽은 한 번이 교역자 화면을 비우지 않게) · 절반까지는 올림', [A.gsSaveCheck(prev, A.gsPack(RES(sunN(1)), 1)).ok, /11월 칸이 4 → 1/.test(A.gsSaveCheck(prev, A.gsPack(RES(sunN(1)), 1)).why), A.gsSaveCheck(prev, A.gsPack(RES(sunN(2)), 1)).ok], [false, true, true]);
  sc.eq('(60) 달이 넘어가 지난 달이 빠지는 것은 줄어듦이 아님(그 달을 이번에 안 읽었으므로)', A.gsSaveCheck(prev, A.gsPack(RES(sunN(1, '2026-12')), 1)).ok, true);
  sc.eq('(60) HB 가 그래도 올리기 → 올림 (같으면 그래도 안 씀)', [A.gsSaveCheck(prev, A.gsPack(RES([]), 1), true).ok, A.gsSaveCheck(prev, A.gsPack(RES(sunN(4)), 1), true).same], [true, true]);
  // 고른 파일 · 한 시간
  sc.eq('(60) 고른 파일: 구글 파일 id 꼴만 · 이름 자름 · 모르는 칸 버림', A.gsSrcNorm({ at: 3, bteam: { id: '1NvZ-abc_9', name: '가'.repeat(100) }, bserve: { id: 'a b/../x' }, zz: { id: 'q' } }), { at: 3, bteam: { id: '1NvZ-abc_9', name: '가'.repeat(80) } });
  sc.eq('(60) 이 기기 · 계정 중 나중에 고른 쪽 (같으면 이 기기 · 계정이 없어도)', [A.gsSrcPick({ at: 5, bteam: { id: 'L' } }, { at: 9, bteam: { id: 'C' } }).bteam.id, A.gsSrcPick({ at: 9, bteam: { id: 'L' } }, { at: 5, bteam: { id: 'C' } }).bteam.id, A.gsSrcPick({ bteam: { id: 'L' } }, null).bteam.id, A.gsSrcPick({}, { at: 1, bserve: { id: 'C' } }).bserve.id], ['C', 'L', 'L', 'C']);
  sc.eq('(60) 다시 읽을 때: 계정 표가 없거나 한 시간 넘음', [A.gsStale(null, 1e9), A.gsStale({ at: 1e9 - A.GS_STALE_MS + 1 }, 1e9), A.gsStale({ at: 1e9 - A.GS_STALE_MS - 1 }, 1e9), A.gsStale({ at: 0 }, 1e9)], [true, false, true, true]);

  // ── 화면 · 지킬 것 (코드에서)
  const gs = HTML.slice(HTML.indexOf("/* ---------- 구글 자료 (1121-G G1"), HTML.indexOf('/* ---------- 부산 주일 광고 (R12 C)'));
  sc.eq('(59) 읽기만: 구글에 쓰는 요청이 없음(method · update · append · batchUpdate · clear) · /off 안 부름', [/method\s*:/.test(gs), /values:(update|append|batchUpdate|clear)|:batchUpdate|\/values\/[^'"]*\?[^'"]*valueInputOption/.test(gs), /'\/off'/.test(gs)], [false, false, false]);
  // (60) G2: 계정에 쓰는 곳은 gs 칸 둘(고른 파일 · 읽은 표)뿐 — 책 · 교역자 칸 · update 없음
  const sets = gs.match(/\.(set|update|delete)\(/g) || [];
  sc.eq('(60) 계정에 쓰는 곳: gsRef(…).set 셋(src · 표 · 읽은 때)뿐 · collection(\'gs\') 밖으로 안 씀 · update/delete 없음', [sets.length, (gs.match(/gsRef\([^)]*\)\.set\(/g) || []).length, /\.update\(|\.delete\(/.test(gs.replace(/delete GS\.res\[[^\]]+\]/g, '')), /collection\('(staff|img|ext)'\)/.test(gs), /FB\.db\.collection\('rota'\)\.doc\([^)]*\)\.set\(/.test(gs)], [3, 3, false, false, false]);
  sc.eq('(60) HB 만 계정에 씀(owner) · 교역자는 표 둘만 듣고 src 는 안 들음', [/function gsCloudSrc\(o\) \{ if \(DEMO \|\| !FB\.user \|\| FB\.role !== 'owner'\) return;/.test(gs), /if \(!FB\.user \|\| FB\.role !== 'owner'\) \{ r\.saved = \{ state: 'off' \}; return; \}/.test(gs), /GS_SRC\.map\(x => x\.k\)\.concat\(own \? \['src'\] : \[\]\)/.test(gs), /listenGs\(u\.uid, true\)/.test(HTML), /listenGs\(team, false\)/.test(HTML)], [true, true, true, true, true]);
  sc.eq('(60) 미리보기 시트 채우기는 시트 칸(bteam · bserve)으로 판단 — 고른 파일에 at 칸이 생겨도', /if \(DEMO && !GS_SRC\.some\(x => gsFiles\(\)\[x\.k\]\)\) lsSet\(GS_KEY/.test(gs) && !/Object\.keys\(gsFiles\(\)\)/.test(gs), true);
  sc.eq('(60) 견주기는 지문(h)끼리 — 계정 문서를 JSON.stringify 로 견주지 않음(1117-F)', /JSON\.stringify\(S\.gs|JSON\.stringify\(d\.data\(\)/.test(gs), false);
  sc.eq('(60) 로그아웃 · 계정 바뀜이면 표 · 읽은 것 · 자동 시각을 비움(남의 표를 들고 있지 않게)', /function stopListen\(\) \{[^\n]*'unsubG'[^\n]*S\.gs = \{\}; GS\.res = \{\}; GS\.autoAt = 0; \}/.test(HTML), true);
  sc.eq('(59) 열쇠: 캘린더 · 심방 노트와 한 벌(/token 메일 아님) · 연결은 care:true(고른 파일만) · 돌아올 자리 ?g=src · 드라이브 전체 권한 없음', [/gfn\('\/token'\)/.test(gs), /gfn\('\/start', \{ ret: GS_RET, care: true \}\)/.test(gs), /GS_RET = 'https:\/\/sweeter\.my\/rotation\/\?g=src'/.test(gs), /auth\/drive['"\s]|drive\.readonly|spreadsheets['"]\s*\]/.test(HTML)], [true, true, true, false]);
  sc.eq('(59) 고르기 창: 심방 노트와 같은 공개 키 · 프로젝트 번호 · 시트만', [/GS_PICKER_KEY = 'AIzaSyAOLbBCajy6vF33xN1PQWk1qnU7VoynuC8'/.test(gs), /GS_PICKER_APP = '517626689480'/.test(gs), /ViewId\.SPREADSHEETS/.test(gs)], [true, true, true]);
  sc.eq('(59) HB 만: gsCan = 주인(owner) · 메뉴 개발 탭 단추 · 교역자 누름 목록에 없음', [/function gsCan\(\) \{ return DEMO \|\| \(!!FB\.user && FB\.role === 'owner'\); \}/.test(gs), /gsCan\(\) \? '<button class="btn ghost" data-act="gsopen">구글 자료/.test(HTML.slice(HTML.indexOf('function menuPage('), HTML.indexOf('function menuHead('))), /'gsopen'|'gsread'|'gsconnect'/.test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('const STAFF_ACTS') + 800))], [true, true, false]);
  sc.eq('(59) 고른 파일은 이 기기(미리보기는 다른 칸) + 계정 src · 읽은 표는 이 기기에 안 둠(GS.res)', [/GS_KEY = DEMO \? 'rota_demo_gsrc_v1' : 'rota_gsrc_v1'/.test(gs), /lsSet\(GS_KEY/.test(gs), !/lsSet\([^)]*GS\.res/.test(gs), /gsCloudSrc\(o\)/.test(gs)], [true, true, true, true]);
  sc.eq('(59) 판: 판 목록에 gsrc · 돌아오면(?g=src) 구글 자료 판을 다시 엶 · 읽은 것 보기', [/gsrc: paneGsrc/.test(HTML), /const src = q\.get\('g'\) === 'src'/.test(HTML) && /gsOpen\(\); \} \}, 500\); return; \}/.test(HTML), /읽은 것 보기/.test(gs)], [true, true, true]);
}

// (61) 1121-G G3 · G3b — 계정 표를 화면에 (HB 11/21). 이름은 모두 지어낸 것.
{
  const R = (k, label) => ({ k, label });
  const team = { sun: [
      { date: '2026-11-15', svc: '1', relay: false, cells: { 예배인도: ['김가람'] } },
      { date: '2026-11-22', svc: '2', relay: false, cells: { 예배인도: ['김가람'], 싱어1: ['이나래'], 봉독: ['박다온'], 교역자: ['최목사'], 토요모임: ['기도회', '곡연습'] } },
      { date: '2026-11-22', svc: '1', relay: true, cells: { 조명: ['정마루'] } },
      { date: '2026-11-29', svc: '2', relay: false, cells: { 예배인도: ['김가람'], 드럼: ['정마루'] } }],
    fri: [{ date: '2026-11-20', name: '인카운터', relay: false, cells: { 예배인도: ['최목사'], 어쿠스틱: ['최목사'] } }],
    roles: { sun: [R('예배인도', '예배 인도'), R('싱어1', '싱어1'), R('메인건반', '메인 건반'), R('조명', '조명'), R('드럼', '드럼'), R('봉독', '봉독'), R('교역자', '교역자'), R('토요모임', '토요모임')], fri: [R('예배인도', '예배 인도'), R('어쿠스틱', '어쿠스틱')] } };
  const serve = { sun: [
      { date: '2026-11-22', svc: '2', relay: false, cells: { 안내: ['한별'], 헌금: ['오아라', '윤자람'], 봉독: ['박다온'], 광고: ['최목사'] } },
      { date: '2026-11-22', svc: '1', relay: false, cells: { 광고: ['최목사'] } }],
    fri: [{ date: '2026-11-20', name: '', relay: false, cells: { 헌금: ['오아라'] } }],
    roles: { sun: [R('안내', '안내'), R('헌금', '헌금'), R('봉독', '봉독'), R('광고', '광고')], fri: [R('헌금', '헌금'), R('안내', '안내')] } };
  const before = JSON.stringify([team, serve]);

  // ── G3 한 부산 주
  const wk = A.gsWeek(team, serve, '2026-11-22');
  sc.eq('(61) 한 부산 주 = 월 ~ 주일: 금요(인카운터) · 2부 · 1부 차례 · 두 시트가 예배마다 나란히 · 중계 표시',
    J(wk.map(x => [x.id, x.label, x.relay, !!x.team, !!x.serve])),
    [['fri|2026-11-20|', '인카운터', false, true, true], ['sun|2026-11-22|2', '2부', false, true, true], ['sun|2026-11-22|1', '1부', true, true, true]]);
  sc.eq('(61) 다른 주는 안 섞임 · 금요 이름이 없으면 예배팀 이름을 씀(예배위원은 비어 옴)', [A.gsWeek(team, serve, '2026-11-15').map(x => x.id), wk[0].name], [['sun|2026-11-15|1'], '인카운터']);
  const xmas = A.gsWeek({ sun: [], fri: [{ date: '2026-12-24', name: '8PM 워십나잇', cells: {} }], roles: {} }, { sun: [{ date: '2026-12-25', svc: '2', cells: { 안내: ['한별'] } }, { date: '2026-12-27', svc: '2', cells: {} }], fri: [], roles: {} }, '2026-12-27');
  sc.eq('(61) 특별예배: 성탄 전야(목) · 성탄(금) 2부가 그 주일(12/27) 부산 주에 날짜를 달고 붙음', J(xmas.map(x => x.label)), ['8PM 워십나잇', '12/25 2부', '2부']);
  sc.eq('(61) 처음 고를 예배 = 그 주일 2부 (중계면 건너뜀) · 없으면 맨 앞', [A.gsMain(wk, '2026-11-22').id, A.gsMain(A.gsWeek(team, null, '2026-11-15'), '2026-11-15').id, A.gsMain([], 'x')], ['sun|2026-11-22|2', 'sun|2026-11-15|1', null]);
  sc.eq('(61) 카드 한 줄: 예배 인도 · 봉독(예배위원 먼저) · 읽은 게 없으면 빈 글', [A.gsSum(team, serve, '2026-11-22'), A.gsSum(team, null, '2026-11-29'), A.gsSum(null, null, '2026-11-22'), A.gsSum(team, serve, '2026-12-06')], ['예배 인도 김가람 · 봉독 박다온', '예배 인도 김가람', '', '']);
  sc.eq('(61) 계정 문서 꼴(gsUnpack — joined 안)도 그대로 읽힘', A.gsSum(A.gsUnpack(A.gsPack({ joined: team }, 1)), A.gsUnpack(A.gsPack({ joined: serve }, 1)), '2026-11-22'), '예배 인도 김가람 · 봉독 박다온');

  // ── 내 일정: 이름 열쇠 · 맡은 역할
  const book = { people: [{ id: 'p1', name: '최목사', alias: ['최 목사'] }, { id: 'p2', name: '김가람' }, { id: 'p3', name: '김 가람' }, { id: 'p4', name: '정마루', del: true }, { id: 'p5', name: '정마루' }] };
  sc.eq('(61) 이름 열쇠: 이름 + 다른 이름(띄어쓰기 없이) · 같은 이름이 둘이면 잇지 않음 · 지운 사람은 안 셈', [A.gsKeys(book, 'p1'), A.gsKeys(book, 'p2'), A.gsKeys(book, 'p5'), A.gsKeys(book, 'zz')], [['최목사'], [], ['정마루'], []]);
  sc.eq('(61) 내 일정: 날마다 한 줄 · 같은 역할 예배는 모음(2부 · 1부 광고) · 교역자 줄 · 토요모임은 뺌 · 기간 밖 안 넣음',
    J(A.gsMine(team, serve, ['최 목사'], '2026-11-16', '2026-11-30')),
    [{ date: '2026-11-20', sun: '2026-11-22', items: [{ whats: ['인카운터'], roles: ['예배 인도', '어쿠스틱'] }] }, { date: '2026-11-22', sun: '2026-11-22', items: [{ whats: ['2부', '1부'], roles: ['광고'] }] }]);
  sc.eq('(61) 내 일정: 표시가 붙은 이름(김가람A)은 안 이음 · 열쇠가 없으면 빈 목록', [A.gsMine({ sun: [{ date: '2026-11-22', svc: '2', cells: { 싱어1: ['김가람A'] } }], fri: [], roles: {} }, null, ['김가람'], '2026-11-01', '2026-11-30').length, A.gsMine(team, serve, [], '2026-11-01', '2026-11-30').length], [0, 0]);

  // ── G3b 월간
  sc.eq('(61) 그 달 알약: 2부 · 1부 · 금요(있는 것만, 2부가 먼저) · 읽은 게 없는 달은 없음', [A.gsModes(team, '2026-11'), A.gsModes(serve, '2026-11'), A.gsModes(team, '2026-12'), A.gsModes(null, '2026-11')], [['2', '1', 'fri'], ['2', '1', 'fri'], [], []]);
  const t2 = A.gsMonthTeam(team, '2026-11', '2');
  sc.eq('(61) 예배팀 2부: 열 = 주 · 그 달 내내 빈 역할 숨김(메인 건반 · 조명)', [t2.cols.map(c => c.label), t2.rows.map(r => r.label), J(t2.rows[0].cells)], [['11/22', '11/29'], ['예배 인도', '싱어1', '드럼', '봉독', '교역자', '토요모임'], [['김가람'], ['김가람']]]);
  const t1 = A.gsMonthTeam(team, '2026-11', '1');
  sc.eq('(61) 예배팀 1부: 중계 주는 맨 위 빈 줄을 접음(fold) · 아닌 주는 0', J(t1.cols.map(c => [c.label, c.relay, c.fold, c.sun])), [['11/15', false, 0, '2026-11-15'], ['11/22', true, 1, '2026-11-22']]);
  const allRelay = A.gsMonthTeam({ sun: [{ date: '2026-11-22', svc: 'LL', relay: true, cells: {} }, { date: '2026-11-29', svc: 'LL', relay: false, cells: { 자막: ['한별'] } }], fri: [], roles: { sun: [R('예배인도', '예배 인도'), R('자막', '자막')] } }, '2026-11', 'LL');
  sc.eq('(61) 온통 빈 중계 주는 보이는 줄 전부를 한 칸으로', J(allRelay.cols.map(c => c.fold)), [1, 0]);
  const tf = A.gsMonthTeam(team, '2026-11', 'fri');
  sc.eq('(61) 예배팀 금요: 열 = 금요예배(이름) · 금요 역할 줄 · 그 금요일이 붙는 주일', [J(tf.cols.map(c => [c.label, c.name, c.sun])), tf.rows.map(r => r.label)], [[['11/20', '인카운터', '2026-11-22']], ['예배 인도', '어쿠스틱']]);
  const s2 = A.gsMonthServe(serve, '2026-11', '2'), s1 = A.gsMonthServe(serve, '2026-11', '1');
  sc.eq('(61) 예배위원: 줄 = 주일 · 열 = 안내 · 헌금 · 봉독 · 광고(그 달 빈 열은 숨김)', [s2.cols.map(c => c.label), J(s2.rows.map(r => [r.label, r.cells])), s1.cols.map(c => c.label)],
    [['안내', '헌금', '봉독', '광고'], [['11/22', [['한별'], ['오아라', '윤자람'], ['박다온'], ['최목사']]]], ['광고']]);
  sc.eq('(61) 예배위원 금요: 열 = 헌금(빈 안내 열은 숨김)', J(A.gsMonthServe(serve, '2026-11', 'fri')), { cols: [{ k: '헌금', label: '헌금' }], rows: [{ date: '2026-11-20', sun: '2026-11-22', label: '11/20', name: '', relay: false, cells: [['오아라']] }] });
  const pp = A.gsPeople(team, serve, '2026-11');
  sc.eq('(61) 사람별 횟수: 역할마다 합침 · 두 시트 함께 · 같은 날 같은 예배 같은 역할은 한 번(봉독 박다온) · 토요모임 안 셈 · 많은 순',
    [J(pp[0]), J(pp.find(p => p.name === '김가람')), pp.find(p => p.name === '박다온').n, pp.some(p => p.name === '기도회')],
    [{ name: '최목사', n: 5, parts: [{ t: '광고', n: 2 }, { t: '교역자', n: 1 }, { t: '어쿠스틱', n: 1 }, { t: '예배 인도', n: 1 }] },
     { name: '김가람', n: 3, parts: [{ t: '예배 인도', n: 3 }] }, 1, false]);
  sc.eq('(61) 다른 달은 안 셈', A.gsPeople(team, serve, '2026-12').length, 0);
  sc.eq('(61) 읽기만: 넣은 표를 고치지 않음', JSON.stringify([team, serve]), before);
  // 미리보기 표(gsDemo)로도 한 바퀴 — 시트 읽기 → 계정 꼴 → 화면 모양
  { const ym = '2026-11', T = A.gsUnpack(A.gsPack({ joined: A.gsJoin([Object.assign(A.gsRead('bteam', A.gsDemo('bteam', ym).values, A.gsDemo('bteam', ym).merges, ym), {})]) }, 1)),
      V = A.gsUnpack(A.gsPack({ joined: A.gsJoin([A.gsRead('bserve', A.gsDemo('bserve', ym).values, A.gsDemo('bserve', ym).merges, ym)]) }, 1));
    sc.eq('(61) 미리보기 표: 첫 주일 요약 · 월간 예배팀 2부 열 수 = 주일 수 · 1부가 온통 중계면 빈 줄(인도 · 싱어)은 숨고 머리에 중계 · 예배위원 광고 열',
      [/^예배 인도 김\S+ · 봉독 김\S+$/.test(A.gsSum(T, V, '2026-11-01')), A.gsMonthTeam(T, ym, '2').cols.length, A.gsMonthTeam(T, ym, '1').cols.every(c => c.relay) && A.gsMonthTeam(T, ym, '1').rows.every(r => !/예배 인도|싱어/.test(r.label)), A.gsMonthServe(V, ym, '2').cols.map(c => c.label).includes('광고')],
      [true, 5, true, true]); }

  // ── 화면 · 지킬 것 (코드에서)
  const ui = HTML.slice(HTML.indexOf('/* ---------- 구글 자료 보이기 (1121-G G3'), HTML.indexOf('/* ---------- 부산 주일 광고 (R12 C)'));
  sc.eq('(61) 화면 구역이 있음 · 계정 · 시트 · 책에 안 씀(set · update · delete · fetch · saveBook 없음)', [ui.length > 1000, /\.(set|update|delete)\(|fetch\(|saveBook|cloudSave|gsStore|gsApi/.test(ui)], [true, false]);
  sc.eq('(61) 월간 보기 둘을 VIEWS 에 · 첫 화면에도 · 내보내기에는 없음', [/bteam: \{ name: '부산 예배팀'/.test(HTML), /bserve: \{ name: '부산 예배위원'/.test(HTML), A.HOMES.includes('month:bteam') && A.HOMES.includes('month:bserve'), /viewKeys\(\)\.filter\(k => !GS_VIEWS\.includes\(k\)\)/.test(HTML), /GS_VIEWS\.includes\(mview\) \? '' : '<button class="txtbtn" data-act="export">/.test(HTML)], [true, true, true, true, true]);
  sc.eq('(61) 사람별은 HB 만(교역자에게 알약이 없음) · 교역자도 예배 순서 · 알약은 누름', [/const gsCntOk = \(\) => !isStaff\(\);/.test(ui), /ms\.length && gsCntOk\(\) \? \['cnt'\]/.test(ui), /'gsweek', 'gsback'\]\);/.test(HTML), /d\.gsv \|\| d\.gsm/.test(HTML), /\(d\.act === 'ads' \|\| d\.act === 'gsweek'\) && !S\.pane\.edit/.test(HTML)], [true, true, true, true, true]);
  sc.eq('(61) 카드 · 부산 일정 판 · 내 일정 · 주 머리에서 예배 순서 판으로', [/row\('예배 순서', gsSumSpan\(v\), true\)/.test(HTML), /\$\{gsSumLine\(v\)\}/.test(HTML), /\$\{gsVisitSec\(v\)\}/.test(HTML), /gsMine\(gsData\('bteam'\), gsData\('bserve'\), gsKeys\(S\.book, me\.id\), from, to\)/.test(HTML), /data-act="gsweek" data-sun="\$\{sun\}"><b>\$\{label\}/.test(ui), /gsweek: paneGsWeek/.test(HTML)], [true, true, true, true, true, true]);
  sc.eq('(61) 미리보기는 gsDemo 표 · 실제는 계정 표(S.gs)만', [/if \(!DEMO\) return \(S\.gs && S\.gs\[k\]\) \|\| null;/.test(ui), /gsDemo\(x\.k, m\)/.test(ui)], [true, true]);
}


// (62) 1121-G G4 — 시트와 맞춰 보기 (HB 결정 ③ 가). 이름은 모두 지어낸 것. 오늘 = 2026-11-16(월)
{
  const TD = '2026-11-16', R = (k, label) => ({ k, label });
  const mkb = () => A.normBook({ people: [
      { id: 'pA', name: '나가람', roles: ['busan'] }, { id: 'pB', name: '오다온', alias: ['오목사'], roles: ['busan'] }, { id: 'pC', name: '한별', kind: 'lay', roles: ['lead'] },
      { id: 'pD', name: '정마루' }, { id: 'pE', name: '정 마루' }, { id: 'pF', name: '서하늘', roles: ['busan'] }],
    visits: [
      { id: 'v|2026-11-15', who: ['pA'], days: '토일', at: 1 },
      { id: 'v|2026-11-22', who: ['pA'], days: '금토일', lead: { fri: { m: 'staff' }, sun: { m: 'staff' }, ll: { m: 'relay' } }, at: 1 },
      { id: 'v|2026-11-29', who: ['pA'], days: '토일', lead: { sun: { m: 'staff' } }, at: 1 }] });
  const team = { sun: [
      { date: '2026-11-15', svc: '2', relay: false, cells: { 교역자: ['서하늘'] } },   // 지난 주 — 견주지 않음
      { date: '2026-11-22', svc: '2', relay: false, cells: { 예배인도: ['한별'], 교역자: ['나가람'] } },
      { date: '2026-11-22', svc: '1', relay: true, cells: {} },
      { date: '2026-11-22', svc: 'LL', relay: false, cells: { 싱어1: ['이나래'] } },
      { date: '2026-11-29', svc: '2', relay: true, cells: { 교역자: ['오목사'] } },
      { date: '2026-12-06', svc: '2', relay: false, cells: { 교역자: ['서하늘', '목사'] } },
      { date: '2026-12-13', svc: '2', relay: false, cells: { 교역자: ['정마루'] } },
      { date: '2026-12-20', svc: '2', relay: false, cells: { 교역자: ['서하늘'] } }],
    fri: [
      { date: '2026-11-20', name: '인카운터', relay: false, cells: { 예배인도: ['나가람'] } },
      { date: '2026-11-27', name: '워십나잇', relay: true, cells: {} },   // 넷째 금요일 — 앱에 금요 인도 칸이 없음
      { date: '2026-12-04', name: '어웨이크', relay: true, cells: {} }],
    roles: { sun: [R('예배인도', '예배 인도'), R('싱어1', '싱어1'), R('교역자', '교역자')], fri: [R('예배인도', '예배 인도')] } };
  const serve = { sun: [
      { date: '2026-11-22', svc: '2', relay: false, cells: { 광고: ['나가람'] } },
      { date: '2026-11-29', svc: '2', relay: false, cells: { 광고: ['오다온'] } },
      { date: '2026-11-29', svc: '1', relay: false, cells: { 광고: ['오다온'] } },
      { date: '2026-12-06', svc: '2', relay: false, cells: { 광고: ['서하늘'] } },
      { date: '2026-12-20', svc: '2', relay: false, cells: { 광고: ['나가람'] } }], fri: [], roles: { sun: [R('광고', '광고')], fri: [] } };

  // ── 이름 맞추기 (gsKeys 와 같은 규칙)
  const b0 = mkb(), map = A.gsWhoMap(b0);
  sc.eq('(62) 이름 맞추기: 이름 · 다른 이름(띄어쓰기 없이) · 같은 이름 둘(정마루)은 안 이음 · 호칭이 붙어도(나가람목사) · 짧은 것(박목사)은 못 찾음',
    [A.gsPid(map, '나 가람'), A.gsPid(map, '오목사'), A.gsPid(map, '정마루'), A.gsPid(map, '나가람목사'), A.gsPid(map, '박목사'), A.gsPid(map, '')], ['pA', 'pB', '', 'pA', '', '']);

  // ── 어긋난 곳
  const before = JSON.stringify(b0), D = A.gsDiff(b0, team, serve, TD, '2026-12-31');
  sc.eq('(62) 어긋난 곳: 날짜순 · 지난 주 · 같은 곳 · 넷째 금요일 · 부산 일정 없는 금요일은 없음',
    D.map(x => x.id), ['lead|ll|2026-11-22', 'lead|sun|2026-11-29', 'who|2026-11-29', 'who|2026-12-06', 'who|2026-12-13', 'who|2026-12-20']);
  const by = id => D.find(x => x.id === id);
  sc.eq('(62) 교역자: 두 시트(오목사 = 오다온의 다른 이름)가 같고 앱과 다름 → 반영 = 그 부산 일정의 교역자를 바꿈',
    J([by('who|2026-11-29').app, by('who|2026-11-29').sheet, by('who|2026-11-29').want, by('who|2026-11-29').fix, by('who|2026-11-29').label]),
    ['나가람', [{ label: '예배팀 교역자', text: '오목사' }, { label: '예배위원 광고', text: '오다온' }], '오다온', { visit: 'v|2026-11-29', who: ['pB'] }, '부산 교역자']);
  sc.eq('(62) 교역자: 부산 일정이 없는 주 → 반영 = 새 부산 일정 · 홀로 적힌 호칭(목사)은 이름이 아님',
    J([by('who|2026-12-06').app, by('who|2026-12-06').sheet[0].text, by('who|2026-12-06').want, by('who|2026-12-06').fix]), ['부산 일정 없음', '서하늘', '새 부산 일정 · 서하늘', { visit: 'v|2026-12-06', make: true, who: ['pF'] }]);
  sc.eq('(62) 못 이은 이름 · 두 시트가 다름 → 반영 없이 까닭만', [by('who|2026-12-13').fix, /'정마루'.*다른 이름/s.test(by('who|2026-12-13').why), by('who|2026-12-20').fix, /두 시트/.test(by('who|2026-12-20').why)], [null, true, null, true]);
  sc.eq('(62) 주일 2부 판교중계 ↔ 앱 교역자 인도 → 반영 = 중계', J([by('lead|sun|2026-11-29').app, by('lead|sun|2026-11-29').sheet, by('lead|sun|2026-11-29').fix, by('lead|sun|2026-11-29').want]),
    ['교역자 인도(나가람)', [{ label: '예배팀 2부', text: '판교중계' }], { visit: 'v|2026-11-29', svc: 'sun', lead: { m: 'relay' } }, '중계']);
  sc.eq('(62) LL: 앱은 중계 · 시트는 사람이 적힘 → 반영 = 비움(이름은 주일에 견주지 않음) · 까닭 한 줄', J([by('lead|ll|2026-11-22').app, by('lead|ll|2026-11-22').fix, by('lead|ll|2026-11-22').want, /중계가 아니어서/.test(by('lead|ll|2026-11-22').why)]),
    ['중계', { visit: 'v|2026-11-22', svc: 'll', lead: null }, '비움', true]);
  sc.eq('(62) 읽기만: 견주기는 책도 표도 고치지 않음', [JSON.stringify(b0), A.gsDiff(b0, null, null, TD, '2026-12-31').length], [before, 0]);

  // ── 금요 인도 갈래
  const fri = (cells, relay, lead, days) => { const b = mkb(); const v = b.visits.find(x => x.id === 'v|2026-11-22'); A.put(b, 'visits', Object.assign({}, v, { lead: Object.assign({}, v.lead, { fri: lead }), days: days || v.days }), 'u', 2);
    return [b, A.gsDiff(b, { sun: [], fri: [{ date: '2026-11-20', name: '인카운터', relay, cells }], roles: {} }, null, TD, '2026-12-31')]; };
  sc.eq('(62) 금요: 성도 인도자(한별)면 같음 · 앱 비움이면 반영 = 그분 · 이름 = ENCOUNTER 예배 인도',
    [fri({ 예배인도: ['한별'] }, false, { m: 'lay', p: 'pC' })[1].length, J(fri({ 예배인도: ['한별'] }, false, null)[1].map(x => [x.label, x.app, x.fix.lead, x.want]))], [0, [['ENCOUNTER 예배 인도', '비움', { m: 'lay', p: 'pC' }, '한별 인도']]]);
  sc.eq('(62) 금요: 판교중계 ↔ 교역자 인도 → 반영 = 중계 · 못 이은 이름은 까닭만(앱이 중계면 비움으로)',
    J([fri({}, true, { m: 'staff' })[1].map(x => x.fix.lead), fri({ 예배인도: ['도담'] }, false, { m: 'staff' })[1].map(x => [x.fix, /'도담'/.test(x.why)]), fri({ 예배인도: ['도담'] }, false, { m: 'relay' })[1].map(x => x.fix.lead)]),
    [[{ m: 'relay' }], [[null, true]], [null]]);
  sc.eq('(62) 금요: 그 부산 일정 교역자가 아닌 분 · 인도자 여럿은 까닭만', fri({ 예배인도: ['서하늘'] }, false, null)[1].map(x => [x.fix, /교역자도 성도 인도자도 아닙니다/.test(x.why)]), [[null, true]]);
  const [bf, df] = fri({ 예배인도: ['나가람'] }, false, null, '토일');
  sc.eq('(62) 금요: 교역자 인도인데 금요일에 안 머묾 → 반영이 금요일을 머무는 날에 더함', J([df[0].fix, df[0].want]), [{ visit: 'v|2026-11-22', svc: 'fri', lead: { m: 'staff' }, addDay: '금' }, '교역자 인도(나가람) · 머무는 날에 금 더함']);
  sc.eq('(62) 반영: 그 칸 + 요일만 바뀜 · 다시 견주면 사라짐', (() => { A.gsFix(bf, df[0].fix, 'u', 9); const v = bf.visits.find(x => x.id === 'v|2026-11-22');
    return J([v.days, v.lead, v.who, A.gsDiff(bf, { sun: [], fri: [{ date: '2026-11-20', name: '', relay: false, cells: { 예배인도: ['나가람'] } }], roles: {} }, null, TD, '2026-12-31').length]); })(),
    ['금토일', { fri: { m: 'staff' }, sun: { m: 'staff' }, ll: { m: 'relay' } }, ['pA'], 0]);

  // ── 앱에 반영 (누를 때만)
  const b1 = mkb();
  sc.eq('(62) 반영: 교역자 · 중계 · 비움 · 새 부산 일정 — 한 칸씩 · 다른 칸(숙소 · 다른 인도)은 그대로',
    (() => { const ok = ['who|2026-11-29', 'lead|sun|2026-11-29', 'lead|ll|2026-11-22', 'who|2026-12-06'].map(id => A.gsFix(b1, by(id).fix, 'u', 10));
      const v = id => J(b1.visits.find(x => x.id === id));
      return [ok, v('v|2026-11-29').who, v('v|2026-11-29').lead, v('v|2026-11-22').lead, v('v|2026-11-22').who, J([v('v|2026-12-06').who, v('v|2026-12-06').days, v('v|2026-12-06').at])]; })(),
    [[true, true, true, true], ['pB'], { sun: { m: 'relay' } }, { fri: { m: 'staff' }, sun: { m: 'staff' } }, ['pA'], [['pF'], '', 10]]);
  const D1 = A.gsDiff(b1, team, serve, TD, '2026-12-31');
  sc.eq('(62) 반영 뒤 다시 견주면 그 줄은 사라짐 · 새 부산 일정의 금요(어웨이크 판교중계)가 새로 견줘짐', D1.map(x => x.id), ['lead|fri|2026-12-04', 'who|2026-12-13', 'who|2026-12-20']);
  sc.eq('(62) 같은 반영을 또 누르면 안 바뀜 · 반영할 것 없는 줄(null) · 모르는 일정은 false', [A.gsFix(b1, by('who|2026-11-29').fix, 'u', 11), A.gsFix(b1, by('lead|ll|2026-11-22').fix, 'u', 11), A.gsFix(b1, null, 'u', 11), A.gsFix(b1, { visit: 'v|2027-01-03', svc: 'sun', lead: { m: 'relay' } }, 'u', 11), A.gsFix(b1, { visit: 'v|2027-01-03', who: ['pA'] }, 'u', 11)], [false, false, false, false, false]);

  // ── 넘기기 열쇠 · 알림 판
  const k1 = by('who|2026-12-13').key, k2 = A.gsDiff(b0, Object.assign({}, team, { sun: team.sun.map(e => e.date === '2026-12-13' ? Object.assign({}, e, { cells: { 교역자: ['정 마루', '나가람'] } }) : e) }), serve, TD, '2026-12-31').find(x => x.id === 'who|2026-12-13').key;
  sc.eq('(62) 넘기기 열쇠: 자리 + 지문(이름이 안 듦) · 시트 값이 바뀌면 다른 열쇠', [/^who\|2026-12-13\|[0-9a-f]{8}-[0-9a-z]+$/.test(k1), k1 !== k2, /정마루|서하늘/.test(D.map(x => x.key).join())], [true, true, false]);
  const al = (o) => A.alertsOf(b0, TD, o).items.filter(x => x.kind === 'gs');
  sc.eq('(62) 알림 판: 확인 갈래에 한 줄씩 · 넘긴 줄은 빠짐 · 표가 없으면 없음',
    [al({ gs: { team, serve } }).length, J(al({ gs: { team, serve } })[0]), al({ gs: { team, serve, skip: [k1] } }).map(x => x.to.gs).includes('who|2026-12-13'), al({ gs: { team: null, serve: null } }).length, al({}).length],
    [6, { cat: 'chk', kind: 'gs', date: '2026-11-22', t: '', main: '시트와 다름 · 라이프라인 중계', sub: '앱 중계 · 시트 중계 아님', go: '시트와 맞춰 보기', to: { gs: 'lead|ll|2026-11-22' }, dd: 6 }, false, 0, 0]);
  sc.eq('(62) 알림 판: 교역자 화면에는 없음 · 부산 기간(endB) 밖은 없음', [al({ gs: { team, serve }, staff: 'pA' }).length, al({ gs: { team, serve }, endB: '2026-11-30' }).length], [0, 3]);
  sc.eq('(62) 넘긴 줄(ui.gsk): HB 만 · 꼴이 맞는 것만 · 겹치면 한 번 · 없으면 칸도 없음 · 나중 것 60개',
    [J(A.normUi({ gsk: ['who|2026-12-13|0a1b2c3d-1x', 'bad key!', 'who|2026-12-13|0a1b2c3d-1x'] }).gsk), 'gsk' in A.normUi({ gsk: ['a|b'] }, true), 'gsk' in A.normUi({}), A.gsSkipNorm(Array.from({ length: 70 }, (_, i) => 'k' + i)).length, A.gsSkipNorm(Array.from({ length: 70 }, (_, i) => 'k' + i))[0]],
    [['who|2026-12-13|0a1b2c3d-1x'], false, false, 60, 'k10']);

  // ── 화면 · 지킬 것 (코드에서)
  const ui = HTML.slice(HTML.indexOf('/* ---------- 시트와 맞춰 보기 (1121-G G4'), HTML.indexOf('/* ---------- 구글 자료 보이기 (1121-G G3'));
  sc.eq('(62) 화면 구역: 반영은 누른 줄 하나만(gsFix → saveBook) · 시트(fetch · gsApi)에 안 씀 · 계정은 ui(saveUi)로만',
    [ui.length > 1000, (HTML.match(/gsFix\(/g) || []).length /* 정의 · 화면 설명 한 줄 · 부르는 곳 하나 */, /gsFix\(S\.book, x\.fix, byNow\(\), Date\.now\(\)\)/.test(ui), /fetch\(|gsApi|gsStore|\.set\(|\.update\(/.test(ui), /saveUi\(\{ gsk/.test(ui)], [true, 3, true, false, true]);
  sc.eq('(62) HB 만: 판은 gsCan · 교역자 누름(staffOk)에 반영 · 넘기기 없음 · 알림 판에 표를 넘김',
    [/function gsChkOk\(\) \{ return gsCan\(\) && !isStaff\(\); \}/.test(ui), /'gsfix'|'gsskip'|d\.gsfix|d\.gsskip/.test(HTML.slice(HTML.indexOf('const STAFF_ACTS'), HTML.indexOf('function staffNoMsg'))), /gs: isStaff\(\) \? null : \{ team: gsData\('bteam'\), serve: gsData\('bserve'\), skip: UIS\.ui\.gsk \|\| \[\] \}/.test(HTML), /if \(t\.gs\) return gsChkOpen\(t\.gs\);/.test(HTML)],
    [true, false, true, true]);
}

sc.done();

