// ══ There 대시보드 — BLOCK7 · Sweeter · 기도노트 공용 (HB 2026-10-13) ══════════════════
// ⚠️ 원본은 tools/there-dash.js 하나다. ./tools/sync-there-dash.sh 가 index.html 과 pray/index.html 의
//    there-dash 스크립트 덩어리에 **같은 글자로** 넣는다 — 손으로 한쪽만 고치지 말 것
//    (tests/test_there_dash.js 가 세 벌이 같은지 본다).
// 세 앱의 There(머문 시간) 기록을 한 모양으로 모아 주 · 달 · 하루로 보여 준다. **읽기만 한다.**
//   thereLog = BLOCK7 · Sweeter 의 verseThereLog  {"YYYY-MM-DD":[{ref,time,t,d,sec,app,src}]}
//   prayLog  = 기도노트 DB.log                    {"YYYY-MM-DD":{d,p,k,s,ses:[{id,t,time,d,src}],mp:[{id,a,t,pid,d,n,k}]}}
//   mp = Map 기도(지도 There 안에서 누른 그룹 · 항목에 머문 시간). **합계에 더하지 않는다** — 그 시간은 지도 There(ses)에 이미 들어 있다.
//        '무엇을 위해 기도했나' 로만 보여 준다 (k = 누른 그룹 · 항목 이름, n = 사람 이름, a = 시작 ms).
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
    tile: 'Sweeter 타일', bible: '성경 화면', 'bible-menu': '성경 절 메뉴', map: '기도 지도', focus: '한 장씩 기도하기'
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
        out.push({ date: date, t: +e.t || 0, time: e.time || '', d: d, app: 'pray', src: String(e.src || ''), ref: '' });
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
        const o = by[key] || (by[key] = { date: date, t: +e.a || +e.t || 0, k: String(e.k || e.n || '이름 없음'), names: [], d: 0 });
        o.d += d; if (e.n && o.names.indexOf(e.n) < 0) o.names.push(String(e.n));
      });
      Object.keys(by).forEach(x => { const o = by[x]; if (o.t) { const dt = new Date(o.t); o.time = p2(dt.getHours()) + ':' + p2(dt.getMinutes()); } else o.time = ''; out.push(o); });
    });
    out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (a.t - b.t));
    return out;
  }
  // 기간 안의 Map 기도를 이름(k)마다 모아 오래 한 순서로
  function mapTop(S, a, b, n) {
    const m = {}; mapPrayers(S.data.prayLog, a, b).forEach(x => { const o = m[x.k] || (m[x.k] = { s: 0, n: 0 }); o.s += x.d; o.n++; });
    const ks = Object.keys(m).sort((x, y) => m[y].s - m[x].s).slice(0, n || 5);
    if (!ks.length) return '';
    return '<div class="tdash-sec"><h4 style="color:#5b8fcc">무엇을 위해 기도했나 <span style="font-weight:400;color:var(--tx3);letter-spacing:0">· Map 기도</span></h4>' +
      ks.map(k => '<div class="tdash-li"><span>' + esc(k) + '</span><small>' + dur(m[k].s) + ' · ' + m[k].n + '번</small></div>').join('') + '</div>';
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
.tdash-in{max-width:560px;margin:0 auto;padding:4px 20px 48px;display:flex;flex-direction:column;gap:22px}
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
.tdash-col{height:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;border-radius:4px}
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
.tdash-note{font-size:11.5px;color:#6c6962;line-height:1.6}
.tdash-empty{padding:28px 0;text-align:center;color:var(--tx3);font-size:13.5px}
.tdash-ov{position:fixed;inset:0;z-index:99990;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;
  padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px);opacity:0;transform:translateY(10px);transition:opacity .22s,transform .22s}
.tdash-ov.in{opacity:1;transform:none}
.tdash-top{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;align-items:center;justify-content:space-between;padding:10px 10px 6px 20px}
.tdash-logo{display:flex;align-items:baseline;gap:10px}
.tdash-logo b{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-weight:500;font-size:28px;letter-spacing:.16em}
.tdash-logo span{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:15px;color:var(--tx3)}
.tdash-x{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--tx2)}
.tdash-x svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
`;
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
    h += '<div style="display:flex;flex-direction:column;gap:4px">' + bigNum(tot) + cmpLine(tot, prev, '지난주') + '</div>';
    if (!tot) return h + '<div class="tdash-empty">이 주에는 기록이 없습니다</div>';
    h += '<div style="display:flex;flex-direction:column;gap:12px">' + legend(by, tot) + '</div>';
    h += '<div class="tdash-card"><div class="tdash-ct">날마다<small>막대를 누르면 그날</small></div><div class="tdash-cols">' + days.map(d => {
      const o = dt[d];
      const inner = o ? APPS.slice().reverse().filter(x => o.by[x[0]]).map(x => '<i style="height:' + (o.by[x[0]] / max * 134).toFixed(1) + 'px;background:' + x[2] + '"></i>').join('') : '<i></i>';
      return '<button class="tdash-col' + (o ? '' : ' z') + (d === S.today ? ' on' : '') + '" data-td="day" data-v="' + d + '" aria-label="' + d + ' ' + (o ? dur(o.s) : '기록 없음') + '">' + inner + '</button>';
    }).join('') + '</div><div class="tdash-lbl">' + days.map(d => '<span' + (d === S.today ? ' class="on"' : '') + '>' + (parse(d).getDay() === 0 ? '주일' : WK[parse(d).getDay()]) + '</span>').join('') + '</div></div>';
    h += topRefs(ss, S.refLabel);
    const pm = sumBy(ss.filter(x => x.app === 'pray'), srcName), pk = Object.keys(pm).sort((x, y) => pm[y].s - pm[x].s);
    if (pk.length) h += '<div class="tdash-sec"><h4 style="color:#5b8fcc">기도노트</h4>' + pk.map(k => '<div class="tdash-li"><span>' + esc(k) + '</span><small>' + dur(pm[k].s) + ' · ' + pm[k].n + '번</small></div>').join('') + '</div>';
    h += mapTop(S, a, b, 5);
    return h;
  }
  const HEAT = ['#17191d', '#2a3646', '#3b4e66', '#4f86c6', '#9cc0e8'];
  function heat(s, max) { if (!s) return 0; const r = s / max; return r > .75 ? 4 : r > .45 ? 3 : r > .2 ? 2 : 1; }
  function viewMonth(S) {
    const a = monthStart(S.at), b = monthEnd(S.at), ss = inRange(S.ss, a, b), tot = total(ss), dt = dayTotals(ss);
    const pd = parse(a), pmA = monthStart(add(a, -1)), prev = total(inRange(S.ss, pmA, add(a, -1)));
    const days = []; for (let d = a; d <= b; d = add(d, 1)) days.push(d);
    const upto = days.filter(d => d <= S.today).length;
    let h = nav(S, pd.getFullYear() + '년 ' + (pd.getMonth() + 1) + '월', '머문 날 ' + days.filter(d => dt[d]).length + ' / ' + upto, b >= S.today);
    h += '<div style="display:flex;flex-direction:column;gap:4px">' + bigNum(tot) + cmpLine(tot, prev, '지난달') + '</div>';
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
    let h = nav(S, (pd.getMonth() + 1) + '월 ' + pd.getDate() + '일 ' + (pd.getDay() ? WK[pd.getDay()] + '요일' : '주일'), (tot ? dur(tot) + ' · ' + ss.length + '번' : '기록 없음'), d >= S.today);
    if (!tot) return h + '<div class="tdash-empty">이날은 기록이 없습니다</div>';
    const timed = ss.filter(x => /^\d{1,2}:\d{2}/.test(x.time));
    if (timed.length) {
      h += '<div><div class="tdash-tl">' + timed.map(x => {
        const m = /^(\d{1,2}):(\d{2})/.exec(x.time), st = (+m[1] * 60 + +m[2]) / 1440 * 100;
        return '<i style="left:' + st.toFixed(2) + '%;width:' + Math.max(0.6, x.d / 60 / 1440 * 100).toFixed(2) + '%;background:' + APP[x.app].color + '"></i>';
      }).join('') + '</div><div class="tdash-tlh"><span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>24시</span></div></div>';
    }
    const by = {}; ss.forEach(x => { by[x.app] = (by[x.app] || 0) + x.d; });
    h += '<div style="display:flex;flex-direction:column;gap:12px">' + legend(by, tot) + '</div>';
    h += '<div class="tdash-sec">' + ss.slice().sort((a, b) => (a.time || '99').localeCompare(b.time || '99')).map(x =>
      '<div class="tdash-ses"><span>' + esc(x.time || '—') + '</span><i style="background:' + APP[x.app].color + '"></i><div style="min-width:0"><b>' +
      esc(x.ref ? S.refLabel(x.ref) : x.app === 'pray' ? (SRC[x.src] || '기도') : (x.app === 'bible' ? '성경' : 'There')) + '</b><small>' + esc(APP[x.app].name + ' · ' + srcName(x).replace(/^기도노트 \(/, '(')) + '</small></div><em>' + dur(x.d) + '</em></div>').join('') + '</div>';
    // 지도 There 안에서 누른 것들 — 위 '기도 지도' 시간 안에 든 몫이라 합계에는 다시 더하지 않는다
    const mp = mapPrayers(S.data.prayLog, d, d);
    if (mp.length) {
      const sum = mp.reduce((s, x) => s + x.d, 0);
      h += '<div class="tdash-sec"><h4 style="color:#5b8fcc">Map 기도 <span style="font-weight:400;color:var(--tx3);letter-spacing:0">· 기도 지도 시간 중 ' + esc(dur(sum)) + '</span></h4>' + mp.map(x =>
        '<div class="tdash-ses"><span>' + esc(x.time || '—') + '</span><i style="background:#5b8fcc;opacity:.55"></i><div style="min-width:0"><b>' + esc(x.k) + '</b>' +
        (x.names.length > 1 || (x.names[0] && x.names[0] !== x.k) ? '<small>' + esc(x.names.join(' · ')) + '</small>' : '') + '</div><em>' + dur(x.d) + '</em></div>').join('') + '</div>';
    }
    return h;
  }
  function nav(S, title, sub, atEnd) {
    return '<div class="tdash-nav"><button data-td="prev" aria-label="이전">' + CHEV(-1) + '</button><div><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div>' +
      '<button data-td="next" aria-label="다음"' + (atEnd ? ' disabled' : '') + '>' + CHEV(1) + '</button></div>';
  }
  function html(S) {
    const seg = [['day', 'D'], ['week', 'W'], ['month', 'M']];
    let h = '<div class="tdash-in"><div class="tdash-hd"><span style="font-size:12.5px;color:var(--tx3)">' + esc(S.status || '') + '</span><div class="tdash-seg">' +
      seg.map(s => '<button class="' + (S.view === s[0] ? 'on' : '') + (S.pin === s[0] ? ' pin' : '') + '" data-td="view" data-v="' + s[0] + '"' + (S.pin === s[0] ? ' aria-label="' + s[1] + ' — 열 때 첫 화면으로 고정됨"' : '') + '>' + s[1] + '</button>').join('') + '</div></div>';
    h += S.view === 'day' ? viewDay(S) : S.view === 'month' ? viewMonth(S) : viewWeek(S);
    if (S.note) h += '<span class="tdash-note">' + esc(S.note) + '</span>';
    return h + '</div>';
  }

  // ── 판 하나를 el 안에 연다 ──
  //   opts: { today:'YYYY-MM-DD', local:{thereLog?, prayLog?}, load: async () => ({thereLog?, prayLog?, note?}),
  //           refLabel: ref => 글자, view, at, onView }
  function mount(el, opts) {
    injectCSS();
    opts = opts || {};
    const S = { view: 'week', today: opts.today || ymd(new Date()), refLabel: opts.refLabel || (r => r), status: '', note: opts.note || '', data: Object.assign({}, opts.local || {}) };
    // 기기별 기억 (HB 2026-10-15) — 고정한 탭 · 마지막 탭 · 탭마다 마지막으로 본 날 / 주 / 달. 이 기기의 localStorage 에만 둔다.
    //   opts.store = 저장 칸 이름 (앱마다 다르다 · BLOCK7 은 _lsk 로 만든 이름)
    const KEY = (opts.store || 'tdash') + '.v1';
    const mem = (function () { try { const m = JSON.parse(localStorage.getItem(KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } })();
    const VIEWS = ['day', 'week', 'month'], okView = v => VIEWS.indexOf(v) >= 0;
    const okDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
    S.pin = okView(mem.pin) ? mem.pin : null;
    S.ats = {}; VIEWS.forEach(v => { S.ats[v] = okDate(mem.at && mem.at[v]) && mem.at[v] <= S.today ? mem.at[v] : S.today; });
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ pin: S.pin, last: S.view, at: S.ats })); } catch (e) {} };
    // 어느 탭으로 열까: 부른 쪽이 콕 집은 탭 > 고정한 탭 > 마지막으로 연 탭 > 주
    S.view = okView(opts.view) ? opts.view : S.pin || (okView(mem.last) ? mem.last : 'week');
    if (okDate(opts.at)) S.ats[S.view] = opts.at <= S.today ? opts.at : S.today;
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
    el.onclick = e => {
      const b = e.target.closest && e.target.closest('[data-td]'); if (!b || b.disabled) return;
      const a = b.dataset.td;
      if (Date.now() - lpAt < 700) { e.stopPropagation(); return; }   // 길게 눌러 고정한 뒤 따라오는 클릭
      if (a === 'view') {
        const v = b.dataset.v;
        if (v === S.view) setAt(S.today);        // 이미 열린 탭을 다시 누르면 오늘 기준
        else { S.view = v; S.at = S.ats[v]; }    // 다른 탭은 그 탭에서 마지막으로 보던 날로
      }
      else if (a === 'day') { S.view = 'day'; setAt(b.dataset.v); }
      else if (a === 'prev' || a === 'next') step(a === 'prev' ? -1 : 1);
      else return;
      e.stopPropagation();
      save();
      if (opts.onView) opts.onView(S.view);
      draw();
    };
    // 탭 글자를 길게 누르기 · 우클릭 = 열 때 첫 화면으로 고정 / 해제 (고정한 탭 위에 점)
    let lpAt = 0, lpTm = 0, lpX = 0, lpY = 0;
    const togglePin = v => { S.pin = S.pin === v ? null : v; lpAt = Date.now(); save(); draw(); };
    const segBtn = e => e.target.closest && e.target.closest('.tdash-seg [data-td="view"]');
    el.addEventListener('pointerdown', e => {
      const b = segBtn(e); if (!b || e.pointerType === 'mouse') return;
      lpX = e.clientX; lpY = e.clientY; clearTimeout(lpTm);
      lpTm = setTimeout(() => { lpTm = 0; if (navigator.vibrate) navigator.vibrate(10); togglePin(b.dataset.v); }, 520);
    });
    el.addEventListener('pointermove', e => { if (lpTm && Math.hypot(e.clientX - lpX, e.clientY - lpY) > 10) { clearTimeout(lpTm); lpTm = 0; } });
    ['pointerup', 'pointercancel'].forEach(n => el.addEventListener(n, () => { clearTimeout(lpTm); lpTm = 0; }));
    el.addEventListener('contextmenu', e => { const b = segBtn(e); if (!b) return; e.preventDefault(); e.stopPropagation(); clearTimeout(lpTm); lpTm = 0; togglePin(b.dataset.v); });
    // 화면 어디서든 좌우로 밀면 그 탭 안에서 이전 / 다음 (탭 전환이 아니다). 왼쪽 가장자리(전체 화면 닫기 밀기)에서 시작한 것은 뺀다.
    let sx = 0, sy = 0, sOn = false;
    el.addEventListener('touchstart', e => { const t = e.touches[0]; sOn = e.touches.length === 1 && t.clientX >= 32; sx = t.clientX; sy = t.clientY; }, { passive: true });
    el.addEventListener('touchmove', e => { if (!sOn) return; const t = e.touches[0]; if (Math.abs(t.clientY - sy) > 40 && Math.abs(t.clientY - sy) > Math.abs(t.clientX - sx)) sOn = false; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (!sOn) return; sOn = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      step(dx > 0 ? -1 : 1);                    // 오른쪽으로 밀면 이전, 왼쪽으로 밀면 다음
      save();
      if (opts.onView) opts.onView(S.view);
      draw();
    }, { passive: true });
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
    ov.querySelector('[data-tdx]').onclick = e => { e.stopPropagation(); close(); };
    const sub = ov.querySelector('[data-tdsub]'), onV = opts.onView;
    // 제목 옆 작은 글자 = 지금 보는 판 (Today · Week · Month)
    const m = mount(ov.querySelector('.tdash-body'), Object.assign({}, opts, { onView: v => { sub.textContent = VNAME[v] || ''; if (onV) onV(v); } }));
    // 왼쪽 가장자리에서 오른쪽으로 밀어 닫기 — 손가락을 따라 밀려 나간다 (HB 2026-10-13)
    let sx = 0, sy = 0, on = false, dx = 0;
    ov.addEventListener('touchstart', e => { const t = e.touches[0]; on = e.touches.length === 1 && t.clientX < 28; sx = t.clientX; sy = t.clientY; dx = 0; if (on) ov.style.transition = 'none'; }, { passive: true });
    ov.addEventListener('touchmove', e => {
      if (!on) return; const t = e.touches[0]; dx = t.clientX - sx;
      if (Math.abs(t.clientY - sy) > Math.abs(dx) && dx < 30) { on = false; ov.style.transform = ''; ov.style.transition = ''; return; }
      if (dx > 0) { e.preventDefault(); ov.style.transform = 'translateX(' + dx + 'px)'; }
    }, { passive: false });
    ov.addEventListener('touchend', () => {
      if (!on) return; on = false; ov.style.transition = 'transform .22s,opacity .22s';
      if (dx > Math.min(110, innerWidth * 0.28)) { ov.style.transform = 'translateX(100%)'; close(); } else ov.style.transform = '';
    });
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
    if (ov._onClose) try { ov._onClose(); } catch (e) {}
    if (now) { ov.remove(); return; }
    ov.classList.remove('in'); setTimeout(() => ov.remove(), 240);
  }
  const isOpen = () => !!OV;
  return { collect, mapPrayers, dayTotals, weekStart, monthStart, monthEnd, add, dur, mount, open, close, isOpen, APPS, SRC };
})();
