// 명제 대표 문구 선로딩 · 등장 효과
const { SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 새 사용자는 두 효과가 모두 켜져 있다');
sc.eq('디졸브 기본값', SRC_DEV.includes('propTitleDissolve:true'), true);
sc.eq('타이핑 기본값', SRC_DEV.includes('propTitleTyping:true'), true);

console.log('\n시나리오 2 — 설정 버튼은 저장값과 표시를 함께 맞춘다');
sc.eq('디졸브 버튼', SRC_DEV.includes('id="ptMotionDissolve"'), true);
sc.eq('타이핑 버튼', SRC_DEV.includes('id="ptMotionTyping"'), true);
sc.eq('설정 동기화', SRC_DEV.includes('function _ptSyncMotionUI(){'), true);

console.log('\n시나리오 3 — 둘 다 켜면 화면마다 하나만 고른다');
sc.eq('효과 선택 함수', /function _ptPickMotion\(\)[\s\S]{0,500}Math\.random\(\)<\.5/.test(SRC_DEV), true);
sc.eq('화면을 뽑을 때 효과도 결정', /function _vfRollProp\(\)[\s\S]{0,500}_vfPropMotion=_ptPickMotion\(\)/.test(SRC_DEV), true);

console.log('\n시나리오 4 — 현재와 다음 명제의 글씨체를 미리 준비한다');
sc.eq('명제 하나 준비', SRC_DEV.includes('function _ptPreloadVerse(v){'), true);
sc.eq('다음 화면 준비', SRC_DEV.includes('function _vfPrepareNext(){'), true);
sc.eq('현재 말씀 준비', SRC_DEV.includes('_ptPreloadVerse(_vfCurrentVerse())'), true);

console.log('\n시나리오 5 — 동작 줄이기 설정을 존중한다');
sc.eq('reduced motion', SRC_DEV.includes('@media (prefers-reduced-motion:reduce)'), true);

sc.done();
