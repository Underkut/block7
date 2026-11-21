// 시계(clock/index.html) 핵심 규칙 — 화면 없이 도는 덩어리(<script id="clock-core">)를 떼어 시험한다.
//
// 지키는 것:
//  ① 24시간 · 12시간 글자 — 0시 = 12 AM · 12시 = 12 PM · 13시 = 01 PM · 24시간에는 AM PM 이 없다
//  ② 날짜 줄 — '2026. 11. 21. 토' (한 자리 달 · 날은 0 을 붙이지 않는다)
//  ③ 기본값 — 초 있음 · 24시간 · 문구 'REDEEM THE KAIROS' 하나가 골라져 있다
//  ④ 망가지거나 낡은 저장을 읽어도 죽지 않는다 · 모르는 칸은 기본값
//  ⑤ 문구 더하기 — 공백 정리 · 40자 상한 · 같은 글은 새로 안 만들고 고른다 · 20개 상한
//  ⑥ 문구 지우기 — 고른 것을 지우면 맨 앞 것 · 하나도 없으면 문구 없음(null) · 저장을 다시 읽어도 그대로
//  ⑦ 주소 ?s=1&h=12 는 이번 화면만 바꾼다
//  ⑧ 같은 주소의 다른 앱과 저장 이름이 겹치지 않는다
const fs = require('fs'), path = require('path'), vm = require('vm');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const HTML = fs.readFileSync(path.join(__dirname, '..', 'clock', 'index.html'), 'utf8');
const m = HTML.match(/<script id="clock-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('clock-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Array, String, URLSearchParams, Date };
vm.createContext(ctx);
vm.runInContext(m[1] + `
this.A = { APP_VERSION, KEY, DEFAULT_PHRASE, MAX_PHRASES, MAX_LEN, timeParts, dateLine, defaults, normSettings, phraseText, addPhrase, removePhrase, applyQuery };`, ctx);
const A = ctx.A;
const at = (h, mi, s) => new Date(2026, 10, 21, h, mi, s);

// ① 시간 글자
sc.eq('① 24시간 18:56:09', JSON.stringify(A.timeParts(at(18, 56, 9), false)), JSON.stringify({ h: '18', m: '56', s: '09', ap: '' }));
sc.eq('① 24시간 0시는 00', A.timeParts(at(0, 5, 0), false).h, '00');
sc.eq('① 12시간 0시는 12 AM', A.timeParts(at(0, 5, 0), true).h + A.timeParts(at(0, 5, 0), true).ap, '12AM');
sc.eq('① 12시간 11시는 11 AM', A.timeParts(at(11, 59, 59), true).h + A.timeParts(at(11, 59, 59), true).ap, '11AM');
sc.eq('① 12시간 12시는 12 PM', A.timeParts(at(12, 0, 0), true).h + A.timeParts(at(12, 0, 0), true).ap, '12PM');
sc.eq('① 12시간 13시는 01 PM', A.timeParts(at(13, 0, 0), true).h + A.timeParts(at(13, 0, 0), true).ap, '01PM');
sc.eq('① 12시간 23시는 11 PM', A.timeParts(at(23, 59, 59), true).h + A.timeParts(at(23, 59, 59), true).ap, '11PM');

// ② 날짜 줄
sc.eq('② 2026. 11. 21. 토', A.dateLine(at(1, 0, 0)), '2026. 11. 21. 토');
sc.eq('② 한 자리 달 · 날에는 0 을 붙이지 않는다', A.dateLine(new Date(2026, 0, 5)), '2026. 1. 5. 월');

// ③ 기본값
{
  const d = A.defaults();
  sc.eq('③ 초 있음', d.sec, true);
  sc.eq('③ 24시간', d.h12, false);
  sc.eq('③ 문구는 REDEEM THE KAIROS', A.phraseText(d), 'REDEEM THE KAIROS');
  sc.eq('③ 저장이 아무것도 없으면 기본값', JSON.stringify(A.normSettings(null)), JSON.stringify(d));
}

// ④ 망가진 저장
{
  sc.eq('④ 문자열이 와도 기본값', JSON.stringify(A.normSettings('x')), JSON.stringify(A.defaults()));
  sc.eq('④ 배열이 와도 기본값', JSON.stringify(A.normSettings([1])), JSON.stringify(A.defaults()));
  const n = A.normSettings({ sec: 'yes', h12: 1, phrases: [null, { id: 'a', t: '  ' }, { id: 'a', t: '첫째' }, { id: 'a', t: '겹침' }, { id: '', t: 'x' }, 7], sel: 'zzz' });
  sc.eq('④ 모르는 값은 기본값 (sec)', n.sec, true);
  sc.eq('④ 모르는 값은 기본값 (h12)', n.h12, false);
  sc.eq('④ 쓸 수 있는 문구만 남고 겹친 id 는 버린다', JSON.stringify(n.phrases), JSON.stringify([{ id: 'a', t: '첫째' }]));
  sc.eq('④ 없는 문구를 가리키면 맨 앞 것', n.sel, 'a');
  sc.eq('④ 문구 목록이 칸째 없으면 기본 문구', A.phraseText(A.normSettings({ sec: false })), 'REDEEM THE KAIROS');
  sc.eq('④ 문구가 하나도 없는 저장은 그대로 문구 없음', A.phraseText(A.normSettings({ phrases: [], sel: null })), '');
}

// ⑤ 문구 더하기
{
  let s = A.defaults();
  s = A.addPhrase(s, '  less   is more ', 'p1');
  sc.eq('⑤ 공백을 정리해 더하고 그것을 고른다', A.phraseText(s), 'less is more');
  sc.eq('⑤ 둘이 된다', s.phrases.length, 2);
  const s2 = A.addPhrase(s, 'LESS IS MORE', 'p2');
  sc.eq('⑤ 같은 글(대소문자 무시)은 새로 안 만든다', s2.phrases.length, 2);
  sc.eq('⑤ 빈 글은 그대로', A.addPhrase(s, '   ', 'p3'), s);
  const long = A.addPhrase(A.defaults(), 'a'.repeat(100), 'p4');
  sc.eq('⑤ 40자까지만', A.phraseText(long).length, A.MAX_LEN);
  let f = A.defaults();
  for (let i = 0; i < 40; i++) f = A.addPhrase(f, '문구' + i, 'q' + i);
  sc.eq('⑤ 20개 상한', f.phrases.length, A.MAX_PHRASES);
  sc.eq('⑤ 원본을 고치지 않는다', A.defaults().phrases.length, 1);
}

// ⑥ 문구 지우기
{
  let s = A.addPhrase(A.defaults(), '둘째', 'p1');            // 고른 것 = 둘째
  s = A.removePhrase(s, 'p1');
  sc.eq('⑥ 고른 것을 지우면 맨 앞 것', A.phraseText(s), 'REDEEM THE KAIROS');
  s = A.removePhrase(s, 'p0');
  sc.eq('⑥ 하나도 없으면 문구 없음', s.sel, null);
  sc.eq('⑥ 문구 없음', A.phraseText(s), '');
  const back = A.normSettings(JSON.parse(JSON.stringify(s)));
  sc.eq('⑥ 저장했다 읽어도 문구 없음 (기본 문구가 되살아나지 않는다)', A.phraseText(back), '');
  let t = A.addPhrase(A.defaults(), '둘째', 'p1');
  t = A.removePhrase(t, 'p0');                                // 고르지 않은 것을 지우면 고른 것은 그대로
  sc.eq('⑥ 고르지 않은 것을 지워도 고른 것은 그대로', A.phraseText(t), '둘째');
}

// ⑦ 주소
{
  const d = A.defaults();
  const q = A.applyQuery(d, '?s=0&h=12');
  sc.eq('⑦ ?s=0&h=12', q.sec === false && q.h12 === true, true);
  sc.eq('⑦ 원본은 그대로', d.sec === true && d.h12 === false, true);
  sc.eq('⑦ 모르는 값은 무시', JSON.stringify(A.applyQuery(d, '?s=x&h=7')), JSON.stringify(d));
  sc.eq('⑦ 주소가 없어도 된다', JSON.stringify(A.applyQuery(d, '')), JSON.stringify(d));
}

// ⑧ 저장 이름 · 버전 형식
sc.eq('⑧ 저장 이름', A.KEY, 'b7clock_v1');
sc.eq('⑧ 다른 앱 이름과 다르다', ['b7timer_v1', 'b7v1_owner'].includes(A.KEY), false);
sc.eq('⑧ 버전 형식', /^v\. \d{2}-\d{4}-\d+$/.test(A.APP_VERSION), true);
sc.eq('⑧ 파일 2번째 줄 주석과 같은 버전', HTML.split('\n')[1], `<!-- CLOCK ${A.APP_VERSION} -->`);

sc.done();
