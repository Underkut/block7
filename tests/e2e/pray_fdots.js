// 한 장 기도의 빛 알갱이 — 위 · 아래 절반에서 세로로 밀어 양 고르기 (HB 1028-3 2).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_fdots.js
//  ① 처음값: 올라가는 것 16 · 내려오는 것 3
//  ② 아래 절반 위로 밀기 = 올라가는 것 늘기 · 아래로 = 줄기 / 위 절반 아래로 = 내려오는 것 늘기 · 위로 = 줄기
//  ③ 고른 양은 다시 열어도 그대로 · 옆으로 밀기(카드 넘기기)는 양을 안 바꾼다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  const start = () => p.evaluate(() => { const a = newTarget('person', '가람'), c = newTarget('person', '다온'); DB.T.push(a, c); focusStart([{ id: a.id, sec: 'top' }, { id: c.id, sec: 'top' }], 0); });
  await start(); await sleep(500);
  const cnt = () => p.evaluate(() => ({ up: document.querySelectorAll('#focus .pt:not(.dn):not(.gone)').length, dn: document.querySelectorAll('#focus .pt.dn:not(.gone)').length }));
  ok('① 처음값 16 · 3', JSON.stringify(await cnt()) === '{"up":16,"dn":3}', await cnt());
  const drag = (x, y0, dx, dy) => p.evaluate(([x, y0, dx, dy]) => new Promise(res => {
    const tg = document.elementFromPoint(x, y0), T = (a, b) => new Touch({ identifier: 1, target: tg, clientX: a, clientY: b });
    const fire = (n, a, b) => tg.dispatchEvent(new TouchEvent(n, { bubbles: true, cancelable: true, touches: n === 'touchend' ? [] : [T(a, b)], changedTouches: [T(a, b)] }));
    fire('touchstart', x, y0); let k = 1;
    const iv = setInterval(() => { if (k <= 10) { fire('touchmove', x + dx * k / 10, y0 + dy * k / 10); k++; } else { clearInterval(iv); fire('touchend', x + dx, y0 + dy); setTimeout(res, 500); } }, 25);
  }), [x, y0, dx, dy]);
  await drag(200, 640, 0, -160); ok('⭐② 아래 절반 위로 160px → 올라가는 것 +10', (await cnt()).up === 26, await cnt());
  await drag(200, 520, 0, 96); ok('② 아래 절반 아래로 → 줄기 (-6)', (await cnt()).up === 20, await cnt());
  await drag(200, 200, 0, 240); ok('⭐② 위 절반 아래로 240px → 내려오는 것 +15', (await cnt()).dn === 18, await cnt());
  await drag(200, 380, 0, -400); ok('② 위 절반 위로 많이 → 0 아래로는 안 감', (await cnt()).dn === 0, await cnt());
  await drag(200, 600, -60, 4); await sleep(300);
  ok('③ 옆으로 밀기는 양을 안 바꿈', JSON.stringify(await cnt()) === '{"up":20,"dn":0}', await cnt());
  await p.evaluate(() => closeFocus()); await start(); await sleep(500);
  ok('⭐③ 다시 열어도 고른 양 그대로', JSON.stringify(await cnt()) === '{"up":20,"dn":0}', await cnt());
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
