// 교역자 로테이션 알림 (1123-B B4) — 앱 rotation-core 의 rp… · 서버 wallet-functions/src/rotapush-core.js · rotapush.js
// 이름은 모두 지어낸 것이다 (공개 저장소). 날짜는 실제 달력(2026-12-04 금 · 12-06 주일).
//
// 지키는 것:
//   ① 한 벌: 서버가 쓰는 rotation-core.gen.js 는 앱 rotation-core 를 그대로 뗀 것(낡으면 실패 → ./tools/make-rotapush-core.sh)
//   ② 설정 다듬기: 기본(E1 줄마다 · E2 예배 인도 · 음향 · 봉독 · 2부 · 전날 20:00) · 모르는 값 버림 · 개수 상한 · 같은 때 한 번 · 같은 id
//   ③ 보낼 때(한국 시각): 주일 예배 전날 = 토 · 금요 전날 = 목 · 당일 · 여러 때 · 꺼진 알림 없음 · 경계(from 제외 · to 포함) · 다음 때
//   ④ 알림 글: 줄마다 · 한 줄로 · 여러 예배면 예배 이름 · 중계 · 교역자 · 카톡 글(ktFill 그대로) · 고른 것이 없으면 안 보냄 · 제목(내일 · 오늘)
//   ⑤ 서버 한 사람 처리: 그 때 보냄 · 두 번 안 보냄 · 10분 넘게 늦은 것 버림 · 내 부산 주만 · 팀에서 빠지면 끔 · 책은 필요할 때만 읽음
//   ⑥ 팀인가: 주인 · 확인된 이메일(대소문자 무관) · 확인 안 됨 · 명단 밖
//   ⑦ 서버가 쓰는 곳은 rotapush/{uid} 뿐 · BLOCK7 알림(users · pushTokens · b7plan)과 안 섞임 · 1분 틱에 얹음 · 책 · 시트 표는 읽기만
//   ⑧ 앱: 메뉴 → 계정 → 내 알림 · 워커 /rotation/sw.js(누르기 처리가 먼저) · 누르면 그 판(?rp=) · 교역자도 씀 · 설정은 서버에만(책 · ui · staff 안 씀)
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const RD = n => fs.readFileSync(path.join(__dirname, '..', n), 'utf8');
const HTML = RD('rotation/index.html'), GEN = RD('wallet-functions/src/rotation-core.gen.js');
const SRV = RD('wallet-functions/src/rotapush.js'), CORE = RD('wallet-functions/src/rotapush-core.js'), TICK = RD('wallet-functions/src/study.js'), IDX = RD('wallet-functions/src/index.js');
const SW = RD('rotation/sw.js');
const C = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'rotapush-core.js'));
const R = C.R, J = v => JSON.parse(JSON.stringify(v));
const m = HTML.match(/<script id="rotation-core">([\s\S]*?)<\/script>/);
const ctx = { console, Math, JSON, Number, Object, Array, String, Date, Map, Set, isNaN, TextEncoder, TextDecoder };
vm.createContext(ctx);
vm.runInContext(m[1] + '\nthis.A = { rpNorm, rpOne, rpDefault, rpNewId, rpWhen, rpHm, rpDue, rpNext, rpNeeds, rpMine, rpMsg, rpLink, rpLinkRead, rpPreview, rpSummary, rpWhenText, rpYmd, RP_DEF, RP_MAX, RP_ROLES, ktFill, KT_BASE };', ctx);
const A = ctx.A;
const ms = s => Date.parse(s + '+09:00'), iso = x => new Date(x + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ');

console.log('\n① 한 벌');
sc.eq('① 서버 core 는 앱 rotation-core 를 그대로 뗀 것 (다르면 ./tools/make-rotapush-core.sh)', GEN.includes(m[1].replace(/\s+$/, '')), true);
sc.eq('① 서버 core 의 판 = 앱 판 · 손으로 고치지 말라는 머리글', [R.APP_VERSION === (HTML.match(/const APP_VERSION = '([^']+)'/) || [])[1], /손으로 고치지 말 것/.test(GEN.slice(0, 300))], [true, true]);
sc.eq('① 서버는 같은 판단을 다시 쓰지 않는다(rpMsg · rpDue 는 core 에만)', [/function rp(Msg|Due|Next|Norm)\b/.test(SRV + CORE), /R\.rpMsg\(/.test(CORE), /R\.rpDue\(/.test(CORE)], [false, true, true]);
sc.eq('① 앱과 서버가 같은 답(같은 입력)', J(R.rpNorm([{ svcs: ['fri', 'x'] }])), J(A.rpNorm([{ svcs: ['fri', 'x'] }])));

console.log('\n② 설정 다듬기');
sc.eq('② 기본 = 주일 섬김 · 2부 · 예배 인도 · 음향 · 봉독 · 줄마다 · 전날 20:00 · 모든 주 · 예배별 (E1 · E2)', J(A.rpDefault()),
  { id: 'a1', n: '주일 섬김', on: true, svcs: ['2'], roles: ['예배 인도', '음향', '봉독'], shape: 'lines', kt: '', when: [{ d: -1, t: '20:00', w: 'all' }], open: 'svc' });
const n1 = A.rpNorm([{ id: 'x!', svcs: ['LL', 'zz', 'fri'], roles: ['봉독', '없는것', '교역자'], shape: '??', when: [{ d: 0, t: '7:05' }, { d: 0, t: '07:05' }, { d: 5, t: '25:00', w: 'mine' }], open: 'no' }]);
sc.eq('② 모르는 값 버림 · 차례는 표 차례(금요 → LL · 교역자 먼저) · 7:05 → 07:05 · 같은 때 한 번 · 틀린 날 · 시각은 기본 · 틀린 id 는 a1', J(n1[0]),
  { id: 'a1', n: '알림', on: true, svcs: ['fri', 'LL'], roles: ['교역자', '봉독'], shape: 'lines', kt: '', when: [{ d: 0, t: '07:05', w: 'all' }, { d: -1, t: '20:00', w: 'mine' }], open: 'svc' });
sc.eq('② 예배를 다 빼면 2부 · 때가 없으면 전날 20:00 · 이름은 20자', (() => { const x = A.rpOne({ svcs: [], when: [], n: '가'.repeat(30) }); return [x.svcs, J(x.when), x.n.length]; })(), [['2'], [{ d: -1, t: '20:00', w: 'all' }], 20]);
sc.eq('② 알림 6개 · 때 4개까지 · 같은 id 는 새 id', (() => { const L = A.rpNorm(Array.from({ length: 9 }, () => ({ id: 'a1', when: [1, 2, 3, 4, 5, 6].map(h => ({ d: 0, t: h + ':00' })) })));
  return [L.length, L[0].when.length, L.map(x => x.id).join(',')]; })(), [6, 4, 'a1,a2,a3,a4,a5,a6']);
sc.eq('② 새 id 는 빈 번호 · 없는 목록도', [A.rpNewId([{ id: 'a1' }, { id: 'a3' }]), A.rpNewId(null)], ['a2', 'a1']);
sc.eq('② 목록 한 줄 글', [A.rpSummary(A.rpDefault()), A.rpWhenText({ d: 0, t: '07:00', w: 'mine' })], ['2부 — 예배 인도 · 음향 · 봉독 — 전날 20:00', '당일 07:00 · 내 부산 주만']);

console.log('\n③ 보낼 때 (한국 시각)');
const sunA = A.rpDefault(), friA = A.rpOne({ id: 'f', svcs: ['fri'], roles: ['예배 인도'], when: [{ d: -1, t: '20:00' }, { d: 0, t: '07:00' }] });
const now0 = ms('2026-11-30T12:00'), due9 = A.rpDue([sunA, friA], now0, now0 + 9 * 864e5).map(x => [x.key, iso(x.at)]);
sc.eq('③ 9일 안(12/9 정오까지): 금요(12/4) 전날 목 20:00 · 당일 07:00 · 주일(12/6) 전날 토 20:00 — 때 차례', J(due9),
  [['f|2026-12-04|-1|20:00', '2026-12-03 20:00'], ['f|2026-12-04|0|07:00', '2026-12-04 07:00'], ['a1|2026-12-06|-1|20:00', '2026-12-05 20:00']]);
sc.eq('③ 다음 때 = 가장 가까운 것 · 켠 알림이 없으면 null', [iso(A.rpNext([sunA, friA], now0)), A.rpNext([Object.assign({}, sunA, { on: false })], now0)], ['2026-12-03 20:00', null]);
const at = ms('2026-12-05T20:00');
sc.eq('③ 경계: from 은 빼고 to 는 넣음 (한 틱이 두 번 잡지 않게)', [A.rpDue([sunA], at - 1, at).length, A.rpDue([sunA], at, at + 60e3).length, A.rpDue([sunA], at, at).length], [1, 0, 0]);
sc.eq('③ 이틀 전 · 자정 넘는 것도 한국 시각으로', iso(A.rpDue([A.rpOne({ svcs: ['2'], when: [{ d: -2, t: '23:30' }] })], now0, now0 + 9 * 864e5)[0].at), '2026-12-04 23:30');

console.log('\n④ 알림 글');
const T = { sun: [
  { date: '2026-12-06', svc: '2', relay: false, cells: { '예배인도': ['한도윤'], '싱어1': ['서하늘'], '싱어2': ['유보람'], '음향 & 중계': ['문이든'], '교역자': ['나목사'], '토요모임': ['곡 연습'] } },
  { date: '2026-12-06', svc: '1', relay: true, cells: {} },
  { date: '2026-12-06', svc: 'LL', relay: false, cells: { '예배인도': ['도하율'] } }],
  fri: [{ date: '2026-12-04', name: 'AWAKE', relay: false, cells: { '예배인도': ['이가람'], '음향 & 중계': ['문이든'] } }], roles: { sun: [], fri: [] } };
const V = { sun: [{ date: '2026-12-06', svc: '2', cells: { '봉독': ['고은결'], '안내': ['전하람'], '헌금': ['박새봄', '김라온'] } }, { date: '2026-12-06', svc: 'LL', cells: { '봉독': ['정하늘'] } }], fri: [], roles: { sun: [], fri: [] } };
const base = { team: T, serve: V, date: '2026-12-06', today: '2026-12-05' };
sc.eq('④ 줄마다(기본): 제목 \'내일 부산 주일 2부\' · 한 예배면 예배 이름 없이 · 예배팀 · 예배위원 함께', J(A.rpMsg(sunA, base)), { title: '내일 부산 주일 2부', body: '예배 인도 한도윤\n음향 문이든\n봉독 고은결' });
sc.eq('④ 여러 예배면 줄 앞에 예배 이름 · 중계 예배는 \'분당 중계\' · 그 예배에 없는 갈래는 빠짐',
  A.rpMsg(A.rpOne({ svcs: ['1', '2', 'LL'], roles: ['예배 인도', '봉독'] }), base).body, '1부 분당 중계\n2부 예배 인도 한도윤\n2부 봉독 고은결\n라이프라인 예배 인도 도하율\n라이프라인 봉독 정하늘');
sc.eq('④ 한 줄로: 짧은 이름(인도) · 점으로 · 예배 이름은 LL', A.rpMsg(A.rpOne({ svcs: ['2', 'LL'], roles: ['예배 인도', '헌금'], shape: 'one' }), base).body, '2부 인도 한도윤 · 2부 헌금 박새봄, 김라온 · LL 인도 도하율');
sc.eq('④ 싱어 = 싱어1 · 싱어2 · 토요모임(할 일)은 이름이 아님 · 교역자 갈래는 책에서 온 이름(맨 위)',
  A.rpMsg(A.rpOne({ roles: ['교역자', '싱어'] }), Object.assign({}, base, { staff: ['가목사'] })).body, '교역자 가목사\n싱어 서하늘, 유보람');
sc.eq('④ 금요: 제목은 그 금요 이름 · 당일이면 \'오늘\'', J(A.rpMsg(friA, Object.assign({}, base, { date: '2026-12-04', today: '2026-12-04' }))), { title: '오늘 부산 AWAKE', body: '예배 인도 이가람' });
sc.eq('④ 고른 것이 그 날 표에 없으면 null (보내지 않음) · 표가 없어도 null · 날짜가 틀려도 null',
  [A.rpMsg(A.rpOne({ roles: ['광고'] }), base), A.rpMsg(sunA, { date: '2026-12-06' }), A.rpMsg(sunA, Object.assign({}, base, { date: '12/6' })), A.rpMsg(A.rpOne({ svcs: ['3'] }), base)], [null, null, null, null]);
const kts = [{ id: 'b1', n: '봉독위원', t: A.KT_BASE[0].t }, { id: 'k9', n: '인도', t: '{날} 2부 인도 {2부 예배 인도}\n교역자 {교역자}' }];
sc.eq('④ 카톡 글 모양: 프리셋을 ktFill 그대로 · {본문} 줄은 빠짐(알림 서버는 Monday 를 안 읽음) · {날} = 보내는 날 기준',
  A.rpMsg(A.rpOne({ shape: 'kt', kt: 'b1' }), Object.assign({ kts }, base)).body, '내일 봉독위원은 고은결 성도님이십니다.');
sc.eq('④ 카톡 글 {교역자} = 책에서 온 이름 · 프리셋이 없으면 줄마다로(고른 갈래가 없으면 기본 셋)', [A.rpMsg(A.rpOne({ shape: 'kt', kt: 'k9' }), Object.assign({ kts, staff: ['가목사'] }, base)).body, A.rpMsg(A.rpOne({ shape: 'kt', kt: 'zz' }), Object.assign({ kts }, base)).body],
  ['내일 2부 인도 한도윤\n교역자 가목사', '예배 인도 한도윤\n음향 문이든\n봉독 고은결']);
sc.eq('④ 미리보기 · 시험: 오늘부터 처음 말할 예배 날', [A.rpPreview(sunA, { team: T, serve: V, today: '2026-12-01' }).date, A.rpPreview(friA, { team: T, serve: V, today: '2026-12-01' }).date, A.rpPreview(A.rpOne({ roles: ['광고'] }), { team: T, serve: V, today: '2026-12-01' })],
  ['2026-12-06', '2026-12-04', null]);
sc.eq('④ 누르면 갈 주소 · 앱이 읽는 꼴 · 모르는 값은 무시', [A.rpLink(A.rpOne({ open: 'ppl' }), '2026-12-06'), J(A.rpLinkRead('?rp=kt&d=2026-12-06')), A.rpLinkRead('?rp=evil'), J(A.rpLinkRead('?x=1&rp=mine'))],
  ['https://sweeter.my/rotation/?rp=ppl&d=2026-12-06', { open: 'kt', date: '2026-12-06' }, null, { open: 'mine', date: '' }]);
sc.eq('④ 책을 읽어야 하는 알림만 책을 읽음(교역자 · 내 부산 주만 · 카톡 글)', [J(A.rpNeeds(sunA)), J(A.rpNeeds(A.rpOne({ roles: ['교역자'] }))), J(A.rpNeeds(A.rpOne({ when: [{ w: 'mine' }] }))), J(A.rpNeeds(A.rpOne({ shape: 'kt' })))],
  [{ book: false, kt: false }, { book: true, kt: false }, { book: true, kt: false }, { book: true, kt: true }]);

console.log('\n⑤ 서버 한 사람 처리');
const book = { people: [{ id: 'p1', name: '가목사', email: 'ga@ex.com', at: 1 }, { id: 'p2', name: '나목사', email: 'na@ex.com', at: 1 }], visits: [{ id: 'v|2026-12-06', date: '2026-12-06', who: ['p1'], at: 1 }] };
function io(o) { const n = { member: 0, tables: 0, book: 0, kts: 0 }; o = o || {};
  return { n, member: async () => (n.member++, o.member !== false), tables: async () => (n.tables++, { team: T, serve: V }), book: async () => (n.book++, book), kts: async () => (n.kts++, kts) }; }
const doc = (alerts, x) => Object.assign({ team: 'HBUID000001', email: 'ga@ex.com', ok: true, on: true, tokens: { tokA: {} }, alerts, last: at - 60e3, fired: [] }, x || {});
(async () => {
  const i1 = io(), r1 = await C.runDue(doc([sunA]), at, i1);
  sc.eq('⑤ 토 20:00 틱: 한 통 · 글 · 누르면 예배별 · 다음 때 = 다음 주 토 20:00 · 보낸 열쇠', [r1.sends.length, r1.sends[0].title, r1.sends[0].link, iso(r1.patch.at), r1.patch.fired, r1.patch.last === at],
    [1, '내일 부산 주일 2부', 'https://sweeter.my/rotation/?rp=svc&d=2026-12-06', '2026-12-12 20:00', ['a1|2026-12-06|-1|20:00'], true]);
  sc.eq('⑤ 책은 안 읽음(기본 알림) · 표는 한 번', [i1.n.book, i1.n.tables, i1.n.member], [0, 1, 1]);
  const r2 = await C.runDue(doc([sunA], { last: at - 60e3, fired: r1.patch.fired }), at + 30e3, io());
  sc.eq('⑤ 틱이 겹쳐도 두 번 안 보냄(보낸 열쇠)', r2.sends.length, 0);
  const r3 = await C.runDue(doc([sunA], { last: at - 3600e3 }), at + 11 * 60e3, io());
  sc.eq('⑤ 10분 넘게 늦은 것은 버림 — 그래도 다음 때는 셈', [r3.sends.length, iso(r3.patch.at)], [0, '2026-12-12 20:00']);
  const mine = A.rpOne({ id: 'm', roles: ['봉독'], when: [{ d: -1, t: '20:00', w: 'mine' }] });
  const r4 = await C.runDue(doc([mine]), at, io()), r5 = await C.runDue(doc([mine], { email: 'NA@ex.com' }), at, io());
  sc.eq('⑤ 내 부산 주만: 그 주 부산 일정에 든 분(가목사)만 · 이메일 대소문자 무관 · 안 든 분은 조용히(그래도 열쇠는 적음)', [r4.sends.length, r5.sends.length, r5.patch.fired.length], [1, 0, 1]);
  const i6 = io({ member: false }), r6 = await C.runDue(doc([sunA]), at, i6);
  sc.eq('⑥ 팀 명단에서 빠지면 보내지 않고 끔', [r6.sends.length, !!r6.off, r6.patch.on, r6.patch.at, i6.n.tables], [0, true, false, null, 0]);
  const i7 = io(), r7 = await C.runDue(doc([sunA]), at - 3 * 3600e3, i7);
  sc.eq('⑤ 보낼 것이 없는 틱은 아무것도 안 읽음 · 기기가 없으면 다음 때 없음', [i7.n.member + i7.n.tables + i7.n.book, (await C.runDue(doc([sunA], { tokens: {} }), at, io())).patch.at], [0, null]);
  const i8 = io(), r8 = await C.runDue(doc([A.rpOne({ id: 'k', shape: 'kt', kt: 'k9' })]), at, i8);
  sc.eq('⑤ 카톡 글: 프리셋 · 책(교역자)을 한 번씩 읽어 그 글', [r8.sends[0].body, i8.n.kts, i8.n.book], ['내일 2부 인도 한도윤\n교역자 가목사', 1, 1]);
  const t9 = await C.testMsg(friA, ms('2026-12-01T09:00'), io(), 'ga@ex.com'), t10 = await C.testMsg(A.rpOne({ roles: ['광고'] }), ms('2026-12-01T09:00'), io(), 'ga@ex.com');
  sc.eq('⑤ 시험: 다음에 말할 예배의 글을 [시험] 으로 · 없으면 그렇다고', [t9.title, t9.date, /찾지 못했습니다/.test(t10.body)], ['[시험] 12/4 부산 AWAKE', '2026-12-04', true]);
  sc.eq('⑤ 상태 글: 이 기기 포함 · 켠 기기 수 · 기기가 없으면 꺼짐', [J(C.statusOf(doc([sunA], { at: 5 }), 'tokA')), C.statusOf({}, '').on],
    [{ on: true, devices: 1, mine: true, alerts: J([sunA]), next: 5, sent: 0, err: '' }, false]);
  sc.eq('⑤ 저장: 다듬고 다음 때 · 기기가 없으면 at 없음', [iso(C.setPatch(doc([]), [{ svcs: ['2'] }], now0).at), C.setPatch({}, [{}], now0).at, C.setPatch(doc([]), [{ svcs: ['2'] }], now0).alerts[0].n], ['2026-12-05 20:00', null, '알림']);
  const f = C.fcmOf(['t'], r1.sends[0]);
  sc.eq('⑤ 메시지: Urgency high · TTL · 누르면 그 주소 · 알림마다 tag · data.type rota', [f.webpush.headers.Urgency, f.webpush.fcmOptions.link, f.webpush.notification.tag, f.data.type, f.notification.body],
    ['high', r1.sends[0].link, 'rota-a1-2026-12-06', 'rota', '예배 인도 한도윤\n음향 문이든\n봉독 고은결']);

  console.log('\n⑥ 팀인가');
  const top = { team: ['ga@ex.com'] };
  sc.eq('⑥ 주인(uid 같음) · 확인된 이메일(대소문자 무관) · 확인 안 됨 · 명단 밖 · 문서 없음 · 틀린 팀 id',
    [C.memberOk(top, { uid: 'HBUID000001' }, 'HBUID000001'), C.memberOk(top, { uid: 'u2', email: 'GA@EX.COM', ok: true }, 'HBUID000001'), C.memberOk(top, { uid: 'u2', email: 'ga@ex.com', ok: false }, 'HBUID000001'),
     C.memberOk(top, { uid: 'u3', email: 'x@ex.com', ok: true }, 'HBUID000001'), C.memberOk(null, { uid: 'u2', email: 'ga@ex.com', ok: true }, 'HBUID000001'), C.memberOk(top, { uid: 'u2', email: 'ga@ex.com', ok: true }, '../x')],
    [true, true, false, false, false, false]);

  console.log('\n⑦ 서버가 하는 일');
  const writes = SRV.split('\n').filter(l => /\.(set|update)\(/.test(l));
  sc.eq('⑦ 쓰는 곳은 rotapush/{uid} 하나(ref(…)) — 책 · 시트 표 · 프리셋 · users 에 안 씀 · 문서 지우기 없음',
    [writes.length >= 6, writes.every(l => /ref\((uid|who\.uid)\)\.(set|update)\(|tx\.update\(ref\(uid\)/.test(l)), /\)\.delete\(\)/.test(SRV.replace(/FieldValue\.delete\(\)/g, ''))], [true, true, false]);
  const code = x => x.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  sc.eq('⑦ BLOCK7 알림과 안 섞임(users · pushTokens · b7plan 없음 — 주석 빼고 코드에서) · rota 는 읽기만', [/users\/|pushTokens|b7plan/.test(code(SRV + CORE)), /doc\(`rota\/[^`]*`\)\.(set|update|delete)/.test(SRV)], [false, false]);
  sc.eq('⑦ 1분 틱(studyTick)에 얹음 · 함수 rotapush 내보냄 · 1분마다 at <= 지금 만 물음', [/require\("\.\/rotapush"\)\.rotaDue\(\)/.test(TICK), /exports\.rotapush = require\("\.\/rotapush"\)\.rotapush/.test(IDX), /where\("at", "<=", now\)/.test(SRV)], [true, true, true]);
  sc.eq('⑦ 책은 보낼 때 필요한 사람만(io.book) · 팀 확인은 team 칸만(fieldMask)', [/fieldMask: \["team"\]/.test(SRV), (SRV.match(/doc\(`rota\/\$\{team\}`\)\.get\(\)/g) || []).length], [true, 3]);
  sc.eq('⑦ 잡기(claim) 트랜잭션 · 실패하면 15분 뒤 다시', [/runTransaction/.test(SRV), /claim: now/.test(SRV), /now \+ 15 \* 60e3/.test(SRV)], [true, true, true]);

  console.log('\n⑧ 앱');
  const ui = HTML.slice(HTML.indexOf('/* ---------- 내 알림 (1123-B B4'), HTML.indexOf('/* ---------- 분당 예배위원 가져오기'));
  sc.eq('⑧ 화면 구역 · 메뉴 계정에 \'내 알림\' · 판 rpush · 알림을 누르고 들어오면 rpBack', [ui.length > 3000, /data-act="rpopen">내 알림/.test(HTML), /rpush: paneRpush/.test(HTML), /\nrpBack\(\);/.test(HTML)], [true, true, true, true]);
  sc.eq('⑧ 설정은 서버(rotapush 함수)에만 — 책 · ui · staff · 계정 문서에 안 씀', [/saveBook|cloudSave|saveUi|staffWrite|FB\.db\.collection|\.set\(|\.update\(/.test(ui), /cloudfunctions\.net\/rotapush'/.test(ui)], [false, true]);
  sc.eq('⑧ 워커 /rotation/sw.js · 범위 /rotation/ · 같은 프로젝트 키 · BLOCK7 워커와 따로', [/register\('\/rotation\/sw\.js', \{ scope: '\/rotation\/' \}\)/.test(ui), /firebase-messaging-sw/.test(ui)], [true, false]);
  sc.eq('⑧ 워커: 누르기 처리가 importScripts 보다 먼저 · /rotation/ 밖 주소는 안 엶', [SW.indexOf("addEventListener('notificationclick'") < SW.indexOf('importScripts('), /indexOf\('\/rotation\/'\) < 0\) url = '\/rotation\/'/.test(SW)], [true, true]);
  sc.eq('⑧ 교역자도 씀(staffOk · STAFF_ACTS) · 허락은 누른 자리에서 바로(앞에 기다림 없음)', [/S\.pane\.kind === 'rpush'\)\) return true/.test(HTML), /'gsback', 'rpopen'\]\);/.test(HTML), /RP\.busy = true; RP\.msg = ''; rpPaint\(\);\n  try \{\n    if \(!\('serviceWorker' in navigator\)[^\n]*\n    const perm = await Notification\.requestPermission\(\)/.test(ui)], [true, true, true]);
  sc.eq('⑧ 미리보기는 core rpMsg 로(서버와 한 벌) · 글자 막대 제목 20 · 본문 80', [/rpPreview\(a, \{ team: T, serve: V/.test(ui) && /rpMsg\(a, \{ team: T/.test(ui), /\/ 20자/.test(ui) && /\/ 80자/.test(ui)], [true, true]);
  sc.done();
})();
