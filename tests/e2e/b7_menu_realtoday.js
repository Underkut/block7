// 지난날을 보며 할일 메뉴 '이동 · 내일로' · '복제 · 오늘로' · 반복 할일 '이 날만' → 진짜 오늘 기준 (HB 2026-11-12)
// 예전: 보이는 날을 오늘로 쳐서 그 다음 날로 갔다. 규칙 · 단위 시험은 tests/test_menu_realtoday.js
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_menu_realtoday.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const open = async () => {
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500);
    return p;
  };
  // 진짜 오늘 + n 의 날짜 키 · 5일 전으로 화면을 옮기고 할일 하나
  const K = n => `(()=>{const d=_todayDateObj();d.setDate(d.getDate()+(${n}));return tKey(d);})()`;
  const setup = (p, rep) => p.evaluate(([rep]) => {
    ST.days = {}; const d = _todayDateObj(); d.setDate(d.getDate() - 5); viewDate = d;
    getBigs(tKey(), 'am').push({ text: '분파 보고서', done: false });
    if (rep) _taskSetRepeat('big', 'am', 0, 'w');
    save(); renderToday();
  }, [rep]);
  const rclick = async p => {
    const bx = await p.evaluate(() => { const e = [...document.querySelectorAll('input,textarea,[contenteditable]')].find(e => (e.value || e.textContent || '').trim() === '분파 보고서' && e.offsetParent); const r = e.getBoundingClientRect(); return { x: r.right + 20, y: r.top + r.height / 2 }; });
    await p.mouse.click(bx.x, bx.y, { button: 'right' }); await sleep(700);
  };
  const pick = async (p, grp, row) => {
    await p.locator('#taskMenu .task-menu-item:visible').filter({ hasText: grp }).first().click(); await sleep(300);
    await p.locator(`#tmSub_${grp === '이동' ? 'move' : 'dup'} .task-menu-item:visible`).filter({ hasText: row }).first().click(); await sleep(600);
  };
  const cnt = (p, n) => p.evaluate(k => getDisplayTasks(k, 'am', 'big').filter(x => x.text === '분파 보고서' && !(typeof _repHiddenOn === 'function' && _repHiddenOn(x, k))).length, null).catch(() => -1);
  const at = (p, expr) => p.evaluate(`(()=>{const k=${expr};return getDisplayTasks(k,'am','big').filter(x=>x.text==='분파 보고서'&&!_repHiddenOn(x,k)).length;})()`);

  console.log('5일 전을 보며 이동 · 내일로');
  { const p = await open(); await setup(p, false); await rclick(p);
    // 메뉴 줄 옆 개수도 진짜 내일을 센다 — 진짜 내일에 할일 둘을 미리 넣어 둔다
    await p.evaluate(k => { getBigs(k, 'pm').push({ text: 'a', done: false }, { text: 'b', done: false }); }, await p.evaluate(K(1)));
    await p.evaluate(() => _fillTaskMenuCounts());
    await p.locator('#taskMenu .task-menu-item:visible').filter({ hasText: '이동' }).first().click(); await sleep(300);
    const n = await p.evaluate(() => [...document.querySelectorAll('#tmSub_move .task-menu-item')].find(r => r.textContent.includes('내일로')).querySelector('.task-menu-cnt').textContent);
    ok('메뉴의 내일로 옆 숫자 = 진짜 내일의 할일 수(2)', n === '2', n);
    await p.locator('#tmSub_move .task-menu-item:visible').filter({ hasText: '내일로' }).first().click(); await sleep(600);
    ok('⭐ 진짜 내일에 있다', await at(p, K(1)) === 1);
    ok('⭐ 보던 날 다음 날(4일 전)에는 없다', await at(p, K(-4)) === 0);
    ok('보던 날(5일 전)에서는 빠졌다', await at(p, K(-5)) === 0);
    await p.context().close(); }

  console.log('5일 전을 보며 복제 · 오늘로');
  { const p = await open(); await setup(p, false); await rclick(p); await pick(p, '복제', '오늘로');
    ok('⭐ 진짜 오늘에 사본', await at(p, K(0)) === 1);
    ok('원본은 5일 전에 그대로', await at(p, K(-5)) === 1);
    await p.context().close(); }

  console.log('5일 전의 매주 반복 할일 · 이동 · 다음 주로 · 이 날만');
  { const p = await open(); await setup(p, true); await rclick(p); await pick(p, '이동', '다음 주로');
    await p.click('#repScopeList >> text=이 날만 옮기기'); await sleep(900);
    ok('⭐ 진짜 오늘+7 에 하루짜리', await p.evaluate(`(()=>{const k=${K(7)};return getBigs(k,'am').filter(x=>x.text==='분파 보고서'&&!x.rid).length;})()`) === 1);
    ok('5일 전 그 날은 빠졌다', await at(p, K(-5)) === 0);
    ok('반복은 그대로 (5일 전 + 7)', await at(p, K(2)) === 1);
    await p.context().close(); }

  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
