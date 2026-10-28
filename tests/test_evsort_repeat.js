// 시간순 정렬 — 반복 일정도 시간 자리에 (HB 2026-10-28 1028-2 B2)
// 예전: 매주 도는 '20.3 기도회' 는 다른 날에서 비춰 온 것이라 늘 맨 뒤로 붙었다 →
//       시계 정렬을 눌러도 '21.3 송번역' 뒤에 남아 거꾸로 보였다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = slice('function getDisplayEvents(k,secId){', '// Renders each event as a small');
function make(days) {
  const ST = { days };
  const env = {
    ST, getEvents: (k, id) => (ST.days[k]?.events?.[id]) || [],
    eventOccursOnOwnDate: () => true, eventRepeatsOnDate: ev => !!ev.repeat,
    _gcalSpanN: () => 1, gcalDayDiff: () => 0,
  };
  const n = Object.keys(env);
  return new Function(...n, SRC + '\nreturn {getDisplayEvents,sortEventsByTime};')(...n.map(x => env[x]));
}
const T = '2026-10-28';
console.log('시나리오 1 — 오늘 21:30 일정 + 지난주에서 오는 20:30 반복');
{
  const api = make({
    '2026-10-21': { events: { night: [{ text: '기도회', time: '20:30', repeat: { weekly: true } }] } },
    [T]: { events: { night: [{ text: '송번역', time: '21:30' }] } },
  });
  const seen = api.getDisplayEvents(T, 'night').map(e => e.text);
  sc.eq('20:30 반복이 21:30 앞에', seen, ['기도회', '송번역']);
}
console.log('시나리오 2 — 손으로 끈 순서(자기 날 것)는 그대로, 시간 없는 반복은 끝');
{
  const api = make({
    '2026-10-21': { events: { n: [{ text: '메모', repeat: {} }, { text: '아침', time: '07:00', repeat: {} }] } },
    [T]: { events: { n: [{ text: '밤', time: '22:00' }, { text: '저녁', time: '19:00' }] } },
  });
  sc.eq('끈 순서 유지', api.getDisplayEvents(T, 'n').map(e => e.text), ['아침', '밤', '저녁', '메모']);
}
sc.done();
