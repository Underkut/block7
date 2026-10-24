/* 공부 친구들 알림 서버 (S-3·S-4) — 용돈 친구들 서버와 같은 묶음(codebase: wallet)에 산다.
 *
 * studyTick (1분마다, 서울)  sremind/{id} 중 시각이 된 것을 아이 폰에 푸시하고 지운다.
 *                           타이머(KAIROS) 잠금 화면 알림도 같은 틱에서 함께 돈다 (timer.js · timerDue).
 *                           BLOCK7·Sweeter 말씀 · 할일 알림도 (b7push.js · b7Due).
 *                           알림에는 [시작] [미루기] 단추가 붙는다(안드로이드). 2시간 넘게 밀린 것은 보내지 않고 지운다.
 * studyPing (HTTP)
 *   POST /report  {fid, kidId, sid}  아이가 공부를 보냈다 → 부모님께
 *   POST /review  {fid, id}          부모님이 확인했다 → 아이에게
 *   POST /promise {fid, kidId, pid}  아이가 약속을 다 모았다 → 부모님께
 *   POST /kidpw   {fid, uid, pin}    부모님이 아이 계정의 숫자 6자리를 다시 정한다 (클라이언트로는 남의 비밀번호를 못 바꾼다)
 * 공부 친구들의 알림 토큰은 members/{uid}.stokens — 용돈 친구들(tokens)과 따로 둔다(다른 서비스워커로 가야 해서).
 */
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");

const REGION = "asia-northeast3";
const APP = "https://block7.my/study/";
const SUBJ = { kor: "국어", math: "수학", eng: "영어", sci: "과학", soc: "사회", etc: "기타" };
const db = () => getFirestore();

async function sendTo(fid, ms, msg) {
  const toks = []; ms.forEach((m) => (m.stokens || []).forEach((t) => toks.push({ t, uid: m.uid })));
  if (!toks.length) return 0;
  try {
    const r = await getMessaging().sendEachForMulticast(Object.assign({ tokens: toks.map((x) => x.t) }, msg));
    const dead = [];
    r.responses.forEach((x, i) => { const c = x.error && x.error.code; if (c && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) dead.push(toks[i]); });
    await Promise.all(dead.map((d) => db().doc(`families/${fid}/members/${d.uid}`).update({ stokens: FieldValue.arrayRemove(d.t) }).catch(() => {})));
    return r.successCount;
  } catch (e) { console.warn("study push", e.message); return 0; }
}
const plain = (title, body, url, tag) => ({
  notification: { title, body },
  webpush: { fcmOptions: { link: url }, notification: { icon: APP + "icon-192.png", tag: tag || "study" } },
  data: { url },
});
async function members(fid) { const qs = await db().collection(`families/${fid}/members`).get(); return qs.docs.map((d) => Object.assign({ uid: d.id }, d.data())); }

/* 공부 기록 하나를 사람 말로 */
function sessLine(st, sid) {
  const s = (st.sessions || []).find((x) => x.id === sid); if (!s) return null;
  const b = (st.books || []).find((x) => "b:" + x.id === s.key), t = !b ? (st.tasks || []).find((x) => "t:" + x.id === s.key) : null;
  const h = String(s.key).startsWith("h:") ? (st.hw || []).find((x) => "h:" + x.id === s.key) || { title: s.ht, subj: s.hs } : null;   // 오늘의 숙제 (샤론 1024 ②)
  const k = (b || t || h || {}).subj, own = (st.subjects || []).find((x) => x.k === k);   // 아이가 직접 만든 과목
  const subj = SUBJ[k] || (own && own.n) || "공부";
  if (h) return { subj, text: "숙제 · " + (h.title || "") };
  const name = b ? b.name : t ? t.title : "";
  const min = Math.round((s.sec || 0) / 60);
  const range = b ? (s.from === s.to ? s.from + "쪽" : s.from + "~" + s.to + "쪽") : "";
  return { subj, text: [name, range, min + "분"].filter(Boolean).join(" · ") };
}

async function onReport(fid, kidId, sid) {
  const sd = await db().doc(`families/${fid}/study/${kidId}`).get(); if (!sd.exists) return { n: 0 };
  let st; try { st = JSON.parse(sd.data().json); } catch (e) { return { n: 0 }; }
  const line = sessLine(st, sid); if (!line) return { n: 0 };
  const name = sd.data().name || "아이";
  const ps = (await members(fid)).filter((m) => m.role === "parent");
  return { n: 1, sent: await sendTo(fid, ps, plain(`${name} · ${line.subj} 공부를 끝냈어요`, line.text + " — 확인해 주세요", APP + "?go=review", "study-rep")) };
}
async function onReview(fid, id) {
  const rd = await db().doc(`families/${fid}/sreviews/${id}`).get(); if (!rd.exists) return { n: 0 };
  const r = rd.data(), who = r.by || "부모님";
  const title = r.status === "ok" ? `${who}가 확인했어요! 별 +${r.stars || 1}` : `${who}: 한 번 더 해 볼까?`;
  const kids = (await members(fid)).filter((m) => m.role === "kid" && m.kidId === r.kidId);
  return { n: 1, sent: await sendTo(fid, kids, plain(title, (r.stamp ? r.stamp + " " : "") + (r.text || ""), APP + "?go=reward", "study-rev")) };
}
async function onPromise(fid, kidId, pid) {
  const pd = await db().doc(`families/${fid}/spromises/${pid}`).get(); if (!pd.exists || pd.data().kidId !== kidId) return { n: 0 };
  const ms = await members(fid), kid = ms.find((m) => m.role === "kid" && m.kidId === kidId);
  return { n: 1, sent: await sendTo(fid, ms.filter((m) => m.role === "parent"), plain(`${(kid && kid.name) || "아이"} · 약속을 다 모았어요!`, pd.data().title + " — 보상 탭에서 허락권을 줄 수 있어요", APP + "?go=review", "study-prm")) };
}

exports.studyPing = onRequest({ region: REGION, cors: true }, async (req, res) => {
  let u;
  try { const h = req.get("Authorization") || ""; u = await getAuth().verifyIdToken(h.startsWith("Bearer ") ? h.slice(7) : ""); }
  catch (e) { res.status(401).send("auth"); return; }
  try {
    if (req.method !== "POST") { res.status(405).send("POST"); return; }
    const b = req.body || {}; const fid = String(b.fid || "");
    const me = fid ? await db().doc(`families/${fid}/members/${u.uid}`).get() : null;
    if (!me || !me.exists) { res.status(403).send("not a member"); return; }
    const role = me.data().role, p = req.path;
    if (p.endsWith("/report") || p.endsWith("/promise")) {
      if (role !== "kid" || me.data().kidId !== b.kidId) { res.status(403).send("not this kid"); return; }
      res.json(p.endsWith("/report") ? await onReport(fid, String(b.kidId), String(b.sid || "")) : await onPromise(fid, String(b.kidId), String(b.pid || "")));
    } else if (p.endsWith("/review")) {
      if (role !== "parent") { res.status(403).send("parent only"); return; }
      res.json(await onReview(fid, String(b.id || "")));
    } else if (p.endsWith("/kidpw")) {
      if (role !== "parent") { res.status(403).send("parent only"); return; }
      const pin = String(b.pin || ""); if (!/^\d{6}$/.test(pin)) { res.status(400).send("pin"); return; }
      const kd = await db().doc(`families/${fid}/members/${String(b.uid || "")}`).get();
      if (!kd.exists || kd.data().role !== "kid" || !kd.data().login) { res.status(404).send("no kid"); return; }
      await getAuth().updateUser(kd.id, { password: pin });
      res.json({ ok: true });
    } else res.status(404).send("?");
  } catch (e) { console.warn("studyPing", e.message); res.status(500).send("err"); }
});

// timeoutSeconds 120: 타이머(KAIROS) 알림이 끝 시각까지 최대 1분 기다렸다 보낸다 (timer.js)
// memory 512MiB: BLOCK7 알림(b7push.js)이 큰 상태 문서를 읽어 푼다 — 기본 256MiB 는 빠듯하다
exports.studyTick = onSchedule({ schedule: "every 1 minutes", timeZone: "Asia/Seoul", region: REGION, timeoutSeconds: 120, memory: "512MiB" }, async () => {
  // KAIROS 잠금 화면 알림 · BLOCK7·Sweeter 알림 — 예약 작업을 하나 더 만들지 않고 이 틱에 얹는다.
  // 서로 실패를 넘기지 않게 따로 감싼다
  const timer = require("./timer").timerDue().catch((e) => console.warn("timerDue", e.message));
  const b7 = require("./b7push").b7Due().catch((e) => console.warn("b7Due", e.message));
  try { await studyDue(); } finally { await timer; await b7; }
});
async function studyDue() {
  const now = Date.now();
  const qs = await db().collection("sremind").where("at", "<=", Timestamp.fromMillis(now)).limit(300).get();
  if (qs.empty) return;
  const memCache = new Map();
  for (const d of qs.docs) {
    const r = d.data();
    try {
      if (r.at.toMillis() > now - 2 * 3600e3 && r.fid && r.uid) {
        const k = r.fid + "/" + r.uid;
        if (!memCache.has(k)) { const m = await db().doc(`families/${r.fid}/members/${r.uid}`).get(); memCache.set(k, m.exists ? Object.assign({ uid: r.uid }, m.data()) : null); }
        const m = memCache.get(k);
        if (m) await sendTo(r.fid, [m], {
          notification: { title: r.title || "공부 시간이에요!", body: r.body || "" },
          webpush: {
            fcmOptions: { link: r.url || APP },
            notification: { icon: APP + "icon-192.png", tag: "study-" + d.id, requireInteraction: true, renotify: true,
              actions: [{ action: "start", title: "시작" }, { action: "snooze", title: "미루기" }] },
          },
          data: { url: r.url || APP },
        });
      }
    } catch (e) { console.warn("studyTick", e.message); }
    await d.ref.delete().catch(() => {});
  }
}
