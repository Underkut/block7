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
  // ⚠️ v26-0819-3, HB 3-3 — 'em'(이지·미드에만) 이 유일한 예외로 하나 추가됐다.
  //    말씀설정 뷰탭 '할일뷰에 표시' 옆의 아이콘 미리보기: 파워에서는 실제
  //    토글 네 줄(data-lv="p")이 바로 아래 보여서 같은 정보를 대체하지, 감추는
  //    게 아니다 — 그래서 아래 "이지에서만 보이는 항목은 없다" 규칙과는 다르다.
  sc.eq('쓰는 값은 mp / p / em 세 가지뿐',
        [...new Set(marks)].sort(), ['em', 'mp', 'p']);
  // 'e' 만 적힌 값(=이지에서만 보임)은 이 앱에 없어야 한다 — 등급이 올라가면
  // 보이던 게 사라지는 셈이라 표의 뜻과 어긋난다. ('em' 은 위 주석의 확인된 예외.)
  sc.eq("이지에서만 보이는 항목은 없다", marks.some(m => m === 'e'), false);
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
  // 고르는 자리는 파워에서만 보인다
  const sec = SRC.slice(SRC.indexOf('유저 모드 — 설정창 헤더'), SRC.indexOf('유저 모드</div>'));
  sc.eq('유저 모드 항목은 파워 전용', sec.includes('data-lv="p"'), true);
  sc.eq('기본값은 동물', /uiLevelIconSet:'animal'/.test(SRC), true);
  sc.eq("'square' 를 고른 것만 사각", SRC.includes("uiLevelIconSet==='square')?'square':'animal'"), true);
}

// ═══ 5. 표에서 옮기기로 한 것들이 실제로 옮겨졌나 ═══
console.log('\n시나리오 5 — 옮긴 항목·바꾼 문구');
{
  const notifyTab = SRC.slice(SRC.indexOf('id="stab-notify"'), SRC.indexOf('id="stab-view"'));
  const secTab = SRC.slice(SRC.indexOf('id="stab-sections"'), SRC.indexOf('id="stab-account"'));
  const btnTab = SRC.slice(SRC.indexOf('id="stab-buttons"'), SRC.indexOf('id="stab-sections"'));
  // v26-0819-2 — 뷰탭이 vstab-general 에서 vstab-view 로 갈라져 나왔다
  const vsGeneral = SRC.slice(SRC.indexOf('id="vstab-view"'), SRC.indexOf('id="vstab-alarm"'));

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

// ═══ 말씀 설정창 '보여줄 항목' 버튼 (0813-5) ═══
// ⚠️ 이 항목들은 <input type=checkbox> 가 아니라 **버튼**(.preset-btn)이다.
//    켜짐은 .on 클래스로 보인다 — .checked 를 넣으면 아무 일도 일어나지 않아
//    설정창을 열 때마다 저장값과 무관하게 '다 켜진 것'처럼 보였고, 그 상태에서
//    누르면 의도와 정반대로 저장됐다 (HB: 본문·장절만 켜 놨는데 다 나옴).
console.log('\n시나리오 — 보여줄 항목 버튼이 저장값을 비춘다');
{
  // 표가 있고, 세 묶음(전체화면·스닉픽·위젯)을 모두 덮는다
  sc.eq('표가 있다', SRC.includes('const _VSET_ITEM_BTNS=['), true);
  const tbl = SRC.slice(SRC.indexOf('const _VSET_ITEM_BTNS=['), SRC.indexOf('function renderVerseSettingsModal()'));
  const ids = [...tbl.matchAll(/'(set\w+)'/g)].map(m => m[1]);
  ['setVerseFullCat','setVerseFullTopic','setVerseFullRef','setVerseFullTag',
   'setVerseSneakCat','setVerseSneakTopic','setVerseSneakRef','setVerseSneakFirstWord','setVerseSneakTag',
   'setVerseWidgetCat','setVerseWidgetTopic','setVerseWidgetText','setVerseWidgetRef','setVerseWidgetTag']
    .forEach(id => sc.eq('표에 ' + id, ids.indexOf(id) >= 0, true));
  // 그 버튼들이 정말 <button> 인지 (input 이면 .checked 가 맞다)
  ids.forEach(id => {
    const m = new RegExp('<(\\w+)[^>]*id="' + id + '"').exec(SRC);
    sc.eq(id + ' 는 버튼', m && m[1], 'button');
  });
  // ⚠️ .checked 로 되돌리면 안 된다
  sc.eq('checked 로 맞추지 않는다', /set(VerseFull|VerseSneak|VerseWidget)\w+'\)\)el\('set\w+'\)\.checked/.test(SRC), false);
  sc.eq('클래스로 맞춘다',
        SRC.includes("_VSET_ITEM_BTNS.forEach(([id,key])=>el(id)?.classList.toggle('on',s[key]!==false));"), true);
  // 두 설정창이 같은 표를 쓴다 (한쪽만 고치면 다른 창에서 어긋난다)
  sc.eq('두 창이 같은 표를 쓴다', (SRC.match(/_VSET_ITEM_BTNS\.forEach/g) || []).length, 2);
}

// ═══ 스닉픽 한 줄이 말씀 영역을 넘지 않는다 (0813-5) ═══
// ⚠️ 예전엔 본문만 줄어들 수 있어서, 항목을 다 켜고 태그가 긴 구절을 만나면
//    줄이 통째로 영역 밖으로 넘쳤다 (실측: 영역 362px 에 글자 567px, 좌우 103px 씩).
console.log('\n시나리오 — 스닉픽이 영역을 넘지 않는다');
{
  const css = SRC.slice(SRC.indexOf('#verseBarInner.sneak-mode{'), SRC.indexOf('#verseBarInner.sneak-mode #verseBarFirstWord'));
  // 소주제·태그도 줄어들 수 있어야 한다
  sc.eq('소주제·태그가 줄어든다',
        /#verseBarInner\.sneak-mode #verseBarTopic,\s*\n#verseBarInner\.sneak-mode #verseBarTag\{[^}]*flex:0 1 auto/.test(SRC), true);
  sc.eq('말줄임이 걸린다', /#verseBarTag\{[\s\S]{0,120}text-overflow:ellipsis/.test(css), true);
  sc.eq('태그부터 줄인다', SRC.includes('#verseBarInner.sneak-mode #verseBarTag{flex-shrink:3;}'), true);
  // 대분류·장절은 그대로 (짧고, 구절을 알아보는 데 필요하다)
  sc.eq('대분류·장절은 안 줄어든다',
        /#verseBarInner\.sneak-mode #verseBarCat,\s*\n#verseBarInner\.sneak-mode #verseBarRef,[\s\S]{0,80}flex:0 0 auto/.test(SRC), true);
  // 마지막 안전장치 — 그래도 넘치면 잘라 낸다
  sc.eq('넘치면 잘라 낸다', SRC.includes('#verseBarInner.sneak-mode{overflow:hidden;}'), true);
}

// ═══ 전체화면 탭 — 글자 크기 버튼 4등분 · 첫 사용자 기본값 (0813-7) ═══
console.log('\n시나리오 — 글자 크기 버튼 4등분 · 테마 기본 8개');
{
  // 글자 크기 네 버튼만 4등분 격자로 바꾼다 — 말씀카드 위젯의 5단계 줄은 그대로 둔다
  sc.eq('전용 클래스로만 바꾼다', SRC.includes('<div class="ts-row ts-row-eq">'), true);
  sc.eq('4등분 격자', /\.ts-row-eq\{[^}]*grid-template-columns:repeat\(4,1fr\)/.test(SRC), true);
  sc.eq('칸은 같은 폭', SRC.includes('.ts-row-eq .ts-btn{flex:none;width:100%;}'), true);
  // 버튼 안 글자 크기(9~16px)는 그대로 남아 있어야 한다
  ['9px','11px','13.5px','16px'].forEach(px=>
    sc.eq(px+' 유지', SRC.includes('style="font-size:'+px+';"'), true));
  // 위젯 쪽 5단계 글자 크기 줄(.ts-row, ts-row-eq 없음)은 영향 없다
  sc.eq('위젯 줄은 그대로', SRC.includes('<div class="ts-row">${VC_TS_STEPS.map(tsBtn).join(\'\')}</div>'), true);

  // 첫 사용자 기본값
  sc.eq('별 개수 기본 1', SRC.includes('hiStarMax:1,'), true);
  sc.eq('테마 8개 기본 켬',
        SRC.includes("vfThemes:['night','ink','dawn','sanctuary','paper','aurora','riso','neon'],"), true);
  // 테마 8개가 실제 VF_PATTERNS 키와 일치하는지 (하나라도 오탈자면 그 테마가 안 켜진다)
  const keys = [...SRC.matchAll(/^\s*([a-z]+):\{label:'/gm)]
    .map(m => m[1]);
  const patStart = SRC.indexOf('const VF_PATTERNS={');
  const patEnd = SRC.indexOf('\n};', patStart);
  const patKeys = [...SRC.slice(patStart, patEnd).matchAll(/^\s*([a-z]+):\{label/gm)].map(m => m[1]);
  const m = /vfThemes:\[('[a-z]+',?)+\]/.exec(SRC);
  const defaultThemes = m[0].match(/'([a-z]+)'/g).map(x => x.slice(1, -1));
  sc.eq('기본 테마 8개', defaultThemes.length, 8);
  sc.eq('전부 실재하는 테마 키', defaultThemes.every(k => patKeys.indexOf(k) >= 0), true);
  sc.eq('실재 테마도 8개뿐', patKeys.length, 8);
}

sc.done();
