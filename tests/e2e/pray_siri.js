// 기도노트 시리로 기도 넣기 — 진짜 서버 코드(b7siri.js → praysiri.js) + 기도노트(pray/index.html) 기기 셋을 에뮬레이터에 붙여 끝까지 (2026-10-30).
// ⚠️ check.sh 가 돌리지 않는다. 준비는 tests/e2e/pray_sync.js 머리말과 같되 emu 폴더에 npm i firebase-admin@12 firebase-functions@6 express@4 를 더한다.
//   NODE_PATH=<emu>/node_modules node tests/e2e/pray_sync.js 와 같이:  NODE_PATH=<emu>/node_modules node tests/e2e/pray_siri.js
// 로그인은 설정 화면을 거치지 않고 앱의 로그인 길(fbLoad → watchAuth → signIn)을 바로 부른다 (화면 단추 자리가 바뀌어도 시험이 멈추지 않게).
// 이름은 지어낸 것.
// 지키는 것:
//  ① 맞추고 나면 그룹 차림표(c/siridir)가 생긴다 — 그룹 이름만 (사람 이름 없음)
//  ② 설정 '주소 만들기'(화면 단추) → 서버가 기도노트 열쇠를 주고 이 기기에 주소가 남는다 · 시리로 기도 넣기 칸이 그려진다
//  ③ ⭐ 단축어 '기도 추가' — 열린 기기가 곧바로 그 자리 맨 위에 · 이미 있는 사람 카드 · 우체통은 빈다 · 토스트
//  ④ ⭐ 다시 묻기 — 첫 번째는 쓰지 않고 '다시 말해' → 둘째에 그룹만 말하면 들어간다
//  ⑤ 단축어 '기도 고르기' — 목록 → 새 서브그룹 → 차림표가 다시 써져 다음 목록에 보인다
//  ⑥ 두 번째도 못 알아들으면 '시리로 받은 기도'
//  ⑦ ⭐ 두 기기가 열려 있을 때 말 하나 → 한 번만
//  ⑧ ⭐ 아무 기기도 안 열렸을 때 온 말 → 빈 기기로 로그인하면 클라우드 자료와 함께 받는다. 지우지도 겹치지도 않는다
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'block7-8f24e';
const path = require('path');
const express = require('express');
const { chromium } = require('playwright-core');
require('firebase-admin/app').initializeApp({ projectId: 'block7-8f24e' });
const H = require(path.join(__dirname, '..', '..', 'wallet-functions', 'src', 'b7siri.js')).b7siri;
const FBDIR = path.join(require.resolve('firebase/package.json'), '..');
const APP = 'http://127.0.0.1:5501/pray/';
const FN = 'https://asia-northeast3-block7-8f24e.cloudfunctions.net', LOCAL = 'http://127.0.0.1:5511';
const AUTH = 'http://127.0.0.1:9099', FS = 'http://127.0.0.1:8080', PID = 'block7-8f24e';
const EXE = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0;
const ok = (name, cond, info) => { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000) { const t = Date.now(); while (Date.now() - t < ms) { try { const v = await fn(); if (v) return v; } catch (e) {} await sleep(300); } return null; }
const docUrl = p => FS + '/v1/projects/' + PID + '/databases/(default)/documents/' + p;
async function get(p) { const r = await fetch(docUrl(p), { headers: { Authorization: 'Bearer owner' } }); return r.json(); }
async function inboxLen(uid) { const d = await get('pray/' + uid + '/c/inbox'); return ((d.fields && d.fields.items && d.fields.items.arrayValue.values) || []).length; }
async function dirNames(uid) { const d = await get('pray/' + uid + '/c/siridir'); return ((d.fields && d.fields.g && d.fields.g.arrayValue.values) || []).map(v => v.mapValue.fields.n.stringValue); }
let URL_ = '';
async function siri(body) {
  const r = await fetch(URL_.replace(FN, LOCAL), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.text();
}
(async () => {
  const srv = express();
  srv.use('/b7siri', express.json(), express.text({ type: 'text/*' }), (req, res) => H(req, res));
  const server = srv.listen(5511);
  await fetch(FS + '/emulator/v1/projects/' + PID + '/databases/(default)/documents', { method: 'DELETE' });
  await fetch(AUTH + '/emulator/v1/projects/' + PID + '/accounts', { method: 'DELETE' });
  const uid = (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pray1234', returnSecureToken: true }) })).json()).localId;
  const browser = await chromium.launch({ executablePath: EXE });
  async function device(name) {
    const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
    await ctx.addInitScript(() => { window.PRAY_EMU = true; window.confirm = () => true; window.open = () => null; });
    await ctx.route(/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+-compat\.js)/, (route) => {
      const f = route.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
      route.fulfill({ path: path.join(FBDIR, f), contentType: 'application/javascript' });
    });
    // 앱이 부르는 진짜 서버 주소를 이 컴퓨터의 처리기로 돌린다
    await ctx.route(/cloudfunctions\.net\/b7siri/, async (route) => {
      const q = route.request();
      const r = await fetch(q.url().replace(FN, LOCAL), { method: q.method(), headers: q.headers(), body: q.postData() || undefined });
      route.fulfill({ status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'text/plain', 'access-control-allow-origin': '*' }, body: await r.text() });
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('   [' + name + ' 오류] ' + e.message));
    await page.goto(APP); await page.waitForFunction(() => typeof DB === 'object');
    return { ctx, page, name };
  }
  async function login(d) {
    await d.page.evaluate(async () => { await fbLoad(); watchAuth(); await FB.auth.signInWithEmailAndPassword('hb@example.com', 'pray1234'); });
    return until(() => d.page.evaluate(() => SY.user && SY.status === 'ok' && !SY.busy && !SY.pending));
  }
  const lines = (p, name) => p.evaluate(n => { const g = DB.G.find(x => x.name === n); return g ? g.lines.map(l => { const t = findT(DB, l.segs[0] && l.segs[0][0]); return t ? t.name + ':' + t.kind : l.text; }) : null; }, name);

  const A = await device('아이폰');
  await A.page.evaluate(() => {
    const g = newGroup('청년부', '#1f4f8f'); DB.G.push(g);
    const s = newGroup('1셀', '#1f4f8f'); s.parent = g.id; DB.G.push(s);
    const f = newGroup('가족', '#3f7a2e'); DB.G.push(f);
    const p = newTarget('person', '김가나'); DB.T.push(p); f.lines.push(normLine({ segs: [[p.id]] }));
    save();
  });
  ok('로그인 (아이폰)', await login(A));

  console.log('① 그룹 차림표');
  const d1 = await until(async () => { const n = await dirNames(uid); return n.indexOf('1셀') >= 0 && n; });
  ok('① 맞추고 나면 차림표가 생긴다 — 그룹 · 서브그룹 이름', d1 && ['청년부', '1셀', '가족'].every(x => d1.indexOf(x) >= 0), d1);
  ok('① 차림표에 사람 이름이 없다', d1 && d1.indexOf('김가나') < 0, d1);

  console.log('② 설정 — 주소 만들기');
  await A.page.click('[data-a="settings"]'); await sleep(500);
  ok('② 시리로 기도 넣기 칸이 그려진다', await A.page.evaluate(() => !!document.querySelector('[data-a="siri-make"]') && !!document.querySelector('[data-a="siri-help"]')));
  await A.page.evaluate(() => document.querySelector('[data-a="siri-make"]').click());
  const saved = await until(() => A.page.evaluate(() => siriSaved()));
  ok('② 주소가 이 기기에 남는다 (…/b7siri/pray?k=)', saved && /\/b7siri\/pray\?k=[A-Za-z0-9_-]{24}$/.test(saved.url), saved);
  ok('② 주소 복사 단추가 생긴다', await until(() => A.page.evaluate(() => !!document.querySelector('[data-a="siri-copy"]'))));
  URL_ = saved.url;
  await A.page.evaluate(() => { while (UI.layers.length) popLayer(); });

  console.log('③ 기도 추가 (한 번에 말하기)');
  const r1 = await siri({ text: '청년부에 1셀에 김가나라고 기도 추가해줘', try: '1' });
  ok('③ 시리 대답 — 들어간 자리', r1 === '청년부의 1셀에 넣었어요. 김가나', r1);
  ok('③ ⭐ 열린 기기 1셀 맨 위에 · 이미 있는 사람 카드', await until(async () => { const l = await lines(A.page, '1셀'); return l && l[0] === '김가나:person'; }), await lines(A.page, '1셀'));
  ok('③ 사람 카드가 새로 안 생겼다', await A.page.evaluate(() => DB.T.filter(t => t.name === '김가나').length) === 1);
  ok('③ 우체통이 빈다', await until(async () => (await inboxLen(uid)) === 0));
  ok('③ 토스트 — 시리에서', await A.page.evaluate(() => /시리에서 1개 들어왔습니다/.test(document.getElementById('toast').textContent)), await A.page.evaluate(() => document.getElementById('toast').textContent));

  console.log('④ 다시 묻기');
  const r2 = await siri({ text: '다라 회복이라고 추가해줘', try: '1' });
  ok('④ 첫 번째 — "다시 말해" · 쓰지 않는다', /다시 말해 주세요/.test(r2) && (await inboxLen(uid)) === 0, r2);
  const r3 = await siri({ text: '가족', prev: '다라 회복이라고 추가해줘' });
  ok('④ ⭐ 둘째에 그룹만 — 가족 맨 위에', r3 === '가족에 넣었어요. 다라 회복' && await until(async () => { const l = await lines(A.page, '가족'); return l && l[0] === '다라 회복:item'; }), [r3, await lines(A.page, '가족')]);

  console.log('⑤ 기도 고르기 (목록)');
  const l1 = (await siri({ list: '1' })).split('\n');
  ok('⑤ 그룹 목록', l1.join('|') === '청년부|가족|새 그룹 만들기', l1);
  const l2 = (await siri({ list: '1', g: '청년부' })).split('\n');
  ok('⑤ 그 그룹 목록', l2.join('|') === '여기에 바로 넣기|1셀|새 서브그룹 만들기', l2);
  const r4 = await siri({ g: '청년부', s: '새 서브그룹 만들기', text: '새가족' });
  ok('⑤ 새 서브그룹 — 청년부 아래 맨 위', r4 === '청년부에 서브그룹 새가족을 만들었어요.' && await until(() => A.page.evaluate(() => { const g = DB.G.find(x => x.name === '청년부'); return kidsOf(DB, g.id).map(k => k.name).join('|') === '새가족|1셀'; })), r4);
  ok('⑤ ⭐ 차림표가 다시 써져 다음 목록에 보인다', await until(async () => (await siri({ list: '1', g: '청년부' })).split('\n').indexOf('새가족') >= 0));
  const r5 = await siri({ g: '청년부', s: '새가족', text: '환영 준비' });
  ok('⑤ 고른 서브그룹에', r5 === '청년부의 새가족에 넣었어요. 환영 준비' && await until(async () => { const l = await lines(A.page, '새가족'); return l && l[0] === '환영 준비:item'; }), r5);

  console.log('⑥ 받은 기도');
  const r6 = await siri({ text: '어딘지 모름', prev: '청연뷰에 마바 이직이라고 추가' });
  ok('⑥ 두 번째도 못 알아들으면 받은 기도 — 시리가 그렇다고', /시리로 받은 기도/.test(r6), r6);
  ok('⑥ 지도 맨 위 받은 기도 그룹에 첫 말 그대로', await until(async () => { const l = await lines(A.page, '시리로 받은 기도'); return l && l[0] === '청연뷰에 마바 이직:item' && await A.page.evaluate(() => topGroups(DB)[0].name === '시리로 받은 기도'); }), await lines(A.page, '시리로 받은 기도'));

  console.log('⑦ 두 기기');
  const B = await device('아이패드');
  ok('로그인 (아이패드)', await login(B));
  ok('아이패드에 지금까지 것이 왔다', await until(async () => { const l = await lines(B.page, '새가족'); return l && l[0] === '환영 준비:item'; }));
  await siri({ text: '가족에 이사라고 추가', try: '1' });
  ok('⑦ 두 기기 모두 가족 맨 위에 이사', await until(async () => (await lines(A.page, '가족'))[0] === '이사:item' && (await lines(B.page, '가족'))[0] === '이사:item'));
  await sleep(3000);
  const cnt = await Promise.all([A, B].map(d => d.page.evaluate(() => DB.G.find(x => x.name === '가족').lines.filter(l => findT(DB, l.segs[0][0]).name === '이사').length)));
  ok('⑦ ⭐ 한 번만 (두 기기 모두 1줄)', cnt[0] === 1 && cnt[1] === 1, cnt);

  console.log('⑧ 아무 기기도 안 열렸을 때 → 빈 기기 로그인');
  const before = await A.page.evaluate(() => ({ g: DB.G.length, t: DB.T.length }));
  await A.ctx.close(); await B.ctx.close();
  const r8 = await siri({ text: '가족에 여행이라고 추가', try: '1' });
  ok('⑧ 받아 둔다 (우체통에 한 줄)', r8 === '가족에 넣었어요. 여행' && (await inboxLen(uid)) === 1, r8);
  const C2 = await device('새 기기');
  ok('⑧ 빈 기기 로그인', await login(C2));
  ok('⑧ ⭐ 클라우드 자료가 다 오고 받은 것이 맨 위에', await until(async () => { const l = await lines(C2.page, '가족'); return l && l[0] === '여행:item' && l[1] === '이사:item'; }), await lines(C2.page, '가족'));
  const after = await C2.page.evaluate(() => ({ g: DB.G.length, t: DB.T.length, kids: kidsOf(DB, DB.G.find(x => x.name === '청년부').id).map(k => k.name) }));
  ok('⑧ ⭐ 지운 것 없음 — 그룹 수 그대로 · 카드는 하나 늘었다', after.g === before.g && after.t === before.t + 1 && after.kids.join('|') === '새가족|1셀', [before, after]);
  ok('⑧ 우체통이 빈다', await until(async () => (await inboxLen(uid)) === 0));

  await browser.close(); server.close();
  console.log('\n결과: 통과 ' + pass + ' / 실패 ' + fail);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
