/* 교역자 로테이션 알림 서버 (1123-B B4, HB 2026-11-23 결정 E1 ~ E3) — 판단은 rotapush-core.js · 알림 글은 앱과 한 벌(rotation-core.gen.js).
 * 순서 · 까닭: docs/rotation/push-setup.md
 *
 * rotaDue()  studyTick(1분)이 함께 부른다 — rotapush 에서 at <= 지금 인 사람만 묻는다(1분마다 책 · 상태 문서를 통째로 읽지 않음).
 *   보낼 때만 읽는다: rota/{HB}/gs/bteam · gs/bserve(작은 표 둘) · 필요할 때만 책 한 번(내 부산 주만 · 교역자 · 카톡 글) · 카톡 글 프리셋.
 * rotapush (HTTP, 로그인 토큰 필요 · body.team = HB uid)
 *   POST /status {team, token?}        { on, devices, mine, alerts, next, sent, err }
 *   POST /on     {team, token, ua}     이 기기 등록 + 켜기 (알림이 하나도 없으면 기본 '주일 섬김' 하나)
 *   POST /off    {token?}              그 기기만 뺌 (설정은 남김 — 다시 켜면 그대로)
 *   POST /set    {team, alerts}        내 알림 설정 저장 → 다음 때를 다시 셈
 *   POST /test   {team, alert}         그 알림이 다음에 말할 예배의 글을 지금 이 사람 기기 모두에
 *
 * ⚠️ BLOCK7 알림(b7push · users/{uid}/pushTokens)과 섞지 않는다 — 등록 번호는 rotapush/{uid} 에 따로, 워커도 /rotation/sw.js 따로.
 * ⚠️ rotapush/{uid} 는 보안 규칙에 없다(서버만). 책 · 시트 표 · 프리셋은 **읽기만** 한다.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, FieldPath } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");
const C = require("./rotapush-core");
const R = C.R;

const REGION = "asia-northeast3";
const db = () => getFirestore();
const ref = (uid) => db().doc(`rotapush/${uid}`);
let clock = () => Date.now();   // 시험(tests/rules/rotapush.e2e.mjs)이 시계를 바꿔 끼운다 — 전체 Date.now 를 바꾸면 데이터베이스 도구가 깨진다
exports._clock = (f) => { clock = f || (() => Date.now()); };

// 읽기 묶음 — 한 사람 처리 동안 한 번씩만
function ioFor(uid, d) {
  const team = d.team, memo = {};
  const once = (k, f) => (memo[k] = memo[k] || f());
  return {
    member: () => once("m", async () => {
      if (uid === team) return (await db().doc(`rota/${team}`).get()).exists;
      const [top] = await db().getAll(db().doc(`rota/${team}`), { fieldMask: ["team"] });
      return C.memberOk(top.exists ? top.data() : null, { uid, email: d.email, ok: d.ok === true }, team);
    }),
    tables: () => once("t", async () => {
      const [a, b] = await db().getAll(db().doc(`rota/${team}/gs/bteam`), db().doc(`rota/${team}/gs/bserve`));
      return { team: a.exists ? R.gsUnpack(a.data()) : null, serve: b.exists ? R.gsUnpack(b.data()) : null };
    }),
    book: () => once("b", async () => { const s = await db().doc(`rota/${team}`).get(); return s.exists ? R.pickDoc(null, s.data()).book : null; }),
    kts: () => once("k", async () => {
      if (uid === team) { const s = await db().doc(`rota/${team}/kt/hb`).get(); return R.ktList(s.exists ? s.data() : null, null, true); }
      const [sh, my] = await db().getAll(db().doc(`rota/${team}/kt/share`), db().doc(`rota/${team}/kt/${uid}`));
      return R.ktList(sh.exists ? sh.data() : null, my.exists ? my.data() : null, false);
    }),
  };
}
async function sendTo(uid, toks, s) {
  if (!toks.length) return { total: 0, success: 0 };
  const r = await getMessaging().sendEachForMulticast(C.fcmOf(toks, s));
  r.responses.forEach((x, i) => {   // 죽은 등록은 걷어낸다
    const c = (x.error && x.error.code) || "";
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) ref(uid).update(new FieldPath("tokens", toks[i]), FieldValue.delete()).catch(() => {});
  });
  return { total: toks.length, success: r.successCount };
}
// 한 사람 — 먼저 잡고(claim) 나서 보낸다. 틱이 겹쳐도 두 번 보내지 않게 (b7push 와 같은 결)
async function runOne(uid, now) {
  const d = await db().runTransaction(async (tx) => {
    const s = await tx.get(ref(uid));
    if (!s.exists) return null;
    const x = s.data();
    if (x.at == null || x.at > now || (x.claim && x.claim > now - C.CLAIM_MS)) return null;
    tx.update(ref(uid), { claim: now });
    return x;
  });
  if (!d) return;
  let r;
  try { r = await C.runDue(d, now, ioFor(uid, d)); }
  catch (e) { await ref(uid).set({ claim: FieldValue.delete(), err: String(e.message || e).slice(0, 200), at: now + 15 * 60e3 }, { merge: true }); throw e; }
  let sent = 0;
  for (const s of r.sends) { try { sent += (await sendTo(uid, C.tokensOf(d), s)).success; } catch (e) { console.warn("rotapush send", uid.slice(0, 6), e.message); } }
  const patch = Object.assign({ claim: FieldValue.delete() }, r.patch, r.off ? { err: r.off } : sent ? { sent: now, err: FieldValue.delete() } : {});
  await ref(uid).set(patch, { merge: true });
}
exports.rotaDue = async function rotaDue() {
  const now = clock();
  const qs = await db().collection("rotapush").where("at", "<=", now).limit(50).get();
  for (const d of qs.docs) {
    try { await runOne(d.id, now); } catch (e) { console.warn("rotapush run", d.id.slice(0, 6), e.message); }
  }
};

async function whoOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { const t = await getAuth().verifyIdToken(h.slice(7)); return { uid: t.uid, email: String(t.email || "").toLowerCase(), ok: t.email_verified === true }; } catch (e) { return null; }
}
async function teamCheck(who, team) {
  if (!C.teamIdOk(team)) return false;
  if (who.uid === team) return (await db().doc(`rota/${team}`).get()).exists;
  const [top] = await db().getAll(db().doc(`rota/${team}`), { fieldMask: ["team"] });
  return C.memberOk(top.exists ? top.data() : null, who, team);
}
exports.rotapush = onRequest({ region: REGION, cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") { res.status(405).json({ error: "POST" }); return; }
    const who = await whoOf(req);
    if (!who) { res.status(401).json({ error: "로그인이 필요합니다" }); return; }
    const p = (req.path || "/").replace(/\/+$/, ""), b = req.body || {}, now = clock();
    const s = await ref(who.uid).get(), d = s.exists ? s.data() : {};
    const tok = String(b.token || "").slice(0, 4096);
    if (p.endsWith("/status")) { res.json(C.statusOf(d, tok)); return; }
    if (p.endsWith("/off")) {
      if (!s.exists) { res.json({ ok: true }); return; }
      if (tok && C.tokensOf(d).filter((t) => t !== tok).length) await ref(who.uid).update(new FieldPath("tokens", tok), FieldValue.delete());
      else await ref(who.uid).update({ on: false, at: null, tokens: {} });   // 설정(alerts)은 남긴다
      res.json({ ok: true });
      return;
    }
    const team = String(b.team || "");
    if (!(await teamCheck(who, team))) { res.status(403).json({ error: "이 로테이션의 팀 명단에 없습니다\nHB 께 계정 이메일을 확인해 달라고 해 주세요" }); return; }
    const base = { team, email: who.email, ok: who.ok };
    if (p.endsWith("/on")) {
      if (!tok) { res.status(400).json({ error: "기기 등록 번호가 없습니다" }); return; }
      const alerts = Array.isArray(d.alerts) ? R.rpNorm(d.alerts) : [R.rpDefault()];   // 처음이면 기본 '주일 섬김' 하나 · 일부러 다 지웠으면 그대로
      await ref(who.uid).set(Object.assign({}, base, { on: true, tokens: { [tok]: { at: now, ua: String(b.ua || "").slice(0, 80) } }, alerts, at: R.rpNext(alerts, now), last: now, err: FieldValue.delete() }), { merge: true });
      const n = await ref(who.uid).get();
      res.json(C.statusOf(n.data(), tok));
      return;
    }
    if (p.endsWith("/set")) {
      await ref(who.uid).set(Object.assign({}, base, C.setPatch(d, b.alerts, now)), { merge: true });
      const n = await ref(who.uid).get();
      res.json(C.statusOf(n.data(), tok));
      return;
    }
    if (p.endsWith("/test")) {
      const toks = C.tokensOf(d);
      if (!toks.length) { res.status(400).json({ error: "등록된 기기가 없습니다\n이 기기에서 알림을 먼저 켜 주세요" }); return; }
      const m = await C.testMsg(b.alert, now, ioFor(who.uid, Object.assign({}, d, base)), who.email);
      const out = await sendTo(who.uid, toks, m);
      res.json(Object.assign({ date: m.date, title: m.title }, out));
      return;
    }
    res.status(404).json({ error: "없는 길" });
  } catch (e) { console.warn("rotapush", e.message); res.status(500).json({ error: String(e.message || "서버 오류").slice(0, 200) }); }
});
