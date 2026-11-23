#!/usr/bin/env node
// 심방 녹음 Mac 도우미 (plaudhub) — Mac 을 켜면 launchd 가 저절로 돌린다(설치는 install.sh 한 줄).
//
// 하는 일 (P2):
//  · 2분마다 계정의 mac/{이 Mac 이름} 에 소식(켜짐 · 하는 일 · 준비 상태 ✓✗ · 도우미 판)을 남긴다
//  · 10분마다 공식 PLAUD CLI 로 최근 녹음 목록을 읽어 rec/{녹음번호} 에 제목 · 시각 · 길이를 둔다(바뀐 줄만)
//  · 계정의 cmd 칸에서 이 Mac 몫 요청(설치 · 새로 받기 · 다시 읽기)을 받아 **정해 둔 명령만** 돌린다(INSTALLS 표)
//  · 127.0.0.1:47211 에서 block7.my 계기판의 '이 Mac 연결' 만 받는다(로그인 열쇠를 건네받음)
// 하지 않는 것: 음성 받기 · 전사 · 드라이브(P3) · sudo · 비공식 PLAUD 도구 · 음성 주소(24시간 열쇠)를 기록에 남기기.
//
// 판단(CLI 글 읽기 · 고르기 · 맡기 · 값 바꾸기)은 계기판 index.html 의 <script id="plaudhub-core"> 한 곳 —
// 여기서는 그 파일을 받아 그 덩어리만 떼어(core.js) 쓴다. 두 벌로 두지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import vm from 'node:vm';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const HELPER_VERSION = 'h. 26-1123-1';
const HOME = os.homedir();
const DIR = process.env.PLAUDHUB_DIR || path.join(HOME, 'Library', 'Application Support', 'plaudhub');
const SITE = process.env.PLAUDHUB_SITE || 'https://block7.my/plaudhub/';
const PORT = +(process.env.PLAUDHUB_PORT || 47211);
// 계기판이 사는 곳만 연결을 받는다. 시험 · 개발용 주소는 환경 변수로만 더한다
const ORIGINS = ['https://block7.my'].concat(process.env.PLAUDHUB_DEV_ORIGIN ? [process.env.PLAUDHUB_DEV_ORIGIN] : []);
const API_KEY = 'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE';   // 공개 웹 설정값(앱들에 이미 있는 것) — 비밀 열쇠가 아니다
const TOKEN_URL = process.env.PLAUDHUB_TOKEN_URL || 'https://securetoken.googleapis.com/v1/token';
const FS_HOST = process.env.PLAUDHUB_FS_HOST || 'https://firestore.googleapis.com';
const BEAT_MS = 2 * 60e3, LIST_MS = 10 * 60e3, READY_MS = 10 * 60e3, TICK_MS = 30e3, FILE_CALLS = 40;

// launchd 는 PATH 가 짧다 — Homebrew · 내 npm 폴더를 앞에. PLAUD CLI 의 사용 통계 · 새 판 알림은 끈다
process.env.PATH = ['/opt/homebrew/bin', '/usr/local/bin', path.join(HOME, '.npm-global', 'bin'), '/usr/bin', '/bin', '/usr/sbin', '/sbin', process.env.PATH || ''].join(':');
process.env.PLAUD_TELEMETRY_DISABLED = '1'; process.env.DO_NOT_TRACK = '1'; process.env.PLAUD_NO_UPDATE_NOTIFIER = '1';

let PH = null;   // 판단 덩어리
const st = { tok: null, idTok: '', idExp: 0, mac: '', skew: 0, doing: '쉼', ready: {}, err: '', cli: '', lastBeat: 0, lastList: 0, lastReady: 0, busy: false, needPair: false, sentKey: '' };

function log(...a) { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(new Date().toISOString(), PH ? PH.clean(s, 2000) : s.replace(/https?:\/\/\S+/g, '[주소]')); }
function readJson(f, d) { try { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch (_) { return d; } }
function writeJson(f, v, secret) {
  const p = path.join(DIR, f), tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(v), { mode: secret ? 0o600 : 0o644 }); fs.renameSync(tmp, p); if (secret) fs.chmodSync(p, 0o600);
}

/* ---------- 판단 덩어리 불러오기 ---------- */
export function extractCore(html) {
  const m = /<script id="plaudhub-core">([\s\S]*?)<\/script>/.exec(String(html || ''));
  return m ? m[1] : '';
}
export function runCore(code) {
  const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error, URL };
  vm.createContext(ctx); vm.runInContext(code + '\n;this.__PH = PH;', ctx);
  if (!ctx.__PH || !ctx.__PH.parseRecent) throw new Error('판단 덩어리가 비었습니다');
  return ctx.__PH;
}
async function fetchCore() {
  const r = await fetch(SITE + 'index.html', { cache: 'no-store' }); if (!r.ok) throw new Error('계기판 파일 ' + r.status);
  const code = extractCore(await r.text()); if (!code) throw new Error('계기판 파일에 판단 덩어리가 없습니다');
  runCore(code); fs.writeFileSync(path.join(DIR, 'core.js'), code); return code;
}
async function loadCore() {
  let code = ''; try { code = fs.readFileSync(path.join(DIR, 'core.js'), 'utf8'); } catch (_) { }
  if (!code) code = await fetchCore();
  PH = runCore(code);
}

/* ---------- 명령 돌리기 ---------- */
function run(cmd, args, ms) {
  return new Promise(res => {
    let out = '', err = '', done = false;
    let ch; try { ch = spawn(cmd, args, { env: process.env, cwd: HOME }); } catch (e) { return res({ code: -1, out: '', err: String(e.message || e) }); }
    const tm = setTimeout(() => { if (!done) { try { ch.kill('SIGTERM'); } catch (_) { } } }, ms || 120e3);
    ch.stdout.on('data', d => { out += d; if (out.length > 4e6) out = out.slice(-4e6); });
    ch.stderr.on('data', d => { err += d; if (err.length > 2e5) err = err.slice(-2e5); });
    ch.on('error', e => { if (done) return; done = true; clearTimeout(tm); res({ code: -1, out, err: String(e.message || e) }); });
    ch.on('close', code => { if (done) return; done = true; clearTimeout(tm); res({ code: code == null ? -1 : code, out, err }); });
  });
}
const has = name => spawnSync('/usr/bin/which', [name], { env: process.env }).status === 0;
const home = s => String(s).replace(/^~(?=\/|$)/, HOME);

/* ---------- 준비 상태 ---------- */
function driveFolder() {
  const cs = path.join(HOME, 'Library', 'CloudStorage');
  let ds = []; try { ds = fs.readdirSync(cs).filter(n => n.startsWith('GoogleDrive-')); } catch (_) { }
  for (const d of ds) for (const my of ['My Drive', '내 드라이브']) { const p = path.join(cs, d, my, 'HB-심방-전사'); try { if (fs.statSync(p).isDirectory()) return p; } catch (_) { } }
  return '';
}
function modelPath(m) { return path.join(DIR, 'models', m.file); }
async function checkReady(settings) {
  const r = {};
  r.brew = fs.existsSync('/opt/homebrew/bin/brew') || fs.existsSync('/usr/local/bin/brew');
  r.node = +process.versions.node.split('.')[0] >= 20;
  r.ffmpeg = has('ffmpeg');
  r.whisper = has('whisper-cli') || has('whisper-cpp');
  const m = PH.modelOf(settings && settings.model); let sz = 0; try { sz = fs.statSync(modelPath(m)).size; } catch (_) { }
  r.model = sz > m.mb * 1e6 * 0.9;
  r.plaud = has('plaud');
  if (r.plaud) {
    const me = await run('plaud', ['me'], 60e3);   // 결과(계정 정보)는 버리고 됐는지만 본다
    r.login = me.code === 0;
    const v = await run('plaud', ['version'], 30e3); st.cli = (PH.stripAnsi(v.out).split('\n').find(l => /^plaud /.test(l)) || '').trim().slice(0, 40);
  } else r.login = false;
  r.drive = !!driveFolder();
  st.ready = r; st.lastReady = Date.now();
  return r;
}

/* ---------- 파이어베이스 (REST · 보안 규칙이 그대로 걸린다) ---------- */
async function idToken() {
  if (!st.tok) throw new Error('아직 연결 안 됨');
  if (st.idTok && Date.now() < st.idExp - 120e3) return st.idTok;
  const r = await fetch(TOKEN_URL + '?key=' + API_KEY, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(st.tok.rt) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 400) { st.needPair = true; st.err = '로그인이 풀렸습니다 — 이 Mac 크롬에서 계기판 메뉴 › \'이 Mac 연결\' 을 다시 눌러 주세요'; } throw new Error('열쇠 갱신 실패 ' + r.status); }
  if (j.user_id !== st.tok.uid) throw new Error('다른 계정 열쇠');
  st.idTok = j.id_token; st.idExp = Date.now() + (+j.expires_in || 3600) * 1000; st.needPair = false; return st.idTok;
}
const DB = () => 'projects/' + PH.PROJECT + '/databases/(default)/documents';
const docName = (...seg) => DB() + '/plaud/' + st.tok.uid + (seg.length ? '/' + seg.join('/') : '');
async function fsCall(method, urlPath, body) {
  const t = await idToken();
  const r = await fetch(FS_HOST + '/v1/' + urlPath, { method, headers: { authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
}
async function getDoc(...seg) { const r = await fsCall('GET', docName(...seg)); if (r.status === 404) return null; if (!r.ok) throw new Error('읽기 ' + r.status); return PH.fsDoc(r.j); }
async function listColl(coll) {
  const out = {}; let tok = '';
  for (let i = 0; i < 20; i++) {
    const r = await fsCall('GET', docName(coll) + '?pageSize=300' + (tok ? '&pageToken=' + encodeURIComponent(tok) : ''));
    if (!r.ok) throw new Error(coll + ' 읽기 ' + r.status);
    for (const d of r.j.documents || []) { const o = PH.fsDoc(d); out[o.id] = o; }
    tok = r.j.nextPageToken || ''; if (!tok) break;
  }
  return out;
}
// 한 줄 쓰기: fields 만 바꾸고(나머지 칸은 그대로) · serverAt 이면 at = 파이어베이스 시계 · pre = { updateTime } | { exists }
function upd(seg, fields, o) {
  o = o || {}; const f = {}; for (const k of Object.keys(fields)) f[k] = PH.fsEnc(fields[k]);
  const w = { update: { name: docName(...seg), fields: f }, updateMask: { fieldPaths: Object.keys(fields) } };
  if (o.serverAt) w.updateTransforms = [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }];
  if (o.pre) w.currentDocument = o.pre;
  return w;
}
async function commit(writes) {
  const r = await fsCall('POST', DB() + ':commit', { writes });
  if (r.ok && r.j.commitTime) st.skew = Date.parse(r.j.commitTime) - Date.now();
  return r;
}
const serverNow = () => Date.now() + st.skew;

// 일감 맡기(P3 에서 씀) — 판단은 PH.tryClaim · renew · finish, 여기는 읽기 · 조건부 쓰기만
export const jobIO = {
  async read(id) { const r = await fsCall('GET', docName('job', id)); if (r.status === 404) return { job: null, ver: null, now: serverNow() };
    if (!r.ok) throw new Error('일감 읽기 ' + r.status); const j = PH.fsDoc(r.j); return { job: j, ver: j._ut, now: serverNow() }; },
  async write(id, patch, ver) {
    const r = await commit([upd(['job', id], patch, { serverAt: true, pre: ver ? { updateTime: ver } : { exists: false } })]);
    if (r.ok) return true; if (r.status === 400 || r.status === 409 || r.status === 412) return false;   // 그 사이 다른 Mac 이 바꿈
    throw new Error('일감 쓰기 ' + r.status);
  },
};

/* ---------- 소식 · 목록 · 요청 ---------- */
async function beat(force) {
  const key = JSON.stringify([st.doing, st.ready, st.err, st.cli]);
  if (!force && key === st.sentKey && Date.now() - st.lastBeat < BEAT_MS) return;
  const r = await commit([upd(['mac', st.mac], { doing: st.doing, ready: st.ready, v: HELPER_VERSION, err: PH.clean(st.err, 300), cli: st.cli }, { serverAt: true })]);
  if (!r.ok) throw new Error('소식 쓰기 ' + r.status + (r.status === 403 ? ' (보안 규칙을 붙였는지 확인)' : ''));
  st.lastBeat = Date.now(); st.sentKey = key;
}
async function refreshList(settings) {
  st.lastList = Date.now();   // 실패해도 다음은 10분 뒤 — CLI 를 30초마다 두드리지 않게
  if (!st.ready.plaud || !st.ready.login) return;
  st.doing = '목록 읽는 중'; await beat(true).catch(() => { });
  const s = PH.settingsOf(settings), out = await run('plaud', ['recent', '--days', String(s.days)], 120e3);
  if (out.code === 2) { st.ready.login = false; st.err = 'PLAUD 로그인이 풀렸습니다 — 준비 상태에서 \'로그인\' 을 눌러 주세요'; return; }
  if (out.code !== 0) { st.err = 'PLAUD 목록을 읽지 못했습니다 (끝 번호 ' + out.code + ')'; return; }
  const p = PH.parseRecent(out.out);
  if (!p.ok) { st.err = '멈춤: ' + p.err + (st.cli ? ' — ' + st.cli : '') + '\n짐작해 계속하지 않습니다. 도우미를 고칠 때까지 목록을 쓰지 않습니다.'; return; }
  const cache = readJson('cache.json', {}), rows = [];
  let calls = 0;
  for (const r of p.rows) {
    let c = cache[r.id];
    if (!c || c.d !== r.d) {
      if (calls++ >= FILE_CALLS) continue;   // 한 번에 너무 많이 묻지 않는다 — 다음 차례에 마저
      const f = await run('plaud', ['file', r.id], 60e3), q = PH.parseFileDetail(f.out);
      if (f.code !== 0 || !q.ok || q.id !== r.id) { st.err = '멈춤: ' + (q.ok ? '녹음 정보를 읽지 못했습니다' : q.err) + (st.cli ? ' — ' + st.cli : ''); return; }
      c = cache[r.id] = { t: q.t, c: q.c, d: q.d };
    }
    rows.push({ id: r.id, name: r.name, t: c.t, c: c.c, d: r.d });
  }
  writeJson('cache.json', cache);
  const old = await listColl('rec'), plan = PH.recPlan(old, rows, serverNow() - s.days * 86400e3);
  const writes = plan.put.map(x => upd(['rec', x.id], x.v)).concat(plan.del.map(id => ({ delete: docName('rec', id) })));
  for (let i = 0; i < writes.length; i += 400) { const r = await commit(writes.slice(i, i + 400)); if (!r.ok) throw new Error('녹음 줄 쓰기 ' + r.status); }
  st.err = plan.held ? 'PLAUD 에서 녹음 ' + plan.held + '개가 한꺼번에 사라져 계정에서 지우지 않았습니다 — 확인해 주세요' : '';
  st.lastList = Date.now();
  log('목록', rows.length + '개 · 새로 씀 ' + plan.put.length + ' · 지움 ' + plan.del.length);
}
async function doCmds(settings) {
  const cmds = Object.values(await listColl('cmd')).filter(c => PH.cmdFor(c, st.mac, serverNow())).sort((a, b) => (a.at || 0) - (b.at || 0));
  for (const c of cmds) {
    const I = PH.INSTALLS[c.what];
    // 먼저 '하는 중' 으로 — 그 사이 같은 요청을 두 번 집지 않게(읽은 판 그대로일 때만)
    const took = await commit([upd(['cmd', c.id], { st: 'run' }, { pre: { updateTime: c._ut } })]); if (!took.ok) continue;
    st.doing = I.title + ' 하는 중'; await beat(true).catch(() => { });
    let res;
    try { res = await runCmd(c, I, settings); } catch (e) { res = { ok: false, log: String(e.message || e) }; }
    await commit([upd(['cmd', c.id], { st: res.ok ? 'ok' : 'fail', log: PH.clean(res.log, 600) })]).catch(() => { });
    log('요청', c.what, res.ok ? '됨' : '실패');
    st.doing = '쉼';
    if (res.restart) { await beat(true).catch(() => { }); log('새 도우미로 다시 시작'); process.exit(0); }
    await checkReady(settings); await beat(true).catch(() => { });
  }
}
async function runCmd(c, I, settings) {
  if (c.what === 'check') { await checkReady(settings); return { ok: true, log: '' }; }
  if (c.what === 'refresh') { st.lastList = 0; await refreshList(settings); return { ok: !st.err, log: st.err }; }
  if (c.what === 'update') {
    const r = await fetch(SITE + 'helper.mjs', { cache: 'no-store' }); const t = await r.text();
    if (!r.ok || !/export const HELPER_VERSION = 'h\. /.test(t)) return { ok: false, log: '새 도우미 파일을 받지 못했습니다' };
    await fetchCore();
    const p = fileURLToPath(import.meta.url); fs.writeFileSync(p + '.new', t); fs.renameSync(p + '.new', p);
    return { ok: true, log: '', restart: true };
  }
  if (c.what === 'model') {
    const m = PH.MODELS.find(x => x.id === c.arg); if (!m) return { ok: false, log: '모르는 모델' };
    fs.mkdirSync(path.join(DIR, 'models'), { recursive: true });
    const dst = modelPath(m), part = dst + '.part';
    const r = await run('curl', ['-fL', '--retry', '2', '-sS', '-o', part, PH.modelUrl(m)], 60 * 60e3);
    let sz = 0; try { sz = fs.statSync(part).size; } catch (_) { }
    if (r.code !== 0 || sz < m.mb * 1e6 * 0.9) { try { fs.unlinkSync(part); } catch (_) { } return { ok: false, log: '받지 못했습니다 (' + r.code + ')\n' + r.err }; }
    fs.renameSync(part, dst); return { ok: true, log: '' };
  }
  const argv = I.argv.map(home), r = await run(argv[0], argv.slice(1), (I.mins || 5) * 4 * 60e3);
  return { ok: r.code === 0, log: (r.err || '') + '\n' + (r.out || '').slice(-300) };
}

async function tick() {
  if (st.busy) return; st.busy = true;
  try {
    if (!st.tok) { st.doing = '연결 기다림'; return; }
    const settings = await getDoc().catch(() => null) || {};
    if (!st.lastReady || Date.now() - st.lastReady > READY_MS) await checkReady(settings);
    await beat(false);
    await doCmds(settings);
    if (Date.now() - st.lastList > LIST_MS) { await refreshList(settings); if (st.err) log('알림', st.err); st.doing = '쉼'; await beat(true); }
  } catch (e) { log('차례 실패', String(e.message || e)); }
  finally { st.busy = false; }
}

/* ---------- 이 Mac 연결 (127.0.0.1 · block7.my 에서 온 것만) ---------- */
export function makeServer(onPair) {
  return http.createServer((req, res) => {
    const origin = req.headers.origin || '', host = String(req.headers.host || '');
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
    if (host !== '127.0.0.1:' + PORT && host !== 'localhost:' + PORT) return send(403, { err: '주소가 다릅니다' });   // 남의 이름으로 가장한 접근(DNS 바꿔치기) 막기
    if (!ORIGINS.includes(origin)) return send(403, { err: '계기판에서만 받습니다' });
    res.setHeader('access-control-allow-origin', origin); res.setHeader('vary', 'origin');
    res.setHeader('access-control-allow-methods', 'GET, POST'); res.setHeader('access-control-allow-headers', 'content-type');
    res.setHeader('access-control-allow-private-network', 'true');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && req.url === '/hello') return send(200, { app: 'plaudhub', v: HELPER_VERSION, mac: st.mac, paired: !!st.tok && !st.needPair });
    if (req.method === 'POST' && req.url === '/pair') {
      let body = ''; req.on('data', d => { body += d; if (body.length > 16384) req.destroy(); });
      req.on('end', async () => {
        let j; try { j = JSON.parse(body); } catch (_) { return send(400, { err: '내용을 읽지 못했습니다' }); }
        try { await onPair(j); send(200, { ok: true, mac: st.mac }); } catch (e) { send(400, { err: String(e.message || e) }); }
      });
      return;
    }
    send(404, { err: '없는 길' });
  });
}
async function pair(j) {
  const mac = PH.normMac(j && j.mac);
  if (!mac || !j.rt || !j.uid) throw new Error('이름 · 계정이 빠졌습니다');
  const r = await fetch(TOKEN_URL + '?key=' + API_KEY, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(j.rt) });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || t.user_id !== j.uid) throw new Error('열쇠를 확인하지 못했습니다');
  writeJson('token.json', { rt: j.rt, uid: j.uid }, true); writeJson('conf.json', { mac });
  st.tok = { rt: j.rt, uid: j.uid }; st.mac = mac; st.idTok = t.id_token; st.idExp = Date.now() + (+t.expires_in || 3600) * 1000;
  st.needPair = false; st.err = ''; st.lastReady = 0; st.lastList = 0; st.sentKey = '';
  log('연결됨', mac); setTimeout(tick, 200);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });
  try { const lp = path.join(DIR, 'helper.log'); if (fs.statSync(lp).size > 2e6) fs.truncateSync(lp, 0); } catch (_) { }
  for (let i = 0; ; i++) { try { await loadCore(); break; } catch (e) { log('판단 덩어리를 못 받음', String(e.message || e)); await new Promise(r => setTimeout(r, Math.min(300e3, 15e3 * (i + 1)))); } }
  const tok = readJson('token.json', null), conf = readJson('conf.json', {});
  if (tok && tok.rt && tok.uid && PH.normMac(conf.mac)) { st.tok = tok; st.mac = PH.normMac(conf.mac); }
  makeServer(pair).on('error', e => { log('연결 자리를 열지 못함', String(e.message || e)); }).listen(PORT, '127.0.0.1');
  log('도우미 시작', HELPER_VERSION, st.mac || '(연결 전)');
  await tick(); setInterval(tick, TICK_MS);
}
if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) main();
export function _setCore(ph) { PH = ph; }
export const _st = st;
