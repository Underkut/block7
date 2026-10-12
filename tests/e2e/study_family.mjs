// 공부 친구들 가족 연결(S-3) · 알림 예약(S-4) · 허락권(S-5) — 진짜 브라우저 여러 대 + 파이어베이스 에뮬레이터로 돌려 본다.
// ⚠️ check.sh 가 돌리지 않는다 (자바 · 에뮬레이터 · 크로미움이 필요). 가족·클라우드 쪽을 고칠 때 손으로 돌린다.
//
// 준비 (한 번):
//   mkdir emu && cd emu && npm i firebase-tools@13 firebase@10.12.2 playwright
//   docs/study/firebase-setup.md 의 규칙 덩어리를 rules_version/service/match 로 감싸 firestore.rules 로 저장하고 firebase.json 을 만든다
//     { "firestore": { "rules": "firestore.rules" },
//       "emulators": { "auth": { "port": 9099 }, "firestore": { "port": 8080 }, "ui": { "enabled": false }, "singleProjectMode": true } }
//   npx firebase emulators:start --only auth,firestore --project block7-8f24e
//   (저장소 맨 위에서) npx http-server -p 8765 -s .
// 돌리기:  node tests/e2e/study_family.mjs <사진 저장 폴더> <emu>/node_modules/firebase
//   (playwright 를 찾지 못하면 아래 import 줄의 경로를 emu/node_modules/playwright/index.mjs 로)
//
// 시나리오: 부모 가입 → 아이 계정 만들기(부모 로그인 유지 · 같은 아이디 막힘) → 기기 안에서 쓰던 아이 폰 로그인(빈 클라우드라 그대로 올림)
//   → 보내기(사진) → 부모 확인(도장 · 별 · 코인 · 허락권) → 아이 반영 한 번만 → 보안 규칙 → 알림 예약 → 빈 기기 로그인 = 되살리기(클라우드 안 비움)
//   → 약속 → 용돈 친구들 아이 폰이 허락권 받기(용돈 +N원은 받을 예정 돈 한 번) → '썼어요' 가 공부 친구들에 보인다
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const OUT = process.argv[2], FBDIR = process.argv[3];
const B = 'http://127.0.0.1:8765';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ok = [], bad = [];
const check = (name, cond, extra) => { (cond ? ok : bad).push(name + (cond ? '' : ' :: ' + JSON.stringify(extra))); console.log(cond ? '  ✓' : '  ✗', name, cond ? '' : JSON.stringify(extra)); };
async function ctx(name) {
  const c = await br.newContext({viewport: {width: 390, height: 844}, timezoneId: 'Asia/Seoul', locale: 'ko-KR', serviceWorkers: 'block'});
  await c.addInitScript(() => { window.STUDY_EMU = true; window.WALLET_EMU = true; });
  await c.route('https://www.gstatic.com/firebasejs/**', r => { const f = r.request().url().split('/').pop(); r.fulfill({path: FBDIR + '/' + f, contentType: 'application/javascript'}); });
  await c.route(/cloudfunctions\.net|127\.0\.0\.1:5001/, r => r.fulfill({status: 200, body: '{"ok":true}', contentType: 'application/json'}));
  const p = await c.newPage();
  p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  p.on('dialog', d => d.accept(d.type() === 'prompt' ? '' : undefined));
  p.tag = name; return p;
}
const wait = (p, fn, arg, ms) => p.waitForFunction(fn, arg, {timeout: ms || 15000});
const shot = (p, n) => p.screenshot({path: OUT + '/' + n + '.png'});

// ── 부모님 가입 → 아이 계정 만들기 ──
const par = await ctx('parent');
await par.goto(B + '/study/');
await par.click('#hGear'); await par.click('#fPar'); await par.click('#plSw');
await par.fill('#plEm', 'mom@test.com'); await par.fill('#plPw', 'secret123'); await par.click('#plGo');
await wait(par, () => document.getElementById('parent').classList.contains('on'));
await par.click('[data-t="acct"]'); await par.click('#paNew');
await par.fill('#kaName', '루루'); await par.fill('#kaId', 'ruru'); await par.fill('#kaPw', '123456'); await par.click('#kaGo');
await wait(par, () => !document.getElementById('sheet').classList.contains('on'), null, 20000);
await wait(par, () => document.getElementById('pBody').textContent.includes('ruru'));
check('부모: 아이 계정이 목록에 보인다 (아이디 ruru)', true);
check('부모: 아이 계정을 만들어도 부모 로그인이 그대로', await par.evaluate(() => FB.auth.currentUser && FB.auth.currentUser.email === 'mom@test.com'));
await shot(par, 'p-acct');
// 같은 아이디 다시 → 막힌다
await par.click('#paNew'); await par.fill('#kaName', '루루2'); await par.fill('#kaId', 'ruru'); await par.fill('#kaPw', '123456'); await par.click('#kaGo');
await par.waitForTimeout(1500);
check('부모: 같은 아이디는 못 만든다', (await par.textContent('#toast')).includes('이미 있는 아이디'), await par.textContent('#toast'));
await par.click('#sheet [data-close]');

// ── 아이 폰: 먼저 기기 안에서 쓰다가(문제집 1 · 기록 1) 로그인 ──
const kid = await ctx('kid');
await kid.clock.install({time: new Date('2026-10-12T16:00:00+09:00')});
await kid.goto(B + '/study/');
await kid.click('[data-a="newBook"]'); await kid.fill('#beName', '디딤돌 5-2'); await kid.fill('#beFirst', '8'); await kid.fill('#beLast', '111'); await kid.fill('#beCur', '34'); await kid.click('#beSave');
await kid.click('[data-a="start"]'); await kid.clock.runFor(1000);
await kid.evaluate(() => { S.run.acc = 30 * 60000; S.run.seg = Date.now(); save(); });
await kid.click('#tmEnd'); await kid.click('#dnGo');
check('아이: 로그인 전에는 \'기록하기\' (보내기 없음)', await kid.evaluate(() => S.sessions[0].status === 'saved'));
await kid.click('#hGear'); await kid.click('#fKid');
await kid.fill('#klId', 'ruru'); await kid.fill('#klPw', '999999'); await kid.click('#klGo'); await kid.waitForTimeout(1500);
check('아이: 숫자가 틀리면 못 들어간다', (await kid.textContent('#toast')).includes('달라요'), await kid.textContent('#toast'));
await kid.fill('#klPw', '123456'); await kid.click('#klGo');
await wait(kid, () => FAM && FAM.role === 'kid');
check('아이: 로그인 → 가족 · kidId · 이름', await kid.evaluate(() => FAM.name === '루루' && !!FAM.kidId));
await kid.clock.runFor(3000); await kid.waitForTimeout(1500);
await wait(kid, () => FAM.last > 0, null, 15000);
check('아이: 이 폰 기록이 클라우드에 올라감 (빈 클라우드라 묻지 않음)', true);

// 새 공부 → 보내기 (사진 포함)
await kid.evaluate(() => { S.tasks.push({id: 'tx1', title: '받아쓰기', date: todayStr(), time: '', dur: 10, subj: 'kor'}); save(); render(); });
await kid.click('[data-a="start"][data-k="t:tx1"]');
await kid.evaluate(() => { S.run.acc = 12 * 60000; save(); });
await kid.click('#tmEnd');
check('아이: 로그인 뒤에는 \'엄마 아빠에게 보내기\'', (await kid.textContent('#dnGo')).includes('보내기'));
await kid.setInputFiles('#dnPhoto', {name: 'p.png', mimeType: 'image/png', buffer: fs.readFileSync(new URL('../../study/icon-192.png', import.meta.url))});
await kid.waitForTimeout(500);
await kid.click('#dnGo'); await kid.clock.runFor(3000); await kid.waitForTimeout(2500);
check('아이: 보낸 기록은 sent', await kid.evaluate(() => S.sessions.find(s => s.key === 't:tx1').status === 'sent'));
await shot(kid, 'k-sent');

// ── 부모: 확인할 것 → 도장 · 별 2 · 코인 20 · 허락권(간식) ──
await par.click('[data-t="todo"]');
await wait(par, () => document.querySelectorAll('#pBody [data-sid]').length === 1, null, 20000);
check('부모: 보낸 것 1개만 (기록만 한 것은 아래 따로)', await par.evaluate(() => document.getElementById('pBody').textContent.includes('보내지 않고 기록만 한 것')));
await par.click('#pBody [data-ph] button'); await par.waitForSelector('#pBody img.pphoto');
check('부모: 채점 사진이 보인다', true);
await par.click('#pBody [data-g="stamp"] [data-v="끝까지 했네"]'); await par.click('#pBody [data-g="stars"] [data-v="2"]'); await par.click('#pBody [data-g="coins"] [data-v="20"]');
await par.click('#pBody [data-g="grant"] [data-v="allow|간식 하나 허락|3000"]');
await par.fill('#pBody [data-g="text"]', '잘했어!');
await shot(par, 'p-review');
await par.click('#pBody [data-act="ok"]');
await wait(par, () => document.getElementById('pBody').textContent.includes('확인할 것이 없어요'), null, 15000);
check('부모: 확인 뒤 목록이 비고 \'최근 확인한 것\' 에', await par.evaluate(() => document.getElementById('pBody').textContent.includes('최근 확인한 것')));

// ── 아이: 별 · 도장 · 허락권 ──
await kid.waitForTimeout(3000);
await wait(kid, () => S.sessions.some(s => s.status === 'ok'), null, 15000);
const kr = await kid.evaluate(() => { const s = S.sessions.find(x => x.status === 'ok'); return {stars: starsOf(S), stamp: s.stamp, coins: S.coins, pmsg: s.pmsg, grants: GRANTS.length}; });
check('아이: 별 2 · 도장 · 코인(10+10+20) · 한마디 · 허락권 1', kr.stars === 2 && kr.stamp === '끝까지 했네' && kr.coins === 40 && kr.pmsg === '잘했어!' && kr.grants === 1, kr);
await kid.click('[data-tab="reward"]'); await kid.waitForTimeout(300); await shot(kid, 'k-reward');
// 다시 받아도 두 번 반영하지 않는다 (앱을 다시 연다)
await kid.reload(); await kid.waitForTimeout(4000);
check('아이: 다시 열어도 별·코인 그대로 (한 번만 반영)', await kid.evaluate(() => starsOf(S) === 2 && S.coins === 40));
await kid.clock.runFor(3000); await kid.waitForTimeout(1500);

// ── 보안 규칙: 아이는 확인을 못 쓰고, 다른 아이 칸을 못 본다 ──
const rule = await kid.evaluate(async () => {
  const r = {};
  try { await FB.db.collection('families/' + FAM.fid + '/sreviews').add({kidId: FAM.kidId, sid: 'x', status: 'ok', stars: 5}); r.revWrite = 'ok'; } catch (e) { r.revWrite = e.code; }
  try { await FB.db.doc('families/' + FAM.fid + '/study/k_other').get(); r.other = 'ok'; } catch (e) { r.other = e.code; }
  try { await FB.db.collection('families/' + FAM.fid + '/msgs').add({kidId: FAM.kidId, from: 'kid', type: 'grant', status: 'ok', at: firebase.firestore.FieldValue.serverTimestamp()}); r.grant = 'ok'; } catch (e) { r.grant = e.code; }
  return r;
});
check('규칙: 아이는 부모 확인을 못 쓴다', rule.revWrite === 'permission-denied', rule);
check('규칙: 아이는 다른 아이 공부를 못 본다', rule.other === 'permission-denied', rule);
check('규칙: 아이는 허락권을 스스로 못 만든다', rule.grant === 'permission-denied', rule);

// ── 알림 예약 (S-4): 토큰 등록 · 앞으로 3일 예약 · 미루면 다시 맞춘다 ──
const rem = await kid.evaluate(async () => {
  await memRef().update({stokens: FB.fv.arrayUnion('fake-token')}); FAM.push = 'fake-token'; famSave();
  S.books[0].time = '17:00'; save(); await syncReminders();
  const a = (await FB.db.collection('sremind').where('uid', '==', FB.auth.currentUser.uid).get()).docs.map(d => d.data());
  const q = questsFor(S, addDays(todayStr(), 2), todayStr())[0];
  return {n: a.length, first: a.map(x => x.at.toMillis()).sort()[0], url: a[0] && a[0].url, title: a[0] && a[0].title};
});
check('알림 예약: 토큰(stokens) 등록 · sremind 에 예약이 적힌다', rem.n >= 1 && /go=alarm&k=b%3A/.test(rem.url), rem);
const rem2 = await kid.evaluate(async () => { await pushOff(); return (await FB.db.collection('sremind').where('uid', '==', FB.auth.currentUser.uid).get()).size; });
check('알림 끄면 예약도 지운다', rem2 === 0, rem2);

// ── 빈 기기로 아이 로그인 → 클라우드에서 되살린다 (클라우드를 비우지 않는다) ──
const kid2 = await ctx('kid2');
await kid2.goto(B + '/study/');
await kid2.click('#hGear'); await kid2.click('#fKid'); await kid2.fill('#klId', 'ruru'); await kid2.fill('#klPw', '123456'); await kid2.click('#klGo');
await wait(kid2, () => FAM && FAM.role === 'kid');
await kid2.waitForTimeout(3500);
const k2 = await kid2.evaluate(() => ({books: S.books.length, sess: S.sessions.length, stars: starsOf(S), coins: S.coins}));
check('빈 기기: 문제집 · 기록 · 별 · 코인이 되살아난다', k2.books === 1 && k2.sess === 2 && k2.stars === 2 && k2.coins === 40, k2);
const cloudN = await par.evaluate(async () => { const d = await FB.db.doc('families/' + FAM.fid + '/study/' + PAR.sel).get(); const s = JSON.parse(d.data().json); return [s.books.length, s.sessions.length]; });
check('빈 기기 로그인 뒤에도 클라우드는 그대로', cloudN[0] === 1 && cloudN[1] === 2, cloudN);

// ── 부모: 약속 만들기 → 아이에게 보인다 ──
await par.click('[data-t="reward"]'); await par.fill('#prT', '머리핀 사도 돼요'); await par.fill('#prN', '1'); await par.click('#prAdd');
await par.waitForTimeout(1500);
await wait(kid, () => PROMS.length === 1, null, 15000);
check('아이: 약속이 보이고 진행 0/1 (만든 뒤 확인한 것만 센다)', await kid.evaluate(() => promiseProgress(S, PROMS[0]).n === 0));
await shot(par, 'p-reward');

// ── 용돈 친구들: 같은 아이(kidId)로 연결된 폰이 허락권을 받는다 ──
const w = await ctx('wallet-kid');
const wp = await ctx('wallet-parent');
await wp.goto(B + '/wallet/'); await wp.waitForTimeout(800);
const code = await wp.evaluate(async () => { await fbLoad(); await FB.auth.signInWithEmailAndPassword('mom@test.com', 'secret123'); const fid = await ensureFamily(FB.auth.currentUser); FAM = {fid, role: 'parent', email: 'mom@test.com'}; famSave();
  const kidId = (await FB.db.collection('families/' + fid + '/members').get()).docs.map(d => d.data()).find(m => m.role === 'kid').kidId; return makeCode('kid', kidId, '루루'); });
await w.goto(B + '/wallet/'); await w.waitForTimeout(800);
await w.evaluate(c => joinFamily(c), code);
await wait(w, () => FAM && FAM.role === 'kid', null, 15000);
await w.waitForTimeout(3000);
// 부모가 공부 친구들에서 '용돈 +1,000원' 허락권을 바로 보낸다
await par.click('#pBody [data-g="ng"] [data-v="money|용돈|1000"]'); await par.click('#grNow'); await par.waitForTimeout(2500);
await wait(w, () => MAIL.filter(m => m.type === 'grant').length === 2, null, 15000);
const wr = await w.evaluate(() => ({exp: S.exp.map(e => [e.amt, e.note]), grants: MAIL.filter(m => m.type === 'grant').map(m => m.kind)}));
check('용돈 친구들: 허락권 2개 도착 · 용돈 +1000 은 받을 예정 돈으로 한 번', wr.exp.length === 1 && wr.exp[0][0] === 1000 && wr.grants.length === 2, wr);
await w.evaluate(() => kidMailSheet()); await w.waitForTimeout(500); await shot(w, 'w-mail');
await w.click('[data-ma="used"]'); await w.waitForTimeout(2000);
await wait(kid, () => GRANTS.some(g => g.doneAt), null, 15000);
check('공부 친구들: 용돈 친구들에서 \'썼어요\' 누른 것이 보인다', true);
await w.reload(); await w.waitForTimeout(4000);
check('용돈 친구들: 다시 열어도 받을 예정 돈은 1개 그대로', await w.evaluate(() => S.exp.length === 1));

for (const p of [par, kid, kid2, w, wp]) if (p.errs.length) bad.push(p.tag + ' 오류: ' + p.errs.join(' | '));
console.log('\n통과', ok.length, '실패', bad.length); bad.forEach(x => console.log('  ✗', x));
await br.close();
process.exit(bad.length ? 1 : 0);
