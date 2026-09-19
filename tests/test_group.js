// 교회 그룹 — 말씀모음 묶음을 주소 하나로 (v26-0919-3)
//
// 6자리 공유가 **말씀 모음 하나**를 나누는 것이라면, 그룹은 그 한 단계 위다.
// 모음 여러 개를 묶어 두고 `block7.my/tlc` 로 통째로 나눈다.
// 교회가 묶음에 **더하면 따라오고, 빼면 함께 빠진다** (HB 결정).
//
// ⚠️ 이 시험의 무게중심은 두 가지다.
//   ① **"빈 기기로 block7.my/tlc 로 들어와 로그인하면 클라우드가 어떻게
//      되는가"** — 사람이 아무것도 안 눌렀는데 클라우드가 바뀌는 첫 기능이다.
//      (시나리오 3·4)
//   ② **빼기.** 밖에서 받아온 목록으로 지우는 동작이라 규모 상한이 없으면
//      2026-08-02 대량 삭제 사고가 그대로 재현된다. (시나리오 6·7·8·9)
//
// ⚠️ 주소는 '모드 스위치'가 아니라 '초대장'이다. 주소마다 저장 칸을 따로
//    만드는 방식은 금지 — 시나리오 10 이 소스에서 직접 지킨다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const fs = require('fs');
const path = require('path');
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
global.location = { origin: 'https://block7.my', pathname: '/', search: '', hash: '' };

let SHARED = {}, NETFAIL = false, LOGGED_IN = true;
const FETCHED = [];
let CLOUD_READ_OK = true;      // _fbInitLoaded — 초기 클라우드 읽기 성공 여부
global.window = {
  _fbSyncReady: () => CLOUD_READ_OK,
  _fbUser: { uid: 'u-me', email: 'me@x.com' },
  _fbDB: { collection: () => ({ doc: id => ({ get: async () => {
    FETCHED.push(id);
    if (NETFAIL === true || (Array.isArray(NETFAIL) && NETFAIL.includes(id))) throw new Error('net');
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
  SAVES = 0; TOASTS.length = 0; LS = {}; _collSeq = 0; FETCHED.length = 0; NETFAIL = false;
  LOGGED_IN = true; CLOUD_READ_OK = true;
}
function getVerseCollections(){ return Array.isArray(ST.verseCollections) ? ST.verseCollections : []; }
function getActiveColls(){ const a = ST.settings.activeColls; return Array.isArray(a) && a.length ? a : ['nav180']; }
const clone = o => JSON.parse(JSON.stringify(o));
const codesOf = () => getVerseCollections().map(c => c.importCode || ('내:' + c.name)).sort();

// ── 진짜 코드를 떠온다 ──
eval(asVar(sliceDev('const _GRP_RESERVED=', '// 6자리 코드 하나를 구독한다')));
eval(asVar(sliceDev('async function _subscribeShared(', '// 그룹 하나를 이 기기 상태에 맞춘다')));
eval(asVar(sliceDev('async function _grpSync(', '// 들어가 있는 그룹을 하루 1회 맞춘다')));
eval(asVar(sliceDev('async function runGroupSync(', '// ══ 초대 주소 (block7.my/tlc)')));
eval(asVar(sliceDev('const _JOIN_KEY=', '// ── 그룹 만들기·고치기')));
eval(asVar(sliceDev('function _sharedVerseOut(', '// 소유자의 모음 내용을 shared')));
// 3자 병합 엔진 — 초대가 정말로 '더하기뿐'인지 진짜 병합기로 본다.
// ⚠️ 여기만 asVar 를 쓰지 않는다. `let _mgPreferCloud` 가 eval 안에 남아야
//    _fbMerge 가 그것을 보고 돈다 (test_merge.js 와 같은 방식).
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

// 교회가 발행해 둔 것
function seedChurch(codes){
  SHARED = {
    'tlc': { code:'tlc', kind:'group', name:'더사랑의교회',
             codes: codes || ['111111','222222'], ownerUid:'u-church', ownerIdPrefix:'chu' }
  };
  ['111111','222222','333333','444444','555555','666666','777777','888888'].forEach((c, i) => {
    SHARED[c] = { code:c, name:'모음'+(i+1), ownerUid:'u-church', ownerIdPrefix:'chu',
      verses:[{ cat:'주일', topic:'', krText:'구절'+(i+1), ref:'로마서 1:'+(i+1), tags:[], hi:'', d:'2026-09-07', pid:'P'+(i+1) }] };
  });
}

(async () => {

console.log('시나리오 1 — 주소를 한 모양으로 눕히고 가린다');
{
  sc.eq('대문자는 내려온다', _grpNameNorm('TLC'), 'tlc');
  sc.eq('앞뒤 공백을 턴다', _grpNameNorm('  tlc  '), 'tlc');
  sc.eq('주소를 통째로 붙여넣어도 된다', _grpNameNorm('https://block7.my/tlc'), 'tlc');
  sc.eq('끝 슬래시도 턴다', _grpNameNorm('block7.my/tlc/'.replace('block7.my','https://block7.my')), 'tlc');
  sc.eq('@ 를 턴다', _grpNameNorm('@tlc'), 'tlc');

  sc.eq('tlc 는 된다', _grpNameValid('tlc'), true);
  sc.eq('붙임표도 된다', _grpNameValid('tlc-main'), true);
  sc.eq('한 글자는 안 된다', _grpNameValid('t'), false);
  sc.eq('21글자는 안 된다', _grpNameValid('a'.repeat(21)), false);
  // ⚠️ 그룹 문서와 6자리 발행 문서가 **같은 칸(shared)** 에 산다. 숫자로 된
  //    이름을 허락하면 남의 발행 문서를 덮어쓴다.
  sc.eq('숫자만은 안 된다 (남의 발행 문서를 덮어쓴다)', _grpNameValid('123456'), false);
  sc.eq('숫자로 시작해도 안 된다', _grpNameValid('1tlc'), false);
  sc.eq('한글은 안 된다', _grpNameValid('교회'), false);
  sc.eq('예약어는 안 된다', _grpNameValid('index'), false);
  sc.eq('예약어 sweeter 도', _grpNameValid('sweeter'), false);
  sc.eq('보여 주는 주소에 물음표가 없다', _grpAddrShow('tlc'), 'block7.my/tlc');
}

console.log('\n시나리오 2 — 그룹 문서가 아닌 것을 그룹으로 읽지 않는다');
{
  resetST(); seedChurch();
  sc.eq('그룹은 그룹', (await _grpFetch('tlc')).name, '더사랑의교회');
  // ⚠️ 6자리 발행 문서에는 kind 가 없다. 그것을 그룹으로 읽으면 codes 가 비어
  //    보여 "다 빼라" 가 되어 버린다.
  sc.eq('6자리 발행 문서는 그룹이 아니다', await _grpFetch('111111'), null);
  sc.eq('없는 주소도 아니다', await _grpFetch('nowhere'), null);
  // 반대 방향 — 그룹 문서를 모음으로 구독하지 않는다
  SHARED['999999'] = { kind:'group', name:'x', codes:[] };
  sc.eq('그룹 문서는 모음으로 안 받는다', (await _subscribeShared('999999')).why, 'none');
}

console.log('\n시나리오 3 — 빈 기기로 block7.my/tlc 로 들어와 로그인하면 ⚠️');
{
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';                        // 404.html 이 적어 둔 것

  // ① 로그인 전에는 아무 일도 하지 않는다
  LOGGED_IN = false;
  let r = await _joinApply(false);
  sc.eq('로그인 전엔 받지 않는다', r.why, 'wait');
  sc.eq('저장도 없다', SAVES, 0);
  sc.eq('적어 둔 것은 남아 있다', LS[_JOIN_KEY], 'tlc');

  // ② 로그인은 됐지만 초기 클라우드 읽기가 **실패**했다 (_fbInitLoaded=false)
  //    → 쓰기가 막힌 기기다. 그 길에 사람이 누르지도 않은 변경을 얹지 않는다.
  LOGGED_IN = true;
  r = await _joinApply(false);
  sc.eq('클라우드를 못 읽었으면 받지 않는다', r.why, 'wait');
  sc.eq('여전히 저장 없음', SAVES, 0);
  sc.eq('버리지도 않는다 (다음 부팅에 다시)', LS[_JOIN_KEY], 'tlc');

  // ③ 클라우드를 읽어 ST 에 반영한 뒤에야 받는다
  ST.days = { '2026-09-01': { big:{ am:[{ text:'예전 할일', done:false }] }, small:{}, trash:[] } };
  ST.verseCollections = [{ id:'old', name:'내 모음', verses:[{ ref:'요한복음 3:16', krText:'말씀' }] }];
  ST.settings.activeColls = ['nav180','old'];
  r = await _joinApply(true);
  sc.eq('이제 받는다', r.done, true);
  sc.eq('묶음이 통째로 들어온다', r.added, 2);
  sc.eq('모음 둘이 더해졌다', getVerseCollections().filter(c => c.groupAddr === 'tlc').length, 2);
  sc.eq('그룹 이름도 적힌다', getVerseCollections()[1].groupName, '더사랑의교회');
  sc.eq('명제가 살아 온다', getVerseCollections()[1].verses[0].pid, 'P1');
  sc.eq('켜진 모음에 더해진다', ST.settings.activeColls, ['nav180','old','vc1','vc2']);
  sc.eq('들어간 그룹을 적어 둔다', ST.settings.groups, ['tlc']);

  // ⚠️ **아무것도 잃지 않는다**
  sc.eq('원래 할일 그대로', ST.days['2026-09-01'].big.am[0].text, '예전 할일');
  sc.eq('원래 모음 그대로', getVerseCollections()[0].id, 'old');
  sc.eq('적어 둔 것은 다 쓰고 지운다', LS[_JOIN_KEY], undefined);
}

console.log('\n시나리오 4 — 다른 기기의 클라우드를 지우지 않는다 ⚠️');
{
  resetST(); seedChurch(['111111','222222']);
  ST.days = { '2026-09-01': { big:{ am:[{ text:'예전 할일', done:false }] }, small:{}, trash:[] } };
  ST.verseCollections = [{ id:'old', name:'내 모음', verses:[] }];
  ST.settings.activeColls = ['nav180','old'];
  const base = clone(ST);
  const cloud = clone(ST);
  cloud.days['2026-09-02'] = { big:{ pm:[{ text:'다른 기기가 방금 넣은 할일', done:false }] }, small:{}, trash:[] };

  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  const local = clone(ST);

  const merged = _fbMerge(base, local, cloud, false);   // 손에 든 쪽 우선 (가장 불리한 조건)
  sc.eq('상대 기기 할일이 살아 있다',
        merged.days['2026-09-02'].big.pm[0].text, '다른 기기가 방금 넣은 할일');
  sc.eq('내 예전 할일도 살아 있다', merged.days['2026-09-01'].big.am[0].text, '예전 할일');
  sc.eq('원래 모음도 그대로', merged.verseCollections.some(c => c.id === 'old'), true);
  sc.eq('묶음이 더해졌다', merged.verseCollections.filter(c => c.groupAddr === 'tlc').length, 2);
  sc.eq('지워진 날짜가 없다', Object.keys(merged.days).sort(), ['2026-09-01','2026-09-02']);
}

console.log('\n시나리오 5 — 교회가 더하면 따라온다');
{
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('처음엔 둘', codesOf(), ['111111','222222']);

  SHARED['tlc'].codes = ['111111','222222','333333'];   // 교회가 하나 더했다
  const r = await runGroupSync();
  sc.eq('하루 갱신에서 따라온다', r.added, 1);
  sc.eq('이제 셋', codesOf(), ['111111','222222','333333']);
  sc.eq('새것도 켜져 있다', getActiveColls().includes(getVerseCollections()[2].id), true);

  // 또 돌려도 늘지 않는다
  const r2 = await runGroupSync();
  sc.eq('다시 돌려도 안 늘어난다', r2.added, 0);
  sc.eq('개수 그대로', getVerseCollections().length, 3);
}

console.log('\n시나리오 6 — 교회가 빼면 함께 빠진다 (그룹이 넣어 준 것만) ⚠️');
{
  resetST(); seedChurch(['111111','222222','333333']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  // 성도가 **따로** 만든 모음과, 6자리로 **따로** 구독한 모음
  ST.verseCollections.push({ id:'mine', name:'내가 만든 것', verses:[] });
  await _subscribeShared('888888');
  sc.eq('다섯 개가 있다', getVerseCollections().length, 5);

  SHARED['tlc'].codes = ['111111'];                // 교회가 둘을 뺐다
  const r = await runGroupSync();
  sc.eq('둘이 빠졌다', r.removed, 2);
  sc.eq('그룹 것 하나만 남는다',
        getVerseCollections().filter(c => c.groupAddr === 'tlc').map(c => c.importCode), ['111111']);
  // ⚠️ 여기가 핵심 — 그룹 밖의 것은 **하나도** 건드리지 않는다
  sc.eq('내가 만든 모음은 그대로', getVerseCollections().some(c => c.id === 'mine'), true);
  sc.eq('따로 구독한 모음도 그대로', getVerseCollections().some(c => c.importCode === '888888'), true);
  sc.eq('남은 것은 셋', getVerseCollections().length, 3);
  sc.eq('꺼진 모음 id 가 activeColls 에 안 남는다',
        getActiveColls().every(id => id === 'nav180' || getVerseCollections().some(c => c.id === id)), true);
  sc.eq('사람에게 알린다', TOASTS[TOASTS.length - 1], '교회 그룹에서 말씀 모음 2개가 빠졌어요');
}

console.log('\n시나리오 7 — 한꺼번에 많이 빠지면 멈춘다 (규모 상한) ⚠️');
{
  // 교회 관리자의 실수 한 번이 모든 성도에게 번지면 안 된다.
  resetST(); seedChurch(['111111','222222','333333','444444','555555','666666']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('여섯을 받았다', getVerseCollections().length, 6);

  SHARED['tlc'].codes = ['111111'];                // 다섯이 한꺼번에 빠졌다
  const r = await runGroupSync();
  sc.eq('지우지 않고 멈춘다', r.removed, 0);
  sc.eq('몇 개가 걸렸는지 안다', r.blocked, 5);
  sc.eq('여섯 개 그대로', getVerseCollections().length, 6);
  sc.eq('사람에게 알린다',
        TOASTS[TOASTS.length - 1], '교회 그룹에서 한꺼번에 5개가 빠져 있어 그대로 두었어요');

  // 셋까지는 지운다 (평범한 정리까지 막으면 기능이 안 돈다)
  resetST(); seedChurch(['111111','222222','333333','444444','555555','666666']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  SHARED['tlc'].codes = ['111111','222222','333333'];
  const r2 = await runGroupSync();
  sc.eq('셋은 그냥 빠진다', r2.removed, 3);
  sc.eq('셋이 남는다', getVerseCollections().length, 3);
}

console.log('\n시나리오 8 — 빈 목록으로는 아무것도 안 지운다 ⚠️');
{
  // "받아온 게 비어 있지 않다" 가 안전 조건이 못 되듯, 비어 있는 것은 더더욱
  // 근거가 못 된다 (2026-08-02 대량 삭제 사고).
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);

  SHARED['tlc'].codes = [];
  const r = await runGroupSync();
  sc.eq('하나도 안 지운다', r.removed, 0);
  sc.eq('둘 다 그대로', getVerseCollections().length, 2);

  delete SHARED['tlc'].codes;                      // 아예 키가 없는 문서
  const r2 = await runGroupSync();
  sc.eq('키가 없어도 안 지운다', r2.removed, 0);
  sc.eq('여전히 둘', getVerseCollections().length, 2);

  delete SHARED['tlc'];                            // 그룹 문서가 사라졌다
  const r3 = await runGroupSync();
  sc.eq('문서가 없어도 안 지운다', r3.removed, 0);
  sc.eq('여전히 둘', getVerseCollections().length, 2);
}

console.log('\n시나리오 9 — 도중에 네트워크가 끊기면 빼기를 하지 않는다 ⚠️');
{
  // 반만 받아 온 목록으로 지우면 멀쩡한 모음이 사라진다.
  resetST(); seedChurch(['111111','222222','333333']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('셋을 받았다', getVerseCollections().length, 3);

  // 교회가 하나 더했는데, 그 하나를 받다가 끊긴다
  SHARED['tlc'].codes = ['444444'];
  NETFAIL = ['444444'];
  const r = await _grpSync('tlc');
  sc.eq('물러난다', r.why, 'net');
  sc.eq('셋 다 그대로', getVerseCollections().length, 3);
  sc.eq('하나도 안 지웠다', getVerseCollections().filter(c => c.groupAddr === 'tlc').length, 3);

  // 그룹 문서 자체를 못 읽어도 마찬가지
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  NETFAIL = true;
  LS[_JOIN_KEY] = 'tlc';                 // 또 다른 기기에서 같은 주소로 들어왔다
  const r2 = await _joinApply(true);
  sc.eq('못 읽으면 기다린다', r2.why, 'net');
  sc.eq('적어 둔 것을 버리지 않는다', LS[_JOIN_KEY], 'tlc');
  sc.eq('모음 그대로', getVerseCollections().length, 2);
}

console.log('\n시나리오 10 — 주소는 모드 스위치가 아니다 ⚠️');
{
  // 2026-08-31 대량 손실의 조건은 "저장 칸은 갈렸는데 동기화 기준점은 안
  // 갈렸다" 였다. 주소마다 저장 칸을 만들면 그 조건이 그대로 재현된다.
  const i = SRC_DEV.indexOf('const LS_KEY =');
  const lsLine = SRC_DEV.slice(i, i + 200);
  sc.eq('저장 키는 주소를 안 본다', /join|group|grpAddr/i.test(lsLine), false);
  sc.eq('저장 키는 제품·개발본만 가른다',
        /APP_PRODUCT/.test(lsLine) && /DEV_MODE/.test(lsLine), true);
  // 그룹이 넣어 준 모음도 속은 평범한 6자리 구독이다 — 그래서 매일 갱신이
  // 예전 코드 그대로 돈다. (주소가 칸막이가 아니라는 증거이기도 하다)
  sc.eq('구독 기록은 6자리 코드', /importCode:code,/.test(SRC_DEV), true);
  // 구독을 만드는 곳은 한 곳뿐
  sc.eq('모음을 넣는 곳은 한 곳',
        (SRC_DEV.match(/ST\.verseCollections\.push\(\{\r?\n\s*id,name:data\.name/g) || []).length, 1);
  sc.eq('손으로 넣는 길도 같은 함수를 쓴다',
        /async function doSubscribe\(\)\{[\s\S]{0,700}await _subscribeShared\(code\)/.test(SRC_DEV), true);
  // 초대는 초기 읽기 성공을 반드시 보고 지나간다
  sc.eq('초대는 _fbInitLoaded 를 보고 지나간다', /_joinApply\(_fbInitLoaded\)/.test(SRC_DEV), true);
  sc.eq('때가 아니면 적어 둔 것을 지우지 않는다',
        /if\(!_fbReady\(\)\|\|!ready\)return\{done:false,why:'wait'\};/.test(SRC_DEV), true);
  // 그룹 문서에 verses 를 두지 않는다 (빈 모음으로 잘못 읽히지 않게)
  const saveFn = SRC_DEV.slice(SRC_DEV.indexOf('async function doSaveGroup('),
                               SRC_DEV.indexOf('function _grpShowAddr('));
  sc.eq('그룹 문서에 구절을 담지 않는다', /verses\s*:/.test(saveFn), false);
  sc.eq('그룹 문서에는 kind 표시가 있다', /kind:'group'/.test(saveFn), true);
}

console.log("\n시나리오 11 — 주소에 물음표가 안 나온다 (404.html 이 다리를 놓는다)");
{
  const SRC404 = fs.readFileSync(path.join(__dirname, '..', '404.html'), 'utf-8');
  // 이 다리는 EmailJS·Firebase <script> 보다 **먼저** 와야 한다. 그것들을
  // 기다렸다 넘기면 점검 페이지가 번쩍였다 사라진다.
  const iBridge = SRC404.indexOf("localStorage.setItem('b7v1_join'");
  const iHeavy = SRC404.indexOf('emailjs/browser');
  sc.eq('다리가 있다', iBridge > 0, true);
  sc.eq('무거운 스크립트보다 먼저다', iBridge < iHeavy, true);
  sc.eq('앱으로 넘긴다', /location\.replace\('\/'\)/.test(SRC404), true);
  // 앱이 읽는 칸 이름과 404.html 이 쓰는 칸 이름이 같아야 한다
  sc.eq('칸 이름이 앱과 같다', SRC_DEV.includes("const _JOIN_KEY='b7v1_join';"), true);
  // 주소 어디에도 물음표가 안 들어간다
  sc.eq('앱이 ?g= 를 쓰지 않는다', /\?g=/.test(SRC_DEV), false);
  sc.eq('404.html 도 ?g= 를 쓰지 않는다', /\?g=/.test(SRC404), false);

  // 점 없는 한 토막 주소만 그룹으로 본다 — 진짜 없는 파일은 점검 페이지가 뜬다.
  // ⚠️ 404.html 의 그 한 줄을 **글자 그대로** 확인한 뒤 같은 식을 세워 돌린다.
  //    (404.html 은 앱과 따로 사는 파일이라 떠올 수 있는 수단이 이것뿐이다)
  const RE_SRC = String.raw`/^\/([A-Za-z][A-Za-z0-9-]{1,19})\/?$/`;
  sc.eq('주소를 가리는 식이 그대로 있다', SRC404.includes(RE_SRC), true);
  const re = new RegExp(RE_SRC.slice(1, -1));
  sc.eq('/tlc 는 그룹으로 본다', re.test('/tlc'), true);
  sc.eq('/tlc/ 도 그룹으로 본다', re.test('/tlc/'), true);
  sc.eq('/icon.png 은 아니다', re.test('/icon.png'), false);
  sc.eq('/index-dev.html 도 아니다', re.test('/index-dev.html'), false);
  sc.eq('/a/b 처럼 두 토막도 아니다', re.test('/a/b'), false);
  sc.eq('/ 도 아니다', re.test('/'), false);
}

console.log('\n시나리오 12 — 내가 만든 모음은 다시 구독하지 않는다');
{
  // 교회(=나)가 내 그룹에 내 모음을 담으면, 내 기기에서는 그 모음이 이미 있다.
  // 그것을 구독으로 또 받으면 같은 것이 두 개가 된다.
  resetST(); seedChurch(['111111','222222']);
  ST.verseCollections = [{ id:'own', name:'내 명제집', shareCode:'111111', verses:[] }];
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('내 모음은 안 겹친다', getVerseCollections().filter(c => c.shareCode === '111111').length, 1);
  sc.eq('그것을 구독으로 또 받지 않는다',
        getVerseCollections().some(c => c.importCode === '111111'), false);
  sc.eq('나머지 하나만 받는다', getVerseCollections().length, 2);

  // 그리고 빼기가 내 모음을 건드리지 않는다 (groupAddr 표시가 없으므로)
  SHARED['tlc'].codes = ['222222'];
  await runGroupSync();
  sc.eq('내 모음은 그대로', getVerseCollections().some(c => c.shareCode === '111111'), true);
}

console.log('\n시나리오 13 — 6자리로 먼저 받아 둔 사람이 나중에 그룹에 들어오면');
{
  resetST(); seedChurch(['111111','222222']);
  await _subscribeShared('111111');                 // 먼저 코드로 하나 받아 뒀다
  sc.eq('하나 있다', getVerseCollections().length, 1);
  sc.eq('아직 그룹 표시는 없다', getVerseCollections()[0].groupAddr, '');

  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('겹치지 않는다', getVerseCollections().length, 2);
  sc.eq('먼저 받은 것에도 그룹 표시가 붙는다', getVerseCollections()[0].groupAddr, 'tlc');

  // 같은 주소로 또 들어와도 늘지 않는다
  LS[_JOIN_KEY] = 'tlc';
  const r = await _joinApply(true);
  sc.eq('두 번째는 안 늘어난다', r.added, 0);
  sc.eq('개수 그대로', getVerseCollections().length, 2);
  sc.eq('그룹도 한 번만 적힌다', ST.settings.groups, ['tlc']);
}

console.log('\n시나리오 14 — 사람이 직접 지운 모음은 되살아나지 않는다');
{
  // 그룹이 계속 넣어 주는데 지울 때마다 돌아오면 아무도 못 지운다.
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('둘을 받았다', getVerseCollections().length, 2);

  // 사람이 하나를 지웠다 (deleteCollection 이 하는 일 그대로)
  const gone = getVerseCollections().find(c => c.importCode === '111111');
  ST.settings.groupOptOut = ['111111'];
  ST.verseCollections = getVerseCollections().filter(c => c.id !== gone.id);

  const r = await runGroupSync();
  sc.eq('다시 넣지 않는다', r.added, 0);
  sc.eq('하나만 남아 있다', codesOf(), ['222222']);

  // 교회가 그것을 묶음에서 빼면, 지운 뜻은 거기서 끝난다
  SHARED['tlc'].codes = ['222222'];
  await runGroupSync();
  sc.eq('지운 기록이 지워진다', ST.settings.groupOptOut, []);

  // 교회가 나중에 다시 넣으면 그때는 받는다
  SHARED['tlc'].codes = ['111111','222222'];
  const r3 = await runGroupSync();
  sc.eq('다시 넣어 주면 받는다', r3.added, 1);
  sc.eq('둘이 됐다', codesOf(), ['111111','222222']);
}

console.log('\n시나리오 15 — 클라우드를 못 읽은 기기에서는 하루 갱신도 안 돈다 ⚠️');
{
  // 빼기가 도는 길이므로 _joinApply 와 **같은 조건**을 봐야 한다.
  // 쓰기가 막힌 기기에서 모음이 사라지면 사람은 영문을 모른다.
  resetST(); seedChurch(['111111','222222']);
  LS[_JOIN_KEY] = 'tlc';
  await _joinApply(true);
  sc.eq('둘을 받았다', getVerseCollections().length, 2);

  SHARED['tlc'].codes = ['111111'];
  CLOUD_READ_OK = false;                    // 초기 읽기 실패
  const r = await runGroupSync();
  sc.eq('아무것도 안 한다', r.ran, 0);
  sc.eq('빼지도 않는다', getVerseCollections().length, 2);

  CLOUD_READ_OK = true;                     // 읽기가 되면 그때 돈다
  const r2 = await runGroupSync();
  sc.eq('그때 빠진다', r2.removed, 1);
  sc.eq('하나 남는다', getVerseCollections().length, 1);
}

sc.done();

})();
