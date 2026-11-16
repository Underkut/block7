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
  const cell = (g, d) => '.layer.in .wk-c[data-wk="' + g + '"][data-v="' + d + '"]';
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
  ok('② 끌어 지나간 칸(가로 → 세로) 모두 켜짐', days[0].includes(W.wd) && days[0].includes(d2) && days[1].includes(d2), days);
  ok('② 동그라미 켜짐', await p.evaluate(sel => document.querySelector(sel).classList.contains('on'), cell(W.a, d2)), null);
  ok('① 표를 다시 그리지 않음(다른 동그라미 깜빡임 없음)', await p.evaluate(sel => document.querySelector(sel) === window._keep, cell(W.a, 0)), null);
  const c1 = await cnt();
  ok('③ 숫자도 바로 바뀜', c1[W.wd] === c0[W.wd] + 1, [c0, c1]);
  ok('⑤ 디졸브 — 동그라미는 opacity 전환', await p.evaluate(() => getComputedStyle(document.querySelector('.wk-dot')).transitionProperty.includes('opacity')), null);
  await p.screenshot({ path: process.env.SHOT || '/tmp/pray_week.png' });
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail); await b.close(); process.exit(fail ? 1 : 0);
})();
