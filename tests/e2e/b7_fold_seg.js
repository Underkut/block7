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
  // 연타: 끝나기 전에 다음을 눌러도 마지막 선택으로 끝난다
  for (const i of [1, 2, 0, 1]) { await p.click(`#pageContent .rp-widget[data-wtype="${t}"] .rp-fold-seg button:nth-of-type(${i + 1})`); await p.waitForTimeout(90); }
  await p.waitForTimeout(1500);
  const r2 = await p.evaluate(ty => ({ f: _rpFoldOf(ty), junk: document.querySelectorAll('.rpf-morph,.rpf-meas').length }), t);
  ok('연타 뒤 마지막(요약)으로 끝남', r2.f === 'sum' && r2.junk === 0, r2);
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
