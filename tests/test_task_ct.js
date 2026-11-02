// 할일의 만든 시각 ct (v. 26-1102-14, HB '지금부터 기록') — 검색 '처음/최신 등록순' 이 본다.
// 지키는 것: 새로 만들면 찍힌다 · 옮기기 · 이월 · 반복 회차(같은 할일)는 물려받는다 · 복제(새 할일)는 새로 찍는다 ·
//           예전 할일(ct 없음)에는 아무것도 붙이지 않는다(옮겨도 ct 가 생기지 않는다) · 이미 있으면 _ctNow 가 덮지 않는다.
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();
const fn = name => { const a = SRC.indexOf('function ' + name + '('); if (a < 0) throw new Error('없음: ' + name); let i = SRC.indexOf('{', a), d = 0;
  for (; i < SRC.length; i++) { if (SRC[i] === '{') d++; else if (SRC[i] === '}') { d--; if (!d) break; } } return SRC.slice(a, i + 1); };
const api = new Function(['_subsOf', '_subsCopy', '_carryTaskExtras', '_ctNow', '_newTask', '_freshTaskCopy', '_movedTaskCopy'].map(fn).join('\n') +
  '\nreturn {_carryTaskExtras,_ctNow,_newTask,_freshTaskCopy,_movedTaskCopy};')();

console.log('시나리오 1 — 새로 만들면 찍힌다');
{
  const t0 = Date.now(), it = api._newTask('보고서');
  sc.eq('_newTask 에 ct', it.ct >= t0 && it.ct <= Date.now(), true);
  sc.eq('글자 · 완료는 예전 그대로', [it.text, it.done], ['보고서', false]);
  sc.eq('_ctNow 는 새 것에 찍고', !!api._ctNow({ text: 'a' }).ct, true);
  sc.eq('_ctNow 는 이미 있으면 덮지 않는다', api._ctNow({ text: 'a', ct: 5 }).ct, 5);
}
console.log('\n시나리오 2 — 같은 할일(옮기기 · 이월 · 반복 회차)은 물려받는다');
{
  const src = { text: 'a', ct: 1700000000000, memo: 'm', subs: [{ text: 's', done: true }] };
  sc.eq('옮기기(_movedTaskCopy)', api._movedTaskCopy(src, 1).ct, 1700000000000);
  sc.eq('이월 · 반복이 쓰는 _carryTaskExtras', api._carryTaskExtras(src, { text: 'a' }, true).ct, 1700000000000);
  sc.eq('예전 할일(ct 없음)을 옮겨도 ct 가 생기지 않는다', 'ct' in api._movedTaskCopy({ text: 'old' }, 1), false);
}
console.log('\n시나리오 3 — 복제는 새 할일이라 새 시각');
{
  const t0 = Date.now(), cp = api._freshTaskCopy({ text: 'a', ct: 1700000000000, flag: true });
  sc.eq('새 시각', cp.ct >= t0, true);
  sc.eq('성격 표시는 물려받음(예전 그대로)', cp.flag, true);
}
console.log('\n시나리오 4 — 만드는 자리가 모두 ct 를 찍는다 (글자로 확인)');
{
  sc.eq('입력칸(빅 · 스몰, 위 · 아래) 은 _newTask 만 쓴다', (SRC.match(/getBigs\(dayKey,secId\)\.(?:unshift|push)\(\{text:v,done:false\}\)|getSmalls\(dayKey,secId\)\.(?:unshift|push)\(\{text:v,done:false\}\)/g) || []).length, 0);
  sc.eq('주간 · 월간 칸 바로 입력', /bigs\.push\(_ctNow\(\{text,done:false\}\)\)/.test(SRC), true);
  sc.eq('기도노트 · 시리로 들어온 할일', /getBigs\(p\.date,p\.sec\)\.push\(_ctNow\(/.test(SRC), true);
}
sc.done();
