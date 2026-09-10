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
sc.eq('취소는 원래 크기로 되돌아감', SRC.includes('_verseDragEnd(cancelled,false)'), true);
sc.eq('움직였는지는 6px 로 가른다', SRC.includes('if(Math.abs(clientY-d.startY)>6)d.moved=true;'), true);

console.log('\n시나리오 4 — 복제본이 맨몸이 되지 않는다');
// id 를 뗀 복제본이라도 생김새가 그대로여야 한다 → 말씀영역 생김새는 클래스로 정한다.
sc.eq('상자 생김새가 클래스로 정의됨', /\.vbInner\{/.test(SRC), true);
sc.eq('스닉픽 한 줄도 클래스로 정의됨', /\.vbInner\.sneak-mode \.vbLine\{/.test(SRC), true);
sc.eq('상자에 클래스가 붙어 있다', SRC.includes('<div id="verseBarInner" class="vbInner">'), true);
sc.eq('본문 칸에도 클래스가 붙어 있다', SRC.includes('<div id="verseBarText" class="vbText"></div>'), true);
sc.eq('복제본의 자식 id 도 떼어낸다', SRC.includes("ghost.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'))"), true);
sc.eq('옛 글자는 프레임 크기로 잘린다', /\.verse-mode-clip\{[\s\S]*?overflow:hidden/.test(SRC), true);
sc.eq('옛 글자는 손을 따라 움직인다', SRC.includes("ghost.style.transform='translateY('"), true);

console.log('\n시나리오 5 — 잡는 자리 (v26-0910-13 에 넓힘)');
// 세 자리가 하나의 손잡이를 나눠 쓴다: 상자 본문 · 상자 아래 띠 · (마우스만) 하단 가장자리
sc.eq('공통 손잡이로 모은다', ['_verseDragBegin(','_verseDragMove(','_verseDragEnd('].every(f=>SRC.includes(f)), true);
sc.eq('본문에서 시작한 세로도 크기 전환', SRC.includes("if(dragDir==='v')_verseDragBegin(t.clientY,false);"), true);
sc.eq('본문 가로는 앞뒤 말씀 넘김 그대로', SRC.includes("dragDir=Math.abs(ddy)>Math.abs(ddx)*1.3?'v':'h';"), true);
sc.eq('상자에서는 세로 스크롤을 끈다', /#verseBar\{[\s\S]*?touch-action:pan-x/.test(SRC), true);
// ⚠️ 스닉픽은 상자가 낮아 가장자리가 절반을 덮는다 → 손가락에게는 두지 않는다.
sc.eq('손가락에는 하단 가장자리를 두지 않는다', /@media \(hover:none\)\{\s*\n\s*#verseBarResizeEdge\{display:none;\}/.test(SRC), true);
sc.eq('마우스에는 남긴다(ns-resize)', /#verseBarResizeEdge\{[\s\S]*?cursor:ns-resize/.test(SRC), true);
sc.eq('마우스 가장자리는 전체 모드에서 더 넓다', /\.vbInner:not\(\.sneak-mode\)~#verseBarResizeEdge\{height:34px;\}/.test(SRC), true);

console.log('\n시나리오 6 — 상자 아래 띠(빈틈 + 달성바)');
// ⚠️ 투명 상자를 덮어 두는 방식은 브라우저가 터치를 가까운 다른 요소로
//    옮겨 붙여(touch adjustment) 어떤 높이에서는 손을 못 받았다 → 좌표로 본다.
sc.eq('요소가 아니라 좌표로 판정한다', SRC.includes('function _verseBandHit('), true);
sc.eq('덮어두는 투명 상자는 쓰지 않는다', SRC.includes('verseDragZone'), false);
sc.eq('띠는 상자 아래에서 달성바 줄까지', SRC.includes('r.bottom+3:b.bottom+18'), true);
sc.eq('가로면 넘겨 준다(뷰 전환이 산다)', SRC.includes("if(Math.abs(ddy)<=Math.abs(ddx)*1.3)return 'give';"), true);
sc.eq('2·3단에서는 잡지 않는다', /_verseBandHit[\s\S]{0,400}_layMode\(\)>=2/.test(SRC), true);
sc.eq('달성바 줄의 native 스크롤은 끈다', SRC.includes('#totalRow{touch-action:none;}'), true);
// 스크롤이 굼떠지지 않게, 띠를 짚은 동안에만 non-passive 감시자를 건다
sc.eq('감시자는 짚은 동안에만 건다', SRC.includes("document.addEventListener('touchmove',onMove,{passive:false,capture:true});"), true);
sc.eq('떼면 감시자를 떼어낸다', SRC.includes('const unwatch=()=>document.removeEventListener'), true);

sc.done();
