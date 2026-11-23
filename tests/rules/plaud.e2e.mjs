// 심방 녹음 도우미(plaudhub/helper.mjs)를 실제로 돌려 본다 — 파이어베이스 에뮬레이터(로그인 + 저장 + 보안 규칙) + 가짜 PLAUD CLI
// + (P3) 가짜 음성 주소(작은 소리 파일) · 가짜 ffmpeg · 가짜 whisper-cli · 두 Mac 이 함께 보는 가짜 드라이브 폴더.
//   cd tests/rules && npx firebase emulators:exec --only firestore,auth --project demo-plaud "node plaud.e2e.mjs"
// ① 계기판의 '이 Mac 연결'(127.0.0.1) → 도우미가 열쇠를 확인하고 둔다(600) ② 소식(mac/집) · 준비 상태 · 파이어베이스 시계
// ③ 가짜 CLI 목록 → rec 줄(제목 · 시각 · 길이) — 드라이브 폴더가 없으면 일감을 집지 않음 ④ 두 번째 Mac(사무실)도 같은 줄 · 겹쳐 쓰지 않음
// ⑤ 요청(cmd: check · refresh) → 그 Mac 만 집음 · 정해 두지 않은 요청은 규칙이 막음 ⑥ CLI 모양이 바뀌면 멈추고 알림(줄 안 지움)
// ⑦ 일감 맡기 REST(조건부 쓰기): 두 Mac 이 동시에 집으면 한 대 · 30분 맡김 ⑧ 다른 사이트의 연결 요청은 거절
// ⑨ 계기판(크롬, block7.my 주소인 척): 로그인 · 두 Mac 카드 · 녹음 목록(한국 시각) · 눌러 고르기 · 키워드 메뉴 · 새로고침 아이콘 글 · 토스트 · '이 Mac 연결' 로 세 번째 도우미 · 설치 단추 → 요청
// ⑩ (P3) 공간이 모자라면 두 Mac 모두 맡지 않고 Mac 카드에 알림
// ⑪ (P3) 공간을 비우면 두 Mac 이 함께 고른 녹음을 나눠 전사 — 겹친 전사 없음 · txt 녹음마다 하나 · 이미 있던 txt 는 그대로(받지도 않음) · 한 Mac 은 한 번에 하나
//        · 머리말 · 주소가 기록 · 계정에 없음 · 받은 소리 · WAV 지움 · 계기판 '드라이브' 단계
// ⑫ (P3) 모델 시험: 계기판 '모델 시험' 판(깔린 것 · 설치 단추) → 깔린 두 모델 시간 · 빠르기 → Mac 카드 · 시험 글은 그 Mac 의 test 폴더에만
// ⑬ (P3) 꺼진 Mac 일감 이어받기: 전사 중 5분마다 renew(시험은 2초) → 그 Mac 을 죽이고 31분 전으로 → 다른 Mac 이 이어 해 txt 하나
// ⑭ (P3) 맡김을 잃으면 바로 멈춤: 전사 중 다른 Mac 이 맡은 것으로 바꾸면 whisper 를 멈추고 txt 를 쓰지 않음 → 풀린 뒤 이어 함 · txt 하나. 이름은 모두 지어낸 것.
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
// 몇 칸만 고침(at 은 파이어베이스 시각 값으로)
const adminPatch = (p, v) => { const f = {}; for (const k of Object.keys(v)) f[k] = k === 'at' ? { timestampValue: new Date(v[k]).toISOString() } : PH.fsEnc(v[k]);
  return fetch(DOCS + '/' + p + '?' + Object.keys(v).map(k => 'updateMask.fieldPaths=' + k).join('&'), { method: 'PATCH', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: f }) }); };
const userAdd = (tok, coll, v) => { const f = {}; for (const k of Object.keys(v)) f[k] = PH.fsEnc(v[k]); return fetch(DOCS + '/' + coll, { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ fields: f }) }); };

// 계기판 파일을 내주는 작은 자리(도우미가 판단 덩어리를 여기서 떼어 간다) + 가짜 음성 파일(24시간 주소인 척 — 서명 글이 붙음)
const SECRET = 'SECRETSIG0123';
const site = http.createServer((q, s) => {
  if (q.url.startsWith('/fake/sound.ogg')) { s.writeHead(200, { 'content-type': 'audio/ogg' }); return s.end(Buffer.alloc(4096, 7)); }
  const f = path.join(ROOT, q.url.split('?')[0]); fs.readFile(f, (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200); s.end(b); });
}).listen(SITE_PORT, '127.0.0.1');
const AUDIO_URL = 'http://127.0.0.1:' + SITE_PORT + '/fake/sound.ogg?X-Amz-Signature=' + SECRET;

// 가짜 PLAUD CLI — 공식 CLI 0.3.15 가 터미널이 아닐 때 내놓는 글과 같은 꼴
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plaud-e2e-')), bin = path.join(tmp, 'bin'), tools = path.join(tmp, 'tools'); fs.mkdirSync(bin); fs.mkdirSync(tools);
const ID = c => 'f_' + String(c).repeat(32).slice(0, 32);
const REC = [[ID('a'), '김하늘 집사 심방', '2026-11-22T06:05:00', '48m00s'], [ID('b'), '박소망 성도 전화심방', '2026-11-21T01:00:00', '12m03s'], [ID('c'), '', '2026-11-20T23:30:00', '6s'],
  [ID('e'), '', '2026-11-19T02:00:00', '30m00s'], [ID('f'), '', '2026-11-18T02:00:00', '20m00s']];
fs.writeFileSync(path.join(tmp, 'mode'), 'ok'); fs.writeFileSync(path.join(tmp, 'wmode'), '300');
fs.writeFileSync(path.join(bin, 'plaud'), `#!/usr/bin/env node
const fs = require('fs'), mode = fs.readFileSync(${JSON.stringify(path.join(tmp, 'mode'))}, 'utf8').trim(), REC = ${JSON.stringify(REC)}, a = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(path.join(tmp, 'calls'))}, a.join(' ') + ' TELEMETRY=' + (process.env.PLAUD_TELEMETRY_DISABLED || '') + '\\n');
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
if (a[0] === 'audio') { if (!REC.find(x => x[0] === a[1])) process.exit(1);
  console.log('\\n\\x1b[32mAudio Download URL:\\x1b[39m\\n' + ${JSON.stringify(AUDIO_URL)} + '\\n\\n(valid for 24 hours)\\n'); process.exit(0); }
process.exit(1);
`, { mode: 0o755 });
// 가짜 ffmpeg: 받은 소리가 있으면 작은 WAV(100KB)를 만든다
fs.writeFileSync(path.join(tools, 'ffmpeg'), `#!/usr/bin/env node
const fs = require('fs'), a = process.argv.slice(2), i = a[a.indexOf('-i') + 1], o = a[a.length - 1];
fs.appendFileSync(${JSON.stringify(path.join(tmp, 'ffcalls'))}, require('path').basename(process.env.HOME) + ' ' + a.join(' ') + '\\n');
let sz = 0; try { sz = fs.statSync(i).size; } catch (_) { }
if (sz < 1000 || !/\\.wav$/.test(o)) process.exit(1);
fs.writeFileSync(o, Buffer.alloc(100044, 1)); process.exit(0);
`, { mode: 0o755 });
// 가짜 whisper-cli: wmode(천분의 1초)만큼 걸리며 진행 % 를 오류 글로 · '-of' 자리에 지어낸 전사 글. 시작 · 끝을 Mac 이름과 함께 적는다
fs.writeFileSync(path.join(tools, 'whisper-cli'), `#!/usr/bin/env node
const fs = require('fs'), path = require('path'), a = process.argv.slice(2), arg = k => a[a.indexOf(k) + 1];
const wav = arg('-f'), out = arg('-of'), model = arg('-m'), who = path.basename(process.env.HOME), LOG = ${JSON.stringify(path.join(tmp, 'wcalls'))};
const ms = +fs.readFileSync(${JSON.stringify(path.join(tmp, 'wmode'))}, 'utf8') || 300;
if (!fs.existsSync(model) || !fs.existsSync(wav) || arg('-l') !== 'ko' || !a.includes('-otxt')) process.exit(3);
const tag = who + ' ' + path.basename(wav) + ' ' + path.basename(model);
fs.appendFileSync(LOG, tag + ' start ' + Date.now() + '\\n');
process.on('SIGTERM', () => { fs.appendFileSync(LOG, tag + ' killed ' + Date.now() + '\\n'); process.exit(143); });
let p = 0; const iv = setInterval(() => { p = Math.min(100, p + 25); process.stderr.write('whisper_print_progress_callback: progress = ' + String(p).padStart(3) + '%\\n'); }, ms / 4);
setTimeout(() => { clearInterval(iv); fs.writeFileSync(out + '.txt', ' 안녕하세요 목사님.\\n 지어낸 전사 글입니다 ' + path.basename(wav) + '\\n');
  fs.appendFileSync(LOG, tag + ' end ' + Date.now() + '\\n'); process.exit(0); }, ms);
`, { mode: 0o755 });

// 두 Mac 이 함께 보는 드라이브(구글 드라이브 앱이 맞춰 주는 것을 같은 폴더로 흉내) — 처음엔 'HB-심방-전사' 폴더가 없다
const driveRoot = path.join(tmp, 'drive'); fs.mkdirSync(driveRoot);
const DRIVE = path.join(driveRoot, PH.DRIVE_DIR);

// 도우미 셋(집 · 사무실 · 서재) — 따로 폴더 · 따로 연결 자리. 집 · 사무실만 ffmpeg · whisper-cli · 모델 · 드라이브가 있다
const kids = [];
const startHelper = (name, port, o = {}) => {
  const dir = path.join(tmp, name); fs.mkdirSync(dir, { recursive: true });
  if (o.drive) { const cs = path.join(dir, 'Library', 'CloudStorage', 'GoogleDrive-hb@example.com'); fs.mkdirSync(cs, { recursive: true }); fs.symlinkSync(driveRoot, path.join(cs, o.drive)); }
  for (const id of o.models || []) { const m = PH.MODELS.find(x => x.id === id), md = path.join(dir, 'models'); fs.mkdirSync(md, { recursive: true });
    const fd = fs.openSync(path.join(md, m.file), 'w'); fs.ftruncateSync(fd, m.mb * 1e6); fs.closeSync(fd); }   // 빈 큰 파일(실제 공간은 안 씀)
  const env = Object.assign({}, process.env, { PATH: bin + (o.tools ? ':' + tools : '') + ':' + process.env.PATH, PLAUDHUB_DIR: dir, PLAUDHUB_PORT: String(port), PLAUDHUB_SITE: 'http://127.0.0.1:' + SITE_PORT + '/plaudhub/',
    PLAUDHUB_TOKEN_URL: AUTH + '/securetoken.googleapis.com/v1/token', PLAUDHUB_FS_HOST: FS, PLAUDHUB_DEV_ORIGIN: 'http://127.0.0.1:8765', HOME: dir,
    PLAUDHUB_TICK_MS: '1000', PLAUDHUB_JOB_MS: '1500', PLAUDHUB_RENEW_MS: '2000', PLAUDHUB_FAKE_FREE_FILE: path.join(dir, 'fakefree'), no_proxy: '127.0.0.1,localhost', NO_PROXY: '127.0.0.1,localhost' });
  const ch = spawn(process.execPath, [path.join(ROOT, 'plaudhub', 'helper.mjs')], { env, detached: true }); let logs = '';
  ch.stdout.on('data', d => logs += d); ch.stderr.on('data', d => logs += d); kids.push(ch);
  return { dir, port, name, ch, log: () => logs, free: v => fs.writeFileSync(path.join(dir, 'fakefree'), String(v)) };
};
const killGroup = ch => { try { process.kill(-ch.pid, 'SIGKILL'); } catch (_) { } };
const pairAt = (port, body, origin = 'http://127.0.0.1:8765') => fetch('http://127.0.0.1:' + port + '/pair', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ code: r.status, j: await r.json().catch(() => ({})) }));
const lines = f => { try { return fs.readFileSync(path.join(tmp, f), 'utf8').split('\n').filter(Boolean); } catch (_) { return []; } };
const wStarts = id => lines('wcalls').filter(l => l.includes(' ' + id + '.wav ') && / start /.test(l));
const driveTxts = () => { try { return fs.readdirSync(DRIVE).sort(); } catch (_) { return []; } };

try {
  await adminSet('plaud/' + UID, { kw: ['심방'], days: 14 });
  const home = startHelper('home', 47931, { tools: true, drive: '내 드라이브', models: ['large-v3-turbo-q5_0', 'medium-q5_0'] });
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
  ok('② (P3) 준비 상태: ffmpeg · whisper · 모델 ✓, 드라이브 폴더 ✗(아직 없음) · 깔린 모델 둘', mac && mac.ready.ffmpeg && mac.ready.whisper && mac.ready.model && mac.ready.drive === false
    && JSON.stringify(mac.models) === JSON.stringify(['medium-q5_0', 'large-v3-turbo-q5_0']), mac && [mac.ready, mac.models]);
  const recs = await until(async () => { const d = await admin('plaud/' + UID + '/rec'); return d && Object.keys(d).length === 5 && d; });
  ok('③ 녹음 줄 다섯', !!recs, recs || home.log().slice(-1500));
  if (recs) {
    ok('③ 제목 · 시작(세계 표준시) · 길이', recs[ID('a')].n === '김하늘 집사 심방' && recs[ID('a')].t === Date.UTC(2026, 10, 22, 6, 5) && recs[ID('a')].d === 2880, recs[ID('a')]);
    ok('③ 빈 제목도 줄로', recs[ID('c')].n === '' && recs[ID('c')].d === 6);
    ok('③ 쓰는 칸은 n · t · c · d 뿐', Object.keys(recs[ID('a')]).filter(k => !['id', '_ut'].includes(k)).sort().join() === 'c,d,n,t');
  }
  await sleep(2500);
  ok('③ 드라이브 폴더가 없으면 일감을 집지 않음', !(await admin('plaud/' + UID + '/job')) || Object.keys(await admin('plaud/' + UID + '/job')).length === 0);
  const calls = fs.readFileSync(path.join(tmp, 'calls'), 'utf8');
  ok('③ CLI 는 통계를 끄고 불림 · 맡기 전에는 음성 주소를 묻지 않음', !/TELEMETRY=\s*$/m.test(calls) && !/^audio /m.test(calls), calls);
  // ④ 두 번째 Mac
  const ut0 = recs ? recs[ID('a')]._ut : '';
  const office = startHelper('office', 47932, { tools: true, drive: 'My Drive', models: ['large-v3-turbo-q5_0'] });
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
  const macErr = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.err && d; }, 70000), recs3 = await admin('plaud/' + UID + '/rec');
  ok('⑥ 모양이 바뀌면 멈추고 알림(요청 실패 · Mac 카드에 까닭)', fail && fail.st === 'fail' && /멈춤/.test(macErr.err || '') && /모양/.test(macErr.err || ''), [fail, macErr && macErr.err]);
  ok('⑥ 멈춘 동안 녹음 줄을 지우지 않음', recs3 && Object.keys(recs3).length === 5);
  ok('⑥ 까닭에 제목이 없음', !/김하늘|박소망/.test((macErr && macErr.err) || '') && !/김하늘|박소망/.test((fail && fail.log) || ''));
  fs.writeFileSync(path.join(tmp, 'mode'), 'ok');
  // ⑦ 일감 맡기 REST — 도우미 코드(jobIO)를 그대로 불러 같은 계정 두 Mac 으로 (목록에 없는 번호 z — 실제 도우미들은 건드리지 않음)
  process.env.PLAUDHUB_DIR = path.join(tmp, 'x'); process.env.PLAUDHUB_PORT = '47939'; process.env.PLAUDHUB_TOKEN_URL = AUTH + '/securetoken.googleapis.com/v1/token'; process.env.PLAUDHUB_FS_HOST = FS;
  const H = await import(path.join(ROOT, 'plaudhub', 'helper.mjs'));
  H._setCore(PH); Object.assign(H._st, { tok: { rt: hb.refreshToken, uid: UID }, mac: '집' });
  const Z = ID('z');
  const rs = await Promise.all([PH.tryClaim(H.jobIO, Z, '집'), PH.tryClaim(H.jobIO, Z, '사무실')]);
  const job = await admin('plaud/' + UID + '/job/' + Z);
  ok('⑦ 두 Mac 이 동시에 집으면 한 대만', rs.filter(x => x.ok).length === 1 && job && job.st === 'work' && rs.find(x => x.ok) && job.mac === ['집', '사무실'][rs.findIndex(x => x.ok)], [rs, job]);
  ok('⑦ 진 쪽은 \'다른 Mac 이 하는 중\'', rs.some(x => !x.ok && x.why === 'busy'), rs);
  ok('⑦ 맡은 시각은 파이어베이스 시계', job && Math.abs(job.at - Date.now()) < 60e3);
  ok('⑦ 일감 칸에 제목이 없음', job && !('n' in job));
  const winner = job.mac, loser = winner === '집' ? '사무실' : '집';
  ok('⑦ 다른 쪽이 새로 찍으려 하면 \'잃음\'', (await PH.renew(H.jobIO, Z, loser, 'stt')).why === 'lost');
  ok('⑦ 맡은 쪽은 새로 찍음', (await PH.renew(H.jobIO, Z, winner, 'stt')).ok === true);
  await adminPatch('plaud/' + UID + '/job/' + Z, { at: Date.now() - 31 * 60e3 });
  const take = await PH.tryClaim(H.jobIO, Z, loser);
  ok('⑦ 31분 소식이 없으면 다른 Mac 이 이어받음(처음 단계부터)', take.ok && take.how === 'expired' && (await admin('plaud/' + UID + '/job/' + Z)).mac === loser && take.step === 'get', take);
  ok('⑦ 기록(도우미 로그)에 열쇠 · 주소가 없음', !/refresh_token|AMf-|https?:\/\/(?!127)/.test(home.log() + office.log()), (home.log() + office.log()).slice(-400));
  await fetch(DOCS + '/plaud/' + UID + '/job/' + Z, { method: 'DELETE', headers: { authorization: 'Bearer owner' } });
  // ⑨ 계기판
  const req = createRequire(import.meta.url); let pw; try { pw = req('playwright'); } catch (_) { pw = req('/opt/node-tools/node_modules/playwright'); }
  const third = startHelper('study', 47211);   // 계기판은 늘 47211 을 부른다 — 이 Mac 엔 ffmpeg · whisper 가 없다
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
    // 새로고침 아이콘
    const rl = await pg.$eval('[data-act="reload"]', e => [e.getAttribute('title'), e.getAttribute('aria-label')]);
    ok('⑨ 새로고침 아이콘에 마우스를 올리면 \'녹음 목록 지금 다시 읽기\'', rl[0] === '녹음 목록 지금 다시 읽기' && rl[1] === '녹음 목록 지금 다시 읽기', rl);
    await sleep(3500);   // 앞 토스트(키워드)가 닫히게
    await pg.mouse.click(5, 300); await pg.click('[data-act="reload"]');
    const tt = await until(async () => { const t = await pg.$('.toast'); return t && (await t.textContent()); }, 5000);
    ok('⑨ 누르면 토스트 \'다시 읽어 오라고 보냈습니다 / 1분 안에\'', tt === '녹음 목록을 다시 읽어 오라고 보냈습니다\n1분 안에 새 녹음이 나타납니다', tt);
    const rf = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); const xs = d && Object.values(d).filter(x => x.what === 'refresh'); return xs && xs.length >= 3 && xs.some(x => x.mac === '사무실') && xs; });
    ok('⑨ 켜진 Mac 마다 다시 읽기 요청', !!rf, rf);
    // 이 Mac 연결 — 세 번째 도우미(47211)
    await until(() => fetch('http://127.0.0.1:47211/hello', { headers: { origin: 'https://block7.my' } }).then(r => r.ok));
    await pg.click('[data-act="menu"]'); await pg.click('[data-act="pairpane"]');
    await pg.waitForSelector('#mac-in', { timeout: 8000 }).catch(() => null);
    const paneTxt = await pg.textContent('#pane');
    ok('⑨ 이 Mac 연결 판이 도우미를 찾음', paneTxt.includes('도우미가 이 Mac 에서 돌고 있습니다'), paneTxt);
    if (await pg.$('#mac-in')) { await pg.fill('#mac-in', '서재'); await pg.click('[data-act="pairtyped"]'); }
    const m3 = await until(async () => { const d = await admin('plaud/' + UID + '/mac/서재'); return d && d.v && d.ready && d.ready.whisper === false && d; }, 30000);
    ok('⑨ 계기판에서 누른 \'이 Mac 연결\' 로 세 번째 Mac 이 계정에 나타남', !!m3, third.log().slice(-500));
    const fix = await until(() => pg.$('[data-act="fix"][data-mac="서재"][data-k="whisper"]'), 15000);
    ok('⑨ 없는 것(whisper.cpp)에 \'설치\' 단추', !!fix);
    if (fix) { await sleep(500); await pg.click('[data-act="fix"][data-mac="서재"][data-k="whisper"]'); await pg.waitForSelector('[data-act="runfix"]'); const txt = await pg.textContent('#pane');
      ok('⑨ 설치 판: 무엇 · 어디 · 크기 · 명령(sudo 없음)', txt.includes('brew install whisper-cpp') && txt.includes('/opt/homebrew') && txt.includes('sudo 없음'), txt);
      await pg.click('[data-act="runfix"]');
      const c = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); return d && Object.values(d).find(x => x.what === 'whisper' && x.mac === '서재'); });
      ok('⑨ 설치를 누르면 계정 cmd 에 열쇠 이름만(명령 글 없음)', c && !('argv' in c) && ['new', 'run', 'ok', 'fail'].includes(c.st), c);
      const fin = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); const x = d && Object.values(d).find(x => x.what === 'whisper'); return x && (x.st === 'ok' || x.st === 'fail') && x; }, 40000);
      ok('⑨ 서재 도우미가 집어 돌림(이 시험 기계엔 Homebrew 가 없어 실패로 끝남)', fin && fin.st === 'fail', fin); }

    // ⑩ (P3) 공간이 모자라면 맡지 않음 — 드라이브 폴더(이미 있던 c.txt 하나)를 만들고 두 Mac 모두 남은 공간 0.1GB
    home.free(1e8); office.free(1e8);
    fs.mkdirSync(DRIVE); fs.writeFileSync(path.join(DRIVE, ID('c') + '.txt'), '이미 있던 파일 (다른 Mac 이 먼저 씀)\n');
    const warn = await until(async () => { const d = await admin('plaud/' + UID + '/mac'); return d && /공간이 모자라/.test(d['집'].err || '') && /공간이 모자라/.test(d['사무실'].err || '') && d; }, 70000);
    ok('⑩ 공간이 모자라면 두 Mac 모두 Mac 카드에 알림(남음 · 필요)', warn && /남음 0\.1GB/.test(warn['집'].err) && /필요/.test(warn['집'].err), warn && [warn['집'].err, warn['사무실'].err]);
    const jobs0 = await admin('plaud/' + UID + '/job');
    ok('⑩ … 그리고 아무 일감도 맡지 않음', !Object.values(jobs0 || {}).some(j => j.st), jobs0);
    ok('⑩ 계기판 Mac 카드에도 보임', await until(async () => (await pg.textContent('#main')).includes('공간이 모자라'), 10000));

    // ⑪ (P3) 공간을 비우면 두 Mac 이 나눠 전사
    home.free(50e9); office.free(50e9);
    const allDone = await until(async () => { const d = await admin('plaud/' + UID + '/job'); return d && [ID('a'), ID('b'), ID('c')].every(id => d[id] && d[id].st === 'done') && d; }, 90000);
    ok('⑪ 고른 셋(키워드 둘 · 직접 고른 하나)이 모두 끝남', !!allDone, allDone || (home.log() + office.log()).slice(-1500));
    ok('⑪ 드라이브에 녹음마다 txt 하나뿐(임시 파일 없음)', JSON.stringify(driveTxts()) === JSON.stringify([ID('a'), ID('b'), ID('c')].map(x => x + '.txt').sort()), driveTxts());
    ok('⑪ 같은 녹음을 두 Mac 이 겹쳐 전사하지 않음(whisper 가 녹음마다 한 번)', wStarts(ID('a')).length === 1 && wStarts(ID('b')).length === 1, lines('wcalls'));
    ok('⑪ 이미 있던 c.txt 는 그대로 · 받지도 전사하지도 않음(겹 둘)', fs.readFileSync(path.join(DRIVE, ID('c') + '.txt'), 'utf8').startsWith('이미 있던 파일') && wStarts(ID('c')).length === 0
      && !lines('calls').includes('audio ' + ID('c') + ' TELEMETRY=1'), lines('calls').filter(l => /^audio/.test(l)));
    ok('⑪ 음성 주소는 녹음마다 한 번만 물음', ['a', 'b'].every(k => lines('calls').filter(l => l.startsWith('audio ' + ID(k))).length === 1), lines('calls').filter(l => /^audio/.test(l)));
    const per = {}; for (const l of lines('wcalls')) { const [who, , , what, t] = l.split(' '); (per[who] = per[who] || []).push([what, +t]); }
    ok('⑪ 한 Mac 은 한 번에 하나씩(전사가 겹치지 않음)', Object.values(per).every(xs => xs.every((x, i) => i === 0 || (x[0] === 'start') === (xs[i - 1][0] !== 'start'))), per);
    ok('⑪ 일감 칸: 끝 · 드라이브 단계 · 맡은 Mac · 제목 없음', [ID('a'), ID('b'), ID('c')].every(id => allDone && allDone[id].step === 'drive' && ['집', '사무실'].includes(allDone[id].mac) && !('n' in allDone[id])), allDone);
    const ta = fs.readFileSync(path.join(DRIVE, ID('a') + '.txt'), 'utf8');
    ok('⑪ txt 머리말: 녹음 ID · 제목 · 한국 시각(+09:00) · 길이 · 모델(계정 설정 = 터보)', ta.startsWith('PLAUD 녹음 ID: ' + ID('a') + '\n제목: 김하늘 집사 심방\n녹음 시각: 2026-11-22T15:05:00+09:00\n길이: 48분\n전사: whisper.cpp large-v3-turbo-q5_0 · ')
      && /\n---\n\n안녕하세요 목사님\.\n지어낸 전사 글입니다 /.test(ta), ta.slice(0, 300));
    ok('⑪ whisper 는 한국어(-l ko)로 · ffmpeg 는 16kHz 모노 WAV 로 불림', lines('ffcalls').some(l => /-ar 16000 -ac 1 -c:a pcm_s16le \S+\.wav$/.test(l)), lines('ffcalls'));
    const everything = home.log() + office.log() + JSON.stringify(await admin('plaud/' + UID + '/mac')) + JSON.stringify(await admin('plaud/' + UID + '/job')) + JSON.stringify(await admin('plaud/' + UID + '/cmd'));
    ok('⑪ 음성 주소(서명)가 기록 · 계정 어디에도 없음', !everything.includes(SECRET) && !everything.includes('fake/sound'), everything.slice(0, 200));
    ok('⑪ 전사 글이 기록 · 계정에 없음', !everything.includes('지어낸 전사 글'));
    const left = ['home', 'office'].flatMap(k => { try { return fs.readdirSync(path.join(tmp, k, 'work')); } catch (_) { return []; } });
    ok('⑪ 받은 소리 · WAV · 중간 글은 지움', left.length === 0, left);
    const shown = await until(async () => { const t = await pg.textContent('[data-id="' + ID('a') + '"]'); return /드라이브에 있음/.test(t) && t; }, 10000);
    ok('⑪ 계기판 줄: \'… Mac 전사 · 드라이브에 있음\' · 단계 셋 초록', !!shown && await pg.$$eval('[data-id="' + ID('a') + '"] .steps span.on', xs => xs.length) === 3, shown);

    // ⑫ (P3) 모델 시험 — 계기판에서
    await pg.mouse.click(5, 300); await sleep(300);
    await until(() => pg.$('[data-act="mtestpane"][data-mac="집"]'), 10000);
    await pg.click('[data-act="mtestpane"][data-mac="집"]'); await pg.waitForSelector('[data-act="mtrun"]');
    const mp = await pg.textContent('#pane');
    ok('⑫ 모델 시험 판: 깔린 둘은 \'깔림\' · 안 깔린 큰 것은 \'설치\' 단추', /중간 · 양자화 · 514MB깔림/.test(mp) && /터보 · 양자화 · 547MB깔림/.test(mp) && !!(await pg.$('[data-act="mtinstall"][data-m="large-v3-q5_0"]')), mp);
    ok('⑫ 시험할 녹음은 10분 넘는 것부터', await pg.$eval('.opt.sel[data-act="mtrec"]', e => e.dataset.id) === ID('a'));
    await pg.click('[data-act="mtrun"]');
    const mt = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); const x = d && Object.values(d).find(x => x.what === 'mtest'); return x && (x.st === 'ok' || x.st === 'fail') && x; }, 40000);
    const hm = await admin('plaud/' + UID + '/mac/집');
    ok('⑫ 시험 요청(녹음 번호)을 집 도우미가 해냄', mt && mt.st === 'ok' && mt.arg === ID('a'), [mt, home.log().slice(-600)]);
    ok('⑫ Mac 카드에 모델별 걸린 시간 · 빠르기(글 없음)', hm && hm.test && hm.test.r && hm.test.r['medium-q5_0'] && hm.test.r['large-v3-turbo-q5_0'] && Object.keys(hm.test.r['medium-q5_0']).sort().join() === 's,x' && hm.test.len >= 1, hm && hm.test);
    const tf = (() => { try { return fs.readdirSync(path.join(home.dir, 'test')).sort(); } catch (_) { return []; } })();
    ok('⑫ 시험 글은 그 Mac 의 test 폴더에만(모델마다 하나) · 드라이브는 그대로', JSON.stringify(tf) === JSON.stringify(['large-v3-turbo-q5_0.txt', 'medium-q5_0.txt']) && driveTxts().length === 3, [tf, driveTxts()]);
    ok('⑫ 시험 글 머리말', /^모델 시험 — 터보 · 양자화 \(large-v3-turbo-q5_0\)\n녹음 f_a+ 앞 3초 · /.test(fs.readFileSync(path.join(home.dir, 'test', 'large-v3-turbo-q5_0.txt'), 'utf8')));
    ok('⑫ 계기판 Mac 카드에 시험 결과', await until(async () => /모델 시험 \(앞 3초\)/.test(await pg.textContent('#main')) && /녹음 1분에/.test(await pg.textContent('#main')), 10000));

    // ⑬ (P3) 꺼진 Mac 일감 이어받기 — 전사를 15초 걸리게 하고 녹음 e 를 고름
    fs.writeFileSync(path.join(tmp, 'wmode'), '15000');
    await adminPatch('plaud/' + UID + '/job/' + ID('e'), { pick: 'in' });
    const ew = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); return d && d.st === 'work' && d.step === 'stt' && wStarts(ID('e')).length === 1 && d; }, 30000);
    ok('⑬ 한 Mac 이 녹음 e 를 맡아 전사 중', !!ew, ew);
    const doing = ew && await until(async () => { const d = await admin('plaud/' + UID + '/mac/' + ew.mac); return /^전사 중 1분째/.test(d.doing || '') && d.doing; }, 10000);
    ok('⑬ 전사 중에도 소식은 계속(\'전사 중 1분째\')', !!doing, doing);
    await sleep(4500);
    const ew2 = await admin('plaud/' + UID + '/job/' + ID('e'));
    ok('⑬ 일하는 동안 맡은 시각을 새로 찍음(renew)', ew && ew2 && ew2.at > ew.at && ew2.mac === ew.mac, [ew && ew.at, ew2 && ew2.at]);
    const dead = ew && (ew.mac === '집' ? home : office), live = dead === home ? office : home;
    if (dead) killGroup(dead.ch);
    await adminPatch('plaud/' + UID + '/job/' + ID('e'), { at: Date.now() - 31 * 60e3 });   // 31분 동안 소식이 없던 것처럼
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    const eDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); return d && d.st === 'done' && d; }, 40000);
    ok('⑬ 꺼진 Mac 의 일감을 다른 Mac 이 이어받아 끝냄', eDone && dead && eDone.mac !== ew.mac, [eDone, live && live.log().slice(-500)]);
    ok('⑬ txt 는 하나뿐', driveTxts().filter(x => x.startsWith(ID('e'))).length === 1 && driveTxts().length === 4, driveTxts());
    ok('⑬ 이어받은 Mac 기록에 \'이어받음\'', live && /이어받음/.test(live.log()));

    // ⑭ (P3) 맡김을 잃으면 바로 멈춤 — 남은 한 Mac 이 f 를 전사하는 중에 다른 Mac('서재')이 맡은 것으로 바꿈
    fs.writeFileSync(path.join(tmp, 'wmode'), '15000');
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { pick: 'in' });
    const fw = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('f')); return d && d.st === 'work' && d.step === 'stt' && wStarts(ID('f')).length === 1 && d; }, 30000);
    ok('⑭ 남은 Mac 이 f 를 전사 중', !!fw && live && fw.mac === (live === home ? '집' : '사무실'), fw);
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { mac: '서재', at: Date.now() });
    const killed = await until(async () => lines('wcalls').some(l => l.includes(' ' + ID('f') + '.wav ') && / killed /.test(l)), 10000);
    ok('⑭ 다음 renew(2초) 에서 잃은 것을 보고 whisper 를 멈춤', !!killed && /맡김을 잃어 멈춤/.test(live.log()), lines('wcalls').slice(-3));
    await sleep(1000);
    ok('⑭ … txt 를 쓰지 않음 · 일감은 서재 몫 그대로', !driveTxts().includes(ID('f') + '.txt') && (await admin('plaud/' + UID + '/job/' + ID('f'))).mac === '서재', driveTxts());
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { at: Date.now() - 31 * 60e3 });
    const fDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('f')); return d && d.st === 'done' && d; }, 40000);
    ok('⑭ 서재가 소식이 없자 남은 Mac 이 다시 맡아 끝냄 · txt 하나', fDone && driveTxts().filter(x => x.startsWith(ID('f'))).length === 1 && driveTxts().length === 5, [fDone, driveTxts()]);
    ok('⑨ 계기판 화면 오류 없음', errs.length === 0, errs);
  } finally { await browser.close(); }
} catch (e) { bad++; console.log('  ✗ 도중에 멈춤', e && e.stack); }
finally { kids.forEach(killGroup); site.close(); }
console.log(`결과: 통과 ${n - bad} / 실패 ${bad}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
