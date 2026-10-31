// 검색 첫 화면 손질 (v. 26-1031-12, HB). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_search_home.js   (SHOT=폴더 를 주면 화면을 찍는다)
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    const k = tKey();
    getBigs(k, 'am').push({ text: '연락 하나', flag: true }, { text: '연락 밀림', autoCarryCount: 4 }, { text: '연락 둘', autoCarryCount: 2 });
    getBigs(k, 'pm').push({ text: '연락 셋', autoCarryCount: 3 }, { text: '연락 넷', autoCarryCount: 3 });
    save(); renderToday(); localStorage.removeItem(_lsk('srchRecent')); _srch.autoLast = ''; openSearch();
  });
  await p.waitForTimeout(300);
  let s = await p.evaluate(() => ({ rows: [...document.querySelectorAll('.srch-qk')].map(x => x.dataset.quick), lbl: [...document.querySelectorAll('.srch-qk > span')].map(x => x.textContent),
    flag: getComputedStyle(document.querySelector('.qk-flag')).color, red: (() => { const e = document.createElement('i'); e.style.color = 'var(--ov)'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; })(), flagSvg: !!document.querySelector('.qk-flag svg path[d^="M5 4 14.5"]'),
    dots: document.querySelectorAll('.qk-carry .qk-dots b').length, dotBg: getComputedStyle(document.querySelector('.qk-dots b')).backgroundColor,
    ev: getComputedStyle(document.querySelector('.qk-weekEv')).color, cnt: [...document.querySelectorAll('.srch-qk em')].map(x => x.textContent) }));
  ok('긴급 줄이 없다', JSON.stringify(s.rows) === JSON.stringify(['flag', 'contact', 'carry', 'weekEv']), s.rows);
  ok('중요 = 할일행 깃발 모양 · 빨강', s.flagSvg && s.flag === s.red, s);
  ok('밀린 = 빨간 점 둘', s.dots === 2 && /232, 80, 63|224, 67, 47/.test(s.dotBg), s);
  ok('이번 주 일정 = 구글 파랑', s.ev === 'rgb(66, 133, 244)', s.ev);
  ok('밀린 할일 줄 이름 (3번 이상) · 개수 3(기준 3: 4,3,3)', s.lbl[2] === '밀린 할일 (3번 이상)' && s.cnt[2] === '3', s);
  if (SHOT) await p.screenshot({ path: SHOT + '/srch-home.png' });
  // 설정으로 기준 바꾸기
  await p.evaluate(() => { updateSetting('srchCarryMin', 4); _srchRender(); });
  s = await p.evaluate(() => ({ lbl: document.querySelectorAll('.srch-qk > span')[2].textContent, cnt: document.querySelectorAll('.srch-qk em')[2].textContent }));
  ok('기준 4로 → 줄 이름 · 개수가 따라간다', s.lbl === '밀린 할일 (4번 이상)' && s.cnt === '1', s);
  await p.evaluate(() => { closeSearch(); openSettings && openSettings(); });
  await p.waitForTimeout(300);
  ok('설정창 칸에 값이 보인다', await p.evaluate(() => { const e = document.getElementById('setSrchCarryMin'); return !!e && e.value === '4'; }));
  await p.evaluate(() => { const e = document.getElementById('setSrchCarryMin'); e.value = '2'; e.dispatchEvent(new Event('change')); });
  ok('설정창에서 바꾸면 저장', await p.evaluate(() => ST.settings.srchCarryMin === 2));
  await p.evaluate(() => { try { closeSettings(); } catch (e) {} });

  // 7: 엔터 없이 최근 검색
  const rec = () => p.evaluate(() => _srchRecent());
  await p.evaluate(() => { localStorage.removeItem(_lsk('srchRecent')); _srch.autoLast = ''; _srch.q = ''; openSearch(); });
  await p.keyboard.type('연'); await p.waitForTimeout(300);
  ok('치는 중에는 아직 안 남는다', (await rec()).length === 0);
  await p.keyboard.type('락'); await p.waitForTimeout(2400);
  ok('2초 쉬면 남는다', JSON.stringify(await rec()) === JSON.stringify(['연락']), await rec());
  await p.keyboard.type(' 셋'); await p.waitForTimeout(2400);
  ok('이어 친 말은 앞 줄을 바꿔 쓴다', JSON.stringify(await rec()) === JSON.stringify(['연락 셋']), await rec());
  await p.evaluate(() => { document.getElementById('srchInput').value = ''; _srchClear(); });
  await p.keyboard.type('zzzz없는말'); await p.waitForTimeout(2400);
  ok('결과가 없는 말은 안 남는다', JSON.stringify(await rec()) === JSON.stringify(['연락 셋']), await rec());
  await p.evaluate(() => { _srchClear(); });
  await p.keyboard.type('밀림'); await p.waitForTimeout(500);
  await p.evaluate(() => { const b = document.getElementById('srchBody'); b.style.maxHeight = '40px'; b.scrollTop = 30; b.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(200);
  ok('결과를 스크롤하면 바로 남는다', (await rec())[0] === '밀림', await rec());
  await p.evaluate(() => { document.getElementById('srchBody').style.maxHeight = ''; _srchClear(); });
  await p.keyboard.type('연락 하나'); await p.keyboard.press('Enter'); await p.keyboard.type('X'); await p.waitForTimeout(2400);
  ok('엔터로 남긴 말은 그대로 둔다(자동으로 덮지 않는다)', (await rec()).includes('연락 하나'), await rec());
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
