// 기도노트 지도 — PC 누르기를 휴대폰과 같게 · 단축키 안내 두 가지 (HB 2026-10-30, pray v. 26-1030-2 · 26-1030-3).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_kbhelp.js
// 이름은 지어낸 것. 지키는 것:
//  ① PC 클릭 = 상세 (그룹 → 그룹 상세 · 이름 → 사람 카드) · 누른 것이 골라진다
//  ② PC 더블클릭 = 이름 수정 (상세는 안 열린다)
//  ③ PC 우클릭 = 메뉴 (한 장씩 기도하기 · BLOCK7 할일로 보내기)
//  ④ 휴대폰은 예전 그대로 — 톡 = 상세 · 두 번 톡 = 이름 수정
//  ⑤ i 단추: 위 요약 띠에 키보드 줄 · 마우스 줄 / 모두 보기 창에 마우스 6칸 · 키보드 4묶음 · '고치기' '오른쪽 누르기' 없음
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html';
let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
const seed = p => p.evaluate(() => {
  DB.G = []; DB.T = DB.T.filter(t => t.kind !== 'person');
  const mk = (n, id) => { const t = newTarget('person', n); t.id = id; DB.T.push(t); return { id: 'L' + id, segs: [[t.id]], r: {}, text: '' }; };
  const A = newGroup('청년부', '#d9534f'), B = newGroup('찬양팀', '#3a7bd5');
  A.id = 'gA'; B.id = 'gB'; A.lines = [mk('가온', 'p1'), mk('나래', 'p2')]; B.lines = [mk('마루', 'p3')];
  DB.G.push(A, B); DB.set.mapDepth = 3; save(); document.querySelector('.tb[data-tab="map"]').click();
});
const top = p => p.evaluate(() => { const L = UI.layers[UI.layers.length - 1]; return L ? L.type + ':' + L.id : ''; });
const reset = p => p.evaluate(() => { closeAllLayers(); closeSheet(true); UI.mapEdit = null; UI.sel = ''; mapRender(); });
const mid = (p, sel) => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + Math.min(24, r.width / 2), y: r.top + r.height / 2 }; }, sel);
(async () => {
  const b = await chromium.launch();
  // ── PC ──
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1100, height: 900 } });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await p.waitForFunction(() => typeof DB === 'object');
  await seed(p); await sleep(600);
  ok('PC 로 잡힘 (KB · 터치 아님)', await p.evaluate(() => KB && !TOUCHDEV), await p.evaluate(() => [KB, TOUCHDEV]));

  let c = await mid(p, '#v-map [data-sel="g:gB"]');
  await p.mouse.click(c.x, c.y); await sleep(80);
  ok('① 클릭하는 순간 골라진다', await p.evaluate(() => UI.sel) === 'g:gB', await p.evaluate(() => UI.sel));
  await sleep(450);
  ok('⭐① 그룹 클릭 → 그룹 상세', await top(p) === 'group:gB', await top(p));
  await reset(p); await sleep(300);
  c = await mid(p, '#v-map .pn[data-id="p2"]');
  await p.mouse.click(c.x, c.y); await sleep(500);
  ok('⭐① 이름 클릭 → 사람 카드', await top(p) === 'target:p2', await top(p));
  await reset(p); await sleep(300);

  c = await mid(p, '#v-map [data-sel="g:gA"]');
  await p.mouse.dblclick(c.x, c.y); await sleep(600);
  ok('⭐② 그룹 더블클릭 → 이름 수정', await p.evaluate(() => UI.mapEdit && UI.mapEdit.key) === 'g:gA', await p.evaluate(() => UI.mapEdit));
  ok('② 더블클릭은 상세를 안 연다', await top(p) === '', await top(p));
  ok('② 고치는 칸에 글자 커서', await p.evaluate(() => document.activeElement && document.activeElement.dataset.mapin === 'g:gA'));
  await p.keyboard.press('Escape'); await reset(p); await sleep(300);
  c = await mid(p, '#v-map .pn[data-id="p3"]');
  await p.mouse.dblclick(c.x, c.y); await sleep(600);
  ok('⭐② 이름 더블클릭 → 그 항목 이름 수정', await p.evaluate(() => UI.mapEdit && UI.mapEdit.key) === 'l:gB:Lp3', await p.evaluate(() => UI.mapEdit));
  ok('② 사람 카드도 안 열린다', await top(p) === '', await top(p));
  await p.keyboard.press('Escape'); await reset(p); await sleep(300);

  c = await mid(p, '#v-map .pn[data-id="p1"]');
  await p.mouse.click(c.x, c.y, { button: 'right' }); await sleep(500);
  const menu = await p.evaluate(() => SHEET ? SHEET.textContent : '');
  ok('⭐③ 우클릭 → 메뉴 (한 장씩 기도하기 · BLOCK7 할일로)', menu.includes('한 장씩 기도하기') && menu.includes('BLOCK7 할일로'), menu);
  ok('③ 우클릭은 상세를 안 연다', await top(p) === '', await top(p));
  await reset(p); await sleep(300);

  // ⑤ i 단추: 0 → 1 (요약 띠) → 2 (모두 보기 창)
  await p.evaluate(() => setDevPref('kbHint', 0)); await p.evaluate(() => mapRender()); await sleep(200);
  await p.click('#v-map .kb-i'); await sleep(500);
  const bar = await p.evaluate(() => { const h = document.querySelector('#v-map .kbhint'); return h ? { t: h.textContent, rows: h.querySelectorAll('.kh-row').length, boxes: h.querySelectorAll('kbd,.kh-its .mico').length } : null; });
  ok('⭐⑤ 요약 띠: 키보드 줄 · 마우스 줄 · 글쇠 상자 · 그림 없이 미니멀', bar && bar.rows === 2 && bar.boxes === 0, bar);
  ok('⑤ 요약 띠 순서 Enter → Shift Enter → Tab · \'새로 만들기\'', bar && /Enter이름 수정.*(⇧|Shift\+)Enter상세.*Tab하나 더/.test(bar.t) && bar.t.includes('항목 새로 만들기'), bar && bar.t);
  ok('⑤ 요약 띠 낱말: 이름 수정 · 클릭 · 더블클릭 · 우클릭', bar && ['이름 수정', '클릭', '더블클릭', '우클릭', '메뉴'].every(w => bar.t.includes(w)) && !bar.t.includes('고치기'), bar && bar.t);
  await p.click('#v-map .kb-i'); await sleep(500);
  const full = await p.evaluate(() => { const s = SHEET && SHEET.querySelector('.kbx'); return s ? { t: SHEET.textContent, mice: s.querySelectorAll('.kbx-mc').length, groups: s.querySelectorAll('.kbx-g').length, x: !!SHEET.querySelector('.sh-x') } : null; });
  ok('⭐⑤ 모두 보기: 마우스 6칸 · 키보드 4묶음 · 우상단 ×', full && full.mice === 6 && full.groups === 4 && full.x, full && [full.mice, full.groups, full.x]);
  ok('⑤ \'고치기\' · \'오른쪽 누르기\' 없음 · 우클릭은 메뉴', full && !full.t.includes('고치기') && !full.t.includes('오른쪽 누르기') && full.t.includes('우클릭') && full.t.includes('한 장씩 기도하기'), full && full.t);
  ok('⑤ 아래 창 순서 Enter → Shift Enter → Tab', full && /이름 수정 · 한 번 더 누르면 마침.*상세 열기.*하나 더/.test(full.t), full && full.t);
  ok('⑤ 휴대폰 짝 (톡 · 두 번 톡)', full && full.t.includes('휴대폰 — 톡') && full.t.includes('휴대폰 — 두 번 톡'));
  const fit = await p.evaluate(() => { const s = SHEET.querySelector('.sheet'); return [...SHEET.querySelectorAll('.kbx-r,.kbx-mc')].every(e => e.scrollWidth <= e.clientWidth + 1) && s.scrollWidth <= s.clientWidth + 1; });
  ok('⑤ 넘치는 칸 없음', fit);
  await p.screenshot({ path: process.env.SHOT || '/tmp/pray_kbhelp.png' });
  await p.click('.sh-x'); await sleep(600);
  ok('⑤ × 로 닫으면 i 가 처음(0)으로', await p.evaluate(() => kbHintMode()) === 0);
  await ctx.close();

  // ── 휴대폰 ──
  const tc = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const t = await tc.newPage(); t.on('pageerror', e => console.log('ERR', e.message));
  await t.goto(APP); await t.waitForFunction(() => typeof DB === 'object');
  await seed(t); await sleep(600);
  c = await mid(t, '#v-map [data-sel="g:gB"]');
  await t.touchscreen.tap(c.x, c.y); await sleep(600);
  ok('⭐④ 휴대폰 톡 → 상세', await top(t) === 'group:gB', await top(t));
  await reset(t); await sleep(300);
  c = await mid(t, '#v-map [data-sel="g:gA"]');
  await t.touchscreen.tap(c.x, c.y); await sleep(120); await t.touchscreen.tap(c.x, c.y); await sleep(500);
  ok('⭐④ 휴대폰 두 번 톡 → 이름 수정', await t.evaluate(() => UI.mapEdit && UI.mapEdit.key) === 'g:gA' && await top(t) === '', await t.evaluate(() => [UI.mapEdit, UI.layers.length]));
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
  process.exit(fail ? 1 : 0);
})();
