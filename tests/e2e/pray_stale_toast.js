// 기도노트 '이름의 날짜가 지난 항목' 보관 제안 토스트가 번쩍 지나가지 않는지 (H-4, pray v. 26-1022-2).
// ⚠️ check.sh 가 돌리지 않는다. 로그인 없이 앱만 띄운다 — 저장소 뿌리에서 정적 서버를 띄우고:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/pray_stale_toast.js
// 지키는 것 (이름은 지어낸 것):
//  ① 앱이 스스로 띄우는 알림(새 버전)은 제안을 덮지 않고 닫힌 뒤에 나온다
//  ② 열자마자 손이 닿는 동안은 기다렸다가 손이 쉬면 띄운다
//  ③ 1초 만에 닫히면 '오늘 물었음' 으로 안 치고 20초 뒤 다시
//  ④ '보기' 를 누르면 오늘은 끝 · 고르는 창
//  ⑤ 사람이 한 일의 대답 토스트는 기다리지 않고 바로 (덮인 제안은 다시 나온다)
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  async function open() {
    const ctx = await b.newContext({ serviceWorkers:'block', viewport:{width:390,height:844}, hasTouch:true, isMobile:true });
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
    await p.evaluate(() => { const t = newTarget('person', '10/3 가온 수업 준비'); DB.T.push(t); const g = newGroup('청년 셀', '#e09a28'); g.lines = [{ id: 'L1', segs: [[t.id]], r: {}, text: '' }]; DB.G.push(g); save(); localStorage.removeItem('pray.staleAsk'); });
    await p.reload(); await p.waitForFunction(() => typeof DB === 'object');
    return p;
  }
  const msg = p => p.evaluate(() => { const t = document.getElementById('toast'); return t.classList.contains('on') ? t.querySelector('.msg').textContent : ''; });
  const asked = p => p.evaluate(() => localStorage.getItem('pray.staleAsk'));
  // ① 새 버전 알림이 4초에 와도 덮지 않는다 · 닫힌 뒤 나온다
  let p = await open();
  await sleep(2200); ok('① 제안이 뜸', (await msg(p)).includes('지난 항목'), await msg(p));
  await p.evaluate(() => toastBg('새 버전 v. X 이 있습니다', '받기', () => {}));
  await sleep(1500); ok('① 새 버전 알림이 덮지 않음', (await msg(p)).includes('지난 항목'), await msg(p));
  await sleep(5000); ok('① 제안이 닫힌 뒤 새 버전 알림', (await msg(p)).includes('새 버전'), await msg(p));
  ok('① 충분히 보였으니 오늘 물었음', !!(await asked(p)));
  await p.context().close();
  // ② 열자마자 손이 닿고 있으면 기다렸다 띄운다
  p = await open();
  for (let i = 0; i < 6; i++) { await p.touchscreen.tap(200, 500); await sleep(500); }   // 3초 동안 톡톡
  ok('② 손이 닿는 동안은 안 뜸', !(await msg(p)), await msg(p));
  await sleep(2200); ok('② 손이 쉬면 뜸', (await msg(p)).includes('지난 항목'), await msg(p));
  // ③ 1초 만에 닫히면 오늘 물었음으로 안 친다 → 20초 뒤 다시
  await sleep(800); await p.touchscreen.tap(200, 500); await sleep(300);
  ok('③ 눌러 닫힘', !(await msg(p))); ok('③ 바로 닫혀 오늘 물었음 아님', !(await asked(p)));
  await sleep(21000); ok('③ 20초 뒤 다시 뜸', (await msg(p)).includes('지난 항목'), await msg(p));
  // ④ '보기' 를 누르면 오늘 물었음 · 목록 창
  await p.click('#toast button'); await sleep(400);
  ok('④ 보기 → 오늘 물었음', !!(await asked(p)));
  ok('④ 보기 → 고르는 창', await p.evaluate(() => !!SHEET));
  await sleep(21000); ok('④ 다시 안 뜸', !(await msg(p)), await msg(p));
  await p.context().close();
  // ⑤ 사람이 한 일의 대답(되돌리기 토스트)은 바로 보인다
  p = await open(); await sleep(2200);
  await p.evaluate(() => toast('저장했습니다'));
  ok('⑤ 사람이 한 일의 토스트는 바로', (await msg(p)) === '저장했습니다', await msg(p));
  ok('⑤ 덮였으니 오늘 물었음 아님', !(await asked(p)));
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
