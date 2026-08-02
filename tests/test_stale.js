// 구버전·유휴 기기 덮어쓰기 방어 (v26-0802-1)
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
// ⚠️ eval 안에서 선언된 let/const 는 바깥 스코프에서 보이지 않는다.
// (function 선언만 새어 나온다) 그래서 마지막 입력 시각을 바꾸는 창구는
// 반드시 **같은 eval 안에서** 만들어야 한다.
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
     + '\nglobal.__setTouch = t => { _fbLastTouchTs = t; };');

const clone = o => JSON.parse(JSON.stringify(o));

// ═══ 1. 신고된 사고: 오래 열어둔 데스크탑(구버전, rev 없음)이 폰을 덮어씀 ═══
console.log('시나리오 1 — 구버전 데스크탑의 rev 없는 덮어쓰기 자동 복구');
{
  const phone={days:{
      '2026-07-28':{big:{am:[{text:'주보',done:true}]},small:{},trash:[]},
      '2026-08-01':{big:{am:[{text:'심방',done:false}]},small:{},trash:[]},
      '2026-08-02':{big:{am:[{text:'설교',done:false}]},small:{},trash:[]}},
    settings:{theme:'dark',vCustomFrom:'2026-07-25'},
    verseLikeLog:{'2026-08-02':[{ref:'시 23:1',time:'09:00'}]}};
  const desktopOld={days:{
      '2026-07-28':{big:{am:[{text:'주보',done:false}]},small:{},trash:[]},
      '2026-07-29':{big:{am:[{text:'데스크탑 메모',done:false}]},small:{},trash:[]}},
    settings:{theme:'light',vCustomFrom:'2026-07-01'},
    verseLikeLog:{'2026-07-29':[{ref:'요 3:16',time:'11:00'}]}};
  // 리스너의 복구 경로와 동일: base 없음 + 로컬 우선
  const healed=_fbMerge(null,phone,desktopOld,false);
  sc.eq('폰의 8/1 작업 생존',healed.days['2026-08-01'].big.am[0].text,'심방');
  sc.eq('폰의 8/2 작업 생존',healed.days['2026-08-02'].big.am[0].text,'설교');
  sc.eq('겹치는 날짜는 폰 것(완료 상태 유지)',healed.days['2026-07-28'].big.am[0].done,true);
  sc.eq('데스크탑이 새로 넣은 날짜도 살림',healed.days['2026-07-29'].big.am[0].text,'데스크탑 메모');
  sc.eq('설정도 폰 우선',healed.settings.vCustomFrom,'2026-07-25');
  sc.eq('로그는 양쪽 합집합',Object.keys(healed.verseLikeLog).sort(),['2026-07-29','2026-08-02']);
}

// ═══ 2. 유휴 기기는 충돌에서 진다 (신버전끼리) ═══
console.log('시나리오 2 — 방치된 탭 vs 지금 쓰는 폰');
{
  const base={days:{'2026-08-02':{big:{am:[{text:'설교 준비',done:false}]},small:{},trash:[]}},
              settings:{theme:'dark'}};
  const idleDesktop=clone(base); // 날짜 넘어가며 상태가 조금 흐트러진 방치 탭
  idleDesktop.days['2026-08-02'].big.am[0].text='옛 제목';
  idleDesktop.settings.theme='light';
  const phoneCloud=clone(base);  // 폰이 실제로 한 작업
  phoneCloud.days['2026-08-02'].big.am[0].done=true;
  phoneCloud.settings.theme='sepia';
  const asIdle=_fbMerge(base,idleDesktop,phoneCloud,true);   // 유휴 기기가 커밋
  sc.eq('유휴 기기는 폰 것을 존중(할일)',asIdle.days['2026-08-02'].big.am[0].done,true);
  sc.eq('유휴 기기는 폰 것을 존중(설정)',asIdle.settings.theme,'sepia');
  const asActive=_fbMerge(base,idleDesktop,phoneCloud,false); // 사람이 만지는 중이면
  sc.eq('활성 기기는 자기 편집 유지',asActive.days['2026-08-02'].big.am[0].text,'옛 제목');
}

// ═══ 3. 충돌 아닌 변경은 유휴여도 그대로 살아남는다 ═══
console.log('시나리오 3 — 유휴여도 내 고유 작업은 보존');
{
  const base={days:{},settings:{theme:'dark'}};
  const local=clone(base);
  local.days['2026-08-02']={big:{am:[{text:'유휴기기에서 추가',done:false}]},small:{},trash:[]};
  const cloud=clone(base);
  cloud.settings.theme='light';
  const m=_fbMerge(base,local,cloud,true);
  sc.eq('유휴 기기의 신규 날짜 보존',m.days['2026-08-02'].big.am[0].text,'유휴기기에서 추가');
  sc.eq('상대 설정 변경도 반영',m.settings.theme,'light');
}

// ═══ 4. 유휴 판정 자체 ═══
console.log('시나리오 4 — 유휴 판정');
{
  document.visibilityState='hidden';
  sc.eq('백그라운드면 유휴',_fbDeviceIdle(),true);
  document.visibilityState='visible';
  __setTouch(Date.now());
  sc.eq('방금 만졌으면 활성',_fbDeviceIdle(),false);
  __setTouch(Date.now()-130000);
  sc.eq('2분 넘게 안 만졌으면 유휴',_fbDeviceIdle(),true);
}
sc.done();
