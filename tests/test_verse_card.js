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
global.verseByRef = ref => ({ idx: +ref.slice(1), ref, krText: 't' + ref, cat: '', topic: '', tags: [] });

eval(
  slice('const RP_WIDGET_DEFS={', 'function _rpGetWidgets(') +
  slice('function _lay(){', 'function _colKey(') +
  slice('// ══════ 말씀카드 위젯 = 카드 인스턴스 모델 ══════', '// ══════ 말씀카드 위젯 끝 ══════') +
  ';Object.assign(globalThis,{_lay,_vcIs,_vcIdOf,_vcAll,_vcGet,_vcCreate,_vcRemove,_vcNewId,' +
  '_rpWidgetName,_rpTypeOk,_vcVerses,_vcCurrent,_vcHash,_vcPatternKey,_vcThemeVars,_vcTextScale,' +
  '_rpVCardH,_rpSetVCardH,_vcShow,_vcUnplacedForKind,VC_KINDS});'
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
  sc.eq('처음 자리(off)는 0', _vcGet(a).off, 0);
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
console.log('\n시나리오 4 — 그 카드가 도는 범위');
{
  reset();
  ST.settings.verseCurrentIdx = 3;
  const gen = { kind: null, off: 0 }, lst = { kind: 'like', off: 0 };

  sc.eq('일반 카드는 말씀 모음 전체', _vcVerses(gen).length, 5);
  sc.eq('목록 카드는 그 반응 목록 안', _vcVerses(lst).map(v => v.ref), ['R4', 'R2', 'R5']);

  sc.eq('일반 카드는 오늘의 구절부터', _vcCurrent(gen).ref, 'R3');
  sc.eq('한 칸 밀면 다음 구절', _vcCurrent({ kind: null, off: 1 }).ref, 'R4');
  sc.eq('끝에서 넘어가면 처음으로', _vcCurrent({ kind: null, off: 3 }).ref, 'R1');
  sc.eq('뒤로도 돌아간다', _vcCurrent({ kind: null, off: -1 }).ref, 'R2');

  sc.eq('목록 카드는 목록 맨 앞부터', _vcCurrent(lst).ref, 'R4');
  sc.eq('목록 안에서 한 칸', _vcCurrent({ kind: 'like', off: 1 }).ref, 'R2');
  sc.eq('목록 끝에서 처음으로', _vcCurrent({ kind: 'like', off: 3 }).ref, 'R4');

  sc.eq('기록이 없으면 보여줄 것이 없다', _vcCurrent({ kind: 'mem', off: 0 }), null);
  sc.eq('설정이 없으면 빈 목록', _vcVerses(null), []);
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
  sc.eq('+ 버튼 메뉴에 말씀카드', SRC.includes(">rpAddMenuPick('card')") || SRC.includes("rpAddMenuPick('card')"), true);
  sc.eq('카드 설정 팝업', SRC.includes('id="vcSetModal"'), true);
  sc.eq('ESC 표에 카드 설정 팝업', SRC.includes("['vcSetModal'"), true);
  sc.eq('ESC 표에 + 버튼 메뉴', SRC.includes("['rpAddMenu'"), true);
  sc.eq('말씀설정 뷰 탭 — 좌하단 알약', SRC.includes('setVerseCardCat') && SRC.includes('setVerseCardTopic') && SRC.includes('setVerseCardTag'), true);
  sc.eq('말씀설정 뷰 탭 — 우하단 알약', SRC.includes('setVerseCardLike') && SRC.includes('setVerseCardMem') && SRC.includes('setVerseCardDeeper') && SRC.includes('setVerseCardEven'), true);
  sc.eq('그레인(종이결)이 카드에도 걸린다', SRC.includes('.vc-body::after'), true);
  // 세로로 쌓으면 220px 카드에서 버튼이 높이의 3/4을 먹어 본문이 한 줄만 남았다
  sc.eq('카드 반응 버튼은 가로로 눕힌다', /\.vc-actions\{display:flex;flex-direction:row/.test(SRC), true);
  // 목록에서 연 전체화면은 그 목록 안에서 돌고 상단에 반응 아이콘이 붙는다
  sc.eq('목록 → 전체화면에 반응 종류를 넘긴다', SRC.includes('_vfSetNav(list,Math.max(0,i),_VLIST_KIND_LABEL[kind]||\'\',kind)'), true);
  sc.eq('좌상단 버튼이 목록 복귀로 바뀐다', SRC.includes('function vfHomeAction()'), true);
}

// ═══ 10. 새 사용자 기본값 ═══
console.log('\n시나리오 10 — 새 사용자 기본값');
{
  const d = SRC.slice(SRC.indexOf('const _settingsDefaults='));
  const pick = k => new RegExp(k + ':(true|false)').exec(d)[1];
  ['verseCardCat', 'verseCardTopic', 'verseCardTag',
   'verseCardLike', 'verseCardMem', 'verseCardDeeper', 'verseCardEven']
    .forEach(k => sc.eq(k + ' 켜짐', pick(k), 'true'));
  sc.eq('카드 목록은 빈 채로 시작', /verseCards:\{\}/.test(d), true);
}

sc.done();
