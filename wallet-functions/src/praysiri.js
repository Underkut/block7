/* 기도노트 시리로 기도 넣기 (2026-10-30) — b7siri 처리기가 /pray 로 들어온 것을 여기로 넘긴다 (함수를 새로 만들지 않는다).
 *
 *   POST /pray/key        로그인 토큰 필요 — 기도노트 설정 '주소 만들기'. 기도노트 열쇠만 새로 (BLOCK7 시리 주소는 그대로)
 *   POST /pray?k=열쇠      단축어 — {list:1[, g]} 이면 목록 글(줄마다 하나) · 아니면 {text, try?, prev?, g?, s?} → 우체통에 쪽지 + 시리 대답
 *
 * 읽는 자리: 그룹 차림표 pray/{uid}/c/siridir (앱이 써 둔다) · 쓰는 자리: 우체통 pray/{uid}/c/inbox (앱 takeInbox 가 꺼낸다)
 * ⚠️ 기도노트 자료 덩어리(pray/{uid} · c/0 …)는 **읽지도 쓰지도 않는다** — 맞추기(3자 병합)는 앱 한 곳에서만.
 * 규칙은 praysiri-core.js (시험: tests/test_praysiri.js).
 */
const crypto = require("crypto");
const C = require("./praysiri-core");
const K = require("./b7siri-core");

const APP = "pray";

async function prayKey(req, res, { db, keys, uidOf }) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST 로 불러 주세요" }); return; }
  const uid = await uidOf(req);
  if (!uid) { res.status(401).json({ error: "로그인이 필요해요" }); return; }
  const key = K.newKey();
  const old = await keys().where("uid", "==", uid).get();
  const b = db().batch();
  old.docs.forEach((d) => { if (d.get("app") === APP) b.delete(d.ref); });   // BLOCK7 열쇠는 그대로
  b.set(keys().doc(K.hashKey(key)), { uid, app: APP, at: Date.now() });
  await b.commit();
  res.json({ key });
}

async function prayTake(req, res, { db, keys, FieldValue }) {
  const say = (r) => { res.set("X-B7-Siri", r.code); res.status(200).type("text/plain; charset=utf-8").send(r.msg); };
  const k = K.keyOf(req);
  if (!K.keyOk(k)) { say(C.REPLY.badKey); return; }
  const ks = await keys().doc(K.hashKey(k)).get();
  const uid = ks.exists && ks.get("app") === APP ? ks.get("uid") : "";
  if (!uid) { say(C.REPLY.badKey); return; }
  const b = C.bodyOf(req);
  const ds = await db().doc(`pray/${uid}/c/siridir`).get();
  const dir = ds.exists ? ds.data() : null;
  if (b.list) { say({ code: "list", msg: C.listText(b, dir) }); return; }
  const d = C.decide(b, dir);
  if (!d.r) { say(d.reply); return; }
  const now = Date.now();
  const it = C.note(d.r, b.prev ? b.prev + " / " + b.text : b.text, now, crypto.randomBytes(3).toString("hex"));
  const box = db().doc(`pray/${uid}/c/inbox`);
  // 우체통이 가득하면 받지 않는다 (외부에서 들어오는 것에는 규모 상한) — 앱이 꺼낼 때(비우기)와 겹쳐도 트랜잭션이 줄을 세운다
  const ok = await db().runTransaction(async (tx) => {
    const s = await tx.get(box);
    const items = (s.exists && s.get("items")) || [];
    if (items.length >= K.MAX_BOX) return false;
    tx.set(box, { items: FieldValue.arrayUnion(it) }, { merge: true });
    return true;
  });
  say(ok ? d.reply : C.REPLY.full);
}

async function pray(req, res, ctx) {
  if ((req.path || "").endsWith("/key")) {
    try { await prayKey(req, res, ctx); } catch (e) { console.warn("praysiri key", e.message); res.status(500).json({ error: String(e.message || e) }); }
    return;
  }
  try { await prayTake(req, res, ctx); } catch (e) {
    console.warn("praysiri", e.message);
    res.set("X-B7-Siri", C.REPLY.fail.code); res.status(200).type("text/plain; charset=utf-8").send(C.REPLY.fail.msg);
  }
}

module.exports = { pray, APP };
