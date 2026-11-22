// 심방 노트 1122-S — 출석 입력 '자리' = 작은 지도 + 앉았던 자리 (node tests/e2e/care_seatpick.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름 · 자리는 모두 지어낸 것.
//
// 지키는 것:
//  ① 배치가 놓여 있으면 — 작은 지도(배치 칸 수만큼 점) + 오른쪽 앉았던 자리. 접힌 동안 자리 알약 줄은 없다
//  ② 이름이 없으면 안내 · 이름을 넣으면 그분이 앉았던 자리(많이 앉은 순 · 횟수) · 자주 앉은 자리가 미리 골라진다(지도 점 · 제목 옆 이름)
//  ③ 칩을 누르면 고른 자리가 바뀐다(지도 점 · 제목 옆 이름이 따라감) · 다시 누르면 풀린다
//  ④ 지도를 누르면 줄인 배치도가 펴진다(배치 칸 · 안 놓은 알약 · 더하기) · 칸을 누르면 골라지고 접힌다
//  ⑤ 여럿이면 함께 적은 분들이 앉았던 자리
//  ⑥ 펼친 칸 오른쪽 단추(손가락은 길게 누르기) = 알약 메뉴
//  ⑦ 저장하면 고른 자리가 시트에 그대로
//  ⑧ 배치가 없으면 예전 알약 줄 그대로
//  ⑨ 움직임 줄이기를 켜면 펴기 · 접기가 바로(기다림 없이) · 어느 쪽이든 페이지 오류 없음
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const FILE = 'file://' + path.join(__dirname, '..', '..', 'care', 'index.html');
{ const src = fs.readFileSync(path.join(__dirname, 'care_write.js'), 'utf8'), a = src.indexOf('// ── 가짜 시트 ──'), b = src.indexOf('(async () => {');
  if (a < 0 || b < a) { console.log('✗ care_write.js 에서 가짜 시트 구간을 찾지 못했습니다'); process.exit(1); }
  vm.runInThisContext(src.slice(a, b)); }
let pass = 0, fail = 0;
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const H = ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '섬김', '메모', '적은 시각', '구분'];
const row = (id, n, seat, d) => H.map(k => ({ '출석ID': id, '성도': n, '날짜': d, '예배 · 모임': '지어낸 모임', '자리': seat })[k] || '');
SHEET.tabs.push({ id: 71, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임'], ['자리', '맨 앞'], ['자리', '가운데'], ['자리', '뒤쪽'], ['자리', '2층']] });
SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [H, row('A1', '가온', '가운데', '2026-11-15'), row('A2', '가온', '맨 앞', '2026-11-08'), row('A3', '가온', '맨앞', '2026-11-01'), row('A4', '가온', '뒤쪽', '2026-10-25'),
  row('A5', '나래', '2층', '2026-11-15')] });
const SEATS = { items: [{ n: '맨 앞', x: 0, y: 0, w: 6, h: 1 }, { n: '가운데', x: 1, y: 2, w: 2, h: 1 }, { n: '뒤쪽', x: 4, y: 2, w: 2, h: 2 }], at: 5 };

async function open(b, reduce, seats) {
  const page = await b.newPage({ viewport: { width: 390, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  if (reduce) await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(seats => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true;
    save(Object.assign({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }, seats ? { seats } : {}));
    DB = { doc: p => ({ set: async () => {}, get: async () => ({ exists: false }) }) }; }, seats || null);
  await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  await page.evaluate(() => openAttEdit(null, '')); await page.waitForSelector('#layers > .layer:last-child [data-f="name"]');
  return page;
}
const LY = '#layers > .layer:last-child';
const st = page => page.evaluate(() => { const f = document.querySelector('#layers > .layer:last-child .seatf'); if (!f) return null;
  return { seat: topLayer().form.seat, lab: f.querySelector('.sfv').textContent, on: [...f.querySelectorAll('.sfd')].map(d => d.classList.contains('on') ? 1 : 0).join(''),
    chips: [...f.querySelectorAll('.sfc')].map(c => c.textContent + (c.getAttribute('aria-pressed') === 'true' ? '*' : '')), big: !!f.querySelector('.sfbig'), head: (f.querySelector('.sfh') || {}).textContent || '' }; });
const typeName = async (page, n) => { await page.evaluate(n => { const L = topLayer(); attNameAdd(L, [n]); render(); }, n); await sleep(400); };

(async () => {
  const b = await chromium.launch();
  for (const reduce of [true, false]) {
    const tag = reduce ? ' (움직임 줄이기)' : '';
    const page = await open(b, reduce, SEATS);
    const wait = reduce ? 0 : 650;
    const s0 = await st(page);
    eq('① 작은 지도 — 배치 칸 셋 · 접힌 동안 자리 알약 줄 없음' + tag, [s0 && s0.on.length, await page.$$eval(LY + ' .pills[data-k="seat"]', x => x.length), s0 && s0.big], [3, 0, false]);
    eq('② 이름 없을 때 안내' + tag, await page.$eval(LY + ' .sfe', e => e.textContent), '이름을 넣으면앉았던 자리가 나옵니다');
    await typeName(page, '가온');
    eq('② 그분이 앉았던 자리 — 많이 앉은 순 · 횟수 · 자주 앉은 자리가 미리 골라짐' + tag, await st(page), { seat: '맨 앞', lab: '맨 앞', on: '100', chips: ['맨 앞2번*', '가운데1번', '뒤쪽1번'], big: false, head: '이 분이 앉았던 자리' });
    await page.click(LY + ' .sfc[data-v="가운데"]'); await sleep(wait / 2);
    const s3 = await st(page);
    eq('③ 칩을 누르면 — 지도 점 · 제목 옆 이름이 따라감' + tag, [s3.seat, s3.lab, s3.on, s3.chips], ['가운데', '가운데', '010', ['맨 앞2번', '가운데1번*', '뒤쪽1번']]);
    await page.click(LY + ' .sfc[data-v="가운데"]'); await sleep(wait / 2);
    const s3b = await st(page);
    eq('③ 다시 누르면 풀린다' + tag, [s3b.seat, s3b.lab, s3b.on], ['', '', '000']);
    await page.click(LY + ' .sfmap'); await sleep(wait);
    eq('④ 지도를 누르면 줄인 배치도 — 배치 칸 · 안 놓은 알약 · 더하기 · 직접 적기' + tag, [await page.$eval(LY + ' .sfmap', e => e.getAttribute('aria-expanded')), await page.$$eval(LY + ' .sbc', x => x.map(e => e.dataset.v)),
      await page.$$eval(LY + ' .sfbig .pills .opt', x => x.map(e => e.textContent.trim())), await page.$eval(LY + ' .sfbig', e => Math.round(e.getBoundingClientRect().height) > 60)], ['true', ['맨 앞', '가운데', '뒤쪽'], ['2층', '', '직접 적기'], true]);
    eq('④ 칸 크기 = 배치 그대로' + tag, await page.$$eval(LY + ' .sbc', x => x.map(e => e.style.gridColumn.replace(/\s+/g, '') + ' ' + e.style.gridRow.replace(/\s+/g, ''))), ['1/span6 1/span1', '2/span2 3/span1', '5/span2 3/span2']);
    await page.click(LY + ' .sbc[data-v="뒤쪽"]'); await sleep(wait + 200);
    const s4 = await st(page);
    eq('④ 칸을 누르면 골라지고 접힌다' + tag, [s4.seat, s4.lab, s4.on, s4.big, await page.evaluate(() => !!topLayer().seatBig)], ['뒤쪽', '뒤쪽', '001', false, false]);
    await page.click(LY + ' .sfmap'); await sleep(wait);
    await page.click(LY + ' .sbc[data-v="가운데"]', { button: 'right' }); await sleep(100);
    eq('⑥ 펼친 칸 오른쪽 단추 = 알약 메뉴 · 판은 펼친 채' + tag, [await page.evaluate(() => JSON.stringify(topLayer().omenu)), await page.evaluate(() => !!topLayer().seatBig)], [JSON.stringify({ k: 'seat', v: '가운데' }), true]);
    await page.evaluate(() => { topLayer().omenu = null; render(); });
    await page.click(LY + ' .sfbig .pills .opt[data-v="2층"]'); await sleep(wait + 200);
    eq('④ 안 놓은 알약도 고르면 접힌다(지도엔 점 없음)' + tag, await st(page).then(s => [s.seat, s.lab, s.on, s.big]), ['2층', '2층', '000', false]);
    await typeName(page, '나래');
    eq('⑤ 여럿이면 함께 적은 분들이 앉았던 자리' + tag, await st(page).then(s => [s.head, s.chips]), ['함께 적은 분들이 앉았던 자리', ['맨 앞2번', '2층1번*', '가운데1번']]);
    if (!reduce) {
      await page.fill(LY + ' [data-f="name"]', '가온'); await page.evaluate(() => { topLayer().form.name = '가온'; render(); }); await sleep(300);
      await page.click(LY + ' .sfc[data-v="맨 앞"]'); await sleep(300);
      await page.click(LY + ' [data-act="attsave"]'); await page.waitForFunction(() => !S.layers.length, null, { timeout: 15000 });
      const t = SHEET.tabs.find(x => x.title === '출석'), last = t.rows[t.rows.length - 1];
      eq('⑦ 저장 — 고른 자리가 시트에 그대로', [last[H.indexOf('성도')], last[H.indexOf('자리')]], ['가온', '맨 앞']);
    }
    eq('⑨ 페이지 오류 없음' + tag, page.errs, []);
    await page.close();
  }
  const p2 = await open(b, true, null);
  eq('⑧ 배치가 없으면 예전 알약 줄', [await p2.$$eval(LY + ' .seatf', x => x.length), await p2.$$eval(LY + ' .pills[data-k="seat"] .opt[data-act="aone"]', x => x.map(e => e.dataset.v))], [0, ['맨 앞', '가운데', '뒤쪽', '2층']]);
  await b.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
