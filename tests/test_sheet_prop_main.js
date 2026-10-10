// PC 에서 명제를 열면 늘 '명제 DB' 탭의 행으로 (v26-1010-16, HB).
//
// HB: "명제 파일로 갈 때 갈 필요 없는 '성도 공유용' 탭으로 가는 게 너무 불편하다. 늘 '명제 DB' 로."
//
// 까닭 — 앱은 명제마다 **마지막으로 받아 온 탭** 의 행(gid·row)만 기억한다. 두 탭에 다 있는
//   명제(2026-10-10 실제 시트에서 455개 중 261개)는 성도 공유용을 나중에 받아 그 탭으로 갔다.
// 고친 길 — PC 에서 명제를 열 때 **그 순간 그 모음의 시트를 새로 읽어**, 그 명제가 있는 탭
//   가운데 앱이 읽는 칸이 가장 많은 탭(명제 DB)의 행으로 연다. 저장은 하나도 안 바꾼다.
//   덤 — 그사이 시트에 줄을 끼워 넣어도 지금 행으로 간다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
function z(n){return String(n).padStart(2,'0');}
eval(slice('function _parseCsv(', '// rows → items'));
eval(slice('function _parseVDate(', 'function _looksLikeRef(').replace(/^const /gm,'var '));
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('// ══ 명제집(설교 명제 DB) 시트 읽기', '// 파일/직접용 임포트'));
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm'));
function _bookOfRef(ref){const m=String(ref||'').trim().match(/^([가-힣0-9\s]+?)\s*\d/);return m?m[1].trim():'';}
function _bookNorm(n){return String(n||'').trim();}
function _calKey(){return '2026-10-10';}
let COLLS = [];
global.getVerseCollections = () => COLLS;
eval(slice('function _sheetUrlForVerse(', '// 대분류 탭 — 롱터치로'));
// 열기·복사·창 흉내
let log = [], SHEETS = {}, FETCH_FAIL = false, POPUP = true, CUR = null;
global._isDevAccount = () => true;
global._vfCurrentVerse = () => CUR;
global.showToast = m => log.push('토스트 ' + m);
global._dismissToast = () => {};
global._dlog = () => {};
global._sheetGo = url => log.push('예전 길 ' + url);
global._sheetCopyPending = () => {};
global._fallbackCopy = () => true;
global._fetchSheetCsv = async url => {
  log.push('읽기 gid=' + (url.match(/gid=(\d+)/) || [])[1]);
  if (FETCH_FAIL) return { err: '못 읽음' };
  const t = SHEETS[(url.match(/gid=(\d+)/) || [])[1]];
  return t == null ? { err: '없음' } : { text: t };
};
let WIN = null;
global.window = { open: () => {
  if (!POPUP) return null;
  WIN = { opener: {}, document: { title: '', body: { innerHTML: '' } }, url: null,
          location: { replace(u) { WIN.url = u; } } };
  return WIN;
} };
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: '', platform: 'MacIntel', maxTouchPoints: 0 }, writable: true, configurable: true });
eval(slice('// 대분류 탭 — 롱터치로', '// 시트 열기는 **기기에 따라 정반대로**'));

// ── 시트 흉내 (2026-10-10 실제 머리글) ──
const DB_HEAD = ['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','인용 본문',
  '명제','대표 문구 1','대표 문구 2','분류','대표 명제','핵심 주제','주제 태그','조직신학',
  '성경신학/구속사','성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치',
  '한 줄 요약','원문 상태','관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
const SH_HEAD = ['주제','상황/필요','명제','본문','분류','묵상 질문','설교 제목','날짜','명제 ID',
  '공개 여부','검수 상태','공개 제목','공개 해설','기도문','공유 슬러그','공개 순서'];
const LIST_HEAD = ['날짜','카테고리','설교 제목','설교자','영상 링크','영상 시각','주요 본문','핵심 주제',
  '주제 태그','Best 1','Best 2','Best 3','명제 수','원문 상태'];
const cell = s => /[",\n\r]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : String(s);
const csv = (head, lines) => [head.map(cell).join(',')].concat(lines.map(o =>
  o ? head.map(h => cell(o[h] == null ? '' : o[h])).join(',') : head.map(() => '').join(','))).join('\n') + '\n';
const IDS = ['P0001', 'P0002', 'P0003', 'P0004', 'P0005'];
const TXT = id => '명제 본문 ' + id + ' — 빛과 소금으로 사는 제자';
const db = (extra) => IDS.map(id => ({ '명제 ID': id, '날짜': '2026-06-21', '카테고리': '주일예배',
  '설교 제목': '언덕 위의 도시', '설교 본문': '마태복음 5:13-16', '명제': TXT(id), '대표 문구 1': '빛과 소금',
  '주제 태그': '제자도', '상황 태그': '흔들릴 때', '데이터 상태': '활성' })).concat(extra || []);
const share = ['P0004', 'P0001', 'P0003'].map(id => ({ '주제': '정체성', '상황/필요': '흔들릴 때', '명제': TXT(id),
  '본문': '마태복음 5:13-16', '묵상 질문': '오늘 나는?', '설교 제목': '언덕 위의 도시', '날짜': '2026-06-21', '명제 ID': id }));
const list = [{ '날짜': '2026-06-21', '카테고리': '주일예배', '설교 제목': '언덕 위의 도시', '영상 링크': '' }];
const ID = 'PROPDB';
const LINKS = {
  0: { name: '명제 DB', url: `https://docs.google.com/spreadsheets/d/${ID}/edit#gid=0` },
  777: { name: '성도 공유용', url: `https://docs.google.com/spreadsheets/d/${ID}/edit?gid=777#gid=777` },
  222: { name: '설교 목록', url: `https://docs.google.com/spreadsheets/d/${ID}/edit?gid=222#gid=222` },
};
// HB 의 실제 연결 순서: 명제 DB → 성도 공유용 → 설교 목록
function setup(order) {
  SHEETS = { 0: csv(DB_HEAD, db()), 777: csv(SH_HEAD, share), 222: csv(LIST_HEAD, list) };
  const c = { id: 'c1', name: '명제집', verses: [], google: order.map(g => Object.assign({}, LINKS[g])) };
  _syncCollSheets(c, c.google.map(g => ({ g, rows: _parseCsv(SHEETS[(g.url.match(/gid=(\d+)/) || [])[1]]) })));
  COLLS = [c];
  return c;
}
const shown = v => ({ ref: v.ref, cat: v.cat, topic: v.topic, krText: v.krText, pid: v.pid || '' });
const gidOf = u => (String(u).match(/#gid=(\d+)/) || [])[1];
const rowOf = u => +((String(u).match(/range=A(\d+):/) || [])[1] || 0);
const PC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
async function openFor(pid) {
  log = []; WIN = null;
  CUR = shown(COLLS[0].verses.find(v => v.pid === pid));
  vfOpenSheetForCat();
  for (let i = 0; i < 6; i++) await Promise.resolve();
  await new Promise(r => setImmediate(r));
}

(async () => {
  navigator.userAgent = PC;

  // ═══ 1. 두 탭에 다 있는 명제 — 예전엔 성도 공유용, 이제는 명제 DB ═══
  console.log('시나리오 1 — 두 탭에 다 있는 명제는 명제 DB 탭으로');
  {
    const c = setup([0, 777, 222]);
    const p1 = c.verses.find(v => v.pid === 'P0001');
    sc.eq('예전 길(기억한 탭)은 성도 공유용이었다', gidOf(_sheetUrlForVerse(shown(p1)).url), '777');
    await openFor('P0001');
    sc.eq('새 탭을 먼저 연다', !!WIN, true);
    sc.eq('그 모음의 시트를 새로 읽는다', log.filter(x => x.startsWith('읽기')).sort(), ['읽기 gid=0', '읽기 gid=222', '읽기 gid=777']);
    sc.eq('명제 DB 탭으로 간다', gidOf(WIN.url), '0');
    sc.eq('명제 DB 의 그 행 (머리글 다음 첫 줄)', rowOf(WIN.url), 2);
    sc.eq('새 탭과 이 앱의 끈을 끊는다', WIN.opener, null);
    await openFor('P0004');
    sc.eq('성도 공유용에서는 첫 줄이어도 명제 DB 의 5행으로', [gidOf(WIN.url), rowOf(WIN.url)], ['0', 5]);
    await openFor('P0002');
    sc.eq('명제 DB 에만 있는 명제도 명제 DB', [gidOf(WIN.url), rowOf(WIN.url)], ['0', 3]);
  }

  // ═══ 2. 연결 순서가 달라도 (성도 공유용을 먼저 연결) ═══
  console.log('\n시나리오 2 — 연결 순서와 상관없이 명제 DB');
  {
    setup([777, 0, 222]);
    await openFor('P0003');
    sc.eq('여전히 명제 DB 의 4행', [gidOf(WIN.url), rowOf(WIN.url)], ['0', 4]);
  }

  // ═══ 3. 그사이 시트에 줄을 끼워 넣었다 — 지금 행으로 ═══
  console.log('\n시나리오 3 — 동기화 뒤 시트에 줄을 끼워도 지금 행');
  {
    setup([0, 777, 222]);
    // 동기화 뒤에 HB 가 맨 위에 새 명제 둘과 빈 줄 하나를 끼웠다
    SHEETS[0] = csv(DB_HEAD, [
      { '명제 ID': 'P0101', '명제': '새 명제 1', '데이터 상태': '활성' },
      { '명제 ID': 'P0102', '명제': '새 명제 2', '데이터 상태': '활성' },
      null,
    ].concat(db()));
    await openFor('P0004');
    sc.eq('기억해 둔 행(5)이 아니라 지금 행(8)', [gidOf(WIN.url), rowOf(WIN.url)], ['0', 8]);
  }

  // ═══ 4. 못 읽으면 예전 길 ═══
  console.log('\n시나리오 4 — 못 읽거나 못 찾으면 예전 주소');
  {
    const c = setup([0, 777, 222]);
    const before = _sheetUrlForVerse(shown(c.verses.find(v => v.pid === 'P0001'))).url;
    FETCH_FAIL = true;
    await openFor('P0001');
    sc.eq('시트를 못 읽으면 기억해 둔 주소로', WIN.url, before);
    FETCH_FAIL = false;
    // 시트에서 그 명제가 지워졌다 (다음 동기화 전)
    SHEETS[0] = csv(DB_HEAD, db().filter(o => o['명제 ID'] !== 'P0002'));
    SHEETS[777] = csv(SH_HEAD, share);
    const b2 = _sheetUrlForVerse(shown(c.verses.find(v => v.pid === 'P0002'))).url;
    await openFor('P0002');
    sc.eq('시트에 없으면 기억해 둔 주소로', WIN.url, b2);
    // 새 탭이 막힌 브라우저 — 예전 길 그대로
    POPUP = false;
    await openFor('P0001');
    sc.eq('새 탭이 막히면 예전 길', log.filter(x => x.startsWith('예전 길')).length, 1);
    POPUP = true;
  }

  // ═══ 5. 모바일 · 말씀은 예전 그대로 ═══
  console.log('\n시나리오 5 — 모바일과 말씀은 그대로');
  {
    setup([0, 777, 222]);
    navigator.userAgent = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
    await openFor('P0001');
    sc.eq('안드로이드는 시트를 읽지 않고 예전 길', [WIN, log.filter(x => x.startsWith('읽기')).length], [null, 0]);
    navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
    await openFor('P0001');
    sc.eq('아이폰도 예전 길', [WIN, log.filter(x => x.startsWith('읽기')).length], [null, 0]);
    navigator.userAgent = PC;
    // 말씀 (명제 ID 없음)
    const vc = { id: 'cv', name: '암송', verses: [{ ref: '요한복음 3:16', cat: '주일예배', topic: '사랑', krText: '하나님이 세상을',
      src: 'google', gid: 'gv', row: 7 }], google: [{ id: 'gv', url: 'https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5' }] };
    COLLS = [vc];
    log = []; WIN = null; CUR = shown(vc.verses[0]);
    vfOpenSheetForCat();
    await new Promise(r => setImmediate(r));
    sc.eq('말씀은 읽지 않고 기억한 행으로', log, ['예전 길 https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5&range=A7:G7']);
  }

  sc.done();
})();
