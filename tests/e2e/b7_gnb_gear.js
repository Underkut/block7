// GNB B안 — 톱니 (v. 26-1031-7, HB 1031 1-1). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_gnb_gear.js
// ① 휴지통이 비면 톱니 = 곧장 설정창 · 빨간 점 없음  ② 차 있으면 빨간 점 + '설정 · 휴지통 n' 메뉴
// ③ ESC 로 메뉴 닫힘  ④ 우클릭은 비어 있어도 메뉴  ⑤ 360px 에서도 머리줄이 넘치지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 360, height: 700 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await p.waitForTimeout(1500);
  await p.evaluate(() => { Object.values(ST.days).forEach(d => d.trash = []); updateTrashBadge(); });
  ok('휴지통 단추는 머리줄에 없다', await p.evaluate(() => !document.querySelector('header .trash-btn')));
  ok('빈 휴지통: 빨간 점 없음', await p.evaluate(() => !document.getElementById('gnbTrashDot').classList.contains('on')));
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  ok('빈 휴지통: 곧장 설정창', await p.evaluate(() => document.getElementById('settingsOverlay').classList.contains('open') && !document.getElementById('b7Pop')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  await p.evaluate(() => sendToTrash(tKey(), 'big', 'am', { text: 'x' }));
  ok('차 있으면 빨간 점', await p.evaluate(() => document.getElementById('gnbTrashDot').classList.contains('on')));
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  const m = await p.evaluate(() => { const e = document.getElementById('b7Pop'); return e && { t: e.innerText, ic: e.querySelectorAll('.b7-pop-ic svg').length }; });
  ok('메뉴: 설정 · 휴지통 1 (아이콘 둘)', m && /설정/.test(m.t) && /휴지통\s*1/.test(m.t) && m.ic === 2, m);
  ok('메뉴만 열리고 설정창은 아직', await p.evaluate(() => !document.getElementById('settingsOverlay').classList.contains('open')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok('ESC 로 메뉴 닫힘', await p.evaluate(() => !document.getElementById('b7Pop')));
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  await p.evaluate(() => [...document.querySelectorAll('#b7Pop [data-i]')][1].click()); await p.waitForTimeout(400);
  ok('휴지통 줄 → 휴지통 열림', await p.evaluate(() => document.getElementById('trashPanel').classList.contains('op')));
  await p.evaluate(() => { closeTrash(); Object.values(ST.days).forEach(d => d.trash = []); updateTrashBadge(); }); await p.waitForTimeout(300);
  await p.click('#gnbGearBtn', { button: 'right' }); await p.waitForTimeout(300);
  ok('우클릭: 비어 있어도 메뉴', await p.evaluate(() => !!document.getElementById('b7Pop')));
  ok('360px 머리줄이 넘치지 않는다', await p.evaluate(() => { const h = document.querySelector('header'); return h.scrollWidth <= h.clientWidth + 1; }));
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
