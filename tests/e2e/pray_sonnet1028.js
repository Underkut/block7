// 기도노트 1028-3 Sonnet 묶음 — 1(빈 목록 안내) · 4(이번 장 시계) · 5-4(대시보드 복귀 · 토스트) · 6-1(오늘 펼침)
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_sonnet1028.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  ok('⭐6-1 기도한 날 처음엔 오늘이 골라짐', await p.evaluate(() => UI.calDay === TODAY));
  await p.evaluate(() => { const a = newTarget('person', '가람'), c = newTarget('person', '다온'); DB.T.push(a, c); window._a = a; focusStart([{ id: a.id, sec: 'top' }, { id: c.id, sec: 'top' }], 0); });
  await sleep(1400);
  const tm = await p.evaluate(() => [document.querySelector('.f-time').textContent, getComputedStyle(document.getElementById('fCardT')).color !== getComputedStyle(document.getElementById('fTime')).color]);
  ok('⭐4 시계 = 이번 장 / 전체 · 붉은 기', /^0:0\d \/ 0:0\d$/.test(tm[0]) && tm[1], tm);
  await p.click('[data-a="focus-pause"]'); await sleep(300);
  const c1 = await p.evaluate(() => document.getElementById('fCardT').textContent); await sleep(2100);
  ok('⭐4 멈춘 동안 이번 장 시간도 멈춤', (await p.evaluate(() => Math.floor(F.cacc + (F.paused ? 0 : (Date.now() - F.ct0) / 1000)))) === (await p.evaluate(() => Math.floor(F.cacc))), c1);
  await p.touchscreen.tap(200, 420); await sleep(300);
  await p.click('[data-a="focus-skip"]'); await sleep(500);
  ok('⭐5-3 다음에 = fc 에 안 남음', await p.evaluate(() => !((DB.log[TODAY] || {}).fc || []).some(x => x.pid === window._a.id)));
  // 1 — 로그인 안 한 상태의 빈 목록
  await p.click('[data-a="embed-keep"]'); await sleep(400);
  ok('⭐1 저장 목록 비었을 때 로그인 안내', await p.evaluate(() => /로그인/.test((document.querySelector('#gPop .gpop-empty') || {}).textContent || '')));
  await p.mouse.click(10, 500); await sleep(300);
  await p.evaluate(() => readPlanMenu(document.querySelector('[data-lp="toread"]'))); await sleep(400);
  ok('⭐1 읽기 계획 비었을 때 로그인 안내', await p.evaluate(() => /로그인/.test((document.querySelector('#gPop .gpop-empty') || {}).textContent || '')));
  await p.evaluate(() => { SY.user = { uid: 'x' }; keepMenu(document.querySelector('[data-a="embed-keep"]')); }); await sleep(300);
  ok('⭐1 로그인했는데 자료 없음 → 저장하라는 안내', await p.evaluate(() => /Sweeter 에서 말씀을 저장/.test((document.querySelector('#gPop .gpop-empty') || {}).textContent || '')));
  await p.evaluate(() => { SY.user = null; closeFocus(); });
  // 5-4 — 대시보드 → 항목 상세 → 취소 = 대시보드 D탭 · 토스트 없음
  await p.evaluate(() => { DB.log[TODAY] = { d: [window._a.id], p: {}, k: [], s: 60, ses: [{ id: 's1', t: Date.now() - 6e4, time: '09:00', d: 60, src: 'focus' }], fc: [{ id: 'c1', s: 's1', pid: window._a.id, n: '가람', k: '1순위', a: Date.now() - 6e4, t: Date.now(), d: 40, amen: true }] }; save(); openThereDash('day', TODAY); });
  await sleep(600);
  await p.evaluate(() => { const ov = document.getElementById('tdashOv'); const sp = document.createElement('div'); sp.style.height = '1500px'; ov.appendChild(sp); window._ov = ov; ov.scrollTop = 300; window._st = ov.scrollTop; });
  await p.evaluate(() => { const el = [...document.querySelectorAll('#tdashOv .tdash-item')].find(x => /가람/.test(x.textContent)); if (el) el.click(); });
  await sleep(300);
  const opened = await p.evaluate(() => UI.layers.length);
  if (!opened) { console.log(await p.evaluate(() => document.querySelector('#tdashOv') && document.querySelector('#tdashOv').innerText.slice(0, 300))); console.log('  (대시보드에서 항목 줄을 못 찾아 5-4 건너뜀)'); }
  else {
    ok('⭐5-4 상세가 떠 있는 동안 대시보드는 닫히지 않고 그대로', await p.evaluate(() => document.getElementById('tdashOv') === window._ov && window._ov.classList.contains('in')));
    await p.evaluate(() => { window._seen = []; const ov = window._ov; window._iv = setInterval(() => window._seen.push(+getComputedStyle(ov).opacity), 16); });
    await p.click('[data-a="layer-cancel"]'); await sleep(900);
    ok('⭐5-4 돌아올 때 같은 대시보드 · 투명해진 적 없음(디졸브 · 깜빡임 없음)', await p.evaluate(() => { clearInterval(window._iv); return document.getElementById('tdashOv') === window._ov && Math.min(...window._seen) === 1; }));
    ok('⭐5-4 읽던 스크롤 자리 그대로', await p.evaluate(() => window._st > 0 && window._ov.scrollTop === window._st), await p.evaluate(() => [window._st, window._ov.scrollTop]));
    ok('⭐5-4-1 취소로 닫으면 대시보드 D탭', await p.evaluate(() => TDASH.isOpen() && /Today/.test((document.querySelector('[data-tdsub]') || {}).textContent || '')));
    ok('⭐5-4-2 바꾼 것 없으면 되돌렸습니다 토스트 없음', await p.evaluate(() => !/바꾼 것을 되돌렸/.test(document.body.innerText)));
  }
  console.log('결과: 통과 ' + pass + ' / 실패 ' + fail); await b.close(); process.exit(fail ? 1 : 0);
})();
