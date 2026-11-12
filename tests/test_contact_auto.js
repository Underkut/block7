// 글의 '@' ↔ '연락할 일' 표시 (HB 2026-11-12: "@ 가 있고 연락할 일이던 할일은 @ 가 없어지면 연락할 일도 자동 해제")
//
// 예전엔 한쪽만 있었다 — 글에 '@' 가 새로 들어가면 켜기만 하고(_autoContactMark), 지워도 그대로 남았다.
// 이제 같은 규칙(_contactAtNext) 하나가 켜기 · 끄기를 모두 정한다:
//   · '@' 가 새로 들어가면 켠다 (예전 그대로)
//   · '@' 가 있던 글에서 '@' 가 하나도 안 남으면 끈다
//   · '@' 없이 사람이 메뉴로 켠 할일 · '@' 가 있어도 사람이 일부러 끈 할일은 건드리지 않는다
// 반복 할일을 다른 날로 퍼뜨리는 쪽(이 할일만 · 이후 · 모두)은 tests/test_repeat_props.js 시나리오 16~21,
// 실제 화면(손 떼기 · Enter · Tab · 휴대폰 '이동' · Esc · 긴 글 칸)은 tests/e2e/b7_contact_auto.js.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const CODE = slice('function _contactAtNext(', 'function toggleTaskContact(){');
function makeEnv() {
  const log = { saves: 0, toasts: [] };
  const env = { rawSave() { log.saves++; }, showToast: t => log.toasts.push(t) };
  const names = Object.keys(env);
  const api = new Function(...names, CODE + '\nreturn {_contactAtNext,_autoContactSync,_CONTACT_OFF_MSG};')(...names.map(n => env[n]));
  return { api, log };
}
// 화면이 하는 일 그대로: 글은 이미 새 글로 바뀌어 있고, 고치기 전 글을 함께 넘긴다
function edit(item, newText, quiet) {
  const { api, log } = makeEnv();
  const orig = item.text;
  item.text = newText;
  const r = api._autoContactSync(item, orig, quiet);
  return { r, log, item, api };
}

console.log('① \'@\' 가 있던 연락할 일에서 \'@\' 를 지우면 → 해제 · 저장 · 토스트로 알린다');
{
  const { r, log, item, api } = edit({ text: '@철수 전화', contactTask: true }, '철수 전화');
  sc.eq('표시가 꺼진다', item.contactTask, false);
  sc.eq('끈 쪽을 돌려준다(화면이 다시 그린다)', r, 'off');
  sc.eq('저장한다', log.saves, 1);
  sc.eq('토스트 한 번', log.toasts, [api._CONTACT_OFF_MSG]);
  sc.eq('토스트는 뜻 단위로 두 줄', api._CONTACT_OFF_MSG.split('\n').length, 2);
}

console.log('② \'@\' 가 하나라도 남으면 그대로');
{
  const { r, log, item } = edit({ text: '@영희 @민수 연락', contactTask: true }, '@민수 연락');
  sc.eq('표시 유지', [item.contactTask, r, log.saves, log.toasts.length], [true, '', 0, 0]);
}
{
  const { r, item } = edit({ text: '@철수 전화', contactTask: true }, '@철수 문자');
  sc.eq('\'@\' 뒤 이름만 바꿔도 그대로', [item.contactTask, r], [true, '']);
}

console.log('③ \'@\' 없이 메뉴로 켠 할일은 글을 어떻게 고쳐도 그대로');
{
  const { r, log, item } = edit({ text: '철수 전화', contactTask: true }, '철수에게 전화');
  sc.eq('표시 유지 · 아무것도 안 함', [item.contactTask, r, log.saves, log.toasts.length], [true, '', 0, 0]);
}

console.log('④ \'@\' 가 있어도 사람이 일부러 끈 할일 — \'@\' 를 지워도 · 하나 더 넣어도 되살리지 않는다');
{
  const { r, log, item } = edit({ text: '@철수 전화', contactTask: false }, '철수 전화');
  sc.eq('\'@\' 를 지움 → 꺼진 채 · 토스트 없음', [item.contactTask, r, log.toasts.length], [false, '', 0]);
}
{
  const { r, item } = edit({ text: '@철수 전화' }, '@철수 @영희 전화');
  sc.eq('\'@\' 를 더함 → 그대로 (예전 규칙)', ['contactTask' in item, r], [false, '']);
}

console.log('⑤ 새로 \'@\' 를 넣으면 켠다 (예전 그대로) — 켤 때는 토스트 없음');
{
  const { r, log, item } = edit({ text: '철수 전화' }, '@철수 전화');
  sc.eq('켜진다 · 저장 · 조용히', [item.contactTask, r, log.saves, log.toasts.length], [true, 'on', 1, 0]);
}

console.log('⑥ 반복 할일(곧 \'어디까지 바꿀까\' 를 묻는다) — 끄되 토스트는 묻는 창을 가리지 않게 미룬다');
{
  const { r, log, item } = edit({ text: '@철수 운동', contactTask: true, rid: 'r1' }, '운동', true);
  sc.eq('꺼진다 · 토스트 없음', [item.contactTask, r, log.toasts.length], [false, 'off', 0]);
}

console.log('⑦ 글이 그대로거나 할일이 없으면 아무것도 안 함');
{
  const { r, log, item } = edit({ text: '@철수 전화', contactTask: true }, '@철수 전화');
  sc.eq('글 그대로', [item.contactTask, r, log.saves], [true, '', 0]);
  const { api } = makeEnv();
  sc.eq('할일 없음', api._autoContactSync(undefined, 'x'), '');
}

console.log('⑧ 규칙 표 (_contactAtNext: 지금 표시 · 고치기 전 글 · 고친 글 → 켬 true / 끔 false / 그대로 null)');
{
  const { api } = makeEnv();
  const R = (on, a, b) => api._contactAtNext(on, a, b);
  sc.eq('켜짐 · @있음 → @없음 = 끔', R(true, '@a', 'a'), false);
  sc.eq('켜짐 · @있음 → @있음 = 그대로', R(true, '@a', '@b'), null);
  sc.eq('켜짐 · @없음 → @없음 = 그대로(메뉴로 켠 것)', R(true, 'a', 'b'), null);
  sc.eq('켜짐 · @없음 → @있음 = 그대로', R(true, 'a', '@a'), null);
  sc.eq('꺼짐 · @없음 → @있음 = 켬', R(false, 'a', '@a'), true);
  sc.eq('꺼짐 · @있음 → @있음 = 그대로(일부러 끈 것)', R(false, '@a', '@a @b'), null);
  sc.eq('꺼짐 · @있음 → @없음 = 그대로', R(false, '@a', 'a'), null);
  sc.eq('꺼짐 · @없음 → @없음 = 그대로', R(false, 'a', 'b'), null);
  sc.eq('빈 값도 견딘다', [R(true, undefined, ''), R(false, null, '@x')], [null, true]);
}

console.log('⑨ 화면이 이 규칙을 부른다 — 빅 · 스몰 줄의 손 떼기와 Tab, 반복 할일 범위 고르기');
{
  const BIG = slice('function makeBigItem(id,i,b,secColor){', 'function makeBigGhost(id,secColor){');
  const SM = slice('function makeSmItem(id,i,sm,secColor){', 'function makeSmInlineGhost(id,secColor){');
  const n = (s, w) => s.split(w).length - 1;
  sc.eq('빅: 손 떼기 · Tab 두 곳에서 맞춘다', n(BIG, '_autoContactSync('), 2);
  sc.eq('빅: 끈/켠 결과를 반복 범위 묻기로 넘긴다', BIG.includes("_taskTextCommit('big',id,i,_origText,inp.value,ac)"), true);
  sc.eq('스몰: 손 떼기 · Tab 두 곳에서 맞춘다', n(SM, '_autoContactSync('), 2);
  sc.eq('스몰: 끈/켠 결과를 반복 범위 묻기로 넘긴다', SM.includes("_taskTextCommit('small',id,i,_origText,inp.value,ac)"), true);
  sc.eq('옛 이름(켜기만 하던 것)은 남아 있지 않다', SRC.includes('_autoContactMark('), false);
  const APPLY = slice('function _taskTextApply(', '// ═══════ 할일 — 보조 속성');
  sc.eq('반복 퍼뜨리기도 같은 규칙을 날마다 쓴다', APPLY.includes('_contactAtNext('), true);
}

sc.done();
