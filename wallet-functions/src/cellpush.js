/* 셀 inside 새 코멘트 알림 서버 (L4 · HB 동의 2026-11-07) — 용돈 · 공부 · BLOCK7 알림과 같은 묶음(codebase: wallet)
 *
 * 하는 일: 10분마다 HB 의 셀 케어(남이 만든 앱)를 **읽기만** 해서 처음 보는 담임 · 사모 코멘트가 있으면
 *          셀 inside 를 켜 둔 기기로 푸시한다. 알림에는 '누가 · 어느 셀' 만 — 코멘트 내용은 싣지 않는다.
 *
 * 열쇠: 앱이 '서버 몫' 셀 케어 로그인을 따로 하나 만들어(이메일 코드) 그 refresh 열쇠를 /link 로 맡긴다.
 *       ⚠️ 앱 자신의 열쇠를 넘기지 않는 까닭 — 수파베이스는 같은 refresh 열쇠를 두 곳에서 쓰면 도난으로 보고
 *          그 로그인 묶음을 통째로 끊는다(앱까지 로그아웃). 그래서 서버 몫은 따로.
 *       맡긴 열쇠는 cellpush/{uid} 에만 — 보안 규칙에 이 칸이 없어 **앱도 못 읽고 서버(관리자)만** 읽는다.
 *       수파베이스는 쓸 때마다 새 열쇠를 주므로(돌려쓰기) 받자마자 바꿔 적는다.
 *
 * cellpush (HTTP, BLOCK7 로그인 토큰 필요)
 *   POST /link {rt}   서버 몫 열쇠 맡기기 → 한 번 써 봐서 되는지 확인하고 적는다 (지금 있는 코멘트는 '본 것' 으로)
 *   POST /off         알림 끄기 → 맡긴 열쇠를 지운다
 *   GET  /status      켜졌나 · 마지막으로 본 때 · 문제
 *   GET  /test        이 계정의 셀 inside 기기로 시험 알림
 * cellDue()          studyTick(1분)이 함께 부른다 → 10분에 한 번만 실제로 묻는다
 * 기기 등록: cellbook/{uid} 의 push.tokens.{토큰} (앱이 적는다 — 그 문서는 원래 HB 만 읽고 쓰는 칸)
 * 규칙은 cellpush-core.js (시험: tests/test_cellpush.js)
 */
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, FieldPath } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");
const C = require("./cellpush-core");

const REGION = "asia-northeast3";
const db = () => getFirestore();
const keyRef = (uid) => db().doc(`cellpush/${uid}`);
const bookRef = (uid) => db().doc(`cellbook/${uid}`);

async function call(req) {
  const r = await fetch(req.url, req.init);
  const j = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error((j && (j.message || j.error_description || j.msg || j.error)) || ("셀 케어 " + r.status)); e.status = r.status; throw e; }
  return j;
}
// 열쇠로 들어가기 — 새 열쇠를 곧바로 적는다(다음 번엔 새 것만 통한다)
async function signIn(uid, rt) {
  const j = await call(C.refreshReq(rt));
  if (!j || !j.access_token || !j.refresh_token) throw new Error("셀 케어 로그인 답이 이상합니다");
  await keyRef(uid).set({ rt: j.refresh_token, upd: Date.now() }, { merge: true });
  return j.access_token;
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  const work = async () => { while (i < items.length) { const k = i++; try { out[k] = await fn(items[k]); } catch (e) { out[k] = null; } } };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, work));
  return out;
}
// 지금 보이는 코멘트 전부 (이번 주 · 지난주 · 내 담당 셀 · 낸 보고서)
async function fetchComments(access, now) {
  const ctx = await call(C.rpcReq("get_my_context", {}, access));
  const me = ctx && ctx.profile && ctx.profile.id; const today = (ctx && ctx.today) || C.seoulDay(now);
  const weeks = C.weeksToCheck(now);
  const [asg, ...rows] = await Promise.all([
    me ? call(C.asgReq(me, access)).catch(() => []) : [],
    ...weeks.map((w) => call(C.rpcReq("get_week_status", { p_week_start: w }, access)).catch(() => [])),
  ]);
  const reps = C.reportsToCheck(rows, asg, me, today);
  const lists = await pool(reps, 4, (r) => call(C.rpcReq("senior_comment_list", { p_report: r.id }, access)));
  const out = [];
  reps.forEach((r, i) => (lists[i] || []).forEach((c) => out.push(Object.assign({}, c, { _cell: r.cell }))));
  return out;
}

async function tokensOf(uid) {
  const s = await bookRef(uid).get();
  return Object.keys((s.exists && s.get("push.tokens")) || {});
}
async function sendTo(uid, m) {
  const toks = await tokensOf(uid);
  if (!toks.length) return { total: 0, success: 0 };
  const r = await getMessaging().sendEachForMulticast({
    tokens: toks,
    notification: { title: m.title, body: m.body },
    data: { type: "cell", url: m.link },
    webpush: { headers: { Urgency: "high", TTL: "86400" }, fcmOptions: { link: m.link }, notification: { tag: m.tag, icon: "https://sweeter.my/cell/icon-192.png" } },
  });
  r.responses.forEach((x, i) => {   // 죽은 등록은 걷어낸다
    const c = (x.error && x.error.code) || "";
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) {
      bookRef(uid).update(new FieldPath("push", "tokens", toks[i]), FieldValue.delete()).catch(() => {});
    }
  });
  return { total: toks.length, success: r.successCount };
}

async function runOne(uid, d, now) {
  let access;
  try { access = await signIn(uid, d.rt); }
  catch (e) {
    // 열쇠가 끊겼다(셀 케어에서 '모든 기기 로그아웃' 등) → 끄고 한 번 알린다. 계속 두드리지 않는다
    if (e.status === 400 || e.status === 401) {
      await keyRef(uid).set({ on: false, rt: FieldValue.delete(), err: "셀 케어 로그인이 끊겼습니다", upd: now }, { merge: true });
      await sendTo(uid, { title: "셀 inside 알림이 꺼졌습니다", body: "셀 케어 로그인이 끊겼습니다. 메뉴 › 새 코멘트 알림에서 다시 켜 주세요", link: "https://sweeter.my/cell/", tag: "cell-off" }).catch(() => {});
      return;
    }
    throw e;
  }
  const list = await fetchComments(access, now);
  const r = C.diffComments(d.seen == null ? null : d.seen, list);
  const m = C.messageOf(r.fresh);
  if (m) await sendTo(uid, m);
  await keyRef(uid).set({ seen: r.seen, last: now, err: FieldValue.delete() }, { merge: true });
}

exports.cellDue = async function cellDue() {
  const now = Date.now();
  if (!C.due(now)) return;
  const qs = await db().collection("cellpush").where("on", "==", true).limit(50).get();
  for (const d of qs.docs) {
    try { await runOne(d.id, d.data(), now); }
    catch (e) { console.warn("cellpush run", d.id, e.message); await d.ref.set({ err: String(e.message || e).slice(0, 200) }, { merge: true }).catch(() => {}); }
  }
};

async function uidOf(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return null;
  try { return (await getAuth().verifyIdToken(h.slice(7))).uid; } catch (e) { return null; }
}

exports.cellpush = onRequest({ region: REGION, cors: true }, async (req, res) => {
  try {
    const uid = await uidOf(req);
    if (!uid) { res.status(401).json({ error: "로그인이 필요해요" }); return; }
    const p = req.path || "";
    if (p.endsWith("/link")) {
      const rt = String((req.body && req.body.rt) || "");
      if (!rt) { res.status(400).json({ error: "열쇠가 없습니다" }); return; }
      const access = await signIn(uid, rt).catch((e) => { throw Object.assign(new Error("셀 케어 로그인을 확인하지 못했습니다 — " + e.message), { status: 400 }); });
      const list = await fetchComments(access, Date.now());
      await keyRef(uid).set({ on: true, seen: C.diffComments(null, list).seen, last: Date.now(), at: Date.now(), err: FieldValue.delete() }, { merge: true });
      res.json({ ok: true, now: list.length });
      return;
    }
    if (p.endsWith("/off")) { await keyRef(uid).delete(); res.json({ ok: true }); return; }
    if (p.endsWith("/status")) {
      const s = await keyRef(uid).get(); const d = s.exists ? s.data() : {};
      res.json({ on: !!d.on, last: d.last || 0, err: d.err || "", devices: (await tokensOf(uid)).length });
      return;
    }
    if (p.endsWith("/test")) {
      const out = await sendTo(uid, { title: "셀 inside 시험 알림", body: "새 코멘트가 오면 이렇게 알려 드립니다", link: C.APP_URL, tag: "cell-test" });
      if (!out.total) { res.status(400).json({ error: "등록된 기기가 없습니다 (이 기기에서 알림을 먼저 켜 주세요)" }); return; }
      res.json(out);
      return;
    }
    res.status(404).send("?");
  } catch (e) {
    console.warn("cellpush", e.message);
    res.status(e.status || 500).json({ error: String(e.message || e) });
  }
});
