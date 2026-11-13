/* 심방 노트 'ChatGPT 가 보낸 기록' 알림 — 규칙만 (파이어베이스 · 네트워크 없음). 시험: tests/test_carepush.js
 * (HB 2026-11-13 "진행", docs/ROADMAP.md '1113-P')
 *
 * ChatGPT 가 시트 'AI 입력대기' 탭에 줄을 넣어도 앱에는 신호가 오지 않는다 → 서버가 10분마다 그 탭을 **읽기만** 해서
 * 처음 보는 '대기' 줄이 있으면 알린다.
 * ⚠️ 심방 내용은 서버에 두지 않는다. 읽은 줄에서 쓰는 것은 '대기 줄의 열쇠'(원본ID · 없으면 글의 해시)와 **이름**뿐이고,
 *    알림 글에도 이름 · 건수만 싣는다. 시트에 쓰지 않는다(GET 하나).
 */
const TAB = "AI 입력대기";
const WAIT = "대기";
const APP_URL = "https://sweeter.my/care/?inbox=1";
const EVERY_MIN = 10;
const SEEN_CAP = 300;
const NAME_MAX = 4;

const norm = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
// 셀 inside(매 10분 0분)와 겹치지 않게 5분 자리에
function due(now) { return Math.floor(now / 60000) % EVERY_MIN === 5; }
function sheetUrl(sheetId) {
  return "https://sheets.googleapis.com/v4/spreadsheets/" + encodeURIComponent(sheetId) + "/values/" + encodeURIComponent("'" + TAB + "'!A1:I400");
}
function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "h" + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function jsonOf(cell) {
  const s = String(cell || "").trim(), f = s.match(/```(?:json)?\s*\n?([\s\S]*?)```/i), t = f ? f[1].trim() : s;
  try { const o = JSON.parse(t); return o && typeof o === "object" ? o : null; } catch (e) { return null; }
}
function cleanName(raw) {
  const n = norm(String(raw || "").replace(/\([^)]*\)/g, " "));
  return n.replace(/\s*(성도님|성도|자매님|자매|형제님|형제|집사님|집사|권사님|권사|장로님|장로|님)$/, "").trim() || n;
}
// 탭 값 → 대기 줄 [{key, names}] — 열은 머리글 이름으로. JSON 이 깨진 줄은 알리지 않는다(앱이 '읽지 못한 것' 으로 돌린다)
// 열쇠는 원본ID(없으면 패킷 글의 해시) — 접수ID 는 앱이 나중에 붙여 바뀌므로 쓰지 않는다
function waiting(values) {
  const h = ((values && values[0]) || []).map(norm), ci = { json: h.indexOf("패킷JSON"), st: h.indexOf("상태"), src: h.indexOf("원본ID") }, out = [];
  if (ci.json < 0 || ci.st < 0) return out;
  for (let i = 1; i < (values || []).length; i++) {
    const r = values[i] || []; if (norm(r[ci.st]) !== WAIT) continue;
    const o = jsonOf(r[ci.json]); if (!o || !Array.isArray(o.records) || !o.records.length) continue;
    const src = norm(ci.src < 0 ? "" : r[ci.src]) || norm(o.source && o.source.source_id);
    const key = src ? "s:" + src : hash(String(r[ci.json]));
    if (out.some((x) => x.key === key)) continue;
    out.push({ key, names: o.records.map((x) => cleanName(x && x.person_name)).filter(Boolean) });
  }
  return out;
}
// seen: 지난번까지 본 열쇠들(null = 처음 켬 → 이미 있던 줄은 알리지 않는다). 대기에서 빠진 열쇠는 잊는다(다시 들어오면 다시 알림)
function diff(seen, list) {
  const keys = list.map((x) => x.key).slice(-SEEN_CAP);
  if (seen == null) return { fresh: [], seen: keys };
  const had = new Set(seen);
  return { fresh: list.filter((x) => !had.has(x.key)), seen: keys };
}
// 알림 글 — 건수와 이름만. 내용은 싣지 않는다
function messageOf(fresh) {
  if (!fresh || !fresh.length) return null;
  const names = [...new Set([].concat(...fresh.map((x) => x.names)))];
  const who = names.length > NAME_MAX ? names.slice(0, NAME_MAX).join(", ") + " 외 " + (names.length - NAME_MAX) + "명" : names.join(", ");
  return { title: "심방 노트", body: "ChatGPT 가 보낸 기록 " + fresh.length + "건" + (who ? " — " + who : ""), link: APP_URL, tag: "care-inbox" };
}

module.exports = { TAB, WAIT, APP_URL, EVERY_MIN, SEEN_CAP, due, sheetUrl, hash, jsonOf, cleanName, waiting, diff, messageOf };
