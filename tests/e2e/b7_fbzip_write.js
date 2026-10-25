// 클라우드 문서 압축 — 3단계(쓰기)를 진짜 기기들로 돌린다 (v. 26-1025-6, docs/ROADMAP.md '클라우드 문서 1MB 한도').
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/b7_siri.js 머리말과 같다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_fbzip_write.js
// 지키는 것:
//  ① 예전 모양(json) 문서로 시작한 빈 기기 A — 그대로 받는다
//  ② ⭐ HB 아이폰과 같은 처지 — 풀면 1MB 가 넘는 자료가 **압축으로 올라간다** (json 은 안 씀 · 한도 아래)
//  ③ ⭐ 빈 기기 B 로그인 — 다 받는다 · 클라우드가 그대로 (잃지 않음)
//  ④ B 가 고치면 A 가 받는다 (압축 문서 받기)
//  ⑤ ⭐ 옛 버전 기기가 json 으로 덮어써도 — 새 기기들이 합집합으로 되살려 압축으로 다시 올린다
//  ⑥ 자동 백업도 압축 · 비교 화면에 '압축됨'
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
async function until(fn, ms = 20000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
// 진짜 말씀 본문(앱에 든 네비게이토 180)으로 1MB 넘는 모음을 만든다 — 같은 글자 반복이면 압축이 너무 잘 돼 시험이 안 된다
const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
const NV = new Function(SRC.slice(SRC.indexOf('const NAVIGATOR_VERSES='), SRC.indexOf('];', SRC.indexOf('const NAVIGATOR_VERSES=')) + 2) + ';return NAVIGATOR_VERSES;')();
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
  const cloud = async () => { const d = (await ref.get()).data(); const raw = d.jz ? zlib.inflateRawSync(Buffer.from(d.jz)).toString() : d.json; return { d, st: JSON.parse(raw), raw: Buffer.byteLength(raw), stored: d.jz ? Buffer.from(d.jz).length : Buffer.byteLength(d.json) }; };
  const D = '2026-10-20';

  console.log('① 예전 모양으로 시작');
  // 지금의 운영 클라우드처럼 json 문서 — 먼저 한 기기(시드)가 만들게 하고, 관리자가 json 으로 다시 쓴다
  const S = await open();
  await sleep(3000);
  const VER = await S.page.evaluate(() => APP_VERSION);
  await S.page.evaluate(d => { beforeSave(); getBigs(d, 'am').push({ text: '예전 문서의 할일', done: false }); save(); }, D);
  await until(async () => { const c = await cloud(); return ((c.st.days[D] || {}).big || {}).am; });
  { const c = await cloud(); await ref.set({ json: JSON.stringify(c.st), rev: c.d.rev + 1, dev: 'old', devLabel: '맥', appVer: VER, updatedAt: new Date() }); }
  await S.ctx.close();
  const A = await open();
  const a1 = await until(async () => { const t = await texts(A.page, D, 'am'); return t.length ? t : null; });
  ok('① 빈 기기 A 가 예전 문서를 받는다', JSON.stringify(a1) === JSON.stringify(['예전 문서의 할일']), a1);

  console.log('② 풀면 1MB 넘는 자료');
  await A.page.evaluate(NV => {
    beforeSave();
    const verses = [];
    for (let r = 0; r < 14; r++) NV.forEach((v, i) => verses.push({ cat: v.cat, topic: v.topic + ' ' + r, krText: v.krText + (r ? ' (' + r + '번째 묵상: ' + v.topic + ')' : ''), ref: v.ref, tags: [v.cat], hi: '', d: '2026-10-' + String(1 + (i % 28)).padStart(2, '0'), row: r * 200 + i + 2 }));
    ST.verseCollections.push({ id: 'big1', name: '큰 모음', verses });
    getBigs('2026-10-20', 'am').push({ text: '큰 자료와 함께 넣은 할일', done: false });
    save();
  }, NV);
  const c2 = await until(async () => { const c = await cloud(); return c.st.verseCollections.some(x => x.id === 'big1') ? c : null; }, 30000);
  ok('⭐② 압축으로 올라갔다 (json 없음)', !!c2 && !!c2.d.jz && !('json' in c2.d), c2 && Object.keys(c2.d));
  ok('⭐② 풀면 1MB 넘는데 저장은 한도 아래', !!c2 && c2.raw > 1048576 && c2.stored < 600 * 1024, c2 && { 풀면KB: Math.round(c2.raw / 1024), 저장KB: Math.round(c2.stored / 1024) });
  ok('② 할일도 함께', !!c2 && c2.st.days[D].big.am.length === 2);
  if (c2) console.log('     풀면 ' + Math.round(c2.raw / 1024) + ' KB → 저장 ' + Math.round(c2.stored / 1024) + ' KB (' + (c2.raw / c2.stored).toFixed(1) + '배)');

  console.log('③ 빈 기기 B 로그인');
  const B = await open();
  const b1 = await until(() => B.page.evaluate(d => { const c = ST.verseCollections.find(x => x.id === 'big1'); const t = getBigs(d, 'am').map(b => b.text); return c && t.length === 2 ? [c.verses.length, t] : null; }, D));
  ok('⭐③ B 가 다 받는다', !!b1 && b1[0] === 2520, b1);
  await sleep(3000);
  const c3 = await cloud();
  ok('⭐③ 클라우드가 그대로 (잃지 않음)', c3.st.verseCollections.find(x => x.id === 'big1').verses.length === 2520 && c3.st.days[D].big.am.length === 2);

  console.log('④ B 가 고치면 A 가 받는다');
  await B.page.evaluate(d => { beforeSave(); getBigs(d, 'pm').push({ text: 'B 가 넣은 할일', done: false }); save(); }, D);
  const a4 = await until(async () => { const t = await texts(A.page, D, 'pm'); return t.length ? t : null; });
  ok('④ A 가 받는다', JSON.stringify(a4) === JSON.stringify(['B 가 넣은 할일']), a4);

  console.log('⑤ 옛 버전 기기가 json 으로 덮어쓴다');
  {
    const c = await cloud();
    const old = JSON.parse(JSON.stringify(c.st));
    old.verseCollections = old.verseCollections.filter(x => x.id !== 'big1');   // 옛 기기는 큰 모음을 모른다
    old.days[D].big.pm = [];                                                      // B 의 것도 모른다
    // 옛 기기가 **다른 날** 넣은 것 — 같은 칸에 넣은 것은 '이 기기 우선' 규칙으로 빠진다(압축 전 버전도 같다 — 2026-10-25 두 버전으로 견줌)
    old.days['2026-10-21'] = { big: { pm: [{ text: '옛 기기가 넣은 할일', done: false }] }, small: {}, trash: [] };
    await ref.set({ json: JSON.stringify(old), rev: c.d.rev + 1, dev: 'legacy', devLabel: '옛 아이패드', appVer: 'v. 26-1025-4', updatedAt: new Date() });
  }
  const c5 = await until(async () => { const c = await cloud(); return c.d.jz && c.d.appVer === VER && ((c.st.days['2026-10-21'] || {}).big || {}).pm ? c : null; }, 30000);
  if (!c5) { const c = await cloud(); console.log('     [진단] 클라우드:', JSON.stringify({ jz: !!c.d.jz, appVer: c.d.appVer, dev: c.d.dev, rev: c.d.rev, am: c.st.days[D].big.am.map(x => x.text), pm: (c.st.days[D].big.pm || []).map(x => x.text), big: c.st.verseCollections.some(x => x.id === 'big1') }));
    console.log('     [진단] A:', JSON.stringify(await A.page.evaluate(d => ({ am: getBigs(d, 'am').map(b => b.text), pm: getBigs(d, 'pm').map(b => b.text), err: (() => { try { return _fbLastErr; } catch (e) { return 'scope'; } })() }), D))); }
  ok('⭐⑤ 되살려 압축으로 다시 올린다', !!c5, c5 && { jz: !!c5.d.jz, appVer: c5.d.appVer });
  ok('⭐⑤ 아무것도 안 잃었다 (큰 모음 · B 의 할일 · 옛 기기의 할일)', !!c5 && c5.st.verseCollections.some(x => x.id === 'big1') && c5.st.days[D].big.pm.length === 1 && c5.st.days[D].big.am.length === 2 && c5.st.days['2026-10-21'].big.pm[0].text === '옛 기기가 넣은 할일', c5 && c5.st.days[D].big);

  console.log('⑥ 자동 백업 · 비교 화면');
  const bk = await getFirestore().collection('users/' + uid + '/data').get();
  const backs = bk.docs.filter(d => /^backup_/.test(d.id)).map(d => d.data());
  ok('⑥ 자동 백업도 압축', backs.length > 0 && backs.every(b => b.jz && !('json' in b)), backs.map(b => Object.keys(b)));
  await A.page.evaluate(() => checkDataRecovery());
  await sleep(2000);
  const rec = await A.page.evaluate(() => document.getElementById('dataRecoveryResult').textContent);
  ok('⑥ 비교 화면에 압축됨', /압축됨 \(풀면/.test(rec), rec.slice(0, 200));

  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
