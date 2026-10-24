/* 시리로 할일 넣기 — 서버 쪽 규칙 (2026-10-25, docs/ROADMAP.md '시리로 할일 넣기'). 시험: tests/test_b7siri.js
 *
 * 서버는 말을 **풀지 않는다** — 구간 이름은 사람마다 바꿀 수 있어 앱만 안다. 앱이 쪽지를 꺼낼 때 말한 시각(at)으로 푼다(_siriParse).
 * 여기는 ① 단축어가 보낸 말 고르기 ② 주소 열쇠 ③ 쪽지 모양 ④ 시리가 읽어 줄 대답뿐.
 */
const crypto = require("crypto");

const MAX_TEXT = 200;   // 앱 받기(_prayTodoPlace)와 같은 길이
const MAX_BOX = 50;     // 쪽지함이 이만큼 쌓이면 더 받지 않는다 — 앱이 한 번에 꺼내는 수(_PRAY_TODO_MAX)와 같다

// 열쇠는 주소에 실려 간다(?k=). 서버는 그 해시만 둔다 → 저장소를 들여다봐도 열쇠를 알 수 없다
const newKey = () => crypto.randomBytes(18).toString("base64url");   // 24글자 · 144비트
const keyOk = (k) => typeof k === "string" && /^[A-Za-z0-9_-]{20,64}$/.test(k);
const hashKey = (k) => crypto.createHash("sha256").update(String(k)).digest("hex");

// 단축어가 어떤 모양으로 보내도 받는다 — JSON {text} · 양식 text= · 글 그대로 · 주소 ?t= (브라우저로 시험할 때)
function textOf(req) {
  let b = req && req.body, t = "";
  if (Buffer.isBuffer(b)) b = b.toString("utf8");
  if (typeof b === "string" && /^\s*\{/.test(b)) { try { b = JSON.parse(b); } catch (e) { /* 글 그대로 */ } }
  if (b && typeof b === "object") t = b.text != null ? b.text : b.t != null ? b.t : b.say;
  else if (typeof b === "string") t = b;
  if ((t == null || t === "") && req && req.query) t = req.query.t || req.query.text || "";
  if (t != null && typeof t === "object") t = "";
  return String(t == null ? "" : t).replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
}
function keyOf(req) {
  const q = (req && req.query) || {}, b = req && req.body;
  return String(q.k || (b && typeof b === "object" && !Buffer.isBuffer(b) && b.k) || "");
}

// 한국 날짜 — 갱신 전 앱이 쪽지를 먼저 꺼내도 잃지 않게 함께 적는다(그날 · 첫 구간 · 들은 말 그대로)
const kstDate = (ms) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);
function item(text, now, rnd) {
  return { id: "siri-" + now.toString(36) + "-" + rnd, from: "siri", say: text, at: now, date: kstDate(now), sec: "", text };
}

// 시리가 읽어 준다 — 단축어 '결과 보기'. 상태 코드는 늘 200 (단축어가 글을 그대로 보여 주게)
const REPLY = {
  ok: (t) => ({ code: "ok", msg: `블럭세븐에 보냈어요. ${t}` }),
  noText: { code: "notext", msg: "들은 말이 없어요. 다시 말해 주세요." },
  badKey: { code: "badkey", msg: "주소가 맞지 않아요. 블럭세븐 설정의 계정 탭, 시리로 할일 넣기에서 주소를 다시 복사해 주세요." },
  full: { code: "full", msg: "쪽지가 너무 많이 쌓였어요. 블럭세븐을 한 번 열어 주세요." },
  fail: { code: "fail", msg: "지금은 보내지 못했어요. 잠시 뒤에 다시 해 주세요." },
};

module.exports = { MAX_TEXT, MAX_BOX, newKey, keyOk, hashKey, textOf, keyOf, kstDate, item, REPLY };
