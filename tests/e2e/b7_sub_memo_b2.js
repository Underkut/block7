// HB 1101 B2 — 메모 휴지통 · 메뉴의 하위 할일 줄(만들기/전체 삭제) · 하위 줄 × (v. 26-1101-3)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_sub_memo_b2.js
// 지키는 것:
//  2-1 메모 팝업 우하단 휴지통 — 메모가 있을 때만 · 묻는 창이 메모 팝업 **위**에 뜬다 · 지우면 닫히고 메모가 사라진다
//  2-2 할일 메뉴: 하위가 없으면 '하위 할일 만들기'(판이 열리고 추가 칸에 커서) · 있으면 '하위 할일 전체 삭제'(빨강, 묻고 지움)
//      반복 할일이면 지운 뒤 '어디까지' 를 묻는다(B1)
//  2-3 하위 줄 × — 터치 기기는 늘 보이고(옅게) PC 는 가리킬 때만, 맨 오른쪽
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const seed = p => p.evaluate(() => {
    const B = getBigs(tKey(), 'am'); B.length = 0;
    B.push({ text: '장보기', done: false, memo: '우유 2통', subs: [{ text: '우유', done: false }, { text: '빵', done: false }], subOpen: true },
           { text: '빨래', done: false },
           { text: '운동', done: false, daily: true, rid: 'b2r', repeat: _taskRepDefault(), subs: [{ text: '스트레칭', done: false }], subOpen: true });
    save(); renderToday();
  });
  const idxOf = (p, t) => p.evaluate(t => getBigs(tKey(), 'am').findIndex(x => x.text === t), t);
  const vis = (p, id) => p.evaluate(id => { const e = document.getElementById(id); return !!e && e.style.display !== 'none' && getComputedStyle(e).display !== 'none'; }, id);

  // ── 휴대폰 ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500); await seed(p); await sleep(300);

    // 2-1
    await p.evaluate(i => openTaskMemo('big', 'am', i), await idxOf(p, '장보기')); await sleep(300);
    ok('2-1 메모가 있으면 휴지통이 보인다', await vis(p, 'memoDelBtn'));
    const pos = await p.evaluate(() => { const m = document.getElementById('taskMemoModal').getBoundingClientRect(), d = document.getElementById('memoDelBtn').getBoundingClientRect(); return { right: m.right - d.right, bottom: m.bottom - d.bottom }; });
    ok('2-1 우하단에 있다', pos.right >= 0 && pos.right < 40 && pos.bottom >= 0 && pos.bottom < 40, pos);
    await p.evaluate(() => document.getElementById('memoDelBtn').click()); await sleep(200);
    const z = await p.evaluate(() => [+getComputedStyle(document.getElementById('appConfirmModal')).zIndex, +getComputedStyle(document.getElementById('taskMemoModal')).zIndex]);
    ok('2-1 묻는 창이 메모 팝업 위에', await vis(p, 'appConfirmModal') && z[0] > z[1], z);
    await p.evaluate(() => _appConfirmResolve(true)); await sleep(700);
    ok('2-1 지우면 메모가 사라지고 팝업이 닫힌다', !(await vis(p, 'taskMemoModal')) && await p.evaluate(() => !('memo' in getBigs(tKey(), 'am').find(x => x.text === '장보기'))));
    ok('2-1 묻는 창 높이는 원래대로', await p.evaluate(() => getComputedStyle(document.getElementById('appConfirmModal')).zIndex) === '4450');
    await p.evaluate(i => openTaskMemo('big', 'am', i), await idxOf(p, '빨래')); await sleep(300);
    ok('2-1 메모가 없으면 휴지통도 없다', !(await vis(p, 'memoDelBtn')));
    await p.evaluate(() => closeTaskMemo()); await sleep(300);

    // 2-2 — 하위 있는 할일
    await p.evaluate(i => openTaskMenu('big', 'am', i, null, { x: 100, y: 200 }), await idxOf(p, '장보기')); await sleep(200);
    let lab = await p.evaluate(() => [document.getElementById('subTaskMenuLabel').textContent, document.getElementById('subTaskMenuItem').classList.contains('danger')]);
    ok('2-2 하위가 있으면 "전체 삭제" (빨강)', lab[0] === '하위 할일 전체 삭제 (2)' && lab[1], lab);
    await p.evaluate(() => openSubsFromMenu()); await sleep(200);
    ok('2-2 지우기 전에 묻는다', await vis(p, 'appConfirmModal'));
    await p.evaluate(() => _appConfirmResolve(true)); await sleep(300);
    ok('2-2 하위가 모두 지워진다', await p.evaluate(() => { const it = getBigs(tKey(), 'am').find(x => x.text === '장보기'); return !('subs' in it) && !('subOpen' in it); }));
    // 하위 없는 할일
    await p.evaluate(i => openTaskMenu('big', 'am', i, null, { x: 100, y: 200 }), await idxOf(p, '빨래')); await sleep(200);
    lab = await p.evaluate(() => [document.getElementById('subTaskMenuLabel').textContent, document.getElementById('subTaskMenuItem').classList.contains('danger')]);
    ok('2-2 하위가 없으면 "만들기"', lab[0] === '하위 할일 만들기' && !lab[1], lab);
    await p.evaluate(() => openSubsFromMenu()); await sleep(300);
    ok('2-2 만들기 = 판이 열리고 추가 칸에 커서', await p.evaluate(i => document.activeElement && document.activeElement.id === _subGhostId('big', 'am', i), await idxOf(p, '빨래')));
    await p.evaluate(() => document.activeElement.blur()); await sleep(300);
    // 반복 할일 전체 삭제 → 범위 묻기
    await p.evaluate(i => openTaskMenu('big', 'am', i, null, { x: 100, y: 200 }), await idxOf(p, '운동')); await sleep(200);
    await p.evaluate(() => openSubsFromMenu()); await sleep(200);
    await p.evaluate(() => _appConfirmResolve(true)); await sleep(500);
    ok('2-2 반복 할일이면 "어디까지" 를 묻는다', await p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block'));
    await p.evaluate(() => closeRepScope()); await sleep(300);

    // 2-3 터치: × 가 늘 보인다
    await p.evaluate(() => { const B = getBigs(tKey(), 'am'); B[0].subs = [{ text: '우유', done: false }]; B[0].subOpen = true; save(); renderToday(); }); await sleep(300);
    const t = await p.evaluate(() => { const d = document.querySelector('.sub-row .sub-del'), r = d.closest('.sub-row').getBoundingClientRect(), x = d.getBoundingClientRect(); return { op: getComputedStyle(d).opacity, gap: r.right - x.right, last: d === d.parentElement.lastElementChild }; });
    ok('2-3 터치 기기: × 가 늘 보인다(옅게)', +t.op > 0.3, t);
    ok('2-3 × 는 맨 오른쪽', t.last && t.gap < 8, t);
    await p.evaluate(() => document.querySelector('.sub-row .sub-del').click()); await sleep(300);
    ok('2-3 × 로 그 줄만 지운다', await p.evaluate(() => !('subs' in getBigs(tKey(), 'am')[0])));
    await ctx.close();
  }
  // ── PC ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500); await seed(p); await sleep(300);
    const op = () => p.evaluate(() => getComputedStyle(document.querySelector('.sub-row .sub-del')).opacity);
    ok('2-3 PC: 평소엔 × 가 숨어 있다', +(await op()) === 0, await op());
    const box = await p.evaluate(() => { const r = document.querySelector('.sub-row .sub-inp').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
    await p.mouse.move(box.x, box.y); await sleep(250);
    ok('2-3 PC: 가리키면 보인다', +(await op()) === 1, await op());
    await ctx.close();
  }
  await b.close();
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
