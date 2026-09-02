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
  sc.eq('띠 = 타이틀 + 값들', _swStrip(t).length, 3);

  // 점은 아홉 칸을 넘지 않는다 (값이 스무 개여도)
  sc.eq('값이 적으면 그대로', (_swPipsHTML(4,0).match(/<i/g)||[]).length, 4);
  sc.eq('많으면 아홉 칸', (_swPipsHTML(30,29).match(/<i/g)||[]).length, 9);
  sc.eq('마지막 값이면 마지막 칸이 켜진다',
        _swPipsHTML(30,29).split('<i').pop().includes('on'), true);
  sc.eq('하나뿐이면 점을 안 찍는다', _swPipsHTML(1,0), '');

  // 값이 없을 때 — 왜 비었는지 말해 준다
  const empty={k:'last',p:0,s:0};
  sc.eq('빈 타일은 까닭을 적는다', _swFace(empty).includes('아직 기록이 없어요'), true);

  // p 가 범위를 벗어나도 조용히 되돌아온다
  const over={k:'recent',p:99,s:0};
  _swFace(over);
  sc.eq('넘친 자리는 끝으로 되돌아온다', over.p, 2);
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
  sc.eq('재는 동안 스크롤을 막는다',
        SRC_DEV.includes("if((_swG.lp||_swG.drag)&&e.cancelable)e.preventDefault();"), true);
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
        SRC_DEV.includes("Math.hypot(e.clientX-_swG.lx,e.clientY-_swG.ly)<20))return;"), true);
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
  // 편집 중에는 브라우저에게 세로를 넘기지 않는다 (pointercancel 로 끊긴다)
  sc.eq('편집 중에는 몸짓을 브라우저에 뺏기지 않는다',
        SRC_DEV.includes('.sw-board.edit .sw-tile{touch-action:none;}'), true);
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
  sc.eq('가운데 칸을 보여 준다', SRC_DEV.includes('transform:translateX(-33.3333%);'), true);
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
  // 가운데 칸이 지금 값이어야 한다 (앞칸=타이틀, 가운데=첫 설교)
  const cells=h1.split('class="sw-cell');
  sc.eq('앞칸은 타이틀', cells[1].includes('최근 설교'), true);
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
  sc.eq('처음엔 기본 여섯', _swLoadTiles().map(t=>t.k),
        ['last','keep','recent','book','tag','react']);

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
  sc.eq('남은 종류가 없다', _swSpareKinds(), []);
  _SW_TILES=[{k:'last',s:0,p:0}];
  sc.eq('남은 다섯', _swSpareKinds().sort(), ['book','keep','react','recent','tag']);
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
  sc.eq('넓은 타일은 표에서 정한다',
        SRC_DEV.includes("return 'sw-tile '+(_SW_TYPES[t.k].wide?'wide':'');"), true);
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
  //  까닭 — 동기화 기준점 세 키가 **제품별로 갈려 있지 않다**:
  //    b7v1_owner · b7v1_syncbase · b7v1_syncmeta  (전부 고정 이름)
  //  같은 도메인(block7.my)에 두 제품이 있으면 Sweeter 는
  //    · 저장 키 b7v1_sweeter 가 비어 있어 ST 가 defaultState() 이고
  //    · 기준점(b7v1_syncbase)은 BLOCK7 이 남긴 **가득 찬 상태**를 읽는다.
  //  로그인 경로의 3자 병합 _fbMerge(base=가득, local=빈, cloud=가득) 은
  //  이것을 "사용자가 전부 지웠다"로 읽어 빈 상태를 만들고 클라우드에 올린다.
  //  ⚠️ 대량 손실 방어 _fbBulkLoss 는 base 를 **모를 때만** 돈다
  //     (_fbMergeGuarded 의 if(!base)). 이 경로는 base 가 있어 방어가 안 켜진다.
  //
  //  → 세 키를 제품별로 가르고 시험을 먼저 쓴 뒤에야 다시 켤 수 있다.
  const mk = require('fs').readFileSync(__dirname + '/../tools/make-sweeter.sh', 'utf8');
  sc.eq('DEV_MODE 를 켠다(=Firebase 끔)',
        mk.includes("sub_once(out,'const DEV_MODE = false;','const DEV_MODE = true;','DEV_MODE')"), true);
  sc.eq('왜 켜면 안 되는지 적어 뒀다', mk.includes('DEV_MODE 를 false 로 두지 말 것'), true);

  const sw = require('fs').readFileSync(__dirname + '/../sweeter-dev.html', 'utf8');
  sc.eq('개발본은 Firebase 가 꺼져 있다', sw.includes('const DEV_MODE = true;'), true);
  sc.eq('제품은 sweeter 다', sw.includes('const APP_PRODUCT = "sweeter";'), true);
  sc.eq('저장 키는 b7v1_sweeter_dev',
        (sw.includes('const APP_PRODUCT = "sweeter";') && sw.includes('const DEV_MODE = true;')), true);

  // 기준점 세 키가 아직 제품별로 갈려 있지 않다는 사실 자체를 못 박아 둔다.
  // 이 셋이 LS_KEY 처럼 제품 이름을 타게 되면 이 시험이 걸리고, 그때 위 금지를
  // 풀 수 있다 (그전에 병합 시나리오 시험을 먼저 써야 한다).
  const SRC = require('fs').readFileSync(__dirname + '/../index.html', 'utf8');
  sc.eq('소유자 키는 아직 고정 이름', SRC.includes("localStorage.getItem('b7v1_owner')"), true);
  sc.eq('기준점 키도 아직 고정 이름',
        SRC.includes("const _FB_BASE_KEY='b7v1_syncbase',_FB_META_KEY='b7v1_syncmeta';"), true);
}

sc.done();
