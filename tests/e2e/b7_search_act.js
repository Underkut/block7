// 검색 4단계 — 결과 동작 (v. 26-1031-9, HB 1031). ⚠️ check.sh 가 돌리지 않는다. 저장소 뿌리에서:
//   python3 -m http.server 5502 &   node tests/e2e/b7_search_act.js   (SHOT=폴더 를 주면 화면을 찍는다)
// 지키는 것: 동그라미 = 그 날짜 것을 그 자리에서 완료(보던 날은 그대로) · 롱터치/우클릭 메뉴의 동작이 **그 날짜** 할일에 걸린다 ·
//           일정 = 설정 D/W/M(기본 M), 넓은 화면은 펼친 위젯에서, 도착 칸이 반짝 · ESC 는 메뉴 먼저
const { chromium } = require(process.env.PW || 'playwright');
const APP = (process.env.APP_ORIGIN || 'http://127.0.0.1:5502') + '/index-dev.html';
const SHOT = process.env.SHOT || '';
(async () => {
  const b = await chromium.launch(); let pass = 0, fail = 0;
  const ok = (n, c, i) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n, JSON.stringify(i)); } };
  const seed = () => {
    const k = tKey(), d = new Date(); d.setDate(d.getDate() + 3);
    const k3 = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    getBigs(k3, 'pm').push({ text: '수련회 연락 돌리기', subs: [{ text: '목사님 연락', done: false }, { text: '숙소', done: false }], urgent: true });
    getBigs(k3, 'am').push({ text: '보험사 연락 확인' });
    getSmalls(k3, 'night').push({ text: '단톡 연락 정리' });
    getEvents(k3, 'pm').push({ text: '셀 리더 연락망 모임', time: '14:00' });
    save(); renderToday();
    window.__k = k; window.__k3 = k3;
    return { k, k3 };
  };
  const find = (p, t) => p.evaluate(t => { const i = _srch.last.findIndex(h => h.k === 'tasks' && (h.r.kind === 'sub' ? h.r.sub.text : h.r.item.text) === t); return i; }, t);
  const ctx = async (p, i) => {   // 우클릭(마우스) 으로 메뉴
    await p.evaluate(i => { const el = document.querySelector('#srchBody [data-r="' + i + '"]'); el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 50, clientY: 50 })); }, i);
    await p.waitForTimeout(150);
  };
  const act = (p, a) => p.evaluate(a => document.querySelector('#srchActIn [data-a="' + a + '"]').click(), a);
  const search = async (p, q) => { await p.evaluate(q => { openSearch(); document.getElementById('srchInput').value = q; _srchInput(q); }, q); await p.waitForTimeout(300); };

  for (const [w, h] of [[390, 844], [1280, 800]]) {
    console.log('— 폭 ' + w);
    const p = await (await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: h }, hasTouch: w < 500 })).newPage();
    p.on('pageerror', e => { fail++; console.log('ERR', e.message); });
    await p.goto(APP); await p.waitForTimeout(1500);
    const { k, k3 } = await p.evaluate(seed);

    // ① 동그라미 — 3일 뒤 할일을 검색 화면에서 바로 완료
    await search(p, '연락');
    let i = await find(p, '보험사 연락 확인');
    await p.evaluate(i => document.querySelector('#srchBody [data-r="' + i + '"] .srch-chk').click(), i);
    await p.waitForTimeout(250);
    let s = await p.evaluate(() => ({ done: !!getBigs(__k3, 'am').find(x => x.text === '보험사 연락 확인').done, open: _srchIsOpen(), view: tKey(), row: !!document.querySelector('#srchBody .srch-row.done') }));
    ok('동그라미 → 그 날짜 것이 완료 · 검색 화면에 머문다 · 보던 날 그대로', s.done && s.open && s.view === k && s.row, s);
    i = await find(p, '목사님 연락');
    await p.evaluate(i => document.querySelector('#srchBody [data-r="' + i + '"] .srch-chk').click(), i);
    await p.waitForTimeout(200);
    s = await p.evaluate(() => getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기').subs[0].done);
    ok('하위 할일 동그라미도 그 자리에서', s === true, s);
    i = await find(p, '수련회 연락 돌리기');
    await p.evaluate(i => document.querySelector('#srchBody [data-r="' + i + '"] .srch-chk').click(), i);
    await p.waitForTimeout(200);
    s = await p.evaluate(() => { const it = getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기'); return { d: it.done, subs: it.subs.every(x => x.done), urg: !!it.urgent }; });
    ok('부모 완료 → 하위도 따라 · 긴급은 풀림 (D뷰 체크와 같은 규칙)', s.d && s.subs && !s.urg, s);
    await p.evaluate(() => { const it = getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기'); it.done = false; it.subs.forEach(x => x.done = false); save(); _srchRender(true); });

    // ② 롱터치 메뉴 (폰은 손가락, 넓은 화면은 우클릭)
    i = await find(p, '보험사 연락 확인');
    if (w < 500) {
      await p.evaluate(i => {
        const el = document.querySelector('#srchBody [data-r="' + i + '"] .srch-tx'), r = el.getBoundingClientRect();
        const t = new Touch({ identifier: 1, target: el, clientX: r.left + 10, clientY: r.top + 5 });
        el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t], targetTouches: [t], changedTouches: [t] }));
        window.__lpEl = el; window.__lpT = t;
      }, i);
      await p.waitForTimeout(600);
      await p.evaluate(() => { const el = __lpEl, t = __lpT; el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], targetTouches: [], changedTouches: [t] })); document.getElementById('srchAct').click(); });
      await p.waitForTimeout(100);
    } else await ctx(p, i);
    s = await p.evaluate(() => ({ open: document.getElementById('srchAct').classList.contains('open'), big: [...document.querySelectorAll('.srch-act-big button span')].map(x => x.textContent), list: [...document.querySelectorAll('.srch-act-list button span')].map(x => x.textContent) }));
    ok('메뉴가 열린다 (손가락을 떼도 안 닫힘)', s.open, s);
    ok('큰 단추 넷: 완료 · 전화 · 보러 가기 · 오늘로', JSON.stringify(s.big) === JSON.stringify(['완료 풀기', '전화', '보러 가기', '오늘로']), s.big);
    ok('목록: 날짜 · 구간 · 중요 · 긴급 · 메모 · 복제 · 삭제', ['날짜 옮기기…', '구간 옮기기…', '⚑ 중요 켜기', '! 긴급 켜기', '메모 쓰기', '복제', '삭제'].every(x => s.list.includes(x)), s.list);
    if (SHOT) await p.screenshot({ path: SHOT + '/srch-act-' + w + '.png' });
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    s = await p.evaluate(() => ({ m: document.getElementById('srchAct').classList.contains('open'), sr: _srchIsOpen() }));
    ok('ESC 는 메뉴만 닫고 검색은 남는다', !s.m && s.sr, s);

    // 중요 켜기 → 그 날짜 것
    await ctx(p, await find(p, '보험사 연락 확인')); await act(p, 'flag'); await p.waitForTimeout(200);
    s = await p.evaluate(() => ({ f: !!getBigs(__k3, 'am').find(x => x.text === '보험사 연락 확인').flag, view: tKey(), open: _srchIsOpen(), chip: !!document.querySelector('#srchBody .srch-chip.c-flag') }));
    ok('⚑ 중요 → 그 날짜 할일에 · 보던 날 그대로 · 결과에 바로', s.f && s.view === k && s.open && s.chip, s);
    // 구간 옮기기 (오전 → 저녁)
    await ctx(p, await find(p, '보험사 연락 확인')); await act(p, 'sec'); await p.waitForTimeout(80);
    await act(p, 'sec:night'); await p.waitForTimeout(250);
    s = await p.evaluate(() => ({ am: getBigs(__k3, 'am').some(x => x.text === '보험사 연락 확인'), night: getBigs(__k3, 'night').some(x => x.text === '보험사 연락 확인'), view: tKey() }));
    ok('구간 옮기기 → 같은 날 다른 구간', !s.am && s.night && s.view === k, s);
    // 날짜 옮기기 → 내일로
    await ctx(p, await find(p, '보험사 연락 확인')); await act(p, 'date'); await p.waitForTimeout(80);
    const t1 = await p.evaluate(() => _srchKeyAdd(todayKey(), 1));
    await act(p, 'mv:' + t1); await p.waitForTimeout(250);
    s = await p.evaluate(t1 => ({ moved: getBigs(t1, 'night').some(x => x.text === '보험사 연락 확인'), gone: !getBigs(__k3, 'night').some(x => x.text === '보험사 연락 확인') }), t1);
    ok('날짜 옮기기 → 내일 (구간은 그대로)', s.moved && s.gone, s);
    // 오늘로
    await ctx(p, await find(p, '단톡 연락 정리')); await act(p, 'today'); await p.waitForTimeout(250);
    s = await p.evaluate(() => ({ t: getSmalls(tKey(), 'night').some(x => x.text === '단톡 연락 정리'), g: !getSmalls(__k3, 'night').some(x => x.text === '단톡 연락 정리'), shown: [...document.querySelectorAll('#tb-night .sm-item')].length }));
    ok('오늘로 → 오늘 · 스몰 그대로', s.t && s.g, s);
    // 복제 · 삭제
    await ctx(p, await find(p, '단톡 연락 정리')); await act(p, 'dup'); await p.waitForTimeout(200);
    s = await p.evaluate(() => getSmalls(tKey(), 'night').filter(x => x.text === '단톡 연락 정리').length);
    ok('복제 → 같은 날 둘', s === 2, s);
    await ctx(p, await find(p, '단톡 연락 정리')); await act(p, 'del'); await p.waitForTimeout(250);
    s = await p.evaluate(() => ({ n: getSmalls(tKey(), 'night').filter(x => x.text === '단톡 연락 정리').length, trash: (ST.days[tKey()].trash || []).some(x => (x.item ? x.item.text : x.text) === '단톡 연락 정리') }));
    ok('삭제 → 휴지통으로', s.n === 1 && s.trash, s);
    // 메모 — 그 날짜 할일의 메모 창이 검색 위에
    await ctx(p, await find(p, '수련회 연락 돌리기')); await act(p, 'memo'); await p.waitForTimeout(250);
    s = await p.evaluate(() => { const md = document.getElementById('taskMemoModal'); return { open: md.style.display === 'block', k: _memoCtx && _memoCtx.k, z: +getComputedStyle(md).zIndex > 300 }; });
    ok('메모 → 그 날짜 할일의 메모 창 (검색 위)', s.open && s.k === k3 && s.z, s);
    await p.evaluate(() => { const e = document.getElementById('memoEdit'); if (e) { e.value = '숙소 연락처 010'; e.dispatchEvent(new Event('input', { bubbles: true })); } closeTaskMemo(); });
    await p.waitForTimeout(200);
    s = await p.evaluate(() => (getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기') || {}).memo || '');
    ok('메모는 그 날짜 할일에 저장', /숙소 연락처/.test(s), s);

    // ②-2 D뷰 위 거르기에 가려진 할일 → 가면 단추를 맞춘다 (v. 26-1031-10)
    await p.evaluate(() => { const it = getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기'); it.done = true; it.subs.forEach(x => x.done = true); delete it.subOpen;
      ST.preset = 'flagFilter'; ST.settings.showCompletedTasks = false; ST.settings.showCompletedBtn = false; ST.settings.showFlagFilterBtn = true; save(); renderToday(); });
    await search(p, '목사님 연락');
    await p.evaluate(() => document.querySelector('#srchBody .srch-sub').click()); await p.waitForTimeout(800);
    s = await p.evaluate(() => {
      const it = getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기'), i = getBigs(__k3, 'pm').indexOf(it);
      const row = document.querySelector('#tb-pm .big-item[data-i="' + i + '"]'), wrap = row && row.closest('.swipe-wrap');
      return { preset: ST.preset, done: ST.settings.showCompletedTasks, btn: ST.settings.showCompletedBtn, subOpen: !!it.subOpen, day: tKey() === __k3,
        visible: !!row && !(wrap && wrap.hidden) && row.getClientRects().length > 0, flash: !!document.querySelector('.task-flash'),
        doneBtnOn: !!document.querySelector('.preset-btn.on[aria-pressed="true"]'), toast: (document.getElementById('_toast') || {}).innerText || '' };
    });
    ok('깃발만 보기 풀림 · 완료 보이기 켬 · ✓ 단추 꺼냄 · 하위 판 펼침', s.preset == null && s.done === true && s.btn === true && s.subOpen, s);
    ok('그 할일이 실제로 보이고 반짝 · ✓ 단추가 눌린 채로 보인다', s.day && s.visible && s.flash && s.doneBtnOn, s);
    ok('무엇을 바꿨는지 토스트에 줄로', /깃발만 보기를 풀었어요/.test(s.toast) && /완료한 할일도 보이게/.test(s.toast) && /✓ 단추도 꺼내/.test(s.toast), s.toast);
    await p.evaluate(() => { const it = getBigs(__k3, 'pm').find(x => x.text === '수련회 연락 돌리기'); it.done = false; it.subs.forEach(x => x.done = false); save(); goToDate(__k); });
    // 가리는 것이 없으면 아무것도 안 바꾼다
    await p.evaluate(() => { ST.preset = null; ST.settings.showCompletedTasks = false; ST.settings.showCompletedBtn = false; save(); });
    await search(p, '수련회 연락 돌리기');
    await p.evaluate(() => document.querySelector('#srchBody .srch-big').click()); await p.waitForTimeout(500);
    s = await p.evaluate(() => ({ done: ST.settings.showCompletedTasks, btn: ST.settings.showCompletedBtn, toast: (document.getElementById('_toast') || {}).innerText || '' }));
    ok('안 끝낸 할일이면 완료 숨김 · 단추 설정은 그대로', s.done === false && s.btn === false && !/켰어요/.test(s.toast), s);
    await p.evaluate(() => { ST.settings.showCompletedTasks = true; ST.settings.showCompletedBtn = true; save(); goToDate(__k); });

    // ③ 일정 → 기본 M
    const goEv = async () => { await search(p, '연락망'); await p.evaluate(() => document.querySelector('#srchBody .srch-e').click()); await p.waitForTimeout(500); };
    await goEv();
    if (w < 500) {
      s = await p.evaluate(() => ({ m: document.getElementById('monthlyView').style.display !== 'none', flash: !!document.querySelector('#monthlyView .mcc[data-k="' + __k3 + '"].srch-flash3'), open: _srchIsOpen() }));
      ok('1단 기본 M → M뷰의 그 날 칸이 반짝', s.m && s.flash && !s.open, s);
      await p.evaluate(() => updateSetting('srchEvView', 'w')); await goEv();
      s = await p.evaluate(() => ({ w: document.getElementById('weeklyView').style.display !== 'none', flash: !!document.querySelector('#weeklyView .wc[data-k="' + __k3 + '"][data-sec="pm"].srch-flash3') }));
      ok('1단 W → W뷰의 그 날 · 그 구간 칸이 반짝', s.w && s.flash, s);
      await p.evaluate(() => updateSetting('srchEvView', 'd')); await goEv();
      s = await p.evaluate(() => ({ d: tKey() === __k3 && document.getElementById('todayView').style.display !== 'none', flash: !!document.querySelector('#tsev-pm .ev-chip.srch-flash3') }));
      ok('D → D뷰 그 날 · 일정 칩이 반짝', s.d && s.flash, s);
    } else {
      const info = await p.evaluate(() => ({ mode: _layMode(), open: _srchOpenWidgets(_layMode()) }));
      console.log('   (넓은 화면 ' + info.mode + '단 · 펼친 위젯 ' + JSON.stringify(info.open) + ')');
      await p.evaluate(() => updateSetting('srchEvView', 'm')); await goEv();
      s = await p.evaluate(() => {
        const wt = _srchEvDest('m', _layMode(), _srchOpenWidgets(_layMode()));
        const sel = wt.to === 'widget' ? (wt.widget === 'weekly' ? '#weeklyPaneInner .wc[data-k="' + __k3 + '"].srch-flash3' : '.rp-widget[data-wtype="' + wt.widget + '"] .mcc[data-k="' + __k3 + '"].srch-flash3') : '#monthlyView .mcc[data-k="' + __k3 + '"].srch-flash3';
        return { wt, flash: !!document.querySelector(sel), dView: document.getElementById('todayView').style.display !== 'none' };
      });
      ok('넓은 화면 M → 펼친 위젯(없으면 M뷰)에서 그 칸이 반짝', s.flash && (s.wt.to !== 'widget' || s.dView), s);
      if (SHOT) await p.screenshot({ path: SHOT + '/srch-ev-' + w + '.png' });
      // 위젯을 다 접으면 단일뷰로
      await p.evaluate(() => { const L = _lay(); L.fold = L.fold || {}; ['weekly', 'monthSingle'].forEach(t => L.fold[t] = 'line'); const C = _layColsFor(L, _layMode()); Object.keys(C).forEach(c => C[c] = C[c].filter(t => t !== 'monthTriple')); save(); renderLayout(); updateSetting('srchEvView', 'w'); });
      await goEv();
      s = await p.evaluate(() => ({ open: _srchOpenWidgets(_layMode()), w: document.getElementById('weeklyView').style.display !== 'none', flash: !!document.querySelector('#weeklyView .wc[data-k="' + __k3 + '"].srch-flash3') }));
      ok('펼친 위젯이 없으면 W 단일뷰로', s.open.length === 0 && s.w && s.flash, s);
    }
    ok('설정 단추가 고른 값을 보여 준다', await p.evaluate(() => { _srchEvSync(); const v = ST.settings.srchEvView; return document.getElementById('srchEv' + v.toUpperCase()).classList.contains('on'); }));

    // ④ 말씀 메뉴
    const vi = await p.evaluate(() => { const v = _srchVerses()[0]; if (!v) return -1; openSearch(); const q = (v.krText || '').slice(0, 4); document.getElementById('srchInput').value = q; _srchInput(q); return 1; });
    if (vi > 0) {
      await p.waitForTimeout(300);
      const j = await p.evaluate(() => _srch.last.findIndex(h => h.k === 'verses'));
      if (j >= 0) {
        await ctx(p, j);
        s = await p.evaluate(() => [...document.querySelectorAll('.srch-act-list button span')].map(x => x.textContent));
        ok('말씀 메뉴: 전체화면 · 복사 · 공유 이미지 · 암송 · 저장 목록 · (성경)', ['전체화면으로', '복사', '공유 이미지', '암송', '저장 목록에 담기'].every(x => s.includes(x)), s);
        await act(p, 'vkeep'); await p.waitForTimeout(250);
        s = await p.evaluate(() => ({ kp: document.getElementById('keepPickModal').style.display === 'flex', srch: _srchIsOpen() }));
        ok('저장 목록 고르기가 검색 위에 뜬다', s.kp && s.srch, s);
        await p.evaluate(() => closeKeepPicker());
        if (SHOT) { await ctx(p, j); await p.screenshot({ path: SHOT + '/srch-act-verse-' + w + '.png' }); await p.keyboard.press('Escape'); }
      } else console.log('   (말씀 결과 없음 — 건너뜀)');
    }
  }
  console.log(`\n결과: 통과 ${pass} / 실패 ${fail}`); await b.close(); process.exit(fail ? 1 : 0);
})();
