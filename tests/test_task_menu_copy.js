// 할일 롱터치 메뉴의 이동·복제 구획과 복제 동작
// (v26-0904-1 덩어리 나누기 → v26-0904-2 '날짜 지정' 복제 + 새 할일로 복제, HB 요청)
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const MENU = slice('<!-- Task move mini menu -->', '<!-- (date input now lives inline');
const DUP  = slice('function _freshTaskCopy(', '// 메뉴가 열릴 때마다');

console.log('시나리오 1 — 메뉴를 이동·복제 덩어리로 나눈다');
{
  const moveTitle = MENU.indexOf('>이동</div>');
  const tomorrowMove = MENU.indexOf('onclick="moveTaskTo(1)"');
  const weekMove = MENU.indexOf('onclick="moveTaskTo(7)"');
  const yesterdayMove = MENU.indexOf('onclick="moveTaskTo(-1)"');
  const pickedDate = MENU.indexOf('id="dateLabelRow"');
  const copyTitle = MENU.indexOf('>복제</div>');
  const tomorrowCopy = MENU.indexOf('onclick="duplicateTaskTo(1)"');
  const weekCopy = MENU.indexOf('onclick="duplicateTaskTo(7)"');
  const dateCopy = MENU.indexOf('id="dupDateLabelRow"');
  const daily = MENU.indexOf('id="dailyToggleItem"');

  sc.eq('이동 제목 아래 순서',
    [moveTitle,tomorrowMove,weekMove,yesterdayMove,pickedDate].every(i=>i>=0) &&
      moveTitle < tomorrowMove && tomorrowMove < weekMove && weekMove < yesterdayMove && yesterdayMove < pickedDate,
    true);
  sc.eq('복제 제목 아래 순서 (내일 · 다음 주 · 날짜 지정)',
    [copyTitle,tomorrowCopy,weekCopy,dateCopy].every(i=>i>=0) &&
      pickedDate < copyTitle && copyTitle < tomorrowCopy &&
      tomorrowCopy < weekCopy && weekCopy < dateCopy,
    true);
  sc.eq('매일 반복은 복제 다음 덩어리', daily>=0 && dateCopy < daily, true);
}

console.log('\n시나리오 2 — 복제 세 줄의 아이콘이 서로 다르다 (v26-0904-2, HB 지적)');
{
  // 세 줄이 같은 그림이면 어느 줄인지 눈으로 못 가른다. 뒷장(복제)은 같고
  // 앞의 기호(내일 ▶ · 다음 주 ▶▶ · 날짜 달력)만 다르게 그린다.
  const copyBlock = MENU.slice(MENU.indexOf('>복제</div>'), MENU.indexOf('id="dailyToggleItem"'));
  const icons = [...copyBlock.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]);
  sc.eq('복제 칸 아이콘 3개', icons.length, 3);
  sc.eq('셋 다 서로 다른 그림', new Set(icons).size, 3);
  sc.eq('셋 다 복제를 뜻하는 뒷장을 함께 그린다',
    icons.every(g=>g.includes('M4 13.5H3.4V4.4')), true);
  sc.eq('내일로는 삼각형 하나', (icons[0].match(/v8\.2l6\.6-4\.1z/g)||[]).length, 1);
  sc.eq('다음 주로는 삼각형 둘', (icons[1].match(/v8l4\.8-4z/g)||[]).length, 2);
  sc.eq('날짜 지정은 달력', icons[2].includes('<rect') && icons[2].includes('M7.2 10.2h9.2'), true);
}

console.log('\n시나리오 3 — 복제된 할일은 그날 새로 만든 할일이다 (v26-0904-2, HB 요청)');
{
  sc.eq('원본 배열에서 제거하지 않는다', DUP.includes('.splice('), false);
  sc.eq('통째 복사(스프레드)를 쓰지 않는다', DUP.includes('{...item}'), false);
  sc.eq('새 할일 모양으로 만든다', DUP.includes('const copy={text:item.text,done:false};'), true);
  sc.eq('이월 횟수를 옮기지 않는다', /CarryCount/.test(DUP), false);
  sc.eq('저장 전 되돌리기 지점 생성', DUP.indexOf('beforeSave();') < DUP.indexOf('.push(copy)'), true);
  sc.eq('복제 후 저장', DUP.includes('save();'), true);
}

console.log('\n시나리오 4 — 길어진 메뉴가 작은 화면 안에서 스크롤된다');
{
  sc.eq('할일 메뉴 높이 제한', /#taskMenu\{[^}]*max-height:calc\(100dvh - 16px\)[^}]*overflow-y:auto/.test(SRC), true);
  const open = slice('function openTaskMenu(', '// ═══════ 연락처');
  sc.eq('실제 메뉴 높이로 위치 계산', open.includes('menu.offsetHeight'), true);
}

console.log('\n시나리오 5 — 실제로 내일과 다음 주에 복제해 본다');
{
  const run = (type,days) => {
    const from=[{text:'전화하기',done:true,flag:true,contactTask:true,daily:true,
                 manualCarryCount:2,autoCarryCount:3}];
    const to=[];
    const calls=[];
    const getBigs=(key)=>key==='today'?from:to;
    const getSmalls=(key)=>key==='today'?from:to;
    const make = new Function('_taskMenuCtx','tKey','addDays','viewDate','getBigs','getSmalls',
      'beforeSave','save','renderSecBody','updateTotal','refreshTaskViewsLive','closeTaskMenu','showToast',
      `${DUP}; return duplicateTaskTo;`);
    const duplicate=make({type,secId:'am',idx:0},d=>d||'today',(_,d)=>d,
      'today',getBigs,getSmalls,...['before','save','render','total','refresh','close','toast']
        .map(name=>(...args)=>calls.push([name,...args])));
    duplicate(days);
    return {from,to,calls};
  };
  const tomorrow=run('big',1);
  sc.eq('내일 복제 뒤 원본이 남는다', tomorrow.from.length, 1);
  sc.eq('원본은 하나도 안 바뀐다', tomorrow.from[0],
    {text:'전화하기',done:true,flag:true,contactTask:true,daily:true,manualCarryCount:2,autoCarryCount:3});
  sc.eq('사본은 완료가 풀린 새 할일', tomorrow.to[0],
    {text:'전화하기',done:false,daily:true,flag:true,contactTask:true});
  sc.eq('사본에 이월 표시가 따라오지 않는다',
    'manualCarryCount' in tomorrow.to[0] || 'autoCarryCount' in tomorrow.to[0], false);
  sc.eq('내일 복제 안내', tomorrow.calls.at(-1), ['toast','내일로 복제했어요']);

  const nextWeek=run('small',7);
  sc.eq('다음 주 작은 할일도 복제', nextWeek.to.length, 1);
  sc.eq('다음 주 복제 안내', nextWeek.calls.at(-1), ['toast','다음 주로 복제했어요']);
}

console.log('\n시나리오 6 — 날짜를 골라 복제한다 (v26-0904-2)');
{
  const src = slice('function duplicateTaskToPickedDate(', '// "8월 17일 월요일');
  const from=[{text:'세금 내기',done:true,flag:true,manualCarryCount:5}];
  const to=[];
  const calls=[];
  const make = new Function('_taskMenuCtx','_datePickArmed','tKey','getBigs','getSmalls',
    'beforeSave','save','renderSecBody','updateTotal','refreshTaskViewsLive',
    'closeTaskMenu_keepCtx','showToast','_moveDateToastMsg','_freshTaskCopy',
    `${src}; return duplicateTaskToPickedDate;`);
  const rec=(name)=>(...args)=>{calls.push([name,...args]);};
  const freshCopy=new Function(`${DUP}; return _freshTaskCopy;`)();
  const dup=make({type:'big',secId:'am',idx:0},()=>true,()=>'today',
    (key)=>key==='today'?from:to,(key)=>key==='today'?from:to,
    rec('before'),rec('save'),rec('render'),rec('total'),rec('refresh'),rec('close'),rec('toast'),
    (d,s,verb)=>`${d} ${s} ${verb||'이동'}`,freshCopy);

  dup('2026-09-20');
  sc.eq('원본은 그 자리에 남는다', from.length, 1);
  sc.eq('고른 날짜에 새 할일로 들어간다', to[0], {text:'세금 내기',done:false,flag:true});
  sc.eq('복제라고 안내한다', calls.at(-1), ['toast','2026-09-20 am 복제']);

  // 달력을 연 지 200ms 안에 저 혼자 날아온 change 는 무시한다
  const to2=[];
  const dup2=make({type:'big',secId:'am',idx:0},()=>false,()=>'today',
    (key)=>key==='today'?from:to2,(key)=>key==='today'?from:to2,
    ()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>'',freshCopy);
  dup2('2026-09-20');
  sc.eq('무장 전 change 는 복제하지 않는다', to2.length, 0);
  sc.eq('빈 날짜면 아무 일도 없다', (()=>{const t=[];const d=make({type:'big',secId:'am',idx:0},
    ()=>true,()=>'today',(k)=>k==='today'?from:t,(k)=>k==='today'?from:t,
    ()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>{},()=>'',freshCopy);d('');return t.length;})(), 0);
}

console.log('\n시나리오 7 — 두 날짜 줄이 각각 자기 입력칸에 연결된다');
{
  const open = slice('function openTaskMenu(', '// ═══════ 연락처');
  sc.eq('이동 줄 연결', open.includes("_wireTaskMenuDateRow('dateLabelRow','datePickerInput'"), true);
  sc.eq('복제 줄 연결', open.includes("_wireTaskMenuDateRow('dupDateLabelRow','dupDatePickerInput'"), true);
  const wire = slice('function _wireTaskMenuDateRow(', 'function prepTaskMenuDatePicker(');
  sc.eq('열 때마다 입력칸을 새로 만든다(아이폰 달력 홀짝 문제)',
    wire.includes("document.createElement('input')") && wire.includes('oldInp.replaceWith(inp)'), true);
  sc.eq('줄 클릭으로 달력을 연다', wire.includes('inp.showPicker()'), true);
  sc.eq('두 입력칸의 id 가 다르다',
    MENU.includes('id="datePickerInput"') && MENU.includes('id="dupDatePickerInput"'), true);
}

sc.done();
