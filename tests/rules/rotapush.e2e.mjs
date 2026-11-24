// 교역자 로테이션 알림 서버(wallet-functions/src/rotapush.js, 1123-B B4)를 Firestore 에뮬레이터에 붙여 실제로 돌린다.
// 로그인 토큰 확인 · 푸시 보내기(FCM)만 가짜로 바꾼다 — 데이터베이스 읽기 · 쓰기 · 트랜잭션 · 질문은 진짜.
// 이름 · 이메일은 지어낸 것. 시계는 서버의 시험 고리(_clock)로 2026-12-05(토) 저녁에.
//   cd tests/rules && npx firebase emulators:exec --only firestore --project demo-rota "node rotapush.e2e.mjs"
//   (먼저 wallet-functions/src 에서 npm install)
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), SRC = path.join(here, '..', '..', 'wallet-functions', 'src');
const require = createRequire(path.join(SRC, 'index.js'));
let pass = 0, fail = 0;
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + '\n    결과: ' + a + '\n    기대: ' + b); } };

// ── 가짜 둘: 로그인 토큰(글 = JSON) · FCM 보내기(받은 것을 모아 둠, 'dead' 등록 번호는 죽은 것으로)
const sent = [];
const stub = (id, exp) => { const f = require.resolve(id); require.cache[f] = { id: f, filename: f, loaded: true, exports: exp }; };
stub('firebase-admin/auth', { getAuth: () => ({ verifyIdToken: async (t) => { const o = JSON.parse(t); if (!o.uid) throw new Error('bad'); return o; } }) });
stub('firebase-admin/messaging', { getMessaging: () => ({ sendEachForMulticast: async (m) => { sent.push(m); return { successCount: m.tokens.filter(t => t !== 'dead').length, responses: m.tokens.map(t => (t === 'dead' ? { error: { code: 'messaging/registration-token-not-registered' } } : {})) }; } }) });
const { initializeApp } = require('firebase-admin/app');
initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-rota' });
const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const P = require(path.join(SRC, 'rotapush.js'));
const R = require(path.join(SRC, 'rotation-core.gen.js'));

let NOW = Date.parse('2026-12-05T19:50:00+09:00');
P._clock(() => NOW);
const HB = 'HBuid0000001', ST = 'STuid0000002', OUT = 'OUTuid000003';
const tok = (uid, email, ok = true) => JSON.stringify({ uid, email, email_verified: ok });
async function call(who, p, body) {
  return new Promise((resolve) => {
    const req = { method: 'POST', path: p, url: p, headers: { authorization: 'Bearer ' + who, origin: 'https://sweeter.my' }, body: body || {}, get(h) { return this.headers[h.toLowerCase()]; } };
    const hd = {}, res = { statusCode: 200, on() { }, once() { }, emit() { }, setHeader(k, v) { hd[k.toLowerCase()] = v; }, getHeader(k) { return hd[k.toLowerCase()]; }, removeHeader(k) { delete hd[k.toLowerCase()]; },
      status(c) { this.statusCode = c; return this; }, json(o) { resolve({ code: this.statusCode, body: o }); }, send(o) { resolve({ code: this.statusCode, body: o }); }, end(o) { resolve({ code: this.statusCode, body: o }); } };
    P.rotapush(req, res);
  });
}
const doc = async (p) => { const s = await db.doc(p).get(); return s.exists ? s.data() : null; };

// ── 자료: HB 책(팀 · 그 주 부산 일정에 교역자) · 시트 표 둘 · 카톡 글 프리셋
const cell = (o) => o;
await db.doc(`rota/${HB}`).set({ team: ['staff@ex.com'], b18: { people: [{ id: 'p1', name: '가목사', email: 'staff@ex.com', at: 1 }], visits: [{ id: 'v|2026-12-06', date: '2026-12-06', who: ['p1'], at: 1 }] } });
await db.doc(`rota/${HB}/gs/bteam`).set({ v: 1, h: 'x1', at: 1, n: 2, tabs: [], warn: [], roles: { sun: [], fri: [] },
  sun: [{ date: '2026-12-06', svc: '2', relay: false, cells: cell({ '예배인도': ['한도윤'], '음향 & 중계': ['문이든'] }) }, { date: '2026-12-06', svc: '1', relay: true, cells: {} }],
  fri: [{ date: '2026-12-04', name: 'AWAKE', relay: false, cells: { '예배인도': ['이가람'] } }] });
await db.doc(`rota/${HB}/gs/bserve`).set({ v: 1, h: 'x2', at: 1, n: 1, tabs: [], warn: [], roles: { sun: [], fri: [] }, sun: [{ date: '2026-12-06', svc: '2', cells: { '봉독': ['고은결'] } }], fri: [] });
await db.doc(`rota/${HB}/kt/share`).set({ v: 1, items: { k1: { n: '인도', t: '{날} 2부 인도 {2부 예배 인도} · 교역자 {교역자}', ord: 1, share: true, del: false, at: 1 } } });
const rotaBefore = JSON.stringify(await Promise.all([`rota/${HB}`, `rota/${HB}/gs/bteam`, `rota/${HB}/gs/bserve`, `rota/${HB}/kt/share`].map(doc)));

console.log('\n① 켜기 · 팀 확인');
const STK = tok(ST, 'Staff@Ex.com');
let r = await call(STK, '/on', { team: HB, token: 'tokA', ua: 'iPhone' });
eq('① 팀 교역자(이메일 대소문자 무관) 켜기 → 기본 알림 하나 · 이 기기 · 다음 때 = 토 20:00', [r.code, r.body.on, r.body.mine, r.body.alerts.map(a => a.n), new Date(r.body.next + 9 * 3600e3).toISOString().slice(0, 16)],
  [200, true, true, ['주일 섬김'], '2026-12-05T20:00']);
let d = await doc(`rotapush/${ST}`);
eq('① 서버만 쓰는 칸에 팀 · 이메일 · 등록 번호(콜론 든 열쇠도) · 책에는 안 씀', [d.team, d.email, Object.keys(d.tokens), d.ok], [HB, 'staff@ex.com', ['tokA'], true]);
r = await call(tok(OUT, 'out@ex.com'), '/on', { team: HB, token: 'tokX' });
eq('① 팀 밖 사람 → 403 · 문서 안 생김', [r.code, await doc(`rotapush/${OUT}`)], [403, null]);
r = await call(tok(OUT, 'staff@ex.com', false), '/on', { team: HB, token: 'tokX' });
eq('① 이메일 확인 안 된 계정 → 403', r.code, 403);
r = await call(tok(ST, 'staff@ex.com'), '/on', { team: 'NOPE0000000', token: 'tokA' });
eq('① 없는 팀 → 403', r.code, 403);
r = await call('{}', '/status', {});
eq('① 로그인 없음 → 401', r.code, 401);
r = await call(tok(HB, 'hb@ex.com'), '/on', { team: HB, token: 'hb:tok:1' });
eq('① HB(주인) 켜기', [r.code, r.body.devices], [200, 1]);
r = await call(STK, '/on', { team: HB, token: 'dead' });
eq('① 두 번째 기기 · 설정 그대로', [r.body.devices, r.body.alerts.length], [2, 1]);

console.log('\n② 설정 저장 · 보낼 때');
r = await call(STK, '/set', { team: HB, token: 'tokA', alerts: [R.rpDefault(), { id: 'k', n: '카톡', shape: 'kt', kt: 'k1', svcs: ['2'], when: [{ d: -1, t: '20:00' }] }, { id: 'f', n: '금요', svcs: ['fri'], roles: ['예배 인도'], when: [{ d: -1, t: '20:00' }] }, { bad: 1, svcs: 'x' }] });
eq('② 저장 → 다듬어짐(모르는 줄은 기본값으로) · 다음 때', [r.code, r.body.alerts.map(a => a.id), r.body.alerts[3].n, new Date(r.body.next + 9 * 3600e3).toISOString().slice(0, 16)], [200, ['a1', 'k', 'f', 'a2'], '알림', '2026-12-05T20:00']);
await call(tok(HB, 'hb@ex.com'), '/set', { team: HB, alerts: [{ id: 'm', n: '내 주만', svcs: ['2'], roles: ['봉독'], when: [{ d: -1, t: '20:00', w: 'mine' }] }] });
NOW = Date.parse('2026-12-05T19:59:00+09:00'); await P.rotaDue();
eq('② 때가 아니면 아무것도 안 보냄', sent.length, 0);
NOW = Date.parse('2026-12-05T20:00:20+09:00'); await P.rotaDue();
const mine = sent.filter(m => m.tokens.includes('tokA'));
eq('② 토 20:00: 교역자에게 두 통(기본 · 카톡 글) — 고른 정보가 없는 알림(a2)은 안 감 · 금요는 지난 날이라 없음', mine.map(m => [m.notification.title, m.notification.body]),
  [['내일 부산 주일 2부', '예배 인도 한도윤\n음향 문이든\n봉독 고은결'], ['내일 부산 주일 2부', '내일 2부 인도 한도윤 · 교역자 가목사']]);
eq('② 기기 둘에 함께 · 누르면 그 주 · 죽은 등록 번호는 걷어 냄', [mine[0].tokens, mine[0].webpush.fcmOptions.link, Object.keys((await doc(`rotapush/${ST}`)).tokens)], [['tokA', 'dead'], 'https://sweeter.my/rotation/?rp=svc&d=2026-12-06', ['tokA']]);
eq('② HB 의 \'내 부산 주만\' — HB 는 그 주 부산 일정에 없음 → 안 감', sent.filter(m => m.tokens.includes('hb:tok:1')).length, 0);
d = await doc(`rotapush/${ST}`);
eq('② 보낸 뒤: 다음 때 = 다음 주 목(금요 전날) · 보낸 열쇠 셋(안 간 것도 — 다시 안 봄) · 잡기 풀림', [new Date(d.at + 9 * 3600e3).toISOString().slice(0, 16), d.fired.length, d.claim === undefined, d.sent === NOW], ['2026-12-10T20:00', 3, true, true]);
const n0 = sent.length; NOW += 30e3; await P.rotaDue();
eq('② 한 번 더 틱 → 두 번 안 보냄', sent.length, n0);
eq('② 책 · 시트 표 · 프리셋은 그대로(읽기만)', JSON.stringify(await Promise.all([`rota/${HB}`, `rota/${HB}/gs/bteam`, `rota/${HB}/gs/bserve`, `rota/${HB}/kt/share`].map(doc))) === rotaBefore, true);
eq('② users · pushTokens · b7plan 안 건드림', [(await db.collection('users').get()).size, (await db.collection('b7plan').get()).size], [0, 0]);

console.log('\n③ 시험 · 상태');
r = await call(STK, '/test', { team: HB, token: 'tokA', alert: { svcs: ['fri'], roles: ['예배 인도'] } });
eq('③ 시험: 다음에 말할 예배(다음 주 금요가 표에 없으면 \'찾지 못함\')', [r.code, r.body.total, /시험 알림/.test(sent[sent.length - 1].notification.title)], [200, 1, true]);
NOW = Date.parse('2026-12-01T09:00:00+09:00');
r = await call(STK, '/test', { team: HB, alert: { svcs: ['fri'], roles: ['예배 인도'] } });
eq('③ 시험(12/1): 12/4 금요 글', [r.body.date, sent[sent.length - 1].notification.title, sent[sent.length - 1].notification.body], ['2026-12-04', '[시험] 12/4 부산 AWAKE', '예배 인도 이가람']);
NOW = Date.parse('2026-12-05T20:01:00+09:00');
r = await call(STK, '/status', { team: HB, token: 'tokA' });
eq('③ 상태: 이 기기 포함 · 기기 하나', [r.body.on, r.body.mine, r.body.devices], [true, true, 1]);

console.log('\n④ 팀에서 빠지면 · 끄기');
await db.doc(`rota/${HB}`).update({ team: [] });
await db.doc(`rotapush/${ST}`).update({ at: NOW - 1000, last: Date.parse('2026-12-12T19:59:00+09:00') });
NOW = Date.parse('2026-12-12T20:00:10+09:00'); const n1 = sent.length; await P.rotaDue();
d = await doc(`rotapush/${ST}`);
eq('④ 다음 때에 팀이 아니면 보내지 않고 끔(까닭 적음)', [sent.length - n1, d.on, d.at, /팀 명단/.test(d.err)], [0, false, null, true]);
r = await call(STK, '/set', { team: HB, alerts: [] });
eq('④ 팀이 아니면 설정 저장도 403', r.code, 403);
r = await call(tok(HB, 'hb@ex.com'), '/off', { token: 'hb:tok:1' });
d = await doc(`rotapush/${HB}`);
eq('④ 마지막 기기를 끄면 꺼짐 · 다음 때 없음 · 만든 알림은 남음', [r.code, d.on, d.at, Object.keys(d.tokens).length, d.alerts.length], [200, false, null, 0, 1]);

P._clock(null);
console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
