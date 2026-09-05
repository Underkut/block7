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
// 배경의 첫 색 한 가지 (반투명하게 깔아야 하는 곳이 쓴다 — v26-0904-4)
global._vfBg1Css = t => (t.bg && t.bg.length) ? t.bg[0] : 'var(--bg)';
global._rgba = (c, a) => `rgba(${c},${a})`;
global._vfPatternPool = () => ['night'];
global._vfTextScale = () => 1;
global._hiFw = kind => (kind === 'serif' ? 600 : 700);   // 강조 굵기 (테마 변수에 쓰인다)
// 말씀 모음 전체 = 5개, 지금 보고 있는 것은 3번
global.ACTIVE_VERSES = () => [1, 2, 3, 4, 5].map(i => ({ idx: i, ref: 'R' + i, krText: 't' + i, cat: '', topic: '', tags: [] }));
// 좋아요 목록 = 3개 (최신순)
global._aggEntriesForKind = kind => (kind === 'like'
  ? [{ ref: 'R4' }, { ref: 'R2' }, { ref: 'R5' }]
  : []);
// ⚠️ 명제의 반응 키('P!<id>')는 verseByRef 로 **절대 못 찾는다** — 그게
//    v26-0904-7 에서 고친 버그의 씨앗이다. 느슨한 찾기만 찾아낸다.
global.verseByRef = ref => (String(ref).startsWith('P!') ? null
  : { idx: +ref.slice(1), ref, krText: 't' + ref, cat: +ref.slice(1) <= 2 ? '가' : '나', topic: '', tags: [] });
global._findVerseByRefLoose = ref => (String(ref).startsWith('P!')
  ? (ref === 'P!없음' ? null   // 모음에서 빠진 명제 — 못 찾는 경우
     : { ref: '요 3:16', pid: String(ref).slice(2), krText: '명제 본문', cat: '나', topic: '', tags: [] })
  : verseByRef(ref));
global._reactKey = v => (v && v.pid ? 'P!' + v.pid : (v ? v.ref : ''));
// 범위별 집계 — 좋아요 3개 / 저장 폴더 둘 / 나머지는 빈 목록
global._vlEntriesForScope = sc => {
  const KS = { like: ['R4', 'R2', 'R5'], mem: [], deeper: [], even: [] };
  const LS = { '여행': ['R1', 'R2'], '주일': ['R2', 'R5'] };
  const src = [...sc.ks.map(k => KS[k] || []), ...sc.ls.map(n => LS[n] || [])];
  let refs = [];
  if (sc.mode === 'and' && src.length > 1) refs = src[0].filter(r => src.every(a => a.includes(r)));
  else src.forEach(a => a.forEach(r => { if (!refs.includes(r)) refs.push(r); }));
  return refs.map(r => ({ ref: r, count: 1, lastDate: '', lastTime: '' }));
};
// 갈래(필터) pool — 타일뷰와 같은 원천을 쓴다
global._vgRawPool = () => [1, 2, 3, 4, 5].map(i => ({ idx: i, ref: 'R' + i, krText: 't' + i, cat: i <= 2 ? '가' : '나', topic: '', tags: [] }));
global._vgMatch = (v, kind, val) => (kind === 'cat' ? v.cat === val : true);
// 화면을 다시 그리려 할 때 조용히 넘어가게
global.document = { querySelector: () => null, getElementById: () => null };
global.renderRightPanel = () => {};
global.renderLayout = () => {};
// 강조 문구 도구 — 본문 안에 있는지만 가려내면 되므로 공백을 지우고 견준다
global.HI_SPLIT = /[\/|\n\r]+/;
global._hiPhrases = v => ((v && v.hi) ? String(v.hi) : '').split(HI_SPLIT).map(x => x.trim()).filter(Boolean);
global._hiRanges = (flat, ps) => ps
  .filter(p => String(flat).replace(/\s/g, '').includes(String(p).replace(/\s/g, '')))
  .map(() => [0, 1]);

eval(
  slice('const RP_WIDGET_DEFS={', 'function _rpGetWidgets(') +
  slice('// 이 버전이 "아는" 위젯인가.', 'function _colKey(') +
  slice('// ══════ 말씀카드 위젯 = 카드 인스턴스 모델 ══════', '// ══════ 말씀카드 위젯 끝 ══════') +
  ';Object.assign(globalThis,{_lay,_vcIs,_vcIdOf,_vcAll,_vcGet,_vcCreate,_vcRemove,_vcNewId,' +
  '_rpWidgetName,_rpTypeOk,_vcVerses,_vcCurrent,_vcHash,_vcPatternKey,_vcThemeVars,_vcTextScale,' +
  '_rpVCardH,_rpSetVCardH,_vcShow,_vcShowFor,_vcUnplacedForKind,_vcFilterLabel,vcNav,_vcApplyNav,vcClearFilter,vcAddCard,_rpChipName,_vcCurX,_VC_SHOW_GROUP,_vcGroupOn,_vcGroupOf,setVcShow,setVcShowAll,VC_TS_STEPS,VC_TS_PX,VC_TS_DEFAULT,VC_TS_MIN,VC_TS_MAX,VC_NEW,VL_NEW,VC_KINDS,' +
  '_vcScope,_vcScopeIsHome,_vcScopeCount,_vcScopeKey,_vcScopeLabel,_vcView,_vcSyncKind,' +
  '_vcListItems,_vcKeyOf,_vcVerseOf,_vcReactKeyOf,vcSetView,vcToggleView,_VC_TYPE_KIND,' +
  '_vcScopeParts,_vcHeadMode,setVcHeadMode,_vcAutoOn,_vcAutoMin,_vcAutoOffset,_vcAutoSlot,' +
  'setVcAuto,setVcAutoMin,VC_AUTO_STEPS,VC_AUTO_LABEL,VC_AUTO_DEFAULT,_vcHiSplit,' +
  '_vcRollMode,_vcRollSec,_vcRollOpt,setVcRollMode,setVcRollSec,_rollSecLabel,' +
  'VC_ROLL_SECS,VC_ROLL_DEFAULT,_vcAutoAnchors,_vcAutoSetAnchor,_vcAutoResetAnchors});'
);

const reset = () => {
  if (typeof _vcAutoResetAnchors === 'function') _vcAutoResetAnchors();
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
  sc.eq('테마는 전체화면을 따른다', _vcGet(a).theme, null);
  sc.eq('글자 크기는 두 번째로 큰 것', _vcGet(a).textScale, 0.8);
  sc.eq('좌·우 하단은 둘 다 꺼진 채로 시작',
        [_vcGroupOn(_vcGet(a), 'meta'), _vcGroupOn(_vcGet(a), 'react')], [false, false]);

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

  // 반대로 타입 위젯(월간뷰 등)은 여전히 하나만 남는다
  reset();
  ST.settings.layout.cols.right = ['monthSingle', 'monthSingle', 'monthTriple'];
  sc.eq('타입 위젯은 지금처럼 중복이 지워진다', _lay().cols.right, ['monthSingle', 'monthTriple']);

  // 컬럼이 달라도 타입 위젯은 하나만
  reset();
  ST.settings.layout.cols.center = ['monthSingle'];
  ST.settings.layout.cols.right = ['monthSingle'];
  const L2 = _lay();
  sc.eq('컬럼이 달라도 타입은 하나만', [L2.cols.center, L2.cols.right], [['monthSingle'], []]);

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
  // ⚠️ 옛 카드(scope 가 없는 것)는 kind 하나가 곧 범위였다 — 그대로 읽어 준다

  sc.eq('일반 카드는 말씀 모음 전체', _vcVerses(gen).length, 5);
  sc.eq('목록 카드는 그 반응 목록 안', _vcVerses(lst).map(v => v.ref), ['R4', 'R2', 'R5']);

  sc.eq('일반 카드는 자동이면 오늘의 구절', _vcCurrent(gen).ref, 'R3');
  sc.eq('목록 카드는 자동이면 목록 맨 앞', _vcCurrent(lst).ref, 'R4');
  sc.eq('자리를 적어 두면 그 말씀', _vcCurrent({ kind: null, ref: 'R5' }).ref, 'R5');
  sc.eq('목록에서 사라진 자리는 다시 자동으로',
        _vcCurrent({ kind: 'like', ref: 'R1' }).ref, 'R4');

  sc.eq('기록이 없으면 보여줄 것이 없다', _vcCurrent({ kind: 'mem', ref: null }), null);
  sc.eq('옛 카드의 kind 는 범위로 읽힌다', _vcScope({ kind: 'like' }).ks, ['like']);
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
  sc.eq('목록 칩도 마찬가지', [_vcIs(VL_NEW), _vcGet(_vcIdOf(VL_NEW))], [true, null]);
  sc.eq('칩 이름', _rpChipName(VC_NEW), '말씀 카드');
  sc.eq('목록 칩 이름', _rpChipName(VL_NEW), '말씀 목록');

  // 끌어다 놓으면 진짜 카드가 하나 생긴다
  const id1 = vcAddCard('right');
  sc.eq('컬럼에 새 카드', ST.settings.layout.cols.right, ['card#' + id1]);
  const id2 = vcAddCard('right', 0);
  sc.eq('개수 제한이 없다 — 자리를 골라 또 넣는다',
        ST.settings.layout.cols.right, ['card#' + id2, 'card#' + id1]);
  sc.eq('둘은 서로 다른 카드', id1 !== id2, true);

  // 칩 자체가 실수로 cols 에 남아도 화면에 나오지 않는다
  reset();
  ST.settings.layout.cols.right = [VC_NEW, VL_NEW];
  sc.eq('만들기 칩은 배치로 남지 않는다', _lay().cols.right, []);

  // 목록 칩을 놓으면 **목록 모습**의 위젯이 난다
  reset();
  const lid = vcAddCard('right', 0, 'list');
  sc.eq('목록 모습으로 태어난다', _vcView(_vcGet(lid)), 'list');
  sc.eq('처음엔 말씀 모음 전체', _vcScopeIsHome(_vcScope(_vcGet(lid))), true);
  const cid = vcAddCard('right', 0);
  sc.eq('카드 칩은 카드 모습', _vcView(_vcGet(cid)), 'card');

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

  // '기본'(전체화면 따라가기)은 없앴다 — 다섯 단계 중 하나를 늘 갖는다
  sc.eq('안 정했으면 가운데', _vcTextScale({ textScale: null }), 0.8);
  sc.eq('정하면 그 값', _vcTextScale({ textScale: 0.6 }), 0.6);
  sc.eq('범위 밖이면 기본값으로', _vcTextScale({ textScale: 9 }), 0.8);
  sc.eq('다섯 단계가 작은 것부터', VC_TS_STEPS, [0.5, 0.6, 0.8, 1, 1.25]);
  sc.eq('버튼 글자 크기도 다섯 단계로 다르다',
        VC_TS_STEPS.map(v => VC_TS_PX[v]), [9, 11, 13.5, 16, 19.5]);
  sc.eq('기본값은 가운데', VC_TS_DEFAULT, VC_TS_STEPS[2]);
  // ⚠️ 0811-5: 상·하한을 숫자로 박아 두면 새 단계가 걸러져 저장이 안 된다
  sc.eq('가장 큰 단계도 그대로 통과', _vcTextScale({ textScale: 1.25 }), 1.25);
  sc.eq('가장 작은 단계도 그대로 통과', _vcTextScale({ textScale: 0.5 }), 0.5);
  sc.eq('상한은 표에서 뽑는다', VC_TS_MAX, VC_TS_STEPS[VC_TS_STEPS.length - 1]);
  sc.eq('하한도 표에서', VC_TS_MIN < VC_TS_STEPS[0], true);
  sc.eq('상한 위는 기본값으로', _vcTextScale({ textScale: 1.5 }), 0.8);
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

// ═══ 7. ⚠️ 카드 ⇄ 목록 — 위젯은 하나, 모습만 뒤집힌다 (v26-0904-7) ═══
// 예전에는 타입이 통째로 갈렸다(card#c1 ↔ likeList). 그래서 오갈 때마다
// 범위·배경·글자 크기가 어긋났다. 이제는 **같은 인스턴스**가 두 모습을 갖는다.
console.log('\n시나리오 7 — 카드 ⇄ 목록은 같은 위젯의 두 모습');
{
  reset();
  const a = _vcCreate(null, null);
  _vcGet(a).theme = 'ink';
  _vcScope(_vcGet(a)).ks = ['like'];
  ST.settings.layout.cols.right = ['card#' + a];

  sc.eq('처음엔 카드 모습', _vcView(_vcGet(a)), 'card');
  vcSetView(a, 'list');
  sc.eq('목록으로 바꿔도 자리는 그대로', _lay().cols.right, ['card#' + a]);
  sc.eq('배경도 그대로', _vcGet(a).theme, 'ink');
  sc.eq('범위도 그대로', _vcScope(_vcGet(a)).ks, ['like']);
  vcToggleView(a);
  sc.eq('다시 뒤집으면 카드', _vcView(_vcGet(a)), 'card');
  sc.eq('모르는 값은 카드로 본다', _vcView({ view: '엉뚱' }), 'card');

  // 카드 높이와 목록 높이는 따로 기억한다 (서로의 높이를 물려받지 않게)
  reset();
  const b = _vcCreate(null, null);
  ST.settings.rpWidgetHeights = { ['card#' + b]: 300, ['list#' + b]: 150 };
  _vcRemove(b);
  sc.eq('지우면 두 높이가 함께 사라진다',
        [ST.settings.rpWidgetHeights['card#' + b], ST.settings.rpWidgetHeights['list#' + b]],
        [undefined, undefined]);
}

// ═══ 7-B. ⚠️ 옛 목록 위젯은 지우지 않고 옮겨 담는다 ═══
// 지우면 그 기기가 "사용자가 뺐다"로 읽어 다른 기기의 배치까지 함께 사라진다.
console.log('\n시나리오 7-B — 옛 반응별 목록 위젯 자동 이전');
{
  reset();
  ST.settings.layout.cols.right = ['likeList', 'memList'];
  ST.settings.rpWidgetHeights = { likeList: 240 };
  const L = _lay();
  sc.eq('둘 다 남는다 (개수도 차례도 그대로)', L.cols.right.length, 2);
  sc.eq('말씀 위젯 인스턴스가 됐다', L.cols.right.every(t => _vcIs(t)), true);
  const ids = L.cols.right.map(_vcIdOf);
  sc.eq('둘 다 목록 모습', ids.map(i => _vcView(_vcGet(i))), ['list', 'list']);
  sc.eq('범위는 그 반응 그대로', ids.map(i => _vcScope(_vcGet(i)).ks), [['like'], ['mem']]);
  sc.eq('끌어서 정해 둔 높이도 따라온다', ST.settings.rpWidgetHeights['list#' + ids[0]], 240);
  sc.eq('한 번 옮기고 나면 다시 옮기지 않는다', _lay().cols.right, L.cols.right);

  // 안 쓰고 남아 있던 그 반응의 카드 설정이 있으면 그것을 되살려 쓴다
  reset();
  const keep = _vcCreate('like', null);
  _vcGet(keep).theme = 'ink';
  ST.settings.layout.cols.right = ['likeList'];
  sc.eq('남아 있던 설정을 되살린다', _lay().cols.right, ['card#' + keep]);
  sc.eq('배경이 그대로 이어진다', _vcGet(keep).theme, 'ink');
  sc.eq('모습만 목록으로 바뀐다', _vcView(_vcGet(keep)), 'list');
}

// ═══ 7-C. 범위 고르기 — 반응 넷 + 저장 폴더, 합치기 ⇄ 겹치는 것만 ═══
console.log('\n시나리오 7-C — 위젯이 볼 범위');
{
  reset();
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);

  sc.eq('새 위젯은 말씀 모음 전체', _vcScopeIsHome(_vcScope(cfg)), true);
  sc.eq('말씀 모음 전체 이름', _vcScopeLabel(_vcScope(cfg)), '말씀 모음');
  sc.eq('전체일 때 옛 kind 는 비어 있다', cfg.kind, null);

  // 반응 하나 — 옛 카드와 한 글자도 다르지 않은 상태가 된다
  _vcScope(cfg).ks = ['like']; _vcSyncKind(cfg);
  sc.eq('하나만 고르면 옛 kind 로도 적힌다', cfg.kind, 'like');
  sc.eq('설정 열쇠도 예전 그대로', _vcScopeKey(_vcScope(cfg)), 'like');
  sc.eq('그 반응 목록 안을 돈다', _vcVerses(cfg).map(v => v.ref), ['R4', 'R2', 'R5']);
  sc.eq('이름은 그 반응', _vcScopeLabel(_vcScope(cfg)), '좋아요');

  // 반응 + 저장 폴더 — 합치기
  _vcScope(cfg).ls = ['여행']; _vcSyncKind(cfg);
  sc.eq('여럿 고르면 옛 kind 는 비운다', cfg.kind, null);
  sc.eq('합치기 = 둘 다 모은다', _vcVerses(cfg).map(v => v.ref), ['R4', 'R2', 'R5', 'R1']);
  sc.eq('이름은 첫째 + 외 N', _vcScopeLabel(_vcScope(cfg)), '좋아요 외 1');
  sc.eq('몇 개 골랐는지', _vcScopeCount(_vcScope(cfg)), 2);

  // 겹치는 것만
  _vcScope(cfg).mode = 'and';
  sc.eq('겹치는 것만 = 둘 다에 있는 것', _vcVerses(cfg).map(v => v.ref), ['R4', 'R2', 'R5'].filter(r => ['R1', 'R2'].includes(r)));
  sc.eq('설정 열쇠가 갈린다', _vcScopeKey(_vcScope(cfg)).startsWith('and'), true);
  // ⚠️ 열쇠는 클라우드 문서의 **칸 이름**이 된다 — 사람이 지은 폴더 이름을
  //    그대로 넣지 않는다 (점·꺾쇠 같은 글자가 그대로 키로 들어간다).
  sc.eq('열쇠에 폴더 이름이 들어가지 않는다',
        _vcScopeKey({ ks: [], ls: ['가.나/다'], mode: 'or' }).includes('가.나'), false);
  sc.eq('폴더 하나짜리 열쇠는 keep 으로 시작',
        _vcScopeKey({ ks: [], ls: ['여행'], mode: 'or' }).startsWith('keep'), true);

  // 아무것도 안 고르면 다시 말씀 모음 전체
  _vcScope(cfg).ks = []; _vcScope(cfg).ls = []; _vcSyncKind(cfg);
  sc.eq('다 풀면 말씀 모음 전체', _vcVerses(cfg).length, 5);
  sc.eq('전체의 설정 열쇠', _vcScopeKey(_vcScope(cfg)), 'home');

  // 이상한 값이 들어와도 안전 (기기 사이를 오가며 어긋날 수 있다)
  const bad = { scope: { ks: ['like', 'like', '없는것'], ls: ['  ', '여행', '여행'], mode: '엉뚱' } };
  const bsc = _vcScope(bad);
  sc.eq('겹친 것·모르는 것은 걸러 낸다', [bsc.ks, bsc.ls, bsc.mode], [['like'], ['여행'], 'or']);
  sc.eq('scope 가 없어도 안전', _vcScopeIsHome(_vcScope({})), true);
  sc.eq('빈 값도 안전', _vcScopeIsHome(_vcScope(null)), true);
}

// ═══ 7-D. ⚠️ 명제 카드에 본문이 나온다 (v26-0904-7, HB 신고) ═══
// "좋아요 카드에서 명제만 본문이 안 나오고 명제 ID 가 뜬다."
// 까닭: 예전에는 장절 전용 verseByRef 하나로만 찾아서 명제의 반응 키는
//       **언제나 못 찾았고** 빈 껍데기(ref=명제 ID, 본문 없음)가 만들어졌다.
console.log('\n시나리오 7-D — 명제도 본문이 나온다');
{
  reset();
  const v = _vcVerseOf('P!p9');
  sc.eq('명제도 찾아낸다', v.krText, '명제 본문');
  sc.eq('장절은 진짜 장절로 보여 준다', v.ref, '요 3:16');
  sc.eq('명제 ID 가 그대로 뜨지 않는다', v.ref.includes('P!'), false);
  // ⚠️ 반응을 세고 기록하는 열쇠는 장절이 아니라 **기록에 적힌 그 열쇠**다
  //    (한 설교의 명제들은 장절이 서로 같아 장절로는 셀 수 없다)
  sc.eq('반응 열쇠는 그대로 들고 다닌다', [v.k, _vcKeyOf(v), _vcReactKeyOf(v)], ['P!p9', 'P!p9', 'P!p9']);
  // 말씀(명제가 아닌 것)은 예전과 똑같다
  const w = _vcVerseOf('R2');
  sc.eq('말씀은 예전 그대로', [w.ref, w.k], ['R2', 'R2']);
  // 못 찾는 것은 빈 껍데기로 (화면이 죽지 않게)
  const g = _vcVerseOf('P!없음');
  sc.eq('못 찾아도 안전', [g.ref, g.krText], ['P!없음', '']);
}

// ═══ 7-E. 자동 넘김 (v26-0904-10, HB) ═══
// ⚠️ 핵심은 "넘긴 자리를 저장하지 않는다" 이다. 카드마다 몇 분에 한 번씩
//    클라우드에 글을 쓰면 (카드 수 × 기기 수)만큼 쓰기가 쌓인다.
//    사람이 멈춘 자리(ref)와 그때의 칸 번호(autoAt) 둘만 두고 시계로 센다.
console.log('\n시나리오 7-E — 말씀카드 자동 넘김');
{
  reset();
  ST.settings.verseCurrentIdx = 1;
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);

  sc.eq('처음엔 꺼져 있다', _vcAutoOn(cfg), false);
  sc.eq('간격 기본값은 1시간', _vcAutoMin(cfg), 60);
  sc.eq('이상한 간격은 기본값으로', _vcAutoMin({ autoMin: 7 }), 60);
  sc.eq('고른 간격은 그대로', _vcAutoMin({ autoMin: 10 }), 10);
  sc.eq('간격 여덟 단계', VC_AUTO_STEPS, [5, 10, 15, 20, 30, 60, 120, 180]);
  sc.eq('모든 단계에 이름이 있다', VC_AUTO_STEPS.every(m => !!VC_AUTO_LABEL[m]), true);

  // 켜면 지금 보고 있던 말씀에 자리를 못박는다
  sc.eq('켜기 전 자리', _vcCurrent(cfg, id).ref, 'R1');
  setVcAuto(id, true);
  sc.eq('켜졌다', _vcAutoOn(cfg), true);
  sc.eq('보던 자리를 적어 둔다', cfg.ref, 'R1');
  sc.eq('그때가 몇 번째 칸인지도', typeof cfg.autoAt, 'number');

  // 칸이 하나 지나면 다음 말씀 — **저장은 일어나지 않는다**
  // (자리는 이 기기의 기억(_vcAutoAnchors)이 앞선다 — 앱을 껐다 켜도 이어지게)
  const A = _vcAutoAnchors();
  sc.eq('켤 때 이 기기의 자리도 함께 적는다', A[id].r, 'R1');
  const at0 = A[id].s;
  A[id].s = at0 - 1;
  sc.eq('한 칸 지나면 다음 말씀', _vcCurrent(cfg, id).ref, 'R2');
  A[id].s = at0 - 4;
  sc.eq('네 칸 지나면 네 번째 뒤', _vcCurrent(cfg, id).ref, 'R5');
  A[id].s = at0 - 5;
  sc.eq('끝에 닿으면 한 바퀴 돌아 처음으로', _vcCurrent(cfg, id).ref, 'R1');
  sc.eq('적어 둔 자리는 그대로다 (저장이 없다)', cfg.ref, 'R1');

  // ⚠️ 앱을 껐다 켜면 **지금 칸에서 다시 센다** — 꺼져 있던 몫을 한꺼번에
  //    따라잡으면 카드가 전부 동시에 바뀐 것처럼 보인다 (HB 신고).
  A[id].s = at0 - 4;
  sc.eq('켜기 전에는 네 칸 밀려 있지만', _vcCurrent(cfg, id).ref, 'R5');
  A[id].s = _vcAutoSlot(id, cfg);          // _vcAutoStart 가 하는 일
  sc.eq('켠 뒤에는 보던 자리 그대로', _vcCurrent(cfg, id).ref, 'R1');

  // id 를 안 주면 자동을 셈에 넣지 않는다 (자리 그대로)
  sc.eq('id 없이 물으면 적어 둔 자리', _vcCurrent(cfg).ref, 'R1');

  // 손으로 넘기면 그 자리에서 다시 센다 — 손이 언제나 앞선다
  vcNav(id, 1);
  sc.eq('손으로 넘긴 자리', cfg.ref, 'R2');
  sc.eq('기준도 지금 칸으로 옮겼다', cfg.autoAt, _vcAutoSlot(id, cfg));
  sc.eq('이 기기의 기억도 함께 옮긴다', _vcAutoAnchors()[id].r, 'R2');
  sc.eq('그래서 곧바로 또 넘어가지 않는다', _vcCurrent(cfg, id).ref, 'R2');

  // 카드마다 시작점이 어긋난다 (여러 위젯이 한꺼번에 넘어가지 않게)
  const b = _vcCreate(null, null);
  const offA = _vcAutoOffset(id, 10), offB = _vcAutoOffset(b, 10);
  sc.eq('오프셋은 간격 안에 있다', offA >= 0 && offA < 10 * 60000, true);
  sc.eq('카드마다 다르다', offA !== offB, true);
  sc.eq('같은 카드는 늘 같은 값', _vcAutoOffset(id, 10), offA);

  // 끄면 그 자리에 그대로 선다 (기기의 기억도 지운다)
  setVcAuto(id, false);
  sc.eq('끄면 기억도 지운다', _vcAutoAnchors()[id], undefined);
  cfg.autoAt = _vcAutoSlot(id, cfg) - 9;
  sc.eq('꺼져 있으면 시계를 보지 않는다', _vcCurrent(cfg, id).ref, 'R2');
}

// ═══ 7-F. 제목 표시 — 아이콘 ⇄ 텍스트 ═══
console.log('\n시나리오 7-F — 헤더에 무엇을 보여줄까');
{
  reset();
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);
  sc.eq('기본은 아이콘 (기존 방식)', _vcHeadMode(cfg), 'icon');
  setVcHeadMode(id, 'text');
  sc.eq('텍스트로 바꾼다', _vcHeadMode(cfg), 'text');
  setVcHeadMode(id, '엉뚱');
  sc.eq('모르는 값은 아이콘으로', _vcHeadMode(cfg), 'icon');

  // 이름은 '외 N' 으로 접지 않고 **낱낱이** 준다 — 롤링이 한 줄씩 넘긴다
  sc.eq('말씀 모음 전체', _vcScopeParts({ ks: [], ls: [], mode: 'or' }), ['말씀 모음 전체']);
  sc.eq('반응과 폴더를 낱낱이',
        _vcScopeParts({ ks: ['like', 'mem'], ls: ['여행'], mode: 'or' }),
        ['좋아요', '암송', '여행']);
  sc.eq('접은 이름은 따로 있다',
        _vcScopeLabel({ ks: ['like', 'mem'], ls: ['여행'], mode: 'or' }), '좋아요 외 2');
}

// ═══ 7-F2. 이름 넘김 방식·간격 (v26-0905-8, HB) ═══
// ⚠️ 이 두 값은 위젯 헤더와 **그 카드로 연 전체화면 윗줄**이 함께 쓴다.
console.log('\n시나리오 7-F2 — 넘김 방식과 시간 간격');
{
  reset();
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);

  sc.eq('기본은 플립', _vcRollMode(cfg), 'flip');
  sc.eq('기본 간격은 4초', _vcRollSec(cfg), 4);
  setVcRollMode(id, 'dissolve');
  sc.eq('디졸브로 바꾼다', _vcRollMode(cfg), 'dissolve');
  setVcRollMode(id, '엉뚱');
  sc.eq('모르는 값은 플립으로', _vcRollMode(cfg), 'flip');

  sc.eq('눈금은 3초부터 10분까지', [VC_ROLL_SECS[0], VC_ROLL_SECS[VC_ROLL_SECS.length - 1]], [3, 600]);
  sc.eq('눈금이 작은 것부터', VC_ROLL_SECS.every((v, i) => i === 0 || v > VC_ROLL_SECS[i - 1]), true);
  setVcRollSec(id, 0);
  sc.eq('맨 왼쪽은 3초', _vcRollSec(cfg), 3);
  setVcRollSec(id, VC_ROLL_SECS.length - 1);
  sc.eq('맨 오른쪽은 10분', _vcRollSec(cfg), 600);
  setVcRollSec(id, 999);
  sc.eq('범위를 넘겨도 안전', _vcRollSec(cfg), 600);
  setVcRollSec(id, 5);
  sc.eq('가운데 눈금', _vcRollSec(cfg), VC_ROLL_SECS[5]);
  cfg.rollSec = 7;                       // 눈금에 없는 값이 흘러들어와도
  sc.eq('눈금에 없으면 기본값으로', _vcRollSec(cfg), 4);

  sc.eq('초는 초로, 분은 분으로 적는다',
        [_rollSecLabel(3), _rollSecLabel(60), _rollSecLabel(600), _rollSecLabel(90)],
        ['3초', '1분', '10분', '1분 30초']);

  // 전체화면에 넘길 꾸러미
  cfg.rollSec = 30; cfg.rollMode = 'dissolve';
  sc.eq('전체화면에 넘길 값', _vcRollOpt(cfg), { mode: 'dissolve', sec: 30 });
}

// ═══ 7-G. 명제의 대표 문구 (v26-0904-10, HB) ═══
// 본문 안에 있으면 예전처럼 본문을 칠하고, 본문에 없으면 칠할 자리가 없어
// 그대로 사라졌다 — 그때만 카드 좌상단에 작은 글씨로 얹는다.
console.log('\n시나리오 7-G — 대표 문구가 본문에 없을 때');
{
  const inBody = _vcHiSplit({ krText: '내가 주의 말씀을 마음에 두었나이다', hi: '주의 말씀을' });
  sc.eq('본문에 있으면 칠할 것으로', inBody.inBody, ['주의 말씀을']);
  sc.eq('좌상단에는 아무것도 없다', inBody.outside, []);

  const out = _vcHiSplit({ krText: '내가 주의 말씀을 마음에 두었나이다', hi: '말씀을 품는 삶' });
  sc.eq('본문에 없으면 좌상단으로', out.outside, ['말씀을 품는 삶']);
  sc.eq('칠할 것은 없다', out.inBody, []);

  // 대표 문구는 둘까지 있다 (hi, hi2) — 각자 따로 가린다
  const two = _vcHiSplit({ krText: '내가 주의 말씀을 마음에 두었나이다',
                           hi: '주의 말씀을', hi2: '두 번째 대표 문구' });
  sc.eq('둘을 함께 본다', [two.inBody, two.outside], [['주의 말씀을'], ['두 번째 대표 문구']]);

  // 한 칸에 여러 문구가 '/' 로 들어올 수 있다
  const many = _vcHiSplit({ krText: '가나다 라마바', hi: '가나다 / 사아자' });
  sc.eq('나눠 적은 것도 각자 가린다', [many.inBody, many.outside], [['가나다'], ['사아자']]);

  // 띄어쓰기가 달라도 본문 안이면 찾아낸다
  sc.eq('띄어쓰기 차이는 넘어간다',
        _vcHiSplit({ krText: '주의 말씀을', hi: '주의말씀을' }).inBody, ['주의말씀을']);

  sc.eq('대표 문구가 없으면 둘 다 빈 목록',
        [_vcHiSplit({ krText: '가나다' }).inBody, _vcHiSplit({ krText: '가나다' }).outside], [[], []]);
}

// ═══ 8. 표시 항목 · 위젯 이름 ═══
console.log('\n시나리오 8 — 표시 항목과 이름');
{
  reset();
  sc.eq('값이 없으면 보여준다', _vcShow('verseCardCat'), true);
  ST.settings.verseCardCat = false;
  sc.eq('끄면 안 보여준다', _vcShow('verseCardCat'), false);

  // 카드마다 따로 켜고 끌 수 있다 (구역이 켜져 있을 때만 보인다)
  const on = { showGroup: { meta: true, react: true } };
  sc.eq('카드가 따로 안 정하면 말씀설정을 따른다',
        _vcShowFor(Object.assign({ show: {} }, on), 'verseCardCat'), false);
  sc.eq('카드에서 켜면 켜진다',
        _vcShowFor(Object.assign({ show: { verseCardCat: true } }, on), 'verseCardCat'), true);
  ST.settings.verseCardCat = true;
  sc.eq('카드에서 끄면 꺼진다',
        _vcShowFor(Object.assign({ show: { verseCardCat: false } }, on), 'verseCardCat'), false);
  sc.eq('show 가 없어도 안전', _vcShowFor(on, 'verseCardCat'), true);
  sc.eq('구역이 꺼져 있으면 켜 뒀어도 안 보인다',
        _vcShowFor({ show: { verseCardCat: true }, showGroup: { meta: false } }, 'verseCardCat'), false);
  ST.settings.verseCardCat = true;

  const a = _vcCreate('deeper', null), b = _vcCreate(null, null);
  sc.eq('범위가 걸린 카드 이름', _rpWidgetName('card#' + a), '말씀 카드 · Deeper');
  sc.eq('말씀 모음 전체 카드 이름', _rpWidgetName('card#' + b), '말씀 카드');
  vcSetView(b, 'list');
  sc.eq('목록 모습이면 이름도 목록', _rpWidgetName('card#' + b), '말씀 목록');
  sc.eq('있는 카드', _rpTypeOk('card#' + a), true);
  sc.eq('없는 카드', _rpTypeOk('card#유령'), false);
  sc.eq('있는 타입', _rpTypeOk('monthSingle'), true);
}

// ═══ 9. 화면에 실제로 붙어 있는지 ═══
console.log('\n시나리오 9 — 화면 연결');
{
  sc.eq('목록 헤더의 카드 전환 버튼', SRC.includes("vcSetView('${id}','card')"), true);
  sc.eq('카드 헤더 우상단 = 목록으로', SRC.includes("vcSetView('${id}','list')"), true);
  sc.eq('타입을 갈아치우던 옛 길은 없앴다',
        SRC.includes('function vlToCard(') || SRC.includes('function vcBackToList('), false);
  // 0811-3: 필터 행 우측의 … 버튼은 없앴다 (카드 설정은 카드 헤더의 ⋯ 로만)
  sc.eq('필터 행에 … 버튼 없음',
        SRC.includes('openVlCardSettings(') || SRC.includes('_vListControlsHTML(kind,true)'), false);
  sc.eq('+ 버튼은 위젯 설정 팝업을 연다', SRC.includes('class="rp-add-btn" onclick="openRpConfig()"'), true);
  sc.eq('+ 버튼 메뉴는 없앴다', SRC.includes('rpAddMenu'), false);
  sc.eq('카드 설정 팝업', SRC.includes('id="vcSetModal"'), true);
  sc.eq('ESC 표에 카드 설정 팝업', SRC.includes("['vcSetModal'"), true);
  // ── v26-0904-7: 범위 고르는 팝업 ──
  sc.eq('범위 고르는 팝업', SRC.includes('id="vsScopeModal"'), true);
  sc.eq('ESC 표에도 넣었다', SRC.includes("['vsScopeModal'"), true);
  sc.eq('닫기는 우상단 × 하나 (하단 닫기 버튼 없음)',
        /id="vsScopeModal"[\s\S]*?<button class="modal-x modal-x-inline" onclick="closeVwScope\(\)"/.test(SRC), true);
  sc.eq('좌상단은 합치기 ⇄ 겹치는 것만 (보조 메뉴 자리)',
        SRC.includes('id="vsModeBtn" onclick="vwScopeToggleMode()"'), true);
  sc.eq('두 동그라미를 겹쳐 그린다',
        SRC.includes('const _VW_ICON_OR=') && SRC.includes('const _VW_ICON_AND='), true);
  sc.eq('말씀 모음 전체는 집 모양 홈 아이콘', SRC.includes('const _VW_ICON_HOME='), true);
  sc.eq('헤더 단추가 그 팝업을 연다', SRC.includes("openVwScope('${id}')"), true);
  sc.eq('목록은 헤더 **왼쪽 끝**에 범위 단추',
        /<div class="rp-widget-title">\s*\$\{_vcScopeBtnHTML\(id,cfg/.test(SRC), true);
  sc.eq('폴더 이름을 onclick 에 적지 않는다 (따옴표가 들어갈 수 있다)',
        SRC.includes('onclick="vwScopePick(${i})"'), true);
  // ── v26-0904-10 ──
  sc.eq('저장 폴더 제목줄에 차례 네 가지', SRC.includes('function _vwKeepSortHTML()'), true);
  sc.eq('저장 목록 화면과 같은 설정을 쓴다',
        /_vwKeepSortHTML[\s\S]{0,700}keepTogglePairSort\(\)[\s\S]{0,300}keepSetSort\('manual'\)/.test(SRC), true);
  sc.eq('차례를 바꾸면 이 팝업도 다시 그린다',
        SRC.includes("if(sm&&sm.style.display!=='none'&&typeof renderVwScope==='function')renderVwScope();"), true);
  sc.eq('말씀 모음 전체 줄을 길게 누르면 말씀 모음 설정',
        SRC.includes('function vwScopeCollSettings()') && SRC.includes('function _vwScopeBindHold()'), true);
  sc.eq('길게 눌러 연 뒤의 클릭 한 번은 흘려보낸다',
        SRC.includes('if(Date.now()-_vwHoldAt<700)return;'), true);
  sc.eq('줄 높이를 넉넉히', /\.vs-row\{[^}]*padding:11px 8px;/.test(SRC), true);
  // 위젯 끄기 드롭존은 2단에서도
  sc.eq('2단에서도 위젯을 끌 수 있다', SRC.includes("onOff:(mode>=2&&type!=='todo')?()=>{"), true);
  // 이름 롤링
  sc.eq('이름 롤링 부품', SRC.includes('function _rollHTML(parts,style,opt)') && SRC.includes('function _rollFit(root)'), true);
  sc.eq('시계는 앱 전체에 하나', SRC.includes('function _rollStart(){if(!_rollTimer)_rollTimer=setInterval(_rollTick,ROLL_TICK_MS);}'), true);
  // v26-0905-8 — 넘김 방식·간격은 요소가 들고 있고, 자리는 시계에서 곧장 센다
  sc.eq('요소가 방식과 간격을 들고 있다',
        SRC.includes('data-roll-mode="${mode}" data-roll-ms="${ms}"'), true);
  sc.eq('자리를 세어 들고 있지 않는다 (다시 그려도 이어진다)',
        SRC.includes('return Math.floor(Date.now()/ms)%n;'), true);
  // ⚠️⚠️ v26-0905-9, HB 신고 — "디졸브로 두면 전체화면 헤더에 제목이 아예 안
  //    보인다." 절대배치로 겹치면 흐름에 남는 것이 없어 **가로 폭이 0** 이 된다.
  //    위젯 헤더는 flex:1 이 폭을 주어 멀쩡했고, 전체화면 윗줄만 사라졌다.
  sc.eq('디졸브는 grid 한 칸에 포갠다',
        /\.roll-v\.rd \.roll-track\{display:grid;/.test(SRC), true);
  sc.eq('디졸브에 절대배치를 쓰지 않는다',
        /\.roll-v\.rd \.roll-item\{grid-area:1\/1;/.test(SRC), true);
  sc.eq('겹침 표식은 HTML 이 들고 나온다',
        SRC.includes("class=\"roll-v${mode==='dissolve'?' rd':''}\""), true);
  sc.eq('플립은 여유 있게 0.85초 · 끝이 아주 길게 눕는 곡선',
        /\.roll-v \.roll-track\{display:block;transition:transform \.85s cubic-bezier\(\.16,1,\.28,1\)/.test(SRC), true);
  // ⚠️ 디졸브 시간은 **되돌린 값**이다 — 0.9초로 늘렸더니 "길고 툭 끊긴다" 는
  //    신고를 받았다 (v26-0905-10). 다시 늘리지 말 것.
  sc.eq('디졸브는 0.6초 그대로', SRC.includes('transition:opacity var(--roll-fade,.6s) ease;'), true);
  sc.eq('가운데 자리에서는 글자도 가운데로',
        /#vfTopLabel \.roll-h,#vfTopLabel \.roll-item,#vfTopLabel \.roll-v,\n\.vw-scope-c[^{]*\{text-align:center;\}/.test(SRC), true);
  // 자동 넘김도 손으로 민 것처럼 좌우로 밀린다
  sc.eq('자동 넘김도 좌우로 밀린다', SRC.includes('function _vcAutoSlide(ids)'), true);
  sc.eq('손으로 밀 때와 같은 곡선을 쓴다',
        /function _vcAutoSlide[\s\S]{0,1400}ns\.style\.transition=_VC_SLIDE_TR;/.test(SRC), true);
  // 앱을 껐다 켤 때 한꺼번에 따라잡지 않는다
  sc.eq('마지막 자리는 기기 로컬에만 적는다',
        SRC.includes("const VC_AUTO_LS='b7v1_vcauto';") &&
        /_vcAutoSaveAnchors[\s\S]{0,200}localStorage\.setItem\(VC_AUTO_LS/.test(SRC), true);
  sc.eq('켤 때 지금 칸에서 다시 센다',
        /function _vcAutoStart[\s\S]{0,700}A\[id\]\.s=_vcAutoSlot\(id,c\);/.test(SRC), true);
  sc.eq('전체화면 상단도 그 값을 받는다',
        SRC.includes("_vcScopeParts(sc),_vcRollOpt(cfg));"), true);
  sc.eq('텍스트를 골라야 한 겹 더 열린다',
        SRC.includes("const headExtra=_vcHeadMode(cfg)!=='text'?'':`"), true);
  sc.eq('시간 간격은 슬라이더', SRC.includes('id="vcRollSecSlider"'), true);
  sc.eq('여럿이면 세로로 넘긴다', SRC.includes('class="roll-v${mode==='), true);
  sc.eq('하나인데 길면 가로로 흐른다', SRC.includes('class="roll-h"'), true);
  sc.eq('전체화면 상단도 같은 부품을 쓴다', SRC.includes('${_rollHTML(_vfNavParts&&_vfNavParts.length?_vfNavParts:[_vfNavLabel]'), true);
  sc.eq('상단 이름을 말줄임으로 자르지 않는다',
        /\.vf-toplabel\{[^}]*text-overflow:ellipsis/.test(SRC), false);
  // 자동 넘김이 화면에 붙어 있나
  sc.eq('자동 넘김 토글', SRC.includes("setVcAuto('${id}',this.checked)"), true);
  sc.eq('간격은 롤링피커', SRC.includes("<select class=\"event-roll-select\" onchange=\"setVcAutoMin('${id}',this.value)\">"), true);
  sc.eq('부팅 때 시계를 켠다', SRC.includes('_vcAutoStart();   // 말씀카드 자동 넘김 시계'), true);
  sc.eq('넘김 때마다 저장하지 않는다', /function _vcAutoTick\(\)\{[\s\S]{0,600}save\(\)/.test(SRC), false);
  // 표시 항목은 카드마다 따로 있으므로 말씀설정에서는 뺐다 (0810-4)
  sc.eq('말씀설정 뷰 탭에는 카드 항목이 없다',
        SRC.includes('setVerseCardCat') || SRC.includes('setVerseCardShare') || SRC.includes('말씀카드에서 보여줄 항목'), false);
  sc.eq('그레인(종이결)이 카드에도 걸린다', SRC.includes('.vc-body::after'), true);
  // 세로로 쌓으면 220px 카드에서 버튼이 높이의 3/4을 먹어 본문이 한 줄만 남았다
  sc.eq('카드 반응 버튼은 가로로 눕힌다', /\.vc-actions\{display:flex;flex-direction:row/.test(SRC), true);
  // 목록에서 연 전체화면은 그 목록 안에서 돌고 상단에 반응 아이콘이 붙는다
  // v26-0831-11 — 자리를 **반응 키**로 찾는다 (명제는 장절이 같아 자리가 어긋났다)
  sc.eq('목록 → 전체화면에 반응 종류를 넘긴다', SRC.includes("_vfSetNav(list,i,_VLIST_KIND_LABEL[kind]||'',kind)"), true);
  sc.eq('자리는 반응 키로 찾는다', SRC.includes('const i=Math.max(0,keys.indexOf(ref));'), true);
  sc.eq('좌상단 버튼이 목록 복귀로 바뀐다', SRC.includes('function vfHomeAction()'), true);

  // ── 0810-2 에서 손본 것들 ──
  sc.eq('설정 진입은 점 세 개 (톱니가 해처럼 보였다)',
        SRC.includes('const _VC_ICON_MORE=') && !SRC.includes('_VC_ICON_GEAR'), true);
  sc.eq('목록 헤더의 카드 버튼은 빈 정사각형',
        /vcSetView\('\$\{id\}','card'\)[\s\S]{0,220}<rect x="3" y="3" width="14" height="14" rx="2\.5"\/><\/svg>/.test(SRC), true);
  // 손가락 화면에서 :hover 가 남아 버튼이 파랗게 굳던 것
  sc.eq('목록 헤더 버튼의 hover 는 마우스 기기에서만',
        SRC.includes('@media (hover:hover){.vl-sort-toggle:hover{color:var(--ac-tx);}}'), true);
  sc.eq('카드 헤더 버튼의 hover 도 마우스 기기에서만',
        SRC.includes('@media (hover:hover){.vc-icbtn:hover{color:var(--ac-tx);}}'), true);
  // 본문이 길면 장절이 '다음 말씀' 버튼(z-index 2) 밑에 깔려 눌리지 않았다
  sc.eq('전체화면 장절을 넘김 버튼 위로', /#vfRef\{[\s\S]*?position:relative;z-index:3;/.test(SRC), true);
  // 하단 메타·반응 묶음의 투명한 가운데도 긴 말씀의 장절 위를 덮을 수 있다
  sc.eq('전체화면 하단의 빈 영역은 장절 클릭을 가로채지 않는다',
        /\.vf-bottom\{[\s\S]*?pointer-events:none;/.test(SRC), true);
  sc.eq('전체화면 반응 버튼은 계속 누를 수 있다',
        /\.vf-actions\{[\s\S]*?pointer-events:auto;/.test(SRC), true);
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
  sc.eq('말씀영역 메뉴도 아이콘 토스트', SRC.includes("_reactWithToast('like',_reactKey(_vfCurrentVerse()))"), true);
  sc.eq('반응 토스트는 0.5초', SRC.includes('_dismissReactToast(false);},500)'), true);
  // 카드 설정 팝업 — 테마 · 글자 크기 · 좌하단 · 우하단 · 안내 순서
  const b = SRC.indexOf('function renderVcSettings()');
  const seg = SRC.slice(b, b + 12000);
  // v26-0904-10 — 맨 위에 '자동 넘김'(첫 항목)과 '제목 표시'가 들어왔다
  const order = ['>자동 넘김<', '>제목 표시<', '>테마<', '>글자 크기<',
                 '왼쪽 아래 — 필터', '오른쪽 아래 — 말씀 반응', '반응 카운터와 링크 열기는']
    .map(t => seg.indexOf(t));
  sc.eq('설정 팝업 일곱 구역이 이 순서로', order.every((n, i) => n >= 0 && (i === 0 || n > order[i - 1])), true);
  sc.eq('카드마다 좌·우 하단 켜고 끄기', SRC.includes('function setVcShow(id,key,on)'), true);

  // ── 0811-1 ──
  // 제목에서 '말씀카드'·'전체화면'을 뺐다 (어느 화면인지는 이미 안다)
  sc.eq('말씀설정 전체화면 탭도 짧은 제목',
        SRC.includes('<div class="settings-section-title">글자 크기</div>') &&
        SRC.includes('<div class="settings-section-title">테마</div>'), true);
  sc.eq("긴 제목은 화면에 남아 있지 않다",
        SRC.includes('>말씀카드 테마<') || SRC.includes('>말씀카드 글자 크기<') ||
        SRC.includes('>전체화면 글자 크기<') || SRC.includes('>전체화면 테마<'), false);
  // 글자 크기 버튼: 작은 것부터, 모두 '태초에…', 크기가 실제로 다르다
  sc.eq('전체화면 탭 버튼 순서 50·60·80·100',
        /vfTs50[\s\S]{0,120}vfTs60[\s\S]{0,120}vfTs80[\s\S]{0,120}vfTs100/.test(SRC), true);
  sc.eq('버튼 글자는 모두 태초에…',
        (SRC.match(/onclick="setVfTextScale\([\d.]+\)">태초에…<\/button>/g) || []).length, 4);
  sc.eq('버튼마다 글자 크기가 다르다',
        /vfTs50" class="ts-btn" style="font-size:9px;/.test(SRC) &&
        /vfTs100" class="ts-btn on" style="font-size:16px;/.test(SRC), true);
  sc.eq("'기본' 버튼은 없앴다", SRC.includes("tsBtn(null,'기본')"), false);
  // 전체 스위치는 상위 개념 — 하위 값을 건드리지 않는다
  sc.eq('전체 스위치는 showGroup 만 만진다',
        SRC.includes("cfg.showGroup[which]=!!on;"), true);
  sc.eq('구역이 꺼져 있으면 아래는 흐리게',
        SRC.includes("const dim=!_vcGroupOn(cfg,_vcGroupOf(key));"), true);
  // 반응 줄 앞 아이콘
  sc.eq('반응 줄 앞에 아이콘', SRC.includes('const rIcon=k=>'), true);
  sc.eq('다섯 줄 모두 아이콘',
        (SRC.match(/rIcon\('(like|mem|deeper|even|share)'\)/g) || []).length, 5);

  // ── 0811-2 ──
  // 글자 크기 −/+ (0811-4 에서 헤더 → 카드 안 우상단으로 옮겼다)
  sc.eq('글자 크기 −/+ 가 있다', SRC.includes("vcStepTextScale('${id}',-1)") && SRC.includes("vcStepTextScale('${id}',1)"), true);
  sc.eq('한 칸씩 옮기는 함수', SRC.includes('function vcStepTextScale(id,d)'), true);
  sc.eq('끝에 닿으면 눌리지 않게', SRC.includes(".vc-zbtn:disabled{opacity:.15;cursor:default;}"), true);
  // 롱터치로 연 메뉴가 손을 떼는 동작으로 닫히던 것
  sc.eq('메뉴는 새로 누를 때까지 안 닫힌다', SRC.includes('function _menuArmOnNextPress(setter)'), true);
  sc.eq('말씀 메뉴에 적용', SRC.includes('_menuArmOnNextPress(v=>{_vmmArmed=v;})'), true);
  sc.eq('목록 메뉴에도 적용', SRC.includes('_menuArmOnNextPress(v=>{_vliArmed=v;})'), true);
  // 타일뷰는 늘 '=' 켜진 최신순으로 시작
  sc.eq('타일뷰 기본 정렬', SRC.includes("_vgState.sortMode='date';_vgState.dateOrder='recent';"), true);
  sc.eq("'=' 켜진 채로", SRC.includes('_vgState.kind=kind;_vgState.val=val;_vgState.group=true;'), true);
  // 개발자 전용 — 대분류 롱터치로 그 말씀의 구글 시트 셀 열기
  sc.eq('시트 링크 만들기', SRC.includes('function _sheetUrlForVerse(v)'), true);
  sc.eq('개발자만', /function vfOpenSheetForCat\(\)\{\s*if\(!_isDevAccount\(\)\)return;/.test(SRC), true);
  sc.eq('그 줄을 골라 준다', SRC.includes('&range=A${hit.row}:G${hit.row}'), true);   // 0812-7: '강조 문구' G열까지
  sc.eq('시트에서 가져올 때 행 번호를 적어 둔다', SRC.includes('d:_parseVDate(r[5]),row:i+1'), true);
  // 설정 등급을 바꿔도 보던 탭에 머문다
  sc.eq('등급 바꾸기 전에 지금 탭을 붙잡는다',
        SRC.includes('const curId=_stabList()[_currentSettingsTabIdx]||\'\';'), true);
  sc.eq('전체 목록을 그대로 쓰지 않는다',
        SRC.includes('switchSettingsTab(SETTINGS_TABS[_currentSettingsTabIdx],null,\'direct\')'), false);
  // 등급 아이콘 설명이 탭바에 가리지 않게
  sc.eq('헤더를 탭바 위로', /\.settings-hd\{[\s\S]*?position:relative;z-index:30;/.test(SRC), true);
  // '현재 말씀 모음' 검색에 태그도
  sc.eq('모음 검색에 태그 포함', SRC.includes("(v.tags||[]).some(t=>String(t).includes(q))"), true);
  sc.eq('검색창 안내도 바뀜', SRC.includes('구절, 본문, 소주제, 태그 검색'), true);
  // Even Deeper 는 성공 안내를 띄우지 않는다 (바로 다른 앱으로 넘어간다)
  // 0813-11: okMsg 자체를 없앴다 (성공·실패 모두 토스트 없음) — 아래 새 시나리오에서 확인

  // ── 0811-3 ──
  // ⚠️ 좌우 넘김 영역이 카드 몸통 전체를 덮어 우하단 맨 오른쪽 반응 버튼을 가렸다
  sc.eq('넘김 영역은 본문 안에만', SRC.includes('${arrows}\n          <div class="vc-text"'), true);
  sc.eq('본문이 그 기준 상자', /\.vc-inner\{\s*position:relative;/.test(SRC), true);
  sc.eq('가로는 카드의 1/4 · 위쪽은 −/+ 자리로 비운다',
        SRC.includes('position:absolute;top:26px;bottom:0;width:25%;z-index:4;'), true);
  sc.eq('장절이 화살표에 눌림을 안 뺏긴다', SRC.includes('.vc-ref{position:relative;z-index:5;}'), true);
  // 뜰 때의 두근거림이 사라지는 시각보다 길면 도중에 잘린다
  sc.eq('두근거림도 함께 짧게', SRC.includes("reactToastBeat .45s"), true);
  // −, +, 3줄 을 같은 상자·같은 선 굵기로
  sc.eq('−/+ 를 그림으로', SRC.includes('const _VC_ICON_MINUS=') && SRC.includes('const _VC_ICON_PLUS='), true);
  sc.eq('−/+ 는 16×16 한 상자', SRC.includes('.vc-zbtn{\n  width:16px;height:16px;'), true);
  sc.eq('계단형 3줄도 얇게',
        SRC.includes('viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="2" y1="2.5" x2="18" y2="2.5"/>'), true);
  // 등급 설명 말풍선이 밝은 테마에서 안 보이던 것 (어두운 배경 + 어두운 글자)
  sc.eq('말풍선은 늘 읽히는 색', SRC.includes('background:rgba(20,20,24,.92);color:#fff;'), true);
  sc.eq('정의 없는 --s3 를 쓰지 않는다', SRC.includes('var(--s3,'), false);
  // ⚠️ 0813-9: 시트는 **절대 네이티브 앱으로 넘기지 않는다** (아래 시나리오에서 자세히)
  sc.eq('시트 열기 함수가 있다', SRC.includes('function _sheetGo(url){'), true);

  // ── 0811-4 ──
  // 글자 크기 −/+ 를 헤더에서 빼내 카드 안 우상단으로. 헤더는 좌·가운데·우 셋뿐이라
  // 목록카드(오른쪽 햄버거 있음)와 일반카드(없음) 모두 가운데 아이콘이 한가운데 온다.
  sc.eq('헤더에는 −/+ 가 없다', SRC.includes('vc-head-right'), false);
  sc.eq('좌우 자리 폭이 같다', SRC.includes('.vc-head-slot{width:22px;'), true);
  sc.eq('오른쪽 자리에는 늘 목록 전환 버튼이 있다',
        /<span class="vc-head-slot right"><button class="vc-icbtn" onclick="vcSetView/.test(SRC), true);
  // 밀어 넘길 때 같이 따라가면 안 되므로 슬라이드 층(.vc-slide) 밖, .vc-body 바로 아래에 둔다
  sc.eq('−/+ 는 미는 층 밖에', SRC.includes('body=`${zoom}<div class="vc-slide">'), true);
  sc.eq('카드 안 우상단',
        SRC.includes('.vc-zoom{\n    position:absolute;top:5px;right:5px;z-index:6;'), true);
  // ── 0812-6 ──
  // 핀치가 자리를 대신하므로 손가락 기기에서는 −/+ 를 감춘다 (마우스 기기에만)
  sc.eq('손가락 기기에서는 감춘다', SRC.includes('.vc-zoom{display:none;}'), true);
  sc.eq('마우스가 있을 때만 보인다',
        /\.vc-zoom\{display:none;\}\n@media \(hover:hover\)\{\n  \.vc-zoom\{/.test(SRC), true);
  sc.eq('버튼 자체는 늘 그린다(잠금 상태를 그대로 쓴다)',
        SRC.includes("const zoom=`<div class=\"vc-zoom\">"), true);
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
  sc.eq('1행 말씀 카드·말씀 목록 · 2행 뷰',
        /const poolRows=\[\s*\[VC_NEW,VL_NEW\],\s*\['weekly','monthSingle','monthTriple'\]/.test(SRC), true);
  sc.eq('반응별 목록 칩은 사라졌다',
        /poolRows=\[[\s\S]{0,200}'likeList'/.test(SRC), false);
  sc.eq('칩을 끌어다 놓으면 새 위젯', SRC.includes('if(type===VC_NEW||type===VL_NEW){'), true);
  sc.eq('사용 안 함은 세로로 쌓고 줄만 가로', /\.rp-cfg-col\.pool\{flex-direction:column/.test(SRC), true);

  // ── 0810-4 ──
  // 헤더는 위젯 순서 이동 손잡이라, button 이 아니면 PC 클릭이 죽는다
  sc.eq('헤더의 범위 단추는 button', SRC.includes('<button class="vw-scope${withName?\'\':\' vw-scope-c\'}"'), true);
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

// ═══ 9-B. ⚠️ 구역 전체 스위치는 **상위** 스위치다 ═══
// 아래 개별 스위치의 값을 바꾸지 않는다 — 껐다 켜면 정해 둔 값이 그대로 살아난다.
console.log('\n시나리오 9-B — 전체 스위치는 하위 값을 건드리지 않는다');
{
  reset();
  const id = _vcCreate(null, null);
  const cfg = _vcGet(id);
  sc.eq('구역이 둘', Object.keys(_VC_SHOW_GROUP), ['meta', 'react']);
  sc.eq('어느 구역에 속하는지', [_vcGroupOf('verseCardTag'), _vcGroupOf('verseCardShare')], ['meta', 'react']);

  // 새 카드는 두 구역 모두 꺼진 채로 시작 (3-3 / 3-4)
  sc.eq('처음엔 좌하단이 안 보인다', _VC_SHOW_GROUP.meta.some(k => _vcShowFor(cfg, k)), false);
  sc.eq('처음엔 우하단도 안 보인다', _VC_SHOW_GROUP.react.some(k => _vcShowFor(cfg, k)), false);

  // 구역을 켜면 개별 값(기본 켜짐)대로 보인다
  setVcShowAll(id, 'react', true);
  sc.eq('구역을 켜면 다 보인다', _VC_SHOW_GROUP.react.every(k => _vcShowFor(cfg, k)), true);
  sc.eq('다른 구역은 그대로 꺼짐', _VC_SHOW_GROUP.meta.some(k => _vcShowFor(cfg, k)), false);

  // 개별로 두 개를 꺼 둔다
  setVcShow(id, 'verseCardLike', false);
  setVcShow(id, 'verseCardShare', false);
  sc.eq('개별로 끈 것은 안 보이고', _vcShowFor(cfg, 'verseCardLike'), false);
  sc.eq('나머지는 보인다', _vcShowFor(cfg, 'verseCardMem'), true);

  // ⚠️ 여기가 핵심 — 전체를 껐다 켜도 개별 값은 그대로
  setVcShowAll(id, 'react', false);
  sc.eq('전체를 끄면 다 안 보이지만', _VC_SHOW_GROUP.react.some(k => _vcShowFor(cfg, k)), false);
  sc.eq('개별 값은 저장돼 있다',
        [cfg.show.verseCardLike, cfg.show.verseCardShare, cfg.show.verseCardMem],
        [false, false, undefined]);
  setVcShowAll(id, 'react', true);
  sc.eq('다시 켜면 껐던 것은 여전히 꺼져 있고', _vcShowFor(cfg, 'verseCardLike'), false);
  sc.eq('공유도 여전히 꺼져 있고', _vcShowFor(cfg, 'verseCardShare'), false);
  sc.eq('켜 뒀던 것만 돌아온다', _vcShowFor(cfg, 'verseCardMem'), true);

  sc.eq('없는 구역은 조용히 넘어간다', (setVcShowAll(id, '없음', false), true), true);

  // 0811-1 이전에 만든 카드는 전체 스위치 개념이 없었다 = 켜져 있던 셈
  reset();
  _vcAll()['old1'] = { kind: null, theme: null, textScale: 0.8, ref: null, show: {} };
  const old = _vcGet('old1');
  sc.eq('옛 카드는 켜진 채로 옮겨진다',
        [_vcGroupOn(old, 'meta'), _vcGroupOn(old, 'react')], [true, true]);
  sc.eq('그래서 지금 보이는 대로 유지된다', _vcShowFor(old, 'verseCardLike'), true);
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

// ═══ 시트 셀 열기 — 여는 것은 즉시(타이머), 복사는 손 뗄 때(click) (v26-0817-2) ═══
// ⚠️ 0813-11 에서는 여는 것과 복사가 한 함수(_openSheetUrl)에 붙어 있었는데,
//    실기기에서 모바일 클립보드 복사가 계속 실패했다(0813-12, 0817-1).
//    원인은 아이폰이 click(터치 뒤 오는 합성 이벤트)만 클립보드의 "진짜 사용자
//    조작"으로 인정하는 것 — 그런데 복사를 click 까지 미루면 화면 전환도 같이
//    미뤄져서, "붙잡고 있으면 바로 앱으로 넘어가던" 예전 느낌이 사라졌다
//    (HB 재신고). location.href 로 앱을 부르는 것 자체는 제스처 제약이 없으므로,
//    **여는 것(_sheetGo)은 타이머(붙잡은 채로)에서 즉시, 복사(_sheetCopyPending)는
//    click(뗀 뒤)에서** 하도록 완전히 갈랐다.
console.log('\n시나리오 — 시트 열기: 즉시 전환 + 손 뗄 때 복사, 토스트 없음');
{
  sc.eq('여는 함수와 복사 함수가 갈라져 있다',
        SRC.includes('function _sheetGo(url){') && SRC.includes('function _sheetCopyPending(keep){'), true);
  sc.eq('vfOpenSheetForCat 이 복사할 본문을 미리 적어 둔다',
        SRC.includes("_sheetPendingCopyText=(v&&v.krText)||'';"), true);
  sc.eq('그리고 곧장 연다', SRC.includes('_sheetGo(t.url);'), true);

  // ⚠️ v26-0817-4 — **복사가 먼저, 전환이 나중**이어야 한다.
  //    0817-2 는 복사를 click 에만 맡겼는데, 타이머에서 앱으로 넘어가면 그 click
  //    자체가 오지 않아(touchcancel) "전환은 되는데 복사는 안 되는" 상태가 됐다.
  const openFn = SRC.slice(SRC.indexOf('function vfOpenSheetForCat(){'),
                           SRC.indexOf('// 시트 열기는 **기기에 따라'));
  sc.eq('붙잡고 있는 동안 한 번 복사한다', openFn.includes('_sheetCopyPending(true);'), true);
  sc.eq('복사가 화면 전환보다 먼저 온다',
        openFn.indexOf('_sheetCopyPending(true);') < openFn.indexOf('_sheetGo(t.url);'), true);

  const goFn = SRC.slice(SRC.indexOf('function _sheetGo(url){'), SRC.indexOf('function _sheetCopyPending('));
  // 모바일 — 여전히 네이티브 앱을 부른다
  sc.eq('안드로이드는 앱을 콕 집어', goFn.includes('package=com.google.android.apps.docs.editors.sheets;'), true);
  sc.eq('앱이 없으면 웹으로(안드로이드 OS 폴백)', goFn.includes('S.browser_fallback_url='), true);
  sc.eq('아이폰도 앱으로', goFn.includes("const appUrl='googlesheets://'+url.replace("), true);
  // PC — 0813-9 에서 확인된 웹 경로는 그대로 남아 있어야 한다
  sc.eq('PC 는 새 탭(웹)으로', goFn.includes('BibleLinkProvider._openInApp(url);'), true);
  // _sheetGo 안에는 클립보드 코드가 없어야 한다(복사는 별도 함수로 완전히 분리)
  sc.eq('여는 함수엔 클립보드가 없다', /clipboard|_fallbackCopy/.test(goFn), false);

  const copyFn = SRC.slice(SRC.indexOf('function _sheetCopyPending(keep){'), SRC.indexOf('function _vgOpenFromReels('));
  sc.eq('PC 는 복사를 건너뛴다', copyFn.includes('if(!isAndroid&&!isIOS)return;'), true);
  sc.eq('클립보드로 시도한다', copyFn.includes('navigator.clipboard.writeText(txt)'), true);
  // keep=true(붙잡고 있는 동안)면 본문을 지우지 않는다 — click 이 오면 한 번 더 시도한다
  sc.eq('keep 면 본문을 남겨 둔다', copyFn.includes("if(!keep)_sheetPendingCopyText='';"), true);
  // 손가락이 닿아 있는 동안에는 execCommand 쪽이 더 잘 통한다 — 둘 다 건다
  sc.eq('붙잡은 동안엔 대체 수단도 같이', /if\(keep\)\{[\s\S]{0,120}_fallbackCopy\(txt\)/.test(copyFn), true);

  // 토스트가 전부 빠졌는지
  sc.eq('여는 함수에 토스트 없음', /showToast/.test(goFn), false);
  sc.eq('복사 함수에도 토스트 없음', /showToast/.test(copyFn), false);
  sc.eq('행 위치 안내도 뺐다', SRC.includes('행 위치는 한 번 동기화한 뒤부터 정확해져요'), false);
  // 시트에서 온 게 아닐 때의 안내는 남아 있다 (화면이 안 바뀌는 경우라 여전히 필요)
  sc.eq('시트 출처가 아닐 때 안내는 남는다',
        SRC.includes("if(!t){showToast('이 말씀은 구글 시트에서 가져온 것이 아니에요');return;}"), true);

  // URL 쪽(0813-8)은 그대로 유지돼야 한다 — PC 에서 셀을 잡는 데 필요하다
  sc.eq('행 범위는 그대로 붙인다', SRC.includes('&range=A${hit.row}:G${hit.row}'), true);
}

// ═══ 공유 이미지 BLOCK7 로고 자리 (v26-0817-4) ═══
// ⚠️ 실측으로 세 번 헛짚은 자리다. 숫자로 남겨 둔다.
//    · 0817-2: 우측 여백을 pad(위쪽 여백)에 맞춤 → 모바일 65/65 로 대칭은 맞았다.
//    · 0817-3: 우측 여백을 액션 열의 실제 우측 여백에 맞춤 → 모바일 65/55 로 개선.
//      그런데 **PC(가로 화면)에서는 이 줄이 아예 실행되지 않았다** — 가로 화면은
//      액션 열이 화면 높이를 거의 다 써서 fitsRight 가 항상 false 였고,
//      그때 lx=pad 로 떨어져 로고가 **좌상단**에 찍혔다(실측 3840×2160:
//      액션 윗선 207 < 로고 아랫선 249 → 세로로 겹침 판정).
//    · 0817-4: 겹칠 때 좌상단으로 도망가지 말고 **액션 열 바로 왼쪽**으로만 비켜선다.
console.log('\n시나리오 — 공유 이미지 로고가 가로 화면에서도 우상단에 남는다');
{
  // ⚠️ 'return cv;' 는 앞의 _vfRenderCard 에도 있다 — 반드시 시작점 뒤에서 찾는다
  const lgFrom = SRC.indexOf('  if(o.inclBlock7){');
  const lg = SRC.slice(lgFrom, SRC.indexOf('  return cv;\n}', lgFrom));
  sc.eq('액션 열의 좌·우 끝을 모두 잰다',
        lg.includes('actLeft=Math.min(actLeft,X(rr.left));') &&
        lg.includes('actRight=Math.max(actRight,X(rr.right));'), true);
  sc.eq('안 겹치면 액션 열의 우측 여백에 맞춰 모서리에',
        lg.includes('lx=W-actRightMargin-wAll;'), true);
  sc.eq('겹치면 좌상단이 아니라 액션 열 왼쪽으로 비켜선다',
        lg.includes('lx=actLeft-fs*0.9-wAll;'), true);
  sc.eq('좌상단은 그래도 자리가 없을 때만',
        lg.includes('if(lx<pad)lx=pad;'), true);
  // 0817-2 에서 지운 '무조건 밀어내기'가 되살아나면 모바일 여백이 다시 벌어진다.
  // → fitsRight(안 겹침) 갈래 안에서는 actLeft 를 쳐다보지도 않아야 한다.
  const yes = lg.slice(lg.indexOf('if(fitsRight){'), lg.indexOf('}else{'));
  sc.eq('안 겹칠 때 갈래엔 밀어내기가 없다', yes.includes('actLeft'), false);
}

// ═══ 드래그 유령의 진하기 (v26-0817-4) ═══
// ⚠️ 손에 붙어 다니는 것은 #dg(유령)이고, .drag-active 는 제자리에 남는 원래 줄이다.
//    0817-3 에서 .drag-active 만 낮췄더니 "티가 안 난다"는 신고를 받았다 —
//    드롭 표시선을 가리던 것은 #dg 쪽이었다.
console.log('\n시나리오 — 드래그 중 표시선이 유령에 가리지 않는다');
{
  const dg = SRC.slice(SRC.indexOf('#dg{'), SRC.indexOf('/* ── TRASH PANEL ── */'));
  sc.eq('유령을 절반으로 낮췄다', dg.includes('opacity:.48;'), true);
  sc.eq('예전의 .96 은 없다', dg.includes('opacity:.96;'), false);
}

// ═══ Deeper · Even Deeper 도 토스트 없음 (v26-0813-11) ═══
// ⚠️ 둘 다 곧장 다른 앱/사이트로 넘어가는 동작이라 성공·실패 알림 모두 뺐다.
console.log('\n시나리오 — Deeper·Even Deeper 토스트 없음');
{
  sc.eq('BibleLinkProvider.open 에 토스트 없음',
        /open\(url\)\{[\s\S]*?if\(!url\)return;/.test(SRC), true);
  sc.eq('링크 실패 안내를 없앴다', SRC.includes('대한성서공회 사이트 링크를 열지 못했어요'), false);
  sc.eq('Even Deeper 복사 실패 안내를 없앴다', SRC.includes("ChatGPT에 '"), false);
  const ed = SRC.slice(SRC.indexOf('function openEvenDeeperFromRef(ref){'),
                       SRC.indexOf('// 지금 시각이 속한'));
  sc.eq('Even Deeper 는 여전히 복사 먼저, 열기는 나중', ed.includes('.finally(go);'), true);
}

// ═══ 롱터치 — 화면은 즉시(타이머), 억제 표시도 그때 같이 (v26-0817-2) ═══
// ⚠️ 0817-1 에서는 여는 것 자체를 click(뗀 뒤)으로 미뤘는데, 그러면 "붙잡고
//    있으면 바로 앱으로 넘어가던" 예전 느낌이 사라진다며 HB 가 재신고했다.
//    화면 전환(location.href)은 클립보드와 달리 제스처 제약이 없으므로,
//    타이머 콜백(붙잡은 채로) 안에서 곧장 vfOpenSheetForCat() 을 부른다 —
//    억제 표시(_vfCatLongFired)도 자연히 같은 자리에서 같이 선다.
//    복사만 click(뗀 뒤)으로 남겨 둔다.
console.log('\n시나리오 — 롱터치는 타이머에서 곧장 연다');
{
  const fn = SRC.slice(SRC.indexOf('function _initVfCatSheet(){'),
                       SRC.indexOf('function vfOpenSheetForCat('));
  // 타이머 콜백 안에서 억제 표시와 함께 곧장 연다
  sc.eq('타이머가 억제 표시와 함께 곧장 연다',
        fn.includes('t=setTimeout(()=>{t=null;held=true;_vfCatLongFired=true;vfOpenSheetForCat();},500);'),
        true);
  // click 은 이제 복사만 한다 — vfOpenSheetForCat 을 다시 부르지 않는다
  sc.eq('click 은 복사만 한다',
        /addEventListener\('click',\(\)=>\{[\s\S]{0,80}_sheetCopyPending\(\);/.test(fn), true);
  sc.eq('click 이 vfOpenSheetForCat 을 다시 부르지 않는다',
        /addEventListener\('click',\(\)=>\{[\s\S]{0,120}vfOpenSheetForCat/.test(fn), false);
  sc.eq('다 채우지 못했으면 아무 일도 안 한다', fn.includes('if(!held)return;'), true);
  // vfCatTap 은 여전히 HTML onclick 으로 먼저 등록된다 (등록 순서가 곧 억제 순서다)
  sc.eq('vfCatTap 은 inline onclick', SRC.includes('<div id="vfCat" onclick="vfCatTap()">'), true);
  // 우클릭(contextmenu)은 그 자체가 즉시 발생하는 제스처라 그대로 둔다
  sc.eq('우클릭은 그대로 즉시', fn.includes("cat.addEventListener('contextmenu',e=>{"), true);
}

sc.done();
