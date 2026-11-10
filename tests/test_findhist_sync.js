// 성경 검색어 기록 기기 간 동기화 (v. 26-1110-8, HB)
// 저장: ST.settings.bibleFindHist = { "검색어": ms }  (ms 가 음수면 '지운 표' — 그 시각에 지웠다)
// 지킬 것:
//  ① 두 기기가 각자 새 검색어를 남기면 합쳐진다 (한쪽이 다른 쪽을 지우지 않는다)
//  ② 같은 검색어는 더 최근 시각이 이긴다
//  ③ 한 기기에서 지운 검색어는 다른 기기에서 되살아나지 않는다 (그 뒤에 다시 쓰면 살아난다)
//  ④ 두 기기가 모두 바꿔도 충돌 화면에 뜨지 않는다 (검색어는 사람이 다툴 값이 아니다)
//  ⑤ 목록으로 읽을 때: 최근 순, 지운 표 제외, 50개 상한
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {}, getElementById: () => null };
global.window = {};
const LS = {};
global.localStorage = { getItem: k => (k in LS ? LS[k] : null), setItem: (k, v) => { LS[k] = String(v); }, removeItem: k => { delete LS[k]; } };
let LS_KEY = 'b7v1';
global._lsk = name => LS_KEY + '_' + name;
global._brS = (k, d) => d;
global._brFHRender = () => {};
eval(slice('const _settingsDefaults=', '\nObject.keys(_settingsDefaults)')
   + '\n' + slice('const _DEVICE_SCOPED=[', 'function _psIsDefault()')
   + '\n' + slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
   + '\n' + slice('// ── 지난 검색어', '// ── 검색 ──').replace(/\nfunction _brFHRender[\s\S]*$/, '')
   + `\nglobal.M = { merge: _fbMerge, detect: _cfDetect, mgFH: _mgFindHist, list: _brFHList, put: _brFHPut, del: _brFHDel };`);
const OPTS = { localDeviceId: 'dev-b', remoteDeviceId: 'dev-a', now: 1700000000000 };
const run = (base, local, cloud) => { const merged = M.merge(base, local, cloud, false); return { merged, list: M.detect(base, local, cloud, merged, OPTS) }; };

console.log('시나리오 1 — 두 기기가 각자 새 검색어');
{
  const base = { settings: { bibleFindHist: { 사랑: 100 } } };
  const local = { settings: { bibleFindHist: { 사랑: 100, 은혜: 200 } } };
  const cloud = { settings: { bibleFindHist: { 사랑: 100, 평강: 300 } } };
  const r = run(base, local, cloud);
  sc.eq('⭐ 양쪽 검색어가 함께 남는다', Object.keys(r.merged.settings.bibleFindHist).sort(), ['사랑', '은혜', '평강']);
  sc.eq('⭐ 충돌 화면에 뜨지 않는다', r.list.length, 0);
}
console.log('시나리오 2 — 같은 검색어는 최근 시각');
{
  const r = run({ settings: { bibleFindHist: { 사랑: 100 } } }, { settings: { bibleFindHist: { 사랑: 500 } } }, { settings: { bibleFindHist: { 사랑: 300 } } });
  sc.eq('더 최근(500)', r.merged.settings.bibleFindHist['사랑'], 500);
}
console.log('시나리오 3 — 지운 검색어는 되살아나지 않는다');
{
  const base = { settings: { bibleFindHist: { 사랑: 100, 은혜: 200 } } };
  const local = { settings: { bibleFindHist: { 사랑: 100, 은혜: -400 } } };     // 이 기기에서 '은혜' 를 400 에 지움
  const cloud = { settings: { bibleFindHist: { 사랑: 100, 은혜: 200 } } };
  let r = run(base, local, cloud);
  sc.eq('⭐ 지운 표가 이긴다', r.merged.settings.bibleFindHist['은혜'], -400);
  // 다른 기기가 그 뒤(500)에 다시 쓰면 살아난다
  r = run(base, local, { settings: { bibleFindHist: { 사랑: 100, 은혜: 500 } } });
  sc.eq('지운 뒤에 다시 쓴 것은 산다', r.merged.settings.bibleFindHist['은혜'], 500);
}
console.log('시나리오 4 — 한쪽에만 있는 칸 · 빈 칸');
{
  let r = run({ settings: {} }, { settings: { bibleFindHist: { 사랑: 1 } } }, { settings: {} });
  sc.eq('클라우드에 없으면 이 기기 것', r.merged.settings.bibleFindHist, { 사랑: 1 });
  r = run({ settings: {} }, { settings: { bibleFindHist: {} } }, { settings: { bibleFindHist: { 사랑: 1 } } });
  sc.eq('이 기기가 빈 칸이어도 클라우드 것을 지우지 않는다', r.merged.settings.bibleFindHist, { 사랑: 1 });
  r = run(null, { settings: { bibleFindHist: { 가: 1 } } }, { settings: { bibleFindHist: { 나: 2 } } });
  sc.eq('기준을 몰라도 합친다', Object.keys(r.merged.settings.bibleFindHist).sort(), ['가', '나']);
}
console.log('시나리오 5 — 목록 읽기 · 쓰기 · 지우기');
{
  global.ST = { settings: {} };
  global.save = () => {};
  const now = Date.now;
  let t = 1000; Date.now = () => ++t;
  M.put('사랑'); M.put('은혜'); M.put('사랑');
  sc.eq('최근 순 · 같은 말은 한 번', M.list(), ['사랑', '은혜']);
  M.del('사랑');
  sc.eq('지우면 목록에서 빠진다', M.list(), ['은혜']);
  sc.eq('지운 표는 음수로 남는다', ST.settings.bibleFindHist['사랑'] < 0, true);
  M.put('사랑');
  sc.eq('다시 쓰면 살아난다', M.list()[0], '사랑');
  for (let i = 0; i < 60; i++) M.put('말' + i);
  sc.eq('보이는 것은 50개까지', M.list().length, 50);
  sc.eq('가장 최근이 맨 앞', M.list()[0], '말59');
  sc.eq('저장 칸은 무한히 자라지 않는다 (산 것 50 + 지운 표 50 이하)', Object.keys(ST.settings.bibleFindHist).length <= 100, true);
  Date.now = now;
}
sc.done();
