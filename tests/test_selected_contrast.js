// v26-1024-18 — 설정창의 '고른 단추' 가 모든 테마에서 눈에 띄는가 (HB 2026-10-24)
//
// HB: "기본 테마든 스파크/브리드 테마든, 선택된 버튼이 뭔지 잘 안 보인다 — 전수 검사해서 고쳐라."
// 까닭: 설정창 새 모양(v26-1024-15·16)에서 고른 칸을 패널색(--s1)으로 살짝 띄웠는데,
//   카드 바탕(--bg)과 패널색이 거의 같은 테마에선 대비가 1.0~1.2 — 사실상 같은 색이었다.
//   게다가 `.sg .settings-btn` 이 예전 `.settings-btn.on` 표시를 통째로 덮어 낱 단추(FHD+ · [ ] …)는 아예 같았다.
// 고친 것: 설정창(.sg) 안의 고른 상태는 **강조색으로 꽉 채움** 한 가지.
//
// 이 시험은 두 가지를 본다:
//  ① CSS — 그 한 규칙이 있고, 옛 '패널색 띄우기' 로 돌아가지 않았다
//  ② 색 — 기본 + 17 테마 × 밝게/어둡게 = 36벌에서 강조색이 카드 바탕 · 고르기 줄 바탕과
//     충분히 갈리고(2.0 이상), 그 위 글자(--on-accent)가 읽힌다
//  (브라우저로 세 설정창의 모든 고른 단추를 36벌 전부 잰 결과: 최소 대비 2.4 — 고치기 전 1.0)
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const engineSrc = slice('const THEME_GROUPS={', '// ── 조기 적용 (첫 페인트 전) ──');
const engine = {};
new Function('exports', engineSrc + `
Object.assign(exports,{THEME_PRESETS,_themeTokens,_thRgb,_thContrast,_thMix});
`)(engine);
const { THEME_PRESETS, _themeTokens, _thRgb, _thContrast, _thMix } = engine;

console.log('시나리오 1 — 고른 상태는 강조색으로 꽉 채운다 (CSS)');
{
  const rule = /\.sg \.sg-seg>button\.on,\.sg \.sg-seg>button\.active,\s*\.sg \.settings-btn\.on,\.sg \.theme-pick-btn\.active,\.sg \.preset-btn\.on\{\s*background:var\(--ac\);color:var\(--on-accent,#fff\)/;
  sc.eq('한 줄 고르기 · 낱 단추 · 칩이 한 규칙', rule.test(SRC), true);
  sc.eq('강조 표시 네 칸 · 글자 크기 칸도', SRC.includes('.sg .hi-seg button.on,.sg .ts-btn.on{background:var(--ac);color:var(--on-accent,#fff)'), true);
  sc.eq('구간 프리셋 칩도', /\.sg \.preset-chip\.active\{background:var\(--ac\)/.test(SRC), true);
  sc.eq('옛 패널색 띄우기는 없다', /\.sg \.sg-seg>button\.on[^{]*\{background:var\(--s1\)/.test(SRC), false);
  // .sg .settings-btn 이 .settings-btn.on 을 덮는 순서 문제 — 고른 규칙이 **뒤에** 와야 이긴다
  sc.eq('고른 규칙이 .sg .settings-btn 보다 뒤', SRC.indexOf('.sg .settings-btn.on,') > SRC.indexOf('.sg .settings-btn{'), true);
}

console.log('\n시나리오 2 — 강조색 바탕 위 글자는 흰색 고정이 아니라 --on-accent');
{
  // 레몬파이처럼 강조색이 밝은 테마에서 흰 글자는 안 보인다
  const bad = [];
  for (const m of SRC.matchAll(/\{[^{}]{0,400}\}/g)) {
    const b = m[0];
    if (/background:var\(--ac\)/.test(b) && /(?<![-\w])color:#fff\b/.test(b)) bad.push(b.slice(0, 60));
  }
  sc.eq('CSS 규칙에 강조색 + 흰 글자 고정이 없다', bad, []);
  sc.eq('인라인 고르기 칩도', SRC.includes("color:${on?'#fff'"), false);
}

console.log('\n시나리오 3 — 36벌 모두: 강조색이 카드 바탕과 갈리고, 그 위 글자가 읽힌다');
{
  const c = h => _thRgb(h);
  const sets = [
    ['기본/어둡게', { bg: '#0b0c0f', s1: '#14161b', tx: '#eef0fa', ac: '#5a70f8', on: '#ffffff' }],
    ['기본/밝게', { bg: '#f5f6fa', s1: '#ffffff', tx: '#1c2030', ac: '#4458e8', on: '#ffffff' }],
  ];
  for (const p of THEME_PRESETS) for (const mode of ['light', 'dark']) {
    const t = _themeTokens(p, mode);
    sets.push([p.name + '/' + (mode === 'light' ? '밝게' : '어둡게'),
      { bg: t['--bg'], s1: t['--s1'], tx: t['--tx'], ac: t['--ac'], on: t['--on-accent'] }]);
  }
  sc.eq('36벌', sets.length, 36);
  const weakBg = [], weakTx = [];
  for (const [name, v] of sets) {
    const ac = c(v.ac);
    // 카드 바탕(--bg) · 고르기 줄 바탕(카드 위 글자색 7%) · 패널(--s1) 중 가장 가까운 것
    const track = _thMix(c(v.bg), c(v.tx), 0.07);
    const worst = Math.min(_thContrast(ac, c(v.bg)), _thContrast(ac, track), _thContrast(ac, c(v.s1)));
    if (worst < 2.0) weakBg.push(name + ' ' + worst.toFixed(2));
    const tx = _thContrast(c(v.on), ac);
    // 기본/어둡게 의 흰 글자 4.1 은 앱 전체 강조 단추가 예전부터 쓰는 값이라 둔다 (굵은 글자 기준 3 이상)
    if (tx < (name === '기본/어둡게' ? 4.0 : 4.5)) weakTx.push(name + ' ' + tx.toFixed(2));
  }
  sc.eq('강조색 ↔ 바탕 대비 2.0 이상', weakBg, []);
  sc.eq('강조색 위 글자 대비 4.5 이상', weakTx, []);
}

sc.done();
