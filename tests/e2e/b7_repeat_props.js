// 반복 할일의 보조 속성(하위 · 메모 · 중요 · 연락할 일) — 범위 묻기가 **언제** 뜨는가 (HB 2026-11-01 B1)
// 자료가 어떻게 바뀌는지는 tests/test_repeat_props.js 가 본다. 여기는 화면의 때만 본다.
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_repeat_props.js
// 지키는 것:
//  ① 하위를 엔터로 줄줄이 넣는 동안은 묻지 않는다 → 칸에서 손을 떼면 **한 번** 묻는다
//  ② '모든 할일' → 내일 것에도 하위 · × 로 닫으면 그 날만
//  ③ 하위 × 지우기 · 메모 · 중요 표시도 묻는다
//  ④ 반복 아닌 할일은 묻지 않는다 · 하위 체크만 하면 묻지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await sleep(1500);
  const seed = () => p.evaluate(() => {
    const k = tKey(), nx = _dayKeyAfter(k);
    const B = getBigs(k, 'am'); B.length = 0;
    B.push({ text: '운동', done: false, daily: true, rid: 'e2e1', repeat: _taskRepDefault(), subs: [{ text: '스트레칭', done: false }], subOpen: true },
           { text: '빨래', done: false, subs: [{ text: '흰옷', done: false }], subOpen: true });
    const N = getBigs(nx, 'am'); N.length = 0;
    N.push({ text: '운동', done: false, daily: true, rid: 'e2e1', subs: [{ text: '스트레칭', done: false }] });
    save(); renderToday();
  });
  const asking = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
  const title = () => p.evaluate(() => document.getElementById('repScopeTitle').textContent);
  // 화면에 보이는 그 이름의 할일 (원본에서 '이 할일만' 을 고르면 원본은 감춰지고 바로 아래에 따로 선다)
  const subsOf = (which, name) => p.evaluate(([w, n]) => { const k = w === 'next' ? _dayKeyAfter(tKey()) : tKey(); const it = getBigs(k, 'am').find(x => x.text === n && !_repHiddenOn(x, k)); return (it.subs || []).map(s => s.text).join(); }, [which, name || '운동']);
  const addBox = name => p.evaluate(n => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === n && !_repHiddenOn(x, tKey())); document.getElementById(_subGhostId('big', 'am', i)).focus(); }, name);

  await seed(); await sleep(300);
  await addBox('운동');
  await p.keyboard.type('달리기'); await p.keyboard.press('Enter'); await sleep(200);
  await p.keyboard.type('샤워'); await p.keyboard.press('Enter'); await sleep(900);
  ok('① 엔터로 줄줄이 넣는 동안은 묻지 않는다', !(await asking()) && (await subsOf('today')) === '스트레칭,달리기,샤워', await subsOf('today'));
  await p.evaluate(() => document.activeElement.blur()); await sleep(900);
  ok('① 손을 떼면 묻는다', await asking());
  ok('① 묻는 말에 무엇을', (await title()).includes('하위 할일을'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('② 모든 할일 → 내일 것에도', (await subsOf('next')) === '스트레칭,달리기,샤워', await subsOf('next'));
  ok('② 한 번만 물었다', !(await asking()));

  // × 로 닫기 = 그 날만
  await addBox('운동'); await p.keyboard.type('물'); await p.keyboard.press('Enter'); await sleep(100);
  await p.evaluate(() => document.activeElement.blur()); await sleep(900);
  ok('② 두 번째 넣기도 묻는다', await asking());
  await p.evaluate(() => closeRepScope()); await sleep(300);
  ok('② × 는 그 날만', (await subsOf('today')).endsWith(',물') && !(await subsOf('next')).includes('물'), [await subsOf('today'), await subsOf('next')]);
  ok('② (원본이었으니) 원본은 감춰지고 그 날엔 따로 선 할일 하나만 보인다', await p.evaluate(() => [...document.querySelectorAll('#bl-am .bi-inp')].filter(e => e.offsetParent && e.value === '운동').length === 1));

  // 하위 지우기 (×)
  await p.evaluate(() => [...document.querySelectorAll('.sub-row .sub-del')].find(e => e.offsetParent).click()); await sleep(900);
  ok('③ 하위 지우기도 묻는다', await asking());
  await p.evaluate(() => _repScopePick('future')); await sleep(300);
  ok('③ 이후 → 내일 것에서도 빠진다', !(await subsOf('next')).includes('스트레칭'), await subsOf('next'));

  // 하위 체크만 → 묻지 않는다
  await p.evaluate(() => [...document.querySelectorAll('.sub-row .sub-chk')].find(e => e.offsetParent).click()); await sleep(900);
  ok('④ 하위 체크만 하면 묻지 않는다', !(await asking()));

  // 중요 표시
  await p.evaluate(() => _doToggleFlag('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())))); await sleep(500);
  ok('③ 중요 표시도 묻는다', await asking() && (await title()).includes('중요 표시를'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('③ 내일 것도 중요', await p.evaluate(() => !!getBigs(_dayKeyAfter(tKey()), 'am')[0].flag));

  // 메모
  await p.evaluate(() => openTaskMemo('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())), true)); await sleep(300);
  await p.evaluate(() => { document.getElementById('memoEdit').value = '헬스장 6시'; }); await sleep(100);
  await p.evaluate(() => _memoSaveEdit()); await sleep(900);
  ok('③ 메모 창이 떠 있는 동안은 묻지 않는다', !(await asking()));
  await p.evaluate(() => closeTaskMemo()); await sleep(1000);
  ok('③ 메모 창을 닫으면 묻는다', await asking() && (await title()).includes('메모를'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('③ 내일 것에도 메모', await p.evaluate(() => getBigs(_dayKeyAfter(tKey()), 'am')[0].memo === '헬스장 6시'));

  // 반복 아닌 할일
  await addBox('빨래'); await p.keyboard.type('수건'); await p.keyboard.press('Enter'); await sleep(100);
  await p.evaluate(() => document.activeElement.blur()); await sleep(900);
  ok('④ 반복 아닌 할일은 묻지 않는다', !(await asking()) && (await p.evaluate(() => getBigs(tKey(), 'am').find(x => x.text === '빨래').subs.map(s => s.text).join())) === '흰옷,수건');

  await b.close();
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
