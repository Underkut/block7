// There 대시보드 '색으로 보기' (HB 2026-10-29 · 1029 묶음 3) · D W M 선택 네모 미끄러짐(4). 이름은 지어낸 것.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_hue1029.js
//  ① D W M 왼쪽 빨강 · 초록 · 파랑 점 단추 — 처음엔 꺼짐(옅음) · 누르면 선명
//  ② 켜면 그룹 = 할당 색 알약(흐름 · 오늘 기도한 이름) · 항목 = 표시색 글자 · 회색/색 없음은 그대로
//  ③ 값은 이 기기에(pray.hue) — 닫았다 열어도 그대로 · 끄면 색이 다 빠진다
//  ④ 부른 쪽이 paint 를 안 주고 load 로 prayPaint 를 주면(BLOCK7 · Sweeter 모양) 그때 단추가 생기고 같은 색
//  ⑤ 선택 네모(.tdash-pill)는 하나 — 탭을 바꾸면 눌린 탭 자리로 옮겨 간다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => {
    localStorage.removeItem('pray.hue');
    const P = {}; [['가나', 'red'], ['다라', 'blue'], ['마바', 'gray'], ['사아', '']].forEach(([n, m]) => { const t = newTarget('person', n); t.mark = m; DB.T.push(t); P[n] = t; });
    const G = (n, c, names, parent) => { const g = newGroup(n, c); if (parent) g.parent = parent.id; g.lines = names.map((x, i) => ({ id: n + i, segs: [[P[x].id]], r: {}, text: '' })); DB.G.push(g); return g; };
    const fam = G('가족', '#1f4f8f', ['가나', '다라']); G('친척', '#b0173f', ['마바'], fam); const yt = G('연탄', '#9a7712', ['사아']);
    const D = TODAY, at = (h, m) => { const d = parseYmd(D); d.setHours(h, m || 0, 0, 0); return d.getTime(); };
    addPraySession(DB, at(6), 300, 'focus', 'S1');
    addFocusCard(DB, D, 'S1', P['가나'].id, at(6), at(6, 1), 60, true, '');
    addFocusCard(DB, D, 'S1', P['마바'].id, at(6, 1), at(6, 2), 60, false, '');
    addFocusCard(DB, D, 'S1', P['사아'].id, at(6, 2), at(6, 3), 60, false, '');
    toggleDone(DB, P['가나'].id, D); toggleDone(DB, P['마바'].id, D);
    addPraySession(DB, at(9), 600, 'map', 'M1');
    addMapPrayer(DB, D, [yt.id], at(9, 1), at(9, 3), '연탄');
    save(); openThereDash('day', TODAY);
  });
  await sleep(700);
  const st = () => p.evaluate(() => {
    const ov = document.getElementById('tdashOv'), bt = ov.querySelector('.tdash-hueb');
    const cs = el => getComputedStyle(el);
    return {
      btn: !!bt, on: bt && bt.classList.contains('on'), op: bt && +cs(bt.querySelector('i')).opacity,
      before: bt && !!(bt.nextElementSibling && bt.nextElementSibling.classList.contains('tdash-seg')),
      gp: [...ov.querySelectorAll('.tdash-gp')].map(x => x.textContent + '|' + cs(x).backgroundColor),
      ic: [...ov.querySelectorAll('.tdash-ic')].map(x => x.textContent + '|' + cs(x).color),
      grHue: [...ov.querySelectorAll('.tdash-gr.hue b')].map(x => x.textContent),
      store: localStorage.getItem('pray.hue')
    };
  });
  let s = await st();
  ok('⭐① 단추가 D W M 바로 왼쪽 · 처음엔 꺼짐(옅음)', s.btn && s.before && !s.on && s.op < .5, s);
  ok('① 꺼져 있으면 색이 하나도 없다', !s.gp.length && !s.ic.length && !s.grHue.length, s);
  await p.screenshot({ path: process.env.SHOT_DIR ? process.env.SHOT_DIR + '/hue-off.png' : '/dev/null' }).catch(() => {});
  await p.click('#tdashOv .tdash-hueb'); await sleep(450);
  s = await st();
  ok('⭐① 누르면 선명', s.on && s.op > .95, s);
  ok('⭐② 흐름: Map 기도 그룹(연탄)은 알약', s.gp.some(x => /^연탄\|/.test(x)), s.gp);
  ok('⭐② 오늘 기도한 이름: 그룹 · 서브 그룹 알약 + 점 색', ['가족', '친척'].every(n => s.gp.some(x => x.startsWith(n + '|'))) && s.grHue.join() === '가족,친척', s);
  ok('⭐② 항목 = 표시색 글자 (빨강 = 어두운 판 값 #ff6b6b)', s.ic.some(x => x === '가나|rgb(255, 107, 107)'), s.ic);
  ok('② 회색 · 색 없는 이름은 그대로', !s.ic.some(x => /^(마바|사아)\|/.test(x)), s.ic);
  ok('③ 이 기기에 남는다', s.store === '1');
  await p.screenshot({ path: process.env.SHOT_DIR ? process.env.SHOT_DIR + '/hue-on.png' : '/dev/null' }).catch(() => {});
  await p.evaluate(() => { TDASH.close(true); openThereDash('day', TODAY); }); await sleep(500);
  s = await st();
  ok('⭐③ 닫았다 열어도 켜진 채', s.on && s.gp.length > 0, s);
  await p.click('#tdashOv .tdash-hueb'); await sleep(400);
  s = await st();
  ok('③ 끄면 색이 다 빠진다', !s.on && !s.gp.length && !s.ic.length && s.store === '0', s);
  // ④ BLOCK7 · Sweeter 모양 — paint 없이 load 로 prayPaint
  await p.evaluate(() => { TDASH.close(true); localStorage.removeItem('x.v1');
    TDASH.open({ today: TODAY, view: 'day', store: 'x', local: { prayLog: DB.log }, load: () => new Promise(r => setTimeout(() => r({ prayPaint: TDASH.hueIndex(DB) }), 150)) }); });
  ok('④ 받기 전에는 단추가 없다', !(await st()).btn);
  await sleep(400); await p.click('#tdashOv .tdash-hueb'); await sleep(400);
  s = await st();
  ok('⭐④ 받은 뒤 단추 · 같은 색 (그룹 알약 · 항목 글자)', s.on && s.gp.some(x => /^연탄\|/.test(x)) && s.ic.some(x => x === '가나|rgb(255, 107, 107)'), s);
  ok('④ BLOCK7 쪽 값은 제 칸(x.v1)에 — 기도노트 값(pray.hue)과 따로', await p.evaluate(() => JSON.parse(localStorage.getItem('x.v1')).hue === true && localStorage.getItem('pray.hue') === '0'));
  // ⑤ 선택 네모
  const pill = () => p.evaluate(() => { const ov = document.getElementById('tdashOv'), pl = ov.querySelectorAll('.tdash-pill'), on = ov.querySelector('.tdash-seg button.on');
    return { n: pl.length, dx: Math.round(pl[0].getBoundingClientRect().left - on.getBoundingClientRect().left), w: Math.round(pl[0].getBoundingClientRect().width - on.getBoundingClientRect().width), v: on.textContent }; });
  ok('⑤ 네모 하나 · D 자리', JSON.stringify(await pill()) === JSON.stringify({ n: 1, dx: 0, w: 0, v: 'D' }), await pill());
  await p.click('#tdashOv .tdash-seg [data-v="month"]'); await p.waitForFunction(() => document.querySelector('#tdashOv .tdash-seg button.on').textContent === 'M'); await sleep(60);
  const mid = await pill();
  await sleep(700);
  ok('⭐⑤ M 을 누르면 미끄러져 가는 중(중간에는 아직 M 자리가 아니다) → 끝나면 M 자리', mid.dx < -5 && JSON.stringify(await pill()) === JSON.stringify({ n: 1, dx: 0, w: 0, v: 'M' }), [mid, await pill()]);
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
