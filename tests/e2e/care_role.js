// 심방 노트 1115-5 ④ — 구분은 사람에게 (node tests/e2e/care_role.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름 · 내용은 모두 지어낸 것.
//  ① 성도 탭이 비어 있으면 지난 기록(심방 · 출석)의 구분을 모아 보여 준다 — 혼자 받은 기록 먼저, 여럿이 함께한 기록은 그것뿐일 때만
//  ② 새 심방 입력 — 이름을 넣으면 그분 구분을 불러온다 · 고치면 아래 한 줄로 알린다 · 저장하면 성도 탭에 그분 줄 · 옛 기록 칸은 그대로
//  ③ 고치기 창 — 그분 구분을 불러온다 · 구분을 안 고쳤으면 기록 칸도 성도 탭도 안 바뀐다
//  ④ 여럿이 함께한 기록 고치기 — 더한 구분은 모두에게
//  ⑤ 출석 입력 · 고치기 — 같은 규칙(적는 중에 아는 이름이면 불러옴 · 안 고치면 기록 칸 그대로)
//  ⑥ 모두 빼면 성도 탭에 '없음' — 다시 읽어도 지난 기록 구분이 되살아나지 않는다
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
  SHEET.tabs[0].rows = [HEAD.slice(),
    ['11/2/2026 10:00:00', '11/1', '가온', '장년부', '식사', '이야기 하나', '', '', '중간'],
    ['11/5/2026 10:00:00', '11/4', '가온', '청년부', '전화', '이야기 둘', '', '', '얕음'],
    ['11/9/2026 10:00:00', '11/8', '나래, 다온', '셀리더, 셀원', '식사', '함께 이야기', '', '', '중간'],
    ['11/10/2026 10:00:00', '11/9', '다온', '', '전화', '안부', '', '', '얕음']];
  const AH = ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '섬김', '메모', '적은 시각', '구분'];
  const arow = (id, n, role, d) => AH.map(k => ({ '출석ID': id, '성도': n, '날짜': d, '예배 · 모임': '지어낸 모임', '구분': role, '적은 시각': d + ' 10:00' })[k] || '');
  SHEET.tabs.push({ id: 71, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임']] });
  SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [AH, arow('T1', '라온', '셀원', '2026-11-08'), arow('T2', '가온', '', '2026-11-08')] });
  const page = await b.newPage({ viewport: { width: 1100, height: 900 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  page.on('dialog', d => d.accept());
  await page.route(/.*/, r => (r.request().url().startsWith('file:') ? r.continue() : route(r)));
  await page.addInitScript(() => { matchMedia = q => ({ matches: q.includes('reduce'), addEventListener() {}, addListener() {} }); });
  await page.goto(FILE); await page.waitForTimeout(400);
  await page.evaluate(() => { USER = { email: 'test@example.com', uid: 'u', getIdToken: async () => 'x' }; AUTH_READY = true;
    save({ sheet: { id: 'S', name: '시험 시트' }, form: { id: 'F', name: '시험 폼' } });
    DB = { doc: p => ({ set: async () => {}, get: async () => ({ exists: false }) }) }; });
  await page.evaluate(() => googleStatus()); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 15000 });
  await page.evaluate(() => ensurePrepared()); await page.waitForFunction(() => DATA.prepared && DATA.state === 'ok', null, { timeout: 15000 });
  const LY = '#layers > .layer:last-child';
  const T = t => SHEET.tabs.find(x => x.title === t);
  const people = () => { const t = T('성도'), h = t.rows[0]; return t.rows.slice(1).filter(r => r[h.indexOf('이름')]).map(r => [r[h.indexOf('이름')], r[h.indexOf('구분')] || '']); };
  const recRoles = () => { const t = T('Form Responses 1'), h = t.rows[0]; return t.rows.slice(1).map(r => [r[h.indexOf('성도 이름')], r[h.indexOf('구분')] || '']); };
  const roles = () => page.evaluate(() => attRoleList(topLayer().form.roles, topLayer().form.rolesEtc));
  const hint = () => page.$eval(LY + ' [data-rhint]', e => e.textContent).catch(() => null);
  const close = () => page.evaluate(() => { S.layers = []; render(); });
  const waitShut = async () => { await page.waitForFunction(() => !document.querySelector('#layers > .layer'), null, { timeout: 8000 }).catch(() => {}); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 8000 }); await page.waitForTimeout(500); };

  // ① 지난 기록 모음
  eq('① 성도 탭은 머리글뿐', people(), []);
  eq('① 혼자 받은 기록 모음(최근 것부터)', await page.evaluate(() => rolesOf('가온')), ['청년부', '장년부']);
  eq('① 여럿이 함께한 기록뿐인 분 — 그 기록 구분', await page.evaluate(() => rolesOf('나래')), ['셀리더', '셀원']);
  eq('① 혼자 받은 기록에 구분이 없으면 함께한 기록에서', await page.evaluate(() => rolesOf('다온')), ['셀리더', '셀원']);
  eq('① 출석만 있는 분 — 출석 구분', await page.evaluate(() => rolesOf('라온')), ['셀원']);
  eq('① 성도 목록 · 기록 카드도 사람 값', await page.evaluate(() => [M().people['가온'].roles, M().visits.filter(v => v.name === '가온').map(v => v.allRoles)]), [['청년부', '장년부'], [['청년부', '장년부'], ['청년부', '장년부']]]);

  // ② 새 심방 입력
  await page.evaluate(() => { openEdit(null, ''); whoAdd(topLayer(), ['가온']); }); await page.waitForTimeout(250);
  eq('② 이름을 넣으면 그분 구분을 불러온다', await roles(), ['청년부', '장년부']);
  eq('② 안 고쳤으면 알림 줄 없음', await hint(), '');
  await page.click(LY + ' [data-act="ftog"][data-k="roles"][data-v="장년부"]');
  eq('② 고치면 아래 한 줄로 알린다', await hint(), '저장하면 성도 탭의 구분도 바뀝니다 — 가온 청년부');
  await page.evaluate(() => { const L = topLayer(); L.form.method = '식사'; L.form.text = '새 이야기'; });
  await page.click(LY + ' [data-act="saverec"]'); await waitShut();
  eq('② 성도 탭에 그분 줄 — 고친 값', people(), [['가온', '청년부']]);
  eq('② 새 기록 칸은 고른 값 · 옛 기록 칸은 그대로', recRoles(), [['가온', '장년부'], ['가온', '청년부'], ['나래, 다온', '셀리더, 셀원'], ['다온', ''], ['가온', '청년부']]);
  eq('② 다시 읽으면 성도 탭 값 · 옛 기록 카드도 사람 값', await page.evaluate(() => [rolesOf('가온'), M().visits.filter(v => v.name === '가온').map(v => v.allRoles.join()), M().visits.filter(v => v.name === '가온').map(v => v.recRoles.join()).sort()]),
    [['청년부'], ['청년부', '청년부', '청년부'], ['장년부', '청년부', '청년부']]);

  // ③ 고치기 — 구분을 안 고치면 아무 데도 안 바뀐다
  await page.evaluate(() => openEdit(M().visits.find(v => v.name === '가온' && v.ymd === '2026-11-01').key)); await page.waitForTimeout(250);
  eq('③ 고치기 창 — 그분 구분을 불러온다(기록 칸은 장년부)', await roles(), ['청년부']);
  await page.evaluate(() => { topLayer().form.method = '전화'; topLayer().dirty = true; });
  await page.click(LY + ' [data-act="saverec"]'); await waitShut();
  eq('③ 구분을 안 고쳤으면 기록 칸 그대로 · 성도 탭 그대로', [recRoles()[0], people()], [['가온', '장년부'], [['가온', '청년부']]]);
  eq('③ 다른 칸은 고쳐졌다', (() => { const t = T('Form Responses 1'), h = t.rows[0]; return t.rows[1][h.indexOf('전화 / 만남')]; })(), '전화');

  // ④ 여럿이 함께한 기록 — 더한 것은 모두에게
  await page.evaluate(() => openEdit(M().visits.find(v => v.name === '나래, 다온').key)); await page.waitForTimeout(250);
  eq('④ 두 분 구분을 합쳐 불러온다', await roles(), ['셀리더', '셀원']);
  await page.click(LY + ' [data-act="ftog"][data-k="roles"][data-v="예배팀"]');
  eq('④ 알림 줄 — 두 분 모두', await hint(), '저장하면 성도 탭의 구분도 바뀝니다 — 나래 셀리더 · 셀원 · 예배팀, 다온 셀리더 · 셀원 · 예배팀');
  await page.click(LY + ' [data-act="saverec"]'); await waitShut();
  eq('④ 성도 탭에 두 분 줄', people(), [['가온', '청년부'], ['나래', '셀리더, 셀원, 예배팀'], ['다온', '셀리더, 셀원, 예배팀']]);
  eq('④ 그 기록 칸은 고친 값', recRoles()[2], ['나래, 다온', '셀리더, 셀원, 예배팀']);

  // ⑤ 출석 — 입력 · 고치기
  await page.evaluate(() => { S.view = 'attend'; render(); openAttEdit(null, ''); }); await page.waitForTimeout(250);
  await page.fill(LY + ' input[data-f="name"]', '가온'); await page.waitForTimeout(250);
  eq('⑤ 적는 중에 아는 이름이면 그분 구분을 불러온다', await roles(), ['청년부']);
  await page.click(LY + ' [data-act="ftog"][data-k="roles"][data-v="셀원"]');
  eq('⑤ 알림 줄', await hint(), '저장하면 성도 탭의 구분도 바뀝니다 — 가온 청년부 · 셀원');
  await page.evaluate(() => { topLayer().form.svc = '지어낸 모임'; });
  await page.click(LY + ' [data-act="attsave"]'); await waitShut();
  const att = () => { const t = T('출석'), h = t.rows[0]; return t.rows.slice(1).map(r => [r[h.indexOf('성도')], r[h.indexOf('구분')] || '', r[h.indexOf('메모')] || '']); };
  eq('⑤ 출석 칸 · 성도 탭', [att()[2], people()[0]], [['가온', '청년부, 셀원', ''], ['가온', '청년부, 셀원']]);
  await page.evaluate(() => openAttEdit(AT().find(a => a.name === '라온').id)); await page.waitForTimeout(250);
  eq('⑤ 출석 고치기 — 그분 구분', await roles(), ['셀원']);
  await page.evaluate(() => { topLayer().form.memo = '메모 더함'; topLayer().dirty = true; });
  await page.click(LY + ' [data-act="attsave"]'); await waitShut();
  eq('⑤ 구분을 안 고쳤으면 출석 칸 그대로 · 성도 탭에 줄 안 생김', [att()[0], people().some(p => p[0] === '라온')], [['라온', '셀원', '메모 더함'], false]);

  // ⑥ 모두 빼기
  await page.evaluate(() => { openEdit(null, ''); whoAdd(topLayer(), ['다온']); }); await page.waitForTimeout(250);
  for (const r of await roles()) await page.click(LY + ' [data-act="ftog"][data-k="roles"][data-v="' + r + '"]');
  eq('⑥ 알림 줄 — 없음', await hint(), '저장하면 성도 탭의 구분도 바뀝니다 — 다온 없음');
  await page.evaluate(() => { const L = topLayer(); L.form.method = '전화'; L.form.text = '짧은 안부'; });
  await page.click(LY + ' [data-act="saverec"]'); await waitShut();
  eq("⑥ 성도 탭에 '없음'", people().find(p => p[0] === '다온'), ['다온', '없음']);
  eq('⑥ 다시 읽어도 지난 기록 구분이 되살아나지 않는다', await page.evaluate(() => [rolesOf('다온'), rolesOf('나래')]), [[], ['셀리더', '셀원', '예배팀']]);
  await page.evaluate(() => { S.layers = []; openLayer('person', { name: '다온' }); }); await page.waitForTimeout(250);
  eq('⑥ 성도 카드 이름 아래 구분 비어 있음', await page.$eval(LY + ' .dt-when', e => e.textContent), '');
  await close();

  eq('오류 없음', page.errs, []);
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
