// 명제의 반응은 명제마다 따로 쌓인다 (v26-0831-6)
//
// HB 신고 — "한 명제에서 누른 반응이 한 설교에 속한 명제들에게 공통으로 적용된다"
//
// 까닭 — 좋아요·암송·Deeper·공유·담아두기는 전부 **장절(ref)로 기록**한다.
// 그런데 한 설교에서 나온 명제들은 **장절이 같다** (같은 본문을 여러 명제로 푼다).
// 그래서 하나에 좋아요를 누르면 그 설교의 명제가 전부 좋아요로 보인다.
//
// ⚠️ _verseIdentity 가 이미 겪은 것과 **똑같은 문제**다. 거기서는 명제 ID(pid)로
//    갈라서 풀었다. 반응도 같은 방법으로 푼다.
//
// ⚠️ **새 저장 항목을 만들지 않는다.** 기록의 ref 칸에 담는 값만 바꾼다
//    (말씀은 장절 그대로, 명제는 명제 ID). 새 항목을 만들면 병합·백업 다섯 곳에
//    등록해야 하고 그만큼 잃을 자리가 는다 (26-0831 사고).
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

// 진짜 코드를 떠온다
eval(asVar(sliceDev('const _REF_ABBR2FULL', 'function _findVerseByRefLoose(')));
eval(asVar(sliceDev('function _statRefKey(', 'let _verseStatCache')));
eval(asVar(sliceDev('// ══ 반응 키 (v26-0831-6)', 'function _vfSyncCounts(')));

let ST = { verseLikeLog:{}, memorizationLog:{}, verseDeeperLog:{},
           verseEvenDeeperLog:{}, verseShareLog:{}, verseKeepLog:{}, settings:{} };
function getLikeLog(){ return ST.verseLikeLog; }
function getMemLog(){ return ST.memorizationLog; }
function getDeeperLog(){ return ST.verseDeeperLog; }
function getEvenDeeperLog(){ return ST.verseEvenDeeperLog; }
function getShareLog(){ return ST.verseShareLog; }

// 한 설교에서 나온 명제 셋 — **장절이 전부 같다** (실제 명제집이 이렇다)
const P1 = { pid:'P0001', kind:'prop', ref:'로마서 1:17', krText:'명제 하나' };
const P2 = { pid:'P0002', kind:'prop', ref:'로마서 1:17', krText:'명제 둘' };
const P3 = { pid:'P0003', kind:'prop', ref:'',            krText:'장절 없는 명제' };
const V1 = { ref:'요한복음 3:16', krText:'평범한 말씀' };

console.log('시나리오 1 — 반응 키가 명제마다 다르다');
{
  sc.eq('명제는 명제 ID 로 갈린다', _reactKey(P1) !== _reactKey(P2), true);
  sc.eq('같은 명제는 같은 키', _reactKey(P1), _reactKey({pid:'P0001',ref:'아무거나'}));
  // ⚠️ 장절이 같아도 갈려야 한다 — 이게 이 시험의 전부다
  sc.eq('장절이 같아도 안 묶인다', _reactKey(P1) === _reactKey(P2), false);
  // 장절 없는 명제도 제 키를 갖는다 (예전엔 빈 문자열이라 기록이 아예 안 됐다)
  sc.eq('장절 없는 명제도 키가 있다', !!_reactKey(P3), true);
  sc.eq('장절 없는 명제도 따로', _reactKey(P3) !== _reactKey(P1), true);

  // 말씀은 **예전 그대로** 장절이 키다 — 이게 깨지면 기존 기록이 통째로 안 보인다
  sc.eq('말씀은 장절이 그대로 키', _reactKey(V1), '요한복음 3:16');
  sc.eq('키가 장절과 부딪히지 않는다', /[]/.test(_reactKey(P1)), true);
  sc.eq('구절이 없어도 안전', _reactKey(null), '');
}

console.log('\n시나리오 2 — 세는 것도 명제마다 따로');
{
  const day = '2026-08-31';
  ST.verseLikeLog = { [day]: [
    { ref:_reactKey(P1), time:'10:00' },
    { ref:_reactKey(P1), time:'10:05' },
    { ref:_reactKey(V1), time:'10:10' }
  ]};
  sc.eq('누른 명제만 센다', _verseEventCount('like', _reactKey(P1)), 2);
  sc.eq('같은 설교의 다른 명제는 0', _verseEventCount('like', _reactKey(P2)), 0);
  sc.eq('장절로 세도 명제는 안 걸린다', _verseEventCount('like', '로마서 1:17'), 0);
  sc.eq('말씀은 예전처럼 센다', _verseEventCount('like', '요한복음 3:16'), 1);

  // ⚠️ 말씀은 띄어쓰기·표기가 달라도 찾아야 한다 (예전 동작 — 깨뜨리면 안 된다)
  ST.verseLikeLog = { [day]: [{ ref:'요한복음 3:16', time:'10:00' }] };
  sc.eq('말씀은 표기가 달라도 찾는다', _verseEventCount('like', '요한복음3:16'), 1);
  // 명제 키는 **정확히** 같아야 한다 (느슨하게 맞추면 다시 뭉친다)
  ST.verseLikeLog = { [day]: [{ ref:_reactKey(P1), time:'10:00' }] };
  sc.eq('명제 키는 정확히 맞을 때만', _verseEventCount('like', _reactKey(P2)), 0);
}

console.log('\n시나리오 3 — 암송(날짜→구간→배열)도 마찬가지');
{
  ST.memorizationLog = { '2026-08-31': { am: [
    { ref:_reactKey(P1), time:'07:00' },
    { ref:_reactKey(V1), time:'07:10' }
  ]}};
  sc.eq('누른 명제만', _verseEventCount('mem', _reactKey(P1)), 1);
  sc.eq('다른 명제는 0', _verseEventCount('mem', _reactKey(P2)), 0);
  sc.eq('말씀은 그대로', _verseEventCount('mem', '요한복음 3:16'), 1);
}

console.log('\n시나리오 4 — 기록을 남기는 자리가 모두 키를 쓴다');
{
  // ⚠️ 한 곳이라도 장절을 그대로 쓰면 거기서만 다시 뭉친다.
  sc.eq('전체화면 좋아요·암송',
        SRC_DEV.includes('_reactWithToast(kind,_reactKey(v));'), true);
  sc.eq('더블탭 좋아요', SRC_DEV.includes('recordVerseLike(_reactKey(v));'), true);
  sc.eq('공유', SRC_DEV.includes('recordVerseShare(_reactKey(v));'), true);
  // 숫자는 키를 한 번 구해 두고 다섯 갈래가 함께 쓴다
  sc.eq('전체화면 숫자가 키를 쓴다',
        SRC_DEV.includes('const ref=_reactKey(v);   // 명제는 명제 ID, 말씀은 장절'), true);
  // v26-0831-13 — 저장은 바로 담지 않고 **목록 고르기 창**을 연다. 그래도
  //   구절을 가리키는 값은 그대로 반응 키다 (명제마다 따로 담기려면 그래야 한다).
  sc.eq('저장(목록 고르기)', SRC_DEV.includes('openKeepPicker(_reactKey(v))'), true);

  // 되돌아 찾기 — 키에서 그 명제를 다시 찾을 수 있어야 한다
  //  (담아둔 것 타일·반응 목록이 이 길로 구절을 되찾는다)
  sc.eq('키로 되찾는 길이 있다',
        SRC_DEV.includes('function _findVerseByRefLoose(ref){'), true);
  sc.eq('명제 키를 알아본다', SRC_DEV.includes('_REACT_PID_PREFIX'), true);
}

console.log('\n시나리오 5 — 구독자 전체 집계를 교회별로 가른다 (v26-0831-7, HB)');
{
  // ⚠️ verseStats 는 **모든 사용자가 함께 쓰는** 칸이다. 명제 ID(P0001)만
  //    쓰면 교회마다 겹쳐 남의 교회 명제와 한 칸을 쓰게 된다.
  //    → 그 명제집의 **6자리 발행 코드**로 칸을 가른다. 발행자와 구독자가
  //      같은 코드를 쓰므로 한 교회 안에서는 자연히 같은 칸에 모인다.
  const A = { pid:'P0001', _code:'123456', ref:'로마서 1:17' };   // 우리 교회
  const B = { pid:'P0001', _code:'999999', ref:'로마서 1:17' };   // 다른 교회
  const C = { pid:'P0001', ref:'로마서 1:17' };                   // 발행·구독 안 한 내 시트

  sc.eq('두 교회의 같은 번호가 안 섞인다', _reactKey(A) !== _reactKey(B), true);
  sc.eq('전체 집계 칸도 갈린다', _statDocKey(_reactKey(A)) !== _statDocKey(_reactKey(B)), true);
  sc.eq('우리 교회 칸 이름', _statDocKey(_reactKey(A)), 'p.123456.P0001');
  // ⚠️ 코드가 없으면 함께 셀 상대가 없다 → 전체 집계를 하지 않는다 (내 기록만)
  sc.eq('코드 없는 명제집은 전체 집계 안 함', _statDocKey(_reactKey(C)), '');
  // 말씀은 예전 그대로 장절이 칸 이름 — 이게 바뀌면 기존 집계가 통째로 끊긴다
  sc.eq('말씀은 장절이 칸 이름', _statDocKey('요한복음 3:16'), '요한복음 3:16');

  // 키에서 코드와 명제 ID 를 도로 꺼낼 수 있어야 한다
  sc.eq('코드를 꺼낸다', _reactKeyParts(_reactKey(A)).code, '123456');
  sc.eq('명제 ID 를 꺼낸다', _reactKeyParts(_reactKey(A)).pid, 'P0001');
  sc.eq('말씀 키는 조각이 없다', _reactKeyParts('요한복음 3:16'), null);
  // 옛 모양(코드 없이 만든 키)도 읽어 준다 — 오늘 만든 기록이 깨지지 않게
  sc.eq('옛 모양도 읽는다', _reactKeyParts('P\u0001P0009').pid, 'P0009');
}

console.log('\n시나리오 6 — 같은 교회 안에서는 함께 센다');
{
  // 발행자와 구독자는 같은 6자리 코드를 쓴다 → 같은 칸
  const pub = { pid:'P0007', _code:'123456' };
  const sub = { pid:'P0007', _code:'123456' };
  sc.eq('발행자와 구독자가 같은 칸',
        _statDocKey(_reactKey(pub)), _statDocKey(_reactKey(sub)));
  sc.eq('내 기록 키도 같다', _reactKey(pub), _reactKey(sub));
  sc.eq('다른 명제는 다른 칸',
        _statDocKey(_reactKey({pid:'P0008',_code:'123456'})) !== _statDocKey(_reactKey(pub)), true);
}

console.log('\n시나리오 7 — 키로 그 명제를 도로 찾는다 (v26-0831-14, HB 신고)');
{
  // HB — "저장된 명제가 명제 본문이 안 보이고 P로 시작하는 명제 ID만 보인다"
  // 까닭 — _findVerseByRefLoose 가 키 앞머리(P\u0001)만 떼고 pid 와 견줬다.
  //   그런데 v26-0831-7 부터 키 가운데에 **6자리 코드**가 들어간다:
  //     P\u0001<코드>\u0001<명제 ID>
  //   그래서 남는 값이 "123456\u0001P0001" 이 되어 **언제나 못 찾았고**,
  //   못 찾으면 화면이 키를 그대로 쓴다 → 명제 ID 만 보였다.
  sc.eq('조각내는 일은 한 곳에서만',
        SRC_DEV.includes('const pt=_reactKeyParts(ref);'), true);
  sc.eq('앞머리만 떼던 옛 길은 없앴다',
        SRC_DEV.includes('const want=ref.slice(_REACT_PID_PREFIX.length);'), false);
  // 꺼 둔 모음에 있어도 찾는다 (저장한 뒤 그 모음을 껐을 수 있다)
  sc.eq('꺼 둔 모음까지 뒤진다',
        SRC_DEV.includes("(ALL_VERSES()||[]).find(v=>v&&v.pid===want)"), true);
  // 조각내기 자체는 이미 시나리오 5 가 지킨다 — 여기서 한 번 더 못 박는다
  const k=_reactKey({pid:'P0001',_code:'123456'});
  sc.eq('키에서 명제 ID 를 꺼낸다', _reactKeyParts(k).pid, 'P0001');
  sc.eq('앞머리만 떼면 명제 ID 가 아니다',
        k.slice(_REACT_PID_PREFIX.length)==='P0001', false);
}

console.log('\n시나리오 8 — 명제 Deeper 는 연결된 설교 본문을 고른다');
{
  sc.eq('명제 Deeper 단추를 숨기지 않는다',
        SRC_DEV.includes("['mem','even'].forEach(k=>"), true);
  sc.eq('명제의 연결 본문을 고르는 공용 함수가 있다',
        SRC_DEV.includes('function _vfDeeperRefs(v){'), true);
  sc.eq('본문 하나면 곧바로 연다',
        SRC_DEV.includes('if(refs.length===1){_openPropDeeper(v,refs[0]);return;}'), true);
  sc.eq('본문 여럿이면 선택 팝업을 연다',
        SRC_DEV.includes("document.getElementById('vfDeeperModal').style.display='flex';"), true);
  sc.eq('선택한 성경을 열되 반응은 명제에 기록한다',
        SRC_DEV.includes("recordVerseDeeper(_reactKey(v));\n  BibleLinkProvider.openBskFromRef(ref);"), true);
  sc.eq('말씀 Deeper 는 예전 길을 그대로 쓴다',
        SRC_DEV.includes("else openDeeperFromRef(v.ref);"), true);
  sc.eq('새 팝업은 ESC 로 닫힌다',
        SRC_DEV.includes("['vfDeeperModal', ()=>closeVfDeeperPicker()]"), true);
}

sc.done();
