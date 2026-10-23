/* BLOCK7 구글 캘린더 연결 서버 — BLOCK7 함수(functions/)와 따로 둔 묶음(codebase: gcal)
 *
 * 하는 일은 **열쇠 맡기기** 하나뿐이다. 일정을 읽고 쓰고 합치는 일은 전부 앱이 한다.
 * ⚠️ 이 서버는 사용자 상태(users/{uid})를 절대 읽거나 쓰지 않는다 — 병합이 두 군데가 되면 깨진다.
 *
 * gcal (HTTP, asia-northeast3)
 *   POST /start  {ret}  (Bearer 파이어베이스 ID 토큰)  구글 동의 화면 주소를 만들어 준다
 *   GET  /cb            구글이 돌려보내는 자리 → 갱신 토큰을 gcalTokens/{uid} 에 맡기고 앱으로 돌려보낸다
 *   POST /token         (Bearer) 한 시간짜리 열쇠(access token)를 새로 받아 준다
 *   POST /status        (Bearer) 연결됐는지 · 어느 구글 계정인지
 *   POST /off           (Bearer) 연결 끊기 — 구글에 열쇠를 돌려주고 지운다
 *
 * 비밀 두 개(HB 가 Cloud Shell 에서 한 번 넣는다 — docs/gcal/setup.md):
 *   GCAL_CLIENT_ID · GCAL_CLIENT_SECRET  (구글 클라우드 '사용자 인증 정보' 의 OAuth 클라이언트)
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const crypto = require("crypto");

initializeApp();
const db = getFirestore();
const REGION = "asia-northeast3";
const CLIENT_ID = defineSecret("GCAL_CLIENT_ID");
const CLIENT_SECRET = defineSecret("GCAL_CLIENT_SECRET");
const SCOPES = [
  "openid", "email",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];
const APP_DEFAULT = "https://block7.my/";
// 돌아갈 주소는 BLOCK7 운영본 자리만 받는다 (아무 데로나 돌려보내는 문이 되지 않게)
const okRet = (u) => typeof u === "string" && /^https:\/\/(block7\.my|underkut\.github\.io\/block7)\//.test(u);
const redirectUri = () => `https://${REGION}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/gcal/cb`;

async function uidOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return (await getAuth().verifyIdToken(h.slice(7))).uid; } catch (e) { return null; }
}
async function google(url, params) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  let j = {};
  try { j = await r.json(); } catch (e) { /* 빈 응답 */ }
  return { ok: r.ok, status: r.status, j };
}
function back(res, ret, result) {
  const u = new URL(okRet(ret) ? ret : APP_DEFAULT);
  u.searchParams.set("gcal", result);
  res.redirect(302, u.toString());
}

exports.gcal = onRequest(
  { region: REGION, cors: true, secrets: [CLIENT_ID, CLIENT_SECRET] },
  async (req, res) => {
    const path = (req.path || "/").replace(/\/+$/, "") || "/";
    try {
      // ── 구글 동의 화면에서 돌아오는 자리 (로그인 토큰 없이 온다 → state 로 누구인지 안다)
      if (path === "/cb") {
        const st = String(req.query.state || "");
        const ref = st ? db.doc(`gcalStates/${st.replace(/[^a-zA-Z0-9]/g, "")}`) : null;
        const snap = ref ? await ref.get() : null;
        const s = snap && snap.exists ? snap.data() : null;
        if (ref && s) await ref.delete();
        if (!s || s.exp < Date.now()) { back(res, s && s.ret, "expired"); return; }
        if (req.query.error || !req.query.code) { back(res, s.ret, "cancel"); return; }
        const t = await google("https://oauth2.googleapis.com/token", {
          code: String(req.query.code), client_id: CLIENT_ID.value(), client_secret: CLIENT_SECRET.value(),
          redirect_uri: redirectUri(), grant_type: "authorization_code",
        });
        if (!t.ok || !t.j.refresh_token) { console.error("gcal code exchange", t.status, t.j); back(res, s.ret, "err"); return; }
        let email = "";
        try { email = JSON.parse(Buffer.from(String(t.j.id_token).split(".")[1], "base64url").toString()).email || ""; } catch (e) { /* 없어도 된다 */ }
        await db.doc(`gcalTokens/${s.uid}`).set({ rt: t.j.refresh_token, email, at: Date.now() });
        back(res, s.ret, "ok");
        return;
      }

      if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
      const uid = await uidOf(req);
      if (!uid) { res.status(401).json({ error: "no auth" }); return; }
      const tokRef = db.doc(`gcalTokens/${uid}`);

      if (path === "/start") {
        const ret = okRet(req.body && req.body.ret) ? req.body.ret : APP_DEFAULT;
        const state = crypto.randomBytes(18).toString("hex");
        await db.doc(`gcalStates/${state}`).set({ uid, ret, exp: Date.now() + 15 * 60e3 });
        const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        u.search = new URLSearchParams({
          client_id: CLIENT_ID.value(), redirect_uri: redirectUri(), response_type: "code",
          scope: SCOPES.join(" "), access_type: "offline", prompt: "consent",
          include_granted_scopes: "true", state,
        }).toString();
        res.json({ url: u.toString() });
        return;
      }

      const snap = await tokRef.get();
      const tok = snap.exists ? snap.data() : null;

      if (path === "/status") { res.json({ connected: !!tok, email: tok ? tok.email || "" : "" }); return; }

      if (path === "/token") {
        if (!tok) { res.status(404).json({ error: "not connected" }); return; }
        const t = await google("https://oauth2.googleapis.com/token", {
          refresh_token: tok.rt, client_id: CLIENT_ID.value(), client_secret: CLIENT_SECRET.value(), grant_type: "refresh_token",
        });
        if (!t.ok) {
          // 사용자가 구글 쪽에서 권한을 거둬 갔다 → 맡긴 열쇠도 버린다. 앱은 '다시 연결' 을 보여 준다
          if (t.j.error === "invalid_grant") { await tokRef.delete(); res.status(404).json({ error: "revoked" }); return; }
          console.error("gcal refresh", t.status, t.j);
          res.status(502).json({ error: "google" });
          return;
        }
        res.json({ access_token: t.j.access_token, expires_in: t.j.expires_in || 3600, email: tok.email || "" });
        return;
      }

      if (path === "/off") {
        if (tok) {
          await google("https://oauth2.googleapis.com/revoke", { token: tok.rt }).catch(() => {});
          await tokRef.delete();
        }
        res.json({ ok: true });
        return;
      }

      res.status(404).json({ error: "unknown path" });
    } catch (e) {
      console.error("gcal", path, e);
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);
