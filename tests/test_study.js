// 공부 친구들(study/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="study-core">)를 떼어 시험한다.
//
// 지키는 것:
//  ① 쪽 · 장 — 저장은 언제나 쪽, '장' 은 보여 주는 단위 (1장 = ppj 쪽)
//  ② 계획 → 날짜별 분량: 오늘 안 한 몫은 오늘에 남고, 다음 요일부터 이어진다 · 끝나는 날
//  ③ 끝! → 기록: 진도는 실제로 한 쪽까지, 앞으로만 간다 · 코인은 하루 한 퀘스트에 한 번 · 지우면 되돌린다
//  ④ 타이머: 잠시 멈춤 시간은 공부 시간에 들어가지 않는다
//  ⑤ 알림: 정한 시각부터 90분까지만 · 미루기 · '오늘은 못 해요' · 공부 중이면 안 울린다 · 서버 예약 목록
//  ⑥ 별은 부모님 확인 때만 · 같은 확인은 한 번만 반영 · 레벨
//  ⑦ 망가진 저장을 읽어도 죽지 않는다
//  ⑮ 오늘의 숙제: 그날 바로 · 제출 전날 · 끝낸 것은 다음 날 안 보임 · 못 끝낸 것은 남음 · 내가 만든 과목이 저장을 지나도 남음
//  ⑯ 숙제를 끝내면 기록이 생겨 부모님 확인 · 별로 이어진다 · 지우면 되돌린다 · '다시 해 볼까?' 면 다시 할 것으로 · 고르는 칸은 처음 한 번
//  ⑬ 백업 파일 이름 St-{아이디3}-{기기}-{YY}-{MMDD}-{번호} · 연속 · 날짜 바뀜 · 오프라인 · 번호표가 저장 · 클라우드를 지나도 남는다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'study', 'index.html'), 'utf8');
const m = HTML.match(/<script id="study-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('study-core 덩어리를 못 찾았습니다'); process.exit(2); }
process.env.TZ = 'Asia/Seoul';
const ctx = { console, Date, Math, JSON };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { STUDY_KEY, SUBJ, blankState, normState, normBook, amountText, rangeText, perDayText, chapterOf, projectBook, finishDate, questsFor, questOf,
  runStart, runPause, runResume, runStudyMs, runRestMs, finishRun, removeSession, dueAlarm, snooze, cleanOld, upcomingAlarms,
  starsOf, levelOf, coinsLeft, applyReview, promiseProgress, weekStats, mondayOf, addDays, dowOf, atOf, COIN_DONE, bakDevice, bakName, addSubject, pickSubj, subjOf, hwDoDate, hwFor, hwLeftover, hwClean, hwQuest, keyOfHw, sundayOf };`, ctx);
const A = ctx.A;
const MON = '2026-10-12';   // 월요일
const at = (d, hm) => A.atOf(d, hm);

function mk(o) {
  const st = A.blankState();
  st.books.push(A.normBook(Object.assign({id: 'b1', subj: 'math', name: '디딤돌', unit: 'p', first: 8, last: 60, cur: 34, perDay: 4, days: [1, 3, 5], time: '16:00', dur: 30,
    chapters: [{t: '분수의 곱셈', from: 34, to: 59}]}, o || {})));
  return st;
}

// ── ① 쪽 · 장 ──
{
  const st = mk({unit: 'j', ppj: 2});
  const b = st.books[0];
  sc.eq('① 장 단위: 4쪽 = 2장, 범위는 쪽으로 함께', A.rangeText(b, 34, 37), '2장 (34~37쪽)');
  sc.eq('① 쪽 단위 그대로', A.rangeText(mk().books[0], 34, 37), '34~37쪽');
  sc.eq('① 하루 분량 표시', [A.perDayText(b), A.perDayText(mk().books[0])], ['2장', '4쪽']);
  sc.eq('① 1장 = 3쪽인 문제집도', A.amountText(A.normBook(Object.assign({}, b, {ppj: 3})), 1, 6), '2장');
  sc.eq('① 단원 찾기', A.chapterOf(b, 40).t, '분수의 곱셈');
}

// ── ② 계획 → 날짜별 ──
{
  const st = mk();
  const pr = A.projectBook(st, st.books[0], MON, 14);
  sc.eq('② 월·수·금만, 4쪽씩 이어진다', Object.keys(pr).slice(0, 4), ['2026-10-12', '2026-10-14', '2026-10-16', '2026-10-19']);
  sc.eq('② 오늘 34~37 → 수요일 38~41', [pr['2026-10-12'].from, pr['2026-10-12'].to, pr['2026-10-14'].from, pr['2026-10-14'].to], [34, 37, 38, 41]);
  sc.eq('② 마지막 쪽에서 멈춘다 (60쪽)', Object.values(A.projectBook(st, st.books[0], MON, 60)).pop().to, 60);
  // 오늘 안 하고 하루 지나면 그 몫이 다음 요일로 밀린다
  const tue = A.projectBook(st, st.books[0], '2026-10-13', 7);
  sc.eq('② 월요일을 건너뛰면 수요일이 34쪽부터', tue['2026-10-14'].from, 34);
  // 34~60 = 27쪽 → 7번 (4쪽씩) → 월수금 7번째 = 10/26(월)
  sc.eq('② 끝나는 날', A.finishDate(st, st.books[0], MON), '2026-10-26');
  const q = A.questsFor(st, MON, MON);
  sc.eq('② 오늘 퀘스트 — 단원 이름 + 범위', [q.length, q[0].sub, q[0].time], [1, '분수의 곱셈 · 34~37쪽', '16:00']);
  sc.eq('② 화요일은 쉬는 날', A.questsFor(st, '2026-10-13', MON).length, 0);
  st.tasks.push({id: 't1', title: '받아쓰기', date: '2026-10-13', time: '', dur: 20, subj: 'kor'});
  sc.eq('② 한 번짜리 숙제는 그날에만', [A.questsFor(st, '2026-10-13', MON).length, A.questsFor(st, '2026-10-14', MON).filter(x => x.kind === 'task').length], [1, 0]);
  const off = mk({active: false});
  sc.eq('② 쉬는 문제집은 계획에 없다', A.questsFor(off, MON, MON).length, 0);
}

// ── ③ ④ 타이머 → 기록 ──
{
  const st = mk();
  const q = A.questsFor(st, MON, MON)[0], t0 = at(MON, '16:05');
  A.runStart(st, q, t0, 1);
  A.runPause(st, t0 + 10 * 60000);
  A.runResume(st, t0 + 13 * 60000);
  const end = t0 + 34 * 60000;
  sc.eq('④ 멈춘 3분은 공부 시간에서 빠진다', [A.runStudyMs(st.run, end) / 60000, A.runRestMs(st.run, end) / 60000], [31, 3]);
  const s = A.finishRun(st, end, {result: 'all', from: 34, to: 37, wrong: 2, mood: 'ok'});
  sc.eq('③ 기록: 31분 · 멈춤 1번 · 미룸 1번', [s.sec, s.pauses, s.rest, s.snoozes, s.wrong], [1860, 1, 180, 1, 2]);
  sc.eq('③ 진도가 38쪽으로', st.books[0].cur, 38);
  sc.eq('③ 코인 +10', [st.coins, s.coins], [A.COIN_DONE, A.COIN_DONE]);
  sc.eq('③ 오늘 퀘스트는 끝남으로', A.questsFor(st, MON, MON)[0].done, true);
  sc.eq('③ 수요일 계획은 38쪽부터', A.projectBook(st, st.books[0], MON, 3)['2026-10-14'].from, 38);
  // 같은 날 한 번 더(다시 하기) → 코인은 또 안 준다
  A.runStart(st, A.questsFor(st, MON, MON)[0], end + 60000);
  const s2 = A.finishRun(st, end + 20 * 60000, {result: 'all'});
  sc.eq('③ 같은 퀘스트 두 번째는 코인 없음', [s2.coins, st.coins], [0, A.COIN_DONE]);
  // 지우기 → 코인·진도 되돌림
  A.removeSession(st, s2.id); A.removeSession(st, s.id);
  sc.eq('③ 기록을 지우면 코인과 진도가 돌아온다', [st.coins, st.books[0].cur], [0, 34]);
  // 조금만 했으면 그만큼만
  A.runStart(st, A.questsFor(st, MON, MON)[0], t0);
  A.finishRun(st, t0 + 600000, {result: 'part', from: 34, to: 35});
  sc.eq('③ 조금 남았어요 → 36쪽부터', st.books[0].cur, 36);
  // 진도는 뒤로 가지 않는다
  st.books[0].cur = 50; A.runStart(st, {key: 'b:b1', date: MON, from: 34, to: 37}, t0); A.finishRun(st, t0 + 1000, {result: 'all', from: 34, to: 37});
  sc.eq('③ 이미 더 나간 진도는 그대로', st.books[0].cur, 50);
}

// ── ⑤ 알림 ──
{
  const st = mk();
  sc.eq('⑤ 정한 시각 전에는 없다', A.dueAlarm(st, at(MON, '15:59'), MON), null);
  sc.eq('⑤ 16:00 에 울린다', A.dueAlarm(st, at(MON, '16:00'), MON).key, 'b:b1');
  sc.eq('⑤ 90분 지나면 더 안 띄운다', A.dueAlarm(st, at(MON, '17:31'), MON), null);
  const q = A.dueAlarm(st, at(MON, '16:00'), MON);
  const until = A.snooze(st, q, 5, at(MON, '16:00'));
  sc.eq('⑤ 5분 미루면 16:05 까지 조용', [A.dueAlarm(st, at(MON, '16:03'), MON), until === at(MON, '16:05')], [null, true]);
  sc.eq('⑤ 16:05 에 다시', A.dueAlarm(st, at(MON, '16:05'), MON).key, 'b:b1');
  sc.eq('⑤ 서버 예약도 미룬 시각으로', A.upcomingAlarms(st, at(MON, '16:01'), MON, 1).map(x => x.at), [at(MON, '16:05')]);
  A.runStart(st, q, at(MON, '16:06'));
  sc.eq('⑤ 공부 중이면 안 울린다', [A.dueAlarm(st, at(MON, '16:07'), MON), A.upcomingAlarms(st, at(MON, '16:01'), MON, 1).length], [null, 0]);
  st.run = null; st.dismiss['b:b1|' + MON] = 1;
  sc.eq('⑤ 오늘은 못 해요 → 안 울린다', A.dueAlarm(st, at(MON, '16:10'), MON), null);
  const st2 = mk();
  const up = A.upcomingAlarms(st2, at(MON, '09:00'), MON, 7);
  sc.eq('⑤ 일주일 예약: 월·수·금 16:00', up.map(x => x.k.split('|')[1]), ['2026-10-12', '2026-10-14', '2026-10-16']);
  sc.eq('⑤ 예약 글: 시각 · 과목 · 범위', [up[0].title, up[0].body], ['16:00 수학 공부 시간이에요!', '디딤돌 · 분수의 곱셈 · 34~37쪽 · 30분']);
  sc.eq('⑤ 시각이 없는 숙제는 예약하지 않는다', (() => { st2.tasks.push({id: 't', title: 'x', date: MON, time: '', dur: 0, subj: 'etc'}); return A.upcomingAlarms(st2, at(MON, '09:00'), MON, 1).length; })(), 1);
  st2.snooze['b:b1|2026-09-01'] = {until: 1, n: 1}; A.cleanOld(st2, MON);
  sc.eq('⑤ 오래된 미루기 기록은 치운다', Object.keys(st2.snooze).length, 0);
}

// ── ⑥ 별 · 레벨 · 부모님 확인 ──
{
  const st = mk();
  A.runStart(st, A.questsFor(st, MON, MON)[0], at(MON, '16:00'));
  const s = A.finishRun(st, at(MON, '16:30'), {result: 'all'});
  sc.eq('⑥ 끝냈다고 별이 생기지는 않는다', A.starsOf(st), 0);
  const r = {id: 'r1', sid: s.id, status: 'ok', stars: 2, coins: 20, stamp: '참 잘했어요', text: '끝까지 했구나', by: '아빠'};
  sc.eq('⑥ 부모님 확인 → 별 2 · 코인 +20 · 도장', [A.applyReview(st, r), A.starsOf(st), st.coins, s.stamp, s.status], [true, 2, A.COIN_DONE + 20, '참 잘했어요', 'ok']);
  sc.eq('⑥ 같은 확인은 두 번 반영하지 않는다', [A.applyReview(st, r), A.starsOf(st), st.coins], [false, 2, A.COIN_DONE + 20]);
  sc.eq('⑥ 없는 기록에 온 확인은 무시', A.applyReview(st, {id: 'r2', sid: 'nope', status: 'ok'}), false);
  sc.eq('⑥ 레벨: 별 5개면 Lv.2, 12개면 Lv.3', [A.levelOf(4).lv, A.levelOf(5).lv, A.levelOf(11).lv, A.levelOf(12).lv], [1, 2, 2, 3]);
  sc.eq('⑥ 약속 모으기 — 확인 받은 것만 센다', A.promiseProgress(st, {need: 3, since: 0}), {n: 1, need: 3, done: false});
  sc.eq('⑥ 약속을 만든 뒤의 것만', A.promiseProgress(st, {need: 3, since: at(MON, '17:00')}).n, 0);
  const w = A.weekStats(st, A.mondayOf('2026-10-15'));
  sc.eq('⑥ 주간 통계: 수학 1번 · 4쪽', [w.rows[0].subj, w.rows[0].n, w.rows[0].pages, w.rows[0].ok], ['math', 1, 4, 1]);
}

// ── ⑦ 망가진 저장 ──
{
  const bad = A.normState({books: [null, {id: 'x'}, {id: 'b', name: '책', first: 'a', last: -3, days: [9, 1, 1, 'z'], time: '25:99'}], tasks: [{id: 1}], sessions: 'nope', coins: -5});
  sc.eq('⑦ 이상한 값은 버리거나 고친다', [bad.books.length, bad.books[0].days, bad.books[0].time, bad.tasks.length, bad.sessions.length, bad.coins], [1, [1], '', 0, 0, 0]);
  sc.eq('⑦ 빈 저장 → 처음 상태', A.normState(null).books.length, 0);
}

// ── ⑧ 가족 · 서버 — 정해 둔 모양이 바뀌지 않았는지 ──
{
  const ver = [...HTML.matchAll(/v\. \d{2}-\d{4}-\d+/g)].map(x => x[0]);
  sc.eq('⑧ 버전 두 곳이 같다 (2번째 줄 · APP_VERSION)', ver[0] === HTML.match(/const APP_VERSION = '([^']+)'/)[1], true);
  sc.eq('⑧ 파이어베이스 앱 이름은 study (BLOCK7 · 용돈 친구들 로그인과 안 섞이게)', /initializeApp\(FB_CFG, 'study'\)/.test(HTML), true);
  sc.eq('⑧ 아이 계정 주소는 kid.block7.my', /KID_DOMAIN = 'kid\.block7\.my'/.test(HTML), true);
  const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'study', 'firebase-setup.md'), 'utf8');
  sc.eq('⑧ 규칙 덩어리에 공부 칸 다섯(study · sphotos · sreviews · spromises · sremind)',
    ['match /study/{kid}', 'match /sphotos/{sid}', 'match /sreviews/{rid}', 'match /spromises/{pid}', 'match /sremind/{rid}'].map(k => md.includes(k)), [true, true, true, true, true]);
  sc.eq('⑧ 아이·부모 알림 토큰(stokens)을 스스로 고칠 수 있다', md.includes("hasOnly(['pname', 'notify', 'tokens', 'stokens', 'bak'])"), true);
  const W = fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'index.js'), 'utf8');
  sc.eq('⑧ 알림 서버가 공부 친구들 몫을 함께 내보낸다', W.includes('require("./study")'), true);
  const WL = fs.readFileSync(path.join(__dirname, '..', 'wallet', 'index.html'), 'utf8');
  sc.eq('⑧ 용돈 친구들이 허락권(grant)을 받는다 — 용돈 +N원은 받을 예정 돈으로', /m\.type==='grant' && m\.kind==='money'/.test(WL), true);
}

// ── ⑨ 간단 등록: 하루 분량만 (전체 쪽 · 현재 쪽 없음) ──
{
  const st = A.blankState();
  st.books.push(A.normBook({id: 'o1', open: true, subj: 'math', name: '쎈', unit: 'j', ppj: 2, first: 5, last: 9, cur: 1, perDay: 2, days: [1, 3, 5], time: '16:00', dur: 30, chapters: [{t: 'x', from: 1, to: 2}]}));
  const b = st.books[0];
  sc.eq('⑨ 간단 문제집은 범위·단원을 지운다', [b.open, b.first, b.cur, b.chapters.length], [true, 1, 1, 0]);
  const q = A.questsFor(st, MON, MON)[0];
  sc.eq('⑨ 퀘스트에는 범위 없이 분량만 (하루 2쪽 = 1장)', q.sub, '1장');
  sc.eq('⑨ 끝나는 날은 계산하지 않는다', A.finishDate(st, b, MON), null);
  A.runStart(st, q, at(MON, '16:00')); A.finishRun(st, at(MON, '16:20'), {result: 'all'});
  sc.eq('⑨ 한 만큼 다음 분량이 이어진다 (수요일 3쪽부터)', A.projectBook(st, b, MON, 3)['2026-10-14'].from, 3);
  sc.eq('⑨ 예전처럼 범위를 적은 문제집은 그대로', A.normBook({id: 'o2', name: 'a', first: 8, last: 60, cur: 34}).open, false);
}

// ⑫ S-8 단순 '넣기' 문제집 — 이름이 곧 할 것 · 분량을 따로 안 보임 · 저장해도 남음 · 예전 문제집은 그대로
{
  const st = A.blankState();
  st.books.push(A.normBook({id: 's1', open: true, simple: true, subj: 'math', name: '디딤돌 2쪽', perDay: 1, days: [0, 1, 2, 3, 4, 5, 6], time: '', dur: 30}));
  st.books.push(A.normBook({id: 's2', open: true, subj: 'eng', name: '단어', perDay: 2, days: [0, 1, 2, 3, 4, 5, 6], dur: 20}));
  const qs = A.questsFor(st, '2026-10-21', '2026-10-21');
  sc.eq('⭐⑫ simple 문제집은 분량 글이 비어 있다 · 아닌 것은 예전처럼', qs.map(q => [q.title, q.sub]).sort(), [['단어', '2쪽'], ['디딤돌 2쪽', '']]);
  sc.eq('⑫ 저장 · 불러오기에도 simple 이 남는다', A.normState(JSON.parse(JSON.stringify(st))).books.map(b => b.simple), [true, false]);
  sc.eq('⑫ 범위가 있는 문제집에는 simple 이 붙지 않는다', A.normBook({id: 'x', name: 'a', simple: true, first: 1, last: 9}).simple, false);
}
// ── ⑬ 백업 파일 이름 (D-4, HB 2026-10-21) ──
{
  const at2 = (d, h, m) => new Date(2026, 9, d, h, m);
  const on = now => ({ email: 'jimin@kid.block7.my', online: true, dev: 'phn', now });
  const st = A.blankState();
  sc.eq('⑬ 첫 저장', A.bakName(st, on(at2(21, 15, 34))), 'St-jim-phn-26-1021-1.json');
  sc.eq('⑬ 같은 날 연속은 2', A.bakName(st, on(at2(21, 15, 35))), 'St-jim-phn-26-1021-2.json');
  // 다른 기기(같은 아이 계정)는 클라우드 사본 → normState 로 받는다 — 번호표가 살아 있어야 이어진다
  const other = A.normState(JSON.parse(JSON.stringify(st)));
  sc.eq('⑬ 번호표가 저장 · 클라우드를 지나도 남는다 → 다른 기기는 3', A.bakName(other, Object.assign(on(at2(21, 16, 0)), { dev: 'pad' })), 'St-jim-pad-26-1021-3.json');
  sc.eq('⑬ 날짜가 바뀌면 1부터', A.bakName(other, on(at2(22, 7, 0))), 'St-jim-phn-26-1022-1.json');
  const before = JSON.stringify(other.bak);
  sc.eq('⑬ 오프라인은 off+HHMM', A.bakName(other, { email: 'jimin@kid.block7.my', online: false, dev: 'phn', now: at2(22, 9, 5) }), 'St-jim-phn-26-1022-off0905.json');
  sc.eq('⑬ 오프라인은 번호표를 안 건드린다', JSON.stringify(other.bak), before);
  sc.eq('⑬ 가족 연결 안 됨 = usr · off', A.bakName(A.blankState(), { email: '', online: false, dev: 'pc', now: at2(21, 23, 59) }), 'St-usr-pc-26-1021-off2359.json');
  sc.eq('⑬ 망가진 번호표는 버린다', A.normState({ bak: { d: 'x', n: 'y' } }).bak, undefined);
  sc.eq('⑬ 기기 판정 (아이폰 · 아이패드 · 안드 폰 · 맥)', [
    A.bakDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 5, 390, 844),
    A.bakDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5, 820, 1180),
    A.bakDevice('Mozilla/5.0 (Linux; Android 14; SM-S918N) Mobile', 5, 412, 915),
    A.bakDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0, 1512, 982)], ['phn', 'pad', 'phn', 'pc']);
}
// ── ⑭ 화면: 파일로 저장 · 불러오기 · 오늘 탭 설정 입구 (D-4) ──
{
  sc.eq('⑭ 설정에 파일로 저장 · 파일 불러오기', ['id="stFile"', 'id="stOpen"'].every(x => HTML.includes(x)), true);
  sc.eq('⑭ 파일 저장은 새 이름 · 공유는 기다리지 않고 바로', /function saveBackupFile\(\) \{[^]*?bakName\(S,[^]*?navigator\.share\(/.test(HTML) && !/await[^;]{0,60}navigator\.share/.test(HTML), true);
  sc.eq('⑭ 오늘 머리줄에도 설정 톱니', /else top\.innerHTML = `[^`]*data-top="gear"/.test(HTML), true);
  sc.eq('⑭ 연결 안 된 동안 오늘 화면에 \'가족과 연결하기\'', HTML.includes('data-a="famGo"'), true);
}
// ── ⑮ 오늘의 숙제 · 내가 만든 과목 ──
{
  const TUE = A.addDays(MON, 1), FRI = A.addDays(MON, 4);
  sc.eq('⑮ 그날 바로 → 오늘', A.hwDoDate('day', MON, FRI), MON);
  sc.eq('⑮ 제출 전날 → 제출 하루 전', A.hwDoDate('eve', MON, FRI), A.addDays(FRI, -1));
  sc.eq('⑮ 내일 제출이면 오늘 · 오늘 제출이어도 오늘', [A.hwDoDate('eve', MON, TUE), A.hwDoDate('eve', MON, MON)], [MON, MON]);
  const st = A.blankState();
  st.hw.push({id: 'h1', title: '일기', subj: 'kor', due: '', doDate: MON, done: ''}, {id: 'h2', title: '익힘책', subj: 'math', due: FRI, doDate: A.addDays(FRI, -1), done: ''});
  sc.eq('⑮ 할 날 전에는 안 보인다', A.hwFor(st, MON).map(h => h.id), ['h1']);
  st.hw[0].done = MON;
  sc.eq('⑮ 끝낸 날에는 보인다', A.hwFor(st, MON).map(h => h.id), ['h1']);
  sc.eq('⑮ 끝낸 다음 날은 안 보인다', A.hwFor(st, TUE).map(h => h.id), []);
  st.hw[0].done = '';
  sc.eq('⑮ 못 끝낸 것은 다음 날 남고 알림 대상', [A.hwFor(st, TUE).map(h => h.id), A.hwLeftover(st, TUE).map(h => h.id)], [['h1'], ['h1']]);
  st.hw[0].done = MON; A.hwClean(st, A.addDays(MON, 40));
  sc.eq('⑮ 끝낸 지 30일 지나면 지운다', st.hw.map(h => h.id), ['h2']);
  const k = A.addSubject(st, '한자');
  sc.eq('⑮ 같은 이름은 새로 안 만든다', [A.addSubject(st, '한자'), A.addSubject(st, '수학')], [k, 'math']);
  st.books.push(A.normBook({id: 'bx', subj: k, name: '한자 쓰기', open: true, days: [1]}));
  st.hw[0].subj = k;
  const back = A.normState(JSON.parse(JSON.stringify(st)));
  sc.eq('⑮ 내가 만든 과목이 저장을 지나도 남는다', [back.books[0].subj, back.hw[0].subj, A.subjOf(k).n], [k, k, '한자']);
  sc.eq('⑮ 고르는 줄에 기타는 없다', A.pickSubj().some(x => x.k === 'etc'), false);
  sc.eq('⑮ 옛 기록의 기타는 그대로 읽힌다', A.subjOf('etc').n, '기타');
  sc.eq('⑮ 숙제 방식은 처음엔 안 고른 상태 · 옛 now 는 다시 묻는다', [A.blankState().hwMode, A.normState({hwMode: 'eve'}).hwMode, A.normState({hwMode: 'now'}).hwMode], ['', 'eve', '']);
  sc.eq('⑮ 고른 day 는 남는다', A.normState({hwMode: 'day'}).hwMode, 'day');
  sc.eq('⑮ 할 것 넣기 버튼은 할 것이 없을 때만', HTML.includes("${!S.books.length && !S.tasks.length ? `<button class=\"addone\" data-a=\"add\">"), true);
}
// ── ⑯ 숙제 → 기록 → 부모님 확인 · 별 ──
{
  const TUE = A.addDays(MON, 1);
  const st = A.blankState();
  st.hw.push({id: 'h1', title: '일기', subj: 'kor', due: '', doDate: MON, done: ''});
  const q = A.hwQuest(st, st.hw[0], MON);
  sc.eq('⑯ 숙제도 퀘스트 모양', [q.key, q.kind, q.done], ['h:h1', 'hw', false]);
  sc.eq('⑯ 열쇠로 찾아진다', A.questOf(st, 'h:h1', MON, MON).title, '일기');
  A.runStart(st, q, at(MON, '17:00'));
  const s1 = A.finishRun(st, at(MON, '17:00'), {});
  sc.eq('⑯ 끝내면 기록 · 숙제는 끝낸 날 · 코인', [st.sessions.length, st.hw[0].done, s1.ht, s1.hs, st.coins], [1, MON, '일기', 'kor', A.COIN_DONE]);
  sc.eq('⑯ 끝낸 다음 날은 안 보인다', A.hwFor(st, TUE).length, 0);
  sc.eq('⑯ 부모님 확인 → 별', [A.applyReview(st, {id: 'r1', sid: s1.id, status: 'ok', stars: 2}), A.starsOf(st)], [true, 2]);
  const st2 = A.blankState();
  st2.hw.push({id: 'h2', title: '익힘책', subj: 'math', due: '', doDate: MON, done: ''});
  A.runStart(st2, A.hwQuest(st2, st2.hw[0], MON), at(MON, '17:00')); const s2 = A.finishRun(st2, at(MON, '17:00'), {});
  A.applyReview(st2, {id: 'r2', sid: s2.id, status: 'redo'});
  sc.eq("⑯ '다시 해 볼까?' 면 다시 할 것 · 다음 날도 남는다", [st2.hw[0].done, A.hwFor(st2, TUE).length, A.hwLeftover(st2, TUE).length], ['', 1, 1]);
  A.runStart(st2, A.hwQuest(st2, st2.hw[0], TUE), at(TUE, '17:00')); const s3 = A.finishRun(st2, at(TUE, '17:00'), {});
  sc.eq('⑯ 다시 끝내면 다시 끝', st2.hw[0].done, TUE);
  A.removeSession(st2, s3.id);
  sc.eq('⑯ 기록을 지우면 숙제는 다시 할 것 (다시 해 볼까 기록은 끝낸 걸로 안 셈)', st2.hw[0].done, '');
  sc.eq('⑯ 주간 통계에 숙제 과목', A.weekStats(st, MON).rows.map(r => r.subj), ['kor']);
  st.hw = []; sc.eq('⑯ 숙제를 지워도 통계 과목은 기록에서', A.weekStats(st, MON).rows.map(r => r.subj), ['kor']);
  sc.eq('⑯ 한 주는 일요일부터', [A.sundayOf(MON), A.sundayOf(A.addDays(MON, -1))], [A.addDays(MON, -1), A.addDays(MON, -1)]);
}
sc.done();
