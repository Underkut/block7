// 교역자 로테이션(rotation/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="rotation-core">)를 떼어 시험한다.
// 사람 이름은 지어낸 것이다 (공개 저장소). 날짜는 실제 달력.
//
// 지키는 것:
//  ① 한 주 = 월~주일. 수요 · 금요 · 주일이 그 주일 하나로 묶인다
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
//  ⑬ 낡은 앱과 함께: 새 앱은 b2 칸에만 쓰고 book · b2 를 합쳐 읽는다 · 같은 때면 긴 사본이 이긴다
//  ⑭ 시트 기록 가져오기: 이름 → 사람 · 이미 적은 칸은 그대로 · 지운 것 안 살아남 · 두 번 해도 같음 · 지우지 않음
//  ⑮ 화요예배(옛 기록) · 지난 주 노랑 안 깔기
//  ⑰ 자동 배열 제안(R4): 빈 칸만 · 지운 칸 · 잠근 칸 그대로 · 부산 오래 안 간 분 먼저 · 두 주 연속 피함 · 겹침 피함 · 헌금 두 사람 · 인도 둘 다르게
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
  stayDates, busyOn, conflicts, conflictText, levelMap, pickNote, countRole, setSlot, weekVisits, defaultDays, canDo, pickDoc, importBook, personIdFor, svcShown, sortDays, dayChoices, weekLabel, propose, applyProposal };`, ctx);
const A = ctx.A, J = v => JSON.parse(JSON.stringify(v));

// ① 한 주
sc.eq('① 수요일(11/11)의 주일은 11/15', A.sunOf('2026-11-11'), '2026-11-15');
sc.eq('① 주일은 그 날 자신', A.sunOf('2026-11-15'), '2026-11-15');
sc.eq('① 월요일(11/16)은 다음 주일(11/22)에 묶인다', A.sunOf('2026-11-16'), '2026-11-22');
sc.eq('① 그 주 금요 · 수요 날짜', [A.svcDate('2026-11-15', 'fri'), A.svcDate('2026-11-15', 'wed')], ['2026-11-13', '2026-11-11']);
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
sc.eq('③ 아무것도 아닌 것 → 빈 책', J(A.normBook(null)), { v: 1, at: 0, people: [], slots: [], visits: [], marks: [] });

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
A.put(wk, 'slots', { id: A.slotId('2026-11-13', 'fri', 'preach'), who: ['p2'] }, 'u', 1);
A.put(wk, 'visits', { id: A.visitId('2026-11-15'), who: ['p2'], stay: [{ name: '호텔 A', status: 'done' }, { kind: 'home', status: 'ask' }] }, 'u', 1);
const pl = A.weekPlan(wk, '2026-11-15');
sc.eq('⑦ 한 주에 금요 · 수요 날짜와 부산 금n', [pl.fri, pl.wed, pl.busanFri], ['2026-11-13', '2026-11-11', 2]);
sc.eq('⑦ 그 주 금요 자리를 찾는다', A.whoText(wk, pl.slots['fri|preach'].who, ''), '나나');
sc.eq('⑦ 같은 사람이 여러 예배 → 한 줄로 묶음', J(A.groupRole(wk, pl, 'preach', ['sun1', 'sun2', 'sun3', 'll'])), [{ text: '담임목사님', svcs: ['sun1', 'sun2', 'sun3', 'll'] }]);
sc.eq('⑦ 헌금: 가가(1 · 3부) · 나나(2부)', J(A.groupRole(wk, pl, 'offer', ['sun1', 'sun2', 'sun3', 'll'])), [{ text: '가가', svcs: ['sun1', 'sun3'] }, { text: '나나', svcs: ['sun2'] }]);
sc.eq('⑦ 숙소 하나라도 대화 중이면 미정', A.stayState(pl.visits[0]), 'open');
sc.eq('⑦ 취소한 숙소는 셈하지 않는다', A.stayState(A.normBook({ visits: [{ id: 'v|2026-11-15', stay: [{ status: 'cancel' }, { status: 'done' }] }] }).visits[0]), 'done');
const two = A.normBook({ visits: [{ id: 'v|2025-12-25', days: '목' }, { id: 'v|2025-12-28' }, { id: 'v|2025-12-31', days: '수목' }, { id: 'v|2026-01-04' }] });
sc.eq('⑦ 한 주에 방문이 여럿 — 월~주일로 묶는다 (시트 2025-12 성탄 · 송구영신 실제 모양)', [A.weekVisits(two, '2025-12-28').map(v => v.date), A.weekVisits(two, '2026-01-04').map(v => v.date)], [['2025-12-25', '2025-12-28'], ['2025-12-31', '2026-01-04']]);
A.drop(wk, 'people', 'p1', 'u', 2);
sc.eq('⑦ 지운 사람이 맡은 자리는 이름 대신 (지운 사람)', A.whoText(wk, ['p1', 'p2'], ''), '(지운 사람) · 나나');
sc.eq('⑦ 칸 이름', [A.slotLabel('sun2', 'lead'), A.slotLabel('fri', 'offer'), A.slotLabel('ll', 'offer')], ['2부 예배인도', '금요 헌금 · 광고', 'LL 헌금인도']);
sc.eq('⑦ 시트 예배 구성의 칸은 열넷 + 옛 화요예배 둘', A.GRID.length, 16);

// ⑨ 머무는 날
const V = (date, days) => A.normBook({ visits: [{ id: 'v|' + date, days }] }).visits[0];
sc.eq('⑨ 주일 + 비어 있음 → 토일', A.stayDates(V('2026-11-15', '')), ['2026-11-14', '2026-11-15']);
sc.eq('⑨ 주일 + 금토일월', A.stayDates(V('2026-11-15', '금토일월')), ['2026-11-13', '2026-11-14', '2026-11-15', '2026-11-16']);
sc.eq('⑨ 주일 + 목금토일 (성탄 주간)', A.stayDates(V('2025-12-28', '목금토일')), ['2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28']);
sc.eq('⑨ 수요일 + 수목 (송구영신)', A.stayDates(V('2025-12-31', '수목')), ['2025-12-31', '2026-01-01']);
sc.eq('⑨ 목요일 + 비어 있음 → 그 날 하루', A.stayDates(V('2025-12-25', '')), ['2025-12-25']);
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
const d1 = A.pickDoc(full, { b3: J(full), b2: stripped, book: stripped });
sc.eq('⑬ 낡은 앱이 옛 칸(book · b2)을 떨군 채 써도 b3 와 합쳐 모두 남고, 옛 칸을 치우려 한 번 쓴다', [d1.book.visits.length, d1.book.people[0].no, d1.push], [2, ['sun1|preach'], true]);
const d1b = A.pickDoc(full, { b3: J(full) });
sc.eq('⑬ b3 만 있고 같으면 다시 쓰지 않는다(핑퐁 없음)', d1b.push, false);
const d2 = A.pickDoc(null, { book: J(full) });
sc.eq('⑬ R1 때 자료(book 만) → 빈 기기에서도 그대로 읽고 b3 로 옮겨 쓴다', [d2.book.visits.length, d2.push], [2, true]);
const d2b = A.pickDoc(null, { b2: J(full) });
sc.eq('⑬ R2~ 자료(b2 만) → 그대로 읽고 b3 로 옮겨 쓴다', [d2b.book.visits.length, d2b.book.people[0].no, d2b.push], [2, ['sun1|preach'], true]);
const old2 = J(stripped); old2.people.push({ id: 'y', name: '나나', roles: [], at: 9 });
const d3 = A.pickDoc(full, { b2: old2, b3: J(full) });
sc.eq('⑬ 낡은 앱에서 새로 적은 줄도 받아 b3 로 올린다', [d3.book.people.map(p => p.id), d3.push], [['x', 'y'], true]);
sc.eq('⑬ 빈 문서 · 빈 기기 → 아무것도 안 씀', A.pickDoc(null, {}).push, false);
sc.eq('⑬ 쓰는 칸은 b3 하나, 옛 칸(book · b2)은 지운다', /\[WRITE_FIELD\]: S\.book/.test(HTML) && /FieldValue\.delete\(\)/.test(HTML) && !/\.set\(\{ (book|b2):/.test(HTML), true);

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
sc.eq('⑮ 화요는 그 달에 자료가 있을 때만 보인다', [A.svcShown(ir.book, 'tue', ['2026-05-17']), A.svcShown(ir.book, 'tue', ['2026-11-15']), A.svcShown(ir.book, 'wed', ['2026-11-15'])], [true, false, true]);
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
sc.eq('⑯ 주간 이름', [A.weekLabel('2026-11-15'), A.weekLabel('2026-12-06'), A.weekLabel('2027-01-03')], ['11/9~15', '11/30~12/6', '12/28~1/3']);
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
sc.eq('⑯ 모르는 판(3)은 안 받는다', A.importBook(hb, Object.assign(J(imp), { v: 3 }), 'u'), null);

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

// ⑧ 저장 자리 · 집 주소
sc.eq('⑧ 계정 문서는 rota/{uid}', /collection\('rota'\)\.doc\(u\.uid\)/.test(HTML) && /collection\('rota'\)\.doc\(FB\.user\.uid\)/.test(HTML), true);
sc.eq('⑧ users · cellbook 은 부르지 않는다', /collection\('(users|cellbook)'\)/.test(HTML), false);
sc.eq('⑧ 로그인 칸 이름은 rota (다른 앱 로그인과 섞이지 않게)', HTML.includes("firebase.initializeApp(FB_CFG, 'rota')"), true);
sc.eq('⑧ block7.my 로 열리면 sweeter.my/rotation/ 으로', HTML.includes("location.replace('https://sweeter.my/rotation/'"), true);
sc.eq('⑧ 버전 두 곳이 같다(2번째 줄 주석 · APP_VERSION)', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑧ 미리보기는 따로 저장 칸(rota_demo_v1) — 진짜 사본을 덮지 않는다', /DEMO \? 'rota_demo_v1' : 'rota_book_v1'/.test(HTML), true);
sc.eq('⑧ 가져오기 파일 칸은 메뉴 밖에 한 번만 (메뉴가 다시 그려져도 고른 파일을 잃지 않게, 11/14)', (HTML.match(/id="imp-file"/g) || []).length === 1 && !/renderMenu\(\)[\s\S]{0,1500}id="imp-file"/.test(HTML.split('function renderMenu')[1].slice(0, 1600)), true);
sc.eq('⑧ 페이지는 옆으로 움직이지 않는다 (아이폰 왼쪽 잘림 11/14)', /html\{overflow-x:hidden/.test(HTML) && /\.stage\{overflow:hidden/.test(HTML), true);

sc.done();
