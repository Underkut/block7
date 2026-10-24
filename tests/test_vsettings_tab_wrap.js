const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

// v26-1024-16 (HB 2026-10-24 설정창 정리) — 세 창 공통 규칙: **탭 이름은 한 단어**.
// 예전엔 네 글자 탭(상단말씀 · 말씀위젯 · 전체화면 · 말씀모음)을 좁은 폰에서 2+2 로 꺾어 두 줄로 썼다.
// 이제 상단 · 위젯 · 모음 으로 줄였고, '전체화면' 만 네 글자라 꺾지 않고 한 줄로 둔다.
console.log('시나리오 — 말씀 설정 탭 이름은 한 단어 · 한 줄');
const bar = SRC.slice(SRC.indexOf('id="verseSettingsTabBar"'), SRC.indexOf('id="verseSettingsTabTrack"'));
const names = [...bar.matchAll(/switchVerseSettingsTab\('\w+',this\)">([^<]*)<\/button>/g)].map(m => m[1]);
sc.eq('탭 이름', names, ['모음','상단','위젯','화면','전체화면','공유','알림','계정']);
sc.eq('두 줄로 꺾는 묶음은 더 쓰지 않는다', bar.includes('vstab-pair'), false);
sc.eq('탭 글자는 줄바꿈하지 않는다', /\.sp2 \.settings-tab\{[^}]*white-space:nowrap/.test(SRC), true);

sc.done();
