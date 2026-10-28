// There 대시보드 덩어리(tools/there-dash.js) — 세 앱 기록을 한 모양으로 모으는 규칙 · 두 앱에 같은 글자로 들었는지.
//
// 지키는 것:
//  ① 갈래 넷 — BLOCK7 · Sweeter(app 칸) · 성경(src bible · bible-menu) · 기도노트
//  ② 옛 기록 — app 이 빈 BLOCK7/Sweeter 기록은 block7 · 기도노트 날 합계(s)만 있는 날은 '시간만 남은 기록' 한 줄
//  ③ 기도노트 ses 와 합계 s 를 **두 번 세지 않는다** (s 는 ses 를 이미 품고 있다)
//  ④ 날마다 합계 · 주(월요일부터) · 달 경계
//  ⑤ 덩어리가 index.html · index-dev.html · sweeter-dev.html · pray/index.html 에 원본과 같은 글자로 있다
//  ⑨ 하루의 흐름(1028-3 6-2a) — 기도 한 번 아래 그 안의 이름(fc = 같은 sid · mp = 그 지도 There 시작 ~ 다음 지도 There 시작 전) · 남은 이름은 끝 한 줄 · 말씀 / 기도 두 갈래
//  ⑩ 잇달아 한 기도 합치기(HB 2026-10-29) — 같은 갈래가 사이에 다른 기록 없이 한 시간 안에 이어지면 한 줄 · 같은 이름은 한 칩
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
// ⑨ 하루의 흐름 (HB 1028-3 6-2a)
{
  const D = '2026-10-28', at = (h, m) => new Date(2026, 9, 28, h, m || 0).getTime();
  const there = { [D]: [{ ref: '시편 23:1', time: '07:55', t: at(7, 55), d: 840, app: 'block7', src: 'gnb' }, { ref: '', time: '21:30', t: at(21, 30), d: 360, app: 'sweeter', src: 'bible' }] };
  const pray = { [D]: { s: 840 + 360 + 120 + 600, ses: [
      { id: 'F1', t: at(5, 40), time: '05:40', d: 840, src: 'focus' },
      { id: 'M1', t: at(12, 30), time: '12:30', d: 360, src: 'map' },
      { id: 'M2', t: at(20, 0), time: '20:00', d: 120, src: 'map' },
      { id: 'X1', t: at(22, 10), time: '22:10', d: 600, src: 'manual' }],
    fc: [{ id: 'c2', s: 'F1', pid: 'b', n: '나래', k: '가족', a: at(5, 43), d: 130, amen: true }, { id: 'c1', s: 'F1', pid: 'a', n: '가람', k: '가족', a: at(5, 40), d: 180, amen: true },
         { id: 'c3', s: 'F1', pid: 'c', n: '다온', k: '청년부', a: at(5, 45), d: 20, amen: false }, { id: 'c9', s: 'OLD', pid: 'z', n: '하늘', k: '', a: at(4, 0), d: 30, amen: true }],
    mp: [{ id: 'm1', a: at(12, 31), t: at(12, 34), pid: 'd', d: 90, n: '마루', k: '청년부' }, { id: 'm2', a: at(12, 31), t: at(12, 34), pid: 'e', d: 90, n: '바다', k: '청년부' },
         { id: 'm3', a: at(20, 1), t: at(20, 2), pid: 'f', d: 60, n: '사랑', k: '사랑' }, { id: 'm0', a: at(11, 0), t: at(11, 1), pid: 'g', d: 30, n: '아라', k: '아라' }] } };
  const ss = T.collect(there, pray), fl = T.dayFlow(ss, pray, D);
  const top = r => r.x ? (r.x.app === 'pray' ? r.x.src : r.x.app) : '남은';
  sc.eq('⭐⑨ 말씀과 기도가 시간 순서 한 줄로', fl.map(r => (r.x ? r.x.time : '-') + ' ' + top(r)), ['05:40 focus', '07:55 block7', '12:30 map', '20:00 map', '21:30 bible', '22:10 manual', '- 남은']);
  sc.eq('⭐⑨ 한 장 기도 아래 같은 sid 카드 — 처음 본 차례', fl[0].kids.map(k => [k.kind, k.n, k.d, k.amen, k.ids.join()]), [['fc', '가람', 180, true, 'c1'], ['fc', '나래', 130, true, 'c2'], ['fc', '다온', 20, false, 'c3']]);
  sc.eq('⭐⑨ 지도 There 아래 그 시작부터 다음 지도 There 전까지 누른 것 (한 번 누른 것은 한 줄)', [fl[2].kids.map(k => [k.kind, k.n, k.names.join(','), k.d, k.ids.join()]), fl[3].kids.map(k => k.n)], [[['mp', '청년부', '마루,바다', 180, 'm1,m2']], ['사랑']]);
  sc.eq('⑨ 말씀 · 직접 적은 기도에는 이름이 없다', [fl[1].kids.length, fl[5].kids.length], [0, 0]);
  sc.eq('⭐⑨ 어느 기도에도 안 붙는 이름(지난 sid · 첫 지도 There 전에 누른 것)은 끝 한 줄로 — 버리지 않는다', fl[6].kids.map(k => k.n).sort(), ['아라', '하늘']);
  sc.eq('⑨ 합계는 그대로 (흐름은 다시 더하지 않는다)', ss.reduce((a, x) => a + x.d, 0), 840 + 360 + 840 + 360 + 120 + 600);
  sc.eq('⭐⑨ 말씀 / 기도 두 갈래 — 말씀 = BLOCK7 · Sweeter · 성경', T.wordPray(ss.filter(x => x.date === D)), { word: 1200, pray: 1920 });
  sc.eq('⑨ 기도노트 기록이 없는 날(BLOCK7 · Sweeter 만)', T.dayFlow(T.collect(there, {}), {}, D).map(r => r.kids.length), [0, 0]);
}
// ⑩ 잇달아 한 기도 합치기 (HB 2026-10-29 사진 — 한 장씩 기도하기가 네 번 줄줄이)
{
  const D = '2026-10-29', at = (h, m, s2) => new Date(2026, 9, 29, h, m || 0, s2 || 0).getTime();
  const pray = { [D]: { s: 0, ses: [
      { id: 'A', t: at(3, 51), time: '03:51', d: 20, src: 'focus' }, { id: 'B', t: at(4, 37), time: '04:37', d: 15, src: 'focus' },
      { id: 'C', t: at(4, 37, 30), time: '04:37', d: 12, src: 'focus' }, { id: 'M', t: at(9, 0), time: '09:00', d: 60, src: 'map' },
      { id: 'E', t: at(11, 0), time: '11:00', d: 30, src: 'focus' }],
    fc: [{ id: 'a', s: 'A', pid: 'x', n: '추수감사영상', a: at(3, 51), d: 4, amen: false }, { id: 'b', s: 'B', pid: 'y', n: '스캇', a: at(4, 37), d: 2, amen: false },
         { id: 'c', s: 'C', pid: 'y', n: '스캇', a: at(4, 37, 30), d: 3, amen: true }, { id: 'e', s: 'E', pid: 'y', n: '스캇', a: at(11, 0), d: 9, amen: true }] } };
  const there = { [D]: [{ ref: '시편 1:1', time: '10:00', t: at(10, 0), d: 60, app: 'block7', src: 'gnb' }] };
  const fl = T.mergeFlow(T.dayFlow(T.collect(there, pray), pray, D));
  sc.eq('⭐⑩ 한 시간 안에 이어진 한 장 기도 셋은 한 줄 · 사이에 말씀이 끼면 따로', fl.map(r => (r.x.app === 'pray' ? (r.x.ids || [r.x.id]).join('+') : '말씀') + ':' + r.x.d), ['A+B+C:47', 'M:60', '말씀:60', 'E:30']);
  sc.eq('⭐⑩ 합친 줄의 같은 이름은 한 칩 — 시간 합 · 아멘 하나라도 · 카드 id 모두', fl[0].kids.map(k => [k.n, k.d, k.amen, k.ids.join()]), [['추수감사영상', 4, false, 'a'], ['스캇', 5, true, 'b,c']]);
  sc.eq('⑩ 원래 줄은 그대로 (보여 주기만)', [pray[D].ses.length, fl[0].xs.length], [5, 3]);
  sc.eq('⑩ 한 시간 넘게 떨어지면 따로', T.mergeFlow(T.dayFlow(T.collect({}, pray), pray, D)).map(r => (r.x.ids || [r.x.id]).join('+')), ['A+B+C', 'M', 'E']);
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
