// 동기화 기준점을 제품별로 가른다 (v26-0919-5)
//
// ⚠️⚠️ 이 시험은 **2026-08-31 대량 손실을 그대로 재현한다.**
//   그때 무슨 일이 있었나 —
//     · 저장 칸(LS_KEY)은 제품별로 갈려 있었다 (b7v1 / b7v1_sweeter)
//     · 그런데 동기화 기준점 세 키는 **고정 이름**이었다
//       (b7v1_owner · b7v1_syncbase · b7v1_syncmeta)
//     · 그래서 같은 도메인에 선 Sweeter 는 제 저장 칸이 비어 ST 가 기본값인데,
//       기준점으로는 BLOCK7 의 **가득 찬 상태**를 읽었다
//     · 3자 병합이 그것을 "사용자가 전부 지웠다" 로 읽고 빈 상태를 클라우드에
//       올렸다. 모든 기기가 따라 지워졌다.
//     · 대량 손실 방어(_fbBulkLoss)는 **base 를 모를 때만** 돈다 —
//       이 경로는 base 가 있어 방어가 켜지지도 않았다.
//
// 고친 것: 기준점 이름을 **LS_KEY 와 같은 규칙**으로 가른다 (_lsk).
//   제품이 갈리면 기준점도 갈리고 → Sweeter 는 base 를 못 찾고
//   → 방어가 정상으로 켜져 클라우드가 살아남는다.
//
// 지키는 것 넷:
//  ① BLOCK7 운영본의 키 이름은 **예전과 한 글자도 같다** (안 그러면 쓰던 기기가
//     전부 기준점을 잃는다)
//  ② 제품·빌드가 갈리면 이름도 갈린다
//  ③ 옛 규칙이면 사고가 **실제로 재현된다** (이 시험이 거짓 안심이 아니라는 증거)
//  ④ 새 규칙이면 클라우드가 살아남는다
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

global.document={visibilityState:'visible',addEventListener:()=>{}};

// ── localStorage 흉내 (두 제품이 **같은 도메인**에 있다) ──
const STORE={};
global.localStorage={
  getItem:k=>(STORE[k]===undefined?null:STORE[k]),
  setItem:(k,v)=>{STORE[k]=String(v);},
  removeItem:k=>{delete STORE[k];}
};

// ── 이름 규칙 (_lsk) 을 진짜 소스에서 떠온다 ──
let LS_KEY='b7v1';
eval(sliceDev('function _lsk(name){', '\n').replace(/^function/,'function'));

// ═══ 1. BLOCK7 운영본의 이름은 예전 그대로 ═══
console.log('시나리오 1 — 쓰던 기기가 기준점을 잃지 않는다');
{
  LS_KEY='b7v1';
  sc.eq('소유자',   _lsk('owner'),    'b7v1_owner');
  sc.eq('기준점',   _lsk('syncbase'), 'b7v1_syncbase');
  sc.eq('기준점 메타', _lsk('syncmeta'), 'b7v1_syncmeta');
  sc.eq('기기 번호', _lsk('devid'),    'b7v1_devid');
  sc.eq('충돌 보관함', _lsk('conflicts'),'b7v1_conflicts');
  // 소스에도 옛 고정 이름이 남아 있으면 안 된다 (한쪽만 고치면 서로 다른 칸을 본다)
  sc.eq('소스에 옛 고정 이름이 남지 않았다',
        /localStorage\.(get|set|remove)Item\('b7v1_(owner|syncbase|syncmeta|conflicts|devid)'/.test(SRC), false);
}

// ═══ 2. 제품·빌드가 갈리면 이름도 갈린다 ═══
console.log('\n시나리오 2 — 제품마다 다른 칸');
{
  LS_KEY='b7v1_dev';          sc.eq('BLOCK7 개발본', _lsk('syncbase'), 'b7v1_dev_syncbase');
  LS_KEY='b7v1_sweeter_dev';  sc.eq('Sweeter 개발본', _lsk('syncbase'), 'b7v1_sweeter_dev_syncbase');
  LS_KEY='b7v1_sweeter';      sc.eq('Sweeter 운영본', _lsk('syncbase'), 'b7v1_sweeter_syncbase');
  // 네 빌드의 이름이 모두 달라야 한다
  const names=['b7v1','b7v1_dev','b7v1_sweeter','b7v1_sweeter_dev'].map(k=>{LS_KEY=k;return _lsk('syncbase');});
  sc.eq('넷이 모두 다르다', new Set(names).size, 4);
}

// ── 병합 엔진과 기준점 저장을 진짜 소스에서 떠온다 ──
let _fbUser={uid:'hb'};
eval(sliceDev('let _fbLastSeenRev=-1;', '// ── 3자 병합 엔진 ──')
       .replace(/^const _FB_BASE_KEY=.*$/m,
                'var _FB_BASE_KEY=_lsk("syncbase"),_FB_META_KEY=_lsk("syncmeta");')
       .replace(/^(?:const|let) /gm,'var '));
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
       .replace(/^(?:const|let) /gm,'var '));

// ⚠️ 기준점 키 이름은 **읽을 때마다** 지금 제품에서 다시 만든다.
//    (진짜 앱에서는 빌드마다 값이 하나로 굳지만, 이 시험은 한 프로세스에서
//     두 제품을 번갈아 흉내내야 한다)
function asProduct(k,fn){
  const prev=LS_KEY;LS_KEY=k;
  _FB_BASE_KEY=_lsk('syncbase');_FB_META_KEY=_lsk('syncmeta');
  _fbBaseJson=null;_fbLastSeenRev=-1;
  try{return fn();}finally{LS_KEY=prev;}
}

// HB 의 진짜 모양에 가깝게 — 말씀 모음 하나에 말씀 여럿, 할일 여러 날
function fullState(){
  const verses=[];
  for(let i=1;i<=40;i++)verses.push({id:'v'+i,ref:'요 3:'+i,krText:'본문 '+i,cat:'설교'});
  const days={};
  for(let i=1;i<=12;i++)days['2026-08-'+String(i).padStart(2,'0')]=
    {big:{am:[{text:'할일 '+i,done:false}]},small:{},trash:[],events:{}};
  return{days,verseCollections:[{id:'vc1',name:'2026 주일설교',verses}],
         contacts:[{id:'c1',name:'김집사'},{id:'c2',name:'이권사'}],
         verseLikeLog:{'2026-08-20':[{ref:'요 3:16',time:'09:00'}]},
         settings:{theme:'dark',activeColls:['vc1']}};
}
// 방금 설치한 Sweeter 의 상태 = defaultState() 에 가깝다 (비어 있다)
function emptyState(){
  return{days:{},verseCollections:[],contacts:[],verseLikeLog:{},
         settings:{theme:'system'}};
}
const J=o=>JSON.stringify(o);
function nVerses(s){return ((s.verseCollections||[])[0]||{verses:[]}).verses.length;}

// ═══ 3. ⚠️ 옛 규칙이면 사고가 재현된다 ═══
console.log('\n시나리오 3 — 옛 규칙(고정 이름)이면 정말로 지워진다');
{
  Object.keys(STORE).forEach(k=>delete STORE[k]);
  const cloud=fullState();
  // BLOCK7 이 기준점을 남겨 두었다 (고정 이름으로)
  STORE['b7v1_syncbase']=J(cloud);
  STORE['b7v1_syncmeta']=J({rev:7,uid:'hb'});

  // Sweeter 가 그 고정 이름을 그대로 읽는다 (= 사고 당시 코드)
  const base=JSON.parse(STORE['b7v1_syncbase']);
  const out=_fbMergeGuarded(base,emptyState(),cloud,false);

  sc.eq('기준점을 남의 것으로 읽었다', nVerses(base), 40);
  sc.eq('⚠️ 말씀이 통째로 사라진다', nVerses(out), 0);
  sc.eq('⚠️ 할일도 사라진다', Object.keys(out.days).length, 0);
  sc.eq('⚠️ 연락처도 사라진다', out.contacts.length, 0);
}

// ═══ 4. 새 규칙이면 클라우드가 살아남는다 ═══
console.log('\n시나리오 4 — 새 규칙이면 지워지지 않는다');
{
  Object.keys(STORE).forEach(k=>delete STORE[k]);
  const cloud=fullState();

  // ① BLOCK7 이 제 칸에 기준점을 남긴다
  asProduct('b7v1',()=>_fbSetBase(J(cloud),7,'hb'));
  sc.eq('BLOCK7 은 제 칸에 적었다', STORE['b7v1_syncbase']!==undefined, true);
  sc.eq('Sweeter 칸은 비어 있다', STORE['b7v1_sweeter_dev_syncbase'], undefined);

  // ② Sweeter 가 같은 계정으로 처음 로그인한다 — 기준점을 못 찾는다
  const got=asProduct('b7v1_sweeter_dev',()=>_fbLoadPersistedBase('hb'));
  sc.eq('남의 기준점을 읽지 않는다', got, null);

  // ③ base 를 모르는 채로 병합한다 → 대량 손실 방어가 켜진다
  const out=asProduct('b7v1_sweeter_dev',()=>_fbMergeGuarded(null,emptyState(),cloud,false));
  sc.eq('말씀이 살아남는다', nVerses(out), 40);
  sc.eq('할일도 살아남는다', Object.keys(out.days).length, 12);
  sc.eq('연락처도 살아남는다', out.contacts.length, 2);
  sc.eq('좋아요 기록도 살아남는다', out.verseLikeLog['2026-08-20'].length, 1);
}

// ═══ 5. 계정이 다르면 서로 아무것도 안 보인다 ═══
console.log('\n시나리오 5 — 다른 아이디로 들어오면 남남');
{
  Object.keys(STORE).forEach(k=>delete STORE[k]);
  asProduct('b7v1',()=>_fbSetBase(J(fullState()),7,'hb'));
  sc.eq('같은 계정이면 제 기준점을 되찾는다',
        asProduct('b7v1',()=>!!_fbLoadPersistedBase('hb')), true);
  sc.eq('다른 계정이면 안 쓴다',
        asProduct('b7v1',()=>_fbLoadPersistedBase('다른사람')), null);
}

// ═══ 6. 지울 때도 제 칸만 지운다 ═══
console.log('\n시나리오 6 — 로그아웃은 제 칸만 지운다');
{
  Object.keys(STORE).forEach(k=>delete STORE[k]);
  asProduct('b7v1',()=>_fbSetBase(J(fullState()),7,'hb'));
  asProduct('b7v1_sweeter_dev',()=>_fbSetBase(J(fullState()),3,'hb'));
  sc.eq('둘 다 적혔다',
        [STORE['b7v1_syncbase']!==undefined,STORE['b7v1_sweeter_dev_syncbase']!==undefined],
        [true,true]);
  asProduct('b7v1_sweeter_dev',()=>_fbClearBase());
  sc.eq('Sweeter 칸만 지워졌다', STORE['b7v1_sweeter_dev_syncbase'], undefined);
  sc.eq('BLOCK7 칸은 그대로다', STORE['b7v1_syncbase']!==undefined, true);
}

// ═══ 7. 클라우드 문서는 여전히 **하나를 같이 쓴다** ═══
console.log('\n시나리오 7 — 가른 것은 기준점뿐, 말씀은 같이 본다');
{
  // HB 가 원한 모양: 같은 아이디로 두 앱 → 말씀 모음이 양쪽에 같이 보인다.
  // 그러려면 클라우드 경로(users/{uid})가 제품 이름을 **타면 안 된다.**
  sc.eq('클라우드 문서 경로에 제품 이름이 없다',
        /collection\('users'\)\.doc\((?:uid|_fbUser\.uid|window\._fbUser\.uid)\)/.test(SRC)
        || SRC.includes(".collection('users').doc("), true);
  sc.eq('제품별로 가르는 것은 설정뿐 (_PRODUCT_SCOPED)',
        SRC.includes('const _PRODUCT_SCOPED=['), true);
  sc.eq('말씀 모음은 제품 칸막이에 들어 있지 않다',
        /_PRODUCT_SCOPED=\[[^\]]*verseCollections/.test(SRC), false);
}

sc.done();
