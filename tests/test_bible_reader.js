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
  ';Object.assign(globalThis,{_bookCanon,_brKey,_brSetMark,_brNoteSave,_brNotesAt,_brMigrateNotes,_brHistory,_brHistHide,_brReadAdd,_brParseRef,_brFmtRef,_brCopyText,_brFindWords,_brMatch,_brVerseList,_brDashStats,_brDashStart,_brSeenOf,getBibleInk,_brInkSpansFrom,_brInkStepPos,_brInkCut,_brInkAdd,_brInkErase,_brInkHits,_brInkQuery,getBibleOrig,_brOrigAdd,getBibleToRead,_brTRHas,_brTRToggle,_brTRList,_brTRSetOrder,_brOrigNote,_brOrigWords,_brReadMs,getBibleMarks,getBibleReadLog,getBibleNotes});'
);

console.log('시나리오 1 — 형광펜·책갈피는 절 하나에 함께 (칠한 날짜도), 다 지우면 칸이 사라진다');
{
  ST.bibleMarks = {};
  const k = _brKey(42, 3, 16);
  sc.eq('자리 이름 = 책번호(1~66).장.절', k, '43.3.16');
  _brSetMark(k, { h: 2 });
  _brSetMark(k, { k: true });
  sc.eq('둘이 한 칸에 + 칠한 때(ht)', Object.keys(ST.bibleMarks[k]).sort(), ['h', 'ht', 'k']);
  const before = ST.bibleMarks[k];
  _brSetMark(k, { h: 0 });
  sc.eq('바꿀 때 객체를 새로 만든다 (병합이 절마다 견준다)', ST.bibleMarks[k] !== before, true);
  sc.eq('형광펜을 지우면 날짜도 같이', 'ht' in ST.bibleMarks[k], false);
  _brSetMark(k, { k: false });
  sc.eq('다 지우면 칸이 없어진다', k in ST.bibleMarks, false);
}

console.log('\n시나리오 1-2 — 메모: 한 절에 여럿 · 여러 절 묶음에 하나 (HB 2026-10-06)');
{
  ST.bibleNotes = {};
  const a = _brNoteSave(null, 42, 3, [17, 16], '  묶음 메모  ');
  const b = _brNoteSave(null, 42, 3, [16], '두 번째 메모');
  sc.eq('묶음은 절을 차례대로 담는다', ST.bibleNotes[a].v, [16, 17]);
  sc.eq('글은 다듬는다', ST.bibleNotes[a].t, '묶음 메모');
  sc.eq('16절에는 메모 둘', _brNotesAt(42, 3, 16).length, 2);
  sc.eq('17절에는 묶음 메모 하나', _brNotesAt(42, 3, 17), [a]);
  _brNoteSave(a, 0, 0, [], '고친 글');
  sc.eq('고치면 같은 칸 · 글이 바뀐다', ST.bibleNotes[a].t, '고친 글');
  _brNoteSave(b, 0, 0, [], '');
  sc.eq('글을 비우면 지운다', b in ST.bibleNotes, false);
}

console.log('\n시나리오 1-3 — v26-1006-4 의 옛 메모(bibleMarks.m)를 옮긴다 · 두 기기가 옮겨도 하나');
{
  ST.bibleMarks = { '43.3.16': { m: '옛 메모', h: 1 }, '1.1.1': { m: '태초' } };
  ST.bibleNotes = {};
  _brMigrateNotes();
  sc.eq('메모 둘이 옮겨졌다', Object.keys(ST.bibleNotes).sort(), ['m1.1.1', 'm43.3.16']);
  sc.eq('형광펜은 남고 m 은 빠진다', ST.bibleMarks['43.3.16'], { h: 1 });
  sc.eq('메모만 있던 칸은 사라진다', '1.1.1' in ST.bibleMarks, false);
  const other = { '43.3.16': { b: 43, c: 3, v: [16], t: '옛 메모', at: 0, u: 0 } };
  sc.eq('이름이 정해져 있어 다른 기기 결과와 같다', ST.bibleNotes['m43.3.16'], other['43.3.16']);
}

console.log('\n시나리오 1-4 — 읽은 곳: 목록에서 지워도 기록은 남고, 다시 읽으면 다시 나온다');
{
  ST.settings = {};
  ST.bibleReadLog = { '2026-10-05': [{ b: 43, c: 3, time: '07:00', d: 60 }], '2026-10-06': [{ b: 1, c: 1, time: '08:00', d: 60 }] };
  sc.eq('최근 것부터', _brHistory().map(x => x.b + '.' + x.c), ['0.1', '42.3']);
  _brHistHide(42, 3);
  sc.eq('지운 장은 빠진다', _brHistory().map(x => x.b + '.' + x.c), ['0.1']);
  sc.eq('기록은 그대로', ST.bibleReadLog['2026-10-05'].length, 1);
  ST.bibleReadLog['2099-01-01'] = [{ b: 43, c: 3, time: '07:00', d: 60 }];
  sc.eq('다시 읽으면 다시 나온다', _brHistory()[0].b + '.' + _brHistory()[0].c, '42.3');
  ST.settings = {};
}

console.log('\n시나리오 2 — 읽은 장: 3초 미만은 버리고, 오래 켜 둔 것은 그대로, 시작한 날에 담는다');
{
  ST.bibleReadLog = {};
  const t = new Date('2026-10-06T23:59:30').getTime();
  sc.eq('2초는 버린다 (넘기기만 한 것)', _brReadAdd(0, 1, t, 2), false);
  sc.eq('3초부터 남긴다 (HB 2026-10-07)', _brReadAdd(0, 2, t, 3), true);
  ST.bibleReadLog = {};
  sc.eq('40초는 남긴다', _brReadAdd(42, 3, t, 40), true);
  const e = ST.bibleReadLog['2026-10-06'][0];
  sc.eq('책 번호는 1~66 · 장 · 시각 · 초', [e.b, e.c, e.time, e.d], [43, 3, '23:59', 40]);
  _brReadAdd(0, 1, t, 5 * 3600);
  sc.eq('5시간을 켜 두면 5시간 그대로 (HB 2026-10-07)', ST.bibleReadLog['2026-10-06'][1].d, 18000);
  _brReadAdd(42, 3, t, 75, { t: t, v: [3, 9], n: 7, of: 36, s: 'deeper', r: '요 3:16', p: 'b7', dv: 'm', sec: 'am', x: '' });
  const e3 = ST.bibleReadLog['2026-10-06'][2];
  sc.eq('자세한 기록 — 시작 ms·본 절·들어온 길·제품·기기·구간', [e3.t, e3.v, e3.n, e3.of, e3.s, e3.r, e3.p, e3.dv, e3.sec], [t, [3, 9], 7, 36, 'deeper', '요 3:16', 'b7', 'm', 'am']);
  sc.eq('빈 값은 담지 않는다 (문서 크기)', 'x' in e3, false);
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
  ['bibleMarks', 'bibleReadLog', 'bibleNotes', 'bibleInk', 'bibleOrig', 'bibleToRead'].forEach(n => {
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

console.log('\n시나리오 13-2 — 메모 병합: 두 기기가 같은 절에 각각 메모를 남겨도 둘 다 산다');
{
  const base = { bibleNotes: {} };
  const local = { bibleNotes: { na: { b: 43, c: 3, v: [16], t: '폰', at: 1, u: 1 } } };
  const cloud = { bibleNotes: { nb: { b: 43, c: 3, v: [16], t: 'PC', at: 2, u: 2 } } };
  const m = _fbMerge(clone(base), local, cloud, false);
  sc.eq('둘 다', Object.keys(m.bibleNotes).sort(), ['na', 'nb']);
}

console.log('\n시나리오 13-3 — 저장: 성경에서 저장한 장절도 저장 목록이 본문을 찾는다');
{
  sc.eq('_findVerseByRefLoose 끝에서 성경 본문을 찾는다', /\(\(typeof _brVerseObj==='function'\)\?_brVerseObj\(ref\):null\)/.test(slice('function _findVerseByRefLoose(', '// ── 중복 구절 일회성 정리')), true);
  sc.eq('저장 단추는 앱의 저장 목록 창을 연다', /openKeepPicker\(ref\);/.test(slice("  $('brAKeep').onclick=", '};')), true);
  sc.eq('저장 목록 창을 성경 위로 올렸다가 닫을 때 되돌린다', /overlay\.style\.zIndex='4720';modal\.style\.zIndex='4730';/.test(SRC), true);
}

console.log('\n시나리오 13-4 — v26-1006-6 (HB 2차 신고)');
{
  sc.eq('내 표시에서 지울 때는 시트를 닫지 않고 본문만 다시 그린다', /_brListDelete\(row\.dataset\.del\);if\(after\)after\(\);else _brRenderList\(\);if\(_brOpen\)_brRerender\(true\);/.test(SRC), true);
  sc.eq('_brShow(…, keep) 은 시트를 안 닫는다', /if\(!keep\)\{_brSel\.clear\(\);_brCloseSheets\(\);\}/.test(SRC), true);
  sc.eq('고치는 중 → + 새 메모', /data-newmemo="1">\+ 새 메모</.test(SRC), true);
  sc.eq('앱 설정·말씀 설정도 끌어 내려 닫는다', /_sheetDrag\(a,\[a\.querySelector\('\.settings-hd'\)\]/.test(SRC) && /_sheetDrag\(b,\[b\.querySelector\('\.settings-hd'\)\]/.test(SRC), true);
  sc.eq('스위터 로고 메뉴: 상단 말씀 줄은 BLOCK7 에서만', /id="logoMenuToggleItem" data-prod="b7"/.test(SRC), true);
  sc.eq('로고 메뉴: 형제 앱 줄 위 구분선 (두 제품)', /id="logoMenuSisterSep"><\/div>\s*<div class="task-menu-item" id="logoMenuSister"/.test(SRC), true);
  sc.eq('GNB There·성경은 상단 말씀이 켜졌을 때만 (body.vb-on)', /body\.vb-on \.gnb-there,body\.vb-on \.gnb-bible\{display:block;\}/.test(SRC), true);
  sc.eq('예전 규칙(2·3단이면 늘 There)은 없다', /body\.lay-multi \.gnb-there\{display:block;\}/.test(SRC), false);
  sc.eq('상단 말씀을 켜고 끄는 세 길이 모두 _gnbExtrasSync 를 부른다',
    /function toggleVerseBarOn\(\)\{[\s\S]{0,300}_gnbExtrasSync\(\);/.test(SRC) &&
    /if\(key==='verseBarOn'\)\{\s*_gnbExtrasSync\(\);/.test(SRC) &&
    /function renderVerseBar\(\)\{\s*const bar=document\.getElementById\('verseBar'\);\s*_gnbExtrasSync\(\);/.test(SRC), true);
  sc.eq('스위터에서는 vb-on 을 붙이지 않는다 (제 GNB 가 따로 있다)', /APP_PRODUCT!=='sweeter'\);\s*document\.body\.classList\.toggle\('vb-on',on\);/.test(SRC), true);
}

console.log('\n시나리오 13-5 — v26-1006-7 (HB 3차 신고)');
{
  sc.eq('메모 창의 메모 목록도 밀어서 지운다 (공용 _brSwipeBind)', /_brSwipeBind\(\$\('brMemoList'\)/.test(SRC) && /_brSwipeBind\(\$\('brLBody'\)\);/.test(SRC), true);
  sc.eq('책갈피 = 절 왼쪽 세로줄', /#bibleRd \.br-v\.bm\{box-shadow:inset 2px 0 0 var\(--ac-tx\);/.test(SRC), true);
  sc.eq('책갈피 단추 = 접힌 모서리', /id="brAMark"><svg[^>]*><path d="M5 3h9l5 5v13H5z"\/>/.test(SRC), true);
  sc.eq('Sweeter 에서 건너간 BLOCK7 화면: 덮개 표시(data-swboard)까지 내린다', /if\(_swBoardOn\(\)\)_swMount\(\);[\s\S]{0,200}else _swCoverOn\(false\);/.test(slice('function swCrossToggle(', '// 되돌아가는 단추')), true);
  sc.eq('BLOCK7 에서 건너간 Sweeter 판에도 There·성경', /const board=\(typeof _swBoardOn==='function'\)&&_swBoardOn\(\);/.test(slice('function _swEditBtnSync(', '// 필터 아이콘')), true);
  sc.eq('GNB 단추 높이는 로고 줄 가운데 (아이폰 시계 자리를 뺀다)', /\.gnb-there,\.gnb-bible\{display:none;position:absolute;left:84px;top:calc\(50% \+ var\(--gnb-safe,0px\) \/ 2\)/.test(SRC), true);
}

console.log('\n시나리오 13-6 — 절 메뉴의 말씀 반응 (v26-1007-6 HB)');
{
  const sheet = slice('<div class="br-sheet" id="brSAct"', '<div class="br-sheet" id="brSMemo"');
  const ids = (sheet.match(/id="brA[A-Za-z]+"/g) || []).map(x => x.slice(4, -1));
  // v26-1007-7 HB — There 는 절 메뉴에서 빼고 헤더 좌상단으로
  sc.eq('윗줄 반응 = 좋아요·저장·암송·Even (전체화면 차례)', ids.slice(0, 4), ['brALike', 'brAKeep', 'brAMem', 'brAEven']);
  sc.eq('아랫줄 도구 = 복사·메모·책갈피·공유', ids.slice(4), ['brACopy', 'brAMemo', 'brAMark', 'brAShare']);
  sc.eq('Deeper 는 없다 (이미 성경 안)', /brADeeper/.test(sheet), false);
  sc.eq('Even Deeper 는 켜진 계정에서만', /class="br-act even-only" id="brAEven"/.test(sheet), true);
  sc.eq('반응은 앱의 같은 기록으로', /_reactWithToast\('like',r\)/.test(SRC) && /_reactWithToast\('mem',r\)/.test(SRC) && /openEvenDeeperFromRef\(r\)/.test(SRC), true);
}

console.log('\n시나리오 13-7 — v26-1007-7 (HB 성경 화면 배치 · 피커 · 활성 창)');
{
  const head = slice('<div class="br-top" id="brHead">', '<div class="br-scroll" id="brScroll">');
  const ids = (head.match(/id="br[A-Za-z]+"/g) || []).map(x => x.slice(4, -1));
  sc.eq('헤더 차례: There · 대시보드 · 제목 · 검색 · Aa · × · (접힌 줄)', ids.filter(x => ['brThere','brDash','brTitle','brFind','brAa','brClose','brMini'].includes(x)), ['brThere', 'brDash', 'brTitle', 'brFind', 'brAa', 'brClose', 'brMini']);
  sc.eq('좌상단 내 표시 단추는 없다 (하단 네 단추로)', /id="brMenu"/.test(SRC), false);
  const nav = slice('<div class="br-nav" id="brNav">', '<div class="br-pick" id="brPick"');
  sc.eq('하단: ‹ · 책갈피 · 형광펜 · 메모 · 읽은 곳 · ›', (nav.match(/id="brPrev"|data-lt="[a-z]+"|id="brNext"/g) || []).join(' '), 'id="brPrev" data-lt="mark" data-lt="hl" data-lt="memo" data-lt="hist" data-lt="orig" id="brNext"');
  sc.eq('하단 가운데 장 번호(요 3/21)는 없다', /id="brPg"/.test(SRC), false);
  sc.eq('아래로 읽으면 헤더는 한 줄, 하단은 사라진다 (스크롤을 따라 — v26-1007-8)', /h\.classList\.toggle\('mini',p>\.5\);n\.classList\.toggle\('hide',p>\.5\);/.test(SRC) && /_brP=Math\.max\(0,Math\.min\(1,_brP\+dy\/span\)\);/.test(SRC), true);
  sc.eq('새 장을 펴면 다시 다 보인다', /_brChrome\(true\);_brProgSync\(\);_brInkPaint\(\);/.test(SRC), true);
  sc.eq('대시보드는 성경을 접었다가 닫으면 다시 편다', /if\(typeof _brUnpark==='function'\)_brUnpark\(\);/.test(slice('function closeVerseDashboard(', '\n}')), true);
  sc.eq('읽은 시간은 창이 활성일 때만', /window\.addEventListener\('blur',\(\)=>\{if\(_brOpen\)_brSessEnd\(\);\}\);/.test(SRC) && /if\(!_brOpen\|\|!_brActiveWin\(\)\)return;/.test(SRC), true);
  sc.eq('피커: 누르면 메뉴, 밀면 손을 따라 (폭의 40%)', /_gnbRpMenu\(!\(m&&m\.classList\.contains\('on'\)\)\);/.test(SRC) && /if\(Math\.abs\(s0\.dx\)>w\*0\.4\)/.test(SRC) && /--rp-dx/.test(SRC), true);
  sc.eq('피커 옛 ▲▼ 그림은 없다', /gnb-rp-hint/.test(SRC), false);
}

console.log('\n시나리오 13-8 — v26-1007-8 (HB) 절 롱터치 메뉴 · 고른 줄 · 부드러운 접기');
{
  const menu = slice('<div class="task-menu br-vmenu" id="brVMenu">', '\n  </div>');
  sc.eq('롱터치 메뉴 = 본문 복사 · 좋아요 · 저장 · 암송 · Deeper · Even · 공유 · There', (menu.match(/data-vm="[a-z]+"/g) || []).join(' '), 'data-vm="copy" data-vm="like" data-vm="keep" data-vm="mem" data-vm="deeper" data-vm="even" data-vm="share" data-vm="there"');
  sc.eq('말씀 설정은 없다', /말씀 설정/.test(menu), false);
  sc.eq('구분선은 본문 복사 아래 하나뿐', (menu.match(/task-menu-sep/g) || []).length, 1);
  sc.eq('롱터치 0.5초 · 우클릭', /_brVmOpen\(\+v\.dataset\.v,x,y\);\},500\)/.test(SRC) && /addEventListener\('contextmenu'/.test(slice('function _brBind(', '// ESC')), true);
  sc.eq('반응·도구 줄은 남은 단추 수만큼 고르게 (빈칸 없음)', /#bibleRd \.br-acts\{display:flex;justify-content:space-around;gap:4px;\}/.test(SRC), true);
  sc.eq('손을 멈추면 움직이던 방향으로 마무리', /const t=_brDir>0\?\(_brP>\.15\?1:0\):\(_brP<\.85\?0:1\);/.test(SRC), true);
}

console.log('\n시나리오 13-9 — 성경 읽기 대시보드 숫자 (B-9, v26-1007-9)');
{
  const now = new Date('2026-10-07T21:00:00').getTime(), H = 36e5, D = 864e5;
  const log = {
    '2026-09-20': [{ b: 43, c: 1, time: '07:00', d: 300 }],                                   // 옛 줄 (t·n·of·s 없음)
    '2026-10-05': [{ b: 43, c: 2, time: '07:00', d: 600, t: now - 2 * D - 14 * H, v: [1, 30], n: 30, of: 30, s: 'home', dv: 'm' }],
    '2026-10-06': [{ b: 43, c: 3, time: '07:00', d: 900, t: now - D - 14 * H, v: [1, 18], n: 18, of: 36, s: 'nav', dv: 'm' }],
    '2026-10-07': [{ b: 19, c: 23, time: '06:00', d: 120, t: now - 15 * H, v: [1, 6], n: 6, of: 6, s: 'deeper', r: '시 23:1', dv: 'pc' }]
  };
  const marks = { '45.8.28': { h: 2, ht: now }, '43.3.16': { k: now - D }, '43.3.17': { h: 1 } };
  const notes = { a: { b: 19, c: 23, v: [1], t: '목자', at: now }, b: { b: 19, c: 1, v: [1], t: '복', at: now } };
  const S = _brDashStats(log, marks, notes, now, 'm');
  sc.eq('이번 달 = 10월 1일부터 (9월 옛 줄은 빠진다)', S.L.length, 3);
  sc.eq('읽은 시간 합 (초)', S.sec, 1620);
  sc.eq('오늘', [S.today.sec, S.today.n], [120, 1]);
  sc.eq('연속으로 읽은 날 3 · 가장 길었던 때 3', [S.streak, S.best], [3, 3]);
  sc.eq('옛 줄도 통독 지도에는 든다 (요 1장)', S.cnt['42.1'], 1);
  sc.eq('끝까지(모든 절) 2 · 읽다 만 1', [S.full, S.part], [2, 1]);
  sc.eq('평균 본 절 비율', S.avgSeen, 83);
  sc.eq('들어온 길', S.src, { home: 1, nav: 1, deeper: 1 });
  sc.eq('Deeper 로 온 것', S.deeper.length, 1);
  sc.eq('가장 오래 머문 책 = 요한복음', Object.keys(S.byBook).sort((a, b) => S.byBook[b] - S.byBook[a])[0], '42');
  sc.eq('이어 읽기 = Deeper 가 아닌 마지막 장 — 덜 읽었으면 그 장 첫 안 본 절 (요 3:19)', [S.next.b, S.next.c, S.next.v, S.next.resume], [42, 3, 19, true]);
  sc.eq('남긴 표시: 형광펜 2 · 메모 2 · 책갈피 1 (최근 3일 1)', [S.marks.hl, S.marks.memo, S.marks.bm, S.marks.recentBm], [2, 2, 1, 1]);
  sc.eq('메모가 가장 많은 책 = 시편', S.marks.memoTop, 18);
  sc.eq('한 번도 안 펼친 책은 짧은 것부터', S.never[0], 30);   // 오바댜(1장) — 같은 1장 책 중 차례가 가장 앞
  sc.eq('이번 주는 주일부터', new Date(_brDashStart('w', now)).getDay(), 0);
  sc.eq('전체는 처음부터', _brDashStart('all', now), 0);
  const E = _brDashStats({}, {}, {}, now, 'all');
  sc.eq('빈 기록에서도 터지지 않는다', [E.L.length, E.streak, E.avgSeen, E.next], [0, 0, null, null]);
  sc.eq('헤더 아래 진행 표시줄 — 접혀도 남는다', /<div class="br-progl" aria-hidden="true"><i id="brProgI"><\/i><\/div>/.test(SRC) && /function _brProgSync\(\)/.test(SRC), true);
  sc.eq('접기는 헤더 높이의 3.5 배에 걸쳐 · 마무리 0.75초 (HB — 아직 급하다)', /_BR_CHROME_SPAN=3\.5,_BR_CHROME_MS=750/.test(SRC), true);
  sc.eq('대시보드 단추는 성경 읽기 대시보드를 연다', /function _brOpenDash\(\)\{_brDashRender\(\);/.test(SRC), true);
}


console.log('\n시나리오 13-10 — v26-1007-10 (HB) 직접 기간 · 큰 하트 · 더블탭 · There');
{
  const now = new Date(2026,9,7,12).getTime();
  const log = {'2026-10-01':[{b:43,c:3,time:Date.now(),sec:60}],'2026-09-01':[{b:1,c:1,time:Date.now(),sec:30}]};
  const C = _brDashStats(log, {}, {}, now, 'c', {from:'2026-09-25', to:'2026-10-07'});
  const A = _brDashStats(log, {}, {}, now, 'all');
  sc.eq('직접 기간은 고른 날만 센다', JSON.stringify(C) !== JSON.stringify(A), true);
  sc.eq('좋아요·암송은 큰 토스트로', /_reactWithToast\('like',ref\)/.test(SRC) && /_reactWithToast\('mem',ref\)/.test(SRC), true);
  sc.eq('롱터치 메뉴 There 는 그 절로 연다', /act==='there'[^]{0,80}openThere\(ref\)/.test(SRC), true);
  sc.eq('절은 두 번 톡 쳐도 확대되지 않는다 · 가로 끌기는 긋기 몫 (pan-y, v26-1008-1)', /#bibleRd \.br-v\{[^}]*touch-action:pan-y;/.test(SRC), true);
  sc.eq('우상단 There 는 화면에 보이는 장절로 (v26-1007-11)', /\$\('brThere'\)\.onclick=\(\)=>\{if\(typeof openThere==='function'\)openThere\(_brViewRef\(\)\);\}/.test(SRC), true);
  sc.eq('본문 파일이 바뀌었으니 기기 저장본을 새로 받는다 (대상 2:24)', /BIBLE_DATA_REV='krv-2'/.test(SRC), true);
}



console.log('\n시나리오 13-11 — 읽은 장 = 모든 절을 한 번씩 (HB (나), v26-1007-12)');
{
  const now = new Date('2026-10-07T21:00:00').getTime(), D = 864e5;
  const T = d => now - d * D;
  // 요 3장(36절)을 세 번에 나눠 봄 → 합치면 다 봤다
  const split = { '2026-10-07': [
    { b: 43, c: 3, time: '07:00', d: 60, t: T(0.3), vs: '1-12', of: 36 },
    { b: 43, c: 3, time: '08:00', d: 60, t: T(0.2), vs: '10-30', of: 36 },
    { b: 43, c: 3, time: '09:00', d: 60, t: T(0.1), vs: '31-36', of: 36 } ] };
  const A = _brDashStats(split, {}, {}, now, 'all');
  sc.eq('나눠 읽어도 합쳐서 다 읽은 장', [A.done.has('42.3'), A.full, A.part, A.chapters], [true, 1, 0, 1]);
  sc.eq('진도율도 이 기준 (1장)', Math.round(A.prog.all * 31102) >= 1 && A.prog.all > 0, true);
  // 한 절이 빠지면 아직
  const miss = { '2026-10-07': [{ b: 43, c: 3, time: '07:00', d: 600, t: T(0.1), vs: '1-20,22-36', of: 36 }] };
  const M = _brDashStats(miss, {}, {}, now, 'all');
  sc.eq('한 절이라도 빠지면 읽는 중 (다 읽은 장은 아니다)', [M.done.has('42.3'), M.full, M.part, M.avgSeen], [false, 0, 1, 97]);
  sc.eq('진도율은 읽은 절만큼 (35절 / 31101절) — HB v26-1007-18', [Math.round(M.prog.all * 31101), Math.round(M.prog.nt * 7957), M.prog.ot], [35, 35, 0]);
  sc.eq('통독 지도 칸 = 그 장에서 읽은 비율', Math.round(M.cov['42.3'].p * 100), 97);
  sc.eq('3초만 열어 둔 장은 진도율에 안 든다', _brDashStats({ '2026-10-07': [{ b: 43, c: 3, time: '07:00', d: 3, t: T(0.1), of: 36 }] }, {}, {}, now, 'all').prog.all, 0);
  // 옛 줄 — v 범위는 n 이 꼭 맞을 때만 믿는다 (빈틈이 있을 수 있다)
  const Dn = _brDashStats({ '2026-10-07': [{ b: 43, c: 3, time: '07:00', d: 60, t: T(0.1), vs: '1-36', of: 36 }] }, {}, {}, now, 'all');
  sc.eq('다 읽었으면 이어 읽기는 다음 장', [Dn.next.b, Dn.next.c, !!Dn.next.resume], [42, 4, false]);
  sc.eq('안 본 절이 없는 기록이면 1절부터', _brDashStats({ '2026-10-07': [{ b: 43, c: 3, time: '07:00', d: 3, t: T(0.1), of: 36 }] }, {}, {}, now, 'all').next.v, 1);
  sc.eq('옛 줄: v 와 n 이 맞으면 믿는다', _brSeenOf({ v: [1, 3], n: 3 }), [1, 2, 3]);
  sc.eq('옛 줄: 빈틈이 있으면 안 믿는다', _brSeenOf({ v: [1, 5], n: 3 }), []);
  sc.eq('새 줄 범위 글 읽기', _brSeenOf({ vs: '1-3,7' }), [1, 2, 3, 7]);
  sc.eq('기록에 본 절 범위를 남긴다', /extra\.vs=_brVerseList\(seen\)/.test(SRC), true);
  sc.eq('읽는 리듬: 첫 열은 주일', /const DW=\[0,1,2,3,4,5,6\],DN=d=>d===0\?'주일'/.test(SRC), true);
  sc.eq('읽는 리듬: 가로 요일 · 세로 시간대', /grid-template-columns:38px repeat\(7,minmax\(0,1fr\)\)/.test(SRC) && /S\.slots\.forEach\(\(x,i\)=>\{hm\+='<span class="d">'/.test(SRC), true);
}


console.log('\n시나리오 13-12 — 조작하는 시간은 읽은 시간에서 뺀다 (HB v26-1007-14)');
{
  sc.eq('읽은 시간 = 본문만 보고 있던 시간을 1초씩 쌓은 것', /if\(_brBusy\(\)\)return;\s*s\.act=\(s\.act\|\|0\)\+dt;/.test(SRC) && /_brReadAdd\(s\.b,s\.c,s\.t,\(s\.act\|\|0\)\/1000,extra\)/.test(SRC), true);
  sc.eq('대시보드·고르기·검색·시트·롱터치 메뉴가 열리면 멈춘다', /#bibleRd \.br-sheet\.on,#brVMenu\.on,#brPick\.on,#brFindP\.on,#brDashP\.on/.test(SRC), true);
  sc.eq('There·담기처럼 본문을 덮는 다른 화면도 멈춘다', /elementFromPoint\(r\.left\+r\.width\/2,r\.top\+r\.height\/2\);\s*return !!el&&!sc\.contains\(el\)/.test(SRC), true);
}


console.log('\n시나리오 13-13 — 성경 화면 닫는 손짓 (HB v26-1007-14)');
{
  sc.eq('왼쪽 가장자리 띠에서만 밀어 닫기 (화면 전체에 걸면 스크롤을 붙잡는다 — v26-1007-16)', /_initEdgeBack\(\$\('bibleRd'\)/.test(SRC), false);
  sc.eq('가장자리 띠는 본문 위 왼쪽 12px — 바깥 끝에서 시작해야 닫힌다 (v26-1008-1 엄격)', /<div class="br-edge" id="brEdge"/.test(SRC) && /#bibleRd \.br-edge\{position:absolute;left:0;top:0;bottom:0;width:12px;z-index:3;touch-action:none;\}/.test(SRC), true);
  sc.eq('관성 스크롤을 멈추는 누르기는 롱터치가 아니다', /if\(Date\.now\(\)-\(_brScrollAt\|\|0\)<250\)return;/.test(SRC), true);
  sc.eq('헤더를 끌어내려 닫기 · 끈 뒤 누르기는 버린다', /const rd=\$\('bibleRd'\),hd=\$\('brHead'\)/.test(SRC) && /if\(dragged\)\{dragged=false;e\.stopPropagation\(\);e\.preventDefault\(\);\}\},true\)/.test(SRC), true);
}


console.log('\n시나리오 13-14 — 읽는 리듬 시간대 · 자정 넘김 (HB v26-1007-15)');
{
  const now = new Date('2026-10-08T12:00:00').getTime();
  const wedNight = new Date('2026-10-07T23:30:00').getTime(), afterMid = new Date('2026-10-08T00:40:00').getTime(), thuDawn = new Date('2026-10-08T04:00:00').getTime();
  const log = { '2026-10-07': [{ b: 43, c: 3, time: '23:30', d: 100, t: wedNight }], '2026-10-08': [{ b: 43, c: 4, time: '00:40', d: 200, t: afterMid }, { b: 43, c: 5, time: '04:00', d: 50, t: thuDawn }] };
  const S = _brDashStats(log, {}, {}, now, 'all');
  sc.eq('시간대 = 새벽 3-6 · 아침 6-9 · 오전 9-12 · 오후 12-18 · 저녁 18-21 · 밤 21-24 · 깊은밤 0-3', S.slots.map(x => x[2] + x[0] + '-' + x[1]).join(' '), '새벽3-6 아침6-9 오전9-12 오후12-18 저녁18-21 밤21-24 깊은밤0-3');
  sc.eq('수요일 밤 23:30 → 수요일 밤', S.grid['3.5'], 100);
  sc.eq('자정 넘긴 0:40 → 수요일 깊은밤 (목요일 아님)', [S.grid['3.6'], S.grid['4.6']], [200, undefined]);
  sc.eq('목요일 4시 → 목요일 새벽', S.grid['4.0'], 50);
}


console.log('\n시나리오 13-15 — 읽은 곳에 절 · 형광펜 7색 (HB v26-1007-17)');
{
  ST.bibleReadLog = { '2026-10-07': [
    { b: 43, c: 3, time: '07:00', d: 60, t: 1000, v: [1, 10], n: 10 },
    { b: 43, c: 3, time: '08:00', d: 60, t: 2000, v: [11, 21], n: 11 },
    { b: 1, c: 1, time: '06:00', d: 60, t: 500 } ] };
  ST.settings.bibleHistHide = {};
  const H = _brHistory();
  sc.eq('마지막으로 읽을 때 본 절 범위', H[0].vr, [11, 21]);
  sc.eq('옛 기록은 절 없이', H[1].vr, null);
  const sw = (SRC.match(/<button class="br-sw" data-c="(\d)"/g) || []).map(x => x.match(/\d/)[0]).join('');
  sc.eq('색 차례 = 연빨강·연주황·노랑·초록·파랑·연보라·연핑크 (번호는 저장값 그대로)', sw, '6712354');
  sc.eq('새 색 6·7 은 본문 칠도 있다', /data-hl="6"\] \.br-tx\{background:var\(--br-hl6\)/.test(SRC) && /data-hl="7"\] \.br-tx\{background:var\(--br-hl7\)/.test(SRC), true);
}


console.log('\n시나리오 13-16 — 본문에 긋는 표시 (bibleInk, v26-1008-1 HB)');
{
  const VS = ['레위 족속중 한 사람이 가서 레위 여자에게 장가 들었더니', '그 여자가 잉태하여 아들을 낳아'];
  ST.bibleInk = {};
  const B = 1, C = 2;   // 출애굽기(0부터 1) 2장
  const sp = _brInkSpansFrom({ s: { v: 1, i: 3 }, e: { v: 1, i: 9 } }, VS);
  sc.eq('끈 범위의 앞뒤 빈칸은 뺀다', _brInkSpansFrom({ s: { v: 1, i: 2 }, e: { v: 1, i: 6 } }, VS), [{ v: 1, a: 3, z: 5 }]);
  sc.eq('거꾸로 끌어도 같다', _brInkSpansFrom({ s: { v: 1, i: 9 }, e: { v: 1, i: 3 } }, VS), sp);
  sc.eq('절을 넘으면 절마다 나뉜다', _brInkSpansFrom({ s: { v: 1, i: 27 }, e: { v: 2, i: 3 } }, VS), [{ v: 1, a: 27, z: 30 }, { v: 2, a: 0, z: 3 }]);
  sc.eq('한 글자씩 옮기기 — 빈칸 건너뛰기', _brInkStepPos({ v: 1, i: 1 }, 1, VS), { v: 1, i: 3 });
  sc.eq('절 경계를 넘는다', _brInkStepPos({ v: 2, i: 0 }, -1, VS), { v: 1, i: 30 });
  sc.eq('맨 끝에서는 그대로', _brInkStepPos({ v: 1, i: 0 }, -1, VS), { v: 1, i: 0 });

  _brInkAdd('h', B, C, [{ v: 1, a: 0, z: 9 }], 6);
  _brInkAdd('u', B, C, [{ v: 1, a: 3, z: 6 }], 1);
  const all = () => Object.values(ST.bibleInk);
  sc.eq('무리끼리는 겹친다 (형광펜 + 밑줄)', all().map(m => m.g).sort(), ['h', 'u']);
  _brInkAdd('h', B, C, [{ v: 1, a: 3, z: 5 }], 2);
  const hs = all().filter(m => m.g === 'h').sort((x, y) => x.a - y.a).map(m => [m.a, m.z, m.t]);
  sc.eq('같은 무리는 새 것이 덮고 앞뒤는 남는다', hs, [[0, 2, 6], [3, 5, 2], [6, 9, 6]]);
  _brInkErase('h', B, C, [{ v: 1, a: 4, z: 7 }]);
  sc.eq('부분 지우기 — 그 무리 그 부분만', all().filter(m => m.g === 'h').sort((x, y) => x.a - y.a).map(m => [m.a, m.z]), [[0, 2], [3, 3], [8, 9]]);
  sc.eq('다른 무리는 그대로', all().filter(m => m.g === 'u').length, 1);
  _brInkAdd('s', B, C, [{ v: 1, a: 0, z: 2 }, { v: 2, a: 0, z: 3 }], 'heart', { i: 5, p: 'e', mono: true });
  const s1 = all().find(m => m.g === 's');
  sc.eq('기호는 끈 범위에 하나 — 자리가 뒤면 마지막 절', [s1.v, s1.a, s1.z, s1.t, s1.i, s1.p, s1.mono], [2, 0, 3, 'heart', 5, 'e', true]);
  _brInkAdd('s', B, C, [{ v: 2, a: 2, z: 2 }], 'star', { i: 1, p: 'a' });
  sc.eq('기호는 닿으면 통째로 바뀐다', all().filter(m => m.g === 's').map(m => m.t), ['star']);
  sc.eq('그 범위에 닿는 것만 고른다', _brInkHits(B, C, [{ v: 1, a: 0, z: 0 }]).map(m => m.g).sort(), ['h']);
  sc.eq('다른 장은 건드리지 않는다', (() => { _brInkAdd('h', B, 3, [{ v: 1, a: 0, z: 2 }], 1); _brInkErase('h', B, C, [{ v: 1, a: 0, z: 30 }]); return all().filter(m => m.g === 'h').map(m => m.c); })(), [3]);
  sc.eq('원어찾기 문구 (HB 예시 모양)', _brInkQuery('출', 2, [{ v: 1, a: 0, z: 1 }], VS), "출2:1 '레위' 원어 해설");
  sc.eq('여러 절이면 범위로', _brInkQuery('출', 2, [{ v: 1, a: 29, z: 30 }, { v: 2, a: 0, z: 0 }], VS), "출2:1-2 '더니 그' 원어 해설");

  // 병합 — 두 기기가 같은 절에 따로 그어도 둘 다 산다 (표시 하나가 한 줄)
  const base = { bibleInk: {} };
  const local = { bibleInk: { ka: { b: 43, c: 3, v: 16, g: 'h', t: 1, a: 0, z: 3, s: 1, at: 1 } } };
  const cloud = { bibleInk: { kb: { b: 43, c: 3, v: 16, g: 'u', t: 0, a: 2, z: 6, s: 2, at: 2 } } };
  const m = _fbMerge(clone(base), local, cloud, false);
  sc.eq('병합: 둘 다', Object.keys(m.bibleInk).sort(), ['ka', 'kb']);
  const b2 = { bibleInk: { ka: local.bibleInk.ka, kb: cloud.bibleInk.kb } };
  const l2 = clone(b2); delete l2.bibleInk.ka;
  sc.eq('병합: 지운 것만 빠진다', Object.keys(_fbMerge(clone(b2), l2, clone(b2), false).bibleInk), ['kb']);
  // 빈 기기로 로그인해도 클라우드의 표시가 안 지워진다 (CLAUDE.md)
  global._fbBaseJson = null;
  const g = _fbMergeGuarded(null, { bibleInk: {}, days: {} }, clone({ bibleInk: b2.bibleInk, days: {} }), false);
  sc.eq('빈 기기 로그인: 클라우드 표시 그대로', Object.keys(g.bibleInk).sort(), ['ka', 'kb']);
  sc.eq('대량 손실 방어가 표시도 센다', _fbCountByKind({ bibleInk: { a: {}, b: {} } }).bible, 2);
  sc.eq('_PRODUCT_SCOPED 아님 — 두 제품이 같이 본다', /_PRODUCT_SCOPED\s*=\s*\[[^\]]*bibleInk/.test(SRC), false);
  sc.eq('큰 물결 = HB 가 정한 값', /const _BR_INK_UL=\{amp:\.12,per:\.6,bw:\.076,vary:\.45,tilt:0\};/.test(SRC), true);
  sc.eq('하트 8 · 별 3 · 체크 3', /const _BR_INK_NV=\{star:3,heart:8,check:3\};/.test(SRC), true);
  sc.eq('장 넘기기는 좌우 여백에서만', /tx=\(x<=Math\.max\(_BR_SIDE,r\.left\)\|\|x>=Math\.min\(W-_BR_SIDE,r\.right\)\)\?x:null;/.test(SRC), true);
  sc.eq('원어찾기는 Even Deeper 가 켜진 계정에서만 (even-only)', /class="br-act even-only" id="brInkOrig"/.test(SRC), true);
  sc.eq('내 기록 › 표시 탭', /<h3>내 기록<\/h3>/.test(SRC) && /<button data-t="hl">표시<\/button>/.test(SRC), true);
}


console.log('\n시나리오 13-17 — 아이폰 스크롤 방향 바꾸기 (HB v26-1008-2)');
{
  sc.eq('아이폰은 본문 touch-action 을 manipulation 으로', /#bibleRd\.br-ios \.br-v\{touch-action:manipulation;\}/.test(SRC), true);
  sc.eq('아이폰 긋기는 터치 이벤트, 모두 passive', (SRC.match(/\$\('brChap'\)\.addEventListener\('touch(start|move|end|cancel)',[^\n]*\{passive:true\}\);/g) || []).length, 4);
  sc.eq('아이폰 터치는 포인터 길을 타지 않는다', /if\(e\.button>0\|\|\(IOS&&e\.pointerType==='touch'\)\)return;/.test(SRC), true);
}


console.log('\n시나리오 13-18 — 원어찾기 기록 · 해설 (bibleOrig, v26-1009-2 HB)');
{
  const VS = ['레위 족속중 한 사람이 가서 레위 여자에게 장가 들었더니', '그 여자가 잉태하여'];
  ST.bibleOrig = {};
  const a = _brOrigAdd(1, 2, [{ v: 1, a: 0, z: 1 }], VS, "출2:1 '레위' 원어 해설");
  const o = ST.bibleOrig[a];
  sc.eq('누른 때 한 줄 — 장절·글자·문구', [o.b, o.c, o.v, o.a, o.v2, o.z, o.w, o.q], [2, 2, 1, 0, 1, 1, '레위', "출2:1 '레위' 원어 해설"]);
  const b2 = _brOrigAdd(1, 2, [{ v: 1, a: 16, z: 17 }], VS, 'q2');
  sc.eq('같은 단어를 또 찾으면 줄이 하나 더', Object.keys(ST.bibleOrig).length, 2);
  _brOrigNote(b2, '  레위 = 연합하다  ');
  sc.eq('해설은 다듬어 붙는다', ST.bibleOrig[b2].n, '레위 = 연합하다');
  const W = _brOrigWords(ST.bibleOrig);
  sc.eq('단어별로 묶는다 (2번 · 해설 함께)', [W.length, W[0].w, W[0].ids.length, W[0].note], [1, '레위', 2, '레위 = 연합하다']);
  _brOrigNote(b2, '');
  sc.eq('해설을 비우면 뗀다', 'n' in ST.bibleOrig[b2], false);
  sc.eq('여러 절에 걸치면 끝 절도', (() => { const x = _brOrigAdd(1, 2, [{ v: 1, a: 29, z: 30 }, { v: 2, a: 0, z: 0 }], VS, ''); return [ST.bibleOrig[x].v, ST.bibleOrig[x].v2, ST.bibleOrig[x].w]; })(), [1, 2, '더니 그']);
  const base = { bibleOrig: {} };
  const m = _fbMerge(clone(base), { bibleOrig: { oa: { w: '레위', at: 1 } } }, { bibleOrig: { ob: { w: '모세', at: 2 } } }, false);
  sc.eq('병합: 두 기기 것 둘 다', Object.keys(m.bibleOrig).sort(), ['oa', 'ob']);
  global._fbBaseJson = null;
  const g = _fbMergeGuarded(null, { bibleOrig: {}, days: {} }, { bibleOrig: { oa: { w: '레위' } }, days: {} }, false);
  sc.eq('빈 기기 로그인: 클라우드 기록 그대로', Object.keys(g.bibleOrig), ['oa']);
  sc.eq('대량 손실 방어가 원어 기록도 센다', _fbCountByKind({ bibleOrig: { a: {}, b: {} } }).bible, 2);
  sc.eq('원어찾기 누르면 복사가 먼저, 기록은 그다음', /_brOrigSend\(q\);[^\n]*\n\s*_brOrigAdd\(b,c,sps,_brChVerses\(\),q\);save\(\);/.test(SRC), true);
  sc.eq('원어 탭은 Even Deeper 계정만', /<button data-t="orig" class="even-only">원어<\/button>/.test(SRC), true);
  sc.eq('해설 붙인 글자는 점선 · 톡 하면 해설', /class="br-origu"/.test(SRC) && /const oh=_brOrigHitAt\(e\.clientX,e\.clientY\);/.test(SRC), true);
}


console.log('\n시나리오 13-19 — 원어 목록 다듬기 (v26-1009-3 HB)');
{
  sc.eq('하단 다섯째 단추 원어 (Even Deeper 계정만)', /<button class="br-lt even-only" data-lt="orig">/.test(SRC), true);
  sc.eq('최신순을 다시 누르면 등록순', /_brOM=k==='t'\?\(\(_brOM==='new'\)\?'old':'new'\):k;/.test(SRC), true);
  sc.eq('한글순 · 원어순 · 찾기 칸', /\['ko','한글순'\],\['or','원어순'\]/.test(SRC) && /<input id="brOQ" type="search"/.test(SRC), true);
  sc.eq('찾기는 목록만 다시 그린다 (칸이 포커스를 잃지 않게)', /if\(e\.target\.id!=='brOQ'\)return;_brOQ=e\.target\.value;const L=\$\('brOList'\);if\(L\)L\.innerHTML=_brOrigListHTML\(\);/.test(SRC), true);
  sc.eq('해설은 접혀 있다가 누르면 펼친다', /data-otog=/.test(SRC) && /#bibleRd \.br-onote\.open \.br-ontx\{max-height:55vh;/.test(SRC), true);
  sc.eq('줄을 눌러도 가지 않고 말씀으로 단추로만', /data-ogo="'\+id\+'">말씀으로</.test(SRC) && /if\(!g\|\|!g\.dataset\.go\)return;/.test(SRC), true);
}


console.log('\n시나리오 13-20 — 해설 속 마크다운 표 (v26-1009-3 HB)');
{
  global.esc = global.esc || (x => String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'));
  eval(slice('// 한 줄 안 — GPT 마크다운의', '// ── 원어 목록 (v26-1009-3) ──') + ';global._brNoteHTML=_brNoteHTML;global._brNoteInline=_brNoteInline;');
  const md = '풀이\n| 헬라어 | 문법 | 의미 |\n| ----------- | --- | --- |\n| Τὸ κοράσιον | 중성 단수 명사 | 어린 소녀야 |\n| σοὶ | 2인칭 단수 여격 | 네게 |\n끝';
  const h = _brNoteHTML(md);
  sc.eq('표 하나 · 머리 칸 셋 · 줄 셋', [(h.match(/<table/g)||[]).length, (h.match(/<th>/g)||[]).length, (h.match(/<tr>/g)||[]).length], [1, 3, 3]);
  sc.eq('구분줄(----)은 안 보인다', /---/.test(h), false);
  sc.eq('표 밖 글은 그대로', h.startsWith('풀이<br>') && h.endsWith('끝'), true);
  sc.eq('글은 이스케이프', _brNoteHTML('<b>x</b>'), '&lt;b&gt;x&lt;/b&gt;');
}


console.log('\n시나리오 13-21 — 보던 자리 · 해설 상자 (v26-1009-4 HB)');
{
  sc.eq('보던 화면 그대로 다시 연다 (절 + 화면 위 거리)', /_brRestore=p\.sv\?p:null;bibleOpen\(p\.b,p\.c,0\);/.test(SRC) && /_brPosSet\(\{b:_brCur\.b,c:_brCur\.c,v:sv,sv,off:Math\.round\(off\)\}\)/.test(SRC), true);
  sc.eq('스크롤이 멈추면 자리 저장', /_brOnScroll\._pt=setTimeout\(_brPosSave,400\);/.test(SRC), true);
  sc.eq('펼친 해설은 상자 안에서 스크롤 · 글 고르기', /#bibleRd \.br-onote\.open \.br-ontx\{max-height:55vh;overflow-y:auto;[^}]*user-select:text;/.test(SRC), true);
  sc.eq('펼친 상자는 화살표로만 접는다', /if\(ot\.classList\.contains\('open'\)&&!e\.target\.closest\('\[data-otg\]'\)\)return;/.test(SRC), true);
  sc.eq('상자 우상단 전체 복사', /data-ocopy=/.test(SRC) && /_brCopy\(t,'해설을 복사했어요'\)/.test(SRC), true);
  const h = _brNoteInline('[image](https://www.google.com/s2/favicons?domain=https://biblehub.com\\&sz=32) Bible Hub');
  sc.eq('GPT 출처 아이콘은 그림으로 (\\& 풀기)', /<img class="br-ofav" src="https:\/\/www\.google\.com\/s2\/favicons\?domain=https:\/\/biblehub\.com&amp;sz=32"/.test(h) && /Bible Hub$/.test(h), true);
  sc.eq('링크는 새 창으로', _brNoteInline('[Bible Hub](https://biblehub.com/greek/1453.htm)'), '<a href="https://biblehub.com/greek/1453.htm" target="_blank" rel="noopener">Bible Hub</a>');
  sc.eq('맨 주소도 링크', /<a href="https:\/\/biblehub\.com"/.test(_brNoteInline('보기 https://biblehub.com 끝')), true);
  sc.eq('http(s) 아닌 주소는 글 그대로', _brNoteInline('[x](javascript:alert(1))').indexOf('<a')<0, true);
  sc.eq('굵게', _brNoteInline('**ἔγειρε**'), '<b>ἔγειρε</b>');
}


console.log('\n시나리오 13-22 — 책 늘어놓기 · 리듬 칸 길게 (v26-1009-5 HB)');
{
  sc.eq('책 고르기: 늘어놓기/갈래별 두 칸 단추', /data-blay="flat"/.test(SRC) && /data-blay="group"/.test(SRC) && /_brS\('bibleBookLay','flat'\)/.test(SRC), true);
  sc.eq('갈래는 대시보드 지도와 같은 나눔 · 타일은 이름+장 수', /\(pk\.tab==='ot'\?_VMAP_GROUPS_OT:_VMAP_GROUPS_NT\)/.test(SRC), true);
  const now = new Date('2026-10-09T12:00:00').getTime(), t = new Date('2026-10-07T22:00:00').getTime();
  const S = _brDashStats({ '2026-10-07': [{ b: 19, c: 23, time: '22:00', d: 300, t }, { b: 19, c: 23, time: '22:10', d: 60, t: t + 6e5 }, { b: 43, c: 3, time: '22:20', d: 120, t: t + 12e5 }] }, {}, {}, now, 'all');
  sc.eq('리듬 칸마다 어느 장을 얼마나 (수요일 밤)', S.gridBy['3.5'], { '18.23': 360, '42.3': 120 });
  sc.eq('휴대폰은 길게, PC 는 클릭하면 펼친다 (v26-1009-6)', /tip\._lp=setTimeout\(\(\)=>showTipX\(el\),500\)/.test(SRC) && /if\(e\.pointerType==='mouse'&&el&&el\.dataset\.tipx\)\{showTipX\(el\);return;\}/.test(SRC), true);
}


console.log('\n시나리오 13-23 — 원어 성경순 · 최근 읽은 곳 한 줄 (v26-1009-7 HB)');
{
  sc.eq('원어 탭 성경순', /\['bb','성경순'\]/.test(SRC) && /_brOM==='bb'\?bib\(x,y\)/.test(SRC), true);
  sc.eq('최근 읽은 곳 알약은 줄바꿈 없이 좌우로', /#bibleRd \.br-recent\{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;/.test(SRC), true);
}


console.log('\n시나리오 13-24 — 읽을 곳 (bibleToRead, v26-1009-8 HB)');
{
  ST.bibleToRead = {};
  sc.eq('넣기', [_brTRToggle(8, 28), _brTRHas(8, 28)], [true, true]);
  sc.eq('이름은 장 자리 (두 기기가 같은 장을 넣어도 하나)', Object.keys(ST.bibleToRead), ['9.28']);
  ST.bibleToRead['48.6'] = { b: 48, c: 6, at: 1 };
  sc.eq('새로 담은 것부터 (화면에선 맨 오른쪽, v26-1010-5)', _brTRList().map(x => x.b + '.' + x.c), ['9.28', '48.6']);
  sc.eq('다시 누르면 뺀다', [_brTRToggle(8, 28), _brTRHas(8, 28)], [false, false]);
  const m = _fbMerge(clone({ bibleToRead: {} }), { bibleToRead: { '9.28': { b: 9, c: 28, at: 1 } } }, { bibleToRead: { '3.5': { b: 3, c: 5, at: 2 } } }, false);
  sc.eq('병합: 두 기기 것 둘 다', Object.keys(m.bibleToRead).sort(), ['3.5', '9.28']);
  global._fbBaseJson = null;
  const g = _fbMergeGuarded(null, { bibleToRead: {}, days: {} }, { bibleToRead: { '3.5': { b: 3, c: 5 } }, days: {} }, false);
  sc.eq('빈 기기 로그인: 클라우드 읽을 곳 그대로', Object.keys(g.bibleToRead), ['3.5']);
  sc.eq('장 목록 고르기 단추 · 고르는 동안 길게 눌러 열기는 쉰다', /data-trpk="1"/.test(SRC) && /if\(!c\|\|_brTRPick\)return;/.test(SRC), true);
  sc.eq('탭 줄은 오른쪽부터 (row-reverse) · 넘치면 좌우 스크롤', /#bibleRd \.br-trbar\{[^}]*flex-direction:row-reverse;[^}]*overflow-x:auto;/.test(SRC), true);
  sc.eq('+ = 지금 장 넣기 · 헤더와 함께 접힌다', /data-trplus="1"/.test(SRC) && /:scope>\.br-trbar'\)/.test(SRC), true);
}


console.log('\n시나리오 13-25 — 읽기 계획 끌어 옮기기 · 빼기 (v26-1010-2 HB)');
{
  ST.bibleToRead = { '9.28': { b: 9, c: 28, at: 3 }, '48.6': { b: 48, c: 6, at: 1 }, '2.2': { b: 2, c: 2, at: 2 } };
  sc.eq('처음엔 최근 것부터', _brTRList().map(x => x.b + '.' + x.c), ['9.28', '2.2', '48.6']);
  _brTRSetOrder(['9.28', '48.6', '2.2']);
  sc.eq('옮긴 차례가 남는다', _brTRList().map(x => x.b + '.' + x.c), ['9.28', '48.6', '2.2']);
  sc.eq('옮긴 뒤 새로 담아도 화면 맨 오른쪽', (() => { _brTRToggle(0, 1); const L = _brTRList(); return L[0].b + '.' + L[0].c; })(), '1.1');
  sc.eq('길게 = 끌기 모드 (확인 창 아님)', /hold=setTimeout\(begin,500\)/.test(SRC) && !/을 읽기 계획에서 뺄까요\?/.test(SRC), true);
  sc.eq('빨간 빼기 자리 · 같은 속도·곡선', /id="brTRDel"/.test(SRC) && /transform '\+\(_SW_SLIDE\/1000\)\+'s '\+_SW_EASE;g\.style\.transform/.test(SRC), true);
  sc.eq('성경 화면에 non-passive 터치 리스너가 없다 (스크롤이 걸린다 — v26-1007-16 · v26-1010-6)', /addEventListener\('touch(start|move)',[^\n]{0,400}\{passive:false\}\)/.test(slice('function _brBind(){', '// 글자와 화면')), false);
  sc.eq('끄는 동안 탭 줄은 overflow:hidden 으로 멈춘다', /#bibleRd \.br-trbar\.drag\{overflow:hidden;/.test(SRC), true);
}


console.log('\n시나리오 13-26 — 성경이 열려 있으면 상단 말씀 끌기 감시가 손대지 않는다 (v26-1010-6 HB)');
{
  sc.eq('_verseBandHit 은 성경이 열려 있으면 거짓', /function _verseBandHit\(x,y\)\{[\s\S]{0,600}if\(typeof _brOpen!=='undefined'&&_brOpen\)return false;/.test(SRC), true);
  sc.eq('덮개가 가리면 거짓 (손가락 아래 맨 위 요소로)', /topEl\.closest\('#bibleRd,#verseFull,\.modal-overlay,\.overlay'\)\)return false;/.test(SRC), true);
}

console.log('\n시나리오 13-27 — 성경이 열려 있는 동안 뒤 화면은 쉰다 (v26-1010-10 HB — 아이패드 미니에서만 스크롤 걸림)');
{
  // ① 뒤 화면 바탕은 손을 받지 않는다 — 아이패드 2·3단의 단 스크롤·경계선(touch-action:none)이 끼어들지 못하게
  sc.eq('html.br-cover 가 뒤 화면 바탕 넷을 pointer-events:none 으로', /html\.br-cover body>header,html\.br-cover #verseBarWrap,html\.br-cover #pageWrap,html\.br-cover #swHome\{pointer-events:none;\}/.test(SRC), true);
  sc.eq('규칙의 대상과 _BR_BASE_SEL 이 같은 넷', /const _BR_BASE_SEL='body>header,#verseBarWrap,#pageWrap,#swHome';/.test(SRC), true);
  // 여는 길·닫는 길이 짝으로 — 닫을 때 빠지면 앱 바탕이 눌리지 않는다
  sc.eq('bibleOpen 이 덮는다', /el\.classList\.add\('on'\);_brOpen=true;_brCover\(true\);/.test(SRC), true);
  sc.eq('_brUnpark 도 덮는다', /classList\.add\('on'\);_brOpen=true;_brCover\(true\);_brNextSrc='resume'/.test(SRC), true);
  sc.eq('bibleClose 가 걷는다', /classList\.remove\('on'\);_brOpen=false;_brCover\(false\);/.test(SRC), true);
  sc.eq('#bibleRd 를 켜고 끄는 곳은 이 셋뿐', (SRC.match(/_brOpen=(true|false);/g)||[]).length, 3);
  // ② 뒤에서 혼자 돌던 그리기가 쉰다
  sc.eq('_rollTick — 성경 밑의 줄은 건너뛴다', /if\(n<2\)return;\s*if\(_brCovered\(el\)\)return;/.test(SRC), true);
  sc.eq('_vcAutoTick — 성경이 열려 있으면 넘기지 않는다', /function _vcAutoTick\(\)\{[\s\S]{0,200}if\(typeof _brOpen!=='undefined'&&_brOpen\)return;/.test(SRC), true);
  // ③ 본문 포인터 감시자는 passive — 사파리는 pointer·mouse 감시자도 '막을 수 있는 자' 로 센다
  const bind = slice('function _brBind(){', '// 넘기기: 옆으로 밀기');
  const brPtr = bind.match(/\$\('brChap'\)\.addEventListener\('pointer(down|move|up|cancel)'[\s\S]*?\);\n/g)||[];
  sc.eq('본문 포인터 감시자 넷 이상', brPtr.length >= 5, true);
  sc.eq('전부 passive', brPtr.every(l=>/\{passive:true\}\);\n$/.test(l)), true);
  sc.eq('롱터치 취소(lpCancel)도 passive', /addEventListener\(t,lpCancel,\{passive:true\}\)/.test(bind), true);
  sc.eq('본문 감시자는 아무것도 막지 않는다 (passive 와 맞물림)', /\$\('brChap'\)\.addEventListener\('pointer[a-z]+',[^\n]*preventDefault/.test(bind), false);
  // _brCovered 의 실제 판정
  const f = new Function('_BR_BASE_SEL','_brOpen', SRC.match(/function _brCovered\(el\)\{[^\n]*\}/)[0] + '; return _brCovered;');
  const fake = sel => ({ closest: s => (s === "body>header,#verseBarWrap,#pageWrap,#swHome" && sel) ? {} : null });
  sc.eq('열려 있고 뒤 화면 안이면 참', f("body>header,#verseBarWrap,#pageWrap,#swHome", true)(fake(true)), true);
  sc.eq('닫혀 있으면 거짓', f("body>header,#verseBarWrap,#pageWrap,#swHome", false)(fake(true)), false);
  sc.eq('뒤 화면 밖(전체화면 윗줄)이면 거짓', f("body>header,#verseBarWrap,#pageWrap,#swHome", true)(fake(false)), false);
}

console.log('\n시나리오 14 — 시안에서 겪은 것');
{
  const css = slice("   인앱 성경 (v26-1006-4, HB", "@media (prefers-reduced-motion:reduce){#bibleRd");
  sc.eq('검색칸 규칙을 input 전체에 걸지 않는다 (체크박스가 부풀었다)', /#bibleRd input\{|\.br-fbar input\{/.test(css), false);
  sc.eq('체크박스는 직접 그린다 (아이폰은 크기 지정을 무시)', /#brFree\{-webkit-appearance:none;appearance:none;/.test(css), true);
  sc.eq('검색어 순서 자유 — 처음엔 꺼짐', /_brS\('bibleFindFree',false\)/.test(SRC), true);
  sc.eq('고르기·검색 판은 아이폰 시계 줄만큼 비운다 (HB 신고 v26-1006-5)', /#bibleRd \.br-pick\{padding-top:env\(safe-area-inset-top,0px\);\}/.test(SRC), true);
  sc.eq('말씀 팝업이 가운데 띄우기 규칙을 position:relative 로 덮지 않는다', /id="versePopupModal" style="[^"]*position:relative/.test(SRC), false);
  sc.eq('바닥 시트는 끌어 내려 닫는다 (공용 _sheetDrag)', /_sheetDrag\(sh,\[sh\.querySelector\('\.br-grab'\),sh\.querySelector\('\.br-shead'\)\]/.test(SRC), true);
}

sc.done();
