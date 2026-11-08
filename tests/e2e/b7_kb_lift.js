// 1108 — 자판이 맨 아래 할일 칸을 가리지 않게 (HB 2026-11-08, 아이패드 사진)
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_kb_lift.js
// 크롬에는 화면 자판이 없어 visualViewport 를 가짜로 바꿔 '자판이 뜬 모양' 을 흉내 낸다.
// 두 가지 기기 모양을 다 본다:
//   A) 자판이 떠도 innerHeight 는 그대로 (아이폰 사파리식)
//   B) 자판이 뜨면 innerHeight 도 함께 줄어든다 (v. 26-1108-3/4 는 여기서 '자판 0' 으로 읽어 아무것도 안 했다)
// 그리고 화면 폭 둘 — 넓은 화면(아이패드)은 왼쪽 할일 칸(#colL)이 제 상자 안에서 스크롤된다.
//   v. 26-1108-3/4 는 문서만 밀어 이 칸이 꿈쩍도 안 했다 (HB '전혀 안 움직여').
// 지키는 것:
//  ① 맨 아래 짧은 할일을 누르면 칸이 자판(보이는 창) 위로 올라온다
//  ② 맨 아래 긴 할일(여러 줄 칸으로 바뀌는 것)을 눌러도 올라온다
//  ③ 자판이 내려가면 아래 여백(--kb-pad)이 사라진다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const H = 700, KB = 380;
const fakeVV = (mode) => `(() => {
  const H=${H},KB=${KB},mode='${mode}';
  const et=new EventTarget();
  const vv={height:H,width:innerWidth,offsetTop:0,offsetLeft:0,scale:1,
    get pageTop(){return scrollY;},get pageLeft(){return scrollX;},
    addEventListener:(...a)=>et.addEventListener(...a),removeEventListener:(...a)=>et.removeEventListener(...a)};
  Object.defineProperty(window,'visualViewport',{get:()=>vv,configurable:true});
  let up=false;
  if(mode==='B'){const d=Object.getOwnPropertyDescriptor(window,'innerHeight')||{};const g=d.get?d.get.bind(window):()=>H;
    Object.defineProperty(window,'innerHeight',{get:()=>up?H-KB:g(),configurable:true});}
  const typing=el=>el&&(el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&/^(text|)$/.test(el.type||'')));
  const sync=()=>setTimeout(()=>{const u=typing(document.activeElement);if(u===up)return;up=u;vv.height=u?H-KB:H;et.dispatchEvent(new Event('resize'));},40);
  document.addEventListener('focusin',sync,true);document.addEventListener('focusout',sync,true);
})();`;
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const LONG = '@디자인스아웃 간판 전기 진행 ㅊ 완료했고, 이제 남은 것은 결재와 일정 조율 그리고 현장 확인까지 전부';
  // 760 = 아이패드처럼 두 칸(왼쪽 할일 칸이 제 상자 안에서 스크롤) · 390 = 휴대폰(문서 전체가 스크롤)
  for (const [mode, W] of [['A', 760], ['B', 760], ['A', 390], ['B', 390]]) {
    console.log(`── 모양 ${mode} · 폭 ${W} ──`);
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: W, height: H }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(fakeVV(mode));
    const p = await ctx.newPage(); p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await sleep(1500);
    await p.evaluate(LONG => {
      const B = getBigs(tKey(), 'am'); B.length = 0;
      for (let i = 0; i < 14; i++) B.push({ text: '채움 ' + i, done: false });
      B.push({ text: '짧은 끝', done: false }, { text: LONG, done: false });
      save(); renderToday();
    }, LONG);
    await sleep(400);
    const tap = (t) => p.evaluate(t => {
      document.activeElement && document.activeElement.blur && document.activeElement.blur();
      window.scrollTo(0, document.scrollingElement.scrollHeight);   // 맨 아래까지 내린 채 (HB 사진처럼)
      const inp = [...document.querySelectorAll('#todayView .bi-inp')].find(x => x.value === t);
      inp.focus({ preventScroll: true });
      return { ovf: inp.classList.contains('ovf') };
    }, t);
    const where = () => p.evaluate(() => {
      const a = document.activeElement, r = a.getBoundingClientRect(), vv = visualViewport;
      return { tag: a.tagName, bottom: Math.round(r.bottom), room: Math.round(vv.offsetTop + vv.height), pad: document.documentElement.style.getPropertyValue('--kb-pad') };
    });
    // 맨 아래 칸이 '자판' 밑에 있는지 대조 — 자판이 없다고 쳤을 때 이미 가려지는 자리여야 시험이 뜻이 있다
    for (const [name, t] of [['① 짧은 할일', '짧은 끝'], ['② 긴 할일', LONG]]) {
      const info = await tap(t); await sleep(1300);
      const w = await where();
      if (name.startsWith('②')) ok(`${name}: 여러 줄 칸으로 바뀜 (ovf=${info.ovf})`, info.ovf && w.tag === 'TEXTAREA', w);
      ok(`${name}: 자판 위로 올라옴 (칸 아래 ${w.bottom} ≤ 보이는 창 ${w.room})`, w.bottom <= w.room, w);
      ok(`${name}: 아래 여백 생김`, !!w.pad, w);
    }
    await p.evaluate(() => document.activeElement.blur()); await sleep(1000);
    const after = await p.evaluate(() => ({ ae: document.activeElement.tagName + '.' + document.activeElement.className, pad: document.documentElement.style.getPropertyValue('--kb-pad'), sp: document.querySelectorAll('.kb-spacer').length }));
    ok('③ 자판 내리면 여백 없어짐', !after.pad && !after.sp, after);
    await ctx.close();
  }
  await b.close();
  console.log(`결과: 통과 ${pass} / 실패 ${fail}`); process.exit(fail ? 1 : 0);
})();
