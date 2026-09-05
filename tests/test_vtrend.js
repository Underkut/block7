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
// ⚠️ eval 안의 const 는 밖으로 새어 나오지 않는다 (function 만 나온다).
//    쓸 이름을 한 곳에 적어 돌려받는다 — 이름이 바뀌면 여기서 바로 걸린다.
const NAMES=['_VTR_SPAN_MAX','_VTR_FORMS','_VTR_UNITS','_vTrPref','_vTrSpan','_vTrInsMax',
  '_vTrInsN','_vTrBucketOf','_vTrBucketList','_vTrUnitWord','_vTrChapterKeys','_vTrChapNo',
  '_vTrDiffHTML'];
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

sc.done();
