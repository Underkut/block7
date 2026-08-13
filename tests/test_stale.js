// 구버전·유휴 기기 덮어쓰기 방어 (v26-0802-1)
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
// ⚠️ eval 안에서 선언된 let/const 는 바깥 스코프에서 보이지 않는다.
// (function 선언만 새어 나온다) 그래서 마지막 입력 시각을 바꾸는 창구는
// 반드시 **같은 eval 안에서** 만들어야 한다.
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
     + '\nglobal.__setTouch = t => { _fbLastTouchTs = t; };'
     + '\nglobal.__setEdit = t => { _fbLastEditTs = t; };'
     + '\nglobal.__setVisibleSince = t => { _fbVisibleSince = t; };'
     + '\nglobal.__getEdit = () => _fbLastEditTs;');

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

// ═══ 화면을 그리며 나는 저장은 '편집'이 아니다 (0813-4) ═══
// ⚠️ 네 번째 사고의 진짜 원인. save() 는 사람이 고칠 때만 오지 않는다 —
//    설정 기본값 채우기·범위 가두기·목록 다시 계산 같은 화면 다듬기도 부른다.
//    그것까지 '편집'으로 세면, 방금 열어 화면만 그린 기기가 유휴에서 빠져나와
//    충돌에서 이겨 다른 기기의 진짜 작업을 밀어냈다. 두 기기가 서로 그러면
//    데이터가 왔다갔다 한다 (HB 가 본 그 증상).
console.log('\n시나리오 — 사람이 만진 저장만 편집으로 센다');
{
  const now = Date.now();
  __setTouch(now);                       // 방금 눌렀다
  sc.eq('누른 직후의 저장은 편집', _fbIsUserEdit(), true);
  __setTouch(now - 10000);               // 10초 전에 만진 뒤 화면만 그리는 중
  sc.eq('한참 전이면 편집이 아니다', _fbIsUserEdit(), false);
  __setTouch(now - 2000);
  sc.eq('3초 안이면 편집', _fbIsUserEdit(), true);
  __setTouch(now - 4000);
  sc.eq('3초 넘으면 아니다', _fbIsUserEdit(), false);

  // 유휴 판정으로 이어지는지 — 받기만 한 기기는 양보해야 한다
  __setVisibleSince(now - 60000);        // 연 지 한참 됐다 (깨우기 유예 지남)
  __setTouch(now - 30000);               // 30초 전에 한 번 만졌다
  __setEdit(0);                          // 그런데 진짜 편집은 없었다
  sc.eq('만지기만 했으면 아직 안 이긴다 (2분 규칙)', _fbDeviceIdle(), false);
  // ⚠️ 위가 false 인 것 자체는 예전 그대로다. 달라진 것은 **화면 다듬기 저장이
  //    _fbLastEditTs 를 올리지 않는다**는 것 — 그래야 깨우기 유예가 살아 있다.
  __setVisibleSince(now - 5000);         // 방금 앞으로 불러왔다
  __setEdit(0);
  __setTouch(now);                       // 불러오느라 누른 그 클릭
  sc.eq('막 열었으면 만져도 양보한다', _fbDeviceIdle(), true);
  __setEdit(now);                        // 진짜로 뭔가 고쳤다면
  sc.eq('진짜 고쳤으면 이제 내 것이 우선', _fbDeviceIdle(), false);
}

// ═══ 소스 고정 — 두 반쪽이 모두 제자리에 있는가 ═══
console.log('\n시나리오 — 고침이 제자리에 있는지');
{
  const { SRC } = require('./_load');
  // ① 저장이 무조건 '편집'으로 잡히지 않는다
  sc.eq('편집 판정을 거친다', SRC.includes('if(_fbIsUserEdit())_fbLastEditTs=Date.now();'), true);
  sc.eq('무조건 올리지 않는다',
        /_fbDirtySeq\+\+;\s*\n\s*_fbLastEditTs=Date\.now\(\);/.test(SRC), false);
  // ② 원격 반영 뒤의 화면 다시 그리기가 가드 **안**에 있다
  sc.eq('그리기까지 가드 안', SRC.includes('_fbApplyRenders(stateObj);\n  }finally{_fbApplyingRemote=false;}'), true);
  sc.eq('그리기를 따로 뺐다', SRC.includes('function _fbApplyRenders(stateObj){'), true);
  // 올려 보내는 것 자체는 그대로여야 한다 (다듬은 값이 유실되면 안 된다)
  sc.eq('올려 보내기는 그대로', /window\.fbPushState=function\(\)\{[\s\S]{0,200}_fbDirtySeq\+\+;/.test(SRC), true);
}

sc.done();
