// [풀|요약|한줄] 세그먼트 — 모든 전환(풀↔요약↔한줄)이 오류 없이 끝나고 남는 것(사본·움직임 판)이 없는지 (v. 26-1105-2)
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:  python3 -m http.server 5502 &   node tests/e2e/b7_fold_seg.js
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 1500, height: 900 } })).newPage();
  p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await p.waitForTimeout(1000);
  const type = await p.evaluate(() => { const L = _lay(); const m = _layMode(); return [m, document.body.classList.contains('split-d'), JSON.stringify(L.cols || L)].join('|').slice(0, 200); });
  console.log('배치', type);
  const t = await p.evaluate(() => { const w = document.querySelector('#pageContent .rp-widget .rp-fold-seg'); return w ? w.closest('.rp-widget').dataset.wtype : null; });
  if (!t) { console.log('세그먼트가 있는 위젯이 없다(배치 확인 필요)'); await b.close(); process.exit(1); }
  const seq = [[1, 'sum'], [2, 'line'], [1, 'sum'], [0, ''], [2, 'line'], [0, ''], [1, 'sum'], [0, '']];
  for (const [i, f] of seq) {
    await p.click(`#pageContent .rp-widget[data-wtype="${t}"] .rp-fold-seg button:nth-of-type(${i + 1})`);
    await p.waitForTimeout(1300);
    const r = await p.evaluate(ty => ({ f: _rpFoldOf(ty), on: [...document.querySelectorAll('#pageContent .rp-widget[data-wtype="' + ty + '"] .rp-fold-seg button')].findIndex(b => b.classList.contains('on')), junk: document.querySelectorAll('.rpf-morph,.rpf-meas').length, h: document.querySelector('#pageContent .rp-widget[data-wtype="' + ty + '"]').style.height }), t);
    ok(`→ ${f || '풀'}: 상태·버튼·찌꺼기`, r.f === f && r.on === i && r.junk === 0, r);
  }
  // 높이가 한 방향으로만 움직인다 — 줄어드는 전환에서 '툭 줄었다 → 다시 커졌다 → 또 툭' 하면 실패 (v. 26-1105-3 고친 것)
  for (const [from, i] of [['', 1], ['sum', 0], ['', 2], ['line', 0], ['line', 1], ['sum', 2]]) {
    await p.evaluate(([ty, f]) => { const L = _lay(); L.fold = L.fold || {}; if (f) L.fold[ty] = f; else delete L.fold[ty]; save(); renderLayout(); }, [t, from]);
    await p.waitForTimeout(500);
    const hs = await p.evaluate(([ty, i]) => new Promise(done => {
      const hs = [], t0 = performance.now();
      const f = () => { const w = document.querySelector('#pageContent .rp-widget[data-wtype="' + ty + '"]'); if (w) hs.push(w.getBoundingClientRect().height); if (performance.now() - t0 < 1000) requestAnimationFrame(f); else done(hs); };
      requestAnimationFrame(f);
      document.querySelector('#pageContent .rp-widget[data-wtype="' + ty + '"] .rp-fold-seg button:nth-of-type(' + (i + 1) + ')').click();
    }), [t, i]);
    const s0 = hs[0], s1 = hs[hs.length - 1], dir = Math.sign(s1 - s0);
    let back = 0; for (let k = 1; k < hs.length; k++) if (Math.sign(hs[k] - hs[k - 1]) === -dir && Math.abs(hs[k] - hs[k - 1]) > 1) back++;
    ok(`${from || '풀'} → ${['풀', '요약', '한 줄'][i]}: 높이가 되돌아가지 않음 (${Math.round(s0)} → ${Math.round(s1)})`, back === 0 && dir !== 0, hs.map(Math.round));
  }
  // 전환 중에 화면을 한 번 더 그려도(아이패드 주소창 resize → renderLayout) 네모 · 높이가 끊기지 않는다 (v. 26-1105-4 고친 것)
  for (const [from, i] of [['', 1], ['sum', 0]]) {
    await p.evaluate(([ty, f]) => { const L = _lay(); L.fold = L.fold || {}; if (f) L.fold[ty] = f; else delete L.fold[ty]; save(); renderLayout(); }, [t, from]);
    await p.waitForTimeout(600);
    const r = await p.evaluate(([ty, i]) => new Promise(done => {
      const xs = [], hs = [], t0 = performance.now();
      const f = () => {
        const w = document.querySelector('#pageContent .rp-widget[data-wtype="' + ty + '"]');
        const pl = w && w.querySelector('.rp-fold-seg .b7-seg-pill');
        if (w) hs.push(w.getBoundingClientRect().height);
        try { xs.push(new DOMMatrixReadOnly(getComputedStyle(pl).transform).m41); } catch (e) { }
        if (performance.now() - t0 < 900) requestAnimationFrame(f); else done({ xs, hs });
      };
      requestAnimationFrame(f);
      document.querySelector('#pageContent .rp-widget[data-wtype="' + ty + '"] .rp-fold-seg button:nth-of-type(' + (i + 1) + ')').click();
      setTimeout(() => renderLayout(), 160);
    }), [t, i]);
    let big = 0; for (let k = 1; k < r.xs.length; k++) if (Math.abs(r.xs[k] - r.xs[k - 1]) > 7) big++;
    const dir = Math.sign(r.hs[r.hs.length - 1] - r.hs[0]); let back = 0;
    for (let k = 1; k < r.hs.length; k++) if (Math.sign(r.hs[k] - r.hs[k - 1]) === -dir && Math.abs(r.hs[k] - r.hs[k - 1]) > 1) back++;
    // 높이: 한 프레임에 전체 변화의 30% 넘게(매끄러울 땐 많아야 20%) 뛰면 '툭'
    const span = Math.abs(r.hs[r.hs.length - 1] - r.hs[0]); let cut = 0; for (let k = 1; k < r.hs.length; k++) if (Math.abs(r.hs[k] - r.hs[k - 1]) > span * 0.3) cut++;
    ok(`${from || '풀'} → ${['풀', '요약'][i]} 중 다시 그리기: 네모가 툭 옮겨 가지 않음`, big === 0, r.xs.map(Math.round));
    ok(`${from || '풀'} → ${['풀', '요약'][i]} 중 다시 그리기: 높이가 끊기지 않음`, back === 0 && cut === 0, r.hs.map(Math.round));
  }
  // 연타: 끝나기 전에 다음을 눌러도 마지막 선택으로 끝난다
  for (const i of [1, 2, 0, 1]) { await p.click(`#pageContent .rp-widget[data-wtype="${t}"] .rp-fold-seg button:nth-of-type(${i + 1})`); await p.waitForTimeout(90); }
  await p.waitForTimeout(1500);
  const r2 = await p.evaluate(ty => ({ f: _rpFoldOf(ty), junk: document.querySelectorAll('.rpf-morph,.rpf-meas').length }), t);
  ok('연타 뒤 마지막(요약)으로 끝남', r2.f === 'sum' && r2.junk === 0, r2);
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
