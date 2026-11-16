// 교역자 로테이션 R13 — 예배팀 일정 받기 서버(gcal-functions/src/worship-core.js · worship.js) — 지어낸 이름 · id (공개 저장소)
//
// 지키는 것:
//   ① 읽기만 · 열쇠는 Secret Manager(SCHEDULE_API_KEY)에서만 — 코드에 값이 없고 로그 · 저장 · 응답에 열쇠가 나가지 않는다
//   ② 인도자는 모두 · 팀원은 우리 명단에 든 분만 (나머지 이름은 저장되지 않는다)
//   ③ 맞추기: 처음은 이름(띄어쓰기 무시) · 그 뒤로는 id · 같은 이름 둘이면 맞추지 않고 dup
//   ④ 기간 통째로 바꿔 끼우기 · 받기 실패면 마지막 자료 그대로 + err
//   ⑤ 지금 받기: 로그인 · 자기 문서만 · 10분에 한 번 · 2시간마다(하루 12번, 한도 100)
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const DIR = path.join(__dirname, '..', 'gcal-functions', 'src');
const C = require(path.join(DIR, 'worship-core.js'));
const SRV = fs.readFileSync(path.join(DIR, 'worship.js'), 'utf8');
const IDX = fs.readFileSync(path.join(DIR, 'index.js'), 'utf8');
const J = (v) => JSON.parse(JSON.stringify(v));

// 명세 5.1 예시 모양 (이름 · id 지어냄)
const W1 = 'aaaaaaaa-0000-0000-0000-000000000001', W2 = 'aaaaaaaa-0000-0000-0000-000000000002', W3 = 'aaaaaaaa-0000-0000-0000-000000000003', W4 = 'aaaaaaaa-0000-0000-0000-000000000004';
const RESP = {
  generatedAt: '2026-11-16T14:05:00+09:00', from: '2026-11-16', to: '2026-12-31',
  services: [
    { date: '2026-11-18', time: '10:00', serviceId: 'sv-1', service: '수요예배', special: false, status: 'confirmed', updatedAt: 'x',
      leaders: [{ id: W1, name: '김인도' }],
      members: [{ id: W1, name: '김인도', part: '리더' }, { id: W2, name: '조 목사', part: 'A.G' }, { id: W3, name: '박싱어', part: '싱어' }] },
    { date: '2026-11-22', time: null, serviceId: 'sv-2', service: '주일 2부', special: false, status: 'changed', updatedAt: 'y',
      leaders: [{ id: W2, name: '조목사' }],
      members: [{ id: W2, name: '조목사', part: '리더' }, { id: W3, name: '박싱어', part: '싱어' }] },
    { date: '2026-12-12', time: '20:00', serviceId: 'sv-3', service: '워십나잇', special: true, status: 'tentative', updatedAt: 'z',
      leaders: [], members: [{ id: W2, name: '조목사', part: '베이스' }] },
  ],
};
const WKEYS = { p1: ['조목사'], p2: ['홍교역', '홍 전도사'] };   // 우리 명단: 조목사(교역자) · 홍교역 — 김인도 · 박싱어는 없음

console.log('\n① 읽기만 · 열쇠');
{
  sc.eq('① 주소는 명세 그대로', C.API, 'https://tlcworship.gabia.io/api/external/schedule');
  sc.eq('① 열쇠는 Secret Manager 이름으로만', /defineSecret\("SCHEDULE_API_KEY"\)/.test(SRV), true);
  sc.eq('① 코드에 열쇠 같은 값이 없다', /Bearer [A-Za-z0-9]{12,}/.test(SRV + fs.readFileSync(path.join(DIR, 'worship-core.js'), 'utf8')), false);
  sc.eq('① GET 만 (method · body 를 보내지 않음)', /method:\s*"(POST|PUT|PATCH|DELETE)"|body:/.test(SRV.slice(SRV.indexOf('async function fetchSchedule'), SRV.indexOf('async function pullOne'))), false);
  sc.eq('① 로그에 열쇠 · 응답을 남기지 않는다', [...SRV.matchAll(/console\.\w+\(([^)]*)\)/g)].every(m => !/KEY|resp|value/.test(m[1])), true);
  sc.eq('① gcal 묶음이 함께 내보낸다', /exports\.worshipPull = require\("\.\/worship"\)\.worshipPull/.test(IDX) && /exports\.worship = require\("\.\/worship"\)\.worship/.test(IDX), true);
  sc.eq('① 두 함수 모두 열쇠를 쓴다고 밝힘(secrets)', (SRV.match(/secrets: \[KEY\]/g) || []).length, 2);
}

console.log('\n② ③ 거르기 · 맞추기');
{
  const d = C.digest(RESP, WKEYS, {});
  sc.eq('③ 이름(띄어쓰기 무시)으로 처음 맞춤', d.map, { [W2]: 'p1' });
  sc.eq('② 인도자는 모두 (이름 · 예배팀 id, 맞춘 분은 사람 id)', d.services.map(s => s.leaders), [[{ w: W1, name: '김인도' }], [{ w: W2, name: '조목사', pid: 'p1' }], []]);
  sc.eq('② 팀원은 우리 명단에 든 분만 (사람 id · 파트)', d.services.map(s => s.members), [[{ pid: 'p1', part: 'A.G' }], [{ pid: 'p1', part: '리더' }], [{ pid: 'p1', part: '베이스' }]]);
  sc.eq('② 명단 밖 팀원 이름은 저장 모양 어디에도 없다', JSON.stringify(d).includes('박싱어'), false);
  sc.eq('② 예배 칸', d.services.map(s => [s.date, s.time, s.sid, s.service, s.special, s.status]), [
    ['2026-11-18', '10:00', 'sv-1', '수요예배', false, 'confirmed'], ['2026-11-22', null, 'sv-2', '주일 2부', false, 'changed'], ['2026-12-12', '20:00', 'sv-3', '워십나잇', true, 'tentative']]);
  sc.eq('② 기간 · 만든 때', [d.from, d.to, d.gen], ['2026-11-16', '2026-12-31', '2026-11-16T14:05:00+09:00']);
  // 그 뒤로는 id 로 — 그쪽 이름 표기가 바뀌어도
  const r2 = J(RESP); r2.services[1].leaders[0].name = '조 ○○'; r2.services[1].members[0].name = '조 ○○';
  sc.eq('③ 한 번 맞춘 뒤로는 id 로 (이름이 바뀌어도)', C.digest(r2, WKEYS, d.map).services[1].leaders[0].pid, 'p1');
  sc.eq('③ 명단에서 빠진 분의 맞춤은 버린다', C.digest(RESP, { p2: ['홍교역'] }, d.map).map, {});
  // 같은 이름 둘
  const r3 = J(RESP); r3.services[2].members.push({ id: W4, name: '조목사', part: '드럼' });
  const d3 = C.digest(r3, WKEYS, {});
  sc.eq('③ 예배팀에 같은 이름이 둘이면 맞추지 않고 dup', [d3.map, d3.dup], [{}, ['조목사']]);
  const d4 = C.digest(RESP, { p1: ['조목사'], p3: ['조목사'] }, {});
  sc.eq('③ 우리 명단에 같은 이름이 둘이어도 dup', [d4.map, d4.dup], [{}, ['조목사']]);
  sc.eq('③ dup 이면 그 팀원도 저장하지 않는다', d4.services.every(s => !s.members.length), true);
  sc.eq('③ 한 사람은 예배팀 id 하나와만', C.digest(r3, WKEYS, { [W2]: 'p1' }).map, { [W2]: 'p1' });
}

console.log('\n②-2 모양 지키기');
{
  sc.eq('모양이 아니면 shape 오류', (() => { try { C.digest({ services: 1 }, {}, {}); return 'ok'; } catch (e) { return e.code; } })(), 'shape');
  const bad = J(RESP); bad.services.push({ date: '2026-02-30', serviceId: 'sv-x', leaders: [], members: [] }, { date: '2026-11-20', serviceId: 'bad id!', leaders: [], members: [] }, null);
  sc.eq('날짜 · id 가 틀린 예배는 뺀다', C.digest(bad, WKEYS, {}).services.length, 3);
  const st = J(RESP); st.services[0].status = 'weird';
  sc.eq('모르는 확정 표시는 미정으로(확정이라 짐작하지 않음)', C.digest(st, WKEYS, {}).services[0].status, 'tentative');
  const lg = J(RESP); lg.services[0].leaders[0].name = '가'.repeat(80);
  sc.eq('이름은 30자에서 자름', C.digest(lg, WKEYS, {}).services[0].leaders[0].name.length, 30);
  sc.eq('오류 표시 (열쇠 · 한도 · 꺼짐 · 서버)', [401, 403, 429, 503, 500].map(C.errOf), ['key', 'key', 'limit', 'off', 'server']);
}

console.log('\n④ ⑤ 서버');
{
  const store = {}; let fetches = [], reply = { status: 200, body: RESP }, sched = null, handler = null, schedOpt = null;
  const docRef = (p) => ({
    get: async () => ({ exists: p in store, get: (k) => (store[p] || {})[k], data: () => store[p] }),
    set: async (v, o) => { store[p] = o && o.merge ? Object.assign({}, store[p] || {}, v) : J(v); },
  });
  const users = { tokHB: { uid: 'hbUID0001' }, tokST: { uid: 'stUID0001' } };
  const fakeRequire = (m) => ({
    'firebase-functions/v2/https': { onRequest: (opt, fn) => { handler = fn; return fn; } },
    'firebase-functions/v2/scheduler': { onSchedule: (opt, fn) => { sched = fn; schedOpt = opt; return fn; } },
    'firebase-functions/params': { defineSecret: (n) => ({ value: () => n === 'SCHEDULE_API_KEY' ? 'SECRET-VALUE-XYZ' : '' }) },
    'firebase-admin/firestore': { getFirestore: () => ({ doc: docRef, collection: (c) => ({ where: (f, op, v) => ({ limit: () => ({ get: async () => ({ docs: Object.keys(store).filter(k => k.startsWith(c + '/') && k.split('/').length === 2 && store[k][f] === v).map(k => ({ id: k.split('/')[1] })) }) }) }) }) }) },
    'firebase-admin/auth': { getAuth: () => ({ verifyIdToken: async (t) => { if (!users[t]) throw new Error('bad'); return users[t]; } }) },
    './worship-core': C,
  })[m];
  const logs = [];
  const fakeFetch = async (url, o) => { fetches.push({ url, o }); return { status: reply.status, ok: reply.status < 300, json: async () => J(reply.body) }; };
  const ctx = { require: fakeRequire, exports: {}, module: {}, fetch: fakeFetch, console: { error: (...a) => logs.push(a.join(' ')), log: (...a) => logs.push(a.join(' ')) }, Date, JSON, Object, String, Array, Error, Promise, Math };
  vm.createContext(ctx); vm.runInContext(SRV, ctx);
  const call = async (p, tok) => {
    const out = { code: 200, body: null };
    const res = { status(c) { out.code = c; return this; }, json(v) { out.body = J(v); } };
    await handler({ path: p, method: 'POST', headers: tok ? { authorization: 'Bearer ' + tok } : {}, body: {} }, res);
    return out;
  };
  (async () => {
    sc.eq('⑤ 2시간마다 · 서울 시각', [schedOpt.schedule, schedOpt.timeZone], ['every 2 hours', 'Asia/Seoul']);
    sc.eq('⑤ 하루 부르는 수 ≤ 한도 100', 24 / 2 <= 100, true);
    store['rota/hbUID0001'] = { wpull: true, wkeys: WKEYS };
    store['rota/offUID001'] = { wkeys: WKEYS };   // 켜지 않은 문서
    await sched();
    sc.eq('④ 켠 문서만 한 번 받는다', fetches.length, 1);
    sc.eq('① 열쇠는 헤더로만', [fetches[0].url, fetches[0].o.headers.Authorization], [C.API, 'Bearer SECRET-VALUE-XYZ']);
    const e1 = store['rota/hbUID0001/ext/worship'];
    sc.eq('④ 저장 = 받은 기간 통째로 (서버만 쓰는 따로 문서)', [e1.from, e1.to, e1.services.length, !!e1.at, 'rota/offUID001/ext/worship' in store], ['2026-11-16', '2026-12-31', 3, true, false]);
    sc.eq('① 저장에 열쇠가 없다', JSON.stringify(store).includes('SECRET-VALUE'), false);
    sc.eq('④ 책(rota/{uid})은 건드리지 않는다', J(store['rota/hbUID0001']), { wpull: true, wkeys: WKEYS });
    // 다음 응답에서 배정 하나가 빠지고 기간이 밀림 → 바꿔 끼움(덧붙이지 않음)
    reply = { status: 200, body: Object.assign(J(RESP), { from: '2026-11-19', services: J(RESP).services.slice(1) }) };
    await sched();
    const e2 = store['rota/hbUID0001/ext/worship'];
    sc.eq('④ 빠진 배정 · 지난 날짜는 사라진다(통째로 바꿔 끼움)', [e2.from, e2.services.map(s => s.date)], ['2026-11-19', ['2026-11-22', '2026-12-12']]);
    sc.eq('④ 맞춤(map)은 이어진다', e2.map, { [W2]: 'p1' });
    reply = { status: 500, body: {} };
    await sched();
    const e3 = store['rota/hbUID0001/ext/worship'];
    sc.eq('④ 받기 실패면 마지막 자료 그대로 + err', [e3.services.length, e3.err, !!e3.errAt], [2, 'server', true]);
    sc.eq('① 로그에 열쇠가 없다', logs.join('|').includes('SECRET'), false);
    reply = { status: 200, body: RESP };
    // 지금 받기
    sc.eq('⑤ 로그인 없으면 401', (await call('/now', null)).code, 401);
    const f0 = fetches.length;
    sc.eq('⑤ 방금 받았으면(10분 안) 부르지 않는다', [(await call('/now', 'tokHB')).body.wait, fetches.length], [true, f0]);
    store['rota/hbUID0001/ext/worship'].at = 1; store['rota/hbUID0001/ext/worship'].errAt = 1;
    const ok = await call('/now', 'tokHB');
    sc.eq('⑤ 10분 지나면 받는다', [ok.code, ok.body.ok, fetches.length], [200, true, f0 + 1]);
    sc.eq('⑤ err 는 성공하면 사라진다', 'err' in store['rota/hbUID0001/ext/worship'], false);
    sc.eq('⑤ 교역자(문서 주인 아님)는 남의 것을 못 부른다', [(await call('/now', 'tokST')).code, fetches.length], [404, f0 + 1]);
    sc.eq('⑤ 응답에 열쇠가 없다', JSON.stringify(ok.body).includes('SECRET'), false);
    reply = { status: 401, body: {} }; store['rota/hbUID0001/ext/worship'].at = 1;
    const k = await call('/now', 'tokHB');
    sc.eq('⑤ 열쇠가 틀리면 key', [k.code, k.body.code], [502, 'key']);
    sc.done();
  })();
}
