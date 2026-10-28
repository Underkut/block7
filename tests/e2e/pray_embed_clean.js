// 기도노트 안 Sweeter 겹 화면 — 열 때마다 빈 판에서 (HB 2026-10-28 사진: 저장 타일뷰를 밀어 닫는데 상관없는 말씀 전체화면이 비침).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_embed_clean.js
//  ① 지난번에 열어 둔 전체화면 · 타일뷰가 남아 있어도 새로 열면 치워진다
//  ② 치우며 부모에게 '닫혔다' 를 보내지 않는다 (겹 화면이 내려가면 안 된다)
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 820, height: 1180 }, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto((process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html'); await p.waitForFunction(() => typeof DB === 'object');
  await p.evaluate(() => { const a = newTarget('person', '가람'); DB.T.push(a); focusStart([{ id: a.id, sec: 'top' }], 0); embedWarm(); });
  let fr = null;
  for (let k = 0; k < 60 && !fr; k++) { await sleep(500); fr = p.frames().find(f => f.url().includes('embed=')); }
  // 이 상자에는 Firebase 가 안 닿아 부팅 끝(_embedStart)까지 못 간다 — 그 한 줄만 손으로 부른다
  await sleep(4000); await fr.evaluate(() => { if (!_embedReady) _embedStart(); });
  // 지난번 것이 남은 모양: 전체화면이 떠 있고 그 아래 타일뷰
  await fr.evaluate(() => { const v = document.getElementById('verseFull'); v.style.display = 'flex'; const g = document.getElementById('verseGrid'); g.style.display = 'flex'; g.classList.add('under-vf'); });
  await p.evaluate(() => { window._closed = 0; window.addEventListener('message', e => { if (e.data && e.data.b7embed === 'close') window._closed++; }); embedOpen('bible', 43, 3); });
  await sleep(1500);
  const st = await fr.evaluate(() => ({ vf: _verseFullIsOpen(), vg: _vgIsOpen(), under: document.getElementById('verseGrid').classList.contains('under-vf'), br: !!_brOpen }));
  ok('⭐① 남아 있던 전체화면 · 타일뷰가 치워짐 · 새 화면(성경)이 열림', !st.vf && !st.vg && !st.under && st.br, st);
  ok('⭐② 겹 화면은 그대로 떠 있다(닫혔다 알림 없음)', (await p.evaluate(() => window._closed)) === 0 && await p.evaluate(() => document.getElementById('embedLayer').classList.contains('on')));
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
