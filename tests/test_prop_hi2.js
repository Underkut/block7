// 명제의 대표 문구 두 개 (v26-0904-4, HB)
//
// 시트의 '대표 문구' 열 하나가 '대표 문구 1' · '대표 문구 2' 둘로 갈렸다.
//   ① 하나만 쓰는 명제는 '대표 문구 1' 에만 적는다 — 예전과 똑같이 동작해야 한다
//   ② 둘 다 적으면 전체화면에 띄울 때 그중 하나가 무작위로 선다
//
// ⚠️ 여기서 지키는 것은 **값이 흘러가는 길**이다. 새 항목(hi2)은 시트 읽기 →
//    모음 동기화 → 발행/구독 세 곳을 모두 지나야 화면까지 온다. 한 곳만 빠져도
//    "어떤 기기에서만 둘째 문구가 안 뜬다" 가 된다 — hi(강조 문구)가 0813-3 에,
//    pid 가 0831-2 에 똑같이 당했다. (tests/test_share_prop.js 와 같은 까닭)
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

eval(asVar(sliceDev('function _verseIdentity(', 'function _gSrcId(')));
eval(asVar(sliceDev('const _PROP_REF_MAX=', 'function _rowsToItems(')));
eval(asVar(sliceDev('function _sharedVerseOut(', '// 소유자의 모음 내용을 shared')));
eval(asVar(sliceDev('function _syncSheetVersesIntoColl(', 'function addCustomVerseFromForm(')));
eval(asVar(sliceDev('function _propHiList(', 'function _vfIsProp(')));

function _bookOfRef(r){ return String(r||'').replace(/\s*\d.*$/, '').trim(); }
function _parseVDate(raw){ return String(raw||'').trim(); }
function _calKey(){ return '2026-09-04'; }
function todayKey(){ return '2026-09-04'; }
var _vfPropHiIdx = 0;

// ═══ 1. 새 시트 — 두 열을 각각 제자리로 읽는다 ═══
console.log('시나리오 1 — 대표 문구 1·2 를 각각 읽는다');
{
  const rows = [
    ['명제 ID','명제','대표 문구 1','대표 문구 2','설교 본문','카테고리','설교 제목','날짜'],
    ['P0001','첫 명제 본문','첫째 문구','둘째 문구','로마서 5:8','주일예배','은혜','2026-09-01'],
    ['P0002','둘째 명제 본문','하나뿐인 문구','','요한복음 3:16','주일예배','사랑','2026-09-01'],
  ];
  const it = _propRowsToItems(rows);
  sc.eq('두 줄을 읽었다', it.length, 2);
  sc.eq('대표 문구 1 → hi', it[0].hi, '첫째 문구');
  sc.eq('대표 문구 2 → hi2', it[0].hi2, '둘째 문구');
  // ⚠️ 여기가 핵심이다. col() 은 정확한 이름을 먼저 찾고 없으면 '포함' 으로
  //    찾는다. 이름 견주는 차례가 틀리면 '대표 문구' 가 '대표 문구 2' 열을
  //    집어가서 두 문구가 뒤바뀐다.
  sc.eq('둘째 칸이 비면 hi2 도 빈다', it[1].hi2, '');
  sc.eq('하나뿐인 문구는 첫째 자리다', it[1].hi, '하나뿐인 문구');
}

// ═══ 2. 옛 시트 ('대표 문구' 한 열) 도 그대로 읽는다 ═══
console.log('\n시나리오 2 — 옛 시트가 안 깨진다');
{
  const rows = [
    ['명제 ID','명제','대표 문구','설교 본문'],
    ['P0001','명제 본문','옛 문구','로마서 5:8'],
  ];
  const it = _propRowsToItems(rows);
  sc.eq('옛 이름도 첫째 자리로 온다', it[0].hi, '옛 문구');
  sc.eq('둘째는 없다', it[0].hi2, '');
}

// ═══ 3. 고르기 — 하나면 늘 그것, 둘이면 뽑은 쪽 ═══
console.log('\n시나리오 3 — 띄울 때 어느 쪽이 서는가');
{
  const one = { pid:'P1', hi:'하나뿐' };
  const two = { pid:'P2', hi:'첫째', hi2:'둘째' };
  _vfPropHiIdx = 0;
  sc.eq('하나뿐이면 그것 (뽑기와 무관)', _propHiPick(one), '하나뿐');
  sc.eq('둘이면 0번', _propHiPick(two), '첫째');
  _vfPropHiIdx = 1;
  sc.eq('하나뿐이면 여전히 그것', _propHiPick(one), '하나뿐');
  sc.eq('둘이면 1번', _propHiPick(two), '둘째');
  // 첫째가 비고 둘째만 있는 줄 — 빈 자리를 세우지 않는다
  sc.eq('첫째가 비면 둘째가 선다', _propHiPick({hi:'', hi2:'둘째만'}), '둘째만');
  sc.eq('둘 다 비면 빈 글자', _propHiPick({}), '');
}

// ═══ 4. 발행·구독에서 살아 간다 ═══
console.log('\n시나리오 4 — 구독자에게도 둘 다 간다');
{
  const v = { cat:'주일예배', topic:'은혜', krText:'명제', ref:'로마서 5:8',
              tags:[], hi:'첫째', hi2:'둘째', d:'2026-09-01', pid:'P0001' };
  const out = _sharedVerseOut(v);
  sc.eq('발행에 실린다', out.hi2, '둘째');
  sc.eq('구독에 온다', _sharedVerseIn(out).hi2, '둘째');
  // 없으면 항목 자체를 안 만든다 (말씀은 예전 그대로 — 쓸데없는 키가 안 붙는다)
  sc.eq('없으면 안 붙는다',
        'hi2' in _sharedVerseOut({ ref:'요한복음 3:16', krText:'말씀', hi:'강조' }), false);
}

// ═══ 5. 시트 동기화 — 나중에 적은 둘째 문구가 반영된다 ═══
console.log('\n시나리오 5 — 시트를 고치면 따라온다');
{
  const coll = { id:'c1', name:'명제집', verses:[] };
  const one = { kind:'prop', pid:'P0001', cat:'주일예배', topic:'은혜',
                krText:'명제', ref:'로마서 5:8', refs:['로마서 5:8'],
                tags:[], hi:'첫째', hi2:'', books:['로마서'], d:'2026-09-01' };
  _syncSheetVersesIntoColl(coll, [one], { kind:'share' });
  sc.eq('처음엔 하나뿐', coll.verses[0].hi2, undefined);

  // 시트에 둘째 문구를 나중에 적었다
  const two = Object.assign({}, one, { hi2:'둘째' });
  const r2 = _syncSheetVersesIntoColl(coll, [two], { kind:'share' });
  sc.eq('둘째가 붙는다', coll.verses[0].hi2, '둘째');
  sc.eq('바뀐 것으로 센다', r2.updated, 1);

  // ⚠️ 시트에서 지웠으면 앱에서도 지워야 한다. 남겨 두면 그 명제만 계속
  //    둘 중 하나가 무작위로 떠서 "지웠는데 아직 나온다" 가 된다.
  const r3 = _syncSheetVersesIntoColl(coll, [one], { kind:'share' });
  sc.eq('시트에서 지우면 함께 지워진다', 'hi2' in coll.verses[0], false);
  sc.eq('그것도 바뀐 것이다', r3.updated, 1);

  // 아무것도 안 바뀌면 조용하다
  const r4 = _syncSheetVersesIntoColl(coll, [one], { kind:'share' });
  sc.eq('그대로면 안 센다', r4.updated, 0);
  sc.eq('구절은 하나뿐이다', coll.verses.length, 1);
}

// ═══ 6. 조립하는 자리 두 곳을 지난다 ═══
console.log('\n시나리오 6 — 화면까지 오는 길에 안 빠진다');
{
  // ⚠️ 구절은 **정해진 항목만 골라 새로 조립**되는 자리가 둘 있다.
  //    거기 안 넣으면 저장은 되는데 화면에서만 조용히 사라진다
  //    (hi 가 실제로 그렇게 막혔다 — 코드 주석에 그 사고가 적혀 있다).
  const asm = (SRC_DEV.match(/tags:\s*[cv]\.tags\|\|\[\],\s*hi:\s*[cv]\.hi\|\|''/g) || []);
  sc.eq('조립하는 자리는 둘', asm.length, 2);
  const withHi2 = (SRC_DEV.match(/hi:\s*[cv]\.hi\|\|'',\s*hi2:\s*[cv]\.hi2\|\|''/g) || []);
  sc.eq('둘 다 hi2 를 함께 담는다', withHi2.length, 2);
}

// ═══ 7. 뽑는 자리는 한 곳뿐이다 ═══
console.log('\n시나리오 7 — 문구는 넘길 때 한 번만 뽑는다');
{
  // ⚠️ 그리는 쪽에서 뽑으면 글자 크기를 다시 잡을 때마다 문구가 바뀌어
  //    눈앞에서 글이 갈아엎어진다 (자리·기울기를 _vfRollProp 에서 뽑는 것과
  //    같은 까닭). 뽑는 자리는 _vfRollProp 하나여야 한다.
  // (주석의 '_vfPropHiIdx = …' 설명줄에 걸리지 않게 붙여쓴 꼴만 센다 — 이 앱의 코드 style)
  const rolls = (SRC_DEV.match(/_vfPropHiIdx=/g) || []).length;
  sc.eq('_vfPropHiIdx 에 값을 넣는 곳은 선언 하나 + 뽑기 하나', rolls, 2);
  sc.eq('뽑기는 _vfRollProp 안에 있다',
        /function _vfRollProp\(\)\{[\s\S]{0,400}?_vfPropHiIdx=Math\.floor/.test(SRC_DEV), true);
}

sc.done();
