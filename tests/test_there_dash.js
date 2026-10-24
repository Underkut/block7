// There 대시보드 덩어리(tools/there-dash.js) — 세 앱 기록을 한 모양으로 모으는 규칙 · 두 앱에 같은 글자로 들었는지.
//
// 지키는 것:
//  ① 갈래 넷 — BLOCK7 · Sweeter(app 칸) · 성경(src bible · bible-menu) · 기도노트
//  ② 옛 기록 — app 이 빈 BLOCK7/Sweeter 기록은 block7 · 기도노트 날 합계(s)만 있는 날은 '시간만 남은 기록' 한 줄
//  ③ 기도노트 ses 와 합계 s 를 **두 번 세지 않는다** (s 는 ses 를 이미 품고 있다)
//  ④ 날마다 합계 · 주(월요일부터) · 달 경계
//  ⑤ 덩어리가 index.html · index-dev.html · sweeter-dev.html · pray/index.html 에 원본과 같은 글자로 있다
//  ⑧ 전체 화면(아이폰): 시계 줄은 THERE 줄이 덮고 · 고정 영역 바탕은 양옆 여백까지 · 열린 동안 페이지 바탕/theme-color 는 대시보드 색, 닫으면 되돌림
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
// ⑥ Map 기도 — 한 번 누른 것(같은 시작 · 같은 이름)은 한 줄 · 합계(collect)에는 안 들어간다 (기도 지도 ses 안의 몫)
{
  const t0 = new Date(2026, 9, 15, 7, 5).getTime();
  const pray = { '2026-10-15': { s: 600, ses: [{ id: 's', t: t0, time: '07:00', d: 600, src: 'map' }],
    mp: [{ id: 'm1', a: t0, t: t0 + 120000, pid: 'p1', d: 60, n: '가나', k: '가족' }, { id: 'm2', a: t0, t: t0 + 120000, pid: 'p2', d: 60, n: '다라', k: '가족' },
         { id: 'm3', a: t0 + 200000, t: t0 + 260000, pid: 'p1', d: 60, n: '가나', k: '가나' }, null] } };
  const mp = T.mapPrayers(pray, '2026-10-15', '2026-10-15');
  sc.eq('⭐⑥ 가족 한 줄(두 이름 · 2분) + 가나 한 줄', mp.map(x => [x.k, x.names.join(','), x.d, x.time]), [['가족', '가나,다라', 120, '07:05'], ['가나', '가나', 60, '07:08']]);
  sc.eq('⭐⑥ 합계는 지도 There 그대로 (Map 기도를 다시 더하지 않는다)', T.collect({}, pray).reduce((a, x) => a + x.d, 0), 600);
  sc.eq('⑥ 기간 밖 · 옛 기록(mp 없음)은 빈 목록', [T.mapPrayers(pray, '2026-10-16', '2026-10-20').length, T.mapPrayers({ '2026-10-01': { s: 5 } }).length], [0, 0]);
}
// ⑦ 한 장 기도 카드(fc) — 이름 · 그룹 · 아멘 · 차례 · 합계에는 안 더한다 (O-2)
{
  const t0 = new Date(2026, 9, 19, 6, 30).getTime();
  const pray = { '2026-10-19': { s: 120, ses: [{ id: 'F', t: t0, time: '06:30', d: 120, src: 'focus' }],
    fc: [{ id: 'b', s: 'F', pid: 'p2', n: '다라', k: '가족', a: t0 + 40000, t: t0 + 50000, d: 10, amen: false },
         { id: 'a', s: 'F', pid: 'p1', n: '가나', k: '가족', a: t0, t: t0 + 40000, d: 40, amen: true }, null] } };
  const fc = T.focusPrayers(pray, '2026-10-19', '2026-10-19');
  sc.eq('⭐⑦ 처음 본 차례 · 이름 · 그룹 · 아멘', fc.map(x => [x.time, x.n, x.k, x.d, x.amen]), [['06:30', '가나', '가족', 40, true], ['06:30', '다라', '가족', 10, false]]);
  sc.eq('⭐⑦ 합계는 한 장 기도 시간 그대로', T.collect({}, pray).reduce((a, x) => a + x.d, 0), 120);
  sc.eq('⑦ 기간 밖 · fc 없는 날은 빈 목록', [T.focusPrayers(pray, '2026-10-20', '2026-10-21').length, T.focusPrayers({ '2026-10-01': { s: 3 } }).length], [0, 0]);
}
// ⑧ 전체 화면 — 아이폰 홈 화면 앱 사진 (HB 2026-10-25): 맨 위 구멍 · 큰 숫자 옆 '(' · 아래 띠 색
{
  const rule = sel => { const m = SRC.match(new RegExp('\\n' + sel.replace(/[.]/g, '\\.') + '\\{([^}]*)\\}')); return m ? m[1] : ''; };
  const ov = rule('.tdash-ov'), top = rule('.tdash-top'), stick = rule('.tdash-stick'), inn = rule('.tdash-in');
  sc.eq('⭐⑧ 덮개는 위를 비우지 않는다 (스크롤 여백은 내용과 함께 밀려 시계 줄 뒤로 달력이 비쳤다)', /safe-area-inset-top/.test(ov), false);
  sc.eq('⭐⑧ 시계 줄은 THERE 줄이 제 바탕으로 덮는다', /padding:calc\(10px \+ env\(safe-area-inset-top/.test(top) && /background:var\(--bg\)/.test(top), true);
  const pad = (inn.match(/padding:\S+ (\d+)px/) || [])[1];
  sc.eq('⭐⑧ 고정 영역 바탕은 양옆 여백까지 (안 칠하면 오늘 칸 테두리가 \'(\' 로 비쳤다)', [(stick.match(/margin:0 -(\d+)px/) || [])[1], (stick.match(/padding:0 (\d+)px/) || [])[1]], [pad, pad]);
  sc.eq('⑧ 열린 동안 html · body 바탕 = 대시보드 색 (!important — 앱의 body 바탕을 이긴다)', /html\.tdash-on,html\.tdash-on body\{background:#0d0e10 !important\}/.test(SRC), true);
  // pageTint 를 떼어 가짜 문서에서 돌린다
  const m = SRC.match(/  const TINT = [\s\S]*?\n  function pageTint\(on\) \{[\s\S]*?\n  \}\n/);
  const cls = new Set(), meta = { c: '#012f47', getAttribute() { return this.c; }, setAttribute(k, v) { this.c = v; } };
  let obs = null;
  const tc = { document: { documentElement: { classList: { toggle: (k, on) => on ? cls.add(k) : cls.delete(k) } }, querySelector: q => /theme-color/.test(q) ? meta : null },
    window: { MutationObserver: function (fn) { obs = { fn: fn, on: false }; this.observe = () => { obs.on = true; }; this.disconnect = () => { obs.on = false; }; } } };
  vm.createContext(tc);
  vm.runInContext((m ? m[0] : '') + '\nthis.pageTint = pageTint;', tc);
  tc.pageTint(true);
  sc.eq('⭐⑧ 열면 html.tdash-on · theme-color 대시보드 색', [cls.has('tdash-on'), meta.c], [true, '#0d0e10']);
  meta.c = '#123456'; if (obs && obs.on) obs.fn();   // 열린 사이 앱이 띠 색을 다시 맞춤(돌리기 등)
  sc.eq('⑧ 열린 사이 앱이 theme-color 를 고쳐도 다시 덮는다', meta.c, '#0d0e10');
  tc.pageTint(true); tc.pageTint(false);              // 열린 채 다시 열기(open 은 close(true) 먼저) → 닫기
  sc.eq('⭐⑧ 닫으면 앱이 마지막에 둔 색으로 되돌린다 · 감시도 멈춤', [cls.has('tdash-on'), meta.c, !!(obs && obs.on)], [false, '#123456', false]);
  sc.eq('⑧ open 은 칠하고 close 는 되돌린다', [/fit\(\); window\.addEventListener\('resize', fit\); ov\._fit = fit;\n    pageTint\(true\);/.test(SRC), /removeEventListener\('resize', ov\._fit\);\n    pageTint\(false\);/.test(SRC)], [true, true]);
}
sc.done();
