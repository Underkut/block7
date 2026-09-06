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
  '_vTrGeo','_vTrHFromX','_vTrRailHTML','_vTrRowHTML','_vTrInsightHTML'];
const API=eval(slice("const _VTR_UNITS=", 'function renderVDashTrend(')+'\n;({'+NAMES.join(',')+'})');
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
  sc.eq('흐름 탭이 왼쪽, 분포가 오른쪽',
    SRC.includes("const _VDASH_VIEWS=[['trend','흐름'],['pie','분포']];"), true);
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
  sc.eq('넓으면 두 슬라이더를 한 줄에', /@media \(min-width:720px\)\{\s*\n?\s*\.vtr-slides\{flex-direction:row/.test(SRC.replace(/\n\s*/g,'\n')), true);
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
  sc.eq('겹치면 벌린다', /if\(y-prev<12\)y=prev\+12;/.test(SRC), true);
  sc.eq('영역·선·이름을 누르면 표의 그 줄과 같은 일을 한다',
    /const clickOf=s=>book\?'':` style="cursor:pointer;" onclick="vDashOpenFilter/.test(SRC), true);
  sc.eq('성경 안(장)에서는 누를 것이 없다', /clickOf=s=>book\?''/.test(SRC), true);
}

console.log('\n시나리오 9-8 — 닫기 × 는 늘 우상단 (HB 1)');
{
  sc.eq('늘 있는 빈 칸이 × 를 오른쪽 끝으로 민다', SRC.includes('<div class="vdash-hdgap"></div>'), true);
  sc.eq('빈 칸이 늘어난다', /\.vdash-hdgap\{flex:1 1 auto;/.test(SRC), true);
  sc.eq('기간 칩은 이제 늘어나지 않는다', SRC.includes('id="vDashPeriods" style="display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;align-items:center;flex:0 1 auto;'), true);
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

sc.done();
