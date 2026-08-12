// 공유 이미지 저장 파일명 (v26-0812-1)
//
// 요청: 파일명 가운데 장절 숫자를 **모두 세 자리**로 통일.
//       4장 6절 → 004006 · 15장 29절 → 015029 · 119장 176절 → 119176
// 예전에는 ':' 만 지우고 숫자를 있는 그대로 붙여서 '46' 이 되었고,
// 파일을 이름순으로 늘어놓으면 4:6 이 15:29 보다 뒤로 갔다.
//
// ⚠️ 이 규칙에서 제일 미끄러지기 쉬운 곳: **책 이름에도 숫자가 있다.**
//    '요한1서 5:14' 에서 첫 숫자(1)를 장으로 보면 안 된다. _bookOfRef 와 같이
//    ':' 까지 확인해야 한다. 이 파일이 그것을 고정한다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

eval(
  slice('// 장절 숫자를 모두 **세 자리**로 편다', 'function _vfShareImage(') +
  ';Object.assign(globalThis,{_refDigits3,_shareFileName});'
);

// 오늘 날짜는 파일명 뒤에 붙으므로, 검사할 때는 그 부분을 떼고 본다
const stamp = (() => {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
})();
const nameOf = ref => _shareFileName({ ref });
const midOf = ref => nameOf(ref).replace(/^BLOCK7_/, '').replace(new RegExp(`_${stamp}\\.png$`), '');

// ═══ 1. 요청받은 세 가지 ═══
console.log('시나리오 1 — 자리수를 세 자리로 통일');
{
  sc.eq('4장 6절 → 004006', _refDigits3('창세기 4:6').num, '004006');
  sc.eq('15장 29절 → 015029', _refDigits3('사무엘상 15:29').num, '015029');
  sc.eq('119장 176절 → 119176', _refDigits3('시편 119:176').num, '119176');
  sc.eq('책 이름은 그대로', _refDigits3('창세기 4:6').book, '창세기');
}

// ═══ 2. ⚠️ 책 이름 속 숫자를 장으로 오해하지 않는다 ═══
console.log('\n시나리오 2 — 책 이름에 숫자가 있는 경우');
{
  sc.eq('요한1서 5:14 의 책', _refDigits3('요한1서 5:14').book, '요한1서');
  sc.eq('요한1서 5:14 의 장절', _refDigits3('요한1서 5:14').num, '005014');
  sc.eq('요한2서 1:6 의 책', _refDigits3('요한2서 1:6').book, '요한2서');
  sc.eq('요한2서 1:6 의 장절', _refDigits3('요한2서 1:6').num, '001006');
  sc.eq('고린도전서 15:20', _refDigits3('고린도전서 15:20').num, '015020');
}

// ═══ 3. 절이 여럿인 표기 ═══
console.log('\n시나리오 3 — 절이 하나가 아닐 때');
{
  sc.eq('1:1,14 → 001001,014', _refDigits3('요한복음 1:1,14').num, '001001,014');
  sc.eq('15:3,4 → 015003,004', _refDigits3('고린도전서 15:3,4').num, '015003,004');
  sc.eq('23:1-6 → 023001-006', _refDigits3('시편 23:1-6').num, '023001-006');
  sc.eq('빈칸이 섞여도', _refDigits3('시편 23 : 1, 6').num, '023001,006');
}

// ═══ 4. 파일명 전체 ═══
console.log('\n시나리오 4 — 실제로 저장되는 이름');
{
  sc.eq('창세기 4:6', midOf('창세기 4:6'), '창세기_004006');
  sc.eq('시편 119:176', midOf('시편 119:176'), '시편_119176');
  sc.eq('요한복음 1:1,14', midOf('요한복음 1:1,14'), '요한복음_001001,014');
  sc.eq('앞뒤에 BLOCK7 과 날짜', /^BLOCK7_.+_\d{6}\.png$/.test(nameOf('창세기 4:6')), true);
  // 이름순 정렬이 장절 순서와 맞아야 한다 — 이게 이 작업의 목적이다
  const sorted = ['시편 119:176', '시편 4:6', '시편 15:29', '시편 23:1']
    .map(midOf).sort();
  sc.eq('이름순 = 장절순',
        sorted, ['시편_004006', '시편_015029', '시편_023001', '시편_119176']);
}

// ═══ 5. 알아볼 수 없는 표기는 그대로 둔다 ═══
console.log('\n시나리오 5 — 장:절 꼴이 아닐 때');
{
  sc.eq('절이 없으면 못 편다', _refDigits3('시편 119'), null);
  sc.eq('그래도 파일명은 만든다', midOf('시편 119'), '시편_119');
  sc.eq('빈 장절도 안전', _refDigits3(''), null);
  sc.eq('ref 가 없으면 verse', midOf(''), 'verse');
  sc.eq('구절 자체가 없어도 안전', /^BLOCK7_verse_/.test(_shareFileName(null)), true);
  // 파일명에 못 쓰는 글자는 빼고, 빈칸은 밑줄로
  sc.eq("':' 는 남지 않는다", midOf('창세기 4:6').includes(':'), false);
  sc.eq('빈칸은 밑줄', midOf('창세기 4:6').includes(' '), false);
}

sc.done();
