// v26-0818-9, HB — 말씀설정창도 일반설정창처럼 탭을 슬라이드로 넘길 수 있게.
// 양끝 순환 여부(loopViews)는 일반설정창 뷰탭과 같은 값을 공유한다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 말씀설정창도 트랙 구조(settings-tab-track)를 쓴다');
{
  sc.eq('트랙 컨테이너가 있다', SRC.includes('<div class="settings-tab-track" id="verseSettingsTabTrack"'), true);
  ['top','widget','view','alarm','full','share','coll'].forEach(t=>{
    sc.eq(`vstab-${t} 가 settings-tab-content 클래스를 쓴다(트랙 한 칸)`,
          new RegExp(`class="vsettings-tab-content settings-tab-content" id="vstab-${t}"`).test(SRC), true);
  });
  // 예전처럼 display:none 으로 직접 감추는 방식은 없앴다 — 트랙 이동으로 보여준다
  sc.eq('vstab 들에 인라인 display:none 이 더는 없다',
        /vsettings-tab-content[^>]*style="display:none;"/.test(SRC), false);
}

console.log('\n시나리오 2 — switchVerseSettingsTab 이 트랙을 슬라이드한다');
{
  const fn = slice('function switchVerseSettingsTab(id,btn,direction){', 'function _initVerseSettingsSwipe');
  sc.eq('보이는 탭 목록에서 자리를 찾는다', fn.includes('const list=_vstabList();') && fn.includes('list.indexOf(id)'), true);
  sc.eq('트랙을 옮긴다', fn.includes('track.style.transform=`translateX('), true);
  sc.eq("direction 이 'direct' 면 애니메이션 없이", fn.includes("direction!=='direct'"), true);
}

console.log('\n시나리오 3 — 스와이프는 일반설정창과 같은 loopViews 값을 공유한다');
{
  const fn = slice('function _initVerseSettingsSwipe(){', 'function toggleSectionExclude');
  sc.eq('스와이프 핸들러가 정의돼 있다', fn.includes("body.addEventListener('touchstart'"), true);
  sc.eq('양끝 순환은 ST.settings.loopViews 를 그대로 쓴다(일반설정창과 공유)',
        fn.includes('ST.settings.loopViews===true'), true);
}

console.log('\n시나리오 4 — 여는 곳에서 스와이프를 붙이고 트랙을 처음 자리로 되돌린다');
{
  const fn = slice('function openVerseSettingsModal(){', '}');
  sc.eq("첫 탭으로 애니메이션 없이 되돌린다('direct')",
        fn.includes("switchVerseSettingsTab('top',null,'direct');"), true);
  sc.eq('스와이프 핸들러를 붙인다', fn.includes('_initVerseSettingsSwipe();'), true);
}

sc.done();
