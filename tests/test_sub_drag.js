// 하위 줄 끌어 순서 바꾸기 — 데이터 쪽 (HB 2026-10-29)
// 끌기와 메뉴의 위로·아래로가 같은 _subReorder 한 곳을 쓴다. 범위 밖 · 제자리 · 없는 줄은 아무것도 안 바꾼다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = slice('function _subReorder(type,secId,idx,from,to){', 'function _sdrRows(panel)');
const subs = ['하나', '둘', '셋'].map(text => ({ text }));
const arr = [{ text: '부모', subs }];
let saves = 0;
const env = { _subsOf: it => (it && Array.isArray(it.subs)) ? it.subs : [], _taskArrOf: () => arr, beforeSave() {}, save() { saves++; } };
const n = Object.keys(env);
const _subReorder = new Function(...n, SRC + '\nreturn _subReorder;')(...n.map(k => env[k]));
const now = () => subs.map(s => s.text);
console.log('시나리오 1 — 맨 앞을 맨 뒤로');
sc.eq('옮김', _subReorder('big', 'am', 0, 0, 2), true);
sc.eq('순서', now(), ['둘', '셋', '하나']);
console.log('시나리오 2 — 맨 뒤를 가운데로');
_subReorder('big', 'am', 0, 2, 1);
sc.eq('순서', now(), ['둘', '하나', '셋']);
console.log('시나리오 3 — 제자리 · 범위 밖 · 없는 줄은 그대로, 저장도 안 함');
const before = saves;
sc.eq('제자리', _subReorder('big', 'am', 0, 1, 1), false);
sc.eq('범위 밖', _subReorder('big', 'am', 0, 0, 3), false);
sc.eq('없는 줄', _subReorder('big', 'am', 0, 5, 0), false);
sc.eq('없는 부모', _subReorder('big', 'am', 9, 0, 1), false);
sc.eq('순서 그대로', now(), ['둘', '하나', '셋']);
sc.eq('저장 안 함', saves, before);
sc.done();
