// 심방 노트 1115-5 PR1 — 마지막 페이지 기억 · 화면 색 · NEW 상자 · 성도 카드 재배치 · 한눈에 (node tests/e2e/care_tidy.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름 · 자리는 모두 지어낸 것.
//  ① 탭을 옮기면 이 기기가 기억 → 다시 열면 그 탭 (모르는 값이면 심방)
//  ② 설정 '보기' 맨 위 화면 색: 기기 · 라이트 · 다크 → <html data-theme> (기기 = 속성 없음)
//  ③ + 단추: 심방 · 출석 탭은 그대로 바로 입력 / 그 밖(성도 · 달력 · 한눈에)은 NEW 상자 → 심방 입력 · 출석 입력 · 바깥 · ESC 로 닫힘
//  ④ 성도 카드: '흐름' → '심방' · 출석 줄에 구분 없음 · 옛 하단 단추 두 줄 없음 · 제목 옆 + 둘 · 맨 아래 '다른 앱으로' 두 단추
//  ⑤ 한눈에에 '구분 나란히' 카드가 없다
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
  const row = (id, n, svc, role) => H.map(k => ({ '출석ID': id, '성도': n, '날짜': '2026-11-08', '예배 · 모임': svc, '구분': role || '' })[k] || '');
  SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [H, row('T1', '가온', '지어낸 모임', '지어낸팀')] });
  const page = await b.newPage({ viewport: { width: 390, height: 860 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  const boot = async () => {
    await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true;
      save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } });
      DB = { doc: p => ({ set: async () => {}, get: async () => ({ exists: false }) }) }; });
    await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  };
  await boot();

  // ① 마지막 페이지 기억
  await page.evaluate(() => goTab('people')); await page.waitForTimeout(500);
  eq('① 탭을 옮기면 기억', await page.evaluate(() => savedRaw().view), 'people');
  await page.reload(); await page.waitForTimeout(400);
  eq('① 다시 열면 그 탭', await page.evaluate(() => S.view), 'people');
  await page.evaluate(() => save({ view: '엉뚱' })); await page.reload(); await page.waitForTimeout(400);
  eq('① 모르는 값이면 심방', await page.evaluate(() => S.view), 'list');
  await boot();

  // ② 화면 색
  await page.evaluate(() => openLayer('settings', {})); await page.waitForTimeout(300);
  const seg = await page.evaluate(() => [...document.querySelectorAll('#layers button[data-act="theme"]')].map(x => x.textContent));
  eq('② 기기 · 라이트 · 다크', seg, ['기기', '라이트', '다크']);
  eq('② 맨 위 줄', await page.evaluate(() => document.querySelector('#stPane .srow .t').textContent), '화면 색');
  await page.click('#layers button[data-act="theme"][data-v="dark"]');
  eq('② 다크', await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
  await page.click('#layers button[data-act="theme"][data-v="light"]');
  eq('② 라이트', await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
  await page.click('#layers button[data-act="theme"][data-v="auto"]');
  eq('② 기기 = 속성 없음', await page.evaluate(() => document.documentElement.hasAttribute('data-theme')), false);
  await page.click('#layers button[data-act="theme"][data-v="dark"]');
  await page.reload(); await page.waitForTimeout(400);
  eq('② 다시 열어도 다크', await page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark');
  await page.evaluate(() => save({ theme: 'auto' })); await page.reload(); await page.waitForTimeout(400); await boot();

  // ③ + 단추
  await page.evaluate(() => { S.layers = []; S.view = 'list'; render(); });
  await page.click('.fab'); await page.waitForTimeout(300);
  eq('③ 심방 탭: 바로 심방 입력', await page.evaluate(() => topLayer() && topLayer().type), 'edit');
  await page.evaluate(() => { S.layers = []; S.view = 'attend'; render(); });
  await page.click('.fab'); await page.waitForTimeout(300);
  eq('③ 출석 탭: 바로 출석 입력', await page.evaluate(() => topLayer() && topLayer().type), 'attedit');
  for (const v of ['people', 'week', 'collect']) {
    await page.evaluate(x => { S.layers = []; S.view = x; S.newBox = false; render(); }, v);
    await page.click('.fab'); await page.waitForTimeout(200);
    eq('③ ' + v + ': NEW 상자 + 두 단추', await page.evaluate(() => [!!document.querySelector('.nbk'), [...document.querySelectorAll('.nbx .sk-go span')].map(x => x.textContent)]), [true, ['심방 입력', '출석 입력']]);
    await page.keyboard.press('Escape');
    eq('③ ' + v + ': ESC 로 닫힘', await page.evaluate(() => !!document.querySelector('.nbk')), false);
  }
  await page.evaluate(() => { S.layers = []; S.view = 'people'; render(); });
  await page.click('.fab'); await page.click('.nbx .sk-go:nth-child(2)'); await page.waitForTimeout(300);
  eq('③ 출석 입력 → 출석 창', await page.evaluate(() => [topLayer() && topLayer().type, !!document.querySelector('.nbk')]), ['attedit', false]);
  await page.evaluate(() => { S.layers = []; S.view = 'people'; render(); });
  await page.click('.fab'); await page.click('.nbx .sk-go:nth-child(1)'); await page.waitForTimeout(300);
  eq('③ 심방 입력 → 심방 창', await page.evaluate(() => topLayer() && topLayer().type), 'edit');
  await page.evaluate(() => { S.layers = []; S.view = 'people'; render(); });
  await page.click('.fab'); await page.mouse.click(5, 5); await page.waitForTimeout(200);
  eq('③ 바깥을 누르면 닫힘', await page.evaluate(() => !!document.querySelector('.nbk')), false);

  // ④ 성도 카드
  await page.evaluate(() => { S.layers = []; S.view = 'people'; render(); openLayer('person', { name: '가온' }); }); await page.waitForTimeout(400);
  const card = await page.evaluate(() => { const L = document.querySelector('#layers > .layer:last-child'); return { secs: [...L.querySelectorAll('.h-sec')].map(x => x.textContent.replace(/\s+/g, '')), adds: [...L.querySelectorAll('.hs-add')].map(x => x.dataset.act), sends: [...L.querySelectorAll('.send')].map(x => x.textContent), row: (L.querySelector('.tl button .t2') || {}).textContent || '', text: L.textContent }; });
  eq('④ 소제목 순서', card.secs.map(x => x.replace(/[0-9번·마지막기록없음오늘일전+]/g, '')).slice(0, 2), ['출석', '심방']);
  eq('④ 흐름 글자 없음', /흐름/.test(card.secs.join('')), false);
  eq('④ 제목 옆 + 둘(출석 · 심방)', card.adds, ['attadd', 'addrecp']);
  eq('④ 맨 아래 다른 앱으로 · 두 단추', [card.secs[card.secs.length - 1], card.sends], ['다른앱으로', ['BLOCK7으로', '기도노트앱으로']]);
  eq('④ 출석 줄에 구분 없음', /지어낸팀/.test(card.row), false);
  eq('④ 옛 단추 글자 없음', /\+ 출석했어요|BLOCK7 할일로/.test(card.text), false);
  await page.click('#layers > .layer:last-child .hs-add[data-act="addrecp"]'); await page.waitForTimeout(300);
  eq('④ 심방 + → 이름이 채워진 입력 창', await page.evaluate(() => [topLayer().type, topLayer().form.name]), ['edit', '가온']);

  // ⑤ 한눈에
  await page.evaluate(() => { S.layers = []; S.view = 'collect'; render(); }); await page.waitForTimeout(300);
  eq('⑤ 한눈에에 구분 나란히 없음', await page.evaluate(() => [/구분 나란히/.test($('app').innerText), !!document.querySelector('[data-act="gcard"][data-v="role"]')]), [false, false]);

  eq('오류 없음', page.errs, []);
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
