// 시리로 할일 넣기 — 진짜 서버 코드(b7siri.js) + BLOCK7(index.html) 기기들을 에뮬레이터에 붙여 끝까지 돌린다 (v. 26-1025-2).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같되,
//    ① 규칙에 users/{uid}/** 주인 허락을 더하고 ② emu 폴더에 npm i firebase-admin@12 firebase-functions@6 express@4 를 더한다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_siri.js
// 지키는 것:
//  ① 설정 '주소 만들기' → 서버가 열쇠를 주고 이 기기에 주소가 남는다
//  ② 단축어(= 주소로 POST {text}) → 시리가 읽을 대답 · 열려 있는 기기가 곧바로 그날 그 구간에 넣는다 · 쪽지함은 빈다 · 토스트
//  ③ ⭐ 아무 기기도 안 열렸을 때 온 말 → 빈 기기로 로그인하면 클라우드 할일(앞서 받은 것)과 함께 받는다. 지우지도 겹치지도 않는다
//  ④ ⭐ 두 기기가 열려 있을 때 말 하나 → 클라우드에 한 번
//  ⑤ 새로 만들면 옛 주소는 멈춘다
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'block7-8f24e';
const path = require('path');
const express = require('express');
const { chromium } = require('playwright-core');
require('firebase-admin/app').initializeApp({ projectId: 'block7-8f24e' });
const H = require(path.join(__dirname, '..', '..', 'wallet-functions', 'src', 'b7siri.js')).b7siri;
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/index.html';
const FN = 'https://asia-northeast3-block7-8f24e.cloudfunctions.net', LOCAL = 'http://127.0.0.1:5510';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const docUrl = p => FS + '/v1/projects/' + PID + '/databases/(default)/documents/' + p;
async function get(p) { const r = await fetch(docUrl(p), { headers: { Authorization: 'Bearer owner' } }); return r.json(); }
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
async function inboxLen(uid) { const d = await get('pray/' + uid + '/c/b7inbox'); return ((d.fields && d.fields.items && d.fields.items.arrayValue.values) || []).length; }
async function cloudTexts(uid, date, sec) {
  const d = await get('users/' + uid + '/data/state'); if (!d.fields) return null;
  const st = JSON.parse(d.fields.json.stringValue); const day = (st.days || {})[date] || {};
  return ((day.big || {})[sec] || []).map(b => b.text);
}
// 한국 날짜 + n일
const kst = (n) => new Date(Date.now() + 9 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
async function siri(url, text) {
  const r = await fetch(url.replace(FN, LOCAL), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  return r.text();
}
(async () => {
  const srv = express();
  srv.use('/b7siri', express.json(), express.text({ type: 'text/*' }), (req, res) => H(req, res));
  const server = srv.listen(5510);
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const browser = await chromium.launch({ executablePath: EXE });
  async function open() {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    await ctx.addInitScript(([FN, LOCAL]) => {
      let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) {
        fb = v; const init = v.initializeApp.bind(v);
        v.initializeApp = (...a) => { const app = init(...a); if (!a[1]) { v.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); v.firestore().useEmulator('127.0.0.1', 8080); } return app; };
      } });
      // 서버 주소 → 이 시험의 서버 (다른 서버는 부르지 않는다)
      const real = window.fetch.bind(window);
      window.fetch = (u, o) => {
        const s = typeof u === 'string' ? u : String(u && u.url || u);
        if (s.startsWith(FN + '/b7siri')) return real(s.replace(FN, LOCAL), o);
        if (s.startsWith(FN)) return Promise.reject(new Error('시험에서 막음'));
        return real(u, o);   // Request 그대로 (방법 · 본문을 잃지 않게)
      };
    }, [FN, LOCAL]);
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('   [오류] ' + e.message));
    await page.goto(APP);
    await page.waitForFunction(() => typeof _prayTodoPull === 'function' && window.firebase && firebase.apps.length, null, { timeout: 20000 });
    await page.evaluate(() => firebase.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'));
    await page.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 10000 });
    return { ctx, page };
  }
  const T0 = kst(0), T1 = kst(1), T2 = kst(2), T5 = kst(5);
  const [m5, d5] = T5.slice(5).split('-').map(Number);

  console.log('① 주소 만들기');
  const A = await open();
  await sleep(1500);
  await A.page.evaluate(() => openSettings('account'));
  await sleep(500);
  await A.page.click('#siriMakeBtn');
  const saved = await until(() => A.page.evaluate(() => _siriSaved()));
  ok('① 이 기기에 주소가 남는다', !!(saved && saved.url && saved.url.startsWith(FN + '/b7siri?k=')), saved);
  const st = await A.page.evaluate(() => [document.getElementById('siriStatus').textContent, getComputedStyle(document.getElementById('siriCopyBtn')).display, document.getElementById('siriMakeBtn').textContent]);
  ok('① 주소 준비됨 · 주소 복사 단추 · 새로 만들기', /주소 준비됨/.test(st[0]) && st[1] !== 'none' && st[2] === '새로 만들기', st);
  const url1 = saved.url;

  console.log('② 열려 있는 기기');
  const say1 = await siri(url1, '내일 오전 우유 사기');
  ok('② 시리 대답', say1 === '블럭세븐에 보냈어요. 내일 오전 우유 사기', say1);
  const a1 = await until(() => A.page.evaluate(d => { const t = getBigs(d, 'am').map(b => b.text); return t.indexOf('우유 사기') >= 0 ? t : null; }, T1));
  ok('⭐② 열린 기기가 곧바로 내일 오전에', !!a1, a1);
  const toast = await A.page.evaluate(() => (document.getElementById('_toast') || {}).innerText || '');
  ok('② 토스트 — 날 · 구간 / 내용', /시리로 할일이 왔어요/.test(toast) && /내일 · 오전/.test(toast) && /우유 사기/.test(toast), toast);
  const c1 = await until(async () => { const t = await cloudTexts(uid, T1, 'am'); return t && t.indexOf('우유 사기') >= 0 ? t : null; });
  ok('② 클라우드 상태에도', !!c1, c1);
  ok('② 쪽지함은 비었다', (await inboxLen(uid)) === 0);
  await sleep(1500);
  await A.ctx.close();

  console.log('③ 아무 기기도 안 열렸을 때 → 빈 기기 B 로그인');
  await siri(url1, '모레 저녁 심방');
  await siri(url1, `${m5}월 ${d5}일 밤 기도회`);
  ok('③ 쪽지함에 둘이 기다린다', (await inboxLen(uid)) === 2);
  const B = await open();
  const b1 = await until(() => B.page.evaluate(([t1, t2, t5]) => {
    const g = (d, s) => getBigs(d, s).map(b => b.text);
    const r = [g(t1, 'am'), g(t2, 'eve'), g(t5, 'night')];
    return r[0].length && r[1].length && r[2].length ? r : null;
  }, [T1, T2, T5]));
  ok('⭐③ B 가 클라우드 할일과 기다리던 말을 함께 받는다', JSON.stringify(b1) === JSON.stringify([['우유 사기'], ['심방'], ['기도회']]), b1);
  await sleep(3000);
  const cl = [await cloudTexts(uid, T1, 'am'), await cloudTexts(uid, T2, 'eve'), await cloudTexts(uid, T5, 'night')];
  ok('⭐③ 클라우드가 지워지지도 겹치지도 않았다', JSON.stringify(cl) === JSON.stringify([['우유 사기'], ['심방'], ['기도회']]), cl);
  ok('③ 쪽지함은 비었다', (await inboxLen(uid)) === 0);

  console.log('④ 두 기기가 열려 있을 때');
  const C = await open();
  await until(() => C.page.evaluate(d => getBigs(d, 'am').length > 0, T1));
  await sleep(1500);
  await siri(url1, '점심때 약 먹기');
  await until(async () => { const t = await cloudTexts(uid, T0, 'morn'); return t && t.indexOf('약 먹기') >= 0; });
  await sleep(4000);
  const c4 = await cloudTexts(uid, T0, 'morn');
  ok('⭐④ 클라우드에 한 번만 (오늘 점심)', JSON.stringify(c4) === JSON.stringify(['약 먹기']), c4);
  const bc = await Promise.all([B, C].map(x => x.page.evaluate(d => getBigs(d, 'morn').filter(b => b.text === '약 먹기').length, T0)));
  ok('⭐④ 두 기기 화면에도 하나씩', bc[0] === 1 && bc[1] === 1, bc);

  console.log('⑤ 새로 만들기');
  await B.page.evaluate(() => openSettings('account'));
  await sleep(400);
  await B.page.click('#siriMakeBtn');
  const s2 = await until(() => B.page.evaluate(() => _siriSaved()));
  ok('⑤ 새 주소', !!(s2 && s2.url && s2.url !== url1), s2);
  const oldSay = await siri(url1, '옛 주소로');
  ok('⭐⑤ 옛 주소는 멈춘다', /주소가 맞지 않아요/.test(oldSay), oldSay);
  ok('⑤ 새 주소는 된다', /^블럭세븐에 보냈어요/.test(await siri(s2.url, '오늘 밤 정리')));

  await browser.close();
  server.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
