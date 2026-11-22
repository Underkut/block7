// 심방 노트 1122-C · 1122-F — 개인 페이지에서 이름 · 소속 · 역할 고치기 / 이름 칸 빈칸으로도 여럿 (node tests/e2e/care_person.js)
// 가짜 구글 시트는 care_write.js 의 것을 빌려 쓴다. 이름 · 내용은 모두 지어낸 것.
//  ① 이름을 눌러 '성도 고치기' — 이름 · 소속 · 역할을 지금 값으로 불러온다
//  ② 이름 바꾸기 — 성도 탭 그분 줄만(이름 · '예전 이름') · 응답 탭 · 출석 탭 옛 기록 칸은 한 글자도 안 바뀐다 · 옛 기록이 새 이름에 이어진다 · 열려 있던 화면도 새 이름
//  ③ 소속 · 역할만 고치기 — 성도 탭 구분 칸
//  ④ 이미 있는 이름으로 — 묻고 합친다(옛 기록이 한 분에게)
//  ⑤ 출석 입력 — 아는 이름은 빈칸으로도 나뉜다 · 셀 표시 · 모르는 낱말은 그대로(알림 줄) · 저장하면 한 분씩 한 줄
//  ⑥ 심방 입력 — 빈칸 뒤 아는 이름이면 알약 · '○○ 셀' 은 셀 표시로 · 끝 낱말 후보를 고르면 앞 이름도
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
    ['11/5/2026 10:00:00', '11/4', '가온, 나래', '', '식사', '함께 이야기\n◆ 가온\n그분 몫', '', '', '얕음'],
    ['11/9/2026 10:00:00', '11/8', '다온', '', '전화', '안부', '', '', '얕음']];
  const AH = ['출석ID', '날짜', '성도', '예배 · 모임', '언제 왔나', '언제 보였나', '언제 갔나', '자리', '함께', '섬김', '메모', '적은 시각', '구분'];
  const arow = (id, n, d) => AH.map(k => ({ '출석ID': id, '성도': n, '날짜': d, '예배 · 모임': '지어낸 모임', '적은 시각': d + ' 10:00' })[k] || '');
  SHEET.tabs.push({ id: 71, title: '출석 선택지', cols: 26, rows: [['칸', '값'], ['예배 · 모임', '지어낸 모임']] });
  SHEET.tabs.push({ id: 72, title: '출석', cols: 26, rows: [AH, arow('T1', '가온', '2026-11-08'), arow('T2', '라온', '2026-11-08')] });
  const page = await b.newPage({ viewport: { width: 1100, height: 900 }, timezoneId: 'Asia/Seoul' });
  page.errs = []; page.on('pageerror', e => page.errs.push(e.message));
  const asked = []; page.on('dialog', d => { asked.push(d.message()); d.accept(); });
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
  const people = () => { const t = T('성도'), h = t.rows[0], c = x => h.indexOf(x); return t.rows.slice(1).filter(r => r[c('이름')]).map(r => [r[c('이름')], c('구분') < 0 ? '' : r[c('구분')] || '', c('예전 이름') < 0 ? '' : r[c('예전 이름')] || '']); };
  const recNames = () => { const t = T('Form Responses 1'), h = t.rows[0]; return t.rows.slice(1).map(r => r[h.indexOf('성도 이름')]); };
  const attNamesT = () => { const t = T('출석'), h = t.rows[0]; return t.rows.slice(1).map(r => r[h.indexOf('성도')]); };
  const waitShut = async () => { await page.waitForFunction(() => S.layers.every(l => l.type !== 'pedit' && l.type !== 'attedit' && l.type !== 'edit'), null, { timeout: 8000 }).catch(() => {}); await page.waitForFunction(() => DATA.state === 'ok', null, { timeout: 8000 }); await page.waitForTimeout(500); };
  const recBefore = JSON.stringify(recNames()), attBefore = JSON.stringify(attNamesT());

  // ① 개인 페이지 → 성도 고치기
  await page.evaluate(() => { S.layers = []; openLayer('person', { name: '가온' }); }); await page.waitForTimeout(250);
  await page.click(LY + ' .pe-hd'); await page.waitForTimeout(250);
  eq('① 이름을 누르면 성도 고치기 창', await page.evaluate(() => topLayer().type), 'pedit');
  eq('① 지금 이름 · 소속 · 역할을 불러온다', await page.evaluate(() => [topLayer().form.name, attRoleList(topLayer().form.roles, topLayer().form.rolesEtc)]), ['가온', ['장년부']]);

  // ② 이름 바꾸기
  await page.fill(LY + ' input[data-f="pname"]', '가온빛'); await page.waitForTimeout(100);
  eq('② 알림 줄 — 옛 기록도 이어 봄', await page.$eval('#pnameHint', e => e.textContent), '가온 이름으로 적힌 지난 기록도 새 이름으로 이어 봅니다');
  await page.click(LY + ' [data-act="peditsave"]'); await waitShut();
  eq('② 성도 탭 — 그분 줄 하나(새 이름 · 예전 이름)', people(), [['가온빛', '', '가온']]);
  eq('② 응답 탭 이름 칸은 그대로', JSON.stringify(recNames()), recBefore);
  eq('② 출석 탭 이름 칸은 그대로', JSON.stringify(attNamesT()), attBefore);
  eq('② 옛 기록이 새 이름에 — 심방 둘 · 출석 하나 · 옛 이름 성도는 없음', await page.evaluate(() => [M().visits.filter(v => hasPerson(v, '가온빛')).length, attendOf(AT(), '가온빛').length, !!M().people['가온'], attendOf(AT(), '가온').length]), [2, 1, false, 0]);
  eq("② 사람별 내용 '◆ 가온' 도", await page.evaluate(() => M().visits.find(v => v.names.length === 2).notes.map(x => x.name)), ['가온빛']);
  eq('② 열려 있던 화면도 새 이름 · 기록 목록 이름도 새 이름', await page.evaluate(() => [topLayer().name, document.querySelector('#layers > .layer:last-child .dt-name').textContent, whoHtml('가온, 나래')]), ['가온빛', '가온빛', '가온빛, 나래']);
  eq('② 구분은 지난 기록에서 그대로 이어짐', await page.evaluate(() => rolesOf('가온빛')), ['장년부']);

  // ③ 소속 · 역할만
  await page.evaluate(() => { S.layers = []; openLayer('person', { name: '나래' }); }); await page.waitForTimeout(250);
  await page.click(LY + ' .pe-hd'); await page.waitForTimeout(250);
  await page.click(LY + ' [data-act="pftog"][data-v="청년부"]');
  await page.fill(LY + ' input[data-f="prolesEtc"]', '새가족');
  await page.click(LY + ' [data-act="peditsave"]'); await waitShut();
  eq('③ 성도 탭 구분 칸 · 이름 그대로', people(), [['가온빛', '', '가온'], ['나래', '청년부, 새가족', '']]);
  eq('③ 다시 읽어도 그 값', await page.evaluate(() => rolesOf('나래')), ['청년부', '새가족']);

  // ④ 이미 있는 이름으로 — 합치기
  await page.evaluate(() => { S.layers = []; openLayer('person', { name: '다온' }); }); await page.waitForTimeout(250);
  await page.click(LY + ' .pe-hd'); await page.waitForTimeout(250);
  await page.fill(LY + ' input[data-f="pname"]', '가온빛'); await page.waitForTimeout(100);
  eq('④ 알림 줄 — 합친다', await page.$eval('#pnameHint', e => e.textContent), '가온빛 님이 이미 있습니다 — 저장하면 두 분을 같은 분으로 합칩니다');
  await page.click(LY + ' [data-act="peditsave"]'); await waitShut();
  eq('④ 묻고 합침', asked.some(m => m.includes('같은 분으로 합칠까요')), true);
  eq('④ 성도 탭 — 있던 줄 예전 이름에 더함', people(), [['가온빛', '', '가온, 다온'], ['나래', '청년부, 새가족', '']]);
  eq('④ 옛 기록이 한 분에게', await page.evaluate(() => [M().visits.filter(v => hasPerson(v, '가온빛')).length, !!M().people['다온']]), [3, false]);
  eq('④ 응답 탭 이름 칸은 그대로', JSON.stringify(recNames()), recBefore);

  // ⑤ 출석 입력 — 빈칸
  await page.evaluate(() => { S.layers = []; S.view = 'attend'; render(); openAttEdit(null, ''); }); await page.waitForTimeout(250);
  const NI = LY + ' input[data-f="name"]';
  await page.click(NI); await page.keyboard.type('가온빛 나래 ', { delay: 10 }); await page.waitForTimeout(150);
  eq('⑤ 아는 이름 둘 + 빈칸 → 쉼표로', await page.$eval(NI, e => e.value), '가온빛, 나래, ');
  await page.fill(NI, ''); await page.click(NI); await page.keyboard.type('가온빛 ', { delay: 10 }); await page.waitForTimeout(100);
  eq("⑤ 한 분 뒤 빈칸은 그대로('○○ 셀' 을 칠 수 있게)", await page.$eval(NI, e => e.value), '가온빛 ');
  await page.keyboard.type('셀 ', { delay: 10 }); await page.waitForTimeout(100);
  eq('⑤ 셀 표시는 나누지 않는다', await page.$eval(NI, e => e.value), '가온빛 셀 ');
  await page.fill(NI, '나래 새사람'); await page.dispatchEvent(NI, 'change'); await page.waitForTimeout(150);
  eq('⑤ 모르는 낱말이 끼면 그대로 · 알림 줄', [await page.$eval(NI, e => e.value), await page.$eval('#nameHint', e => e.textContent)], ['나래 새사람', "'나래 새사람' — 빈칸으로는 명단에 있는 이름만 나눕니다. 처음 적는 분이 섞였으면 쉼표로 나눠 주세요."]);
  await page.fill(NI, '라온 나래'); await page.dispatchEvent(NI, 'change'); await page.waitForTimeout(250);
  eq('⑤ 붙여 넣은 글도 칸을 떠날 때 나눈다', await page.$eval(NI, e => e.value), '라온, 나래');
  await page.fill(NI, '가온빛 나'); await page.waitForTimeout(150);
  eq('⑤ 끝 낱말로 후보', await page.$$eval('#nameSugg [data-act="attpick"]', bs => bs.map(x => x.dataset.v)), ['나래']);
  await page.click('#nameSugg [data-act="attpick"]'); await page.waitForTimeout(150);
  eq('⑤ 고르면 앞 이름도 그대로', await page.$eval(NI, e => e.value), '가온빛, 나래');
  await page.evaluate(() => { topLayer().form.svc = '지어낸 모임'; });
  await page.click(LY + ' [data-act="attsave"]'); await waitShut();
  eq('⑤ 저장 — 한 분씩 한 줄', attNamesT().slice(-2), ['가온빛', '나래']);

  // ⑥ 심방 입력 — 이름 알약
  await page.evaluate(() => { S.layers = []; S.view = 'list'; render(); openEdit(null, ''); }); await page.waitForTimeout(250);
  const QI = LY + ' input[data-f="nameq"]';
  await page.click(QI); await page.keyboard.type('가온빛 나래 ', { delay: 10 }); await page.waitForTimeout(150);
  eq('⑥ 아는 이름 둘 + 빈칸 → 알약 둘', await page.evaluate(() => topLayer().form.name), '가온빛, 나래');
  await page.click(QI); await page.keyboard.type('라온 ', { delay: 10 }); await page.waitForTimeout(100);
  eq('⑥ 한 분 뒤 빈칸은 치는 중으로 둔다', [await page.$eval(QI, e => e.value), await page.evaluate(() => topLayer().form.name)], ['라온 ', '가온빛, 나래']);
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  eq('⑥ Enter 로 알약', await page.evaluate(() => topLayer().form.name), '가온빛, 나래, 라온');
  await page.evaluate(() => { const L = topLayer(); L.form.name = ''; L.nq = ''; render(); }); await page.waitForTimeout(100);
  await page.click(QI); await page.keyboard.type('가온빛 나', { delay: 10 }); await page.waitForTimeout(150);
  await page.click('#nameSugg [data-act="pickname"][data-v="나래"]'); await page.waitForTimeout(150);
  eq('⑥ 끝 낱말 후보를 고르면 앞 이름도', await page.evaluate(() => topLayer().form.name), '가온빛, 나래');
  await page.evaluate(() => { const L = topLayer(); L.form.name = ''; L.nq = ''; render(); }); await page.waitForTimeout(100);
  await page.fill(QI, '가온빛 나래 새사람'); await page.focus(QI); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  eq('⑥ 붙여 넣은 글에 모르는 낱말이 끼면 Enter 로도 한 이름(나누지 않음)', await page.evaluate(() => topLayer().form.name), '가온빛 나래 새사람');

  eq('화면 오류 없음', page.errs, []);
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
