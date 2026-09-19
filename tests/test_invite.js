// 이름 주소와 초대장 (v26-0919-1 · 교회 그룹 2단계)
//
// 6자리 코드 대신 읽을 수 있는 주소(block7.my/?g=tlc)를 쓰고, 그 주소로 처음
// 들어오면 그 말씀 모음을 자동으로 구독한다.
//
// ⚠️ 이것은 이 앱에서 **사람이 아무것도 누르지 않았는데 클라우드가 바뀌는 첫
//    기능**이다. 그래서 이 시험의 무게중심은 "잘 되는가" 가 아니라
//    **"빈 기기로 ?g=tlc 로 처음 들어와 로그인하면 클라우드가 어떻게 되는가"**
//    에 있다 (시나리오 5·6). 답은 하나여야 한다 — **아무것도 잃지 않는다.**
//
// ⚠️ 주소는 '모드 스위치'가 아니라 '초대장'이다. 주소마다 저장 칸을 따로
//    만드는 방식은 금지다 — 2026-08-31 대량 손실과 똑같은 조건이기 때문이다.
//    시나리오 8 이 그것을 소스에서 직접 지킨다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

global.document = { visibilityState: 'visible', addEventListener: () => {} };

// ⚠️ 직접 eval 안의 const/let 은 그 eval 안에만 산다 (var 는 밖으로 나온다).
const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

// ── 앱 대역 (진짜 코드를 떠오기 **전에** 놓는다) ──
let LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};
const LS_KEY = 'b7v1';
let URLNOW = '/';
global.location = {
  get origin(){ return 'https://block7.my'; },
  get pathname(){ return URLNOW.split('?')[0].split('#')[0]; },
  get search(){ const i = URLNOW.indexOf('?'); return i < 0 ? '' : URLNOW.slice(i).split('#')[0]; },
  get hash(){ const i = URLNOW.indexOf('#'); return i < 0 ? '' : URLNOW.slice(i); }
};
global.history = { replaceState: (a, b, url) => { URLNOW = url; } };

// 클라우드 대역 — shared 컬렉션
let SHARED = {}, NETFAIL = false, LOGGED_IN = true;
global.window = {
  _fbUser: { uid: 'u-church', email: 'church@x.com' },
  _fbDB: { collection: () => ({ doc: id => ({ get: async () => {
    if (NETFAIL) throw new Error('net');
    return { exists: id in SHARED, data: () => SHARED[id] };
  } }) }) }
};
function _fbReady(){ return LOGGED_IN; }

const TOASTS = [];
function showToast(m){ TOASTS.push(m); }
function todayKey(){ return '2026-09-19'; }
let _collSeq = 0;
function _genCollId(){ return 'vc' + (++_collSeq); }
function beforeSave(){}
function _invalidateVerseCaches(){}
function renderCollButtons(){}
function _afterActiveVersesChanged(){}

let ST, SAVES = 0;
function save(){ SAVES++; }
function resetST(){
  ST = { days:{}, verseCollections:[], settings:{ activeColls:['nav180'] } };
  SAVES = 0; TOASTS.length = 0; LS = {}; URLNOW = '/'; _collSeq = 0;
}
function getVerseCollections(){ return Array.isArray(ST.verseCollections) ? ST.verseCollections : []; }
function getActiveColls(){ const a = ST.settings.activeColls; return Array.isArray(a) && a.length ? a : ['nav180']; }
const clone = o => JSON.parse(JSON.stringify(o));

// ── 진짜 코드를 떠온다 ──
eval(asVar(sliceDev('const _SHARE_NAME_RESERVED=', '// 주소 하나(이름이든')));
eval(asVar(sliceDev('async function _resolveSharedDoc(', '// 구독을 실제로 만드는')));
eval(asVar(sliceDev('async function _subscribeShared(', '// ══ 초대장 (?g=tlc)')));
eval(asVar(sliceDev('function _sharedVerseOut(', '// 소유자의 모음 내용을 shared')));
// ⚠️ `_inviteFromUrl();` 은 그 자리에서 바로 도는 줄이라 떠올 때는 뺀다.
eval(asVar(sliceDev('const _INVITE_KEY=', '// ── 구독 받기 (상위 레벨) ──')
  .replace(/^_inviteFromUrl\(\);.*$/m, '')));
// 3자 병합 엔진 — 초대가 정말로 '더하기뿐' 인지 진짜 병합기로 확인한다.
// ⚠️ 여기만 asVar 를 쓰지 않는다. `let _mgPreferCloud` 가 eval 안에 남아야
//    _fbMerge 가 그것을 보고 돈다 (test_merge.js 와 같은 방식).
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

// 교회가 발행해 둔 것 — 내용은 늘 6자리 코드 문서에, 이름은 가리키는 쪽지에
function seedChurch(){
  SHARED = {
    '123456': { code:'123456', addr:'tlc', name:'TLC 명제집', ownerUid:'u-church', ownerIdPrefix:'chu',
      verses: [
        { cat:'9월 7일 주일', topic:'믿음', krText:'명제 하나', ref:'로마서 1:17', tags:['믿음'], hi:'믿음으로', d:'2026-09-07', pid:'P1' },
        { cat:'9월 7일 주일', topic:'믿음', krText:'명제 둘', ref:'로마서 1:17', tags:[], hi:'', d:'2026-09-07', pid:'P2' }
      ] },
    'tlc': { code:'tlc', aliasOf:'123456', name:'TLC 명제집', ownerUid:'u-church', ownerIdPrefix:'chu' }
  };
}

(async () => {

console.log('시나리오 1 — 주소 이름을 한 모양으로 눕힌다');
{
  sc.eq('대문자는 내려온다', _shareNameNorm('TLC'), 'tlc');
  sc.eq('앞뒤 공백을 턴다', _shareNameNorm('  tlc  '), 'tlc');
  sc.eq('@ 를 턴다', _shareNameNorm('@tlc'), 'tlc');
  sc.eq('주소를 통째로 붙여넣어도 된다', _shareNameNorm('https://block7.my/?g=tlc'), 'tlc');
  sc.eq('개발본 주소도 같은 곳', _shareNameNorm('https://block7.my/index-dev.html?g=tlc'), 'tlc');
  sc.eq('뒤에 다른 인자가 붙어도', _shareNameNorm('https://block7.my/?g=tlc&verse=x'), 'tlc');
  sc.eq('6자리 코드는 그대로', _shareNameNorm('123456'), '123456');
  sc.eq('빈 값은 빈 값', _shareNameNorm(null), '');
}

console.log('\n시나리오 2 — 쓸 수 있는 이름인가');
{
  sc.eq('tlc 는 된다', _shareNameValid('tlc'), true);
  sc.eq('숫자 섞임도 된다', _shareNameValid('tlc2026'), true);
  sc.eq('붙임표도 된다', _shareNameValid('tlc-main'), true);
  sc.eq('한 글자는 안 된다', _shareNameValid('t'), false);
  sc.eq('21글자는 안 된다', _shareNameValid('a'.repeat(21)), false);
  sc.eq('숫자로 시작하면 안 된다', _shareNameValid('1tlc'), false);
  // ⚠️ 이름과 6자리 코드가 **같은 칸(shared 컬렉션)** 에 산다. 숫자만으로 된
  //    이름을 허락하면 남의 코드 문서를 덮어쓴다.
  sc.eq('숫자만은 안 된다 (남의 코드 문서를 덮어쓴다)', _shareNameValid('123456'), false);
  sc.eq('한글은 안 된다', _shareNameValid('교회'), false);
  sc.eq('대문자는 안 된다 (눕힌 뒤에 본다)', _shareNameValid('TLC'), false);
  sc.eq('붙임표로 끝나면 안 된다', _shareNameValid('tlc-'), false);
  sc.eq('예약어는 안 된다', _shareNameValid('index'), false);
  sc.eq('예약어 dev 도', _shareNameValid('dev'), false);
  sc.eq('보여 주는 주소', _shareAddrShow('tlc'), 'block7.my/?g=tlc');
}

console.log('\n시나리오 3 — 주소에서 초대장을 집는다');
{
  resetST();
  URLNOW = '/?g=tlc';
  sc.eq('초대장을 읽는다', _inviteFromUrl(), 'tlc');
  sc.eq('적어 둔다', LS[_INVITE_KEY], 'tlc');
  sc.eq('주소에서 ?g= 를 지운다', URLNOW, '/');

  // ⚠️ 알림 클릭이 싣고 온 ?verse= 는 **남겨야** 한다. 통째로 지우면
  //    전체화면이 안 열린다.
  resetST();
  URLNOW = '/?verse=' + encodeURIComponent('요 3:16') + '&g=tlc';
  _inviteFromUrl();
  sc.eq('?verse= 는 남는다', decodeURIComponent(URLNOW), '/?verse=요+3:16');

  resetST();
  URLNOW = '/?g=TLC';
  sc.eq('대문자로 들어와도 같은 초대장', _inviteFromUrl(), 'tlc');

  resetST();
  URLNOW = '/?g=' + encodeURIComponent('교회');
  sc.eq('쓸 수 없는 이름은 무시한다', _inviteFromUrl(), '');
  sc.eq('무시했으면 적지도 않는다', LS[_INVITE_KEY], undefined);
  sc.eq('그래도 주소는 정리한다', URLNOW, '/');

  resetST();
  URLNOW = '/';
  sc.eq('g 가 없으면 아무 일도 없다', _inviteFromUrl(), '');
  sc.eq('주소를 건드리지 않는다', URLNOW, '/');
}

console.log('\n시나리오 4 — 이름 주소가 6자리 코드 문서를 가리킨다');
{
  seedChurch(); NETFAIL = false;
  const byName = await _resolveSharedDoc('tlc');
  sc.eq('이름으로 찾으면 코드가 나온다', byName.code, '123456');
  sc.eq('내용은 코드 문서의 것', byName.data.name, 'TLC 명제집');
  sc.eq('어느 주소로 왔는지도 안다', byName.addr, 'tlc');

  const byCode = await _resolveSharedDoc('123456');
  sc.eq('코드로도 그대로 된다', byCode.code, '123456');
  sc.eq('코드로 오면 주소는 없다', byCode.addr, '');

  sc.eq('없는 주소는 없는 것', await _resolveSharedDoc('nowhere'), null);

  // 쪽지가 쪽지를 가리키면 따라가지 않는다 (돌지 않게)
  SHARED['loop'] = { aliasOf:'loop2' };
  SHARED['loop2'] = { aliasOf:'loop' };
  sc.eq('쪽지→쪽지는 따라가지 않는다', await _resolveSharedDoc('loop'), null);
  SHARED['self'] = { aliasOf:'self' };
  sc.eq('자기를 가리키는 쪽지도', await _resolveSharedDoc('self'), null);
}

console.log('\n시나리오 5 — 빈 기기로 ?g=tlc 로 처음 들어와 로그인하면 ⚠️');
{
  // 이 시나리오가 이 시험의 핵심이다. 사람은 아무것도 누르지 않았다.
  seedChurch(); NETFAIL = false;
  resetST();                       // 빈 기기 — 할일도 모음도 없다
  URLNOW = '/?g=tlc';
  _inviteFromUrl();

  // ① 로그인 전에는 **아무 일도 하지 않는다**
  LOGGED_IN = false;
  let r = await _inviteApply(false);
  sc.eq('로그인 전엔 받지 않는다', r.why, 'wait');
  sc.eq('저장도 없다', SAVES, 0);
  sc.eq('초대장은 남아 있다', LS[_INVITE_KEY], 'tlc');

  // ② 로그인은 됐지만 초기 클라우드 읽기가 **실패**했다 (_fbInitLoaded=false)
  //    → 이때 받으면 빈 상태가 클라우드를 덮어쓰는 길(인계문서 7-2-3)에
  //      사람이 누르지도 않은 변경을 얹게 된다. 받지 않는다.
  LOGGED_IN = true;
  r = await _inviteApply(false);
  sc.eq('클라우드를 못 읽었으면 받지 않는다', r.why, 'wait');
  sc.eq('여전히 저장 없음', SAVES, 0);
  sc.eq('초대장을 버리지도 않는다 (다음 부팅에 다시)', LS[_INVITE_KEY], 'tlc');

  // ③ 클라우드를 읽어 ST 에 반영한 뒤에야 받는다
  ST.days = { '2026-09-01': { big: { am: ['교회에서 쓰던 할일'] } } };   // 클라우드에서 온 것
  ST.verseCollections = [{ id:'old', name:'내 모음', verses:[{ ref:'요한복음 3:16', krText:'말씀' }] }];
  ST.settings.activeColls = ['nav180','old'];
  r = await _inviteApply(true);
  sc.eq('이제 받는다', r.done, true);
  sc.eq('모음이 하나 늘었다', ST.verseCollections.length, 2);
  const got = ST.verseCollections[1];
  sc.eq('구독 코드는 6자리', got.importCode, '123456');
  sc.eq('어느 주소로 왔는지 남는다', got.importAddr, 'tlc');
  sc.eq('명제가 살아 온다', got.verses.map(v => v.pid), ['P1','P2']);
  sc.eq("명제 표시도 (kind='prop')", got.verses.every(v => v.kind === 'prop'), true);
  sc.eq('켜진 모음에 더해진다', ST.settings.activeColls, ['nav180','old','vc1']);

  // ⚠️ **아무것도 잃지 않는다** — 초대는 더하기뿐이다
  sc.eq('원래 할일 그대로', ST.days['2026-09-01'].big.am, ['교회에서 쓰던 할일']);
  sc.eq('원래 모음 그대로', ST.verseCollections[0].id, 'old');
  sc.eq('원래 모음 구절도 그대로', ST.verseCollections[0].verses.length, 1);
  sc.eq('초대장은 다 쓰고 지운다', LS[_INVITE_KEY], undefined);
  sc.eq('받은 주소를 남긴다', ST.settings.invites, ['tlc']);
}

console.log('\n시나리오 6 — 초대가 다른 기기의 클라우드를 지우지 않는다 ⚠️');
{
  // 진짜 3자 병합기(_fbMerge)로 확인한다. 초대는 **더하기뿐**이라, 다른 기기가
  // 그 사이 만든 것이 하나도 사라지면 안 된다.
  seedChurch(); NETFAIL = false; LOGGED_IN = true;
  resetST();
  ST.days = { '2026-09-01': { big:{ am:[{ text:'예전 할일', done:false }] }, small:{}, trash:[] } };
  ST.verseCollections = [{ id:'old', name:'내 모음', verses:[] }];
  ST.settings.activeColls = ['nav180','old'];
  const base = clone(ST);                                 // 클라우드와 일치하던 시점
  const cloud = clone(ST);
  cloud.days['2026-09-02'] = { big:{ pm:[{ text:'다른 기기가 방금 넣은 할일', done:false }] }, small:{}, trash:[] };

  LS[_INVITE_KEY] = 'tlc';
  await _inviteApply(true);                               // 이 기기에서 초대장을 받는다
  const local = clone(ST);

  const merged = _fbMerge(base, local, cloud, false);      // 손에 든 쪽 우선 (가장 불리한 조건)

  sc.eq('상대 기기 할일이 살아 있다',
        merged.days['2026-09-02'].big.pm[0].text, '다른 기기가 방금 넣은 할일');
  sc.eq('내 예전 할일도 살아 있다',
        merged.days['2026-09-01'].big.am[0].text, '예전 할일');
  sc.eq('구독 모음이 더해졌다',
        merged.verseCollections.some(c => c.importCode === '123456'), true);
  sc.eq('원래 모음도 그대로',
        merged.verseCollections.some(c => c.id === 'old'), true);
  sc.eq('지워진 날짜가 없다', Object.keys(merged.days).sort(), ['2026-09-01','2026-09-02']);
  sc.eq('구독 표시도 남는다', merged.settings.invites, ['tlc']);
}

console.log('\n시나리오 7 — 초대장은 한 번만, 그리고 되풀이되지 않는다');
{
  seedChurch(); NETFAIL = false; LOGGED_IN = true;
  resetST();
  LS[_INVITE_KEY] = 'tlc';
  await _inviteApply(true);
  sc.eq('한 번 받았다', ST.verseCollections.length, 1);

  // 같은 주소로 또 들어와도 다시 받지 않는다 ("처음 들어오면" 이 HB 의 주문이다)
  URLNOW = '/?g=tlc';
  _inviteFromUrl();
  const r2 = await _inviteApply(true);
  sc.eq('두 번째는 안 받는다', r2.why, 'seen');
  sc.eq('모음이 늘지 않는다', ST.verseCollections.length, 1);
  sc.eq('적어 둔 것도 지운다', LS[_INVITE_KEY], undefined);

  // 손으로 입력하는 것은 **사람의 행동**이라 판정이 다르다 — 이미 구독 중이면
  // 늘리지 않고 그렇다고 알려 준다.
  const r3 = await _subscribeShared('tlc');
  sc.eq('이미 구독 중이라고 알린다', r3.why, 'dup');
  sc.eq('그래도 늘지 않는다', ST.verseCollections.length, 1);

  // 코드로 먼저 구독한 사람이 나중에 주소로 들어와도 두 개가 되지 않는다
  resetST();
  await _subscribeShared('123456');
  sc.eq('코드로 하나 받았다', ST.verseCollections.length, 1);
  LS[_INVITE_KEY] = 'tlc';
  await _inviteApply(true);
  sc.eq('주소로 또 들어와도 하나 그대로', ST.verseCollections.length, 1);
}

console.log('\n시나리오 8 — 주소는 모드 스위치가 아니다 ⚠️');
{
  // 2026-08-31 대량 손실의 조건은 "저장 칸은 갈렸는데 동기화 기준점은 안 갈렸다"
  // 였다. 주소마다 저장 칸을 만들면 그 조건이 그대로 재현된다.
  // → 저장 키(LS_KEY)는 **주소를 쳐다보지도 않아야 한다.**
  const i = SRC_DEV.indexOf('const LS_KEY =');
  const lsLine = SRC_DEV.slice(i, i + 200);
  sc.eq('저장 키는 주소를 안 본다', /invite|shareName|importAddr|\?g=/.test(lsLine), false);
  sc.eq('저장 키는 제품·개발본만 가른다',
        /APP_PRODUCT/.test(lsLine) && /DEV_MODE/.test(lsLine), true);
  // 초대장을 적어 두는 칸도 **주소마다 만들지 않는다** — 늘 한 칸이다
  sc.eq('초대장 칸은 하나뿐', SRC_DEV.includes("const _INVITE_KEY=LS_KEY+'_invite';"), true);
  sc.eq('초대장 칸 이름을 주소로 짓지 않는다', /_INVITE_KEY=LS_KEY\+'_invite';/.test(SRC_DEV), true);
  // 구독은 늘 6자리 코드로 기록된다 — 주소는 표시용일 뿐이다.
  // (이름을 바꿔도 구독이 끊기지 않는 까닭이자, 주소가 칸막이가 아닌 증거)
  sc.eq('구독 기록은 6자리 코드', /importCode:r\.code,/.test(SRC_DEV), true);
}

console.log('\n시나리오 9 — 구독을 만드는 길은 하나뿐');
{
  // 손으로 입력하는 길과 초대장이 **같은 함수**를 지나야 둘이 어긋나지 않는다.
  // (1단계에서 항목 목록이 세 곳에 흩어져 명제가 뭉개진 것과 같은 종류의 위험)
  sc.eq('모음을 만들어 넣는 곳은 한 곳',
        (SRC_DEV.match(/ST\.verseCollections\.push\(\{\r?\n\s*id,name:data\.name/g) || []).length, 1);
  sc.eq('손으로 입력하는 길이 _subscribeShared 를 쓴다',
        /async function doSubscribe\(\)\{[\s\S]{0,600}await _subscribeShared\(key\)/.test(SRC_DEV), true);
  sc.eq('초대장도 _subscribeShared 를 쓴다',
        /async function _inviteApply\([\s\S]{0,600}await _subscribeShared\(key\)/.test(SRC_DEV), true);
  // 초대는 초기 읽기 성공을 **반드시** 확인하고 지나간다
  sc.eq('초대는 _fbInitLoaded 를 보고 지나간다', /_inviteApply\(_fbInitLoaded\)/.test(SRC_DEV), true);
  sc.eq('때가 아니면 적어 둔 것을 지우지 않는다',
        /if\(!_fbReady\(\)\|\|!ready\)return\{done:false,why:'wait'\};/.test(SRC_DEV), true);
}

console.log('\n시나리오 10 — 없는 주소·네트워크 실패');
{
  seedChurch(); LOGGED_IN = true;
  resetST();
  NETFAIL = false;
  LS[_INVITE_KEY] = 'nowhere';
  let r = await _inviteApply(true);
  sc.eq('없는 주소는 알리고 끝', r.why, 'none');
  sc.eq('되풀이하지 않게 지운다', LS[_INVITE_KEY], undefined);
  sc.eq('모음은 안 늘었다', ST.verseCollections.length, 0);
  sc.eq('사람에게 알린다', TOASTS[TOASTS.length - 1], '초대 주소를 찾을 수 없어요');

  // 네트워크가 끊겼으면 **버리지 않는다** — 다음 기회에 다시
  resetST();
  NETFAIL = true;
  LS[_INVITE_KEY] = 'tlc';
  r = await _inviteApply(true);
  sc.eq('네트워크 실패면 기다린다', r.why, 'net');
  sc.eq('초대장을 버리지 않는다', LS[_INVITE_KEY], 'tlc');
  sc.eq('모음도 안 늘었다', ST.verseCollections.length, 0);

  // 네트워크가 돌아오면 그때 받는다
  NETFAIL = false;
  r = await _inviteApply(true);
  sc.eq('돌아오면 받는다', r.done, true);
  sc.eq('그때 하나 늘어난다', ST.verseCollections.length, 1);
}

console.log('\n시나리오 11 — 주소를 나중에 정해도 구독이 끊기지 않는다');
{
  // 내용은 늘 6자리 코드 문서에만 있다. 그래서 이름을 새로 정하거나 바꿔도
  // 이미 구독한 사람의 importCode(6자리)는 그대로라 매일 갱신이 그대로 돈다.
  SHARED = { '222222': { code:'222222', name:'새 모음', ownerUid:'u2', ownerIdPrefix:'abc', verses:[] } };
  NETFAIL = false; LOGGED_IN = true;
  resetST();
  await _subscribeShared('222222');
  sc.eq('코드로 먼저 구독했다', ST.verseCollections[0].importCode, '222222');
  sc.eq('아직 주소는 없다', ST.verseCollections[0].importAddr, '');

  // 발행자가 나중에 이름을 정한다 (쪽지 한 장 + 발행 문서의 addr)
  SHARED['newname'] = { code:'newname', aliasOf:'222222', ownerUid:'u2' };
  SHARED['222222'].addr = 'newname';
  const r = await _resolveSharedDoc('newname');
  sc.eq('새 주소도 같은 코드로 온다', r.code, '222222');

  // 그 주소로 들어온 다른 사람은 같은 모음을 받는다
  resetST();
  LS[_INVITE_KEY] = 'newname';
  await _inviteApply(true);
  sc.eq('주소로 들어온 사람도 같은 코드', ST.verseCollections[0].importCode, '222222');
  sc.eq('주소도 함께 적힌다', ST.verseCollections[0].importAddr, 'newname');
}

sc.done();

})();
