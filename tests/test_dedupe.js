// 중복 구절 정리 도구 (약칭·정식 합치기, v26-0731-6)
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
eval(slice('const _REF_ABBR2FULL', 'function _findVerseByRefLoose'));
eval(slice('function _dupVerseScan', '// \u2500\u2500 \uc140\uc5d0\uc11c \ubc14\uae65\uc73c\ub85c'));

// ── 앱 환경 스텁 ──
let toasts=[];
global.showToast=m=>toasts.push(m);
global.appConfirm=(msg,onYes)=>{global._lastConfirmMsg=msg;onYes&&onYes();}; // 자동 확인
global.beforeSave=()=>{};global.save=()=>{};
global._invalidateVerseCaches=()=>{};global._afterActiveVersesChanged=()=>{};
global.NAVIGATOR_VERSES=[{ref:'요한복음 3:16',cat:'구원',topic:'하나님의 사랑'}];
global.ST={};
global.getVerseCollections=()=>ST.verseCollections||[];


// ═══ 시나리오 1: 인계 문서 사례 — 약칭본 흡수 + 로그 이관 ═══
console.log('시나리오 1 — 삼상 7:12(약칭) → 사무엘상 7:12(정식)');
{
  ST.verseCollections=[{id:'c1',name:'모음',verses:[
    {ref:'삼상 7:12',cat:'믿음',topic:'에벤에셀',krText:'옛본문',tags:['돌'],src:'direct'},
    {ref:'사무엘상 7:12',cat:'믿음',topic:'에벤에셀',krText:'새본문',tags:[],src:'google',d:'2026-07-20',gid:'g1'},
  ]}];
  ST.verseLikeLog={'2026-07-30':[{ref:'삼상 7:12',time:'09:00'},{ref:'요한복음 3:16',time:'10:00'}]};
  ST.memorizationLog={'2026-07-30':{am:[{ref:'삼상 7:12',time:'09:05'}]}};
  ST.verseShareLog={};ST.verseDeeperLog={};ST.verseEvenDeeperLog={};
  mergeDuplicateVerses();
  const vs=ST.verseCollections[0].verses;
  sc.eq('약칭본 완전 삭제(1개만 남음)',vs.length,1);
  sc.eq('정식본이 남음',vs[0].ref,'사무엘상 7:12');
  sc.eq('태그 이어받음',vs[0].tags,['돌']);
  sc.eq('본문은 남는 쪽 유지',vs[0].krText,'새본문');
  sc.eq('좋아요 로그 ref 이관',ST.verseLikeLog['2026-07-30'][0].ref,'사무엘상 7:12');
  sc.eq('무관한 좋아요는 그대로',ST.verseLikeLog['2026-07-30'][1].ref,'요한복음 3:16');
  sc.eq('암송 로그(중첩) ref 이관',ST.memorizationLog['2026-07-30'].am[0].ref,'사무엘상 7:12');
  sc.eq('확인창에 변환 표시',global._lastConfirmMsg.includes('삼상 7:12 → 사무엘상 7:12'),true);
}

// ═══ 시나리오 2: 소주제 다르면 안 합침 (v0730-14 원칙 유지) ═══
console.log('시나리오 2 — 같은 장절, 다른 소주제 → 별개 유지');
{
  ST.verseCollections=[{id:'c1',verses:[
    {ref:'삼상 7:12',cat:'믿음',topic:'리트릿 1일',src:'google',d:'2026-07-01'},
    {ref:'사무엘상 7:12',cat:'믿음',topic:'리트릿 2일',src:'google',d:'2026-07-02'},
  ]}];
  toasts=[];
  mergeDuplicateVerses();
  sc.eq('안 합침(둘 다 남음)',ST.verseCollections[0].verses.length,2);
  sc.eq('중복 없음 안내',toasts[0],'합칠 중복 구절이 없어요');
}

// ═══ 시나리오 3: 모음이 다르면 안 합침 ═══
console.log('시나리오 3 — 다른 모음 → 건드리지 않음');
{
  ST.verseCollections=[
    {id:'c1',verses:[{ref:'시 136:4',cat:'감사',topic:'기이한 일',src:'direct'}]},
    {id:'c2',verses:[{ref:'시편 136:4',cat:'감사',topic:'기이한 일',src:'google',d:'2026-07-10'}]},
  ];
  toasts=[];
  mergeDuplicateVerses();
  sc.eq('양쪽 모두 유지',getVerseCollections().map(c=>c.verses.length),[1,1]);
}

// ═══ 시나리오 4: 흡수된 표기가 다른 모음에 살아 있으면 로그는 안 옮김 ═══
console.log('시나리오 4 — 표기가 다른 곳에 살아 있으면 로그 보존');
{
  ST.verseCollections=[
    {id:'c1',verses:[
      {ref:'시 136:4',cat:'감사',topic:'기이한 일',src:'direct'},
      {ref:'시편 136:4',cat:'감사',topic:'기이한 일',src:'google',d:'2026-07-10'},
    ]},
    {id:'c2',verses:[{ref:'시 136:4',cat:'다른분류',topic:'다른주제',src:'direct'}]},
  ];
  ST.verseLikeLog={'2026-07-30':[{ref:'시 136:4',time:'09:00'}]};
  ST.memorizationLog={};
  mergeDuplicateVerses();
  sc.eq('c1 중복은 합침',ST.verseCollections[0].verses.length,1);
  sc.eq('로그는 그대로(c2에 살아 있으므로)',ST.verseLikeLog['2026-07-30'][0].ref,'시 136:4');
}

// ═══ 시나리오 5: 날짜 이어받기 — 정식본에 날짜가 없고 약칭본에 있으면 ═══
console.log('시나리오 5 — 빠진 날짜 이어받기');
{
  ST.verseCollections=[{id:'c1',verses:[
    {ref:'롬 8:28',cat:'섭리',topic:'합력',src:'direct',d:'2026-06-01'},
    {ref:'로마서 8:28',cat:'섭리',topic:'합력',src:'google'},
  ]}];
  ST.verseLikeLog={};ST.memorizationLog={};
  mergeDuplicateVerses();
  sc.eq('구글본이 남고 날짜 이어받음',ST.verseCollections[0].verses[0].d,'2026-06-01');
}

// ═══ 시나리오 6: 구글 유래끼리 중복이면 흡수본은 휴지통행 ═══
console.log('시나리오 6 — 구글 유래 흡수본은 완전 삭제 대신 휴지통');
{
  ST.verseCollections=[{id:'c1',verses:[
    {ref:'빌 4:13',cat:'능력',topic:'그리스도 안',src:'google',d:'2026-05-01'},
    {ref:'빌립보서 4:13',cat:'능력',topic:'그리스도 안',src:'google',d:'2026-07-01'},
  ]}];
  ST.verseLikeLog={};ST.memorizationLog={};
  mergeDuplicateVerses();
  const vs=ST.verseCollections[0].verses;
  sc.eq('배열엔 둘 다 남음(휴지통)',vs.length,2);
  sc.eq('정식·최신이 살아 있음',vs.filter(v=>!v.del)[0].ref,'빌립보서 4:13');
  sc.eq('흡수본은 del=simple',vs.find(v=>v.ref==='빌 4:13').del,'simple');
}

// ═══ 시나리오 7: 휴지통 항목은 스캔에서 제외 ═══
console.log('시나리오 7 — 이미 지운 구절은 중복으로 안 봄');
{
  ST.verseCollections=[{id:'c1',verses:[
    {ref:'삼상 7:12',cat:'믿음',topic:'에벤에셀',src:'direct',del:'simple'},
    {ref:'사무엘상 7:12',cat:'믿음',topic:'에벤에셀',src:'google',d:'2026-07-20'},
  ]}];
  toasts=[];
  mergeDuplicateVerses();
  sc.eq('중복 없음으로 판정',toasts[0],'합칠 중복 구절이 없어요');
}

sc.done();
