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
  stayDates, busyOn, conflicts, conflictText, levelMap, pickNote, countRole, setSlot, weekVisits, defaultDays, canDo, pickDoc };`, ctx);
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
sc.eq('⑤ 표지는 내용 없이 남는다', J(del.people.find(p => p.id === 'pb')), { id: 'pb', del: true, at: 400, by: 'u' });
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
sc.eq('⑦ 시트 예배 구성의 칸은 열넷', A.GRID.length, 14);

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
sc.eq('⑩ 빨강이 먼저 · 글', A.conflictText(cb, cf[0]), '가가 — 11/13(금) 부산에 있는데 판교 금요 설교');
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
sc.eq('⑪ 다 빼면 지우기 표지', [A.setSlot(sb, '2026-11-15|sun1|offer', [], '', 'u', 4), J(sb.slots.find(s => s.id === '2026-11-15|sun1|offer'))], [true, { id: '2026-11-15|sun1|offer', del: true, at: 4, by: 'u', date: '2026-11-15', svc: 'sun1', role: 'offer' }]);
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
const d1 = A.pickDoc(full, { book: stripped, b2: J(full) });
sc.eq('⑬ 낡은 앱이 book 칸을 떨군 채 써도 b2 와 합쳐 모두 남고, 다시 쓰지 않는다(핑퐁 없음)', [d1.book.visits.length, d1.book.people[0].no, d1.push], [2, ['sun1|preach'], false]);
const d2 = A.pickDoc(null, { book: J(full) });
sc.eq('⑬ R1 때 자료(book 만) → 빈 기기에서도 그대로 읽고 b2 로 옮겨 쓴다', [d2.book.visits.length, d2.push], [2, true]);
const old2 = J(stripped); old2.people.push({ id: 'y', name: '나나', roles: [], at: 9 });
const d3 = A.pickDoc(full, { book: old2, b2: J(full) });
sc.eq('⑬ 낡은 앱에서 새로 적은 줄도 받아 b2 로 올린다', [d3.book.people.map(p => p.id), d3.push], [['x', 'y'], true]);
sc.eq('⑬ 빈 문서 · 빈 기기 → 아무것도 안 씀', A.pickDoc(null, {}).push, false);
sc.eq('⑬ 새 앱은 book 칸에 쓰지 않는다', /\.set\(\{ b2: S\.book/.test(HTML) && !/\.set\(\{ book:/.test(HTML), true);

// ⑧ 저장 자리 · 집 주소
sc.eq('⑧ 계정 문서는 rota/{uid}', /collection\('rota'\)\.doc\(u\.uid\)/.test(HTML) && /collection\('rota'\)\.doc\(FB\.user\.uid\)/.test(HTML), true);
sc.eq('⑧ users · cellbook 은 부르지 않는다', /collection\('(users|cellbook)'\)/.test(HTML), false);
sc.eq('⑧ 로그인 칸 이름은 rota (다른 앱 로그인과 섞이지 않게)', HTML.includes("firebase.initializeApp(FB_CFG, 'rota')"), true);
sc.eq('⑧ block7.my 로 열리면 sweeter.my/rotation/ 으로', HTML.includes("location.replace('https://sweeter.my/rotation/'"), true);
sc.eq('⑧ 버전 두 곳이 같다(2번째 줄 주석 · APP_VERSION)', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑧ 미리보기는 따로 저장 칸(rota_demo_v1) — 진짜 사본을 덮지 않는다', /DEMO \? 'rota_demo_v1' : 'rota_book_v1'/.test(HTML), true);
sc.eq('⑧ 페이지는 옆으로 움직이지 않는다 (아이폰 왼쪽 잘림 11/14)', /html\{overflow-x:hidden/.test(HTML) && /\.stage\{overflow:hidden/.test(HTML), true);

sc.done();
