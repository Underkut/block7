// 할일 글자 위 홀드가 브라우저의 전체선택 대신 드래그를 시작하는지 지킨다.
// 짧은 탭/클릭은 기존처럼 입력칸 편집으로 남아 있어야 한다.
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const from = SRC.indexOf('function attachDrag(el,type,i,id)');
const to = SRC.indexOf('function getSecColor(id)', from);
const part = SRC.slice(from, to);

console.log('시나리오 1 — PC 글자는 짧은 클릭=편집, 200ms 홀드=드래그');
sc.eq('글자 입력칸 전용 홀드 시간이 200ms다',
      SRC.includes('const LONG_PRESS_MOUSE_INPUT=200;'), true);
sc.eq('PC 제외 대상에 input 전체가 들어 있지 않다',
      part.includes("closest('.bi-dh,.si-dh,input,textarea,.blk-chk,.blk-del')"), false);
sc.eq('PC 글자 입력칸만 전용 홀드 시간을 쓴다',
      part.includes('heldInput?LONG_PRESS_MOUSE_INPUT:LONG_PRESS_MOUSE'), true);

console.log('\n시나리오 2 — 모바일 글자도 기존 280ms 홀드 드래그에 참여');
sc.eq('모바일 제외 대상에서 input을 뺐다',
      part.includes("closest('textarea,.blk-chk,.blk-del')"), true);
sc.eq('모바일 드래그는 기존 터치 홀드 시간을 쓴다',
      part.includes('},LONG_PRESS_TOUCH);'), true);

console.log('\n시나리오 3 — 드래그 시작 전에 입력칸 선택과 키보드를 정리');
sc.eq('입력칸 선택 범위를 접는다',
      (part.match(/setSelectionRange\(p,p\)/g)||[]).length, 2);
sc.eq('PC와 모바일 모두 입력칸 포커스를 해제한다',
      (part.match(/document\.activeElement\.blur\(\)/g)||[]).length >= 2, true);

sc.done();
