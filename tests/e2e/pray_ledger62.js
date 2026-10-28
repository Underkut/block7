// 기록 › 기도한 날 '그날의 장부' (HB 1028-3 6-2c). 이름은 지어낸 것.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_ledger62.js
// html.iosgap 을 달고 돈다 (아이패드 · 아이폰 홈 화면 앱처럼)
//  ① 기도 한 번 아래 이름 칩(● 아멘) · 이름 없이 머문 시간 · 예전 이름 칩 줄은 없고 '기도함'만 누른 이름만 한 줄
//  ② 기도 한 번 톡 = 시간 고치기 창 · 이름 칩 톡 = 항목 · 시간 고치기 창 (안 바꾸고 저장 = 조용히 닫힘)
//  ③ 왼쪽으로 밀기 → '지우기' → 그 기도와 안의 이름이 함께 빠짐 · 되돌리기
//  ④ 이름 칩 길게(PC 는 오른쪽 누르기) = 그 이름부터 한 장 기도
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 1400 } });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => {
    document.documentElement.classList.add('iosgap');
    const P = {}; ['가람', '나래', '다온', '마루', '바다', '아라'].forEach(n => { const t = newTarget('person', n); DB.T.push(t); P[n] = t; });
    const g = newGroup('청년부', '#888'); g.lines = ['다온', '마루', '바다'].map((x, i) => ({ id: 'L' + i, segs: [[P[x].id]], r: {}, text: '' })); DB.G.push(g);
    const D = TODAY, at = (h, m) => { const d = parseYmd(D); d.setHours(h, m || 0, 0, 0); return d.getTime(); };
    addPraySession(DB, at(5, 40), 840, 'focus', 'S1');
    addFocusCard(DB, D, 'S1', P['가람'].id, at(5, 40), at(5, 43), 180, true, '가족'); toggleDone(DB, P['가람'].id, D);
    addFocusCard(DB, D, 'S1', P['나래'].id, at(5, 43), at(5, 45), 130, true, '가족'); toggleDone(DB, P['나래'].id, D);
    addPraySession(DB, at(12, 30), 360, 'map'); addMapPrayer(DB, D, [P['마루'].id, P['바다'].id], at(12, 31), at(12, 34), '청년부');
    toggleDone(DB, P['아라'].id, D);
    save(); UI.histTab = 'days'; UI.calDay = TODAY; showTab('hist');
  });
  await sleep(500);
  const look = () => p.evaluate(() => ({
    blocks: [...document.querySelectorAll('#v-hist .row.pled')].map(r => r.querySelector('.pl-n').textContent + ':' + [...r.querySelectorAll('.pl-chip')].map(c => c.textContent + (c.classList.contains('am') ? '●' : '')).join(',') + (r.querySelector('.pl-rest') ? '|' + r.querySelector('.pl-rest').textContent : '')),
    loose: [...document.querySelectorAll('#v-hist .pl-loose .tag')].map(x => x.textContent), oldChips: document.querySelectorAll('#v-hist .chips2').length }));
  let s1 = await look();
  ok('⭐① 기도 한 번 아래 이름 칩(● 아멘) · 이름 없이 머문 시간', s1.blocks[0] === '한 장씩 기도하기:가람3분●,나래2분●|이름 없이 머문 시간 9분' && s1.blocks[1].startsWith('기도 지도 (There):청년부'), s1.blocks);
  ok('⭐① 위 이름 칩 줄은 없고 기도함만 누른 아라만 한 줄', s1.oldChips === 0 && JSON.stringify(s1.loose) === '["아라"]', s1);
  // ② 고치기 창
  await p.click('#v-hist .row.pled .pl-h'); await sleep(400);
  const sh2 = await p.evaluate(() => ({ t: SHEET.querySelector('.sh-t').textContent, info: (SHEET.querySelector('.td-info') || {}).textContent, v: document.getElementById('ptMin').value }));
  ok('⭐② 기도 한 번 톡 → 시간 고치기 창 — 시작 시각(초까지) · 길이 · 그 안 이름(● 아멘)', sh2.v === '14' && /05:40:00 시작 · 한 장씩 기도하기/.test(sh2.t) && /14분 동안/.test(sh2.t) && sh2.info === '가람 3분 ● · 나래 2분 10초 ●', sh2);
  await p.click('[data-a="pt-ok"]'); await sleep(400);
  ok('② 안 바꾸고 저장 = 조용히 닫힘', await p.evaluate(() => !SHEET && !document.getElementById('toast').classList.contains('on')));
  await p.click('#v-hist .pl-chip'); await sleep(400);
  ok('⭐② 이름 칩 톡 → 항목 · 시간 고치기 창(가람 · 180초)', await p.evaluate(() => !!SHEET && document.querySelector('.td-pickb span').textContent === '가람' && document.getElementById('ptMin').value === '180'));
  await p.evaluate(() => closeSheet(true));
  // ③ 밀어 지우기
  const box = await p.evaluate(() => { const r = document.querySelector('#v-hist .row.pled').getBoundingClientRect(); return { x: r.right - 40, y: r.top + 30 }; });
  await p.mouse.move(box.x, box.y); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(box.x - k * 16, box.y); await sleep(16); } await p.mouse.up(); await sleep(400);
  ok('③ 왼쪽으로 밀면 지우기가 드러남', await p.evaluate(() => { const a = document.querySelector('#v-hist .row.pled .sw-act'); return getComputedStyle(a).visibility === 'visible' && a.getBoundingClientRect().width > 40; }));
  await p.click('#v-hist .row.pled .sw-act'); await sleep(500);
  const s3 = await p.evaluate(() => { const L = DB.log[TODAY]; return { ses: L.ses.filter(e => e.d > 0).map(e => e.src), fc: (L.fc || []).length, mp: (L.mp || []).length, s: L.s, toast: document.getElementById('toast').textContent }; });
  ok('⭐③ 그 기도와 안의 이름이 함께 빠짐 · 합계에서도', JSON.stringify(s3.ses) === '["map"]' && s3.fc === 0 && s3.mp === 2 && s3.s === 360 && s3.toast.includes('그 안의 이름 2개'), s3);
  await p.click('#toast button'); await sleep(400);
  ok('⭐③ 되돌리기 → 그대로 돌아옴', (await look()).blocks.length === 2 && (await p.evaluate(() => DB.log[TODAY].fc.length)) === 2);
  // ④ 길게 누르기
  const c = await p.evaluate(() => { const r = [...document.querySelectorAll('#v-hist .pl-chip')].find(x => x.textContent.startsWith('나래')).getBoundingClientRect(); return { x: r.x + 20, y: r.y + 10 }; });
  await p.mouse.click(c.x, c.y, { button: 'right' }); await sleep(400);   // PC 의 길게 누르기 = 오른쪽 누르기 (손가락 길게 누르기와 같은 longPressAct)
  ok('⭐④ 이름 칩 길게(오른쪽 누르기) → 그 이름부터 한 장 기도', await p.evaluate(() => F.on && findAny(DB, F.deck[F.i].id).name === '나래'), await p.evaluate(() => F.on && findAny(DB, F.deck[F.i].id).name));
  await p.evaluate(() => closeFocus());
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
