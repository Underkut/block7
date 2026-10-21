// 용돈 친구들(wallet/index.html) 백업 파일 이름 — D-3 (HB 2026-10-21)
//
//   Wa-{가족 주인 이메일 앞 3글자}-{아이 이름}-{기기}-{YY}-{MMDD}-{그날 번호}.json
//   예) Wa-hbk-지민-phn-26-1021-1.json
//
// 번호는 아이마다 · 날마다 1부터, 아이 폰과 부모 폰이 이어 센다(아이 폰 1 → 부모 폰 2).
// 오프라인(가족 연결 안 됨 · 인터넷 끊김)이면 off+HHMM, 번호표는 그대로.
// 자동 백업은 auto, 불러오기 직전은 undo.
// ⚠️ 이름은 지어낸 것이다.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'wallet', 'index.html'), 'utf8');
const A = HTML.indexOf('/* ───────── 백업 파일 이름 (D-3'), B = HTML.indexOf('/* ───────── 자동 백업', A);
if (A < 0 || B < 0) { console.error('백업 파일 이름 구간을 못 찾았습니다'); process.exit(2); }
const CODE = HTML.slice(A, B);

const UA = {
  galaxy: { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918N) Mobile', maxTouchPoints: 5 },
  iphone: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', maxTouchPoints: 5 },
  ipad: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5 },
  mac: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 },
};
// 한 기기. cloud = 가족 클라우드(아이 사본 · 부모님 members 의 bak) 흉내
function phone(opt) {
  const now = opt.now || new Date(2026, 9, 21, 15, 34);
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(now.getTime()); } }
  const ctx = {
    Date: FakeDate, navigator: Object.assign({ onLine: opt.online !== false }, UA[opt.ua || 'galaxy']),
    screen: { width: 412, height: 915 }, pad2: n => String(n).padStart(2, '0'),
    S: opt.S || {}, FAM: opt.FAM === undefined ? null : opt.FAM, PAR: opt.PAR || { kids: [] },
    writes: [], famSave() {},
  };
  ctx.fbLoad = () => Promise.resolve();
  ctx.memRef = () => ({ update: o => { ctx.writes.push(o); return Promise.resolve(); } });
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx);
  return ctx;
}
const run = (ctx, js) => vm.runInContext(js, ctx);
let PAR_PHONE = null;
const KID = { fid: 'fam1', role: 'kid', kidId: 'k1', name: '지민', pemail: 'hbkim@gmail.com', pbak: [] };
const PARENT = () => ({ fid: 'fam1', role: 'parent', email: 'mom@gmail.com' });

console.log('시나리오 1 — 아이 폰: 같은 날 연속 저장은 1, 2');
{
  const c = phone({ FAM: Object.assign({}, KID) });
  sc.eq('첫 저장', run(c, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1021-1.json');
  sc.eq('두 번째', run(c, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1021-2.json');
  sc.eq('번호표는 아이 기록 안에', JSON.parse(JSON.stringify(c.S.bak)), { d: '261021', n: 2 });
}

console.log('\n시나리오 2 — 아이 폰 1 → 부모 폰 2 → 아이 폰 3 (두 기기 이어짐)');
{
  const kid = phone({ FAM: Object.assign({}, KID) });
  sc.eq('아이 폰', run(kid, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1021-1.json');
  // 부모 폰은 클라우드 사본으로 아이 번호표를 본다
  const par = phone({ ua: 'iphone', FAM: PARENT(), PAR: { kids: [], bakMail: 'hbkim@gmail.com' } });
  const k = { id: 'k1', name: '지민', st: { bak: JSON.parse(JSON.stringify(kid.S.bak)) } };
  par.K = k;
  sc.eq('부모 폰은 2', run(par, 'bakNamePar(K)'), 'Wa-hbk-지민-phn-26-1021-2.json');
  PAR_PHONE = par;   // 쓰기는 파이어베이스를 불러온 뒤(비동기) — 맨 끝에서 본다
  sc.eq('부모 폰 연속 저장은 3', run(par, 'bakNamePar(K)'), 'Wa-hbk-지민-phn-26-1021-3.json');
  // 아이 폰이 설정을 열 때 부모님 번호표를 받아 둔다(bakPeek) → 다음은 4
  kid.FAM.pbak = [{ d: '261021', n: 3 }];
  sc.eq('아이 폰은 이어서 4', run(kid, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1021-4.json');
}

console.log('\n시나리오 3 — 날짜가 바뀌면 1부터 (어제 번호표는 안 센다)');
{
  const c = phone({ now: new Date(2026, 9, 22, 7, 0), S: { bak: { d: '261021', n: 9 } }, FAM: Object.assign({}, KID, { pbak: [{ d: '261021', n: 12 }] }) });
  sc.eq('다음 날 첫 저장', run(c, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1022-1.json');
}

console.log('\n시나리오 4 — 오프라인이면 off+HHMM, 번호표는 그대로');
{
  const c = phone({ online: false, now: new Date(2026, 9, 21, 9, 5), S: { bak: { d: '261021', n: 2 } }, FAM: Object.assign({}, KID) });
  sc.eq('인터넷 끊김', run(c, 'bakNameKid()'), 'Wa-hbk-지민-phn-26-1021-off0905.json');
  sc.eq('번호표 안 올림', JSON.parse(JSON.stringify(c.S.bak)), { d: '261021', n: 2 });
  const lone = phone({ FAM: null, S: {} });
  sc.eq('가족 연결 안 됨', run(lone, 'bakNameKid()'), 'Wa-usr-아이-phn-26-1021-off1534.json');
  sc.eq('… 번호표 없음', lone.S.bak, undefined);
  const par = phone({ online: false, FAM: PARENT(), PAR: { kids: [] } });
  par.K = { id: 'k1', name: '지민', st: {} };
  sc.eq('부모 폰 오프라인 (가족 주인 이메일을 아직 모르면 내 이메일)', run(par, 'bakNamePar(K)'), 'Wa-mom-지민-phn-26-1021-off1534.json');
  sc.eq('… 쓰지 않는다', par.writes.length, 0);
}

console.log('\n시나리오 5 — 자동 백업 · 불러오기 직전 · 아이 이름 다듬기');
{
  const c = phone({ FAM: Object.assign({}, KID, { name: '김 지-민' }) });
  sc.eq('자동 백업 = 찍은 날 + auto', run(c, "bakAutoName({d:'2026-10-19', at:0})"), 'Wa-hbk-김지민-phn-26-1019-auto.json');
  sc.eq('불러오기 직전 = 찍은 때 + undo', run(c, "bakAutoName({d:'undo', at:new Date(2026,9,20,8,0).getTime()})"), 'Wa-hbk-김지민-phn-26-1020-undo.json');
  sc.eq('자동 백업은 번호표를 안 건드린다', c.S.bak, undefined);
}

console.log('\n시나리오 6 — 기기 판정');
{
  const k = u => run(phone({ ua: u }), 'bakDev()');
  sc.eq('안드로이드 폰 · 아이폰 · 아이패드 · 맥', [k('galaxy'), k('iphone'), k('ipad'), k('mac')], ['phn', 'phn', 'pad', 'pc']);
}

console.log('\n시나리오 7 — 화면에 이어져 있다');
{
  sc.eq('아이 폰 파일 저장이 새 이름을 쓴다', /\$\('bkFile'\)\.onclick = \(\) => \{ saveTextFile\(backupText\(\), bakNameKid\(\)\)/.test(HTML), true);
  sc.eq('부모 폰 아이 기록 저장이 새 이름을 쓴다', HTML.includes('saveTextFile(backupText(k.st), bakNamePar(k))'), true);
  sc.eq('자동 백업 파일이 새 이름을 쓴다', HTML.includes('saveTextFile(r.text, bakAutoName(r))'), true);
  sc.eq('옛 이름이 남아 있지 않다', /용돈친구들-(자동)?백업-/.test(HTML), false);
  sc.eq('불러와도 번호표는 이 폰 것을 지킨다', HTML.includes('S = Object.assign(n, {lastBackup:S.lastBackup, bak:S.bak})'), true);
  const rules = fs.readFileSync(path.join(__dirname, '..', 'docs', 'study', 'firebase-setup.md'), 'utf8');
  sc.eq('보안 규칙 문서: members 갱신 허용 키에 bak', rules.includes("hasOnly(['pname', 'notify', 'tokens', 'stokens', 'bak'])"), true);
}

setTimeout(() => {
  console.log('\n시나리오 2 (이어서) — 부모 폰은 제 members 문서에 적는다');
  sc.eq('적은 번호표 2 · 3', JSON.parse(JSON.stringify(PAR_PHONE.writes)), [{ 'bak.k1': { d: '261021', n: 2 } }, { 'bak.k1': { d: '261021', n: 3 } }]);
  sc.done();
}, 0);
