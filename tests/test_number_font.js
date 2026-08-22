// BB1 추가 지시 — 앱의 모든 숫자를 점 없는 Pretendard 숫자로 통일 (26-0822-2).
// 가운데 점 있는 0(IBM Plex Mono)이 숫자 표시 요소에 안 남았는지, 반대로
// 순수 문자 라벨(D/W/M, 요일 등)은 그대로인지, 말씀 본문 글꼴·8가지 말씀테마는
// 안 건드렸는지를 정적으로 확인한다. 실제 0 모양 자체는 코드로 볼 수 없으니
// 개발본의 "숫자 글꼴 점검" 화면(DEV_MODE 전용)으로 눈으로 확인한다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ═══ 1. --font-number 변수 ═══
console.log('시나리오 1 — --font-number 변수');
{
  sc.eq('--font-number 는 Pretendard', /--font-number:'Pretendard',-apple-system,sans-serif;/.test(SRC), true);
  const rootBlock = SRC.slice(SRC.indexOf(':root {'), SRC.indexOf('html[data-theme="light"]'));
  sc.eq(':root 안의 --font-number 에 IBM Plex Mono 없음',
        /--font-number:[^;]*IBM Plex Mono/.test(rootBlock), false);
  // 프리셋이 --font-number 를 임의로 덮어쓰지 못하게 — Fiery Ocean 두 블록 다 재정의 안 함
  const foDark = slice('html[data-preset="fiery-ocean"] {', 'html[data-preset="fiery-ocean"][data-theme="light"] {');
  const foLight = SRC.slice(SRC.indexOf('html[data-preset="fiery-ocean"][data-theme="light"] {'),
                             SRC.indexOf('*,*::before,*::after{box-sizing:border-box;'));
  sc.eq('Fiery Ocean 다크 블록은 --font-number 재정의 안 함', foDark.includes('--font-number'), false);
  sc.eq('Fiery Ocean 라이트 블록도 --font-number 재정의 안 함', foLight.includes('--font-number'), false);
}

// ═══ 2. 숫자 정렬(tabular-nums) 전역 적용 ═══
console.log('\n시나리오 2 — 숫자 정렬 폭 고정');
{
  const bodyRule = SRC.slice(SRC.indexOf('body{'), SRC.indexOf('input,textarea{'));
  sc.eq('body 에 tabular-nums', bodyRule.includes('font-variant-numeric:tabular-nums;'), true);
  sc.eq("body 에 font-feature-settings 'tnum'", bodyRule.includes("font-feature-settings:'tnum' 1;"), true);
}

// ═══ 3. 숫자 표시 요소가 --font-number 를 쓴다 ═══
console.log('\n시나리오 3 — 날짜·시간·개수·퍼센트 요소');
{
  const numericSelectors = [
    ['.date-l', /\.date-l\{[^}]*font-family:var\(--font-number\)/],
    ['#hDate,#tLbl 묶음', /#hDate,#tLbl\{\s*font-family:var\(--font-number\)/],
    ['.total-lbl', /\.total-lbl\{font-family:var\(--font-number\)/],
    ['.wmore', /\.wmore\{font-size:9px;color:var\(--tx3\);font-family:var\(--font-number\)/],
    ['.wmem', /\.wmem\{font-size:9px;color:var\(--ac\);font-family:var\(--font-number\)/],
    ['.mcsc', /\.mcsc\{font-size:8px;color:var\(--tx3\);margin-top:2px;font-family:var\(--font-number\)/],
    ['.mcmem', /\.mcmem\{[^}]*font-family:var\(--font-number\)/],
    ['.sm-cnt-lbl', /\.sm-cnt-lbl\{font-family:var\(--font-number\)/],
    ['.trash-item-meta', /\.trash-item-meta\{[^}]*font-family:var\(--font-number\)/],
    ['.blk-carry-badge', /\.blk-carry-badge\{[^}]*font-family:var\(--font-number\)/],
    ['.dev-badge', /\.dev-badge\{[^}]*font-family:var\(--font-number\)/],
    ['.dev-note-when', /\.dev-note-when\{font-size:10px;color:var\(--tx3\);font-family:var\(--font-number\)/],
    ['.vf-cnt', /\.vf-cnt\{font-size:11px;font-family:var\(--font-number\)/],
    ['.vc-cnt', /\.vc-cnt\{font-size:9px;font-family:var\(--font-number\)/],
    ['.vg-tb-ref', /\.vg-tb-ref\{margin-top:7px;font-family:var\(--font-number\)/],
    ['.vg-tile-ref', /\.vg-tile-ref\{\s*font-family:var\(--font-number\)/],
    ['.vdash-ref', /\.vdash-ref\{[^}]*font-family:var\(--font-number\)/],
    ['.vdd-tbl td:nth-child(1)', /\.vdd-tbl td:nth-child\(1\)\{[^}]*font-family:var\(--font-number\)/],
    ['.settings-number', /\.settings-number\{[^}]*font-family:var\(--font-number\)/],
    ['.sec-edit-time-inp', /\.sec-edit-time-inp\{[^}]*font-family:var\(--font-number\)/],
    ['.sec-bound-back-note', /\.sec-bound-back-note\{[^}]*font-family:var\(--font-number\)/],
    ['.auth-version', /\.auth-version\{[^}]*font-family:var\(--font-number\)/],
    ['.settings-version', /\.settings-version\{[^}]*font-family:var\(--font-number\)/],
    ['.logo b (숫자 7)', /\.logo b\{color:var\(--ac\);font-weight:500;font-family:var\(--font-number\);\}/],
    ['.auth-logo b (숫자 7)', /\.auth-logo b\{[^}]*font-family:var\(--font-number\);\}/],
  ];
  numericSelectors.forEach(([name, re]) => sc.eq(name + ' → --font-number', re.test(SRC), true));

  // 인라인 style 로 박힌 숫자 요소들
  const inlineIds = ['uiScaleLabel', 'layFormInfo', 'setVerseSneakMaxWDisplay', 'vpSummary',
                      'vpDiagBody', 'shareSizeInfo', 'hDate', 'eventDateInput', 'vfShareSizeHint', 'cellTodoTitle'];
  inlineIds.forEach(id => {
    const re = new RegExp('id="' + id + '"[^>]*font-family:var\\(--font-number\\)|font-family:var\\(--font-number\\)[^>]*id="' + id + '"');
    sc.eq('인라인 #' + id + ' → --font-number', re.test(SRC), true);
  });
  // 시간 구간 시작~종료 시각 span
  sc.eq('시간 구간 시작~종료 span → --font-number',
        SRC.includes("font-family:var(--font-number);\">${esc(s.startTime)}"), true);
}

// ═══ 4. 월간뷰 연도·월은 그대로 --font-ui(Pretendard) — 원래도 숫자 전용 글꼴이 없었다 ═══
console.log('\n시나리오 4 — 월간뷰 연도·월 (기존과 동일)');
{
  sc.eq('.mttl 은 폰트 지정이 따로 없다(body 의 --font-ui 상속, 기존과 동일)',
        /\.mttl\{font-size:16px;font-weight:700;flex:1;text-align:center;\}/.test(SRC), true);
  sc.eq('.rp-mnav .rp-mttl 도 폰트 지정 없음(상속)',
        /\.rp-mnav \.rp-mttl\{font-size:11px;font-weight:700;color:var\(--tx\);font-family:var\(--font-ui\),sans-serif;\}/.test(SRC), true);
}

// ═══ 5. 순수 문자 라벨은 그대로 모노스페이스 ═══
console.log('\n시나리오 5 — 숫자 없는 라벨은 --font-mono 유지');
{
  sc.eq('.tab,.wh,.mcdow,.wlbl 묶음이 --font-mono',
        /\.tab,\.wh,\.mcdow,\.wlbl\{\s*font-family:var\(--font-mono\);\s*\}/.test(SRC), true);
  const monoKept = [
    ['.logo (BLOCK 워드마크)', /\.logo\{font-family:var\(--font-mono\)/],
    ['.auth-logo', /\.auth-logo\{\s*font-family:var\(--font-mono\)/],
    ['.vg-divider', /color:var\(--tx3\);font-size:11px;font-family:var\(--font-mono\);\s*letter-spacing:\.02em;padding:16px 2px 5px;/],
    ['.ur-btn', /font-family:var\(--font-mono\);\s*transition:color \.12s;/],
    ['.preset-btn', /font-family:var\(--font-mono\);transition:all \.15s;flex-shrink:0;/],
    ['.contact-row-nick', /font-family:var\(--font-mono\);font-size:12px;font-weight:600;\s*color:var\(--ac\);flex-shrink:0;/],
    ['.date-nav-hint', /\.date-nav-hint\{\s*display:flex;align-items:center;gap:4px;\s*font-family:var\(--font-mono\)/],
    ['.task-menu-label', /\.task-menu-label\{font-size:9\.5px;font-family:var\(--font-mono\)/],
    ['.rp-widget-title', /font-family:var\(--font-mono\);margin-bottom:7px;/],
    ['#eventDateDow (요일 텍스트)', /id="eventDateDow"[^>]*font-family:var\(--font-mono\)/],
  ];
  monoKept.forEach(([name, re]) => sc.eq(name + ' → --font-mono 유지', re.test(SRC), true));
}

// ═══ 6. --vf-reffont — 말씀 장절 숫자 ═══
console.log('\n시나리오 6 — 말씀 장절(--vf-reffont)');
{
  sc.eq('전체화면: 명조 테마는 본문 그대로, 그 외엔 --font-number',
        SRC.includes("'--vf-reffont':(t.font==='serif')?fam:'var(--font-number)'"), true);
  sc.eq('카드뷰: 동일 규칙',
        SRC.includes("'--vf-reffont':(p.font==='serif')?fam:'var(--font-number)'"), true);
  sc.eq('#vfRef CSS 기본값도 --font-number 로 (기존 IBM Plex Mono 대신)',
        SRC.includes('font-family:var(--vf-reffont,var(--font-number));letter-spacing:.06em;flex-shrink:0;\n'), true);
  sc.eq('.vc-ref CSS 기본값도 동일',
        SRC.includes('font-family:var(--vf-reffont,var(--font-number));letter-spacing:.06em;flex-shrink:0;cursor:pointer;}'), true);
  sc.eq('IBM Plex Mono 하드코딩은 --vf-reffont 자리에서 사라졌다',
        /--vf-reffont['"]?\s*[:,][^;\n]*IBM Plex Mono/.test(SRC), false);
}

// ═══ 7. 말씀 본문 글꼴·8가지 테마는 무변경 ═══
console.log('\n시나리오 7 — 말씀 본문·테마 엔진 무변경');
{
  sc.eq('VF_SANS 리터럴 그대로',
        SRC.includes("const VF_SANS=\"Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif\";"), true);
  sc.eq('VF_SERIF 상수 존재(건드리지 않음)', /const VF_SERIF=/.test(SRC), true);
  sc.eq('VF_PATTERNS 8개 테마 유지', SRC.includes('const VF_PATTERNS={'), true);
  sc.eq('vfThemes 기본 8개 그대로',
        SRC.includes("vfThemes:['night','ink','dawn','sanctuary','paper','aurora','riso','neon']"), true);
  sc.eq('--vf-font(본문 글꼴 선택 자체)는 fam 그대로, --font-number 로 안 바뀜',
        /'--vf-font':fam,/.test(SRC), true);
}

// ═══ 8. 캔버스(BLOCK7 서명) — 글자는 모노, 숫자 7 만 --font-number ═══
console.log('\n시나리오 8 — 공유 이미지 BLOCK7 서명');
{
  sc.eq('BLOCK 은 IBM Plex Mono 유지', SRC.includes("const _blk7MonoFont=`400 ${fs}px 'IBM Plex Mono',monospace`;"), true);
  sc.eq('7 은 --font-number(computed) 사용',
        SRC.includes("const _blk7NumFont=getComputedStyle(document.documentElement).getPropertyValue('--font-number').trim()"), true);
  sc.eq('폭 계산(wAll)도 글자별로 알맞은 폰트로 잰다(정렬 안 밀리게)',
        /\[\.\.\.'BLOCK7'\]\.forEach\(c=>\{\s*ctx\.font=\/\\d\/\.test\(c\)\?_blk7NumFontFull:_blk7MonoFont;\s*wAll\+=ctx\.measureText\(c\)\.width\+LS;\s*\}\);/.test(SRC), true);
  sc.eq("실제로 그릴 때도 'BLOCK' 은 모노, '7' 은 숫자 폰트로 바꿔 그린다",
        SRC.includes('ctx.font=_blk7MonoFont;') && SRC.includes('ctx.font=_blk7NumFontFull;'), true);
  // .vf-cnt 캡처는 getComputedStyle(cnt).fontFamily 를 그대로 쓰므로(하드코딩 없음)
  // CSS 쪽 .vf-cnt 가 --font-number 인 것만 확인되면 캔버스도 자동으로 맞다.
  sc.eq('액션 카운트 캔버스 그리기는 cs.fontFamily 를 그대로 쓴다(하드코딩 없음)',
        SRC.includes('ctx.font=`${cs.fontWeight} ${f.size*SC}px ${cs.fontFamily}`;'), true);
}

// ═══ 9. 기계적 치환이 아니었는지 — IBM Plex Mono 잔존 목록이 예상한 곳뿐인지 ═══
console.log('\n시나리오 9 — IBM Plex Mono 잔존 위치 감사');
{
  const lines = SRC.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('IBM Plex Mono'));
  // 남아 있어도 되는 경우: --font-mono 자체 정의, 주석, BLOCK 워드마크용 상수
  const allowed = (l) =>
    l.includes('--font-mono:') ||
    l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*') ||
    l.includes('_blk7MonoFont=') ||
    l.includes('모노스페이스(IBM Plex Mono)'); // /* */ 주석의 줄바꿈 계속 줄 (앞에 * 없음)
  const unexpected = lines.filter(([, l]) => !allowed(l));
  sc.eq('예상 못 한 곳에 IBM Plex Mono 가 남아있지 않다(전부 확인된 자리)',
        unexpected.map(([n]) => n), []);
}

// ═══ 10. 개발자용 점검 화면 ═══
console.log('\n시나리오 10 — 개발본 전용 숫자 점검 화면');
{
  sc.eq('DEV_MODE 가드 안에 있다',
        /if\(DEV_MODE\)\{\s*document\.addEventListener\('DOMContentLoaded',\(\)=>\{\s*const box=document\.createElement\('div'\);\s*box\.id='numFontCheckBox';/.test(SRC), true);
  sc.eq('점검 문자열에 0 이 많이 포함된 조합이 있다',
        SRC.includes("'0 10 20 30 40 50 60 70 80 90 100',") &&
        SRC.includes("'2026.08.20',") &&
        SRC.includes("'00:00 08:00 10:30 20:00',") &&
        SRC.includes("'0/7 10/20 100%',") &&
        SRC.includes("'요한복음 10:10',") &&
        SRC.includes("'시편 100:1'"), true);
  sc.eq('점검 박스 자체는 --font-number 로 그린다',
        SRC.includes("font-family:var(--font-number);font-size:15px;line-height:1.7;"), true);
  sc.eq('닫기 버튼이 있다(테스트 후 치우기 쉽게)', SRC.includes("this.closest(\\'#numFontCheckBox\\').remove()"), true);
}

// ═══ 11. HB 확인 후 추가 수정(26-0822-3) — 주간뷰 날짜, GNB 세로 정렬 ═══
console.log('\n시나리오 11 — 주간뷰 날짜+요일 혼합 표기 / GNB 세로 정렬');
{
  // .wh 는 "18 T" 처럼 날짜 숫자와 요일 글자가 한 요소에 섞여 있어서,
  // 처음엔 통째로 --font-mono 로 남겨뒀다가 HB가 "날짜가 아직 안 바뀌었다"고
  // 신고해 숫자만 <span class="num"> 으로 감쌌다.
  sc.eq('.wh 날짜 숫자는 <span class="num"> 로 분리',
        SRC.includes('<span class="num">${d.getDate()}</span> ${DOW[d.getDay()]}'), true);
  sc.eq('.wh .num 은 --font-number', /\.wh \.num\{font-family:var\(--font-number\);\}/.test(SRC), true);
  sc.eq('.wh 자체(요일 글자)는 여전히 --font-mono',
        /\.wh\{[^}]*font-family:var\(--font-mono\);\}/.test(SRC), true);

  // GNB 의 "‹ 날짜 요일 ›" 이 화살표 버튼보다 위로 떠 보인 것 — Pretendard 와
  // IBM Plex Mono 의 줄 높이(line-height:normal)가 달라서 flex 세로 중앙이
  // 폰트마다 다르게 잡힌 게 원인이었다. line-height 를 고정해서 잡는다.
  sc.eq('#hDate 가 쓰는 .date-l(12px, 헤더용)에 line-height:1',
        /\.date-l\{\s*font-family:var\(--font-number\);font-size:12px;color:var\(--tx3\);\s*min-width:44px;text-align:center;cursor:pointer;line-height:1;/.test(SRC), true);
  sc.eq('.date-l 의 남은(구버전) 10px 규칙에도 line-height:1',
        /\.date-l\{font-family:var\(--font-number\);font-size:10px;color:var\(--tx3\);line-height:1;\}/.test(SRC), true);
}

sc.done();
