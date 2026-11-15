// 심방 노트 1115-4 ③ — 자리 배치 (node tests/e2e/care_seat.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 자리 이름은 모두 지어낸 것.
//
// 지키는 것:
//  ① 출석 입력 '자리' 제목 옆 '배치' 단추 → 겹 화면 '자리 배치' — 놓은 것이 없으면 알약이 모두 '아직 안 놓은 자리 알약' 에
//  ② 알약을 누르면 빈 곳에 놓인다(2×1, 위 왼쪽부터) · 골라진다
//  ③ 끌면 칸에 맞춰 옮겨진다 · 다른 알약 위에 놓으면 제자리로(다른 알약도 그대로)
//  ④ 고른 알약의 오른쪽 아래 모서리를 당기면 크기가 바뀐다 · 겹치면 그대로
//  ⑤ 맨 아래 빈 줄 — 놓인 데까지 + 한 줄
//  ⑥ × = 바꾼 것이 있으면 묻고 버린다(저장 안 함) · '완료' = 이 기기 + 계정 문서의 seats 칸만(merge) · 성도 이름 없음
//  ⑦ 다시 열면 그 배치 그대로 · '빼기' 는 배치에서만(알약은 남음)
//  ⑧ 자리 알약 이름을 바꾸면 배치도 따라간다 · 지우면 빠진다
//  ⑨ 시트를 다 읽기 전에는 열리지 않는다
//  ⑩ 화살표 = 한 칸 · Shift + 화살표 = 크기
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const FILE = 'file://' + path.join(__dirname, '..', '..', 'care', 'index.html');
{ const src = fs.readFileSync(path.join(__dirname, 'care_write.js'), 'utf8'), a = src.indexOf('// ── 가짜 시트 ──'), b = src.indexOf('(async () => {');
  if (a < 0 || b < a) { console.log('✗ care_write.js 에서 가짜 시트 구간을 찾지 못했습니다'); process.exit(1); }
  vm.runInThisContext(src.slice(a, b)); }
let pass = 0, fail = 0;
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); } };

(async () => {
  const b = await chromium.launch();
  SHEET.tabs.push({ id: 1, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임'], ['자리', '맨 앞'], ['자리', '가운데'], ['자리', '뒤쪽'], ['자리', '2층']] });
  const page = await b.newPage({ viewport: { width: 420, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  let ask = true; const asked = []; page.on('dialog', d => { asked.push(d.message()); if (d.type() === 'prompt') d.accept('앞줄'); else ask ? d.accept() : d.dismiss(); });
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } });
    window.__cfg = []; DB = { doc: p => ({ set: async (o, m) => { window.__cfg.push([p, JSON.parse(JSON.stringify(o)), m || null]); }, get: async () => ({ exists: false }) }) }; });
  eq('⑨ 다 읽기 전에는 열리지 않는다', await page.evaluate(() => { DATA.state = 'loading'; openSeatMap(); const n = S.layers.length; DATA.state = 'idle'; return n; }), 0);
  await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  const LY = '#layers > .layer:last-child';
  const items = () => page.evaluate(() => topLayer().items.map(i => [i.n, i.x, i.y, i.w, i.h]));
  const box = n => page.evaluate(n => { const e = [...document.querySelectorAll('#layers > .layer:last-child .sblk')].find(x => x.dataset.n === n), r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, n);
  const cw = () => page.evaluate(() => document.querySelector('#layers > .layer:last-child .sgrid').clientWidth / 6);
  const drag = async (x, y, dx, dy) => { await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 3 }); await page.mouse.move(x + dx, y + dy, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(80); };

  await page.evaluate(() => openAttEdit(null, '')); await page.waitForSelector(LY + ' [data-act="seatmap"]');
  await page.click(LY + ' [data-act="seatmap"]'); await page.waitForSelector(LY + ' .sgrid');
  eq("① '배치' 단추 → 자리 배치 겹 화면 · 알약은 모두 아직 안 놓은 것", [await page.evaluate(() => S.layers.map(l => l.type)), await page.$eval(LY + ' .ph-head h3', e => e.textContent), await page.$$eval(LY + ' [data-act="seatadd"]', x => x.map(e => e.dataset.v)), await page.$$eval(LY + ' .sblk', x => x.length)],
    [['attedit', 'seatmap'], '자리 배치', ['맨 앞', '가운데', '뒤쪽', '2층'], 0]);
  await page.click(LY + ' [data-act="seatadd"][data-v="맨 앞"]'); await page.click(LY + ' [data-act="seatadd"][data-v="가운데"]'); await page.click(LY + ' [data-act="seatadd"][data-v="뒤쪽"]');
  eq('② 누르면 빈 곳에 2×1 로 · 마지막 것이 골라진다', [await items(), await page.evaluate(() => topLayer().sel), await page.$$eval(LY + ' [data-act="seatadd"]', x => x.map(e => e.dataset.v))], [[['맨 앞', 0, 0, 2, 1], ['가운데', 2, 0, 2, 1], ['뒤쪽', 4, 0, 2, 1]], '뒤쪽', ['2층']]);
  const W = await cw();
  let r = await box('뒤쪽'); await drag(r.x + 20, r.y + 20, -4 * W, 3 * 46);
  eq('③ 끌면 칸에 맞춰 옮겨진다', (await items())[2], ['뒤쪽', 0, 3, 2, 1]);
  r = await box('가운데'); await drag(r.x + 20, r.y + 20, -1 * W, 0);
  eq('③ 다른 알약 위에는 안 놓인다 — 모두 그대로 · 알림', [await items(), await page.evaluate(() => /겹칩니다/.test(document.body.textContent))], [[['맨 앞', 0, 0, 2, 1], ['가운데', 2, 0, 2, 1], ['뒤쪽', 0, 3, 2, 1]], true]);
  r = await box('가운데'); await drag(r.x + r.w - 8, r.y + r.h - 8, 2 * W, 46);
  eq('④ 모서리를 당기면 크기가 바뀐다', [(await items())[1], await page.$eval(LY + ' .sbar small', e => e.textContent)], [['가운데', 2, 0, 4, 2], '4 × 2']);
  r = await box('맨 앞'); await page.mouse.click(r.x + 20, r.y + 20); r = await box('맨 앞'); await drag(r.x + r.w - 8, r.y + r.h - 8, 1 * W, 0);
  eq('④ 당겨서 겹치면 그대로', (await items())[0], ['맨 앞', 0, 0, 2, 1]);
  eq('⑤ 줄 수 = 적어도 6줄 + 빈 줄 하나', await page.$eval(LY + ' .sgrid', e => e.style.height), 7 * 46 + 'px');
  await page.focus(LY + ' .sblk[data-n="뒤쪽"]'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Shift+ArrowRight'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp');
  eq('⑩ 화살표 = 한 칸 · Shift = 크기 · 겹치는 데서 멈춘다', (await items())[2], ['뒤쪽', 1, 2, 3, 1]);
  // × — 묻고, '아니요' 면 그대로 / '예' 면 버림
  ask = false; asked.length = 0; await page.click(LY + ' [data-act="close"]'); await page.waitForTimeout(350);
  eq('⑥ × — 바꾼 것이 있으면 묻는다 · 아니요면 남는다', [asked, await page.evaluate(() => topLayer().type)], [['바꾼 자리 배치를 저장하지 않고 닫을까요?'], 'seatmap']);
  ask = true; await page.click(LY + ' [data-act="close"]'); await page.waitForFunction(() => topLayer().type === 'attedit');
  eq('⑥ × — 버린다(저장 안 함)', [await page.evaluate(() => saved().seats || null), await page.evaluate(() => window.__cfg.filter(c => c[1].seats).length)], [null, 0]);
  // 다시 놓고 완료
  await page.click(LY + ' [data-act="seatmap"]'); await page.waitForSelector(LY + ' .sgrid');
  await page.click(LY + ' [data-act="seatadd"][data-v="맨 앞"]'); await page.click(LY + ' [data-act="seatadd"][data-v="가운데"]');
  r = await box('맨 앞'); await page.mouse.click(r.x + 20, r.y + 20); r = await box('맨 앞'); await drag(r.x + r.w - 8, r.y + r.h - 8, -1 * W, 0);
  const at0 = await page.evaluate(() => saved().at || null);
  await page.click(LY + ' [data-act="seatsave"]'); await page.waitForFunction(() => topLayer().type === 'attedit');
  const sv = await page.evaluate(() => [saved().seats.items, typeof saved().seats.at, window.__cfg.filter(c => c[1].seats).map(c => [c[0], Object.keys(c[1]).join(), c[1].seats.items, c[2]])]);
  eq('⑥ 완료 — 이 기기에 · 계정 문서에는 seats 칸만(merge)', [sv[0], sv[1], sv[2]], [[{ n: '맨 앞', x: 0, y: 0, w: 1, h: 1 }, { n: '가운데', x: 2, y: 0, w: 2, h: 1 }], 'number', [['users/u/data/care', 'seats', [{ n: '맨 앞', x: 0, y: 0, w: 1, h: 1 }, { n: '가운데', x: 2, y: 0, w: 2, h: 1 }], { merge: true }]]]);
  eq('⑥ 문서의 시각(at)은 안 건드린다 — 다른 칸이 딸려 이기지 않게', await page.evaluate(() => saved().at || null), at0);
  await page.click(LY + ' [data-act="seatmap"]'); await page.waitForSelector(LY + ' .sgrid');
  eq('⑦ 다시 열면 그대로 · 나머지는 안 놓은 알약', [await items(), await page.$$eval(LY + ' [data-act="seatadd"]', x => x.map(e => e.dataset.v)), await page.evaluate(() => !!topLayer().dirty)], [[['맨 앞', 0, 0, 1, 1], ['가운데', 2, 0, 2, 1]], ['뒤쪽', '2층'], false]);
  r = await box('가운데'); await page.mouse.click(r.x + 20, r.y + 20); await page.click(LY + ' [data-act="seatout"]');
  await page.click(LY + ' [data-act="seatsave"]'); await page.waitForFunction(() => topLayer().type === 'attedit');
  eq("⑦ '빼기' 는 배치에서만 — 알약은 남는다", [await page.evaluate(() => saved().seats.items.map(i => i.n)), await page.evaluate(() => ATTO().seat)], [['맨 앞'], ['맨 앞', '가운데', '뒤쪽', '2층']]);
  // 알약 이름 바꾸기 · 지우기 → 배치가 따라간다
  await page.evaluate(() => { const L = topLayer(); L.omenu = { k: 'seat', v: '맨 앞' }; render(); }); await page.click(LY + ' [data-act="aoptren"]');
  await page.waitForFunction(() => (saved().seats.items[0] || {}).n === '앞줄', null, { timeout: 5000 }).catch(() => {});
  eq('⑧ 자리 알약 이름을 바꾸면 배치도 따라간다', await page.evaluate(() => [saved().seats.items, ATTO().seat[0]]), [[{ n: '앞줄', x: 0, y: 0, w: 1, h: 1 }], '앞줄']);
  await page.evaluate(() => { const L = topLayer(); L.omenu = { k: 'seat', v: '앞줄' }; render(); }); await page.click(LY + ' [data-act="aoptdel"]');
  await page.waitForFunction(() => !saved().seats.items.length, null, { timeout: 5000 }).catch(() => {});
  eq('⑧ 지우면 배치에서도 빠진다', await page.evaluate(() => [saved().seats.items, ATTO().seat]), [[], ['가운데', '뒤쪽', '2층']]);
  eq('화면 오류 없음', page.errs, []);
  await b.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail); process.exit(fail ? 1 : 0);
})();
