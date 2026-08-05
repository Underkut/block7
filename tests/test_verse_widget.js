// 말씀 위젯 글자 크기 + '매 시간구간' 자동 넘김 (v26-0806-1)
//
// · 글자 크기: 1 이 지금까지 쓰던 크기(기본). 값이 비었거나 이상하면 1로 본다.
// · 매 시간구간: "그날의 구절 + 구간 순번" 으로 계산한다. 기기가 여럿이어도
//   같은 구절이 나오도록 순서를 세는 게 아니라 매번 계산하는 방식이다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.ST = { settings: {} };
eval(
  slice('// 말씀 위젯 글자 크기 — 1 이 지금까지', 'function _vListRowsHTML(') +
  slice('// 그날의 구절(base, 1부터)', 'function dayOfYearVerseIdx(') +
  ';Object.assign(globalThis,{_VW_TEXT_PX,_VW_REF_PX,_vwSize,_verseIdxForSec});'
);

// ═══ 1. 글자 크기 ═══
console.log('시나리오 1 — 말씀 위젯 글자 크기');
{
  sc.eq('본문 1 = 지금까지 쓰던 12px', _VW_TEXT_PX[1], 12);
  sc.eq('장절 1 = 지금까지 쓰던 9px', _VW_REF_PX[1], 9);
  sc.eq('본문은 1<2<3', _VW_TEXT_PX[1] < _VW_TEXT_PX[2] && _VW_TEXT_PX[2] < _VW_TEXT_PX[3], true);
  sc.eq('장절은 1<2<3', _VW_REF_PX[1] < _VW_REF_PX[2] && _VW_REF_PX[2] < _VW_REF_PX[3], true);

  sc.eq('값이 없으면 1', _vwSize('verseWidgetTextSize'), 1);
  ST.settings.verseWidgetTextSize = 3;
  sc.eq('3 을 고르면 3', _vwSize('verseWidgetTextSize'), 3);
  ST.settings.verseWidgetTextSize = 9;
  sc.eq('범위 밖이면 1로 되돌린다', _vwSize('verseWidgetTextSize'), 1);
  ST.settings.verseWidgetRefSize = '2';
  sc.eq('문자로 저장돼 있어도 숫자로 읽는다', _vwSize('verseWidgetRefSize'), 2);
}

// ═══ 2. 매 시간구간 — 구절 자리 계산 ═══
console.log('\n시나리오 2 — 시간구간마다 한 칸씩');
{
  // 오늘의 구절이 10번이고 구간이 6개인 180구절 모음이라면
  sc.eq('첫 구간(새벽)은 그날의 구절 그대로', _verseIdxForSec(10, 0, 180), 10);
  sc.eq('두 번째 구간', _verseIdxForSec(10, 1, 180), 11);
  sc.eq('여섯 번째 구간', _verseIdxForSec(10, 5, 180), 15);

  // 끝에서 넘어갈 때 1로 돌아온다 (0이나 181이 나오면 안 된다)
  sc.eq('마지막 구절에서 한 칸 더 → 1번으로', _verseIdxForSec(180, 1, 180), 1);
  sc.eq('마지막 구절에서 두 칸 더 → 2번으로', _verseIdxForSec(180, 2, 180), 2);

  // 구절이 구간 수보다 적어도 깨지지 않는다
  sc.eq('구절이 3개뿐일 때 네 번째 구간', _verseIdxForSec(1, 3, 3), 1);
  sc.eq('구절이 1개뿐이면 언제나 1', _verseIdxForSec(1, 5, 1), 1);

  // 방어: 총 개수가 0이어도 1을 돌려준다 (구절 목록이 비어 있는 순간)
  sc.eq('총 개수 0 → 1', _verseIdxForSec(1, 2, 0), 1);
  // 구간을 못 찾아 off 가 음수로 와도 안전하게
  sc.eq('음수 순번도 범위 안', _verseIdxForSec(1, -1, 180), 180);
}

// ═══ 3. 설정 화면 문구 ═══
console.log('\n시나리오 3 — 바뀐 문구');
{
  sc.eq("'구절' 칩이 '장절' 로",
        SRC.includes(">장절</button>") && !SRC.includes("verseWidgetRef',this.classList.toggle('on'))\">구절"), true);
  sc.eq('말씀 위젯에서 보여줄 항목', SRC.includes('말씀 위젯에서 보여줄 항목'), true);
  sc.eq('말씀 위젯 글자 크기', SRC.includes('말씀 위젯 글자 크기'), true);
  sc.eq('자동으로 다음 구절', SRC.includes('>자동으로 다음 구절<'), true);
  sc.eq("'매일 자동으로' 는 사라졌다", SRC.includes('매일 자동으로 다음 구절'), false);
  sc.eq('매 시간구간 토글', SRC.includes('setVerseRotateBySec'), true);
  sc.eq('예시 문구', SRC.includes('예: 새벽 오전 점심 오후 저녁 밤'), true);
}

// ═══ 4. 위젯 기본값 — 본문·장절만 켜짐 ═══
console.log('\n시나리오 4 — 새 사용자 기본값');
{
  const d = SRC.slice(SRC.indexOf('const _settingsDefaults='));
  const pick = k => new RegExp(k + ':(true|false)').exec(d)[1];
  sc.eq('본문 켜짐', pick('verseWidgetText'), 'true');
  sc.eq('장절 켜짐', pick('verseWidgetRef'), 'true');
  sc.eq('대분류 꺼짐', pick('verseWidgetCat'), 'false');
  sc.eq('소주제 꺼짐', pick('verseWidgetTopic'), 'false');
  sc.eq('태그 꺼짐', pick('verseWidgetTag'), 'false');
}

sc.done();
