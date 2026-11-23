#!/usr/bin/env node
// 심방 녹음 Mac 도우미 (plaudhub) — Mac 을 켜면 launchd 가 저절로 돌린다(설치는 install.sh 한 줄).
//
// 하는 일:
//  · 2분마다 계정의 mac/{이 Mac 이름} 에 소식(켜짐 · 하는 일 · 준비 상태 ✓✗ · 깔린 모델 · 도우미 판)을 남긴다 — 전사 중에도 계속
//  · 10분마다 공식 PLAUD CLI 로 최근 녹음 목록을 읽어 rec/{녹음번호} 에 제목 · 시각 · 길이를 둔다(바뀐 줄만)
//  · 계정의 cmd 칸에서 이 Mac 몫 요청(설치 · 새로 받기 · 다시 읽기 · 모델 시험)을 받아 **정해 둔 명령만** 돌린다(INSTALLS · PIPE 표)
//  · (P3) 고른 녹음을 한 번에 하나씩 맡아(tryClaim · 5분마다 renew) 받기 → ffmpeg → whisper.cpp → 드라이브 'HB-심방-전사/녹음번호.txt'
//  · 127.0.0.1:47211 에서 block7.my 계기판의 '이 Mac 연결' 만 받는다(로그인 열쇠를 건네받음)
// 하지 않는 것: sudo · 비공식 PLAUD 도구 · 음성 주소(24시간 열쇠)를 명령 줄 · 기록 · 계정에 남기기 · 전사 글을 계정 · 기록에 두기.
//
// 판단(CLI 글 읽기 · 고르기 · 맡기 · 명령 표 · 값 바꾸기)은 계기판 index.html 의 <script id="plaudhub-core"> 한 곳 —
// 여기서는 그 파일을 받아 그 덩어리만 떼어(core.js) 쓴다. 두 벌로 두지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import vm from 'node:vm';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const HELPER_VERSION = 'h. 26-1123-3';
const HOME = os.homedir();
const DIR = process.env.PLAUDHUB_DIR || path.join(HOME, 'Library', 'Application Support', 'plaudhub');
const SITE = process.env.PLAUDHUB_SITE || 'https://block7.my/plaudhub/';
const PORT = +(process.env.PLAUDHUB_PORT || 47211);
// 계기판이 사는 곳만 연결을 받는다. 시험 · 개발용 주소는 환경 변수로만 더한다
const ORIGINS = ['https://block7.my'].concat(process.env.PLAUDHUB_DEV_ORIGIN ? [process.env.PLAUDHUB_DEV_ORIGIN] : []);
const API_KEY = 'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE';   // 공개 웹 설정값(앱들에 이미 있는 것) — 비밀 열쇠가 아니다
const TOKEN_URL = process.env.PLAUDHUB_TOKEN_URL || 'https://securetoken.googleapis.com/v1/token';
const FS_HOST = process.env.PLAUDHUB_FS_HOST || 'https://firestore.googleapis.com';
const BEAT_MS = 2 * 60e3, LIST_MS = 10 * 60e3, READY_MS = 10 * 60e3, FILE_CALLS = 40;
// 시험(plaud.e2e)만 줄여 쓴다 — 실제 Mac 은 기본값
const envMs = (k, d) => { const v = +process.env[k]; return v > 0 ? v : d; };
const TICK_MS = envMs('PLAUDHUB_TICK_MS', 30e3);       // 요청 · 소식 차례
const JOB_MS = envMs('PLAUDHUB_JOB_MS', 3 * 60e3);     // 쉬는 동안 맡을 일감을 보는 간격(읽기 횟수를 아끼려 3분)
const WORK = () => path.join(DIR, 'work'), TESTDIR = () => path.join(DIR, 'test');

// launchd 는 PATH 가 짧다 — Homebrew · 내 npm 폴더를 앞에. PLAUD CLI 의 사용 통계 · 새 판 알림은 끈다
// (시스템 폴더는 맨 뒤 — 물려받은 PATH 가 먼저. 시험의 가짜 ffmpeg · whisper-cli 가 시험 기계의 진짜에 가리지 않게)
process.env.PATH = [...new Set(['/opt/homebrew/bin', '/usr/local/bin', path.join(HOME, '.npm-global', 'bin')].concat(String(process.env.PATH || '').split(':').filter(Boolean), ['/usr/bin', '/bin', '/usr/sbin', '/sbin']))].join(':');
process.env.PLAUD_TELEMETRY_DISABLED = '1'; process.env.DO_NOT_TRACK = '1'; process.env.PLAUD_NO_UPDATE_NOTIFIER = '1';

let PH = null;   // 판단 덩어리
const st = { tok: null, idTok: '', idExp: 0, mac: '', skew: 0, doing: '쉼', ready: {}, models: [], err: '', warn: '', cli: '', lastBeat: 0, lastList: 0, lastReady: 0, lastJob: 0,
  busy: false, needPair: false, sentKey: '', job: null, recs: null, done: new Set(), key: '', disk: {}, lastSync: 0 };

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
  const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error, URL, crypto: globalThis.crypto, TextEncoder, TextDecoder, btoa, atob };   // crypto … = 잠근 사본(P3b)
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
// o.input = 표준 입력으로 넘길 글(음성 주소 — 명령 줄에 안 보이게) · o.job = 멈출 때 죽일 일감 · o.onErr = 오류 글 조각마다(전사 진행)
function run(cmd, args, ms, o) {
  o = o || {};
  return new Promise(res => {
    let out = '', err = '', done = false;
    let ch; try { ch = spawn(cmd, args, { env: process.env, cwd: HOME }); } catch (e) { return res({ code: -1, out: '', err: String(e.message || e) }); }
    if (o.job) o.job.child = ch;
    const tm = setTimeout(() => { if (!done) { try { ch.kill('SIGTERM'); } catch (_) { } } }, ms || 120e3);
    ch.stdout.on('data', d => { out += d; if (out.length > 4e6) out = out.slice(-4e6); });
    ch.stderr.on('data', d => { err += d; if (err.length > 2e5) err = err.slice(-2e5); if (o.onErr) try { o.onErr(String(d)); } catch (_) { } });
    ch.stdin.on('error', () => { });
    if (o.input != null) ch.stdin.end(o.input); else ch.stdin.end();
    const fin = r => { if (done) return; done = true; clearTimeout(tm); if (o.job && o.job.child === ch) o.job.child = null; res(r); };
    ch.on('error', e => fin({ code: -1, out, err: String(e.message || e) }));
    ch.on('close', code => fin({ code: code == null ? -1 : code, out, err }));
  });
}
// 전사 길의 명령은 core 의 PIPE 표로만 만든다(여기서 명령 글을 따로 쓰지 않는다)
const runP = (key, v, ms, o) => { const a = PH.pipeArgv(key, v); return run(a[0], a.slice(1), ms, o); };
const has = name => spawnSync('/usr/bin/which', [name], { env: process.env }).status === 0;
const home = s => String(s).replace(/^~(?=\/|$)/, HOME);

/* ---------- 준비 상태 ---------- */
function driveFolder() {
  const cs = path.join(HOME, 'Library', 'CloudStorage');
  let ds = []; try { ds = fs.readdirSync(cs).filter(n => n.startsWith('GoogleDrive-')); } catch (_) { }
  for (const d of ds) for (const my of ['My Drive', '내 드라이브']) { const p = path.join(cs, d, my, PH.DRIVE_DIR); try { if (fs.statSync(p).isDirectory()) return p; } catch (_) { } }
  return '';
}
function modelPath(m) { return path.join(DIR, 'models', m.file); }
function modelOk(m) { try { return fs.statSync(modelPath(m)).size > m.mb * 1e6 * 0.9; } catch (_) { return false; } }
const installedModels = () => PH.MODELS.filter(modelOk);
const whisperBin = () => PH.WHISPER_BINS.find(has) || '';
// 남은 공간(바이트). 시험은 PLAUDHUB_FAKE_FREE_FILE 의 숫자로 흉내 낸다
function freeBytes() {
  const f = process.env.PLAUDHUB_FAKE_FREE_FILE;
  if (f) { try { const v = +fs.readFileSync(f, 'utf8'); if (Number.isFinite(v)) return v; } catch (_) { } }
  try { const s = fs.statfsSync(DIR); return s.bavail * s.bsize; } catch (_) { return Infinity; }
}
function rmQuiet(...ps) { for (const p of ps) { try { fs.rmSync(p, { force: true, recursive: true }); } catch (_) { } } }
async function checkReady(settings) {
  const r = {};
  r.brew = fs.existsSync('/opt/homebrew/bin/brew') || fs.existsSync('/usr/local/bin/brew');
  r.node = +process.versions.node.split('.')[0] >= 20;
  r.ffmpeg = has('ffmpeg');
  r.whisper = !!whisperBin();
  r.model = modelOk(PH.modelOf(settings && settings.model));
  st.models = installedModels().map(m => m.id);
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
// 칸 안에서 조건 하나(field op value)로 찾기 — 읽기 횟수를 아끼려고(통째 목록 대신)
async function queryColl(coll, field, op, value) {
  const r = await fsCall('POST', docName() + ':runQuery', { structuredQuery: { from: [{ collectionId: coll }], where: { fieldFilter: { field: { fieldPath: field }, op, value: PH.fsEnc(value) } } } });
  if (!r.ok) throw new Error(coll + ' 찾기 ' + r.status);
  const out = {}; for (const x of Array.isArray(r.j) ? r.j : []) if (x && x.document) { const o = PH.fsDoc(x.document); out[o.id] = o; }
  return out;
}
// 문서 여럿을 한 번에(없는 것은 빠짐)
async function getMany(coll, ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 100) {
    const r = await fsCall('POST', DB() + ':batchGet', { documents: ids.slice(i, i + 100).map(id => docName(coll, id)) });
    if (!r.ok) throw new Error(coll + ' 읽기 ' + r.status);
    for (const x of Array.isArray(r.j) ? r.j : []) if (x && x.found) { const o = PH.fsDoc(x.found); out[o.id] = o; }
  }
  return out;
}
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
const doingNow = () => st.job ? PH.workLabel(st.job, Date.now()) : st.doing;
// 저장 공간(P3b): 남은 공간 · 깔린 모델 크기 · 일 폴더(임시 소리 · WAV)를 녹음별로 — 계기판 줄마다 · 합계 · 비우기
function diskNow() {
  const work = {};
  try { for (const f of fs.readdirSync(WORK())) { const k = f.split('.')[0]; if (!k) continue; let b = 0; try { b = fs.statSync(path.join(WORK(), f)).size; } catch (_) { } if (b > 0) work[k] = (work[k] || 0) + b; } } catch (_) { }
  let models = 0; for (const m of installedModels()) { try { models += fs.statSync(modelPath(m)).size; } catch (_) { } }
  const free = freeBytes();
  return { free: Number.isFinite(free) ? Math.round(free / 1e8) * 1e8 : -1, models, work };   // 소식이 1분마다 바뀌지 않게 남은 공간은 0.1GB 단위
}
async function beat(force) {
  const doing = doingNow(), err = [st.err, st.warn].filter(Boolean).join('\n'), disk = diskNow();
  const key = JSON.stringify([doing, st.ready, err, st.cli, st.models, disk.free, disk.models, Object.entries(disk.work).map(([k, b]) => k + Math.round(b / 1e6))]);
  if (!force && key === st.sentKey && Date.now() - st.lastBeat < BEAT_MS) return;
  if (!force && key !== st.sentKey && Date.now() - st.lastBeat < 50e3) return;   // 전사 중 'n분째' 는 1분에 한 번만
  const r = await commit([upd(['mac', st.mac], { doing, ready: st.ready, v: HELPER_VERSION, err: PH.clean(err, 300), cli: st.cli, models: st.models, disk }, { serverAt: true })]);
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
  // 계정의 녹음 줄은 기간 안(+하루)만 읽는다 — 통째로 읽으면 쌓인 옛 줄까지 10분마다 읽게 된다
  const from = serverNow() - s.days * 86400e3, old = await queryColl('rec', 'c', 'GREATER_THAN_OR_EQUAL', Math.floor(from - 86400e3)), plan = PH.recPlan(old, rows, from);
  const writes = plan.put.map(x => upd(['rec', x.id], x.v)).concat(plan.del.map(id => ({ delete: docName('rec', id) })));
  for (let i = 0; i < writes.length; i += 400) { const r = await commit(writes.slice(i, i + 400)); if (!r.ok) throw new Error('녹음 줄 쓰기 ' + r.status); }
  const now = {}; for (const id of Object.keys(old)) if (!plan.del.includes(id)) now[id] = old[id];
  for (const x of plan.put) now[x.id] = Object.assign({ id: x.id }, x.v);
  st.recs = now;   // 맡을 일감을 고를 때 쓴다(다시 읽지 않게)
  st.err = plan.held ? 'PLAUD 에서 녹음 ' + plan.held + '개가 한꺼번에 사라져 계정에서 지우지 않았습니다 — 확인해 주세요' : '';
  st.lastList = Date.now();
  log('목록', rows.length + '개 · 새로 씀 ' + plan.put.length + ' · 지움 ' + plan.del.length);
}
async function doCmds(settings) {
  // 새 요청만 찾는다(대개 0개 — 읽기 한 번)
  const cmds = Object.values(await queryColl('cmd', 'st', 'EQUAL', 'new')).filter(c => PH.cmdFor(c, st.mac, serverNow())).sort((a, b) => (a.at || 0) - (b.at || 0));
  for (const c of cmds) {
    const I = PH.INSTALLS[c.what];
    if (st.job && !PH.CMD_WHILE_BUSY.includes(c.what)) continue;   // 전사 · 시험 중에는 미룬다('기다림' 으로 남음)
    // 먼저 '하는 중' 으로 — 그 사이 같은 요청을 두 번 집지 않게(읽은 판 그대로일 때만)
    const took = await commit([upd(['cmd', c.id], { st: 'run' }, { pre: { updateTime: c._ut } })]); if (!took.ok) continue;
    if (c.what === 'mtest') { startTest(c, settings); continue; }   // 오래 걸린다 — 뒤에서 돌고, 끝나면 요청 칸에 적는다
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
  if (c.what === 'clean') {   // 비우기 — 전사 · 시험 중이면 먼저 멈추고(그 일감은 실패 '임시 파일을 비움' → 한 시간 뒤 다시) 일 폴더를 비운다
    const J = st.job; if (J) { stopJob(J, 'clean'); for (let i = 0; i < 60 && st.job === J; i++) await new Promise(r => setTimeout(r, 250)); }
    rmQuiet(WORK()); log('임시 파일 비움', J ? '(하던 ' + (J.kind === 'test' ? '모델 시험' : '전사') + ' 멈춤)' : '');
    return { ok: true, log: '' };
  }
  if (c.what === 'rmmodel') {   // 안 쓰는 모델 지우기 — 계정에서 고른 모델은 지우지 않는다(지우면 전사가 멈춤)
    if (!PH.canRemoveModel(c.arg, settings)) return { ok: false, log: '지금 쓰는 모델은 지울 수 없습니다' };
    const m = PH.MODELS.find(x => x.id === c.arg); rmQuiet(modelPath(m), modelPath(m) + '.part'); log('모델 지움', m.id);
    return { ok: true, log: '' };
  }
  if (c.what === 'refresh') { st.lastList = 0; await refreshList(settings); st.lastJob = 0; return { ok: !st.err, log: st.err }; }
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
    const r = await runP('model', { part, url: PH.modelUrl(m) }, 60 * 60e3);
    let sz = 0; try { sz = fs.statSync(part).size; } catch (_) { }
    if (r.code !== 0 || sz < m.mb * 1e6 * 0.9) { try { fs.unlinkSync(part); } catch (_) { } return { ok: false, log: '받지 못했습니다 (' + r.code + ')\n' + r.err }; }
    fs.renameSync(part, dst); return { ok: true, log: '' };
  }
  const argv = I.argv.map(home), r = await run(argv[0], argv.slice(1), (I.mins || 5) * 4 * 60e3);
  return { ok: r.code === 0, log: (r.err || '') + '\n' + (r.out || '').slice(-300) };
}

/* ---------- 받기 → 전사 → 드라이브 (P3) ----------
   한 Mac 은 한 번에 하나(st.job). 맡기(tryClaim)는 차례(tick) 안에서 짧게, 긴 일은 뒤에서 돌고 차례는 그대로 2분 소식 · 요청을 이어 간다.
   ⚠️ 기록(log)에는 녹음 번호 · 걸린 시간 · 짧은 까닭만 — 제목 · 전사 글 · 음성 주소는 남기지 않는다. */
class Fail extends Error { }
const RENEW_MS = () => envMs('PLAUDHUB_RENEW_MS', PH.RENEW_MS);

// 맡은 시각을 새로 찍는다 — 잃었거나(다른 Mac 이 이어받음) HB 가 뺐으면 곧바로 멈춘다. 새로 찍지 못한 채 맡김이 풀릴 때가 다가오면 스스로 멈춘다
async function keep(J) {
  for (let i = 0; i < 3 && !J.stop; i++) {
    try {
      const r = await PH.renew(jobIO, J.id, st.mac, J.step);
      if (r.ok) { J.okAt = Date.now(); return true; }
      if (r.why) { stopJob(J, r.why); return false; }
    } catch (e) { log('맡김 새로 찍기 실패', J.id, String(e.message || e)); break; }
  }
  if (!J.stop && Date.now() - J.okAt > PH.LEASE_MS - 2 * RENEW_MS()) stopJob(J, 'lost');
  return false;
}
function stopJob(J, why) { if (J.stop) return; J.stop = why; if (J.child) { try { J.child.kill('SIGTERM'); } catch (_) { } } }
const alive = J => { if (J.stop) throw new Error('멈춤'); };
async function setStep(J, step) { J.step = step; J.pct = null; if (!(await keep(J))) { if (!J.stop) stopJob(J, 'lost'); } alive(J); beat(true).catch(() => { }); }

// 음성 받기: plaud audio → 24시간 주소(글에서만 읽고 버림) → curl 이 표준 입력으로 받아 ogg 로
async function fetchAudio(J, ogg, durSec) {
  const a = await runP('audio', { id: J.id }, 90e3, { job: J }); alive(J);
  if (a.code === 2) throw new Fail('PLAUD 로그인이 풀림');
  if (a.code !== 0) throw new Fail('음성 주소를 받지 못함 (끝 번호 ' + a.code + ')');
  const u = PH.parseAudioUrl(a.out); if (!u.ok) throw new Fail(u.err);
  const c = await runP('get', { ogg }, Math.max(30 * 60e3, (+durSec || 0) * 1000), { job: J, input: PH.curlConf(u.url) }); alive(J);
  if (c.code !== 0) throw new Fail('소리를 받지 못함 (curl ' + c.code + ')');
  let sz = 0; try { sz = fs.statSync(ogg).size; } catch (_) { }
  if (sz < 1000) throw new Fail('받은 소리 파일이 비었음');
}
async function toWav(J, key, v) {
  const r = await runP(key, v, 60 * 60e3, { job: J }); alive(J);
  if (r.code !== 0) throw new Fail('소리 바꾸기 실패 (ffmpeg ' + r.code + ')');
  let sz = 0; try { sz = fs.statSync(v.wav).size; } catch (_) { }
  if (sz < 1000) throw new Fail('바꾼 소리 파일이 비었음');
  return Math.max(1, Math.round((sz - 44) / 32000));   // 16kHz 모노 16비트 = 1초 32000바이트
}
async function stt(J, m, wav, outBase, secs) {
  const bin = whisperBin(); if (!bin) throw new Fail('whisper.cpp 가 없음');
  J.pct = null;
  const r = await runP('stt', { bin, model: modelPath(m), wav, out: outBase }, Math.max(60 * 60e3, secs * 2000 + 30 * 60e3),
    { job: J, onErr: s => { const p = PH.parseProgress(s); if (p != null) J.pct = p; } }); alive(J);
  if (r.code !== 0) throw new Fail('전사 실패 (whisper ' + r.code + ')');
  let text = ''; try { text = fs.readFileSync(outBase + '.txt', 'utf8'); } catch (_) { }
  text = PH.cleanText(text); if (!text) throw new Fail('전사 글이 비었음');
  return text;
}

// 맡을 일감 찾기 — 쉬는 동안 JOB_MS 마다. 고른 녹음 중 오래된 것부터, 맡으면 뒤에서 돌린다
/* ---------- 드라이브 폴더 (P3b — 이름 = PLAUD 제목, 같은 녹음인지는 머리말 첫 줄의 녹음 ID) ---------- */
// { 녹음번호: 파일 이름 } — 폴더의 txt 머리를 읽는다(작은 글이라 매번 훑어도 가볍다). 숨은 · 임시 파일은 뺀다
function driveIndex(drive) {
  const idx = {}, names = new Set(), hdr = new Set();
  let fl = []; try { fl = fs.readdirSync(drive); } catch (_) { return { idx, names, hdr }; }
  for (const f of fl) {
    names.add(f.toLowerCase());
    if (f.startsWith('.') || !f.toLowerCase().endsWith('.txt')) continue;
    let head = ''; try { const fd = fs.openSync(path.join(drive, f), 'r'), b = Buffer.alloc(160); const n = fs.readSync(fd, b, 0, 160, 0); fs.closeSync(fd); head = b.slice(0, n).toString('utf8'); } catch (_) { }
    const id = PH.idFromTxt(f, head); if (id && !idx[id]) { idx[id] = f; if (head.startsWith('PLAUD 녹음 ID: ' + id)) hdr.add(id); }
  }
  return { idx, names, hdr };   // hdr = 머리말에 녹음 ID 가 있는 것(이름을 바꿔도 같은 녹음인 줄 앎)
}
// 다 쓴 일 폴더 파일을 드라이브로 한 번에 옮김(반쯤 쓴 파일이 동기화되지 않게) — 같은 이름이 있으면 ' (2)'
function placeTxt(drive, part, rec, id) {
  const { names } = driveIndex(drive), name = PH.uniqueName(PH.txtBase(Object.assign({ id }, rec)), names), final = path.join(drive, name);
  try { fs.renameSync(part, final); }
  catch (e) { if (e.code !== 'EXDEV') throw e; const tmp = path.join(drive, '.' + id + '.txt.part'); fs.copyFileSync(part, tmp); fs.renameSync(tmp, final); }
  return name;
}
// 잠근 사본 올리기(폰 · 패드에서 복사 · 받기) — 키가 이 Mac 에 있을 때만. 글은 잠근 채로만 나간다
const upDone = () => new Set(readJson('uploaded.json', []));
async function uploadTxt(id, body) {
  if (!st.key) return false;
  const e = await PH.encText(st.key, body);
  if (e.c.length > PH.TXT_MAX) { log('잠근 사본이 너무 커 올리지 않음', id); return false; }
  const r = await commit([upd(['txt', id], { c: e.c, iv: e.iv, v: 1 })]);
  if (!r.ok) { log('잠근 사본 올리기 실패', id, r.status); return false; }
  const u = upDone(); u.add(id); writeJson('uploaded.json', [...u].slice(-2000));
  return true;
}
// 쉬는 동안: PLAUD 제목이 바뀐 · P3 때 이름(f_….txt)인 파일 이름 고치기 + 잠근 사본이 없는 것 올리기(한 번에 몇 개씩)
async function syncDrive(drive) {
  st.lastSync = Date.now();
  if (!drive || !st.recs) return;
  const { idx, names, hdr } = driveIndex(drive), up = st.key ? upDone() : null; let renamed = 0, sent = 0;
  for (const id of Object.keys(idx)) {
    const rec = st.recs[id]; if (!rec) continue;   // 목록 기간 밖 · 모르는 녹음은 그대로
    const base = PH.txtBase(Object.assign({ id }, rec)), cur = idx[id];
    // 머리말에 녹음 ID 가 없는 파일(이름만 f_….txt)은 이름을 바꾸면 어느 녹음인지 잃는다 → 그대로 둔다
    if (hdr.has(id) && !PH.nameFits(cur, base) && renamed < 20) {
      names.delete(cur.toLowerCase()); const to = PH.uniqueName(base, names);
      try { fs.renameSync(path.join(drive, cur), path.join(drive, to)); names.add(to.toLowerCase()); idx[id] = to; renamed++; } catch (_) { names.add(cur.toLowerCase()); }
    }
    if (up && !up.has(id) && sent < 5) {
      let body = ''; try { body = PH.txtBody(fs.readFileSync(path.join(drive, idx[id]), 'utf8')); } catch (_) { continue; }
      if (body.trim() && await uploadTxt(id, body)) sent++;
    }
  }
  if (renamed || sent) log('드라이브 정리', '이름 ' + renamed + ' · 잠근 사본 ' + sent);
}

// 맡을 일감 찾기 — 쉬는 동안 JOB_MS 마다. 고른 녹음 중 오래된 것부터, 맡으면 뒤에서 돌린다
async function pickWork(settings) {
  st.lastJob = Date.now();
  const drive = driveFolder(); st.ready.drive = !!drive;
  if (drive) await syncDrive(drive).catch(e => log('드라이브 정리 실패', String(e.message || e)));
  if (!PH.autoOn(settings, st.mac)) { if (st.warn) { st.warn = ''; await beat(true).catch(() => { }); } return; }   // 이 Mac 은 자동 전사 꺼짐(HB)
  if (PH.workBlock(st.ready).length || !st.recs) return;
  const s = PH.settingsOf(settings), m = PH.modelOf(s.model); if (!modelOk(m)) { st.ready.model = false; return; }
  const ids = Object.keys(st.recs).filter(id => !st.done.has(id));
  if (!ids.length) return;
  const jobs = await getMany('job', ids);
  for (const id of Object.keys(jobs)) if (jobs[id].st === 'done') st.done.add(id);
  const want = PH.wantedJobs(st.recs, jobs, s, st.mac, serverNow());
  if (!want.length) { if (st.warn) { st.warn = ''; await beat(true).catch(() => { }); } return; }
  for (const id of want) {
    const rec = st.recs[id] || {}, sp = PH.spaceCheck(freeBytes(), rec.d);
    if (!sp.ok) { const w = PH.spaceMsg(sp); if (w !== st.warn) { st.warn = w; log('공간 모자람 — 맡지 않음', id); await beat(true).catch(() => { }); } return; }
    if (st.warn) st.warn = '';
    const c = await PH.tryClaim(jobIO, id, st.mac);
    if (!c.ok) { if (c.why === 'done') st.done.add(id); continue; }
    const J = st.job = { kind: 'job', id, step: 'get', t0: Date.now(), okAt: Date.now(), pct: null, child: null, stop: '' };
    log('맡음', id, c.how === 'expired' ? '(꺼진 ' + (c.from || '다른') + ' Mac 에게서 이어받음)' : '');
    await beat(true).catch(() => { });
    workOne(J, rec, m, drive).catch(e => log('일감 오류', id, String(e.message || e))).finally(() => { st.job = null; st.lastJob = 0; beat(true).catch(() => { }); });
    return;
  }
}
const STOP_WHY = { out: '목록에서 뺌', clean: '임시 파일을 비움' };
async function workOne(J, rec, m, drive) {
  const w = WORK(), ogg = path.join(w, J.id + '.ogg'), wav = path.join(w, J.id + '.wav'), out = path.join(w, J.id + '.whisper'), part = path.join(w, J.id + '.txt.part');
  const timer = setInterval(() => { keep(J); }, RENEW_MS());
  const already = () => driveIndex(drive).idx[J.id];
  try {
    fs.mkdirSync(w, { recursive: true });
    // 겹 둘: 드라이브에 이 녹음 ID 의 파일이 이미 있으면 만들지 않는다(다른 Mac 이 먼저 했음)
    if (already()) { await PH.finish(jobIO, J.id, st.mac, true); st.done.add(J.id); log('이미 드라이브에 있음 — 만들지 않음', J.id); return; }
    await fetchAudio(J, ogg, rec.d);
    await setStep(J, 'stt');
    const secs = await toWav(J, 'wav', { ogg, wav }); rmQuiet(ogg);
    const text = await stt(J, m, wav, out, secs); rmQuiet(wav);
    await setStep(J, 'drive');   // 쓰기 바로 앞에 맡김을 새로 확인(잃었으면 여기서 멈춤)
    if (already()) { await PH.finish(jobIO, J.id, st.mac, true); st.done.add(J.id); log('이미 드라이브에 있음 — 만들지 않음', J.id); return; }
    const content = PH.txtOf({ id: J.id, n: rec.n, t: rec.t, d: rec.d, model: m.id, mac: st.mac, at: serverNow() }, text);
    fs.writeFileSync(part, content);
    placeTxt(drive, part, rec, J.id);
    await uploadTxt(J.id, PH.txtBody(content)).catch(e => log('잠근 사본 오류', J.id, String(e.message || e)));
    const f = await PH.finish(jobIO, J.id, st.mac, true); st.done.add(J.id);
    log('전사 끝', J.id, Math.round((Date.now() - J.t0) / 60e3) + '분 걸림', f.ok ? '' : '(끝 표시는 못 함 — 드라이브 파일이 있어 다시 하지 않음)');
  } catch (e) {
    if (J.stop === 'lost') { log('맡김을 잃어 멈춤 — 다른 Mac 이 이어 함', J.id); return; }
    const why = STOP_WHY[J.stop] || (e instanceof Fail ? e.message : '도우미 오류');
    if (!(e instanceof Fail) && !J.stop) log('도우미 오류', J.id, String(e && e.message || e));
    await PH.finish(jobIO, J.id, st.mac, false, PH.clean(why, 120)).catch(() => { });
    log('전사 실패', J.id, PH.clean(why, 120));
  } finally {
    clearInterval(timer); stopJob(J, J.stop || 'end');
    rmQuiet(ogg, wav, out + '.txt', part);   // 받은 소리 · WAV · 중간 글은 끝나면 지운다(디스크)
  }
}

// 모델 시험: 앞 10분을 깔린 모델마다. 글은 이 Mac 의 test 폴더에만, 계정에는 걸린 시간 · 빠르기만(mac.test)
function startTest(c, settings) {
  const J = st.job = { kind: 'test', id: c.arg, step: 'get', t0: Date.now(), pct: null, child: null, stop: '', k: 0, of: 0, model: '' };
  beat(true).catch(() => { });
  (async () => {
    let res;
    try { res = await modelTest(J); } catch (e) { res = { ok: false, log: STOP_WHY[J.stop] || (e instanceof Fail ? e.message : '도우미 오류') }; if (!(e instanceof Fail) && !J.stop) log('모델 시험 오류', String(e && e.message || e)); }
    await commit([upd(['cmd', c.id], { st: res.ok ? 'ok' : 'fail', log: PH.clean(res.log, 600) })]).catch(() => { });
    log('모델 시험', res.ok ? '됨' : '실패 ' + PH.clean(res.log, 120));
  })().finally(() => { st.job = null; st.lastJob = Date.now(); beat(true).catch(() => { }); });
}
async function modelTest(J) {
  const w = WORK(), ogg = path.join(w, 'test.ogg'), wav = path.join(w, 'test.wav'), out = path.join(w, 'test.whisper');
  try {
    fs.mkdirSync(w, { recursive: true }); fs.mkdirSync(TESTDIR(), { recursive: true });
    const ms = installedModels(); if (!ms.length) throw new Fail('깔린 모델이 없음 — 먼저 설치해 주세요');
    const sp = PH.spaceCheck(freeBytes(), PH.TEST_SEC); if (!sp.ok) throw new Fail(PH.spaceMsg(sp).split('\n')[0]);
    await fetchAudio(J, ogg, PH.TEST_SEC);
    const len = await toWav(J, 'cut', { ogg, wav, sec: PH.TEST_SEC }); rmQuiet(ogg);
    const r = {}; J.of = ms.length;
    for (const m of ms) {
      J.k++; J.model = m.label; J.step = 'stt';
      const t0 = Date.now(), text = await stt(J, m, wav, out, len), s = Math.max(1, Math.round((Date.now() - t0) / 1000));
      r[m.id] = { s, x: Math.round(len / s * 10) / 10 };
      fs.writeFileSync(path.join(TESTDIR(), m.id + '.txt'), '모델 시험 — ' + m.label + ' (' + m.id + ')\n녹음 ' + J.id + ' 앞 ' + PH.durLabel(len) + ' · ' + PH.durLabel(s) + ' 걸림 · ' + PH.perMinLabel(r[m.id].x) + '\n---\n\n' + text + '\n');
      rmQuiet(out + '.txt');
    }
    const w2 = await commit([upd(['mac', st.mac], { test: { at: serverNow(), len, r } }, { serverAt: true })]);
    if (!w2.ok) throw new Fail('결과를 계정에 적지 못함 ' + w2.status);
    return { ok: true, log: '' };
  } finally { rmQuiet(ogg, wav, out + '.txt'); }
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
    if (!st.job && Date.now() - st.lastJob > JOB_MS) await pickWork(settings);
  } catch (e) { log('차례 실패', String(e.message || e)); }
  finally { st.busy = false; }
}

/* ---------- 이 Mac 연결 (127.0.0.1 · block7.my 에서 온 것만) ---------- */
export function makeServer(onPair, onKey) {
  return http.createServer((req, res) => {
    const origin = req.headers.origin || '', host = String(req.headers.host || '');
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
    if (host !== '127.0.0.1:' + PORT && host !== 'localhost:' + PORT) return send(403, { err: '주소가 다릅니다' });   // 남의 이름으로 가장한 접근(DNS 바꿔치기) 막기
    if (!ORIGINS.includes(origin)) return send(403, { err: '계기판에서만 받습니다' });
    res.setHeader('access-control-allow-origin', origin); res.setHeader('vary', 'origin');
    res.setHeader('access-control-allow-methods', 'GET, POST'); res.setHeader('access-control-allow-headers', 'content-type');
    res.setHeader('access-control-allow-private-network', 'true');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && req.url === '/hello') return send(200, { app: 'plaudhub', v: HELPER_VERSION, mac: st.mac, paired: !!st.tok && !st.needPair, hasKey: !!st.key });
    if (req.method === 'POST' && (req.url === '/pair' || (req.url === '/key' && onKey))) {
      const fn = req.url === '/key' ? onKey : onPair;
      let body = ''; req.on('data', d => { body += d; if (body.length > 16384) req.destroy(); });
      req.on('end', async () => {
        let j; try { j = JSON.parse(body); } catch (_) { return send(400, { err: '내용을 읽지 못했습니다' }); }
        try { await fn(j); send(200, { ok: true, mac: st.mac }); } catch (e) { send(400, { err: String(e.message || e) }); }
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

// 잠근 사본 키 받기(P3b) — 이 Mac 크롬 계기판이 넘김. 계정 설정의 표지로 맞는 키인지 본 뒤에만 둔다(600)
async function takeKey(j) {
  if (!st.tok) throw new Error('먼저 이 Mac 을 연결해 주세요');
  const k = String(j && j.k || ''), doc = await getDoc().catch(() => null);
  if (!doc || !doc.kdf) throw new Error('계정에 암호가 아직 없습니다');
  if (!(await PH.checkKey(k, doc.kdf))) throw new Error('암호가 맞지 않습니다');
  writeJson('key.json', { k }, true); st.key = k; st.lastSync = 0; log('잠금 키 받음');
  setTimeout(tick, 200);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });
  try { const lp = path.join(DIR, 'helper.log'); if (fs.statSync(lp).size > 2e6) fs.truncateSync(lp, 0); } catch (_) { }
  rmQuiet(WORK());   // 지난번에 멈춘 일의 소리 · WAV 가 남았으면 치운다(맡은 일감은 다시 집으면 처음부터)
  for (let i = 0; ; i++) { try { await loadCore(); break; } catch (e) { log('판단 덩어리를 못 받음', String(e.message || e)); await new Promise(r => setTimeout(r, Math.min(300e3, 15e3 * (i + 1)))); } }
  const tok = readJson('token.json', null), conf = readJson('conf.json', {});
  if (tok && tok.rt && tok.uid && PH.normMac(conf.mac)) { st.tok = tok; st.mac = PH.normMac(conf.mac); }
  st.key = (readJson('key.json', {}) || {}).k || '';
  makeServer(pair, takeKey).on('error', e => { log('연결 자리를 열지 못함', String(e.message || e)); }).listen(PORT, '127.0.0.1');
  log('도우미 시작', HELPER_VERSION, st.mac || '(연결 전)');
  await tick(); setInterval(tick, TICK_MS);
}
if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) main();
export function _setCore(ph) { PH = ph; }
export const _st = st;
