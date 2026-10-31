// 검색 첫 화면 손질 (v. 26-1031-12, HB). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_search_home.js   (SHOT=폴더 를 주면 화면을 찍는다)
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })).newPage();
  p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
  await p.goto(APP); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    const k = tKey();
    getBigs(k, 'am').push({ text: '연락 하나', flag: true }, { text: '연락 밀림', autoCarryCount: 4 }, { text: '연락 둘', autoCarryCount: 2 });
    getBigs(k, 'pm').push({ text: '연락 셋', autoCarryCount: 3 }, { text: '연락 넷', autoCarryCount: 3 });
    save(); renderToday(); localStorage.removeItem(_lsk('srchRecent')); _srch.autoLast = ''; openSearch();
  });
  await p.waitForTimeout(300);
  let s = await p.evaluate(() => ({ rows: [...document.querySelectorAll('.srch-qk > i')].map(x => x.className.replace('qk-', '')), lbl: [...document.querySelectorAll('.srch-qk .qk-l')].map(x => x.textContent),
    flag: getComputedStyle(document.querySelector('.qk-flag')).color, red: (() => { const e = document.createElement('i'); e.style.color = 'var(--ov)'; document.body.appendChild(e); const c = getComputedStyle(e).color; e.remove(); return c; })(), flagSvg: !!document.querySelector('.qk-flag svg path[d^="M5 4 14.5"]'),
    dots: document.querySelectorAll('.qk-carry .qk-dots b').length, dotBg: getComputedStyle(document.querySelector('.qk-dots b')).backgroundColor,
    ev: getComputedStyle(document.querySelector('.qk-weekEv')).color, cnt: [...document.querySelectorAll('.srch-qk em')].map(x => x.textContent) }));
  ok('긴급 줄이 없다', JSON.stringify(s.rows) === JSON.stringify(['flag', 'contact', 'carry', 'weekEv']), s.rows);
  ok('중요 = 할일행 깃발 모양 · 빨강', s.flagSvg && s.flag === s.red, s);
  ok('밀린 = 빨간 점 둘', s.dots === 2 && /232, 80, 63|224, 67, 47/.test(s.dotBg), s);
  ok('이번 주 일정 = 구글 파랑', s.ev === 'rgb(66, 133, 244)', s.ev);
  ok('밀린 할일 줄 이름 (3번 이상) · 개수 3(기준 3: 4,3,3)', s.lbl[2] === '밀린 할일 (3번 이상)' && s.cnt[2] === '3', s);
  if (SHOT) await p.screenshot({ path: SHOT + '/srch-home.png' });
  // 설정으로 기준 바꾸기
  await p.evaluate(() => { updateSetting('srchCarryMin', 4); _srchRender(); });
  s = await p.evaluate(() => ({ lbl: document.querySelectorAll('.srch-qk .qk-l')[2].textContent, cnt: document.querySelectorAll('.srch-qk em')[2].textContent }));
  ok('기준 4로 → 줄 이름 · 개수가 따라간다', s.lbl === '밀린 할일 (4번 이상)' && s.cnt === '1', s);
  await p.evaluate(() => { closeSearch(); openSettings && openSettings(); });
  await p.waitForTimeout(300);
  ok('설정창 칸에 값이 보인다', await p.evaluate(() => { const e = document.getElementById('setSrchCarryMin'); return !!e && e.value === '4'; }));
  await p.evaluate(() => { const e = document.getElementById('setSrchCarryMin'); e.value = '2'; e.dispatchEvent(new Event('change')); });
  ok('설정창에서 바꾸면 저장', await p.evaluate(() => ST.settings.srchCarryMin === 2));
  await p.evaluate(() => { try { closeSettings(); } catch (e) {} });

  // 7: 엔터 없이 최근 검색
  const rec = () => p.evaluate(() => _srchRecent());
  await p.evaluate(() => { localStorage.removeItem(_lsk('srchRecent')); _srch.autoLast = ''; _srch.q = ''; openSearch(); });
  await p.keyboard.type('연'); await p.waitForTimeout(300);
  ok('치는 중에는 아직 안 남는다', (await rec()).length === 0);
  await p.keyboard.type('락'); await p.waitForTimeout(2400);
  ok('2초 쉬면 남는다', JSON.stringify(await rec()) === JSON.stringify(['연락']), await rec());
  await p.keyboard.type(' 셋'); await p.waitForTimeout(2400);
  ok('이어 친 말은 앞 줄을 바꿔 쓴다', JSON.stringify(await rec()) === JSON.stringify(['연락 셋']), await rec());
  await p.evaluate(() => { document.getElementById('srchInput').value = ''; _srchClear(); });
  await p.keyboard.type('zzzz없는말'); await p.waitForTimeout(2400);
  ok('결과가 없는 말은 안 남는다', JSON.stringify(await rec()) === JSON.stringify(['연락 셋']), await rec());
  await p.evaluate(() => { _srchClear(); });
  await p.keyboard.type('밀림'); await p.waitForTimeout(500);
  await p.evaluate(() => { const b = document.getElementById('srchBody'); b.style.maxHeight = '40px'; b.scrollTop = 30; b.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(200);
  ok('결과를 스크롤하면 바로 남는다', (await rec())[0] === '밀림', await rec());
  await p.evaluate(() => { document.getElementById('srchBody').style.maxHeight = ''; _srchClear(); });
  await p.keyboard.type('연락 하나'); await p.keyboard.press('Enter'); await p.keyboard.type('X'); await p.waitForTimeout(2400);
  ok('엔터로 남긴 말은 그대로 둔다(자동으로 덮지 않는다)', (await rec()).includes('연락 하나'), await rec());
  // 6 (v. 26-1031-14) — 접힌 줄에 항목마다 앞 몇 글자 · 누르면 펼친 요약 · 요약에서 완료 · 모두 보기
  await p.evaluate(() => { _srch.qOpen = {}; _srchClear(); });
  s = await p.evaluate(() => { const r = document.querySelectorAll('.srch-qk')[2], pk = r.querySelector('.qk-peek'), bs = [...pk.querySelectorAll('b')];
    const pr = pk.getBoundingClientRect(); return { n: bs.length, shown: bs.filter(b => { const q = b.getBoundingClientRect(); return q.top < pr.bottom - 1 && q.width > 0; }).length, w: Math.round(bs[0].getBoundingClientRect().width), mask: getComputedStyle(bs[0]).webkitMaskImage || getComputedStyle(bs[0]).maskImage, h: Math.round(pr.height) }; });
  ok('접힌 줄: 항목마다 짧게(≤4.4em) · 뒤로 옅어짐 · 한 줄 높이', s.n >= 2 && s.shown >= 2 && s.w <= 60 && /gradient/.test(s.mask) && s.h <= 18, s);
  ok('항목이 없는 줄은 펼칠 수 없다', await p.evaluate(() => document.querySelectorAll('.srch-qk')[3].disabled === true));
  await p.evaluate(() => document.querySelectorAll('.srch-qk')[2].click()); await p.waitForTimeout(450);
  s = await p.evaluate(() => ({ open: document.querySelectorAll('.srch-qk')[2].classList.contains('open'), mini: [...document.querySelectorAll('[data-qbody="carry"] .srch-mini .m-x')].map(x => x.textContent), all: (document.querySelector('[data-qbody="carry"] .qk-all') || {}).textContent, srch: _srchIsOpen(), q: _srch.quick }));
  ok('누르면 펼친 요약 (결과 화면으로 안 넘어감)', s.open && s.mini.length >= 2 && !s.q && s.srch && /결과로 모두 보기/.test(s.all), s);
  if (SHOT) await p.screenshot({ path: SHOT + '/srch-quick-open.png' });
  const t0 = await p.evaluate(() => document.querySelector('[data-qbody="carry"] .srch-mini .m-x').textContent);
  await p.evaluate(() => document.querySelector('[data-qbody="carry"] .srch-mini .srch-chk').click()); await p.waitForTimeout(300);
  s = await p.evaluate(t0 => { const all = Object.values(ST.days).flatMap(d => Object.values(d.big || {}).flat()); const it = all.find(x => x && x.text === t0); return { done: !!(it && it.done), open: !!document.querySelector('[data-qbody="carry"]') }; }, t0);
  ok('요약의 동그라미 → 완료 · 펼친 채로', s.done && s.open, s);
  await p.evaluate(() => document.querySelector('[data-qbody="carry"] .qk-all').click()); await p.waitForTimeout(250);
  ok('모두 보기 → 결과 화면', await p.evaluate(() => _srch.quick === 'carry' && document.querySelectorAll('#srchBody .srch-t').length >= 1));
  await p.evaluate(() => _srchClear()); await p.waitForTimeout(100);
  await p.evaluate(() => document.querySelectorAll('.srch-qk')[2].click()); await p.waitForTimeout(450);
  ok('다시 누르면 접힘', await p.evaluate(() => !document.querySelector('[data-qbody="carry"]') && !document.querySelectorAll('.srch-qk')[2].classList.contains('open')));
  // 5-1 ㄴ (v. 26-1031-13) — 이렇게도 찾아져요 · 기간 · 성경 장절 · @이름
  await p.evaluate(() => { _srchClear(); });
  s = await p.evaluate(() => [...document.querySelectorAll('.srch-how b')].map(x => x.textContent));
  ok('첫 화면에 "이렇게도 찾아져요" 네 줄', s.length === 4 && s[0] === '롬12', s);
  if (SHOT) await p.screenshot({ path: SHOT + '/srch-how.png' });
  const q = async t => { await p.evaluate(t => { const i = document.getElementById('srchInput'); i.value = t; _srchInput(t); }, t); await p.waitForTimeout(300); };
  await p.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 7 - d.getDay() + 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); getBigs(k, 'am').push({ text: '다음주 할일 연락' }); window.__kn = k; save(); });
  await q('다음 주 연락');
  s = await p.evaluate(() => ({ chip: (document.querySelector('.srch-period') || {}).textContent || '', tasks: [...document.querySelectorAll('#srchBody .srch-t .srch-tx')].map(x => x.textContent), hit: !!document.querySelector('#srchBody .srch-hit') }));
  ok('기간 칩 · 그 주의 할일만 · 나머지 글자로 감싸기', /기간다음 주/.test(s.chip) && s.tasks.length === 1 && s.tasks[0] === '다음주 할일 연락' && s.hit, s);
  await q('롬12');
  s = await p.evaluate(() => ({ row: (document.querySelector('.srch-bible') || {}).textContent || '' }));
  ok('롬12 → "로마서 12장 · 성경 본문으로" 줄', /로마서 12장/.test(s.row) && /성경 본문으로/.test(s.row), s);
  await p.evaluate(() => document.querySelector('.srch-bible').click()); await p.waitForTimeout(600);
  s = await p.evaluate(() => ({ br: typeof _brIsOpen === 'function' && _brIsOpen(), cur: typeof _brCur !== 'undefined' ? [_brCur.b, _brCur.c] : null, srch: _srchIsOpen() }));
  ok('누르면 성경 로마서 12장 · 검색은 아래 남는다', s.br && s.cur && s.cur[1] === 12 && s.srch, s);
  await p.evaluate(() => { try { bibleClose(); } catch (e) {} });
  await p.evaluate(() => { ST.contacts = (ST.contacts || []).concat([{ nick: 'gdong', name: '홍길동', phone: '01012345678' }]); getBigs(tKey(), 'pm').push({ text: '@gdong 서류 전달' }); save(); });
  await q('@길동');
  s = await p.evaluate(() => [...document.querySelectorAll('#srchBody .srch-t .srch-tx')].map(x => x.textContent));
  ok('@이름 → 그 사람의 @별명이 적힌 할일', s.includes('@gdong 서류 전달'), s);
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
