// 말씀 대시보드 '흐름' 화면 — 기간 슬라이더 · 인사이트 구간 · 장별 보기.
//
// 왜 있나: 이 화면은 **세는 규칙**이 많다(칸 나누기, 최근↔이전 견주기, 성경 안의
// 장 뽑기). 눈으로만 확인하면 "표의 합이 위와 다르다"는 것을 못 잡는다.
// 화면을 고칠 때마다 여기부터 돌린다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 앱에서 이 화면의 계산 부분만 떠 온다 ──
global.ST = { settings:{} };
global.z = n => String(n).padStart(2,'0');
global.logicalNow = () => new Date('2026-09-06T09:00:00');   // 일요일이 9/6 기준 그 주
global.esc = s => String(s==null?'':s);
global._vDashKeyCmp = (a,b) => String(a).localeCompare(String(b),'ko');
global.save = () => {};
// 장을 뽑을 때 쓰는 앱 함수 둘 — 여기서는 아주 단순한 대역으로 세운다
global._bookOfRef = ref => {
  const m = String(ref||'').trim().match(/^([가-힣]+)/);
  return m ? m[1] : '';
};
global._vDashVerse = () => null;
global._vDashRefLabel = r => String(r||'');
global._vDashIsPlaceholder = k => ['기타','(없음)','(태그 없음)','(목록에 없음)','(미상)','장 모름'].indexOf(String(k))>=0;
// '시간 개념 없음'(0분) 구간 판정 — index.html 의 진짜 정의와 같은 한 줄
global._secNoTime = sec => !!(sec&&sec.noTime);
global.todayKey = () => '2026-09-06';
// 리듬의 세로 1겹은 **앱이 쓰는 그 시간대**다. 여기서 베껴 적지 말고
// index.html 의 진짜 정의를 그대로 떠 온다 (바뀌면 테스트도 함께 따라간다).
global.SECS = eval(slice('const DEFAULT_SECS=[', '\n];') + '\n];DEFAULT_SECS');
// 직접 기간(날짜 두 개)은 대시보드 쪽 저장칸에 그대로 남아 있다 (v26-0907-3)
global._vDashPref = () => (ST.settings.vDashPref = ST.settings.vDashPref || { customFrom:'', customTo:'' });
global._vgEscAttr = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
global._vDashQ = s => global._vgEscAttr(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'"));
global._bibleRankOfRef = ref => {
  // 성경 차례 대역 — 창세기·마태복음·로마서 셋만 있으면 이 테스트에는 충분하다
  const ORDER=['창세기','시편','이사야','마태복음','요한복음','로마서'];
  const m=String(ref||'').match(/^([가-힣]+)/);
  const i=ORDER.indexOf(m?m[1]:'');
  return (i<0?999:i)*1000000;
};
// ⚠️ eval 안의 const 는 밖으로 새어 나오지 않는다 (function 만 나온다).
//    쓸 이름을 한 곳에 적어 돌려받는다 — 이름이 바뀌면 여기서 바로 걸린다.
const NAMES=['_VTR_SPAN_MAX','_VTR_FORMS','_VTR_UNITS','_VTR_DEFAULTS','_vTrPref','_vTrSpan','_vTrInsMax',
  '_vTrInsN','_vTrBucketOf','_vTrBucketList','_vTrUnitWord','_vTrChapterKeys','_vTrChapNo',
  '_vTrDiffHTML','_vTrOtherSpan','_vTrSort','_vTrSortRows','_vTrNameCmp','_vTrTheadHTML',
  '_vTrGeo','_vTrHFromX','_vTrRailHTML','_vTrRowHTML','_vTrInsightHTML',
  '_vTrFindings','_vTrFindingsHTML','_vMapShade','_vWeeksSince','_vRhyBands','_vRhyKind','_VRHY_KINDS',
  '_vMapGroups','_VMAP_GROUPS_OT','_VMAP_GROUPS_NT','_vMapRange','_VG_RANK_MAX',
  '_vpRep','_vpShortRef','_vpTabName','_VP_TABS',
  '_vMapMode','_vLinkAxis','_vDashScope','_vMapInk','_vMapStep',
  'BIBLE_ORDER_OT','BIBLE_ORDER_NT','BIBLE_CHAPTERS_OT','BIBLE_CHAPTERS_NT',
  '_bibleChapters','_bibleShort'];
// ⚠️ 지도·연결·리듬은 renderVDashTrend 뒤에 있고, 성경 차례·장 수는 훨씬 위에 있다.
//    세 토막을 이어 붙여 한 통에 넣는다 (이름이 하나라도 사라지면 아래에서 걸린다).
const SRC_TR =
  slice("const BIBLE_ORDER_OT=", '\n// ── Alarm scheduler ──') +
  slice("const _VTR_UNITS=", 'function renderVDashTrend(') +
  slice('// ══════ 지도 · 연결 · 리듬', '// ── 장절 느슨한 대조 ──');
const API=eval(SRC_TR+'\n;({'+NAMES.join(',')+'})');
NAMES.forEach(n=>{
  if(API[n]===undefined){console.error('[로더] 이름이 사라졌어요:',n);process.exit(2);}
  global[n]=API[n];
});

// ═══ 1. 기간은 1~24 사이의 값만 받는다 ═══
console.log('시나리오 1 — 기간 슬라이더가 주는 값 다듬기');
{
  sc.eq('보통 값 그대로', _vTrSpan({span:7}), 7);
  sc.eq('맨 왼쪽 1', _vTrSpan({span:1}), 1);
  sc.eq('맨 오른쪽 24', _vTrSpan({span:24}), 24);
  sc.eq('넘치면 기본 12', _vTrSpan({span:99}), 12);
  sc.eq('0이면 기본 12', _vTrSpan({span:0}), 12);
  sc.eq('글자여도 안 깨진다', _vTrSpan({span:'16'}), 16);
  sc.eq('없으면 기본 12', _vTrSpan({}), 12);
}

// ═══ 2. 인사이트는 '최근 h칸 ↔ 그 앞 h칸' — h 는 기간의 절반을 못 넘는다 ═══
// ⚠️ 넘으면 두 구간이 겹쳐서 "지난 기간보다 늘었다"가 거짓말이 된다.
console.log('시나리오 2 — 견주는 구간은 기간의 절반까지');
{
  sc.eq('12주의 절반은 6', _vTrInsMax({span:12}), 6);
  sc.eq('1주짜리도 최소 1', _vTrInsMax({span:1}), 1);
  sc.eq('안 정했으면 절반', _vTrInsN({span:12}), 6);
  sc.eq('정한 값은 그대로', _vTrInsN({span:12,ins:2}), 2);
  sc.eq('절반을 넘겨 정하면 절반으로 눌린다', _vTrInsN({span:12,ins:9}), 6);
  sc.eq('기간을 줄이면 함께 줄어든다', _vTrInsN({span:4,ins:9}), 2);
  sc.eq('1주 기간에서도 1', _vTrInsN({span:1,ins:5}), 1);
}

// ═══ 3. 칸 나누기 — 주는 그 주의 일요일, 달은 그 달 ═══
console.log('시나리오 3 — 날짜를 칸에 놓기');
{
  sc.eq('9/6(일)은 그 주 일요일', _vTrBucketOf('2026-09-06','week'), '2026-09-06');
  sc.eq('9/9(수)도 같은 칸', _vTrBucketOf('2026-09-09','week'), '2026-09-06');
  sc.eq('9/5(토)는 앞 주', _vTrBucketOf('2026-09-05','week'), '2026-08-30');
  sc.eq('달은 YYYY-MM', _vTrBucketOf('2026-09-09','month'), '2026-09');
  sc.eq('날짜가 없으면 어느 칸도 아니다', _vTrBucketOf('','week'), '');
  sc.eq('날짜가 아니면 빈 값', _vTrBucketOf('올해','month'), '');
  const w = _vTrBucketList('week',4);
  sc.eq('주 4칸의 마지막은 이번 주', w[3], '2026-09-06');
  sc.eq('주 4칸은 7일 간격', w, ['2026-08-16','2026-08-23','2026-08-30','2026-09-06']);
  const m = _vTrBucketList('month',3);
  sc.eq('달 3칸', m, ['2026-07','2026-08','2026-09']);
  sc.eq('1칸만 골라도 된다', _vTrBucketList('week',1), ['2026-09-06']);
}

// ═══ 4. 성경 안의 '장' 뽑기 (표를 펼쳤을 때 나오는 하위 줄) ═══
// ⚠️ 장별 합이 성경 합과 어긋나면 표가 거짓말을 한다. 그래서 장을 모르는
//    기록도 버리지 않고 '장 모름' 으로 센다.
console.log('시나리오 4 — 장 뽑기');
{
  const one = (ref,book,v) => _vTrChapterKeys(ref,book,v||{ref});
  sc.eq('로마서 8:28 → 8장', one('로마서 8:28','로마서'), ['8장']);
  sc.eq('시편 119:105 → 119장', one('시편 119:105','시편'), ['119장']);
  sc.eq('다른 성경의 장절은 안 센다', one('시편 23:1','로마서'), ['장 모름']);
  sc.eq('절 없이 장만 적힌 옛 표기', one('시편 119','시편'), ['119장']);
  sc.eq('장을 못 읽으면 장 모름', one('로마서','로마서'), ['장 모름']);
  sc.eq('본문이 여럿이면 여럿을 센다',
    _vTrChapterKeys('x','로마서',{ref:'로마서 8:28',refs:['로마서 8:28','로마서 12:1']}),
    ['8장','12장']);
  sc.eq('여럿 중 다른 성경은 걸러진다',
    _vTrChapterKeys('x','로마서',{ref:'로마서 8:28',refs:['로마서 8:28','시편 23:1']}),
    ['8장']);
  sc.eq('같은 장이 두 번 나와도 하나로',
    _vTrChapterKeys('x','로마서',{ref:'로마서 8:1',refs:['로마서 8:1','로마서 8:28']}),
    ['8장']);
}

// ═══ 5. 장은 숫자로 줄을 선다 ('10장'이 '2장' 앞에 서면 안 된다) ═══
console.log('시나리오 5 — 장 차례');
{
  const ks = ['12장','3장','119장','장 모름','8장'].map(k=>({key:k}));
  ks.sort((a,b)=>_vTrChapNo(a.key)-_vTrChapNo(b.key));
  sc.eq('숫자 차례, 모르는 것은 맨 뒤', ks.map(k=>k.key), ['3장','8장','12장','119장','장 모름']);
}

// ═══ 6. 변화량 — 늘면 초록, 줄면 빨강 (HB 9) ═══
console.log('시나리오 6 — 변화량의 색');
{
  sc.eq('늘면 초록 표시', /vtr-up/.test(_vTrDiffHTML(3)), true);
  sc.eq('늘면 + 를 붙인다', /\+3/.test(_vTrDiffHTML(3)), true);
  sc.eq('줄면 빨강 표시', /vtr-dn/.test(_vTrDiffHTML(-2)), true);
  sc.eq('그대로면 색 없음', /vtr-flat/.test(_vTrDiffHTML(0)), true);
  // ⚠️ 표 칸(.vtr-tbl td)이 더 센 선택자다. 함께 적지 않으면 색이 조용히 죽는다.
  sc.eq('초록은 표 칸까지 함께 적혀 있다', /\.vtr-up,\.vtr-tbl td\.vtr-up\{color:#2f9e63;\}/.test(SRC), true);
  sc.eq('빨강도 표 칸까지', /\.vtr-dn,\.vtr-tbl td\.vtr-dn\{color:#d9534f;\}/.test(SRC), true);
}

// ═══ 7. 범례에서 가운데를 꺼도 남은 선의 색이 안 바뀐다 (HB 6) ═══
// 색을 '그리는 차례'로 고르면 하나를 끌 때마다 뒤엣것이 줄줄이 밀린다.
// 그래서 목록에서의 자리(ci)를 못 박아 두고 그것만 본다.
console.log('시나리오 7 — 선 색은 자리(ci)로 고른다');
{
  sc.eq('그림이 ci 로 색을 고른다', /const col=s=>_VTR_COLORS\[\(\(s\.ci\|\|0\)/.test(SRC), true);
  sc.eq('그리기 전에 ci 를 못 박는다', /head\.forEach\(\(s,i\)=>\{s\.ci=i;\}\);/.test(SRC), true);
  sc.eq('범례도 같은 ci 를 쓴다', /_VTR_COLORS\[s\.ci%_VTR_COLORS\.length\]/.test(SRC), true);
  sc.eq('그리는 차례(indexOf)로 고르던 옛 코드는 없다', /shown\.indexOf\(s\)/.test(SRC), false);
}

// ═══ 8. 타일뷰에서 돌아올 때 엉뚱한 팝업이 안 뜬다 (HB 7-1 · 7-2) ═══
console.log('시나리오 8 — 오갈 때의 팝업 순서');
{
  sc.eq('상세는 떠 있을 때만 되돌릴 자리로 적는다',
    /detail:\(shown\('vDashDetailModal'\)&&_vDashDetailCtx\)/.test(SRC), true);
  sc.eq('상세를 닫으면 보던 자리 기억도 지운다',
    /if\(m\)m\.style\.display='none';\s*\n\s*_vDashDetailCtx=null;/.test(SRC), true);
  // 타일 → 전체화면: 전체화면을 **먼저** 띄우고 그리드를 닫아야 대시보드가 안 겹친다
  const vg = SRC.slice(SRC.indexOf('function vgPick('), SRC.indexOf('function vgTapDateSort('));
  sc.eq('전체화면을 띄운 뒤에 그리드를 닫는다',
    vg.indexOf("el.style.display='flex'") < vg.lastIndexOf('closeVerseGrid()'), true);
}

// ═══ 9. v26-0906-2 — 처음 자리 · 쉬는 슬라이더 값 · 표 정렬 · 그림 안 이름 ═══
console.log('\n시나리오 9 — 처음 열었을 때의 자리 (HB 3)');
{
  sc.eq('흐름 · 전체 · 말씀 모음 · 성경 · 4주 · 비중',
    [_VTR_DEFAULTS.tab,_VTR_DEFAULTS.kind,_VTR_DEFAULTS.axis,
     _VTR_DEFAULTS.unit,_VTR_DEFAULTS.span,_VTR_DEFAULTS.form],
    ['all','home','book','week',4,'area']);
  sc.eq('대시보드가 처음 여는 화면은 흐름', /if\(p\.v!==1\)\{p\.v=1;p\.view='trend';\}/.test(SRC), true);
  sc.eq('흐름 탭이 왼쪽, 분포가 그 다음',
    SRC.includes("const _VDASH_VIEWS=[['trend','흐름'],['pie','분포'],"), true);
  // 이미 값이 있는 기기에도 한 번은 닿아야 한다 (번호 이관)
  ST.settings.vTrPref={kind:'like',axis:'tag',tab:'prop',unit:'month',span:24,form:'line',
                       off:['x'],exp:['y'],ins:3,book:'로마서',v:2};
  const p=_vTrPref();
  sc.eq('옛 기기도 새 자리로 한 번 옮겨진다',
    [p.kind,p.axis,p.tab,p.unit,p.span,p.form,p.book], ['home','book','all','week',4,'area',null]);
  sc.eq('옮긴 뒤에는 다시 안 건드린다', (p.kind='like', _vTrPref().kind), 'like');
  ST.settings.vTrPref=null;
}

console.log('\n시나리오 9-2 — 쉬는 쪽 슬라이더는 4주=1달 로 맞춘다 (HB 5-2)');
{
  sc.eq('달 1 이면 주는 4', _vTrOtherSpan('month',1), 4);
  sc.eq('달 2 이면 주는 8', _vTrOtherSpan('month',2), 8);
  sc.eq('달 6 이면 주는 24', _vTrOtherSpan('month',6), 24);
  sc.eq('달 7 이어도 주는 24 에 머문다', _vTrOtherSpan('month',7), 24);
  sc.eq('달 24 여도 주는 24', _vTrOtherSpan('month',24), 24);
  sc.eq('주 1 이면 달은 1', _vTrOtherSpan('week',1), 1);
  sc.eq('주 4 여도 달은 1', _vTrOtherSpan('week',4), 1);
  sc.eq('주 5 면 달은 2', _vTrOtherSpan('week',5), 2);
  sc.eq('주 8 이면 달은 2', _vTrOtherSpan('week',8), 2);
  sc.eq('주 9 면 달은 3', _vTrOtherSpan('week',9), 3);
  sc.eq('주 24 면 달은 6', _vTrOtherSpan('week',24), 6);
}

console.log('\n시나리오 9-3 — 부드러운 슬라이더 (HB 5-1)');
{
  sc.eq('<input type=range> 는 흐름 화면에서 없앴다',
    /vtr-slide[\s\S]{0,400}input type="range"/.test(SRC), false);
  sc.eq('손으로 만든 레일이 있다', SRC.includes('class="vtr-rail"'), true);
  const rail=_vTrRailHTML({min:1,max:24,val:12,done:'span',unit:'week',lb:'x',suffix:'주',label:'주'});
  sc.eq('가운데 값이면 손잡이도 가운데쯤', /left:47\.83%/.test(rail), true);
  sc.eq('끌린 값은 손을 뗄 때만 저장한다',
    /el\.dataset\.done;\s*\n\s*if\(fn==='span'\)vTrSpanSet/.test(SRC), true);
  sc.eq('끄는 동안에는 손잡이와 글자만 바꾼다', /const paint=\(f,v\)=>\{/.test(SRC), true);
  sc.eq('PC 도 폰도 같은 포인터 이벤트로', SRC.includes("el.addEventListener('pointerdown',down);"), true);
  sc.eq('넓으면 두 슬라이더를 한 줄에', /@media \(min-width:720px\)\{[\s\S]{0,400}?\.vtr-slides\{flex-direction:row/.test(SRC), true);

  // v26-0907-3, HB 3-1 — 값 라벨이 자기 레일 **앞**에 선다.
  // 뒤에 두면 왼쪽 슬라이더의 숫자가 오른쪽 슬라이더에 더 붙어 보여 짝이 헷갈렸다.
  {
    const one = SRC.slice(SRC.indexOf('const row=u=>{'), SRC.indexOf('let chips='));
    sc.eq('라벨이 레일보다 먼저 나온다',
          one.indexOf('vtr-slide-lb') < one.indexOf('_vTrRailHTML('), true);
  }
  // 두 슬라이더 사이(28px)가 슬라이더 안쪽 간격(8px)보다 훨씬 넓다
  sc.eq('슬라이더 사이가 안쪽보다 넓다', /\.vtr-slides\{flex-direction:row;align-items:center;gap:28px;\}/.test(SRC), true);
  sc.eq('슬라이더 안쪽 간격은 8px', /\.vtr-slide\{display:flex;align-items:center;gap:8px;/.test(SRC), true);
}

console.log('\n시나리오 9-4 — 그림 안의 띠를 끌어 견주는 구간을 바꾼다 (HB 4)');
{
  // 그림 자리 셈과 끌 때의 셈이 **같은 함수**를 쓴다 (따로 세면 손가락과 어긋난다)
  const g=_vTrGeo(520,12);
  sc.eq('칸 하나의 폭', Math.round(g.bw), Math.round((520-40)/11));
  sc.eq('맨 오른쪽 칸의 x', Math.round(g.X(11)), 510);
  // 오른쪽 끝을 잡으면 h=1, 왼쪽으로 갈수록 커진다
  sc.eq('오른쪽 끝은 최근 1칸', _vTrHFromX(509,520,12,6), 1);
  sc.eq('왼쪽 끝은 절반까지만', _vTrHFromX(31,520,12,6), 6);
  sc.eq('가운데쯤이면 6칸', _vTrHFromX(275,520,12,6), 6);
  sc.eq('A 띠와 B 띠를 둘 다 그린다',
    SRC.includes('class="vtr-mkA"') && SRC.includes('class="vtr-mkB"'), true);
  // v26-0908-1, HB 2-1 — 띠 글자에 **기간 숫자까지** 넣는다('최근' 만으로는
  // 무엇과 견주는지 알 수 없다). 인사이트 알약·표 머리와 같은 글이 된다.
  sc.eq("띠 글자에 기간 숫자까지 (최근 N주)",
    SRC.includes('const lbA=`최근 ${insH}${unitW2}`;') &&
    SRC.includes("const lbB=`이전 ${(n>=2*insH)?'':'~'}${insH}${unitW2}`;"), true);
  // ⚠️ 글자에는 면을 칠하는 --ac 가 아니라 글자용 --ac-tx 를 쓴다.
  //    어두운 테마에서 옅은 띠 위에 --ac 를 얹으면 배경에 묻힌다 (v26-0906-3).
  sc.eq("'최근' 글자는 --ac-tx",
    SRC.includes("pill('vtr-mkAl',(xl+rt)/2,lbA,'var(--vtr-a-bg)','var(--ac-tx)')"), true);
  sc.eq("'최근' 글자에 --ac 를 쓰지 않는다", /class="vtr-mkAl"[^>]*fill="var\(--ac\)"/.test(SRC), false);
  sc.eq('잡는 자리를 넉넉히 둔다', SRC.includes('class="vtr-mkGrab"'), true);
  sc.eq('손을 뗄 때만 저장한다', /paint\(g\.edge[\s\S]{0,80}vTrInsSet\(cur\);/.test(SRC), true);
  // 인사이트 알약과 그림 띠가 같은 색을 쓴다 (HB 4-2)
  sc.eq('A 알약은 강조색', /\.vtr-pill-a\{background:var\(--vtr-a-bg\);/.test(SRC), true);
  sc.eq('B 알약은 회색', /\.vtr-pill-b\{background:var\(--vtr-b-bg\);/.test(SRC), true);
  sc.eq('그림의 A 띠도 강조색', /class="vtr-mkA"[^>]*fill="var\(--ac\)"/.test(SRC), true);
  // v26-0908-1, HB 2-2 — '이전' 이 안 보이던 진짜 까닭은 투명도가 아니라
  // **고정 회색(#8a8a99)** 이었다. 테마에 따라 배경과 밝기가 같아져 사라졌다.
  sc.eq('그림의 B 띠는 테마를 따르는 본문색', /class="vtr-mkB"[^>]*fill="var\(--tx2\)"/.test(SRC), true);
  // (주석 안의 설명 말고, 실제로 칠하는 값으로 안 쓴다는 뜻)
  sc.eq('고정 회색(#8a8a99)으로 칠하지 않는다', SRC.includes('fill="#8a8a99"'), false);
  sc.eq('두 구간이 같은 짜임 — 왼쪽 모서리 선도 둘 다',
    SRC.includes('class="vtr-mkBe"') && SRC.includes('class="vtr-mkE"'), true);
}

console.log('\n시나리오 9-5 — 표 정렬 (HB 7)');
{
  const D={axis:'book',book:null};
  const R=(k,late,prev,total)=>({key:k,late,prev,diff:late-prev,total});
  const rows=[R('로마서',3,1,7),R('마태복음',5,5,9),R('창세기',5,2,4)];
  sc.eq('기본은 최근 내림차순', _vTrSort().col+'/'+_vTrSort().dir, '1/-1');
  sc.eq('최근 내림차순 — 같으면 성경순',
    _vTrSortRows(rows,D,{col:1,dir:-1}).map(r=>r.key), ['창세기','마태복음','로마서']);
  sc.eq('최근 오름차순', _vTrSortRows(rows,D,{col:1,dir:1}).map(r=>r.key), ['로마서','창세기','마태복음']);
  sc.eq('1열은 성경 차례 (ㄱㄴㄷ 아님)',
    _vTrSortRows(rows,D,{col:0,dir:1}).map(r=>r.key), ['창세기','마태복음','로마서']);
  sc.eq('1열 거꾸로', _vTrSortRows(rows,D,{col:0,dir:-1}).map(r=>r.key), ['로마서','마태복음','창세기']);
  sc.eq('성경이 아니면 ㄱㄴㄷ',
    _vTrSortRows([R('하늘',1,0,1),R('가나',1,0,1),R('나라',1,0,1)],{axis:'tag',book:null},{col:0,dir:1})
      .map(r=>r.key), ['가나','나라','하늘']);
  sc.eq('성경 안(장)에서는 숫자 차례',
    _vTrSortRows([R('10장',1,0,1),R('2장',1,0,1),R('1장',1,0,1)],{axis:'book',book:'로마서'},{col:0,dir:1})
      .map(r=>r.key), ['1장','2장','10장']);
  sc.eq('변화 열로도 정렬한다', _vTrSortRows(rows,D,{col:3,dir:-1})[0].key, '창세기');
  sc.eq('합계 열로도 정렬한다', _vTrSortRows(rows,D,{col:4,dir:-1})[0].key, '마태복음');
  // 제목줄 — 누를 수 있고, 지금 정렬 중인 열에 화살표가 붙는다 (HB 7·8)
  const th=_vTrTheadHTML({unit:'week',book:null},4,12,{col:1,dir:-1});
  sc.eq('제목을 누르면 정렬한다', th.includes('onclick="vTrSortBy(1)"'), true);
  sc.eq('정렬 중인 열에 화살표', th.includes('<span class="vtr-sarrow">▼</span>'), true);
  sc.eq("합계 앞에 기간을 적는다 (HB 8)", th.includes('12주 합계'), true);
  sc.eq('최근·이전은 견주는 구간을 따른다',
    th.includes('최근 4주') && th.includes('이전 4주'), true);
  sc.eq("성경 안에서는 1열 이름이 '장'",
    _vTrTheadHTML({unit:'week',book:'로마서'},4,12,{col:1,dir:-1}).includes('>장<'), true);
}

console.log('\n시나리오 9-6 — 표 이름 칸을 범례 색으로 채운다 (HB 9-4)');
{
  const d={axis:'book',book:null};
  const r={key:'로마서',late:3,prev:1,diff:2,total:7};
  const withC=_vTrRowHTML(r,d,4,{color:'#5a70f8'});
  sc.eq('이름 칸에 그 색을 깐다', withC.includes('linear-gradient(90deg,#5a70f82e,#5a70f812)'), true);
  sc.eq('왼쪽 끝에 진한 띠', withC.includes('border-left-color:#5a70f8'), true);
  sc.eq('색이 없으면 안 칠한다', _vTrRowHTML(r,d,4,{}).includes('linear-gradient'), false);
  sc.eq('이름을 누르면 그 목록으로', withC.includes("vDashOpenFilter('book','로마서')"), true);
  // 성경 하나를 들여다볼 때 '장' 은 걸어 줄 필터가 없다 → 링크로 만들지 않는다
  const chap=_vTrRowHTML({key:'3장',late:1,prev:0,diff:1,total:1},{axis:'book',book:'로마서'},4,{});
  sc.eq('장 줄은 링크가 아니다', chap.includes('vDashOpenFilter'), false);
}

console.log('\n시나리오 9-7 — 그림 안에 이름을 쓰고, 누르면 목록으로 (HB 9-1~9-3)');
{
  sc.eq('영역 안에 이름을 쓴다 (띠가 두꺼운 칸에)', /bestI>=0&&bestT>=11/.test(SRC), true);
  sc.eq('선 오른쪽 끝에 이름을 쓴다', /tips\.sort\(\(a,b\)=>a\.y-b\.y\);/.test(SRC), true);
  // v26-0906-3 — 선들이 끝에서 한 점으로 모이면 이름이 서로 포개져 못 읽었다.
  //   ① 위에서부터 벌리고 ② 아래로 넘치면 묶음째 올린 뒤 아래에서부터 다시 벌린다.
  sc.eq('겹치면 벌린다', /t\.ly=Math\.max\(t\.y-7,prev\+GAP\);/.test(SRC), true);
  sc.eq('아래로 넘치면 묶음째 밀어 올린다', /if\(over>0\)tips\.forEach\(t=>\{t\.ly-=over;\}\);/.test(SRC), true);
  sc.eq('올린 뒤 아래에서부터 다시 벌린다',
    /for\(let i=tips\.length-1;i>=0;i--\)\{ tips\[i\]\.ly=Math\.min\(tips\[i\]\.ly,next-GAP\); next=tips\[i\]\.ly; \}/.test(SRC), true);
  sc.eq('영역·선·이름을 누르면 표의 그 줄과 같은 일을 한다',
    /const clickOf=s=>[\s\S]{0,80}onclick="vDashOpenFilter/.test(SRC), true);
  sc.eq('성경 안(장)·빈자리 이름에서는 누를 것이 없다',
    SRC.includes("const clickOf=s=>(book||_vDashIsPlaceholder(s.key))?''"), true);
}

console.log('\n시나리오 9-8 — 닫기 × 는 늘 우상단 (HB 1)');
{
  sc.eq('늘 있는 빈 칸이 × 를 오른쪽 끝으로 민다', SRC.includes('<div class="vdash-hdgap"></div>'), true);
  sc.eq('빈 칸이 늘어난다', /\.vdash-hdgap\{flex:1 1 auto;/.test(SRC), true);
  // v26-0906-8 — 화면이 다섯이 되면서 윗줄이 빽빽해졌다. 기간 칩은 아랫줄로 내렸다.
  // v26-0907-3, HB 3-2 — 분포 전용 기간 글자 버튼 줄을 아예 없앴다.
  // 기간은 이제 본문 안 **한 벌**([전체][직접] + 주·달 슬라이더)뿐이다.
  sc.eq('분포 전용 기간 줄은 사라졌다', SRC.includes('id="vDashPeriods"'), false);
  sc.eq('분포 전용 기간 버튼 만들개도 사라졌다', SRC.includes('function _vDashPeriodBtnsHTML('), false);
  sc.eq('기간 한 벌은 흐름 말고 세 화면에도 붙는다',
        (SRC.match(/_vTrSpanRowHTML\(\{all:true\}\)/g) || []).length, 2);
  sc.eq('흐름은 전체·직접 칩 없이 쓴다', SRC.includes('ctl+=_vTrSpanRowHTML();'), true);
  sc.eq('윗줄에는 탭·책·빈칸·닫기만',
        /id="vDashViewTabs"><\/div>[\s\S]{0,900}vdash-hdgap[\s\S]{0,60}modal-x modal-x-inline" onclick="closeVerseDashboard/.test(SRC), true);
  sc.eq('윗줄에 말씀 모음 설정 단추가 있다', SRC.includes('onclick="vDashOpenCollSettings()"'), true);
  sc.eq('그 단추는 말씀모음 탭을 열고 이름을 반짝인다', /function vDashOpenCollSettings\(\)\{[\s\S]{0,200}_vsetGoTab\('coll',true\);/.test(SRC), true);
  sc.eq('설정을 닫으면 대시보드로 돌아온다', /to==='vdash'&&typeof openVerseDashboard==='function'/.test(SRC), true);
}

console.log('\n시나리오 9-9 — 성경 이름은 맨 위 가로선 바로 아래 (HB 6)');
{
  sc.eq('위쪽에 붙인다', /\.vtr-book\{flex:0 0 auto;max-width:38%;display:flex;align-items:flex-start;/.test(SRC), true);
}

// ═══ 10. 그래프 폭은 **띄운 뒤에** 잰다 ═══
// ⚠️ 숨어 있는 동안에는 clientWidth 가 0 이라 늘 280px 짜리로 그려졌다.
//    폰에서는 화면과 엇비슷해 안 보였고 PC 에서만 반쪽으로 나왔다 (v26-0906-2).
console.log('\n시나리오 10 — 그래프 폭을 잴 수 있을 때 그린다');
{
  const fn = SRC.slice(SRC.indexOf('function openVerseDashboard(){'),
                       SRC.indexOf('function closeVerseDashboard(){'));
  sc.eq('먼저 띄우고', fn.indexOf("style.display='flex'") < fn.indexOf('renderVerseDashboard()'), true);
  sc.eq('그 다음 그린다', fn.includes('renderVerseDashboard();'), true);
  sc.eq('창 크기가 바뀌면 다시 그린다',
    /window\.addEventListener\('resize',\(\)=>\{[\s\S]{0,300}renderVerseDashboard\(\);\},180\);/.test(SRC), true);
  sc.eq('열려 있을 때만 다시 그린다', /if\(!m\|\|!m\.style\.display\|\|m\.style\.display==='none'\)return;/.test(SRC), true);
}

// ═══ 11. v26-0906-5 — 작은 발견 (HB 2) ═══
// 상위 여섯에 못 드는 것도 뜻이 있다: 처음 나왔다 / 오랜만이다 / 이 하나뿐이다.
console.log('\n시나리오 11 — 작은 발견');
{
  // 12칸(주). 최근 절반은 6..11
  const S=(key,vals,top)=>({key,vals,total:vals.reduce((a,b)=>a+b,0),top:top||''});
  const d={keys:new Array(12).fill(0).map((_,i)=>'k'+i),unit:'week',axis:'tag',book:null,all:[
    S('은혜',[2,2,2,2,2,2,2,2,2,2,2,2]),                 // 늘 있었다 — 아무것도 아님
    S('절제',[0,0,0,0,0,0,0,0,0,0,0,1]),                 // 처음 + 하나뿐
    S('회복',[1,0,0,0,0,0,0,0,0,0,0,1]),                 // 오랜만 (6칸 비었다)
    S('희년',[0,0,0,1,0,0,0,0,0,0,0,0],'창세기 1:1'),    // 옛날에 하나뿐
    S('인내',[0,0,0,0,0,0,0,0,0,0,1,1]),                 // 처음(둘)
    S('평강',[1,0,1,0,0,0,0,0,0,0,0,0]),                 // 옛날에만 두 번 — 카드는 아니고 꼬리
  ]};
  const f = _vTrFindings(d,6);
  sc.eq('처음 나온 것을 골라낸다', f.fresh.map(x=>x.s.key).sort(), ['인내','절제']);
  sc.eq('오랜만인 것을 골라낸다', f.back.map(x=>x.s.key), ['회복']);
  // '몇 주 만에' — 지난번(0칸)에서 이번(11칸)까지의 거리
  sc.eq('몇 주 만인지 센다', f.back[0].gap, 11);
  sc.eq('하나뿐인 것을 골라낸다', f.only.map(x=>x.s.key).sort(), ['절제','희년']);
  sc.eq('꼬리(1~2회)에는 늘 있던 것이 안 들어간다', f.tail.some(s=>s.key==='은혜'), false);
  sc.eq('꼬리에 적게 나온 것들이 들어간다',
        f.tail.map(s=>s.key).sort(), ['인내','절제','평강','회복','희년']);

  const html=_vTrFindingsHTML(d,6);
  sc.eq('카드가 그려진다', html.includes('vfind-card'), true);
  sc.eq('세 갈래 이름표', /처음/.test(html)&&/오랜만/.test(html)&&/하나뿐/.test(html), true);
  // ⚠️ 같은 이름이 카드 두 장에 겹쳐 나오면 안 된다 ('절제'는 처음이자 하나뿐)
  sc.eq("한 이름은 카드 한 장만", (html.match(/vfind-key" title="절제"/g)||[]).length, 1);
  sc.eq('카드는 여섯 장까지', (html.match(/vfind-card/g)||[]).length <= 6, true);
  sc.eq('카드를 누르면 그 목록으로', html.includes("vDashOpenFilter('tag','절제')"), true);
  sc.eq('카드에 안 든 꼬리는 칩으로', html.includes('vfind-chip'), true);
  sc.eq('카드로 세운 것은 칩에 또 안 나온다',
        (html.match(/vfind-chip"[^>]*>절제/g)||[]).length, 0);
  // 성경 하나를 들여다보는 중에는 걸어 줄 필터가 없다
  sc.eq('성경 안에서는 안 눌린다',
        _vTrFindingsHTML(Object.assign({},d,{book:'로마서'}),6).includes('vDashOpenFilter'), false);
  sc.eq('아무것도 없으면 통째로 안 그린다', _vTrFindingsHTML({keys:[],unit:'week',axis:'tag',book:null,all:[]},1), '');
}

// ═══ 12. v26-0906-5 — 지도 · 연결 · 리듬 (HB 1) ═══
console.log('\n시나리오 12 — 성경 지도');
{
  sc.eq('66권의 장 수가 있다', BIBLE_CHAPTERS_OT.length+BIBLE_CHAPTERS_NT.length, 66);
  sc.eq('책 이름 수와 맞는다',
        [BIBLE_ORDER_OT.length,BIBLE_ORDER_NT.length], [BIBLE_CHAPTERS_OT.length,BIBLE_CHAPTERS_NT.length]);
  sc.eq('창세기 50장', _bibleChapters('창세기'), 50);
  sc.eq('시편 150장', _bibleChapters('시편'), 150);
  sc.eq('오바댜 1장', _bibleChapters('오바댜'), 1);
  sc.eq('요한계시록 22장', _bibleChapters('요한계시록'), 22);
  sc.eq('모르는 책은 0', _bibleChapters('없는책'), 0);
  sc.eq('짧은 이름', [_bibleShort('사무엘상'),_bibleShort('요한계시록'),_bibleShort('시편')], ['삼상','계','시']);
  // 진하기 — 0 은 부르지 않는다(빈 칸), 1 이면 가장 진하게
  sc.eq('가장 옅은 칸', _vMapShade(0.1).includes('0.22'), true);
  sc.eq('가장 진한 칸', _vMapShade(1).includes('1)'), true);
  sc.eq('묵힘은 따뜻한 색', _vMapShade(1,true).includes('224,164,88'), true);
  // ⚠️ 옅은 칸에 흰 글자를 쓰면 배경에 묻힌다 (v26-0906-7 — '묵힘' 지도가 그랬다)
  sc.eq('옅은 칸의 글자는 본문색', _vMapInk(0.1), 'var(--tx2)');
  sc.eq('진한 칸의 글자는 흰색', _vMapInk(1), '#fff');
  sc.eq('가운데(3단)부터 흰색', [_vMapInk(0.5),_vMapInk(0.35)], ['#fff','var(--tx2)']);
  sc.eq('흰 글자를 CSS 에서 못박지 않는다', SRC.includes('.vmap-cell.on{border-color:transparent;}'), true);
  sc.eq('지난 주 수를 센다', _vWeeksSince('2026-08-16','2026-09-06'), 3);
  sc.eq('같은 날은 0주', _vWeeksSince('2026-09-06','2026-09-06'), 0);
  sc.eq('날짜가 없으면 아주 큰 수', _vWeeksSince('','2026-09-06'), 999);
  sc.eq('지도 기본은 횟수 보기', _vMapMode(), 'count');
  sc.eq('빈자리 이름은 지도에 안 들어간다',
        /_vDashKeysOf\(e\.ref,'book',e\.v\)\.forEach\(b=>\{\s*\n?\s*if\(_vDashIsPlaceholder\(b\)\)return;/.test(SRC), true);
  sc.eq('안 밟은 장도 칸으로 남긴다', SRC.includes('for(let i=1;i<=total;i++){'), true);
  // v26-0908-2, HB 2-2-1 — 구약/신약 덩어리 끝이 아니라 **고른 성경이 있는
  //   그 갈래 줄 바로 아래**에 편다. 누른 자리에서 눈이 안 떠나야 한다.
  sc.eq('장 격자는 고른 성경이 있는 줄 바로 아래에',
    SRC.includes("((p.mapBook&&g.books.indexOf(p.mapBook)>=0)?chapsHTML:'')).join('');"), true);
  sc.eq('접혀 있어도 그 갈래 아래에 편다',
    SRC.includes("((p.mapBook&&order.indexOf(p.mapBook)>=0)?chapsHTML:'');"), true);
  sc.eq('맨 끝에 한 번 더 붙이던 옛 자리는 없앴다', SRC.includes('isOT?chapsHTML'), false);
}

// ═══ 14. v26-0907-3 — 지도 손질 (HB 6) ═══
console.log('\n시나리오 14 — 지도: 갈래 줄바꿈 · 구간 슬라이더 · 뜨거운 색');
{
  // 6-2 갈래마다 줄을 바꾼다. 책 이름은 BIBLE_ORDER 차례를 그대로 끊어 쓴다.
  const ot = _vMapGroups(BIBLE_ORDER_OT, _VMAP_GROUPS_OT);
  const nt = _vMapGroups(BIBLE_ORDER_NT, _VMAP_GROUPS_NT);
  sc.eq('구약이 다섯 갈래', ot.map(g => g.nm), ['율법서','역사서','시가서','대선지서','소선지서']);
  sc.eq('신약이 다섯 갈래', nt.map(g => g.nm), ['복음서','역사서','바울서신','일반서신','예언서']);
  sc.eq('율법서는 창~신', ot[0].books, ['창세기','출애굽기','레위기','민수기','신명기']);
  sc.eq('역사서는 여호수아부터', ot[1].books[0], '여호수아');
  sc.eq('소선지서 끝이 말라기', ot[4].books[ot[4].books.length-1], '말라기');
  sc.eq('바울서신은 롬~몬 열셋', [nt[2].books[0], nt[2].books[12], nt[2].books.length], ['로마서','빌레몬서',13]);
  sc.eq('예언서는 계시록 하나', nt[4].books, ['요한계시록']);
  sc.eq('구약 39권을 다 덮는다', ot.reduce((a,g)=>a+g.books.length,0), 39);
  sc.eq('신약 27권을 다 덮는다', nt.reduce((a,g)=>a+g.books.length,0), 27);
  sc.eq('빠지거나 겹치는 책이 없다',
        new Set(ot.concat(nt).flatMap(g=>g.books)).size, 66);

  // 6-3 양쪽 손잡이 — 아무것도 안 골랐으면 구간 전체
  // v26-0908-2, HB 2-1-2 — 손잡이가 집는 값이 말씀 카운트에서 **성경 순위**로
  //   바뀌었다. 1등이 가장 많이 다룬 곳이라 첫 값이 0 이 아니라 1 이다.
  //   ⚠️ 저장 키도 mapRg → mapRg2 로 옮겼다. 뜻이 아예 달라진 값이라 옛 값을
  //      그대로 읽으면 엉뚱한 구간이 걸린 채로 열린다.
  ST.settings.vTrPref = null;
  const full = _vMapRange('count', 12);
  sc.eq('처음엔 구간 전체(1~N)', [full.lo, full.hi, full.full], [1, 12, true]);
  _vTrPref().mapRg2 = { count: { lo: 3, hi: 8 } };
  const cut = _vMapRange('count', 12);
  sc.eq('고른 구간을 쓴다', [cut.lo, cut.hi, cut.full], [3, 8, false]);
  // 자료가 줄어 최댓값이 작아져도 구간이 밖으로 삐져나가지 않는다
  const small = _vMapRange('count', 5);
  sc.eq('최댓값이 줄면 함께 줄어든다', [small.lo, small.hi], [3, 5]);
  _vTrPref().mapRg2 = { count: { lo: 9, hi: 2 } };
  sc.eq('뒤집힌 값도 바로잡는다', (r => r.lo <= r.hi)(_vMapRange('count', 12)), true);
  ST.settings.vTrPref = null;
  // 보기(횟수/묵힘)마다 구간을 따로 든다
  sc.eq('보기마다 구간이 따로', SRC.includes("p.mapRg2[mode]={lo:Math.round(lo),hi:Math.round(hi)};"), true);
  sc.eq('구간 밖은 지우지 않고 흐린다', SRC.includes("if(!rk||rk<rg.lo||rk>rg.hi)cls+=' out';"), true);
  sc.eq('순위표를 따로 만든다(값 큰 차례)', SRC.includes('function _vMapRanks(stats,mode,nowKey){'), true);
  sc.eq('왼쪽 글자와 손잡이가 같은 단위를 쓴다',
    SRC.includes('const rgLbTx=_vTrExclLabel(rg.lo-1, rk.total-rg.hi);'), true);
  // 2-1-1 — 두 손잡이 사이 바 위에 남은 성경 개수.
  // v26-0908-3, HB — 막대 **밖**에 둔다. 막대는 opacity .42 라 그 안에 넣으면
  //   글자까지 흐려져 배경과 구별이 안 됐다. 색도 강조색으로.
  sc.eq('두 손잡이 사이에 남은 개수를 적는다',
    SRC.includes('${Math.max(0,o.hi-o.lo+1)}</span>'), true);
  sc.eq('숫자는 막대 밖에 선다(흐려지지 않게)',
    /\.vtr-rail-n\{position:absolute;[\s\S]{0,140}color:var\(--ac-tx\);/.test(SRC), true);
  sc.eq('미는 동안에도 그 숫자가 따라간다',
    SRC.includes('midN.textContent=String(Math.max(0,hi-lo+1));'), true);
  sc.eq('미는 동안 자리도 따라간다',
    SRC.includes('midN.style.left=`calc((${midPc(lo)} + ${midPc(hi)}) / 2)`;'), true);
  sc.eq('두 손잡이는 서로를 밀지 않는다',
        SRC.includes("if(grab==='lo')lo=Math.max(min,Math.min(hi,v));"), true);

  // 6-4 횟수는 빨강(뜨거움), 묵힘의 호박색은 그대로
  sc.eq('횟수는 빨강 계열', /return warm\?`rgba\(224,164,88,\$\{a\}\)`:`rgba\(203,58,68,\$\{a\}\)`;/.test(SRC), true);
  sc.eq('예전 파랑은 사라졌다', SRC.includes('rgba(90,112,248,${a})'), false);

  // 6-1 좌우 끝 테두리가 잘리지 않게 격자에 여백을 줬다
  sc.eq('격자에 테두리 설 자리가 있다', /\.vmap-grid\{[^}]*padding:3px;margin:-3px;\}/.test(SRC), true);
}

console.log('\n시나리오 12-2 — 연결 · 리듬');
{
  sc.eq('연결의 왼쪽 기본은 태그', _vLinkAxis(), 'tag');
  sc.eq('짝 열쇠를 안 나오는 글자로 가른다',
        SRC.includes('const SEP=') && SRC.includes('pair.set(l+SEP+r'), true);
  // v26-0907-4, HB 7 — 두 줄 사이를 잇던 그림을 **그래프 뷰**로 바꿨다.
  // v26-0907-6, HB 3 — 타일뷰로 곧장 보내지 않고 **짝 목록**을 연다
  // v26-0908-3, HB 1-2 — 짝 목록을 여는 것에 더해, 그 점을 그래프의 **중심**
  //   으로 삼는다. 고른 점이 없으면 뎁스는 원리상 아무 일도 못 하기 때문이다.
  sc.eq('점을 톡 누르면 짝 목록으로',
        SRC.includes("openVPair(n.kind==='book'?'book':la,n.key);"), true);
  sc.eq('그 점이 중심이 된다', SRC.includes('vgSetSelOnly(n.kind+_VG_SEP+n.key);'), true);
  sc.eq('그 점 하나만 고르는 함수', SRC.includes('function vgSetSelOnly(id){'), true);
  // v26-0907-8, HB 2-1·2-2 — 고정 상한(14/22) 대신 순위 슬라이더로 바뀌었다.
  // 절대 안전판(_VG_RANK_MAX)만 남는다 — 자세한 순위 계산은 시나리오 21 에서.
  sc.eq('점 · 선 후보의 절대 상한이 있다', _VG_RANK_MAX, 60);
  // v26-0907-5 — 배치 값이 팝업에서 고쳐지므로 상수가 아니라 설정에서 온다
  // v26-0907-7 — 슬라이더가 **미는 동안** 값을 갈아끼우므로 const 로 굳히지 않는다
  sc.eq('물리 값을 담은 통이 있다', SRC.includes('const P=_vgCfg();'), true);
  sc.eq('미는 힘을 통에서 읽는다', SRC.includes('const f=P.rep*_rep2(a,b)/dd'), true);
  sc.eq('당기는 힘을 통에서 읽는다', SRC.includes('const f=(d-P.rest)*(P.pull/1000)'), true);
  sc.eq('통을 갈아끼우는 문이 있다', /setCfg:\(k,v\)=>\{\s*\n?\s*P\[k\]=v;/.test(SRC), true);
  sc.eq('아무 선에도 안 걸린 점은 뺀다', SRC.includes('const N=nodes.filter(n=>n.deg>0);'), true);
  sc.eq('처음 몇 판은 안 그리고 돌려 둔다', SRC.includes('for(let i=0;i<160;i++)tick();'), true);

  // ═══ v26-0907-5 (HB) — 연결 그래프 손질 ═══
  // 0 · 점이 격하게 춤추던 것 — 척력 상한 + 식힘을 이동에 곱한다
  // 가까울 때의 폭발은 **힘에 뚜껑을 씌워** 막지 않는다 — 뚜껑을 씌우면
  // 겹친 점이 서로 못 밀어내 한 덩어리로 뭉친다 (처음 시도에서 실제로 그랬다).
  // 대신 거리에 바닥을 준다.
  sc.eq('거리에 바닥을 줘서 폭발을 막는다', SRC.includes('const DMIN2=144;'), true);
  sc.eq('거리 바닥을 실제로 쓴다', SRC.includes('const dd=Math.max(d2,DMIN2);'), true);
  sc.eq('힘에 뚜껑을 씌우지 않는다', SRC.includes('Math.min(REP/d2,FMAX)'), false);
  // 같은 갈래끼리 더 세게 민다 — 주제끼리가 가장 세다 (이름이 길어 먼저 부딪힌다)
  sc.eq('같은 갈래를 더 민다',
        SRC.includes("const _rep2=(a,b)=>(a.kind!==b.kind)?1:(a.kind==='topic'?7:2.2);"), true);
  sc.eq('그 세기를 실제로 쓴다', SRC.includes('const f=P.rep*_rep2(a,b)/dd'), true);
  // 식힘을 자리 이동에 곱한다 — 이것이 '춤추다 뚝 멈추는' 것을 없앤다
  sc.eq('식힘을 자리 이동에 곱한다',
        /const ddx=Math\.max\(-10,Math\.min\(10,p\.vx\)\)\*alpha;/.test(SRC), true);
  // 이미 잦아들었으면 곧바로 멈춘다 (안 움직이는 그림을 계속 다시 그리지 않는다)
  sc.eq('잦아들면 곧바로 멈춘다', /still=\(moved<0\.05\)\?\(still\+1\):0;/.test(SRC), true);
  sc.eq('멈출 조건에 그것이 들어간다', SRC.includes('if(alpha>0.06&&still<8)'), true);
  // 1-1 · 골라 보기 + N뎁스
  sc.eq('씨앗에서 N걸음까지 번진다', SRC.includes('function _vgReach(N,E,seeds,depth)'), true);
  sc.eq('씨앗이 없으면 전부 보인다', SRC.includes('if(!seeds.size)return null;'), true);
  // v26-0907-8, HB 2-3 — "1뎁스가 최하값인데 손잡이가 왼쪽 끝이 아니다".
  // 0~4 였던 것을 1~4 로 좁혔다 — 이제 1뎁스가 진짜 최솟값이라 손잡이가
  // 그 값에서 슬라이더 왼쪽 끝에 선다.
  sc.eq('뎁스는 1~4 (0은 없앴다)', SRC.includes('return(isFinite(n)&&n>=1&&n<=4)?n:1;'), true);
  sc.eq('저장할 때도 1~4 로 가둔다',
        SRC.includes('_vTrPref().vgDepth=Math.max(1,Math.min(4,parseInt(v,10)||1));'), true);
  // v26-0907-9, HB 92 — 슬라이더를 걷어내고 알약칩(1·2·3·전체)으로 바꿨다.
  sc.eq('뎁스는 이제 슬라이더가 아니라 칩', SRC.includes("[1,2,3,4].map(v=>"), true);
  // v26-0908-1, HB 92 — 글자만 있던 칩을 테두리 있는 진짜 알약 버튼으로.
  sc.eq('뎁스는 테두리 있는 알약 버튼',
    SRC.includes('<span class="vg-depthchip${d===v?\' on\':\'\'}" '), true);
  // v26-0908-3, HB — 옅게 두는 것은 **줄 전체**다. 고른 칩(.on)까지 덮으면
  //   꺼진 것처럼 보인다.
  sc.eq('옅게 두는 것은 줄 전체', SRC.includes("vtr-ctl-vals${seeded?'':' vg-depth-idle'}"), true);
  sc.eq('고른 칩은 어떤 상태에서도 또렷하다',
    /\.vg-depth-idle \.vg-depthchip\.on\{opacity:1;\}/.test(SRC), true);
  sc.eq('개수는 늘 적는다(고른 점이 없어도)',
    SRC.includes("const cnt=_vgDepthCounts()||[0,0,0,0].map(()=>(_vgData?_vgData.N.length:0));"), true);
  sc.eq("4뎁스는 '전체' 라고 쓴다", SRC.includes("${v===4?'전체':v}"), true);
  // v26-0908-2, HB 1-2 — "뎁스가 그래프에 안 먹는다". 값은 잘 들어가는데
  //   두 갈래 그물이라 2뎁스면 이어진 곳을 거의 다 훑어 3·전체가 2와 같아진다.
  //   칩마다 그 뎁스에서 몇 개가 보이는지를 미리 세어 적어 두면 그것이 보인다.
  sc.eq('칩마다 그 뎁스의 개수를 적는다', SRC.includes('<span class="vg-depthn">${cnt[v-1]}</span>'), true);
  sc.eq('뎁스별 개수를 세는 함수', SRC.includes('function _vgDepthCounts(){'), true);
  sc.eq('씨앗이 없으면 null (뎁스가 할 일이 없다)',
    /function _vgDepthCounts\(\)\{[\s\S]{0,220}if\(!seeds\.size\)return null;/.test(SRC), true);
  sc.eq('알약 CSS — 테두리·둥근 모서리', /\.vg-depthchip\{[^}]*border:1px solid var\(--bd2\)/.test(SRC), true);
  // 고른 점이 없으면 뎁스가 아무 일도 안 한다 — 그 사정을 적어 준다
  sc.eq('씨앗이 없으면 무엇을 하면 되는지 적는다',
    SRC.includes('<span class="vg-depthnote">점을 톡 누르면 그 점이 중심이 돼요</span>'), true);
  sc.eq('안내 문구도 4뎁스일 땐 전체라고 쓴다',
        SRC.includes("const dtx=_vgDepth()>=4?'전체':`${_vgDepth()}뎁스`;"), true);
  // 1-2 · 검색은 타이핑하는 동안 바로. 다시 그리지 않고 보임/숨김만 바꾼다.
  sc.eq('타이핑하는 동안 걸린다', SRC.includes('oninput="vgSearch(this.value)"'), true);
  sc.eq('검색은 다시 그리지 않는다',
        /function vgSearch\(q\)\{[\s\S]{0,200}?_vgApplyFilter\(\);/.test(SRC), true);
  sc.eq('검색어는 저장하지 않는다', SRC.includes("let _vgQuery='';"), true);
  sc.eq('숨긴 점은 물리에서도 빠진다', SRC.includes('if(a.hide)continue;'), true);
  // 2-1 · 배치 값 팝업
  sc.eq('배치 값 넷', SRC.includes("const _VG_CFG_ROWS=["), true);
  // 머무는 힘 기본 120 — 놓은 자리에서 20px 안쪽만 흘러간다 (브라우저에서 실측)
  sc.eq('기본값이 있다', SRC.includes("const _VG_DEF={rest:64,rep:760,pull:24,stick:120,font:100};"), true);

  // ═══ v26-0907-7 (HB 1·2) — 팝업을 걷어내고 그래프 곁에서 만진다 ═══
  sc.eq('골라보기 팝업은 없앴다', SRC.includes('id="vgPickModal"'), false);
  sc.eq('배치 팝업도 없앴다', SRC.includes('id="vgCfgModal"'), false);
  sc.eq('두 판이 그래프와 한 무대에 선다',
        SRC.includes('<div class="vg-pane vg-pane-l" id="vgPaneL">') &&
        SRC.includes('<div class="vg-pane vg-pane-r" id="vgPaneR">'), true);
  sc.eq('좁으면 그래프가 먼저, 목록은 아래로',
        /\.vg-stage \.vg-wrap\{order:1;flex:1 1 100%;/.test(SRC), true);
  sc.eq('넓으면 주제 왼쪽 · 성경 오른쪽',
        /\.vg-stage\.pick \.vg-pane-l\{order:0;/.test(SRC) &&
        /\.vg-stage\.pick \.vg-pane-r\{order:2;/.test(SRC), true);
  // 폭은 **넣은 뒤에** 잰다 — 옆 목록이 켜지면 그래프가 좁아진다
  sc.eq('껍데기를 넣고 나서 폭을 잰다',
        /box\.innerHTML=html;[\s\S]{0,200}?const wrap=box\.querySelector\('\.vg-wrap'\);/.test(SRC), true);
  // 배치 값은 미는 동안 바로 먹인다 — 다시 그리지도 저장하지도 않는다
  sc.eq('배치 슬라이더는 live', SRC.includes("label:nm,live:true}"), true);
  sc.eq('미는 동안 바로 먹인다',
        SRC.includes("if(el.dataset.live==='1'&&v!==lastLive){lastLive=v;fire(v,true);}"), true);
  sc.eq('미는 동안에는 저장하지 않는다', SRC.includes('if(!live)save();'), true);
  sc.eq('배치를 바꿔도 다시 그리지 않는다',
        /function vgCfgSet\(key,val,live\)\{[\s\S]{0,400}?\}/.exec(SRC)[0].includes('renderVDashLink'), false);
  // 머무는 힘 (HB 가 '복원력' 이라 부른 것)
  sc.eq('머무는 힘이 있다', SRC.includes("['stick','머무는 힘',0,240,''"), true);
  sc.eq('못 박은 점을 그 자리로 당긴다',
        SRC.includes('if(p.pin&&ST>0){p.vx+=(p.ax-p.x)*ST; p.vy+=(p.ay-p.y)*ST;}'), true);
  sc.eq('끌어다 놓으면 못을 박는다', /n\.pin=true; n\.ax=n\.x; n\.ay=n\.y;/.test(SRC), true);
  sc.eq('못 박힌 것을 테두리로 알린다', /\.vg-node\.pin circle\{stroke:var\(--ac\);/.test(SRC), true);
  // 2-2 · 키울 때 제곱근만큼만 커진다
  sc.eq('크기는 √배율만 커진다', SRC.includes('const k=1/Math.sqrt(zm);'), true);
  sc.eq('점·글자·선 모두 되돌려 곱한다',
        /o\.c\.setAttribute\('r',\(n\.r\*k\)/.test(SRC) &&
        /o\.t\.setAttribute\('font-size',\(o\.t\._base\*f\*k\)/.test(SRC) &&
        /el\.setAttribute\('stroke-width',\(el\._w\*k\)/.test(SRC), true);
  sc.eq('키울 때마다 다시 잰다', /zm=n2; applyView\(\); applyScale\(\);/.test(SRC), true);
}

// ═══ 15. v26-0907-6 — 짝 목록 (말씀 · 명제) (HB 3) ═══
console.log('\n시나리오 15 — 짝 목록: 두 목록 · 나가는 여섯 길');
{
  // 말씀 1열은 **성경 약어 + 장절** (HB 지적 — 빠져 있었다)
  sc.eq('약어를 붙인다', _vpShortRef({ref:'로마서 3:23'}), '롬 3:23');
  sc.eq('사무엘상도 약어로', _vpShortRef({ref:'사무엘상 7:12'}), '삼상 7:12');
  sc.eq('장절이 없으면 그대로', _vpShortRef({ref:'로마서'}), '로마서');
  // 명제 1열은 **대표 문구 1** — v.hi 는 '/' 로 여럿이 이어져 있다
  sc.eq('대표 문구는 첫째만', _vpRep({hi:'은혜로 값없이/두 번째/세 번째'}), '은혜로 값없이');
  sc.eq('대표 문구가 없으면 본문으로', _vpRep({hi:'',krText:'본문이다'}), '본문이다');

  // 나가는 길 여섯 — {말씀·명제·함께} × {타일뷰·전체화면}
  sc.eq('갈래가 셋', _VP_TABS.map(x=>x[0]), ['verse','prop','all']);
  sc.eq('갈래 이름', _VP_TABS.map(x=>x[1]), ['말씀','명제','함께']);
  sc.eq('머리의 ⌗ 는 그 갈래만 타일뷰로', SRC.includes('onclick="vpTile(\'${tab}\')"'), true);
  sc.eq('하단은 합본 타일뷰와 전체화면 둘', 
        SRC.includes('onclick="vpTile(\'all\')"') && SRC.includes('onclick="vpFull(\'all\')"'), true);
  sc.eq('줄을 누르면 그 말씀 전체화면', SRC.includes('onclick="vpOpenVerse('), true);
  // 타일뷰의 갈래는 이미 있던 탭을 그대로 쓴다 (새로 만들지 않는다)
  sc.eq('타일뷰는 있던 탭을 쓴다', /function vpTile\(tab\)\{[\s\S]{0,400}?vgSetTab\(tab\);/.test(SRC), true);
  // ⚠️ openVerseFull 이 앞머리에서 _vfClearNav() 를 부른다 — 갈래는 연 뒤에 심어야 한다
  sc.eq('갈래는 전체화면을 연 뒤에 심는다',
        /openVerseFull\(true\);\s*\n\s*_vfSetTabPool\(_vpList\('all'\),tab\);/.test(SRC), true);
  sc.eq('나갈 때 갈래 기억도 지운다',
        /function _vfClearNav\(\)\{[^\n]*_vpFullTab=null;/.test(SRC), true);
  // ⚠️ 그 함수는 한 줄이어야 한다 — test_keep_fullscreen.js 가 한 줄로 잘라 쓴다
  sc.eq('_vfClearNav 는 한 줄이다',
        /function _vfClearNav\(\)\{[^\n]*_vfSyncTopBar\(\);\}/.test(SRC), true);
  // v26-0907-9, HB 91-3-3-1 — 제목을 누르면 이제 그 필터가 걸린 타일뷰로 간다.
  // 갈래를 도는 일은 제목 아래 칩(#vfModeChip)이 맡는다.
  // v26-0908-2, HB 2-2-4 — 헤더에 무엇이 떠 있든 그 목록의 타일뷰로 가는 문이다.
  sc.eq('제목이 가리키는 타일뷰를 한 곳에서 정한다',
    SRC.includes('const tileFn=_vfTitleTileFn(on,vpOn);') &&
    SRC.includes('lb.onclick=tileFn;'), true);
  sc.eq('칩이 제목 아래에서 돈다(세 갈래)', SRC.includes("if(vpOn)mc.innerHTML=_vpModeChipHTML(_vpFullTab,'vpCycleFullTab()');"), true);
  // v26-0908-1, HB 91-3-2 — 한 라운드 앞서 이걸 '함께 ⟷ 한 갈래' 이진 토글로
  // 잘못 만들었다. HB 가 말한 것은 **세 모드**(말씀만 / 명제만 / 둘 다)를 돌면서
  // 글자는 그대로 두고 **낱말 색**으로 켜짐을 보이는 것이었다.
  sc.eq('세 갈래를 돈다', SRC.includes('const next=_vpNextTab(_vpFullTab);'), true);
  sc.eq('도는 차례는 말씀 → 명제 → 함께',
    SRC.includes("const _VP_CYCLE=['verse','prop','all'];"), true);
  sc.eq('이진 토글 흔적은 안 남아 있다', SRC.includes('_vpLastSingleTab'), false);
  // 본문은 한 줄뿐
  sc.eq('본문은 한 줄로 자른다', /\.vp-c2\{[^}]*white-space:nowrap;overflow:hidden;text-overflow:ellipsis;/.test(SRC), true);
  // 좁으면 위아래, 넓으면 좌우
  sc.eq('좁으면 위아래', /\.vp-wrap\{display:flex;flex-direction:column;/.test(SRC), true);
  sc.eq('넓으면 좌우', /@media \(min-width:640px\)\{\s*\n?\s*\.vp-wrap\{flex-direction:row;/.test(SRC.replace(/\n\s*/g,'\n')), true);
  sc.eq('ESC 로도 닫힌다', SRC.includes("['vpModal',         ()=>closeVPair()],"), true);
  // ⚠️ 안 멈추면 뒤에서 영원히 돈다 — 두 자리에서 반드시 멈춘다
  sc.eq('화면을 옮길 때 멈춘다',
        SRC.includes("if(view!=='link'&&typeof _vgStop==='function')_vgStop();"), true);
  sc.eq('대시보드를 닫을 때도 멈춘다',
        /function closeVerseDashboard\(\)\{[\s\S]{0,260}?_vgStop\(\);/.test(SRC), true);
  sc.eq('다시 그릴 때도 먼저 멈춘다',
        /function renderVDashLink\(\)\{[\s\S]{0,160}?_vgStop\(\);/.test(SRC), true);
  sc.eq('멈추면 프레임 요청을 취소한다',
        SRC.includes('if(_vgSim&&_vgSim.raf)cancelAnimationFrame(_vgSim.raf);'), true);
  // 폰에서 점을 끄는 대신 화면이 스크롤되면 안 된다
  sc.eq('그래프 판은 손가락을 가로챈다', /\.vg-svg\{[^}]*touch-action:none;/.test(SRC), true);
  sc.eq('옛 두 줄 그림은 사라졌다', SRC.includes('class="vlink-wrap"'), false);
  sc.eq('요일 수가 같으면 최다·최소를 말하지 않는다', SRC.includes('요일마다 고르게 보고 있어요'), true);
  // 세 화면은 흐름과 같은 범위·갈래를 쓴다
  const scp=_vDashScope();
  sc.eq('기본 범위는 말씀 모음', [scp.kind,scp.tab], ['home','all']);
  sc.eq('지도류의 기본 기간은 전체', scp.all, true);
}

// ═══ 13. v26-0907-3 — 리듬을 요일 × 한 시간으로 다시 짰다 (HB 5) ═══
console.log('\n시나리오 13 — 리듬: 가로 요일 · 세로 두 겹(시간대 / 한 시간)');
{
  // 범위에서 '말씀 모음'은 빠진다 — 모음의 날짜 열에는 시각이 없다
  sc.eq('범위는 반응 넷 + 저장 다섯', _VRHY_KINDS, ['like','mem','deeper','even','keep']);
  sc.eq('말씀 모음은 빠져 있다', _VRHY_KINDS.indexOf('home'), -1);
  sc.eq('말씀 모음을 고르고 있으면 좋아요로 본다', _vRhyKind('home'), 'like');
  sc.eq('엉뚱한 값도 좋아요로', _vRhyKind('zzz'), 'like');
  sc.eq('저장은 그대로 쓴다', _vRhyKind('keep'), 'keep');

  // 세로 1겹 — 앱이 쓰는 시간대를 그대로 (기본 여섯: 새벽·오전·점심·오후·저녁·밤)
  const bands = _vRhyBands();
  sc.eq('시간대가 여섯 묶음', bands.length, 6);
  sc.eq('첫 묶음은 새벽', bands[0].name, '새벽');
  sc.eq('표는 첫 시간대가 시작하는 3시부터', bands[0].hs[0], 3);
  sc.eq('스물넉 시간을 다 덮는다', bands.reduce((a,b)=>a+b.n,0), 24);
  sc.eq('시각이 겹치지 않는다', new Set(bands.flatMap(b=>b.hs)).size, 24);
  // 자정을 넘는 '밤'(20:00~03:00)이 한 묶음으로 이어진다 — 표가 두 동강 나지 않는다
  const night = bands[bands.length-1];
  sc.eq('마지막 묶음이 밤', night.name, '밤');
  sc.eq('밤은 20시부터 2시까지 일곱 시간', [night.hs[0], night.hs[night.hs.length-1], night.n], [20, 2, 7]);

  // 가로 요일 글자는 설정(요일 표기)을 따른다
  sc.eq('요일 글자는 설정을 따른다', SRC.includes("const dow=(typeof getDOW==='function')?getDOW()"), true);
  // 칸 자리를 하나하나 적는다 (자동 배치는 걸친 칸 때문에 어긋난다)
  sc.eq('칸마다 자리를 적어 넣는다', /grid-column:\$\{3\+i\};grid-row:\$\{row\};/.test(SRC), true);
  sc.eq('시간대 칸이 여러 줄을 걸친다', /grid-row:\$\{2\+r\}\/span \$\{b\.n\}/.test(SRC), true);
  // 시각 없는 기록은 세지 않고, 몇 건인지 알려 준다
  sc.eq('시각 없는 기록은 뺀다', SRC.includes("if(!m){noTime++;return;}"), true);
  sc.eq('뺀 건수를 알려 준다', SRC.includes('시각이 없는 기록'), true);
  // 옛 잔디는 사라졌다
  sc.eq('옛 잔디(요일 × 주)는 없앴다', SRC.includes('vrhy-dot'), false);
}

console.log('\n시나리오 12-3 — 화면 다섯과 설정 칩');
{
  sc.eq('화면이 다섯',
    SRC.includes("const _VDASH_VIEWS=[['trend','흐름'],['pie','분포'],['map','지도'],['link','연결'],['rhythm','리듬']];"), true);
  ['map','link','rhythm'].forEach(v=>{
    // v26-0907-3 — 화면마다 return 으로 빠져나가지 않는다. 다섯 화면이 다
    // 슬라이더를 갖게 되어, 그린 **뒤에** 레일에 손가락을 붙여야 하기 때문이다.
    sc.eq(`${v} 를 그리는 곳이 있다`, new RegExp(`view==='${v}'\\)renderVDash`).test(SRC), true);
  });
  // ⚠️ 칩·슬라이더가 늘 흐름을 그리면 지도에서 칩을 눌렀을 때 화면이 튄다
  sc.eq('다 그린 뒤 슬라이더에 손가락을 붙인다',
    /else renderVDashPie\(\);\s*\n\s*_vTrBindRails\(\);/.test(SRC), true);
  sc.eq('설정 칩은 지금 화면을 다시 그린다',
    /function vTrSet\(key,val\)\{[\s\S]{0,400}renderVerseDashboard\(\);/.test(SRC), true);
  sc.eq('흐름만 그리던 옛 호출은 한 곳(분기)뿐',
    (SRC.match(/renderVDashTrend\(\);/g)||[]).length, 1);
}

console.log('\n시나리오 13 — 성경→장 그래프 버튼은 채운 산 모양 (v26-0907-2, HB)');
{
  // 예전엔 선(outline)만 그려서 산 그래프(비중)를 닮지 않았다는 지적 — 채운
  // 다각형으로 바꿨다. fill 이 currentColor 이고 stroke 가 없어야 '채운' 것이다.
  const seg=SRC.slice(SRC.indexOf('class="vtr-go"'), SRC.indexOf('class="vtr-go"')+260);
  sc.eq('fill 로 채운다', seg.includes('fill="currentColor"'), true);
  sc.eq('테두리선만 그리지 않는다(stroke=none)', seg.includes('stroke="none"'), true);
  sc.eq('닫힌 다각형이다(바닥까지 내려와 닫힌다)', seg.includes('16 11 1 11Z'), true);
}

// ═══ v26-0907-8 (HB) — 연결 그래프 버그 넷 + 대시보드 버튼 + 버전 배지 ═══
console.log('\n시나리오 14 — 1-2 드래그 시 보이지 않는 사각형에 걸리던 것');
{
  // 손가락으로 끄는 동안에는 화면 좌표를 그대로 쓴다 — 가두지 않는다.
  // (줌아웃하면 화면엔 보이는데 원래 크기 상자 경계에서 멈추는 게 버그였다)
  sc.eq('pointermove 에서 안 가둔다',
        !/n\.x=g\.x; n\.y=g\.y; n\.vx=0; n\.vy=0;\s*\n\s*_vgClamp\(n,W,H\);/.test(SRC), true);
  sc.eq('tick() 의 드래그 중 분기에서도 안 가둔다',
        SRC.includes('if(p.fix){p.vx=0;p.vy=0;return;}  // 끌고 있는 점은 손가락이 자리를 정한다 (안 가둔다)'),
        true);
  // 저절로 움직이는(끌지 않는) 점은 여전히 가둔다 — 흩어진 덩어리가 날아가는
  // 것을 막는 원래 목적은 그대로 살아 있어야 한다.
  sc.eq('자유 낙하하는 점은 그대로 가둔다', SRC.includes('_vgClamp(p,W,H);\n      const m=Math.abs(ddx)'), true);
}

console.log('\n시나리오 15 — 4 짝 목록에서 나간 타일뷰·전체화면을 닫으면 그 목록으로');
{
  sc.eq('나갈 때 짝 목록이 떠 있었는지도 적는다',
        /vp:\(shown\('vpModal'\)&&typeof _vpCtx!=='undefined'&&_vpCtx\)\?\{\.\.\._vpCtx\}:null/.test(SRC), true);
  sc.eq('돌아올 때 짝 목록을 최우선으로 되살린다',
        /if\(r\.vp&&typeof openVPair==='function'\)\{/.test(SRC), true);
  // v26-0907-9, HB 91-4 — vpTile/vpFull 이 대시보드를 실제로 닫아 버려서
  // (closeVerseDashboard, 그래프 시뮬도 멈춘다) 짝 목록만 되살리면 그 뒤가
  // 빈 화면이었다. 대시보드부터 다시 연다.
  sc.eq('짝 목록보다 먼저 대시보드부터 되살린다',
        /if\(r\.vp&&typeof openVPair==='function'\)\{\s*\n\s*if\(r\.dash&&typeof openVerseDashboard==='function'\)openVerseDashboard\(\);/.test(SRC),
        true);
  sc.eq('필터도 그대로 들고 돌아온다(keepFilt)',
        SRC.includes('openVPair(r.vp.axis,r.vp.val,true);'), true);
}

console.log('\n시나리오 16 — 5 짝 목록 좌우 배치일 때 오른쪽 판이 넘치던 것');
{
  // flex 항목은 min-width:auto 가 기본이라 내용(긴 본문 한 줄)보다 안 줄어든다.
  // 조상 사슬에 min-width:0 을 끝까지 걸어야 진짜로 줄어든다.
  sc.eq('.vp-pane 에 min-width:0',
        /\.vp-pane\{display:flex;flex-direction:column;flex:1 1 0;min-height:0;min-width:0;\}/.test(SRC), true);
  sc.eq('.vp-list 에도 min-width:0',
        /\.vp-list\{overflow:auto;flex:1;min-height:0;min-width:0;/.test(SRC), true);
}

console.log('\n시나리오 17 — 8-1 "이름으로 찾기" 안내 글자를 없앴다');
{
  sc.eq('placeholder 를 비웠다', SRC.includes('placeholder="" autocomplete="off"'), true);
  sc.eq('안내 글자 문구는 소스에 없다', SRC.includes('placeholder="이름으로 찾기"'), false);
}

console.log('\n시나리오 18 — 0 설정창 우하단 버전 배지 (개발자 계정 전용)');
{
  sc.eq('일반설정에 배지 자리', SRC.includes('<div class="settings-verbadge" id="settingsVerBadge" style="display:none;"></div>'), true);
  sc.eq('말씀설정에도 배지 자리', SRC.includes('<div class="settings-verbadge" id="verseSettingsVerBadge" style="display:none;"></div>'), true);
  sc.eq('배지를 채우는 함수가 있다', SRC.includes('function _syncDevVerBadge(){'), true);
  sc.eq('개발자 계정 판정을 그대로 쓴다', /function _syncDevVerBadge\(\)\{\s*\n\s*const dev=_isDevAccount\(\);/.test(SRC), true);
  sc.eq('일반설정을 열 때 부른다', /function openSettings\(tabId\)\{\s*\n\s*renderSettingsPanel\(\);\s*\n\s*_syncDevVerBadge\(\);/.test(SRC), true);
  sc.eq('말씀설정을 열 때도 부른다', /function openVerseSettingsModal\(\)\{\s*\n\s*renderVerseSettingsModal\(\);\s*\n\s*applyVerseUiLevel\(\);\s*\n\s*_syncDevVerBadge\(\);/.test(SRC), true);
}

console.log('\n시나리오 19 — 9 전체화면 좌상단 대시보드 버튼');
{
  sc.eq('버튼이 있다', SRC.includes('<button class="vf-dashbtn" id="vfDashBtn" onclick="event.stopPropagation();vfOpenDashboard()" aria-label="대시보드">'), true);
  sc.eq('여는 함수가 있다', SRC.includes('function vfOpenDashboard(){\n  openVerseDashboard();\n}'), true);
  // 차례: 홈(12) · 말씀 모음 설정(50) · 대시보드(88, 새로 낀 자리) · 저장(126, 밀려남)
  sc.eq('대시보드가 50과 88 사이 그 자리', /\.vf-dashbtn\{position:absolute;top:calc\(env\(safe-area-inset-top,0px\) \+ 88px\)/.test(SRC), true);
  sc.eq('저장 책갈피가 126 으로 밀렸다', /\.vf-keepmenu\{position:absolute;top:calc\(env\(safe-area-inset-top,0px\) \+ 126px\)/.test(SRC), true);
  sc.eq('그 아래 드롭다운도 160 으로 함께 밀렸다', /\.vf-keep-switch\{position:absolute;z-index:13;top:calc\(env\(safe-area-inset-top,0px\) \+ 160px\)/.test(SRC), true);
}

console.log('\n시나리오 20 — 1-1 대시보드 모달을 키웠다');
{
  sc.eq('모달 폭을 880→1200 로', SRC.includes('width:min(97vw,1200px);max-height:92vh;'), true);
  sc.eq('그래프 세로 한도도 520→760 으로',
        SRC.includes('const H=Math.max(300,Math.min(760,Math.round(W*0.9)));'), true);
}

console.log('\n시나리오 21 — 2-1·2-2 골라보기 순위 듀얼 슬라이더');
{
  sc.eq('절대 상한 상수', SRC.includes('const _VG_RANK_MAX=60;'), true);
  sc.eq('예전 고정 상한(14/22)은 없앴다', SRC.includes('const _VG_MAXL=14, _VG_MAXR=22;'), false);
  sc.eq('rk 계산 헬퍼', /function _vgRankOf\(side,total\)\{/.test(SRC), true);
  sc.eq('lo 는 1 미만으로 안 내려간다', SRC.includes("const lo=Math.max(1,Math.min(max,parseInt(r.lo,10)||1));"), true);
  sc.eq('hi 는 lo 보다 작아지지 않는다', SRC.includes("const hi=Math.max(lo,Math.min(max,parseInt(r.hi,10)||max));"), true);
  sc.eq('세팅 함수는 그래프를 통째로 다시 만든다',
        /function vgRankSet\(side,lo,hi\)\{[\s\S]{0,220}renderVDashLink\(\);/.test(SRC), true);
  sc.eq('세로 손잡이 바인더', SRC.includes('function _vgRankRailBind(el){'), true);
  sc.eq('clientY 로 계산한다(세로축)', /_vgRankRailBind[\s\S]{0,700}e\.clientY-r\.top/.test(SRC), true);
  sc.eq('CSS 트랙 클래스', SRC.includes('.vgp-rank{position:relative;flex:0 0 22px;width:22px;'), true);
  sc.eq('L 판은 목록 앞(바깥쪽)에, R 판은 목록 뒤(바깥쪽)에 세운다',
        SRC.includes("L.innerHTML=paneHTML('topic','L',axisName,la,Lfull||[],_vgRankOf('L',(Lfull||[]).length),true);") &&
        SRC.includes("R.innerHTML=paneHTML('book','R','성경','book',Rfull||[],_vgRankOf('R',(Rfull||[]).length),false);"),
        true);
  sc.eq('순위창 밖 줄은 클릭이 안 걸린다(그래프에 없는 것)',
        SRC.includes('`<div class="vgp-row${on?\' on\':\'\'}${active?\'\':\' rankoff\'}"`+\n        (active?` onclick="vgToggleSel'),
        true);
}

console.log('\n시나리오 22 — 3-1..3-5 축 아이콘 · 통합 모드칩 · 새 격자 아이콘');
{
  sc.eq('예전 ⌗ 상수는 없앴다', SRC.includes("const _VP_HASH_SVG="), false);
  sc.eq('테두리 있는 3×3 격자로 교체', SRC.includes('const _VP_GRID_SVG='), true);
  sc.eq('# 태그 축 아이콘', SRC.includes('const _VG_TAG_ICON_SVG='), true);
  sc.eq('축 아이콘 헬퍼 — 태그·성경만', /function _vAxisIconHTML\(axis\)\{\s*\n\s*if\(axis==='tag'\)/.test(SRC), true);
  sc.eq('성경 축은 Deeper 아이콘을 그대로 쓴다(새로 안 만든다)',
        SRC.includes('return `<span class="vp-axisic">${_VLIST_KIND_TITLE.deeper}</span>`;'), true);
  // v26-0907-9, HB 91-2·91-3-2 — 글자가 말씀/명제/함께로 도는 대신 늘
  // '말씀 + 명제' 로 고정, active(불리언)로만 색을 가른다. plain 이면 짝
  // 목록 하단처럼 클릭도 색도 없는 민무늬.
  sc.eq('모드칩 헬퍼 — 갈래를 그대로 받는다', /function _vpModeChipHTML\(tab,onclickExpr,plain\)\{/.test(SRC), true);
  sc.eq("글자는 늘 '말씀 + 명제'",
    SRC.includes("w('verse','말씀')+`<span class=\"vpm-plus\">+</span>`+w('prop','명제')"), true);
  sc.eq('켜진 낱말만 색을 갖는다',
    SRC.includes("const w=(k,tx)=>`<span class=\"vpm-w${(t==='all'||t===k)?' on':''}\">${tx}</span>`;"), true);
  sc.eq('꺼진 낱말은 옅게, 켜진 낱말만 강조색',
    /\.vp-modechip \.vpm-w\{color:var\(--tx3\);opacity:\.5;\}/.test(SRC) &&
    /\.vp-modechip \.vpm-w\.on\{color:var\(--vf-ac,var\(--ac-tx\)\);opacity:1;\}/.test(SRC), true);
  sc.eq('짝 목록 제목이 축 아이콘을 단다(innerHTML 로)',
        SRC.includes("if(ttl)ttl.innerHTML=_vAxisIconHTML(_vpCtx.axis)+esc(_vpCtx.val);"), true);
  sc.eq('짝 목록 하단은 민무늬 고정 칩(91-2)', SRC.includes("`<div class=\"vp-foot\">${_vpModeChipHTML('all',null,true)}`+"), true);
  sc.eq('민무늬는 강조색도 테두리도 없다',
    /\.vp-modechip\.plain \.vpm-w,\.vp-modechip\.plain \.vpm-w\.on/.test(SRC), true);
  sc.eq('타일뷰 갈래 탭도 같은 칩', SRC.includes('row.innerHTML=_vpModeChipHTML(_vgTab(),'), true);
  sc.eq('타일뷰 칩도 세 갈래', SRC.includes('function vgCycleTab(){ vgSetTab(_vpNextTab(_vgTab())); }'), true);
  // ⚠️ v26-0908-3 — 차례가 중요하다. 갈래 칩이 서는 조건이 넓어지면서
  //    타일뷰에서 연 전체화면도 vpOn 이 참이 됐다. 따로 일러 준 타일뷰
  //    (_vfNavTile)가 언제나 먼저다 — 안 그러면 예전에 열었던 짝 목록으로 간다.
  sc.eq('전체화면 제목을 누르면 필터 걸린 타일뷰로(91-3-3-1)',
        SRC.includes('if(vpOn&&_vpCtx)return vpGoToFilteredTile;'), true);
  sc.eq('따로 일러 준 타일뷰가 언제나 먼저',
        /if\(_vfNavTile&&_vfNavTile\.kind&&_vfNavTile\.val\)return vfOpenNavTile;\s*\n\s*if\(vpOn&&_vpCtx\)/.test(SRC), true);
  sc.eq('전체화면 칩 자리(#vfModeChip)가 있다',
        SRC.includes('<div class="vf-modechiprow" id="vfModeChip" style="display:none;"></div>'), true);
  // v26-0907-9, HB 91-3-2 — HB 가 이 칩만은 얇은 테두리 알약으로 달라고 직접
  // 요청했다(집 규칙 '테두리 금지'의 의도된 예외 — 여러 상태를 색만으로
  // 가르기 어려워서다). 그래서 여기선 테두리가 **있는지**를 확인한다.
  sc.eq('91-3-2 요청대로 테두리 있는 알약(의도된 예외)',
        /\.vp-modechip\{[^}]*border:1px solid/.test(SRC), true);
}

console.log('\n시나리오 23 — 6 인사이트 블럭 위치 · 캡션 우상단');
{
  const iAxis=SRC.indexOf("_vTrChipsHTML('왼쪽','linkAxis',_VLINK_LEFTS,la)");
  const iSkew=SRC.indexOf('skew.slice(0,3).map(s2=>');
  const iHelp=SRC.indexOf('class="vlink-help"');
  const iBar=SRC.indexOf('html+=`<div class="vg-bar">`+');
  sc.eq('넷 다 찾았다', iAxis>=0&&iSkew>=0&&iHelp>=0&&iBar>=0, true);
  sc.eq('순서: 왼쪽(축) → 인사이트 → 캡션 → 검색줄', iAxis<iSkew&&iSkew<iHelp&&iHelp<iBar, true);
  sc.eq('도움말은 토스트를 재사용한다(새 팝업 안 만든다)',
        SRC.includes('function vgShowHelp(){ showToast(_VG_HELP_TX); }'), true);
  sc.eq('넓으면 글자, 좁으면 버튼(900px 갈림)',
        /@media \(min-width:900px\)\{\s*\n\s*\.vlink-note-full\{display:inline;\}\s*\n\s*\.vlink-note-ibtn\{display:none;\}/.test(SRC),
        true);
}

console.log('\n시나리오 24 — 7 대시보드 5개 탭 아이콘');
{
  sc.eq('탭 아이콘 표가 있다', SRC.includes('const _VDASH_TAB_ICON={'), true);
  ['trend','pie','map','link','rhythm'].forEach(k=>{
    sc.eq(`${k} 아이콘 항목이 있다`, new RegExp(`\\b${k}:'<svg`).test(SRC), true);
  });
  sc.eq('분포는 로고 메뉴의 대시보드 아이콘과 같은 것(원+반지름선)',
        SRC.includes('<circle cx="10" cy="10" r="7.5"/><path d="M10 2.5 V10 L16.3 13.7" fill="none"/></svg>'), true);
  sc.eq('탭 렌더에서 라벨 앞에 아이콘을 붙인다',
        SRC.includes('`${_VDASH_TAB_ICON[v]||\'\'}${l}</span>`).join(\'\');'), true);
  sc.eq('탭을 세로로 쌓는 CSS(아이콘 위·글자 아래)',
        SRC.includes('.vdash-vtab{display:flex;flex-direction:column;align-items:center;gap:2px;'), true);
}

console.log('\n시나리오 25 — 8-2 검색 결과 없음');
{
  sc.eq('검색어는 있는데 하나도 안 걸린 경우를 따로 가른다',
        SRC.includes('const searchEmpty=!!(_vgQuery&&!seeds.size);'), true);
  sc.eq('그 경우엔 빈 Set 을 준다(전부 안 보임)',
        SRC.includes('const reach=searchEmpty?new Set():_vgReach(N,E,seeds,_vgDepth());'), true);
  sc.eq('빈 상태 칸이 있다(그래프 판 안, svg 옆)',
        SRC.includes('<div class="vg-search-empty" id="vgEmptyState" style="display:none;">'), true);
  sc.eq('7-4(연결) 아이콘을 그대로 쓴다', SRC.includes('${_VDASH_TAB_ICON.link}<span>검색결과가 없어요</span></div>'), true);
  sc.eq('필터를 다시 매길 때마다 이 칸도 함께 켜고 끈다',
        /const eb=document\.getElementById\('vgEmptyState'\);\s*\n\s*if\(eb\)eb\.style\.display=searchEmpty\?'flex':'none';/.test(SRC),
        true);
}

console.log('\n시나리오 26 — 91-1·91-3 짝 목록 정렬 고정 · 다중 필터');
{
  sc.eq('말씀은 성경순으로 고정 정렬',
        SRC.includes('const verses=all.filter(v=>!_vfIsProp(v)).sort((a,b)=>_bibleRankOfRef(a.ref)-_bibleRankOfRef(b.ref));'),
        true);
  sc.eq('명제는 대표 문구 ㄱㄴㄷ순으로 고정 정렬',
        SRC.includes('const props=all.filter(v=>_vfIsProp(v)).sort((a,b)=>_vDashKeyCmp(_vpRep(a),_vpRep(b)));'),
        true);
  sc.eq('반대 축 헬퍼 — 성경을 눌렀으면 지금 왼쪽 축, 아니면 성경',
        /function _vpOtherAxis\(\)\{[\s\S]{0,120}_vpCtx\.axis==='book'\?_vLinkAxis\(\):'book';/.test(SRC), true);
  sc.eq('1뎁스 후보는 필터 걸기 전 전체를 본다(안 사라진다)',
        SRC.includes('function _vpFacetCandidates(){'), true);
  sc.eq('토글은 다중으로 교집합(모두 만족해야 한다)',
        SRC.includes('if(!_vpFilt.every(f=>oks.indexOf(f)>=0))return;'), true);
  sc.eq('새 점을 누르면 필터를 지운다(keepFilt 없으면)',
        SRC.includes('if(!keepFilt)_vpFilt=[];'), true);
  sc.eq('타일뷰로 넘길 때 교집합 refs 를 함께 준다',
        SRC.includes('openVerseGrid(ax,val,null,_vpFiltRefSet());'), true);
  sc.eq('openVerseGrid 가 그 refs 를 받아 저장한다',
        /function openVerseGrid\(kind,val,cardId,limitRefs\)\{[\s\S]{0,500}_vgState\.limitRefs=limitRefs\|\|null;/.test(SRC),
        true);
  sc.eq('_vgFilteredPool 이 그 refs 로 거른다',
        SRC.includes('if(_vgState.limitRefs)pool=pool.filter(v=>_vgState.limitRefs.has(v.ref));'), true);
  sc.eq('전체화면 제목 아래 2뎁스 표시 자리(#vfFacetRow)',
        SRC.includes('<div class="vf-facetrow" id="vfFacetRow" style="display:none;"></div>'), true);
  sc.eq('타일뷰 제외 스테퍼 오른쪽 2뎁스 표시 자리(#vgFacetBox)',
        SRC.includes('<div class="vg-facet" id="vgFacetBox" style="display:none;"></div>'), true);
  sc.eq('타일뷰 쪽도 + 로 시작해 항목을 나열한다',
        SRC.includes("fb.innerHTML='<span class=\"vg-facet-plus\">+</span>'+"), true);
  sc.eq('제목을 누르면 그 필터 그대로 타일뷰로 (91-3-3-1)',
        /function vpGoToFilteredTile\(\)\{[\s\S]{0,120}closeVerseFull\(\);\s*\n\s*vpTile\(tab\);/.test(SRC), true);
}

console.log('\n시나리오 27 — 92 연결탭 뎁스 알약칩');
{
  sc.eq('1·2·3·전체 알약칩', SRC.includes("`<span class=\"vtr-ctl-lb\">뎁스</span>`+"), true);
  sc.eq('슬라이더 바인딩은 더 없다(칩뿐)', SRC.includes('_vTrBindRails(D);'), false);
}

console.log('\n시나리오 28 — 93-1 지도 구약/신약 접기 · 순위창 다듬기');
{
  sc.eq('접기 토글 함수', SRC.includes('function vMapToggleFold(id){'), true);
  // v26-0908-1, HB 11-1 — 구약을 접으면 **하나**가 아니라 갈래마다(율법서·
  // 역사서·시가서·대선지서·소선지서) 칩 하나씩 나온다.
  sc.eq('접힌 갈래는 갈래마다 칩 하나', SRC.includes('return head+`<div class="vmap-folds">`+_vMapGroups(order,defs).map(gp=>{'), true);
  sc.eq('칩에 카운트·색이 연동된다', SRC.includes('const sty=cnt?`background:${_vMapShade(f,mode===\'aged\')};color:${_vMapInk(f)};`:\'\';'), true);
  // HB — 카운트는 전체가 아니라 지금 걸린 구간 필터를 먹인 값이어야 한다
  sc.eq('카운트는 구간 필터를 먹인 값만', SRC.includes('books.forEach(b=>{ if(!inRg(b))return;'), true);
  sc.eq('칩 색은 칩끼리 견준다(foldMax)', SRC.includes('const f=cnt?(mode===\'aged\'?Math.min(1,((isFinite(minW)?minW:0)+1)/26):(sum/foldMax)):0;'), true);
  sc.eq('접었다 펼쳤다는 화면마다 기억한다(p.mapFold)', SRC.includes("if(!p.mapFold||typeof p.mapFold!=='object')p.mapFold={};"), true);
  // 93-1-2-1 — 슬라이더 비활성 트랙이 --bd2(진함) 대신 --bd(연함)
  sc.eq('가로 슬라이더 트랙이 옅어졌다', SRC.includes('.vtr-rail::before{content:"";position:absolute;left:0;right:0;top:9.5px;height:3px;\n  border-radius:2px;background:var(--bd);}'), true);
  sc.eq('세로 순위창 트랙도 옅어졌다', SRC.includes('.vgp-rank::before{content:"";position:absolute;top:0;bottom:0;left:10.5px;width:3px;\n  border-radius:2px;background:var(--bd);}'), true);
  // v26-0908-1, HB 11-2 — ▲▼ 세모는 뜻을 알 수 없었다. 말로 적는다.
  // v26-0908-2, HB 2-1-2 — 값이 순위면 1등이 '위' 라 상/하가 뒤바뀐다.
  sc.eq('라벨은 말로 적는다',
    SRC.includes('lb.textContent=rankMode?_vTrExclLabel(lower,upper):_vTrExclLabel(upper,lower);'), true);
  sc.eq("'상위 N개, 하위 O개 제외' 로 만든다",
    SRC.includes('if(above)t.push(`상위 ${above}개`);') &&
    SRC.includes('if(below)t.push(`하위 ${below}개`);') &&
    SRC.includes("return t.length?t.join(', ')+' 제외':'전체';"), true);
  sc.eq('세모 화살표는 안 남아 있다', SRC.includes('▲${'), false);
  sc.eq('그린 자리와 미는 자리가 같은 글을 쓴다',
    SRC.includes('const rgLbTx=_vTrExclLabel(rg.lo-1, rk.total-rg.hi);'), true);
  sc.eq('지도 쪽에서 그 값들을 넘긴다(data-vals)', SRC.includes('vals:rgVals,rank:true,midN:true,'), true);
}

console.log('\n시나리오 29 — 93-2 리듬 시간개념없음 버그 · 구간 시각화');
{
  sc.eq("'시간 개념 없음' 구간은 시간 칸을 안 차지한다",
        /secs\.forEach\(\(sec,i\)=>\{[\s\S]{0,220}if\(_secNoTime\(sec\)\)return;/.test(SRC), true);
  sc.eq('첫 시간대 계산도 실제 시간 구간만 본다', SRC.includes('const realSecs=secs.filter(sec=>!_secNoTime(sec));'), true);
  // v26-0908-1, HB 93-2-2 — 빈 칸만 물들이면 기록이 있는 칸에서 띠가 끊겨
  // 오른쪽만 보면서 시간대를 짚을 수가 없었다. 칸들 **뒤에** 깔리는 띠 하나로.
  sc.eq('시간대마다 띠 하나가 칸들 뒤에 깔린다',
    SRC.includes('g+=`<div class="vrhy2-zone" style="grid-column:2/-1;grid-row:${2+r}/span ${b.n};${zoneSty}" `+'), true);
  sc.eq('시각 열부터 오른쪽 끝열까지 이어진다', SRC.includes('grid-column:2/-1;grid-row:'), true);
  sc.eq('칸이 띠보다 위에 온다', /\.vrhy2-hr,\.vrhy2-cell\{position:relative;z-index:1;\}/.test(SRC), true);
  sc.eq('띠는 z-index 0', /\.vrhy2-zone\{[\s\S]{0,120}z-index:0;/.test(SRC), true);
  sc.eq('빈 칸만 물들이던 옛 방식은 없앴다', SRC.includes('const bandTint='), false);
}

console.log('\n시나리오 30 — 93-3 대시보드 모바일 우측 잘림');
{
  sc.eq('#vDashBody 좌우 여백 — 손잡이 반지름만큼(8px)',
        SRC.includes('<div id="vDashBody" style="overflow:auto;flex:1;min-height:0;border-top:1px solid var(--bd2);padding:10px 8px 0;">'),
        true);
}

console.log('\n시나리오 31 — 94 세팅① 누락 6항목');
{
  // 0-1 그래프 버튼 색 약하게
  sc.eq('그래프 버튼(.vtr-go) 옅게', /\.vtr-go\{[^}]*opacity:\.55;/.test(SRC), true);
  // 0-2 꺾쇠·이름·버튼 세로 중앙
  // v26-0908-1, HB 0-2 — vertical-align 으로는 안 맞았다(글자는 baseline,
  // 아이콘은 middle). 셋을 한 줄 flex 로 묶는다.
  sc.eq('꺾쇠·이름·버튼을 한 줄 flex 로 묶는다',
    /\.vtr-nmrow\{display:flex;align-items:center;/.test(SRC), true);
  sc.eq('그 줄로 감싸서 그린다', SRC.includes('name=`<span class="vtr-nmrow">`+'), true);
  // 2-1 최근/이전 표기 통일 — 표 머리에도 알약
  // v26-0908-1, HB 2-1 — 표 머리 알약에도 id 를 준다(끄는 동안 N 이 바뀐다)
  sc.eq('표 머리 최근/이전도 알약(.vtr-pill)',
    SRC.includes("const lbl=pc?`<span class=\"vtr-pill ${pc}\" id=\"${c===1?'vtrThLbA':'vtrThLbB'}\">${esc(l)}</span>`:esc(l);"), true);
  sc.eq('그래프 안 띠에도 같은 알약 배경',
    SRC.includes("lbA,'var(--vtr-a-bg)'") && SRC.includes("lbB,'var(--vtr-b-bg)'"), true);
  sc.eq("'이전' 띠 면 색은 --tx2", SRC.includes('fill="var(--tx2)" opacity="0.10"'), true);
  sc.eq('예전 0.07 값은 안 남아 있다', SRC.includes('opacity="0.07"'), false);
  // 2-3 ↔ → vs
  sc.eq("화살표(↔) 대신 'vs'", SRC.includes('<span style="opacity:.6;">vs</span>'), true);
  sc.eq('예전 화살표는 이 자리에 없다', SRC.includes('<span style="opacity:.6;">↔</span>'), false);
  // 8 말씀모음탭 우상단 파이 버튼
  sc.eq('말씀 모음 탭에 대시보드 버튼', SRC.includes('class="vset-dashbtn" onclick="vsetGoDashboard()"'), true);
  sc.eq('여는 함수 — 설정 닫고 대시보드 연다',
        /function vsetGoDashboard\(\)\{\s*\n\s*closeVerseSettingsModal\(\);\s*\n\s*openVerseDashboard\(\);\s*\n\}/.test(SRC),
        true);
}

console.log('\n시나리오 32 — 0908-1 되짚기 (앞 라운드에서 잘못했거나 빠뜨린 것들)');
{
  // ── 91-3-1 · 알약칩 후보는 **지금 화면에 보이는** 1뎁스만 ──────────────
  // DB 상 이어져 있다는 것과 지금 그래프에 떠 있다는 것은 다르다. 골라보기
  // 순위·검색·뎁스로 화면에서 빠진 값은 후보에도 없어야 한다.
  sc.eq('그래프의 점·선에서 후보를 뽑는다',
    /function _vpFacetCandidates\(\)\{[\s\S]{0,320}if\(_vgData&&_vgData\.N&&_vgData\.E\)\{/.test(SRC), true);
  sc.eq('클릭한 점을 그래프에서 찾는다',
    SRC.includes("const i=N.findIndex(n=>n.kind===kind&&n.key===_vpCtx.val);"), true);
  sc.eq('선으로 이어진 이웃만 본다(1뎁스)',
    SRC.includes('const j=(e.a===i)?e.b:((e.b===i)?e.a:-1);'), true);
  sc.eq('숨겨진 점은 후보에서 뺀다', SRC.includes('if(!n||n.hide||_vDashIsPlaceholder(n.key))return;'), true);
  sc.eq('그래프가 없는 길로 열렸을 때만 데이터에서 직접 센다',
    SRC.includes('  // 그래프가 없는 길로 열렸을 때만 데이터에서 직접 센다'), true);

  // ── 2-1 · 끄는 동안 알약이 따라오고, 표 머리 N 도 함께 바뀐다 ──────────
  // 예전엔 글자(text)만 옮기고 알약 배경(rect)에는 class 가 없어 제자리에 남았다.
  sc.eq('알약 배경에도 class 를 준다', SRC.includes('<rect class="${cls}p"'), true);
  sc.eq('끌 때 알약 배경도 함께 잡는다',
    SRC.includes("Ap=svg.querySelectorAll('.vtr-mkAlp'),Bp=svg.querySelectorAll('.vtr-mkBlp'),"), true);
  sc.eq('글자 폭을 재서 알약을 맞춘다(SVG 엔 자동 크기가 없다)',
    SRC.includes('try{w=tx.getBBox().width;}catch(_){w=0;}'), true);
  sc.eq('띠가 알약보다 좁으면 둘 다 숨긴다', SRC.includes('const hide=(bandW<pw+6);'), true);
  sc.eq('끄는 동안 띠 글자도 갈아 끼운다',
    SRC.includes('if(Al)Al.textContent=txA;') && SRC.includes('if(Bl)Bl.textContent=txB;'), true);
  sc.eq('하단 표 머리의 N 도 실시간으로',
    SRC.includes("const ta=document.getElementById('vtrThLbA'),tb=document.getElementById('vtrThLbB');"), true);
  sc.eq('붙자마자 한 번 그려 알약 폭을 맞춘다',
    SRC.includes('  paint(g.edge(Math.max(0,Math.min(n-1,n-cur))),cur);\n  svg.addEventListener'), true);
  // 알약 배경은 불투명해야 한다 — 반투명이면 알록달록한 영역 그래프가 비쳐
  // 어두운 테마에서 글자가 사라졌다.
  sc.eq('알약은 판 색을 먼저 깔아 불투명하게', SRC.includes('rx="6.5" fill="var(--s1)"/>'), true);
}

console.log('\n시나리오 33 — 0908-2 (연결 다듬기 · 지도 순위 · 빼기 · 인사이트)');
{
  // ── 1-1-1 · 알약칩 안에 개수 ─────────────────────────────────────
  sc.eq('필터칩에 개수를 적는다', SRC.includes('<span class="vp-facetn">${n}</span>'), true);
  // ── 1-1-2 · 복수 선택은 **태그일 때만** (v26-0908-3, HB) ──────────
  //   한 말씀이 여럿을 가질 수 있는 축은 태그뿐이다. 성경·대분류·소주제는
  //   하나씩만 가지므로 둘을 켜면 교집합이 반드시 비어 목록이 사라진다.
  sc.eq('복수 선택은 태그일 때만',
    SRC.includes("function _vpFiltMulti(){ return _vpOtherAxis()==='tag'; }"), true);
  sc.eq('단일 축에서는 갈아탄다', SRC.includes('else _vpFilt=[val];'), true);

  // ── 1-3 · 노드로 들어간 길이면 타일뷰를 거쳐도 칩을 지킨다 ──────────
  sc.eq('노드에서 온 길인지 기억한다', SRC.includes('let _vpFromNode=false;'), true);
  sc.eq('타일뷰로 갈 때 표시한다', SRC.includes('_vpFromNode=true;'), true);
  // v26-0908-3, HB 1-3 — 짝 목록에서 온 길만이 아니라 **어느 길로 왔든**
  //   타일뷰에서 연 전체화면이면 칩이 선다. 지도 → 타일뷰가 그래서 빠졌었다.
  sc.eq('타일뷰에서 연 전체화면도 그 갈래를 쥔다',
    SRC.includes("_vfSetTabPool(_vgSort(_vgFilteredPool(true)),_vgTab());"), true);
  sc.eq('칩이 서는 조건은 밑 목록이 있느냐',
    SRC.includes("const vpOn=on&&!!(typeof _vpFullTab!=='undefined'&&_vpFullTab&&_vfTabPool);"), true);
  sc.eq('그 타일뷰로 돌아갈 문도 함께 심는다',
    SRC.includes("_vfNavTile={kind:_vgState.kind,val:_vgState.val,"), true);
  sc.eq('홈을 누르면 그 길이 끝난다',
    /function vfHomeAction\(\)\{[\s\S]{0,220}_vpFromNode=false;/.test(SRC), true);

  // ── 1-4 · 골라보기 목록을 세로가 허락하는 만큼 ────────────────────
  sc.eq('15줄 고정을 걷어낸다', /\.vgp-list\{max-height:min\(46vh,520px\);/.test(SRC), true);
  sc.eq('넓은 화면에서는 더 길게', /\.vgp-list\{max-height:min\(58vh,700px\);\}/.test(SRC), true);

  // ── 2-2-2·2-2-3 · 장 목록 머리 버튼 · 장 클릭 ────────────────────
  sc.eq("'이 성경 말씀 보기' 글자 링크를 걷어냈다", SRC.includes('이 성경 말씀 보기'), false);
  sc.eq('격자·전체화면 아이콘 둘',
    SRC.includes('onclick="vMapOpenGrid(') && SRC.includes("onclick=\"vMapOpenChapter('${_vDashQ(b)}',0)"), true);
  sc.eq('다룬 장만 누를 자리로', SRC.includes("(n?`onclick=\"vMapOpenChapter('${_vDashQ(b)}',${i})\" `:'')"), true);
  sc.eq('장 전체화면을 여는 함수', SRC.includes('function vMapOpenChapter(book,chap){'), true);
  sc.eq('그 장의 첫 말씀 자리를 찾는다',
    SRC.includes('const hit=list.findIndex(v=>_vTrChapterKeys(v.ref,book,v).some(k=>_vTrChapNo(k)===chap));'), true);

  // ── 2-2-4 · 전체화면 제목은 언제나 그 타일뷰로 가는 문 ────────────
  sc.eq('제목이 가리킬 곳을 한 함수가 정한다', SRC.includes('function _vfTitleTileFn(on,vpOn){'), true);
  sc.eq('따로 일러 준 타일뷰가 있으면 그리로', SRC.includes('let _vfNavTile=null;'), true);
  sc.eq('새 목록이 들어오면 옛 문은 닫는다',
    SRC.includes("if(typeof _vfNavTile!=='undefined')_vfNavTile=null;   // 새 목록 — 옛 문은 닫는다"), true);
  sc.eq('_vfClearNav 도 함께 비운다', /function _vfClearNav\(\)\{[^\n]*_vfNavTile=null;/.test(SRC), true);
  // v26-0908-3, HB 2-2-3 — 걸린 필터(refs)와 조건 이름까지 함께 들고 간다.
  sc.eq('지도에서 연 전체화면은 그 성경 타일뷰를 가리킨다',
    SRC.includes("_vfNavTile={kind:'book',val:book,refs:refs,facet:cond?[cond]:null};"), true);
  sc.eq('장을 열 때 위쪽 필터가 걸린 기록만 쓴다',
    /function vMapOpenChapter\(book,chap\)\{[\s\S]{0,400}_vDashWinEntries\(sc\.kind,sc\.tab,sc\.unit,sc\.span,sc\)/.test(SRC), true);
  sc.eq('제목에도 그 조건을 적는다', SRC.includes("_vfSetNav(list,i,book+(cond?' · '+cond:''),null);"), true);
  sc.eq('타일뷰로 넘어가도 그 필터를 지킨다',
    SRC.includes("openVerseGrid(_vfNavTile.kind,_vfNavTile.val,null,_vfNavTile.refs||null);"), true);
  // ⚠️ 제목(.vf-toplabel)은 z-index 11, '이전 말씀' 꺾쇠(.vf-nav-u)는 2 다.
  //    제목이 위라 눌러도 꺾쇠가 먼저 먹지 않는다 (HB 2-2-4 의 걱정).
  sc.eq('제목이 꺾쇠보다 위에 선다', /\.vf-toplabel\{[\s\S]{0,220}z-index:11;/.test(SRC), true);
  sc.eq('꺾쇠는 그 아래', /\.vf-nav\{[\s\S]{0,160}z-index:2;/.test(SRC), true);
  sc.eq('누를 자리일 때만 클릭을 받는다',
    /\.vf-toplabel\.vf-keep-title\{pointer-events:auto;/.test(SRC), true);

  // ── 2-3 · 범위 빼기 ─────────────────────────────────────────────
  sc.eq("'빼기' 알약칩", SRC.includes('<span class="vdash-subbtn${(sub||armed)?\' on\':\'\'}" onclick="vDashSubToggle()" '), true);
  sc.eq('B 를 기다리는 상태가 있다', SRC.includes('function _vDashSubArmed(){'), true);
  sc.eq('다음에 고른 범위가 B 가 된다',
    /function vDashKindPick\(v\)\{[\s\S]{0,200}p\.kindSub=v; p\.subArm=false;/.test(SRC), true);
  sc.eq('A 와 같은 것은 못 고른다', SRC.includes("showToast('A 와 다른 범위를 골라 주세요')"), true);
  // ⚠️ 빼는 곳은 **한 곳(_vDashWinEntries)** 이다. 탭마다 따로 빼면 하나는 빠뜨린다.
  sc.eq('한 곳에서 뺀다 — 다섯 탭이 저절로 따라온다',
    SRC.includes('const sub=_vDashSubRefSet();\n  return sub?out.filter(e=>!sub.has(e.ref)):out;'), true);
  sc.eq('B 를 세는 동안 다시 빼지 않는다(빗장)', SRC.includes('let _vDashSubBusy=false;'), true);

  // ── 3 · 조건이 만든 인사이트 ────────────────────────────────────
  sc.eq('A − B 를 말로', SRC.includes('function _vDashSubWords(){'), true);
  sc.eq('갈래를 좁혔을 때도', SRC.includes('function _vDashTabWords(){'), true);
  sc.eq("'상위 N개를 빼면 그다음은' 줄", SRC.includes('function _vDashNextLine(rows,lo,hi,verb,unit){'), true);
  sc.eq('조건이 기본값이면 아무 말도 안 한다', SRC.includes("if(!lines.length)return'';"), true);
  sc.eq('분포 탭에도 한 줄', SRC.includes('function _vDashPieInsightHTML(){'), true);
  sc.eq('지도 — 빼기 줄', SRC.includes('const _subW=_vDashSubWords();'), true);
  sc.eq('지도 — 구약·신약 균형', SRC.includes('구약 <b>${_ot}권</b>'), true);
  sc.eq('리듬 — 가장 뜸한 때', SRC.includes('가장 뜸한 때는 <b>${esc(q.b.name)}</b>'), true);
  sc.eq('연결 — 순위창으로 접어 둔 개수', SRC.includes('순위창으로 ${bits.join(\' · \')}를 접어 뒀어요.'), true);
  // 받침에 따라 갈리는 조사 — '로마서이', '마태복음는', '밤예요' 가 안 나오게
  sc.eq('은/는 조사', SRC.includes('function _vTrJosaEun(w){'), true);
  sc.eq('(으)로 조사', SRC.includes('function _vTrJosaRo(w){'), true);
  sc.eq('예요/이에요 조사', SRC.includes('function _vTrJosaYeyo(w){'), true);
}

console.log('\n시나리오 34 — 0908-3 (뎁스가 진짜로 먹게 · 칩 유지 · 문구 다듬기)');
{
  // ── 1-2 · "뎁스가 아직도 안 먹는다" 의 뿌리 ──────────────────────
  // 뎁스는 '고른 점에서 몇 걸음' 이라, 고른 점이 없으면 원리상 아무 일도
  // 못 한다. HB 화면에 개수가 안 적히고 칩이 옅던 것이 바로 그 상태였다.
  // → 그래프의 점을 톡 누르면 그 점이 중심이 되게 해서 전제를 없앴다.
  sc.eq('점 하나만 고르는 길이 있다', SRC.includes('function vgSetSelOnly(id){'), true);
  sc.eq('고른 뒤 곧바로 다시 매긴다',
    /function vgSetSelOnly\(id\)\{[\s\S]{0,160}_vgApplyFilter\(\);/.test(SRC), true);
  sc.eq('그래프 탭이 그 길을 쓴다', SRC.includes('vgSetSelOnly(n.kind+_VG_SEP+n.key);'), true);

  // ── 1-3 · 칩이 도는 밑 목록 ─────────────────────────────────────
  sc.eq('갈래 칩이 도는 밑 목록', SRC.includes('let _vfTabPool=null;'), true);
  sc.eq('밑 목록에서 갈래만 거른다', SRC.includes('function _vfTabList(tab){'), true);
  sc.eq('칩 돌리기는 그 밑 목록으로', SRC.includes('const list=_vfTabList(next);'), true);
  // ⚠️ _vfSetNav 는 '제목이 가리키는 타일뷰' 를 비운다 — 갈래만 도는 것이지
  //    목록이 바뀐 것이 아니므로 그 문은 그대로 들고 가야 한다.
  sc.eq('갈래를 돌아도 제목의 문은 그대로', SRC.includes('const keepTile=_vfNavTile;'), true);
  sc.eq('홈을 누르면 밑 목록도 내린다',
    /function vfHomeAction\(\)\{[\s\S]{0,300}_vfTabPool=null;/.test(SRC), true);
  sc.eq('_vfClearNav 도 밑 목록을 비운다',
    /function _vfClearNav\(\)\{[^\n]*_vfTabPool=null;/.test(SRC), true);

  // ── 1-4 · 순위 손잡이를 미는 동안 목록이 따라온다 ───────────────
  sc.eq('미는 동안 줄의 활성/비활성이 바뀐다', SRC.includes('const paintRows=()=>{'), true);
  sc.eq('다시 그리지 않고 class 만 갈아 끼운다',
    SRC.includes("r.classList.toggle('rankoff',!active);"), true);

  // ── 3-2-1 · 범위마다 다른 말 ────────────────────────────────────
  sc.eq('범위별 동사표', SRC.includes('const _VDASH_VERB={'), true);
  sc.eq('좋아요는 좋아한', SRC.includes("like:'많이 좋아한'"), true);
  sc.eq('암송은 외운', SRC.includes("mem:'많이 외운'"), true);
  sc.eq('Deeper 는 성경을 찾아본', SRC.includes("deeper:'많이 성경을 찾아본'"), true);
  sc.eq('Even 은 더 깊게 찾아본', SRC.includes("even:'많이 성경을 더 깊게 찾아본'"), true);
  sc.eq('지도 인사이트가 그 말을 쓴다', SRC.includes('`가장 ${_vDashVerbWord()} 곳: `'), true);

  // ── 3-2-2 · 리듬 문구 ───────────────────────────────────────────
  // 차트 칸은 설정을 따르지만 문장은 늘 '일요일…'. LMTWTFS 일 때만 '주일'.
  sc.eq('문장용 요일 이름을 따로 만든다',
    SRC.includes("const dowFull=[_lord?'주일':'일요일','월요일','화요일','수요일','목요일','금요일','토요일'];"), true);
  sc.eq('LMTWTFS 일 때만 주일',
    SRC.includes("const _lord=(ST.settings.dowFormat||'letter-lord')==='letter-lord';"), true);
  sc.eq('내용마다 줄을 바꾼다', SRC.includes("rl.join('<br>')+"), true);
  sc.eq('조건 줄도 줄바꿈으로 잇는다', SRC.includes("return ex.length?'<br>'+ex.join('<br>'):'';"), true);

  // ── 4 · 리듬 시간구간을 표 안에서도 알아보게 ────────────────────
  sc.eq('띠 가운데에 구간 이름을 한 번 더',
    SRC.includes('<span class="vrhy2-zonenm">${esc(b.name)}</span>'), true);
  sc.eq('띠 위쪽 경계선을 굵게', /\.vrhy2-zone\{[\s\S]{0,120}border-top-width:2px;/.test(SRC), true);
  sc.eq('경계선은 그 구간 색으로', SRC.includes('border-top-color:color-mix(in srgb,${b.color} 70%,transparent);'), true);
  // ⚠️ 칸보다 뒤에 깔리므로 아주 옅게 — 진하면 숫자 칸이 안 읽힌다.
  sc.eq('이름은 아주 옅게', /\.vrhy2-zonenm\{[\s\S]{0,110}opacity:\.22;/.test(SRC), true);

  // ── 2-2-3 · 위쪽 필터를 물고 가는 길 ────────────────────────────
  sc.eq('제목에 쓸 조건 이름', SRC.includes('function _vDashScopeTitle(){'), true);
  sc.eq('기본값이면 빈 문자열', SRC.includes("return bits.join(' ');"), true);
  sc.eq('격자 버튼도 같은 필터를 물고 간다',
    /function vMapOpenGrid\(book\)\{[\s\S]{0,420}openVerseGrid\('book',book,null,refs\.size\?refs:null\);/.test(SRC), true);
}

sc.done();
