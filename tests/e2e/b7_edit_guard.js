// 1101-E1 — 할일 글자를 고치는 동안은 아무것도 끼어들지 않는다 (HB 2026-11-01)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_edit_guard.js
// 지키는 것 (휴대폰 · 터치):
//  ① 편집 중: 다른 줄 롱터치 → 끌기도 메뉴도 안 뜬다 / 편집 아닐 때는 그대로 뜬다(대조)
//  ② 편집 중: 고치는 칸 롱터치 → 끌기 · 메뉴 없음 (글자 고르기는 브라우저 몫)
//  ③ 편집 중: 화면 위 손가락 끌기 → 스크롤 막힘(preventDefault) / 칸 안 끌기 → 막지 않음 / 편집 끝나면 다시 스크롤
//  ④ 편집 중: 줄 좌우 밀기 → 완료 · 삭제 안 됨
//  ⑤ 편집 중: 하위 줄 롱터치 → 하위 메뉴 안 뜸
//  ⑥ 편집 중 받은 다시 그리기(_txeDefer)는 편집이 끝난 뒤 한 번 돈다 · 그동안 칸은 그대로
//  ⑦ 안드로이드식 contextmenu(길게 누름) — 편집 중 다른 줄이면 할일 메뉴 안 뜸
// (PC · 마우스)
//  ⑧ 고치는 칸을 누르고 있어도 줄 끌기가 시작되지 않는다 · 그 칸 우클릭은 브라우저 메뉴(막지 않음)
//  ⑨ 편집 아닐 때 글자 누르고 끌면 줄 끌기 — 예전 그대로(B7-1)
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const seed = p => p.evaluate(() => {
    const B = getBigs(tKey(), 'am'); B.length = 0;
    B.push({ text: '장보기', done: false, subs: [{ text: '우유', done: false }, { text: '빵', done: false }], subOpen: true },
           { text: '빨래', done: false }, { text: '운동', done: false });
    for (let i = 0; i < 30; i++) B.push({ text: '채움 ' + i, done: false });
    save(); renderToday(); window.scrollTo(0, 200);
  });
  // 터치 손짓을 화면 좌표로 흉내 낸다 — 돌려주는 값: touchmove 가 막혔는지
  const T = (p, kind, sel, dx = 0, dy = 0, idx = 0) => p.evaluate(([kind, sel, dx, dy, idx]) => {
    const el = typeof sel === 'string' ? document.querySelectorAll(sel)[idx] : null;
    const r = el.getBoundingClientRect(), x = r.left + Math.min(40, r.width / 2) + 20, y = r.top + r.height / 2;
    const mk = (cx, cy) => new Touch({ identifier: 7, target: el, clientX: cx, clientY: cy, pageX: cx, pageY: cy + scrollY });
    if (kind === 'start') { window._gT = { el, x, y }; return el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [mk(x, y)], targetTouches: [mk(x, y)], changedTouches: [mk(x, y)] })); }
    const g = window._gT;
    if (kind === 'move') { const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [mk(g.x + dx, g.y + dy)], targetTouches: [mk(g.x + dx, g.y + dy)], changedTouches: [mk(g.x + dx, g.y + dy)] }); g.el.dispatchEvent(ev); return ev.defaultPrevented; }
    if (kind === 'end') { g.el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [mk(g.x + dx, g.y + dy)] })); return true; }
  }, [kind, sel, dx, dy, idx]);
  const menuOpen = p => p.evaluate(() => document.getElementById('taskMenu').style.display === 'block');
  const subMenuOpen = p => p.evaluate(() => { const m = document.getElementById('subRowMenu') || document.querySelector('.sub-row-menu'); return !!m && getComputedStyle(m).display !== 'none' && m.offsetParent !== null; });
  const closeAll = p => p.evaluate(() => { try { closeTaskMenu(); } catch (e) { } try { if (typeof closeSubRowMenu === 'function') closeSubRowMenu(); } catch (e) { } if (DR.active) try { cancelDragKeepingItem(); } catch (e) { } document.body.style.overflow = ''; delete document.body.dataset.scrollLockedForDrag; });
  const editBig = (p, t) => p.evaluate(t => { const inp = [...document.querySelectorAll('#todayView .bi-inp')].find(x => x.value === t); inp.focus(); return document.activeElement === inp; }, t);
  const bigSel = t => `#todayView .big-item[data-flipkey="b:${t}"]`;

  // ── 휴대폰 (터치) ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 700 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500); await seed(p); await sleep(300);

    // ① 대조: 편집 아닐 때 롱터치 → 메뉴
    await T(p, 'start', bigSel('빨래')); await sleep(900);
    ok('① (대조) 편집 아닐 때 롱터치 → 할일 메뉴', await menuOpen(p));
    await T(p, 'end', bigSel('빨래')); await closeAll(p); await sleep(200);

    ok('편집 시작', await editBig(p, '장보기'));
    await T(p, 'start', bigSel('빨래')); await sleep(900);
    ok('① 편집 중 다른 줄 롱터치 → 메뉴 안 뜸', !(await menuOpen(p)));
    ok('① 끌기도 시작 안 함', await p.evaluate(() => !DR.active && !document.body.dataset.scrollLockedForDrag));
    await T(p, 'end', bigSel('빨래')); await sleep(100);
    ok('① 편집은 그대로', await p.evaluate(() => document.activeElement && document.activeElement.value === '장보기'));

    // ②
    await T(p, 'start', '#todayView .bi-inp'); await sleep(900);
    ok('② 고치는 칸 롱터치 → 메뉴 · 끌기 없음', !(await menuOpen(p)) && await p.evaluate(() => !DR.active));
    await T(p, 'end', '#todayView .bi-inp'); await sleep(100);

    // ③ 스크롤
    await T(p, 'start', bigSel('운동'));
    const pv = await T(p, 'move', bigSel('운동'), 0, -60);
    await T(p, 'end', bigSel('운동'), 0, -60);
    ok('③ 편집 중 화면 끌기 → 스크롤 막힘', pv === true);
    await T(p, 'start', '#todayView .bi-inp');
    const pvIn = await T(p, 'move', '#todayView .bi-inp', 30, 0);
    await T(p, 'end', '#todayView .bi-inp', 30, 0);
    ok('③ 칸 안 끌기(커서 옮기기)는 막지 않음', pvIn === false);

    // ④ 좌우 밀기
    await T(p, 'start', bigSel('빨래'));
    for (let d = -20; d >= -200; d -= 30) await T(p, 'move', bigSel('빨래'), d, 0);
    await T(p, 'end', bigSel('빨래'), -200, 0); await sleep(400);
    ok('④ 편집 중 왼쪽 밀기 → 삭제 안 됨', await p.evaluate(() => getBigs(tKey(), 'am').some(x => x.text === '빨래')));
    await T(p, 'start', bigSel('운동'));
    for (let d = 20; d <= 200; d += 30) await T(p, 'move', bigSel('운동'), d, 0);
    await T(p, 'end', bigSel('운동'), 200, 0); await sleep(400);
    ok('④ 편집 중 오른쪽 밀기 → 완료 안 됨', await p.evaluate(() => !getBigs(tKey(), 'am').find(x => x.text === '운동').done));

    // ⑤ 하위 줄
    const hasSub = await p.evaluate(() => document.querySelectorAll('#todayView .sub-row').length);
    if (hasSub) {
      await T(p, 'start', '#todayView .sub-row'); await sleep(1000);
      ok('⑤ 편집 중 하위 줄 롱터치 → 하위 메뉴 안 뜸', !(await subMenuOpen(p)) && await p.evaluate(() => !_SDR.active));
      await T(p, 'end', '#todayView .sub-row'); await sleep(100);
    } else ok('⑤ 하위 줄이 그려져 있다', false, hasSub);

    // ⑦ 안드로이드 길게 누름 = contextmenu
    await T(p, 'start', bigSel('빨래'));
    const cm = await p.evaluate(s => { const el = document.querySelector(s); const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }); el.dispatchEvent(ev); return document.getElementById('taskMenu').style.display === 'block'; }, bigSel('빨래'));
    await T(p, 'end', bigSel('빨래'));
    ok('⑦ 편집 중 다른 줄 contextmenu → 메뉴 안 뜸', !cm);
    await closeAll(p);

    // ⑥ 미뤄 둔 다시 그리기
    const r = await p.evaluate(() => { window._drawn = 0; const d = _txeDefer('t', () => { window._drawn++; }); _txeDefer('t', () => { window._drawn++; }); return d; });
    ok('⑥ 편집 중이면 미룬다', r === true && await p.evaluate(() => window._drawn === 0));
    // 구글 캘린더 맞추기처럼 renderToday 를 부르려던 자리 — 편집 칸이 살아 있는지
    await p.evaluate(() => { document.activeElement.value = '장보기!'; document.activeElement.oninput && document.activeElement.oninput(); _txeDefer('gcal', () => { renderToday(); }); });
    await sleep(200);
    ok('⑥ 그동안 칸은 그대로 (커서 유지)', await p.evaluate(() => document.activeElement && document.activeElement.value === '장보기!'));
    await p.evaluate(() => document.activeElement.blur()); await sleep(400);
    ok('⑥ 편집이 끝나면 한 번만 돈다', await p.evaluate(() => window._drawn === 1));
    ok('⑥ 고친 글자는 저장됨', await p.evaluate(() => getBigs(tKey(), 'am').some(x => x.text === '장보기!')));
    ok('⑥ 편집 아니면 바로 그리라고 돌려준다(false)', await p.evaluate(() => _txeDefer('x', () => { }) === false));

    // ③ 편집 끝나면 스크롤 다시 됨
    await T(p, 'start', bigSel('운동'));
    const pv2 = await T(p, 'move', bigSel('운동'), 0, -60);
    await T(p, 'end', bigSel('운동'), 0, -60);
    ok('③ 편집이 끝나면 스크롤을 막지 않는다', pv2 === false);
    await sleep(400);
    ok('편집이 끝나면 touchmove 막기가 떨어진다', await p.evaluate(() => _TXE.mv === false));

    // 남은 스크롤 잠금은 아무 데나 눌러도 풀린다
    await p.evaluate(() => { document.body.style.overflow = 'hidden'; document.body.dataset.scrollLockedForDrag = '1'; });
    await T(p, 'start', '#todayView .ts-hd'); await T(p, 'end', '#todayView .ts-hd');
    ok('남아 있던 끌기 스크롤 잠금이 풀린다', await p.evaluate(() => document.body.style.overflow === '' && !document.body.dataset.scrollLockedForDrag));
    await ctx.close();
  }

  // ── PC (마우스) ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500); await seed(p); await sleep(300);
    ok('PC 편집 시작', await editBig(p, '빨래'));
    const box = await p.evaluate(() => { const r = [...document.querySelectorAll('#todayView .bi-inp')].find(x => x.value === '빨래').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
    await p.mouse.move(box.x, box.y); await p.mouse.down(); await sleep(500);
    ok('⑧ 고치는 칸 누르고 있어도 줄 끌기 안 됨', await p.evaluate(() => !DR.active));
    await p.mouse.move(box.x + 30, box.y + 2); await sleep(100);
    ok('⑧ 그 칸에서 끌어도 줄 끌기 안 됨(글자 고르기)', await p.evaluate(() => !DR.active));
    await p.mouse.up(); await sleep(100);
    const cm = await p.evaluate(() => { const inp = document.activeElement; const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }); inp.dispatchEvent(ev); return { prevented: ev.defaultPrevented, menu: document.getElementById('taskMenu').style.display === 'block' }; });
    ok('⑧ 고치는 칸 우클릭은 브라우저 메뉴(막지 않음 · 할일 메뉴 없음)', !cm.prevented && !cm.menu, cm);
    await p.evaluate(() => document.activeElement.blur()); await sleep(300);
    // ⑨ 대조
    const box2 = await p.evaluate(() => { const r = [...document.querySelectorAll('#todayView .bi-inp')].find(x => x.value === '운동').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
    await p.mouse.move(box2.x, box2.y); await p.mouse.down(); await p.mouse.move(box2.x, box2.y + 20, { steps: 4 }); await sleep(100);
    ok('⑨ (대조) 편집 아닐 때 글자 누르고 끌면 줄 끌기', await p.evaluate(() => DR.active));
    await p.mouse.up(); await sleep(300);
    const cm2 = await p.evaluate(() => { const el = [...document.querySelectorAll('#todayView .bi-inp')].find(x => x.value === '운동'); const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }); el.dispatchEvent(ev); return document.getElementById('taskMenu').style.display === 'block'; });
    ok('⑨ (대조) 편집 아닐 때 우클릭 → 할일 메뉴', cm2);
    await ctx.close();
  }
  await b.close();
  console.log(`\n${pass} 통과 · ${fail} 실패`);
  process.exit(fail ? 1 : 0);
})();
