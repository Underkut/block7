// 경계선(2·3단 세로줄)을 끌고 놓아도 옆 말씀카드가 전체화면으로 열리지 않는다 (HB 2026-11-02, 아이패드)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_lay_div_click.js
// 까닭: 아이패드는 잠깐 누르고 있다가 끈 손가락을 놓을 때 **처음 댄 자리**에 누름(click)을 만든다.
//   경계선을 왼쪽으로 끌면 그 시작점에 말씀카드가 와 있어 카드의 '누르면 전체화면' 이 열렸다.
// 지키는 것:
//  ① 경계선 touchstart 를 막는다(defaultPrevented) → 아이패드가 누름을 만들지 않는다
//  ② 그래도 끌기 직후 시작점에 누름이 오면 삼킨다 → 전체화면 안 열림 · 폭은 바뀜
//  ③ 그 다음 누름은 그대로 통한다 → 카드를 누르면 전체화면 열림(대조)
//  ④ PC 마우스로 끌어도 같다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const setup = async (p) => {
    await p.goto(APP); await sleep(1500);
    await p.evaluate(() => {
      const L = _lay();
      const id = _vcCreate(null, null, 'card');
      L.cols2 = { left: ['todo'], right: ['card#' + id] };
      L.cols = { left: ['todo'], center: [], right: ['card#' + id] };
      ST.settings.rightPanelRatio = 0.45;
      save(); renderLayout();
    });
    await sleep(400);
  };
  const vfOpen = p => p.evaluate(() => { const o = document.getElementById('verseFull'); return !!o && getComputedStyle(o).display !== 'none'; });
  const closeVf = p => p.evaluate(() => { try { closeVerseFull(); } catch (e) { } });

  // ── 아이패드 (터치) — 세로 2단 ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await setup(p);
    ok('2단 · 카드 위젯이 오른쪽에 있다', await p.evaluate(() => document.body.classList.contains('lay2') && !!document.querySelector('#colR .vc-body')));
    // 경계선 가운데를 잡고 왼쪽으로 120px 끌고 놓은 뒤, 아이패드처럼 '처음 댄 자리' 에 click 을 만든다
    const r = await p.evaluate(() => {
      const div = document.getElementById('layDiv2'), R = div.getBoundingClientRect();
      const C = document.querySelector('#colR .vc-body').getBoundingClientRect();
      const x = R.left + R.width / 2, y = C.top + C.height / 2;
      const mk = cx => new Touch({ identifier: 3, target: div, clientX: cx, clientY: y, pageX: cx, pageY: y + scrollY });
      const ts = new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [mk(x)], targetTouches: [mk(x)], changedTouches: [mk(x)] });
      div.dispatchEvent(ts);
      const w0 = getComputedStyle(document.documentElement).getPropertyValue('--rp-w');
      for (let i = 1; i <= 6; i++) { const cx = x - 20 * i; document.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [mk(cx)], targetTouches: [mk(cx)], changedTouches: [mk(cx)] })); }
      div.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [mk(x - 120)] }));
      const w1 = getComputedStyle(document.documentElement).getPropertyValue('--rp-w');
      const under = document.elementFromPoint(x, y);
      const onCard = !!(under && under.closest('.vc-body'));
      if (under) under.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      return { prevented: ts.defaultPrevented, w0, w1, onCard };
    });
    ok('① 경계선 touchstart 를 막는다 (아이패드가 누름을 안 만든다)', r.prevented, r);
    ok('끌어서 오른쪽 폭이 넓어졌다', parseInt(r.w1) > parseInt(r.w0), r);
    ok('시작점 아래에 이제 말씀카드가 있다 (사고 조건)', r.onCard, r);
    await sleep(300);
    ok('② 끌기 직후 시작점 누름 → 전체화면 안 열림', !(await vfOpen(p)));
    await closeVf(p); await sleep(700);
    // ③ 대조: 다음 누름은 그대로 — 카드를 톡 누르면 전체화면
    await p.evaluate(() => { const el = document.querySelector('#colR .vc-body'); el.click(); });
    await sleep(400);
    ok('③ (대조) 다음에 카드를 누르면 전체화면이 열린다', await vfOpen(p));
    await ctx.close();
  }
  // ── PC (마우스) — 3단 ──
  {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1400, height: 900 } });
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await setup(p);
    const R = await p.evaluate(() => { const r = document.getElementById('layDiv2').getBoundingClientRect(), c = document.querySelector('#colR .vc-body').getBoundingClientRect(); return { x: r.left + r.width / 2, y: c.top + c.height / 2 }; });
    await p.mouse.move(R.x, R.y); await p.mouse.down();
    for (let i = 1; i <= 6; i++) await p.mouse.move(R.x - 20 * i, R.y);
    await p.mouse.up(); await sleep(300);
    ok('④ PC 마우스로 끌고 놓아도 전체화면 안 열림', !(await vfOpen(p)));
    await sleep(600);
    await p.evaluate(() => document.querySelector('#colR .vc-body').click()); await sleep(400);
    ok('④ (대조) 다음 클릭은 그대로 통한다', await vfOpen(p));
    await ctx.close();
  }
  await b.close();
  console.log(`\n${pass} 통과 · ${fail} 실패`); process.exit(fail ? 1 : 0);
})();
