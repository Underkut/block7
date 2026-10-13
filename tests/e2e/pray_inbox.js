// BLOCK7 '기도 노트로' → 기도노트 우체통(pray/{uid}/c/inbox) — 진짜 브라우저 두 대 + 에뮬레이터.
// ⚠️ check.sh 가 돌리지 않는다. 준비 · 돌리기는 tests/e2e/pray_sync.js 머리말과 같다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/pray_inbox.js
// 지키는 것:
//  ① BLOCK7 이 쓰는 그 모양(arrayUnion 한 줄)으로 넣으면 열려 있는 기도노트가 받아 그룹 맨 위에 넣고 우체통을 비운다
//  ② ⭐ 두 기기가 같이 열려 있어도 **한 번만** 들어간다 (트랜잭션으로 꺼내기)
//  ③ 받은 것이 클라우드 자료로 올라가 다른 기기에도 맞춰진다
//  ④ 숫자 덩어리(c/0 …)와 섞이지 않는다 — 우체통이 있어도 자료 읽기 · 쓰기가 그대로
const path = require('path');
const { chromium } = require('playwright-core');
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/pray/';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 12000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(250); } return null; }
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) });
  const browser = await chromium.launch({ executablePath: EXE });
  async function device(name) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { window.PRAY_EMU = true; window.confirm = () => true; });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, (route) => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('   [' + name + ' 오류] ' + e.message));
    await page.goto(APP); await page.waitForFunction(() => typeof DB === 'object');
    return { ctx, page, name };
  }
  async function login(d) {
    await d.page.click('[data-a="settings"]'); await sleep(400);
    await d.page.click('[data-a="login"]'); await sleep(450);
    await d.page.fill('#lgEmail', 'hb@example.com'); await d.page.fill('#lgPw', 'pray1234');
    await d.page.click('[data-a="login-go"]');
    const r = await until(() => d.page.evaluate(() => SY.user && SY.status === 'ok' && !SY.busy));
    await d.page.evaluate(() => { while (UI.layers.length) popLayer(); });
    return r;
  }
  const lines = (p, name) => p.evaluate(n => { const g = DB.G.find(x => x.name === n); return g ? g.lines.map(l => lineToText(DB, l)) : null; }, name);

  const A = await device('아이폰');
  await A.page.evaluate(() => { const g = newGroup('가족'); g.lines.push(normLine({ segs: [[(() => { const t = newTarget('person', '가온'); DB.T.push(t); return t.id; })()]] })); DB.G.push(g); const s = newGroup('13세'); s.parent = g.id; DB.G.push(s); save(); });
  ok('로그인 (아이폰)', await login(A));
  const B = await device('아이패드');
  ok('로그인 (아이패드)', await login(B));
  ok('아이패드에 그룹이 왔다', await until(() => lines(B.page, '가족')));

  console.log('①② BLOCK7 이 보낸 것 — 두 기기가 같이 열려 있다');
  const gid = await A.page.evaluate(() => DB.G.find(x => x.name === '가족').id);
  const sid = await A.page.evaluate(() => DB.G.find(x => x.name === '13세').id);
  // BLOCK7(index.html _praySend)과 같은 모양 — 받는 쪽 앱 코드를 쓰지 않고 SDK 로 직접 쓴다
  await A.page.evaluate(({ gid, sid }) => FB.db.doc('pray/' + SY.user.uid + '/c/inbox').set({ items: firebase.firestore.FieldValue.arrayUnion(
    { id: 'm1', gid: gid, text: '병원 심방', at: 1, from: 'block7' }, { id: 'm2', gid: sid, text: '수련회 준비', at: 2, from: 'block7' }) }, { merge: true }), { gid, sid });
  ok('① 아이폰 그룹 맨 위에 들어왔다', await until(async () => { const l = await lines(A.page, '가족'); return l && l[0] === '병원 심방'; }), await lines(A.page, '가족'));
  ok('① 서브 그룹에도', await until(async () => { const l = await lines(A.page, '13세'); return l && l[0] === '수련회 준비'; }), await lines(A.page, '13세'));
  ok('③ 아이패드에도 맞춰졌다', await until(async () => { const l = await lines(B.page, '가족'); return l && l[0] === '병원 심방'; }), await lines(B.page, '가족'));
  await sleep(3000);
  const cntA = await A.page.evaluate(() => DB.G.find(x => x.name === '가족').lines.filter(l => lineToText(DB, l) === '병원 심방').length);
  const cntB = await B.page.evaluate(() => DB.G.find(x => x.name === '가족').lines.filter(l => lineToText(DB, l) === '병원 심방').length);
  ok('② ⭐ 한 번만 들어갔다 (두 기기 모두 1줄)', cntA === 1 && cntB === 1, [cntA, cntB]);
  const inbox = await A.page.evaluate(async () => { const s = await FB.db.doc('pray/' + SY.user.uid + '/c/inbox').get(); return s.exists ? s.data().items.length : -1; });
  ok('① 우체통이 비었다', inbox === 0, inbox);
  console.log('④ 우체통이 있어도 자료 읽기 · 쓰기 그대로');
  await A.page.evaluate(() => { DB.T.push(newTarget('person', '나래')); save(); });
  ok('④ 아이패드에 새 사람이 왔다', await until(() => B.page.evaluate(() => DB.T.some(t => t.name === '나래'))));
  ok('④ 두 기기 다 맞춤 상태', await until(() => Promise.all([A, B].map(d => d.page.evaluate(() => SY.status === 'ok'))).then(a => a.every(Boolean))));

  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})();
