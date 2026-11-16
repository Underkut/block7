// 요일별 기도 (HB 2026-11-16). 이름은 지어낸 것.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_week.js
//  ① 지도 단추 줄 맨 앞에 요일 단추 · 처음엔 꺼짐
//  ② 길게 눌렀다 그 자리에서 떼면 요일별 기도 표 · 칸을 누르면 그 그룹의 기도 요일(g.days)이 켜짐
//  ③ 단추를 켜면 오늘 요일 그룹 + 요일 없는 그룹만 지도에 · 토스트 · DB.set.dayOn(계정)
//  ④ 한 장 기도 차례에도 오늘 그룹만
//  ⑤ 켠 채 그룹 순서를 옮겨도 숨은 그룹은 제자리
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  const W = await p.evaluate(() => {
    const wd = parseYmd(TODAY).getDay(), other = (wd + 3) % 7;
    const mk = (nm, col, days, who) => { const t = newTarget('person', who); DB.T.push(t); const g = newGroup(nm, col); g.days = days; g.lines = [{ id: 'L' + nm, segs: [[t.id]], r: {}, text: '' }]; DB.G.push(g); return g.id; };
    const a = mk('가족', '#e09a28', [], '가람'), c = mk('교회', '#8c78f0', [other], '다온'), d = mk('나라', '#3eaaf8', [], '라온');
    setDevPref('mapBtns', []); save(); showTab('map'); return { wd, other, a, c, d };
  });
  await sleep(500);
  const first = await p.evaluate(() => { const b = document.querySelector('#v-map .vh-acts [data-bk]'); return [b.dataset.bk, b.className]; });
  ok('① 요일 단추가 맨 앞 · 꺼짐(흐림)', first[0] === 'day' && /dim/.test(first[1]), first);
  await p.evaluate(() => document.querySelector('#v-map [data-bk="day"]').click());   // 켜짐
  await sleep(600);
  ok('③ 누르면 켜짐 · 계정 칸 DB.set.dayOn', await p.evaluate(() => DB.set.dayOn === true), null);
  const shown = await p.evaluate(() => [...document.querySelectorAll('#v-map .gcard')].map(x => x.dataset.gid));
  ok('③ 오늘 아닌 요일 그룹(교회)은 숨고 요일 없는 그룹은 보임', shown.includes(W.a) && shown.includes(W.d) && !shown.includes(W.c), shown);
  ok('③ 토스트', /오늘\(.\) 기도할 그룹만/.test(await p.evaluate(() => $('toast').textContent)), null);
  const deck = await p.evaluate(() => [...new Set(mapDeck().map(d => d.tg))]);
  ok('④ 한 장 기도 차례도 오늘 그룹만', deck.length === 2 && !deck.includes(W.c), deck);
  await p.evaluate(id => { mapMove('g:' + id, -1); }, W.d); await sleep(300);
  const ord = await p.evaluate(() => topGroups(DB).map(g => g.id));
  ok('⑤ 보이는 둘만 자리 바꿈 · 숨은 교회는 제자리(가운데)', ord.join() === [W.d, W.c, W.a].join(), ord);
  // ② 길게 누르고 있으면(떼지 않아도) 표
  await p.evaluate(() => { const b = document.querySelector('#v-map [data-bk="day"]'), r = b.getBoundingClientRect(); window._o = { pointerId: 7, pointerType: 'touch', clientX: r.x + 5, clientY: r.y + 5, bubbles: true, button: 0 }; b.dispatchEvent(new PointerEvent('pointerdown', window._o)); });
  await sleep(1100);
  const lay = await p.evaluate(() => { const t = document.querySelector('.layer.in .lh-title'); return t && t.textContent; });
  ok('② 떼지 않고 길게 누르고 있으면 요일별 기도 표', lay === '요일별 기도', lay);
  await p.evaluate(() => document.dispatchEvent(new PointerEvent('pointerup', window._o)));
  const cnt = () => p.evaluate(() => [...document.querySelectorAll('.layer.in [data-wkn]')].map(x => +x.textContent));
  const c0 = await cnt();
  ok('③ 요일 아래 그룹 수 (매일 그룹 포함)', c0[W.wd] === 2 && c0[W.other] === 3, c0);
  const cell = (g, d) => '.layer.in .wk-c[data-wk="' + (g.indexOf('|') >= 0 ? g : 't|' + g) + '"][data-v="' + d + '"]';
  await p.evaluate(sel => { window._keep = document.querySelector(sel); }, cell(W.a, 0));
  // 끌어 칠하기: 교회 wd 칸에서 시작 → 가로로 옆 칸 → 세로로 아래(가족) 칸
  const pt = sel => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel);
  const d2 = (W.wd + 1) % 7;
  const P1 = await pt(cell(W.c, W.wd)), P2 = await pt(cell(W.c, d2)), P3 = await pt(cell(W.a, d2));
  await p.evaluate(([P1, P2, P3]) => {
    const f = (t, P) => { const el = document.elementFromPoint(P[0], P[1]); (t === 'pointerdown' ? el : document).dispatchEvent(new PointerEvent(t, { pointerId: 9, pointerType: 'touch', clientX: P[0], clientY: P[1], bubbles: true, button: 0 })); };
    f('pointerdown', P1); f('pointermove', P2); f('pointermove', P3); f('pointerup', P3);
  }, [P1, P2, P3]);
  await sleep(300);
  const days = await p.evaluate(W => [findG(DB, W.c).days.slice(), findG(DB, W.a).days.slice()], W);
  ok('② 끌어 지나간 칸(가로 → 세로) — 교회는 켜지고, 옅게 매일이던 가족은 진한 일곱 날로(처음 칸이 꺼짐 → 켜기)', days[0].includes(W.wd) && days[0].includes(d2) && days[1].length === 7, days);
  ok('② 동그라미 — 칠한 칸 켜짐 · 가족은 진하게', await p.evaluate(([a, b, c]) => document.querySelector(a).classList.contains('on') && document.querySelector(b).classList.contains('on') && !document.querySelector(c).classList.contains('pale'), [cell(W.c, d2), cell(W.a, d2), cell(W.a, (d2 + 1) % 7)]), null);
  ok('① 표를 다시 그리지 않음(다른 동그라미 깜빡임 없음)', await p.evaluate(sel => document.querySelector(sel) === window._keep, cell(W.a, 0)), null);
  const c1 = await cnt();
  ok('③ 숫자도 바로 바뀜', c1[W.wd] === c0[W.wd] + 1 && c1[d2] === c0[d2] + 1, [c0, c1]);
  ok('⑤ 디졸브 — 동그라미는 opacity 전환', await p.evaluate(() => getComputedStyle(document.querySelector('.wk-dot')).transitionProperty.includes('opacity')), null);
  ok('A 매일 그룹(나라)은 일곱 칸 옅은 동그라미', await p.evaluate(sel => [...Array(7)].every((_, d) => { const c = document.querySelector(sel + '"][data-v="' + d + '"]'); return c.classList.contains('on') && c.classList.contains('pale'); }), '.layer.in .wk-c[data-wk="t|' + W.d), null);
  // W3 — 펼치기 · 하위 줄 요일 · 반달 · 지도에서 숨김
  await p.evaluate(() => { popLayer(); }); await sleep(400);
  const S = await p.evaluate(W => {
    const t = newTarget('person', '바다'), t2 = newTarget('person', '사랑'); DB.T.push(t, t2);
    const k = newGroup('청년', '#55aa77'); k.parent = W.d; k.lines = [{ id: 'LS1', segs: [[t.id]], r: {}, text: '' }, { id: 'LS2', segs: [[t2.id]], r: {}, text: '' }]; DB.G.push(k);
    save(); pushLayer({ type: 'week' }); return { k: k.id, p1: t.id, p2: t2.id };
  }, W); await sleep(500);
  ok('W3 처음엔 접힘', await p.evaluate(W => document.querySelector('.layer.in .wk-sub[data-sub="' + W.d + '"]').hidden, W), null);
  await p.evaluate(W => document.querySelector('.layer.in [data-a="wk-fold"][data-id="' + W.d + '"]').click(), W); await sleep(700);
  ok('W3 그룹 이름 누르면 펼침 · 서브 그룹 · 줄 보임 · 위를 따라 옅게', await p.evaluate(([W, S]) => { const b = document.querySelector('.layer.in .wk-sub[data-sub="' + W.d + '"]'); const c = b.querySelector('.wk-c[data-wk="l|' + S.k + '|LS2|' + W.d + '"][data-v="0"]'); return !b.hidden && !!b.querySelector('.wk-c[data-wk="s|' + S.k + '|' + W.d + '"]') && c.classList.contains('on') && c.classList.contains('pale'); }, [W, S]), null);
  const dX = (W.wd + 2) % 7, lsel = '.layer.in .wk-c[data-wk="l|' + S.k + '|LS2|' + W.d + '"][data-v="' + dX + '"]';
  await p.evaluate(sel => { const c = document.querySelector(sel), r = c.getBoundingClientRect(), o = { pointerId: 11, pointerType: 'touch', clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, bubbles: true, button: 0 }; c.dispatchEvent(new PointerEvent('pointerdown', o)); document.dispatchEvent(new PointerEvent('pointerup', o)); }, lsel); await sleep(400);
  const st = await p.evaluate(([W, S, sel]) => ({ ln: (findG(DB, S.k).lines.find(l => l.id === 'LS2').days || []).slice(), lnCls: document.querySelector(sel).className,
    sub: document.querySelector('.layer.in .wk-c[data-wk="s|' + S.k + '|' + W.d + '"][data-v="' + W.wd + '"]').className,
    top: document.querySelector('.layer.in .wk-c[data-wk="t|' + W.d + '"][data-v="' + W.wd + '"]').className }), [W, S, lsel]);
  ok('1 옅은(위를 따르던) 줄의 칸을 누르면 누른 날만 켜지고 나머지는 꺼짐', st.ln.length === 1 && st.ln[0] === dX && /\bon\b/.test(st.lnCls) && !/pale/.test(st.lnCls), st);
  ok('W3 위(서브 · 그룹) 칸은 반달 ◐', /half/.test(st.sub) && /half/.test(st.top), st);
  const info = await p.evaluate(([W, S]) => { const q = s => document.querySelector('.layer.in ' + s); const w = s => q(s).getBoundingClientRect().width;
    return { n: q('[data-wkc="t|' + W.d + '"]').textContent, ns: q('[data-wkc="s|' + S.k + '|' + W.d + '"]').textContent,
      wTop: w('.wk-tr .wk-g'), wSub: w('.wk-sr .wk-g') + 14, wLn: w('.wk-lr .wk-g') + 24,
      xTop: q('.wk-tr .wk-c').getBoundingClientRect().x, xSub: q('.wk-sr .wk-c').getBoundingClientRect().x, xLn: q('.wk-lr .wk-c').getBoundingClientRect().x,
      col: getComputedStyle(q('.wk-lr .wk-pn')).color }; }, [W, S]);
  ok('2 이름 칸 숫자 = 기도 요일 수(그룹 7 · 서브 그룹 7 — 반달인 날도 셈)', info.n === '7' && info.ns === '7', info);
  ok('4 펼친 줄도 칸이 같은 세로선에 (이름 칸 폭이 같음)', Math.abs(info.xTop - info.xSub) < 1 && Math.abs(info.xTop - info.xLn) < 1 && Math.abs(info.wTop - info.wSub) < 1.5, info);
  ok('3 기도 항목 이름이 pn 색을 따름(표시색 변수)', await p.evaluate(() => !!document.querySelector('.layer.in .wk-pn')), info.col);
  await p.evaluate(() => { popLayer(); }); await sleep(400);
  const vis = await p.evaluate(S => ({ deck: mapDeck().map(d => d.id), shown: [...document.querySelectorAll('#v-map .pn')].map(b => b.dataset.id) }), S);
  ok('W3 지도 · 한 장 기도에서 오늘 아닌 줄(사랑)은 숨고 같은 서브 그룹의 다른 줄(바다)은 보임', vis.shown.includes(S.p1) && !vis.shown.includes(S.p2) && vis.deck.includes(S.p1) && !vis.deck.includes(S.p2), vis);
  await p.evaluate(() => { pushLayer({ type: 'week' }); }); await sleep(500);
  await p.screenshot({ path: process.env.SHOT || '/tmp/pray_week.png' });
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail); await b.close(); process.exit(fail ? 1 : 0);
})();
