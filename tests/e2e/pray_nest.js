// 기도노트 지도 끌기 — 그룹을 다른 그룹 안에 넣고, 서브 그룹을 여백에 놓아 그룹으로 (H-5, pray v. 26-1022-3).
// ⚠️ check.sh 가 돌리지 않는다. 자료 규칙(넣을 수 있는지 · 두 기기 병합)은 tests/test_pray.js ㉔ 가 지킨다.
//   저장소 뿌리에서: python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/pray_nest.js
// 이름은 지어낸 것. 마우스(PC) 12 + 터치(아이폰 크기, 길게 누른 뒤 끌기) 4.
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html';
async function mouse() {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:820,height:1000} });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await p.waitForFunction(() => typeof DB === 'object');
  const seed = () => p.evaluate(() => {
    DB.G = []; DB.T = DB.T.filter(t => t.kind !== 'person');
    const mk = n => { const t = newTarget('person', n); DB.T.push(t); return { id: uid(), segs: [[t.id]], r: {}, text: '' }; };
    const A = newGroup('청년부', '#d9534f'), S1 = newGroup('1청', '#d9534f'), B = newGroup('찬양팀', '#3a7bd5'), C = newGroup('교사', '#2e9e6a');
    S1.parent = A.id;
    A.lines = [mk('가온'), mk('나래')]; S1.lines = [mk('다온'), mk('라희')]; B.lines = [mk('마루'), mk('바다'), mk('사랑')]; C.lines = [mk('아라'), mk('자람'), mk('차미'), mk('카이')];
    A.id = 'gA'; S1.id = 'gS'; S1.parent = 'gA'; B.id = 'gB'; C.id = 'gC';
    DB.G.push(A, S1, B, C); DB.set.mapDepth = 3; save(); document.querySelector('.tb[data-tab="map"]').click();
  });
  await seed(); await sleep(700);
  const rect = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
  const drag = async (from, to, hold) => {
    await p.mouse.move(from.x, from.y); await p.mouse.down();
    const n = 18; for (let i = 1; i <= n; i++) { await p.mouse.move(from.x + (to.x - from.x) * i / n, from.y + (to.y - from.y) * i / n); await sleep(30); }
    await sleep(hold || 450);
    const hint = await p.evaluate(() => { const h = document.querySelector('.md-hint.on'); return h ? h.textContent : ''; });
    await p.mouse.up(); await sleep(700);
    return hint;
  };
  const G = id => p.evaluate(id => { const g = findG(DB, id); return g && { parent: g.parent, lines: g.lines.length }; }, id);
  // ① 찬양팀을 교사 가운데에 → 교사의 서브 그룹
  let hb = await rect('.gcard[data-gid="gB"] .gh'), c = await rect('.gcard[data-gid="gC"]');
  let hint = await drag({ x: hb.x + 30, y: hb.y + hb.h / 2 }, { x: c.x + c.w / 2, y: c.y + c.h / 2 });
  ok('① 끄는 동안 안내 "교사 안으로 넣기"', hint.includes('교사') && hint.includes('넣기'), hint);
  ok('① 찬양팀이 교사의 서브 그룹 · 항목 3 그대로', JSON.stringify(await G('gB')) === JSON.stringify({ parent: 'gC', lines: 3 }), await G('gB'));
  ok('① 지도에 서브 그룹으로 보인다', await p.evaluate(() => !!document.querySelector('.gcard[data-gid="gC"] .sgb[data-gid="gB"]') && !document.querySelector('.gcard[data-gid="gB"]')));
  ok('① 되돌리기 알림', (await p.evaluate(() => document.querySelector('#toast').textContent)).includes('되돌리기'));
  await p.click('#toast button'); await sleep(500);
  ok('① 되돌리면 다시 그룹', (await G('gB')).parent === '', await G('gB'));
  // ② 청년부(서브 그룹 있음)를 교사 가운데 → 안 넣는다 · 안내
  let ha = await rect('.gcard[data-gid="gA"] .gh'); c = await rect('.gcard[data-gid="gC"]');
  hint = await drag({ x: ha.x + 30, y: ha.y + ha.h / 2 }, { x: c.x + c.w / 2, y: c.y + c.h / 2 });
  ok('② 안내 "넣을 수 없어요"', hint.includes('넣을 수 없어요'), hint);
  ok('② 청년부는 그대로 그룹', (await G('gA')).parent === '' && (await G('gS')).parent === 'gA');
  // ③ 1청(서브 그룹)을 카드 밖 여백에 → 그룹으로
  const hs = await rect('.sgb[data-gid="gS"] .sgh'), m = await rect('#v-map .masonry');
  hint = await drag({ x: hs.x + 30, y: hs.y + hs.h / 2 }, { x: m.x + m.w / 2, y: m.y + m.h + 120 });
  ok('③ 안내 "그룹으로 올리기"', hint.includes('그룹으로 올리기'), hint);
  ok('③ 1청이 그룹 · 항목 2 그대로', JSON.stringify(await G('gS')) === JSON.stringify({ parent: '', lines: 2 }), await G('gS'));
  ok('③ 청년부 바로 다음 그룹', await p.evaluate(() => topGroups(DB).map(g => g.id).join()) === 'gA,gS,gB,gC', await p.evaluate(() => topGroups(DB).map(g => g.id).join()));
  ok('③ 지도에 그룹 카드로', await p.evaluate(() => !!document.querySelector('.gcard[data-gid="gS"]')));
  // ④ 가장자리(카드 위 끝)에 놓으면 예전처럼 자리 바꾸기 — 넣지 않는다
  const before = await p.evaluate(() => topGroups(DB).map(g => g.id).join());
  hb = await rect('.gcard[data-gid="gC"] .gh'); const ta = await rect('.gcard[data-gid="gA"]');
  hint = await drag({ x: hb.x + 30, y: hb.y + hb.h / 2 }, { x: ta.x + ta.w / 2, y: ta.y + 6 });
  const after = await p.evaluate(() => topGroups(DB).map(g => g.id).join());
  ok('④ 위 가장자리 → 자리 바꾸기 (넣기 아님)', (await G('gC')).parent === '' && after !== before, [before, after, hint]);
  
  await b.close();
  return [pass, fail];
}
async function touch() {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, deviceScaleFactor: 2, hasTouch:true, isMobile:true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  const cdp = await ctx.newCDPSession(p);
  await p.goto(APP); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => {
    DB.G = []; DB.T = DB.T.filter(t => t.kind !== 'person');
    const mk = n => { const t = newTarget('person', n); DB.T.push(t); return { id: uid(), segs: [[t.id]], r: {}, text: '' }; };
    const A = newGroup('청년부', '#d9534f'), S1 = newGroup('1청', '#d9534f'), B = newGroup('찬양팀', '#3a7bd5'), C = newGroup('교사', '#2e9e6a');
    A.lines = [mk('가온'), mk('나래')]; S1.lines = [mk('다온'), mk('라희')]; B.lines = [mk('마루'), mk('바다'), mk('사랑')]; C.lines = [mk('아라'), mk('자람'), mk('차미'), mk('카이')];
    A.id = 'gA'; S1.id = 'gS'; S1.parent = 'gA'; B.id = 'gB'; C.id = 'gC';
    DB.G.push(A, S1, B, C); DB.set.mapDepth = 3; save(); document.querySelector('.tb[data-tab="map"]').click();
  });
  await sleep(700);
  const rect = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, sel);
  const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  const drag = async (from, to, shot) => {
    await T('touchStart', from.x, from.y); await sleep(650);
    const n = 20; for (let i = 1; i <= n; i++) { await T('touchMove', from.x + (to.x - from.x) * i / n, from.y + (to.y - from.y) * i / n); await sleep(30); }
    await sleep(450);
    const hint = await p.evaluate(() => { const h = document.querySelector('.md-hint.on'); return h ? h.textContent : ''; });
    if (shot) await p.screenshot({ path: shot });
    await T('touchEnd'); await sleep(800);
    return hint;
  };
  const G = id => p.evaluate(id => { const g = findG(DB, id); return g && { parent: g.parent, lines: g.lines.length }; }, id);
  let hb = await rect('.gcard[data-gid="gB"] .gh'), c = await rect('.gcard[data-gid="gC"]');
  let hint = await drag({ x: hb.x + 30, y: hb.y + hb.h / 2 }, { x: c.x + c.w / 2, y: c.y + c.h / 2 }, null);
  ok('터치 ① 안내', hint.includes('넣기'), hint);
  ok('터치 ① 찬양팀 → 교사의 서브 그룹', (await G('gB')).parent === 'gC', await G('gB'));
  await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.classList.remove('on'); }); await sleep(300);
  const hs = await rect('.sgb[data-gid="gS"] .sgh'), m = await rect('#v-map .masonry');
  hint = await drag({ x: hs.x + 30, y: hs.y + hs.h / 2 }, { x: m.x + m.w / 2, y: Math.min(780, m.y + m.h + 80) }, null);
  ok('터치 ③ 안내', hint.includes('올리기'), hint);
  ok('터치 ③ 1청 → 그룹', (await G('gS')).parent === '', await G('gS'));
  await b.close();
  return [pass, fail];
}
(async () => { const a = await mouse(), b = await touch(); console.log('통과 ' + (a[0] + b[0]) + ' / 실패 ' + (a[1] + b[1])); process.exit(a[1] + b[1] ? 1 : 0); })();
