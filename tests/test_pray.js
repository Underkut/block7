// 기도노트(pray/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="pray-core">)를 떼어 시험한다.
//
// ⚠️ 이 시험의 이름은 **전부 지어낸 것**이다. 기도 자료(실제 교인 이름)는 공개 저장소에
//    넣지 않는다 (CLAUDE.md '기도노트도 따로 돈다').
//
// 지키는 것:
//  ① 처음 열면 샘플(구분 · 상위 분류 · 모임 · 예배 · 부서)만 있고 사람 이름은 없다
//  ② 오늘 목록 네 칸 — 1순위(빨강) · 매일(긴급도 0·1) · 오늘 요일 · 차례 — 겹치지 않는다
//  ③ '기도함' 은 누른 칸에 그대로 남고, 되돌리면 last 도 되돌아간다
//  ④ 한 번도 기도하지 않은 것은 주기 안에서 제 날에 한 번씩만 나온다 (첫날 몰림 방지)
//  ⑤ 우선순위 표(Sheet2 모양) 가져오기 — 다시 가져와도 겹치지도 지우지도 않는다
//  ⑥ 기도 지도(날짜 탭 모양) 가져오기 — **빈 줄이 묶음의 경계**다 (2026-10-10 실제로 깨졌던 곳)
//  ⑦ 지우기 · 내 순서 · 판 비교 · 백업 · 테마가 BLOCK7 과 같은지
//  ⑩ 표시 색 잇기 — 소속에 이은 색은 칠하지 않아도 보이고, 직접 칠한 색이 먼저
//  ⑨ 지도 맨 아래 칸 — 구분 칩: 앱이 먼저 고르는 구분 · 사람 구분이면 사람, 아니면 기도 항목 하나
//  ⑧ 연동 복제 — 작은 묶음은 한 묶음이 두 자리에 · 줄은 link 표로 이어 한쪽을 고치면 같이 (2026-10-11)
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const FILE = path.join(__dirname, '..', 'pray', 'index.html');
const HTML = fs.readFileSync(FILE, 'utf8');
const m = HTML.match(/<script id="pray-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('pray-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { PRAY_KEY, MARKS, MARK_FIXED, IV_DEFAULT, GRAY_IV, GROUP_IV_DEFAULT, SEED_ITEMS, THEME_PRESETS,
  emptyDB, seedDB, normDB, newTarget, newGroup, newTopic, daysFromName, nameKey, ymd, addDays, daysBetween,
  findT, findG, groupPids, groupsOf, childrenOf, topGroups, kidsOf, groupHeadcount, linkSub, moveSub, unplaceSub, copyLineLinked, linkedLines, syncLine, removeFromGroup, looksLikeNames, suggestCat, makeEntry, effMarkMap, markOf, markLinkCandidates, markLinkName, fillLineCats, parseEntryText, dropOrphans, parseLineText, lineToText,
  removeTarget, removeGroup, buildToday, todayCount, toggleDone, postpone, slotDue, intervalOf,
  sortTargets, applyRanks, moveInArray, parseCSV, detectFormat, importSheet2, parseMapGrid,
  buildGroupsFromBlocks, sheetDate, makeSnap, snapNames, currentNames, diffNames, answeredList,
  exportBackup, readBackup, _themeTokens, themeById };`, ctx);
const A = ctx.A;
const D = '2026-10-10';   // 토요일

// ── ① 처음 상태 ──
{
  const db = A.seedDB();
  sc.eq('① 구분 6 · 상위 분류 6', [db.cats.length, db.subs.length], [6, 6]);
  sc.eq('① 사람 이름이 하나도 없다 (공개 저장소)', db.T.filter(t => t.kind === 'person').length, 0);
  sc.eq('① 샘플에 사람 구분(성도·방문자) 줄이 없다', A.SEED_ITEMS.some(r => r[0] === '성도' || r[0] === '방문자'), false);
  sc.eq('① 이름의 요일을 읽는다', [A.daysFromName('토요 기도'), A.daysFromName('주일 1부 예배'), A.daysFromName('화요예배'), A.daysFromName('긴급기도')], [[6], [0], [2], []]);
  const dept = db.cats.find(c => c.name === '부서');
  sc.eq('① 부서는 상위 분류가 붙어 있다', db.T.filter(t => t.cat === dept.id && t.sub).length > 20, true);
  sc.eq('① 표시 색 8개 · 순서 고정', A.MARKS, ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray']);
  sc.eq('① 빨강 · 회색만 뜻이 정해져 있다', A.MARK_FIXED, { red: '1순위', gray: '쉬는 분' });
}

// ── ② 오늘 목록 네 칸 ──
function mini() {
  const db = A.emptyDB();
  const p = (name, o) => { const t = Object.assign(A.newTarget('person', name), o || {}); db.T.push(t); return t; };
  return { db, p };
}
{
  const { db, p } = mini();
  const red = p('가나다', { mark: 'red', u: 3 });
  const daily = p('라마바', { u: 1, i: 2 });
  const sat = p('사아자', { days: [6] });
  const turn = p('차카타', { u: 2, last: A.addDays(D, -2) });
  const notYet = p('파하가', { u: 2, last: A.addDays(D, -1) });
  const quiet = p('나다라', {});           // 따로 정한 것이 없는 사람 — 묶음 안에서만
  const both = p('마바사', { mark: 'red', u: 0, days: [6] });
  const r = A.buildToday(db, D);
  const ids = k => r.sec[k].map(e => e.t.name);
  sc.eq('② 1순위 = 빨강 (숫자와 상관없이)', ids('top').sort(), ['가나다', '마바사']);
  sc.eq('② 매일 = 긴급도 0·1', ids('daily'), ['라마바']);
  sc.eq('② 오늘 요일 = 토요일이 붙은 것', ids('day'), ['사아자']);
  sc.eq('② 차례 = 주기(2일)가 지난 것만', ids('turn'), ['차카타']);
  sc.eq('② 주기가 안 된 것 · 정한 것 없는 사람은 안 나온다', [r.listed.has(notYet.id), r.listed.has(quiet.id)], [false, false]);
  sc.eq('② 한 번 나온 것은 다음 칸에 또 안 나온다', A.todayCount(r).n, 5);
  // 내일로
  A.postpone(db, daily.id, D);
  sc.eq('② 내일로 넘기면 오늘 목록에서 빠진다', A.buildToday(db, D).sec.daily.length, 0);
  sc.eq('② 다음 날엔 다시 나온다', A.buildToday(db, A.addDays(D, 1)).sec.daily.map(e => e.t.name), ['라마바']);
  // 밀림
  turn.last = A.addDays(D, -5);
  sc.eq('② 주기보다 3일 늦으면 3일 밀림', A.buildToday(db, D).sec.turn.find(e => e.t.id === turn.id).late, 3);
}
{
  const { db, p } = mini();
  const g = p('쉬는이', { mark: 'gray', last: A.addDays(D, -29) });
  sc.eq('② 쉬는 분(회색)은 30일마다', [A.intervalOf(db, g), A.buildToday(db, D).listed.has(g.id), A.buildToday(db, A.addDays(D, 1)).listed.has(g.id)], [30, false, true]);
  const grp = A.newGroup('조명', '#000'); db.G.push(grp);
  sc.eq('② 긴급도를 안 정한 묶음은 일주일에 한 번', A.intervalOf(db, grp), 7);
  db.set.iv[3] = 5;
  const t = p('간격', { u: 3 });
  sc.eq('② 긴급도마다 주기는 설정에서 바꾼다', A.intervalOf(db, t), 5);
}

// ── ③ 기도함 ──
{
  const { db, p } = mini();
  const t = p('가나다', { u: 2, last: A.addDays(D, -3) });
  sc.eq('③ 처음엔 차례 칸에', A.buildToday(db, D).sec.turn.map(e => [e.t.name, e.done]), [['가나다', false]]);
  sc.eq('③ 누르면 기도함', A.toggleDone(db, t.id, D), true);
  sc.eq('③ last 가 오늘로', t.last, D);
  sc.eq('③ 누른 뒤에도 같은 칸에 기도함으로 남는다', A.buildToday(db, D).sec.turn.map(e => [e.t.name, e.done]), [['가나다', true]]);
  sc.eq('③ 다시 누르면 취소', A.toggleDone(db, t.id, D), false);
  sc.eq('③ last 가 그 전 날로 되돌아간다', t.last, A.addDays(D, -3));
  sc.eq('③ 오늘 기록에서도 빠진다', db.log[D].d, []);
}

// ── ④ 첫날 몰림 방지 ──
{
  const { db, p } = mini();
  const list = [];
  for (let k = 0; k < 70; k++) list.push(p('이름' + k, { u: 4 }));   // 7일마다, 한 번도 기도 안 함
  const per = [];
  const hits = {};
  for (let d = 0; d < 7; d++) {
    const day = A.addDays(D, d);
    const r = A.buildToday(db, day);
    per.push(r.sec.turn.length);
    r.sec.turn.forEach(e => { hits[e.t.id] = (hits[e.t.id] || 0) + 1; });
  }
  sc.eq('④ 첫날에 70개가 다 몰리지 않는다', per[0] < 30, true);
  sc.eq('④ 일주일 동안 저마다 꼭 한 번씩 나온다', list.every(t => hits[t.id] === 1), true);
  sc.eq('④ 날마다 고르게 (한 날에 25개 넘지 않음)', Math.max.apply(null, per) <= 25, true);
  sc.eq('④ 매일(주기 1)은 언제나 제 날', A.slotDue('x', D, 1), true);
}

// ── ⑤ 우선순위 표 가져오기 ──
const SHEET2 = [
  '구분,항목,내용,긴급도,중요도,,,긴급도,',
  '모임,새벽기도,"인도하심, 장소",0,0,,,0,설명',
  '성도,홍길동,전화 한번 하기,1,3,,,1,설명',
  '방문자,김철수,,2,3,,,,',
  '부서,예배팀,,2,2,,,,',
  '부서,찬양팀,,3,2,,,중요도,',
  '부서,영상팀,,3,4,,,0,설명',
  '부서,새가족팀,,5,5,,,,',
  '예배,주일 1부 에배,,2,0,,,예배팀,',
  ',,,,,,,찬양팀,',
  ',,,,,,,,',
  ',,,,,,,영상팀,',
  ',,,,,,,새가족팀,',
  ',,,,,,,기도팀,'
].join('\n');
{
  const rows = A.parseCSV(SHEET2);
  sc.eq('⑤ 모양을 알아본다', A.detectFormat(rows), 'sheet2');
  const db = A.seedDB();
  const before = db.T.length;
  const r = A.importSheet2(db, rows);
  const hong = db.T.find(t => t.name === '홍길동');
  sc.eq('⑤ 사람 구분은 사람으로 · 내용은 실천', [hong.kind, hong.memo, hong.u, hong.i], ['person', '전화 한번 하기', 1, 3]);
  const dawn = db.T.find(t => t.name === '새벽기도');
  sc.eq('⑤ 항목 구분의 내용은 쉼표로 나눠 기도제목', dawn.topics.map(x => x.t), ['인도하심', '장소']);
  sc.eq('⑤ 시트의 오타(에배)도 샘플의 \'예배\' 와 같은 것으로 본다', db.T.filter(t => A.nameKey(t.name) === A.nameKey('주일 1부 예배')).length, 1);
  const dept = db.cats.find(c => c.name === '부서');
  const subOf = n => { const t = db.T.find(x => x.name === n && x.cat === dept.id); const s = db.subs.find(x => x.id === t.sub); return s && s.name; };
  sc.eq('⑤ 오른쪽 부서 덩어리 차례대로 상위 분류', [subOf('예배팀'), subOf('찬양팀'), subOf('영상팀'), subOf('새가족팀'), subOf('기도팀')],
    [db.subs[0].name, db.subs[0].name, db.subs[1].name, db.subs[1].name, db.subs[1].name]);
  sc.eq('⑤ 덩어리에만 있던 부서(기도팀)도 들어온다', !!db.T.find(t => t.name === '기도팀' && t.cat === dept.id), true);
  const n1 = db.T.length;
  const r2 = A.importSheet2(db, rows);
  sc.eq('⑤ 다시 가져와도 겹치지 않는다', db.T.length, n1);
  sc.eq('⑤ 다시 가져오면 고친 것으로 센다', r2.added, 0);
  sc.eq('⑤ 가져오기는 아무것도 지우지 않는다', db.T.length >= before, true);
  sc.eq('⑤ 기도제목도 겹쳐 쌓이지 않는다', dawn.topics.length, 2);
}
{
  const t = A.parseCSV('가\t나\t"다,라"\n마\t\t바');
  sc.eq('⑤ 시트에서 복사한 탭 글도 읽는다', t, [['가', '나', '다,라'], ['마', '', '바']]);
  sc.eq('⑤ 따옴표 안의 줄바꿈 · 따옴표', A.parseCSV('"가\n나","다""라"'), [['가\n나', '다"라']]);
}

// ── ⑥ 기도 지도 가져오기 ──
const MAPCSV = [
  ',,,,,,',
  ',우리 공동체,,,,24-0303,',
  ',,,,,,',
  ',리더십,,,중고등부,,',
  ',,,,,,',
  ',김목사 박사모,,,1학년 가족,,',
  ',이장로 최권사,,,가가 / 나나 / 아빠 다다 라라,,',
  ',,,,마마 / 나나 / 바바,,',
  ',가족,,,,,',
  ',"외삼촌, 이모들 가정",,,교사,,',
  ',홍아빠 홍엄마 홍딸,,,,,',
  ',,,,나나,,',
  ',셀,,,사사,,',
  ',,,,,,',
  ',박인도 토오후,,,,,',
  ',셀원하나,,,,,',
  ',셀원둘,,,,,'
].join('\n');
{
  const rows = A.parseCSV(MAPCSV);
  sc.eq('⑥ 모양을 알아본다', A.detectFormat(rows), 'map');
  const P = A.parseMapGrid(rows);
  sc.eq('⑥ 제목 · 날짜', [P.title, P.date, A.sheetDate(P.date)], ['우리 공동체', '24-0303', '2024-03-03']);
  const kind = t => (P.blocks.find(b => b.cells[0] === t) || {}).kind;
  sc.eq('⑥ 읽은 대로 — 묶음 · 작은 묶음 · 이름 줄', [kind('리더십'), kind('가족'), kind('셀'), kind('1학년 가족'), kind('박인도 토오후'), kind('교사'), kind('김목사 박사모')],
    ['group', 'group', 'group', 'sub', 'sub', 'group', 'lines']);
  // 화면에서 '교사' 를 작은 묶음으로 바꿨다고 치자 (시트에서는 색으로만 구분돼 있다)
  P.blocks.find(b => b.cells[0] === '교사').kind = 'sub';
  const db = A.emptyDB();
  const G = A.buildGroupsFromBlocks(db, P.blocks);
  db.G = G;
  const g = n => G.find(x => x.name === n);
  const lines = x => x.lines.map(l => A.lineToText(db, l));
  sc.eq('⑥ 큰 묶음 차례', A.topGroups(db).map(x => x.name), ['리더십', '가족', '셀', '중고등부']);
  sc.eq('⑥ 리더십 줄', lines(g('리더십')), ['김목사 박사모', '이장로 최권사']);
  sc.eq('⑥ ⭐ 빈 줄이 경계 — 제목 바로 아래 붙은 이름도 그 묶음 것', lines(g('가족')), ['외삼촌, 이모들 가정', '홍아빠 홍엄마 홍딸']);
  sc.eq('⑥ 쉼표가 있는 칸은 메모 줄', g('가족').lines[0].segs.length, 0);
  const cell = G.find(x => x.parent === g('셀').id);
  sc.eq('⑥ \'박인도 토오후\' = 셀 › 박인도 · 토요일 오후', [cell.name, cell.days, cell.time], ['박인도', [6], '오후']);
  sc.eq('⑥ 인도자가 첫 줄 · 셀원이 뒤에', lines(cell), ['박인도', '셀원하나', '셀원둘']);
  const grade = G.find(x => x.name === '1학년 가족');
  sc.eq('⑥ 작은 묶음은 위 묶음 아래', A.findG(db, grade.parent).name, '중고등부');
  sc.eq('⑥ / 로 나눈 줄 · \'아빠\' 는 이름 옆 작은 말', lines(grade), ['가가 / 나나 / 아빠 다다 라라', '마마 / 나나 / 바바']);
  const teacher = G.find(x => x.name === '교사');
  sc.eq('⑥ 제목만 있는 작은 묶음(교사) 아래 이름 줄은 그 작은 묶음 것', [A.findG(db, teacher.parent).name, lines(teacher)], ['중고등부', ['나나', '사사']]);
  const nana = db.T.filter(t => t.name === '나나');
  sc.eq('⑥ 같은 이름은 같은 사람 한 명', nana.length, 1);
  sc.eq('⑥ 그 사람은 두 묶음에 들어 있다', A.groupsOf(db, nana[0].id).map(x => x.name).sort(), ['1학년 가족', '교사']);
}
{
  // ⚠️ 2026-10-10 에 실제로 깨졌던 길: 빈 줄을 지운 채로 읽으면 '중고등부' 와 '1학년 가족' 이 한 덩어리가 된다
  const rows = A.parseCSV(MAPCSV).filter(r => r.some(Boolean));
  const P = A.parseMapGrid(rows);
  sc.eq('⑥ (대조) 빈 줄을 지우면 묶음이 서로 붙는다 — 그래서 화면은 빈 줄을 지우지 않는다',
    P.blocks.some(b => b.cells[0] === '중고등부' && b.cells.length > 1), true);
  const ui = HTML.match(/function impParse\(text\) \{[\s\S]*?\n\}/);
  sc.eq('⑥ 화면의 가져오기가 빈 줄을 지우지 않는다', !!ui && !/parseCSV\(text\)\.filter/.test(ui[0]), true);
}

// ── ⑦ 지우기 · 순서 · 판 · 백업 · 테마 ──
{
  const db = A.emptyDB();
  const g = A.newGroup('큰', '#111'); db.G.push(g);
  const k = A.newGroup('작은', '#111'); k.parent = g.id; db.G.push(k);
  const k2 = A.newGroup('더작은', '#111'); k2.parent = k.id; db.G.push(k2);
  g.lines.push(A.parseLineText(db, '가나 / 다라'), A.parseLineText(db, '마바'));
  const ga = db.T.find(t => t.name === '가나');
  A.removeTarget(db, ga.id);
  sc.eq('⑦ 사람을 지우면 줄에서도 빠진다', g.lines.map(l => A.lineToText(db, l)), ['다라', '마바']);
  A.removeTarget(db, db.T.find(t => t.name === '마바').id);
  sc.eq('⑦ 사람이 다 빠진 줄은 없어진다', g.lines.length, 1);
  sc.eq('⑦ 묶음을 지우면 작은 묶음도 함께 (사람은 남는다)', [A.removeGroup(db, g.id), db.G.length, db.T.length], [3, 0, 1]);
}
{
  const R = A.applyRanks({}, ['a', 'b', 'c'], ['c', 'a', 'b']);
  sc.eq('⑦ 처음 끌어 옮기면 그 순서대로 번호', [R.c, R.a, R.b], [0, 1, 2]);
  const R2 = A.applyRanks({ a: 0, b: 5, c: 9, d: 2 }, ['a', 'b', 'c'], ['b', 'c', 'a']);
  sc.eq('⑦ 보이던 줄끼리 자리만 바꾸고 안 보이던 줄(d)의 자리는 그대로', R2, { a: 9, b: 0, c: 5, d: 2 });
  const list = [{ id: 'a', name: '나', i: 1, u: 1 }, { id: 'b', name: '가', i: 0, u: 3 }, { id: 'c', name: '다', i: null, u: null }];
  sc.eq('⑦ 정렬: 중요도 · 이름 · 내 순서', [A.sortTargets(list, 'imp').map(x => x.id), A.sortTargets(list, 'name').map(x => x.id), A.sortTargets(list, 'mine', { c: 0, a: 1 }).map(x => x.id)],
    [['b', 'a', 'c'], ['b', 'a', 'c'], ['c', 'a', 'b']]);
}
{
  const db = A.emptyDB();
  const g = A.newGroup('조', '#111'); db.G.push(g);
  g.lines.push(A.parseLineText(db, '하나 둘'));
  db.marks.green = '새가족 돌봄';
  db.T.find(t => t.name === '하나').mark = 'green';
  const s = A.makeSnap(db, null, '2024-03-03', '봄');
  g.lines.push(A.parseLineText(db, '셋'));
  A.removeTarget(db, db.T.find(t => t.name === '둘').id);
  sc.eq('⑦ 판은 그날 모양 그대로 (이후에 고쳐도 안 바뀐다)', [...A.snapNames(s)].sort(), ['둘', '하나']);
  sc.eq('⑦ 판과 지금 비교 — 들어온 · 빠진 이름', A.diffNames(A.snapNames(s), A.currentNames(db)), { added: ['셋'], removed: ['둘'] });
  sc.eq('⑦ 판은 그때의 색 이름도 함께 얼린다', [s.marks.green, s.P[Object.keys(s.P).find(k => s.P[k].name === '하나')].mark], ['새가족 돌봄', 'green']);
}
{
  const db = A.seedDB();
  db.T[0].topics[0].ans = D;
  const back = A.readBackup(A.exportBackup(db));
  sc.eq('⑦ 백업 → 되살리기 그대로', [back.T.length, back.cats.length, A.answeredList(back).length], [db.T.length, 6, 1]);
  let err = '';
  try { A.readBackup(JSON.stringify({ app: 'block7', db: {} })); } catch (e) { err = e.message; }
  sc.eq('⑦ 다른 앱 파일은 거절한다', err, '기도노트 백업 파일이 아닙니다');
  const n = A.normDB({ T: [{ id: 'x', name: '가', mark: 'neon', u: '9', i: '2' }], marks: { red: '바꿈', orange: '주황이름' }, set: { iv: [1] } });
  sc.eq('⑦ 이상한 값은 걸러 낸다 (모르는 색 · 범위 밖 숫자 · 고정 색 이름)', [n.T[0].mark, n.T[0].u, n.T[0].i, n.marks.red, n.marks.orange, n.set.iv.length], ['', null, 2, undefined, '주황이름', 6]);
  sc.eq('⑦ 깨진 저장값이면 빈 DB', A.normDB('엉망').T.length, 0);
}
{
  // BLOCK7 · Sweeter 와 **같은 테마**를 쓴다 (HB 2026-10-10) — 옮겨 온 덩어리가 원본과 글자까지 같은지
  const b7 = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cut = s => s.slice(s.indexOf('const THEME_GROUPS={'), s.indexOf('// ── 색 계산 도구 ──'));
  sc.eq('⑦ ⭐ 테마 목록이 BLOCK7 과 글자까지 같다', cut(HTML) === cut(b7) && cut(HTML).length > 1000, true);
  sc.eq('⑦ 테마 17벌 · 라이트 다크 토큰 계산', [A.THEME_PRESETS.length >= 17, !!A._themeTokens(A.themeById('22'), 'light')['--bg']], [true, true]);
  sc.eq('⑦ 저장 칸 이름은 pray.v1 (BLOCK7 · Sweeter 칸과 겹치지 않는다)', A.PRAY_KEY, 'pray.v1');
}
{
  // ⑧ 작은 묶음 연동
  const db = A.emptyDB();
  const a = A.newGroup('가조', '#111'), b = A.newGroup('나조', '#222'); db.G.push(a, b);
  const s = A.newGroup('기도팀', '#111'); s.parent = a.id; db.G.push(s);
  s.lines.push(A.parseLineText(db, '하나 둘'));
  sc.eq('⑧ 연동하면 두 큰 묶음 밑에 같은 작은 묶음', [A.linkSub(db, s.id, b.id), A.kidsOf(db, a.id).map(g => g.name), A.kidsOf(db, b.id).map(g => g.name)], [true, ['기도팀'], ['기도팀']]);
  sc.eq('⑧ 연동한 쪽 사람 수에도 든다', A.groupHeadcount(db, b), 2);
  db.T.forEach(t => { t.u = 0; }); s.u = 0;
  const today = A.buildToday(db, '2026-10-11'), ids = [].concat(...Object.values(today.sec).map(x => x.map(e => e.t.id)));
  sc.eq('⑧ 오늘 목록에는 한 번만 (묶음은 하나)', ids.filter(x => x === s.id).length, 1);
  const back = A.normDB(JSON.parse(JSON.stringify(db)));
  sc.eq('⑧ 저장했다 되살려도 연동이 남는다', A.kidsOf(back, b.id).map(g => g.name), ['기도팀']);
  sc.eq('⑧ 이상한 자리(없는 묶음 · 제 자리)는 버린다', A.normDB({ G: [{ id: 'p' }, { id: 'k', parent: 'p', also: ['p', 'zz', 'p2'] }, { id: 'p2' }] }).G[1].also, ['p2']);
  const c = JSON.parse(JSON.stringify(db));
  A.removeGroup(c, a.id);
  sc.eq('⭐⑧ 제 자리 큰 묶음을 지워도 연동한 자리에 살아남는다', [A.kidsOf(c, b.id).map(g => g.name), A.findG(c, s.id).parent, A.findG(c, s.id).also], [['기도팀'], b.id, []]);
  const d = JSON.parse(JSON.stringify(db));
  sc.eq('⑧ 한 자리에서만 빼기 — 연동한 자리', [A.unplaceSub(d, s.id, b.id), A.kidsOf(d, b.id).length, A.kidsOf(d, a.id).length], ['unlinked', 0, 1]);
  const e = JSON.parse(JSON.stringify(db));
  sc.eq('⑧ 한 자리에서만 빼기 — 제 자리면 남은 자리가 제 자리가 된다', [A.unplaceSub(e, s.id, a.id), A.findG(e, s.id).parent, A.kidsOf(e, a.id).length], ['unlinked', b.id, 0]);
  sc.eq('⑧ 마지막 자리에서 빼면 지운다', [A.unplaceSub(e, s.id, b.id), !!A.findG(e, s.id)], ['removed', false]);
  const f = A.emptyDB(); const x = A.newGroup('x'), y = A.newGroup('y'), z = A.newGroup('z'); f.G.push(x, y, z);
  const k = A.newGroup('k'); k.parent = x.id; f.G.push(k);
  A.linkSub(f, k.id, y.id); A.moveSub(f, k.id, y.id, z.id);
  sc.eq('⑧ 연동한 자리를 다른 곳으로 옮기면 제 자리는 그대로', [A.kidsOf(f, x.id).length, A.kidsOf(f, y.id).length, A.kidsOf(f, z.id).length], [1, 0, 1]);
}
{
  // ⑧ 줄 연동
  const db = A.emptyDB();
  const a = A.newGroup('가조'), b = A.newGroup('나조'); db.G.push(a, b);
  const l = A.parseLineText(db, '하나 / 둘'); a.lines.push(l);
  const cp = A.copyLineLinked(db, l); b.lines.push(cp);
  sc.eq('⑧ 연동한 줄은 다른 id · 같은 표', [cp.id !== l.id, cp.link === l.link && !!l.link], [true, true]);
  const n = A.parseLineText(db, '하나 / 둘 / 셋'); n.id = l.id; n.link = l.link; a.lines[0] = n; A.syncLine(db, n);
  sc.eq('⭐⑧ 한쪽을 고치면 다른 쪽도 같이', A.lineToText(db, b.lines[0]), '하나 / 둘 / 셋');
  const back = A.normDB(JSON.parse(JSON.stringify(db)));
  sc.eq('⑧ 저장했다 되살려도 이어져 있다', A.linkedLines(back, back.G[0].lines[0]).length, 1);
  A.removeFromGroup(db, a.id, db.T.find(t => t.name === '셋').id);
  sc.eq('⑧ 묶음에서 사람을 빼도 연동한 줄에 같이', A.lineToText(db, b.lines[0]), '하나 / 둘');
  b.lines.splice(0, 1);
  sc.eq('⑧ 연동한 줄 하나를 지워도 다른 줄은 남는다', A.lineToText(db, a.lines[0]), '하나 / 둘');
}
{
  // ⑨ 구분 칩
  const db = A.seedDB();
  const P = db.cats.find(c => c.person), P2 = db.cats.filter(c => c.person)[1], I = db.cats.find(c => !c.person);
  const g = A.newGroup('가조'); db.G.push(g);
  sc.eq('⑨ 이름인지 보기만 (사람 카드를 만들지 않는다)', [A.looksLikeNames('하나 / 둘'), A.looksLikeNames('교회, 나라'), db.T.filter(t => t.name === '하나').length], [true, false, 0]);
  sc.eq('⑨ 처음엔 사람 구분 첫째 · 기도 제목이면 사람 아닌 구분 첫째', [A.suggestCat(db, g, '하나'), A.suggestCat(db, g, '교회, 나라를 위해')], [P.id, I.id]);
  g.lines.push(A.makeEntry(db, '하나 / 둘', P2.id));
  sc.eq('⑨ 사람 구분을 고르면 사람 카드에 그 구분', db.T.filter(t => t.name === '하나' || t.name === '둘').map(t => t.cat), [P2.id, P2.id]);
  sc.eq('⑨ 같은 그룹 사람들이 가진 구분을 먼저 고른다', A.suggestCat(db, g, '셋'), P2.id);
  const l = A.makeEntry(db, '교회 부흥', I.id); g.lines.push(l);
  const it = db.T.find(t => t.name === '교회 부흥');
  sc.eq('⑨ 사람 아닌 구분이면 글 전체가 기도 항목 하나', [it && it.kind, it && it.cat, l.segs.length, l.segs[0].length], ['item', I.id, 1, 1]);
  sc.eq('⑨ 기도 항목은 사람 수에 안 든다', A.groupHeadcount(db, g), 2);
  A.makeEntry(db, '교회 부흥', I.id);
  sc.eq('⑨ 같은 이름의 기도 항목은 다시 만들지 않는다', db.T.filter(t => t.name === '교회 부흥').length, 1);
  g.lines.push(A.makeEntry(db, '넷', ''));
  sc.eq('⑨ 나중에 = 구분 없이', db.T.find(t => t.name === '넷').cat, '');
}
{
  // ⑩ 표시 색 잇기
  const db = A.seedDB();
  const vis = db.cats.find(c => c.name === '방문자');
  const g = A.newGroup('중고등부'), k = A.newGroup('중고등부 방문'); k.parent = g.id; db.G.push(g, k);
  k.lines.push(A.parseLineText(db, '하나 / 둘'));
  const one = db.T.find(t => t.name === '하나'), two = db.T.find(t => t.name === '둘');
  const c = A.markLinkCandidates(db, '방문');
  sc.eq('⑩ 쓰는 글로 소속 후보를 찾는다 (구분 · 서브 그룹)', c.map(x => x.kind.split(' ·')[0] + ':' + x.name), ['구분:방문자', '서브 그룹:중고등부 방문']);
  db.markLinks.orange = { t: 'group', id: k.id };
  sc.eq('⑩ 서브 그룹에 이으면 그 사람들이 주황', [A.markOf(db, one), A.markOf(db, two)], ['orange', 'orange']);
  two.mark = 'green';
  sc.eq('⑩ 직접 칠한 색이 먼저', A.markOf(db, two), 'green');
  db.markLinks.yellow = { t: 'cat', id: vis.id }; one.cat = vis.id;
  sc.eq('⑩ 두 색에 걸리면 앞 색(색 차례)', A.markOf(db, one), 'orange');
  db.markLinks.red = { t: 'cat', id: vis.id };
  const back = A.normDB(JSON.parse(JSON.stringify(db)));
  sc.eq('⑩ 저장했다 되살려도 남고, 빨강 · 회색은 잇지 않는다', [!!back.markLinks.orange, !!back.markLinks.yellow, !!back.markLinks.red], [true, true, false]);
  const s = A.makeSnap(db, null, '2026-10-11', '');
  sc.eq('⑩ 판에는 그때 보이던 색으로 얼린다', s.P[one.id].mark, 'orange');
  sc.eq('⑩ 이은 소속 이름', A.markLinkName(db, db.markLinks.orange), '중고등부 방문');
}
{
  // ⑨-2 칩 없이 넣은 '/' 항목 — 구분이 있는 첫 사람을 따른다
  const db = A.seedDB();
  const P = db.cats.find(c => c.person), P2 = db.cats.filter(c => c.person)[1];
  const g = A.newGroup('가조'); db.G.push(g);
  const l1 = A.parseLineText(db, '하나 / 둘 / 셋'); g.lines.push(l1);
  db.T.find(t => t.name === '둘').cat = P2.id;
  sc.eq('⑨-2 구분 있는 첫 사람(둘)을 나머지가 따른다', [A.fillLineCats(db, l1, g), ...['하나', '둘', '셋'].map(n => db.T.find(t => t.name === n).cat === P2.id)], [2, true, true, true]);
  const o = A.parseLineText(db, '넷'); db.T.find(t => t.name === '넷').cat = P.id;
  const l2 = A.parseLineText(db, '넷 / 다섯'); g.lines.push(l2); A.fillLineCats(db, l2, g);
  sc.eq('⑨-2 이미 구분이 있는 사람은 그대로 (넷은 첫 구분 그대로)', [db.T.find(t => t.name === '넷').cat, db.T.find(t => t.name === '다섯').cat], [P.id, P.id]);
  const l3 = A.parseLineText(db, '여섯 / 일곱'); g.lines.push(l3); A.fillLineCats(db, l3, g);
  sc.eq('⑨-2 아무도 없으면 이 그룹에서 많이 쓴 구분', db.T.find(t => t.name === '여섯').cat, P2.id);
}
{
  // ⑨-3 손으로 넣는 항목 — '/' 로만 나누고 띄어쓰기는 한 이름 (HB 2026-10-12)
  const db = A.emptyDB();
  const l = A.parseEntryText(db, '초등 바닥 / 간판 전기');
  sc.eq('⑨-3 띄어쓰기는 한 이름 · / 로 두 항목', [l.segs.length, ...l.segs.map(s => db.T.find(t => t.id === s[0]).name)], [2, '초등 바닥', '간판 전기']);
  sc.eq('⑨-3 쉼표는 예전처럼 메모 줄', A.parseEntryText(db, '교회, 나라').text, '교회, 나라');
  sc.eq('⑨-3 같은 이름이면 같은 카드', A.parseEntryText(db, '초등 바닥').segs[0][0], l.segs[0][0]);
  sc.eq('⑨-3 시트 가져오기 규칙(parseLineText)은 그대로 — 한 칸 한 가정', A.parseLineText(db, '아빠 이상연 세중').segs[0].length, 2);
  // 예전 규칙으로 갈라져 생긴 카드 치우기
  const g = A.newGroup('성전'); db.G.push(g);
  const old = A.parseLineText(db, '유리 교체'); g.lines.push(old);
  const keep = db.T.find(t => t.name === '유리'); keep.topics.push(A.newTopic('기도제목 있음'));
  const n = A.parseEntryText(db, '유리 교체'); n.id = old.id; g.lines[0] = n;
  sc.eq('⑨-3 고친 뒤 안 쓰이는 카드만 치운다 (기도제목 있는 카드는 남김)', [A.dropOrphans(db, A.groupPids({ lines: [old] })), !!db.T.find(t => t.name === '유리'), !!db.T.find(t => t.name === '교체')], [['교체'], true, false]);
}
// 공개 저장소 지킴 — pray/ 에 시트 파일(CSV)이 들어오면 안 된다
{
  const files = fs.readdirSync(path.join(__dirname, '..', 'pray'));
  sc.eq('⭐ pray/ 에 시트 자료 파일이 없다 (이름이 든 자료는 저장소에 넣지 않는다)', files.filter(f => /\.(csv|tsv|xlsx?)$/i.test(f)), []);
}

sc.done();
