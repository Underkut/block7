// 시리로 할일 넣기 — 앱 쪽 (v26-1025-2, docs/ROADMAP.md '시리로 할일 넣기')
// 지키는 것:
//  ① 날: 오늘 · 내일 · 모레 · 내일모레 · 글피 · N월 N일(지났으면 내년) · N일(지났으면 다음 달) · 없는 날(2월 30일)은 날로 안 읽음
//  ② 구간: 사람이 정한 이름 먼저 · 이름을 바꾼 사람도 '아침' · '저녁' 같은 낱말이 그 시각의 구간으로 · 뒤에 붙는 말(에 · 때 · 중에)
//  ③ 말하지 않으면: 날은 오늘 · 구간은 오늘이면 지금 구간(펼친 것 중) · 다른 날이면 펼친 첫 구간
//  ④ ⭐ 말한 시각(at)으로 푼다 · 하루 시작 시각(dayStartHour)을 따른다
//  ⑤ 낱말 경계 — '새벽기도' · '오늘의 묵상' · '낮잠' 은 쪼개지 않는다 · 시리가 붙인 쉼표 · 마침표
//  ⑥ ⭐ 잃지 않는다 — 내용이 비면 들은 말 전체 · 200자까지 · 이상한 자료에도 죽지 않는다
//  ⑦ 쪽지함 받기에 잇기 — 시리 쪽지는 풀어서, 기도노트 쪽지는 예전 그대로 · ⭐ 갱신 전 앱(풀기 없음)도 잃지 않는다
//  ⑧ 토스트 — 날 · 구간 · 내용을 줄로 나눠 · 기도노트 글은 예전 그대로
//  ⑨ 설정 칸 — 계정 탭 · Sweeter 에서 감춤 · 개발본에서 못 씀 · 기기 키는 _lsk · 복사는 누른 순간 동기적으로
const fs = require('fs'), path = require('path');
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const PURE = slice('// ═══════ 시리 → 할일 (', '// ── 시리: 앱에 잇는 자리 ──');
const F = new Function(PURE + '; return {_siriParse,_siriDayLabel,_todoInboxToast,_siriSecAt};')();
const d0 = SRC.indexOf('const DEFAULT_SECS=['), d1 = SRC.indexOf('];', d0);
const DEF = new Function(SRC.slice(d0, d1 + 2) + '; return DEFAULT_SECS;')();
const VIS = ['am', 'pm', 'night'];   // defaultState 의 펼친 구간
const at = (mo, d, h, mi) => new Date(2026, mo - 1, d, h, mi || 0).getTime();   // 2026년, 이 기기 시각
const SAT = at(10, 25, 8, 0);        // 2026-10-25 (일) 08:00
const P = (say, o) => { o = o || {}; return F._siriParse(say, o.at || SAT, o.secs || DEF, o.vis || VIS, o.startH || 0); };
const DS = (r) => r && [r.date, r.sec, r.text];

console.log('\n① 날');
sc.eq('오늘 오전 우유 사기', DS(P('오늘 오전 우유 사기')), ['2026-10-25', 'am', '우유 사기']);
sc.eq('내일 오전 우유 사기', DS(P('내일 오전 우유 사기')), ['2026-10-26', 'am', '우유 사기']);
sc.eq('모레 저녁 심방', DS(P('모레 저녁 심방')), ['2026-10-27', 'eve', '심방']);
sc.eq('내일모레 · 내일 모레 = 모레', [DS(P('내일모레 밤 기도'))[0], DS(P('내일 모레 밤 기도'))[0]], ['2026-10-27', '2026-10-27']);
sc.eq('글피 = 사흘 뒤', DS(P('글피 오후 병원'))[0], '2026-10-28');
sc.eq('10월 30일 저녁 심방', DS(P('10월 30일 저녁 심방')), ['2026-10-30', 'eve', '심방']);
sc.eq('띄어쓰기가 달라도 (10 월 30 일 · 10월30일)', [DS(P('10 월 30 일 점심 약속'))[0], DS(P('10월30일 점심 약속'))[0]], ['2026-10-30', '2026-10-30']);
sc.eq('⭐ 지난 N월 N일 → 내년', DS(P('3월 1일 오전 삼일절 예배'))[0], '2027-03-01');
sc.eq('오늘 날짜를 N월 N일로 → 오늘', DS(P('10월 25일 오후 정리'))[0], '2026-10-25');
sc.eq('30일 → 이번 달', DS(P('30일 오전 보고서'))[0], '2026-10-30');
sc.eq('⭐ 지난 N일 → 다음 달', DS(P('5일 오전 월세'))[0], '2026-11-05');
sc.eq('12월에 지난 N일 → 다음 해 1월', DS(P('3일 오전 신년 계획', { at: at(12, 20, 9) }))[0], '2027-01-03');
sc.eq('없는 날(2월 30일)은 날로 안 읽고 내용에 남긴다', DS(P('2월 30일 오전 무엇')), ['2026-10-25', 'am', '2월 30일 오전 무엇']);
sc.eq('뒤에 붙는 말 — 내일은 · 26일날 · 모레까지 · 내일에', [DS(P('내일은 오전 쉬기'))[0], DS(P('26일날 오후 회의'))[0], DS(P('모레까지 보고서 내기'))[0], DS(P('내일에 오전 청소'))[0]],
  ['2026-10-26', '2026-10-26', '2026-10-27', '2026-10-26']);
sc.eq('모레까지 — 내용에서 까지가 빠진다', DS(P('모레까지 보고서 내기'))[2], '보고서 내기');

console.log('\n② 구간');
sc.eq('기본 여섯 이름', ['새벽', '오전', '점심', '오후', '저녁', '밤'].map(w => P('내일 ' + w + ' 할 것').sec), ['dawn', 'am', 'morn', 'pm', 'eve', 'night']);
sc.eq('뒤에 붙는 말 — 점심때 · 저녁에 · 오전 중에 · 밤에는 · 점심 때', ['점심때 약', '저녁에 운동', '오전 중에 전화', '밤에는 기도', '점심 때 약'].map(w => DS(P('내일 ' + w)).slice(1)),
  [['morn', '약'], ['eve', '운동'], ['am', '전화'], ['night', '기도'], ['morn', '약']]);
sc.eq('날 없이 구간만 → 오늘', DS(P('저녁 장보기')), ['2026-10-25', 'eve', '장보기']);
const MINE = JSON.parse(JSON.stringify(DEF));
MINE[1].name = '출근 전'; MINE[3].name = '일터'; MINE.push({ id: 'c1', name: '운동 시간', startTime: '03:00', endTime: '03:00', noTime: true });
sc.eq('⭐ 사람이 바꾼 이름', DS(P('내일 일터 회의 자료', { secs: MINE })), ['2026-10-26', 'pm', '회의 자료']);
sc.eq('이름에 띄어쓰기가 있어도 (출근 전 · 출근전)', [P('내일 출근 전 다림질', { secs: MINE }).sec, P('내일 출근전 다림질', { secs: MINE }).sec], ['am', 'am']);
sc.eq('⭐ 이름을 바꿨어도 낱말(오전 · 오후)은 그 시각의 구간으로', [P('내일 오전 다림질', { secs: MINE }).sec, P('내일 오후 회의', { secs: MINE }).sec], ['am', 'pm']);
sc.eq('낱말 아침 · 낮 → 시각의 구간', [P('내일 아침 산책').sec, P('내일 낮 빨래').sec], ['am', 'pm']);
sc.eq('시간 없는 구간도 이름으로는 고른다', P('운동 시간 스쿼트', { secs: MINE }).sec, 'c1');
sc.eq('긴 이름이 먼저 (오전 · 오전반)', P('내일 오전반 수업', { secs: [{ id: 'a', name: '오전', startTime: '06:00', endTime: '09:00' }, { id: 'b', name: '오전반', startTime: '09:00', endTime: '06:00' }] }).sec, 'b');
sc.eq('구간은 하나만 — 두 번째 구간 말은 내용에', DS(P('오늘 오전 오후 회의')).slice(1), ['am', '오후 회의']);

console.log('\n③ 말하지 않으면');
sc.eq('날도 구간도 없으면 — 오늘 · 지금 구간(08:00 오전)', DS(P('우유 사기')), ['2026-10-25', 'am', '우유 사기']);
sc.eq('오늘 · 지금 구간(15:00 오후 · 22:00 밤)', [P('우유', { at: at(10, 25, 15) }).sec, P('우유', { at: at(10, 25, 22) }).sec], ['pm', 'night']);
sc.eq('지금 구간이 접힌 구간(12:30 점심)이면 펼친 첫 구간 — _currentSecId 와 같다', P('약 먹기', { at: at(10, 25, 12, 30) }).sec, 'am');
sc.eq('다른 날은 펼친 첫 구간 (밤에 말해도)', DS(P('내일 우유 사기', { at: at(10, 25, 22) })), ['2026-10-26', 'am', '우유 사기']);
sc.eq('펼친 구간 목록이 없으면 시간 있는 첫 구간', P('내일 우유', { vis: [] }).sec, 'dawn');

console.log('\n④ 말한 시각 · 하루 시작 시각');
sc.eq('⭐ 밤 11시에 말한 내일 = 그다음 날 (꺼낸 때와 상관없음)', DS(P('내일 오전 우유', { at: at(10, 25, 23) }))[0], '2026-10-26');
sc.eq('하루 시작 0시 — 새벽 1시의 오늘은 새 날', DS(P('오늘 우유', { at: at(10, 26, 1) }))[0], '2026-10-26');
sc.eq('⭐ 하루 시작 3시 — 새벽 1시의 오늘은 전날 · 지금 구간은 밤', DS(P('오늘 우유', { at: at(10, 26, 1), startH: 3 })).slice(0, 2), ['2026-10-25', 'night']);
sc.eq('하루 시작 3시 — 새벽 1시의 내일은 26일', DS(P('내일 우유', { at: at(10, 26, 1), startH: 3 }))[0], '2026-10-26');

console.log('\n⑤ 낱말 경계 · 시리 문장부호');
sc.eq('새벽기도 가기 — 쪼개지 않는다', DS(P('새벽기도 가기')), ['2026-10-25', 'am', '새벽기도 가기']);
sc.eq('오늘의 묵상 — 날로 안 읽는다', DS(P('오늘의 묵상 쓰기')).slice(2), ['오늘의 묵상 쓰기']);
sc.eq('낮잠 자기 — 낮으로 안 읽는다', DS(P('내일 낮잠 자기')).slice(1), ['am', '낮잠 자기']);
sc.eq('내일, 오전, 우유 사기.', DS(P('내일, 오전, 우유 사기.')), ['2026-10-26', 'am', '우유 사기']);
sc.eq('여러 칸 띄어쓰기 · 앞뒤 공백', DS(P('  내일   오전   우유  사기 ')), ['2026-10-26', 'am', '우유 사기']);
sc.eq('내용 안의 마침표 · 물음표는 남긴다', DS(P('내일 오전 3.5km 뛰기?'))[2], '3.5km 뛰기?');

console.log('\n⑥ 잃지 않는다');
sc.eq('⭐ 내용이 비면 들은 말 전체', DS(P('내일 오전')), ['2026-10-26', 'am', '내일 오전']);
sc.eq('200자까지', P('내일 오전 ' + 'ㄱ'.repeat(300)).text.length, 200);
sc.eq('빈 말 · 구간 없음 · 이상한 자료', [P(''), P('   '), P(null), F._siriParse('우유', SAT, [], VIS, 0), F._siriParse('우유', SAT, null, null, 0)], [null, null, null, null, null]);
sc.eq('시각이 이상해도 죽지 않는다', typeof F._siriParse('우유', 'x', DEF, VIS, 0).date, 'string');

console.log('\n⑦ 쪽지함 받기에 잇기');
{
  const B0 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 ('), B1 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 끝', B0);
  const BLOCK = SRC.slice(B0, B1);
  const place = new Function(BLOCK.slice(BLOCK.indexOf('const _PRAY_TODO_MAX'), BLOCK.indexOf('let _prayTodoUnsub')) + '; return _prayTodoPlace;')();
  // 앱의 _siriPlace 와 같은 일 — SECS · ST 대신 시험 값
  const parse = (n) => (n && n.from === 'siri' && typeof n.say === 'string') ? F._siriParse(n.say, n.at, DEF, VIS, 0) : null;
  const ids = DEF.map(s => s.id);
  // 서버(b7siri-core.item)가 넣는 모양 그대로
  const siri = { id: 'siri-1', from: 'siri', say: '모레 저녁 심방', at: SAT, date: '2026-10-25', sec: '', text: '모레 저녁 심방' };
  const pray = { id: 'p1', date: '2026-10-26', sec: 'pm', text: '가족 심방', at: 1 };
  sc.eq('⭐ 시리 쪽지는 풀어서 · 기도노트 쪽지는 그대로', place([siri, pray], ids, parse),
    [{ date: '2026-10-27', sec: 'eve', text: '심방', from: 'siri' }, { date: '2026-10-26', sec: 'pm', text: '가족 심방' }]);
  sc.eq('⭐ 갱신 전 앱(풀기 없음) — 그날 첫 구간에 들은 말 그대로 (잃지 않음)', place([siri], ids),
    [{ date: '2026-10-25', sec: 'dawn', text: '모레 저녁 심방', from: 'siri' }]);
  sc.eq('풀기가 터져도 쪽지의 date · text 로', place([siri], ids, () => { throw new Error('x'); }),
    [{ date: '2026-10-25', sec: 'dawn', text: '모레 저녁 심방', from: 'siri' }]);
  sc.eq('사라진 구간 이름 — 풀기는 있는 구간만 고른다', place([Object.assign({}, siri, { say: '내일 없는구간 무엇' })], ids, parse)[0].sec, 'am');
  sc.eq('한 번에 50개까지 (시리 쪽지도)', place(Array.from({ length: 70 }, (_, i) => Object.assign({}, siri, { id: 's' + i })), ids, parse).length, 50);
  sc.eq('꺼내는 길이 _siriPlace 를 넘긴다', /_prayTodoPlace\(items,SECS\.map\(s=>s\.id\),_siriPlace\)/.test(BLOCK), true);
  const SP = slice('// ── 시리: 앱에 잇는 자리 ──', '// 설정 → 계정');
  sc.eq('_siriPlace 는 시리 쪽지만 · SECS · ST.vis · 하루 시작 시각으로', [/n\.from!=='siri'/.test(SP), /_siriParse\(n\.say,n\.at,SECS,ST\.vis,\(ST\.settings\|\|\{\}\)\.dayStartHour\)/.test(SP)], [true, true]);
}

console.log('\n⑧ 토스트');
{
  const nm = (id) => ({ am: '오전', eve: '저녁' })[id] || '';
  const T = (put) => F._todoInboxToast(put, '2026-10-25', nm);
  sc.eq('시리 하나 — 날 · 구간 / 내용을 줄로', T([{ date: '2026-10-26', sec: 'am', text: '우유 사기', from: 'siri' }]), '시리로 할일이 왔어요\n내일 · 오전\n우유 사기');
  sc.eq('먼 날은 날짜와 요일', T([{ date: '2026-10-30', sec: 'eve', text: '심방', from: 'siri' }]), '시리로 할일이 왔어요\n10월 30일 (금) · 저녁\n심방');
  sc.eq('시리 여럿', T([{ from: 'siri' }, { from: 'siri' }]), '시리로 할일 2개가 왔어요');
  sc.eq('기도노트 — 예전 글 그대로', [T([{ text: '가족 심방' }]), T([{}, {}])], ['기도노트에서 할일이 왔어요 — 가족 심방', '기도노트에서 할일 2개가 왔어요']);
  sc.eq('섞이면', T([{ from: 'siri' }, {}]), '할일 2개가 왔어요\n시리 · 기도노트');
  sc.eq('오늘 · 모레 · 해 넘김', [F._siriDayLabel('2026-10-25', '2026-10-25'), F._siriDayLabel('2026-10-27', '2026-10-25'), F._siriDayLabel('2027-01-01', '2026-12-31')], ['오늘', '모레', '내일']);
}

console.log('\n⑨ 설정 칸');
{
  const ACC = SRC.slice(SRC.indexOf('<div class="settings-tab-content" id="stab-account">'), SRC.indexOf('<!-- 개발자에게 쪽지 -->', SRC.indexOf('id="stab-account"')) + 1);
  sc.eq('차례: 데이터 복구 → 구글 캘린더 → 시리 (v26-1025-8)', ACC.indexOf('id="dataRecoverySection"') < ACC.indexOf('id="gcalSection"') && ACC.indexOf('id="gcalSection"') < ACC.indexOf('id="siriSection"'), true);
  sc.eq('계정 탭 안에 묶음', /<div class="sg" id="siriSection">/.test(ACC), true);
  const UI = slice("// 설정 → 계정 '시리로 할일 넣기'", '// ═══════ 시리 → 할일 끝');
  sc.eq('Sweeter 에서 감춘다 · 개발본에서 못 쓴다', [/APP_PRODUCT!=='block7'\)\{box\.style\.display='none'/.test(UI), /DEV_MODE\?'개발본에서는 쓸 수 없어요/.test(UI)], [true, true]);
  sc.eq('이 기기 키는 _lsk · 계정마다(uid 를 함께 적고 견준다)', [/localStorage\.(get|set)Item\(_lsk\('siri'\)/.test(UI), /v\.uid===u/.test(UI), /localStorage\.\w+\('[^']*siri/.test(UI)], [true, true, false]);
  const cp = UI.slice(UI.indexOf('function siriCopyUrl'));
  sc.eq('⭐ 복사는 누른 순간 동기적으로 (await 없음)', [/navigator\.clipboard\.writeText\(sv\.url\)/.test(cp), /await/.test(cp.slice(0, cp.indexOf('\n}')))], [true, false]);
  sc.eq('새로 만들 때는 앱 확인창 (옛 주소가 멈춘다고 알림)', /appConfirm\('새 주소를 만들면/.test(UI), true);
  sc.eq('renderSettingsPanel 이 그린다', /try\{_siriRenderSettings\(\);\}catch\(e\)\{\}/.test(SRC), true);
  sc.eq('주소는 b7siri 서버', /const B7SIRI_FN='https:\/\/asia-northeast3-block7-8f24e\.cloudfunctions\.net\/b7siri'/.test(UI), true);
  ['index-dev.html', 'sweeter-dev.html'].forEach(f => {
    const t = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    sc.eq(f + ' 에도 같은 덩어리', t.indexOf(PURE) >= 0, true);
  });
}
sc.done();
