// 요약 · 한 줄 위젯의 가로폭을 '연속으로' 끌 때 번쩍이지 않는지 (v. 26-1102-11, HB 지적).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:  python3 -m http.server 5502 &   node tests/e2e/b7_fold_width.js
// 까닭: 폭을 띄엄띄엄(700 → 640 → 600) 바꿔 보면 멀쩡해 보였는데, 실제로 끌면 폭이 매 프레임 바뀐다.
//   옅어지는 복제본(.rpf-ghost)을 '새로 나타난 조각'으로 다시 세어서, 복제본이 사라질 때 또 복제본이 생기는 연쇄가 끄는 내내 이어졌다(3초에 553회).
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  for (const mode of ['sum', 'line']) {
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 1500, height: 900 } })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await p.waitForTimeout(1000);
    await p.evaluate(mode => {
      const k = tKey();
      getBigs(k, 'am').push({ text: 'PD 준비', flag: true }, { text: 'PD 체크리스트 만들기', flag: true });
      getBigs(k, 'pm').push({ text: '교회 보고서 작성', flag: true }, { text: 'GPT 자동화', flag: true });
      for (let d = 0; d < 6; d++) { const dt = new Date(); dt.setDate(dt.getDate() + d); const kk = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); getEvents(kk, 'pm').push({ text: '일정 ' + d + 'A', time: '23:0' + d }, { text: '일정 ' + d + 'B', time: '23:3' + d }); }
      save(); const L = _lay(); L.fold = { monthSingle: mode }; save(); renderLayout();
      const st = document.createElement('style'); st.id = 'wset'; document.head.appendChild(st);
      window.__cnt = { anim: 0, ghost: 0 };
      const oa = Element.prototype.animate;
      Element.prototype.animate = function (kf) { if (Array.isArray(kf) && kf[0] && 'opacity' in kf[0]) { window.__cnt.anim++; if (this.classList.contains('rpf-ghost')) window.__cnt.ghost++; } return oa.apply(this, arguments); };
    }, mode);
    await p.waitForTimeout(400);
    // 700 → 400 → 700 을 3초 동안 프레임마다 조금씩
    const r = await p.evaluate(() => new Promise(done => {
      const sty = document.getElementById('wset'), t0 = performance.now(), D = 3000; let frames = 0, busy = 0, last = 0;
      (function f(t) {
        const x = (t - t0) / D; if (x >= 1) { done({ cnt: window.__cnt, frames, busy }); return; }
        const wd = 700 - 300 * (1 - Math.abs(2 * x - 1));
        sty.textContent = '.rp-widget[data-wtype="monthSingle"]{width:' + wd.toFixed(1) + 'px!important;max-width:none!important}';
        requestAnimationFrame(() => { frames++; if (window.__cnt.anim !== last) { busy++; last = window.__cnt.anim; } });
        requestAnimationFrame(f);
      })(t0);
    }));
    console.log(`${mode}: 효과 ${r.cnt.anim}회 · 복제본 ${r.cnt.ghost} · 프레임 ${r.frames}개 중 효과가 시작된 프레임 ${r.busy}개`);
    ok(mode + ': 연속으로 끌어도 효과가 문턱을 넘을 때만 (연쇄 없음)', r.cnt.anim < 90 && r.busy < 20, r);
    // 끌기를 멈추면 복제본이 남지 않는다
    await p.waitForTimeout(500);
    ok(mode + ': 멈춘 뒤 복제본이 남지 않음', await p.evaluate(() => document.querySelectorAll('.rpf-ghost').length) === 0);
    await p.context().close();
  }
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
