// 클라우드 문서 압축 — 1단계(읽기)를 진짜 기기들로 돌린다 (v. 26-1025-5, docs/ROADMAP.md '클라우드 문서 1MB 한도').
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/b7_siri.js 머리말과 같다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_fbzip.js
// 3단계(압축으로 쓰는 기기)가 쓴 문서를 서버 흉내(관리자)로 만들어 넣고, 이 버전이 그것을 읽는지 본다.
// 지키는 것:
//  ① 열려 있는 기기 A — 압축 문서가 오면 받아 화면에 넣는다
//  ② ⭐ 빈 기기 B 로그인 — 압축 문서로 시작한다. 아무것도 잃지 않는다
//  ③ B 가 고치면 — 압축 문서를 풀어 합친 뒤 올린다(이 단계는 예전 모양 json 으로). A 도 받는다
//  ④ ⭐ 깨진 압축 문서 — 받기는 건너뛰고, 올리기는 **쓰지 않는다**(덮어쓰지 않음) · 진단에 남는다
//  ⑤ 비교 화면에 '압축됨' · 기도노트의 풀기(DecompressionStream)가 브라우저에서 푼다
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'block7-8f24e';
const path = require('path'), zlib = require('zlib'), fs = require('fs');
const { chromium } = require('playwright-core');
require('firebase-admin/app').initializeApp({ projectId: 'block7-8f24e' });
const { getFirestore } = require('firebase-admin/firestore');
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/index.html';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const ref = getFirestore().doc('users/' + uid + '/data/state');
  const browser = await chromium.launch({ executablePath: EXE });
  async function open() {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
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
  const texts = (p, d, s) => p.evaluate(([d, s]) => getBigs(d, s).map(b => b.text), [d, s]);
  const cloud = async () => { const d = (await ref.get()).data(); const j = d.jz ? zlib.inflateRawSync(Buffer.from(d.jz)).toString() : d.json; return { d, st: JSON.parse(j) }; };
  const D = '2026-10-20';

  console.log('준비 — A 가 예전 모양으로 시작');
  const A = await open();
  await sleep(3000);
  // 3단계 기기도 같은 버전이다 — 더 높은 번호를 주면 열린 기기가 '새 버전' 이라며 새로고침해 받기 길을 시험하지 못한다
  const VER = await A.page.evaluate(() => APP_VERSION);
  const reloads = [];
  A.page.on('framenavigated', f => { if (f === A.page.mainFrame()) reloads.push('A'); });
  await A.page.evaluate(d => { beforeSave(); getBigs(d, 'am').push({ text: 'A 가 넣은 할일', done: false }); save(); }, D);
  await until(async () => { const c = await cloud(); return ((c.st.days[D] || {}).big || {}).am; });
  // 3단계 기기가 쓴 것처럼: 풀어서 할일 하나 더하고 압축해 다시 쓴다 (json 없이)
  {
    const c = await cloud();
    c.st.days[D].big.am.push({ text: '압축 기기가 넣은 할일', done: false });
    await ref.set({ jz: zlib.deflateRawSync(Buffer.from(JSON.stringify(c.st))), rev: c.d.rev + 1, dev: 'zip-device', devLabel: '압축 기기', appVer: VER, updatedAt: new Date() });
  }
  console.log('① 열려 있는 기기 A');
  const a1 = await until(async () => { const t = await texts(A.page, D, 'am'); return t.length === 2 ? t : null; });
  ok('⭐① A 가 압축 문서를 받아 넣는다', JSON.stringify(a1) === JSON.stringify(['A 가 넣은 할일', '압축 기기가 넣은 할일']), a1);

  ok('① 새로고침 없이 받기 길로', reloads.length === 0, reloads);
  console.log('② 빈 기기 B 로그인');
  const B = await open();
  const b1 = await until(async () => { const t = await texts(B.page, D, 'am'); return t.length === 2 ? t : null; });
  ok('⭐② B 가 압축 문서로 시작한다', JSON.stringify(b1) === JSON.stringify(['A 가 넣은 할일', '압축 기기가 넣은 할일']), b1);
  await sleep(2000);
  const c2 = await cloud();
  ok('⭐② 빈 기기 로그인 뒤 클라우드가 그대로 (잃지 않음)', JSON.stringify(c2.st.days[D].big.am.map(x => x.text)) === JSON.stringify(['A 가 넣은 할일', '압축 기기가 넣은 할일']), c2.st.days[D].big.am);

  console.log('③ B 가 고친다');
  await B.page.evaluate(d => { beforeSave(); getBigs(d, 'am').push({ text: 'B 가 넣은 할일', done: false }); save(); }, D);
  const c3 = await until(async () => { const c = await cloud(); return c.st.days[D].big.am.length === 3 ? c : null; });
  ok('③ 풀어 합친 뒤 올린다 (이 단계는 json)', !!c3 && !c3.d.jz && typeof c3.d.json === 'string', c3 && Object.keys(c3.d));
  const a3 = await until(async () => { const t = await texts(A.page, D, 'am'); return t.length === 3 ? t : null; });
  ok('③ A 도 받는다', !!a3, a3);

  console.log('④ 깨진 압축 문서');
  const revBad = c3.d.rev + 1;
  await ref.set({ jz: Buffer.from('이건 압축이 아니다'), rev: revBad, dev: 'broken', appVer: VER, updatedAt: new Date() });
  await sleep(2500);
  ok('④ 받기는 건너뜀 — A 화면 그대로', (await texts(A.page, D, 'am')).length === 3);
  await A.page.evaluate(d => { beforeSave(); getBigs(d, 'pm').push({ text: '깨진 동안 넣은 것', done: false }); save(); }, D);
  await sleep(4000);
  const bad = (await ref.get()).data();
  ok('⭐④ 올리기는 쓰지 않는다 — 깨진 문서가 그대로 (덮어쓰지 않음)', bad.rev === revBad && !bad.json && Buffer.from(bad.jz).toString() === '이건 압축이 아니다', { rev: bad.rev, json: !!bad.json });
  const err = await A.page.evaluate(() => { try { return _fbLastErr; } catch (e) { return 'scope'; } });
  ok('④ 진단에 남는다', err === 'scope' || (err && /풀 수 없어요/.test(err.msg)), err);
  // 되돌리기 — 제대로 된 압축 문서를 다시 넣으면 A 의 못 올린 것이 합쳐 올라간다
  await ref.set({ jz: zlib.deflateRawSync(Buffer.from(JSON.stringify(c3.st))), rev: revBad + 1, dev: 'zip-device', appVer: VER, updatedAt: new Date() });
  await A.page.evaluate(() => { beforeSave(); save(); });
  const c4 = await until(async () => { const c = await cloud(); return ((c.st.days[D].big || {}).pm || []).length ? c : null; }, 40000);
  ok('④ 고쳐지면 못 올린 것이 합쳐 올라간다', !!c4 && c4.st.days[D].big.pm[0].text === '깨진 동안 넣은 것' && c4.st.days[D].big.am.length === 3, c4 && c4.st.days[D].big);

  console.log('⑤ 비교 화면 · 기도노트 풀기');
  await ref.set({ jz: zlib.deflateRawSync(Buffer.from(JSON.stringify(c4.st))), rev: c4.d.rev + 1, dev: 'zip-device', appVer: VER, updatedAt: new Date() });
  await sleep(1500);
  await B.page.evaluate(() => checkDataRecovery());
  await sleep(1500);
  const rec = await B.page.evaluate(() => document.getElementById('dataRecoveryResult').textContent);
  ok('⑤ 비교 화면에 압축됨', /압축됨 \(풀면/.test(rec), rec.slice(0, 300));
  const PR = fs.readFileSync(path.join(__dirname, '..', '..', 'pray', 'index.html'), 'utf8');
  const fn = PR.slice(PR.indexOf('async function b7DocJson(d)'), PR.indexOf('function b7L() {'));
  const z64 = zlib.deflateRawSync(Buffer.from(JSON.stringify({ secs: [{ id: 'am', name: '오전' }] }))).toString('base64');
  const pj = await B.page.evaluate(async ([fn, z64]) => {
    const b7DocJson = new Function(fn + '; return b7DocJson;')();
    const u8 = Uint8Array.from(atob(z64), c => c.charCodeAt(0));
    return [await b7DocJson({ jz: firebase.firestore.Blob.fromUint8Array(u8) }), await b7DocJson({ json: '{"a":1}' })];
  }, [fn, z64]);
  ok('⑤ 기도노트 풀기 — 압축 · 예전 둘 다', JSON.parse(pj[0]).secs[0].name === '오전' && pj[1] === '{"a":1}', pj);

  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
