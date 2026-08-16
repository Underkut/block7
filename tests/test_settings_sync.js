// 말씀설정을 열 때 버튼의 켜짐 표시가 저장값과 맞는가 (v26-0817-7, HB 21번)
//
// ⚠️ '기간 기준'(기준날짜 / 만 기간) 버튼은 말씀설정의 말씀모음 탭에 있는데,
//    켜짐 표시를 맞추는 코드가 **일반 설정창(renderSettingsPanel)에만** 있었다.
//    그래서 앱을 새로 켜고 말씀설정을 열면 저장값이 rolling 이어도 두 버튼이
//    **둘 다 꺼진 것처럼** 보였다. (예전에 고쳤다고 기록된 것이 되살아난 이유)
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const fn = SRC.slice(SRC.indexOf('function renderVerseSettingsModal(){'),
                     SRC.indexOf('// ── 인앱 말씀 팝업 ──'));

console.log('시나리오 — 말씀설정을 열 때 기간 기준 버튼도 맞춘다');
{
  sc.eq('저장값을 읽는다', fn.includes("const pbm=s.periodBaseMode||'calendar';"), true);
  sc.eq('기준날짜 버튼', fn.includes("el('setPeriodBaseCalendar')?.classList.toggle('on',pbm==='calendar');"), true);
  sc.eq('만 기간 버튼', fn.includes("el('setPeriodBaseRolling')?.classList.toggle('on',pbm==='rolling');"), true);
  // 이 버튼들은 checkbox 가 아니라 .on 클래스로 표시된다 — .checked 를 쓰면 조용히 실패한다
  sc.eq('checked 로 만지지 않는다', /setPeriodBase\w+\)\.checked/.test(fn), false);
}

console.log('\n시나리오 — 일반 설정창·저장 시점의 갱신도 그대로 남아 있다');
{
  sc.eq('일반 설정창에서도 맞춘다',
        SRC.includes("document.getElementById('setPeriodBaseCalendar')?.classList.toggle('on',pbm==='calendar');"), true);
  sc.eq('값을 바꾼 즉시도 맞춘다',
        (SRC.match(/setPeriodBaseRolling'\)\?\.classList\.toggle/g)||[]).length >= 2, true);
}
sc.done();
