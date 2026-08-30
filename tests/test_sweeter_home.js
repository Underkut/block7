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
function _findVerseByRefLoose(ref){return VERSES.find(v=>v.ref===ref)||null;}
function _tagartPick(){return null;} function _tagartSvg(){return '';}
function _tagartStyle(){return 'minimal';}

eval(sliceDev('function _swOn(){', '// ── DEV MODE BOOTSTRAP ──'));

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
  sc.eq('빈 타일은 까닭을 적는다', _swFace(empty).html.includes('아직 기록이 없어요'), true);

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
  const h=_swFace(t).html;
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
  sc.eq('세로로 움직이면 몸짓을 포기한다',
        SRC_DEV.includes('if(Math.abs(dy)>=Math.abs(dx)){'), true);
  // ⚠️ 행 높이는 --sw-cell 로 직접 준다 (aspect-ratio 는 그리드에 안 먹는다)
  sc.eq('행 높이를 재서 넣는다', SRC_DEV.includes("setProperty('--sw-cell'"), true);
  // ⚠️ 밀던 방향으로 내보낸 **뒤에** 갈아끼운다. 이 절차를 빼면 손가락이 왼쪽으로
  //    밀어 둔 내용이 오른쪽에서 다시 들어와 튕겨 돌아오는 것처럼 보인다 (HB 신고).
  // ⚠️ 목적지를 못 박으면(∓46px) 손가락이 그보다 더 밀어 둔 경우 흐려지는 동안
  //    내용이 **뒤로 되돌아간다.** 지금 자리에서 가던 방향으로 더 보내야 한다.
  sc.eq('있던 자리에서 가던 방향으로 더 보낸다',
        SRC_DEV.includes("const from=dx*.34, to=from+(dir>0?-1:1)*_swSweep(el);"), true);
  // ⚠️ 거리를 픽셀로 못 박으면 방향에 따라 길이가 달라 보인다 (HB 신고 26-0830-6):
  //    글이 왼쪽 정렬이라 오른쪽으로 밀 때만 길게 쓸고 간다. 타일 폭으로 잰다.
  sc.eq('쓸고 가는 거리는 타일 폭으로 잰다', SRC_DEV.includes('function _swSweep(el){'), true);
  sc.eq('나갈 때와 들어올 때가 같은 자',
        SRC_DEV.includes("const d=_swSweep(el)*.55;"), true);
  sc.eq('내보낸 뒤에 갈아끼운다',
        SRC_DEV.includes("setTimeout(()=>{el._swAnim=false;el.classList.remove('sw-dragging');"), true);
  // ⚠️ 미는 동안 누름 축소(scale .975)가 걸려 있으면, 손을 뗄 때 타일이 되돌아오며
  //    그 위에서 흐려지던 본문이 커지는 것처럼 보인다 (HB 신고 26-0830-5).
  sc.eq('미는 동안에는 누름 축소를 끈다',
        SRC_DEV.includes('.sw-tile:not(.sw-dragging):active{transform:scale(.975);}'), true);
  sc.eq('가로로 미는 것이 정해지면 표를 붙인다',
        SRC_DEV.includes("_swG.el.classList.add('sw-dragging');"), true);
  sc.eq('넘어가는 중에는 새 몸짓을 받지 않는다',
        SRC_DEV.includes("if(el._swAnim)return;"), true);
  // 움직임 줄이기를 켠 기기는 애니메이션 없이 바로 바뀐다
  sc.eq('움직임 줄이기를 존중한다', SRC_DEV.includes("function _swNoMotion()"), true);
}

// ═══ 7. 흐르는 것과 붙어 있는 것 ═══
console.log('\n시나리오 7 — 고정 세간은 흐르지 않는다');
{
  // ⚠️ 타일 이름(좌상단)·정렬 칩(우상단)·점(우하단)까지 함께 흐르면
  //    값이 바뀔 때 **튕겨 보인다** (HB 신고 26-0830-4).
  //    흐르는 것은 .sw-flow 를 단 것 — 본문 묶음과 손그림뿐이다.
  VERSES=[V('마 5:13','언덕 위의 도시','2026-06-21'),
          V('시 1:1','꿀보다 더 다니이다','2026-07-01')];
  LIKE={'2026-08-20':[{ref:'마 5:13',time:'09:10'}]}; MEM={}; DEEP={}; EVEN={}; SHARE={};

  const t={k:'recent',p:1,s:0};
  const h=_swFace(t).html;
  sc.eq('본문 묶음은 흐른다', /class="sw-slide sw-flow"/.test(h), true);
  sc.eq('타일 이름 줄은 안 흐른다', /class="sw-lab"[^>]*sw-flow/.test(h), false);
  sc.eq('점은 안 흐른다', /class="sw-pips"[^>]*sw-flow/.test(h), false);
  // 값(본문·부제)은 흐르는 묶음 **안**에 있어야 한다
  const inner=h.slice(h.indexOf('sw-slide'));
  sc.eq('값이 흐르는 묶음 안에 있다', inner.indexOf('sw-val')<inner.indexOf('sw-pips'), true);

  // 붙어 있는 것과 흐르는 것을 나누는 손잡이가 소스에 있어야 한다
  sc.eq('흐르는 것만 고르는 함수', SRC_DEV.includes("function _swFlow(el){"), true);
  sc.eq('.sw-flow 로 고른다', SRC_DEV.includes("el.querySelectorAll('.sw-flow')"), true);
  // ⚠️ 손그림은 원래 흐릿하다(.17). 본문과 같은 애니메이션을 쓰면 다 들어온
  //    순간 선명하게 번쩍인다 — 그림 전용 키프레임이 있어야 한다.
  sc.eq('손그림은 자리만 옮긴다', SRC_DEV.includes('@keyframes swArtIn'), true);
}

sc.done();
