/* 셀 inside 새 코멘트 알림 — 규칙만 (파이어베이스 · 네트워크 없음). 시험: tests/test_cellpush.js
 *
 * ⚠️ 셀 케어는 남의 시스템이다. 서버도 **읽기만** 한다 — 부르는 것은 READ_RPCS 와 leadership_assignments 읽기뿐.
 * '내 담당 셀' 판정(pickMine) · '냈는가'(isSubmitted)는 셀 inside 앱(cell/index.html 의 cell-core)과 같아야 한다 —
 * 시험이 두 쪽을 같은 자료로 돌려 같은 답이 나오는지 본다.
 */
const CC_URL = "https://mcbbhsvvzqvtrxlbdcks.supabase.co";
const CC_KEY = "sb_publishable_hs84BPU44TEcr2wM6boXIw_Saktd9p3";   // 셀 케어 페이지에도 공개된 키 (보호는 셀 케어 DB 규칙이 한다)
const READ_RPCS = ["get_my_context", "get_week_status", "senior_comment_list"];
const APP_URL = "https://sweeter.my/cell/?tab=comment";
const EVERY_MIN = 10;      // 10분마다 묻는다 — 셀 케어에 부담을 주지 않게
const SEEN_CAP = 800;

// 서울 날짜(YYYY-MM-DD)와 그 주 월요일
function seoulDay(now) { return new Date(now + 9 * 3600e3).toISOString().slice(0, 10); }
function addDays(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function weekStart(iso) { const dow = new Date(iso + "T00:00:00Z").getUTCDay(); return addDays(iso, -((dow + 6) % 7)); }
// 이번 주와 지난주 — 코멘트는 대개 보고서를 낸 그 주 · 다음 주에 달린다
function weeksToCheck(now) { const w = weekStart(seoulDay(now)); return [w, addDays(w, -7)]; }
function due(now) { return Math.floor(now / 60000) % EVERY_MIN === 0; }

// ↓ cell/index.html 의 cell-core 와 같은 판정 (test_cellpush 가 맞대 본다)
function pickMine(rows, asg, meId, today) {
  const cur = new Set((asg || []).filter((a) => a.start_date <= today && (!a.end_date || a.end_date >= today)).map((a) => a.cell_id));
  const mine = (rows || []).filter((r) => r.i_am_leader || (r.review_mode === "leadership" &&
    (cur.has(r.cell_id) || r.responsible_leadership_id === meId || r.i_can_review)));
  return mine.map((r) => r.cell_id);
}
function isSubmitted(r) {
  if (!r || !r.report_id) return false;
  return r.status === "submitted" || r.status === "revision_requested" || (r.status === "draft" && (r.submission_no || 0) > 0);
}

// 물어볼 보고서: 두 주의 줄에서 내 담당 셀(이번 주 기준) · 낸 것만 → [{ id, cell }]
// 담당 셀이 하나도 안 걸리면 볼 수 있는 셀 전체 (앱과 같은 까닭: 역할이 달라 빈 화면이 되지 않게)
function reportsToCheck(rowsByWeek, asg, meId, today) {
  const first = rowsByWeek[0] || [];
  let mine = new Set(pickMine(first, asg, meId, today));
  if (!mine.size) mine = new Set(first.map((r) => r.cell_id));
  const out = [], seen = new Set();
  for (const rows of rowsByWeek) for (const r of rows || []) {
    if (!mine.has(r.cell_id) || !isSubmitted(r) || seen.has(r.report_id)) continue;
    seen.add(r.report_id); out.push({ id: r.report_id, cell: r.cell_name || "" });
  }
  return out;
}

// 처음 보는 코멘트 — seen 이 없으면(처음 켠 때) 지금 있는 것은 모두 '본 것' 으로 치고 알리지 않는다
function diffComments(seen, list) {
  const all = (list || []).filter((c) => c && c.id != null);
  if (seen == null) return { fresh: [], seen: all.map((c) => String(c.id)).slice(-SEEN_CAP) };
  const s = new Set(seen.map(String));
  const fresh = all.filter((c) => !s.has(String(c.id)));
  const next = [...new Set([...seen.map(String), ...fresh.map((c) => String(c.id))])];
  return { fresh, seen: next.slice(Math.max(0, next.length - SEEN_CAP)) };
}

// 알림 글 — ⚠️ 코멘트 **내용은 싣지 않는다** (알림은 애플 · 구글 서버를 거친다). 누가 · 어느 셀만.
function messageOf(fresh) {
  if (!fresh.length) return null;
  const cells = [...new Set(fresh.map((c) => c._cell).filter(Boolean))];
  const who = [...new Set(fresh.map((c) => c.author_name || "담임").filter(Boolean))];
  const title = fresh.length === 1 ? "새 코멘트 · " + (cells[0] || "셀") : "새 코멘트 " + fresh.length + "건";
  const body = fresh.length === 1
    ? who[0] + " 코멘트가 달렸습니다"
    : (cells.slice(0, 3).join(" · ") + (cells.length > 3 ? " 외 " + (cells.length - 3) + "곳" : "")) + " — " + who.slice(0, 2).join(" · ");
  return { title, body, link: APP_URL, tag: "cell-comment" };
}

// 수파베이스 요청 모양 (fetch 에 그대로 넘긴다)
function refreshReq(rt) {
  return { url: CC_URL + "/auth/v1/token?grant_type=refresh_token", init: { method: "POST", headers: { apikey: CC_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: rt }) } };
}
function rpcReq(name, args, access) {
  if (!READ_RPCS.includes(name)) throw new Error("읽기 함수만 부른다: " + name);
  return { url: CC_URL + "/rest/v1/rpc/" + name, init: { method: "POST", headers: { apikey: CC_KEY, Authorization: "Bearer " + access, "Content-Type": "application/json" }, body: JSON.stringify(args || {}) } };
}
function asgReq(meId, access) {
  return { url: CC_URL + "/rest/v1/leadership_assignments?select=cell_id,start_date,end_date&leadership_user_id=eq." + encodeURIComponent(meId), init: { method: "GET", headers: { apikey: CC_KEY, Authorization: "Bearer " + access } } };
}

module.exports = { CC_URL, CC_KEY, READ_RPCS, APP_URL, EVERY_MIN, SEEN_CAP, seoulDay, addDays, weekStart, weeksToCheck, due, pickMine, isSubmitted, reportsToCheck, diffComments, messageOf, refreshReq, rpcReq, asgReq };
