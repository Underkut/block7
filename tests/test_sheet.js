// 구글 시트 동기화 — 2026-08-02 대량 삭제 사고 재현 포함
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global._calKey = () => '2026-08-02';
global.z = n => String(n).padStart(2, '0');
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm('));
eval(slice('function _parseCsv(', '// \ud30c\uc77c/\uc9c1\uc811\uc6a9 \uc784\ud3ec\ud2b8'));

// 정상 시트 흉내 — 구글 시트에서 온 구절 n개를 가진 말씀 모음
function makeColl(n){
  const verses=[];
  for(let i=1;i<=n;i++)verses.push({cat:'주일예배',topic:'주제'+(i%7),krText:'본문'+i,
    ref:`마태복음 ${i}:1`,tags:[],src:'google',gid:'g1',d:'2026-06-01'});
  return{id:'c1',name:'TLC',google:[{id:'g1',url:'x'}],verses};
}
function sheetItems(n){
  const out=[];
  for(let i=1;i<=n;i++)out.push({cat:'주일예배',topic:'주제'+(i%7),krText:'본문'+i,
    ref:`마태복음 ${i}:1`,tags:[],d:'2026-06-01'});
  return out;
}

// ═══ 1. 사고 재현: gviz가 헤더를 뭉쳐 5행만 내려준 상황 ═══
console.log('시나리오 1 — 시트를 5행만 읽어왔을 때 (이번 사고)');
{
  const coll=makeColl(145);
  const partial=[
    {cat:'성찬예식',topic:'성찬과 제자도',krText:'그가 찔림은',ref:'이사야 53:5',tags:[],d:'2026-08-02'},
    {cat:'성찬예식',topic:'성찬과 제자도',krText:'너희가 이 떡을',ref:'고린도전서 11:26',tags:[],d:'2026-08-02'},
    {cat:'성찬예식',topic:'성찬과 제자도',krText:'사람이 자기를',ref:'고린도전서 11:28',tags:[],d:'2026-08-02'},
    {cat:'성찬예식',topic:'성찬과 제자도',krText:'그러나 더욱',ref:'야고보서 4:6',tags:[],d:'2026-08-02'},
    {cat:'성찬예식',topic:'성찬과 제자도',krText:'율법이 들어온',ref:'로마서 5:20',tags:[],d:'2026-08-02'},
  ];
  const r=_syncSheetVersesIntoColl(coll,partial,{kind:'google',gid:'g1'});
  sc.eq('휴지통으로 보낸 것 0개',r.removed,0);
  sc.eq('보류로 잡힌 것 145개',r.blocked,145);
  sc.eq('기존 145개 모두 살아 있음',coll.verses.filter(v=>v.src==='google'&&!v.del).length,150);
  sc.eq('새 5개는 정상 추가',r.added,5);
}

// ═══ 2. 정상 삭제는 여전히 동작 ═══
console.log('시나리오 2 — 시트에서 실제로 몇 개 지웠을 때는 정상 정리');
{
  const coll=makeColl(145);
  const r=_syncSheetVersesIntoColl(coll,sheetItems(142),{kind:'google',gid:'g1'});
  sc.eq('3개만 휴지통으로',r.removed,3);
  sc.eq('보류 없음',r.blocked,0);
}

// ═══ 3. 사용자가 승인하면(force) 대량 정리도 진행 ═══
console.log('시나리오 3 — 확인창에서 승인하면 진행');
{
  const coll=makeColl(145);
  const r=_syncSheetVersesIntoColl(coll,sheetItems(5),{kind:'google',gid:'g1',force:true});
  sc.eq('승인 시 140개 정리',r.removed,140);
}

// ═══ 4. 고쳐진 뒤 재동기화하면 휴지통의 145개가 자동 복원 ═══
console.log('시나리오 4 — 시트를 제대로 읽으면 휴지통에서 자동 복원');
{
  const coll=makeColl(145);
  coll.verses.forEach(v=>{v.del='simple';});          // 사고로 전부 휴지통 상태
  const r=_syncSheetVersesIntoColl(coll,sheetItems(145),{kind:'google',gid:'g1'});
  sc.eq('145개 되살아남',r.restored,145);
  sc.eq('휴지통에 남은 것 없음',coll.verses.filter(v=>v.del).length,0);
  sc.eq('중복 추가 없음',r.added,0);
}

// ═══ 5. 유령 항목(머리글이 구절로 들어온 것) 자동 정리 ═══
console.log('시나리오 5 — 유령 구절 정리');
{
  const coll=makeColl(3);
  coll.verses.push({cat:'카테고리\n주일예배\n주일예배',topic:'',krText:'본문\n의를 위하여',
                    ref:'장절\n마태복음 5:10\n마태복음 5:12',tags:[],src:'google',gid:'g1'});
  sc.eq('사고 직후 유령 포함 4개',coll.verses.length,4);
  _syncSheetVersesIntoColl(coll,sheetItems(3),{kind:'google',gid:'g1'});
  sc.eq('유령 제거됨',coll.verses.length,3);
  sc.eq('장절 판정 — 유령',_looksLikeRef('장절\n마태복음 5:10'),false);
  sc.eq('장절 판정 — 정상',_looksLikeRef('사무엘상 7:12'),true);
}

// ═══ 6. 뭉친 응답 자체를 거부 ═══
console.log('시나리오 6 — 뭉친 시트 응답 거부');
{
  const bad=[['카테고리\n주일예배\n주일예배','주제\n의를 위한 고난','본문\n의를 위하여',
              '장절\n마태복음 5:10\n마태복음 5:12','','' ],
             ['성찬예식','성찬과 제자도','그가 찔림은','이사야 53:5','','2026-08-02']];
  sc.eq('건전성 검사 실패',_sheetRowsSane(bad).ok,false);
  const good=[['카테고리','주제','본문','장절','태그','날짜'],
              ['성찬예식','성찬과 제자도','그가 찔림은','이사야 53:5','보혈','2026-08-02']];
  sc.eq('정상 시트는 통과',_sheetRowsSane(good).ok,true);
  sc.eq('헤더 건너뛰고 1구절',_rowsToItems(good).length,1);
  sc.eq('헤더가 구절로 안 들어옴',_rowsToItems(good)[0].ref,'이사야 53:5');
}

// ═══ 7. CSV 파서 — 실제 시트의 까다로운 셀들 ═══
console.log('시나리오 7 — CSV 파싱');
{
  const csv=['카테고리,주제,본문,장절,태그,날짜',
    '주일예배,의를 위한 고난,의를 위하여 박해를 받은 자는,마태복음 5:10,"팔복, 박해, 복",2026-06-14',
    '특별,새성전 이전 감사,사무엘이 돌을 취하여,사무엘상 7:12,"도움, 신실, 에벤에셀",2026-07-11'
  ].join('\n');
  const rows=_parseCsv(csv);
  sc.eq('3행 파싱',rows.length,3);
  sc.eq('따옴표 안 쉼표 유지',rows[1][4],'팔복, 박해, 복');
  const items=_rowsToItems(rows);
  sc.eq('헤더 제외 2구절',items.length,2);
  sc.eq('태그 분리',items[0].tags,['팔복','박해','복']);
  sc.eq('날짜 정규화',items[1].d,'2026-07-11');
}

sc.done();
