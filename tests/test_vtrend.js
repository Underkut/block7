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
  '_vMapGroups','_VMAP_GROUPS_OT','_VMAP_GROUPS_NT','_vMapRange','_VG_MAXL','_VG_MAXR',
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
  sc.eq("띠 안에 '최근'·'이전' 을 적는다",
    SRC.includes('>최근</text>') && SRC.includes('>이전</text>'), true);
  // ⚠️ 글자에는 면을 칠하는 --ac 가 아니라 글자용 --ac-tx 를 쓴다.
  //    어두운 테마에서 옅은 띠 위에 --ac 를 얹으면 배경에 묻힌다 (v26-0906-3).
  sc.eq("'최근' 글자는 --ac-tx", /class="vtr-mkAl"[^>]*fill="var\(--ac-tx\)"/.test(SRC), true);
  sc.eq("'최근' 글자에 --ac 를 쓰지 않는다", /class="vtr-mkAl"[^>]*fill="var\(--ac\)"/.test(SRC), false);
  sc.eq('잡는 자리를 넉넉히 둔다', SRC.includes('class="vtr-mkGrab"'), true);
  sc.eq('손을 뗄 때만 저장한다', /paint\(g\.edge[\s\S]{0,80}vTrInsSet\(cur\);/.test(SRC), true);
  // 인사이트 알약과 그림 띠가 같은 색을 쓴다 (HB 4-2)
  sc.eq('A 알약은 강조색', /\.vtr-pill-a\{background:var\(--vtr-a-bg\);/.test(SRC), true);
  sc.eq('B 알약은 회색', /\.vtr-pill-b\{background:var\(--vtr-b-bg\);/.test(SRC), true);
  sc.eq('그림의 A 띠도 강조색', /class="vtr-mkA"[^>]*fill="var\(--ac\)"/.test(SRC), true);
  sc.eq('그림의 B 띠는 회색', /class="vtr-mkB"[^>]*fill="#8a8a99"/.test(SRC), true);
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
  // ⚠️ 장 격자는 누른 칸이 있는 쪽(구약/신약) 바로 아래에 편다 — 맨 끝에 붙이면
  //    구약을 눌렀는데 신약 격자를 다 지나 한참 내려가야 보인다 (v26-0906-6).
  sc.eq('구약을 누르면 구약 아래에',
    SRC.includes("html+=grid('구약',BIBLE_ORDER_OT,_VMAP_GROUPS_OT)+(isOT?chapsHTML:'')"), true);
  sc.eq('신약을 누르면 신약 아래에',
    SRC.includes("+grid('신약',BIBLE_ORDER_NT,_VMAP_GROUPS_NT)+(p.mapBook&&!isOT?chapsHTML:'');"), true);
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
  ST.settings.vTrPref = null;
  const full = _vMapRange('count', 12);
  sc.eq('처음엔 구간 전체', [full.lo, full.hi, full.full], [0, 12, true]);
  _vTrPref().mapRg = { count: { lo: 3, hi: 8 } };
  const cut = _vMapRange('count', 12);
  sc.eq('고른 구간을 쓴다', [cut.lo, cut.hi, cut.full], [3, 8, false]);
  // 자료가 줄어 최댓값이 작아져도 구간이 밖으로 삐져나가지 않는다
  const small = _vMapRange('count', 5);
  sc.eq('최댓값이 줄면 함께 줄어든다', [small.lo, small.hi], [3, 5]);
  _vTrPref().mapRg = { count: { lo: 9, hi: 2 } };
  sc.eq('뒤집힌 값도 바로잡는다', (r => r.lo <= r.hi)(_vMapRange('count', 12)), true);
  ST.settings.vTrPref = null;
  // 보기(횟수/묵힘)마다 구간을 따로 든다 — 하나는 '번', 하나는 '주'다
  sc.eq('보기마다 구간이 따로', SRC.includes("p.mapRg[mode]={lo:Math.round(lo),hi:Math.round(hi)};"), true);
  sc.eq('구간 밖은 지우지 않고 흐린다', SRC.includes("if(v<rg.lo||v>rg.hi)cls+=' out';"), true);
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
  sc.eq('점을 톡 누르면 짝 목록으로',
        SRC.includes("if(moved<5)openVPair(n.kind==='book'?'book':la,n.key);"), true);
  sc.eq('점 · 선 상한이 있다', [_VG_MAXL, _VG_MAXR], [14, 22]);
  // v26-0907-5 — 배치 값이 팝업에서 고쳐지므로 상수가 아니라 설정에서 온다
  sc.eq('물리 값은 설정에서 온다',
        /const REST=cfg\.rest, K=cfg\.pull\/1000, REP=cfg\.rep, DAMP=0\.86;/.test(SRC), true);
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
  sc.eq('그 세기를 실제로 쓴다', SRC.includes('const f=REP*_rep2(a,b)/dd'), true);
  // 식힘을 자리 이동에 곱한다 — 이것이 '춤추다 뚝 멈추는' 것을 없앤다
  sc.eq('식힘을 자리 이동에 곱한다',
        /const ddx=Math\.max\(-10,Math\.min\(10,p\.vx\)\)\*alpha;/.test(SRC), true);
  // 이미 잦아들었으면 곧바로 멈춘다 (안 움직이는 그림을 계속 다시 그리지 않는다)
  sc.eq('잦아들면 곧바로 멈춘다', /still=\(moved<0\.05\)\?\(still\+1\):0;/.test(SRC), true);
  sc.eq('멈출 조건에 그것이 들어간다', SRC.includes('if(alpha>0.06&&still<8)'), true);
  // 1-1 · 골라 보기 + N뎁스
  sc.eq('씨앗에서 N걸음까지 번진다', SRC.includes('function _vgReach(N,E,seeds,depth)'), true);
  sc.eq('씨앗이 없으면 전부 보인다', SRC.includes('if(!seeds.size)return null;'), true);
  sc.eq('뎁스는 0~4', SRC.includes('return(isFinite(n)&&n>=0&&n<=4)?n:1;'), true);
  // 1-2 · 검색은 타이핑하는 동안 바로. 다시 그리지 않고 보임/숨김만 바꾼다.
  sc.eq('타이핑하는 동안 걸린다', SRC.includes('oninput="vgSearch(this.value)"'), true);
  sc.eq('검색은 다시 그리지 않는다',
        /function vgSearch\(q\)\{[\s\S]{0,200}?_vgApplyFilter\(\);/.test(SRC), true);
  sc.eq('검색어는 저장하지 않는다', SRC.includes("let _vgQuery='';"), true);
  sc.eq('숨긴 점은 물리에서도 빠진다', SRC.includes('if(a.hide)continue;'), true);
  // 2-1 · 배치 값 팝업
  sc.eq('배치 값 넷', SRC.includes("const _VG_CFG_ROWS=["), true);
  sc.eq('기본값이 있다', SRC.includes("const _VG_DEF={rest:64,rep:760,pull:24,font:100};"), true);
  sc.eq('두 팝업 다 ESC 로 닫힌다',
        SRC.includes("['vgPickModal',     ()=>closeVgPick()],") &&
        SRC.includes("['vgCfgModal',      ()=>closeVgCfg()],"), true);
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
        /openVerseFull\(true\);\s*\n\s*_vpFullTab=tab;/.test(SRC), true);
  sc.eq('나갈 때 갈래 기억도 지운다',
        /function _vfClearNav\(\)\{[^\n]*_vpFullTab=null;/.test(SRC), true);
  // ⚠️ 그 함수는 한 줄이어야 한다 — test_keep_fullscreen.js 가 한 줄로 잘라 쓴다
  sc.eq('_vfClearNav 는 한 줄이다',
        /function _vfClearNav\(\)\{[^\n]*_vfSyncTopBar\(\);\}/.test(SRC), true);
  // 제목을 눌러 세 갈래를 돈다 (둘만 오가면 합본에서 되돌아갈 길이 없다)
  sc.eq('제목이 눌러진다', SRC.includes('vpOn?vpCycleFullTab:null'), true);
  sc.eq('세 갈래를 돈다', SRC.includes('_VP_TABS[(i+1)%_VP_TABS.length][0]'), true);
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

sc.done();
