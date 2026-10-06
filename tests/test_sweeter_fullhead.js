// Sweeter 타일 → 전체화면 머리 (v26-1006-1, HB)
//
// HB: "대시보드 연결탭에서 선택해서 전체화면 들어가면 상단 헤더에 나오는 두 가지
//      기능('말씀+명제' 구분 알약버튼, 헤더 제목 누르면 그 필터 그룹의 그리드뷰)을
//      스위터 홈화면에서 각 타일로 들어간 전체화면에서도 동일한 원리로."
//
// 대시보드 길(_vpGoFull·vMapOpenChapter)이 하는 일은 셋이다.
//   ① _vfSetTabPool(목록,'all')  — 알약이 돌 밑 목록
//   ② _vfSetNav(목록,i,제목)      — 제목과 이전/다음
//   ③ _vfNavTile={kind,val,…}     — 제목을 누르면 갈 타일뷰
// Sweeter 타일도 같은 셋을 심는다. 성경·태그 말고는 그 목록을 담을 축이 없어서
// 타일뷰에 '받은 목록 그대로' 보여 주는 갈래(kind 'list')를 하나 더했다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT='sweeter';
global.document={getElementById:()=>null,querySelector:()=>null,addEventListener:()=>{}};
global.window={addEventListener:()=>{}};
let TOAST='';function showToast(m){TOAST=m;}

let VERSES=[];
function ACTIVE_VERSES(){return VERSES;}
function ACTIVE_VERSES_ALL(){return VERSES;}
function getActiveColls(){return ['c1'];}
let FILT={period:'all'};
function _getCollFilter(){return FILT;}
function _vListRange(){return {from:'2026-09-01',to:'2026-09-30'};}
function _flatSimpleEntries(){return [];} function _flatMemEntries(){return [];}
function getLikeLog(){return {};} function getMemLog(){return {};}
function getDeeperLog(){return {};} function getEvenDeeperLog(){return {};}
function getShareLog(){return {};} function getKeepLog(){return {};}
function _aggByRef(){return [];}
function _findVerseByRefLoose(){return null;}
function _booksOf(v){return v.book?[v.book]:[];}
function _bibleRankOfRef(){return 0;}
function _calKey(){return '2026-10-06';}
function _tagartPick(){return null;} function _tagartSvg(){return '';}
function _tagartStyle(){return 'minimal';}
let ST={settings:{}};function save(){}
function _vfIsProp(v){return v.kind==='prop';}
function _vIdKey(v){return v.pid?('P:'+v.pid):('V:'+v.ref);}

// 전체화면 흉내 — openVerseFull 은 진짜처럼 앞머리에서 다 지운다
let _vfOverrideVerse=null,OPENED=null,NAV=null,NAVIDX=-1,NAVLABEL='',SYNCED=0;
var _vfNavTile=null,_vfTabPool=null,_vpFullTab=null;
function setVerseIdx(i){OPENED=i;}
function openVerseFull(){_vfTabPool=null;_vpFullTab=null;_vfNavTile=null;NAV=null;}
function _vfSetNav(list,idx,label){_vfNavTile=null;NAV=list;NAVIDX=idx;NAVLABEL=label;}
function _vfSyncTopBar(){SYNCED++;}

// 진짜 코드를 떠온다 — 밑 목록 두 함수와 Sweeter 블록
eval(sliceDev('function _vfSetTabPool(pool,tab){', 'const _VP_TABS=')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('function _swOn(){', '// ── DEV MODE BOOTSTRAP ──')
       .replace(/^(?:const|let) /gm,'var '));

const V=(ref,book,tags,d)=>({idx:0,cat:'주일예배',topic:'',krText:ref+' 본문',ref,book,tags:tags||[],hi:'',d:d||'2026-09-14',pid:'',kind:''});
const P=(pid,ref,book,tags,d)=>Object.assign(V(ref,book,tags,d),{pid,kind:'prop',krText:pid});

// ═══ 1. 알약 — 그 타일의 목록 전체가 밑 목록이 된다 ═══
console.log('시나리오 1 — 성경 타일: 알약과 제목 문');
{
  VERSES=[V('마태복음 5:13','마태복음',['소금']),P('P1','마태복음 5:14','마태복음',['소금']),
          V('시편 1:1','시편',['복'])];
  _SW_TILES=[{k:'book',s:0,p:0}];
  const it=_swStrip(_SW_TILES[0]);
  _SW_TILES[0].p=it.findIndex(x=>x.kind==='val'&&x.v.name==='마태복음');
  _swTileOpen(0);
  sc.eq('목록은 그 성경 둘', NAV.map(v=>v.ref), ['마태복음 5:13','마태복음 5:14']);
  sc.eq('제목은 성경 이름', NAVLABEL, '마태복음');
  sc.eq('알약의 밑 목록이 섰다 (말씀+명제 둘 다)', (_vfTabPool||[]).length, 2);
  sc.eq('처음 갈래는 함께', _vpFullTab, 'all');
  sc.eq('말씀 갈래만', _vfTabList('verse').map(v=>v.ref), ['마태복음 5:13']);
  sc.eq('명제 갈래만', _vfTabList('prop').map(v=>v.pid), ['P1']);
  sc.eq('제목 문은 성경 축 그대로 (롤링피커가 산다)', [_vfNavTile.kind,_vfNavTile.val], ['book','마태복음']);
  sc.eq('타일뷰를 그 목록으로 좁힌다', [..._vfNavTile.refs].sort(), ['P:P1','V:마태복음 5:13']);
  sc.eq('기간이 없으면 머리말도 없다', _vfNavTile.facet, null);
  sc.eq('윗줄을 다시 그렸다', SYNCED>0, true);
}

// ═══ 2. 기간을 걸어 두면 그 말을 타일뷰 머리에 ═══
console.log('\n시나리오 2 — 기간이 걸린 태그 타일');
{
  FILT={period:'month'};
  VERSES=[V('마태복음 5:13','마태복음',['소금'],'2026-09-14'),V('시편 1:1','시편',['소금'],'2026-08-01')];
  _SW_TILES=[{k:'tag',s:0,p:0}];
  const it=_swStrip(_SW_TILES[0]);
  _SW_TILES[0].p=it.findIndex(x=>x.kind==='val'&&x.v.name==='소금');
  _swTileOpen(0);
  sc.eq('기간 안의 것만', NAV.map(v=>v.ref), ['마태복음 5:13']);
  sc.eq('태그 축 그대로', [_vfNavTile.kind,_vfNavTile.val], ['tag','소금']);
  sc.eq('기간 말을 함께 적는다', _vfNavTile.facet, ['이번 달']);
  FILT={period:'all'};
}

// ═══ 3. 축이 없는 타일은 목록 그대로 ═══
console.log('\n시나리오 3 — 설교·저장 같은 타일은 받은 목록 그대로');
{
  VERSES=[V('요한복음 3:16','요한복음',[],'2026-09-14'),P('P2','요한복음 3:17','요한복음',[],'2026-09-14')];
  _SW_TILES=[{k:'recent',s:0,p:0}];
  const it=_swStrip(_SW_TILES[0]);
  _SW_TILES[0].p=Math.max(0,it.findIndex(x=>x.kind==='val'));
  _swTileOpen(0);
  sc.eq('그날 그 설교가 열린다', (NAV||[]).length, 2);
  sc.eq('목록 그대로 갈래', _vfNavTile&&_vfNavTile.kind, 'list');
  sc.eq('그 목록을 들고 간다', _vfNavTile.pool.map(v=>v.ref), NAV.map(v=>v.ref));
  sc.eq('최근 설교는 기간을 안 보니 머리말도 없다', _vfNavTile.facet, null);
  sc.eq('알약도 선다', _vpFullTab, 'all');

  // 하나뿐인 목록도 머리를 세운다 — 예전엔 둘 이상일 때만 세워 알약도 문도 없었다
  _swOpenVerse(VERSES[0],[VERSES[0]],0,'오늘의 말씀');
  sc.eq('하나뿐이어도 제목', NAVLABEL, '오늘의 말씀');
  sc.eq('하나뿐이어도 제목 문', [_vfNavTile.kind,_vfNavTile.val], ['list','오늘의 말씀']);
  sc.eq('하나뿐이어도 알약', _vpFullTab, 'all');
}

// ═══ 4. 타일뷰 — 'list' 갈래는 받은 목록을 그대로 보여 준다 ═══
console.log('\n시나리오 4 — 타일뷰의 목록 갈래');
{
  var _vgState={kind:'list',val:'주일예배',tab:'all',listPool:null,limitRefs:null,limitKind:null};
  var _VLIST_KIND_TITLE={like:'♥'};
  var _VL_TABS=[['all','함께'],['verse','말씀'],['prop','명제']];
  function _vgRawPool(){return [V('엉뚱한 말씀 1:1','창세기')];}
  function _vgMatch(){return true;}
  function _aggEntriesForKind(){return [];}
  eval(sliceDev('function _vgFilteredPool(allTabs){', '// 기본 목록이 무엇인지'));
  eval(sliceDev('function _vgTab(){', 'function vgSetTab('));
  _vgState.listPool=[V('요한복음 3:16','요한복음'),P('P2','요한복음 3:17','요한복음')];
  sc.eq('받은 목록 그대로 (모음 전체에서 다시 고르지 않는다)', _vgFilteredPool().map(v=>v.ref), ['요한복음 3:16','요한복음 3:17']);
  _vgState.tab='prop';
  sc.eq('갈래 탭도 먹는다', _vgFilteredPool().map(v=>v.pid), ['P2']);
  sc.eq('알약 밑 목록은 갈래를 안 거른다', _vgFilteredPool(true).length, 2);
  _vgState.listPool=null;
  sc.eq('목록이 없으면 빈 타일뷰', _vgFilteredPool(true), []);
}

// ═══ 5. 소스에 고정 — 문을 오가는 길 ═══
console.log('\n시나리오 5 — 타일뷰와 전체화면을 오가도 목록이 따라간다');
{
  const og=sliceDev('function openVerseGrid(kind,val,cardId,limitRefs,listPool){', 'function _vgScrollToVerse');
  sc.eq('다른 갈래면 목록을 비운다',
        og.includes("_vgState.listPool=(kind==='list'&&Array.isArray(listPool))?listPool.slice():null;"), true);
  const nav=sliceDev('function vfOpenNavTile(){', 'function _vfSyncTopBar');
  sc.eq('제목 문이 목록을 타일뷰로 넘긴다',
        nav.includes('openVerseGrid(_vfNavTile.kind,_vfNavTile.val,null,_vfNavTile.refs||null,_vfNavTile.pool||null);'), true);
  sc.eq('알약에서 고른 갈래를 타일뷰가 잇는다',
        nav.includes('if(_vpFullTab&&_vgTab()!==_vpFullTab)vgSetTab(_vpFullTab);'), true);
  const pick=sliceDev('function vgPick(i){', '// 우상단 정렬 컨트롤');
  sc.eq('타일뷰에서 다시 전체화면으로 갈 때도 목록을 들고 간다',
        pick.includes('pool:_vgState.listPool||null};'), true);
  sc.eq('타일뷰에서 연 전체화면도 알약을 세운다',
        pick.includes('_vfSetTabPool(_vgSort(_vgFilteredPool(true)),_vgTab());'), true);
}

// ═══ 6. 제목 문을 실제로 눌러 본다 ═══
console.log('\n시나리오 6 — 제목을 누르면 그 목록의 타일뷰 · 갈래까지');
{
  let GRID=null,TAB=null;
  global.closeVfKeepSwitch=()=>{};
  global.openVerseGrid=(k,v,c,r,p)=>{GRID={k,v,r,p};_vgState.tab='all';};
  global.vgSetTab=t=>{TAB=t;_vgState.tab=t;};
  global._vgRenderTabs=()=>{};
  eval(sliceDev('function vfOpenNavTile(){', 'function _vfSyncTopBar'));
  const pool=[V('요한복음 3:16','요한복음')];
  _vfNavTile={kind:'list',val:'주일예배',pool,facet:['이번 달']};
  _vpFullTab='verse';
  vfOpenNavTile();
  sc.eq('목록 그대로 갈래로 연다', [GRID.k,GRID.v], ['list','주일예배']);
  sc.eq('목록을 넘긴다', GRID.p, pool);
  sc.eq('머리말도 얹는다', _vgState.facetVals, ['이번 달']);
  sc.eq('알약이 말씀이면 타일뷰도 말씀', TAB, 'verse');
  TAB=null;_vpFullTab='all';
  vfOpenNavTile();
  sc.eq('함께면 갈래를 건드리지 않는다', TAB, null);
}

sc.done();
