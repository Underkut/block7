const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 — 좁은 모바일의 네 글자 말씀설정 탭은 2+2로 줄바꿈된다');
for (const [first, second] of [['상단', '말씀'], ['말씀', '위젯'], ['전체', '화면'], ['말씀', '모음']]) {
  sc.eq(`${first}${second} 탭에 두 글자 묶음이 있다`,
    SRC.includes(`<span class="vstab-pair"><span>${first}</span><span>${second}</span></span>`), true);
}
sc.eq('좁은 화면에서 각 두 글자 묶음을 한 줄씩 표시한다',
  /@media \(max-width:430px\)\{[\s\S]*?#verseSettingsTabBar \.vstab-pair>span\{display:block;white-space:nowrap;\}/.test(SRC), true);

sc.done();
