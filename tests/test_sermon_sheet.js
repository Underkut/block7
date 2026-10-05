// '설교 목록' 탭을 말씀 모음에 그대로 연결하기 (v26-0922-8, HB).
//
// 왜 필요한가 —
//   유튜브 썸네일에 쓸 '영상 링크'는 **'설교 목록' 탭**에만 있다. 처음엔 명제 DB 에
//   VLOOKUP 열을 만들어 끌어오자고 제안했지만, HB 가 묵상 질문에서 이미 겪었듯이
//   수식이 빈칸만 뱉는 일이 잦아 **쓰지 않았다.** 탭을 **그대로 연결**한다.
//   (HB 의 명제 DB 에는 영상 링크 열이 없다 — 2026-10-05 시트를 열어 확인)
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
  // ⚠️ v26-1005-2, HB — 가장 최근 설교에 영상이 없으면 **썸네일을 비운다** (칸은 숫자).
  //    예전엔 영상이 있는 옛 설교의 사진을 골라, 날짜(10/4)와 사진(옛 설교)이 어긋났다.
  global.ACTIVE_VERSES=()=>[
    {cat:'성찬예식',d:'2026-09-06',yt:'old11111111'},
    {cat:'성찬예식',d:'2026-10-04'},
    {cat:'성찬예식',d:'2026-10-04'}];
  const b=_swSermons(0);
  sc.eq('날짜는 가장 최근',b[0].d,'2026-10-04');
  sc.eq('그날 영상이 없으면 썸네일 없음 (옛 사진을 쓰지 않는다)',b[0].yt,'');
  // 그날 명제 하나에만 영상이 적혀 있어도 그 설교 것이다 (차례와 상관없이)
  global.ACTIVE_VERSES=()=>[
    {cat:'주일예배',d:'2026-10-04'},
    {cat:'주일예배',d:'2026-09-27',yt:'old11111111'},
    {cat:'주일예배',d:'2026-10-04',yt:'new22222222'}];
  sc.eq('같은 날 다른 명제의 영상을 쓴다',_swSermons(0)[0].yt,'new22222222');
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

// ── 아래 시나리오 7~10 에 쓰는 것: 명제 DB 를 실제로 반영하는 길 ──
global.document = global.document || { visibilityState: 'visible', addEventListener: () => {} };
global.showToast = global.showToast || (() => {});
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('function _rowsToItems(', '// 파일/직접용 임포트'));
eval(slice('function _verseIdentity(', '// 구글 시트 소스마다 고정 id'));
eval(slice('function _gSrcId(', '// srcInfo ='));
eval(slice('function _syncSheetVersesIntoColl(', 'function addCustomVerseFromForm'));
eval(slice('const _SYNC_NOVID_MAX=', '// ── "새로 들어온 말씀을 목록에 포함시키기"').replace(/^const /gm,'var '));
function _escHtml(t){return String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
function _bookOfRef(){return '';}
function _bookNorm(n){return String(n||'').trim();}
function _calKey(){return '2026-10-04';}

// ⚠️⚠️ HB 의 **실제** 시트 모양 (2026-10-05, 'BLOCK7 설교 명제 DB' 를 열어 그대로 옮김).
//    한 파일의 세 탭 — 명제 DB · 설교 목록 · 성도 공유용 — 을 한 모음에 연결해 쓴다.
//    ⚠️ 명제 DB 에는 **'영상 링크' 열이 없다** (VLOOKUP 도 안 쓴다). v26-1004-1 에서
//       그렇게 짐작해 적었다가 틀렸다. 시트 모양은 짐작하지 말고 열어 볼 것.
const PHEAD=['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','인용 본문','명제',
  '대표 문구 1','대표 문구 2','분류','대표 명제','핵심 주제','주제 태그','조직신학','성경신학/구속사',
  '성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치','한 줄 요약','원문 상태',
  '관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
const XHEAD=['주제','상황/필요','명제','본문','분류','묵상 질문','설교 제목','날짜','명제 ID','공개 여부',
  '검수 상태','공개 제목','공개 해설','기도문','공유 슬러그','공개 순서'];
sc.eq('실제 명제 DB 에는 영상 링크 열이 없다',PHEAD.some(h=>/영상|유튜브/.test(h)),false);
sc.eq('실제 성도 공유용 탭도 명제 시트로 읽힌다',_isPropSheet(XHEAD),true);
const prow=(id,d,cat,title,o={})=>{
  const r=new Array(PHEAD.length).fill('');
  const put=(k,v)=>{r[PHEAD.indexOf(k)]=v;};
  put('명제 ID',id);put('날짜',d);put('카테고리',cat);put('설교 제목',title);put('설교 본문','롬 5:8');
  put('명제',o.text||'명제 '+id);put('상황 태그',o.sit||'');put('데이터 상태','활성');
  return r;
};
const xrow=(id,d,title,o={})=>{
  const r=new Array(XHEAD.length).fill('');
  const put=(k,v)=>{r[XHEAD.indexOf(k)]=v;};
  put('명제 ID',id);put('날짜',d);put('설교 제목',title);put('명제',o.text||'명제 '+id);
  put('상황/필요',o.sit||'');put('묵상 질문',o.q||'');
  return r;
};
const propRows=()=>[PHEAD,
  prow('P0001','2026-09-21','주일예배','처음 설교'),
  prow('P0002','2026-09-21','라이프라인','처음 라이프'),
  prow('P0010','2026-09-30','수요예배','사랑하나요?'),
  prow('P0011','2026-10-04','주일예배','그 열매로 그들을 알리라'),
  prow('P0012','2026-10-04','주일예배','그 열매로 그들을 알리라'),
  prow('P0013','2026-10-04','라이프라인 예배','사울, 엔돌의 신접한 여인을 만나다'),  // ⚠️ 표기가 조금 다르다
  prow('P0014','2026-10-04','성찬예식','십자가의 화해와 평안'),
  prow('P0015','2026-09-12','결혼예식','결혼의 본질과 공동체'),
  prow('P0016','2026-08-02','성찬 예식','성찬은 교환된 삶의 고백입니다'),
  prow('P0017','2026-07-01','특강','설교 목록에 없는 설교')];
const listRows=()=>[SHEAD,
  srow({'날짜':'2026-09-21','카테고리':'주일예배','설교 제목':'처음 설교','설교자':'ㄱ','영상 링크':YT('devSUN00001')}),
  srow({'날짜':'2026-09-21','카테고리':'라이프라인','설교 제목':'처음 라이프','설교자':'ㄱ','영상 링크':YT('devLIFE0001')}),
  srow({'날짜':'2026-09-30','카테고리':'수요예배','설교 제목':'사랑하나요?','설교자':'ㄱ','영상 링크':'https://www.youtube.com/live/0PxJfeQzVgI?si=8H8kiI99cFYs8OKt'}),
  srow({'날짜':'2026-10-04','카테고리':'주일예배','설교 제목':'그 열매로 그들을 알리라','설교자':'ㄱ','영상 링크':'https://www.youtube.com/live/Zdu80ci9E7Q?si=av9FbXPzmjwEVTZu'}),
  srow({'날짜':'2026-10-04','카테고리':'라이프라인','설교 제목':'사울, 엔돌의 신접한 여인을 만나다','설교자':'ㄱ','영상 링크':'https://www.youtube.com/live/hFJ3pqd2xbo?si=fVasv1pmKpAj2YiI'}),
  srow({'날짜':'2026-10-04','카테고리':'성찬예식','설교 제목':'십자가의 화해와 평안','설교자':'ㄱ','영상 링크':'유튜브 미업로드'}),
  srow({'날짜':'2026-09-12','카테고리':'결혼예식','설교 제목':'결혼의 본질과 공동체','설교자':'ㄱ','영상 링크':'유튜브 미업로드'}),
  srow({'날짜':'2026-08-02','카테고리':'성찬 예식','설교 제목':'성찬은 교환된 삶의 고백입니다','설교자':'ㄱ','영상 링크':''})];
// 연결 순서: **설교 목록이 먼저** 연결돼 있는 경우 (가장 까다로운 순서)
const mkColl=()=>({id:'',name:'설교',verses:[],google:[{id:'gL',name:'설교 목록'},{id:'gP',name:'명제 DB'}]});
const run=c=>_syncCollSheets(c,[{g:c.google[0],rows:listRows(),today:'2026-10-04'},
                                 {g:c.google[1],rows:propRows(),today:'2026-10-04'}]);
const ytOf=(c,pid)=>(c.verses.find(v=>v.pid===pid)||{}).yt||'';

// ═══ 7. 썸네일 — 새 설교에 그 설교 영상이 붙는다 ═══
console.log("\n시나리오 7 — 설교 목록이 먼저 연결돼 있어도 새 설교에 영상이 붙는다");
{
  const c=mkColl();
  const r1=run(c);
  sc.eq('명제 10개가 들어왔다',[r1.added,c.verses.length],[10,10]);
  // 예전엔 설교 목록이 먼저 돌아서(그땐 명제가 아직 없다) **다음 동기화**에야 붙었다
  sc.eq('9/30 수요예배 (live/ 주소)',ytOf(c,'P0010'),'0PxJfeQzVgI');
  sc.eq('10/4 주일예배',[ytOf(c,'P0011'),ytOf(c,'P0012')],['Zdu80ci9E7Q','Zdu80ci9E7Q']);
  // 같은 날 설교가 셋이라 날짜만으로는 못 찾는다 — 카테고리가 '라이프라인 예배' 로 달라도
  sc.eq("10/4 라이프라인 ('라이프라인 예배' 표기)",ytOf(c,'P0013'),'hFJ3pqd2xbo');
  global.ACTIVE_VERSES=()=>c.verses;
  const by={};_swSermons(0).forEach(x=>{by[_sermonCatNorm(x.cat)]=x;});
  sc.eq('타일: 주일예배는 10/4 영상',by['주일예배'].yt,'Zdu80ci9E7Q');
  sc.eq('타일: 수요예배는 9/30 영상',by['수요예배'].yt,'0PxJfeQzVgI');
  sc.eq('다시 동기화해도 수정 0',run(c).updated,0);
}

// ═══ 8. '수정 116개' — 실제 원인 재현 ═══
// 명제 DB 와 성도 공유용이 **같은 명제의 같은 칸을 다르게** 적는다
// (2026-10-05 실제 시트: 58개 — 상황 55 · 명제 문장 3). 시트마다 따로 세면
// 누를 때마다 앞 탭이 바꾸고 뒤 탭이 되돌려 2×58 = 116 이 떴다.
console.log("\n시나리오 8 — 사고 재현: 두 탭이 다르게 적은 명제가 매번 두 번 '수정'");
{
  const db=()=>[PHEAD,
    prow('P0175','2026-08-02','주일예배','광야',{sit:'상황적 불확실성, 사람의 인정'}),
    prow('P0190','2026-08-09','주일예배','말씀',{text:'성도는 고난보다 더 실재하시는 하나님을 사랑한다.'}),
    prow('P0200','2026-08-09','주일예배','말씀',{sit:'같음'})];
  const share=()=>[XHEAD,
    xrow('P0175','2026-08-02','광야',{sit:'불확실성, 사람의 인정',q:'무엇을 붙드는가?'}),
    xrow('P0190','2026-08-09','말씀',{text:'성도는 고난보다 더 실재하신 하나님을 사랑한다.'}),
    xrow('P0200','2026-08-09','말씀',{sit:'같음'})];
  const c={id:'',name:'설교',verses:[],google:[{id:'gP',name:'명제 DB'},{id:'gX',name:'성도 공유용'}]};
  const old=()=>_syncSheetVersesIntoColl(c,_rowsToItems(db()),{kind:'google',gid:'gP'}).updated
              +_syncSheetVersesIntoColl(c,_rowsToItems(share()),{kind:'google',gid:'gX'}).updated;
  old();
  sc.eq('예전 길: 다른 2개 × 2 = 4 가 매번 뜬다 (실제 시트에선 58 × 2 = 116)',[old(),old()],[4,4]);
  const c2={id:'',name:'설교',verses:[],google:[{id:'gP',name:'명제 DB'},{id:'gX',name:'성도 공유용'}]};
  const go=()=>_syncCollSheets(c2,[{g:c2.google[0],rows:db(),today:'x'},{g:c2.google[1],rows:share(),today:'x'}]);
  go();
  sc.eq('새 길: 두 번째부터 수정 0',[go().updated,go().updated],[0,0]);
  sc.eq('결과 화면 내역에도 수정이 없다',
    go().groups.some(g=>[...g.byCat.values()].some(v=>v.updated)),false);
  // 값은 **나중에 연결한 탭**(성도 공유용)의 것이 남는다 — 두 탭을 맞추는 건 시트 쪽 일이다
  sc.eq('남는 값은 뒤 탭의 것',c2.verses.find(v=>v.pid==='P0190').krText,'성도는 고난보다 더 실재하신 하나님을 사랑한다.');
  sc.eq('묵상 질문은 성도 공유용에서',c2.verses.find(v=>v.pid==='P0175').q,'무엇을 붙드는가?');
}

// ═══ 9. 진짜로 바뀐 것은 한 번만 센다 ═══
console.log("\n시나리오 9 — 시트에서 진짜 고친 것은 1개로 센다");
{
  const c={id:'',name:'설교',verses:[],google:[{id:'gP',name:'명제 DB'},{id:'gX',name:'성도 공유용'}]};
  const db=t=>[PHEAD,prow('P0001','2026-09-21','주일예배',t,{sit:'불안'})];
  const share=t=>[XHEAD,xrow('P0001','2026-09-21',t,{sit:'두려울 때',q:'무엇이 두려운가?'})];
  const go=t=>_syncCollSheets(c,[{g:c.google[0],rows:db(t),today:'x'},{g:c.google[1],rows:share(t),today:'x'}]);
  go('처음 제목');
  sc.eq('두 번째는 수정 0',go('처음 제목').updated,0);
  sc.eq('두 탭 모두 제목을 고치면 1개 (두 번 세지 않는다)',go('고친 제목').updated,1);
  sc.eq('lastSync 가 적힌다',c.google.map(g=>g.lastSync),['x','x']);
}

// ═══ 10. 영상 링크가 없는 설교를 결과 화면에서 알린다 (v26-1005-1, HB) ═══
console.log("\n시나리오 10 — 영상 링크가 없는 설교 알림");
{
  // HB: "썸네일 오류는 유튜브 링크가 없어서 그런 거였어. 동기화 후 메시지에서 알려 줘."
  const c=mkColl();
  const r=run(c);
  const nv=r.noVideo;
  sc.eq('영상 없는 설교 4편 (설교 하나당 한 줄)',nv.length,4);
  sc.eq('새 것이 위로',nv.map(o=>o.d),['2026-10-04','2026-09-12','2026-08-02','2026-07-01']);
  sc.eq("칸에 적힌 말을 그대로 ('유튜브 미업로드')",[nv[0].why,nv[0].note],['note','유튜브 미업로드']);
  sc.eq('제목과 명제 수',[nv[0].title,nv[0].n],['십자가의 화해와 평안',1]);
  sc.eq('칸이 비어 있으면 empty',nv[2].why,'empty');
  sc.eq('설교 목록에 아예 없으면 absent',nv[3].why,'absent');
  sc.eq('영상이 붙은 설교는 안 나온다',nv.some(o=>o.cat==='주일예배'||o.cat==='수요예배'),false);
  sc.eq('모음 이름이 붙는다',nv[0].coll,'설교');
  const html=_syncNoVideoHTML(nv);
  sc.eq('제목 줄',html.includes('영상 링크가 없는 설교 4편'),true);
  sc.eq('한 줄 모양',html.includes('10/4 성찬예식 · 십자가의 화해와 평안'),true);
  sc.eq('왜 없는지',html.includes('영상 칸이 비어 있어요')&&html.includes('설교 목록에서 못 찾았어요'),true);
  sc.eq('없으면 아무것도 안 그린다',_syncNoVideoHTML([]),'');
  // 많으면 몇 줄만 — 옛 '유튜브 미업로드' 설교가 화면을 덮지 않게
  const many=Array.from({length:9},(_,i)=>({d:'2026-09-0'+(i+1),cat:'성찬예식',title:'t'+i,why:'note',note:'유튜브 미업로드'}));
  const h2=_syncNoVideoHTML(many);
  sc.eq('다섯 줄까지만',(h2.match(/유튜브 미업로드/g)||[]).length,5);
  sc.eq('나머지는 개수로',h2.includes('그 밖에 4편'),true);
  // 두 동기화 길 모두 결과 화면에 넘긴다
  const fs=require('fs'),path=require('path');
  const f=path.join(__dirname,'..','index-dev.html');
  const src=fs.readFileSync(fs.existsSync(f)?f:path.join(__dirname,'..','index.html'),'utf-8');
  sc.eq('결과 화면 두 길 모두 noVideo 를 넘긴다',(src.match(/showSyncResultModal\(\{[^}]*noVideo\}\)/g)||[]).length,2);
  sc.eq('결과 화면이 그린다',src.includes('lines.push(_syncNoVideoHTML(r.noVideo));'),true);
}

sc.done();
