// 설정 동기화 — 늦게 새 버전이 된 기기 · 기기 전용 설정 (docs/ROADMAP.md '설정창 개선 · 동기화 충돌 정리' B-1 · B-2)
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/b7_fbzip_write.js 와 같다(에뮬레이터 · 크로미움).
//   NODE_PATH=<emu>/node_modules node tests/e2e/b7_setting_late.js
// 지키는 것:
//  ① ⭐ B-2 — 옛 버전으로 마지막에 맞춘 기기 B(그 설정 키를 모름)가 새 버전으로 처음 켜질 때,
//     그사이 A 가 정한 '일정 이름 길이' 3 을 처음값 12 로 덮지 않는다 · 충돌로 잡지도 않는다
//  ② ⭐ B-1 — '지금 보는 말씀' · '말씀 마지막 표시 날짜' 는 기기마다 다르다. 클라우드의 그 칸이 바뀌어도
//     (강제 올리기 · 다른 기기) 충돌로 잡히지 않는다 · 비교 화면에도 '차이' 로 나오지 않는다 ·
//     강제 올리기('이 기기의 로컬 데이터로 클라우드 덮어쓰기')가 이 기기 값을 클라우드에 올리지 않는다
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'block7-8f24e';
const path = require('path'), zlib = require('zlib');
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
(async () => {
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const ref = getFirestore().doc('users/' + uid + '/data/state');
  const cloud = async () => { const d = (await ref.get()).data(); const raw = d.jz ? zlib.inflateRawSync(Buffer.from(d.jz)).toString() : d.json; return { d, st: JSON.parse(raw) }; };
  const browser = await chromium.launch({ executablePath: EXE });
  // 기기 하나 = 브라우저 칸 하나. 로그인은 칸에 남는다(아이폰 홈 화면 앱처럼 늘 로그인된 채 켜진다).
  // seed: 켜기 전에 이 기기 저장 칸을 채운다 — 옛 버전으로 쓰던 기기 흉내
  async function device() {
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
    const D = { ctx, page: null };
    D.open = async (seed) => {
      if (D.page) { await D.page.close(); await sleep(500); }
      const page = await ctx.newPage();
      if (seed) await page.addInitScript(s => { for (const k in s) localStorage.setItem(k, s[k]); }, seed);
      page.on('pageerror', e => console.log('   [오류] ' + e.message));
      await page.goto(APP);
      await page.waitForFunction(() => window.firebase && firebase.apps.length, null, { timeout: 20000 });
      if (!seed) await page.evaluate(() => firebase.auth().currentUser || firebase.auth().signInWithEmailAndPassword('hb@example.com', 'pray1234'));
      await page.waitForFunction(() => firebase.auth().currentUser, null, { timeout: 10000 });
      D.page = page; return D;
    };
    await D.open();
    return D;
  }
  const open = async () => device();
  const conflicts = p => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('b7v1_conflicts') || '[]').filter(r => !r.resolvedAt).map(r => r.entityId); } catch (e) { return ['?']; } });

  // ── 시드: 기기 S 가 클라우드를 만든다 ──
  const S = await open();
  await until(async () => { try { return (await cloud()).st.settings; } catch (e) { return null; } });
  await sleep(2500);
  const VER = await S.page.evaluate(() => APP_VERSION);
  await S.ctx.close();

  console.log('① B-2 — 늦게 새 버전이 된 기기');
  {
    // B 가 옛 버전으로 마지막에 맞춘 모양: evChipMax 를 모른다 (기준점에도 · 이 기기 상태에도 없음)
    const c0 = await cloud();
    const old = JSON.parse(JSON.stringify(c0.st)); delete old.settings.evChipMax;
    const oldJson = JSON.stringify(old);
    // 그 사이 A(새 버전)가 '일정 이름 길이' 를 3 으로 — 클라우드 rev+1
    const neu = JSON.parse(oldJson); neu.settings.evChipMax = 3;
    const B = await device(); await sleep(3000);       // B 가 로그인해 둔 기기 (옛 버전 시절)
    await B.page.close(); B.page = null; await sleep(500);
    const r0 = (await cloud()).d.rev;
    await ref.set({ json: JSON.stringify(neu), rev: r0 + 1, dev: 'devA', devLabel: '맥', appVer: VER, updatedAt: new Date() });
    const now = Date.now();
    await B.open({ b7v1: oldJson, b7v1_syncbase: oldJson, b7v1_syncmeta: JSON.stringify({ rev: r0, uid, at: now - 1000 }), b7v1_stsaved: String(now), b7v1_owner: uid });
    await until(() => B.page.evaluate(() => { try { return _fbHasPending && !_fbHasPending(); } catch (e) { return true; } }), 8000);
    await sleep(4000);
    const c1 = await cloud();
    const bv = await B.page.evaluate(() => ST.settings.evChipMax);
    if (process.env.DBG) console.log(await B.page.evaluate(() => ({ cf: localStorage.getItem('b7v1_conflicts'), base: (JSON.parse(localStorage.getItem('b7v1_syncbase')||'{}').settings||{}).evChipMax, meta: localStorage.getItem('b7v1_syncmeta') })));
    ok('⭐① 클라우드의 3 이 그대로', c1.st.settings.evChipMax === 3, c1.st.settings.evChipMax);
    ok('⭐① B 도 3 을 받는다', bv === 3, bv);
    const cf = await conflicts(B.page);
    ok('⭐① 충돌로 잡지 않는다', !cf.includes('settings/evChipMax'), cf);
    await B.ctx.close();
  }

  console.log('② B-1 — 기기마다 다른 말씀 자리');
  {
    const A = await open(); await sleep(3000);
    const B = await open(); await sleep(3000);
    await A.page.evaluate(() => setVerseIdx(50)); await sleep(2500);
    await B.page.evaluate(() => setVerseIdx(80)); await sleep(2500);
    ok('② 각자 제 자리', JSON.stringify([await A.page.evaluate(() => ST.settings.verseCurrentIdx), await B.page.evaluate(() => ST.settings.verseCurrentIdx)]) === '[50,80]');
    ok('② 평소엔 충돌 없음', (await conflicts(A.page)).concat(await conflicts(B.page)).filter(x => /verse(CurrentIdx|LastShown)/.test(x)).length === 0);
    // B 는 잠시 꺼져 있다(아이폰 앱을 닫음). 그동안 A 에서 '이 기기의 로컬 데이터로 클라우드 덮어쓰기' (데이터 복구)
    await B.page.close(); B.page = null; await sleep(500);
    const frozen = (await cloud()).st.settings.verseCurrentIdx;
    await A.page.evaluate(() => { window.appConfirm = (m, f) => f(); fbForceUploadLocal(); });
    await sleep(3000);
    const c2 = await cloud();
    ok('② 강제 올리기도 이 기기 말씀 자리를 클라우드에 올리지 않는다', c2.st.settings.verseCurrentIdx === frozen, { 전: frozen, 뒤: c2.st.settings.verseCurrentIdx });
    // 고친 뒤에도 같은 길을 시험하려고 — 클라우드의 그 칸을 다른 기기가 움직인 것처럼 만든다
    await ref.set({ jz: zlib.deflateRawSync(Buffer.from(JSON.stringify(Object.assign(c2.st, { settings: Object.assign(c2.st.settings, { verseCurrentIdx: 50 }) })))), rev: c2.d.rev + 1, dev: 'devX', devLabel: '패드', appVer: VER, updatedAt: new Date() });
    await B.open(); await sleep(4000);
    await B.page.evaluate(() => setVerseIdx(81)); await sleep(3000);
    const cfB = await conflicts(B.page);
    ok('⭐② 클라우드 칸이 바뀌어도 충돌 아님', cfB.filter(x => /verse(CurrentIdx|LastShown)/.test(x)).length === 0, cfB);
    ok('② B 는 제 자리 그대로', (await B.page.evaluate(() => ST.settings.verseCurrentIdx)) === 81);
    await B.page.evaluate(() => checkDataRecovery()); await sleep(2500);
    const txt = await B.page.evaluate(() => document.getElementById('dataRecoveryResult').innerText);
    ok('⭐② 비교 화면에 말씀 자리가 차이로 나오지 않는다', !/지금 보는 말씀|말씀 마지막 표시/.test(txt), (txt.match(/.*(지금 보는 말씀|말씀 마지막 표시).*/g) || []));
    await A.ctx.close(); await B.ctx.close();
  }
  await browser.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
