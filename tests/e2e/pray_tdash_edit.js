// 기도노트 There 대시보드 D탭 — 기도노트 기록 줄 고치기 · 지우기 (HB 1028-3 5-1 · 5-2 · 6-2-2).
// ⚠️ check.sh 가 돌리지 않는다. 로그인 없이 앱만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/pray_tdash_edit.js
// 지키는 것 (이름은 지어낸 것):
//  ① 기도노트 줄만 고칠 수 있다 (톡 = 고치기 창이 대시보드 위에 보인다)
//  ② 카드 줄을 왼쪽으로 밀면 그 줄만 빠지고 기도 시간은 그대로 · 되돌리기
//  ③ 오른쪽으로 밀면 줄이 아니라 날짜가 넘어간다(예전 그대로)
//  ④ 카드 고치기 — 기도 항목 · 시간 · 바꾼 것 없으면 조용히 닫힘
//  ⑤ 한 장 기도 한 번을 지우면 그 안의 카드도 함께 · 합계에서 빠짐
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  const D = await p.evaluate(() => {
    document.documentElement.classList.add('iosgap');   // 아이패드 · 아이폰 홈 화면 앱처럼 (#app 이 테마색을 칠한다)
    const a = newTarget('person', '가람'), c = newTarget('person', '다온'); DB.T.push(a, c);
    const t0 = Date.now() - 3 * 3600e3, D = dayOf(t0);
    addPraySession(DB, t0, 600, 'focus', 'S1');
    addFocusCard(DB, D, 'S1', a.id, t0, t0 + 240e3, 240, true, '가족');
    addFocusCard(DB, D, 'S1', c.id, t0 + 240e3, t0 + 420e3, 180, false, '가족');
    save(); openThereDash('day', D); return D;
  });
  await sleep(700);
  const st = () => p.evaluate(D => { const L = DB.log[D]; return { s: L.s, fc: (L.fc || []).map(x => [x.n, x.d]), ses: L.ses.map(x => x.d) }; }, D);
  const rows = () => p.evaluate(() => [...document.querySelectorAll('#tdashOv [data-ed]')].map(r => r.dataset.ed + ':' + r.textContent.replace(/\s+/g, ' ').trim()));
  const r0 = await rows();
  ok('① 기도노트 줄 = 기도 한 번 1 + 카드 2', r0.filter(x => x.startsWith('ses')).length === 1 && r0.filter(x => x.startsWith('fc')).length === 2, r0);
  // 밀기 — 줄 가운데서 dx 만큼
  const swipe = (sel, dx) => p.evaluate(([sel, dx]) => new Promise(res => {
    const r = document.querySelectorAll(sel)[0], bx = r.getBoundingClientRect(), x0 = bx.left + bx.width * .6, y = bx.top + bx.height / 2;
    const T = x => new Touch({ identifier: 1, target: r, clientX: x, clientY: y });
    const fire = (n, x) => r.dispatchEvent(new TouchEvent(n, { bubbles: true, cancelable: true, touches: n === 'touchend' ? [] : [T(x)], changedTouches: [T(x)] }));
    fire('touchstart', x0); let k = 1;
    const iv = setInterval(() => { if (k <= 8) { fire('touchmove', x0 + dx * k / 8); k++; } else { clearInterval(iv); fire('touchend', x0 + dx); setTimeout(res, 700); } }, 30);
  }), [sel, dx]);
  const s0 = await st();
  await swipe('#tdashOv [data-ed="fc"]', -260);
  const s1 = await st();
  ok('⭐② 카드 줄을 왼쪽으로 밀면 그 줄만 빠짐', s1.fc.length === 1 && s1.fc[0][0] === '다온', s1);
  ok('⭐② 기도 시간 · 합계는 그대로', s1.s === s0.s && s1.ses[0] === 600, [s0, s1]);
  ok('② 화면에서도 빠짐', (await rows()).filter(x => x.startsWith('fc')).length === 1);
  const tmsg = await p.evaluate(() => { const t = document.getElementById('toast'); return t.classList.contains('on') ? t.textContent : ''; });
  ok('② 알림이 대시보드 위에 보임', tmsg.includes('기록에서 뺐어요') && await p.evaluate(() => +getComputedStyle(document.getElementById('toast')).zIndex > 99990), tmsg);
  await p.click('#toast button'); await sleep(400);
  ok('⭐② 되돌리기 → 카드가 돌아옴', (await st()).fc.length === 2 && (await rows()).filter(x => x.startsWith('fc')).length === 2);
  // 짧게 밀면 제자리
  await swipe('#tdashOv [data-ed="fc"]', -50); ok('② 짧게 밀면 안 지움', (await st()).fc.length === 2);
  // ③ 오른쪽으로 밀면 날짜 넘김
  const day0 = await p.evaluate(() => document.querySelector('#tdashOv .tdash-nav b').textContent);
  await swipe('#tdashOv [data-ed="fc"]', 260); await sleep(300);
  const day1 = await p.evaluate(() => document.querySelector('#tdashOv .tdash-nav b').textContent);
  ok('③ 오른쪽으로 밀면 어제로', day0 !== day1 && (await st()).fc.length === 2, [day0, day1]);
  await p.evaluate(D => { TDASH.close(true); openThereDash('day', D); }, D); await sleep(600);
  // ④ 톡 → 고치기 창 (대시보드 위)
  await p.evaluate(() => document.querySelectorAll('#tdashOv [data-ed="fc"]')[1].querySelector('em').click()); await sleep(450);
  const sh = await p.evaluate(() => { const w = document.querySelector('.sh-wrap'); return w ? { z: +getComputedStyle(w).zIndex, name: document.getElementById('tdName').value, v: document.getElementById('ptMin').value } : null; });
  ok('⭐④ 톡 → 고치기 창이 대시보드 위에 · 이름 · 초', sh && sh.z > 99990 && sh.name === '다온' && sh.v === '180', sh);
  await p.click('[data-a="td-ok"]'); await sleep(400);
  ok('④ 안 바꾸고 저장 = 조용히 닫힘', await p.evaluate(() => !SHEET && !document.getElementById('toast').classList.contains('on')));
  await p.evaluate(() => document.querySelectorAll('#tdashOv [data-ed="fc"]')[1].querySelector('em').click()); await sleep(450);
  await p.fill('#tdName', '가람'); await p.fill('#ptMin', '500'); await p.click('[data-a="td-ok"]'); await sleep(400);
  const s4 = await st();
  ok('⭐④ 항목 · 시간 고침 → 넘친 140초만큼 한 번도 늚 (240+500=740)', s4.fc[1][0] === '가람' && s4.fc[1][1] === 500 && s4.ses[0] === 740 && s4.s === s0.s + 140, s4);
  await p.evaluate(() => document.querySelectorAll('#tdashOv [data-ed="fc"]')[1].querySelector('em').click()); await sleep(450);
  await p.fill('#tdName', '없는이름'); await p.click('[data-a="td-ok"]'); await sleep(300);
  ok('④ 없는 이름은 안 받음 (창 그대로)', await p.evaluate(() => !!SHEET));
  await p.evaluate(() => closeSheet(true));
  // ⑤ 한 번 지우기
  await swipe('#tdashOv [data-ed="ses"]', -300);
  const s5 = await st();
  ok('⭐⑤ 한 장 기도 한 번 지움 → 카드도 함께 · 합계 0', s5.fc.length === 0 && s5.s === 0, s5);
  ok('⑤ 대시보드에 기도노트 줄 없음', (await rows()).length === 0, await rows());
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
