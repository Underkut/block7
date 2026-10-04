// '설교 목록' 탭을 말씀 모음에 그대로 연결하기 (v26-0922-8, HB).
//
// 왜 필요한가 —
//   유튜브 썸네일에 쓸 '영상 링크'는 **'설교 목록' 탭**에만 있다. 예전엔 명제 DB 에
//   VLOOKUP 열을 만들어 끌어오라고 했는데, HB 가 묵상 질문에서 이미 겪었듯이
//   수식이 빈칸만 뱉는 일이 잦다. 그래서 탭을 **그대로 연결**할 수 있게 한다.
//
// ⚠️⚠️ 그냥 연결하면 큰일 난다 — '설교 목록' 탭에는 **'명제 ID' 열이 없다.**
//    그러면 _isPropSheet 가 false 를 주어 **평범한 말씀 시트**로 읽히고,
//    설교 400줄이 엉뚱한 말씀으로 들어오면서 원래 명제들은 "시트에서 사라졌다"로
//    읽혀 휴지통으로 간다. 이 시험이 그 길을 막는다.
//
// 이 탭은 구절을 **만들지도 지우지도 않는다.** 이미 들어와 있는 명제에
// 영상 링크만 얹는다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
function z(n){return String(n).padStart(2,'0');}
eval(slice('function _parseVDate(', 'function _looksLikeRef(').replace(/^const /gm,'var '));
eval(slice('// ══ 명제집(설교 명제 DB) 시트 읽기', 'function _rowsToItems'));
eval(slice('function _swSermons(', '// 성경: 장절에서'));

// 실제 '설교 목록' 탭의 열 이름 (2026-09-22 시트 그대로)
const SHEAD=['날짜','카테고리','설교 제목','설교자','영상 링크','영상 시각','주요 본문',
  '핵심 주제','주제 태그','Best 1','Best 2','Best 3','명제 수','원문 상태','DB 현황','값'];
function srow(o){
  const r=new Array(SHEAD.length).fill('');
  for(const k in o)r[SHEAD.indexOf(k)]=o[k];
  return r;
}
const YT=id=>'https://www.youtube.com/watch?v='+id;

// ═══ 1. 설교 목록 시트를 알아보는가 ═══
console.log("시나리오 1 — '설교 목록' 탭 알아보기");
{
  sc.eq('설교 목록 머리글을 알아본다',_isSermonListSheet(SHEAD),true);
  // ⚠️ 명제 DB 는 여기로 오면 안 된다 — '명제 ID'가 있으면 언제나 명제 시트다
  sc.eq("'명제 ID'가 있으면 설교 목록이 아니다",
    _isSermonListSheet(['명제 ID','날짜','카테고리','설교 제목','설교자','영상 링크']),false);
  // ⚠️ 평범한 말씀 모음 시트도 아니다
  sc.eq('평범한 말씀 시트는 아니다',
    _isSermonListSheet(['카테고리','주제','본문','장절','태그','날짜','강조 문구']),false);
  // 영상 링크 열이 없으면 알아볼 까닭이 없다 (얻을 것이 없으므로 평소 길로)
  sc.eq('영상 링크 열이 없으면 아니다',
    _isSermonListSheet(['날짜','카테고리','설교 제목','설교자','주요 본문']),false);
  // '영상 시각'은 '영상 링크'가 아니다 — 이름을 부분 일치로 찾으면 여기서 걸린다
  sc.eq("'영상 시각'만 있으면 아니다",
    _isSermonListSheet(['날짜','카테고리','설교 제목','설교자','영상 시각']),false);
}

// ═══ 2. 날짜+카테고리로 영상 링크가 붙는다 ═══
console.log('\n시나리오 2 — 이미 있는 명제에 영상 링크만 얹는다');
{
  const coll={verses:[
    {pid:'P0001',cat:'주일예배',d:'2026-09-07',krText:'가',yt:''},
    {pid:'P0002',cat:'주일예배',d:'2026-09-07',krText:'나',yt:''},
    {pid:'P0003',cat:'주일예배',d:'2026-09-14',krText:'다',yt:''},
    {pid:'P0004',cat:'수요예배',d:'2026-09-10',krText:'라',yt:''},
    {pid:'P0005',cat:'주일예배',d:'2026-09-21',krText:'마',yt:''}  // 시트에 없는 날
  ]};
  const rows=[SHEAD,
    srow({'날짜':'2026-09-07','카테고리':'주일예배','설교 제목':'가나','영상 링크':YT('aaaaaaaaaaa')}),
    srow({'날짜':'2026-09-14','카테고리':'주일예배','설교 제목':'다','영상 링크':YT('bbbbbbbbbbb')}),
    srow({'날짜':'2026-09-10','카테고리':'수요예배','설교 제목':'라','영상 링크':YT('ccccccccccc')})];
  const r=_applySermonListSheet(coll,rows);
  sc.eq('설교 3편을 읽었다',r.sermons,3);
  sc.eq('명제 4개에 붙었다',r.updated,4);
  sc.eq('같은 설교의 명제 둘 다',[coll.verses[0].yt,coll.verses[1].yt],['aaaaaaaaaaa','aaaaaaaaaaa']);
  sc.eq('다른 날 설교',coll.verses[2].yt,'bbbbbbbbbbb');
  sc.eq('다른 예배',coll.verses[3].yt,'ccccccccccc');
  sc.eq('시트에 없는 날은 그대로 빈칸',coll.verses[4].yt,'');
  // ⚠️ **구절을 만들지도 지우지도 않는다** — 이 탭이 하는 일은 이것뿐이다
  sc.eq('명제 개수가 그대로',coll.verses.length,5);
  sc.eq('명제 글은 손대지 않는다',coll.verses[0].krText,'가');
  sc.eq('추가·삭제는 0',[r.added,r.removed],[0,0]);
  // 두 번 받아도 바뀐 것이 없다 (같은 값을 다시 쓰지 않는다)
  sc.eq('두 번째는 바뀐 것 없음',_applySermonListSheet(coll,rows).updated,0);
}

// ═══ 3. 같은 날 예배가 둘이면 카테고리까지 맞아야 한다 ═══
console.log('\n시나리오 3 — 같은 날 예배가 둘일 때');
{
  const coll={verses:[
    {pid:'P1',cat:'주일1부',d:'2026-09-07',yt:''},
    {pid:'P2',cat:'주일2부',d:'2026-09-07',yt:''},
    {pid:'P3',cat:'적힌 적 없는 예배',d:'2026-09-07',yt:''}]};
  const rows=[SHEAD,
    srow({'날짜':'2026-09-07','카테고리':'주일1부','영상 링크':YT('11111111111'),'설교자':'ㄱ'}),
    srow({'날짜':'2026-09-07','카테고리':'주일2부','영상 링크':YT('22222222222'),'설교자':'ㄱ'})];
  _applySermonListSheet(coll,rows);
  sc.eq('1부',coll.verses[0].yt,'11111111111');
  sc.eq('2부',coll.verses[1].yt,'22222222222');
  // ⚠️ 날짜만으로 아무거나 집어 주면 **엉뚱한 설교 영상**이 뜬다. 비워 둔다.
  sc.eq('카테고리가 안 맞으면 비워 둔다',coll.verses[2].yt,'');
}

// ═══ 4. 카테고리 표기가 조금 달라도 날짜 하나면 찾아준다 ═══
console.log('\n시나리오 4 — 그날 설교가 하나뿐이면 날짜만으로도');
{
  const coll={verses:[{pid:'P1',cat:'주일 예배',d:'2026-09-07',yt:''}]};
  const rows=[SHEAD,
    srow({'날짜':'2026. 9. 7.','카테고리':'주일예배','영상 링크':YT('zzzzzzzzzzz'),'설교자':'ㄱ'})];
  _applySermonListSheet(coll,rows);
  // 날짜 표기가 달라도(_parseVDate) 카테고리 띄어쓰기가 달라도 붙는다
  sc.eq('그날 설교가 하나면 붙는다',coll.verses[0].yt,'zzzzzzzzzzz');
}

// ═══ 5. 설교 타일은 '가장 최근' 영상을 쓴다 ═══
console.log('\n시나리오 5 — 설교 타일의 썸네일은 최신 것');
{
  // ⚠️ 카테고리는 설교 하나가 아니라 **예배 종류**다('주일예배'). 그래서 한 묶음에
  //    영상이 여럿 들어온다. 타일에 적히는 날짜는 **가장 최근**이므로
  //    썸네일도 그 날짜 것이라야 짝이 맞는다.
  global.ACTIVE_VERSES=()=>[
    {cat:'주일예배',d:'2026-09-07',yt:'old11111111'},
    {cat:'주일예배',d:'2026-09-21',yt:'new22222222'},
    {cat:'주일예배',d:'2026-09-14',yt:'mid33333333'}];
  const a=_swSermons(0);
  sc.eq('한 묶음',a.length,1);
  sc.eq('가장 최근 날짜',a[0].d,'2026-09-21');
  sc.eq('썸네일도 그 날짜 것',a[0].yt,'new22222222');
}

// ═══ 6. 시트를 받아오는 **모든 길**에 갈림목이 있는가 ═══
console.log('\n시나리오 6 — 세 갈래 모두에 갈림목이 있다');
{
  // ⚠️ 시트를 받아오는 길은 셋이다 — ①시트 하나 불러오기(ceImportGoogleLink)
  //    ②로고 롱터치 전체 업데이트(verseSyncAllNow) ③하루 시작 자동(runVerseSheetAutoSync).
  //    한 군데라도 갈림목이 빠지면 그 길로 들어온 '설교 목록'이 평범한 말씀
  //    시트로 읽혀 **명제가 통째로 휴지통에 간다.**
  //    v26-1004-1 부터 ②③은 _syncCollSheets 한 곳을 지나고, 갈림목은 그 안에 있다.
  const fs=require('fs'),path=require('path');
  const f=path.join(__dirname,'..','index-dev.html');
  const src=fs.readFileSync(fs.existsSync(f)?f:path.join(__dirname,'..','index.html'),'utf-8');
  const body=name=>{const a=src.indexOf(name);const b=src.indexOf('\n}\n',a);return a<0?'':src.slice(a,b);};
  sc.eq('① 시트 하나 불러오기에 갈림목',
    /_isSermonListSheet\(rows\[0\]\|\|\[\]\)/.test(body('async function ceImportGoogleLink(')),true);
  sc.eq('② 전체 업데이트는 _syncCollSheets 를 지난다',
    body('async function verseSyncAllNow(').indexOf('_syncCollSheets(')>=0,true);
  sc.eq('③ 하루 시작 자동도 _syncCollSheets 를 지난다',
    body('async function runVerseSheetAutoSync(').indexOf('_syncCollSheets(')>=0,true);
  sc.eq('_syncCollSheets 안에 갈림목',
    body('function _syncCollSheets(').indexOf('_isSermonListSheet(')>=0,true);
  // 옛 길(시트마다 _syncSheetVersesIntoColl 을 바로 부르던 것)이 남아 있으면 안 된다
  sc.eq('② 에 옛 길이 없다',body('async function verseSyncAllNow(').indexOf("{kind:'google'")<0,true);
  sc.eq('③ 에 옛 길이 없다',body('async function runVerseSheetAutoSync(').indexOf("{kind:'google'")<0,true);
}

// ── 아래 시나리오 7~9 에 쓰는 것: 명제 DB 를 실제로 반영하는 길 ──
global.document = global.document || { visibilityState: 'visible', addEventListener: () => {} };
global.showToast = global.showToast || (() => {});
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('function _rowsToItems(', '// 파일/직접용 임포트'));
eval(slice('function _verseIdentity(', '// 구글 시트 소스마다 고정 id'));
eval(slice('function _gSrcId(', '// srcInfo ='));
eval(slice('function _syncSheetVersesIntoColl(', 'function addCustomVerseFromForm'));
function _bookOfRef(){return '';}
function _bookNorm(n){return String(n||'').trim();}
function _calKey(){return '2026-10-04';}

// 명제 DB — HB 가 처음에 VLOOKUP 으로 '영상 링크' 열을 만들어 둔 모양.
// ⚠️ 수식은 **그때 있던 줄까지만** 채워져 있다 → 새 설교(9/30·10/4) 줄은 비어 있다.
const PHEAD=['명제 ID','날짜','카테고리','설교 제목','설교 본문','명제','상황 태그','데이터 상태','영상 링크'];
const prow=(id,d,cat,title,yt,sit)=>{
  const r=new Array(PHEAD.length).fill('');
  r[0]=id;r[1]=d;r[2]=cat;r[3]=title;r[4]='롬 5:8';r[5]='명제 '+id;r[6]=sit||'';r[7]='활성';
  r[8]=yt?YT(yt):'';return r;
};
const propRows=()=>[PHEAD,
  prow('P0001','2026-09-21','주일예배','처음 설교','devSUN00001'),
  prow('P0002','2026-09-21','라이프라인','처음 라이프','devLIFE0001'),
  prow('P0003','2026-09-24','수요예배','처음 수요','devWED00001'),
  prow('P0010','2026-09-30','수요예배','새 수요',''),
  prow('P0011','2026-10-04','주일예배','새 주일',''),
  prow('P0012','2026-10-04','주일예배','새 주일',''),
  prow('P0013','2026-10-04','라이프라인 예배','새 라이프','')];   // ⚠️ 표기가 조금 다르다
const listRows=()=>[SHEAD,
  srow({'날짜':'2026-09-21','카테고리':'주일예배','설교 제목':'처음 설교','설교자':'ㄱ','영상 링크':YT('devSUN00001')}),
  srow({'날짜':'2026-09-21','카테고리':'라이프라인','설교 제목':'처음 라이프','설교자':'ㄱ','영상 링크':YT('devLIFE0001')}),
  srow({'날짜':'2026-09-24','카테고리':'수요예배','설교 제목':'처음 수요','설교자':'ㄱ','영상 링크':YT('devWED00001')}),
  srow({'날짜':'2026-09-30','카테고리':'수요예배','설교 제목':'새 수요','설교자':'ㄱ','영상 링크':YT('newWED00930')}),
  srow({'날짜':'2026-10-04','카테고리':'주일예배','설교 제목':'새 주일','설교자':'ㄱ','영상 링크':YT('newSUN01004')}),
  srow({'날짜':'2026-10-04','카테고리':'라이프라인','설교 제목':'새 라이프','설교자':'ㄱ','영상 링크':YT('newLIFE1004')})];
// 연결 순서: HB 의 모음처럼 **설교 목록이 먼저** 연결돼 있다
const mkColl=()=>({id:'',name:'설교',verses:[],google:[{id:'gL',name:'설교 목록'},{id:'gP',name:'명제 DB'}]});
const run=c=>_syncCollSheets(c,[{g:c.google[0],rows:listRows(),today:'2026-10-04'},
                                 {g:c.google[1],rows:propRows(),today:'2026-10-04'}]);
const ytOf=(c,pid)=>(c.verses.find(v=>v.pid===pid)||{}).yt||'';

// ═══ 7. 썸네일 — 새 설교에 새 영상이 붙는다 ═══
console.log("\n시나리오 7 — 설교 목록이 먼저 연결돼 있어도 새 설교에 영상이 붙는다");
{
  const c=mkColl();
  const r1=run(c);
  sc.eq('명제 7개가 들어왔다',[r1.added,c.verses.length],[7,7]);
  // ⚠️ 예전엔 설교 목록이 먼저 돌고(그땐 명제가 아직 없다) 명제 DB 가 빈 칸을 남겼다
  sc.eq('9/30 수요예배',ytOf(c,'P0010'),'newWED00930');
  sc.eq('10/4 주일예배',[ytOf(c,'P0011'),ytOf(c,'P0012')],['newSUN01004','newSUN01004']);
  // 같은 날 설교가 둘이라 날짜만으로는 못 찾는다 — 카테고리가 '라이프라인 예배' 로 달라도
  sc.eq("10/4 라이프라인 ('라이프라인 예배' 표기)",ytOf(c,'P0013'),'newLIFE1004');
  global.ACTIVE_VERSES=()=>c.verses;
  const by={};_swSermons(0).forEach(x=>{by[_sermonCatNorm(x.cat)]=x;});
  sc.eq('타일: 주일예배는 10/4 영상',by['주일예배'].yt,'newSUN01004');
  sc.eq('타일: 수요예배는 9/30 영상',by['수요예배'].yt,'newWED00930');
  sc.eq('타일: 라이프라인 예배는 10/4 영상',by['라이프라인예배'].yt,'newLIFE1004');
  // 이제 두 번째 동기화 — 예전엔 여기서 영상이 지워졌다 다시 붙으며 늘 '수정' 이 떴다
  const r2=run(c);
  sc.eq('다시 동기화해도 수정 0',r2.updated,0);
  sc.eq('추가·복원·휴지통도 0',[r2.added,r2.restored,r2.removed],[0,0,0]);
  sc.eq('결과 화면 내역에도 수정이 없다',
    r2.groups.some(g=>[...g.byCat.values()].some(v=>v.updated)),false);
  sc.eq('영상은 그대로',ytOf(c,'P0011'),'newSUN01004');
  sc.eq('세 번째도 0',run(c).updated,0);
}

// ═══ 8. 옛 방식(시트마다 따로 반영)은 정말 늘 수정이 떴는가 — 사고 재현 ═══
console.log("\n시나리오 8 — 사고 재현: 시트마다 따로 반영하면 매번 '수정'");
{
  const c=mkColl();
  const old=()=>{
    let n=0;
    n+=_applySermonListSheet(c,listRows()).updated;
    n+=_syncSheetVersesIntoColl(c,_rowsToItems(propRows()),{kind:'google',gid:'gP'}).updated;
    return n;
  };
  old();
  const n2=old(),n3=old();
  sc.eq('예전 길은 두 번째에도 수정이 뜬다 (이것이 116개의 정체)',n2>0,true);
  sc.eq('세 번째에도 똑같이',n3,n2);
  sc.eq('그리고 새 설교는 영상이 비어 있다',ytOf(c,'P0011'),'');
}

// ═══ 9. 두 탭이 같은 칸을 다르게 적어도 '수정' 이 쌓이지 않는다 ═══
console.log("\n시나리오 9 — 명제 DB 와 성도 공유용이 상황을 다르게 적어도");
{
  const SHARE=['명제 ID','명제','상황/필요','묵상 질문'];
  const shareRows=()=>[SHARE,['P0001','명제 P0001','두려울 때','무엇이 두려운가?']];
  const c={id:'',name:'설교',verses:[],google:[{id:'gP',name:'명제 DB'},{id:'gS',name:'성도 공유용'}]};
  const db=()=>[PHEAD,prow('P0001','2026-09-21','주일예배','처음 설교','','불안')];
  const go=()=>_syncCollSheets(c,[{g:c.google[0],rows:db(),today:'x'},{g:c.google[1],rows:shareRows(),today:'x'}]);
  go();
  sc.eq('묵상 질문이 들어왔다',c.verses[0].q,'무엇이 두려운가?');
  sc.eq('두 번째는 수정 0',go().updated,0);
  // 시트에서 진짜로 바꾸면 그때는 센다
  const db2=()=>[PHEAD,prow('P0001','2026-09-21','주일예배','고친 제목','','불안')];
  const r=_syncCollSheets(c,[{g:c.google[0],rows:db2(),today:'x'},{g:c.google[1],rows:shareRows(),today:'x'}]);
  sc.eq('진짜 바뀐 것은 1개로 센다 (두 번 세지 않는다)',r.updated,1);
  sc.eq('lastSync 가 적힌다',c.google.map(g=>g.lastSync),['x','x']);
}

sc.done();
