// 말씀 모음·말씀 설정 진입점은 모두 같은 탭과 같은 세 번 강조로 모인다.
// 단, 말씀 상단영역/전체화면의 말씀 메뉴는 사용자가 있던 설정 탭을 기억한다.
const { SRC, makeScorer } = require('./_load');
const sc = makeScorer();

function body(name) {
  const m = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`).exec(SRC);
  return m ? m[1] : '';
}

console.log('시나리오 1 — 공통 도착점과 강조');
{
  sc.eq('공통 길은 말씀 모음 탭을 고른다', /_vsetGoTab\('coll',true\)/.test(body('_vsetGoColl')), true);
  sc.eq('강조는 3초 동안 돈다', /animation:stabFlash 3s ease-out 1/.test(SRC), true);
  sc.eq('강조 봉우리는 세 번이다', (SRC.match(/14%|47%|80%/g) || []).length >= 3, true);
}

console.log('\n시나리오 2 — 화면의 모든 진입점');
{
  const routes = [
    'openVerseCollFromLogo',       // 로고 메뉴: 현재 말씀 모음
    'openVerseCollFromListMenu',   // 활동 목록 행 메뉴: 말씀 설정
    'openVcCollSettings',          // 말씀카드 설정 헤더
    'vfOpenCollSettings',          // 말씀 전체화면 헤더
    'vwScopeCollSettings',         // 말씀카드 범위의 말씀 모음 전체 롱터치
    'openVerseCollSettings'        // 현재 말씀 모음 목록 헤더
  ];
  routes.forEach(name=>sc.eq(`${name}이 공통 길을 쓴다`, /_vsetGoColl\(\)/.test(body(name)), true));
  sc.eq('대시보드 기준 버튼도 같은 탭과 강조다', /_vsetGoTab\('coll',true\)/.test(body('vDashOpenCollSettings')), true);
  sc.eq('로고 메뉴 현재 말씀 모음은 한 곳에서만 쓴다', (SRC.match(/onclick="openVerseCollFromLogo\(\)"/g) || []).length, 1);
}

console.log('\n시나리오 3 — 말씀 상단영역 메뉴 예외');
{
  const menu = body('openVerseSettingsFromMenu');
  sc.eq('상단영역 메뉴는 원래 탭을 유지한다', /_vsetGoTab\(_vmmFromTab,true\)/.test(menu), true);
  sc.eq('상단영역 메뉴를 모음 탭으로 강제하지 않는다', /_vsetGoColl\(\)/.test(menu), false);
}

console.log('\n시나리오 4 — 로고 메뉴 말씀 설정은 기본 화면, 깜빡 없음 (v26-0910-2, HB 검토표 결정)');
{
  const logoSettings = body('openVerseSettingsFromLogo');
  sc.eq('탭을 강제하거나 강조하지 않는다', /_vsetGoColl\(\)|_vsetGoTab/.test(logoSettings), false);
  sc.eq('기본 모달을 그대로 연다', /openVerseSettingsModal\(\)/.test(logoSettings), true);
  sc.eq('로고 메뉴 말씀 설정 항목이 이 길을 쓴다', SRC.includes('onclick="openVerseSettingsFromLogo()"'), true);
}

sc.done();
