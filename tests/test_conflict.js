// 충돌 격리 (v26-0828-6) — 진짜 충돌만 골라내고, 진 쪽을 잃지 않는다
//
// ⚠️ 병합은 그대로 둔 채(동작을 바꾸지 않는다) **진 쪽을 항목 단위로 보관**한다.
//    그래서 이 파일이 지키는 성질은 두 가지다:
//      ① 자동으로 합쳐지는 것은 **충돌로 잡히지 않는다** (안 그러면 매번 팝업이 뜬다)
//      ② 진짜 충돌은 base·이 기기·다른 기기 세 벌이 전부 남는다
//
// ⚠️ 병합 엔진은 개발본(index-dev.html)에서 떠온다. 운영본은 HB 확인 전까지
//    커밋되지 않기 때문이다 (CLAUDE.md 규칙).
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {}, getElementById: () => null };
global.window = {};
const LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};
global.APP_VERSION = 'v. 26-0828-6';
global.showToast = () => {};
global._deviceId = () => 'dev-mac';
global._deviceLabel = () => '맥';
global.ST = {};
global.save = () => {};
global.renderToday = () => {};
global.syncSecsFromState = () => {};
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
   + '\n' + sliceDev('// ── 충돌 보관 · 화면 ──', 'window.fbPushState=function(){')
   + `\nglobal.S = {
        store: _cfStore,
        list: () => _cfList,
        setList: v => { _cfList = v; },
        openCount: _cfOpenCount,
        explain: _cfExplain,
        nice: _cfNiceLabel,
        group: _cfGroupName,
        trimmed: _cfTrimmed,
        saveLocal: _cfSaveLocal,
        loadLocal: _cfLoadLocal,
        maxChars: _CF_MAX_CHARS
      };`);

const clone = o => JSON.parse(JSON.stringify(o));
const day = arr => ({ big: { am: arr }, small: {}, trash: [] });
const OPTS = { localDeviceId: 'dev-mac', remoteDeviceId: 'dev-iphone',
               localDeviceLabel: '맥', remoteDeviceLabel: '아이폰',
               appVersion: 'v. 26-0828-6', baseVersion: 10, localVersion: 10,
               remoteVersion: 11, now: 1700000000000 };
function detect(base, local, cloud, opts) {
  const merged = _fbMerge(base, local, cloud);
  return { list: _cfDetect(base, local, cloud, merged, Object.assign({}, OPTS, opts || {})), merged };
}

// ═══ 1. ⚠️ 자동으로 합쳐지는 것은 충돌이 아니다 ═══
//     이게 깨지면 기기를 옮길 때마다 충돌 화면이 떠서 아무도 안 쓴다.
console.log('시나리오 1 — 각자 새 할일을 더한 것은 충돌이 아니다');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am.push({ text: '맥' });
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: '폰' });
  const r = detect(base, local, cloud);
  sc.eq('충돌 없음', r.list.length, 0);
  sc.eq('둘 다 살아 있다', r.merged.days['2026-08-28'].big.am.length, 3);
}

// ═══ 2. 같은 할일의 다른 칸도 충돌이 아니다 (자동 병합됨) ═══
console.log('\n시나리오 2 — 같은 할일의 다른 칸은 충돌이 아니다');
{
  const base = { days: { '2026-08-28': day([{ text: '심방', done: false, star: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].done = true;
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].star = true;
  const r = detect(base, local, cloud);
  sc.eq('충돌 없음', r.list.length, 0);
}

// ═══ 3. 같은 할일의 **같은 칸**을 다르게 고치면 충돌 ═══
console.log('\n시나리오 3 — 같은 칸을 서로 다르게 고침');
{
  const base = { days: { '2026-08-28': day([{ text: '심방', done: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].done = true;
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].done = 'later';
  const r = detect(base, local, cloud);
  sc.eq('한 건 잡힌다', r.list.length, 1);
  const c = r.list[0];
  sc.eq('칸 단위다', c.entityType, 'task-field');
  sc.eq('어느 칸인지 안다', c.field, 'done');
  sc.eq('기준 값 보관', c.base, false);
  sc.eq('이 기기 값 보관', c.local, true);
  sc.eq('다른 기기 값 보관', c.remote, 'later');
  sc.eq('기기 이름도 남는다', [c.localDeviceLabel, c.remoteDeviceLabel], ['맥', '아이폰']);
  sc.eq('되살릴 원본이 있다', !!c.restore && c.restore.remote === 'later', true);
  sc.eq('아직 안 골랐다', [c.choice, c.resolvedAt], [null, null]);
}

// ═══ 4. 제목이 서로 다르면 항목 통째로 충돌 ═══
console.log('\n시나리오 4 — 같은 자리, 제목이 서로 다름');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0] = { text: 'A-맥' };
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0] = { text: 'A-폰' };
  const r = detect(base, local, cloud);
  sc.eq('한 건', r.list.length, 1);
  sc.eq('항목 단위', r.list[0].entityType, 'task');
  sc.eq('둘 다 보관', [r.list[0].local.text, r.list[0].remote.text], ['A-맥', 'A-폰']);
}

// ═══ 5. ⚠️ 삭제 대 수정 — 자동 병합이 물러서는 자리 ═══
console.log('\n시나리오 5 — 한쪽은 지우고 한쪽은 더함 (구간 통째로 충돌)');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }, { text: 'B' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am = [{ text: 'A' }];
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: 'C' });
  const r = detect(base, local, cloud);
  sc.eq('한 건', r.list.length, 1);
  sc.eq('구간 단위', r.list[0].entityType, 'section');
  sc.eq('지운 쪽·더한 쪽이 다 남는다',
    [r.list[0].local.length, r.list[0].remote.length], [1, 3]);
  sc.eq('요약에 지운 수가 있다', r.list[0].summary.removed >= 1, true);
}

// ═══ 6. 설정 충돌 ═══
console.log('\n시나리오 6 — 같은 설정을 서로 다르게');
{
  const base = { settings: { theme: 'dark', bigLimit: 7 } };
  const local = clone(base); local.settings.theme = 'light';
  const cloud = clone(base); cloud.settings.theme = 'sepia';
  const r = detect(base, local, cloud);
  sc.eq('한 건', r.list.length, 1);
  sc.eq('설정 단위', r.list[0].entityType, 'setting');
  sc.eq('키를 안다', r.list[0].entityId, 'settings/theme');
  sc.eq('양쪽 값 보관', [r.list[0].local, r.list[0].remote], ['light', 'sepia']);
}

// ═══ 7. 한쪽만 바꾼 설정은 충돌 아님 ═══
console.log('\n시나리오 7 — 한쪽만 바꾼 설정');
{
  const base = { settings: { theme: 'dark' } };
  const local = clone(base);
  const cloud = clone(base); cloud.settings.theme = 'light';
  sc.eq('충돌 없음', detect(base, local, cloud).list.length, 0);
}

// ═══ 8. 말씀 모음 · 연락처는 id 로 본다 ═══
console.log('\n시나리오 8 — 같은 모음을 양쪽에서 다르게');
{
  const base = { verseCollections: [{ id: 'v1', name: '아침', verses: [] }] };
  const local = clone(base); local.verseCollections[0].name = '아침 묵상';
  const cloud = clone(base); cloud.verseCollections[0].name = '새벽';
  const r = detect(base, local, cloud);
  sc.eq('한 건', r.list.length, 1);
  sc.eq('모음 단위', r.list[0].entityType, 'collection');
  sc.eq('이름이 라벨에 나온다', r.list[0].label, '아침 묵상');
}

// ═══ 9. 대량 손실은 충돌로 잡힌다 ═══
console.log('\n시나리오 9 — 병합 결과가 클라우드 것을 절반 넘게 지움');
{
  const mk = n => { const o = { days: {} }; for (let i = 0; i < n; i++)
    o.days['2026-08-' + String(i + 1).padStart(2, '0')] = day([{ text: 't' + i }]); return o; };
  const base = mk(10);
  const cloud = mk(10);
  const local = { days: {} };                       // 이 기기는 거의 비었다
  local.days['2026-08-01'] = day([{ text: 't0' }]);
  const merged = _fbMerge(base, local, cloud);      // base 를 알므로 삭제로 읽힌다
  const list = _cfDetect(base, local, cloud, merged, OPTS);
  sc.eq('대량 손실이 잡힌다', list.some(c => c.entityType === 'bulk'), true);
}

// ═══ 10. 옛 기기가 구조를 줄이면 잡힌다 ═══
console.log('\n시나리오 10 — 옛 버전이 쓴 문서가 줄어 있음');
{
  const mk = n => { const o = { days: {} }; for (let i = 0; i < n; i++)
    o.days['2026-08-' + String(i + 1).padStart(2, '0')] = day([{ text: 't' + i }]); return o; };
  const base = mk(10), local = mk(10), cloud = mk(2);
  const merged = _fbMerge(base, local, cloud);
  const list = _cfDetect(base, local, cloud, merged, Object.assign({ legacy: true }, OPTS));
  sc.eq('구조 축소가 잡힌다', list.some(c => c.entityType === 'shrink'), true);
}

// ═══ 11. base 를 모르면 판정하지 않는다 (첫 로그인·복구 경로) ═══
console.log('\n시나리오 11 — base 없음');
{
  const local = { days: { '2026-08-28': day([{ text: 'L' }]) } };
  const cloud = { days: { '2026-08-28': day([{ text: 'C' }]) } };
  sc.eq('충돌 없음', _cfDetect(null, local, cloud, cloud, OPTS).length, 0);
}

// ═══ 12. 같은 충돌은 같은 번호를 갖는다 (두 번 쌓이지 않게) ═══
console.log('\n시나리오 12 — 같은 자리의 충돌은 번호가 같다');
{
  const base = { settings: { theme: 'dark' } };
  const local = clone(base); local.settings.theme = 'light';
  const cloud = clone(base); cloud.settings.theme = 'sepia';
  const a = detect(base, local, cloud).list[0];
  const b = detect(base, local, cloud).list[0];
  sc.eq('번호가 같다', a.conflictId, b.conflictId);
  sc.eq('번호 모양', a.conflictId, 'setting:settings/theme');
}

// ═══ 13. 사람이 고른 것을 상태에 적용한다 ═══
console.log('\n시나리오 13 — 고른 대로 적용');
{
  const base = { days: { '2026-08-28': day([{ text: 'A', done: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].done = true;
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].done = 'later';
  const rec = detect(base, local, cloud).list[0];

  const s1 = clone(local);
  sc.eq('이 기기 선택', (_cfApply(s1, rec, 'local'), s1.days['2026-08-28'].big.am[0].done), true);
  const s2 = clone(local);
  sc.eq('다른 기기 선택', (_cfApply(s2, rec, 'remote'), s2.days['2026-08-28'].big.am[0].done), 'later');
  sc.eq('칸 하나는 합칠 수 없다', _cfCanMerge(rec), false);
}

// ═══ 14. "양쪽 변경 합치기" — 아무것도 잃지 않는 선택 ═══
console.log('\n시나리오 14 — 합치기');
{
  // 구간 통째 충돌(삭제 대 수정)에서 합치면 양쪽 항목이 다 남는다
  const base = { days: { '2026-08-28': day([{ text: 'A' }, { text: 'B' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am = [{ text: 'A' }];
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: 'C' });
  const rec = detect(base, local, cloud).list[0];
  sc.eq('합칠 수 있는 종류다', _cfCanMerge(rec), true);
  const s = clone(local);
  _cfApply(s, rec, 'merge');
  sc.eq('세 개가 다 남는다', s.days['2026-08-28'].big.am.map(t => t.text), ['A', 'B', 'C']);

  // 항목 통째 충돌에서 합치면 자리 하나가 둘로 늘어난다
  const base2 = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const l2 = clone(base2); l2.days['2026-08-28'].big.am[0] = { text: 'A-맥' };
  const c2 = clone(base2); c2.days['2026-08-28'].big.am[0] = { text: 'A-폰' };
  const rec2 = detect(base2, l2, c2).list[0];
  const s2 = clone(l2);
  _cfApply(s2, rec2, 'merge');
  sc.eq('둘 다 남는다', s2.days['2026-08-28'].big.am.map(t => t.text), ['A-맥', 'A-폰']);
}

// ═══ 15. 모음은 합치면 상대 것이 새 id 로 덧붙는다 (덮어쓰지 않는다) ═══
console.log('\n시나리오 15 — 모음 합치기');
{
  const base = { verseCollections: [{ id: 'v1', name: '아침', verses: [] }] };
  const local = clone(base); local.verseCollections[0].name = '아침 묵상';
  const cloud = clone(base); cloud.verseCollections[0].name = '새벽';
  const rec = detect(base, local, cloud).list[0];
  const s = clone(local);
  _cfApply(s, rec, 'merge');
  sc.eq('둘이 된다', s.verseCollections.length, 2);
  sc.eq('이름이 둘 다 남는다', s.verseCollections.map(v => v.name), ['아침 묵상', '새벽']);
  sc.eq('id 가 겹치지 않는다', s.verseCollections[0].id !== s.verseCollections[1].id, true);
}

// ═══ 16. 보관 개수에 상한이 있다 (기기가 폭주해도 문서가 커지지 않게) ═══
console.log('\n시나리오 16 — 보관 개수 상한');
{
  const base = { settings: {} }, local = { settings: {} }, cloud = { settings: {} };
  for (let i = 0; i < 200; i++) { base.settings['k' + i] = 0; local.settings['k' + i] = 1; cloud.settings['k' + i] = 2; }
  const list = _cfDetect(base, local, cloud, _fbMerge(base, local, cloud), OPTS);
  sc.eq('상한을 넘지 않는다', list.length <= 50, true);
}

// ═══ 17. 같은 충돌이 두 번 들어와도 한 건으로 보관된다 ═══
console.log('\n시나리오 17 — 같은 충돌을 두 번 만나도 한 건');
{
  S.setList([]);
  const base = { settings: { theme: 'dark' } };
  const local = clone(base); local.settings.theme = 'light';
  const cloud = clone(base); cloud.settings.theme = 'sepia';
  const l1 = detect(base, local, cloud).list;
  sc.eq('처음엔 새로 쌓인다', S.store(l1), 1);
  sc.eq('두 번째는 안 쌓인다', S.store(detect(base, local, cloud).list), 0);
  sc.eq('보관은 한 건', S.list().length, 1);
}

// ═══ 18. ⚠️ 사람이 이미 정한 것은 다시 묻지 않는다 ═══
console.log('\n시나리오 18 — 정한 충돌은 다시 열리지 않는다');
{
  S.setList([]);
  const base = { settings: { theme: 'dark' } };
  const local = clone(base); local.settings.theme = 'light';
  const cloud = clone(base); cloud.settings.theme = 'sepia';
  S.store(detect(base, local, cloud).list);
  S.list()[0].choice = 'local'; S.list()[0].resolvedAt = Date.now();
  S.store(detect(base, local, cloud).list);          // 같은 충돌이 또 왔다
  sc.eq('여전히 한 건', S.list().length, 1);
  sc.eq('정한 상태가 유지된다', S.list()[0].choice, 'local');
  sc.eq('열린 충돌은 없다', S.openCount(), 0);
}

// ═══ 19. 문서가 커지면 자른다 (저장이 통째로 실패하지 않게) ═══
console.log('\n시나리오 19 — 크기 상한');
{
  const big = 'x'.repeat(40000);
  const mk = (i, resolved) => ({ conflictId: 'c' + i, entityType: 'setting',
    entityId: 'settings/k' + i, base: big, local: big, remote: big,
    choice: resolved ? 'local' : null, resolvedAt: resolved ? 1 : null });
  const list = [];
  for (let i = 0; i < 10; i++) list.push(mk(i, i < 5));   // 앞 5건은 이미 정한 것
  S.setList(list);
  const t = S.trimmed();
  sc.eq('글자 수 상한 아래로 줄인다', JSON.stringify(t).length <= S.maxChars, true);
  sc.eq('아직 안 정한 것이 살아남는다', t.every(r => !r.resolvedAt), true);
  sc.eq('전부 버리지는 않는다', t.length > 0, true);
}

// ═══ 20. 이 기기 저장소를 오갈 수 있다 ═══
console.log('\n시나리오 20 — 기기 저장소 왕복');
{
  S.setList([{ conflictId: 'z1', entityType: 'setting', entityId: 'settings/x',
               base: 1, local: 2, remote: 3, choice: null, resolvedAt: null }]);
  S.saveLocal();
  sc.eq('다시 읽으면 그대로', S.loadLocal()[0].conflictId, 'z1');
}

// ═══ 21. 화면에 무엇이 적히나 — 값 통짜가 아니라 "무엇을 했는지" (v26-0904-11) ═══
// ⚠️ 예전에는 값 두 벌을 JSON 으로 뿌려서, 사람이 다르다는 것만 알 뿐 고를 수가
//    없었다 (2026-09-04 HB 지적). 이제는 기기마다 한 일을 한 줄씩 적는다.
console.log('\n시나리오 21 — 고를 수 있게 풀어 쓴다');
{
  const has = (arr, ...f) => arr.some(l => f.every(x => l.includes(x)));

  // 설정 덩어리 — 달라진 자리만 짚는다
  const rec = { entityType: 'setting', entityId: 'settings/verseCards',
    base: { c1: { view: 'list' }, c2: { view: 'list' } },
    local: { c1: { view: 'list' }, c2: { view: 'card' } },
    remote: { c1: { view: 'grid' }, c2: { view: 'list' } } };
  const ex = S.explain(rec);
  sc.eq('이 기기가 고친 자리', has(ex.local, 'c2', 'view', '「card」'), true);
  sc.eq('다른 기기가 고친 자리', has(ex.remote, 'c1', 'view', '「grid」'), true);
  sc.eq('안 달라진 자리는 안 적는다', ex.local.join('|').includes('c1'), false);
  sc.eq('영문 설정 키를 사람 말로', S.nice(rec), '설정 · 말씀 카드 구성');
  sc.eq('갈래 이름', S.group(rec), '설정');

  // 할일 한 자리 — "제목을 고쳤다" 로 단정하지 않는다 (순서가 밀린 것일 수 있다)
  const t = { entityType: 'task', entityId: '2026-09-04/big/am/1',
    base: { text: '심방', done: false }, local: { text: '심방', done: true },
    remote: { text: '주일예배', done: false } };
  const et = S.explain(t);
  sc.eq('완료 표시는 그대로 말한다', has(et.local, '「심방」', '완료 표시를 켬'), true);
  sc.eq('자리 번호를 준다', has(et.remote, '2번째 자리'), true);
  sc.eq('단정하지 않는다', has(et.remote, '순서가 밀린 것'), true);
  sc.eq('날짜를 사람 말로', S.nice({ entityType: 'task', entityId: 'x',
        label: '2026-09-04 · 빅 블럭 · 오전' }), '9월 4일 (금) · 빅 블럭 · 오전');

  // 기준을 모르는 자리 — 늘고 줄었다고 말할 수 없으니 양쪽을 통째로 늘어놓는다
  const u = { entityType: 'section', entityId: '2026-09-04/big/am', base: null,
    local: [{ text: '가' }], remote: [{ text: '나' }, { text: '다' }] };
  const eu = S.explain(u);
  sc.eq('이 기기 목록', has(eu.local, '할일 1개', '「가」'), true);
  sc.eq('다른 기기 목록', has(eu.remote, '할일 2개', '「나」', '「다」'), true);

  // 알려만 주는 것 — 고르는 버튼 대신 설명 한 줄
  const bulk = { entityType: 'bulk', entityId: 'bulk/days', base: 100, local: 30, remote: 100 };
  sc.eq('대량 손실은 말로 알린다', S.explain(bulk).note.includes('할일·일정'), true);
  sc.eq('고를 것이 없다', S.explain(bulk).local.length, 0);
}

sc.done();
