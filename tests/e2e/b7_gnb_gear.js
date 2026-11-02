// GNB B안 — 톱니 (v. 26-1031-7, HB 1031 1-1). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_gnb_gear.js
// v. 26-1102-2: 좁은 폰(<520px)은 톱니 = 메뉴(설정·휴지통·백업). 넓으면 돋보기-백업-휴지통-톱니 가 밖에, 톱니 = 곧장 설정.
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 360, height: 700 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await p.waitForTimeout(1500);
  await p.evaluate(() => { Object.values(ST.days).forEach(d => d.trash = []); updateTrashBadge(); });
  const vis = id => p.evaluate(i => { const e = document.getElementById(i); return !!e && e.offsetWidth > 0; }, id);
  console.log('— 360px (좁은 폰)');
  ok('휴지통 · 백업 단추는 숨는다', !(await vis('gnbTrashBtn')) && !(await vis('gnbBackupBtn')));
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  let m = await p.evaluate(() => { const e = document.getElementById('b7Pop'); return e && { t: [...e.querySelectorAll('[data-i]')].map(r => r.innerText.trim()), ic: e.querySelectorAll('.b7-pop-ic svg').length }; });
  ok('빈 휴지통이어도 메뉴: 설정 · 휴지통 · 백업 (아이콘 셋)', m && m.t.join('|') === '설정|휴지통|백업' && m.ic === 3, m);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok('ESC 로 메뉴 닫힘', await p.evaluate(() => !document.getElementById('b7Pop')));
  await p.evaluate(() => sendToTrash(tKey(), 'big', 'am', { text: 'x' }));
  ok('차 있으면 톱니에 빨간 점', await p.evaluate(() => getComputedStyle(document.getElementById('gnbTrashDot')).display !== 'none'));
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  await p.evaluate(() => [...document.querySelectorAll('#b7Pop [data-i]')][1].click()); await p.waitForTimeout(400);
  ok('휴지통 줄 → 휴지통 열림', await p.evaluate(() => document.getElementById('trashPanel').classList.contains('op')));
  await p.evaluate(() => closeTrash()); await p.waitForTimeout(300);
  await p.click('#gnbGearBtn'); await p.waitForTimeout(300);
  let dl = p.waitForEvent('download', { timeout: 4000 }).catch(() => null);
  await p.evaluate(() => [...document.querySelectorAll('#b7Pop [data-i]')][2].click());
  ok('백업 줄 → 파일 내려받기', !!(await dl));
  ok('360px 머리줄이 넘치지 않는다', await p.evaluate(() => { const h = document.querySelector('header'); return h.scrollWidth <= h.clientWidth + 1; }));
  for (const w of [520, 820, 1280]) {
    console.log('— ' + w + 'px');
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(300);
    ok('휴지통 · 백업이 밖에 보인다', (await vis('gnbTrashBtn')) && (await vis('gnbBackupBtn')));
    ok('순서: 돋보기 - 백업 - 휴지통 - 톱니', await p.evaluate(() => { const x = i => document.getElementById(i).getBoundingClientRect().left; return x('gnbSearchBtn') < x('gnbBackupBtn') && x('gnbBackupBtn') < x('gnbTrashBtn') && x('gnbTrashBtn') < x('gnbGearBtn'); }));
    ok('빨간 점은 휴지통에 (톱니엔 없음)', await p.evaluate(() => getComputedStyle(document.getElementById('gnbTrashDotW')).display !== 'none' && getComputedStyle(document.getElementById('gnbTrashDot')).display === 'none'));
    ok('머리줄이 넘치지 않는다', await p.evaluate(() => { const h = document.querySelector('header'); return h.scrollWidth <= h.clientWidth + 1; }));
  }
  await p.evaluate(() => document.getElementById('gnbGearBtn').click()); await p.waitForTimeout(300);
  ok('넓은 화면: 톱니 = 곧장 설정창', await p.evaluate(() => document.getElementById('settingsOverlay').classList.contains('open') && !document.getElementById('b7Pop')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  dl = p.waitForEvent('download', { timeout: 4000 }).catch(() => null);
  await p.evaluate(() => document.getElementById('gnbBackupBtn').click());
  ok('백업 단추 → 파일 내려받기', !!(await dl));
  await p.evaluate(() => document.getElementById('gnbTrashBtn').click()); await p.waitForTimeout(400);
  ok('휴지통 단추 → 휴지통 열림', await p.evaluate(() => document.getElementById('trashPanel').classList.contains('op')));
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
