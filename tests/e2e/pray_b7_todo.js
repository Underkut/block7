// 기도노트 '할일로 보내기' D · W · M → BLOCK7 할일 — 두 앱을 같은 에뮬레이터에 붙여 끝까지 돌린다 (R-4, pray v. 26-1015-8).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같되, 규칙에 users/{uid}/** 주인 허락을 더한다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/pray_b7_todo.js
// 지키는 것:
//  ① D 판: BLOCK7 의 시간구간이 **빈 것까지 모두** · 그날 할일이 보인다
//  ② 지도 메뉴 '할일로 보내기' → 이름 칸에 항목 이름 · 고쳐서 고른 구간으로 보내면 열려 있는 BLOCK7 에 그날 그 구간 할일로
//  ③ W 판 칸 → 그날 D 판 · 그 구간이 골라짐 / M 판 날짜 → 그날 D 판
//  ④ ⭐ 기도노트는 users/ 문서를 쓰지 않는다 (상태를 마지막으로 쓴 기기 = BLOCK7)
const path = require('path');
const { chromium } = require('playwright-core');
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const B7URL = 'http://127.0.0.1:5501/index.html', PRAY = 'http://127.0.0.1:5501/pray/index.html';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const docUrl = p => FS + '/v1/projects/' + PID + '/databases/(default)/documents/' + p;
async function get(p) { const r = await fetch(docUrl(p), { headers: { Authorization: 'Bearer owner' } }); return r.json(); }
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
async function cloudState(uid) { const d = await get('users/' + uid + '/data/state'); return d.fields ? { rev: d.fields.rev && +d.fields.rev.integerValue, st: JSON.parse((d.fields.jz ? require('zlib').inflateRawSync(Buffer.from(d.fields.jz.bytesValue, 'base64')).toString() : d.fields.json.stringValue)) } : null; }
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const browser = await chromium.launch({ executablePath: EXE });
  async function ctxOf(w, h, pray) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: w, height: h }, hasTouch: !!pray });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    if (pray) await ctx.addInitScript(() => { window.PRAY_EMU = true; window.confirm = () => true; });
    else await ctx.addInitScript(() => {
      let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) {
        fb = v; const init = v.initializeApp.bind(v);
        v.initializeApp = (...a) => { const app = init(...a); if (!a[1]) { v.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); v.firestore().useEmulator('127.0.0.1', 8080); } return app; };
      } });
    });
    const page = await ctx.newPage(); page.on('pageerror', e => console.log('   [오류] ' + e.message));
    return page;
  }
  // BLOCK7 — 로그인 · 오늘 오전에 할일 하나
  const b7 = await ctxOf(1300, 850, false);
  await b7.goto(B7URL);
  await b7.waitForFunction(() => typeof _prayTodoPull === 'function' && window.firebase && firebase.apps.length, null, { timeout: 20000 });
  await b7.evaluate(() => firebase.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'));
  await b7.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 10000 });
  await sleep(1500);
  const today = await b7.evaluate(() => { const d = tKey(new Date()); beforeSave(); getBigs(d, 'am').push({ text: '아침 회의', done: false }); save(); return d; });
  await until(async () => { const c = await cloudState(uid); return c && ((c.st.days || {})[today] || { big: {} }).big.am; });
  const rev0 = (await cloudState(uid)).rev;
  // 기도노트 — 로그인 · 지도에 그룹 하나
  const pr = await ctxOf(390, 844, true);
  await pr.goto(PRAY); await pr.waitForFunction(() => typeof DB === 'object');
  await pr.evaluate(() => { const t = newTarget('person', '가나'); DB.T.push(t); const g = newGroup('가족', '#e09a28'); g.lines = [{ id: 'L1', segs: [[t.id]], r: {}, text: '' }]; DB.G.push(g); save(); });
  await pr.click('[data-a="settings"]'); await sleep(400);
  await pr.click('[data-a="login"]'); await sleep(450);
  await pr.fill('#lgEmail', 'hb@example.com'); await pr.fill('#lgPw', 'pray1234');
  await pr.click('[data-a="login-go"]');
  await until(() => pr.evaluate(() => SY.user && SY.status === 'ok' && !SY.busy));
  await pr.evaluate(() => { while (UI.layers.length) popLayer(); if (SHEET) closeSheet(true); document.querySelector('.tb[data-tab="map"]').click(); });
  await sleep(600);
  // ② 지도 메뉴에서 열기
  await pr.evaluate(() => mapHoldMenu(document.querySelector('#v-map [data-sel$=":L1"]').dataset.sel, ''));
  await sleep(400);
  await pr.click('.sheet [data-v="todo"]');
  const secs = await until(() => pr.evaluate(() => { const r = [...document.querySelectorAll('.b7sec')].map(x => x.querySelector('b').textContent); return r.length ? r : null; }));
  ok('⭐① D 판에 BLOCK7 기본 여섯 구간이 모두 (빈 것도)', JSON.stringify(secs) === JSON.stringify(['새벽', '오전', '점심', '오후', '저녁', '밤']), secs);
  ok('① 오전 구간에 그날 할일', await pr.evaluate(() => /아침 회의/.test(document.querySelectorAll('.b7sec')[1].textContent)));
  ok('② 이름 칸에 항목 이름', await pr.inputValue('#b7tIn') === '가나');
  // ③ W → 칸 누르기
  await pr.click('[data-a="b7t-tab"][data-v="W"]'); await sleep(200);
  const wc = await pr.evaluate(() => document.querySelectorAll('.b7wc').length);
  ok('③ W 판 칸 = 구간 6 × 7일', wc === 42, wc);
  await pr.evaluate(() => { const c = [...document.querySelectorAll('.b7wc')].find(x => x.dataset.s === 'pm'); c.click(); });
  await sleep(200);
  ok('③ W 칸 → D 판 · 오후 골라짐', await pr.evaluate(() => { const L = UI.layers.find(x => x.type === 'b7todo'); return L.tab === 'D' && L.sec === 'pm'; }));
  await pr.click('[data-a="b7t-tab"][data-v="M"]'); await sleep(200);
  await pr.evaluate(t => document.querySelector('.b7mc[data-d="' + t + '"]').click(), today); await sleep(200);
  ok('③ M 날짜 → 그날 D 판', await pr.evaluate(t => { const L = UI.layers.find(x => x.type === 'b7todo'); return L.tab === 'D' && L.date === t; }, today));
  // ② 고쳐서 보내기 — 저녁
  await pr.evaluate(() => [...document.querySelectorAll('.b7sec')].find(x => x.dataset.v === 'eve').click()); await sleep(150);
  await pr.fill('#b7tIn', '가나에게 전화'); await sleep(100);
  ok('② 고른 구간에 새 할일이 미리 보인다', await pr.evaluate(() => (document.querySelector('.b7sec.on .b7t.n') || {}).textContent === '가나에게 전화'));
  // BLOCK7 은 저 혼자서도 상태를 다시 쓴다(설정 맞추기 등) — rev 가 아니라 '마지막으로 쓴 기기' 가 BLOCK7 인지 본다
  { const d = await get('users/' + uid + '/data/state'), me = await b7.evaluate(() => localStorage.getItem('b7v1_devid'));
    ok('④ BLOCK7 상태를 마지막으로 쓴 것은 BLOCK7 기기 (기도노트가 users/ 를 안 썼다)', d.fields.dev && d.fields.dev.stringValue === me, [d.fields.dev, me]); }
  await pr.click('[data-a="b7t-send"]');
  const got = await until(() => b7.evaluate(t => getBigs(t, 'eve').map(b => b.text).join('|') || null, today));
  ok('⭐② 열려 있는 BLOCK7 에 그날 저녁 할일로', got === '가나에게 전화', got);
  const c1 = await until(async () => { const c = await cloudState(uid); const e = ((c.st.days || {})[today] || { big: {} }).big.eve; return e && e.length ? c : null; });
  ok('② 클라우드 BLOCK7 상태에도 (BLOCK7 이 올림)', !!c1 && c1.rev > rev0);
  ok('② 기도노트 레이어는 닫혔다', await pr.evaluate(() => !UI.layers.some(x => x.type === 'b7todo')));
  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})();
