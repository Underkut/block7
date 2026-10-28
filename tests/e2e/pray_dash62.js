// There D탭 6-2 a · b (HB 1028-3) — 흐름(기도 한 번 아래 이름) · 말씀 / 기도 막대 · 기도노트 아래 네 칸. 이름은 지어낸 것.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_dash62.js
// 아이패드 · 아이폰 홈 화면 앱처럼 html.iosgap 을 달고 돈다 (Sonnet 창 전달 — #app 바탕이 대시보드를 덮던 일)
//  ① 흐름: 한 장 기도 아래 카드 · 지도 There 아래 Map 기도 — 따로 나오던 'Map 기도' · '한 장 기도' 칸은 없다 · 이름 옆 기도 제목 · 아멘 점
//  ② 맨 위 막대 = 말씀 / 기도 두 갈래 (다른 앱 기록이 오면 말씀이 생긴다)
//  ③ 아래 네 칸 차례 · 지난 날엔 그룹 칸만
//  ④ 그룹 줄 톡 = 그 그룹부터 한 장 기도 (오늘 아멘한 이름 건너뜀)
//  ⑤ 다가오는 날의 이름 톡 = 상세가 대시보드 위에 (닫지 않음 · td-under) → 닫으면 같은 D탭 그대로
//  ⑥ BLOCK7 · Sweeter 처럼 부르면(edit · extra 없음) 흐름만 — 고칠 수 없고 아래 칸 없음
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ORIGIN = process.env.APP_ORIGIN || 'http://127.0.0.1:5502';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(ORIGIN + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => {
    document.documentElement.classList.add('iosgap');
    const P = {}; const mk = (n, tps) => { const t = newTarget('person', n); t.topics = (tps || []).map(x => newTopic(x)); DB.T.push(t); P[n] = t; };
    mk('가람', ['취업 면접 (' + (() => { const d = parseYmd(addDays(TODAY, 3)); return (d.getMonth() + 1) + '/' + d.getDate(); })() + ')', '어머니 건강']); mk('나래', ['수능 평안']); mk('다온'); mk('라온'); mk('마루'); mk('바다'); mk('하늘', ['비자']);
    P['하늘'].last = addDays(TODAY, -19);
    const G = (n, names, parent) => { const g = newGroup(n, '#888'); if (parent) g.parent = parent.id; g.lines = names.map((x, i) => ({ id: n + i, segs: [[P[x].id]], r: {}, text: '' })); DB.G.push(g); return g; };
    const fam = G('가족', ['가람', '나래']), yo = G('청년부', ['다온', '라온', '마루', '바다']); G('선교', ['하늘']);
    const D = TODAY, at = (h, m) => { const d = parseYmd(D); d.setHours(h, m || 0, 0, 0); return d.getTime(); };
    addPraySession(DB, at(5, 40), 840, 'focus', 'S1');
    const fc = (n, a, s, amen, k) => { addFocusCard(DB, D, 'S1', P[n].id, at(5, 40) + a * 1000, at(5, 40) + (a + s) * 1000, s, amen, k); if (amen) toggleDone(DB, P[n].id, D); };
    fc('가람', 0, 180, true, '가족'); fc('나래', 180, 130, true, '가족'); fc('라온', 330, 240, true, '청년부');
    addPraySession(DB, at(12, 30), 360, 'map'); addMapPrayer(DB, D, [P['마루'].id, P['바다'].id], at(12, 31), at(12, 34), '청년부');
    window.__P = P; save(); openThereDash('day', TODAY);
  });
  await sleep(800);
  const txt = sel => p.evaluate(sel => [...document.querySelectorAll(sel)].map(e => e.textContent.replace(/\s+/g, ' ').trim()), sel);
  const h4 = await txt('#tdashOv .tdash-sec h4');
  ok('⭐① 따로 나오던 Map 기도 · 한 장 기도 칸이 없다 · 흐름이 있다', !h4.some(x => /^(Map 기도|한 장 기도)/.test(x)) && h4[0].startsWith('흐름'), h4);
  const blocks = await p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-blk')].map(bk => ({ top: bk.querySelector('.tdash-ses b').textContent, kids: [...bk.querySelectorAll('.tdash-kid')].map(k => k.querySelector('.tdash-kn').textContent + '|' + !!k.querySelector('.tdash-am')) })));
  ok('⭐① 한 장 기도 아래 카드 셋(아멘 점) · 지도 There 아래 청년부', blocks[0].top === '한 장씩 기도하기' && blocks[0].kids.length === 3 && blocks[0].kids.every(k => k.endsWith('|true')) && blocks[1].kids[0].startsWith('청년부'), blocks);
  ok('① 이름 옆 기도 제목', blocks[0].kids[0].includes('취업 면접') && blocks[0].kids[0].includes('어머니 건강'), blocks[0].kids[0]);
  ok('① 이름 줄도 톡 = 고치기 · 밀기 = 지우기 그대로 (data-ed)', (await p.evaluate(() => document.querySelectorAll('#tdashOv .tdash-kid[data-ed="fc"]').length)) === 3);
  const leg = async () => txt('#tdashOv .tdash-leg span');
  ok('② 막대 = 기도만 (다른 앱 기록이 없을 때)', JSON.stringify(await leg()) === '["기도"]', await leg());
  await p.evaluate(() => { const st = document.getElementById('tdashOv')._m.state; st.data.thereLog = { [TODAY]: [{ ref: '시편 23:1', time: '07:55', t: 1, d: 840, app: 'block7', src: 'gnb' }] }; TDASH.redraw(); });
  await sleep(200);
  ok('⭐② 다른 앱 기록이 오면 말씀 / 기도 두 갈래', JSON.stringify(await leg()) === '["말씀","기도"]', await leg());
  ok('② 흐름에 말씀이 시간 순서로 끼어든다', (await p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-blk .tdash-ses span')].map(x => x.textContent))).join() === '05:40,07:55,12:30');
  ok('⭐③ 아래 칸 차례', JSON.stringify(h4.slice(1).map(x => x.split(' ·')[0])) === JSON.stringify(['오늘 기도한 이름', '다가오는 날', '오래 못 한 기도']), h4);
  ok('③ 그룹 줄 숫자', JSON.stringify(await txt('#tdashOv .tdash-gr em')) === JSON.stringify(['2 / 2 · 모두 기도했습니다', '3 / 4 · 다온', '0 / 1 · 하늘']), await txt('#tdashOv .tdash-gr em'));
  // ⑤ 다가오는 날 이름 톡 → 상세가 위에 · 대시보드 그대로
  await p.evaluate(() => { const ov = document.getElementById('tdashOv'); ov.scrollTop = 400; });
  await p.evaluate(() => { const r = [...document.querySelectorAll('#tdashOv .tdash-li[data-td="item"]')].find(x => x.textContent.includes('가람')); r.click(); });
  await sleep(500);
  const s5 = await p.evaluate(() => ({ open: TDASH.isOpen(), under: document.body.classList.contains('td-under'), layer: UI.layers.length, appBg: getComputedStyle(document.getElementById('app')).backgroundColor }));
  ok('⭐⑤ 이름 톡 → 상세가 대시보드 위에 (대시보드 안 닫힘 · #app 투명)', s5.open && s5.under && s5.layer === 1 && /rgba\(0, 0, 0, 0\)|transparent/.test(s5.appBg), s5);
  await p.evaluate(() => popLayer()); await sleep(600);
  const s5b = await p.evaluate(() => ({ open: TDASH.isOpen(), under: document.body.classList.contains('td-under'), view: document.getElementById('tdashOv')._m.state.view, top: document.getElementById('tdashOv').scrollTop }));
  ok('⭐⑤ 닫으면 같은 D탭 · 읽던 자리', s5b.open && !s5b.under && s5b.view === 'day' && s5b.top > 300, s5b);
  // ③ 지난 날
  await p.evaluate(() => { const st = document.getElementById('tdashOv')._m.state; st.at = addDays(TODAY, -1); st.ats.day = st.at; TDASH.redraw(); }); await sleep(200);
  ok('③ 지난 날엔 그룹 칸만 (이날 기도한 이름)', JSON.stringify((await txt('#tdashOv .tdash-sec h4')).map(x => x.split(' ·')[0])) === JSON.stringify(['이날 기도한 이름']), await txt('#tdashOv .tdash-sec h4'));
  await p.evaluate(() => { const st = document.getElementById('tdashOv')._m.state; st.at = TODAY; st.ats.day = TODAY; TDASH.redraw(); }); await sleep(200);
  const prayLog = await p.evaluate(() => JSON.parse(JSON.stringify(DB.log)));   // ⑥ 에 쓸 기록 — ④ 가 한 장 기도를 열고 닫으며 카드를 하나 더 남기기 전
  // ④ 그룹 줄 → 한 장 기도
  await p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-gr')].find(x => x.textContent.startsWith('청년부')).click()); await sleep(500);
  const s4 = await p.evaluate(() => ({ dash: TDASH.isOpen(), on: F.on, at: F.on ? findAny(DB, F.deck[F.i].id).name : '' }));
  ok('⭐④ 그룹 줄 톡 → 그 그룹부터 한 장 기도, 아멘한 라온 건너뛰고 다온', !s4.dash && s4.on && s4.at === '다온', s4);
  await p.evaluate(() => closeFocus());
  // ⑥ BLOCK7 · Sweeter 처럼
  const q = await ctx.newPage(); q.on('pageerror', e => console.log('ERR', e.message));
  await q.goto(ORIGIN + '/tests/e2e/'); await q.setContent('<!doctype html><meta charset="utf-8"><body></body>');
  await q.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '..', '..', 'tools', 'there-dash.js'), 'utf8') + '\nwindow.TDASH = TDASH;' });
  await q.evaluate(pl => { const t = Object.keys(pl)[0]; TDASH.open({ today: t, view: 'day', at: t, local: { prayLog: pl, thereLog: {} } }); }, prayLog);
  await sleep(500);
  const s6 = await q.evaluate(() => ({ kids: document.querySelectorAll('.tdash-kid').length, ed: document.querySelectorAll('[data-ed]').length, gr: document.querySelectorAll('.tdash-gr').length }));
  ok('⭐⑥ BLOCK7 · Sweeter 쪽 — 흐름의 이름은 보이고(4) · 고칠 수 없고 · 아래 칸 없음', s6.kids === 4 && s6.ed === 0 && s6.gr === 0, s6);
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
