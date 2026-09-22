// Sweeter 홈 (타일 판) — v26-0830-2
//
// 이 화면이 지켜야 하는 것 두 가지가 있다.
//  ① **BLOCK7 은 한 글자도 달라지지 않는다.** APP_PRODUCT 가 기본값이면
//     _swBoot() 이 즉시 돌아 나가고 화면도 상태도 그대로다.
//  ② 타일에 뜨는 값은 **전부 진짜 데이터**다. 시안의 가짜 값이 하나라도
//     따라 들어오면 사용자는 없는 기록을 본다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT = 'block7';
global.document = { getElementById: () => null, querySelector: () => null,
                    addEventListener: () => {} };
global.window = { addEventListener: () => {} };
let TOAST = '';
function showToast(m){ TOAST = m; }

// 집계 도구는 진짜를 떠온다 (최신순 정렬 규칙이 여기 들어 있다)
eval(sliceDev('function _flatMemEntries(', 'function _aggEntriesForKind'));

// 로그 stub — 위 도구가 읽는 곳
let LIKE={}, MEM={}, DEEP={}, EVEN={}, SHARE={};
function getLikeLog(){return LIKE;} function getMemLog(){return MEM;}
function getDeeperLog(){return DEEP;} function getEvenDeeperLog(){return EVEN;}
function getShareLog(){return SHARE;}

let VERSES=[];
function ACTIVE_VERSES(){return VERSES;}
let ST={settings:{}};
let SAVED=0;
function save(){SAVED++;}
function _calKey(){return '2026-08-30';}
// 성경 순서 도구 — 진짜를 떠온다 (책 이름 표준화·정경 순서가 여기 들어 있다)

function _findVerseByRefLoose(ref){return VERSES.find(v=>v.ref===ref)||null;}
// 씨앗 난수 — 진짜(_hiHash·_hiRng)는 딸린 것이 많아, **성질만** 흉내낸다:
// 씨앗이 같으면 늘 같은 차례가 나온다. '오늘의 말씀'·'묵상 질문'이 이것을 쓴다.
function _hiHash(s){const t=String(s==null?'':s);let h=0;
  for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;return h;}
function _hiRng(seed){let x=((seed||1)>>>0)||1;
  return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296;};}
function _tagartPick(){return null;} function _tagartSvg(){return '';}
function _tagartStyle(){return 'minimal';}

// ⚠️ 직접 eval 안의 const/let 은 **그 eval 안에만** 산다 (var 는 밖으로 나온다).
//    순서표는 const 로 적혀 있으므로 var 로 바꿔 떠온다.
eval((SRC_DEV.match(/^const BIBLE_ORDER_(?:OT|NT)=\[[^\]]*\];$/gm)||[])
       .join('\n').replace(/^const /gm,'var '));   // 정경 순서표
eval(sliceDev('// ── 성경책 이름 하나로 모으기 ──', 'function _bookSel'));
eval(sliceDev('function _bibleRankOfRef(', '// verses를 keyFn 기준으로'));
let _BIBLE_WHOLE=null;
// 같은 까닭으로 Sweeter 블록의 맨 바깥 const/let 도 var 로 바꿔 떠온다.
// (안 그러면 _SW_TILES 같은 것을 테스트에서 바꿔도 함수들은 딴 것을 본다)
eval(sliceDev('function _swOn(){', '// ── DEV MODE BOOTSTRAP ──')
       .replace(/^(?:const|let) /gm,'var '));

const V=(ref,cat,d,txt)=>({idx:0,cat,topic:'',krText:txt||(cat+' 본문'),ref,tags:[],hi:'',d,pid:'',kind:''});

// ═══ 1. BLOCK7 은 이 화면을 모른다 ═══
console.log('시나리오 1 — BLOCK7 에서는 잠들어 있다');
{
  APP_PRODUCT='block7';
  sc.eq('기본 제품이면 꺼져 있다', _swOn(), false);
  // _swBoot 은 첫 줄에서 돌아 나가야 한다 — DOM 이 없어도 터지지 않는 것이 증거
  let threw=false; try{ _swBoot(); }catch(e){ threw=true; }
  sc.eq('BLOCK7 에서 _swBoot 은 아무 일도 하지 않는다', threw, false);
  APP_PRODUCT='sweeter';
  sc.eq('Sweeter 에서만 켜진다', _swOn(), true);
}

// ═══ 2. 최근 설교 — 대분류로 묶고 최신순 ═══
console.log('\n시나리오 2 — 최근 설교 묶기');
{
  VERSES=[
    V('마 5:13','언덕 위의 도시','2026-06-21'),
    V('마 5:14','언덕 위의 도시','2026-06-21'),
    V('마 5:16','언덕 위의 도시','2026-06-21'),
    V('시 119:103','꿀보다 더 다니이다','2026-08-16'),
    V('시 119:105','꿀보다 더 다니이다','2026-08-16'),
    V('롬 8:28','우연이 아니다','2026-07-05')
  ];
  const recent=_swSermons(0);
  sc.eq('설교 수', recent.length, 3);
  sc.eq('최신 설교가 맨 앞', recent[0].cat, '꿀보다 더 다니이다');
  sc.eq('그 설교의 말씀 수', recent[0].n, 2);
  sc.eq('날짜도 함께 온다', recent[0].d, '2026-08-16');

  const many=_swSermons(1);
  sc.eq('말씀 많은 순', many[0].cat, '언덕 위의 도시');
  const name=_swSermons(2);
  sc.eq('이름 순 첫째', name[0].cat, '꿀보다 더 다니이다');

  // ⚠️ 대분류가 비어 있는 구절도 어딘가에는 들어가야 한다. 빠뜨리면 화면의
  //    합계가 실제 말씀 수보다 적어져 "말씀이 사라진 것처럼" 보인다.
  VERSES=VERSES.concat([V('요 3:16','','')]);
  const withBlank=_swSermons(0);
  sc.eq('대분류가 빈 구절은 나의 암송으로', withBlank.some(g=>g.cat==='나의 암송'), true);
  sc.eq('합계가 맞는다', withBlank.reduce((a,g)=>a+g.n,0), VERSES.length);
}

// ═══ 3. 마지막에 만난 말씀 — 반응 기록에서 최신순 ═══
console.log('\n시나리오 3 — 마지막에 만난 말씀');
{
  VERSES=[V('마 5:13','언덕 위의 도시','2026-06-21'),
          V('시 119:103','꿀보다 더 다니이다','2026-08-16'),
          V('롬 8:28','우연이 아니다','2026-07-05')];
  LIKE={'2026-08-20':[{ref:'마 5:13',time:'09:10'}]};
  MEM ={'2026-08-28':{am:[{ref:'시 119:103',time:'07:30'}]}};
  DEEP={'2026-08-11':[{ref:'롬 8:28',time:'22:00'}]};
  EVEN={}; SHARE={};

  const all=_swLastVerses(0);
  sc.eq('셋 다 온다', all.length, 3);
  sc.eq('가장 최근이 맨 앞', all[0].ref, '시 119:103');
  sc.eq('언제였는지도 온다', all[0].when, '2026-08-28');
  sc.eq('그 다음', all[1].ref, '마 5:13');

  sc.eq('좋아요만', _swLastVerses(1).map(x=>x.ref), ['마 5:13']);
  sc.eq('암송만', _swLastVerses(2).map(x=>x.ref), ['시 119:103']);

  // ⚠️ 기록에는 남았지만 지금 켜진 모음에 없는 말씀이 있다 (모음을 끄거나
  //    시트에서 뺀 경우). 그런 것은 **조용히 건너뛴다** — 본문 없이 장절만
  //    뜨면 사용자는 빈 카드를 보게 된다.
  LIKE={'2026-08-29':[{ref:'없는 구절 1:1',time:'10:00'}]};
  MEM={}; DEEP={};
  sc.eq('찾지 못한 말씀은 건너뛴다', _swLastVerses(0).length, 0);
}

// ═══ 4. 띠와 점 ═══
console.log('\n시나리오 4 — 띠·점·빈 상태');
{
  VERSES=[V('마 5:13','A','2026-06-21'),V('시 1:1','B','2026-07-01')];
  LIKE={}; MEM={}; DEEP={}; EVEN={}; SHARE={};
  const t={k:'recent',p:0,s:0};
  // v26-0921-9, HB — 타이틀 칸을 없앴다. 첫 칸부터 곧바로 내용이다.
  sc.eq('띠 = 값들만 (타이틀 칸 없음)', _swStrip(t).length, 2);
  sc.eq('타이틀 칸은 만들지 않는다',
        _swStrip(t).some(x=>x.kind==='title'), false);

  // 점은 아홉 칸을 넘지 않는다 (값이 스무 개여도)
  sc.eq('값이 적으면 그대로', (_swPipsHTML(4,0).match(/<i/g)||[]).length, 4);
  sc.eq('많으면 아홉 칸', (_swPipsHTML(30,29).match(/<i/g)||[]).length, 9);
  sc.eq('마지막 값이면 마지막 칸이 켜진다',
        _swPipsHTML(30,29).split('<i').pop().includes('on'), true);
  sc.eq('하나뿐이면 점을 안 찍는다', _swPipsHTML(1,0), '');

  // 값이 없을 때 — 왜 비었는지 말해 준다
  const empty={k:'last',p:0,s:0};
  sc.eq('빈 타일은 까닭을 적는다', _swFace(empty).includes('아직 기록이 없어요'), true);

  // p 가 범위를 벗어나도 조용히 되돌아온다 (값 둘 → 마지막 자리는 1)
  const over={k:'recent',p:99,s:0};
  _swFace(over);
  sc.eq('넘친 자리는 끝으로 되돌아온다', over.p, 1);
  // 값이 하나도 없는 타일도 조용히 0 으로 (Math.min(-1,p) 에 빠지지 않게)
  const none={k:'tag',p:99,s:0};
  _swFace(none);
  sc.eq('빈 타일의 자리는 0', none.p, 0);
}

// ═══ 5. 글자 그대로 새지 않는다 ═══
console.log('\n시나리오 5 — 시트 글자가 화면을 깨지 않는다');
{
  VERSES=[V('마 5:13','<b>굵게</b> & "따옴표"','2026-06-21')];
  const t={k:'recent',p:1,s:0};
  const h=_swFace(t);
  sc.eq('꺾쇠는 글자로 나온다', h.includes('&lt;b&gt;'), true);
  sc.eq('진짜 태그로 새지 않는다', h.includes('<b>굵게</b>'), false);
}

// ═══ 6. 소스에 박아 두는 약속 ═══
console.log('\n시나리오 6 — 소스에 고정');
{
  // ⚠️ 전체화면은 "위에 뜨는 팝업"이라 아래 화면을 숨겼다 되살린다.
  //    Sweeter 홈이 이 목록에 없으면 타일을 눌러도 홈이 위에 남아 가린다.
  sc.eq('전체화면이 Sweeter 홈을 숨긴다',
        SRC_DEV.includes("const swh=document.getElementById('swHome');"), true);
  // ⚠️ ACTIVE_VERSES 가 d 를 안 넘기면 '최근 설교'가 전부 같은 날이 된다.
  sc.eq('ACTIVE_VERSES 가 날짜를 넘긴다',
        SRC_DEV.includes("d:v.d||'',pid:v.pid||'',kind:v.kind||''"), true);
  // ⚠️ 세로 몸짓은 화면 스크롤의 것이다. 이 포기 규칙을 지우면 시안에서 겪은
  //    "상하 슬라이드가 잘 안 되는" 증상이 그대로 돌아온다.
  // 각도 관용 70도 (HB 지시 26-0830-9). 45도·52도로 되돌리면 비스듬한
  // 옆쓸기가 스크롤로 새 나간다.
  sc.eq('세로로 움직이면 몸짓을 포기한다',
        SRC_DEV.includes('if(Math.abs(dy)>Math.abs(dx)*_SW_ANGLE){'), true);
  sc.eq('70도까지는 옆쓸기로 본다', SRC_DEV.includes('const _SW_ANGLE=2.75;'), true);
  // ⚠️ 붙잡는 것(_SW_MOVE)과 넘기는 것은 **다른 판단**이다 (HB 지시 26-0830-13).
  //    5px 만 가면 붙잡되, 넘기기는 손을 뗐을 때 거리 또는 속도로 정한다.
  sc.eq('붙잡는 보호선은 5px', SRC_DEV.includes('const _SW_MOVE=5;'), true);
  sc.eq('넘기는 거리는 따로', SRC_DEV.includes('const _SW_COMMIT_DIST=50;'), true);
  sc.eq('튕기면 짧아도 넘어간다', SRC_DEV.includes('const _SW_COMMIT_VEL=0.28;'), true);
  // ⚠️ 속도는 **마지막 순간**의 것이라야 한다. 몸짓 전체 시간으로 나누면 누른 뒤
  //    가만히 있던 시간까지 들어가 아무리 빨리 튕겨도 느리게 나온다.
  sc.eq('속도는 마지막 순간의 것',
        SRC_DEV.includes('if(_swG.pt){const _dt=_now-_swG.pt;if(_dt>0)_swG.v=(dx-_swG.pdx)/_dt;}'), true);
  sc.eq('되돌리다 뗀 것은 안 넘긴다', SRC_DEV.includes('v*dx>0'), true);
  sc.eq('보호선 하나로 방향을 정한다',
        SRC_DEV.includes('if(!_swG.ax&&(Math.abs(dx)>_SW_MOVE||Math.abs(dy)>_SW_MOVE)){'), true);
  // ⚠️ 터치는 손을 뗄 때까지 **처음 눌린 요소**로만 간다. 그 요소를 다시 그려
  //    없애면 우리 손을 떠나고, 브라우저가 스크롤을 시작해 드래그가 5px 쯤에서
  //    끊긴다 (HB 신고 26-0830-13). 그래서 편집도 자리바꿈도 **다시 그리지 않는다.**
  sc.eq('편집은 있는 타일에 손만 댄다', SRC_DEV.includes('function _swEditOn(){'), true);
  sc.eq('롱터치는 그 타일 그대로 끈다',
        SRC_DEV.includes('_swDragStart(gel,gi,gx,gy);'), true);
  sc.eq('자리바꿈은 요소를 옮긴다',
        SRC_DEV.includes('if(to>from)ref.after(el); else ref.before(el);'), true);
  sc.eq('다시 그리지 않으니 번호만 새로 매긴다',
        SRC_DEV.includes("[...b.querySelectorAll('.sw-tile[data-swi]')].forEach((t,i)=>{t.dataset.swi=i;});"), true);
  // 롱터치가 재는 동안·끄는 동안 브라우저의 스크롤 판단을 막는다 (할일뷰와 같은 방법)
  // ⚠️ v26-0921-9 — 편집 중 '잡는 중'(pend)만은 **막지 않는다.** 막으면 잡는
  //    250ms 동안 스크롤이 다시 멈춰 서서, 고치려던 증상이 그대로 남는다.
  sc.eq('재는 동안 스크롤을 막는다',
        SRC_DEV.includes("if(((_swG.lp&&!_swG.pend)||_swG.drag)&&e.cancelable)e.preventDefault();"), true);
  sc.eq('막는 리스너는 passive 가 아니다',
        SRC_DEV.includes("},{passive:false});\n  window.addEventListener('resize'"), true);
  // ⚠️ 브라우저가 세로 스크롤로 가져가도(pointercancel) 이미 문턱을 넘었으면
  //    놓은 것과 똑같이 마무리한다. 예전엔 무조건 되돌려 몸짓이 끊겼다.
  sc.eq('취소되어도 넘긴 것은 살린다',
        SRC_DEV.includes('_swFinishSwipe(_swG.dx||0);'), true);
  // 길게 눌러 편집에 들어가면 **손을 떼지 않고 바로** 끌 수 있어야 한다
  sc.eq('길게 누른 그 손으로 바로 끈다',
        SRC_DEV.includes('_swDragStart(gel,gi,gx,gy);  // 누르고 있던 **그 타일 그대로** 끈다'), true);
  // 잡은 자리를 기억해야 손가락에 붙는다 (안 그러면 100px 쯤 떨어져 끌린다)
  sc.eq('잡은 자리를 기억한다', SRC_DEV.includes('gx:x-r.left,gy:y-r.top'), true);
  sc.eq('다시 그릴 때마다 거리를 새로 잰다',
        SRC_DEV.includes("el.style.transform='';                    // 먼저 지우고 재야"), true);
  // 비켜 주는 타일이 미끄러진다 (FLIP) · 놓을 자리에 불이 들어온다
  sc.eq('비켜 주는 타일이 미끄러진다', SRC_DEV.includes('function _swReorder(from,to,x,y){'), true);
  sc.eq('놓을 자리에 불', SRC_DEV.includes('function _swDragHole(r){'), true);
  // ⚠️ 크기가 다른 두 타일이 자리를 바꾸면 손가락 밑에 곧바로 상대가 온다.
  //    막지 않으면 매 프레임 되바꾸며 떨린다 — 실제로 24프레임 동안 16번
  //    오갔다 (HB 신고 26-0830-12). 쉬는 시간 + 20px 이동, 둘 다 있어야 한다.
  sc.eq('되바꿈을 막는다',
        SRC_DEV.includes("if(_swG.lock&&(now<_swG.lock||"), true);
  sc.eq('그 뒤에도 20px 은 더 가야 한다',
        SRC_DEV.includes("(!auto&&Math.hypot(x-_swG.lx,y-_swG.ly)<20)))return;"), true);
  // ⚠️⚠️ **저절로 굴러갈 때(auto)는 20px 을 보지 않는다** (v26-0922-15, HB).
  //    손가락은 가만히 있고 판이 움직이는 것이라, 20px 을 기다리면 영영
  //    자리가 안 바뀐다.
  sc.eq('저절로 굴러갈 때는 20px 을 안 본다',
        /_swDragHover\(_swG\.x,_swG\.y,true\)/.test(SRC_DEV), true);
  // 비켜 주는 움직임 — 출발도 도착도 느긋하게 (HB 지시 26-0830-13)
  sc.eq('쉬는 시간은 비켜 주는 움직임과 짝', SRC_DEV.includes('const _SW_SLIDE=420;'), true);
  // ⚠️ y 가 0~1 을 벗어나야 '쫄깃'해진다 — 출발에서 반대로 뜸을 들이고(-0.05)
  //    도착에서 제자리를 지나쳤다 돌아온다(1.22). 0~1 안에 가두면 밋밋해진다.
  sc.eq('쫄깃한 곡선', SRC_DEV.includes("_SW_EASE='cubic-bezier(.45,-0.05,.3,1.22)'"), true);
  // 타일 바깥을 누르면 편집을 마친다 (언젠가 편집/완료 단추를 없앨 자리)
  sc.eq('바깥을 누르면 편집을 마친다',
        SRC_DEV.includes('if(!el){if(_SW_EDIT)swToggleEdit();return;}'), true);
  sc.eq('바깥을 누를 자리를 넉넉히 둔다',
        SRC_DEV.includes('padding:6px 14px 120px;'), true);
  // 편집에서는 토스트를 띄우지 않는다 (길게 누른 손이 끊기는 느낌을 준다)
  sc.eq('편집에 토스트를 띄우지 않는다',
        /function _swEditOn\(\)\{[\s\S]*?\n\}/.exec(SRC_DEV)[0].includes('showToast'), false);
  sc.eq('타일을 켜고 끌 때도 조용히',
        /function _swAddTile\(k\)\{[\s\S]*?\n\}/.exec(SRC_DEV)[0].includes('showToast'), false);
  // ⚠️ 끌리는 타일이 손가락을 가리면 elementFromPoint 가 자기 자신만 돌려주어
  //    "밑에 있는 타일"을 못 찾는다 → 순서가 영영 안 바뀐다 (HB 신고 26-0830-10).
  //    투명도만으로는 안 된다. pointer-events:none 이라야 한다.
  sc.eq('끌리는 타일은 손가락 밑을 비켜 준다',
        /\.sw-tile\.sw-drag\{[^}]*pointer-events:none/.test(SRC_DEV), true);
  // v26-0921-9, HB — 편집 중에도 **판을 훑어 내릴 수 있어야 한다.**
  //   예전에는 touch-action:none 이라 세로가 아예 막혀 있었다.
  sc.eq('편집 중에도 세로는 브라우저의 것',
        SRC_DEV.includes('.sw-board.edit .sw-tile{touch-action:pan-y;}'), true);
  // ⚠️ 행 높이는 --sw-cell 로 직접 준다 (aspect-ratio 는 그리드에 안 먹는다)
  sc.eq('행 높이를 재서 넣는다', SRC_DEV.includes("setProperty('--sw-cell'"), true);
  // ⚠️ 미는 동안 누름 축소(scale .975)가 걸려 있으면, 손을 뗄 때 타일이 되돌아오며
  //    그 위의 본문이 커지는 것처럼 보인다 (HB 신고 26-0830-5).
  sc.eq('미는 동안에는 누름 축소를 끈다',
        SRC_DEV.includes('.sw-tile:not(.sw-dragging):active{transform:scale(.975);}'), true);
  sc.eq('가로로 미는 것이 정해지면 표를 붙인다',
        SRC_DEV.includes("_swG.el.classList.add('sw-dragging');"), true);
  // 움직임 줄이기를 켠 기기는 애니메이션 없이 바로 바뀐다
  sc.eq('움직임 줄이기를 존중한다', SRC_DEV.includes("function _swNoMotion()"), true);
}

// ═══ 7. 넘기는 방식 — 설정창 탭과 같은 트랙 ═══
console.log('\n시나리오 7 — 트랙으로 넘긴다 (설정창 탭과 같은 방식)');
{
  // ⚠️ 예전엔 "내보내고 → 갈아끼우고 → 들인다" 였다. 그 사이에 빈틈이 생겨
  //    다음 값이 늦게 나타났다 (HB 신고 26-0830-7). 이전·지금·다음 세 칸을
  //    한 줄에 붙여 놓고 통째로 밀면 빈틈도 페이드도 없다.
  sc.eq('트랙이 있다', SRC_DEV.includes('.sw-track{position:absolute;inset:0;display:flex;width:300%;'), true);
  // ⚠️ 33.3333% 가 아니라 **calc(100%/3)** 이다 (v26-0922-11, HB: "브라우저
  //    사이즈에 따라 좌우 글자가 좀 잘리기도 해"). 33.3333%×3 은 300% 에서
  //    0.0001% 가 모자라, 폭에 따라 칸 경계가 어긋나 글자 끝이 잘렸다.
  sc.eq('가운데 칸을 보여 준다', SRC_DEV.includes('transform:translateX(calc(-100% / 3));'), true);
  sc.eq('칸 폭도 같은 셈으로', SRC_DEV.includes('.sw-cell{width:calc(100% / 3);'), true);
  sc.eq('어림수는 남기지 않는다', SRC_DEV.includes('33.3333%'), false);
  sc.eq('설정창 탭과 같은 시간·가속도',
        SRC_DEV.includes("tr.style.transition='transform .22s cubic-bezier(.4,0,.2,1)';"), true);
  sc.eq('손가락을 1:1 로 따라간다', SRC_DEV.includes('_swTrackTo(_swTrack(_swG.el),can?dx:dx*0.25,false);'), true);
  sc.eq('끝에서는 고무줄', SRC_DEV.includes('dx*0.25'), true);
  // 페이드로 갈아끼우던 옛 장치가 남아 있으면 안 된다
  sc.eq('옛 페이드 장치는 없다', /sw-slidein|_swFlowSet|_swSweep/.test(SRC_DEV), false);

  VERSES=[V('마 5:13','언덕 위의 도시','2026-06-21'),
          V('시 1:1','꿀보다 더 다니이다','2026-07-01')];
  LIKE={'2026-08-20':[{ref:'마 5:13',time:'09:10'}]}; MEM={}; DEEP={}; EVEN={}; SHARE={};

  // 세 칸(이전·지금·다음)이 언제나 나온다 — 끝에서도 빈 칸으로 채운다
  const t={k:'recent',p:0,s:0};
  const h0=_swFace(t);
  sc.eq('첫 자리에서도 세 칸', (h0.match(/class="sw-cell/g)||[]).length, 3);
  sc.eq('첫 자리의 앞칸은 비어 있다', h0.includes('<div class="sw-cell"></div>'), true);

  t.p=1;
  const h1=_swFace(t);
  sc.eq('가운데 자리도 세 칸', (h1.match(/class="sw-cell/g)||[]).length, 3);
  // 가운데 칸이 지금 값이어야 한다 (앞칸 = 바로 앞 **내용**, 타이틀이 아니다)
  const cells=h1.split('class="sw-cell');
  sc.eq('앞칸도 내용이다 (타이틀 칸은 없다)', cells[1].includes('최근 설교'), false);
  sc.eq('가운데 칸이 지금 값', cells[2].includes('언덕 위의 도시')||cells[2].includes('꿀보다'), true);

  // ⚠️ verse 는 타일이 아니라 **칸**에 붙는다. 이웃 칸이 제목일 수 있어서다.
  LIKE={'2026-08-20':[{ref:'마 5:13',time:'09:10'}]};
  const tv={k:'last',p:1,s:0};
  const hv=_swFace(tv);
  sc.eq('말씀 칸에만 verse 가 붙는다', hv.includes('class="sw-cell verse"'), true);
  sc.eq('타일에는 안 붙는다', /class="sw-tile[^"]*verse/.test(hv), false);

  // 고정 세간은 트랙 바깥에 있어야 한다
  const iTrack=hv.indexOf('sw-track'), iLab=hv.indexOf('sw-lab'), iPips=hv.indexOf('sw-pips');
  sc.eq('이름 줄은 트랙보다 앞', iLab<iTrack, true);
  sc.eq('점은 트랙보다 뒤', iPips>iTrack, true);
  sc.eq('이름 줄은 칸 안에 없다', /sw-cell[^>]*>[^<]*<div class="sw-lab"/.test(hv), false);
}

// ═══ 8. 새 타일 셋 — 성경 · 태그 · 말씀 반응 ═══
console.log('\n시나리오 8 — 새 타일 셋');
{
  VERSES=[V('마태복음 5:13','A','2026-06-21'),V('마태복음 5:14','A','2026-06-21'),
          V('시편 119:105','B','2026-07-01'),V('로마서 8:28','C','2026-07-05')];
  VERSES[0].tags=['소금과 빛','제자도'];
  VERSES[1].tags=['소금과 빛'];
  VERSES[2].tags=['말씀'];
  VERSES[3].tags=[];

  const bk=_swBooks(0);
  sc.eq('책 수', bk.length, 3);
  sc.eq('많이 담긴 순 첫째', bk[0].name, '마태복음');
  sc.eq('그 책의 말씀 수', bk[0].n, 2);
  // ⚠️ 성경 순서는 이름순이 아니다 — 창세기→요한계시록. 시편이 마태복음보다 앞이다.
  const ord=_swBooks(1);
  sc.eq('성경 순서 첫째는 시편', ord[0].name, '시편');
  sc.eq('성경 순서 끝은 로마서', ord[ord.length-1].name, '로마서');

  const tg=_swTags(0);
  sc.eq('태그 수', tg.length, 3);
  sc.eq('많은 순 첫째', tg[0].name, '소금과 빛');
  sc.eq('그 태그의 말씀 수', tg[0].n, 2);
  // ⚠️ 한 말씀에 태그가 여럿이면 **각각** 세어야 한다. 하나만 세면 합계가 어긋난다.
  sc.eq('태그 합계', tg.reduce((a,x)=>a+x.n,0), 4);
  sc.eq('태그 없는 말씀은 안 센다', tg.some(x=>!x.name), false);

  LIKE={'2026-08-20':[{ref:'마태복음 5:13',time:'09:10'}],
        '2026-07-02':[{ref:'시편 119:105',time:'09:10'}]};
  MEM ={'2026-08-28':{am:[{ref:'로마서 8:28',time:'07:30'}]}};
  DEEP={}; EVEN={}; SHARE={};
  const all=_swReacts(0);
  sc.eq('0 인 갈래는 안 나온다', all.map(x=>x.name), ['좋아요','암송']);
  sc.eq('좋아요 셈', all[0].n, 2);
  sc.eq('암송 셈', all[1].n, 1);
  // '이번 달' 은 2026-08 만
  const mon=_swReacts(1);
  sc.eq('이번 달 좋아요', mon.find(x=>x.name==='좋아요').n, 1);
  sc.eq('이번 달 암송', mon.find(x=>x.name==='암송').n, 1);
}

// ═══ 9. 타일 더하기 — 저장과 되읽기 ═══
console.log('\n시나리오 9 — 타일 구성을 저장한다');
{
  // 아직 손대지 않았으면 기본 차례
  ST={settings:{}};
  // ⚠️ v26-0922-20 (HB: "처음사용자 디폴트를 … 내가 드래그 조정해서 세팅한대로")
  //    — HB 가 제 판을 손으로 꾸며 둔 차례를 그대로 옮겼다.
  //    '저장'(keep)은 빠져 있다 (담아 둔 것이 없는 사람에게는 빈 칸이라,
  //    편집에서 켤 수 있게만 두었다).
  sc.eq('처음엔 HB 가 꾸며 둔 열하나', _swLoadTiles().map(t=>t.k),
        ['today','ask','insight','recent','tag','need','last','coll','book','react','rhythm']);
  sc.eq("'저장'은 기본에서 빠져 있다", _swLoadTiles().some(t=>t.k==='keep'), false);

  // 저장 → 되읽기
  _SW_TILES=[{k:'tag',s:1,p:3},{k:'last',s:0,p:0}];
  SAVED=0; _swSaveTiles();
  sc.eq('저장이 실제로 불린다', SAVED, 1);
  sc.eq('차례가 그대로', ST.settings.swTiles.map(t=>t.k), ['tag','last']);
  sc.eq('정렬도 함께', ST.settings.swTiles[0].s, 1);
  // ⚠️ p(지금 몇 번째 값을 보는가)는 담지 않는다. 담으면 기기마다 다른 값이
  //    끊임없이 클라우드로 올라가 쓸데없는 충돌을 만든다.
  sc.eq('보던 자리는 담지 않는다', ST.settings.swTiles[0].p, undefined);
  sc.eq('되읽으면 처음부터', _swLoadTiles()[0].p, 0);

  // ⚠️ 다 껐으면 **빈 채로** 둔다. 기본값으로 되살리면 사용자가 끈 것이 되돌아온다.
  ST.settings.swTiles=[];
  sc.eq('다 껐으면 빈 채로', _swLoadTiles().length, 0);

  // 모르는 종류는 조용히 버린다 (뒤 버전에서 없앤 타일이 남아 있을 수 있다)
  ST.settings.swTiles=[{k:'없는타일',s:0},{k:'book',s:0}];
  sc.eq('모르는 종류는 버린다', _swLoadTiles().map(t=>t.k), ['book']);

  // 더하기·끄기
  ST={settings:{}};
  _SW_TILES=_swLoadTiles();
  sc.eq('남은 종류는 저장 하나', _swSpareKinds(), ['keep']);
  _SW_TILES=[{k:'last',s:0,p:0}];
  sc.eq('남은 열하나', _swSpareKinds().sort(),
        ['ask','book','coll','insight','keep','need','react','recent','rhythm','tag','today']);
}

// ═══ 10. BLOCK7 과 갈라져 있는가 ═══
console.log('\n시나리오 10 — 타일 구성은 Sweeter 것이다');
{
  // ⚠️ 이 목록이 두 제품 공용이면, BLOCK7 이 저장할 때마다 Sweeter 의 화면
  //    구성이 오르내린다. _PRODUCT_SCOPED 에 들어 있어야 갈라진다.
  sc.eq('제품별 칸막이에 들어 있다',
        /_PRODUCT_SCOPED=[\s\S]*?'swTiles'[\s\S]*?\];/.test(SRC_DEV), true);
  // 편집을 나갈 때 한 번만 저장한다 (끌 때마다 클라우드로 올리지 않는다)
  sc.eq('나갈 때 저장한다',
        SRC_DEV.includes('_swSaveTiles();                       // 나갈 때 한 번만 저장한다'), true);
  // wide 는 표에서 읽는다 — 타일이 늘어도 하드코딩이 남지 않게
  // (v26-0921-9 부터 종류 이름표 k-<종류> 도 함께 붙는다 — 바탕·글자를 가르는 열쇠)
  // v26-0922-1 — 긴 타일(tall)도 표에서 읽는다 (표지 카드가 두 줄을 차지한다)
  sc.eq('넓은 타일·긴 타일을 표에서 정한다',
        SRC_DEV.includes("return 'sw-tile k-'+t.k+' '+(T.wide?'wide ':'')+(T.tall?'tall':'');"), true);
  sc.eq('긴 타일은 두 줄을 차지한다', SRC_DEV.includes('.sw-tile.tall{grid-row:span 2;}'), true);
}

// ═══ 11. 값을 누르면 그 말씀들이 열린다 ═══
console.log('\n시나리오 11 — 어떤 타일을 눌러도 말씀이 열린다');
{
  // ⚠️ 예전엔 '설교(cat)'로만 걸렀다. 그래서 성경·태그·반응 타일은 값의 이름이
  //    cat 과 맞지 않아 언제나 빈 목록이 나왔고 토스트만 떴다 (HB 신고 26-0830-15).
  VERSES=[V('마태복음 5:13','언덕 위의 도시','2026-06-21'),
          V('마태복음 5:14','언덕 위의 도시','2026-06-21'),
          V('시편 119:105','꿀보다 더 다니이다','2026-07-01')];
  VERSES[0].tags=['소금과 빛']; VERSES[1].tags=['소금과 빛','제자도']; VERSES[2].tags=['말씀'];
  LIKE={'2026-08-20':[{ref:'시편 119:105',time:'09:10'}]};
  MEM={}; DEEP={}; EVEN={}; SHARE={};

  const at=(k,v)=>_swVersesFor({k},{v});
  sc.eq('설교로 고른다', at('recent',{cat:'언덕 위의 도시'}).length, 2);
  sc.eq('성경으로 고른다', at('book',{name:'마태복음'}).length, 2);
  sc.eq('그 밖의 책', at('book',{name:'시편'}).map(v=>v.ref), ['시편 119:105']);
  sc.eq('태그로 고른다', at('tag',{name:'소금과 빛'}).length, 2);
  sc.eq('태그 하나만 붙은 것', at('tag',{name:'제자도'}).map(v=>v.ref), ['마태복음 5:14']);
  sc.eq('반응으로 고른다', at('react',{kind:'like'}).map(v=>v.ref), ['시편 119:105']);
  sc.eq('기록 없는 반응은 빈 목록', at('react',{kind:'mem'}).length, 0);
  // 없는 이름을 물으면 빈 목록 (토스트로 알린다)
  sc.eq('없는 태그', at('tag',{name:'없는태그'}).length, 0);
}

// ═══ 12. 담아두기 ═══
console.log('\n시나리오 12 — 담아두기');
{
  VERSES=[V('마태복음 5:13','A','2026-06-21'),V('시편 119:105','B','2026-07-01')];
  ST={settings:{},verseKeepLog:{}};
  SAVED=0;

  sc.eq('처음엔 담긴 게 없다', _swIsKept('마태복음 5:13'), false);
  sc.eq('담으면 true 를 준다', swToggleKeep('마태복음 5:13'), true);
  sc.eq('담겼다', _swIsKept('마태복음 5:13'), true);
  sc.eq('저장이 불린다', SAVED, 1);
  sc.eq('기록 모양이 좋아요와 같다',
        Object.keys(ST.verseKeepLog).length===1&&
        Array.isArray(ST.verseKeepLog['2026-08-30'])&&
        ST.verseKeepLog['2026-08-30'][0].ref==='마태복음 5:13', true);

  // ⚠️ 뺄 때는 그 장절의 기록을 **모두** 지운다. 하나라도 남으면 다시 담은
  //    것처럼 되살아난다.
  ST.verseKeepLog={'2026-08-28':[{ref:'마태복음 5:13',time:'10:00'}],
                   '2026-08-30':[{ref:'마태복음 5:13',time:'11:00'},
                                 {ref:'시편 119:105',time:'12:00'}]};
  sc.eq('빼면 false 를 준다', swToggleKeep('마태복음 5:13'), false);
  sc.eq('여러 날에 걸친 기록도 다 지운다', _swIsKept('마태복음 5:13'), false);
  sc.eq('다른 말씀은 남는다', _swIsKept('시편 119:105'), true);
  sc.eq('빈 날은 통째로 지운다', ST.verseKeepLog['2026-08-28'], undefined);

  // 담아둔 것 목록 — 담은 때가 새로운 것부터
  ST.verseKeepLog={'2026-08-20':[{ref:'마태복음 5:13',time:'09:00'}],
                   '2026-08-29':[{ref:'시편 119:105',time:'09:00'}]};
  sc.eq('새로운 것부터', _swKeeps(0).map(x=>x.ref), ['시편 119:105','마태복음 5:13']);
  sc.eq('오래된 것부터', _swKeeps(1).map(x=>x.ref), ['마태복음 5:13','시편 119:105']);
  // ⚠️ 지금 켜진 모음에 없는 말씀은 조용히 건너뛴다 (본문 없이 장절만 뜨면 빈 카드가 된다)
  ST.verseKeepLog['2026-08-30']=[{ref:'없는 구절 1:1',time:'09:00'}];
  sc.eq('찾지 못한 말씀은 건너뛴다', _swKeeps(0).length, 2);
}

// ═══ 13. 담아두기 기록이 병합에서 살아남는가 ═══
console.log('\n시나리오 13 — 담아두기 기록의 자리');
{
  // ⚠️ 새 기록은 다섯 곳에 모두 이름을 올려야 한다. 하나라도 빠지면 기기 간에
  //    사라지거나(병합), 시작할 때 비거나(기본값), 클라우드에서 안 온다.
  sc.eq('① 기본 상태에 있다', /defaultState[\s\S]{0,900}verseKeepLog:\{\}/.test(SRC_DEV), true);
  sc.eq('② 시작할 때 채운다',
        SRC_DEV.includes('if(!ST.verseKeepLog)ST.verseKeepLog={};'), true);
  sc.eq('③ 병합이 로그로 다룬다',
        SRC_DEV.includes("||k==='verseKeepLog')v=_mgLogFlat(bv,lv,cv,baseKnown);"), true);
  sc.eq('④ 대량 손실 방어가 센다',
        SRC_DEV.includes('verseLogs:_fbCountArrays(o.verseKeepLog||{},0)'), true);
  sc.eq('⑤ 클라우드에서 받아 반영한다',
        SRC_DEV.includes('if(remote.verseKeepLog)ST.verseKeepLog=remote.verseKeepLog;'), true);
  // 갈피표는 고정 세간이다 (흐르는 묶음 안에 있으면 넘길 때 같이 흐른다)
  VERSES=[V('마태복음 5:13','A','2026-06-21')];
  ST={settings:{},verseKeepLog:{'2026-08-20':[{ref:'마태복음 5:13',time:'09:00'}]}};
  LIKE={}; MEM={}; DEEP={}; EVEN={}; SHARE={};
  const h=_swFace({k:'keep',p:1,s:0});
  sc.eq('갈피표가 이름줄 안에 있다', /class="sw-lab"><button class="sw-keep/.test(h), true);
  sc.eq('담긴 것은 켜져 보인다', h.includes('class="sw-keep on"'), true);
}

// ═══ 14. 전체화면 액션 줄의 담아두기 (v26-0830-16) ═══
console.log('\n시나리오 14 — 전체화면에서도 담을 수 있는가');
{
  // ⚠️ v26-0902-1 — 운영본(index.html)이 아니라 **개발본**에서 떠온다.
  //    새 작업은 개발본만 담은 PR 로 먼저 올라가므로(CLAUDE.md), 운영본을 읽으면
  //    아직 안 올라간 코드를 검사하게 되어 새 시험이 헛돈다. 둘은 다섯 줄
  //    (DEV_MODE 등)만 다르고 앱 코드는 글자 하나까지 같다.
  const SRC = SRC_DEV;

  sc.eq('액션 줄에 단추가 있다',
        /<button class="vf-act vf-act-keep" id="vfActkeep" onclick="vfAct\('keep'\)"/.test(SRC), true);
  // v26-0831-6 — 장절이 아니라 **반응 키**로 담는다 (한 설교의 명제들이
  //    장절을 공유해서, 장절로 담으면 그 설교의 명제가 전부 담긴 것으로 보인다)
  // v26-0831-13, HB — 탭 한 번에 **목록 고르기** 창. 저장 여부는 그 창에서 정한다.
  sc.eq('vfAct 가 목록 고르기를 연다',
        /else if\(kind==='keep'\)\{[\s\S]{0,300}openKeepPicker\(_reactKey\(v\)\);/.test(SRC), true);
  sc.eq('저장 타일을 다시 그린다', SRC.includes('_swRepaintKeepTiles()'), true);

  // v26-0831-11, HB — 이제 **두 제품 모두, 말씀도 명제도** 늘 보인다.
  //   BLOCK7 에도 꺼내 볼 자리가 생겼다 (좌상단 말씀메뉴 → 말씀 저장 목록).
  //   자리도 **공유(종이비행기) 바로 위**로 통일했다.
  sc.eq('감추던 규칙을 없앴다', SRC.includes('.vf-act-keep{display:none;}'), false);
  sc.eq('제품·종류를 가리지 않는다',
        SRC.includes("const show=((typeof _swOn==='function')&&_swOn())||_vfIsProp(v);"), false);
  // 채운 책갈피는 **담긴 데가 있는가**만 본다 (제품·종류를 안 본다).
  // v26-0902-1 — 숫자를 0 으로도 적어야 해서 담긴 목록 수를 한 번만 세고
  //   그것으로 판단한다 (_swIsKept(ref) 와 같은 뜻이다).
  sc.eq('저장 여부만 본다',
        SRC.includes('const n=_keepListsOf(ref).size;')&&SRC.includes('const on=n>0;'), true);

  // v26-0831-10, HB — 담아두기가 **책갈피**를 물려받았다. 유튜브·인스타가
  //    '저장'에 쓰는 그 모양이라 설명이 필요 없다. 암송은 책갈피를 내주고
  //    **체크(√)** 로 갔으므로, 한 줄에 나란히 놓여도 둘이 안 겹친다.
  const keepD = 'M7 3h10a1 1 0 0 1 1 1v17l-6-4.2L6 21V4a1 1 0 0 1 1-1z';
  const memD  = 'M5 12.6l4.6 4.6L19 6.4';
  sc.eq('담아두기가 책갈피', SRC.includes("const _KEEP_D='" + keepD + "';"), true);
  sc.eq('암송은 체크', SRC.includes(memD), true);
  sc.eq('둘이 다른 그림', keepD !== memD, true);
  // ⚠️ 예전 주머니 모양이 한 조각이라도 남아 있으면 어딘가에서 그대로 나온다
  sc.eq('주머니는 이제 안 쓴다', SRC.includes('M4 4.6h16v6.4a8 8 0 0 1-16 0z'), false);
  sc.eq('주머니 덮개도 없앴다', SRC.includes('_KEEP_CHEV'), false);
  sc.eq('전체화면·타일이 같은 그림',
        SRC.includes("const _KEEP_D='" + keepD + "';") && SRC.includes('<path d="' + keepD + '"/>'), true);
  sc.eq('공유 이미지에도 그린다', SRC.includes("keep:{p:['" + keepD + "']}"), true);
  // 체크는 칠하면 얇은 삼각형이 된다 → 공유 이미지에서도 획으로만 그린다
  sc.eq('체크는 획으로만 그린다', SRC.includes("mem:{p:['" + memD + "'],line:true"), true);
  sc.eq('빈 문구도 책갈피라고 말한다',
        SRC.includes('말씀 왼쪽 위의 책갈피를 누르면 저장돼요.'), true);
}

// ═══ 15. Sweeter 개발본은 Firebase 에 붙지 않는다 (2026-08-31 사고) ═══
console.log('\n시나리오 15 — Sweeter 개발본의 Firebase 는 꺼져 있어야 한다');
{
  // ⛔️ v26-0830-16 에서 한 번 켰다가 계정 데이터를 통째로 날렸다.
  //
  //  까닭이었던 것 — 동기화 기준점 세 키가 제품별로 갈려 있지 않았다.
  //  ✅ 그 까닭은 **v26-0919-5 에서 없앴다** (_lsk 가 LS_KEY 와 같은 규칙으로
  //     가른다). 재현과 증명은 tests/test_product_syncbase.js 시나리오 3·4.
  //
  //  그런데도 **개발본은 계속 꺼 둔다.** 남은 까닭은 다른 것이다 —
  //    · sweeter-dev.html 은 block7.my 에 얹혀 산다. 운영본 BLOCK7 과 같은
  //      도메인에서 로그인 두 벌이 오가면 확인할 것이 갑절이 된다.
  //    · 켜는 자리는 **제 도메인에 설 운영본 sweeter.html** 이다. 그 파일이
  //      생기기 전에는 켤 자리 자체가 없다.
  //  → 이 시험은 "개발본은 꺼져 있다" 만 지킨다. 운영본을 만들 때 그 파일에
  //    맞는 시험을 새로 쓴다.
  const mk = require('fs').readFileSync(__dirname + '/../tools/make-sweeter.sh', 'utf8');
  sc.eq('DEV_MODE 를 켠다(=Firebase 끔)',
        mk.includes("sub_once(out,'const DEV_MODE = false;','const DEV_MODE = true;','DEV_MODE')"), true);
  sc.eq('왜 켜면 안 되는지 적어 뒀다', mk.includes('DEV_MODE 를 false 로 두지 말 것'), true);

  const sw = require('fs').readFileSync(__dirname + '/../sweeter-dev.html', 'utf8');
  sc.eq('개발본은 Firebase 가 꺼져 있다', sw.includes('const DEV_MODE = true;'), true);
  sc.eq('제품은 sweeter 다', sw.includes('const APP_PRODUCT = "sweeter";'), true);
  sc.eq('저장 키는 b7v1_sweeter_dev',
        (sw.includes('const APP_PRODUCT = "sweeter";') && sw.includes('const DEV_MODE = true;')), true);

  // 기준점 세 키가 **이제는 갈려 있다**. 예전에는 여기서 "아직 고정 이름"임을
  // 못 박아 두었는데, 그 금지를 푸는 것이 v26-0919-5 의 일이었다.
  // ⚠️ 이 둘이 다시 고정 이름으로 돌아가면 사고 조건이 그대로 되살아난다.
  const SRC = require('fs').readFileSync(__dirname + '/../index.html', 'utf8');
  sc.eq('소유자 키가 제품별로 갈렸다', SRC.includes("localStorage.getItem(_lsk('owner'))"), true);
  sc.eq('기준점 키도 제품별로 갈렸다',
        SRC.includes("const _FB_BASE_KEY=_lsk('syncbase'),_FB_META_KEY=_lsk('syncmeta');"), true);
  sc.eq('이름 규칙은 LS_KEY 에서 나온다',
        SRC.includes("function _lsk(name){return LS_KEY+'_'+name;}"), true);
}

// ═══ 16. ⚠️ BLOCK7 이 Sweeter 판을 미리 볼 때 제 설정을 건드리지 않는가 ═══
console.log('\n시나리오 16 — BLOCK7 의 미리보기는 읽기만 한다');
{
  // 아이폰 홈 화면 앱에서는 웹앱끼리 서로를 못 불러서, BLOCK7 안에서 Sweeter
  // 화면을 보여 준다 (v26-0921-4, HB). 그때 **BLOCK7 의 클라우드 문서가
  // 예전과 한 글자도 달라지면 안 된다** (CLAUDE.md).
  APP_PRODUCT='block7';
  ST={settings:{theme:'dark'},productSettings:{sweeter:{swTiles:[{k:'coll',s:1},{k:'tag',s:0}]}}};
  // ⚠️ v26-0922-1 — 새 타일 한 번 끼우기(판 번호)가 미리보기에서도 보인다.
  //    **쓰지는 않는다** — 아래 '저장을 부르지 않는다' 가 그것을 지킨다.
  sc.eq('Sweeter 몫을 읽는다', _swLoadTiles().map(t=>t.k),
        ['today','insight','need','ask','rhythm','coll','tag']);
  sc.eq('정렬 값도 함께', _swLoadTiles().find(t=>t.k==='coll').s, 1);
  sc.eq('미리보기에서는 판 번호를 쓰지 않는다',
        (ST.productSettings.sweeter.swTilesV===undefined)&&(ST.settings.swTilesV===undefined), true);

  // ⭐ 저장은 **하지 않는다**
  _SW_TILES=[{k:'last',s:0},{k:'book',s:2}];
  SAVED=0;
  _swSaveTiles();
  sc.eq('⭐ 저장을 부르지 않는다', SAVED, 0);
  sc.eq('⭐ BLOCK7 의 settings 에 swTiles 가 생기지 않는다', ST.settings.swTiles, undefined);
  sc.eq('⭐ Sweeter 몫도 건드리지 않는다',
        ST.productSettings.sweeter.swTiles.map(t=>t.k), ['coll','tag']);
  sc.eq('BLOCK7 의 다른 설정도 그대로', ST.settings.theme, 'dark');

  // Sweeter 몫이 아직 없으면 기본 차례로 (빈 화면이 되면 안 된다)
  ST={settings:{},productSettings:{}};
  sc.eq('Sweeter 몫이 없으면 기본 차례', _swLoadTiles().map(t=>t.k), _SW_DEFAULT_TILES);
  ST={settings:{}};
  sc.eq('productSettings 자체가 없어도 터지지 않는다', _swLoadTiles().length>0, true);

  // 제 제품(Sweeter)에서는 예전 그대로 제 settings 에 저장한다
  APP_PRODUCT='sweeter';
  ST={settings:{},productSettings:{}};
  _SW_TILES=[{k:'last',s:0}];
  SAVED=0;
  _swSaveTiles();
  sc.eq('Sweeter 는 예전처럼 저장한다', [SAVED,ST.settings.swTiles.length], [1,1]);

  // 판을 보여 주어야 하는가 — 제품과 '상대 화면 보는 중' 의 조합
  APP_PRODUCT='sweeter'; _swCross=false; sc.eq('Sweeter 평소 = 판 켬', _swBoardOn(), true);
  _swCross=true;                          sc.eq('Sweeter 상대화면 = 판 끔', _swBoardOn(), false);
  APP_PRODUCT='block7';  _swCross=false; sc.eq('BLOCK7 평소 = 판 끔', _swBoardOn(), false);
  _swCross=true;                          sc.eq('BLOCK7 상대화면 = 판 켬', _swBoardOn(), true);
  _swCross=false;
}

// ═══ 17. 매거진 얼굴 · 편집 중 스크롤 · 필터 아이콘 (v26-0921-9, HB) ═══
console.log('\n시나리오 17 — 매거진 얼굴 · 편집 중 스크롤 · 필터 아이콘');
{
  APP_PRODUCT='sweeter';
  VERSES=[V('마태복음 5:13','언덕 위의 도시','2026-06-21'),
          V('시편 119:105','등불','2026-07-01')];
  VERSES[0].tags=['소금과 빛'];
  ST={settings:{},verseKeepLog:{}};
  LIKE={'2026-08-20':[{ref:'마태복음 5:13',time:'09:10'}]};
  MEM={}; DEEP={}; EVEN={}; SHARE={};
  _SW_TILES=[{k:'last',s:0,p:0},{k:'recent',s:0,p:0},{k:'book',s:0,p:0}];

  // ── ① 첫 칸이 곧 첫 내용이다 (타이틀 칸이 사라졌다)
  const hL=_swFace(_SW_TILES[0]);
  sc.eq('첫 칸부터 말씀 본문', hL.includes('언덕 위의 도시 본문'), true);
  sc.eq('장절은 본문 위 머리말로', hL.includes('<div class="sw-kick">마태복음 5:13</div>'), true);
  // ── ② 개수는 아랫줄에 언제나 있다 (예전엔 첫 칸에서만 보였다)
  sc.eq('아랫줄에 개수',
        hL.includes('<div class="sw-pips"><span class="sw-cnt">말씀 1</span>'), true);
  sc.eq('세는 단위는 종류마다',
        [_swCountText('recent',3),_swCountText('book',3),_swCountText('react',3)],
        ['설교 3편','3권','3가지']);
  // ── ③ 차례 번호 — 목차의 그 번호
  sc.eq('첫 타일은 01', hL.includes('<b class="sw-ix">01</b>'), true);
  sc.eq('셋째 타일은 03', _swFace(_SW_TILES[2]).includes('<b class="sw-ix">03</b>'), true);
  sc.eq('번호는 이름 앞에', hL.indexOf('sw-ix')<hL.indexOf('sw-nm'), true);
  // ── ④ 종류마다 낯이 다르다
  sc.eq('설교 칸', _swFace(_SW_TILES[1]).includes('class="sw-cell sermon"'), true);
  sc.eq('성경 칸', _swFace(_SW_TILES[2]).includes('class="sw-cell book"'), true);
  sc.eq('타일에 종류 이름표', _swTileClass(_SW_TILES[1]), 'sw-tile k-recent ');
  // ⚠️ v26-0922-1 — 그림이 있으면 큰 숫자는 그리지 않는다 (자리가 같아 겹친다).
  //    성경 타일에는 66권 격자가 깔리므로 숫자가 아니라 그림이 뜬다.
  const _hb=_swFace(_SW_TILES[2]);
  sc.eq('성경 칸에는 그림이 깔린다', _hb.includes('class="sw-sig"'), true);
  sc.eq('그림이 있으면 큰 숫자는 없다', _hb.includes('class="sw-big"'), false);
  sc.eq('큰 숫자는 옅게만',
        /\.sw-big\{[^}]*opacity:\.09;\}/.test(SRC_DEV), true);
  // ⚠️ 큰 숫자·머리말은 칸의 **위쪽**에 둔다 — 내용이 아래로 붙으므로 아래에
  //    두면 글자와 겹쳐 둘 다 흐려진다 (첫 시안에서 그랬다).
  // ⚠️ v26-0922-11 — 칸(.sw-cell)이 타일을 통째로 덮게 되면서, 칸 위쪽에 붙는
  //    장식은 이름줄 높이(--sw-ct)만큼 내려와야 이름줄과 안 겹친다.
  sc.eq('큰 숫자는 위쪽에', /\.sw-big\{[^}]*top:calc\(var\(--sw-ct,0px\) - 6px\)/.test(SRC_DEV), true);
  // ⚠️⚠️ v26-0922-13 — 머리말은 **흐름 안**에 둔다 (HB: "하단 내용이 3줄일 때
  //    타이틀이 올라가면서 좌상단 고정텍스트와 겹치게 돼"). 띄워 두면 본문이
  //    위로 자라며 머리말을 덮는다. margin-bottom:auto 가 맨 위로 올려 준다.
  sc.eq('머리말도 위쪽에', /\.sw-kick\{position:relative;flex-shrink:0;margin-bottom:auto;/.test(SRC_DEV), true);
  sc.eq('머리말을 띄우지 않는다', /\.sw-kick\{position:absolute/.test(SRC_DEV), false);
  sc.eq('오른쪽 그림은 padding 으로 피한다',
        /\.k-coll \.sw-kick\{padding-right:42%;\}/.test(SRC_DEV), true);
  // ⚠️⚠️ 이름줄·점줄 높이와 칸 여백은 **같은 값**이라야 한다. 어긋나면 글자가
  //    이름줄·점줄과 겹친다 (HB 2 — "좌상단 글자와 타이틀이 겹쳐보이는 곳도 있어").
  sc.eq('띠가 타일을 통째로 덮는다',
        /\.sw-trackwrap\{[^}]*margin:calc\(0px - var\(--sw-ct,0px\)\) -13px calc\(0px - var\(--sw-cb,0px\)\)/.test(SRC_DEV), true);
  sc.eq('칸은 그만큼 안쪽 여백을 둔다',
        /\.sw-cell\{[^}]*padding:var\(--sw-ct,0px\) 13px var\(--sw-cb,0px\)/.test(SRC_DEV), true);
  sc.eq('이름줄 높이를 못박았다', /\.sw-lab\{[^}]*height:20px/.test(SRC_DEV), true);
  sc.eq('이름줄은 사진 위에', /\.sw-lab\{[^}]*z-index:2/.test(SRC_DEV), true);
  sc.eq('점줄도 사진 위에', /\.sw-pips\{[^}]*z-index:2/.test(SRC_DEV), true);
  // 값이 없으면 예전처럼 까닭을 적는다 (아랫줄도 안 그린다)
  const hE=_swFace({k:'keep',s:0,p:0});   // 담아둔 것이 하나도 없는 타일
  sc.eq('빈 타일은 까닭만', hE.includes('sw-pips'), false);

  // ── ⑤ 눌러서 여는 자리도 타이틀 없이 센다
  TOAST='';
  _SW_TILES=[{k:'tag',s:0,p:0}];
  VERSES=[V('마태복음 5:13','A','2026-06-21')];   // 태그 없음 → 값 0
  _swTileOpen(0);
  sc.eq('값이 없으면 까닭을 알려 준다', TOAST.includes('태그가 붙은 말씀이'), true);

  // ── ⑥ 편집 중에도 세로로 훑을 수 있다 (HB 신고 — "폴드 타임이 거의 없다")
  // v26-0921-11, HB — "아직도 저절로 드래그된다. 짧은 홀드 시간을 줘야 할 것 같아"
  sc.eq('잡는 시간이 있다', SRC_DEV.includes('const _SW_EDIT_HOLD=400;'), true);
  sc.eq('움직임 문턱도 있다', SRC_DEV.includes('const _SW_EDIT_MOVE=6;'), true);
  sc.eq('누르자마자 끌지 않는다',
        SRC_DEV.includes('if(_SW_EDIT){_swDragStart(el,i,e.clientX,e.clientY);'), false);
  sc.eq('잡는 중이라는 표시를 둔다', SRC_DEV.includes('_swG={i,el,pend:true,'), true);
  // ⚠️⚠️ 끌기로 들어가는 길은 **잡고 있기 하나뿐**이다. 예전에 있던
  //    "가로로 밀면 바로 끌기" 지름길이 70도까지 가로로 쳐주는 잣대(_SW_ANGLE)를
  //    써서, 조금 기울어진 세로 훑기가 끌기로 읽혔다 (HB 신고).
  const _pend=/if\(_swG\.pend\)\{[\s\S]*?\n    \}/.exec(SRC_DEV)[0];
  sc.eq('움직이면 방향을 가리지 않고 놓아 준다',
        /Math\.abs\(dx\)<_SW_EDIT_MOVE&&Math\.abs\(dy\)<_SW_EDIT_MOVE\)return;[\s\S]{0,120}_swG=null;/.test(_pend), true);
  sc.eq('⭐ 잡는 중에는 각도를 보지 않는다', _pend.includes('_SW_ANGLE'), false);
  sc.eq('⭐ 움직이다가 끌기로 넘어가지 않는다', _pend.includes('_swDragStart'), false);
  sc.eq('잡는 중에 뗀 것은 아무 일도 아니다',
        SRC_DEV.includes('if(_swG.pend){_swG=null;return;}'), true);

  // ── ⑦ 우상단 — '편집' 이 필터 아이콘에게 자리를 내줬다
  sc.eq('필터 단추가 있다', SRC_DEV.includes('id="swFilterBtn"'), true);
  sc.eq('누르면 말씀 모음으로', SRC_DEV.includes('onclick="swOpenCollFilter()"'), true);
  sc.eq('세 번 반짝이는 그 길을 그대로 쓴다',
        /function swOpenCollFilter\(\)\{[\s\S]{0,260}_vsetGoColl\(\);/.test(SRC_DEV), true);
  sc.eq("'편집' 글자는 없앴다", SRC_DEV.includes('onclick="swToggleEdit()">편집</button>'), false);
  sc.eq('편집 중에만 완료가 뜬다',
        /function _swEditBtnSync\(\)\{[\s\S]{0,400}done\.style\.display=\(mine&&_SW_EDIT\)/.test(SRC_DEV), true);
  sc.eq('둘은 나란히 서지 않고 교체된다',
        /filt\.style\.display=\(mine&&!_SW_EDIT\)/.test(SRC_DEV), true);
  // 들어가는 길은 롱터치 하나 — 나가는 길(타일 바깥)은 그대로 있어야 한다
  sc.eq('나가는 길은 남아 있다',
        SRC_DEV.includes('if(!el){if(_SW_EDIT)swToggleEdit();return;}'), true);
}

// ═══ 18. 2차 — 대표 문구·글씨체 · 요즘 우리 교회 · 나의 리듬 (v26-0922-2, HB) ═══
console.log('\n시나리오 18 — 대표 문구 · 흐름 · 리듬');
{
  APP_PRODUCT='sweeter';
  // ── ① 대표 문구(명제) · 강조 문구(말씀)
  const prop={ref:'마 5:13',pid:'P0001',krText:'명제 본문',hi:'소금과 빛',hi2:'너희는',tags:[]};
  sc.eq('명제는 대표 문구를 쓴다', ['소금과 빛','너희는'].includes(_swHiText(prop)), true);
  sc.eq('같은 명제는 늘 같은 문구', _swHiText(prop), _swHiText(prop));
  const v1={ref:'요 1:1',krText:'본문',hi:'이 말씀은 곧 하나님이시니라/말씀이 육신이 되어',tags:[]};
  sc.eq('말씀은 첫 강조 문구만', _swHiText(v1), '이 말씀은 곧 하나님이시니라');
  sc.eq('문구가 없으면 빈 줄', _swHiText({ref:'가 1:1',krText:'본문'}), '');
  // ── ② 글씨체는 **판에 한 벌** (여러 벌을 받으면 한글 글꼴이 수백 KB씩 온다)
  ST={settings:{propTitleFonts:['brush','dokdo','yeon']},verseKeepLog:{}};
  _swHandFontKey='';
  const f1=_swHandFont();
  sc.eq('켜 둔 글씨체 가운데 하나', ['brush','dokdo','yeon'].includes(f1), true);
  sc.eq('같은 날엔 같은 글씨체', _swHandFont(), f1);
  sc.eq('칸마다 새로 뽑지 않는다',
        /function _swHiHTML\(v\)\{[\s\S]{0,240}_swHandFont\(\)/.test(SRC_DEV), true);

  // ── ③ 요즘 우리 교회 — 흐름을 읽는다
  const V2=(ref,cat,topic,d,tags)=>({idx:0,cat,topic,krText:cat+' 본문',ref,tags:tags||[],hi:'',d,pid:'',kind:''});
  // ⚠️ '최근 흐름' 은 설교 **여덟 번**이다 (v26-0922-18) — 그만큼 날짜를 둔다.
  //    넷이던 때에는 한 연속 설교가 통째로 들어와 "요즘 설교는 …에 머물러
  //    있어요" 가 전체 이야기처럼 읽혔다 (HB 신고).
  VERSES=[
    V2('에베소서 1:3','주일예배','은혜의 부르심','2026-09-21',['은혜','부르심']),
    V2('에베소서 2:8','주일예배','은혜의 부르심','2026-09-21',['은혜']),
    V2('에베소서 4:1','주일예배','합당한 삶','2026-09-14',['은혜','순종']),
    V2('에베소서 5:1','주일예배','합당한 삶','2026-09-07',['순종']),
    V2('에베소서 5:2','주일예배','합당한 삶','2026-08-31',['순종']),
    V2('에베소서 5:3','주일예배','합당한 삶','2026-08-24',['순종']),
    V2('에베소서 5:4','주일예배','합당한 삶','2026-08-17',['순종']),
    V2('에베소서 5:5','주일예배','합당한 삶','2026-08-10',['순종']),
    V2('에베소서 5:6','주일예배','합당한 삶','2026-08-03',['순종']),
    V2('창세기 1:1','주일예배','창조','2026-06-01',['창조']),
    V2('창세기 2:7','주일예배','창조','2026-05-25',['창조'])
  ];
  LIKE={'2026-09-20':[{ref:'에베소서 1:3',time:'09:00'}]};
  MEM={}; DEEP={}; EVEN={}; SHARE={};
  const ins=_swInsights(0);
  sc.eq('흐름을 읽어 낸다', ins.length>=3, true);
  // ⚠️ **어느 구간을 본 말인지**를 문장 안에 둔다 (v26-0922-18, HB) —
  //    "최근 설교 4번 가운데 3번" 만으로는 전체 이야기인 줄 읽힌다.
  sc.eq('성경 흐름을 설교 횟수로 말한다',
        /요즘 설교는 에베소서에 머물러 있어요 — 8월 3일 이후 설교 \d번 가운데 \d번/.test(ins[0].text), true);
  // '모두' 로 넘기면 전체를 말한다 — "왜 마태복음이 아니지?" 에 바로 답하는 자리
  sc.eq('모두로 넘기면 전체를 본다',
        /모아 둔 설교를 보면 에베소서가 가장 많아요 — 설교 \d+번 가운데 \d+번/.test(_swInsights(1)[0].text), true);
  sc.eq('칩 이름도 바꿨다', _SW_TYPES.insight.sorts, ['최근 흐름','모두']);
  sc.eq('되풀이되는 주제', ins.some(x=>/되풀이되는 주제는/.test(x.text)), true);
  sc.eq('⭐ 내가 머문 자리를 말한다',
        ins.some(x=>/가장 많이 머문/.test(x.text)), true);
  // ⚠️⚠️ HB 가 여러 번 못 박은 것 — **'내가 안 본 것'을 권면하지 않는다.**
  // ⚠️ 주석은 빼고 본다 — 이 규칙을 적어 둔 **경고 주석 자체**에 그 말이 들어 있다
  const insSrc=sliceDev('function _swInsights(sortIdx){','function _swVersesForInsight')
                 .replace(/\/\/[^\n]*/g,'');
  sc.eq('⭐ 빈칸 채우기 권면을 만들지 않는다',
        /안 읽|안 본|아직 한 번도|읽지 않|만나지 않/.test(insSrc), false);
  // 누르면 그 흐름의 말씀들로 간다
  const hit=_swVersesForInsight({axis:'book',key:'에베소서'},0).map(v=>v.ref);
  sc.eq('그 흐름 안의 말씀만', hit.slice(0,4), ['에베소서 1:3','에베소서 2:8','에베소서 4:1','에베소서 5:1']);
  sc.eq('여덟 번 안의 것만', hit.length, 9);
  sc.eq('흐름 밖(옛 설교)은 안 들어온다', hit.some(r=>/창세기/.test(r)), false);
  // 날짜가 없으면 아무 말도 하지 않는다 (없는 흐름을 지어내지 않는다)
  VERSES=[V2('마 5:13','A','제자도','',['빛'])];
  sc.eq('흐름을 못 읽으면 빈 손', _swInsights(0), []);

  // ── ④ 나의 리듬
  VERSES=[V2('마 5:13','A','제자도','2026-09-01',['빛'])];
  LIKE={'2026-09-18':[{ref:'마 5:13',time:'07:30'}],      // 금요일 오전
        '2026-09-19':[{ref:'마 5:13',time:'21:10'}],      // 토요일 밤
        '2026-08-14':[{ref:'마 5:13',time:'07:40'}]};     // 지난달 금요일 오전
  MEM={}; DEEP={}; EVEN={}; SHARE={};
  const rh=_swRhythm(0);
  // ⚠️ v26-0922-17 (HB) — 첫 칸은 **오늘 요일의 등수**다. 이 시험의 오늘은
  //    2026-08-30(일요일)이고 일요일에는 기록이 없으므로 꼴찌 무리에 든다.
  sc.eq('첫 칸은 오늘 요일의 등수', rh[0].kind, 'rank');
  sc.eq('등수 이름', rh[0].name, '일주일 중 3위');
  sc.eq('하단 문구', rh[0].text, '일요일은 일주일 중 3위로 말씀을 많이 보았어요');
  // ⚠️ s 가 음수면 그 **요일 줄 전체**에 불을 켠다
  sc.eq('요일 줄에 불을 켠다', rh[0].cell, {d:0,s:-1});
  // ⚠️⚠️ 둘째 칸도 **오늘 요일 안에서** 고른다 (v26-0922-18, HB 가 못 박았다).
  //    일주일 전체에서 고르면 ①은 오늘 이야기인데 ②만 일주일 이야기가 된다.
  //    이 시험의 오늘은 일요일이고 일요일에는 기록이 없다 → 그대로 말한다.
  sc.eq('둘째 칸도 오늘 요일 것', rh[1].name, '일요일');
  sc.eq('없으면 없다고 말한다', rh[1].text, '일요일에는 아직 말씀을 만난 기록이 없어요');
  sc.eq('금요일을 집어오지 않는다', rh.some(x=>/금요일/.test(x.name)), false);
  // ⚠️ 칸은 **둘뿐**이다 (HB: "3번은 일단 지금은 2개만 있는 거야")
  sc.eq('두 장', rh.length, 2);
  sc.eq("'모두' 칸은 없다", rh.some(x=>x.name==='모두'), false);
  // 오늘 요일에 기록이 있으면 그 요일 안에서 가장 많은 때를 집는다
  LIKE={'2026-08-30':[{ref:'마 5:13',time:'20:10'},{ref:'마 5:13',time:'21:00'}],
        '2026-09-18':[{ref:'마 5:13',time:'07:30'}]};
  const rhD=_swRhythm(0);
  sc.eq('오늘 요일 안에서 가장 많은 때', rhD[1].name, '일요일 밤');
  sc.eq('그 칸에 불을 켠다', rhD[1].cell, {d:0,s:3});
  LIKE={'2026-09-18':[{ref:'마 5:13',time:'07:30'}],
        '2026-09-19':[{ref:'마 5:13',time:'21:10'}],
        '2026-08-14':[{ref:'마 5:13',time:'07:40'}]};
  // '이번 달' — 이 시험의 오늘은 2026-08-30 이므로 8월 것 하나만 센다
  const rhM=_swRhythm(1);
  sc.eq('이번 달만 셀 때도 등수가 먼저', rhM[0].kind, 'rank');
  // 격자는 7×4 (요일 × 때)
  sc.eq('격자는 요일 × 때', _swRhythmGrid(0).g.length, 7);
  sc.eq('때는 넷', _swRhythmGrid(0).g[0].length, 4);
  // 리듬은 말씀이 아니라 대시보드로 간다
  sc.eq('리듬은 대시보드로',
        /if\(t\.k==='rhythm'\)\{[\s\S]{0,160}openVerseDashboard\(\);/.test(SRC_DEV), true);

  // ── ⑤ 기본 차례에 둘 다 들어왔다 (판 번호로 한 번 끼워 준다)
  sc.eq('기본 차례에 있다',
        [_SW_DEFAULT_TILES.indexOf('insight')>=0,_SW_DEFAULT_TILES.indexOf('rhythm')>=0], [true,true]);
  sc.eq('판 번호가 올라갔다', _SW_TILES_V>=3, true);
  ST={settings:{swTiles:[{k:'last',s:0}]},verseKeepLog:{}};
  sc.eq('이미 꾸며 둔 기기에도 한 번 끼운다',
        _swLoadTiles().map(t=>t.k).indexOf('insight')>=0, true);
}

// ═══ 19. 3차 — 지금 이런 마음이라면 · 묵상 질문 (v26-0922-3, HB) ═══
// 둘 다 **시트에 이미 적혀 있는 것**에서 나온다 (상황 태그 / 상황·필요 / 묵상 질문).
// ⚠️ 시트에 그 열이 없으면 조용히 비어 있어야 한다 — 지어내지 않는다.
console.log('\n시나리오 19 — 상황/필요 · 묵상 질문 타일');
{
  APP_PRODUCT='sweeter';
  const W=(ref,sit,q,topic)=>({idx:0,cat:'주일예배',topic:topic||'',krText:ref+' 본문',
                               ref,tags:[],hi:'',d:'2026-09-21',pid:'P1',kind:'prop',
                               sit:sit||[],q:q||''});
  VERSES=[
    W('마 5:13',['불안할 때','지칠 때'],'오늘 내 마음은 어디에 매여 있습니까?','제자의 정체성'),
    W('마 5:14',['불안할 때'],'','제자의 정체성'),
    W('요 3:16',['감사할 때'],'내가 붙들고 있는 것은 무엇입니까?','사랑'),
    W('롬 8:28',[],'','섭리')
  ];
  LIKE={};MEM={};DEEP={};EVEN={};SHARE={};
  ST={settings:{},verseKeepLog:{}};

  // ── 상황/필요
  const nd=_swNeeds(0);
  sc.eq('상황을 많은 순으로', nd.map(x=>x.name), ['불안할 때','감사할 때','지칠 때']);
  sc.eq('개수도 함께', nd[0].n, 2);
  sc.eq('이름순으로도 선다', _swNeeds(1).map(x=>x.name), ['감사할 때','불안할 때','지칠 때']);
  sc.eq('상황이 없으면 세지 않는다', nd.some(x=>x.name===''), false);
  // 누르면 그 상황의 말씀들
  const t1={k:'need',s:0,p:0};
  sc.eq('그 상황의 말씀만',
        _swVersesFor(t1,{kind:'val',v:{name:'불안할 때'}}).map(v=>v.ref), ['마 5:13','마 5:14']);
  // 머리말을 겹쳐 적지 않는다 (타일 이름이 이미 그 말이다)
  sc.eq('머리말을 겹치지 않는다', _swFace(t1).includes('이런 마음이라면</div>'), false);
  // ── ⭐ 딱딱한 태그를 **말투로** 바꾼다 (v26-0922-4, HB)
  sc.eq('통제욕구', _swNeedSay('통제욕구'), '내가 쥐고 있어야 마음이 놓일 때');
  sc.eq('관계집착이 관계보다 먼저', _swNeedSay('관계집착'), '그 사람 생각이 떠나지 않을 때');
  sc.eq('기도응답집착', _swNeedSay('기도응답집착'), '기도 응답이 더디게만 느껴질 때');
  sc.eq('이미 말투면 그대로', _swNeedSay('지칠 때'), '지칠 때');
  sc.eq('빈 값은 빈 줄', _swNeedSay(''), '');
  // ⚠️⚠️ v26-0922-5 — 시트를 직접 열어 보니 '상황 태그' 열에 **인물과 신학 분과**가
  //    섞여 있었다 (예수님 27번·다윗 18번·아히멜렉 11번·구원론·신학적 …).
  //    그대로 띄우면 "마음에 ‘아히멜렉’이 있다면" 이 된다 → 이 타일에서 거른다.
  sc.eq('⭐ 인물은 거른다', ['예수님','다윗','아히멜렉','베데스다 병자'].map(_swNeedSkip),
        [true,true,true,true]);
  sc.eq('⭐ 신학 분과·분류도 거른다', ['구원론','성화론','영성신학','신학적','Best 1'].map(_swNeedSkip),
        [true,true,true,true,true]);
  sc.eq('진짜 상황은 남는다', ['통제 욕구','억울함','쓴뿌리','기다림'].map(_swNeedSkip),
        [false,false,false,false]);
  sc.eq('표에 적어 둔 한 글자는 살린다', _swNeedSkip('문'), false);
  // ⚠️ 표를 **먼저** 본다 — '하나님의 때' 가 '때' 로 끝난다고 그대로 나오면 안 된다
  sc.eq('하나님의 때', _swNeedSay('하나님의 때'), '내 때가 아닌 것 같을 때');
  sc.eq('시트에 이미 말투로 적힌 것은 그대로', _swNeedSay('지칠 때'), '지칠 때');
  // 표에 없는 말도 기계 같지 않게 — 한 틀로 찍어내지 않는다 (네 갈래)
  const fall=['불꽃','오병이어','성막','금식','장막','회당'].map(_swNeedSay);
  sc.eq('마지막 길도 여러 모양', new Set(fall.map(x=>x.slice(-6))).size>1, true);
  sc.eq('같은 말은 늘 같은 문장', _swNeedSay('오병이어'), _swNeedSay('오병이어'));
  sc.eq('받침 없는 말의 조사', /\u2018불꽃\u2019을|불꽃이/.test(_swNeedSay('불꽃')), true);
  // '마음' 이 든 말에 '마음에 걸릴 때' 를 붙이면 말이 겹친다
  sc.eq('마음이 겹치지 않는다', /마음이 마음에/.test(_swNeedSay('마음의 평화')), false);
  // 화면에는 말투로, 아랫줄에는 원래 태그 (거르는 것은 여전히 원래 태그로 한다)
  VERSES=[W('마 5:13',['통제욕구'],'','제자의 정체성')];
  const fneed=_swFace({k:'need',s:0,p:0});
  sc.eq('말투가 크게 뜬다', fneed.includes('내가 쥐고 있어야 마음이 놓일 때'), true);
  sc.eq('원래 태그도 남는다', fneed.includes('통제욕구 · 말씀 1'), true);
  VERSES=[
    W('마 5:13',['불안할 때','지칠 때'],'오늘 내 마음은 어디에 매여 있습니까?','제자의 정체성'),
    W('마 5:14',['불안할 때'],'','제자의 정체성'),
    W('요 3:16',['감사할 때'],'내가 붙들고 있는 것은 무엇입니까?','사랑'),
    W('롬 8:28',[],'','섭리')
  ];

  // ── 묵상 질문
  const ak=_swAsks(1);            // '최근 설교' — 질문이 있는 것만
  sc.eq('질문이 적힌 말씀만', ak.length, 2);
  sc.eq('물음을 그대로 들고 온다', ak[0].q.endsWith('?'), true);
  sc.eq('그 말씀도 함께', !!ak[0].verse, true);
  const t2={k:'ask',s:0,p:0};
  sc.eq('물음이 칸의 주인', _swFace(t2).includes('class="sw-cell ask"'), true);
  sc.eq('물음표를 크게 둔다', _swFace(t2).includes('class="sw-quote"'), true);

  // ── ⚠️ 시트에 그 열이 없으면 조용히 빈다
  VERSES=[{idx:0,cat:'A',topic:'',krText:'본문',ref:'마 5:13',tags:[],hi:'',d:'',pid:'',kind:''}];
  sc.eq('상황 열이 없으면 빈 손', _swNeeds(0), []);
  sc.eq('질문 열이 없으면 빈 손', _swAsks(0), []);
  sc.eq('까닭을 적어 둔다',
        [_SW_TYPES.need.empty.includes('상황'),_SW_TYPES.ask.empty.includes('묵상 질문')],
        [true,true]);

  // ── 두 값은 **화면까지 오는 길**이 뚫려 있어야 한다 (hi 가 막혔던 그 자리)
  sc.eq('⭐ ACTIVE_VERSES 가 상황·질문을 들고 온다',
        SRC_DEV.includes("sit:v.sit||[],q:v.q||'',"), true);
  // 기본 차례에 들어왔고, 이미 꾸며 둔 기기에도 한 번 끼워 준다
  sc.eq('판 번호가 올라갔다', _SW_TILES_V, 4);
  ST={settings:{swTiles:[{k:'last',s:0}]},verseKeepLog:{}};
  sc.eq('한 번만 끼운다', _swLoadTiles().map(t=>t.k),
        ['today','insight','need','ask','rhythm','last']);
}

// ═══ 20. 특별 글씨체 · 삽화 · 썸네일 (v26-0922-6, HB 1·2·4·5·6·7·8) ═══
console.log('\n시나리오 20 — 글씨체 · 삽화 · 썸네일');
{
  APP_PRODUCT='sweeter';
  ST={settings:{propTitleFonts:['brush']},verseKeepLog:{}};
  _swHandFontKey='';
  const V3=(ref,o)=>Object.assign({idx:0,cat:'주일예배',topic:'제자의 정체성',
    krText:ref+' 본문',ref,tags:[],hi:'소금과 빛',d:'2026-09-21',pid:'P1',kind:'prop',
    sit:[],q:''},o||{});

  // ① '지금 이런 마음이라면' 타이틀도 판 글씨체로
  VERSES=[V3('마 5:13',{sit:['기다림']})];
  LIKE={};MEM={};DEEP={};EVEN={};SHARE={};
  const fn=_swFace({k:'need',s:0,p:0});
  sc.eq('말투에 판 글씨체를 입힌다', /class="sw-val sw-say pf-brush"/.test(fn), true);
  // ⚠️ .sw-cell.need .sw-val 에 font-family 를 적으면 그 규칙이 이겨 글씨체가 안 먹는다
  sc.eq('글씨체를 이길 규칙을 두지 않는다',
        /\.sw-cell\.need \.sw-val\{[^}]*font-family/.test(SRC_DEV), false);

  // ② 묵상 질문에 대표 문구를 특별 글씨체로
  VERSES=[V3('약 1:2,4',{q:'내가 붙들고 있는 것은 무엇입니까?',hi:'여러 가지 시험'})];
  const fa=_swFace({k:'ask',s:1,p:0});
  sc.eq('대표 문구가 함께 뜬다', fa.includes('여러 가지 시험'), true);
  sc.eq('그것도 판 글씨체', /class="sw-hi pf-brush"/.test(fa), true);
  sc.eq('물음도 그대로', fa.includes('내가 붙들고 있는 것은 무엇입니까?'), true);

  // ④ 최근 설교 — 유튜브 썸네일 (없으면 큰 숫자)
  VERSES=[V3('마 5:13',{yt:'dQw4w9WgXcQ'}),V3('마 5:14',{yt:'dQw4w9WgXcQ'})];
  const fr=_swFace({k:'recent',s:0,p:0});
  // ⚠️⚠️ hqdefault.jpg 는 480×360(4:3)이라 16:9 영상의 **검은 띠가 그림 안에 박혀**
  //    온다 → cover 로 채워도 칸 위아래가 비어 보인다 (v26-0922-10 HB 신고).
  //    16:9 그대로인 것은 maxresdefault 와 mqdefault 뿐이다.
  sc.eq('썸네일을 깐다', fr.includes('i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'), true);
  sc.eq('검은 띠가 박힌 hqdefault 는 쓰지 않는다', fr.includes('hqdefault'), false);
  sc.eq('없는 영상은 mqdefault 로 내려간다', fr.includes('onerror="_swYtThumbFail(this)"'), true);
  sc.eq('내려갈 자리가 16:9 다', _SW_YT_THUMB[2], 'mqdefault.jpg');
  // 주소를 갈아끼워야 하므로 바탕그림이 아니라 <img> 다. 채우는 것은 object-fit.
  // ⚠️ 썸네일에는 sw-yt 가 붙는다 — 사진첩 사진보다 제 색을 더 남긴다 (v26-0922-14)
  sc.eq('<img> 로 넣는다', /<div class="sw-photo sw-yt" aria-hidden="true"><img /.test(fr), true);
  sc.eq('썸네일은 색을 더 살린다', /\.sw-photo\.sw-yt>img\{filter:grayscale\(\.1\)/.test(SRC_DEV), true);
  sc.eq('썸네일은 덜 물들인다', /\.sw-photo\.sw-yt::before\{opacity:\.1;\}/.test(SRC_DEV), true);
  sc.eq('칸을 꽉 채운다', /\.sw-photo>img\{[^}]*object-fit:cover/.test(SRC_DEV), true);
  // ⚠️ 사진첩 사진도 **바탕그림이 아니라 <img>** 다 (v26-0922-13) — 흐리기·
  //    물들이기를 사진에만 걸어야 덮개·그레인까지 흐려지지 않는다.
  sc.eq('사진첩도 <img> 로', /return '<div class="sw-photo" aria-hidden="true"><img alt="" decoding="sync" src="'/.test(SRC_DEV), true);
  // ⚠️⚠️ decoding="sync" 가 **깜빡임을 없앤다** (v26-0922-17, HB: "슬라이드 후
  //    자리잡은 다음에 한번씩 깜빡이는 에러 … 모바일에서만"). 다시 그릴 때
  //    <img> 가 새로 만들어지는데, 그림을 이미 받아 뒀어도 **그리는 일은 다음
  //    프레임으로 미뤄져** 그 한 프레임 동안 칸이 사진 없이 보인다.
  sc.eq('그리기를 미루지 않는다', (SRC_DEV.match(/decoding="sync"/g)||[]).length>=2, true);
  sc.eq('보이는 사진에 lazy 를 붙이지 않는다', /class="sw-photo[^"]*"[^>]*><img alt="" loading="lazy"/.test(SRC_DEV), false);
  sc.eq('바탕그림으로 넣지 않는다', SRC_DEV.includes("style=\"background-image:url("), false);
  sc.eq('⭐ 못 받아도 칸이 비지 않는다', fr.includes('class="sw-big"'), true);
  sc.eq('직선·점 그림은 뺐다', /class="sw-sig"/.test(fr), false);
  VERSES=[V3('마 5:13',{})];
  sc.eq('영상이 없으면 썸네일도 없다', _swFace({k:'recent',s:0,p:0}).includes('ytimg'), false);

  // ⑤ 말씀 모음 — 무엇이 담겼는지 말한다 (고리 % 는 걷어냈다)
  sc.eq('칩 이름을 바꿨다', _SW_TYPES.coll.sorts, ['많은 순','가나다']);
  sc.eq('고리(%)는 없앴다', /function _swSigColl/.test(SRC_DEV)?_swSigHTML({k:'coll',s:0},{n:3}):'', '');

  // ⑥⑦⑧ 삽화 — 성경·반응·리듬 (기존 그림은 그대로 둔 채 왼쪽 위에)
  VERSES=[V3('로마서 8:28',{})];
  const fb=_swFace({k:'book',s:0,p:0});
  sc.eq('성경 타일에 책 삽화', fb.includes('class="sw-ill"'), true);
  sc.eq('모자이크도 그대로', fb.includes('class="sw-sig"'), true);
  LIKE={'2026-09-20':[{ref:'로마서 8:28',time:'09:00'}]};
  const fx=_swFace({k:'react',s:0,p:0});
  sc.eq('반응 타일에 그 갈래의 그림', fx.includes('class="sw-ill"'), true);
  sc.eq('막대도 그대로', fx.includes('class="sw-sig"'), true);
  const fy=_swFace({k:'rhythm',s:0,p:0});
  sc.eq('리듬 타일에 시계', fy.includes('class="sw-ill"'), true);
  sc.eq('격자도 그대로', fy.includes('class="sw-sig"'), true);
  // 삽화는 **왼쪽 위**, 데이터 그림은 **우상단** — 서로 겹치지 않는다
  sc.eq('삽화는 왼쪽', /\.sw-ill\{position:absolute;left:12px/.test(SRC_DEV), true);
  sc.eq('데이터 그림은 오른쪽', /\.sw-sig\{position:absolute;right:12px/.test(SRC_DEV), true);
}

// ═══ 21. PC 판 늘리기 · 꺽쇠 · 표지 카드 열기 (v26-0922-11, HB 2~6) ═══
console.log('\n시나리오 21 — PC 열 확장 · 꺽쇠 · 표지 카드 · 저장 타일 미끄러짐');
{
  APP_PRODUCT='sweeter';
  ST={settings:{propTitleFonts:['brush']},verseKeepLog:{}};
  const V4=(ref,o)=>Object.assign({idx:0,cat:'주일예배',topic:'제자의 정체성',
    krText:ref+' 본문',ref,tags:[],hi:'',d:'2026-09-21',pid:'P'+ref,kind:'prop',
    sit:[],q:''},o||{});

  // ④ 넓어지면 열이 는다 — HB: "타일이 하나하나가 무한정 커지니까 에러난 것 같이"
  sc.eq('좁을 땐 두 열',
    /\.sw-board\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/.test(SRC_DEV), true);
  [[560,3],[780,4],[1020,5],[1280,6],[1560,7]].forEach(([w,c])=>{
    sc.eq(w+'px 부터 '+c+'열',
      SRC_DEV.includes('@media (min-width:'+w+'px){ .sw-board{grid-template-columns:repeat('+c+',minmax(0,1fr));} }'), true);
  });
  // ⚠️ 행 높이는 여전히 **타일 하나의 실제 너비**다 → 열이 늘어도 정사각이 지켜진다
  sc.eq('행 높이는 재서 넣는다', SRC_DEV.includes("b.style.setProperty('--sw-cell',Math.round(w)+'px')"), true);

  // ⑤ PC 꺽쇠 — 값이 둘 이상일 때만, 마우스가 있는 기기에서만
  LIKE={};MEM={};DEEP={};EVEN={};SHARE={};
  VERSES=[V4('마태복음 5:13'),V4('로마서 8:28'),V4('요한복음 1:1')];
  const f2=_swFace({k:'book',s:0,p:0});
  VERSES=[V4('마태복음 5:13')];
  const f1=_swFace({k:'book',s:0,p:0});
  sc.eq('값이 둘 이상이면 꺽쇠를 단다', f2.includes('data-swnav="-1"')&&f2.includes('data-swnav="1"'), true);
  sc.eq('값이 하나면 안 단다', f1.includes('data-swnav'), false);
  // ⚠️ 트랙 **바깥**이라야 값이 넘어가도 제자리에 있는다
  sc.eq('꺽쇠는 트랙 바깥', f2.indexOf('data-swnav')>f2.indexOf('</div></div>'), true);
  sc.eq('손가락 기기에는 아예 없다', /\.sw-nav\{display:none;\}/.test(SRC_DEV), true);
  sc.eq('마우스가 있을 때만 켠다', /@media \(hover:hover\)\{\s*\.sw-nav\{display:flex/.test(SRC_DEV), true);
  sc.eq('편집 중에는 끈다', /\.sw-board\.edit \.sw-nav\{display:none;\}/.test(SRC_DEV), true);
  // 그림은 말씀 카드의 것을 그대로 쓴다 (손으로 옮겨 적지 않는다)
  sc.eq('꺽쇠 그림은 카드 것을 쓴다', /function _swArrowHTML\(dir\)\{\s*try\{return dir<0\?_VC_ARROW_L:_VC_ARROW_R;/.test(SRC_DEV), true);
  sc.eq('한 칸 넘기기가 있다', typeof _swStep, 'function');

  // ③ '오늘의 말씀'을 누르면 열린다
  // ⚠️ _swVersesFor 에는 today 가 없다 — _swTileOpen 에서 잡지 못하면 빈 목록이
  //    되어 "그 말씀들을 찾지 못했어요" 만 뜬다 (HB 신고).
  sc.eq('표지 카드도 말씀 목록으로',
    SRC_DEV.includes("if(t.k==='today'||t.k==='last'||t.k==='keep'){"), true);
  // ⚠️ _swVersesFor 가 today 를 모른다는 것이 이 고침의 전제다 — 그 함수 안을 본다
  sc.eq('_swVersesFor 는 여전히 today 를 모른다',
    /function _swVersesFor\(t,cur\)\{[\s\S]*?\n\}/.exec(SRC_DEV)[0].includes("t.k==='today'"), false);

  // ⑥ '저장' 타일만 드드드득 — 손가락이 움직일 때마다 띠를 다시 세던 것
  sc.eq('띠 길이는 몸짓 시작 때 한 번만', SRC_DEV.includes('const _n0=(()=>{try{return _swStrip(_SW_TILES[i]).length;}catch(_){return 0;}})();'), true);
  sc.eq('움직일 때는 세어 둔 값을 쓴다', SRC_DEV.includes('const t=_SW_TILES[_swG.i],n=_swG.n||0;'), true);
  sc.eq('옛 길은 없앴다', SRC_DEV.includes('const t=_SW_TILES[_swG.i],n=_swStrip(t).length;'), false);
  sc.eq('마무리도 세어 둔 값으로', SRC_DEV.includes('const n=_swG.n||0, dir=dx<0?1:-1;'), true);
}

// ═══ 22. 타일마다 바탕 사진 켜고 끄기 · 색 보정 (v26-0922-13, HB) ═══
console.log('\n시나리오 22 — 타일마다 사진 켜고 끄기 · 테마에 맞춘 색 보정');
{
  APP_PRODUCT='sweeter';
  ST={settings:{propTitleFonts:['brush']},verseKeepLog:{}};
  LIKE={};MEM={};DEEP={};EVEN={};SHARE={};
  const V5=(ref,o)=>Object.assign({idx:0,cat:'주일예배',topic:'제자의 정체성',
    krText:ref+' 본문',ref,tags:['평안'],hi:'',d:'2026-09-21',pid:'P'+ref,kind:'prop',
    sit:[],q:''},o||{});
  // 사진첩이 있는 것처럼 꾸민다 (_swLoadPhotos 는 fetch 라 시험에서 안 돈다)
  _SW_PHOTOS=[{f:'dawn-lake-mist.jpg',for:['평안'],by:'시험'}];
  _swPhotoTried=true;
  VERSES=[V5('마태복음 5:13')];

  // 기본은 **켬**이다
  sc.eq('적힌 적 없으면 켬', _swPhOn({k:'today'}), true);
  sc.eq('0 이면 끔', _swPhOn({k:'today',ph:0}), false);
  const on=_swFace({k:'today',s:0,p:0,ph:1});
  const off=_swFace({k:'today',s:0,p:0,ph:0});
  sc.eq('켜면 사진이 깔린다', on.includes('class="sw-photo"'), true);
  sc.eq('끄면 안 깔린다', off.includes('class="sw-photo"'), false);
  // 유튜브 썸네일도 같은 스위치를 따른다
  VERSES=[V5('마태복음 5:14',{yt:'dQw4w9WgXcQ'}),V5('마태복음 5:15',{yt:'dQw4w9WgXcQ'})];
  sc.eq('썸네일도 끌 수 있다', _swFace({k:'recent',s:0,p:0,ph:0}).includes('ytimg'), false);
  sc.eq('켜면 다시 뜬다', _swFace({k:'recent',s:0,p:0,ph:1}).includes('ytimg'), true);

  // 단추는 **편집 중에만**, 사진이 깔리는 타일에만
  sc.eq('평소에는 단추가 없다', _swEditBtns({k:'today',ph:1}), '');
  _SW_EDIT=true;
  const bT=_swEditBtns({k:'today',ph:1}), bR=_swEditBtns({k:'rhythm',ph:1});
  sc.eq('편집 중에는 ×', bT.includes('data-swkill'), true);
  sc.eq('사진 타일에는 사진 단추도', bT.includes('data-swph'), true);
  sc.eq('사진이 안 깔리는 타일에는 없다', bR.includes('data-swph'), false);
  sc.eq('꺼 두면 꺼진 모습으로', _swEditBtns({k:'today',ph:0}).includes('class="sw-ph off"'), true);
  _SW_EDIT=false;
  // 사진이 깔리는 타일 목록 — 여기 없으면 단추도 안 달린다
  sc.eq('사진이 깔리는 타일', _SW_PHOTO_KINDS, ['today','last','keep','ask','recent']);

  // 고른 값이 **저장된다** (안 그러면 앱을 껐다 켜면 되돌아간다)
  _SW_TILES=[{k:'today',s:0,p:0,ph:0},{k:'keep',s:0,p:0,ph:1}];
  _swSaveTiles();
  sc.eq('끔이 저장된다', (ST.settings.swTiles||[])[0], {k:'today',s:0,ph:0});
  sc.eq('켬도 저장된다', (ST.settings.swTiles||[])[1], {k:'keep',s:0,ph:1});
  // 옛 기기의 저장값에는 ph 가 없다 → **켬**으로 읽는다
  ST.settings.swTiles=[{k:'today',s:0}];
  sc.eq('옛 값은 켬으로 읽는다', _swLoadTiles()[0].ph, 1);

  // ── 색 보정 (HB: "사진 색이 다 제각각인데 테마와 어울리게") ──
  // ⚠️ v26-0922-14 — 걷어내는 힘을 .74 → .34, 흐리기를 1.1 → .6px 로 낮췄다.
  //    HB: "너무 흑백인 느낌 … 뭔지 너무 안 보여서 맥락이 전달이 안 돼."
  //    사진이 무엇인지는 알아볼 수 있어야 한다.
  sc.eq('사진에서 색을 조금만 걷어낸다', /\.sw-photo>img\{[^}]*grayscale\(\.34\)/.test(SRC_DEV), true);
  sc.eq('살짝 흐린다', /\.sw-photo>img\{[^}]*blur\(\.6px\)/.test(SRC_DEV), true);
  // ⚠️ 흐리기는 가장자리에 김을 만든다 — 조금 키워서 잘라 낸다
  sc.eq('가장자리 김을 잘라낸다', /\.sw-photo>img\{[^}]*transform:scale\(1\.06\)/.test(SRC_DEV), true);
  // ⚠️ 테마 강조색으로 물들인다. 명암은 그대로 두고 **색만** 갈아 끼우므로
  //    테마를 바꾸면 사진 색도 따라 바뀐다.
  sc.eq('테마 색으로 물들인다',
    /\.sw-photo::before\{[^}]*background:rgb\(var\(--ac-rgb\)\);mix-blend-mode:color/.test(SRC_DEV), true);
  // ⚠️⚠️ 글 덩어리는 **눌리지 않는다** — 눌리면 -webkit-line-clamp 와 상관없이
  //    마지막 줄이 반쯤 잘린다 (v26-0922-14, HB: "3줄일 때 아래가 잘리네").
  ['\\.sw-val','\\.sw-hi','\\.sw-kick','\\.sw-num'].forEach(k=>{
    sc.eq(k.replace(/\\\\/g,'')+' 는 눌리지 않는다',
      new RegExp(k+'\\{[^}]*flex-shrink:0').test(SRC_DEV), true);
  });
  sc.eq('넓은 묵상 질문은 두 줄',
    /\.sw-cell\.ask\.has-hi \.sw-val\{font-size:14\.5px;-webkit-line-clamp:2;\}/.test(SRC_DEV), true);
  sc.eq('물들이기가 타일 밖으로 안 샌다', /\.sw-photo\{[^}]*isolation:isolate/.test(SRC_DEV), true);
  sc.eq('그레인을 얹는다', /--sw-grain:url\("data:image\/svg\+xml,/.test(SRC_DEV), true);
  sc.eq('그레인은 주소로 인코딩한다', SRC_DEV.includes('%3CfeTurbulence'), true);
  sc.eq('덮개와 그레인이 한 겹에', /\.sw-photo::after\{[^}]*background-image:var\(--sw-grain\)/.test(SRC_DEV), true);
}

// ═══ 23. 끌면서 판 끝에 닿으면 저절로 굴러간다 (v26-0922-15, HB) ═══
console.log('\n시나리오 23 — 끌면서 판 끝에 닿으면 저절로 굴러간다');
{
  // HB: "맨 위로 드래그해서 홀드하고 있는데 화면이 멈춰 있어서 위로 더 올라갈
  //      수가 없어서 한번 손을 떼고 스크롤 하고 다시 드래그 해야하는 번거로움"
  // ⚠️⚠️ 손가락이 멈춰 있으면 pointermove 가 **오지 않는다.** 스스로 도는
  //    고리가 있어야 한다.
  sc.eq('스스로 도는 고리가 있다', typeof _swAutoScroll, 'function');
  sc.eq('멈추는 길도 있다', typeof _swAutoStop, 'function');
  sc.eq('매 프레임 다시 돈다',
        SRC_DEV.includes('_swAutoRaf=requestAnimationFrame(_swAutoScroll);'), true);
  sc.eq('끌기를 시작할 때 켠다',
        SRC_DEV.includes('_swAutoStop();_swAutoScroll();'), true);
  // ⚠️ 끝났는데 안 멈추면 판이 혼자 굴러간다. 놓기·브라우저가 가져감 둘 다.
  sc.eq('끝나면 반드시 멈춘다',
        (SRC_DEV.match(/_swAutoStop\(\);\n      _swG\.el\.classList\.remove\('sw-drag'\)/g)||[]).length, 2);
  sc.eq('고리는 끌기 중에만 돈다',
        SRC_DEV.includes("if(!_swG||!_swG.drag)return;\n  const b=document.getElementById('swBoard');"), true);
  // 손가락이 멈춰도 마지막 자리를 알고 있어야 한다
  sc.eq('마지막 자리를 남긴다', SRC_DEV.includes('_swG.x=e.clientX;_swG.y=e.clientY;'), true);
  // 가장자리 띠와 빠르기 — 끝에 가까울수록 빨리 (한 속도면 지나치기 쉽다)
  sc.eq('가장자리 띠', SRC_DEV.includes('const _SW_EDGE=74;'), true);
  sc.eq('한 번에 굴릴 최대', SRC_DEV.includes('const _SW_EDGE_MAX=15;'), true);
  sc.eq('위쪽도 아래쪽도', /y<r\.top\+_SW_EDGE[\s\S]{0,120}y>r\.bottom-_SW_EDGE/.test(SRC_DEV), true);
  // ⚠️ 끝까지 굴렀으면 타일 자리를 다시 잴 까닭이 없다 (헛일 + 깜빡임)
  sc.eq('끝까지 갔으면 그만', SRC_DEV.includes('if(b.scrollTop!==was){'), true);

  // 우상단 필터 아이콘 — 동그라미만 조금 작게 (가로선은 그대로, HB)
  sc.eq('동그라미를 줄였다', (SRC_DEV.match(/r="1\.95" fill="var\(--bg\)"/g)||[]).length, 3);
  sc.eq('가로선은 그대로', SRC_DEV.includes('d="M2.6 5h14.8M2.6 10h14.8M2.6 15h14.8"'), true);
}

// ═══ 24. 줄 높이는 판에게 묻는다 (v26-0922-16, HB) ═══
console.log('\n시나리오 24 — 타일이 세로로 늘어나지 않게');
{
  // HB: "이렇게 세로로 길게 늘어나는 오류가 있어" (아이폰, v26-0922-15)
  // ⚠️⚠️ 예전에는 **타일 하나를 찾아 그 너비**를 줄 높이로 썼다. 그 한 장이
  //    무엇이냐에 따라 엉뚱한 너비가 잡혔고, 그 값이 그대로 모든 줄의 높이가
  //    되어 타일이 세로로 늘어났다.
  sc.eq('타일을 재지 않는다',
    SRC_DEV.includes("const t=b.querySelector('.sw-tile:not(.wide)')||b.querySelector('.sw-tile');"), false);
  sc.eq('열 수는 계산된 값에서 센다',
    SRC_DEV.includes("const cols=String(cs.gridTemplateColumns||'').trim().split(/\\s+/)"), true);
  sc.eq('판의 안쪽 너비로 셈한다',
    SRC_DEV.includes('const w=(inner-(cols-1)*gap)/cols;')||
    SRC_DEV.includes('let w=(inner-(cols-1)*gap)/cols;'), true);
  // ⚠️ 판이 안 보이면 clientWidth 가 0 이다. 0 을 쓰면 줄 높이가 0 이 되어
  //    판이 통째로 사라진다 → 아무것도 쓰지 않는다.
  sc.eq('안 보이면 아무것도 안 쓴다', SRC_DEV.includes('if(!cols||!(inner>10))return;'), true);
  // ⚠️ 마지막 빗장 — 열은 늘 둘 이상이라 한 칸이 화면 폭의 62%를 넘을 수 없다
  sc.eq('마지막 빗장이 있다', SRC_DEV.includes('if(cap>40&&w>cap)w=cap;'), true);
  // ⚠️ resize 만으로는 놓치는 자리가 있다 (홈 화면 앱이 뜰 때·주소줄이 오르내릴 때)
  sc.eq('판의 크기를 지켜본다', SRC_DEV.includes('if(window.ResizeObserver)new ResizeObserver(()=>{'), true);
  sc.eq('돌려도 다시 잰다', SRC_DEV.includes("window.addEventListener('orientationchange',"), true);
}

// ═══ 25. 첫 그림 · 시상대 · 꺽쇠 · Even Deeper (v26-0922-17, HB) ═══
console.log('\n시나리오 25 — 첫 그림 · 시상대 · 꺽쇠 · Even Deeper');
{
  // ① 첫 그림 — HB: "첫 화면 로딩 때 빈 화면이 너무 길어"
  // ⚠️⚠️ 본문(1.4MB)이 읽히기 **전에** 떠야 한다 → JS 가 만들지 않고 HTML 에
  //    박아 둔다. JS 로 만들면 그 JS 가 읽힐 때까지 또 빈 화면이다.
  const body=SRC_DEV.slice(SRC_DEV.indexOf('<body>'));
  sc.eq('첫 그림이 HTML 에 박혀 있다', body.indexOf('<div id="swBoot"')>=0, true);
  // 본문 <script> 보다 앞이라야 뜻이 있다
  sc.eq('본문보다 앞에 있다',
    body.indexOf('<div id="swBoot"') < body.indexOf('const ST=load()'), true);
  sc.eq('Sweeter 에서만 뜬다', /#swBoot\{display:none;\}/.test(SRC_DEV)&&
    /html\[data-product="sweeter"\] #swBoot\{/.test(SRC_DEV), true);
  sc.eq('판이 서면 걷는다', SRC_DEV.includes('try{window._swBootOff&&window._swBootOff();}catch(e){}'), true);
  // ⚠️ 본문이 멈춰도 갇히지 않게 스스로도 걷는다
  sc.eq('갇히지 않는다', SRC_DEV.includes('setTimeout(function(){window._swBootOff();},9000);'), true);

  // ② 말씀 반응 이름 · Even Deeper 는 개발자만
  sc.eq("'Deeper..' 로", SRC_DEV.includes("{name:'Deeper..',kind:'deeper'"), true);
  sc.eq("'Even Deeper..' 로", SRC_DEV.includes("{name:'Even Deeper..',kind:'even'"), true);
  sc.eq('꺼져 있으면 세지도 않는다',
    SRC_DEV.includes("n:_swEvenOn()?cnt(getEvenDeeperLog()):0"), true);
  // ⚠️ 켜고 끄는 자리는 <html data-even="1"> **한 곳**이다
  sc.eq('한 곳에서 켜고 끈다', /html:not\(\[data-even="1"\]\) \.even-only\{display:none!important;\}/.test(SRC_DEV), true);
  sc.eq('개발자 계정일 때만', /function _evenOn\(\)\{try\{return _isDevAccount\(\);\}/.test(SRC_DEV), true);
  // 들머리를 빠짐없이 표시했는가 (전체화면 단추·메뉴 셋·목록 단추 둘)
  sc.eq('들머리마다 표시가 붙었다', (SRC_DEV.match(/even-only/g)||[]).length>=7, true);

  // ③ 나의 리듬 — 시상대 삽화, 요일 줄에 불
  sc.eq('시상대 삽화가 있다', /podium:'<svg viewBox="0 0 24 24" fill="currentColor">/.test(SRC_DEV), true);
  sc.eq('등수 칸에만 시상대', SRC_DEV.includes("_swIllHTML(g.kind==='rank'?'podium':'clock')"), true);
  // ⚠️ 불을 켠 칸은 **기록이 없어도** 보여야 한다 (요일 줄 전체에 불을 켜므로)
  sc.eq('빈 칸에도 불이 보인다', SRC_DEV.includes('const op=on?(v?1:0.42):(v?(0.2+0.6*v/max):0.1);'), true);

  // ④ PC 꺽쇠 — 누를 수 있는 자리에 들어오면 더 밝게
  // ⚠️ v26-0922-18 (HB: "더 많이 밝아져야") — 차이를 더 벌리고, 사진 위에서도
  //    티가 나도록 바탕색 테두리 빛(drop-shadow)을 함께 준다.
  sc.eq('타일 위에서는 옅게', /\.sw-tile:hover \.sw-nav\{opacity:\.16;\}/.test(SRC_DEV), true);
  sc.eq('꺽쇠 자리에서는 또렷하게',
        /\.sw-nav:hover\{opacity:1;filter:drop-shadow\(0 0 3px var\(--bg\)\)/.test(SRC_DEV), true);
  sc.eq('조금 커지기까지', /\.sw-nav:hover svg\{transform:scale\(1\.22\);\}/.test(SRC_DEV), true);
}

// ═══ 26. 돌릴 때 BLOCK7 이 번쩍이던 것 (v26-0922-18, HB) ═══
console.log('\n시나리오 26 — 돌릴 때 뒤가 비치지 않게');
{
  // HB: "세로로 보다가 가로로 돌리면 순간 블럭7 화면이 보였다가 사라지는 버그"
  // ⚠️⚠️ 판은 덮개(position:fixed)일 뿐이라, 돌리는 그 찰나에 덮개가 새 크기를
  //    잡기 전 **아래가 비친다.** 덮는 대신 **없애면** 비칠 것이 없다.
  sc.eq('판이 떠 있으면 BLOCK7 본문을 안 그린다',
    /html\[data-product="sweeter"\]\[data-swboard="1"\] #pageWrap,\s*\n\s*html\[data-product="sweeter"\]\[data-swboard="1"\] #verseBarWrap\{display:none;\}/.test(SRC_DEV), true);
  // ⚠️ 켜고 끄는 자리는 한 곳이라야 한다 — 클래스만 건드리면 표시가 어긋난다
  sc.eq('켜고 끄는 자리는 한 곳', typeof _swCoverOn, 'function');
  sc.eq('판을 세울 때 함께 켠다', SRC_DEV.includes('  _swCoverOn(true);\n  // 편집·필터 단추는'), true);
  sc.eq('전체화면을 열 때 함께 끈다',
    SRC_DEV.includes("_swCoverOn(false);jobs.push(()=>_swCoverOn(true));"), true);
  sc.eq('클래스만 따로 건드리지 않는다',
    SRC_DEV.includes("swh.classList.remove('on');jobs.push(()=>swh.classList.add('on'));"), false);
}

// ═══ 27. 날마다 바뀌는 사진 · 촤라락 스며드는 첫 그림 (v26-0922-20, HB) ═══
console.log('\n시나리오 27 — 날마다 바뀌는 사진 · 차례로 스며드는 첫 그림');
{
  // ① HB: "날마다 바뀌게 해줘"
  // ⚠️ 씨앗은 말씀 + **오늘 날짜**다. 날이 바뀌면 다른 사진이 뜨고,
  //    그날 안에서는 바뀌지 않는다 — 다시 그릴 때마다 달라지면 깜빡여 보인다.
  sc.eq('씨앗에 오늘 날짜를 넣는다',
    SRC_DEV.includes("h=_hiHash(String(v.ref||'')+String(v.pid||'')+'@'+_calKey());"), true);
  {
    APP_PRODUCT='sweeter';
    _SW_PHOTOS=[{f:'a.jpg',for:['평안'],by:'t'},{f:'b.jpg',for:['평안'],by:'t'},
                {f:'c.jpg',for:['평안'],by:'t'},{f:'d.jpg',for:['평안'],by:'t'}];
    _swPhotoTried=true;
    const v={ref:'시편 23:1',pid:'P9',tags:['평안'],sit:[],topic:'',cat:''};
    const day=_calKey;
    const seen=new Set();
    ['2026-09-22','2026-09-23','2026-09-24','2026-09-25','2026-09-26','2026-09-27']
      // ⚠️ global._calKey 로는 안 바뀐다 — 이 파일 위쪽에 function 선언이 있어
      //    그 이름이 이미 묶여 있다. 그 묶음 자체를 바꿔 끼운다.
      .forEach(d=>{_calKey=()=>d;seen.add(_swPhotoPick(v));});
    _calKey=day;
    sc.eq('날이 바뀌면 사진도 바뀐다', seen.size>1, true);
    // ⚠️ 그날 안에서는 **늘 같은 한 장**이라야 한다
    sc.eq('같은 날엔 같은 사진', _swPhotoPick(v), _swPhotoPick(v));
  }

  // ② HB: "위에서부터 촤라라락 디졸브로 순서대로"
  sc.eq('스며드는 움직임이 있다', /@keyframes swTileIn\{/.test(SRC_DEV), true);
  sc.eq('판을 세울 때만 건다', /const intro=!_swIntroDone&&!_SW_EDIT&&_SW_TILES\.length>0&&!_swNoMotion\(\);/.test(SRC_DEV), true);
  sc.eq('위에서부터 차례로', SRC_DEV.includes("el.style.animationDelay=(i*_SW_INTRO_STEP)+'ms';"), true);
  // ⚠️⚠️ 다 스며든 뒤에는 .intro 를 반드시 걷는다 — fill-mode:both 가 마지막
  //    모습을 붙잡아, 그대로 두면 누를 때 작아지는 손맛이 먹히지 않는다.
  sc.eq('끝나면 걷는다', SRC_DEV.includes("b.classList.remove('intro');"), true);
  sc.eq('한 번만 건다', SRC_DEV.includes('_swIntroDone=true;'), true);
  // 움직임 줄이기를 켠 기기에서는 아예 안 한다
  sc.eq('움직임 줄이기를 지킨다',
    /@media \(prefers-reduced-motion:reduce\)\{\s*\n\s*\.sw-board\.intro \.sw-tile\{animation:none;\}/.test(SRC_DEV), true);
}

sc.done();
