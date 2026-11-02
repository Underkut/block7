// 용돈 친구들 — 부모님의 '아이 기록 초기화' (금액만 / 구조까지)
// 시나리오: 1 금액만 → 금액은 0 · 구조는 그대로  2 구조까지 → 처음 모습 + 이어받을 것은 남음
//           3 원본을 건드리지 않는다  4 이름(FAM.name)은 S 밖이라 그대로  5 빈 기기 방어가 막지 않게 FAM.cloudTx 0
// ⚠️ 이름·금액은 지어낸 것이다.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const HTML = fs.readFileSync(path.join(__dirname, '..', 'wallet', 'index.html'), 'utf8');
const A = HTML.indexOf('const RESET_KEEP'), B = HTML.indexOf('function kidResetSheet', A);
if (A < 0 || B < 0) { console.error('초기화 구간을 못 찾았습니다'); process.exit(2); }
const mk = o => Object.assign({ undoSaved: 0, saved: 0, famSaved: 0 }, o);
function env(S, FAM) {
  const ctx = { S, FAM, blank: () => ({ tx: [], plans: [], alloc: { cash: {}, card: {}, bank: {} }, tiles: ['기본칸'], goals: [], chk: {}, badges: {}, cps: [], givers: ['기본사람'], gone: {}, exp: [], waits: [], held: 0, applied: [], pin: null, theme: null, mute: false }),
    backupText: () => 'x', bakPut: () => Promise.resolve(), famSave() { ctx.famSaved++; }, save() { ctx.saved++; }, famSaved: 0, saved: 0 };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'wallet', 'index.html'), 'utf8').slice(A, B).replace(/^const /m, 'var '), ctx); return ctx;
}
const kid = () => ({ tx: [{ id: 'a', t: 'in', amt: 5000 }], plans: [{ id: 'p' }], alloc: { cash: { snack: 3000 }, card: {}, bank: {} }, tiles: ['간식', '내가만든칸'], goals: [{ k: 'g1', n: '자전거', price: 90000, done: true, doneAt: '2026-10-01', ok: true }],
  chk: { '2026-10-01': { s: 'y', g: 'y' } }, badges: { b1: '2026-10-01' }, cps: [{ id: 'c1', used: '2026-10-02' }], givers: ['이모'], gone: { old: 1 }, exp: [{ id: 'e', amt: 2000 }], waits: [{ id: 'w' }], held: 1500,
  applied: ['m1', 'm2'], pin: { h: '1', r: '2' }, theme: 'sky', mute: true, bak: { d: '261101', n: 1 } });

const s1 = env(kid(), { role: 'kid', name: '지민', cloudTx: 7, blocked: true });
s1.kidResetApply('money'); const a = s1.S;
sc.eq('1 금액: 기록·계획·예정·아낀돈 0', [a.tx.length, a.plans.length, a.exp.length, a.held, JSON.stringify(a.alloc), JSON.stringify(a.gone)], [0, 0, 0, 0, '{"cash":{},"card":{},"bank":{}}', '{}']);
sc.eq('1 구조는 그대로', [a.tiles.length, a.givers[0], a.cps.length, a.cps[0].used, Object.keys(a.badges).length, Object.keys(a.chk).length, a.waits.length], [2, '이모', 1, '2026-10-02', 1, 1, 1]);
sc.eq('1 목표는 남고 달성 표시만 풀림', [a.goals.length, a.goals[0].n, a.goals[0].price, a.goals[0].done, a.goals[0].ok, a.goals[0].doneAt], [1, '자전거', 90000, false, false, null]);
sc.eq('5 빈 기기 방어가 막지 않음', [s1.FAM.cloudTx, s1.FAM.blocked, s1.saved >= 1], [0, false, true]);
sc.eq('4 이름 그대로', s1.FAM.name, '지민');

const s2 = env(kid(), { role: 'kid', name: '지민', cloudTx: 7 });
s2.kidResetApply('all'); const b = s2.S;
sc.eq('2 구조까지: 칸·목표·이름표·쿠폰·별·배지 처음으로', [b.tiles, b.goals.length, b.givers, b.cps.length, Object.keys(b.chk).length, Object.keys(b.badges).length, b.waits.length, b.tx.length, b.held], [['기본칸'], 0, ['기본사람'], 0, 0, 0, 0, 0, 0]);
sc.eq('2 이어받을 것은 남음(applied·잠금·꾸밈·소리·번호표)', [b.applied, b.pin, b.theme, b.mute, b.bak], [['m1', 'm2'], { h: '1', r: '2' }, 'sky', true, { d: '261101', n: 1 }]);

const o = kid(); const r = env(o, null).resetPick(o, 'money', {});
sc.eq('3 원본은 안 건드림', [o.tx.length, o.goals[0].done, o.held], [1, true, 1500]);
sc.done();
