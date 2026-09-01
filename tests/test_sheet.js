// 구글 시트 동기화 — 2026-08-02 대량 삭제 사고 재현 포함
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global._calKey = () => '2026-08-02';
global.z = n => String(n).padStart(2, '0');
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm('));
eval(slice('function _parseCsv(', '// \ud30c\uc77c/\uc9c1\uc811\uc6a9 \uc784\ud3ec\ud2b8'))
global.getVerseCollections = () => COLLS;
eval(slice('function _sheetUrlForVerse(v){', '\n// 대분류 탭'));;

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

// ═══ '그 셀로 열기' — 실제 탭(gid)으로 정확히 이동한다 (v26-0813-8) ═══
// ⚠️ HB 신고 — 롱터치로 시트를 열면 데이터가 없는 900행 근처 같은 엉뚱한
//    자리가 열렸다. 원인은 hit.gid 를 진짜 구글 시트 탭 번호로 착각해 URL 에
//    그대로 박아 넣은 것 — hit.gid 는 우리 앱이 매긴 내부 식별자(g.id)일 뿐이다.
//    구글 시트가 그 값을 못 알아듣고 기본 탭(gid=0)으로 떨어져, 그 탭의
//    아무 자리가 열렸다.
console.log('\n시나리오 — 시트 셀 열기가 실제 탭 번호를 쓴다');
{
  // 시트 하나, gid=987654321 인 탭. 항목의 hit.gid 는 내부 id 'g1'.
  COLLS = [{
    id: 'c1', name: 'TLC',
    google: [{ id: 'g1', url: 'https://docs.google.com/spreadsheets/d/ABC123/edit#gid=987654321' }],
    verses: [{ cat: '주일예배', topic: '주제1', krText: '본문1', ref: '마태복음 1:1',
               tags: [], src: 'google', gid: 'g1', row: 42 }]
  }];
  const r = _sheetUrlForVerse({ ref: '마태복음 1:1', cat: '주일예배', topic: '주제1' });
  sc.eq('링크를 찾는다', !!r, true);
  sc.eq('내부 id 가 아니라 실제 탭 번호를 쓴다', r.url.includes('#gid=987654321'), true);
  sc.eq('내부 id(g1)를 그대로 박지 않는다', r.url.includes('gid=g1'), false);
  sc.eq('행 범위도 붙는다', r.url.includes('&range=A42:G42'), true);

  // 시트 여러 개를 붙여 둔 모음 — hit.gid(내부 id)로 어느 링크인지 정확히 가린다
  COLLS = [{
    id: 'c2', name: '두 시트',
    google: [
      { id: 'gA', url: 'https://docs.google.com/spreadsheets/d/AAA/edit#gid=111' },
      { id: 'gB', url: 'https://docs.google.com/spreadsheets/d/BBB/edit#gid=222' }
    ],
    verses: [
      { cat: '', topic: '', krText: 'x', ref: '요한복음 1:1', tags: [], src: 'google', gid: 'gB', row: 5 }
    ]
  }];
  const r2 = _sheetUrlForVerse({ ref: '요한복음 1:1' });
  sc.eq('두 번째 시트(BBB)를 정확히 고른다', r2.url.includes('/d/BBB/'), true);
  sc.eq('그 시트의 실제 탭 번호(222)를 쓴다', r2.url.includes('#gid=222'), true);
}

console.log('\n시나리오 — 여러 시트를 한꺼번에 받는다 (v26-0901-3, HB)');
{
  const { SRC } = require('./_load');
  const fn = SRC.slice(SRC.indexOf('async function verseSyncAllNow(){'),
                       SRC.indexOf('async function runVerseSheetAutoSync('));
  // HB — "불러오기가 너무 오래 걸린다." 기다림의 거의 전부가 구글의 응답이었고,
  //   예전에는 시트를 하나씩 차례로 기다렸다 (시트 셋이면 기다림도 세 배).
  sc.eq('한꺼번에 받는다', fn.includes('const fetched=await Promise.all(jobs.map(j=>'), true);
  sc.eq('차례로 기다리던 옛 길은 없앴다', fn.includes('const res=await _fetchSheetCsv(g.url);'), false);
  // ⚠️⚠️ 받기만 함께 하고 **반영은 예전 그대로 차례대로** 한다.
  //    같은 모음에 시트가 둘일 때 순서가 뒤바뀌면, 나중 시트가 앞 시트의
  //    구절을 "시트에서 사라진 것"으로 보고 휴지통에 넣는다.
  sc.eq('반영은 여전히 차례대로', /for\(const c of colls\)\{\s*\n\s*for\(const g of \(c\.google\|\|\[\]\)\)\{/.test(fn), true);
  sc.eq('반영을 Promise.all 로 돌리지 않는다',
        /Promise\.all\([^)]*_syncSheetVersesIntoColl/.test(fn), false);
  // 하나가 실패해도 나머지는 받아진다
  sc.eq('하나 실패해도 나머지는 산다', fn.includes(".then(r=>r,()=>({err:'실패'}))"), true);
}

sc.done();
