/* Monday 광고 읽기 — 판단만 모은 곳 (교역자 로테이션 R12 C, HB 2026-11-16)
 *
 * 서버(monday.js)는 HB 의 Monday 열쇠로 **읽기만** 한다. 보내는 질문은 아래 QUERIES 셋뿐이다.
 *   ⚠️ 쓰기 질문(GraphQL mutation)을 더하지 말 것 — 열쇠는 HB 계정의 쓰기 권한까지 가진 개인 토큰이다.
 *      tests/test_monday.js 가 이 파일과 monday.js 에 그 낱말이 없는지 본다.
 *   ⚠️ 보드는 교회 담당자 것이다. 이름 · 열이 바뀌면 짐작해 맞추지 말고 '보드 모양이 바뀌었습니다' 만 알린다.
 *
 * 읽는 것 (실제 보드를 HB 열쇠로 읽어 확인, 11/16):
 *   부산 주보 'TLCB 주보' — 주일마다 그룹(이름 'YY-MMDD'). '구두 광고' 상태 열이 숫자인 아이템의 **제목만**, 숫자 순.
 *     (HB: 글 내용 · '글' 열은 읽지 않는다)  '영상 사용' 은 따로 · '해당 없음' 은 뺌 · '확인 필요' 는 따로.
 *   '주일 영상 소식' — 방영일 = 그 주일인 아이템(제목 · 유튜브). 없으면 그 주엔 영상이 없다.
 *     '분당만 / 부산 다른 버전' 은 적는 칸이 없고 업데이트 · 댓글에 그때그때 적힌다(HB) → '부산' 이 든 묶음(업데이트 + 답글)만 골라 준다.
 */
"use strict";

// 보드 id — 보드가 수백 개라 이름으로 훑지 않는다. 담당자가 새 보드를 만들면 여기를 고친다.
const BOARDS = { busan: "3731160063", video: "1369332975" };

// 보내는 질문은 이 셋뿐 (모두 query — 읽기). 값은 변수로만 넣는다(글을 이어 붙이지 않는다).
const QUERIES = {
  me: "query { me { id } }",
  meta: "query ($ids: [ID!]) { boards(ids: $ids) { id name columns { id title type } groups { id title } } }",
  week: "query ($b: [ID!], $g: [String], $c: [String!], $v: [ID!], $vr: [ItemsQueryRule!]) {"
    + " bus: boards(ids: $b) { groups(ids: $g) { title items_page(limit: 100) { items { id name column_values(ids: $c) { id text } } } } }"
    + " vid: boards(ids: $v) { items_page(limit: 20, query_params: { rules: $vr }) { items { id name url"
    + " column_values { id type text ... on LinkValue { url } }"
    + " updates(limit: 30) { id created_at text_body creator { name } replies { id created_at text_body creator { name } } } } } } }",
};

const squash = (t) => String(t == null ? "" : t).replace(/\s+/g, "");

// 'YYYY-MM-DD' 이고 일요일인가
function okSun(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === s && d.getUTCDay() === 0;
}
// 2026-11-22 → '26-1122' (부산 주보 그룹 이름)
const groupTitle = (sun) => sun.slice(2, 4) + "-" + sun.slice(5, 7) + sun.slice(8, 10);

// 열을 제목으로 찾는다 (빈칸 무시). 없으면 null
function colBy(cols, title, type) {
  const t = squash(title);
  return (cols || []).find(c => squash(c.title) === t && (!type || c.type === type)) || null;
}

// 첫 질문(meta)의 답에서 이번 주에 쓸 것을 고른다. 모자라면 { err: '…' }
function plan(meta, sun) {
  const bs = (meta || []).find(b => String(b.id) === BOARDS.busan), vb = (meta || []).find(b => String(b.id) === BOARDS.video);
  if (!bs || !vb) return { err: "board" };
  const spoken = colBy(bs.columns, "구두 광고", "status"), date = colBy(vb.columns, "방영일", "date");
  if (!spoken || !date) return { err: "shape" };
  const gt = groupTitle(sun);
  const g = (bs.groups || []).find(x => squash(x.title) === gt) || null;
  const rep = colBy(vb.columns, "리포터");   // 없어도 된다 — 그때는 rep: null (모름)
  return { group: g ? g.id : null, groupTitle: gt, spokenCol: spoken.id, dateCol: date.id, repCol: rep ? rep.id : null };
}

// 부산 주보 그룹의 아이템 → 구두 광고 (제목만)
function spokenOf(items) {
  const out = { spoken: [], video: [], check: [] };
  for (const it of items || []) {
    const title = String(it.name || "").trim(), v = String(((it.column_values || [])[0] || {}).text || "").trim();
    if (!title || !v) continue;
    if (/^\d+$/.test(v)) out.spoken.push({ n: +v, title });
    else if (squash(v) === "영상사용") out.video.push(title);
    else if (squash(v) === "확인필요") out.check.push(title);
    // '해당 없음' 등 나머지는 뺀다
  }
  out.spoken.sort((a, b) => a.n - b.n);
  return out;
}

const NOTE_MAX = 6, REPLY_MAX = 10, NOTE_LEN = 1500;
// Monday 글로 가는 주소 — 아이템의 url(Monday 가 주는 그 아이템 주소)만 믿는다. 업데이트는 그 뒤에 '/posts/{id}'.
const MON_URL = /^https:\/\/[a-z0-9-]+\.monday\.com\/[^\s"'<>]*$/i;
// 한국 시각으로 날짜 · 시각 ('2026-11-19T16:00:00Z' → { at: '2026-11-20', tm: '01:00' })
function kst(iso) {
  const d = new Date(String(iso || ""));
  if (isNaN(d)) return { at: "", tm: "" };
  const k = new Date(d.getTime() + 9 * 3600e3).toISOString();
  return { at: k.slice(0, 10), tm: k.slice(11, 16) };
}
// 줄바꿈은 살리고(읽기 쉽게) 빈칸만 하나로 · 너무 긴 글은 자른다
function clean(t) {
  t = String(t == null ? "" : t).replace(/\r/g, "").replace(/[ \t\u00a0]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return t.length > NOTE_LEN ? t.slice(0, NOTE_LEN) + "…" : t;
}
const stamp = (x) => x.at + " " + x.tm;
const whoOf = (x) => String((x && x.creator && x.creator.name) || "").replace(/\s+/g, " ").trim().slice(0, 30);
// 업데이트 · 답글에서 '부산' 묶음만 (R12 C4a, HB 11/16)
//   업데이트와 그 답글을 한 묶음으로 보고, **묶음 중 하나라도 '부산' 이면 묶음째** 돌려준다 — 답글은 그 업데이트 아래(오래된 것부터).
//   (예전엔 한 줄로 섞어 '부산' 글만 남겨, 답글이 부모를 잃고 본문만 '부산' 인 업데이트의 답글은 빠졌다)
//   묶음은 최근 NOTE_MAX 개를 남긴 뒤 **오래된 것부터**(위 = 오래된 글, HB 11/16) · who = 쓴 사람 이름(creator.name, 없으면 빈 글) · link = 그 업데이트로 가는 Monday 주소(아이템 주소를 모르면 빈 글)
function busanNotes(updates, itemUrl) {
  const base = MON_URL.test(String(itemUrl || "")) ? String(itemUrl).replace(/\/+$/, "") : "";
  const has = (t) => String(t == null ? "" : t).includes("부산");
  const out = [];
  for (const u of updates || []) {
    if (!u) continue;
    const raw = (u.replies || []).filter(r => r && String(r.text_body || "").trim());
    if (!has(u.text_body) && !raw.some(r => has(r.text_body))) continue;
    const replies = raw.map(r => Object.assign(kst(r.created_at), { who: whoOf(r), text: clean(r.text_body) }))
      .sort((a, b) => (stamp(a) < stamp(b) ? -1 : stamp(a) > stamp(b) ? 1 : 0)).slice(0, REPLY_MAX);
    const id = /^\d+$/.test(String(u.id || "")) ? String(u.id) : "";
    out.push(Object.assign(kst(u.created_at), { id, who: whoOf(u), text: clean(u.text_body), link: base && id ? base + "/posts/" + id : base, replies }));
  }
  return out.sort((a, b) => (stamp(a) < stamp(b) ? 1 : stamp(a) > stamp(b) ? -1 : 0)).slice(0, NOTE_MAX).reverse();
}

// 영상 소식 아이템 → { title, url, link, notes, rep }
//   link = 그 아이템의 Monday 주소('Monday에서 보기 ↗') — 읽기 질문의 url 칸에서만
//   rep = 리포터가 배정됐는가(true/false) — 배정되면 구두 광고가 모두 영상 안에 든다(HB 11/16). 열이 없으면 null.
//   ⚠️ 리포터 **이름은 돌려주지 않는다** — 있는지만.
function videoOf(it, repCol) {
  const link = (it.column_values || []).find(c => c.type === "link" && (c.url || c.text));
  let url = link ? String(link.url || "") : "";
  if (!url && link) { const m = /(https?:\/\/\S+)\s*$/.exec(String(link.text || "")); url = m ? m[1] : ""; }
  if (!/^https?:\/\//.test(url)) url = "";
  const rc = repCol ? (it.column_values || []).find(c => c.id === repCol) : null;
  const rep = repCol ? !!(rc && String(rc.text || "").trim()) : null;
  const mlink = MON_URL.test(String(it.url || "")) ? String(it.url) : "";
  return { title: String(it.name || "").trim(), url, link: mlink, notes: busanNotes(it.updates, mlink), rep };
}

// 두 번째 질문(week)의 변수
function weekVars(p, sun) {
  return {
    b: [BOARDS.busan], g: [p.group || "__none__"], c: [p.spokenCol],
    v: [BOARDS.video], vr: [{ column_id: p.dateCol, compare_value: ["EXACT", sun], operator: "any_of" }],
  };
}

// 두 번째 질문의 답 → 앱에 돌려줄 모양
function weekOut(data, p, sun) {
  const g = p.group ? ((((data || {}).bus || [])[0] || {}).groups || [])[0] : null;
  const items = g && g.items_page ? g.items_page.items : [];
  const vids = ((((data || {}).vid || [])[0] || {}).items_page || {}).items || [];
  return {
    sun,
    busan: Object.assign({ found: !!g, group: p.groupTitle }, spokenOf(items)),
    video: vids.map(it => videoOf(it, p.repCol)).filter(v => v.title),
  };
}

module.exports = { BOARDS, QUERIES, okSun, groupTitle, colBy, plan, spokenOf, busanNotes, videoOf, weekVars, weekOut };
