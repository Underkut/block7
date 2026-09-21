// Sweeter 홈 — PC 자판으로 오가기 (v26-0921-12, HB)
//
// 이 화면이 지켜야 하는 것 세 가지.
//  ① **손가락만 쓰는 사람의 화면은 한 칸도 달라지지 않는다.** 자판을 쓰기 전
//     (_SW_KB === -1) 에는 어떤 타일에도 표시(.sw-kb)가 붙지 않는다.
//  ② **좌/우는 타일 안, 위/아래는 타일 간.** 좌/우가 옆쓸기의 짝이라는 것이
//     이 배치의 전부다 — 바뀌면 폰에서 익힌 손이 PC 에서 헛돈다.
//  ③ **판 위에 다른 화면이 떠 있으면 자판을 받지 않는다.** 전체화면에서 ← 를
//     눌렀는데 뒤에 깔린 타일의 값이 넘어가면 안 된다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 아주 작은 가짜 DOM ────────────────────────────────────
function mkCls(){
  const set=new Set();
  return {add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c),
          toggle:(c,on)=>{if(on)set.add(c);else set.delete(c);},_set:set};
}
let SCROLLED=null;
function mkTile(rect,add){
  return {classList:mkCls(),dataset:(add===undefined?{swi:'0'}:{swadd:add}),
          style:{},innerHTML:'',
          getBoundingClientRect:()=>rect,
          scrollIntoView:()=>{SCROLLED=rect;}};
}
let TILES=[];
const BOARD={classList:mkCls(),style:{setProperty(){}},
  getClientRects:()=>[{}],
  querySelectorAll:s=>s.indexOf('data-swi')>=0?TILES.filter(t=>t.dataset.swi!==undefined):TILES,
  querySelector:()=>null,appendChild(){},addEventListener(){},scrollTop:0};
let AUTH_SHOWN=false, OPEN_MODALS={};
global.document={
  getElementById:id=>{
    if(id==='swBoard')return BOARD;
    if(id==='authScreen')return AUTH_SHOWN?{_shown:true}:null;
    if(OPEN_MODALS[id])return OPEN_MODALS[id];
    return null;
  },
  querySelector:()=>null,addEventListener:()=>{}};
global.window={addEventListener:()=>{},matchMedia:()=>({matches:false})};
global.localStorage={_d:{},getItem(k){return this._d[k]||null;},setItem(k,v){this._d[k]=v;}};
let TOAST='';
function showToast(m){TOAST=m;}
// ESC 표 — 진짜를 떠온다 (자판 차단이 이 표를 되쓴다)
eval(sliceDev('const _ESC_CLOSERS=[','function _escShown(').replace(/^const /m,'var '));
function _escShown(el){return !!(el&&el._shown);}
// 팝업이 위에 떴는지 보는 판정도 진짜를 떠온다 (블럭7·스위터가 같이 쓴다)
eval(sliceDev('function _kbOverlayOpen(', "document.addEventListener('keydown'"));
function closeSwKbHelp(){const m=OPEN_MODALS.swKbHelpModal;if(m){m.style.display='none';m._shown=false;}}

// ── Sweeter 블록 떠오기 ───────────────────────────────────
let APP_PRODUCT='sweeter';
let LIKE={},MEM={},DEEP={},EVEN={},SHARE={};
function getLikeLog(){return LIKE;} function getMemLog(){return MEM;}
function getDeeperLog(){return DEEP;} function getEvenDeeperLog(){return EVEN;}
function getShareLog(){return SHARE;}
function ACTIVE_VERSES(){return [];}
function getActiveColls(){return [];}
let ST={settings:{}};
function save(){}
function _calKey(){return '2026-09-21';}
function _findVerseByRefLoose(){return null;}
function _tagartPick(){return null;} function _tagartSvg(){return '';}
function _tagartStyle(){return 'minimal';}
function _flatMemEntries(){return [];}
function _flatSimpleEntries(){return [];}
function _aggByRef(){return [];}
function _lsk(n){return 'sw7_'+n;}
function _collLabel(){return '';} function _collFilteredVerses(){return [];}
function _booksOf(){return [];} function _bibleRankOfRef(){return 0;}
function _reactKey(v){return v.ref;}
function openKeepPicker(){KEEP_PICKED++;}
let KEEP_PICKED=0;
eval(sliceDev('function _swOn(){','// ── DEV MODE BOOTSTRAP ──')
       .replace(/^(?:const|let) /gm,'var '));

// 그리기는 가짜로 — 이 테스트가 보는 것은 '어디를 보고 있는가' 와 '무엇이 바뀌었나' 다
let RENDERS=0, REPAINTS=[];
_swRender=function(){RENDERS++;_swKbSync();};
_swRepaint=function(i){REPAINTS.push(i);_swKbSync();};
let OPENED=[];
_swTileOpen=function(i){OPENED.push(i);};
let STRIP={};                       // 타일마다 값이 몇 개인지 (가짜)
_swStrip=function(t){const n=STRIP[t.k]===undefined?3:STRIP[t.k];
                     return Array.from({length:n},()=>({kind:'val',v:{}}));};

// 판을 짠다: 넓은 타일 하나(한 줄) + 보통 타일 넷(두 줄)
function board(){
  TILES=[mkTile({top:0,bottom:100,left:0,right:200}),      // 0 — wide
         mkTile({top:110,bottom:210,left:0,right:98}),     // 1
         mkTile({top:110,bottom:210,left:102,right:200}),  // 2
         mkTile({top:220,bottom:320,left:0,right:98}),     // 3
         mkTile({top:220,bottom:320,left:102,right:200})]; // 4
  TILES.forEach((t,i)=>{t.dataset.swi=String(i);});
  _SW_TILES=[{k:'last',s:0,p:0},{k:'keep',s:0,p:0},{k:'coll',s:0,p:0},
             {k:'recent',s:0,p:0},{k:'book',s:0,p:0}];
  _SW_EDIT=false;_SW_KB=-1;STRIP={};
  RENDERS=0;REPAINTS=[];OPENED=[];TOAST='';SCROLLED=null;
  OPEN_MODALS={};AUTH_SHOWN=false;
  _swKbSync();
}
const K=(key,o)=>Object.assign({key,code:'',shiftKey:false,altKey:false,
                                ctrlKey:false,metaKey:false,target:null},o||{});
const kbOf=()=>TILES.findIndex(t=>t.classList.contains('sw-kb'));

// ═══ 1. 자판을 쓰기 전에는 화면이 그대로다 ═══
console.log('시나리오 1 — 손가락만 쓰는 화면은 한 칸도 안 달라진다');
{
  board();
  sc.eq('아무 타일에도 표시가 없다', kbOf(), -1);
  sc.eq('_SW_KB 는 -1 에서 시작한다', _SW_KB, -1);
  // 첫 화살표는 '자리를 잡는' 것까지만 한다 — 값이 곧바로 넘어가지 않는다
  sc.eq('첫 ← 는 받아들인다', _swBoardKey(K('ArrowLeft')), true);
  sc.eq('첫 칸에 자리를 잡는다', kbOf(), 0);
  sc.eq('값은 아직 안 넘어갔다', _SW_TILES[0].p, 0);
  sc.eq('처음 한 번은 안내를 띄운다', /단축키/.test(TOAST), true);
  TOAST='';
  _SW_KB=-1;_swKbSync();
  _swBoardKey(K('ArrowDown'));
  sc.eq('안내는 한 번뿐이다', TOAST, '');
}

// ═══ 2. 타일 간 — 위/아래는 '화면에 놓인 자리'로 잰다 ═══
console.log('\n시나리오 2 — 위/아래는 줄을 따라 움직인다');
{
  board();
  _swKbSet(1);                        // 둘째 줄 왼쪽
  _swBoardKey(K('ArrowDown'));
  sc.eq('아래 — 같은 열(왼쪽)로 내려간다', kbOf(), 3);
  _swBoardKey(K('ArrowUp'));
  sc.eq('위 — 제자리로 올라온다', kbOf(), 1);
  _swBoardKey(K('ArrowUp'));
  sc.eq('넓은 타일은 한 줄을 통째로 받는다', kbOf(), 0);
  _swBoardKey(K('ArrowUp'));
  sc.eq('맨 위에서 더 가지 않는다 (고무줄)', kbOf(), 0);
  _swKbSet(4);
  _swBoardKey(K('ArrowDown'));
  sc.eq('맨 아래에서도 제자리', kbOf(), 4);
  // Home · End
  _swBoardKey(K('Home'));  sc.eq('Home — 첫 타일', kbOf(), 0);
  _swBoardKey(K('End'));   sc.eq('End — 마지막 타일', kbOf(), 4);
  sc.eq('옮길 때 화면 안으로 끌어온다', SCROLLED!==null, true);
}

// ═══ 3. 타일 안 — 좌/우는 옆쓸기의 짝 ═══
console.log('\n시나리오 3 — 좌/우는 타일 안의 값을 넘긴다');
{
  board();
  _swKbSet(0);                        // 값 3개짜리
  _swBoardKey(K('ArrowRight'));
  sc.eq('→ 다음 값', _SW_TILES[0].p, 1);
  sc.eq('그 타일만 다시 그린다', REPAINTS, [0]);
  sc.eq('⭐ 타일은 그대로다 (옆으로 안 간다)', kbOf(), 0);
  _swBoardKey(K('ArrowRight'));
  _swBoardKey(K('ArrowRight'));
  sc.eq('끝에서는 더 안 넘어간다', _SW_TILES[0].p, 2);
  _swBoardKey(K('ArrowLeft',{shiftKey:true}));
  sc.eq('Shift+← 첫 값으로', _SW_TILES[0].p, 0);
  _swBoardKey(K('ArrowRight',{shiftKey:true}));
  sc.eq('Shift+→ 마지막 값으로', _SW_TILES[0].p, 2);
  // 값이 하나뿐인 타일에서는 갇히지 않고 옆 타일로 간다
  STRIP={keep:1,coll:1};
  _swKbSet(2);                        // 둘째 줄 오른쪽, 값 1개
  _swBoardKey(K('ArrowLeft'));
  sc.eq('⭐ 넘길 값이 없으면 옆 타일로', kbOf(), 1);
  _swBoardKey(K('ArrowRight'));
  sc.eq('되돌아온다', kbOf(), 2);
}

// ═══ 4. 열기 · 정렬 · 저장 ═══
console.log('\n시나리오 4 — 손 안 대고 하는 일');
{
  board();
  _swKbSet(1);
  _swBoardKey(K('Enter'));
  sc.eq('Enter — 지금 값을 전체화면으로', OPENED, [1]);
  _swBoardKey(K(' '));
  sc.eq('Space 도 같다', OPENED, [1,1]);
  const was=_SW_TILES[1].s;
  _swBoardKey(K('s',{code:'KeyS'}));
  sc.eq('S — 정렬이 한 칸 넘어간다', _SW_TILES[1].s!==was, true);
  sc.eq('정렬을 바꾸면 첫 값부터', _SW_TILES[1].p, 0);
  // ⚠️ 한글 자판이 켜져 있어도 같은 글쇠라야 한다 — e.key 가 아니라 e.code 로 본다
  const before=_SW_TILES[1].s;
  _swBoardKey(K('ㄴ',{code:'KeyS'}));
  sc.eq('⭐ 한글 자판에서도 S 는 S 다', _SW_TILES[1].s!==before, true);
  // 조합키가 눌린 것은 우리 것이 아니다 (브라우저·OS 단축키)
  sc.eq('Ctrl 조합은 건드리지 않는다', _swBoardKey(K('s',{code:'KeyS',ctrlKey:true})), false);
  sc.eq('Meta 조합도 마찬가지', _swBoardKey(K('ArrowDown',{metaKey:true})), false);
}

// ═══ 5. 편집 중 ═══
console.log('\n시나리오 5 — 편집 중에는 좌/우가 타일을 옮긴다');
{
  board();
  _swKbSet(1);
  _SW_EDIT=true;
  _swBoardKey(K('ArrowRight'));
  sc.eq('편집 중 → 는 옆 타일로 (값은 안 넘어간다)', kbOf(), 2);
  sc.eq('값은 그대로', _SW_TILES[2].p, 0);
  const order=()=>_SW_TILES.map(t=>t.k).join(',');
  const had=order();
  _swBoardKey(K('ArrowRight',{shiftKey:true}));
  sc.eq('Shift+→ 차례를 한 자리 뒤로',
        order(), 'last,keep,recent,coll,book');
  sc.eq('옮긴 타일을 계속 보고 있다', _SW_KB, 3);
  _swBoardKey(K('ArrowLeft',{shiftKey:true}));
  sc.eq('Shift+← 되돌린다', order(), had);
  // 끄기
  _swKbSet(4);
  _swBoardKey(K('Delete'));
  sc.eq('Delete — 그 타일이 꺼진다', _SW_TILES.length, 4);
  // ＋칸에서 Enter 면 켠다
  TILES.push(mkTile({top:330,bottom:430,left:0,right:98},'tag'));
  delete TILES[TILES.length-1].dataset.swi;
  _swKbSet(TILES.length-1);
  _swBoardKey(K('Enter'));
  sc.eq('＋칸에서 Enter — 그 타일을 켠다',
        _SW_TILES[_SW_TILES.length-1].k, 'tag');
  sc.eq('켠 타일을 이어서 본다', _SW_KB, _SW_TILES.length-1);
}

// ═══ 6. 판 위에 다른 화면이 떠 있으면 받지 않는다 ═══
console.log('\n시나리오 6 — 위에 뜬 화면이 먼저다');
{
  board();
  _swKbSet(0);
  // 전체화면(verseFull)이 떠 있다 — ESC 표에 있는 그 이름이다
  OPEN_MODALS.verseFull={_shown:true,style:{}};
  sc.eq('⭐ 전체화면이 떠 있으면 자판을 안 받는다', _swBoardKey(K('ArrowRight')), false);
  sc.eq('뒤에 깔린 타일의 값이 안 넘어간다', _SW_TILES[0].p, 0);
  OPEN_MODALS={};
  sc.eq('닫으면 다시 받는다', _swBoardKey(K('ArrowRight')), true);
  // 로그인 화면
  AUTH_SHOWN=true;
  sc.eq('로그인 화면이 떠 있으면 안 받는다', _swBoardKey(K('ArrowRight')), false);
  AUTH_SHOWN=false;
  // 글자를 치는 중
  sc.eq('입력칸에 쓰는 중이면 안 받는다',
        _swBoardKey(K('ArrowRight',{target:{tagName:'INPUT'}})), false);
  sc.eq('여러 줄 입력칸도 마찬가지',
        _swBoardKey(K('ArrowRight',{target:{tagName:'TEXTAREA'}})), false);
  sc.eq('그 자리에서 고치는 칸도',
        _swBoardKey(K('ArrowRight',{target:{isContentEditable:true}})), false);
}

// ═══ 7. Esc · Tab · 도움말 ═══
console.log('\n시나리오 7 — 자리를 놓는 길이 있다');
{
  board();
  sc.eq('자리를 안 잡았으면 Tab 은 브라우저의 것', _swBoardKey(K('Tab')), false);
  _swKbSet(0);
  sc.eq('자리를 잡았으면 Tab 이 다음 타일로', _swBoardKey(K('Tab')), true);
  sc.eq('한 칸 갔다', kbOf(), 1);
  _swBoardKey(K('Tab',{shiftKey:true}));
  sc.eq('Shift+Tab 은 거꾸로', kbOf(), 0);
  _swBoardKey(K('Escape'));
  sc.eq('Esc — 자리를 놓는다', kbOf(), -1);
  sc.eq('놓았으면 Tab 은 다시 브라우저의 것', _swBoardKey(K('Tab')), false);
  // 편집 중 Esc 는 '편집 마치기' 가 먼저다
  _swKbSet(0);_SW_EDIT=true;
  let toggled=0; swToggleEdit=function(){toggled++;_SW_EDIT=false;};
  _swBoardKey(K('Escape'));
  sc.eq('편집 중 Esc 는 편집을 마친다', toggled, 1);
  sc.eq('자리는 그대로 남는다', kbOf(), 0);
}

// ═══ 8. 소스가 지켜야 하는 것 ═══
console.log('\n시나리오 8 — 소스에 남겨 둔 약속');
{
  sc.eq('IS_TOUCH 로 막지 않는다 (자판 붙인 아이패드)',
        /function _swBoardKey\(e\)\{[\s\S]{0,400}IS_TOUCH/.test(SRC_DEV), false);
  // ⚠️ v26-0921-13 에서 이 판정을 _kbOverlayOpen() 한 곳으로 모았다 —
  //    블럭7 자판(_b7KbReady)도 같은 것을 본다. 두 벌로 두면 새 팝업이 생길 때
  //    한쪽만 고쳐져 '닫히는데 자판은 뒤로 새는' 자리가 생긴다.
  sc.eq('차단은 한 곳(_kbOverlayOpen)이 맡는다',
        /function _swKbReady\(\)\{[\s\S]{0,300}return !_kbOverlayOpen\(\);/.test(SRC_DEV), true);
  sc.eq('그 한 곳은 ESC 표를 되쓴다',
        /function _kbOverlayOpen\(\)\{[\s\S]{0,400}for\(const\[id,,test\]of _ESC_CLOSERS\)/.test(SRC_DEV), true);
  sc.eq('다시 그린 뒤 표시를 되붙인다',
        /_swSizeCells\(\);\n  _swKbSync\(\);/.test(SRC_DEV), true);
  sc.eq('한 칸만 다시 그릴 때도 되붙인다',
        /_swKbSync\(\);\s+\/\/ className 을 새로 준 자리/.test(SRC_DEV), true);
  sc.eq('이 기기 전용 키는 _lsk 로 만든다',
        SRC_DEV.includes("_lsk('swkbhint')"), true);
  sc.eq('고정 이름 키를 쓰지 않는다',
        /localStorage\.(get|set)Item\('swkbhint'/.test(SRC_DEV), false);
  sc.eq('도움말은 ESC 표에 올라 있다',
        SRC_DEV.includes("['swKbHelpModal',   ()=>closeSwKbHelp()]"), true);
  sc.eq('도움말 × 는 머리줄 안에 있다 (전체가 스크롤되는 팝업)',
        /id="swKbHelpModal"[\s\S]{0,400}modal-x modal-x-inline/.test(SRC_DEV), true);
  sc.eq('× 는 본문과 따로 있어 innerHTML 로 안 지워진다',
        /<div id="swKbHelpBody"><\/div>/.test(SRC_DEV), true);
  sc.eq('자판 표시는 테두리를 새로 두르지 않는다 (안쪽 선 하나)',
        /\.sw-tile\.sw-kb::before\{[^}]*box-shadow:inset/.test(SRC_DEV), true);
  // BLOCK7 은 이 길로 들어오지 못한다 — _swBoardOn() 이 첫 문이다
  sc.eq('BLOCK7 에서는 첫 줄에서 돌아 나간다',
        /function _swKbReady\(\)\{\n  if\(typeof _swBoardOn!=='function'\|\|!_swBoardOn\(\)\)return false;/.test(SRC_DEV), true);
}

sc.done();
