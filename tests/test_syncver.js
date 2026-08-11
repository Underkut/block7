// 기기 간 동기화 — "낡은 버전이 새 데이터를 지우는" 사고 (v26-0810-5)
//
// 실제로 일어난 일:
//   집 맥미니 크롬에 block7 이 **옛 버전으로** 하루 종일 열려 있었다.
//   그 창을 눌러 앞으로 불러오기만 했는데, 사무실 맥·아이패드에서 만들어 둔
//   말씀카드가 모든 기기에서 사라졌다. 사람은 아무것도 바꾸지 않았다.
//
// 왜:
//   옛 버전의 _lay() 는 cols 안의 'card#…' 를 "정의에 없는 타입"으로 보고
//   조용히 지웠다. 화면을 한 번 그리기만 해도 지워진 상태가 저장·전송됐고,
//   3자 병합은 그것을 **사람이 지운 것**으로 받아들여(로컬만 바뀜 → 로컬 채택)
//   모든 기기에 퍼뜨렸다. 병합 엔진의 잘못이 아니라, "모르는 것을 지운" 것이 잘못.
//
// 그래서 두 방향으로 막는다:
//   ① 모르는 위젯은 지우지 않고 따로 보관한다 (다음 버전이 되찾아 간다)
//   ② 나보다 낮은 버전이 쓴 문서는 믿지 않는다 (base 없이 합집합으로 되살린다)
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.document = { visibilityState: 'visible', addEventListener: () => {} };
global.APP_VERSION = 'v. 26-0811-4';
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면') +
  // eval 안의 let 은 바깥으로 새지 않는다 → 값을 넣어 볼 통로를 하나 뚫는다
  ';Object.assign(globalThis,{_probeIdle:(vis,edit,touch)=>{' +
  '_fbVisibleSince=vis;_fbLastEditTs=edit;_fbLastTouchTs=touch;return _fbDeviceIdle();}});');

// _lay() 쪽 (모르는 위젯 보관)
global.ST = { settings: {} };
eval(
  slice('const RP_WIDGET_DEFS={', 'function _rpGetWidgets(') +
  slice('// 이 버전이 "아는" 위젯인가.', 'function _colKey(') +
  slice('// ══════ 말씀카드 위젯 = 카드 인스턴스 모델 ══════', '// ══════ 말씀카드 위젯 끝 ══════') +
  ';Object.assign(globalThis,{_lay,_layIsKnownType,_vcCreate,RP_WIDGET_DEFS});'
);
const clone = o => JSON.parse(JSON.stringify(o));
const layout = cols => ({ bp2: 600, bp3: 900, weekly: 'none', cols, c3: [.34, .3] });

// ═══ 1. 버전 비교 ═══
console.log('시나리오 1 — 앱 버전 비교');
{
  sc.eq('같으면 0', _verCmp('v. 26-0811-4', 'v. 26-0811-4'), 0);
  sc.eq('날짜가 앞서면 -1', _verCmp('v. 26-0807-4', 'v. 26-0810-1'), -1);
  sc.eq('날짜가 뒤면 1', _verCmp('v. 26-0810-1', 'v. 26-0807-4'), 1);
  sc.eq('해가 앞서면 -1', _verCmp('v. 25-1231-9', 'v. 26-0101-1'), -1);
  // ⚠️ 문자열로 비교하면 "-10" < "-4" 가 되어 뒤집힌다 — 숫자로 봐야 한다
  sc.eq('같은 날 10번째가 4번째보다 뒤', _verCmp('v. 26-0810-10', 'v. 26-0810-4'), 1);
  sc.eq('못 읽으면 판단하지 않는다', _verCmp('알 수 없음', 'v. 26-0811-4'), null);

  sc.eq('낮은 버전이 쓴 문서', _fbVerIsOlder('v. 26-0807-4'), true);
  sc.eq('같은 버전은 낡지 않았다', _fbVerIsOlder('v. 26-0811-4'), false);
  sc.eq('더 새 버전도 낡지 않았다', _fbVerIsOlder('v. 26-0812-1'), false);
  // appVer 를 기록하기 전(≤26-0802-0) 기기 = 낡았다
  sc.eq('버전 표시가 없으면 낡았다', _fbVerIsOlder(undefined), true);
  sc.eq('빈 문자열도 낡았다', _fbVerIsOlder(''), true);
}

// ═══ 2. ⚠️ 사고 재현 — 낡은 기기가 말씀카드를 지우고 올렸을 때 ═══
console.log('\n시나리오 2 — 낡은 기기가 지운 것을 되살린다');
{
  // 사무실 맥·아이패드가 만들어 둔 상태 (= 마지막으로 서로 일치했던 지점)
  const base = {
    settings: {
      layout: layout({ left: ['todo'], center: ['card#c1'], right: ['likeList', 'card#c2'] }),
      verseCards: { c1: { kind: null }, c2: { kind: 'like' } },
      theme: 'dark',
    },
    days: { '2026-08-10': { big: { am: [{ text: '설교 준비', done: false }] }, small: {}, trash: [] } },
    verseLikeLog: {},
  };
  // 집 맥미니(옛 버전)가 화면을 그리며 card# 를 지운 뒤 그대로 올린 것
  const legacyCloud = clone(base);
  legacyCloud.settings.layout.cols = { left: ['todo'], center: [], right: ['likeList'] };
  delete legacyCloud.settings.verseCards;
  // 아이패드(신버전)의 손에 든 상태 = base 그대로
  const local = clone(base);

  // (가) 예전 방식 — base 를 넘기면 삭제가 그대로 통과한다
  const wrong = _fbMerge(base, local, legacyCloud, false);
  sc.eq('base 를 주면 말씀카드가 사라진다(= 실제로 난 사고)',
        wrong.settings.layout.cols.center, []);

  // (나) 고친 방식 — 낮은 버전이 쓴 것은 base 없이 합집합
  const healed = _fbMerge(null, local, legacyCloud, false);
  sc.eq('되살린 뒤에는 말씀카드가 남는다',
        healed.settings.layout.cols.center, ['card#c1']);
  sc.eq('우측 카드도 남는다', healed.settings.layout.cols.right, ['likeList', 'card#c2']);
  sc.eq('카드 설정도 남는다', Object.keys(healed.settings.verseCards).sort(), ['c1', 'c2']);
  sc.eq('할일은 그대로', healed.days['2026-08-10'].big.am[0].text, '설교 준비');
}

// ═══ 3. 되살리면서도 낡은 기기가 새로 넣은 것은 살린다 ═══
console.log('\n시나리오 3 — 낡은 기기가 새로 넣은 것도 함께 살린다');
{
  const local = {
    settings: { layout: layout({ left: ['todo'], center: ['card#c1'], right: [] }),
                verseCards: { c1: { kind: null } } },
    days: { '2026-08-10': { big: { am: [{ text: '설교 준비', done: false }] }, small: {}, trash: [] } },
    verseLikeLog: { '2026-08-10': [{ ref: '요 1:1' }] },
  };
  const legacyCloud = {
    settings: { layout: layout({ left: ['todo'], center: [], right: [] }) },   // 카드 지움
    days: {
      '2026-08-10': { big: { am: [{ text: '설교 준비', done: false }] }, small: {}, trash: [] },
      '2026-08-11': { big: { am: [{ text: '집에서 적은 할일', done: false }] }, small: {}, trash: [] },
    },
    verseLikeLog: { '2026-08-10': [{ ref: '시 23:1' }] },   // 집에서 누른 좋아요
  };
  const healed = _fbMerge(null, local, legacyCloud, false);
  sc.eq('내 말씀카드는 되살아나고', healed.settings.layout.cols.center, ['card#c1']);
  sc.eq('낡은 기기가 새로 적은 할일도 남고', healed.days['2026-08-11'].big.am[0].text, '집에서 적은 할일');
  sc.eq('양쪽 좋아요가 모두 남는다',
        healed.verseLikeLog['2026-08-10'].map(e => e.ref).sort(), ['시 23:1', '요 1:1']);
}

// ═══ 4. ⚠️ 모르는 위젯은 지우지 않는다 (같은 사고의 재발 방지) ═══
console.log('\n시나리오 4 — 모르는 위젯은 지우지 말고 보관한다');
{
  ST.settings = { layout: layout({ left: ['todo'], center: ['앞으로생길위젯'], right: ['likeList'] }) };
  const L = _lay();
  sc.eq('모르는 것은 화면 배치에서 빠지지만', L.cols.center, []);
  sc.eq('지워지지 않고 보관된다', L.unknown.map(u => u.t), ['앞으로생길위젯']);
  sc.eq('어느 칸의 몇 번째였는지도 기억한다', [L.unknown[0].c, L.unknown[0].i], ['center', 0]);
  sc.eq('아는 것은 그대로', L.cols.right, ['likeList']);

  // 여러 번 돌려도 중복으로 쌓이지 않는다
  _lay(); _lay();
  sc.eq('여러 번 돌려도 하나만', L.unknown.length, 1);

  // 그 위젯을 아는 버전이 되면 제자리로 돌아온다
  RP_WIDGET_DEFS['앞으로생길위젯'] = { name: '새 위젯' };
  const L2 = _lay();
  sc.eq('알게 되면 원래 칸으로 되돌아온다', L2.cols.center, ['앞으로생길위젯']);
  sc.eq('보관함은 비워진다', L2.unknown.length, 0);
  delete RP_WIDGET_DEFS['앞으로생길위젯'];

  // 설정이 없는 카드는 예전처럼 그냥 버린다 (보관 대상 아님)
  ST.settings = { layout: layout({ left: ['todo'], center: ['card#유령'], right: [] }) };
  const L3 = _lay();
  sc.eq('설정 없는 카드는 버린다', L3.cols.center, []);
  sc.eq('보관하지도 않는다', L3.unknown.length, 0);

  sc.eq('아는 타입 판정', [_layIsKnownType('likeList'), _layIsKnownType('card#c1'), _layIsKnownType('모름')],
        [true, true, false]);
}

// ═══ 5. 유휴 판정 — 창을 앞으로 불러온 직후는 아직 "쓰는 기기"가 아니다 ═══
console.log('\n시나리오 5 — 방금 앞으로 불러온 창은 양보한다');
{
  const now = Date.now();
  // (앞으로 나온 시각, 마지막으로 고친 시각, 마지막으로 만진 시각)
  // ⚠️ 이것이 이번 사고의 핵심 — 배경에 있던 창을 눌러 앞으로 불러온 그 클릭이
  //    곧바로 '사람이 만졌다'로 잡혀서, 하루 종일 열어만 뒀던 창이 충돌에서 이겼다.
  sc.eq('앞으로 불러온 직후 = 아직 보고만 있다', _probeIdle(now, now - 60000, now), true);
  sc.eq('실제로 고치고 나면 쓰는 기기', _probeIdle(now, now + 1, now), false);
  sc.eq('한참 전에 열어 두고 방금 만졌으면 쓰는 기기', _probeIdle(now - 600000, 0, now), false);
  sc.eq('오래 손대지 않았으면 유휴', _probeIdle(now - 600000, 0, now - 300000), true);
  document.visibilityState = 'hidden';
  sc.eq('배경이면 언제나 유휴', _probeIdle(now, now, now), true);
  document.visibilityState = 'visible';
}

// ═══ 6. 코드에 실제로 붙어 있는지 ═══
console.log('\n시나리오 6 — 방어가 실제로 연결돼 있는지');
{
  // 리스너: 낮은 버전이 쓴 문서를 되살린다
  sc.eq('리스너에 버전 가드', SRC.includes('if(_fbVerIsOlder(data.appVer)){'), true);
  sc.eq('되살리기 한 곳으로', SRC.includes('function _fbHealFromLegacy(remote,rawJson,rev,dev,ver)'), true);
  // ⚠️ 되살릴 때 base 를 넘기면 삭제가 그대로 통과한다 (7-2 의 경고)
  sc.eq('되살릴 때 base 는 넘기지 않는다', SRC.includes('_fbMerge(null,ST,remote,false)'), true);
  sc.eq('믿지 않은 문서를 기준점으로 삼지 않는다',
        SRC.includes('_fbLastSeenRev=Math.max(_fbLastSeenRev,seenRev);\n      _fbHealFromLegacy('), true);
  // 커밋 경로에도 같은 가드
  sc.eq('커밋에도 버전 가드', SRC.includes('const legacy=_fbVerIsOlder(data.appVer);'), true);
  sc.eq('낡은 문서면 base 없이 합집합',
        SRC.includes('outState=legacy?_fbMerge(null,ST,cloudState,false)'), true);
  // 강제 업로드도 버전을 남겨야 남들이 "낡은 기기"로 오해하지 않는다
  sc.eq('강제 업로드도 버전을 남긴다',
        /_fbForceWrite[\s\S]*?tx\.set\(userDocRef\(uid\),\{json,rev,dev:_deviceId\(\),appVer:APP_VERSION/.test(SRC), true);
  // 낡은 탭 자가 갱신 — 유휴가 아니어도 갱신한다 (사고를 내는 것이 바로 그 탭이다)
  sc.eq('낡은 탭은 유휴가 아니어도 새로고침', SRC.includes('if(_verCmp(cloudVer,APP_VERSION)!==1)return;'), true);
  sc.eq('못 올린 편집이 있으면 새로고침하지 않는다',
        /_fbMaybeSelfUpdate[\s\S]*?if\(_fbCleanSeq!==_fbDirtySeq\|\|_fbWriteTimer\|\|_fbCommitBusy\)return;/.test(SRC), true);
  // 원격 반영 뒤 설정창 버튼 상태도 맞춘다 (5-3)
  sc.eq('원격 반영 뒤 설정창 갱신',
        SRC.includes("document.getElementById('settingsOverlay')?.classList.contains('open')"), true);
  // 옛 가드를 되살리지 않았는지 (인계 문서 7-1 의 금지사항)
  sc.eq('2.5초 무시 가드를 되살리지 않았다', /2500[\s\S]{0,40}무시/.test(SRC), false);
}

sc.done();
