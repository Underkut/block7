/* Monday 광고 읽기 서버 — 교역자 로테이션(sweeter.my/rotation/) R12 C (HB 2026-11-16)
 *
 * 부산 주일예배의 영상 광고 · 구두 광고를 Monday 에서 **읽기만** 해 돌려준다. 판단은 monday-core.js.
 * HB 의 Monday 개인 토큰은 화면 · 기기 · 교역자에게 가지 않는다 — 여기 mondayKeys/{uid}(보안 규칙에 없음 = 서버만)에만.
 *   ⚠️ 그 토큰은 쓰기 권한까지 가진다. 보내는 질문은 core 의 QUERIES 셋(읽기)뿐이다 — 다른 질문을 더하지 말 것.
 *   ⚠️ 결과를 저장하지 않는다(로그에도 내용을 남기지 않는다).
 *
 * monday (HTTP, asia-northeast3) — 모두 Bearer 파이어베이스 ID 토큰
 *   POST /key    {token}        HB 가 붙여 넣은 열쇠를 Monday 에 맞는지 물어보고 맡긴다 (자기 칸에만)
 *   POST /status               맡긴 열쇠가 있는가 {on, at}
 *   POST /off                  맡긴 열쇠를 지운다
 *   POST /ads    {owner, sun}  그 주일 광고 — owner(로테이션 주인 = HB) 본인이거나, rota/{owner} 의 team 에 든 교역자만.
 *                              owner 의 열쇠로 읽는다.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const C = require("./monday-core");

const REGION = "asia-northeast3";
const API = "https://api.monday.com/v2";
const keyDoc = (uid) => getFirestore().doc(`mondayKeys/${uid}`);

async function who(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return await getAuth().verifyIdToken(h.slice(7)); } catch (e) { return null; }
}

// Monday 에 묻기 — name 은 QUERIES 의 이름만 받는다
async function mon(token, name, variables) {
  const query = C.QUERIES[name];
  if (!query) throw Object.assign(new Error("unknown query"), { code: "bug" });
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(variables ? { query, variables } : { query }),
  });
  let j = {};
  try { j = await r.json(); } catch (e) { /* 빈 응답 */ }
  if (r.status === 401 || r.status === 403) throw Object.assign(new Error("key"), { code: "key" });
  if (!r.ok || j.errors || j.error_message) {
    const m = (j.errors && j.errors[0] && j.errors[0].message) || j.error_message || ("monday " + r.status);
    console.error("monday", name, r.status, String(m).slice(0, 200));
    throw Object.assign(new Error(m), { code: r.status === 429 || /complexity|rate/i.test(m) ? "busy" : "monday" });
  }
  return j.data || {};
}

// 교역자인가 — rota/{owner} 의 team(이메일 목록)에 든 확인된 이메일
async function inTeam(owner, t) {
  if (!t.email || t.email_verified !== true) return false;
  const s = await getFirestore().doc(`rota/${owner}`).get();
  const team = s.exists ? (s.data().team || []) : [];
  return Array.isArray(team) && team.includes(t.email);
}

const MSG = {
  key: "Monday 열쇠가 맞지 않습니다\nHB 가 새 열쇠를 넣어야 합니다",
  nokey: "Monday 열쇠가 아직 없습니다",
  board: "Monday 보드를 찾지 못했습니다\n보드가 바뀌었는지 HB 가 확인해 주세요",
  shape: "Monday 보드 모양이 바뀌었습니다\n('구두 광고' · '방영일' 열을 찾지 못함)",
  busy: "Monday 가 잠시 바쁩니다\n조금 뒤 다시 눌러 주세요",
  monday: "Monday 에서 읽지 못했습니다",
};

exports.monday = onRequest({ region: REGION, cors: true }, async (req, res) => {
  const path = (req.path || "/").replace(/\/+$/, "") || "/";
  if (req.method !== "POST") { res.status(405).json({ error: "POST" }); return; }
  const t = await who(req);
  if (!t) { res.status(401).json({ error: "로그인이 필요합니다" }); return; }
  const body = req.body || {};
  try {
    if (path === "/key") {
      const token = String(body.token || "").trim();
      if (token.length < 20 || token.length > 4000 || /\s/.test(token)) { res.status(400).json({ error: "열쇠 모양이 아닙니다" }); return; }
      const d = await mon(token, "me");
      if (!d.me || !d.me.id) { res.status(400).json({ error: MSG.key }); return; }
      await keyDoc(t.uid).set({ token, me: String(d.me.id), at: Date.now() });
      res.json({ ok: true });
      return;
    }
    if (path === "/status") {
      const s = await keyDoc(t.uid).get();
      res.json({ on: s.exists, at: s.exists ? s.data().at || 0 : 0 });
      return;
    }
    if (path === "/off") {
      await keyDoc(t.uid).delete();
      res.json({ ok: true });
      return;
    }
    if (path === "/ads") {
      const owner = String(body.owner || ""), sun = String(body.sun || "");
      if (!/^[A-Za-z0-9]{6,128}$/.test(owner) || !C.okSun(sun)) { res.status(400).json({ error: "잘못된 요청" }); return; }
      if (owner !== t.uid && !(await inTeam(owner, t))) { res.status(403).json({ error: "이 로테이션의 교역자가 아닙니다" }); return; }
      const k = await keyDoc(owner).get();
      if (!k.exists || !k.data().token) { res.status(404).json({ error: MSG.nokey, code: "nokey" }); return; }
      const token = k.data().token;
      const meta = await mon(token, "meta", { ids: [C.BOARDS.busan, C.BOARDS.video] });
      const p = C.plan(meta.boards, sun);
      if (p.err) { res.status(409).json({ error: MSG[p.err], code: p.err }); return; }
      const w = await mon(token, "week", C.weekVars(p, sun));
      res.json(C.weekOut(w, p, sun));
      return;
    }
    res.status(404).json({ error: "없는 길" });
  } catch (e) {
    const code = e.code || "monday";
    res.status(code === "key" ? 401 : code === "busy" ? 429 : 502).json({ error: MSG[code] || MSG.monday, code });
  }
});
