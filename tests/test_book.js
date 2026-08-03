// 성경책 이름을 하나로 모으는 규칙 + 목록 순서 (v26-0803-11)
//
// 신고: '요한일서'로 저장된 구절이 성경책 목록에서 **요한계시록 뒤**에 있었다.
// 원인: 순서표(BIBLE_ORDER_NT / _BSK_CODES)의 이름은 '요한1서'인데 저장된
//       글자가 '요한일서'라 "순서를 모르는 책"이 되어 맨 뒤로 밀린 것.
// 그래서 _bookOfRef() 가 이름을 정식 표기로 펴서 돌려주도록 고쳤고,
// 이 테스트가 그 규칙과 "요한1·2·3서는 유다서 앞, 요한계시록 앞" 을 고정한다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

// 세 덩어리를 한 번에 eval 해야 서로를 볼 수 있다 (const 는 eval 밖으로 안 샌다)
eval(
  slice('const _REF_ABBR2FULL=', 'function _refNorm(') +
  slice('// ── 성경책 이름 하나로 모으기 ──', '// verses를 keyFn 기준으로 묶어') +
  slice('const BIBLE_ORDER_OT=', '// ── Alarm scheduler ──') +
  ';Object.assign(globalThis,{_bookCanon,_bookOfRef,_bookSel,BIBLE_ORDER_OT,BIBLE_ORDER_NT});'
);

// ═══ 1. 이름 펴기 ═══
console.log('시나리오 1 — 같은 책의 다른 표기를 하나로');
{
  sc.eq('요한일서 → 요한1서', _bookCanon('요한일서'), '요한1서');
  sc.eq('요한이서 → 요한2서', _bookCanon('요한이서'), '요한2서');
  sc.eq('요한삼서 → 요한3서', _bookCanon('요한삼서'), '요한3서');
  sc.eq('약칭 요일 → 요한1서', _bookCanon('요일'), '요한1서');
  sc.eq('약칭 요이 → 요한2서', _bookCanon('요이'), '요한2서');
  sc.eq('약칭 요삼 → 요한3서', _bookCanon('요삼'), '요한3서');
  sc.eq('정식 표기는 그대로', _bookCanon('요한1서'), '요한1서');
  sc.eq('약칭 삼상 → 사무엘상', _bookCanon('삼상'), '사무엘상');
  sc.eq('요 → 요한복음 (요일과 헷갈리지 않는다)', _bookCanon('요'), '요한복음');
  sc.eq('모르는 이름은 손대지 않는다', _bookCanon('아무개서'), '아무개서');
}

// ═══ 2. 장절에서 책 이름 뽑기 ═══
// ⚠️ 진짜 원인이 여기 있었다: 예전 규칙은 "첫 숫자"에서 끊어서
//    '요한1서 5:14' → '요한' 으로 잘랐고, 그 이름이 순서표에 없어 맨 뒤로 갔다.
console.log('\n시나리오 2 — 장절 문자열에서 책 이름 뽑기');
{
  sc.eq('요한2서 1:6 (책 이름의 숫자에서 끊지 않는다)', _bookOfRef('요한2서 1:6'), '요한2서');
  sc.eq('사무엘상 7:12', _bookOfRef('사무엘상 7:12'), '사무엘상');
  sc.eq('여러 절 표기 (요한복음 1:1,14)', _bookOfRef('요한복음 1:1,14'), '요한복음');
  sc.eq('절이 없는 옛 표기 (시편 119)', _bookOfRef('시편 119'), '시편');
  sc.eq('요한일서 5:14', _bookOfRef('요한일서 5:14'), '요한1서');
  sc.eq('요일 5:14 (약칭)', _bookOfRef('요일 5:14'), '요한1서');
  sc.eq('요한1서 5:14 (정식)', _bookOfRef('요한1서 5:14'), '요한1서');
  sc.eq('요한삼서 1:4', _bookOfRef('요한삼서 1:4'), '요한3서');
  sc.eq('요한복음 3:16 은 그대로', _bookOfRef('요한복음 3:16'), '요한복음');
  sc.eq('공백 없는 표기도 같은 책', _bookOfRef('요한일서5:14'), '요한1서');
}

// ═══ 3. 목록 순서 — 요한1·2·3서는 유다서 앞, 요한계시록 앞 ═══
console.log('\n시나리오 3 — 성경 순서에서의 자리');
{
  const order = [...BIBLE_ORDER_OT, ...BIBLE_ORDER_NT];
  const at = n => order.indexOf(_bookCanon(n));
  sc.eq('요한1서가 순서표에 있다', at('요한일서') >= 0, true);
  sc.eq('요한1서 < 유다서', at('요한일서') < at('유다서'), true);
  sc.eq('요한3서 < 요한계시록', at('요한삼서') < at('요한계시록'), true);
  sc.eq('베드로후서 < 요한1서', at('베드로후서') < at('요한일서'), true);
  sc.eq('요한1서 < 요한2서 < 요한3서',
        at('요한일서') < at('요한이서') && at('요한이서') < at('요한삼서'), true);

  // 실제 목록 만들기: 순서표에 있는 책만 순서대로, 없는 이름만 뒤에
  const refs = ['요한계시록 1:8', '요한일서 5:14', '유다서 1:24', '요한삼서 1:4', '요한이서 1:6'];
  const have = new Set(refs.map(_bookOfRef));
  const list = order.filter(b => have.has(b));
  sc.eq('목록 순서', list, ['요한1서', '요한2서', '요한3서', '유다서', '요한계시록']);
}

// ═══ 4. 저장해 둔 옛 표기 필터도 계속 걸린다 ═══
console.log('\n시나리오 4 — 예전에 저장된 필터(옛 표기)와의 대조');
{
  const f = { books: ['요한일서', '삼상'] };   // 예전 기기가 저장해 둔 값
  sc.eq('요한1서 선택 상태로 인식', _bookSel(f, '요한1서'), true);
  sc.eq('사무엘상 선택 상태로 인식', _bookSel(f, '사무엘상'), true);
  sc.eq('고르지 않은 책은 false', _bookSel(f, '요한계시록'), false);
}

sc.done();
