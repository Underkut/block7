// 기도노트 로그인 · 기기 사이 맞추기 — 진짜 브라우저 여러 대 + 파이어베이스 서버 흉내 장치(에뮬레이터)로 돌려 본다.
// ⚠️ check.sh 가 돌리지 않는다 (자바 · 에뮬레이터 · 크로미움이 필요). 동기화를 고칠 때 손으로 돌린다.
//
// 준비 (한 번):
//   mkdir emu && cd emu && npm i firebase-tools@13 firebase@10.12.2 playwright-core
//   cp <저장소>/docs/pray/firestore.rules . && 아래 firebase.json 을 만든다
//     { "firestore": { "rules": "firestore.rules" },
//       "emulators": { "auth": { "port": 9099 }, "firestore": { "port": 8080 }, "ui": { "enabled": false }, "singleProjectMode": true } }
//   npx firebase emulators:start --only auth,firestore --project block7-8f24e
//   (저장소 맨 위에서) python3 -m http.server 5501 --bind 127.0.0.1
// 돌리기:  NODE_PATH=<emu>/node_modules node tests/e2e/pray_sync.js
//
// 기기마다 브라우저 칸(context)이 따로라 저장 칸도 따로다 — 아이폰 · 아이패드와 같다.
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
async function signUp(email, pw) {
  const r = await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: pw, returnSecureToken: true }) });
  return r.json();
}
async function cloudMeta(uid, token) {
  const r = await fetch(FS + '/v1/projects/' + PID + '/databases/(default)/documents/pray/' + uid, { headers: token ? { Authorization: 'Bearer ' + token } : { Authorization: 'Bearer owner' } });
  return { status: r.status, body: await r.json() };
}
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const me = await signUp('hb@example.com', 'pray1234');
  const other = await signUp('other@example.com', 'pray1234');
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
  const people = (p) => p.evaluate(() => DB.T.filter(t => t.kind === 'person').map(t => t.name).sort());
  const addPeople = (p, names) => p.evaluate(ns => { ns.forEach(n => DB.T.push(newTarget('person', n))); save(); }, names);
  const status = (p) => p.evaluate(() => SY.status + (SY.err ? ':' + SY.err : ''));
  async function login(d) {
    await d.page.click('[data-a="settings"]'); await sleep(400);
    await d.page.click('[data-a="login"]'); await sleep(450);
    await d.page.fill('#lgEmail', 'hb@example.com'); await d.page.fill('#lgPw', 'pray1234');
    await d.page.click('[data-a="login-go"]');
    return until(() => d.page.evaluate(() => SY.user && SY.status === 'ok' && !SY.busy));
  }

  console.log('① 아이폰: 자료를 넣고 로그인 → 클라우드에 올라간다');
  const A = await device('아이폰');
  await addPeople(A.page, ['가온', '나래', '다온']);
  await A.page.evaluate(() => { const g = newGroup('청년 셀'); g.lines.push(normLine({ segs: [[DB.T.find(t => t.name === '가온').id]] })); DB.G.push(g); DB.set.preset = ''; save(); });
  ok('① 로그인 · 맞춤', await login(A), await status(A.page));
  let meta = await cloudMeta(me.localId);
  ok('① 클라우드 머리 문서에 사람 3 · 그룹 1', meta.body.fields && meta.body.fields.people.integerValue === '3' && meta.body.fields.groups.integerValue === '1', meta.body.fields);
  ok('① 설정에 계정 · 맞춤 표시', await A.page.evaluate(() => !!document.querySelector('#syncSt') && /맞춤/.test(document.querySelector('#syncSt').textContent)));

  console.log('② 아이패드(빈 기기)로 로그인 → 묻지 않고 받아 온다 · 클라우드는 그대로');
  const B = await device('아이패드');
  ok('② 로그인 · 맞춤', await login(B), await status(B.page));
  ok('② 아이폰의 사람들이 왔다', JSON.stringify(await people(B.page)) === JSON.stringify(['가온', '나래', '다온']), await people(B.page));
  ok('② 묻는 창이 안 떴다', await B.page.evaluate(() => !SY.pending));
  meta = await cloudMeta(me.localId);
  ok('② ⭐ 빈 기기가 들어와도 클라우드 사람 수 그대로(3)', meta.body.fields.people.integerValue === '3', meta.body.fields.people);

  console.log('③ 두 기기가 동시에 사람을 넣는다 → 둘 다 산다');
  await Promise.all([addPeople(A.page, ['라온']), addPeople(B.page, ['마루'])]);
  const both = ['가온', '나래', '다온', '라온', '마루'];
  ok('③ 아이폰에 둘 다', await until(async () => JSON.stringify(await people(A.page)) === JSON.stringify(both), 15000), await people(A.page));
  ok('③ 아이패드에 둘 다', await until(async () => JSON.stringify(await people(B.page)) === JSON.stringify(both), 15000), await people(B.page));

  console.log('④ 다시 열지 않아도 실시간으로 — 아이폰에서 색을 칠하면 아이패드에 온다');
  await A.page.evaluate(() => { DB.T.find(t => t.name === '나래').mark = 'red'; save(); });
  ok('④ 아이패드에 빨강', await until(() => B.page.evaluate(() => DB.T.find(t => t.name === '나래').mark === 'red')));

  console.log('⑤ 테마는 기기마다 따로');
  await A.page.evaluate(() => { DB.set.mode = 'light'; DB.set.preset = THEME_PRESETS[2].id; DB.set.topLimit = 9; save(); });
  ok('⑤ 다른 설정(1순위 개수)은 아이패드에 온다', await until(() => B.page.evaluate(() => DB.set.topLimit === 9)));
  ok('⑤ 아이패드 테마는 그대로', await B.page.evaluate(() => DB.set.mode === 'dark' && !DB.set.preset), await B.page.evaluate(() => DB.set));

  console.log('⑥ 큰 자료 — 문서 한 장(1MiB)을 넘으면 덩어리로 나눠 쓰고 그대로 받는다');
  await A.page.evaluate(() => { DB.T.find(t => t.name === '가온').note = '기도'.repeat(200000) + '😀끝'; save(); });
  ok('⑥ 아이패드가 40만 자 메모를 그대로 받았다', await until(() => B.page.evaluate(() => { const n = DB.T.find(t => t.name === '가온').note; return n.length === 400003 && n.endsWith('😀끝'); }), 20000));
  meta = await cloudMeta(me.localId);
  ok('⑥ 덩어리 2개 이상', +meta.body.fields.n.integerValue >= 2, meta.body.fields.n);
  await A.page.evaluate(() => { DB.T.find(t => t.name === '가온').note = ''; save(); });
  await until(() => B.page.evaluate(() => DB.T.find(t => t.name === '가온').note === ''));
  meta = await cloudMeta(me.localId);
  ok('⑥ 줄어들면 남는 덩어리를 지운다 (n=1)', meta.body.fields.n.integerValue === '1', meta.body.fields.n);

  console.log('⑦ 고치는 중에는 받은 것을 안 그린다 — 쓰던 글자가 안 날아간다');
  await B.page.click('[data-a="settings"]').catch(() => {}); await sleep(300);
  await B.page.evaluate(() => { const i = document.querySelector('[data-f="maptitle"]'); i.focus(); i.value = '쓰는 중'; });
  await A.page.evaluate(() => { DB.T.find(t => t.name === '다온').mark = 'blue'; save(); });
  await sleep(3500);
  ok('⑦ 쓰는 동안은 안 받았다', await B.page.evaluate(() => DB.T.find(t => t.name === '다온').mark === '' && document.activeElement.value === '쓰는 중'));
  await B.page.evaluate(() => document.activeElement.blur());
  ok('⑦ 다 쓰고 나면 받는다', await until(() => B.page.evaluate(() => DB.T.find(t => t.name === '다온').mark === 'blue')));

  console.log('⑧ 저장이 깨져 샘플로 다시 시작한 아이폰 → 클라우드를 비우지 않고 묻는다');
  // 떠날 때 저장(pagehide)이 도로 써 넣지 못하게 막고 깨뜨린다
  await A.page.evaluate(() => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k !== 'pray.v1') set.call(this, k, v); }; localStorage.setItem.call(localStorage, 'x', 'y'); set.call(localStorage, 'pray.v1', '{깨짐'); });
  await A.page.reload(); await A.page.waitForFunction(() => typeof DB === 'object');
  ok('⑧ 묻는 창이 떴다 (bulk)', await until(() => A.page.evaluate(() => SY.pending && SY.pending.plan.act === 'bulk' && SY.pending.plan.side === 'local')));
  if (process.env.DBG) console.log(await A.page.evaluate(() => JSON.stringify({ st: SY.status, err: SY.err, user: !!SY.user, pend: SY.pending && SY.pending.plan.act, busy: uiBusy(), base: !!loadBase(SY.user && SY.user.uid), people: DB.T.filter(t => t.kind === 'person').length, ae: document.activeElement.tagName })));
  await sleep(3000);   // 그 사이에 올라가지 않았는지 넉넉히 본다
  meta = await cloudMeta(me.localId);
  ok('⑧ ⭐ 클라우드 사람 5명 그대로', meta.body.fields.people.integerValue === '5', meta.body.fields.people);
  await A.page.click('[data-a="pick"][data-v="cloud"]');
  ok('⑧ 클라우드 것으로 되살렸다', await until(async () => (await people(A.page)).length === 5), await people(A.page));

  console.log('⑨ 제 자료가 있는 기기가 처음 로그인 → 묻는다 · 고른 쪽 말고는 한 벌 남긴다');
  const C = await device('다른 폰');
  await addPeople(C.page, ['바다']);
  await C.page.click('[data-a="settings"]'); await sleep(400); await C.page.click('[data-a="login"]'); await sleep(450);
  await C.page.fill('#lgEmail', 'hb@example.com'); await C.page.fill('#lgPw', 'pray1234'); await C.page.click('[data-a="login-go"]');
  ok('⑨ 묻는 창이 떴다 (ask)', await until(() => C.page.evaluate(() => SY.pending && SY.pending.plan.act === 'ask')));
  await sleep(400); await C.page.click('[data-a="pick"][data-v="cloud"]');
  ok('⑨ 클라우드 것을 받았다', await until(async () => (await people(C.page)).length === 5));
  ok('⑨ 이 기기 것(바다)은 한 벌 남겨 두었다', await C.page.evaluate(() => JSON.parse(localStorage.getItem('pray.v1.before')).db.T.some(t => t.name === '바다')));

  console.log('⑩ 같은 브라우저에 Sweeter 로그인이 있으면 그 계정으로 한 번에 · 로그아웃은 Sweeter 를 안 건드린다');
  const S = await device('Sweeter 함께 쓰는 브라우저');
  await S.page.evaluate(async () => { await fbLoad(); const d = firebase.initializeApp(FB_CFG); d.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); await d.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'); });
  await S.page.click('[data-a="settings"]'); await sleep(400); await S.page.click('[data-a="login"]');
  ok('⑩ \'Sweeter 계정으로 계속\' 이 보인다', await until(() => S.page.evaluate(() => !!document.querySelector('[data-a="login-sw"]'))));
  await S.page.click('[data-a="login-sw"]');
  ok('⑩ 같은 uid 로 들어왔다', await until(() => S.page.evaluate(uid => SY.user && SY.user.uid === uid && SY.status === 'ok', me.localId)));
  ok('⑩ 자료도 받았다', (await people(S.page)).length === 5);
  await S.page.evaluate(() => ACT.logout());
  await sleep(800);
  ok('⑩ 기도노트는 로그아웃 · Sweeter(기본 앱)는 그대로', await S.page.evaluate(() => !SY.user && !FB.auth.currentUser && !!firebase.app().auth().currentUser));
  ok('⑩ 로그아웃해도 이 기기 자료는 남는다', (await people(S.page)).length === 5);

  console.log('⑪ 보안 규칙 — 남의 칸은 못 읽는다');
  const mine = await signIn('hb@example.com'), theirs = await signIn('other@example.com');
  ok('⑪ 내 칸은 읽힌다', (await cloudMeta(me.localId, mine)).status === 200);
  ok('⑪ 다른 계정은 못 읽는다', (await cloudMeta(me.localId, theirs)).status === 403);
  const anon = await fetch(FS + '/v1/projects/' + PID + '/databases/(default)/documents/pray/' + me.localId);
  ok('⑪ 로그인 안 하면 못 읽는다', anon.status === 403);
  async function signIn(email) {
    const r = await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: 'pray1234', returnSecureToken: true }) });
    return (await r.json()).idToken;
  }
  void other;

  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
