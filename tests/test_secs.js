// 시간 구간 = 경계선 모델 (v26-0806-7) 을 시나리오로 못 박는다.
//
// 왜 이 테스트가 필요한가 — 이 개편은 "구간마다 시작·마침을 따로 넣던 것"을
// "구간 사이 경계선 하나"로 바꾼다. 경계가 틀어지면 겹치거나 빈 시간이 생기고,
// 일정이 엉뚱한 구간으로 가거나 아예 사라진다. 데이터가 실제로 움직이는
// 작업이라 시나리오를 먼저 두고 시작했다. (인계 문서 5-0 절)
//
// 확정 설계에서 가져온 규칙:
//   · 시작 = 위 경계, 마침 = 아래 경계 (마지막은 첫 경계로 돌아감)
//   · 픽커는 앞뒤 경계 사이 값만 → 겹치게 넣는 것이 불가능
//   · 0분 구간은 '시간 없음' 자동 (체크박스 없음). 구간이 하나면 하루 전체
//   · 하루가 갈 곳 없어지는 값은 고를 수 없다
//   · 시각이 구간을 정한다. 시각 없는 일정만 자리를 지킨다
const fs = require('fs');
const path = require('path');
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.z = n => String(n).padStart(2, '0');
global.ST = { days: {}, memorizationLog: {} };
global.SECS = [];
global.showToast = () => {};

eval(slice('// ══════ 시간 구간 = 경계선 모델', '// ══════ 경계선 모델 끝 ══════') +
  ';Object.assign(globalThis,{_t2m,_m2t,_secOffsets,_secNormalizeTimes,_secLenMin,_secMoveTo,' +
  '_secBoundaryChoices,_secTimeChoices,_secIdForTime,_secNoTime,_secIsCustom,isNowWithinSection,' +
  '_sortEventsKeepingTimeless,_reassignTimedEvents,_secArchiveCapture,_secArchiveApply,_secStripData});');

// 앱의 기본 6구간과 같은 모양 (새벽 03 · 오전 06 · 점심 12 · 오후 13 · 저녁 18 · 밤 20)
const defs = () => ([
  { id: 'dawn', name: '새벽', startTime: '03:00', endTime: '06:00' },
  { id: 'am', name: '오전', startTime: '06:00', endTime: '12:00' },
  { id: 'morn', name: '점심', startTime: '12:00', endTime: '13:00' },
  { id: 'pm', name: '오후', startTime: '13:00', endTime: '18:00' },
  { id: 'eve', name: '저녁', startTime: '18:00', endTime: '20:00' },
  { id: 'night', name: '밤', startTime: '20:00', endTime: '03:00' },
]);
const use = secs => { global.SECS = secs; return secs; };

// ═══ 1. 경계 펴기 ═══
console.log('시나리오 1 — 경계를 "첫 경계에서 몇 분" 으로 편다');
{
  sc.eq('기본 6구간', _secOffsets(defs()), [0, 180, 540, 600, 900, 1020, 1440]);
  sc.eq('마지막은 늘 1440 (하루는 24시간)', _secOffsets(defs()).pop(), 1440);
  sc.eq('구간이 하나면 하루 전체', _secOffsets([{ id: 'a', startTime: '09:00' }]), [0, 1440]);
  // 앞 경계보다 이른 값은 "한 바퀴 돌아온 자리" 로 읽는다 (하루는 동그라미).
  // 09:00 다음의 07:00 은 22시간 뒤이지, 2시간 전이 아니다.
  const bad = [{ id: 'a', startTime: '09:00' }, { id: 'b', startTime: '07:00' }, { id: 'c', startTime: '18:00' }];
  sc.eq('어긋난 옛 값도 한 바퀴 안에 눕는다', _secOffsets(bad), [0, 1320, 1320, 1440]);
  sc.eq('길이의 합은 늘 하루', (o => o[o.length - 1])(_secOffsets(bad)), 1440);
  sc.eq('경계는 뒤로 가지 않는다',
    _secOffsets(bad).every((v, i, a) => i === 0 || v >= a[i - 1]), true);

  // 맨 아래에 첫 경계와 같은 값으로 붙인 구간은 0분이다 (하루의 끝이지 시작이 아니다)
  const appended = defs().concat([{ id: 'new', startTime: '03:00' }]);
  sc.eq('맨 아래 0분 구간', _secOffsets(appended), [0, 180, 540, 600, 900, 1020, 1440, 1440]);
  sc.eq('앞 구간(밤)의 시간을 뺏지 않는다', _secLenMin(appended, 5), 420);
}

// ═══ 2. 정규화 — 마침은 늘 다음 구간의 시작 ═══
console.log('\n시나리오 2 — 마침 = 아래 경계');
{
  const s = _secNormalizeTimes(defs());
  sc.eq('오전의 마침 = 점심의 시작', s[1].endTime, s[2].startTime);
  sc.eq('마지막(밤)의 마침 = 첫 구간(새벽)의 시작', s[5].endTime, s[0].startTime);
  sc.eq('기본 6구간은 손대지 않는다',
    s.map(x => x.startTime + '-' + x.endTime),
    ['03:00-06:00', '06:00-12:00', '12:00-13:00', '13:00-18:00', '18:00-20:00', '20:00-03:00']);

  // 겹쳐 있던 옛 데이터 — 오전 09–12 / 점심 11–13 (11:30 이 양쪽에 속했다)
  const overlap = _secNormalizeTimes([
    { id: 'am', startTime: '09:00', endTime: '12:00' },
    { id: 'morn', startTime: '11:00', endTime: '13:00' },
    { id: 'pm', startTime: '13:00', endTime: '18:00' },
  ]);
  sc.eq('겹침이 사라진다', overlap.map(x => x.startTime + '-' + x.endTime),
    ['09:00-11:00', '11:00-13:00', '13:00-09:00']);
  sc.eq('한 시각은 한 구간에만', _secIdForTime.call(null, '11:30'), null); // SECS 를 아직 안 바꿔서 null
  use(overlap);
  sc.eq('11:30 은 점심 하나뿐', _secIdForTime('11:30'), 'morn');
}

// ═══ 3. 0분 구간 = 시간 없음 (자동) ═══
console.log('\n시나리오 3 — 0분이면 시간 없음, 구간 하나면 하루 전체');
{
  const s = _secNormalizeTimes([
    { id: 'am', startTime: '09:00' },
    { id: 'box', startTime: '18:00' },   // ← 아래와 같은 값이 되면 0분
    { id: 'pm', startTime: '18:00' },
  ]);
  sc.eq('0분 구간에 시간 없음 표시가 붙는다', !!s[1].noTime, true);
  sc.eq('시간 있는 구간엔 안 붙는다', [!!s[0].noTime, !!s[2].noTime], [false, false]);
  sc.eq('길이', [_secLenMin(s, 0), _secLenMin(s, 1), _secLenMin(s, 2)], [540, 0, 900]);

  // 안전장치 ① — 구간이 하나면 시작=마침이어도 '하루 전체' 라는 뜻이다
  const one = _secNormalizeTimes([{ id: 'only', startTime: '09:00' }]);
  sc.eq('구간 하나: 시작=마침', one[0].startTime === one[0].endTime, true);
  sc.eq('구간 하나: 시간 없음이 아니다', !!one[0].noTime, false);
  sc.eq('구간 하나: 길이는 하루 전체', _secLenMin(one, 0), 1440);
  use(one);
  sc.eq('구간 하나: 아무 시각이나 그 구간', [_secIdForTime('02:00'), _secIdForTime('23:59')], ['only', 'only']);

  // 예전 '시간 개념 없음' 체크는 이제 만들지 않는다 (0분이 곧 시간 없음)
  sc.eq("설정 화면에서 '시간 개념 없음' 체크박스를 없앴다",
    SRC.includes("noTimeInp.onchange"), false);
}

// ═══ 4. 시각 → 구간 ═══
console.log('\n시나리오 4 — 시각이 구간을 정한다');
{
  const s = use(_secNormalizeTimes(defs()));
  sc.eq('경계값은 아래 구간에 속한다 (06:00 → 오전)', _secIdForTime('06:00'), 'am');
  sc.eq('05:59 는 아직 새벽', _secIdForTime('05:59'), 'dawn');
  sc.eq('자정 넘는 구간 — 23:00 은 밤', _secIdForTime('23:00'), 'night');
  sc.eq('자정 넘는 구간 — 01:00 도 밤', _secIdForTime('01:00'), 'night');
  sc.eq('하루 어느 시각이든 갈 곳이 있다',
    [...Array(24 * 6).keys()].every(i => !!_secIdForTime(z(Math.floor(i / 6)) + ':' + z((i % 6) * 10))), true);

  // 0분 구간으로는 되찾지 않는다
  const withZero = use(_secNormalizeTimes([
    { id: 'am', startTime: '09:00' }, { id: 'box', startTime: '18:00' }, { id: 'pm', startTime: '18:00' },
  ]));
  sc.eq('0분 구간은 뽑히지 않는다', _secIdForTime('18:00'), 'pm');
  sc.eq('_secNoTime 은 0분 구간에만', withZero.map(_secNoTime), [false, true, false]);
}

// ═══ 5. 경계 픽커 후보 — 겹치게 넣는 것이 불가능 ═══
console.log('\n시나리오 5 — 픽커는 앞뒤 경계 사이만');
{
  const s = use(_secNormalizeTimes(defs()));
  // 오전(인덱스 1)의 시작 경계 = 새벽(03:00)과 점심(12:00) 사이
  const ch = _secBoundaryChoices(s, 1, 60);
  sc.eq('앞 경계보다 이르지 않다', Math.min(...ch) >= 180, true);
  sc.eq('뒤 경계보다 늦지 않다', Math.max(...ch) <= 720, true);
  sc.eq('앞 경계 값 자체는 고를 수 있다 (0분 만들기)', ch.includes(180), true);
  sc.eq('뒤 경계 값 자체도 고를 수 있다', ch.includes(720), true);
  sc.eq('그 밖(예: 13:00)은 아예 없다', ch.includes(780), false);

  // 자정을 넘는 자리 — 밤(인덱스 5)의 시작은 저녁(18:00)과 첫 경계(03:00) 사이
  const night = _secBoundaryChoices(s, 5, 60).sort((a, b) => a - b);
  sc.eq('자정을 넘어가도 이어진다 (18:00~03:00)',
    night.includes(1080) && night.includes(0) && night.includes(180) && !night.includes(240), true);

  // 첫 경계(인덱스 0)는 마지막 구간의 시작(20:00)과 두 번째 경계(06:00) 사이
  const first = _secBoundaryChoices(s, 0, 60);
  sc.eq('첫 경계의 앞은 마지막 구간의 시작', first.includes(1200), true);
  sc.eq('첫 경계의 뒤는 두 번째 경계', first.includes(360), true);
  sc.eq('그 밖(13:00)은 없다', first.includes(780), false);

  // 구간이 둘뿐이면 한 바퀴 어디로든 — 경계를 끝까지 밀면 위 구간이 0분이 된다
  const two = _secNormalizeTimes([{ id: 'a', startTime: '09:00' }, { id: 'b', startTime: '18:00' }]);
  sc.eq('구간 2개면 어디로든', _secBoundaryChoices(two, 1, 60).length, 24);
  two[1].startTime = '09:00'; _secNormalizeTimes(two);
  sc.eq('경계를 끝까지 밀면 위 구간이 0분', [!!two[0].noTime, !!two[1].noTime], [true, false]);
  sc.eq('아래 구간이 하루를 다 받는다', _secLenMin(two, 1), 1440);

  // 안전장치 ② — 어떤 값을 골라도 하루가 갈 곳을 잃지는 않는다
  const tight = _secNormalizeTimes([
    { id: 'a', startTime: '09:00' }, { id: 'b', startTime: '09:00' }, { id: 'c', startTime: '18:00' },
  ]);
  [0, 1, 2].forEach(i => {
    const ok = _secBoundaryChoices(tight, i, 60).every(v => {
      const trial = tight.map((x, j) => ({ id: x.id, startTime: j === i ? _m2t(v) : x.startTime }));
      _secNormalizeTimes(trial);
      return trial.some(x => !x.noTime);
    });
    sc.eq(`경계 ${i} — 어떤 값을 골라도 시간 있는 구간이 남는다`, ok, true);
  });
  sc.eq('고를 값은 늘 남아 있다', _secBoundaryChoices(tight, 2, 60).length > 0, true);
}

// ═══ 5-1. 구간을 끌어 옮기기 — 옆 구간의 시각을 흔들지 않는다 ═══
console.log('\n시나리오 5-1 — 순서 바꾸기');
{
  const fmt = s => s.map(x => `${x.id} ${x.startTime}-${x.endTime}${x.noTime ? '[무]' : ''}`);
  // 맨 아래에 0분으로 태어난 커스텀 구간을 오전과 점심 사이로 끌어 올린다
  const s = _secNormalizeTimes(defs().concat([{ id: 'C', startTime: '03:00' }]));
  sc.eq('옮기기 전', fmt(s).slice(0, 3),
    ['dawn 03:00-06:00', 'am 06:00-12:00', 'morn 12:00-13:00']);
  _secMoveTo(s, 6, 2);   // C 를 점심 자리(위)로
  sc.eq('C 는 그 틈의 시각을 복제해 0분으로 들어간다', fmt(s)[2], 'C 12:00-12:00[무]');
  sc.eq('기존 구간들의 시작·마침이 하나도 안 흔들린다', fmt(s).filter(x => !x.startsWith('C ')),
    ['dawn 03:00-06:00', 'am 06:00-12:00', 'morn 12:00-13:00',
      'pm 13:00-18:00', 'eve 18:00-20:00', 'night 20:00-03:00']);

  // 맨 위로 올려도 마찬가지
  const s2 = _secNormalizeTimes(defs().concat([{ id: 'C', startTime: '03:00' }]));
  _secMoveTo(s2, 6, 0);
  sc.eq('맨 위로 — C 는 첫 경계를 복제한다', fmt(s2)[0], 'C 03:00-03:00[무]');
  sc.eq('맨 위로 — 나머지는 그대로', fmt(s2).slice(1),
    ['dawn 03:00-06:00', 'am 06:00-12:00', 'morn 12:00-13:00',
      'pm 13:00-18:00', 'eve 18:00-20:00', 'night 20:00-03:00']);

  // 시간을 가진 구간을 옮기면, 비운 자리는 바로 위 구간이 이어받는다
  const s3 = _secNormalizeTimes([
    { id: 'a', startTime: '06:00' }, { id: 'C', startTime: '12:00' },
    { id: 'b', startTime: '14:00' }, { id: 'c', startTime: '18:00' },
  ]);
  _secMoveTo(s3, 1, 3);
  // 맨 아래 자리의 '틈' 은 하루의 끝 = 첫 경계(06:00) 다
  sc.eq('옮긴 구간은 새 자리에서 0분', fmt(s3)[3], 'C 06:00-06:00[무]');
  sc.eq('비운 자리는 바로 위 구간이 이어받는다', fmt(s3)[0], 'a 06:00-14:00');
  sc.eq('아래 구간들은 그대로', fmt(s3).slice(1, 3), ['b 14:00-18:00', 'c 18:00-06:00']);

  // 제자리에 놓으면 아무것도 바뀌지 않는다 (0분으로 만들어 버리면 안 된다)
  const s4 = _secNormalizeTimes(defs());
  const before4 = fmt(s4);
  sc.eq('제자리는 그대로', (_secMoveTo(s4, 2, 2), fmt(s4)), before4);
  sc.eq('제자리면 옮기지 않았다고 알린다', _secMoveTo(s4, 2, 2), false);
  sc.eq('말도 안 되는 자리는 무시한다', _secMoveTo(s4, 0, 99), false);

  sc.eq('길이의 합은 여전히 하루', _secOffsets(s).pop(), 1440);
  sc.eq('끌어 옮기기는 _secMoveTo 한 곳에서만', SRC.includes('_secMoveTo(SECS,from,to)'), true);
}

// ═══ 5-2. 일정 등록창의 시·분 목록은 그 구간 안에서만 ═══
console.log('\n시나리오 5-2 — + 로 등록할 때의 시각 목록');
{
  const s = use(_secNormalizeTimes(defs()));
  const am = _secTimeChoices(s[1], 60);       // 오전 06:00–12:00
  sc.eq('구간 시작은 늘 들어 있다', am[0], 360);
  sc.eq('마침(12:00)은 빠진다 — 이미 아래 구간의 것', am.includes(720), false);
  sc.eq('11:00 까지', Math.max(...am), 660);

  const night = _secTimeChoices(s[5], 60);    // 밤 20:00–03:00
  sc.eq('자정을 넘어도 이어진다',
    night.includes(1200) && night.includes(0) && night.includes(120) && !night.includes(180), true);

  sc.eq('시간 단위를 따른다 (30분)', _secTimeChoices(s[2], 30), [720, 750]);

  // 0분 구간에는 붙일 시각이 없다 → 시각 없이 등록하게 된다
  const withZero = _secNormalizeTimes([
    { id: 'am', startTime: '09:00' }, { id: 'box', startTime: '18:00' }, { id: 'pm', startTime: '18:00' },
  ]);
  sc.eq('0분 구간은 고를 시각이 없다', _secTimeChoices(withZero[1], 60), null);
  sc.eq('구간이 하나면 하루 전체가 후보', _secTimeChoices(_secNormalizeTimes([{ id: 'o', startTime: '09:00' }])[0], 60).length, 24);

  // 등록창이 이 규칙을 실제로 쓰는지
  sc.eq('등록창이 구간 범위를 쓴다', SRC.includes('_evSyncRange('), true);
  sc.eq('수정할 때는 24시간 전부 연다', SRC.includes('(_eventModalEditIdx!==null)?null:_secTimeChoices'), true);
  sc.eq('시각이 저장될 구간을 정한다',
    SRC.includes('const secId=(time&&_secIdForTime(time))||fromSec;'), true);
  sc.eq('시각 있는 일정은 끌어 옮기지 않는다',
    SRC.includes("if(ev.time){\n      showToast('시각이 있는 일정은 시간순으로 놓여요');"), true);
}

// ═══ 6. 일정 정렬 — 시각 있는 것만 시간순 ═══
console.log('\n시나리오 6 — 시각 없는 일정은 자리를 지킨다');
{
  const list = [
    { id: '1', time: '15:00', text: '늦은 것' },
    { id: '2', time: null, text: '시각 없음' },
    { id: '3', time: '09:00', text: '이른 것' },
  ];
  sc.eq('시각 있는 것만 자리를 맞바꾼다',
    _sortEventsKeepingTimeless(list).map(e => e.id), ['3', '2', '1']);
  sc.eq('시각 없는 것은 두 번째 자리 그대로',
    _sortEventsKeepingTimeless(list)[1].id, '2');
  sc.eq('같은 시각이면 넣은 순서 유지',
    _sortEventsKeepingTimeless([
      { id: 'a', time: '09:00' }, { id: 'b', time: '09:00' },
    ]).map(e => e.id), ['a', 'b']);
}

// ═══ 7. 재배치 — 경계가 바뀌면 시각 있는 일정을 다시 놓는다 ═══
console.log('\n시나리오 7 — 일정 재배치');
{
  use(_secNormalizeTimes(defs()));
  ST.days = {
    '2026-08-06': {
      big: {}, small: {}, trash: [],
      events: {
        am: [
          { id: 'e1', time: '11:00', text: '시각 있는 것' },
          { id: 'e2', time: null, text: '시각 없는 것' },
        ],
      },
    },
  };
  // 점심 경계를 10:00 으로 당기면 11:00 일정은 점심으로 가야 한다
  SECS[2].startTime = '10:00';
  _secNormalizeTimes(SECS);
  const moved = _reassignTimedEvents();
  const day = ST.days['2026-08-06'];
  sc.eq('옮긴 개수', moved, 1);
  sc.eq('시각 있는 일정이 점심으로 갔다', (day.events.morn || []).map(e => e.id), ['e1']);
  sc.eq('시각 없는 일정은 그대로 오전에', (day.events.am || []).map(e => e.id), ['e2']);

  // 갈 곳을 못 찾으면 절대 버리지 않는다
  ST.days['2026-08-07'] = { big: {}, small: {}, trash: [], events: { am: [{ id: 'x', time: '99:99' }] } };
  _reassignTimedEvents();
  sc.eq('시각이 이상해도 버리지 않는다', ST.days['2026-08-07'].events.am.length, 1);

  // 없어진 구간에 남아 있던 일정도 되찾는다
  ST.days['2026-08-08'] = { big: {}, small: {}, trash: [], events: { ghost: [{ id: 'g', time: '14:00' }] } };
  _reassignTimedEvents();
  sc.eq('사라진 구간의 일정은 시각에 맞는 구간으로',
    (ST.days['2026-08-08'].events.pm || []).map(e => e.id), ['g']);
  sc.eq('빈 껍데기는 남기지 않는다', ST.days['2026-08-08'].events.ghost, undefined);

  // 시각 없는 일정이 없어진 구간에 있으면 첫 구간으로 (버리지 않는다)
  ST.days['2026-08-09'] = { big: {}, small: {}, trash: [], events: { ghost2: [{ id: 'h', time: null }] } };
  _reassignTimedEvents();
  sc.eq('시각 없는 것도 잃지 않는다',
    Object.values(ST.days['2026-08-09'].events).flat().map(e => e.id), ['h']);
}

// ═══ 8. 보관 / 되살리기 ═══
console.log('\n시나리오 8 — 구간 보관과 되살리기');
{
  use(_secNormalizeTimes(defs()));
  const secObj = { id: 'sec9', name: '내 구간', color: '#fff', startTime: '09:00', endTime: '09:00' };
  ST.days = {
    '2026-08-06': {
      big: { sec9: [{ text: '할일1', done: false }] },
      small: { sec9: [{ text: '스몰1', done: true }] },
      trash: [],
      events: {
        sec9: [
          { id: 'v1', time: null, text: '시각 없는 일정' },
          { id: 'v2', time: '14:00', text: '시각 있는 일정' },
        ],
      },
    },
  };
  ST.memorizationLog = { '2026-08-06': { sec9: [{ verseIdx: 3, time: '09:10' }] } };
  ST.verseLikeLog = { '2026-08-06': [{ ref: '요 3:16', time: '09:20', sec: 'sec9' }, { ref: '롬 8:1', time: '13:00', sec: 'pm' }] };

  const entry = _secArchiveCapture('sec9', secObj);
  sc.eq('할일이 담겼다', entry.big['2026-08-06'].length, 1);
  sc.eq('스몰도 담겼다', entry.small['2026-08-06'].length, 1);
  sc.eq('시각 없는 일정만 담긴다', entry.events['2026-08-06'].map(e => e.id), ['v1']);
  sc.eq('암송 기록도 담긴다', entry.memo['2026-08-06'].length, 1);
  sc.eq('그 구간의 말씀 반응만 담긴다',
    entry.marks.verseLikeLog['2026-08-06'].map(e => e.ref), ['요 3:16']);

  // 지우기 — 담은 것들은 원본에서 빠지고, 시각 있는 일정은 남는다(재배치 대상)
  _secStripData('sec9', false);
  const d = ST.days['2026-08-06'];
  sc.eq('할일이 빠졌다', d.big.sec9, undefined);
  sc.eq('시각 있는 일정은 남아 재배치를 기다린다', d.events.sec9.map(e => e.id), ['v2']);
  sc.eq('다른 구간의 말씀 반응은 그대로', ST.verseLikeLog['2026-08-06'].map(e => e.ref), ['롬 8:1']);

  // 되살리기
  _secArchiveApply(entry);
  const d2 = ST.days['2026-08-06'];
  sc.eq('할일이 돌아왔다', d2.big.sec9.map(b => b.text), ['할일1']);
  sc.eq('스몰이 돌아왔다', d2.small.sec9.map(b => b.text), ['스몰1']);
  sc.eq('시각 없는 일정이 돌아왔다', d2.events.sec9.some(e => e.id === 'v1'), true);
  sc.eq('암송 기록이 돌아왔다', ST.memorizationLog['2026-08-06'].sec9.length, 1);
  sc.eq('말씀 반응이 돌아왔다', ST.verseLikeLog['2026-08-06'].length, 2);
  sc.eq('되살려도 중복으로 쌓이지 않는다',
    (_secArchiveApply(entry), ST.days['2026-08-06'].big.sec9.length), 1);

  // 보관함은 무한정 쌓지 않는다 (규모 상한)
  sc.eq('보관 개수 상한이 있다', /secArchive\.length\s*>\s*\d+/.test(SRC), true);
}

// ═══ 9. 안전장치 ③ — 서버가 같은 시각에 두 번 보내지 않게 ═══
console.log('\n시나리오 9 — 클라우드 알림 함수');
{
  const fn = fs.readFileSync(path.join(__dirname, '..', 'functions', 'index.js'), 'utf-8');
  sc.eq('0분 구간은 시작 알림을 보내지 않는다',
    /startTime\s*===\s*sec\.endTime|sec\.startTime\s*===\s*sec\.endTime/.test(fn), true);
  sc.eq('구간이 하나뿐일 때는 예외로 둔다 (하루 전체)', /secs\.length\s*>\s*1/.test(fn), true);
  sc.eq('같은 시각에 걸린 구간이 둘이어도 한 번만', /firedSlot/.test(fn), true);
  sc.eq("'시간 없음' 표시도 계속 본다", /sec\.noTime/.test(fn), true);
}

// ═══ 10. 화면 규칙 ═══
console.log('\n시나리오 10 — 설정 화면');
{
  sc.eq('경계선 줄을 그린다', SRC.includes('sec-bound-row'), true);
  sc.eq('마지막은 첫 경계로 돌아간다고 알려준다', SRC.includes('sec-bound-back'), true);
  sc.eq('⠿ 손잡이는 커스텀 구간만', SRC.includes('sec-edit-drag-off'), true);
  sc.eq('보관해 둔 구간 되살리기 자리가 있다', SRC.includes('secArchiveList'), true);
  // 새 구간은 맨 아래에 첫 경계와 같은 값(=0분)으로 붙는다
  const add = SRC.slice(SRC.indexOf('function addNewSection('), SRC.indexOf('function deleteSection('));
  sc.eq('새 커스텀 구간은 첫 경계에서 시작한다', add.includes('_secFirstBoundary()'), true);
  sc.eq('새 커스텀 구간은 0분으로 생긴다', /startTime:start,\s*endTime:start/.test(add), true);
  sc.eq('구간이 하나뿐일 때만 예외를 둔다', add.includes('SECS.length<=1'), true);
  sc.eq('새 팝업은 ESC 표에 올린다', SRC.includes("['secDelModal'"), true);
}

sc.done();
