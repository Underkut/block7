/* BLOCK7 · Sweeter 알림 서버 (2026-10-24) — 용돈 · 공부 친구들 · 타이머와 같은 묶음(codebase: wallet)에 산다.
 *
 * 예전 두 서버를 대신한다:
 *   versepush     (Cloud Run + Cloud Scheduler 1분마다) — 말씀 알림
 *   block7Notify  (functions/, Node 20)                 — 할일 알림 (2026-09 무렵부터 돌지 않았다)
 * 둘 다 1분마다 **모든 사용자의 상태 문서 전체**를 읽었다. 이제는 예약표(b7plan)만 묻는다.
 *
 * b7Due()  1분마다 — 따로 예약 작업을 만들지 않고 studyTick 이 함께 부른다 (타이머와 같은 까닭)
 *   ① b7plan 에서 at <= 지금 인 것만 → 그 사람 상태를 그때 읽어 보내고 다음 시각을 적는다
 *   ② 30분마다 한 번 rev 만 훑는다 → 바뀐 사람만 상태를 읽어 예약을 고친다 (앱이 /replan 을 못 부른 경우의 그물)
 * b7push (HTTP, 로그인 토큰 필요)
 *   GET  /test?delay=8&product=block7|sweeter   설정창 [서버] 시험 — 그 제품 기기에만
 *   POST /replan                                 알림 설정을 바꾼 앱이 부른다 → 다음 틱에 곧바로 다시 계산
 *
 * ⚠️ users/{uid} 는 **읽기만** 한다. b7plan 은 보안 규칙에 없다 → 앱은 못 읽고 서버(관리자 권한)만 쓴다.
 * 규칙은 b7push-core.js (시험: tests/test_b7push.js).
 */
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");
const C = require("./b7push-core");

const REGION = "asia-northeast3";
const db = () => getFirestore();
const plans = () => db().collection("b7plan");
const stateRef = (uid) => db().doc(`users/${uid}/data/state`);
const CLAIM_MS = 90e3;

async function tokensOf(uid) {
  const qs = await db().collection(`users/${uid}/pushTokens`).get();
  return qs.docs.map((d) => Object.assign({ id: d.id }, d.data()));
}
// 메시지 모양은 예전 versepush 와 같다 — 아이폰 홈 화면 앱에서 늦지 않게 오는 것이 확인된 모양
//   Urgency high (안 주면 애플·구글이 모아 두었다 늦게 배달) · TTL (늦어진 알림은 버려진다)
async function sendMsg(uid, toks, m) {
  const list = toks.filter((t) => C.productOfToken(t) === m.product);
  if (!list.length) return { total: 0, success: 0, errors: [] };
  const data = m.kind === "verse" ? { type: "verse", ref: m.ref } : { type: m.kind, tag: m.tag };
  const r = await getMessaging().sendEachForMulticast({
    tokens: list.map((t) => t.id),
    notification: { title: m.title, body: m.body },
    data,
    webpush: { headers: { Urgency: "high", TTL: String(m.ttl) }, fcmOptions: { link: m.link }, notification: { tag: m.tag } },
    android: { priority: "high", ttl: m.ttl * 1000 },
  });
  const errors = [];
  r.responses.forEach((x, i) => {
    const c = (x.error && x.error.code) || "";
    if (!c) return;
    errors.push(c);
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) {
      db().doc(`users/${uid}/pushTokens/${list[i].id}`).delete().catch(() => {});
    }
  });
  return { total: list.length, success: r.successCount, errors };
}

// 한 사람 처리 — 먼저 '잡고'(claim) 나서 보낸다. 틱이 겹쳐도 두 번 보내지 않게
async function runOne(uid, now) {
  const ref = plans().doc(uid);
  const plan = await db().runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!s.exists) return null;
    const p = s.data();
    if (p.at == null || p.at > now) return null;
    if (p.claim && p.claim > now - CLAIM_MS) return null;
    tx.update(ref, { claim: now });
    return p;
  });
  if (!plan) return;
  const snap = await stateRef(uid).get();
  const raw = snap.exists ? snap.data() : null;
  const st = C.parseState(raw);
  if (!st) { await ref.delete(); return; }
  const r = C.process(st, plan, now);
  if (r.sends.length) {
    const toks = await tokensOf(uid);
    for (const m of r.sends) {
      try { await sendMsg(uid, toks, m); } catch (e) { console.warn("b7push send", uid, e.message); }
    }
  }
  await ref.set(Object.assign({}, r.plan, { rev: (raw && raw.rev) || 0, upd: now }));
}

// 30분마다 — rev 만 읽어(fieldMask) 바뀐 사람만 상태 전체를 읽는다
async function rescan(now) {
  const users = await db().collection("users").listDocuments();
  const have = new Map((await plans().get()).docs.map((d) => [d.id, d.data()]));
  for (let i = 0; i < users.length; i += 100) {
    const refs = users.slice(i, i + 100).map((u) => u.collection("data").doc("state"));
    const snaps = await db().getAll(...refs, { fieldMask: ["rev"] });
    for (const s of snaps) {
      const uid = s.ref.parent.parent.id;
      const p = have.get(uid);
      if (!s.exists) { if (p) await plans().doc(uid).delete().catch(() => {}); continue; }
      const rev = s.get("rev") || 0;
      if (p && p.rev === rev) continue;
      try {
        const full = await stateRef(uid).get();
        const st = C.parseState(full.data());
        if (!st) continue;
        const r = C.replan(st, p, now);
        const out = Object.assign({}, r.plan, { rev: full.get("rev") || 0, upd: now });
        delete out.claim;
        await plans().doc(uid).set(out);
      } catch (e) { console.warn("b7push rescan", uid, e.message); }
    }
  }
}

// 새로 올린 직후(인스턴스가 처음 뜰 때)에도 한 번 훑는다 — 그래야 서버를 올리고 30분을 기다리지 않는다
let lastScan = 0;
exports.b7Due = async function b7Due() {
  const now = Date.now();
  const qs = await plans().where("at", "<=", now).limit(200).get();
  for (const d of qs.docs) {
    try { await runOne(d.id, now); } catch (e) { console.warn("b7push run", d.id, e.message); }
  }
  if (!lastScan || C.minOf(now) % 30 === 0) { lastScan = now; await rescan(now); }
};

async function uidOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return (await getAuth().verifyIdToken(h.slice(7))).uid; } catch (e) { return null; }
}

exports.b7push = onRequest({ region: REGION, cors: true }, async (req, res) => {
  try {
    const uid = await uidOf(req);
    if (!uid) { res.status(401).json({ error: "로그인이 필요해요" }); return; }
    const p = req.path || "";
    if (p.endsWith("/replan")) {
      // 다음 틱(1분 안)에 지금 상태로 다시 계산한다. 앱의 저장이 클라우드에 닿은 뒤에 읽게 된다.
      await plans().doc(uid).set({ at: Date.now() }, { merge: true });
      res.json({ ok: true });
      return;
    }
    if (p.endsWith("/test")) {
      const product = req.query.product === "sweeter" ? "sweeter" : "block7";
      const toks = await tokensOf(uid);
      if (!toks.some((t) => C.productOfToken(t) === product)) {
        res.status(400).json({ error: "등록된 기기가 없어요 (알림 스위치를 껐다 켜 보세요)" });
        return;
      }
      const delay = Math.min(parseInt(req.query.delay || "0", 10) || 0, 15);
      if (delay > 0) await new Promise((r) => setTimeout(r, delay * 1000));
      const w = C.wall(C.minOf(Date.now()));
      const hhmm = String(Math.floor(w.hm / 60)).padStart(2, "0") + ":" + String(w.hm % 60).padStart(2, "0");
      const out = await sendMsg(uid, toks, {
        product, kind: "test", tag: product + "-test", ttl: 300, link: C.APP[product], ref: "",
        title: (product === "sweeter" ? "Sweeter" : "BLOCK7") + " 시험 알림",
        body: `알림 길이 정상이에요 (${hhmm} 발송)`,
      });
      res.json(out);
      return;
    }
    res.status(404).send("?");
  } catch (e) {
    console.warn("b7push", e.message);
    res.status(500).json({ error: String(e.message || e) });
  }
});
