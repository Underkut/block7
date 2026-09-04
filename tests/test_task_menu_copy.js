// 할일 롱터치 메뉴의 이동·복제 구획과 복제 동작 (v26-0904-1, HB 요청)
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 메뉴를 이동·복제 덩어리로 나눈다');
{
  const menu = slice('<!-- Task move mini menu -->', '<!-- (date input now lives inline');
  const moveTitle = menu.indexOf('>이동</div>');
  const tomorrowMove = menu.indexOf('onclick="moveTaskTo(1)"');
  const weekMove = menu.indexOf('onclick="moveTaskTo(7)"');
  const yesterdayMove = menu.indexOf('onclick="moveTaskTo(-1)"');
  const pickedDate = menu.indexOf('id="dateLabelRow"');
  const copyTitle = menu.indexOf('>복제</div>');
  const tomorrowCopy = menu.indexOf('onclick="duplicateTaskTo(1)"');
  const weekCopy = menu.indexOf('onclick="duplicateTaskTo(7)"');
  const daily = menu.indexOf('id="dailyToggleItem"');

  sc.eq('이동 제목 아래 순서',
    [moveTitle,tomorrowMove,weekMove,yesterdayMove,pickedDate].every(i=>i>=0) &&
      moveTitle < tomorrowMove && tomorrowMove < weekMove && weekMove < yesterdayMove && yesterdayMove < pickedDate,
    true);
  sc.eq('복제 제목 아래 순서',
    [copyTitle,tomorrowCopy,weekCopy].every(i=>i>=0) &&
      pickedDate < copyTitle && copyTitle < tomorrowCopy && tomorrowCopy < weekCopy,
    true);
  sc.eq('매일 반복은 복제 다음 덩어리', daily>=0 && weekCopy < daily, true);
}

console.log('\n시나리오 2 — 복제는 원본을 빼지 않고 모든 상태를 보존한다');
{
  const fn = slice('function duplicateTaskTo(', 'function prepDatePicker(');
  sc.eq('원본 배열에서 제거하지 않는다', fn.includes('.splice('), false);
  sc.eq('할일 객체 전체를 복사한다', fn.includes('const copy={...item};'), true);
  sc.eq('큰 할일 목적 날짜에 추가', fn.includes('getBigs(toKey,secId).push(copy);'), true);
  sc.eq('작은 할일 목적 날짜에 추가', fn.includes('getSmalls(toKey,secId).push(copy);'), true);
  sc.eq('저장 전 되돌리기 지점 생성', fn.indexOf('beforeSave();') < fn.indexOf('.push(copy)'), true);
  sc.eq('복제 후 저장', fn.includes('save();'), true);
}

console.log('\n시나리오 3 — 길어진 메뉴가 작은 화면 안에서 스크롤된다');
{
  sc.eq('할일 메뉴 높이 제한', /#taskMenu\{[^}]*max-height:calc\(100dvh - 16px\)[^}]*overflow-y:auto/.test(SRC), true);
  const open = slice('function openTaskMenu(', '// ═══════ 연락처');
  sc.eq('실제 메뉴 높이로 위치 계산', open.includes('menu.offsetHeight'), true);
}

console.log('\n시나리오 4 — 실제로 내일과 다음 주에 복제해 본다');
{
  const fnSrc = slice('function duplicateTaskTo(', 'function prepDatePicker(');
  const run = (type,days) => {
    const from=[{text:'전화하기',done:true,flag:true,contactTask:true,daily:true,manualCarryCount:2}];
    const to=[];
    const calls=[];
    const getBigs=(key)=>key==='today'?from:to;
    const getSmalls=(key)=>key==='today'?from:to;
    const make = new Function('_taskMenuCtx','tKey','addDays','viewDate','getBigs','getSmalls',
      'beforeSave','save','renderSecBody','updateTotal','refreshTaskViewsLive','closeTaskMenu','showToast',
      `${fnSrc}; return duplicateTaskTo;`);
    const duplicate=make({type,secId:'am',idx:0},d=>d||'today',(_,d)=>d,
      'today',getBigs,getSmalls,...['before','save','render','total','refresh','close','toast']
        .map(name=>(...args)=>calls.push([name,...args])));
    duplicate(days);
    return {from,to,calls};
  };
  const tomorrow=run('big',1);
  sc.eq('내일 복제 뒤 원본이 남는다', tomorrow.from.length, 1);
  sc.eq('내일에 같은 상태의 사본이 생긴다', tomorrow.to[0], tomorrow.from[0]);
  sc.eq('원본과 사본은 서로 다른 객체', tomorrow.to[0]===tomorrow.from[0], false);
  sc.eq('내일 복제 안내', tomorrow.calls.at(-1), ['toast','내일로 복제했어요']);

  const nextWeek=run('small',7);
  sc.eq('다음 주 작은 할일도 복제', nextWeek.to.length, 1);
  sc.eq('다음 주 복제 안내', nextWeek.calls.at(-1), ['toast','다음 주로 복제했어요']);
}

sc.done();
