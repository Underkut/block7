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
    G.stamp = () => new Date(Date.now() + (++G.n)).toISOString();   // 구글처럼 '고친 시각' 은 시각 문자열
    const tm = (k, h) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, h).toISOString(); };
    window.__tm = tm;
    const T = tKey(), D1 = (() => { const [y, m, d] = T.split('-').map(Number); const x = new Date(y, m - 1, d + 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; })();
    window.__D1 = D1;
    G.ev.gx1 = { id: 'gx1', status: 'confirmed', updated: G.stamp(), summary: '치과', start: { dateTime: tm(D1, 10) }, end: { dateTime: tm(D1, 11) } };
    const J = (o, s) => new Response(s === 204 ? null : JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch;
    window.fetch = async (url, opt) => {
      url = String(url); opt = opt || {};
      if (!url.startsWith('https://www.googleapis.com/calendar/v3')) return real(url, opt);
      const u = new URL(url), path = decodeURIComponent(u.pathname.replace('/calendar/v3', '')), m = opt.method || 'GET';
      if (path === '/users/me/calendarList') return J({ items: [{ id: 'me@x', summary: '내 캘린더', accessRole: 'owner', primary: true, backgroundColor: '#4285f4' }, { id: 'ch@x', summary: '교회', accessRole: 'owner', backgroundColor: '#e67c73' }] });
      const mv = path.match(/^\/calendars\/([^/]+)\/events\/([^/]+)\/move$/);
      if (mv && m === 'POST') { G.writes++; const e = G.ev[mv[2]]; if (!e) return J({}, 404); e.cal = u.searchParams.get('destination'); e.updated = G.stamp(); return J(e); }
      if (/\/instances$/.test(path)) return J({ items: [] });
      const mm = path.match(/^\/calendars\/([^/]+)\/events(?:\/(.+))?$/);
      if (!mm) return J({}, 404);
      const id = mm[2], body = opt.body ? JSON.parse(opt.body) : null;
      if (m === 'GET' && !id) { const um = u.searchParams.get('updatedMin'); return J({ items: Object.values(G.ev).filter(e => (e.cal || 'me@x') === mm[1] && (!um || e.updated >= um)) }); }
      if (m === 'GET') return G.ev[id] ? J(G.ev[id]) : J({}, 404);
      G.writes++;
      if (m === 'POST') { if (G.ev[body.id]) return J({}, 409); G.ev[body.id] = Object.assign({ status: 'confirmed', updated: G.stamp(), cal: mm[1] }, body); return J(G.ev[body.id]); }
      if (m === 'PATCH' && !G.ev[id]) {   // 반복의 회차를 고치면 구글은 '예외' 를 만든다 (원본id_원래시작)
        const mi = id.replace(/_\d{8}(T\d{6}Z)?$/, ''), mst = G.ev[mi];
        if (mst && mst.recurrence) { const suf = id.slice(mi.length + 1); const os = suf.includes('T') ? { dateTime: suf.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, '$1-$2-$3T$4:$5:$6Z') } : { date: suf.replace(/^(\d{4})(\d\d)(\d\d)$/, '$1-$2-$3') };
          G.ev[id] = Object.assign({ id, cal: mst.cal, status: 'confirmed', recurringEventId: mi, originalStartTime: os, summary: mst.summary }, body, { updated: G.stamp() }); return J(G.ev[id]); }
      }
      if (m === 'PATCH') { const e = G.ev[id]; if (!e) return J({}, 404); Object.assign(e, body, { updated: G.stamp() }); return J(e); }
      if (m === 'DELETE') { const e = G.ev[id]; if (!e) return J({}, 410); e.status = 'cancelled'; e.updated = G.stamp(); return J(null, 204); }
      return J({}, 400);
    };
    // 로그인·서버 대신
    _gcalUsable = () => true;
    _gcalFn = async (path) => (path === '/token' ? { access_token: 't', expires_in: 3600, email: 'hb@example.com' } : {});
    ST.settings.gcal = { on: true, cals: ['me@x', 'ch@x'], writeCal: 'me@x' };
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
  await p.evaluate(D1 => { const e = __G.ev.gx1; e.start = { dateTime: __tm(D1, 19) }; e.end = { dateTime: __tm(D1, 20) }; e.updated = __G.stamp(); }, D1);
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
  await p.evaluate(() => { const e = Object.values(__G.ev).find(e => e.summary === '은행 — 서류'); e.status = 'cancelled'; e.updated = __G.stamp(); });
  await sync();
  ok('⑦ 구글에서 지우면 BLOCK7 에서도 지워진다', !(await all()).some(e => e.id === 'ev12345'));

  // ⑨ 입력창 캘린더 고르기 → 그 캘린더로 · 시계 끄면 종일 (v26-1024-1)
  await p.evaluate(D1 => {
    openEventModal(_secIdForTime('09:00'), null, D1);
    document.getElementById('eventTextInput').value = '21 구역모임';
    setEventTimeToggle(false);
    document.querySelector('#eventCalPick [data-cal="ch@x"]').click();
    submitEventModal();
  }, D1);
  await sync();
  const ch = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '21 구역모임'));
  ok('⑨ 고른 캘린더(교회)에 종일로 들어간다', ch && ch.cal === 'ch@x' && ch.start.date === D1 && !ch.start.dateTime, ch);
  const chips = await p.evaluate(() => [...document.querySelectorAll('#eventCalPick [data-cal]')].map(x => x.dataset.cal));
  ok('⑨ 고를 수 있는 것: 쓸 수 있는 켠 캘린더 + BLOCK7 에만', JSON.stringify(chips) === JSON.stringify(['me@x', 'ch@x', '-']), chips);
  // 고리 붙은 그 일정을 다시 열어 '내 캘린더' 로 바꾸면 구글에서 옮겨진다
  await p.evaluate(() => {
    let at = null; Object.keys(ST.days).forEach(k => Object.keys(ST.days[k].events || {}).forEach(s => (ST.days[k].events[s] || []).forEach((e, i) => { if (e.text === '21 구역모임') at = { k, s, i }; })));
    openEventModal(at.s, at.i, at.k);
    document.querySelector('#eventCalPick [data-cal="me@x"]').click();
    submitEventModal();
  });
  await sync();
  const ch2 = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '21 구역모임'));
  const loc2 = (await all()).find(e => e.text === '21 구역모임');
  ok('⑨ 다른 캘린더를 고르면 구글에서 옮겨지고 고리도 따라간다', ch2.cal === 'me@x' && loc2.g.c === 'me@x', [ch2, loc2]);
  const allDaySec = await p.evaluate(() => _gcalDefSec());
  ok('⑨ 종일 일정 구간: 시간 개념 없는 구간 (없으면 보이는 맨 위)', allDaySec === (await p.evaluate(() => { const n = SECS.find(_secNoTime); const v = SECS.filter(x => ST.vis.includes(x.id)); return (n || v[0] || SECS[0]).id; })));

  // ⑩ 색 입히기 — 켜면 칩에 색 · 끄면 없음
  const col = await p.evaluate(() => { const ev = { g: { c: 'me@x' } };
    const a = _gcalEvColor(ev); ST.settings.gcal.color = false; const b = _gcalEvColor(ev); delete ST.settings.gcal.color; return [a, b]; });
  ok('⑩ 색 켜짐 → 캘린더 색 · 꺼짐 → 없음', col[0] === '#4285f4' && col[1] === '', col);

  // ⑪ 여러 날 종일 일정 — 이어지는 날에도 비춰 보이고(저장은 첫날 하나), W·M 은 띠 하나에 글 한 번 (v26-1024-2)
  const sp = await p.evaluate(D1 => {
    const sid = _gcalDefSec(); getEvents(D1, sid).push({ id: 'sp1', time: null, text: '수련회', g: { c: 'me@x', i: 'spx', u: 'u', h: '', d: 3 } });
    const D3 = gcalAddDays(D1, 2), D4 = gcalAddDays(D1, 3);
    const on = k => getDisplayEvents(k, sid).filter(e => e.id === 'sp1').map(e => e.text + _gcalSpanTag(e));
    const stored = Object.keys(ST.days).filter(k => (ST.days[k].events[sid] || []).some(e => e.id === 'sp1')).length;
    const keys = [D1, gcalAddDays(D1, 1), D3, D4];
    const lanes = _gcalLanes(keys, [sid]);
    const html = keys.map(k => (lanes[k] || []).map(x => _gcalSegHTML(x, 'w')).join(''));
    return { a: on(D1), b: on(D3), c: on(D4), stored, labels: html.map(h => (h.match(/수련회/g) || []).length) };
  }, D1);
  ok('⑪ 첫날 ~끝날 · 셋째 날 3/3일 · 넷째 날 없음', sp.a[0].endsWith('~' + sp.a[0].split('~')[1]) && /3\/3일$/.test(sp.b[0]) && sp.c.length === 0, sp);
  ok('⑪ 저장은 첫날 하나뿐', sp.stored === 1, sp);
  ok('⑪ W 띠: 글은 첫 칸에만 한 번', JSON.stringify(sp.labels) === JSON.stringify([1, 0, 0, 0]), sp.labels);

  // ⑫ BLOCK7 반복 → 구글 반복 (v26-1024-3): 보내기 · 이 날만 지우기(EXDATE) · 전체 지우기
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); getEvents(D1, sid).push({ id: 'ev' + Date.now(), time: '09:00', text: '아침 기도', repeat: { daily: true, daysOfWeek: [0,1,2,3,4,5,6], weekly: false, weeksOfMonth: [1,2,3,4,5] }, rid: 'rTest1' }); save(); }, D1);
  await sync();
  const rg = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '아침 기도'));
  ok('⑫ 반복 일정이 구글 반복으로 (DAILY · 시간대)', rg && JSON.stringify(rg.recurrence) === '["RRULE:FREQ=DAILY"]' && rg.start.timeZone === 'Asia/Seoul', rg);
  const w1 = await p.evaluate(() => __G.writes); await sync();
  ok('⑫ 그대로면 다시 안 쓴다 (원본을 따로 물어 맞춘다)', (await p.evaluate(() => __G.writes)) === w1);
  const D3 = await p.evaluate(D1 => gcalAddDays(D1, 2), D1);
  await p.evaluate(([D1, D3]) => { const sid = _secIdForTime('09:00'); const arr = getEvents(D1, sid); const idx = arr.findIndex(e => e.text === '아침 기도');
    _evDeleteApply({ dateKey: D1, idx, secId: sid, occ: D3 }, 'one'); }, [D1, D3]);
  await sync();
  const rg2 = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '아침 기도'));
  ok('⑫ 이 날만 지우기 → 구글 원본에 EXDATE', rg2.recurrence.length === 2 && rg2.recurrence[1] === 'EXDATE;TZID=Asia/Seoul:' + D3.replace(/-/g, '') + 'T090000', rg2.recurrence);
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); const arr = getEvents(D1, sid); const idx = arr.findIndex(e => e.text === '아침 기도');
    _evDeleteApply({ dateKey: D1, idx, secId: sid, occ: D1 }, 'all'); }, D1);
  await sync();
  ok('⑫ 반복 전체 지우기 → 구글 반복도 지워진다', (await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '아침 기도').status)) === 'cancelled');

  // ⑭ 지웠다가 실행취소 → 구글도 되살아난다 (v26-1024-5, HB 신고) · 반복 전체도
  await p.evaluate(D1 => { openEventModal(_secIdForTime('10:00'), null, D1); document.getElementById('eventTextInput').value = '되살릴 일정'; submitEventModal(); }, D1);
  await sync();
  await p.evaluate(() => { let at = null; Object.keys(ST.days).forEach(k => Object.keys(ST.days[k].events || {}).forEach(s => (ST.days[k].events[s] || []).forEach((e, i) => { if (e.text === '되살릴 일정') at = { k, s, i }; })));
    beforeSave(); _gcalTomb(at.k, getEvents(at.k, at.s)[at.i]); getEvents(at.k, at.s).splice(at.i, 1); save(); });
  await sync();
  const gst = () => p.evaluate(t => Object.values(__G.ev).find(e => e.summary === t).status, '되살릴 일정');
  const s1 = await gst();
  await p.evaluate(() => doUndo());
  await sync();
  ok('⑭ 지움 → 구글 지워짐 → 실행취소 → 구글 되살아남 · BLOCK7 에도 남아 있음', s1 === 'cancelled' && (await gst()) === 'confirmed' && (await all()).some(e => e.text === '되살릴 일정'), [s1, await gst()]);
  await sync();
  ok('⑭ 되살린 뒤에는 조용하다 (또 지우거나 또 되살리지 않음)', (await gst()) === 'confirmed' && (await all()).filter(e => e.text === '되살릴 일정').length === 1);
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); getEvents(D1, sid).push({ id: 'ev' + Date.now(), time: '08:00', text: '되살릴 반복', repeat: { weekly: true }, rid: 'rUndo' }); save(); }, D1);
  await sync();
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); const arr = getEvents(D1, sid); const idx = arr.findIndex(e => e.text === '되살릴 반복');
    _evDeleteApply({ dateKey: D1, idx, secId: sid, occ: D1 }, 'all'); }, D1);
  await sync();
  const r1 = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '되살릴 반복').status);
  await p.evaluate(() => doUndo()); await sync();
  const r2 = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '되살릴 반복'));
  ok('⑭ 반복 전체 지움 → 실행취소 → 구글 반복도 규칙째 되살아남', r1 === 'cancelled' && r2.status === 'confirmed' && r2.recurrence && r2.recurrence[0].startsWith('RRULE:FREQ=WEEKLY'), [r1, r2]);

  // ⑮ 구글에서 만든 반복 → BLOCK7 반복 하나 · 고친 회차 → 하루만 고친 일정 · 구글에서 규칙 바꾸면 따라옴 (v26-1024-7)
  await p.evaluate(D1 => {
    const tm = window.__tm, D8 = gcalAddDays(D1, 7);
    __G.ev.gs1 = { id: 'gs1', cal: 'me@x', status: 'confirmed', updated: __G.stamp(), summary: '셀모임', recurrence: ['RRULE:FREQ=WEEKLY'],
      start: { dateTime: tm(D1, 19), timeZone: 'Asia/Seoul' }, end: { dateTime: tm(D1, 21), timeZone: 'Asia/Seoul' } };
    const ok = D8.replace(/-/g, '');
    __G.ev['gs1_' + ok] = { id: 'gs1_' + ok, cal: 'me@x', status: 'confirmed', updated: __G.stamp(), recurringEventId: 'gs1', summary: '셀모임 (우리 집)',
      originalStartTime: { dateTime: tm(D8, 19) }, start: { dateTime: tm(D8, 20) }, end: { dateTime: tm(D8, 22) } };
  }, D1);
  await sync();
  const cell = await p.evaluate(D1 => { const o = []; Object.keys(ST.days).forEach(k => Object.values(ST.days[k].events || {}).forEach(a => (a || []).forEach(e => { if (/셀모임/.test(e.text)) o.push({ k, text: e.text, rep: !!(e.repeat && (e.repeat.daily || e.repeat.weekly)), rid: e.rid, ex: e.repeat && e.repeat.ex, time: e.time }); }))); return o; }, D1);
  const cm = cell.find(x => x.rep), co = cell.find(x => !x.rep);
  const D8 = await p.evaluate(D1 => gcalAddDays(D1, 7), D1);
  ok('⑮ 구글 매주 반복 → BLOCK7 반복 하나 (원본과 같은 회차는 따로 안 생김)', cell.length === 2 && cm && cm.k === D1 && cm.time === '19:00', cell);
  ok('⑮ 고친 회차 → 같은 묶음의 하루만 고친 일정 · 원본은 그 날을 뺀다', co && co.rid === cm.rid && co.k === D8 && co.time === '20:00' && JSON.stringify(cm.ex) === JSON.stringify([D8]), cell);
  const D15 = await p.evaluate(D1 => gcalAddDays(D1, 14), D1);
  ok('⑮ 2주 뒤에 원본이 비친다', await p.evaluate(([D1, D15]) => SECS.some(s => getDisplayEvents(D15, s.id).some(e => e.text === '셀모임')), [D1, D15]));
  // 구글에서 규칙 바꿈 (매주 → 둘째·넷째 주 같은 요일)
  await p.evaluate(D1 => { const [y, m, d] = D1.split('-').map(Number); const dw = ['SU','MO','TU','WE','TH','FR','SA'][new Date(y, m - 1, d).getDay()];
    __G.ev.gs1.recurrence = ['RRULE:FREQ=MONTHLY;BYDAY=2' + dw + ',4' + dw]; __G.ev.gs1.updated = __G.stamp(); }, D1);
  await sync();
  const wk = await p.evaluate(() => { let r = null; Object.values(ST.days).forEach(d => Object.values(d.events || {}).forEach(a => (a || []).forEach(e => { if (e.text === '셀모임' && e.repeat) r = e.repeat; }))); return r; });
  ok('⑮ 구글에서 바꾼 규칙(둘째·넷째 주)을 BLOCK7 이 따른다', wk && wk.weekly && JSON.stringify(wk.weeksOfMonth) === '[2,4]', wk);
  const w15 = await p.evaluate(() => __G.writes); await sync();
  ok('⑮ 따른 뒤에는 조용하다', (await p.evaluate(() => __G.writes)) === w15);

  // ⑯ 구글에서 고친 것이 저절로 온다 (v26-1024-8, HB) — 맞추기를 손으로 부르지 않는다
  await p.evaluate(() => _gcalBoot(() => true));
  await new Promise(r => setTimeout(r, 5000));
  const D2 = await p.evaluate(D1 => gcalAddDays(D1, 1), D1);
  await p.evaluate(D2 => { __G.ev.gnew = { id: 'gnew', cal: 'me@x', status: 'confirmed', updated: __G.stamp(), summary: '구글에서 만든 일정',
    start: { dateTime: __tm(D2, 15) }, end: { dateTime: __tm(D2, 16) } }; }, D2);
  let t16 = Date.now();
  await p.waitForFunction(() => Object.values(ST.days).some(d => Object.values(d.events || {}).some(a => (a || []).some(e => e.text === '구글에서 만든 일정'))), null, { timeout: 40000 }).catch(() => null);
  const dtP = Date.now() - t16;
  ok('⑯ 열어 둔 채로: 구글에서 만든 일정이 20초 안에 저절로 들어온다 (' + (dtP / 1000).toFixed(1) + '초)', dtP < 20000, dtP);
  await new Promise(r => setTimeout(r, 4500));
  await p.evaluate(() => { const e = __G.ev.gnew; e.summary = '구글에서 고친 일정'; e.updated = __G.stamp(); });
  t16 = Date.now();
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));   // 앱으로 돌아옴
  await p.waitForFunction(() => Object.values(ST.days).some(d => Object.values(d.events || {}).some(a => (a || []).some(e => e.text === '구글에서 고친 일정'))), null, { timeout: 40000 }).catch(() => null);
  const dtV = Date.now() - t16;
  ok('⑯ 앱으로 돌아오면 바로 (' + (dtV / 1000).toFixed(1) + '초)', dtV < 3000, dtV);
  await p.evaluate(() => { const e = __G.ev.gnew; e.status = 'cancelled'; e.updated = __G.stamp(); });
  t16 = Date.now();
  await p.waitForFunction(() => !Object.values(ST.days).some(d => Object.values(d.events || {}).some(a => (a || []).some(e => e.text === '구글에서 고친 일정'))), null, { timeout: 40000 }).catch(() => null);
  const dtD = Date.now() - t16;
  ok('⑯ 구글에서 지운 것도 20초 안에 (' + (dtD / 1000).toFixed(1) + '초)', dtD < 20000, dtD);
  const wq = await p.evaluate(() => __G.writes); await new Promise(r => setTimeout(r, 16000));
  ok('⑯ 바뀐 것이 없으면 조용하다 (구글에 쓰지 않음)', (await p.evaluate(() => __G.writes)) === wq);

  // ⑰ 반복 '이 날만 고치기' → 구글 회차가 그 자리에서 고쳐진다(예외) · '모두 고치기' → 같은 구글 일정의 이름만 (v26-1024-10, HB)
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); getEvents(D1, sid).push({ id: 'ev' + Date.now(), time: '09:00', text: '새벽기도', repeat: { weekly: true }, rid: 'rDawn' }); save(); }, D1);
  await sync();
  const gDawn = await p.evaluate(() => Object.values(__G.ev).find(e => e.summary === '새벽기도' && e.recurrence));
  const D8b = await p.evaluate(D1 => gcalAddDays(D1, 7), D1);
  await p.evaluate(([D1, D8]) => { const sid = _secIdForTime('09:00'); const arr = getEvents(D1, sid); const i = arr.findIndex(e => e.text === '새벽기도');
    _evEditApply({ text: '새벽기도 (특별)', time: '09:00', repeat: arr[i].repeat, secId: sid, dateKey: D1, editIdx: i, occ: D8 }, 'one'); }, [D1, D8b]);
  await sync(); await sync();
  const after = await p.evaluate(() => Object.values(__G.ev).filter(e => /새벽기도/.test(e.summary || '')).map(e => ({ id: e.id, s: e.summary, st: e.status, rec: e.recurrence, re: e.recurringEventId })));
  const exc = after.find(x => x.s === '새벽기도 (특별)');
  ok('⑰ 이 날만 고치기 → 구글 반복의 회차가 고쳐진다 (따로 선 새 일정이 아님)', exc && exc.re === gDawn.id && after.filter(x => !x.re && !x.rec).length === 0, after);
  const mNow = after.find(x => x.id === gDawn.id);
  ok('⑰ 원본은 그 날을 EXDATE 로 지우지 않는다 · 원본은 그대로 한 개', mNow && mNow.st === 'confirmed' && !(mNow.rec || []).some(l => /^EXDATE/.test(l)), mNow);
  const locDawn = await p.evaluate(() => { const o = []; Object.keys(ST.days).forEach(k => Object.values(ST.days[k].events || {}).forEach(a => (a || []).forEach(e => { if (/새벽기도/.test(e.text)) o.push({ k, t: e.text, rep: !!(e.repeat && e.repeat.weekly), gi: e.g && e.g.i }); }))); return o; });
  ok('⑰ BLOCK7: 반복 하나 + 그 날 고친 일정 하나 (두 벌 안 생김)', locDawn.length === 2 && locDawn.filter(x => x.rep).length === 1, locDawn);
  // 모두 고치기
  await p.evaluate(D1 => { const sid = _secIdForTime('09:00'); const arr = getEvents(D1, sid); const i = arr.findIndex(e => e.text === '새벽기도');
    _evEditApply({ text: '새벽 기도회', time: '09:00', repeat: arr[i].repeat, secId: sid, dateKey: D1, editIdx: i, occ: D1 }, 'all'); }, D1);
  await sync(); await sync();
  const all2 = await p.evaluate(id => ({ m: __G.ev[id], others: Object.values(__G.ev).filter(e => e.id !== id && /새벽/.test(e.summary || '') && e.status !== 'cancelled' && !e.recurringEventId) }), gDawn.id);
  ok('⑰ 모두 고치기 → 같은 구글 일정(같은 id)의 이름만 바뀐다 · 새 일정 없음', all2.m.summary === '새벽 기도회' && all2.m.status === 'confirmed' && all2.others.length === 0, all2);
  const excAfter = await p.evaluate(id => Object.values(__G.ev).filter(e => e.recurringEventId === id).map(e => [e.summary, e.status]), gDawn.id);
  ok('⑰ 모두 고치기 → 그 날 고친 회차는 원본 모양으로 돌아간다 (지워져 비지 않는다)', excAfter.length === 1 && excAfter[0][0] === '새벽 기도회' && excAfter[0][1] === 'confirmed', excAfter);

  // ⑱ 등록하자마자 고른 캘린더 색 (구글에 가기 전에도) (v26-1024-11, HB)
  const colNow = await p.evaluate(D1 => {
    window.__noSync = true;
    openEventModal(_secIdForTime('10:00'), null, D1); document.getElementById('eventTextInput').value = '색 확인';
    document.querySelector('#eventCalPick [data-cal="ch@x"]').click(); submitEventModal();
    let ev = null; Object.values(ST.days).forEach(d => Object.values(d.events || {}).forEach(a => (a || []).forEach(e => { if (e.text === '색 확인') ev = e; })));
    return [!!ev.g, _gcalEvColor(ev), (ST.settings.gcal.meta['ch@x'] || {}).col];
  }, D1);
  ok('⑱ 구글에 이어지기 전(고리 없음)인데도 고른 캘린더 색', colNow[0] === false && colNow[1] && colNow[1] === colNow[2], colNow);
  const colDef = await p.evaluate(D1 => {
    openEventModal(_secIdForTime('10:00'), null, D1); document.getElementById('eventTextInput').value = '기본 색 확인'; submitEventModal();
    let ev = null; Object.values(ST.days).forEach(d => Object.values(d.events || {}).forEach(a => (a || []).forEach(e => { if (e.text === '기본 색 확인') ev = e; })));
    return [_gcalEvColor(ev), (ST.settings.gcal.meta[ST.settings.gcal.writeCal] || {}).col];
  }, D1);
  ok('⑱ 기본 캘린더 그대로 두어도 바로 그 색', colDef[0] && colDef[0] === colDef[1], colDef);
  await sync();
  const colAfter = await p.evaluate(() => { let ev = null; Object.values(ST.days).forEach(d => Object.values(d.events || {}).forEach(a => (a || []).forEach(e => { if (e.text === '색 확인') ev = e; }))); return [ev.g && ev.g.c, ev.gc, _gcalEvColor(ev)]; });
  ok('⑱ 구글에 이어진 뒤에도 같은 색 · 고른 표시는 걷힌다', colAfter[0] === 'ch@x' && colAfter[1] === undefined && colAfter[2] === colNow[1], colAfter);

  // ⑬ 빠르기 (v26-1024-4): 입력창에서 저장 → 구글에 생기기까지 (손대지 않고 저절로 도는 길로)
  await new Promise(r => setTimeout(r, 4500));
  const t0 = Date.now();
  await p.evaluate(D1 => { openEventModal(_secIdForTime('10:00'), null, D1); document.getElementById('eventTextInput').value = '빠르기 확인'; submitEventModal(); }, D1);
  await p.waitForFunction(() => Object.values(__G.ev).some(e => e.summary === '빠르기 확인'), null, { timeout: 30000 }).catch(() => null);
  const dt = Date.now() - t0;
  ok('⑬ 저장하고 5초 안에 구글에 생긴다 (' + (dt / 1000).toFixed(1) + '초)', dt < 5000, dt);

  // 설정창 줄
  const ui = await p.evaluate(() => { _gcalCals = [{ id: 'me@x', name: '내 캘린더', role: 'owner', primary: true }, { id: 'hol', name: '대한민국의 휴일', role: 'reader' }]; _gcalRenderSettings(); const folded = document.getElementById('gcalCalList').style.display === 'none'; gcalToggleList(); return [folded, document.getElementById('gcalCalList').style.display === '', document.querySelectorAll('#gcalCalList .settings-row').length, document.getElementById('gcalWriteSel').options.length, document.getElementById('gcalConnectBtn').textContent]; });
  ok('설정창: 목록은 접혀 있다가 펼쳐진다 · 캘린더 두 줄 · 쓸 캘린더는 쓸 수 있는 것만(+보내지 않음) · 연결 끊기 단추', JSON.stringify(ui) === JSON.stringify([true, true, 2, 2, '연결 끊기']), ui);

  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
