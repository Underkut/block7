// 이 기기 저장 칸 진단 (v. 26-1107-8, 1107-SW 6)
// 설정 '계정' 탭의 '이 기기 저장 칸' — 이 기기 앱 저장 칸(localStorage)을 얼마나 썼는지 한 줄로.
//  ① 나누기: 이 앱의 상태 · 동기화 기준점 · 이 앱 그 밖 · 다른 앱(제품 · 기도노트 …)
//  ② BLOCK7 과 Sweeter 가 같은 칸을 보면 서로를 '다른 앱' 으로 센다 (앞머리 b7v1 이 겹쳐도)
//  ③ % 와 경고(70% 넘음) · 글자 수 꼴
//  ④ **읽기만 한다** — 저장 칸에 적거나 지우지 않는다
//  ⑤ 자리: 계정 탭 · 모든 등급 · 접는 묶음 표 · 설정창을 열 때 새로 잰다
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const code = slice('// ── 이 기기 저장 칸 진단 (v. 26-1107-8', '// ── 이 기기 저장 칸 진단 끝');
function load(store, lsKey) {
  const writes = [];
  const ls = {
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i]; },
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k) { writes.push('set ' + k); },
    removeItem(k) { writes.push('remove ' + k); },
    clear() { writes.push('clear'); },
  };
  const f = new Function('localStorage', 'LS_KEY', code + '\nreturn {_lsDiagCalc,_lsDiagRead,_lsdN,_lsDiagSumText,_lsdAppName,_LSD_LIMIT};');
  return { api: f(ls, lsKey), writes };
}
const X = n => 'x'.repeat(n);
const store = {
  b7v1: X(400000), b7v1_syncbase: X(390000), b7v1_syncmeta: X(100), b7v1_sgFold: X(200), b7v1_notiflog: X(1000),
  b7v1_sweeter: X(200000), b7v1_sweeter_syncbase: X(190000), b7v1_sweeter_syncmeta: X(80), b7v1_sweeter_sgFold: X(150),
  b7v1_sweeter_dev: X(5000),
  'pray.v1': X(30000), b7care_v1: X(100), cell_pref_v1: X(50), report_book_v1: X(70), b7timer_v1: X(10),
  somethingElse: X(9),
};
const sz = k => k.length + store[k].length;

console.log('\n① BLOCK7 이 보면');
{
  const { api } = load(store, 'b7v1');
  const r = api._lsDiagRead();
  sc.eq('지금 상태 = b7v1 하나', r.st, sz('b7v1'));
  sc.eq('동기화 기준점 = syncbase + syncmeta', r.base, sz('b7v1_syncbase') + sz('b7v1_syncmeta'));
  sc.eq('이 앱 그 밖 = b7v1_ 로 시작하는 나머지(Sweeter 것은 뺀다)', r.mine, sz('b7v1_sgFold') + sz('b7v1_notiflog'));
  const apps = Object.fromEntries(r.apps);
  sc.eq('Sweeter 몫은 Sweeter 로 (상태 · 기준점 · 화면 기억 전부)', apps['Sweeter'], sz('b7v1_sweeter') + sz('b7v1_sweeter_syncbase') + sz('b7v1_sweeter_syncmeta') + sz('b7v1_sweeter_sgFold'));
  sc.eq('Sweeter 개발본은 따로', apps['Sweeter 개발본'], sz('b7v1_sweeter_dev'));
  sc.eq('다른 앱 이름표', ['기도노트', '심방 노트', '셀 inside', '사역 한눈에', '타이머'].map(a => apps[a]),
    [sz('pray.v1'), sz('b7care_v1'), sz('cell_pref_v1'), sz('report_book_v1'), sz('b7timer_v1')]);
  sc.eq('모르는 것은 그 밖', apps['그 밖'], sz('somethingElse'));
  sc.eq('합계 = 모든 키 + 값', r.tot, Object.keys(store).reduce((a, k) => a + sz(k), 0));
  sc.eq('나눈 것을 다 더하면 합계', r.st + r.base + r.mine + r.apps.reduce((a, x) => a + x[1], 0), r.tot);
  sc.eq('다른 앱은 큰 것부터', r.apps[0][0], 'Sweeter');
  sc.eq('큰 것 여섯까지', r.top.length, 6);
  sc.eq('큰 것 첫째 = b7v1', r.top[0][0], 'b7v1');
}

console.log('\n② Sweeter 가 보면 (앞머리 b7v1 이 겹쳐도 BLOCK7 은 다른 앱)');
{
  const { api } = load(store, 'b7v1_sweeter');
  const r = api._lsDiagRead();
  sc.eq('지금 상태 = b7v1_sweeter', r.st, sz('b7v1_sweeter'));
  sc.eq('기준점 = Sweeter 의 것만', r.base, sz('b7v1_sweeter_syncbase') + sz('b7v1_sweeter_syncmeta'));
  sc.eq('이 앱 그 밖 = sgFold 만 (개발본 빼고)', r.mine, sz('b7v1_sweeter_sgFold'));
  const apps = Object.fromEntries(r.apps);
  sc.eq('BLOCK7 몫 = b7v1 집안 나머지', apps['BLOCK7'], sz('b7v1') + sz('b7v1_syncbase') + sz('b7v1_syncmeta') + sz('b7v1_sgFold') + sz('b7v1_notiflog'));
  sc.eq('Sweeter 개발본은 Sweeter 가 아님', apps['Sweeter 개발본'], sz('b7v1_sweeter_dev'));
}

console.log('\n②-2 sweeter.my 처럼 Sweeter 와 다른 앱만 있을 때');
{
  const s2 = { b7v1_sweeter: X(1000), 'pray.v1': X(500) };
  const { api } = load(s2, 'b7v1_sweeter');
  const r = api._lsDiagRead();
  sc.eq('기준점 없으면 0', r.base, 0);
  sc.eq('그 밖 없으면 0', r.mine, 0);
  sc.eq('다른 앱 = 기도노트 하나', r.apps.map(a => a[0]), ['기도노트']);
}

console.log('\n③ % · 경고 · 글자 꼴');
{
  const { api } = load({}, 'b7v1');
  const L = api._LSD_LIMIT;
  sc.eq('한도는 약 260만 자(사파리 5MB · 한글 2바이트)', L, 2.6e6);
  const at = n => api._lsDiagCalc([['b7v1', n - 4]], 'b7v1');
  sc.eq('빈 칸은 0%', api._lsDiagCalc([], 'b7v1').pct, 0);
  sc.eq('절반이면 50%', at(L / 2).pct, 50);
  sc.eq('69% 는 경고 아님', at(L * 0.69).warn, false);
  sc.eq('70% 부터 경고', at(L * 0.70).warn, true);
  sc.eq('한 줄: 84만 자 · 32%', api._lsDiagSumText(at(840000)), '84만 자 · 32%');
  sc.eq('경고면 앞에 ⚠', api._lsDiagSumText(at(2e6)), '⚠ 200만 자 · 77%');
  sc.eq('글자 꼴', ['_', 52000, 3100, 999, 0, 125000].slice(1).map(api._lsdN), ['5.2만 자', '3.1천 자', '999자', '0자', '13만 자']);
}

console.log('\n④ 읽기만 한다');
{
  const { api, writes } = load(store, 'b7v1');
  api._lsDiagRead(); api._lsDiagRead();
  sc.eq('저장 칸에 아무것도 적지도 지우지도 않음', writes, []);
  sc.eq('진단 코드에 setItem · removeItem · clear 가 없다', /setItem|removeItem|\.clear\(/.test(code), false);
  const broken = new Function('localStorage', 'LS_KEY', code + '\nreturn _lsDiagRead;')({ get length() { throw new Error('막힘'); } }, 'b7v1');
  let ok = true; try { broken(); } catch (e) { ok = false; }
  sc.eq('저장 칸을 못 읽어도 터지지 않는다(사생활 보호 모드 등)', ok, true);
}

console.log('\n⑤ 자리');
{
  const a = SRC.indexOf('id="stab-account"'), b = SRC.indexOf('class="settings-tab-content"', a + 10);
  const acct = SRC.slice(a, b);
  sc.eq('계정 탭 안에 묶음이 있다', acct.includes('id="sgLsDiag"') && acct.includes('id="lsDiagBody"'), true);
  sc.eq('백업 묶음 바로 다음', acct.indexOf('id="sgLsDiag"') > acct.indexOf('id="sgBackup"') && acct.indexOf('id="sgLsDiag"') < acct.indexOf('id="syncConflictSection"'), true);
  sc.eq('모든 등급에 보인다(data-lv 없음)', /id="sgLsDiag"[^>]*data-lv/.test(acct), false);
  sc.eq('접는 묶음 표: 처음엔 접힘(all)', /'이 기기 저장 칸':'all'/.test(SRC), true);
  sc.eq('접힌 제목 줄 끝 요약이 있다', /'이 기기 저장 칸':\(\)=>\{try\{return _lsDiagSumText/.test(SRC), true);
  const rsp = slice('function renderSettingsPanel(){', '\n}');
  sc.eq('설정창을 그릴 때마다 새로 잰다 (Sweeter 도 이 길 — _swFillMovedRows)', rsp.includes('_lsDiagRender()'), true);
  sc.eq('일반설정창 계정 탭으로 넘길 때도', slice('function switchSettingsTab(', '\n}').includes("id==='account')try{_lsDiagRender()"), true);
  sc.eq('Sweeter 설정 계정 탭으로 넘길 때도', slice('function switchVerseSettingsTab(', '\n}').includes("id==='account')try{_lsDiagRender()"), true);
  sc.eq('Sweeter 는 계정 탭을 통째로 옮긴다 — 따로 복제하지 않는다', (SRC.match(/id="lsDiagBody"/g) || []).length, 1);
}

sc.done();
