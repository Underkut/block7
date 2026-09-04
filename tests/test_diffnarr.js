// 변경 풀이 (v26-0904-11) — 상태 두 벌의 차이를 **한국어 문장**으로 만든다
//
// 이 파일이 지키는 성질은 넷이다:
//   ① 자리(날짜·블럭·구간)와 내용(제목)을 **이름으로** 짚는다
//   ② 제목 고침 · 순서 이동 · 완료 표시를 각각 다른 말로 구분한다
//   ③ 설정 같은 덩어리 값은 JSON 통짜가 아니라 **다른 자리만** 짚는다
//   ④ 순수 함수다 — 넣어 준 상태를 고치지 않는다 (동기화에 영향이 없어야 한다)
//
// ⚠️ 병합 엔진과 같은 자리에서 떠온다(개발본). 표시 문자열이 바뀌면 큰 소리로 실패한다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
global.window = {};
global.console = console;
global.SECS = [{ id: 'am', name: '오전' }, { id: 'pm', name: '오후' }];

eval(sliceDev('// ══ 변경 풀이', '// ══ 충돌 격리')
   + '\n' + sliceDev('const _CF_KINDS=', 'function _cfMake(')
   + '\n' + sliceDev('function _fbCountArrays(', 'function _fbBulkLoss(')
   + `\nglobal.S = { diff:_dfDiff, brief:_dfBrief, arr:_dfArr, deep:_dfDeepLines,
                    setLabel:_dfSetLabel, day:_dfDay, scale:_dfScale, val:_dfVal, coll:_dfColl1,
                    josa:_dfJosa, ro:_dfRo, when:_dfWhen, ago:_dfAgo };`);

const clone = o => JSON.parse(JSON.stringify(o));
const say = (a, b) => S.diff(a, b).map(x => x.s);
const has = (lines, ...frags) => lines.some(l => frags.every(f => l.includes(f)));

// 최소한의 상태 한 벌
function st(over) {
  return Object.assign({
    days: {}, settings: {}, verseCollections: [], contacts: [],
    memorizationLog: {}, verseKeepLog: {}, verseLikeLog: {},
    verseShareLog: {}, verseDeeperLog: {}, verseEvenDeeperLog: {}
  }, over || {});
}
const day = arr => ({ '2026-09-04': { big: { am: arr }, small: {}, trash: [] } });

console.log('\n[1] 할일 — 자리와 제목을 이름으로 짚는다');
{
  const a = st({ days: day([{ text: '주일예배', done: false }]) });
  const b = st({ days: day([{ text: '주일예배', done: false }, { text: '심방', done: false }]) });
  const L = say(a, b);
  sc.eq('새 할일 한 줄', L.length, 1);
  sc.eq('날짜를 사람 말로', has(L, '9월 4일'), true);
  sc.eq('블럭·구간 이름', has(L, '빅 블럭', '오전'), true);
  sc.eq('제목과 동작', has(L, '「심방」', '새로 넣었어요'), true);
  sc.eq('지우는 쪽도 짚는다', has(say(b, a), '「심방」을 지웠어요'), true);
}

console.log('\n[2] 제목 고침 — 지움+넣음이 아니라 "고침" 한 줄로');
{
  const a = st({ days: day([{ text: '주일예배', done: false }]) });
  const b = st({ days: day([{ text: '주일 오전 예배', done: false }]) });
  const L = say(a, b);
  sc.eq('한 줄만', L.length, 1);
  sc.eq('전 → 후를 함께 보여 준다', has(L, '「주일예배」에서', '「주일 오전 예배」로 고쳤어요'), true);
}

console.log('\n[3] 순서 이동 — 몇 번째에서 몇 번째로');
{
  const three = t => t.map(x => ({ text: x, done: false }));
  const a = st({ days: day(three(['가', '나', '다'])) });
  const b = st({ days: day(three(['다', '가', '나'])) });
  const L = say(a, b);
  sc.eq('옮겼다고 읽는다', has(L, '옮겼어요'), true);
  sc.eq('자리 번호를 준다', has(L, '「다」', '3번째에서 1번째로'), true);
}

console.log('\n[4] 완료 표시·칸 하나');
{
  const a = st({ days: day([{ text: '심방', done: false }]) });
  const b = st({ days: day([{ text: '심방', done: true }]) });
  sc.eq('완료 켬', has(say(a, b), '「심방」에 완료 표시를 했어요'), true);
  sc.eq('완료 끔', has(say(b, a), '완료 표시를 풀었어요'), true);
  const c = st({ days: day([{ text: '심방', done: false, flag: true }]) });
  sc.eq('칸 이름을 한국어로', has(say(a, c), '깃발'), true);
}

console.log('\n[5] 말씀 모음 — 어느 말씀을 어느 모음에 담았나');
{
  const coll = v => [{ id: 'vc1', name: '주일 말씀', verses: v }];
  const a = st({ verseCollections: coll([{ ref: '마태복음 6:13' }]) });
  const b = st({ verseCollections: coll([{ ref: '마태복음 6:13' }, { ref: '로마서 8:28' }]) });
  const L = say(a, b);
  sc.eq('담은 곳과 말씀', has(L, '「주일 말씀」에 담았어요', '로마서 8:28'), true);
  sc.eq('뺀 것도 짚는다', has(say(b, a), '「주일 말씀」에서 뺐어요'), true);
  const c = st({ verseCollections: [{ id: 'vc1', name: '새벽 말씀', verses: [{ ref: '마태복음 6:13' }] }] });
  sc.eq('이름 고침', has(say(a, c), '「주일 말씀」', '「새벽 말씀」'), true);
  sc.eq('모음 새로 만듦', has(say(st({}), a), '새로 만들었어요'), true);
}

console.log('\n[6] 설정 — JSON 통짜가 아니라 다른 자리만');
{
  const a = st({ settings: { verseCards: { c1: { view: 'list' }, c2: { view: 'list' } } } });
  const b = st({ settings: { verseCards: { c1: { view: 'list' }, c2: { view: 'card' } } } });
  const L = say(a, b);
  sc.eq('한 줄만 (달라진 자리 하나)', L.length, 1);
  sc.eq('설정 이름을 한국어로', has(L, '말씀 카드 구성'), true);
  // ⚠️ c2·view·card 같은 프로그램 이름표는 화면에 그대로 나오면 안 된다 (HB 지적)
  sc.eq('자리 이름표를 사람 말로', has(L, '말씀 카드 2번', '보는 방식'), true);
  sc.eq('값도 사람 말로', has(L, '「목록」에서', '「카드」로 바꿨어요'), true);
  sc.eq('영문 이름표가 새어 나오지 않는다', /c2|view|list|card(?!\uFF5C)/.test(L.join('|')), false);
  sc.eq('안 달라진 c1 은 안 나온다', L.join('|').includes('말씀 카드 1번'), false);
  sc.eq('모르는 키도 갈래는 짚는다', S.setLabel('verseWidgetTag'), '말씀 위젯 · Tag');
  sc.eq('아는 키는 그대로', S.setLabel('layout'), '화면 배치');
}

console.log('\n[7] 기록·연락처');
{
  const a = st({ verseKeepLog: { '2026-09-04': [{ ref: '요한복음 3:16' }] } });
  const b = st({ verseKeepLog: { '2026-09-04': [{ ref: '요한복음 3:16' }, { ref: '시편 23:1' }] } });
  sc.eq('담아두기 늘어남', has(say(a, b), '담아두기', '1건 늘었어요', '시편 23:1'), true);
  const c = st({ memorizationLog: { '2026-09-04': { am: [{ ref: '빌립보서 4:6' }] } } });
  sc.eq('암송은 구간 안까지 본다', has(say(st({}), c), '암송', '빌립보서 4:6'), true);
  const d = st({ contacts: [{ id: 'c1', nick: '동수', tel: '010' }] });
  const e = st({ contacts: [{ id: 'c1', nick: '동수', tel: '011' }] });
  sc.eq('연락처 고침', has(say(d, e), '연락처', '「동수」', 'tel'), true);
  sc.eq('연락처 새로 넣음', has(say(st({}), d), '연락처', '새로 넣었어요'), true);
}

console.log('\n[8] 요약과 규모');
{
  const a = st({ days: day([]) });
  const b = st({ days: day([{ text: '가' }, { text: '나' }, { text: '다' }]) });
  const br = S.brief(a, b, 2);
  sc.eq('전체 건수는 그대로 센다', br.total, 3);
  sc.eq('보여 줄 줄만 자른다', br.lines.length, 2);
  sc.eq('남은 건수를 알려 준다', br.more, 1);
  sc.eq('같으면 0건', S.brief(a, a, 5).total, 0);
  const sca = S.scale(b);
  sc.eq('할일 개수를 센다', sca.tasks, 3);
  sc.eq('데이터 있는 날짜', sca.dayCount, 1);
}

console.log('\n[9] 순수 함수 — 넣어 준 상태를 고치지 않는다');
{
  const a = st({ days: day([{ text: '가', done: false }]), settings: { theme: 'dark' } });
  const b = st({ days: day([{ text: '나', done: true }]), settings: { theme: 'paper' } });
  const a0 = clone(a), b0 = clone(b);
  S.diff(a, b); S.diff(b, a); S.brief(a, b, 3);
  sc.eq('a 그대로', a, a0);
  sc.eq('b 그대로', b, b0);
  sc.eq('한쪽이 없으면 빈 목록', S.diff(null, b).length, 0);
}

console.log('\n[10] 날짜·값 표기');
{
  sc.eq('요일까지', S.day('2026-09-04'), '9월 4일 (금)');
  sc.eq('날짜가 아니면 그대로', S.day('bulk/days'), 'bulk/days');
  sc.eq('참/거짓은 켬/끔', [S.val(true), S.val(false)], ['켬', '끔']);
  sc.eq('없는 값', S.val(undefined), '(없음)');
  sc.eq('긴 글은 자른다', S.val('가'.repeat(40)).length < 34, true);
}

console.log('\n[11] 한국어 조사 — 읽었을 때 걸리지 않게');
{
  sc.eq('받침 있으면 을', S.josa('「심방」', '을', '를'), '을');
  sc.eq('받침 없으면 를', S.josa('「예배」', '을', '를'), '를');
  sc.eq('한글이 아니면 둘 다', S.josa('card#c1', '을', '를'), '을(를)');
  sc.eq('받침 없으면 로', S.ro('「예배」'), '로');
  sc.eq('ㄹ 받침도 로', S.ro('「가을」'), '로');
  sc.eq('그 밖의 받침은 으로', S.ro('「심방」'), '으로');
  // 실제 문장에서 확인
  const a = st({ days: day([{ text: '심방' }]) });
  const b = st({ days: day([]) });
  sc.eq('지움 문장', has(say(a, b), '「심방」을 지웠어요'), true);
  const c = st({ days: day([{ text: '예배' }]) });
  sc.eq('바뀜 문장', has(say(a, c), '「예배」로 고쳤어요'), true);
}

console.log('\n[12] 시각 표기');
{
  const now = 1700000000000;
  sc.eq('막 지났으면 방금', S.ago(now - 30 * 1000, now), '방금');
  sc.eq('분 단위', S.ago(now - 5 * 60 * 1000, now), '5분 전');
  sc.eq('시간 단위', S.ago(now - 3 * 3600 * 1000, now), '3시간 전');
  sc.eq('날 단위', S.ago(now - 2 * 86400 * 1000, now), '2일 전');
  sc.eq('없으면 미상', S.when(null), '시각 미상');
  sc.eq('얼마나 지났는지를 함께 준다', S.when(now - 3600 * 1000, now).includes('1시간 전'), true);
}

sc.done();
