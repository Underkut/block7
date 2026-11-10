// 기도노트 → BLOCK7 할일 받기 (v26-1015-2, docs/ROADMAP.md 'P-8 나머지' R-3)
// 지키는 것:
//  ① 쪽지 → 넣을 자리: 날짜 모양 · 빈 글은 버린다 · 공백은 한 칸으로 · 200자까지
//  ② 없는 시간구간(지워진 구간)이면 첫 구간으로 — 잃지 않는다 · 구간이 하나도 없으면 넣지 않는다
//  ③ 한 번에 50개까지 (외부에서 받은 것에는 규모 상한)
//  ④ ⭐ 쓰는 자리는 쪽지함(pray/{uid}/c/b7inbox) 하나 · users/ 문서 · 기도노트 덩어리를 쓰지 않는다
//  ⑤ ⭐ 첫 클라우드 읽기 전에는 받지 않는다 — 준비 확인 함수를 거친다 · 로그인 덩어리 안 이름(_fbInitLoaded · fbDB · _fbApplyRenders)을 직접 부르지 않는다
//  ⑦ (1110-Q) 쪽지의 하위 항목(subs) → 할일의 하위 — 글만 · 30개 · 200자
//  ⑥ BLOCK7 에서만 · 개발본은 받지 않는다 · 넣는 길은 사람이 할일을 넣는 길(beforeSave → getBigs().push → save)
const fs = require('fs'), path = require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const SRC = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const B0 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 ('), B1 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 끝', B0);
if (B0 < 0 || B1 < 0) { console.error('받기 덩어리를 못 찾았습니다'); process.exit(2); }
const BLOCK = SRC.slice(B0, B1), CODE = BLOCK.replace(/\/\/.*$/gm, '');
const a = BLOCK.indexOf('const _PRAY_TODO_MAX'), b = BLOCK.indexOf('let _prayTodoUnsub');
const place = new Function(BLOCK.slice(a, b) + '; return _prayTodoPlace;')();

const secs = ['dawn', 'am', 'pm', 'night'];
sc.eq('① 바른 쪽지 그대로', place([{ id: 'x', date: '2026-10-16', sec: 'pm', text: '  가족  심방 ', at: 1 }], secs), [{ date: '2026-10-16', sec: 'pm', text: '가족 심방' }]);
sc.eq('① 날짜 모양이 틀리거나 글이 비면 버린다', place([{ date: '10-16', sec: 'pm', text: 'a' }, { date: '2026-10-16', sec: 'pm', text: '   ' }, null, 'x'], secs), []);
sc.eq('① 200자까지', place([{ date: '2026-10-16', sec: 'am', text: 'ㄱ'.repeat(300) }], secs)[0].text.length, 200);
sc.eq('⭐② 지워진 구간이면 첫 구간으로', place([{ date: '2026-10-16', sec: 'gone', text: 'a' }], secs)[0].sec, 'dawn');
sc.eq('② 심방 노트 쪽지(sec 비움 · from care) → 그날 첫 구간 · 어디서 왔는지 남김', place([{ id: 'B1', from: 'care', date: '2026-11-09', sec: '', text: '중보 · 가나다', at: 1 }], secs), [{ date: '2026-11-09', sec: 'dawn', text: '중보 · 가나다', from: 'care' }]);
sc.eq('② 구간이 하나도 없으면 넣지 않는다', place([{ date: '2026-10-16', sec: 'am', text: 'a' }], []), []);
sc.eq('② 이상한 자료에도 죽지 않는다', [place(null, secs).length, place(undefined, null).length], [0, 0]);
sc.eq('⭐③ 한 번에 50개까지', place(Array.from({ length: 80 }, (_, i) => ({ date: '2026-10-16', sec: 'am', text: 't' + i })), secs).length, 50);

const pull = CODE.slice(CODE.indexOf('async function _prayTodoPull'), CODE.indexOf('function _prayTodoWatch'));
const writes = (CODE.match(/\.set\(|\.update\(|\.delete\(|\.add\(/g) || []);
sc.eq('⭐④ Firestore 쓰기는 트랜잭션 안의 쪽지 비우기 하나뿐', [writes.length, /tx\.set\(ref,\{items:\[\]\}\)/.test(pull)], [1, true]);
sc.eq('⭐④ 쪽지함 자리', /_prayDb\(\)\.doc\('pray\/'\+uid\+'\/c\/b7inbox'\)/.test(pull), true);
sc.eq('⭐④ users/ 문서는 건드리지 않는다', /users\//.test(CODE), false);
sc.eq('⭐⑤ 받기 전에 준비 확인(_prayTodoReady)', /!_prayTodoReady\(\)/.test(pull), true);
sc.eq('⭐⑤ 로그인 덩어리 안 이름을 직접 쓰지 않는다', /\b(_fbInitLoaded|fbDB|_fbApplyRenders)\b/.test(CODE), false);
sc.eq('⑤ 로그인 덩어리가 준비 함수를 넘긴다', /_prayTodoWatch\(\(\)=>_fbInitLoaded\)/.test(SRC), true);
sc.eq('⑥ BLOCK7 에서만 · 개발본 아님', [/APP_PRODUCT!=='block7'/.test(pull), /DEV_MODE/.test(pull)], [true, true]);
sc.eq('⑥ 사람이 넣는 길 그대로 (만든 시각 ct 도 함께 — v. 26-1102-14)', /beforeSave\(\);[\s\S]*getBigs\(p\.date,p\.sec\)\.push\(_ctNow\(p\.subs\?\{text:p\.text,done:false,subs:p\.subs\.map\(t=>\(\{text:t,done:false\}\)\)\}:\{text:p\.text,done:false\}\)\)\);[\s\S]*save\(\);/.test(pull), true);
// ⑦ (1110-Q) 심방 노트 '다음 심방 질문' — 쪽지의 subs 가 하위 항목으로
sc.eq('⑦ 하위 항목(subs) — 글만 · 공백 정리 · 빈 것 버림', place([{ from: 'care', date: '2026-11-10', sec: '', text: '가가 심방', subs: ['  첫  질문 ', '', 3, null, '둘째'] }], secs), [{ date: '2026-11-10', sec: 'dawn', text: '가가 심방', from: 'care', subs: ['첫 질문', '둘째'] }]);
sc.eq('⑦ 하위 항목 규모 상한 — 30개 · 한 줄 200자', [place([{ date: '2026-11-10', sec: 'am', text: 'a', subs: Array(80).fill('q') }], secs)[0].subs.length, place([{ date: '2026-11-10', sec: 'am', text: 'a', subs: ['ㄱ'.repeat(500)] }], secs)[0].subs[0].length], [30, 200]);
sc.eq('⑦ subs 가 배열이 아니거나 비면 칸 자체가 없다(예전 쪽지와 같은 꼴)', ['subs' in place([{ date: '2026-11-10', sec: 'am', text: 'a', subs: 'x' }], secs)[0], 'subs' in place([{ date: '2026-11-10', sec: 'am', text: 'a', subs: [] }], secs)[0]], [false, false]);
// 개발본 · Sweeter 개발본에도 같은 덩어리가 있다(만드는 도구가 그대로 옮긴다)
['index-dev.html', 'sweeter-dev.html'].forEach(f => {
  const t = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  sc.eq(f + ' 에도 받기 덩어리', t.indexOf('function _prayTodoPlace(items,secIds,parse)') >= 0, true);
});
sc.done();
