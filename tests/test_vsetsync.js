// v26-0818-12, HB — 말씀설정창을 (일반설정창 없이) 바로 열면 '할일뷰 말씀 표시'·
// '태그 목록 간추리기'·'말씀 위젯 글자 크기'가 저장값과 무관하게 기본 HTML 그대로
// 보이던 버그. 두 창이 문서에 같이 떠 있어서 일반설정창을 먼저 열면 우연히 맞았지만
// (거기서만 이 세 묶음을 맞춰 줬다), 말씀설정을 먼저/단독으로 열면 어긋났다(PC 재신고).
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — renderVerseSettingsModal 이 세 묶음을 직접 맞춘다');
{
  const fn = slice('function renderVerseSettingsModal(){', 'function renderVerseAlarmSettings');
  sc.eq('할일뷰 말씀 표시(좋아요/암송/Deeper/Even) 체크를 맞춘다',
        fn.includes("['setDviewMarkLike','dviewMarkLike']"), true);
  sc.eq('태그 목록 간추리기(켬/끔·기준 개수)를 맞춘다',
        fn.includes('_vgSyncTagSettingsUI()'), true);
  sc.eq('말씀 위젯 글자 크기(본문/장절) 버튼을 맞춘다',
        fn.includes("_vwSize('verseWidgetTextSize')") && fn.includes("setVWTextSize"), true);
}
sc.done();
