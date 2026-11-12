// 할일 메뉴 '날짜 완료 후 다음' (HB 2026-11-12) — 메뉴 줄을 누르면 달력 → 완료한 날을 고르면 한 뎁스 판 → 다음 할일 자리
// 규칙 · 단위 시험은 tests/test_next_after_done.js 시나리오 10
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_next_done_day.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const open = async (w, touch) => {
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: 900 }, hasTouch: !!touch, deviceScaleFactor: SHOT ? 2 : 1 })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500);
    await p.evaluate(() => { ST.days = {}; viewDate = _todayDateObj(); getBigs(tKey(), 'am').push({ text: '분파 보고서', done: false }); save(); renderToday(); });
    await p.evaluate(() => { const d = _todayDateObj(); openTaskMenu('big', 'am', 0, null, { x: 300, y: 200 }); });
    await sleep(500);
    return p;
  };
  const K = n => `(()=>{const d=_todayDateObj();d.setDate(d.getDate()+(${n}));return tKey(d);})()`;
  const pickDone = async (p, n, touch) => {
    if (touch) await p.tap('#tmGrp_nextP'); else await p.click('#tmGrp_nextP');
    await sleep(300);
    const k = await p.evaluate(K(n));
    await p.evaluate(k => { const i = document.getElementById('nextDoneDatePickerInput'); i.value = k; i.dispatchEvent(new Event('change')); }, k);
    await sleep(500);
    return k;
  };
  const texts = (p, expr) => p.evaluate(`(()=>{const k=${expr};return getBigs(k,'am').map(x=>x.text+(x.done?'✓':''));})()`);

  console.log('PC 폭 · 마우스');
  { const p = await open(1280);
    ok('메뉴에 줄이 있다 (어제 완료 후 다음 바로 아래)', await p.evaluate(() => { const r = document.getElementById('tmGrp_nextP'); return r && r.offsetParent && r.previousElementSibling.id === 'tmGrp_nextY'; }));
    ok('완료한 날 달력은 오늘까지만', await p.evaluate(() => document.getElementById('nextDoneDatePickerInput').max === todayKey()));
    await p.hover('#tmGrp_nextP'); await sleep(400);
    ok('올리기만 해서는 판이 안 열린다', await p.evaluate(() => document.getElementById('tmSub_nextP').style.display === 'none'));
    if (SHOT) await p.locator('#taskMenu').screenshot({ path: SHOT + '/menu.png' });
    const k = await pickDone(p, -3);
    ok('완료한 날을 고르면 판이 열린다', await p.evaluate(() => document.getElementById('tmSub_nextP').style.display !== 'none'));
    const lbl = await p.textContent('#nextDoneRowText');
    ok('줄 글자가 고른 날로 바뀐다', /^\d+\/\d+ 완료 후 다음$/.test(lbl), lbl);
    if (SHOT) await p.screenshot({ path: SHOT + '/panel.png' });
    await p.locator('#tmSub_nextP .task-menu-item:visible').filter({ hasText: '내일로' }).first().click(); await sleep(900);
    ok('⭐ 3일 전 칸에 완료로', JSON.stringify(await texts(p, K(-3))) === '["분파 보고서✓"]', await texts(p, K(-3)));
    ok('오늘 칸에서는 빠졌다', (await texts(p, K(0))).length === 0);
    const t1 = await texts(p, K(1));
    ok('⭐ 내일에 다음 할일 · 날짜를 적은 글', t1.length === 1 && /^분파 보고서 \d+\/\d+ 완료했고, 이제$/.test(t1[0]), t1);
    await p.context().close(); }

  console.log('폰 폭 · 손가락');
  { const p = await open(390, true);
    await pickDone(p, -2, true);
    ok('판이 메뉴 자리에서 바뀐다', await p.evaluate(() => document.getElementById('taskMenuMain').style.display === 'none' && document.getElementById('tmSub_nextP').style.display !== 'none'));
    ok('되돌아가기 줄에 고른 날', /\d+\/\d+ 완료 후 다음/.test(await p.textContent('#nextPBackText')));
    if (SHOT) await p.screenshot({ path: SHOT + '/phone.png' });
    await p.locator('#tmSub_nextP .task-menu-item:visible').filter({ hasText: '오늘로' }).first().tap(); await sleep(900);
    ok('⭐ 2일 전 칸에 완료로', JSON.stringify(await texts(p, K(-2))) === '["분파 보고서✓"]');
    const t0 = await texts(p, K(0));
    ok('⭐ 오늘에 "…에 했고, 이제 오늘"', t0.length === 1 && /에 했고, 이제 오늘$/.test(t0[0]), t0);
    // 다시 열면 고른 날은 비워져 있다
    await p.evaluate(() => openTaskMenu('big', 'am', 0, null, { x: 100, y: 200 })); await sleep(400);
    ok('메뉴를 다시 열면 줄 글자가 처음대로', (await p.textContent('#nextDoneRowText')) === '날짜 완료 후 다음');
    await p.context().close(); }

  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
