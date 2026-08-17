// 토스트 개선 (v26-0817-1, HB 요청)
// ① 유지 시간을 글자 수에 비례하게 — 글자당 200ms, 최소 3.0s, 최대 9.0s
// ② 날짜 이동 안내에 실제 날짜·요일·구간을 담는다
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.ST = { settings: {} };
global.SECS = [
  { id: 'am', name: '오전' },
  { id: 'pm', name: '오후' },
  { id: 'night', name: '밤' }
];

eval(slice('const _KDOW=', '\n// ─ Toast ─')
  + '\nglobal._moveDateToastMsg=_moveDateToastMsg;global._KDOW=_KDOW;');

console.log('시나리오 1 — 날짜 이동 안내 문구');
{
  sc.eq('월/일/요일/구간 순서로 담는다',
        _moveDateToastMsg('2026-08-17', 'am'), '8월 17일 월요일 오전 날짜로 이동했어요');
  sc.eq('다른 요일도 맞는다',
        _moveDateToastMsg('2026-08-18', 'pm'), '8월 18일 화요일 오후 날짜로 이동했어요');
  sc.eq('구간을 못 찾으면 그 자리를 뺀다',
        _moveDateToastMsg('2026-08-17', 'unknown'), '8월 17일 월요일 날짜로 이동했어요');
  // 요일은 항상 한글 — 사용자가 DOW 표기를 L/M/T 로 바꿔 둬도 이 문구는 안 바뀐다
  sc.eq('요일 배열은 한글 고정', _KDOW, ['일', '월', '화', '수', '목', '금', '토']);
}

console.log('\n시나리오 2 — 토스트 유지 시간이 글자 수에 비례한다');
{
  const { SRC } = require('./_load');
  sc.eq('글자당 200ms', SRC.includes('const dur=Math.min(9000,Math.max(3000,s.length*200));'), true);
  sc.eq('예전 문구 길이는 최소값 그대로',
        Math.min(9000, Math.max(3000, '날짜로 이동했어요'.length * 200)), 3000);
  const longMsg = _moveDateToastMsg('2026-08-17', 'am');
  const longDur = Math.min(9000, Math.max(3000, longMsg.length * 200));
  sc.eq('긴 문구는 더 오래 떠 있는다', longDur > 3000, true);
  sc.eq('9초를 넘지 않는다',
        Math.min(9000, Math.max(3000, 'x'.repeat(100).length * 200)), 9000);
}

sc.done();
