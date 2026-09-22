// Sweeter — '말씀 모음' 타일 (v26-0919-4)
//
// HB 의 실제 데이터는 모음이 여럿이다 (내가 만든 것 · 교회에서 구독한 것).
// 이 타일은 그 모음들을 이름과 개수로 보여 주고, 누르면 **그 모음의 말씀만**
// 전체화면에서 돌게 한다.
//
// ⚠️ 가장 조심한 곳: 눌렀을 때 그 모음의 말씀을 골라내는 자리다.
//    장절(ref)로 다시 찾으면 **같은 장절이 여러 모음에 있을 때 엉뚱한 모음
//    것을 집는다.** ACTIVE_VERSES() 가 켜진 모음을 차례대로 이어 붙인다는
//    성질을 되짚어 자른다 — 시나리오 3 이 그것을 지킨다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT='sweeter';
global.document={getElementById:()=>null,querySelector:()=>null,addEventListener:()=>{}};
global.window={addEventListener:()=>{}};
let TOAST='';function showToast(m){TOAST=m;}

// ── 모음 흉내 ──
let COLLS={},ACTIVE=[];
function getActiveColls(){return ACTIVE;}
function _collLabel(id){return id==='nav180'?'네비게이토 180':((COLLS[id]||{}).name||'말씀 모음');}
function _collFilteredVerses(id){return (COLLS[id]||{}).verses||[];}
function ACTIVE_VERSES(){
  const out=[];let i=0;
  ACTIVE.forEach(id=>_collFilteredVerses(id).forEach(v=>out.push(Object.assign({idx:++i},v))));
  return out;
}
// 나머지 타일이 쓰는 것들 — 이 시험에서는 빈 값이면 된다
function _flatSimpleEntries(){return [];}
function _flatMemEntries(){return [];}
function getLikeLog(){return {};} function getMemLog(){return {};}
function getDeeperLog(){return {};} function getEvenDeeperLog(){return {};}
function getShareLog(){return {};} function getKeepLog(){return {};}
function _aggByRef(){return [];}
function _findVerseByRefLoose(){return null;}
function _booksOf(){return [];} function _bibleRankOfRef(){return 0;}
function _calKey(){return '2026-09-19';}
function _keepEntries(){return [];}
function _tagartPick(){return null;} function _tagartSvg(){return '';}
function _tagartStyle(){return 'minimal';}
let ST={settings:{}};function save(){}
let _vfOverrideVerse=null,NAV=null,NAVIDX=-1,NAVLABEL='',OPENED=null;
function setVerseIdx(i){OPENED=i;}
function openVerseFull(){}
function _vfSetNav(list,idx,label){NAV=list;NAVIDX=idx;NAVLABEL=label;}

// 진짜 코드를 떠온다
eval(sliceDev('function _swOn(){', '// ── DEV MODE BOOTSTRAP ──')
       .replace(/^(?:const|let) /gm,'var '));

const V=(ref,cat)=>({cat:cat||'설교',topic:'',krText:ref+' 본문',ref,tags:[],hi:'',d:'',pid:'',kind:''});
function setup(){
  COLLS={
    vc1:{name:'내 모음',verses:[V('요 3:16'),V('시 1:1'),V('롬 8:28')]},
    vc2:{name:'가나다 교회',verses:[V('빌 4:13'),V('요 3:16')]},   // 요 3:16 이 겹친다
    vc3:{name:'하늘 교회',verses:[]}
  };
  ACTIVE=['vc1','vc2','vc3'];
  _SW_TILES=[{k:'coll',s:0,p:0}];
}

// ═══ 1. 켜 둔 모음이 이름과 개수로 온다 ═══
console.log('시나리오 1 — 모음 목록');
{
  setup();
  const a=_swColls(0);
  sc.eq('모음 셋', a.length, 3);
  sc.eq('말씀 많은 순이 기본', a.map(x=>x.name), ['내 모음','가나다 교회','하늘 교회']);
  sc.eq('개수도 함께', a.map(x=>x.n), [3,2,0]);
  const b=_swColls(1);
  sc.eq('이름순으로도 선다', b.map(x=>x.name), ['가나다 교회','내 모음','하늘 교회']);
  // v26-0922-6, HB — 칩 이름이 "전달력이 약하다" 하여 고쳤다
  sc.eq('정렬 이름 두 가지', _SW_TYPES.coll.sorts, ['많은 순','가나다']);
}

// ═══ 2. 세는 단위 — '모음 3' 으로 센다 ═══
// ⚠️ v26-0921-9 부터 **제목 칸이 없다** (HB — 첫 칸이 곧 첫 내용). 개수는
//    타일 아랫줄(_swCountText)로 옮겼고, 첫 칸에는 첫 모음이 바로 나온다.
console.log('\n시나리오 2 — 세는 단위');
{
  setup();
  const html=_swCellHTML(_SW_TILES[0],_swStrip(_SW_TILES[0]),0);
  sc.eq('첫 칸은 곧 첫 모음', /내 모음/.test(html), true);
  sc.eq('제목 칸은 없다', /말씀 모음/.test(html), false);
  sc.eq("아랫줄은 '모음 3' 이라고 센다", _swCountText('coll',3), '모음 3');
  sc.eq('설교·권·가지로 세지 않는다',
        /편의 설교|\d권|가지/.test(_swCountText('coll',3)), false);
}

// ═══ 3. ⚠️ 누르면 그 모음의 말씀만 (겹치는 장절이 있어도) ═══
console.log('\n시나리오 3 — 그 모음 몫만 잘라낸다');
{
  setup();
  const t=_SW_TILES[0],it=_swStrip(t);
  const cut=name=>_swVersesFor(t,it.find(x=>x.kind==='val'&&x.v.name===name));

  const mine=cut('내 모음');
  sc.eq('내 모음은 셋', mine.map(v=>v.ref), ['요 3:16','시 1:1','롬 8:28']);
  const ch=cut('가나다 교회');
  sc.eq('교회 모음은 둘', ch.map(v=>v.ref), ['빌 4:13','요 3:16']);
  // 겹치는 '요 3:16' — 장절로 찾았다면 둘 다 첫 모음 것을 집었을 것이다
  sc.eq('겹친 장절은 제 모음 것을 집는다', ch[1].idx, 5);
  sc.eq('내 모음 쪽 요 3:16 은 첫 번째', mine[0].idx, 1);
  sc.eq('빈 모음은 빈 목록', cut('하늘 교회'), []);
}

// ═══ 4. 빈 모음을 누르면 왜 비었는지 말해 준다 ═══
console.log('\n시나리오 4 — 빈 모음');
{
  setup();
  const t=_SW_TILES[0];
  t.p=_swStrip(t).findIndex(x=>x.kind==='val'&&x.v.name==='하늘 교회');
  TOAST='';NAV=null;
  _swTileOpen(0);
  sc.eq('전체화면을 열지 않는다', NAV, null);
  sc.eq('까닭을 알려 준다', TOAST, '그 말씀들을 찾지 못했어요');
}

// ═══ 5. 말씀이 있는 모음을 누르면 그 목록으로 돈다 ═══
console.log('\n시나리오 5 — 눌러서 열기');
{
  setup();
  const t=_SW_TILES[0];
  t.p=_swStrip(t).findIndex(x=>x.kind==='val'&&x.v.name==='가나다 교회');
  NAV=null;NAVLABEL='';
  _swTileOpen(0);
  sc.eq('그 모음의 말씀으로 돈다', NAV.map(v=>v.ref), ['빌 4:13','요 3:16']);
  sc.eq('첫 번째부터', NAVIDX, 0);
  sc.eq('띠 이름은 모음 이름', NAVLABEL, '가나다 교회');
}

// ═══ 6. 켠 모음이 없으면 (기본 내장만) ═══
console.log('\n시나리오 6 — 네비게이토 180 만 켜 있을 때');
{
  setup();
  COLLS={};ACTIVE=['nav180'];
  COLLS.nav180={name:'네비게이토 180',verses:[V('창 1:1'),V('출 20:3')]};
  const a=_swColls(0);
  sc.eq('한 줄', a.map(x=>x.name), ['네비게이토 180']);
  sc.eq('개수', a[0].n, 2);
  // 제목 칸이 없어졌으므로 첫 모음은 **0번 칸**이다 (v26-0921-9)
  const t={k:'coll',s:0,p:0};
  sc.eq('눌러도 제 말씀이 나온다',
        _swVersesFor(t,_swStrip(t)[0]).map(v=>v.ref), ['창 1:1','출 20:3']);
}

// ═══ 7. 기본 타일 차례에 들어 있다 ═══
console.log('\n시나리오 7 — 처음 켰을 때 놓인다');
{
  sc.eq('기본 차례에 있다', _SW_DEFAULT_TILES.indexOf('coll')>=0, true);
  // 이미 타일을 저장해 둔 기기 — 차례는 그대로 두고, **새로 생긴 타일만**
  // 한 번 앞에 끼워 준다 (v26-0922-1, 판 번호 _SW_TILES_V).
  // ⚠️ 이것이 없으면 새 타일은 이미 쓰고 있는 기기에서 영영 ＋ 줄에만 있다.
  ST={settings:{swTiles:[{k:'last',s:0}]}};
  sc.eq('새 타일을 한 번 끼워 준다', _swLoadTiles().map(t=>t.k),
        ['today','insight','need','ask','rhythm','last']);
  sc.eq('판 번호를 적어 둔다', ST.settings.swTilesV, _SW_TILES_V);
  // 판 번호가 적혀 있으면 다시 끼우지 않는다 (사용자가 끈 것을 되살리지 않는다)
  ST={settings:{swTiles:[{k:'last',s:0}],swTilesV:_SW_TILES_V}};
  sc.eq('두 번 끼우지 않는다', _swLoadTiles().map(t=>t.k), ['last']);
  _SW_TILES=[{k:'last',s:0}];
  sc.eq('＋ 줄에 나온다', _swSpareKinds().indexOf('coll')>=0, true);
}

sc.done();
