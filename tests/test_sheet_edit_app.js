// 시트 편집 문 — 앱 쪽 (R-4b, v26-1010-18): 주소 붙여 두기 · 문 부르기 · [연결 확인]
//
// HB: "두 탭 모두 고쳐줘. 앱스 스크립트 설치 안내해줘."
// 앱스 스크립트(sheet-edit/Code.gs)를 HB 가 설치하면 웹 앱 주소가 생긴다. 그 주소를
// 설정 → 계정 → '시트 편집 문' 에 붙여 두고 [연결 확인] 으로 시험한다.
//   · 주소는 ST.settings.sheetEditUrl — 클라우드 문서(HB 만 읽는다)에만 있고 저장소에는 없다.
//   · 두 제품이 같이 쓴다 (_PRODUCT_SCOPED 에 넣지 않는다) — 한 번 붙이면 다른 기기·Sweeter 도.
//   · 문을 부를 때 Content-Type 을 붙이지 않는다 (앱스 스크립트는 미리 묻기(OPTIONS)를 못 받는다).
//     로그인 표도 머리말이 아니라 본문에.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 시계 ──
let timers = [], seq = 0;
global.setTimeout = (fn, ms) => { const id = ++seq; timers.push({ id, ms, fn }); return id; };
global.clearTimeout = id => { timers = timers.filter(t => t.id !== id); };
const settle = async () => { for (let i = 0; i < 6; i++) await new Promise(r => setImmediate(r)); };

// ── 둘레 흉내 ──
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));   // _fbMerge (3자 병합)
let ST = { settings: {} }, SAVES = 0, USER = { getIdToken: async () => 'TOKEN-123' }, COLLS = [];
global.ST = ST;
global.save = () => { SAVES++; };
global.firebase = { auth: () => ({ currentUser: USER }) };
global.getVerseCollections = () => COLLS;
global._sheetUrlForVerse = v => v.__url ? { url: v.__url } : null;
let CALLS = [], ANSWER = null;
let TIMERS_AT_FETCH = [];
global.fetch = async (url, opt) => {
  CALLS.push({ url, opt });
  TIMERS_AT_FETCH = timers.map(t => t.ms);
  const a = typeof ANSWER === 'function' ? ANSWER(JSON.parse(opt.body)) : ANSWER;
  if (a instanceof Error) throw a;
  return { json: async () => { if (typeof a === 'string') throw new SyntaxError('Unexpected token <'); return a; } };
};
global.AbortController = class { constructor() { this.signal = { aborted: false }; } abort() { this.signal.aborted = true; } };
const EL = {};
global.document.getElementById = id => EL[id] || null;
eval(slice('// ══ 시트 편집 문 — 구글 앱스 스크립트 웹 앱', 'function _vgOpenFromReels(kind){').replace(/^const /gm, 'var '));

const URL1 = 'https://script.google.com/macros/s/AKfycbz1234567890abcdefghijklmnopqrstuvwxyzABCD/exec';

(async () => {
  console.log('시나리오 1 — 붙여 넣은 주소 다듬기');
  {
    const N = _sheetEditUrlNorm;
    sc.eq('웹 앱 주소 그대로', N(URL1), URL1);
    sc.eq('앞뒤 빈칸은 뗀다', N('  ' + URL1 + '\n'), URL1);
    sc.eq('여러 계정 PC 의 /u/1/ 은 뺀다 (그 주소는 앱에서 안 열린다)', N(URL1.replace('/macros/', '/macros/u/1/')), URL1);
    sc.eq('회사 계정 모양(/a/macros/도메인/)도 받는다',
      N('https://script.google.com/a/macros/church.org/s/AKfycbz1234567890abcdefghij/exec'), 'https://script.google.com/a/macros/church.org/s/AKfycbz1234567890abcdefghij/exec');
    sc.eq('시험용 /dev 주소는 안 된다 (HB 로그인 없이는 못 연다)', N(URL1.replace(/exec$/, 'dev')), '');
    sc.eq('편집기 주소는 안 된다', N('https://script.google.com/home/projects/1abc/edit'), '');
    sc.eq('http 는 안 된다', N(URL1.replace('https', 'http')), '');
    sc.eq('다른 곳은 안 된다', N('https://evil.example.com/macros/s/AKfycbz1234567890abcdefghij/exec'), '');
    sc.eq('빈 것', [N(''), N(null), N(undefined)], ['', '', '']);
  }

  console.log('\n시나리오 2 — 문 부르기');
  {
    ST.settings.sheetEditUrl = URL1; ANSWER = { ok: true, v: 1, who: 'denartist@gmail.com' }; CALLS = [];
    const j = await _sheetEditCall({ op: 'ping' });
    sc.eq('저장된 주소로 간다', CALLS[0].url, URL1);
    sc.eq('POST · 머리말 없음 (Content-Type 을 붙이면 미리 묻기가 생겨 앱스 스크립트가 못 받는다)',
      [CALLS[0].opt.method, CALLS[0].opt.headers], ['POST', undefined]);
    sc.eq('로그인 표는 본문에 싣는다', JSON.parse(CALLS[0].opt.body), { op: 'ping', token: 'TOKEN-123' });
    sc.eq('대답을 그대로 돌려준다', j, { ok: true, v: 1, who: 'denartist@gmail.com' });
    ANSWER = '<html>Google 로그인</html>';
    sc.eq('로그인 화면 같은 HTML 이 오면 "대답 없음"', (await _sheetEditCall({ op: 'ping' })).error, 'noanswer');
    ANSWER = new TypeError('Failed to fetch');
    sc.eq('연결이 안 되면 "대답 없음"', (await _sheetEditCall({ op: 'ping' })).error, 'noanswer');
    timers = []; ANSWER = { ok: true, v: 1 };
    await _sheetEditCall({ op: 'ping' });
    sc.eq('25초 넘게 걸리면 끊는 시계를 걸고, 끝나면 푼다', [TIMERS_AT_FETCH, timers.length], [[25000], 0]);
    const pre = CALLS.length;
    USER = null;
    sc.eq('로그인 안 했으면 부르지 않는다', [(await _sheetEditCall({ op: 'ping' })).error, CALLS.length - pre], ['nologin', 0]);
    USER = { getIdToken: async () => 'TOKEN-123' };
    ST.settings.sheetEditUrl = '';
    sc.eq('주소가 없으면 부르지 않는다', [(await _sheetEditCall({ op: 'ping' })).error, CALLS.length - pre], ['nourl', 0]);
  }

  // [연결 확인] — 입력칸 · 알림줄 흉내
  const ui = v => { EL.sheetEditUrlInput = { value: v }; EL.sheetEditStatus = { textContent: '', style: {} }; return EL.sheetEditStatus; };
  const PROPV = { pid: 'P0333', __url: 'https://docs.google.com/spreadsheets/d/1fDVyeYIxd4gEGK2s5OEzG6kmxRPbabBEzJ5uEpL/edit#gid=777&range=A136:G136' };
  const ok = req => req.op === 'ping' ? { ok: true, v: 1, who: 'denartist@gmail.com' }
    : { ok: true, v: 1, tabs: [{ ok: true, gid: 777, name: '성도 공유용', row: 136 }] };

  console.log('\n시나리오 3 — [연결 확인]: 주소를 저장하고 · 인사하고 · 명제 한 줄을 읽어 본다');
  {
    ST.settings = {}; SAVES = 0; CALLS = []; COLLS = [{ verses: [{ ref: '요 3:16' }, PROPV] }]; ANSWER = ok;
    const st = ui(URL1.replace('/macros/', '/macros/u/1/'));
    await sheetEditCheck(); await settle();
    sc.eq('다듬은 주소를 저장한다', [ST.settings.sheetEditUrl, SAVES, EL.sheetEditUrlInput.value], [URL1, 1, URL1]);
    sc.eq('인사(ping) 다음 그 명제의 행을 읽는다', CALLS.map(c => JSON.parse(c.opt.body)), [
      { op: 'ping', token: 'TOKEN-123' },
      { op: 'read', id: '1fDVyeYIxd4gEGK2s5OEzG6kmxRPbabBEzJ5uEpL', tabs: [{ gid: 777, find: { match: { '명제 ID': 'P0333' } } }], token: 'TOKEN-123' }]);
    sc.eq('된 것을 알려 준다', st.textContent, "연결됐어요 ✓ denartist@gmail.com · '성도 공유용' 136행(P0333)을 읽었어요 (문 v1)");
    SAVES = 0; ui(URL1); await sheetEditCheck(); await settle();
    sc.eq('같은 주소로 다시 확인하면 저장을 또 하지 않는다', SAVES, 0);
    COLLS = [{ verses: [{ ref: '요 3:16' }] }];
    const st2 = ui(URL1); await sheetEditCheck(); await settle();
    sc.eq('명제가 없으면 인사만', st2.textContent, '연결됐어요 ✓ denartist@gmail.com 로 확인 (문 v1)');
  }

  console.log('\n시나리오 4 — [연결 확인]: 안 될 때 무엇을 고칠지 알려 준다');
  {
    COLLS = [{ verses: [PROPV] }];
    const run = async (input, answer) => { ST.settings = { sheetEditUrl: URL1 }; SAVES = 0; CALLS = []; ANSWER = answer; const st = ui(input); await sheetEditCheck(); await settle(); return st.textContent; };
    sc.eq('웹 앱 주소가 아니면 저장하지 않는다', [await run('https://script.google.com/home', ok), SAVES, ST.settings.sheetEditUrl, CALLS.length],
      ['웹 앱 주소(…/exec 로 끝나는 것)를 붙여 넣어 주세요', 0, URL1, 0]);
    sc.eq('비우면 문을 뗀다', [await run('  ', ok), ST.settings.sheetEditUrl, SAVES], ['주소를 비웠어요', '', 1]);
    sc.eq("'모든 사용자' 로 배포하지 않았으면 (로그인 화면이 온다)", await run(URL1, '<html>'),
      "문이 대답하지 않아요 — 배포할 때 액세스 권한을 '모든 사용자' 로 했는지 확인해 주세요");
    sc.eq('HB 계정이 아니면', await run(URL1, { ok: false, v: 1, error: 'owner' }), '이 계정으로는 쓸 수 없는 문이에요');
    sc.eq('로그인 표 확인 실패', await run(URL1, { ok: false, v: 1, error: 'auth', detail: 'lookup 400' }),
      '로그인 확인에 실패했어요 — 로그아웃했다가 다시 로그인한 뒤 해 보세요');
    sc.eq('문이 옛 버전이면 새 버전으로 배포하라고', await run(URL1, { ok: true, v: 0, who: 'denartist@gmail.com' }),
      "문이 옛 버전이에요 (v0) — 설치 안내의 '코드가 바뀌었을 때' 대로 새 버전으로 배포해 주세요");
    sc.eq('인사는 됐는데 시트를 못 읽으면', await run(URL1, req => req.op === 'ping' ? { ok: true, v: 1, who: 'denartist@gmail.com' }
      : { ok: true, v: 1, tabs: [{ ok: false, gid: 777, error: 'notfound' }] }), '연결은 됐는데 시트를 못 읽었어요 — 시트에서 그 행을 못 찾았어요');
    sc.eq('모르는 오류는 이름이라도', await run(URL1, { ok: false, v: 1, error: 'internal', detail: 'x' }), '문이 처리하지 못했어요 (internal)');
    sc.eq('주소를 고치는 동안에도 저장은 된다 (고친 뒤 다시 확인만 하면 된다)', ST.settings.sheetEditUrl, URL1);
  }

  console.log('\n시나리오 5 — 주소는 두 제품·모든 기기가 같이 쓴다 (동기화)');
  {
    const m1 = _fbMerge({ settings: {} }, { settings: { theme: 'dark' } }, { settings: { theme: 'dark', sheetEditUrl: URL1 } });
    sc.eq('PC 에서 붙인 주소가 아이폰에도 온다', m1.settings.sheetEditUrl, URL1);
    // CLAUDE.md — "빈 기기로 로그인하면 클라우드가 어떻게 되는가": 기준점 없이(base=null) 기본값뿐인 기기
    const fresh = _fbMerge(null, { settings: { theme: 'system', autoCarryOver: false } },
                           { settings: { theme: 'dark', sheetEditUrl: URL1 } });
    sc.eq('빈 기기로 로그인해도 클라우드의 주소를 지우지 않고 받아 온다', fresh.settings.sheetEditUrl, URL1);
    const m2 = _fbMerge({ settings: { sheetEditUrl: URL1 } }, { settings: { sheetEditUrl: '' } }, { settings: { sheetEditUrl: URL1 } });
    sc.eq('한 기기에서 비우면 비운 것이 이긴다', m2.settings.sheetEditUrl, '');
    const scoped = SRC.slice(SRC.indexOf('const _PRODUCT_SCOPED=['), SRC.indexOf('];', SRC.indexOf('const _PRODUCT_SCOPED=[')));
    sc.eq('제품마다 따로 두지 않는다 (_PRODUCT_SCOPED 에 없다)', scoped.length > 20 && !scoped.includes('sheetEditUrl'), true);
    sc.eq('설정 바뀜 풀이에 사람 말 이름이 있다', /sheetEditUrl:'시트 편집 문 주소'/.test(SRC), true);
  }

  console.log('\n시나리오 6 — 화면: 개발자 계정에만 · 설정을 열면 저장된 주소');
  {
    const html = SRC.slice(SRC.indexOf('id="sheetEditSection"'), SRC.indexOf('<!-- /시트 편집 문 -->'));
    sc.eq('처음엔 숨겨 둔다', /id="sheetEditSection" style="display:none;"/.test(html), true);
    sc.eq('입력칸 · 연결 확인 · 알림줄', ['id="sheetEditUrlInput"', 'onclick="sheetEditCheck()"', 'id="sheetEditStatus"'].map(s => html.includes(s)), [true, true, true]);
    sc.eq('설치 안내로 가는 길', html.includes('https://block7.my/sheet-edit/'), true);
    const vis = SRC.slice(SRC.indexOf('function _syncDevInboxVisibility(){'), SRC.indexOf('// 확인한 쪽지 id'));
    sc.eq('개발자 계정에만 보인다 (_syncDevInboxVisibility)', vis.includes("['sheetEditSection']"), true);
    sc.eq('설정창을 열면 저장된 주소를 채운다',
      SRC.includes("{const se=document.getElementById('sheetEditUrlInput');if(se)se.value=s.sheetEditUrl||'';}"), true);
  }

  sc.done();
})();
