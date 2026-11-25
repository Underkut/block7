/* ⚠️ 만들어진 파일 — 손으로 고치지 말 것. tools/make-rotapush-core.sh 가 rotation/index.html 의 <script id="rotation-core"> 에서 떼어 만든다.
 * 교역자 로테이션 알림 서버(rotapush.js)가 앱과 같은 판단(알림 글 · 보낼 때 · 시트 표 읽기)을 쓰려고. */
module.exports = (function () {

// 교역자 로테이션 — 화면 없이 도는 판단. tests/test_rotation.js 가 이것만 떼어 시험한다.
// ⚠️ 여기 이름 · 숙소는 넣지 말 것(공개 저장소). 실제 자료는 HB 파이어베이스 rota/{uid} 에만 산다.
//
// 자료 모양(book) — 1114-R '정해 둔 것':
//   people : 교역자 · 성도 인도자 { id, name, kind?:'lay', roles:['preach','offer','lead','busan'], no:['sun1|preach', …], at, by, del? }
//            kind 'lay' = 교역자가 아니라 성도로서 예배인도를 하는 분(HB 11/14). 없으면 교역자.
//            away:[{from,to,note}] = 안 되는 날(부재, R5) · pin:['성찬주'] = 그 표시가 있는 주에는 분당에 있어야 함(고정 조건, R5)
//            no = 그 일을 맡아도 안 들어가는 예배(HB 11/14). 없으면 모든 예배 — 예전 자료도 그대로 '모두'.
//   slots  : 분당 예배 자리 (옛 이름 판교)   { id:'날짜|예배|역할', date, svc, role, who:[사람 id], txt:'담임목사님' 같은 글, lock, at, by, del? }
//   visits : 부산 방문       { id:'v|날짜', date, who:[사람 id], days:'금토일', lead?:{ fri|sun|ll: { m, p? } }, stay:[], travel:[], mates?:[{ n, p? }], meet?:{ k, … }, note, at, by, del? }
//            동행 mates · 모임 meet 은 1116-2 B 부터 — 그 전의 글 세 칸(staff 동행 · group 주일모임 · edu 교육)은 읽을 때 옮긴다(normVisit).
//            날짜는 보통 주일이지만 성탄(목) · 송구영신(수)처럼 다른 날도 된다(시트 2025-12 실제). 한 주에 방문이 여럿일 수 있다.
//   marks  : 그 주 교회 일정 { id:'m|주일', sun, tags:['성찬주'], note, at, by, del? }
//   opts   : 고르는 목록 { id:'o|종류|…', type:'stay'(숙소)|'mode'(교통편)|'cat'(특이사항 갈래), name, kind?, cost?(숙소 1박 평소 금액), ord, at, by, del? }
//            목록이 한 번도 손대지 않은 종류는 저장하지 않고 기본값을 보여 준다(optList). 처음 고칠 때 기본값을 정해진 id 로 적는다(ensureOpts).
//   visits[].issues : 특이사항 [{ cat:'예배팀', text }] — 메모(note)와 따로 (HB 11/14). visits[].hot : 메모 '중요'(빨강, 목록에도) · note : 메모 '일반'(판 안에서만, 1117-Z 5b). 나중에 교회 보고서의 부산 보고서를 여기에 잇는다(R7).
// 모든 줄은 at(고친 때) · by(누가 — 처음엔 HB, R6 부터 교역자 각자)를 갖는다. 지우면 내용을 비우고 del:true 만 남긴다(표지).
// 부산 교역자는 visits 한 곳에만 적는다. 예배 구성의 '부산 교역자' 줄은 visits 에서 읽어 보여 준다.
const APP_VERSION = 'v. 26-1126-1';
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
// 보여 줄 때 일요일 **하루만** 쓸 땐 '주일' (HB 11/16) — '토일' · '금토일' 처럼 묶을 땐 '일' 그대로(1116-2 A). 자료(days 글자 · 교통 시각)는 '일'
const DOWS = DOW.map(c => (c === '일' ? '주일' : c));
function dayS(s) { s = String(s || ''); return s === '일' ? '주일' : s; }
function timeS(t) { return String(t || '').replace(/^일/, '주일'); }
// 예배 — off: 그 주 주일에서 며칠 뒤인가. ⚠️ 모든 주간은 **주일에 시작**한다(HB 11/14): 주일 → 화 → 수 → 금 → 토
const SVC = {
  sun1: { label: '1부', short: '1부', off: 0 }, sun2: { label: '2부', short: '2부', off: 0 }, sun3: { label: '3부', short: '3부', off: 0 },
  ll: { label: '라이프라인', short: 'LL', off: 0 }, fri: { label: '금요예배', short: '금요', off: 5 }, wed: { label: '수요예배', short: '수요', off: 3 },
  tue: { label: '화요예배', short: '화요', off: 2, past: true },   // 2026-05 까지 (그 뒤 수요예배로) — 옛 기록을 담으려고만 둔다
};
const SUN4 = ['sun1', 'sun2', 'sun3', 'll'];
const ROLE = { preach: '설교', offer: '헌금인도', lead: '예배인도', notice: '광고' };   // notice = WN 광고(매월 마지막 금요일, HB 11/14)
// 시트 '예배 구성' 에 실제 있는 칸만 (예배 × 역할)
const GRID = [
  ['sun1', 'preach'], ['sun2', 'preach'], ['sun3', 'preach'], ['ll', 'preach'],
  ['sun1', 'offer'], ['sun2', 'offer'], ['sun3', 'offer'], ['ll', 'offer'],
  ['sun2', 'lead'], ['ll', 'lead'],
  ['fri', 'preach'], ['fri', 'offer'], ['fri', 'notice'],
  ['wed', 'preach'], ['wed', 'offer'],
  ['tue', 'preach'], ['tue', 'offer'],
];
const PROLES = { preach: '설교', offer: '헌금', lead: '예배인도', busan: '부산' };
// 일마다 있는 예배 (시트 '예배 구성' 칸 그대로)
const ROLE_SVCS = { preach: ['sun1', 'sun2', 'sun3', 'll', 'fri', 'wed'], offer: ['sun1', 'sun2', 'sun3', 'll', 'fri', 'wed'], lead: ['sun2', 'll'] };
const DAYS = ['토일', '토일월', '금토일', '금토일월', '목금토일', '수목', '목'];
const MARK_TAGS = ['성찬주', '극동방송', '종려주일', '부활주일', '성탄', '송구영신'];
/* 숙소 상태 (1116-2 C, HB 11/16) — 호텔과 성도님 댁이 다르다. 값은 둘이 같은 말: '' 미정 · pre 예약 전 / 대화 전 · ask 대화 중(댁만) · done 예약 완료 / 대화 완료 · cancel 취소.
   옛 값('' · ask · done · cancel)은 그대로 읽힌다 — 다만 호텔의 ask(예전 글자 '대화 중')는 '예약 전'(pre)으로 옮겨 읽는다(normStay). */
const STAY_ST = {
  hotel: [['', '미정'], ['pre', '예약 전'], ['done', '예약 완료'], ['cancel', '취소']],
  home: [['', '미정'], ['pre', '대화 전'], ['ask', '대화 중'], ['done', '대화 완료'], ['cancel', '취소']],
};
function stayStOf(kind, status) { const l = STAY_ST[kind === 'home' ? 'home' : 'hotel']; if (l.some(x => x[0] === status)) return status; return status === 'ask' ? 'pre' : ''; }
function stayStName(s) { const k = s && s.kind === 'home' ? 'home' : 'hotel', st = stayStOf(k, s && s.status); return STAY_ST[k].find(x => x[0] === st)[1]; }
// 숙소 쓰는 사람 (1116-2 C) — 동행 스텝이 있을 때만 묻는다. 값은 예전 그대로('' · 남 · 여)
const STAY_FOR = [['', '함께'], ['남', '남 숙소'], ['여', '여 숙소']];
function stayForAsk(v, i, d) { return !!(((v && v.mates) || []).length || (d && d.for) || ((v && v.stay) || []).some((s, k) => k !== i && s.status !== 'cancel')); }
// 성도님 댁은 취소 기한 · 예약 화면이 없다 — 화면에서 감추고, 알림 · 표에서도 호텔 것만 본다
function stayHotel(s) { return !!s && s.kind !== 'home'; }

// 칸 이름 — 주일은 '1부 헌금인도', 주중은 짧게 '수요 헌금'(줄바꿈 안 되게, HB 11/14), 마지막 금요일 광고는 'WN 광고'
function slotLabel(svc, role) {
  if (isSpec(svc)) return '특별 ' + (role === 'lead' ? '예배인도' : role === 'offer' ? '헌금' : ROLE[role]);   // 이름은 slotLabelB(책을 아는 곳)
  if (role === 'notice') return 'WN 광고';
  if (role === 'offer' && SVC[svc].off !== 0) return SVC[svc].short + ' 헌금';
  return SVC[svc].short + ' ' + (role === 'lead' ? '예배인도' : ROLE[role]);
}
// 부산 금요예배 이름 — 시트의 금1 · 금2 · 금3 (HB 11/14: 풀네임으로)
const FRI_NAMES = ['', 'AWAKE', 'REVIVED', 'ENCOUNTER'];
function friName(sun) { return FRI_NAMES[busanFri(sun)] || ''; }
// 그 달의 마지막 금요일인가 (WN 광고 칸이 있는 날)
function isLastFri(ymd) { return dowOf(ymd) === 5 && addDays(ymd, 7).slice(0, 7) !== ymd.slice(0, 7); }

/* ---- 분당 특별예배 (1116-2 E, HB 11/17) ----
   성탄 전야(목 저녁) · 성탄(금 오전) · 송구영신처럼 정해진 예배(주일 · 수 · 금) 밖의 분당 예배. 예배 하나 = specs 한 줄:
   { id: 'x|날짜|k'(k = 그 날 몇 번째, 1~9), date, t?: 때(새벽 · 오전 · 오후 · 저녁 · 'HH:MM'), n: 예배 이름, roles: 자리(설교 · 헌금 · 예배인도 중), rest?: 그 날 정해진 수요 · 금요예배는 쉼 }.
   자리 사람은 보통 자리(slots)와 같은 모양 — id '날짜|xk|역할'(svc = 'x1' ~ 'x9'). 그래서 고르기 판 · 겹침(부산에 있는 날) · 내 일정 · 사람 × 주 · 월 달력이 그대로 따라온다.
   예배를 지우면 그 자리들도 지운다(dropSpec). 고치는 것은 HB 만(교역자 칸에 없음). */
const SPEC_ROLES = ['preach', 'offer', 'lead'], SPEC_NAMES = ['성탄 전야 예배', '성탄 예배', '송구영신 예배'];
function isSpec(svc) { return /^x[1-9]$/.test(String(svc || '')); }
// SVC 를 찾을 때 특별예배도 깨지지 않게 — 정해진 예배가 아니면 '특별'
function svcI(svc) { return SVC[svc] || { label: '특별예배', short: '특별', off: -1, spec: true }; }
function specId(date, k) { return 'x|' + date + '|' + k; }
function normSpec(o) {
  if (!o || typeof o !== 'object') return null;
  const [x, date, k] = String(o.id || '').split('|'); if (x !== 'x' || !isYmd(date) || !/^[1-9]$/.test(k || '')) return null;
  const b = base(o); b.date = date; b.k = +k; if (b.del) return b;
  b.n = str(o.n, 40); if (!b.n) return null;
  const t = str(o.t, 10); if (t) b.t = t;
  b.roles = Array.isArray(o.roles) ? SPEC_ROLES.filter(r => o.roles.includes(r)) : ['preach', 'offer'];
  if (o.rest && [3, 5].includes(dowOf(date))) b.rest = true;   // 그 날 정해진 수요 · 금요예배는 쉼
  return b;
}
function specOf(book, date, svc) { return isSpec(svc) ? live(book.specs || []).find(x => x.date === date && x.k === +svc.slice(1)) || null : null; }
// 기간 안의 특별예배 — 날짜 · 때 순
function specsIn(book, from, to) { return live(book.specs || []).filter(x => x.date >= from && x.date <= to).sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : evTKey(a.t) < evTKey(b.t) ? -1 : evTKey(a.t) > evTKey(b.t) ? 1 : a.k - b.k)); }
// 그 날 정해진 예배가 쉬는가 — 쉬게 한 특별예배
function restOn(book, date) { return live(book.specs || []).find(x => x.date === date && x.rest) || null; }
// 자리 이름 — 특별예배면 그 예배 이름: '성탄 예배 설교'
function slotLabelB(book, date, svc, role) { const sp = specOf(book, date, svc); return sp ? sp.n + ' ' + (role === 'lead' ? '예배인도' : ROLE[role]) : slotLabel(svc, role); }
function nextSpecK(book, date) { for (let k = 1; k <= 9; k++) if (!(book.specs || []).some(x => x.id === specId(date, k))) return k; return 0; }
// 특별예배 지우기 — 예배 줄과 그 자리들(지운 표지)
function dropSpec(book, id, by, now) {
  const sp = (book.specs || []).find(x => x.id === id && !x.del); if (!sp) return false;
  for (const r of SPEC_ROLES) drop(book, 'slots', slotId(sp.date, 'x' + sp.k, r), by, now);
  return drop(book, 'specs', id, by, now);
}

/* ---- 날짜 (서울 날짜 문자열 'YYYY-MM-DD' 만 다룬다) ---- */
const isYmd = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z'));
function ymdUTC(d) { return d.toISOString().slice(0, 10); }
function addDays(ymd, n) { const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return ymdUTC(d); }
function dowOf(ymd) { return new Date(ymd + 'T00:00:00Z').getUTCDay(); }
function mdOf(ymd) { return (+ymd.slice(5, 7)) + '/' + (+ymd.slice(8, 10)); }
function sunOf(ymd) { return addDays(ymd, -dowOf(ymd)); }   // 그 날이 속한 주의 **시작** 주일 (주일 ~ 토)
// 부산 방문은 '금토일' 처럼 주일에 끝난다 — 방문 날짜에서 그 주일(그 날이거나 다음 주일)을 찾을 때만 쓴다
function visitSun(ymd) { return addDays(ymd, (7 - dowOf(ymd)) % 7); }
// 그 주(주일 시작)의 금요일에 있는 부산 금요예배 이름
function weekFriName(sun) { return friName(addDays(sun, 7)); }
function nthOf(ymd) { return Math.ceil(+ymd.slice(8, 10) / 7); }
function svcDate(sun, svc) { return addDays(sun, SVC[svc].off); }
// 그 주 부산 금요예배 — 그 달의 첫째 · 둘째 · 셋째 금요일에만 있다 (시트 '금1 · 금2 · 금3', 2025-01 ~ 2026-05 모두 맞음)
function busanFri(sun) { const n = nthOf(addDays(sun, -2)); return n <= 3 ? n : 0; }
// 그 달의 주일들
function monthSundays(ym) {
  let d = ym + '-01'; d = addDays(d, (7 - dowOf(d)) % 7);
  const out = []; while (d.slice(0, 7) === ym) { out.push(d); d = addDays(d, 7); }
  return out;
}
function addMonths(ym, n) { const y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + n; const d = new Date(Date.UTC(y, m, 1)); return ymdUTC(d).slice(0, 7); }

/* ---- 다듬기: 모르는 값은 버린다. 클라우드 · 기기 어느 쪽에서 와도 같은 모양이 되게 ---- */
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const num = (v) => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.floor(v) : 0);
const ids = (v) => (Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string' && x).map(x => x.slice(0, 40)))].slice(0, 6) : []);
function base(o) { const b = { id: str(o.id, 80), at: num(o.at), by: str(o.by, 64) }; if (o.del) b.del = true; return b; }
function ranges(v) { return (Array.isArray(v) ? v : []).filter(x => x && isYmd(x.from) && isYmd(x.to || x.from)).map(x => { const a = { from: x.from, to: x.to && x.to >= x.from ? x.to : x.from }; const n = str(x.note, 40); if (n) a.note = n; return a; })
    .sort((a, c) => (a.from < c.from ? -1 : 1)).slice(-40); }
/* 칸마다 고친 때 (R6): 줄 전체의 at 으로 겨루면 HB 가 같은 방문의 메모만 고쳐도 교역자가 적은 숙소가 밀린다.
   그래서 교역자도 적는 칸(숙소 · 교통 · 부재 · 가능 일정)은 따로 f+'At'(고친 때) · f+'By'(교역자가 적었으면 그 사람 id) 를 둔다. */
function fieldStamp(b, o, f) { const at = num(o[f + 'At']); if (at) { b[f + 'At'] = at; const by = str(o[f + 'By'], 40); if (by) b[f + 'By'] = by; } }
function normPerson(o) {
  if (!o || typeof o !== 'object' || !str(o.id, 80)) return null;
  const b = base(o); if (b.del) return b;
  b.name = str(o.name, 30); if (!b.name) return null;
  if (o.kind === 'lay' || o.kind === 'other') b.kind = o.kind;   // lay = 성도 인도자 · other = 담임 · 초청(담임목사님 · 사모님 · 강사)
  const al = Array.isArray(o.alias) ? [...new Set(o.alias.map(x => str(x, 30)).filter(Boolean))].slice(0, 6) : [];
  if (al.length) b.alias = al;   // 시트에 다르게 적힌 이름 (글 → 사람 옮기기에 씀)
  const em = str(o.email, 80).toLowerCase(); if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) b.email = em;   // 로그인 계정 (내 일정 · R6)
  // 부재(away) · 가능 일정(can, R6) — 같은 모양: 기간 + 까닭. 칸마다 고친 때(awayAt · canAt)와 누가(awayBy · canBy, 교역자가 적었으면 그 사람 id)
  for (const f of ['away', 'can']) { const r = ranges(o[f]); if (r.length) b[f] = r; fieldStamp(b, o, f); }
  const pin = Array.isArray(o.pin) ? [...new Set(o.pin.map(t => str(t, 20)).filter(Boolean))].slice(0, 6) : [];
  if (pin.length) b.pin = pin;
  if (o.bul === true) b.bul = true;   // 주보 담당 순번에 듦 (1117-Z 2c)
  b.roles = Array.isArray(o.roles) ? Object.keys(PROLES).filter(r => o.roles.includes(r)) : [];
  const no = Array.isArray(o.no) ? o.no.filter(k => typeof k === 'string' && GRID.some(g => g[0] + '|' + g[1] === k)) : [];
  if (no.length) b.no = GRID.map(g => g[0] + '|' + g[1]).filter(k => no.includes(k));
  return b;
}
// 그 사람이 그 예배의 그 일을 맡나 — 일(roles)을 맡고, 그 예배를 빼 두지(no) 않았으면
function canDo(p, svc, role) { if (role === 'notice') role = 'offer';   // WN 광고는 헌금 맡는 분들이
  return !!p && !p.del && p.roles.includes(role) && !(role !== 'busan' && (p.no || []).includes(svc + '|' + role)); }
// 주일 설교 접기 — 비어 있지 않은 설교가 모두 같으면(빈 칸은 셈하지 않음) 접어도 된다 (HB 11/14: 빈 칸 때문에 안 접히던 것)
function preachFold(book, plan, pm) { const g = groupRole(book, plan, 'preach', SUN4, pm); return g.length <= 1; }
// 글 → 사람: 그 사람 이름(띄어쓰기 무시)이나 다른 이름으로 시작하는 글 자리를 사람으로 바꾼다. 남는 괄호 글은 그대로 둔다('(녹화)').
function textToPerson(book, pid, by, now) {
  const p = book.people.find(x => x.id === pid && !x.del); if (!p) return 0;
  const keys = [p.name].concat(p.alias || []).map(x => x.replace(/\s+/g, '')).filter(Boolean);
  let n = 0;
  for (const s of live(book.slots)) { if (!s.txt) continue; const t = s.txt.replace(/\s+/g, ''), k = keys.find(x => t.startsWith(x)); if (!k) continue;
    const rest = t.slice(k.length).trim(); if (rest && !/^\(.*\)$/.test(rest)) continue;
    if (put(book, 'slots', Object.assign({}, s, { who: s.who.includes(pid) ? s.who : s.who.concat(pid), txt: rest }), by, now)) n++; }
  return n;
}
function countTextFor(book, pid) { const p = book.people.find(x => x.id === pid); if (!p) return 0; const keys = [p.name].concat(p.alias || []).map(x => x.replace(/\s+/g, ''));
  return live(book.slots).filter(s => s.txt && keys.some(k => { const t = s.txt.replace(/\s+/g, ''); if (!t.startsWith(k)) return false; const r = t.slice(k.length); return !r || /^\(.*\)$/.test(r); })).length; }
// 그 달에 자료가 있을 때만 보이는 예배 (화요예배 — 옛 기록)
function svcShown(book, svc, dates) { return !SVC[svc].past || live(book.slots).some(x => x.svc === svc && dates.includes(sunOf(x.date))); }
function slotId(date, svc, role) { return date + '|' + svc + '|' + role; }
function normSlot(o) {
  if (!o || typeof o !== 'object') return null;
  const [date, svc, role] = String(o.id || '').split('|');
  if (isSpec(svc)) {   // 분당 특별예배 자리 (1116-2 E) — 아무 날 · 설교 · 헌금 · 예배인도
    if (!isYmd(date) || !SPEC_ROLES.includes(role)) return null;
    const b = base(o); b.date = date; b.svc = svc; b.role = role; if (b.del) return b;
    b.who = ids(o.who); b.txt = str(o.txt, 30); if (o.lock) b.lock = true;
    return b;
  }
  if (!isYmd(date) || !SVC[svc] || !ROLE[role] || !GRID.some(g => g[0] === svc && g[1] === role)) return null;
  if (svcDate(sunOf(date), svc) !== date) return null;   // 수요 자리가 수요일이 아니면 버린다
  if (role === 'notice' && !isLastFri(date)) return null;  // WN 광고는 마지막 금요일에만
  const b = base(o); b.date = date; b.svc = svc; b.role = role; if (b.del) return b;
  b.who = ids(o.who); b.txt = str(o.txt, 30); if (o.lock) b.lock = true;
  return b;
}
function visitId(date) { return 'v|' + date; }
/* 부산에서 누가 인도하나 (R11 → R12 A, HB 11/16) — 금요예배 · 주일예배 · 라이프라인 셋 다 같은 세 갈래, 머무는 날과는 따로 받는다.
   lead = { fri | sun | ll: { m, p? } } — m: staff(내려간 교역자) · lay(성도 인도자, p = 그분 id) · relay(중계 = 분당 예배를 화면으로 받음, 인도자 없음).
   칸이 없으면 '비움'(아직 안 정함). 기본은 비움.
   옛 모양(R11 · b8)은 읽을 때 옮긴다: fri · ll = true → 교역자 · sunLead 'staff' | 'lay'(+ sunLay). 쓸 때는 lead 하나만(옛 칸은 다시 쓰지 않는다). */
const LEAD_SVC = ['fri', 'sun', 'll'], LEAD_MODE = ['staff', 'lay', 'relay'];
const LEAD_NAME = { fri: '금요예배', sun: '주일예배', ll: '라이프라인' }, LEAD_MNAME = { staff: '교역자', lay: '성도', relay: '중계' };
function normLead(o) {
  const out = {}, one = (x) => { if (!x || typeof x !== 'object' || !LEAD_MODE.includes(x.m)) return null;
    const r = { m: x.m }; if (x.m === 'lay') { const pid = str(x.p, 80); if (pid) r.p = pid; } return r; };
  if (o.lead && typeof o.lead === 'object' && !Array.isArray(o.lead)) { for (const k of LEAD_SVC) { const r = one(o.lead[k]); if (r) out[k] = r; } return out; }
  if (o.fri) out.fri = { m: 'staff' };
  if (o.sunLead === 'staff' || o.sunLead === 'lay') out.sun = one({ m: o.sunLead, p: o.sunLay });
  if (o.ll) out.ll = { m: 'staff' };
  return out;
}
function leadOf(v, svc) { return (v && v.lead && v.lead[svc]) || null; }
function leadIs(v, svc, m) { const l = leadOf(v, svc); return !!l && l.m === m; }
// 숙소 한 줄 — cancelBy(취소 기한 날짜) · cancelAt(시각, 고를 때만) · nofree(환불 불가) · ref(예약번호) · imgs(예약 화면 사진 id, 사진은 rota/{uid}/img/{id} 에)
function normStay(o) {
  if (!o || typeof o !== 'object') return null;
  const kind = o.kind === 'home' ? 'home' : 'hotel';
  const b = { kind, name: str(o.name, 60), status: stayStOf(kind, typeof o.status === 'string' ? o.status : ''), cost: num(o.cost), nights: num(o.nights), for: str(o.for, 20) };
  if (isYmd(o.cancelBy)) b.cancelBy = o.cancelBy;
  if (b.cancelBy && typeof o.cancelAt === 'string' && /^\d\d:\d\d$/.test(o.cancelAt)) b.cancelAt = o.cancelAt;
  if (o.nofree) b.nofree = true;
  const rf = str(o.ref, 40); if (rf) b.ref = rf;   // 예약번호(R9 — 사진 · 메일에서 읽은 것)
  const im = Array.isArray(o.imgs) ? o.imgs.filter(x => typeof x === 'string' && /^[a-z0-9]{6,40}$/.test(x)).slice(0, 4) : [];
  if (im.length) b.imgs = im;
  return b;
}
function normTravel(o) { return o && typeof o === 'object' ? { dir: o.dir === 'up' ? 'up' : 'down', mode: str(o.mode, 20), time: str(o.time, 30), who: str(o.who, 40) } : null; }
function normDays(s) { return [...str(s, 10)].filter(c => DOW.includes(c)).join(''); }
function normVisit(o) {
  if (!o || typeof o !== 'object') return null;
  const date = String(o.id || '').slice(2); if (String(o.id).slice(0, 2) !== 'v|' || !isYmd(date)) return null;
  const b = base(o); b.date = date; if (b.del) return b;
  b.who = ids(o.who); b.days = normDays(o.days);
  const ld = normLead(o); if (Object.keys(ld).length) b.lead = ld;   // 부산 예배 인도(R12 A) — 비면 칸 자체가 없다(옛 방문과 같은 모양)
  const tt = str(o.title, 12); if (tt) b.title = tt;   // 부산 일정 이름(1116-2 D) — 성탄 · 송구영신 · 특별예배 … 비면 그냥 '부산'
  const ev = normEvs(o.evs, date); if (ev.length) b.evs = ev;   // 더한 예배(1116-2 D) — 정해진 셋(금요 · 주일 · LL) 밖의 것
  b.stay = (Array.isArray(o.stay) ? o.stay : []).map(normStay).filter(Boolean).slice(0, 8);
  b.travel = (Array.isArray(o.travel) ? o.travel : []).map(normTravel).filter(Boolean).slice(0, 8);
  fieldStamp(b, o, 'stay'); fieldStamp(b, o, 'travel');
  // 동행 · 모임 (1116-2 B) — 새 칸이 있으면 그것, 없으면 옛 글(staff · group · edu)을 옮겨 읽는다. 비면 칸 자체가 없다
  const ms = Array.isArray(o.mates) ? o.mates.map(normMate).filter(Boolean).slice(0, 8) : legacyMates(o.staff); if (ms.length) b.mates = ms;
  const mt = o.meet !== undefined ? normMeet(o.meet) : legacyMeet(o.group, o.edu); if (mt) b.meet = mt;
  fieldStamp(b, o, 'meet');
  b.note = str(o.note, 1000);
  const hot = str(o.hot, 1000); if (hot) b.hot = hot;   // 메모 '중요'(1117-Z 5b, HB 11/18) — 목록 · 표에 빨간 글자로. note = '일반'(판 안에서만)
  const is = (Array.isArray(o.issues) ? o.issues : []).map(x => x && typeof x === 'object' ? { cat: str(x.cat, 20), text: str(x.text, 600) } : null).filter(x => x && x.cat && x.text).slice(0, 20);
  if (is.length) b.issues = is;
  return b;
}
/* ---- 특별예배 (1116-2 D, HB 11/17) ----
   성탄(목 저녁 · 금 오전) · 송구영신처럼 주일이 아닌 날 중심의 부산 일정. 새 '종류' 를 만들지 않고 방문에 두 칸만 더한다:
   title = 이름(12자, TITLE_CHIPS 또는 직접) · evs = 더한 예배 [{ d: 날짜, t?: 때(새벽 · 오전 · 오후 · 저녁 · 'HH:MM'), n: 예배 이름, m?: staff | lay | relay, p?: 성도 인도자 id }].
   m 이 없으면 '인도 미정'(예배는 있다). 날짜는 방문 날짜 앞 닷새 ~ 다음 날(머무는 요일 고르기와 같은 범위) — 밖이면 버린다.
   정해진 인도 셋(lead)은 그대로 두고, 화면의 '예배' 칸에 함께 보인다(visitLeads 가 둘을 한 목록으로). 고치는 것은 HB 만(교역자 칸 STAFF_VISIT 에 없음).
   화면 용어(HB 11/17): 방문 → '부산 일정'(늘 '부산' 을 붙여 — 내 일정 · 가능 일정 · 교회 일정과 갈리게), 집회 → '예배'. 자료 이름(visits · v|날짜)은 그대로. */
const TITLE_CHIPS = ['성탄', '송구영신', '특별예배'], EV_TIMES = ['새벽', '오전', '오후', '저녁'];
const EV_TKEY = { 새벽: '05:00', 오전: '10:00', 오후: '14:00', 저녁: '19:00' };
function evTKey(t) { return EV_TKEY[t] || (/^\d\d:\d\d$/.test(t || '') ? t : '12:00'); }
function evOk(date, d) { return isYmd(d) && d >= addDays(date, -5) && d <= addDays(date, 1); }
// 예배 날짜로 고를 수 있는 날 — 방문 날짜 앞 닷새 ~ 다음 날 (dayChoices 와 같은 범위)
function evDates(date) { const out = []; for (let k = -5; k <= 1; k++) out.push(addDays(date, k)); return out; }
function normEv(x, date) {
  if (!x || typeof x !== 'object' || !evOk(date, x.d)) return null;
  const n = str(x.n, 40); if (!n) return null;
  const r = { d: x.d }, t = str(x.t, 10); if (t) r.t = t; r.n = n;
  if (LEAD_MODE.includes(x.m)) { r.m = x.m; if (x.m === 'lay') { const pid = str(x.p, 80); if (pid) r.p = pid; } }
  return r;
}
function normEvs(a, date) {
  return (Array.isArray(a) ? a : []).map(x => normEv(x, date)).filter(Boolean).slice(0, 8)
    .map((x, i) => ({ x, i })).sort((a, b) => (a.x.d !== b.x.d ? (a.x.d < b.x.d ? -1 : 1) : evTKey(a.x.t) !== evTKey(b.x.t) ? (evTKey(a.x.t) < evTKey(b.x.t) ? -1 : 1) : a.i - b.i)).map(o => o.x);
}
function evTime(t) { return t || ''; }
// 교역자가 인도하는 예배 날은 머무는 날이어야 한다 — 빠진 요일을 더한 days 와 더한 날짜들 (저장할 때 저절로, 토스트로 알림)
function evFixDays(date, days, evs) {
  const cur = sortDays(date, days || defaultDays(date)), have = new Set(stayDates({ date, days: cur })), add = [];
  for (const e of normEvs(evs, date)) if (e.m === 'staff' && !have.has(e.d)) { have.add(e.d); add.push(e.d); }
  return { days: sortDays(date, cur + add.map(d => DOW[dowOf(d)]).join('')), added: add };
}
// 주일에 머무는 부산 일정인가 — 그 주일(주일 광고 · 부산 상영 · '두 주 연속' 이 보는 날), 아니면 ''
function vSun(v) { const s = visitSun(v.date); return stayDates(v).includes(s) ? s : ''; }
// 새 부산 일정의 이름 짐작 — 그 주 교회 일정 표시에 성탄 · 송구영신이 있고 주일이 아닌 날이면
function titleGuess(book, date) {
  if (dowOf(date) === 0) return '';
  const m = book.marks.find(x => x.id === markId(sunOf(date)) && !x.del) || book.marks.find(x => x.id === markId(visitSun(date)) && !x.del);
  return (m && TITLE_CHIPS.find(t => m.tags.includes(t))) || '';
}
// 예배 이름 알약 — 같은 이름의 지난 부산 일정에서 많이 쓴 순 + '이름 예배'
function evNameChips(book, title) {
  const cnt = new Map();
  for (const v of live(book.visits)) if ((v.title || '') === (title || '')) for (const e of v.evs || []) cnt.set(e.n, (cnt.get(e.n) || 0) + 1);
  const out = [...cnt.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko')).map(x => x[0]);
  const base = title && title !== '특별예배' ? title + ' 예배' : '';
  if (base && !out.includes(base)) out.push(base);
  return out.slice(0, 6);
}

/* ---- 동행 · 모임 (1116-2 B, HB 11/16) ----
   예전엔 글 세 칸이었다(staff 동행 · group 주일모임 · edu 새가족 · 침례교육). 이제 둘로:
   mates = [{ n: 이름 글, p?: 성도 인도자 id }] — 이름을 칠 때 성도 인도자('사람' 탭 kind 'lay')와 맞으면 그분 id 로 잇는다(이름이 바뀌어도 따라감).
   meet  = { k: dept(부서모임) | new(새가족교육) | bapt(침례교육), g?: 청년셀 · 장년셀 · 기타(부서모임), who?: 새가족 이름 글(새가족교육), n?: 1~6 차(교육), memo? } — 한 방문에 하나.
   옛 글은 읽을 때 옮긴다: 동행 글은 ' · ' / ',' 로 나눠 한 줄씩 · 주일모임 · 교육 글은 메모에 그대로(잃지 않게). 쓸 때는 새 칸만 — 옛 칸은 다시 쓰지 않는다.
   모임은 그 방문 교역자도 고친다(HB 11/16) → 칸마다 고친 때 meetAt · meetBy (absorb · STAFF_VISIT). 동행은 HB 만. */
const MEET_K = { dept: '부서모임', new: '새가족교육', bapt: '침례교육' }, MEET_G = ['청년셀', '장년셀', '기타'];
function normMate(x) { if (!x || typeof x !== 'object') return null; const n = str(x.n, 120); if (!n) return null; const r = { n }, p = str(x.p, 80); if (p) r.p = p; return r; }
function legacyMates(t) { return str(t, 120).split(/\s*[·,、]\s*/).map(n => n.trim()).filter(Boolean).slice(0, 8).map(n => ({ n })); }
function normMeet(x) {
  if (!x || typeof x !== 'object' || Array.isArray(x) || !MEET_K[x.k]) return null;
  const r = { k: x.k };
  if (x.k === 'dept' && MEET_G.includes(x.g)) r.g = x.g;
  if (x.k === 'new') { const w = str(x.who, 60); if (w) r.who = w; }
  if (x.k !== 'dept') { const n = num(x.n); if (n >= 1 && n <= 6) r.n = n; }
  const m = str(x.memo, 240); if (m) r.memo = m;
  return r;
}
function legacyMeet(group, edu) {
  const g = str(group, 120), e = str(edu, 120); if (!g && !e) return null;
  const n = (t) => { const m = /([1-6])\s*차/.exec(t); return m ? +m[1] : 0; };
  if (g) return normMeet({ k: 'dept', g: /청년/.test(g) ? '청년셀' : /장년/.test(g) ? '장년셀' : '기타', memo: [g, e].filter(Boolean).join(' / ') });
  return normMeet({ k: /침례/.test(e) ? 'bapt' : 'new', n: n(e), memo: e });
}
function meetText(m) {
  if (!m || !MEET_K[m.k]) return '';
  const head = m.k === 'dept' ? (m.g || MEET_K.dept) : MEET_K[m.k] + (m.n ? ' ' + m.n + '차' : '');
  return [head, m.who, m.memo].filter(Boolean).join(' · ');
}
// 이름 → 성도 인도자 id (띄어쓰기 무시 · 다른 이름도). 교역자 · 지운 분은 잇지 않는다. 없으면 ''
function mateLink(book, name) { const k = String(name || '').replace(/\s+/g, ''); if (!k) return '';
  const p = live(book.people).find(x => x.kind === 'lay' && [x.name].concat(x.alias || []).some(a => a.replace(/\s+/g, '') === k)); return p ? p.id : ''; }
// 저장할 때: 맞는 이름은 잇고, 같은 분 · 같은 이름 두 번은 한 번
function linkMates(book, list) {
  const out = [], seen = new Set();
  for (const x of list || []) { const m = normMate(x); if (!m) continue; if (!m.p) { const p = mateLink(book, m.n); if (p) m.p = p; }
    const key = m.p ? 'p:' + m.p : 'n:' + m.n.replace(/\s+/g, ''); if (seen.has(key)) continue; seen.add(key); out.push(m); }
  return out.slice(0, 8);
}
function mateName(book, m) { const p = m.p && live(book.people).find(x => x.id === m.p); return p ? p.name : m.n; }
function mateText(book, v) { return ((v && v.mates) || []).map(m => mateName(book, m)).join(' · '); }
/* 부산 요약 표의 칸 → 고칠 판 (1116-2 B). sec = 방문 판의 항목 · i = 숙소 번호(-1 = 새 숙소) · focus = 판에서 먼저 보일 자리.
   금액 → 금액 있는 호텔(없으면 호텔 · 숙소 아무거나) · 취소 기한 → 표에 보이는 가장 이른 기한의 숙소(없으면 환불 불가 · 첫 숙소). 취소한 숙소는 표에 안 보이므로 빼고. */
const STAFF_COLS = ['stay', 'meet', 'travel'];   // travel = 알림 판 '교통 미정' 줄 (1117-Z 2c)
   // 교역자가 자기 방문에서 바로 고칠 수 있는 칸 — 나머지는 요약(보기)으로. 금액 · 취소 기한은 HB 전용(1117-Z 1)이라 교역자 표에 열이 없다
function colTarget(v, col, i) {
  const st = (v.stay || []).map((x, k) => ({ x, k })).filter(o => o.x.status !== 'cancel'), first = (f) => { const o = st.find(f); return o ? o.k : -1; };
  if (col === 'who' || col === 'days') return { sec: 'who', i: -1, focus: col };
  if (col === 'lead') return { sec: 'ev', i: -1, focus: 'lead' };   // 예배 인도는 '예배' 판에 (1116-2 D)
  if (col === 'mate' || col === 'meet') return { sec: col, i: -1, focus: col };
  if (col === 'issue') return { sec: 'issue', i: -1, focus: '' };   // 부산 요약 맨 왼쪽 특이사항 칸 (1117-Z 5b R)
  if (col === 'stay') return { sec: 'stay', i: v.stay && v.stay[+i] ? +i : -1, focus: 'stay' };
  if (col === 'cost') { let k = first(o => o.x.kind === 'hotel' && o.x.cost); if (k < 0) k = first(o => o.x.kind === 'hotel'); if (k < 0) k = first(() => true); return { sec: 'stay', i: k, focus: 'cost' }; }
  if (col === 'travel') return { sec: 'travel', i: -1, focus: '' };   // 알림 판 '교통 미정' (1117-Z 2)
  if (col === 'cancel' && i !== undefined && i !== null && i !== '' && st.some(o => o.k === +i)) return { sec: 'stay', i: +i, focus: 'cancel' };   // 알림 판 — 그 숙소의 기한 (1117-Z 2)
  if (col === 'cancel') { const cb = st.filter(o => stayHotel(o.x) && o.x.cancelBy).sort((a, b) => (a.x.cancelBy < b.x.cancelBy ? -1 : a.x.cancelBy > b.x.cancelBy ? 1 : 0))[0];
    let k = cb ? cb.k : first(o => stayHotel(o.x) && o.x.nofree); if (k < 0) k = first(o => stayHotel(o.x)); if (k < 0) k = first(() => true); return { sec: 'stay', i: k, focus: 'cancel' }; }
  return null;
}
/* ---- 고르는 목록(opts): 숙소 · 교통편 · 특이사항 갈래 ---- */
const OPT_TYPES = ['stay', 'mode', 'cat'];
const OPT_DEFAULTS = { mode: ['KTX', '자차'], cat: ['예배팀', '장년부', '청년부', '중고등부', '초등부', '영유아유치부', '교회행사', '시설', '새가족', '방문자'] };
function hashStr(t) { let h = 2166136261; for (const c of t) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
function optId(type, name, kind) { return 'o|' + type + '|' + hashStr((kind || '') + '/' + name); }
function normOpt(o) {
  if (!o || typeof o !== 'object') return null;
  const m = /^o\|(stay|mode|cat)\|[a-z0-9]{1,40}$/.exec(String(o.id || '')); if (!m) return null;
  const b = base(o); b.type = m[1]; if (b.del) return b;
  b.name = str(o.name, 60); if (!b.name) return null;
  if (b.type === 'stay') { b.kind = o.kind === 'home' ? 'home' : 'hotel'; b.cost = num(o.cost); if (o.more) b.more = 1; }   // more = '더 보기' 줄 아래(숙소 판에서 접힘, 1117-Z 5)
  b.ord = typeof o.ord === 'number' && isFinite(o.ord) ? Math.max(0, Math.min(9999, Math.round(o.ord))) : 999;
  return b;
}
// 그 종류의 목록 — 저장된 것이 하나도 없으면(지운 표지도 없으면) 기본값: 교통편 · 갈래는 OPT_DEFAULTS, 숙소는 지금까지 방문에 적힌 이름(많이 쓴 순)
function optDefaults(book, type) {
  if (type !== 'stay') return OPT_DEFAULTS[type].map((name, i) => ({ id: optId(type, name), type, name, ord: i }));
  const n = {};
  for (const v of live(book.visits)) for (const st of v.stay) if (st.name && st.status !== 'cancel') { const k = st.kind + '/' + st.name; n[k] = n[k] || { kind: st.kind, name: st.name, c: 0 }; n[k].c++; }
  return Object.values(n).sort((a, b) => b.c - a.c || a.name.localeCompare(b.name, 'ko')).slice(0, 40).map((x, i) => ({ id: optId('stay', x.name, x.kind), type: 'stay', name: x.name, kind: x.kind, cost: 0, ord: i }));
}
function optList(book, type) {
  const own = (book.opts || []).filter(o => o.type === type);
  const list = own.length ? own.filter(o => !o.del) : optDefaults(book, type);
  return list.slice().sort((a, b) => a.ord - b.ord || a.name.localeCompare(b.name, 'ko'));
}
// 처음 고칠 때: 기본값을 정해진 id 로 적어 둔다 (두 기기가 따로 해도 같은 줄이 된다)
function ensureOpts(book, type, by, now) {
  if ((book.opts || []).some(o => o.type === type)) return;
  for (const o of optDefaults(book, type)) put(book, 'opts', o, by, now);
}
function optAdd(book, type, name, extra, by, now) {
  name = str(name, 60); if (!name) return null; ensureOpts(book, type, by, now);
  const kind = type === 'stay' ? ((extra && extra.kind) === 'home' ? 'home' : 'hotel') : '';
  const same = optList(book, type).find(o => o.name === name && (o.kind || '') === kind); if (same) return same.id;
  const id = optId(type, name, kind), ord = optList(book, type).reduce((m, o) => Math.max(m, o.ord), -1) + 1;
  put(book, 'opts', Object.assign({ id, name, ord }, type === 'stay' ? { kind, cost: num(extra && extra.cost) } : {}), by, now);
  return id;
}
// 순서 바꾸기: 지금 순서대로 0,1,2… 를 매기고 이웃과 맞바꾼다
function optMove(book, type, id, dir, by, now) {
  ensureOpts(book, type, by, now);
  const list = optList(book, type), i = list.findIndex(o => o.id === id), j = i + dir; if (i < 0 || j < 0 || j >= list.length) return false;
  [list[i], list[j]] = [list[j], list[i]];
  list.forEach((o, k) => { if (o.ord !== k) put(book, 'opts', Object.assign({}, o, { ord: k }), by, now); });
  return true;
}
// 끌어서 순서 바꾸기 (1116-2 C): ids = 화면에 보인 차례(숙소는 호텔 · 댁 한쪽만). 그 줄들이 있던 자리에 새 차례로 넣고 0,1,2… 를 다시 매긴다
// 숙소 목록 관리의 '더 보기' 줄(1117-Z 5): ids 안에 OPT_MORE 가 있으면 그 뒤 줄은 more = 1(숙소 판에서 접힘), 앞 줄은 more 없앰. 없으면 more 는 그대로.
const OPT_MORE = '-more-';
function optReorder(book, type, ids, by, now) {
  ensureOpts(book, type, by, now);
  const raw = ids || [], cut = type === 'stay' ? raw.indexOf(OPT_MORE) : -1;
  const list = optList(book, type), want = raw.filter((id, k, a) => a.indexOf(id) === k && list.some(o => o.id === id));
  const set = new Set(want), slots = list.map((o, k) => (set.has(o.id) ? k : -1)).filter(k => k >= 0), next = list.slice();
  slots.forEach((k, j) => { next[k] = list.find(o => o.id === want[j]); });
  const below = new Set(cut >= 0 ? raw.slice(cut + 1) : []), moreOf = (o) => (cut < 0 || !set.has(o.id) ? !!o.more : below.has(o.id));
  if (!next.some((o, k) => o !== list[k] || moreOf(o) !== !!o.more)) return false;   // 차례 · 더 보기가 그대로면 아무것도 안 쓴다
  next.forEach((o, k) => { const mo = moreOf(o); if (o.ord === k && mo === !!o.more) return;
    const n = Object.assign({}, o, { ord: k }); if (mo) n.more = 1; else delete n.more; put(book, 'opts', n, by, now); });
  return true;
}
// 이름(· 평소 금액 · 종류) 고치기 — 숙소는 지난 방문 기록의 이름도 같이, 특이사항 갈래는 적힌 특이사항의 갈래도 같이
function optEdit(book, id, patch, by, now) {
  const cur = (book.opts || []).find(o => o.id === id && !o.del); if (!cur) return 0;
  const next = Object.assign({}, cur, patch); next.name = str(next.name, 60) || cur.name;
  put(book, 'opts', next, by, now);
  return next.name !== cur.name || (next.kind || '') !== (cur.kind || '') ? renameInVisits(book, cur.type, cur.name, cur.kind, next.name, next.kind, by, now) : 0;
}
function renameInVisits(book, type, from, fromKind, to, toKind, by, now) {
  let n = 0;
  for (const v of live(book.visits)) { const nv = JSON.parse(JSON.stringify(v)); let hit = false;
    if (type === 'stay') for (const st of nv.stay) if (st.name === from && st.kind === fromKind) { st.name = to; st.kind = toKind || st.kind; hit = true; }
    if (type === 'cat') for (const x of nv.issues || []) if (x.cat === from) { x.cat = to; hit = true; }
    if (type === 'mode') for (const t of nv.travel) if (t.mode === from) { t.mode = to; hit = true; }
    if (hit) { put(book, 'visits', nv, by, now); n++; } }
  return n;
}
// 합치기: A 를 B 로 — 지난 기록의 A 를 모두 B 로 바꾸고 A 는 목록에서 지운다
function optMerge(book, fromId, toId, by, now) {
  const a = (book.opts || []).find(o => o.id === fromId && !o.del), b = (book.opts || []).find(o => o.id === toId && !o.del); if (!a || !b || a.type !== b.type || a === b) return -1;
  const n = renameInVisits(book, a.type, a.name, a.kind, b.name, b.kind, by, now);
  drop(book, 'opts', a.id, by, now); return n;
}
// 목록에 없는데 방문 기록에만 있는 숙소 이름 (손으로 적었거나 옛 기록)
function strayStays(book) {
  const have = new Set(optList(book, 'stay').map(o => o.kind + '/' + o.name)), n = {};
  for (const v of live(book.visits)) for (const st of v.stay) if (st.name && !have.has(st.kind + '/' + st.name)) { const k = st.kind + '/' + st.name; n[k] = n[k] || { kind: st.kind, name: st.name, c: 0 }; n[k].c++; }
  return Object.values(n).sort((a, b) => b.c - a.c);
}
// 박수는 머무는 요일에서 (토일 = 1박, 금토일 = 2박, 하루면 1박)
function autoNights(v) { return Math.max(1, stayDates(v).length - 1); }
function markId(sun) { return 'm|' + sun; }
function normMark(o) {
  if (!o || typeof o !== 'object') return null;
  const sun = String(o.id || '').slice(2); if (String(o.id).slice(0, 2) !== 'm|' || !isYmd(sun) || dowOf(sun) !== 0) return null;
  const b = base(o); b.sun = sun; if (b.del) return b;
  b.tags = Array.isArray(o.tags) ? [...new Set(o.tags.map(t => str(t, 20)).filter(Boolean))].slice(0, 6) : [];
  b.note = str(o.note, 300);
  return b;
}
/* 부산 상영 (R12 C4b, HB 11/16) — 주일마다 한 줄: shows = [{ id: 's|주일', sun, bs: same | diff | none }]. 줄이 없으면 '아직 안 고름'.
   광고(영상 · 구두)는 책에 넣지 않는다(매번 Monday 에서 새로 읽음, 이 기기 사본만) — 사람이 고른 상영 하나만 계정에.
   교역자는 자기 칸의 그 방문 줄(visits[방문 id])에 bs · bsAt 를 적고(보안 규칙이 이미 허락하는 칸 안), absorb 가 그 방문의 주일 줄로 옮긴다. */
function showId(sun) { return 's|' + sun; }
function normShow(o) {
  if (!o || typeof o !== 'object') return null;
  const sun = String(o.id || '').slice(2); if (String(o.id).slice(0, 2) !== 's|' || !isYmd(sun) || dowOf(sun) !== 0) return null;
  const b = base(o); b.sun = sun; if (b.del) return b;
  if (!ADS_BS[o.bs]) return null;
  b.bs = o.bs; return b;
}
function showOf(book, sun) { const r = ((book && book.shows) || []).find(x => x.id === showId(sun) && !x.del); return r ? r.bs : ''; }
/* 전달용 텍스트 (1117-Z 4, HB 11/18) — 카톡 글을 사람이 고쳤으면 주일마다 한 줄: adtx = [{ id: 't|주일', sun, tx }].
   줄이 없으면(또는 지우기 표지면) 앱이 만든 글(adsText). ↻ = 지우기 표지. 다른 기기 · 교역자까지 공통(HB 답).
   고치는 사람 = 상영을 고르는 사람(HB · 그 주일 부산 교역자 · 그 달 주보 담당) — 교역자는 자기 칸 그 방문 줄 tx · txAt → absorb.
   상영 줄(shows)과 따로 둔다: 줄 하나에 두 사람의 칸이 들면 나중에 고친 줄이 다른 칸까지 덮는다. */
const ADTX_MAX = 3000;
function adtxId(sun) { return 't|' + sun; }
const adtxClean = (t) => String(t == null ? '' : t).replace(/\r\n?/g, '\n').slice(0, ADTX_MAX);
function normAdtx(o) {
  if (!o || typeof o !== 'object') return null;
  const sun = String(o.id || '').slice(2); if (String(o.id).slice(0, 2) !== 't|' || !isYmd(sun) || dowOf(sun) !== 0) return null;
  const b = base(o); b.sun = sun; if (b.del) return b;
  const tx = adtxClean(o.tx); if (!tx.trim()) return null;
  b.tx = tx; return b;
}
function adtxOf(book, sun) { const r = ((book && book.adtx) || []).find(x => x.id === adtxId(sun) && !x.del); return r ? r.tx : ''; }
// 화면 · 복사에 쓸 글 — 고친 글이 있으면 그것, 없으면 만든 글. edited = 고친 글이고 만든 글과 다름
function adtxPick(book, sun, auto) { const t = adtxOf(book, sun); return t && t !== auto ? { text: t, edited: true } : { text: auto || '', edited: false }; }
/* ---- 주보 담당 (1117-Z 2c, HB 11/18) — 한 달씩 ㄱㄴㄷ 순으로 돈다 ----
   people[].bul = 순번에 듦. buls = 달마다 직접 정한 담당 [{ id: 'u|YYYY-MM', ym, p }].
   정하지 않은 달은 그 앞에서 가장 가까운 정한 달부터 ㄱㄴㄷ(이름) 순으로 센다. 정한 달이 하나도 없으면 아무도 아님.
   그 달 주보 담당은 그 달 주일의 부산 상영을 보고 고른다(bsCan · absorb). */
const YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
function bulId(ym) { return 'u|' + ym; }
function normBul(o) {
  if (!o || typeof o !== 'object') return null;
  const ym = String(o.id || '').slice(2); if (String(o.id).slice(0, 2) !== 'u|' || !YM_RE.test(ym)) return null;
  const b = base(o); b.ym = ym; if (b.del) return b;
  b.p = str(o.p, 40); return b.p ? b : null;
}
function bulOrder(book) { return live(book.people).filter(p => p.bul).sort((a, c) => a.name.localeCompare(c.name, 'ko')); }
function monthDiff(a, b) { return (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)); }
// 그 달(YYYY-MM)의 주보 담당 사람 id — 없으면 ''
function bulOf(book, ym) {
  if (!YM_RE.test(String(ym || ''))) return '';
  const set = live(book.buls || []).filter(x => x.ym <= ym).sort((a, c) => (a.ym < c.ym ? 1 : -1))[0]; if (!set) return '';
  if (set.ym === ym) return set.p;
  const ord = bulOrder(book); if (!ord.length) return '';
  let at = ord.findIndex(p => p.id === set.p);
  if (at < 0) { const a = live(book.people).find(p => p.id === set.p); if (!a) return ''; at = ord.filter(p => p.name.localeCompare(a.name, 'ko') < 0).length - 1; }   // 순번에서 빠진 분이면 그 이름 다음 분부터
  return ord[(((at + monthDiff(set.ym, ym)) % ord.length) + ord.length) % ord.length].id;
}
const LISTS = { people: normPerson, slots: normSlot, visits: normVisit, marks: normMark, opts: normOpt, shows: normShow, specs: normSpec, buls: normBul, adtx: normAdtx };
function normBook(o) {
  const b = { v: 1, at: num(o && o.at) };
  for (const [k, fn] of Object.entries(LISTS)) {
    const seen = new Map();
    for (const x of (o && Array.isArray(o[k]) ? o[k] : [])) { const n = fn(x); if (n) seen.set(n.id, newer(seen.get(n.id), n)); }
    b[k] = [...seen.values()].sort((a, c) => (a.id < c.id ? -1 : a.id > c.id ? 1 : 0));
  }
  return b;
}

/* ---- 기기 사본 ↔ 계정 맞추기 ----
   줄마다 따로: 같은 id 면 나중에 고친 것(at)이 이긴다. 한쪽에만 있는 줄은 그대로 남는다 — 그래서 **맞추기는 아무것도 지우지 않는다.**
   지우는 것은 사람이 누른 '지우기' 표지(del)뿐이다. 표지는 버리지 않는다(버리면 낡은 기기의 줄이 되살아난다).
   at 이 같으면 **긴 쪽**(칸이 더 많은 쪽 — 낡은 앱이 모르는 칸을 떨군 사본이 이기지 못하게), 그래도 같으면 글자로 큰 쪽.
   두 기기가 어느 순서로 맞춰도 같은 답이 나오게. */
function newer(a, b) {
  if (!a) return b; if (!b) return a;
  if (a.at !== b.at) return a.at > b.at ? a : b;
  const ja = JSON.stringify(a), jb = JSON.stringify(b);
  if (ja.length !== jb.length) return ja.length > jb.length ? a : b;
  return ja >= jb ? a : b;
}
function mergeBook(x, y) {
  const a = normBook(x), c = normBook(y);
  const o = { at: Math.max(a.at, c.at) }; for (const k of Object.keys(LISTS)) o[k] = [...a[k], ...c[k]];
  return normBook(o);
}
function sameBook(x, y) { const a = normBook(x), c = normBook(y); a.at = c.at = 0; return JSON.stringify(a) === JSON.stringify(c); }
function isEmptyBook(x) { const b = normBook(x); return !Object.keys(LISTS).some(k => b[k].length); }
// 계정에서 받은 것과 이 기기 것 — 합친 결과와, 계정에 다시 올려야 하는지
function pickBook(local, cloud) {
  if (!cloud) return { book: normBook(local), push: !isEmptyBook(local) };
  const m = mergeBook(local, cloud);
  return { book: m, push: !sameBook(m, cloud) };
}
/* 계정 문서 rota/{uid} 의 칸들 — 모양이 바뀔 때마다 새 칸을 연다 (낡은 앱이 모르는 칸을 떨군 채 덮어쓰지 못하게):
   book = R1(v. 26-1114-1) · b2 = R2 ~ v. 26-1114-4 · b3 = v. 26-1114-5 부터(성도 인도자 · 숙소 취소 기한 · 사진 · 요일 하나씩).
   읽을 때는 모두 합친다(맞추기는 지우지 않으니 옛 칸에만 있는 것도 살아난다). 쓸 때는 WRITE_FIELD 하나 + 옛 칸은 지운다(OLD_FIELDS) —
   문서 한 장 1MB 에 같은 책이 여러 벌 쌓이지 않게. 낡은 앱이 다시 옛 칸에 써도 다음에 또 합치고 지운다. */
const OLD_FIELDS = ['book', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11', 'b12', 'b13', 'b14', 'b15', 'b16', 'b17'], WRITE_FIELD = 'b18';   // b7 = v. 26-1115-1 부터(칸마다 고친 때 · 가능 일정 — R6) · b8 = v. 26-1116-3 부터(부산 주일예배 · LL 인도 — R11) · b9 = v. 26-1116-4 부터(인도 세 갈래 lead — R12 A) · b10 = v. 26-1116-11 부터(부산 상영 shows — R12 C4b) · b11 = v. 26-1117-1 부터(동행 mates · 모임 meet — 1116-2 B) · b12 = v. 26-1117-2 부터(숙소 상태 '예약 전 / 대화 전' pre — 1116-2 C, 낡은 앱은 pre 를 '미정' 으로 떨군다) · b13 = v. 26-1117-4 부터(부산 일정 이름 title · 더한 예배 evs — 1116-2 D) · b14 = v. 26-1117-6 부터(분당 특별예배 specs · 그 자리 '날짜|xk|역할' — 1116-2 E, 낡은 앱은 둘 다 떨군다) · b15 = v. 26-1118-4 부터(주보 담당 people[].bul · buls — 1117-Z 2c) · b16 = v. 26-1118-10 부터(전달용 텍스트 adtx — 1117-Z 4) · b17 = v. 26-1118-11 부터(숙소 목록 '더 보기' 아래 표시 opts[].more — 1117-Z 5) · b18 = v. 26-1118-12 부터(메모 '중요' visits[].hot — 1117-Z 5b)
function pickDoc(local, doc) {
  const cur = doc && doc[WRITE_FIELD] ? doc[WRITE_FIELD] : null;
  const olds = OLD_FIELDS.map(k => doc && doc[k]).filter(Boolean);
  if (!cur && !olds.length) return pickBook(local, null);
  let m = normBook(local); for (const o of olds) m = mergeBook(m, o); if (cur) m = mergeBook(m, cur);
  // ⚠️ 옛 칸이 있다는 것만으로는 다시 쓰지 않는다 (1117-Z 2 고침, 11/18): 낡은 앱이 다른 기기 · 숨은 탭에 열려 있으면
  //   낡은 앱이 옛 칸에 씀 → 새 앱이 지우며 씀 → 낡은 앱이 또 씀 … 이 끝없이 돌아 1초에 수십 번 다시 그렸다(목록 스크롤이 맨 위로).
  //   합친 책이 지금 칸과 같으면 그대로 둔다 — 옛 칸은 다음에 실제로 고칠 때(cloudSave) 함께 지운다.
  return { book: m, push: !cur || !sameBook(m, cur) };
}


/* ---- 함께 쓰기 (R6) ----
   HB 책(rota/{HB uid})은 옮기지 않는다. 사람 탭 '계정 이메일' 이 든 분만 읽을 수 있게 그 목록(team)을 문서에 붙이고,
   교역자는 자기 칸 rota/{HB uid}/staff/{자기 uid} 에만 쓴다(보안 규칙은 '자기 uid · 자기 이메일' 만 본다 — 책 안의 어느 줄인지는 규칙이 못 가린다).
   무엇을 받아들일지는 여기서 정한다(absorb): 그 이메일의 사람 한 분 · 그 분이 든 부산 방문의 숙소 · 교통 · 그 분의 부재 · 가능 일정만.
   칸마다 고친 때로 겨뤄 나중 것이 이긴다. 교역자 칸은 지우지 않으니, 어느 기기가 늦게 받아도 다시 맞춰진다. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
function teamOf(book) { return [...new Set(live(normBook(book).people).map(p => p.email).filter(Boolean))].sort().slice(0, 60); }
// 교역자가 자기 방문에 적는 칸 → 다듬기(모양이 틀리면 undefined = 버림). 모임은 null = 비움 (1116-2 B)
const STAFF_VISIT = {
  stay: (a) => (Array.isArray(a) ? a.map(normStay).filter(Boolean).slice(0, 8) : undefined),
  travel: (a) => (Array.isArray(a) ? a.map(normTravel).filter(Boolean).slice(0, 8) : undefined),
  meet: (x) => (x === null || (x && typeof x === 'object' && !Array.isArray(x)) ? normMeet(x) : undefined),
};
function normStaff(o) {
  if (!o || typeof o !== 'object') return null;
  const email = str(o.email, 80).toLowerCase(); if (!EMAIL_RE.test(email)) return null;
  const s = { email, at: num(o.at), visits: {} };
  const vs = o.visits && typeof o.visits === 'object' && !Array.isArray(o.visits) ? o.visits : {};
  for (const k of Object.keys(vs).filter(k => /^v\|/.test(k) && isYmd(k.slice(2))).sort().slice(-200)) {
    const e = vs[k]; if (!e || typeof e !== 'object') continue; const n = {};
    for (const f of Object.keys(STAFF_VISIT)) { const val = f in e ? STAFF_VISIT[f](e[f]) : undefined; if (val !== undefined && num(e[f + 'At'])) { n[f] = val; n[f + 'At'] = num(e[f + 'At']); } }
    if (ADS_BS[e.bs] && num(e.bsAt)) { n.bs = e.bs; n.bsAt = num(e.bsAt); }   // 부산 상영 (C4b) — 그 방문의 주일 줄로 간다
    if (typeof e.tx === 'string' && num(e.txAt)) { n.tx = adtxClean(e.tx); n.txAt = num(e.txAt); }   // 전달용 텍스트 (1117-Z 4) — '' = 원래 글로
    if (Object.keys(n).length) s.visits[k] = n;
  }
  for (const f of ['away', 'can']) if (Array.isArray(o[f]) && num(o[f + 'At'])) { s[f] = ranges(o[f]); s[f + 'At'] = num(o[f + 'At']); }
  return s;
}
// 교역자 칸들 → 책. 바뀐 줄 id 를 함께 돌려준다(바뀐 게 없으면 같은 책). 넣는 책은 고치지 않는다.
function absorb(book, staffs) {
  book = normBook(book);
  const byEmail = {}; for (const p of live(book.people)) if (p.email) byEmail[p.email] = p;
  const best = {};   // '목록|줄 id' → { 칸: { val, at, by } } — 모두 모은 뒤 한 번에 넣는다(교역자 순서와 상관없이 같은 결과)
  const shows = {};  // 부산 상영(C4b): 주일 줄 id → { bs, at, by } — 줄 하나에 칸 하나라 줄의 고친 때(at)로 겨룬다
  const txs = {};    // 전달용 텍스트(1117-Z 4): 주일 줄 id → { tx, at, by } — 상영과 같은 사람 · 같은 겨룸
  const offer = (list, row, f, val, at, by) => {
    if (!(at > (row[f + 'At'] || 0))) return;
    const k = list + '|' + row.id, b = best[k] || (best[k] = {});
    if (!b[f] || at > b[f].at || (at === b[f].at && by < b[f].by)) b[f] = { val, at, by };
  };
  for (const raw of staffs || []) {
    const s = normStaff(raw); if (!s) continue;
    const p = byEmail[s.email]; if (!p) continue;   // 사람 탭에 그 이메일이 없으면 받지 않는다
    for (const f of ['away', 'can']) if (s[f + 'At']) offer('people', p, f, s[f], s[f + 'At'], p.id);
    for (const vid of Object.keys(s.visits)) {
      const v = book.visits.find(x => x.id === vid); if (!v || v.del) continue;
      const mine = v.who.includes(p.id), bulMe = !!vSun(v) && bulOf(book, vSun(v).slice(0, 7)) === p.id;   // 그 달 주보 담당은 상영만 (1117-Z 2c)
      if (!mine && !bulMe) continue;   // 자기가 든 방문만
      const e = s.visits[vid];
      if (mine) for (const f of Object.keys(STAFF_VISIT)) if (e[f + 'At']) offer('visits', v, f, f === 'stay' ? stayKeep(v.stay, e.stay) : e[f], e[f + 'At'], p.id);   // 숙소의 금액 · 기한은 HB 책 것 그대로 (1117-Z 1)
      if (e.bsAt && vSun(v)) { const id = showId(vSun(v)), cur = book.shows.find(x => x.id === id), b = shows[id];
        if (e.bsAt > ((cur && cur.at) || 0) && (!b || e.bsAt > b.at || (e.bsAt === b.at && p.id < b.by))) shows[id] = { bs: e.bs, at: e.bsAt, by: p.id }; }
      if (e.txAt && vSun(v)) { const id = adtxId(vSun(v)), cur = book.adtx.find(x => x.id === id), b = txs[id];
        if (e.txAt > ((cur && cur.at) || 0) && (!b || e.txAt > b.at || (e.txAt === b.at && p.id < b.by))) txs[id] = { tx: e.tx, at: e.txAt, by: p.id }; }
    }
  }
  const changed = [];
  for (const k of Object.keys(best).sort()) {
    const [list, id] = [k.slice(0, k.indexOf('|')), k.slice(k.indexOf('|') + 1)];
    const cur = book[list].find(x => x.id === id), n = Object.assign({}, cur); let top = 0;
    for (const f of Object.keys(best[k])) { const b = best[k][f];
      if (Array.isArray(b.val) && !b.val.length && list === 'people') delete n[f]; else n[f] = b.val;
      n[f + 'At'] = b.at; n[f + 'By'] = b.by; top = Math.max(top, b.at); }
    n.at = Math.max((cur.at || 0) + 1, top); n.by = 'staff:' + (best[k][Object.keys(best[k])[0]].by);
    const nn = LISTS[list](n); if (!nn) continue;
    book[list] = book[list].map(x => (x.id === id ? nn : x));
    book.at = Math.max(book.at || 0, nn.at); changed.push(id);
  }
  for (const id of Object.keys(shows).sort()) { const b = shows[id], n = normShow({ id, at: b.at, by: 'staff:' + b.by, bs: b.bs }); if (!n) continue;
    book.shows = book.shows.filter(x => x.id !== id).concat(n).sort((a, c) => (a.id < c.id ? -1 : 1)); book.at = Math.max(book.at || 0, n.at); changed.push(id); }
  for (const id of Object.keys(txs).sort()) { const b = txs[id], cur = book.adtx.find(x => x.id === id);
    const n = b.tx.trim() ? normAdtx({ id, at: b.at, by: 'staff:' + b.by, tx: b.tx }) : { id, at: b.at, by: 'staff:' + b.by, del: true, sun: id.slice(2) };
    if (!n || (n.del && (!cur || cur.del))) continue;   // 없는 글을 되돌리기는 할 일이 없다
    book.adtx = book.adtx.filter(x => x.id !== id).concat(n).sort((a, c) => (a.id < c.id ? -1 : 1)); book.at = Math.max(book.at || 0, n.at); changed.push(id); }
  return { book, changed };
}
/* ---- 숙소 금액 · 취소 기한은 HB 전용 (1117-Z 1, HB 11/17) ----
   금액(cost) · 취소 기한(cancelBy · cancelAt) · 환불 불가(nofree) · 예약 화면 사진(imgs) · 숙소 목록의 평소 금액.
   교역자 앱은 받은 책에서 이것을 걷어 내고 그린다(hidePriv — staffView 한 곳). 교역자 칸에서 온 값은 받지 않는다 —
   absorb 가 숙소를 받을 때 이 칸들은 HB 책의 같은 숙소(종류 + 이름) 것을 그대로 둔다(stayKeep). 이미 책에 든 값은 지우지 않는다.
   ⚠️ 보안 규칙상 교역자는 HB 책 전체를 읽을 수 있다 — 이것은 '화면 감춤' 이다. 자료까지 막으려면 책 밖(HB 만 읽는 칸)으로 옮겨야 한다. */
const STAY_PRIV = ['cost', 'cancelBy', 'cancelAt', 'nofree', 'imgs'];
function stayPub(s) { const o = Object.assign({}, s); for (const f of STAY_PRIV) delete o[f]; o.cost = 0; return o; }
// 교역자가 보낸 숙소 목록(next)에 HB 책(cur)의 금액 · 기한을 되입힌다 — 같은 종류 + 같은 이름(이름이 비면 같은 자리)의 숙소만. 맞는 것이 없으면 비운다.
function stayKeep(cur, next) {
  cur = cur || []; const used = new Set();
  return (next || []).map((s0, i) => { const s = stayPub(s0);
    let k = s.name ? cur.findIndex((c, j) => !used.has(j) && c.kind === s.kind && c.name === s.name) : (cur[i] && !cur[i].name && cur[i].kind === s.kind && !used.has(i) ? i : -1);
    if (k < 0) return s; used.add(k);
    for (const f of STAY_PRIV) if (cur[k][f] !== undefined) s[f] = Array.isArray(cur[k][f]) ? cur[k][f].slice() : cur[k][f];
    return s; });
}
// 교역자 화면용 책 — 숙소의 금액 · 기한 · 사진, 목록의 평소 금액을 걷어 낸다. 넣은 책은 고치지 않는다.
function hidePriv(book) {
  const b = Object.assign({}, book);
  b.visits = (book.visits || []).map(v => (v.del || !Array.isArray(v.stay) ? v : Object.assign({}, v, { stay: v.stay.map(stayPub) })));
  b.opts = (book.opts || []).map(o => (o.type === 'stay' && o.cost ? Object.assign({}, o, { cost: 0 }) : o));
  return b;
}
// 교역자 앱이 자기 칸에 쓸 조각 — set(…, { merge: true }) 로 그 방문 · 그 칸만 바뀐다
function staffPatch(email, kind, key, val, now) {
  if (kind === 'stay') return { email, at: now, visits: { [key]: { stay: (val || []).map(stayPub), stayAt: now } } };   // 금액 · 기한은 싣지 않는다(HB 전용, 1117-Z 1)
  if (kind === 'travel') return { email, at: now, visits: { [key]: { [kind]: val, [kind + 'At']: now } } };
  // 모임 — 칸을 모두 적는다: Firestore 합치기(merge)는 객체 안으로 들어가 합치므로, 빠진 칸이 있으면 옛 값(메모 등)이 남는다
  if (kind === 'meet') { const m = normMeet(val); return { email, at: now, visits: { [key]: { meet: m ? { k: m.k, g: m.g || '', who: m.who || '', n: m.n || 0, memo: m.memo || '' } : null, meetAt: now } } }; }
  if (kind === 'bs') return ADS_BS[val] ? { email, at: now, visits: { [key]: { bs: val, bsAt: now } } } : null;   // 부산 상영 — 그 방문 줄 안(규칙이 허락하는 visits 칸)
  if (kind === 'tx') { const t = adtxClean(val); return { email, at: now, visits: { [key]: { tx: t.trim() ? t : '', txAt: now } } }; }   // 전달용 텍스트 — '' = 원래 글로 (1117-Z 4)
  if (kind === 'away' || kind === 'can') return { email, at: now, [kind]: val, [kind + 'At']: now };
  if (kind === 'ui') return { email, at: now, ui: normUi(Object.assign({}, val, { at: now }), true) };   // 내 화면 취향 — 책에는 안 들어간다 (R8b)
  return null;
}
// 그 조각을 이 기기 사본에 합친다 (Firestore 의 merge 와 같은 모양: 객체는 안으로, 배열 · 값은 통째로)
function staffMerge(doc, patch) {
  const out = JSON.parse(JSON.stringify(doc || {}));
  (function into(t, p) { for (const k of Object.keys(p)) { const v = p[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) { if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {}; into(t[k], v); } else t[k] = v; } })(out, patch || {});
  return out;
}
// 교역자 앱이 방문을 고쳤을 때 자기 칸에 쓸 것 — 숙소 · 교통 · 모임 중 바뀐 것만 (다른 칸은 교역자가 못 고친다 — 바뀌었어도 버린다)
function staffEdits(oldV, newV) {
  const a = normVisit(oldV), b = normVisit(newV); if (!a || !b || a.del || b.del || a.id !== b.id) return [];
  return Object.keys(STAFF_VISIT).filter(f => JSON.stringify(a[f]) !== JSON.stringify(b[f])).map(f => ({ kind: f, val: b[f] }));
}
// 로그인한 이메일의 사람 (교역자 앱 · 내 일정)
function personByEmail(book, email) { email = String(email || '').toLowerCase(); return email ? live(book.people).find(p => p.email === email) || null : null; }
/* ---- 한 줄 바꾸기 (화면이 부른다) ---- */
// 교역자도 적는 칸 — 바뀌면 그 칸의 고친 때를 지금으로, '누가(교역자)' 표시는 지운다 (R6, absorb 와 겨룸)
const STAMPED = { visits: ['stay', 'travel', 'meet'], people: ['away', 'can'] };
function put(book, list, item, by, now) {
  const fn = LISTS[list]; const it = Object.assign({}, item, { at: now, by });
  if (STAMPED[list]) { const n0 = fn(it), cur = book[list].find(x => x.id === it.id);
    if (n0 && !n0.del) for (const f of STAMPED[list]) if (JSON.stringify(n0[f] || []) !== JSON.stringify((cur && !cur.del && cur[f]) || [])) { it[f + 'At'] = now; delete it[f + 'By']; } }
  const n = fn(it);
  if (!n) return false;
  book[list] = book[list].filter(x => x.id !== n.id).concat(n).sort((a, c) => (a.id < c.id ? -1 : 1));
  book.at = Math.max(book.at || 0, now);
  return true;
}
function drop(book, list, id, by, now) {
  const cur = book[list].find(x => x.id === id); if (!cur || cur.del) return false;
  const t = { id, at: now, by, del: true };   // 다듬은 줄과 같은 칸 순서 — 기기마다 글자까지 같게
  if (list === 'slots') { const [date, svc, role] = id.split('|'); Object.assign(t, { date, svc, role }); }
  if (list === 'visits') t.date = id.slice(2);
  if (list === 'marks' || list === 'shows' || list === 'adtx') t.sun = id.slice(2);
  if (list === 'specs') { t.date = id.split('|')[1]; t.k = +id.split('|')[2]; }
  if (list === 'buls') t.ym = id.slice(2);
  if (list === 'opts') t.type = id.split('|')[1];
  book[list] = book[list].map(x => (x.id === id ? t : x)); book.at = Math.max(book.at || 0, now);
  return true;
}
const live = (list) => (list || []).filter(x => !x.del);
function newPersonId(now, rnd) { return 'p' + now.toString(36) + Math.floor(rnd * 1e6).toString(36); }
// 자리에 사람을 넣거나 뺀다 — 비면 지우기 표지로 (빈 줄을 남기지 않는다)
function setSlot(book, id, who, txt, by, now) {
  who = ids(who); txt = str(txt, 30);
  const cur = book.slots.find(x => x.id === id && !x.del);
  if (!who.length && !txt) return cur ? drop(book, 'slots', id, by, now) : false;
  if (cur && JSON.stringify(cur.who) === JSON.stringify(who) && cur.txt === txt) return false;
  return put(book, 'slots', Object.assign({}, cur || {}, { id, who, txt }), by, now);
}

/* ---- 시트 기록 가져오기 (R3) ----
   가져오기 파일(JSON, kind 'rota-import')은 HB 의 두 구글 시트에서 뽑은 것이다 — ⚠️ 실제 이름이 들어 있어 저장소에 두지 않는다.
   이름 → 사람: 같은 이름이 있으면 그 사람, 없으면 새로(맡는 일 없음 — 옛 교역자 · 다른 분이라 고르기 판에는 아래에 선다).
   새 사람 id 는 이름에서 정해지게(pn+해시) — 두 기기에서 따로 가져와도 한 사람이 된다.
   모든 줄은 at = 1 로 넣는다 → 이미 앱에서 적은 칸(at 이 더 큼)은 그대로 이기고, 지운 칸도 되살아나지 않는다.
   맞추기와 같은 길(mergeBook)이라 **가져오기는 아무것도 지우지 않는다.** 두 번 가져와도 같다. */
function personIdFor(name) { let h = 2166136261; for (const c of name) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return 'pn' + h.toString(36); }
function importBook(book, imp, by) {
  if (!imp || imp.kind !== 'rota-import' || ![1, 2, 3].includes(imp.v)) return null;
  const IMPORT_AT = imp.v;   // 2판은 1판(at 1)을 덮고, 앱에서 고친 것(at = 고친 때)에는 진다
  book = normBook(book);
  const add = { people: [], slots: [], visits: [], marks: [], opts: [] }, byName = {}, created = [];
  for (const p of live(book.people)) byName[p.name] = p.id;
  const idOf = (n) => { n = str(n, 30); if (!n) return null;
    if (!byName[n]) { const id = personIdFor(n); byName[n] = id;
      if (!book.people.some(p => p.id === id)) { add.people.push({ id, name: n, roles: [], at: IMPORT_AT, by }); created.push(n); } }
    return byName[n]; };
  const names = (a) => (Array.isArray(a) ? a : []).map(idOf).filter(Boolean);
  for (const v of imp.visits || []) if (isYmd(v.date)) add.visits.push(Object.assign({}, v, { id: visitId(v.date), who: names(v.names), at: IMPORT_AT, by }));
  for (const x of imp.slots || []) add.slots.push({ id: x.id, who: names(x.names), txt: x.txt, at: IMPORT_AT, by });
  for (const m of imp.marks || []) if (isYmd(m.sun)) add.marks.push({ id: markId(m.sun), tags: m.tags, note: m.note, at: IMPORT_AT, by });
  // 숙소 목록(3판): 정리된 이름 · 종류 · 평소 금액. 목록을 이미 손댄 종류면(더 나중) 그쪽이 이긴다
  (imp.opts || []).forEach((o, i) => { if (o && o.type === 'stay' && o.name) add.opts.push({ id: optId('stay', str(o.name, 60), o.kind === 'home' ? 'home' : 'hotel'), name: o.name, kind: o.kind, cost: o.cost, ord: i, at: IMPORT_AT, by }); });
  // 사람 구분(성도 인도자 등) — 가져오기 때 생긴 사람(at 이 이번 판보다 작음)만 고친다. 앱에서 손댄 사람은 그대로.
  for (const p of imp.people || []) { const id = idOf(p.name); const cur = book.people.find(x => x.id === id) || add.people.find(x => x.id === id);
    if (cur && !cur.del && cur.at < IMPORT_AT) add.people.push(Object.assign({}, cur, { kind: p.kind, at: IMPORT_AT, by })); else if (cur && cur.at === IMPORT_AT && add.people.includes(cur)) cur.kind = p.kind; }
  const nb = normBook(add), counts = {};
  // 셈: 새로 · 고침(앞 판으로 들어온 줄을 이번 판이 바꿈) · 그대로(앱에서 고친 줄, 또는 같은 내용)
  for (const k of ['visits', 'slots', 'marks']) {
    const have = new Map(book[k].map(x => [x.id, x])); let n = 0, u = 0;
    for (const x of nb[k]) { const h = have.get(x.id); if (!h) n++; else if (h.at < IMPORT_AT && !h.del && JSON.stringify(Object.assign({}, h, { at: 0, by: '' })) !== JSON.stringify(Object.assign({}, x, { at: 0, by: '' }))) u++; }
    counts[k] = n; counts[k + 'Upd'] = u; counts[k + 'Kept'] = nb[k].length - n - u;
  }
  return { book: mergeBook(book, nb), created, counts, v: imp.v };
}

/* ---- 읽기 ---- */
function peopleMap(book) { const m = {}; for (const p of book.people) m[p.id] = p; return m; }
function whoText(book, ids, txt, pm) {
  pm = pm || peopleMap(book);
  const names = (ids || []).map(id => (pm[id] && !pm[id].del ? pm[id].name : '(지운 사람)'));
  if (txt) names.push(txt);
  return names.join(' · ');
}
// 그 주(월~주일)의 부산 방문들 — 날짜순
function weekVisits(book, sun) { const sat = addDays(sun, 6); return live(book.visits).filter(v => v.date >= sun && v.date <= sat).sort((a, b) => (a.date < b.date ? -1 : 1)); }
// 그 주에 머무는 날이 하루라도 걸친 방문 — '금토일' 방문은 금 · 토가 앞 주, 주일이 다음 주라 두 주에 다 보인다 ('이번 주' 화면용)
function weekStays(book, sun) { const sat = addDays(sun, 6); return live(book.visits).filter(v => stayDates(v).some(d => d >= sun && d <= sat)).sort((a, b) => (a.date < b.date ? -1 : 1)); }
// 한 주(그 주일 기준)의 모든 것
// ⚠️ 책 전체를 한 번만 훑는다(1123-B B3d): 예전엔 칸마다(스무 번) 책의 모든 자리를 훑으며 줄마다 날짜 · 열쇠를 다시 셈 —
//   지난 기록이 쌓일수록(3년치 ≈ 300KB) 주간 화면 한 번 그리기가 0.2초(아이패드 느린 쪽 1초)를 먹어 '맞추는 중…' 이 오래 남았다. 고르는 결과는 예전과 같다(같은 id 중 지우지 않은 첫 줄).
function weekPlan(book, sun) {
  const want = new Map(), got = new Map(), slots = {};
  for (const [svc, role] of GRID) want.set(slotId(svcDate(sun, svc), svc, role), svc + '|' + role);
  for (const x of book.slots) { if (x.del) continue; const k = want.get(x.id); if (k && !got.has(k)) got.set(k, x); }
  for (const k of want.values()) if (got.has(k)) slots[k] = got.get(k);   // 칸 차례는 예전처럼 GRID 차례
  const visits = weekVisits(book, sun);
  const mid = markId(sun), mark = book.marks.find(x => x.id === mid && !x.del) || null;
  return { sun, wed: svcDate(sun, 'wed'), fri: svcDate(sun, 'fri'), busanFri: busanFri(addDays(sun, 7)), slots, visits, stays: weekStays(book, sun), mark };
}
// 같은 역할을 여러 예배가 같은 사람으로 맡으면 한 줄로 묶는다: '담임목사님 (1부 · 2부 · 3부 · LL)'
function groupRole(book, plan, role, svcs, pm) {
  const out = [];
  for (const svc of svcs) {
    const s = plan.slots[svc + '|' + role]; if (!s) continue;
    const t = whoText(book, s.who, s.txt, pm); if (!t) continue;
    const g = out.find(x => x.text === t); if (g) g.svcs.push(svc); else out.push({ text: t, svcs: [svc] });
  }
  return out;
}
// 부산 방문 한 줄 요약 (취소한 숙소는 빼고)
function stayText(v) {
  const st = v ? v.stay.filter(s => s.status !== 'cancel') : [];
  return st.map(s => (s.for ? s.for + ' ' : '') + (s.name || (s.kind === 'home' ? '성도님 댁' : '호텔'))).join(' · ');
}
function stayState(v) {
  const st = v ? v.stay.filter(s => s.status !== 'cancel') : [];
  if (!st.length) return 'none';
  if (st.some(s => s.status !== 'done')) return 'open';   // 미정 · 예약 전 · 대화 전 · 대화 중
  return 'done';
}

/* ---- 머무는 날 ----
   days 글자('금토일월')를 실제 날짜로: 글자마다 방문 날짜에서 '앞으로 하루 · 뒤로 엿새' 안의 그 요일.
   (주일 방문의 월 = 다음 날, 목 = 사흘 전 · 수요일 방문의 목 = 다음 날) 요일을 하나씩 골라도(이어지지 않아도) 맞다.
   비어 있으면 주일 방문은 '토일', 다른 날 방문은 그 날 하루. */
function defaultDays(date) { return dowOf(date) === 0 ? '토일' : DOW[dowOf(date)]; }
function dayOff(date, ch) { const k = (DOW.indexOf(ch) - dowOf(date) + 7) % 7; return k > 1 ? k - 7 : k; }
function sortDays(date, chars) { return [...new Set([...chars].filter(c => DOW.includes(c)))].sort((a, b) => dayOff(date, a) - dayOff(date, b)).join(''); }
function stayDates(v) { return [...sortDays(v.date, v.days || defaultDays(v.date))].map(c => addDays(v.date, dayOff(v.date, c))); }
// 고르기 판에 늘어놓을 요일 — 방문 날짜 기준 앞 닷새 ~ 다음 날
function dayChoices(date) { const out = []; for (let k = -5; k <= 1; k++) out.push(DOW[dowOf(addDays(date, k))]); return out; }
// 그 주(주일~토) 이름: '11/15~21', 달이 넘어가면 '11/29~12/5'
// 머무는 기간 글 (R10) — 날짜는 대표 날(주일)로 적지만 보여 줄 때는 머무는 날에서 셈한 기간: '11/13(금)~15(주일)'. 달이 바뀌면 '11/28(토)~12/1(월)', 하루면 그 날만.
function stayPeriod(v) {
  const ds = stayDates(v).slice().sort(), a = ds[0] || v.date, b = ds[ds.length - 1] || v.date, w = (d) => '(' + DOWS[dowOf(d)] + ')';
  return a === b ? mdOf(a) + w(a) : mdOf(a) + w(a) + '~' + (a.slice(0, 7) === b.slice(0, 7) ? +b.slice(8, 10) : mdOf(b)) + w(b);
}
// 그 방문의 부산 예배 인도 — 알약 글 (R11 → R12 A). 인도 예배의 날: 금요 = 방문 주일 이틀 전, 주일 · LL = 방문 주일.
//   교역자 인도는 그 날 머물 때만 보인다(요일을 줄였는데 남은 옛 자료). 성도 · 중계는 교역자가 없는 날일 수 있어 방문의 요일 범위(앞 닷새 ~ 뒤 하루) 안이면 보인다.
//   금요는 금1~3 주에만(부산 금요예배가 있는 주). k(알약 색): fri 보라 · sun 주황 · ll 황토(교역자) / lay 무채색(성도) / relay 옅은 테두리(중계)
function leadDate(v, svc) { const sun = visitSun(v.date); return svc === 'fri' ? addDays(sun, -2) : sun; }
function leadOpen(v, svc) { const d = leadDate(v, svc); return (svc !== 'fri' || !!busanFri(visitSun(v.date))) && d >= addDays(v.date, -5) && d <= addDays(v.date, 1); }
function visitLeads(book, v) {
  const ds = stayDates(v), sun = visitSun(v.date), out = [];
  for (const svc of LEAD_SVC) {
    const l = leadOf(v, svc), d = leadDate(v, svc); if (!l || !leadOpen(v, svc)) continue;
    if (l.m === 'staff' && !ds.includes(d)) continue;
    const nm = svc === 'fri' ? (friName(sun) || '금요') : svc === 'sun' ? '주일예배' : 'LL';
    const p = l.m === 'lay' && l.p ? live(book.people).find(x => x.id === l.p) : null;
    out.push({ k: l.m === 'staff' ? svc : l.m, svc, m: l.m, p: l.p || '', date: d,
      text: l.m === 'staff' ? nm + ' 인도' : l.m === 'lay' ? nm + ' · ' + (p ? p.name : '성도 인도자') : nm + ' 중계' });
  }
  // 더한 예배(1116-2 D) — 머무는 날과 상관없이 늘 보인다(교역자 인도 날은 저장할 때 머무는 날에 더한다). 인도 미정 = k 'none'
  (v.evs || []).forEach((e, i) => {
    const p = e.m === 'lay' && e.p ? live(book.people).find(x => x.id === e.p) : null, pre = DOWS[dowOf(e.d)] + (e.t ? ' ' + e.t : '') + ' ';
    const bare = e.m === 'staff' ? e.n + ' 인도' : e.m === 'lay' ? e.n + ' · ' + (p ? p.name : '성도 인도자') : e.m === 'relay' ? e.n + ' 중계' : e.n;
    out.push({ k: e.m === 'staff' ? 'ev' : e.m || 'none', svc: 'ev' + i, ev: true, m: e.m || '', p: e.p || '', date: e.d, t: e.t || '', n: e.n, bare, text: pre + bare });
  });
  return out;
}
// 머무는 날이 끊김 없이 이어지는가 — 이어지면 기간만 보여 주고, 끊기면(수 · 토 · 주일) '머무는 날' 글자도 함께 보여 준다
function stayWhole(v) { const ds = stayDates(v).slice().sort(); return ds.every((d, i) => !i || d === addDays(ds[i - 1], 1)); }
function weekLabel(sun) { const sat = addDays(sun, 6); return mdOf(sun) + '~' + (sat.slice(5, 7) === sun.slice(5, 7) ? +sat.slice(8, 10) : mdOf(sat)); }
// 그 날 그 사람이 부재인가 — 있으면 그 기간
// 가능 일정(R6 — 교역자가 직접 적음): 그 날 '맡을 수 있다' 고 한 분. 자동 배열이 먼저 고려하고, 고르기 판에 '가능 일정' 으로 보인다
function canOn(book, pid, date) { const p = book.people.find(x => x.id === pid); return (p && !p.del && (p.can || []).find(a => date >= a.from && date <= a.to)) || null; }
function awayOn(book, pid, date) { const p = book.people.find(x => x.id === pid); return (p && !p.del && (p.away || []).find(a => date >= a.from && date <= a.to)) || null; }
// 그 주에 그 사람이 분당에 있어야 하나(고정 조건) — 있으면 걸린 표시
function pinOn(book, pid, sun) { const p = book.people.find(x => x.id === pid), m = book.marks.find(x => x.id === markId(sun) && !x.del);
  return (p && !p.del && m && (p.pin || []).find(t => m.tags.includes(t))) || null; }
// 그 날 그 사람이 부산에 있나 — 있으면 그 방문
function busyOn(book, pid, date) { return live(book.visits).find(v => v.who.includes(pid) && stayDates(v).includes(date)) || null; }

/* ---- 겹침 검사 ----
   bad(빨강, 둘 다 할 수 없음): 부산에 머무는 날 분당 자리를 맡음 — 주일 · 금요 · 수요 모두 '머무는 날' 글자로 판단한다.
   warn(노랑, 확인 필요): 맡지 않는 일 · 지운 사람 · 두 주 연속 부산 · 2주 안인데 숙소 미정 · 극동방송 주인데 동행 없음.
   부재(R5) · 고정 조건은 아직 없다. */
function conflicts(book, from, to, today) {
  const out = [], pm = peopleMap(book), vs = live(book.visits), ss = live(book.slots);
  // 노랑(확인 거리)은 이번 주부터만 — 지난 기록(시트에서 가져온 옛 자리)에 노랑을 깔지 않는다. 빨강은 지난 것도 보인다.
  const mon = today ? sunOf(today) : '';   // 이번 주의 시작(주일)
  const inR = (d) => d >= from && d <= to, inW = (d) => inR(d) && (!mon || d >= mon);
  for (const v of vs) {
    const ds = stayDates(v);
    for (const pid of v.who) for (const d of ds) if (inR(d)) for (const s of ss) if (s.date === d && s.who.includes(pid)) out.push({ level: 'bad', kind: 'overlap', date: d, pid, slot: s.id, visit: v.id });
    // 성도 인도자가 그 날 부산 예배를 인도하는데 분당 자리도 맡음 (R12 A)
    for (const x of visitLeads(book, v)) if (x.m === 'lay' && x.p && inR(x.date)) for (const s of ss) if (s.date === x.date && s.who.includes(x.p)) out.push(Object.assign({ level: 'bad', kind: 'overlap', date: x.date, pid: x.p, slot: s.id, visit: v.id, lead: x.svc }, x.ev ? { lname: x.n } : {}));
  }
  // 부재(빨강) — 지난 기록에도
  for (const s of ss) if (inR(s.date)) for (const pid of s.who) { const a = awayOn(book, pid, s.date); if (a) out.push({ level: 'bad', kind: 'away', date: s.date, pid, slot: s.id, note: a.note || '' }); }
  for (const v of vs) for (const pid of v.who) { const d = stayDates(v).find(x => inR(x) && awayOn(book, pid, x)); if (d) out.push({ level: 'bad', kind: 'away', date: d, pid, visit: v.id, note: awayOn(book, pid, d).note || '' }); }
  for (const s of ss) if (inW(s.date)) for (const pid of s.who) {
    const p = pm[pid];
    if (!p || p.del) out.push({ level: 'warn', kind: 'gone', date: s.date, pid, slot: s.id });
    else if (!canDo(p, s.svc, s.role)) out.push({ level: 'warn', kind: 'role', date: s.date, pid, slot: s.id });
  }
  for (const v of vs) if (inW(v.date)) {
    for (const pid of v.who) {
      const p = pm[pid];
      if (!p || p.del) out.push({ level: 'warn', kind: 'gone', date: v.date, pid, visit: v.id });
      else if (!p.roles.includes('busan')) out.push({ level: 'warn', kind: 'role', date: v.date, pid, visit: v.id });
      const pin = pinOn(book, pid, sunOf(v.date)); if (pin) out.push({ level: 'warn', kind: 'pin', date: v.date, pid, visit: v.id, tag: pin });
      // 두 주 연속은 주말 순번을 보는 것 — 주일에 머물지 않는 부산 일정(특별예배만)은 셈하지 않는다 (1116-2 D, HB 11/17)
      const prev = vSun(v) && vs.find(w => w !== v && vSun(w) && w.who.includes(pid) && sunOf(w.date) === addDays(sunOf(v.date), -7));
      if (prev) out.push({ level: 'warn', kind: 'twice', date: v.date, pid, visit: v.id, prev: prev.date });
    }
    if (today && v.date >= today && v.date <= addDays(today, 14) && stayState(v) !== 'done') out.push({ level: 'warn', kind: 'stay', date: v.date, visit: v.id });
  }
  for (const m of live(book.marks)) if (inW(m.sun) && m.tags.includes('극동방송')) {
    const wv = vs.filter(v => sunOf(v.date) === m.sun);
    if (!wv.length || wv.every(v => !(v.mates || []).length)) out.push({ level: 'warn', kind: 'staff', date: m.sun, visit: wv.length ? wv[0].id : visitId(m.sun) });
  }
  return out.sort((a, b) => (a.level !== b.level ? (a.level === 'bad' ? -1 : 1) : a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
function conflictText(book, c, pm) {
  pm = pm || peopleMap(book);
  const nm = c.pid ? (pm[c.pid] && !pm[c.pid].del ? pm[c.pid].name : '지운 사람') : '';
  const lab = c.slot ? (() => { const [date, svc, role] = c.slot.split('|'); return slotLabelB(book, date, svc, role); })() : '';
  switch (c.kind) {
    case 'overlap': return `${nm} — ${mdOf(c.date)}(${DOWS[dowOf(c.date)]}) ${c.lead ? '부산 ' + (c.lname || LEAD_NAME[c.lead]) + ' 인도인데' : '부산에 있는데'} 분당 ${lab}`;
    case 'role': return c.slot ? `${nm} — ${lab}에 들어가지 않는 분인데 ${mdOf(c.date)}` : `${nm} — '부산' 을 맡지 않는 분인데 ${mdOf(c.date)} 부산 일정`;
    case 'gone': return `${mdOf(c.date)} ${c.slot ? lab : '부산 일정'} — 지운 사람이 들어 있습니다`;
    case 'twice': return `${nm} — 두 주 연속 부산 (${mdOf(c.prev)} · ${mdOf(c.date)})`;
    case 'stay': return `${mdOf(c.date)} 부산 숙소가 아직 정해지지 않았습니다`;
    case 'away': return `${nm} — ${mdOf(c.date)} 부재${c.note ? '(' + c.note + ')' : ''}인데 ${c.slot ? '분당 ' + lab : '부산 일정'}`;
    case 'pin': return `${nm} — ${c.tag} 주에는 분당에 있어야 하는데 부산 일정 (${mdOf(c.date)})`;
    case 'staff': return `${mdOf(c.date)} 극동방송 주인데 동행 스텝이 비어 있습니다`;
    case 'worship': return `${nm} — ${mdOf(c.date)}(${DOWS[dowOf(c.date)]}) 부산에 있는데 분당 ${c.service} 예배팀(${c.part})${c.tentative ? ' · 예배팀 로테이션 미정' : ''}`;
  }
  return '';
}
/* ---- 예배팀 일정 (R13) — 서버(gcal-functions 의 worship)가 2시간마다 받아 rota/{HB}/ext/worship 에 둔 것 ----
   ext = { at, from, to, services: [{ date, time, sid, service, special, status, leaders:[{ w, name, pid? }], members:[{ pid, part }] }], dup, err? }
   members 는 서버가 이미 우리 명단(wkeys) 분만 남겼다. 겹침: 그 날 부산에 머무는데 분당 예배팀에 듦 → 빨강(미정이면 노랑).
   wkeys = 서버가 이름을 맞출 때 쓰는 명단(사람 id → 이름 · 다른 이름) — HB 앱이 문서 맨 위에 적는다(책 밖). */
function wkeysOf(book) { const o = {}; for (const p of live(normBook(book).people).slice(0, 200)) { const n = [p.name].concat(p.alias || []).filter(Boolean); if (n.length) o[p.id] = n; } return o; }
// 계정에서 온 명단과 같은가 — 칸 차례는 보지 않는다 (1117-3). 파이어베이스는 칸을 이름순으로 돌려주는데 wkeysOf 는 사람 목록 차례라,
//   차례로 견주면 언제나 '다르다' → 저장 → 받음 → 또 저장이 끝없이 돌아 1초에 수십 번 다시 그렸다(터치가 먹히지 않고 화면이 깜박인 까닭, R13 부터)
function sameWkeys(a, b) { const x = a || {}, y = b && typeof b === 'object' ? b : {}, kx = Object.keys(x).sort(), ky = Object.keys(y).sort();
  return kx.length === ky.length && kx.every((k, i) => k === ky[i] && JSON.stringify(x[k]) === JSON.stringify(y[k])); }
function worshipOn(ext, pid, date) {
  const out = [];
  for (const s of (ext && Array.isArray(ext.services) ? ext.services : [])) if (s && s.date === date) {
    const parts = [];
    if ((s.leaders || []).some(x => x && x.pid === pid)) parts.push('리더');
    for (const m of s.members || []) if (m && m.pid === pid && m.part && m.part !== '리더' && !parts.includes(m.part)) parts.push(m.part);
    if (parts.length) out.push({ s, parts });
  }
  return out;
}
function worshipClash(book, ext, from, to) {
  const out = []; if (!ext || !Array.isArray(ext.services)) return out;
  for (const v of live(book.visits)) for (const pid of v.who) for (const d of stayDates(v)) if (d >= from && d <= to)
    for (const { s, parts } of worshipOn(ext, pid, d)) out.push({ level: s.status === 'tentative' ? 'warn' : 'bad', kind: 'worship', date: d, pid, visit: v.id, service: s.service || '예배', part: parts.join(' · '), tentative: s.status === 'tentative' });
  return out;
}
// 칸마다 가장 센 표시 — { 자리 id 또는 방문 id: 'bad' | 'warn' }
function levelMap(list) {
  const m = {};
  for (const c of list) for (const k of [c.slot, c.visit]) if (k && m[k] !== 'bad') m[k] = c.level;
  return m;
}
// 고르기 판: 그 사람을 이 자리(들)에 넣으면 무엇이 걸리나 (부산에 있음 / 맡지 않는 일 · 예배)
function pickNote(book, pid, date, role, svcs) {
  const a = awayOn(book, pid, date); if (a) return { level: 'bad', text: '부재' + (a.note ? ' · ' + a.note : '') };
  const v = busyOn(book, pid, date); if (v) return { level: 'bad', text: mdOf(v.date) + ' 부산' };
  const p = book.people.find(x => x.id === pid), r0 = role === 'notice' ? 'offer' : role;   // WN 광고는 헌금 맡는 분
  if (p && !p.roles.includes(r0)) return { level: 'warn', text: "'" + PROLES[r0] + "' 안 맡음" };
  const off = (svcs || []).filter(s => p && !canDo(p, s, role));
  if (off.length) return { level: 'warn', text: off.map(s => svcI(s).short).join(' · ') + ' 안 들어감' };
  const c = canOn(book, pid, date); if (c) return { level: 'ok', text: '가능 일정' + (c.note ? ' · ' + c.note : '') };
  return null;
}
/* ---- 자동 배열 제안 (R4) ----
   **빈 칸만** 채운다 — 이미 적힌 칸 · 잠근 칸 · 지운 칸(표지)은 건드리지 않는다. 결과는 제안일 뿐, 화면에서 '적용' 을 눌러야 들어간다.
   부산 순번: 그 달 주일마다 방문이 없으면, '부산' 을 맡는 교역자(성도 인도자 빼고) 가운데
     그 주에 이미 방문이 있거나 · 머무를 날(금n 주면 금토일, 아니면 토일) 분당 자리를 맡은 사람은 빼고,
     점수 = 마지막 부산에서 지난 날 수 − 최근 8주 부산 횟수 × 21 − (바로 앞 주에 갔으면 100) 가 가장 큰 사람. 같으면 이름순.
     앞 주일의 제안도 다음 주일 셈에 넣는다(한 달 안에서 고르게).
   분당 자리: 주일 헌금은 두 사람이 나눠(1 · 3부 / 2부 · LL — 시트에서 늘 그렇게 했다), 2부 · LL 인도는 서로 다른 사람,
     금요 · 수요는 설교와 헌금을 다른 사람. 후보 = 그 예배 그 일을 맡고(canDo) 그 날 부산에 없는 사람(제안된 방문 포함).
     그 달 그 일을 적게 맡은 사람부터(날 수), 같으면 마지막으로 맡은 날이 이른 사람. 주일 설교(담임목사님)는 제안하지 않는다. */
function propose(book, ym, force) {
  force = force || {};
  book = normBook(book);
  const suns = monthSundays(ym), work = normBook(book), out = { visits: [], slots: [] };
  const staff = live(work.people).filter(p => p.kind !== 'lay').sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const busanOf = (pid) => live(work.visits).filter(v => v.who.includes(pid)).map(v => v.date).sort();
  for (const sun of suns) {
    const mon = addDays(sun, -6);
    if (work.visits.some(v => v.id === visitId(sun))) continue;   // 이미 있음(지운 표지도 — 사람이 비운 주는 채우지 않는다)
    const bf = busanFri(sun), days = bf ? '금토일' : '토일';
    const probe = { date: sun, days };
    const dates = stayDates(probe);
    const cand = staff.filter(p => p.roles.includes('busan')
      && !live(work.visits).some(v => v.who.includes(p.id) && v.date >= mon && v.date <= sun)
      && !live(work.slots).some(s => dates.includes(s.date) && s.who.includes(p.id))
      && !dates.some(d => awayOn(work, p.id, d)) && !pinOn(work, p.id, sun));   // 부재 · 고정 조건(R5)도 뺀다
    if (!cand.length) { out.visits.push({ date: sun, pid: null, why: '갈 수 있는 분이 없습니다', alts: [] }); continue; }
    const score = (p) => { const ds = busanOf(p.id).filter(d => d < sun); const last = ds[ds.length - 1];
      const gap = last ? Math.round((Date.parse(sun) - Date.parse(last)) / 864e5) : 365;
      const recent = ds.filter(d => d >= addDays(sun, -56)).length;
      const prevWeek = ds.some(d => d >= addDays(sun, -13) && d <= addDays(sun, -7));
      const can = dates.some(d => canOn(work, p.id, d));   // 가능 일정을 적은 분은 먼저(+60 — 두 주 연속 벌점은 못 넘는다)
      return { s: gap - recent * 21 - (prevWeek ? 100 : 0) + (can ? 60 : 0), gap, recent, last, can }; };
    const ranked = cand.map(p => Object.assign({ p }, score(p))).sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name, 'ko'));
    const forced = force[sun] && ranked.find(r => r.p.id === force[sun]);
    const best = forced || ranked[0];
    out.visits.push({ date: sun, pid: best.p.id, days,   // 인도(금요 · 주일 · LL)는 비워 둔다 — 머무는 날과 따로(R11 · R12)
      why: (best.can ? '가능 일정 적음 · ' : '') + (best.last ? `마지막 부산 ${mdOf(best.last)} · ${best.gap}일 전${best.recent ? ' · 8주에 ' + best.recent + '번' : ''}` : '부산 기록 없음'),
      alts: ranked.filter(r => r !== best).slice(0, 3).map(r => r.p.id) });
    put(work, 'visits', { id: visitId(sun), who: [best.p.id], days }, 'auto', 1);
  }
  // 분당 자리
  const everyone = live(work.people).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const empty = (id) => !work.slots.some(x => x.id === id);   // 지운 표지도 '사람이 비운 것' 이라 채우지 않는다
  const used = (role) => { const m = {}; for (const s of live(work.slots)) if (s.role === role && s.date.slice(0, 7) === ym) for (const pid of s.who) { m[pid] = m[pid] || { n: new Set(), last: '' }; m[pid].n.add(s.date); if (s.date > m[pid].last) m[pid].last = s.date; } return m; };
  const pick = (svcs, role, date, not) => {
    const u = used(role);
    const c = everyone.filter(p => svcs.every(sv => canDo(p, sv, role)) && !(not || []).includes(p.id) && !busyOn(work, p.id, date) && !awayOn(work, p.id, date));
    c.sort((a, b) => (!!canOn(work, b.id, date) - !!canOn(work, a.id, date)) || ((u[a.id] ? u[a.id].n.size : 0) - (u[b.id] ? u[b.id].n.size : 0)) || ((u[a.id] ? u[a.id].last : '') < (u[b.id] ? u[b.id].last : '') ? -1 : (u[a.id] ? u[a.id].last : '') > (u[b.id] ? u[b.id].last : '') ? 1 : 0) || a.name.localeCompare(b.name, 'ko'));
    return c;
  };
  const fill = (id, pid) => { out.slots.push({ id, pid }); put(work, 'slots', { id, who: [pid] }, 'auto', 1); };
  for (const sun of suns) {
    // 주일 헌금: 1 · 3부 한 사람, 2부 · LL 한 사람
    const pairs = [['sun1', 'sun3'], ['sun2', 'll']]; let first = null;
    for (const pair of pairs) {
      const ids = pair.map(sv => slotId(sun, sv, 'offer')).filter(empty); if (!ids.length) continue;
      const svs = ids.map(id => id.split('|')[1]);
      const c = pick(svs, 'offer', sun, first ? [first] : []); const who = c[0] || pick(svs, 'offer', sun)[0];
      if (who) { ids.forEach(id => fill(id, who.id)); first = first || who.id; }
    }
    // 인도: 2부 · LL 서로 다른 사람
    let leadA = null;
    for (const sv of ['sun2', 'll']) { const id = slotId(sun, sv, 'lead'); if (!empty(id)) { const s = work.slots.find(x => x.id === id); leadA = leadA || (s && s.who[0]); continue; }
      const c = pick([sv], 'lead', sun, leadA ? [leadA] : []); if (c[0]) { fill(id, c[0].id); leadA = leadA || c[0].id; } }
    // 금요 · 수요: 설교와 헌금 다른 사람
    for (const sv of ['fri', 'wed']) {
      const date = svcDate(sun, sv); let pre = null; if (restOn(work, date)) continue;   // 특별예배로 쉬는 날 (1116-2 E)
      for (const role of ['preach', 'offer'].concat(sv === 'fri' && isLastFri(date) ? ['notice'] : [])) { const id = slotId(date, sv, role);
        if (!empty(id)) { const s = work.slots.find(x => x.id === id); pre = pre || (s && s.who[0]); continue; }
        const c = pick([sv], role, date, pre ? [pre] : []); if (c[0]) { fill(id, c[0].id); pre = pre || c[0].id; } }
    }
  }
  return out;
}
// 제안 중 고른 것만 넣는다 (넣는 순간에도 빈 칸인지 다시 본다 — 그 사이 다른 기기에서 채웠으면 건너뜀)
function applyProposal(book, prop, by, now) {
  let n = 0;
  for (const v of prop.visits) if (v.pid && v.on !== false && !book.visits.some(x => x.id === visitId(v.date))) { put(book, 'visits', { id: visitId(v.date), who: [v.pid], days: v.days }, by, now); n++; }
  for (const s of prop.slots) if (s.on !== false && !book.slots.some(x => x.id === s.id)) { put(book, 'slots', { id: s.id, who: [s.pid] }, by, now); n++; }
  return n;
}

/* ---- R5: 챙길 것 · 지난 방문 복사 · 시트로 내보내기 · 사람 한눈에 ---- */
// 챙길 것 — 오늘부터 3주 안 방문의 숙소 미정, 사흘 안에 다가온 취소 기한(예약 완료인 숙소). 날짜순.
//   ⚠️ 화면은 1117-Z 2 부터 알림 판(alertsOf — 두 달 · 7일 기준 하나)을 쓴다. 이것은 옛 시험(⑲ · ㊵)을 위해서만 남김 — 화면에 다시 쓰지 말 것.
function chores(book, today) {
  const out = [];
  for (const v of live(book.visits)) {
    if (v.date >= today && v.date <= addDays(today, 21) && stayState(v) !== 'done') out.push({ kind: 'stay', date: v.date, visit: v.id });
    for (const st of v.stay) if (st.status === 'done' && stayHotel(st) && st.cancelBy && st.cancelBy >= today && st.cancelBy <= addDays(today, 3)) out.push({ kind: 'cancel', date: st.cancelBy, at: st.cancelAt || '', visit: v.id, name: st.name || '숙소' });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
/* ---- 알림 판 (1117-Z 2, HB 11/17) — 네 탭 맨 위(넓으면 오른쪽 기둥) 한 판. 판단은 여기 한 곳 ----
   오늘부터 두 달(같은 날짜, 그 날 포함) 안의 '정해지지 않은 것' 을 네 갈래로:
     urgent 급함(빨강) = 취소 기한 7일 안(오늘 포함 · 예약 완료 호텔만 — 성도님 댁 · 취소한 숙소 빼고) + 겹침(빨강)
     busan 부산 = 교역자 · 숙소 · 교통 · 예배 인도 미정 · 부산 일정 없는 주일 · 부산 상영 미정(o.bs — 이 기기에서 읽은 광고로 bsWarnSun 이 고른 주일만, 짐작 안 함)
     bd 분당 = 빈 자리(주일 설교 · 헌금 · 2부 / LL 인도 · 수요 · 금요 설교 · 헌금 · WN 광고 · 특별예배 자리 — 그 날 쉬는 예배는 빼고)
     chk 확인(노랑) = 겹침 검사의 노랑(숙소 미정은 부산 갈래 한 곳에만)
   줄 = { cat, kind, date, t, main, sub, go(가는 곳 이름), to, dd(며칠 남음) } — to: { visit, col, i } | { pick, all } | { newvisit } | { ads, vid }
   ⚠️ 교역자 화면에는 판이 없다(화면이 !isStaff() 로 거름) — 취소 기한 · 금액은 HB 전용(1117-Z 1). */
/* ---- 알림 판 기간 (1117-Z 2b, HB 11/18) — 부산 · 분당 따로, 계정마다(ui.al — HB 는 rota/{uid}.ui, 교역자는 자기 칸 ui. 책에 넣지 않는다) ----
   한 갈래 = { m: 'weeks', w: 1~26 }(이번 주 포함 w 주 — 그 주 토요일까지) | { m: 'month', cut: 2~28 }(cut 일 전이면 이번 달 말일, cut 일부터 다음 달 말일) | { m: 'date', d }(그 날까지, 지나면 처음 값).
   처음 값(HB 11/18): 부산 8주 · 분당 '20일까지 이번 달 / 21일부터 다음 달'. 프리셋(pre) = 사용자가 만든 것(날짜 고정은 안 됨) 6개까지. 겹침 · 확인은 둘 중 긴 쪽. */
const AL_DEF = { busan: { m: 'weeks', w: 8 }, bd: { m: 'month', cut: 21 } };
const AL_PRESETS = [{ m: 'weeks', w: 8 }, { m: 'month', cut: 21 }, { m: 'weeks', w: 13 }];
function normAlC(o) {
  if (!o || typeof o !== 'object') return null;
  if (o.m === 'weeks') { const w = Math.round(+o.w); return w >= 1 && w <= 26 ? { m: 'weeks', w } : null; }
  if (o.m === 'month') { const c = Math.round(+o.cut); return c >= 2 && c <= 28 ? { m: 'month', cut: c } : null; }
  if (o.m === 'date') return isYmd(o.d) ? { m: 'date', d: o.d } : null;
  return null;
}
function normAl(o) {
  if (!o || typeof o !== 'object') return null; const out = {};
  for (const k of ['busan', 'bd']) { const c = normAlC(o[k]); if (c) out[k] = c; }
  const seen = new Set(), pre = (Array.isArray(o.pre) ? o.pre : []).map(normAlC).filter(c => c && c.m !== 'date' && !AL_PRESETS.some(b => JSON.stringify(b) === JSON.stringify(c)) && !seen.has(JSON.stringify(c)) && seen.add(JSON.stringify(c))).slice(0, 6);
  if (pre.length) out.pre = pre;
  return Object.keys(out).length ? out : null;
}
// 그 갈래의 쓰는 값 — 없거나 고른 날짜가 지났으면 처음 값
function alCfg(al, k, today) { const c = normAlC(al && al[k]); return !c || (c.m === 'date' && c.d < today) ? AL_DEF[k] : c; }
function monthEndOf(today, cut) { const y = +today.slice(0, 4), m = +today.slice(5, 7) - 1 + (+today.slice(8, 10) >= cut ? 1 : 0); return ymdUTC(new Date(Date.UTC(y, m + 1, 0))); }
function alEnd(c, today) { return c.m === 'weeks' ? addDays(sunOf(today), 7 * c.w - 1) : c.m === 'month' ? monthEndOf(today, c.cut) : c.d; }
function alLabel(c) { return c.m === 'weeks' ? c.w + '주' : c.m === 'month' ? '이번 달까지 · ' + c.cut + '일부터 다음 달' : mdOf(c.d) + '까지'; }
const ALERT_CATS = [['urgent', '급함'], ['busan', '부산'], ['bd', '분당'], ['chk', '확인']];
const CANCEL_DAYS = 7;   // 취소 기한 빨강 — 오늘 포함 7일(D-day ~ D-6)
function cancelSoon(s, today) { return !!s && stayHotel(s) && s.status === 'done' && isYmd(s.cancelBy) && isYmd(today) && s.cancelBy >= today && s.cancelBy <= addDays(today, CANCEL_DAYS - 1); }
// 두 달 뒤 같은 날(그 달에 없는 날이면 그 달 마지막 날): 11/18 → 1/18 · 12/31 → 2/28
function alertEnd(today) { const y = +today.slice(0, 4), m0 = +today.slice(5, 7) - 1 + 2, yy = y + Math.floor(m0 / 12), mm = m0 % 12 + 1;
  const last = new Date(Date.UTC(yy, mm, 0)).getUTCDate(); return yy + '-' + String(mm).padStart(2, '0') + '-' + String(Math.min(+today.slice(8, 10), last)).padStart(2, '0'); }
function dDay(today, date) { return Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000); }
function ddText(n) { return n === 0 ? '오늘' : n > 0 ? 'D-' + n : 'D+' + -n; }
// '이번 주' 탭이 보여 줄 날(1119-W, HB 11/19) — up: 오늘부터 7일(두 달력 주에 걸칠 수 있다) · cal: 그 주 주일 ~ 토
function weekWindow(mode, today, sun) { const from = mode === 'up' ? today : sun, to = addDays(from, 6), a = sunOf(from), b = sunOf(to); return { from, to, suns: a === b ? [a] : [a, b] }; }
// 카드 오른쪽 위 알약 — 오늘 · 내일 · N일 뒤(두 주 안). 지난 날 · 먼 날은 비움
function soonText(today, date) { const n = dDay(today, date); return n === 0 ? '오늘' : n === 1 ? '내일' : n > 1 && n < 14 ? n + '일 뒤' : ''; }
const AL_SUB = { overlap: '겹침', away: '부재', role: '맡지 않는 일', gone: '지운 사람', twice: '두 주 연속', pin: '고정 조건', staff: '극동방송 동행' };
const AL_COL = { away: 'who', role: 'who', gone: 'who', twice: 'who', pin: 'who', staff: 'mate', worship: 'who' };
function alertsOf(book, today, o) {
  o = o || {}; const e0 = alertEnd(today), endB = isYmd(o.endB) ? o.endB : e0, endD = isYmd(o.endD) ? o.endD : e0;   // 갈래마다 끝날(2b) — 없으면 두 달
  const end = endB > endD ? endB : endD, pm = peopleMap(book), out = [], inR = (d) => isYmd(d) && d >= today && d <= end;   // 겹침 · 확인은 긴 쪽
  const st = typeof o.staff === 'string' && o.staff ? o.staff : null;   // 교역자 판(1117-Z 2c): 겹침 · 확인 + 자기 부산 일정 교통편 · 상영만 — 금액 · 취소 기한 · 숙소 · 분당 빈 자리 · 인도 · 일정 없는 주일은 HB 만
  const add = (cat, kind, date, main, sub, go, to, t) => out.push({ cat, kind, date, t: t || '', main, sub: sub || '', go, to, dd: dDay(today, date) });
  const vs = live(book.visits), who = (v) => whoText(book, v.who, '', pm), vsub = (v) => [mdOf(v.date) + ' 부산', who(v), v.title].filter(Boolean).join(' · ');
  // 급함 — 취소 기한 (숙소마다)
  if (!st) for (const v of vs) v.stay.forEach((s, i) => { if (cancelSoon(s, today)) add('urgent', 'cancel', s.cancelBy, (s.name || '숙소') + ' 취소 기한' + (s.cancelAt ? ' ' + s.cancelAt : ''), vsub(v), '숙소 판', { visit: v.id, col: 'cancel', i }, s.cancelAt); });
  // 겹침(빨강 → 급함) · 확인 거리(노랑 → 확인)
  for (const c of conflicts(book, today, end, today).concat(worshipClash(book, o.ext, today, end))) {
    if (c.kind === 'stay' || !inR(c.date)) continue;   // 숙소 미정은 부산 갈래에서 (기준 하나: 두 달)
    const to = c.slot ? { pick: c.slot } : vs.some(v => v.id === c.visit) ? { visit: c.visit, col: AL_COL[c.kind] || '' } : { newvisit: c.date };
    add(c.level === 'bad' ? 'urgent' : 'chk', c.kind, c.date, conflictText(book, c, pm), c.kind === 'worship' ? (c.tentative ? '예배팀 미정' : '예배팀') : AL_SUB[c.kind] || '',
      to.pick ? '고르기 판' : to.newvisit ? '부산 일정 더하기' : '부산 일정 판', to);
  }
  // 부산
  for (const v of vs) { if (!inR(v.date) || v.date > endB || (st && !v.who.includes(st))) continue;
    const sub = [who(v), v.title].filter(Boolean).join(' · '), to = (col, i) => (i === undefined ? { visit: v.id, col } : { visit: v.id, col, i });
    if (!st && !v.who.length) add('busan', 'who', v.date, '교역자 미정', v.title || '', '교역자 · 요일', to('who'));
    const ss = stayState(v);
    if (!st && (ss === 'open' || (ss === 'none' && stayDates(v).length > 1))) add('busan', 'stay', v.date, '숙소 미정', sub, '숙소 판', to('stay', v.stay.findIndex(s => s.status !== 'done' && s.status !== 'cancel')));   // 하루만 머무는 일정(숙소 없음)은 묻지 않는다
    const miss = ['down', 'up'].filter(dir => !v.travel.some(t => t.dir === dir && (t.mode || t.time)));
    if (miss.length) add('busan', 'travel', v.date, '교통 미정' + (miss.length === 1 ? ' · ' + (miss[0] === 'down' ? '내려감' : '올라옴') : ''), sub, '교통 판', to('travel'));
    const lm = LEAD_SVC.filter(k => leadOpen(v, k) && !leadOf(v, k)).map(k => (k === 'fri' ? friName(visitSun(v.date)) || '금요' : k === 'sun' ? '주일예배' : 'LL'))
      .concat((v.evs || []).filter(e => !e.m).map(e => e.n));
    if (!st && lm.length) add('busan', 'lead', v.date, '예배 인도 미정', [lm.join(' · '), sub].filter(Boolean).join(' — '), '예배 판', to('lead'));
  }
  if (!st) for (let s = visitSun(today); s <= endB; s = addDays(s, 7)) if (!vs.some(v => v.date === s || vSun(v) === s)) add('busan', 'novisit', s, '부산 일정이 아직 없습니다', '', '부산 일정 더하기', { newvisit: s });
  if (inR(o.bs) && o.bs <= endB) { const v = vs.find(x => vSun(x) === o.bs); add('busan', 'show', o.bs, '부산 상영 미정', v ? who(v) : '', '광고', { ads: o.bs, vid: v ? v.id : '' }); }
  // 시트와 다름(1121-G G4) — HB 만 · 부산 기간 안 · 넘긴 줄은 빼고. 누르면 '시트와 맞춰 보기' 판
  if (!st && o.gs) { const sk = new Set(o.gs.skip || []);
    for (const x of gsDiff(book, o.gs.team, o.gs.serve, today, endB)) if (!sk.has(x.key)) add('chk', 'gs', x.date, '시트와 다름 · ' + x.label, '앱 ' + x.app + ' · 시트 ' + [...new Set(x.sheet.map(s => s.text))].join(' / '), '시트와 맞춰 보기', { gs: x.id }); }
  // 분당 빈 자리
  const empty = (id) => { const s = book.slots.find(x => x.id === id && !x.del); return !s || (!s.who.length && !s.txt); };
  if (!st) for (let s = sunOf(today); s <= endD; s = addDays(s, 7)) {
    if (inR(s)) {
      for (const role of ['preach', 'offer']) { const e = SUN4.filter(sv => empty(slotId(s, sv, role)));
        if (e.length) add('bd', role, s, '주일 ' + ROLE[role], e.length === SUN4.length ? '1~3부 · LL' : e.map(sv => SVC[sv].short).join(' · '), '고르기 판', { pick: slotId(s, e[0], role), all: e.length === SUN4.length }); }
      for (const sv of ['sun2', 'll']) if (empty(slotId(s, sv, 'lead'))) add('bd', 'lead', s, SVC[sv].short + ' 예배인도', '', '고르기 판', { pick: slotId(s, sv, 'lead') });
    }
    for (const sv of ['wed', 'fri']) { const d = svcDate(s, sv); if (!inR(d) || d > endD || restOn(book, d)) continue;
      for (const role of ['preach', 'offer'].concat(sv === 'fri' && isLastFri(d) ? ['notice'] : [])) if (empty(slotId(d, sv, role))) add('bd', role, d, role === 'notice' ? 'WN 광고' : SVC[sv].label + ' ' + ROLE[role], '', '고르기 판', { pick: slotId(d, sv, role) }); }
  }
  if (!st) for (const sp of specsIn(book, today, endD)) for (const r of sp.roles) { const id = slotId(sp.date, 'x' + sp.k, r);
    if (empty(id)) add('bd', r, sp.date, slotLabelB(book, sp.date, 'x' + sp.k, r), sp.t || '', '고르기 판', { pick: id }, sp.t); }
  const items = out.map((x, k) => [x, k]).sort((a, b) => (a[0].date !== b[0].date ? (a[0].date < b[0].date ? -1 : 1) : evTKey(a[0].t) !== evTKey(b[0].t) ? (evTKey(a[0].t) < evTKey(b[0].t) ? -1 : 1) : a[1] - b[1])).map(x => x[0]);
  const n = {}; for (const [k] of ALERT_CATS) n[k] = items.filter(x => x.cat === k).length;
  return { from: today, to: end, toB: endB, toD: endD, items, n };
}
// 지난 방문에서 복사 — 숙소(이름 · 종류 · 남녀 · 박 · 금액, 상태는 '미정' 으로 · 기한 · 사진은 빼고) · 교통 · 동행 · 부서모임. 날짜 · 사람 · 요일 · 메모는 그대로.
//   새가족 · 침례교육은 가져오지 않는다(차수가 이어지므로 같은 것을 다시 적으면 틀린다).
function copyVisit(src, dst) {
  const out = JSON.parse(JSON.stringify(dst));
  out.stay = src.stay.filter(x => x.status !== 'cancel').map(x => ({ kind: x.kind, name: x.name, status: '', cost: x.cost, nights: x.nights, for: x.for }));
  out.travel = src.travel.map(t => Object.assign({}, t));
  if ((src.mates || []).length && !(dst.mates || []).length) out.mates = JSON.parse(JSON.stringify(src.mates));
  if (src.meet && src.meet.k === 'dept' && !dst.meet) out.meet = Object.assign({}, src.meet);
  return out;
}
/* ---- 부산 예배 인도 싣기 · 내보내기 (R12 B, HB 11/16) ----
   인도는 visitLeads 가 거른 그대로(교역자 인도는 머무는 날만, 금요는 금1~3 주만). 한 칸 글: 교역자 = '교역자', 성도 = 그분 이름, 중계 = '중계', 비면 빈칸. */
function leadCell(book, v, svc) {
  const x = visitLeads(book, v).find(y => y.svc === svc); if (!x) return '';
  if (x.m === 'staff') return '교역자'; if (x.m === 'relay') return '중계';
  const p = live(book.people).find(q => q.id === x.p); return p ? p.name : '성도';
}
// 그 날 그 예배(금요 · 주일 · LL)의 부산 인도 — 방문이 여럿이면 ' / '
function leadsAt(book, date, svc) { return live(book.visits).filter(v => leadDate(v, svc) === date).map(v => leadCell(book, v, svc)).filter(Boolean).join(' / '); }
// 한 줄 글: 'AWAKE 인도, 주일예배 · 가가, LL 중계' (알약 글 그대로)
function leadLine(book, v) { return visitLeads(book, v).map(x => x.text).join(', '); }
// 더한 예배 한 칸 글(내보내기): '12/24 저녁 성탄 전야 예배(교역자), 12/25 10:30 성탄 예배(나나)'
function evLine(book, v) { return visitLeads(book, v).filter(x => x.ev).map(x => {
  const who = x.m === 'staff' ? '교역자' : x.m === 'relay' ? '중계' : x.m === 'lay' ? x.bare.split(' · ').pop() : '';
  return mdOf(x.date) + (x.t ? ' ' + x.t : '') + ' ' + x.n + (who ? '(' + who + ')' : ''); }).join(', '); }
const tsvOf = (rows) => rows.map(r => r.map(x => String(x == null ? '' : x).replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
const csvOf = (rows) => rows.map(r => r.map(x => { const c = String(x == null ? '' : x).replace(/[\t\n]/g, ' '); return /[",]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(',')).join('\r\n');
// 예배 구성 시트 모양 — title 이 있으면 맨 위 제목 줄(이번달 전체), ext 는 화면의 금요 · 수요 '한 주 더'(예배별 보기), tue 는 화요(옛 기록)가 있는 달만
function sheetRows(book, ym, o) {
  o = o || {}; const pm = peopleMap(book), suns = monthSundays(ym), ext = o.ext || {}, cell = (id) => { const s = book.slots.find(x => x.id === id && !x.del); return s ? whoText(book, s.who, s.txt, pm) : ''; };
  const rows = o.title === false ? [] : [[`${ym.slice(0, 4)}년 ${+ym.slice(5)}월 예배 구성`]];
  rows.push(['주일', '구분', '1부', '2부', '3부', '라이프라인', '2부 예배인도', '라이프라인 예배인도', '부산 교역자', '부산 주일 인도', '부산 LL 인도']);
  for (const sun of suns) {
    const busan = weekVisits(book, sun).map(v => whoText(book, v.who, '', pm) + (v.title ? '(' + v.title + ' ' + mdOf(v.date) + ')' : '')).filter(Boolean).join(' / ');
    for (const role of ['preach', 'offer']) { const p = role === 'preach';
      rows.push([p ? mdOf(sun) : '', p ? '설교' : '헌금인도', ...SUN4.map(sv => cell(slotId(sun, sv, role))),
        p ? cell(slotId(sun, 'sun2', 'lead')) : '', p ? cell(slotId(sun, 'll', 'lead')) : '', p ? busan : '', p ? leadsAt(book, sun, 'sun') : '', p ? leadsAt(book, sun, 'll') : '']); }
  }
  const e = (svc) => ext[svc] || { b: 0, a: 0 };
  rows.push([], ['금요예배', '설교', '헌금', 'WN 광고', '부산 금요', '부산 금요 인도']);
  for (const d of weekdayRows(ym, 'fri', e('fri').b, e('fri').a)) rows.push([mdOf(d), cell(slotId(d, 'fri', 'preach')), cell(slotId(d, 'fri', 'offer')), isLastFri(d) ? cell(slotId(d, 'fri', 'notice')) : '', friName(addDays(d, 2)), leadsAt(book, d, 'fri')]);
  rows.push([], ['수요예배', '설교', '헌금인도']);
  for (const d of weekdayRows(ym, 'wed', e('wed').b, e('wed').a)) rows.push([mdOf(d), cell(slotId(d, 'wed', 'preach')), cell(slotId(d, 'wed', 'offer'))]);
  if (o.tue && svcShown(book, 'tue', suns)) { rows.push([], ['화요예배', '설교', '헌금인도']);
    for (const d of weekdayRows(ym, 'tue', e('tue').b, e('tue').a)) rows.push([mdOf(d), cell(slotId(d, 'tue', 'preach')), cell(slotId(d, 'tue', 'offer'))]); }
  // 분당 특별예배 (1116-2 E) — 그 달에 있을 때만 맨 아래 표 하나. 없는 자리는 '—'
  const sps = specsIn(book, ym + '-01', addDays(addMonths(ym, 1) + '-01', -1));
  if (sps.length) { rows.push([], ['특별예배', '때', '예배', '설교', '헌금인도', '예배인도']);
    for (const sp of sps) rows.push([mdOf(sp.date), sp.t || '', sp.n, ...SPEC_ROLES.map(r => (sp.roles.includes(r) ? cell(slotId(sp.date, 'x' + sp.k, r)) : '—'))]); }
  return rows;
}
// 예배 구성 시트 모양 그대로 — 탭으로 나눈 글(구글 시트에 붙여 넣으면 칸이 맞는다)
function sheetTSV(book, ym) { return tsvOf(sheetRows(book, ym)); }
// 내 일정의 한 줄 이름: '1부 · 3부 헌금' · '예배인도' · 'WN 광고'
const XG = { sun: '주일', fri: '금요', wed: '수요', tue: '화요', bs: '부산', sp: '특별' };
function itemLabel(r) {
  if (r.kind === 'visit') return (r.v.title ? r.v.title + ' · ' : '') + dayS(sortDays(r.v.date, r.v.days || defaultDays(r.v.date))) + (stayText(r.v) ? ' · ' + stayText(r.v) : '');
  if (r.kind === 'blead') return r.text;
  if (r.grp === 'sp') return (r.name || '특별예배') + ' ' + (r.role === 'lead' ? '예배인도' : ROLE[r.role]);   // 분당 특별예배 (1116-2 E)
  return (r.grp === 'sun' ? r.svcs.map(x => SVC[x].short).join(' · ') + ' ' : '') + (r.role === 'notice' ? 'WN 광고' : r.role === 'lead' ? '예배인도' : r.grp !== 'sun' && r.role === 'offer' ? '헌금' : ROLE[r.role]);
}
// 내 일정이 보는 날들: 이번 달이면 오늘부터, 다른 달이면 그 달 첫날부터 n주
function mineRange(ym, today, weeks) { const from = today.slice(0, 7) === ym ? today : ym + '-01', sun0 = sunOf(from); return { from, sun0, to: addDays(sun0, (weeks || 8) * 7 - 1) }; }
// 보기마다 내보낼 글 배열 (R12 B). view = 'all'(이번달 전체 = 시트 모양) · VIEWS 의 여섯. o = { today, pid(내 일정), grid(내 일정 8주 표), calf(월 달력 갈래), ext(예배별 '한 주 더') }
function exportRows(book, view, ym, o) {
  o = o || {}; const pm = peopleMap(book), suns = monthSundays(ym), today = o.today || ym + '-01';
  const dw = (d) => DOWS[dowOf(d)], mdd2 = (d) => mdOf(d) + '(' + dw(d) + ')';
  const slotT = (date, svc, role) => { const s = book.slots.find(x => x.id === slotId(date, svc, role) && !x.del); return s ? whoText(book, s.who, s.txt, pm) : ''; };
  if (view === 'all') return sheetRows(book, ym);
  if (view === 'sheet') return sheetRows(book, ym, { title: false, ext: o.ext, tue: true });
  if (view === 'grid') {
    const rows = [['', ...suns.map(s => weekLabel(s) + (weekFriName(s) ? ' ' + weekFriName(s) : ''))]];
    for (const [svc, role] of GRID) if (svcShown(book, svc, suns)) rows.push([slotLabel(svc, role), ...suns.map(s => { const d = svcDate(s, svc); return role === 'notice' && !isLastFri(d) ? '' : slotT(d, svc, role); })]);
    rows.push(['부산', ...suns.map(s => weekVisits(book, s).map(v => whoText(book, v.who, '', pm)).filter(Boolean).join(' / '))]);
    rows.push(['부산 금요 인도', ...suns.map(s => leadsAt(book, svcDate(s, 'fri'), 'fri'))], ['부산 주일 인도', ...suns.map(s => leadsAt(book, s, 'sun'))], ['부산 LL 인도', ...suns.map(s => leadsAt(book, s, 'll'))]);
    return rows;
  }
  if (view === 'mine') {
    const p = live(book.people).find(x => x.id === o.pid); if (!p) return [['사람을 골라 주세요']];
    const r8 = mineRange(ym, today, 8), head = [`${p.name} 님의 일정 · ${mdOf(r8.from)} ~ ${mdOf(r8.to)}`];
    if (o.grid) {
      const one = (r) => itemLabel(r), rows = [head, ['주', '주일', '수', '금', '부산', '부산 인도']];
      for (const w of myWeeks(book, p.id, r8.sun0, 8)) rows.push([weekLabel(w.sun) + (w.away.length ? ' (부재)' : ''), w.sunItems.map(one).join(' · '), w.mid.map(one).join(' · '), w.fri.map(one).join(' · '),
        w.bs.map(x => (x.cont ? '~ ' + mdOf(x.end) : mdOf(x.date) + (x.end !== x.date ? '~' + mdOf(x.end) : '') + ' ' + dayS(sortDays(x.v.date, x.v.days || defaultDays(x.v.date))))).concat(w.bl.map(x => mdOf(x.date) + ' ' + x.text)).join(' · '),
        w.bs.filter(x => !x.cont).map(x => leadLine(book, x.v)).filter(Boolean).join(' / ')]);
      return rows;
    }
    const rows = [head, ['날짜', '요일', '갈래', '맡은 일', '부산 인도']];
    for (const r of myItems(book, p.id, r8.from, r8.to)) rows.push([mdOf(r.date) + (r.end && r.end !== r.date ? '~' + mdOf(r.end) : ''), dw(r.date), r.kind === 'slot' ? (r.role === 'lead' ? '예배인도' : XG[r.grp]) : '부산', itemLabel(r), r.kind === 'visit' ? leadLine(book, r.v) : '']);
    return rows;
  }
  if (view === 'matrix') {
    const ps = live(book.people).slice().sort((a, b) => ((a.kind || '') > (b.kind || '') ? 1 : (a.kind || '') < (b.kind || '') ? -1 : 0) || a.name.localeCompare(b.name, 'ko'));
    const rows = [['', ...suns.map(weekLabel), '합']];
    for (const p of ps) { const cells = suns.map(s => weekTags(book, p.id, s)), n = cells.reduce((a, c) => a + c.length, 0); if (!n && !p.roles.length) continue;
      rows.push([p.name + (p.kind === 'lay' ? ' (성도)' : ''), ...cells.map(c => c.map(t => t.t).join(' ')), n]); }
    rows.push([], ['설 · 헌 · 인 · 광 · 부 = 설교 · 헌금 · 예배인도 · WN 광고 · 부산']);
    return rows;
  }
  if (view === 'cal') {
    const f = ['preach', 'offer', 'lead', 'busan'].includes(o.calf) ? o.calf : 'preach';
    const rows = [[`${ym.slice(0, 4)}년 ${+ym.slice(5)}월 · ${{ preach: '설교', offer: '헌금', lead: '예배인도', busan: '부산' }[f]}`], DOWS.slice()];
    for (const sun of suns) { const r = [];
      for (let k = 0; k <= 6; k++) { const d = addDays(sun, k); if (d.slice(0, 7) !== ym) { r.push(''); continue; }
        let ls = dayLines(book, d, f, pm).map(l => (l.label ? l.label + ' ' : '') + l.text).filter(x => x.trim());
        if (f === 'busan') for (const v of live(book.visits)) for (const x of visitLeads(book, v)) if (x.date === d && !x.ev) ls.push(x.text);   // 더한 예배는 dayLines 가 이미
        r.push(+d.slice(8) + '일' + (ls.length ? ' ' + ls.join(' · ') : '')); }
      rows.push(r); }
    return rows;
  }
  if (view === 'busan') {
    const { from, to } = { from: ym + '-01', to: addDays(addMonths(ym, 1) + '-01', -1) };
    const pv = !(o && o.noPriv);   // 교역자 내보내기에는 금액 · 취소 기한 열이 없다 (1117-Z 1)
    const rows = [['날짜', '요일', '교역자', '머무는 날', '금요예배', '금요 인도', '주일 인도', 'LL 인도', '숙소', ...(pv ? ['금액', '취소 기한'] : []), '동행', '모임', '이름', '예배']];
    for (const v of live(book.visits).filter(v => v.date >= from && v.date <= to).sort((a, b) => (a.date < b.date ? -1 : 1))) {
      const st = v.stay.filter(x => x.status !== 'cancel'), cost = st.reduce((a, x) => a + (x.cost || 0), 0), cb = st.map(x => x.cancelBy).filter(Boolean).sort()[0];
      rows.push([mdOf(v.date), dw(v.date), whoText(book, v.who, '', pm), dayS(sortDays(v.date, v.days || defaultDays(v.date))), busanFri(visitSun(v.date)) ? friName(visitSun(v.date)) : '',
        ...LEAD_SVC.map(svc => leadCell(book, v, svc)), st.map(x => (x.for ? x.for + ' ' : '') + (x.name || (x.kind === 'home' ? '성도님 댁' : '호텔')) + (x.status === 'done' ? '' : ' (' + stayStName(x) + ')')).join(' · '),
        ...(pv ? [cost || '', cb ? mdd2(cb) : st.some(x => x.nofree) ? '환불 불가' : ''] : []), mateText(book, v), meetText(v.meet), v.title || '', evLine(book, v)]);
    }
    return rows;
  }
  return [];
}
// 사람 한눈에 — 마지막 부산 · 석 달 부산 횟수 · 다가오는 자리 셋 · 앞으로의 부재
function personStats(book, pid, today) {
  const bs = live(book.visits).filter(v => v.who.includes(pid)).map(v => v.date).sort();
  const past = bs.filter(d => d < today), next = myItems(book, pid, today, addDays(today, 90)).slice(0, 3);
  const p = book.people.find(x => x.id === pid);
  return { last: past[past.length - 1] || '', busan3: past.filter(d => d >= addDays(today, -91)).length, next, away: ((p && p.away) || []).filter(a => a.to >= today) };
}

// 월 달력 필터(R5b): 그 날 그 갈래(설교 · 헌금 · 예배인도 · 부산)의 줄들 — 주일 네 예배는 예배마다 한 줄
function dayLines(book, date, cat, pm) {
  pm = pm || peopleMap(book);
  if (cat === 'busan') { const out = live(book.visits).filter(v => stayDates(v).includes(date)).map(v => ({ label: '', text: whoText(book, v.who, '', pm) + (v.title ? ' · ' + v.title : ''), id: v.id, grp: 'bs' }));
    // 더한 예배(1116-2 D)는 그 날 칸에 예배 이름도 — 정해진 인도(금요 · 주일 · LL)는 예전처럼 내보내기에만
    for (const v of live(book.visits)) for (const x of visitLeads(book, v)) if (x.ev && x.date === date) out.push({ label: '', text: (x.t ? x.t + ' ' : '') + x.bare, id: v.id, grp: 'bs', ev: true });
    return out; }
  const role = cat === 'preach' ? 'preach' : cat === 'offer' ? 'offer' : 'lead';
  return live(book.slots).filter(s => s.date === date && (s.role === role || (cat === 'offer' && s.role === 'notice')))
    .sort((a, b) => GRID.findIndex(g => g[0] === a.svc && g[1] === a.role) - GRID.findIndex(g => g[0] === b.svc && g[1] === b.role))
    .filter(s => !isSpec(s.svc) || specOf(book, s.date, s.svc)).map(s => ({ label: s.role === 'notice' ? 'WN' : svcI(s.svc).short, text: whoText(book, s.who, s.txt, pm), id: s.id, grp: s.role === 'lead' ? 'lead' : svcGroup(s.svc) }));
}
// 금요 · 수요 표의 날들(R5b): 그 달 안의 그 요일만 + 앞으로 before 주, 뒤로 after 주
function weekdayRows(ym, svc, before, after) {
  const off = SVC[svc].off, first = ym + '-01', want = (7 + off) % 7;
  let d = addDays(first, (want - dowOf(first) + 7) % 7); const out = [];
  while (d.slice(0, 7) === ym) { out.push(d); d = addDays(d, 7); }
  for (let i = 0; i < (before || 0); i++) out.unshift(addDays(out[0], -7));
  for (let i = 0; i < (after || 0); i++) out.push(addDays(out[out.length - 1], 7));
  return out;
}

// 표에서 칠할 칸(HB 11/14): 오늘 = 'tdy', 오늘 뒤 엿새 안 = 'soon', 그 밖 = ''
function nearCls(date, today) { return !today || !date ? '' : date === today ? 'tdy' : date > today && date <= addDays(today, 6) ? 'soon' : ''; }
// 그 금요일(부산에 머무는 날)에 내려가 있는 방문들
function busanOn(book, date) { return live(book.visits).filter(v => stayDates(v).includes(date)); }

/* ---- 보기 틀(R4b)이 쓰는 읽기 ---- */
const TAGCH = { preach: '설', offer: '헌', lead: '인', notice: '광' };
const svcGroup = (svc) => (SUN4.includes(svc) ? 'sun' : isSpec(svc) ? 'sp' : svc);   // 특별예배는 한 무리 'sp' (1116-2 E)   // 주일 네 예배는 한 무리 (색 · 묶음)
// ④ 사람 × 주: 그 주(주일~토)에 그 사람이 맡은 일 — 주일 네 예배의 같은 일은 하나로
function weekTags(book, pid, sun) {
  const sat = addDays(sun, 6), out = [];
  for (const s of live(book.slots)) if (s.date >= sun && s.date <= sat && s.who.includes(pid) && (!isSpec(s.svc) || specOf(book, s.date, s.svc))) {
    const g = svcGroup(s.svc) + '|' + s.role + '|' + s.date;
    if (!out.some(t => t.g === g)) out.push({ g, t: TAGCH[s.role], svc: svcGroup(s.svc), id: s.id, date: s.date });
  }
  for (const v of live(book.visits)) if (v.date >= sun && v.date <= sat && v.who.includes(pid)) out.push({ g: v.id, t: '부', svc: 'bs', id: v.id, date: v.date });
  const ro = { 설: 0, 헌: 1, 광: 2, 인: 3, 부: 4 };   // 같은 날이면 설교 → 헌금 → 인도 → 부산 (시트 순서)
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : ro[a.t] - ro[b.t]));
}
// ③ 내 일정: 그 사람이 맡은 것 날짜순 — 같은 날 같은 일의 주일 예배들은 한 줄('1부 · 3부 헌금')
function myItems(book, pid, from, to) {
  const rows = [];
  for (const s of live(book.slots)) if (s.date >= from && s.date <= to && s.who.includes(pid)) {
    if (isSpec(s.svc) && !specOf(book, s.date, s.svc)) continue;   // 예배가 지워진 자리
    const r = rows.find(x => x.kind === 'slot' && x.date === s.date && x.role === s.role && x.grp === svcGroup(s.svc) && !isSpec(s.svc));
    if (r) { r.svcs.push(s.svc); r.ids.push(s.id); } else rows.push(Object.assign({ kind: 'slot', date: s.date, role: s.role, grp: svcGroup(s.svc), svcs: [s.svc], ids: [s.id], id: s.id }, isSpec(s.svc) ? { name: (specOf(book, s.date, s.svc) || {}).n || '특별예배' } : {}));
  }
  for (const v of live(book.visits)) if (v.who.includes(pid)) { const ds = stayDates(v); if (ds[ds.length - 1] >= from && ds[0] <= to) rows.push({ kind: 'visit', date: ds[0], end: ds[ds.length - 1], id: v.id, v }); }
  // 성도 인도자(R12 B): 내가 이름으로 든 부산 예배 인도 — 그 예배 날에 한 줄(방문에 들지 않아도)
  for (const v of live(book.visits)) for (const x of visitLeads(book, v)) if (x.m === 'lay' && x.p === pid && x.date >= from && x.date <= to) rows.push({ kind: 'blead', date: x.date, role: 'lead', grp: 'bs', svc: x.svc, text: x.text.split(' · ')[0] + ' 인도', id: v.id, v });
  for (const r of rows) if (r.svcs) r.svcs.sort((a, b) => GRID.findIndex(g => g[0] === a) - GRID.findIndex(g => g[0] === b));
  const ro = { preach: 0, offer: 1, notice: 2, lead: 3 };
  return rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.kind === 'visit' ? -1 : b.kind === 'visit' ? 1 : ro[a.role] - ro[b.role]));
}
// ⑤ 월 달력: 그 날의 자리(예배마다 설교 먼저)와 그 날 부산에 머무는 방문
function dayItems(book, date) {
  const slots = live(book.slots).filter(s => s.date === date).sort((a, b) => GRID.findIndex(g => g[0] === a.svc && g[1] === a.role) - GRID.findIndex(g => g[0] === b.svc && g[1] === b.role));
  const visits = live(book.visits).filter(v => stayDates(v).includes(date));
  return { slots, visits };
}

// 그 달에 그 역할을 몇 번 맡았나 (고르기 판에 보여 줘 고르게 나누도록)
function countRole(book, pid, role, ym) {
  if (role === 'busan') return live(book.visits).filter(v => v.date.slice(0, 7) === ym && v.who.includes(pid)).length;
  return new Set(live(book.slots).filter(s => s.role === role && s.date.slice(0, 7) === ym && s.who.includes(pid)).map(s => s.date)).size;   // 날 수 (주일 네 예배는 한 번)
}
/* ---- 예약 읽기 (R9 — HB 11/15 '3+1') ----
   아고다 · 트립닷컴 예약 화면 사진(R9a)이나 예약 확인 메일(R9b)을 AI(제미나이)가 읽은 답을 다듬고, 맞는 부산 방문을 찾고, 숙소 초안에 채운다.
   ⚠️ 책을 바로 고치지 않는다 — 언제나 초안까지만. HB 가 보고 '저장' 을 눌러야 들어간다(부산 판 규칙 그대로). */
function bookingPrompt(src) {
  return [(src === 'mail' ? '아래는 숙소 예약 사이트(아고다 · 트립닷컴 등)에서 온 메일이다.' : '이 그림은 숙소 예약 사이트(아고다 · 트립닷컴 등)의 예약 화면이다.') +
    ' 숙소 예약을 찾아 JSON 배열로만 답하라. 예약이 아니면(광고 · 리뷰 요청 등) [] 를 답하라.',
    '칸: {"hotel": 숙소 이름(한국어 이름이 보이면 한국어), "checkIn": "YYYY-MM-DD", "checkOut": "YYYY-MM-DD", "total": 결제 총액 숫자(통화 기호 · 쉼표 빼고), "currency": "KRW" 같은 세 글자,',
    ' "ref": 예약번호, "cancelBy": 무료 취소 마감 "YYYY-MM-DD"(없으면 ""), "cancelAt": 그 시각 "HH:MM"(없으면 ""), "nofree": 환불 불가면 true, "cancelled": 예약이 취소된 메일 · 화면이면 true}',
    '모르는 칸은 "" 로 둔다. 짐작해서 채우지 말 것.'].join('\n');
}
function normBooking(o) {
  if (!o || typeof o !== 'object') return null;
  const ymd = (v) => { const t = String(v || '').trim().replace(/[./]/g, '-').slice(0, 10); return isYmd(t) ? t : ''; };
  const b = { hotel: str(o.hotel, 60), checkIn: ymd(o.checkIn), checkOut: ymd(o.checkOut), ref: str(String(o.ref == null ? '' : o.ref), 40),
    currency: /^[A-Z]{3}$/.test(String(o.currency || '').trim().toUpperCase()) ? String(o.currency).trim().toUpperCase() : '',
    total: num(typeof o.total === 'string' ? Number(o.total.replace(/[^\d.]/g, '')) : o.total), cancelBy: ymd(o.cancelBy), cancelAt: '', nofree: o.nofree === true, cancelled: o.cancelled === true };
  if (b.cancelBy && /^\d{1,2}:\d\d$/.test(String(o.cancelAt || '').trim())) b.cancelAt = String(o.cancelAt).trim().padStart(5, '0');
  if (b.checkOut && b.checkIn && b.checkOut <= b.checkIn) b.checkOut = '';
  if (b.nofree) { b.cancelBy = ''; b.cancelAt = ''; }
  return b.hotel || b.checkIn ? b : null;
}
// AI 답(글) → 예약 목록. ```json 울타리 · 앞뒤 말이 붙어 와도 [ … ] 또는 { … } 만 떼어 읽는다
function parseBookings(text) {
  const t = String(text || ''); let j = null;
  for (const [a, z] of [['[', ']'], ['{', '}']]) { const i = t.indexOf(a), k = t.lastIndexOf(z); if (i >= 0 && k > i) { try { j = JSON.parse(t.slice(i, k + 1)); break; } catch (_) { } } }
  return (Array.isArray(j) ? j : j ? [j] : []).map(normBooking).filter(Boolean).slice(0, 20);
}
function bookingNights(bk) { return bk.checkIn && bk.checkOut ? Math.max(1, dayGap(bk.checkIn, bk.checkOut)) : 0; }
// 맞는 방문: 체크인 날이 머무는 날 안(또는 첫날 하루 전)인 방문. 여럿이면 첫날이 가장 가까운 것
function bookingVisit(book, bk) {
  if (!bk || !bk.checkIn) return null; let best = null, bd = 99;
  for (const v of live(book.visits)) { const ds = stayDates(v); if (!ds.length) continue;
    if (bk.checkIn < addDays(ds[0], -1) || bk.checkIn > ds[ds.length - 1]) continue;
    const g = Math.abs(dayGap(ds[0], bk.checkIn)); if (g < bd) { bd = g; best = v; } }
  return best;
}
// 이미 넣은 예약인가(예약번호가 같은 숙소 줄이 있음)
function bookingSeen(book, bk) { return !!(bk && bk.ref) && live(book.visits).some(v => v.stay.some(s => s.ref === bk.ref)); }
const hotelKey = (t) => String(t || '').toLowerCase().normalize('NFC').replace(/[\s·()\-_,.]|호텔|hotel/g, '');
// 초안에 채우기 — 목록에 같은 숙소가 있으면 그 이름으로, 없으면 '새 호텔'. 원화가 아니면 금액은 그대로 둔다(HB 가 적는다)
function bookingToDraft(d, bk, list) {
  const o = Object.assign({}, d), k = hotelKey(bk.hotel);
  const hit = k ? (list || []).filter(x => x.kind === 'hotel').find(x => { const xk = hotelKey(x.name); return xk && (xk === k || k.includes(xk) || xk.includes(k)); }) : null;
  o.kind = 'hotel';
  if (hit) { o.name = hit.name; o._new = false; } else if (bk.hotel) { o.name = bk.hotel; o._new = true; }
  const n = bookingNights(bk); if (n) o.nights = n;
  if (bk.total && (!bk.currency || bk.currency === 'KRW')) o.cost = bk.total;
  o.status = bk.cancelled ? 'cancel' : 'done';
  if (bk.nofree) { o.nofree = true; delete o.cancelBy; delete o.cancelAt; }
  else if (bk.cancelBy) { o.cancelBy = bk.cancelBy; if (bk.cancelAt) o.cancelAt = bk.cancelAt; else delete o.cancelAt; delete o.nofree; }
  if (bk.ref) o.ref = bk.ref;
  return o;
}
function bookingLine(bk) {
  return [bk.hotel || '숙소', bk.checkIn ? bk.checkIn.slice(5).replace('-', '/') + (bk.checkOut ? '~' + bk.checkOut.slice(5).replace('-', '/') : '') : '',
    bk.total ? (bk.currency && bk.currency !== 'KRW' ? bk.currency + ' ' + bk.total : bk.total.toLocaleString('en-US') + '원') : '', bk.cancelled ? '취소됨' : ''].filter(Boolean).join(' · ');
}
// R9b 메일 — 지메일 찾기 말 · 메일 글 다듬기 · 여러 통 합치기 · 화면 줄
const MAIL_Q = 'from:(agoda.com OR trip.com OR ctrip.com) (예약 OR 취소 OR booking OR reservation OR cancel OR cancellation) newer_than:365d';
function htmlText(h) {
  return String(h || '').replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d|table)>/gi, '\n').replace(/<\/t[dh]>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
// AI 로 보내기 전: 메일 주소 · 전화번호 · 링크를 지우고 길이를 줄인다(예약번호 같은 이어진 숫자는 남는다)
function mailClean(t, max) {
  return String(t || '').replace(/https?:\/\/\S+/g, ' ').replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '(메일)').replace(/\+?\d{1,3}[-\s.]\d{2,4}[-\s.]\d{3,4}([-\s.]\d{3,4})?/g, '(전화)')
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max || 5000);
}
function mailPrompt() { return bookingPrompt('mail') + '\n메일이 여러 통이다(=== 메일 n === 으로 나뉨). 예약마다 "mail": 그 메일 번호(숫자)를 넣어라.'; }
// 여러 메일의 예약 → 하나로: 같은 예약번호(없으면 숙소 + 체크인)는 **나중 메일**이 이긴다(예약 뒤 취소 메일 → 취소됨). 체크인 순
function mailBookings(mails) {
  const by = {};
  for (const m of mails || []) for (const b of (m && m.b) || []) { const bk = normBooking(b); if (!bk) continue;
    const k = bk.ref || (hotelKey(bk.hotel) + '|' + bk.checkIn); if (!by[k] || (m.at || 0) >= by[k].at) by[k] = { at: m.at || 0, bk }; }
  return Object.values(by).map(x => x.bk).sort((a, b) => (a.checkIn || '9') < (b.checkIn || '9') ? -1 : 1);
}
// 화면 줄: 지난 예약(체크인이 이레 넘게 지남)은 뺀다. 맞는 방문 · 이미 넣었는지
function mailRows(book, bks, today) {
  return (bks || []).filter(b => !b.checkIn || b.checkIn >= addDays(today, -7)).map(bk => ({ bk, visit: bookingVisit(book, bk), seen: bookingSeen(book, bk) }));
}
// 넣을 자리: 같은 예약번호의 숙소 → 아직 예약 완료가 아닌 호텔 줄 → 새 줄(-1)
function mailSlot(v, bk) {
  let i = bk.ref ? v.stay.findIndex(s => s.ref === bk.ref) : -1; if (i >= 0) return i;
  i = v.stay.findIndex(s => s.kind === 'hotel' && s.status !== 'done' && s.status !== 'cancel' && !s.ref); return i;
}
/* ---- 내 일정 (R8b) ----
   목록 = 오늘 · 다음 차례 · 가까운 부산 준비 · 그다음(myAhead), 격자 = 한 줄이 한 주(myWeeks). 둘 다 달 구분 없이 n주. */
function dayGap(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5); }
function myAhead(book, pid, today, weeks) {
  const to = addDays(sunOf(today), (weeks || 8) * 7 - 1), rows = myItems(book, pid, today, to);
  const trip = rows.find(r => r.kind === 'visit' && r.date <= addDays(today, 21)) || null;   // 3주 안에 떠나거나 지금 머무는 방문
  const todays = rows.filter(r => r.kind === 'slot' && r.date === today);
  const next = rows.find(r => r.kind === 'slot' && r.date > today) || null;   // 다음 차례 = 오늘 뒤 가장 가까운 분당 자리
  const rest = rows.filter(r => r !== trip && r !== next && !todays.includes(r));
  const tally = { preach: 0, offer: 0, lead: 0, busan: 0 };
  for (const r of rows) tally[r.kind === 'visit' ? 'busan' : r.role === 'notice' ? 'offer' : r.role]++;
  return { from: today, to, todays, next, trip, rest, tally };
}
// 한 줄이 한 주(주일~토): 주일 · 주중(수 · 옛 화) · 금 · 부산 · 내가 적은 부재. 주를 넘는 부산(금토 + 다음 주일)은 떠나는 주에 적고 다음 주에는 cont 로만
function myWeeks(book, pid, sun0, n) {
  const p = book.people.find(x => x.id === pid), out = [];
  for (let i = 0; i < n; i++) {
    const sun = addDays(sun0, i * 7), sat = addDays(sun, 6), rows = myItems(book, pid, sun, sat);
    const of = (f) => rows.filter(r => r.kind === 'slot' && f(r.grp));
    out.push({ sun, sunItems: of(g => g === 'sun'), mid: of(g => g !== 'sun' && g !== 'fri'), fri: of(g => g === 'fri'),
      bs: rows.filter(r => r.kind === 'visit').map(r => ({ id: r.id, v: r.v, date: r.date, end: r.end, cont: r.date < sun })), bl: rows.filter(r => r.kind === 'blead'),
      away: ((p && !p.del && p.away) || []).filter(a => a.from <= sat && a.to >= sun) });
  }
  return out;
}
// 부산 준비 — 그 방문에서 그 사람이 챙길 것. state: done(됨) · todo(아직) · bad(겹침) · info(알림만, 셈에 안 넣음)
function tripChecks(book, v, pid) {
  const ds = stayDates(v), items = [], ss = stayState(v), st = v.stay.filter(s => s.status !== 'cancel');
  const by = st.filter(stayHotel).map(s => s.cancelBy).filter(Boolean).sort()[0] || '';
  items.push({ key: 'stay', state: ss === 'done' ? 'done' : 'todo', text: stayText(v), open: ss === 'open', cancelBy: by });
  for (const dir of ['down', 'up']) { const t = v.travel.filter(x => x.dir === dir && (x.mode || x.time));
    items.push({ key: dir, state: t.length ? 'done' : 'todo', text: t.map(x => [x.mode, timeS(x.time)].filter(Boolean).join(' ')).join(' · ') }); }
  if (leadIs(v, 'fri', 'staff') && friName(visitSun(v.date))) items.push({ key: 'fri', state: 'info', text: friName(visitSun(v.date)) });
  const evl = visitLeads(book, v).filter(x => x.ev);   // 더한 예배(1116-2 D) — 알림만
  if (evl.length) items.push({ key: 'ev', state: 'info', text: evl.map(x => x.text).join(' · ') });
  const m = book.marks.find(x => x.id === markId(sunOf(v.date)) && !x.del);
  if ((v.mates || []).length) items.push({ key: 'staff', state: 'done', text: mateText(book, v) });
  else if (m && m.tags.includes('극동방송')) items.push({ key: 'staff', state: 'todo', text: '' });
  const hit = live(book.slots).filter(s => ds.includes(s.date) && s.who.includes(pid)).sort((a, b) => (a.id < b.id ? -1 : 1));
  const aw = ds.find(d => awayOn(book, pid, d));
  items.push({ key: 'clash', state: hit.length || aw ? 'bad' : 'done', slots: hit.map(s => s.id), away: aw || '' });
  const cnt = items.filter(x => x.state !== 'info');
  return { items, done: cnt.filter(x => x.state === 'done').length, total: cnt.length };
}

/* ---- 내 화면 취향(ui · R8b): 첫 화면 + 내 이름 보이는 모양 ----
   책(b7)과 따로다 — HB 는 rota/{uid} 의 맨 위 ui 칸, 교역자는 자기 칸 staff/{uid} 의 ui. absorb 는 이것을 읽지 않는다(normStaff 가 아는 칸만 짓는다). */
const HOMES = ['last', 'week', 'month:sheet', 'month:grid', 'month:mine', 'month:matrix', 'month:cal', 'month:busan', 'month:bteam', 'month:bserve', 'busan', 'people'];
const NAME_COLORS = ['', 'red', 'orange', 'green', 'blue', 'purple'], NAME_HLS = ['', 'yellow', 'green', 'blue', 'pink', 'gray'];
function normUi(o, staff) {
  o = o && typeof o === 'object' ? o : {}; const n = o.name && typeof o.name === 'object' ? o.name : null;
  const home = HOMES.includes(o.home) && !(staff && o.home === 'people') ? o.home : staff ? 'month:mine' : 'last';   // 처음 값: 교역자 = 내 일정 · HB = 마지막에 본 화면
  const al = normAl(o.al);   // 알림 판 기간(1117-Z 2b) — 있을 때만
  const gsk = staff ? [] : gsSkipNorm(o.gsk);   // 시트와 맞춰 보기에서 넘긴 줄(1121-G G4) — HB 만, 있을 때만
  return Object.assign({ home, name: n ? { b: !!n.b, c: NAME_COLORS.includes(n.c) ? n.c : '', h: NAME_HLS.includes(n.h) ? n.h : '' } : { b: true, c: '', h: 'yellow' }, at: num(o.at) }, al ? { al } : {}, gsk.length ? { gsk } : {});
}
function homeTo(home) { if (!HOMES.includes(home) || home === 'last') return null; const [tab, mview] = home.split(':'); return mview ? { tab, mview } : { tab }; }
// 글 안에서 내 이름 자리 [시작, 끝) — 앞뒤가 한글이면 다른 이름 · 낱말의 일부로 보고 건너뛴다
function nameSpans(text, name) {
  const out = [], han = (c) => !!c && /[가-힣]/.test(c); text = String(text || ''); name = String(name || ''); if (!name) return out;
  for (let i = text.indexOf(name); i >= 0; i = text.indexOf(name, i + name.length)) if (!han(text[i - 1]) && !han(text[i + name.length])) out.push([i, i + name.length]);
  return out;
}

/* ---- 부산 주일 광고 (R12 C) — Monday 에서 서버(gcal-functions 의 monday)가 읽어 준 것 ----
   o = { sun, busan: { found, group, spoken: [{ n, title }], video: [제목], check: [제목] }, video: [{ title, url, link, notes: [묶음], rep }] }
   묶음(C4a) = { id, at, tm, text, link, replies: [{ at, tm, text }] } — Monday 업데이트 하나와 그 답글. 묶음 중 하나라도 '부산' 이면 서버가 묶음째 준다.
   link = Monday 에서 그 아이템 · 업데이트를 여는 주소('Monday에서 보기 ↗'). 옛 서버의 { at, text } 한 줄도 답글 없는 묶음으로 읽는다.
   rep = 그 영상에 리포터가 배정됐나(true/false, 서버가 모르면 null) — 이름은 오지 않는다.
   카톡용 글은 HB 양식(11/16):  날짜 · 1부/2부 내려간 교역자 · 0: (영상) 제목 + 분당/부산 상영 · 구두 광고 번호(1부터 다시) · 리포터에 따라 영상내 포함/비포함.
   ⚠️ '부산 관련 Monday 글'(업데이트 · 답글) · '확인 필요' · 유튜브 주소는 화면에만 — 카톡 글에 넣지 않는다. */
const ADS_BS = { same: '분당 있음 / 부산 있음 (1부 중계, 2부 파일)', diff: '분당 있음 / 부산 버전 따로 있음 (1부 파일, 2부 파일)', none: '분당 있음 / 부산 없음' };
const MON_LINK = /^https:\/\/[a-z0-9-]+\.monday\.com\/[^\s"'<>]*$/i;
const monLink = (v) => (typeof v === 'string' && MON_LINK.test(v) ? v.slice(0, 300) : '');
function normNote(x) {
  const tm = (v) => (typeof v === 'string' && /^\d\d:\d\d$/.test(v) ? v : '');
  const re = (Array.isArray(x.replies) ? x.replies : []).filter(r => r && str(r.text, 1600)).slice(0, 10).map(r => ({ at: str(r.at, 10), tm: tm(r.tm), who: str(r.who, 30), text: str(r.text, 1600) }));
  return { id: /^\d{1,20}$/.test(String(x.id || '')) ? String(x.id) : '', at: str(x.at, 10), tm: tm(x.tm), who: str(x.who, 30), text: str(x.text, 1600), link: monLink(x.link), replies: re };
}
function normAds(o) {
  o = o && typeof o === 'object' ? o : {}; const b = o.busan && typeof o.busan === 'object' ? o.busan : {};
  const strs = (a, n) => (Array.isArray(a) ? a : []).map(x => str(x, 200)).filter(Boolean).slice(0, n);
  return {
    sun: str(o.sun, 10),
    busan: { found: !!b.found, group: str(b.group, 20),
      spoken: (Array.isArray(b.spoken) ? b.spoken : []).filter(x => x && str(x.title, 200)).map(x => ({ n: num(x.n), title: str(x.title, 200) })).sort((x, y) => x.n - y.n).slice(0, 30),
      video: strs(b.video, 20), check: strs(b.check, 20) },
    video: (Array.isArray(o.video) ? o.video : []).filter(v => v && str(v.title, 200)).slice(0, 5).map(v => ({ title: str(v.title, 200),
      url: /^https?:\/\//.test(String(v.url || '')) ? str(v.url, 300) : '',
      link: monLink(v.link),
      notes: (Array.isArray(v.notes) ? v.notes : []).filter(x => x && typeof x === 'object').map(normNote).filter(x => x.text || x.replies.length).slice(0, 6),
      rep: typeof v.rep === 'boolean' ? v.rep : null })),
  };
}
// 리포터 → 구두 광고가 영상 안에 드나: true(하나라도 배정) · false(영상이 없거나 모두 비었음) · null(서버가 모름 — 옛 서버)
/* 부산 상영 경고 (C4b ②-3) — 금 · 토 · 주일에, 그 주일(금 · 토는 다가오는 주일)에 영상 광고가 있는데 상영을 안 골랐으면 그 주일.
   영상 광고가 있는지는 이 기기에서 마지막으로 읽은 광고(cache = rota_ads_v1 모양 { 주일: { at, o } })로만 본다 — 읽은 적 없는 주는 경고하지 않는다(짐작 금지). */
function bsWarnSun(book, today, cache) {
  if (!isYmd(today) || ![5, 6, 0].includes(dowOf(today))) return '';
  const sun = visitSun(today), c = cache && cache[sun], o = c && c.o;
  if (!o || !Array.isArray(o.video) || !o.video.length) return '';
  return showOf(book, sun) ? '' : sun;
}
function adsRep(a) { if (!a.video.length) return false; if (a.video.some(v => v.rep === true)) return true; return a.video.every(v => v.rep === false) ? false : null; }
// opt = { who: '1부 · 2부에 적을 이름(내려간 교역자)', bs: 'same' | 'diff' | 'none' (부산 상영 — 고르기 전이면 '부산 상영 미정', C4a ②-2) }
const ADS_NOGROUP = '(부산 주보에 아직 이 주일 그룹이 없습니다. 부산 주보 담당 교역자와 확인해주세요)';
function adsText(o, opt) {
  const a = normAds(o); if (!a.sun) return ''; opt = opt || {};
  const who = str(opt.who, 120) || '미정', bs = ADS_BS[opt.bs] ? opt.bs : '';
  const L = [mdOf(a.sun) + '(주일) 부산 주일예배 광고', '', '1부: ' + who, '2부: ' + who, ''];
  if (a.video.length) { a.video.forEach(v => L.push('0: (영상) ' + v.title)); L.push(bs ? ADS_BS[bs] : '부산 상영 미정'); }
  else L.push('0: (영상) 없음', '분당 없음 / 부산 없음');
  L.push('');
  // 부산 주보 그룹이 없으면 리포터 줄도 뺀다 — 구두 광고가 무엇인지 모르니 '해야 함' 도 말할 수 없다 (C4a ⑤)
  if (!a.busan.found) { L.push(ADS_NOGROUP); return L.join('\n'); }
  a.busan.spoken.forEach((x, i) => L.push((i + 1) + '. ' + x.title));
  const rep = adsRep(a);
  if (rep === true) L.push('> 모두 영상내 포함', '>> 구두광고 슬라이드 필요없음');
  else if (rep === false) L.push('> 모두 영상내 비포함', '>> 구두광고 및 슬라이드 필요 @');
  else L.push('> 리포터 배정을 읽지 못했습니다 (서버를 다시 올려 주세요)');
  return L.join('\n');
}
// Monday 글 → 조각들 (화면에서 글 · 링크 · 멘션을 따로 그리게)  [{ k: 't', v } | { k: 'a', v: 주소, label } | { k: '@', v }]
//   링크 규칙(C4a ③): 파란 글 + ↗ · 긴 주소(30자 넘음)는 사이트 이름만 · http(s) 만 링크로. 멘션은 앞이 빈칸 · 줄 처음인 '@이름'.
function adsLinkLabel(url) {
  const bare = String(url).replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (bare.length <= 30) return bare;
  return bare.split(/[/?#]/)[0].replace(/^(www|m)\./i, '');
}
function adsRich(text) {   // ⚠️ 뒤돌아보기 정규식((?<=…))은 옛 아이폰에서 깨진다 — 앞 글자를 함께 잡아 글로 돌린다
  const out = [], s = String(text || ''), re = /(https?:\/\/[^\s<>"]+)|(^|\s)(@[^\s@,.!?:;()\[\]<>"']{1,30})/g;
  const put = (x) => { const l = out[out.length - 1]; if (x.k === 't' && l && l.k === 't') l.v += x.v; else if (x.v) out.push(x); };
  let i = 0, m;
  while ((m = re.exec(s))) {
    put({ k: 't', v: s.slice(i, m.index) });
    if (m[1]) {
      const t = /[.,!?;:)\]'"]+$/.exec(m[1]), v = t ? m[1].slice(0, -t[0].length) : m[1];
      put({ k: 'a', v, label: adsLinkLabel(v) }); if (t) put({ k: 't', v: t[0] });
    } else { put({ k: 't', v: m[2] }); put({ k: '@', v: m[3] }); }
    i = m.index + m[0].length;
  }
  put({ k: 't', v: s.slice(i) });
  return out;
}
// 묶음을 날짜(묶음 머리 날짜)별로 — 위가 가장 오래된 날, 같은 날도 이른 것부터 (HB 11/16: 아래로 갈수록 최신)
function adsByDay(notes) {
  const days = [];
  (notes || []).slice().sort((a, b) => ((a.at + a.tm) > (b.at + b.tm) ? 1 : (a.at + a.tm) < (b.at + b.tm) ? -1 : 0)).forEach(n => {
    const d = days.find(x => x.at === n.at); if (d) d.notes.push(n); else days.push({ at: n.at, notes: [n] });
  });
  return days;
}
/* ---------- 구글 자료 — 부산 예배팀 · 예배위원 시트 읽기 (1121-G G1, HB 11/21) ----------
   HB 가 매달 새 탭(이름 `26년 11월 1117-1` = 해 · 달 · 고친 날-번호)으로 만드는 두 구글 시트를 **읽기만** 한다.
   칸 자리(A1 주소)가 아니라 **글자**('주 일 예 배' · '1부' · '구분' · '금요예배')로 줄 · 열을 찾는다 — 매달 줄이 늘거나 열이 밀려도 깨지지 않게.
   못 찾으면 짐작하지 않고 warn 에 적는다. 칸 '판교중계' = 그 예배는 분당 중계(relay) — 이름으로 읽지 않는다.
   ⛔ 시트에 쓰지 않는다 · 앱 책(book)을 바꾸지 않는다 · R13(분당 예배팀, 서버가 받는 것)과 섞지 않는다.
   ⚠️ 여기 · 시험에는 지어낸 이름만. 읽은 표(성도 이름)는 G1 에서는 화면 메모리에만 — 계정 저장 · 보안 규칙은 G2.
   한 탭을 읽은 모양: { kind, ym, sun:[{ date, svc:'1'|'2'|'3'|'LL', relay, cells:{ 역할: [이름…] } }],
                       fri:[{ date, name:'어웨이크'…, relay, cells }], roles:{ sun:[{ k, label }], fri:[…] }, warn:[글] } */
const GS_SRC = [{ k: 'bteam', name: '부산 예배팀' }, { k: 'bserve', name: '부산 예배위원' }];
const GS_RELAY = '판교중계';
const GS_MAX = { rows: 150, cols: 80, names: 8, len: 20, roles: 40 };   // 이상한 시트가 와도 이만큼만 본다
const GS_SVC_NAME = { '1': '1부', '2': '2부', '3': '3부', LL: '라이프라인' };
function gsN(s) { return String(s == null ? '' : s).replace(/\s+/g, ''); }
function gsAt(g, r, c) { const v = (g[r] || [])[c]; return v == null ? '' : String(v).trim(); }
// 탭 이름 → { ym, ver, rank }. 고친 판(MMDD-N)은 없어도 된다. '…의 사본' 처럼 다른 꼴은 null (읽지 않음)
function gsTabInfo(title) {
  // 고친 판은 'MMDD-N' 또는 'YY-MMDD-N'(2026년 1 · 2월 탭이 이 꼴 — 실제 시트 11/21)
  const m = /^\s*(\d{2})\s*년\s*(\d{1,2})\s*월(?:\s+(?:(\d{2})-)?(\d{2})(\d{2})(?:\s*-\s*(\d{1,3}))?)?\s*$/.exec(String(title || ''));
  if (!m || +m[2] < 1 || +m[2] > 12) return null;
  const y = 2000 + +m[1], mo = +m[2], ym = y + '-' + String(mo).padStart(2, '0');
  if (!m[4]) return { ym, ver: '', rank: 0 };
  const vm = +m[4]; let vy = m[3] ? 2000 + +m[3] : y; if (!m[3]) { if (vm - mo > 6) vy--; else if (mo - vm > 6) vy++; }   // 1월 탭을 12월에 만들면(1228-1) 그 해는 앞 해
  return { ym, ver: (m[3] ? m[3] + '-' : '') + m[4] + m[5] + (m[6] ? '-' + m[6] : ''), rank: (vy * 10000 + vm * 100 + +m[5]) * 1000 + (+m[6] || 0) };
}
// 읽을 탭: 이번 달 · 다음 달 하나씩. 같은 달이 여럿이면 **맨 뒤 판** = 고친 날 · 번호가 큰 것.
// 판 이름이 같으면 시트에서 **앞(왼쪽)** 것 — HB 는 새 탭을 맨 앞에 둔다(실제 시트 11/21: '26년 11월 1117-1' 이 첫 탭)
function gsPickTabs(titles, today) {
  const want = [today.slice(0, 7), addMonths(today.slice(0, 7), 1)], best = {};
  (titles || []).forEach((t, i) => { const x = gsTabInfo(t); if (!x || !want.includes(x.ym)) return;
    const b = best[x.ym]; if (!b || x.rank > b.rank) best[x.ym] = { title: String(t), ver: x.ver, rank: x.rank, i }; });
  return want.map(ym => ({ ym, title: best[ym] ? best[ym].title : '', ver: best[ym] ? best[ym].ver : '' }));
}
// 합친 칸 펴기 — 구글은 합친 칸의 글을 왼쪽 위 한 칸에만 준다. merges = 시트 정보의 merges(끝 번호는 안 듦)
function gsFill(values, merges) {
  const g = (Array.isArray(values) ? values : []).slice(0, GS_MAX.rows).map(r => (Array.isArray(r) ? r : []).slice(0, GS_MAX.cols).map(c => (c == null ? '' : String(c))));
  for (const mg of Array.isArray(merges) ? merges : []) {
    const r0 = +mg.startRowIndex || 0, c0 = +mg.startColumnIndex || 0, r1 = Math.min(+mg.endRowIndex || 0, GS_MAX.rows), c1 = Math.min(+mg.endColumnIndex || 0, GS_MAX.cols);
    const v = gsAt(g, r0, c0); if (!v) continue;
    for (let r = r0; r < r1; r++) { while (g.length <= r) g.push([]); for (let c = c0; c < c1; c++) { while (g[r].length < c) g[r].push(''); g[r][c] = v; } }
  }
  return g;
}
// 칸 글 → { date, rest } — 앞머리의 날짜와 뒤에 붙은 글. 해는 탭의 달에서(12월 탭의 '1/3' = 다음 해 1월 3일).
// 특별예배는 칸에 '12/24(수) 8PM 워십나잇' · '12/19 7:30PM 크리스마스 콘서트' 처럼 적는다(실제 2025-12 탭) → rest = '8PM 워십나잇'. 못 읽으면 date ''
function gsDateRest(text, ym) {
  const s = String(text == null ? '' : text).trim(); let y = +ym.slice(0, 4), mo, d, m, rest;
  if ((m = /^(\d{4})\s*[-./년]\s*(\d{1,2})\s*[-./월]\s*(\d{1,2})(?![\d:])\s*일?\.?(?:\s*\([^)]{1,4}\))?([\s\S]*)$/.exec(s))) { y = +m[1]; mo = +m[2]; d = +m[3]; rest = m[4]; }
  else if ((m = /^(\d{1,2})\s*[/.월]\s*(\d{1,2})(?![\d:])\s*일?(?:\s*\([^)]{1,4}\))?([\s\S]*)$/.exec(s))) { mo = +m[1]; d = +m[2]; rest = m[3]; const tm = +ym.slice(5, 7); if (mo - tm > 6) y--; else if (tm - mo > 6) y++; }
  else return { date: '', rest: '' };
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return { date: '', rest: '' };
  const dt = new Date(Date.UTC(y, mo - 1, d)); if (dt.getUTCMonth() !== mo - 1) return { date: '', rest: '' };   // 2/30 같은 날은 버린다
  return { date: y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0'), rest: String(rest || '').replace(/\s+/g, ' ').trim().slice(0, 40) };
}
function gsDate(text, ym) { return gsDateRest(text, ym).date; }
// 예배 칸 머리 → '1' · '2' · '3' · 'LL' ('2부 예배 (안내: 4층만)' 도 '2')
function gsSvc(text) { const s = gsN(text).replace(/\(.*$/, ''); return /^1부/.test(s) ? '1' : /^2부/.test(s) ? '2' : /^3부/.test(s) ? '3' : /^(라이프라인|LL)/i.test(s) ? 'LL' : ''; }
// 한 칸의 이름들 — 쉼표 · 빈칸 · 줄바꿈으로 나눔. '김가람A' 같은 표시는 그대로 둔다(사람에 억지로 잇지 않음). '판교중계' 는 이름이 아니다
function gsNames(text) { return String(text == null ? '' : text).split(/[\s,，、·]+/).map(x => x.trim()).filter(x => x && x !== GS_RELAY).slice(0, GS_MAX.names).map(x => x.slice(0, GS_MAX.len)); }
function gsRoleOf(label) { const t = String(label || '').replace(/\s+/g, ' ').trim(); return { k: gsN(t).replace(/위원$/, ''), label: t.replace(/\s*위원$/, '') }; }
function gsFind(g, pred) { for (let r = 0; r < g.length; r++) for (let c = 0; c < (g[r] || []).length; c++) if (pred(gsN(g[r][c]))) return [r, c]; return null; }
// 역할 줄: from 줄부터 왼쪽 이름 칸(c0)이 빌 때까지. 같은 이름 줄이 또 있으면 '#2' 를 붙여 가른다
function gsRoleRows(g, from, c0, stop) {
  const out = [], seen = {};
  for (let r = from; r < g.length && out.length < GS_MAX.roles; r++) {
    const t = gsAt(g, r, c0); if (!t || (stop && gsN(t) === stop)) break;
    const ro = gsRoleOf(t); seen[ro.k] = (seen[ro.k] || 0) + 1; if (seen[ro.k] > 1) ro.k += '#' + seen[ro.k];
    out.push(Object.assign({ r }, ro));
  }
  return out;
}
function gsCells(g, rows, c) {
  const cells = {}; let relay = false;
  for (const ro of rows) { const t = gsAt(g, ro.r, c); if (gsN(t) === GS_RELAY) relay = true; const n = gsNames(t); if (n.length) cells[ro.k] = n; }
  return { relay, cells };
}
const gsMd = ymd => +ymd.slice(5, 7) + '/' + +ymd.slice(8, 10);
// 부산 예배팀 — 주일 판(날짜 줄 + 1부 · 2부 · 라이프라인 줄 + 역할 줄) · 금요 판(예배 이름 줄 + 날짜 줄 + 역할 줄)
function gsReadTeam(values, merges, ym) {
  const g = gsFill(values, merges), warn = [], out = { kind: 'bteam', ym, sun: [], fri: [], roles: { sun: [], fri: [] }, warn };
  const S = gsFind(g, t => t === '주일예배');
  if (!S) warn.push("'주 일 예 배' 칸을 찾지 못했습니다");
  else {
    const [r0, c0] = S; let sr = -1, dr = -1;
    for (let r = r0; r <= r0 + 4 && sr < 0; r++) for (let c = c0 + 1; c < (g[r] || []).length; c++) if (gsSvc(gsAt(g, r, c))) { sr = r; break; }
    for (let r = sr - 1; r >= r0 && dr < 0; r--) for (let c = c0 + 1; c < (g[r] || []).length; c++) if (gsDate(gsAt(g, r, c), ym)) { dr = r; break; }
    if (sr < 0) warn.push("주일 판에서 '1부 · 2부 · 라이프라인' 줄을 찾지 못했습니다");
    else if (dr < 0) warn.push('주일 판에서 날짜 줄을 찾지 못했습니다');
    else {
      const rows = gsRoleRows(g, sr + 1, c0, '금요예배'); let last = '';
      out.roles.sun = rows.map(x => ({ k: x.k, label: x.label }));
      for (let c = c0 + 1; c < Math.max((g[sr] || []).length, (g[dr] || []).length); c++) {
        const st = gsAt(g, sr, c), dt = gsAt(g, dr, c), sv = gsSvc(st);
        if (!st && !dt) { if (out.sun.length) break; continue; }   // 빈 칸이 나오면 주일 판 끝 — 오른쪽 옆 표(준비물 …)는 그 너머라 안 읽는다
        const d = gsDate(dt, ym) || last; last = d; if (!d) continue;   // 합친 날짜 칸(펴지 못했을 때)은 왼쪽 날짜를 잇는다
        if (!sv) { const w = gsMd(d) + " '" + (st || dt).replace(/\s+/g, ' ') + "' 칸은 읽지 않았습니다 (1부 · 2부 · 라이프라인이 아님)"; if (!warn.includes(w)) warn.push(w); continue; }   // 짐작하지 않고 알린다
        out.sun.push(Object.assign({ date: d, svc: sv }, gsCells(g, rows, c)));
      }
      if (!out.sun.length) warn.push('주일 판에서 예배 칸을 하나도 읽지 못했습니다');
    }
  }
  const F = gsFind(g, t => t === '금요예배');
  if (!F) warn.push("'금 요 예 배' 칸을 찾지 못했습니다");
  else {
    const [r0, c0] = F; let dr = -1;
    for (let r = r0; r <= r0 + 2 && dr < 0; r++) if (gsDate(gsAt(g, r, c0 + 1), ym)) dr = r;
    if (dr < 0) warn.push('금요 판에서 날짜 줄을 찾지 못했습니다');
    else {
      const rows = gsRoleRows(g, dr + 1, c0, '');
      out.roles.fri = rows.map(x => ({ k: x.k, label: x.label }));
      for (let c = c0 + 1; c < (g[dr] || []).length; c++) {
        const x = gsDateRest(gsAt(g, dr, c), ym), name = (dr > r0 ? gsAt(g, r0, c) : '').replace(/\s+/g, ' ') || x.rest; if (!x.date) break;   // 날짜가 끊기면 금요 판 끝(오른쪽 청소 당번 표는 빈 칸 너머)
        out.fri.push(Object.assign({ date: x.date, name }, gsCells(g, rows, c)));   // 금요일이 아닌 날(성탄 전야 · 송구영신)도 그대로 — 이름이 붙어 온다
      }
    }
  }
  return out;
}
// 부산 예배위원 — 주일 판(주일 · 구분 · 1부 · 2부 · 라이프라인 머리 + 날짜마다 안내 · 헌금 · 봉독 · 광고 줄) · 오른쪽 금요 판('금요예배' 아래 날짜 · 옆에 헌금 · 안내)
function gsReadServe(values, merges, ym) {
  const g = gsFill(values, merges), warn = [], out = { kind: 'bserve', ym, sun: [], fri: [], roles: { sun: [], fri: [] }, warn };
  const H = gsFind(g, t => t === '구분');
  if (!H) warn.push("주일 판에서 '구분' 칸을 찾지 못했습니다");
  else {
    const [rh, cr] = H, row = g[rh] || []; let cd = row.findIndex(x => gsN(x) === '주일'); if (cd < 0) cd = cr - 1;
    const cols = []; for (let c = cr + 1; c < row.length; c++) { const t = gsAt(g, rh, c); if (!t) break; const sv = gsSvc(t);
      if (sv) cols.push({ c, svc: sv }); else warn.push("'" + t.replace(/\s+/g, ' ') + "' 칸은 읽지 않았습니다 (1부 · 2부 · 라이프라인이 아님)"); }
    if (!cols.length) warn.push("주일 판에서 '1부 · 2부 · 라이프라인' 머리를 찾지 못했습니다");
    else {
      const by = {}, order = [], roleSeen = {}; let date = '', blank = 0;
      for (let r = rh + 1; r < g.length; r++) {
        const lab = gsAt(g, r, cr), d = gsDate(gsAt(g, r, cd), ym); if (d) date = d;
        if (!lab) { if (++blank >= 2) break; continue; } blank = 0;
        if (!date) continue;
        const ro = gsRoleOf(lab); if (!roleSeen[ro.k] && Object.keys(roleSeen).length < GS_MAX.roles) { roleSeen[ro.k] = 1; out.roles.sun.push(ro); }
        if (!roleSeen[ro.k]) continue;
        for (const x of cols) { const id = date + '|' + x.svc;
          if (!by[id]) { by[id] = { date, svc: x.svc, relay: false, cells: {} }; order.push(id); }
          const n = gsNames(gsAt(g, r, x.c)); if (n.length) by[id].cells[ro.k] = n; }
      }
      out.sun = order.map(id => by[id]);   // 주일이 아닌 날(성탄 12/25)도 시트에 있으면 그대로
      if (!out.sun.length) warn.push('주일 판에서 날짜를 하나도 읽지 못했습니다');
    }
  }
  const F = gsFind(g, t => t === '금요예배');
  if (!F) warn.push("'금요예배' 칸을 찾지 못했습니다");
  else {
    const [rf, cf] = F, cols = [];
    for (let c = cf + 1; c < GS_MAX.cols; c++) {
      const a = gsAt(g, rf, c), lab = a && gsN(a) !== '금요예배' ? a : gsAt(g, rf - 1, c); if (!lab) break;   // 머리(헌금 위원 · 안내 위원)는 '금요예배' 와 같은 줄이나 한 줄 위
      cols.push(Object.assign({ c }, gsRoleOf(lab)));
    }
    out.roles.fri = cols.map(x => ({ k: x.k, label: x.label }));
    if (!cols.length) warn.push("금요 판에서 '헌금 · 안내' 머리를 찾지 못했습니다");
    else for (let r = rf + 1; r < g.length; r++) {
      const x = gsDateRest(gsAt(g, r, cf), ym); if (!x.date) break;   // 빈 줄이 나오면 끝(그 아래 안내 글은 안 읽음)
      const cells = {}; for (const k of cols) { const n = gsNames(gsAt(g, r, k.c)); if (n.length) cells[k.k] = n; }
      out.fri.push({ date: x.date, name: x.rest, relay: false, cells });   // '12/24(수) 8PM 워십나잇' → 이름 '8PM 워십나잇'
    }
  }
  return out;
}
function gsRead(kind, values, merges, ym) { return kind === 'bserve' ? gsReadServe(values, merges, ym) : gsReadTeam(values, merges, ym); }
// 두 달 판을 하나로 — 같은 날 · 같은 예배가 두 판에 있으면 그 날의 달 판이 이긴다. 날짜순(같은 날은 1부 · 2부 · 3부 · LL)
function gsJoin(parts) {
  const seen = {}, out = { sun: [], fri: [], roles: { sun: [], fri: [] } };
  for (const p of parts || []) { if (!p) continue;
    for (const side of ['sun', 'fri']) {
      for (const ro of (p.roles && p.roles[side]) || []) if (!out.roles[side].some(x => x.k === ro.k)) out.roles[side].push({ k: ro.k, label: ro.label });
      for (const e of p[side] || []) { const id = side + '|' + e.date + '|' + (e.svc || ''), own = e.date.slice(0, 7) === p.ym, prev = seen[id];
        if (prev && (prev.own || !own)) continue; seen[id] = { own, e }; } } }
  for (const id of Object.keys(seen).sort()) out[id.split('|')[0]].push(seen[id].e);
  return out;
}
// 한 줄 요약: '주일 5 · 금요 4' (주일은 날짜 수)
function gsCount(j) { const s = new Set(((j && j.sun) || []).map(e => e.date)).size, f = ((j && j.fri) || []).length; return (s ? '주일 ' + s : '') + (s && f ? ' · ' : '') + (f ? '금요 ' + f : '') || '읽은 날이 없습니다'; }
// 한 예배(주일 칸 · 금요 칸)를 글 한 줄로: '예배 인도 가람 · 싱어1 나래' — 중계면 '분당 중계' 를 앞에
function gsLine(e, roles) {
  const parts = []; if (e.relay) parts.push('분당 중계');
  for (const ro of roles || []) { const n = (e.cells || {})[ro.k]; if (n && n.length) parts.push(ro.label + ' ' + n.join(' ')); }
  return parts.join(' · ');
}
// 미리보기(?demo=1) · 시험용 — 실제 시트와 같은 꼴(합친 칸 · 오른쪽 옆 표 · 빈 줄)의 지어낸 탭. 이름은 모두 지어낸 것
function gsDemo(kind, ym) {
  const suns = monthSundays(ym), fris = [0, 1, 2, 3, 4].map(w => addDays(ym + '-01', (5 - dowOf(ym + '-01') + 7) % 7 + w * 7)).filter(d => d.slice(0, 7) === ym);   // 그 달 금요일 전부
  const N = ['가람', '나래', '다온', '라온', '마루', '바다', '사랑', '아라', '자람', '차오', '하늘', '한별'], pick = i => '김' + N[i % N.length];
  const md = d => +d.slice(5, 7) + '/' + +d.slice(8, 10), v = [], mg = [];
  const set = (r, c, x) => { while (v.length <= r) v.push([]); while (v[r].length < c) v[r].push(''); v[r][c] = x; };
  const merge = (r0, c0, r1, c1) => mg.push({ startRowIndex: r0, endRowIndex: r1, startColumnIndex: c0, endColumnIndex: c1 });
  if (kind === 'bteam') {
    const R = ['예배 인도', '싱어1', '싱어2', '메인 건반', '드럼', '조명', '음향 & 중계', '자막', '봉독', '교역자', '토요모임'];
    set(0, 1, '최종'); set(2, 1, '주  일  예  배'); set(3, 1, ym.replace('-', '.')); merge(3, 1, 5, 2);
    suns.forEach((s, w) => { const c = 2 + w * 3; set(3, c, md(s)); merge(3, c, 4, c + 3); ['1부', '2부', '라이프라인'].forEach((x, k) => set(4, c + k, x));
      R.forEach((ro, i) => { const r = 5 + i; set(r, 1, ro);
        if (i <= 4) { set(r, c + 1, pick(w + i)); if (w % 2) set(r, c + 2, pick(w + i + 3)); }
        if (ro === '조명' || ro === '음향 & 중계') { set(r, c, pick(w + 7)); set(r, c + 1, pick(w + 8)); }
        if (ro === '자막') { set(r, c, pick(9)); set(r, c + 1, pick(9)); }
        if (ro === '봉독') set(r, c + 1, pick(w + 2));
        if (ro === '교역자') set(r, c + 1, '박목사' + (w + 1));
        if (ro === '토요모임') set(r, c + 1, '기도회, 곡연습'); });
      set(5, c, GS_RELAY); merge(5, c, 10, c + 1);
      if (!(w % 2)) { set(5, c + 2, GS_RELAY); merge(5, c + 2, 10, c + 3); } });
    set(4, 2 + suns.length * 3 + 8, '어쿠스틱'); set(3, 2 + suns.length * 3 + 8, '예배 인도');   // 오른쪽 준비물 표(읽지 않음)
    const fr = 5 + R.length + 1, FN = ['어웨이크', '리바이브드', '인카운터', '워십나잇', ''];
    set(fr, 1, '금 요 예 배'); fris.forEach((d, i) => { const c = 2 + i; set(fr, c, i === fris.length - 1 ? '워십나잇' : FN[i]); set(fr + 1, c, md(d));
      R.slice(0, 8).forEach((ro, k) => { set(fr + 2 + k, 1, ro); if (i % 3 === 0 && k < 5) { if (k === 0) { set(fr + 2, c, GS_RELAY); merge(fr + 2, c, fr + 7, c + 1); } } else if (k !== 7) set(fr + 2 + k, c, pick(i + k + 1)); }); });
    set(fr, 2 + fris.length + 4, '예배팀 청소(토요일)'); set(fr + 1, 2 + fris.length + 5, md(addDays(fris[0], 1)));   // 오른쪽 청소 당번 표(읽지 않음)
  } else {
    set(1, 1, ym.slice(0, 4) + '년 ' + +ym.slice(5) + '월 예배 위원_부산 캠퍼스'); merge(1, 1, 2, 8);
    ['주일', '구분', '1부 예배', '2부 예배\n(안내: 4층만)', '라이프라인 예배'].forEach((x, k) => set(3, 1 + k, x));
    set(3, 8, '헌금 위원'); set(3, 9, '안내 위원'); set(4, 7, '금요예배');
    suns.forEach((s, w) => { const r = 4 + w * 4; set(r, 1, md(s)); merge(r, 1, r + 4, 2);
      ['안내위원', '헌금위원', '봉독위원', '광고위원'].forEach((ro, k) => { set(r + k, 2, ro);
        if (k === 0) { set(r, 4, pick(w)); set(r, 5, pick(w + 1)); }
        if (k === 1) { set(r + 1, 3, pick(w + 2)); set(r + 1, 4, pick(w + 3) + ' ' + pick(w + 4)); set(r + 1, 5, pick(w + 5)); }
        if (k === 2) set(r + 2, 4, pick(w + 6));
        if (k === 3) { set(r + 3, 3, '박목사' + (w + 1)); set(r + 3, 4, '박목사' + (w + 1)); } }); });
    fris.forEach((d, i) => { set(5 + i, 7, md(d)); set(5 + i, 8, pick(i + 2) + (i === 1 ? ', ' + pick(i + 6) : '')); if (i > 1) set(5 + i, 9, pick(i + 4)); });
    for (let i = 0; i < 6; i++) set(4 + i, 11, pick(i));   // 맨 오른쪽 이름 줄(읽지 않음)
  }
  return { title: (ym.slice(2, 4)) + '년 ' + +ym.slice(5) + '월 ' + ym.slice(5) + '01-1', values: v, merges: mg };
}
/* ---- 계정에 두기 (1121-G G2, HB 결정 ① 가 · ② 가 · 11/21) ----
   읽은 표는 rota/{HB uid}/gs/{bteam|bserve} 한 장씩 — HB 가 쓰고 팀 교역자는 읽기만(보안 규칙 gs).
   고른 파일(id · 이름)은 rota/{HB uid}/gs/src — HB 만 읽는다(교역자에게 시트 id 를 보이지 않게).
   ⚠️ 시트의 '사본' 이다: 시트가 바뀌면 다음 읽기에서 통째로 바꿔 끼운다. 책(book)과 섞지 않고 absorb 도 읽지 않는다.
   ⚠️ 견줄 때 계정 문서를 JSON.stringify 차례로 견주지 말 것(1117-F) — 쓸 때 만든 지문(h)끼리만 견준다. */
const GS_DOC_V = 1, GS_ENTRY_MAX = 400, GS_STALE_MS = 60 * 60 * 1000;
// 칸 이름 차례와 상관없는 글 — 지문용
function gsCanon(x) {
  if (Array.isArray(x)) return '[' + x.map(gsCanon).join(',') + ']';
  if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + gsCanon(x[k])).join(',') + '}';
  return JSON.stringify(x === undefined ? null : x);
}
function gsHash(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8) + '-' + str.length.toString(36); }
const gsStr = (x, n) => String(x == null ? '' : x).slice(0, n || GS_MAX.len);
function gsYmdOk(d) { return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d); }
// 한 예배 칸 다듬기 — 계정에서 온 것도 · 올릴 것도 같은 꼴로(모르는 칸 · 긴 글 · 틀린 날짜는 버림)
function gsEntry(e, side) {
  if (!e || typeof e !== 'object' || !gsYmdOk(e.date)) return null;
  const cells = {}; let nk = 0;
  for (const k of Object.keys(e.cells && typeof e.cells === 'object' ? e.cells : {})) {
    if (nk >= GS_MAX.roles) break; const v = e.cells[k]; if (!Array.isArray(v)) continue;
    const n = v.filter(x => typeof x === 'string' && x.trim()).slice(0, GS_MAX.names).map(x => gsStr(x.trim())); if (!n.length) continue;
    cells[gsStr(k, 40)] = n; nk++;
  }
  const o = { date: e.date, relay: e.relay === true, cells };
  if (side === 'sun') { if (!GS_SVC_NAME[e.svc]) return null; o.svc = e.svc; } else o.name = gsStr(e.name, 40);
  return o;
}
function gsRoles(list) { return (Array.isArray(list) ? list : []).filter(r => r && typeof r.k === 'string' && r.k).slice(0, GS_MAX.roles).map(r => ({ k: gsStr(r.k, 40), label: gsStr(r.label || r.k, 40) })); }
// 한 시트를 읽은 것(gsReadOne 결과) → 계정에 둘 문서. n = 예배 칸 수, h = 내용 지문(읽은 때 at 은 빼고)
function gsPack(res, at) {
  const j = (res && res.joined) || {}, body = {
    tabs: ((res && res.tabs) || []).filter(t => t && /^\d{4}-\d{2}$/.test(t.ym)).slice(0, 4).map(t => ({ ym: t.ym, title: gsStr(t.title, 60), ver: gsStr(t.ver, 20) })),
    sun: (j.sun || []).map(e => gsEntry(e, 'sun')).filter(Boolean).slice(0, GS_ENTRY_MAX),
    fri: (j.fri || []).map(e => gsEntry(e, 'fri')).filter(Boolean).slice(0, GS_ENTRY_MAX),
    roles: { sun: gsRoles(j.roles && j.roles.sun), fri: gsRoles(j.roles && j.roles.fri) },
    warn: ((res && res.parts) || []).flatMap(p => (p.warn || []).map(w => gsStr((p.tab ? p.tab + ' — ' : '') + w, 200))).slice(0, 30),
  };
  return Object.assign({ v: GS_DOC_V, at: +at || 0, n: body.sun.length + body.fri.length, h: gsHash(gsCanon(body)) }, body);
}
// 계정에서 온 문서 → { tabs, joined, warn, at, n, h } (모양이 틀리면 null — 화면은 '아직 없음' 으로)
function gsUnpack(d) {
  if (!d || typeof d !== 'object' || d.v !== GS_DOC_V || typeof d.h !== 'string') return null;
  const p = gsPack({ tabs: d.tabs, joined: { sun: d.sun, fri: d.fri, roles: d.roles }, parts: [] }, d.at);
  return { tabs: p.tabs, joined: { sun: p.sun, fri: p.fri, roles: p.roles }, warn: (Array.isArray(d.warn) ? d.warn : []).filter(x => typeof x === 'string').slice(0, 30), at: +d.at || 0, n: p.n, h: d.h };
}
// 달마다 예배 칸 수
function gsPerYm(x) { const o = {}; for (const side of ['sun', 'fri']) for (const e of ((x && (x.joined || x)) || {})[side] || []) { const ym = e.date.slice(0, 7); o[ym] = (o[ym] || 0) + 1; } return o; }
// 올릴까? prev = 계정의 것(gsUnpack), next = gsPack. force = HB 가 '그래도 올리기' 를 눌렀을 때.
// 시트 사본이라 지워져도 시트에는 남지만, 잘못 읽은 한 번이 교역자 화면을 비우지 않게 큰 줄어듦은 사람에게 묻는다(외부 자료로 지우기엔 상한 — CLAUDE.md)
function gsSaveCheck(prev, next, force) {
  if (!next) return { ok: false, why: '' };
  if (prev && prev.h === next.h) return { ok: false, same: true, why: '' };
  if (force) return { ok: true };
  if (!next.n && prev && prev.n) return { ok: false, why: '이번에 읽은 날이 하나도 없어\n계정의 지난 표를 그대로 두었습니다' };
  const a = gsPerYm(prev), b = gsPerYm(next);
  for (const ym of Object.keys(a)) if (b[ym] !== undefined && b[ym] * 2 < a[ym]) return { ok: false, why: `${+ym.slice(5)}월 칸이 ${a[ym]} → ${b[ym]} 으로 절반 넘게 줄어\n계정의 지난 표를 그대로 두었습니다` };
  return { ok: true };
}
// 고른 파일 — { bteam:{id,name}, bserve:{id,name}, at }. id 는 구글 파일 id 꼴만
function gsSrcNorm(d) {
  const o = { at: (d && +d.at) || 0 };
  for (const x of GS_SRC) { const f = d && d[x.k]; if (f && typeof f.id === 'string' && /^[\w-]{1,120}$/.test(f.id)) o[x.k] = { id: f.id, name: gsStr(f.name || x.name, 80) }; }
  return o;
}
// 이 기기 · 계정 중 나중 것 (같으면 이 기기)
function gsSrcPick(local, cloud) { const a = gsSrcNorm(local), b = gsSrcNorm(cloud); return b.at > a.at ? b : a; }
// 다시 읽을 때인가 — 계정 표가 없거나 한 시간 넘었으면
function gsStale(doc, now) { return !doc || !(doc.at > 0) || now - doc.at > GS_STALE_MS; }
/* ---- 화면에 보이기 (1121-G G3 · G3b, HB 11/21) ----
   계정의 표 둘(gsUnpack 꼴 — 또는 joined 만)을 읽어 화면이 그릴 모양으로만 바꾼다. 책(book)은 보지도 고치지도 않는다.
   '부산 주' = 월 ~ 주일, visitSun(날짜) 이 그 주일인 날들 — 금요예배(금) · 성탄 전야(수 · 목)가 그 주일 부산 일정에 붙는다. */
const GS_ORD = ['2', '1', 'LL', '3'];   // 부산은 2부가 본 예배 — 먼저
const GS_NOCOUNT = ['토요모임'];   // 사람이 아니라 할 일(기도회 · 곡연습)이 적히는 줄 — 횟수 · 내 일정에 안 넣음
const gsJ = d => (d && (d.joined || d)) || null;
const gsRk = k => String(k || '').replace(/#\d+$/, '');   // 같은 이름 두 번째 줄('싱어#2')의 뿌리
// 한 주 예배 차례 = 시간 차례(HB 11/23): 날짜 → 같은 날은 금요 칸 먼저 → 주일은 1부 · 2부 · 3부 · 라이프라인 (수 → 금 → 주일). 본 예배(2부) 고르기는 gsMain 이 따로
const GS_TIME = ['1', '2', '3', 'LL'];
function gsSvcOrd(a, b) { return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.side === b.side ? 0 : a.side === 'fri' ? -1 : 1) || GS_TIME.indexOf(a.svc) - GS_TIME.indexOf(b.svc); }
// 한 부산 주의 예배들 — 예배팀 · 예배위원을 예배마다 나란히. [{ id, side, date, svc, name, label, relay, team:{cells}|null, serve:{cells}|null }]
function gsWeek(team, serve, sun) {
  const list = [], at = {};
  for (const [src, d] of [['team', team], ['serve', serve]]) { const j = gsJ(d); if (!j) continue;
    for (const side of ['sun', 'fri']) for (const e of j[side] || []) { if (!e || !e.date || visitSun(e.date) !== sun) continue;
      const id = side + '|' + e.date + '|' + (side === 'sun' ? e.svc : '');
      let x = at[id]; if (!x) { x = at[id] = { id, side, date: e.date, svc: side === 'sun' ? e.svc : '', name: '', relay: false, team: null, serve: null }; list.push(x); }
      x[src] = e.cells || {}; if (e.relay) x.relay = true; if (side === 'fri' && !x.name && e.name) x.name = e.name; } }
  list.sort(gsSvcOrd);
  for (const x of list) x.label = x.side === 'sun' ? (x.date === sun ? '' : gsMd(x.date) + ' ') + GS_SVC_NAME[x.svc] : (x.name || '금요 ' + gsMd(x.date));
  return list;
}
// 처음 고를 예배 — 그 주일 2부, 없으면 그 주일의 중계 아닌 예배, 없으면 맨 앞
function gsMain(wk, sun) { return wk.find(x => x.date === sun && x.svc === '2' && !x.relay) || wk.find(x => x.date === sun && x.side === 'sun' && !x.relay) || wk[0] || null; }
// 카드에 붙일 한 줄: '예배 인도 가람 · 봉독 나래' (그 주일 본 예배 기준). 읽은 것이 없으면 ''
function gsSum(team, serve, sun) {
  const m = gsMain(gsWeek(team, serve, sun), sun); if (!m || m.side !== 'sun') return '';
  const t = m.team || {}, s = m.serve || {}, lead = t['예배인도'], read = s['봉독'] || t['봉독'], out = [];
  if (m.relay) out.push('분당 중계'); if (lead && lead.length) out.push('예배 인도 ' + lead.join(' ')); if (read && read.length) out.push('봉독 ' + read.join(' '));
  return out.join(' · ');
}
// 한 사람의 이름 열쇠(이름 + 다른 이름, 띄어쓰기 없이) — 다른 사람과 같은 열쇠는 뺀다(같은 이름 둘은 억지로 잇지 않음)
function gsKeys(book, pid) {
  const ps = live(book.people), p = ps.find(x => x.id === pid); if (!p) return [];
  const ks = x => [x.name].concat(x.alias || []).map(gsN).filter(Boolean), other = new Set(ps.filter(x => x.id !== pid).flatMap(ks));
  return [...new Set(ks(p))].filter(k => !other.has(k));
}
// 내 일정 — from ~ to 에 시트에서 내 이름이 든 자리. 날마다 [{ date, sun, items:[{ whats:['1부','2부'], roles:['광고'] }] }]
//   '교역자' 줄은 뺀다(부산 일정 줄이 이미 말함) · 토요모임도 뺀다. 같은 역할 묶음의 예배는 한 줄로 모은다
function gsMine(team, serve, keys, from, to) {
  const ks = new Set((keys || []).map(gsN).filter(Boolean)), by = {}; if (!ks.size) return [];
  for (const d of [team, serve]) { const j = gsJ(d); if (!j) continue;
    for (const side of ['sun', 'fri']) { const lab = {}; for (const r of (j.roles || {})[side] || []) lab[r.k] = r.label;
      for (const e of j[side] || []) { if (!e || e.date < from || e.date > to) continue;
        const what = side === 'sun' ? GS_SVC_NAME[e.svc] : (e.name || '금요');
        for (const k of Object.keys(e.cells || {})) { const rk = gsRk(k); if (rk === '교역자' || GS_NOCOUNT.includes(rk)) continue;
          if (!(e.cells[k] || []).some(n => ks.has(gsN(n)))) continue;
          const w = (by[e.date] = by[e.date] || { order: [], roles: {} }), rl = String(lab[k] || rk).replace(/#\d+$/, ''); if (!w.roles[what]) { w.roles[what] = []; w.order.push({ what, side, svc: e.svc || '' }); }
          if (!w.roles[what].includes(rl)) w.roles[what].push(rl); } } } }
  return Object.keys(by).sort().map(date => { const w = by[date], items = [];
    w.order.sort((a, b) => (a.side === b.side ? 0 : a.side === 'fri' ? -1 : 1) || GS_ORD.indexOf(a.svc) - GS_ORD.indexOf(b.svc));
    for (const o of w.order) { const key = w.roles[o.what].join('|'), it = items.find(x => x.key === key); if (it) it.whats.push(o.what); else items.push({ key, whats: [o.what], roles: w.roles[o.what] }); }
    return { date, sun: visitSun(date), items: items.map(x => ({ whats: x.whats, roles: x.roles })) }; });
}
// 한 부산 주의 '사람별' (1123-B B1, HB 11/23) — 예배 순서 판의 두 번째 알약. 그 주 예배팀 · 예배위원에 적힌 분을 이름순으로,
//   한 분이 맡은 것을 한 줄로: [{ name, n, parts:[{ whats:['2부','1부'], roles:['헌금'] }] }]. 같은 역할 묶음의 예배는 모은다(gsMine 과 같은 결).
//   토요모임(할 일이 적히는 줄)은 뺀다 · 예배팀 봉독 = 예배위원 봉독은 한 번 · 이름은 띄어쓰기 없이 같으면 한 분(글자는 처음 본 그대로)
function gsWeekPeople(team, serve, sun) {
  const wk = gsWeek(team, serve, sun), P = {}, labOf = {};
  for (const [src, d] of [['team', team], ['serve', serve]]) { const j = gsJ(d); if (!j) continue;
    for (const side of ['sun', 'fri']) for (const r of (j.roles || {})[side] || []) labOf[src + side + r.k] = String(r.label || r.k).replace(/#\d+$/, ''); }
  wk.forEach((x, wi) => { for (const src of ['team', 'serve']) { const cells = x[src] || {};
    for (const k of Object.keys(cells)) { const rk = gsRk(k); if (GS_NOCOUNT.includes(rk)) continue;
      const rl = labOf[src + x.side + k] || rk;
      for (const n of cells[k] || []) { const nk = gsN(n); if (!nk) continue;
        const p = (P[nk] = P[nk] || { name: n, by: {} }), w = (p.by[wi] = p.by[wi] || []); if (!w.includes(rl)) w.push(rl); } } } });
  return Object.values(P).map(p => { const parts = [];
    for (const wi of Object.keys(p.by).map(Number).sort((a, b) => a - b)) { const key = p.by[wi].join('|'), it = parts.find(y => y.key === key);
      if (it) it.whats.push(wk[wi].label); else parts.push({ key, whats: [wk[wi].label], roles: p.by[wi] }); }
    return { name: p.name, n: Object.keys(p.by).length, parts: parts.map(y => ({ whats: y.whats, roles: y.roles })) }; })
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}
// 사람별 한 줄 글: '어웨이크 · 1부 헌금 / 2부 싱어2, 봉독' — 예배 묶음은 ' / ', 한 예배의 여러 역할은 ', ' (같은 점으로 이으면 어느 예배의 역할인지 헷갈림 — 미리보기에서 봄)
function gsPartsText(parts) { return (parts || []).map(y => y.whats.join(' · ') + ' ' + y.roles.join(', ')).join(' / '); }
// 한 예배를 한 줄 명단으로 (1123-B B2 A, HB 11/23) — 내 일정 카드에 예배마다 한 줄: '예배 인도 한별 · 싱어 나래, 다온 · 봉독 고은결 · 헌금 박새봄'.
//   정해 둔 여덟 갈래만(GS_BRIEF — 칸 이름에 든 글자로 찾음: 싱어1 · 싱어2 는 '싱어' 하나로, '음향 & 중계' 는 '음향'), 교역자 · 토요모임 줄은 뺌. 중계면 '분당 중계' 를 앞에.
//   같은 이름은 한 번(예배팀 봉독 = 예배위원 봉독). 이름 사이는 ', ' · 갈래 사이는 ' · '
const GS_BRIEF = [['예배 인도', /인도/], ['싱어', /^싱어/], ['건반', /건반/], ['음향', /음향|중계/], ['봉독', /봉독/], ['안내', /안내/], ['헌금', /헌금/], ['광고', /광고/]];
//   화면은 역할 · 이름을 다른 모양으로 그린다(1123-B B2b 시안 B1 — 역할 흐리게 · 이름 진하게, '역할 이름 · 역할 이름' 이 한 덩어리로 읽혀서). 글은 시험 · 복사용
function gsBriefParts(x) {
  const o = { relay: !!(x && x.relay), parts: [] }; if (!x) return o; const used = new Set();
  for (const [lab, re] of GS_BRIEF) { const ns = [];
    for (const src of ['team', 'serve']) for (const k of Object.keys(x[src] || {})) { const rk = gsRk(k);
      if (used.has(src + k) || rk === '교역자' || GS_NOCOUNT.includes(rk) || !re.test(rk)) continue; used.add(src + k);
      for (const n of x[src][k] || []) if (gsN(n) && !ns.some(m => gsN(m) === gsN(n))) ns.push(n); }
    if (ns.length) o.parts.push({ role: lab, names: ns }); }
  return o;
}
function gsBrief(x) { const b = gsBriefParts(x); return (b.relay ? ['분당 중계'] : []).concat(b.parts.map(y => y.role + ' ' + y.names.join(', '))).join(' · '); }
// 한 부산 주의 예배마다 한 줄 — [{ id, label, text, relay, parts }] (적힌 것이 없는 예배는 뺌). 차례는 gsWeek 그대로(시간 차례: 수 · 금 → 1부 → 2부 → 3부 → 라이프라인)
function gsWeekBrief(team, serve, sun) { return gsWeek(team, serve, sun).map(x => Object.assign({ id: x.id, label: x.label, text: gsBrief(x) }, gsBriefParts(x))).filter(y => y.text); }
// 예배 순서 판 '예배별' = 한 장 표 (1123-B B2b, HB 11/23 시안 A2) — 열 = 그 주 예배(금요 → 2부 → 1부 → 라이프라인), 줄 = 역할.
//   알약으로 예배를 바꿔 끼우던 것을 없앴다: 아이패드에서 오른쪽 절반이 비고(A) 예배마다 판 높이가 달라 위가 오르내렸다(C).
//   묶음 둘(예배팀 · 예배위원), 줄은 시트의 역할 차례(주일 칸 → 금요에만 있는 칸), 그 주 내내 빈 줄은 숨김.
//   중계 예배는 예배팀 맨 위부터 이어진 빈 줄 수(fold)를 '분당 중계' 한 칸으로 접는다(gsMonthTeam · 시트의 합친 칸과 같은 꼴). 토요모임은 이름이 아닌 할 일(note)
//   { cols:[{ id, label, sub, side, date, relay, main }], groups:[{ name, rows:[{ k, label, note, cells:[[이름]] }], fold:[열마다] }] }
function gsWeekTable(team, serve, sun) {
  const wk = gsWeek(team, serve, sun), m = gsMain(wk, sun), groups = [];
  const cols = wk.map(x => ({ id: x.id, label: x.label, sub: x.side === 'fri' ? gsMd(x.date) + ' 금' : x.date === sun ? '주일' : gsMd(x.date), side: x.side, date: x.date, relay: !!x.relay, main: !!m && x.id === m.id }));
  for (const [src, d, name] of [['team', team, '예배팀'], ['serve', serve, '예배위원']]) { const j = gsJ(d); if (!j) continue;
    const order = [], lab = {};
    for (const side of ['sun', 'fri']) for (const r of (j.roles || {})[side] || []) if (!(r.k in lab)) { lab[r.k] = String(r.label || r.k); order.push(r.k); }
    for (const x of wk) for (const k of Object.keys(x[src] || {})) if (!(k in lab)) { lab[k] = gsRk(k); order.push(k); }
    const rows = order.map(k => ({ k, label: lab[k], note: GS_NOCOUNT.includes(gsRk(k)), cells: wk.map(x => ((x[src] || {})[k] || []).slice()) })).filter(r => r.cells.some(c => c.length));
    if (!rows.length) continue;
    const fold = wk.map((x, i) => { let f = 0; if (src === 'team' && x.relay) while (f < rows.length && !rows[f].note && !rows[f].cells[i].length) f++; return f; });
    groups.push({ name, rows, fold }); }
  return { cols, groups };
}
// 그 사람이 그 부산 주(월 ~ 주일, visitSun)의 부산 일정에 들었나 — 주일에 안 머무는 일정(금요만)도 그 주
function gsInWeek(book, pid, sun) { return !!pid && !!sun && live(book.visits).some(v => visitSun(v.date) === sun && (v.who || []).includes(pid)); }
// 주간 탭 맨 위 띠 (1123-B B2 C) — 그 주 시트 표가 있을 때만. { sun, n: 섬기는 분 수, mine: 내 부산 주 } | null. 모든 교역자 · HB
function gsBand(book, team, serve, sun, pid) {
  if (!sun || !gsWeek(team, serve, sun).length) return null;
  return { sun, n: gsWeekPeople(team, serve, sun).length, mine: gsInWeek(book, pid, sun) };
}
// 내 일정 목록에 붙일 주 (1123-B B2 A) — trip = '부산 준비' 카드의 그 부산 주(카드 아래 명단), week = 내가 안 내려가는 이번 주의 '이번 주 부산' 카드.
//   이번 주가 준비 카드의 주이거나 내가 이번 주 부산 일정에 들었으면 week 는 '' (같은 명단을 두 번 보이지 않음)
function gsMyWeeks(book, pid, today, tripV) {
  const trip = tripV ? visitSun(tripV.date) : '', wk = visitSun(today);
  return { trip, week: wk === trip || gsInWeek(book, pid, wk) ? '' : wk };
}
/* ---- 카톡 글 프리셋 (1123-B B3, HB 결정 D1 · D3 · 11/23) ----
   예배 순서 판의 세 번째 알약. 문장 틀의 {칸} 을 그 주 시트 이름으로 채우고, **빈 칸이 든 줄은 통째로 뺀다**(중계 · 안 적힌 역할).
   칸: {날} = 복사하는 날 기준(오늘 · 내일 · 이번 주일 …, 일주일 밖이면 '11월 29일 주일' — D3) · {날짜} = 언제나 날짜 ·
       {본문} = 그 주 판에 손으로(B3b 에서 Monday) · {교역자} = 그 주 부산 일정에 든 분(책 visits 한 곳) ·
       {예배 역할} = 예배(금요 · 1부 · 2부 · 3부 · LL/라이프라인) + 역할(여덟 갈래 GS_BRIEF 이름 또는 시트 칸 이름) · {금요} 혼자 = 그 예배 이름.
   {날} 은 그 줄에 든 예배의 날 → 없으면 틀에서 처음 나온 예배의 날 → 없으면 그 주일. 모르는 칸(예배 이름이 아닌 것)은 글 그대로 둔다(틀을 고칠 수 있게).
   저장(D1): HB 것 rota/{HB}/kt/hb(전부, HB 만) + kt/share(함께 쓰기 켠 것만 — 팀이 읽음) · 교역자 것 kt/{자기 uid}. 책(b16) · ui · staff 칸에 넣지 않는다.
   한 문서 = { v, items: { id: { n, t, ord, share, del, at } } } — 프리셋 한 줄씩 합쳐 쓰고(set merge), 지우기는 표지(del, 글은 비움). 칸은 언제나 다 적는다(합쳐 쓰기가 옛 글을 남기지 않게). */
const KT_MAX = { list: 40, name: 20, tpl: 1000, txt: 80 };
const KT_BASE = [
  { id: 'b1', n: '봉독위원', t: '{날} 봉독위원은 {2부 봉독} 성도님이십니다.\n\n본문은 {본문}입니다.' },
  { id: 'b2', n: '안내위원', t: '{날} 안내위원 섬겨 주실 분들입니다^^\n1부 {1부 안내}\n2부 {2부 안내}\n라이프라인 {LL 안내}' },
  { id: 'b3', n: '헌금위원', t: '{날} 헌금위원 섬겨 주실 분들입니다.\n1부 {1부 헌금}\n2부 {2부 헌금}\n라이프라인 {LL 헌금}\n수고해 주셔서 감사합니다!' },
  { id: 'b4', n: '예배팀 인도', t: '{날} 예배 인도입니다.\n2부 {2부 예배 인도}\n라이프라인 {LL 예배 인도}\n중계 음향은 {2부 음향} 형제님이 섬겨 주십니다.' },
  { id: 'b5', n: '금요예배', t: '{날} {금요} 예배 인도는 {금요 예배 인도}입니다.\n음향은 {금요 음향}입니다.' }];
const KT_SVC_RE = /^(금요(?:예배)?|[123]부|LL|라이프라인)\s*(.*)$/i;
const KT_DOW = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
// 끼울 칸 단추 — 그 주에 있는 예배 · 적힌 갈래만(없으면 기본 칸만). [{ k:'2부 봉독', g:'2부' }]
//   verses(B3b)가 있으면 Monday 에 본문이 있는 예배마다 '{예배} 본문' 도 (그 예배의 역할 단추 앞)
function ktTokens(team, serve, sun, verses) {
  const out = [{ k: '날', g: '' }, { k: '본문', g: '' }, { k: '교역자', g: '' }];
  for (const x of gsWeek(team, serve, sun)) { const s = ktSvcName(x); if (!s || out.some(y => y.g === s)) continue;
    if (x.side === 'fri') out.push({ k: s, g: s });
    if (verses) { const mv = ktMonVerse(verses, x, sun); if (mv && mv.ko) out.push({ k: s + ' 본문', g: s }); }
    for (const p of gsBriefParts(x).parts) out.push({ k: s + ' ' + p.role, g: s }); }
  return out;
}
function ktSvcName(x) { return !x ? '' : x.side === 'fri' ? '금요' : x.svc === 'LL' ? 'LL' : GS_SVC_NAME[x.svc] || ''; }
// 칸 이름 → 그 주의 예배 하나. '금요' 는 그 주 금요(성탄 전야처럼 둘이면 앞의 것)
function ktSvc(wk, s, sun) {
  const k = gsN(s).toUpperCase();
  if (/^금요/.test(k)) return wk.find(x => x.side === 'fri') || null;
  const svc = k === 'LL' || k === '라이프라인' ? 'LL' : /^[123]부$/.test(k) ? k[0] : ''; if (!svc) return null;
  return wk.find(x => x.side === 'sun' && x.svc === svc && x.date === sun) || wk.find(x => x.side === 'sun' && x.svc === svc) || null;
}
// 그 예배 그 역할 이름들 — 여덟 갈래 이름이면 그 갈래(싱어 = 싱어1 · 싱어2, 음향 = 음향 & 중계), 아니면 시트 칸 이름이 같은 것. 예배팀 · 예배위원 같은 이름은 한 번
function ktNames(x, role) {
  if (!x) return []; const r = gsN(role), b = GS_BRIEF.find(([lab]) => gsN(lab) === r), ns = [];
  for (const src of ['team', 'serve']) for (const k of Object.keys(x[src] || {})) { const rk = gsRk(k);
    if (GS_NOCOUNT.includes(rk)) continue;
    if (!(b ? rk !== '교역자' && b[1].test(rk) : gsN(rk) === r)) continue;
    for (const n of x[src][k] || []) if (gsN(n) && !ns.some(m => gsN(m) === gsN(n))) ns.push(n); }
  return ns;
}
// {날} — 복사하는 날(today) 기준. rel=false 면 언제나 날짜
function ktDay(date, today, rel) {
  if (!gsYmdOk(date)) return ''; const dw = KT_DOW[new Date(date + 'T00:00:00Z').getUTCDay()];
  if (rel && gsYmdOk(today)) { const n = Math.round((Date.parse(date) - Date.parse(today)) / 864e5);
    if (n === 0) return '오늘'; if (n === 1) return '내일'; if (n >= 2 && n <= 6) return '이번 ' + dw; }
  return +date.slice(5, 7) + '월 ' + +date.slice(8, 10) + '일 ' + dw;
}
// 칸 하나 풀기 → { known, v, x(예배) }
function ktTok(raw, wk, c) {
  const k = String(raw || '').trim();
  if (k === '본문') { const t = String(c.txt || '').trim(); return t ? { known: true, v: t, vs: 'hand' } : { known: true, v: null, vs: 'mon' }; }   // 손으로 적은 것이 이김(B3b)
  if (k === '교역자') return { known: true, v: (c.staff || []).filter(Boolean).join(', ') };
  if (k === '날' || k === '날짜') return { known: true, v: null, day: k };
  const m = KT_SVC_RE.exec(k); if (!m) return { known: false };
  const x = ktSvc(wk, m[1], c.sun), role = m[2].trim();
  if (gsN(role) === '본문') {   // {2부 본문} · {LL 본문} · {금요 본문} — 그 예배의 Monday 본문(시트 표가 없어도)
    const s = gsN(m[1]).toUpperCase(), y = x || (/^금요/.test(s) ? { side: 'fri', svc: '', date: gsYmdOk(c.sun) ? addDays(c.sun, -2) : '' } : { side: 'sun', svc: s === 'LL' || s === '라이프라인' ? 'LL' : s[0], date: c.sun });
    const mv = ktMonVerse(c.verses, y, c.sun); return { known: true, x: x || null, v: mv ? mv.ko : '', mv: mv, vx: y }; }
  if (!x) return { known: true, v: '' };
  return { known: true, x, v: role ? ktNames(x, role).join(', ') : (x.side === 'fri' ? x.label : ktSvcName(x)) };
}
// 틀 채우기 — c = { team, serve, sun, today, txt, staff:[이름], verses: Monday 본문 목록(B3b) }. → { text, drop: 뺀 줄 수, unknown:[모르는 칸], verse:[{ label, hand, ko, raw, n }] 쓴 본문(판 안내용) }
function ktFill(tpl, c) {
  c = c || {}; const wk = gsWeek(c.team, c.serve, c.sun), re = /\{([^{}\n]{1,30})\}/g, unknown = [];
  const src = String(tpl || '').slice(0, KT_MAX.tpl).replace(/\r\n?/g, '\n');
  let first = null; for (const mm of src.matchAll(re)) { const r = ktTok(mm[1], wk, c); if (r.x) { first = r.x; break; } }
  let drop = 0; const out = [], verse = [];
  const vput = (x, mv, hand) => { const label = hand ? '' : x ? (x.side === 'fri' ? (x.label || x.name || '금요') : ktSvcName(x) || '') : '2부';
    if (!verse.some(y => y.label === label && y.hand === hand)) verse.push({ label, hand, ko: hand || (mv ? mv.ko : ''), raw: mv ? mv.raw : '', n: mv ? mv.n : '' }); };
  for (const line of src.split('\n')) {
    let lx = null, empty = false; const toks = [...line.matchAll(re)].map(mm => ktTok(mm[1], wk, c));
    for (const r of toks) if (r.x) { lx = r.x; break; }
    let i = 0; const s = line.replace(re, (all, k) => { const r = toks[i++];
      if (!r.known) { if (!unknown.includes(k.trim())) unknown.push(k.trim()); return all; }
      let v = r.v;
      if (r.day) v = ktDay((lx || first || { date: c.sun }).date, c.today, r.day === '날');
      else if (r.vs === 'hand') vput(null, null, v);
      else if (r.vs === 'mon') { const x = lx || first || null, mv = ktMonVerse(c.verses, x, c.sun); v = mv ? mv.ko : ''; vput(x, mv, ''); }   // 그 줄 예배 → 틀의 첫 예배 → 그 주일 2부
      else if (r.vx) vput(r.vx, r.mv, '');
      if (!v) empty = true; return v || ''; });
    if (empty) { drop++; continue; } out.push(s);
  }
  return { text: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), drop, unknown, verse };
}
// 한 줄 다듬기 — 계정에서 온 것도 · 올릴 것도 같은 꼴. 칸은 언제나 다 적는다(지우기 표지는 글을 비움)
function ktItem(o, at) {
  if (!o || typeof o !== 'object') return null; const del = o.del === true;
  return { n: del ? '' : gsStr(String(o.n || '').trim(), KT_MAX.name).trim(), t: del ? '' : gsStr(o.t, KT_MAX.tpl), ord: Number.isFinite(+o.ord) ? +o.ord : 0, share: !del && o.share === true, del, at: +(at !== undefined ? at : o.at) || 0 };
}
function ktIdOk(id) { return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id); }
// 계정 문서 → { id: item } (모르는 칸 · 틀린 id 버림, 많으면 앞의 것만)
function ktDoc(d) {
  const o = {}, it = d && typeof d === 'object' && d.items && typeof d.items === 'object' ? d.items : {};
  for (const id of Object.keys(it).slice(0, KT_MAX.list * 3)) { if (!ktIdOk(id)) continue; const x = ktItem(it[id]); if (x) o[id] = x; }
  return o;
}
// 보이는 목록 — base(기본 다섯, '함께 쓰기' 처음 켬) 위에 계정 줄을 덮고(지우기 표지는 숨김), mine 을 뒤에. [{ id, n, t, share, own, base }]
//   HB: ktList(hbDoc, null, true) · 교역자: ktList(shareDoc, myDoc, false) — 교역자는 HB 것을 못 고친다(own=false)
function ktList(main, mine, hb) {
  const A = ktDoc(main), B = ktDoc(mine), out = [], seen = new Set();
  KT_BASE.forEach((b, i) => { const x = A[b.id]; seen.add(b.id); if (x && x.del) return;
    out.push(Object.assign({ id: b.id, base: true, own: !!hb }, x ? { n: x.n || b.n, t: x.t, share: x.share, ord: x.ord } : { n: b.n, t: b.t, share: true, ord: i - KT_BASE.length })); });
  for (const id of Object.keys(A)) { const x = A[id]; if (seen.has(id) || x.del || !x.n) continue; out.push({ id, base: false, own: !!hb, n: x.n, t: x.t, share: x.share, ord: x.ord }); }
  if (!hb) for (const id of Object.keys(B)) { const x = B[id]; if (A[id] || KT_BASE.some(b => b.id === id) || x.del || !x.n) continue; out.push({ id, base: false, own: true, n: x.n, t: x.t, share: false, ord: x.ord + 1e6 }); }
  return out.sort((a, b) => a.ord - b.ord).slice(0, KT_MAX.list).map(({ ord, ...y }) => y);
}
// 쓸 것 — HB: { hb: 줄, share: 줄 } (함께 쓰기를 끄거나 지우면 share 쪽은 지우기 표지) · 교역자: { mine: 줄 }. 바깥은 items.{id} 로 합쳐 쓴다
function ktPut(id, o, hb, at) {
  if (!ktIdOk(id)) return null; const x = ktItem(o, at); if (!x) return null;
  if (!hb) return { mine: Object.assign({}, x, { share: false }) };
  return { hb: x, share: x.share && !x.del ? x : ktItem({ del: true, ord: x.ord }, x.at) };
}
// 새 프리셋 차례 — 지금 목록 맨 뒤
function ktNextOrd(main, mine) { const xs = Object.values(ktDoc(main)).concat(Object.values(ktDoc(mine))).map(x => x.ord).concat(0); return Math.max(...xs) + 1; }
// 그 주 부산 일정에 든 분 — {교역자} 칸 (부산 교역자는 visits 한 곳 — CLAUDE.md)
function ktStaff(book, sun) {
  const pm = {}; for (const p of live(book.people || [])) pm[p.id] = p.name; const out = [];
  for (const v of live(book.visits || [])) { if (visitSun(v.date) !== sun) continue; for (const id of v.who || []) if (pm[id] && !out.includes(pm[id])) out.push(pm[id]); }
  return out;
}
/* ---- 설교 본문 — Monday 'Bible verse for worship service' (1123-B B3b, HB 결정 D2 · 11/23) ----
   서버 monday 의 /verses 가 그 부산 주(월 ~ 주일)의 [{ d: 날짜, k: sun · ll · fri · wed · tue · sp, bu: 주일 오전이 부마다 다를 때 ['1','3'], n: 아이템 이름, v: 본문 글 }] 를 읽어 준다.
   본문 글은 'Matt. 9:9-13' · '2 Samuel 3:1-39 (whole chapter)' · '[약1:12-27]' · '마가복음 5장 25-41절' 처럼 영어 · 한글 · 줄임말이 섞여 있다(실제 보드 11/24).
   → verseKo 가 66권 표(BV_BOOKS)로 '마태복음 9:9-13' 꼴로 바꾼다. **AI 에 맡기지 않는다** — 표에 없는 이름 · 모양이면 ''(그 줄은 빠지고 판에 원문을 보여 손으로 적게).
   {본문} = 손으로 적은 본문이 있으면 그것(이김) → 없으면 그 줄의 예배(없으면 틀에서 처음 나온 예배, 그것도 없으면 그 주일 2부)의 Monday 본문.
   {2부 본문} · {LL 본문} · {금요 본문} = 그 예배의 Monday 본문(손으로 적은 칸은 {본문} 만 채운다). 결과는 책에 넣지 않는다(이 기기 사본만). */
// [한글 이름, 한글 줄임, 영어 이름들(번호 없이 · 소문자), 번호(같은 영어 이름을 1 · 2 · 3 으로 가르는 책)]
const BV_BOOKS = [
  ['창세기', '창', 'genesis gen gn'], ['출애굽기', '출', 'exodus exod exo ex'], ['레위기', '레', 'leviticus lev lv'], ['민수기', '민', 'numbers number num nm'],
  ['신명기', '신', 'deuteronomy deut deu dt'], ['여호수아', '수', 'joshua josh jos'], ['사사기', '삿', 'judges judg jdg'], ['룻기', '룻', 'ruth rut'],
  ['사무엘상', '삼상', 'samuel sam', 1], ['사무엘하', '삼하', 'samuel sam', 2], ['열왕기상', '왕상', 'kings kgs king', 1], ['열왕기하', '왕하', 'kings kgs king', 2],
  ['역대상', '대상', 'chronicles chron chr', 1], ['역대하', '대하', 'chronicles chron chr', 2], ['에스라', '스', 'ezra ezr'], ['느헤미야', '느', 'nehemiah neh'],
  ['에스더', '에', 'esther esth est'], ['욥기', '욥', 'job jb'], ['시편', '시', 'psalms psalm psa pss ps'], ['잠언', '잠', 'proverbs proverb prov prv'],
  ['전도서', '전', 'ecclesiastes eccles eccl ecc qoh'], ['아가', '아', 'song_of_solomon song_of_songs songs song sos'], ['이사야', '사', 'isaiah isa'], ['예레미야', '렘', 'jeremiah jer'],
  ['예레미야애가', '애', 'lamentations lam'], ['에스겔', '겔', 'ezekiel ezek eze ezk'], ['다니엘', '단', 'daniel dan dn'], ['호세아', '호', 'hosea hos'],
  ['요엘', '욜', 'joel jl'], ['아모스', '암', 'amos'], ['오바댜', '옵', 'obadiah obad ob'], ['요나', '욘', 'jonah jon jnh'],
  ['미가', '미', 'micah mic'], ['나훔', '나', 'nahum nah'], ['하박국', '합', 'habakkuk hab'], ['스바냐', '습', 'zephaniah zeph zep'],
  ['학개', '학', 'haggai hag'], ['스가랴', '슥', 'zechariah zech zec'], ['말라기', '말', 'malachi mal'],
  ['마태복음', '마', 'matthew matt mat mt'], ['마가복음', '막', 'mark mrk mk'], ['누가복음', '눅', 'luke luk lk'], ['요한복음', '요', 'john jhn jn joh'],
  ['사도행전', '행', 'acts act'], ['로마서', '롬', 'romans roman rom rm'], ['고린도전서', '고전', 'corinthians cor', 1], ['고린도후서', '고후', 'corinthians cor', 2],
  ['갈라디아서', '갈', 'galatians gal'], ['에베소서', '엡', 'ephesians ephes eph'], ['빌립보서', '빌', 'philippians phil php'], ['골로새서', '골', 'colossians col'],
  ['데살로니가전서', '살전', 'thessalonians thess thes', 1], ['데살로니가후서', '살후', 'thessalonians thess thes', 2], ['디모데전서', '딤전', 'timothy tim', 1], ['디모데후서', '딤후', 'timothy tim', 2],
  ['디도서', '딛', 'titus tit'], ['빌레몬서', '몬', 'philemon philem phlm phm'], ['히브리서', '히', 'hebrews hebrew heb'], ['야고보서', '약', 'james jas jam'],
  ['베드로전서', '벧전', 'peter pet pt', 1], ['베드로후서', '벧후', 'peter pet pt', 2], ['요한일서', '요일', 'john jhn jn joh', 1], ['요한이서', '요이', 'john jhn jn joh', 2],
  ['요한삼서', '요삼', 'john jhn jn joh', 3], ['유다서', '유', 'jude jud'], ['요한계시록', '계', 'revelation revelations rev']];
// 한글로 더 받는 이름 (줄임 · '서' 빠진 꼴) → 한글 이름
const BV_KO_MORE = { 출애굽: '출애굽기', 레위: '레위기', 민수: '민수기', 룻: '룻기', 욥: '욥기', 잠언서: '잠언', 전도: '전도서', 아가서: '아가', 이사야서: '이사야', 예레미야서: '예레미야', 애가: '예레미야애가',
  에스겔서: '에스겔', 다니엘서: '다니엘', 호세아서: '호세아', 요엘서: '요엘', 아모스서: '아모스', 오바댜서: '오바댜', 요나서: '요나', 미가서: '미가', 나훔서: '나훔', 하박국서: '하박국', 스바냐서: '스바냐',
  학개서: '학개', 스가랴서: '스가랴', 말라기서: '말라기', 마태: '마태복음', 마가: '마가복음', 누가: '누가복음', 요한: '요한복음', 행전: '사도행전', 로마: '로마서', 갈라디아: '갈라디아서', 에베소: '에베소서',
  빌립보: '빌립보서', 골로새: '골로새서', 디도: '디도서', 빌레몬: '빌레몬서', 히브리: '히브리서', 야고보: '야고보서', 유다: '유다서', 계시록: '요한계시록' };
const BV = (() => {
  const ko = {}, en = {}, num = { '1': 1, '2': 2, '3': 3, i: 1, ii: 2, iii: 3, first: 1, second: 2, third: 3, '1st': 1, '2nd': 2, '3rd': 3 };
  for (const [k, a, e, n] of BV_BOOKS) { ko[k] = k; ko[a] = k; for (const w of e.split(' ')) { const key = w.replace(/_/g, ' '); (en[key] = en[key] || {})[n || 0] = k; } }
  Object.assign(ko, BV_KO_MORE);
  const alt = xs => xs.sort((a, b) => b.length - a.length).map(x => x.replace(/ /g, '\\s+')).join('|');
  // 영어: (번호) 이름(.) — 앞뒤가 글자가 아니고 뒤에 장 숫자가 와야 책 이름
  //   번호: 1 · 2 · 3(1st …)은 붙여도 되고, I · II · First … 는 띄어야 한다('Isa 6' 을 'I Sa 6' 으로 읽지 않게)
  const EN = new RegExp('(?<![A-Za-z0-9])(?:([123])(?:st|nd|rd)?\\s*|(iii|ii|i|first|second|third)\\s+)?(' + alt(Object.keys(en)) + ')(?![A-Za-z])\\.?\\s*(?=\\d)', 'gi');
  const KO = new RegExp('(?<![가-힣])(' + alt(Object.keys(ko)) + ')(?![가-힣])\\.?\\s*(?=\\d)', 'g');
  return { ko, en, num, EN, KO };
})();
// s 의 i 자리부터 처음 나오는 책 → { at, end, book } | null (영어 번호 책인데 번호가 없거나 맞지 않으면 책이 아님)
function bvBook(s, i) {
  let best = null;
  for (const re of [BV.EN, BV.KO]) { re.lastIndex = i; let m;
    while ((m = re.exec(s))) { let book = '';
      if (re === BV.KO) book = BV.ko[m[1]];
      else { const e = BV.en[m[3].toLowerCase().replace(/\s+/g, ' ')] || {}, p = m[1] || m[2], n = p ? BV.num[p.toLowerCase()] : 0;
        book = e[n] || e[0] || ''; }   // 번호 책(사무엘 …)에 번호가 없으면 책이 아님 · 번호 없는 책 앞의 숫자는 무시
      if (book) { if (!best || m.index < best.at) best = { at: m.index, end: re.lastIndex, book }; break; } } }
  return best;
}
// 장 · 절 하나 — '9:9-13' · '5장 25-41절' · '27편' · '2:15-3:9' · '10-12'(장 여럿)
const BV_SPEC = /(\d{1,3})\s*(?:(?:장|편)\s*(?:(\d{1,3})\s*절?)?|[:.]\s*(\d{1,3}))?(?:\s*-\s*(\d{1,3})(?:\s*(?:[:.]|장)\s*(\d{1,3}))?\s*(?:절|장|편)?)?/y;
function bvSpec(s, i) {
  BV_SPEC.lastIndex = i; const m = BV_SPEC.exec(s); if (!m) return null;
  const ch = +m[1], va = m[2] || m[3] ? +(m[2] || m[3]) : 0, e1 = m[4] ? +m[4] : 0, e2 = m[5] ? +m[5] : 0;
  if (!ch || ch > 150 || /^\s*-\s*\d/.test(s.slice(BV_SPEC.lastIndex, BV_SPEC.lastIndex + 4))) return null;   // '10-12-11-1' 처럼 읽는 길이 둘이면 모름
  return { end: BV_SPEC.lastIndex, ch, va, e1, e2 };
}
// 영어 · 한글 · 줄임말이 섞인 본문 글 → '마태복음 9:9-13' (여럿은 ', ' · 같은 책은 이름 한 번). 책을 하나도 못 찾으면 ''
function verseKo(raw) {
  const s = String(raw == null ? '' : raw).slice(0, 400).replace(/[‐-―−~～]/g, '-').replace(/[：]/g, ':').replace(/\s+/g, ' ')
    .replace(/([가-힣])\s+(전서|후서|일서|이서|삼서)/g, '$1$2').replace(/(사무엘|열왕기|역대)\s+(상|하)(?![가-힣])/g, '$1$2');
  const out = []; let i = 0, last = '';
  for (let b = bvBook(s, 0); b; b = bvBook(s, i)) {
    let j = b.end, vmode = false, sep = ''; const parts = [], chOnly = b.book === '시편' ? '편' : '장';
    for (;;) { const sp = bvSpec(s, j); if (!sp) break;
      if (sep === ',' && vmode && !sp.va && !sp.e2) parts.push(sp.ch + (sp.e1 ? '-' + sp.e1 : ''));   // 11:1,2,8-10 — 같은 장의 절
      else { parts.push(sp.va ? sp.ch + ':' + sp.va + (sp.e2 ? '-' + sp.e1 + ':' + sp.e2 : sp.e1 ? '-' + sp.e1 : '') : sp.ch + (sp.e1 ? '-' + sp.e1 : '') + chOnly); vmode = !!sp.va; }
      j = sp.end;
      const re = /(?:\s*\([^()]{0,40}\))?\s*([,;/&])\s*/y; re.lastIndex = j; const m = re.exec(s); if (!m || !/\d/.test(s[re.lastIndex] || '')) break;   // '(whole chapter); 11:1-28' — 괄호 덧말은 건너뜀
      const nb = bvBook(s, re.lastIndex); if (nb && nb.at === re.lastIndex) break;   // '; 1 John 3:1' — 다음 책
      sep = m[1]; j = re.lastIndex; }
    if (parts.length) { out.push((b.book === last ? '' : b.book + ' ') + parts.join(', ')); last = b.book; }
    i = Math.max(j, b.end);
  }
  const t = out.join(', '); return t.length > 160 ? '' : t;
}
// 그 예배(x — gsWeek 한 줄 또는 { side, svc, date })의 Monday 본문 → { ko, raw, n } | null.  x 가 없으면 그 주일 2부
function ktMonVerse(list, x, sun) {
  const L = Array.isArray(list) ? list.filter(v => v && typeof v.d === 'string' && typeof v.v === 'string') : [];
  const side = x ? x.side : 'sun', svc = x ? x.svc : '2', date = x ? x.date : sun; let hit = null;
  if (side === 'fri') hit = L.find(v => v.k === 'fri' && v.d === date) || L.find(v => v.k === 'fri' && visitSun(v.d) === sun);
  else if (svc === 'LL') hit = L.find(v => v.k === 'll' && v.d === date);
  else hit = L.find(v => v.k === 'sun' && v.d === date && (v.bu || []).includes(svc)) || L.find(v => v.k === 'sun' && v.d === date && !(v.bu || []).length)
    || L.find(v => v.k === 'sp' && v.d === date);
  return hit ? { ko: verseKo(hit.v), raw: hit.v, n: String(hit.n || '') } : null;
}
// 서버 /verses 답 다듬기 — 모르는 갈래 · 틀린 날짜 버림, 글은 자름(이 기기 사본도 같은 꼴)
const KT_VK = ['sun', 'll', 'fri', 'wed', 'tue', 'sp'];
function ktVerses(list) {
  return (Array.isArray(list) ? list : []).slice(0, 50).filter(v => v && gsYmdOk(v.d) && KT_VK.includes(v.k) && typeof v.v === 'string' && v.v.trim())
    .map(v => ({ d: v.d, k: v.k, bu: (Array.isArray(v.bu) ? v.bu : []).filter(b => typeof b === 'string' && /^[1-3]$/.test(b)), n: String(v.n || '').slice(0, 60), v: v.v.slice(0, 300) }));
}
// 본문 칸 아래 안내 — verse = 손으로 적은 본문을 **빼고** 채운 ktFill 의 verse(Monday 가 무엇을 줄지) · st = 읽기 상태('' 읽음 · busy · nokey · old · err) · hand = 본문 칸에 적었나
function ktVerseNote(verse, st, hb, hand) {
  const mon = (verse || []).filter(v => !v.hand), H = hand ? '손으로 적은 본문을 씁니다' : '';
  if (st === 'busy' && !mon.some(v => v.raw)) return H || 'Monday 에서 본문을 읽는 중…';
  if (st === 'nokey') return H || (hb ? 'Monday 연결이 없어 본문을 못 가져왔습니다 · 광고 판에서 연결할 수 있습니다' : 'Monday 본문을 못 가져왔습니다 · 본문 칸에 적어 주세요');
  if (st === 'old') return H || 'Monday 본문 가져오기는 서버를 다시 올린 뒤에 됩니다 · 그 전에는 본문 칸에 적어 주세요';
  const lab = v => (v.label ? v.label + ' ' : '');
  const got = mon.filter(v => v.ko), bad = mon.filter(v => !v.ko && v.raw), none = mon.filter(v => !v.raw);
  const out = [];
  if (H) out.push(H);
  if (got.length) out.push((H ? '비우면 Monday 본문 — ' : 'Monday 본문 — ') + got.map(v => lab(v) + v.ko).join(' · '));
  if (bad.length) out.push('Monday 본문을 한글로 바꾸지 못했습니다 — ' + bad.map(v => lab(v) + '\'' + v.raw.replace(/\s+/g, ' ').slice(0, 40) + '\'').join(' · ') + ' · 본문 칸에 적어 주세요');
  if (none.length && st !== 'busy') out.push((st === 'err' ? 'Monday 를 읽지 못했습니다' : 'Monday 에 이 주 본문이 아직 없습니다') + (none.some(v => v.label) ? ' (' + none.map(v => v.label).filter(Boolean).join(' · ') + ')' : ''));
  return out.join('\n');
}
/* ---- 연락처 — 이름을 눌러 전화 · 문자 (1123-T, HB 11/23) ----
   HB 가 넣은 연락처 파일(.vcf)을 부산 시트 이름 · 사람 탭 이름과 맞춰 **이름 · 번호만** 계정 rota/{HB}/gs/phones 에(파일 내용은 두지 않음).
   읽는 사람은 구글 자료 표와 같다 — HB 쓰기 · 팀 교역자 읽기(규칙 gs/{k}). 셀 inside 가 맞춘 셀원 번호(cellbook 의 phones)도 같은 이름이면 쓴다(읽기만).
   vCard 읽기는 셀 inside 의 parseVcf 와 같은 규칙(자모로 풀린 한글 NFC · 안드로이드 QUOTED-PRINTABLE · 접힌 줄). */
const PH_MAX = 800, PH_V = 1;
const PH_TITLES = ['목사님', '목사', '전도사님', '전도사', '사모님', '사모', '장로님', '장로', '권사님', '권사', '집사님', '집사', '형제님', '형제', '자매님', '자매', '선생님', '성도님', '성도', '청년', '셀리더', '리더', '간사', '님'];
const PH_TITLE_RE = new RegExp('\\s*(?:' + PH_TITLES.join('|') + ')$');
function phNorm(s) { let d = String(s || '').replace(/[^\d+]/g, ''); if (d.startsWith('+82')) d = '0' + d.slice(3).replace(/^0/, ''); return d.replace(/\D/g, ''); }
function phFmt(s) {
  const d = phNorm(s);
  if (/^01\d{8,9}$/.test(d)) return d.length === 10 ? d.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : d.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  if (/^02\d{7,8}$/.test(d)) return d.length === 9 ? d.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3') : d.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  if (/^0\d{9,10}$/.test(d)) return d.length === 10 ? d.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : d.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  return String(s || '').trim();
}
function phQp(v) {
  const bytes = [];
  for (let i = 0; i < v.length; i++) { if (v[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(v.slice(i + 1, i + 3))) { bytes.push(parseInt(v.slice(i + 1, i + 3), 16)); i += 2; } else for (const b of new TextEncoder().encode(v[i])) bytes.push(b); }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes)); } catch (_) { return v; }
}
// .vcf 글 → [{ name, tels:['010-…'] }] (번호 없는 사람은 버림)
function phParseVcf(text) {
  const src = String(text || '').normalize('NFC').replace(/\r\n?/g, '\n').split('\n'), lines = [];
  for (const l of src) { const prev = lines[lines.length - 1];
    if (prev != null && /^[ \t]/.test(l)) lines[lines.length - 1] = prev + l.slice(1);
    else if (prev != null && /ENCODING=QUOTED-PRINTABLE/i.test(prev.split(':')[0]) && /=$/.test(prev)) lines[lines.length - 1] = prev.slice(0, -1) + l;
    else lines.push(l); }
  const out = []; let cur = null;
  const val = l => { const i = l.indexOf(':'); let v = l.slice(i + 1); if (/ENCODING=QUOTED-PRINTABLE/i.test(l.slice(0, i))) v = phQp(v); return v.replace(/\\,/g, ',').replace(/\;/g, ';').trim().normalize('NFC'); };
  for (const l of lines) { const key = l.split(':')[0].toUpperCase(), name = key.split(';')[0].replace(/^ITEM\d+\./, '');
    if (name === 'BEGIN' && /VCARD/i.test(l)) cur = { name: '', n: '', n2: '', tels: [] };
    else if (name === 'END' && cur) { const nm = cur.name || cur.n; if (nm && cur.tels.length) out.push(Object.assign({ name: nm, tels: [...new Set(cur.tels)] }, cur.n ? { n: cur.n } : {}, cur.n2 && cur.n2 !== cur.n ? { n2: cur.n2 } : {})); cur = null; }
    else if (cur && name === 'FN') cur.name = val(l);
    else if (cur && name === 'N') { const p = val(l).split(';'); cur.n = ((p[0] || '') + (p[1] || '')).trim(); cur.n2 = ((p[1] || '') + (p[0] || '')).trim(); }
    else if (cur && name === 'TEL') { const t = phFmt(val(l)); if (phNorm(t).length >= 8) cur.tels.push(t); } }
  return out;
}
// 맞출 열쇠 — 셀 inside 의 normName 과 같은 결(HB 11/23 사진: 이름이 같거나 메모가 덧붙었을 뿐인데 24분을 못 찾음):
//   괄호 속 글 · 기호를 걷고, 끝의 직분(띄었든 붙었든 '집사님' · '권사' …)을 두 번까지 떼고, 띄어쓰기 없이 · 작은 글자로.
//   sheet = 시트 쪽 이름 — 시트가 같은 이름을 가르려 붙인 끝 글자('김미선A' · '김미선2')도 뗀다(연락처에는 그 글자가 없다)
function phKey(name, sheet) {
  let t = String(name || '').normalize('NFC').replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/[^\p{L}\p{N}]/gu, ' ').trim();
  t = t.replace(PH_TITLE_RE, '').trim().replace(PH_TITLE_RE, '').trim();
  if (sheet) t = t.replace(/([가-힣])\s*[A-Za-z0-9]{1,2}$/, '$1');
  return t.replace(/\s+/g, '').toLowerCase();
}
// 연락처 하나의 열쇠들 — 통째(k) · 낱말마다(w) · 성 · 이름이 바뀐 꼴(alt: N 칸 뒤집기 · '하나 김')
//   HB 11/23: 연락처마다 성 · 이름 칸이 제각각 — ① 성 한 글자 + 이름 두 글자(N 칸 '김;미선') ② 거꾸로 넣은 것('미선;김') ③ 성이나 이름 칸 하나에 세 글자를 통째로('김미선;' · ';김미선')
//   → 표시 이름(FN)만 보지 말고 N 칸의 성+이름 · 이름+성을 모두 열쇠로. 표시 이름이 '미선 김' 처럼 뒤집혔거나, '미선김' 처럼 끝 글자가 성인 것도(셀 inside swapKeys)
function phPrep(c) {
  const names = [c.name, c.n].filter(Boolean), k = phKey(c.name), alt = new Set(), w = new Set(), rot = new Set();   // rot = 끝 글자를 앞으로 — 꼭 같을 때만 씀(비슷한 것 찾기에 넣으면 엉뚱한 후보가 늘어남)
  for (const nm of names) { const raw = String(nm).normalize('NFC');
    raw.replace(/\([^)]*\)|\[[^\]]*\]/g, ' ').split(/[^\p{L}\p{N}]+/u).map(x => phKey(x)).filter(Boolean).forEach(x => w.add(x));
    alt.add(phKey(raw)); const ps = raw.trim().split(/\s+/); if (ps.length === 2) alt.add(phKey(ps[1] + ps[0]));
    const one = phKey(raw); if (/^[가-힣]{3,4}$/.test(one)) rot.add(one.slice(-1) + one.slice(0, -1)); }
  if (c.n2) alt.add(phKey(c.n2));
  alt.delete(k); alt.delete(''); for (const x of [k, ...alt]) rot.delete(x); return { k, w: [...w], alt: [...alt], rot: [...rot] };
}
// 맞출 이름들 — 부산 시트 두 표의 이름(할 일 줄 · 토요모임 빼고) + 사람 탭(교역자 · 성도 인도자). 처음 본 글자 그대로, 열쇠로 한 번씩
//   more = 다른 자료의 이름 목록들([[이름], …]) — 앞으로 판교 예배위원 · 조명팀 · 사진팀 · 예배팀 등을 불러오면 그 이름을 여기 더해 **같은 맞추기 · 고르기 · 저장**을 탄다(HB 11/23 — ROADMAP 1123-T '다음 자료')
function phNames(team, serve, book, more) {
  const out = [], seen = new Set(), add = n => { const k = gsN(n); if (k && !seen.has(k)) { seen.add(k); out.push(String(n).trim()); } };
  for (const list of more || []) for (const n of list || []) if (typeof n === 'string') add(n);
  for (const d of [team, serve]) { const j = gsJ(d); if (!j) continue;
    for (const side of ['sun', 'fri']) for (const e of j[side] || []) for (const k of Object.keys(e.cells || {})) if (!GS_NOCOUNT.includes(gsRk(k))) (e.cells[k] || []).forEach(add); }
  for (const p of live((book && book.people) || [])) if (p.kind !== 'other') add(p.name);
  return out;
}
// 이름들 ↔ 연락처 (셀 inside autoFill 과 같은 결 · 번호가 하나로 모일 때만 넣는다)
//   ① 열쇠가 꼭 같은 연락처(성 · 이름 바뀐 꼴 포함) → 번호가 하나면 넣음(how 'same'), 여럿이면 multi(동명이인 · 집 · 휴대폰)
//   ② 없으면 연락처 이름 속에 그 이름이 통째로 든 것('조윤정 부산청년' · '하나엄마 김하나' — 세 글자 넘으면 이어진 글 속, 두 글자면 낱말 하나로) → 번호가 하나면 넣음(how 'near', 화면에 연락처 이름을 보여 확인), 여럿이면 multi
//   시트에서 다른 이름(김미선A · 김미선B)이 같은 열쇠가 되면 누구 번호인지 몰라 둘 다 multi.
//   → { hit:{ 시트이름열쇠(gsN):{ n, p, src, how } }, multi:[이름], miss:[이름] }
// 연락처 목록을 한 번 다듬어 둔다(5천 개 넘는 파일 — 고르기 · 찾기마다 다시 하지 않게). [{ c, k, w, alt, tels: Map(숫자 → '010-…') }]
function phPrepAll(contacts) {
  if (contacts && contacts.prepped) return contacts;
  const cs = (contacts || []).map(c => Object.assign({ c, tels: new Map() }, phPrep(c)));
  for (const x of cs) for (const t of x.c.tels || []) { const d = phNorm(t); if (d.length >= 8 && !x.tels.has(d)) x.tels.set(d, phFmt(t)); }
  const out = cs.filter(x => x.tels.size); out.prepped = true; return out;
}
function phEdit1(a, b) { const m = a.length, n = b.length; if (Math.abs(m - n) > 1) return 9; let i = 0, j = 0, e = 0;
  while (i < m && j < n) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return 9; if (m > n) i++; else if (n > m) j++; else { i++; j++; } }
  return e + (m - i) + (n - j); }
// 고르기 후보 (1123-T T2, HB 11/23 '못 찾으면 후보를 보여줘서 고를 수 있게') — 셀 inside matchContacts 결.
//   꼭 같은 이름 1 · 한쪽이 다른 쪽에 든 것 0.8 · 한 글자 다른 것(세 글자 넘을 때) 0.6. 연락처마다 번호를 모두 싣는다(한 연락처 안의 여러 번호 중 고르게)
//   → [{ name, tels:['010-…'], score }] 점수 · 짧은 이름 차례, n 개까지
function phCands(name, contacts, n) {
  const k = phKey(name, true), out = []; if (!k) return out;
  for (const x of phPrepAll(contacts)) {
    let sc = x.k === k || x.alt.includes(k) || x.rot.includes(k) ? 1 : 0;
    if (!sc && [x.k].concat(x.alt).some(y => Math.min(k.length, y.length) >= 2 && (y.includes(k) || k.includes(y)))) sc = 0.8;
    if (!sc && k.length < 3 && x.w.includes(k)) sc = 0.8;
    if (!sc && [x.k].concat(x.alt).some(y => Math.min(k.length, y.length) >= 3 && phEdit1(k, y) === 1)) sc = 0.6;
    if (sc) out.push({ name: x.c.name, tels: [...x.tels.values()], score: sc }); }
  return out.sort((a, b) => b.score - a.score || a.name.length - b.name.length || a.name.localeCompare(b.name, 'ko')).slice(0, n || 6);
}
// 내 연락처에서 찾기 — 이름(직분 · 괄호 떼고, 이름 속 어디든) 또는 번호 숫자 세 자리 넘게. [{ name, tels }] n 개까지
function phSearch(q, contacts, n) {
  const k = phKey(q), dg = String(q || '').replace(/\D/g, ''), out = []; if (!k && dg.length < 3) return out;
  for (const x of phPrepAll(contacts)) { if ((k && [x.k].concat(x.alt).some(y => y.includes(k))) || (dg.length >= 3 && [...x.tels.keys()].some(d => d.includes(dg)))) out.push({ name: x.c.name, tels: [...x.tels.values()] }); if (out.length >= (n || 20)) break; }
  return out;
}
function phMatch(names, contacts) {
  const cs = phPrepAll(contacts);
  const exact = {}; for (const x of cs) if (x.tels.size) for (const k of [x.k].concat(x.alt, x.rot)) if (k) (exact[k] = exact[k] || []).push(x);
  const keyN = {}; for (const n of names || []) { const k = phKey(n, true); if (k) keyN[k] = (keyN[k] || 0) + 1; }
  const hit = {}, multi = [], miss = [];
  for (const n of names || []) { const k = phKey(n, true); if (!k) { miss.push(n); continue; }
    let found = exact[k] || [], how = 'same';
    if (!found.length) { how = 'near'; found = cs.filter(x => x.tels.size && (k.length >= 3 ? [x.k].concat(x.alt).some(y => y.includes(k)) : x.w.includes(k))); }
    const tels = new Map(); for (const x of found) for (const [d, f] of x.tels) if (!tels.has(d)) tels.set(d, { f, src: x.c.name });
    if (!tels.size) miss.push(n); else if (tels.size > 1 || keyN[k] > 1) multi.push(n);
    else { const [t] = [...tels.values()]; hit[gsN(n)] = { n, p: t.f, src: t.src, how }; } }
  return { hit, multi, miss };
}
// 셀 inside 의 셀원 번호({ 셀원id:{ n, p } }) → 연락처 꼴
function phFromCell(phones) { return Object.values(phones && typeof phones === 'object' ? phones : {}).filter(x => x && x.n && x.p).map(x => ({ name: String(x.n), tels: [String(x.p)] })); }
// 계정 문서 다듬기 — { v, at, by:{ 열쇠:{ n, p, src } } } (모르는 칸 · 긴 글 · 번호 아닌 것은 버림). 모양이 틀리면 빈 것
function phDoc(d) {
  const by = {}; let n = 0;
  if (d && typeof d === 'object' && d.v === PH_V && d.by && typeof d.by === 'object') for (const k of Object.keys(d.by)) { if (n >= PH_MAX) break;
    const x = d.by[k]; if (!x || typeof x.p !== 'string' || phNorm(x.p).length < 8 || !/^[^\s]{1,30}$/.test(k)) continue;
    by[k] = { n: gsStr(x.n || k, 30), p: phFmt(x.p).slice(0, 20), src: gsStr(x.src || '', 40) }; n++; }
  return { v: PH_V, at: (d && +d.at) || 0, by };
}
// 새로 맞춘 것을 계정 것에 더하기 — 같은 이름은 새것이 이긴다(지우지 않음). changed = 올릴 까닭이 있나
function phMerge(prev, hit, at) {
  const a = phDoc(prev), by = Object.assign({}, a.by); let changed = false;
  for (const k of Object.keys(hit || {})) { const x = hit[k]; if (!by[k] || by[k].p !== x.p || by[k].n !== x.n) { by[k] = { n: x.n, p: x.p, src: x.src || '' }; changed = true; } }
  return { doc: phDoc({ v: PH_V, at, by }), changed };
}
// 글 한 조각에서 번호 있는 이름 자리들 — [[시작, 끝, 이름]] (긴 이름 먼저 · 겹치지 않게 · 앞뒤가 한글이면 다른 낱말로 보고 건너뜀 — nameSpans)
function phSpans(text, names) {
  const out = [];
  for (const n of (names || []).slice().sort((a, b) => b.length - a.length)) for (const [a, b] of nameSpans(text, n)) if (!out.some(x => a < x[1] && b > x[0])) out.push([a, b, n]);
  return out.sort((x, y) => x[0] - y[0]);
}
// 이름 → 번호 ('' = 없음)
function phOf(doc, name) { const x = doc && doc.by && doc.by[gsN(name)]; return x ? x.p : ''; }
// 그 달에 고를 수 있는 알약 — 주일 2부 · 1부 · 라이프라인 · 3부(있을 때) · 금요(있을 때)
function gsModes(d, ym) {
  const j = gsJ(d); if (!j) return [];
  const sv = new Set((j.sun || []).filter(e => e.date.slice(0, 7) === ym).map(e => e.svc));
  return GS_ORD.filter(s => sv.has(s)).concat((j.fri || []).some(e => e.date.slice(0, 7) === ym) ? ['fri'] : []);
}
// 월간 '부산 예배팀' — 줄 = 역할 · 열 = 주(그 예배). 그 달 내내 빈 역할 줄은 숨김.
//   중계 열: 맨 위부터 이어진 빈 줄 수(fold) — 화면이 그만큼을 '중계' 한 칸으로 접는다(시트의 합친 칸과 같은 모양)
function gsMonthTeam(d, ym, mode) {
  const j = gsJ(d); if (!j) return { cols: [], rows: [] };
  const side = mode === 'fri' ? 'fri' : 'sun';
  const es = (j[side] || []).filter(e => e.date.slice(0, 7) === ym && (side === 'fri' || e.svc === mode)).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const rows = ((j.roles || {})[side] || []).map(r => ({ k: r.k, label: r.label, cells: es.map(e => (e.cells || {})[r.k] || []) })).filter(r => r.cells.some(c => c.length));
  const cols = es.map((e, i) => { let fold = 0; if (e.relay) while (fold < rows.length && !rows[fold].cells[i].length) fold++;
    return { date: e.date, sun: visitSun(e.date), label: gsMd(e.date), name: side === 'fri' ? (e.name || '') : '', relay: !!e.relay, fold }; });
  return { cols, rows };
}
// 월간 '부산 예배위원' — 줄 = 날(그 예배) · 열 = 역할(안내 · 헌금 · 봉독 · 광고). 그 달 내내 빈 열은 숨김
function gsMonthServe(d, ym, mode) {
  const j = gsJ(d); if (!j) return { cols: [], rows: [] };
  const side = mode === 'fri' ? 'fri' : 'sun';
  const es = (j[side] || []).filter(e => e.date.slice(0, 7) === ym && (side === 'fri' || e.svc === mode)).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const cols = ((j.roles || {})[side] || []).filter(r => es.some(e => ((e.cells || {})[r.k] || []).length)).map(r => ({ k: r.k, label: r.label }));
  return { cols, rows: es.map(e => ({ date: e.date, sun: visitSun(e.date), label: gsMd(e.date), name: side === 'fri' ? (e.name || '') : '', relay: !!e.relay, cells: cols.map(c => (e.cells || {})[c.k] || []) })) };
}
// 사람별 횟수 — 그 달 두 시트를 함께 센다(HB 만 보는 자리). 같은 날 · 같은 예배 · 같은 역할(예배팀 봉독 = 예배위원 봉독)은 한 번.
//   [{ name, n, parts:[{ t:'메인 건반', n }] }] — 많은 순, 같으면 이름순. 토요모임은 안 셈
function gsPeople(team, serve, ym) {
  const seen = new Set(), P = {};
  for (const d of [team, serve]) { const j = gsJ(d); if (!j) continue;
    for (const side of ['sun', 'fri']) { const lab = {}; for (const r of (j.roles || {})[side] || []) lab[r.k] = r.label;
      for (const e of j[side] || []) { if (!e || e.date.slice(0, 7) !== ym) continue;
        for (const k of Object.keys(e.cells || {})) { const rk = gsRk(k); if (GS_NOCOUNT.includes(rk)) continue;
          for (const n of e.cells[k] || []) { const nk = gsN(n); if (!nk) continue;
            const id = e.date + '|' + side + '|' + (e.svc || '') + '|' + rk + '|' + nk; if (seen.has(id)) continue; seen.add(id);
            const t = String(lab[k] || rk).replace(/#\d+$/, '');   // 역할마다 합쳐 셈(예배마다 가르면 줄이 너무 길다 — 미리보기에서 봄)
            const p = (P[nk] = P[nk] || { name: n, n: 0, parts: {} }); p.n++; p.parts[t] = (p.parts[t] || 0) + 1; } } } } }
  return Object.values(P).map(p => ({ name: p.name, n: p.n, parts: Object.entries(p.parts).map(([t, n]) => ({ t, n })).sort((a, b) => b.n - a.n || a.t.localeCompare(b.t, 'ko')) }))
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'ko'));
}
/* ---- 시트와 맞춰 보기 (1121-G G4, HB 결정 ③ 가 · 11/21) ----
   계정의 두 표(gsData)와 책을 견주어 **어긋난 곳만** 알린다. 견주는 곳 셋:
   ① 그 주일 부산 교역자 — 예배팀 '교역자' · 예배위원 '광고' ↔ 주일에 머무는 부산 일정(vSun)의 who
   ② 금요 인도 — 예배팀 금요 '예배 인도' · 판교중계 ↔ 방문의 lead.fri (AWAKE · REVIVED · ENCOUNTER 주만 — leadOpen)
   ③ 주일 · LL 중계 — 예배팀 2부 · 라이프라인의 판교중계 ↔ lead.sun · lead.ll (중계인지만 견준다 — 주일 이름은 견주지 않음, HB 11/22)
   이름 맞추기는 gsKeys 와 같은 규칙: 이름 + 다른 이름, 띄어쓰기 없이, 같은 열쇠가 둘이면 잇지 않음. 홀로 적힌 '목사' 같은 호칭 낱말은 이름으로 보지 않는다.
   ⛔ 책을 저절로 바꾸지 않는다 — gsFix 는 HB 가 '앱에 반영' 을 누를 때만 부른다. ⛔ 시트에 쓰지 않는다.
   넘기기: 줄마다 열쇠(key = 자리 + 앱 값 · 시트 값의 지문)를 HB 의 ui.gsk 에 — 앱이나 시트 값이 바뀌면 열쇠가 달라 다시 뜬다(이름은 열쇠에 안 든다). */
const GS_HONOR = /^(목사|전도사|강도사|사모|간사)?님?$/;   // 홀로 적힌 호칭('이가람 목사' 의 '목사')은 이름이 아니다
const GS_HONOR_TAIL = /(목사님?|전도사님?|강도사님?)$/, GS_SKIP_MAX = 60;
function gsWhoMap(book) {
  const cnt = new Map(), own = new Map();
  for (const p of live(book.people)) for (const k of new Set([p.name].concat(p.alias || []).map(gsN).filter(Boolean))) { cnt.set(k, (cnt.get(k) || 0) + 1); own.set(k, p.id); }
  const m = new Map(); for (const [k, n] of cnt) if (n === 1) m.set(k, own.get(k)); return m;
}
// 시트 이름 하나 → 사람 id ('' = 못 찾음). '이가람목사' 처럼 호칭이 붙어 있으면 떼고 한 번 더(남는 이름이 두 글자 넘을 때만)
function gsPid(map, name) { const k = gsN(name); if (map.has(k)) return map.get(k); const b = k.replace(GS_HONOR_TAIL, ''); return b !== k && b.length >= 2 && map.has(b) ? map.get(b) : ''; }
function gsResolve(map, names) { const pids = [], miss = []; for (const n of names) { const p = gsPid(map, n); if (p) { if (!pids.includes(p)) pids.push(p); } else if (!miss.includes(n)) miss.push(n); } return { pids, miss }; }
// 그 예배 칸들(같은 날 · 같은 쪽)에서 한 역할의 이름들 — '교역자#2' 같은 둘째 줄도 함께, 호칭 낱말은 뺌
function gsTake(list, pred, rk) {
  const out = []; for (const e of list || []) { if (!e || !pred(e)) continue;
    for (const k of Object.keys(e.cells || {})) if (gsRk(k) === rk) for (const n of e.cells[k] || []) if (!GS_HONOR.test(gsN(n)) && !out.includes(n)) out.push(n); }
  return out;
}
const gsSameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
function gsMissWhy(miss) { return "'" + miss.join("' · '") + "' 을(를) 사람 목록에서 찾지 못했습니다\n교역자들 탭 '다른 이름' 에 적으면 이어집니다"; }
// 시트 금요 · 주일 '예배 인도' 이름 → 앱 인도 { lead, why }. 그 부산 일정 교역자면 교역자 인도, 성도 인도자(kind lay) 한 분이면 그분
function gsLeadOf(book, map, v, ns) {
  const r = gsResolve(map, ns); if (r.pids.some(p => v.who.includes(p))) return { lead: { m: 'staff' }, why: '' };
  if (r.miss.length) return { lead: null, why: gsMissWhy(r.miss) };
  const ps = r.pids.map(id => live(book.people).find(p => p.id === id)), lay = ps.filter(p => p && p.kind === 'lay');
  if (ps.length === 1 && lay.length === 1) return { lead: { m: 'lay', p: lay[0].id }, why: '' };
  return { lead: null, why: ps.length > 1 ? '시트에 인도자가 여럿입니다 — 부산 일정 판에서 정해 주세요' : "'" + ns.join(' · ') + "' 님은 그 부산 일정 교역자도 성도 인도자도 아닙니다" };
}
function gsSameLead(a, b) { return !a && !b ? true : !a || !b ? false : a.m === b.m && (a.m !== 'lay' || (a.p || '') === (b.p || '')); }
// 어긋난 곳들 — [{ id, key, kind: 'who' | 'lead', svc, date, label, app, sheet: [{ label, text }], want, fix, why, visit }]
//   fix = '앱에 반영' 이 할 일(null = 앱에서 고칠 수 없음 → why 에 까닭) · want = 반영한 뒤 앱 값의 글
function gsDiff(book, team, serve, from, to) {
  const T = gsJ(team), V = gsJ(serve); if (!T && !V) return [];
  const map = gsWhoMap(book), vs = live(book.visits), out = [], inR = d => gsYmdOk(d) && d >= from && d <= to;
  const nm = id => { const p = book.people.find(x => x.id === id); return p && !p.del ? p.name : '(지운 사람)'; }, names = ids => ids.map(nm).join(' · ') || '비움';
  const leadT = (l, v) => !l ? '비움' : l.m === 'relay' ? '중계' : l.m === 'lay' ? (l.p ? nm(l.p) : '성도 인도자') + ' 인도' : '교역자 인도' + (v && v.who.length ? '(' + names(v.who) + ')' : '');
  const push = (x) => { x.id = x.kind === 'who' ? 'who|' + x.date : 'lead|' + x.svc + '|' + x.date; x.key = x.id + '|' + gsHash(x.app + '>' + x.sheet.map(s => s.label + ':' + s.text).join('/')); out.push(x); };
  // ① 부산 교역자
  const suns = new Set(); for (const j of [T, V]) for (const e of (j && j.sun) || []) if (e && inR(e.date) && dowOf(e.date) === 0) suns.add(e.date);
  for (const sun of [...suns].sort()) {
    const on = e => e.date === sun, src = [['예배팀 교역자', gsTake(T && T.sun, on, '교역자')], ['예배위원 광고', gsTake(V && V.sun, on, '광고')]]
      .filter(x => x[1].length).map(([label, ns]) => Object.assign({ label, names: ns }, gsResolve(map, ns)));
    if (!src.length) continue;   // 시트에 아직 안 적었으면 견주지 않는다
    const here = vs.filter(v => vSun(v) === sun), app = [...new Set(here.flatMap(v => v.who))];
    if (src.every(s => !s.miss.length && gsSameSet(s.pids, app))) continue;
    const miss = [...new Set(src.flatMap(s => s.miss))]; let fix = null, why = '';
    if (miss.length) why = gsMissWhy(miss);
    else if (src.length > 1 && !gsSameSet(src[0].pids, src[1].pids)) why = '두 시트의 교역자가 서로 다릅니다\n시트를 먼저 맞춰 주세요';
    else if (here.length > 1) why = '그 주일에 머무는 부산 일정이 둘입니다\n부산 일정 판에서 고쳐 주세요';
    else if (!here.length && vs.some(v => visitSun(v.date) === sun)) why = '그 주 부산 일정이 주일에 머물지 않습니다\n부산 일정 판에서 고쳐 주세요';
    else fix = here.length ? { visit: here[0].id, who: src[0].pids.slice(0, 6) } : { visit: visitId(sun), make: true, who: src[0].pids.slice(0, 6) };
    push({ kind: 'who', svc: '', date: sun, label: '부산 교역자', app: here.length ? names(app) : '부산 일정 없음', sheet: src.map(s => ({ label: s.label, text: s.names.join(' · ') })),
      want: fix ? (fix.make ? '새 부산 일정 · ' : '') + names(fix.who) : '', fix, why, visit: here.length === 1 ? here[0].id : '' });
  }
  // ② 금요 인도 · ③ 주일 · LL 중계 — 그 날을 맡는 부산 일정이 꼭 하나일 때만(없으면 '부산 일정이 아직 없습니다' 알림이 이미 말한다)
  const one = (svc, d) => { const h = vs.filter(v => leadDate(v, svc) === d && leadOpen(v, svc)); return h.length === 1 ? h[0] : null; };
  for (const e of (T && T.fri) || []) {
    if (!e || !inR(e.date) || dowOf(e.date) !== 5) continue; const v = one('fri', e.date); if (!v) continue;
    const ns = gsTake([e], () => true, '예배인도'); if (!e.relay && !ns.length) continue;
    const cur = leadOf(v, 'fri'), r = e.relay ? { lead: { m: 'relay' }, why: '' } : gsLeadOf(book, map, v, ns);
    if (r.lead && gsSameLead(cur, r.lead)) continue;
    let fix = r.lead ? { visit: v.id, svc: 'fri', lead: r.lead } : cur && cur.m === 'relay' ? { visit: v.id, svc: 'fri', lead: null } : null;   // 이름을 못 이어도 '중계가 아님' 은 확실하다 → 비움
    if (fix && fix.lead && fix.lead.m === 'staff' && !stayDates(v).includes(e.date)) fix.addDay = DOW[dowOf(e.date)];   // 교역자 인도 날은 머무는 날이어야 보인다(evFixDays 와 같은 결)
    push({ kind: 'lead', svc: 'fri', date: e.date, label: (friName(visitSun(e.date)) || e.name || '금요') + ' 예배 인도', app: leadT(cur, v),
      sheet: [{ label: '예배팀 예배 인도', text: e.relay ? GS_RELAY : ns.join(' · ') }], want: fix ? leadT(fix.lead, v) + (fix.addDay ? ' · 머무는 날에 ' + fix.addDay + ' 더함' : '') : '', fix, why: r.why, visit: v.id });
  }
  for (const e of (T && T.sun) || []) {
    if (!e || !inR(e.date) || dowOf(e.date) !== 0 || (e.svc !== '2' && e.svc !== 'LL')) continue;
    const svc = e.svc === '2' ? 'sun' : 'll', v = one(svc, e.date); if (!v) continue;
    const cur = leadOf(v, svc), relay = !!(cur && cur.m === 'relay'); if (!!e.relay === relay) continue;
    if (!e.relay && !Object.keys(e.cells || {}).length) continue;   // 빈 열(아직 안 적음)은 '중계 아님' 으로 읽지 않는다
    const ns = gsTake([e], () => true, '예배인도'), r = e.relay ? { lead: { m: 'relay' }, why: '' } : ns.length ? gsLeadOf(book, map, v, ns) : { lead: null, why: '' };
    const fix = { visit: v.id, svc, lead: r.lead };
    if (fix.lead && fix.lead.m === 'staff' && !stayDates(v).includes(e.date)) fix.addDay = DOW[dowOf(e.date)];
    push({ kind: 'lead', svc, date: e.date, label: (svc === 'sun' ? '주일예배(2부)' : '라이프라인') + ' 중계', app: leadT(cur, v),
      sheet: [{ label: '예배팀 ' + GS_SVC_NAME[e.svc], text: e.relay ? GS_RELAY : '중계 아님' + (ns.length ? ' · 예배 인도 ' + ns.join(' · ') : '') }],
      want: leadT(fix.lead, v) + (fix.addDay ? ' · 머무는 날에 ' + fix.addDay + ' 더함' : ''), fix, why: r.lead || e.relay ? '' : '시트가 중계가 아니어서 인도를 비워 둡니다' + (r.why ? '\n' + r.why : ''), visit: v.id });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
// '앱에 반영' — HB 가 누를 때만. 바뀌었으면 true. 한 칸만 바꾼다(그 방문의 who · 또는 lead 한 칸, 교역자 인도면 그 요일을 머무는 날에)
function gsFix(book, f, by, now) {
  if (!f || typeof f.visit !== 'string') return false;
  const v = live(book.visits).find(x => x.id === f.visit);
  if (Array.isArray(f.who)) { if (!f.who.length) return false;
    if (!v) return !!f.make && put(book, 'visits', { id: f.visit, who: f.who }, by, now);
    return !gsSameSet(v.who, f.who) && put(book, 'visits', Object.assign({}, v, { who: f.who }), by, now); }
  if (!v || !LEAD_SVC.includes(f.svc)) return false;
  const lead = Object.assign({}, v.lead || {}); if (f.lead) lead[f.svc] = f.lead; else delete lead[f.svc];
  const nv = Object.assign({}, v, { lead }); if (f.addDay) nv.days = sortDays(v.date, (v.days || defaultDays(v.date)) + f.addDay);
  if (gsSameLead(leadOf(v, f.svc), f.lead) && nv.days === v.days) return false;
  return put(book, 'visits', nv, by, now);
}
// 넘긴 줄 열쇠 목록(ui.gsk) — 꼴이 맞는 것만, 나중 것 GS_SKIP_MAX 개
function gsSkipNorm(a) { return (Array.isArray(a) ? a : []).filter(x => typeof x === 'string' && /^[\w|-]{1,80}$/.test(x)).filter((x, i, s) => s.indexOf(x) === i).slice(-GS_SKIP_MAX); }
/* ---- 알림 (1123-B B4, HB 결정 E1 줄마다 · E2 예배 인도 · 음향 · 봉독 · E3 잠금 화면 이름 괜찮음 · 11/23) ----
   교역자마다 자기 알림을 만든다(메뉴 → 계정 → 내 알림). 서버(wallet-functions/src/rotapush.js)가 정한 때에 그 주 시트 표로 글을 만들어 보낸다.
   ⚠️ 이 판단은 서버와 **한 벌**이다 — 서버는 이 덩어리를 tools/make-rotapush-core.sh 로 떼어 쓴다(rotation-core.gen.js). 서버에 같은 규칙을 따로 쓰지 말 것.
   알림 하나 = { id, n 이름, on, svcs 예배(fri · 1 · 2 · 3 · LL), roles 갈래(교역자 + 여덟 갈래), shape lines | one | kt(+ kt 프리셋 id),
                 when [{ d 이틀 전 -2 · 전날 -1 · 당일 0, t 'HH:MM', w all | mine(내 부산 주만) }], open svc | ppl | kt | mine }
   때는 예배 날 기준 — 금요는 금요일(전날 = 목), 주일 예배는 주일(전날 = 토). 한 번에 그 날 예배들을 한 통으로. 고른 것이 그 날 표에 없으면 보내지 않는다.
   저장은 서버만 읽고 쓰는 rotapush/{uid}(보안 규칙에 없음) — 책 · ui · staff 칸에 넣지 않는다. 시각은 한국 시각. */
const RP_SVCS = [['fri', '금요'], ['1', '1부'], ['2', '2부'], ['3', '3부'], ['LL', '라이프라인']];
const RP_ROLES = ['교역자'].concat(GS_BRIEF.map(x => x[0]));   // 교역자 = 그 주 부산 일정에 든 분(책 visits — ktStaff)
const RP_SHORT = { '예배 인도': '인도' };
const RP_SHAPES = [['lines', '줄마다'], ['one', '한 줄로'], ['kt', '카톡 글 프리셋']];
const RP_OPEN = [['svc', '예배 순서 · 예배별'], ['ppl', '예배 순서 · 사람별'], ['kt', '카톡 글'], ['mine', '내 일정']];
const RP_DAYS = [[-2, '이틀 전'], [-1, '전날'], [0, '당일']];
const RP_MAX = { alerts: 6, when: 4, name: 20, body: 600, fired: 60 };
const RP_LATE = 10 * 60000;   // 틱이 늦어도 10분 안이면 보낸다 — 그보다 늦은 알림은 버린다
const RP_APP = 'https://sweeter.my/rotation/';
const RP_DEF = { id: 'a1', n: '주일 섬김', on: true, svcs: ['2'], roles: ['예배 인도', '음향', '봉독'], shape: 'lines', kt: '', when: [{ d: -1, t: '20:00', w: 'all' }], open: 'svc' };
function rpHm(s) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s == null ? '' : s).trim()); if (!m || +m[1] > 23 || +m[2] > 59) return ''; return String(+m[1]).padStart(2, '0') + ':' + m[2]; }
function rpWhen(w) { w = w || {}; return { d: RP_DAYS.some(x => x[0] === +w.d) && w.d !== '' && w.d != null ? +w.d : -1, t: rpHm(w.t) || '20:00', w: w.w === 'mine' ? 'mine' : 'all' }; }
// 한 줄 다듬기 — 모르는 값은 버리고 기본으로. id 가 틀리면 fb 로
function rpOne(o, fb) {
  if (!o || typeof o !== 'object') return null;
  const pick = (xs, list) => list.map(x => x[0] !== undefined && Array.isArray(x) ? x[0] : x).filter(k => (Array.isArray(xs) ? xs : []).includes(k));
  const svcs = pick(o.svcs, RP_SVCS), roles = pick(o.roles, RP_ROLES), seen = new Set(), when = [];
  for (const w of Array.isArray(o.when) ? o.when : []) { const x = rpWhen(w), k = x.d + '|' + x.t; if (seen.has(k)) continue; seen.add(k); when.push(x); if (when.length >= RP_MAX.when) break; }
  return { id: typeof o.id === 'string' && /^[A-Za-z0-9_-]{1,20}$/.test(o.id) ? o.id : fb || 'a1', n: String(o.n == null ? '' : o.n).replace(/\s+/g, ' ').trim().slice(0, RP_MAX.name) || '알림',
    on: o.on !== false, svcs: svcs.length ? svcs : ['2'], roles, shape: RP_SHAPES.some(x => x[0] === o.shape) ? o.shape : 'lines',
    kt: typeof o.kt === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(o.kt) ? o.kt : '', when: when.length ? when : [rpWhen({})], open: RP_OPEN.some(x => x[0] === o.open) ? o.open : 'svc' };
}
// 목록 다듬기 — 6개까지 · 같은 id 는 뒤의 것을 새 id 로
function rpNorm(list) {
  const out = [], ids = new Set();
  for (const o of Array.isArray(list) ? list : []) { let x = rpOne(o, ''); if (!x) continue;
    if (ids.has(x.id)) { let i = 1; while (ids.has('a' + i)) i++; x.id = 'a' + i; }
    ids.add(x.id); out.push(x); if (out.length >= RP_MAX.alerts) break; }
  return out;
}
function rpDefault() { return rpOne(JSON.parse(JSON.stringify(RP_DEF))); }
function rpNewId(list) { const ids = new Set(rpNorm(list).map(x => x.id)); let i = 1; while (ids.has('a' + i)) i++; return 'a' + i; }
// 한국 시각
function rpMs(ymd, hm) { return Date.parse(ymd + 'T' + hm + ':00+09:00'); }
function rpYmd(ms) { return new Date(ms + 9 * 3600e3).toISOString().slice(0, 10); }
// from < 보낼 때 <= to 인 것 — [{ id, a, w, date: 예배 날, at, key }] (때 차례). 열쇠 = 알림 · 예배 날 · 때 → 두 번 보내지 않는 데 쓴다
function rpDue(alerts, from, to) {
  const out = []; if (!(to > from)) return out;
  const d0 = rpYmd(from), d1 = addDays(rpYmd(to), 2);
  for (const a of rpNorm(alerts)) { if (!a.on) continue; const wd = new Set(a.svcs.map(s => (s === 'fri' ? 5 : 0)));
    for (let D = d0; D <= d1; D = addDays(D, 1)) { if (!wd.has(new Date(D + 'T00:00:00Z').getUTCDay())) continue;
      for (const w of a.when) { const at = rpMs(addDays(D, w.d), w.t); if (at > from && at <= to) out.push({ id: a.id, a, w, date: D, at, key: a.id + '|' + D + '|' + w.d + '|' + w.t }); } } }
  return out.sort((x, y) => x.at - y.at || (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
}
// 다음 보낼 때(ms) — 9일 안에 없으면 null(켠 알림이 없을 때)
function rpNext(alerts, now) { const xs = rpDue(alerts, now, now + 9 * 864e5); return xs.length ? xs[0].at : null; }
// 무엇을 더 읽어야 하나 — book: 교역자 · 내 부산 주만 · 카톡 글({교역자}) / kt: 카톡 글 프리셋
function rpNeeds(a) { a = rpOne(a) || rpDefault(); return { book: a.roles.includes('교역자') || a.when.some(w => w.w === 'mine') || a.shape === 'kt', kt: a.shape === 'kt' }; }
// 그 주 부산 일정에 내가 들었나 (책 visits 한 곳 · 사람은 계정 이메일로)
function rpMine(book, email, sun) { const p = personByEmail(normBook(book), email); return !!p && gsInWeek(normBook(book), p.id, sun); }
function rpSvcKey(x) { return x.side === 'fri' ? 'fri' : x.svc; }
function rpSvcLabel(x, short) { return x.side === 'fri' ? (x.name || '금요') : x.svc === 'LL' ? (short ? 'LL' : '라이프라인') : GS_SVC_NAME[x.svc] || ''; }
function rpDayWord(date, today) {
  const n = gsYmdOk(today) ? Math.round((Date.parse(date) - Date.parse(today)) / 864e5) : 99;
  return n === 0 ? '오늘' : n === 1 ? '내일' : n === 2 ? '모레' : mdOf(date);
}
// 알림 글 — c = { team, serve, date: 예배 날, today: 보내는 날, staff:[이름], kts:[{ id, n, t }] } → { title, body } | null(보낼 것 없음)
//   줄마다(E1): '예배 인도 한도윤\n음향 문이든\n봉독 고은결' — 그 날 예배가 여럿이면 줄 앞에 예배 이름 · 중계면 '1부 분당 중계'
//   한 줄로: '인도 한도윤 · 음향 문이든 · 봉독 고은결' / 카톡 글: 그 프리셋을 ktFill 그대로({본문} 줄은 빠짐 — 알림 서버는 Monday 를 안 읽음)
function rpMsg(a, c) {
  a = rpOne(a); c = c || {}; if (!a || !gsYmdOk(c.date)) return null;
  const sun = visitSun(c.date), wk = gsWeek(c.team, c.serve, sun).filter(x => x.date === c.date && a.svcs.includes(rpSvcKey(x)));
  if (!wk.length) return null;
  const fri = wk.every(x => x.side === 'fri'), suns = wk.filter(x => x.side === 'sun');
  const what = fri ? (wk[0].name || '금요예배') : suns.length === 1 ? '주일 ' + rpSvcLabel(suns[0], true) : '주일예배';
  const title = rpDayWord(c.date, c.today) + ' 부산 ' + what, staff = (c.staff || []).filter(Boolean);
  let body = '';
  const kt = a.shape === 'kt' ? (c.kts || []).find(y => y && y.id === a.kt && y.t) : null;
  if (kt) body = ktFill(kt.t, { team: c.team, serve: c.serve, sun, today: c.today, txt: '', staff, verses: null }).text;
  else { const one = a.shape === 'one', many = wk.length > 1, rows = [];
    const roles = a.shape === 'kt' && !a.roles.length ? RP_DEF.roles : a.roles;   // 카톡 글 프리셋이 지워졌으면 기본 셋으로
    if (roles.includes('교역자') && staff.length) rows.push('교역자 ' + staff.join(', '));
    for (const x of wk) { const lab = many ? rpSvcLabel(x, one) + ' ' : '';
      if (x.relay) { rows.push(lab + '분당 중계'); continue; }
      for (const r of roles) { if (r === '교역자') continue; const ns = ktNames(x, r); if (ns.length) rows.push(lab + (one ? RP_SHORT[r] || r : r) + ' ' + ns.join(', ')); } }
    body = rows.join(one ? ' · ' : '\n'); }
  body = String(body || '').trim(); if (!body) return null;
  return { title: title.slice(0, 40), body: body.length > RP_MAX.body ? body.slice(0, RP_MAX.body - 1) + '…' : body };
}
// 누르면 갈 곳 — 앱이 ?rp= 를 읽어 그 주 예배 순서 판(예배별 · 사람별 · 카톡 글) 또는 내 일정을 연다
function rpLink(a, date) { a = rpOne(a) || rpDefault(); return RP_APP + '?rp=' + a.open + (gsYmdOk(date) ? '&d=' + date : ''); }
function rpLinkRead(search) {
  const q = /[?&]rp=([a-z]+)/.exec(String(search || '')), d = /[?&]d=(\d{4}-\d{2}-\d{2})\b/.exec(String(search || ''));
  if (!q || !RP_OPEN.some(x => x[0] === q[1])) return null; return { open: q[1], date: d && gsYmdOk(d[1]) ? d[1] : '' };
}
// 미리보기 · 시험 — today 부터 5주 안에서 그 알림이 처음 말할 예배 날의 글. → { date, d, msg } | null
function rpPreview(a, c) {
  a = rpOne(a); c = c || {}; if (!a || !gsYmdOk(c.today)) return null;
  const wd = new Set(a.svcs.map(s => (s === 'fri' ? 5 : 0)));
  for (let D = c.today, i = 0; i < 36; i++, D = addDays(D, 1)) { if (!wd.has(new Date(D + 'T00:00:00Z').getUTCDay())) continue;
    const staff = typeof c.staffOf === 'function' ? c.staffOf(visitSun(D)) : c.staff;
    const msg = rpMsg(a, Object.assign({}, c, { date: D, staff })); if (msg) return { date: D, msg }; }
  return null;
}
// 목록에 보일 한 줄 — '2부 · 예배 인도 · 음향 · 봉독 · 전날 20:00'
function rpWhenText(w) { w = rpWhen(w); return (RP_DAYS.find(x => x[0] === w.d) || RP_DAYS[1])[1] + ' ' + w.t + (w.w === 'mine' ? ' · 내 부산 주만' : ''); }
function rpSummary(a) {
  a = rpOne(a) || rpDefault(); const sv = RP_SVCS.filter(x => a.svcs.includes(x[0])).map(x => x[0] === 'LL' ? 'LL' : x[1]).join(' · ');
  const what = a.shape === 'kt' ? '카톡 글' : a.roles.length ? a.roles.join(' · ') : '고른 정보 없음';
  return sv + ' — ' + what + ' — ' + a.when.map(rpWhenText).join(' / ');
}

return { APP_VERSION, RP_MAX, RP_LATE, RP_APP, rpNorm, rpOne, rpDefault, rpDue, rpNext, rpNeeds, rpMine, rpMsg, rpLink, rpPreview, rpYmd, gsUnpack, pickDoc, normBook, ktList, ktStaff, visitSun, teamOf };
})();
