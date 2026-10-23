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
this.A = { gcalFromG, gcalToG, gcalPlan, gcalGidFor, gcalB7IdFor, gcalHash, gcalHashEv, gcalWindow, gcalCollect, gcalRecur };`, ctx);
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
  sc.eq('⑫ 그대로면 할 일 없음 · 구글이 펼친 낱개는 가져오지 않는다', [p0.local.length, p0.remote.length], [0, 0]);
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
