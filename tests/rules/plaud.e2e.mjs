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
// ⑭ (P3) 맡김을 잃으면 바로 멈춤: 전사 중 다른 Mac 이 맡은 것으로 바꾸면 whisper 를 멈추고 txt 를 쓰지 않음 → 풀린 뒤 이어 함 · txt 하나.
// (P3b) 파일 이름 = PLAUD 제목('YY-MMDD HH;MM 글') · 옛 f_….txt 를 새 이름으로 · PLAUD 에서 제목을 고치면 이름도 따라감 · Mac 마다 자동 전사(계기판 스위치)
//   · 잠근 사본(계기판에서 암호 정하기 → 이 Mac 도우미에 저절로 · 틀린 키 거절 → 복사 · 받기 = 드라이브 본문) · 안 쓰는 모델 지우기 · ⑮ 임시 파일 크기(줄 · 합계) → 비우기.
// ⑰ (P3d) 구글 드라이브 '온라인 전용'(내용을 못 읽음) — 이름으로 찾아 잘못된 '드라이브에 없음' 을 되돌리고 · 옛 녹음번호.txt 를 새 이름으로 · 새로 '없음' 으로 적지 않음
// ⑱ (P3e) PLAUD 전사문 — 있으면 whisper 대신 가져와 'p' 이름 · P 알약 · 없으면 녹음 뒤 6시간 기다림 → [지금] 이면 whisper · whisper 로 만든 것에 PLAUD 전사가 생기면 바꿈 · 되풀이 전사는 W 빨강
// ⑲ (P4) AI 초안 — 가짜 OpenAI: 틀린 열쇠 거절 · 열쇠는 그 Mac 에만(600) · 키워드 녹음은 저절로 · 규격에 걸리면 한 번 더 · 잠근 초안만 계정에 · 기록에 글 · 열쇠 없음
//        · 계기판 초안 판 · 고칠 점 → 다시 만들기 · [승인] → 가짜 시트 'AI 입력대기' 한 줄(같은 녹음 두 번 안 넣음) · 지침 고치기 · 한도 실패 · 이 Mac 에 열쇠 넣기(화면)
// ㉑ (P4e) 모델 두 칸 · 요금 · 키워드 두 갈래 — 모델을 안 고르면 초안 안 만듦(까닭 · OpenAI 안 부름) → 메뉴에서 고르면 다시 집음 · 첫 초안 = auto · 다시 만들기 = big
//        · 가짜 usage 가 이번 달 use 문서에 더해짐(동시에 열두 번 더해도 맞음) · 맨 위 금액 줄(단가 없으면 메뉴로 → 단가 · 환율 → 원 · 달러) · 사용량 판
//        · 전사까지만 키워드 녹음은 전사만(dr 없음) · 같은 말을 양쪽에 넣으면 알림 · 규칙 옛 판 흉내(소식은 새 칸 빼고 다시 적고 Mac 카드에 알림 · 초안은 그대로)
// ⑯ (P3c) 접는 Mac 카드 · 탭 · 버전 단추 · 목록 읽은 때 · 드라이브에서 지운 것 알아채기 → 다시 전사 · txt 지우기(뺌, 다시 안 함) · 보기 판 · 모두 지금 시작. 이름은 모두 지어낸 것.
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import vm from 'vm';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..', '..');
const FS = 'http://127.0.0.1:8089', AUTH = 'http://127.0.0.1:9099', PROJECT = 'block7-8f24e', SITE_PORT = 8766, AI_PORT = 8767;
let n = 0, bad = 0; const ok = (name, c, extra) => { n++; if (c) console.log('  ✓', name); else { bad++; console.log('  ✗', name, extra === undefined ? '' : JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (f, ms = 20000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await f().catch(() => null); if (v) return v; await sleep(250); } return null; };

// 규칙: 이 프로젝트 이름(block7-8f24e)에 plaud 덩어리를 싣는다
// (P4) 계기판 [승인] 이 심방 노트 설정(users/{uid}/data/care)을 읽는다 — 실제 프로젝트에는 BLOCK7 규칙이 이미 열어 둔 자리. 시험에만 읽기 한 줄을 더한다
{ const RULES = fs.readFileSync(path.join(HERE, 'plaud.rules'), 'utf8').replace('match /databases/{database}/documents {', 'match /databases/{database}/documents {\n    match /users/{uid}/data/care { allow read: if request.auth != null && request.auth.uid == uid; }');
  const r = await fetch(FS + '/emulator/v1/projects/' + PROJECT + ':securityRules', { method: 'PUT', body: JSON.stringify({ rules: { files: [{ content: RULES }] } }) });
  if (!r.ok) { console.log('규칙을 싣지 못함', r.status, await r.text()); process.exit(1); } }
// 계정 (지어낸 이메일)
const sign = async em => (await (await fetch(AUTH + '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: em, password: 'secret12', returnSecureToken: true }) })).json());
const hb = await sign('hb@example.com'), other = await sign('zz@example.com');
const UID = hb.localId;
// 관리자(규칙 없이) 읽기
const DOCS = FS + '/v1/projects/' + PROJECT + '/databases/(default)/documents';
const PH = (() => { const html = fs.readFileSync(path.join(ROOT, 'plaudhub', 'index.html'), 'utf8'), code = /<script id="plaudhub-core">([\s\S]*?)<\/script>/.exec(html)[1];
  const c = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error, crypto: globalThis.crypto, TextEncoder, TextDecoder, btoa, atob }; vm.createContext(c); vm.runInContext(code + ';this.__PH=PH', c); return c.__PH; })();
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
// (P4) 가짜 OpenAI — 열쇠 확인 · 모델 목록 · 초안(처음 한 번은 규격에 걸리는 답 → 도우미가 까닭을 붙여 다시) · AIQ 면 한도 오류
const AI_KEY = 'sk-test-' + 'x'.repeat(40), AIQ = { calls: [], badOnce: true, quota: false };
const aiSrv = http.createServer((q, s) => {
  let b = ''; q.on('data', d => b += d); q.on('end', () => {
    const send = (code, o) => { s.writeHead(code, { 'content-type': 'application/json' }); s.end(JSON.stringify(o)); };
    if (q.headers.authorization !== 'Bearer ' + AI_KEY) return send(401, { error: { code: 'invalid_api_key' } });
    if (q.method === 'GET' && q.url === '/v1/models') return send(200, { data: ['gpt-9', 'gpt-9-mini', 'text-embedding-9', 'gpt-9-audio-preview', 'gpt-9-2026-01-01'].map(id => ({ id })) });
    if (q.method !== 'POST' || q.url !== '/v1/chat/completions') return send(404, {});
    const j = JSON.parse(b); AIQ.calls.push(j);
    if (AIQ.quota) return send(429, { error: { code: 'insufficient_quota' } });
    const user = j.messages[1].content, id = (/녹음 ID: (\S+)/.exec(user) || [])[1], fb = j.messages.length >= 4 && j.messages[j.messages.length - 1].role === 'user' && /고칠 점/.test(j.messages[j.messages.length - 1].content) ? j.messages[j.messages.length - 1].content.split('\n').slice(1).join(' ') : '';
    const pr = AIQ.badOnce ? '높음' : '일반'; AIQ.badOnce = false;
    const packet = { schema_version: 'hb-care.v1', event: { kind: 'visit', date: '2026-11-22', title: '지어낸 심방', group_summary: '', details_markdown: '', location: null },
      records: [{ person_name: '김하늘', person_confirmed: true, speaker_label: null, category: null, contact_method: '만남', depth: '중간', summary_line: '지어낸 한줄 ' + id, brief_note: '지어낸 내용', detailed_note_markdown: '### 사실\n지어냄', priority: pr, long_term_watch: '', information_basis: '직접', tags: [], next_questions: ['지어낸 질문'], actions: [] }],
      unknown_speakers: [], mentioned_people: [], import_notes: '' };
    send(200, { usage: { prompt_tokens: 1000, completion_tokens: 200, prompt_tokens_details: { cached_tokens: 0 } }, choices: [{ message: { role: 'assistant', content: JSON.stringify({ draft_markdown: '① 핵심 한줄 — 지어낸 초안 ' + id + (fb ? '\n고침: ' + fb : ''), packet }) } }] });
  });
}).listen(AI_PORT, '127.0.0.1');

// 가짜 PLAUD CLI — 공식 CLI 0.3.15 가 터미널이 아닐 때 내놓는 글과 같은 꼴
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plaud-e2e-')), bin = path.join(tmp, 'bin'), tools = path.join(tmp, 'tools'); fs.mkdirSync(bin); fs.mkdirSync(tools);
const ID = c => 'f_' + String(c).repeat(32).slice(0, 32);
const A_TITLE = '2026-11-22 15:05:00 김하늘 집사 심방';   // PLAUD 기본 제목(날짜 · 시각) 뒤에 HB 가 덧붙인 글
const REC = [[ID('a'), A_TITLE, '2026-11-22T06:05:00', '48m00s'], [ID('b'), '박소망 성도 전화심방', '2026-11-21T01:00:00', '12m03s'], [ID('c'), '', '2026-11-20T23:30:00', '6s'],
  [ID('e'), '', '2026-11-19T02:00:00', '30m00s'], [ID('f'), '', '2026-11-18T02:00:00', '20m00s'], [ID('g'), '', '2026-11-17T02:00:00', '15m00s']];
const NAME = { a: '26-1122 15;05 김하늘 집사 심방.txt', b: '26-1121 10;00 박소망 성도 전화심방.txt', c: '26-1121 08;30.txt', e: '26-1119 11;00.txt', f: '26-1118 11;00.txt' };
const RECF = path.join(tmp, 'rec.json'); fs.writeFileSync(RECF, JSON.stringify(REC));
fs.writeFileSync(path.join(tmp, 'mode'), 'ok'); fs.writeFileSync(path.join(tmp, 'wmode'), '300');
fs.writeFileSync(path.join(bin, 'plaud'), `#!/usr/bin/env node
const fs = require('fs'), mode = fs.readFileSync(${JSON.stringify(path.join(tmp, 'mode'))}, 'utf8').trim(), REC = JSON.parse(fs.readFileSync(${JSON.stringify(RECF)}, 'utf8')), a = process.argv.slice(2);
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
  console.log('  duration:     ' + r[3]); console.log('  serial_number: 8810'); console.log('  audio:        unknown (run \`plaud audio\` to check)'); console.log('  transcript:   ' + (r[4] ? 'available' : 'unavailable')); console.log('  summary:      unavailable'); console.log(); process.exit(0); }
if (a[0] === 'transcript') { const r = REC.find(x => x[0] === a[1]); if (!r) process.exit(1);
  if (!r[4]) { console.log('No "transaction" transcript for this recording. Available: (none).'); process.exit(0); }
  fs.writeFileSync(a[a.indexOf('-o') + 1], r[4], 'utf-8'); console.log('Transcript saved to ' + a[a.indexOf('-o') + 1]); process.exit(0); }
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
setTimeout(() => { clearInterval(iv); let wt = ''; try { wt = fs.readFileSync(${JSON.stringify(path.join(tmp, 'wtext'))}, 'utf8'); } catch (_) { }
  fs.writeFileSync(out + '.txt', wt || (' 안녕하세요 목사님.\\n 지어낸 전사 글입니다 ' + path.basename(wav) + '\\n'));
  fs.appendFileSync(LOG, tag + ' end ' + Date.now() + '\\n'); process.exit(0); }, ms);
`, { mode: 0o755 });

// 두 Mac 이 함께 보는 드라이브(구글 드라이브 앱이 맞춰 주는 것을 같은 폴더로 흉내) — 처음엔 'HB-심방-전사' 폴더가 없다
const driveRoot = path.join(tmp, 'drive'); fs.mkdirSync(driveRoot);
const DRIVE = path.join(driveRoot, PH.DRIVE_DIR);

// 도우미 셋(집 · 사무실 · 서재) — 따로 폴더 · 따로 연결 자리. 집 · 사무실만 ffmpeg · whisper-cli · 모델 · 드라이브가 있다
const kids = [];
const startHelper = (name, port, o = {}) => {
  const dir = path.join(tmp, name); fs.mkdirSync(dir, { recursive: true });
  if (o.drive) { const cs = path.join(dir, 'Library', 'CloudStorage', 'GoogleDrive-hb@example.com'); fs.mkdirSync(cs, { recursive: true }); if (!fs.existsSync(path.join(cs, o.drive))) fs.symlinkSync(driveRoot, path.join(cs, o.drive)); }
  for (const id of o.models || []) { const m = PH.MODELS.find(x => x.id === id), md = path.join(dir, 'models'); fs.mkdirSync(md, { recursive: true });
    const fd = fs.openSync(path.join(md, m.file), 'w'); fs.ftruncateSync(fd, m.mb * 1e6); fs.closeSync(fd); }   // 빈 큰 파일(실제 공간은 안 씀)
  const env = Object.assign({}, process.env, { PATH: bin + (o.tools ? ':' + tools : '') + ':' + process.env.PATH, PLAUDHUB_DIR: dir, PLAUDHUB_PORT: String(port), PLAUDHUB_SITE: 'http://127.0.0.1:' + SITE_PORT + '/plaudhub/',
    PLAUDHUB_TOKEN_URL: AUTH + '/securetoken.googleapis.com/v1/token', PLAUDHUB_FS_HOST: FS, PLAUDHUB_DEV_ORIGIN: 'http://127.0.0.1:8765', HOME: dir,
    PLAUDHUB_TICK_MS: '1000', PLAUDHUB_EVICT: o.evict || '', PLAUDHUB_JOB_MS: '1500', PLAUDHUB_RENEW_MS: '2000', PLAUDHUB_FAKE_FREE_FILE: path.join(dir, 'fakefree'), PLAUDHUB_OPENAI_URL: 'http://127.0.0.1:' + AI_PORT + '/v1', PLAUDHUB_DRAFT_MS: '1500', no_proxy: '127.0.0.1,localhost', NO_PROXY: '127.0.0.1,localhost' });
  const ch = spawn(process.execPath, [path.join(ROOT, 'plaudhub', 'helper.mjs')], { env, detached: true }); let logs = '';
  ch.stdout.on('data', d => logs += d); ch.stderr.on('data', d => logs += d); kids.push(ch);
  return { dir, port, name, ch, log: () => logs, free: v => fs.writeFileSync(path.join(dir, 'fakefree'), String(v)) };
};
const killGroup = ch => { try { process.kill(-ch.pid, 'SIGKILL'); } catch (_) { } };
const pairAt = (port, body, origin = 'http://127.0.0.1:8765') => fetch('http://127.0.0.1:' + port + '/pair', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ code: r.status, j: await r.json().catch(() => ({})) }));
const lines = f => { try { return fs.readFileSync(path.join(tmp, f), 'utf8').split('\n').filter(Boolean); } catch (_) { return []; } };
const wStarts = id => lines('wcalls').filter(l => l.includes(' ' + id + '.wav ') && / start /.test(l));
const driveTxts = () => { try { return fs.readdirSync(DRIVE).filter(f => f !== '메모.txt').sort(); } catch (_) { return []; } };

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
  const recs = await until(async () => { const d = await admin('plaud/' + UID + '/rec'); return d && Object.keys(d).length === 6 && d; });
  ok('③ 녹음 줄 여섯', !!recs, recs || home.log().slice(-1500));
  if (recs) {
    ok('③ 제목 · 시작(세계 표준시) · 길이', recs[ID('a')].n === A_TITLE && recs[ID('a')].t === Date.UTC(2026, 10, 22, 6, 5) && recs[ID('a')].d === 2880, recs[ID('a')]);
    ok('③ 빈 제목도 줄로', recs[ID('c')].n === '' && recs[ID('c')].d === 6);
    ok('③ 쓰는 칸은 n · t · c · d · p 뿐', Object.keys(recs[ID('a')]).filter(k => !['id', '_ut'].includes(k)).sort().join() === 'c,d,n,p,t' && recs[ID('a')].p === false);
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
  ok('⑥ 멈춘 동안 녹음 줄을 지우지 않음', recs3 && Object.keys(recs3).length === 6);
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
  // 한글 받기 파일 이름은 UTF-8 로캘이 있어야 그대로 나온다(이 시험 기계는 로캘이 비어 'download' 가 됨 — Mac · 아이폰은 해당 없음)
  const browser = await pw.chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults'], env: Object.assign({}, process.env, { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' }) });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://block7.my' });
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
    await pg.waitForSelector('[data-act="tab"][data-k="all"]', { timeout: 20000 }).catch(() => null);
    ok('⑨ (P3c) 처음 탭은 \'새 녹음\' · 키워드로 고른 녹음은 \'할 것\' 에', await pg.$eval('[data-act="tab"].on', e => e.dataset.k).catch(() => '') === 'new' && !(await pg.$('[data-id="' + ID('a') + '"]')));
    await pg.click('[data-act="tab"][data-k="all"]');
    const listed = await until(async () => (await pg.textContent('#main')).includes('김하늘 집사 심방'));
    const main = await pg.textContent('#main');
    ok('⑨ 로그인하면 두 Mac 카드 · 녹음 목록', listed && main.includes('집') && main.includes('사무실') && main.includes('2 / 2 켜짐'), main.slice(0, 300));
    const rowA = await pg.textContent('[data-id="' + ID('a') + '"]');
    ok('⑨ 한국 시각 — 날짜 묶음 \'11. 22. (일)\' · 시각 칸 15:05 · 제목은 날짜를 뗀 글 · 길이', main.includes('11. 22. (일)') && /^\s*15:05김하늘 집사 심방/.test(rowA) && rowA.includes('48분') && !rowA.includes('2026-11-22'), rowA);
    ok('⑨ 키워드 \'심방\' 녹음은 저절로 골라짐', await pg.$eval('[data-id="' + ID('a') + '"]', e => e.classList.contains('pick')));
    await pg.click('[data-id="' + ID('c') + '"]');   // (P4d) 동그라미는 체크만 — 위 [전사까지] 로 확정
    await pg.click('[data-act="commit"][data-d="0"]');
    const pk = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('c')); return d && d.pick === 'in' && d; });
    ok('⑨ 제목 없는 녹음을 눌러 고르면 계정 job 에 pick:in (제목 없이)', pk && !('n' in pk), pk);
    await pg.click('[data-act="menu"]'); await pg.fill('#kw-in-kw', '전화'); await pg.click('[data-act="kwadd"][data-k="kw"]');
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
    // P3 때 만든 꼴(이름 = 녹음 번호 · 머리말 있음) — 새 이름으로 바뀌어야 함. 머리말 없는 옛 파일(z)은 어느 녹음인지 잃지 않게 그대로 둬야 함
    fs.mkdirSync(DRIVE); fs.writeFileSync(path.join(DRIVE, ID('c') + '.txt'), 'PLAUD 녹음 ID: ' + ID('c') + '\n제목: (제목 없음)\n---\n\n이미 있던 파일 (P3 때 이름 · 다른 Mac 이 먼저 씀)\n');
    fs.writeFileSync(path.join(DRIVE, '메모.txt'), 'HB 메모 — 도우미가 건드리면 안 됨\n');
    const warn = await until(async () => { const d = await admin('plaud/' + UID + '/mac'); return d && /공간이 모자라/.test(d['집'].err || '') && /공간이 모자라/.test(d['사무실'].err || '') && d; }, 70000);
    ok('⑩ 공간이 모자라면 두 Mac 모두 Mac 카드에 알림(남음 · 필요)', warn && /남음 0\.1GB/.test(warn['집'].err) && /필요/.test(warn['집'].err), warn && [warn['집'].err, warn['사무실'].err]);
    const jobs0 = await admin('plaud/' + UID + '/job');
    ok('⑩ … 그리고 아무 일감도 맡지 않음', !Object.values(jobs0 || {}).some(j => j.st), jobs0);
    ok('⑩ 계기판 Mac 카드에도 보임', await until(async () => (await pg.textContent('#main')).includes('공간이 모자라'), 10000));

    // (P3b) 잠금 암호: 계기판에서 정하기 → 이 Mac(서재) 도우미에 저절로 · 집 도우미에도 넘김(틀린 키는 거절)
    await pg.mouse.click(5, 300); await sleep(300);
    await pg.click('[data-act="menu"]'); await pg.click('[data-act="lockpane"]'); await pg.waitForSelector('#pw1');
    await pg.fill('#pw1', '지어낸 암호 문구'); await pg.fill('#pw2', '지어낸 암호 문구'); await pg.click('[data-act="locksubmit"]');
    const kdfDoc = await until(async () => { const d = await admin('plaud/' + UID); return d && d.kdf && d.kdf.s && d; }, 15000);
    ok('(P3b) 계기판에서 정한 암호 → 계정엔 표지(소금 · 반복 수 · 잠근 표지)만', kdfDoc && Object.keys(kdfDoc.kdf).sort().join() === 'c,it,iv,s' && !JSON.stringify(kdfDoc).includes('지어낸 암호'), kdfDoc && kdfDoc.kdf);
    const KEY = kdfDoc && await PH.unlockKey('지어낸 암호 문구', kdfDoc.kdf);
    const lsKey = await pg.evaluate(() => JSON.parse(localStorage.getItem('plaudhub_key_v1') || 'null'));
    ok('(P3b) 키는 이 기기(브라우저)에 · 같은 암호면 같은 키', !!KEY && lsKey && lsKey.k === KEY, lsKey);
    const studyKey = await until(() => fetch('http://127.0.0.1:47211/hello', { headers: { origin: 'https://block7.my' } }).then(r => r.json()).then(j => j.hasKey), 10000);
    ok('(P3b) 이 Mac(서재) 크롬에서 정하면 그 Mac 도우미에 저절로 넘어감 · 키 파일 600', !!studyKey && (fs.statSync(path.join(third.dir, 'key.json')).mode & 0o777) === 0o600);
    const wrong = await fetch('http://127.0.0.1:47931/key', { method: 'POST', headers: { origin: 'http://127.0.0.1:8765', 'content-type': 'application/json' }, body: JSON.stringify({ k: (await PH.newKdf('다른 암호 문구')).key }) });
    ok('(P3b) 틀린 키는 도우미가 받지 않음', wrong.status === 400 && !fs.existsSync(path.join(home.dir, 'key.json')), wrong.status);
    const right = await fetch('http://127.0.0.1:47931/key', { method: 'POST', headers: { origin: 'http://127.0.0.1:8765', 'content-type': 'application/json' }, body: JSON.stringify({ k: KEY }) });
    ok('(P3b) 맞는 키는 받음(집)', right.status === 200, right.status);
    await pg.mouse.click(5, 300); await sleep(300);

    // ⑪ (P3) 공간을 비우면 두 Mac 이 나눠 전사
    home.free(50e9); office.free(50e9);
    const allDone = await until(async () => { const d = await admin('plaud/' + UID + '/job'); return d && [ID('a'), ID('b'), ID('c')].every(id => d[id] && d[id].st === 'done') && d; }, 90000);
    ok('⑪ 고른 셋(키워드 둘 · 직접 고른 하나)이 모두 끝남', !!allDone, allDone || (home.log() + office.log()).slice(-1500));
    const named = await until(async () => JSON.stringify(driveTxts()) === JSON.stringify([NAME.a, NAME.b, NAME.c].sort()) && driveTxts(), 15000);
    ok('⑪ 드라이브에 녹음마다 txt 하나뿐 · 이름 = PLAUD 제목(YY-MMDD HH;MM 글 · 날짜 없으면 녹음 시각) · 옛 f_….txt 도 새 이름으로', !!named, driveTxts());
    ok('⑪ 같은 녹음을 두 Mac 이 겹쳐 전사하지 않음(whisper 가 녹음마다 한 번)', wStarts(ID('a')).length === 1 && wStarts(ID('b')).length === 1, lines('wcalls'));
    ok('⑪ 이미 있던 c 파일은 내용 그대로(이름만 새로) · 받지도 전사하지도 않음(겹 둘)', /\n이미 있던 파일/.test(fs.readFileSync(path.join(DRIVE, NAME.c), 'utf8')) && wStarts(ID('c')).length === 0
      && !lines('calls').includes('audio ' + ID('c') + ' TELEMETRY=1'), lines('calls').filter(l => /^audio/.test(l)));
    ok('⑪ 도우미가 모르는 txt(HB 메모)는 그대로', fs.readFileSync(path.join(DRIVE, '메모.txt'), 'utf8') === 'HB 메모 — 도우미가 건드리면 안 됨\n');
    ok('⑪ 음성 주소는 녹음마다 한 번만 물음', ['a', 'b'].every(k => lines('calls').filter(l => l.startsWith('audio ' + ID(k))).length === 1), lines('calls').filter(l => /^audio/.test(l)));
    const per = {}; for (const l of lines('wcalls')) { const [who, , , what, t] = l.split(' '); (per[who] = per[who] || []).push([what, +t]); }
    ok('⑪ 한 Mac 은 한 번에 하나씩(전사가 겹치지 않음)', Object.values(per).every(xs => xs.every((x, i) => i === 0 || (x[0] === 'start') === (xs[i - 1][0] !== 'start'))), per);
    ok('⑪ 일감 칸: 끝 · 드라이브 단계 · 맡은 Mac · 제목 없음', [ID('a'), ID('b'), ID('c')].every(id => allDone && allDone[id].step === 'drive' && ['집', '사무실'].includes(allDone[id].mac) && !('n' in allDone[id])), allDone);
    const ta = fs.readFileSync(path.join(DRIVE, NAME.a), 'utf8');
    ok('⑪ txt 머리말: 녹음 ID · 제목 · 한국 시각(+09:00) · 길이 · 모델(계정 설정 = 터보)', ta.startsWith('PLAUD 녹음 ID: ' + ID('a') + '\n제목: ' + A_TITLE + '\n녹음 시각: 2026-11-22T15:05:00+09:00\n길이: 48분\n전사: whisper.cpp large-v3-turbo-q5_0 · ')
      && /\n---\n\n안녕하세요 목사님\.\n지어낸 전사 글입니다 /.test(ta), ta.slice(0, 300));
    ok('⑪ whisper 는 한국어(-l ko)로 · ffmpeg 는 16kHz 모노 WAV 로 불림', lines('ffcalls').some(l => /-ar 16000 -ac 1 -c:a pcm_s16le \S+\.wav$/.test(l)), lines('ffcalls'));
    const everything = home.log() + office.log() + JSON.stringify(await admin('plaud/' + UID + '/mac')) + JSON.stringify(await admin('plaud/' + UID + '/job')) + JSON.stringify(await admin('plaud/' + UID + '/cmd'));
    ok('⑪ 음성 주소(서명)가 기록 · 계정 어디에도 없음', !everything.includes(SECRET) && !everything.includes('fake/sound'), everything.slice(0, 200));
    ok('⑪ 전사 글이 기록 · 계정에 없음', !everything.includes('지어낸 전사 글'));
    const left = ['home', 'office'].flatMap(k => { try { return fs.readdirSync(path.join(tmp, k, 'work')); } catch (_) { return []; } });
    ok('⑪ 받은 소리 · WAV · 중간 글은 지움', left.length === 0, left);
    const shown = await until(() => pg.$('[data-id="' + ID('a') + '"] [data-act="view"]'), 10000);
    ok('⑪ (P3c) 끝난 줄: 보기 · 복사 · 받기 · ⋯ 그림 단추 · 왼쪽 동그라미는 빈 채(눌러도 고름 안 바뀜)', !!shown && await pg.$eval('[data-id="' + ID('a') + '"]', e => !e.classList.contains('pick') && !e.dataset.act && [...e.querySelectorAll('.ib')].map(b => b.dataset.act).join() === 'view,copy,save,more'));
    // (P3b) 잠근 사본 — 키가 있는 집이 자기 것 · 사무실이 한 것까지 올림
    const txts = await until(async () => { const d = await admin('plaud/' + UID + '/txt'); return d && [ID('a'), ID('b'), ID('c')].every(id => d[id]) && d; }, 20000);
    ok('(P3b) 잠근 사본 셋(사무실이 전사한 것은 키가 있는 집이 올림) · 칸은 c · iv · v 뿐', txts && Object.keys(txts[ID('a')]).filter(k => !['id', '_ut'].includes(k)).sort().join() === 'c,iv,v', txts && Object.keys(txts));
    ok('(P3b) 잠근 사본에는 평문이 없음 · 맞는 키로 풀면 드라이브 본문과 같음', txts && !JSON.stringify(txts).includes('지어낸 전사') && await PH.decText(KEY, txts[ID('a')]) === PH.txtBody(ta), txts && txts[ID('a')].c.slice(0, 40));
    // 계기판: 복사 · 받기
    await until(() => pg.$('[data-act="copy"][data-id="' + ID('a') + '"]'), 10000);
    await pg.click('[data-act="copy"][data-id="' + ID('a') + '"]');
    const clip = await until(async () => { const t = await pg.evaluate(() => navigator.clipboard.readText()); return t && t.includes('지어낸 전사 글') && t; }, 10000);
    ok('(P3b) 계기판 \'복사\' → 클립보드 = 드라이브 본문', clip === PH.txtBody(ta), clip);
    await sleep(3500); await pg.mouse.click(5, 300);
    const [dl] = await Promise.all([pg.waitForEvent('download', { timeout: 15000 }), pg.click('[data-act="save"][data-id="' + ID('a') + '"]')]);
    const dlTxt = fs.readFileSync(await dl.path(), 'utf8');
    ok('(P3b) 계기판 \'받기\' → 파일 이름 = 드라이브 이름 · 내용 = 본문', dl.suggestedFilename() === NAME.a && dlTxt === PH.txtBody(ta), [dl.suggestedFilename(), dlTxt.slice(0, 60)]);
    // PLAUD 에서 제목을 고치면 드라이브 이름도 따라감
    const R2 = JSON.parse(fs.readFileSync(RECF, 'utf8')); R2[1][1] = '2026-11-21 10:00:00 박소망 성도 전화심방 고침'; fs.writeFileSync(RECF, JSON.stringify(R2));
    await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
    const ren = await until(async () => driveTxts().includes('26-1121 10;00 박소망 성도 전화심방 고침.txt') && !driveTxts().includes(NAME.b) && driveTxts(), 30000);
    ok('(P3b) PLAUD 에서 제목을 고치면 드라이브 파일 이름도 따라감(내용 그대로 · 하나뿐)', !!ren && driveTxts().length === 3 && fs.readFileSync(path.join(DRIVE, '26-1121 10;00 박소망 성도 전화심방 고침.txt'), 'utf8').startsWith('PLAUD 녹음 ID: ' + ID('b')), driveTxts());
    NAME.b = '26-1121 10;00 박소망 성도 전화심방 고침.txt';

    // ⑫ (P3) 모델 시험 — 계기판에서
    await pg.mouse.click(5, 300); await sleep(300);
    // 이 시험 기계엔 Homebrew 가 없어 집 카드에 ✕ 가 하나 있다 → 저절로 펼침 · 접힌 줄에 무엇이 ✕ 인지
    const fold = await pg.$eval('[data-act="fold"][data-mac="집"]', e => [e.getAttribute('aria-expanded'), e.textContent]).catch(() => ['', '']);
    ok('(P3c) ✕ 가 있는 Mac 카드는 저절로 펼침 · \'준비 7/8 — Homebrew ✕\'', fold[0] === 'true' && /준비 7\/8 — Homebrew ✕/.test(fold[1]), fold);
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
    // (P3b) 저장 공간 → 안 쓰는 모델 지우기(쓰는 터보는 단추 없음)
    await sleep(3500); await pg.mouse.click(5, 300); await sleep(300);
    await pg.click('[data-act="diskpane"][data-mac="집"]'); await pg.waitForSelector('#pane');
    const dp = await pg.textContent('#pane');
    ok('(P3b) 저장 공간 판: 남은 공간 · 모델 · 지금 쓰는 터보엔 지우기 없음 · 안 쓰는 중간엔 있음', /남은 공간/.test(dp) && !(await pg.$('[data-act="rmmodel"][data-m="large-v3-turbo-q5_0"]')) && !!(await pg.$('[data-act="rmmodel"][data-m="medium-q5_0"]')), dp);
    await pg.click('[data-act="rmmodel"][data-m="medium-q5_0"]');
    const rm = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && JSON.stringify(d.models) === JSON.stringify(['large-v3-turbo-q5_0']) && d; }, 30000);
    ok('(P3b) 지우기 → 집 Mac 에서 중간 모델 파일이 지워짐 · 터보는 그대로', !!rm && !fs.existsSync(path.join(home.dir, 'models', 'ggml-medium-q5_0.bin')) && fs.existsSync(path.join(home.dir, 'models', 'ggml-large-v3-turbo-q5_0.bin')), rm && rm.models);
    const rmBad = await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'rmmodel', arg: 'large-v3-turbo-q5_0', st: 'new', at: Date.now() });
    const rmId = (await rmBad.json()).name.split('/').pop();
    const rmFail = await until(async () => { const d = await admin('plaud/' + UID + '/cmd/' + rmId); return d && d.st === 'fail' && d; }, 20000);
    ok('(P3b) 쓰는 모델을 지우라는 요청은 도우미가 거절 · 파일 그대로', !!rmFail && fs.existsSync(path.join(home.dir, 'models', 'ggml-large-v3-turbo-q5_0.bin')), rmFail);
    await pg.keyboard.press('Escape'); await sleep(300);

    // ⑬ (P3) 꺼진 Mac 일감 이어받기 — 전사를 15초 걸리게 하고 녹음 e 를 고름. (P3b) 집은 계기판 스위치로 자동 전사를 꺼 둠 → 사무실만 맡음
    await pg.click('[data-act="auto"][data-mac="집"]');
    const autoDoc = await until(async () => { const d = await admin('plaud/' + UID); return d && d.auto && d.auto['집'] === false && d; }, 10000);
    ok('(P3b) 계기판 스위치 → 계정 설정 auto.집 = false (사무실은 그대로)', autoDoc && !('사무실' in autoDoc.auto), autoDoc && autoDoc.auto);
    fs.writeFileSync(path.join(tmp, 'wmode'), '15000');
    await adminPatch('plaud/' + UID + '/job/' + ID('e'), { pick: 'in' });
    const ew = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); return d && d.st === 'work' && d.step === 'stt' && wStarts(ID('e')).length === 1 && d; }, 30000);
    ok('⑬ 녹음 e 를 맡아 전사 중 — 자동이 꺼진 집이 아니라 사무실이', !!ew && ew.mac === '사무실', ew);
    const doing = ew && await until(async () => { const d = await admin('plaud/' + UID + '/mac/' + ew.mac); return /^전사 중 1분째/.test(d.doing || '') && d.doing; }, 10000);
    ok('⑬ 전사 중에도 소식은 계속(\'전사 중 1분째\')', !!doing, doing);
    await sleep(4500);
    const ew2 = await admin('plaud/' + UID + '/job/' + ID('e'));
    ok('⑬ 일하는 동안 맡은 시각을 새로 찍음(renew)', ew && ew2 && ew2.at > ew.at && ew2.mac === ew.mac, [ew && ew.at, ew2 && ew2.at]);
    const dead = ew && (ew.mac === '집' ? home : office), live = dead === home ? office : home;
    if (dead) killGroup(dead.ch);
    await adminPatch('plaud/' + UID + '/mac/' + ew.mac, { at: Date.now() - 10 * 60e3 });   // 죽은 Mac 의 마지막 소식이 10분 전인 것처럼(계기판은 6분 넘으면 '꺼짐')
    await pg.click('[data-act="auto"][data-mac="집"]');   // 집을 다시 켬 → 꺼진 사무실 일감을 이어받음
    await until(async () => { const d = await admin('plaud/' + UID); return d && d.auto && d.auto['집'] === true; }, 10000);
    await adminPatch('plaud/' + UID + '/job/' + ID('e'), { at: Date.now() - 31 * 60e3 });   // 31분 동안 소식이 없던 것처럼
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    const eDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); return d && d.st === 'done' && d; }, 40000);
    ok('⑬ 꺼진 Mac 의 일감을 다른 Mac 이 이어받아 끝냄', eDone && dead && eDone.mac !== ew.mac, [eDone, live && live.log().slice(-500)]);
    ok('⑬ txt 는 하나뿐', driveTxts().includes(NAME.e) && driveTxts().length === 4, driveTxts());
    ok('⑬ 이어받은 Mac 기록에 \'이어받음\'', live && /이어받음/.test(live.log()));

    // ⑭ (P3) 맡김을 잃으면 바로 멈춤 — 남은 한 Mac 이 f 를 전사하는 중에 다른 Mac('서재')이 맡은 것으로 바꿈
    fs.writeFileSync(path.join(tmp, 'wmode'), '15000');
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { pick: 'in' });
    const fw = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('f')); return d && d.st === 'work' && d.step === 'stt' && wStarts(ID('f')).length === 1 && d; }, 30000);
    ok('⑭ 남은 Mac 이 f 를 전사 중', !!fw && live && fw.mac === (live === home ? '집' : '사무실'), fw);
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { mac: '서재', at: Date.now() });
    const killed = await until(async () => lines('wcalls').some(l => l.includes(' ' + ID('f') + '.wav ') && / killed /.test(l)) && /맡김을 잃어 멈춤/.test(live.log()), 10000);
    ok('⑭ 다음 renew(2초) 에서 잃은 것을 보고 whisper 를 멈춤', !!killed && /맡김을 잃어 멈춤/.test(live.log()), lines('wcalls').slice(-3));
    await sleep(1000);
    ok('⑭ … txt 를 쓰지 않음 · 일감은 서재 몫 그대로', !driveTxts().includes(NAME.f) && (await admin('plaud/' + UID + '/job/' + ID('f'))).mac === '서재', driveTxts());
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    await adminPatch('plaud/' + UID + '/job/' + ID('f'), { at: Date.now() - 31 * 60e3 });
    const fDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('f')); return d && d.st === 'done' && d; }, 40000);
    ok('⑭ 서재가 소식이 없자 남은 Mac 이 다시 맡아 끝냄 · txt 하나', fDone && driveTxts().includes(NAME.f) && driveTxts().length === 5, [fDone, driveTxts()]);
    // ⑮ (P3b) 임시 소리 파일 — 전사 중인 g 의 크기가 줄 · 맨 위 합계에 → 비우기 → 그 전사를 멈추고 지움
    fs.writeFileSync(path.join(tmp, 'wmode'), '20000');
    await adminPatch('plaud/' + UID + '/job/' + ID('g'), { pick: 'in' });
    const gw = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.disk && d.disk.work && d.disk.work[ID('g')] > 0 && d; }, 40000);
    ok('⑮ 전사 중인 녹음의 임시 파일 크기가 Mac 소식에(녹음별)', !!gw, gw && gw.disk);
    const rowTmp = await until(async () => { const t = await pg.textContent('[data-id="' + ID('g') + '"]'); return /임시 파일 \d+KB/.test(t) && t; }, 15000);
    const topTmp = await pg.textContent('.tmpline');
    ok('⑮ 계기판: 그 줄에 \'임시 파일 …KB\' · 맨 위 합계 · 비우기 단추', !!rowTmp && /임시 소리 파일 합계 \d+KB · 집 Mac/.test(topTmp) && !/사무실/.test(topTmp) && !!(await pg.$('[data-act="cleanask"]')), [rowTmp, topTmp]);
    await pg.click('[data-act="cleanask"]'); await pg.waitForSelector('[data-act="cleanall"]'); await pg.click('[data-act="cleanall"]');
    const gFail = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('g')); return d && d.st === 'fail' && d; }, 30000);
    ok('⑮ 비우기 → 하던 전사를 멈추고 실패 \'임시 파일을 비움\'(한 시간 뒤 다시)', gFail && gFail.err === '임시 파일을 비움' && lines('wcalls').some(l => l.includes(' ' + ID('g') + '.wav ') && / killed /.test(l)), gFail);
    const emptied = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.disk && Object.keys(d.disk.work || {}).length === 0 && !fs.existsSync(path.join(home.dir, 'work', ID('g') + '.wav')) && d; }, 30000);
    ok('⑮ 일 폴더가 비고 · 합계 0 · txt 는 안 생김', !!emptied && !driveTxts().some(x => x.startsWith('26-1117')) && await until(async () => /합계 0KB/.test(await pg.textContent('.tmpline')), 15000), emptied && emptied.disk);
    // ⑯ (P3c)
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    ok('⑯ 맨 위 버전 단추 = 지금 판', (await pg.textContent('#verbtn')).trim() === PH.APP_VERSION, await pg.textContent('#verbtn'));
    const hm2 = await admin('plaud/' + UID + '/mac/집');
    ok('⑯ 목록 읽은 때 — Mac 소식(listed) · 녹음 제목줄', hm2 && hm2.listed > 0 && /목록 읽은 때 .* · 집/.test(await pg.textContent('#main')), hm2 && hm2.listed);
    // 드라이브에서 a 를 지움 → 드라이브에 없음 → 다시 전사
    fs.rmSync(path.join(DRIVE, NAME.a));
    const gone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('a')); return d && d.gone === true && d; }, 20000);
    ok('⑯ 드라이브에서 지운 것을 도우미가 알아챔(gone) · 저절로 다시 전사하지 않음', !!gone && gone.st === 'done' && wStarts(ID('a')).length === 1, gone);
    await pg.click('[data-act="tab"][data-k="todo"]');
    const goneRow = await until(async () => { const e = await pg.$('[data-id="' + ID('a') + '"]'); return e && /드라이브에 없음/.test(await e.textContent()) && e; }, 10000);
    ok('⑯ 계기판 \'할 것\' 탭에 \'드라이브에 없음\' + 다시 전사', !!goneRow);
    await pg.click('[data-id="' + ID('a') + '"] [data-act="redo"]');
    const redone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('a')); return d && d.st === 'done' && !d.gone && driveTxts().includes(NAME.a) && d; }, 40000);
    ok('⑯ 다시 전사 → 드라이브에 새 txt · 끝남(gone 없음) · whisper 두 번째', !!redone && wStarts(ID('a')).length === 2, [redone, driveTxts()]);
    // b: ⋯ → txt 지우기
    await pg.click('[data-act="tab"][data-k="all"]'); await sleep(300);
    await pg.click('[data-id="' + ID('b') + '"] [data-act="more"]'); await pg.waitForSelector('#pane [data-act="rmtxt"]'); await pg.click('#pane [data-act="rmtxt"]');
    const rmd = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('b')); const tx = await admin('plaud/' + UID + '/txt/' + ID('b')); return d && d.pick === 'out' && !d.st && !tx && !driveTxts().includes(NAME.b) && d; }, 30000);
    ok('⑯ txt 지우기 → 드라이브 파일 · 잠근 사본 없음 · 일감은 \'뺌\' 하나만', !!rmd, [rmd, driveTxts()]);
    await sleep(4000);
    ok('⑯ … 다시 전사하지 않음 · \'드라이브에 없음\' 으로도 안 바뀜', wStarts(ID('b')).length === 1 && !(await admin('plaud/' + UID + '/job/' + ID('b'))).gone && !driveTxts().includes(NAME.b));
    // 보기
    await pg.click('[data-id="' + ID('e') + '"] [data-act="view"]');
    const vt = await until(async () => { const e = await pg.$('#pane .vtext'); return e && (await e.textContent()); }, 15000);
    ok('⑯ 보기 → 아래 판에 전사 글(드라이브 본문과 같음) · 판 아래 복사 · 받기', vt === PH.txtBody(fs.readFileSync(path.join(DRIVE, NAME.e), 'utf8')) && !!(await pg.$('#pane [data-act="copy"]')) && !!(await pg.$('#pane [data-act="save"]')), vt);
    await pg.keyboard.press('Escape'); await sleep(400);
    // 모두 지금 시작 — g 는 비우기로 실패(고른 채 기다림)
    await until(() => pg.$('[data-act="kickall"]'), 10000);
    await pg.click('[data-act="kickall"]');
    const kc = await until(async () => { const d = await admin('plaud/' + UID + '/cmd'); const x = d && Object.values(d).find(c => c.what === 'kick' && c.mac === '집'); return x && x.st === 'ok' && x; }, 20000);
    ok('⑯ 모두 지금 시작 → 켜지고 자동 전사가 켜진 Mac(집)이 요청을 받음', !!kc && kc.mac === '집', kc);
    // ⑰ (P3d) 온라인 전용
    killGroup(home.ch); await sleep(500);
    fs.renameSync(path.join(DRIVE, NAME.f), path.join(DRIVE, ID('f') + '.txt'));   // P3 때 이름으로 되돌려 둠
    try { fs.rmSync(path.join(home.dir, 'names.json')); } catch (_) { }   // 이름 기억 없이 — 제목 · 녹음번호 이름만으로 찾아야 함
    await adminPatch('plaud/' + UID + '/job/' + ID('e'), { gone: true });   // 전 판이 잘못 적은 '드라이브에 없음' 흉내
    const home2 = startHelper('home', 47931, { tools: true, drive: '내 드라이브', evict: '\\.txt$' });
    const ev = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); return d && d.gone === false && driveTxts().includes(NAME.f) && d; }, 40000);
    ok('⑰ 내용을 못 읽어도 제목 이름으로 찾아 잘못된 \'드라이브에 없음\' 을 되돌림 · 옛 녹음번호.txt 는 새 이름으로', !!ev, [ev, driveTxts(), home2.log().slice(-400)]);
    await sleep(3000);
    const jobsNow = await admin('plaud/' + UID + '/job');
    ok('⑰ 온라인 전용이어도 있는 파일을 \'드라이브에 없음\' 으로 적지 않음', [ID('a'), ID('c'), ID('e'), ID('f')].every(id => jobsNow[id] && jobsNow[id].st === 'done' && !jobsNow[id].gone), Object.fromEntries([ID('a'), ID('c'), ID('e'), ID('f')].map(id => [id.slice(0, 4), jobsNow[id] && jobsNow[id].gone])));
    ok('⑰ 내용이 그대로(이름만 바뀜)', fs.readFileSync(path.join(DRIVE, NAME.f), 'utf8').startsWith('PLAUD 녹음 ID: ' + ID('f')));
    // ⑱ (P3e) PLAUD 전사문
    const iso = ms => new Date(ms).toISOString().slice(0, 19);
    const PT = '[00:01 - 00:05] Speaker 1: 지어낸 PLAUD 전사 글입니다\n[00:06 - 00:09] Speaker 2: 네 목사님';
    const R3 = JSON.parse(fs.readFileSync(RECF, 'utf8'));
    R3.push([ID('h'), '11-20 지어낸 셀 심방: 다음 모임', '2026-11-20T03:00:00', '5m00s', PT]);   // PLAUD 가 전사하며 'MM-DD …' 로 바꾼 제목
    R3.push([ID('i'), '', iso(Date.now() - 3600e3), '3m00s']);   // 한 시간 전 녹음 · PLAUD 전사 없음
    fs.writeFileSync(RECF, JSON.stringify(R3));
    await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
    const NH = '26-1120 12;00 p 지어낸 셀 심방; 다음 모임.txt';
    const hDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('h')); return d && d.st === 'done' && driveTxts().includes(NH) && d; }, 40000);
    ok('⑱ PLAUD 전사가 있는 녹음(키워드)은 whisper 없이 가져와 \'YY-MMDD HH;MM p 글\' 이름 · src p', !!hDone && hDone.src === 'p' && wStarts(ID('h')).length === 0 && !lines('calls').some(l => l.startsWith('audio ' + ID('h'))), [hDone, driveTxts()]);
    const th = fs.readFileSync(path.join(DRIVE, NH), 'utf8');
    ok('⑱ 파일: 머리말(전사: PLAUD 전사문 가져옴) + PLAUD 전사문 그대로', /^PLAUD 녹음 ID: f_h+\n제목: 11-20 지어낸 셀 심방: 다음 모임\n/.test(th) && /\n전사: PLAUD 전사문 가져옴 · 집 Mac · /.test(th) && th.includes('[00:01 - 00:05] Speaker 1: 지어낸 PLAUD 전사 글입니다'), th.slice(0, 300));
    const recH = await admin('plaud/' + UID + '/rec/' + ID('h'));
    ok('⑱ 녹음 줄에 p(PLAUD 전사 있음)', recH && recH.p === true, recH);
    await pg.click('[data-act="tab"][data-k="all"]');
    const rowH = await until(async () => { const e = await pg.$('[data-id="' + ID('h') + '"]'); return e && (await e.$('.pill.p')) && (await e.textContent()); }, 15000);
    ok('⑱ 계기판: 제목 앞 MM-DD 뗌 · 보기 앞 P 알약', !!rowH && /지어낸 셀 심방: 다음 모임/.test(rowH) && !/11-20 지어낸/.test(rowH), rowH);
    // 기다림 → [지금]
    fs.writeFileSync(path.join(tmp, 'wtext'), Array(12).fill('모델은 \'모델\'의 \'모델\'입니다.').join('\n') + '\n');   // 말소리가 거의 없는 짧은 녹음 꼴
    await adminPatch('plaud/' + UID + '/job/' + ID('i'), { pick: 'in' });
    await sleep(5000);
    const iWait = await admin('plaud/' + UID + '/job/' + ID('i'));
    const rowI = await until(async () => { const t = await pg.textContent('[data-id="' + ID('i') + '"]').catch(() => ''); return /PLAUD 전사를 기다림/.test(t) && t; }, 10000);
    ok('⑱ PLAUD 전사가 없는 한 시간 전 녹음은 맡지 않고 기다림(계기판에 \'PLAUD 전사를 기다림 — … 뒤 whisper\')', iWait && !iWait.st && !!rowI && wStarts(ID('i')).length === 0, [iWait, rowI]);
    await pg.click('[data-id="' + ID('i') + '"] [data-act="kick"]');
    const iDone = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('i')); return d && d.st === 'done' && d; }, 40000);
    ok('⑱ [지금] → 기다리지 않고 whisper · src w · 되풀이 전사라 odd', !!iDone && iDone.src === 'w' && iDone.odd === true && wStarts(ID('i')).length === 1, iDone);
    const pillI = await until(() => pg.$('[data-id="' + ID('i') + '"] .pill.w.odd'), 10000);
    ok('⑱ 계기판: W 알약 빨강(전사 의심)', !!pillI);
    fs.rmSync(path.join(tmp, 'wtext'));
    // whisper 로 만든 e 에 PLAUD 전사가 생김 → 바꿈
    const R4 = JSON.parse(fs.readFileSync(RECF, 'utf8')), ei = R4.findIndex(r => r[0] === ID('e'));
    R4[ei][1] = '11-19 지어낸 셀 모임'; R4[ei][4] = '[00:01 - 00:03] Speaker 1: e 의 PLAUD 전사'; fs.writeFileSync(RECF, JSON.stringify(R4));
    await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
    const NE = '26-1119 11;00 p 지어낸 셀 모임.txt';
    const eUp = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('e')); const fsx = driveTxts().filter(x => x.startsWith('26-1119 11;00')); return d && d.st === 'done' && d.src === 'p' && fsx.length === 1 && fsx[0] === NE && d; }, 60000);
    ok('⑱ whisper 로 만든 e 에 PLAUD 전사가 생기자 PLAUD 것으로 바꿈 — 파일 하나(p) · 내용 = PLAUD 전사', !!eUp && fs.readFileSync(path.join(DRIVE, NE), 'utf8').includes('e 의 PLAUD 전사'), [eUp, driveTxts().filter(x => x.startsWith('26-1119')), home2.log().slice(-1500)]);
    // ⑲ (P4) AI 초안
    const aiPost = (port, k) => fetch('http://127.0.0.1:' + port + '/aikey', { method: 'POST', headers: { origin: 'http://127.0.0.1:8765', 'content-type': 'application/json' }, body: JSON.stringify({ k }) });
    ok('⑲ 열쇠 없는 동안: 키워드 녹음(a)은 초안 기다림(wait) · 이름 없는 녹음(i)은 아님', (await admin('plaud/' + UID + '/job/' + ID('a'))).dr === 'wait' && !(await admin('plaud/' + UID + '/job/' + ID('i'))).dr);
    let ak = await aiPost(47931, 'sk-test-' + 'y'.repeat(40));
    ok('⑲ 틀린 OpenAI 열쇠는 받지 않음(모델 목록을 물어 확인) · 파일 없음', ak.status === 400 && /열쇠가 맞지 않습니다/.test((await ak.json()).err || '') && !fs.existsSync(path.join(home2.dir, 'ai.json')));
    ak = await aiPost(47931, AI_KEY);
    ok('⑲ 맞는 열쇠는 그 Mac 의 ai.json(600)에만', ak.status === 200 && (fs.statSync(path.join(home2.dir, 'ai.json')).mode & 0o777) === 0o600);
    const macAi = await until(async () => { const d = await admin('plaud/' + UID + '/mac/집'); return d && d.aik === true && Array.isArray(d.aim) && d; }, 15000);
    ok('⑲ Mac 소식: 열쇠 있음(aik) · 글 모델 목록(소리 · 임베딩 · 날짜 사본 빼고) · 열쇠 글은 없음', macAi && JSON.stringify(macAi.aim) === '["gpt-9","gpt-9-mini"]' && !JSON.stringify(await admin('plaud/' + UID)).includes('sk-test') && !JSON.stringify(macAi).includes('sk-test'), macAi);
    // ㉑ (P4e) 모델을 안 고르면 초안을 만들지 않는다 — 까닭을 적고 OpenAI 를 부르지 않음
    const needA = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('a')); return d && d.dr === 'fail' && d; }, 30000);
    ok('㉑ 모델을 안 고르면 초안을 만들지 않음 — 일감 fail · 까닭 \'메뉴 › AI 초안에서 모델을 골라 주세요\' · OpenAI 를 부르지 않음', !!needA && needA.dre === PH.AI_NEED && AIQ.calls.length === 0, [needA, AIQ.calls.length]);
    await pg.keyboard.press('Escape'); await sleep(300); await pg.click('[data-act="tab"][data-k="all"]');
    const needBtn = await until(async () => { const e = await pg.$('[data-id="' + ID('a') + '"] .lnk.dr.bad'); return e && (await e.getAttribute('title')); }, 15000);
    ok('㉑ 계기판 줄: 빨간 \'초안\' · 까닭(모델을 골라 주세요)', /모델을 골라 주세요/.test(needBtn || ''), needBtn);
    await pg.click('[data-act="menu"]'); await until(() => pg.$('#ai-auto'), 10000);
    const opts = await pg.$$eval('#ai-auto option', o => o.map(x => x.value + '|' + x.textContent));
    ok('㉑ 메뉴 AI 초안: 고르기 칸 둘 · 처음엔 비어 있음(저절로 고르지 않음) · Mac 모델 목록 · 지어낸 이름엔 \'권장\' 없음', !!(await pg.$('#ai-big')) && (await pg.$eval('#ai-auto', e => e.value)) === '' && (await pg.$eval('#ai-big', e => e.value)) === '' && opts.some(x => x.startsWith('gpt-9-mini|')) && !opts.some(x => /권장/.test(x)) && /gpt-6-luna/.test(await pg.textContent('#pane')), opts);
    await pg.selectOption('#ai-auto', 'gpt-9-mini'); await sleep(500); await pg.selectOption('#ai-big', 'gpt-9');
    const aiSet = await until(async () => { const d = await admin('plaud/' + UID); return d && d.ai && d.ai.auto === 'gpt-9-mini' && d.ai.big === 'gpt-9' && d.ai; }, 10000);
    ok('㉑ 고른 두 모델이 계정 설정 ai.auto · ai.big 에', !!aiSet, aiSet);
    await pg.keyboard.press('Escape'); await sleep(300);
    const drA = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('a')); return d && d.dr === 'ok' && d; }, 40000);
    ok('⑲ 키워드 녹음 a 의 초안이 저절로 만들어짐(dr ok)', !!drA, [drA, home2.log().slice(-800)]);
    const call1 = AIQ.calls[0] || { messages: [{}, {}] };
    ok('⑲ 보낸 것: 고른 모델(㉑ 첫 초안 = auto gpt-9-mini) · 지침 v2.2 + 답 꼴 · 녹음 정보 + 전사 글 · JSON 으로', call1.model === 'gpt-9-mini' && /① 핵심 한줄/.test(call1.messages[0].content) && /hb-care\.v1/.test(call1.messages[0].content) && /녹음 ID: f_/.test(call1.messages[1].content) && /전사문:\n/.test(call1.messages[1].content) && call1.response_format && call1.response_format.type === 'json_object', call1.model);
    ok('⑲ 처음 답이 규격에 걸리면(우선순위 \'높음\') 까닭을 붙여 한 번 더', AIQ.calls.length >= 2 && /records\[0\]\.priority/.test(AIQ.calls[1].messages[AIQ.calls[1].messages.length - 1].content));
    const dA = await admin('plaud/' + UID + '/draft/' + ID('a'));
    ok('⑲ 계정의 초안은 잠근 글(c · iv · v)뿐 — 이름 · 초안 글이 없음', dA && Object.keys(dA).filter(k => !['id', '_ut'].includes(k)).sort().join() === 'c,iv,v' && !/김하늘|지어낸/.test(JSON.stringify(dA)), dA && Object.keys(dA));
    const DA = dA && JSON.parse(await PH.decText(KEY, dA));
    ok('⑲ 풀면: 초안 글 · 묶음(source = 녹음 ID · 한국 시각 · 길이) · 모델', DA && /지어낸 초안 f_a/.test(DA.md) && DA.packet.source.source_id === ID('a') && DA.packet.source.recorded_at === '2026-11-22T15:05:00+09:00' && DA.packet.source.duration_ms === 2880000 && DA.model === 'gpt-9-mini' && DA.packet.records[0].priority === '일반', DA && DA.packet.source);
    ok('⑲ 도우미 기록에 전사 글 · 초안 글 · 열쇠가 없음', !/지어낸 전사 글|지어낸 초안|지어낸 PLAUD|sk-test/.test(home2.log()), home2.log().slice(-600));
    // 계기판 — 초안 판 · 고칠 점 · 다시 만들기 · 승인
    await adminSet('users/' + UID + '/data/care', { sheet: { id: 'sheetFAKE01', name: '지어낸 시트' } });
    const SHEET = [PH.INBOX_COLS.slice()], appended = [];
    await ctx.route('https://asia-northeast3-block7-8f24e.cloudfunctions.net/gcal/token', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ access_token: 'gtok', expires_in: 3600 }) }));
    await ctx.route('https://sheets.googleapis.com/**', r => { const q = r.request(), u = decodeURIComponent(q.url());
      if (q.headers().authorization !== 'Bearer gtok' || !u.includes('/spreadsheets/sheetFAKE01/values/\'AI 입력대기\'!')) return r.fulfill({ status: 403, body: '{}' });
      if (q.method() === 'GET') return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ values: SHEET }) });
      if (/:append\?valueInputOption=RAW&insertDataOption=INSERT_ROWS/.test(u)) { const v = JSON.parse(q.postData()).values; appended.push(...v); SHEET.push(...v); return r.fulfill({ contentType: 'application/json', body: '{}' }); }
      return r.fulfill({ status: 400, body: '{}' }); });
    const drBtn = await until(() => pg.$('[data-id="' + ID('a') + '"] [data-act="draft"]'), 15000);
    ok('⑲ 계기판: 끝난 줄에 \'초안\' 단추', !!drBtn && (await drBtn.textContent()) === '초안');
    await drBtn.click();
    const paneMd = await until(async () => { const e = await pg.$('#pane .vtext'); return e && (await e.textContent()); }, 15000);
    ok('⑲ 초안 판: 초안 글 · 시트로 갈 묶음 · 고칠 점 · [승인]', /지어낸 초안 f_a/.test(paneMd || '') && !!(await pg.$('#pane details.pk')) && !!(await pg.$('#dr-fb')) && !!(await pg.$('#pane [data-act="drok"]')), paneMd);
    await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('h')); return d && d.dr === 'ok'; }, 30000);   // ㉑ 모델을 고르자 함께 다시 집힌 h 가 끝난 뒤(동시에 돌면 마지막 부름이 h 것)
    const nCalls = AIQ.calls.length;
    await pg.fill('#dr-fb', '우선순위는 이번주로 바꿔 주세요'); await pg.click('#pane [data-act="drre"]');
    const fbDoc = await until(async () => { const d = await admin('plaud/' + UID + '/draft/' + ID('a')); return d && d.fc && d; }, 10000);
    ok('⑲ 고칠 점은 잠가서(fc · fiv) — 평문 없음', !!fbDoc && !/우선순위는/.test(JSON.stringify(fbDoc)) && (await PH.decText(KEY, { c: fbDoc.fc, iv: fbDoc.fiv })) === '우선순위는 이번주로 바꿔 주세요');
    const re = await until(async () => { const e = await pg.$('#pane .vtext'); const t = e && (await e.textContent()); return t && /고침: 우선순위는 이번주로/.test(t) && t; }, 30000);
    const lastCall = AIQ.calls[AIQ.calls.length - 1] || { messages: [] };
    ok('⑲ 다시 만들기: 앞 초안 + 고칠 점을 보내고 새 초안이 판에 · 고칠 점 칸은 지워짐', !!re && AIQ.calls.length > nCalls && lastCall.messages.some(m => m.role === 'assistant' && /지어낸 초안 f_a/.test(m.content)) && !(await admin('plaud/' + UID + '/draft/' + ID('a'))).fc, re);
    ok('㉑ 다시 만들기(고칠 점 있음) = big 모델 gpt-9 · 첫 초안 = auto gpt-9-mini', lastCall.model === 'gpt-9' && AIQ.calls.filter(c => /녹음 ID: f_a/.test(c.messages[1].content) && c.messages.length <= 3).every(c => c.model === 'gpt-9-mini'), AIQ.calls.map(c => c.model));
    // ㉑ 이번 달 사용량 — 부른 만큼(가짜 usage 1000 · 200) 모델마다
    const MK = PH.monthKey(Date.now()), want = m => AIQ.calls.filter(c => c.model === m).length;
    const use1 = await until(async () => { const d = await admin('plaud/' + UID + '/use/' + MK); return d && d['gpt-9'] && d['gpt-9-mini'] && d['gpt-9'].n === want('gpt-9') && d['gpt-9-mini'].n === want('gpt-9-mini') && d; }, 15000);
    ok('㉑ 이번 달(한국 시각) use 문서에 모델마다 부른 횟수 · 입력 · 출력 토큰이 더해짐 — 숫자만(글 · 녹음 번호 없음)', !!use1 && use1['gpt-9-mini'].i === 1000 * want('gpt-9-mini') && use1['gpt-9-mini'].o === 200 * want('gpt-9-mini') && use1['gpt-9'].i === 1000 * want('gpt-9') && !/f_|김하늘|지어낸/.test(JSON.stringify(use1)), [use1, want('gpt-9'), want('gpt-9-mini')]);
    { const CM = FS + '/v1/projects/' + PROJECT + '/databases/(default)/documents:commit', name = 'projects/' + PROJECT + '/databases/(default)/documents/plaud/' + UID + '/use/2026-01';
      const go = tok => fetch(CM, { method: 'POST', headers: { authorization: 'Bearer ' + tok, 'content-type': 'application/json' }, body: JSON.stringify({ writes: [PH.useWrite(name, 'gpt-x.1-mini', { i: 10, o: 2, c: 0 })] }) });
      const rs = await Promise.all(Array.from({ length: 12 }, () => go(hb.idToken))), u2 = await admin('plaud/' + UID + '/use/2026-01'), x = u2 && u2['gpt-x.1-mini'];
      ok('㉑ 두 Mac 이 겹쳐 동시에 열두 번 더해도 맞음(increment) · 점 있는 모델 이름도', rs.every(r => r.ok) && !!x && x.i === 120 && x.o === 24 && x.n === 12, x);
      ok('㉑ 남은 HB 사용량에 더하지 못함', (await go(other.idToken)).status === 403); }
    // ㉑ 맨 위 금액 줄 — 단가가 없으면 메뉴로 · 단가 · 환율을 적으면 원 · 달러
    await pg.keyboard.press('Escape'); await sleep(400);
    const ul1 = await until(async () => { const e = await pg.$('#main .useline'); return e && (await e.textContent()); }, 10000);
    ok('㉑ 머리줄 아래 한 줄: \'이번 달 AI 초안 n건 · 단가를 적으면 금액이 보입니다\'', /^이번 달 AI 초안 \d+건 · 단가를 적으면 금액이 보입니다$/.test(ul1 || ''), ul1);
    await pg.click('#main .useline'); await until(() => pg.$('#pane input[data-m="gpt-9-mini"][data-k="0"]'), 10000);
    for (const [m, k, v] of [['gpt-9-mini', 0, '0.1'], ['gpt-9-mini', 1, '0.5'], ['gpt-9', 0, '1'], ['gpt-9', 1, '5']]) {
      const q = '#pane input[data-m="' + m + '"][data-k="' + k + '"]'; await until(() => pg.$(q), 5000); await pg.fill(q, v); await pg.$eval(q, e => e.dispatchEvent(new Event('change', { bubbles: true }))); await sleep(400); }
    ok('㉑ 환율 칸은 처음 1400(화면 기본값) · 저장 전엔 계정에 없음', (await pg.$eval('#ai-krw', e => e.value)) === '1400' && !(await admin('plaud/' + UID)).ai.krw);
    await pg.click('#pane [data-act="krwsave"]');
    const aiP = await until(async () => { const d = await admin('plaud/' + UID); return d && d.ai && d.ai.krw === 1400 && d.ai.price && d.ai.price['gpt-9'] && d.ai; }, 10000);
    ok('㉑ 단가 · 환율이 계정 설정 ai.price · ai.krw 에(모델 두 칸은 그대로)', !!aiP && JSON.stringify(aiP.price['gpt-9-mini']) === '[0.1,0.5]' && JSON.stringify(aiP.price['gpt-9']) === '[1,5]' && aiP.auto === 'gpt-9-mini' && aiP.big === 'gpt-9', aiP);
    await pg.keyboard.press('Escape'); await sleep(400);
    const ul2 = await until(async () => { const t = await pg.textContent('#main .useline').catch(() => ''); return /약 ₩[\d,]+ \(\$\d+\.\d\d\)$/.test(t) && t; }, 10000);
    const uv = PH.useView(await admin('plaud/' + UID + '/use/' + MK), { ai: aiP });
    ok('㉑ 맨 위 줄: \'이번 달 AI 초안 n건 · 약 ₩○○○ ($0.00)\' = 토큰 × 단가 × 환율', !!ul2 && ul2 === PH.useLine(uv) && uv.usd > 0, [ul2, PH.useLine(uv)]);
    ok('㉑ 맨 위 줄은 작게 · 무채색', await pg.$eval('#main .useline', e => { const c = getComputedStyle(e); return parseFloat(c.fontSize) <= 12.5 && !/rgb\((\d+), (?!\1)/.test(c.color); }));
    await pg.click('#main .useline'); await until(() => pg.$('#pane .kv.use'), 10000);
    const up = await pg.textContent('#pane');
    ok('㉑ 누르면 모델별 토큰 · 금액 판 + \'정확한 금액은 OpenAI Usage 화면\' · ×', /gpt-9-mini/.test(up) && /gpt-9/.test(up) && /토큰/.test(up) && /정확한 금액은 OpenAI Usage 화면/.test(up) && !!(await pg.$('#pane .modal-x')), up.slice(0, 300));
    await pg.keyboard.press('Escape'); await sleep(300);
    await pg.click('[data-act="tab"][data-k="all"]');
    await (await until(() => pg.$('[data-id="' + ID('a') + '"] [data-act="draft"]'), 10000)).click(); await until(() => pg.$('#pane [data-act="drok"]'), 15000);
    await pg.click('#pane [data-act="drok"]');
    const sent = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('a')); return d && d.dr === 'sent' && d; }, 15000);
    const row = appended[0] || [];
    ok('⑲ [승인] → 시트 \'AI 입력대기\' 에 한 줄(접수ID 빈 · 한국 시각 · 규격 · JSON · 대기 · 녹음 ID) · 일감 sent', !!sent && appended.length === 1 && row[0] === '' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(row[1]) && row[2] === 'hb-care.v1' && row[4] === '대기' && row[6] === ID('a') && JSON.parse(row[3]).source.source_id === ID('a'), row.slice(0, 3).concat(row.slice(4)));
    const sentBtn = await until(async () => { const e = await pg.$('[data-id="' + ID('a') + '"] [data-act="draft"]'); return e && (await e.textContent()) === '보냄' && e; }, 10000);
    ok('⑲ 줄 단추가 \'보냄\' · 판에는 [승인] 이 없음', !!sentBtn && !(await pg.$('#pane [data-act="drok"]')));
    await adminPatch('plaud/' + UID + '/job/' + ID('a'), { dr: 'ok' }); await sleep(800);
    await until(() => pg.$('#pane [data-act="drok"]'), 10000); await pg.click('#pane [data-act="drok"]');
    await until(async () => (await admin('plaud/' + UID + '/job/' + ID('a'))).dr === 'sent', 10000);
    ok('⑲ 같은 녹음이 이미 대기함에 있으면 두 번 넣지 않음(지침 7항 4)', appended.length === 1);
    await pg.keyboard.press('Escape'); await sleep(400);
    // 지침 고치기 → 다음 초안이 따름
    await pg.click('[data-act="menu"]'); await pg.click('[data-act="guidepane"]');
    const gd = await until(async () => { const e = await pg.$('#gd-tx'); return e && (await e.inputValue()); }, 10000);
    ok('⑲ 지침 판: 처음엔 v2.2(①~⑧) · 늘 붙는 답 꼴은 따로', /① 핵심 한줄/.test(gd || '') && !/hb-care\.v1/.test(gd || '') && /hb-care\.v1/.test(await pg.textContent('#pane details.pk')));
    await pg.fill('#gd-tx', '지어낸 지침: 아주 짧게 정리'); await pg.click('#pane [data-act="gdsave"]');
    const gdoc = await until(async () => { const d = await admin('plaud/' + UID + '/cfg/guide'); return d && d.c && d; }, 10000);
    ok('⑲ 지침은 잠가서 계정에', !!gdoc && !/지어낸 지침/.test(JSON.stringify(gdoc)) && (await PH.decText(KEY, gdoc)) === '지어낸 지침: 아주 짧게 정리');
    const hBtn = await until(() => pg.$('[data-id="' + ID('h') + '"] [data-act="draft"]'), 30000);
    await hBtn.click(); await until(() => pg.$('#pane [data-act="drre"]'), 10000); await pg.click('#pane [data-act="drre"]');
    const gCall = await until(async () => { const c = AIQ.calls.filter(x => /녹음 ID: f_h/.test(x.messages[1].content)).pop(); return c && c.messages[0].content.startsWith('지어낸 지침: 아주 짧게 정리') && c; }, 30000);
    ok('⑲ 고친 지침으로 다시 만듦(답 꼴은 그대로 덧붙음)', !!gCall && /hb-care\.v1/.test(gCall.messages[0].content) && !/추측하지 않는다/.test(gCall.messages[0].content));
    await until(async () => (await admin('plaud/' + UID + '/job/' + ID('h'))).dr === 'ok', 20000);
    // 한도 → 실패 · 빨강
    AIQ.quota = true; await pg.click('#pane [data-act="drre"]');
    const qf = await until(async () => { const d = await admin('plaud/' + UID + '/job/' + ID('h')); return d && d.dr === 'fail' && d; }, 20000);
    ok('⑲ OpenAI 한도 → 초안 실패 · 짧은 까닭(한도 · 결제)', !!qf && /한도 · 결제/.test(qf.dre || ''), qf);
    await pg.keyboard.press('Escape'); await sleep(400);
    ok('⑲ 계기판: 실패한 초안은 빨간 \'초안\'', !!(await until(() => pg.$('[data-id="' + ID('h') + '"] .lnk.dr.bad'), 10000)));
    AIQ.quota = false;
    // 이 Mac(서재)에 열쇠 넣기 — 화면
    await pg.click('[data-act="menu"]'); await pg.click('[data-act="aikeypane"]'); await until(() => pg.$('#ai-key'), 10000);
    await pg.fill('#ai-key', AI_KEY); await pg.click('#pane [data-act="aikeygive"]');
    const stAi = await until(async () => { const d = await admin('plaud/' + UID + '/mac/서재'); return d && d.aik === true && d; }, 20000);
    ok('⑲ 계기판 \'이 Mac 에 OpenAI 열쇠 넣기\' → 서재 Mac 에만(600) · 계정엔 있음 표시만', !!stAi && fs.existsSync(path.join(third.dir, 'ai.json')) && (fs.statSync(path.join(third.dir, 'ai.json')).mode & 0o777) === 0o600, [await pg.textContent('body').then(t => t.slice(-300)), third.log().slice(-600)]);
    await until(() => pg.$('#pane [data-act="aikeyclear"]'), 10000); await pg.click('#pane [data-act="aikeyclear"]');
    ok('⑲ 열쇠 지우기 → 파일 없음 · aik 거짓', !!(await until(async () => !fs.existsSync(path.join(third.dir, 'ai.json')) && (await admin('plaud/' + UID + '/mac/서재')).aik === false, 15000)));
    await pg.keyboard.press('Escape'); await sleep(300);
    // ⑳ (P4d) 고르기 — 동그라미는 체크만(저장 안 함) · 위에 뜨는 [전사까지](누런색) · [초안까지](녹색) 로 확정(dr wait 를 전사 전에 미리 적음, 규칙 그대로) · 할 것 줄의 글 색 · 전사 중 진행 · 남은 시간
    const PT2 = '[00:01 - 00:05] Speaker 1: 지어낸 모임 전사 글입니다\n[00:06 - 00:09] Speaker 2: 네 목사님';
    const R5 = JSON.parse(fs.readFileSync(RECF, 'utf8'));
    for (const [k, h] of [['j', 3], ['k', 4], ['l', 5], ['m', 6]]) R5.push([ID(k), '11-1' + h + ' 지어낸 모임 ' + k, '2026-11-1' + h + 'T03:00:00', '4m00s', PT2]);
    R5.push([ID('n'), '', '2026-11-12T03:00:00', '10m00s']);   // PLAUD 전사 없음 → whisper(전사 중 진행 보기)
    fs.writeFileSync(RECF, JSON.stringify(R5));
    await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
    await pg.click('[data-act="tab"][data-k="new"]');
    const sel = k => '#main .rec[data-id="' + ID(k) + '"]', job = k => admin('plaud/' + UID + '/job/' + ID(k));
    ok('⑳ 새 녹음 탭에 새 줄(아직 안 고름 · 체크 없음) · 위 버튼 줄 없음', !!(await until(() => pg.$(sel('j')), 40000)) && !!(await until(() => pg.$(sel('m')), 20000)) && !(await pg.$eval(sel('j'), e => e.classList.contains('pick') || e.classList.contains('sel'))) && !(await pg.$('.selbar')));
    await pg.click(sel('j')); await pg.click(sel('k')); await sleep(800);
    const selTxt = await pg.textContent('.selbar').catch(() => '');
    ok('⑳ 동그라미를 누르면 체크만 — 줄은 그대로 · 계정엔 안 씀 · 위에 \'2개 체크\' + [전사까지] · [초안까지]', /2개 체크/.test(selTxt) && /전사까지/.test(selTxt) && /초안까지/.test(selTxt) && !(await job('j')) && !(await job('k')) && !!(await pg.$(sel('j') + '.sel')));
    const bcol = await pg.evaluate(() => [...document.querySelectorAll('.selbar .btn')].map(b => getComputedStyle(b).backgroundColor));
    ok('⑳ 두 버튼은 색이 다름(누런색 · 녹색)', bcol.length === 2 && bcol[0] !== bcol[1], bcol);
    await pg.click(sel('k')); await sleep(300);
    ok('⑳ 체크를 다시 누르면 풀림(1개 체크) · 모두 풀면 버튼 줄이 사라짐', /1개 체크/.test(await pg.textContent('.selbar')) && (await pg.click(sel('j')), await sleep(300), !(await pg.$('.selbar'))));
    await pg.click(sel('j')); await pg.click(sel('k')); await pg.click('.selbar [data-act="commit"][data-d="1"]');
    const jl = await until(async () => { const d = await job('j'); const e = await job('k'); return d && e && d.pick === 'in' && e.pick === 'in' && [d, e]; }, 8000);
    ok('⑳ [초안까지] → 체크한 줄 모두 일감 { pick: in, dr: wait } — 전사 전에 미리 적음(체크는 지워지고 버튼 줄도 사라짐)', !!jl && jl[0].dr === 'wait' && jl[1].dr === 'wait' && !(await pg.$('.selbar')), jl);
    await pg.click(sel('m')); await pg.click('.selbar [data-act="commit"][data-d="0"]');
    const ml = await until(async () => { const d = await job('m'); return d && d.pick === 'in' && d; }, 8000);
    ok('⑳ [전사까지] → 일감 { pick: in } 만 — dr 없음', !!ml && !('dr' in ml), ml);
    // 할 것 탭 — 글 색 · 모양(Mac 이 다 전사하기 전에 봄)
    await pg.click('[data-act="tab"][data-k="todo"]');
    const shape = k => until(async () => { const e = await pg.$(sel(k)); return e && (await e.evaluate(x => { const b = x.querySelector('.meta b'); return [x.classList.contains('pick'), x.classList.contains('full'), b ? b.textContent : '', b ? getComputedStyle(b).color : '', getComputedStyle(x.querySelector('.meta')).color]; })); }, 10000);
    const shJ = await shape('j'), shM = await shape('m');
    ok('⑳ 할 것 줄 글: 초안까지 = 녹색(가득 찬 체크) · 전사까지 = 누런색(테두리 체크) — 회색 글자 아님', shJ && shM && shJ[0] && shJ[1] && shJ[2] === '초안까지' && shM[0] && !shM[1] && shM[2] === '전사까지' && shJ[3] !== shM[3] && shJ[3] !== shJ[4] && shM[3] !== shM[4], [shJ, shM]);
    await pg.click('[data-act="tab"][data-k="new"]');
    // 이어짐 — 전사가 끝나면 열쇠 있는 Mac 이 초안까지, 전사까지만 고른 것은 전사에서 끝
    const jd = await until(async () => { const d = await job('j'); return d && d.st === 'done' && d.dr === 'ok' && d; }, 90000);
    ok('⑳ 초안까지 고른 녹음: 전사가 끝나자 초안까지 이어짐(dr wait → ok · 잠근 초안)', !!jd && !!(await admin('plaud/' + UID + '/draft/' + ID('j'))), [jd, home2.log().slice(-300)]);
    const md = await until(async () => { const d = await job('m'); return d && d.st === 'done' && d; }, 90000);
    await sleep(2500);
    ok('⑳ 전사까지 고른 녹음: 전사까지만 — 초안 없음', !!md && !('dr' in (await job('m'))) && !(await admin('plaud/' + UID + '/draft/' + ID('m'))), md);
    // 오래 걸리는 전사(whisper) 한 건으로: 전사 중 줄의 진행 % · 남은 시간(Mac 이 알린 '전사 중 n분째 (p%)' 로) · 골라진 줄(할 것)을 누르면 뺌 — 미리 적은 dr wait 도 지움
    fs.writeFileSync(path.join(tmp, 'wmode'), '90000');
    await pg.click('[data-act="tab"][data-k="new"]'); await until(() => pg.$(sel('n')), 20000);
    await pg.click(sel('n')); await pg.click('.selbar [data-act="commit"][data-d="1"]');
    await pg.click('[data-act="tab"][data-k="todo"]');
    const prog = await until(async () => { const t = await pg.textContent(sel('n')).catch(() => ''); return /전사 중 \d+% · .+ 남음/.test(t) && t; }, 90000);
    ok('⑳ 전사 중인 줄에 진행 %와 남은 예상 시간(\'전사 중 25% · 1분 남음\' 꼴)', !!prog, prog);
    await pg.click(sel('n'));
    const no = await until(async () => { const d = await job('n'); return d && d.pick === 'out' && d; }, 8000);
    ok('⑳ 골라진 줄을 누르면 뺌(pick out) · 미리 적은 dr wait 도 지움', !!no && !('dr' in no), no);
    fs.writeFileSync(path.join(tmp, 'wmode'), '400');
    // ㉑ (P4e) 전사까지만 키워드 — 메뉴 둘째 칸 · 같은 말을 양쪽에 넣으면 알림 · 그 녹음은 전사만(dr 없음)
    await pg.click('[data-act="menu"]'); await until(() => pg.$('#kw-in-kwt'), 10000);
    ok('㉑ 메뉴 키워드 칸 둘: \'초안까지 자동\' · \'전사까지만 자동\'', /초안까지 자동/.test(await pg.textContent('#pane')) && /전사까지만 자동/.test(await pg.textContent('#pane')) && !!(await pg.$('#kw-in-kw')));
    await pg.fill('#kw-in-kwt', '심방'); await pg.click('#pane [data-act="kwadd"][data-k="kwt"]');
    const dup = await until(async () => { const t = await pg.$('.toast'); return t && (await t.textContent()); }, 5000);
    ok('㉑ 같은 말(심방)을 전사까지만에도 넣으려 하면 알림 · 계정엔 안 씀', /초안까지 자동/.test(dup || '') && /한쪽에만/.test(dup || '') && !(await admin('plaud/' + UID)).kwt, dup);
    await sleep(3500);
    await pg.fill('#kw-in-kwt', '회의'); await pg.click('#pane [data-act="kwadd"][data-k="kwt"]');
    ok('㉑ 전사까지만 키워드가 계정 설정 kwt 에', !!(await until(async () => { const d = await admin('plaud/' + UID); return d && Array.isArray(d.kwt) && d.kwt.join() === '회의'; }, 8000)));
    await pg.keyboard.press('Escape'); await sleep(300);
    const R6 = JSON.parse(fs.readFileSync(RECF, 'utf8')); R6.push([ID('o'), '11-20 지어낸 교역자 회의', '2026-11-20T05:00:00', '4m00s', PT2]); fs.writeFileSync(RECF, JSON.stringify(R6));
    await userAdd(hb.idToken, 'plaud/' + UID + '/cmd', { mac: '집', what: 'refresh', st: 'new', at: Date.now() });
    // 줄 아래 글 — 전사가 곧 끝나 '할 것' 에 머무는 때가 짧아, 그 녹음 줄을 '아직 안 맡음' 으로 그려 본다(같은 recHtml)
    const oSub = await until(() => pg.evaluate(id => { const r = listView(S.recs, {}, settings(), now()).find(x => x.id === id); if (!r) return ''; const d = document.createElement('div'); d.innerHTML = recHtml(r); return /키워드 '회의' · 전사까지/.test(d.textContent) && d.textContent; }, ID('o')), 40000);
    const oDone = await until(async () => { const d = await job('o'); return d && d.st === 'done' && d; }, 60000);
    await sleep(3000);
    ok('㉑ 전사까지만 키워드 녹음: 저절로 골라 전사(줄 아래 \'키워드 회의 · 전사까지\') · 초안 없음(dr 없음 · draft 없음)', !!oDone && !('dr' in (await job('o'))) && !(await admin('plaud/' + UID + '/draft/' + ID('o'))), [oSub, oDone]);
    ok('㉑ 할 것 줄 아래 작은 글자 \'키워드 회의 · 전사까지\'', !!oSub, oSub);
    // ㉑ 규칙 옛 판 흉내(P4 앞 — Mac 소식에 aik · aim 이 없고 use 칸이 없음): 소식은 새 칸을 빼고 다시 적고 Mac 카드에 알림 · 초안은 그대로 · 사용량은 못 적음
    const RULES_NOW = fs.readFileSync(path.join(HERE, 'plaud.rules'), 'utf8').replace('match /databases/{database}/documents {', 'match /databases/{database}/documents {\n    match /users/{uid}/data/care { allow read: if request.auth != null && request.auth.uid == uid; }');
    const RULES_OLD_TXT = RULES_NOW.replace("'listed', 'aik', 'aim'])", "'listed'])").replace(/      \/\/ 이번 달 AI 사용량[\s\S]*?\n      \}\n/, '');
    const putRules = t => fetch(FS + '/emulator/v1/projects/' + PROJECT + ':securityRules', { method: 'PUT', body: JSON.stringify({ rules: { files: [{ content: t }] } }) });
    const pr = await putRules(RULES_OLD_TXT);
    ok('㉑ (흉내) 옛 판 규칙을 실음', RULES_OLD_TXT !== RULES_NOW && !/match \/use\/\{m\}/.test(RULES_OLD_TXT) && pr.ok, [RULES_OLD_TXT !== RULES_NOW, pr.status, pr.ok ? '' : await pr.text()]);
    const useBefore = JSON.stringify(await admin('plaud/' + UID + '/use/' + MK));
    await adminPatch('plaud/' + UID + '/job/' + ID('j'), { dr: 'wait' });
    const jOld = await until(async () => { const d = await job('j'); const m = await admin('plaud/' + UID + '/mac/집'); return d && d.dr === 'ok' && m && /보안 규칙이 옛 판입니다/.test(m.err || '') && [d, m]; }, 40000);
    ok('㉑ 옛 판 규칙: 초안은 그대로 만들어짐 · Mac 소식은 새 칸(aik · aim)을 빼고 적힘(꺼짐 아님) · 알림 \'보안 규칙이 옛 판입니다 — 다시 붙여 주세요\'', !!jOld && !('aik' in jOld[1]) && !('aim' in jOld[1]) && jOld[1].at > Date.now() - 60e3, jOld && jOld[1]);
    ok('㉑ 옛 판 규칙: 사용량은 못 적음(그대로) — 초안 흐름은 막히지 않음', JSON.stringify(await admin('plaud/' + UID + '/use/' + MK)) === useBefore);
    const card = await until(async () => { const t = await pg.textContent('#main .macs').catch(() => ''); return /보안 규칙이 옛 판입니다 — 다시 붙여 주세요/.test(t) && /켜짐/.test(t) && t; }, 15000);
    ok('㉑ 계기판 Mac 카드: 켜짐 + \'보안 규칙이 옛 판입니다 — 다시 붙여 주세요\'', !!card, (await pg.textContent('#main .macs').catch(() => '')).slice(0, 300));
    await putRules(RULES_NOW);
    ok('⑨ 계기판 화면 오류 없음', errs.length === 0, errs);
  } finally { await browser.close(); }
} catch (e) { bad++; console.log('  ✗ 도중에 멈춤', e && e.stack); }
finally { kids.forEach(killGroup); site.close(); aiSrv.close(); }
console.log(`결과: 통과 ${n - bad} / 실패 ${bad}`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
