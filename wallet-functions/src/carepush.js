/* 심방 노트 'ChatGPT 가 보낸 기록' 알림 — 서버 (규칙은 carepush-core.js). docs/care/push-setup.md
 *
 *   POST /on      { token, ua }   이 기기 등록 + 켜기 (처음 켤 때 이미 있는 대기 줄은 알리지 않는다)
 *   POST /off     { token? }      token 이 있으면 그 기기만, 없으면 모두 끔
 *   POST /status                  { on, devices, last, err }
 *   POST /test                    등록된 기기에 시험 알림
 * careDue()        studyTick(1분)이 함께 부른다 → 10분에 한 번만 실제로 읽는다
 *
 * carepush/{uid} = { on, tokens: {토큰: {at, ua}}, seen: [열쇠…], last, err } — 보안 규칙에 없음 = 서버만 읽고 쓴다.
 * 시트는 **읽기만**(GET 하나). 구글 열쇠는 gcal 이 맡아 둔 것(gcalTokens/{uid})을 그대로 쓴다 — 새 권한 없음.
 * ⚠️ 심방 내용을 Firestore · 로그 · 알림에 남기지 않는다. 남는 것은 대기 줄 열쇠(원본ID · 해시)뿐.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore, FieldValue, FieldPath } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");
const C = require("./carepush-core");

const REGION = "asia-northeast3";
const CLIENT_ID = defineSecret("GCAL_CLIENT_ID");
const CLIENT_SECRET = defineSecret("GCAL_CLIENT_SECRET");
const SECRETS = [CLIENT_ID, CLIENT_SECRET];
const db = () => getFirestore();
const ref = (uid) => db().doc(`carepush/${uid}`);

async function accessOf(uid) {
  const t = await db().doc(`gcalTokens/${uid}`).get();
  if (!t.exists || !t.get("rt")) throw Object.assign(new Error("구글 연결이 없습니다"), { gone: true });
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ refresh_token: t.get("rt"), client_id: String(CLIENT_ID.value() || "").trim(), client_secret: String(CLIENT_SECRET.value() || "").trim(), grant_type: "refresh_token" }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw Object.assign(new Error("구글 열쇠를 받지 못했습니다 (" + r.status + ")"), { gone: r.status === 400 || r.status === 401 });
  return j.access_token;
}
async function readWaiting(uid) {
  const cfg = await db().doc(`users/${uid}/data/care`).get(), sheet = cfg.exists && cfg.get("sheet");
  if (!sheet || !sheet.id) throw Object.assign(new Error("고른 심방 시트가 없습니다"), { gone: true });
  const r = await fetch(C.sheetUrl(sheet.id), { headers: { Authorization: "Bearer " + (await accessOf(uid)) } });
  if (r.status === 400) return [];   // 'AI 입력대기' 탭이 아직 없다
  if (!r.ok) throw Object.assign(new Error("시트를 읽지 못했습니다 (" + r.status + ")"), { gone: r.status === 403 || r.status === 404 });
  return C.waiting((await r.json()).values || []);
}
async function sendTo(uid, toks, m) {
  if (!toks.length) return { total: 0, success: 0 };
  const r = await getMessaging().sendEachForMulticast({
    tokens: toks, notification: { title: m.title, body: m.body }, data: { type: "care", url: m.link },
    webpush: { headers: { Urgency: "high", TTL: "86400" }, fcmOptions: { link: m.link }, notification: { tag: m.tag, icon: "https://sweeter.my/care/icon-192.png" } },
  });
  r.responses.forEach((x, i) => {   // 죽은 등록은 걷어낸다
    const c = (x.error && x.error.code) || "";
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) ref(uid).update(new FieldPath("tokens", toks[i]), FieldValue.delete()).catch(() => {});
  });
  return { total: toks.length, success: r.successCount };
}
async function runOne(uid, d, now) {
  const toks = Object.keys(d.tokens || {});
  if (!toks.length) return;
  let list;
  try { list = await readWaiting(uid); }
  catch (e) {
    if (e.gone) {   // 연결이 끊겼다 → 끄고 한 번 알린다. 계속 두드리지 않는다
      await ref(uid).set({ on: false, err: e.message, last: now }, { merge: true });
      await sendTo(uid, toks, { title: "심방 노트 알림이 꺼졌습니다", body: e.message + " — 설정 › 연결에서 다시 켜 주세요", link: "https://sweeter.my/care/", tag: "care-off" });
      return;
    }
    throw e;
  }
  const r = C.diff(d.seen == null ? null : d.seen, list), m = C.messageOf(r.fresh);
  if (m) await sendTo(uid, toks, m);
  await ref(uid).set({ seen: r.seen, last: now, err: FieldValue.delete() }, { merge: true });
}
exports.careDue = async function careDue() {
  const now = Date.now();
  if (!C.due(now)) return;
  const qs = await db().collection("carepush").where("on", "==", true).limit(50).get();
  for (const d of qs.docs) {
    try { await runOne(d.id, d.data(), now); }
    catch (e) { console.warn("carepush run", d.id, e.message); await d.ref.set({ err: String(e.message || e).slice(0, 200) }, { merge: true }).catch(() => {}); }
  }
};
exports.SECRETS = SECRETS;

async function uidOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return (await getAuth().verifyIdToken(h.slice(7))).uid; } catch (e) { return null; }
}
exports.carepush = onRequest({ region: REGION, cors: true, secrets: SECRETS }, async (req, res) => {
  try {
    const uid = await uidOf(req);
    if (!uid) { res.status(401).json({ error: "로그인이 필요해요" }); return; }
    const p = req.path || "", s = await ref(uid).get(), d = s.exists ? s.data() : {};
    if (p.endsWith("/on")) {
      const tok = String((req.body && req.body.token) || "");
      if (!tok || tok.length > 4096) { res.status(400).json({ error: "기기 등록 번호가 없습니다" }); return; }
      const patch = { on: true, tokens: { [tok]: { at: Date.now(), ua: String((req.body && req.body.ua) || "").slice(0, 80) } }, err: FieldValue.delete() };
      if (!d.on || d.seen == null) patch.seen = C.diff(null, await readWaiting(uid)).seen;   // 이미 있던 대기 줄은 알리지 않는다
      await ref(uid).set(patch, { merge: true });
      res.json({ ok: true, devices: Object.keys(Object.assign({}, d.tokens, patch.tokens)).length });
      return;
    }
    if (p.endsWith("/off")) {
      const tok = String((req.body && req.body.token) || "");
      if (tok && Object.keys(d.tokens || {}).filter((t) => t !== tok).length) await ref(uid).update(new FieldPath("tokens", tok), FieldValue.delete());
      else await ref(uid).delete();
      res.json({ ok: true });
      return;
    }
    if (p.endsWith("/status")) { res.json({ on: !!d.on, devices: Object.keys(d.tokens || {}).length, last: d.last || 0, err: d.err || "" }); return; }
    if (p.endsWith("/test")) {
      const out = await sendTo(uid, Object.keys(d.tokens || {}), { title: "심방 노트 시험 알림", body: "ChatGPT 가 기록을 보내면 이렇게 알려 드립니다", link: C.APP_URL, tag: "care-test" });
      if (!out.total) { res.status(400).json({ error: "등록된 기기가 없습니다 (이 기기에서 알림을 먼저 켜 주세요)" }); return; }
      res.json(out);
      return;
    }
    res.status(404).send("?");
  } catch (e) { console.warn("carepush", e.message); res.status(e.gone ? 400 : 500).json({ error: e.message || "서버 오류" }); }
});
