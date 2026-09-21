// 백업이 담는 범위 — 제품마다 다르다 (v26-0921-8, HB 4-5)
//
// ⚠️ 데이터를 내보내고 **되살리는** 경로다. CLAUDE.md 가 "테스트 먼저" 라고
//    못 박은 자리라, 문자열 검사가 아니라 **실제로 돌려** 본다.
//
// 지켜야 할 것 둘 —
//  ① Sweeter 백업에는 **할일이 들어가지 않는다.** 남의 할일이 든 파일을
//     되살렸을 때 무슨 일이 날지 예측할 수 없다 (HB).
//  ② Sweeter 에서 되살릴 때도 **할일을 건드리지 않는다.** 클라우드 문서는
//     두 제품이 같이 쓰므로, 여기서 덮으면 BLOCK7 이 지금 쓰는 것이
//     옛 파일로 되돌아간다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 무대 ──────────────────────────────────────────────────────────
let APP_PRODUCT = 'block7';
function _swOn(){ return APP_PRODUCT === 'sweeter'; }

let ST, SECS;
const calls = [];
function beforeSave(){ calls.push('beforeSave'); }
function save(){ calls.push('save'); }
function _secsCommit(){ calls.push('_secsCommit'); }
function renderSettingsPanel(){}
function renderToday(){}
function updateTrashBadge(){}
function showToast(){}
function applyTheme(){ calls.push('applyTheme'); }
function applyUiScale(){ calls.push('applyUiScale'); }
function _swRender(){ calls.push('_swRender'); }

let CONFIRM = true, ALERTED = null;
global.confirm = () => CONFIRM;
global.alert = (m) => { ALERTED = m; };
const FILE_INPUT = { value: 'x' };
global.document = { getElementById: id => (id === 'importFileInput2' ? FILE_INPUT : null) };
// 진짜 FileReader 대신 — onload 를 곧바로 부른다
global.FileReader = class { readAsText(f){ this.onload({ target: { result: f.text } }); } };

function freshState(){
  ST = {
    days: { '2026-09-20': { todo: { am: [{ t: '내 할일' }] } } },
    vis: ['am'], collapsed: [], secArchive: [{ id: 'old' }],
    verseCollections: [{ id: 'c1', name: '내 모음', verses: [{ ref: '요 3:16' }] }],
    memorizationLog: { '2026-09-20': { am: [{ ref: '요 3:16' }] } },
    verseLikeLog: {}, verseShareLog: {}, verseDeeperLog: {},
    verseEvenDeeperLog: {}, verseKeepLog: { '2026-09-20': [{ ref: '시 1:1' }] },
    productSettings: { sweeter: { theme: 'light' } },
    settings: { theme: 'dark', uiLevel: 'power', bigLimit: 7, swTiles: ['a'] }
  };
  SECS = [{ id: 'am', name: '오전' }];
}

const _PRODUCT_SCOPED = ['uiLevel','verseUiLevel','uiLevelIconSet','theme','themePresetId','swTiles'];

// 코드 떠오기 — 주석까지 그대로 (표시 문자열이 사라지면 로더가 크게 운다)
eval(sliceDev("// ── 백업에 담는 '말씀 쪽'", 'function exportBackup(){')
       .replace(/^const /gm, 'var '));
eval(sliceDev('function importBackup(file){', '\n// ── Auto carry-over'));

// ═══ 1. BLOCK7 백업 — 예전 것 + 말씀 ═══
console.log('시나리오 1 — BLOCK7 백업에 담기는 것');
{
  APP_PRODUCT = 'block7'; freshState();
  const p = _backupPayload();
  sc.eq('앱 이름표', p.app, 'BLOCK7');
  sc.eq('범위 표시', p.scope, 'all');
  sc.eq('할일이 담긴다', !!p.days['2026-09-20'], true);
  sc.eq('구간이 담긴다', p.secs.length, 1);
  sc.eq('보관 구간도 담긴다', p.secArchive.length, 1);
  sc.eq('설정이 담긴다', p.settings.bigLimit, 7);
  // ⭐ 예전에는 말씀이 아예 안 담겼다 (백업이 반쪽이었다)
  sc.eq('⭐ 말씀 모음도 담긴다', p.verseCollections.length, 1);
  sc.eq('⭐ 암송 기록도 담긴다', !!p.memorizationLog['2026-09-20'], true);
  sc.eq('⭐ 담아둔 것도 담긴다', !!p.verseKeepLog['2026-09-20'], true);
  sc.eq('다른 제품 취향도 지고 간다', p.productSettings.sweeter.theme, 'light');
}

// ═══ 2. Sweeter 백업 — 말씀 쪽만 ═══
console.log('\n시나리오 2 — Sweeter 백업에는 할일이 없다');
{
  APP_PRODUCT = 'sweeter'; freshState();
  const p = _backupPayload();
  sc.eq('앱 이름표', p.app, 'Sweeter');
  sc.eq('범위 표시', p.scope, 'verse');
  sc.eq('⭐ 할일이 안 담긴다', p.days, undefined);
  sc.eq('⭐ 구간이 안 담긴다', p.secs, undefined);
  sc.eq('⭐ 공용 설정이 통째로 안 담긴다', p.settings, undefined);
  sc.eq('말씀 모음은 담긴다', p.verseCollections.length, 1);
  sc.eq('암송 기록도 담긴다', !!p.memorizationLog['2026-09-20'], true);
  // 화면 취향은 **지금 화면 값**에서 뽑는다 (ST.productSettings 는 저장 때 채워진다)
  sc.eq('Sweeter 취향이 담긴다', p.productSettings.sweeter.theme, 'dark');
  sc.eq('타일 구성도 담긴다', p.productSettings.sweeter.swTiles, ['a']);
  sc.eq('남의 제품 칸은 안 만든다', p.productSettings.block7, undefined);
}

// ═══ 3. Sweeter 에서 되살리면 할일은 그대로 ═══
console.log('\n시나리오 3 — ⭐ Sweeter 복원은 할일을 건드리지 않는다');
{
  // 남의 할일이 잔뜩 든 **BLOCK7 전체 백업**을 Sweeter 에서 불러온다
  APP_PRODUCT = 'block7'; freshState();
  const full = _backupPayload();
  full.days = { '2020-01-01': { todo: { am: [{ t: '아주 옛날 할일' }] } } };
  full.secs = [{ id: 'zzz', name: '엉뚱한 구간' }];
  full.settings = { bigLimit: 99, theme: 'light' };
  full.verseCollections = [{ id: 'c2', name: '백업 모음' }];
  full.productSettings = { sweeter: { theme: 'light', swTiles: ['z'] } };

  APP_PRODUCT = 'sweeter'; freshState();
  calls.length = 0; CONFIRM = true; ALERTED = null;
  importBackup({ text: JSON.stringify(full) });

  sc.eq('⭐ 할일은 그대로', ST.days['2026-09-20'].todo.am[0].t, '내 할일');
  sc.eq('⭐ 옛 할일이 들어오지 않았다', ST.days['2020-01-01'], undefined);
  sc.eq('⭐ 구간도 그대로', SECS[0].id, 'am');
  sc.eq('⭐ 공용 설정도 그대로', ST.settings.bigLimit, 7);
  sc.eq('구간 정리를 부르지 않는다', calls.includes('_secsCommit'), false);
  sc.eq('말씀은 되살아났다', ST.verseCollections[0].id, 'c2');
  sc.eq('이 제품 취향은 되살아났다', ST.settings.theme, 'light');
  sc.eq('타일 구성도 되살아났다', ST.settings.swTiles, ['z']);
  sc.eq('⭐ 저장까지 한다', calls.includes('save'), true);
  sc.eq('판을 다시 그린다', calls.includes('_swRender'), true);
}

// ═══ 4. BLOCK7 복원은 예전 그대로 + 말씀 ═══
console.log('\n시나리오 4 — ⭐ BLOCK7 복원은 예전 그대로');
{
  APP_PRODUCT = 'sweeter'; freshState();
  const swBak = _backupPayload();          // 말씀만 든 Sweeter 백업

  APP_PRODUCT = 'block7'; freshState();
  calls.length = 0; CONFIRM = true;
  const full = { app:'BLOCK7', scope:'all',
    days:{ '2020-01-01': { todo:{ am:[{ t:'옛 할일' }] } } },
    secs:[{ id:'zzz' }], secArchive:[{ id:'arc' }],
    settings:{ bigLimit: 99 }, vis:['pm'], collapsed:['x'],
    verseCollections:[{ id:'c9' }],
    productSettings:{ sweeter:{ theme:'light' } } };
  importBackup({ text: JSON.stringify(full) });
  sc.eq('할일이 되살아난다', !!ST.days['2020-01-01'], true);
  sc.eq('구간이 되살아난다', SECS[0].id, 'zzz');
  sc.eq('보관 구간도', ST.secArchive[0].id, 'arc');
  sc.eq('설정이 되살아난다', ST.settings.bigLimit, 99);
  sc.eq('보임 목록도', ST.vis, ['pm']);
  sc.eq('말씀도 함께', ST.verseCollections[0].id, 'c9');
  sc.eq('다른 제품 취향도 지고 간다', ST.productSettings.sweeter.theme, 'light');
  sc.eq('구간 정리를 부른다', calls.includes('_secsCommit'), true);

  // Sweeter 백업을 BLOCK7 에서 불러도 — 말씀만 들어오고 할일은 안 지워진다
  APP_PRODUCT = 'block7'; freshState();
  importBackup({ text: JSON.stringify(swBak) });
  sc.eq('⭐ Sweeter 백업을 BLOCK7 에서: 할일 안 지워짐', ST.days['2026-09-20'].todo.am[0].t, '내 할일');
  sc.eq('말씀은 들어온다', ST.verseCollections[0].id, 'c1');
}

// ═══ 5. 말씀이 없는 파일은 Sweeter 가 거절한다 ═══
console.log('\n시나리오 5 — Sweeter 는 말씀 없는 파일을 거절한다');
{
  APP_PRODUCT = 'sweeter'; freshState();
  calls.length = 0; ALERTED = null; CONFIRM = true;
  importBackup({ text: JSON.stringify({ app:'BLOCK7', days:{ '2020-01-01':{} } }) });
  sc.eq('알려 준다', /말씀 데이터가 없어요/.test(ALERTED || ''), true);
  sc.eq('아무것도 저장하지 않는다', calls.length, 0);
  sc.eq('할일은 그대로', ST.days['2026-09-20'].todo.am[0].t, '내 할일');
}

// ═══ 6. 취소하면 아무 일도 없다 ═══
console.log('\n시나리오 6 — 물음에 아니오');
{
  APP_PRODUCT = 'sweeter'; freshState();
  calls.length = 0; CONFIRM = false;
  importBackup({ text: JSON.stringify({ verseCollections:[{ id:'c9' }] }) });
  sc.eq('되살리지 않는다', ST.verseCollections[0].id, 'c1');
  sc.eq('저장도 안 한다', calls.length, 0);
  CONFIRM = true;
}

// ═══ 7. 파일 고르기 칸을 비운다 ═══
console.log('\n시나리오 7 — 같은 파일을 두 번 고를 수 있다');
{
  // 예전에는 없는 id('importFileInput')를 비우려다 예외가 나서 칸이 안 비었고,
  // **같은 파일을 연달아 고르면 아무 일도 안 일어났다.**
  APP_PRODUCT = 'block7'; freshState();
  FILE_INPUT.value = 'some.json';
  importBackup({ text: JSON.stringify({ verseCollections: [] }) });
  sc.eq('칸을 비운다', FILE_INPUT.value, '');
}

sc.done();
