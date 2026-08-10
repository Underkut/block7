// 말씀카드 위젯 (v26-0810-1)
//
// · 다른 위젯은 "타입 하나 = 위젯 하나"라 _lay() 가 중복을 지운다.
//   말씀카드는 개수 제한이 없어야 해서 'card#<id>' 인스턴스로 들어간다.
//   → 중복 제거(seen)가 카드에는 걸리지 않아야 한다. 여기가 이 기능의 핵심이다.
// · 카드 설정(배경·글자 크기)은 위젯 하나하나마다 따로 산다.
// · 목록 ↔ 카드를 오갈 때 그 설정이 사라지면 안 된다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 바깥 세계 흉내내기 (카드 코드가 부르는 것들만) ──
global.ST = { settings: {} };
global.save = () => {};
global.VF_PATTERNS = {
  night: { label: '심야', font: 'sans', fw: 300, grain: .13, vig: .55, ls: '0', ang: 165,
           variants: [{ bg: ['#0B1426'], tx: '#E4EAF4', ac: '#7DA2FF' },
                      { bg: ['#0A1A12'], tx: '#E2EFE6', ac: '#4ADE9A' }] },
  ink:   { label: '먹지', font: 'serif', fw: 400, grain: .34, vig: .22, ls: '.01em', ang: 170,
           variants: [{ bg: ['#F3EEE4'], tx: '#1B1815', ac: '#8C3A2B' }] },
};
global.VF_THEME_ORDER = ['ink', 'night'];
global.VF_SERIF = "'Gowun Batang',serif";
global.VF_SANS = 'Pretendard,sans-serif';
global._vfBgCss = t => (t.bg && t.bg.length === 1) ? t.bg[0] : 'grad';
global._rgba = (c, a) => `rgba(${c},${a})`;
global._vfPatternPool = () => ['night'];
global._vfTextScale = () => 1;
// 말씀 모음 전체 = 5개, 지금 보고 있는 것은 3번
global.ACTIVE_VERSES = () => [1, 2, 3, 4, 5].map(i => ({ idx: i, ref: 'R' + i, krText: 't' + i, cat: '', topic: '', tags: [] }));
// 좋아요 목록 = 3개 (최신순)
global._aggEntriesForKind = kind => (kind === 'like'
  ? [{ ref: 'R4' }, { ref: 'R2' }, { ref: 'R5' }]
  : []);
global.verseByRef = ref => ({ idx: +ref.slice(1), ref, krText: 't' + ref, cat: +ref.slice(1) <= 2 ? '가' : '나', topic: '', tags: [] });
// 갈래(필터) pool — 타일뷰와 같은 원천을 쓴다
global._vgRawPool = () => [1, 2, 3, 4, 5].map(i => ({ idx: i, ref: 'R' + i, krText: 't' + i, cat: i <= 2 ? '가' : '나', topic: '', tags: [] }));
global._vgMatch = (v, kind, val) => (kind === 'cat' ? v.cat === val : true);
// 화면을 다시 그리려 할 때 조용히 넘어가게
global.document = { querySelector: () => null, getElementById: () => null };
global.renderRightPanel = () => {};

eval(
  slice('const RP_WIDGET_DEFS={', 'function _rpGetWidgets(') +
  slice('function _lay(){', 'function _colKey(') +
  slice('// ══════ 말씀카드 위젯 = 카드 인스턴스 모델 ══════', '// ══════ 말씀카드 위젯 끝 ══════') +
  ';Object.assign(globalThis,{_lay,_vcIs,_vcIdOf,_vcAll,_vcGet,_vcCreate,_vcRemove,_vcNewId,' +
  '_rpWidgetName,_rpTypeOk,_vcVerses,_vcCurrent,_vcHash,_vcPatternKey,_vcThemeVars,_vcTextScale,' +
  '_rpVCardH,_rpSetVCardH,_vcShow,_vcShowFor,_vcUnplacedForKind,_vcFilterLabel,vcNav,_vcApplyNav,vcClearFilter,vcAddCard,_rpChipName,_vcCurX,_VC_SHOW_GROUP,VC_NEW,VC_KINDS});'
);

const reset = () => {
  ST.settings = { layout: { bp2: 600, bp3: 900, weekly: 'none', cols: { left: ['todo'], center: [], right: [] }, c3: [.34, .3] } };
};

// ═══ 1. cols 항목 알아보기 ═══
console.log('시나리오 1 — cols 안의 카드 항목');
{
  sc.eq("'card#c1' 은 카드", _vcIs('card#c1'), true);
  sc.eq("'likeList' 는 카드가 아니다", _vcIs('likeList'), false);
  sc.eq('빈 값도 안전', _vcIs(null), false);
  sc.eq('id 를 떼어낸다', _vcIdOf('card#c7'), 'c7');
  sc.eq('카드가 아니면 빈 문자열', _vcIdOf('todo'), '');
}

// ═══ 2. 카드 설정 만들고 지우기 ═══
console.log('\n시나리오 2 — 카드 설정 만들기·지우기');
{
  reset();
  const a = _vcCreate('like', 'likeList');
  const b = _vcCreate(null, null);
  sc.eq('id 가 서로 다르다', a !== b, true);
  sc.eq('반응 카드', _vcGet(a).kind, 'like');
  sc.eq('일반 카드는 kind 가 없다', _vcGet(b).kind, null);
  sc.eq('모르는 반응은 일반 카드로', _vcGet(_vcCreate('없는것')).kind, null);
  sc.eq('처음엔 자리를 지정하지 않는다(자동)', _vcGet(a).ref, null);
  sc.eq('처음엔 갈래가 없다', _vcGet(a).filter, null);
  sc.eq('배경·글자 크기는 처음엔 안 정해져 있다',
        [_vcGet(a).theme, _vcGet(a).textScale], [null, null]);

  ST.settings.rpWidgetHeights = { ['card#' + a]: 300 };
  _vcRemove(a);
  sc.eq('지우면 설정이 사라진다', _vcGet(a), null);
  sc.eq('지우면 높이 기억도 함께 사라진다', ST.settings.rpWidgetHeights['card#' + a], undefined);
  sc.eq('없는 id 를 물어도 안전', _vcGet('없음'), null);
}

// ═══ 3. ⚠️ 같은 종류를 여러 개 — 중복 제거가 카드에는 안 걸린다 ═══
console.log('\n시나리오 3 — 카드는 여러 개 놓을 수 있다');
{
  reset();
  const a = _vcCreate('like', 'likeList'), b = _vcCreate('like', 'likeList'), c = _vcCreate(null, null);
  ST.settings.layout.cols.right = ['card#' + a, 'card#' + b, 'card#' + c];
  const L = _lay();
  sc.eq('좋아요 카드 2개 + 일반 카드가 모두 살아남는다', L.cols.right.length, 3);

  // 반대로 타입 위젯은 여전히 하나만 남는다
  reset();
  ST.settings.layout.cols.right = ['likeList', 'likeList', 'memList'];
  sc.eq('타입 위젯은 지금처럼 중복이 지워진다', _lay().cols.right, ['likeList', 'memList']);

  // 컬럼이 달라도 타입 위젯은 하나만
  reset();
  ST.settings.layout.cols.center = ['likeList'];
  ST.settings.layout.cols.right = ['likeList'];
  const L2 = _lay();
  sc.eq('컬럼이 달라도 타입은 하나만', [L2.cols.center, L2.cols.right], [['likeList'], []]);

  // 설정이 없어진 카드는 걸러 낸다 (기기 간 동기화로 어긋날 수 있다)
  reset();
  const d = _vcCreate(null, null);
  ST.settings.layout.cols.right = ['card#' + d, 'card#유령'];
  sc.eq('설정 없는 카드는 화면에서 뺀다', _lay().cols.right, ['card#' + d]);
}

// ═══ 4. 카드가 도는 범위 ═══
console.log('\n시나리오 4 — 그 카드가 도는 범위 (필터는 덜어낸다)');
{
  reset();
  ST.settings.verseCurrentIdx = 3;
  const gen = { kind: null, ref: null }, lst = { kind: 'like', ref: null };

  sc.eq('일반 카드는 말씀 모음 전체', _vcVerses(gen).length, 5);
  sc.eq('목록 카드는 그 반응 목록 안', _vcVerses(lst).map(v => v.ref), ['R4', 'R2', 'R5']);

  sc.eq('일반 카드는 자동이면 오늘의 구절', _vcCurrent(gen).ref, 'R3');
  sc.eq('목록 카드는 자동이면 목록 맨 앞', _vcCurrent(lst).ref, 'R4');
  sc.eq('자리를 적어 두면 그 말씀', _vcCurrent({ kind: null, ref: 'R5' }).ref, 'R5');
  sc.eq('목록에서 사라진 자리는 다시 자동으로',
        _vcCurrent({ kind: 'like', ref: 'R1' }).ref, 'R4');

  sc.eq('기록이 없으면 보여줄 것이 없다', _vcCurrent({ kind: 'mem', ref: null }), null);
  sc.eq('설정이 없으면 빈 목록', _vcVerses(null), []);

  // ⚠️ 필터는 원래 범위를 **덜어낸다** (갈아치우지 않는다)
  // 좋아요 목록 = R4,R2,R5 이고 '가' 는 R1,R2 뿐이므로 교집합은 R2 하나
  const flt = { kind: 'like', filter: { kind: 'cat', val: '가' }, ref: null };
  sc.eq('목록카드 + 필터 = 교집합', _vcVerses(flt).map(v => v.ref), ['R2']);
  sc.eq('교집합 카드는 자동이면 맨 앞', _vcCurrent(flt).ref, 'R2');
  // 일반카드는 말씀 모음 전체에서 그 필터만
  const gf = { kind: null, filter: { kind: 'cat', val: '가' }, ref: null };
  sc.eq('일반카드 + 필터', _vcVerses(gf).map(v => v.ref), ['R1', 'R2']);
  sc.eq('필터가 비면 걸린 게 없는 것', _vcVerses({ kind: 'like', filter: { kind: 'cat', val: '' } }).length, 3);
  sc.eq('필터 이름', _vcFilterLabel(flt), '가');
  sc.eq('태그 필터는 # 을 붙인다', _vcFilterLabel({ filter: { kind: 'tag', val: '사랑' } }), '#사랑');
  sc.eq('필터가 없으면 이름도 없다', _vcFilterLabel({ filter: null }), '');
}

// ═══ 4-B. ⚠️ 한 카드를 넘겨도 다른 카드는 꿈쩍하지 않는다 ═══
console.log('\n시나리오 4-B — 카드끼리 서로를 건드리지 않는다');
{
  reset();
  ST.settings.verseCurrentIdx = 3;
  const a = _vcCreate(null, null), b = _vcCreate(null, null);
  sc.eq('둘 다 같은 말씀에서 시작', [_vcCurrent(_vcGet(a)).ref, _vcCurrent(_vcGet(b)).ref], ['R3', 'R3']);

  vcNav(a, 1);
  sc.eq('넘긴 카드만 다음 말씀', _vcCurrent(_vcGet(a)).ref, 'R4');
  sc.eq('손대지 않은 카드는 그대로', _vcCurrent(_vcGet(b)).ref, 'R3');
  sc.eq('자리는 장절로 적어 둔다', _vcGet(a).ref, 'R4');

  vcNav(a, -1); vcNav(a, -1);
  sc.eq('뒤로 넘기면 앞의 말씀', _vcCurrent(_vcGet(a)).ref, 'R2');
  sc.eq('여전히 다른 카드는 그대로', _vcCurrent(_vcGet(b)).ref, 'R3');

  // 끝에서 한 바퀴
  _vcGet(a).ref = 'R5'; vcNav(a, 1);
  sc.eq('마지막에서 넘기면 처음으로', _vcGet(a).ref, 'R1');
  _vcGet(a).ref = 'R1'; vcNav(a, -1);
  sc.eq('처음에서 뒤로 넘기면 마지막으로', _vcGet(a).ref, 'R5');

  // 갈래를 풀면 자동으로 돌아온다
  const c = _vcCreate(null, null);
  _vcGet(c).filter = { kind: 'cat', val: '가' }; _vcGet(c).ref = 'R2';
  vcClearFilter(c);
  sc.eq('필터를 풀면 필터도 자리도 지워진다', [_vcGet(c).filter, _vcGet(c).ref], [null, null]);
  sc.eq('풀고 나면 다시 오늘의 구절', _vcCurrent(_vcGet(c)).ref, 'R3');
}

// ═══ 4-C. ⚠️ 같은 카드가 두 번 놓이지 않는다 ═══
console.log('\n시나리오 4-C — 같은 카드가 두 번 놓이면 함께 넘어간다');
{
  reset();
  const a = _vcCreate(null, null);
  ST.settings.layout.cols.center = ['card#' + a];
  ST.settings.layout.cols.right = ['card#' + a];
  const L = _lay();
  sc.eq('같은 id 는 한 자리만 남긴다',
        [L.cols.center, L.cols.right], [['card#' + a], []]);

  reset();
  const b = _vcCreate(null, null);
  ST.settings.layout.cols.right = ['card#' + b, 'card#' + b];
  sc.eq('한 컬럼 안에서도 마찬가지', _lay().cols.right, ['card#' + b]);
}

// ═══ 4-D. '사용 안 함'의 말씀카드 칩 = 만들기 버튼 ═══
console.log("\n시나리오 4-D — '말씀카드' 칩은 끌어다 놓아도 그 자리에 남는다");
{
  reset();
  sc.eq('칩은 설정이 없는 카드 표식', [_vcIs(VC_NEW), _vcGet(_vcIdOf(VC_NEW))], [true, null]);
  sc.eq('칩 이름', _rpChipName(VC_NEW), '말씀카드');

  // 끌어다 놓으면 진짜 카드가 하나 생긴다
  const id1 = vcAddCard('right');
  sc.eq('컬럼에 새 카드', ST.settings.layout.cols.right, ['card#' + id1]);
  const id2 = vcAddCard('right', 0);
  sc.eq('개수 제한이 없다 — 자리를 골라 또 넣는다',
        ST.settings.layout.cols.right, ['card#' + id2, 'card#' + id1]);
  sc.eq('둘은 서로 다른 카드', id1 !== id2, true);

  // 칩 자체가 실수로 cols 에 남아도 화면에 나오지 않는다
  reset();
  ST.settings.layout.cols.right = [VC_NEW];
  sc.eq('만들기 칩은 배치로 남지 않는다', _lay().cols.right, []);

  // 목록 위젯 칩은 '목록'을 뺀 짧은 이름
  sc.eq('좋아요 목록 → 좋아요', _rpChipName('likeList'), '좋아요');
  sc.eq('암송 목록 → 암송', _rpChipName('memList'), '암송');
  sc.eq('Deeper 목록 → Deeper', _rpChipName('deeperList'), 'Deeper');
  sc.eq('Even Deeper 목록 → Even Deeper', _rpChipName('evenList'), 'Even Deeper');
  sc.eq('그 밖은 그대로', _rpChipName('monthSingle'), '월간 싱글뷰');
}

// ═══ 5. 배경·글자 크기는 카드마다 따로 ═══
console.log('\n시나리오 5 — 위젯 하나하나마다의 배경·글자 크기');
{
  reset();
  sc.eq('안 정하면 전체화면 설정을 따라간다', _vcPatternKey({ theme: null }, 'R1'), 'night');
  sc.eq('정하면 그 패턴', _vcPatternKey({ theme: 'ink' }, 'R1'), 'ink');
  sc.eq('없는 패턴을 적어 놓았으면 다시 전체화면으로', _vcPatternKey({ theme: '없음' }, 'R1'), 'night');

  // 색 변형은 장절에서 계산한다 — 다시 그릴 때마다 깜빡이면 안 된다
  const a1 = _vcThemeVars({ theme: 'night' }, 'R1')['vars']['--vf-tx'];
  const a2 = _vcThemeVars({ theme: 'night' }, 'R1')['vars']['--vf-tx'];
  sc.eq('같은 말씀이면 늘 같은 색', a1, a2);
  sc.eq('해시는 늘 같은 값', _vcHash('요한복음 1:1'), _vcHash('요한복음 1:1'));
  sc.eq('해시는 음수가 아니다', _vcHash('창세기 1:1') >= 0, true);

  sc.eq('글자 크기를 안 정하면 전체화면 값', _vcTextScale({ textScale: null }), 1);
  sc.eq('정하면 그 값', _vcTextScale({ textScale: 0.6 }), 0.6);
  sc.eq('범위 밖이면 전체화면 값으로', _vcTextScale({ textScale: 9 }), 1);
}

// ═══ 6. 카드 높이 ═══
console.log('\n시나리오 6 — 드래그로 정한 카드 높이');
{
  reset();
  sc.eq('안 정했으면 기본 높이', _rpVCardH('c1'), 220);
  _rpSetVCardH('c1', 320);
  sc.eq('정한 높이를 그대로', _rpVCardH('c1'), 320);
  _rpSetVCardH('c1', 10);
  sc.eq('너무 낮으면 최소값으로', _rpVCardH('c1'), 130);
  _rpSetVCardH('c1', 9999);
  sc.eq('너무 높으면 최대값으로', _rpVCardH('c1'), 700);
  sc.eq('다른 카드는 영향 없음', _rpVCardH('c2'), 220);
}

// ═══ 7. 목록 ↔ 카드를 오가도 설정이 남는다 ═══
console.log('\n시나리오 7 — 목록으로 돌아갔다 와도 설정이 살아 있다');
{
  reset();
  const a = _vcCreate('like', 'likeList');
  _vcGet(a).theme = 'ink';
  ST.settings.layout.cols.right = ['card#' + a];
  sc.eq('놓여 있으면 "안 쓰는 설정"이 아니다', _vcUnplacedForKind('like'), null);

  ST.settings.layout.cols.right = ['likeList'];              // 목록으로 되돌린 상태
  sc.eq('빠져 있으면 다시 쓸 설정으로 찾힌다', _vcUnplacedForKind('like'), a);
  sc.eq('그 설정에 배경이 남아 있다', _vcGet(a).theme, 'ink');
  sc.eq('자기 자신은 빼고 찾을 수도 있다', _vcUnplacedForKind('like', a), null);
  sc.eq('다른 반응은 없다', _vcUnplacedForKind('mem'), null);
}

// ═══ 8. 표시 항목 · 위젯 이름 ═══
console.log('\n시나리오 8 — 표시 항목과 이름');
{
  reset();
  sc.eq('값이 없으면 보여준다', _vcShow('verseCardCat'), true);
  ST.settings.verseCardCat = false;
  sc.eq('끄면 안 보여준다', _vcShow('verseCardCat'), false);

  // 카드마다 따로 켜고 끌 수 있다 (말씀설정이 기본값)
  sc.eq('카드가 따로 안 정하면 말씀설정을 따른다', _vcShowFor({ show: {} }, 'verseCardCat'), false);
  sc.eq('카드에서 켜면 켜진다', _vcShowFor({ show: { verseCardCat: true } }, 'verseCardCat'), true);
  ST.settings.verseCardCat = true;
  sc.eq('카드에서 끄면 꺼진다', _vcShowFor({ show: { verseCardCat: false } }, 'verseCardCat'), false);
  sc.eq('show 가 없어도 안전', _vcShowFor({}, 'verseCardCat'), true);
  ST.settings.verseCardCat = true;

  const a = _vcCreate('deeper', 'deeperList'), b = _vcCreate(null, null);
  sc.eq('목록카드 이름', _rpWidgetName('card#' + a), '말씀카드 · Deeper');
  sc.eq('일반카드 이름', _rpWidgetName('card#' + b), '말씀카드');
  sc.eq('기존 위젯 이름은 그대로', _rpWidgetName('likeList'), '좋아요 목록');
  sc.eq('있는 카드', _rpTypeOk('card#' + a), true);
  sc.eq('없는 카드', _rpTypeOk('card#유령'), false);
  sc.eq('있는 타입', _rpTypeOk('memList'), true);
}

// ═══ 9. 화면에 실제로 붙어 있는지 ═══
console.log('\n시나리오 9 — 화면 연결');
{
  sc.eq('목록 위젯 헤더의 카드 전환 버튼', SRC.includes('onclick="vlToCard('), true);
  sc.eq('카드 헤더 우상단 = 목록 복귀', SRC.includes('vcBackToList('), true);
  sc.eq('필터 행 맨 우측 톱니 = 카드 설정', SRC.includes('openVlCardSettings('), true);
  sc.eq('필터 행은 위젯에서만 톱니를 단다', SRC.includes('_vListControlsHTML(kind,true)'), true);
  sc.eq('+ 버튼은 위젯 설정 팝업을 연다', SRC.includes('class="rp-add-btn" onclick="openRpConfig()"'), true);
  sc.eq('+ 버튼 메뉴는 없앴다', SRC.includes('rpAddMenu'), false);
  sc.eq('카드 설정 팝업', SRC.includes('id="vcSetModal"'), true);
  sc.eq('ESC 표에 카드 설정 팝업', SRC.includes("['vcSetModal'"), true);
  // 표시 항목은 카드마다 따로 있으므로 말씀설정에서는 뺐다 (0810-4)
  sc.eq('말씀설정 뷰 탭에는 카드 항목이 없다',
        SRC.includes('setVerseCardCat') || SRC.includes('setVerseCardShare') || SRC.includes('말씀카드에서 보여줄 항목'), false);
  sc.eq('그레인(종이결)이 카드에도 걸린다', SRC.includes('.vc-body::after'), true);
  // 세로로 쌓으면 220px 카드에서 버튼이 높이의 3/4을 먹어 본문이 한 줄만 남았다
  sc.eq('카드 반응 버튼은 가로로 눕힌다', /\.vc-actions\{display:flex;flex-direction:row/.test(SRC), true);
  // 목록에서 연 전체화면은 그 목록 안에서 돌고 상단에 반응 아이콘이 붙는다
  sc.eq('목록 → 전체화면에 반응 종류를 넘긴다', SRC.includes('_vfSetNav(list,Math.max(0,i),_VLIST_KIND_LABEL[kind]||\'\',kind)'), true);
  sc.eq('좌상단 버튼이 목록 복귀로 바뀐다', SRC.includes('function vfHomeAction()'), true);

  // ── 0810-2 에서 손본 것들 ──
  sc.eq('설정 진입은 점 세 개 (톱니가 해처럼 보였다)',
        SRC.includes('const _VC_ICON_MORE=') && !SRC.includes('_VC_ICON_GEAR'), true);
  sc.eq('목록 헤더의 카드 버튼은 빈 정사각형',
        /vlToCard\('\$\{kind\}'\)[\s\S]{0,220}<rect x="3" y="3" width="14" height="14" rx="2\.5"\/><\/svg>/.test(SRC), true);
  // 손가락 화면에서 :hover 가 남아 버튼이 파랗게 굳던 것
  sc.eq('목록 헤더 버튼의 hover 는 마우스 기기에서만',
        SRC.includes('@media (hover:hover){.vl-sort-toggle:hover{color:var(--ac);}}'), true);
  sc.eq('카드 헤더 버튼의 hover 도 마우스 기기에서만',
        SRC.includes('@media (hover:hover){.vc-icbtn:hover{color:var(--ac);}}'), true);
  // 본문이 길면 장절이 '다음 말씀' 버튼(z-index 2) 밑에 깔려 눌리지 않았다
  sc.eq('전체화면 장절을 넘김 버튼 위로', /#vfRef\{[\s\S]*?position:relative;z-index:3;/.test(SRC), true);
  // 타일뷰에서 고른 말씀이 전체화면이 아니라 그 카드로 온다
  sc.eq('타일뷰가 어느 카드에서 왔는지 기억한다', SRC.includes('let _vgCardTarget=null;'), true);
  sc.eq('타일을 고르면 그 카드에 띄운다', SRC.includes('if(_vgCardTarget){'), true);
  sc.eq('나가면 기억을 지운다', /function closeVerseGrid\(\)\{[\s\S]*?_vgCardTarget=null;/.test(SRC), true);
  // 손가락에서 좌우로 밀기 / 마우스에서 화살표
  sc.eq('마우스 기기에만 좌우 화살표', SRC.includes('.vc-arrow{display:none;}'), true);
  sc.eq('화살표가 그 카드만 넘긴다', SRC.includes("vcNav('${id}',-1)") && SRC.includes("vcNav('${id}',1)"), true);
  // 장절을 톡 눌렀을 뿐인데 지난 손가락 위치로 "밀었다"고 본 것
  sc.eq('제스처는 이 카드에서 시작한 것만 센다', SRC.includes('let sx=0,sy=0,moved=false,longFired=false,active=false,dragging=false,axis=0,t=null;'), true);
  // 좋아요·암송 토스트는 어디서 눌러도 한 곳을 지난다
  sc.eq('반응 토스트 한 곳으로', SRC.includes('function _reactWithToast(kind,ref)'), true);
  sc.eq('말씀 메뉴도 아이콘 토스트', SRC.includes("_reactWithToast('like',ref)") && SRC.includes("_reactWithToast('mem',ref)"), true);
  sc.eq('말씀영역 메뉴도 아이콘 토스트', SRC.includes("_reactWithToast('like',_vfCurrentVerse().ref)"), true);
  sc.eq('반응 토스트는 2.5초', SRC.includes('_dismissReactToast(false);},2500)'), true);
  // 카드 설정 팝업 — 테마 · 글자 크기 · 좌하단 · 우하단 · 안내 순서
  const b = SRC.indexOf('function renderVcSettings()');
  const seg = SRC.slice(b, b + 5000);
  const order = ['말씀카드 테마', '말씀카드 글자 크기', '왼쪽 아래 — 필터', '오른쪽 아래 — 말씀 반응', '반응 카운터와 링크 열기는']
    .map(t => seg.indexOf(t));
  sc.eq('설정 팝업 다섯 구역이 이 순서로', order.every((n, i) => n >= 0 && (i === 0 || n > order[i - 1])), true);
  sc.eq('카드마다 좌·우 하단 켜고 끄기', SRC.includes('function setVcShow(id,key,on)'), true);

  // ── 0810-3 ──
  // 손끝을 따라 움직이는 층 (배경은 제자리, 글·버튼만 움직인다)
  sc.eq('밀 때 따라 움직이는 층', SRC.includes('<div class="vc-slide">'), true);
  sc.eq('그 층의 CSS', /\.vc-slide\{display:flex;flex-direction:column;flex:1/.test(SRC), true);
  sc.eq('미는 동안 손끝을 따라 칠한다', SRC.includes('paint(dx*0.85)'), true);
  sc.eq('가로로 밀 때만 페이지를 붙잡는다', SRC.includes("e.preventDefault();                  // 가로로 미는 동안은"), true);
  sc.eq('덜 밀면 제자리로 돌아온다', SRC.includes('const snapBack=()=>{'), true);
  sc.eq('밀던 자리에서 이어서 넘긴다', SRC.includes('function _vcSlideCommit(id,slide,d)'), true);
  // '사용 안 함' 세 줄 + 늘 남아 있는 말씀카드 칩
  sc.eq('만들기 칩 표식', SRC.includes("const VC_NEW='card#+';"), true);
  sc.eq('사용 안 함을 줄로 나눈다', SRC.includes('const poolRows=[') && SRC.includes('class="rp-pool-row"'), true);
  // .rp-cfg-row 는 이미 다른 뜻(테두리 붙는 설정 행)이라 이름을 따로 쓴다
  sc.eq('줄 클래스 이름이 겹치지 않는다', SRC.includes('.rp-pool-row{display:flex'), true);
  sc.eq('1행 말씀카드 · 2행 뷰 · 3행 말씀 목록',
        /const poolRows=\[\s*\[VC_NEW\],\s*\['weekly','monthSingle','monthTriple'\][\s\S]*?\['likeList','memList','deeperList','evenList'\]/.test(SRC), true);
  sc.eq('칩을 끌어다 놓으면 새 카드', SRC.includes('if(type===VC_NEW){'), true);
  sc.eq('사용 안 함은 세로로 쌓고 줄만 가로', /\.rp-cfg-col\.pool\{flex-direction:column/.test(SRC), true);

  // ── 0810-4 ──
  // 헤더는 위젯 순서 이동 손잡이라, button 이 아니면 PC 클릭이 죽는다
  sc.eq('헤더의 필터 이름은 button', SRC.includes('<button class="vc-filter"'), true);
  // 카드 밖까지 밀고 놓으면 되돌아왔다가 사라지던 것
  sc.eq('넘김 목적지는 늘 지금보다 바깥', SRC.includes('const to=(d>0)?Math.min(-base,cur-30):Math.max(base,cur+30);'), true);
  sc.eq('지금 칠해진 위치를 읽는다', SRC.includes('function _vcCurX(el)'), true);
  // 필터는 반응 목록과의 교집합 — 타일뷰도 같은 교집합을 보여야 고른 말씀이 안 사라진다
  sc.eq('타일뷰도 그 반응 목록과 교집합', SRC.includes('if(_vgState.limitKind){'), true);
  sc.eq('다른 경로로 열면 교집합을 푼다', SRC.includes('_vgState.limitKind=(_tc&&_tc.kind)?_tc.kind:null;'), true);
  sc.eq('타일뷰를 닫을 때도 푼다', SRC.includes('_vgCardTarget=null;_vgState.limitKind=null;'), true);
  // 구역 제목 옆 전체 스위치
  sc.eq('구역 전체 스위치', SRC.includes('function setVcShowAll(id,which,on)'), true);
  sc.eq('구역 목록', /_VC_SHOW_GROUP=\{\s*meta:\[/.test(SRC), true);
  sc.eq('제목 옆에 스위치를 단다', SRC.includes('const swTitle=(label,which)=>{'), true);
}

// ═══ 9-B. 구역 전체 스위치 ═══
console.log('\n시나리오 9-B — 구역 전체 켜고 끄기');
{
  reset();
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);
  sc.eq('구역이 둘', Object.keys(_VC_SHOW_GROUP), ['meta', 'react']);
  sc.eq('처음엔 다 켜져 있다', _VC_SHOW_GROUP.react.every(k => _vcShowFor(cfg, k)), true);

  setVcShowAll(id, 'react', false);
  sc.eq('오른쪽 아래를 통째로 끈다', _VC_SHOW_GROUP.react.some(k => _vcShowFor(cfg, k)), false);
  sc.eq('왼쪽 아래는 그대로', _VC_SHOW_GROUP.meta.every(k => _vcShowFor(cfg, k)), true);

  setVcShowAll(id, 'react', true);
  sc.eq('다시 통째로 켠다', _VC_SHOW_GROUP.react.every(k => _vcShowFor(cfg, k)), true);
  setVcShow(id, 'verseCardLike', false);
  sc.eq('하나만 꺼도 나머지는 그대로', _vcShowFor(cfg, 'verseCardMem'), true);
  sc.eq('없는 구역은 조용히 넘어간다', (setVcShowAll(id, '없음', false), true), true);
}

// ═══ 9-C. 밀어낸 자리에서 이어서 넘어간다 ═══
console.log('\n시나리오 9-C — 카드 밖까지 밀고 놓아도 되돌아오지 않는다');
{
  const fake = t => ({ style: { transform: t } });
  sc.eq('칠해진 위치를 읽는다', _vcCurX(fake('translateX(-372.3px)')), -372.3);
  sc.eq('아무것도 없으면 0', _vcCurX(fake('')), 0);
  sc.eq('이상한 값도 0', _vcCurX(fake('scale(1.2)')), 0);
  // 카드 폭 424 → 기본 목적지는 -169.6. 이미 -372 까지 밀렸다면 더 바깥으로 가야 한다
  const to = (cur, base, d) => (d > 0 ? Math.min(-base, cur - 30) : Math.max(base, cur + 30));
  sc.eq('덜 밀었으면 기본 목적지', to(-40, 169.6, 1), -169.6);
  sc.eq('많이 밀었으면 더 바깥으로', to(-372.3, 169.6, 1), -402.3);
  sc.eq('반대 방향도 마찬가지', to(372.3, 169.6, -1), 402.3);
}

// ═══ 10. 새 사용자 기본값 ═══
console.log('\n시나리오 10 — 새 사용자 기본값');
{
  const d = SRC.slice(SRC.indexOf('const _settingsDefaults='));
  const pick = k => new RegExp(k + ':(true|false)').exec(d)[1];
  ['verseCardCat', 'verseCardTopic', 'verseCardTag',
   'verseCardLike', 'verseCardMem', 'verseCardDeeper', 'verseCardEven', 'verseCardShare']
    .forEach(k => sc.eq(k + ' 켜짐', pick(k), 'true'));
  sc.eq('카드 목록은 빈 채로 시작', /verseCards:\{\}/.test(d), true);
}

sc.done();
