// 반복 할일의 보조 속성(하위 · 메모 · 중요 · 연락할 일) — 범위 묻기가 **언제** 뜨는가 (HB 2026-11-01 B1 · 고침 v. 26-1101-3)
// 자료가 어떻게 바뀌는지는 tests/test_repeat_props.js 가 본다. 여기는 화면의 때만 본다.
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_repeat_props.js
// 지키는 것:
//  ① 하위를 넣은 **그 순간** 묻는다 (v. 26-1101-1 은 커서가 칸에 남아 있으면 기다려, 아이폰에선 다른 날로 가서야 떴다)
//     묻는 동안 자판은 내려가 있고, 고르면 하위 추가 칸으로 커서가 돌아온다
//  ② 이어서 넣는 하위는 다시 묻지 않고 같은 범위로 (엔터로 줄줄이)
//  ③ × 로 닫으면 그 날만 · 묻는 말에 할일 이름
//  ④ 하위 글자 고치기 · × 지우기 · 메모 · 중요 표시도 묻는다
//  ⑤ 반복 아닌 할일은 묻지 않는다 · 하위 체크만 하면 묻지 않는다
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
           { text: '빨래', done: false, subs: [{ text: '흰옷', done: false }], subOpen: true },
           { text: '독서', done: false, daily: true, rid: 'e2e2', repeat: _taskRepDefault(), subs: [{ text: '1장', done: false }], subOpen: true });
    const N = getBigs(nx, 'am'); N.length = 0;
    N.push({ text: '운동', done: false, daily: true, rid: 'e2e1', subs: [{ text: '스트레칭', done: false }] },
           { text: '독서', done: false, daily: true, rid: 'e2e2', subs: [{ text: '1장', done: false }] });
    _repSess = null; save(); renderToday();
  });
  const asking = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
  const title = () => p.evaluate(() => document.getElementById('repScopeTitle').textContent);
  // 화면에 보이는 그 이름의 할일 (원본에서 '이 할일만' 을 고르면 원본은 감춰지고 바로 아래에 따로 선다)
  const subsOf = (which, name) => p.evaluate(([w, n]) => { const k = w === 'next' ? _dayKeyAfter(tKey()) : tKey(); const it = getBigs(k, 'am').find(x => x.text === n && !_repHiddenOn(x, k)); return (it.subs || []).map(s => s.text).join(); }, [which, name || '운동']);
  const addBox = name => p.evaluate(n => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === n && !_repHiddenOn(x, tKey())); document.getElementById(_subGhostId('big', 'am', i)).focus(); }, name);
  const focusCls = () => p.evaluate(() => document.activeElement ? document.activeElement.className : '');

  await seed(); await sleep(300);
  await addBox('운동');
  await p.keyboard.type('달리기'); await p.keyboard.press('Enter'); await sleep(350);
  ok('① 넣은 그 순간 묻는다 (커서가 칸에 남아 있어도)', await asking());
  ok('① 묻는 동안 자판은 내려가 있다(칸에 커서 없음)', !/sub-add|sub-inp/.test(await focusCls()), await focusCls());
  ok('③ 묻는 말에 할일 이름 · 무엇을', /「운동」/.test(await title()) && (await title()).includes('하위 할일을'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('① 모든 할일 → 내일 것에도', (await subsOf('next')) === '스트레칭,달리기', await subsOf('next'));
  ok('① 고르면 하위 추가 칸으로 커서가 돌아온다', (await focusCls()) === 'sub-add', await focusCls());
  await p.keyboard.type('샤워'); await p.keyboard.press('Enter'); await sleep(350);
  ok('② 이어서 넣으면 다시 묻지 않는다', !(await asking()));
  ok('② 같은 범위로 내일 것에도 곧바로', (await subsOf('next')) === '스트레칭,달리기,샤워', await subsOf('next'));
  ok('② 커서는 추가 칸 그대로', (await focusCls()) === 'sub-add', await focusCls());
  await p.evaluate(() => document.activeElement.blur()); await sleep(300);

  // 다른 반복 할일 → 새로 묻는다 · × = 그 날만
  await addBox('독서'); await p.keyboard.type('2장'); await p.keyboard.press('Enter'); await sleep(350);
  ok('③ 다른 할일이면 새로 묻는다', await asking() && /「독서」/.test(await title()), await title());
  await p.evaluate(() => closeRepScope()); await sleep(300);
  ok('③ × 는 그 날만', (await subsOf('today', '독서')) === '1장,2장' && (await subsOf('next', '독서')) === '1장', [await subsOf('today', '독서'), await subsOf('next', '독서')]);
  ok('③ × 뒤에도 커서가 돌아온다', (await focusCls()) === 'sub-add', await focusCls());
  await p.evaluate(() => document.activeElement.blur()); await sleep(300);

  // 하위 글자 고치기 → Enter 로 끝내면 묻는다 (세션 지움)
  await p.evaluate(() => { _repSess = null; });
  await p.evaluate(() => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())); const pn = document.getElementById(_subGhostId('big', 'am', i)).closest('.sub-panel'); const inp = pn.querySelectorAll('.sub-inp')[0]; inp.focus(); inp.value = '스트레칭 10분'; inp.oninput(); });
  await p.keyboard.press('Enter'); await sleep(400);
  ok('④ 하위 글자를 고치고 엔터 → 묻는다', await asking());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('④ 내일 것에도 고친 글자', (await subsOf('next')).startsWith('스트레칭 10분'), await subsOf('next'));
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(200);

  // 하위 × 지우기
  await p.evaluate(() => { _repSess = null; });
  await p.evaluate(() => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())); const pn = document.getElementById(_subGhostId('big', 'am', i)).closest('.sub-panel'); pn.querySelector('.sub-row .sub-del').click(); }); await sleep(400);
  ok('④ 하위 × 지우기도 곧바로 묻는다', await asking());
  await p.evaluate(() => _repScopePick('future')); await sleep(300);
  ok('④ 이후 → 내일 것에서도 빠진다', !(await subsOf('next')).includes('스트레칭'), await subsOf('next'));

  // 하위 체크만 → 묻지 않는다
  await p.evaluate(() => [...document.querySelectorAll('.sub-row .sub-chk')].find(e => e.offsetParent).click()); await sleep(500);
  ok('⑤ 하위 체크만 하면 묻지 않는다', !(await asking()));

  // 중요 표시
  await p.evaluate(() => _doToggleFlag('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())))); await sleep(400);
  ok('④ 중요 표시도 곧바로 묻는다', await asking() && (await title()).includes('중요 표시를'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('④ 내일 것도 중요', await p.evaluate(() => !!getBigs(_dayKeyAfter(tKey()), 'am').find(x => x.text === '운동').flag));

  // 메모 — 창이 떠 있는 동안은 묻지 않고, 닫으면 묻는다
  await p.evaluate(() => openTaskMemo('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())), true)); await sleep(300);
  await p.evaluate(() => { document.getElementById('memoEdit').value = '헬스장 6시'; _memoSaveEdit(); }); await sleep(700);
  ok('④ 메모 창이 떠 있는 동안은 묻지 않는다', !(await asking()));
  await p.evaluate(() => closeTaskMemo()); await sleep(900);
  ok('④ 메모 창을 닫으면 묻는다', await asking() && (await title()).includes('메모를'), await title());
  await p.evaluate(() => _repScopePick('all')); await sleep(300);
  ok('④ 내일 것에도 메모', await p.evaluate(() => getBigs(_dayKeyAfter(tKey()), 'am').find(x => x.text === '운동').memo === '헬스장 6시'));

  // 반복 아닌 할일
  await addBox('빨래'); await p.keyboard.type('수건'); await p.keyboard.press('Enter'); await sleep(400);
  ok('⑤ 반복 아닌 할일은 묻지 않는다', !(await asking()) && (await p.evaluate(() => getBigs(tKey(), 'am').find(x => x.text === '빨래').subs.map(s => s.text).join())) === '흰옷,수건');

  await b.close();
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
