/**
 * BLOCK7 · Sweeter — 시트 편집 문 (구글 앱스 스크립트 웹 앱)  v1
 * ─────────────────────────────────────────────────────────────────────
 * 앱 안 편집 창이 HB 의 구글 시트 칸을 고칠 때 거치는 문이다 (docs/ROADMAP.md R-4).
 * 설치: https://block7.my/sheet-edit/ 의 안내대로 (PC 에서 5분).
 *
 * ⚠️ 이 파일을 고치면 HB 가 '배포 → 배포 관리 → 연필 → 버전: 새 버전 → 배포' 를 다시 해야
 *    새 코드가 돈다. 그래서 처음부터 넉넉히 만들었다 — 고칠 일을 줄이려고.
 *
 * 안전장치 — 하나도 빼지 말 것
 *  · 부르는 사람: 파이어베이스 로그인 표(ID 토큰)를 구글에 물어 **HB 일 때만** 움직인다.
 *    주소가 새어도 HB 로그인 없이는 아무것도 못 한다.
 *  · 행은 **값으로**(match) 찾고 딱 한 행이어야 한다. 행 번호만으로는 찾지 않는다
 *    (그사이 HB 가 줄을 끼우거나 정렬했을 수 있다).
 *  · 고치기 전 값(before)이 지금 칸과 **하나라도** 다르면 **아무것도 안 고친다**.
 *  · 행을 만들거나 지우지 않는다. 머리글 줄 · 이름이 'ID' 로 끝나는 열 · 수식 칸은 안 고친다.
 *  · 한 번에 탭 3개 · 칸 30개 · 한 칸 5000자까지.
 *
 * 부르는 법 (앱 → 이 문): POST, 본문은 JSON 글자 (Content-Type 을 붙이지 않는다 —
 * 붙이면 브라우저가 미리 묻기(preflight)를 하는데 앱스 스크립트는 그것을 못 받는다).
 *   {op:'ping',  token}
 *   {op:'read',  token, id, tabs:[{gid, find:{match:{'명제 ID':'P0333'}, row?}}]}
 *   {op:'write', token, id, edits:[{gid, find:{…}, set:{'명제':{before:'옛 글', value:'새 글'}}}]}
 * 돌려주는 것: {ok:true, v, …} 또는 {ok:false, v, error:'…', detail}
 */

var OWNER = 'denartist@gmail.com';     // 이 이메일로 로그인한 앱만 받아 준다 (앱의 _isDevAccount 와 같다)
var FB_PROJECT = 'block7-8f24e';
var FB_KEY = 'AIzaSyDeMIzExHqyeqHQrqpPbcOJqYO9a7qmrkE';   // 앱에 이미 들어 있는 웹 키 (비밀이 아니다)
var VERSION = 1;
var MAX_TABS = 3, MAX_CELLS = 30, MAX_CHARS = 5000, MAX_BODY = 200000, HEAD_SCAN = 10;

// 주소를 브라우저로 열면 보이는 것 — 설치가 됐는지 눈으로 확인하는 자리
function doGet() {
  return HtmlService.createHtmlOutput(
    '<div style="font:15px/1.7 -apple-system,BlinkMacSystemFont,sans-serif;padding:28px;color:#222">' +
    '<div style="font-size:20px;font-weight:600;margin-bottom:6px">BLOCK7 시트 편집 문 — 살아 있어요 ✓</div>' +
    '<div>버전 ' + VERSION + '. 앱에 붙여 넣을 주소는 배포 창에 나온 <b>웹 앱 URL</b> 입니다.</div></div>'
  ).setTitle('BLOCK7 시트 편집 문');
}

function doPost(e) {
  var out;
  try {
    out = handle_(parseBody_(e));
  } catch (err) {
    out = errOut_(err);
  }
  out.v = VERSION;
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(req) {
  var who = whoIs_(req.token);   // HB 가 아니면 여기서 끝난다
  if (req.op === 'ping') return { ok: true, who: who };
  if (req.op === 'read') return readOp_(req);
  if (req.op === 'write') return writeOp_(req);
  throw new Fail_('bad', 'op');
}

// ── 오류 ─────────────────────────────────────────────────────────────
function Fail_(code, detail) { this.code = code; this.detail = detail == null ? '' : String(detail); }
function errOut_(err) {
  if (err instanceof Fail_) return { ok: false, error: err.code, detail: err.detail };
  return { ok: false, error: 'internal', detail: String((err && err.message) || err).slice(0, 300) };
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents;
  if (!raw || raw.length > MAX_BODY) throw new Fail_('bad', 'body');
  var req;
  try { req = JSON.parse(raw); } catch (x) { throw new Fail_('bad', 'json'); }
  if (!req || typeof req !== 'object') throw new Fail_('bad', 'json');
  return req;
}

// ── 누가 불렀나 ───────────────────────────────────────────────────────
// 파이어베이스 ID 토큰을 구글(identitytoolkit accounts:lookup)에 물어 본다. 구글이 서명·기한을
// 확인해 주고, 우리는 표 안의 프로젝트·사람 번호가 맞는지와 이메일이 HB 인지 본다.
// ⚠️ '확인된 메일(emailVerified)' 은 따지지 않는다 — 앱은 이메일·비밀번호로 로그인하고 확인 메일을
//    보낸 적이 없어 HB 계정도 '미확인' 이다. 파이어베이스는 한 이메일에 계정 하나만 허락하므로
//    그 이메일의 표는 HB 것뿐이다.
// 확인한 표는 5분 기억한다 (편집 창이 읽고 쓸 때마다 구글에 다시 묻지 않게).
function whoIs_(token) {
  if (typeof token !== 'string' || token.length < 100 || token.length > 5000) throw new Fail_('auth', 'token');
  var cl = jwtClaims_(token), now = Date.now() / 1000;
  if (!cl || cl.aud !== FB_PROJECT || cl.iss !== 'https://securetoken.google.com/' + FB_PROJECT ||
      !cl.sub || !(cl.exp > now)) throw new Fail_('auth', 'claims');
  var cache = CacheService.getScriptCache();
  var key = 'tok_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  var hit = cache.get(key);
  if (hit) return hit;
  var res = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FB_KEY, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ idToken: token }), muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) throw new Fail_('auth', 'lookup ' + res.getResponseCode());
  var body;
  try { body = JSON.parse(res.getContentText() || '{}'); } catch (x) { throw new Fail_('auth', 'lookup json'); }
  var u = body.users && body.users[0];
  if (!u || u.localId !== cl.sub || u.disabled) throw new Fail_('auth', 'user');
  var email = String(u.email || '').toLowerCase();
  if (email !== OWNER) throw new Fail_('owner');
  var ttl = Math.min(300, Math.floor(cl.exp - now));
  if (ttl > 0) cache.put(key, email, ttl);
  return email;
}
// 토큰 가운데 토막(이름표)을 읽는다 — 서명은 구글이 본다
function jwtClaims_(token) {
  var p = token.split('.');
  if (p.length !== 3) return null;
  try {
    var b = p[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    return JSON.parse(Utilities.newBlob(Utilities.base64Decode(b)).getDataAsString('UTF-8'));
  } catch (x) { return null; }
}

// ── 시트 읽기 도구 ────────────────────────────────────────────────────
function norm_(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }

function openSs_(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{20,100}$/.test(id)) throw new Fail_('bad', 'id');
  try { return SpreadsheetApp.openById(id); } catch (x) { throw new Fail_('nosheet', String((x && x.message) || x).slice(0, 200)); }
}
function tabOf_(ss, gid) {
  var g = Number(gid);
  if (gid === '' || gid == null || !(g >= 0) || g !== Math.floor(g)) throw new Fail_('bad', 'gid');
  var all = ss.getSheets();
  for (var i = 0; i < all.length; i++) if (all[i].getSheetId() === g) return all[i];
  throw new Fail_('notab', String(gid));
}
// 그 탭을 한 번에 읽어 둔다 — 보이는 글자 · 값 · 수식
function snap_(sh, tz) {
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (lastRow < 2 || lastCol < 1) throw new Fail_('empty');
  var rg = sh.getRange(1, 1, lastRow, lastCol);
  return { sh: sh, tz: tz, lastRow: lastRow, lastCol: lastCol, head: -1, spill: null,
           shown: rg.getDisplayValues(), raw: rg.getValues(), fx: rg.getFormulas() };
}
// 머리글 줄 — 위에서 HEAD_SCAN 줄 안에서 찾는 열 이름(match)을 모두 가진 첫 줄
function headRow_(sn, names) {
  for (var r = 0; r < Math.min(HEAD_SCAN, sn.lastRow); r++) {
    var row = sn.shown[r].map(norm_);
    var all = true;
    for (var i = 0; i < names.length; i++) if (row.indexOf(norm_(names[i])) < 0) { all = false; break; }
    if (all) return r;
  }
  throw new Fail_('nohead', names.join(', '));
}
function colOf_(sn, name) {
  var h = sn.shown[sn.head].map(norm_), n = norm_(name), i = h.indexOf(n);
  if (!n || i < 0) throw new Fail_('nocol', name);
  if (h.indexOf(n, i + 1) >= 0) throw new Fail_('dupcol', name);
  return i;
}
// 행 찾기 — match 의 열이 모두 같은 행이 **딱 하나** 여야 한다.
// row 를 함께 주면 그 행이 맞을 때만 그 행, 아니면 시트 전체에서 다시 찾는다 (moved).
function findRow_(sn, find) {
  var match = find && find.match;
  var names = (match && typeof match === 'object' && !Array.isArray(match)) ? Object.keys(match) : [];
  if (!names.length || names.length > 5) throw new Fail_('bad', 'match');
  for (var i = 0; i < names.length; i++) if (norm_(match[names[i]]) === '') throw new Fail_('bad', 'match ' + names[i]);
  sn.head = headRow_(sn, names);
  var cols = names.map(function (n) { return colOf_(sn, n); });
  var hit = function (r) {
    for (var k = 0; k < cols.length; k++) if (!same_(sn, r, cols[k], match[names[k]])) return false;
    return true;
  };
  var want = Number(find.row);
  if (want === Math.floor(want) && want - 1 > sn.head && want <= sn.lastRow && hit(want - 1)) return { r: want - 1, moved: false };
  var found = [];
  for (var r = sn.head + 1; r < sn.lastRow && found.length < 2; r++) if (hit(r)) found.push(r);
  if (!found.length) throw new Fail_('notfound');
  if (found.length > 1) throw new Fail_('ambiguous');
  return { r: found[0], moved: !!find.row };
}
// 칸 값이 같은가 — **보이는 글자로** 견준다 (앱이 받는 CSV 도 보이는 글자다).
// 날짜 칸은 모양이 달라도(2026-06-21 · 2026. 6. 21) 같은 날이면 같다.
function same_(sn, r, c, want) {
  if (norm_(sn.shown[r][c]) === norm_(want)) return true;
  var v = sn.raw[r][c];
  if (v instanceof Date) {
    var d = parseDay_(want);
    return !!d && Utilities.formatDate(v, sn.tz, 'yyyy-M-d') === d.join('-');
  }
  return false;
}
// '2026-06-21' · '2026. 6. 21' · '2026/6/21' · '26-6-21' · '2026년 6월 21일' → [2026, 6, 21]
function parseDay_(s) {
  var t = String(s == null ? '' : s).trim();
  var m = t.match(/^(\d{4}|\d{2})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{1,2})\s*\.?$/) ||
          t.match(/^(\d{4}|\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?$/);
  if (!m) return null;
  var y = +m[1], mo = +m[2], d = +m[3];
  if (y < 100) y += 2000;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (new Date(Date.UTC(y, mo - 1, d)).getUTCMonth() !== mo - 1) return null;   // 2월 30일 같은 것
  return [y, mo, d];
}
// 펼쳐지는 수식(ARRAYFORMULA · FILTER …)이 채운 칸은 수식이 없어 보여도 손대면 그 수식이 깨진다.
// 그런 수식이 있는 칸의 **오른쪽·아래** 는 모두 수식 칸으로 친다 (넉넉히 막는다).
var SPILL_RE = /ARRAYFORMULA|^=\s*\{|\b(FILTER|QUERY|SORTN?|UNIQUE|IMPORT(RANGE|DATA|XML|HTML|FEED)|FLATTEN|SPLIT|SEQUENCE|MAP|BYROW|BYCOL|MAKEARRAY|SCAN|TRANSPOSE|[VH]STACK|CHOOSE(COLS|ROWS)|TO(COL|ROW)|WRAP(ROWS|COLS)|GOOGLEFINANCE)\s*\(/i;
function spilled_(sn, r, c) {
  if (!sn.spill) {
    sn.spill = [];
    for (var i = 0; i < sn.lastRow; i++) for (var k = 0; k < sn.lastCol; k++)
      if (sn.fx[i][k] && SPILL_RE.test(sn.fx[i][k])) sn.spill.push([i, k]);
  }
  for (var j = 0; j < sn.spill.length; j++) if (sn.spill[j][0] <= r && sn.spill[j][1] <= c) return true;
  return false;
}
// 칸마다 무엇인가 — 'id'(못 고침) · 'fx'(수식 — 못 고침) · 'date' · ''(글자)
function kind_(sn, r, c) {
  var name = norm_(sn.shown[sn.head][c]);
  if (/(^|[^A-Za-z])ID$/i.test(name)) return 'id';   // '명제 ID' · '명제ID' · 'ID' (VALID 같은 것은 아니다)
  if (sn.fx[r][c] || spilled_(sn, r, c)) return 'fx';
  if (sn.raw[r][c] instanceof Date || /날짜/.test(name)) return 'date';
  return '';
}
// 고를 값이 정해진 칸(드롭다운) — 편집 창이 고르기로 보여 줄 수 있게. 못 읽으면 빈 것.
function choices_(sn, r) {
  var out = {};
  try {
    var dv = sn.sh.getRange(r + 1, 1, 1, sn.lastCol).getDataValidations()[0], C = SpreadsheetApp.DataValidationCriteria;
    for (var c = 0; c < dv.length; c++) {
      var rule = dv[c];
      if (!rule) continue;
      var type = rule.getCriteriaType(), vals = rule.getCriteriaValues();
      if (type === C.VALUE_IN_LIST) out[c] = (vals[0] || []).map(String).slice(0, 200);
      else if (type === C.VALUE_IN_RANGE && vals[0])
        out[c] = vals[0].getDisplayValues().reduce(function (a, row) { return a.concat(row); }, [])
          .filter(function (x) { return x !== ''; }).slice(0, 200);
    }
  } catch (x) {}
  return out;
}

// ── 읽기 — 그 행의 머리글 · 보이는 글자 · 칸 종류 ─────────────────────────
// 탭마다 따로 답한다 (한 탭에 그 명제가 없어도 다른 탭은 읽어 준다).
function readOp_(req) {
  var tabs = Array.isArray(req.tabs) ? req.tabs : [];
  if (!tabs.length || tabs.length > MAX_TABS) throw new Fail_('bad', 'tabs');
  var ss = openSs_(req.id), tz = ss.getSpreadsheetTimeZone();
  return { ok: true, tabs: tabs.map(function (t) {
    try {
      var sn = snap_(tabOf_(ss, t && t.gid), tz), at = findRow_(sn, t.find);
      var heads = [], values = [], kinds = [];
      for (var c = 0; c < sn.lastCol; c++) {
        heads.push(sn.shown[sn.head][c]);
        values.push(sn.shown[at.r][c]);
        kinds.push(kind_(sn, at.r, c));
      }
      return { ok: true, gid: sn.sh.getSheetId(), name: sn.sh.getName(), row: at.r + 1, moved: at.moved,
               heads: heads, values: values, kinds: kinds, choices: choices_(sn, at.r) };
    } catch (err) {
      var o = errOut_(err);
      o.gid = t && t.gid;
      return o;
    }
  }) };
}

// ── 쓰기 — 다 살펴보고, 하나도 걸리지 않을 때만 고친다 ───────────────────────
function writeOp_(req) {
  var edits = Array.isArray(req.edits) ? req.edits : [];
  if (!edits.length || edits.length > MAX_TABS) throw new Fail_('bad', 'edits');
  var total = 0;
  edits.forEach(function (ed) {
    var set = ed && ed.set;
    var names = (set && typeof set === 'object' && !Array.isArray(set)) ? Object.keys(set) : [];
    if (!names.length) throw new Fail_('bad', 'set');
    total += names.length;
    names.forEach(function (n) {
      var s = set[n];
      if (!s || typeof s.value !== 'string' || typeof s.before !== 'string') throw new Fail_('bad', 'set ' + n);
      if (s.value.length > MAX_CHARS) throw new Fail_('toolong', n);
    });
  });
  if (total > MAX_CELLS) throw new Fail_('toomany', String(total));

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw new Fail_('busy');
  try {
    var ss = openSs_(req.id), tz = ss.getSpreadsheetTimeZone();
    // 1) 살펴보기 — 여기서 하나라도 걸리면 아무것도 안 고친다
    var plan = [], conflicts = [], seen = {};
    edits.forEach(function (ed) {
      var sn = snap_(tabOf_(ss, ed.gid), tz), at = findRow_(sn, ed.find);
      var key = sn.sh.getSheetId() + ':' + at.r;
      if (seen[key]) throw new Fail_('bad', 'same row twice');
      seen[key] = 1;
      var cells = [];
      Object.keys(ed.set).forEach(function (n) {
        var s = ed.set[n], c = colOf_(sn, n), k = kind_(sn, at.r, c);
        if (k === 'id') throw new Fail_('locked', n);
        if (k === 'fx') throw new Fail_('formula', n);
        if (!same_(sn, at.r, c, s.before)) { conflicts.push({ gid: sn.sh.getSheetId(), col: n, now: sn.shown[at.r][c] }); return; }
        // 그대로면 건너뛴다 (날짜는 모양만 다르고 같은 날이어도)
        if (s.value === sn.shown[at.r][c] || (k === 'date' && s.value.trim() !== '' && same_(sn, at.r, c, s.value))) return;
        var day = null;
        if (k === 'date' && s.value.trim() !== '') { day = parseDay_(s.value); if (!day) throw new Fail_('baddate', n); }
        cells.push({ c: c, n: n, value: s.value, day: day, raw: sn.raw[at.r][c] });
      });
      plan.push({ sn: sn, at: at, cells: cells });
    });
    if (conflicts.length) return { ok: false, error: 'conflict', conflicts: conflicts };
    // 2) 고치기
    var done = plan.map(function (p) {
      var row = p.at.r + 1;
      p.cells.forEach(function (x) { put_(p.sn.sh.getRange(row, x.c + 1), x, tz); });
      var values = {};
      if (p.cells.length) {
        SpreadsheetApp.flush();
        var after = p.sn.sh.getRange(row, 1, 1, p.sn.lastCol).getDisplayValues()[0];
        p.cells.forEach(function (x) { values[x.n] = after[x.c]; });
      }
      return { gid: p.sn.sh.getSheetId(), name: p.sn.sh.getName(), row: row, moved: p.at.moved,
               wrote: p.cells.map(function (x) { return x.n; }), values: values };
    });
    return { ok: true, tabs: done };
  } finally {
    lock.releaseLock();
  }
}
// 한 칸 쓰기 — 날짜 칸은 **날짜로**(시트의 정렬·필터가 깨지지 않게), 글자 칸은 시트가 숫자·날짜·
// 수식으로 바꿔 버리지 않게 **글자 그대로** ('3:16' 이 시각이 되거나 '0123' 이 123 이 되지 않게).
function put_(cell, x, tz) {
  if (x.day) {
    cell.setValue(Utilities.parseDate(x.day.join('-'), tz, 'yyyy-M-d'));
    if (!(x.raw instanceof Date)) cell.setNumberFormat('yyyy-mm-dd');   // 글자로 적혀 있던 날짜 칸
    return;
  }
  var v = x.value, t = v.trim();
  if (v === '') { cell.setValue(''); return; }
  if (typeof x.raw === 'number' && /^-?\d+(\.\d+)?$/.test(t)) { cell.setValue(Number(t)); return; }
  if (typeof x.raw === 'boolean' && /^(true|false)$/i.test(t)) { cell.setValue(/^true$/i.test(t)); return; }
  if (/^[=+\-@']/.test(v)) { cell.setValue("'" + v); return; }   // 수식·부호로 읽히지 않게
  cell.setValue(v);
  var got = cell.getValue();
  if (typeof got !== 'string' || got !== v) cell.setValue("'" + v);   // 시트가 숫자·날짜로 바꿨다 → 글자로
}
