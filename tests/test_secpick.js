// 구간 판 — 옮길 시간 구간 고르기 (v26-0917-1, HB 요청)
//
// HB — "어느 시간구간에 무슨 할일이 있어서 그 개수인지 궁금하다. 그리고 지금은
//       누르면 원래 있던 구간으로만 들어가는데, 다른 구간으로 넣고 싶을 때가 많다."
//
// 이 파일이 못 박는 것 넷:
//   ① 설정을 꺼 두면 **예전과 글자 하나 다르지 않다** (구간을 안 주면 원래 구간으로)
//   ② 개수 · 색 점 · 판의 목록이 **같은 잣대**로 센다 (미완료만) — 어긋나면 숫자가 거짓말이 된다
//   ③ 세는 일도 보여주는 일도 **읽기 전용** — 없는 날짜를 만들면 빈 날이 쌓이고 동기화가 따라 움직인다
//   ④ 안내 문구의 조사 ('오후로' / '오전으로')
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const MENU  = slice('<!-- Task move mini menu -->', '<!-- (date input now lives inline');
const SECSF = slice('function _dayTaskSecs(', '// 메뉴 줄 오른쪽 끝에 그 개수를 적는다');
const CNTF  = slice('function _dayTaskCount(', '// 그 날짜에 할일이 있는 구간들');
const TASKF = slice('function _daySecTasks(', '// 판에 세울 구간들');
const PICKS = slice('function _secPickSecs(', '// 줄 하나가 뜻하는 목적지');
const SPECF = slice('function _secPickSpecFor(', 'function _secPickRender(');
const EURO  = slice("// '오전으로' · '오후로'", '// ─ Toast ─');
const LABEL = slice("// '내일로' · '내일 오후로'", '// 복제된 할일은');
const MOVE  = slice('function moveTaskTo(days,toSec)', "// '내일로' · '내일 오후로'");

console.log('시나리오 1 — 목적지 줄마다 어디로 가는지 적혀 있다');
{
  const acts = [...MENU.matchAll(/data-act="(move|dup)"/g)].map(m => m[1]);
  sc.eq('이동 5줄 · 복제 5줄', {move:acts.filter(a=>a==='move').length, dup:acts.filter(a=>a==='dup').length},
    {move:5, dup:5});
  // 날짜 지정 두 줄은 달력이 먼저다 — 날짜를 알아야 그 날 구간을 보여줄 수 있다
  sc.eq('날짜 지정 두 줄은 달력 먼저', (MENU.match(/data-when="pick"/g)||[]).length, 2);
  sc.eq('오늘 다른 구간으로 줄', MENU.includes('id="todaySecRow"'), true);
  sc.eq('그 줄은 설정과 무관하게 판을 연다',
    /id="todaySecRow"[\s\S]{0,200}data-secpick="always"/.test(MENU), true);
  sc.eq('그 줄은 이동 칸 안에 있다',
    MENU.indexOf('>이동</div>') < MENU.indexOf('id="todaySecRow"') &&
    MENU.indexOf('id="todaySecRow"') < MENU.indexOf('>복제</div>'), true);
  // 로고 메뉴와 같은 짜임 — 본체와 판이 형제로 나란히
  sc.eq('메뉴 본체를 감쌌다', MENU.includes('id="taskMenuMain"'), true);
  sc.eq('판 상자가 있다', MENU.includes('id="secPickBoard"'), true);
}

console.log('\n시나리오 2 — 개수 · 색 점 · 판이 같은 잣대로 센다 (미완료만)');
{
  const SECS=[{id:'am',name:'오전',color:'#1'},{id:'pm',name:'오후',color:'#2'},{id:'night',name:'밤',color:'#3'}];
  const ST={vis:['am','pm','night'],days:{
    '2026-09-18':{
      big:{am:[{text:'보고서',done:false},{text:'끝난 것',done:true},{text:'   '}],
           pm:[{text:'치과',done:false}]},
      small:{pm:[{text:'약국',done:false}]}}
  }};
  const count=new Function('ST','SECS',`${CNTF}; return _dayTaskCount;`)(ST,SECS);
  const secs =new Function('ST','SECS',`${SECSF}; return _dayTaskSecs;`)(ST,SECS);
  const tasks=new Function('ST','SECS',`${TASKF}; return _daySecTasks;`)(ST,SECS);

  sc.eq('그 날 전체 개수', count('2026-09-18'), 3);
  sc.eq('점이 찍히는 구간', secs('2026-09-18').map(s=>s.id), ['am','pm']);
  sc.eq('구간별 합이 전체와 같다',
    secs('2026-09-18').reduce((n,s)=>{const t=tasks('2026-09-18',s.id);return n+t.bigs.length+t.smalls.length;},0),
    count('2026-09-18'));
  sc.eq('완료·빈 줄은 안 센다', tasks('2026-09-18','am').bigs.map(b=>b.text), ['보고서']);
  sc.eq('빅과 스몰을 갈라서 준다',
    {b:tasks('2026-09-18','pm').bigs.length, s:tasks('2026-09-18','pm').smalls.length}, {b:1,s:1});
  sc.eq('없는 날은 조용히 0', count('2026-09-30')+secs('2026-09-30').length, 0);
  sc.eq('없는 날 구간도 빈 목록', tasks('2026-09-30','am'), {bigs:[],smalls:[]});

  // ③ 읽기 전용 — 이게 이 시나리오의 핵심이다
  sc.eq('없는 날짜를 만들지 않는다', Object.keys(ST.days), ['2026-09-18']);
  sc.eq('세는 코드가 getBigs 를 쓰지 않는다',
    /getBigs|getSmalls/.test(CNTF+SECSF+TASKF), false);
}

console.log('\n시나리오 3 — 판에 세울 구간');
{
  const SECS=[{id:'dawn',name:'새벽'},{id:'am',name:'오전'},{id:'pm',name:'오후'}];
  const mk=vis=>new Function('ST','SECS',`${PICKS}; return _secPickSecs;`)({vis},SECS);
  sc.eq('화면에 보이는 구간만', mk(['am','pm'])('am').map(s=>s.id), ['am','pm']);
  // 사용자가 그 구간을 꺼 뒀더라도, 지금 할일이 있는 구간은 보여줘야
  // "그냥 누르면 어디로 가는지" 를 판이 말해 줄 수 있다
  sc.eq('숨겨 둔 구간에 있던 할일이면 그 구간을 맨 앞에',
    mk(['am','pm'])('dawn').map(s=>s.id), ['dawn','am','pm']);
  sc.eq('보이는 구간이면 끼워 넣지 않는다', mk(['am','pm'])('pm').map(s=>s.id), ['am','pm']);
}

console.log('\n시나리오 4 — 줄 하나가 뜻하는 목적지');
{
  const spec=new Function('tKey','addDays','viewDate',`${SPECF}; return _secPickSpecFor;`)
    ((d)=>'K'+d,(_,n)=>n,0);
  const row=(act,days)=>({dataset:{act,cntDays:String(days)}});
  sc.eq('이동 · 내일', spec(row('move',1)), {act:'move',days:1,toKey:'K1',label:'이동 · 내일'});
  sc.eq('복제 · 어제', spec(row('dup',-1)), {act:'dup',days:-1,toKey:'K-1',label:'복제 · 어제'});
  sc.eq('이동 · 오늘', spec(row('move',0)).label, '이동 · 오늘');
  sc.eq('이동 · 다음 주', spec(row('move',7)).label, '이동 · 다음 주');
  sc.eq('날짜를 모르는 줄은 null', spec({dataset:{act:'move'}}), null);
}

console.log('\n시나리오 5 — 안내 문구와 조사');
{
  const euro=new Function(`${EURO}; return _euroRo;`)();
  sc.eq('받침 없음 → 로', euro('오후'), '로');
  sc.eq('ㄹ 받침 → 로', euro('서울'), '로');
  sc.eq('ㄴ 받침 → 으로', euro('오전'), '으로');
  sc.eq('ㅁ 받침 → 으로', euro('밤'), '으로');
  sc.eq('ㄱ 받침 → 으로', euro('저녁'), '으로');
  sc.eq('한글이 아니면 로', euro('Gym'), '로');

  const SECS=[{id:'am',name:'오전'},{id:'pm',name:'오후'},{id:'night',name:'밤'}];
  const label=new Function('SECS','_euroRo',`${LABEL}; return _moveLabel;`)(SECS,euro);
  // 구간을 따로 고르지 않았으면 예전 문구 그대로 — 여기가 ① 이다
  sc.eq('구간을 안 골랐으면 예전 그대로', label(1,'am',null), '내일로');
  sc.eq('같은 구간이면 이름을 안 붙인다', label(1,'am','am'), '내일로');
  sc.eq('다른 구간이면 이름을 붙인다', label(1,'am','pm'), '내일 오후로');
  sc.eq('받침 있는 구간', label(1,'pm','night'), '내일 밤으로');
  sc.eq('어제·오늘·다음 주도', [label(-1,'am','pm'),label(0,'am','pm'),label(7,'am','pm')],
    ['어제 오후로','오늘 오후로','다음 주 오후로']);
}

console.log('\n시나리오 6 — 구간을 안 주면 예전 그대로 옮긴다');
{
  const run=(toSec)=>{
    const today={am:[{text:'세금',done:false,manualCarryCount:1}],pm:[]};
    const tomo ={am:[],pm:[]};
    const calls=[];
    const days={'오늘':today,'내일':tomo};
    const getBigs=(k,s)=>days[k][s];
    const fn=new Function('_taskMenuCtx','tKey','addDays','viewDate','getBigs','getSmalls',
      'beforeSave','save','renderSecBody','updateTotal','refreshTaskViewsLive','closeTaskMenu',
      '_toastWithJump','_movedTaskCopy','_moveLabel',
      `${MOVE}; return moveTaskTo;`)(
      {type:'big',secId:'am',idx:0},(d)=>d||'오늘',(_,n)=>n===1?'내일':'오늘','오늘',
      getBigs,getBigs,
      ()=>calls.push(['before']),()=>calls.push(['save']),(s)=>calls.push(['render',s]),
      ()=>{},()=>{},()=>calls.push(['close']),
      (msg,key,mark)=>calls.push(['toast',msg,key,mark]),
      (it)=>({text:it.text,done:false}),
      (d,f,t)=>t&&t!==f?`내일 ${t}로`:'내일로');
    fn(1,toSec);
    return {today,tomo,calls};
  };
  const plain=run(undefined);
  sc.eq('구간을 안 주면 원래 구간(am)으로', {am:plain.tomo.am.length,pm:plain.tomo.pm.length}, {am:1,pm:0});
  sc.eq('원본 자리에서는 빠진다', plain.today.am.length, 0);
  sc.eq('예전 문구 그대로', plain.calls.at(-1)[1], '내일로 이동했어요');

  const picked=run('pm');
  sc.eq('구간을 주면 그 구간(pm)으로', {am:picked.tomo.am.length,pm:picked.tomo.pm.length}, {am:0,pm:1});
  sc.eq('문구에 구간이 붙는다', picked.calls.at(-1)[1], '내일 pm로 이동했어요');
  sc.eq('도착지 반짝임도 고른 구간을 가리킨다', picked.calls.at(-1)[3].secId, 'pm');

  // 같은 날 같은 구간 = 갈 곳이 없다. 목록 맨 아래로 자리만 바뀌면 안 된다.
  const noop=(()=>{
    const today={am:[{text:'세금',done:false}],pm:[]};
    const calls=[];
    const fn=new Function('_taskMenuCtx','tKey','addDays','viewDate','getBigs','getSmalls',
      'beforeSave','save','renderSecBody','updateTotal','refreshTaskViewsLive','closeTaskMenu',
      '_toastWithJump','_movedTaskCopy','_moveLabel',`${MOVE}; return moveTaskTo;`)(
      {type:'big',secId:'am',idx:0},()=>'오늘',()=>'오늘','오늘',(k,s)=>today[s],(k,s)=>today[s],
      ()=>calls.push(['before']),()=>calls.push(['save']),()=>{},()=>{},()=>{},
      ()=>calls.push(['close']),()=>calls.push(['toast']),(it)=>it,()=>'');
    fn(0,'am');
    return {today,calls};
  })();
  sc.eq('오늘 같은 구간은 건드리지 않는다', noop.today.am.map(x=>x.text), ['세금']);
  sc.eq('저장도 안내도 하지 않는다', noop.calls.map(c=>c[0]), ['close']);
}

console.log('\n시나리오 7 — 네 길이 모두 구간을 받는다');
{
  const four = [
    ['이동',           slice('function moveTaskTo(days,toSec)', "// '내일로' · '내일 오후로'")],
    ['복제',           slice('function duplicateTaskTo(days,toSec)', '// 메뉴가 열릴 때마다')],
    ['이동(날짜 지정)', slice('function moveTaskToPickedDate(dateStr,toSec)', "// 복제 칸의 '날짜 지정'")],
    ['복제(날짜 지정)', slice('function duplicateTaskToPickedDate(dateStr,toSec)', '// "8월 17일 월요일')],
  ];
  four.forEach(([name,src])=>{
    sc.eq(`${name} — 안 주면 원래 구간`, /const destSec=toSec\|\|secId;/.test(src), true);
    sc.eq(`${name} — 받는 쪽은 destSec`, /getBigs\([^)]*,destSec\)/.test(src), true);
    // 같은 날 다른 구간으로 옮기면 두 구간이 다 화면에 있다 — 둘 다 다시 그려야 한다
    sc.eq(`${name} — 두 구간 모두 다시 그린다`, /renderSecBody\(destSec\)/.test(src), true);
  });
  // 달력이 먼저, 판이 그 다음
  const mp=four[2][1], dp=four[3][1];
  sc.eq('이동 날짜 지정은 날짜부터', /toSec===undefined&&_secPickOn\(\)/.test(mp), true);
  sc.eq('복제 날짜 지정도 날짜부터', /toSec===undefined&&_secPickOn\(\)/.test(dp), true);
}

console.log('\n시나리오 8 — 설정과 여는 방법');
{
  sc.eq('처음 쓰는 사람은 꺼져 있다', /moveSecPicker:false/.test(SRC), true);
  sc.eq('파워 등급에서만 보인다',
    /data-lv="p">[\s\S]{0,400}옮길 구간 고르기/.test(SRC), true);
  sc.eq('스위치가 설정에 이어져 있다',
    SRC.includes("updateSetting('moveSecPicker',this.checked)"), true);
  sc.eq('설정창을 열 때 상태를 맞춘다',
    SRC.includes("setMoveSecPicker').checked=!!s.moveSecPicker"), true);

  const wire = slice('function _wireSecPickRows(', '// 길게 누르면 판');
  sc.eq('PC 는 올리면 뜬다 (설정 ON)', wire.includes('row.onmouseenter'), true);
  sc.eq('설정이 꺼져 있어도 우클릭으로 부른다', wire.includes('row.oncontextmenu'), true);
  sc.eq('손가락은 설정이 켜졌을 때만 탭으로 열린다',
    /_isTouchDevice\(\)\|\|!_secPickOn\(\)\)return;/.test(wire), true);
  sc.eq('줄에 박힌 onclick 보다 먼저 가로챈다 (캡처 단계)',
    /addEventListener\('click',[\s\S]*?\},true\);/.test(wire), true);
  const lp = slice('function _attachSecPickLongPress(', "// '오전으로' · '오후로'");
  sc.eq('길게 누르면 판 (설정과 무관)', lp.includes('LONG_PRESS_TOUCH'), true);
  sc.eq('이어지는 합성 click 을 막는다', lp.includes('e.preventDefault()'), true);
}

console.log('\n시나리오 9 — 여는 방식은 로고 메뉴와 같다');
{
  const open = slice('function _secPickOpen(spec,rowEl)', 'function _secPickOpenFromRow(');
  sc.eq('손가락 기기는 그 자리에서 바뀐다',
    open.includes("main.style.display='none'"), true);
  sc.eq('PC 는 오른쪽에 띄운다 (같은 클래스를 쓴다)',
    open.includes("board.classList.add('task-menu-sub-float')"), true);
  sc.eq('오른쪽이 좁으면 왼쪽으로', open.includes('left=r.left-bw-6'), true);
  sc.eq('메뉴 높이는 재서 넣는다 (화면 밖으로 흘러내리지 않게)',
    open.includes('_menuFitHeight'), true);
  sc.eq('판이 떠 있으면 ESC 는 되돌아가기부터',
    SRC.includes("['taskMenu',        ()=>{if(_secPickSpec){_secPickBack();return;}closeTaskMenu();}]"), true);

  sc.eq('지금 있는 구간은 두 번만 숨 쉬고 멈춘다',
    /\.secpick-row\.here\.beat\{animation:secpickHere [\d.]+s ease-in-out 2;\}/.test(SRC), true);
  sc.eq('개수 옆 색 점', /\.task-menu-dot\{[^}]*border-radius:50%/.test(SRC), true);
  sc.eq('판 안의 목록은 두 줄까지', /\.secpick-items\{[^}]*-webkit-line-clamp:2/.test(SRC), true);
}

sc.done();
