// 발행·구독에서 명제집이 살아 가는가 (v26-0831-2)
//
// 명제집은 따로 저장되지 않는다. 말씀 모음 구절에 `pid`(명제 ID) 와
// `kind:'prop'` 이라는 표시로 섞여 들어온다. 그런데 발행(_publishSharedColl)
// 과 구독 받기(doSubscribe) 의 항목 목록에 pid 가 빠져 있어서, 교회가
// 명제집을 발행해도 성도에게는 그냥 평범한 구절로 도착했다.
//
// 증상은 "표시가 사라진다" 정도가 아니다. pid 가 없으면
//   ① 장절 칸이 빈 명제는 통째로 버려지고
//      (_syncSheetVersesIntoColl 의 `if(!it.krText||(!it.ref&&!it.pid))return;`)
//   ② 장절·설교·주제가 같은 명제들이 _verseIdentity 에서 한 자리로 뭉쳐
//      서로 덮어쓴다 (실제 시트에서 275개가 87자리로 뭉친다)
// → 구독자에게는 명제집이 거의 통째로 사라진다.
//
// ⚠️ 진짜 원인은 **항목 목록이 세 곳에 흩어져 있다**는 것이다. 코드 주석이
//    "구절에 항목을 더하면 두 곳을 같이 고칠 것" 이라고 사람에게 부탁하고
//    있었는데, 사람은 빠뜨린다 (강조 문구 hi 가 0813-3 에 똑같이 당했다).
//    → 목록을 함수 하나(_sharedVerseOut/_sharedVerseIn)로 모으고,
//      이 시험이 세 경로가 모두 그 함수를 지나는지 지킨다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

// ⚠️ 직접 eval 안의 const/let 은 그 eval 안에만 산다 (var 는 밖으로 나온다).
const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

// 진짜 코드를 떠온다
eval(asVar(sliceDev('function _verseIdentity(', 'function _gSrcId(')));
eval(asVar(sliceDev('function _sharedVerseOut(', '// 소유자의 모음 내용을 shared')));
eval(asVar(sliceDev('function _syncSheetVersesIntoColl(', 'function addCustomVerseFromForm(')));

function _calKey(){ return '2026-08-31'; }
function todayKey(){ return '2026-08-31'; }

// 교회가 시트에서 받아 둔 모음 — 명제 셋이 장절·설교·주제가 모두 같다.
// (실제 명제집이 이렇게 생겼다: 한 설교에서 여러 명제가 나온다)
const CHURCH = () => ({
  id: 'c1', name: 'TLC 명제집', shareCode: '123456',
  google: [{ url: 'https://sheet', id: 'g1' }],
  verses: [
    { cat:'8월 3일 주일', topic:'믿음', krText:'명제 하나', ref:'로마서 1:17',
      tags:['믿음'], hi:'믿음으로', d:'2026-08-03', src:'google', gid:'g1', row:2,
      pid:'P0001', kind:'prop' },
    { cat:'8월 3일 주일', topic:'믿음', krText:'명제 둘', ref:'로마서 1:17',
      tags:['믿음'], hi:'', d:'2026-08-03', src:'google', gid:'g1', row:3,
      pid:'P0002', kind:'prop' },
    { cat:'8월 3일 주일', topic:'믿음', krText:'장절 없는 명제', ref:'',
      tags:[], hi:'', d:'2026-08-03', src:'google', gid:'g1', row:4,
      pid:'P0003', kind:'prop' },
    { cat:'나의 암송', topic:'', krText:'평범한 구절', ref:'요한복음 3:16',
      tags:['사랑'], hi:'이처럼', d:'2026-08-01', src:'google', gid:'g1', row:5 },
    { cat:'나의 암송', topic:'', krText:'지운 것', ref:'마태복음 1:1',
      tags:[], hi:'', d:'2026-08-01', src:'google', gid:'g1', row:6, del:'simple' }
  ]
});

console.log('시나리오 1 — 발행 문서에 명제 ID 가 담긴다');
{
  const out = (CHURCH().verses||[]).filter(v=>!v.del).map(_sharedVerseOut);
  sc.eq('지운 구절은 빠진다', out.length, 4);
  sc.eq('명제 ID 가 담긴다', out.map(v=>v.pid||''), ['P0001','P0002','P0003','']);
  sc.eq('강조 문구도 그대로', out[0].hi, '믿음으로');
  sc.eq('장절 없는 명제도 담긴다', out[2].krText, '장절 없는 명제');

  // ⚠️ 발행자 사정(어느 시트의 몇 째 줄)은 구독자에게 보내지 않는다.
  //    보내면 구독자 쪽 시트 동기화가 남의 시트 id 를 물고 엉킨다.
  sc.eq('시트 출처는 안 보낸다', out.every(v=>v.gid===undefined), true);
  sc.eq('시트 행번호도 안 보낸다', out.every(v=>v.row===undefined), true);
  sc.eq('삭제표시도 안 보낸다', out.every(v=>v.del===undefined), true);
}

console.log('\n시나리오 2 — 구독 받기가 명제를 살린다');
{
  const published = (CHURCH().verses||[]).filter(v=>!v.del).map(_sharedVerseOut);
  const got = published.map(_sharedVerseIn);

  sc.eq('명제 ID 가 살아 온다', got.map(v=>v.pid||''), ['P0001','P0002','P0003','']);
  // kind 는 pid 에서 파생한다 — _syncSheetVersesIntoColl 과 **같은 규칙**이라
  // 두 경로가 어긋날 수 없다.
  sc.eq("명제에는 kind='prop'", got.map(v=>v.kind||''), ['prop','prop','prop','']);
  sc.eq('구독으로 온 것임을 표시', got.every(v=>v.src==='shared'), true);
  sc.eq('평범한 구절은 그대로', got[3].krText, '평범한 구절');
  sc.eq('강조 문구도 온다', got[0].hi, '믿음으로');
}

console.log('\n시나리오 3 — 명제가 서로 덮어쓰지 않는다');
{
  // ⚠️ 이것이 진짜 손실이었다. pid 가 없으면 장절·설교·주제가 같은 명제들이
  //    _verseIdentity 에서 한 자리로 뭉쳐 서로 덮어쓴다.
  const a = _verseIdentity('로마서 1:17','8월 3일 주일','믿음','P0001');
  const b = _verseIdentity('로마서 1:17','8월 3일 주일','믿음','P0002');
  sc.eq('명제 ID 가 다르면 다른 자리', a !== b, true);
  const x = _verseIdentity('로마서 1:17','8월 3일 주일','믿음','');
  const y = _verseIdentity('로마서 1:17','8월 3일 주일','믿음','');
  sc.eq('명제 ID 가 없으면 한 자리로 뭉친다(그래서 필요하다)', x === y, true);
}

console.log('\n시나리오 4 — 매일 갱신에서도 명제가 온전히 온다');
{
  // 교회가 발행한 문서를 성도가 매일 받아가는 길
  // (verseSyncAllNow → _syncSheetVersesIntoColl(c, d.verses, {kind:'share'}))
  const published = (CHURCH().verses||[]).filter(v=>!v.del).map(_sharedVerseOut);
  const mine = { id:'m1', name:'TLC 명제집', importCode:'123456', verses:[] };
  const r = _syncSheetVersesIntoColl(mine, published, { kind:'share' });

  sc.eq('네 구절이 다 들어온다', r.added, 4);
  sc.eq('명제 셋이 살아 있다', mine.verses.filter(v=>v.kind==='prop').length, 3);
  sc.eq('장절 없는 명제도 버려지지 않는다',
        mine.verses.some(v=>v.pid==='P0003'), true);
  sc.eq('명제 본문이 서로 안 덮인다',
        mine.verses.filter(v=>v.kind==='prop').map(v=>v.krText).sort(),
        ['명제 둘','명제 하나','장절 없는 명제']);

  // 다시 받아도 늘어나지 않는다 (명제 ID 로 같은 것을 알아본다)
  const r2 = _syncSheetVersesIntoColl(mine, published, { kind:'share' });
  sc.eq('두 번째 갱신은 새로 안 늘린다', r2.added, 0);
  sc.eq('구절 수 그대로', mine.verses.length, 4);

  // 교회가 명제 본문을 고치면 따라온다
  const fixed = published.map(v => v.pid==='P0002' ? {...v, krText:'명제 둘(고침)'} : v);
  const r3 = _syncSheetVersesIntoColl(mine, fixed, { kind:'share' });
  sc.eq('고친 명제가 따라온다', r3.updated, 1);
  sc.eq('고친 본문이 반영된다',
        mine.verses.find(v=>v.pid==='P0002').krText, '명제 둘(고침)');
}

console.log('\n시나리오 5 — 항목 목록은 한 곳에서만 정한다');
{
  // ⚠️ 세 경로(발행 · 구독 받기 · 매일 갱신)가 각자 목록을 적고 있으면
  //    다음에 항목을 더할 때 또 빠진다. 실제로 hi 가 그렇게 당했다.
  sc.eq('발행이 _sharedVerseOut 을 쓴다',
        /verses:\(coll\.verses\|\|\[\]\)\.filter\(v=>!v\.del\)\.map\(_sharedVerseOut\)/.test(SRC_DEV), true);
  sc.eq('구독 받기가 _sharedVerseIn 을 쓴다',
        /const verses=\(data\.verses\|\|\[\]\)\.map\(_sharedVerseIn\)/.test(SRC_DEV), true);
  // 옛 방식(각자 손으로 적은 목록)이 남아 있으면 안 된다.
  // 항목 목록은 이제 두 함수 안에만 있어야 한다 — 그 둘이 곧 이 두 번이다.
  sc.eq('항목 목록이 적힌 곳은 두 곳뿐',
        (SRC_DEV.match(/cat:v\.cat\|\|'나의 암송',topic:v\.topic\|\|''/g)||[]).length, 2);
  const outFn = SRC_DEV.slice(SRC_DEV.indexOf('function _sharedVerseOut('),
                              SRC_DEV.indexOf('// 소유자의 모음 내용을 shared'));
  sc.eq('그 두 곳이 _sharedVerseOut · _sharedVerseIn 이다',
        (outFn.match(/cat:v\.cat\|\|'나의 암송',topic:v\.topic\|\|''/g)||[]).length, 2);
  // kind 는 한 규칙에서만 나온다 — pid 가 있으면 prop
  sc.eq('kind 는 pid 에서 파생한다',
        SRC_DEV.includes("if(v.pid){o.pid=v.pid;o.kind='prop';}"), true);
}

// ═══ 6. 이미 구독 중인 사람은 어떻게 되는가 (넘어가는 길) ═══
console.log('\n시나리오 6 — 이미 구독 중인 성도의 모음');
{
  // 지금까지 pid 없이 받아 온 사람의 모음은 명제가 **뭉개져** 있다.
  // (장절·설교·주제가 같은 명제들이 한 자리로 뭉쳐 마지막 것만 남았다)
  const mine = { id:'m1', name:'TLC 명제집', importCode:'123456', verses:[
    { cat:'8월 3일 주일', topic:'믿음', krText:'명제 둘', ref:'로마서 1:17',
      tags:['믿음'], hi:'', d:'2026-08-03', src:'shared' },   // pid 없음 — 뭉개진 것
    { cat:'나의 암송', topic:'', krText:'평범한 구절', ref:'요한복음 3:16',
      tags:['사랑'], hi:'이처럼', d:'2026-08-01', src:'shared' }
  ]};
  const published = (CHURCH().verses||[]).filter(v=>!v.del).map(_sharedVerseOut);
  const r = _syncSheetVersesIntoColl(mine, published, { kind:'share' });

  // 명제 셋이 제대로 들어온다
  sc.eq('명제 셋이 새로 들어온다',
        mine.verses.filter(v=>v.pid).map(v=>v.pid).sort(), ['P0001','P0002','P0003']);
  // 평범한 구절은 장절·설교·주제로 알아보므로 새로 늘지 않는다
  sc.eq('평범한 구절은 이어받는다',
        mine.verses.filter(v=>v.krText==='평범한 구절').length, 1);

  // ⚠️ 뭉개져 있던 옛 항목은 **지워지지 않는다.** 규모 상한(30%·5개)에 걸려
  //    정리가 막히기 때문이다. 잠깐 겹쳐 보이지만 **잃는 것은 없다** —
  //    사람이 모음 편집창에서 지우면 된다. (CLAUDE.md: 받아온 데이터로
  //    지우는 동작에는 반드시 규모 상한)
  const stale = mine.verses.filter(v=>!v.pid && v.krText==='명제 둘');
  sc.eq('옛 항목이 남아 잠깐 겹친다', stale.length, 1);
  sc.eq('옛 항목이 조용히 사라지지는 않는다', stale[0].del, undefined);
  sc.eq('아무것도 잃지 않았다', r.removed, 0);
}

// ═══ 7. 성경권도 구독자에게 간다 (v26-0831-7) ═══
console.log('\n시나리오 7 — 성경권(여러 권)이 살아 간다');
{
  // ⚠️ 한 명제가 여러 권에 걸린다. 안 실으면 구독자 쪽에서 '성경별'이 어긋난다
  //    (pid 가 그랬던 것과 똑같은 종류의 누락이다).
  const v = { cat:'주일예배', topic:'은혜', krText:'명제', ref:'롬 5:8; 엡 2:8-9',
              tags:[], hi:'대표', d:'2026-08-10', pid:'P0001',
              books:['로마서','에베소서'] };
  const out = _sharedVerseOut(v);
  sc.eq('발행에 실린다', out.books, ['로마서','에베소서']);
  sc.eq('구독에 온다', _sharedVerseIn(out).books, ['로마서','에베소서']);
  // 원본을 건드리지 않는다 (같은 배열을 물고 가면 한쪽 수정이 양쪽에 번진다)
  out.books.push('망가뜨리기');
  sc.eq('원본은 그대로', v.books, ['로마서','에베소서']);
  // 없으면 항목 자체를 안 만든다 (말씀은 예전 그대로)
  sc.eq('말씀에는 안 붙는다',
        'books' in _sharedVerseOut({ref:'요한복음 3:16',krText:'말씀'}), false);

  // 매일 갱신에서도 이어받는다
  const mine = { id:'m', name:'명제집', verses:[] };
  _syncSheetVersesIntoColl(mine, [out], { kind:'share' });
  sc.eq('갱신에서도 이어받는다',
        mine.verses[0].books, ['로마서','에베소서','망가뜨리기']);
}

sc.done();
