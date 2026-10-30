/* 시리로 할일 넣기 (2026-10-25) — 아이폰 '단축어' 가 들은 말을 여기로 보낸다. 묶음(codebase: wallet)에 함께 산다.
 *
 * b7siri (HTTP)
 *   POST /key            로그인 토큰 필요 — 앱 설정 '주소 만들기'. 새 열쇠를 주고 그 사람의 옛 열쇠는 지운다
 *   POST|GET ?k=열쇠      단축어 — 본문 {text}(또는 양식 · 글 그대로 · ?t=) → 쪽지함에 한 줄, 시리가 읽을 글로 대답
 *   /pray …               기도노트 시리로 기도 넣기 (2026-10-30) — praysiri.js 가 맡는다
 *
 * 열쇠는 앱마다 하나 — b7siri/{해시} 의 app('pray', 없으면 BLOCK7). 한 앱에서 새로 만들어도 다른 앱 주소는 그대로이고,
 * 한 앱의 열쇠로 다른 앱 주소에 보내면 '주소가 맞지 않다'.
 *
 * 쪽지함은 기도노트 '할일로 보내기' 와 같은 pray/{uid}/c/b7inbox — 앱이 열려 있으면 곧바로, 아니면 다음에 열 때 꺼내 넣는다.
 * ⚠️ users/{uid} 는 **읽지도 쓰지도 않는다** (데이터 계층은 앱 한 곳). b7siri 는 보안 규칙에 없다 → 앱은 못 읽고 서버만.
 * 규칙은 b7siri-core.js (시험: tests/test_b7siri.js).
 */
const crypto = require("crypto");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const C = require("./b7siri-core");
const P = require("./praysiri");

const REGION = "asia-northeast3";
const db = () => getFirestore();
const keys = () => db().collection("b7siri");

async function uidOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return (await getAuth().verifyIdToken(h.slice(7))).uid; } catch (e) { return null; }
}

exports.b7siri = onRequest({ region: REGION, cors: true }, async (req, res) => {
  const p = req.path || "";
  if (/^\/pray(\/|$)/.test(p)) { await P.pray(req, res, { db, keys, uidOf, FieldValue }); return; }
  if (p.endsWith("/key")) {
    try {
      if (req.method !== "POST") { res.status(405).json({ error: "POST 로 불러 주세요" }); return; }
      const uid = await uidOf(req);
      if (!uid) { res.status(401).json({ error: "로그인이 필요해요" }); return; }
      const key = C.newKey();
      const old = await keys().where("uid", "==", uid).get();
      const b = db().batch();
      old.docs.forEach((d) => { if (!d.get("app")) b.delete(d.ref); });   // 기도노트 열쇠(app:'pray')는 그대로
      b.set(keys().doc(C.hashKey(key)), { uid, at: Date.now() });
      await b.commit();
      res.json({ key });
    } catch (e) {
      console.warn("b7siri key", e.message);
      res.status(500).json({ error: String(e.message || e) });
    }
    return;
  }
  const say = (r) => { res.set("X-B7-Siri", r.code); res.status(200).type("text/plain; charset=utf-8").send(r.msg); };
  try {
    const k = C.keyOf(req);
    if (!C.keyOk(k)) { say(C.REPLY.badKey); return; }
    const text = C.textOf(req);
    if (!text) { say(C.REPLY.noText); return; }
    const ks = await keys().doc(C.hashKey(k)).get();
    const uid = ks.exists && !ks.get("app") ? ks.get("uid") : "";   // 기도노트 열쇠로는 할일을 넣지 않는다
    if (!uid) { say(C.REPLY.badKey); return; }
    const now = Date.now();
    const box = db().doc(`pray/${uid}/c/b7inbox`);
    const it = C.item(text, now, crypto.randomBytes(3).toString("hex"));
    // 쪽지함이 가득하면 받지 않는다 (외부에서 들어오는 것에는 규모 상한). 앱이 꺼낼 때(비우기)와 겹쳐도 트랜잭션이 줄을 세운다
    const ok = await db().runTransaction(async (tx) => {
      const s = await tx.get(box);
      const items = (s.exists && s.get("items")) || [];
      if (items.length >= C.MAX_BOX) return false;
      tx.set(box, { items: FieldValue.arrayUnion(it) }, { merge: true });
      return true;
    });
    say(ok ? C.REPLY.ok(text) : C.REPLY.full);
  } catch (e) {
    console.warn("b7siri", e.message);
    say(C.REPLY.fail);
  }
});
