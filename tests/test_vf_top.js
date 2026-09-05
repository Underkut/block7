// 전체화면 맨 윗줄 네 가지 + 말씀 설정 탭 반짝임 (v26-0905-4, HB)
//
//  1. 홈·책갈피·순환/셔플·닫기 X 의 **선 굵기가 화면에서 같아야** 한다
//  2. 맨 윗줄 네 가지(홈 · 순환/셔플 · 제목 · 닫기)의 **수직 중심이 맞아야** 한다
//  4. 롱터치한 자리를 기억해 말씀 설정의 그 탭을 열고 이름을 한 번 반짝인다
//
// ⚠️ 여기서 지키는 것은 숫자 자체가 아니라 **재는 방법**이다. 화면에 찍히는
//    굵기는 stroke-width × (width ÷ viewBox 폭) 이라, 상자와 도안이 제각각인
//    아이콘들은 같은 stroke-width 를 써도 다 다르게 찍힌다. 실제로 그래서
//    0905-2 까지 넷이 1.68 / 1.53 / 1.14 / 0.99 로 벌어져 있었다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

// 아이콘 하나의 <svg …> 여는 태그를 소스에서 떠 온다
function svgTag(mark, offset) {
  const i = SRC.indexOf(mark);
  if (i < 0) throw new Error('못 찾음: ' + mark);
  const a = SRC.indexOf('<svg', i + (offset || 0));
  return SRC.slice(a, SRC.indexOf('>', a) + 1);
}
const num = (tag, key) => {
  const m = tag.match(new RegExp(key + '="([-0-9.]+)"'));
  return m ? parseFloat(m[1]) : null;
};
const viewBox = tag => {
  const m = tag.match(/viewBox="([-0-9. ]+)"/);
  return m ? m[1].trim().split(/\s+/).map(Number) : null;
};
// 화면에 실제로 찍히는 선 굵기 (px)
function inkStroke(tag) {
  const vb = viewBox(tag), w = num(tag, 'width'), h = num(tag, 'height');
  const sw = num(tag, 'stroke-width');
  return sw * Math.min(w / vb[2], h / vb[3]);
}
// 도안이 상자 안에서 세로로 얼마나 치우쳐 있나 (0 이면 한가운데)
// bbox 는 도안을 읽어 손으로 넘긴다 — path 파서를 새로 만들 까닭이 없다.
function inkOffsetY(tag, y0, y1) {
  const vb = viewBox(tag), w = num(tag, 'width'), h = num(tag, 'height');
  const sw = num(tag, 'stroke-width') || 0;
  const k = Math.min(w / vb[2], h / vb[3]);
  const cIcon = ((y0 - sw / 2) + (y1 + sw / 2)) / 2;   // 도안(획 포함)의 한가운데
  const cBox = vb[1] + vb[3] / 2;                       // 상자의 한가운데
  return +( (cIcon - cBox) * k ).toFixed(2);            // px, +면 아래로 치우침
}

const TAGS = {
  '홈(선)':      svgTag("const _VF_HOME_SVG="),
  '홈(채움)':    svgTag("const _VF_HOME_FILLED_SVG="),
  '책갈피':      svgTag("const _VF_KEEP_MENU_SVG="),
  '순환':        svgTag("const _VF_CYCLE_SVG="),
  '셔플':        svgTag("const _VF_SHUFFLE_SVG="),
  '닫기 X':      svgTag('<button class="vf-close"'),
};

console.log('시나리오 1 — 네 아이콘의 선 굵기가 화면에서 같다');
{
  const TARGET = 1.35;      // HB 와 맞춘 값 (넷의 중앙값)
  ['홈(선)','책갈피','순환','셔플'].forEach(k=>{
    const v = inkStroke(TAGS[k]);
    sc.eq(`${k} — 화면 굵기 ${v.toFixed(2)}px`, Math.abs(v - TARGET) < 0.02, true);
  });
  // ⚠️⚠️ 닫기 X 만 일부러 조금 굵다 (v26-0905-5, HB — "밝기·두께 통일감이 부족").
  //    같은 굵기로 맞춰 놓아도 **45° 대각선**은 안티앨리어싱이 여러 픽셀에 옅게
  //    퍼져서, 가로·세로 획보다 흐리고 가늘어 보인다. 게다가 이 아이콘은 다른
  //    투명도(0.2~0.3) 위에 얹혀 그 차이가 더 벌어진다.
  //    → 계산상 같게 두지 말고 **눈에 같아 보이도록** 10% 쯤 올린다.
  //    (숫자를 1.35 로 되돌리면 화면에서 다시 흐려 보인다 — 되돌리지 말 것)
  const xInk = inkStroke(TAGS['닫기 X']);
  sc.eq(`닫기 X — 대각선 보정 ${xInk.toFixed(2)}px`, xInk > TARGET*1.05 && xInk < TARGET*1.15, true);
  // ⚠️ 그래서 stroke-width 숫자는 **일부러 서로 다르다.** 숫자를 억지로
  //    맞추려고 하면 도로 어긋난다.
  sc.eq('상자가 큰 순환·셔플은 숫자가 더 크다',
        num(TAGS['순환'],'stroke-width') > num(TAGS['홈(선)'],'stroke-width'), true);
  // ⚠️ v26-0905-5, HB — 채운 홈은 이제 **통짜 실루엣이 아니다.** 선 홈과 같은
  //    도안·같은 굵기를 쓰고 몸통만 옅게 채운다. 그래야 옆의 가는 선들과 한 식구다.
  sc.eq('채운 홈도 같은 굵기',
        num(TAGS['홈(채움)'],'stroke-width'), num(TAGS['홈(선)'],'stroke-width'), true);
  sc.eq('채운 홈의 화면 굵기도 같다', Math.abs(inkStroke(TAGS['홈(채움)']) - TARGET) < 0.02, true);
  sc.eq('통짜 실루엣으로 돌아가지 않았다',
        SRC.includes('M2.5 9.35 10 3.2l7.5 6.15'), false);
}

console.log('\n시나리오 2 — 맨 윗줄 네 가지의 수직 중심이 맞는다');
{
  // ① 상자: 넷이 **같은 띠**(top 12, height 30)를 쓴다. 하나라도 어긋나면 끝이다.
  const band = re => re.test(SRC);
  sc.eq('홈 상자', band(/\.vf-home\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)[^}]*\}|\.vf-home\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);/), true);
  sc.eq('홈 높이 30', /\.vf-home\{[\s\S]{0,200}?height:30px/.test(SRC), true);
  sc.eq('순환·셔플 상자', /\.vf-cycle\{[\s\S]{0,200}?top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);[\s\S]{0,120}?height:30px/.test(SRC), true);
  sc.eq('닫기 상자', /\.vf-close\{[\s\S]{0,200}?top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\);[\s\S]{0,120}?height:30px/.test(SRC), true);
  // v26-0905-5, HB — X 가 옆의 것들보다 작아 보여 17 → 19 (홈과 같은 크기)
  sc.eq('닫기 X 도 홈과 같은 19', num(TAGS['닫기 X'],'width'), num(TAGS['홈(선)'],'width'));
  // ⚠️ 제목은 예전에 top 16 에 높이가 없어서 글자 중심이 4px 쯤 위에 떠 있었다.
  //    단추와 같은 띠를 주고 세로 가운데로 세운다 — 이것이 이 정렬의 전부다.
  sc.eq('제목도 같은 띠에 선다',
        /\.vf-toplabel\{[\s\S]{0,220}?top:calc\(env\(safe-area-inset-top,0px\) \+ 12px\)[\s\S]{0,120}?height:30px;/.test(SRC), true);
  sc.eq('제목은 세로 가운데', /\.vf-toplabel\{[\s\S]{0,400}?align-items:center;/.test(SRC), true);
  sc.eq('제목은 예전 자리(16px)에 안 남아 있다',
        /\.vf-toplabel\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 16px\)/.test(SRC), false);

  // ② 도안: 상자가 같아도 **그림이 상자 안에서 치우쳐 있으면** 어긋난다.
  //    (bbox 는 도안을 읽어 넘긴다 — 아래 숫자를 바꾸려면 path 를 다시 볼 것)
  const off = {
    '홈(선)':   inkOffsetY(TAGS['홈(선)'],   3.5, 17),    // 지붕 꼭대기 ~ 바닥
    '홈(채움)': inkOffsetY(TAGS['홈(채움)'], 3.5, 17),    // 이제 선 홈과 같은 도안
    '순환':     inkOffsetY(TAGS['순환'],      4, 15),      // 둥근 사각 + 화살촉
    '셔플':     inkOffsetY(TAGS['셔플'],      5, 19),      // 위·아래 화살촉까지
    '닫기 X':   inkOffsetY(TAGS['닫기 X'],    4, 16),
  };
  Object.keys(off).forEach(k=>{
    sc.eq(`${k} 도안이 상자 한가운데다 (${off[k]}px)`, Math.abs(off[k]) < 0.5, true);
  });
  // ⚠️ 순환 도안은 y 4~15 라 24 짜리 상자에서 2.5 만큼 위로 치우쳐 있다.
  //    viewBox 를 그만큼 내려서 맞췄다 — 그 보정이 사라지면 위 검사가 깨진다.
  sc.eq('순환은 viewBox 로 내려 맞춘 것이다', viewBox(TAGS['순환'])[1], -2.5);
  sc.eq('셔플은 보정이 필요 없다', viewBox(TAGS['셔플'])[1], 0);
}

console.log('\n시나리오 4 — 롱터치한 자리를 기억해 그 탭을 연다');
{
  // 상단 말씀영역에서 왔으면 '상단말씀', 그 밖이면 '말씀모음'.
  // ⚠️ 부르는 쪽마다 인자를 더 받지 않고 **누른 자리**로 가린다 — 그래야
  //    이 메뉴를 새 화면에 붙여도 저절로 맞는 탭이 열린다.
  const open = slice('function openVerseMemMenu(anchorEl,secId,atPoint,fromFull){', 'function closeVerseMemMenu');
  sc.eq('어디서 눌렀는지 기억한다',
        open.includes("_vmmFromTab=(anchorEl&&(anchorEl.id==='verseBar'||(anchorEl.closest&&anchorEl.closest('#verseBar'))))?'top':'coll';"), true);
  sc.eq('기억하는 일이 맨 먼저다',
        open.indexOf('_vmmFromTab=') < open.indexOf('_vmmOpenedAt='), true);
  sc.eq('기본은 말씀모음', SRC.includes("let _vmmFromTab='coll';"), true);

  // 메뉴의 '말씀 설정' 항목이 그 길로 간다
  sc.eq('메뉴 항목이 새 함수를 부른다',
        SRC.includes('<div class="task-menu-item" onclick="openVerseSettingsFromMenu()">'), true);
  sc.eq('예전처럼 그냥 열지 않는다',
        SRC.includes('onclick="closeVerseMemMenu();openVerseSettingsModal()"'), false);

  const fn = slice('function openVerseSettingsFromMenu(){', '\nfunction _vsetRestoreBack');
  sc.eq('메뉴를 닫고', fn.includes('closeVerseMemMenu();'), true);
  // 이 메뉴는 팝업이 아니라 화면 위에서 열렸다 — 되살릴 팝업이 없다
  sc.eq('되돌아갈 팝업은 비운다', fn.includes('_vsetBackTo=null;_vsetBackId=null;'), true);
  sc.eq('기억한 탭으로 가면서 반짝인다', fn.includes('_vsetGoTab(_vmmFromTab,true);'), true);

  // 반짝임
  const flash = slice('function _vsetFlashTab(btn){', '// 말씀영역·전체화면 롱터치 메뉴의');
  // ⚠️ 클래스를 뗐다 붙이기 전에 offsetWidth 를 한 번 읽어야 애니메이션이
  //    처음부터 다시 돈다 — 안 그러면 연달아 열 때 두 번째부터 안 반짝인다.
  sc.eq('애니메이션을 처음부터 다시 돌린다',
        flash.indexOf('void btn.offsetWidth;') > flash.indexOf("classList.remove('stab-flash')") &&
        flash.indexOf('void btn.offsetWidth;') < flash.indexOf("classList.add('stab-flash')"), true);
  sc.eq('끝나면 클래스를 뗀다', /setTimeout\(\(\)=>btn\.classList\.remove\('stab-flash'\)/.test(flash), true);
  sc.eq('반짝임 CSS 가 있다', /@keyframes stabFlash\{/.test(SRC), true);
  sc.eq('한 번만 돌고 멈춘다', /\.settings-tab\.stab-flash\{animation:stabFlash [0-9.]+s ease-out 1;/.test(SRC), true);
  // v26-0905-5, HB — 반짝임은 **세 번**, 모서리는 둥글리지 않고 꽉 찬 네모
  const kf = SRC.slice(SRC.indexOf('@keyframes stabFlash{'), SRC.indexOf('}', SRC.indexOf('.settings-tab.stab-flash{'))+1);
  sc.eq('세 번 반짝인다', (kf.match(/rgba\(var\(--ac-rgb\),\.28\)/g)||[]).length, 3);
  sc.eq('모서리를 둥글리지 않는다', /\.settings-tab\.stab-flash\{[^}]*border-radius:0;/.test(SRC), true);
  // 클래스를 떼는 시각이 애니메이션보다 **뒤**여야 한다 — 앞이면 도중에 끊긴다
  const dur = parseFloat((SRC.match(/animation:stabFlash ([0-9.]+)s/)||[])[1]) * 1000;
  const off = parseFloat((SRC.match(/btn\.classList\.remove\('stab-flash'\),(\d+)\)/)||[])[1]);
  sc.eq(`애니메이션(${dur}ms)이 끝난 뒤에 클래스를 뗀다 (${off}ms)`, off > dur, true);
  // 테두리를 새로 두르지 않는다 (UI 원칙) — 강조색만 옅게 들어왔다 빠진다
  sc.eq('테두리를 새로 두르지 않는다', /@keyframes stabFlash\{[^}]*border:/.test(SRC), false);
  sc.eq('모션을 줄인 기기에서는 안 깜빡인다',
        SRC.includes('@media (prefers-reduced-motion:reduce){.settings-tab.stab-flash{animation:none;}}'), true);

  // 탭을 여는 일은 한 곳(_vsetGoTab)으로 모았다
  const go = slice('function _vsetGoTab(id,flash){', 'function _vsetGoColl');
  sc.eq('탭 단추를 실제로 눌러 준다', go.includes('btn.click();'), true);
  sc.eq('반짝임은 넘겨받았을 때만', go.includes('if(flash)_vsetFlashTab(btn);'), true);
  // ⚠️ 책 버튼(_vsetGoColl)은 반짝이지 않는다 — 스스로 누른 자리라 짚어 줄 까닭이 없다
  sc.eq('책 버튼은 반짝임 없이', SRC.includes("function _vsetGoColl(){_vsetGoTab('coll');}"), true);
}

sc.done();
