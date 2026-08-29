// 기기별로만 두는 설정 (v26-0828-7)
//
// HB 가 정한 두 가지:
//  ① 알림 켜기/끄기를 기기별로 → 계정 설정은 그대로 두고 이 기기의 푸시 등록만 뺀다
//  ② '지금 보는 말씀' 을 동기화에서 제거 → 맥에서 넘긴 말씀이 아이폰을 따라다니지 않는다
//
// ⚠️ 이 장치가 깨지면 나는 사고는 조용하다. 그래서 경계를 전부 고정한다:
//    · 이 기기 값이 **클라우드로 올라가면** 안 된다 (그러면 예전과 똑같아진다)
//    · 클라우드 값이 **이 기기 값을 덮으면** 안 된다
//    · 그런데 **처음 쓰는 기기**는 한 번은 클라우드 것을 물려받아야 한다
//    · 다른 설정은 하나도 건드리면 안 된다
//    · 병합에서 **충돌로 잡히면 안 된다** (매번 충돌 화면이 뜨게 된다)
//
// ⚠️ 개발본(index-dev.html)에서 떠온다 — 운영본은 HB 확인 전까지 커밋되지 않는다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };

const LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};

eval(sliceDev('const _DEVICE_SCOPED=[', 'function _psIsDefault()')
   + '\n' + sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
   + `\nglobal.D = {
        keys: _DEVICE_SCOPED,
        capture: _dsCapture, overlay: _dsOverlay, project: _dsProject,
        reset: () => { _dsCache = null; },
        notifOn: _devNotifOn, notifSet: _devNotifSet,
        detect: _cfDetect, merge: _fbMerge
      };`);

function fresh() { Object.keys(LS).forEach(k => delete LS[k]); D.reset(); }
const clone = o => JSON.parse(JSON.stringify(o));

// ═══ 1. 어떤 칸이 기기별인가 ═══
console.log('시나리오 1 — 기기별로 두는 칸');
{
  sc.eq('지금 보는 말씀', D.keys.includes('verseCurrentIdx'), true);
  sc.eq('오늘 이미 보여줬는지', D.keys.includes('verseLastShownDate'), true);
  sc.eq('그 밖의 설정은 계정 공유', D.keys.includes('theme'), false);
  sc.eq('알림 설정 자체는 계정 공유(스위치만 기기별)', D.keys.includes('notify'), false);
}

// ═══ 2. 이 기기 값이 클라우드로 올라가지 않는다 ═══
//     ⚠️ 이게 깨지면 예전과 똑같아진다 — 맥에서 넘긴 말씀이 아이폰을 따라다닌다.
console.log('\n시나리오 2 — 올릴 때는 원래 클라우드 값을 되돌린다');
{
  fresh();
  const prior = { settings: { verseCurrentIdx: 7, theme: 'dark' } };
  const mine  = { settings: { verseCurrentIdx: 99, theme: 'light' } };
  const out = D.project(mine, prior);
  sc.eq('지금 보는 말씀은 클라우드 것 그대로', out.settings.verseCurrentIdx, 7);
  sc.eq('다른 설정은 내 것이 올라간다', out.settings.theme, 'light');
  sc.eq('원본을 건드리지 않는다', mine.settings.verseCurrentIdx, 99);
}

// ═══ 3. 클라우드에 그 칸이 없었으면 아예 안 올린다 ═══
console.log('\n시나리오 3 — 클라우드에 없던 칸은 만들지 않는다');
{
  fresh();
  const out = D.project({ settings: { verseCurrentIdx: 5, theme: 'dark' } }, { settings: { theme: 'dark' } });
  sc.eq('그 칸이 없다', 'verseCurrentIdx' in out.settings, false);
  sc.eq('다른 칸은 그대로', out.settings.theme, 'dark');
}

// ═══ 4. 받을 때는 이 기기 값이 이긴다 ═══
console.log('\n시나리오 4 — 받을 때 이 기기 값으로 덮어쓴다');
{
  fresh();
  D.capture({ verseCurrentIdx: 42, verseLastShownDate: '2026-08-28' });
  const got = D.overlay({ verseCurrentIdx: 7, verseLastShownDate: '2026-08-01', theme: 'dark' });
  sc.eq('내 말씀 자리 유지', got.verseCurrentIdx, 42);
  sc.eq('내 표시 날짜 유지', got.verseLastShownDate, '2026-08-28');
  sc.eq('다른 설정은 클라우드 것', got.theme, 'dark');
}

// ═══ 5. ⚠️ 처음 쓰는 기기는 한 번 물려받는다 ═══
//     안 그러면 새 기기가 늘 1번 말씀부터 시작한다.
console.log('\n시나리오 5 — 처음 쓰는 기기는 클라우드 것을 그대로');
{
  fresh();
  const got = D.overlay({ verseCurrentIdx: 7, theme: 'dark' });
  sc.eq('클라우드 값을 그대로 받는다', got.verseCurrentIdx, 7);
}

// ═══ 6. 저장하면 이 기기 저장소에 적힌다 ═══
console.log('\n시나리오 6 — 이 기기 저장소 왕복');
{
  fresh();
  D.capture({ verseCurrentIdx: 3, theme: 'light' });
  D.reset();                                   // 앱을 껐다 켠 것처럼
  sc.eq('다시 켜도 남아 있다', D.overlay({ verseCurrentIdx: 900 }).verseCurrentIdx, 3);
  sc.eq('기기별이 아닌 칸은 안 적는다',
    JSON.parse(localStorage.getItem('b7v1_devsettings')).theme, undefined);
}

// ═══ 7. ⚠️ 병합에서 충돌로 잡히지 않는다 ═══
//     클라우드 값이 늘 그대로라(양쪽이 base 와 같다) 충돌이 날 수 없다.
//     이게 깨지면 기기를 옮길 때마다 충돌 화면이 뜬다.
console.log('\n시나리오 7 — 기기를 오가도 충돌이 아니다');
{
  fresh();
  const base  = { settings: { verseCurrentIdx: 7, theme: 'dark' } };
  // 맥과 아이폰이 각각 다른 말씀을 보고 있지만, 올릴 때 둘 다 7 로 되돌린다
  const mac   = D.project({ settings: { verseCurrentIdx: 50, theme: 'dark' } }, base);
  const phone = D.project({ settings: { verseCurrentIdx: 80, theme: 'dark' } }, base);
  sc.eq('둘 다 클라우드 값을 그대로 올린다',
    [mac.settings.verseCurrentIdx, phone.settings.verseCurrentIdx], [7, 7]);
  const merged = D.merge(base, mac, phone);
  sc.eq('병합해도 그대로', merged.settings.verseCurrentIdx, 7);
  const list = D.detect(base, mac, phone, merged, { localDeviceId: 'a', remoteDeviceId: 'b' });
  sc.eq('충돌 없음', list.length, 0);
}

// ═══ 8. 다른 설정은 예전처럼 동기화된다 ═══
console.log('\n시나리오 8 — 나머지 설정은 그대로 계정 공유');
{
  fresh();
  D.capture({ verseCurrentIdx: 42 });
  const base  = { settings: { theme: 'dark', bigLimit: 7, verseCurrentIdx: 1 } };
  const mac   = D.project({ settings: { theme: 'light', bigLimit: 7, verseCurrentIdx: 42 } }, base);
  sc.eq('테마 변경은 올라간다', mac.settings.theme, 'light');
  sc.eq('말씀 자리는 안 올라간다', mac.settings.verseCurrentIdx, 1);
  const merged = D.merge(base, mac, clone(base));
  sc.eq('상대 기기도 테마를 받는다', merged.settings.theme, 'light');
  sc.eq('받은 뒤 내 말씀 자리는 그대로', D.overlay(merged.settings).verseCurrentIdx, 42);
}

// ═══ 9. 기기별 알림 스위치 ═══
console.log('\n시나리오 9 — 이 기기에서 알림 받기');
{
  fresh();
  sc.eq('처음엔 켜져 있다 (지금 쓰는 기기가 갑자기 조용해지면 안 된다)', D.notifOn(), true);
  D.notifSet(false);
  sc.eq('끄면 꺼진다', D.notifOn(), false);
  D.reset();
  sc.eq('앱을 껐다 켜도 유지된다', D.notifOn(), false);
  D.notifSet(true);
  sc.eq('다시 켤 수 있다', D.notifOn(), true);
}

// ═══ 10. 기기별 스위치는 클라우드에 올라가지 않는다 ═══
//     ⚠️ 올라가면 한 기기에서 끈 것이 다시 전부 꺼진다 — 고치려던 그 증상이다.
console.log('\n시나리오 10 — 기기별 스위치가 계정 설정을 건드리지 않는다');
{
  fresh();
  D.notifSet(false);
  const base = { settings: { notify: { enabled: true }, versePush: { enabled: true, timesOn: true } } };
  const out = D.project(clone(base), base);
  sc.eq('할일 알림 설정 그대로', out.settings.notify.enabled, true);
  sc.eq('말씀 알림 설정 그대로', out.settings.versePush.enabled, true);
  sc.eq('스위치는 따로 저장된다', localStorage.getItem('b7v1_notifdev'), 'off');
  sc.eq('설정 저장소에는 안 들어간다',
    (JSON.parse(localStorage.getItem('b7v1_devsettings') || '{}')).notify, undefined);
}

sc.done();
