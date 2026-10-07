// 보기 필터(깃발만 보기·★·A·할일 필터…)가 "저절로 켜지는" 문제 (v26-1007-1).
//
// 증상(HB 2026-10-07): 가만히 있었는데 어느 순간 '깃발(중요) 표시 할일만 보기' 가 켜진다.
//
// 까닭: 보기 필터는 ST.preset 하나에 담겨 기기끼리 동기화된다. 그런데 원격을 받는
//   applyRemoteState 가 `ST.preset = remote.preset ?? ST.preset` 이었다.
//   필터를 끈 값은 null 이고, `??` 는 null 을 "값 없음" 으로 보고 **이 기기 값을 남긴다.**
//   ① 기기 A 에서 깃발 필터를 켠다 → 기기 B 도 켜진다 (null 이 아니라서 받는다)
//   ② 기기 A 에서 끈다 → 클라우드는 null → 기기 B 는 null 을 버리고 '켜짐' 을 쥔다
//      (B 의 기준점 base 는 이제 null 이다)
//   ③ 기기 B 가 아무거나 저장한다(말씀 자동 넘김·하루 넘김 등 — 사람이 안 만져도 난다)
//      → 3자 병합이 base(null)·B(켜짐)·클라우드(null) 를 보고 "B 가 켰다" 로 읽는다
//      → 클라우드가 다시 켜짐 → 기기 A 가 저절로 켜진다.
//   prevVis(★·A 를 끄면 돌아갈 구간 목록)도 같은 모양이라 함께 고쳤다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };

eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

// applyRemoteState 를 진짜 소스에서 떠온다. 화면·제품 칸막이 함수는 그대로 통과시킨다.
let ST = null, SECS = [];
function _psOverlay(s) { return s; }
function _dsOverlay(s) { return s; }
function _secNormalizeTimes() {}
eval(slice('function applyRemoteState(remote){', '// Start listening for realtime changes'));

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function blank() {
  return { vis: ['am', 'pm', 'night'], prevVis: null, preset: null, collapsed: [], days: {},
           contacts: [], settings: { theme: 'dark' } };
}
// 한 기기 — 자기 화면 상태(st)와 기준점(base)을 들고 있다
function device() { return { st: blank(), base: blank() }; }
// 원격 받기 (편집 대기 없음 경로): base = 클라우드, 화면 = applyRemoteState
function receive(dev, cloud) {
  ST = dev.st;
  applyRemoteState(clone(cloud));
  dev.st = ST;
  dev.base = clone(cloud);
}
// 저장해서 올리기: 클라우드가 앞서 있으면 3자 병합, 결과가 새 클라우드
function commit(dev, cloud) {
  const out = _fbMerge(clone(dev.base), clone(dev.st), clone(cloud));
  dev.base = clone(out);
  ST = dev.st; applyRemoteState(clone(out)); dev.st = ST;
  return out;
}

console.log('시나리오 1 — 다른 기기에서 끈 깃발 필터가 이 기기에서도 꺼진다');
{
  const A = device(), B = device();
  let cloud = blank();
  A.st.preset = 'flagFilter'; cloud = commit(A, cloud);  // A 에서 켬
  receive(B, cloud);
  sc.eq('켠 것은 B 에도 온다', B.st.preset, 'flagFilter');
  A.st.preset = null; cloud = commit(A, cloud);          // A 에서 끔
  receive(B, cloud);
  sc.eq('끈 것도 B 에 온다 (예전엔 켜진 채 남았다)', B.st.preset, null);
}

console.log('시나리오 2 — 가만히 있던 기기의 저장이 필터를 되살리지 않는다 (HB 증상 그대로)');
{
  const A = device(), B = device();
  let cloud = blank();
  A.st.preset = 'flagFilter'; cloud = commit(A, cloud);
  receive(B, cloud);
  A.st.preset = null; cloud = commit(A, cloud);
  receive(B, cloud);
  // B 가 사람 손 없이 무언가 저장한다 (예: 말씀 자동 넘김)
  B.st.settings.verseCurrentIdx = 3;
  cloud = commit(B, cloud);
  sc.eq('클라우드의 필터는 꺼진 채', cloud.preset, null);
  receive(A, cloud);
  sc.eq('A 는 저절로 켜지지 않는다', A.st.preset, null);
  sc.eq('B 의 저장 내용은 그대로 간다', A.st.settings.verseCurrentIdx, 3);
}

console.log('시나리오 3 — ★ 를 끈 뒤 돌아갈 구간 목록(prevVis)도 같은 규칙');
{
  const A = device(), B = device();
  let cloud = blank();
  A.st.prevVis = ['am']; A.st.preset = 'star'; cloud = commit(A, cloud);
  receive(B, cloud);
  A.st.prevVis = null; A.st.preset = null; cloud = commit(A, cloud);
  receive(B, cloud);
  sc.eq('B 의 ★ 꺼짐', B.st.preset, null);
  sc.eq('B 의 prevVis 비워짐', B.st.prevVis, null);
}

console.log('시나리오 4 — 칸이 아예 없는 문서(옛 기기)는 이 기기 값을 지킨다');
{
  const B = device();
  B.st.preset = 'flagFilter'; B.st.prevVis = ['am'];
  const old = blank(); delete old.preset; delete old.prevVis;
  ST = B.st; applyRemoteState(old);
  sc.eq('preset 유지', ST.preset, 'flagFilter');
  sc.eq('prevVis 유지', ST.prevVis, ['am']);
}

console.log('시나리오 5 — 두 기기가 같은 필터를 다르게 고르면 마지막 것을 따른다');
{
  const A = device(), B = device();
  let cloud = blank();
  A.st.preset = 'flagFilter'; cloud = commit(A, cloud);
  receive(B, cloud);
  B.st.preset = 'contactFilter'; cloud = commit(B, cloud);
  receive(A, cloud);
  sc.eq('A 가 B 의 새 필터를 따른다', A.st.preset, 'contactFilter');
}

console.log('시나리오 6 — 빈 기기로 로그인해도 클라우드는 그대로');
{
  const cloud = blank();
  cloud.preset = 'flagFilter'; cloud.prevVis = ['am', 'pm'];
  cloud.days = { '2026-10-07': { big: { am: [{ text: '설교 준비', done: false }] }, small: {}, trash: [] } };
  const fresh = device();                        // 기본값만 든 새 기기
  receive(fresh, cloud);                         // 로그인 첫 받기
  sc.eq('클라우드의 필터를 받는다', fresh.st.preset, 'flagFilter');
  fresh.st.settings.theme = 'light';             // 새 기기가 아무거나 저장
  const out = commit(fresh, cloud);
  sc.eq('클라우드의 필터 그대로', out.preset, 'flagFilter');
  sc.eq('클라우드의 prevVis 그대로', out.prevVis, ['am', 'pm']);
  sc.eq('할일 그대로', out.days['2026-10-07'].big.am[0].text, '설교 준비');
}

sc.done();
