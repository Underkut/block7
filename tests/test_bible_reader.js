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
  ';Object.assign(globalThis,{_bookCanon,_brKey,_brSetMark,_brNoteSave,_brNotesAt,_brMigrateNotes,_brHistory,_brHistHide,_brReadAdd,_brParseRef,_brFmtRef,_brCopyText,_brFindWords,_brMatch,_brVerseList,_brDashStats,_brDashStart,_brReadMs,getBibleMarks,getBibleReadLog,getBibleNotes});'
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
  ['bibleMarks', 'bibleReadLog', 'bibleNotes'].forEach(n => {
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
  sc.eq('하단: ‹ · 책갈피 · 형광펜 · 메모 · 읽은 곳 · ›', (nav.match(/id="brPrev"|data-lt="[a-z]+"|id="brNext"/g) || []).join(' '), 'id="brPrev" data-lt="mark" data-lt="hl" data-lt="memo" data-lt="hist" id="brNext"');
  sc.eq('하단 가운데 장 번호(요 3/21)는 없다', /id="brPg"/.test(SRC), false);
  sc.eq('아래로 읽으면 헤더는 한 줄, 하단은 사라진다 (스크롤을 따라 — v26-1007-8)', /h\.classList\.toggle\('mini',p>\.5\);n\.classList\.toggle\('hide',p>\.5\);/.test(SRC) && /_brP=Math\.max\(0,Math\.min\(1,_brP\+dy\/span\)\);/.test(SRC), true);
  sc.eq('새 장을 펴면 다시 다 보인다', /_brChrome\(true\);_brProgSync\(\);\s*_brPosSet\(/.test(SRC), true);
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
    '2026-10-05': [{ b: 43, c: 2, time: '07:00', d: 600, t: now - 2 * D - 14 * H, n: 30, of: 30, s: 'home', dv: 'm' }],
    '2026-10-06': [{ b: 43, c: 3, time: '07:00', d: 900, t: now - D - 14 * H, n: 18, of: 36, s: 'nav', dv: 'm' }],
    '2026-10-07': [{ b: 19, c: 23, time: '06:00', d: 120, t: now - 15 * H, n: 6, of: 6, s: 'deeper', r: '시 23:1', dv: 'pc' }]
  };
  const marks = { '45.8.28': { h: 2, ht: now }, '43.3.16': { k: now - D }, '43.3.17': { h: 1 } };
  const notes = { a: { b: 19, c: 23, v: [1], t: '목자', at: now }, b: { b: 19, c: 1, v: [1], t: '복', at: now } };
  const S = _brDashStats(log, marks, notes, now, 'm');
  sc.eq('이번 달 = 10월 1일부터 (9월 옛 줄은 빠진다)', S.L.length, 3);
  sc.eq('읽은 시간 합 (초)', S.sec, 1620);
  sc.eq('오늘', [S.today.sec, S.today.n], [120, 1]);
  sc.eq('연속으로 읽은 날 3 · 가장 길었던 때 3', [S.streak, S.best], [3, 3]);
  sc.eq('옛 줄도 통독 지도에는 든다 (요 1장)', S.cnt['42.1'], 1);
  sc.eq('끝까지(90% 이상) 2 · 읽다 만 1', [S.full, S.part], [2, 1]);
  sc.eq('평균 본 절 비율', S.avgSeen, 83);
  sc.eq('들어온 길', S.src, { home: 1, nav: 1, deeper: 1 });
  sc.eq('Deeper 로 온 것', S.deeper.length, 1);
  sc.eq('가장 오래 머문 책 = 요한복음', Object.keys(S.byBook).sort((a, b) => S.byBook[b] - S.byBook[a])[0], '42');
  sc.eq('이어 읽기 = Deeper 가 아닌 마지막 다음 장 (요 4장)', [S.next.b, S.next.c], [42, 4]);
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
  sc.eq('절은 두 번 톡 쳐도 확대되지 않는다', /\.br-v\{[^}]*touch-action:manipulation/.test(SRC), true);
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
