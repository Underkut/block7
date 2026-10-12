// There 대시보드 덩어리(tools/there-dash.js) — 세 앱 기록을 한 모양으로 모으는 규칙 · 두 앱에 같은 글자로 들었는지.
//
// 지키는 것:
//  ① 갈래 넷 — BLOCK7 · Sweeter(app 칸) · 성경(src bible · bible-menu) · 기도노트
//  ② 옛 기록 — app 이 빈 BLOCK7/Sweeter 기록은 block7 · 기도노트 날 합계(s)만 있는 날은 '시간만 남은 기록' 한 줄
//  ③ 기도노트 ses 와 합계 s 를 **두 번 세지 않는다** (s 는 ses 를 이미 품고 있다)
//  ④ 날마다 합계 · 주(월요일부터) · 달 경계
//  ⑤ 덩어리가 index.html · index-dev.html · sweeter-dev.html · pray/index.html 에 원본과 같은 글자로 있다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const ROOT = path.join(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'tools', 'there-dash.js'), 'utf8');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(SRC + '\nthis.T = TDASH;', ctx);
const T = ctx.T;

// ① · ② · ③
{
  const there = {
    '2026-10-12': [
      { ref: '시편 23:1', time: '07:55', t: 1, d: 840, app: 'block7', src: 'gnb' },
      { ref: '로마서 8:28', time: '09:10', t: 2, d: 360, app: 'sweeter', src: 'home' },
      { ref: '', time: '22:50', t: 3, d: 240, app: 'sweeter', src: 'bible' },
      { ref: '', time: '23:00', t: 4, d: 60, app: 'block7', src: 'bible-menu' },
      { ref: '시편 23:1', time: '23:10', t: 5, d: 0, app: 'block7', src: 'gnb' }
    ],
    '2026-10-01': [{ ref: '', time: '06:00', t: 0, d: 300 }],
    'bad-key': [{ d: 999 }]
  };
  const pray = {
    '2026-10-12': { d: ['a'], s: 1860 + 600, ses: [{ id: 'x', t: 9, time: '06:40', d: 1860, src: 'map' }] },
    '2026-10-05': { d: [], s: 420 },
    '2026-10-06': { d: ['b'] }
  };
  const ss = T.collect(there, pray);
  const by = {}; ss.forEach(x => { by[x.app] = (by[x.app] || 0) + x.d; });
  const srt = o => Object.keys(o).sort().map(k => [k, o[k]]);
  sc.eq('① 갈래 넷으로 나뉜다', srt(by), srt({ block7: 840 + 300, sweeter: 360, bible: 300, pray: 1860 + 600 + 420 }));
  sc.eq('① 0초 · 날짜가 아닌 칸은 버린다', ss.some(x => x.d === 0 || x.date === 'bad-key'), false);
  sc.eq('② app 이 빈 옛 기록은 block7', ss.find(x => x.date === '2026-10-01').app, 'block7');
  const p12 = ss.filter(x => x.date === '2026-10-12' && x.app === 'pray');
  sc.eq('⭐③ 기도노트 — ses 한 번 + 남은 600초 한 줄 (두 번 세지 않는다)', p12.map(x => [x.src, x.d, !!x.old]).sort((a, b) => a[2] - b[2]), [['map', 1860, false], ['', 600, true]]);
  sc.eq('② 날 합계만 있는 날 = 시간만 남은 기록 한 줄', ss.filter(x => x.date === '2026-10-05').map(x => [x.d, !!x.old]), [[420, true]]);
  sc.eq('② 시간이 없는 날(기도만 체크)은 기록이 없다', ss.some(x => x.date === '2026-10-06'), false);
  const dt = T.dayTotals(ss);
  sc.eq('④ 날마다 합계 — 그날 네 갈래', [dt['2026-10-12'].s, Object.keys(dt['2026-10-12'].by).sort()], [840 + 360 + 300 + 2460, ['bible', 'block7', 'pray', 'sweeter']]);
  sc.eq('④ 시작 시각 순으로 줄 선다', ss.filter(x => x.date === '2026-10-12').map(x => x.t), [0, 1, 2, 3, 4, 9]);
}
// ④ 주 · 달 경계
{
  sc.eq('④ 주는 월요일부터 (10-11 주일 → 10-05 월)', T.weekStart('2026-10-11'), '2026-10-05');
  sc.eq('④ 월요일은 제 주의 시작', T.weekStart('2026-10-12'), '2026-10-12');
  sc.eq('④ 달 끝', [T.monthStart('2026-02-14'), T.monthEnd('2026-02-14'), T.monthEnd('2028-02-03')], ['2026-02-01', '2026-02-28', '2028-02-29']);
  sc.eq('④ 날 더하기 — 달 넘김', T.add('2026-10-31', 1), '2026-11-01');
  sc.eq('글자 — 시간', [T.dur(0), T.dur(20), T.dur(3720), T.dur(7200)], ['0분', '1분 미만', '1시간 2분', '2시간']);
}
// ⑤ 두 앱에 같은 글자로
{
  const block = f => { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'); const m = s.match(/<script id="there-dash">\n([\s\S]*?)<\/script>/); return m ? m[1] : null; };
  ['pray/index.html', 'index.html', 'index-dev.html', 'sweeter-dev.html'].forEach(f => {
    const b = block(f);
    sc.eq('⭐⑤ ' + f + ' 의 덩어리가 원본과 같다 (다르면 ./tools/sync-there-dash.sh)', b === SRC, true);
  });
}
sc.done();
