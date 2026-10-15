// 기도노트 → BLOCK7 할일 받기 — BLOCK7(index.html) 두 기기를 에뮬레이터에 붙여 실제로 돌린다 (R-3, v26-1015-2).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같되, 규칙에 users/{uid}/** 주인 허락을 더한다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_pray_todo_recv.js
// 지키는 것:
//  ① 열려 있는 기기 A — 쪽지가 오면 바로 그날 그 구간 할일로 · 쪽지함은 빈다 · 클라우드 상태에도 올라간다
//  ② ⭐ 빈 기기 B 로그인 — 클라우드의 할일(A 가 넣은 것 · 받은 것)을 그대로 받는다. 지우지도 겹치지도 않는다
//  ③ ⭐ 둘 다 열려 있을 때 쪽지 하나 — 한 기기만 넣는다 (클라우드에 한 번)
//  ④ 로그인 전에 쌓인 쪽지 — 첫 읽기가 끝난 뒤 받는다
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
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
const note = (id, date, sec, text) => ({ mapValue: { fields: { id: { stringValue: id }, date: { stringValue: date }, sec: { stringValue: sec }, text: { stringValue: text }, at: { integerValue: String(Date.now()) } } } });
const sendNotes = (uid, notes) => put('pray/' + uid + '/c/b7inbox', { items: { arrayValue: { values: notes } } });
async function inboxLen(uid) { const d = await get('pray/' + uid + '/c/b7inbox'); return ((d.fields && d.fields.items && d.fields.items.arrayValue.values) || []).length; }
async function cloudTexts(uid, date, sec) {
  const d = await get('users/' + uid + '/data/state'); if (!d.fields) return null;
  const st = JSON.parse(d.fields.json.stringValue); const day = (st.days || {})[date] || {};
  return ((day.big || {})[sec] || []).map(b => b.text);
}
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const browser = await chromium.launch({ executablePath: EXE });
  async function open() {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1300, height: 850 } });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    await ctx.addInitScript(() => {
      let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) {
        fb = v; const init = v.initializeApp.bind(v);
        v.initializeApp = (...a) => { const app = init(...a); if (!a[1]) { v.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); v.firestore().useEmulator('127.0.0.1', 8080); } return app; };
      } });
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('   [오류] ' + e.message));
    await page.goto(APP);
    await page.waitForFunction(() => typeof _prayTodoPull === 'function' && window.firebase && firebase.apps.length, null, { timeout: 20000 });
    await page.evaluate(() => firebase.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'));
    await page.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 10000 });
    return { ctx, page };
  }
  const D = '2026-10-20';
  console.log('④ 로그인 전에 쌓인 쪽지 + ① 열려 있는 기기');
  await sendNotes(uid, [note('n0', D, 'pm', '먼저 온 쪽지')]);
  const A = await open();
  const a0 = await until(async () => { const t = await cloudTexts(uid, D, 'pm'); return t && t.indexOf('먼저 온 쪽지') >= 0 ? t : null; });
  ok('④ 첫 읽기 뒤에 받아 클라우드에 올라감', !!a0, await cloudTexts(uid, D, 'pm'));
  ok('④ 쪽지함은 비었다', (await inboxLen(uid)) === 0);
  await A.page.evaluate(d => { beforeSave(); getBigs(d, 'pm').push({ text: 'A 가 넣은 할일', done: false }); save(); }, D);
  await until(async () => { const t = await cloudTexts(uid, D, 'pm'); return t && t.indexOf('A 가 넣은 할일') >= 0; });
  await sendNotes(uid, [note('n1', D, 'pm', '가족 심방'), note('n2', D, 'gone', '지워진 구간으로 온 것')]);
  const a1 = await until(async () => { const t = await cloudTexts(uid, D, 'pm'); return t && t.indexOf('가족 심방') >= 0 ? t : null; });
  ok('① 열린 기기가 바로 받는다', !!a1, await cloudTexts(uid, D, 'pm'));
  const firstSec = await A.page.evaluate(() => SECS[0].id);
  const fs0 = await cloudTexts(uid, D, firstSec);
  ok('① 지워진 구간으로 온 것은 첫 구간으로', (fs0 || []).indexOf('지워진 구간으로 온 것') >= 0, fs0);
  ok('① A 화면 상태(ST)에도', await A.page.evaluate(d => getBigs(d, 'pm').map(b => b.text).join('|'), D) === '먼저 온 쪽지|A 가 넣은 할일|가족 심방');

  console.log('② 빈 기기 B 로그인');
  const B = await open();
  const b0 = await until(() => B.page.evaluate(d => { const t = getBigs(d, 'pm').map(b => b.text); return t.length >= 3 ? t : null; }, D));
  ok('⭐② B 가 클라우드 할일을 그대로 받는다', JSON.stringify(b0) === JSON.stringify(['먼저 온 쪽지', 'A 가 넣은 할일', '가족 심방']), b0);
  await sleep(2500);
  ok('⭐② 클라우드가 지워지지도 겹치지도 않았다', JSON.stringify(await cloudTexts(uid, D, 'pm')) === JSON.stringify(['먼저 온 쪽지', 'A 가 넣은 할일', '가족 심방']), await cloudTexts(uid, D, 'pm'));

  console.log('③ 둘 다 열려 있을 때 쪽지 하나');
  await sendNotes(uid, [note('n3', D, 'pm', '둘이 같이 본 쪽지')]);
  await until(async () => { const t = await cloudTexts(uid, D, 'pm'); return t && t.indexOf('둘이 같이 본 쪽지') >= 0; });
  await sleep(4000);
  const c3 = await cloudTexts(uid, D, 'pm');
  ok('⭐③ 클라우드에 한 번만', c3.filter(x => x === '둘이 같이 본 쪽지').length === 1, c3);
  const ab = await Promise.all([A, B].map(x => x.page.evaluate(d => getBigs(d, 'pm').filter(b => b.text === '둘이 같이 본 쪽지').length, D)));
  ok('⭐③ 두 기기 화면에도 하나씩', ab[0] === 1 && ab[1] === 1, ab);
  ok('③ 쪽지함은 비었다', (await inboxLen(uid)) === 0);
  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})();
