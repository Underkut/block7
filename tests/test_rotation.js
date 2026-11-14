// 교역자 로테이션(rotation/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="rotation-core">)를 떼어 시험한다.
// 사람 이름은 지어낸 것이다 (공개 저장소). 날짜는 실제 달력.
//
// 지키는 것:
//  ① 한 주 = 월~주일. 수요 · 금요 · 주일이 그 주일 하나로 묶인다
//  ② 부산 금요예배(금1 · 금2 · 금3) = 그 달 첫째~셋째 금요일 — 시트 실제 표시와 맞춘다
//  ③ 다듬기: 모르는 예배 · 역할 · 날짜가 안 맞는 자리 · 주일이 아닌 방문은 버린다
//  ④ 맞추기: 줄마다 나중에 고친 것이 이긴다 · 한쪽에만 있는 줄은 남는다(지우지 않는다) · 순서와 상관없이 같은 답
//  ⑤ 지우기 표지: 내용을 비우고 남는다 · 낡은 기기의 줄이 되살리지 못한다
//  ⑥ 계정 맞추기: 계정이 비면 기기 것을 올린다 · 같으면 안 올린다 · 빈 기기 + 계정 = 계정 그대로(빈 기기가 계정을 지우지 않음)
//  ⑦ 한 주 보기 · 같은 사람 여러 예배 묶기 · 지운 사람 표시
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
  normBook, mergeBook, sameBook, pickBook, isEmptyBook, put, drop, live, weekPlan, groupRole, whoText, stayState, slotLabel };`, ctx);
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
  visits: [{ id: 'v|2026-11-15', who: ['p1'], days: '토일', stay: [{ kind: 'x', name: '호텔 A', status: '??' }], at: 1 }, { id: 'v|2026-11-14', at: 1 }],
  marks: [{ id: 'm|2026-11-15', tags: ['성찬주', '성찬주', ''], at: 1 }] });
sc.eq('③ 이름 다듬기 · 모르는 역할 버림 · 이름 없는 사람 · id 없는 사람 버림', J(raw.people), [{ id: 'p1', at: 1, by: '', name: '가나다', roles: ['preach', 'busan'] }]);
sc.eq('③ 자리: 모르는 역할 · 수요일이 아닌 수요 자리 · 시트에 없는 칸(1부 예배인도) 버림, 같은 사람 두 번은 한 번', raw.slots.map(s => [s.id, s.who]), [['2026-11-11|wed|preach', ['p1']], ['2026-11-15|sun2|offer', ['p1']]]);
sc.eq('③ 방문: 주일이 아니면 버림 · 숙소 모르는 값은 기본값', J(raw.visits.map(v => [v.id, v.stay])), [['v|2026-11-15', [{ kind: 'hotel', name: '호텔 A', status: '', cost: 0, nights: 0, for: '' }]]]);
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
sc.eq('⑤ 방문 지우기 표지도 남는다', J(A.normBook(delVisit).visits), [{ id: 'v|2026-11-15', at: 2, by: 'u', del: true, sun: '2026-11-15' }]);

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
sc.eq('⑦ 숙소 하나라도 대화 중이면 미정', A.stayState(pl.visit), 'open');
A.drop(wk, 'people', 'p1', 'u', 2);
sc.eq('⑦ 지운 사람이 맡은 자리는 이름 대신 (지운 사람)', A.whoText(wk, ['p1', 'p2'], ''), '(지운 사람) · 나나');
sc.eq('⑦ 칸 이름', [A.slotLabel('sun2', 'lead'), A.slotLabel('fri', 'offer'), A.slotLabel('ll', 'offer')], ['2부 예배인도', '금요 헌금 · 광고', 'LL 헌금인도']);
sc.eq('⑦ 시트 예배 구성의 칸은 열넷', A.GRID.length, 14);

// ⑧ 저장 자리 · 집 주소
sc.eq('⑧ 계정 문서는 rota/{uid}', /collection\('rota'\)\.doc\(u\.uid\)/.test(HTML) && /collection\('rota'\)\.doc\(FB\.user\.uid\)/.test(HTML), true);
sc.eq('⑧ users · cellbook 은 부르지 않는다', /collection\('(users|cellbook)'\)/.test(HTML), false);
sc.eq('⑧ 로그인 칸 이름은 rota (다른 앱 로그인과 섞이지 않게)', HTML.includes("firebase.initializeApp(FB_CFG, 'rota')"), true);
sc.eq('⑧ block7.my 로 열리면 sweeter.my/rotation/ 으로', HTML.includes("location.replace('https://sweeter.my/rotation/'"), true);
sc.eq('⑧ 버전 두 곳이 같다(2번째 줄 주석 · APP_VERSION)', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑧ 미리보기는 따로 저장 칸(rota_demo_v1) — 진짜 사본을 덮지 않는다', /DEMO \? 'rota_demo_v1' : 'rota_book_v1'/.test(HTML), true);

sc.done();
