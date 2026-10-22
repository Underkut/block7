// BLOCK7 행보다 긴 할일 — 줄이기 · 흐르기 · 그대로 + 고칠 때 여러 줄 칸 (H-6, v. 26-1022-2).
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_long_task.js
// 지키는 것:
//  ① 줄이기: 넘치는 줄만 글자가 작아지고 짧은 줄은 그대로 · 바닥(10px)까지 줄여도 모자라면 흐른다
//  ② 흐르기: 글자 크기 그대로 흐른다 · ③ 그대로: 예전 모양(손대지 않음)
//  ④ 넘치는 줄을 누르면 여러 줄 칸 · 행이 높아진다 · 짧은 줄은 예전 한 줄 칸
//  ⑤ 쓰면 바로 저장 · Enter 로 끝 · Esc 는 되돌림 · 바깥을 누르면 끝
//  ⑥ 반복 할일 '어디까지 바꿀까' 에 원래 글이 그대로 간다 (onfocus 를 떼어 두는 까닭)
//  ⑦ 화면 폭이 바뀌면 다시 잰다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);
  const LONG = '10/25 라이프라인 예배인도 준비 및 찬양 콘티 정리하고 악보 인쇄';
  await p.evaluate(L => {
    const arr = getBigs(tKey(), 'am');
    arr.push({ text: L, done: false }, { text: '짧은 할일', done: false }, { text: '8244 교통민원 24 19건 국세청 경찰청 연락', done: false });
    save(); renderToday();
  }, LONG);
  const st = () => p.evaluate(() => [...document.querySelectorAll('.bi-inp')].map(i => ({ ovf: i.classList.contains('ovf'), mq: i.classList.contains('mq'), fs: i.style.fontSize, w: i.offsetWidth })));
  await p.evaluate(() => updateSetting('taskOverflow', 'shrink')); await sleep(700);
  let s = await st();
  ok('① 줄이기: 넘치는 줄만 작아진다', s[2].ovf && s[2].fs && !s[2].mq && !s[1].ovf && !s[1].fs, s);
  ok('① 줄이기: 바닥까지 줄여도 모자라면 흐른다', s[0].fs === '10px' && s[0].mq, s[0]);
  await p.evaluate(() => updateSetting('taskOverflow', 'scroll')); await sleep(700);
  s = await st(); ok('② 흐르기: 크기 그대로 흐른다', !s[0].fs && s[0].mq && !s[2].fs && s[2].mq && !s[1].mq, s);
  await p.evaluate(() => updateSetting('taskOverflow', 'clip')); await sleep(700);
  s = await st(); ok('③ 그대로: 손대지 않는다', s.every(x => !x.fs && !x.mq), s);
  ok('설정 단추 표시', await p.evaluate(() => document.getElementById('taskOvf_clip').classList.contains('active') && !document.getElementById('taskOvf_shrink').classList.contains('active')));
  await p.evaluate(() => updateSetting('taskOverflow', 'shrink')); await sleep(700);
  const at = async k => p.evaluate(k => { const r = document.querySelectorAll('.bi-inp')[k].getBoundingClientRect(); return [r.left + 20, r.top + r.height / 2]; }, k);
  const h0 = await p.evaluate(() => document.querySelector('.big-item').offsetHeight);
  let c = await at(0); await p.touchscreen.tap(c[0], c[1]); await sleep(500);
  const e = await p.evaluate(() => [document.activeElement.className, document.querySelector('.big-item').offsetHeight]);
  ok('④ 넘치는 줄을 누르면 여러 줄 칸 · 행이 높아진다', e[0] === 'task-lta' && e[1] > h0 + 10, [e, h0]);
  await p.keyboard.type(' 추가');
  ok('⑤ 쓰면 바로 저장', await p.evaluate(() => getBigs(tKey(), 'am')[0].text.endsWith(' 추가')));
  await p.keyboard.press('Enter'); await sleep(400);
  ok('⑤ Enter 로 끝 — 한 줄로 돌아온다', await p.evaluate(() => !document.querySelector('.task-lta') && document.querySelector('.bi-inp').style.display === ''));
  c = await at(0); await p.touchscreen.tap(c[0], c[1]); await sleep(400);
  await p.keyboard.type('XYZ'); await p.keyboard.press('Escape'); await sleep(300);
  ok('⑤ Esc 는 되돌린다', await p.evaluate(() => getBigs(tKey(), 'am')[0].text.endsWith(' 추가')));
  c = await at(0); await p.touchscreen.tap(c[0], c[1]); await sleep(400);
  await p.keyboard.type('!'); await p.touchscreen.tap(200, 830); await sleep(400);
  ok('⑤ 바깥을 누르면 끝 · 저장', await p.evaluate(() => getBigs(tKey(), 'am')[0].text.endsWith('추가!') && !document.querySelector('.task-lta')));
  c = await at(1); await p.touchscreen.tap(c[0], c[1]); await sleep(300);
  ok('④ 짧은 줄은 예전 한 줄 칸', await p.evaluate(() => document.activeElement.className === 'bi-inp'));
  await p.evaluate(() => document.activeElement.blur()); await sleep(300);
  await p.evaluate(() => { window._ttc = []; const o = _taskTextCommit; window._taskTextCommit = function (t, s, i, a, b) { _ttc.push([a, b]); return o.apply(this, arguments); }; });
  c = await at(0); await p.touchscreen.tap(c[0], c[1]); await sleep(400);
  const before = await p.evaluate(() => getBigs(tKey(), 'am')[0].text);
  await p.keyboard.type('#'); await p.keyboard.press('Enter'); await sleep(300);
  const t = await p.evaluate(() => _ttc[_ttc.length - 1]);
  ok('⑥ 반복 할일 묻기에 원래 글 · 새 글', t && t[0] === before && t[1] === before + '#', t);
  await p.setViewportSize({ width: 700, height: 900 }); await sleep(900);
  s = await st(); ok('⑦ 폭이 넓어지면 다시 잰다 (짧아진 줄은 덜 줄이거나 그대로)', !s[2].ovf || parseFloat(s[2].fs || '16') > 12, s);
  console.log('통과 ' + pass + ' / 실패 ' + fail);
  await b.close(); process.exit(fail ? 1 : 0);
})();
