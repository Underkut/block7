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
sc.eq('새 글자는 도착 전에 100%가 되지 않는다', _verseResizeOpacity(.9).to<1, true);
sc.eq('중간에는 새 글자가 이미 보이기 시작한다', _verseResizeOpacity(.5).to>0, true);
sc.eq('프레임은 실측 높이를 쓴다', SRC.includes('getBoundingClientRect().height'), true);
sc.eq('옛 고정 높이 표는 제거됨', SRC.includes('VERSE_MAX_H'), false);
sc.eq('취소는 원래 크기로 되돌아감', SRC.includes("e.type==='pointercancel'?false:(dragged?candidate:true)"), true);
sc.eq('누르기만 해도 모드가 바뀐다', SRC.includes('const dragged=Math.abs(e.clientY-startY)>6;'), true);

console.log('\n시나리오 4 — 복제본이 맨몸이 되지 않는다');
// id 를 뗀 복제본이라도 생김새가 그대로여야 한다 → 말씀영역 생김새는 클래스로 정한다.
sc.eq('상자 생김새가 클래스로 정의됨', /\.vbInner\{/.test(SRC), true);
sc.eq('스닉픽 한 줄도 클래스로 정의됨', /\.vbInner\.sneak-mode \.vbLine\{/.test(SRC), true);
sc.eq('상자에 클래스가 붙어 있다', SRC.includes('<div id="verseBarInner" class="vbInner">'), true);
sc.eq('본문 칸에도 클래스가 붙어 있다', SRC.includes('<div id="verseBarText" class="vbText"></div>'), true);
sc.eq('복제본의 자식 id 도 떼어낸다', SRC.includes("ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'))"), true);
sc.eq('옛 글자는 프레임 크기로 잘린다', /\.verse-mode-clip\{[\s\S]*?overflow:hidden/.test(SRC), true);
sc.eq('옛 글자는 손을 따라 움직인다', SRC.includes("ghost.style.transform='translateY('"), true);

console.log('\n시나리오 5 — 잡는 자리');
sc.eq('전체 모드에서 더 넓게 잡힌다', /\.vbInner:not\(\.sneak-mode\)~#verseBarResizeEdge\{height:34px;\}/.test(SRC), true);
sc.eq('스닉픽에서도 22px 는 된다', /#verseBarResizeEdge\{[\s\S]*?height:22px/.test(SRC), true);

sc.done();
