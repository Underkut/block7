// 말씀 반응 카운터가 장절 표기 차이 때문에 0으로 보이던 문제 (v26-0802-5)
//
// 로그는 "누른 시점의 장절 문자열"을 그대로 저장한다. 그래서 같은 구절이라도
//   '요1:18' (약칭) / '요한복음 1:18' / '요한복음  1:18' (공백 두 칸)
// 이 섞여 쌓인다. 예전 _verseEventCount 는 === 로만 비교해서, 대시보드에는
// 기록이 보이는데 전체화면 카운터만 0으로 나오는 일이 있었다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

// _REF_ABBR2FULL + _refNorm 을 통째로 떠온다
eval(slice('const _REF_ABBR2FULL=', 'function _findVerseByRefLoose'));
// 카운터 본체
eval(slice('function _verseEventCount(', 'function _vfSyncCounts'));

// _verseEventCount 가 읽는 로그 접근자들을 테스트용으로 갈아끼운다
let MEM = {}, LIKE = {}, DEEPER = {}, EVEN = {}, SHARE = {};
global.getMemLog = () => MEM;
global.getLikeLog = () => LIKE;
global.getDeeperLog = () => DEEPER;
global.getEvenDeeperLog = () => EVEN;
global.getShareLog = () => SHARE;

// ═══ 1. 신고된 증상: 대시보드엔 9회인데 전체화면은 0 ═══
console.log('시나리오 1 — 표기가 다른 암송 기록도 같은 구절로 센다');
{
  // 하루치 암송 로그: 구간(sec)별 배열. 표기가 제각각인 채로 쌓였다.
  MEM = {
    '2026-07-30': { am: [{ ref: '요한복음 1:18', time: '09:00' }] },
    '2026-07-31': { am: [{ ref: '요한복음  1:18', time: '09:10' }] },   // 공백 두 칸
    '2026-08-01': { pm: [{ ref: '요1:18', time: '20:00' }] },            // 약칭
    '2026-08-02': { am: [{ ref: '로마서 8:14', time: '07:00' }] }        // 다른 구절
  };
  sc.eq('정식 표기로 물으면 3건 모두', _verseEventCount('mem', '요한복음 1:18'), 3);
  sc.eq('약칭으로 물어도 3건 모두', _verseEventCount('mem', '요1:18'), 3);
  sc.eq('공백 두 칸으로 물어도 3건 모두', _verseEventCount('mem', '요한복음  1:18'), 3);
  sc.eq('다른 구절은 섞이지 않음', _verseEventCount('mem', '로마서 8:14'), 1);
  sc.eq('기록 없는 구절은 0', _verseEventCount('mem', '시편 23:1'), 0);
}

// ═══ 2. 좋아요·Deeper·Even·공유도 같은 규칙 ═══
console.log('\n시나리오 2 — 누적 이벤트형 로그(날짜 → 배열)도 동일하게');
{
  LIKE = { '2026-08-01': [{ ref: '시23:1', time: '10:00' }, { ref: '시편 23:1', time: '10:05' }] };
  DEEPER = { '2026-08-01': [{ ref: '시편  23:1', time: '11:00' }] };
  EVEN = { '2026-08-02': [{ ref: '시23:1', time: '12:00' }] };
  SHARE = { '2026-08-02': [{ ref: '시편 23:1', time: '13:00' }] };
  sc.eq('좋아요 2건', _verseEventCount('like', '시편 23:1'), 2);
  sc.eq('Deeper 1건', _verseEventCount('deeper', '시편 23:1'), 1);
  sc.eq('Even 1건 (약칭 로그를 정식으로 조회)', _verseEventCount('even', '시편 23:1'), 1);
  sc.eq('공유 1건', _verseEventCount('share', '시편 23:1'), 1);
  sc.eq('Deeper 를 약칭으로 조회해도 1건', _verseEventCount('deeper', '시23:1'), 1);
}

// ═══ 3. 경계값 — 빈 값·깨진 항목에도 터지지 않아야 한다 ═══
console.log('\n시나리오 3 — 빈 값과 깨진 항목');
{
  MEM = {
    '2026-08-01': { am: [{ ref: '', time: '09:00' }, { time: '09:01' }, null] },
    '2026-08-02': { am: null }
  };
  sc.eq('ref 없이 물으면 0', _verseEventCount('mem', ''), 0);
  sc.eq('null 로 물어도 0', _verseEventCount('mem', null), 0);
  sc.eq('빈 ref·null 항목은 세지 않음', _verseEventCount('mem', '요한복음 1:18'), 0);
  LIKE = {};
  sc.eq('로그가 비어도 0', _verseEventCount('like', '요한복음 1:18'), 0);
}

// ═══ 4. 서로 다른 책의 약칭이 헷갈리지 않아야 한다 ═══
console.log('\n시나리오 4 — 약칭이 겹치는 책 구분');
{
  MEM = {
    '2026-08-01': { am: [
      { ref: '삼상 7:12', time: '09:00' },   // 사무엘상
      { ref: '삼하 7:12', time: '09:01' }    // 사무엘하
    ] }
  };
  sc.eq('사무엘상만 1건', _verseEventCount('mem', '사무엘상 7:12'), 1);
  sc.eq('사무엘하만 1건', _verseEventCount('mem', '사무엘하 7:12'), 1);
}

sc.done();
