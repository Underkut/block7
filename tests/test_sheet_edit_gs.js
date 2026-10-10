// 시트 편집 문 — 구글 앱스 스크립트 웹 앱 (sheet-edit/Code.gs) · R-4b (HB 2026-10-10)
//
// HB: "전체화면에 뿌리는 내용을 모두 보여 주고 각각 고칠 수 있는 팝업. 저장하면 구글 시트에
//      적용되면 시트 앱을 굳이 띄우지 않아도 된다." → "두 탭 모두 고쳐줘. 앱스 스크립트 설치 안내해줘."
//
// 이 스크립트는 HB 의 구글 시트에 **직접 쓴다.** 그래서 안전장치를 하나하나 돌려 본다:
//   · HB 로그인 표가 아니면 아무것도 안 한다 (주소가 새어도)
//   · 행은 값으로 찾고 딱 하나여야 한다 — 행 번호만 믿지 않는다
//   · 고치기 전 값이 하나라도 다르면 **아무것도 안 고친다**
//   · 머리글 · ID 열 · 수식 칸은 못 고친다 · 행을 만들거나 지우지 않는다 · 상한
//   · 날짜는 날짜로, 글자는 시트가 숫자·날짜·수식으로 바꾸지 못하게 글자 그대로
// 구글 쪽(시트 · 로그인 확인 · 잠금)은 흉내 낸다. 시트 흉내는 2026-10-10 실제 시트의 머리글 그대로.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const CODE = fs.readFileSync(path.join(__dirname, '..', 'sheet-edit', 'Code.gs'), 'utf-8');

// ══ 구글 흉내 ══════════════════════════════════════════════════════════
const TZ_OFF = { 'Asia/Seoul': 9, 'UTC': 0, 'America/Los_Angeles': -7 };
const pad = n => String(n).padStart(2, '0');
const dayOf = (d, tz) => { const x = new Date(d.getTime() + TZ_OFF[tz] * 3600000); return [x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()]; };
const kday = (y, m, d, tz = 'Asia/Seoul') => new Date(Date.UTC(y, m - 1, d) - TZ_OFF[tz] * 3600000);   // 시트 시간대의 그날 0시

// 시트에 글자를 넣으면 시트가 알아서 바꾸는 것 (사람이 칸에 칠 때와 같다)
function sheetsParse(s, tz) {
  if (s.startsWith("'")) return { v: s.slice(1) };
  if (s.startsWith('=') || /^[+-]\D/.test(s)) return { v: '#ERROR!', f: s };
  let m;
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) return { v: Number(s) };
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return { v: Number(s.replace(/,/g, '')) };
  if ((m = s.match(/^(\d{4})[-./]\s?(\d{1,2})[-./]\s?(\d{1,2})\.?$/))) return { v: kday(+m[1], +m[2], +m[3], tz), fmt: 'yyyy-mm-dd' };
  if ((m = s.match(/^(\d{1,2})[/-](\d{1,2})$/))) return { v: kday(2026, +m[1], +m[2], tz), fmt: 'M/d' };
  if ((m = s.match(/^(\d{1,2}):(\d{2})$/))) return { v: new Date(Date.UTC(1899, 11, 30, +m[1], +m[2])), fmt: 'h:mm:ss' };
  if (/^(true|false)$/i.test(s)) return { v: /^true$/i.test(s) };
  return { v: s };
}
function shownOf(cell, tz) {
  const v = cell.v;
  if (v === '' || v == null) return '';
  if (v instanceof Date) {
    if (cell.fmt === 'h:mm:ss') return `${v.getUTCHours()}:${pad(v.getUTCMinutes())}:00`;
    const [y, m, d] = dayOf(v, tz);
    if (cell.fmt === 'yyyy-mm-dd') return `${y}-${pad(m)}-${pad(d)}`;
    if (cell.fmt === 'M/d') return `${m}/${d}`;
    return `${y}. ${m}. ${d}`;   // 서식이 없으면 (한국어 시트의 기본 날짜 모양)
  }
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return String(v);
}
let FLUSHES = 0, WRITES = [];
// 구글 쪽 오류 흉내 — FAIL(탭, 행, 열, 값) 이 참이면 그 쓰기에서 던진다. FAIL_ALL 이면 모든 쓰기가.
// FAIL_READ 면 쓰기가 한 번이라도 있은 뒤의 읽기가 던진다.
let FAIL = null, FAIL_ALL = false, FAIL_READ = false;
const BOOM = () => { throw new Error('Service Spreadsheets failed while accessing document with id x.'); };
function makeSheet(ss, gid, name, rows) {
  // rows: 2차원 — 칸은 글자 · 숫자 · Date · {v,f,fmt,dv}
  const cells = rows.map(r => r.map(x => (x && typeof x === 'object' && !(x instanceof Date)) ? Object.assign({ fmt: 'General' }, x)
    : { v: x == null ? '' : x, fmt: x instanceof Date ? 'yyyy-mm-dd' : 'General' }));
  const at = (r, c) => {   // 1부터 센다
    while (cells.length < r) cells.push([]);
    const row = cells[r - 1];
    while (row.length < c) row.push({ v: '', fmt: 'General' });
    return row[c - 1];
  };
  const sh = {
    cells, getSheetId: () => gid, getName: () => name,
    getLastRow() { for (let r = cells.length; r >= 1; r--) if (cells[r - 1].some(x => x.v !== '' || x.f)) return r; return 0; },
    getLastColumn() { let n = 0; cells.forEach(r => r.forEach((x, i) => { if (x.v !== '' || x.f) n = Math.max(n, i + 1); })); return n; },
    getRange(r, c, nr = 1, nc = 1) {
      const grid = f => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => f(at(r + i, c + j))));
      return {
        getDisplayValues: () => { if (FAIL_READ && WRITES.length) BOOM(); return grid(x => shownOf(x, ss.tz)); },
        getValues: () => grid(x => x.v),
        getFormulas: () => grid(x => x.f || ''),
        getDataValidations: () => grid(x => x.dv || null),
        getValue: () => at(r, c).v,
        setValue(val) {
          if (FAIL_ALL || (FAIL && FAIL(name, r, c, val))) BOOM();
          const x = at(r, c);
          WRITES.push([name, r, c, val instanceof Date ? 'Date' : val]);
          delete x.f;
          if (typeof val === 'string') { const p = sheetsParse(val, ss.tz); x.v = p.v; if (p.f) x.f = p.f; if (p.fmt && x.fmt === 'General') x.fmt = p.fmt; }
          else x.v = val;
          return this;
        },
        setNumberFormat(f) { at(r, c).fmt = f; return this; },
        getNumberFormat: () => at(r, c).fmt,
      };
    },
  };
  return sh;
}
const SHEETS = {};
function makeSs(id, tz, tabs) {
  const ss = { id, tz, getSpreadsheetTimeZone: () => ss.tz };
  ss.sheets = tabs.map(([gid, name, rows]) => makeSheet(ss, gid, name, rows));
  ss.getSheets = () => ss.sheets;
  SHEETS[id] = ss;
  return ss;
}
const SpreadsheetApp = {
  openById(id) { if (!SHEETS[id]) throw new Error('파일을 찾을 수 없음: ' + id); return SHEETS[id]; },
  flush() { FLUSHES++; },
  DataValidationCriteria: { VALUE_IN_LIST: 'VALUE_IN_LIST', VALUE_IN_RANGE: 'VALUE_IN_RANGE' },
};
const b64 = s => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sbytes = buf => Array.from(buf).map(b => (b > 127 ? b - 256 : b));
const ubuf = bytes => Buffer.from(bytes.map(b => b & 255));
const Utilities = {
  DigestAlgorithm: { SHA_256: 'sha256' },
  computeDigest: (alg, s) => sbytes(crypto.createHash(alg).update(s, 'utf8').digest()),
  base64EncodeWebSafe: bytes => ubuf(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
  base64Decode: s => { if (/[^A-Za-z0-9+/=]/.test(s) || s.length % 4) throw new Error('Could not decode string.'); return sbytes(Buffer.from(s, 'base64')); },
  newBlob: bytes => ({ getDataAsString: () => ubuf(bytes).toString('utf8') }),
  formatDate(d, tz, fmt) { if (fmt !== 'yyyy-M-d') throw new Error('흉내에 없는 모양 ' + fmt); return dayOf(d, tz).join('-'); },
  parseDate(s, tz, fmt) { if (fmt !== 'yyyy-M-d') throw new Error('흉내에 없는 모양 ' + fmt); const [y, m, d] = s.split('-').map(Number); return kday(y, m, d, tz); },
};
// 로그인 확인 (identitytoolkit accounts:lookup) — 토큰 → 계정
let NOW = Date.UTC(2026, 9, 10, 12, 0, 0);
const USERS = {}, FETCHES = [];
let LOOKUP_DOWN = false;
function token(o) {   // 파이어베이스 ID 토큰 모양 (가운데 토막에 이름표)
  const claims = Object.assign({ aud: 'block7-8f24e', iss: 'https://securetoken.google.com/block7-8f24e',
    sub: 'uid-hb', exp: Math.floor(NOW / 1000) + 3600, email: 'denartist@gmail.com' }, o || {});
  const t = b64(JSON.stringify({ alg: 'RS256', kid: 'k1' })) + '.' + b64(JSON.stringify(claims)) + '.' + 'x'.repeat(342);
  return t;
}
const UrlFetchApp = {
  fetch(url, opt) {
    FETCHES.push(url);
    const resp = (code, body) => ({ getResponseCode: () => code, getContentText: () => JSON.stringify(body) });
    if (LOOKUP_DOWN) return resp(503, { error: { message: 'UNAVAILABLE' } });
    if (!/^https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup\?key=AIza/.test(url) || opt.method !== 'post') return resp(404, {});
    const u = USERS[JSON.parse(opt.payload).idToken];
    return u ? resp(200, { kind: 'identitytoolkit#GetAccountInfoResponse', users: [u] }) : resp(400, { error: { message: 'INVALID_ID_TOKEN' } });
  },
};
const CACHE = new Map();
const CacheService = { getScriptCache: () => ({
  get: k => { const e = CACHE.get(k); return e && e.until > NOW ? e.v : null; },
  put: (k, v, s) => { if (k.length > 250) throw new Error('key too long'); CACHE.set(k, { v, until: NOW + s * 1000 }); },
}) };
let LOCK_BUSY = false, LOCKS = 0, UNLOCKS = 0;
const LockService = { getScriptLock: () => ({ tryLock: () => { if (LOCK_BUSY) return false; LOCKS++; return true; }, releaseLock: () => { UNLOCKS++; } }) };
const ContentService = { MimeType: { JSON: 'application/json' },
  createTextOutput: s => ({ s, setMimeType(m) { this.m = m; return this; } }) };
const HtmlService = { createHtmlOutput: h => ({ h, setTitle(t) { this.t = t; return this; } }) };
const RealNow = Date.now;
Date.now = () => NOW;

const GS = new Function('SpreadsheetApp', 'Utilities', 'UrlFetchApp', 'CacheService', 'LockService', 'ContentService', 'HtmlService',
  CODE + '\n;return { doGet, doPost, parseDay_, norm_ };')(SpreadsheetApp, Utilities, UrlFetchApp, CacheService, LockService, ContentService, HtmlService);
function call(req) {
  const out = GS.doPost({ postData: { contents: typeof req === 'string' ? req : JSON.stringify(req) } });
  if (out.m !== 'application/json') throw new Error('JSON 으로 돌려주지 않았다');
  return JSON.parse(out.s);
}

// ══ 시트 흉내 — 2026-10-10 실제 머리글 ═════════════════════════════════════
const DB_HEAD = ['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','인용 본문',
  '명제','대표 문구 1','대표 문구 2','분류','대표 명제','핵심 주제','주제 태그','조직신학',
  '성경신학/구속사','성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치',
  '한 줄 요약','원문 상태','관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
const SH_HEAD = ['주제','상황/필요','명제','본문','분류','묵상 질문','설교 제목','날짜','명제 ID',
  '공개 여부','검수 상태','공개 제목','공개 해설','기도문','공유 슬러그','공개 순서'];
const LIST_HEAD = ['날짜','카테고리','설교 제목','설교자','영상 링크','영상 시각','주요 본문','핵심 주제'];
const TXT = id => '명제 본문 ' + id + ' — 빛과 소금으로 사는 제자';
const rowOf = (head, o) => head.map(h => (h in o ? o[h] : ''));
const PROP = '1fDVyeYIxd4gEGK2s5OEzG6kmxRPbabBEzJ5uEpL';   // 흉내 파일 id (실제 id 모양)
const VERSES = '1qkH4pWmuCAjtWuVIz1XIN6niUkCollw7YIlI5pk';
function fresh() {
  for (const k in SHEETS) delete SHEETS[k];
  WRITES = []; FLUSHES = 0; LOCK_BUSY = false; LOOKUP_DOWN = false; FAIL = null; FAIL_ALL = false; FAIL_READ = false;
  const db = ['P0001', 'P0002', 'P0003', 'P0004', 'P0005'].map((id, i) => rowOf(DB_HEAD, {
    '명제 ID': id, '날짜': kday(2026, 6, 21 + (i > 2 ? 7 : 0)), '카테고리': '주일예배', '설교 제목': '언덕 위의 도시',
    '설교 본문': '마태복음 5:13-16', '명제': TXT(id), '대표 문구 1': '빛과 소금', '주제 태그': '제자도',
    '상황 태그': '흔들릴 때', '데이터 상태': '활성' }));
  const share = [['P0004', { v: kday(2026, 6, 28), fmt: 'yyyy-mm-dd' }], ['P0001', '2026-07-19'], ['P0003', { v: '2026-06-21', fmt: 'yyyy-mm-dd' }]]
    .map(([id, d]) => rowOf(SH_HEAD, { '주제': '정체성', '상황/필요': '흔들릴 때', '명제': TXT(id), '본문': '마태복음 5:13-16',
      '묵상 질문': '오늘 나는?', '설교 제목': '언덕 위의 도시', '날짜': d, '명제 ID': id, '공개 순서': 3 }));
  const list = [rowOf(LIST_HEAD, { '날짜': kday(2026, 6, 19), '카테고리': '인카운터', '설교 제목': '치유와 생명의 연합',
    '영상 링크': 'http://www.youtube.com/watch?v=pVIJ74s1xTM' }),
    rowOf(LIST_HEAD, { '날짜': kday(2026, 6, 21), '카테고리': '주일예배', '설교 제목': '언덕 위의 도시', '영상 링크': '유튜브 미업로드' })];
  makeSs(PROP, 'Asia/Seoul', [[0, '명제 DB', [DB_HEAD].concat(db)], [222, '설교 목록', [LIST_HEAD].concat(list)],
    [777, '성도 공유용', [SH_HEAD].concat(share)],
    [999, '계산', [['명제 ID', '합계', '메모'], ['P0001', { v: 3, f: '=LEN(A2)' }, '손으로 쓴 메모'], ['P0002', 4, '']]],
    [998, '펼친 수식', [[{ v: '명제 ID', f: '={"명제 ID";ARRAYFORMULA(\'명제 DB\'!A2:A6)}' }, '메모'], ['P0001', ''], ['P0002', '']]]]);
  // 말씀 시트 — 제목 줄이 머리글 위에 있다 (머리글은 2행)
  makeSs(VERSES, 'Asia/Seoul', [[5, '암송', [['2026 암송 말씀'], ['카테고리','주제','본문','장절','태그','날짜','강조 문구'],
    ['주일예배','사랑','하나님이 세상을 이처럼 사랑하사','요한복음 3:16','사랑','2026-01-04',''],
    ['주일예배','믿음','믿음은 바라는 것들의 실상이요','히브리서 11:1','믿음','2026-01-11',''],
    ['새벽','사랑','하나님이 세상을 이처럼 사랑하사','요한복음 3:16','다시','2026-02-01','']]]]);
  // HB 계정 · 다른 계정 · 정지된 계정
  for (const k in USERS) delete USERS[k];
  CACHE.clear(); FETCHES.length = 0;
}
const HB = () => { const t = token(); USERS[t] = { localId: 'uid-hb', email: 'denartist@gmail.com', emailVerified: false }; return t; };
const dump = id => JSON.stringify(SHEETS[id].sheets.map(s => s.cells.map(r => r.map(x => [x.v instanceof Date ? 'D' + x.v.getTime() : x.v, x.f || '', x.fmt]))));
const cellOf = (id, gid, r, c) => SHEETS[id].sheets.find(s => s.getSheetId() === gid).cells[r - 1][c - 1];
const shown = (id, gid, r, c) => shownOf(cellOf(id, gid, r, c), SHEETS[id].tz);
const colN = (head, name) => head.indexOf(name) + 1;

// ══ 1. 누가 불렀나 ══════════════════════════════════════════════════════
console.log('시나리오 1 — HB 로그인 표가 아니면 아무것도 안 한다');
{
  fresh();
  sc.eq('표 없이', call({ op: 'ping' }).error, 'auth');
  sc.eq('표 모양이 아니면', call({ op: 'ping', token: 'x'.repeat(300) }).error, 'auth');
  sc.eq('구글에 묻기 전에 걸렀다 (아무 글자로 구글 호출량을 쓰게 하지 않는다)', FETCHES.length, 0);
  const t = HB();
  const r = call({ op: 'ping', token: t });
  sc.eq('HB 표면 통과 — 누구인지와 버전', [r.ok, r.who, r.v], [true, 'denartist@gmail.com', 1]);
  sc.eq('구글에 한 번 물었다', FETCHES.length, 1);
  call({ op: 'ping', token: t });
  sc.eq('5분 안에는 다시 묻지 않는다', FETCHES.length, 1);
  NOW += 301000;
  call({ op: 'ping', token: t });
  sc.eq('5분이 지나면 다시 묻는다', FETCHES.length, 2);
  // ⚠️ HB 계정은 '미확인 메일' 이다 (앱은 확인 메일을 보낸 적이 없다) — 그래도 통과해야 한다
  sc.eq('확인 메일을 안 받은 HB 계정도 통과 (emailVerified 를 따지지 않는다)', USERS[t].emailVerified === false && r.ok, true);

  const other = token({ sub: 'uid-x', email: 'someone@gmail.com' });
  USERS[other] = { localId: 'uid-x', email: 'someone@gmail.com', emailVerified: true };
  sc.eq('다른 사람 표', call({ op: 'ping', token: other }).error, 'owner');
  const upper = token({ sub: 'uid-hb' });
  USERS[upper] = { localId: 'uid-hb', email: 'DenArtist@Gmail.com' };
  sc.eq('이메일 대소문자는 가리지 않는다', call({ op: 'ping', token: upper }).ok, true);
  const proj = token({ aud: 'other-project', iss: 'https://securetoken.google.com/other-project' });
  USERS[proj] = { localId: 'uid-hb', email: 'denartist@gmail.com' };
  const n0 = FETCHES.length;
  sc.eq('다른 파이어베이스 프로젝트의 표', [call({ op: 'ping', token: proj }).error, FETCHES.length - n0], ['auth', 0]);
  const audOnly = token({ aud: 'other-project' }), issOnly = token({ iss: 'https://securetoken.google.com/other-project' });
  USERS[audOnly] = USERS[issOnly] = { localId: 'uid-hb', email: 'denartist@gmail.com' };
  sc.eq('받는 곳(aud)만 달라도 · 발급처(iss)만 달라도', [call({ op: 'ping', token: audOnly }).error, call({ op: 'ping', token: issOnly }).error], ['auth', 'auth']);
  const swapped = token({ sub: 'uid-attacker' });
  USERS[swapped] = { localId: 'uid-hb', email: 'denartist@gmail.com' };
  sc.eq('표 안의 사람 번호와 구글이 답한 계정이 다르면', call({ op: 'ping', token: swapped }).error, 'auth');
  const old = token({ exp: Math.floor(NOW / 1000) - 10 });
  USERS[old] = { localId: 'uid-hb', email: 'denartist@gmail.com' };
  sc.eq('기한이 지난 표', call({ op: 'ping', token: old }).error, 'auth');
  const off = token({ sub: 'uid-off' });
  USERS[off] = { localId: 'uid-off', email: 'denartist@gmail.com', disabled: true };
  sc.eq('정지된 계정', call({ op: 'ping', token: off }).error, 'auth');
  const forged = token({ sub: 'uid-hb', exp: Math.floor(NOW / 1000) + 99999 });   // 구글이 모르는 표 (서명 위조)
  sc.eq('구글이 모르는 표 (서명이 틀린 것)', call({ op: 'ping', token: forged }).error, 'auth');
  fresh(); LOOKUP_DOWN = true;
  sc.eq('구글 확인이 안 되면 통과시키지 않는다', call({ op: 'ping', token: HB() }).error, 'auth');
  fresh();
  const before = dump(PROP);
  const r2 = call({ op: 'write', token: forged, id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': 'P0001' } },
    set: { '명제': { before: TXT('P0001'), value: '바꿔 버림' } } }] });
  sc.eq('표가 틀리면 쓰기 요청도 시트에 닿지 않는다', [r2.error, dump(PROP) === before, WRITES.length], ['auth', true, 0]);
  sc.eq('이상한 본문', [call('{oops').error, call('').error, call('x'.repeat(200001)).error], ['bad', 'bad', 'bad']);
  sc.eq('모르는 일', call({ op: 'drop', token: HB() }).error, 'bad');
  sc.eq('주소를 열면 살아 있다고 말한다', /살아 있어요/.test(GS.doGet().h), true);
}

// ══ 2. 읽기 ══════════════════════════════════════════════════════════════
console.log('\n시나리오 2 — 읽기: 명제 ID 로 두 탭의 그 행');
{
  fresh();
  const t = HB();
  const r = call({ op: 'read', token: t, id: PROP, tabs: [
    { gid: 0, find: { match: { '명제 ID': 'P0004' } } }, { gid: 777, find: { match: { '명제 ID': 'P0004' } } },
    { gid: 777, find: { match: { '명제 ID': 'P0002' } } }] });
  const [a, b, c] = r.tabs;
  sc.eq('명제 DB 의 5행', [a.ok, a.name, a.row, a.moved], [true, '명제 DB', 5, false]);
  sc.eq('머리글 31칸 그대로', a.heads, DB_HEAD);
  sc.eq('보이는 글자로 (날짜는 시트 모양 그대로)', [a.values[0], a.values[1], a.values[8]], ['P0004', '2026-06-28', TXT('P0004')]);
  sc.eq('칸 종류 — 명제 ID · 관련 명제 ID 는 못 고침, 날짜는 날짜', [a.kinds[0], a.kinds[1], a.kinds[8], a.kinds[25]], ['id', 'date', '', 'id']);
  sc.eq('성도 공유용은 그 탭의 2행 (탭마다 행이 다르다)', [b.name, b.row, b.values[2]], ['성도 공유용', 2, TXT('P0004')]);
  sc.eq('그 탭에 없는 명제는 그 탭만 "없음"', [c.ok, c.error, c.gid], [false, 'notfound', 777]);
  sc.eq('읽기는 아무것도 안 바꾼다', WRITES.length, 0);
  // 행 번호를 같이 주면 — 맞으면 그 행, 틀리면 다시 찾는다
  const hint = (row) => call({ op: 'read', token: t, id: PROP, tabs: [{ gid: 0, find: { row, match: { '명제 ID': 'P0003' } } }] }).tabs[0];
  sc.eq('행 번호가 맞으면 그 행', [hint(4).row, hint(4).moved], [4, false]);
  sc.eq('그사이 줄이 밀렸으면 다시 찾아 알려 준다', [hint(2).row, hint(2).moved], [4, true]);
  sc.eq('머리글 줄을 가리켜도 머리글은 아니다', [hint(1).row, hint(1).moved], [4, true]);
  sc.eq('없는 줄', [hint(500).row, hint(500).moved], [4, true]);
  // 말씀 시트 — 머리글이 2행 (위에 제목 줄)
  const v = call({ op: 'read', token: t, id: VERSES, tabs: [{ gid: 5, find: { row: 4, match: { '장절': '히브리서 11:1', '본문': '믿음은 바라는 것들의 실상이요' } } }] }).tabs[0];
  sc.eq('말씀 — 머리글이 2행이어도 장절+본문으로 그 행', [v.ok, v.row, v.values[3], v.kinds[5]], [true, 4, '히브리서 11:1', 'date']);
  const vr = find => call({ op: 'read', token: t, id: VERSES, tabs: [{ gid: 5, find }] }).tabs[0];
  sc.eq('머리글 줄은 값이 맞아도 고르지 않는다', vr({ row: 2, match: { '카테고리': '카테고리' } }).error, 'notfound');
  sc.eq('머리글 위 제목 줄도', vr({ row: 1, match: { '카테고리': '2026 암송 말씀' } }).error, 'notfound');
  const twice = call({ op: 'read', token: t, id: VERSES, tabs: [{ gid: 5, find: { match: { '장절': '요한복음 3:16' } } }] }).tabs[0];
  sc.eq('같은 장절이 두 줄이면 고르지 않는다', twice.error, 'ambiguous');
  const both = call({ op: 'read', token: t, id: VERSES, tabs: [{ gid: 5, find: { match: { '장절': '요한복음 3:16', '카테고리': '새벽' } } }] }).tabs[0];
  sc.eq('열을 더 주면 하나로 좁혀진다', [both.row, both.values[4]], [5, '다시']);
  // 설교 목록 — 날짜 모양이 달라도 같은 날
  const sl = call({ op: 'read', token: t, id: PROP, tabs: [{ gid: 222, find: { match: { '날짜': '2026. 6. 19', '카테고리': '인카운터' } } }] }).tabs[0];
  sc.eq('설교 목록 — 날짜 모양이 달라도(2026. 6. 19) 같은 날이면 찾는다', [sl.row, sl.values[4]], [2, 'http://www.youtube.com/watch?v=pVIJ74s1xTM']);
  // 수식 칸은 '수식' 으로 알려 준다
  const fx = call({ op: 'read', token: t, id: PROP, tabs: [{ gid: 999, find: { match: { '명제 ID': 'P0001' } } }, { gid: 998, find: { match: { '명제 ID': 'P0002' } } }] }).tabs;
  sc.eq('수식 칸 · 펼친 수식 아래 칸은 "수식"', [fx[0].kinds, fx[1].kinds], [['id', 'fx', ''], ['id', 'fx']]);
  // 잘못된 요청
  const bad = q => call(Object.assign({ op: 'read', token: t, id: PROP }, q));
  sc.eq('찾을 값 없이', bad({ tabs: [{ gid: 0, find: { row: 3 } }] }).tabs[0].error, 'bad');
  sc.eq('빈 값으로 찾기', bad({ tabs: [{ gid: 0, find: { match: { '명제 ID': '  ' } } }] }).tabs[0].error, 'bad');
  sc.eq('없는 열', bad({ tabs: [{ gid: 0, find: { match: { '없는 열': 'x' } } }] }).tabs[0].error, 'nohead');
  sc.eq('없는 탭', bad({ tabs: [{ gid: 4242, find: { match: { '명제 ID': 'P0001' } } }] }).tabs[0].error, 'notab');
  sc.eq('탭 번호 없이', bad({ tabs: [{ find: { match: { '명제 ID': 'P0001' } } }] }).tabs[0].error, 'bad');
  sc.eq('탭 4개는 한 번에 안 된다', bad({ tabs: [1, 2, 3, 4].map(() => ({ gid: 0, find: { match: { '명제 ID': 'P0001' } } })) }).error, 'bad');
  sc.eq('없는 파일', bad({ id: 'A'.repeat(40), tabs: [{ gid: 0, find: { match: { '명제 ID': 'P0001' } } }] }).error, 'nosheet');
  sc.eq('파일 id 모양이 아니면', bad({ id: '../x', tabs: [{ gid: 0, find: { match: { '명제 ID': 'P0001' } } }] }).error, 'bad');
}

// ══ 3. 쓰기 — 두 탭을 함께 ═══════════════════════════════════════════════
console.log('\n시나리오 3 — 쓰기: 명제 글을 두 탭 모두 (HB "두 탭 모두 고쳐줘")');
{
  fresh();
  const t = HB(), before = dump(PROP);
  const NEW = '고친 명제 — 소금과 빛의 제자도는 이름이 아니라 생명이다.';
  const r = call({ op: 'write', token: t, id: PROP, edits: [
    { gid: 0, find: { match: { '명제 ID': 'P0004' } }, set: { '명제': { before: TXT('P0004'), value: NEW }, '대표 문구 1': { before: '빛과 소금', value: '생명' } } },
    { gid: 777, find: { match: { '명제 ID': 'P0004' } }, set: { '명제': { before: TXT('P0004'), value: NEW }, '묵상 질문': { before: '오늘 나는?', value: '오늘 나는 무엇으로 사는가?' } } }] });
  sc.eq('고쳤다', r.ok, true);
  sc.eq('탭마다 그 행 · 고친 칸 · 지금 보이는 값',
    r.tabs.map(x => [x.name, x.row, x.wrote, x.values]),
    [['명제 DB', 5, ['명제', '대표 문구 1'], { '명제': NEW, '대표 문구 1': '생명' }],
     ['성도 공유용', 2, ['명제', '묵상 질문'], { '명제': NEW, '묵상 질문': '오늘 나는 무엇으로 사는가?' }]]);
  sc.eq('시트에도 그대로', [shown(PROP, 0, 5, 9), shown(PROP, 777, 2, 3), shown(PROP, 777, 2, 6)], [NEW, NEW, '오늘 나는 무엇으로 사는가?']);
  // 그 네 칸 말고는 한 칸도 안 바뀌었다
  const after = JSON.parse(dump(PROP)), was = JSON.parse(before);
  const diff = [];
  was.forEach((s, si) => s.forEach((row, ri) => row.forEach((x, ci) => {
    if (JSON.stringify(x) !== JSON.stringify(after[si][ri][ci])) diff.push(SHEETS[PROP].sheets[si].getName() + ' ' + (ri + 1) + '행 ' + (ci + 1) + '열');
  })));
  sc.eq('고친 네 칸 말고는 한 칸도 안 바뀌었다', diff, ['명제 DB 5행 9열', '명제 DB 5행 10열', '성도 공유용 2행 3열', '성도 공유용 2행 6열']);
  sc.eq('행 수가 그대로 (행을 만들거나 지우지 않는다)', SHEETS[PROP].sheets.map(s => s.getLastRow()), [6, 3, 4, 3, 3]);
  sc.eq('잠갔다가 풀었다', [LOCKS > 0, LOCKS === UNLOCKS], [true, true]);
  // 그대로인 칸은 건너뛴다
  WRITES = [];
  const same = call({ op: 'write', token: t, id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': 'P0001' } },
    set: { '명제': { before: TXT('P0001'), value: TXT('P0001') } } }] });
  sc.eq('바뀐 게 없으면 시트를 건드리지 않는다', [same.ok, same.tabs[0].wrote, WRITES.length], [true, [], 0]);
}

// ══ 4. 그사이 시트가 바뀌었으면 — 아무것도 안 고친다 ════════════════════════
console.log('\n시나리오 4 — 그사이 바뀐 칸이 하나라도 있으면 아무것도 안 고친다');
{
  fresh();
  const t = HB();
  cellOf(PROP, 777, 2, 3).v = 'HB 가 시트에서 직접 고친 글';   // 앱이 읽은 뒤 시트에서 고쳤다
  const before = dump(PROP);
  const r = call({ op: 'write', token: t, id: PROP, edits: [
    { gid: 0, find: { match: { '명제 ID': 'P0004' } }, set: { '명제': { before: TXT('P0004'), value: '새 글' } } },
    { gid: 777, find: { match: { '명제 ID': 'P0004' } }, set: { '명제': { before: TXT('P0004'), value: '새 글' } } }] });
  sc.eq('충돌이라고 알리고 지금 값을 돌려준다', [r.ok, r.error, r.conflicts], [false, 'conflict', [{ gid: 777, col: '명제', now: 'HB 가 시트에서 직접 고친 글' }]]);
  sc.eq('맞던 탭(명제 DB)도 안 고쳤다 — 반쯤 고쳐진 채로 남지 않게', [dump(PROP) === before, WRITES.length], [true, 0]);
  sc.eq('공백·줄바꿈 차이는 충돌로 치지 않는다', call({ op: 'write', token: t, id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': 'P0002' } },
    set: { '대표 문구 1': { before: '  빛과\n소금 ', value: '빛' } } }] }).ok, true);
  sc.eq('비어 있던 칸이라 했는데 값이 있으면 충돌', call({ op: 'write', token: t, id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': 'P0002' } },
    set: { '주제 태그': { before: '', value: '새 태그' } } }] }).error, 'conflict');
}

// ══ 5. 못 하는 것 ══════════════════════════════════════════════════════════
console.log('\n시나리오 5 — 일부러 못 하는 것: ID 열 · 수식 · 상한');
{
  fresh();
  const t = HB(), before = dump(PROP);
  const w = (edits) => call({ op: 'write', token: t, id: PROP, edits });
  const one = (set, gid = 0, id = 'P0001') => w([{ gid, find: { match: { '명제 ID': id } }, set }]);
  sc.eq('명제 ID 는 못 고친다', one({ '명제 ID': { before: 'P0001', value: 'P9999' } }).error, 'locked');
  sc.eq('관련 명제 ID 도 (ID 로 끝나는 열)', one({ '관련 명제 ID': { before: '', value: 'P0002' } }).error, 'locked');
  sc.eq('수식 칸은 못 고친다', one({ '합계': { before: '3', value: '7' } }, 999).error, 'formula');
  sc.eq('펼친 수식이 채운 칸도', one({ '명제 ID': { before: 'P0001', value: 'x' } }, 998).error, 'locked');
  const ok1 = { '명제': { before: TXT('P0001'), value: '새 글' } };
  sc.eq('하나라도 못 고치는 칸이 섞이면 나머지도 안 고친다', w([{ gid: 0, find: { match: { '명제 ID': 'P0001' } },
    set: Object.assign({}, ok1, { '명제 ID': { before: 'P0001', value: 'P9' } }) }]).error, 'locked');
  sc.eq('한 칸 5000자 넘게', one({ '명제': { before: TXT('P0001'), value: '가'.repeat(5001) } }).error, 'toolong');
  const many = {};
  DB_HEAD.slice(2, 25).forEach(h => { many[h] = { before: '', value: 'x' }; });
  sc.eq('칸 30개 넘게', w([{ gid: 0, find: { match: { '명제 ID': 'P0001' } }, set: many },
    { gid: 777, find: { match: { '명제 ID': 'P0001' } }, set: { '주제': { before: '', value: 'x' }, '본문': { before: '', value: 'x' },
      '분류': { before: '', value: 'x' }, '공개 제목': { before: '', value: 'x' }, '공개 해설': { before: '', value: 'x' },
      '기도문': { before: '', value: 'x' }, '공유 슬러그': { before: '', value: 'x' }, '검수 상태': { before: '', value: 'x' } } }]).error, 'toomany');
  sc.eq('탭 넷을 한 번에', w([0, 777, 222, 999].map(gid => ({ gid, find: { match: { '명제 ID': 'P0001' } }, set: ok1 }))).error, 'bad');
  sc.eq('같은 행을 두 번', w([{ gid: 0, find: { match: { '명제 ID': 'P0001' } }, set: ok1 }, { gid: 0, find: { row: 2, match: { '명제 ID': 'P0001' } }, set: ok1 }]).error, 'bad');
  sc.eq('before 없이 (무엇을 고치는지 모르는 쓰기)', one({ '명제': { value: '새 글' } }).error, 'bad');
  sc.eq('글자가 아닌 값', one({ '명제': { before: TXT('P0001'), value: 42 } }).error, 'bad');
  sc.eq('없는 열에 쓰기', one({ '새 열': { before: '', value: 'x' } }).error, 'nocol');
  sc.eq('없는 명제', w([{ gid: 0, find: { match: { '명제 ID': 'P0999' } }, set: ok1 }]).error, 'notfound');
  LOCK_BUSY = true;
  sc.eq('다른 저장이 오래 잡고 있으면 기다리다 그만둔다', one(ok1).error, 'busy');
  LOCK_BUSY = false;
  sc.eq('여기까지 시트는 한 칸도 안 바뀌었다', [dump(PROP) === before, WRITES.length], [true, 0]);
}

// ══ 6. 글자는 글자 그대로 · 날짜는 날짜로 ═══════════════════════════════════
console.log('\n시나리오 6 — 시트가 글자를 숫자·날짜·수식으로 바꾸지 못하게');
{
  fresh();
  const t = HB();
  const put = (col, value, id = 'P0002') => {
    const r = call({ op: 'read', token: t, id: PROP, tabs: [{ gid: 0, find: { match: { '명제 ID': id } } }] }).tabs[0];
    const c = r.heads.indexOf(col);
    const w = call({ op: 'write', token: t, id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': id } }, set: { [col]: { before: r.values[c], value } } }] });
    const cell = cellOf(PROP, 0, r.row, c + 1);
    return { ok: w.ok, error: w.error, shown: w.ok ? w.tabs[0].values[col] : null, raw: cell.v instanceof Date ? 'Date' : cell.v, f: cell.f || '' };
  };
  WRITES = [];
  sc.eq("'=' 로 시작해도 수식이 아니라 글자", put('비고', '=SUM(A1:A9) 같은 글'), { ok: true, shown: '=SUM(A1:A9) 같은 글', raw: '=SUM(A1:A9) 같은 글', f: '' });
  sc.eq("한 번이라도 수식으로 넣지 않는다 (IMPORTDATA 같은 것이 한 번 돌기만 해도 탈)", WRITES.map(w => w[3]), ["'=SUM(A1:A9) 같은 글"]);
  sc.eq("'-' 로 시작하는 글", put('비고', '- 첫째, 사랑').raw, '- 첫째, 사랑');
  sc.eq("'0123' 이 123 이 되지 않는다", put('비고', '0123').raw, '0123');
  sc.eq("'3:16' 이 시각이 되지 않는다", put('관련 암송말씀', '3:16').raw, '3:16');
  sc.eq("글자 칸의 '2026-06-21' 은 글자 그대로", put('비고', '2026-06-21').raw, '2026-06-21');
  sc.eq('…그리고 시트가 멋대로 바꾼 칸 서식(날짜 모양)도 원래대로', cellOf(PROP, 0, 3, 27).fmt, 'General');
  sc.eq("'TRUE' 도 글자 그대로", put('비고', 'TRUE').raw, 'TRUE');
  sc.eq("작은따옴표로 시작하는 글", put('비고', "'인용'").raw, "'인용'");
  sc.eq('보통 글은 한 번에', put('비고', '설교 후 기도').raw, '설교 후 기도');
  sc.eq('여러 줄 글', put('검토 메모', '첫 줄\n둘째 줄').raw, '첫 줄\n둘째 줄');
  sc.eq('지우기 (빈 칸으로)', put('대표 문구 2', '').raw, '');
  // 날짜
  const d = put('날짜', '2026. 7. 5');
  sc.eq('날짜 칸은 날짜로 — 시트 모양(yyyy-mm-dd)으로 보인다', [d.ok, d.raw, d.shown], [true, 'Date', '2026-07-05']);
  sc.eq('그 날 0시 (시트 시간대)', cellOf(PROP, 0, 3, 2).v.getTime(), kday(2026, 7, 5).getTime());
  sc.eq('날짜 아닌 것을 날짜 칸에', put('날짜', '다음 주일').error, 'baddate');
  sc.eq('없는 날', put('날짜', '2026-02-30').error, 'baddate');
  WRITES = [];
  sc.eq('모양만 다르고 같은 날이면 건드리지 않는다', [put('날짜', '2026년 7월 5일').ok, WRITES.length], [true, 0]);
  // 성도 공유용 — 글자로 적혀 있던 날짜 칸 (2026-10-10 기준 82칸)
  const r = call({ op: 'write', token: t, id: PROP, edits: [{ gid: 777, find: { match: { '명제 ID': 'P0001' } },
    set: { '날짜': { before: '2026-07-19', value: '2026-07-20' } } }] });
  const c = cellOf(PROP, 777, 3, 8);
  sc.eq('글자로 적혀 있던 날짜 칸도 날짜로 쓰고 같은 모양으로', [r.ok, c.v instanceof Date, c.fmt, r.tabs[0].values['날짜']], [true, true, 'yyyy-mm-dd', '2026-07-20']);
  // 숫자 칸 (공개 순서)
  const n = call({ op: 'write', token: t, id: PROP, edits: [{ gid: 777, find: { match: { '명제 ID': 'P0001' } },
    set: { '공개 순서': { before: '3', value: '5' } } }] });
  sc.eq('숫자 칸은 숫자로', [n.ok, cellOf(PROP, 777, 3, 16).v], [true, 5]);
  // 시간대가 다른 시트 — 그 시트의 날짜로
  fresh();
  SHEETS[PROP].tz = 'America/Los_Angeles';
  const la = call({ op: 'write', token: HB(), id: PROP, edits: [{ gid: 0, find: { match: { '명제 ID': 'P0001' } },
    set: { '날짜': { before: shown(PROP, 0, 2, 2), value: '2026-08-02' } } }] });
  sc.eq('시트 시간대가 달라도 그 날로', [la.ok, la.tabs[0].values['날짜']], [true, '2026-08-02']);
}

// ══ 7. 날짜 읽기 도구 ════════════════════════════════════════════════════
console.log('\n시나리오 7 — 날짜 모양');
{
  const P = GS.parseDay_;
  sc.eq('여러 모양', ['2026-06-21', '2026. 6. 21', '2026.6.21.', '2026/6/21', '26-6-21', '2026년 6월 21일', '2026년6월21일'].map(s => P(s)),
    Array(7).fill([2026, 6, 21]));
  sc.eq('날짜가 아닌 것', ['', '다음 주일', '2026-13-01', '2026-02-29', '6/21', '2026-06'].map(s => P(s)), Array(6).fill(null));
}

// ══ 7-2. 쓰는 도중 구글 쪽 오류 — 고친 칸을 되돌린다 (Codex 리뷰 PR #560) ═══════════════
console.log('\n시나리오 7-2 — 두 탭을 고치다 둘째 탭에서 구글 오류가 나면 첫 탭도 되돌린다');
{
  // 명제 DB(명제 글 · 날짜 칸 · 비어 있던 날짜 칸) → 성도 공유용(글자로 적힌 날짜 · 묵상 질문 ← 여기서 오류)
  const req = () => ({ op: 'write', token: HB(), id: PROP, edits: [
    { gid: 0, find: { match: { '명제 ID': 'P0004' } }, set: { '명제': { before: TXT('P0004'), value: '새 글' }, '날짜': { before: '2026-06-28', value: '2026-07-05' } } },
    { gid: 0, find: { match: { '명제 ID': 'P0005' } }, set: { '날짜': { before: '', value: '2026-08-09' } } },
    { gid: 777, find: { match: { '명제 ID': 'P0001' } }, set: { '날짜': { before: '2026-07-19', value: '2026-07-20' }, '묵상 질문': { before: '오늘 나는?', value: '새 질문' } } }] });
  const QCOL = SH_HEAD.indexOf('묵상 질문') + 1;
  // 비어 있던 날짜 칸 — 날짜를 넣으면 서식도 yyyy-mm-dd 로 바꾸므로 되돌릴 때 서식도 돌려야 한다
  const emptyDate = () => { const x = cellOf(PROP, 0, 6, 2); x.v = ''; x.fmt = 'General'; };
  fresh(); emptyDate();
  const before = dump(PROP), locks = LOCKS;
  let once = true;   // 잠깐의 구글 오류 — 한 번 던지고 그다음엔 된다 (되돌리기는 된다)
  FAIL = (name, r, c) => { if (once && name === '성도 공유용' && c === QCOL) { once = false; return true; } return false; };
  const r = call(req());
  sc.eq('저장 못 했다고 알린다 (되돌렸으니 바뀐 칸 없음)', [r.ok, r.error, r.cells], [false, 'failed', []]);
  sc.eq('앞서 고친 칸들(명제 DB 명제·날짜·빈 날짜 · 성도 공유용 날짜)이 값도 서식도 원래대로', dump(PROP) === before, true);
  sc.eq('글자로 적혀 있던 날짜 칸은 다시 글자 · 서식도 그대로', [cellOf(PROP, 777, 3, 8).v, cellOf(PROP, 777, 3, 8).fmt], ['2026-07-19', 'General']);
  sc.eq('비어 있던 날짜 칸은 다시 비고 · 서식도 그대로', [cellOf(PROP, 0, 6, 2).v, cellOf(PROP, 0, 6, 2).fmt], ['', 'General']);
  sc.eq('잠금은 풀었다', LOCKS - locks === 1 && LOCKS === UNLOCKS, true);
  // 되돌리기마저 안 되면 — 바뀌었을 수 있는 칸을 알려 준다 (앱이 그 행을 다시 읽는다)
  fresh(); emptyDate();
  FAIL = (name, r, c) => { if (name === '성도 공유용' && c === QCOL) { FAIL_ALL = true; return true; } return false; };
  const p = call(req());
  sc.eq('되돌리기도 못 하면 "일부만 바뀌었을 수 있음" 과 그 칸들', [p.ok, p.error, p.cells], [false, 'partial', [
    { gid: 0, row: 5, col: '명제' }, { gid: 0, row: 5, col: '날짜' }, { gid: 0, row: 6, col: '날짜' },
    { gid: 777, row: 3, col: '날짜' }, { gid: 777, row: 3, col: '묵상 질문' }]]);
  // 다 쓴 뒤 '고친 뒤 모양' 만 못 읽었으면 — 저장은 된 것이다
  fresh(); emptyDate();
  FAIL_READ = true;
  const q = call(req());
  sc.eq('다 썼는데 고친 뒤 모양을 못 읽었을 뿐이면 "저장됨"', [q.ok, q.tabs.map(t => t.wrote)], [true, [['명제', '날짜'], ['날짜'], ['날짜', '묵상 질문']]]);
  sc.eq('…시트에는 실제로 다 들어갔다', [shown(PROP, 0, 5, 9), shown(PROP, 0, 5, 2), shown(PROP, 777, 3, 8), shown(PROP, 777, 3, 6)],
    ['새 글', '2026-07-05', '2026-07-20', '새 질문']);
}

// ══ 8. 앱 ↔ 문 — 앱(index.html)이 보내는 모양 그대로 문이 알아듣는가 ═══════════════
// 앱 쪽 [연결 확인] 을 그대로 떠 와서, fetch 를 이 문(doPost)에 바로 잇는다.
(async () => {
  console.log('\n시나리오 8 — 앱의 [연결 확인] 이 실제 문과 말이 통한다');
  const { slice } = require('./_load');
  fresh();
  const tk = HB();
  const ST = { settings: {} };
  const EL = { sheetEditUrlInput: { value: 'https://script.google.com/macros/s/AKfycbz1234567890abcdefghijklmnopqrstuvwxyzABCD/exec' },
               sheetEditStatus: { textContent: '', style: {} } };
  const bodies = [];
  const env = {
    ST, save: () => {}, document: { getElementById: id => EL[id] || null },
    firebase: { auth: () => ({ currentUser: { getIdToken: async () => tk } }) },
    getVerseCollections: () => [{ verses: [{ pid: 'P0004' }] }],
    _sheetUrlForVerse: () => ({ url: `https://docs.google.com/spreadsheets/d/${PROP}/edit#gid=0&range=A5:G5` }),
    fetch: async (url, opt) => {
      bodies.push(opt.body);
      const out = GS.doPost({ postData: { contents: opt.body } });   // 문 그대로
      return { json: async () => JSON.parse(out.s) };
    },
    AbortController: class { constructor() { this.signal = {}; } abort() {} },
    setTimeout: () => 0, clearTimeout: () => {},
  };
  const code = slice('// ══ 시트 편집 문 — 구글 앱스 스크립트 웹 앱', 'function _vgOpenFromReels(kind){');
  const app = new Function(...Object.keys(env), code + '\n;return { sheetEditCheck, SHEET_EDIT_VER };')(...Object.values(env));
  await app.sheetEditCheck();
  sc.eq('연결됐어요 — 명제 DB 의 그 행을 읽었다', EL.sheetEditStatus.textContent,
    "연결됐어요 ✓ denartist@gmail.com · '명제 DB' 5행(P0004)을 읽었어요 (문 v1)");
  sc.eq('앱이 보낸 것은 글자 본문 둘 (인사 · 읽기)', bodies.map(b => JSON.parse(b).op), ['ping', 'read']);
  sc.eq('앱이 기대하는 문 버전이 저장소의 Code.gs 보다 높지 않다 (높으면 HB 가 배포할 코드가 없다)',
    app.SHEET_EDIT_VER <= +(CODE.match(/var VERSION = (\d+);/) || [])[1], true);
  sc.eq('읽기만 했다 — 시트는 그대로', WRITES.length, 0);
  Date.now = RealNow;
  sc.done();
})();
