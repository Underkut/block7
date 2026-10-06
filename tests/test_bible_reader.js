// 인앱 성경 — 기록·장절·검색·동기화 (v26-1006-4, HB)
//   ST.bibleMarks   = { "43.3.16": {h:형광펜1~5, m:'메모', k:책갈피ms} }
//   ST.bibleReadLog = { "YYYY-MM-DD": [{b:43, c:3, time:"HH:MM", d:초}] }
//
// ⚠️ 데이터 계층이다. 새 기록 칸은 병합·백업·가져오기·되살리기가 전부 그 이름을
//    알아야 한다 — 한 곳이라도 빠지면 그 길에서 조용히 사라진다. 여기서 한꺼번에 본다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
function clone(o){ return JSON.parse(JSON.stringify(o)); }

global.ST = { settings: {} };
eval(
  slice('const _REF_ABBR2FULL=', 'function _refNorm(') +
  slice('// ── 성경책 이름 하나로 모으기 ──', '// verses를 keyFn 기준으로 묶어') +
  slice('const BIBLE_ORDER_OT=', '// ── Alarm scheduler ──') +
  slice('// ══ 인앱 성경 — 기록과 장절 (v26-1006-4)', '// ══ 인앱 성경 — 기록과 장절 끝 ══') +
  ';Object.assign(globalThis,{_bookCanon,_brKey,_brSetMark,_brReadAdd,_brParseRef,_brFmtRef,_brCopyText,_brFindWords,_brMatch,_brVerseList,getBibleMarks,getBibleReadLog});'
);

console.log('시나리오 1 — 형광펜·메모·책갈피는 절 하나에 함께, 다 지우면 칸이 사라진다');
{
  ST.bibleMarks = {};
  const k = _brKey(42, 3, 16);
  sc.eq('자리 이름 = 책번호(1~66).장.절', k, '43.3.16');
  _brSetMark(k, { h: 2 });
  _brSetMark(k, { m: '  하나님이 세상을 사랑하사  ' });
  _brSetMark(k, { k: true });
  sc.eq('셋이 한 칸에', Object.keys(ST.bibleMarks[k]).sort(), ['h', 'k', 'm']);
  sc.eq('메모는 앞뒤 공백을 다듬는다', ST.bibleMarks[k].m, '하나님이 세상을 사랑하사');
  const before = ST.bibleMarks[k];
  _brSetMark(k, { h: 0 });
  sc.eq('바꿀 때 객체를 새로 만든다 (병합이 절마다 견준다)', ST.bibleMarks[k] !== before, true);
  _brSetMark(k, { m: '' }); _brSetMark(k, { k: false });
  sc.eq('다 지우면 칸이 없어진다', k in ST.bibleMarks, false);
}

console.log('\n시나리오 2 — 읽은 장: 10초 미만은 버리고, 30분에서 자른다, 시작한 날에 담는다');
{
  ST.bibleReadLog = {};
  const t = new Date('2026-10-06T23:59:30').getTime();
  sc.eq('5초는 버린다 (넘기기만 한 것)', _brReadAdd(0, 1, t, 5), false);
  sc.eq('40초는 남긴다', _brReadAdd(42, 3, t, 40), true);
  const e = ST.bibleReadLog['2026-10-06'][0];
  sc.eq('책 번호는 1~66 · 장 · 시각 · 초', [e.b, e.c, e.time, e.d], [43, 3, '23:59', 40]);
  _brReadAdd(0, 1, t, 99999);
  sc.eq('켜 둔 채 자리를 비운 것은 30분', ST.bibleReadLog['2026-10-06'][1].d, 1800);
  sc.eq('자정을 넘겨도 시작한 날 하나', Object.keys(ST.bibleReadLog), ['2026-10-06']);
}

console.log('\n시나리오 3 — Deeper 의 장절을 알아듣는다');
{
  const p = r => { const x = _brParseRef(r); return x && [x.b, x.c, x.v, x.v2]; };
  sc.eq('요 3:16 (약칭)', p('요 3:16'), [42, 3, 16, 0]);
  sc.eq('요한복음 3:16', p('요한복음 3:16'), [42, 3, 16, 0]);
  sc.eq('요한1서 5:14 (책 이름의 숫자)', p('요한1서 5:14'), [61, 5, 14, 0]);
  sc.eq('요한일서 5:14 (한글 숫자)', p('요한일서 5:14'), [61, 5, 14, 0]);
  sc.eq('롬 8:28-30 (범위)', p('롬 8:28-30'), [44, 8, 28, 30]);
  sc.eq('시편 119 (장만)', p('시편 119'), [18, 119, 0, 0]);
  sc.eq('시 23편', p('시 23편'), [18, 23, 0, 0]);
  sc.eq('요한복음 3장 16절', p('요한복음 3장 16절'), [42, 3, 16, 0]);
  sc.eq('삼상 7:12', p('삼상 7:12'), [8, 7, 12, 0]);
  sc.eq('없는 장은 못 알아듣는다 → 사이트로 연다', p('창세기 51:1'), null);
  sc.eq('책이 아닌 글', p('주제 없음'), null);
}

console.log('\n시나리오 4 — 복사 장절 형식은 말씀 설정 → 공유 텍스트와 같은 값을 쓴다');
{
  const ps = ['여호와는 나의 목자시니 내가 부족함이 없으리로다', '그가 나를 푸른 초장에 누이시며 쉴만한 물가으로 인도하시는도다', '내 영혼을 소생시키고'];
  ST.settings = { txtRefStyle: 'short', txtRefBracket: 'none', txtRefPos: 'after' };
  sc.eq('시 23:1 · 본문 뒤', _brCopyText(18, 23, [1], ps), '여호와는 나의 목자시니 내가 부족함이 없으리로다\n시 23:1');
  ST.settings = { txtRefStyle: 'long', txtRefBracket: 'square', txtRefPos: 'before' };
  sc.eq('[시편 23편 1-2절] · 본문 앞 · 여러 절은 번호를 붙인다', _brCopyText(18, 23, [2, 1], ps),
    '[시편 23편 1-2절]\n1 여호와는 나의 목자시니 내가 부족함이 없으리로다\n2 그가 나를 푸른 초장에 누이시며 쉴만한 물가으로 인도하시는도다');
  ST.settings = { txtRefStyle: 'long', txtRefBracket: 'paren' };
  sc.eq('시편 말고는 장', _brFmtRef(42, 3, [16]), '(요한복음 3장 16절)');
  sc.eq('떨어진 절은 쉼표로', _brVerseList([5, 1, 2, 3]), '1-3,5');
  ST.settings = {};
}

console.log('\n시나리오 5 — 검색: 띄어쓰기·쉼표를 없는 셈 치고, 기본은 이어진 말만');
{
  const t = '그러므로 믿음으로 의롭다 하심을 받았으니';
  sc.eq('의롭다하심 = 의롭다 하심', _brMatch(t, _brFindWords('의롭다하심', false)), true);
  sc.eq('예루살렘 주의 = 예루살렘, 주의', _brMatch('너희는 예루살렘, 주의 성에', _brFindWords('예루살렘 주의', false)), true);
  const far = '거룩하신 이가 의로우시며 공의를 행하시니';
  sc.eq('기본(꺼짐): 떨어진 낱말은 안 찾는다', _brMatch(far, _brFindWords('거룩 공의', false)), false);
  sc.eq('순서 자유(켬): 떨어져 있어도 찾는다', _brMatch(far, _brFindWords('거룩 공의', true)), true);
  sc.eq('순서 자유: 순서가 바뀌어도', _brMatch(far, _brFindWords('공의 거룩', true)), true);
}

// ── 병합 ──
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

console.log('\n시나리오 6 — 두 기기가 서로 다른 절을 칠해도 둘 다 산다');
{
  const base = { bibleMarks: { '1.1.1': { h: 1 } } };
  const local = clone(base); local.bibleMarks['43.3.16'] = { h: 2 };
  const cloud = clone(base); cloud.bibleMarks['45.8.28'] = { m: '합력하여 선' };
  const m = _fbMerge(clone(base), local, cloud, false);
  sc.eq('세 절 모두', Object.keys(m.bibleMarks).sort(), ['1.1.1', '43.3.16', '45.8.28']);
}

console.log('\n시나리오 7 — 한 기기에서 지운 형광펜은 다른 기기에도 지워진다 (base 가 있을 때)');
{
  const base = { bibleMarks: { '1.1.1': { h: 1 }, '43.3.16': { k: 5 } } };
  const local = clone(base); delete local.bibleMarks['1.1.1'];
  const cloud = clone(base);
  const m = _fbMerge(clone(base), local, cloud, false);
  sc.eq('지운 절만 빠진다', Object.keys(m.bibleMarks), ['43.3.16']);
}

console.log('\n시나리오 8 — 읽은 기록은 두 기기 것을 합친다');
{
  const base = { bibleReadLog: { '2026-10-06': [{ b: 1, c: 1, time: '06:00', d: 300 }] } };
  const local = clone(base); local.bibleReadLog['2026-10-06'].push({ b: 1, c: 2, time: '06:10', d: 200 });
  const cloud = clone(base); cloud.bibleReadLog['2026-10-06'].push({ b: 43, c: 3, time: '21:00', d: 500 });
  const m = _fbMerge(clone(base), local, cloud, false);
  sc.eq('세 건', m.bibleReadLog['2026-10-06'].length, 3);
}

console.log('\n시나리오 9 — 빈 기기로 로그인해도 클라우드의 성경 기록이 안 지워진다');
// CLAUDE.md — 로그인·동기화가 걸린 변경은 이 물음을 실제로 돌려 본다.
{
  const cloud = { bibleMarks: { '43.3.16': { h: 2, m: '사랑' }, '19.23.1': { k: 1 } },
                  bibleReadLog: { '2026-10-05': [{ b: 19, c: 23, time: '07:00', d: 120 }] }, days: {} };
  const fresh = { bibleMarks: {}, bibleReadLog: {}, days: {} };
  global._fbBaseJson = null;
  const m = _fbMergeGuarded(null, clone(fresh), clone(cloud), false);
  sc.eq('표시 둘 그대로', Object.keys(m.bibleMarks).sort(), ['19.23.1', '43.3.16']);
  sc.eq('읽은 기록 그대로', m.bibleReadLog['2026-10-05'].length, 1);
}

console.log('\n시나리오 10 — 옛 버전 기기가 떨어뜨려도 새 기기가 되살린다');
{
  const mine = { bibleMarks: { '43.3.16': { h: 2 } }, bibleReadLog: { '2026-10-06': [{ b: 1, c: 1, time: '06:00', d: 60 }] }, days: {} };
  const cloudFromOld = { days: {} };
  global._fbBaseJson = JSON.stringify(mine);
  const m = _fbMergeGuarded(null, mine, cloudFromOld, false);
  sc.eq('표시 살아 있음', !!m.bibleMarks['43.3.16'], true);
  sc.eq('읽은 기록 살아 있음', m.bibleReadLog['2026-10-06'].length, 1);
}

console.log('\n시나리오 11 — 대량 손실 방어가 성경 기록도 센다');
{
  const o = { bibleMarks: { a: { h: 1 }, b: { k: 1 } }, bibleReadLog: { d: [{ b: 1 }, { b: 2 }, { b: 3 }] } };
  sc.eq('표시 2 + 읽기 3', _fbCountByKind(o).bible, 5);
}

console.log('\n시나리오 12 — 이름이 등록돼야 하는 자리 모두');
{
  const has = (start, end, name) => slice(start, end).indexOf(name) >= 0;
  ['bibleMarks', 'bibleReadLog'].forEach(n => {
    sc.eq(n + ' — 처음 상태(defaultState)', has('function defaultState(){', 'settings:{', n), true);
    sc.eq(n + ' — 불러올 때 빈 칸 채우기', new RegExp('if\\(!ST\\.' + n + '\\)ST\\.' + n + '=\\{\\};').test(SRC), true);
    sc.eq(n + ' — 원격 받기(applyRemoteState)', has('function applyRemoteState(remote){', 'ST.contacts=', n), true);
    sc.eq(n + ' — 백업 목록', has('const _VERSE_BACKUP_KEYS=', '];', "'" + n + "'"), true);
    sc.eq(n + ' — Sweeter 가져오기 목록', has('const _SW_IMPORT_KEYS=', '];', "'" + n + "'"), true);
    sc.eq(n + ' — 병합(_fbMerge)', has('function _fbMerge(', 'return out;', "'" + n + "'"), true);
  });
  sc.eq('_PRODUCT_SCOPED 에 넣지 않는다 (두 제품이 같이 본다)', /_PRODUCT_SCOPED\s*=\s*\[[^\]]*bible/.test(SRC), false);
}

console.log('\n시나리오 13 — 들어오는 길');
{
  sc.eq('Deeper 공용 출구가 앱 안 성경을 먼저 본다', /openBskFromRef\(ref\)\{\s*if\(\(ST\.settings\.deeperOpen\|\|'app'\)==='app'&&typeof bibleOpenRef==='function'&&bibleOpenRef\(ref\)\)return;/.test(SRC), true);
  sc.eq('목록 속 Deeper 단추도 사이트 주소를 직접 열지 않는다', /BibleLinkProvider\.open\('\$\{bskUrl\}'\)/.test(SRC), false);
  const bar = slice('<div class="sw-bar">', 'id="swFilterBtn"');
  sc.eq('Sweeter 홈: Deeper 가 There 왼쪽', bar.indexOf('id="swDeeperBtn"') >= 0 && bar.indexOf('id="swDeeperBtn"') < bar.indexOf('id="swThereBtn"'), true);
  sc.eq('Sweeter 홈 Deeper 는 마지막 읽던 곳을 연다', /id="swDeeperBtn"[^>]*\n?[^>]*onclick="bibleOpenLast\(\)"/.test(SRC), true);
  sc.eq('편집 중에는 Deeper 도 비켜선다', /swDeeperBtn[\s\S]{0,80}_SW_EDIT/.test(slice('function _swEditBtnSync(', '// 필터 아이콘')), true);
  sc.eq('ESC 표에 등록', /\['bibleRd',\s*\(\)=>_brEsc\(\), \(\)=>_brIsOpen\(\)\]/.test(SRC), true);
  sc.eq('마지막 자리는 이 기기에만 (_lsk)', /_lsk\('biblePos'\)/.test(SRC), true);
}

console.log('\n시나리오 14 — 시안에서 겪은 것');
{
  const css = slice("   인앱 성경 (v26-1006-4, HB", "@media (prefers-reduced-motion:reduce){#bibleRd");
  sc.eq('검색칸 규칙을 input 전체에 걸지 않는다 (체크박스가 부풀었다)', /#bibleRd input\{|\.br-fbar input\{/.test(css), false);
  sc.eq('체크박스는 직접 그린다 (아이폰은 크기 지정을 무시)', /#brFree\{-webkit-appearance:none;appearance:none;/.test(css), true);
  sc.eq('검색어 순서 자유 — 처음엔 꺼짐', /_brS\('bibleFindFree',false\)/.test(SRC), true);
}

sc.done();
