// 말씀상단영역 하단 드래그 크기 전환의 구조와 순수 판정값을 지킨다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

eval(slice('function _verseResizeThreshold(', 'function _verseModeTextEls(') +
  ';Object.assign(globalThis,{_verseResizeThreshold,_verseResizeOpacity});');

console.log('시나리오 1 — 보이지 않는 하단 조작 영역');
sc.eq('하단 전용 영역이 있다', SRC.includes('id="verseBarResizeEdge"'), true);
sc.eq('그림이나 문구를 넣지 않는다', /id="verseBarResizeEdge"[^>]*><\/div>/.test(SRC), true);
sc.eq('터치 스크롤과 선택을 막는다', /#verseBarResizeEdge\{[\s\S]*?touch-action:none[\s\S]*?user-select:none/.test(SRC), true);

console.log('\n시나리오 2 — 거리 판정');
sc.eq('폰 최소 전환 거리 28px', _verseResizeThreshold(40,false), 28);
sc.eq('마우스 최소 전환 거리 20px', _verseResizeThreshold(40,true), 20);
sc.eq('큰 높이 차이는 30%', _verseResizeThreshold(120,false), 36);
sc.eq('전환 거리는 44px를 넘지 않는다', _verseResizeThreshold(300,false), 44);

console.log('\n시나리오 3 — 글자 교차 디졸브');
sc.eq('출발점은 기존 글자만 보임', _verseResizeOpacity(0), {from:1,to:0});
sc.eq('도착점은 새 글자만 보임', _verseResizeOpacity(1), {from:0,to:1});
sc.eq('프레임은 실측 높이를 쓴다', SRC.includes('getBoundingClientRect().height'), true);
sc.eq('옛 고정 높이 표는 제거됨', SRC.includes('VERSE_MAX_H'), false);
sc.eq('취소도 크기 안착으로 돌아감', SRC.includes("_verseModeSettle(done,e.type==='pointercancel'?false:candidate)"), true);

sc.done();
