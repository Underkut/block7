// BLOCK7 휴대폰 자판의 '이동' 키 = 다음 칸으로 (v. 26-1030-7, HB).
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_enter_next.js
// 지키는 것:
//  ① 할일 칸(빅 · 스몰 · 하위 · 새 칸 · 긴 글 여러 줄 칸)의 자판 키는 모두 파란 '이동'(enterkeyhint=go)
//  ② 휴대폰: 고치던 빅 줄에서 이동 → 저장하고 다음 빅 줄 · 마지막 줄이면 새 빅 칸
//  ③ 새 빅 칸에서 이동 → 넣고 다음 새 칸에 커서 · 빈 칸에서 이동 → 입력 끝
//  ④ 비운 줄에서 이동 → 그 줄은 지워지고 다음 줄에 커서 (blur 가 목록을 다시 그려도)
//  ⑤ 스몰도 같다 · ⑥ 하위: 다음 하위 → 하위 추가 칸 → 넣고 그 칸 그대로 · 빈 칸이면 끝
//  ⑦ 반복 할일의 글을 바꿨으면 이동 대신 끝내고 '어디까지 바꿀까' 를 묻는다
//  ⑧ PC(마우스)는 예전 그대로 — Enter = 편집 끝, 새 칸 Enter = 넣고 끝
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const seed = p => p.evaluate(() => {
    const B = getBigs(tKey(), 'am'); B.length = 0;
    B.push({ text: '하나', done: false, subs: [{ text: '전기', done: false }, { text: '수도', done: false }], subOpen: true },
           { text: '둘', done: false }, { text: '셋', done: false });
    const S = getSmalls(tKey(), 'am'); S.length = 0; S.push({ text: '작은1', done: false }, { text: '작은2', done: false });
    save(); renderToday();
  });
  const big = p => p.evaluate(() => getBigs(tKey(), 'am').map(x => x.text));
  const ae = p => p.evaluate(() => { const a = document.activeElement; return { cls: a.className, v: a.value, id: a.id, hint: a.getAttribute && a.getAttribute('enterkeyhint') }; });
  const focusBig = (p, k) => p.evaluate(k => { document.querySelectorAll('#bl-am .bi-inp')[k].focus(); }, k);

  // ── 휴대폰 ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(APP); await sleep(1500);
    ok('휴대폰으로 읽힌다', await p.evaluate(() => _softEnter()));
    await seed(p); await sleep(300);
    const hints = await p.evaluate(() => [...document.querySelectorAll('#bl-am .bi-inp, #sl-am .si-inp, .sub-inp, .sub-add')].map(i => i.getAttribute('enterkeyhint')));
    ok('① 줄 칸 · 하위 칸 · 하위 추가 칸 모두 이동(go)', hints.length >= 7 && hints.every(h => h === 'go'), hints);

    await focusBig(p, 0); await p.keyboard.type('!'); await p.keyboard.press('Enter'); await sleep(200);
    let a = await ae(p);
    ok('② 고친 빅 줄 저장 · 다음 빅 줄로', a.cls.includes('bi-inp') && a.v === '둘' && (await big(p))[0] === '하나!', [a, await big(p)]);
    await p.keyboard.press('Enter'); await sleep(100); await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p);
    ok('② 마지막 줄 다음 = 새 빅 칸 (이동 키)', a.id === '' && !a.cls && a.hint === 'go' && !!(await p.evaluate(() => document.getElementById('tmp-big-ghost-am'))), a);
    await p.keyboard.type('넷'); await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p);
    ok('③ 새 칸에서 이동 → 넣고 다음 새 칸', (await big(p)).join() === '하나!,둘,셋,넷' && a.hint === 'go' && a.v === '' && !!(await p.evaluate(() => document.getElementById('tmp-big-ghost-am').contains(document.activeElement))), [a, await big(p)]);
    await p.keyboard.type('다섯'); await p.keyboard.press('Enter'); await sleep(200);
    await p.keyboard.press('Enter'); await sleep(300);
    ok('③ 빈 새 칸에서 이동 → 입력 끝', (await big(p)).join() === '하나!,둘,셋,넷,다섯' && !(await p.evaluate(() => document.getElementById('tmp-big-ghost-am'))), await big(p));

    await focusBig(p, 1); await p.evaluate(() => { const i = document.activeElement; i.value = ''; i.oninput(); });
    await p.keyboard.press('Enter'); await sleep(300);
    a = await ae(p);
    ok('④ 비운 줄은 지워지고 다음 줄(셋)에 커서', (await big(p)).join() === '하나!,셋,넷,다섯' && a.cls.includes('bi-inp') && a.v === '셋', [a, await big(p)]);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);

    await p.evaluate(() => { document.getElementById('sl-am').style.display = ''; document.querySelectorAll('#sl-am .si-inp')[0].focus(); });   // 스몰 목록은 처음엔 접혀 있다
    await p.keyboard.type('+'); await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p);
    ok('⑤ 스몰: 다음 줄로', a.cls.includes('si-inp') && a.v === '작은2', a);
    await p.keyboard.press('Enter'); await sleep(200);
    ok('⑤ 스몰: 마지막 다음 = 새 스몰 칸', await p.evaluate(() => !!document.getElementById('tmp-sm-ghost-am')?.contains(document.activeElement)));
    await p.keyboard.type('작은3'); await p.keyboard.press('Enter'); await sleep(200);
    ok('⑤ 스몰 새 칸: 넣고 이어서', await p.evaluate(() => getSmalls(tKey(), 'am').map(x => x.text).join() === '작은1+,작은2,작은3' && !!document.getElementById('tmp-sm-ghost-am')?.contains(document.activeElement)));
    await p.keyboard.press('Enter'); await sleep(300);

    await p.evaluate(() => document.querySelector('.sub-inp').focus());
    await p.keyboard.press('Enter'); await sleep(150);
    a = await ae(p); ok('⑥ 하위: 다음 하위로', a.cls === 'sub-inp' && a.v === '수도', a);
    await p.keyboard.press('Enter'); await sleep(150);
    a = await ae(p); ok('⑥ 하위: 마지막 다음 = 하위 추가 칸', a.cls === 'sub-add', a);
    await p.keyboard.type('가스'); await p.keyboard.press('Enter'); await sleep(150);
    a = await ae(p);
    ok('⑥ 하위 추가: 넣고 곧바로 새 추가 칸에 커서', a.cls === 'sub-add' && a.v === '' && (await p.evaluate(() => getBigs(tKey(), 'am')[0].subs.map(s => s.text).join())) === '전기,수도,가스', a);
    await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p); ok('⑥ 빈 하위 추가 칸에서 이동 → 끝', a.cls !== 'sub-add', a);

    // 비운 하위 줄 → 지워지고 다음 하위에
    await p.evaluate(() => { const i = document.querySelector('.sub-inp'); i.focus(); i.value = ''; i.oninput(); });
    await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p);
    ok('⑥ 비운 하위 줄은 지워지고 다음 하위(수도)에 커서', a.cls === 'sub-inp' && a.v === '수도' && (await p.evaluate(() => getBigs(tKey(), 'am')[0].subs.map(s => s.text).join())) === '수도,가스', a);
    await p.evaluate(() => document.activeElement.blur()); await sleep(200);

    // 반복 할일: 글을 바꿨으면 묻는다 (이동하지 않음)
    await p.evaluate(() => { const B = getBigs(tKey(), 'am'); B[1].rid = 'r-test'; save(); renderToday();
      window._ask = 0; const o = _repScopeAsk; window._repScopeAsk = function () { _ask++; }; });
    await sleep(200);
    await focusBig(p, 1); await p.keyboard.type('?'); await p.keyboard.press('Enter'); await sleep(300);
    a = await ae(p);
    ok('⑦ 반복 할일 글 바꿈 → 끝내고 묻는다', (await p.evaluate(() => _ask)) === 1 && !a.cls.includes('bi-inp'), a);
    await focusBig(p, 1); await p.keyboard.press('Enter'); await sleep(200);
    a = await ae(p);
    ok('⑦ 반복 할일이라도 안 바꿨으면 그냥 다음 줄', (await p.evaluate(() => _ask)) === 1 && a.cls.includes('bi-inp') && a.v === '넷', a);
    await ctx.close();
  }
  // ── PC ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1200, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(APP); await sleep(1500);
    ok('PC 는 휴대폰으로 안 읽힌다', !(await p.evaluate(() => _softEnter())));
    await seed(p); await sleep(300);
    await focusBig(p, 0); await p.keyboard.type('!'); await p.keyboard.press('Enter'); await sleep(200);
    let a = await ae(p);
    ok('⑧ PC Enter = 편집 끝 (예전 그대로)', !a.cls.includes('bi-inp') && (await big(p))[0] === '하나!', a);
    await focusBig(p, 0); await p.keyboard.press('Tab'); await sleep(200);
    a = await ae(p); ok('⑧ PC Tab = 다음 줄 (예전 그대로)', a.v === '둘', a);
    await p.evaluate(() => { document.activeElement.blur(); openInlineInput('am', 'big'); }); await sleep(200);
    await p.keyboard.type('넷'); await p.keyboard.press('Enter'); await sleep(300);
    ok('⑧ PC 새 칸 Enter = 넣고 끝', (await big(p)).join() === '하나!,둘,셋,넷' && !(await p.evaluate(() => document.getElementById('tmp-big-ghost-am'))), await big(p));
    await ctx.close();
  }
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
