/* 요금 알림 — 서버 몫의 규칙 (firebase 없이 돈다 → tests/test_b7bill.js)
 *
 * 매일 오후 3시(한국)에 개발자(HB) 한 사람에게 "이번 달 지금까지 원래 비용 · 절감액 · 결과" 를 보낸다.
 * 숫자는 결제 화면과 같은 기록 — 결제를 BigQuery 로 내보낸 표(standard usage cost)에서 센다.
 *   cost    = 원래 비용 (화면의 '비용')
 *   credits = 무료 양 등으로 깎인 것 (음수로 적혀 있다 → 화면의 '절감액')
 *   결과    = cost + credits (화면의 '총비용')
 * ⚠️ 받는 사람은 개발자 계정 하나뿐이다 — 다른 사용자에게는 가지 않는다 (b7bill.js 의 DEV_EMAIL).
 */
const OFF = 9 * 3600e3;
const SEND_HM = 15 * 60;            // 오후 3시
const kst = (ms) => { const d = new Date(ms + OFF); return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), hm: d.getUTCHours() * 60 + d.getUTCMinutes() }; };
const z = (n) => String(n).padStart(2, "0");
const dayKey = (ms) => { const w = kst(ms); return `${w.y}-${z(w.mo)}-${z(w.d)}`; };
const monthKey = (ms) => { const w = kst(ms); return `${w.y}${z(w.mo)}`; };   // invoice.month 모양 'YYYYMM'

// 1분 틱마다 묻는다 — 15:00 넘었고 오늘 아직 안 했으면 (늦은 틱 · 서버를 3시 넘어 올린 날도 그날 한 번)
function shouldRun(now, meta) {
  return kst(now).hm >= SEND_HM && (!meta || meta.day !== dayKey(now));
}

// 표에서 이번 달을 세는 질의 — 표 이름 끝(결제 계정 번호)을 몰라도 되게 * 로 받는다
function query(project, dataset) {
  return `SELECT SUM(cost) AS cost,
  SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) AS c), 0)) AS credits,
  ANY_VALUE(currency) AS currency,
  MIN(usage_start_time) AS first, COUNT(*) AS n
FROM \`${project}.${dataset}.gcp_billing_export_v1_*\`
WHERE invoice.month = @month`;
}

const won = (n) => Math.round(Number(n) || 0).toLocaleString("ko-KR") + "원";

/* row = 질의 결과 한 줄 { cost, credits, currency, first, n }  (first 는 Date 또는 문자열 또는 {value})
 * 돌려주는 것 { title, body } */
function message(row, now) {
  const w = kst(now);
  const title = `${w.mo}월 요금 · ${w.d}일 오후 3시`;
  if (!row || !Number(row.n)) {
    return { title, body: "아직 결제 기록이 안 들어왔어요.\n내보내기를 켠 뒤 하루쯤 걸려요." };
  }
  const cost = Number(row.cost) || 0, credits = Number(row.credits) || 0;
  const unit = row.currency && row.currency !== "KRW" ? ` (${row.currency})` : "";
  const lines = [`원래 ${won(cost)} − 절감 ${won(-credits)}`, `= ${won(cost + credits)}${unit}`];
  // 내보내기를 이 달 중간에 켰으면 그 앞날은 표에 없다 — 화면보다 적게 나오는 까닭을 밝힌다
  const fv = row.first && (row.first.value || row.first);
  const fms = fv ? Date.parse(fv instanceof Date ? fv.toISOString() : String(fv)) : NaN;
  if (!isNaN(fms)) {
    const f = kst(fms);
    if (f.mo === w.mo && f.d > 2) lines.push(`※ ${f.mo}월 ${f.d}일부터 센 금액이에요`);
  }
  return { title, body: lines.join("\n") };
}
function failMessage(now, err) {
  const w = kst(now);
  const notFound = /not ?found|404/i.test(String(err || ""));
  return {
    title: `${w.mo}월 요금 · 확인 못 했어요`,
    body: notFound ? "결제 내보내기가 아직 안 켜져 있어요.\n(docs/push/billing.md 1~2번)" : "결제 기록을 읽지 못했어요.\n내일 다시 볼게요.",
  };
}

module.exports = { SEND_HM, kst, dayKey, monthKey, shouldRun, query, message, failMessage, won };
