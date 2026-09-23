// 초대 주소가 **두 도메인에서** 똑같이 열리는가 (v26-0923-1)
//
// 교회 그룹 주소는 `block7.my/tlc` 와 `sweeter.my/tlc` 가 같아야 한다.
// 그런데 두 도메인은 **서로 다른 길**로 앱에 닿는다:
//
//   block7.my  (깃헙 페이지)        없는 주소 → 404.html → 적어 두고 / 로 넘김
//   sweeter.my (파이어베이스 호스팅) /tlc 를 **앱으로 바로 내준다**
//                                    (firebase.json 의 rewrites) → 404.html 을 안 지난다
//
// ⚠️ 2026-09-22 HB 신고 — sweeter.my/tlc 가 파이어베이스 **기본 404**("Page Not
//    Found")였다. 까닭이 둘이었다: ①호스팅에 /tlc 를 앱으로 넘기는 규칙이 없었고
//    ②build-sweeter/ 에 404.html 이 없었다. 그리고 규칙을 놓아도 앱이 주소를
//    **직접 읽지 않으면** 그냥 첫 화면이 되어 초대가 조용히 사라진다.
//
// 이 시험이 지키는 것은 하나다 — **두 길이 같은 주소를 받는다.**
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const fs = require('fs');
const path = require('path');
const sc = makeScorer();

const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf-8');
const SRC404 = R('404.html');
const FIREBASE = JSON.parse(R('firebase.json'));
const MKPROD = R('tools/make-sweeter-prod.sh');

// ── 앱 대역 ──
let LS = {};
global.localStorage = {
  getItem: k => (k in LS ? LS[k] : null),
  setItem: (k, v) => { LS[k] = String(v); },
  removeItem: k => { delete LS[k]; }
};
let PATH = '/', SEARCH = '', HASH = '', REPLACED = null;
global.location = {
  get origin(){ return 'https://sweeter.my'; },
  get pathname(){ return PATH; },
  get search(){ return SEARCH; },
  get hash(){ return HASH; }
};
global.history = { replaceState: (a, b, url) => { REPLACED = url; } };

// ── 진짜 코드를 떠온다 (바로 도는 줄은 뺀다) ──
eval(asVar(sliceDev('const _GRP_RESERVED=', '// 6자리 코드 하나를 구독한다')));
eval(asVar(sliceDev('const _JOIN_KEY=', '// ── 그룹 만들기·고치기')
  .replace(/^_joinFromPath\(\);.*$/m, '')));

function go(p, search, hash){
  LS = {}; REPLACED = null;
  PATH = p; SEARCH = search || ''; HASH = hash || '';
  return _joinFromPath();
}

console.log('시나리오 1 — 파이어베이스 호스팅 길: 앱이 주소를 직접 읽는다');
{
  sc.eq('/tlc 를 집는다', go('/tlc'), 'tlc');
  sc.eq('적어 둔다', LS[_JOIN_KEY], 'tlc');
  // 길은 지운다 — 남겨 두면 새로고침마다 같은 일을 되풀이한다
  sc.eq('길을 지운다', REPLACED, '/');
  sc.eq('끝 슬래시도 같다', go('/tlc/'), 'tlc');
  sc.eq('대문자로 들어와도 같은 곳', go('/TLC'), 'tlc');
  sc.eq('붙임표도 된다', go('/tlc-main'), 'tlc-main');
}

console.log('\n시나리오 2 — 깃헙 페이지 길은 그대로 지나간다');
{
  // block7.my 는 앱이 늘 / 로 선다. 주소를 집는 일은 404.html 이 맡는다.
  sc.eq('/ 에서는 아무 일도 없다', go('/'), '');
  sc.eq('적지도 않는다', LS[_JOIN_KEY], undefined);
  sc.eq('주소를 건드리지 않는다', REPLACED, null);
  // 깃헙 페이지의 개발본도 마찬가지 (점이 있어 한 토막으로 안 본다)
  sc.eq('/index-dev.html 은 아니다', go('/index-dev.html'), '');
  sc.eq('그때도 주소를 안 건드린다', REPLACED, null);
}

console.log('\n시나리오 3 — 알림 클릭이 싣고 온 것을 잃지 않는다 ⚠️');
{
  // ?verse= 는 푸시 알림이 전체화면을 열려고 싣고 온 것이다.
  // 길만 지우고 질의는 **남겨야** 한다.
  sc.eq('주소를 집는다', go('/tlc', '?verse=%EC%9A%943%3A16'), 'tlc');
  sc.eq('?verse= 는 남는다', REPLACED, '/?verse=%EC%9A%943%3A16');
  sc.eq('# 도 남는다', (go('/tlc', '', '#x'), REPLACED), '/#x');
}

console.log('\n시나리오 4 — 쓸 수 없는 이름은 안 적는다');
{
  sc.eq('예약어는 안 적는다', go('/index'), '');
  sc.eq('정말 안 적었다', LS[_JOIN_KEY], undefined);
  // ⚠️ 그래도 길은 지운다 — 안 그러면 새로고침마다 되풀이한다
  sc.eq('길은 지운다', REPLACED, '/');
  sc.eq('한 글자는 안 된다', go('/t'), '');
  sc.eq('숫자로 시작하면 안 된다', go('/123456'), '');
  sc.eq('두 토막은 아예 안 본다', go('/a/b'), '');
  sc.eq('두 토막이면 주소도 안 건드린다', REPLACED, null);
  sc.eq('점이 있으면 안 본다 (진짜 파일)', go('/icon.png'), '');
}

console.log('\n시나리오 5 — 두 길이 **같은 주소**를 받는다 ⚠️');
{
  // ⚠️ 여기가 이 시험의 핵심이다. 가리는 식이 한쪽만 바뀌면 도메인마다
  //    되는 주소가 달라진다 — 그러면 같은 초대 링크가 어디서는 되고
  //    어디서는 안 되는, 아무도 못 고치는 버그가 된다.
  const RE_SRC = String.raw`/^\/([A-Za-z][A-Za-z0-9-]{1,19})\/?$/`;
  sc.eq('404.html 의 식', SRC404.includes(RE_SRC), true);
  sc.eq('앱의 식도 글자까지 같다', SRC_DEV.includes(RE_SRC), true);
  // 적어 두는 칸 이름도 같아야 한다 (404.html 이 쓰고 앱이 읽는다)
  sc.eq('404.html 이 쓰는 칸', SRC404.includes("localStorage.setItem('b7v1_join'"), true);
  sc.eq('앱이 읽는 칸', SRC_DEV.includes("const _JOIN_KEY='b7v1_join';"), true);
  // 주소 어디에도 물음표가 안 들어간다
  sc.eq('앱이 ?g= 를 쓰지 않는다', /\?g=/.test(SRC_DEV), false);
  sc.eq('404.html 도 안 쓴다', /\?g=/.test(SRC404), false);
}

console.log('\n시나리오 6 — 파이어베이스 호스팅이 /tlc 를 앱으로 내준다');
{
  const h = (FIREBASE.hosting || []).find(x => x.site === 'sweeter7');
  sc.eq('sweeter7 사이트가 있다', !!h, true);
  sc.eq('올리는 폴더는 build-sweeter', h.public, 'build-sweeter');
  const rw = h.rewrites || [];
  sc.eq('한 토막 주소를 앱으로 넘긴다',
        rw.some(r => r.source === '/:addr' && r.destination === '/index.html'), true);
  // ⚠️ 통째로 넘기면(**) 진짜 없는 파일까지 앱이 되어, 무엇이 잘못됐는지
  //    아무도 모르게 된다. 파이어베이스는 **있는 파일을 먼저** 내주므로
  //    icon.png·manifest.json 은 이 규칙과 상관없이 그대로 나간다.
  sc.eq('통째로 넘기지 않는다', rw.some(r => r.source === '**'), false);
}

console.log('\n시나리오 7 — Sweeter 산출물에 점검 페이지가 들어간다');
{
  // 없으면 파이어베이스의 기본 404("Page Not Found")가 그대로 보인다.
  sc.eq('404.html 을 담는다', MKPROD.includes("build-sweeter/404.html"), true);
  sc.eq('원본 404.html 에서 만든다', MKPROD.includes("io.open('404.html'"), true);
  // sweeter.my 에서 'BLOCK7' 이 보이면 안 된다
  sc.eq('탭 제목을 Sweeter 로', MKPROD.includes("'<title>Sweeter</title>'"), true);
  sc.eq('로고도 Sweeter 로', MKPROD.includes('<div class="logo">Sweeter</div>'), true);
  sc.eq('쪽지 꼬리표도 Sweeter 로', MKPROD.includes('Sweeter 점검 페이지'), true);

  // ⚠️ build-sweeter/ 는 커밋하지 않는다 (커밋하면 block7.my 에 로그인이 켜진
  //    Sweeter 가 함께 생긴다). 그래서 산출물이 아니라 **만드는 법**을 본다.
  sc.eq('산출물은 커밋하지 않는다',
        R('.gitignore').includes('build-sweeter/'), true);
}

sc.done();
