// 팝업 제목줄(.modal-head) — 위쪽에 구멍이 생기지 않게 (v26-0904-12)
//
// 무슨 일이 있었나:
//   제목줄은 `position:sticky; top:0` 로 팝업 위에 붙어 있다. 그런데 여백을
//   맞추려고 `margin-top:-20px` 을 함께 주고 있었다.
//   sticky 는 **margin 상자**를 붙이므로, 붙는 순간 테두리 상자는 20px 아래로
//   내려가고 그 위에 20px 짜리 **구멍**이 남는다. 스크롤해 올라온 내용이
//   그 구멍으로 비쳐 보였다 (2026-09-04 HB 신고 — 동기화 팝업·'무엇을 볼까요').
//
//   같은 실수가 두 번 났다(v26-0904-10 에서 한 번 부분적으로 고쳤다가 재발).
//   그래서 규칙을 코드가 아니라 **이 파일이** 지킨다.
//
// 지키는 것 둘:
//   ① .modal-head 는 음수 margin-top 을 갖지 않는다 (위쪽 여백은 padding 으로)
//   ② .modal-head 를 쓰는 팝업은 자기 padding-top 을 0 으로 비운다
//      (안 비우면 붙는 순간 20px 튀어 오른다)
const { SRC, makeScorer } = require('./_load');
const sc = makeScorer();

// ── CSS 규칙을 훑는 작은 도구들 ──
function allRules() {
  const out = [];
  const re = /(^|\n)([^\n{}@]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(SRC))) out.push({ sel: m[2].trim(), body: m[3] });
  return out;
}
const RULES = allRules();
function rule(sel) {
  const r = RULES.find(x => x.sel === sel);
  return r ? r.body : null;
}
function rulesMentioning(sel) { return RULES.filter(r => r.sel.includes(sel)); }
function rulesDeclaring(decl) {
  const flat = s => s.replace(/\s/g, '');
  return RULES.filter(r => flat(r.body).includes(flat(decl)));
}
// margin-top 만 뽑는다 — 줄임꼴(margin: a b c) 의 가로 음수에 속으면 안 된다
function marginTop(body) {
  let m = /margin-top\s*:\s*([^;]+)/.exec(body || '');
  if (m) return m[1].trim();
  m = /(?:^|;)\s*margin\s*:\s*([^;]+)/.exec(body || '');
  if (m) return m[1].trim().split(/\s+/)[0];
  return null;
}

console.log('시나리오 1 — 제목줄 자체');
{
  const head = rule('.modal-head');
  sc.eq('.modal-head 규칙이 있다', !!head, true);
  // ⚠️ 이 한 줄이 이 파일의 존재 이유다. 음수 margin-top 이 돌아오면 구멍이 돌아온다.
  sc.eq('음수 margin-top 을 쓰지 않는다', /margin\s*:\s*-|margin-top\s*:\s*-/.test(head || ''), false);
  sc.eq('위에 붙어 있다', /position\s*:\s*sticky/.test(head || '') && /top\s*:\s*0/.test(head || ''), true);
  sc.eq('위쪽 여백은 padding 으로 갖는다', /padding\s*:\s*20px/.test(head || ''), true);
  sc.eq('배경이 있어 내용이 비치지 않는다', /background\s*:/.test(head || ''), true);
  sc.eq('줄임꼴에서도 위쪽만 0', marginTop(head), '0');
  // 나중에 누가 개별 팝업에서 음수 margin-top 을 되살리는 것도 막는다
  const bad = rulesMentioning('.modal-head')
    .filter(r => String(marginTop(r.body) || '').startsWith('-'));
  sc.eq('어느 팝업에서도 되살리지 않았다', bad.map(r => r.sel), []);
}

console.log('\n시나리오 2 — 제목줄을 쓰는 팝업은 위 여백을 비운다');
{
  // HTML 에서 .modal-head 를 품은 팝업의 id 를 모은다 (JS 로 만드는 것도 함께)
  // 제목줄이 나온 자리마다, 바로 앞에서 그 팝업의 id 를 되짚는다
  // (앞에서부터 훑으면 앞 팝업의 여는 태그가 뒤 팝업의 제목줄을 삼켜 버린다)
  const ids = new Set();
  const own = /<div class="(event-modal[^"]*)" id="([A-Za-z0-9_]+)"/g;
  let at = -1;
  while ((at = SRC.indexOf('class="modal-head"', at + 1)) >= 0) {
    const before = SRC.slice(Math.max(0, at - 900), at);
    let m, last = null;
    own.lastIndex = 0;
    while ((m = own.exec(before))) if (!/overlay/.test(m[1])) last = m[2];
    if (last) ids.add(last);
  }
  ids.add('taggedTasksModal');            // 제목줄을 JS 가 만든다 (showContactTasksPopup)
  sc.eq('찾은 팝업이 있다', ids.size >= 4, true);

  // padding-top:0 을 주는 선택자를 모두 모아 놓고 하나씩 확인한다
  const zero = rulesDeclaring('padding-top:0').map(r => r.sel).join(' , ');
  const missing = [...ids].filter(id => zero.indexOf('#' + id) < 0);
  sc.eq('모두 위 여백을 비웠다', missing, []);

  // 앞으로 만들 팝업까지 자동으로 잡아 주는 그물
  sc.eq(':has() 그물도 쳐 두었다', /\.event-modal:has\(>\s*\.modal-head\)\s*\{[^}]*padding-top\s*:\s*0/.test(SRC), true);
}

console.log('\n시나리오 3 — 닫기(×) 는 늘 손에 닿는다');
{
  // 제목줄이 위에 붙어 있어야 목록을 내려도 × 가 사라지지 않는다 (CLAUDE.md UI 원칙)
  const heads = (SRC.match(/class="modal-head"/g) || []).length;
  sc.eq('제목줄을 쓰는 자리가 남아 있다', heads >= 4, true);
  sc.eq('× 는 제목줄 안에 들어간다', SRC.includes('modal-x modal-x-inline'), true);
}

sc.done();
