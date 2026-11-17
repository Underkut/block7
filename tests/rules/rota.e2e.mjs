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
await admin(db => db.doc('rota/' + HB).set({ b8: book,   /* 옛 칸(R11 모양: sunLead · ll)에 둔 자료 — 앱이 b12 · lead 로 옮긴다 */ v: 'seed', at: T }));
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
ok('① 빈 기기 로그인으로 계정 자료가 줄지 않았다', [d1.b12.people.length, d1.b12.visits.length, d1.b12.slots.length], [2, 2, 1]);
ok('① (R12 A) 옛 칸 b8 → b12 으로 옮기고 b8 은 지움 · 옛 인도 칸(sunLead · ll)은 lead 로', [!!d1.b8, (v => [v.lead, 'sunLead' in v, 'll' in v])(d1.b12.visits.find(x => x.id === 'v|2026-11-22'))], [false, [{ sun: { m: 'staff' }, ll: { m: 'staff' } }, false, false]]);

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
const d3 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b12.visits.find(x => x.id === 'v|2026-11-22'); return v.stay && v.stay.length ? d : null; });
ok('③ HB 계정 문서에도 들어갔다(HB 앱이 씀)', d3 && [d3.b12.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d3.b12.visits.find(x => x.id === 'v|2026-11-22').note, d3.b12.people.length], ['교역자 호텔', '처음 메모', 2]);
ok('③ HB 고르기 판: 교역자가 적은 가능 일정이 \'가능 일정\'(초록)으로', await hb.evaluate(async () => { openPane({ kind: 'pick', id: '2026-12-20|sun1|offer' }); await new Promise(r => setTimeout(r, 300)); const b = document.querySelector('#pane [data-who="pa"] .why'); const out = b ? [b.textContent.includes('가능 일정'), b.classList.contains('ok')] : null; closePane(); await new Promise(r => setTimeout(r, 600)); return out; }), [true, true]);
ok('③ 숙소 이름이 HB 숙소 목록에 저절로 들어가지 않는다(목록은 HB 몫)', await hb.evaluate(() => S.book.opts.filter(o => o.type === 'stay' && !o.del).map(o => o.name)), []);
// HB 가 메모만 고친다 → 교역자 숙소는 그대로
await hb.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await hb.waitForTimeout(400);
await hb.click('#pane [data-vsec="note"]'); await hb.waitForTimeout(150); await hb.fill('#pane textarea', 'HB 메모'); await hb.click('#pane [data-act="vsave"]'); await hb.waitForTimeout(800);
const d4 = await getDoc('rota/' + HB), v4 = d4.b12.visits.find(x => x.id === 'v|2026-11-22');
ok('③ HB 가 메모를 고쳐도 교역자 숙소 · 누가는 그대로', [v4.note, v4.stay[0].name, v4.stayBy], ['HB 메모', '교역자 호텔', 'pa']);
ok('③ 교역자 화면에도 HB 메모가 온다', await until(() => ga.evaluate(() => S.book.visits.find(v => v.id === 'v|2026-11-22').note === 'HB 메모')), true);

console.log('③-2 내 화면 취향 (R8b) — 첫 화면 · 내 이름 모양은 계정에, 책은 그대로');
{
  const before = JSON.stringify((await getDoc('rota/' + HB)).b12);
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
  ok('③-2 HB 의 첫 화면은 문서 맨 위 ui 칸에 · 책(b12) · team 은 한 글자도 그대로 · HB 책에 교역자 ui 가 섞이지 않았다', [d && d.ui.home, JSON.stringify(d2.b12) === before, d2.team, /"ui"|"home"/.test(JSON.stringify(d2.b12))], ['month:mine', true, ['ga@example.com'], false]);
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
ok('⑤ 두 번째 기기 로그인 뒤에도 자료 그대로(숙소 · 메모 · 부재 · 자리)', [d5.b12.people.length, d5.b12.visits.length, d5.b12.slots.length, d5.b12.visits.find(x => x.id === 'v|2026-11-22').stay[0].name, d5.b12.visits.find(x => x.id === 'v|2026-11-22').note, (d5.b12.people.find(p => p.id === 'pa').away || []).length], [2, 2, 1, '교역자 호텔', 'HB 메모', 1]);

console.log('⑧ (R12 A) 부산 인도 세 갈래 — HB 가 방문 창에서 고르면 계정 · 교역자 화면까지');
{
  await hb.evaluate(() => openPane({ kind: 'visit', id: 'v|2026-11-22' })); await hb.waitForTimeout(400);
  await hb.click('#pane [data-vsec="who"]'); await hb.waitForTimeout(200);
  ok('⑧ 방문 창: 금요(11/20 = 금3 ENCOUNTER) · 주일 · LL 줄마다 교역자 / 성도 / 중계 · 옛 칸이 옮겨져 주일 · LL 교역자가 눌려 있음', await hb.evaluate(() => [...document.querySelectorAll('#pane [data-dlead]')].map(b => b.dataset.dlead + ':' + b.dataset.v + (b.getAttribute('aria-pressed') === 'true' ? '*' : ''))),
    ['fri:staff', 'fri:lay', 'fri:relay', 'sun:staff*', 'sun:lay', 'sun:relay', 'll:staff*', 'll:lay', 'll:relay']);
  await hb.click('#pane [data-dlead="sun"][data-v="relay"]'); await hb.waitForTimeout(100);
  await hb.click('#pane [data-dlead="ll"][data-v="lay"]'); await hb.waitForTimeout(100);
  ok('⑧ 성도를 골랐는데 성도 인도자가 없으면 \'사람\' 탭 안내', await hb.evaluate(() => /성도 인도자를 더하면/.test(document.querySelector('#pane').textContent)), true);
  await hb.click('#pane [data-act="vsave"]'); await hb.waitForTimeout(300); await hb.evaluate(() => closePane());
  const d7 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b12.visits.find(x => x.id === 'v|2026-11-22'); return v.lead && v.lead.sun && v.lead.sun.m === 'relay' ? d : null; });
  const v7 = d7 && d7.b12.visits.find(x => x.id === 'v|2026-11-22');
  ok('⑧ 계정 문서(b12): 주일 중계 · LL 성도 · 옛 칸 없음 · 숙소 · 메모 그대로', v7 && [v7.lead, 'sunLead' in v7, 'll' in v7, v7.stay[0].name, v7.note, !!d7.b8], [{ sun: { m: 'relay' }, ll: { m: 'lay' } }, false, false, '교역자 호텔', 'HB 메모', false]);
  ok('⑧ 교역자 화면에도 온다(알약)', await until(() => ga.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'); const t = visitLeads(S.book, v).map(x => x.text); return t.length === 2 ? t : null; })), ['주일예배 중계', 'LL · 성도 인도자']);
  ok('⑧ 교역자는 인도를 못 고친다(교역자 · 요일 판이 열리지 않음)', await ga.evaluate(async () => { openPane({ kind: 'visit', id: 'v|2026-11-22' }); await new Promise(r => setTimeout(r, 300)); document.querySelector('#pane [data-vsec="who"]') && document.querySelector('#pane [data-vsec="who"]').click(); await new Promise(r => setTimeout(r, 200)); const e = !!(S.pane && S.pane.edit); closePane(); return e; }), false);
}

console.log('⑨ (R12 C4b) 부산 상영 — 계정에 저장 · 경고 · 교역자는 자기 방문 주일만');
{
  // 토요일(11/21)인 척 + 11/22 영상 광고를 이 기기에서 읽은 적 있음 → 경고
  const sat = (pg) => pg.evaluate(() => { window.todayYmd = () => '2026-11-21';
    localStorage.setItem('rota_ads_v1', JSON.stringify({ '2026-11-22': { at: 1, o: { sun: '2026-11-22', busan: { found: true }, video: [{ title: '가을 음악회 안내' }] } } })); closePane(); PREF.tab = 'busan'; render(); });
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
  const d9 = await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b12.shows && d.b12.shows.find(x => x.id === 's|2026-11-22'); return r ? d : null; });
  ok('⑨ HB 앱이 받아 계정 책(b12)의 주일 줄로 · 누가 = 교역자 · 옛 칸 b10 없음', d9 && [d9.b12.shows.find(x => x.id === 's|2026-11-22').bs, d9.b12.shows.find(x => x.id === 's|2026-11-22').by, 'b10' in d9], ['diff', 'staff:pa', false]);
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
  const d9b = await until(async () => { const d = await getDoc('rota/' + HB); const r = d.b12.shows.find(x => x.id === 's|2026-11-22'); return r.bs === 'same' ? d : null; });
  ok('⑨ HB 가 나중에 고치면 HB 것(계정)', d9b && d9b.b12.shows.find(x => x.id === 's|2026-11-22').bs, 'same');
  ok('⑨ 교역자 화면에도 온다', await until(() => ga.evaluate(() => showOf(S.book, '2026-11-22') === 'same')), true);
  await hb.evaluate(() => closePane()); await sleep(500);
  // 빈 기기 + 예전 이 기기 선택(rota_adsbs_v1) → 로그인하면 계정으로 한 번 옮기고 지움 · 계정 것은 줄지 않음
  const hb3 = await device('HB3');
  await hb3.evaluate(() => localStorage.setItem('rota_adsbs_v1', JSON.stringify({ '2026-11-29': 'none', '2026-11-08': 'same', '2026-11-22': 'diff' })));
  await hb3.click('[data-act="menu"]'); await hb3.fill('#fb-em', 'hb@example.com'); await hb3.fill('#fb-pw', 'pw123456'); await hb3.click('[data-act="login"]');
  await until(() => hb3.evaluate(() => FB.role === 'owner' && FB.synced));
  const d9c = await until(async () => { const d = await getDoc('rota/' + HB); return d.b12.shows.some(x => x.id === 's|2026-11-29') ? d : null; });
  ok('⑨ 빈 기기 로그인: 예전 이 기기 선택은 다가오는 주일 · 계정에 없는 것만(11/29) · 계정 것(11/22 같은 영상)은 그대로 · 지난 주일(11/8)은 버림 · 이 기기 기억은 지움',
    d9c && [d9c.b12.shows.map(x => x.id + ':' + x.bs), d9c.b12.people.length, d9c.b12.visits.length, await hb3.evaluate(() => localStorage.getItem('rota_adsbs_v1'))], [['s|2026-11-22:same', 's|2026-11-29:none'], 2, 2, null]);
  // 낡은 앱(b10 — 1116-2 B 앞, 동행 · 모임 새 칸을 모름)이 상영 없이 다시 써도 상영은 남는다
  const old = JSON.parse(JSON.stringify(d9c.b12)); delete old.shows; old.visits = old.visits.map(v => v.id === 'v|2026-11-29' ? Object.assign(v, { note: '낡은 앱', at: Date.now() + 5000 }) : v);
  await admin(db => db.doc('rota/' + HB).set({ b10: old }, { merge: true }));
  const d9d = await until(async () => { const d = await getDoc('rota/' + HB); return !('b10' in d) && d.b12.visits.find(v => v.id === 'v|2026-11-29').note === '낡은 앱' ? d : null; });
  ok('⑨ 낡은 앱(b10)이 상영 없이 써도 합쳐 상영은 그대로 · 낡은 앱 메모도 받음 · b10 은 치움', d9d && d9d.b12.shows.map(x => x.id + ':' + x.bs), ['s|2026-11-22:same', 's|2026-11-29:none']);
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
  const d10 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b12.visits.find(x => x.id === 'v|2026-11-22'); return v.mates ? d : null; });
  ok('⑩ HB 동행 → 계정(b12) · 옛 글 칸 없음 · 숙소 · 메모 그대로', d10 && (v => [v.mates, 'staff' in v, v.stay[0].name, v.note])(d10.b12.visits.find(x => x.id === 'v|2026-11-22')), [[{ n: '동행가' }], false, '교역자 호텔', 'HB 메모']);
  // 교역자: 자기 방문의 모임 칸 → 모임 판 → 침례교육 2차 → 저장
  await ga.click(cell('v|2026-11-22', 'meet')); await sleep(400);
  ok('⑩ 교역자: 자기 방문의 모임 칸 → 모임 판이 바로 열림', (await pane(ga)).sec, 'meet');
  await ga.click('#pane [data-dmk="bapt"]'); await sleep(100); await ga.click('#pane [data-dmn="2"]'); await sleep(100); await ga.click('#pane [data-act="vsave"]'); await sleep(300);
  const st10 = await until(async () => { const x = await getDoc('rota/' + HB + '/staff/' + GA); return x && x.visits['v|2026-11-22'].meet ? x : null; });
  ok('⑩ 교역자 칸의 그 방문 줄에 모임(칸 모두) · 숙소 · 상영은 그대로', st10 && (e => [Object.fromEntries(Object.entries(e.meet).sort()), e.meetAt > 0, e.stay[0].name, e.bs])(st10.visits['v|2026-11-22']), [{ g: '', k: 'bapt', memo: '', n: 2, who: '' }, true, '교역자 호텔', 'diff']);
  const d10b = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b12.visits.find(x => x.id === 'v|2026-11-22'); return v.meet ? d : null; });
  ok('⑩ HB 앱이 받아 계정 책(b12)에 · 누가 = 교역자 · 동행 · 메모 그대로', d10b && (v => [v.meet, v.meetBy, v.mates, v.note])(d10b.b12.visits.find(x => x.id === 'v|2026-11-22')), [{ k: 'bapt', n: 2 }, 'pa', [{ n: '동행가' }], 'HB 메모']);
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
  const d11 = await until(async () => { const d = await getDoc('rota/' + HB); const v = d.b12 && d.b12.visits.find(x => x.id === 'v|2026-11-22'); return v && v.stay[0].status === 'pre' ? d : null; });
  ok('⑪ 계정(b12): 숙소 예약 전 · 목록 차례 · 옛 칸 b11 없음',
    d11 && [d11.b12.opts.filter(o => o.type === 'stay' && !o.del).sort((x, y) => x.ord - y.ord).map(o => o.name), 'b11' in d11], [['가 호텔', '나 호텔', '교역자 호텔'], false]);
  // 낡은 앱(b11 — 예약 전을 모름)이 숙소를 '미정' 으로 떨군 채 다른 방문 메모를 써도
  const old = JSON.parse(JSON.stringify(d11.b12)); old.visits = old.visits.map(v => { v = JSON.parse(JSON.stringify(v)); for (const s of v.stay || []) if (s.status === 'pre') s.status = ''; if (v.id === 'v|2026-11-29') { v.note = '낡은 앱 b11'; v.at = Date.now() + 5000; } return v; });
  await admin(db => db.doc('rota/' + HB).set({ b11: old }, { merge: true }));
  const d11b = await until(async () => { const d = await getDoc('rota/' + HB); return !('b11' in d) && d.b12.visits.find(v => v.id === 'v|2026-11-29').note === '낡은 앱 b11' ? d : null; });
  ok('⑪ 낡은 앱(b11)이 써도 합쳐 예약 전은 그대로 · 낡은 앱 메모도 받음 · b11 은 치움', d11b && d11b.b12.visits.find(v => v.id === 'v|2026-11-22').stay[0].status, 'pre');
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
  const d11c = await until(async () => { const d = await getDoc('rota/' + HB); const s = d.b12.visits.find(x => x.id === 'v|2026-11-22').stay[0]; return s.kind === 'home' ? d : null; });
  ok('⑪ HB 앱이 받아 계정(b12)에 · 화면 알약 = 대화 전', [d11c && d11c.b12.visits.find(x => x.id === 'v|2026-11-22').stay[0].status, await until(() => hb.evaluate(() => { const v = S.book.visits.find(x => x.id === 'v|2026-11-22'); return v.stay[0].kind === 'home' ? stayStName(v.stay[0]) : null; }))], ['pre', '대화 전']);
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
