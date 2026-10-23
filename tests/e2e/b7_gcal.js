// 구글 캘린더 양방향 — 본체(_gcal…)를 가짜 구글로 끝까지 돌려 본다 (v. 26-1023-1).
// ⚠️ check.sh 가 돌리지 않는다. 개발본(index-dev.html)을 띄우고 로그인·서버 부분만 갈아끼운다 — 저장소 뿌리에서:
//   python3 -m http.server 5502 &   NODE_PATH=<playwright 있는 곳> node tests/e2e/b7_gcal.js
// 지키는 것:
//  ① 구글에만 있는 일정 → 시각에 맞는 구간으로 들어온다
//  ② BLOCK7 에서 새로 만든 일정 → 쓸 캘린더에 들어가고 고리가 붙는다
//  ③ 아무것도 안 바뀌었으면 구글에 아무것도 쓰지 않는다
//  ④ BLOCK7 에서 제목을 고치면 구글이 고쳐진다 · ⑤ 구글에서 시각을 고치면 BLOCK7 이 옮겨진다
//  ⑥ BLOCK7 에서 지우면(메뉴 '삭제' 길) 구글에서도 지워지고 표시는 걷힌다
//  ⑦ 구글에서 지우면 BLOCK7 에서도 지워진다
//  ⑧ 맞추기는 되돌리기(undo) 목록에 들어가지 않는다
const { chromium } = require(process.env.PW || 'playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
(async () => {
  const b = await chromium.launch();
  let pass = 0, fail = 0; const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(APP); await sleep(1500);
  await p.evaluate(() => {
    // 가짜 구글 — 캘린더 하나, 일정은 id 로
    const G = window.__G = { ev: {}, n: 0, writes: 0 };
    const tm = (k, h) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, h).toISOString(); };
    window.__tm = tm;
    const T = tKey(), D1 = (() => { const [y, m, d] = T.split('-').map(Number); const x = new Date(y, m - 1, d + 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; })();
    window.__D1 = D1;
    G.ev.gx1 = { id: 'gx1', status: 'confirmed', updated: 'u' + (++G.n), summary: '치과', start: { dateTime: tm(D1, 10) }, end: { dateTime: tm(D1, 11) } };
    const J = (o, s) => new Response(s === 204 ? null : JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch;
    window.fetch = async (url, opt) => {
      url = String(url); opt = opt || {};
      if (!url.startsWith('https://www.googleapis.com/calendar/v3')) return real(url, opt);
      const u = new URL(url), path = decodeURIComponent(u.pathname.replace('/calendar/v3', '')), m = opt.method || 'GET';
      if (path === '/users/me/calendarList') return J({ items: [{ id: 'me@x', summary: '내 캘린더', accessRole: 'owner', primary: true, backgroundColor: '#4285f4' }] });
      const mm = path.match(/^\/calendars\/([^/]+)\/events(?:\/(.+))?$/);
      if (!mm) return J({}, 404);
      const id = mm[2], body = opt.body ? JSON.parse(opt.body) : null;
      if (m === 'GET' && !id) return J({ items: Object.values(G.ev) });
      if (m === 'GET') return G.ev[id] ? J(G.ev[id]) : J({}, 404);
      G.writes++;
      if (m === 'POST') { if (G.ev[body.id]) return J({}, 409); G.ev[body.id] = Object.assign({ status: 'confirmed', updated: 'u' + (++G.n) }, body); return J(G.ev[body.id]); }
      if (m === 'PATCH') { const e = G.ev[id]; if (!e) return J({}, 404); Object.assign(e, body, { updated: 'u' + (++G.n) }); return J(e); }
      if (m === 'DELETE') { const e = G.ev[id]; if (!e) return J({}, 410); e.status = 'cancelled'; e.updated = 'u' + (++G.n); return J(null, 204); }
      return J({}, 400);
    };
    // 로그인·서버 대신
    _gcalUsable = () => true;
    _gcalFn = async (path) => (path === '/token' ? { access_token: 't', expires_in: 3600, email: 'hb@example.com' } : {});
    ST.settings.gcal = { on: true, cals: ['me@x'], writeCal: 'me@x' };
  });
  const all = () => p.evaluate(() => { const o = []; Object.keys(ST.days).forEach(k => Object.keys(ST.days[k].events || {}).forEach(s => (ST.days[k].events[s] || []).forEach(e => o.push({ k, s, id: e.id, text: e.text, time: e.time, g: e.g })))); return o; });
  const sync = () => p.evaluate(async () => { _gcalBusy = false; await gcalSync(); });

  // ①
  const und0 = await p.evaluate(() => UNDO_STACK.length);
  await sync();
  let L = await all(), D1 = await p.evaluate(() => window.__D1);
  const imp = L.find(e => e.g && e.g.i === 'gx1');
  ok('① 구글 일정이 내일 오전 10시로 들어온다', imp && imp.k === D1 && imp.time === '10:00' && imp.s === (await p.evaluate(() => _secIdForTime('10:00'))), L);
  ok('⑧ 맞추기는 되돌리기 목록에 안 들어간다', (await p.evaluate(() => UNDO_STACK.length)) === und0);

  // ②
  await p.evaluate(D1 => { const arr = getEvents(D1, _secIdForTime('15:00')); arr.push({ id: 'ev' + 12345, time: '15:00', text: '은행' }); save(); }, D1);
  await sync();
  L = await all();
  const mine = L.find(e => e.id === 'ev12345');
  const gm = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '은행'));
  ok('② BLOCK7 일정이 구글에 들어간다 (오후 3시~4시)', gm && (await p.evaluate(g => [new Date(g.start.dateTime).getHours(), new Date(g.end.dateTime).getHours()].join(), gm)) === '15,16', gm);
  ok('② 고리가 붙는다', mine && mine.g && mine.g.i === gm.id && mine.g.c === 'me@x', mine);

  // ③
  const w0 = await p.evaluate(() => __G.writes);
  await sync();
  ok('③ 바뀐 것 없으면 구글에 안 쓴다', (await p.evaluate(() => __G.writes)) === w0 && (await all()).length === L.length);

  // ④
  await p.evaluate(() => { const f = _gcalFind(null, 'ev12345'); f.arr[f.i].text = '은행 — 서류'; save(); });
  await sync();
  ok('④ BLOCK7 에서 고친 제목이 구글로', (await p.evaluate(() => __G.ev[_gcalFind(null, 'ev12345').arr[_gcalFind(null, 'ev12345').i].g.i].summary)) === '은행 — 서류');

  // ⑤
  await p.evaluate(D1 => { const e = __G.ev.gx1; e.start = { dateTime: __tm(D1, 19) }; e.end = { dateTime: __tm(D1, 20) }; e.updated = 'u' + (++__G.n); }, D1);
  await sync();
  L = await all();
  const mv = L.filter(e => e.g && e.g.i === 'gx1');
  ok('⑤ 구글에서 옮긴 시각으로 BLOCK7 이 옮겨진다 (구간도)', mv.length === 1 && mv[0].time === '19:00' && mv[0].s === (await p.evaluate(() => _secIdForTime('19:00'))), mv);

  // ⑥ 메뉴 '삭제' 길 그대로
  await p.evaluate(() => {
    const all = []; Object.keys(ST.days).forEach(k => Object.keys(ST.days[k].events || {}).forEach(s => (ST.days[k].events[s] || []).forEach((e, i) => { if (e.g && e.g.i === 'gx1') all.push({ k, s, i }); })));
    const x = all[0];
    // deleteEventFromMenu 는 오늘 화면 기준이라, 같은 일을 그 날짜로 한다
    beforeSave(); _gcalTomb(x.k, getEvents(x.k, x.s)[x.i]); getEvents(x.k, x.s).splice(x.i, 1); save();
  });
  await sync();
  ok('⑥ BLOCK7 에서 지우면 구글에서도 지워진다', (await p.evaluate(() => __G.ev.gx1.status)) === 'cancelled');
  ok('⑥ 지움 표시는 걷힌다 · 다시 안 들어온다', (await p.evaluate(() => Object.values(ST.days).every(d => !d.gdel))) && !(await all()).some(e => e.g && e.g.i === 'gx1'));

  // ⑦
  await p.evaluate(() => { const e = Object.values(__G.ev).find(e => e.summary === '은행 — 서류'); e.status = 'cancelled'; e.updated = 'u' + (++__G.n); });
  await sync();
  ok('⑦ 구글에서 지우면 BLOCK7 에서도 지워진다', !(await all()).some(e => e.id === 'ev12345'));

  // 설정창 줄
  const ui = await p.evaluate(() => { _gcalCals = [{ id: 'me@x', name: '내 캘린더', role: 'owner', primary: true }, { id: 'hol', name: '대한민국의 휴일', role: 'reader' }]; _gcalRenderSettings(); return [document.querySelectorAll('#gcalCalList .settings-row').length, document.getElementById('gcalWriteSel').options.length, document.getElementById('gcalConnectBtn').textContent]; });
  ok('설정창: 캘린더 두 줄 · 쓸 캘린더는 쓸 수 있는 것만(+보내지 않음) · 연결 끊기 단추', JSON.stringify(ui) === JSON.stringify([2, 2, '연결 끊기']), ui);

  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
