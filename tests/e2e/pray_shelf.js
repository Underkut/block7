// 기도노트 보관 · 항목 응답 — 두 기기(아이폰 · 아이패드)를 에뮬레이터에 붙여 실제로 맞춰 본다 (O-5, pray v. 26-1019-7).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/pray_shelf.js
// 지키는 것 (이름은 지어낸 것):
//  ① 아이폰에서 보관 → 아이패드 지도에서도 빠진다 · 그룹 줄은 그대로
//  ② 아이패드에서 꺼내기 → 아이폰 지도에 원래 자리로 돌아온다
//  ③ 아이폰 항목 응답 · 아이패드 다른 항목 보관을 엇갈려 해도 둘 다 남는다
//  ④ ⭐ 빈 기기(세 번째)로 로그인 → 보관 · 응답 표시가 그대로 오고 클라우드는 줄지 않는다
const path = require('path');
const { chromium } = require('playwright-core');
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/pray/index.html';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) });
  const browser = await chromium.launch({ executablePath: EXE });
  async function device(name) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { window.PRAY_EMU = true; window.confirm = () => true; });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    const page = await ctx.newPage(); page.on('pageerror', e => console.log('   [' + name + ' 오류] ' + e.message));
    await page.goto(APP); await page.waitForFunction(() => typeof DB === 'object');
    return { ctx, page, name };
  }
  async function login(d) {
    await d.page.click('[data-a="settings"]'); await sleep(400);
    await d.page.evaluate(() => { const t = [...document.querySelectorAll('.layer button')].find(b => b.textContent.trim() === '계정·자료'); if (t) t.click(); }); await sleep(400);
    await d.page.click('[data-a="login"]'); await sleep(450);
    await d.page.fill('#lgEmail', 'hb@example.com'); await d.page.fill('#lgPw', 'pray1234');
    await d.page.click('[data-a="login-go"]');
    const r = await until(() => d.page.evaluate(() => SY.user && SY.status === 'ok' && !SY.busy));
    await d.page.evaluate(() => { while (UI.layers.length) popLayer(); if (SHEET) closeSheet(true); document.querySelector('.tb[data-tab="map"]').click(); });
    return r;
  }
  const mapNames = p => p.evaluate(() => { renderView(); return [...document.querySelectorAll('#v-map .pn')].map(x => x.textContent.trim()); });
  const T = (p, n) => p.evaluate(n => { const t = DB.T.find(x => x.name === n); return t ? { arch: t.arch || '', ansAt: t.ansAt || '' } : null; }, n);
  const A = await device('아이폰');
  await A.page.evaluate(() => { const mk = n => { const t = newTarget('person', n); DB.T.push(t); return t; };
    const a = mk('가온'), b = mk('나래'), c = mk('다온');
    const g = newGroup('청년 셀', '#e09a28'); g.lines = [{ id: 'L1', segs: [[a.id]], r: {}, text: '' }, { id: 'L2', segs: [[b.id]], r: {}, text: '' }, { id: 'L3', segs: [[c.id]], r: {}, text: '' }]; DB.G.push(g); save(); });
  ok('로그인 아이폰', await login(A));
  const B = await device('아이패드');
  ok('로그인 아이패드 (빈 기기)', await login(B));
  ok('아이패드에 셋 다', JSON.stringify(await mapNames(B.page)) === '["가온","나래","다온"]', await mapNames(B.page));

  console.log('① 아이폰 보관 → 아이패드');
  await A.page.evaluate(() => { shelve(DB, DB.T.find(t => t.name === '나래').id, TODAY); save(); });
  const b1 = await until(async () => { const n = await mapNames(B.page); return n.indexOf('나래') < 0 ? n : null; });
  ok('⭐① 아이패드 지도에서도 빠짐', JSON.stringify(b1) === '["가온","다온"]', b1);
  ok('① 그룹 줄은 그대로(셋)', await B.page.evaluate(() => DB.G[0].lines.length === 3));

  console.log('② 아이패드 꺼내기 → 아이폰');
  await B.page.evaluate(() => { unshelve(DB, DB.T.find(t => t.name === '나래').id); save(); });
  const a2 = await until(async () => { const n = await mapNames(A.page); return n.indexOf('나래') >= 0 ? n : null; });
  ok('⭐② 아이폰 지도 원래 자리로', JSON.stringify(a2) === '["가온","나래","다온"]', a2);

  console.log('③ 엇갈려: 아이폰 응답 · 아이패드 보관');
  await A.page.evaluate(() => { answerTarget(DB, DB.T.find(t => t.name === '가온').id, TODAY); save(); });
  await B.page.evaluate(() => { shelve(DB, DB.T.find(t => t.name === '다온').id, TODAY); save(); });
  const both = await until(async () => { const a = await T(A.page, '가온'), b = await T(A.page, '다온'), c = await T(B.page, '가온'), d = await T(B.page, '다온'); return a.ansAt && b.arch && c.ansAt && d.arch ? 1 : null; }, 20000);
  ok('⭐③ 두 기기 모두 응답 · 보관 둘 다', !!both, [await T(A.page, '가온'), await T(A.page, '다온'), await T(B.page, '가온'), await T(B.page, '다온')]);
  ok('③ 지도에는 나래만', JSON.stringify(await mapNames(A.page)) === '["나래"]' && JSON.stringify(await mapNames(B.page)) === '["나래"]');

  console.log('④ 빈 기기 로그인');
  const C = await device('새 기기');
  ok('로그인 새 기기', await login(C));
  ok('⭐④ 보관 · 응답 표시가 그대로 오고 사람은 셋 다 있다', JSON.stringify(await C.page.evaluate(() => DB.T.filter(t => t.kind === 'person').map(t => [t.name, !!t.arch, !!t.ansAt]))) === '[["가온",false,true],["나래",false,false],["다온",true,false]]',
    await C.page.evaluate(() => DB.T.filter(t => t.kind === 'person').map(t => [t.name, !!t.arch, !!t.ansAt])));
  await sleep(2000);
  ok('④ 아이폰도 셋 다 그대로', await A.page.evaluate(() => DB.T.filter(t => t.kind === 'person').length) === 3);
  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})();
