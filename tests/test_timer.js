// 타이머(timer/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="timer-core">)를 떼어 시험한다.
//
// 지키는 것:
//  ① 시간 표시 — 초는 올림(0:00 은 정말 끝났을 때만) · 한 시간 넘으면 1:24:13
//  ② 세 바퀴 — 끌기는 각도 '차이' 를 쌓는다: 12시를 넘으면 다음 바퀴로, 0 밑 · 180분 위로는 안 간다
//  ③ 방향 — 기본 시계 방향, 'ccw' 는 거울
//  ④ 남은 바퀴 칩 — 60분 딱이면 없음, 61분이면 ＋1바퀴
//  ⑤ 이어달리기 차례 — 되풀이 반영
//  ⑥ 망가진 · 낡은 저장을 읽어도 죽지 않는다 · 모르는 칸은 기본값 · 지운 프리셋은 이어달리기에서도 빠진다
//  ⑧ 프리셋 끌어 옮기기 — 가운데를 넘어야 자리가 바뀐다 · 여러 칸 · 제자리
//  ⑦ 같은 주소의 다른 앱(공부 · 용돈 · BLOCK7)과 저장 이름이 겹치지 않는다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'timer', 'index.html'), 'utf8');
const m = HTML.match(/<script id="timer-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('timer-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Array, String, isFinite };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, KEY, COLORS, dragSlot, moveItem, colorHex, MAXMIN, LAP, fmt, lapText, rawMinute, dragStep, routineSeq, normState, seed, CFG_DEFAULT };`, ctx);
const A = ctx.A;
const near = (a, b) => Math.abs(a - b) < 1e-6;

// ① 시간 표시
sc.eq('① 25분', A.fmt(25 * 60000), '25:00');
sc.eq('① 0.4초 남음은 00:01 (올림)', A.fmt(400), '00:01');
sc.eq('① 0 은 00:00', A.fmt(0), '00:00');
sc.eq('① 한 시간 넘으면 시:분:초', A.fmt((84 * 60 + 13) * 1000), '1:24:13');
sc.eq('① 음수가 와도 00:00', A.fmt(-5000), '00:00');

// ② 끌기 — 시계 방향으로 한 바퀴 반을 돌리면 90분
{
  let val = 0, prev = 0;
  for (let i = 1; i <= 90; i++) { const raw = i % 60; val = A.dragStep(val, prev, raw); prev = raw; }
  sc.eq('② 12시를 넘어 계속 돌리면 다음 바퀴 (90분)', Math.round(val), 90);
  // 거꾸로 100분 감으면 0 에서 멈춘다
  for (let i = 1; i <= 100; i++) { const raw = ((prev - 1) % 60 + 60) % 60; val = A.dragStep(val, prev, raw); prev = raw; }
  sc.eq('② 0 밑으로는 안 간다', val, 0);
  // 네 바퀴를 돌려도 180분
  for (let i = 1; i <= 240; i++) { const raw = (prev + 1) % 60; val = A.dragStep(val, prev, raw); prev = raw; }
  sc.eq('② 세 바퀴(180분) 위로는 안 간다', val, 180);
  sc.eq('② 12시 바로 앞(59.5)→바로 뒤(0.5)는 +1분이지 −59분이 아니다', A.dragStep(10, 59.5, 0.5), 11);
}

// ③ 방향
sc.eq('③ 시계 방향: 3시 자리 = 15분', near(A.rawMinute(1, 0, 'cw'), 15), true);
sc.eq('③ 시계 반대: 3시 자리 = 45분', near(A.rawMinute(1, 0, 'ccw'), 45), true);
sc.eq('③ 6시 자리는 어느 쪽이든 30분', [A.rawMinute(0, 1, 'cw'), A.rawMinute(0, 1, 'ccw')].map(Math.round), [30, 30]);
sc.eq('③ 기본 방향은 시계 방향', A.CFG_DEFAULT.dir, 'cw');

// ④ 남은 바퀴
sc.eq('④ 60분 딱이면 칩 없음', A.lapText(60 * 60000), '');
sc.eq('④ 61분이면 ＋1바퀴', A.lapText(61 * 60000), '＋1바퀴');
sc.eq('④ 180분이면 ＋2바퀴', A.lapText(180 * 60000), '＋2바퀴');

// ⑤ 이어달리기
sc.eq('⑤ 집중 → 쉬기 ×3', A.routineSeq({ items: ['a', 'b'], rep: 3 }), ['a', 'b', 'a', 'b', 'a', 'b']);

// ⑥ 저장 읽기
{
  const S = A.normState(null);
  sc.eq('⑥ 빈 저장 → 기본 프리셋 6개', S.presets.length, 6);
  sc.eq('⑥ 빈 저장 → 멈춰 있는 25분', [S.run.state, S.run.left], ['idle', 25 * 60000]);
  sc.eq('⑥ 망가진 것(문자열)도 죽지 않는다', A.normState('xx').presets.length, 6);
  const old = A.normState(JSON.parse(JSON.stringify({
    presets: [{ id: 'p1', min: 999, name: '긴 것', color: 'g' }, { id: 'p2', min: 5, color: '#123456' }],
    routines: [{ id: 'r', name: '묶음', items: ['p1', 'gone', 'p2'], rep: 50 }],
    cfg: { sound: 'harp' },
    run: { state: 'run', left: 1000, total: 1000, endAt: 0, rt: { id: 'r', seq: ['p1', 'gone'], idx: 0 } },
    log: [{ t: 1, m: 25, label: 'x', color: 'g' }, { t: 2, m: 5, ex: 1 }, { m: 'bad' }]
  })));
  sc.eq('⑥ 180분 넘는 프리셋은 180분으로', old.presets[0].min, 180);
  sc.eq('⑥ 없는 프리셋은 이어달리기에서 빠진다', old.routines[0].items, ['p1', 'p2']);
  sc.eq('⑥ 되풀이는 9번까지', old.routines[0].rep, 9);
  sc.eq('⑥ 고른 소리는 지키고 새 설정은 기본값', [old.cfg.sound, old.cfg.lv, old.cfg.voice], ['harp', 'simple', false]);
  sc.eq('⑥ 끝 시각 없는 \'도는 중\' 은 멈춤으로', old.run.state, 'pause');
  sc.eq('⑥ 없는 프리셋을 가리키던 이어달리기 진행은 버린다', old.run.rt, null);
  sc.eq('⑥ 예시 · 망가진 기록은 버린다', old.log.length, 1);
  sc.eq('⑥ 커스텀 색은 그대로', A.colorHex(old.presets[1].color), '#123456');
  sc.eq('⑥ 모르는 색은 구글 레드', A.colorHex('blue'), '#EA4335');
}

// ⑦ 저장 이름 · 버전
sc.eq('⑦ 저장 이름이 다른 앱과 겹치지 않는다', A.KEY, 'b7timer_v1');
sc.eq('⑦ 버전 형식', /^v\. \d{2}-\d{4}-\d+$/.test(A.APP_VERSION), true);
sc.eq('⑦ 2번째 줄 주석과 APP_VERSION 이 같다', HTML.split('\n')[1].includes(A.APP_VERSION), true);
sc.eq('⑦ 색 = 구글 레드 + 성경 7색', A.COLORS.map(c => c.hex), ['#EA4335', '#ff7b72', '#ffa95e', '#ffd640', '#78d68c', '#6eb4ff', '#be96ff', '#ff8caa']);

// ⑧ 끌어 옮기기
{
  const mids = [50, 150, 250, 350];   // 칸 넷의 가운데
  sc.eq('⑧ 이웃 가운데를 못 넘으면 제자리', A.dragSlot(mids, 1, 240), 1);
  sc.eq('⑧ 오른쪽 이웃 가운데를 넘으면 한 칸', A.dragSlot(mids, 1, 260), 2);
  sc.eq('⑧ 두 칸 넘기면 두 칸', A.dragSlot(mids, 0, 360), 3);
  sc.eq('⑧ 왼쪽으로', A.dragSlot(mids, 3, 140), 1);
  sc.eq('⑧ 맨 앞으로 옮기면 나머지가 한 칸씩 밀린다', A.moveItem(['a', 'b', 'c', 'd'], 2, 0), ['c', 'a', 'b', 'd']);
  sc.eq('⑧ 맨 뒤로', A.moveItem(['a', 'b', 'c', 'd'], 0, 3), ['b', 'c', 'd', 'a']);
  sc.eq('⑧ 원본은 그대로', (() => { const a = ['a', 'b']; A.moveItem(a, 0, 1); return a; })(), ['a', 'b']);
}

sc.done();
