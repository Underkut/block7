// 교역자 로테이션 R6 — 실제 앱 화면 + 에뮬레이터(로그인 · 저장 · 규칙). 지어낸 이름 · 이메일만.
// 돌리는 법: tests/rules/README.md (저장소 맨 위에서 python3 -m http.server 8765 를 먼저 띄운다)
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { createRequire } from 'module';
const req = createRequire(import.meta.url); let pw; try { pw = req('playwright'); } catch (_) { pw = req('/opt/node-tools/node_modules/playwright'); } const { chromium } = pw;
import fs from 'fs'; import path from 'path';
const ROOT = 'http://localhost:8765/rotation/', NM = path.resolve('node_modules/firebase');
const env = await initializeTestEnvironment({ projectId: 'demo-rota', firestore: { rules: fs.readFileSync('rota.rules', 'utf8'), host: '127.0.0.1', port: 8089 } });
const admin = async (fn) => { let out; await env.withSecurityRulesDisabled(async c => { out = await fn(c.firestore()); }); return out; };
const getDoc = (p) => admin(async db => { const d = await db.doc(p).get(); return d.exists ? d.data() : null; });
let n = 0, bad = 0; const ok = (name, got, want) => { n++; const g = JSON.stringify(got), w = JSON.stringify(want); if (g === w) console.log('  ✓', name); else { bad++; console.log('  ✗', name, '\n    결과:', g, '\n    기대:', w); } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = await fn(); if (v) return v; } catch (_) { } await sleep(150); } return null; }
// HB 계정 (이메일 · 비밀번호)
const su = await (await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hb@example.com', password: 'pw123456', returnSecureToken: true }) })).json();
const HB = su.localId;
const T = 1000;
const book = { v: 'x', at: T, people: [{ id: 'pa', name: '가나다', roles: ['preach', 'offer'], email: 'ga@example.com', at: T, by: 'hb' }, { id: 'pb', name: '라마바', roles: ['offer'], at: T, by: 'hb' }],
  slots: [{ id: '2026-11-22|sun1|offer', who: ['pb'], at: T, by: 'hb' }], visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', at: T, by: 'hb', note: '처음 메모' }, { id: 'v|2026-11-29', who: ['pb'], days: '토일', at: T, by: 'hb' }], marks: [], opts: [] };
await admin(db => db.doc('rota/' + HB).set({ b7: book, v: 'seed', at: T }));
const browser = await chromium.launch();
async function device(label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('https://www.gstatic.com/firebasejs/**', r => { const f = r.request().url().split('/').pop(); r.fulfill({ path: path.join(NM, f), contentType: 'text/javascript' }); });
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort()); await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  await ctx.addInitScript(() => { let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) { fb = v;
    if (v && v.initializeApp && !v.__emu) { v.__emu = 1; const orig = v.initializeApp.bind(v);
      v.initializeApp = (cfg, name) => { const app = orig(Object.assign({}, cfg, { projectId: 'demo-rota' }), name); app.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); app.firestore().useEmulator('127.0.0.1', 8089); return app; }; } } }); });
  const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(label + ': ' + e.message));
  pg.toasts = []; await pg.exposeFunction('__toast', (m) => pg.toasts.push(m));
  await pg.goto(ROOT); await pg.waitForTimeout(400);
  await pg.evaluate(() => { const o = toast; window.toast = (m) => { window.__toast(String(m)); return o(m); }; });
  return pg;
}
const google = (pg, sub, email) => pg.evaluate(async ([sub, email]) => { await fbInit(); await FB.auth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(JSON.stringify({ sub, email, email_verified: true }))); }, [sub, email]);
const state = (pg) => pg.evaluate(() => ({ role: FB.role, synced: FB.synced, tabs: TABS.map(t => t.id), people: live(S.book.people).length, err: FB.err }));

console.log('① HB — 빈 기기에서 이메일로 로그인');
const hb = await device('HB');
await hb.click('[data-act="menu"]'); await hb.fill('#fb-em', 'hb@example.com'); await hb.fill('#fb-pw', 'pw123456');
await hb.click('[data-act="login"]');
await until(() => hb.evaluate(() => FB.role === 'owner' && FB.synced));
ok('① HB 는 주인(owner) · 사람 탭 있음 · 자료 그대로', await state(hb), { role: 'owner', synced: true, tabs: ['week', 'month', 'busan', 'people'], people: 2, err: '' });
const d1 = await until(async () => { const d = await getDoc('rota/' + HB); return d && d.team ? d : null; });
ok('① HB 앱이 team(들어올 이메일)을 문서에 적었다', d1 && d1.team, ['ga@example.com']);
ok('① 빈 기기 로그인으로 계정 자료가 줄지 않았다', [d1.b7.people.length, d1.b7.visits.length, d1.b7.slots.length], [2, 2, 1]);

console.log('② 교역자 — 빈 기기에서 구글 로그인');
const ga = await device('교역자');
await google(ga, 'ga-sub-1', 'ga@example.com');
await until(() => ga.evaluate(() => FB.role === 'staff' && FB.synced));
ok('② 교역자(staff) · 사람 탭 없음 · HB 자료가 보인다', await state(ga), { role: 'staff', synced: true, tabs: ['week', 'month', 'busan'], people: 2, err: '' });
ok('② 처음 화면은 달력표 · 내 일정 · 나는 가나다', await ga.evaluate(() => [PREF.tab, PREF.mview, myPid()]), ['month', 'mine', 'pa']);
const GA = await ga.evaluate(() => FB.user.uid);
ok('② 교역자 기기는 자기 책 문서를 만들지 않았다', await getDoc('rota/' + GA), null);
// 남의 방문 — 고치지 못한다
await ga.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-29' })); await ga.waitForTimeout(200);
await ga.click('#pane [data-vsec="stay"]'); await ga.waitForTimeout(200);
ok('② 남의 방문의 숙소는 열리지 않고 알림만', [await ga.evaluate(() => !!S.pane.edit), ga.toasts.some(t => t.startsWith('보기만'))], [false, true]);
// HB 몫 — 달력표 칸 고르기 · 자동 배열
await ga.evaluate(() => closePane()); await ga.waitForTimeout(600); ga.toasts.length = 0;
await ga.evaluate(() => { const b = document.createElement('button'); b.dataset.pick = '2026-11-22|sun1|offer'; b.id = 'probe'; document.body.appendChild(b); b.click(); });
ok('② 자리를 누르면 고르기 대신 \'보기만\' 판(누가 · 걸리는 것) · 고르는 단추 없음', await ga.evaluate(() => [S.pane && S.pane.kind, /보기만/.test($('#pane').innerText), !!document.querySelector('#pane [data-who]')]), ['slotv', true, false]);
await ga.evaluate(() => closePane()); await ga.waitForTimeout(600);
ok('② 자동 배열 단추 · 방문 더하기는 안 보인다', await ga.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'sheet'; render(); const a = !!document.querySelector('[data-act="auto"]'); PREF.tab = 'busan'; render(); const b = !!document.querySelector('[data-act="newvisit"]'); return [a, b]; }), [false, false]);
// 자기 방문 숙소 적기 — 실제 판 · 저장 단추
await ga.waitForTimeout(600); await ga.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await ga.waitForTimeout(400);
if (!(await ga.$('#pane [data-vsec="stay"]'))) console.log('    (판)', await ga.evaluate(() => [S.pane, !!$('#pane'), $('#pane') && $('#pane').innerText.slice(0, 200)]));
await ga.click('#pane [data-vsec="stay"]'); await ga.waitForTimeout(200);
ok('② 내 방문의 숙소 판이 열리고 목록 관리 단추는 없다', await ga.evaluate(() => [S.pane.edit && S.pane.edit.sec, !!document.querySelector('#pane [data-vmanage]')]), ['stay', false]);
await ga.evaluate(() => { const d = S.pane.edit.d; d.name = '교역자 호텔'; d._new = true; d.kind = 'hotel'; d.status = 'done'; d.cost = 90000; d.nights = 1; });
await ga.click('#pane [data-act="vsave"]'); await ga.waitForTimeout(300);
const st1 = await until(async () => { const s = await getDoc('rota/' + HB + '/staff/' + GA); return s && s.visits ? s : null; });
ok('② 교역자 칸에 그 방문 숙소만 적혔다(이메일 · 고친 때)', st1 && [st1.email, Object.keys(st1.visits), st1.visits['v|2026-11-22'].stay[0].name, st1.visits['v|2026-11-22'].stayAt > 0], ['ga@example.com', ['v|2026-11-22'], '교역자 호텔', true]);
ok('② 교역자 화면에 바로 보인다', await ga.evaluate(() => S.book.visits.find(v => v.id === 'v|2026-11-22').stay[0].name), '교역자 호텔');
// 내 부재 · 가능 일정
await ga.evaluate(() => closePane()); await ga.waitForTimeout(600); await ga.evaluate(() => openPane({ kind: 'myavail' })); await ga.waitForTimeout(400);
await ga.fill('#av-from', '2026-12-01'); await ga.fill('#av-to', '2026-12-03'); await ga.fill('#av-note', '수술');
await ga.click('#pane [data-act="avadd"][data-k="away"]'); await ga.waitForTimeout(150);
await ga.fill('#av-from', '2026-12-20'); await ga.click('#pane [data-act="avadd"][data-k="can"]');
const st2 = await until(async () => { const s = await getDoc('rota/' + HB + '/staff/' + GA); return s && s.can ? s : null; });
ok('② 부재 · 가능 일정이 교역자 칸에', st2 && [st2.away, st2.can, Object.keys(st2.visits)], [[{ from: '2026-12-01', to: '2026-12-03', note: '수술' }], [{ from: '2026-12-20', to: '2026-12-20', note: '' }], ['v|2026-11-22']]);

console.log('③ HB 앱이 받아들인다');
const hbv = await until(() => hb.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'), p = S.book.people.find(x => x.id === 'pa'); return v.stay.length && p.can ? [v.stay[0].name, v.stayBy, p.away, p.awayBy, p.can.length] : null; }));
ok('③ HB 화면: 교역자 숙소 · 부재 · 가능 일정 + 누가', hbv, ['교역자 호텔', 'pa', [{ from: '2026-12-01', to: '2026-12-03', note: '수술' }], 'pa', 1]);
const d3 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b7.visits.find(x => x.id === 'v|2026-11-22'); return v.stay && v.stay.length ? d : null; });
ok('③ HB 계정 문서에도 들어갔다(HB 앱이 씀)', d3 && [d3.b7.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d3.b7.visits.find(x => x.id === 'v|2026-11-22').note, d3.b7.people.length], ['교역자 호텔', '처음 메모', 2]);
ok('③ HB 고르기 판: 교역자가 적은 가능 일정이 \'가능 일정\'(초록)으로', await hb.evaluate(async () => { openPane({ kind: 'pick', id: '2026-12-20|sun1|offer' }); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('#pane [data-who="pa"] .why'); const out = b ? [b.textContent.includes('가능 일정'), b.classList.contains('ok')] : null; closePane(); await new Promise(r => setTimeout(r, 600)); return out; }), [true, true]);
ok('③ 숙소 이름이 HB 숙소 목록에 저절로 들어가지 않는다(목록은 HB 몫)', await hb.evaluate(() => S.book.opts.filter(o => o.type === 'stay' && !o.del).map(o => o.name)), []);
// HB 가 메모만 고친다 → 교역자 숙소는 그대로
await hb.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await hb.waitForTimeout(400);
await hb.click('#pane [data-vsec="note"]'); await hb.waitForTimeout(150); await hb.fill('#pane textarea', 'HB 메모'); await hb.click('#pane [data-act="vsave"]'); await hb.waitForTimeout(800);
const d4 = await getDoc('rota/' + HB), v4 = d4.b7.visits.find(x => x.id === 'v|2026-11-22');
ok('③ HB 가 메모를 고쳐도 교역자 숙소 · 누가는 그대로', [v4.note, v4.stay[0].name, v4.stayBy], ['HB 메모', '교역자 호텔', 'pa']);
ok('③ 교역자 화면에도 HB 메모가 온다', await until(() => ga.evaluate(() => S.book.visits.find(v => v.id === 'v|2026-11-22').note === 'HB 메모')), true);

console.log('④ 팀 밖 사람 — 구글 로그인');
const zz = await device('팀 밖');
await google(zz, 'zz-sub-1', 'zz@example.com');
await until(() => zz.evaluate(() => FB.role === 'owner' && FB.synced));
const ZZ = await zz.evaluate(() => FB.user.uid);
ok('④ 팀 밖 사람은 HB 자료를 못 보고(빈 책) 자기 문서도 만들지 않는다', [await zz.evaluate(() => [FB.role, live(S.book.people).length]), await getDoc('rota/' + ZZ)], [['owner', 0], null]);
ok('④ 팀 밖 사람은 HB 문서를 직접 못 읽는다', await zz.evaluate(async (id) => { try { await FB.db.collection('rota').doc(id).get(); return 'read'; } catch (e) { return e.code; } }, HB), 'permission-denied');

console.log('⑤ HB — 두 번째 빈 기기');
const hb2 = await device('HB2');
await hb2.click('[data-act="menu"]'); await hb2.fill('#fb-em', 'hb@example.com'); await hb2.fill('#fb-pw', 'pw123456'); await hb2.click('[data-act="login"]');
await until(() => hb2.evaluate(() => FB.role === 'owner' && FB.synced));
await sleep(1200);
const d5 = await getDoc('rota/' + HB);
ok('⑤ 두 번째 기기 로그인 뒤에도 자료 그대로(숙소 · 메모 · 부재 · 자리)', [d5.b7.people.length, d5.b7.visits.length, d5.b7.slots.length, d5.b7.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d5.b7.visits.find(x => x.id === 'v|2026-11-22').note, (d5.b7.people.find(p => p.id === 'pa').away || []).length], [2, 2, 1, '교역자 호텔', 'HB 메모', 1]);

console.log('⑥ HB 가 이메일을 지우면');
await hb.evaluate(() => personApply('pa', p => { delete p.email; }));
await until(async () => { const d = await getDoc('rota/' + HB); return d.team && d.team.length === 0; });
ok('⑥ team 이 비었다', (await getDoc('rota/' + HB)).team, []);
const wr = await ga.evaluate(async () => { try { await FB.db.collection('rota').doc(FB.team).collection('staff').doc(FB.user.uid).set({ email: FB.user.email, at: 9 }, { merge: true }); return 'wrote'; } catch (e) { return e.code; } });
ok('⑥ 빠진 교역자는 더는 자기 칸에도 못 쓴다', wr, 'permission-denied');
ok('⑥ 빠진 교역자 화면에 알림', await until(() => ga.evaluate(() => FB.err.startsWith('팀 자료를 읽지 못했습니다'))), true);
const errs = [hb, ga, zz, hb2].flatMap(p => p.errs);
ok('화면 오류 없음', errs, []);
console.log(`결과: 통과 ${n - bad} / 실패 ${bad}`);
await browser.close(); await env.cleanup(); process.exit(bad ? 1 : 0);
