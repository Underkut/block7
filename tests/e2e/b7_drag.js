// 할일 끌기 — 글자 위에서 바로 끌기(B7-1) · 줄들이 비켜 주기(B7-2) (HB 2026-10-28)
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_drag.js
// 지키는 것:
//  ① PC: 편집 중이 아닌 글자를 누르고 바로 끌면 편집이 아니라 줄 끌기가 된다
//  ② ⭐ 끄는 동안 손이 지나간 다른 줄의 글자 칸이 포커스를 받아, 놓을 때 옛 번호로 저장돼
//     다른 할일 글자를 덮어쓰지 않는다 (시험 중 실제로 '가나다라' 가 '마바사' 로 덮였다)
//  ③ 끄는 동안 빈자리(.dr-slot)가 놓일 곳으로 옮겨 다닌다 · 놓으면 빈자리와 움직임이 다 걷힌다
//  ④ 짧은 클릭은 여전히 편집 · 편집 중인 칸에서 끌면 글자 고르기(줄 끌기 아님)
//  ⑤ 할일 판 밖에서 놓으면 아무것도 바뀌지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 800, height: 900 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);
  const sec = await p.evaluate(() => {
    const T = tKey(), sec = SECS.filter(s => ST.vis.includes(s.id))[0].id;
    ['가나다라', '마바사', '아자차', '카타파'].forEach(t => getBigs(T, sec).push({ text: t, done: false }));
    save(); renderToday(); return sec;
  });
  const rowBox = i => p.locator(`#bl-${sec} .big-item[data-i="${i}"]`).boundingBox();
  const inpBox = i => p.locator(`#bl-${sec} .big-item[data-i="${i}"] .bi-inp`).boundingBox();
  const data = () => p.evaluate(sec => getBigs(tKey(), sec).map(b => b.text), sec);

  const f = await inpBox(0), r2 = await rowBox(2);
  await p.mouse.move(f.x + 30, f.y + f.height / 2); await p.mouse.down();
  for (let i = 1; i <= 14; i++) { await p.mouse.move(f.x + 30, f.y + f.height / 2 + (r2.y + r2.height * 0.8 - f.y - f.height / 2) * i / 14); await sleep(20); }
  await sleep(200);
  const mid = await p.evaluate(sec => ({ active: DR.active, slotAt: [...document.querySelectorAll(`#bl-${sec}>.swipe-wrap`)].findIndex(w => w.classList.contains('dr-slot')),
    focus: !!document.activeElement.matches('input.bi-inp,input.si-inp') }), sec);
  ok('① 글자 위에서 바로 끌면 줄 끌기', mid.active, mid);
  ok('③ 빈자리가 놓일 곳(셋째)으로 옮겨 갔다', mid.slotAt === 2, mid);
  ok('② 끄는 동안 글자 칸에 포커스 없음', !mid.focus, mid);
  await p.mouse.up(); await sleep(500);
  ok('② 순서만 바뀌고 글자는 그대로', JSON.stringify(await data()) === JSON.stringify(['마바사', '아자차', '가나다라', '카타파']), await data());
  ok('③ 놓으면 빈자리 · 움직임이 걷힌다', await p.evaluate(() => !document.querySelector('.dr-slot') && ![...document.querySelectorAll('#todayView .ts,#todayView .swipe-wrap')].some(e => e.style.transform)), '');

  const c = await inpBox(1);
  await p.mouse.click(c.x + 20, c.y + c.height / 2); await sleep(400);
  ok('④ 짧은 클릭은 편집', await p.evaluate(() => document.activeElement.matches('input.bi-inp')), '');
  await p.mouse.move(c.x + 5, c.y + c.height / 2); await p.mouse.down(); await p.mouse.move(c.x + 60, c.y + c.height / 2, { steps: 6 });
  ok('④ 편집 중인 칸에서 끌면 글자 고르기', await p.evaluate(() => !DR.active), '');
  await p.mouse.up(); await p.keyboard.press('Escape'); await sleep(300);

  const before = JSON.stringify(await data());
  const g = await inpBox(0), w = await p.locator('.rp-widget[data-wtype="monthSingle"]').boundingBox();
  await p.mouse.move(g.x + 30, g.y + g.height / 2); await p.mouse.down();
  await p.mouse.move(w.x + 100, w.y + 100, { steps: 20 }); await sleep(500); await p.mouse.up(); await sleep(500);
  ok('⑤ 판 밖에서 놓으면 그대로', JSON.stringify(await data()) === before, await data());
  ok('⑤ 화면도 그대로', JSON.stringify(await p.evaluate(sec => [...document.querySelectorAll(`#bl-${sec} .bi-inp`)].map(i => i.value), sec)) === before, '');
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
