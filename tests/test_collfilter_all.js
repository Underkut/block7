// 말씀 모음 하위 필터의 '전체' 칩 (v26-0906-4, HB)
//
// 신고: 대분류/소주제/태그/성경에서 무엇을 골라 둔 채 맨 왼쪽 '전체' 를 눌러도
//       고른 것이 그대로 걸려 있어 전체가 나오지 않는다.
// 기획: '전체' = 네 갈래 선택을 **모두 풀고** 그 모음의 구절을 전부 가져오되,
//       우상단 기간 필터(주간·월간·연간·전체·직접)만 그대로 먹는다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

eval(
  slice('function _getCollFilter(id){', '// id별 원본 구절') +
  slice('// ── 필터 적용 방식', '// 모음 id의 하위 필터') +
  slice('function _collPeriodPass(', '\n// ── 현재 켜진 말씀 모음의 구절 집합') +
  ';Object.assign(globalThis,{_collVersePassesFilter,_collPeriodPass,_collFilteredVerses,_collPeriodVerses,_cfHasSel,_cfClearSel,_getCollFilter});'
);

// 필터가 쓰는 바깥 함수·상태를 최소한으로 흉내낸다
globalThis.ST = { settings: {} };
const VERSES = [
  { ref:'요한복음 3:16', cat:'주일예배', topic:'사랑', tags:['핵심'], books:['요한복음'], d:'2026-09-01' },
  { ref:'로마서 8:28',   cat:'수요예배', topic:'섭리', tags:['위로'], books:['로마서'],   d:'2026-08-01' },
  { ref:'시편 23:1',     cat:'주일예배', topic:'목자', tags:[],       books:['시편'],     d:'2026-07-01' },
];
globalThis._collRawVerses = () => VERSES;
globalThis._booksOf = v => v.books || [];
globalThis._bookCanon = n => String(n || '').trim();
globalThis._bookSel = (f, key) => (f.books || []).some(b => _bookCanon(b) === key);
globalThis._vListRange = ({ period, customFrom, customTo }) =>
  period === 'custom' ? { from: customFrom, to: customTo } : null;

const F = () => _getCollFilter('c1');

console.log('시나리오 1 — 고른 것이 있으면 걸러진다 (지금까지의 동작)');
{
  const f = F();
  f.cats = ['주일예배'];
  sc.eq('대분류 하나만 고르면 2구절', _collFilteredVerses('c1').length, 2);
  sc.eq('고른 것이 있다고 안다', _cfHasSel(f), true);
}

console.log("\n시나리오 2 — '전체' 는 네 갈래 선택을 모두 푼다");
{
  const f = F();
  f.cats = ['주일예배']; f.topics = ['사랑']; f.tags = ['핵심']; f.books = ['요한복음'];
  sc.eq('풀기 전에는 1구절', _collFilteredVerses('c1').length, 1);
  sc.eq('풀 것이 있었다고 알려준다', _cfClearSel('c1'), true);
  sc.eq('대분류 선택이 비었다', f.cats.length, 0);
  sc.eq('소주제 선택이 비었다', f.topics.length, 0);
  sc.eq('태그 선택이 비었다', f.tags.length, 0);
  sc.eq('성경 선택이 비었다', f.books.length, 0);
  sc.eq('전체 3구절이 돌아온다', _collFilteredVerses('c1').length, 3);
  sc.eq('고른 것이 없다', _cfHasSel(f), false);
}

console.log("\n시나리오 3 — '전체' 여도 기간 필터는 그대로 먹는다");
{
  const f = F();
  f.cats = ['주일예배'];
  f.period = 'custom'; f.pFrom = '2026-08-01'; f.pTo = '2026-09-30';
  _cfClearSel('c1');
  sc.eq('기간 안의 2구절만', _collPeriodVerses('c1').length, 2);
  sc.eq('전체 결과도 기간을 따른다', _collFilteredVerses('c1').length, 2);
  f.period = 'all';
  sc.eq('기간을 전체로 두면 3구절', _collPeriodVerses('c1').length, 3);
}

// 개수는 칩이 아니라 모음 이름 오른쪽에 적는다 — 그 숫자는 '지금 보이는 결과' 다
console.log('\n시나리오 4 — 이름 오른쪽 개수는 고른 것을 따라 바뀐다');
{
  const f = F();
  f.period = 'all';
  f.cats = ['주일예배'];   // 골라 둔 채로
  sc.eq('보이는 결과는 2구절', _collFilteredVerses('c1').length, 2);
  sc.eq("이때 '전체' 칩은 켜진 상태가 아니다", _cfHasSel(f), true);
  _cfClearSel('c1');
  sc.eq('전체를 누르면 3구절', _collFilteredVerses('c1').length, 3);
  sc.eq("그제서야 '전체' 칩이 켜진다", _cfHasSel(F()), false);
}

sc.done();
