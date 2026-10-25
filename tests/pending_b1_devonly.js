// 설정 동기화 — 처음값 채우기 · 기기 전용 설정 (docs/ROADMAP.md '설정창 개선 · 동기화 충돌 정리' B-1 · B-2)
//
// B-2 (HB 2026-10-25): 늦게 새 버전이 된 기기가 '일정 이름 길이'(evChipMax) 를 처음값 12 로 덮어
//      다른 기기에서 정한 3 이 모든 기기에서 12 가 됐고, 충돌 화면에는 'evChipMax' 라는 코드 이름이 떴다.
//   까닭: 옛 버전으로 마지막에 맞춘 기기는 기준점(base)에 그 키가 없다. 새 버전으로 켜면
//        _settingsDefaults 가 12 를 채우고(편집이 아님), 3자 병합은 '기준에 없던 것을 양쪽이 서로 다르게
//        새로 만들었다' 로 읽어 손에 든 기기(12)를 고르고 충돌로 적는다.
//   지킬 것: **처음값으로 채운 값은 편집이 아니다** — 기준에 없던 키에서 한쪽이 처음값(또는 빈 칸)이면
//        다른 쪽을 따른다. 충돌로도 잡지 않는다. 사람이 고친 값끼리 부딪친 것은 예전대로 충돌이다.
//
// B-1: '지금 보는 말씀' · '말씀 마지막 표시 날짜' 는 v26-0828-7 부터 기기 전용이다(_DEVICE_SCOPED —
//      올릴 때 클라우드 값을 되돌리고, 받을 때 이 기기 값으로 덮는다). 그런데 충돌 판정은 이 기기 값(ST)을
//      클라우드의 멈춘 값과 견줘서, 클라우드의 그 칸이 한 번이라도 움직이면(강제 올리기 · 백업 복원)
//      모든 기기에 충돌이 떴다. 지킬 것: 기기 전용 칸은 **충돌이 될 수 없다.**
//
// ⚠️ B-1 을 고칠 때 이 시나리오를 tests/test_setting_fill.js 로 되돌린다 (지금은 실패하는 게 맞다 — check.sh 가 돌리지 않는다).
// 진짜 끝까지(브라우저 두 대 + 에뮬레이터)는 tests/e2e/b7_setting_late.js.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {}, getElementById: () => null };
global.window = {};
const LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};
let LS_KEY = 'b7v1';
function _lsk(name) { return LS_KEY + '_' + name; }
global._lsk = _lsk;

eval(slice('const _settingsDefaults=', '\nObject.keys(_settingsDefaults)')
   + '\n' + slice('const _DEVICE_SCOPED=[', 'function _psIsDefault()')
   + '\n' + slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
   + `\nglobal.M = { defaults: _settingsDefaults, devKeys: _DEVICE_SCOPED,
        merge: _fbMerge, detect: _cfDetect, setLabel: _dfSetLabel };`);

const clone = o => JSON.parse(JSON.stringify(o));
const OPTS = { localDeviceId: 'dev-b', remoteDeviceId: 'dev-a', now: 1700000000000 };
const run = (base, local, cloud, pc) => {
  const merged = M.merge(base, local, cloud, pc);
  return { merged, list: M.detect(base, local, cloud, merged, OPTS) };
};
const ids = r => r.list.map(x => x.entityId);

// ═══ 8. ⭐ B-1 — 기기 전용 칸은 충돌이 될 수 없다 ═══
//     클라우드의 멈춘 값이 7 → 50 으로 움직였다(다른 기기의 강제 올리기). 이 기기는 제 자리 81.
console.log('\n시나리오 8 — 기기 전용 칸');
{
  M.devKeys.forEach(k => {
    const v = { verseCurrentIdx: [7, 81, 50], verseLastShownDate: ['2026-10-20', '2026-10-25', '2026-10-24'],
                verseLastShownSec: ['2026-10-20@am', '2026-10-25@pm', '2026-10-24@night'] }[k] || [1, 2, 3];
    const r = run({ settings: { [k]: v[0] } }, { settings: { [k]: v[1] } }, { settings: { [k]: v[2] } });
    sc.eq(`⭐ ${M.setLabel(k)} — 충돌 아님`, ids(r), []);
    // 클라우드에서 그 칸이 아예 없어진 경우도 (처음 올리는 계정 · 옛 백업)
    const r2 = run({ settings: { [k]: v[0] } }, { settings: { [k]: v[1] } }, { settings: {} });
    sc.eq(`${M.setLabel(k)} — 클라우드에서 사라져도 충돌 아님`, ids(r2), []);
  });
  sc.eq('⭐ 말씀 마지막 표시 구간도 기기 전용 (그 기기 말씀 자리와 짝)', M.devKeys.includes('verseLastShownSec'), true);
  // 다른 설정은 예전처럼 충돌로 잡힌다
  const r = run({ settings: { theme: 'dark' } }, { settings: { theme: 'light' } }, { settings: { theme: 'system' } });
  sc.eq('기기 전용이 아닌 설정은 예전처럼 충돌', ids(r), ['settings/theme']);
}

sc.done();
