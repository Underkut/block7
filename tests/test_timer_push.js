// 타이머(KAIROS) 잠금 화면 알림 — 서버 규칙(wallet-functions/src/timer-core.js)을 가짜 데이터베이스 · 가짜 시계로 시험한다.
//
// 지키는 것:
//  ① /set 받을 것 — 기기 번호 · 알림 주소 · 시각 범위(지금 1분 전 ~ 3시간 10분 뒤) · 글 자르기
//  ② 1분 틱이어도 늦지 않는다 — 58초 안에 끝날 것을 잡아 끝 시각 + 2.5초에 보낸다
//  ③ 기다리는 사이 앱이 멈췄으면(지움) · 시간을 바꿨으면(새로 적음) 보내지 않는다
//  ④ 두 틱이 겹쳐도 한 번만 — 잡은 틱이 있으면 다른 틱은 건드리지 않는다 (90초 지난 잡음은 풀린 것으로)
//  ⑤ 30분 넘게 밀린 것은 보내지 않고 지운다 · 아직 먼 것은 그대로 둔다
//  ⑥ 묶음에 timerPing 이 실리고, studyTick 이 timerDue 를 함께 부른다
const fs = require('fs'), path = require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const T = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'timer-core.js'));

// ── 가짜 Firestore (문서는 기기 번호별 하나) ──
function fakeDb() {
  const docs = new Map();
  const ref = (id) => ({ id });
  const snap = (id) => ({ exists: docs.has(id), data: () => Object.assign({}, docs.get(id)) });
  return {
    docs,
    set: (id, o) => docs.set(id, Object.assign({}, o)),
    col: { where: (f, op, v) => ({ limit: () => ({ get: async () => ({ docs: [...docs.entries()].filter(([, x]) => x.at <= v).map(([id]) => ({ id, ref: ref(id), data: () => Object.assign({}, docs.get(id)) })) }) }) }) },
    runTx: async (fn) => fn({
      get: async (r) => snap(r.id),
      update: (r, o) => docs.set(r.id, Object.assign({}, docs.get(r.id), o)),
      delete: (r) => docs.delete(r.id),
    }),
  };
}
// 가짜 시계 — sleep 은 시계를 앞으로 돌리고, 그 사이 끼어들 일(during)을 한 번 부른다
function deps(db, t0, during) {
  const clk = { t: t0 }, sent = [];
  return {
    clk, sent,
    d: { col: db.col, runTx: db.runTx, now: () => clk.t,
      sleep: async (ms) => { clk.t += ms; if (during) { const f = during; during = null; await f(); } },
      send: async (tok, title, body) => { sent.push({ tok, title, body, t: clk.t }); return true; } },
  };
}
const NOW = Date.UTC(2026, 9, 24, 3, 0, 0);
const DOC = (at, x) => Object.assign({ tok: 'tokA', at, title: '집중 25분 끝났어요', body: 'KAIROS' }, x || {});

// ① /set
{
  const ok = T.checkSet({ dev: 'abc123xyz', tok: 'tok-1', at: NOW + 25 * 60e3, title: '  집중 25분 끝났어요\n', body: 'x'.repeat(200) }, NOW);
  sc.eq('① 정상 — 그대로 받는다', [ok.dev, ok.doc.at, ok.doc.title, ok.doc.body.length], ['abc123xyz', NOW + 25 * 60e3, '집중 25분 끝났어요', 80]);
  sc.eq('① 기기 번호가 이상하면 거절', T.checkSet({ dev: '../x', tok: 't', at: NOW + 1e3 }, NOW).err, 'dev');
  sc.eq('① 알림 주소가 없으면 거절', T.checkSet({ dev: 'abc123', tok: '', at: NOW + 1e3 }, NOW).err, 'tok');
  sc.eq('① 3시간 10분보다 먼 것은 거절', T.checkSet({ dev: 'abc123', tok: 't', at: NOW + 200 * 60e3 }, NOW).err, 'at');
  sc.eq('① 1분 넘게 지난 시각은 거절', T.checkSet({ dev: 'abc123', tok: 't', at: NOW - 2 * 60e3 }, NOW).err, 'at');
  sc.eq('① 세 바퀴(180분)는 받는다', T.checkSet({ dev: 'abc123', tok: 't', at: NOW + 180 * 60e3 }, NOW).err, undefined);
  sc.eq('① 제목이 비면 기본 문구', T.checkSet({ dev: 'abc123', tok: 't', at: NOW + 1e3 }, NOW).doc.title, '타이머가 끝났어요');
}

// ② 40초 뒤에 끝날 것 — 이번 틱이 잡아 끝 시각 + 2.5초에 보낸다
(async () => {
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 40e3));
    const { d, sent } = deps(db, NOW);
    const n = await T.due(d);
    sc.eq('② 58초 안에 끝날 것은 이번 틱에 보낸다', n, 1);
    sc.eq('② 보낸 시각 = 끝 + 2.5초 (1분 늦지 않다)', sent[0] && sent[0].t - (NOW + 40e3), 2500);
    sc.eq('② 보낸 뒤 문서는 지운다', db.docs.has('dev1'), false);
  }
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 5 * 60e3));
    const { d, sent } = deps(db, NOW);
    await T.due(d);
    sc.eq('⑤ 아직 먼 것(5분 뒤)은 건드리지 않는다', [sent.length, db.docs.has('dev1'), db.docs.get('dev1').claim], [0, true, undefined]);
  }
  // ③ 기다리는 사이 앱이 멈춤 → 지움
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 30e3));
    const { d, sent } = deps(db, NOW, async () => db.docs.delete('dev1'));
    await T.due(d);
    sc.eq('③ 기다리는 사이 멈췄으면(지움) 안 보낸다', sent.length, 0);
  }
  // ③ 기다리는 사이 +5분 → 앱이 새로 적음(잡음 표시가 사라짐)
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 30e3));
    const { d, sent } = deps(db, NOW, async () => db.set('dev1', DOC(NOW + 30e3 + 5 * 60e3)));
    await T.due(d);
    sc.eq('③ 기다리는 사이 시간을 바꿨으면 안 보내고', sent.length, 0);
    sc.eq('③ 새 시각은 남아 다음 틱이 맡는다', db.docs.has('dev1') && db.docs.get('dev1').at, NOW + 30e3 + 5 * 60e3);
  }
  // ③ 같은 시각으로 다시 적어도(잡음이 사라짐) 다음 틱이 보낸다 — 잃지 않는다
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 30e3));
    const a = deps(db, NOW, async () => db.set('dev1', DOC(NOW + 30e3)));
    await T.due(a.d);
    const b = deps(db, NOW + 60e3);
    await T.due(b.d);
    sc.eq('③ 같은 시각을 다시 적어도 한 번은 간다', a.sent.length + b.sent.length, 1);
  }
  // ④ 두 틱이 겹칠 때 — 앞 틱이 잡고 기다리는 동안 다음 틱이 돈다
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW + 50e3));
    let second = null;
    const a = deps(db, NOW, async () => { const b = deps(db, NOW + 52e3); second = b; await T.due(b.d); });
    await T.due(a.d);
    sc.eq('④ 겹친 틱은 잡힌 것을 건드리지 않는다 — 한 번만', a.sent.length + second.sent.length, 1);
  }
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW - 10e3, { claim: NOW - 120e3, by: 'dead' }));
    const { d, sent } = deps(db, NOW);
    await T.due(d);
    sc.eq('④ 죽은 틱의 잡음(90초 넘음)은 풀어서 보낸다', sent.length, 1);
  }
  // ⑤ 오래 밀린 것
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW - 40 * 60e3));
    const { d, sent } = deps(db, NOW);
    await T.due(d);
    sc.eq('⑤ 30분 넘게 밀린 것은 보내지 않고 지운다', [sent.length, db.docs.has('dev1')], [0, false]);
  }
  {
    const db = fakeDb(); db.set('dev1', DOC(NOW - 20e3)); db.set('dev2', DOC(NOW + 10e3, { tok: 'tokB' }));
    const { d, sent } = deps(db, NOW);
    await T.due(d);
    sc.eq('⑤ 조금 밀린 것(20초)과 곧 끝날 것을 함께 보낸다', sent.map((x) => x.tok).sort(), ['tokA', 'tokB']);
  }

  // ⑥ 묶음
  const src = (f) => fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', f), 'utf8');
  sc.eq('⑥ 묶음에 timerPing 이 실린다', /exports\.timerPing\s*=\s*require\("\.\/timer"\)\.timerPing/.test(src('index.js')), true);
  sc.eq('⑥ studyTick 이 timerDue 를 함께 부른다', /studyTick[\s\S]{0,400}require\("\.\/timer"\)\.timerDue\(\)/.test(src('study.js')), true);
  sc.eq('⑥ studyTick 은 기다릴 시간이 있다 (120초)', /studyTick = onSchedule\(\{[^}]*timeoutSeconds: 120/.test(src('study.js')), true);
  sc.done();
})();
