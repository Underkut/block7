// BB1 1단계 — 일반 설정 → 뷰 탭 "화면 스타일"(디자인 프리셋) 회귀 테스트.
// 밝기(다크/라이트/시스템)는 그대로 두고, 그와 별개인 두 번째 축으로
// uiThemePreset(classic/fiery-ocean)을 추가했다. 기본(classic)은 기존
// 색상·글꼴과 완전히 같아야 하고, 프리셋을 몰라도(구버전) 저장값을
// 덮어쓰지 않아야 한다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ═══ 1. 설정 기본값 ═══
console.log('시나리오 1 — 설정 기본값');
{
  sc.eq('_settingsDefaults 에 uiThemePreset:classic 백필', SRC.includes("uiThemePreset:'classic'"), true);
}

// ═══ 2. 말씀 전용 글꼴·테마 엔진은 건드리지 않는다 ═══
console.log('\n시나리오 2 — 말씀 전용 영역 무변경');
{
  sc.eq('VF_SANS 은 그대로 리터럴 Pretendard',
        SRC.includes("const VF_SANS=\"Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif\";"), true);
  sc.eq('기본 말씀테마 8개 그대로',
        SRC.includes("vfThemes:['night','ink','dawn','sanctuary','paper','aurora','riso','neon']"), true);
  sc.eq('--vf-font 존재', SRC.includes('--vf-font'), true);
  sc.eq('--vf-reffont 존재', SRC.includes('--vf-reffont'), true);
  sc.eq('VF_PATTERNS 존재', SRC.includes('const VF_PATTERNS={'), true);
}

// ═══ 3. 하드코딩 파란색 → 의미 변수 ═══
console.log('\n시나리오 3 — rgba(90,112,248) 정리');
{
  const acRgbUses = (SRC.match(/rgba\(var\(--ac-rgb\),\.\d+\)/g) || []).length;
  sc.eq('활성/선택 표시용 반투명 배경이 var(--ac-rgb) 로', acRgbUses, 16);
  sc.eq('오늘 셀 테두리(--today-cell-border류)는 프리셋별로 따로 정하므로 그대로',
        (SRC.match(/rgba\(90,112,248,/g) || []).length, 2);
  sc.eq(':root 에 --ac-rgb 정의', /--ac-rgb:90,112,248;/.test(SRC), true);
}

// ═══ 4. Fiery Ocean CSS 블록 존재 ═══
console.log('\n시나리오 4 — 화면 스타일 CSS 블록');
{
  sc.eq('다크(기본) 블록', SRC.includes('html[data-preset="fiery-ocean"] {'), true);
  sc.eq('라이트 블록', SRC.includes('html[data-preset="fiery-ocean"][data-theme="light"] {'), true);
}

// ═══ 5. 설정창 문구·구조 ═══
console.log('\n시나리오 5 — 설정창 뷰탭 문구');
{
  sc.eq('화면 스타일 제목', SRC.includes('<div class="settings-row-label lv1">화면 스타일</div>'), true);
  sc.eq('화면 스타일 설명', SRC.includes('앱 전체의 색상과 글꼴을 한 번에 바꿔요.'), true);
  sc.eq('밝기로 이름 바뀜(기존 "테마")', SRC.includes('<div class="settings-row-label lv1">밝기</div>'), true);
  sc.eq('밝기 설명', SRC.includes('화면을 어둡게, 밝게, 또는 기기 설정에 맞춰요.'), true);
  sc.eq('밝기 버튼 3개(다크/라이트/시스템) 그대로',
        SRC.includes('id="themeBtnDark"') && SRC.includes('id="themeBtnLight"') && SRC.includes('id="themeBtnSystem"'), true);
  sc.eq('프리셋 카드 컨테이너', SRC.includes('id="uiThemePresetCards"'), true);
  const sec = SRC.slice(SRC.indexOf('<!-- 화면 스타일(디자인 프리셋) -->'), SRC.indexOf('id="uiThemePresetCards"'));
  sc.eq('화면 스타일 섹션엔 data-lv 없음(이지·미드·파워 모두 노출)', /data-lv=/.test(sec), false);
  sc.eq('HTML 에 프리셋 버튼을 하드코딩하지 않았다(레지스트리를 읽어 그린다)',
        SRC.includes("Object.values(UI_THEME_PRESETS).map(p=>"), true);
}

// ═══ 6. 배선 — renderSettingsPanel / updateSetting ═══
console.log('\n시나리오 6 — 설정 저장·반영 배선');
{
  sc.eq('renderSettingsPanel 이 카드를 다시 그린다', SRC.includes('_renderUiThemePresetCards();'), true);
  sc.eq("updateSetting('uiThemePreset', ...) 분기",
        /if\(key==='uiThemePreset'\)\{\s*applyTheme\(ST\.settings\.theme\);\s*_renderUiThemePresetCards\(\);\s*\}/.test(SRC), true);
}

// ═══ 7. 레지스트리 + applyTheme() 동작 ═══
console.log('\n시나리오 7 — 레지스트리·적용 함수 동작');
{
  const systemQuery = { matches: false, addEventListener(){} }; // matches = "OS가 라이트냐"
  global.window = { matchMedia: () => systemQuery };
  let metaContent = null;
  const meta = { setAttribute: (k, v) => { metaContent = v; } };
  const htmlEl = { dataset: {} };
  global.document = {
    querySelector: (sel) => sel.includes('theme-color') ? meta : null,
    documentElement: htmlEl,
    getElementById: () => null,
  };
  global.ST = { settings: { theme: 'dark', uiThemePreset: 'classic' } };

  eval(slice(
    "const _systemThemeQuery=window.matchMedia?window.matchMedia('(prefers-color-scheme: light)'):null;",
    '// If the user picked "시스템" and the OS theme changes while the app'
  ) + ';Object.assign(globalThis,{UI_THEME_PRESETS,_resolveUiThemePreset,applyTheme,_renderUiThemePresetCards});');

  sc.eq('레지스트리에 classic·fiery-ocean 둘 다 있다',
        Object.keys(UI_THEME_PRESETS).sort(), ['classic', 'fiery-ocean']);
  sc.eq('프리셋마다 미리보기 색 5개', Object.values(UI_THEME_PRESETS).every(p => p.preview.length === 5), true);

  sc.eq('_resolveUiThemePreset — 모르는 id → classic', _resolveUiThemePreset('없는프리셋'), 'classic');
  sc.eq('_resolveUiThemePreset — undefined → classic', _resolveUiThemePreset(undefined), 'classic');
  sc.eq('_resolveUiThemePreset — fiery-ocean 은 그대로', _resolveUiThemePreset('fiery-ocean'), 'fiery-ocean');

  // 2. 기본 + 다크 → 기존 다크와 같은 값
  htmlEl.dataset = {};
  applyTheme('dark');
  sc.eq('기본+다크: data-theme 없음(기존과 동일)', htmlEl.dataset.theme, undefined);
  sc.eq('기본+다크: data-preset 없음(기존과 동일)', htmlEl.dataset.preset, undefined);
  sc.eq('기본+다크: theme-color 는 기존 값 #0d0e10', metaContent, '#0d0e10');

  // 3. 기본 + 라이트 → 기존 라이트와 같은 값
  htmlEl.dataset = {};
  applyTheme('light');
  sc.eq('기본+라이트: data-theme=light(기존과 동일)', htmlEl.dataset.theme, 'light');
  sc.eq('기본+라이트: data-preset 없음', htmlEl.dataset.preset, undefined);
  sc.eq('기본+라이트: theme-color 는 기존 값 #f5f6fa', metaContent, '#f5f6fa');

  // 5. Fiery Ocean + 라이트
  ST.settings.uiThemePreset = 'fiery-ocean';
  htmlEl.dataset = {};
  applyTheme('light');
  sc.eq('FO+라이트: data-theme=light', htmlEl.dataset.theme, 'light');
  sc.eq('FO+라이트: data-preset=fiery-ocean', htmlEl.dataset.preset, 'fiery-ocean');
  sc.eq('FO+라이트: theme-color = 크림(#FDF0D5)', metaContent, '#FDF0D5');

  // 6. Fiery Ocean + 다크
  htmlEl.dataset = {};
  applyTheme('dark');
  sc.eq('FO+다크: data-theme 없음', htmlEl.dataset.theme, undefined);
  sc.eq('FO+다크: data-preset=fiery-ocean', htmlEl.dataset.preset, 'fiery-ocean');
  sc.eq('FO+다크: theme-color = 오션(#001F2D)', metaContent, '#001F2D');

  // 9. 알 수 없는 프리셋 id — 화면만 기본, 저장값은 보존
  ST.settings.uiThemePreset = '구버전이-모르는-아이디';
  htmlEl.dataset = {};
  applyTheme('dark');
  sc.eq('모르는 id: 화면은 기본(data-preset 없음)', htmlEl.dataset.preset, undefined);
  sc.eq('모르는 id: theme-color 도 기본값', metaContent, '#0d0e10');
  sc.eq('모르는 id: 저장값 자체는 안 건드림', ST.settings.uiThemePreset, '구버전이-모르는-아이디');

  // 7. 시스템 밝기 — 프리셋의 라이트/다크 변형을 그대로 따라간다
  ST.settings.uiThemePreset = 'fiery-ocean';
  systemQuery.matches = true; // OS가 라이트
  htmlEl.dataset = {};
  applyTheme('system');
  sc.eq('시스템(OS 라이트)+FO: data-theme=light', htmlEl.dataset.theme, 'light');
  sc.eq('시스템(OS 라이트)+FO: theme-color = 크림', metaContent, '#FDF0D5');

  systemQuery.matches = false; // OS가 다크
  htmlEl.dataset = {};
  applyTheme('system');
  sc.eq('시스템(OS 다크)+FO: data-theme 없음', htmlEl.dataset.theme, undefined);
  sc.eq('시스템(OS 다크)+FO: theme-color = 오션', metaContent, '#001F2D');

  // 저장값을 직접 건드리는지 — 순수 조회/적용 함수라 save() 를 부르지 않는다
  sc.eq('applyTheme() 은 ST.settings 를 쓰지 않는다(읽기 전용)',
        /function applyTheme\(theme\)\{[\s\S]*?\n\}/.exec(SRC)[0].includes('ST.settings.uiThemePreset='), false);
}

// ═══ 8. 설정 카드 렌더링 — 중복 없이, 저장 없이 ═══
console.log('\n시나리오 8 — 프리셋 카드 렌더링');
{
  let html = '';
  const host = { set innerHTML(v) { html = v; }, get innerHTML() { return html; } };
  global.document.getElementById = (id) => id === 'uiThemePresetCards' ? host : null;
  ST.settings.uiThemePreset = 'classic';

  _renderUiThemePresetCards();
  const count1 = (html.match(/class="ui-preset-card/g) || []).length;
  sc.eq('프리셋 개수만큼 카드', count1, Object.keys(UI_THEME_PRESETS).length);
  sc.eq('classic 카드가 active',
        html.includes(`class="ui-preset-card active" onclick="updateSetting('uiThemePreset','classic')"`), true);
  sc.eq('fiery-ocean 카드는 active 아님',
        html.includes(`class="ui-preset-card" onclick="updateSetting('uiThemePreset','fiery-ocean')"`), true);

  // 14. 두 번 그려도 카드/리스너가 중복되지 않는다 (매번 innerHTML 통째로 재생성)
  _renderUiThemePresetCards();
  const count2 = (html.match(/class="ui-preset-card/g) || []).length;
  sc.eq('두 번 그려도 카드 수 동일(중복 없음)', count2, count1);

  ST.settings.uiThemePreset = 'fiery-ocean';
  _renderUiThemePresetCards();
  sc.eq('선택 프리셋이 바뀌면 그 카드가 active로',
        html.includes(`class="ui-preset-card active" onclick="updateSetting('uiThemePreset','fiery-ocean')"`), true);
  sc.eq('classic 카드는 active 해제',
        html.includes(`class="ui-preset-card" onclick="updateSetting('uiThemePreset','classic')"`), true);

  // 15. 프리셋 변경만으로 불필요한 반복 저장이 없다 — 렌더 함수 자체엔 save()/localStorage 호출이 없다
  const fnSrc = /function _renderUiThemePresetCards\(\)\{[\s\S]*?\n\}/.exec(SRC)[0];
  sc.eq('렌더 함수는 save() 를 부르지 않는다(그리기만 한다)', fnSrc.includes('save('), false);
}

sc.done();
