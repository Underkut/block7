// 심방 노트 1115-5 PR2 — 함께 온 분 여럿 · 출석 목록 빈 곳 누르면 그 날짜 · 모임으로 입력 (node tests/e2e/care_att2.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름은 모두 지어낸 것.
//  ③ 함께 온 분: 알약을 여러 개 누를 수 있다(다시 누르면 뺌) · 직접 적은 이름과 알약이 함께 · '혼자' 와는 배타 · 저장은 함께 칸에 ', ' 로
//     예전 한 명 기록은 그대로 열리고 알약이 켜져 있다
//  ⑥ 출석 목록 모임 줄의 빈 곳을 누르면 출석 입력이 그 날짜 · 그 모임이 골라진 채 열린다(이름 · 모임 이름 단추는 제 일을 그대로)
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
  const H = ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '섬김', '메모', '적은 시각', '구분'];
  const D = '2026-11-08';
  const row = (id, n, svc, w, d) => H.map(k => ({ '출석ID': id, '성도': n, '날짜': d || D, '예배 · 모임': svc, '함께': w || '' })[k] || '');
  SHEET.tabs.push({ id: 71, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임'], ['예배 · 모임', '다른 모임']] });
  SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [H, row('T1', '가온', '지어낸 모임', '아내'), row('T2', '나래', '지어낸 모임', '아내'), row('T3', '다온', '다른 모임', '철수, 영희'), row('T4', '라온', '지어낸 모임', '철수', '2026-11-01')] });
  const page = await b.newPage({ viewport: { width: 390, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true;
    save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } });
    DB = { doc: p => ({ set: async () => {}, get: async () => ({ exists: false }) }) }; });
  await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  const LY = '#layers > .layer:last-child';
  const W = () => page.evaluate(() => topLayer().form.with);
  const pressed = () => page.$$eval(LY + ' [data-act="aone"][data-k="with"]', x => x.filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.v));

  // ③ 함께 온 분 여럿
  await page.evaluate(() => { S.view = 'attend'; render(); openAttEdit(null, ''); }); await page.waitForTimeout(300);
  const pills = await page.$$eval(LY + ' [data-act="aone"][data-k="with"]', x => x.map(e => e.dataset.v));
  eq('③ 알약은 이름 하나씩(여럿 칸도 쪼개 셈)', pills.slice().sort(), ['매일', '아내', '영희', '철수'].filter(n => pills.includes(n)).sort());
  eq('③ 아내 · 철수 · 영희가 후보에 있다', ['아내', '철수', '영희'].every(n => pills.includes(n)), true);
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="아내"]');
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="철수"]');
  eq('③ 둘을 고르면 함께 칸에 쉼표로', [await W(), (await pressed()).sort()], ['아내, 철수', ['아내', '철수']]);
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="아내"]');
  eq('③ 다시 누르면 뺀다', [await W(), await pressed()], ['철수', ['철수']]);
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="영희"]');
  await page.click(LY + ' input[data-act="attsolo"]');
  eq("③ '혼자' 를 켜면 이름은 비워진다", [await W(), await pressed()], ['혼자', []]);
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="아내"]');
  eq("③ 혼자였다가 이름을 누르면 그 이름만 · 혼자는 꺼짐", [await W(), await page.$eval(LY + ' input[data-act="attsolo"]', e => e.checked)], ['아내', false]);
  await page.click(LY + ' .pills[data-k="with"] [data-act="aetc"]');
  await page.fill(LY + ' input.etc[data-f="with"]', '새손님, 다른손님');
  eq('③ 직접 적은 이름과 알약이 함께', [await W(), await pressed()], ['아내, 새손님, 다른손님', ['아내']]);
  await page.fill(LY + ' input.etc[data-f="with"]', '새손님');
  eq('③ 직접 적은 쪽만 바뀌고 알약은 그대로', await W(), '아내, 새손님');
  await page.click(LY + ' [data-act="aone"][data-k="with"][data-v="철수"]');
  eq('③ 적는 중에 알약을 눌러도 적은 이름이 남는다', await W(), '아내, 새손님, 철수');
  // 저장
  await page.evaluate(() => { const L = topLayer(); L.form.name = '시험분'; L.form.svc = '지어낸 모임'; });
  await page.click(LY + ' [data-act="attsave"]'); await page.waitForFunction(() => !document.querySelector('#layers > .layer'), null, { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(600);
  const t = SHEET.tabs.find(x => x.title === '출석'), wi = t.rows[0].indexOf('함께'), saved = t.rows.find(r => r[2] === '시험분');
  eq('③ 시트 함께 칸에 쉼표로 적힘', saved && saved[wi], '아내, 새손님, 철수');
  // 예전 한 명 · 여럿 기록 열기
  await page.evaluate(() => openAttEdit(AT().find(a => a.name === '가온').id)); await page.waitForTimeout(300);
  eq('③ 예전 한 명 기록 — 알약이 켜져 있다', [await W(), await pressed()], ['아내', ['아내']]);
  await page.evaluate(() => { S.layers = []; render(); openAttEdit(AT().find(a => a.name === '다온').id); }); await page.waitForTimeout(300);
  eq('③ 여럿 기록 — 알약이 모두 켜져 있다', [await W(), (await pressed()).sort()], ['철수, 영희', ['영희', '철수']]);
  eq('③ 결과 글 — 여럿', await page.evaluate(() => attWithText(AT().find(a => a.name === '다온').with)), '철수, 영희 함께');
  await page.evaluate(() => { S.layers = []; render(); });

  // ⑥ 모임 줄 빈 곳
  await page.evaluate(() => { S.view = 'attend'; S.layers = []; render(); }); await page.waitForTimeout(300);
  const box = await page.$eval('.asv[data-s="지어낸 모임"][data-d="' + D + '"] .asv-p', e => { const r = e.getBoundingClientRect(); return { x: r.right - 6, y: r.bottom - 6 }; });
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(300);
  eq('⑥ 빈 곳 → 출석 입력', await page.evaluate(() => topLayer() && topLayer().type), 'attedit');
  eq('⑥ 그 날짜 · 그 모임이 골라져 시작', await page.evaluate(() => [topLayer().form.date, topLayer().form.svc, !topLayer().id]), [D, '지어낸 모임', true]);
  eq('⑥ 알약에도 눌린 표시(모임 · 날짜 칸)', await page.evaluate(() => { const q = s => [...document.querySelectorAll('#layers > .layer:last-child ' + s)].filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.v || e.textContent); return [q('[data-act="aone"][data-k="svc"]'), 1, document.querySelector('#layers > .layer:last-child .dsel').textContent.includes('11/8') || document.querySelector('#layers > .layer:last-child .dsel').textContent.includes('11월 8')]; }), [['지어낸 모임'], 1, true]);
  await page.evaluate(() => { S.layers = []; render(); });
  await page.click('.asv[data-s="다른 모임"] .an'); await page.waitForTimeout(250);
  eq('⑥ 이름은 그대로 정보 팝업(입력 창 안 열림)', await page.evaluate(() => [!!S.attPop, topLayer() && topLayer().type]), [true, null]);
  await page.evaluate(() => { S.attPop = null; render(); });
  await page.click('.asv[data-s="다른 모임"] .asv-n'); await page.waitForTimeout(250);
  eq('⑥ 모임 이름은 그대로 자리 보기', await page.evaluate(() => topLayer() && topLayer().type), 'seatsee');
  await page.evaluate(() => { S.layers = []; render(); });
  const box2 = await page.$eval('.asv[data-s="다른 모임"] .asv-p', e => { const r = e.getBoundingClientRect(); return { x: r.right - 6, y: r.top + r.height / 2 }; });
  await page.mouse.click(box2.x, box2.y); await page.waitForTimeout(300);
  eq('⑥ 다른 모임 줄 → 그 모임', await page.evaluate(() => topLayer().form.svc), '다른 모임');
  await page.evaluate(() => { S.layers = []; render(); });
  const box3 = await page.$eval('.asv[data-d="2026-11-01"] .asv-p', e => { const r = e.getBoundingClientRect(); return { x: r.right - 6, y: r.top + r.height / 2 }; });
  await page.mouse.click(box3.x, box3.y); await page.waitForTimeout(300);
  eq('⑥ 다른 날 줄 → 그 날짜(오늘이 아님)', await page.evaluate(() => topLayer() && topLayer().form.date), '2026-11-01');

  eq('오류 없음', page.errs, []);
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
