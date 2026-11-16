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
 *     '분당만 / 부산 다른 버전' 은 적는 칸이 없고 업데이트 · 댓글에 그때그때 적힌다(HB) → '부산' 이 든 글만 골라 준다.
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
    + " vid: boards(ids: $v) { items_page(limit: 20, query_params: { rules: $vr }) { items { id name"
    + " column_values { id type text ... on LinkValue { url } }"
    + " updates(limit: 30) { id created_at text_body replies { id created_at text_body } } } } } }",
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
  return { group: g ? g.id : null, groupTitle: gt, spokenCol: spoken.id, dateCol: date.id };
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

const NOTE_MAX = 6, NOTE_LEN = 400;
// 업데이트 · 댓글에서 '부산' 이 든 글만 — 최근 것부터
function busanNotes(updates) {
  const all = [];
  for (const u of updates || []) {
    all.push(u);
    for (const r of u.replies || []) all.push(r);
  }
  return all
    .map(x => ({ at: String(x.created_at || "").slice(0, 10), text: String(x.text_body || "").replace(/\s+/g, " ").trim() }))
    .filter(x => x.text && x.text.includes("부산"))
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    .slice(0, NOTE_MAX)
    .map(x => ({ at: x.at, text: x.text.length > NOTE_LEN ? x.text.slice(0, NOTE_LEN) + "…" : x.text }));
}

// 영상 소식 아이템 → { title, url, notes }
function videoOf(it) {
  const link = (it.column_values || []).find(c => c.type === "link" && (c.url || c.text));
  let url = link ? String(link.url || "") : "";
  if (!url && link) { const m = /(https?:\/\/\S+)\s*$/.exec(String(link.text || "")); url = m ? m[1] : ""; }
  if (!/^https?:\/\//.test(url)) url = "";
  return { title: String(it.name || "").trim(), url, notes: busanNotes(it.updates) };
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
    video: vids.map(videoOf).filter(v => v.title),
  };
}

module.exports = { BOARDS, QUERIES, okSun, groupTitle, colBy, plan, spokenOf, busanNotes, videoOf, weekVars, weekOut };
