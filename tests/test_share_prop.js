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
eval(asVar(sliceDev('function _shareCopy(', '// 소유자의 모음 내용을 shared')));
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
  //    다음에 항목을 더할 때 또 빠진다. 실제로 hi·pid 가 그렇게 당했다.
  //    v26-0923-1 에 **한 곳(_shareCopy)** 으로 더 모았다 — 주고받는 두
  //    방향이 같은 함수를 지나므로 이제 어긋날 수가 없다.
  sc.eq('발행이 _sharedVerseOut 을 쓴다',
        /verses:\(coll\.verses\|\|\[\]\)\.filter\(v=>!v\.del\)\.map\(_sharedVerseOut\)/.test(SRC_DEV), true);
  sc.eq('구독 받기가 _sharedVerseIn 을 쓴다',
        /\(data\.verses\|\|\[\]\)\.map\(_sharedVerseIn\)/.test(SRC_DEV), true);
  // 두 방향이 같은 함수를 지난다
  sc.eq('내보내기는 _shareCopy 를 지난다',
        SRC_DEV.includes('function _sharedVerseOut(v){return _shareCopy(v,{});}'), true);
  sc.eq('받아오기도 _shareCopy 를 지난다',
        SRC_DEV.includes("function _sharedVerseIn(v){return _shareCopy(v,{src:'shared'});}"), true);
  // 목록이 적힌 곳은 이제 **한 곳뿐**이다
  sc.eq('목록을 적은 곳은 한 곳',
        (SRC_DEV.match(/o\.cat=v\.cat\|\|'나의 암송'/g) || []).length, 1);
  // kind 는 한 규칙에서만 나온다 — pid 가 있으면 prop
  sc.eq('kind 는 pid 에서 파생한다',
        SRC_DEV.includes("if(v.pid){o.pid=v.pid;o.kind='prop';}"), true);
}

// ═══ 8. 시트가 넣을 수 있는 것은 **전부** 발행에 실려야 한다 ═══
console.log('\n시나리오 8 — 시트의 열이 늘면 발행도 따라간다 ⚠️');
{
  // ⚠️⚠️ 이 시험이 이 파일에서 가장 값진 자리다.
  //    hi(0813-3) · pid(26-0831) · sit·q·img·yt(26-0922) — **세 번 다**
  //    "시트에 열을 더하고 발행 목록에는 안 더한" 같은 실수였다.
  //    발행자 화면은 멀쩡해서 아무도 한참 모른다.
  //    → 글자를 맞춰 보는 대신, 시트가 실제로 만들어 넣는 항목을 코드에서
  //      뽑아내 **하나하나 돌려 본다.** 새 열을 만들고 _shareCopy 에 안 넣으면
  //      그 이름을 대며 여기서 실패한다.
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _syncSheetVersesIntoColl('),
                           SRC_DEV.indexOf('function addCustomVerseFromForm('));
  // 새 구절을 만드는 자리에서 쓰는 이름을 전부 모은다
  const lit = fn.slice(fn.indexOf('const nv={'), fn.indexOf('coll.verses.push(nv)'));
  const keys = new Set();
  (lit.match(/(?:^|[{,\s])([a-zA-Z_]\w*)\s*:/g) || [])
    .forEach(m => keys.add(m.replace(/[^a-zA-Z_]/g, '')));
  (fn.match(/\bnv\.(\w+)=/g) || [])
    .forEach(m => keys.add(m.slice(3, -1)));

  // 일부러 안 보내는 것 — 발행자 사정이라 구독자에게 가면 오히려 엉킨다
  const SKIP = new Set([
    'src',   // 받는 쪽이 'shared' 로 다시 매긴다
    'gid',   // 어느 시트인지 — 보내면 구독자 시트 동기화가 남의 시트를 문다
    'row'    // 시트 몇 째 줄인지 — 구독자에게 뜻이 없다
  ]);
  const want = [...keys].filter(k => !SKIP.has(k)).sort();
  sc.eq('시트가 넣는 항목을 실제로 찾아냈다', want.length >= 12, true);

  // 모든 칸을 채운 구절 하나를 만들어 실제로 내보내 본다
  const full = { cat:'주일', topic:'믿음', krText:'명제 본문', ref:'로마서 1:17',
                 tags:['믿음'], hi:'믿음으로', hi2:'의인은', d:'2026-09-07',
                 pid:'P0001', kind:'prop', books:['로마서'], refs:['롬 1:17'],
                 sit:['낙심될 때'], q:'무엇을 믿는가?', img:'a.jpg', yt:'abc123',
                 src:'google', gid:'g1', row:2 };
  const out = _sharedVerseOut(full);
  const missing = want.filter(k => !(k in out));
  // ⚠️ 실패하면 빠진 이름이 그대로 찍힌다 — 무엇을 _shareCopy 에 더해야
  //    하는지 바로 알 수 있게.
  sc.eq('발행에서 빠진 항목이 없다', missing, []);

  // 되받는 쪽도 똑같이
  const back = _sharedVerseIn(out);
  sc.eq('구독에서 빠진 항목도 없다', want.filter(k => !(k in back)), []);
  sc.eq('구독으로 온 것임을 표시', back.src, 'shared');

  // 9월 22일에 늘어난 넷 — HB 가 물어서 찾은 것들. 이름을 박아 둔다.
  sc.eq('상황/필요가 간다', out.sit, ['낙심될 때']);
  sc.eq('묵상 질문이 간다', out.q, '무엇을 믿는가?');
  sc.eq('사진이 간다', out.img, 'a.jpg');
  sc.eq('영상이 간다', out.yt, 'abc123');

  // 일부러 안 보내는 것은 그대로 안 보낸다
  sc.eq('시트 출처는 안 보낸다', out.gid, undefined);
  sc.eq('행 번호도 안 보낸다', out.row, undefined);

  // 배열은 복사해서 보낸다 — 같은 배열을 물고 가면 한쪽 수정이 양쪽에 번진다
  out.sit.push('망가뜨리기'); out.books.push('망가뜨리기');
  sc.eq('원본 상황은 그대로', full.sit, ['낙심될 때']);
  sc.eq('원본 성경권도 그대로', full.books, ['로마서']);

  // 빈 값은 항목 자체를 안 만든다 — "원래 없다" 와 "시트에서 지웠다" 를
  // 구별해야 하기 때문이다 (말씀에는 이 칸들이 아예 없다)
  const plain = _sharedVerseOut({ ref:'요한복음 3:16', krText:'말씀' });
  sc.eq('말씀에는 상황이 안 붙는다', 'sit' in plain, false);
  sc.eq('말씀에는 질문도 안 붙는다', 'q' in plain, false);
  sc.eq('그래도 기본 칸은 늘 있다',
        ['cat','topic','krText','ref','tags','hi','d'].every(k => k in plain), true);
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

// ═══ 9. 한 모음에 구글 시트가 여럿일 때 (HB 물음 2026-09-23) ═══
console.log('\n시나리오 9 — 시트가 여럿이어도 전부 발행된다 ⚠️');
{
  // HB: "한 말씀모음 안에 구글시트가 여럿이면 첫 번째 것만 공유되는 것 아닌가?"
  // → 아니다. 시트마다 따로 담기는 것이 아니라 **한 배열(coll.verses)에 모인다.**
  //   발행은 그 배열을 통째로 싣는다. 이 시험이 그것을 못 박는다.
  const coll = { id:'c1', name:'교회 자료', shareCode:'123456',
                 google:[{url:'u1',id:'g1'},{url:'u2',id:'g2'},{url:'u3',id:'g3'}],
                 verses:[] };
  const sheet = (n, gid) => ([
    { cat:n+' 주일', topic:'', krText:n+' 명제 하나', ref:'로마서 1:17',
      tags:[], hi:'', d:'2026-09-07', pid:gid+'-P1' },
    { cat:n+' 주일', topic:'', krText:n+' 명제 둘', ref:'로마서 1:18',
      tags:[], hi:'', d:'2026-09-07', pid:gid+'-P2' }
  ]);
  _syncSheetVersesIntoColl(coll, sheet('첫째','g1'), { kind:'google', gid:'g1' });
  _syncSheetVersesIntoColl(coll, sheet('둘째','g2'), { kind:'google', gid:'g2' });
  _syncSheetVersesIntoColl(coll, sheet('셋째','g3'), { kind:'google', gid:'g3' });

  // ⚠️ 나중에 받은 시트가 앞선 시트의 구절을 **지우지 않는다.**
  //    (지우는 자리는 gid 로 갈라 "이 시트가 관리하던 것" 만 본다)
  sc.eq('세 시트가 한 배열에 모인다', coll.verses.length, 6);
  sc.eq('시트마다 출처가 남는다',
        [...new Set(coll.verses.map(v => v.gid))].sort(), ['g1','g2','g3']);

  // 사람이 직접 넣은 구절도 섞여 있을 수 있다
  coll.verses.push({ cat:'나의 암송', topic:'', krText:'손으로 넣은 말씀',
                     ref:'요한복음 3:16', tags:[], hi:'', d:'2026-09-01', src:'direct' });

  const out = (coll.verses || []).filter(v => !v.del).map(_sharedVerseOut);
  sc.eq('일곱 개가 전부 발행된다', out.length, 7);
  sc.eq('세 시트 것이 다 간다',
        out.map(v => v.krText).filter(t => /명제/.test(t)).sort(),
        ['둘째 명제 둘','둘째 명제 하나','셋째 명제 둘','셋째 명제 하나',
         '첫째 명제 둘','첫째 명제 하나']);
  sc.eq('손으로 넣은 것도 간다',
        out.some(v => v.krText === '손으로 넣은 말씀'), true);
  // 어느 시트에서 왔는지는 보내지 않는다 (구독자 시트 동기화가 엉킨다)
  sc.eq('시트 출처는 안 간다', out.every(v => v.gid === undefined), true);

  // 구독자가 받아 보면 일곱 개가 그대로 선다
  const mine = { id:'m1', name:'교회 자료', importCode:'123456', verses:[] };
  const r = _syncSheetVersesIntoColl(mine, out.map(_sharedVerseIn), { kind:'share' });
  sc.eq('구독자에게 일곱 개가 들어온다', r.added, 7);
  sc.eq('명제 여섯이 살아 있다', mine.verses.filter(v => v.kind === 'prop').length, 6);

  // 교회가 한 시트만 다시 받아도 다른 시트 것이 안 사라진다
  const before = coll.verses.length;
  _syncSheetVersesIntoColl(coll, sheet('첫째','g1'), { kind:'google', gid:'g1' });
  sc.eq('한 시트를 다시 받아도 그대로', coll.verses.filter(v => !v.del).length, before);
}

sc.done();
