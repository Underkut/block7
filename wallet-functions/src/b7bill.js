/* 요금 알림 (2026-10-27) — 매일 오후 3시, 개발자(HB) 한 사람에게만. 규칙은 b7bill-core.js (tests/test_b7bill.js)
 *
 * b7Bill()  1분 틱(b7Due → studyTick)이 함께 부른다 — 예약 작업을 늘리지 않는다
 *   15:00 넘었고 오늘 아직이면: 먼저 '오늘 했음' 을 적고(실패해도 하루 한 번만) → BigQuery 로 이번 달을 센다 → 푸시
 * 필요한 설정(HB, 한 번): BigQuery 데이터 세트 `billing` + 결제 → BigQuery 내보내기(표준 사용량 비용) — docs/push/billing.md
 * 기록: b7meta/bill = { day, at, ok, cost, credits }  (보안 규칙에 없다 — 서버만)
 */
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");
const B = require("./b7bill-core");

const PROJECT = "block7-8f24e";
const DATASET = "billing";
const LOCATION = "asia-northeast3";   // 데이터 세트를 서울에 만든다 (docs/push/billing.md)
const DEV_EMAIL = "denartist@gmail.com";   // 앱의 DEV_INBOX_EMAIL 과 같은 값 — 이 계정 하나에만 보낸다
const LINK = "https://console.firebase.google.com/project/block7-8f24e/usage/details";

async function sendToDev(msg) {
  const uid = (await getAuth().getUserByEmail(DEV_EMAIL)).uid;
  const qs = await getFirestore().collection(`users/${uid}/pushTokens`).get();
  // BLOCK7 기기에만 (Sweeter 기기 · 다른 사람은 아니다)
  const toks = qs.docs.filter((d) => (d.data() || {}).product !== "sweeter").map((d) => d.id);
  if (!toks.length) return 0;
  const r = await getMessaging().sendEachForMulticast({
    tokens: toks,
    notification: { title: msg.title, body: msg.body },
    data: { type: "bill", tag: "b7-bill" },
    webpush: { headers: { Urgency: "high", TTL: "21600" }, fcmOptions: { link: LINK }, notification: { tag: "b7-bill" } },
  });
  return r.successCount;
}

exports.b7Bill = async function b7Bill(now) {
  const ref = getFirestore().doc("b7meta/bill");
  const claimed = await getFirestore().runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (!B.shouldRun(now, s.exists ? s.data() : null)) return false;
    tx.set(ref, { day: B.dayKey(now), at: now }, { merge: true });
    return true;
  });
  if (!claimed) return;
  let msg, row = null;
  try {
    const { BigQuery } = require("@google-cloud/bigquery");
    const [rows] = await new BigQuery({ projectId: PROJECT }).query({ query: B.query(PROJECT, DATASET), params: { month: B.monthKey(now) }, location: LOCATION });
    row = rows && rows[0];
    msg = B.message(row, now);
  } catch (e) {
    console.warn("b7Bill query", e.message);
    msg = B.failMessage(now, e.message);
  }
  await ref.set({ ok: !!row, cost: row ? Number(row.cost) || 0 : null, credits: row ? Number(row.credits) || 0 : null }, { merge: true });
  try { await sendToDev(msg); } catch (e) { console.warn("b7Bill send", e.message); }
};
