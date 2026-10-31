// 깃발만 보기 중 구간 ▲ 숨기기 → 깃발 모드가 남아야 한다 (v. 26-1031-5, HB 1031-2).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_flag_hide_sec.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);
  await p.evaluate(() => {
    updateSetting('showFlagFilterBtn', true);
    const k = tKey();
    getBigs(k, 'am').push({ text: '깃발 오전', done: false, flag: true }, { text: '보통 오전', done: false });
    getBigs(k, 'pm').push({ text: '깃발 오후', done: false, flag: true }, { text: '보통 오후', done: false });
    ST.vis = ['am', 'pm', 'night']; ST.preset = 'flagFilter'; save(); renderToday();
  });
  await sleep(500);
  const texts = () => p.evaluate(() => [...document.querySelectorAll('.bi-inp')].filter(e => e.offsetParent).map(e => e.value || e.textContent));
  let t = await texts();
  ok('깃발 모드: 깃발 할일만', t.includes('깃발 오전') && !t.includes('보통 오전'), t);
  await p.evaluate(() => { const ts = [...document.querySelectorAll('.ts-hide-sec')]; ts[0].click(); });
  await sleep(500);
  const st = await p.evaluate(() => ({ preset: ST.preset, vis: ST.vis }));
  t = await texts();
  ok('▲ 로 오전을 숨겨도 깃발 모드 그대로', st.preset === 'flagFilter' && !st.vis.includes('am'), st);
  ok('화면도 깃발 할일만', t.includes('깃발 오후') && !t.includes('보통 오후') && !t.includes('깃발 오전'), t);
  ok('깃발 단추가 켜진 채', await p.evaluate(() => [...document.querySelectorAll('.preset-btn.on')].some(x => x.title === '모든 할일 보기')));
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
