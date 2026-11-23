// 교역자 로테이션 1123-B B3d — 앱을 '다시 열 때'(로그인 기억됨) 무엇이 몇 초 걸리는지 잰다. 지어낸 이름만.
// 돌리는 법: tests/rules/README.md (저장소 맨 위에서 python3 -m http.server 8765 를 먼저 띄운다)
//   npx firebase emulators:exec --only firestore,auth --project demo-rota "node rota.perf.mjs"
// 숫자는 시험 기계 · 에뮬레이터 기준이다 — 실제 아이패드는 네트워크 왕복이 더해진다(느린 망 흉내도 함께 잰다).
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { createRequire } from 'module';
const req = createRequire(import.meta.url); let pw; try { pw = req('playwright'); } catch (_) { pw = req('/opt/node-tools/node_modules/playwright'); } const { chromium } = pw;
import fs from 'fs'; import path from 'path';
const ROOT = 'http://localhost:8765/rotation/', NM = path.resolve('node_modules/firebase');
const env = await initializeTestEnvironment({ projectId: 'demo-rota', firestore: { rules: fs.readFileSync('rota.rules', 'utf8'), host: '127.0.0.1', port: 8089 } });
const admin = async (fn) => { let out; await env.withSecurityRulesDisabled(async c => { out = await fn(c.firestore()); }); return out; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 30000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = await fn(); if (v) return v; } catch (_) { } await sleep(50); } return null; }
const su = await (await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pw123456', returnSecureToken: true }) })).json();
const HB = su.localId;
const browser = await chromium.launch();

// 지어낸 책 — 미리보기 책(demoBook)을 N 주로 늘린다(앞으로 지난 기록이 쌓인 모양)
async function bigBook(weeks) {
  const ctx = await browser.newContext(); const pg = await ctx.newPage();
  await pg.route('https://www.gstatic.com/**', r => r.abort()); await pg.route('https://fonts.*/**', r => r.abort());
  await pg.goto(ROOT + '?demo=1'); await pg.waitForTimeout(300);
  const b = await pg.evaluate((w) => { const src = demoBook.toString().replace('addDays(sun0, -14)', `addDays(sun0, -7 * ${w - 10})`).replace('i < 10', `i < ${w}`).replace('order[i]', 'order[i % 10]');
    const b = JSON.parse(JSON.stringify((0, eval)('(' + src + ')')())); return { b, team: teamOf(b), wkeys: wkeysOf(b) }; }, weeks);
  await ctx.close(); return b;
}
// 구글 자료 표 · 카톡 글 · 예배팀 · 연락처 — 지어낸 크기 비슷한 것(모양은 앱이 읽다 버려도 상관없음: 시간만 잰다)
const filler = (n) => Array.from({ length: n }, (_, i) => ({ k: 'r' + i, v: '가나다라마바사 '.repeat(3) + i }));

async function device(net) {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 } });
  await ctx.route('https://www.gstatic.com/firebasejs/**', r => { const f = r.request().url().split('/').pop(); r.fulfill({ path: path.join(NM, f), contentType: 'text/javascript' }); });
  await ctx.route('https://asia-northeast3-block7-8f24e.cloudfunctions.net/**', r => r.abort());
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort()); await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  await ctx.addInitScript(() => {
    const T = window.__T = []; const mark = (ev, x) => T.push(Object.assign({ t: Math.round(performance.now()), ev }, x || {}));
    let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) { fb = v;
      if (v && v.initializeApp && !v.__emu) { v.__emu = 1; mark('firebase-app 스크립트'); const orig = v.initializeApp.bind(v);
        v.initializeApp = (cfg, name) => { const app = orig(Object.assign({}, cfg, { projectId: 'demo-rota' }), name); mark('initializeApp');
          const au = app.auth(); au.useEmulator('http://127.0.0.1:9099', { disableWarnings: true });
          const oa = au.onAuthStateChanged.bind(au); au.onAuthStateChanged = (f) => oa((u) => { mark('로그인 상태 옴', { user: !!u }); return f(u); });
          const db = app.firestore(); db.useEmulator('127.0.0.1', 8089);
          const DR = Object.getPrototypeOf(db.doc('a/b')), CR = Object.getPrototypeOf(db.collection('a')), QR = Object.getPrototypeOf(CR);
          const wrap = (proto, kind) => { const os = proto.onSnapshot; proto.onSnapshot = function (...a) { const p = this.path || '(query)'; const i = a.findIndex(x => typeof x === 'function'); let first = true; mark('듣기 시작', { p });
            if (i >= 0) { const f = a[i]; a[i] = (s) => { if (first) { first = false; let sz = 0; try { sz = s.data ? JSON.stringify(s.data() || null).length : JSON.stringify(s.docs.map(d => d.data())).length; } catch (_) { } mark('첫 응답', { p, sz, cache: !!(s.metadata && s.metadata.fromCache) }); } const t0 = performance.now(); const r = f(s); const dt = performance.now() - t0; if (dt > 30) mark('응답 처리', { p, ms: Math.round(dt) }); return r; };
              const j = a.findIndex((x, k) => k > i && typeof x === 'function'); if (j > 0) { const g = a[j]; a[j] = (e) => { mark('듣기 실패', { p, e: e && e.code }); return g(e); }; } }
            return os.apply(this, a); }; };
          wrap(DR, 'doc'); if (QR && QR.onSnapshot) wrap(QR, 'query'); else wrap(CR, 'col');
          const og = QR.get; QR.get = function (...a) { mark('팀 찾기 시작'); return og.apply(this, a).then(r => { mark('팀 찾기 끝', { n: r.size }); return r; }, e => { mark('팀 찾기 실패', { e: e.code }); throw e; }); };
          return app; }; } } });
    // '맞추는 중…' 글자가 메뉴에서 사라진 때
    new MutationObserver(() => { const m = document.querySelector('#menu'); const on = !!(m && m.textContent.includes('맞추는 중')); if (on !== window.__wait) { window.__wait = on; mark(on ? "메뉴 '맞추는 중…' 보임" : "메뉴 '맞추는 중…' 사라짐"); } }).observe(document, { subtree: true, childList: true, characterData: true });
  });
  const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message));
  if (net) { const c = await ctx.newCDPSession(pg); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: net.lat, downloadThroughput: net.down, uploadThroughput: net.up }); if (net.cpu) await c.send('Emulation.setCPUThrottlingRate', { rate: net.cpu }); }
  return { ctx, pg };
}

async function run(label, weeks, net) {
  const { b: book, team, wkeys } = await bigBook(weeks);
  await admin(async db => { await db.doc('rota/' + HB).set({ b18: book, team, wkeys, wpull: true, v: 'seed', at: 1 });   // 앱이 쓰는 모양 그대로 — 열 때 다시 쓰지 않게
    await db.doc(`rota/${HB}/gs/bteam`).set({ rows: filler(400), h: 'x', at: 1 }); await db.doc(`rota/${HB}/gs/bserve`).set({ rows: filler(200), h: 'y', at: 1 });
    await db.doc(`rota/${HB}/gs/phones`).set({ list: filler(150), at: 1 }); await db.doc(`rota/${HB}/kt/hb`).set({ v: 1, items: {} });
    await db.doc(`rota/${HB}/ext/worship`).set({ services: filler(60), at: 1 }); });
  const size = JSON.stringify(book).length;
  const { ctx, pg } = await device(net);
  // 1) 처음 로그인(빈 기기) — 이 기기 사본이 없을 때
  await pg.goto(ROOT); await pg.waitForTimeout(300);
  await pg.evaluate(async () => { await fbInit(); window.__T.push({ t: Math.round(performance.now()), ev: '로그인 누름' }); await FB.auth.signInWithEmailAndPassword('hb@example.com', 'pw123456'); });
  await until(() => pg.evaluate(() => FB.synced));
  const first = await pg.evaluate(() => window.__T);
  await sleep(1500);
  // 2) 앱을 다시 연다 — 로그인 기억 · 이 기기 사본 있음 (HB 가 겪는 '처음 열 때')
  await pg.goto(ROOT); await pg.evaluate(() => openMenu());   // 열자마자 메뉴를 연 사람처럼
  await pg.evaluate(() => { const b = document.querySelector('[data-mtab="acct"]'); if (b) b.click(); });
  await until(() => pg.evaluate(() => FB.synced));
  await sleep(1500);
  const re = await pg.evaluate(() => window.__T);
  const nav = await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) }; });
  const ls = await pg.evaluate(() => (localStorage.getItem('rota_book_v1') || '').length);
  await ctx.close();
  const show = (T) => T.filter(x => !/듣기 시작/.test(x.ev) || /rota\/[^/]+$/.test(x.p || '')).map(x => `    ${String(x.t).padStart(6)}ms  ${x.ev}${x.p ? ' ' + x.p.replace(HB, '{HB}') : ''}${x.sz ? ' · ' + Math.round(x.sz / 1024) + 'KB' : ''}${x.ms ? ' · ' + x.ms + 'ms' : ''}${x.cache ? ' (사본)' : ''}${x.n !== undefined ? ' · ' + x.n + '개' : ''}${x.e ? ' · ' + x.e : ''}`).join('\n');
  console.log(`\n■ ${label} — 책 ${weeks}주 · ${Math.round(size / 1024)}KB (이 기기 사본 ${Math.round(ls / 1024)}KB)`);
  console.log('  [빈 기기 로그인]\n' + show(first));
  console.log(`  [다시 열기] DOMContentLoaded ${nav.dcl}ms · load ${nav.load}ms\n` + show(re));
  if (pg.errs.length) console.log('  오류:', pg.errs.slice(0, 3));
}
const SLOW = { lat: 150, down: 1.5e6 / 8 * 8, up: 750e3 / 8 * 8, cpu: 4 };   // 느린 망 흉내: 왕복 150ms · 1.5MB/s · CPU 4배 느림
const LTE = { lat: 80, down: 4e6, up: 1e6, cpu: 2 };
await run('빠름(시험 기계)', 160, null);
await run('LTE 흉내', 160, LTE);
await run('느린 망 흉내', 160, SLOW);
await run('느린 망 흉내', 400, SLOW);
await browser.close(); await env.cleanup();
