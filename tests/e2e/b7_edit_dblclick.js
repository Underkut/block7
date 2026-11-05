// 1105-G — 글자를 고치는 중 더블클릭 · 트리플클릭이 '중요/긴급' 으로 새지 않는다 (HB 2026-11-05)
// ⚠️ check.sh 가 돌리지 않는다. 개발본만 띄운다: python3 -m http.server 5502 &  node tests/e2e/b7_edit_dblclick.js
//  ① 편집 아닐 때 더블클릭 → 중요 켜짐 / 트리플 → 긴급 (예전 그대로)
//  ② 편집 중 더블클릭 → 중요 안 켜지고 편집 유지 · 트리플도 긴급 안 켜짐
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 900, height: 700 } });
  const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await sleep(1500);
  await p.evaluate(() => { const B = getBigs(tKey(), 'am'); B.length = 0; B.push({ text: '빨래', done: false }, { text: '운동', done: false }); save(); renderToday(); });
  await sleep(300);
  const sel = t => `#todayView .big-item[data-flipkey="b:${t}"] input.bi-inp`;
  const st = t => p.evaluate(t => { const x = getBigs(tKey(), 'am').find(o => o.text === t); return { f: !!(x.flag || x.important), u: !!x.urgent, raw: JSON.stringify(x) }; }, t);
  // ① 편집 아닐 때 더블클릭
  await p.dblclick(sel('빨래')); await sleep(600);
  let s = await st('빨래'); ok('① 편집 아닐 때 더블클릭 → 중요 켜짐', s.f, s);
  await p.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  await p.click('body', { position: { x: 5, y: 5 } }); await sleep(500);
  // ② 편집 중
  await p.click(sel('운동')); await sleep(500);
  ok('편집 시작', await p.evaluate(() => document.activeElement && document.activeElement.value === '운동'));
  await p.dblclick(sel('운동')); await sleep(600);
  s = await st('운동'); ok('② 편집 중 더블클릭 → 중요 안 켜짐', !s.f, s);
  ok('② 편집 유지', await p.evaluate(() => document.activeElement && document.activeElement.value === '운동'));
  await p.click(sel('운동'), { clickCount: 3 }); await sleep(600);
  s = await st('운동'); ok('② 편집 중 트리플클릭 → 긴급 안 켜짐', !s.u && !s.f, s);
  console.log(pass + ' 통과 / ' + fail + ' 실패'); await b.close(); process.exit(fail ? 1 : 0);
})();
