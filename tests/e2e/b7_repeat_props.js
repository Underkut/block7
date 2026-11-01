// 반복 할일의 보조 속성(하위 · 메모 · 중요 · 연락할 일) — 범위 묻기가 **언제** 뜨는가
// (HB 2026-11-01 B1 → C안 v. 26-1101-4: 하위는 **편집을 마치고 나올 때 한 번**, 모아서 묻는다)
// 자료가 어떻게 바뀌는지는 tests/test_repeat_props.js 가 본다. 여기는 화면의 때만 본다.
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_repeat_props.js
// 지키는 것:
//  ① 편집 중(하위 칸에 커서)에는 줄줄이 넣어도 묻지 않고, 다른 날에도 아직 안 퍼진다
//  ② 마침 신호마다 한 번 묻는다 — 판 바깥 누름(커서가 남아 있어도 · 아이폰 흉내) · 빈 추가 칸에서 엔터 ·
//     다른 날로 넘김(넘기기 전에) · 판 접기. 묻는 말에 할일 이름과 "n개 추가 · n개 삭제"
//  ③ 편집 중의 × 는 모아서 · 편집 중이 아닐 때의 × 는 곧바로
//  ④ 숨은 '이어 쓰기' 없음 — 지우기에서 고른 범위가 만들기에 조용히 쓰이지 않는다 (HB 신고 2026-11-01)
//  ⑤ 같은 손가락의 클릭이 묻는 창 바깥(=그 날만)에 떨어지지 않는다
//  ⑥ 중요 표시는 곧바로 · 메모는 창을 닫을 때 · 반복 아닌 할일 · 하위 체크는 묻지 않는다
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
    viewDate = logicalNow(); renderToday();
    const k = tKey(), nx = _dayKeyAfter(k);
    const B = getBigs(k, 'am'); B.length = 0;
    B.push({ text: '운동', done: false, daily: true, rid: 'e2e1', repeat: _taskRepDefault(), subs: [{ text: '스트레칭', done: false }], subOpen: true },
           { text: '빨래', done: false, subs: [{ text: '흰옷', done: false }], subOpen: true },
           { text: '독서', done: false, daily: true, rid: 'e2e2', repeat: _taskRepDefault(), subs: [{ text: '1장', done: false }], subOpen: true });
    const N = getBigs(nx, 'am'); N.length = 0;
    N.push({ text: '운동', done: false, daily: true, rid: 'e2e1', subs: [{ text: '스트레칭', done: false }] },
           { text: '독서', done: false, daily: true, rid: 'e2e2', subs: [{ text: '1장', done: false }] });
    save(); renderToday();
  });
  const asking = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
  const title = () => p.evaluate(() => document.getElementById('repScopeTitle').textContent);
  const subsOf = (which, name) => p.evaluate(([w, n]) => { const k = w === 'next' ? _dayKeyAfter(tKey()) : tKey(); const it = getBigs(k, 'am').find(x => x.text === n && !_repHiddenOn(x, k)); return (it.subs || []).map(s => s.text).join(); }, [which, name || '운동']);
  const panelSel = name => p.evaluate(n => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === n && !_repHiddenOn(x, tKey())); return '#' + _subGhostId('big', 'am', i); }, name);
  const addBox = async name => { await p.evaluate(sel => document.querySelector(sel).focus(), await panelSel(name)); };
  // 아이폰처럼 — 커서를 그대로 둔 채 판 바깥(머리 줄)을 손가락으로 누른다
  const tapOutsideKeepFocus = () => p.evaluate(() => {
    const el = document.querySelector('.hdr') || document.body; const o = { bubbles: true, pointerType: 'touch', isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o));
  });
  const pick = sc => p.evaluate(sc => _repScopePick(sc), sc);

  await seed(); await sleep(300);
  // ① · ② 판 바깥 누름 (커서 남김)
  await addBox('운동');
  await p.keyboard.type('달리기'); await p.keyboard.press('Enter'); await sleep(250);
  await p.keyboard.type('샤워'); await p.keyboard.press('Enter'); await sleep(700);
  ok('① 편집 중에는 줄줄이 넣어도 묻지 않는다', !(await asking()));
  ok('① 아직 다른 날엔 안 퍼졌다', (await subsOf('next')) === '스트레칭', await subsOf('next'));
  ok('① 커서는 추가 칸 그대로', await p.evaluate(() => document.activeElement.className) === 'sub-add');
  await tapOutsideKeepFocus(); await sleep(200);
  ok('⑤ 손을 뗀 그 순간엔 아직 안 뜬다 (클릭이 창 바깥에 떨어지지 않게)', !(await asking()));
  await sleep(400);
  ok('② 판 바깥을 누르면 묻는다 — 커서가 칸에 남아 있어도', await asking());
  ok('② 묻는 말: 할일 이름 · 2개 추가', /「운동」/.test(await title()) && /2개 추가/.test(await title()), await title());
  await p.evaluate(() => _repScopeOvClick()); await sleep(100);
  ok('⑤ 막 뜬 창의 바깥 누름은 무시 (그 날만으로 닫히지 않는다)', await asking());
  await pick('all'); await sleep(300);
  ok('② 모든 할일 → 내일 것에도 둘 다', (await subsOf('next')) === '스트레칭,달리기,샤워', await subsOf('next'));

  // ④ HB 신고: 지우기에서 고른 범위가 만들기에 조용히 쓰이면 안 된다
  await p.evaluate(sel => document.querySelector(sel).closest('.sub-panel').querySelector('.sub-row .sub-del').click(), await panelSel('운동')); await sleep(300);
  ok('③ 편집 중이 아닐 때의 × 는 곧바로 묻는다', await asking() && /1개 삭제/.test(await title()), await title());
  await pick('all'); await sleep(300);
  await addBox('운동'); await p.keyboard.type('물'); await p.keyboard.press('Enter'); await sleep(300);
  ok('④ 이어서 만들어도 몰래 퍼지지 않는다', (await subsOf('next')) === '달리기,샤워', await subsOf('next'));
  // ② 빈 추가 칸에서 엔터 = 마침
  await p.keyboard.press('Enter'); await sleep(500);
  ok('② 빈 추가 칸에서 엔터(입력 끝) → 묻는다', await asking() && /1개 추가/.test(await title()), await title());
  await p.evaluate(() => closeRepScope()); await sleep(300);
  ok('② × 로 닫으면 그 날만', (await subsOf('today')).endsWith(',물') && !(await subsOf('next')).includes('물'), [await subsOf('today'), await subsOf('next')]);

  // ③ 편집 중의 × 는 모아서
  await addBox('독서'); await p.keyboard.type('2장'); await p.keyboard.press('Enter'); await sleep(250);
  { // 진짜 손가락으로 × 를 톡 (판 안 누름이 함께 들어간다)
    const sel = await panelSel('독서');
    const h = await p.evaluateHandle(sel => document.querySelector(sel).closest('.sub-panel').querySelector('.sub-row .sub-del'), sel);
    await h.asElement().tap(); await sleep(700);
  }
  ok('③ 편집 중의 × 는 바로 안 묻는다 (모은다)', !(await asking()));
  // ② 다른 날로 넘기면 — 넘기기 전에
  await p.evaluate(() => navigateDate(1)); await sleep(200);
  ok('② 다른 날로 넘기면 곧바로 묻는다', await asking() && /「독서」/.test(await title()) && /1개 고침|1개 추가 · 1개 삭제/.test(await title()), await title());
  await pick('all'); await sleep(300);
  await p.evaluate(() => { viewDate = logicalNow(); renderToday(); }); await sleep(300);
  ok('② 고른 대로 내일 것에 (1장 → 2장)', (await subsOf('next', '독서')) === '2장', await subsOf('next', '독서'));

  // ② 판 접기 = 마침
  await addBox('운동'); await p.keyboard.type('스쿼트'); await p.keyboard.press('Enter'); await sleep(250);
  await p.evaluate(() => { const a = getBigs(tKey(), 'am'); const i = a.findIndex(x => x.text === '운동' && !_repHiddenOn(x, tKey())); _subToggleOpen('big', 'am', i, false); }); await sleep(500);
  ok('② 판을 접으면 묻는다', await asking());
  await pick('one'); await sleep(300);

  // ⑥ 하위 체크만 → 안 묻는다
  await p.evaluate(sel => document.querySelector(sel).closest('.sub-panel').querySelector('.sub-row .sub-chk').click(), await panelSel('독서')); await sleep(600);
  ok('⑥ 하위 체크만 하면 묻지 않는다', !(await asking()));
  // ⑥ 중요 표시는 곧바로
  await p.evaluate(() => _doToggleFlag('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '독서'))); await sleep(400);
  ok('⑥ 중요 표시는 곧바로 묻는다', await asking() && (await title()).includes('중요 표시를'), await title());
  await pick('all'); await sleep(300);
  // ⑥ 메모 — 창을 닫을 때
  await p.evaluate(() => openTaskMemo('big', 'am', getBigs(tKey(), 'am').findIndex(x => x.text === '독서'), true)); await sleep(300);
  await p.evaluate(() => { document.getElementById('memoEdit').value = '30쪽'; _memoSaveEdit(); }); await sleep(700);
  ok('⑥ 메모 창이 떠 있는 동안은 묻지 않는다', !(await asking()));
  await p.evaluate(() => closeTaskMemo()); await sleep(900);
  ok('⑥ 메모 창을 닫으면 묻는다', await asking() && (await title()).includes('메모를'), await title());
  await pick('all'); await sleep(300);
  ok('⑥ 내일 것에도 메모', await p.evaluate(() => getBigs(_dayKeyAfter(tKey()), 'am').find(x => x.text === '독서').memo === '30쪽'));
  // ⑥ 반복 아닌 할일
  await addBox('빨래'); await p.keyboard.type('수건'); await p.keyboard.press('Enter'); await sleep(200);
  await tapOutsideKeepFocus(); await sleep(700);
  ok('⑥ 반복 아닌 할일은 묻지 않는다', !(await asking()) && (await p.evaluate(() => getBigs(tKey(), 'am').find(x => x.text === '빨래').subs.map(s => s.text).join())) === '흰옷,수건');

  await b.close();
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
