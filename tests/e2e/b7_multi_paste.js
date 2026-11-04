// BLOCK7 여러 줄 붙여넣기 → 할일 여럿 한꺼번에 (v. 26-1104-3, HB).
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)만 띄운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_multi_paste.js
// 지키는 것:
//  ① 줄 나누기 — 빈 줄 버림 · 줄 앞 목록 표시('-' '•' '1.' '☐') 뗌 · '3.5kg' 같은 숫자는 안 뗌
//  ② 빅 새 칸에 세 줄 → 묻는 창 → '나눠 넣기' = 빅 3개(차례 그대로) · 같은 글이 두 번 안 들어감
//  ③ 토스트 '되돌리기' 한 번 = 세 개 다 빠짐
//  ④ '한 줄로 넣기' = 이어 붙인 한 개 · 바깥 눌러 닫기 = 아무것도 안 넣음
//  ⑤ 쓰던 글이 있으면 그 뒤에 이어 붙인 모양 그대로 나눈다
//  ⑥ 스몰 새 칸도 같다 · 한 줄 붙여넣기는 묻지 않는다
//  ⑦ 연락처 — 줄마다 이름 · 전화 · 메일, 못 읽는 줄은 건넘, 되돌리기
//  ⑧ 주간 · 월간 칸 할일 — 한도(bigLimit)까지만
//  ⑨ 다른 확인 창의 단추 글은 그대로 '취소 / 확인'
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const paste = (p, sel, txt) => p.evaluate(([sel, txt]) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : document.activeElement;
    el.focus();
    const dt = new DataTransfer(); dt.setData('text/plain', txt);
    const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    return { prevented: ev.defaultPrevented, v: el.value };
  }, [sel, txt]);
  const dlg = p => p.evaluate(() => ({ on: document.getElementById('appConfirmModal').style.display === 'block', msg: document.getElementById('appConfirmMsg').textContent, yes: document.getElementById('appConfirmOk').textContent, no: document.getElementById('appConfirmNo').textContent }));
  const big = p => p.evaluate(() => getBigs(tKey(), 'am').map(x => x.text));
  const small = p => p.evaluate(() => getSmalls(tKey(), 'am').map(x => x.text));
  const seed = p => p.evaluate(() => { getBigs(tKey(), 'am').length = 0; getSmalls(tKey(), 'am').length = 0; ST.contacts = []; save(); renderToday(); });
  // 아이폰처럼: 묻는 창을 누르는 순간 칸이 포커스를 잃는다 → blur 로 쓰던 글을 적는 길이 함께 돈다
  const tap = async (p, id) => { await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await sleep(250); await p.evaluate(id => document.getElementById(id).click(), id); await sleep(250); };

  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);

  ok('① 줄 나누기', JSON.stringify(await p.evaluate(() => _mlLines('- 우유\n\n• 계란 2판, 반숙\r\n1. 빵\n☐ 사과\n3.5kg 쌀\n  [x] 끝'))) === JSON.stringify(['우유', '계란 2판, 반숙', '빵', '사과', '3.5kg 쌀', '끝']), await p.evaluate(() => _mlLines('- 우유\n\n• 계란 2판, 반숙\r\n1. 빵\n☐ 사과\n3.5kg 쌀\n  [x] 끝')));

  await seed(p); await sleep(200);
  await p.evaluate(() => openInlineInput('am', 'big')); await sleep(200);
  let r = await paste(p, '#tmp-big-ghost-am input', '하나\n- 둘\n셋\n');
  let d = await dlg(p);
  ok('② 붙이면 묻는다 · 칸은 비운다', r.prevented && r.v === '' && d.on && /3줄/.test(d.msg) && /빅블럭 3개/.test(d.msg) && d.yes === '나눠 넣기' && d.no === '한 줄로 넣기', [r, d]);
  await tap(p, 'appConfirmOk');
  ok('② 나눠 넣기 = 빅 3개 차례대로 (두 번 안 들어감)', (await big(p)).join() === '하나,둘,셋', await big(p));
  ok('② 화면에도 3줄', await p.evaluate(() => document.querySelectorAll('#bl-am .bi-inp').length) === 3);
  const toast = await p.evaluate(() => (document.getElementById('_toast') || {}).textContent || '');
  ok('③ 토스트 · 되돌리기 단추', /빅블럭 3개를 넣었어요/.test(toast) && /되돌리기/.test(toast), toast);
  await p.evaluate(() => document.getElementById('_toastAct').click()); await sleep(250);
  ok('③ 되돌리기 한 번 = 다 빠짐', (await big(p)).length === 0, await big(p));

  await p.evaluate(() => openInlineInput('am', 'big')); await sleep(200);
  await paste(p, '#tmp-big-ghost-am input', '가\n나');
  await tap(p, 'appConfirmNo');
  ok('④ 한 줄로 넣기 = 한 개', (await big(p)).join() === '가 나', await big(p));
  await p.evaluate(() => openInlineInput('am', 'big')); await sleep(200);
  await paste(p, '#tmp-big-ghost-am input', '다\n라');
  await tap(p, 'appConfirmOverlay');
  ok('④ 바깥 눌러 닫기 = 안 넣음', (await big(p)).join() === '가 나' && !(await dlg(p)).on, await big(p));

  await seed(p); await sleep(200);
  await p.evaluate(() => openInlineInput('am', 'big')); await sleep(200);
  await p.evaluate(() => { const i = document.querySelector('#tmp-big-ghost-am input'); i.value = '장보기: '; i.setSelectionRange(5, 5); });
  await paste(p, '#tmp-big-ghost-am input', '우유\n계란');
  await tap(p, 'appConfirmOk');
  ok('⑤ 쓰던 글 뒤에 이어 붙인 모양으로', (await big(p)).join() === '장보기: 우유,계란', await big(p));

  await p.evaluate(() => openInlineInput('am', 'small')); await sleep(200);
  await paste(p, '#tmp-sm-ghost-am input', 'a\nb\nc\nd');
  await tap(p, 'appConfirmOk');
  ok('⑥ 스몰 4개', (await small(p)).join() === 'a,b,c,d', await small(p));
  await p.evaluate(() => openInlineInput('am', 'small')); await sleep(200);
  r = await paste(p, '#tmp-sm-ghost-am input', '하나뿐\n');
  ok('⑥ 한 줄 붙여넣기는 묻지 않는다', !r.prevented && !(await dlg(p)).on, r);
  await p.evaluate(() => document.activeElement.blur()); await sleep(300);

  // ⑦ 연락처
  await p.evaluate(() => openContactsModal()); await sleep(200);
  await paste(p, '#cNick', '홍길동 010-1234-5678\n김 철수, chulsoo@ex.com\n이름만\n홍길동 010-9999-0000');
  d = await dlg(p);
  ok('⑦ 연락처도 묻는다', d.on && /연락처 4개/.test(d.msg), d);
  await tap(p, 'appConfirmOk');
  let cs = await p.evaluate(() => ST.contacts.map(c => [c.nick, c.name, c.phone, c.email].join('|')));
  ok('⑦ 둘만 들어감 (전화 없음 · 닉네임 겹침 건넘)', cs.join('/') === '홍길동|홍길동|010-1234-5678|/김철수|김 철수||chulsoo@ex.com', cs);
  const t2 = await p.evaluate(() => document.getElementById('_toast').textContent);
  ok('⑦ 건넌 까닭을 알린다', /2개를 넣었어요/.test(t2) && /못 찾아/.test(t2) && /겹쳐/.test(t2), t2);
  await p.evaluate(() => document.getElementById('_toastAct').click()); await sleep(200);
  ok('⑦ 되돌리기 = 넣은 둘만 빠짐', await p.evaluate(() => ST.contacts.length) === 0);
  await paste(p, '#cName', '박\n영희');
  await tap(p, 'appConfirmNo');
  ok('⑦ 연락처 한 줄로 = 칸에 되돌려 놓음', await p.evaluate(() => document.getElementById('cName').value) === '박 영희' && await p.evaluate(() => ST.contacts.length) === 0);
  await p.evaluate(() => closeContactsModal()); await sleep(200);

  // ⑧ 주간 · 월간 칸
  await seed(p);
  const k2 = await p.evaluate(() => { const k = tKey(); ST.settings.bigLimit = 3; openCellInput(k, 'am', false); return k; }); await sleep(200);
  await paste(p, '#cellTodoInput', '1\n2\n3\n4\n5');
  d = await dlg(p);
  ok('⑧ 칸 팝업 위에 묻는 창', d.on && await p.evaluate(() => +getComputedStyle(document.getElementById('appConfirmModal')).zIndex > 4520), d);
  await tap(p, 'appConfirmOk');
  ok('⑧ 한도 3개까지만', (await big(p)).join() === '1,2,3', await big(p));
  ok('⑧ 못 넣은 수를 알린다', /2개는 자리가 없어/.test(await p.evaluate(() => document.getElementById('_toast').textContent)));
  await p.evaluate(() => { ST.settings.bigLimit = 6; });

  // ⑨ 다른 확인 창은 그대로
  await p.evaluate(() => appConfirm('지울까요?', () => {})); await sleep(100);
  d = await dlg(p);
  ok('⑨ 평소 확인 창 단추 = 취소 / 확인', d.yes === '확인' && d.no === '취소', d);
  await p.evaluate(() => _appConfirmResolve(false));

  // 100줄 넘게
  await seed(p);
  await p.evaluate(() => openInlineInput('am', 'big')); await sleep(200);
  await paste(p, '#tmp-big-ghost-am input', Array.from({ length: 130 }, (_, i) => 'x' + i).join('\n'));
  d = await dlg(p);
  ok('100줄 상한 안내', /130줄/.test(d.msg) && /100개/.test(d.msg) && /앞의 100줄만/.test(d.msg), d);
  await tap(p, 'appConfirmOk');
  ok('100개만 들어감', (await big(p)).length === 100);

  await b.close();
  console.log(`\n${pass} 통과 · ${fail} 실패`);
  process.exit(fail ? 1 : 0);
})();
