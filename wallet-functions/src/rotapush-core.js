/* 교역자 로테이션 알림 (1123-B B4) — 서버 몫의 판단만 (파이어베이스 · 네트워크 없음). 시험: tests/test_rotapush.js
 *
 * 알림 글 · 보낼 때 · 설정 다듬기는 **앱과 한 벌**이다 — rotation/index.html 의 rotation-core 를 떼어 만든 rotation-core.gen.js 를 쓴다
 * (tools/make-rotapush-core.sh). 여기에는 서버만의 것 — 팀인가 · 무엇을 언제 읽나 · 한 사람 처리 · 상태 글 — 만 둔다.
 *
 * rotapush/{uid} = { team(HB uid), email, ok(확인된 이메일), on, tokens:{등록 번호:{at, ua}}, alerts:[…], at(다음 보낼 때 · 없으면 null),
 *                    last(마지막으로 훑은 때), fired:[열쇠 60], sent(마지막으로 보낸 때), claim?, err? }
 *   보안 규칙에 없다 = 서버만 읽고 쓴다(앱은 함수 rotapush 로만). 책 · ui · staff 칸 · users/{uid} 는 쓰지 않는다.
 */
const R = require("./rotation-core.gen.js");

const CLAIM_MS = 90e3;
const APP = R.RP_APP;
const ICON = APP + "icon-192.png";

const teamIdOk = (t) => typeof t === "string" && /^[A-Za-z0-9]{6,128}$/.test(t);
// 팀인가 — top = rota/{team} 에서 team 칸만 읽은 것(책은 안 읽음). 주인(HB)은 uid 가 같고 문서가 있을 때.
// 교역자는 확인된 이메일이 그 목록에 있을 때 — 보안 규칙 inTeam 과 같은 판단
function memberOk(top, who, team) {
  if (!top || !teamIdOk(team) || !who) return false;
  if (who.uid === team) return true;
  const em = String(who.email || "").toLowerCase();
  return !!em && who.ok === true && (Array.isArray(top.team) ? top.team : []).some((x) => String(x).toLowerCase() === em);
}
const tokensOf = (d) => Object.keys((d && d.tokens) || {});

// 한 사람 처리 — d = rotapush 문서, io = { member, tables, book, kts } (한 번씩만 읽게 memo 해서 넘긴다)
//   → { off?: 까닭, sends:[{ title, body, link, tag }], patch }
async function runDue(d, now, io) {
  const alerts = R.rpNorm(d.alerts), fired = Array.isArray(d.fired) ? d.fired.filter((x) => typeof x === "string") : [];
  const seen = new Set(fired), from = Math.max(+d.last || 0, now - R.RP_LATE);
  const due = R.rpDue(alerts, from, now).filter((x) => !seen.has(x.key));
  const sends = [], keys = [];
  if (due.length) {
    if (!(await io.member())) return { off: "팀 명단에서 빠져 알림을 껐습니다", sends: [], patch: { on: false, at: null, last: now } };
    for (const x of due) {
      keys.push(x.key);
      const need = R.rpNeeds(x.a), sun = R.visitSun(x.date);
      const book = need.book ? await io.book() : null;
      if (x.w.w === "mine" && !(book && R.rpMine(book, d.email, sun))) continue;   // 내 부산 주가 아니면 조용히
      const t = await io.tables();
      const m = R.rpMsg(x.a, { team: t.team, serve: t.serve, date: x.date, today: R.rpYmd(now), staff: book ? R.ktStaff(book, sun) : [], kts: need.kt ? await io.kts() : [] });
      if (m) sends.push({ title: m.title, body: m.body, link: R.rpLink(x.a, x.date), tag: "rota-" + x.a.id + "-" + x.date });
    }
  }
  return { sends, patch: { last: now, at: tokensOf(d).length && d.on !== false ? R.rpNext(alerts, now) : null, fired: fired.concat(keys).slice(-R.RP_MAX.fired) } };
}
// 시험 — 그 알림이 처음 말할 예배의 글을 지금. 표가 없거나 고른 것이 없으면 그렇다고 알리는 글
async function testMsg(alert, now, io, email) {
  const a = R.rpOne(alert) || R.rpDefault(), need = R.rpNeeds(a);
  const t = await io.tables(), book = need.book ? await io.book() : null, kts = need.kt ? await io.kts() : [];
  const p = R.rpPreview(a, { team: t.team, serve: t.serve, today: R.rpYmd(now), kts, staffOf: (sun) => (book ? R.ktStaff(book, sun) : []) });
  if (!p) return { title: "로테이션 시험 알림", body: "알림 길이 정상입니다.\n'" + a.n + "' 에 맞는 예배를 5주 안 시트 표에서 찾지 못했습니다.", link: R.rpLink(a, ""), tag: "rota-test", date: "" };
  const mine = a.when.some((w) => w.w === "mine") && a.when.every((w) => w.w === "mine") && !(book && R.rpMine(book, email, R.visitSun(p.date)));
  return { title: "[시험] " + p.msg.title, body: p.msg.body + (mine ? "\n(이 주는 내 부산 주가 아니라 실제로는 안 갑니다)" : ""), link: R.rpLink(a, p.date), tag: "rota-test", date: p.date };
}
// FCM 메시지 — 아이폰 홈 화면 앱에서 늦지 않게: Urgency high · TTL(12시간 넘게 늦은 알림은 버림). BLOCK7 등록 번호와 섞지 않는다
function fcmOf(tokens, s) {
  return {
    tokens, notification: { title: s.title, body: s.body }, data: { type: "rota", url: s.link },
    webpush: { headers: { Urgency: "high", TTL: "43200" }, fcmOptions: { link: s.link }, notification: { tag: s.tag, icon: ICON } },
    android: { priority: "high", ttl: 43200e3 },
  };
}
function statusOf(d, tok) {
  d = d || {};
  const toks = tokensOf(d);
  return { on: d.on !== false && toks.length > 0, devices: toks.length, mine: !!tok && toks.includes(tok), alerts: R.rpNorm(d.alerts),
    next: d.on !== false && toks.length ? d.at || null : null, sent: +d.sent || 0, err: String(d.err || "") };
}
// /set — 다듬어 넣고 다음 때를 다시 셈(기기가 없으면 null — 틱에 안 걸림)
function setPatch(d, alerts, now) {
  const a = R.rpNorm(alerts), on = d.on !== false && tokensOf(d).length > 0;
  return { alerts: a, at: on ? R.rpNext(a, now) : null, last: now };
}

module.exports = { R, CLAIM_MS, teamIdOk, memberOk, tokensOf, runDue, testMsg, fcmOf, statusOf, setPatch };
