// BLOCK7 할일 메뉴 '기도 노트로' — BLOCK7(index.html) 을 에뮬레이터에 붙여 그룹 읽기 · 우체통 쓰기를 실제로 돌린다.
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_pray_send.js
// 지키는 것:
//  ① ⭐ 그룹 판이 '불러오는 중…' 에서 멈추지 않고 그룹이 나온다 (v26-1013-5 의 fbDB 오류)
//  ② 고르면 우체통(pray/{uid}/c/inbox)에 쪽지 한 줄 · 기도노트 덩어리는 그대로
//  ③ 기도노트 자료가 없는 계정이면 안내 글이 나온다 (멈추지 않는다)
const path = require('path');
const { chromium } = require('playwright-core');
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/index.html';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const docUrl = p => FS + '/v1/projects/' + PID + '/databases/(default)/documents/' + p;
async function put(p, fields) { const r = await fetch(docUrl(p), { method: 'PATCH', headers: { 'content-type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify({ fields }) }); return r.status; }
async function get(p) { const r = await fetch(docUrl(p), { headers: { Authorization: 'Bearer owner' } }); return r.json(); }
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const su = async e => (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: e, password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const uid = await su('hb@example.com'); await su('empty@example.com');
  const G = [{ id: 'g1', name: '가족', color: '#e09a28', lines: [] }, { id: 's1', name: '13세', parent: 'g1', lines: [] }, { id: 'g2', name: '청년부', lines: [] }];
  const json = JSON.stringify({ G, T: [] });
  await put('pray/' + uid, { wid: { stringValue: 'w1' }, n: { integerValue: '2' } });
  await put('pray/' + uid + '/c/0', { wid: { stringValue: 'w1' }, s: { stringValue: json.slice(0, 40) } });
  await put('pray/' + uid + '/c/1', { wid: { stringValue: 'w1' }, s: { stringValue: json.slice(40) } });

  const browser = await chromium.launch({ executablePath: EXE });
  async function open(email) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1300, height: 850 } });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    // 첫 initializeApp 바로 뒤에 에뮬레이터로 돌린다 (BLOCK7 코드는 그대로)
    await ctx.addInitScript(() => {
      let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) {
        fb = v; const init = v.initializeApp.bind(v);
        v.initializeApp = (...a) => { const app = init(...a); if (!a[1]) { v.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); v.firestore().useEmulator('127.0.0.1', 8080); } return app; };
      } });
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('   [오류] ' + e.message));
    await page.goto(APP);
    await page.waitForFunction(() => typeof _prayLoadGroups === 'function' && window.firebase && firebase.apps.length, null, { timeout: 20000 });
    await page.evaluate(e => firebase.auth().signInWithEmailAndPassword(e, 'pray1234'), email);
    await page.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 10000 });
    return { ctx, page };
  }
  console.log('①② 기도노트 자료가 있는 계정');
  const A = await open('hb@example.com');
  await A.page.evaluate(() => { getBigs(tKey(), 'secT').push({ text: '병원 심방', done: false }); openTaskMenu('big', 'secT', 0, document.body, { x: 300, y: 200 }); });
  await A.page.hover('#prayMenuItem');
  const rows = await A.page.waitForFunction(() => { const r = [...document.querySelectorAll('.pray-pick[data-pp="1"] .pp-row')].map(x => x.textContent.trim()); return r.length ? r : null; }, null, { timeout: 15000 }).then(h => h.jsonValue()).catch(() => null);
  ok('⭐① 그룹 판이 멈추지 않고 그룹이 나온다', JSON.stringify(rows) === JSON.stringify(['가족', '청년부']), rows || await A.page.evaluate(() => (document.querySelector('.pray-pick') || {}).textContent));
  await A.page.hover('.pray-pick[data-pp="1"] .pp-row[data-i="0"]'); await sleep(300);
  await A.page.click('.pray-pick[data-pp="2"] .pp-row');
  await sleep(1500);
  const inbox = await get('pray/' + uid + '/c/inbox');
  const it = inbox.fields && inbox.fields.items.arrayValue.values || [];
  const f = it[0] && it[0].mapValue.fields;
  ok('② 우체통에 쪽지 한 줄 (서브 그룹 13세 · 할일 글)', it.length === 1 && f.gid.stringValue === 's1' && f.text.stringValue === '병원 심방', inbox);
  const c0 = await get('pray/' + uid + '/c/0');
  ok('② 기도노트 덩어리는 그대로', c0.fields.s.stringValue === json.slice(0, 40));
  console.log('③ 기도노트 자료가 없는 계정');
  const B = await open('empty@example.com');
  await B.page.evaluate(() => { getBigs(tKey(), 'secT').push({ text: 'x', done: false }); openTaskMenu('big', 'secT', 0, document.body, { x: 300, y: 200 }); });
  await B.page.hover('#prayMenuItem');
  const msg = await B.page.waitForFunction(() => { const m = document.querySelector('.pray-pick .pp-msg:not(.pp-load)'); return m ? m.textContent : null; }, null, { timeout: 15000 }).then(h => h.jsonValue()).catch(() => null);
  ok('③ 안내 글이 나온다', /아직 없어요/.test(msg || ''), msg);
  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})();
