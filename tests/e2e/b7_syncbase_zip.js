// 동기화 기준점 압축 — 진짜 앱 기기들을 에뮬레이터에 붙여 '빈 기기로 로그인' 까지 돌린다 (v. 26-1107-9, ROADMAP 1107-SW 6).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/b7_fbzip_write.js 와 같다 (규칙: users/{uid}/** 주인 허락).
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_syncbase_zip.js
// 지키는 것:
//  ① 자료가 많은 기기 A — 기준점이 압축 모양(z1:)으로 적히고 ST 보다 훨씬 작다 · 되풀면 클라우드와 같다
//  ② ⭐ 빈 기기 B 로그인 — 다 받는다 · 클라우드가 그대로 · B 의 기준점도 압축
//  ③ ⭐ B 가 꺼진 채(오프라인) 하나 지우고 하나 더함 · 그사이 A 도 하나 더함 → B 다시 켬
//      = 압축 기준점으로 3자 병합: 지운 것은 지운 채 · 셋 다 산다
//  ④ ⭐ B 의 기준점이 깨졌다 → 기준점 없음으로 켠다 · 클라우드에서 아무것도 안 잃는다
//  ⑤ 예전 모양(JSON 그대로) 기준점으로 켜도 병합이 맞다 (이 판을 처음 받는 기기)
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
const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
// 앱의 압축 도구 · 기준점 풀기를 그대로 떠 온다 (앱 안에서는 로그인 구역 안이라 바깥에서 안 보인다)
new Function(SRC.slice(SRC.indexOf('<script id="fflate">') + 20, SRC.indexOf('</script>', SRC.indexOf('<script id="fflate">'))))();
const { _lszUnpack } = new Function(SRC.slice(SRC.indexOf('function _lszPack(json){'), SRC.indexOf('// ── 3자 병합 엔진 ──')) + ';return {_lszPack,_lszUnpack};')();
const NV = new Function(SRC.slice(SRC.indexOf('const NAVIGATOR_VERSES='), SRC.indexOf('];', SRC.indexOf('const NAVIGATOR_VERSES=')) + 2) + ';return NAVIGATOR_VERSES;')();
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const ref = getFirestore().doc('users/' + uid + '/data/state');
  const browser = await chromium.launch({ executablePath: EXE });
  async function newCtx() {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, route => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    await ctx.addInitScript(() => {
      window.confirm = () => true;
      let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) {
        fb = v; const init = v.initializeApp.bind(v);
        v.initializeApp = (...a) => { const app = init(...a); if (!a[1]) { v.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); v.firestore().useEmulator('127.0.0.1', 8080); } return app; };
      } });
    });
    return ctx;
  }
  // 앱을 연다 — 로그인이 남아 있으면(같은 칸 다시 켜기) 그대로, 없으면 로그인
  async function boot(ctx, page) {
    page = page || await ctx.newPage();
    page.on('pageerror', e => console.log('   [오류] ' + e.message));
    await page.goto(APP);
    await page.waitForFunction(() => typeof _prayTodoPull === 'function' && window.firebase && firebase.apps.length, null, { timeout: 20000 });
    await sleep(1500);
    if (!(await page.evaluate(() => !!firebase.auth().currentUser))) {
      await page.evaluate(() => firebase.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'));
    }
    await page.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 15000 });
    await sleep(3000);
    return page;
  }
  const cloud = async () => { const d = (await ref.get()).data(); const raw = d.jz ? zlib.inflateRawSync(Buffer.from(d.jz)).toString() : d.json; return { d, st: JSON.parse(raw), raw }; };
  const D = '2026-11-07';
  const texts = (p, sec) => p.evaluate(([d, s]) => getBigs(d, s).map(b => b.text), [D, sec]);
  const lsRaw = p => p.evaluate(() => ({ b: localStorage.getItem(_lsk('syncbase')) || '', st: (localStorage.getItem(LS_KEY) || '').length }));
  const lsInfo = async p => { const r = await lsRaw(p), c = await cloud(); return { tag: r.b.slice(0, 3), base: r.b.length, st: r.st, same: _lszUnpack(r.b) === c.raw }; };
  const idle = p => until(() => p.evaluate(() => !window._fbHasPending()), 20000);

  console.log('① 자료가 많은 기기 A');
  const actx = await newCtx();
  const A = await boot(actx);
  await A.evaluate(([NV, D]) => {
    beforeSave();
    const verses = [];
    for (let r = 0; r < 8; r++) NV.forEach((v, i) => verses.push({ cat: v.cat, topic: v.topic + ' ' + r, krText: v.krText + (r ? ' (' + r + '번째 묵상)' : ''), ref: v.ref, tags: [v.cat], hi: '', d: '2026-10-' + String(1 + (i % 28)).padStart(2, '0'), row: r * 200 + i + 2 }));
    ST.verseCollections.push({ id: 'big1', name: '큰 모음', verses });
    getBigs(D, 'am').push({ text: '할일 하나', done: false });
    getBigs(D, 'am').push({ text: '할일 둘', done: false });
    save();
  }, [NV, D]);
  const c1 = await until(async () => { const c = await cloud(); return c.st.verseCollections.some(x => x.id === 'big1') && c.st.days[D] ? c : null; }, 30000);
  await idle(A);
  const ia = await lsInfo(A);
  ok('① 기준점이 압축 모양', ia.tag === 'z1:', ia);
  ok('⭐① ST 의 3분의 1 아래 (겹침 없는 실제 말씀 본문은 약 3.9배)', ia.base * 3 < ia.st, ia);
  ok('⭐① 되풀면 클라우드와 글자 하나 다르지 않다', ia.same);
  console.log('     ST ' + ia.st + ' 자 · 기준점 ' + ia.base + ' 자 (' + (ia.st / ia.base).toFixed(1) + '배 작음)');

  console.log('② 빈 기기 B 로그인');
  const bctx = await newCtx();
  let B = await boot(bctx);
  const b2 = await until(() => B.evaluate(d => { const c = ST.verseCollections.find(x => x.id === 'big1'); const t = getBigs(d, 'am').map(b => b.text); return c && t.length === 2 ? [c.verses.length, t] : null; }, D));
  ok('⭐② B 가 다 받는다', !!b2 && b2[0] === NV.length * 8, b2);
  await sleep(2500);
  const c2 = await cloud();
  ok('⭐② 클라우드가 그대로', c2.st.verseCollections.find(x => x.id === 'big1').verses.length === NV.length * 8 && c2.st.days[D].big.am.length === 2);
  const ib = await lsInfo(B);
  ok('② B 의 기준점도 압축', ib.tag === 'z1:' && ib.same, ib);

  console.log('③ B 오프라인 편집 · 그사이 A 편집 → B 다시 켬');
  await idle(B);
  await B.evaluate(() => firebase.firestore().disableNetwork());
  await B.evaluate(d => { beforeSave(); const a = getBigs(d, 'am'); a.splice(a.findIndex(x => x.text === '할일 하나'), 1); getBigs(d, 'pm').push({ text: 'B 가 꺼진 채 넣음', done: false }); save(); }, D);
  await sleep(1500);
  await A.evaluate(d => { beforeSave(); getBigs(d, 'night').push({ text: 'A 가 그사이 넣음', done: false }); save(); }, D);
  await until(async () => { const c = await cloud(); return ((c.st.days[D].big || {}).night || []).length; });
  await B.close();
  B = await boot(bctx);      // 같은 칸(저장 칸 그대로) — 네트워크는 다시 켜진다
  const b3 = await until(async () => { const am = await texts(B, 'am'), pm = await texts(B, 'pm'), nt = await texts(B, 'night'); return nt.length ? { am, pm, nt } : null; });
  ok('⭐③ 지운 것은 지운 채 (압축 기준점으로 병합)', !!b3 && JSON.stringify(b3.am) === JSON.stringify(['할일 둘']), b3);
  ok('⭐③ B 가 넣은 것 · A 가 넣은 것 둘 다', !!b3 && b3.pm[0] === 'B 가 꺼진 채 넣음' && b3.nt[0] === 'A 가 그사이 넣음', b3);
  const c3 = await until(async () => { const c = await cloud(); const g = c.st.days[D].big; return (g.pm || []).length && g.am.length === 1 ? c : null; });
  ok('⭐③ 클라우드에도 그대로 올라갔다', !!c3 && c3.st.days[D].big.night.length === 1 && c3.st.verseCollections.find(x => x.id === 'big1').verses.length === NV.length * 8, c3 && c3.st.days[D].big);
  const a3 = await until(async () => { const am = await texts(A, 'am'); return am.length === 1 ? am : null; });
  ok('③ A 도 받는다', !!a3, a3);

  console.log('④ B 의 기준점이 깨졌다');
  await idle(B);
  await B.evaluate(() => { const k = _lsk('syncbase'), v = localStorage.getItem(k); localStorage.setItem(k, v.slice(0, Math.floor(v.length / 2))); });
  await B.close();
  B = await boot(bctx);
  const b4 = await until(async () => { const am = await texts(B, 'am'), pm = await texts(B, 'pm'), nt = await texts(B, 'night'); return am.length && pm.length && nt.length ? { am, pm, nt } : null; });
  ok('⭐④ 클라우드를 그대로 받는다', !!b4 && b4.am.length === 1 && b4.pm.length === 1 && b4.nt.length === 1, b4);
  await sleep(2500);
  const c4 = await cloud();
  ok('⭐④ 클라우드에서 아무것도 안 잃었다', c4.st.days[D].big.am.length === 1 && c4.st.days[D].big.pm.length === 1 && c4.st.days[D].big.night.length === 1 && c4.st.verseCollections.find(x => x.id === 'big1').verses.length === NV.length * 8);
  ok('④ 새 기준점이 다시 압축으로', (await lsInfo(B)).tag === 'z1:');

  console.log('⑤ 예전 모양 기준점으로 켜기');
  await idle(B);
  { const r = await lsRaw(B); const j = _lszUnpack(r.b); ok('⑤ 준비 — 지금 기준점을 풀었다', !!j && j[0] === '{');
    await B.evaluate(j => localStorage.setItem(_lsk('syncbase'), j), j); }   // 예전 판이 남긴 모양(JSON 그대로)
  await B.evaluate(() => firebase.firestore().disableNetwork());
  await B.evaluate(d => { beforeSave(); getBigs(d, 'pm').length = 0; save(); }, D);   // 꺼진 채 하나 지움
  await sleep(1000);
  await B.close();
  B = await boot(bctx);
  const b5 = await until(async () => { const pm = await texts(B, 'pm'), am = await texts(B, 'am'); return am.length ? { am, pm } : null; });
  ok('⭐⑤ 예전 모양 기준점으로도 지운 것은 지운 채', !!b5 && b5.pm.length === 0 && b5.am.length === 1, b5);
  const c5 = await until(async () => { const c = await cloud(); return !(c.st.days[D].big.pm || []).length ? c : null; });
  ok('⑤ 클라우드에 반영 · 나머지는 그대로', !!c5 && c5.st.days[D].big.am.length === 1 && c5.st.days[D].big.night.length === 1);
  await idle(B);
  ok('⑤ 다음 기준점부터 압축 모양', (await lsInfo(B)).tag === 'z1:');

  await browser.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
