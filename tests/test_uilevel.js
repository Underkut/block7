// 설정 등급(이지·미드·파워)이 표대로 감추는지 고정한다 (v26-0805-1)
//
// 규칙: 화면 요소에 data-lv 로 "어느 등급에서 보이는지"를 적는다.
//   data-lv 없음 → 언제나 보임 (표의 O/O/O)
//   data-lv="mp" → 미드·파워만            (표의 X/O/O)
//   data-lv="p"  → 파워만                 (표의 X/X/O)
// 빠뜨리면 "안 보여야 할 게 보이는" 쪽으로 틀리도록 일부러 이렇게 뒀다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.ST = { settings: {} };
global.document = { querySelectorAll: () => [], getElementById: () => null };
eval(
  slice('const UI_LEVELS=', 'function applyUiLevel(') +
  ';Object.assign(globalThis,{UI_LEVELS,_UILV_KEY,uiLevel,_stabList,SETTINGS_TABS:' +
  JSON.stringify(['general','notify','view','buttons','sections','account']) + '});'
);

// data-lv="..." 를 가진 줄에서 [등급문자, 그 줄 전체] 를 뽑는다
const marks = [...SRC.matchAll(/data-lv="([^"]*)"/g)].map(m => m[1]);

// ═══ 1. 등급 값 자체 ═══
console.log('시나리오 1 — 등급 값');
{
  sc.eq('세 등급', UI_LEVELS, ['easy', 'mid', 'power']);
  ST.settings.uiLevel = 'easy';  sc.eq('이지', uiLevel(), 'easy');
  ST.settings.uiLevel = 'mid';   sc.eq('미드', uiLevel(), 'mid');
  ST.settings.uiLevel = 'power'; sc.eq('파워', uiLevel(), 'power');
  ST.settings.uiLevel = '엉뚱한값';
  sc.eq('모르는 값이면 파워 (숨기지 않는 쪽으로)', uiLevel(), 'power');
  delete ST.settings.uiLevel;
  sc.eq('값이 없으면 파워', uiLevel(), 'power');
}

// ═══ 2. 표기 규칙 ═══
console.log('\n시나리오 2 — data-lv 표기');
{
  sc.eq('data-lv 를 쓴 곳이 있다', marks.length > 0, true);
  sc.eq('쓰는 값은 mp / p 두 가지뿐',
        [...new Set(marks)].sort(), ['mp', 'p']);
  // 'e' 만 적힌 값(=이지에서만 보임)은 이 앱에 없어야 한다 — 등급이 올라가면
  // 보이던 게 사라지는 셈이라 표의 뜻과 어긋난다
  sc.eq("이지에서만 보이는 항목은 없다", marks.some(m => m === 'e' || m === 'em'), false);
}

// ═══ 3. 등급별로 보이는지 판정 ═══
console.log('\n시나리오 3 — 등급별 보임/숨김');
{
  const shown = (lv, spec) => spec.includes(_UILV_KEY[lv]);
  sc.eq('mp — 이지에선 숨김', shown('easy', 'mp'), false);
  sc.eq('mp — 미드에선 보임', shown('mid', 'mp'), true);
  sc.eq('mp — 파워에선 보임', shown('power', 'mp'), true);
  sc.eq('p — 미드에선 숨김', shown('mid', 'p'), false);
  sc.eq('p — 파워에서만 보임', shown('power', 'p'), true);
}

// ═══ 4. 탭 — 이지는 '버튼' 탭 자체가 없다 ═══
console.log('\n시나리오 4 — 탭 목록');
{
  ST.settings.uiLevel = 'easy';
  sc.eq('이지 탭', _stabList(), ['general', 'notify', 'view', 'sections', 'account']);
  ST.settings.uiLevel = 'mid';
  sc.eq('미드 탭', _stabList(), ['general', 'notify', 'view', 'buttons', 'sections', 'account']);
  ST.settings.uiLevel = 'power';
  sc.eq('파워 탭 수', _stabList().length, 6);
  // 트랙 이동은 "보이는 탭 목록"의 자리로 계산해야 한다
  ST.settings.uiLevel = 'easy';
  sc.eq('이지에서 계정탭은 다섯 번째(0부터 4)', _stabList().indexOf('account'), 4);
}

// ═══ 4-2. 유저 모드 — 아이콘 두 벌 ═══
console.log('\n시나리오 4-2 — 유저 모드(동물 / 사각)');
{
  const art = SRC.slice(SRC.indexOf('const _UILV_ART='), SRC.indexOf('function uiLevelIconSet('));
  sc.eq('두 벌이 다 있다', art.includes('animal:') && art.includes('square:'), true);
  sc.eq('사각은 10×10', /square:\s*\{\s*box:10/.test(art.replace(/\s+/g, ' ').replace('square: {', 'square:{')), true);
  sc.eq('동물은 18×18', /animal:\s*\{\s*box:18/.test(art.replace(/\s+/g, ' ').replace('animal: {', 'animal:{')), true);
  sc.eq('선 굵기는 둘 다 .75', (art.match(/sw:'\.75'/g) || []).length, 2);
  sc.eq('세 등급이 두 벌 모두에 있다',
        (art.match(/easy:/g) || []).length === 2 &&
        (art.match(/mid:/g) || []).length === 2 &&
        (art.match(/power:/g) || []).length === 2, true);
  sc.eq('설정창 뷰탭 첫 항목이 유저 모드', SRC.includes('<div class="settings-section-title">유저 모드</div>'), true);
  sc.eq('아이콘 간격은 두 벌 같게 (10.5px)', (SRC.match(/gap:10\.5px/g) || []).length >= 2, true);
}

// ═══ 5. 표에서 옮기기로 한 것들이 실제로 옮겨졌나 ═══
console.log('\n시나리오 5 — 옮긴 항목·바꾼 문구');
{
  const notifyTab = SRC.slice(SRC.indexOf('id="stab-notify"'), SRC.indexOf('id="stab-view"'));
  const secTab = SRC.slice(SRC.indexOf('id="stab-sections"'), SRC.indexOf('id="stab-account"'));
  const btnTab = SRC.slice(SRC.indexOf('id="stab-buttons"'), SRC.indexOf('id="stab-sections"'));
  const vsGeneral = SRC.slice(SRC.indexOf('id="vstab-general"'), SRC.indexOf('id="vstab-alarm"'));

  sc.eq('구간 알림 제목 문구 → 알림탭으로', notifyTab.includes('sectionSfxRow'), true);
  sc.eq('구간탭에는 더 이상 없다', secTab.includes('sectionSfxRow'), false);
  sc.eq('할일뷰 말씀 표시 → 말씀 설정창으로', vsGeneral.includes('setDviewMarkLike'), true);
  sc.eq('버튼탭에는 더 이상 없다', btnTab.includes('setDviewMarkLike'), false);

  sc.eq('푸시 알림 → 하루 할일 보고', notifyTab.includes('하루 할일 보고'), true);
  sc.eq('아침 하루 요약 → 알림 시각', notifyTab.includes('>알림 시각<'), true);
  sc.eq("'할일 알림' 제목은 지웠다", notifyTab.includes('>할일 알림<'), false);
  sc.eq('화면 크기 → 글자 크기', SRC.includes('>글자 크기<'), true);
  sc.eq('스몰 블럭 보이기 → 스몰 블럭 사용', SRC.includes('>스몰 블럭 사용<'), true);
}

sc.done();
