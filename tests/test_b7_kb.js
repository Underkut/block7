// BLOCK7 PC 자판 — 위젯 사이 오가기 · 할일 다루기 (v26-0921-13, HB)
//
// 이 자판이 지켜야 하는 것 네 가지.
//  ⭐① **지금까지의 단축키가 한 글자도 안 바뀐다.** 위젯을 고르기 전에는
//     화살표·Enter 를 우리가 가져가지 않는다 — 가져가면 날짜 이동과 할일 선택이
//     통째로 죽는다.
//   ② 글자를 치는 중이면 아무것도 안 받는다 (v26-0802-5 날짜 사고의 그 자리).
//   ③ 판 위에 팝업이 떠 있으면 안 받는다.
//   ④ **지우기는 하나씩만.** 반복 할일은 "어디까지 지울까"를 먼저 물어야 해서
//     묶어 지울 수 없고, 한 글쇠에 여러 개가 사라지면 안 된다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 DOM ─────────────────────────────────────────────
function mkCls(init){
  const set=new Set(init||[]);
  return {add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c),
          toggle:(c,on)=>{if(on===undefined){set.has(c)?set.delete(c):set.add(c);}
                          else if(on)set.add(c);else set.delete(c);},_set:set};
}
let SCROLLED=null;
function mkW(type,rect){
  return {dataset:{wtype:type},classList:mkCls(),style:{},
          getClientRects:()=>[{}],getBoundingClientRect:()=>rect,
          scrollIntoView:()=>{SCROLLED=type;}};
}
let WIDGETS=[], PANE=null, TABON='tabD', OPEN_MODALS={}, ACTIVE_EL=null;
const BODY={classList:mkCls(['split-d','lay2'])};
let ROWS={};                         // 'big:am:0' → 가짜 줄
let CHK_CLICKS=[];
function mkRow(key){
  return {classList:mkCls(),
    querySelector:s=>s==='.blk-chk'?{click:()=>CHK_CLICKS.push(key)}:null};
}
global.document={
  body:BODY,
  get activeElement(){return ACTIVE_EL;},
  getElementById:id=>{
    if(id==='weeklyPane')return PANE;
    if(OPEN_MODALS[id])return OPEN_MODALS[id];
    return null;
  },
  querySelector:s=>{
    if(s==='.tab.on')return TABON?{id:TABON}:null;
    return null;
  },
  querySelectorAll:s=>{
    if(s.indexOf('.rp-widget')>=0)return WIDGETS;
    if(s==='.kb-wfocus')return WIDGETS.concat(PANE?[PANE]:[]).filter(w=>w.classList.contains('kb-wfocus'));
    return [];
  },
  addEventListener:()=>{}};
global.window={addEventListener:()=>{},matchMedia:()=>({matches:false})};
global.localStorage={_d:{},getItem(k){return this._d[k]||null;},setItem(k,v){this._d[k]=v;}};
let TOAST='';
function showToast(m){TOAST=m;}
function _lsk(n){return 'b7v1_'+n;}
function _swNoMotion(){return true;}
function _swOn(){return false;}
function _swBoardOn(){return false;}
function _swKbHelpOpen(){return !!(OPEN_MODALS.swKbHelpModal&&OPEN_MODALS.swKbHelpModal._shown);}
let HELP=0;
function openSwKbHelp(){HELP++;}
function closeSwKbHelp(){HELP--;}
function _escShown(el){return !!(el&&el._shown);}
eval(sliceDev('const _ESC_CLOSERS=[','function _escShown(').replace(/^const /m,'var '));
eval(sliceDev('function _kbOverlayOpen(', "document.addEventListener('keydown'"));

// ── 할일 쪽 stub ─────────────────────────────────────────
let SECS=[{id:'am'},{id:'pm'}];
let ST={vis:['am','pm']};
let BIGS={am:[{text:'a'},{text:'b'}],pm:[{text:'c'}]};
let SMALLS={am:[{text:'s1'}],pm:[]};
function tKey(){return '2026-09-21';}
function getBigs(k,sec){return BIGS[sec]||[];}
function getSmalls(k,sec){return SMALLS[sec]||[];}
const ACTIVE=new Set();
let _anchorKey=null;
function itemKey(t,s,i){return t+':'+s+':'+i;}
function parseItemKey(k){const[t,s,i]=k.split(':');return{type:t,secId:s,idx:parseInt(i)};}
function buildFlatList(){
  const out=[];
  SECS.filter(s=>ST.vis.includes(s.id)).forEach(sec=>{
    getBigs(0,sec.id).forEach((b,i)=>out.push({type:'big',secId:sec.id,idx:i}));
    getSmalls(0,sec.id).forEach((s,i)=>out.push({type:'small',secId:sec.id,idx:i}));
  });
  return out;
}
function getRowEl(t,s,i){const k=itemKey(t,s,i);return ROWS[k]||(ROWS[k]=mkRow(k));}
function clearActive(){ACTIVE.clear();_anchorKey=null;CLEARED++;}
function setActiveSingle(t,s,i){ACTIVE.clear();ACTIVE.add(itemKey(t,s,i));_anchorKey=itemKey(t,s,i);}
let REFRESHED=0;
function refreshActiveVisuals(){REFRESHED++;}
global.requestAnimationFrame=fn=>fn();
let CLEARED=0;
let MOVED=[];
function moveActiveSelection(d){MOVED.push(d);}
function isAnyInputFocused(){return !!(ACTIVE_EL&&(ACTIVE_EL.tagName==='INPUT'||ACTIVE_EL.tagName==='TEXTAREA'));}
let CALLS=[];
function navigateDate(d){CALLS.push('date'+d);}
function navigateWeek(d){CALLS.push('week'+d);}
function rpChMonth(w,d){CALLS.push('month:'+w+d);}
function vcNav(id,d){CALLS.push('card:'+id+d);}
function vcOpenFull(id){CALLS.push('full:'+id);}
function openInlineInput(sec,kind){CALLS.push('add:'+sec+':'+kind);}
function focusItemInput(t,s,i){CALLS.push('edit:'+itemKey(t,s,i));}
function openTaskMemo(t,s,i){CALLS.push('memo:'+itemKey(t,s,i));}
function _doToggleFlag(t,s,i){CALLS.push('flag:'+itemKey(t,s,i));}
function _doToggleUrgent(t,s,i){CALLS.push('urgent:'+itemKey(t,s,i));}
function _taskDeleteAt(t,s,i){CALLS.push('del:'+itemKey(t,s,i));}
function moveTaskTo(d){CALLS.push('moveTo'+d+':'+JSON.stringify(_taskMenuCtx));}
let _taskMenuCtx=null;

eval(sliceDev('// ══════════════════════════════════════════════════════════\n//  PC 자판 — 위젯 사이 오가기',
              '// Click the row-spacer (B-zone)')
       .replace(/^(?:const|let) /gm,'var ')
       .replace(/document\.addEventListener\('keydown'[\s\S]*$/,''));

// 2단 판: 좌(할일) | 우(달력 · 말씀카드)
function board(){
  WIDGETS=[mkW('todo',      {top:0,  bottom:600,left:0,  right:400}),
           mkW('monthSingle',{top:0,  bottom:280,left:410,right:800}),
           mkW('card#v1',   {top:290,bottom:560,left:410,right:800})];
  PANE=null;
  BODY.classList._set.clear();['split-d','lay2'].forEach(c=>BODY.classList.add(c));
  TABON='tabD';OPEN_MODALS={};ACTIVE_EL=null;
  _KBW=null;ACTIVE.clear();_anchorKey=null;_taskMenuCtx=null;
  CALLS=[];CHK_CLICKS=[];MOVED=[];CLEARED=0;TOAST='';SCROLLED=null;HELP=0;
  ROWS={};
  _kbWSync();
}
const K=(key,o)=>Object.assign({key,code:'',shiftKey:false,altKey:false,
                                ctrlKey:false,metaKey:false,target:null},o||{});
const focused=()=>{const w=WIDGETS.concat(PANE?[PANE]:[]).find(x=>x.classList.contains('kb-wfocus'));
                   return w?w.dataset.wtype:null;};

// ═══ 1. 위젯을 고르기 전에는 예전 그대로다 ═══
console.log('시나리오 1 — ⭐ 예전 단축키를 가져가지 않는다');
{
  board();
  sc.eq('아무 위젯에도 표시가 없다', focused(), null);
  sc.eq('↓ 는 우리 것이 아니다 (할일 선택은 예전 핸들러가 한다)', _b7BoardKey(K('ArrowDown')), false);
  sc.eq('↑ 도', _b7BoardKey(K('ArrowUp')), false);
  sc.eq('← 도 (날짜 이동)', _b7BoardKey(K('ArrowLeft')), false);
  sc.eq('→ 도', _b7BoardKey(K('ArrowRight')), false);
  sc.eq('Enter 도 (할일 고치기)', _b7BoardKey(K('Enter')), false);
  sc.eq('아무것도 안 불렀다', CALLS, []);
  // 조합키는 통째로 남의 것이다 (⌘⇧ 뷰 전환 · ⌘⇧↑↓ 항목 이동)
  sc.eq('⌘ 조합은 안 건드린다', _b7BoardKey(K('ArrowDown',{metaKey:true,shiftKey:true})), false);
  sc.eq('Ctrl 조합도', _b7BoardKey(K('KeyN',{code:'KeyN',ctrlKey:true})), false);
}

// ═══ 2. W — 위젯 사이 ═══
console.log('\n시나리오 2 — W 로 들어가 화살표로 오간다');
{
  board();
  sc.eq('W 를 받는다', _b7BoardKey(K('w',{code:'KeyW'})), true);
  sc.eq('첫 위젯을 고른다', focused(), 'todo');
  sc.eq('처음 한 번은 안내를 띄운다', /단축키/.test(TOAST), true);
  TOAST='';
  _b7BoardKey(K('ArrowRight'));
  sc.eq('→ 옆 컬럼의 위젯으로', focused(), 'monthSingle');
  _b7BoardKey(K('ArrowDown'));
  sc.eq('↓ 같은 컬럼 아래 위젯으로', focused(), 'card#v1');
  _b7BoardKey(K('ArrowUp'));
  sc.eq('↑ 되돌아온다', focused(), 'monthSingle');
  _b7BoardKey(K('ArrowLeft'));
  sc.eq('← 왼쪽 컬럼으로', focused(), 'todo');
  // ⭐ 위/아래는 **같은 컬럼 안에서만** — 옆 컬럼이 ↓ 로 걸리면 판이 뒤죽박죽이
  //    된 것처럼 느껴진다 (실제 3단 브라우저에서 겪었다)
  _b7BoardKey(K('ArrowDown'));
  sc.eq('⭐ 제 컬럼에 아래 위젯이 없으면 제자리', focused(), 'todo');
  _b7BoardKey(K('ArrowUp'));
  sc.eq('위도 마찬가지', focused(), 'todo');
  _b7BoardKey(K('ArrowLeft'));
  sc.eq('맨 왼쪽에서는 차례대로 (마지막 위젯으로 돈다)', focused(), 'card#v1');
  _b7BoardKey(K('w',{code:'KeyW',shiftKey:true}));
  sc.eq('Shift+W 는 거꾸로', focused(), 'monthSingle');
  sc.eq('옮길 때 화면 안으로 끌어온다', SCROLLED!==null, true);
  sc.eq('예전 단축키를 부른 적이 없다', CALLS, []);
  // 안내는 한 번뿐
  _KBW=null;_kbWSync();
  _b7BoardKey(K('w',{code:'KeyW'}));
  sc.eq('안내는 한 번뿐이다', TOAST, '');
}

// ═══ 3. [ ] — 위젯 안 ═══
console.log('\n시나리오 3 — [ ] 는 위젯 안을 넘긴다');
{
  board();
  sc.eq('위젯을 안 골랐으면 [ ] 는 날짜 넘기기',
        [_b7BoardKey(K('[',{code:'BracketLeft'})),CALLS.join()], [true,'date-1']);
  CALLS=[];
  _kbWSet('monthSingle');
  _b7BoardKey(K(']',{code:'BracketRight'}));
  sc.eq('달력 위젯이면 달 넘기기', CALLS, ['month:single1']);
  CALLS=[];
  _kbWSet('card#v1');
  _b7BoardKey(K('[',{code:'BracketLeft'}));
  sc.eq('말씀카드면 카드 넘기기', CALLS, ['card:v1-1']);
  CALLS=[];
  _kbWSet('todo');
  _b7BoardKey(K(']',{code:'BracketRight'}));
  sc.eq('할일 위젯이면 날짜 넘기기', CALLS, ['date1']);
  CALLS=[];
  // 3단 주간뷰 패널도 한 식구다
  PANE=mkW('weekly',{top:0,bottom:600,left:810,right:1200});
  _kbWSet('weekly');
  _b7BoardKey(K(']',{code:'BracketRight'}));
  sc.eq('주간뷰 패널이면 주 넘기기', CALLS, ['week1']);
}

// ═══ 4. Enter · Esc ═══
console.log('\n시나리오 4 — 들어가고 나온다');
{
  board();
  _kbWSet('card#v1');
  _b7BoardKey(K('Enter'));
  sc.eq('말씀카드에서 Enter 는 전체화면', CALLS, ['full:v1']);
  board();
  _kbWSet('todo');
  _b7BoardKey(K('Enter'));
  sc.eq('할일 위젯에서 Enter 는 위젯을 놓는다', focused(), null);
  sc.eq('그리고 첫 할일을 고른다', MOVED, [1]);
  board();
  _kbWSet('monthSingle');
  _b7BoardKey(K('Escape'));
  sc.eq('Esc — 위젯을 놓는다', focused(), null);
  sc.eq('놓았으면 화살표는 다시 예전 것', _b7BoardKey(K('ArrowRight')), false);
  // 주간·월간뷰로 가면 저절로 놓는다
  _kbWSet('monthSingle');
  TABON='tabM';
  sc.eq('월간뷰에서는 안 받는다', _b7BoardKey(K('ArrowRight')), false);
  sc.eq('가면서 위젯도 놓는다', focused(), null);
}

// ═══ 5. 할일 다루기 ═══
console.log('\n시나리오 5 — 할일 등록·편집');
{
  board();
  // 고른 것이 없어도 새 할일은 만들 수 있다 (보이는 첫 구간에)
  _b7BoardKey(K('n',{code:'KeyN'}));
  sc.eq('N — 새 할일', CALLS, ['add:am:big']);
  CALLS=[];
  _b7BoardKey(K('N',{code:'KeyN',shiftKey:true}));
  sc.eq('Shift+N — 작은 할일', CALLS, ['add:am:small']);
  CALLS=[];
  // 고른 항목이 있으면 그 구간에
  ACTIVE.add('big:pm:0');_anchorKey='big:pm:0';
  _b7BoardKey(K('n',{code:'KeyN'}));
  sc.eq('고른 항목이 있으면 그 구간에', CALLS, ['add:pm:big']);
  CALLS=[];
  _b7BoardKey(K('e',{code:'KeyE'}));
  sc.eq('E — 글자 고치기', CALLS, ['edit:big:pm:0']);
  CALLS=[];
  _b7BoardKey(K('m',{code:'KeyM'}));
  sc.eq('M — 메모', CALLS, ['memo:big:pm:0']);
  CALLS=[];
  _b7BoardKey(K('f',{code:'KeyF'}));
  sc.eq('F — 중요 표시', CALLS, ['flag:big:pm:0']);
  CALLS=[];
  _b7BoardKey(K('u',{code:'KeyU'}));
  sc.eq('U — 긴급 표시', CALLS, ['urgent:big:pm:0']);
  CALLS=[];
  // ⚠️ 한글 자판이 켜져 있어도 같은 글쇠라야 한다
  _b7BoardKey(K('ㅁ',{code:'KeyA'}));
  sc.eq('모르는 글쇠는 흘려보낸다', CALLS, []);
  _b7BoardKey(K('ㅍ',{code:'KeyF'}));
  sc.eq('⭐ 한글 자판에서도 F 는 F 다', CALLS, ['flag:big:pm:0']);
  CALLS=[];
  // 완료 토글 — 고른 것 전부. 체크 단추를 그대로 누른다
  ACTIVE.clear();ACTIVE.add('big:am:0');ACTIVE.add('small:am:0');_anchorKey='big:am:0';
  REFRESHED=0;
  _b7BoardKey(K(' '));
  sc.eq('Space — 고른 것 전부를 토글', CHK_CLICKS, ['big:am:0','small:am:0']);
  // ⚠️ 구간을 다시 그리면 고른 표시가 클래스째 날아간다 — 다시 붙여 줘야 한다
  sc.eq('⭐ 토글 뒤에 고른 표시를 다시 그린다', REFRESHED>0, true);
  // 내일로 미루기
  CALLS=[];ACTIVE.clear();ACTIVE.add('big:am:1');_anchorKey='big:am:1';
  _b7BoardKey(K('d',{code:'KeyD'}));
  sc.eq('D — 내일로 (메뉴와 같은 길을 탄다)',
        CALLS, ['moveTo1:{"type":"big","secId":"am","idx":1}']);
  // Esc 는 고른 것을 놓는다
  ACTIVE.add('big:am:0');
  sc.eq('Esc — 고른 것 놓기', _b7BoardKey(K('Escape')), true);
  sc.eq('정말 놓았다', ACTIVE.size, 0);
}

// ═══ 5-2. ⭐ 표시를 켜면 자리가 밀린다 — 고른 자리를 따라 옮긴다 ═══
console.log('\n시나리오 5-2 — ⭐ 중요 표시는 자리를 밀어낸다');
{
  board();
  // 진짜처럼: 중요 표시를 켜면 그 항목이 **맨 위로** 올라간다 (_reorderTaskPriority)
  const real=_doToggleFlag;
  _doToggleFlag=function(t,sec,i){
    real(t,sec,i);
    const arr=BIGS[sec];const[m]=arr.splice(i,1);arr.unshift(m);
  };
  ACTIVE.add('big:am:1');_anchorKey='big:am:1';      // 둘째 할일 'b'
  sc.eq('맨 위로 올라가기 전', BIGS.am.map(x=>x.text).join(), 'a,b');
  _b7BoardKey(K('f',{code:'KeyF'}));
  sc.eq('자리가 밀렸다', BIGS.am.map(x=>x.text).join(), 'b,a');
  sc.eq('⭐ 고른 자리도 따라 옮겼다 (번호를 그대로 두면 남의 할일을 가리킨다)',
        [...ACTIVE], ['big:am:0']);
  sc.eq('표시를 다시 그린다', REFRESHED>0, true);
  // 여러 개 골랐으면 안 한다 — 어느 것부터 올려야 할지가 정해지지 않는다
  CALLS=[];ACTIVE.clear();ACTIVE.add('big:am:0');ACTIVE.add('big:am:1');_anchorKey='big:am:0';
  const took=_b7BoardKey(K('f',{code:'KeyF'}));
  sc.eq('여러 개면 아무것도 안 바꾼다', CALLS, []);
  sc.eq('알려 준다', /하나만/.test(TOAST), true);
  sc.eq('글쇠는 우리가 먹는다', took, true);
  _doToggleFlag=real;
}

// ═══ 6. ⭐ 지우기는 하나씩만 ═══
console.log('\n시나리오 6 — ⭐ 지우기는 하나씩만');
{
  board();
  ACTIVE.add('big:am:0');_anchorKey='big:am:0';
  _b7BoardKey(K('Delete'));
  sc.eq('하나면 지운다', CALLS, ['del:big:am:0']);
  CALLS=[];
  ACTIVE.clear();ACTIVE.add('big:am:0');ACTIVE.add('big:am:1');_anchorKey='big:am:0';
  const took=_b7BoardKey(K('Delete'));
  sc.eq('⭐ 여러 개면 아무것도 안 지운다', CALLS, []);
  sc.eq('대신 알려 준다', /하나만/.test(TOAST), true);
  sc.eq('글쇠는 우리가 먹는다 (브라우저 뒤로가기 방지)', took, true);
  TOAST='';
  sc.eq('Backspace 도 같다',
        [_b7BoardKey(K('Backspace')),CALLS.join()], [true,'']);
  // 미루기도 하나씩만 — 자리가 밀린다
  TOAST='';CALLS=[];
  _b7BoardKey(K('d',{code:'KeyD'}));
  sc.eq('미루기도 여러 개는 안 한다', CALLS, []);
  sc.eq('알려 준다', /하나씩/.test(TOAST), true);
  // 고른 것이 없으면 지울 것도 없다
  ACTIVE.clear();CALLS=[];
  sc.eq('고른 것이 없으면 Delete 는 흘려보낸다', _b7BoardKey(K('Delete')), false);
}

// ═══ 7. 안 받아야 하는 자리 ═══
console.log('\n시나리오 7 — 안 받아야 하는 자리');
{
  board();
  ACTIVE_EL={tagName:'INPUT'};
  sc.eq('⭐ 글자를 치는 중이면 안 받는다 (v26-0802-5 날짜 사고)',
        _b7BoardKey(K('n',{code:'KeyN'})), false);
  sc.eq('W 도 안 받는다', _b7BoardKey(K('w',{code:'KeyW'})), false);
  ACTIVE_EL=null;
  sc.eq('입력칸이 target 이어도',
        _b7BoardKey(K('n',{code:'KeyN'},{})), true);   // target 이 null 이면 받는다
  CALLS=[];
  sc.eq('그 자리에서 고치는 칸이면 안 받는다',
        _b7BoardKey(K('n',{code:'KeyN',target:{isContentEditable:true}})), false);
  // 팝업이 위에 떠 있으면
  OPEN_MODALS.taskMenu={_shown:true,style:{}};
  sc.eq('⭐ 팝업이 떠 있으면 안 받는다', _b7BoardKey(K('w',{code:'KeyW'})), false);
  OPEN_MODALS={};
  // 1단(폰 폭)에서는 위젯이라는 것이 없다
  BODY.classList.remove('lay2');
  sc.eq('1단에서 W 는 받되 알려만 준다', _b7BoardKey(K('w',{code:'KeyW'})), true);
  sc.eq('위젯을 고르지 않는다', focused(), null);
  sc.eq('까닭을 말해 준다', /2단/.test(TOAST), true);
}

// ═══ 8. 단축키 표 ═══
console.log('\n시나리오 8 — ? 단축키 표');
{
  board();
  sc.eq('? 로 연다', [_b7BoardKey(K('?')),HELP], [true,1]);
  OPEN_MODALS.swKbHelpModal={_shown:true,style:{}};
  sc.eq('떠 있으면 ? 로 닫는다', [_b7BoardKey(K('?')),HELP], [true,0]);
  OPEN_MODALS.swKbHelpModal._shown=true;HELP=1;
  sc.eq('Esc 로도 닫는다', [_b7BoardKey(K('Escape')),HELP], [true,0]);
  OPEN_MODALS={};
}

// ═══ 9. 소스에 남겨 둔 약속 ═══
console.log('\n시나리오 9 — 소스에 남겨 둔 약속');
{
  sc.eq('⭐ 캡처 단계로 붙인다 (마스터 핸들러가 먼저 등록되어 있다)',
        /_b7BoardKey\(e\)\)\{[\s\S]{0,120}\n\},true\);/.test(SRC_DEV), true);
  sc.eq('막을 때는 전파까지 끊는다',
        /_b7BoardKey[\s\S]{0,200}e\.stopPropagation\(\);/.test(SRC_DEV), true);
  sc.eq('다시 그린 뒤 표시를 되붙인다',
        /_rollStart\(\);\n  if\(typeof _kbWSync==='function'\)_kbWSync\(\);/.test(SRC_DEV), true);
  sc.eq('⭐ 위젯은 번호가 아니라 이름으로 기억한다',
        /let _KBW=null;/.test(SRC_DEV), true);
  sc.eq('이 기기 전용 키는 _lsk 로 만든다', SRC_DEV.includes("_lsk('b7kbhint')"), true);
  sc.eq('고정 이름 키를 쓰지 않는다', /localStorage\.(get|set)Item\('b7kbhint'/.test(SRC_DEV), false);
  sc.eq('스위터에서는 첫 줄에서 돌아 나간다',
        /function _b7KbReady\(\)\{\n  if\(typeof _swOn==='function'&&_swOn\(\)\)return false;/.test(SRC_DEV), true);
  sc.eq('단축키 표는 두 제품이 한 팝업을 나눠 쓴다',
        /function _kbHelpRows\(\)\{[\s\S]{0,200}return sw\?_SWKB_HELP:_B7KB_HELP;/.test(SRC_DEV), true);
  sc.eq('위젯 표시는 테두리를 새로 두르지 않는다 (안쪽 선 하나)',
        /\.kb-wfocus::after\{[^}]*box-shadow:inset/.test(SRC_DEV), true);
  // 완료 토글은 체크 단추를 그대로 눌러야 한다 — 완료 효과·하위 따라가기가 그 안에 있다
  sc.eq('⭐ done 을 직접 뒤집지 않는다',
        /function _kbToggleDone\(\)\{[\s\S]{0,400}\.done=/.test(SRC_DEV), false);
  sc.eq('체크 단추를 그대로 누른다',
        /function _kbToggleDone\(\)\{[\s\S]{0,400}querySelector\('\.blk-chk'\)/.test(SRC_DEV), true);
}

sc.done();
