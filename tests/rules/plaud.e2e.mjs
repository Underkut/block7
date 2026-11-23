// 심방 녹음 도우미(plaudhub/helper.mjs)를 실제로 돌려 본다 — 파이어베이스 에뮬레이터(로그인 + 저장 + 보안 규칙) + 가짜 PLAUD CLI.
//   cd tests/rules && npx firebase emulators:exec --only firestore,auth --project demo-plaud "node plaud.e2e.mjs"
// ① 계기판의 '이 Mac 연결'(127.0.0.1) → 도우미가 열쇠를 확인하고 둔다(600) ② 소식(mac/집) · 준비 상태 · 파이어베이스 시계
// ③ 가짜 CLI 목록 → rec 줄(제목 · 시각 · 길이) — 일감 칸엔 아무것도 안 생김 ④ 두 번째 Mac(사무실)도 같은 줄 · 겹쳐 쓰지 않음
// ⑤ 요청(cmd: check · refresh) → 그 Mac 만 집음 · 정해 두지 않은 요청은 규칙이 막음 ⑥ CLI 모양이 바뀌면 멈추고 알림(줄 안 지움)
// ⑦ 일감 맡기 REST(조건부 쓰기): 두 Mac 이 동시에 집으면 한 대 · 30분 맡김 ⑧ 다른 사이트의 연결 요청은 거절
// ⑨ 계기판(크롬, block7.my 주소인 척): 로그인 · 두 Mac 카드 · 녹음 목록(한국 시각) · 눌러 고르기 · 키워드 메뉴 · 설치 단추 → 요청 · '이 Mac 연결' 로 세 번째 도우미를 붙임. 이름은 모두 지어낸 것.
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import vm from 'vm';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..', '..');
const FS = 'http://127.0.0.1:8089', AUTH = 'http://127.0.0.1:9099', PROJECT = 'block7-8f24e', SITE_PORT = 8766;
let n = 0, bad = 0; const ok = (name, c, extra) => { n++; if (c) console.log('  ✓', name); else { bad++; console.log('  ✗', name, extra === undefined ? '' : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (f, ms = 20000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await f().catch(() => null); if (v) return v; await sleep(250); } return null; };

// 규칙: 이 프로젝트 이름(block7-8f24e)에 plaud 덩어리를 싣는다
{ const r = await fetch(FS + '/emulator/v1/projects/' + PROJECT + ':securityRules', { method: 'PUT', body: JSON.stringify({ rules: { files: [{ content: fs.readFileSync(path.join(HERE, 'plaud.rules'), 'utf8') }] } }) });
  if (!r.ok) { console.log('규칙을 싣지 못함', r.status, await r.text()); process.exit(1); } }
// 계정 (지어낸 이메일)
const sign = async em => (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: em, password: 'secret12', returnSecureToken: true }) })).json());
const hb = await sign('hb@example.com'), other = await sign('zz@example.com');
const UID = hb.localId;
// 관리자(규칙 없이) 읽기
const DOCS = FS + '/v1/projects/' + PROJECT + '/databases/(default)/documents';
const PH = (() => { const html = fs.readFileSync(path.join(ROOT, 'plaudhub', 'index.html'), 'utf8'), code = /<script id="plaudhub-core">([\s\S]*?)<\/script>/.exec(html)[1];
  const c = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error }; vm.createContext(c); vm.runInContext(code + ';this.__PH=PH', c); return c.__PH; })();
const admin = async p => { const r = await fetch(DOCS + '/' + p, { headers: { authorization: 'Bearer owner' } }); if (r.status === 404) return null; const j = await r.json(); return j.documents ? Object.fromEntries(j.documents.map(d => { const o = PH.fsDoc(d); return [o.id, o]; })) : (j.fields || j.name ? PH.fsDoc(j) : {}); };
const adminSet = (p, v) => { const f = {}; for (const k of Object.keys(v)) f[k] = PH.fsEnc(v[k]); return fetch(DOCS + '/' + p, { method: 'PATCH', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: f }) }); };
const userAdd = (tok, coll, v) => { const f = {}; for (const k of Object.keys(v)) f[k] = PH.fsEnc(v[k]); return fetch(DOCS + '/' + coll, { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ fields: f }) }); };

// 계기판 파일을 내주는 작은 자리(도우미가 판단 덩어리를 여기서 떼어 간다)
const site = http.createServer((q, s) => { const f = path.join(ROOT, q.url.split('?')[0]); fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200); s.end(b); }); }).listen(SITE_PORT, '127.0.0.1');

// 가짜 PLAUD CLI — 공식 CLI 0.3.15 가 터미널이 아닐 때 내놓는 글과 같은 꼴
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plaud-e2e-')), bin = path.join(tmp, 'bin'); fs.mkdirSync(bin);
const ID = c => 'f_' + String(c).repeat(32).slice(0, 32);
const REC = [[ID('a'), '김하늘 집사 심방', '2026-11-22T06:05:00', '48m00s'], [ID('b'), '박소망 성도 전화심방', '2026-11-21T01:00:00', '12m03s'], [ID('c'), '', '2026-11-20T23:30:00', '6s']];
fs.writeFileSync(path.join(tmp, 'mode'), 'ok');
fs.writeFileSync(path.join(bin, 'plaud'), `#!/usr/bin/env node
const fs = require('fs'), mode = fs.readFileSync(${JSON.stringify(path.join(tmp, 'mode'))}, 'utf8').trim(), REC = ${JSON.stringify(REC)}, a = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(path.join(tmp, 'calls'))}, a.join(' ') + ' TELEMETRY=' + (process.env.PLAUD_TELEMETRY_DISABLED || '') + '\\n');
const now = Date.now();
if (a[0] === 'me') { console.log('\\nUser Info:\\n\\n  email: hb@example.com\\n'); process.exit(0); }
if (a[0] === 'version') { console.log('plaud 0.3.15'); process.exit(0); }
if (a[0] === 'recent') {
  if (mode === 'changed') { console.log(JSON.stringify(REC)); process.exit(0); }
  const rows = REC.map(r => '  ' + r[0] + '  ' + r[1] + '  ' + r[2].slice(0, 10) + '  ' + r[3]);
  console.log('\\nRecordings in the last ' + a[2] + ' days: ' + rows.length + '\\n'); rows.forEach(l => console.log(l)); console.log(); process.exit(0);
}
if (a[0] === 'file') { const r = REC.find(x => x[0] === a[1]); if (!r) process.exit(1);
  console.log('\\nFile Details:\\n'); console.log('  id:           ' + r[0]); console.log('  name:         ' + r[1]); console.log('  created_at:   ' + r[2]); console.log('  start_at:     ' + r[2]);
  console.log('  duration:     ' + r[3]); console.log('  serial_number: 8810'); console.log('  audio:        unknown (run \`plaud audio\` to check)'); console.log('  transcript:   unavailable'); console.log('  summary:      unavailable'); console.log(); process.exit(0); }
process.exit(1);
`, { mode: 0o755 });

// 도우미 둘(집 · 사무실) — 따로 폴더 · 따로 연결 자리
const kids = [];
const startHelper = (name, port) => {
  const dir = path.join(tmp, name); fs.mkdirSync(dir, { recursive: true });
  const env = Object.assign({}, process.env, { PATH: bin + ':' + process.env.PATH, PLAUDHUB_DIR: dir, PLAUDHUB_PORT: String(port), PLAUDHUB_SITE: 'http://127.0.0.1:' + SITE_PORT + '/plaudhub/',
    PLAUDHUB_TOKEN_URL: AUTH + '/securetoken.googleapis.com/v1/token', PLAUDHUB_FS_HOST: FS, PLAUDHUB_DEV_ORIGIN: 'http://127.0.0.1:8765', HOME: dir });
  const ch = spawn(process.execPath, [path.join(ROOT, 'plaudhub', 'helper.mjs')], { env }); let logs = '';
  ch.stdout.on('data', d => logs += d); ch.stderr.on('data', d => logs += d); kids.push(ch);
  return { dir, port, log: () => logs };
};
const pairAt = (port, body, origin = 'http://127.0.0.1:8765') => fetch('http://127.0.0.1:' + port + '/pair', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ code: r.status, j: await r.json().catch(() => ({})) }));

try {
  await adminSet('plaud/' + UID, { kw: ['심방'], days: 14 });
  const home = startHelper('home', 47931);
  const hello = await until(() => fetch('http://127.0.0.1:47931/hello', { headers: { origin: 'http://127.0.0.1:8765' } }).then(r => r.json()));
  ok('① 도우미가 뜨고 판단 덩어리를 계기판 파일에서 떼어 옴', hello && hello.app === 'plaudhub' && !hello.paired && fs.existsSync(path.join(home.dir, 'core.js')), hello);
  let r = await pairAt(47931, { rt: hb.refreshToken, uid: UID, mac: '집' }, 'https://evil.example');
  ok('⑧ 다른 사이트의 연결 요청은 거절', r.code === 403);
  r = await pairAt(47931, { rt: other.refreshToken, uid: UID, mac: '집' });
  ok('① 남의 열쇠로는 연결 안 됨(계정 확인)', r.code === 400, r);
  r = await pairAt(47931, { rt: hb.refreshToken, uid: UID, mac: '집' });
  ok('① HB 열쇠로 연결', r.code === 200 && r.j.mac === '집', r);
  const st = fs.statSync(path.join(home.dir, 'token.json'));
  ok('① 열쇠 파일은 나만 읽기(600)', (st.mode & 0o777) === 0o600, (st.mode & 0o777).toString(8));
  const mac = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.ready && d.ready.login === true && d; });
  ok('② 소식: 준비 상태(가짜 CLI · 로그인 ✓) · 도우미 판 · CLI 판', mac && mac.v === PH.HELPER_LATEST && mac.ready.plaud === true && mac.cli === 'plaud 0.3.15', mac);
  ok('② 소식 시각은 파이어베이스 시계(몇 초 안)', mac && Math.abs(mac.at - Date.now()) < 60e3, mac && mac.at);
  const recs = await until(async () => { const d = await admin('plaud/' + UID + '/rec'); return d && Object.keys(d).length === 3 && d; });
  ok('③ 녹음 줄 셋', !!recs, recs || home.log().slice(-1500));
  if (recs) {
    ok('③ 제목 · 시작(세계 표준시) · 길이', recs[ID('a')].n === '김하늘 집사 심방' && recs[ID('a')].t === Date.UTC(2026, 10, 22, 6, 5) && recs[ID('a')].d === 2880, recs[ID('a')]);
    ok('③ 빈 제목도 줄로', recs[ID('c')].n === '' && recs[ID('c')].d === 6);
    ok('③ 쓰는 칸은 n · t · c · d 뿐', Object.keys(recs[ID('a')]).filter(k => !['id', '_ut'].includes(k)).sort().join() === 'c,d,n,t');
  }
  ok('③ 일감 칸엔 아무것도 안 생김(P2 는 집지 않음)', !(await admin('plaud/' + UID + '/job')) || Object.keys(await admin('plaud/' + UID + '/job')).length === 0);
  const calls = fs.readFileSync(path.join(tmp, 'calls'), 'utf8');
  ok('③ CLI 는 통계를 끄고 불림 · 음성 주소는 묻지 않음', !/TELEMETRY=\s*$/m.test(calls) && !/^audio /m.test(calls), calls);
  // ④ 두 번째 Mac
  const ut0 = recs ? recs[ID('a')]._ut : '';
  const office = startHelper('office', 47932);
  await until(() => fetch('http://127.0.0.1:47932/hello', { headers: { origin: 'http://127.0.0.1:8765' } }).then(r => r.ok));
  r = await pairAt(47932, { rt: hb.refreshToken, uid: UID, mac: '사무실' });
  ok('④ 사무실 Mac 도 같은 열쇠 길로 연결', r.code === 200, r);
  const m2 = await until(async () => { const d = await admin('plaud/' + UID + '/mac'); return d && d['사무실'] && d['집'] && d; });
  ok('④ 두 Mac 카드', !!m2);
  await until(async () => /목록/.test(office.log()));
  const recs2 = await admin('plaud/' + UID + '/rec');
  ok('④ 사무실이 읽어도 같은 줄은 다시 안 씀(판 그대로)', recs2 && recs2[ID('a')]._ut === ut0, [ut0, recs2 && recs2[ID('a')]._ut]);
  // ⑤ 요청
  const add = await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '사무실', what: 'check', st: 'new', at: Date.now() });
  const cid = (await add.json()).name.split('/').pop();
  const done = await until(async () => { const d = await admin('plaud/' + UID + '/cmd/' + cid); return d && d.st === 'ok' && d; }, 40000);
  ok('⑤ 사무실 몫 요청(check)을 사무실이 해냄', !!done, done);
  const bogus = await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'sh', st: 'new' });
  ok('⑤ 정해 두지 않은 요청은 규칙이 막음', bogus.status === 403, bogus.status);
  const theirs = await userAdd(other.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'check', st: 'new' });
  ok('⑤ 남은 요청을 넣지 못함', theirs.status === 403, theirs.status);
  // ⑥ CLI 모양이 바뀜
  fs.writeFileSync(path.join(tmp, 'mode'), 'changed');
  const add2 = await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
  const cid2 = (await add2.json()).name.split('/').pop();
  const fail = await until(async () => { const d = await admin('plaud/' + UID + '/cmd/' + cid2); return d && (d.st === 'fail' || d.st === 'ok') && d; }, 40000);
  const macErr = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.err && d; }), recs3 = await admin('plaud/' + UID + '/rec');
  ok('⑥ 모양이 바뀌면 멈추고 알림(요청 실패 · Mac 카드에 까닭)', fail && fail.st === 'fail' && /멈춤/.test(macErr.err || '') && /모양/.test(macErr.err || ''), [fail, macErr && macErr.err]);
  ok('⑥ 멈춘 동안 녹음 줄을 지우지 않음', recs3 && Object.keys(recs3).length === 3);
  ok('⑥ 까닭에 제목이 없음', !/김하늘|박소망/.test((macErr && macErr.err) || '') && !/김하늘|박소망/.test((fail && fail.log) || ''));
  fs.writeFileSync(path.join(tmp, 'mode'), 'ok');
  // ⑦ 일감 맡기 REST — 도우미 코드(jobIO)를 그대로 불러 같은 계정 두 Mac 으로
  process.env.PLAUDHUB_DIR = path.join(tmp, 'x'); process.env.PLAUDHUB_PORT = '47939'; process.env.PLAUDHUB_TOKEN_URL = AUTH + '/securetoken.googleapis.com/v1/token'; process.env.PLAUDHUB_FS_HOST = FS;
  const H = await import(path.join(ROOT, 'plaudhub', 'helper.mjs'));
  H._setCore(PH); Object.assign(H._st, { tok: { rt: hb.refreshToken, uid: UID }, mac: '집' });
  const rs = await Promise.all([PH.tryClaim(H.jobIO, ID('a'), '집'), PH.tryClaim(H.jobIO, ID('a'), '사무실')]);
  const job = await admin('plaud/' + UID + '/job/' + ID('a'));
  ok('⑦ 두 Mac 이 동시에 집으면 한 대만', rs.filter(x => x.ok).length === 1 && job && job.st === 'work' && rs.find(x => x.ok) && job.mac === ['집', '사무실'][rs.findIndex(x => x.ok)], [rs, job]);
  ok('⑦ 진 쪽은 \'다른 Mac 이 하는 중\'', rs.some(x => !x.ok && x.why === 'busy'), rs);
  ok('⑦ 맡은 시각은 파이어베이스 시계', job && Math.abs(job.at - Date.now()) < 60e3);
  ok('⑦ 일감 칸에 제목이 없음', job && !('n' in job));
  const winner = job.mac, loser = winner === '집' ? '사무실' : '집';
  ok('⑦ 다른 쪽이 새로 찍으려 하면 \'잃음\'', (await PH.renew(H.jobIO, ID('a'), loser, 'stt')).why === 'lost');
  ok('⑦ 맡은 쪽은 새로 찍음', (await PH.renew(H.jobIO, ID('a'), winner, 'stt')).ok === true);
  // 30분 전으로 돌려 두면(꺼진 Mac) 다른 쪽이 이어받음
  const ref = DOCS + '/plaud/' + UID + '/job/' + ID('a');
  await fetch(ref + '?updateMask.fieldPaths=at', { method: 'PATCH', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: { at: { timestampValue: new Date(Date.now() - 31 * 60e3).toISOString() } } }) });
  const take = await PH.tryClaim(H.jobIO, ID('a'), loser);
  ok('⑦ 31분 소식이 없으면 다른 Mac 이 이어받음(처음 단계부터)', take.ok && take.how === 'expired' && (await admin('plaud/' + UID + '/job/' + ID('a'))).mac === loser && take.step === 'get', take);
  ok('⑦ 기록(도우미 로그)에 열쇠 · 주소가 없음', !/refresh_token|AMf-|https?:\/\/(?!127)/.test(home.log() + office.log()), (home.log() + office.log()).slice(-400));
  // ⑨ 계기판
  const req = createRequire(import.meta.url); let pw; try { pw = req('playwright'); } catch (_) { pw = req('/opt/node-tools/node_modules/playwright'); }
  const third = startHelper('study', 47211);   // 계기판은 늘 47211 을 부른다
  const browser = await pw.chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const NM = path.join(HERE, 'node_modules', 'firebase');
    await ctx.route('https://www.gstatic.com/firebasejs/**', r => r.fulfill({ path: path.join(NM, r.request().url().split('/').pop()), contentType: 'text/javascript' }));
    await ctx.route('https://block7.my/plaudhub/**', r => { const f = path.join(ROOT, 'plaudhub', new URL(r.request().url()).pathname.replace('/plaudhub/', '') || 'index.html');
      return fs.existsSync(f) && fs.statSync(f).isFile() ? r.fulfill({ path: f, contentType: f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : undefined }) : r.fulfill({ path: path.join(ROOT, 'plaudhub', 'index.html'), contentType: 'text/html' }); });
    await ctx.addInitScript(() => { let fb; Object.defineProperty(window, 'firebase', { configurable: true, get() { return fb; }, set(v) { fb = v;
      if (v && v.initializeApp && !v.__emu) { v.__emu = 1; const orig = v.initializeApp.bind(v);
        v.initializeApp = (cfg, name) => { const app = orig(cfg, name); app.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); app.firestore().useEmulator('127.0.0.1', 8089); return app; }; } } }); });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('https://block7.my/plaudhub/');
    await pg.waitForSelector('#fb-em'); await pg.fill('#fb-em', 'hb@example.com'); await pg.fill('#fb-pw', 'secret12'); await pg.click('[data-act="login"]');
    const listed = await until(async () => (await pg.textContent('#main')).includes('김하늘 집사 심방'));
    const main = await pg.textContent('#main');
    ok('⑨ 로그인하면 두 Mac 카드 · 녹음 목록', listed && main.includes('집') && main.includes('사무실') && main.includes('2 / 2 켜짐'), main.slice(0, 300));
    ok('⑨ 한국 시각(06:05Z = 오후 3:05) · 길이', main.includes('11. 22. (일) 오후 3:05') && main.includes('48분'), main.slice(0, 600));
    ok('⑨ 키워드 \'심방\' 녹음은 저절로 골라짐', await pg.$eval('[data-id="' + ID('a') + '"]', e => e.classList.contains('pick')));
    await pg.click('[data-id="' + ID('c') + '"]');
    const pk = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('c')); return d && d.pick === 'in' && d; });
    ok('⑨ 제목 없는 녹음을 눌러 고르면 계정 job 에 pick:in (제목 없이)', pk && !('n' in pk), pk);
    await pg.click('[data-act="menu"]'); await pg.fill('#kw-in', '전화'); await pg.click('[data-act="kwadd"]');
    const kw = await until(async () => { const d = await admin('plaud/' + UID); return d && (d.kw || []).includes('전화') && d; });
    ok('⑨ 키워드 메뉴에서 더하면 계정 설정에', !!kw, kw);
    await pg.keyboard.press('Escape'); await sleep(400);
    const fix = await pg.$('[data-act="fix"][data-mac="집"][data-k="whisper"]');
    ok('⑨ 없는 것(whisper.cpp)에 \'설치\' 단추', !!fix);
    if (fix) { await fix.click(); await pg.waitForSelector('[data-act="runfix"]'); const txt = await pg.textContent('#pane');
      ok('⑨ 설치 판: 무엇 · 어디 · 크기 · 명령(sudo 없음)', txt.includes('brew install whisper-cpp') && txt.includes('/opt/homebrew') && txt.includes('sudo 없음'), txt);
      await pg.click('[data-act="runfix"]');
      const c = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); return d && Object.values(d).find(x => x.what === 'whisper' && x.mac === '집'); });
      ok('⑨ 설치를 누르면 계정 cmd 에 열쇠 이름만(명령 글 없음)', c && !('argv' in c) && ['new', 'run', 'ok', 'fail'].includes(c.st), c);
      const fin = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); const x = d && Object.values(d).find(x => x.what === 'whisper'); return x && (x.st === 'ok' || x.st === 'fail') && x; }, 40000);
      ok('⑨ 집 도우미가 집어 돌림(이 시험 기계엔 Homebrew 가 없어 실패로 끝남)', fin && fin.st === 'fail', fin); }
    // 이 Mac 연결 — 세 번째 도우미(47211)
    await until(() => fetch('http://127.0.0.1:47211/hello', { headers: { origin: 'https://block7.my' } }).then(r => r.ok));
    await pg.click('[data-act="menu"]'); await pg.click('[data-act="pairpane"]');
    await pg.waitForSelector('#mac-in', { timeout: 8000 }).catch(() => null);
    const paneTxt = await pg.textContent('#pane');
    ok('⑨ 이 Mac 연결 판이 도우미를 찾음', paneTxt.includes('도우미가 이 Mac 에서 돌고 있습니다'), paneTxt);
    if (await pg.$('#mac-in')) { await pg.fill('#mac-in', '서재'); await pg.click('[data-act="pairtyped"]'); }
    const m3 = await until(async () => { const d = await admin('plaud/' + UID + '/mac/서재'); return d && d.v && d; }, 30000);
    ok('⑨ 계기판에서 누른 \'이 Mac 연결\' 로 세 번째 Mac 이 계정에 나타남', !!m3, third.log().slice(-500));
    ok('⑨ 계기판 화면 오류 없음', errs.length === 0, errs);
  } finally { await browser.close(); }
} catch (e) { bad++; console.log('  ✗ 도중에 멈춤', e && e.stack); }
finally { kids.forEach(k => k.kill()); site.close(); }
console.log(`결과: 통과 ${n - bad} / 실패 ${bad}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
