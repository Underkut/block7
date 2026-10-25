/* BLOCK7 · Sweeter 알림 — 서버 몫의 규칙. firebase 없이 돈다 → tests/test_b7push.js 가 이 파일만 시험한다.
 *
 * 예전(2026-10 까지)에는 두 서버가 **1분마다 모든 사용자의 상태 문서 전체를** 읽어
 * "지금 보낼 게 있나" 를 봤다(versepush · block7Notify). 이제는 '예약표' 다:
 *
 *   b7plan/{uid} = { at, rev, sig, fired:{채널:분}, cur:{제품:{i,last}} }
 *     at    다음에 보낼 시각(ms). 보낼 것이 없으면 null — 1분 틱의 질문(at <= 지금)에 안 걸린다.
 *     rev   그때 읽은 상태 문서의 rev — 30분마다 rev 만 훑어 바뀐 사람만 다시 계산한다.
 *     sig   알림에 관계된 설정의 지문 — rev 가 바뀌어도 이것이 같으면 at 을 건드리지 않는다.
 *     fired 채널마다 마지막으로 보낸 '분' — 틱이 겹치거나 늦어도 두 번 보내지 않는다.
 *     cur   말씀을 고르는 자리(순서대로 도는 방식) · 마지막으로 보낸 말씀.
 *
 * 채널 네 가지
 *   v:block7   BLOCK7 말씀 알림   settings.versePush            → product 가 block7(또는 없음)인 기기
 *   v:sweeter  Sweeter 말씀 알림  productSettings.sweeter.versePush → product 가 sweeter 인 기기
 *   m          할일 하루 요약     settings.notify.morningTime   → BLOCK7 기기
 *   s          시간구간 시작      settings.notify.sections      → BLOCK7 기기
 *
 * ⚠️ 이 파일은 사용자 상태(users/{uid})를 **읽기만** 한다. 데이터 계층은 앱 한 곳이다.
 * ⚠️ 할일·일정을 펼치는 규칙(반복 · 구글 여러 날 일정)은 앱의 getDisplayTasks · getDisplayEvents 를
 *    그대로 옮긴 것이다. 앱을 고치면 여기도 — tests/test_b7push.js 가 둘을 나란히 돌려 어긋나면 실패한다.
 */
const OFF = 9 * 3600e3;                 // 한국 시각 (서머타임 없음)
const MIN = 60e3;
const LATE_MIN = 3;                     // 틱이 늦어도 3분 안이면 보낸다 — 그보다 늦은 알림은 버린다
const AHEAD_DAYS = 8;                   // 다음 시각은 8일 안에서 찾는다 (요일 하나만 켠 경우까지)
const APP = { block7: "https://block7.my/", sweeter: "https://sweeter.my/" };

const DEFAULT_SECS = [
  { id: "dawn", name: "새벽", startTime: "03:00", endTime: "06:00" },
  { id: "am", name: "오전", startTime: "06:00", endTime: "12:00" },
  { id: "morn", name: "점심", startTime: "12:00", endTime: "13:00" },
  { id: "pm", name: "오후", startTime: "13:00", endTime: "18:00" },
  { id: "eve", name: "저녁", startTime: "18:00", endTime: "20:00" },
  { id: "night", name: "밤", startTime: "20:00", endTime: "03:00" },
];
// 앱의 VP_DEFAULTS · _NOTIFY_DEFAULTS 와 같은 값 — 화면에 보이는 기본값과 서버가 어긋나지 않게
const VP_DEF = { order: "random", timesOn: false, times: ["08:00"],
  interval: { on: false, from: "06:00", to: "18:00", everyMin: 60 }, days: [0, 1, 2, 3, 4, 5, 6] };

// ── 시각 ──
const minOf = (ms) => Math.floor((ms + OFF) / MIN);       // 한국 시각 '분 번호'
const msOf = (M) => M * MIN - OFF;
function wall(M) {
  const d = new Date(M * MIN);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay(), hm: ((M % 1440) + 1440) % 1440 };
}
const z = (n) => String(n).padStart(2, "0");
const keyOf = (w) => `${w.y}-${z(w.mo)}-${z(w.d)}`;
function hm(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s == null ? "" : s).trim());
  if (!m) return NaN;
  const v = +m[1] * 60 + +m[2];
  return v >= 0 && v < 1440 ? v : NaN;
}
// 앱의 todayKey(logicalNow) — '하루 시작 시각' 전이면 어제 날짜
function logicalKey(M, dsh) {
  const w = wall(M);
  if (dsh > 0 && Math.floor(w.hm / 60) < dsh) return keyOf(wall(M - 1440));
  return keyOf(w);
}

// ── 상태 읽기 ──
// 상태 문서는 두 모양 — 예전 { json } · 압축 { jz: 바이트(UTF-8 JSON 을 raw DEFLATE) } (앱 v26-1025-5, ROADMAP '클라우드 문서 1MB 한도')
function parseState(raw) {
  if (!raw) return null;
  try {
    if (raw.jz != null) return JSON.parse(require("zlib").inflateRawSync(Buffer.from(raw.jz)).toString("utf8"));
    return raw.json ? JSON.parse(raw.json) : raw;
  } catch (e) { return null; }
}
function versePushOf(st, product) {
  const s = (st && st.settings) || {};
  if (product === "sweeter") {
    const ps = (st && st.productSettings && st.productSettings.sweeter) || {};
    return ps.versePush || null;      // Sweeter 는 BLOCK7 것을 물려받지 않는다 (앱 _PS_OWN)
  }
  return s.versePush || null;
}
function poolOf(st, product) {
  const s = (st && st.settings) || {};
  if (product === "sweeter") {
    const ps = (st && st.productSettings && st.productSettings.sweeter) || {};
    if (Array.isArray(ps.versePushPool) && ps.versePushPool.length) return ps.versePushPool;
  }
  if (Array.isArray(s.versePushPool) && s.versePushPool.length) return s.versePushPool;
  // 앱이 목록을 아직 안 적었으면 예전처럼 모음에서 모은다
  const pool = [], colls = st.verseCollections || [], active = s.activeColls || [];
  colls.forEach((c) => { if (active.length && !active.includes(c.id)) return; (c.verses || []).forEach((v) => { if (!v.del) pool.push(v); }); });
  if (!pool.length) colls.forEach((c) => (c.verses || []).forEach((v) => { if (!v.del) pool.push(v); }));
  return pool;
}

// ── 설정 → 예약 규칙 (가볍게 미리 풀어 둔다) ──
function verseCfg(vp) {
  if (!vp || !vp.enabled) return null;
  const iv = Object.assign({}, VP_DEF.interval, vp.interval || {});
  const c = {
    days: Array.isArray(vp.days) ? vp.days.slice() : VP_DEF.days.slice(),
    times: vp.timesOn ? (Array.isArray(vp.times) ? vp.times : VP_DEF.times).map(hm).filter((x) => !isNaN(x)) : [],
    iv: null,
  };
  if (iv.on) {
    const from = hm(iv.from), to = hm(iv.to);
    if (!isNaN(from) && !isNaN(to)) c.iv = { from, to, every: Math.max(10, iv.everyMin || VP_DEF.interval.everyMin) };
  }
  if (!c.times.length && !c.iv) return null;
  return c;
}
// 예전 versepush 와 같은 판정 — 범위는 양 끝 포함, 밤을 넘는 범위(22:00~02:00)도 된다, 간격은 '시작'에 맞춘다
function verseFires(c, w) {
  if (!c || !c.days.includes(w.dow)) return false;
  if (c.times.includes(w.hm)) return true;
  const iv = c.iv;
  if (!iv) return false;
  const inRange = iv.from <= iv.to ? (w.hm >= iv.from && w.hm <= iv.to) : (w.hm >= iv.from || w.hm <= iv.to);
  return inRange && ((w.hm - iv.from + 1440) % 1440) % iv.every === 0;
}
function secsOf(st) { return Array.isArray(st.secs) && st.secs.length ? st.secs : DEFAULT_SECS; }
function visOf(st, secs) { return Array.isArray(st.vis) ? st.vis : secs.map((s) => s.id); }
// 구간 시작 알림을 받을 수 있는 구간 — 예전 block7Notify 의 안전장치 그대로
//   '시간 없음' · 0분 구간(시작=마침, 구간이 둘 이상일 때)은 건너뛴다
function secCandidates(st) {
  const secs = secsOf(st), vis = visOf(st, secs);
  return secs.filter((s) => vis.includes(s.id) && !s.noTime && !(secs.length > 1 && s.startTime === s.endTime) && !isNaN(hm(s.startTime)));
}
function notifyOf(st) { return (st && st.settings && st.settings.notify) || null; }

function configOf(st) {
  const n = notifyOf(st);
  const cfg = { v: {}, m: null, s: null, dsh: (st.settings && st.settings.dayStartHour) || 0 };
  ["block7", "sweeter"].forEach((p) => { const c = verseCfg(versePushOf(st, p)); if (c) cfg.v[p] = c; });
  if (n && n.enabled) {
    const mt = hm(n.morningTime || "07:00");
    if (!isNaN(mt)) cfg.m = mt;
    if (n.sections) { const mins = secCandidates(st).map((s) => hm(s.startTime)); if (mins.length) cfg.s = [...new Set(mins)].sort((a, b) => a - b); }
  }
  return cfg;
}
// 지문 — 이것이 같으면 예약을 다시 짤 까닭이 없다
const sigOf = (cfg) => JSON.stringify(cfg);
const hasAny = (cfg) => !!(cfg.v.block7 || cfg.v.sweeter || cfg.m != null || cfg.s);

function channelsAt(cfg, M) {
  const w = wall(M), out = [];
  if (cfg.v.block7 && verseFires(cfg.v.block7, w)) out.push("v:block7");
  if (cfg.v.sweeter && verseFires(cfg.v.sweeter, w)) out.push("v:sweeter");
  if (cfg.m != null && cfg.m === w.hm) out.push("m");
  if (cfg.s && cfg.s.includes(w.hm)) out.push("s");
  return out;
}
// afterM 다음 분부터 처음으로 무엇인가 울리는 분 (없으면 null)
function nextFire(cfg, afterM) {
  if (!hasAny(cfg)) return null;
  for (let M = afterM + 1, end = afterM + AHEAD_DAYS * 1440; M <= end; M++) {
    if (channelsAt(cfg, M).length) return M;
  }
  return null;
}

// ═══ 할일 · 일정 펼치기 — 앱의 getDisplayTasks · getDisplayEvents 를 옮김 ═══
const repRule = (rep) => (rep && (rep.daily || rep.weekly) ? rep : null);
function repBlocked(rep, k) {
  const u = rep && typeof rep.until === "string" && rep.until ? rep.until : null;
  if (u && k > u) return true;
  return !!(rep && Array.isArray(rep.ex) && rep.ex.includes(k));
}
const dateOf = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const weekOfMonth = (date) => Math.ceil(date.getDate() / 7);
function repeatsOn(ev, originK, targetK) {
  if (targetK === originK || targetK < originK || !ev.repeat) return false;
  const r = ev.repeat;
  if (!r.daily && !r.weekly) return false;
  if (repBlocked(r, targetK)) return false;
  const t = dateOf(targetK), dow = t.getDay();
  if (r.daily) {
    const days = r.daysOfWeek !== undefined ? r.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
    if (!days.includes(dow)) return false;
    if (r.weekly) { const weeks = r.weeksOfMonth !== undefined ? r.weeksOfMonth : [1, 2, 3, 4, 5]; if (!weeks.includes(weekOfMonth(t))) return false; }
    return true;
  }
  if (dow !== dateOf(originK).getDay()) return false;
  const weeks = r.weeksOfMonth !== undefined ? r.weeksOfMonth : [1, 2, 3, 4, 5];
  return weeks.includes(weekOfMonth(t));
}
function occursOnOwn(ev, originK) {
  if (!ev.repeat) return true;
  const r = ev.repeat;
  if (!r.daily && !r.weekly) return true;
  if (repBlocked(r, originK)) return false;
  const o = dateOf(originK);
  if (r.daily) return (r.daysOfWeek !== undefined ? r.daysOfWeek : [0, 1, 2, 3, 4, 5, 6]).includes(o.getDay());
  return (r.weeksOfMonth !== undefined ? r.weeksOfMonth : [1, 2, 3, 4, 5]).includes(weekOfMonth(o));
}
function ridPresentOn(days, k, rid) {
  const day = days[k];
  if (!day || !rid) return false;
  return [day.big, day.small].some((bag) => bag && Object.keys(bag).some((sid) => Array.isArray(bag[sid]) && bag[sid].some((it) => it && it.rid === rid)));
}
function taskRoots(days) {
  const out = [];
  Object.keys(days).forEach((k) => {
    const day = days[k];
    if (!day) return;
    [["big", day.big], ["small", day.small]].forEach(([type, bag]) => {
      if (!bag) return;
      Object.keys(bag).forEach((secId) => {
        const arr = bag[secId];
        if (Array.isArray(arr)) arr.forEach((it) => { if (it && it.repeat && repRule(it.repeat)) out.push({ k, type, secId, item: it }); });
      });
    });
  });
  return out;
}
function displayTasks(st, k, secId, type, todayK) {
  const days = st.days || {}, day = days[k];
  const own = (day && day[type] && day[type][secId]) || [];
  if (k < todayK) return own;
  const extra = [];
  taskRoots(days).forEach((r) => {
    if (r.type !== type || r.secId !== secId || r.k >= k) return;
    if (r.item.rid && ridPresentOn(days, k, r.item.rid)) return;
    if (!repeatsOn(r.item, r.k, k)) return;
    extra.push({ text: r.item.text, done: false, daily: true, rid: r.item.rid, _repeatPreview: true });
  });
  return extra.length ? [...own, ...extra] : own;
}
function spanN(ev, dsh) {
  if (!ev || !ev.g || ev.repeat) return 1;
  const d = ev.g.d | 0;
  if (!ev.time) return Math.min(62, Math.max(1, d || 1));
  const [h, mi] = ev.time.split(":").map(Number);
  let s = h * 60 + mi;
  if (dsh > 0 && h < dsh) s += 1440;
  return Math.min(62, Math.max(1, Math.ceil((s - dsh * 60 + Math.max(0, d)) / 1440)));
}
const dayDiff = (a, b) => { const p = (k) => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 864e5); };
function sortByTime(evs) {
  return evs.map((e, i) => ({ e, i })).sort((a, b) => {
    const at = a.e.time, bt = b.e.time;
    if (!at && !bt) return a.i - b.i;
    if (!at) return -1;
    if (!bt) return 1;
    if (at !== bt) return at < bt ? -1 : 1;
    return a.i - b.i;
  }).map((x) => x.e);
}
function displayEvents(st, k, secId) {
  const days = st.days || {}, dsh = (st.settings && st.settings.dayStartHour) || 0;
  const own = ((days[k] && days[k].events && days[k].events[secId]) || []).filter((ev) => occursOnOwn(ev, k));
  const spans = [], virtual = [];
  Object.keys(days).forEach((ok) => {
    if (ok >= k) return;
    const evs = days[ok] && days[ok].events && days[ok].events[secId];
    if (!evs || !evs.length) return;
    evs.forEach((ev) => {
      if (ev.repeat && repeatsOn(ev, ok, k)) virtual.push(ev);
      else if (ev.g && !ev.repeat) { const n = spanN(ev, dsh); if (n > 1 && dayDiff(ok, k) < n) spans.push(ev); }
    });
  });
  return [...spans, ...own, ...sortByTime(virtual)];
}
// 알림에 싣는 한 구간의 줄들 — 일정 먼저, 그 다음 안 끝난 할일 (예전 block7Notify 와 같은 차례)
function secItems(st, k, secId, includeSmall, todayK) {
  const evs = displayEvents(st, k, secId).filter((e) => e && String(e.text || "").trim())
    .map((e) => (e.time ? `${e.time} ${String(e.text).trim()}` : String(e.text).trim()));
  const types = includeSmall === false ? ["big"] : ["big", "small"];
  const tasks = [];
  types.forEach((t) => displayTasks(st, k, secId, t, todayK).forEach((it) => { if (it && !it.done && String(it.text || "").trim()) tasks.push(String(it.text).trim()); }));
  return [...evs, ...tasks];
}

// ═══ 말씀 고르기 ═══
// 예전 versepush 는 '최신순 · 등록순 · 좋아요순 …' 이면 **늘 맨 위 하나만** 보냈다 (같은 말씀이 계속 옴).
// '성경순' 은 서버가 몰라서 랜덤이었다. 이제 그 순서대로 **한 바퀴씩 돈다**(cur.i).
// 랜덤은 방금 보낸 것을 한 번 피한다.
function countLog(st, key) {
  const cnt = {};
  Object.values(st[key] || {}).forEach((arr) => {
    const list = Array.isArray(arr) ? arr : Object.values(arr || {}).flat();
    list.forEach((e) => { if (e && e.ref) cnt[e.ref] = (cnt[e.ref] || 0) + 1; });
  });
  return cnt;
}
const vKey = (v) => String((v && (v.key || v.ref)) || "");
function orderedPool(st, pool, order) {
  const idx = pool.map((v, i) => ({ v, i }));
  const by = (f) => idx.sort((a, b) => f(a, b) || a.i - b.i).map((x) => x.v);
  if (order === "added") return pool.slice();
  if (order === "recent") return pool.slice().reverse();
  if (order === "bible") return by((a, b) => (a.v.br == null ? 1e12 : a.v.br) - (b.v.br == null ? 1e12 : b.v.br));
  const logKey = { like: "verseLikeLog", mem: "memorizationLog", deeper: "verseDeeperLog", even: "verseEvenDeeperLog" }[order];
  if (logKey) { const c = countLog(st, logKey); return by((a, b) => (c[b.v.ref] || 0) - (c[a.v.ref] || 0)); }
  return null;   // random
}
function pickVerse(st, product, order, cur, rnd) {
  const pool = poolOf(st, product).filter((v) => v && String(v.krText || "").trim());
  cur = cur || {};
  if (!pool.length) return { verse: null, cur };
  const list = orderedPool(st, pool, order);
  if (!list) {
    let cand = pool;
    if (pool.length > 1 && cur.last) cand = pool.filter((v) => vKey(v) !== cur.last);
    const v = cand[Math.floor((rnd || Math.random)() * cand.length)] || pool[0];
    return { verse: v, cur: { last: vKey(v) } };
  }
  const i = Number.isInteger(cur.i) && cur.i >= 0 ? cur.i % list.length : 0;
  const v = list[i];
  return { verse: v, cur: { i: (i + 1) % list.length, last: vKey(v) } };
}

// ═══ 보낼 것 만들기 ═══
function verseMsg(st, product, v) {
  const vp = Object.assign({}, VP_DEF, versePushOf(st, product) || {});
  const iv = Object.assign({}, VP_DEF.interval, vp.interval || {});
  const title = [v.cat, v.topic].filter(Boolean).join(" · ") || (product === "sweeter" ? "Sweeter" : "BLOCK7");
  const openKey = v.key || v.ref || "";
  const everyMin = iv.on ? Math.max(10, iv.everyMin || 60) : 30;
  return {
    product, kind: "verse",
    title, body: `${String(v.krText || "").trim()}\n${v.ref || ""}`.trim(),
    ref: openKey, link: APP[product] + "?verse=" + encodeURIComponent(openKey),
    tag: product + "-verse",
    ttl: Math.max(300, Math.min(3600, everyMin * 60)),   // 다음 알림이 올 때까지만 — 늦은 것은 버려진다
  };
}
function suffixOf(n, key) {
  if (typeof n[key] === "string") return n[key];
  if (typeof n.titleSuffix === "string") return n.titleSuffix;   // 옛 단일 문구
  return "할 일";
}
function morningMsg(st, k, todayK) {
  const n = notifyOf(st) || {};
  const secs = secsOf(st), vis = visOf(st, secs), lines = [];
  secs.forEach((sec) => {
    if (!vis.includes(sec.id)) return;
    const items = secItems(st, k, sec.id, n.includeSmall, todayK);
    if (items.length) lines.push(`${sec.name}: ${items.join(", ")}`);
  });
  return {
    product: "block7", kind: "todo",
    title: ("오늘 " + suffixOf(n, "morningSuffix")).trim(),
    body: (lines.length ? lines.join("\n") : "오늘 등록된 할일·일정이 없어요.").slice(0, 900),
    ref: "", link: APP.block7, tag: "b7-morning", ttl: 3600,
  };
}
// 같은 시각에 걸린 구간이 여럿이면 할 것이 있는 **첫 구간 하나만** (예전 firedSlot)
function sectionMsg(st, k, w, todayK) {
  const n = notifyOf(st) || {};
  for (const sec of secCandidates(st)) {
    if (hm(sec.startTime) !== w.hm) continue;
    const items = secItems(st, k, sec.id, n.includeSmall, todayK);
    if (!items.length) continue;                       // 빈 구간은 조용히 넘어간다
    return {
      product: "block7", kind: "todo",
      title: `${sec.name} ${sec.notifyPhrase || suffixOf(n, "sectionSuffix")}`.trim(),
      body: items.join("\n").slice(0, 900),
      ref: "", link: APP.block7, tag: "b7-sec-" + sec.id, ttl: 3600,
    };
  }
  return null;
}

/* 예약표 한 칸을 처리한다.
 *   plan  예전 칸 ({at, fired, cur, …}) · 없으면 {}
 *   now   지금(ms)
 * 돌려주는 것: { sends:[메시지], plan:{at, sig, fired, cur} }
 *   at 은 다음에 울릴 시각(ms) 또는 null.
 * 보낼지는 **지금 읽은 상태**로 다시 판정한다 — 예약을 짠 뒤 설정이 바뀌었으면 옛 예약대로 보내지 않는다.
 */
function process(st, plan, now, rnd) {
  plan = plan || {};
  const cfg = configOf(st), nowM = minOf(now);
  const fired = Object.assign({}, plan.fired || {}), cur = Object.assign({}, plan.cur || {});
  const sends = [];
  const lo = Math.max(plan.at != null ? minOf(plan.at) : nowM, nowM - LATE_MIN);
  ["v:block7", "v:sweeter", "m", "s"].forEach((ch) => {
    let hit = null;
    for (let M = nowM; M >= lo; M--) { if (channelsAt(cfg, M).includes(ch) && (fired[ch] || 0) < M) { hit = M; break; } }
    if (hit == null) return;
    fired[ch] = hit;
    const w = wall(hit), todayK = logicalKey(hit, cfg.dsh);
    if (ch[0] === "v") {
      const product = ch.slice(2), vp = versePushOf(st, product) || {};
      const r = pickVerse(st, product, vp.order || "random", cur[product], rnd);
      cur[product] = r.cur;
      if (r.verse) sends.push(verseMsg(st, product, r.verse));
    } else if (ch === "m") {
      sends.push(morningMsg(st, todayK, todayK));
    } else {
      const m = sectionMsg(st, todayK, w, todayK);
      if (m) sends.push(m);
    }
  });
  const nx = nextFire(cfg, nowM);
  return { sends, plan: { at: nx == null ? null : msOf(nx), sig: sigOf(cfg), fired, cur } };
}
// 상태가 바뀌었을 때 — 지문이 같으면 예약을 그대로 두고, 다르면 지금부터 다시 짠다 (보내지는 않는다)
function replan(st, plan, now) {
  plan = plan || {};
  const cfg = configOf(st), sig = sigOf(cfg);
  if (plan.sig === sig && plan.at !== undefined) return { changed: false, plan };
  const nx = nextFire(cfg, minOf(now) - 1);   // 바로 이 분도 후보 — 지금 켠 것이 이 분에 울려야 하면 놓치지 않게
  return { changed: true, plan: Object.assign({}, plan, { at: nx == null ? null : msOf(nx), sig }) };
}

// 기기 고르기 — 옛 기기(product 표시 없음)는 BLOCK7 로 본다
const productOfToken = (t) => (t && t.product === "sweeter" ? "sweeter" : "block7");

module.exports = {
  OFF, LATE_MIN, APP, DEFAULT_SECS,
  minOf, msOf, wall, hm, logicalKey, parseState, versePushOf, poolOf,
  verseCfg, verseFires, configOf, sigOf, hasAny, channelsAt, nextFire,
  repeatsOn, occursOnOwn, displayTasks, displayEvents, secItems,
  orderedPool, pickVerse, verseMsg, morningMsg, sectionMsg, process, replan, productOfToken,
};
