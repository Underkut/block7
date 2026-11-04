// 기도노트 여러 줄 붙여넣기 → 여러 개 한꺼번에 (HB 2026-11-04, pray v. 26-1104-2).
// ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서: python3 -m http.server 5502 &   node tests/e2e/pray_multi_paste.js
// 이름은 지어낸 것. 지키는 것:
//  ① 지도 카드 맨 아래 칸에 세 줄 → 묻는 판 → '나눠 넣기' = 항목 3개 · 두 번 안 들어감 · 되돌리기 한 번에 다 빠짐
//  ② 그룹 상세 '항목 더하기' 칸 · ③ 기도제목 더하기 칸 · ④ 구분 · 분류
//  ⑤ 새 그룹 · 새 서브 그룹 판 (판을 닫고 묻는다) · ⑥ 새로 추가(사람) — 고른 구분 그대로
//  ⑦ '한 줄로 넣기' = 이어 붙인 한 개 · 닫기 = 안 넣음 · 한 줄 붙여넣기는 묻지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/pray/index.html';
let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
const seed = p => p.evaluate(() => {
  closeSheet(true); if (typeof closeAllLayers === 'function') closeAllLayers();
  DB.G = []; DB.T = DB.T.filter(t => t.kind !== 'person');
  const mk = (n, id) => { const t = newTarget('person', n); t.id = id; DB.T.push(t); return { id: 'L' + id, segs: [[t.id]], r: {}, text: '' }; };
  const A = newGroup('청년부', '#d9534f'); A.id = 'gA'; A.lines = [mk('가온', 'p1')];
  DB.G.push(A); DB.set.mapDepth = 3; UI.mapEdit = null; save(); document.querySelector('.tb[data-tab="map"]').click();
});
const paste = (p, sel, txt) => p.evaluate(([sel, txt]) => {
  const el = document.querySelector(sel); el.focus();
  const dt = new DataTransfer(); dt.setData('text/plain', txt);
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
  el.dispatchEvent(ev);
  return { prevented: ev.defaultPrevented, v: el.value };
}, [sel, txt]);
const sheet = p => p.evaluate(() => { const w = SHEET; return w ? w.querySelector('.sheet').innerText : ''; });
// 판의 단추를 누른다 — 아이폰처럼 칸이 먼저 포커스를 잃는다
const pick = async (p, v) => { await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await sleep(150); await p.evaluate(v => SHEET.querySelector('[data-a="pick"][data-v="' + v + '"]').click(), v); await sleep(400); };
const toastTxt = p => p.evaluate(() => document.getElementById('toast').innerText);
const lineNames = (p, gid) => p.evaluate(gid => findG(DB, gid).lines.map(l => lineToText(DB, l)), gid);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await p.waitForFunction(() => typeof DB === 'object');
  await seed(p); await sleep(600);

  ok('줄 나누기', JSON.stringify(await p.evaluate(() => mlLines('- 하나\n\n• 둘\r\n1. 셋\n3.5 넷'))) === JSON.stringify(['하나', '둘', '셋', '3.5 넷']));

  // ① 지도 카드 맨 아래 칸
  let r = await paste(p, '#v-map [data-addin="gA"]', '나래\n- 다온\n라온\n');
  let s = await sheet(p);
  ok('① 붙이면 묻는다 · 칸은 비운다', r.prevented && r.v === '' && /3줄/.test(s) && /항목 3개로 나눠 넣기/.test(s) && /한 줄로 넣기/.test(s), [r, s]);
  await pick(p, 'split');
  ok('① 나눠 넣기 = 항목 3개 (두 번 안 들어감)', (await lineNames(p, 'gA')).join() === '가온,나래,다온,라온', await lineNames(p, 'gA'));
  const t1 = await toastTxt(p);
  ok('① 토스트 · 되돌리기', /항목 3개를 넣었습니다/.test(t1) && /되돌리기/.test(t1), t1);
  await p.evaluate(() => document.querySelector('#toast button').click()); await sleep(300);
  ok('① 되돌리기 한 번 = 다 빠짐', (await lineNames(p, 'gA')).join() === '가온', await lineNames(p, 'gA'));

  // ⑦ 한 줄로 · 닫기 · 한 줄 붙여넣기
  await paste(p, '#v-map [data-addin="gA"]', '바다\n마을');
  await pick(p, 'one');
  ok('⑦ 한 줄로 넣기 = 한 개', (await lineNames(p, 'gA')).length === 2, await lineNames(p, 'gA'));
  await paste(p, '#v-map [data-addin="gA"]', '하늘\n별');
  await p.evaluate(() => closeSheet()); await sleep(400);
  ok('⑦ 닫기 = 안 넣음', (await lineNames(p, 'gA')).length === 2, await lineNames(p, 'gA'));
  r = await paste(p, '#v-map [data-addin="gA"]', '하나뿐\n');
  ok('⑦ 한 줄은 묻지 않는다', !r.prevented && !(await p.evaluate(() => !!SHEET)), r);
  await p.evaluate(() => { const i = document.activeElement; i.value = ''; i._last = ''; i.blur(); }); await sleep(300);

  // ② 그룹 상세 항목 더하기
  await seed(p); await sleep(300);
  await p.evaluate(() => pushLayer({ type: 'group', id: 'gA' })); await sleep(500);
  await paste(p, '.layer:last-child input[data-add="line"]', '소망\n믿음');
  await pick(p, 'split');
  ok('② 그룹 상세 항목 2개', (await lineNames(p, 'gA')).join() === '가온,소망,믿음', await lineNames(p, 'gA'));

  // ③ 기도제목
  await p.evaluate(() => { closeAllLayers(); pushLayer({ type: 'target', id: 'p1' }); }); await sleep(500);
  await paste(p, '.layer:last-child input[data-add="topic"]', '건강\n취업\n가정');
  s = await sheet(p);
  ok('③ 기도제목도 묻는다', /기도제목 3개로/.test(s), s);
  await pick(p, 'split');
  ok('③ 기도제목 3개', (await p.evaluate(() => findT(DB, 'p1').topics.map(x => x.t))).join() === '건강,취업,가정', await p.evaluate(() => findT(DB, 'p1').topics.map(x => x.t)));

  // ⑤ 새 그룹 · 새 서브 그룹
  await p.evaluate(() => closeAllLayers()); await sleep(300);
  await p.evaluate(() => ACT['add-group']()); await sleep(450);
  await paste(p, '#askIn', '조명팀\n음향팀');
  await sleep(500);
  s = await sheet(p);
  ok('⑤ 새 그룹 판을 닫고 묻는다', /그룹 2개로/.test(s), s);
  await pick(p, 'split');
  ok('⑤ 그룹 2개', (await p.evaluate(() => DB.G.map(g => g.name))).join() === '청년부,조명팀,음향팀', await p.evaluate(() => DB.G.map(g => g.name)));
  await p.evaluate(() => ACT['add-sub']({ dataset: { id: 'gA' } })); await sleep(450);
  await paste(p, '#askIn', '13세 가족\n14세 가족');
  await sleep(500); await pick(p, 'split');
  ok('⑤ 서브 그룹 2개 · 부모 gA', (await p.evaluate(() => DB.G.filter(g => g.parent === 'gA').map(g => g.name))).join() === '13세 가족,14세 가족');

  // ⑥ 새로 추가
  await p.evaluate(() => ACT['add-target']()); await sleep(450);
  const cat0 = await p.evaluate(() => (DB.cats.find(c => c.person) || {}).id || '');
  await paste(p, '#addName', '하람\n보람');
  await sleep(500); await pick(p, 'split');
  ok('⑥ 사람 2명 · 고른 구분 그대로', await p.evaluate(c => DB.T.filter(t => (t.name === '하람' || t.name === '보람') && t.kind === 'person' && t.cat === c).length, cat0) === 2);

  // ④ 구분 · 분류
  const nc = await p.evaluate(() => DB.cats.length);
  await p.evaluate(() => pushLayer({ type: 'cats', kind: 'cats' })); await sleep(500);
  const hasCats = await p.evaluate(() => !!document.querySelector('.layer:last-child input[data-add="cats"]'));
  if (hasCats) {
    await paste(p, '.layer:last-child input[data-add="cats"]', '이웃\n동료');
    await pick(p, 'split');
    ok('④ 구분 2개', await p.evaluate(() => DB.cats.length) === nc + 2);
  } else {
    ok('④ 구분 (칸을 직접 만들어 시험)', await p.evaluate(() => {
      const n0 = DB.cats.length; const t = mlTarget({ dataset: { add: 'cats' } }); t.add(['이웃', '동료']); return DB.cats.length === n0 + 2 && t.what === '구분';
    }));
  }

  await b.close();
  console.log(`\n${pass} 통과 · ${fail} 실패`);
  process.exit(fail ? 1 : 0);
})();
