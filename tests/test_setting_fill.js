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

// ═══ 1. ⭐ HB 의 그 일 — 늦게 새 버전이 된 기기가 처음값 12 를 들고 온다 ═══
console.log('시나리오 1 — 기준에 없던 키 · 이 기기는 처음값 · 다른 기기는 사람이 정한 값');
{
  const base  = { settings: { theme: 'dark' } };                    // 옛 버전 시절 기준점 — evChipMax 를 모른다
  const local = { settings: { theme: 'dark', evChipMax: 12 } };     // 새 버전이 채운 처음값
  const cloud = { settings: { theme: 'dark', evChipMax: 3 } };      // 맥에서 HB 가 정한 3
  const r = run(base, local, cloud);
  sc.eq('⭐ 사람이 정한 3 을 따른다', r.merged.settings.evChipMax, 3);
  sc.eq('⭐ 충돌로 잡지 않는다', ids(r), []);
  sc.eq('다른 설정은 그대로', r.merged.settings.theme, 'dark');
}

// ═══ 2. 반대 방향 — 처음값을 클라우드가 들고 있다 ═══
//     (다른 늦은 기기가 먼저 12 를 올렸고, 이 기기는 그 키를 기준에 갖기 전에 3 으로 바꿨다)
console.log('\n시나리오 2 — 처음값은 클라우드 쪽, 이 기기는 사람이 정한 값');
{
  const base  = { settings: {} };
  const local = { settings: { evChipMax: 3 } };
  const cloud = { settings: { evChipMax: 12 } };
  for (const pc of [false, true]) {
    const r = run(base, local, cloud, pc);
    sc.eq(`이 기기의 3 을 지킨다 (클라우드 우선=${pc})`, r.merged.settings.evChipMax, 3);
    sc.eq(`충돌 아님 (클라우드 우선=${pc})`, ids(r), []);
  }
}

// ═══ 3. ⭐ 전수 — _settingsDefaults 의 모든 키에 같은 구멍이 있는가 ═══
//     처음값이 아닌 값을 하나 지어 클라우드에 두고, 이 기기는 처음값을 든다.
console.log('\n시나리오 3 — 처음값 채우기가 있는 모든 설정');
{
  const other = d => {
    if (d === null) return 'x';
    if (typeof d === 'boolean') return !d;
    if (typeof d === 'number') return d + 1;
    if (typeof d === 'string') return d + '_다른값';
    if (Array.isArray(d)) return d.concat(['다른값']);
    return Object.assign({}, d, { _다른값: 1 });
  };
  const keys = Object.keys(M.defaults).filter(k => !M.devKeys.includes(k));
  const lost = [], noisy = [];
  keys.forEach(k => {
    const d = M.defaults[k], o = other(d);
    const r = run({ settings: {} }, { settings: { [k]: clone(d) } }, { settings: { [k]: o } });
    if (JSON.stringify(r.merged.settings[k]) !== JSON.stringify(o)) lost.push(k);
    if (r.list.length) noisy.push(k);
  });
  console.log(`    (견준 설정 ${keys.length}개)`);
  sc.eq('⭐ 사람이 정한 값을 잃는 설정 없음', lost, []);
  sc.eq('⭐ 충돌로 잡히는 설정 없음', noisy, []);
}

// ═══ 4. 화면을 그리며 빈 칸으로 채우는 설정 ═══
//     _settingsDefaults 밖에서 `if(!ST.settings.x)ST.settings.x={}` 로 채우는 것들.
console.log('\n시나리오 4 — 빈 칸 채우기 ({})');
{
  ['collFilters', 'bibleHistHide', 'rpWidgetHeights', 'vListPrefs', 'sectionConfigs'].forEach(k => {
    const cloudVal = { 무엇: 1 };
    const r = run({ settings: {} }, { settings: { [k]: {} } }, { settings: { [k]: cloudVal } });
    sc.eq(`${k}: 클라우드 것을 지우지 않는다`, r.merged.settings[k], cloudVal);
    sc.eq(`${k}: 충돌 아님`, ids(r), []);
  });
}

// ═══ 5. 바뀌면 안 되는 것 — 사람이 고친 값끼리는 예전대로 ═══
console.log('\n시나리오 5 — 진짜 충돌 · 평범한 변경은 그대로');
{
  // 기준에 없던 키를 양쪽이 **각자 사람이** 다르게 정했다 → 충돌 (예전 그대로)
  let r = run({ settings: {} }, { settings: { evChipMax: 5 } }, { settings: { evChipMax: 3 } });
  sc.eq('둘 다 처음값이 아니면 충돌로 남긴다', ids(r), ['settings/evChipMax']);
  sc.eq('그때는 손에 든 기기 (예전 그대로)', r.merged.settings.evChipMax, 5);
  // 기준이 3 을 안다 → 이 기기가 12 로 **옮긴 것**은 사람의 편집이다 (처음값과 같아도)
  r = run({ settings: { evChipMax: 3 } }, { settings: { evChipMax: 12 } }, { settings: { evChipMax: 3 } });
  sc.eq('기준을 아는 키에서 처음값으로 옮긴 것은 지킨다', r.merged.settings.evChipMax, 12);
  sc.eq('충돌 아님 (한쪽만 바꿈)', ids(r), []);
  // 기준 12 · 클라우드 3 · 이 기기 12 → 상대 것
  r = run({ settings: { evChipMax: 12 } }, { settings: { evChipMax: 12 } }, { settings: { evChipMax: 3 } });
  sc.eq('상대만 바꿈 → 상대 것', r.merged.settings.evChipMax, 3);
  // 한쪽에만 있는 키 — 예전처럼 있는 쪽
  r = run({ settings: {} }, { settings: { evChipMax: 12 } }, { settings: {} });
  sc.eq('클라우드에 없는 키는 이 기기 것이 올라간다', r.merged.settings.evChipMax, 12);
}

// ═══ 6. 기준점을 모르는 복구 경로 (옛 버전 기기가 덮어쓴 문서 · base=null) ═══
console.log('\n시나리오 6 — 기준점 없이 합칠 때도');
{
  const r = run(null, { settings: { evChipMax: 12 } }, { settings: { evChipMax: 3 } }, false);
  sc.eq('⭐ 이 기기 우선이어도 처음값은 사람이 정한 값에 진다', r.merged.settings.evChipMax, 3);
  const r2 = run(null, { settings: { evChipMax: 5 } }, { settings: { evChipMax: 3 } }, false);
  sc.eq('둘 다 사람이 정한 값이면 예전처럼 이 기기', r2.merged.settings.evChipMax, 5);
}

// ═══ 7. Sweeter 몫 (productSettings.sweeter.*) 도 같은 규칙 ═══
console.log('\n시나리오 7 — 제품별 설정 칸');
{
  const base  = { productSettings: { sweeter: {} } };
  const local = { productSettings: { sweeter: { vfTextScale: 0.6 } } };   // Sweeter 늦은 기기의 처음값
  const cloud = { productSettings: { sweeter: { vfTextScale: 0.8 } } };
  const r = run(base, local, cloud);
  sc.eq('⭐ Sweeter 에서 정한 0.8 을 따른다', r.merged.productSettings.sweeter.vfTextScale, 0.8);
}

// ═══ 8. B-1(기기 전용 칸) 시나리오는 HB 확인 전이라 tests/pending_b1_devonly.js 에 따로 둔다 ═══

// ═══ 9. 충돌 화면 이름 — 코드 이름이 아니라 설정창에 쓰는 이름 ═══
console.log('\n시나리오 9 — 설정 이름표');
{
  sc.eq('⭐ evChipMax → 설정창 이름', M.setLabel('evChipMax'), '일정 이름 길이');
  const r = run({ settings: {} }, { settings: { evChipMax: 5 } }, { settings: { evChipMax: 3 } });
  sc.eq('충돌 기록의 이름도', (r.list[0] || {}).label, '설정 · 일정 이름 길이');
  // 전수 — 처음값이 있는 모든 설정이 우리말 이름을 갖는다 (영문 키가 그대로 보이면 안 된다)
  const raw = Object.keys(M.defaults).filter(k => /[A-Za-z]{3,}/.test(M.setLabel(k).replace(/Deeper|Even|Glow|Ripple|BLOCK7|SNS/g, '')));
  sc.eq('⭐ 코드 이름이 그대로 보이는 설정 없음', raw, []);
  sc.eq('표에 없는 키는 키 그대로 (지어내지 않는다)', M.setLabel('somethingNew'), 'somethingNew');
}

sc.done();
