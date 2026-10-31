// 검색 엔진 (v. 26-1031-8, HB 1031 1-2) — '// ── 검색 엔진 ──' 덩어리만 떼어 시험한다.
// 지키는 것: 할일(빅·스몰·하위·메모) · 일정 · 말씀 · 명제를 찾는다 · 띄어쓰기·대소문자 무시 ·
// 반복 묶음은 가장 가까운 한 줄 · 앞으로/지난 · 바로 모아 보기 · **읽기만 한다**(ST.days 를 바꾸지 않는다)
const { makeScorer, slice } = require('./_load');
const sc = makeScorer();
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const api = new Function('esc', slice('// ── 검색 엔진 ──', '// ── 검색 엔진 끝 ──') + '\nreturn {_srchRun,_srchMark,_srchSnippet,_srchNorm,_srchEvDest,_srchWeekOff,_srchFilterFix,SRCH_QUICK,_srchCarryMin,_srchQuickLabel};')(esc);
const SECS = [{ id: 'am', name: '오전' }, { id: 'pm', name: '오후' }];
const days = () => ({
  '2026-10-31': {
    big: { am: [{ text: '김 집사님께 연락', flag: true, contactTask: true }, { text: '보고서', memo: '국세청 연락 필요' }] },
    small: { pm: [{ text: '교통민원 국세청', urgent: true }] },
    events: { pm: [{ text: '셀 모임', time: '14:00', loc: '소예배실' }] }
  },
  '2026-11-05': { big: { pm: [{ text: '수련회 준비', subs: [{ text: '숙소 연락', done: false }, { text: '차량', done: true }] }] }, small: {}, events: {} },
  '2026-10-20': { big: { am: [{ text: '보험사 연락', done: true, autoCarryCount: 4 }] }, small: {}, events: {} },
  '2026-11-06': { big: { am: [{ text: '찬양 콘티 연락', rid: 'r1' }] }, small: {}, events: { am: [{ text: '부모님 안부', rid: 'e1' }] } },
  '2026-11-13': { big: { am: [{ text: '찬양 콘티 연락', rid: 'r1' }] }, small: {}, events: { am: [{ text: '부모님 안부', rid: 'e1' }] } },
  '2026-10-30': { big: { am: [{ text: '찬양 콘티 연락', rid: 'r1' }] }, small: {}, events: {} }
});
const verses = [
  { idx: 0, ref: '롬 12:12', krText: '소망 중에 즐거워하며 환난 중에 참으며', cat: '가을 암송', topic: '기도', tags: ['기도'] },
  { idx: 1, ref: '눅 15:20', krText: '하나님은 끊어진 연락을 먼저 이으신다', cat: '설교', pid: 'p1' },
  { idx: 2, ref: '빌 4:6', krText: '아무 것도 염려하지 말고', cat: '평안', tags: ['평안'] }
];
const run = (q, more) => api._srchRun(days(), Object.assign({ q, today: '2026-10-31', secs: SECS, verses }, more || {}));

console.log('시나리오 1 — 할일 빅 · 스몰 · 하위 · 메모를 함께 찾는다');
{
  const r = run('연락');
  const t = r.tasks.map(x => x.kind + ':' + (x.kind === 'sub' ? x.sub.text : x.item.text));
  sc.eq('빅', t.includes('big:김 집사님께 연락'), true);
  sc.eq('하위 — 상위 할일과 함께', r.tasks.some(x => x.kind === 'sub' && x.sub.text === '숙소 연락' && x.item.text === '수련회 준비' && x.subIdx === 0), true);
  sc.eq('메모에서 찾음', r.tasks.some(x => x.item.text === '보고서' && x.memoHit), true);
  sc.eq('완료한 것도 나온다', t.includes('big:보험사 연락'), true);
  sc.eq('스몰', run('국세청').tasks.some(x => x.kind === 'small' && x.type === 'small' && x.secId === 'pm'), true);
}

console.log('\n시나리오 2 — 띄어쓰기 · 대소문자 무시');
{
  sc.eq('"교통 민원" → 교통민원', run('교통 민원').tasks.length, 1);
  sc.eq('글자 감싸기는 원문 위치로', api._srchMark('교통민원 국세청', '통민'), '교<mark class="srch-hit">통민</mark>원 국세청');
  sc.eq('띄어 쓴 원문도', api._srchMark('김 집사님', '김집'), '<mark class="srch-hit">김 집</mark>사님');
  sc.eq('HTML 은 막는다', api._srchMark('<b>연락', '연락'), '&lt;b&gt;<mark class="srch-hit">연락</mark>');
}

console.log('\n시나리오 3 — 반복 묶음은 오늘에서 가장 가까운 한 줄 + 횟수');
{
  const r = run('찬양 콘티');
  sc.eq('한 줄', r.tasks.length, 1);
  sc.eq('가장 가까운 앞날(11.06)', r.tasks[0].k, '2026-11-06');
  sc.eq('세 번', r.tasks[0].repN, 3);
  const e = run('안부').events;
  sc.eq('일정 반복도 한 줄 · 두 번', [e.length, e[0].repN, e[0].k], [1, 2, '2026-11-06']);
}

console.log('\n시나리오 4 — 가까운 날짜순 · 앞으로 / 지난');
{
  const ks = run('연락').tasks.map(x => x.k);
  sc.eq('오늘이 먼저', ks[0], '2026-10-31');
  sc.eq('오래된 것이 마지막', ks[ks.length - 1], '2026-10-20');
  sc.eq('앞으로: 지난 것 없음', run('연락', { range: 'future' }).tasks.every(x => x.k >= '2026-10-31'), true);
  sc.eq('지난: 오늘 · 앞날 없음', run('연락', { range: 'past' }).tasks.map(x => x.k), ['2026-10-30', '2026-10-20']);
}

console.log('\n시나리오 5 — 일정 · 말씀 · 명제');
{
  sc.eq('일정 장소로도', run('소예배실').events.length, 1);
  const r = run('연락');
  sc.eq('명제는 명제 칸', r.props.map(v => v.ref), ['눅 15:20']);
  sc.eq('말씀 칸엔 안 섞인다', r.verses.length, 0);
  sc.eq('구절 표기로', run('롬12').verses.map(v => v.idx), [0]);
  sc.eq('#태그로', run('#평안').verses.map(v => v.idx), [2]);
}

console.log('\n시나리오 6 — 바로 모아 보기');
{
  const q = id => api._srchRun(days(), { quick: id, today: '2026-10-31', secs: SECS });
  sc.eq('중요', q('flag').tasks.map(x => x.item.text), ['김 집사님께 연락']);
  sc.eq('긴급', q('urgent').tasks.map(x => x.item.text), ['교통민원 국세청']);
  sc.eq('연락할 일', q('contact').tasks.length, 1);
  sc.eq('밀린 할일 — 완료한 것은 뺀다', q('carry').tasks.length, 0);
  sc.eq('이번 주 일정(오늘~6일 뒤)', q('weekEv').events.map(x => x.k), ['2026-10-31', '2026-11-06']);
}

console.log('\n시나리오 7 — 읽기만 한다 · 빈 검색어는 아무것도 안 낸다');
{
  const d = days(), before = JSON.stringify(d);
  api._srchRun(d, { q: '연락', today: '2026-10-31', secs: SECS, verses });
  api._srchRun(d, { quick: 'flag', today: '2026-10-31', secs: [{ id: 'night' }] });
  sc.eq('ST.days 는 그대로 (없는 구간·날을 만들지 않는다)', JSON.stringify(d), before);
  const e = api._srchRun(d, { q: '   ', today: '2026-10-31' });
  sc.eq('빈 검색어', e.tasks.length + e.events.length + e.verses.length + e.props.length, 0);
  sc.eq('깨진 날 문서도 넘어간다', api._srchRun({ x: null, '2026-10-31': { big: { am: [null, 3, { text: '연락' }] } } }, { q: '연락', today: '2026-10-31' }).tasks.length, 1);
}

console.log('\n시나리오 8 — 긴 말씀은 찾은 곳 둘레만');
{
  const long = '가'.repeat(100) + '연락' + '나'.repeat(100);
  const sn = api._srchSnippet(long, '연락', 40);
  sc.eq('찾은 곳이 들어 있다', sn.includes('연락'), true);
  sc.eq('앞뒤 … 표시', sn.startsWith('… ') && sn.endsWith(' …'), true);
}

console.log('\n시나리오 9 — 결과의 일정을 누르면 어디로 (4단계: 설정 D/W/M · 기본 M · 2·3단은 펼친 위젯 먼저)');
{
  const go = (w, m, o) => api._srchEvDest(w, m, o);
  sc.eq('기본은 M — 1단은 단일 M뷰', go(undefined, 1, []), { to: 'm' });
  sc.eq('1단 W → W뷰', go('w', 1, ['weekly']), { to: 'w' });
  sc.eq('D 는 2·3단이어도 D뷰', go('d', 3, ['weekly', 'monthSingle']), { to: 'd' });
  sc.eq('3단 M · 월간 위젯이 있으면 그 위젯', go('m', 3, ['weekly', 'monthSingle']), { to: 'widget', widget: 'monthSingle' });
  sc.eq('2단 W · 주간 위젯', go('w', 2, ['monthSingle', 'weekly']), { to: 'widget', widget: 'weekly' });
  sc.eq('M 을 골랐는데 주간 위젯만 → 주간 위젯', go('m', 2, ['weekly']), { to: 'widget', widget: 'weekly' });
  sc.eq('W 를 골랐는데 세 달 위젯만 → 세 달', go('w', 3, ['monthTriple']), { to: 'widget', widget: 'monthTriple' });
  sc.eq('펼친 위젯이 없으면 단일뷰', go('w', 3, []), { to: 'w' });
  sc.eq('이상한 값은 M 으로', go('x', 1, []), { to: 'm' });
}

console.log('\n시나리오 10 — 주간뷰 몇 주 뒤 (일요일 시작 · 주간뷰 wOffset 과 같은 잣대)');
{
  const w = api._srchWeekOff;
  sc.eq('같은 주 (토 10.31 → 일 10.25)', w('2026-10-31', '2026-10-25'), 0);
  sc.eq('다음 날 일요일은 다음 주', w('2026-10-31', '2026-11-01'), 1);
  sc.eq('지난주 토요일', w('2026-10-31', '2026-10-24'), -1);
  sc.eq('해를 넘겨도', w('2026-12-30', '2027-01-03'), 1);
  sc.eq('석 달 뒤', w('2026-10-31', '2027-01-31'), 14);
  sc.eq('깨진 날짜는 0', w('2026-10-31', 'x'), 0);
}

console.log('\n시나리오 11 — 결과 할일이 D뷰 위 거르기 단추에 가려지면 무엇을 바꾸나 (v. 26-1031-10)');
{
  const f = api._srchFilterFix;
  sc.eq('거르기 없음 → 바꿀 것 없음', f({ text: 'a' }, null, {}), {});
  sc.eq('깃발만 보기 · 깃발 없는 할일 → 푼다', f({ text: 'a' }, 'flagFilter', {}), { marker: 'flag' });
  sc.eq('깃발만 보기 · 깃발 할일 → 그대로', f({ text: 'a', flag: true }, 'flagFilter', {}), {});
  sc.eq('연락만 보기 · 연락할 일 아님 → 푼다', f({ text: 'a', flag: true }, 'contactFilter', {}), { marker: 'contact' });
  sc.eq('완료 숨김 · 완료한 할일 → 보이게', f({ done: true }, null, { showCompletedTasks: false }), { showDone: true });
  sc.eq('✓ 단추가 설정에서 꺼져 있으면 단추도', f({ done: true }, null, { showCompletedTasks: false, showCompletedBtn: false }), { showDone: true, showDoneBtn: true });
  sc.eq('완료 숨김이어도 안 끝낸 할일은 그대로', f({ done: false }, null, { showCompletedTasks: false, showCompletedBtn: false }), {});
  sc.eq('완료 보임(값 없음 = 보임) → 그대로', f({ done: true }, null, {}), {});
  sc.eq('둘 다 걸리면 둘 다', f({ done: true }, 'flagFilter', { showCompletedTasks: false }), { marker: 'flag', showDone: true });
  sc.eq('깨진 값', f(null, 'flagFilter', {}), {});
}

console.log('\n시나리오 12 — 첫 화면 손질: 긴급 뺌 · 밀린 할일 기준을 설정에서 (v. 26-1031-12)');
{
  const q = api.SRCH_QUICK.map(x => x.id);
  sc.eq('줄은 중요 · 연락 · 밀림 · 이번 주 일정 (긴급 없음)', q, ['flag', 'contact', 'carry', 'weekEv']);
  sc.eq('기준 기본 3 · 설정값 · 엉뚱한 값은 3', [api._srchCarryMin({}), api._srchCarryMin({ srchCarryMin: 5 }), api._srchCarryMin({ srchCarryMin: 0 }), api._srchCarryMin({ srchCarryMin: 'x' }), api._srchCarryMin({ srchCarryMin: 99 })], [3, 5, 3, 3, 3]);
  sc.eq('줄 이름에 기준이 따라간다', api._srchQuickLabel(api.SRCH_QUICK[2], { srchCarryMin: 5 }), '밀린 할일 (5번 이상)');
  const d = { '2026-10-31': { big: { am: [{ text: 'a', autoCarryCount: 2 }, { text: 'b', autoCarryCount: 3 }, { text: 'c', autoCarryCount: 2, manualCarryCount: 3 }, { text: 'd', autoCarryCount: 9, done: true }] }, small: {}, events: {} } };
  const n = m => api._srchRun(d, { quick: 'carry', carryMin: m, today: '2026-10-31', secs: SECS }).tasks.map(x => x.item.text).join('');
  sc.eq('기준 3 → b c (끝낸 것 제외)', n(3), 'bc');
  sc.eq('기준 5 → c', n(5), 'c');
  sc.eq('기준 1 → a b c', n(1), 'abc');
  sc.eq('기준을 안 주면 3', n(undefined), 'bc');
}

sc.done();
