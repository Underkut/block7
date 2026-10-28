// There 대시보드 HB 2026-10-29 아이폰 사진 넷. 이름은 지어낸 것. html.iosgap 을 달고 돈다.
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_dash1029.js
//  ① 주간 막대: 막대 칸이 <button> 이 아니다(아이폰은 단추 안 빈 막대를 폭 0 으로 그렸다) · 막대에 폭이 있다
//  ② 일간: 고정 영역은 날짜 줄까지 — 시간 막대 · 말씀/기도 막대는 밀려 올라가는 쪽
//  ③ 오늘 기도한 이름: 처음엔 기도한 그룹만 · 꺾쇠로 펼치고 접기 · 다시 열면 접힘
//  ④ 잇달아 한 한 장 기도는 한 줄(4번) · 그 줄 톡 = 어느 기도를 고칠지 고르기 · 기록 탭도 한 줄 · 밀어 지우면 넷 다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => {
    document.documentElement.classList.add('iosgap');
    const P = {}; ['스캇', '성희', '영상', '가람', '나래'].forEach(n => { const t = newTarget('person', n); DB.T.push(t); P[n] = t; });
    const G = (n, names, parent) => { const g = newGroup(n, '#888'); if (parent) g.parent = parent.id; g.lines = names.map((x, i) => ({ id: n + i, segs: [[P[x].id]], r: {}, text: '' })); DB.G.push(g); return g; };
    const lead = G('리더십', ['스캇', '성희']); G('간사', ['가람'], lead); G('FAM', ['나래']); G('영상팀', ['영상']);
    const D = TODAY, at = (h, m, s2) => { const d = parseYmd(D); d.setHours(h, m || 0, s2 || 0, 0); return d.getTime(); };
    [['A', at(4, 51), '영상', false], ['B', at(5, 37), '스캇', false], ['C', at(5, 37, 30), '스캇', false], ['E', at(5, 38), '스캇', true]].forEach(([sid, t, n, amen], i) => {
      addPraySession(DB, t, 20 + i, 'focus', sid); addFocusCard(DB, D, sid, P[n].id, t, t + 3000, 3, amen, ''); if (amen) toggleDone(DB, P[n].id, D); });
    addFocusCard(DB, D, 'E', P['성희'].id, at(5, 38, 5), at(5, 38, 6), 1, false, '');
    for (let k = 1; k <= 3; k++) addPraySession(DB, parseYmd(addDays(D, -k)).getTime() + 6 * 3600e3, 600 * k, 'focus', 'X' + k);
    save(); openThereDash('week', TODAY);
  });
  await sleep(700);
  const cols = await p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-col')].map(c => [c.tagName, Math.round((c.querySelector('i') || c).getBoundingClientRect().width)]));
  ok('⭐① 주간 막대 칸은 <div> · 막대에 폭이 있다', cols.length === 7 && cols.every(c => c[0] === 'DIV' && c[1] > 10), cols);
  await p.evaluate(() => document.querySelectorAll('#tdashOv .tdash-col')[0].click()); await sleep(900);
  ok('① 막대를 누르면 그날 D탭 (div 로 바꿔도 누름 그대로)', await p.evaluate(() => document.getElementById('tdashOv')._m.state.view === 'day'));
  await p.evaluate(() => { const st = document.getElementById('tdashOv')._m.state; st.at = TODAY; st.ats.day = TODAY; TDASH.redraw(); }); await sleep(200);
  const stick = await p.evaluate(() => { const s = document.querySelector('#tdashOv .tdash-stick'); return { tl: !!s.querySelector('.tdash-tl'), bar: !!s.querySelector('.tdash-bar'), h: Math.round(s.getBoundingClientRect().height) }; });
  ok('⭐② 고정 영역에 시간 막대 · 말씀/기도 막대가 없다 (밀려 올라감)', !stick.tl && !stick.bar, stick);
  const grs = () => p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-gr b')].map(x => x.textContent));
  ok('⭐③ 처음엔 기도한 그룹만 (리더십 — 간사 · FAM · 영상팀은 접힘)', JSON.stringify(await grs()) === '["리더십"]', await grs());
  ok('③ 꺾쇠에 접힌 수', (await p.evaluate(() => document.querySelector('#tdashOv .tdash-fold').textContent)) === '못 한 3');
  await p.click('#tdashOv .tdash-fold'); await sleep(200);
  ok('⭐③ 꺾쇠 → 모두 펼침', JSON.stringify(await grs()) === '["리더십","간사","FAM","영상팀"]', await grs());
  await p.click('#tdashOv .tdash-fold'); await sleep(200);
  ok('③ 다시 꺾쇠 → 접힘', JSON.stringify(await grs()) === '["리더십"]');
  const rows = await p.evaluate(() => [...document.querySelectorAll('#tdashOv .tdash-blk')].map(bk => bk.querySelector('.tdash-ses b').textContent + '|' + bk.querySelector('.tdash-ses small').textContent + '|' + [...bk.querySelectorAll('.tdash-kn')].map(k => k.textContent).join(',')));
  ok('⭐④ 잇달아 한 한 장 기도 넷이 한 줄 · 같은 이름은 한 칩', rows.length === 1 && /4번/.test(rows[0]) && (rows[0].match(/스캇/g) || []).length === 1, rows);
  await p.evaluate(() => document.querySelector('#tdashOv .tdash-blk .tdash-ses em').click()); await sleep(450);
  ok('⭐④ 합친 줄 톡 → 어느 기도를 고칠지 고르는 창(넷)', await p.evaluate(() => !!SHEET && SHEET.querySelectorAll('.opt').length === 4), await p.evaluate(() => SHEET && SHEET.textContent));
  await p.evaluate(() => closeSheet(true)); await p.evaluate(() => TDASH.close(true)); await sleep(300);
  await p.evaluate(() => { UI.histTab = 'days'; UI.calDay = TODAY; showTab('hist'); }); await sleep(400);
  ok('⭐④ 기록 탭도 한 줄 · 4번', await p.evaluate(() => document.querySelectorAll('#v-hist .row.pled').length === 1 && document.querySelector('#v-hist .row.pled .pl-k').textContent.includes('4번')));
  await p.evaluate(() => document.querySelector('#v-hist .row.pled .sw-act').click()); await sleep(400);
  ok('⭐④ 밀어 지우면 넷 다 · 되돌리기', await p.evaluate(() => DB.log[TODAY].ses.every(e => !e.d) && document.getElementById('toast').textContent.includes('4번')));
  await p.click('#toast button'); await sleep(300);
  ok('④ 되돌리기 → 넷 다 돌아옴', await p.evaluate(() => DB.log[TODAY].ses.filter(e => e.d > 0).length === 4));
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
