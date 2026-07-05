/* BLOCK7 push scheduler — Firebase Cloud Functions (v2, Node 20)
 *
 * 10분마다 실행되며, 각 사용자의 상태(users/{uid}/data/state)를 읽어:
 *  1) notify.morningTime과 현재 시각(Asia/Seoul, 10분 단위 반올림)이 일치하면
 *     → 오늘의 할일·일정 하루 요약 푸시
 *  2) notify.sections가 켜져 있고 어떤 시간구간의 startTime이 일치하면
 *     → 그 구간의 할일·일정 푸시
 * 중복 발송 방지: users/{uid}/push/meta 문서에 마지막 발송 슬롯을 기록.
 *
 * 사용자의 시간구간 startTime과 아침 요약 시각은 10분 단위(예: 07:00,
 * 06:30)에 맞춰져 있어야 정확히 발송돼요. (스케줄 주기가 10분이므로)
 */
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();

const TZ = "Asia/Seoul";

// Default sections mirror the app's DEFAULT_SECS; per-user custom secs
// stored in state.secs override these.
const DEFAULT_SECS = [
  { id: "dawn", name: "새벽", startTime: "03:00" },
  { id: "am", name: "오전", startTime: "06:00" },
  { id: "morn", name: "점심", startTime: "12:00" },
  { id: "pm", name: "오후", startTime: "13:00" },
  { id: "eve", name: "저녁", startTime: "18:00" },
  { id: "night", name: "밤", startTime: "21:00" },
];

function seoulNow() {
  // Reliable tz conversion without extra deps.
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}
function pad(n) { return String(n).padStart(2, "0"); }
function slotHHMM(d) {
  // Round DOWN to the 10-minute slot this run covers.
  return `${pad(d.getHours())}:${pad(Math.floor(d.getMinutes() / 10) * 10)}`;
}
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tasksLine(day, secId) {
  const bigs = ((day?.big || {})[secId] || []).filter(t => t.text?.trim() && !t.done);
  const smalls = ((day?.small || {})[secId] || []).filter(t => t.text?.trim() && !t.done);
  return [...bigs, ...smalls].map(t => t.text.trim());
}
function eventsLine(day, secId) {
  return (((day?.events || {})[secId]) || [])
    .filter(e => e.text?.trim())
    .map(e => (e.time ? `${e.time} ${e.text.trim()}` : e.text.trim()));
}

exports.block7Notify = onSchedule(
  { schedule: "every 10 minutes", timeZone: TZ, region: "asia-northeast3" },
  async () => {
    const now = seoulNow();
    const slot = slotHHMM(now);
    const todayK = dateKey(now);

    const usersSnap = await db.collection("users").get();
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      try {
        const stateSnap = await db.doc(`users/${uid}/data/state`).get();
        if (!stateSnap.exists) continue;
        const st = stateSnap.data();
        const notify = st?.settings?.notify;
        if (!notify?.enabled) continue;

        const tokensSnap = await db.collection(`users/${uid}/pushTokens`).get();
        const tokens = tokensSnap.docs.map(d => d.id);
        if (!tokens.length) continue;

        const metaRef = db.doc(`users/${uid}/push/meta`);
        const metaSnap = await metaRef.get();
        const meta = metaSnap.exists ? metaSnap.data() : {};
        const day = (st.days || {})[todayK] || {};
        const secs = Array.isArray(st.secs) && st.secs.length ? st.secs : DEFAULT_SECS;
        const visIds = Array.isArray(st.vis) ? st.vis : secs.map(s => s.id);

        const sends = [];

        // 1) 아침 하루 요약
        const morningTime = notify.morningTime || "07:00";
        const morningStamp = `${todayK}@${morningTime}`;
        if (slot === morningTime && meta.lastMorning !== morningStamp) {
          const lines = [];
          for (const sec of secs) {
            if (!visIds.includes(sec.id)) continue;
            const items = [...eventsLine(day, sec.id), ...tasksLine(day, sec.id)];
            if (items.length) lines.push(`${sec.name}: ${items.join(", ")}`);
          }
          sends.push({
            title: "오늘의 BLOCK7",
            body: lines.length ? lines.join("\n") : "오늘 등록된 할일·일정이 없어요.",
            tag: "morning",
            stampKey: { lastMorning: morningStamp },
          });
        }

        // 2) 시간구간 시작 알림
        if (notify.sections) {
          for (const sec of secs) {
            if (!visIds.includes(sec.id)) continue;
            if (sec.startTime !== slot) continue;
            const stamp = `${todayK}@${sec.id}`;
            if (meta[`lastSec_${sec.id}`] === stamp) continue;
            const items = [...eventsLine(day, sec.id), ...tasksLine(day, sec.id)];
            if (!items.length) continue; // 빈 구간은 조용히 넘어감
            sends.push({
              title: `${sec.name} 시작`,
              body: items.join("\n"),
              tag: `sec-${sec.id}`,
              stampKey: { [`lastSec_${sec.id}`]: stamp },
            });
          }
        }

        if (!sends.length) continue;

        const stampUpdates = {};
        for (const msg of sends) {
          const res = await getMessaging().sendEachForMulticast({
            tokens,
            notification: { title: msg.title, body: msg.body.slice(0, 900) },
            data: { tag: msg.tag, url: "https://underkut.github.io/block7/" },
            apns: { payload: { aps: { sound: "default" } } },
          });
          // Prune tokens the platform reports as dead.
          res.responses.forEach((r, i) => {
            const code = r.error?.code || "";
            if (code.includes("registration-token-not-registered") || code.includes("invalid-argument")) {
              db.doc(`users/${uid}/pushTokens/${tokens[i]}`).delete().catch(() => {});
            }
          });
          Object.assign(stampUpdates, msg.stampKey);
        }
        await metaRef.set(stampUpdates, { merge: true });
      } catch (e) {
        console.error(`user ${uid} notify failed`, e);
      }
    }
  }
);

/* ── 알림 테스트 발송 ──
 * 앱 설정창의 [서버] 테스트 버튼이 호출. Firebase Auth ID 토큰으로 본인
 * 확인 후, 그 사용자의 등록된 모든 기기 토큰에 테스트 푸시를 보낸다.
 * ?delay=N (최대 15초)을 주면 N초 기다렸다 발송 — 버튼을 누르고 홈
 * 화면으로 나가 배너 표시까지 확인할 수 있게 하기 위한 것. */
exports.block7TestPush = onRequest(
  { region: "asia-northeast3", cors: true },
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
      if (!idToken) { res.status(401).json({ error: "no auth token" }); return; }
      const decoded = await getAuth().verifyIdToken(idToken);
      const uid = decoded.uid;

      const tokensSnap = await db.collection(`users/${uid}/pushTokens`).get();
      const tokens = tokensSnap.docs.map(d => d.id);
      if (!tokens.length) { res.status(400).json({ error: "등록된 기기 토큰이 없어요 (알림 토글을 껐다 켜보세요)" }); return; }

      const delay = Math.min(parseInt(req.query.delay || "0", 10) || 0, 15);
      if (delay > 0) await new Promise(r => setTimeout(r, delay * 1000));

      const now = seoulNow();
      const result = await getMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: "BLOCK7 테스트 알림",
          body: `푸시 경로 정상! (${pad(now.getHours())}:${pad(now.getMinutes())} 발송)`,
        },
        data: { tag: "test", url: "https://underkut.github.io/block7/" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      const errors = [];
      result.responses.forEach((r, i) => {
        if (r.error) {
          errors.push(r.error.code || String(r.error));
          const code = r.error.code || "";
          if (code.includes("registration-token-not-registered") || code.includes("invalid-argument")) {
            db.doc(`users/${uid}/pushTokens/${tokens[i]}`).delete().catch(() => {});
          }
        }
      });
      res.json({ total: tokens.length, success: result.successCount, errors });
    } catch (e) {
      console.error("test push failed", e);
      res.status(500).json({ error: String(e.message || e) });
    }
  }
);
