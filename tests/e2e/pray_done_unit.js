// 지도 체크 단추 흐림 단위 · 오늘 아멘한 이름 건너뛰기 (HB 1028-3 7). 이름은 지어낸 것.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_done_unit.js
//  ① 단위 '서브 그룹'(처음값 · 예전 그대로): 다 기도한 서브 그룹만 흐림, 이름 하나는 안 흐림
//  ② 단위 '기도 항목': 기도한 이름 하나도 흐림 · 숨기기 단계면 그 이름이 숨음
//  ③ 단위 '그룹': 서브 그룹은 다 기도해도 안 흐림
//  ④ 한 장 기도 — 오늘 아멘한 이름은 그룹을 다시 기도할 때 건너뜀 · 콕 집은 이름은 남김
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  const ids = await p.evaluate(() => {
    const P = ['가람', '나래', '다온', '라온', '마루'].map(n => { const t = newTarget('person', n); DB.T.push(t); return t; });
    const g = newGroup('가족', '#e09a28'); g.lines = [{ id: 'L1', segs: [[P[0].id]], r: {}, text: '' }];
    const k = newGroup('청년', '#3eaaf8'); k.parent = g.id; k.lines = [{ id: 'L2', segs: [[P[1].id]], r: {}, text: '' }, { id: 'L3', segs: [[P[2].id]], r: {}, text: '' }];
    const g2 = newGroup('교회', '#8c78f0'); g2.lines = [{ id: 'L4', segs: [[P[3].id]], r: {}, text: '' }, { id: 'L5', segs: [[P[4].id]], r: {}, text: '' }];
    DB.G.push(g, k, g2);
    toggleDone(DB, P[1].id, TODAY); toggleDone(DB, P[2].id, TODAY); toggleDone(DB, P[0].id, TODAY) ; toggleDone(DB, P[0].id, TODAY);   // 청년 둘만 기도함
    setDevPref('doneMode', 1); save(); showTab('map'); return P.slice(0, 4).map(x => x.id).concat([P[4].id, k.id]);
  });
  await sleep(500);
  const look = () => p.evaluate(ids => {
    const m = document.querySelector('#v-map .masonry'), sg = m.querySelector('.sgb[data-gid="' + ids[5] + '"]'), pn = id => m.querySelector('.pn[data-id="' + id + '"]');
    return { cls: m.className, sgOp: getComputedStyle(sg).opacity, pnOp: getComputedStyle(pn(ids[1])).opacity, pnDisp: getComputedStyle(pn(ids[1])).display, otherOp: getComputedStyle(pn(ids[0])).opacity };
  }, ids);
  let s = await look();
  ok('⭐① 처음값 서브 그룹 — 다 기도한 서브 그룹 흐림', s.cls.includes('du-s') && +s.sgOp < 1, s);
  await p.evaluate(() => { setDevPref('doneUnit', 'g'); renderView(); }); await sleep(700); s = await look();
  ok('③ 그룹 단위 — 서브 그룹은 안 흐림', +s.sgOp === 1, s);
  await p.evaluate(() => { setDevPref('doneUnit', 'i'); toggleDone(DB, DB.T.find(t => t.name === '라온').id, TODAY); renderView(); }); await sleep(700);
  const lo = await p.evaluate(ids => { const m = document.querySelector('#v-map .masonry'); return getComputedStyle(m.querySelector('.pn[data-id="' + ids[3] + '"]')).opacity; }, ids);
  ok('⭐② 항목 단위 — 기도한 이름 하나(교회 · 라온)도 흐림, 안 한 이름(가람)은 그대로', +lo < 1 && +(await look()).otherOp === 1, lo);
  await p.evaluate(() => { setDevPref('doneMode', 3); renderView(); }); await sleep(700);
  const hid = await p.evaluate(ids => { const m = document.querySelector('#v-map .masonry'); return [getComputedStyle(m.querySelector('.pn[data-id="' + ids[3] + '"]')).display, getComputedStyle(m.querySelector('.pn[data-id="' + ids[0] + '"]')).display]; }, ids);
  ok('② 항목 단위 · 숨기기 — 기도한 이름은 숨고 안 한 이름은 보임', hid[0] === 'none' && hid[1] !== 'none', hid);
  // ④ 아멘 건너뛰기
  await p.evaluate(() => { setDevPref('doneMode', 0); const D = DB.log[TODAY]; D.fc = []; const nae = DB.T.find(t => t.name === '나래'); addFocusCard(DB, TODAY, 'S0', nae.id, 1, 2, 30, true, '청년'); save(); });
  const deckNames = () => p.evaluate(() => F.deck.map(d => findAny(DB, d.id).name).join(',') + '@' + findAny(DB, F.deck[F.i].id).name);
  await p.evaluate(ids => openFocusMap('g:' + ids[5]), ids); await sleep(400);
  ok('⭐④ 서브 그룹(청년)을 다시 기도 — 아멘한 나래는 건너뛰고 다온부터', (await deckNames()) === '가람,다온,라온,마루@다온', await deckNames());
  await p.evaluate(() => closeFocus());
  await p.evaluate(ids => focusFromItem(ids[1]), ids); await sleep(400);
  ok('④ 나래를 콕 집으면 나래는 남김', (await deckNames()).endsWith('@나래'), await deckNames());
  await p.evaluate(() => closeFocus());
  await p.evaluate(() => { const da = DB.T.find(t => t.name === '다온'); addFocusCard(DB, TODAY, 'S0', da.id, 3, 4, 30, true, '청년'); });
  await p.evaluate(ids => focusFromItem(ids[5]), ids); await sleep(300);
  ok('④ 청년 모두 아멘했으면 그다음(교회 · 라온)부터', (await deckNames()).endsWith('@라온'), await deckNames());
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
