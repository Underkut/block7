// 깔때기(글자 거르기) 단추 — 글자가 든 할일(@이름 포함)만 보이고, 다시 누르면 모두 보인다 (v. 26-1112-10).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_text_filter.js
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);
  ok('기본은 꺼짐 — 깔때기 단추 없음', await p.evaluate(() => !document.getElementById('btnTextFilter') && ST.settings.showTextFilterBtn === false), null);
  await p.evaluate(() => {
    const k = tKey();
    getBigs(k, 'am').push({ text: '@홍길동 전화', done: false, contactTask: true }, { text: '장보기', done: false });
    getBigs(k, 'pm').push({ text: '병원', done: false, memo: '심방 준비' }, { text: '청소', done: false });
    ST.vis = ['am', 'pm', 'night']; ST.preset = null; save();
    updateSetting('showTextFilterBtn', true);
    renderToday();
  });
  await sleep(400);
  const texts = () => p.evaluate(() => [...document.querySelectorAll('.bi-inp')].filter(e => e.offsetParent).map(e => e.value || e.textContent));
  const btn = () => p.evaluate(() => { const e = document.getElementById('btnTextFilter'); return e && { on: e.classList.contains('on'), svg: !!e.querySelector('svg path[d^="M3 4.5h18"]'), last: e === [...e.parentNode.querySelectorAll('.preset-btn')].pop() }; });
  let bt = await btn();
  ok('깔때기 단추가 나타남 · 채워진 모양 · 단추들 중 맨 끝', bt && bt.svg && bt.last && !bt.on, bt);
  // 글자가 비어 있으면 눌러도 안 켜진다
  await p.click('#btnTextFilter'); await sleep(300);
  ok('글자가 비면 켜지지 않음', await p.evaluate(() => ST.preset !== 'textFilter'), null);
  // 설정 글자를 정하고 누르기
  await p.evaluate(() => updateSetting('textFilterQuery', '홍길동, 심방'));
  await p.click('#btnTextFilter'); await sleep(400);
  let t = await texts();
  ok('켜면 글자 든 할일만 (@이름 · 메모)', t.includes('@홍길동 전화') && t.includes('병원') && !t.includes('장보기') && !t.includes('청소'), t);
  bt = await btn(); ok('켜진 단추 표시', bt.on, bt);
  await p.click('#btnTextFilter'); await sleep(400);
  t = await texts();
  ok('다시 누르면 모든 할일', t.includes('장보기') && t.includes('청소') && (await p.evaluate(() => ST.preset)) === null, t);
  // 켠 채로 설정에서 단추를 끄면 풀린다
  await p.click('#btnTextFilter'); await sleep(300);
  await p.evaluate(() => updateSetting('showTextFilterBtn', false)); await sleep(300);
  ok('단추를 감추면 거르기도 풀림', await p.evaluate(() => ST.preset === null && !document.getElementById('btnTextFilter')), null);
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
