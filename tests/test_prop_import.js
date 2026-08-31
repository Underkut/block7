// 명제집(설교 명제 DB) 시트 불러오기.
//
// ⚠️ 이 시트는 말씀 모음 시트와 세 가지가 근본적으로 다르다. 셋 다 그대로 두면
//    명제가 대량으로 사라진다 — 실제 시트(275개)로 세어 확인한 수치를 함께 적는다.
//   ① 한 설교에서 명제가 여럿 나온다 → 장절·설교 제목·핵심 주제가 셋 다 같다.
//      그 셋으로 구별하면 275개가 87자리로 뭉쳐 226개가 서로 덮어쓴다.
//   ② 장절 칸에 참조를 여러 개 적어 40자를 넘긴다 (275개 중 130개).
//      _looksLikeRef 로 거르면 그 130개가 사라진다.
//   ③ 열이 30개가 넘고 이름도 다르며, 중간에 새 열이 들어온다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
global.showToast = () => {};
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('// ══ 명제집(설교 명제 DB) 시트 읽기', 'function _rowsToItems'));
eval(slice('function _verseIdentity(', '// 구글 시트 소스마다 고정 id'));
eval(slice('function _syncSheetVersesIntoColl(', 'function addCustomVerseFromForm'));
function z(n){return String(n).padStart(2,'0');}
eval(slice('function _parseVDate(', 'function _looksLikeRef(').replace(/^const /gm,'var '));
// 성경권 뽑기·펴기는 이 시험의 관심사가 아니다 — 최소한만 흉내낸다
const _BOOK_ABBR={'마':'마태복음','막':'마가복음','눅':'누가복음','요':'요한복음',
  '롬':'로마서','엡':'에베소서','창':'창세기','갈':'갈라디아서','빌':'빌립보서'};
function _bookOfRef(ref){
  const m=String(ref||'').trim().match(/^([가-힣0-9\s]+?)\s*\d/);
  if(!m)return '';
  return _bookNorm(m[1].trim());
}
function _bookNorm(n){const t=String(n||'').trim();return _BOOK_ABBR[t]||t;}
function _calKey(){return '2026-08-30';}

// 실제 명제 DB 의 열 순서 (2026-08-30 시트 그대로, '영상 링크'가 들어온 뒤)
const HEAD=['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','장절/단락',
 '명제','대표 문구','분류','대표 명제','핵심 주제','주제 태그','조직신학','성경신학/구속사',
 '성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치','한 줄 요약',
 '원문 상태','관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
function row(o){
  const r=new Array(HEAD.length).fill('');
  for(const k in o)r[HEAD.indexOf(k)]=o[k];
  return r;
}
const P=(id,text,extra={})=>row(Object.assign({
  '명제 ID':id,'날짜':'2026-06-21','카테고리':'주일예배',
  '설교 제목':'언덕 위의 도시: 소금과 빛이 되다',
  '장절/단락':'마 5:13-16','명제':text,'대표 문구':text.slice(0,6),
  '핵심 주제':'제자의 정체성','주제 태그':'소금과 빛, 제자도','데이터 상태':'활성'},extra));

// ═══ 1. 명제 시트를 알아보는가 ═══
console.log('시나리오 1 — 명제 시트 알아보기');
{
  sc.eq('명제 DB 머리글을 알아본다',_isPropSheet(HEAD),true);
  sc.eq('말씀 모음 머리글은 아니다',
    _isPropSheet(['카테고리','주제','본문','장절','태그','날짜','강조 문구']),false);
  const items=_propRowsToItems([HEAD,P('P0001','소금과 빛의 제자도는 본질이다')]);
  sc.eq('한 줄이 읽힌다',items.length,1);
  const it=items[0];
  sc.eq('명제 번호',it.pid,'P0001');
  sc.eq('종류 표시',it.kind,'prop');
  // ⚠️ HB 정정 (26-0831): 카테고리 → 대분류(예배), 설교 제목 → 소주제(제목).
  //    예전엔 설교 제목이 대분류, 핵심 주제가 소주제였다. 되돌리지 말 것.
  sc.eq('카테고리가 대분류로',it.cat,'주일예배');
  sc.eq('설교 제목이 소주제로',it.topic,'언덕 위의 도시: 소금과 빛이 되다');
  sc.eq('핵심 주제는 이제 안 쓴다',
        Object.values(it).indexOf('제자의 정체성'),-1);
  sc.eq('대표 문구가 강조 문구 자리로',it.hi,'소금과 빛의');
  sc.eq('태그는 쉼표로 나뉜다',it.tags,['소금과 빛','제자도']);
}

// ═══ 2. ⚠️ 같은 설교의 명제들이 서로 덮어쓰지 않는가 (가장 중요) ═══
console.log('시나리오 2 — 한 설교의 명제 아홉 개가 다 살아남는다');
{
  const rows=[HEAD];
  for(let i=1;i<=9;i++)rows.push(P('P000'+i,'명제 본문 '+i));
  const items=_propRowsToItems(rows);
  sc.eq('아홉 줄 다 읽힘',items.length,9);
  // 장절·설교 제목·핵심 주제가 아홉 개 모두 같다 — 예전 방식이면 한 자리로 뭉친다
  const oldKeys=new Set(items.map(i=>[i.ref,i.cat,i.topic].join('|')));
  sc.eq('옛 기준으로는 한 자리로 뭉친다',oldKeys.size,1);
  const newKeys=new Set(items.map(i=>_verseIdentity(i.ref,i.cat,i.topic,i.pid)));
  sc.eq('명제 번호로는 아홉 자리로 갈린다',newKeys.size,9);

  const coll={verses:[],google:[{id:'g1'}]};
  const r=_syncSheetVersesIntoColl(coll,items,{kind:'google',gid:'g1'});
  sc.eq('아홉 개가 다 추가된다',r.added,9);
  sc.eq('모음에 아홉 개가 있다',coll.verses.length,9);
  sc.eq('본문이 서로 다르다',new Set(coll.verses.map(v=>v.krText)).size,9);
}

// ═══ 3. ⚠️ 참조가 긴 명제가 지워지지 않는가 ═══
console.log('시나리오 3 — 장절 칸이 40자를 넘어도 살아남는다');
{
  const longRef='마 16:18; 창 1:26-28; 갈 5:5-6; 마 6:21,24; 마 7:24';
  sc.eq('이 장절은 장절처럼 안 생겼다 (40자 초과)',_looksLikeRef(longRef),false);
  const items=_propRowsToItems([HEAD,
    P('P0112','교회는 그리스도 위에 세워진다',{'장절/단락':longRef})]);
  sc.eq('그래도 읽힌다',items.length,1);
  // v26-0831-12, HB — 장절은 이제 **갈라서** 담고 최대 세 개까지만 쓴다.
  //   (셋을 화면에 다 쓰고 하나하나 눌러 그 성경으로 걸러 보기 위해서다)
  sc.eq('세 개까지만',items[0].refs,['마 16:18','창 1:26-28','갈 5:5-6']);
  sc.eq('한 줄 표기도 함께 둔다',items[0].ref,'마 16:18 · 창 1:26-28 · 갈 5:5-6');

  const coll={verses:[],google:[{id:'g1'}]};
  _syncSheetVersesIntoColl(coll,items,{kind:'google',gid:'g1'});
  sc.eq('추가 직후에도 지워지지 않는다',coll.verses.length,1);
  sc.eq('명제 표시가 남아 있다',coll.verses[0].kind,'prop');
}

// ═══ 3-B. 설교 본문(F열) 을 쓴다 — 인용 본문(H열)이 아니라 ═══
console.log('시나리오 3-B — 전체화면 성경은 F열 설교 본문');
{
  // HB (26-0831) — "H열은 이름이 '인용 본문'으로 바뀌었다. 그것은 설교 본문에
  //   더해 설교에서 인용되는 **모든** 본문이다. 전체화면에 쓸 성경은 F열
  //   '설교 본문' 이고, 여기에는 앞으로 최대 3개까지 들어온다."
  const H2=HEAD.map(h=>h==='장절/단락'?'인용 본문':h);
  const r=new Array(H2.length).fill('');
  const put=(n,v)=>r[H2.indexOf(n)]=v;
  put('명제 ID','P0301'); put('명제','세 본문이 걸린 명제'); put('데이터 상태','활성');
  put('설교 본문','마태복음 5:13; 로마서 8:28; 에베소서 2:8-9');
  put('인용 본문','마 5:13; 롬 8:28; 엡 2:8; 창 1:1; 요 3:16; 시 23:1');
  const it=_propRowsToItems([H2,r])[0];
  sc.eq('설교 본문을 쓴다',it.refs,['마태복음 5:13','로마서 8:28','에베소서 2:8-9']);
  sc.eq('인용 본문은 안 쓴다',it.ref.includes('창'),false);
  // 성경권은 설교 본문에서 따라온다 → 성경별 필터가 세 권 모두에 걸린다
  sc.eq('세 권 모두 걸린다',it.books,['마태복음','로마서','에베소서']);

  // ⚠️ 쉼표는 한 참조 **안에서도** 쓰인다 ("요한복음 1:1,14") → 뒤가 한글일 때만 자른다
  const r2=new Array(H2.length).fill('');
  r2[H2.indexOf('명제 ID')]='P0302'; r2[H2.indexOf('명제')]='쉼표';
  r2[H2.indexOf('데이터 상태')]='활성';
  r2[H2.indexOf('설교 본문')]='요한복음 1:1,14, 로마서 8:28';
  const it2=_propRowsToItems([H2,r2])[0];
  sc.eq('참조 안의 쉼표는 안 자른다',it2.refs,['요한복음 1:1,14','로마서 8:28']);

  // 설교 본문이 비어 있으면 옛 열('장절/단락')로 물러선다 — 옛 시트가 안 깨지게
  const r3=new Array(HEAD.length).fill('');
  r3[HEAD.indexOf('명제 ID')]='P0303'; r3[HEAD.indexOf('명제')]='옛 시트';
  r3[HEAD.indexOf('데이터 상태')]='활성'; r3[HEAD.indexOf('장절/단락')]='마 5:13';
  sc.eq('옛 시트도 읽힌다',_propRowsToItems([HEAD,r3])[0].refs,['마 5:13']);
}

// ═══ 3-C. ⚠️ 시트에서 장절이 바뀌면 이미 있던 명제도 따라 바뀐다 ═══
console.log('시나리오 3-C — 열 이름이 바뀐 시트를 다시 받으면');
{
  // HB 신고 (26-0831) — "'설교 본문'이 들어와야 할 곳에 아직도 '인용 본문'이
  //   들어오고 있어." 까닭: 다시 받을 때 **장절을 견주지 않아서** 이미 있던
  //   항목이 예전 값 그대로 남았다. 본문·대분류·소주제·태그·강조만 봤다.
  // ⚠️ 장절이 바뀌는 것은 **명제뿐**이다 — 말씀은 장절이 신원의 일부라
  //    바뀌면 여기까지 오지 않고 새 항목으로 들어간다.
  const OLD=[HEAD,P('P0401','명제 하나',{'장절/단락':'창세기 1:1'})];
  const coll={verses:[],google:[{id:'g1'}]};
  _syncSheetVersesIntoColl(coll,_propRowsToItems(OLD),{kind:'google',gid:'g1'});
  sc.eq('처음엔 옛 장절',coll.verses[0].ref,'창세기 1:1');

  // 시트에서 열 이름이 바뀌고 설교 본문이 들어왔다
  const H2=HEAD.map(h=>h==='장절/단락'?'인용 본문':h);
  const r=new Array(H2.length).fill('');
  const put=(n,v)=>r[H2.indexOf(n)]=v;
  put('명제 ID','P0401'); put('명제','명제 하나'); put('데이터 상태','활성');
  put('카테고리','주일예배'); put('설교 제목','언덕 위의 도시: 소금과 빛이 되다');
  put('대표 문구','명제 하나'); put('주제 태그','소금과 빛, 제자도');
  put('설교 본문','마태복음 5:13; 로마서 8:28');
  put('인용 본문','창세기 1:1; 요한복음 3:16');
  const r2=_syncSheetVersesIntoColl(coll,_propRowsToItems([H2,r]),{kind:'google',gid:'g1'});
  sc.eq('늘지 않는다',coll.verses.length,1);
  sc.eq('바뀐 것으로 센다',r2.updated,1);
  sc.eq('장절이 따라 바뀐다',coll.verses[0].ref,'마태복음 5:13 · 로마서 8:28');
  sc.eq('설교 본문도 실린다',coll.verses[0].refs,['마태복음 5:13','로마서 8:28']);
  sc.eq('성경권도 따라온다',coll.verses[0].books,['마태복음','로마서']);
  sc.eq('인용 본문은 안 들어온다',coll.verses[0].ref.includes('창세기'),false);
  // 세 번째로 받으면 이제 바뀐 것이 없다 (매번 '수정'으로 세면 안 된다)
  const r3=_syncSheetVersesIntoColl(coll,_propRowsToItems([H2,r]),{kind:'google',gid:'g1'});
  sc.eq('그 다음엔 조용하다',r3.updated,0);
}

// ═══ 3-D. ⚠️ 날짜를 못 읽었다고 '오늘' 을 넣지 않는다 ═══
console.log('시나리오 3-D — 명제의 날짜는 시트가 정답');
{
  // HB 신고 (26-0831) — "'주간' 필터에 160개가 나오는데 시트에서 7일 내는 30개다."
  // 까닭 — 날짜를 못 읽으면(빈 칸이거나 표기가 낯설면) **오늘 날짜**를 넣었다.
  //   그래서 그날 받아온 명제가 전부 '이번 주'로 들어왔다.
  //   → 명제는 시트의 날짜가 곧 설교 날짜다. 못 읽으면 **비워 둔다.**
  sc.eq('여러 표기를 읽는다',
        ['2026-08-30','2026. 8. 30.','2026/8/30','2026년 8월 30일','26-08-30']
          .map(_parseVDate), ['2026-08-30','2026-08-30','2026-08-30','2026-08-30','2026-08-30']);
  // ⚠️ 잘못 읽느니 비워 둔다 — '30/8/2026' 을 2030년으로 읽던 자리다
  sc.eq('헷갈리면 비운다', _parseVDate('30/8/2026'), '');

  const coll={verses:[],google:[{id:'g1'}]};
  const rows=[HEAD,
    P('P0501','날짜 있는 명제',{'날짜':'2026. 6. 21.'}),
    P('P0502','날짜 빈 명제',{'날짜':''})];
  _syncSheetVersesIntoColl(coll,_propRowsToItems(rows),{kind:'google',gid:'g1'});
  const by=id=>coll.verses.find(v=>v.pid===id);
  sc.eq('시트 날짜를 그대로', by('P0501').d, '2026-06-21');
  sc.eq('빈 날짜는 비워 둔다', by('P0502').d, '');
  sc.eq('오늘을 꾸며 넣지 않는다', by('P0502').d===_calKey(), false);

  // 이미 '오늘'이 잘못 들어가 있던 것도 다시 받으면 고쳐진다
  coll.verses.forEach(v=>{v.d=_calKey();});
  const r=_syncSheetVersesIntoColl(coll,_propRowsToItems(rows),{kind:'google',gid:'g1'});
  sc.eq('다시 받으면 고쳐진다', [by('P0501').d,by('P0502').d], ['2026-06-21','']);
  sc.eq('고친 것으로 센다', r.updated, 2);
}

// ═══ 4. 같은 시트를 다시 불러도 늘지 않는다 ═══
console.log('시나리오 4 — 다시 불러오기');
{
  const rows=[HEAD];
  for(let i=1;i<=5;i++)rows.push(P('P000'+i,'명제 '+i));
  const items=_propRowsToItems(rows);
  const coll={verses:[],google:[{id:'g1'}]};
  _syncSheetVersesIntoColl(coll,items,{kind:'google',gid:'g1'});
  const r2=_syncSheetVersesIntoColl(coll,_propRowsToItems(rows),{kind:'google',gid:'g1'});
  sc.eq('두 번째엔 추가 없음',r2.added,0);
  sc.eq('개수 그대로',coll.verses.length,5);
  sc.eq('지워진 것 없음',r2.removed,0);

  // 본문만 고치면 '수정'으로 잡힌다
  const rows2=[HEAD];
  for(let i=1;i<=5;i++)rows2.push(P('P000'+i,i===3?'고친 명제 3':'명제 '+i));
  const r3=_syncSheetVersesIntoColl(coll,_propRowsToItems(rows2),{kind:'google',gid:'g1'});
  sc.eq('한 개만 수정으로 잡힌다',r3.updated,1);
  sc.eq('고쳐진 내용이 반영된다',coll.verses[2].krText,'고친 명제 3');
}

// ═══ 5. 활성이 아닌 줄은 안 가져온다 ═══
console.log('시나리오 5 — 데이터 상태');
{
  const items=_propRowsToItems([HEAD,
    P('P0001','활성 명제'),
    P('P0002','검토 중인 명제',{'데이터 상태':'검토 필요'}),
    P('P0003','상태 빈 명제',{'데이터 상태':''})]);
  sc.eq('활성과 빈칸만 가져온다',items.map(i=>i.pid),['P0001','P0003']);
}

// ═══ 6. 열이 늘어나도 안 깨진다 ═══
console.log('시나리오 6 — 시트에 열이 추가돼도');
{
  const H2=['명제 ID','새로 넣은 열','날짜','카테고리','설교 제목','장절/단락','명제',
            '대표 문구','핵심 주제','주제 태그','데이터 상태'];
  const r=['P0007','아무 값','2026-07-05','수요예배','노하지 말라','마 5:20-26',
           '노여움은 살인의 뿌리다','노여움','마음의 의와 화목','분노, 화해','활성'];
  const items=_propRowsToItems([H2,r]);
  sc.eq('자리가 바뀌어도 이름으로 찾는다',items.length,1);
  sc.eq('본문',items[0].krText,'노여움은 살인의 뿌리다');
  sc.eq('대분류(예배)',items[0].cat,'수요예배');
  sc.eq('소주제(설교 제목)',items[0].topic,'노하지 말라');
}

// ═══ 7. 말씀은 예전 그대로 돈다 ═══
console.log('시나리오 7 — 기존 말씀 모음은 달라지지 않는다');
{
  const a=_verseIdentity('요 3:16','믿음','사랑');
  const b=_verseIdentity('요 3:16','믿음','사랑');
  sc.eq('같은 말씀은 같은 자리',a,b);
  sc.eq('소주제가 다르면 다른 자리',a!==_verseIdentity('요 3:16','믿음','소망'),true);
  sc.eq('명제와는 절대 겹치지 않는다',a!==_verseIdentity('요 3:16','믿음','사랑','P0001'),true);

  const coll={verses:[{ref:'요 3:16',cat:'믿음',topic:'사랑',krText:'옛것',src:'google',gid:'g1'}],
              google:[{id:'g1'}]};
  const items=[{ref:'요 3:16',cat:'믿음',topic:'사랑',krText:'새것',tags:[],hi:'',row:2}];
  const r=_syncSheetVersesIntoColl(coll,items,{kind:'google',gid:'g1'});
  sc.eq('말씀은 장절로 짝지어 갱신된다',r.updated,1);
  sc.eq('개수는 그대로',coll.verses.length,1);
  sc.eq('내용이 갱신됨',coll.verses[0].krText,'새것');
}

sc.done();
