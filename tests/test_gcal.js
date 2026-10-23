// 구글 캘린더 양방향 — 판단 규칙(<script id="gcal-core">)만 떼어 시험한다.
//
// 지키는 것:
//  ① 시각 바꾸기 — 하루 시작 3시면 새벽 1시 일정은 전날 칸 · 거꾸로도 같은 시각 · 하루 종일 · 여러 날
//  ② 구글에만 있는 것 → 가져온다 (범위 밖 · 취소된 것은 안 가져온다) · 같은 구글 일정이면 어느 기기든 같은 id
//  ③ 구글이 고쳤다 → BLOCK7 을 고친다 · BLOCK7 이 고쳤다 → 구글을 고친다 · 둘 다면 구글이 이긴다
//  ④ BLOCK7 에서 지웠다(지움 표시) → 구글에서 지운다 · 되살렸으면 표시만 걷는다 · 읽기 전용은 다시 안 가져오기만
//  ⑤ 구글에서 취소됐다 → 지운다. 한꺼번에 많으면 멈추고 묻는다(force 면 지운다)
//  ⑥ BLOCK7 에만 있는 것 → 쓸 캘린더에 넣는다 — 오늘부터만 · 반복은 아직 안 보낸다 · 구글 id 는 BLOCK7 id 로 정해진다
//  ⑦ 두 기기가 같은 것을 가져와 두 벌 → 하나로 접는다
//  ⑧ 받아오기에 실패한 캘린더는 아무것도 지우지 않는다 · 고르기에서 뺀 캘린더만 지운다
//  ⑨ 순수 함수 — 넘긴 상태를 고치지 않는다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = HTML.match(/<script id="gcal-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('gcal-core 덩어리를 못 찾았습니다'); process.exit(2); }
process.env.TZ = 'Asia/Seoul';
const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, isNaN };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { gcalFromG, gcalToG, gcalPlan, gcalGidFor, gcalB7IdFor, gcalHash, gcalHashEv, gcalWindow, gcalCollect, gcalRecur, gcalParseRecur, gcalRf };`, ctx);
const A = ctx.A;
const J = (v) => JSON.parse(JSON.stringify(v));

// ① 시각
sc.eq('① 오전 9시 반', J(A.gcalFromG({ dateTime: '2026-10-23T09:30:00+09:00' }, { dateTime: '2026-10-23T11:00:00+09:00' }, 0)), { k: '2026-10-23', time: '09:30', d: 90 });
sc.eq('① 하루 시작 3시 → 새벽 1시는 전날 칸', J(A.gcalFromG({ dateTime: '2026-10-24T01:00:00+09:00' }, null, 3)), { k: '2026-10-23', time: '01:00', d: 60 });
{
  const g = A.gcalToG('2026-10-23', '01:00', 30, 3);
  const back = A.gcalFromG(g.start, g.end, 3);
  sc.eq('① 거꾸로 보내고 다시 받으면 같은 칸·시각·길이', J(back), { k: '2026-10-23', time: '01:00', d: 30 });
}
sc.eq('① 하루 종일 (여러 날)', J(A.gcalFromG({ date: '2026-10-23' }, { date: '2026-10-26' }, 0)), { k: '2026-10-23', time: null, d: 3 });
sc.eq('① 하루 종일 보내기', J(A.gcalToG('2026-10-23', null, 1, 0)), { start: { date: '2026-10-23' }, end: { date: '2026-10-24' } });

// ── 판단 시험 도구 ──
const TODAY = '2026-10-23';
const secFor = (t) => (t < '12:00' ? 'am' : 'pm');
const base = (over) => Object.assign({ days: {}, gevents: [], cals: ['me'], writeCal: 'me', roCals: [], today: TODAY, dsh: 0, secFor, defSec: 'am' }, over);
const gev = (id, over) => Object.assign({ id, status: 'confirmed', updated: 'u1', summary: '회의', start: { dateTime: '2026-10-24T10:00:00+09:00' }, end: { dateTime: '2026-10-24T11:00:00+09:00' } }, over);
const linkedEv = (id, gid, over) => Object.assign({ id, time: '10:00', text: '회의', g: { c: 'me', i: gid, u: 'u1', h: A.gcalHash('2026-10-24', '10:00', '회의'), d: 60 } }, over);
const day = (sec, evs, extra) => Object.assign({ big: {}, small: {}, trash: [], events: { [sec]: evs } }, extra);

// ② 가져오기
{
  const p = A.gcalPlan(base({ gevents: [{ c: 'me', ev: gev('abc') }, { c: 'me', ev: gev('old', { start: { date: '2025-01-01' }, end: { date: '2025-01-02' } }) }, { c: 'me', ev: gev('gone', { status: 'cancelled' }) }] }));
  const adds = p.local.filter(x => x.t === 'add');
  sc.eq('② 구글에만 있는 것 하나만 가져온다 (범위 밖·취소 제외)', adds.length, 1);
  sc.eq('② 오전 구간 · 시각 · 고리', J([adds[0].k, adds[0].sec, adds[0].ev.time, adds[0].ev.g.i, adds[0].ev.g.d]), ['2026-10-24', 'am', '10:00', 'abc', 60]);
  sc.eq('② 같은 구글 일정이면 어느 기기든 같은 BLOCK7 id', A.gcalB7IdFor('me', 'abc'), adds[0].ev.id);
  sc.eq('② 아무것도 구글로 안 보낸다', p.remote.length, 0);
  const p2 = A.gcalPlan(base({ cals: ['me', 'hol'], roCals: ['hol'], gevents: [{ c: 'hol', ev: gev('h1', { start: { date: '2026-10-25' }, end: { date: '2026-10-26' } }) }] }));
  sc.eq('② 읽기 전용 캘린더 것은 ro 표시 · 하루 종일은 기본 구간', J([p2.local[0].ev.g.ro, p2.local[0].sec, p2.local[0].ev.time]), [1, 'am', null]);
}

// ③ 고치기
{
  const days = { '2026-10-24': day('am', [linkedEv('e1', 'abc')]) };
  const pG = A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc', { updated: 'u2', summary: '회의 (장소 바뀜)', start: { dateTime: '2026-10-24T14:00:00+09:00' }, end: { dateTime: '2026-10-24T14:30:00+09:00' } }) }] }));
  const s = pG.local.find(x => x.t === 'set');
  sc.eq('③ 구글이 고침 → BLOCK7 이 따른다 (오후 구간으로)', J([s.id, s.sec, s.patch.text, s.patch.time, s.patch.g.u, s.patch.g.d]), ['e1', 'pm', '회의 (장소 바뀜)', '14:00', 'u2', 30]);
  sc.eq('③ 그때 구글로는 안 보낸다', pG.remote.length, 0);

  const days2 = { '2026-10-24': day('am', [linkedEv('e1', 'abc', { text: '회의 — 준비물' })]) };
  const pL = A.gcalPlan(base({ days: days2, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('③ BLOCK7 이 고침 → 구글을 고친다', J(pL.remote.map(x => [x.t, x.gid, x.body.summary, x.body.start.date])), [['patch', 'abc', '회의 — 준비물', null]]);
  sc.eq('③ 그때 BLOCK7 은 그대로', pL.local.length, 0);

  const pBoth = A.gcalPlan(base({ days: days2, gevents: [{ c: 'me', ev: gev('abc', { updated: 'u2', summary: '구글 제목' }) }] }));
  sc.eq('③ 둘 다 고쳤으면 구글이 이긴다', J([pBoth.local[0].patch.text, pBoth.remote.length]), ['구글 제목', 0]);

  const pSame = A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('③ 아무도 안 고쳤으면 할 일 없음', [pSame.local.length, pSame.remote.length], [0, 0]);

  const daysRo = { '2026-10-24': day('am', [linkedEv('e1', 'abc', { text: '바꿈', g: Object.assign(linkedEv('e1', 'abc').g, { ro: 1 }) })]) };
  sc.eq('③ 읽기 전용은 BLOCK7 에서 고쳐도 구글로 안 보낸다', A.gcalPlan(base({ days: daysRo, gevents: [{ c: 'me', ev: gev('abc') }] })).remote.length, 0);
}

// ④ 지우기 (BLOCK7 → 구글)
{
  const days = { '2026-10-24': day('am', [], { gdel: ['me|abc'] }) };
  const p = A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('④ 지움 표시 → 구글에서 지운다', J(p.remote.map(x => [x.t, x.gid, x.key])), [['del', 'abc', 'me|abc']]);
  sc.eq('④ 그 사이 다시 가져오지 않는다', p.local.filter(x => x.t === 'add').length, 0);
  const pDone = A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc', { status: 'cancelled' }) }] }));
  sc.eq('④ 구글에서 이미 지워졌으면 표시만 걷는다', J([pDone.remote.length, pDone.local.map(x => x.t)]), [0, ['untomb']]);
  const daysBack = { '2026-10-24': day('am', [linkedEv('e1', 'abc')], { gdel: ['me|abc'] }) };
  const pBack = A.gcalPlan(base({ days: daysBack, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('④ 되살린 일정이면 구글을 지우지 않는다', J([pBack.remote.length, pBack.local.map(x => x.t)]), [0, ['untomb']]);
  const daysRo = { '2026-10-25': day('am', [], { gdel: ['hol|h1'] }) };
  const pRo = A.gcalPlan(base({ days: daysRo, cals: ['me', 'hol'], roCals: ['hol'], gevents: [{ c: 'hol', ev: gev('h1') }] }));
  sc.eq('④ 읽기 전용 캘린더 것은 구글을 못 지우니 다시 안 가져오기만', J([pRo.remote.length, pRo.local.length]), [0, 0]);
}

// ⑤ 구글에서 취소 (구글 → BLOCK7)
{
  const evs = [], gs = [];
  for (let i = 0; i < 10; i++) { evs.push(linkedEv('e' + i, 'g' + i)); gs.push({ c: 'me', ev: gev('g' + i, { status: i < 2 ? 'cancelled' : 'confirmed' }) }); }
  const p = A.gcalPlan(base({ days: { '2026-10-24': day('am', evs) }, gevents: gs }));
  sc.eq('⑤ 두 개 취소 → 두 개 지운다', J(p.local.filter(x => x.t === 'del').map(x => x.id)), ['e0', 'e1']);
  const gsAll = gs.map(x => ({ c: 'me', ev: Object.assign({}, x.ev, { status: 'cancelled' }) }));
  const pMany = A.gcalPlan(base({ days: { '2026-10-24': day('am', evs) }, gevents: gsAll }));
  sc.eq('⑤ 열 개가 한꺼번에 사라지면 멈추고 묻는다', J([pMany.blocked, pMany.local.length]), [{ n: 10, total: 10 }, 0]);
  const pForce = A.gcalPlan(base({ days: { '2026-10-24': day('am', evs) }, gevents: gsAll, force: true }));
  sc.eq('⑤ 그래도 지우라고 하면 지운다', pForce.local.filter(x => x.t === 'del').length, 10);
}

// ⑥ 내보내기
{
  const days = {
    '2026-10-24': day('am', [{ id: 'ev1', time: '09:00', text: '병원' }, { id: 'ev2', time: '08:00', text: '매주', repeat: { daily: true } }, { id: 'ev3', time: null, text: '  ' }]),
    '2026-10-20': day('am', [{ id: 'ev4', time: '09:00', text: '지난 일' }]),
  };
  const p = A.gcalPlan(base({ days }));
  sc.eq('⑥ 오늘부터의 한 번짜리만 보낸다 (빈 제목·지난 날·캘린더를 안 고른 예전 반복 빼고)', J(p.remote.map(x => [x.t, x.id, !!x.rep])), [['ins', 'ev1', false]]);
  sc.eq('⑥ 구글 id 는 BLOCK7 id 에서 정해진다 (a-v·숫자)', /^[a-v0-9]{5,}$/.test(p.remote[0].body.id) && p.remote[0].body.id === A.gcalGidFor('ev1'), true);
  sc.eq('⑥ 쓸 캘린더가 읽기 전용이면 안 보낸다', A.gcalPlan(base({ days, roCals: ['me'] })).remote.length, 0);
  sc.eq('⑥ 쓸 캘린더를 안 정했으면 안 보낸다', A.gcalPlan(base({ days, writeCal: '' })).remote.length, 0);
}

// ⑩ 입력창에서 고른 캘린더 (v26-1024-1)
{
  const days = { '2026-10-24': day('am', [
    { id: 'a1', time: '09:00', text: '교회', gc: 'church' },
    { id: 'a2', time: '10:00', text: '나만', gc: '-' },
    { id: 'a3', time: '11:00', text: '기본' },
    { id: 'a4', time: '12:00', text: '안 보는 곳', gc: 'off' },
  ]) };
  const p = A.gcalPlan(base({ days, cals: ['me', 'church'] }));
  sc.eq('⑩ 고른 캘린더로 · 고르지 않으면 쓸 캘린더로 · BLOCK7 에만(-) · 안 보는 캘린더는 안 보낸다', J(p.remote.map(x => [x.id, x.c])), [['a1', 'church'], ['a3', 'me']]);
  const mv = { '2026-10-24': day('am', [linkedEv('e1', 'abc', { gc: 'church' })]) };
  const pm = A.gcalPlan(base({ days: mv, cals: ['me', 'church'], gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('⑩ 고리 있는 일정의 캘린더를 바꾸면 구글에서 옮긴다', J(pm.remote.map(x => [x.t, x.c, x.to, x.gid])), [['move', 'me', 'church', 'abc']]);
  const pr = A.gcalPlan(base({ days: mv, cals: ['me', 'church'], roCals: ['church'], gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('⑩ 읽기 전용 캘린더로는 옮기지 않는다', pr.remote.length, 0);
}

// ⑫ 반복 → 구글 반복 규칙 (v26-1024-3) — 2026-10-24 는 토요일, 넷째 주
{
  const R = (rep, time, k) => J(A.gcalRecur(k || '2026-10-24', { time: time === undefined ? null : time, repeat: rep }, 0, 'Asia/Seoul'));
  sc.eq('⑫ 매일 → DAILY', R({ daily: true }), ['RRULE:FREQ=DAILY']);
  sc.eq('⑫ 매일 + 요일 고르기 → WEEKLY;BYDAY', R({ daily: true, daysOfWeek: [6, 1, 3] }), ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE,SA']);
  sc.eq('⑫ 매주 → 그 요일 WEEKLY', R({ weekly: true }), ['RRULE:FREQ=WEEKLY;BYDAY=SA']);
  sc.eq('⑫ 매주 + 몇째 주 → MONTHLY;BYDAY=4SA', R({ weekly: true, weeksOfMonth: [2, 4] }), ['RRULE:FREQ=MONTHLY;BYDAY=2SA,4SA']);
  sc.eq('⑫ 매일 요일 + 몇째 주 → MONTHLY 곱', R({ daily: true, daysOfWeek: [0, 6], weekly: true, weeksOfMonth: [4] }), ['RRULE:FREQ=MONTHLY;BYDAY=4SU,4SA']);
  sc.eq('⑫ 원본 날이 규칙 밖이면 그 날을 뺀다 (월·수만인데 토요일에 만듦)', R({ daily: true, daysOfWeek: [1, 3] }), ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE', 'EXDATE;VALUE=DATE:20261024']);
  sc.eq('⑫ 종일: 끝날 UNTIL · 뺀 날 EXDATE (지난 것·끝날 뒤 것은 버림)', R({ weekly: true, until: '2026-12-31', ex: ['2026-10-31', '2026-01-01', '2027-02-06'] }),
    ['RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261231', 'EXDATE;VALUE=DATE:20261031']);
  sc.eq('⑫ 시각: 뺀 날은 그 시각으로 (TZID)', R({ weekly: true, ex: ['2026-10-31'] }, '09:30'), ['RRULE:FREQ=WEEKLY;BYDAY=SA', 'EXDATE;TZID=Asia/Seoul:20261031T093000']);
  sc.eq('⑫ 시각: UNTIL 은 그날 끝(서울 23:59:59)을 UTC 로', R({ weekly: true, until: '2026-12-26' }, '09:30'), ['RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261226T145959Z']);
  sc.eq('⑫ 하루 시작보다 이른 시각은 못 옮긴다', J(A.gcalRecur('2026-10-24', { time: '01:00', repeat: { weekly: true } }, 3, 'Asia/Seoul')), null);
  sc.eq('⑫ 끝난 반복(끝날 < 원본)은 못 옮긴다', R({ weekly: true, until: '2026-10-01' }), null);
  sc.eq('⑫ 한 번짜리 지문은 예전과 같다', A.gcalHashEv('2026-10-24', { time: '09:00', text: 'a' }, 0), A.gcalHash('2026-10-24', '09:00', 'a'));

  // 보내기: 원본 날이 지난 반복도 살아 있으면 보낸다 · 끝난 반복은 안 보낸다 · 시각 있으면 timeZone
  const NEW = 'ev' + Date.UTC(2026, 9, 24, 3);   // 이 기능 뒤에 만든 반복
  const days = { '2026-09-05': day('am', [{ id: 'evR1', time: '09:00', text: '주일 준비', repeat: { weekly: true }, gc: 'me' },
                                          { id: 'evR2', time: '09:00', text: '끝난 반복', repeat: { weekly: true, until: '2026-10-01' }, gc: 'me' },
                                          { id: 'ev1700000000000', time: '06:00', text: '예전 반복(고르지 않음)', repeat: { daily: true } }]),
                 '2026-10-24': day('am', [{ id: NEW, time: '07:00', text: '새 반복', repeat: { daily: true } }]) };
  const p = A.gcalPlan(base({ days, tz: 'Asia/Seoul' }));
  sc.eq('⑫ 캘린더를 고른 예전 반복 · 새 반복은 보낸다 / 끝난 것 · 고르지 않은 예전 반복은 안 보낸다', J(p.remote.map(x => x.id)), ['evR1', NEW]);
  sc.eq('⑫ 반복 본문: 규칙 · 시간대', J([p.remote[0].body.recurrence, p.remote[0].body.start.timeZone]), [['RRULE:FREQ=WEEKLY;BYDAY=SA'], 'Asia/Seoul']);

  // 고리 있는 반복: '이 날만 삭제' (ex 추가) → 구글 원본을 고친다
  const linkedR = (ex) => ({ id: 'evR1', time: '09:00', text: '주일 준비', repeat: { weekly: true, ex }, g: { c: 'me', i: 'b7evr1', u: 'u1', d: 60,
    h: A.gcalHashEv('2026-09-05', { time: '09:00', text: '주일 준비', repeat: { weekly: true, ex: [] } }, 0) } });
  const master = { c: 'me', ev: { id: 'b7evr1', status: 'confirmed', updated: 'u1', summary: '주일 준비', recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=SA'],
    start: { dateTime: '2026-09-05T09:00:00+09:00' }, end: { dateTime: '2026-09-05T10:00:00+09:00' } } };
  const inst = { c: 'me', ev: gev('b7evr1_20261031T000000Z', { recurringEventId: 'b7evr1' }) };
  const p0 = A.gcalPlan(base({ days: { '2026-09-05': day('am', [linkedR([])]) }, gevents: [master, inst], tz: 'Asia/Seoul' }));
  sc.eq('⑫ 그대로면 할 일 없음(처음 한 번 규칙 지문만 적는다) · 구글이 펼친 낱개는 가져오지 않는다', [p0.local.filter(x => x.t !== 'meta').length, p0.remote.length, p0.local.map(x => x.t)], [0, 0, ['meta']]);
  const p1 = A.gcalPlan(base({ days: { '2026-09-05': day('am', [linkedR(['2026-10-31'])]) }, gevents: [master, inst], tz: 'Asia/Seoul' }));
  sc.eq('⑫ 이 날만 지움 → 구글 원본에 EXDATE', J(p1.remote.map(x => [x.t, x.gid, x.body.recurrence])),
    [['patch', 'b7evr1', ['RRULE:FREQ=WEEKLY;BYDAY=SA', 'EXDATE;TZID=Asia/Seoul:20261031T090000']]]);
  const pOther = A.gcalPlan(base({ gevents: [{ c: 'me', ev: gev('b7evzz_20261031', { recurringEventId: 'b7evzz' }) }] }));
  sc.eq('⑫ 다른 기기가 만든 BLOCK7 반복의 낱개도 가져오지 않는다 (원본이 아직 안 왔어도)', pOther.local.length, 0);
  const pG = A.gcalPlan(base({ gevents: [{ c: 'me', ev: gev('abc_20261031', { recurringEventId: 'abc' }) }] }));
  sc.eq('⑫ 구글에서 만든 반복은 지금처럼 낱개로 가져온다', pG.local.filter(x => x.t === 'add').length, 1);
  const pCan = A.gcalPlan(base({ days: { '2026-09-05': day('am', [linkedR([])]) }, gevents: [{ c: 'me', ev: Object.assign({}, master.ev, { status: 'cancelled' }) }].map(x => x), tz: 'Asia/Seoul' }));
  sc.eq('⑫ 구글에서 반복 전체를 지우면 BLOCK7 반복도 지운다', J(pCan.local.map(x => [x.t, x.id])), [['del', 'evR1']]);
}

// ⑬ 실행취소로 되살림 (v26-1024-5) — BLOCK7 이 지운 기록(gone)이 있으면 구글을 되살리고, 없으면 구글에서 지운 것으로 본다
{
  const days = { '2026-10-24': day('am', [linkedEv('e1', 'abc')]) };
  const gs = [{ c: 'me', ev: gev('abc', { status: 'cancelled' }) }];
  const pR = A.gcalPlan(base({ days, gevents: gs, gone: ['me|abc'] }));
  sc.eq('⑬ BLOCK7 이 지웠던 것 → 구글을 되살린다 (확정으로) · BLOCK7 은 그대로', J([pR.remote.map(x => [x.t, x.gid, x.body.status, x.body.summary]), pR.local.length]),
    [[['restore', 'abc', 'confirmed', '회의']], 0]);
  const pD = A.gcalPlan(base({ days, gevents: gs }));
  sc.eq('⑬ 기록이 없으면 구글에서 지운 것 → BLOCK7 에서도 지운다', J([pD.remote.length, pD.local.map(x => x.t)]), [0, ['del']]);
  const rdays = { '2026-09-05': day('am', [{ id: 'evR', time: '09:00', text: '반복', repeat: { weekly: true }, g: { c: 'me', i: 'b7evr', u: 'u1', d: 60, h: 'x' } }]) };
  const pS = A.gcalPlan(base({ days: rdays, gevents: [{ c: 'me', ev: { id: 'b7evr', status: 'cancelled' } }], gone: ['me|b7evr'], tz: 'Asia/Seoul' }));
  sc.eq('⑬ 반복 전체를 되살릴 때는 규칙까지', J(pS.remote.map(x => [x.t, x.body.recurrence])), [['restore', ['RRULE:FREQ=WEEKLY;BYDAY=SA']]]);
}

// ⑭ 구글 반복 → BLOCK7 반복 (v26-1024-7, 3단계 ②) — 2026-10-24 토요일(넷째 주)
{
  const M = (rec, over) => Object.assign({ id: 'gm1', status: 'confirmed', updated: 'u1', summary: '구역모임', recurrence: rec,
    start: { dateTime: '2026-10-24T19:00:00+09:00', timeZone: 'Asia/Seoul' }, end: { dateTime: '2026-10-24T21:00:00+09:00', timeZone: 'Asia/Seoul' } }, over);
  const PR = (rec, over) => { const r = A.gcalParseRecur(M(rec, over), 0); return r ? J(r.repeat) : null; };
  const R7 = { daily: false, daysOfWeek: [0,1,2,3,4,5,6], weekly: true, weeksOfMonth: [1,2,3,4,5] };
  sc.eq('⑭ WEEKLY → BLOCK7 매주', PR(['RRULE:FREQ=WEEKLY;BYDAY=SA']), Object.assign({}, R7, { ex: [] }));
  sc.eq('⑭ DAILY → 매일', PR(['RRULE:FREQ=DAILY']), { daily: true, daysOfWeek: [0,1,2,3,4,5,6], weekly: false, weeksOfMonth: [1,2,3,4,5], ex: [] });
  sc.eq('⑭ WEEKLY;BYDAY=MO,WE → 매일 + 요일', PR(['RRULE:FREQ=WEEKLY;BYDAY=MO,WE']), { daily: true, daysOfWeek: [1, 3], weekly: false, weeksOfMonth: [1,2,3,4,5], ex: [] });
  sc.eq('⑭ MONTHLY;BYDAY=2SA,4SA → 매주 + 몇째 주', PR(['RRULE:FREQ=MONTHLY;BYDAY=2SA,4SA']), Object.assign({}, R7, { weeksOfMonth: [2, 4], ex: [] }));
  sc.eq('⑭ UNTIL · EXDATE', PR(['RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261231T145959Z', 'EXDATE;TZID=Asia/Seoul:20261031T190000,20261107T190000']),
    Object.assign({}, R7, { until: '2026-12-31', ex: ['2026-10-31', '2026-11-07'] }));
  sc.eq('⑭ COUNT=3 → 끝날 (셋째 회)', PR(['RRULE:FREQ=WEEKLY;BYDAY=SA;COUNT=3']), Object.assign({}, R7, { until: '2026-11-07', ex: [] }));
  sc.eq('⑭ 못 옮기는 것: 격주 · 매월 24일 · 매년 · 마지막 토요일', [PR(['RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=SA']), PR(['RRULE:FREQ=MONTHLY;BYMONTHDAY=24']),
    PR(['RRULE:FREQ=YEARLY']), PR(['RRULE:FREQ=MONTHLY;BYDAY=-1SA'])], [null, null, null, null]);
  // 오가도 같은 뜻: BLOCK7 → 구글 → BLOCK7
  [{ daily: true }, { daily: true, daysOfWeek: [1, 3] }, { weekly: true }, { weekly: true, weeksOfMonth: [2, 4] }, { daily: true, daysOfWeek: [0, 6], weekly: true, weeksOfMonth: [4] }].forEach(rp => {
    const rec = A.gcalRecur('2026-10-24', { time: '19:00', repeat: rp }, 0, 'Asia/Seoul');
    const back = A.gcalParseRecur(M(rec), 0).repeat;
    const hits = r => { const out = []; for (let i = 0; i < 70; i++) { const d = new Date(2026, 9, 24 + i); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dow = d.getDay(), wk = Math.ceil(d.getDate() / 7), days = r.daysOfWeek || [0,1,2,3,4,5,6], weeks = r.weeksOfMonth || [1,2,3,4,5];
      const on = r.daily ? (days.includes(dow) && (!r.weekly || weeks.includes(wk))) : (r.weekly && dow === 6 && weeks.includes(wk)); if (on) out.push(k); } return out; };
    sc.eq('⑭ 오가도 같은 날들: ' + JSON.stringify(rp), hits(back), hits(rp));
  });

  // 가져오기: 원본 하나 → 반복 하나 · 지운 회차 → 뺀 날 · 고친 회차 → 하루만 고친 일정
  const master = { c: 'me', ev: M(['RRULE:FREQ=WEEKLY;BYDAY=SA']) };
  const xDel = { c: 'me', ev: { id: 'gm1_20261031T100000Z', status: 'cancelled', recurringEventId: 'gm1', originalStartTime: { dateTime: '2026-10-31T19:00:00+09:00' } } };
  const xMod = { c: 'me', ev: { id: 'gm1_20261107T100000Z', status: 'confirmed', updated: 'u5', recurringEventId: 'gm1', summary: '구역모임 (장소 변경)',
    originalStartTime: { dateTime: '2026-11-07T19:00:00+09:00' }, start: { dateTime: '2026-11-07T20:00:00+09:00' }, end: { dateTime: '2026-11-07T22:00:00+09:00' } } };
  const xSame = { c: 'me', ev: { id: 'gm1_20261114T100000Z', status: 'confirmed', updated: 'u6', recurringEventId: 'gm1', summary: '구역모임',
    originalStartTime: { dateTime: '2026-11-14T19:00:00+09:00' }, start: { dateTime: '2026-11-14T19:00:00+09:00' }, end: { dateTime: '2026-11-14T21:00:00+09:00' } } };
  const p = A.gcalPlan(base({ gevents: [master, xDel, xMod, xSame], tz: 'Asia/Seoul' }));
  const adds = p.local.filter(x => x.t === 'add');
  sc.eq('⑭ 반복 하나 + 하루만 고친 일정 하나만 들어온다 (원본과 같은 회차는 따로 안 들어온다)', adds.length, 2);
  const rp = adds.find(x => x.ev.repeat).ev, ov = adds.find(x => !x.ev.repeat).ev;
  sc.eq('⑭ 반복: 매주 · 뺀 날 = 지운 날 + 고친 날', J([rp.repeat.weekly, rp.repeat.ex, rp.time, rp.text]), [true, ['2026-10-31', '2026-11-07'], '19:00', '구역모임']);
  sc.eq('⑭ 하루만 고친 일정: 같은 묶음(rid) · 고친 시각·제목', J([ov.rid === rp.rid, ov.time, ov.text, adds.find(x => !x.ev.repeat).k]), [true, '20:00', '구역모임 (장소 변경)', '2026-11-07']);
  sc.eq('⑭ 구글로는 아무것도 안 보낸다', p.remote.length, 0);

  // 옮겨 오기: 예전에 낱개로 가져온 회차는 BLOCK7 에서만 치운다 · 고친 회차였던 것은 남아 rid 를 얻는다
  const oldInst = (gid, k, text) => ({ id: A.gcalB7IdFor('me', gid), time: '19:00', text, g: { c: 'me', i: gid, u: 'u', h: A.gcalHash(k, '19:00', text), d: 120 } });
  const daysOld = { '2026-10-24': day('pm', [oldInst('gm1_20261024T100000Z', '2026-10-24', '구역모임')]),
                    '2026-11-07': day('pm', [oldInst('gm1_20261107T100000Z', '2026-11-07', '구역모임 (장소 변경)')]) };
  const pm = A.gcalPlan(base({ days: daysOld, gevents: [master, xMod], tz: 'Asia/Seoul' }));
  sc.eq('⑭ 옮겨 오기: 예전 낱개 회차는 치우고(구글엔 손대지 않음) 반복을 가져온다', J([pm.local.filter(x => x.t === 'del' && x.migr).length, pm.local.filter(x => x.t === 'add' && x.ev.repeat).length, pm.remote.length]), [1, 1, 0]);

  const pt = A.gcalPlan(base({ days: Object.assign({}, daysOld, { '2026-09-01': day('pm', [], { gdel: ['me|gm1'] }) }), gevents: [master, xMod], tz: 'Asia/Seoul' }));
  sc.eq('⑭ 옮겨 오기는 대신할 반복이 있을 때만 (반복을 BLOCK7 에서 지운 표시가 있으면 낱개를 안 치운다)', pt.local.filter(x => x.migr).length, 0);
  // 구글에서 규칙을 바꿨다 (매주 → 둘째·넷째 주) → BLOCK7 반복이 따른다
  const linkedM = (rf, extra) => Object.assign({ id: 'evM', time: '19:00', text: '구역모임', rid: 'rM', repeat: { daily: false, daysOfWeek: [0,1,2,3,4,5,6], weekly: true, weeksOfMonth: [1,2,3,4,5], ex: [] },
    g: { c: 'me', i: 'gm1', u: 'u1', d: 120, rf } }, extra);
  const P0 = A.gcalParseRecur(M(['RRULE:FREQ=WEEKLY;BYDAY=SA']), 0);
  const ev0 = linkedM(A.gcalRf(P0, []));
  ev0.g.h = A.gcalHashEv('2026-10-24', ev0, 0);
  const masterNew = { c: 'me', ev: M(['RRULE:FREQ=MONTHLY;BYDAY=2SA,4SA'], { updated: 'u9' }) };
  const pc = A.gcalPlan(base({ days: { '2026-10-24': day('pm', [ev0]) }, gevents: [masterNew], tz: 'Asia/Seoul' }));
  const st = pc.local.find(x => x.t === 'set');
  sc.eq('⑭ 구글에서 바꾼 규칙(둘째·넷째 주)을 BLOCK7 반복이 따른다', st && J(st.patch.repeat.weeksOfMonth), J([2, 4]));
  // 예외만 바뀌어 원본 updated 가 그대로여도 (회차 하나를 구글에서 지움) 지문으로 알아챈다
  const pe = A.gcalPlan(base({ days: { '2026-10-24': day('pm', [ev0]) }, gevents: [master, xDel], tz: 'Asia/Seoul' }));
  const se = pe.local.find(x => x.t === 'set');
  sc.eq('⑭ 구글에서 회차 하나 지움(원본 updated 그대로) → BLOCK7 뺀 날에 든다', se && J(se.patch.repeat.ex), J(['2026-10-31']));
  // '모두 고치기' 로 하루만 고친 예외를 지울 때 그 날을 다시 원본이 따르면 → DELETE 가 아니라 원본 모양으로 되돌린다
  const evAll = linkedM(A.gcalRf(P0, ['2026-11-07']));
  evAll.g.h = 'changed';
  const daysAll = { '2026-10-24': day('pm', [evAll]), '2026-11-07': day('pm', [], { gdel: ['me|gm1_20261107T100000Z'] }) };
  const pa = A.gcalPlan(base({ days: daysAll, gevents: [master, xMod], tz: 'Asia/Seoul' }));
  sc.eq('⑭ 모두 고치기: 하루만 고친 구글 예외는 지우지 않고 원본 모양으로', J(pa.remote.filter(x => x.t !== 'patch').map(x => [x.t, x.gid, x.body.summary, x.body.status])),
    [['reinst', 'gm1_20261107T100000Z', '구역모임', 'confirmed']]);
  // 못 옮기는 구글 반복(격주) → 반복으로는 안 가져오고, 낱개(instances)로 온 회차를 예전처럼 가져온다
  const bi = { c: 'me', ev: M(['RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=SA'], { id: 'gb' }) };
  const biI = { c: 'me', ev: gev('gb_20261024T100000Z', { recurringEventId: 'gb', start: { dateTime: '2026-10-24T19:00:00+09:00' }, end: { dateTime: '2026-10-24T21:00:00+09:00' } }) };
  const pb = A.gcalPlan(base({ gevents: [bi, biI], tz: 'Asia/Seoul' }));
  sc.eq('⑭ 격주는 낱개로 (반복으로 안 옮김)', J(pb.local.filter(x => x.t === 'add').map(x => [!!x.ev.repeat, x.ev.g.i])), [[false, 'gb_20261024T100000Z']]);
  // BLOCK7 이 만든 원본(b7ev…)은 이 기기에 아직 없어도 새로 가져오지 않는다
  const pb7 = A.gcalPlan(base({ gevents: [{ c: 'me', ev: M(['RRULE:FREQ=DAILY'], { id: 'b7ev123' }) }], tz: 'Asia/Seoul' }));
  sc.eq('⑭ BLOCK7 이 만든 원본은 가져오지 않는다', pb7.local.length, 0);
}

// ⑰ 구글에서 하루만 고친 회차는 EXDATE 로 보내지 않는다 (v26-1024-9, HB: BLOCK7 에서 다른 날을 고쳤더니 구글의 고친 회차가 지워졌다)
{
  const M17 = { c: 'me', ev: { id: 'gm1', status: 'confirmed', updated: 'u1', summary: '구역모임', recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=SA'],
    start: { dateTime: '2026-10-24T19:00:00+09:00', timeZone: 'Asia/Seoul' }, end: { dateTime: '2026-10-24T21:00:00+09:00', timeZone: 'Asia/Seoul' } } };
  const X17 = { c: 'me', ev: { id: 'gm1_20261031T100000Z', status: 'confirmed', updated: 'u5', recurringEventId: 'gm1', summary: '구역모임 (장소 변경)',
    originalStartTime: { dateTime: '2026-10-31T19:00:00+09:00' }, start: { dateTime: '2026-10-31T19:00:00+09:00' }, end: { dateTime: '2026-10-31T21:00:00+09:00' } } };
  const P17 = A.gcalParseRecur(M17.ev, 0);
  const rf = A.gcalRf(P17, ['2026-10-31']);
  const mk = ex => { const ev = { id: 'evM', time: '19:00', text: '구역모임', rid: 'rM', repeat: { daily: false, daysOfWeek: [0,1,2,3,4,5,6], weekly: true, weeksOfMonth: [1,2,3,4,5], ex },
    g: { c: 'me', i: 'gm1', u: 'u1', d: 120, rf } }; ev.g.h = A.gcalHashEv('2026-10-24', Object.assign({}, ev, { repeat: Object.assign({}, ev.repeat, { ex: ['2026-10-31'] }) }), 0); return ev; };
  const ov = { id: 'gOv', time: '19:00', text: '구역모임 (장소 변경)', rid: 'rM', g: { c: 'me', i: 'gm1_20261031T100000Z', u: 'u5', d: 120, h: A.gcalHash('2026-10-31', '19:00', '구역모임 (장소 변경)') } };
  // BLOCK7 에서 11/7 을 하루만 고쳤다 → 원본 뺀 날에 11/7 추가
  const days = { '2026-10-24': day('pm', [mk(['2026-10-31', '2026-11-07'])]), '2026-10-31': day('pm', [ov]) };
  const p = A.gcalPlan(base({ days, gevents: [M17, X17], tz: 'Asia/Seoul' }));
  const pa = p.remote.find(x => x.t === 'patch');
  sc.eq('⑰ 원본 고치기: 11/7 은 EXDATE · 구글에서 고친 10/31 은 EXDATE 로 안 보낸다', pa && J(pa.body.recurrence),
    J(['RRULE:FREQ=WEEKLY;BYDAY=SA', 'EXDATE;TZID=Asia/Seoul:20261107T190000']));
  // 구글도 바뀌고(규칙 지문) BLOCK7 도 바뀐 때 — 구글을 따르되 BLOCK7 이 뺀 날(11/7)은 잃지 않는다
  const X18 = { c: 'me', ev: Object.assign({}, X17.ev, { id: 'gm1_20261114T100000Z', originalStartTime: { dateTime: '2026-11-14T19:00:00+09:00' },
    start: { dateTime: '2026-11-14T19:00:00+09:00' }, end: { dateTime: '2026-11-14T21:00:00+09:00' }, summary: '구역모임 (휴강)', status: 'cancelled' }) };
  const p2 = A.gcalPlan(base({ days, gevents: [M17, X17, X18], tz: 'Asia/Seoul' }));
  const st = p2.local.find(x => x.t === 'set');
  sc.eq('⑰ 둘 다 바뀌면: 구글이 지운 11/14 도, BLOCK7 이 뺀 11/7 도 뺀 날에 남는다', st && J(st.patch.repeat.ex), J(['2026-10-31', '2026-11-07', '2026-11-14']));
  sc.eq('⑰ 그때 BLOCK7 이 뺀 날은 다음 차례에 구글로 간다 (지문을 구글 쪽으로 남겨 둔다)', st && st.patch.g.h !== A.gcalHashEv('2026-10-24', Object.assign({}, days['2026-10-24'].events.pm[0], { repeat: st.patch.repeat }), 0), true);
}

// ⑱ BLOCK7 '이 날만 고치기' → 구글 회차를 그 자리에서 고친다(예외) — 따로 선 새 일정 + EXDATE 가 아니라 (v26-1024-10, HB)
{
  const M18 = { c: 'me', ev: { id: 'b7evm', status: 'confirmed', updated: 'u1', summary: '구역모임', recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=SA'],
    start: { dateTime: '2026-10-24T19:00:00+09:00', timeZone: 'Asia/Seoul' }, end: { dateTime: '2026-10-24T21:00:00+09:00', timeZone: 'Asia/Seoul' } } };
  const P18 = A.gcalParseRecur(M18.ev, 0);
  const master = { id: 'evM', time: '19:00', text: '구역모임', rid: 'rM', repeat: { daily: false, daysOfWeek: [0,1,2,3,4,5,6], weekly: true, weeksOfMonth: [1,2,3,4,5], ex: ['2026-10-31'] },
    g: { c: 'me', i: 'b7evm', u: 'u1', d: 120, rf: A.gcalRf(P18, []) } };
  master.g.h = A.gcalHashEv('2026-10-24', Object.assign({}, master, { repeat: Object.assign({}, master.repeat, { ex: [] }) }), 0);
  const one = { id: 'evOne', time: '19:00', text: '구역모임 (우리 집)', rid: 'rM' };   // _evEditApply 'one' 이 만든 것
  const days = { '2026-10-24': day('pm', [master]), '2026-10-31': day('pm', [one]) };
  const p = A.gcalPlan(base({ days, gevents: [M18], tz: 'Asia/Seoul' }));
  const ip = p.remote.find(x => x.t === 'instPatch'), pm = p.remote.find(x => x.t === 'patch'), ins = p.remote.find(x => x.t === 'ins');
  sc.eq('⑱ 그 회차를 고친다 (회차 id = 원본id_원래시작 UTC)', ip && J([ip.gid, ip.body.summary, ip.id]), J(['b7evm_20261031T100000Z', '구역모임 (우리 집)', 'evOne']));
  sc.eq('⑱ 따로 선 새 일정으로 넣지 않는다', !!ins, false);
  sc.eq('⑱ 원본을 고칠 때 그 날을 EXDATE 로 보내지 않는다 (보내면 고친 회차가 지워진다)', pm ? J(pm.body.recurrence) : 'no-patch', J(['RRULE:FREQ=WEEKLY;BYDAY=SA']));
  const pq = A.gcalPlan(base({ days, gevents: [], tz: 'Asia/Seoul', quick: true }));
  sc.eq('⑱ 빠른 첫 걸음에서도 같은 길', J(pq.remote.map(x => x.t)), J(['instPatch']));
  // 모두 고치기(하루만 고친 회차를 BLOCK7 이 지움 + 뺀 날 풀림) — 구글을 아직 안 읽은 빠른 첫 걸음에서도 지우지 않고 되돌린다
  const mAll2 = Object.assign({}, master, { repeat: Object.assign({}, master.repeat, { ex: [] }) });
  const pr = A.gcalPlan(base({ days: { '2026-10-24': day('pm', [mAll2]), '2026-10-31': day('pm', [], { gdel: ['me|b7evm_20261031T100000Z'] }) }, gevents: [], tz: 'Asia/Seoul', quick: true }));
  sc.eq('⑱ 모두 고치기: 구글을 읽기 전에도 회차를 지우지 않고 원본 모양으로', J(pr.remote.map(x => [x.t, x.gid, x.body && x.body.summary])), J([['reinst', 'b7evm_20261031T100000Z', '구역모임']]));
  const pd = A.gcalPlan(base({ days: { '2026-10-24': day('pm', [master]), '2026-10-31': day('pm', [], { gdel: ['me|b7evm_20261031T100000Z'] }) }, gevents: [], tz: 'Asia/Seoul', quick: true }));
  sc.eq('⑱ 이 날만 지우기(원본이 그 날을 뺌)는 그대로 지운다', J(pd.remote.map(x => x.t)), J(['del']));
  // 하루 종일 반복이면 회차 id 는 날짜만
  const mAll = Object.assign({}, master, { time: null, g: Object.assign({}, master.g) });
  const pAll = A.gcalPlan(base({ days: { '2026-10-24': day('pm', [mAll]), '2026-10-31': day('pm', [Object.assign({}, one, { time: null })]) }, gevents: [], tz: 'Asia/Seoul', quick: true }));
  sc.eq('⑱ 하루 종일 반복의 회차 id', pAll.remote[0] && pAll.remote[0].gid, 'b7evm_20261031');
}

// ⑦ 두 벌 접기
{
  const days = { '2026-10-24': day('am', [linkedEv('ga', 'abc'), linkedEv('e1', 'abc')]) };
  const p = A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('⑦ 같은 고리 두 벌 → 뒤의 것만 지운다 · 구글은 그대로', J([p.local.map(x => [x.t, x.id]), p.remote.length]), [[['del', 'e1']], 0]);
  const same = [linkedEv('gx', 'abc'), linkedEv('gx', 'abc')];
  const p2 = A.gcalPlan(base({ days: { '2026-10-24': day('am', same) }, gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('⑦ id 까지 같은 두 벌 → 지울 것은 객체로 가리킨다(뒤의 것)', p2.local.length === 1 && p2.local[0].ref === same[1], true);
}

// ⑧ 받아오기 실패 · 고르기에서 뺌
{
  const days = { '2026-10-24': day('am', [linkedEv('e1', 'abc'), linkedEv('e2', 'w1', { g: Object.assign(linkedEv('e2', 'w1').g, { c: 'work' }) })]) };
  const pFail = A.gcalPlan(base({ days, cals: ['me'], gevents: [] }));
  sc.eq('⑧ 받아오기에 실패(빈 결과)해도 아무것도 지우지 않는다', pFail.local.length, 0);
  const pOff = A.gcalPlan(base({ days, cals: ['me'], offCals: ['work'], gevents: [{ c: 'me', ev: gev('abc') }] }));
  sc.eq('⑧ 고르기에서 뺀 캘린더 것만 지운다', J(pOff.local.map(x => [x.t, x.id])), [['del', 'e2']]);
}

// ⑨ 순수
{
  const days = { '2026-10-24': day('am', [linkedEv('e1', 'abc', { text: '바꿈' })], { gdel: ['me|zzz'] }) };
  const before = JSON.stringify(days);
  A.gcalPlan(base({ days, gevents: [{ c: 'me', ev: gev('abc', { updated: 'u9' }) }, { c: 'me', ev: gev('new') }] }));
  sc.eq('⑨ 넘긴 상태를 고치지 않는다', JSON.stringify(days), before);
}

sc.done();
