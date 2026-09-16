// 따로 포함(plus) — 동기화로 새로 들어온 말씀을 필터를 건드리지 않고 통과시키는 쪽문.
// ⚠️ 데이터 계층(필터·동기화)을 건드리므로 시나리오를 먼저 쓴다 (CLAUDE.md 규칙).
const { slice, SRC, makeScorer } = require('./_load');
const sc = makeScorer();

global._calKey = () => '2026-09-16';
global.z = n => String(n).padStart(2, '0');
global.todayKey = () => '2026-09-16';
global.logicalNow = () => new Date(2026, 8, 16);
global.ST = { settings: {} };
global.rawSave = () => {};
global.save = () => {};

// 필터 계층 — 성경책 이름 표는 훨씬 아래에 있어 먼저 깔아 둔다
global._BOOK_CANON_MAP = null;
global.BIBLE_ORDER_OT = ['창세기','시편','이사야'];
global.BIBLE_ORDER_NT = ['마태복음','마가복음','요한복음','고린도전서'];
eval(slice('const _REF_ABBR2FULL=', "'계':'요한계시록'};") + "'계':'요한계시록'};");
eval(slice('function _getCollFilter(', 'function _bookCanon('));
eval(slice('function _bookCanon(', '// 구약 다음 신약'));
eval(slice('function _collVersePassesFilter(', '\n// ── 현재 켜진 말씀 모음'));
eval(slice('function _vListRange(', 'const _VL_PERIODS'));
// 동기화 병합
global._looksLikeRef = () => true;
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm('));

let COLLS = [];
global.getVerseCollections = () => COLLS;
global.findColl = id => COLLS.find(c => c.id === id);
global.NAVIGATOR_VERSES = [];

function mkColl(){
  return {id:'c1',name:'설교 노트',google:[{id:'g1',url:'x'}],verses:[
    {cat:'주일예배',topic:'용서',krText:'본문1',ref:'마태복음 7:1',tags:[],src:'google',gid:'g1',d:'2026-09-06'},
    {cat:'주일예배',topic:'믿음',krText:'본문2',ref:'마가복음 9:23',tags:[],src:'google',gid:'g1',d:'2026-09-06'},
    {cat:'새벽기도',topic:'감사',krText:'본문3',ref:'시편 103:2',tags:[],src:'google',gid:'g1',d:'2026-09-06'},
  ]};
}
function setup(filter){
  COLLS = [mkColl()];
  ST.settings = {collFilters:{c1:Object.assign(
    {mode:'all',cats:[],topics:[],books:[],tags:[],plus:[],period:'all',pFrom:'',pTo:''},filter||{})}};
  return COLLS[0];
}
const visibleRefs = id => _collFilteredVerses(id).map(v=>v.ref);

// ═══ 1. 쪽문이 없으면 예전과 한 글자도 다르지 않다 ═══
console.log('시나리오 1 — plus 가 비어 있으면 예전 동작 그대로');
{
  setup({});
  sc.eq('필터 없음 → 전부 보인다', visibleRefs('c1').length, 3);
  setup({cats:['주일예배']});
  sc.eq('대분류 하나 골랐을 때', visibleRefs('c1'), ['마태복음 7:1','마가복음 9:23']);
  setup({cats:['주일예배'],topics:['용서']});
  sc.eq('두 축 교집합', visibleRefs('c1'), ['마태복음 7:1']);
}

// ═══ 2. 쪽문은 그 구절만 통과시킨다 (부작용 없음) ═══
console.log('\n시나리오 2 — 쪽문은 정확히 그 구절만 통과시킨다');
{
  const c = setup({cats:['주일예배']});
  const key = _verseIdentity('시편 103:2','새벽기도','감사','');
  ST.settings.collFilters.c1.plus = [key];
  sc.eq('새벽기도 구절만 더해진다', visibleRefs('c1'), ['마태복음 7:1','마가복음 9:23','시편 103:2']);
  // 대분류 축에 '새벽기도'를 더하는 것과 달리, 다른 새벽기도 구절은 안 딸려온다
  c.verses.push({cat:'새벽기도',topic:'옛것',krText:'옛본문',ref:'시편 1:1',tags:[],src:'google',gid:'g1',d:'2025-01-01'});
  sc.eq('같은 대분류의 옛 구절은 그대로 숨은 채',
        visibleRefs('c1').includes('시편 1:1'), false);
}

// ═══ 3. 기간 밖이어도 쪽문은 통과한다 ═══
console.log('\n시나리오 3 — 기간 밖·성경권 없음도 쪽문이 통과시킨다');
{
  const c = setup({period:'week'});
  c.verses.forEach(v=>v.d='2025-01-01');           // 전부 기간 밖
  sc.eq('기간 밖이라 아무것도 안 보인다', visibleRefs('c1').length, 0);
  ST.settings.collFilters.c1.plus = [_verseIdentity('시편 103:2','새벽기도','감사','')];
  sc.eq('쪽문 하나만 통과', visibleRefs('c1'), ['시편 103:2']);
}
{
  // 성경권으로 걸러 둔 상태에서 성경권을 알 수 없는 명제
  const c = setup({books:['마태복음']});
  c.verses.push({cat:'명제',topic:'1부',krText:'명제본문',ref:'',pid:'P0001',kind:'prop',tags:[],src:'google',gid:'g1',d:''});
  sc.eq('성경권 필터가 명제를 막는다', visibleRefs('c1'), ['마태복음 7:1']);
  ST.settings.collFilters.c1.plus = [_verseIdentity('','명제','1부','P0001')];
  sc.eq('쪽문이 명제를 통과시킨다', _collFilteredVerses('c1').filter(v=>v.pid==='P0001').length, 1);
}

// ═══ 4. 뒷처리 — 칩으로 바꿀 수 있으면 바꾸고 쪽문을 비운다 ═══
console.log('\n시나리오 4 — 뒷처리(_plusTidy)');
eval(slice('function _plusKeyOf(', '\n// ── 현재 켜진 말씀 모음'));
{
  // 통째로 새 대분류: 그 값의 구절이 전부 쪽문에 있으면 칩으로 흡수된다
  const c = setup({cats:['주일예배']});
  c.verses.push({cat:'특별새벽',topic:'새주제',krText:'새본문',ref:'요한복음 1:1',tags:[],src:'google',gid:'g1',d:'2026-09-16'});
  const f = ST.settings.collFilters.c1;
  f.plus = [_verseIdentity('요한복음 1:1','특별새벽','새주제','')];
  const before = visibleRefs('c1').slice().sort();
  _plusTidy('c1');
  sc.eq('칩으로 흡수됐다', f.cats.includes('특별새벽'), true);
  sc.eq('쪽문은 비었다', f.plus.length, 0);
  sc.eq('보이는 것은 그대로', visibleRefs('c1').slice().sort(), before);
}
{
  // 이미 옛 구절이 있는 대분류면 흡수하면 안 된다 (옛 구절이 딸려오므로)
  const c = setup({cats:['주일예배']});
  const f = ST.settings.collFilters.c1;
  f.plus = [_verseIdentity('시편 103:2','새벽기도','감사','')];
  c.verses.push({cat:'새벽기도',topic:'옛것',krText:'옛본문',ref:'시편 1:1',tags:[],src:'google',gid:'g1',d:'2025-01-01'});
  _plusTidy('c1');
  sc.eq('흡수하지 않는다', f.cats.includes('새벽기도'), false);
  sc.eq('쪽문이 남는다', f.plus.length, 1);
  sc.eq('옛 구절은 여전히 숨은 채', visibleRefs('c1').includes('시편 1:1'), false);
}
{
  // ⚠️ 선택이 **하나도 없는 축**은 '제한 없음'이다. 값을 더하면 오히려 좁아진다.
  const c = setup({});                       // 아무것도 안 고른 상태
  const f = ST.settings.collFilters.c1;
  f.period='week'; c.verses.forEach(v=>v.d='2025-01-01');
  f.plus = [_verseIdentity('시편 103:2','새벽기도','감사','')];
  _plusTidy('c1');
  sc.eq('빈 축에는 값을 더하지 않는다', f.cats.length, 0);
  sc.eq('쪽문은 남아 있다', f.plus.length, 1);
}

// ═══ 5. 동기화가 새로 넣은 구절의 열쇠를 돌려준다 ═══
console.log('\n시나리오 5 — 동기화가 addedKeys 를 돌려준다');
{
  const c = setup({});
  const items=[
    {cat:'주일예배',topic:'용서',krText:'본문1',ref:'마태복음 7:1',tags:[],d:'2026-09-06'}, // 기존
    {cat:'새벽기도',topic:'감사',krText:'본문3',ref:'시편 103:2',tags:[],d:'2026-09-06'},   // 기존
    {cat:'주일예배',topic:'믿음',krText:'본문2',ref:'마가복음 9:23',tags:[],d:'2026-09-06'},// 기존
    {cat:'특별새벽',topic:'새주제',krText:'새본문',ref:'요한복음 1:1',tags:[],d:'2026-09-16'}, // 새것
  ];
  const r=_syncSheetVersesIntoColl(c,items,{kind:'google',gid:'g1'});
  sc.eq('하나만 추가', r.added, 1);
  sc.eq('열쇠를 돌려준다', Array.isArray(r.addedKeys), true);
  sc.eq('추가된 것의 열쇠만', r.addedKeys, [_verseIdentity('요한복음 1:1','특별새벽','새주제','')]);
}

// ═══ 6. 시트에서 소주제가 바뀌어도 쪽문이 따라간다 ═══
console.log('\n시나리오 6 — 구절이 수정되면 쪽문 열쇠도 따라간다');
{
  const c = setup({cats:['주일예배']});
  const f = ST.settings.collFilters.c1;
  const oldKey=_verseIdentity('시편 103:2','새벽기도','감사','');
  f.plus=[oldKey];
  // 시트에서 같은 장절의 소주제가 '감사' → '찬양' 으로 바뀐다
  const items=[
    {cat:'주일예배',topic:'용서',krText:'본문1',ref:'마태복음 7:1',tags:[],d:'2026-09-06'},
    {cat:'주일예배',topic:'믿음',krText:'본문2',ref:'마가복음 9:23',tags:[],d:'2026-09-06'},
    {cat:'새벽기도',topic:'찬양',krText:'본문3',ref:'시편 103:2',tags:[],d:'2026-09-06'},
  ];
  _syncSheetVersesIntoColl(c,items,{kind:'google',gid:'g1'});
  const newKey=_verseIdentity('시편 103:2','새벽기도','찬양','');
  sc.eq('열쇠가 새 값으로 바뀌었다', f.plus, [newKey]);
  sc.eq('그 구절이 계속 보인다', visibleRefs('c1').includes('시편 103:2'), true);
}

// ═══ 7. 휴지통·삭제된 구절의 열쇠는 조용히 걷힌다 ═══
console.log('\n시나리오 7 — 사라진 구절의 열쇠는 쌓이지 않는다');
{
  const c = setup({cats:['주일예배']});
  const f = ST.settings.collFilters.c1;
  f.plus=[_verseIdentity('시편 103:2','새벽기도','감사',''),'없는열쇠xy'];
  _plusPrune('c1');
  sc.eq('짝 없는 열쇠는 걷힌다', f.plus.length, 1);
  c.verses.find(v=>v.ref==='시편 103:2').del='simple';   // 휴지통으로
  _plusPrune('c1');
  sc.eq('휴지통 간 구절의 열쇠도 걷힌다', f.plus.length, 0);
}

// ═══ 8. 구성 묶음 — 대분류 > 소주제 ═══
console.log('\n시나리오 8 — 따로 포함한 목록의 구성');
{
  const c = setup({cats:['주일예배']});
  const f = ST.settings.collFilters.c1;
  c.verses.push({cat:'명제',topic:'1부',krText:'명제본문',ref:'',pid:'P0001',kind:'prop',tags:[],src:'google',gid:'g1',d:''});
  f.plus=[_verseIdentity('시편 103:2','새벽기도','감사',''),_verseIdentity('','명제','1부','P0001')];
  const g=_plusGroups('c1');
  sc.eq('대분류 두 갈래', g.length, 2);
  sc.eq('각각의 개수', g.map(x=>x.n), [1,1]);
  sc.eq('소주제까지 묶인다', g[0].topics[0].key, '감사');
  sc.eq('명제 갈래를 표시한다', g.find(x=>x.key==='명제').isProp, true);
}

// ═══ 9. 화면 배선 (문구·자리) ═══
console.log('\n시나리오 9 — 화면에 실제로 붙어 있는가');
{
  sc.eq('말풍선 문구', SRC.includes('보여주는 현재 말씀모음 목록에 아직 포함 안되었어요'), true);
  sc.eq('버튼 문구', SRC.includes('구절 포함시키기'), true);
  sc.eq('누른 뒤 문구', SRC.includes('구절이 이제 포함되었어요'), true);
  sc.eq('되돌린 뒤 문구', SRC.includes('되돌렸어요'), true);
  sc.eq('버튼 아래 작은 줄', SRC.includes('전체화면 · 상단말씀 · 알림에 함께 나와요'), true);
  sc.eq('설정창 표시', SRC.includes('따로 포함'), true);
  sc.eq('팝업 이름', SRC.includes('따로 포함한 목록'), true);
  sc.eq('모두 제외', SRC.includes('모두 제외'), true);
  sc.eq('ESC 표에 등록', SRC.includes("['plusListModal'"), true);
  // 따라오는 이름줄 — 그라데이션 아래 바탕색을 한 겹 더 깔아야 칩이 비치지 않는다
  sc.eq('이름줄이 따라온다(sticky)', /\.cf-name\{[^}]*position:sticky/.test(SRC), true);
  sc.eq('밴드 뒤에 바탕색 한 겹', /\.cf-name\{[^}]*var\(--s1\)/.test(SRC), true);
  sc.eq('색 띠가 그룹 전체를 감싼다', /\.coll-filter-panel\{[^}]*border-left/.test(SRC), true);
}

sc.done();
