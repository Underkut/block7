// 심방 노트 1115-4 ④ — 자리 보기 (node tests/e2e/care_seatsee.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름 · 자리는 모두 지어낸 것.
//
// 지키는 것:
//  ① 출석 목록의 예배 · 모임 이름은 단추 → 겹 화면 '자리 보기'(제목 = 모임 이름 · 아래 날짜와 인원)
//  ② 놓아 둔 배치 그대로(칸 위치 · 크기) 그 위에 자리별 이름 — 다른 모임 · 다른 날 사람은 안 섞인다
//  ③ 배치에 없는 자리는 아래 따로 · 자리를 안 적은 분은 '자리 기록 없음'
//  ④ 이름은 이름 단위로만 줄이 바뀐다(이름 하나가 두 줄로 안 갈린다) · 이름이 많은 블록은 높이가 늘어나고 서로 안 겹친다
//  ⑤ 이름을 누르면 정보 팝업 · ESC 는 팝업만 닫는다(겹 화면은 남는다)
//  ⑥ 좌상단 연필 → 자리 배치 편집기 · '완료' 하면 바뀐 배치로 다시 그린다
//  ⑦ 배치가 없을 때 — 안내 + 자리별 묶음
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
  SHEET.tabs.push({ id: 71, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임'], ['예배 · 모임', '다른 모임'], ['자리', '맨 앞'], ['자리', '가운데'], ['자리', '뒤쪽'], ['자리', '2층']] });
  const H = ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '섬김', '메모', '적은 시각', '구분'];
  const D = '2026-11-08', row = (id, n, svc, seat, d) => H.map(k => ({ '출석ID': id, '성도': n, '날짜': d || D, '예배 · 모임': svc, '자리': seat })[k] || '');
  const many = ['하나', '두리', '세찬', '네온', '다섯', '여섯', '일곱', '여덟'].map((n, i) => row('M' + i, '지어낸' + n, '지어낸 모임', '가운데'));
  SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [H, row('S1', '가온', '지어낸 모임', '맨 앞'), row('S2', '나래', '지어낸 모임', '맨앞'), row('S3', '다람', '지어낸 모임', ''), row('S4', '라온', '지어낸 모임', '로비'),
    row('S5', '마루', '다른 모임', '맨 앞'), row('S6', '바다', '지어낸 모임', '맨 앞', '2026-11-01'), row('S7', '사랑', '지어낸 모임', '2층')].concat(many) });
  const page = await b.newPage({ viewport: { width: 390, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true;
    save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' }, seats: { items: [{ n: '맨 앞', x: 0, y: 0, w: 6, h: 1 }, { n: '가운데', x: 1, y: 2, w: 2, h: 1 }, { n: '뒤쪽', x: 4, y: 2, w: 2, h: 2 }], at: 5 } });
    DB = { doc: p => ({ set: async () => {}, get: async () => ({ exists: false }) }) }; });
  await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  await page.evaluate(() => { S.view = 'attend'; render(); });
  const LY = '#layers > .layer:last-child', SEL = 'button.asv-n[data-v="' + D + '|지어낸 모임"]';
  eq('① 예배 · 모임 이름은 단추', await page.$$eval('button.asv-n', x => x.map(e => e.dataset.v)), [D + '|지어낸 모임', D + '|다른 모임', '2026-11-01|지어낸 모임']);
  await page.click(SEL); await page.waitForSelector(LY + ' .svgrid');
  eq('① 겹 화면 — 제목 · 날짜와 인원', [await page.evaluate(() => S.layers.map(l => l.type)), await page.$eval(LY + ' .ph-head h3', e => e.textContent), await page.$eval(LY + ' .svsub', e => e.textContent)], [['seatsee'], '지어낸 모임', '11/8 주일 · 13명']);
  const blocks = () => page.$$eval(LY + ' .svb', x => x.map(e => [e.dataset.n, e.style.gridColumn.replace(/\s+/g, ''), e.style.gridRow.replace(/\s+/g, ''), [...e.querySelectorAll('.an')].map(a => a.textContent)]));
  const bl = await blocks();
  eq('② 배치 그대로 그 위에 이름 — 다른 모임 · 다른 날은 안 섞인다', [bl[0], bl[1].slice(0, 3).concat(bl[1][3].length), bl[2]], [['맨 앞', '1/span6', '1/span1', ['가온', '나래']], ['가운데', '2/span2', '3/span1', 8], ['뒤쪽', '5/span2', '3/span2', []]]);
  eq("② 맨 위 '앞 · 강단' · 빈 자리는 옅게", [await page.$eval(LY + ' .sfront', e => e.textContent), await page.$$eval(LY + ' .svb.has', x => x.map(e => e.dataset.n))], ['앞 · 강단', ['맨 앞', '가운데']]);
  eq("③ 배치에 없는 자리는 아래 따로 · 자리 기록 없음", await page.$$eval(LY + ' .svx', x => x.map(e => [e.querySelector('.sn').textContent, [...e.querySelectorAll('.an')].map(a => a.textContent)])), [['로비 · 배치에 없는 자리', ['라온']], ['2층 · 배치에 없는 자리', ['사랑']], ['자리 기록 없음', ['다람']]]);
  const geo = await page.evaluate(() => { const L = document.querySelector('#layers > .layer:last-child'), R = e => e.getBoundingClientRect();
    const names = [...L.querySelectorAll('.svb .an')].map(a => a.getClientRects().length), bs = [...L.querySelectorAll('.svb')].map(R); let over = 0;
    bs.forEach((a, i) => bs.forEach((c, j) => { if (i < j && a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) over++; }));
    const mid = L.querySelector('.svb[data-n="가운데"]'), g = R(L.querySelector('.svgrid'));
    return { oneLine: names.every(n => n === 1), over, tall: R(mid).height > 46 * 2, inside: [...mid.querySelectorAll('.an')].every(a => R(a).bottom <= R(mid).bottom + 1), wide: L.scrollWidth <= L.clientWidth, w: Math.round(R(mid).width / g.width * 6) }; });
  eq('④ 이름 단위로만 줄바꿈 · 많은 블록은 늘어남 · 겹침 없음 · 가로로 안 넘침', geo, { oneLine: true, over: 0, tall: true, inside: true, wide: true, w: 2 });
  await page.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  await page.click(LY + ' .svb .an'); await page.waitForSelector(LY + ' .apop');
  eq('⑤ 이름을 누르면 정보 팝업(하나만)', [await page.$$eval('.apop', x => x.length), await page.$eval(LY + ' .apop-h b', e => e.textContent), await page.$eval(LY + ' .apop-s', e => e.textContent)], [1, '가온', '11/8 주일 · 지어낸 모임']);
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  eq('⑤ ESC 는 팝업만 닫는다', [await page.$$eval('.apop', x => x.length), await page.evaluate(() => S.layers.map(l => l.type))], [0, ['seatsee']]);
  await page.click(LY + ' .ph-head [data-act="seatmap"]'); await page.waitForSelector(LY + ' .sgrid');
  eq('⑥ 연필 → 자리 배치 편집기', await page.evaluate(() => S.layers.map(l => l.type)), ['seatsee', 'seatmap']);
  await page.click(LY + ' [data-act="seatadd"][data-v="2층"]'); await page.click(LY + ' [data-act="seatsave"]'); await page.waitForFunction(() => topLayer().type === 'seatsee');
  await page.waitForTimeout(350);
  eq("⑥ '완료' 하면 바뀐 배치로 — 2층이 판 위로", [(await blocks()).map(x => [x[0], x[3].length]), await page.$$eval(LY + ' .svx .sn', x => x.map(e => e.textContent))], [[['맨 앞', 2], ['가운데', 8], ['뒤쪽', 0], ['2층', 1]], ['로비 · 배치에 없는 자리', '자리 기록 없음']]);
  await page.click(LY + ' [data-act="close"]'); await page.waitForFunction(() => !S.layers.length);
  eq('⑥ × 로 닫으면 출석 목록', await page.$$eval('.apop', x => x.length), 0);
  await page.evaluate(() => { save({ seats: { items: [], at: 9 } }); render(); });
  await page.click(SEL); await page.waitForSelector(LY + ' .svx');
  eq('⑦ 배치가 없으면 안내 + 자리별 묶음', [await page.$$eval(LY + ' .svgrid', x => x.length), /연필/.test(await page.$eval(LY + ' .smap .hint', e => e.textContent)), await page.$$eval(LY + ' .svx .sn', x => x.map(e => e.textContent))], [0, true, ['맨 앞', '로비', '2층', '가운데', '자리 기록 없음']]);
  eq('화면 오류 없음', page.errs, []);
  await b.close();
  console.log('\n결과: 통과', pass, '/ 실패', fail); process.exit(fail ? 1 : 0);
})();
