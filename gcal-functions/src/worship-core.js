/* 예배팀 일정 받기 — 판단만 (서버 · 시험이 함께 쓴다). 교역자 로테이션 R13 (HB 2026-11-16)
 *
 * 예배팀 개발자 명세 v1(2026-11-16): GET API → { generatedAt, from, to, services: [{ date, time, serviceId, service, special, status, updatedAt, leaders:[{id,name}], members:[{id,name,part}] }] }
 * 지키는 것:
 *   - 인도자(leaders)는 모두 남긴다(이름 · 예배팀 id).
 *   - 팀원(members)은 **우리 명단에 든 분만** 남긴다(사람 id · 파트). 나머지는 받자마자 버린다 — 예배팀 개발자께 한 약속.
 *   - 맞추기: 예배팀 id → 우리 사람 id 를 map 에 남긴다. 처음 한 번은 이름(띄어쓰기 무시)으로, 그 뒤로는 id 로만.
 *     같은 이름이 둘(예배팀 id 둘 · 우리 사람 둘)이면 맞추지 않고 dup 에 — HB 가 고른다(짐작 금지).
 *   - 기간은 매번 통째로 바꿔 끼운다(지운 배정은 따로 알려 주지 않는다 — 명세 6장).
 */
const API = "https://tlcworship.gabia.io/api/external/schedule";
const STATUS = ["tentative", "confirmed", "changed"];
const MIN_GAP = 10 * 60e3;          // '지금 받기' 는 10분에 한 번
const MAX_SVC = 400, MAX_MEM = 40;

const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const norm = (s) => String(s || "").replace(/\s+/g, "");
const okDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "") && !isNaN(Date.parse(d + "T00:00:00Z")) && new Date(d + "T00:00:00Z").toISOString().slice(0, 10) === d;
const okId = (s) => typeof s === "string" && /^[A-Za-z0-9-]{1,64}$/.test(s);

// wkeys = { 사람 id: [이름, 다른 이름…] } (앱이 문서 맨 위에 적어 둔 것) → { 이름(띄어쓰기 뺌): [사람 id…] }
function nameIndex(wkeys) {
  const ix = {};
  for (const [pid, names] of Object.entries(wkeys || {})) {
    if (!okId(pid) || !Array.isArray(names)) continue;
    for (const k of new Set(names.map(norm).filter(Boolean))) (ix[k] = ix[k] || []).includes(pid) || ix[k].push(pid);
  }
  return ix;
}

// 받은 응답 → 저장할 모양. prevMap = 지난번 { 예배팀 id: 사람 id }
function digest(resp, wkeys, prevMap) {
  if (!resp || typeof resp !== "object" || !Array.isArray(resp.services) || !okDate(resp.from) || !okDate(resp.to))
    throw Object.assign(new Error("shape"), { code: "shape" });
  const pids = new Set(Object.keys(wkeys || {}).filter(okId));
  const ix = nameIndex(wkeys);
  // 지난 맞춤 중 아직 명단에 있는 분만
  const map = {};
  for (const [w, p] of Object.entries(prevMap || {})) if (okId(w) && pids.has(p)) map[w] = p;
  // 이번 응답의 사람들: 이름 → 예배팀 id 들
  const people = {};
  for (const s of resp.services) for (const x of [].concat(s && s.leaders || [], s && s.members || [])) {
    if (!x || !okId(x.id)) continue;
    const k = norm(str(x.name, 30)); if (!k) continue;
    (people[k] = people[k] || new Set()).add(x.id);
  }
  const dup = new Set();
  const taken = new Set(Object.values(map));
  for (const [k, ws] of Object.entries(people)) {
    const cand = ix[k] || [];
    const fresh = [...ws].filter((w) => !map[w]);
    if (!fresh.length || !cand.length) continue;
    if (ws.size > 1 || cand.length > 1) { dup.add(k); continue; }   // 같은 이름 둘 — 맞추지 않음
    if (taken.has(cand[0])) continue;                               // 그분은 이미 다른 예배팀 id 와 맞춰져 있음
    map[fresh[0]] = cand[0]; taken.add(cand[0]);
  }
  const services = [];
  for (const s of resp.services.slice(0, MAX_SVC)) {
    if (!s || !okDate(s.date) || !okId(s.serviceId)) continue;
    const leaders = (Array.isArray(s.leaders) ? s.leaders : []).filter((x) => x && okId(x.id)).slice(0, 6).map((x) => {
      const o = { w: x.id, name: str(x.name, 30) }; if (map[x.id]) o.pid = map[x.id]; return o;
    });
    const members = (Array.isArray(s.members) ? s.members : []).filter((x) => x && okId(x.id) && map[x.id]).slice(0, MAX_MEM)
      .map((x) => ({ pid: map[x.id], part: str(x.part, 20) }));
    services.push({
      date: s.date,
      time: /^\d{2}:\d{2}$/.test(s.time || "") ? s.time : null,
      sid: s.serviceId,
      service: str(s.service, 30),
      special: s.special === true,
      status: STATUS.includes(s.status) ? s.status : "tentative",   // 모르는 표시는 '미정' 으로 (확정이라 짐작하지 않음)
      upd: str(s.updatedAt, 40),
      leaders, members,
    });
  }
  return { from: resp.from, to: resp.to, gen: str(resp.generatedAt, 40), services, map, dup: [...dup].sort() };
}

// 오류 → 짧은 표시 (열쇠 값 · 응답 내용은 담지 않는다)
function errOf(status) {
  if (status === 401 || status === 403) return "key";
  if (status === 429) return "limit";
  if (status === 503) return "off";
  return "server";
}
const due = (lastAt, now) => !lastAt || now - lastAt >= MIN_GAP;

module.exports = { API, STATUS, MIN_GAP, norm, okDate, okId, nameIndex, digest, errOf, due };
