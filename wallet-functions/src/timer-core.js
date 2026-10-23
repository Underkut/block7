/* KAIROS(타이머) 잠금 화면 알림 — 서버 몫의 규칙. firebase 없이 돈다 → tests/test_timer_push.js 가 이 파일만 시험한다.
 *
 * timerPush/{dev} = { tok, at, title, body }   기기 하나에 문서 하나 (at = 끝나는 시각, ms)
 *   앱이 시작 · 멈춤 · ± · 처음으로 때마다 고쳐 적거나 지운다 (timerPing /set · /clear).
 *
 * due() — 1분마다 (공부 친구들 studyTick 이 함께 부른다)
 *   ① 앞으로 HOLD(58초) 안에 끝날 것까지 고른다 → 1분 틱이어도 늦지 않게
 *   ② 문서를 '잡는다'(claim · by) — 다음 틱이 같은 것을 또 보내지 않게
 *   ③ 끝 시각 + LATE(2.5초)까지 기다린다 — 앱이 켜져 있으면 그 사이 앱이 지워서 두 번 울리지 않는다
 *   ④ 다시 읽어 그대로일 때만 지우고 보낸다 — 기다리는 사이 멈췄거나(지움) 바꿨으면(새로 적어 by 가 사라짐) 안 보낸다
 */
const HOLD = 58e3, LATE = 2500, STALE = 90e3, DROP = 30 * 60e3, MAX_AHEAD = 190 * 60e3;
const DEV = /^[a-z0-9]{6,32}$/;
const clip = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

// /set 로 온 것을 믿어도 되나 — 기기 번호 · 알림 주소 · 시각(지금 1분 전 ~ 3시간 10분 뒤) · 글은 짧게
function checkSet(b, now) {
  b = b || {};
  const dev = String(b.dev || ""), tok = String(b.tok || ""), at = Number(b.at);
  if (!DEV.test(dev)) return { err: "dev" };
  if (!tok || tok.length > 600 || /\s/.test(tok)) return { err: "tok" };
  if (!isFinite(at) || at < now - 60e3 || at > now + MAX_AHEAD) return { err: "at" };
  return { dev, doc: { tok, at: Math.round(at), title: clip(b.title, 60) || "타이머가 끝났어요", body: clip(b.body, 80) } };
}
// 다른 틱이 잡고 있나 (90초 지난 잡음은 그 틱이 죽은 것으로 본다)
const canClaim = (x, now) => !(x.claim && x.claim > now - STALE);

/* d = { col, runTx, send, sleep, now }
 *   col.where('at','<=',n).limit(k).get() → { docs:[{ id, ref, data() }] }
 *   runTx(fn) — fn(tx) 안에서 tx.get(ref) → { exists, data() } · tx.update(ref, o) · tx.delete(ref)
 *   send(tok, title, body) → true/false */
async function due(d) {
  const now = d.now();
  const qs = await d.col.where("at", "<=", now + HOLD).limit(200).get();
  let sent = 0;
  await Promise.all(qs.docs.map(async (doc) => {
    const at = doc.data().at, me = now + "-" + Math.random().toString(36).slice(2, 8);
    const got = await d.runTx(async (tx) => {
      const s = await tx.get(doc.ref); if (!s.exists) return "gone";
      const x = s.data();
      if (x.at !== at || !canClaim(x, now)) return "busy";
      if (at < now - DROP) { tx.delete(doc.ref); return "drop"; }   // 30분 넘게 밀린 것은 울려도 소용없다
      tx.update(doc.ref, { claim: now, by: me }); return "mine";
    }).catch(() => "err");
    if (got !== "mine") return;
    const w = at + LATE - d.now(); if (w > 0) await d.sleep(w);
    const x = await d.runTx(async (tx) => {
      const s = await tx.get(doc.ref); if (!s.exists) return null;
      const y = s.data(); if (y.by !== me || y.at !== at) return null;
      tx.delete(doc.ref); return y;
    }).catch(() => null);
    if (x && await d.send(x.tok, x.title, x.body)) sent++;
  }));
  return sent;
}

module.exports = { checkSet, canClaim, due, DEV, HOLD, LATE, STALE, DROP, MAX_AHEAD };
