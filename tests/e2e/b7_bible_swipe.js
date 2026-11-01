// 성경 본문 — 장 넘기기 밀기 ↔ 긋기(부분 선택) ↔ 절 메뉴 가르기 (v. 26-1101-2, HB S1)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_bible_swipe.js
// 아이폰 흉내(터치) — 진짜 손가락처럼 CDP 로 터치를 하나씩 보낸다.
// 지키는 것:
//  ① 글자 위에서 시작해도 빠른 가로 밀기 = 다음 장 (예전엔 긋기가 됐다) · 미는 동안 판이 손을 따라온다
//  ② 오른쪽으로 밀기 = 앞 장 · 조금만(¼ 못 미치게) 천천히 밀면 제자리
//  ③ 살짝(0.3초) 누른 채 끌기 = 긋기 · 장은 그대로 · 준비되면 돋보기
//  ④ 0.6초 그대로 = 절 메뉴 · 긋기 표시는 남지 않는다
//  ⑤ 창세기 1장에서 앞으로 밀면 고무줄 — 장은 그대로
//  ⑥ 세로로 밀면(스크롤) 장은 그대로
//  ⑦ ▶ 단추도 같은 전환으로 다음 장
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
// ANDROID=1 이면 안드로이드 흉내 — 긋기가 터치 대신 포인터 길로 돈다
const ANDROID = !!process.env.ANDROID;
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
    userAgent: ANDROID ? 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36'
      : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  const cdp = await ctx.newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  // 손가락 길: (x,y) 에서 hold ms 누르고, dx·dy 만큼 steps 걸음에 dur ms 동안
  async function gesture(x, y, dx, dy, { hold = 0, dur = 120, steps = 8, mid } = {}) {
    await touch('touchStart', x, y);
    if (hold) await sleep(hold);
    for (let i = 1; i <= steps; i++) {
      await touch('touchMove', x + dx * i / steps, y + dy * i / steps);
      await sleep(dur / steps);
      if (mid && i === Math.ceil(steps / 2)) await mid();
    }
    await touch('touchEnd');
  }
  const cur = () => p.evaluate(() => _brCur.b + ':' + _brCur.c);
  const sheetOn = id => p.evaluate(id => !!document.getElementById(id)?.classList.contains('on'), id);
  // 4절 글자 한가운데쯤
  const charPt = () => p.evaluate(() => { const v = document.querySelector('#brChap .br-v[data-v="4"]'); const r = v.getClientRects()[0]; return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; });

  await p.goto(APP); await sleep(1500);
  await p.evaluate(() => bibleOpen(42, 3)); await sleep(1500);
  ok('요한복음 3장이 열렸다', (await cur()) === '42:3', await cur());
  ok(ANDROID ? '안드로이드 길로 읽힌다' : '아이폰 길로 읽힌다', (await p.evaluate(() => document.getElementById('bibleRd').classList.contains('br-ios'))) === !ANDROID);

  let pt = await charPt();
  ok('시작점이 글자 위', await p.evaluate(({ x, y }) => !!_brCharAt(x, y), pt), pt);
  let followed = null;
  await gesture(pt.x + 60, pt.y, -170, 6, { dur: 140, mid: async () => { followed = await p.evaluate(() => document.querySelector('#bibleRd .br-page').style.transform); } });
  ok('① 미는 동안 판이 손을 따라온다', /translateX\(-/.test(followed || ''), followed);
  await sleep(700);
  ok('① 글자 위 빠른 가로 밀기 = 다음 장', (await cur()) === '42:4', await cur());
  ok('① 긋기 판은 안 열린다', !(await sheetOn('brSInk')));
  ok('① 판은 제자리로 돌아와 있다', await p.evaluate(() => !document.querySelector('#bibleRd .br-page').style.transform));

  pt = await charPt();
  await gesture(pt.x - 60, pt.y, 170, 0, { dur: 140 }); await sleep(700);
  ok('② 오른쪽으로 = 앞 장', (await cur()) === '42:3', await cur());
  pt = await charPt();
  await gesture(pt.x, pt.y, -60, 0, { dur: 600, steps: 10 }); await sleep(500);
  ok('② 조금만 천천히 밀면 제자리', (await cur()) === '42:3' && await p.evaluate(() => !document.querySelector('#bibleRd .br-page').style.transform), await cur());

  pt = await charPt();
  let loupe = null;
  await touch('touchStart', pt.x - 40, pt.y); await sleep(320);
  loupe = await p.evaluate(() => document.getElementById('brLoupe')?.classList.contains('on'));
  for (let i = 1; i <= 8; i++) { await touch('touchMove', pt.x - 40 + 12 * i, pt.y); await sleep(20); }
  await touch('touchEnd'); await sleep(500);
  ok('③ 살짝 누르면 돋보기로 알린다', loupe === true, loupe);
  ok('③ 누른 채 끌기 = 긋기 판', await sheetOn('brSInk'));
  ok('③ 장은 그대로', (await cur()) === '42:3', await cur());
  await p.evaluate(() => { _brCloseSheets(); _brInkSel = null; _brInkPaint(); }); await sleep(300);

  pt = await charPt();
  await touch('touchStart', pt.x, pt.y); await sleep(650); await touch('touchEnd'); await sleep(300);
  ok('④ 0.6초 그대로 = 절 메뉴', await sheetOn('brVMenu'));
  ok('④ 긋기 표시가 남지 않는다', await p.evaluate(() => !_brInkSel && !document.getElementById('brLoupe')?.classList.contains('on')));
  await p.evaluate(() => _brVmClose()); await sleep(300);

  pt = await charPt();
  await gesture(pt.x, pt.y - 10, 8, -260, { dur: 200 }); await sleep(500);
  ok('⑥ 세로로 밀면 장은 그대로', (await cur()) === '42:3', await cur());

  await p.evaluate(() => _brEl('brNext').click()); await sleep(80);
  const mid = await p.evaluate(() => document.querySelector('#bibleRd .br-page').style.transform);
  await sleep(700);
  ok('⑦ ▶ 단추 = 나가는 전환', /translateX/.test(mid), mid);
  ok('⑦ ▶ 단추 = 다음 장', (await cur()) === '42:4', await cur());

  await p.evaluate(() => bibleOpen(0, 1)); await sleep(1200);
  pt = await charPt();
  let rub = null;
  await gesture(pt.x - 60, pt.y, 200, 0, { dur: 140, mid: async () => { rub = await p.evaluate(() => document.querySelector('#bibleRd .br-page').style.transform); } });
  await sleep(600);
  const px = parseFloat(String(rub).replace(/[^\d.-]/g, '')) || 0;
  ok('⑤ 창세기 1장에서 앞으로: 고무줄처럼 덜 움직인다', px > 0 && px < 60, rub);
  ok('⑤ 장은 그대로', (await cur()) === '0:1', await cur());

  await b.close();
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
