// v26-0905-12, HB — 대시보드 넓히기
//   1) 상세 팝업의 표는 '기타' 없이 전부 (카운트 1까지). 같은 수는 ㄱㄴㄷ순
//   2) 상세 팝업 5행 × 4열 사이를 스와이프로 오간다 (양 끝 순환은 loopViews)
//   3) '현재 말씀 모음' 행이 맨 위에 생긴다 + 그 파이 넉 장을 목록 팝업에도
//   4) 제목열을 좁히고 가로 스크롤에도 붙여 둔다
//   5) 전체화면을 열 때 덮이는 팝업은 **이름표가 아니라 클래스로** 훑어 숨긴다
//   6) '흐름' — 주/달로 나눠 센 꺾은선·비중 그래프
const { slice, SRC, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 떠올 코드 ──
// 대시보드 본체 + 상세 팝업. 둘은 같은 const 들을 함께 쓰므로 한 통에 넣는다.
const SRC_DASH =
  slice('// 행: 현재 말씀 모음', '// ── 장절 느슨한 대조 ──') +
  slice('// ── 파이차트 상세 팝업 ──', 'function closeVDashDetail(){');

// ── 바깥에서 빌려 쓰는 것들 (테스트용 가짜) ──
let VERSES = [];          // ACTIVE_VERSES / ALL_VERSES 가 돌려줄 목록
let LIKE = {};            // 좋아요 로그
let NOW = new Date('2026-09-05T09:00:00');

global.ST = { settings: {} };
global.save = () => {};
global.esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
global._vgEscAttr = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
global.z = n => String(n).padStart(2, '0');
global.logicalNow = () => new Date(NOW);
global.ACTIVE_VERSES = () => VERSES;
global.ALL_VERSES = () => VERSES;
global._reactKey = v => (v && v.pid) ? ('P' + (v._code || '') + '' + v.pid) : ((v && v.ref) || '');
global._isReactPid = k => typeof k === 'string' && k.indexOf('P') === 0;
global._bookOfRef = ref => {
  const m = String(ref || '').match(/^(.+?)\s*\d+\s*:/);
  return m ? m[1].trim() : '';
};
global._booksOf = v => {
  if (v && Array.isArray(v.books) && v.books.length) return v.books.slice();
  const one = global._bookOfRef(v && v.ref);
  return one ? [one] : [];
};
global._vListRange = () => null;                 // 기간 '전체'
global._flatMemEntries = () => [];
global._flatSimpleEntries = log => {
  const out = [];
  Object.entries(log).forEach(([date, arr]) => (arr || []).forEach(e => {
    if (e.ref) out.push({ ref: e.ref, date, time: e.time || '' });
  }));
  return out;
};
global.getLikeLog = () => LIKE;
global.getDeeperLog = () => ({});
global.getEvenDeeperLog = () => ({});
global._aggByRef = entries => {
  const m = new Map();
  entries.forEach(e => {
    if (!m.has(e.ref)) m.set(e.ref, { ref: e.ref, count: 0, lastDate: '', lastTime: '' });
    m.get(e.ref).count++;
  });
  return [...m.values()];
};
global._vlKindEntries = k => (k === 'like' ? global._flatSimpleEntries(LIKE) : []);
global._vlIsProp = ref => global._isReactPid(ref);
global._VLIST_KIND_TITLE = { mem: '<svg/>', like: '<svg/>', deeper: '<svg/>', even: '<svg/>' };
global._VL_PERIODS = [['week', '주간'], ['month', '월간'], ['year', '연간'], ['all', '전체'], ['custom', '직접']];
global._VL_TABS = [['all', '전체'], ['verse', '말씀'], ['prop', '명제']];
global.document = { getElementById: () => null, querySelectorAll: () => [] };

// 한 통으로 감싸 안쪽 const 들을 꺼내 온다 (index.html 은 단일 파일이라 export 가 없다)
const D = eval('(function(){' + SRC_DASH + ';return{' + [
  '_VDASH_KINDS', '_VDASH_AXES', '_VDASH_MAX_SLICE', '_VDASH_ETC_COLOR',
  '_vDashKeyCmp', '_vDashQ', '_vDashPref', '_vDashEntries', '_vDashHomeAgg',
  '_vDashKeysOf', '_vDashBuckets', '_vDashSlices', '_vDashRowHeadHTML',
  '_vDashKindLabel', '_vDashAxisLabel',
  '_vTrPref', '_vTrEntries', '_vTrBucketOf', '_vTrBucketList', '_vTrBucketLabel', '_vTrData',
  '_vTrInsight', '_vTrChartSVG',
  '_vDashDetailDotsHTML',
  'setCtx:(k,a)=>{_vDashDetailCtx={kind:k,axis:a};}',
  // 말씀 표(_vDashVerseMap)는 한 번 만들면 캐시된다 — 앱은 그릴 때마다 비운다.
  // 테스트도 목록을 갈아끼울 때마다 같이 비운다.
  'reset:()=>{_vDashVerseMap=null;}',
  'go:(dk,da)=>_vDashDetailGo(dk,da)'
].join(',') + '};})()');

// 표에 쓸 가짜 말씀들
function V(ref, cat, topic, tags, d, extra) {
  return Object.assign({ ref, cat, topic, tags: tags || [], d: d || '' }, extra || {});
}
// 목록을 갈아끼운다 — 앱이 그릴 때마다 하는 것과 같은 일(캐시 비우기)을 함께 한다
function setVerses(list) { VERSES = list; D.reset(); }

console.log('시나리오 1 — 상세 표는 기타 없이 전부, 파이만 기타로 묶는다');
{
  // 태그 10종: t01 이 3회, t02 가 2회, 나머지 여덟은 1회씩
  setVerses([]);
  const agg = [];
  const push = (ref, tags, n) => { VERSES.push(V(ref, '가', '나', tags)); agg.push({ ref, count: n }); };
  push('창세기 1:1', ['t01', 't02'], 1);
  push('창세기 1:2', ['t01'], 2);
  push('창세기 1:3', ['t02'], 1);
  for (let i = 3; i <= 10; i++) push('창세기 2:' + i, ['t' + String(i).padStart(2, '0')], 1);
  D.reset();

  const full = D._vDashBuckets(agg, 'tag');
  const slices = D._vDashSlices(agg, 'tag');
  sc.eq('표는 태그 10종을 모두 담는다', full.length, 10);
  sc.eq("표에는 '기타' 가 없다", full.some(s => s.key === '기타'), false);
  sc.eq('카운트 1짜리도 표에 있다', full.filter(s => s.count === 1).length, 8);
  sc.eq('파이는 상위 7 + 기타 = 8조각', slices.length, D._VDASH_MAX_SLICE + 1);
  sc.eq("파이 마지막 조각은 '기타'", slices[slices.length - 1].key, '기타');
  sc.eq('기타 조각의 수는 8위 아래의 합', slices[7].count,
        full.slice(7).reduce((n, s) => n + s.count, 0));
  sc.eq('표 합계와 파이 합계가 같다',
        full.reduce((n, s) => n + s.count, 0), slices.reduce((n, s) => n + s.count, 0));
  sc.eq('가장 많은 것이 맨 위', [full[0].key, full[0].count], ['t01', 3]);
  sc.eq('카운트 0인 항목은 애초에 생기지 않는다', full.some(s => s.count === 0), false);
}

console.log('\n시나리오 1-2 — 같은 카운트 안에서는 ㄱㄴㄷ순');
{
  setVerses([
    V('창세기 1:1', '라', '', []), V('창세기 1:2', '가', '', []),
    V('창세기 1:3', '나', '', []), V('창세기 1:4', '다', '', [])
  ]);
  const agg = VERSES.map(v => ({ ref: v.ref, count: 1 }));
  const full = D._vDashBuckets(agg, 'cat');
  sc.eq('모두 1회면 ㄱㄴㄷ 차례로', full.map(s => s.key), ['가', '나', '다', '라']);
  // 하나만 2회로 올리면 그것이 맨 위, 나머지는 여전히 ㄱㄴㄷ
  agg[0].count = 2;
  sc.eq('많은 것이 먼저, 같은 수끼리는 ㄱㄴㄷ',
        D._vDashBuckets(agg, 'cat').map(s => s.key), ['라', '가', '나', '다']);
}

console.log('\n시나리오 2 — 행이 다섯: 현재 말씀 모음 · 좋아요 · 암송 · Deeper · Even');
{
  sc.eq('행이 5개', D._VDASH_KINDS.length, 5);
  sc.eq('맨 위가 현재 말씀 모음', D._VDASH_KINDS[0], ['home', '현재 말씀 모음']);
  sc.eq('나머지 넷은 그대로', D._VDASH_KINDS.slice(1).map(k => k[0]), ['like', 'mem', 'deeper', 'even']);
  sc.eq('열은 그대로 넷', D._VDASH_AXES.map(a => a[0]), ['cat', 'topic', 'tag', 'book']);
  const hd = D._vDashRowHeadHTML('home', '현재 말씀 모음');
  sc.eq("행 제목이 '현재' + 줄바꿈 '말씀 모음'", /^<div class="vdash-rowhd">현재<span>말씀 모음<\/span><\/div>$/.test(hd), true);
  sc.eq('현재 말씀 모음 행에는 아이콘이 없다', hd.includes('<svg'), false);
  sc.eq('좋아요 행에는 아이콘이 있다', D._vDashRowHeadHTML('like', '좋아요').includes('<svg'), true);
}

console.log('\n시나리오 2-2 — 현재 말씀 모음은 "모음 그 자체" (말씀 하나가 1건)');
{
  setVerses([
    V('마태복음 1:1', '가', '', ['t1']),
    V('마태복음 1:2', '가', '', ['t1']),
    V('로마서 8:1', '나', '', ['t2'])
  ]);
  // 좋아요를 아무리 많이 눌러도 모음 행의 수는 변하지 않는다
  LIKE = { '2026-09-01': [{ ref: '마태복음 1:1' }, { ref: '마태복음 1:1' }, { ref: '마태복음 1:1' }] };
  const home = D._vDashEntries('home');
  sc.eq('말씀 3개 → 3건', home.length, 3);
  sc.eq('저마다 1건씩', home.every(a => a.count === 1), true);
  const cat = D._vDashBuckets(home, 'cat');
  sc.eq('대분류 분포는 가 2 / 나 1', cat.map(s => [s.key, s.count]), [['가', 2], ['나', 1]]);
  const book = D._vDashBuckets(home, 'book');
  sc.eq('성경 분포도 말씀 수 기준', book.map(s => [s.key, s.count]), [['마태복음', 2], ['로마서', 1]]);
  // 좋아요 행은 누른 횟수 그대로
  const like = D._vDashBuckets(D._vDashEntries('like'), 'book');
  sc.eq('좋아요 행은 누른 횟수(3)', like.map(s => [s.key, s.count]), [['마태복음', 3]]);
}

console.log('\n시나리오 2-3 — 명제도 대분류·태그·성경을 찾는다 (반응 키가 장절이 아니다)');
{
  setVerses([V('마태복음 5:3', '설교', '천국', ['은혜'], '2026-09-01',
               { pid: 'P0001', _code: 'AAAAAA', books: ['마태복음', '로마서'] })]);
  const key = global._reactKey(VERSES[0]);
  sc.eq('명제의 대분류를 찾는다', D._vDashKeysOf(key, 'cat'), ['설교']);
  sc.eq('명제의 태그를 찾는다', D._vDashKeysOf(key, 'tag'), ['은혜']);
  sc.eq("명제의 '성경권' 은 여러 권", D._vDashKeysOf(key, 'book'), ['마태복음', '로마서']);
  sc.eq('목록에 없는 열쇠는 (목록에 없음)', D._vDashKeysOf('PXX없음', 'cat'), ['(목록에 없음)']);
}

console.log('\n시나리오 3 — 상세 팝업 5행 × 4열 이동 (양 끝 순환은 loopViews)');
{
  sc.eq('점판이 20칸', (D._vDashDetailDotsHTML('home', 'cat').match(/vdd-dot/g) || []).length, 20);
  sc.eq('지금 칸 하나만 켜져 있다', (D._vDashDetailDotsHTML('home', 'cat').match(/vdd-dot on/g) || []).length, 1);

  ST.settings.loopViews = false;
  D.setCtx('home', 'cat');
  sc.eq('오른쪽 → 소주제', D.go(0, 1), { kind: 'home', axis: 'topic' });
  sc.eq('왼쪽 끝에서는 못 간다(순환 꺼짐)', D.go(0, -1), null);
  sc.eq('위쪽 끝에서도 못 간다', D.go(-1, 0), null);
  sc.eq('아래로는 좋아요 행', D.go(1, 0), { kind: 'like', axis: 'cat' });
  D.setCtx('even', 'book');
  sc.eq('오른쪽 끝에서는 못 간다', D.go(0, 1), null);
  sc.eq('아래쪽 끝에서도 못 간다', D.go(1, 0), null);

  ST.settings.loopViews = true;
  D.setCtx('home', 'cat');
  sc.eq('순환 켜짐 — 왼쪽 끝에서 성경으로', D.go(0, -1), { kind: 'home', axis: 'book' });
  sc.eq('순환 켜짐 — 위쪽 끝에서 Even 으로', D.go(-1, 0), { kind: 'even', axis: 'cat' });
  D.setCtx('even', 'book');
  sc.eq('순환 켜짐 — 오른쪽 끝에서 대분류로', D.go(0, 1), { kind: 'even', axis: 'cat' });
  sc.eq('순환 켜짐 — 아래쪽 끝에서 현재 말씀 모음으로', D.go(1, 0), { kind: 'home', axis: 'book' });
  ST.settings.loopViews = false;
}

console.log('\n시나리오 4 — 흐름: 날짜를 주/달 칸으로 나눈다');
{
  sc.eq('주 칸은 그 주의 일요일', D._vTrBucketOf('2026-09-05', 'week'), '2026-08-30');
  sc.eq('일요일 자신도 그 주', D._vTrBucketOf('2026-08-30', 'week'), '2026-08-30');
  sc.eq('한 주 앞은 다른 칸', D._vTrBucketOf('2026-08-29', 'week'), '2026-08-23');
  sc.eq('달 칸은 YYYY-MM', D._vTrBucketOf('2026-09-05', 'month'), '2026-09');
  sc.eq('날짜가 없으면 칸도 없다', D._vTrBucketOf('', 'week'), '');
  sc.eq('날짜 모양이 아니면 칸도 없다', D._vTrBucketOf('2026/09/05', 'week'), '');

  const wk = D._vTrBucketList('week', 3);
  sc.eq('주 3칸', wk.length, 3);
  sc.eq('마지막 칸이 이번 주', wk[2], '2026-08-30');
  sc.eq('오래된 것부터', wk, ['2026-08-16', '2026-08-23', '2026-08-30']);
  const mo = D._vTrBucketList('month', 3);
  sc.eq('달 3칸', mo, ['2026-07', '2026-08', '2026-09']);
  sc.eq('칸 이름표(주)', D._vTrBucketLabel('2026-08-30', 'week'), '8/30');
  sc.eq('칸 이름표(달)', D._vTrBucketLabel('2026-09', 'month'), '9월');
}

console.log('\n시나리오 4-2 — 흐름: 어느 성경이 늘고 줄었나');
{
  // 8주 구간. 최근 4주(마태 3) vs 이전 4주(마태 1) → 마태가 +2
  setVerses([
    V('마태복음 1:1', '가', '', [], '2026-07-15'),   // 이전 절반
    V('마태복음 1:2', '가', '', [], '2026-08-31'),   // 최근 절반
    V('마태복음 1:3', '가', '', [], '2026-09-01'),
    V('마태복음 1:4', '가', '', [], '2026-09-02'),
    V('로마서 8:1', '나', '', [], '2026-07-16'),     // 이전 절반
    V('로마서 8:2', '나', '', [], '2026-07-17'),
    V('시편 23:1', '다', '', [], '2020-01-01')       // 구간 밖 — 세지 않는다
  ]);
  ST.settings.vTrPref = { kind: 'home', axis: 'book', tab: 'all', unit: 'week', span: 8, form: 'line', off: [] };
  const d = D._vTrData();
  sc.eq('칸이 8개', d.keys.length, 8);
  const mat = d.all.find(s => s.key === '마태복음');
  const rom = d.all.find(s => s.key === '로마서');
  sc.eq('마태복음 4건', mat.total, 4);
  sc.eq('로마서 2건', rom.total, 2);
  sc.eq('구간 밖 시편은 아예 없다', d.all.some(s => s.key === '시편'), false);
  sc.eq('많은 것이 먼저', d.all[0].key, '마태복음');

  const ins = D._vTrInsight(d);
  sc.eq('절반씩 견준다 — 최근 4주', ins.half, 4);
  const rMat = ins.rows.find(r => r.key === '마태복음');
  const rRom = ins.rows.find(r => r.key === '로마서');
  sc.eq('마태복음 최근 3 / 이전 1 → +2', [rMat.late, rMat.prev, rMat.diff], [3, 1, 2]);
  sc.eq('로마서 최근 0 / 이전 2 → -2', [rRom.late, rRom.prev, rRom.diff], [0, 2, -2]);
  sc.eq('가장 많이 는 것을 짚어 준다', ins.html.includes('<b>마태복음</b>'), true);
  sc.eq('가장 많이 준 것도 짚어 준다', ins.html.includes('<b>로마서</b>'), true);
}

console.log('\n시나리오 4-3 — 흐름: 갈래(말씀/명제)로 가른다');
{
  setVerses([
    V('마태복음 1:1', '가', '', [], '2026-09-01'),
    V('마태복음 5:3', '설교', '', [], '2026-09-01', { pid: 'P1', books: ['마태복음'] })
  ]);
  ST.settings.vTrPref = { kind: 'home', axis: 'book', tab: 'all', unit: 'week', span: 8, form: 'line', off: [] };
  sc.eq('전체는 둘 다', D._vTrData().all[0].total, 2);
  ST.settings.vTrPref.tab = 'verse';
  sc.eq('말씀만 하나', D._vTrData().all[0].total, 1);
  ST.settings.vTrPref.tab = 'prop';
  sc.eq('명제만 하나', D._vTrData().all[0].total, 1);
  ST.settings.vTrPref.tab = 'all';
}

console.log('\n시나리오 4-4 — 흐름: 그래프가 실제로 그려진다');
{
  const keys = ['2026-08-16', '2026-08-23', '2026-08-30'];
  const ser = [{ key: '마태복음', vals: [1, 2, 3], total: 6 }, { key: '로마서', vals: [2, 0, 1], total: 3 }];
  const line = D._vTrChartSVG(keys, ser, 'week', 'line', 520);
  sc.eq('선 그래프는 polyline 두 줄', (line.match(/<polyline/g) || []).length, 2);
  sc.eq('점도 찍는다(칸이 적을 때)', line.includes('<circle'), true);
  const area = D._vTrChartSVG(keys, ser, 'week', 'area', 520);
  sc.eq('비중 그래프는 polygon 두 장', (area.match(/<polygon/g) || []).length, 2);
  sc.eq('비중에는 100% 눈금', area.includes('100%'), true);
  sc.eq('선이 하나도 없으면 안내 글', D._vTrChartSVG(keys, [], 'week', 'line', 520).includes('보여줄 선이 없어요'), true);
}

console.log('\n시나리오 5 — 홑따옴표가 든 이름도 onclick 을 깨뜨리지 않는다');
{
  sc.eq("' 를 피한다", D._vDashQ("빌'립"), "빌\\'립");
  sc.eq('" 는 속성용으로 피한다', D._vDashQ('빌"립'), '빌&quot;립');
  sc.eq('역슬래시도 피한다', D._vDashQ('빌\\립'), '빌\\\\립');
}

console.log('\n시나리오 6 — 화면 쪽 표시 (index.html 원본에서 확인)');
{
  // 제목열: 좁히고 가로 스크롤에도 붙여 둔다
  sc.eq('제목열 폭을 40px 로 고정', SRC.includes('grid-template-columns:40px repeat(4,minmax(116px,1fr))'), true);
  sc.eq('행 제목이 왼쪽에 붙는다(sticky)', /\.vdash-rowhd\{[^}]*position:sticky;left:0/.test(SRC.replace(/\n\s*/g, '')), true);
  sc.eq('열 제목은 위에 붙는다(sticky)', /\.vdash-hd\{[^}]*position:sticky;top:0/.test(SRC.replace(/\n\s*/g, '')), true);
  sc.eq('모서리 칸도 붙는다', SRC.includes('.vdash-corner{position:sticky;left:0;top:0'), true);
  sc.eq("예전의 min-width:600px 은 없앴다", SRC.includes('.vdash-grid{display:grid;grid-template-columns:auto'), false);

  // 상세 팝업: 밀어 넘길 겹 + 자리 점
  sc.eq('상세 팝업에 밀어 넘길 겹이 있다', SRC.includes('id="vDashDetailSlide"'), true);
  sc.eq('상세 팝업에 자리 점판이 있다', SRC.includes('id="vDashDetailDots"'), true);
  sc.eq('스와이프를 붙인다', SRC.includes('_initVDashDetailSwipe()'), true);
  sc.eq('세로 스와이프는 목록 끝에서만', SRC.includes('const atBot=!b||(b.scrollTop+b.clientHeight)>=(b.scrollHeight-1);'), true);
  sc.eq('양 끝 순환은 설정값 loopViews 를 그대로 쓴다',
        /_vDashDetailGo[\s\S]{0,400}ST\.settings\.loopViews===true/.test(SRC), true);
  sc.eq('PC 는 화살표로도 옮긴다', SRC.includes('function _vDashDetailKey(e){'), true);

  // 현재 말씀 모음 팝업의 파이 넉 장
  sc.eq('목록 팝업에 파이 자리가 있다', SRC.includes('class="vlist-pies" id="verseListPies"'), true);
  sc.eq('열 때 그린다', /function openVerseListModal\(\)\{[\s\S]{0,300}renderVerseListPies\(\);/.test(SRC), true);
  sc.eq('좁은 폰에서는 옆으로 민다', /\.vlist-pies\{[^}]*overflow-x:auto/.test(SRC.replace(/\n\s*/g, '')), true);
  sc.eq('대시보드와 같은 수치를 쓴다', /function renderVerseListPies[\s\S]{0,400}_vDashEntries\('home'\)/.test(SRC), true);

  // 전체화면이 덮는 화면 — 이름표가 아니라 클래스로 훑는다
  sc.eq('클래스로 훑는 목록이 있다',
        SRC.includes("const _VF_COVER_SEL='.event-modal-overlay,.event-modal,.task-menu-overlay,.task-menu,#collEditPage'"), true);
  sc.eq('그 목록으로 실제로 훑는다', SRC.includes('document.querySelectorAll(_VF_COVER_SEL).forEach'), true);
  sc.eq('손으로 적던 팝업 이름표는 없앴다', SRC.includes("[['vDashDetailOverlay','vDashDetailModal'],['vDashOverlay','vDashModal'],"), false);
  sc.eq('전체화면을 열 때 여전히 부른다', /function openVerseFull\(keepOverride\)\{[\s\S]{0,600}_vfHideCoversNow\(\);/.test(SRC), true);

  // 되돌아갈 화면을 통째로 적어 둔다
  sc.eq('대시보드가 떠 있었는지도 적는다', /_vDashMarkReturn[\s\S]{0,400}shown\('vDashModal'\)/.test(SRC), true);
  sc.eq('목록 팝업도 적는다', /_vDashMarkReturn[\s\S]{0,400}shown\('verseListModal'\)/.test(SRC), true);
  sc.eq('대시보드를 안 열었으면 다시 열지 않는다', /_vDashMaybeReturn[\s\S]{0,300}if\(r\.dash\)openVerseDashboard\(\);/.test(SRC), true);

  // 위쪽 전환과 흐름
  sc.eq('분포 ⇄ 흐름 전환이 있다', SRC.includes('id="vDashViewTabs"'), true);
  sc.eq("전환 값은 두 가지", SRC.includes("const _VDASH_VIEWS=[['pie','분포'],['trend','흐름']];"), true);
  sc.eq('흐름을 그리는 곳이 있다', SRC.includes('function renderVDashTrend(){'), true);
  sc.eq('기간 칩은 분포에서만', /per\.style\.display=view==='pie'\?'flex':'none';/.test(SRC), true);
}

sc.done();
