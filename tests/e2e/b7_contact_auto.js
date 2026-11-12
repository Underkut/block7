// BLOCK7 글에서 '@' 를 지우면 '연락할 일' 표시도 저절로 풀린다 (HB 2026-11-12).
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_contact_auto.js
// 규칙 자체는 tests/test_contact_auto.js, 반복 할일 퍼뜨리기는 tests/test_repeat_props.js 16~21.
// 여기서는 실제 화면의 길마다 그 규칙이 불리는지 본다:
//  ① PC Enter(손 떼기): '@' 지우면 해제 · 아이콘 사라짐 · 토스트 / 메뉴로 켠 것 · '@' 가 남은 것은 그대로
//  ② PC Tab(다음 칸으로): 해제 · 아이콘만 그 자리에서 고침 · 커서는 다음 칸 / '@' 넣으면 켜짐 · 눌러도 메뉴 한 번
//  ③ Esc 는 되돌림 — 글 · 표시 모두 그대로
//  ④ 스몰 줄도 같다
//  ⑤ 반복 할일: 묻는 창이 뜨는 동안 토스트를 띄우지 않고 · '이 할일만' = 원본은 표시를 되찾음 ·
//     '모든 할일' = 앞날도 해제 · 고르지 않고 닫으면 그때 알린다
//  ⑥ 휴대폰 '이동' 키 · 긴 할일 여러 줄 칸에서도 같다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const REP = { daily: true, daysOfWeek: [0, 1, 2, 3, 4, 5, 6], weekly: false, weeksOfMonth: [1, 2, 3, 4, 5] };
  const seed = (p, bigs, smalls) => p.evaluate(([B0, S0]) => {
    const B = getBigs(tKey(), 'am'); B.length = 0; B0.forEach(x => B.push(x));
    const S = getSmalls(tKey(), 'am'); S.length = 0; (S0 || []).forEach(x => S.push(x));
    save(); renderToday();
    const t = document.getElementById('_toast'); if (t) t.textContent = '';
  }, [bigs, smalls]);
  const big = p => p.evaluate(() => getBigs(tKey(), 'am').map(x => ({ t: x.text, c: !!x.contactTask })));
  const badges = (p, sel) => p.evaluate(sel => [...document.querySelectorAll(sel)].map(r => !!r.querySelector('.blk-contact-task-badge svg')), sel);
  const toast = p => p.evaluate(() => (document.getElementById('_toast') || {}).textContent || '');
  const clearToast = p => p.evaluate(() => { const t = document.getElementById('_toast'); if (t) t.textContent = ''; });
  // 줄 k 의 칸에 들어가 글 전체를 바꾼다 (자판으로)
  const retype = async (p, sel, k, text) => {
    await p.evaluate(([sel, k]) => document.querySelectorAll(sel)[k].focus(), [sel, k]);
    await p.keyboard.press('Control+A'); await p.keyboard.type(text);
  };

  // ── PC ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1200, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(APP); await sleep(1500);
    await seed(p, [
      { text: '@철수 전화', done: false, contactTask: true },
      { text: '철수 전화', done: false, contactTask: true },          // '@' 없이 메뉴로 켬
      { text: '@영희 @민수 연락', done: false, contactTask: true },
      { text: '@철수 Tab', done: false, contactTask: true },
      { text: '다음 줄', done: false },
    ]); await sleep(300);
    ok('처음: 연락할 일 아이콘 넷', JSON.stringify(await badges(p, '#bl-am .big-item')) === '[true,true,true,true,false]', await badges(p, '#bl-am .big-item'));

    await retype(p, '#bl-am .bi-inp', 0, '철수 전화'); await p.keyboard.press('Enter'); await sleep(300);
    let s = await big(p);
    ok('① Enter: \'@\' 지우면 해제', s[0].t === '철수 전화' && s[0].c === false, s[0]);
    ok('① 아이콘도 사라진다', (await badges(p, '#bl-am .big-item'))[0] === false);
    const t1 = await toast(p);
    ok('① 토스트로 알린다', t1.includes('없어져서') && t1.includes('연락할 일 표시를 해제했어요'), t1);

    await clearToast(p);
    await retype(p, '#bl-am .bi-inp', 1, '철수에게 전화'); await p.keyboard.press('Enter'); await sleep(300);
    s = await big(p);
    ok('① 메뉴로 켠 것(\'@\' 없음)은 그대로', s[1].c === true && (await badges(p, '#bl-am .big-item'))[1] === true && !(await toast(p)), s[1]);
    await retype(p, '#bl-am .bi-inp', 2, '@민수 연락'); await p.keyboard.press('Enter'); await sleep(300);
    s = await big(p);
    ok('① \'@\' 가 하나라도 남으면 그대로', s[2].t === '@민수 연락' && s[2].c === true && !(await toast(p)), s[2]);

    await retype(p, '#bl-am .bi-inp', 3, '철수 Tab'); await p.keyboard.press('Tab'); await sleep(300);
    s = await big(p);
    const a = await p.evaluate(() => ({ cls: document.activeElement.className, v: document.activeElement.value }));
    ok('② Tab: 해제', s[3].c === false, s[3]);
    ok('② Tab: 아이콘은 그 자리에서 사라진다', (await badges(p, '#bl-am .big-item'))[3] === false);
    ok('② Tab: 커서는 다음 칸 그대로', a.cls.includes('bi-inp') && a.v === '다음 줄', a);
    ok('② Tab: 토스트', (await toast(p)).includes('해제했어요'));
    await p.keyboard.press('End'); await p.keyboard.type(' @영희'); await p.keyboard.press('Tab'); await sleep(300);
    s = await big(p);
    ok('② Tab: \'@\' 넣으면 켜지고 아이콘이 생긴다', s[4].c === true && (await badges(p, '#bl-am .big-item'))[4] === true, s[4]);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);

    // 같은 줄(다시 그리지 않은 채)에서 껐다 켜도 아이콘을 누르면 한 번만 열린다
    await p.evaluate(() => { window._ocm = 0; window.openContactsModal = () => { _ocm++; }; window.openContactMenu = () => { _ocm++; }; });
    await retype(p, '#bl-am .bi-inp', 3, '@철수 Tab'); await p.keyboard.press('Tab'); await sleep(200);
    ok('② Tab: 지웠던 \'@\' 를 다시 넣으면 다시 켜진다', (await big(p))[3].c === true && (await badges(p, '#bl-am .big-item'))[3] === true);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);
    await p.evaluate(() => document.querySelectorAll('#bl-am .big-item')[3].querySelector('.blk-contact-task-badge').click()); await sleep(200);
    ok('② 아이콘을 누르면 연락처가 한 번만 열린다', (await p.evaluate(() => _ocm)) === 1, await p.evaluate(() => _ocm));

    // ③ Esc
    await seed(p, [{ text: '@철수 Esc', done: false, contactTask: true }]); await sleep(300);
    await retype(p, '#bl-am .bi-inp', 0, 'Esc'); await p.keyboard.press('Escape'); await sleep(300);
    s = await big(p);
    ok('③ Esc: 글 · 표시 모두 그대로', s[0].t === '@철수 Esc' && s[0].c === true && (await badges(p, '#bl-am .big-item'))[0] === true && !(await toast(p)), s);

    // ④ 스몰
    await seed(p, [{ text: '빅', done: false }], [{ text: '@철수 문자', done: false, contactTask: true }, { text: '둘', done: false }]); await sleep(300);
    await p.evaluate(() => { document.getElementById('sl-am').style.display = ''; });
    await retype(p, '#sl-am .si-inp', 0, '철수 문자'); await p.keyboard.press('Enter'); await sleep(300);
    let sm = await p.evaluate(() => getSmalls(tKey(), 'am').map(x => ({ t: x.text, c: !!x.contactTask })));
    ok('④ 스몰 Enter: 해제 · 아이콘 사라짐', sm[0].c === false && (await badges(p, '#sl-am .sm-item'))[0] === false, sm);
    await retype(p, '#sl-am .si-inp', 1, '@영희 둘'); await p.keyboard.press('Tab'); await sleep(300);
    sm = await p.evaluate(() => getSmalls(tKey(), 'am').map(x => ({ t: x.text, c: !!x.contactTask })));
    ok('④ 스몰 Tab: \'@\' 넣으면 켜짐 · 아이콘', sm[1].c === true && (await badges(p, '#sl-am .sm-item'))[1] === true, sm);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);

    // ⑤ 반복 할일
    const repSeed = () => seed(p, [{ text: '@철수 운동', done: false, daily: true, rid: 'r-ct', repeat: REP, contactTask: true }]);
    const modalOpen = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
    const pick = n => p.evaluate(n => document.querySelectorAll('#repScopeList .rep-scope-btn')[n].click(), n);
    const nextDay = () => p.evaluate(() => { const k = _dayKeyAfter(tKey()); materializeRepeatsFor(k); return getBigs(k, 'am').filter(x => x.rid === 'r-ct').map(x => ({ t: x.text, c: !!x.contactTask })); });

    await repSeed(); await sleep(300);
    await retype(p, '#bl-am .bi-inp', 0, '운동'); await p.keyboard.press('Enter'); await sleep(300);
    ok('⑤ 반복: \'어디까지 바꿀까\' 를 묻는다', await modalOpen());
    ok('⑤ 묻는 동안엔 토스트를 띄우지 않는다', !(await toast(p)).includes('해제'), await toast(p));
    ok('⑤ 그 날 것은 이미 해제', (await big(p))[0].c === false);
    await pick(0); await sleep(300);   // 이 할일만
    s = await p.evaluate(() => getBigs(tKey(), 'am').map(x => ({ t: x.text, c: !!x.contactTask, root: !!x.repeat })));
    ok('⑤ 이 할일만: 원본은 옛 글 · 표시 되찾음, 그 날 것은 새 글 · 표시 없음',
      s.length === 2 && s[0].root && s[0].t === '@철수 운동' && s[0].c === true && s[1].t === '운동' && s[1].c === false, s);
    ok('⑤ 이 할일만: 토스트 두 줄', (await toast(p)).includes('이 날짜만 고쳤어요') && (await toast(p)).includes('연락할 일 표시도 해제했어요'), await toast(p));
    let nd = await nextDay();
    ok('⑤ 이 할일만: 내일은 예전대로 연락할 일', nd.length === 1 && nd[0].t === '@철수 운동' && nd[0].c === true, nd);

    await p.evaluate(() => { Object.keys(ST.days).forEach(k => { ['big', 'small'].forEach(t => { const bag = ST.days[k][t]; if (bag && bag.am) bag.am = bag.am.filter(x => x.rid !== 'r-ct'); }); }); });
    await repSeed(); await sleep(300);
    await retype(p, '#bl-am .bi-inp', 0, '운동'); await p.keyboard.press('Enter'); await sleep(300);
    await pick(2); await sleep(300);   // 모든 할일
    s = await big(p);
    ok('⑤ 모든 할일: 원본도 해제', s.length === 1 && s[0].t === '운동' && s[0].c === false, s);
    nd = await nextDay();
    ok('⑤ 모든 할일: 내일도 표시 없이', nd.length === 1 && nd[0].t === '운동' && nd[0].c === false, nd);

    await p.evaluate(() => { Object.keys(ST.days).forEach(k => { ['big', 'small'].forEach(t => { const bag = ST.days[k][t]; if (bag && bag.am) bag.am = bag.am.filter(x => x.rid !== 'r-ct'); }); }); });
    await repSeed(); await sleep(300);
    await retype(p, '#bl-am .bi-inp', 0, '운동'); await p.keyboard.press('Enter'); await sleep(300);
    await p.evaluate(() => closeRepScope()); await sleep(300);   // × — 고르지 않고 닫음
    ok('⑤ 고르지 않고 닫으면 그때 알린다', (await toast(p)).includes('연락할 일 표시를 해제했어요') && (await big(p))[0].c === false, [await toast(p), await big(p)]);
    await ctx.close();
  }

  // ── 휴대폰 ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(APP); await sleep(1500);
    await seed(p, [{ text: '@철수 이동', done: false, contactTask: true }, { text: '둘', done: false }]); await sleep(300);
    await retype(p, '#bl-am .bi-inp', 0, '철수 이동'); await p.keyboard.press('Enter'); await sleep(400);
    let s = await big(p);
    const a = await p.evaluate(() => ({ cls: document.activeElement.className, v: document.activeElement.value }));
    ok('⑥ 휴대폰 \'이동\': 해제 · 아이콘 사라짐', s[0].c === false && (await badges(p, '#bl-am .big-item'))[0] === false, s);
    ok('⑥ 휴대폰 \'이동\': 다음 줄로 (다시 그려도)', a.cls.includes('bi-inp') && a.v === '둘', a);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);

    const LONG = '@철수 10/25 라이프라인 예배인도 준비 및 찬양 콘티 정리하고 악보 인쇄해서 전달';
    await seed(p, [{ text: LONG, done: false, contactTask: true }, { text: '짧은 할일', done: false }]);
    await p.evaluate(() => updateSetting('taskOverflow', 'shrink')); await sleep(700);
    const r = await p.evaluate(() => { const x = document.querySelector('#bl-am .bi-inp').getBoundingClientRect(); return [x.left + 20, x.top + x.height / 2]; });
    await p.touchscreen.tap(r[0], r[1]); await sleep(500);
    const lta = await p.evaluate(() => document.activeElement.className);
    ok('⑥ 긴 할일은 여러 줄 칸으로 고친다', lta === 'task-lta', lta);
    await p.evaluate(() => { const ta = document.activeElement; ta.value = ta.value.replace('@철수 ', '철수 '); ta.oninput(); });
    await p.touchscreen.tap(200, 830); await sleep(400);
    s = await big(p);
    ok('⑥ 여러 줄 칸에서 \'@\' 지우고 바깥을 누르면 해제', s[0].c === false && !s[0].t.includes('@') && (await badges(p, '#bl-am .big-item'))[0] === false, s);
    await ctx.close();
  }
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
