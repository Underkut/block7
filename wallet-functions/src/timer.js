/* KAIROS(타이머 block7.my/timer/) 잠금 화면 알림 (T-6) — 용돈 · 공부 친구들 서버와 같은 묶음(codebase: wallet)에 산다.
 *
 * timerPing (HTTP, 로그인 없음 — 타이머는 기기 안에만 저장한다)
 *   POST /set   {dev, tok, at, title, body}  끝나는 시각을 맡긴다 (같은 기기는 덮어쓴다)
 *   POST /clear {dev}                        멈춤 · 처음으로 · 끝 · 스위치 끔
 *   POST /test  {tok}                        켜자마자 시험 알림 한 통
 * timerDue()  1분마다 — 따로 예약 작업을 만들지 않고 studyTick 이 함께 부른다
 *             (Cloud Scheduler 는 계정당 3개까지만 무료라 하나 더 만들면 요금이 붙는다)
 *
 * 앱은 Firestore 를 직접 만지지 않는다 → timerPush 는 보안 규칙에 없어도 된다(서버는 관리자 권한).
 * 규칙은 timer-core.js (시험: tests/test_timer_push.js).
 */
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const T = require("./timer-core");

const REGION = "asia-northeast3";
const APP = "https://block7.my/timer/";
const col = () => getFirestore().collection("timerPush");

async function send(tok, title, body, tag) {
  try {
    await getMessaging().send({
      token: tok,
      notification: { title, body: body || "KAIROS" },
      webpush: { fcmOptions: { link: APP }, notification: { icon: APP + "icon-192.png", tag: tag || "kairos", renotify: true, requireInteraction: true } },
      data: { url: APP },
    });
    return true;
  } catch (e) { console.warn("timer push", e.code || e.message); return false; }
}

exports.timerPing = onRequest({ region: REGION, cors: true }, async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("POST"); return; }
  // 앱은 text/plain 으로 보낸다(사전 확인 없이 keepalive 로 가게) → 글자면 풀어 읽는다
  let b = req.body || {}; if (typeof b === "string" || Buffer.isBuffer(b)) { try { b = JSON.parse(String(b)); } catch (e) { b = {}; } }
  const p = req.path;
  try {
    if (p.endsWith("/set")) {
      const c = T.checkSet(b, Date.now()); if (c.err) { res.status(400).send(c.err); return; }
      await col().doc(c.dev).set(c.doc); res.json({ ok: true });
    } else if (p.endsWith("/clear")) {
      const dev = String(b.dev || ""); if (!T.DEV.test(dev)) { res.status(400).send("dev"); return; }
      await col().doc(dev).delete(); res.json({ ok: true });
    } else if (p.endsWith("/test")) {
      const tok = String(b.tok || ""); if (!tok || tok.length > 600) { res.status(400).send("tok"); return; }
      res.json({ ok: await send(tok, "KAIROS 알림을 켰어요", "화면이 꺼져 있어도 타이머가 끝나면 이렇게 알려 드려요", "kairos-test") });
    } else res.status(404).send("?");
  } catch (e) { console.warn("timerPing", e.message); res.status(500).send("err"); }
});

// studyTick 이 부른다 — 실패해도 공부 쪽 알림에 넘기지 않게 부르는 쪽에서 감싼다
exports.timerDue = () => T.due({
  col: col(),
  runTx: (fn) => getFirestore().runTransaction(fn),
  send: (tok, title, body) => send(tok, title, body),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  now: Date.now,
});
