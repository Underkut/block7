// 하위 할일(subs) · 메모(memo) — 자료 계층 시나리오.
// CLAUDE.md 규칙: 저장·동기화에 닿는 칸을 새로 만들 때는 tests/ 에 시나리오를
// 먼저 둔다. 이 파일이 지키는 것은 두 가지다 —
//   ① 항목을 **새로 만드는 다섯 길**(복제·이동·자동이월·반복실체·반복미리보기)
//      마다 하위·메모가 어떻게 되는지. 한 곳만 빠져도 그 길로만 사라진다.
//   ② 세 기기가 같은 할일을 만졌을 때 병합이 하위를 지우지 않는지.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };

// 병합기 + 긴급 해제 + 하위·메모 순수 함수
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));
eval(slice('function _clearUrgentOnDone(', '// 긴급 표시 토글 — 메뉴/트리플탭 공용'));
eval(slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──'));
eval(slice('function _subPrune(item){', 'let _subEmptyOpen=null;'));

function clone(o){return JSON.parse(JSON.stringify(o));}
const sub=(t,d)=>({text:t,done:!!d});

// ═══ 시나리오 1: 여러 개를 한 번에 — 쉼표는 내용, 줄바꿈과 중괄호가 구분자 ═══
// HB 2026-09-17: "쉼표는 텍스트 내용 안에 쓸 수 있는데 그걸 못하게 되서 안 될
// 것 같고. '{' 나 '}' 는 어떤가? 줄바꿈은 좋고."
console.log('시나리오 1 — 하위 여러 개 한 번에 쪼개기');
{
  sc.eq('줄바꿈으로 쪼갠다',_subParse('우유\n계란\n빵'),['우유','계란','빵']);
  sc.eq('쉼표는 내용 그대로 남는다',_subParse('계란 2판, 반숙으로'),['계란 2판, 반숙으로']);
  sc.eq('중괄호 조각만 각각 하위가 된다',
    _subParse('{우유}{계란 2판, 반숙}{빵}'),['우유','계란 2판, 반숙','빵']);
  sc.eq('빈 줄·공백 줄은 버린다',_subParse('  \n우유\n\n  \n빵  '),['우유','빵']);
  sc.eq('중괄호가 섞인 줄은 중괄호만 본다',_subParse('장보기 {우유}{빵}'),['우유','빵']);
  sc.eq('빈 중괄호는 버린다',_subParse('{}{우유}'),['우유']);
  sc.eq('아무것도 없으면 빈 배열',_subParse('   '),[]);
  sc.eq('null 도 빈 배열',_subParse(null),[]);
}

// ═══ 시나리오 2: 하위 다 끝나면 부모도 완료, 되돌리면 풀린다 ═══
console.log('시나리오 2 — 부모·하위의 완료가 서로 맞물린다');
{
  const it={text:'장보기',done:false,subs:[sub('우유',true),sub('빵',false)]};
  sc.eq('하나 남았으면 부모는 미완료',(_subSyncParent(it),it.done),false);
  it.subs[1].done=true;
  sc.eq('다 끝나면 부모도 완료',(_subSyncParent(it),it.done),true);
  it.subs[0].done=false;
  sc.eq('하나 풀면 부모도 풀린다',(_subSyncParent(it),it.done),false);

  // 부모를 체크하면 하위도 한꺼번에 (묻지 않는다 — HB)
  const p={text:'장보기',done:true,subs:[sub('우유'),sub('빵')]};
  _subSetAll(p,true);
  sc.eq('부모 체크 → 하위 전부 완료',p.subs.map(s=>s.done),[true,true]);
  _subSetAll(p,false);
  sc.eq('부모 해제 → 하위 전부 해제',p.subs.map(s=>s.done),[false,false]);

  // 하위를 **다 지우면** subs 와 함께 subOpen 도 지운다.
  // ⚠️ subs 만 지우고 subOpen 을 남기면 하위 하나 없는 빈 판이 그대로 떠 있고,
  //    그때는 게이지도 없어(하위 0개면 안 그린다) 접을 손잡이가 사라진다
  //    (2026-09-18 HB 신고 — "그 틀이 남아있고 지우는 방법이 없어").
  const emptied={text:'장보기',done:false,subs:[],subOpen:true};
  _subPrune(emptied);
  sc.eq('다 지우면 subs 키가 사라진다','subs' in emptied,false);
  sc.eq('다 지우면 판도 닫힌다','subOpen' in emptied,false);
  const kept={text:'장보기',done:false,subs:[sub('빵')],subOpen:true};
  _subPrune(kept);
  sc.eq('하나라도 남으면 그대로 둔다',[kept.subs.length,!!kept.subOpen],[1,true]);

  // 하위가 없는 할일은 부모 완료를 건드리지 않는다
  const solo={text:'설교 준비',done:true};
  sc.eq('하위가 없으면 손대지 않는다',(_subSyncParent(solo),solo.done),true);
  sc.eq('하위가 없으면 바뀐 게 없다고 답한다',_subSyncParent(solo),false);
  sc.eq('긴급 표시는 부모 완료와 함께 풀린다',(()=>{
    const u={text:'x',done:false,urgent:true,urgentRank:1,urgentAt:5,subs:[sub('a',true)]};
    _subSyncParent(u);
    return [u.done,u.urgent,u.urgentRank];
  })(),[true,false,null]);   // _clearUrgentOnDone 은 urgent=false, 랭크는 지운다
}

// ═══ 시나리오 3: 항목을 새로 만드는 다섯 길 ═══
// ⚠️ 이 시나리오가 이 파일의 핵심이다. index.html 의 다섯 자리는 전부
//    _carryTaskExtras(원본,사본,keepDone) 한 함수를 지나간다 — 여기서
//    keepDone 두 갈래만 지키면 다섯 길이 함께 지켜진다.
console.log('시나리오 3 — 복제·이동·이월·반복이 하위·메모를 어떻게 다루나');
{
  const src={text:'장보기',done:false,memo:'https://mart.example 02-123-4567',
             subs:[sub('우유',true),sub('빵',false)]};

  // 이동·자동이월 = **같은 할일**이 날짜만 바뀐 것 → 끝낸 하위도 따라간다
  const moved=_carryTaskExtras(src,{text:src.text,done:false},true);
  sc.eq('이동·이월: 하위 개수가 같다',moved.subs.length,2);
  sc.eq('이동·이월: 끝낸 하위도 따라간다 (HB)',moved.subs.map(s=>s.done),[true,false]);
  sc.eq('이동·이월: 메모도 따라간다',moved.memo,src.memo);

  // 복제·반복 = 그 날 **새로 하는 일** → 하위의 완료 표시는 지운다
  const fresh=_carryTaskExtras(src,{text:src.text,done:false},false);
  sc.eq('복제·반복: 하위 글자는 그대로',fresh.subs.map(s=>s.text),['우유','빵']);
  sc.eq('복제·반복: 완료 표시는 처음부터',fresh.subs.map(s=>s.done),[false,false]);
  sc.eq('복제·반복: 메모는 물려받는다',fresh.memo,src.memo);

  // 원본을 건드리지 않는다 (사본이 원본의 배열을 같이 쓰면 한쪽 체크가 둘 다 바뀐다)
  fresh.subs[0].text='두유';
  moved.subs[0].done=false;
  sc.eq('사본은 원본과 배열을 나눠 쓰지 않는다',
    [src.subs[0].text,src.subs[0].done],['우유',true]);

  // 하위·메모가 없으면 **키를 만들지 않는다** — 빈 배열을 넣으면 병합이
  // "상대가 지웠다" 와 "원래 없었다" 를 구분하지 못한다
  const bare=_carryTaskExtras({text:'설교 준비'},{text:'설교 준비',done:false},true);
  sc.eq('하위가 없으면 subs 키를 만들지 않는다','subs' in bare,false);
  sc.eq('메모가 없으면 memo 키를 만들지 않는다','memo' in bare,false);
  const emptyArr=_carryTaskExtras({text:'x',subs:[]},{text:'x',done:false},true);
  sc.eq('빈 배열도 키를 만들지 않는다','subs' in emptyArr,false);
}

// ═══ 시나리오 4: 병합 — 두 기기가 같은 할일을 따로 만졌다 ═══
// ⚠️ 이것이 2026-08-31 사고("사용자가 전부 지웠다"로 읽어 클라우드를 비운 일)의
//    반대편 시험이다. 한쪽이 하위를 모르는(구버전) 기기여도 하위가 살아야 한다.
console.log('시나리오 4 — 병합이 하위·메모를 지우지 않는다');
{
  const base={days:{'2026-09-17':{big:{am:[{text:'장보기',done:false}]},small:{},trash:[]}}};

  // 4-1. 이 기기는 하위를 넣고, 다른 기기는 완료만 체크했다 → 둘 다 산다
  const local=clone(base);
  local.days['2026-09-17'].big.am[0].subs=[sub('우유'),sub('빵')];
  const cloud=clone(base);
  cloud.days['2026-09-17'].big.am[0].flag=true;
  const m=_fbMerge(base,local,cloud);
  const it=m.days['2026-09-17'].big.am[0];
  sc.eq('내가 넣은 하위가 산다',(it.subs||[]).length,2);
  sc.eq('상대가 켠 중요 표시도 산다',it.flag,true);

  // 4-2. 구버전 기기(하위를 모른다)가 완료 체크만 해도 하위는 실려 돌아온다
  const base2={days:{'2026-09-17':{big:{am:[{text:'장보기',done:false,
    subs:[sub('우유',true),sub('빵')],memo:'02-123-4567'}]},small:{},trash:[]}}};
  const old=clone(base2);
  old.days['2026-09-17'].big.am[0].done=true;   // 모르는 칸은 JSON 이 그대로 보존한다
  const m2=_fbMerge(base2,clone(base2),old);
  const it2=m2.days['2026-09-17'].big.am[0];
  sc.eq('구버전 기기의 완료 체크는 반영',it2.done,true);
  sc.eq('하위는 유실되지 않는다',(it2.subs||[]).length,2);
  sc.eq('메모도 유실되지 않는다',it2.memo,'02-123-4567');

  // 4-3. 두 기기가 하위를 각자 체크했다 → 통째로 한쪽을 고른다(없던 하위를
  //      만들지 않는다). 어느 쪽이든 **개수는 줄지 않는다** 는 것이 요점이다.
  const base3={days:{'2026-09-17':{big:{am:[{text:'장보기',done:false,
    subs:[sub('우유'),sub('빵')]}]},small:{},trash:[]}}};
  const l3=clone(base3);l3.days['2026-09-17'].big.am[0].subs[0].done=true;
  const c3=clone(base3);c3.days['2026-09-17'].big.am[0].subs[1].done=true;
  const m3=_fbMerge(base3,l3,c3);
  sc.eq('하위가 섞여 사라지지 않는다',(m3.days['2026-09-17'].big.am[0].subs||[]).length,2);
}

// ═══ 시나리오 5: 메모 안에서 알아보는 것 ═══
console.log('시나리오 5 — 메모에서 주소·전화·이메일·날짜를 알아본다');
{
  const kinds=t=>_memoScan(t).map(h=>h.kind+':'+h.val);
  sc.eq('주소',kinds('자료는 https://block7.my/a?b=1 에 있어요'),
    ['url:https://block7.my/a?b=1']);
  sc.eq('www 로 시작해도 주소',kinds('www.naver.com 참고'),['url:www.naver.com']);
  // ── http:// 없이 적은 웹주소도 알아본다 (HB 2026-09-17) ──
  sc.eq('맨 웹주소',kinds('block7.my 에서 보세요'),['url:block7.my']);
  sc.eq('맨 웹주소 + 경로',kinds('block7.my/index-dev.html 열기'),
    ['url:block7.my/index-dev.html']);
  sc.eq('가운데 - 가 있어도',kinds('my-site.co.kr'),['url:my-site.co.kr']);
  sc.eq('물음표 뒤 값도 함께',kinds('shop.example.com/a?b=1&c=2'),
    ['url:shop.example.com/a?b=1&c=2']);
  sc.eq('한글 조사가 붙어도 주소만 떼어 낸다',kinds('naver.com에서'),['url:naver.com']);
  // ⚠️ 아는 끝(TLD)만 골라 보는 까닭 — 파일 이름을 주소로 읽으면 안 된다
  sc.eq('파일 이름은 주소가 아니다',kinds('보고서.docx 와 index.html 과 check.sh'),[]);
  sc.eq('판 번호도 주소가 아니다',kinds('v1.2.3 을 씁니다'),[]);
  sc.eq('맨 웹주소가 이메일을 삼키지 않는다',kinds('hb@example.com'),['mail:hb@example.com']);
  sc.eq('전화번호',kinds('김집사 010-1234-5678 로 연락'),['tel:010-1234-5678']);
  sc.eq('지역번호도 전화번호',kinds('교회 02-345-6789'),['tel:02-345-6789']);
  sc.eq('이메일',kinds('hb@example.com 으로 보내기'),['mail:hb@example.com']);
  sc.eq('이메일이 주소보다 먼저다',kinds('a.b@www.example.com'),['mail:a.b@www.example.com']);
  sc.eq('날짜 세 가지',kinds('2026-09-20 과 2026.10.1 과 12월 25일'),
    ['date:2026-09-20','date:2026.10.1','date:12월 25일']);
  sc.eq('날짜를 전화번호로 잘못 읽지 않는다',kinds('2026-09-17'),['date:2026-09-17']);
  sc.eq('전화번호를 날짜로 잘못 읽지 않는다',kinds('010-1234-5678'),['tel:010-1234-5678']);
  sc.eq('네 가지가 한 메모에 다 있어도 순서대로',
    kinds('9월 20일 hb@a.com https://a.example 02-345-6789'),
    ['date:9월 20일','mail:hb@a.com','url:https://a.example','tel:02-345-6789']);
  sc.eq('알아볼 게 없으면 빈 배열',_memoScan('그냥 메모입니다'),[]);
  sc.eq('빈 메모도 빈 배열',_memoScan(''),[]);

  // 날짜 → 날짜키. 연도를 안 적었으면 지금 보고 있는 날짜의 해로 읽는다.
  sc.eq('YYYY-MM-DD',_memoDateKey('2026-09-20'),'2026-09-20');
  sc.eq('점 표기·한 자리도 0 을 채운다',_memoDateKey('2026.10.1'),'2026-10-01');
  sc.eq('월·일 표기는 보고 있는 해로',_memoDateKey('12월 25일','2026-09-17'),'2026-12-25');
  sc.eq('공백이 섞여도 읽는다',_memoDateKey('3 월 5 일','2027-01-01'),'2027-03-05');
  sc.eq('못 읽으면 null',_memoDateKey('내일'),null);

  sc.eq('전화 걸 때는 숫자만 남긴다',_memoTelDigits('010-1234-5678'),'01012345678');
  sc.eq('국가번호의 + 는 남긴다',_memoTelDigits('+82 10-1234-5678'),'+821012345678');
}

// ═══ 시나리오 6: 게이지가 세는 수 ═══
console.log('시나리오 6 — 접힌 채로 보는 달성률');
{
  sc.eq('2/5',_subStat({subs:[sub('a',1),sub('b',1),sub('c'),sub('d'),sub('e')]}),{n:5,done:2});
  sc.eq('하위가 없으면 0/0',_subStat({text:'x'}),{n:0,done:0});
  sc.eq('subs 가 배열이 아니면 없는 것으로 본다',_subStat({subs:'우유'}),{n:0,done:0});
  sc.eq('빈 칸이 섞여도 죽지 않는다',_subStat({subs:[null,sub('a',1)]}),{n:2,done:1});
}

// ═══ 시나리오 7: 브라우저에서 실제로 걸렸던 두 가지를 못 박아 둔다 ═══
// 2026-09-17, 크로미움으로 직접 돌려 보다 잡은 것들이다. 둘 다 조용히 틀리는
// 종류라(화면만 보고는 원인을 모른다) 글자로 지켜 둔다.
console.log('시나리오 7 — 실제로 걸렸던 두 가지');
{
  // ① 하위 판은 .swipe-wrap 의 **형제**여야 한다. 자식이면 스와이프 밑판이
  //    판까지 덮고, 드래그 드롭 자리가 판 높이만큼 어긋난다.
  const bigWrap=slice('function makeBigWrap(id,i,b,secColor){','function getCarryCount(item){');
  sc.eq('빅: 판을 조각으로 함께 돌려준다',
    /createDocumentFragment\(\)[\s\S]*frag\.append\(wrap,panel\)/.test(bigWrap),true);
  sc.eq('빅: 줄이 숨겨지면 판도 숨긴다',bigWrap.includes('if(wrap.hidden)panel.hidden=true;'),true);
  const smWrap=slice('function makeSmWrap(id,i,sm,secColor){','function makeSmItem(');
  sc.eq('스몰: 판을 조각으로 함께 돌려준다',
    /createDocumentFragment\(\)[\s\S]*frag\.append\(wrap,panel\)/.test(smWrap),true);
  sc.eq('스몰: 줄이 숨겨지면 판도 숨긴다',smWrap.includes('if(wrap.hidden)panel.hidden=true;'),true);
  // ⚠️ display 를 정해 둔 요소는 [hidden] 만으로 사라지지 않는다 (display 가 이긴다).
  //    이 한 줄이 없으면 '완료한 할일 숨기기' 를 켰을 때 판만 덩그러니 남는다.
  sc.eq('판은 [hidden] 일 때 정말 사라진다',
    SRC.includes('.sub-panel[hidden]{display:none;}'),true);

  // ② 새 하위를 엔터로 넣으면 판이 다시 그려지며 입력칸이 사라지고, 그때 터지는
  //    onblur 가 아직 남은 글자로 한 번 더 넣었다 (하위가 두 벌 생겼다).
  const ghost=slice('function _makeSubGhost(type,secId,idx){','function _subAdd(');
  sc.eq('넣기 전에 칸을 비운다',ghost.indexOf("ta.value='';fit();")<ghost.indexOf('_subAdd('),true);
  sc.eq('두 번 들어오는 것을 막는 빗장이 있다',ghost.includes('if(committing)return;'),true);
  sc.eq('붙여넣기에 줄바꿈이 있으면 바로 쪼갠다',/addEventListener\('paste'/.test(ghost),true);
}

sc.done();
