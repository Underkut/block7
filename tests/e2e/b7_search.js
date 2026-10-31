// 검색 화면 (v. 26-1031-8, HB 1031 1-2). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_search.js   (SHOT=폴더 를 주면 화면을 찍는다)
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    console.log('— 폭 ' + w);
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await p.waitForTimeout(1500);
    await p.evaluate(() => {
      const k = tKey(), d = new Date(); d.setDate(d.getDate() + 3);
      const k3 = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      getBigs(k, 'am').push({ text: '김 집사님께 연락 — 셀모임 장소', flag: true, contactTask: true, autoCarryCount: 3 });
      getBigs(k, 'pm').push({ text: '보고서 마감', memo: '국세청에 연락해서 서류 확인' });
      getSmalls(k, 'night').push({ text: '찬양팀 단톡에 콘티 연락', urgent: true });
      getBigs(k3, 'pm').push({ text: '수련회 준비', subs: [{ text: '목사님 연락처 확인', done: false }, { text: '숙소', done: true }] });
      getEvents(k3, 'pm').push({ text: '셀 리더 연락망 모임', time: '14:00' });
      save(); renderToday();
    });
    ok('돋보기 단추가 있다', await p.evaluate(() => !!document.getElementById('gnbSearchBtn')));
    await p.click('#gnbSearchBtn'); await p.waitForTimeout(300);
    ok('검색 화면이 열리고 칸에 커서', await p.evaluate(() => _srchIsOpen() && document.activeElement.id === 'srchInput'));
    if (SHOT) await p.screenshot({ path: SHOT + '/srch-empty-' + w + '.png' });
    await p.keyboard.type('연락'); await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ n: document.getElementById('srchCount').textContent, big: document.querySelectorAll('.srch-big').length, small: document.querySelectorAll('.srch-small').length, sub: document.querySelectorAll('.srch-sub').length, ev: document.querySelectorAll('.srch-e').length, memo: !!document.querySelector('.srch-memo .srch-hit') }));
    ok('빅 · 스몰 · 하위 · 일정 · 메모가 나온다', r.big >= 2 && r.small >= 1 && r.sub >= 1 && r.ev >= 1 && r.memo, r);
    if (w === 390) ok('폰은 전체화면', await p.evaluate(() => { const m = document.getElementById('srchModal').getBoundingClientRect(); return m.left === 0 && m.top === 0 && Math.round(m.width) === innerWidth; }));
    else ok('넓은 화면은 가운데 팝업', await p.evaluate(() => { const m = document.getElementById('srchModal').getBoundingClientRect(); return m.width <= 560 && Math.abs(m.left + m.width / 2 - innerWidth / 2) < 2; }));
    if (SHOT) await p.screenshot({ path: SHOT + '/srch-res-' + w + '.png' });
    await p.evaluate(() => _srchSetKind('events')); await p.waitForTimeout(100);
    ok('일정만 거르기', await p.evaluate(() => document.querySelectorAll('.srch-t').length === 0 && document.querySelectorAll('.srch-e').length >= 1));
    await p.evaluate(() => _srchSetKind('all'));
    // 하위 할일을 누르면 그 날 · 그 구간으로 가서 상위 줄이 반짝
    await p.evaluate(() => document.querySelector('.srch-sub').click()); await p.waitForTimeout(700);
    const g = await p.evaluate(() => ({ open: _srchIsOpen(), flash: !!document.querySelector('.task-flash'), toast: (document.getElementById('_toast') || {}).innerText || '' }));
    ok('하위 할일 → 그 날로 가서 반짝 · 돌아가기 줄', !g.open && g.flash && /검색으로 돌아가기/.test(g.toast), g);
    await p.evaluate(() => openSearch()); await p.waitForTimeout(200);
    ok('다시 열면 검색어 그대로', await p.evaluate(() => document.getElementById('srchInput').value === '연락' && document.querySelectorAll('.srch-row').length > 0));
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('ESC 로 닫힘', await p.evaluate(() => !_srchIsOpen()));
    ok('머리줄이 넘치지 않는다', await p.evaluate(() => { const h = document.querySelector('header'); return h.scrollWidth <= h.clientWidth + 1; }));
  }
  // 360 폭에서도 머리줄
  const p2 = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 360, height: 700 } })).newPage();
  await p2.goto(APP); await p2.waitForTimeout(1200);
  ok('360px 머리줄이 넘치지 않는다', await p2.evaluate(() => { const h = document.querySelector('header'); return h.scrollWidth <= h.clientWidth + 1; }));
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
