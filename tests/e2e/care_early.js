// 심방 노트 1115-X — 시트를 다 읽기 전에 입력 창을 연다 (node tests/e2e/care_early.js)
// 가짜 구글 시트는 care_write.js 의 것을 그대로 빌려 쓰고(같은 가짜를 두 벌 두지 않게), 여기서는 '느리게 · 실패하게' 만 한다. 이름 · 내용은 모두 지어낸 것.
//
// 지키는 것:
//  ① 읽는 중(큰 묶음 · 가벼운 묶음 둘 다 아직)에도 '심방 입력' 을 누르면 입력 창이 바로 선다 — 알림 줄 · 알약 자리 표시 · 화면 오류 없음
//  ② 그 상태에서 알약 목록 고치기는 막힌다 — 시트에 아무것도 안 쓴다 (덜 읽은 목록으로 탭을 덮어쓰지 않게)
//  ③ 가벼운 묶음이 먼저 오면 알약이 채워지고, 쓰던 이름 · 이야기는 그대로
//  ④ 다 읽기 전에 '완료' → 기다린다(아직 안 씀) → 다 읽으면 이어서 시트에 한 줄 · 창 닫힘
//  ⑤ 처음 읽기 = 요청 셋(탭 목록 · 가벼운 묶음 · 큰 묶음) — 가벼운 묶음은 응답 탭은 머리줄만, 선택지 탭은 통째로
//  ⑥ 출석 입력 — 읽기가 실패해도 창과 쓰던 글이 남는다 · '다시 읽기' → 저장
//  ⑦ 로그인이 필요해지면 — 창은 그대로, '화면 보기' 로 로그인 화면 · '쓰던 입력 창으로' 로 돌아오면 글 그대로
//  ⑧ 다 읽은 뒤 여는 입력 창은 예전 그대로(알림 줄 없음)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const FILE = 'file://' + path.join(__dirname, '..', '..', 'care', 'index.html');
{ // care_write.js 의 가짜 시트 구간만 떼어 온다
  const src = fs.readFileSync(path.join(__dirname, 'care_write.js'), 'utf8'), a = src.indexOf('// ── 가짜 시트 ──'), b = src.indexOf('(async () => {');
  if (a < 0 || b < a) { console.log('✗ care_write.js 에서 가짜 시트 구간을 찾지 못했습니다'); process.exit(1); }
  vm.runInThisContext(src.slice(a, b));
}
let pass = 0, fail = 0;
const eq = (name, got, want) => { const a = JSON.stringify(got), b = JSON.stringify(want); if (a === b) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); } };

// 느리게 · 실패하게 — 큰 묶음(big) · 가벼운 묶음(lite)을 붙잡아 둔다
const GATE = { big: null, lite: null, failBig: false, urls: [] };
const hold = k => { let open; const p = new Promise(r => (open = r)); GATE[k] = { p, open: () => { GATE[k] = null; open(); } }; };
async function slow(r) {
  const u = r.request().url();
  if (u.includes('sheets.googleapis.com') && u.includes('values:batchGet')) {
    const lite = decodeURIComponent(u).includes("!1:1"), k = lite ? 'lite' : 'big';
    GATE.urls.push(lite ? 'lite' : 'big');
    if (lite) GATE.liteUrl = decodeURIComponent(u);
    if (GATE[k]) await GATE[k].p;
    if (!lite && GATE.failBig) { GATE.failBig = false; return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":{"message":"잠깐 끊김"}}' }); }
  }
  return route(r);
}
async function open(b) {
  const page = await b.newPage({ viewport: { width: 420, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message)); page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : slow(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  return page;
}
const start = page => page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true; save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } }); googleStatus(); });
const appended = t => LOG.filter(x => x[0] === 'append' && x[1] === t).length;

(async () => {
  const b = await chromium.launch();
  SHEET.tabs.push({ id: 1, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 새벽모임'], ['예배 · 모임', '지어낸 저녁모임']] });

  // ── 심방 입력: 느린 시트 ──
  {
    hold('big'); hold('lite');
    const page = await open(b); REQ.sheets = 0; GATE.urls = [];
    await start(page); await page.waitForSelector('.sk-go');
    await page.click('.sk-go[data-v="visit"]'); await page.waitForTimeout(200);
    eq('① 읽는 중에도 심방 입력 창이 바로 선다 — 알림 줄 · 알약 자리 표시', await page.evaluate(() => [document.querySelectorAll('#layers .layer').length, !!document.querySelector('.layer .early'), document.querySelectorAll('.layer .pills.wait').length > 0, DATA.state, !!document.querySelector('.sk-c')]), [1, true, true, 'loading', true]);
    await page.fill('.layer [data-f="nameq"]', '지어낸이'); await page.keyboard.press('Enter');
    await page.click('.layer [data-act="tkw"][data-v="s"]'); await page.fill('.layer [data-f="tk:in"]', '읽기 전에 적은 이야기'); await page.click('.layer [data-act="tkadd"]');
    eq('① 화면 오류 없음', page.errs, []);
    const wrote0 = LOG.length;
    eq('② 읽는 중에는 알약 목록을 못 고친다 — 시트에 안 쓴다', await page.evaluate(async () => { const r = [attOptChange(o => attOptAdd(o, 'svc', '덮어쓸뻔'), ''), visOptChange(o => attOptAdd(o, 'place', '덮어쓸뻔'), '')]; let thrown = false; try { await saveOptTab('출석 선택지', [['칸', '값']]); } catch (e) { thrown = true; } return r.concat([thrown]); }).then(r => r.concat([LOG.length - wrote0])), [false, false, true, 0]);
    GATE.lite.open(); await page.waitForFunction(() => DATA.lite === true); await page.waitForTimeout(150);
    eq('③ 가벼운 묶음이 먼저 오면 알약이 채워지고 쓰던 글은 그대로', await page.evaluate(() => { const L = topLayer(); return [DATA.state, document.querySelectorAll('.layer [data-act="ftog"][data-k="roles"]').length, document.querySelectorAll('.layer [data-act="aone"][data-k="method"]').length, L.form.name, document.querySelector('.layer').textContent.includes('읽기 전에 적은 이야기'), !!document.querySelector('.layer .early')]; }), ['loading', 7, 5, '지어낸이', true, true]);
    await page.click('.layer [data-act="crow"][data-k="roles"]'); await page.waitForTimeout(350);
    await page.click('.layer [data-act="ftog"][data-k="roles"][data-v="청년부"]');
    await page.click('.layer [data-act="saverec"]'); await page.waitForTimeout(700);
    eq('④ 다 읽기 전의 완료 — 기다린다 (아직 안 쓰고, 창도 그대로)', [appended('Form Responses 1'), await page.evaluate(() => S.layers.length)], [0, 1]);
    GATE.big.open(); await page.waitForFunction(() => DATA.state === 'ok' && !S.layers.length, null, { timeout: 15000 }); await page.waitForTimeout(300);
    const row = (tab('Form Responses 1').rows.find(r => r.includes('지어낸이')) || []).join('|');
    eq('④ 다 읽으면 이어서 시트에 한 줄 — 이름 · 구분 · 이야기', [appended('Form Responses 1'), row.includes('지어낸이'), row.includes('청년부'), row.includes('읽기 전에 적은 이야기')], [1, true, true, true]);
    eq('⑤ 처음 읽기 = 탭 목록 + 가벼운 묶음 + 큰 묶음', [GATE.urls.slice(0, 2).sort(), /'Form Responses 1'!1:1/.test(GATE.liteUrl), /'출석 선택지'!A1:ZZ/.test(GATE.liteUrl)], [['big', 'lite'], true, true]);
    eq('⑧ 다 읽은 뒤 여는 입력 창은 예전 그대로', await page.evaluate(() => { openEdit(); const r = [!!document.querySelector('.layer .early'), document.querySelectorAll('.layer .pills.wait').length, !!topLayer().early]; S.layers = []; render(); return r; }), [false, 0, false]);
    eq('화면 오류 없음 (심방)', page.errs, []);
    await page.close();
  }

  // ── 출석 입력: 읽기 실패 → 다시 읽기 ──
  {
    hold('big'); GATE.failBig = true;
    const page = await open(b);
    await start(page); await page.waitForSelector('.sk-go');
    await page.click('.sk-go[data-v="attend"]');
    await page.waitForFunction(() => DATA.lite === true); await page.waitForTimeout(150);
    eq('⑥ 출석 입력 창 — 가벼운 묶음으로 내 알약이 뜬다', await page.evaluate(() => [...document.querySelectorAll('.layer [data-act="aone"][data-k="svc"]')].map(x => x.dataset.v)), ['지어낸 새벽모임', '지어낸 저녁모임']);
    await page.fill('.layer [data-f="name"]', '지어낸출석');
    await page.click('.layer [data-act="aone"][data-k="svc"][data-v="지어낸 저녁모임"]');
    GATE.big.open(); await page.waitForFunction(() => DATA.state === 'err'); await page.waitForTimeout(150);
    eq('⑥ 읽기가 실패해도 창과 쓰던 글이 남는다 · 다시 읽기 단추', await page.evaluate(() => [S.layers.length, topLayer().form.name, topLayer().form.svc, !!document.querySelector('.layer .early.stop [data-act="reload"]'), document.querySelector('.layer [data-f="name"]').value]), [1, '지어낸출석', '지어낸 저녁모임', true, '지어낸출석']);
    await page.click('.layer [data-act="attsave"]'); await page.waitForTimeout(500);
    eq('⑥ 못 읽은 채로는 저장하지 않는다', [appended('출석'), await page.evaluate(() => S.layers.length)], [0, 1]);
    await page.click('.layer .early [data-act="reload"]'); await page.waitForFunction(() => DATA.state === 'ok'); await page.waitForTimeout(200);
    eq('⑥ 다시 읽은 뒤에도 창 · 글 그대로, 알림 줄은 사라짐', await page.evaluate(() => [S.layers.length, topLayer().form.name, !!document.querySelector('.layer .early')]), [1, '지어낸출석', false]);
    await page.click('.layer [data-act="attsave"]'); await page.waitForFunction(() => !S.layers.length, null, { timeout: 15000 }); await page.waitForTimeout(300);
    const T = tab('출석'), row = T ? (T.rows.find(r => r.includes('지어낸출석')) || []).join('|') : '';
    eq('⑥ 저장 → 출석 탭에 한 줄', [row.includes('지어낸출석'), row.includes('지어낸 저녁모임')], [true, true]);
    eq('화면 오류 없음 (출석)', page.errs, []);
    await page.close();
  }

  // ── 로그인이 필요해짐 ──
  {
    const page = await open(b);
    await page.evaluate(() => { AUTH_READY = false; USER = null; render(); });
    await page.click('.sk-go[data-v="visit"]');
    await page.fill('.layer [data-f="nameq"]', '지어낸이'); await page.keyboard.press('Enter');
    await page.evaluate(() => { AUTH_READY = true; render(); });
    eq('⑦ 로그인이 필요해져도 창은 그대로 — 알림 줄에 까닭', await page.evaluate(() => [S.layers.length, document.querySelector('.layer .early.stop span').textContent.includes('로그인이 필요합니다'), !!document.querySelector('.layer .early [data-act="reload"]')]), [1, true, false]);
    await page.click('.layer [data-act="saverec"]'); await page.waitForTimeout(400);
    eq('⑦ 그 상태의 완료 — 쓰지 않고 창 그대로', await page.evaluate(() => [S.layers.length, topLayer().form.name]), [1, '지어낸이']);
    await page.click('.layer .early [data-act="earlypeek"]');
    eq('⑦ 화면 보기 → 로그인 화면 + 돌아오는 단추', await page.evaluate(() => [!!document.querySelector('#loginForm'), document.querySelectorAll('#layers .layer').length, !!document.querySelector('.peekbar [data-act="earlyback"]'), S.layers.length]), [true, 0, true, 1]);
    await page.click('.peekbar [data-act="earlyback"]');
    eq('⑦ 쓰던 입력 창으로 → 글 그대로', await page.evaluate(() => [document.querySelectorAll('#layers .layer').length, topLayer().form.name, document.querySelector('.layer .wchips').textContent.includes('지어낸이')]), [1, '지어낸이', true]);
    eq('화면 오류 없음 (로그인)', page.errs, []);
    await page.close();
  }

  await b.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
