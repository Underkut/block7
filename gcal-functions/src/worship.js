/* 예배팀 일정 받기 서버 — 교역자 로테이션(sweeter.my/rotation/) R13 (HB 2026-11-16). 판단은 worship-core.js.
 *
 * 열쇠: Secret Manager 의 SCHEDULE_API_KEY (HB 가 Cloud Shell 에서 직접 넣음).
 *   ⚠️ 열쇠 값을 코드 · 저장소 · Firestore · 로그 · 응답 어디에도 남기지 않는다. 쓰는 곳은 fetch 헤더 한 곳뿐.
 * 읽기만: 예배팀 API 에 GET 하나. 그쪽에 쓰는 요청은 없다.
 *
 * worshipPull (매 2시간, 서울) — rota 문서 중 wpull == true 인 것(HB 앱이 켬)마다 한 번 받아 rota/{uid}/ext/worship 에 통째로 바꿔 끼움
 *   하루 12번 · 한도 100번. 받기 실패면 마지막 자료는 그대로 두고 err 만 적는다.
 * worship (HTTP) POST /now — HB 본인(rota/{uid} 주인)이 '지금 받기'. 10분에 한 번.
 *
 * rota/{uid}/ext/worship = { at, from, to, gen, services, map, dup, err?, errAt? } — 보안 규칙: HB · 팀 읽기만, 쓰기는 서버만.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const C = require("./worship-core");

const REGION = "asia-northeast3";
const KEY = defineSecret("SCHEDULE_API_KEY");
const db = () => getFirestore();
const extRef = (uid) => db().doc(`rota/${uid}/ext/worship`);

async function fetchSchedule() {
  const r = await fetch(C.API, { headers: { Authorization: "Bearer " + String(KEY.value() || "").trim(), Accept: "application/json" } });
  if (!r.ok) throw Object.assign(new Error("worship " + r.status), { code: C.errOf(r.status) });
  try { return await r.json(); } catch (e) { throw Object.assign(new Error("worship json"), { code: "shape" }); }
}

async function pullOne(uid, now) {
  const top = await db().doc(`rota/${uid}`).get();
  if (!top.exists || top.get("wpull") !== true) return { skipped: true };
  const prev = await extRef(uid).get();
  try {
    const resp = await fetchSchedule();
    const d = C.digest(resp, top.get("wkeys") || {}, prev.exists ? prev.get("map") : {});
    await extRef(uid).set(Object.assign({ at: now }, d));   // 통째로 바꿔 끼움 (merge 아님)
    return { ok: true, n: d.services.length };
  } catch (e) {
    const code = e.code || "server";
    console.error("worship pull", uid.slice(0, 6), code);   // 열쇠 · 응답 내용은 남기지 않는다
    await extRef(uid).set({ err: code, errAt: now }, { merge: true });   // 마지막 자료는 그대로
    return { ok: false, code };
  }
}

exports.worshipPull = onSchedule({ schedule: "every 2 hours", timeZone: "Asia/Seoul", region: REGION, secrets: [KEY] }, async () => {
  const qs = await db().collection("rota").where("wpull", "==", true).limit(3).get();
  for (const d of qs.docs) await pullOne(d.id, Date.now());
});

exports.worship = onRequest({ region: REGION, cors: true, secrets: [KEY] }, async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "POST" }); return; }
  const path = (req.path || "/").replace(/\/+$/, "") || "/";
  const h = req.headers.authorization || "";
  let t = null;
  if (h.startsWith("Bearer ")) { try { t = await getAuth().verifyIdToken(h.slice(7)); } catch (e) { t = null; } }
  if (!t) { res.status(401).json({ error: "로그인이 필요합니다" }); return; }
  if (path !== "/now") { res.status(404).json({ error: "없는 길" }); return; }
  const now = Date.now();
  const prev = await extRef(t.uid).get();
  const last = prev.exists ? Math.max(prev.get("at") || 0, prev.get("errAt") || 0) : 0;
  if (!C.due(last, now)) { res.json({ ok: true, wait: true }); return; }
  const r = await pullOne(t.uid, now);   // 자기 문서(rota/{자기 uid})만 — 남의 것은 못 부른다
  if (r.skipped) { res.status(404).json({ error: "로테이션 문서가 없습니다", code: "nodoc" }); return; }
  res.status(r.ok ? 200 : 502).json(r);
});
