// 화면 배치(2단·3단 위젯 자리 · 3단 칸 폭 c3 · 2단 우측 폭)를 기기별로 (v. 26-1029-10, HB)
//
// HB 물음(2026-10-29): "2/3단 위젯 배치가 기기별 저장인가?" → 아니었다(계정 공유) → 기기별로.
// 이미 있는 기기 칸막이(_DEVICE_SCOPED · _dsCapture/_dsOverlay/_dsProject)에 얹는다.
//
// ⚠️ 얹기만 하면 조용히 깨지는 곳이 셋 있었다 — 그래서 시나리오로 못박는다:
//  ① _dsCapture 가 `!==` 로 견줬다. 배치는 _lay() 가 **제자리에서** 고치는 묶음이라
//     한 번 적힌 뒤로는 늘 '같다' 로 보여 기기 저장소에 다시 안 적혔다 → 껐다 켜면 옛 배치.
//  ② 대량 손실 방어(_fbBulkLoss)가 배치 칸 수를 셌다. 위젯을 덜 둔 기기가 '손실' 로 읽혀
//     base 를 모르는 병합에서 **클라우드 전체를 채택** — 아직 못 올린 할일까지 덮인다.
//  ③ 위젯을 끄면 말씀 카드 설정(verseCards)까지 지웠다. 카드 설정은 계정 공유라
//     같은 카드를 놓아 둔 다른 기기에서도 위젯이 사라진다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };

const LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};

eval(slice('const _DEVICE_SCOPED=[', 'function _psIsDefault()')
   + '\n' + slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면')
   + `\nglobal.D = {
        keys: _DEVICE_SCOPED,
        capture: _dsCapture, overlay: _dsOverlay, project: _dsProject,
        reset: () => { _dsCache = null; },
        detect: _cfDetect, merge: _fbMerge, guarded: _fbMergeGuarded, loss: _fbBulkLoss,
        setBase: j => { _fbBaseJson = j; }
      };`);

function fresh() { Object.keys(LS).forEach(k => delete LS[k]); D.reset(); }
const clone = o => JSON.parse(JSON.stringify(o));
const lay = (cols, c3) => ({ bp2: 600, bp3: 900, weekly: 'none', cols, c3: c3 || [0.34, 0.3], unknown: [] });

// ═══ 1. 어떤 칸이 기기별인가 ═══
console.log('시나리오 1 — 배치 칸은 기기별, 카드 설정은 계정 공유');
{
  sc.eq('배치(2단·3단 · c3 포함)', D.keys.includes('layout'), true);
  sc.eq('옛 배치 목록', D.keys.includes('rightWidgets'), true);
  sc.eq('2단 우측 폭', D.keys.includes('rightPanelRatio'), true);
  sc.eq('말씀 카드 설정은 계정 공유', D.keys.includes('verseCards'), false);
  sc.eq('예전 기기별 칸도 그대로', D.keys.includes('verseCurrentIdx'), true);
}

// ═══ 2. ⚠️ ① 제자리에서 고친 배치도 기기 저장소에 다시 적힌다 ═══
console.log('\n시나리오 2 — 제자리에서 옮긴 위젯 · 바꾼 칸 폭이 껐다 켜도 남는다');
{
  fresh();
  const S = { layout: lay({ left: ['todo'], center: [], right: ['monthSingle'] }) };
  D.capture(S);
  S.layout.cols.center.push('monthSingle');        // _lay() 가 하듯 제자리에서 옮긴다
  S.layout.cols.right = [];
  S.layout.c3[0] = 0.4;                            // 3단 칸 폭 끌기
  D.capture(S);
  D.reset();                                       // 앱을 껐다 켠 것처럼
  const got = D.overlay({ layout: lay({ left: ['todo'], center: [], right: ['likeList'] }) });
  sc.eq('옮긴 자리가 남는다', got.layout.cols.center, ['monthSingle']);
  sc.eq('3단 칸 폭이 남는다', got.layout.c3, [0.4, 0.3]);
}

// ═══ 3. 받은 배치를 고쳐도 기기 저장소 기억이 따라 바뀌지 않는다 (베껴 준다) ═══
console.log('\n시나리오 3 — 덮어쓴 값은 베낀 것');
{
  fresh();
  D.capture({ layout: lay({ left: ['todo'], center: [], right: [] }) });
  const a = D.overlay({ layout: lay({ left: [], center: [], right: [] }) });
  a.layout.cols.left.push('x');
  const b = D.overlay({});
  sc.eq('저장소 기억은 그대로', b.layout.cols.left, ['todo']);
}

// ═══ 4. 맥과 아이패드가 서로 다른 배치를 갖고, 클라우드 배치는 멈춰 있다 ═══
console.log('\n시나리오 4 — 두 기기, 두 배치, 충돌 없음');
{
  fresh();
  const cloudLay = lay({ left: ['todo'], center: [], right: ['monthSingle', 'card#c1'] });
  const base = { settings: { layout: clone(cloudLay), rightPanelRatio: 0.3, theme: 'dark' } };
  const mac  = D.project({ settings: { layout: lay({ left: ['todo', 'weekly'], center: ['card#c1'], right: ['monthSingle'] }, [0.3, 0.4]), rightPanelRatio: 0.3, theme: 'dark' } }, base);
  const ipad = D.project({ settings: { layout: lay({ left: ['todo'], center: [], right: ['card#c1'] }), rightPanelRatio: 0.45, theme: 'light' } }, base);
  sc.eq('맥은 배치를 안 올린다', mac.settings.layout, cloudLay);
  sc.eq('아이패드도 안 올린다', ipad.settings.layout, cloudLay);
  sc.eq('2단 우측 폭도 안 올린다', ipad.settings.rightPanelRatio, 0.3);
  sc.eq('다른 설정은 올라간다', ipad.settings.theme, 'light');
  const merged = D.merge(base, mac, ipad);
  sc.eq('병합해도 클라우드 배치 그대로', merged.settings.layout, cloudLay);
  sc.eq('충돌 없음', D.detect(base, mac, ipad, merged, { localDeviceId: 'a', remoteDeviceId: 'b' }).length, 0);
  // 맥이 받은 뒤 — 제 배치가 남는다
  D.capture({ layout: lay({ left: ['todo', 'weekly'], center: ['card#c1'], right: ['monthSingle'] }, [0.3, 0.4]) });
  const onMac = D.overlay(merged.settings);
  sc.eq('맥 배치 유지', onMac.layout.cols.center, ['card#c1']);
  sc.eq('맥 칸 폭 유지', onMac.layout.c3, [0.3, 0.4]);
  sc.eq('테마는 아이패드 것을 받는다', onMac.theme, 'light');
}

// ═══ 5. 새 기기 · 업데이트한 기기는 지금 배치를 한 번 물려받는다 ═══
console.log('\n시나리오 5 — 처음 쓰는 기기(빈 기기 저장소)는 클라우드 배치 그대로');
{
  fresh();
  const cloud = { layout: lay({ left: ['todo'], center: ['card#c1'], right: ['monthSingle'] }, [0.3, 0.35]) };
  const got = D.overlay(clone(cloud));
  sc.eq('배치를 물려받는다', got.layout, cloud.layout);
  sc.eq('기기 저장소는 아직 비어 있다 (첫 저장 때 적힌다)', localStorage.getItem('b7v1_devsettings'), null);
  D.capture(got);
  sc.eq('첫 저장 뒤로는 이 기기 것', JSON.parse(localStorage.getItem('b7v1_devsettings')).layout.c3, [0.3, 0.35]);
}

// ═══ 6. 빈 기기로 로그인 — 클라우드는 어떻게 되는가 (CLAUDE.md '절대 하지 말 것') ═══
console.log('\n시나리오 6 — 빈 기기 로그인: 클라우드 배치가 기본값으로 덮이지 않는다');
{
  fresh();
  D.setBase(null);                                  // 클라우드를 한 번도 못 받은 새 기기
  const cloud = {
    days: { '2026-10-29': { big: { am: [{ text: '할일', done: false }] }, small: {}, trash: [] } },
    settings: { layout: lay({ left: ['todo'], center: ['card#c1'], right: ['monthSingle', 'card#c2'] }), verseCards: { c1: {}, c2: {} } },
    verseCollections: []
  };
  const blank = { days: {}, settings: { layout: lay({ left: ['todo'], center: [], right: [] }), verseCards: {} }, verseCollections: [] };
  const out = D.guarded(null, blank, clone(cloud), false);
  const up = D.project(out, cloud);
  sc.eq('올라가는 배치 = 클라우드 배치', up.settings.layout, cloud.settings.layout);
  sc.eq('할일은 그대로', up.days['2026-10-29'].big.am.length, 1);
  sc.eq('카드 설정도 그대로', Object.keys(up.settings.verseCards).sort(), ['c1', 'c2']);
}

// ═══ 7. ⚠️ ② 위젯을 덜 둔 기기는 '대량 손실' 이 아니다 ═══
console.log('\n시나리오 7 — 배치 칸 수는 대량 손실로 세지 않는다');
{
  const cloud = { days: {}, settings: { layout: lay({ left: ['todo', 'a', 'b'], center: ['c', 'd'], right: ['e', 'f'] }) } };
  const mine  = { days: {}, settings: { layout: lay({ left: ['todo'], center: [], right: [] }) } };
  sc.eq('배치만 적은 것은 손실 아님', D.loss(cloud, mine), false);
  // 그래서 base 를 모르는 병합에서도 이 기기가 아직 못 올린 할일이 살아남는다
  D.setBase(JSON.stringify({}));                    // 클라우드를 받아 본 적은 있다
  const cloud2 = clone(cloud); cloud2.days = { d1: { big: { am: [{ text: '옛것', done: false }] }, small: {}, trash: [] } };
  const mine2 = clone(mine); mine2.days = { d1: { big: { am: [{ text: '옛것', done: false }, { text: '방금 쓴 것', done: false }] }, small: {}, trash: [] } };
  const out = D.guarded(null, mine2, cloud2, false);
  sc.eq('방금 쓴 할일이 남는다', out.days.d1.big.am.map(t => t.text).includes('방금 쓴 것'), true);
  // 할일이 정말 절반 넘게 사라지면 방어는 여전히 켜진다
  const many = { days: { d1: { big: { am: Array.from({ length: 10 }, (_, i) => ({ text: 't' + i })) }, small: {}, trash: [] } } };
  sc.eq('할일 대량 손실은 그대로 잡는다', D.loss(many, { days: {} }), true);
}

// ═══ 8. ⚠️ ③ 위젯을 꺼도 말씀 카드 설정은 지우지 않는다 ═══
//     카드 설정은 계정 공유 — 다른 기기 배치에 같은 카드가 놓여 있을 수 있다.
console.log('\n시나리오 8 — 위젯 끄기가 카드 설정을 지우지 않는다');
{
  const cfg = slice('function renderRpConfigList(', 'function _rpAttachChipDrag(');
  sc.eq('설정 팝업에서 빼기: _vcRemove 를 부르지 않는다', /_vcRemove\(/.test(cfg), false);
  const off = SRC.slice(SRC.indexOf('// 우상단 존에 드랍 → 위젯 끄기'), SRC.indexOf('onCommit:(key,idx)=>{', SRC.indexOf('// 우상단 존에 드랍 → 위젯 끄기')));
  sc.eq('끌어서 끄기: _vcRemove 를 부르지 않는다', off.length > 0 && !/_vcRemove\(/.test(off), true);
}

sc.done();
