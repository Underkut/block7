/* 기도노트 시리로 기도 넣기 — 서버 쪽 규칙 (2026-10-30, docs/ROADMAP.md '기도노트 시리로 기도 넣기'). 시험: tests/test_praysiri.js
 *
 * BLOCK7 시리(b7siri-core.js)와 달리 **말 풀기를 서버가 한다** — 시리가 '어디에 넣었는지' 바로 되읽어 줘야 하고,
 * 골라서 넣기는 어차피 서버가 그룹 목록을 줘야 해서. 서버가 이름을 아는 길은 앱이 써 두는 차림표(pray/{uid}/c/siridir) 하나뿐이다.
 *   차림표: { v:1, g:[{i:id, n:이름, p:부모 id('' = 그룹), a:[연동한 다른 그룹 id]}] } — 지도 차례
 *
 * 여기는 ① 말 끝 떼기(…라고 기도 추가해 줘) ② 그룹 · 서브그룹 이름 맞추기 ③ 다시 물었을 때 두 말 잇기
 *        ④ 골라서 넣기(목록 · 길) ⑤ 쪽지 모양 ⑥ 시리가 읽어 줄 대답. 화면 · 데이터베이스는 모른다.
 */

const HOLD = "시리로 받은 기도";          // 못 알아들은 것을 모아 두는 그룹 (앱 inboxApply 와 같은 이름)
const HERE = "여기에 바로 넣기";           // 골라서 넣기 — 서브그룹 목록 맨 위
const NEW_SUB = "새 서브그룹 만들기";      //                 서브그룹 목록 맨 아래
const NEW_GROUP = "새 그룹 만들기";        //                 그룹 목록 맨 아래
const SAY_NAME = "새 그룹 이름 말하기";     //                 '새 그룹 만들기' 를 고른 다음 목록(하나뿐)
const MAX_NAME = 60;                       // 그룹 · 서브그룹 이름
const LIST_MAX = 8;                        // 다시 물을 때 읽어 주는 그룹 이름 수

const nk = (s) => String(s || "").replace(/\s+/g, "").toLowerCase();
const clean = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

// ── 받침 ── 조사를 뗄지 붙일지 (을/를 · 이라고/라고 · 으로/로)
function jong(ch) {
  const c = String(ch || "").charCodeAt(0) - 0xac00;
  return c >= 0 && c < 11172 ? c % 28 : -1;   // -1 한글 아님 · 0 받침 없음 · 8 = ㄹ
}
const hasJong = (ch) => jong(ch) > 0;
const lastCh = (s) => String(s || "").slice(-1);
const josa = (w, a, b) => w + (hasJong(lastCh(w)) ? a : b);   // josa('청년부','을','를')

// ── 차림표 ──
function dirOf(raw) {
  const g = (raw && Array.isArray(raw.g) ? raw.g : [])
    .filter((e) => e && typeof e.i === "string" && e.i && clean(e.n))
    .map((e) => ({ i: e.i, n: clean(e.n), p: typeof e.p === "string" ? e.p : "", a: Array.isArray(e.a) ? e.a.filter((x) => typeof x === "string") : [] }));
  const ids = new Set(g.map((e) => e.i));
  g.forEach((e) => { if (e.p && !ids.has(e.p)) e.p = ""; });
  return { g, ok: !!(raw && Array.isArray(raw.g)) };
}
const topsOf = (dir) => dir.g.filter((e) => !e.p);
const kidsOf = (dir, id) => dir.g.filter((e) => e.p === id || e.a.indexOf(id) >= 0);
const byId = (dir, id) => dir.g.find((e) => e.i === id) || null;
const holdOf = (dir) => topsOf(dir).find((e) => nk(e.n) === nk(HOLD)) || null;

// ── ① 말 끝 떼기 ──
// "김○○ 회복이라고 기도 추가해 줘" → { body:'김○○ 회복', kind:'item' } · "새가족이라고 서브그룹 추가" → kind 'sub' · "… 그룹 만들어 줘" → 'group'
// ⚠️ 낱말에 붙은 것은 떼지 않는다 — '새벽기도 추가' 의 '기도' · '대학 등록금' 의 '등록' (앞이 띄어쓰기 · 조사일 때만)
const VERB_RE = /(추가|넣|만들|등록|생성|저장)(?:\s*(?:해|어|여|기|하기))?(?:\s*(?:줘요?|주세요|줄래요?|주라|요))?[\s.!?~]*$/;
const KIND_RE = /(서브\s*그룹|하위\s*그룹|작은\s*그룹|소\s*그룹|그룹|기도\s*제목|기도\s*항목|기도|항목)(?:을|를|으로|로|에|하나를?|하나만)?\s*$/;
const BOUND_RE = /(?:^|\s|라고|라는|으로|로|을|를|그룹|기도|항목|제목)$/;   // 떼는 말 바로 앞이 이것이어야 한다
function cutTail(s, re) {
  const m = s.match(re);
  if (!m) return null;
  const before = s.slice(0, m.index);
  if (before && !BOUND_RE.test(before)) return null;
  return { before: before.replace(/\s+$/, ""), m };
}
// 따옴표 조사 — 받침에 맞을 때만 뗀다 ('마을' 의 '을' · '아이라고' 의 '이' 는 남긴다)
function cutQuote(s, strong) {
  let t = s, m;
  if ((m = t.match(/\s*(라고|라는|라구)$/))) {
    t = t.slice(0, m.index);
    if (/이$/.test(t) && t.length > 1 && hasJong(t.slice(-2, -1))) t = t.slice(0, -1);
    return t.replace(/\s+$/, "");
  }
  if (!strong) return t;
  if ((m = t.match(/(을|를|으로|로)$/)) && t.length > m[1].length) {
    const p = t.slice(0, -m[1].length), j = jong(lastCh(p));
    const ok = m[1] === "을" ? j > 0 : m[1] === "를" ? j === 0 : m[1] === "으로" ? j > 0 && j !== 8 : j === 0 || j === 8;
    if (ok) return p.replace(/\s+$/, "");
  }
  return t;
}
function cutEnd(say) {
  let s = clean(say), kind = "item", verb = false;
  const v = cutTail(s, VERB_RE);
  if (v) { s = v.before; verb = true; }
  const k = cutTail(s, KIND_RE);
  if (k && (verb || /그룹/.test(k.m[1]))) {
    s = k.before;
    const w = nk(k.m[1]);
    kind = /그룹$/.test(w) ? (w === "그룹" ? "group" : "sub") : "item";
  }
  s = cutQuote(s, verb);
  return { body: clean(s), kind };
}

// ── ② 이름 맞추기 ──
// 말의 **앞**에서 차림표 이름을 찾는다 — 띄어쓰기는 무시, 가장 긴 이름 먼저. 이름 뒤는 띄어쓰기 · 조사 · 끝이어야 한다
// ('청년' 이 '청년부에' 를 먹지 않게). 같은 말이 없으면 한 글자 틀린 것까지(세 글자 넘는 이름 · 하나로 정해질 때만).
const PART_RE = /^(?:에다가|에다|에서|에게|한테|안에|밑에|아래에|아래|쪽에|의|에|으로|로|,)/;
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function matchHead(s, cands) {
  const src = clean(s);
  const pos = [];   // 띄어쓰기를 뺀 글자 → 원래 자리
  for (let i = 0; i < src.length; i++) if (!/\s/.test(src[i])) pos.push(i);
  const comp = nk(src);
  const cut = (L) => {   // 띄어쓰기 뺀 L 글자 다음부터의 원래 글
    const at = L >= pos.length ? src.length : pos[L - 1] + 1;   // 맞춘 마지막 글자 바로 뒤 (띄어쓰기를 살린다)
    const rest = src.slice(at);
    if (rest && !/^\s/.test(rest) && !PART_RE.test(rest)) return null;   // 이름이 낱말 가운데서 끊겼다
    const pm = rest.match(PART_RE);
    return { rest: clean(rest.replace(PART_RE, "")), part: pm ? pm[0] : "" };
  };
  let best = [];
  cands.forEach((e) => {
    const c = nk(e.n);
    if (!c || !comp.startsWith(c)) return;
    const k = cut(c.length);
    if (k == null) return;
    const o = { e, L: c.length, rest: k.rest, part: k.part };
    if (!best.length || c.length > best[0].L) best = [o];
    else if (c.length === best[0].L) best.push(o);
  });
  if (!best.length) {
    const fz = [];
    cands.forEach((e) => {
      const c = nk(e.n);
      if (c.length < 3) return;
      for (let L = c.length - 1; L <= c.length + 1; L++) {
        if (L > comp.length || lev(comp.slice(0, L), c) > 1) continue;
        const k = cut(L);
        if (k != null) { fz.push({ e, L, rest: k.rest, part: k.part, fuzzy: true }); break; }
      }
    });
    best = fz;
  }
  if (!best.length) return null;
  const ids = [...new Set(best.map((b) => b.e.i))];
  if (ids.length === 1) return best[0];
  const tops = best.filter((b) => !b.e.p);   // 그룹과 서브그룹 이름이 같으면 그룹
  if (tops.length === 1) return tops[0];
  return { amb: true, name: best[0].e.n };
}

// ── 한 번에 말하기 풀기 ──
// 돌려주는 것: { ok:true, kind:'item'|'sub'|'group', gid, top, sub, text } 또는 { ok:false, why:'nogroup'|'notext'|'amb'|'dup', name?, top?, sub? }
function parse(say, dir) {
  const { body, kind } = cutEnd(say);
  if (!body) return { ok: false, why: "notext" };
  const tops = topsOf(dir);
  if (kind === "group") {
    // 'A 에 B 라고 그룹 추가' 는 A 아래 서브그룹으로 읽는다 (그룹은 두 단까지)
    const h = matchHead(body, tops);
    if (h && !h.amb && h.rest && /^(?:에|안에|밑에|아래)/.test(h.part)) return subOf(dir, h.e, h.rest);
    return groupOf(dir, body);
  }
  const h = matchHead(body, dir.g);
  if (!h) return { ok: false, why: "nogroup" };
  if (h.amb) return { ok: false, why: "amb", name: h.name };
  const top = h.e.p ? byId(dir, h.e.p) : h.e;
  if (kind === "sub") return subOf(dir, top, h.rest);
  if (!h.e.p) {   // 그룹을 찾았으면 그 아래 서브그룹도 찾아본다
    const s = h.rest ? matchHead(h.rest, kidsOf(dir, h.e.i)) : null;
    if (s && !s.amb) return itemOf(h.e, s.e, s.rest);
  }
  return h.e.p ? itemOf(top, h.e, h.rest) : itemOf(h.e, null, h.rest);
}
function itemOf(top, sub, text) {
  const t = clean(text);
  if (!t) return { ok: false, why: "notext", top: top && top.n, sub: sub && sub.n };
  return { ok: true, kind: "item", gid: (sub || top).i, top: top.n, sub: sub ? sub.n : "", text: t.slice(0, 200) };
}
function subOf(dir, top, name) {
  const n = clean(name).slice(0, MAX_NAME);
  if (!n) return { ok: false, why: "notext", top: top.n };
  const has = kidsOf(dir, top.i).find((k) => nk(k.n) === nk(n));
  if (has) return { ok: false, why: "dup", top: top.n, sub: has.n };
  return { ok: true, kind: "sub", gid: top.i, top: top.n, sub: n, text: n };
}
function groupOf(dir, name) {
  const n = clean(name).slice(0, MAX_NAME);
  if (!n) return { ok: false, why: "notext" };
  const has = topsOf(dir).find((t) => nk(t.n) === nk(n));
  if (has) return { ok: false, why: "dup", top: has.n };
  return { ok: true, kind: "group", gid: "", top: n, sub: "", text: n };
}

// ── ③ 다시 물었을 때 ── 둘째 말(say)만으로 풀리면 그것. 아니면 첫 말(prev)의 앞(못 알아들은 그룹 자리 — '…에')을
// 둘째 말로 갈아 끼워 본다. 첫 말에 그런 자리가 없으면 둘째 말 + 첫 말 · 첫 말 + 둘째 말.
function parseAgain(say, prev, dir) {
  const a = parse(say, dir);
  if (a.ok || !clean(prev)) return a;
  const p = clean(prev), s = clean(say);
  const tries = [];
  const m = p.match(/^\S+?(?:에다가|에다|에서|에)\s+/);
  if (m) tries.push(s + " " + p.slice(m[0].length));
  tries.push(s + " " + p);
  tries.push(p + " " + s);   // 첫 말이 그룹뿐이었고('…에 무엇을 넣을지 다시') 둘째가 내용일 때
  for (const t of tries) { const r = parse(t, dir); if (r.ok || r.why === "dup") return r; }
  return a;
}

// ── ④ 골라서 넣기 ──
function listTops(dir) { return topsOf(dir).map((e) => e.n).filter((n, i, a) => a.indexOf(n) === i).concat([NEW_GROUP]); }
function listKids(dir, g) {
  if (clean(g) === NEW_GROUP) return [SAY_NAME];
  const top = topsOf(dir).find((e) => e.n === clean(g)) || topsOf(dir).find((e) => nk(e.n) === nk(g));
  const kids = top ? kidsOf(dir, top.i).map((e) => e.n).filter((n, i, a) => a.indexOf(n) === i) : [];
  return [HERE].concat(kids, [NEW_SUB]);
}
// 고른 길 { g, s } + 말한 것 → parse 와 같은 모양. 그룹이 그새 사라졌으면 nogroup (→ 받은 기도)
function parsePath(g, s, say, dir) {
  const body = cutEnd(say).body;
  if (!body) return { ok: false, why: "notext" };
  if (clean(g) === NEW_GROUP) return groupOf(dir, body);
  const top = topsOf(dir).find((e) => e.n === clean(g)) || topsOf(dir).find((e) => nk(e.n) === nk(g));
  if (!top) return { ok: false, why: "nogroup" };
  const sv = clean(s);
  if (sv === NEW_SUB) return subOf(dir, top, body);
  if (!sv || sv === HERE) return itemOf(top, null, body);
  const sub = kidsOf(dir, top.i).find((e) => e.n === sv) || kidsOf(dir, top.i).find((e) => nk(e.n) === nk(sv));
  return itemOf(top, sub || null, body);   // 서브그룹이 그새 사라졌으면 그룹에
}

// ── ⑤ 쪽지 ── 앱 inboxApply 가 받는 모양 {id, from:'siri', say, at, gid, text, kind?, hold?}
function note(r, say, now, rnd) {
  const n = { id: "siri-" + now.toString(36) + "-" + rnd, from: "siri", say: clean(say).slice(0, 400), at: now, gid: r.gid || "", text: r.text };
  if (r.kind === "sub" || r.kind === "group") n.kind = r.kind;
  if (r.hold) n.hold = 1;
  return n;
}
// 못 알아들은 것 — '시리로 받은 기도' 에. 말한 것은 떼지 않고 그대로 넣는다(잃지 않게): 말 끝만 뗀다.
function holdNote(dir, say, prev) {
  const first = clean(prev) || clean(say);
  const text = (cutEnd(first).body || first).slice(0, 200);
  const h = holdOf(dir);
  return { ok: true, kind: "item", hold: true, gid: h ? h.i : "", top: HOLD, sub: "", text };
}

// ── ⑥ 시리가 읽어 줄 대답 ── 단축어의 '만약' 은 대답에 '다시 말해' 가 있는지로 갈린다 → 다시 묻는 대답에만 그 말을 쓴다
const where = (r) => (r.sub ? r.top + "의 " + r.sub : r.top);
const REPLY = {
  ok: (r) => r.kind === "sub" ? { code: "ok", msg: `${r.top}에 서브그룹 ${josa(r.sub, "을", "를")} 만들었어요.` }
    : r.kind === "group" ? { code: "ok", msg: `그룹 ${josa(r.top, "을", "를")} 만들었어요.` }
    : r.hold ? { code: "hold", msg: `그룹을 찾지 못해서 '${HOLD}'에 넣어 두었어요. 기도노트에서 옮겨 주세요. ${r.text}` }
    : { code: "ok", msg: `${where(r)}에 넣었어요. ${r.text}` },
  dup: (r) => ({ code: "dup", msg: r.sub ? `${r.top}에 ${r.sub} 서브그룹이 이미 있어요.` : `${r.top} 그룹이 이미 있어요.` }),
  retry: (r, dir) => {
    if (r.why === "notext") return { code: "retry", msg: r.top ? `${where(r)}에 무엇을 넣을지 다시 말해 주세요.` : "들은 말이 없어요. 다시 말해 주세요." };
    if (r.why === "amb") return { code: "retry", msg: `${josa(r.name, "이", "가")} 여러 그룹에 있어요. 그룹 이름을 다시 말해 주세요.` };
    const ns = topsOf(dir).map((e) => e.n).filter((n) => nk(n) !== nk(HOLD)).slice(0, LIST_MAX);
    return { code: "retry", msg: "어느 그룹인지 못 알아들었어요. 그룹 이름을 다시 말해 주세요." + (ns.length ? ` 그룹은 ${josa(ns.join(", "), "이", "가")} 있어요.` : "") };
  },
  noText: { code: "notext", msg: "들은 말이 없어서 넣지 않았어요." },
  noDir: { code: "nodir", msg: `기도노트가 아직 그룹 목록을 보내지 않았어요. 기도노트를 한 번 열어 주세요. 이번 것은 '${HOLD}'에 넣어 두었어요.` },
  badKey: { code: "badkey", msg: "주소가 맞지 않아요. 기도노트 설정의 시리로 기도 넣기에서 주소를 다시 복사해 주세요." },
  full: { code: "full", msg: "쪽지가 너무 많이 쌓였어요. 기도노트를 한 번 열어 주세요." },
  fail: { code: "fail", msg: "지금은 보내지 못했어요. 잠시 뒤에 해 주세요." },
};

// ── 단축어가 보낸 것 — JSON · 양식 · 글 그대로 · 주소(?text= · 브라우저로 시험할 때) 어느 모양이든 ──
// { text, try, prev, g, s, list } — 글은 공백을 고르고 자른다
function bodyOf(req) {
  let b = req && req.body;
  if (Buffer.isBuffer(b)) b = b.toString("utf8");
  if (typeof b === "string" && /^\s*\{/.test(b)) { try { b = JSON.parse(b); } catch (e) { /* 글 그대로 */ } }
  if (typeof b === "string") b = { text: b };
  if (!b || typeof b !== "object") b = {};
  const q = (req && req.query) || {};
  const pick = (k, n) => { let v = b[k] != null && b[k] !== "" ? b[k] : q[k]; if (v == null || typeof v === "object") v = ""; return clean(v).slice(0, n); };
  const text = pick("text", 200) || pick("t", 200);
  return { text, try: pick("try", 4), prev: pick("prev", 200), g: pick("g", MAX_NAME), s: pick("s", MAX_NAME), list: pick("list", 4) };
}
// 골라서 넣기 목록 — 단축어가 '텍스트 분할(줄 바꿈)' → '목록에서 선택' 한다
function listText(b, rawDir) {
  const dir = dirOf(rawDir);
  if (!dir.ok) return "기도노트를 한 번 열어 주세요";
  return (clean(b.g) ? listKids(dir, b.g) : listTops(dir)).join("\n");
}

// ── 한 번 받기 — 처리기가 부른다. 무엇을 쓸지(note)와 무엇을 말할지(reply)만 정한다 ──
// body: { text, try?, prev?, g?, s? }. try=1 이면 첫 번째 — 못 알아들으면 쓰지 않고 다시 묻는다. 그 밖은 마지막(받은 기도로).
function decide(body, rawDir) {
  const b = body || {}, dir = dirOf(rawDir);
  const say = clean(b.text), first = String(b.try || "") === "1";
  if (!say) return { reply: first ? REPLY.retry({ why: "notext" }, dir) : REPLY.noText };
  if (!dir.ok) { const h = holdNote(dir, say, b.prev); return { r: h, reply: REPLY.noDir }; }
  let r = b.g != null && clean(b.g) ? parsePath(b.g, b.s, say, dir) : clean(b.prev) ? parseAgain(say, b.prev, dir) : parse(say, dir);
  if (r.ok) return { r, reply: REPLY.ok(r) };
  if (r.why === "dup") return { reply: REPLY.dup(r) };
  if (first) return { reply: REPLY.retry(r, dir) };
  r = holdNote(dir, say, b.prev);
  return { r, reply: REPLY.ok(r) };
}

module.exports = {
  HOLD, HERE, NEW_SUB, NEW_GROUP, SAY_NAME, MAX_NAME,
  nk, josa, dirOf, topsOf, kidsOf, cutEnd, matchHead, parse, parseAgain, listTops, listKids, listText, parsePath, note, holdNote, bodyOf, decide, REPLY,
};
