// 용돈 친구들(wallet/index.html) 부모님 '우리 아이' — 날·주·달 앞뒤로 넘기기 (P-2, HB 2026-10-23)
//
// perRange(per, off, today): off 0 = 지금, -1 = 하나 전 … 미래(off > 0)는 없다.
// perCan(per, off, k, first, today): 앞(+1)은 지금까지, 뒤(-1)는 첫 기록이 든 기간까지.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'wallet', 'index.html'), 'utf8');
const A = HTML.indexOf('/* ───────── 기간 넘기기 (P-2)'), B = HTML.indexOf('/* ───────── 기간 넘기기 끝', A);
if (A < 0 || B < 0) { console.error('기간 넘기기 구간을 못 찾았습니다'); process.exit(2); }
const ctx = { todayStr: () => '2026-10-23' };
vm.createContext(ctx);
vm.runInContext(HTML.slice(A, B) + ';this.perRange = perRange; this.perCan = perCan; this.wa = wa;', ctx);
const { perRange, perCan, wa } = ctx;
const pick = r => [r.a, r.b, r.pa, r.pb, r.lb, r.pl];
const T = '2026-10-23';   // 금요일

console.log('시나리오 1 — 날');
sc.eq('오늘', pick(perRange('day', 0, T)), ['2026-10-23', '2026-10-23', '2026-10-22', '2026-10-22', '오늘', '어제']);
sc.eq('어제', pick(perRange('day', -1, T)), ['2026-10-22', '2026-10-22', '2026-10-21', '2026-10-21', '어제', '그저께']);
sc.eq('그저께', perRange('day', -2, T).lb, '그저께');
sc.eq('사흘 전은 날짜로', pick(perRange('day', -3, T)), ['2026-10-20', '2026-10-20', '2026-10-19', '2026-10-19', '10월 20일', '전날']);
sc.eq('달을 넘어간다', perRange('day', -23, T).a, '2026-09-30');
sc.eq('미래는 지금으로', perRange('day', 3, T).a, '2026-10-23');
sc.eq('기본값은 오늘', perRange('day').a, '2026-10-23');

console.log('\n시나리오 2 — 주 (월요일 시작)');
sc.eq('이번 주', pick(perRange('week', 0, T)), ['2026-10-19', '2026-10-25', '2026-10-12', '2026-10-18', '이번 주', '지난주']);
sc.eq('지난주', pick(perRange('week', -1, T)), ['2026-10-12', '2026-10-18', '2026-10-05', '2026-10-11', '지난주', '그 전 주']);
sc.eq('3주 전', perRange('week', -3, T).lb, '3주 전');
sc.eq('일요일도 그 주의 끝', perRange('week', 0, '2026-10-25').a, '2026-10-19');
sc.eq('월요일은 그 주의 처음', perRange('week', 0, '2026-10-19').a, '2026-10-19');

console.log('\n시나리오 3 — 달');
sc.eq('이번 달', pick(perRange('month', 0, T)), ['2026-10-01', '2026-10-31', '2026-09-01', '2026-09-30', '이번 달', '지난달']);
sc.eq('지난달 (30일까지)', pick(perRange('month', -1, T)), ['2026-09-01', '2026-09-30', '2026-08-01', '2026-08-31', '지난달', '그 전 달']);
sc.eq('같은 해는 M월', perRange('month', -2, T).lb, '8월');
sc.eq('2월은 28일까지', perRange('month', -8, T).b, '2026-02-28');
sc.eq('해가 바뀌면 년도까지', [perRange('month', -10, T).a, perRange('month', -10, T).lb], ['2025-12-01', '2025년 12월']);
sc.eq('1월의 비교 대상은 작년 12월', [perRange('month', -9, T).pa, perRange('month', -9, T).pb], ['2025-12-01', '2025-12-31']);
sc.eq('지금 기간 표시', [perRange('month', 0, T).cur, perRange('month', -1, T).cur], [true, false]);

console.log('\n시나리오 4 — 더 넘길 수 있나');
sc.eq('지금에서 앞으로는 못 간다', perCan('day', 0, 1, '2026-10-01', T), false);
sc.eq('지난 기간에서는 앞으로 간다', perCan('week', -1, 1, '2026-10-01', T), true);
sc.eq('첫 기록이 든 날까지 뒤로', [perCan('day', -21, -1, '2026-10-01', T), perCan('day', -22, -1, '2026-10-01', T)], [true, false]);
sc.eq('첫 기록이 든 주까지 뒤로', [perCan('week', 0, -1, '2026-10-14', T), perCan('week', -1, -1, '2026-10-14', T)], [true, false]);
sc.eq('첫 기록이 든 달까지 뒤로', [perCan('month', 0, -1, '2026-09-30', T), perCan('month', -1, -1, '2026-09-30', T)], [true, false]);
sc.eq('기록이 오늘 것뿐이면 뒤로 못 간다', perCan('day', 0, -1, T, T), false);

console.log('\n시나리오 5 — 와/과');
sc.eq('받침 없음·있음', [wa('지난주'), wa('지난달'), wa('어제'), wa('전날'), wa('그 전 주'), wa('그 전 달')], ['지난주와', '지난달과', '어제와', '전날과', '그 전 주와', '그 전 달과']);
sc.done();
