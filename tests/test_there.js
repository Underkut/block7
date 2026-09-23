// There — 기도·예배 시간 기록 (v26-0923-5, HB)
//   버튼을 누르면 전체화면이 열리고, 열려 있던 시간을 ST.verseThereLog 에 남긴다.
//   {"YYYY-MM-DD":[{ref,time:"HH:MM",t:시작ms,d:초,sec}]}
//
// ⚠️ 데이터 계층이다. 새 기록 칸을 만들면 병합·백업·가져오기·되살리기가
//    전부 그 이름을 알아야 한다. 한 곳이라도 빠지면 그 길에서 조용히 사라진다
//    (verseKeepLog 때 '다섯 곳' 을 한 번에 등록한 까닭). 여기서 한꺼번에 본다.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
function clone(o){ return JSON.parse(JSON.stringify(o)); }

// ── 기록 함수 ──
let NOW = new Date('2026-09-23T21:30:00').getTime();
const realNow = Date.now;
Date.now = () => NOW;
global.ST = { settings: {} };
let SAVED = 0;
global.rawSave = () => { SAVED++; };
global._calKey = () => {
  const n = new Date(NOW);
  return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
};
global._nowHM = () => {
  const n = new Date(NOW);
  return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
};
global._secIdNowAll = () => 'night';
// 반응 키 판정은 진짜 것을 쓴다 (명제 키와 장절을 가르는 규칙)
eval(slice("const _REACT_PID_PREFIX=", "function _reactKey(v){"));
global._refNorm = r => String(r || '').trim().replace(/\s+/g, '');
eval(slice('// ══ There — 기도·예배 시간 기록', '// ── Deeper 로그 (누적 이벤트형'));

console.log('시나리오 1 — 10초 미만은 버린다');
{
  ST.verseThereLog = {}; SAVED = 0;
  _thereBegin('요한복음 3:16');
  NOW += 9 * 1000;
  sc.eq('9초 → 기록 안 함', _thereCommit(), null);
  sc.eq('로그 비어 있음', ST.verseThereLog, {});
  sc.eq('저장도 안 부름', SAVED, 0);
}

console.log('시나리오 2 — 10초 이상은 남긴다 (시작 날짜·시각·길이)');
{
  ST.verseThereLog = {}; SAVED = 0;
  NOW = new Date('2026-09-23T21:30:00').getTime();
  _thereBegin('요한복음 3:16');
  NOW += 40 * 60 * 1000;                       // 40분
  const en = _thereCommit();
  sc.eq('한 건', ST.verseThereLog['2026-09-23'].length, 1);
  sc.eq('장절', en.ref, '요한복음 3:16');
  sc.eq('시작 시각', en.time, '21:30');
  sc.eq('길이(초)', en.d, 2400);
  sc.eq('구간', en.sec, 'night');
  sc.eq('저장 한 번', SAVED, 1);
  sc.eq('끝난 뒤에는 세션 없음', _thereCommit(), null);
}

console.log('시나리오 3 — 자정을 넘겨도 **시작한 날** 에 담는다');
{
  ST.verseThereLog = {};
  NOW = new Date('2026-09-23T23:50:00').getTime();
  _thereBegin('');
  NOW += 30 * 60 * 1000;                       // 다음 날 00:20
  _thereCommit();
  sc.eq('23일에 담김', Object.keys(ST.verseThereLog), ['2026-09-23']);
  sc.eq('길이 1800초', ST.verseThereLog['2026-09-23'][0].d, 1800);
}

console.log('시나리오 4 — GNB 에서 연 것은 말씀 없이(ref 빈칸) 남고, 합계에는 든다');
{
  ST.verseThereLog = {
    '2026-09-22': [{ ref: '시편 23:1', time: '06:00', t: 1, d: 600, sec: 'am' }],
    '2026-09-23': [{ ref: '', time: '21:00', t: 2, d: 1500, sec: 'night' },
                   { ref: '시편 23:1', time: '22:00', t: 3, d: 300, sec: 'night' }]
  };
  sc.eq('전체 합계(초)', _thereTotalSec(), 2400);
  sc.eq('이 말씀의 횟수', _thereCountFor('시편 23:1'), 2);
  sc.eq('빈 ref 는 어느 말씀에도 안 센다', _thereCountFor(''), 0);
}

console.log('시나리오 5 — 시간 글자: 한 시간 넘으면 H:MM:SS / 합계는 N시간 M분');
{
  sc.eq('59:59', _thereClock(3599), '59:59');
  sc.eq('1:00:05', _thereClock(3605), '1:00:05');
  sc.eq('45분', _thereDurWords(45 * 60 + 20), '45분');
  sc.eq('2시간 5분', _thereDurWords(2 * 3600 + 5 * 60), '2시간 5분');
  sc.eq('딱 1시간', _thereDurWords(3600), '1시간');
  sc.eq('1분 미만', _thereDurWords(30), '1분 미만');
}
Date.now = realNow;

// ── 병합 ──
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(slice('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

console.log('시나리오 6 — 두 기기가 각각 남긴 There 가 서로를 안 지운다');
{
  const base = { verseThereLog: { '2026-09-23': [{ ref: '', time: '06:00', t: 1, d: 600, sec: 'am' }] } };
  const local = clone(base); local.verseThereLog['2026-09-23'].push({ ref: '시편 23:1', time: '09:00', t: 2, d: 900, sec: 'am' });
  const cloud = clone(base); cloud.verseThereLog['2026-09-23'].push({ ref: '', time: '21:00', t: 3, d: 1200, sec: 'night' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('세 건 모두', m.verseThereLog['2026-09-23'].length, 3);
}

console.log('시나리오 7 — 옛 버전 기기가 떨어뜨려도 새 기기가 되살린다');
// 옛 기기는 이 칸을 몰라 applyRemoteState 에서 버리고, 다음 저장 때 클라우드에서
// 빠진다. 새 기기는 그 문서를 **낮은 버전이 쓴 것**으로 알아보고 base 없이
// (합집합으로) 합친다 → 제 손에 든 기록이 그대로 돌아간다.
{
  const mine = { verseThereLog: { '2026-09-23': [{ ref: '', time: '06:00', t: 1, d: 600, sec: 'am' }] }, days: {} };
  const cloudFromOld = { days: {} };             // 옛 기기가 쓴 문서 — 칸이 없다
  global._fbBaseJson = JSON.stringify(mine);    // 이 기기는 클라우드를 받아 본 기기다
  const m = _fbMergeGuarded(null, mine, cloudFromOld, false);
  sc.eq('내 기록 살아 있음', m.verseThereLog['2026-09-23'].length, 1);
}

console.log('시나리오 8 — 대량 손실 방어가 There 기록도 센다');
{
  const o = { verseThereLog: { a: [{ ref: '', t: 1 }], b: [{ ref: '', t: 2 }, { ref: '', t: 3 }] } };
  sc.eq('기록 3건이 verseLogs 에 잡힌다', _fbCountByKind(o).verseLogs, 3);
}

console.log('시나리오 7-2 — 빈 기기로 로그인해도 클라우드의 There 가 안 지워진다');
// CLAUDE.md — 로그인·동기화가 걸린 변경은 이 물음을 실제로 돌려 본다.
// 새 기기는 처음 상태(verseThereLog:{})를 들고 있고, 클라우드를 한 번도 받은 적이 없다.
{
  const cloud = { verseThereLog: { '2026-09-20': [{ ref: '', time: '06:00', t: 1, d: 600, sec: 'am' }],
                                   '2026-09-21': [{ ref: '시편 23:1', time: '07:00', t: 2, d: 900, sec: 'am' }] },
                  days: {}, verseLikeLog: {} };
  const fresh = { verseThereLog: {}, days: {}, verseLikeLog: {} };
  global._fbBaseJson = null;                    // 처음 로그인하는 기기
  const m = _fbMergeGuarded(null, clone(fresh), clone(cloud), false);
  sc.eq('클라우드의 두 날짜 그대로', Object.keys(m.verseThereLog).sort(), ['2026-09-20', '2026-09-21']);
  sc.eq('건수 그대로', _fbCountArrays(m.verseThereLog, 0), 2);
}

// ── 이름이 등록돼야 하는 자리들 ──
console.log('시나리오 9 — 여덟 자리 모두 이름을 안다');
{
  const has = (start, end) => slice(start, end).indexOf("'verseThereLog'") >= 0 || slice(start, end).indexOf('verseThereLog') >= 0;
  sc.eq('처음 상태(defaultState) — 두 제품 공통', has('function defaultState(){', 'settings:{'), true);
  sc.eq('불러올 때 빈 칸 채우기', /if\(!ST\.verseThereLog\)ST\.verseThereLog=\{\};/.test(SRC), true);
  sc.eq('원격 받기(applyRemoteState)', has('function applyRemoteState(remote){', 'ST.contacts='), true);
  sc.eq('백업 목록', has('const _VERSE_BACKUP_KEYS=', '];'), true);
  sc.eq('Sweeter 가져오기 목록', has('const _SW_IMPORT_KEYS=', '];'), true);
  sc.eq('달라진 점 풀어 말하기(_DF_LOGS)', has('const _DF_LOGS=', ']];'), true);
  sc.eq('구간 보관(_SEC_MARK_LOGS)', has('const _SEC_MARK_LOGS=', '];'), true);
  sc.eq('장절 고쳐 쓰기(_rewriteLogRefs)', has('function _rewriteLogRefs(', 'const mem='), true);
}

console.log('시나리오 10 — 세팅은 이 기기에만 (_lsk) · 클라우드 설정에 안 들어간다');
{
  sc.eq('_lsk(\'thereFx\') 로 저장', /_lsk\('thereFx'\)/.test(SRC), true);
  sc.eq('ST.settings 에 There 세팅을 쓰지 않는다', /ST\.settings\.thereFx/.test(SRC), false);
}

sc.done();
