// ══ There 대시보드 — BLOCK7 · Sweeter · 기도노트 공용 (HB 2026-10-13) ══════════════════
// ⚠️ 원본은 tools/there-dash.js 하나다. ./tools/sync-there-dash.sh 가 index.html 과 pray/index.html 의
//    there-dash 스크립트 덩어리에 **같은 글자로** 넣는다 — 손으로 한쪽만 고치지 말 것
//    (tests/test_there_dash.js 가 세 벌이 같은지 본다).
// 세 앱의 There(머문 시간) 기록을 한 모양으로 모아 주 · 달 · 하루로 보여 준다. **읽기만 한다** — 고치기 · 지우기는 부른 쪽이 opts.edit 로 맡는다(기도노트 기록 줄만, 1028-3).
//   thereLog = BLOCK7 · Sweeter 의 verseThereLog  {"YYYY-MM-DD":[{ref,time,t,d,sec,app,src}]}
//   prayLog  = 기도노트 DB.log                    {"YYYY-MM-DD":{d,p,k,s,ses:[{id,t,time,d,src}],mp:[{id,a,t,pid,d,n,k}]}}
//   mp = Map 기도(지도 There 안에서 누른 그룹 · 항목에 머문 시간). **합계에 더하지 않는다** — 그 시간은 지도 There(ses)에 이미 들어 있다.
//        '무엇을 위해 기도했나' 로만 보여 준다 (k = 누른 그룹 · 항목 이름, n = 사람 이름, a = 시작 ms).
//   fc = 한 장 기도 카드 [{id,s,pid,n,k,a,t,d,amen}] — 이름마다 머문 시간 · 아멘 여부 (k = 그룹 또는 오늘 목록 칸).
//        이것도 **합계에 더하지 않는다** — 한 장 기도 기록(ses, src 'focus')에 이미 들어 있다.
// 갈래 넷: block7 · sweeter · bible(src 가 bible · bible-menu) · pray.
//   10-12 전 BLOCK7 · Sweeter 기록은 app 이 비어 있다 → block7 로 센다.
//   기도노트 10-12 전 기록은 날 합계(s)만 있다 → '시간만 남은 기록' 한 줄로 센다.
const TDASH = (function () {
  const APPS = [
    ['block7', 'BLOCK7', '#dab87a'],
    ['sweeter', 'Sweeter', '#a892d6'],
    ['bible', '성경', '#7fc4a4'],
    ['pray', '기도노트', '#5b8fcc']
  ];
  const APP = {}; APPS.forEach(a => { APP[a[0]] = { name: a[1], color: a[2] }; });
  const SRC = {
    gnb: 'BLOCK7 위 메뉴', home: 'Sweeter 홈', bar: '상단 말씀 영역', full: '말씀 전체화면', widget: '말씀 위젯',
    tile: 'Sweeter 타일', bible: '성경 화면', 'bible-menu': '성경 절 메뉴', map: '기도 지도', focus: '한 장씩 기도하기', manual: '직접 적은 기도 시간'
  };
  const SLOTS = [['새벽', 4, 7], ['아침', 7, 10], ['낮', 10, 14], ['오후', 14, 18], ['저녁', 18, 22], ['밤', 22, 28]];
  const WK = ['일', '월', '화', '수', '목', '금', '토'];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const p2 = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const parse = s => { const a = String(s).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const add = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
  const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const weekStart = s => { const d = parse(s); return add(s, -((d.getDay() + 6) % 7)); };   // 월요일부터
  const monthStart = s => s.slice(0, 8) + '01';
  const monthEnd = s => { const d = parse(monthStart(s)); return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
  function dur(sec) {
    const m = Math.round((sec || 0) / 60), h = Math.floor(m / 60), mm = m % 60;
    if (!sec) return '0분';
    if (m < 1) return '1분 미만';
    return (h ? h + '시간' : '') + (h && mm ? ' ' : '') + (mm ? mm + '분' : '');
  }
  const hm = sec => { const m = Math.round((sec || 0) / 60); return Math.floor(m / 60) + ':' + p2(m % 60); };

  // ── 모으기: 두 기록 → 한 모양 [{date,t,time,d,app,src,label}] ──
  function collect(thereLog, prayLog) {
    const out = [];
    Object.keys(thereLog || {}).forEach(date => {
      if (!isDate(date)) return;
      (thereLog[date] || []).forEach(en => {
        if (!en) return;
        const d = Math.max(0, Math.round(+en.d || 0)); if (!d) return;
        const src = String(en.src || '');
        const app = (src === 'bible' || src === 'bible-menu') ? 'bible' : (en.app === 'sweeter' ? 'sweeter' : 'block7');
        out.push({ date: date, t: +en.t || 0, time: en.time || '', d: d, app: app, src: src, ref: en.ref || '' });
      });
    });
    Object.keys(prayLog || {}).forEach(date => {
      if (!isDate(date)) return;
      const L = prayLog[date] || {};
      let seen = 0;
      (Array.isArray(L.ses) ? L.ses : []).forEach(e => {
        if (!e) return;
        const d = Math.max(0, Math.round(+e.d || 0)); if (!d) return;
        seen += d;
        out.push({ date: date, t: +e.t || 0, time: e.time || '', d: d, app: 'pray', src: String(e.src || ''), ref: '', id: String(e.id || '') });
      });
      const rest = Math.round(+L.s || 0) - seen;
      if (rest > 0) out.push({ date: date, t: 0, time: '', d: rest, app: 'pray', src: '', ref: '', old: true });
    });
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || ((a.t || 0) - (b.t || 0)));
    return out;
  }
  // Map 기도 — 한 번 누른 것(같은 a · k)을 한 줄로: [{date,time,k,names,d}]
  function mapPrayers(prayLog, from, to) {
    const out = [];
    Object.keys(prayLog || {}).forEach(date => {
      if (!isDate(date) || (from && date < from) || (to && date > to)) return;
      const mp = (prayLog[date] || {}).mp; if (!Array.isArray(mp)) return;
      const by = {};
      mp.forEach(e => {
        if (!e) return;
        const d = Math.max(0, Math.round(+e.d || 0));
        const key = (+e.a || +e.t || 0) + '|' + (e.k || e.n || '');
        const o = by[key] || (by[key] = { date: date, t: +e.a || +e.t || 0, k: String(e.k || e.n || '이름 없음'), names: [], d: 0, ids: [] });
        o.d += d; if (e.id) o.ids.push(String(e.id)); if (e.n && o.names.indexOf(e.n) < 0) o.names.push(String(e.n));
      });
      Object.keys(by).forEach(x => { const o = by[x]; if (o.t) { const dt = new Date(o.t); o.time = p2(dt.getHours()) + ':' + p2(dt.getMinutes()); } else o.time = ''; out.push(o); });
    });
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.t - b.t));
    return out;
  }
  // 한 장 기도 카드 — 날짜 · 처음 본 차례대로 [{date,time,n,k,d,amen}]
  function focusPrayers(prayLog, from, to) {
    const out = [];
    Object.keys(prayLog || {}).forEach(date => {
      if (!isDate(date) || (from && date < from) || (to && date > to)) return;
      const fc = (prayLog[date] || {}).fc; if (!Array.isArray(fc)) return;
      fc.forEach(e => {
        if (!e) return;
        const d = Math.max(0, Math.round(+e.d || 0)), a = +e.a || +e.t || 0;
        let time = ''; if (a) { const dt = new Date(a); time = p2(dt.getHours()) + ':' + p2(dt.getMinutes()); }
        out.push({ date: date, t: a, time: time, n: String(e.n || '이름 없음'), k: String(e.k || ''), d: d, amen: !!e.amen, id: String(e.id || '') });
      });
    });
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.t - b.t));
    return out;
  }
  // 하루의 흐름 (HB 1028-3 6-2a) — 그날 기록을 시간 순서 한 줄로: [{x: collect 한 줄 | null, kids:[이름]}]
  //   기도노트의 기도 한 번(ses)에는 그 안의 이름을 접어 넣는다 — 따로 나오던 'Map 기도' · '한 장 기도' 목록을 대신한다:
  //     한 장 카드(fc) = fc.s 가 그 한 번의 id · Map 기도(mp) = 그 지도 There 가 시작한 때부터 다음 지도 There 가 시작하기 전까지 누른 것
  //     (기도노트 sesKids 와 같은 잣대). mp 는 한 번 누른 것(같은 시작 · 같은 이름)이 한 줄이다 — mapPrayers 와 같다.
  //   어느 기도에도 안 붙는 이름(날을 넘긴 기도 · 지운 기도의 옛 조각)은 버리지 않고 끝에 x:null 한 줄로 모은다.
  //   kid = {kind:'fc'|'mp', ids, n, k, names, d, amen, t}
  function dayFlow(ss, prayLog, date) {
    const L = (prayLog || {})[date] || {}, sec = v => Math.max(0, Math.round(+v || 0));
    const fcAll = (Array.isArray(L.fc) ? L.fc : []).filter(Boolean), mpAll = (Array.isArray(L.mp) ? L.mp : []).filter(Boolean);
    const day = ss.filter(x => x.date === date).slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99') || ((a.t || 0) - (b.t || 0)));
    const mapStarts = day.filter(x => x.app === 'pray' && x.src === 'map' && x.t).map(x => x.t).sort((a, b) => a - b);
    const used = new Set(), aOf = e => +e.a || +e.t || 0;
    const fcKid = e => ({ kind: 'fc', ids: [String(e.id || '')], n: String(e.n || '이름 없음'), k: String(e.k || ''), names: [], d: sec(e.d), amen: !!e.amen, t: aOf(e) });
    const mpKids = list => {
      const by = {}, out = [];
      list.forEach(e => {
        const key = aOf(e) + '|' + (e.k || e.n || '');
        let o = by[key];
        if (!o) { o = by[key] = { kind: 'mp', ids: [], n: String(e.k || e.n || '이름 없음'), k: '', names: [], d: 0, amen: false, t: aOf(e) }; out.push(o); }
        o.d += sec(e.d); if (e.id) o.ids.push(String(e.id)); if (e.n && o.names.indexOf(String(e.n)) < 0) o.names.push(String(e.n));
      });
      return out;
    };
    const byT = (a, b) => a.t - b.t;
    const rows = day.map(x => {
      let kids = [];
      if (x.app === 'pray' && x.id) {
        if (x.src === 'map') {
          const nx = mapStarts.find(t => t > x.t) || Infinity;
          const m = mpAll.filter(e => !used.has(e) && aOf(e) >= x.t && aOf(e) < nx); m.forEach(e => used.add(e)); kids = mpKids(m);
        }
        const f = fcAll.filter(e => !used.has(e) && e.s === x.id); f.forEach(e => used.add(e)); kids = kids.concat(f.map(fcKid));
      }
      return { x: x, kids: kids.sort(byT) };
    });
    const lf = fcAll.filter(e => !used.has(e)), lm = mpAll.filter(e => !used.has(e));
    if (lf.length || lm.length) rows.push({ x: null, kids: lf.map(fcKid).concat(mpKids(lm)).sort(byT) });
    return rows;
  }
  // 잇달아 한 기도 합치기 (HB 2026-10-29 '한 장씩 기도하기가 너무 많이 보인다') — 한 장 기도를 잠깐 닫았다 다시 열면 기록이 한 번씩 따로 생긴다.
  //   흐름에서는 **같은 갈래(한 장 · 지도 There)가 사이에 다른 기록 없이 이어지고, 앞 기도가 끝난 뒤 gap 안에 다시 시작했으면** 한 덩어리로 보인다.
  //   기록은 그대로다(보여 주기만). 합친 줄 = { x: 첫 줄을 바탕으로 d 는 합 · ids 는 모두, xs: 원래 줄들, kids: 같은 이름은 한 칩(시간 합 · 아멘 하나라도) }
  function mergeFlow(rows, gapMs) {
    const gap = gapMs == null ? 60 * 60000 : gapMs, out = [];
    const can = (a, b) => a && b && a.x && b.x && a.x.app === 'pray' && b.x.app === 'pray' && a.x.id && b.x.id && a.x.src === b.x.src && (a.x.src === 'focus' || a.x.src === 'map') &&
      b.x.t && a.x.t && b.x.t - (a.last + a.dsum * 1000) <= gap;
    rows.forEach(r => {
      const prev = out[out.length - 1];
      const cur = { x: r.x, xs: r.x ? [r.x] : [], kids: r.kids.slice(), last: r.x ? r.x.t : 0, dsum: r.x ? r.x.d : 0 };
      if (can(prev, cur)) { prev.xs.push(r.x); prev.kids = prev.kids.concat(r.kids); prev.last = r.x.t; prev.dsum = r.x.d; return; }
      out.push(cur);
    });
    return out.map(m => {
      if (m.xs.length < 2) return { x: m.x, xs: m.xs, kids: m.kids };
      const kids = [], by = {};
      m.kids.forEach(k => { const key = k.kind + '|' + k.n, o = by[key];
        if (!o) { by[key] = Object.assign({}, k, { ids: k.ids.slice(), names: k.names.slice() }); kids.push(by[key]); return; }
        o.d += k.d; o.amen = o.amen || k.amen; o.ids = o.ids.concat(k.ids); k.names.forEach(n => { if (o.names.indexOf(n) < 0) o.names.push(n); }); });
      return { x: Object.assign({}, m.xs[0], { d: m.xs.reduce((a, x) => a + x.d, 0), ids: m.xs.map(x => x.id) }), xs: m.xs, kids: kids };
    });
  }
  // 말씀(BLOCK7 · Sweeter · 성경) / 기도(기도노트) 두 갈래 합 (HB 1028-3 6-2a — 세 앱 같이)
  function wordPray(ss) { let word = 0, pray = 0; ss.forEach(x => { if (x.app === 'pray') pray += x.d; else word += x.d; }); return { word: word, pray: pray }; }
  const WP = [['word', '말씀', '#a892d6'], ['pray', '기도', '#5b8fcc']];
  function wpLegend(ss) {
    const o = wordPray(ss), tot = o.word + o.pray; if (!tot) return '';
    const on = WP.filter(a => o[a[0]] > 0);
    return '<div class="tdash-bar">' + on.map(a => '<i style="display:block;flex:0 0 ' + (o[a[0]] / tot * 100).toFixed(2) + '%;background:' + a[2] + '"></i>').join('') + '</div>' +
      '<div class="tdash-leg">' + on.map(a => '<div><span><i class="tdash-dot" style="background:' + a[2] + '"></i>' + a[1] + '</span><b>' + hm(o[a[0]]) + '</b></div>').join('') + '</div>';
  }
  // 기도 항목 이름 — 부른 쪽(기도노트)이 아는 이름이면 누를 수 있게 (HB 2026-10-27 P3′-2):
  //   톡 = 상세(opts.item.open) · 길게 · 우클릭 = 그 항목부터 한 장씩 기도(opts.item.pray). 모르는 이름 · BLOCK7 · Sweeter 는 글자 그대로
  const itemName = (S, n, tag) => S.item && S.item.has(n) ? '<' + tag + ' class="tdash-item" data-td="item" data-v="' + esc(n) + '">' + esc(n) + '</' + tag + '>' : '<' + tag + '>' + esc(n) + '</' + tag + '>';
  // 고칠 수 있는 줄 (HB 1028-3 5-1 · 5-2) — 부른 쪽이 opts.edit 를 주면(기도노트) 기도노트 기록 줄만:
  //   톡 = 고치기(edit.open) · 왼쪽으로 밀기 = 지우기(edit.del). 이름 글자(tdash-item)를 누르면 예전대로 상세.
  //   BLOCK7 · Sweeter · 성경 줄은 그 앱 것이라 여기서 못 고친다.
  const edRow = (S, kind, date, ids, inner, cls) => S.edit && ids
    ? '<div class="tdash-sw"><div class="' + (cls || 'tdash-ses') + ' tdash-ed" data-ed="' + kind + '" data-d="' + esc(date) + '" data-v="' + esc(ids) + '">' + inner + '</div></div>'
    : '<div class="' + (cls || 'tdash-ses') + '">' + inner + '</div>';
  // 기간 안의 Map 기도 · 한 장 기도를 이름마다 모아 오래 한 순서로
  function mapTop(S, a, b, n) {
    const m = {}; const put = (k, d) => { const o = m[k] || (m[k] = { s: 0, n: 0 }); o.s += d; o.n++; };
    mapPrayers(S.data.prayLog, a, b).forEach(x => put(x.k, x.d));
    focusPrayers(S.data.prayLog, a, b).forEach(x => put(x.n, x.d));
    const ks = Object.keys(m).sort((x, y) => m[y].s - m[x].s).slice(0, n || 5);
    if (!ks.length) return '';
    return '<div class="tdash-sec"><h4 style="color:#5b8fcc">무엇을 위해 기도했나 <span style="font-weight:400;color:var(--tx3);letter-spacing:0">· Map 기도 · 한 장 기도</span></h4>' +
      ks.map(k => '<div class="tdash-li">' + itemName(S, k, 'span') + '<small>' + dur(m[k].s) + ' · ' + m[k].n + '번</small></div>').join('') + '</div>';
  }
  // 날마다 합계 {date:{s, by:{app:초}}}
  function dayTotals(ss) {
    const m = {};
    ss.forEach(x => { const o = m[x.date] || (m[x.date] = { s: 0, by: {} }); o.s += x.d; o.by[x.app] = (o.by[x.app] || 0) + x.d; });
    return m;
  }
  const inRange = (ss, a, b) => ss.filter(x => x.date >= a && x.date <= b);
  function sumBy(ss, key) { const m = {}; ss.forEach(x => { const k = key(x); if (k == null) return; const o = m[k] || (m[k] = { s: 0, n: 0 }); o.s += x.d; o.n++; }); return m; }
  const total = ss => ss.reduce((a, x) => a + x.d, 0);
  function slotOf(x) {
    const mm = /^(\d{1,2}):(\d{2})/.exec(x.time || ''); if (!mm) return -1;
    let h = +mm[1]; if (h < 4) h += 24;
    return SLOTS.findIndex(s => h >= s[1] && h < s[2]);
  }
  function srcName(x) {
    if (x.app === 'pray') return x.old ? '기도노트 (시간만 남은 기록)' : (SRC[x.src] || '기도노트');
    return SRC[x.src] || (APP[x.app].name + ' (어디서 모름)');
  }

  // ── 그리기 ──
  const CSS = `
.tdash{--bg:#0d0e10;--s1:#15171b;--s2:#22252b;--bd:#1f2126;--tx:#ece8e0;--tx2:#a9a59d;--tx3:#7f7b73;
  background:var(--bg);color:var(--tx);font-family:'Noto Sans KR','Apple SD Gothic Neo',system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  word-break:keep-all;line-height:1.45;font-size:14px}
.tdash *{box-sizing:border-box}
.tdash button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.tdash-in{max-width:560px;margin:0 auto;padding:4px 20px 48px;display:flex;flex-direction:column;gap:22px;touch-action:pan-y}
.tdash-pane{display:flex;flex-direction:column;gap:22px}
.tdash-rest:empty{display:none}
/* 탭 · 날짜 · 요약은 세로로 밀어도 올라가지 않는다 (HB 2026-10-15) — 전체 화면은 위 THERE 줄 높이(--tdtop)만큼 아래에 붙는다 */
/* 바탕은 양옆 여백(20px)까지 칠한다 (HB 2026-10-25 아이폰 사진 '(' 자국) — 안 칠하면 달력 맨 왼쪽 칸의 오늘 테두리(칸 밖 3.5px)가
   밀려 올라가며 그 여백으로 비쳐, 큰 숫자 왼쪽에 '(' 처럼 남았다 */
.tdash-stick{position:sticky;top:var(--tdtop,0px);z-index:1;background:var(--bg);display:flex;flex-direction:column;gap:22px;margin:0 -20px;padding:0 20px 12px}
.tdash-stick::after{content:"";position:absolute;left:0;right:0;bottom:-14px;height:14px;background:linear-gradient(var(--bg),rgba(13,14,16,0));pointer-events:none}
.tdash-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.97);width:max-content;max-width:min(86vw,440px);padding:24px 34px;border-radius:18px;
  /* 기도 쪽이라 명조로 격식 있게, 상자는 살짝 비치는 유리 (HB 2026-10-15) */
  background:rgba(38,41,48,.55);-webkit-backdrop-filter:blur(22px) saturate(1.5);backdrop-filter:blur(22px) saturate(1.5);
  color:#b9b4aa;font:400 17.5px/1.85 'Noto Serif KR','Nanum Myeongjo','AppleMyungjo','Batang','Times New Roman',serif;letter-spacing:.01em;text-align:center;word-break:keep-all;opacity:0;pointer-events:none;
  border:1px solid rgba(255,255,255,.16);box-shadow:0 14px 44px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.14);transition:opacity .45s cubic-bezier(.4,0,.2,1),transform .45s cubic-bezier(.4,0,.2,1);z-index:100001}
.tdash-toast b{color:#f4f0e8;font-weight:700}
.tdash-toast small{display:block;margin-top:8px;font-size:14px;color:#8d887e}
.tdash-toast.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.tdash-item{cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.tdash-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.tdash-seg{display:flex;gap:2px;background:var(--s1);border-radius:10px;padding:3px}
.tdash-seg button{font-size:12.5px;color:var(--tx3);padding:6px 12px;border-radius:8px}
.tdash-seg button.on{background:#272a32;color:var(--tx);font-weight:500}
.tdash-seg button{position:relative;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.tdash-seg button.pin::before{content:"";position:absolute;top:2px;left:50%;width:3.5px;height:3.5px;margin-left:-1.75px;border-radius:50%;background:#dab87a}
.tdash-nav{display:flex;align-items:center;justify-content:space-between}
.tdash-nav button{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--tx2)}
.tdash-nav button[disabled]{opacity:.25;cursor:default}
.tdash-nav svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tdash-nav b{font-size:16px;font-weight:500;text-align:center;display:block}
.tdash-nav small{display:block;text-align:center;font-size:12.5px;color:var(--tx2)}
.tdash-big{display:flex;align-items:baseline;gap:4px}
.tdash-big i{font-style:normal;font-size:46px;font-weight:300;letter-spacing:-.02em;line-height:1.1}
.tdash-big em{font-style:normal;font-size:15px;color:var(--tx2);margin-right:6px}
.tdash-cmp{font-size:12.5px;color:#8fc79a}
.tdash-cmp.dn{color:var(--tx3)}
.tdash-bar{display:flex;height:10px;border-radius:5px;overflow:hidden;gap:2px;background:var(--s1)}
.tdash-leg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}
.tdash-leg span{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tx2)}
.tdash-leg b{display:block;font-size:17px;font-weight:400;margin-top:1px}
.tdash-dot{width:8px;height:8px;border-radius:4px;display:inline-block;flex-shrink:0}
.tdash-card{background:var(--s1);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px}
.tdash-ct{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:500}
.tdash-ct small{font-size:11.5px;color:var(--tx3);font-weight:400}
.tdash-cols{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:9px;height:150px;align-items:end}
.tdash-col{height:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;border-radius:4px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.tdash-col i{display:block;border-radius:3px;min-height:3px}
.tdash-col.z i{background:#2a2d34}
.tdash-col.on{outline:1px solid #3a3d45;outline-offset:4px}
.tdash-lbl{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:9px;text-align:center;font-size:11.5px;color:var(--tx3)}
.tdash-lbl .on{color:var(--tx);font-weight:500}
.tdash-sec{display:flex;flex-direction:column}
.tdash-sec h4{margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:.06em}
.tdash-li{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd);font-size:14.5px}
.tdash-li:last-child{border-bottom:0}
.tdash-li small{font-size:13px;color:var(--tx2);white-space:nowrap}
.tdash-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.tdash-cal .w{font-size:11px;color:var(--tx3);text-align:center}
.tdash-cal button,.tdash-cal span.x{aspect-ratio:1;border-radius:8px;font-size:11px;padding:5px;text-align:left;vertical-align:top;display:block}
.tdash-cal button.f{border:1px dashed #24272d;color:#3e3c38;cursor:default}
.tdash-cal button.t{outline:1.5px solid var(--tx);outline-offset:2px}
.tdash-hm{display:flex;align-items:center;gap:4px;justify-content:flex-end;font-size:11px;color:var(--tx3)}
.tdash-hm i{width:14px;height:14px;border-radius:4px;display:block}
.tdash-src{display:grid;grid-template-columns:minmax(0,128px) minmax(0,1fr) 44px;align-items:center;gap:10px;font-size:12.5px}
.tdash-src span:first-child{color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tdash-src span:last-child{text-align:right}
.tdash-trk{height:8px;background:var(--s2);border-radius:4px;overflow:hidden}
.tdash-trk i{display:block;height:100%;border-radius:4px}
.tdash-slots{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;height:110px;align-items:end}
.tdash-slots i{display:block;border-radius:4px;background:#5b8fcc;min-height:3px}
.tdash-slbl{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;text-align:center;font-size:11px;color:var(--tx3);line-height:1.35}
.tdash-tl{position:relative;height:34px;background:var(--s1);border-radius:8px;overflow:hidden}
.tdash-tl i{position:absolute;top:6px;bottom:6px;border-radius:4px;min-width:3px}
.tdash-tlh{display:flex;justify-content:space-between;font-size:11px;color:var(--tx3);margin-top:6px}
.tdash-ses{display:grid;grid-template-columns:48px 4px minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--bd)}
.tdash-ses:last-child{border-bottom:0}
.tdash-ses>span:first-child{font-size:13px;color:var(--tx2);font-variant-numeric:tabular-nums}
.tdash-ses>i{width:4px;height:34px;border-radius:2px;display:block}
.tdash-ses b{display:block;font-size:14.5px;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tdash-ses small{display:block;font-size:12px;color:var(--tx3)}
.tdash-ses em{font-style:normal;font-size:14px;font-variant-numeric:tabular-nums}
/* 고칠 수 있는 줄 — 왼쪽으로 밀면 뒤의 '지우기' 가 드러난다 (HB 1028-3 5-1) */
/* 흐름 (1028-3 6-2a) — 기도 한 번(tdash-ses)과 그 아래 이름(tdash-kid)이 한 덩어리(tdash-blk), 줄은 덩어리 끝에만 */
.tdash-blk{border-bottom:1px solid var(--bd);padding-bottom:4px}
.tdash-blk .tdash-ses{border-bottom:0}
.tdash-kid{display:grid;grid-template-columns:48px 4px minmax(0,1fr) auto;gap:12px;align-items:center;padding:6px 0;position:relative;background:var(--bg)}
.tdash-kid>i{align-self:stretch;justify-self:center;width:2px;border-radius:1px;background:#2a3446}
.tdash-kn{font-size:13.5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tdash-kn small{margin-left:7px;font-size:12px;color:var(--tx3)}
.tdash-kid em{font-style:normal;font-size:12.5px;color:var(--tx2);font-variant-numeric:tabular-nums}
.tdash-kid.lo .tdash-kn{color:var(--tx2)}
.tdash-am{display:inline-block;width:5px;height:5px;border-radius:3px;background:#dab87a;margin-left:7px;vertical-align:2px}
.tdash-sw{position:relative;overflow:hidden}
/* 부른 쪽 칸 (기도노트 1028-3 6-2b) — 그룹 줄 · 점 · 이름 옆 글 */
.tdash-gr{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--bd);cursor:pointer;-webkit-tap-highlight-color:transparent}
.tdash-gr b{font-weight:400;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tdash-gr.sub b{padding-left:14px;font-size:13.5px;color:var(--tx2)}
.tdash-gr.sub b::before{content:"└ ";color:var(--tx3)}
.tdash-gr em{font-style:normal;font-size:12.5px;color:var(--tx2);font-variant-numeric:tabular-nums;white-space:nowrap}
.tdash-dots{display:flex;gap:4px}
.tdash-dots i{width:8px;height:8px;border-radius:4px;background:#2a2d33}
.tdash-dots i.on{background:#5b8fcc}
.tdash-gbar{display:block;width:64px;height:6px;border-radius:3px;background:#2a2d33;overflow:hidden}
.tdash-gbar i{display:block;height:100%;background:#5b8fcc}
.tdash-what{margin-left:7px;font-size:12.5px;color:var(--tx3)}
.tdash-li .soon{color:#dab87a}
.tdash-fold{margin-left:auto;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:400;letter-spacing:0;color:var(--tx3);padding:4px 0 4px 10px}
.tdash-fold svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tdash-sw::before{content:"지우기";position:absolute;inset:0 0 1px 0;display:flex;align-items:center;justify-content:flex-end;padding-right:18px;background:#5a2a2a;color:#f1d6d2;font-size:13px}
.tdash-ed{position:relative;background:var(--bg);cursor:pointer;-webkit-tap-highlight-color:transparent;will-change:transform}
.tdash-note{font-size:11.5px;color:#6c6962;line-height:1.6}
.tdash-empty{padding:28px 0;text-align:center;color:var(--tx3);font-size:13.5px}
.tdash-ov{position:fixed;inset:0;z-index:99990;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  padding:0 0 env(safe-area-inset-bottom,0px);opacity:0;transform:translateY(10px);transition:opacity .22s,transform .22s}
.tdash-ov.in{opacity:1;transform:none}
/* 위 시계 줄(안전 영역)은 THERE 줄이 제 바탕으로 덮는다 (HB 2026-10-25 아이폰 '맨 위 구멍').
   ⚠️ 예전엔 안전 영역을 .tdash-ov 의 padding-top 으로 비웠다 — 스크롤 상자의 여백은 내용과 함께 밀려 올라가는 자리라
      아래로 밀면 달력이 시계 줄 뒤로 비쳤고, 아이폰 사파리는 sticky top:0 을 그 여백 아래(47pt)에 붙여 틈이 그대로 남았다. */
.tdash-top{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:calc(10px + env(safe-area-inset-top,0px)) 10px 6px 20px}
/* 열려 있는 동안 페이지 바탕도 대시보드 색으로 (HB 2026-10-25 '하단에 색 다른 것') — 아이폰 홈 화면 앱(iOS 26)은 웹 화면 아래에
   iOS 몫 띠가 붙고, 그 띠는 **페이지 바탕색**(html 위에 body 를 겹친 색)으로 칠해지는 것으로 본다 — 기도노트 '아래 띠 4차' 에서
   body 를 메뉴색으로 바꾸자 띠가 따라왔다. 화면을 다 덮은 대시보드는 띠에 안 닿는다 →
   기도노트는 body 를 아래 메뉴색으로 칠해 두어(.iosgap) 대시보드 아래로 남청색 띠가 보였다. BLOCK7 의 html.vf-open 과 같은 길 */
html.tdash-on,html.tdash-on body{background:#0d0e10 !important}
.tdash-logo{display:flex;align-items:baseline;gap:10px}
.tdash-logo b{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:28px;letter-spacing:.16em}
.tdash-logo span{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:15px;color:var(--tx3)}
.tdash-x{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--tx2)}
.tdash-x svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
`;
  let TOAST = null, TOAST_TM = 0;
  function injectCSS() {
    if (document.getElementById('tdash-css')) return;
    const st = document.createElement('style'); st.id = 'tdash-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  const CHEV = d => '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="' + (d < 0 ? '15 6 9 12 15 18' : '9 6 15 12 9 18') + '"></polyline></svg>';
  const appsIn = by => APPS.filter(a => by[a[0]]);

  function legend(by, tot) {
    if (!tot) return '';
    return '<div class="tdash-bar">' + appsIn(by).map(a => '<i style="display:block;flex:0 0 ' + (by[a[0]] / tot * 100).toFixed(2) + '%;background:' + a[2] + '"></i>').join('') + '</div>' +
      '<div class="tdash-leg">' + appsIn(by).map(a => '<div><span><i class="tdash-dot" style="background:' + a[2] + '"></i>' + esc(a[1]) + '</span><b>' + hm(by[a[0]]) + '</b></div>').join('') + '</div>';
  }
  function bigNum(sec) {
    const m = Math.round(sec / 60), h = Math.floor(m / 60), mm = m % 60;
    return '<div class="tdash-big">' + (h ? '<i>' + h + '</i><em>시간</em>' : '') + '<i>' + mm + '</i><em>분</em></div>';
  }
  function cmpLine(now, before, word) {
    if (!before && !now) return '';
    const d = now - before;
    if (Math.abs(d) < 60) return '<span class="tdash-cmp dn">' + word + '과 비슷합니다</span>';
    return '<span class="tdash-cmp' + (d < 0 ? ' dn' : '') + '">' + word + '보다 ' + dur(Math.abs(d)) + (d > 0 ? ' 더' : ' 적게') + '</span>';
  }
  function topRefs(ss, label) {
    const m = sumBy(ss.filter(x => x.ref), x => x.ref);
    const ks = Object.keys(m).sort((a, b) => m[b].s - m[a].s).slice(0, 3);
    if (!ks.length) return '';
    return '<div class="tdash-sec"><h4 style="color:#dab87a">가장 오래 머문 말씀</h4>' +
      ks.map(k => '<div class="tdash-li"><span>' + esc(label(k)) + '</span><small>' + dur(m[k].s) + ' · ' + m[k].n + '번</small></div>').join('') + '</div>';
  }
  function bySrc(ss) {
    const m = sumBy(ss, x => x.app + '|' + srcName(x));
    const ks = Object.keys(m).sort((a, b) => m[b].s - m[a].s);
    if (!ks.length) return '';
    const max = m[ks[0]].s;
    return '<div class="tdash-card"><div class="tdash-ct">어디서 시작했나</div><div style="display:flex;flex-direction:column;gap:10px">' +
      ks.map(k => { const ap = k.split('|')[0], nm = k.slice(ap.length + 1); return '<div class="tdash-src"><span title="' + esc(nm) + '">' + esc(nm) + '</span><div class="tdash-trk"><i style="width:' + Math.max(3, m[k].s / max * 100).toFixed(1) + '%;background:' + APP[ap].color + '"></i></div><span>' + hm(m[k].s) + '</span></div>'; }).join('') +
      '</div></div>';
  }
  function bySlot(ss) {
    const v = SLOTS.map(() => 0); ss.forEach(x => { const k = slotOf(x); if (k >= 0) v[k] += x.d; });
    const max = Math.max.apply(null, v); if (!max) return '';
    const best = v.indexOf(max);
    return '<div class="tdash-card"><div class="tdash-ct">언제 머무나</div><div class="tdash-slots">' +
      v.map((x, i) => '<i style="height:' + Math.max(2, x / max * 100).toFixed(1) + '%;opacity:' + (x ? (0.45 + 0.55 * x / max).toFixed(2) : '.25') + '"></i>').join('') + '</div>' +
      '<div class="tdash-slbl">' + SLOTS.map((s, i) => '<span' + (i === best ? ' style="color:var(--tx)"' : '') + '>' + s[0] + '<br>' + s[1] % 24 + '–' + (s[2] % 24 || 24) + '</span>').join('') + '</div>' +
      '<span style="font-size:12.5px;color:var(--tx2)">' + SLOTS[best][0] + ' ' + SLOTS[best][1] % 24 + '시–' + SLOTS[best][2] % 24 + '시에 가장 오래 머뭅니다.</span></div>';
  }

  function viewWeek(S) {
    const a = weekStart(S.at), b = add(a, 6), ss = inRange(S.ss, a, b), tot = total(ss);
    const prev = total(inRange(S.ss, add(a, -7), add(a, -1)));
    const dt = dayTotals(ss), by = {}; ss.forEach(x => { by[x.app] = (by[x.app] || 0) + x.d; });
    const days = Array.from({ length: 7 }, (_, i) => add(a, i));
    const max = Math.max(1, ...days.map(d => (dt[d] || {}).s || 0));
    const pa = parse(a), pb = parse(b);
    let h = nav(S, (pa.getMonth() + 1) + '월 ' + pa.getDate() + '일 – ' + (pb.getMonth() + 1 !== pa.getMonth() + 1 ? (pb.getMonth() + 1) + '월 ' : '') + pb.getDate() + '일', '머문 날 ' + days.filter(d => dt[d]).length + ' / 7', b >= S.today);
    h += '<div style="display:flex;flex-direction:column;gap:4px">' + bigNum(tot) + cmpLine(tot, prev, '지난주') + '</div>' + FIX;
    if (!tot) return h + '<div class="tdash-empty">이 주에는 기록이 없습니다</div>';
    h += '<div style="display:flex;flex-direction:column;gap:12px">' + legend(by, tot) + '</div>';
    h += '<div class="tdash-card"><div class="tdash-ct">날마다<small>막대를 누르면 그날</small></div><div class="tdash-cols">' + days.map(d => {
      const o = dt[d];
      const inner = o ? APPS.slice().reverse().filter(x => o.by[x[0]]).map(x => '<i style="height:' + (o.by[x[0]] / max * 134).toFixed(1) + 'px;background:' + x[2] + '"></i>').join('') : '<i></i>';
      // ⚠️ 단추(button) 태그가 아니라 div 에 role=button — 아이폰(WebKit)은 단추 안을 내용 폭으로 줄여 그려, 글자 없는 막대가 폭 0 이 되어 안 보였다 (HB 2026-10-29 사진)
      return '<div role="button" tabindex="0" class="tdash-col' + (o ? '' : ' z') + (d === S.today ? ' on' : '') + '" data-td="day" data-v="' + d + '" aria-label="' + d + ' ' + (o ? dur(o.s) : '기록 없음') + '">' + inner + '</div>';
    }).join('') + '</div><div class="tdash-lbl">' + days.map(d => '<span' + (d === S.today ? ' class="on"' : '') + '>' + (parse(d).getDay() === 0 ? '주일' : WK[parse(d).getDay()]) + '</span>').join('') + '</div></div>';
    h += topRefs(ss, S.refLabel);
    const pm = sumBy(ss.filter(x => x.app === 'pray'), srcName), pk = Object.keys(pm).sort((x, y) => pm[y].s - pm[x].s);
    if (pk.length) h += '<div class="tdash-sec"><h4 style="color:#5b8fcc">기도노트</h4>' + pk.map(k => '<div class="tdash-li"><span>' + esc(k) + '</span><small>' + dur(pm[k].s) + ' · ' + pm[k].n + '번</small></div>').join('') + '</div>';
    h += mapTop(S, a, b, 5);
    return h;
  }
  // 위쪽 고정 영역의 끝 표시 — 이 앞(탭 · 날짜 · 요약)은 세로로 밀어도 올라가지 않고, 뒤는 밀린다 (HB 2026-10-15)
  const FIX = '<!--tdfix-->', NAVEND = '<!--tdnav-->';   // NAVEND 앞(날짜 줄)은 밀어 넘길 때도 움직이지 않는다
  const HEAT = ['#17191d', '#2a3646', '#3b4e66', '#4f86c6', '#9cc0e8'];
  function heat(s, max) { if (!s) return 0; const r = s / max; return r > .75 ? 4 : r > .45 ? 3 : r > .2 ? 2 : 1; }
  function viewMonth(S) {
    const a = monthStart(S.at), b = monthEnd(S.at), ss = inRange(S.ss, a, b), tot = total(ss), dt = dayTotals(ss);
    const pd = parse(a), pmA = monthStart(add(a, -1)), prev = total(inRange(S.ss, pmA, add(a, -1)));
    const days = []; for (let d = a; d <= b; d = add(d, 1)) days.push(d);
    const upto = days.filter(d => d <= S.today).length;
    let h = nav(S, pd.getFullYear() + '년 ' + (pd.getMonth() + 1) + '월', '머문 날 ' + days.filter(d => dt[d]).length + ' / ' + upto, b >= S.today);
    h += '<div style="display:flex;flex-direction:column;gap:4px">' + bigNum(tot) + cmpLine(tot, prev, '지난달') + '</div>' + FIX;
    const max = Math.max(1, ...days.map(d => (dt[d] || {}).s || 0));
    let g = WK.map(w => '<span class="w">' + w + '</span>').join('');
    for (let k = 0; k < pd.getDay(); k++) g += '<span class="x"></span>';
    days.forEach(d => {
      const o = dt[d], lv = heat(o ? o.s : 0, max), fut = d > S.today;
      g += fut ? '<button class="f" disabled>' + parse(d).getDate() + '</button>'
        : '<button data-td="day" data-v="' + d + '" class="' + (d === S.today ? 't' : '') + '" style="background:' + HEAT[lv] + ';color:' + (lv >= 3 ? '#0d0e10' : lv ? '#cfd8e3' : '#5d5a54') + (lv >= 3 ? ';font-weight:600' : '') + '" aria-label="' + d + ' ' + (o ? dur(o.s) : '기록 없음') + '">' + parse(d).getDate() + '</button>';
    });
    h += '<div style="display:flex;flex-direction:column;gap:6px"><div class="tdash-cal">' + g + '</div><div class="tdash-hm"><span style="margin-right:4px">적게</span>' + HEAT.map(c => '<i style="background:' + c + '"></i>').join('') + '<span style="margin-left:4px">많이</span></div></div>';
    if (!tot) return h + '<div class="tdash-empty">이 달에는 기록이 없습니다</div>';
    const by = {}; ss.forEach(x => { by[x.app] = (by[x.app] || 0) + x.d; });
    h += '<div style="display:flex;flex-direction:column;gap:12px">' + legend(by, tot) + '</div>';
    h += bySrc(ss) + bySlot(ss) + mapTop(S, a, b, 7);
    if (ss.some(x => (x.app === 'block7' && !x.src) || x.old)) h += '<span class="tdash-note">10월 12일 전 기록은 \'어디서\' 가 남아 있지 않아 따로 모았습니다.</span>';
    return h;
  }
  function viewDay(S) {
    const d = S.at, ss = inRange(S.ss, d, d), tot = total(ss), pd = parse(d);
    // 부른 쪽이 더 보여 줄 칸(기도노트: 오늘 기도한 이름 · 다가오는 날 · 오래 못 한 기도 · 감사) — 기록이 없는 날에도 보인다
    const ex = S.extra ? (S.extra(d, d === S.today) || '') : '';
    // 고정 영역은 날짜 줄까지만 — 시간 막대 · 말씀/기도 막대도 함께 밀려 올라간다 (HB 2026-10-29: 고정 영역이 화면을 너무 많이 가렸다)
    let h = nav(S, (pd.getMonth() + 1) + '월 ' + pd.getDate() + '일 ' + (pd.getDay() ? WK[pd.getDay()] + '요일' : '주일'), (tot ? dur(tot) + ' · ' + ss.length + '번' : '기록 없음'), d >= S.today) + FIX;
    if (!tot) return h + '<div class="tdash-empty">이날은 기록이 없습니다</div>' + ex;
    const timed = ss.filter(x => /^\d{1,2}:\d{2}/.test(x.time));
    if (timed.length) {
      h += '<div><div class="tdash-tl">' + timed.map(x => {
        const m = /^(\d{1,2}):(\d{2})/.exec(x.time), st = (+m[1] * 60 + +m[2]) / 1440 * 100;
        return '<i style="left:' + st.toFixed(2) + '%;width:' + Math.max(0.6, x.d / 60 / 1440 * 100).toFixed(2) + '%;background:' + APP[x.app].color + '"></i>';
      }).join('') + '</div><div class="tdash-tlh"><span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>24시</span></div></div>';
    }
    // 맨 위 막대 — 앱별이 아니라 말씀 · 기도 두 갈래 (1028-3 6-2a · 세 앱 같이). W · M 은 앱별 그대로
    h += '<div style="display:flex;flex-direction:column;gap:12px">' + wpLegend(ss) + '</div>';
    // 흐름 — 말씀과 기도가 시간 순서 한 줄로, 기도 한 번 아래에 그 안의 이름 (따로 나오던 Map 기도 · 한 장 기도 목록 대신)
    const tm = sec => sec < 60 ? (sec || 0) + '초' : dur(sec);
    const kidRow = k => {
      const tp = S.item && S.item.topics ? S.item.topics(k.n) : '';
      const sub = k.kind === 'mp' ? (k.names.length > 1 || (k.names[0] && k.names[0] !== k.n) ? k.names.join(' · ') : tp) : tp;
      return edRow(S, k.kind, d, k.ids.join(','), '<span></span><i></i><div class="tdash-kn">' + itemName(S, k.n, 'span') + (sub ? '<small>' + esc(sub) + '</small>' : '') +
        (k.amen ? '<i class="tdash-am" aria-label="아멘"></i>' : '') + '</div><em>' + tm(k.d) + '</em>', 'tdash-kid' + (k.kind === 'fc' && !k.amen ? ' lo' : ''));
    };
    const rowTop = (x, kids) => {
      if (!x) return '<div class="tdash-ses"><span>—</span><i style="background:#5b8fcc;opacity:.4"></i><div style="min-width:0"><b>이름만 남은 기록</b><small>기도 시간과 이어지지 않은 이름</small></div><em></em></div>';
      let title = x.ref ? S.refLabel(x.ref) : x.app === 'pray' ? (SRC[x.src] || '기도') : (x.app === 'bible' ? '성경' : 'There'), sub = APP[x.app].name + ' · ' + srcName(x).replace(/^기도노트 \(/, '(');
      const n = x.ids ? x.ids.length : 1;
      if (x.app === 'pray' && (kids.length || n > 1)) {
        const am = kids.filter(k => k.amen).length, mp = kids.filter(k => k.kind === 'mp').length, fc = kids.length - mp;
        sub = [n > 1 ? n + '번' : '', fc ? fc + '명' + (am ? ' · 아멘 ' + am : '') : '', mp ? 'Map 기도 ' + mp + '번' : ''].filter(Boolean).join(' · ');
      }
      return edRow(S, 'ses', d, x.app === 'pray' ? (x.old ? '-' : (x.ids || [x.id]).join(',')) : '',
        '<span>' + esc(x.time || '—') + '</span><i style="background:' + APP[x.app].color + '"></i><div style="min-width:0"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div><em>' + dur(x.d) + '</em>');
    };
    h += '<div class="tdash-sec"><h4 style="color:#5b8fcc">흐름 <span style="font-weight:400;color:var(--tx3);letter-spacing:0">· 말씀과 기도가 한 줄로</span></h4>' +
      mergeFlow(dayFlow(S.ss, S.data.prayLog, d)).map(r => '<div class="tdash-blk">' + rowTop(r.x, r.kids) + r.kids.map(kidRow).join('') + '</div>').join('') + '</div>';
    return h + ex;
  }
  function nav(S, title, sub, atEnd) {
    return '<div class="tdash-nav"><button data-td="prev" aria-label="이전">' + CHEV(-1) + '</button><div><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div>' +
      '<button data-td="next" aria-label="다음"' + (atEnd ? ' disabled' : '') + '>' + CHEV(1) + '</button></div>' + NAVEND;
  }
  function html(S) {
    const seg = [['day', 'D'], ['week', 'W'], ['month', 'M']];
    const v = S.view === 'day' ? viewDay(S) : S.view === 'month' ? viewMonth(S) : viewWeek(S);
    const n = v.indexOf(NAVEND), navH = n >= 0 ? v.slice(0, n) : '', v2 = n >= 0 ? v.slice(n + NAVEND.length) : v;
    const i = v2.indexOf(FIX), fix = i >= 0 ? v2.slice(0, i) : v2, rest = i >= 0 ? v2.slice(i + FIX.length) : '';
    // 위쪽 고정 영역 = 탭 + 날짜 줄(움직이지 않는다) + 요약(넘길 때 같이 넘어간다, 세로로는 고정). 그 아래가 밀린다
    return '<div class="tdash-in"><div class="tdash-stick"><div class="tdash-hd"><span style="font-size:12.5px;color:var(--tx3)">' + esc(S.status || '') + '</span><div class="tdash-seg">' +
      seg.map(s => '<button class="' + (S.view === s[0] ? 'on' : '') + (S.pin === s[0] ? ' pin' : '') + '" data-td="view" data-v="' + s[0] + '"' + (S.pin === s[0] ? ' aria-label="' + s[1] + ' — 열 때 첫 화면으로 고정됨"' : '') + '>' + s[1] + '</button>').join('') + '</div></div>' +
      '<div data-pane2="1">' + navH + '</div><div class="tdash-pane" data-pane="1">' + fix + '</div></div>' +
      '<div class="tdash-pane tdash-rest" data-pane="1">' + rest + (S.note ? '<span class="tdash-note">' + esc(S.note) + '</span>' : '') + '</div></div>';
  }

  // ── 판 하나를 el 안에 연다 ──
  //   opts: { today:'YYYY-MM-DD', local:{thereLog?, prayLog?}, load: async () => ({thereLog?, prayLog?, note?}),
  //           refLabel: ref => 글자, view, at, onView }
  function mount(el, opts) {
    injectCSS();
    opts = opts || {};
    const S = { view: 'week', today: opts.today || ymd(new Date()), refLabel: opts.refLabel || (r => r), status: '', note: opts.note || '', data: Object.assign({}, opts.local || {}), item: opts.item && typeof opts.item.has === 'function' ? opts.item : null, edit: opts.edit && typeof opts.edit.open === 'function' ? opts.edit : null,
      extra: typeof opts.extra === 'function' ? opts.extra : null, extraAct: typeof opts.extraAct === 'function' ? opts.extraAct : null };   // D탭 아래 부른 쪽 칸 (기도노트 1028-3 6-2b) — (날, 오늘인가) → HTML
    // 기기별 기억 (HB 2026-10-15) — 고정한 탭 · 마지막 탭. 이 기기의 localStorage 에만 둔다.
    //   opts.store = 저장 칸 이름 (앱마다 다르다 · BLOCK7 은 _lsk 로 만든 이름)
    const KEY = (opts.store || 'tdash') + '.v1';
    const mem = (function () { try { const m = JSON.parse(localStorage.getItem(KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } })();
    const VIEWS = ['day', 'week', 'month'], okView = v => VIEWS.indexOf(v) >= 0;
    const okDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
    S.pin = okView(mem.pin) ? mem.pin : null;
    // 탭마다 본 날 / 주 / 달은 **열려 있는 동안만** 기억한다 (HB 2026-10-27 P5): 새로 열면 세 탭 모두 오늘이 든 날 · 주 · 달,
    //   열린 채로 옮겨 두면 다른 탭에 갔다 와도 그 자리. 예전엔 이 기기에 남겨서 다음에 열어도 지난 날짜로 열렸다.
    S.ats = {}; VIEWS.forEach(v => { S.ats[v] = S.today; });
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ pin: S.pin, last: S.view })); } catch (e) {} };
    // 어느 탭으로 열까: 부른 쪽이 콕 집은 탭 > 고정한 탭 > 마지막으로 연 탭 > 주
    //   opts.soft = 부른 쪽은 그 탭을 '권할' 뿐 — 고정한 탭이 있으면 고정이 이긴다 (HB 2026-10-19:
    //   기도노트 기록 › 기도한 날 합계 줄이 '달' 을 콕 집어 열어서, 고정(점)은 보이는데 늘 달로 열렸다).
    //   그때 날짜(opts.at)도 권한 탭에만 쓴다 — 하루로 고정했는데 '그달 1일' 로 열리면 안 된다.
    const soft = !!opts.soft && !!S.pin && opts.view !== S.pin;
    S.view = okView(opts.view) && !soft ? opts.view : S.pin || (okView(mem.last) ? mem.last : 'week');
    if (okDate(opts.at) && !soft) S.ats[S.view] = opts.at <= S.today ? opts.at : S.today;
    S.at = S.ats[S.view];
    const setAt = d => { S.at = d > S.today ? S.today : d; S.ats[S.view] = S.at; };
    const step = k => {
      if (S.view === 'day') setAt(add(S.at, k));
      else if (S.view === 'week') setAt(add(weekStart(S.at), 7 * k));
      else { const d = parse(monthStart(S.at)); setAt(ymd(new Date(d.getFullYear(), d.getMonth() + k, 1))); }
    };
    const draw = () => {
      S.ss = collect(S.data.thereLog, S.data.prayLog);
      el.classList.add('tdash');
      const sy = el.scrollTop;
      el.innerHTML = html(S); el.scrollTop = sy;
    };
    // ── 부드러운 전환 (HB 2026-10-15) — 바꿀 때는 늘 옆으로 스르륵: 나가고 → 그리고 → 들어온다. 밀기는 손가락을 따라간다 ──
    const EASE = 'cubic-bezier(.4,0,.2,1)';
    const still = () => { try { return !el.querySelectorAll || matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
    const panes = withNav => (el.querySelectorAll ? [].slice.call(el.querySelectorAll(withNav ? '[data-pane],[data-pane2]' : '[data-pane]')) : []);
    // BLOCK7 날짜 넘김(navigateDate)과 같은 결 — 나가는 판은 가던 방향으로 **끝까지**(폭 100%) 나가며 옅어지고,
    // 그동안 새 판은 반대쪽 바깥에서 대기했다가 들어온다. (조금만 나가고 반대에서 조금 들어오면 나가던 화면이 되돌아오는 것처럼 보인다)
    // dir: +1 = 앞으로(다음 · 오른쪽 탭) → 나가는 판은 왼쪽으로, 들어오는 판은 오른쪽에서
    const W = () => el.clientWidth || 360, OUT = 'cubic-bezier(.4,0,.2,1)';
    const animIn = (dir, withNav) => { if (still()) return; panes(withNav).forEach(p => p.animate([{ opacity: 0, transform: 'translateX(' + (dir * W()) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: OUT })); };
    const exitFrom = (dir, x0, op0, done) => {
      panes().forEach(p => { p.getAnimations().forEach(a => a.cancel()); p.style.transition = 'none'; p.style.opacity = ''; p.style.transform = '';
        p.animate([{ opacity: op0, transform: 'translateX(' + x0 + 'px)' }, { opacity: 0, transform: 'translateX(' + (-dir * W()) + 'px)' }], { duration: 190, easing: OUT, fill: 'forwards' }); });
      setTimeout(done, 190);
    };
    const transit = (dir, mutate) => {
      if (still() || S.busy) { mutate(); draw(); return; }
      S.busy = true;
      exitFrom(dir, 0, 1, () => { mutate(); draw(); animIn(dir); S.busy = false; });
    };
    // 탭을 바꿀 때 — 날짜 줄까지 함께, **차분하게**: 짧게 비켜서며 천천히 옅어지고, 새 판이 느리게 스며 들어온다 (HB 2026-10-15)
    const CALM = 'cubic-bezier(.25,.1,.25,1)', DRIFT = 28;
    const tabTransit = (dir, mutate) => {
      if (still() || S.busy) { mutate(); draw(); return; }
      S.busy = true;
      panes(true).forEach(p => { p.getAnimations().forEach(a => a.cancel());
        p.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-dir * DRIFT) + 'px)' }], { duration: 300, easing: 'ease-in-out', fill: 'forwards' }); });
      setTimeout(() => {
        mutate(); draw();
        panes(true).forEach(p => p.animate([{ opacity: 0, transform: 'translateX(' + (dir * DRIFT) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 620, easing: CALM }));
        S.busy = false;
      }, 300);
    };
    // BLOCK7 토스트와 같은 기준 — 화면 한가운데, 글자 수 × 200ms(3초~9초), 어디를 눌러도 닫힌다. 뜻 단위로 줄을 바꾸고 중요한 말은 굵게
    const toast = html => {
      try {
        if (!TOAST) {
          TOAST = document.createElement('div'); TOAST.className = 'tdash-toast'; document.body.appendChild(TOAST);
          document.addEventListener('pointerdown', () => { clearTimeout(TOAST_TM); TOAST.classList.remove('on'); }, true);
        }
        TOAST.innerHTML = html; TOAST.classList.add('on'); clearTimeout(TOAST_TM);
        TOAST_TM = setTimeout(() => TOAST.classList.remove('on'), Math.min(9000, Math.max(3000, (TOAST.textContent || '').length * 200)));
      } catch (e) {}
    };
    const VN = { day: 'D (일간)', week: 'W (주간)', month: 'M (월간)' };
    const atEnd = () => S.view === 'day' ? S.at >= S.today : S.view === 'week' ? add(weekStart(S.at), 6) >= S.today : monthEnd(S.at) >= S.today;
    const after = () => { save(); if (opts.onView) opts.onView(S.view); };
    el.onclick = e => {
      const b = e.target.closest && e.target.closest('[data-td]');
      if (!b) {   // 기도노트 기록 줄 — 톡 = 고치기
        const r = S.edit && e.target.closest && e.target.closest('[data-ed]');
        if (r && Date.now() - lpAt >= 700 && !swAt()) { e.stopPropagation(); S.edit.open(edInfo(r)); }
        return;
      }
      if (b.disabled) return;
      const a = b.dataset.td;
      if (Date.now() - lpAt < 700) { e.stopPropagation(); return; }   // 길게 눌러 고정한 뒤 따라오는 클릭
      if (a === 'view') {
        const v = b.dataset.v;
        e.stopPropagation();
        if (v === S.view) {                      // 이미 열린 탭을 다시 누르면 오늘 기준
          if (S.at === S.today) return;
          transit(S.today > S.at ? 1 : -1, () => { setAt(S.today); after(); });
        } else {                                 // 다른 탭은 그 탭에서 마지막으로 보던 날로
          tabTransit(VIEWS.indexOf(v) > VIEWS.indexOf(S.view) ? 1 : -1, () => { S.view = v; S.at = S.ats[v]; after(); });
        }
        return;
      }
      if (a === 'item') { e.stopPropagation(); if (S.item && S.item.open) S.item.open(b.dataset.v); return; }
      if (a === 'pray') { e.stopPropagation(); if (S.item && S.item.pray) S.item.pray(b.dataset.v); return; }
      if (a === 'ext') { e.stopPropagation(); if (S.extraAct) { S.extraAct(b.dataset.v); draw(); } return; }   // 부른 쪽 칸의 접기 · 펼치기 등 — 바꾸고 다시 그린다   // 부른 쪽 칸의 그룹 줄 — 그 그룹부터 한 장 기도 (기도노트 6-2b)
      if (a === 'day') { e.stopPropagation(); tabTransit(1, () => { S.view = 'day'; setAt(b.dataset.v); after(); }); }
      else if (a === 'prev' || a === 'next') { e.stopPropagation(); const k = a === 'prev' ? -1 : 1; transit(k, () => { step(k); after(); }); }
    };
    // 탭 글자를 길게 누르기 · 우클릭 = 열 때 첫 화면으로 고정 / 해제 (고정한 탭 위에 점 + 안내)
    let lpAt = 0, lpTm = 0, lpX = 0, lpY = 0;
    const togglePin = v => {
      S.pin = S.pin === v ? null : v; lpAt = Date.now(); save(); draw();
      toast(S.pin ? '<b>' + VN[v] + ' 탭</b>을 첫 화면으로<br><b>고정했어요</b><br>앞으로 There 대시보드를 열면<br>늘 <b>' + VN[v].split(' ')[0] + '</b>부터 보여요<small>다시 길게 누르면 풀려요</small>'
        : '<b>' + VN[v] + ' 탭</b>의<br><b>고정을 풀었어요</b><br>앞으로는 <b>마지막으로 본 탭</b>으로<br>There 대시보드가 열려요');
    };
    const segBtn = e => e.target.closest && e.target.closest('.tdash-seg [data-td="view"]');
    const itemBtn = e => e.target.closest && e.target.closest('[data-td="item"]');
    const itemPray = b => { lpAt = Date.now(); if (S.item && S.item.pray) S.item.pray(b.dataset.v); };
    el.addEventListener('pointerdown', e => {
      const b = segBtn(e), it = b ? null : itemBtn(e); if ((!b && !it) || e.pointerType === 'mouse') return;
      lpX = e.clientX; lpY = e.clientY; clearTimeout(lpTm);
      lpTm = setTimeout(() => { lpTm = 0; if (navigator.vibrate) navigator.vibrate(10); if (b) togglePin(b.dataset.v); else itemPray(it); }, 520);
    });
    el.addEventListener('pointermove', e => { if (lpTm && Math.hypot(e.clientX - lpX, e.clientY - lpY) > 10) { clearTimeout(lpTm); lpTm = 0; } });
    ['pointerup', 'pointercancel'].forEach(n => el.addEventListener(n, () => { clearTimeout(lpTm); lpTm = 0; }));
    el.addEventListener('contextmenu', e => {
      const b = segBtn(e), it = b ? null : itemBtn(e); if (!b && !it) return;
      e.preventDefault(); e.stopPropagation(); clearTimeout(lpTm); lpTm = 0; if (b) togglePin(b.dataset.v); else itemPray(it);
    });
    // 화면 어디서든 좌우로 밀면 그 탭 안에서 이전 / 다음 (탭 전환이 아니다). 손가락을 따라 판이 움직이고,
    // 놓을 때 폭의 4분의 1 넘게(또는 빠르게) 밀었으면 넘어가고 아니면 제자리로 돌아온다.
    // 왼쪽 가장자리(전체 화면 닫기 밀기)에서 시작한 것은 뺀다.
    let sx = 0, sy = 0, sOn = false, lock = false, dx = 0, st = 0, row = null, rowOn = false, rowAt = 0;
    const edInfo = r => ({ kind: r.dataset.ed, date: r.dataset.d, ids: r.dataset.v === '-' ? [] : r.dataset.v.split(',').filter(Boolean) });
    const swAt = () => Date.now() - rowAt < 400;   // 밀어 지운 손짓 끝에 따라오는 클릭은 삼킨다
    // 줄을 왼쪽으로 밀기 — 손가락을 따라가다 놓을 때 폭의 3분의 1 넘게(또는 빠르게) 밀었으면 끝까지 나가며 높이가 접히고 지운다
    const rowFollow = x => { row.style.transition = 'none'; row.style.transform = 'translateX(' + Math.min(0, x) + 'px)'; };
    const rowRelease = (r, x, fast) => {
      const w = r.offsetWidth || 320;
      rowAt = Date.now();
      if (-x < w / 3 && !fast) { r.style.transition = 'transform .26s ' + EASE; r.style.transform = ''; return; }
      const wrap = r.parentNode, info = edInfo(r);
      if (still()) { S.edit.del(info); return; }
      r.style.transition = 'transform .2s cubic-bezier(.4,0,1,1)'; r.style.transform = 'translateX(' + (-w) + 'px)';
      setTimeout(() => {
        wrap.style.height = wrap.offsetHeight + 'px'; wrap.offsetHeight;
        wrap.style.transition = 'height .22s ' + EASE + ',opacity .22s'; wrap.style.height = '0px'; wrap.style.opacity = '0';
        setTimeout(() => S.edit.del(info), 230);
      }, 200);
    };
    const follow = x => {
      const w = el.clientWidth || 360, k = x < 0 && atEnd() ? 0.22 : 1;     // 더 갈 데 없는 쪽은 고무줄처럼 뻑뻑하게
      const px = x * k, op = 1 - Math.min(Math.abs(px) / w, 0.55);
      panes().forEach(p => { p.style.transition = 'none'; p.style.transform = 'translateX(' + px + 'px)'; p.style.opacity = op; });
    };
    const release = fn => panes().forEach(p => { p.style.transition = fn ? 'none' : 'transform .26s ' + EASE + ',opacity .26s'; p.style.transform = ''; p.style.opacity = ''; });
    el.addEventListener('touchstart', e => { const t = e.touches[0]; sOn = e.touches.length === 1 && t.clientX >= 32 && !S.busy; lock = false; dx = 0; sx = t.clientX; sy = t.clientY; st = Date.now(); rowOn = false;
      row = S.edit && S.edit.del && e.target.closest ? e.target.closest('[data-ed]') : null; }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (!sOn) return; const t = e.touches[0]; dx = t.clientX - sx; const dy = t.clientY - sy;
      if (!lock) {
        if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) { sOn = false; return; }     // 세로로 밀고 있다 = 스크롤
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) { lock = true; rowOn = !!row && dx < 0; } else return;
      }
      if (rowOn) rowFollow(dx); else follow(dx);
    }, { passive: true });
    el.addEventListener('touchend', e => {
      if (!sOn) return; sOn = false;
      const t = e.changedTouches[0], x = t.clientX - sx, y = t.clientY - sy;
      if (rowOn) { rowOn = false; rowRelease(row, x, x <= -40 && -x / Math.max(1, Date.now() - st) > 0.5); return; }
      if (Math.abs(x) < 24 || Math.abs(x) < Math.abs(y) * 1.6) { release(); return; }
      const w = el.clientWidth || 360, fast = Math.abs(x) >= 40 && Math.abs(x) / Math.max(1, Date.now() - st) > 0.5;
      const k = x > 0 ? -1 : 1;                 // 오른쪽으로 밀면 이전, 왼쪽으로 밀면 다음
      if ((Math.abs(x) < Math.max(60, w * 0.25) && !fast) || (k === 1 && atEnd())) { release(); return; }
      if (still()) { step(k); after(); draw(); return; }
      // 손가락이 있던 자리에서 이어서 끝까지 나간다 → 새 판이 반대쪽 바깥에서 들어온다 (BLOCK7 날짜 넘김과 같다)
      S.busy = true;
      const k0 = x > 0 ? -1 : 1;
      exitFrom(k0, x, 1 - Math.min(Math.abs(x) / w, 0.55), () => { step(k); after(); draw(); animIn(k); S.busy = false; });
    }, { passive: true });
    el.addEventListener('touchcancel', () => { if (rowOn && row) { row.style.transition = 'transform .26s ' + EASE; row.style.transform = ''; rowOn = false; } else if (lock) release(); sOn = false; }, { passive: true });
    save();
    draw();
    if (opts.load) {
      S.status = '다른 앱 기록을 받는 중…'; draw();
      Promise.resolve().then(opts.load).then(r => {
        r = r || {};
        if (r.thereLog) S.data.thereLog = r.thereLog;
        if (r.prayLog) S.data.prayLog = r.prayLog;
        S.status = ''; S.note = r.note || opts.note || '';
        draw();
      }).catch(err => { S.status = ''; S.note = '다른 앱 기록을 받지 못했습니다' + (err && err.message ? ' — ' + err.message : '') + '. 이 앱 기록만 보입니다.'; draw(); });
    }
    return { redraw: draw, state: S };
  }
  // 열려 있는 동안 페이지 바탕 · theme-color 를 대시보드 색으로 (아이폰 홈 화면 앱 아래 띠 · 안드로이드 상태 표시줄). 닫으면 되돌린다.
  //   앱이 그사이 theme-color 를 고치면(돌려서 띠 색을 다시 맞추는 기도노트 syncCanvasColor 등) 그 값을 되돌릴 값으로 받고 다시 덮는다.
  const TINT = { m: null, was: null, mo: null };
  function pageTint(on) {
    try {
      document.documentElement.classList.toggle('tdash-on', on);
      if (TINT.mo) { TINT.mo.disconnect(); TINT.mo = null; }
      if (TINT.m) { TINT.m.setAttribute('content', TINT.was); TINT.m = null; }
      const m = on && document.querySelector('meta[name="theme-color"]'); if (!m) return;
      const BG = '#0d0e10';
      TINT.m = m; TINT.was = m.getAttribute('content'); m.setAttribute('content', BG);
      const MO = window.MutationObserver;
      if (MO) {
        TINT.mo = new MO(() => { const c = m.getAttribute('content'); if (c !== BG) { TINT.was = c; m.setAttribute('content', BG); } });
        TINT.mo.observe(m, { attributes: true, attributeFilter: ['content'] });
      }
    } catch (e) { /* 띠 색만 못 맞춤 */ }
  }
  // 전체 화면으로 연다 — 우상단 × 하나 (UI 원칙). esc:false 면 Esc 는 앱의 닫기 표가 맡는다
  const VNAME = { day: 'Today', week: 'Week', month: 'Month' };
  let OV = null;
  function open(opts) {
    close(true);
    injectCSS();
    opts = opts || {};
    const ov = document.createElement('div');
    ov.className = 'tdash tdash-ov'; ov.id = 'tdashOv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'There 대시보드');
    ov.innerHTML = '<div class="tdash-top"><div class="tdash-logo"><b>THERE</b><span data-tdsub></span></div>' +
      '<button class="tdash-x" data-tdx="1" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button></div><div class="tdash-body"></div>';
    document.body.appendChild(ov);
    // 고정 영역이 붙는 높이 = THERE 줄(시계 줄 포함). 돌리면 시계 줄 높이가 바뀌므로 다시 잰다
    const fit = () => ov.style.setProperty('--tdtop', ov.querySelector('.tdash-top').offsetHeight + 'px');
    fit(); window.addEventListener('resize', fit); ov._fit = fit;
    pageTint(true);
    ov.querySelector('[data-tdx]').onclick = e => { e.stopPropagation(); close(); };
    const sub = ov.querySelector('[data-tdsub]'), onV = opts.onView;
    // 제목 옆 작은 글자 = 지금 보는 판 (Today · Week · Month)
    const m = mount(ov.querySelector('.tdash-body'), Object.assign({}, opts, { onView: v => { sub.textContent = VNAME[v] || ''; if (onV) onV(v); } }));
    ov._m = m;
    // 닫는 손짓 둘 — 손가락을 따라 밀려 나간다 (HB 2026-10-13 · 2026-10-27 P3′-3)
    //  ① 왼쪽 가장자리(EDGE)에서 오른쪽으로 밀기. EDGE 는 안쪽 좌우 넘기기가 빼는 폭(32)과 같아야 한다 —
    //     예전엔 28 이라 28~32px 에서 시작한 밀기는 어느 쪽도 받지 않았다.
    //  ② 머리(THERE 줄 · D W M 줄)를 아래로 끌어내리기 — 맨 위에 있을 때만(스크롤 중이면 스크롤)
    const EDGE = 32;
    let sx = 0, sy = 0, on = '', dx = 0, dy = 0, t0 = 0;
    const head = t => t && t.closest && t.closest('.tdash-top,.tdash-stick');
    ov.addEventListener('touchstart', e => {
      const t = e.touches[0]; dx = dy = 0; sx = t.clientX; sy = t.clientY; t0 = Date.now();
      on = e.touches.length !== 1 ? '' : t.clientX < EDGE ? 'x' : (head(e.target) && ov.scrollTop <= 0 ? 'y?' : '');
      if (on === 'x') ov.style.transition = 'none';
    }, { passive: true });
    ov.addEventListener('touchmove', e => {
      if (!on) return; const t = e.touches[0]; dx = t.clientX - sx; dy = t.clientY - sy;
      if (on === 'y?') {                                  // 머리에서 시작 — 아래로 먼저 움직였을 때만 끌어내리기
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { on = ''; return; }
        if (dy > 10 && dy > Math.abs(dx)) { on = 'y'; ov.style.transition = 'none'; } else if (dy < -6) { on = ''; return; } else return;
      }
      if (on === 'x') {
        if (Math.abs(dy) > Math.abs(dx) && dx < 30) { on = ''; ov.style.transform = ''; ov.style.transition = ''; return; }
        if (dx > 0) { e.preventDefault(); ov.style.transform = 'translateX(' + dx + 'px)'; }
      } else if (on === 'y') { e.preventDefault(); ov.style.transform = 'translateY(' + Math.max(0, dy) + 'px)'; ov.style.opacity = String(1 - Math.min(Math.max(0, dy) / innerHeight, 0.5)); }
    }, { passive: false });
    const done = () => {
      if (!on) return; const k = on; on = ''; ov.style.transition = 'transform .24s cubic-bezier(.22,.8,.24,1),opacity .24s';
      const fast = (k === 'x' ? dx : dy) / Math.max(1, Date.now() - t0) > 0.6;
      if (k === 'x' && (dx > Math.min(110, innerWidth * 0.28) || (fast && dx > 40))) { ov.style.transform = 'translateX(100%)'; close(); }
      else if (k === 'y' && (dy > Math.min(140, innerHeight * 0.18) || (fast && dy > 50))) { ov.style.transform = 'translateY(100%)'; close(); }
      else { ov.style.transform = ''; ov.style.opacity = ''; }
    };
    ov.addEventListener('touchend', done);
    ov.addEventListener('touchcancel', () => { if (on) { dx = dy = 0; done(); } });
    const key = e => { if (e.key === 'Escape' && OV === ov && opts.esc !== false) { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('keydown', key, true);
    OV = ov; ov._key = key; ov._onClose = opts.onClose;
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('in')));
    sub.textContent = VNAME[m.state.view] || '';
    return m;
  }
  function close(now) {
    const ov = OV; if (!ov) return; OV = null;
    document.removeEventListener('keydown', ov._key, true);
    window.removeEventListener('resize', ov._fit);
    pageTint(false);
    if (ov._onClose) try { ov._onClose(); } catch (e) {}
    if (now) { ov.remove(); return; }
    ov.classList.remove('in'); setTimeout(() => ov.remove(), 240);
  }
  const isOpen = () => !!OV;
  const redraw = () => { if (OV && OV._m) OV._m.redraw(); };   // 부른 쪽이 기록을 고친 뒤 (기도노트 5-1 · 5-2)
  return { collect, mapPrayers, focusPrayers, dayFlow, mergeFlow, wordPray, dayTotals, weekStart, monthStart, monthEnd, add, dur, mount, open, close, isOpen, redraw, APPS, SRC };
})();
