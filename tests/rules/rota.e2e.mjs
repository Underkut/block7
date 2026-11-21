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
  slots: [{ id: '2026-11-22|sun1|offer', who: ['pb'], at: T, by: 'hb' }], visits: [{ id: 'v|2026-11-22', who: ['pa'], days: '토일', sunLead: 'staff', ll: true, at: T, by: 'hb', note: '처음 메모' }, { id: 'v|2026-11-29', who: ['pb'], days: '토일', at: T, by: 'hb' }], marks: [], opts: [] };
await admin(db => db.doc('rota/' + HB).set({ b8: book,   /* 옛 칸(R11 모양: sunLead · ll)에 둔 자료 — 앱이 b14 · lead 로 옮긴다 */ v: 'seed', at: T }));
const browser = await chromium.launch();
async function device(label) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('https://www.gstatic.com/firebasejs/**', r => { const f = r.request().url().split('/').pop(); r.fulfill({ path: path.join(NM, f), contentType: 'text/javascript' }); });
  // Monday 서버 함수(C4b 시험) — 지어낸 광고: 영상 하나 · 구두 하나
  await ctx.route('https://asia-northeast3-block7-8f24e.cloudfunctions.net/**', r => { const h = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'POST, OPTIONS' };
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: h });
    const sun = (JSON.parse(r.request().postData() || '{}').sun) || '';
    r.fulfill({ status: 200, headers: h, contentType: 'application/json', body: JSON.stringify({ sun, busan: { found: true, group: 'x', spoken: [{ n: 1, title: '새벽 기도회' }], video: [], check: [] }, video: [{ title: '가을 음악회 안내', rep: false, notes: [] }] }) }); });
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
ok('① 빈 기기 로그인으로 계정 자료가 줄지 않았다', [d1.b18.people.length, d1.b18.visits.length, d1.b18.slots.length], [2, 2, 1]);
ok('① (R12 A) 옛 칸 b8 → b14 으로 옮기고 b8 은 지움 · 옛 인도 칸(sunLead · ll)은 lead 로', [!!d1.b8, (v => [v.lead, 'sunLead' in v, 'll' in v])(d1.b18.visits.find(x => x.id === 'v|2026-11-22'))], [false, [{ sun: { m: 'staff' }, ll: { m: 'staff' } }, false, false]]);

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
ok('② 자동 배열 단추 · 방문 더하기는 안 보인다', await ga.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'sheet'; render(); const a = !!document.querySelector('[data-act="auto"]'); PREF.tab = 'busan'; PREF.bdet = true; render(); const b = !!document.querySelector('[data-act="newvisit"]'); return [a, b]; }), [false, false]);
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
const d3 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18.visits.find(x => x.id === 'v|2026-11-22'); return v.stay && v.stay.length ? d : null; });
ok('③ HB 계정 문서에도 들어갔다(HB 앱이 씀)', d3 && [d3.b18.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d3.b18.visits.find(x => x.id === 'v|2026-11-22').note, d3.b18.people.length], ['교역자 호텔', '처음 메모', 2]);
ok('③ HB 고르기 판: 교역자가 적은 가능 일정이 \'가능 일정\'(초록)으로', await hb.evaluate(async () => { openPane({ kind: 'pick', id: '2026-12-20|sun1|offer' }); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('#pane [data-who="pa"] .why'); const out = b ? [b.textContent.includes('가능 일정'), b.classList.contains('ok')] : null; closePane(); await new Promise(r => setTimeout(r, 600)); return out; }), [true, true]);
ok('③ 숙소 이름이 HB 숙소 목록에 저절로 들어가지 않는다(목록은 HB 몫)', await hb.evaluate(() => S.book.opts.filter(o => o.type === 'stay' && !o.del).map(o => o.name)), []);
// HB 가 메모만 고친다 → 교역자 숙소는 그대로
await hb.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await hb.waitForTimeout(400);
await hb.click('#pane [data-vsec="note"]'); await hb.waitForTimeout(150); await hb.fill('#df-note', 'HB 메모'); await hb.click('#pane [data-act="vsave"]'); await hb.waitForTimeout(800);
const d4 = await getDoc('rota/' + HB), v4 = d4.b18.visits.find(x => x.id === 'v|2026-11-22');
ok('③ HB 가 메모를 고쳐도 교역자 숙소 · 누가는 그대로', [v4.note, v4.stay[0].name, v4.stayBy], ['HB 메모', '교역자 호텔', 'pa']);
ok('③ 교역자 화면에도 HB 메모가 온다', await until(() => ga.evaluate(() => S.book.visits.find(v => v.id === 'v|2026-11-22').note === 'HB 메모')), true);

console.log('③-2 내 화면 취향 (R8b) — 첫 화면 · 내 이름 모양은 계정에, 책은 그대로');
{
  const before = JSON.stringify((await getDoc('rota/' + HB)).b18);
  await ga.evaluate(() => { document.querySelector('[data-act="namefmt"]').click(); });
  await until(() => ga.evaluate(() => !!document.querySelector('#pane [data-nf="c"]')));
  await ga.evaluate(() => { document.querySelector('#pane [data-nf="c"]').click(); document.querySelector('#pane [data-nfc="blue"]').click(); });
  await ga.evaluate(() => closePane()); await sleep(500); await ga.evaluate(() => { openMenu(); document.querySelector('#menu [data-act="home"]').click(); }); await sleep(500);
  await ga.evaluate(() => { document.querySelector('#pane [data-home="busan"]').click(); });
  const st = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); return x && x.ui && x.ui.home === 'busan' ? x : null; });
  ok('③-2 교역자의 첫 화면 · 이름 모양은 자기 칸 ui 에(숙소 · 부재는 그대로)', st && [st.ui.home, st.ui.name, st.ui.at > 0, st.visits['v|2026-11-22'].stay[0].name, st.away.length], ['busan', { b: true, c: 'blue', h: 'yellow' }, true, '교역자 호텔', 1]);
  ok('③-2 교역자 화면: 내 이름에 모양이 붙는다(달력표 내 일정)', await ga.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'mine'; render(); const e = document.querySelector('#panel .mename'); return [!!e && e.textContent, getComputedStyle(document.documentElement).getPropertyValue('--me-c').trim()]; }), ['가나다', '#2f6fb5']);
  ok('③-2 내 일정: 사람 알약은 모두 보이고 내가 골라져 있다 · 다른 분을 누르면 그분 일정', await ga.evaluate(() => { const a = [...document.querySelectorAll('[data-me]')].map(b => [b.textContent, b.getAttribute('aria-pressed')]); document.querySelector('[data-me="pb"]').click(); return [a, document.querySelector('.mhello b').textContent]; }), [[['가나다', 'true'], ['라마바', 'false']], '라마바']);
  await hb.evaluate(() => closePane()); await sleep(500); await hb.evaluate(() => { openMenu(); document.querySelector('#menu [data-act="home"]').click(); }); await sleep(500);
  await hb.evaluate(() => { document.querySelector('#pane [data-home="month:mine"]').click(); });
  const d = await until(async () => { const x = await getDoc('rota/' + HB); return x && x.ui ? x : null; });
  await sleep(1200);
  const d2 = await getDoc('rota/' + HB);
  ok('③-2 HB 의 첫 화면은 문서 맨 위 ui 칸에 · 책(b14) · team 은 한 글자도 그대로 · HB 책에 교역자 ui 가 섞이지 않았다', [d && d.ui.home, JSON.stringify(d2.b18) === before, d2.team, /"ui"|"home"/.test(JSON.stringify(d2.b18))], ['month:mine', true, ['ga@example.com'], false]);
  await hb.evaluate(() => closePane()); await sleep(300);
  await ga.reload(); await until(() => ga.evaluate(() => typeof FB !== 'undefined' && FB.role === 'staff' && FB.synced));
  ok('③-2 교역자가 다시 열면 고른 첫 화면(부산)이 먼저 뜬다', await ga.evaluate(() => PREF.tab), 'busan');
  await ga.evaluate(() => { window.toast = ((o) => (m) => { window.__toast(String(m)); return o(m); })(toast); });
}

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
ok('⑤ 두 번째 기기 로그인 뒤에도 자료 그대로(숙소 · 메모 · 부재 · 자리)', [d5.b18.people.length, d5.b18.visits.length, d5.b18.slots.length, d5.b18.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d5.b18.visits.find(x => x.id === 'v|2026-11-22').note, (d5.b18.people.find(p => p.id === 'pa').away || []).length], [2, 2, 1, '교역자 호텔', 'HB 메모', 1]);

console.log('⑧ (R12 A) 부산 인도 세 갈래 — HB 가 방문 창에서 고르면 계정 · 교역자 화면까지');
{
  await hb.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await hb.waitForTimeout(400);
  await hb.click('#pane [data-vsec="ev"]'); await hb.waitForTimeout(200);   // 1116-2 D: 인도는 '예배' 판으로
  ok('⑧ 예배 판: 금요(11/20 = 금3 ENCOUNTER) · 주일 · LL 줄마다 교역자 / 성도 / 중계 · 옛 칸이 옮겨져 주일 · LL 교역자가 눌려 있음', await hb.evaluate(() => [...document.querySelectorAll('#pane [data-dlead]')].map(b => b.dataset.dlead + ':' + b.dataset.v + (b.getAttribute('aria-pressed') === 'true' ? '*' : ''))),
    ['fri:staff', 'fri:lay', 'fri:relay', 'sun:staff*', 'sun:lay', 'sun:relay', 'll:staff*', 'll:lay', 'll:relay']);
  await hb.click('#pane [data-dlead="sun"][data-v="relay"]'); await hb.waitForTimeout(100);
  await hb.click('#pane [data-dlead="ll"][data-v="lay"]'); await hb.waitForTimeout(100);
  ok('⑧ 성도를 골랐는데 성도 인도자가 없으면 \'사람\' 탭 안내', await hb.evaluate(() => /성도 인도자를 더하면/.test(document.querySelector('#pane').textContent)), true);
  await hb.click('#pane [data-act="vsave"]'); await hb.waitForTimeout(300); await hb.evaluate(() => closePane());
  const d7 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18.visits.find(x => x.id === 'v|2026-11-22'); return v.lead && v.lead.sun && v.lead.sun.m === 'relay' ? d : null; });
  const v7 = d7 && d7.b18.visits.find(x => x.id === 'v|2026-11-22');
  ok('⑧ 계정 문서(b15): 주일 중계 · LL 성도 · 옛 칸 없음 · 숙소 · 메모 그대로', v7 && [v7.lead, 'sunLead' in v7, 'll' in v7, v7.stay[0].name, v7.note, !!d7.b8], [{ sun: { m: 'relay' }, ll: { m: 'lay' } }, false, false, '교역자 호텔', 'HB 메모', false]);
  ok('⑧ 교역자 화면에도 온다(알약)', await until(() => ga.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'); const t = visitLeads(S.book, v).map(x => x.text); return t.length === 2 ? t : null; })), ['주일예배 중계', 'LL · 성도 인도자']);
  ok('⑧ 교역자는 인도를 못 고친다(예배 판이 열리지 않음)', await ga.evaluate(async () => { openPane({ kind: 'visit', id: 'v|2026-11-22' }); await new Promise(r => setTimeout(r, 300)); document.querySelector('#pane [data-vsec="ev"]') && document.querySelector('#pane [data-vsec="ev"]').click(); await new Promise(r => setTimeout(r, 200)); const e = !!(S.pane && S.pane.edit); closePane(); return e; }), false);
}

console.log('⑨ (R12 C4b) 부산 상영 — 계정에 저장 · 경고 · 교역자는 자기 방문 주일만');
{
  // 토요일(11/21)인 척 + 11/22 영상 광고를 이 기기에서 읽은 적 있음 → 경고
  const sat = (pg) => pg.evaluate(() => { window.todayYmd = () => '2026-11-21';
    localStorage.setItem('rota_ads_v1', JSON.stringify({ '2026-11-22': { at: 1, o: { sun: '2026-11-22', busan: { found: true }, video: [{ title: '가을 음악회 안내' }] } } })); closePane(); PREF.tab = 'busan'; PREF.bdet = true; render(); });
  await sat(hb); await sat(ga); await sleep(500);
  const seen = (pg) => pg.evaluate(() => [!!document.querySelector('#panel .bsbar'), document.querySelectorAll('#panel .bsp').length]);
  ok('⑨ 영상 광고가 있는 주일 · 안 고름 → HB · 내려가는 교역자 모두 맨 위 경고 줄 + 부산 탭 그 줄 알약', [await seen(hb), await seen(ga)], [[true, 1], [true, 1]]);
  ok('⑨ 방문 판 \'주일 광고\' 줄에도 알약', await hb.evaluate(async () => { openPane({ kind: 'visit', id: 'v|2026-11-22' }); await new Promise(r => setTimeout(r, 300)); const x = !!document.querySelector('#pane [data-act="ads"] .bsp'); closePane(); return x; }), true);
  ok('⑨ 영상 광고가 없는 주일(읽은 광고 기준)이면 아무것도 안 띄움', await hb.evaluate(async () => { const k = 'rota_ads_v1', o = localStorage.getItem(k);
    localStorage.setItem(k, JSON.stringify({ '2026-11-22': { at: 1, o: { sun: '2026-11-22', busan: { found: true }, video: [] } } })); render(); const a = [!!document.querySelector('#panel .bsbar'), document.querySelectorAll('#panel .bsp').length];
    localStorage.setItem(k, o); render(); return a; }), [false, 0]);
  await sleep(700);
  // 교역자가 경고 줄을 눌러 광고 판 → '다른 버전'
  await ga.click('#panel .bsbar'); await until(() => ga.evaluate(() => S.pane && S.pane.kind === 'ads' && S.pane.state === 'done'));
  ok('⑨ 교역자 광고 판: 세 단추가 눌린다(내 방문의 주일) · 아직 안 고름이 경고색', await ga.evaluate(() => [[...document.querySelectorAll('#pane [data-adsbs]')].map(b => b.disabled), !!document.querySelector('#pane .adyet.warn')]), [[false, false, false], true]);
  await ga.click('#pane [data-adsbs="diff"]');
  const st9 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); return x && x.visits['v|2026-11-22'].bs ? x : null; });
  ok('⑨ 교역자 칸의 그 방문 줄에 상영 · 숙소는 그대로', st9 && [st9.visits['v|2026-11-22'].bs, st9.visits['v|2026-11-22'].bsAt > 0, st9.visits['v|2026-11-22'].stay[0].name], ['diff', true, '교역자 호텔']);
  ok('⑨ 교역자 화면: 바로 골라지고 경고가 걷힘', await ga.evaluate(() => [showOf(S.book, '2026-11-22'), !!document.querySelector('#panel .bsbar'), !!document.querySelector('#pane #ads-bub')]), ['diff', false, true]);
  const d9 = await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b18.shows && d.b18.shows.find(x => x.id === 's|2026-11-22'); return r ? d : null; });
  ok('⑨ HB 앱이 받아 계정 책(b14)의 주일 줄로 · 누가 = 교역자 · 옛 칸 b10 없음', d9 && [d9.b18.shows.find(x => x.id === 's|2026-11-22').bs, d9.b18.shows.find(x => x.id === 's|2026-11-22').by, 'b10' in d9], ['diff', 'staff:pa', false]);
  ok('⑨ HB 화면의 경고도 걷힘', await until(() => hb.evaluate(() => { render(); return !document.querySelector('#panel .bsbar') && !document.querySelectorAll('#panel .bsp').length; })), true);
  // 남의 방문(11/29 라마바) — 교역자는 보기만
  await ga.evaluate(() => closePane()); await sleep(500);
  await ga.evaluate(() => adsOpen('2026-11-29')); await until(() => ga.evaluate(() => S.pane && S.pane.state === 'done'));
  ok('⑨ 내 방문이 아닌 주일: 단추가 잠기고 설명이 바뀜', await ga.evaluate(() => [[...document.querySelectorAll('#pane [data-adsbs]')].map(b => b.disabled), /내려가는 교역자와 HB 가 고릅니다/.test($('#pane').textContent)]), [[true, true, true], true]);
  await ga.evaluate(() => { const b = document.querySelector('#pane [data-adsbs="same"]'); b.disabled = false; b.click(); }); await sleep(800);
  ok('⑨ 억지로 눌러도 안 씀(교역자 칸 · 화면 그대로)', [await ga.evaluate(() => showOf(S.book, '2026-11-29')), 'bs' in ((await getDoc('rota/' + HB + '/staff/' + GA)).visits['v|2026-11-29'] || {})], ['', false]);
  await ga.evaluate(() => closePane()); await sleep(500);
  // HB 가 나중에 '같은 영상' 으로 → 계정 · 교역자 화면
  await hb.evaluate(() => adsOpen('2026-11-22')); await until(() => hb.evaluate(() => S.pane && S.pane.state === 'done'));
  await hb.click('#pane [data-adsbs="same"]');
  const d9b = await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b18.shows.find(x => x.id === 's|2026-11-22'); return r.bs === 'same' ? d : null; });
  ok('⑨ HB 가 나중에 고치면 HB 것(계정)', d9b && d9b.b18.shows.find(x => x.id === 's|2026-11-22').bs, 'same');
  ok('⑨ 교역자 화면에도 온다', await until(() => ga.evaluate(() => showOf(S.book, '2026-11-22') === 'same')), true);
  await hb.evaluate(() => closePane()); await sleep(500);
  // 빈 기기 + 예전 이 기기 선택(rota_adsbs_v1) → 로그인하면 계정으로 한 번 옮기고 지움 · 계정 것은 줄지 않음
  const hb3 = await device('HB3');
  await hb3.evaluate(() => localStorage.setItem('rota_adsbs_v1', JSON.stringify({ '2026-11-29': 'none', '2026-11-08': 'same', '2026-11-22': 'diff' })));
  await hb3.click('[data-act="menu"]'); await hb3.fill('#fb-em', 'hb@example.com'); await hb3.fill('#fb-pw', 'pw123456'); await hb3.click('[data-act="login"]');
  await until(() => hb3.evaluate(() => FB.role === 'owner' && FB.synced));
  const d9c = await until(async () => { const d = await getDoc('rota/' + HB); return d.b18.shows.some(x => x.id === 's|2026-11-29') ? d : null; });
  ok('⑨ 빈 기기 로그인: 예전 이 기기 선택은 다가오는 주일 · 계정에 없는 것만(11/29) · 계정 것(11/22 같은 영상)은 그대로 · 지난 주일(11/8)은 버림 · 이 기기 기억은 지움',
    d9c && [d9c.b18.shows.map(x => x.id + ':' + x.bs), d9c.b18.people.length, d9c.b18.visits.length, await hb3.evaluate(() => localStorage.getItem('rota_adsbs_v1'))], [['s|2026-11-22:same', 's|2026-11-29:none'], 2, 2, null]);
  // 낡은 앱(b10 — 1116-2 B 앞, 동행 · 모임 새 칸을 모름)이 상영 없이 다시 써도 상영은 남는다
  const old = JSON.parse(JSON.stringify(d9c.b18)); delete old.shows; old.visits = old.visits.map(v => v.id === 'v|2026-11-29' ? Object.assign(v, { note: '낡은 앱', at: Date.now() + 5000 }) : v);
  await admin(db => db.doc('rota/' + HB).set({ b10: old }, { merge: true }));
  const d9d = await until(async () => { const d = await getDoc('rota/' + HB); return !('b10' in d) && d.b18.visits.find(v => v.id === 'v|2026-11-29').note === '낡은 앱' ? d : null; });
  ok('⑨ 낡은 앱(b10)이 상영 없이 써도 합쳐 상영은 그대로 · 낡은 앱 메모도 받음 · b10 은 치움', d9d && d9d.b18.shows.map(x => x.id + ':' + x.bs), ['s|2026-11-22:same', 's|2026-11-29:none']);
  hb3.errs.forEach(e => hb.errs.push(e));
}

console.log('⑩ (1116-2 B) 부산 요약 칸 → 고칠 판 · 동행 / 모임 · 교역자도 모임');
{
  const toBusan = (pg) => pg.evaluate(() => { closePane(); PREF.tab = 'month'; PREF.mview = 'busan'; S.ym = '2026-11'; render(); });
  await toBusan(hb); await toBusan(ga); await sleep(400);
  const cell = (id, col) => `#panel [data-visit="${id}"][data-vcol="${col}"]`;
  const pane = (pg) => pg.evaluate(() => ({ open: !!S.pane, sec: S.pane && S.pane.edit ? S.pane.edit.sec : '', focus: (document.activeElement && document.activeElement.dataset.focus) || '', red: [...document.querySelectorAll('#pane .redf')].map(e => e.dataset.focus) }));
  ok('⑩ 표: 칸마다 누를 자리 · 동행 · 모임 열 따로', await hb.evaluate(() => [[...document.querySelectorAll('#panel table.bt th')].slice(-2).map(x => x.textContent), document.querySelectorAll('#panel [data-visit="v|2026-11-22"][data-vcol]').length >= 8]), [['동행', '모임'], true]);
  await hb.click(cell('v|2026-11-22', 'cost')); await sleep(400);
  ok('⑩ HB: 금액 칸 → 숙소 판 · 금액 입력칸에 빨간 테두리 + 커서', await pane(hb), { open: true, sec: 'stay', focus: 'cost', red: ['cost'] });
  await hb.keyboard.press('Escape'); await sleep(400);
  ok('⑩ × · ESC 는 표로 돌아간다(요약 판을 거치지 않음)', await hb.evaluate(() => !!S.pane), false);
  await hb.click(cell('v|2026-11-22', 'mate')); await sleep(400);
  await hb.fill('#df-mate', '동행가'); await hb.keyboard.press('Enter'); await sleep(150); await hb.click('#pane [data-act="vsave"]'); await sleep(300);
  const d10 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18.visits.find(x => x.id === 'v|2026-11-22'); return v.mates ? d : null; });
  ok('⑩ HB 동행 → 계정(b12) · 옛 글 칸 없음 · 숙소 · 메모 그대로', d10 && (v => [v.mates, 'staff' in v, v.stay[0].name, v.note])(d10.b18.visits.find(x => x.id === 'v|2026-11-22')), [[{ n: '동행가' }], false, '교역자 호텔', 'HB 메모']);
  // 교역자: 자기 방문의 모임 칸 → 모임 판 → 침례교육 2차 → 저장
  await ga.click(cell('v|2026-11-22', 'meet')); await sleep(400);
  ok('⑩ 교역자: 자기 방문의 모임 칸 → 모임 판이 바로 열림', (await pane(ga)).sec, 'meet');
  await ga.click('#pane [data-dmk="bapt"]'); await sleep(100); await ga.click('#pane [data-dmn="2"]'); await sleep(100); await ga.click('#pane [data-act="vsave"]'); await sleep(300);
  const st10 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); return x && x.visits['v|2026-11-22'].meet ? x : null; });
  ok('⑩ 교역자 칸의 그 방문 줄에 모임(칸 모두) · 숙소 · 상영은 그대로', st10 && (e => [Object.fromEntries(Object.entries(e.meet).sort()), e.meetAt > 0, e.stay[0].name, e.bs])(st10.visits['v|2026-11-22']), [{ g: '', k: 'bapt', memo: '', n: 2, who: '' }, true, '교역자 호텔', 'diff']);
  const d10b = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18.visits.find(x => x.id === 'v|2026-11-22'); return v.meet ? d : null; });
  ok('⑩ HB 앱이 받아 계정 책(b12)에 · 누가 = 교역자 · 동행 · 메모 그대로', d10b && (v => [v.meet, v.meetBy, v.mates, v.note])(d10b.b18.visits.find(x => x.id === 'v|2026-11-22')), [{ k: 'bapt', n: 2 }, 'pa', [{ n: '동행가' }], 'HB 메모']);
  // 교역자가 못 고치는 칸 · 남의 방문 → 요약(보기)만
  await ga.click(cell('v|2026-11-22', 'mate')); await sleep(400);
  const gm = await pane(ga); await ga.evaluate(() => closePane()); await sleep(400);
  await ga.click(cell('v|2026-11-29', 'meet')); await sleep(400);
  const go = await pane(ga);
  await ga.evaluate(() => { const b = document.querySelector('#pane [data-vsec="meet"]'); if (b) b.click(); }); await sleep(300);
  ok('⑩ 교역자: 자기 방문의 동행 칸 · 남의 방문의 모임 칸 → 요약(보기)만 · 억지로 눌러도 판이 안 열림', [gm.open, gm.sec, go.open, go.sec, await ga.evaluate(() => !!(S.pane && S.pane.edit))], [true, '', true, '', false]);
  await ga.evaluate(() => closePane()); await sleep(400);
  // HB 가 나중에 고치면 HB 것 → 교역자 화면에도
  await hb.click(cell('v|2026-11-22', 'meet')); await sleep(400);
  await hb.click('#pane [data-dmk="dept"]'); await sleep(100); await hb.click('#pane [data-dmg="청년셀"]'); await sleep(100); await hb.click('#pane [data-act="vsave"]'); await sleep(300);
  ok('⑩ HB 가 나중에 고치면 HB 것 · 교역자 화면에도 온다', await until(() => ga.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'); return v.meet && v.meet.k === 'dept' ? meetText(v.meet) : null; })), '청년셀');
  await hb.evaluate(() => closePane()); await ga.evaluate(() => closePane()); await sleep(300);
}

console.log('⑪ (1116-2 C) 숙소 판: 숙소 쓰는 사람 · 호텔 / 성도님 댁 상태 · 알약 끌어 차례 · b12');
{
  const cell = (id, col, i) => `#panel [data-visit="${id}"][data-vcol="${col}"]` + (i != null ? `[data-i="${i}"]` : '');
  const look = (pg) => pg.evaluate(() => { const p = document.querySelector('#pane'), all = [...p.querySelectorAll('[data-dset]')];
    return { forFirst: all.length > 0 && all[0].dataset.dset === 'for', st: [...p.querySelectorAll('[data-dset="status"]')].map(b => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')),
      cancel: !!p.querySelector('[data-df="cancelBy"]'), img: /예약 화면 캡쳐/.test(p.textContent), own: p.querySelectorAll('#spills .spill.own').length, pills: [...p.querySelectorAll('#spills .spill')].map(b => b.textContent) }; });
  // HB: 목록에 호텔 둘을 더 넣고(저장) → 숙소 칸 → 판
  await hb.evaluate(() => { const by = byNow(); optAdd(S.book, 'stay', '가 호텔', { kind: 'hotel' }, by, Date.now()); optAdd(S.book, 'stay', '나 호텔', { kind: 'hotel' }, by, Date.now()); saveBook(); render(); }); await sleep(500);
  await hb.click(cell('v|2026-11-22', 'stay', 0)); await sleep(400);
  const h1 = await look(hb);
  ok('⑪ HB 숙소 판: 동행이 있어 \'숙소 쓰는 사람\' 이 맨 앞 · 호텔 상태 넷 · 취소 기한 · 예약 화면 · 알약은 HB 가 끌 수 있음',
    [h1.forFirst, h1.st, h1.cancel, h1.img, h1.own, h1.pills], [true, ['미정', '예약 전', '예약 완료*', '취소'], true, true, 3, ['교역자 호텔', '가 호텔', '나 호텔']]);
  await hb.click('#pane [data-dset="kind"][data-v="home"]'); await sleep(200);
  const h2 = await look(hb);
  ok('⑪ 성도님 댁으로 바꾸면: 상태 다섯(대화 전 · 대화 중 · 대화 완료 — 예약 완료는 대화 완료로) · 취소 기한 · 예약 화면 감춤', [h2.st, h2.cancel, h2.img], [['미정', '대화 전', '대화 중', '대화 완료*', '취소'], false, false]);
  await hb.click('#pane [data-dset="kind"][data-v="hotel"]'); await sleep(200);
  await hb.click('#spills .spill >> nth=0'); await sleep(150);   // 종류를 바꾸면 고른 숙소가 비므로 다시 고름
  await hb.click('#pane [data-dset="status"][data-v="pre"]'); await sleep(100);
  // 마우스로 첫 알약을 맨 끝으로 끌기
  const pb = await hb.$$('#spills .spill'), a = await pb[0].boundingBox(), z = await pb[2].boundingBox();
  await hb.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await hb.mouse.down();
  for (let k = 1; k <= 10; k++) await hb.mouse.move(a.x + a.width / 2 + (z.x + z.width - 3 - a.x - a.width / 2) * k / 10, z.y + z.height / 2);
  await hb.mouse.up(); await sleep(400);
  ok('⑪ 끌어 놓으면 차례가 바뀌고 고르던 숙소 · 상태는 그대로', await hb.evaluate(() => [[...document.querySelectorAll('#spills .spill')].map(b => b.textContent), S.pane.edit.d.name, S.pane.edit.d.status]), [['가 호텔', '나 호텔', '교역자 호텔'], '교역자 호텔', 'pre']);
  await hb.click('#pane [data-act="vsave"]'); await sleep(300);
  const d11 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18 && d.b18.visits.find(x => x.id === 'v|2026-11-22'); return v && v.stay[0].status === 'pre' ? d : null; });
  ok('⑪ 계정(b15): 숙소 예약 전 · 목록 차례 · 옛 칸 b11 · b12 없음',
    d11 && [d11.b18.opts.filter(o => o.type === 'stay' && !o.del).sort((x, y) => x.ord - y.ord).map(o => o.name), 'b11' in d11 || 'b12' in d11 || 'b13' in d11], [['가 호텔', '나 호텔', '교역자 호텔'], false]);
  // 낡은 앱(b11 — 예약 전을 모름)이 숙소를 '미정' 으로 떨군 채 다른 방문 메모를 써도
  const old = JSON.parse(JSON.stringify(d11.b18)); old.visits = old.visits.map(v => { v = JSON.parse(JSON.stringify(v)); for (const s of v.stay || []) if (s.status === 'pre') s.status = ''; if (v.id === 'v|2026-11-29') { v.note = '낡은 앱 b11'; v.at = Date.now() + 5000; } return v; });
  await admin(db => db.doc('rota/' + HB).set({ b11: old }, { merge: true }));
  const d11b = await until(async () => { const d = await getDoc('rota/' + HB); return !('b11' in d) && d.b18.visits.find(v => v.id === 'v|2026-11-29').note === '낡은 앱 b11' ? d : null; });
  ok('⑪ 낡은 앱(b11)이 써도 합쳐 예약 전은 그대로 · 낡은 앱 메모도 받음 · b11 은 치움', d11b && d11b.b18.visits.find(v => v.id === 'v|2026-11-22').stay[0].status, 'pre');
  // 교역자: 자기 방문 숙소 칸 → 고르기만(끌기 · 꾹 누르기 없음) → 성도님 댁 · 대화 전 → 자기 칸 → HB 앱이 받음
  await sleep(600);
  await ga.click(cell('v|2026-11-22', 'stay', 0)); await sleep(400);
  const g1 = await look(ga);
  await ga.click('#spills .spill >> nth=0', { button: 'right' }); await sleep(300);
  ok('⑪ 교역자: 숙소 판은 열리고 상태는 예약 전 · 알약은 고르기만(오른쪽 단추로도 목록 관리가 안 열림)', [g1.st, g1.own, await ga.evaluate(() => !!S.pane.edit.manage)], [['미정', '예약 전*', '예약 완료', '취소'], 0, false]);
  await ga.click('#pane [data-dset="kind"][data-v="home"]'); await sleep(150); await ga.click('#pane [data-act="dnew"]'); await sleep(150);
  await ga.fill('#pane [data-df="name"]', '어느 댁'); await ga.click('#pane [data-dset="status"][data-v="pre"]'); await sleep(100); await ga.click('#pane [data-act="vsave"]'); await sleep(300);
  const st11 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); const s = x && x.visits['v|2026-11-22'].stay; return s && s[0].kind === 'home' ? x : null; });
  ok('⑪ 교역자 칸: 성도님 댁 · 대화 전 · 취소 기한 없음', st11 && (s => [s.name, s.status, 'cancelBy' in s])(st11.visits['v|2026-11-22'].stay[0]), ['어느 댁', 'pre', false]);
  const d11c = await until(async () => { const d = await getDoc('rota/' + HB); const s = d.b18.visits.find(x => x.id === 'v|2026-11-22').stay[0]; return s.kind === 'home' ? d : null; });
  ok('⑪ HB 앱이 받아 계정(b15)에 · 화면 알약 = 대화 전', [d11c && d11c.b18.visits.find(x => x.id === 'v|2026-11-22').stay[0].status, await until(() => hb.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'); return v.stay[0].kind === 'home' ? stayStName(v.stay[0]) : null; }))], ['pre', '대화 전']);
  await hb.evaluate(() => closePane()); await ga.evaluate(() => closePane()); await sleep(300);
}

console.log('⑫ 가만히 있는 HB 앱 — 계정에 다시 쓰고 다시 그리기를 되풀이하지 않는다 (1117-3, 터치가 먹히지 않던 까닭)');
{ // id 가 앞서는 분(p0)을 뒤에 더하면 이름 명단(wkeys)의 칸 차례가 계정(파이어베이스는 칸을 이름순으로 돌려준다)과 달라진다
  await hb.evaluate(() => { put(S.book, 'people', { id: 'p0', name: '사아자', roles: ['offer'], alias: ['사아'] }, byNow(), Date.now()); saveBook(); });
  await until(async () => { const d = await getDoc('rota/' + HB); return d.wkeys && d.wkeys.p0; }); await sleep(1500);
  const cnt = () => hb.evaluate(() => { window.__n = { save: 0, draw: 0 }; const s = cloudSave, r = render; window.cloudSave = () => { __n.save++; return s(); }; window.render = () => { __n.draw++; return r(); }; });
  await cnt(); const at0 = (await getDoc('rota/' + HB)).at; await sleep(4000);
  const nn = await hb.evaluate(() => __n), at1 = (await getDoc('rota/' + HB)).at;
  ok('⑫ 4초 동안 계정에 쓰지 않았고(at 그대로) 다시 그리지도 않았다', [nn.save, nn.draw, at1 === at0], [0, 0, true]);
}

console.log('⑬ (1116-2 D) 특별예배 — 주일이 아닌 날 부산 일정 + 예배 여럿 · 이름 · 계정 b13 · 교역자는 보기만 · 낡은 앱(b12)');
{
  await hb.evaluate(() => { put(S.book, 'marks', { id: 'm|2026-12-20', sun: '2026-12-20', tags: ['성탄'] }, byNow(), Date.now()); saveBook(); goTab('busan'); }); await sleep(400);
  await hb.fill('#nv-date', '2026-12-24'); await hb.click('[data-act="newvisit"]'); await sleep(400);
  const e0 = await hb.evaluate(() => S.pane && S.pane.edit && [S.pane.edit.sec, S.pane.edit.d.title, S.pane.edit.d.evs.length]);
  ok('⑬ 목요일 날짜로 부산 일정 더하기 → 예배 판이 바로 · 이름 \'성탄\' 미리(그 주 교회 일정 표시) · 빈 예배 한 칸', e0, ['ev', '성탄', 1]);
  await hb.fill('#df-evn0', '성탄 전야 예배'); await hb.click('#pane [data-devt="0"][data-v="저녁"]'); await hb.click('#pane [data-devm="0"][data-v="lay"]'); await sleep(100);
  await hb.click('#pane [data-act="devadd"]'); await sleep(200);
  await hb.click('#pane [data-devd="1"][data-v="2026-12-25"]'); await sleep(100);
  await hb.fill('#df-evn1', '성탄 예배'); await hb.fill('#pane [data-devtm="1"]', '10:30'); await hb.dispatchEvent('#pane [data-devtm="1"]', 'change'); await sleep(150);
  await hb.click('#pane [data-devm="1"][data-v="staff"]'); await sleep(100);
  hb.toasts.length = 0; await hb.click('#pane [data-act="vsave"]'); await sleep(400);
  ok('⑬ 저장: 교역자가 인도하는 12/25 를 머무는 날에 더했다는 알림', hb.toasts.some(t => /머무는 날에 더했습니다/.test(t) && /12\/25/.test(t)), true);
  const d13 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18 && d.b18.visits.find(x => x.id === 'v|2026-12-24'); return v && v.evs ? d : null; });
  const v13 = d13 && d13.b18.visits.find(x => x.id === 'v|2026-12-24');
  ok('⑬ 계정(b15): 이름 · 머무는 날 목금 · 예배 둘(날짜 · 때 · 이름 · 인도)', v13 && [v13.title, v13.days, v13.evs], ['성탄', '목금', [{ d: '2026-12-24', t: '저녁', n: '성탄 전야 예배', m: 'lay' }, { d: '2026-12-25', t: '10:30', n: '성탄 예배', m: 'staff' }]]);
  ok('⑬ 요약 판: \'예배\' 칸에 둘 · 주일 광고 줄 없음(주일에 안 머묾) · 제목에 이름', await hb.evaluate(() => [[...document.querySelectorAll('#pane [data-vsec="ev"] .lchip')].map(x => x.textContent), !!document.querySelector('#pane [data-act="ads"]'), /부산 일정 · 성탄/.test(document.querySelector('#pane .phead').textContent)]),
    [['목 저녁 성탄 전야 예배 · 성도 인도자', '금 10:30 성탄 예배 인도'], false, true]);
  await hb.evaluate(() => closePane()); await sleep(200);
  ok('⑬ 부산 탭 줄에 이름(초록 글씨, 1117-Z 7) · 글자는 \'부산 일정\'', await hb.evaluate(() => [/성탄/.test((document.querySelector('.vrow[data-visit="v|2026-12-24"] .vttl') || {}).textContent || ''), /부산 일정 더하기/.test(document.body.textContent), /방문 더하기/.test(document.body.textContent)]), [true, true, false]);
  // 교역자(가나다)는 이 일정에 들지 않았다 — 보기만, 예배 판도 안 열림
  ok('⑬ 교역자 화면에도 오고 예배 판은 안 열림', await until(() => ga.evaluate(async () => { const v = S.book.visits.find(x => x.id === 'v|2026-12-24'); if (!v || !v.evs) return null;
    openPane({ kind: 'visit', id: v.id }); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('#pane [data-vsec="ev"]'); if (b) b.click(); await new Promise(r => setTimeout(r, 200));
    const e = !!(S.pane && S.pane.edit); closePane(); return [v.title, v.evs.length, e]; })), ['성탄', 2, false]);
  // 낡은 앱(b12 — title · evs 를 모름)이 같은 줄을 떨군 사본을 써도
  const old = JSON.parse(JSON.stringify(d13.b18)); old.visits.forEach(v => { delete v.title; delete v.evs; });
  await admin(db => db.doc('rota/' + HB).set({ b12: old }, { merge: true }));
  await sleep(1500); const d13b = await getDoc('rota/' + HB);   // 바뀐 게 없으면 새 앱은 다시 쓰지 않는다(옛 칸은 다음 저장 때 지움 — 낡은 앱과 핑퐁 없음, 1117-Z 2 고침)
  ok('⑬ 낡은 앱(b12) 사본과 합쳐도 이름 · 예배 그대로 · 바뀐 게 없으니 다시 안 씀', d13b && [(v => [v.title, v.evs.length])(d13b.b18.visits.find(x => x.id === 'v|2026-12-24')), await hb.evaluate(() => (v => [v.title, v.evs.length])(S.book.visits.find(x => x.id === 'v|2026-12-24')))], [['성탄', 2], ['성탄', 2]]);
}

console.log('⑭ (1116-2 E) 분당 특별예배 — HB 가 더하고 자리를 고르면 계정 b15 · 교역자는 보기만 · 낡은 앱(b13)');
{
  await hb.evaluate(() => { closePane(); S.sun = '2026-12-20'; S.wm = 'cal'; PREF.tab = 'week'; render(); }); await sleep(300);
  await hb.click('[data-act="specnew"]'); await sleep(300);
  ok('⑭ \'+ 분당 특별예배 더하기\' → 판 · 날짜는 그 주 목요일(12/24)', await hb.evaluate(() => S.pane && [S.pane.kind, S.pane.d.date]), ['spec', '2026-12-24']);
  await hb.fill('#sp-n', '성탄 전야 예배'); await hb.click('#pane [data-spt="저녁"]'); await hb.click('#pane [data-spr="lead"]'); await sleep(100);
  await hb.click('#pane [data-act="spsave"]'); await sleep(400);
  const d14 = await until(async () => { const d = await getDoc('rota/' + HB); return d.b18 && d.b18.specs && d.b18.specs.length ? d : null; });
  ok('⑭ 계정(b15): 특별예배 한 줄(이름 · 때 · 자리 셋)', d14 && (x => [x.id, x.n, x.t, x.roles])(d14.b18.specs[0]), ['x|2026-12-24|1', '성탄 전야 예배', '저녁', ['preach', 'offer', 'lead']]);
  ok('⑭ 이번 주 카드에 자리 셋', await hb.evaluate(() => [...document.querySelectorAll('[data-pick^="2026-12-24|x1|"]')].map(b => b.dataset.pick.split('|')[2])), ['preach', 'offer', 'lead']);
  await hb.click('[data-pick="2026-12-24|x1|preach"]'); await sleep(300);
  ok('⑭ 고르기 판 제목 = 예배 이름', await hb.evaluate(() => document.querySelector('#pane .phead b').firstChild.textContent), '성탄 전야 예배 설교');
  await hb.click('#pane [data-who="pa"]'); await sleep(400); await hb.evaluate(() => closePane());
  const d14b = await until(async () => { const d = await getDoc('rota/' + HB); const x = d.b18.slots.find(y => y.id === '2026-12-24|x1|preach'); return x && x.who.includes('pa') ? d : null; });
  ok('⑭ 계정(b15): 자리 \'2026-12-24|x1|preach\' = 가나다', !!d14b, true);
  // 교역자(가나다): 보이고 · 내 일정에 · 특별예배 판은 없음 · 자리는 보기만
  ok('⑭ 교역자: 특별예배와 내 자리가 보임 · 고치기 단추 없음 · 자리를 누르면 보기만', await until(() => ga.evaluate(async () => {
    if (!S.book.specs.length || !S.book.slots.some(x => x.id === '2026-12-24|x1|preach')) return null;
    closePane(); S.sun = '2026-12-20'; S.wm = 'cal'; PREF.tab = 'week'; render(); await new Promise(r => setTimeout(r, 200));
    const hasEdit = !!document.querySelector('[data-spec],[data-act="specnew"]'); const b = document.querySelector('[data-pick="2026-12-24|x1|preach"]'); if (b) b.click(); await new Promise(r => setTimeout(r, 300));
    const k = S.pane && S.pane.kind; closePane();
    return [hasEdit, k, myItems(S.book, 'pa', '2026-12-20', '2026-12-31').filter(r => r.kind === 'slot').map(r => itemLabel(r))]; })), [false, 'slotv', ['성탄 전야 예배 설교']]);
  // 낡은 앱(b13 — specs · 특별예배 자리를 모름)이 떨군 사본을 써도
  const old = JSON.parse(JSON.stringify(d14b.b18)); delete old.specs; old.slots = old.slots.filter(x => !/\|x\d\|/.test(x.id));
  await admin(db => db.doc('rota/' + HB).set({ b13: old }, { merge: true }));
  await sleep(1500); const d14c = await getDoc('rota/' + HB);
  ok('⑭ 낡은 앱(b13)과 합쳐도 특별예배 · 자리 그대로(계정 · 앱) · 바뀐 게 없으니 다시 안 씀', d14c && [d14c.b18.specs.length, d14c.b18.slots.some(x => x.id === '2026-12-24|x1|preach'), await hb.evaluate(() => live(S.book.specs).length)], [1, true, 1]);
}

console.log('⑮ (1117-Z 1) 숙소 금액 · 취소 기한은 HB 전용 — 교역자 화면에서 감추고 고치지 못한다');
{
  const V = 'v|2026-11-22';
  // HB 가 내 방문(교역자 가나다)에 예약 완료 호텔 + 금액 · 취소 기한 · 환불 불가 숙소를 적는다
  await hb.evaluate((V) => { const v = S.book.visits.find(x => x.id === V);
    put(S.book, 'visits', Object.assign({}, JSON.parse(JSON.stringify(v)), { stay: [{ kind: 'hotel', name: '비밀 호텔', status: 'done', cost: 150000, nights: 1, cancelBy: '2026-11-20', cancelAt: '18:00' }, { kind: 'hotel', name: '둘째 호텔', status: 'pre', cost: 70000, nights: 1, nofree: true }] }), byNow(), Date.now()); saveBook(); render(); }, V);
  const hbHas = await hb.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'busan'; S.ym = '2026-11'; render(); return [[...document.querySelectorAll('#panel .tsheet.bt th')].map(t => t.textContent).filter(x => /금액|취소 기한/.test(x)), /22만원/.test(document.querySelector('#panel').innerText)]; });
  ok('⑮ HB 부산 요약: 금액 · 취소 기한 열과 값이 그대로', hbHas, [['금액', '취소 기한'], true]);
  const gsee = await until(() => ga.evaluate((V) => { const s = S.book.visits.find(x => x.id === V).stay; return s.length === 2 && s[0].name === '비밀 호텔' ? s.map(x => [x.cost, x.cancelBy || '', !!x.nofree]) : null; }, V));
  ok('⑮ 교역자 앱의 책: 숙소 이름은 오고 금액 · 기한 · 환불 불가는 없다', gsee, [[0, '', false], [0, '', false]]);
  const PRIV = /22만원|15만원|7만원|150,000|11\/20|18:00|취소 기한|환불 불가|취소는/;
  const g = await ga.evaluate(() => { const out = {};
    PREF.tab = 'month'; PREF.mview = 'busan'; S.ym = '2026-11'; render(); const p = document.querySelector('#panel');
    out.th = [...p.querySelectorAll('.tsheet.bt th')].map(t => t.textContent); out.busan = p.innerText; out.cells = p.querySelectorAll('[data-vcol="cost"], [data-vcol="cancel"]').length;
    PREF.tab = 'week'; S.sun = '2026-11-22'; S.wm = 'cal'; render(); out.week = document.querySelector('#panel').innerText;
    PREF.tab = 'month'; PREF.mview = 'mine'; render(); out.mine = document.querySelector('#panel').innerText; return out; });
  ok('⑮ 교역자 부산 요약: 금액 · 취소 기한 열 · 칸이 없다', [g.th.includes('금액') || g.th.includes('취소 기한'), g.cells, g.th.includes('숙소')], [false, 0, true]);
  ok('⑮ 교역자 화면 글(부산 요약 · 이번 주 · 내 일정)에 금액 · 기한이 없다', [PRIV.test(g.busan), PRIV.test(g.week), PRIV.test(g.mine), /비밀 호텔/.test(g.busan)], [false, false, false, true]);
  // 교역자 숙소 판
  await ga.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'busan'; render(); }); await sleep(200);
  await ga.click(`#panel [data-visit="${V}"][data-vcol="stay"][data-i="0"]`); await sleep(400);
  const gp = await ga.evaluate(() => { const p = document.querySelector('#pane'); return { cost: !!p.querySelector('[data-dcost], [data-dstep="cost"]'), cancel: !!p.querySelector('[data-df="cancelBy"], [data-df="cancelAt"]'), nofree: !!p.querySelector('[data-act="dnofree"]'), img: !!p.querySelector('[data-act="dimg"]') || /예약 화면 캡쳐/.test(p.textContent), st: [...p.querySelectorAll('[data-dset="status"]')].map(b => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')), all: p.innerText }; });
  ok('⑮ 교역자 숙소 판: 금액 · 취소 기한 · 환불 불가 · 예약 화면 칸이 없고 상태는 그대로 고를 수 있다', [gp.cost, gp.cancel, gp.nofree, gp.img, gp.st, PRIV.test(gp.all)], [false, false, false, false, ['미정', '예약 전', '예약 완료*', '취소'], false]);
  // 숨은 단추를 억지로 눌러도(낡은 화면 흉내) 초안이 안 바뀐다
  const forced = await ga.evaluate(() => { for (const h of ['<button data-dstep="cost" data-d="5000">x</button>', '<button data-act="dnofree">x</button>']) { const w = document.createElement('div'); w.innerHTML = h; document.querySelector('#pane').appendChild(w); w.firstChild.click(); w.remove(); }
    return [S.pane.edit.d.cost || 0, !!S.pane.edit.d.nofree]; });
  ok('⑮ 교역자가 금액 −/+ · 환불 불가를 억지로 눌러도 막힌다(staffOk)', forced, [0, false]);
  // 상태를 예약 전으로 바꿔 저장 → 자기 칸에 금액 · 기한 없음 → HB 책은 금액 · 기한 그대로 + 상태만 바뀜
  await ga.click('#pane [data-dset="status"][data-v="pre"]'); await sleep(100); await ga.click('#pane [data-act="vsave"]'); await sleep(300);
  const s15 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); const s = x && x.visits[V].stay; return s && s[0].name === '비밀 호텔' && s[0].status === 'pre' ? s : null; });
  ok('⑮ 교역자 칸: 상태만 바뀌고 금액 · 기한은 싣지 않는다', s15 && s15.map(x => [x.name, x.status, x.cost || 0, 'cancelBy' in x, 'nofree' in x]), [['비밀 호텔', 'pre', 0, false, false], ['둘째 호텔', 'pre', 0, false, false]]);
  const d15 = await until(async () => { const d = await getDoc('rota/' + HB); const s = d.b18.visits.find(x => x.id === V).stay; return s[0].status === 'pre' ? s : null; });
  ok('⑮ HB 앱이 받아 계정(b15): 상태는 교역자 것 · 금액 · 기한 · 환불 불가는 HB 것 그대로', d15 && d15.map(x => [x.status, x.cost, x.cancelBy || '', x.cancelAt || '', !!x.nofree]), [['pre', 150000, '2026-11-20', '18:00', false], ['pre', 70000, '', '', true]]);
  // 낡은 교역자 앱이 자기 칸에 금액을 바꿔 써도 HB 책은 그대로
  await admin(db => db.doc('rota/' + HB + '/staff/' + GA).set({ visits: { [V]: { stay: [{ kind: 'hotel', name: '비밀 호텔', status: 'pre', cost: 1, cancelBy: '2026-12-31' }, { kind: 'hotel', name: '둘째 호텔', status: 'done', cost: 2 }], stayAt: Date.now() + 1000 } } }, { merge: true }));
  const d15b = await until(async () => { const d = await getDoc('rota/' + HB); const s = d.b18.visits.find(x => x.id === V).stay; return s[1].status === 'done' ? s : null; });
  ok('⑮ 낡은 교역자 앱이 금액 · 기한을 바꿔 보내도 받지 않는다(상태만 받음)', d15b && d15b.map(x => [x.status, x.cost, x.cancelBy || '']), [['pre', 150000, '2026-11-20'], ['done', 70000, '']]);
  await ga.evaluate(() => closePane()); await sleep(300);
}

console.log('⑯ (1117-Z 2) 알림 판 — HB 만 · 줄을 누르면 그 판 · 접기는 이 기기에 기억 · 넓으면 오른쪽 기둥');
{
  // HB 가 다섯 주 뒤 주일에 예약 완료 호텔(취소 기한 이틀 뒤)을 적는다 — 날짜는 오늘에서 셈(시험 날짜와 상관없이)
  const VZ = await hb.evaluate(() => { const td = todayYmd(), sun = visitSun(addDays(td, 35)), id = visitId(sun);
    put(S.book, 'visits', { id, who: ['pa'], days: '토일', stay: [{ kind: 'hotel', name: '알림 호텔', status: 'done', nights: 1, cancelBy: addDays(td, 2), cancelAt: '18:00' }] }, byNow(), Date.now()); saveBook();
    PREF.tab = 'week'; PREF.afold = false; S.acat = ''; S.sun = sunOf(td); S.wm = 'cal'; render(); return id; });
  const p1 = await hb.evaluate(() => { const p = document.querySelector('#panel .apanel'); return p && { chips: [...p.querySelectorAll('.achip')].map(b => b.textContent.replace(/\d+$/, '')), sel: p.querySelector('.achip[aria-selected="true"]').textContent.replace(/\d+$/, ''), rows: [...p.querySelectorAll('.arow')].map(r => r.innerText) }; });
  ok('⑯ HB 이번 주 맨 위에 판: 갈래 넷 · 처음엔 급함 · 알림 호텔 취소 기한(D-2)', p1 && [p1.chips, p1.sel, p1.rows.some(t => /알림 호텔 취소 기한 18:00/.test(t) && /D-2/.test(t))], [['급함', '부산', '분당', '확인'], '급함', true]);
  const tabsSame = await hb.evaluate(() => ['month', 'busan', 'people'].map(t => { PREF.tab = t; render(); return document.querySelectorAll('#panel .apanel').length; }));
  ok('⑯ 네 탭 모두 같은 판 하나(달력표 · 부산 · 사람에도)', tabsSame, [1, 1, 1]);
  // 줄이 많아도 줄끼리 겹치지 않는다(목록 높이를 막아도 줄은 눌리지 않고 목록이 굴러간다 — v. 26-1118-2 폰에서 겹쳤음)
  const ov = await hb.evaluate(() => { PREF.tab = 'busan'; PREF.bdet = true; S.acat = 'bd'; render(); const rs = [...document.querySelectorAll('#panel .arow')].map(r => [r.offsetTop, r.offsetHeight, r.querySelector('.am').offsetHeight + 12]);   // 줄 높이 ≥ 글 높이 + 위아래 여백(6 + 6)
    return { n: rs.length, overlap: rs.some((r, i) => i && r[0] < rs[i - 1][0] + rs[i - 1][1]), squeezed: rs.some(r => r[1] < r[2]) }; });
  ok('⑯ 줄이 많아도 줄끼리 겹치지 않고 글자가 줄 밖으로 넘치지 않는다', [ov.n > 6, ov.overlap, ov.squeezed], [true, false, false]);
  await hb.evaluate(() => { S.acat = ''; PREF.tab = 'week'; render(); });
  ok('⑯ 옛 알림 자리(겹침 목록 · 챙길 것 · 그다음 줄)는 없다', await hb.evaluate(() => { PREF.tab = 'week'; render(); return document.querySelectorAll('#panel > .alerts, #panel .wafter').length; }), 0);
  // 줄을 누르면 그 판 — 숙소 판의 그 숙소, 취소 기한 칸(빨간 테두리)
  await hb.click('#panel .arow:has-text("알림 호텔")'); await sleep(400);
  ok('⑯ 취소 기한 줄 → 그 부산 일정의 숙소 판 · 그 숙소 · 기한 칸 · 기한 글이 빨강', await hb.evaluate((VZ) => [S.pane && S.pane.kind, S.pane && S.pane.id === VZ, S.pane.edit && S.pane.edit.sec, S.pane.edit && S.pane.edit.i, S.pane.edit && S.pane.edit.focus, !!document.querySelector('#pane .flabel .badc')], VZ), ['visit', true, 'stay', 0, 'cancel', true]);
  await hb.evaluate(() => closePane()); await sleep(500);
  await hb.click('#panel .achip[data-acat="bd"]'); await sleep(400);
  await hb.click('#panel .apanel .arow >> nth=0'); await sleep(400);
  ok('⑯ 분당 갈래 → 줄을 누르면 사람 고르기 판', await hb.evaluate(() => [S.acat, S.pane && S.pane.kind]), ['bd', 'pick']);
  await hb.evaluate(() => closePane()); await sleep(500);
  // 접기 — 한 줄(급함 · 미정)로, 이 기기에 기억(책 · 계정에는 없음)
  await hb.click('#panel .apanel [data-act="afold"]'); await sleep(500);
  const f1 = await hb.evaluate(() => { const p = document.querySelector('#panel .apanel'); return [p.classList.contains('fold'), /급함 \d+/.test(p.innerText) && /미정 \d+/.test(p.innerText), p.querySelectorAll('.arow').length, JSON.parse(localStorage.getItem('rota_pref_v1')).afold]; });
  ok('⑯ 접으면 한 줄(급함 n · 미정 n) · 목록 없음 · 이 기기(localStorage)에 기억', f1, [true, true, 0, true]);
  const pg2 = await hb.context().newPage(); await pg2.goto(ROOT); await sleep(800);
  ok('⑯ 같은 기기에서 새로 열어도 접힌 채', await pg2.evaluate(() => { PREF.tab = 'week'; render(); const p = document.querySelector('#panel .apanel'); return !!p && p.classList.contains('fold'); }), true);
  await pg2.close();
  const dz = await getDoc('rota/' + HB);
  ok('⑯ 접은 것은 계정 문서 · 책에 없다', [JSON.stringify(dz).includes('afold'), 'afold' in (dz.ui || {})], [false, false]);
  // 넓은 화면 — 같은 판이 오른쪽 기둥(360px) · 접으면 얇은 띠(64px)
  await hb.setViewportSize({ width: 1280, height: 860 }); await sleep(300);
  await hb.evaluate(() => { PREF.afold = false; savePref(); render(); }); await sleep(400);
  const w1 = await hb.evaluate(() => ({ side: !!document.querySelector('#side .apanel'), inPanel: !!document.querySelector('#panel .apanel'), w: Math.round(document.querySelector('#side').getBoundingClientRect().width), sided: document.querySelector('#wrap').classList.contains('sided') }));
  ok('⑯ 넓은 화면: 판은 오른쪽 기둥(360px)에만 · 왼쪽 화면에는 없음', w1, { side: true, inPanel: false, w: 360, sided: true });
  await hb.click('#side [data-act="afold"]'); await sleep(700);
  ok('⑯ 넓은 화면에서 접으면 얇은 띠(64px) · 급함 개수는 그대로 보임', await hb.evaluate(() => [Math.round(document.querySelector('#side').getBoundingClientRect().width), !!document.querySelector('#side .astrip .acnt')]), [64, true]);
  await hb.click('#side [data-act="afold"]'); await sleep(700);
  await hb.setViewportSize({ width: 390, height: 844 }); await sleep(300); await hb.evaluate(() => render());
  // 교역자 — 따로 거른 판(1117-Z 2c): 겹침 · 확인 + 내 부산 일정 교통편 · 상영만. 금액 · 취소 기한 · 숙소 · 분당 빈 자리는 없다
  const g16 = await ga.evaluate(() => { PREF.tab = 'week'; PREF.afold = false; render(); const A = alertData();
    return { cats: [...document.querySelectorAll('#panel .achip')].map(b => b.dataset.acat), kinds: [...new Set(A.items.map(x => x.kind))].filter(k => ['cancel', 'stay', 'who', 'lead', 'novisit', 'preach', 'offer', 'notice'].includes(k)),
      bd: A.n.bd, own: A.items.filter(x => x.cat === 'busan').every(x => x.kind === 'show' || (x.kind === 'travel' && S.book.visits.find(v => v.id === x.to.visit).who.includes(myPid()))),
      busan: A.items.filter(x => x.cat === 'busan').length, txt: (document.querySelector('#panel .apanel') || {}).innerText || '' }; });
  ok('⑯ 교역자 판: 갈래는 급함 · 부산 · 확인(분당 없음) · 취소 기한 · 숙소 · 분당 빈 자리 줄 없음 · 부산은 내 일정 교통편 · 상영만',
    [g16.cats, g16.kinds, g16.bd, g16.own, g16.busan > 0, /알림 호텔|취소 기한/.test(g16.txt)], [['urgent', 'busan', 'chk'], [], 0, true, true, false]);
  await ga.click('#panel .achip[data-acat="busan"]'); await sleep(300); await ga.click('#panel .apanel .arow >> nth=0'); await sleep(400);
  ok('⑯ 교역자: 교통 미정 줄 → 내 부산 일정의 교통 판', await ga.evaluate(() => [S.pane && S.pane.kind, S.pane && S.pane.edit && S.pane.edit.sec, myVisit(curVisit())]), ['visit', 'travel', true]);
  await ga.evaluate(() => closePane()); await sleep(500);
  await ga.setViewportSize({ width: 1280, height: 860 }); await sleep(300);
  ok('⑯ 교역자 넓은 화면: 같은 판이 오른쪽 기둥에', await ga.evaluate(() => { render(); return [document.querySelector('#wrap').classList.contains('sided'), !!document.querySelector('#side .apanel'), !!document.querySelector('#panel .apanel')]; }), [true, true, false]);
  await ga.setViewportSize({ width: 390, height: 844 });
  await hb.evaluate((VZ) => { drop(S.book, 'visits', VZ, byNow(), Date.now()); saveBook(); }, VZ);
}

console.log('⑰ (1117-Z 2c) 주보 담당 — 사람 탭에서 순번 · 그 달 담당 → 계정 b15 · 그 달 주보 담당 교역자가 남의 부산 일정 상영을 고르면 HB 책에');
{
  await hb.evaluate(() => { personApply('pa', p => { p.bul = true; }); personApply('pb', p => { p.bul = true; }); PREF.tab = 'people'; render(); });
  ok('⑰ 사람 탭 맨 위 주보 담당 줄(여섯 달)', await hb.evaluate(() => document.querySelectorAll('#panel .bulm').length), 6);
  await hb.evaluate(() => openPane({ kind: 'bul', ym: '2026-11' })); await sleep(300);
  await hb.click('#pane [data-bulset="pa"]'); await sleep(300);
  const d17 = await until(async () => { const d = await getDoc('rota/' + HB); return d.b18 && (d.b18.buls || []).some(x => x.id === 'u|2026-11' && x.p === 'pa') ? d : null; });
  ok('⑰ 계정(b15): 11월 담당 = 가나다 · 순번 표시 둘', d17 && [d17.b18.people.filter(p => p.bul).map(p => p.id).sort(), 'b14' in d17], [['pa', 'pb'], false]);
  ok('⑰ 다음 달은 ㄱㄴㄷ 순으로 라마바', await hb.evaluate(() => [bulOf(S.book, '2026-11'), bulOf(S.book, '2026-12'), bulOf(S.book, '2027-01')]), ['pa', 'pb', 'pa']);
  // 교역자 가나다 = 11월 주보 담당 → 남(라마바)의 11/29 부산 일정 상영을 고를 수 있다
  const can = await until(() => ga.evaluate(() => bulOf(S.book, '2026-11') === 'pa' && bsCan('2026-11-29') && bsVisit('2026-11-29').id === 'v|2026-11-29'));
  ok('⑰ 교역자 앱: 11월 주보 담당이라 11/29(남의 일정) 상영을 고를 수 있다', !!can, true);
  await ga.evaluate(() => bsSet('2026-11-29', 'diff'));
  const d17b = await until(async () => { const d = await getDoc('rota/' + HB); const x = d.b18.shows.find(y => y.id === 's|2026-11-29'); return x && x.bs === 'diff' ? x : null; });
  ok('⑰ HB 앱이 받아 계정 책 주일 줄로(누가 = 교역자)', d17b && [d17b.bs, d17b.by.startsWith('staff:')], ['diff', true]);
  ok('⑰ 숙소 같은 다른 칸은 주보 담당이어도 남의 일정에 못 씀(그 판이 안 열림)', await ga.evaluate(() => { openVisitCol('v|2026-11-29', 'stay', 0); const e = !!(S.pane && S.pane.edit); closePane(); return e; }), false);
  await sleep(500);
}

console.log('⑱ (1117-Z 2b) 알림 판 기간 — 필터 아이콘 → 부산 · 분당 따로 · 계정(ui.al)에 · 책은 그대로 · 교역자는 자기 칸 ui 에');
{
  const before = JSON.stringify((await getDoc('rota/' + HB)).b18);
  const ns = (o) => (o == null ? o : JSON.parse(JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v))));   // 계정에서 온 칸은 이름순
  await hb.evaluate(() => { closePane(); PREF.tab = 'week'; PREF.afold = false; render(); }); await sleep(300);
  ok('⑱ 처음 값: 부산 8주 · 분당 달 규칙(머리줄에 둘)', await hb.evaluate(() => { const td = todayYmd(), A = alertData(); return [A.toB === addDays(sunOf(td), 55), A.toD === monthEndOf(td, 21), /부산 ~/.test(document.querySelector('#panel .arng').innerText)]; }), [true, true, true]);
  await hb.click('#panel [data-act="alset"]'); await sleep(400);
  ok('⑱ 아이콘 → 설정 판(폰은 아래 판) · 부산 · 분당 탭 · 달력', await hb.evaluate(() => [S.pane && S.pane.kind, document.querySelectorAll('#pane [data-altab]').length, document.querySelectorAll('#pane .acd').length > 28]), ['alset', 2, true]);
  await hb.click('#pane [data-altab="bd"]'); await sleep(200); await hb.click('#pane [data-alwset="4"]'); await sleep(200);
  const u1 = await until(async () => { const d = await getDoc('rota/' + HB); return d.ui && d.ui.al && d.ui.al.bd ? d.ui.al : null; });
  ok('⑱ 분당 4주 → 계정 맨 위 ui.al(부산은 그대로 처음 값 — 칸 없음)', ns(u1), ns({ bd: { m: 'weeks', w: 4 } }));
  const day = await hb.evaluate(() => addDays(todayYmd(), 10)); await hb.click(`#pane [data-alday="${day}"]`); await sleep(200);
  await hb.click('#pane [data-act="alpsave"]').catch(() => { }); await hb.click('#pane [data-altab="busan"]'); await sleep(200);
  await hb.click('#pane [data-alwset="13"]'); await sleep(300);
  const noSave = await hb.evaluate(() => !document.querySelector('#pane [data-act="alpsave"]'));   // 13주 = 기본 프리셋과 같음 → 더하기 단추 없음
  const u2 = await until(async () => { const d = await getDoc('rota/' + HB); return d.ui && d.ui.al && d.ui.al.busan ? d.ui.al : null; });
  ok('⑱ 날짜를 누르면 그 날까지(분당) · 부산 13주 · 날짜는 프리셋이 안 되고 기본 셋과 같은 것도 안 더함', ns(u2 && [u2.bd, u2.busan, u2.pre || [], noSave]), ns([{ m: 'date', d: day }, { m: 'weeks', w: 13 }, [], true]));
  await hb.click('#pane [data-alwset="4"]'); await sleep(200); await hb.click('#pane [data-act="alpsave"]'); await sleep(300);
  const u3 = await until(async () => { const d = await getDoc('rota/' + HB); return d.ui && d.ui.al && (d.ui.al.pre || []).length ? d.ui.al : null; });
  ok('⑱ 내 프리셋 더하기(4주)', ns(u3 && u3.pre), ns([{ m: 'weeks', w: 4 }]));
  ok('⑱ 판 머리 기간이 바뀜 · 책(b15)은 한 글자도 그대로', [await hb.evaluate((day) => { closePane(); render(); return alertData().toD === day; }, day), JSON.stringify((await getDoc('rota/' + HB)).b18) === before], [true, true]);
  // 넓은 화면: 설정은 기둥 안에서
  await hb.setViewportSize({ width: 1280, height: 860 }); await sleep(300); await hb.evaluate(() => render());
  await hb.click('#side [data-act="alset"]'); await sleep(400);
  ok('⑱ 넓은 화면: 설정이 오른쪽 기둥 안(아래 판 없음) · × 로 목록', await hb.evaluate(() => { const a = [!!document.querySelector('#side .aset'), !S.pane]; document.querySelector('#side [data-act="alclose"]').click(); return a.concat(!!document.querySelector('#side .apanel:not(.aset)')); }), [true, true, true]);
  await hb.setViewportSize({ width: 390, height: 844 }); await sleep(300); await hb.evaluate(() => { saveUi({ al: {} }); render(); });
  // 교역자 — 자기 칸 ui 에
  await ga.evaluate(() => { closePane(); PREF.tab = 'week'; render(); }); await sleep(300);
  await ga.click('[data-act="alset"]'); await sleep(400); await ga.click('#pane [data-alwset="4"]'); await sleep(300);
  const g18 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); return x && x.ui && x.ui.al ? x.ui.al : null; });
  ok('⑱ 교역자: 기간은 자기 칸 ui.al 에(규칙 그대로) · HB 가 처음 값으로 되돌린 ui 는 al 칸이 통째로 빠짐(합치기로 옛 값이 남지 않음)', ns([g18, ((await getDoc('rota/' + HB)).ui || {}).al || null]), ns([{ busan: { m: 'weeks', w: 4 } }, null]));
  await ga.evaluate(() => closePane()); await sleep(400);
}

console.log('⑲ (1117-Z 2 고침) 낡은 앱과 핑퐁 없음 · 다시 그려도 판 스크롤 그대로 · 넓은 화면 기둥 자리 같음');
{
  // 낡은 앱(b14 만 앎)이 같은 책을 옛 칸에 써도 새 앱은 다시 쓰지 않는다 — 예전엔 지우며 쓰고, 낡은 앱이 또 쓰고 … 끝없이 돌았다
  const cur = (await getDoc("rota/" + HB)).b18, at0 = (await getDoc('rota/' + HB)).at;
  await hb.evaluate(() => { window.__r = 0; const o = window.render; window.__ro = o; window.render = function () { window.__r++; return o.apply(this, arguments); }; });
  await admin(db => db.doc('rota/' + HB).set({ b14: cur }, { merge: true }));
  await sleep(2500);
  const d19 = await getDoc('rota/' + HB);
  ok('⑲ 낡은 앱이 같은 책을 옛 칸(b14)에 써도 새 앱은 안 씀(옛 칸 그대로 · at 그대로) · 다시 그림은 한두 번', [!!d19.b14, d19.at === at0, await hb.evaluate(() => window.__r <= 2)], [true, true, true]);
  await hb.evaluate(() => { window.render = window.__ro; });
  // 다시 그려도(계정 갱신 흉내) 같은 갈래면 목록 스크롤이 그대로, 갈래를 바꾸면 맨 위
  const sc19 = await hb.evaluate(async () => { closePane(); PREF.tab = 'week'; PREF.afold = false; S.acat = 'bd'; saveUi({ al: { bd: { m: 'weeks', w: 26 } } }); render();
    const l = document.querySelector('#panel .alist'); l.scrollTop = 120; const a = l.scrollTop; render(); const b = document.querySelector('#panel .alist').scrollTop;
    document.querySelector('#panel [data-acat="chk"]').click(); await new Promise(r => setTimeout(r, 400)); document.querySelector('#panel [data-acat="bd"]').click(); await new Promise(r => setTimeout(r, 400));
    const c = document.querySelector('#panel .alist').scrollTop; saveUi({ al: {} }); S.acat = ''; render(); return [a > 0, b === a, c]; });
  ok('⑲ 다시 그려도 같은 갈래 목록은 그 자리 · 갈래를 바꾸고 오면 맨 위', sc19, [true, true, 0]);
  // 넓은 화면: 갈래마다 기둥이 같은 높이(긴 목록 · 짧은 목록)
  await hb.setViewportSize({ width: 1440, height: 900 }); await sleep(300);
  const tops = await hb.evaluate(async () => { saveUi({ al: { bd: { m: 'weeks', w: 26 }, busan: { m: 'weeks', w: 26 } } }); render(); const out = [];
    for (const c of ['urgent', 'bd', 'chk', 'busan']) { const b = document.querySelector(`#side [data-acat="${c}"]`); if (b) b.click(); await new Promise(r => setTimeout(r, 450)); out.push(Math.round(document.querySelector('#side').getBoundingClientRect().top)); }
    saveUi({ al: {} }); S.acat = ''; render(); return out; });
  ok('⑲ 넓은 화면: 갈래를 바꿔도 기둥이 툭 올라가지 않는다(모두 같은 높이)', new Set(tops).size, 1);
  await hb.setViewportSize({ width: 390, height: 844 }); await sleep(300);
}

console.log('⑳ (1117-Z 3) 메뉴 세 탭 · 부산 탭 지난 일정 단추');
{
  const tabsOf = (pg) => pg.evaluate(async () => { closePane(); closeMenu(); openMenu(); await new Promise(r => setTimeout(r, 200));
    const names = [...document.querySelectorAll('#menu .mtab')].map(b => b.textContent), out = { names, has: {} };
    for (const b of [...document.querySelectorAll('#menu .mtab')]) { b.click(); await new Promise(r => setTimeout(r, 600));
      out.has[b.textContent] = ['theme', 'home', 'logout', 'myavail', 'wpull', 'importpick', 'upd'].filter(k => k === 'theme' ? !!document.querySelector('#menu [data-theme]') : !!document.querySelector(`#menu [data-act="${k}"]`)); }
    closeMenu(); return out; });
  const h = await tabsOf(hb), g = await tabsOf(ga);
  ok('⑳ HB: 보기(테마 · 첫 화면) · 계정(로그아웃) · 개발(예배팀 받기 · 시트 가져오기 — 버전은 개발자 계정만)', h, { names: ['보기', '계정', '개발'], has: { '보기': ['theme', 'home'], '계정': ['logout'], '개발': ['wpull', 'importpick'] } });
  ok('⑳ 교역자: 보기 · 계정 두 탭(개발 없음) · 계정에 내 부재', g, { names: ['보기', '계정'], has: { '보기': ['theme', 'home'], '계정': ['logout', 'myavail'] } });
  const bz = await hb.evaluate(async () => { const mk = (d) => ({ id: 'v|' + d, date: d, who: [], days: '토일', stay: [], travel: [] }); const pv = [mk('2025-12-28'), mk('2026-10-04'), mk('2026-10-18')];
    S.book.visits.push(...pv); PREF.tab = 'busan'; PREF.bdet = true; S.pastN = 0; render(); const w = (ms) => new Promise(r => setTimeout(r, ms)); const cnt = () => document.querySelectorAll('.pastm .vrow').length;
    const a = [document.querySelector('.vtop [data-act="pastmore"]').textContent, /다가오는 부산 일정/.test(document.body.textContent), !!document.querySelector('details.more')];
    document.querySelector('[data-act="pastmore"]').click(); await w(450); const c1 = cnt(), top1 = document.querySelector('.pastm .vrow').dataset.visit;
    document.querySelector('[data-act="pastmore"]').click(); await w(450); const c2 = cnt(), top2 = document.querySelector('.pastm .vrow').dataset.visit, band = [...document.querySelectorAll('.yband')].map(x => x.textContent);
    const seg = [document.querySelectorAll('.vtop .pseg button').length, document.querySelector('.pseg [data-act="pastmore"]').disabled];
    document.querySelector('[data-act="pastless"]').click(); await w(450); const c3 = cnt();
    document.querySelector('[data-act="pastmore"]').click(); await w(450);
    document.querySelector('[data-act="pastreset"]').click(); await w(450); const gone = !!document.querySelector('.pastm'), back = (document.querySelector('.vtop [data-act="pastmore"]') || {}).textContent;
    S.book.visits = S.book.visits.filter(v => !pv.includes(v)); PREF.tab = 'week'; render(); return a.concat(c1, top1, c2, top2, band.includes('2026년'), seg, c3, gone, back); });
  ok('⑳ 부산 탭: 맨 위 \'지난 부산 일정 보기\' · 한 달 더(10월 둘 → 12월이 위로) · 2026년 띠 · 펴면 세 칸(끝이면 + 꺼짐) · 한 달 접기 · ↺ 모두 접기 → 처음 글자 단추', bz, ['지난 부산 일정 보기', false, false, 2, 'v|2026-10-04', 3, 'v|2025-12-28', true, 3, true, 2, false, '지난 부산 일정 보기']);
}

console.log('㉑ (1117-Z 4) 부산 광고 판: 아래 줄 · 전달용 텍스트(고친 글은 계정 공통)');
{
  const SUN = '2026-11-22', paneOf = (pg) => pg.evaluate(() => { const p = $('#pane'); return {
    sub: !!p.querySelector('.phead .sub'), foot: [...p.querySelectorAll('.adfoot > *')].map(x => x.textContent.trim()).filter(Boolean).map(t => t.replace(/\d\d:\d\d/, 'hh:mm')),
    kakao: /카톡용 복사/.test(p.textContent), icons: [...p.querySelectorAll('.adtxi button')].map(b => b.dataset.act + (b.disabled ? ':off' : '')),
    pre: (p.querySelector('.adtxpre') || {}).textContent || '', ta: !!p.querySelector('#ads-tx'), note: !!p.querySelector('.adtxnote') }; });
  await hb.evaluate(async (s) => { closePane(); await new Promise(r => setTimeout(r, 450)); adsOpen(s); }, SUN); await until(() => hb.evaluate(() => S.pane && S.pane.state === 'done' && !S.pane.stale));
  const h0 = await paneOf(hb);
  ok('㉑ HB: 제목 밑 글 없음 · 아래 오른쪽 = 읽기만 · 읽은 때 · 다시 읽기 · 연결 끊기 · 카톡용 복사 단추 없음 · 아이콘 ↻(꺼짐) ✎ 복사 · 만든 글',
    [h0.sub, h0.foot, h0.kakao, h0.icons, h0.pre.split('\n')[0], h0.note], [false, ['Monday 에서 읽기만 합니다', '읽은 때 hh:mm', '다시 읽기', 'Monday 연결 끊기'], false, ['adtxreset:off', 'adtxedit', 'adscopy'], '11/22(주일) 부산 주일예배 광고', false]);
  await hb.click('#pane [data-act="adtxedit"]'); await sleep(200);
  ok('㉑ ✎ → 글 칸(만든 글 그대로) · 아이콘은 ✓ · ↻ 꺼짐', await hb.evaluate(() => [$('#ads-tx').value.split('\n')[0], document.activeElement.id, [...document.querySelectorAll('#pane .adtxi button')].map(b => b.ariaLabel + (b.disabled ? ':off' : ''))]),
    ['11/22(주일) 부산 주일예배 광고', 'ads-tx', ['원래 글로 되돌리기:off', '다 고쳤음', '복사']]);
  await hb.fill('#ads-tx', '11/22 부산 광고\n고친 전달 글'); await hb.click('#pane [data-act="adtxedit"]'); await sleep(200);
  const h1 = await paneOf(hb);
  ok('㉑ ✓ → 고친 글이 말풍선에 · ↻ 켜짐 · \'고친 글입니다\' 안내', [h1.ta, h1.pre, h1.icons[0], h1.note], [false, '11/22 부산 광고\n고친 전달 글', 'adtxreset', true]);
  const d1 = await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b18 && (d.b18.adtx || []).find(x => x.id === 't|' + SUN); return r && r.tx ? d : null; });
  ok('㉑ 계정 책(b16) adtx 주일 줄에 · 상영 줄은 그대로', d1 && [d1.b18.adtx.find(x => x.id === 't|' + SUN).tx, d1.b18.shows.find(x => x.id === 's|' + SUN).bs], ['11/22 부산 광고\n고친 전달 글', 'same']);
  ok('㉑ 교역자 화면(그 주일 부산 교역자)에도 같은 고친 글', await until(() => ga.evaluate((s) => adtxOf(S.book, s) || null, SUN)), '11/22 부산 광고\n고친 전달 글');
  await ga.evaluate(async (s) => { closePane(); await new Promise(r => setTimeout(r, 450)); adsOpen(s); }, SUN); await until(() => ga.evaluate(() => S.pane && S.pane.state === 'done' && !S.pane.stale));
  const g1 = await paneOf(ga);
  ok('㉑ 교역자 판: 고친 글 · 아이콘 셋 · 연결 끊기 없음', [g1.pre, g1.icons, g1.foot], ['11/22 부산 광고\n고친 전달 글', ['adtxreset', 'adtxedit', 'adscopy'], ['Monday 에서 읽기만 합니다', '읽은 때 hh:mm', '다시 읽기']]);
  // 복사 — 지금 보이는 글
  await ga.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:8765' });
  await ga.click('#pane [data-act="adscopy"]'); await sleep(200);
  ok('㉑ 복사 = 지금 보이는 고친 글', await ga.evaluate(() => navigator.clipboard.readText()), '11/22 부산 광고\n고친 전달 글');
  await ga.click('#pane [data-act="adtxreset"]'); await sleep(200);
  const g2 = await paneOf(ga);
  ok('㉑ 교역자 ↻ → 바로 만든 글 · ↻ 꺼짐', [g2.pre.split('\n')[0], g2.icons[0]], ['11/22(주일) 부산 주일예배 광고', 'adtxreset:off']);
  const st = await until(async () => { const s = await getDoc('rota/' + HB + '/staff/' + GA); const v = s && s.visits && s.visits['v|' + SUN]; return v && v.txAt ? v : null; });
  ok('㉑ 교역자는 자기 칸 그 방문 줄에(tx = \'\')', st && st.tx, '');
  ok('㉑ HB 앱이 받아 계정 책 줄이 지우기 표지로 → HB 판도 만든 글', await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b18.adtx.find(x => x.id === 't|' + SUN); return r && r.del ? (await paneOf(hb)).pre.split('\n')[0] : null; }), '11/22(주일) 부산 주일예배 광고');
  // 남의 주일 — 복사만 (11월은 가나다가 주보 담당이라(⑰) 12월 주일로)
  await ga.evaluate(async () => { closePane(); await new Promise(r => setTimeout(r, 450)); adsOpen('2026-12-06'); }); await until(() => ga.evaluate(() => S.pane && S.pane.state === 'done'));
  ok('㉑ 교역자: 내 일정이 아닌 주일은 복사만(고치기 · 되돌리기 없음)', (await paneOf(ga)).icons, ['adscopy']);
  await ga.evaluate(() => { const b = document.createElement('button'); b.dataset.act = 'adtxedit'; $('#pane .adtxi').appendChild(b); b.click(); }); await sleep(200);
  ok('㉑ 숨은 단추를 억지로 눌러도 글 칸이 안 열림 · 자기 칸에 안 씀', await ga.evaluate(() => [!!document.querySelector('#ads-tx'), !!(S.pane && S.pane.txEdit), !!(FB.my && FB.my.visits && Object.keys(FB.my.visits).some(k => k >= 'v|2026-12-01' && 'tx' in FB.my.visits[k]))]), [false, false, false]);
  await ga.evaluate(() => closePane()); await hb.evaluate(() => closePane());
  // E — 빈 날짜 칸 글자는 한 줄
  ok('㉑ (E) 빈 날짜 칸 \'날짜\' 는 한 줄 · 줄지 않음', await hb.evaluate(async () => { const i = document.createElement('input'); i.type = 'date'; i.required = true; i.placeholder = '날짜'; i.className = 'inp'; const w = document.createElement('div'); w.className = 'dtpair'; w.style.width = '120px'; w.appendChild(i); document.body.appendChild(w);
    const c = getComputedStyle(i, '::before'), r = [c.whiteSpace, c.flexShrink]; w.remove(); return r; }), ['nowrap', '0']);
}

{
  console.log('㉒ 숙소 목록 손잡이 · \'더 보기\' 줄 · 부산 목록 줄 (1117-Z 5)');
  const V = 'v|2026-11-22';
  await hb.evaluate(async () => { closePane(); await new Promise(r => setTimeout(r, 450)); PREF.tab = 'busan'; PREF.bdet = true; render(); }); await sleep(200);
  await hb.evaluate((v) => openPane({ kind: 'visit', id: v }), V); await sleep(400);
  await hb.click('#pane [data-vsec="stay"]'); await sleep(250);
  await hb.click('#pane [data-vmanage="stay"]'); await sleep(250);
  const rows = () => hb.$$eval('#mglist > .mgitem', els => els.map(e => e.dataset.mid === '-more-' ? '──' : e.querySelector('.mgname span').textContent));
  const r0 = await rows();
  ok('㉒ 목록 관리: 꺾쇠 없음 · 줄마다 손잡이 · 맨 아래 \'더 보기\' 줄', [await hb.$$eval('#pane [data-mmove]', e => e.length), await hb.$$eval('#mglist .mghd', e => e.length), r0[r0.length - 1], r0.length >= 3], [0, r0.length, '──', true]);
  // 맨 아래 줄을 손잡이로 맨 위로
  const drag = async (from, to) => { await hb.evaluate(() => { const p = $('#pane'); if (p) p.scrollTop = 0; }); await hb.locator(`#mglist > .mgitem >> nth=${from}`).scrollIntoViewIfNeeded(); await sleep(100); const h = await hb.locator(`#mglist > .mgitem >> nth=${from}`).locator('.mghd').boundingBox(), t = await hb.locator(`#mglist > .mgitem >> nth=${to}`).boundingBox();
    await hb.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await hb.mouse.down();
    for (let i = 1; i <= 12; i++) { await hb.mouse.move(h.x + h.width / 2, h.y + h.height / 2 + (t.y + 4 - (h.y + h.height / 2)) * i / 12); await sleep(16); }
    await hb.mouse.up(); await sleep(350); };
  await drag(r0.length - 2, 0);
  const r1 = await rows();
  ok('㉒ 손잡이로 끌어 맨 위로 — 차례가 바뀜', r1, [r0[r0.length - 2]].concat(r0.slice(0, r0.length - 2), ['──']));
  await drag(r1.length - 1, 1);
  const r2 = await rows();
  ok('㉒ \'더 보기\' 줄을 둘째 자리로 → 그 아래는 접힘(토스트)', [r2.indexOf('──'), hb.toasts.slice(-1)[0]], [1, '차례를 바꿨습니다\n\'더 보기\' 아래는 숙소 판에서 접힙니다']);
  const hidden = r2.slice(2), d1 = await until(async () => { const d = await getDoc('rota/' + HB); const m = (d.b18.opts || []).filter(o => o.type === 'stay' && o.kind === 'hotel' && !o.del && o.more).map(o => o.name).sort(); return m.length === hidden.length ? d : null; });
  ok('㉒ 계정 책(b17) 숙소 줄에 more · 차례도', d1 && [d1.b18.opts.filter(o => o.type === 'stay' && o.kind === 'hotel' && !o.del && o.more).map(o => o.name).sort(), d1.b18.opts.filter(o => o.type === 'stay' && o.kind === 'hotel' && !o.del).sort((a, b) => a.ord - b.ord).map(o => o.name)], [hidden.slice().sort(), r2.filter(x => x !== '──')]);
  await hb.click('#pane [data-act="vmback"]'); await sleep(250);
  const pills = () => hb.$$eval('#spills .tg', e => e.map(x => x.textContent.trim()).filter(t => !/목록에 없음/.test(t)));   // 지금 숙소가 목록 밖이면 그 알약은 따로
  const cur = await hb.evaluate(() => S.pane.edit.d.name);
  ok('㉒ 숙소 판: 위 숙소만 + \'더 보기 n\' (고른 숙소가 아래면 펴 둠)', await pills(), hidden.includes(cur) ? [r2[0]].concat(hidden, ['접기', '+ 새 호텔']) : [r2[0], '더 보기 ' + hidden.length, '+ 새 호텔']);
  // 교역자 화면도 같은 책
  await ga.evaluate(async (v) => { closePane(); await new Promise(r => setTimeout(r, 450)); openPane({ kind: 'visit', id: v }); }, V); await sleep(400);
  await ga.click('#pane [data-vsec="stay"]'); await sleep(250);
  const gp = await ga.$$eval('#spills .tg', e => e.map(x => x.textContent.trim()));
  ok('㉒ 교역자 숙소 판도 접힘(같은 책) · 목록 관리 없음', [gp.some(x => /^더 보기 \d|^접기$/.test(x)), !!(await ga.$('#pane [data-vmanage]'))], [true, false]);
  if (gp.some(x => /^더 보기/.test(x))) { await ga.click('#pane [data-act="spmore"]'); await sleep(350); ok('㉒ 교역자도 \'더 보기\' 로 펼 수 있다', (await ga.$$eval('#spills .spill', e => e.length)) === r2.length - 1, true); }
  await ga.evaluate(() => closePane()); await hb.evaluate(() => closePane()); await sleep(450);
  // 낡은 앱(b16 — more 를 모름)이 같은 책을 써도 more 그대로
  const old = JSON.parse(JSON.stringify(d1.b18)); old.opts.forEach(o => delete o.more);
  await admin(db => db.doc('rota/' + HB).set({ b16: old }, { merge: true }));
  await sleep(1500);
  const d2 = await getDoc('rota/' + HB);
  ok('㉒ 낡은 앱(b16) 사본과 합쳐도 more 그대로(계정 · 앱)', [d2.b18.opts.filter(o => o.type === 'stay' && o.more).length, await hb.evaluate(() => optList(S.book, 'stay').filter(o => o.more).length)], [hidden.length, hidden.length]);
  // 부산 목록 줄
  const rowv = await hb.evaluate((v) => { PREF.tab = 'busan'; PREF.bdet = true; render(); const b = document.querySelector(`#panel .vrow[data-visit="${v}"]`); return { vst: !!b.querySelector('.vst .vss'), du: !!b.querySelector('.vwk .du'), red: (b.querySelector('.vred') || {}).textContent || '' }; }, V);
  ok('㉒ 부산 목록 줄: 오른쪽 숙소 · 요일 칸 아래 맡은 일(1117-Z 7) · 빨강은 특이사항 · 중요만', [rowv.vst, rowv.du, rowv.red.length > 0], [true, true, false]);
  // 달력표 금요 표: 꺾쇠 알약 바탕 없음 · 아래 꺾쇠는 표 밖 상자 테두리 위 · 아래 여백 없음
  const ed = await hb.evaluate(() => { PREF.tab = 'month'; PREF.mview = 'sheet'; render(); const box = document.querySelector('.extbox'), w = box.querySelector('.tblwrap'), b = box.querySelector(':scope > .edge.bot'), c = box.querySelector('td.edged');
    const br = b.getBoundingClientRect(), wr = w.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { bg: getComputedStyle(box.querySelector('.edge.top')).backgroundColor, pad: getComputedStyle(w).paddingBottom, onLine: Math.abs((br.top + br.height / 2) - wr.bottom) <= 2, mid: Math.abs((br.left + br.width / 2) - (cr.left + cr.width / 2)) <= 2 }; });
  ok('㉒ 꺾쇠: 알약 바탕 없음 · 표 아래 여백 0 · 아래 꺾쇠는 테두리 위 · 날짜 칸 가운데', [ed.bg, ed.pad, ed.onLine, ed.mid], ['rgba(0, 0, 0, 0)', '0px', true, true]);
  const ex = await hb.evaluate(() => { PREF.mview = 'busan'; render(); const n0 = document.querySelectorAll('table.bt tr').length; document.querySelector('.extbox [data-ext="busan"][data-dir="b"]').click(); const n1 = document.querySelectorAll('table.bt tr').length;
    document.querySelector('.extbox [data-ext="busan"][data-dir="b"][data-c="1"]').click(); return [n1 >= n0, document.querySelectorAll('table.bt tr').length === n0, !!document.querySelector('.extbox > .edge.bot [data-ext="busan"]')]; });
  ok('㉒ 부산 요약 표 위 · 아래 꺾쇠: 앞 주 펴고 접기', ex, [true, true, true]);
  ok('㉒ 달력표 단추 줄(예배별 …)은 표 위 제자리(메뉴 밑줄과 이름이 겹쳐 아래로 떨어지던 것)', await hb.evaluate(() => getComputedStyle(document.querySelector('#panel .mbar')).position), 'static');
}

{
  console.log('㉓ 메모 중요 · 일반 · 부산 요약 특이사항 칸 · 분당 주일 꺾쇠 (1117-Z 5b)');
  const V = 'v|2026-11-22';
  await hb.evaluate(async (v) => { closePane(); await new Promise(r => setTimeout(r, 450)); PREF.tab = 'busan'; PREF.bdet = true; render(); openPane({ kind: 'visit', id: v }); }, V); await sleep(400);
  await hb.click('#pane [data-vsec="note"]'); await sleep(250);
  ok('㉓ 메모 판 = 중요(빨강) · 일반 두 칸', await hb.evaluate(() => [!!$('#df-hot'), !!$('#df-note'), getComputedStyle($('#df-hot')).color === getComputedStyle(document.documentElement).getPropertyValue('--bad').trim() || /rgb\(1[5-9]\d|rgb\(2\d\d/.test(getComputedStyle($('#df-hot')).color)]), [true, true, true]);
  await hb.fill('#df-hot', '중고등부 설교 필요'); await hb.fill('#df-note', '일반 메모 글'); await hb.click('#pane [data-act="vsave"]'); await sleep(300);
  const d1 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b18 && d.b18.visits.find(x => x.id === V); return v && v.hot ? d : null; });
  ok('㉓ 계정 책(b18): hot = 중요 · note = 일반', d1 && (v => [v.hot, v.note])(d1.b18.visits.find(x => x.id === V)), ['중고등부 설교 필요', '일반 메모 글']);
  await hb.evaluate(() => closePane()); await sleep(450);
  const row = await hb.evaluate((v) => { PREF.tab = 'busan'; PREF.bdet = true; render(); const b = document.querySelector(`#panel .vrow[data-visit="${v}"]`); return [(b.querySelector('.vred') || {}).textContent || '', b.textContent.includes('일반 메모 글')]; }, V);
  ok('㉓ 부산 목록: 중요만 빨간 글자 · 일반 메모는 흐린 줄로 보임(1117-Z 7, HB 11/18)', [row[0].includes('중고등부 설교 필요'), row[1]], [true, true]);
  const wk = await hb.evaluate(() => { S.sun = '2026-11-15'; S.wm = 'cal'; PREF.tab = 'week'; PREF.wlay = 'a'; render(); return [document.querySelector('#panel').textContent.includes('중고등부 설교 필요'), document.querySelector('#panel').textContent.includes('일반 메모 글')]; });
  ok('㉓ 이번 주(그 앞 주 — 내려갈 부산 일정 카드): 중요는 보이고 일반 메모는 안 보임', wk, [true, false]);
  const sm = await hb.evaluate((v) => { PREF.tab = 'month'; S.ym = '2026-11'; PREF.mview = 'busan'; render(); const h = [...document.querySelectorAll('table.bt th')].map(x => x.textContent); const tr = document.querySelector(`table.bt button[data-visit="${v}"][data-vcol="issue"]`); return [h[0], h[1], tr && (tr.querySelector('.vred') || {}).textContent]; }, V);
  ok('㉓ 부산 요약 맨 왼쪽 \'특이사항\' 칸 = 빨간 중요 글', sm, ['특이사항', '날짜', '중고등부 설교 필요']);
  await hb.click(`table.bt button[data-visit="${V}"][data-vcol="issue"]`); await sleep(350);
  ok('㉓ 특이사항 칸을 누르면 그 일정의 특이사항 판', await hb.evaluate(() => S.pane && S.pane.edit && S.pane.edit.sec), 'issue');
  await hb.evaluate(() => closePane()); await sleep(450);
  const sn = await hb.evaluate(() => { PREF.mview = 'sheet'; S.ext = {}; render(); const n0 = document.querySelectorAll('.extbox')[0].querySelectorAll('td.wk').length; document.querySelector('.extbox [data-ext="sun"][data-dir="b"]').click();
    const box = document.querySelector('.extbox'), n1 = box.querySelectorAll('td.wk').length, up = box.querySelector('.edge.top .eu'), dn = box.querySelector('.edge.top .ed'), c = box.querySelector('td.edged').getBoundingClientRect();
    const x = (b) => { const r = b.getBoundingClientRect(); return Math.round((r.left + r.width / 2 - c.left) / c.width * 3); };
    return [n1 - n0, box.querySelector('tr.outm') !== null, x(up), x(dn), !!box.querySelector(':scope > .edge.bot [data-ext="sun"]')]; });
  ok('㉓ 분당 주일 표 위 꺾쇠 → 앞 주 한 줄 더(흐리게) · ^ 는 1/3 · v 는 2/3 자리 · 아래 꺾쇠도', sn, [1, true, 1, 2, true]);
  await hb.evaluate(() => { S.ext = {}; render(); });
}

{
  console.log('㉔ 부산 목록 한 줄 — 시안 B 요일 칸 (1117-Z 7, HB 11/18)');
  const V = 'v|2026-11-22', vp0 = hb.viewportSize();
  await hb.evaluate(async () => { closePane(); await new Promise(r => setTimeout(r, 450)); });
  const look = async (w) => { await hb.setViewportSize({ width: w, height: 900 }); return hb.evaluate((v) => { PREF.tab = 'busan'; PREF.bdet = true; render();
    const b = document.querySelector(`#panel .vrow[data-visit="${v}"]`), r = (s) => b.querySelector(s).getBoundingClientRect(), br = b.getBoundingClientRect();
    const aux = [...b.querySelectorAll('.vaux > span')].map(x => x.getBoundingClientRect().top);
    return { stRight: Math.abs(r('.vst').right - br.right) <= 4, stTop: r('.vst').top < r('.vwk').top, sdUnder: !b.querySelector('.vsd') || r('.vsd').top > r('.vss').top,
      days: [...b.querySelectorAll('.vdl.on')].map(x => x.textContent).join(''), cols: [...b.querySelectorAll('.vdl')].map(x => Math.round(x.getBoundingClientRect().left)),  auxRows: aux.length >= 2 && aux.every((t, i) => !i || t > aux[i - 1]),
      wkFull: r('.vwk').right > r('.vst').left, scroll: document.documentElement.scrollWidth <= innerWidth }; }, V); };
  const ph = await look(390), wd = await look(1024);
  const al = await hb.evaluate(() => { const rs = [...document.querySelectorAll('#panel .vrow')].filter(b => b.querySelectorAll('.vdl').length === 4).map(b => [...b.querySelectorAll('.vdl')].map(x => Math.round(x.getBoundingClientRect().left)).join(','));
    const nm = [...document.querySelectorAll('#panel .vrow .vwho>span:first-child')].every(x => x.getClientRects().length === 1 || x.getBoundingClientRect().height < 30);
    return [rs.length > 1, new Set(rs).size, nm]; });
  ok('㉔ 넓은 화면: 네 칸 줄은 모두 같은 요일 = 같은 세로 자리(1117-Z 7b C) · 이름은 한 줄(B)', al, [true, 1, true]);
  ok('㉔ 폰(390): 숙소는 오른쪽 위 · 세부는 그 아래 · 요일 칸은 넓게(숙소 아래로) · 보조 항목은 한 줄에 하나 · 옆 스크롤 없음', [ph.stRight, ph.stTop, ph.sdUnder, ph.auxRows, ph.wkFull, ph.scroll], [true, true, true, true, true, true]);
  ok('㉔ 넓은 화면(1024): 숙소는 오른쪽 기둥(요일 칸과 나란히) · 머무는 날 띠', [wd.stRight, wd.wkFull, wd.days.length >= 2], [true, false, true]);
  await hb.setViewportSize(vp0); await hb.evaluate(() => render());
}

{
  console.log('㉕ 판 손짓 닫기 · 스크롤 뒤 열기 (HB 11/19 — 아이폰 크기 · 손가락)');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await ctx.route('https://www.gstatic.com/firebasejs/**', r => { const f = r.request().url().split('/').pop(); r.fulfill({ path: path.join(NM, f), contentType: 'text/javascript' }); });
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort()); await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  const tp = await ctx.newPage(); tp.errs = []; tp.on('pageerror', e => tp.errs.push('㉕: ' + e.message));
  await tp.goto(ROOT + '?demo=1'); await tp.waitForTimeout(500);
  await tp.evaluate(() => { PREF.tab = 'busan'; PREF.bdet = true; renderShell(); }); await tp.waitForTimeout(300);
  const cdp = await ctx.newCDPSession(tp);
  const line = (a, z, k = 12) => Array.from({ length: k + 1 }, (_, i) => [a[0] + (z[0] - a[0]) * i / k, a[1] + (z[1] - a[1]) * i / k]);
  const drag = async (pts, step = 16) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
    for (const q of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q[0], y: q[1] }] }); await sleep(step); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(600); };
  const st = () => tp.evaluate(() => { const p = document.querySelector('#pane'), r = p && p.getBoundingClientRect();
    return { pane: S.pane ? S.pane.kind + (S.pane.edit ? ':' + S.pane.edit.sec : '') : '', bottom: r ? Math.round(r.bottom) : -1, y: Math.round(scrollY), lock: document.documentElement.classList.contains('plock') }; });
  const head = () => tp.evaluate(() => { const r = document.querySelector('#pane .phead b').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await tp.evaluate(() => scrollTo(0, 900)); await sleep(200);
  const Y = await tp.evaluate(() => Math.round(scrollY));
  const row = await tp.evaluate(() => { const b = [...document.querySelectorAll('#panel .vrow')].map(x => x.getBoundingClientRect()).find(r => r.top > 150 && r.bottom < 800); return [b.left + 30, b.top + 12]; });
  const open = async () => { await tp.touchscreen.tap(row[0], row[1]); await sleep(500); };
  await open();
  const o1 = await st(), hdTop = await tp.evaluate(() => Math.round(document.querySelector('header.top').getBoundingClientRect().top));
  ok('㉕ C 한참 내린 뒤 열어도 판은 화면 맨 아래에 붙는다 · 뒤 화면 잠김 · 맨 위 제목줄은 제자리', [Y > 500, o1.pane, o1.bottom, o1.lock, hdTop], [true, 'visit', 844, true, 0]);
  let h = await head(); await drag(line(h, [h[0], h[1] + 60]));
  ok('㉕ A 제목줄을 조금(4분의 1 못 미치게) 끌어내리면 제자리', await st(), { pane: 'visit', bottom: 844, y: 0, lock: true });
  h = await head(); await drag(line(h, [h[0], h[1] + 320]));
  ok('㉕ A 제목줄을 4분의 1 넘게 끌어내리면 닫힘 · 잠금 풀림 · 보던 자리 그대로(맨 위로 안 튐)', await st(), { pane: '', bottom: -1, y: Y, lock: false });
  await open(); await drag(line([8, 520], [80, 524]));
  ok('㉕ A 왼쪽 가장자리에서 조금 밀면 제자리', (await st()).pane, 'visit');
  await drag(line([8, 520], [230, 526]));
  ok('㉕ A 왼쪽 가장자리에서 4분의 1 넘게 오른쪽으로 밀면 닫힘 · 보던 자리 그대로', await st(), { pane: '', bottom: -1, y: Y, lock: false });
  await open(); await drag(line([8, 520], [72, 520], 3), 10);
  ok('㉕ A 빠른 튕김(40px 넘게)도 닫힘', (await st()).pane, '');
  await open(); await drag(line([200, 720], [200, 420]));
  ok('㉕ A 판 안 스크롤(가장자리 · 제목줄 밖)은 판을 닫지 않고 판만 굴러감', [(await st()).pane, await tp.evaluate(() => document.querySelector('#pane').scrollTop > 100)], ['visit', true]);
  await tp.evaluate(() => document.querySelector('#pane [data-vsec="stay"]').click()); await sleep(300);
  h = await head(); await drag(line(h, [h[0], h[1] + 400]));
  ok('㉕ A 항목 편집 중에 끌어내리면 × 와 같이 요약으로(판은 남음)', await st(), { pane: 'visit', bottom: 844, y: 0, lock: true });
  await tp.evaluate(() => document.querySelector('#pane [data-vsec="stay"]').click()); await sleep(300);
  await drag(line([6, 620], [300, 620]));
  ok('㉕ A 항목 편집 중에 가장자리 밀기도 요약으로', (await st()).pane, 'visit');
  await drag(line([6, 620], [300, 620]));
  ok('㉕ A 요약에서 한 번 더 밀면 닫힘', await st(), { pane: '', bottom: -1, y: Y, lock: false });
  await open(); await tp.click('#pane [data-act="closepane"]'); await sleep(400);
  ok('㉕ × 로 닫아도 잠금 풀림 · 보던 자리 그대로', await st(), { pane: '', bottom: -1, y: Y, lock: false });
  // 마우스(PC): 제목줄 끌어내리기
  await open(); h = await head(); await tp.mouse.move(h[0], h[1]); await tp.mouse.down(); for (let i = 1; i <= 10; i++) { await tp.mouse.move(h[0], h[1] + i * 32); await sleep(16); } await tp.mouse.up(); await sleep(600);
  ok('㉕ A 마우스로 제목줄 끌어내려도 닫힘', (await st()).pane, '');
  // 닫히는 중에 다시 열면 새 판이 남는다
  await open(); await tp.evaluate(() => { closePane(); document.querySelector('#panel .vrow').click(); }); await sleep(500);
  ok('㉕ 닫히는 중에 다시 열어도 판이 남고 잠금도 그대로', [(await st()).pane, !!(await tp.evaluate(() => document.querySelector('#pane'))), (await st()).lock], ['visit', true, true]);
  ok('㉕ 화면 오류 없음', tp.errs, []);
  await ctx.close();
}

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
