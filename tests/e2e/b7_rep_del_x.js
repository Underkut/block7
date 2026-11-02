// HB 2026-11-02 — 반복 할일을 줄 끝 × 로 지울 때도 "어디까지" 를 묻는다 (v. 26-1102-13)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_rep_del_x.js
// 까닭: 밀어 지우기 · 메뉴 · 키보드는 _taskDeleteAt(범위 묻기)을 지나는데 × 단추만 바로 지웠다.
// 지키는 것: 매주 · 매일 / 큰 · 작은 할일 × → 세 갈래 창 → 고른 대로 지워진다 · 반복 아닌 할일은 묻지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await sleep(1500);
  const asked = () => p.evaluate(() => document.getElementById('repScopeModal').style.display === 'block');
  // 오늘 할일을 세우고 반복을 건다 → n 일 뒤로 가서 그 날 회차를 × 로 지운다
  const run = async (type, kind, days, scope) => {
    await p.evaluate(([type, kind]) => {
      viewDate = new Date(); viewDate.setHours(0, 0, 0, 0);
      const k = tKey(); ['am'].forEach(s => { getBigs(k, s).length = 0; getSmalls(k, s).length = 0; });
      (type === 'big' ? getBigs(k, 'am') : getSmalls(k, 'am')).push({ text: '반복' + kind + type, done: false });
      save(); renderToday();
      _taskSetRepeat(type, 'am', 0, kind);
    }, [type, kind]);
    await p.evaluate(d => { viewDate.setDate(viewDate.getDate() + d); renderToday(); }, days); await sleep(300);
    const n = await p.evaluate(([type, kind]) => {
      const rows = [...document.querySelectorAll('.blk-del')].filter(x => { const f = x.parentElement.querySelector('input,textarea'); return f && f.value === '반복' + kind + type; });
      if (!rows.length) return 0; rows[0].click(); return rows.length;
    }, [type, kind]);
    ok(`${type} ${kind} — ${days}일 뒤 회차에 × 가 있다`, n > 0, n);
    await sleep(250);
    ok(`${type} ${kind} — × 를 누르면 세 갈래를 묻는다`, await asked());
    await p.evaluate(sc => _repScopePick(sc), scope); await sleep(400);
  };
  // 그 날 화면에 반복 할일이 보이는가 (반복은 그려질 때 생긴다 → renderToday 뒤 DOM 으로 본다)
  const shows = async (off, kind, type) => p.evaluate(([off, kind, type]) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); viewDate = d; renderToday();
    return [...document.querySelectorAll('#pageWrap input, #pageWrap textarea')].some(x => x.value === '반복' + kind + type);
  }, [off, kind, type]);

  // 매주 · 큰 할일 · '이 일정만' → 그 주만 빠지고 그 다음 주는 남는다
  await run('big', 'w', 7, 'one');
  ok('매주 · 이 일정만: 다음 주는 빠진다', !(await shows(7, 'w', 'big')));
  ok('매주 · 이 일정만: 2주 뒤는 남는다', await shows(14, 'w', 'big'));
  ok('매주 · 이 일정만: 오늘 원본은 남는다', await shows(0, 'w', 'big'));
  // 매주 · 작은 할일 · '이후' → 그 주부터 모두 빠진다
  await run('small', 'w', 7, 'future');
  ok('매주 · 이후: 다음 주 · 2주 뒤 모두 빠진다', !(await shows(7, 'w', 'small')) && !(await shows(14, 'w', 'small')));
  ok('매주 · 이후: 오늘은 남는다', await shows(0, 'w', 'small'));
  // 매일 · 큰 할일 · '모두'
  await run('big', 'd', 1, 'all');
  ok('매일 · 모두: 오늘 · 내일 · 모레 모두 빠진다', !(await shows(0, 'd', 'big')) && !(await shows(1, 'd', 'big')) && !(await shows(2, 'd', 'big')));
  // 매일 · 작은 할일 · '이 일정만'
  await run('small', 'd', 1, 'one');
  ok('매일 · 이 일정만: 내일만 빠지고 모레는 남는다', !(await shows(1, 'd', 'small')) && await shows(2, 'd', 'small'));
  // 반복 아닌 할일은 묻지 않고 바로 지운다
  await p.evaluate(() => { viewDate = new Date(); viewDate.setHours(0, 0, 0, 0); const k = tKey(); getBigs(k, 'am').length = 0; getBigs(k, 'am').push({ text: '한번', done: false }); save(); renderToday(); });
  await p.evaluate(() => document.querySelector('.blk-del').click()); await sleep(300);
  ok('반복 아님: 묻지 않고 바로 지운다', !(await asked()) && await p.evaluate(() => getBigs(tKey(), 'am').length === 0));
  console.log(`\n${pass} 통과 / ${fail} 실패`); await b.close(); process.exit(fail ? 1 : 0);
})();
