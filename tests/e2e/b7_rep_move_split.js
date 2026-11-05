// 반복 할일 하위를 적은 직후 우클릭 → (하위 물음에 답) → 이동 · 내일로 · 이 날만 (HB 2026-11-05 신고)
// 예전: 하위 물음에서 '이 할일만'(또는 ×)이면 원본이 숨고 그 날의 할일이 따로 서는데, 먼저 열린 메뉴는 숨은 원본을
//       가리켜 **원본이 옮겨지고** 화면의 할일은 남았다 → 남은 것을 '이번 및 이후' 로 지우면 앞으로 올 주가 다 사라졌다.
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_rep_move_split.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  for (const CH of ['one', 'x', 'future']) {
    console.log(`하위 물음에 '${CH}'`);
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500);
    const look = () => p.evaluate(() => { const base = logicalNow(); return [0, 1, 7, 14].map(n => { const d = new Date(base); d.setDate(d.getDate() + n); const k = tKey(d);
      return getDisplayTasks(k, 'am', 'big').filter(x => x.text === '분파 보고서' && !_repHiddenOn(x, k)).length; }); });
    const dlg = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
    await p.evaluate(() => { ST.days = {}; viewDate = logicalNow(); getBigs(tKey(), 'am').push({ text: '분파 보고서', done: false });
      _taskSetRepeat('big', 'am', 0, 'w'); const it = getBigs(tKey(), 'am')[0]; it.subs = [{ text: '김', done: false }]; it.subOpen = true; save(); renderToday(); });
    await sleep(400);
    await p.evaluate(() => document.getElementById(_subGhostId('big', 'am', 0)).focus());
    for (const n of ['노', '방']) { await p.keyboard.type(n); await p.keyboard.press('Enter'); await sleep(200); }
    const bx = await p.evaluate(() => { const e = [...document.querySelectorAll('input,textarea,[contenteditable]')].find(e => (e.value || e.textContent || '').trim() === '분파 보고서' && e.offsetParent); const r = e.getBoundingClientRect(); return { x: r.right + 20, y: r.top + r.height / 2 }; });
    await p.mouse.click(bx.x, bx.y, { button: 'right' }); await sleep(900);
    ok('우클릭에 하위 물음이 뜬다', await dlg());
    if (CH === 'x') await p.evaluate(() => closeRepScope()); else await p.evaluate(c => _repScopePick(c), CH);
    await sleep(700);
    await p.locator('#taskMenu .task-menu-item:visible').filter({ hasText: '이동' }).first().click().catch(() => {}); await sleep(300);
    await p.locator('#taskMenu .task-menu-item:visible').filter({ hasText: '내일로' }).first().click(); await sleep(500);
    await p.click('#repScopeList >> text=이 날만 옮기기'); await sleep(1200);
    const [t0, t1, w1, w2] = await look();
    ok('⭐ 오늘 칸에서 사라진다 (화면의 그 할일이 옮겨졌다)', t0 === 0, t0);
    ok('내일에 하나', t1 === 1, t1);
    ok('⭐ 다음 주 · 다다음 주 반복 그대로', w1 === 1 && w2 === 1, [w1, w2]);
    ok('하위 셋이 함께 갔다', await p.evaluate(() => (getBigs(_dayKeyAfter(tKey()), 'am')[0].subs || []).length) === 3);
    await p.context().close();
  }
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
