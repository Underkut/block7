// 기도노트 안 Sweeter 겹 화면 — 열 때마다 빈 판에서 (HB 2026-10-28 사진: 저장 타일뷰를 밀어 닫는데 상관없는 말씀 전체화면이 비침).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_embed_clean.js
//  ① 지난번에 열어 둔 전체화면 · 타일뷰가 남아 있어도 새로 열면 치워진다
//  ② 치우며 부모에게 '닫혔다' 를 보내지 않는다 (겹 화면이 내려가면 안 된다)
//  ③ 곧바로 연 타일뷰를 왼쪽 가장자리에서 밀어 닫으면 전체화면이 뜨지 않고 겹 화면이 닫힌다
//  ④ 그 끝에 한 장 기도가 한 번 감춰졌다 나타나는 깜빡임이 없다 (닫혔다를 먼저 보낸다)
//  ⑤ 그 끝에 겹 화면이 불투명 바탕으로 돌아온 채 옅어지는 '덮개' 가 한 화면도 없다
//     (예전엔 Sweeter 의 '타일뷰 → 전체화면으로 복귀' 가 돌아 상관없는 말씀이 툭 떴다 — 손짓도 없이 ×로만 닫힘)
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
  // ③ 타일뷰를 곧바로 열고 가장자리 밀기
  await fr.evaluate(() => { bibleClose(); openVerseGridHome(); });
  await sleep(600);
  ok('③ 타일뷰가 열림', await fr.evaluate(() => _vgIsOpen()));
  await p.evaluate(() => { window._closed = 0; window._seq = []; window.addEventListener('message', e => { if (e.data && (e.data.b7embed === 'close' || e.data.b7embed === 'peek')) window._seq.push(e.data.b7embed === 'peek' ? 'peek:' + e.data.on : 'close'); });
    window._hid = 0; new MutationObserver(() => { const c = document.body.classList; if (c.contains('emb-up') && !c.contains('emb-peek') && window._seq.includes('peek:true')) window._hid++; }).observe(document.body, { attributes: true, attributeFilter: ['class'] }); });
  // 손을 뗀 뒤 매 화면(rAF)마다 — 겹 화면이 아직 보이는데(층 · iframe 불투명도 > 0) iframe 바탕이 불투명하면 '덮개' 한 장
  await p.evaluate(() => { window._cover = 0; window._frames = 0; const t0 = performance.now();
    const f = document.querySelector('#embedLayer iframe'), L = document.getElementById('embedLayer');
    const tick = () => { window._frames++;
      const lo = +getComputedStyle(L).opacity, io = +getComputedStyle(f).opacity, vis = getComputedStyle(L).visibility !== 'hidden';
      const bg = f.contentWindow.getComputedStyle(f.contentDocument.body).backgroundColor, a = /rgba\(.*,\s*([\d.]+)\)$/.exec(bg), alpha = bg === 'transparent' ? 0 : a ? +a[1] : 1;
      if (vis && lo > 0.02 && io > 0.02 && alpha > 0.02 && window._seq.includes('peek:true')) window._cover++;
      if (performance.now() - t0 < 2200) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); });
  await fr.evaluate(() => new Promise(res => {
    const g = document.getElementById('verseGrid'), T = x => new Touch({ identifier: 1, target: g, clientX: x, clientY: 500 });
    const fire = (n, x) => g.dispatchEvent(new TouchEvent(n, { bubbles: true, cancelable: true, touches: n === 'touchend' ? [] : [T(x)], changedTouches: [T(x)] }));
    fire('touchstart', 6); let k = 1;
    const iv = setInterval(() => { if (k <= 10) { fire('touchmove', 6 + 40 * k); k++; } else { clearInterval(iv); fire('touchend', 406); setTimeout(res, 800); } }, 25);
  }));
  const s3 = await fr.evaluate(() => ({ vf: _verseFullIsOpen(), vfd: document.getElementById('verseFull').style.display, vg: _vgIsOpen() }));
  ok('⭐③ 밀어 닫으면 타일뷰만 닫히고 전체화면은 안 뜬다', !s3.vg && !s3.vf && s3.vfd !== 'flex', s3);
  ok('⭐③ 부모에게 닫혔다 → 한 장 기도로', (await p.evaluate(() => window._closed)) >= 1);
  await sleep(1200);
  const cov = await p.evaluate(() => [window._cover, window._frames]);
  ok('⭐⑤ 밀어 닫은 뒤 불투명한 덮개가 한 화면도 안 보인다 (예전: 0.25초 동안 바탕색 판이 옅어지며 깜빡)', cov[0] === 0 && cov[1] > 20, cov);
  const seq = await p.evaluate(() => window._seq);
  ok('⭐④ 밀어 닫은 끝 — 비침을 끄기 전에 닫혔다 (한 장 기도가 한 번도 감춰지지 않음 = 깜빡임 없음)', seq.indexOf('close') >= 0 && !seq.slice(0, seq.indexOf('close')).includes('peek:false') && (await p.evaluate(() => window._hid)) === 0, [seq, await p.evaluate(() => window._hid)]);
  // ⑥ 다음에 열면 다시 불투명(평소) — 투명한 채 남으면 위가 움직일 때마다 아래 앱까지 그려 느려진다
  await p.evaluate(() => embedOpen('bible', 1, 1)); await sleep(800);
  ok('⑥ 다음에 열면 비침이 꺼진 평소 모양', await fr.evaluate(() => !document.documentElement.classList.contains('b7-peek')));
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close();
})();
