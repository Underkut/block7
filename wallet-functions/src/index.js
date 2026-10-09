/* 용돈 친구들 알림 서버 (F-4) — BLOCK7 함수(functions/)와 따로 둔 묶음(codebase: wallet)
 *
 * walletPing (HTTP, asia-northeast3)
 *   POST /kid {fid, kidId}  아이 폰이 사본을 올린 직후 부른다 → 지난번과 비교해 새 일(쓴 돈·받은 돈·하루 마무리·목표·레벨·계획 초과)을
 *                           families/{fid}/alerts 에 적고, 부모님 알림 설정대로 푸시
 *   POST /msg {fid, id}     우체통에 무언가를 쓴 쪽이 부른다 → 받는 쪽(아이 ↔ 부모)에 푸시
 * walletEvening (매일 21:00, 서울)  '저녁 요약' 을 고른 부모님께 오늘 하루를 한 통으로
 *
 * Firestore 트리거를 쓰지 않은 까닭: 트리거는 데이터베이스 위치와 같은 지역이어야 하고 Eventarc 를 켜야 한다.
 * HTTP 함수는 block7TestPush 처럼 이미 되는 방식이라 HB 가 콘솔에서 더 켤 것이 없다.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();
const REGION = "asia-northeast3";
const TZ = "Asia/Seoul";
const APP = "https://block7.my/wallet/";
const won = (n) => Number(n || 0).toLocaleString("ko-KR") + "원";
const DEF = { mode: "now", spend: true, minSpend: 0, income: true, chk: true, goal: true, over: true, msg: true };
const prefOf = (m) => Object.assign({}, DEF, (m && m.notify) || {});
const todayKST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

/* 아이 상태에서 필요한 것만 (앱과 같은 셈) */
const yes = (v) => v === "y" || v === "z";
function starsOf(st) { return Object.values(st.chk || {}).reduce((n, c) => n + (yes(c.s) ? 1 : 0) + (yes(c.g) ? 1 : 0), 0); }
function lvOf(stars) { let lv = 1, rem = stars; while (lv < 10 && rem >= 10 + 4 * (lv - 1)) { rem -= 10 + 4 * (lv - 1); lv++; } return lv; }
function catName(st, k) {
  const t = (st.tiles || []).find((c) => c.k === k); if (t) return t.n;
  const g = (st.goals || []).find((c) => c.k === k); if (g) return g.n;
  return (st.gone && st.gone[k] && st.gone[k].n) || "기타";
}
function overTiles(st) {
  const out = [];
  (st.tiles || []).forEach((c) => {
    ["cash", "card", "bank"].forEach((a) => {
      const al = ((st.alloc || {})[a] || {})[c.k] || 0; if (!al) return;
      const sp = (st.tx || []).reduce((s, t) => s + (t.t === "out" && t.cat === c.k && (["card", "bank"].includes(t.acct) ? t.acct : "cash") === a ? t.amt : 0), 0);
      if (sp > al && !out.includes(c.k)) out.push(c.k);
    });
  });
  return out;
}
const mark = (v) => (v === "y" ? "✓" : v === "z" ? "○" : v === "n" ? "–" : "?");

function events(prev, st, name) {
  const ev = [];
  const seen = new Set(prev.tx || []);
  (st.tx || []).filter((t) => t.id && !seen.has(t.id) && t.t !== "mv").slice(-10).forEach((t) => {
    if (t.t === "out") ev.push({ k: "spend", amt: t.amt, ref: t.id, title: `${name} · 쓴 돈 ${won(t.amt)}`, body: catName(st, t.cat) + (t.note ? " · " + t.note : "") });
    else ev.push({ k: "income", amt: t.amt, ref: t.id, title: `${name} · 받은 돈 ${won(t.amt)}`, body: (t.memo || "용돈") + (t.note ? " · " + t.note : "") });
  });
  const pc = prev.chk || {};
  Object.keys(st.chk || {}).sort().slice(-3).forEach((d) => {
    const c = st.chk[d], o = pc[d] || {};
    if (c.s && c.g && (c.s !== o.s || c.g !== o.g)) ev.push({ k: "chk", title: `${name} · 하루 마무리`, body: `쓴 돈 ${mark(c.s)} · 받은 돈 ${mark(c.g)}` + (yes(c.s) && yes(c.g) ? " — 정직하게 다 적었어요" : "") });
  });
  const pg = new Set(prev.goals || []);
  (st.goals || []).filter((g) => g.done && !pg.has(g.k)).forEach((g) => ev.push({ k: "goal", title: `${name} · 목표 달성!`, body: `${g.n} (${won(g.price)})을 모아서 샀어요` }));
  const lv = lvOf(starsOf(st));
  if (prev.lv && lv > prev.lv) ev.push({ k: "goal", title: `${name} · 레벨 업!`, body: `Lv.${lv}가 됐어요` });
  const po = new Set(prev.over || []);
  overTiles(st).filter((k) => !po.has(k)).forEach((k) => ev.push({ k: "over", title: `${name} · 계획 초과`, body: `${catName(st, k)} 칸 계획보다 많이 썼어요` }));
  return { ev, snap: { tx: (st.tx || []).map((t) => t.id).slice(-400), chk: Object.fromEntries(Object.entries(st.chk || {}).sort().slice(-10)), goals: (st.goals || []).filter((g) => g.done).map((g) => g.k), lv, over: overTiles(st) } };
}

async function members(fid) { const qs = await db.collection(`families/${fid}/members`).get(); return qs.docs.map((d) => Object.assign({ uid: d.id }, d.data())); }
async function push(fid, ms, title, body, url) {
  const tokens = []; ms.forEach((m) => (m.tokens || []).forEach((t) => tokens.push({ t, uid: m.uid })));
  if (!tokens.length) return 0;
  try {
    const r = await getMessaging().sendEachForMulticast({
      tokens: tokens.map((x) => x.t),
      notification: { title, body },
      webpush: { fcmOptions: { link: url }, notification: { icon: APP + "icon-192.png", tag: "wallet" } },
      data: { url },
    });
    // 죽은 토큰은 지운다
    const dead = [];
    r.responses.forEach((x, i) => { const c = x.error && x.error.code; if (c && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(c)) dead.push(tokens[i]); });
    await Promise.all(dead.map((d) => db.doc(`families/${fid}/members/${d.uid}`).update({ tokens: FieldValue.arrayRemove(d.t) }).catch(() => {})));
    return r.successCount;
  } catch (e) { console.warn("push", e.message); return 0; }
}
const okKind = (p, e) => (e.k === "spend" ? p.spend && e.amt >= (p.minSpend || 0) : e.k === "income" ? p.income : e.k === "chk" ? p.chk : e.k === "goal" ? p.goal : e.k === "over" ? p.over : p.msg);
const linkOf = (kidId, e) => APP + "?go=" + (e.ref ? "tx" : e.k === "msg" ? "mail" : "rep") + "&kid=" + encodeURIComponent(kidId) + (e.ref ? "&ref=" + encodeURIComponent(e.ref) : "");

async function onKid(fid, kidId) {
  const kd = await db.doc(`families/${fid}/kids/${kidId}`).get(); if (!kd.exists) return { n: 0 };
  const k = kd.data(); let st; try { st = JSON.parse(k.json); } catch (e) { return { n: 0 }; }
  const metaRef = db.doc(`families/${fid}/kids/${kidId}/meta/notify`);
  const meta = await metaRef.get();
  const first = !meta.exists;
  const { ev, snap } = events(first ? {} : meta.data(), st, k.name || "아이");
  await metaRef.set(snap);
  if (first || !ev.length) return { n: 0 };      // 처음 연결할 때는 예전 기록을 한꺼번에 알리지 않는다
  const batch = db.batch(); const at = FieldValue.serverTimestamp(), day = todayKST();
  ev.forEach((e) => batch.set(db.collection(`families/${fid}/alerts`).doc(), Object.assign({ kidId, day, at }, e)));
  await batch.commit();
  const parents = (await members(fid)).filter((m) => m.role === "parent");
  let sent = 0;
  for (const p of parents) {
    const pr = prefOf(p); if (pr.mode !== "now" && pr.mode !== "both") continue;
    const mine = ev.filter((e) => okKind(pr, e)); if (!mine.length) continue;
    const e = mine[mine.length - 1];
    sent += await push(fid, [p], mine.length > 1 ? `${e.title} 외 ${mine.length - 1}건` : e.title, e.body, linkOf(kidId, e));
  }
  return { n: ev.length, sent };
}
async function onMsg(fid, id) {
  const md = await db.doc(`families/${fid}/msgs/${id}`).get(); if (!md.exists) return { n: 0 };
  const m = md.data(); const ms = await members(fid);
  const kid = ms.find((x) => x.role === "kid" && x.kidId === m.kidId);
  const kidName = (kid && kid.name) || "아이";
  const tag = { note: "쪽지", stamp: "칭찬 도장", mission: "미션", req: "용돈 요청", cpreq: "쿠폰 사용 요청" }[m.type] || "우체통";
  if (m.from === "kid" || (m.type === "mission" && m.status === "done")) {
    const title = m.type === "mission" ? `${kidName} · 미션 완료!` : `${kidName} · ${tag}`;
    const body = (m.amt && m.type !== "stamp" ? won(m.amt) + " · " : "") + (m.text || m.sticker || "");
    await db.collection(`families/${fid}/alerts`).add({ kidId: m.kidId, k: "msg", title, body, msg: id, day: todayKST(), at: FieldValue.serverTimestamp() });
    const ps = ms.filter((x) => x.role === "parent" && prefOf(x).msg && prefOf(x).mode !== "off");
    return { n: 1, sent: await push(fid, ps, title, body, APP + "?go=mail&kid=" + encodeURIComponent(m.kidId)) };
  }
  // 부모님 → 아이
  const who = m.okName || m.fromName || "부모님";
  const title = m.status === "ok" ? `${who}가 ${tag}을 승인했어요!` : m.status === "no" ? `${who}가 ${tag}에 답했어요` : m.type === "stamp" ? `${who}가 ${m.sticker || "⭐"} 도장을 찍었어요!` : `${who}에게서 ${tag}가 왔어요`;
  const kids = ms.filter((x) => x.role === "kid" && x.kidId === m.kidId);
  return { n: 1, sent: await push(fid, kids, title, m.text || m.refLabel || "", APP + "?go=mail") };
}

exports.walletPing = onRequest({ region: REGION, cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") { res.status(405).send("POST"); return; }
    const h = req.get("Authorization") || ""; const tok = h.startsWith("Bearer ") ? h.slice(7) : "";
    const u = await getAuth().verifyIdToken(tok);
    const b = req.body || {}; const fid = String(b.fid || "");
    const me = await db.doc(`families/${fid}/members/${u.uid}`).get();
    if (!fid || !me.exists) { res.status(403).send("not a member"); return; }
    if (req.path.endsWith("/kid")) {
      if (me.data().role !== "kid" || me.data().kidId !== b.kidId) { res.status(403).send("not this kid"); return; }
      res.json(await onKid(fid, String(b.kidId)));
    } else if (req.path.endsWith("/msg")) res.json(await onMsg(fid, String(b.id || "")));
    else res.status(404).send("?");
  } catch (e) { res.status(401).send("auth"); }
});

exports.walletEvening = onSchedule({ schedule: "0 21 * * *", timeZone: TZ, region: REGION }, async () => {
  const day = todayKST();
  const fams = await db.collection("families").listDocuments();
  for (const f of fams) {
    const ms = await members(f.id);
    const ps = ms.filter((m) => m.role === "parent" && ["evening", "both"].includes(prefOf(m).mode) && (m.tokens || []).length);
    if (!ps.length) continue;
    const qs = await db.collection(`families/${f.id}/alerts`).where("day", "==", day).get();
    const kids = ms.filter((m) => m.role === "kid");
    const lines = kids.map((k) => {
      const a = qs.docs.map((d) => d.data()).filter((x) => x.kidId === k.kidId);
      const sp = a.filter((x) => x.k === "spend"), inc = a.filter((x) => x.k === "income"), chk = a.filter((x) => x.k === "chk").pop();
      if (!a.length) return `${k.name || "아이"}: 오늘은 기록이 없어요`;
      return `${k.name || "아이"}: 쓴 돈 ${sp.length}건 ${won(sp.reduce((s, x) => s + (x.amt || 0), 0))}` + (inc.length ? ` · 받은 돈 ${won(inc.reduce((s, x) => s + (x.amt || 0), 0))}` : "") + (chk ? ` · ${chk.body.split(" — ")[0]}` : " · 하루 마무리 아직");
    });
    if (lines.length) await push(f.id, ps, "오늘의 용돈 요약", lines.join("\n"), APP + "?go=rep");
  }
});
