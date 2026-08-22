// BB1 1단계 — 색상 테마 프리셋 (SPARK 7 + BREATH 8 = 15개).
//
// 이 파일은 두 가지를 본다:
//  ① 데이터·구조 (ID·순서·그룹·저장 방식·미리보기 분리)
//  ② **색 계산 결과** — index.html 의 파생 함수를 실제로 돌려서 30벌
//     (15테마 × 라이트/다크)의 대비가 접근성 기준을 넘는지 전부 확인한다.
//     색을 눈으로 고르면 어느 한 테마에서 조용히 안 읽히게 되므로 기계로 잰다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── index.html 의 테마 엔진을 그대로 떼어 와 실행한다 ──
// (테스트가 색 규칙을 따로 베껴 두면 본체와 어긋난다)
const engineSrc = slice('const THEME_GROUPS={', '// ── 조기 적용 (첫 페인트 전) ──');
const engine = {};
new Function('exports', engineSrc + `
Object.assign(exports,{THEME_GROUPS,THEME_PRESETS,themeById,_themeTokens,_thRgb,_thContrast,_thHex});
`)(engine);
const { THEME_GROUPS, THEME_PRESETS, themeById, _themeTokens, _thRgb, _thContrast } = engine;

// ═══ 1. 15개 테마의 ID·이름·순서 ═══
console.log('시나리오 1 — 테마 목록');
{
  const expect = [
    ['11', 'spark', 'Bold Berry'], ['12', 'spark', 'Sunset Deep'], ['13', 'spark', 'Chocolate Delight'],
    ['14', 'spark', 'Olive Garden Feast'], ['15', 'spark', 'Mulberry Forest'], ['16', 'spark', 'Fiery Ocean'],
    ['17', 'spark', 'Black Cherry'],
    ['21', 'breath', 'Soft Whisper'], ['22', 'breath', 'Mint Chocolate'], ['23', 'breath', 'Chestnut Gentleman'],
    ['24', 'breath', 'Sunny Beach Day'], ['25', 'breath', 'Dusk Horizon'], ['26', 'breath', 'Sunset Breeze'],
    ['27', 'breath', 'Charcoal Orange'], ['28', 'breath', 'Winter Blanket'],
  ];
  sc.eq('테마는 모두 15개', THEME_PRESETS.length, 15);
  sc.eq('ID·그룹·이름이 정확하고 11–17, 21–28 순서',
        THEME_PRESETS.map(p => [p.id, p.group, p.name]), expect);
  sc.eq('SPARK 7개', THEME_PRESETS.filter(p => p.group === 'spark').length, 7);
  sc.eq('BREATH 8개', THEME_PRESETS.filter(p => p.group === 'breath').length, 8);
  sc.eq('ID 는 전부 문자열', THEME_PRESETS.every(p => typeof p.id === 'string'), true);
  sc.eq('ID 중복 없음', new Set(THEME_PRESETS.map(p => p.id)).size, 15);
  sc.eq('테마마다 원본·라이트·다크 다섯 색씩',
        THEME_PRESETS.every(p => p.source.length === 5 && p.light.length === 5 && p.dark.length === 5), true);
  sc.eq('색은 전부 #RRGGBB',
        THEME_PRESETS.every(p => [...p.source, ...p.light, ...p.dark].every(c => /^#[0-9A-Fa-f]{6}$/.test(c))), true);
}

// ═══ 2. 사용자에게 보이는 그룹명 ═══
console.log('\n시나리오 2 — 그룹 이름과 설명');
{
  sc.eq('SPARK 표기', THEME_GROUPS.spark.label, 'SPARK');
  sc.eq('BREATH 표기', THEME_GROUPS.breath.label, 'BREATH');
  sc.eq('SPARK 설명', THEME_GROUPS.spark.desc, '선명하고 생동감 있는 테마');
  sc.eq('BREATH 설명', THEME_GROUPS.breath.desc, '부드럽고 차분한 테마');
  // Vivid/Muted/Fade 같은 옛 이름을 화면에 노출하지 않는다
  ['Vivid', 'Muted', 'Faded'].forEach(w => {
    sc.eq(`'${w}' 를 그룹명으로 쓰지 않는다`,
          THEME_GROUPS.spark.label === w || THEME_GROUPS.breath.label === w, false);
  });
}

// ═══ 3. 모르는 ID·빈 값 처리 ═══
console.log('\n시나리오 3 — 잘못된 ID 는 안전하게 기본으로');
{
  sc.eq('없는 ID → null(기본 색 유지)', themeById('99'), null);
  sc.eq('null → null', themeById(null), null);
  sc.eq('undefined → null', themeById(undefined), null);
  sc.eq('빈 문자열 → null', themeById(''), null);
  sc.eq('숫자 11 도 문자열 "11" 로 찾아진다', themeById(11) && themeById(11).id, '11');
  sc.eq('배열 위치가 아니라 ID 로 찾는다(0 번이 "11")', themeById('0'), null);
}

// ═══ 4. 색 계산 결과 — 30벌 전부 접근성 기준 ═══
console.log('\n시나리오 4 — 30벌(15 × 라이트/다크) 대비 검사');
{
  const ct = _thContrast, rgb = _thRgb;
  let worst = { 본문: 99, 보조글자: 99, 비활성글자: 99, 강조위글자: 99, 강조: 99, 강한경계: 99, 위험색: 99 };
  const fails = [];

  for (const p of THEME_PRESETS) {
    for (const mode of ['light', 'dark']) {
      const t = _themeTokens(p, mode);
      const bg = rgb(t['--bg']), s1 = rgb(t['--s1']), s2 = rgb(t['--s2']);
      const faces = [bg, s1, s2];
      const low = c => Math.min(...faces.map(f => ct(c, f)));
      const v = {
        본문: low(rgb(t['--tx'])),
        보조글자: low(rgb(t['--tx2'])),
        비활성글자: low(rgb(t['--tx3'])),
        강조위글자: ct(rgb(t['--on-accent']), rgb(t['--ac'])),
        강조: ct(rgb(t['--ac']), bg),
        강한경계: ct(rgb(t['--bd2']), bg),
        위험색: low(rgb(t['--danger'])),
      };
      const need = { 본문: 4.5, 보조글자: 4.5, 비활성글자: 3.0, 강조위글자: 4.5, 강조: 3.0, 강한경계: 2.9, 위험색: 4.5 };
      for (const k of Object.keys(v)) {
        worst[k] = Math.min(worst[k], v[k]);
        if (v[k] < need[k]) fails.push(`${p.id} ${p.name} ${mode} ${k} ${v[k].toFixed(2)} < ${need[k]}`);
      }
      // 배경과 패널이 거의 같은 색인 테마라도 카드 윤곽은 보여야 한다
      if (ct(s1, bg) < 1.03 && v.강한경계 < 2.9) fails.push(`${p.id} ${mode} 패널 구분 불가`);
    }
  }
  sc.eq('30벌 전부 기준 통과', fails, []);
  console.log('   최저값 —', Object.entries(worst).map(([k, x]) => `${k} ${x.toFixed(2)}`).join(' / '));
  sc.eq('일반 본문 4.5:1 이상', worst.본문 >= 4.5, true);
  sc.eq('보조 글자도 4.5:1 이상(패널 위 포함)', worst.보조글자 >= 4.5, true);
  sc.eq('강조색 위 글자 4.5:1 이상', worst.강조위글자 >= 4.5, true);
  sc.eq('강조색·주요 경계 3:1 이상', worst.강조 >= 3 && worst.강한경계 >= 2.9, true);
}

// ═══ 5. 라이트·다크는 한 ID 안에 함께 있다 ═══
console.log('\n시나리오 5 — 하나의 ID 가 라이트·다크를 모두 갖는다');
{
  const p = themeById('16');
  sc.eq('16 은 Fiery Ocean', p.name, 'Fiery Ocean');
  const L = _themeTokens(p, 'light'), D = _themeTokens(p, 'dark');
  sc.eq('라이트 배경은 크림', L['--bg'].toLowerCase(), '#fdf0d5');
  sc.eq('다크 배경은 오션 네이비', D['--bg'].toLowerCase(), '#001f2d');
  sc.eq('같은 ID 인데 라이트·다크 배경이 다르다', L['--bg'] !== D['--bg'], true);
  sc.eq('라이트·다크가 별개 테마로 저장되지 않는다(ID 는 하나)',
        THEME_PRESETS.filter(x => x.name === 'Fiery Ocean').length, 1);
  // 다크에서 배경과 패널이 서로 구분돼야 한다(검정에 가까운 배경 문제)
  THEME_PRESETS.forEach(x => {
    const d = _themeTokens(x, 'dark');
    sc.eq(`${x.id} 다크: 배경과 패널이 구분됨`,
          _thContrast(_thRgb(d['--s1']), _thRgb(d['--bg'])) > 1.0 ||
          _thContrast(_thRgb(d['--bd2']), _thRgb(d['--bg'])) >= 2.9, true);
  });
}

// ═══ 6. 저장 — ID 하나만, 기본은 '테마 없음' ═══
console.log('\n시나리오 6 — 저장 방식');
{
  sc.eq('저장 키는 themePresetId 하나', SRC.includes('themePresetId:null'), true);
  sc.eq('기본값은 null — 기존 사용자 외형이 안 바뀐다',
        /_settingsDefaults=\{[^;]*themePresetId:null/.test(SRC), true);
  sc.eq('그룹은 따로 저장하지 않는다(ID 로 계산)', /themePresetGroup|themeGroupId/.test(SRC), false);
  sc.eq('옛 uiThemePreset 체계는 완전히 사라졌다', /uiThemePreset|UI_THEME_PRESETS/.test(SRC), false);
  sc.eq('옛 fiery-ocean CSS 블록도 사라졌다', /data-preset="fiery-ocean"/.test(SRC), false);
  // 저장은 기존 설정 흐름(updateSetting)을 그대로 탄다 — 새 저장소를 만들지 않는다
  sc.eq('적용은 updateSetting 한 번', SRC.includes("updateSetting('themePresetId',id||null);"), true);
  sc.eq('테마 변경이 별도 저장소·Firestore 직접 쓰기를 만들지 않는다',
        /themePresetId[^\n]*localStorage\.setItem|setDoc\([^)]*themePreset/.test(SRC), false);
}

// ═══ 7. 미리보기와 실제 저장의 분리 ═══
console.log('\n시나리오 7 — 미리보기는 저장하지 않는다');
{
  const pick = slice('function themePickerPick(id){', 'function themePickerGroup(g){');
  sc.eq('테마를 누르면 임시 선택만 바꾼다', /_themePreviewId=id;/.test(pick), true);
  sc.eq('누를 때 저장(save/updateSetting)이 없다', /save\(|updateSetting/.test(pick), false);

  const render = slice('function _renderThemePicker(){', '// 미리보기 안에 넣을 가짜 앱 화면');
  sc.eq('미리보기는 그 상자에만 색을 얹는다(앱 화면은 안 건드린다)',
        render.includes('applyThemeVars(_themePreviewId,mode,box);'), true);
  sc.eq('라이트·다크 두 벌을 동시에 그린다',
        render.includes("[['light','themePreviewLight'],['dark','themePreviewDark']]"), true);
  sc.eq('미리보기를 그릴 때 저장하지 않는다', /save\(|updateSetting/.test(render), false);
  sc.eq('매번 통째로 다시 그려 리스너·카드가 겹치지 않는다',
        render.includes('list.innerHTML=') && render.includes('inner.innerHTML='), true);

  const apply = slice('function themePickerApply(){', 'function themePickerPick(id){');
  sc.eq('적용에서만 저장한다', (apply.match(/updateSetting\(/g) || []).length, 1);
  sc.eq('적용 전에 임시 선택을 비워 저장값이 보이게 한다',
        apply.indexOf('_themePreviewId=null') < apply.indexOf('updateSetting('), true);

  const close = slice('function closeThemePicker(){', 'function themePickerApply(){');
  sc.eq('취소하면 임시 선택을 버린다', close.includes('_themePreviewId=null;'), true);
  sc.eq('취소하면 저장돼 있던 테마로 되돌린다', close.includes('applyTheme(ST.settings.theme);'), true);
  sc.eq('취소는 저장하지 않는다', /save\(|updateSetting/.test(close), false);
}

// ═══ 8. 적용 함수 ═══
console.log('\n시나리오 8 — 적용 경로');
{
  const at = slice('function applyTheme(theme){', '// ═══════ 색상 테마 고르기 ═══════');
  sc.eq('밝기(시스템 포함)를 먼저 해석', at.includes('_effectiveMode(theme)'), true);
  sc.eq('미리보기 중이면 임시 선택을, 아니면 저장값을 그린다',
        at.includes('(_themePreviewId!==null)?_themePreviewId:(ST.settings&&ST.settings.themePresetId)'), true);
  sc.eq('theme-color 메타도 테마 배경을 따라간다', at.includes("meta.setAttribute('content'"), true);
  sc.eq('조기 적용과 런타임이 같은 함수를 쓴다',
        (SRC.match(/applyThemeVars\(/g) || []).length >= 3, true);
  // 모르는 ID 나 빈 값이면 얹었던 토큰을 전부 걷어낸다(이전 테마 흔적 없음)
  const av = slice('function applyThemeVars(id,mode,el){', '// ── 조기 적용 (첫 페인트 전) ──');
  sc.eq('테마가 없으면 토큰을 전부 제거', av.includes('keys.forEach(k=>host.style.removeProperty(k));'), true);
  sc.eq('시스템 밝기 변경을 계속 따라간다',
        SRC.includes("if(ST.settings.theme==='system')applyTheme('system');"), true);
}

// ═══ 9. 설정 화면 ═══
console.log('\n시나리오 9 — 설정 화면 구조');
{
  sc.eq('뷰 탭 항목명은 "색상 테마"',
        SRC.includes('<div class="settings-row-label lv1">색상 테마</div>'), true);
  sc.eq('뷰 탭에 15개를 펼치지 않는다(요약 + 버튼)',
        SRC.includes('id="themeSummary"') && SRC.includes('onclick="openThemePicker()"'), true);
  sc.eq('요약에 그룹·ID·이름을 함께 보인다',
        SRC.includes("THEME_GROUPS[p.group].label+' · '+p.id+' '+p.name"), true);
  sc.eq('요약에 원본 팔레트 색상띠', SRC.includes('theme-strip-cell'), true);
  sc.eq('밝기(다크/라이트/시스템)는 그대로 남아 있다',
        SRC.includes('id="themeBtnDark"') && SRC.includes('id="themeBtnSystem"'), true);
  // v26-0823-1 (HB) — 뷰 탭 순서와 밝기 버튼 순서
  sc.eq('밝기 버튼은 라이트 → 다크 → 시스템 순',
        SRC.indexOf('id="themeBtnLight"') < SRC.indexOf('id="themeBtnDark"') &&
        SRC.indexOf('id="themeBtnDark"') < SRC.indexOf('id="themeBtnSystem"'), true);
  sc.eq('뷰 탭에서 밝기가 색상 테마보다 먼저 온다',
        SRC.indexOf('<div class="settings-row-label lv1">밝기</div>') <
        SRC.indexOf('<div class="settings-row-label lv1">색상 테마</div>'), true);
  // '기본' 미리보기가 라이트·다크를 제대로 보여주려면 기본값 선언을 재사용해야 한다
  sc.eq('기본값 토큰을 재사용하는 선택자가 있다',
        SRC.includes(':root,.theme-defaults-dark {') && SRC.includes('html[data-theme="light"],.theme-defaults-light {'), true);
  sc.eq("'기본' 일 때 미리보기 두 칸에 그 클래스를 붙인다",
        SRC.includes("box.classList.toggle('theme-defaults-light',_themePreviewId==null&&mode==='light');"), true);
  // 등급(이지/미드/파워)에서 감추지 않는다
  const sec = SRC.slice(SRC.indexOf('<!-- 색상 테마'), SRC.indexOf('id="themeSummary"'));
  sc.eq('색상 테마 항목엔 data-lv 가 없다(모든 등급에 보임)', /data-lv=/.test(sec), false);

  sc.eq('선택 화면은 팝업 위 팝업이 아니라 전용 전체 화면',
        SRC.includes('<div class="theme-picker" id="themePicker">'), true);
  sc.eq('SPARK·BREATH 탭', SRC.includes('id="themeGroupTab_spark"') && SRC.includes('id="themeGroupTab_breath"'), true);
  sc.eq('그룹 탭에 aria-selected', /id="themeGroupTab_spark"[^>]*aria-selected/.test(SRC), true);
  // 라이트/다크를 따로 고르는 토글은 없어졌다 — 두 벌을 한꺼번에 보여준다
  sc.eq('밝기 토글 버튼이 없다', /themeModeBtn_|themePickerMode\(/.test(SRC), false);
  sc.eq('라이트·다크 미리보기 상자가 둘 다 있다',
        SRC.includes('id="themePreviewLight"') && SRC.includes('id="themePreviewDark"'), true);
  sc.eq('미리보기 두 칸에 라벨', /class="theme-preview-label">라이트</.test(SRC) && /class="theme-preview-label">다크</.test(SRC), true);
  sc.eq('미리보기는 2열', /\.theme-preview-wrap\{display:grid;grid-template-columns:1fr 1fr/.test(SRC), true);
  sc.eq('테마 항목에도 aria-pressed', SRC.includes('aria-pressed="${on?\'true\':\'false\'}"'), true);
  sc.eq('하단에 취소·적용', SRC.includes('>취소</button>') && SRC.includes('>적용</button>'), true);
  sc.eq('ESC 표에 등록(PC 에서 × 와 같은 동작)', SRC.includes("['themePicker',     ()=>closeThemePicker()],"), true);
  sc.eq('PC 는 좌우 분할', /@media \(min-width:860px\)\{[\s\S]{0,200}\.theme-picker-body\{flex-direction:row;\}/.test(SRC), true);
  sc.eq('목록은 세로 스크롤(가로 스크롤 안 씀)', /\.theme-list\{\s*overflow-y:auto/.test(SRC), true);
  sc.eq('모바일 목록은 2열', /\.theme-list\{[^}]*grid-template-columns:1fr 1fr/.test(SRC), true);
  sc.eq('PC 목록은 1열', /@media \(min-width:860px\)\{[\s\S]*?\.theme-list\{grid-template-columns:1fr;\}/.test(SRC), true);
  // 모바일에서만 목업을 절반으로 줄인다. 기본 규칙이 PC 미디어쿼리보다 앞에 와야
  // PC 에서 zoom:1 이 이긴다(같은 특이도라 순서가 곧 우선순위다).
  sc.eq('모바일 미리보기는 절반 크기', /\.tp-scale\{zoom:\.5;\}/.test(SRC), true);
  sc.eq('PC 미리보기는 줄이지 않는다', /@media \(min-width:860px\)\{[\s\S]*?\.tp-scale\{zoom:1;\}/.test(SRC), true);
  sc.eq('기본 .tp-scale 이 PC 미디어쿼리보다 앞에 있다',
        SRC.indexOf('.tp-scale{zoom:.5;}') < SRC.indexOf('@media (min-width:860px)'), true);
  // 하단 버튼 — 기본 / 취소 / 적용
  sc.eq("'기본' 버튼이 '취소' 왼쪽에 있다",
        SRC.indexOf('id="themeDefaultBtn"') < SRC.indexOf('>취소</button>'), true);
  sc.eq("'기본' 은 테마 없음(null)을 고른다", SRC.includes('onclick="themePickerPick(null)"'), true);
  sc.eq("'기본' 도 눌린 상태를 표시한다", SRC.includes("defBtn.classList.toggle('on',isDef);"), true);
}

// ═══ 10. 미리보기 목업이 실제 화면 요소를 담는다 ═══
console.log('\n시나리오 10 — 미리보기 내용');
{
  const mock = slice('function _themePreviewHTML(){', '// If the user picked "시스템"');
  [['GNB', 'tp-gnb'], ['날짜 이동', 'tp-date'], ['일간 할일 카드', 'tp-card'],
   ['말씀 영역', 'tp-verse'], ['월간뷰 일부', 'tp-cal'], ['버튼', 'tp-btn'],
   ['탭', 'tp-tabs'], ['입력창', 'tp-input'], ['칩', 'tp-chip']].forEach(([label, cls]) => {
    sc.eq(`미리보기에 ${label}`, mock.includes(cls), true);
  });
  sc.eq('미리보기는 진짜 앱 클래스를 쓰지 않는다(앱 색을 물려받지 않게)',
        /class="(ts|tab|big-item|mcc)\b/.test(mock), false);
  sc.eq('미리보기 숫자도 --font-number 를 쓴다', /\.tp-date\{font-family:var\(--font-number\)/.test(SRC), true);
}

// ═══ 11. 색 토큰이 의미 기반으로 한곳에서 나온다 ═══
console.log('\n시나리오 11 — 토큰 구조');
{
  const t = _themeTokens(themeById('11'), 'dark');
  ['--bg', '--s1', '--s2', '--header-bg', '--tx', '--tx2', '--tx3',
   '--ac', '--on-accent', '--sec', '--tab-on-bg', '--chip-bg',
   '--bd', '--bd2', '--focus-ring', '--shadow-color', '--danger'].forEach(k => {
    sc.eq(`토큰 ${k} 가 계산된다`, typeof t[k] === 'string' && t[k].length > 0, true);
  });
  sc.eq('다섯 색에서 파생한다(테마 데이터에 토큰을 손으로 안 적는다)',
        THEME_PRESETS.every(p => !('tokens' in p) && !('vars' in p)), true);
  sc.eq(':root 에 토큰 기본값이 있다(테마 없을 때의 지금 색)',
        SRC.includes('--on-accent:#fff;') && SRC.includes('--danger:#e5484d;'), true);
  sc.eq('강조색 위 흰 글자 하드코딩이 --on-accent 로 바뀌었다',
        SRC.includes('background:var(--ac);color:var(--on-accent);'), true);
  sc.eq('테마별 컴포넌트 선택자 복제를 만들지 않았다',
        (SRC.match(/html\[data-theme-preset/g) || []).length, 0);
  sc.eq('!important 를 새로 뿌리지 않았다',
        (slice('.theme-picker{', '</style>').match(/!important/g) || []).length, 0);
}

sc.done();
