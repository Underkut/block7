// BLOCK7 할일 메뉴 '기도 노트로' — 기도노트(BLUE ROOM) 그룹 판에 무엇이 나오는가 (v26-1013-5)
// 지키는 것:
//  ① 위 그룹은 부모가 없거나 부모가 지워진 것 — 기도노트 지도와 같은 차례
//  ② 서브 그룹은 제 자리(parent) + 연동해 둔 자리(also) 둘 다에 보인다
//  ③ 이상한 자료(빈 것 · 배열 아님)에도 죽지 않는다
//  ④ ⭐ 보내기는 기도노트 우체통(pray/{uid}/c/inbox)에만 쓴다 — 기도노트 덩어리 · BLOCK7 상태 문서를 쓰지 않는다
const fs = require('fs'), path = require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const a = SRC.indexOf('function _prayTree(G){'), b = SRC.indexOf('function _prayLoadGroups(){');
if (a < 0 || b < 0) { console.error('_prayTree 를 못 찾았습니다'); process.exit(2); }
const _prayTree = new Function(SRC.slice(a, b) + '; return _prayTree;')();

const G = [
  { id: 'g1', name: '가족', color: '#e09a28' },
  { id: 's1', name: '13세', parent: 'g1' },
  { id: 'g2', name: '청년부', color: '#4aa1f7' },
  { id: 's2', name: '찬양팀', parent: 'g2', also: ['g1'] },
  { id: 'o1', name: '부모 지워짐', parent: 'gone' }
];
const t = _prayTree(G);
sc.eq('① 위 그룹 차례 (부모가 지워진 것도 위 그룹)', t.map(g => g.name), ['가족', '청년부', '부모 지워짐']);
sc.eq('② 가족 밑 — 제 자리 + 연동', t[0].kids.map(k => k.name), ['13세', '찬양팀']);
sc.eq('② 청년부 밑', t[1].kids.map(k => k.name), ['찬양팀']);
sc.eq('② 서브 그룹 색이 없으면 그룹 색', t[0].kids[0].color, '#e09a28');
sc.eq('③ 빈 자료', [_prayTree([]).length, _prayTree(null).length, _prayTree(undefined).length], [0, 0, 0]);
// ④ 쓰는 자리 — 보내기 함수 안의 Firestore 쓰기는 우체통 한 곳뿐
const s0 = SRC.indexOf('async function _praySend('), s1 = SRC.indexOf('// ═══════ 할일 → 기도노트로 끝', s0);
const body = SRC.slice(s0, s1);
sc.eq('⭐④ 보내기는 우체통(c/inbox)에 arrayUnion 한 줄', [/_prayDb\(\)\.doc\('pray\/'\+uid\+'\/c\/inbox'\)\.set\(\{items:firebase\.firestore\.FieldValue\.arrayUnion\(note\)\},\{merge:true\}\)/.test(body)], [true]);
sc.eq('⭐④ 기도노트 덩어리(c/0 …) · users 문서는 쓰지 않는다', [(body.match(/\.set\(|\.update\(|\.delete\(/g) || []).length, /users\//.test(body)], [1, false]);
const L0 = SRC.indexOf('function _prayLoadGroups(){'), L1 = SRC.indexOf('const _PRAY_HOVER', L0);
sc.eq('⭐④ 그룹 읽기는 읽기만 (set · update · delete 없음)', /\.set\(|\.update\(|\.delete\(/.test(SRC.slice(L0, L1)), false);
// ⑤ ⭐ BLOCK7 의 fbDB 는 로그인 덩어리 안의 이름이라 여기서 쓰면 멈춘다 (v26-1013-6 '불러오는 중…' 에서 멈춤)
const P0 = SRC.indexOf('// ═══════ 할일 → 기도노트(BLUE ROOM)로 보내기'), P1 = SRC.indexOf('// ═══════ 할일 → 기도노트로 끝', P0);
sc.eq('⭐⑤ 기도노트 보내기 덩어리는 fbDB 를 쓰지 않는다', /\bfbDB\b/.test(SRC.slice(P0, P1).replace(/\/\/.*$/gm, '')), false);
sc.done();
