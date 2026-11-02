// 검색 결과 정렬 · 밀기 (v. 26-1102-14, HB). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_search_sort_swipe.js   (SHOT=폴더 를 주면 화면을 찍는다)
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    try { localStorage.removeItem(_lsk('srchSort')); } catch (e) {}
    const k = tKey();
    getBigs(k, 'pm').push({ text: '정렬 다', ct: 3000 });
    getBigs(k, 'am').push({ text: '정렬 라', ct: 1000 }, { text: '정렬 가' });
    getSmalls(k, 'am').push({ text: '정렬 나', ct: 2000 });
    save(); renderToday();
  });
  // 입력칸으로 새로 만든 할일에 ct
  const made = await p.evaluate(() => { const t0 = Date.now(); const it = _newTask('새것'); return it.ct >= t0; });
  ok('새 할일에 만든 시각(ct)', made);
  await p.evaluate(() => { openSearch(); const i = document.getElementById('srchInput'); i.value = '정렬'; _srchInput('정렬'); });
  await p.waitForTimeout(400);
  const order = () => p.evaluate(() => [...document.querySelectorAll('#srchBody .srch-t .srch-tx')].map(x => x.textContent.replace('정렬 ', '')).join(''));
  const bar = () => p.evaluate(() => [...document.querySelectorAll('.srch-sort button')].map(x => (x.classList.contains('on') ? '*' : '') + x.textContent));
  ok('단추 넷 · 기본 ToDo배치순', JSON.stringify(await bar()) === JSON.stringify(['*ToDo배치순', '처음등록순', '가까운 날짜순', 'ㄱㄴㄷ순']), await bar());
  ok('ToDo배치순 = 오전 빅(라 · 가) → 오전 스몰(나) → 오후(다)', (await order()) === '라가나다', await order());
  if (SHOT) await p.screenshot({ path: SHOT + '/srch-sort.png' });
  await p.evaluate(() => _srchSetSort('ct')); await p.waitForTimeout(100);
  ok('처음등록순: ct 없는 것(가) → 라 → 나 → 다', (await order()) === '가라나다', await order());
  await p.evaluate(() => _srchSetSort('ct')); await p.waitForTimeout(100);
  ok('한 번 더 → 최신등록순 · 단추 글자도', (await order()) === '다나라가' && (await bar())[1] === '*최신등록순', [await order(), await bar()]);
  await p.evaluate(() => _srchSetSort('abc')); await p.waitForTimeout(100);
  ok('ㄱㄴㄷ순', (await order()) === '가나다라', await order());
  ok('이 기기에 기억', await p.evaluate(() => localStorage.getItem(_lsk('srchSort')) === 'abc'));
  await p.evaluate(() => _srchSetSort('todo'));

  // 밀기
  const swipe = async (text, dx, ms) => {
    await p.evaluate(({ text, dx, ms }) => new Promise(res => {
      const row = [...document.querySelectorAll('#srchBody .srch-row.srch-t')].find(r => r.querySelector('.srch-tx').textContent === text);
      const el = row.querySelector('.srch-tx'), rc = el.getBoundingClientRect(), x0 = rc.left + 30, y0 = rc.top + 6;
      const T = x => new Touch({ identifier: 7, target: el, clientX: x, clientY: y0 });
      el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [T(x0)], targetTouches: [T(x0)], changedTouches: [T(x0)] }));
      const steps = 6; let i = 0;
      const tick = () => { i++; const x = x0 + dx * i / steps; el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [T(x)], targetTouches: [T(x)], changedTouches: [T(x)] }));
        if (i < steps) setTimeout(tick, ms / steps); else { window.__swMid = row.classList.contains('srch-swiping') && /translateX/.test(getComputedStyle(row.querySelector('.srch-tbox')).transform || '') || row.classList.contains('srch-swiping');
          el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], targetTouches: [], changedTouches: [T(x0 + dx)] })); res(); } };
      setTimeout(tick, 20);
    }), { text, dx, ms });
    await p.waitForTimeout(450);
  };
  await swipe('정렬 가', 200, 300);
  let s = await p.evaluate(() => ({ mid: window.__swMid, done: !!getBigs(tKey(), 'am').find(x => x.text === '정렬 가').done, srch: _srchIsOpen() }));
  ok('오른쪽으로 밀면 완료 · 손가락을 따라 움직였다 · 검색에 머문다', s.mid && s.done && s.srch, s);
  await swipe('정렬 가', 200, 300);
  ok('완료한 것을 다시 오른쪽 → 완료 풀기', await p.evaluate(() => !getBigs(tKey(), 'am').find(x => x.text === '정렬 가').done));
  await swipe('정렬 라', 40, 300);
  ok('조금만 밀면 제자리 (안 바뀜)', await p.evaluate(() => !getBigs(tKey(), 'am').find(x => x.text === '정렬 라').done && !document.querySelector('.srch-swiping')));
  await swipe('정렬 라', -220, 300);
  s = await p.evaluate(() => ({ gone: !getBigs(tKey(), 'am').some(x => x.text === '정렬 라'), trash: (ST.days[tKey()].trash || []).some(x => (x.item ? x.item.text : x.text) === '정렬 라'), toast: (document.getElementById('_toast') || {}).innerText || '', row: [...document.querySelectorAll('#srchBody .srch-tx')].some(x => x.textContent === '정렬 라') }));
  ok('왼쪽으로 밀면 휴지통 · 결과에서 빠짐 · 되돌리기 줄', s.gone && s.trash && !s.row && /되돌리기/.test(s.toast), s);
  await p.evaluate(() => { doUndo(); _srchRender(true); }); await p.waitForTimeout(200);
  ok('되돌리기 → 다시 있다', await p.evaluate(() => getBigs(tKey(), 'am').some(x => x.text === '정렬 라')));
  await swipe('정렬 다', 60, 120);
  ok('빠르게 튕기면 짧아도 넘어간다', await p.evaluate(() => !!getBigs(tKey(), 'pm').find(x => x.text === '정렬 다').done));
  // 세로로 움직이면 밀기 아님
  await p.evaluate(() => new Promise(res => { const el = document.querySelector('#srchBody .srch-tx'), r = el.getBoundingClientRect(); const T = (x, y) => new Touch({ identifier: 8, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [T(r.left + 30, r.top)], changedTouches: [T(r.left + 30, r.top)] }));
    el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, cancelable: true, touches: [T(r.left + 40, r.top + 60)], changedTouches: [T(r.left + 40, r.top + 60)] }));
    window.__v = !document.querySelector('.srch-swiping');
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [T(r.left + 40, r.top + 60)] })); res(); }));
  ok('세로로 움직이면 밀기가 아니다(스크롤)', await p.evaluate(() => window.__v));
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
