// 새 버전이 기기에 들어오는 길 (v26-0921-10, HB 신고)
//
// HB: "웹앱을 종료하고 새로 열어도 새로운 버전으로 들어가지 않아."
//
// 까닭은 두 겹이었다.
//  ① 이 앱에는 **캐시를 관리하는 서비스워커가 없다** — index.html 을 쥐고 있는
//     것은 브라우저의 HTTP 캐시이고, 얼마나 오래 쥐느냐는 서버가 정한다.
//     깃헙 페이지는 10분, 파이어베이스 호스팅은 **기본 1시간**이다.
//     홈 화면 웹앱은 그 사이에 껐다 켜도 네트워크에 묻지 않는다.
//  ② 있던 자동 갱신은 그냥 location.reload() 라 **캐시의 옛 파일을 다시 읽었다.**
//
// 그래서 이 시험은 세 가지를 못 박는다:
//   · 버전표(version.txt)가 코드의 APP_VERSION 과 같은가 (안 맞으면 영영 못 받는다)
//   · 새 버전을 보면 **캐시를 갈아끼운 뒤** 다시 읽는가
//   · **무한 새로고침을 막는가** (캐시 갈아끼우기가 안 듣는 기기가 있어도)
const fs = require('fs');
const path = require('path');
const { SRC, SRC_DEV, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
const root = p => path.join(__dirname, '..', p);

// ═══ 1. 버전표가 코드와 같은가 ═══
console.log('시나리오 1 — 버전표(version.txt)');
{
  const code = (/const APP_VERSION = "(v\. [0-9-]+)"/.exec(SRC) || [])[1];
  const file = fs.readFileSync(root('version.txt'), 'utf-8').trim();
  sc.eq('코드에서 버전을 읽는다', !!code, true);
  sc.eq('⭐ 버전표가 코드와 같다', file, code);
  // 개발본·Sweeter 개발본도 같은 파일을 읽는다 (셋 다 block7.my 에 산다)
  const devCode = (/const APP_VERSION = "(v\. [0-9-]+)"/.exec(SRC_DEV) || [])[1];
  sc.eq('개발본도 같은 버전', devCode, code);
  // 손으로 만들지 않는다
  sc.eq('만드는 도구가 있다', fs.existsSync(root('tools/make-version.sh')), true);
  const chk = fs.readFileSync(root('tools/check.sh'), 'utf-8');
  sc.eq('점검이 낡았는지 본다', chk.includes('version.txt ↔ index.html'), true);
  sc.eq('낡으면 배포를 막는다',
        /version\.txt 가 index\.html 과 다릅니다[\s\S]{0,300}fail=1/.test(chk), true);
  // Sweeter 운영본에도 함께 담긴다 (sweeter.my 에도 있어야 한다)
  const mk = fs.readFileSync(root('tools/make-sweeter-prod.sh'), 'utf-8');
  sc.eq('Sweeter 운영본에도 담는다', mk.includes('cp version.txt "$OUT/version.txt"'), true);
}

// ═══ 2. 파이어베이스 호스팅 캐시 헤더 ═══
// 기본값(1시간)이 바로 "껐다 켜도 옛 버전" 의 큰 몫이었다.
console.log('\n시나리오 2 — sweeter.my 는 늘 새로 묻는다');
{
  const fb = JSON.parse(fs.readFileSync(root('firebase.json'), 'utf-8'));
  const h = (fb.hosting[0].headers || []);
  const has = src => h.some(x => x.source === src &&
        x.headers.some(k => k.key === 'Cache-Control' && /no-cache/.test(k.value)));
  sc.eq('뿌리(/)', has('/'), true);
  sc.eq('html·json·txt', has('**/*.@(html|json|txt)'), true);
  sc.eq('알림 워커', has('/firebase-messaging-sw.js'), true);
  // 글꼴·그림은 그대로 오래 쥐게 둔다 (바뀌지 않는 것까지 매번 묻게 하지 않는다)
  sc.eq('글꼴까지 막지는 않는다', h.some(x => /fonts/.test(x.source)), false);
}

// ═══ 3. 실제로 돌려 본다 — 새 버전을 보면 어떻게 하는가 ═══
console.log('\n시나리오 3 — 새 버전을 보았을 때');

// 앱 조각을 떠 와서 가짜 브라우저 위에 올린다
let FETCHED = [];      // 무엇을 어떻게 받아왔나
let RELOADED = 0, REPLACED = null, TOASTS = [];
let VERFILE = 'v. 26-0921-9';
let SESSION = {};
let PENDING = false;
let ACTIVE = { tagName: 'DIV' };

global.APP_VERSION = 'v. 26-0921-9';
global.LS_KEY = 'b7v1';
global._lsk = n => LS_KEY + '_' + n;
global.showToast = m => TOASTS.push(m);
global.sessionStorage = {
  getItem: k => (k in SESSION ? SESSION[k] : null),
  setItem: (k, v) => { SESSION[k] = String(v); },
  removeItem: k => { delete SESSION[k]; },
};
global.document = { hidden: false, addEventListener: () => {},
                    get activeElement(){ return ACTIVE; } };
global.location = { href: 'https://sweeter.my/', pathname: '/',
                    reload: () => { RELOADED++; },
                    replace: u => { REPLACED = u; } };
global.window = { _fbHasPending: () => PENDING };
global.fetch = async (url, opt) => {
  FETCHED.push({ url, cache: (opt || {}).cache });
  if (/version\.txt/.test(url)) return { ok: true, text: async () => VERFILE + '\n' };
  return { ok: true, text: async () => '' };
};
// setTimeout 은 곧바로 돌린다 (기다리지 않게) — 단, 부팅용 4초짜리는 제외.
// ⚠️ 시험이 끝날 때까지 이대로 둔다. 되돌리면 새로고침이 1.2초 뒤로 밀려
//    시험은 그것을 "아무 일도 안 일어났다" 로 읽는다.
global.setTimeout = (fn, ms) => { if (ms === 4000) return 0; fn(); return 0; };

// ⚠️ eval 안의 const/let 은 밖으로 새지 않는다 → var 로 바꿔 떠온다.
// ⚠️ 버전 비교(_verCmp)부터 떠와야 한다 — 그것이 없으면 _upCheck 안에서
//    조용히 예외가 나고(try/catch) **아무 일도 안 일어난 것처럼 보인다.**
eval(sliceDev('// ── 앱 버전 비교 ("v. YY-MMDD-N") ──', 'if(!DEV_MODE){')
       .replace(/^(?:const|let) /gm, 'var '));

const reset = () => { FETCHED = []; RELOADED = 0; REPLACED = null; TOASTS = [];
                      SESSION = {}; PENDING = false; ACTIVE = { tagName: 'DIV' };
                      _upLastCheck = 0; _upReloading = false; };

(async () => {
  // ── 내가 최신이면 아무 일도 없다
  reset(); VERFILE = 'v. 26-0921-9';
  await _upCheck();
  sc.eq('버전표만 읽는다', FETCHED.map(f => f.cache), ['no-store']);
  sc.eq('캐시를 건너뛰고 묻는다', /version\.txt\?t=\d+/.test(FETCHED[0].url), true);
  sc.eq('같으면 새로고침하지 않는다', RELOADED, 0);

  // ── 새 버전이 있으면: 캐시를 갈아끼운 **뒤** 다시 읽는다
  reset(); VERFILE = 'v. 26-0921-10';
  await _upCheck();
  sc.eq('⭐ 내 주소를 cache:reload 로 받아 온다',
        FETCHED.map(f => f.cache), ['no-store', 'reload']);
  sc.eq('그러고 나서 새로고침', RELOADED, 1);
  sc.eq('사람에게 알린다', /새 버전/.test(TOASTS[0] || ''), true);

  // ── ⭐ 무한 새로고침을 막는다 (캐시 갈아끼우기가 안 듣는 기기)
  reset(); VERFILE = 'v. 26-0921-10';
  await _upCheck();                       // ① 캐시 갈아끼우고 reload
  _upLastCheck = 0; _upReloading = false;
  await _upCheck();                       // ② 그래도 옛 것 → 다른 주소로
  sc.eq('두 번째는 주소를 바꿔서 간다', REPLACED, '/?v=v.%2026-0921-10');
  _upLastCheck = 0; _upReloading = false;
  RELOADED = 0; REPLACED = null;
  await _upCheck();                       // ③ 그래도 옛 것 → 멈추고 알린다
  sc.eq('세 번째는 새로고침하지 않는다', [RELOADED, REPLACED], [0, null]);
  sc.eq('대신 사람에게 말해 준다', /완전히 닫았다 열어/.test(TOASTS.join('|')), true);
  _upLastCheck = 0; _upReloading = false;
  TOASTS = [];
  await _upCheck();                       // ④ 네 번째부터는 조용하다
  sc.eq('같은 말을 되풀이하지 않는다', TOASTS.length, 0);

  // ── 못 올린 편집이 있으면 새로고침하지 않는다 (편집이 사라진다)
  reset(); VERFILE = 'v. 26-0921-10'; PENDING = true;
  await _upCheck();
  sc.eq('⭐ 미전송 편집이 있으면 안 한다', RELOADED, 0);
  sc.eq('시도한 것으로 세지도 않는다', SESSION[_lsk('upTry')], undefined);

  // ── 글자를 치는 중에도 안 한다
  reset(); VERFILE = 'v. 26-0921-10'; ACTIVE = { tagName: 'INPUT' };
  await _upCheck();
  sc.eq('글자 치는 중에는 안 한다', RELOADED, 0);

  // ── 못 알아볼 값이면 아무 일도 안 한다 (404 페이지가 오는 경우)
  reset(); VERFILE = '<!DOCTYPE html><html>404';
  await _upCheck();
  sc.eq('이상한 값이면 그냥 둔다', [RELOADED, REPLACED], [0, null]);

  // ── 너무 자주 묻지 않는다
  reset(); VERFILE = 'v. 26-0921-9';
  await _upCheck();
  const n = FETCHED.length;
  await _upCheck();
  sc.eq('10분 안에는 다시 묻지 않는다', FETCHED.length, n);

  // ═══ 4. 코드가 지켜야 할 모양 ═══
  console.log('\n시나리오 4 — 지켜야 할 모양');
  // 개발본에도 있어야 한다 (로그인 뭉치 안에 두면 개발본에는 아예 없다)
  sc.eq('개발본에도 있다', SRC_DEV.includes('async function _upCheck()'), true);
  sc.eq('낡은 탭 자동 갱신도 같은 길을 쓴다',
        /function _fbMaybeSelfUpdate[\s\S]{0,900}_upReloadFresh\(\);/.test(SRC_DEV), true);
  sc.eq('그냥 reload 하지 않는다',
        /_fbReloading=true;[\s\S]{0,300}location\.reload\(\);\}catch\(e\)\{\}\},1500\)/.test(SRC_DEV), false);
  sc.eq('앞으로 불러올 때마다 본다',
        SRC_DEV.includes("document.addEventListener('visibilitychange',()=>{if(!document.hidden)_upCheck();});"), true);
  sc.eq('미전송 편집을 물어볼 통로가 있다',
        SRC_DEV.includes('window._fbHasPending=function(){'), true);

  // ═══ 5. 로그인 화면이 번쩍이지 않는다 ═══
  console.log('\n시나리오 5 — 첫 그림에서 로그인 막을 걷는다');
  // ⚠️ 이 결정은 큰 스크립트가 아니라 **막 바로 뒤 인라인**에서 한다.
  //    1.4MB 를 파싱하는 동안 브라우저가 먼저 한 번 그려 버리기 때문이다.
  const inline = /<div class="auth-version" id="authVersion"><\/div>\s*<\/div>\s*<script>([\s\S]{0,1400}?)<\/script>/.exec(SRC_DEV);
  sc.eq('막 바로 뒤에 인라인이 있다', !!inline, true);
  sc.eq('주인과 저장 칸을 함께 본다',
        /localStorage\.getItem\(_lsk\('owner'\)\)&&localStorage\.getItem\(LS_KEY\)/.test(inline[1]), true);
  sc.eq("판단은 paintAppUIFromLocal 과 같다",
        /function paintAppUIFromLocal\(\)\{[\s\S]{0,400}_localOwner\(\)[\s\S]{0,300}localStorage\.getItem\(LS_KEY\)/.test(SRC_DEV), true);
  sc.eq('세션이 끊겼으면 도로 띄운다',
        SRC_DEV.includes("document.getElementById('authScreen').classList.remove('hidden');"), true);
  // 인라인이 큰 스크립트보다 **앞**에 있어야 의미가 있다
  sc.eq('인라인이 큰 스크립트보다 앞',
        SRC_DEV.indexOf("classList.add('hidden');\n}catch(e){}") <
        SRC_DEV.indexOf('function paintAppUIFromLocal()'), true);

  sc.done();
})();
