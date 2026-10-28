// 한 장 기도 '잠시 멈춤' (HB 1028-3 3) — '이전' 과 '다음에' 사이 단추.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_pause.js
//  ① 단추 차례: 이전 · 잠시 멈춤 · 다음에 · 아멘
//  ② 멈추면 시간이 서고 '잠시 멈춤 · 누르면 이어서' · 멈춘 동안은 기도 시간에 안 든다
//  ③ 앱을 벗어났다 와도 손으로 멈춘 것은 멈춘 채 · 아무 데나 누르면 이어짐
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => { const a = newTarget('person', '가람'), c = newTarget('person', '다온'); DB.T.push(a, c); focusStart([{ id: a.id, sec: 'top' }, { id: c.id, sec: 'top' }], 0); });
  await sleep(400);
  ok('① 단추 차례', (await p.evaluate(() => [...document.querySelectorAll('#fBtns button')].map(x => x.getAttribute('aria-label') || x.textContent).join('|'))) === '이전|잠시 멈춤|다음에|아멘');
  await sleep(1200);
  await p.click('[data-a="focus-pause"]'); await sleep(400);
  const s1 = await p.evaluate(() => focusSecs());
  ok('② 멈춤 — 안내가 보임', await p.evaluate(() => getComputedStyle(document.querySelector('.f-veil')).opacity === '1'));
  await sleep(2100);
  ok('⭐② 멈춘 동안 시간이 안 감', Math.abs((await p.evaluate(() => focusSecs())) - s1) < 0.05, [s1, await p.evaluate(() => focusSecs())]);
  // 앱을 벗어났다 돌아옴
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(1100);
  ok('⭐③ 돌아와도 멈춘 채', await p.evaluate(() => F.hold && F.paused && document.getElementById('focus').classList.contains('held')) && Math.abs((await p.evaluate(() => focusSecs())) - s1) < 0.05);
  await p.touchscreen.tap(200, 420); await sleep(1300);
  ok('⭐③ 아무 데나 누르면 이어짐 · 시간이 다시 감', await p.evaluate(() => !F.hold && !document.getElementById('focus').classList.contains('held')) && (await p.evaluate(() => focusSecs())) > s1 + 1);
  await p.evaluate(() => closeFocus());
  const L = await p.evaluate(() => { const L = DB.log[dayOf(Date.now())]; return L.ses.map(x => x.d); });
  ok('② 기록된 시간에 멈춘 3초가 빠짐 (약 2~3초)', L.length === 1 && L[0] >= 2 && L[0] <= 3, L);
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
