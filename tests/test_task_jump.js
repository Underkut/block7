// 옮기거나 복제한 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB 요청)
//
// HB — "사용자 입장에서는 해당 날짜로 할일 뷰를 전환해서 그 날짜의 할일 목록을
//       확인하고 싶다. 그런데 항상 전환하고 싶은 게 아니라 **머물지 전환할지
//       선택할 수 있어야** 한다."
// 그래서 이 파일이 고정하는 것은 세 가지다:
//   ① 아무것도 안 누르면 화면은 그대로다 — 저 혼자 날짜를 바꾸지 않는다
//   ② '보러 가기' 를 누를 때만 넘어가고, 넘어가면 돌아오는 줄이 뜬다
//   ③ 개수 미리보기는 **없는 날짜를 만들지 않는다** (읽기 전용)
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const LBL   = slice('const _KDOW=', 'function _moveDateToastMsg(');
const JUMP  = slice('function _toastWithJump(', '// 도착한 곳에서 그 할일이');
const FLASH = slice('let _pendingTaskFlash=null;', '// 그 날짜에 이미 있는 할일 개수');
const COUNT = slice('function _dayTaskCount(', '// 메뉴 줄 오른쪽 끝에');
const FILL  = slice('function _fillTaskMenuCounts(', '// ─ Toast ─');

console.log('시나리오 1 — 날짜 이름을 한 곳에서 만든다');
{
  const _dayLabel = new Function(`${LBL}; return _dayLabel;`)();
  sc.eq('긴 이름', _dayLabel('2026-09-20'), '9월 20일 일요일');
  sc.eq('짧은 이름(돌아가기 줄)', _dayLabel('2026-09-04', true), '9월 4일');
  sc.eq('요일을 못 구하면 그 자리만 뺀다', _dayLabel('2026-09-20').includes('일요일'), true);
  sc.eq('이상한 값이 와도 터지지 않는다', typeof _dayLabel('abc'), 'string');
}

console.log('\n시나리오 2 — 안 누르면 머문다 · 누를 때만 넘어간다');
{
  const build = (nowKey) => {
    const log=[];
    const make = new Function('tKey','showToast','goToDate','_dayLabel','_flashPendingTask',
      `${JUMP}; return _toastWithJump;`);
    const fn = make(()=>nowKey,
      (msg,busy,action)=>{log.push({msg,busy,action});},
      (k)=>log.push({goto:k}),
      (d,short)=>short?`짧은${d}`:`긴${d}`,
      ()=>log.push({flash:true}));
    return {fn,log};
  };

  // 같은 날짜로 옮긴 경우 — 갈 곳이 없으니 동작 줄도 없다
  const same=build('2026-09-04');
  same.fn('오늘 안에서 옮겼어요','2026-09-04',{key:'2026-09-04'});
  sc.eq('같은 날짜면 안내만', same.log.length, 1);
  sc.eq('같은 날짜면 동작 줄이 없다', same.log[0].action, undefined);

  const t=build('2026-09-04');
  const mark={key:'2026-09-20',secId:'am',type:'big',idx:2};
  t.fn('9월 20일 일요일 오전 날짜로 복제했어요','2026-09-20',mark);
  sc.eq('안내는 한 번만 뜬다', t.log.length, 1);
  sc.eq('아직 아무 데도 안 갔다', t.log.some(l=>l.goto), false);
  sc.eq("동작 줄은 '보러 가기'", t.log[0].action.label, '보러 가기');

  // 눌렀다
  t.log[0].action.onClick();
  sc.eq('그 날짜로 간다', t.log[1], {goto:'2026-09-20'});
  sc.eq('도착지에서 반짝일 자리를 미리 정한다', globalThis._pendingTaskFlash, mark);
  sc.eq('반짝임을 부른다', t.log.some(l=>l.flash), true);
  const back=t.log[t.log.length-1];
  sc.eq('돌아오는 줄이 뜬다', back.msg, '긴2026-09-20로 왔어요');
  sc.eq('돌아가기 라벨에 원래 날짜', back.action.label, '짧은2026-09-04로 돌아가기');
  back.action.onClick();
  sc.eq('돌아가면 원래 날짜로', t.log[t.log.length-1], {goto:'2026-09-04'});
}

console.log('\n시나리오 3 — 도착한 곳에서 그 할일이 한 번 반짝인다');
{
  const build = (nowKey, found) => {
    const queries=[];
    const el={_c:new Set(),offsetWidth:1,scrolled:null,
      classList:{add(c){el._c.add(c);},remove(c){el._c.delete(c);},contains(c){return el._c.has(c);}}};
    el.scrollIntoView=(o)=>{el.scrolled=o;};
    const doc={querySelector:(s)=>{queries.push(s);return found?el:null;}};
    const make = new Function('tKey','document',
      `${FLASH}; return {flash:_flashPendingTask,set:v=>{_pendingTaskFlash=v;},get:()=>_pendingTaskFlash};`);
    return {api:make(()=>nowKey,doc),queries,el};
  };

  const ok=build('2026-09-20',true);
  ok.api.set({key:'2026-09-20',secId:'am',type:'big',idx:2});
  ok.api.flash();
  sc.eq('빅 할일을 자리로 찾는다',
    ok.queries.some(q=>q.includes('.big-item[data-id="am"][data-i="2"]')), true);
  sc.eq('구역 안에서 먼저 찾는다', ok.queries[0].startsWith('#tb-am '), true);
  sc.eq('반짝임 클래스를 붙인다', ok.el.classList.contains('task-flash'), true);
  sc.eq('보이도록 가운데로 굴린다', ok.el.scrolled, {block:'center',behavior:'smooth'});
  sc.eq('한 번 쓰고 비운다', ok.api.get(), null);

  const sm=build('2026-09-20',true);
  sm.api.set({key:'2026-09-20',secId:'pm',type:'small',idx:0});
  sm.api.flash();
  sc.eq('작은 할일도 찾는다', sm.queries.some(q=>q.includes('.sm-item')), true);

  // 그새 다른 날짜로 가 버렸으면 아무 일도 하지 않는다
  const gone=build('2026-09-21',true);
  gone.api.set({key:'2026-09-20',secId:'am',type:'big',idx:0});
  gone.api.flash();
  sc.eq('날짜가 어긋나면 찾지도 않는다', gone.queries.length, 0);
  sc.eq('예약도 비운다', gone.api.get(), null);

  // 아직 안 그려졌으면 예약을 남겨 두고 다시 본다
  const late=build('2026-09-20',false);
  late.api.set({key:'2026-09-20',secId:'am',type:'big',idx:0});
  late.api.flash();
  sc.eq('못 찾으면 예약을 남겨 둔다', late.api.get()!==null, true);
}

console.log('\n시나리오 4 — 옮기기 전에 그 날 할일이 몇 개인지 보여준다');
{
  const SECS=[{id:'am'},{id:'pm'}];
  const ST={days:{
    '2026-09-05':{big:{am:[{text:'세금',done:false},{text:'끝난 것',done:true},{text:'  '}]},
                  small:{pm:[{text:'전화',done:false}]}},
    '2026-09-06':{big:{},small:{}}
  }};
  const count = new Function('ST','SECS',`${COUNT}; return _dayTaskCount;`)(ST,SECS);
  sc.eq('미완료만 센다 (빅+스몰)', count('2026-09-05'), 2);
  sc.eq('빈 날은 0', count('2026-09-06'), 0);
  sc.eq('아예 없는 날도 0', count('2026-09-30'), 0);
  // ⚠️ 이 검사가 이 시나리오의 핵심이다 — getBigs()/getSmalls() 로 세면 없는 날짜가
  //    **만들어져** 메뉴를 열 때마다 빈 날이 쌓이고 동기화까지 따라 움직인다.
  sc.eq('없는 날짜를 만들지 않는다', Object.keys(ST.days).sort(),
    ['2026-09-05','2026-09-06']);
  sc.eq('세는 코드가 getBigs 를 쓰지 않는다', /getBigs|getSmalls/.test(COUNT), false);
}

console.log('\n시나리오 5 — 개수를 메뉴 줄 오른쪽에 적는다');
{
  const rows=[
    {dataset:{cntDays:'1'},_kids:[]},
    {dataset:{cntDays:'7'},_kids:[]},
    {dataset:{cntDays:'-1'},_kids:[]},
  ];
  rows.forEach(r=>{
    r.querySelector=()=>r._kids[0]||null;
    r.appendChild=(el)=>{r._kids.push(el);};
  });
  const made=[];
  const doc={
    querySelectorAll:(s)=>{made.push(s);return rows;},
    createElement:()=>({className:'',textContent:'',
      classList:{_c:new Set(),toggle(c,on){on?this._c.add(c):this._c.delete(c);},
                 contains(c){return this._c.has(c);}}})
  };
  const counts={'d1':3,'d7':0,'d-1':1};
  const fill = new Function('document','tKey','addDays','viewDate','_dayTaskCount',
    `${FILL}; return _fillTaskMenuCounts;`)(
      doc,(d)=>d,(_,n)=>'d'+n,'today',(k)=>counts[k]);
  fill();
  sc.eq('개수를 붙일 줄만 고른다', made[0], '#taskMenu [data-cnt-days]');
  sc.eq('내일 줄에 3', rows[0]._kids[0].textContent, '3');
  sc.eq('다음 주 줄에 0', rows[1]._kids[0].textContent, '0');
  sc.eq('0 인 날은 옅게', rows[1]._kids[0].classList.contains('zero'), true);
  sc.eq('있는 날은 옅지 않게', rows[0]._kids[0].classList.contains('zero'), false);
  sc.eq('어제 줄에 1', rows[2]._kids[0].textContent, '1');
  fill();
  sc.eq('다시 열어도 칸이 하나뿐', rows[0]._kids.length, 1);
}

console.log('\n시나리오 6 — 메뉴·토스트·반짝임의 겉모습');
{
  const menu = slice('<!-- Task move mini menu -->', '<!-- (date input now lives inline');
  sc.eq('개수를 붙인 줄 다섯 (이동 3 · 복제 2)',
    (menu.match(/data-cnt-days=/g)||[]).length, 5);
  sc.eq('날짜 지정 줄에는 개수를 안 붙인다 (어느 날인지 아직 모른다)',
    menu.slice(menu.indexOf('id="dateLabelRow"'), menu.indexOf('id="dateLabelRow"')+400)
      .includes('data-cnt-days'), false);

  sc.eq('개수 칸 CSS', /\.task-menu-cnt\{[^}]*margin-left:auto/.test(SRC), true);
  sc.eq('동작 줄은 눌리게 살려 둔다 (토스트는 pointer-events:none)',
    /\.toast-act\{[^}]*pointer-events:auto/.test(SRC), true);
  sc.eq('동작 줄에 테두리·박스 없음 (UI 원칙)',
    /\.toast-act\{[^}]*border:none/.test(SRC), true);
  // ⚠️ 할일 줄을 감싸는 .swipe-wrap 이 overflow:hidden 이라 바깥으로 번지는 빛은
  //    통째로 잘린다. 안쪽(inset)으로 그려야 보인다 — 한 번 겪고 고친 자리다.
  sc.eq('반짝임은 안쪽 테두리로 (바깥 빛은 잘린다)',
    /@keyframes taskFlashRing\{[\s\S]*?box-shadow:inset/.test(SRC), true);
  sc.eq('배경색 자체는 건드리지 않는다 (빅·스몰 배경이 다르다)',
    /@keyframes taskFlashRing\{[\s\S]*?background-image:linear-gradient/.test(SRC), true);

  const toast = slice('function showToast(msg,busy,action)', '// 돌아가는 표시');
  sc.eq('동작이 있으면 단추를 그린다', toast.includes("id=\"_toastAct\""), true);
  sc.eq('진행 중 토스트에는 동작 줄을 안 붙인다', toast.includes('const act=(!busy&&action'), true);
  sc.eq('누르면 토스트를 내리고 동작을 실행', toast.includes('_dismissToast(true,true);act.onClick();'), true);
  sc.eq('동작 단추를 누른 것은 닫기가 아니다',
    toast.includes("t0.closest('#_toastAct')"), true);
}

console.log('\n시나리오 7 — 이동·복제 네 길이 모두 같은 안내를 쓴다');
{
  const move = slice('function moveTaskTo(days)', 'function _freshTaskCopy(');
  const movePick = slice('function moveTaskToPickedDate(', '// 복제 칸의 \'날짜 지정\'');
  const dup = slice('function duplicateTaskTo(days)', '// 메뉴가 열릴 때마다');
  const dupPick = slice('function duplicateTaskToPickedDate(', '// "8월 17일 월요일');
  [['이동',move],['이동(날짜 지정)',movePick],['복제',dup],['복제(날짜 지정)',dupPick]]
    .forEach(([name,src])=>{
      sc.eq(`${name} 도 보러 가기를 단다`, src.includes('_toastWithJump('), true);
      sc.eq(`${name} 는 도착 자리를 함께 넘긴다`, /idx:dest\.length-1/.test(src), true);
    });
  sc.eq('옛 안내(showToast 직접 호출)는 남지 않았다',
    [move,movePick,dup,dupPick].some(src=>/showToast\(/.test(src)), false);
}

sc.done();
