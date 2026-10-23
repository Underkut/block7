// BLOCK7 · Sweeter 알림 서버(wallet-functions/src/b7push-core.js)의 규칙
//
// 예전 두 서버(versepush · block7Notify)를 '예약표' 하나로 바꿨다 (2026-10-24, ROADMAP '알림 서버 정리').
// 여기서 지키는 것:
//   ① 말씀 알림이 **예전 versepush 와 같은 분에** 울린다 (간격 · 시각 · 요일 · 밤 넘김)
//   ② 예약은 '다음 한 번' 만 적고, 보낼 때는 **그때 상태로 다시 판정**한다 (설정을 바꿨으면 옛 예약대로 안 보냄)
//   ③ 늦은 틱(3분 안)은 보내고, 겹친 틱은 두 번 안 보낸다
//   ④ Sweeter 는 **제 설정으로 따로** 울리고 BLOCK7 설정을 물려받지 않는다 (HB 결정 (가))
//   ⑤ 할일 알림 — 하루 요약 · 구간 시작 · 스몰 빼기 · 구간 문구 · 0분 구간 · 하루 시작 시각
//   ⑥ 할일·일정 펼치기가 **앱의 getDisplayTasks · getDisplayEvents 와 글자 하나까지 같다** (앱 함수를 떠와 나란히 돌린다)
//   ⑦ 말씀 고르기 — 순서 방식은 한 바퀴씩 돈다 · 랜덤은 방금 것을 피한다
const path = require('path');
const { slice, makeScorer } = require('./_load');
const C = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'b7push-core.js'));
const sc = makeScorer();

// 한국 시각 → ms
const at = (s) => Date.parse(s + ':00+09:00');
const hhmm = (ms) => { const w = C.wall(C.minOf(ms)); return String(Math.floor(w.hm / 60)).padStart(2, '0') + ':' + String(w.hm % 60).padStart(2, '0'); };
const VP = (o) => Object.assign({ enabled: true, order: 'random', timesOn: false, times: ['08:00'],
  interval: { on: true, from: '06:00', to: '18:00', everyMin: 10 }, days: [0, 1, 2, 3, 4, 5, 6] }, o || {});
const POOL = [
  { ref: '요 3:16', krText: '하나님이 세상을 이처럼 사랑하사', cat: '복음', topic: '사랑', br: 43003016 },
  { ref: '창 1:1', krText: '태초에 하나님이 천지를 창조하시니라', cat: '창조', br: 1001001 },
  { ref: '롬 8:28', krText: '모든 것이 합력하여 선을 이루느니라', br: 45008028, key: 'p7:A:P0001' },
];
const B7 = (settings, extra) => Object.assign({ settings: Object.assign({ versePushPool: POOL }, settings) }, extra || {});

console.log('\n① 말씀 알림이 울리는 분 — 예전 versepush 와 같은 판정');
{
  const c = C.verseCfg(VP());
  const fires = (s) => C.verseFires(c, C.wall(C.minOf(at(s))));
  sc.eq('06:00 (시작) 울림', fires('2026-10-24T06:00'), true);
  sc.eq('06:10 울림', fires('2026-10-24T06:10'), true);
  sc.eq('06:05 안 울림', fires('2026-10-24T06:05'), false);
  sc.eq('18:00 (끝, 포함) 울림', fires('2026-10-24T18:00'), true);
  sc.eq('18:10 안 울림', fires('2026-10-24T18:10'), false);
  const wk = C.verseCfg(VP({ days: [1, 2, 3, 4, 5] }));
  sc.eq('주중만 — 토요일(10/24) 안 울림', C.verseFires(wk, C.wall(C.minOf(at('2026-10-24T09:00')))), false);
  sc.eq('주중만 — 월요일(10/26) 울림', C.verseFires(wk, C.wall(C.minOf(at('2026-10-26T09:00')))), true);
  const night = C.verseCfg(VP({ interval: { on: true, from: '22:00', to: '02:00', everyMin: 60 } }));
  sc.eq('밤 넘김 23:00 울림', C.verseFires(night, C.wall(C.minOf(at('2026-10-24T23:00')))), true);
  sc.eq('밤 넘김 01:00 울림', C.verseFires(night, C.wall(C.minOf(at('2026-10-24T01:00')))), true);
  sc.eq('밤 넘김 03:00 안 울림', C.verseFires(night, C.wall(C.minOf(at('2026-10-24T03:00')))), false);
  const times = C.verseCfg(VP({ timesOn: true, times: ['07:05', '21:30'], interval: { on: false } }));
  sc.eq('시각 방식 07:05 울림', C.verseFires(times, C.wall(C.minOf(at('2026-10-24T07:05')))), true);
  sc.eq('시각 방식 07:06 안 울림', C.verseFires(times, C.wall(C.minOf(at('2026-10-24T07:06')))), false);
  sc.eq('enabled 꺼짐 → 예약 없음', C.verseCfg(VP({ enabled: false })), null);
  sc.eq('간격 10분 아래로는 안 내려감(5 → 10)', C.verseCfg(VP({ interval: { on: true, from: '06:00', to: '18:00', everyMin: 5 } })).iv.every, 10);
}

console.log('\n② 예약 — 다음 한 번만 적고, 보낼 때 다시 판정');
{
  const st = B7({ versePush: VP() });
  const cfg = C.configOf(st);
  sc.eq('07:03 다음은 07:10', hhmm(C.msOf(C.nextFire(cfg, C.minOf(at('2026-10-24T07:03'))))), '07:10');
  sc.eq('18:00 다음은 이튿날 06:00', hhmm(C.msOf(C.nextFire(cfg, C.minOf(at('2026-10-24T18:00'))))), '06:00');
  sc.eq('아무것도 안 켰으면 예약 없음', C.nextFire(C.configOf(B7({})), C.minOf(at('2026-10-24T07:03'))), null);

  const r = C.process(st, { at: at('2026-10-24T07:10') }, at('2026-10-24T07:10') + 20e3, () => 0);
  sc.eq('때가 된 예약 → 한 통', r.sends.length, 1);
  sc.eq('BLOCK7 말씀 · block7.my 로 열림', [r.sends[0].product, r.sends[0].link.startsWith('https://block7.my/?verse=')], ['block7', true]);
  sc.eq('다음 예약 07:20', hhmm(r.plan.at), '07:20');
  const again = C.process(st, Object.assign({}, r.plan, { at: at('2026-10-24T07:10') }), at('2026-10-24T07:10') + 40e3);
  sc.eq('같은 분에 틱이 또 와도 두 번 안 보냄', again.sends.length, 0);

  const late = C.process(st, { at: at('2026-10-24T07:10') }, at('2026-10-24T07:12') + 5e3);
  sc.eq('2분 늦은 틱 → 보낸다', late.sends.length, 1);
  const tooLate = C.process(st, { at: at('2026-10-24T07:10') }, at('2026-10-24T07:15') + 5e3);
  sc.eq('5분 늦으면 버린다 (07:10 은 안 보냄)', tooLate.sends.length, 0);
  sc.eq('…다음 예약은 07:20', hhmm(tooLate.plan.at), '07:20');

  const changed = B7({ versePush: VP({ interval: { on: true, from: '06:00', to: '18:00', everyMin: 15 } }) });
  const ch = C.process(changed, { at: at('2026-10-24T07:10') }, at('2026-10-24T07:10') + 5e3);
  sc.eq('예약 뒤 15분 간격으로 바꿈 → 07:10 은 안 보냄', ch.sends.length, 0);
  sc.eq('…다음은 07:15', hhmm(ch.plan.at), '07:15');

  const rp = C.replan(st, { sig: C.sigOf(cfg), at: at('2026-10-24T07:20') }, at('2026-10-24T07:13'));
  sc.eq('설정 지문이 같으면 예약을 안 건드림', rp.changed, false);
  const rp2 = C.replan(changed, { sig: C.sigOf(cfg), at: at('2026-10-24T07:20') }, at('2026-10-24T07:13'));
  sc.eq('설정이 바뀌면 지금부터 다시 → 07:15', [rp2.changed, hhmm(rp2.plan.at)], [true, '07:15']);
  const rp3 = C.replan(st, {}, at('2026-10-24T07:10') + 30e3);
  sc.eq('지금 켰는데 이 분이 울릴 분이면 이 분으로 (놓치지 않게)', hhmm(rp3.plan.at), '07:10');
  const off = C.replan(B7({ versePush: VP({ enabled: false }) }), { sig: 'x', at: at('2026-10-24T07:20') }, at('2026-10-24T07:13'));
  sc.eq('끄면 예약이 비고(at=null) 1분 틱에 안 걸린다', off.plan.at, null);
}

console.log('\n③ Sweeter — 제 설정으로 따로 (HB 결정 (가))');
{
  const sw = VP({ interval: { on: true, from: '09:00', to: '21:00', everyMin: 30 } });
  const swPool = [{ ref: '시 23:1', krText: '여호와는 나의 목자시니' }];
  const st = B7({ versePush: VP() }, { productSettings: { sweeter: { versePush: sw, versePushPool: swPool } } });
  const cfg = C.configOf(st);
  sc.eq('두 앱 다 켜짐', [!!cfg.v.block7, !!cfg.v.sweeter], [true, true]);
  const r = C.process(st, { at: at('2026-10-24T09:30') }, at('2026-10-24T09:30') + 5e3, () => 0);
  sc.eq('09:30 — 두 앱 각자 한 통', r.sends.map((m) => m.product).sort(), ['block7', 'sweeter']);
  const s = r.sends.find((m) => m.product === 'sweeter');
  sc.eq('Sweeter 는 제 목록에서 · sweeter.my 로 열림', [s.body.includes('여호와는 나의 목자시니'), s.link.startsWith('https://sweeter.my/?verse=')], [true, true]);
  sc.eq('Sweeter 알림 제목 기본값', s.title, 'Sweeter');
  const r2 = C.process(st, { at: at('2026-10-24T09:10') }, at('2026-10-24T09:10') + 5e3);
  sc.eq('09:10 — BLOCK7 만 (Sweeter 는 30분 간격)', r2.sends.map((m) => m.product), ['block7']);
  const onlyB7 = B7({ versePush: VP() });
  sc.eq('Sweeter 칸이 없으면 BLOCK7 설정을 물려받지 않는다', !!C.configOf(onlyB7).v.sweeter, false);
  const onlySw = B7({}, { productSettings: { sweeter: { versePush: sw } } });
  const r3 = C.process(onlySw, { at: at('2026-10-24T09:30') }, at('2026-10-24T09:30') + 5e3, () => 0);
  sc.eq('Sweeter 만 켬 → Sweeter 한 통 (목록이 없으면 BLOCK7 목록에서)', [r3.sends.length, r3.sends[0].product], [1, 'sweeter']);
  sc.eq('기기: product 없음 → BLOCK7 (옛 기기)', C.productOfToken({}), 'block7');
  sc.eq('기기: product sweeter → Sweeter', C.productOfToken({ product: 'sweeter' }), 'sweeter');
  sc.eq('Sweeter 의 할일 설정(notify)은 서버가 안 본다', C.configOf(B7({}, { productSettings: { sweeter: { notify: { enabled: true } } } })).m, null);
}

console.log('\n④ 예전 저장 모양 — {json:"…"} 문자열을 푼다');
{
  sc.eq('json 문자열', C.parseState({ json: JSON.stringify({ a: 1 }), rev: 3 }), { a: 1 });
  sc.eq('깨진 json → null (보내지 않음)', C.parseState({ json: '{' }), null);
}

// ── 할일 자료 ──
const DAYS = {
  '2026-10-20': {
    big: { am: [{ text: '운동', repeat: { daily: true }, rid: 'r1' }, { text: '끝난 일', done: true }, { text: '  ' }] },
    small: { am: [{ text: '물 마시기', repeat: { weekly: true }, rid: 'r2' }] },
    events: {
      am: [{ text: '회의', time: '09:00', repeat: { daily: true, daysOfWeek: [1, 2, 3, 4, 5], ex: ['2026-10-22'] } }],
      pm: [{ text: '여행', time: '', g: { c: 'x', i: 'y', d: 3 } }, { text: '주간 점검', time: '16:00', repeat: { weekly: true, weeksOfMonth: [4] } }],
    },
  },
  '2026-10-23': { big: { am: [{ text: '운동', rid: 'r1', done: true }] } },
  '2026-10-24': {
    big: { pm: [{ text: '보고서', done: false }], am: [] },
    small: { pm: [{ text: '우편', done: false }] },
    events: { pm: [{ text: '점심 약속', time: '12:30' }], am: [{ text: '아침 기도', time: '06:30', repeat: { daily: true, until: '2026-10-25' } }] },
  },
  '2026-10-25': { events: { am: [{ text: '예배', time: '11:00' }] } },
};
const SECS = [
  { id: 'dawn', name: '새벽', startTime: '03:00', endTime: '06:00' },
  { id: 'am', name: '오전', startTime: '06:00', endTime: '12:00', notifyPhrase: '화이팅!' },
  { id: 'zero', name: '빈칸', startTime: '12:00', endTime: '12:00' },
  { id: 'pm', name: '오후', startTime: '12:00', endTime: '18:00' },
  { id: 'night', name: '밤', startTime: '18:00', endTime: '03:00' },
];
const todo = (notify, extra) => Object.assign({
  days: JSON.parse(JSON.stringify(DAYS)), secs: SECS, vis: ['dawn', 'am', 'zero', 'pm', 'night'],
  settings: { notify: Object.assign({ enabled: true, morningTime: '07:00', sections: true, includeSmall: true, morningSuffix: '할 일', sectionSuffix: '할 일' }, notify) },
}, extra || {});

console.log('\n⑤ 할일 알림 — 하루 요약 · 구간 시작');
{
  const st = todo();
  const r = C.process(st, { at: at('2026-10-24T07:00') }, at('2026-10-24T07:00') + 5e3);
  sc.eq('07:00 하루 요약 한 통 (BLOCK7 기기로)', r.sends.map((m) => [m.product, m.kind, m.title]), [['block7', 'todo', '오늘 할 일']]);
  sc.eq('요약 내용 — 반복 일정 · 반복 할일(미리보기)까지, 끝난 일 · 빈 글 빼고 (10/24 토)',
    r.sends[0].body.split('\n'),
    ['오전: 06:30 아침 기도, 운동', '오후: 12:30 점심 약속, 보고서, 우편']);
  const tue = C.process(st, { at: at('2026-10-27T07:00') }, at('2026-10-27T07:00') + 5e3);
  sc.eq('10/27 (넷째 화요일) — 매주 할일 · 넷째 주 일정이 나오고, 끝난 반복 일정(아침 기도 ~10/25)은 빠짐',
    tue.sends[0].body.split('\n'), ['오전: 09:00 회의, 운동, 물 마시기', '오후: 16:00 주간 점검']);
  const wed = C.process(st, { at: at('2026-10-21T07:00') }, at('2026-10-21T07:00') + 5e3);
  sc.eq('10/21 — 구글 사흘 일정이 둘째 날에도', wed.sends[0].body.split('\n'), ['오전: 09:00 회의, 운동', '오후: 여행']);
  const noSmall = C.process(todo({ includeSmall: false }), { at: at('2026-10-24T07:00') }, at('2026-10-24T07:00') + 5e3);
  sc.eq('스몰 블럭 빼기', noSmall.sends[0].body.split('\n'), ['오전: 06:30 아침 기도, 운동', '오후: 12:30 점심 약속, 보고서']);
  const sfx = C.process(todo({ morningSuffix: '화이팅!' }), { at: at('2026-10-24T07:00') }, at('2026-10-24T07:00') + 5e3);
  sc.eq('하루 요약 문구', sfx.sends[0].title, '오늘 화이팅!');
  const legacy = C.process(todo({ morningSuffix: undefined, titleSuffix: 'to-do' }), { at: at('2026-10-24T07:00') }, at('2026-10-24T07:00') + 5e3);
  sc.eq('옛 단일 문구(titleSuffix) 를 물려받음', legacy.sends[0].title, '오늘 to-do');
  const empty = C.process(todo({}, { days: {} }), { at: at('2026-10-24T07:00') }, at('2026-10-24T07:00') + 5e3);
  sc.eq('할 것 없는 날도 요약은 간다', empty.sends[0].body, '오늘 등록된 할일·일정이 없어요.');

  const pm = C.process(st, { at: at('2026-10-24T12:00') }, at('2026-10-24T12:00') + 5e3);
  sc.eq('12:00 — 0분 구간(빈칸)은 건너뛰고 오후 한 통', pm.sends.map((m) => m.title), ['오후 할 일']);
  sc.eq('…내용은 줄마다 하나', pm.sends[0].body.split('\n'), ['12:30 점심 약속', '보고서', '우편']);
  const am = C.process(st, { at: at('2026-10-24T06:00') }, at('2026-10-24T06:00') + 5e3);
  sc.eq('구간별 알림 문구가 공용 문구보다 앞선다', am.sends.map((m) => m.title), ['오전 화이팅!']);
  const night = C.process(st, { at: at('2026-10-24T18:00') }, at('2026-10-24T18:00') + 5e3);
  sc.eq('할 것 없는 구간은 조용히', night.sends.length, 0);
  const off = C.configOf(todo({ sections: false }));
  sc.eq('구간 알림 끔 → 요약만 예약', [off.m, off.s], [420, null]);
  const hidden = C.configOf(todo({}, { vis: ['am'] }));
  sc.eq('보이지 않는 구간은 예약에서 빠짐', hidden.s, [360]);
  sc.eq('할일 알림 꺼짐 → 예약 없음', C.hasAny(C.configOf(todo({ enabled: false }))), false);
  sc.eq('다음 예약: 07:00 다음은 12:00', hhmm(r.plan.at), '12:00');

  // 하루 시작 시각 4시 — 새벽 3시는 아직 '어제'
  const dsh = todo({}, { settings: { dayStartHour: 4, notify: { enabled: true, morningTime: '07:00', sections: true } } });
  dsh.days['2026-10-24'].big.dawn = [{ text: '어제 몫 새벽 일' }];
  const dawn = C.process(dsh, { at: at('2026-10-25T03:00') }, at('2026-10-25T03:00') + 5e3);
  sc.eq('하루 시작 4시 — 10/25 03:00 은 10/24 의 새벽', dawn.sends.map((m) => m.body), ['어제 몫 새벽 일']);
}

console.log('\n⑥ 할일·일정 펼치기 — 앱 함수와 나란히');
{
  const RULE = slice('function _repRule(rep){', 'function getDisplayEvents(k,secId){');
  const EVT = slice('function getDisplayEvents(k,secId){', '// Renders each event as a small rounded-rect chip');
  const SUBHELP = slice('// ── 하위·메모: 자료 다루기 (순수 함수) ──', '// ── 하위·메모: 화면 ──');
  const TASK = slice('// ═══════ 할일의 반복 ═══════', 'function moveTaskTo(days,toSec,markDone){');
  const SPAN = slice('function _gcalSpanN(ev){', 'function _gcalMD(k)');
  const DIFF = slice('function gcalDayDiff(a,b){', ';}\n') + ';}';
  const appFor = (todayK, dsh) => {
    const ST = { days: JSON.parse(JSON.stringify(DAYS)), settings: { dayStartHour: dsh || 0 } };
    const env = {
      ST, z: (n) => String(n).padStart(2, '0'), todayKey: () => todayK, tKey: () => todayK,
      weekOfMonth: (d) => Math.ceil(d.getDate() / 7),
      getDay: (k) => { if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [], events: {} }; if (!ST.days[k].events) ST.days[k].events = {}; return ST.days[k]; },
      rawSave() {}, save() {}, showToast() {}, esc: (s) => String(s || ''), document: { getElementById: () => null },
    };
    env.getBigs = (k, id) => { const d = env.getDay(k); if (!d.big[id]) d.big[id] = []; return d.big[id]; };
    env.getSmalls = (k, id) => { const d = env.getDay(k); if (!d.small[id]) d.small[id] = []; return d.small[id]; };
    env.getEvents = (k, id) => { const d = env.getDay(k); if (!d.events[id]) d.events[id] = []; return d.events[id]; };
    const names = Object.keys(env);
    const body = RULE + '\n' + SUBHELP + '\n' + TASK + '\n' + SPAN + '\n' + DIFF + '\n' + EVT + '\nreturn {getDisplayTasks,getDisplayEvents};';
    return new Function(...names, body)(...names.map((n) => env[n]));
  };
  const keys = ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-11-03'];
  const pickT = (a) => a.map((t) => [t.text, !!t.done]);
  const pickE = (a) => a.map((e) => [e.text, e.time || '']);
  let same = 0, diff = [];
  ['2026-10-20', '2026-10-24'].forEach((todayK) => [0, 4].forEach((dsh) => {
    const app = appFor(todayK, dsh);
    const st = { days: JSON.parse(JSON.stringify(DAYS)), settings: { dayStartHour: dsh } };
    keys.forEach((k) => ['am', 'pm', 'dawn'].forEach((sid) => {
      const a1 = JSON.stringify([pickT(app.getDisplayTasks(k, sid, 'big')), pickT(app.getDisplayTasks(k, sid, 'small')), pickE(app.getDisplayEvents(k, sid))]);
      const a2 = JSON.stringify([pickT(C.displayTasks(st, k, sid, 'big', todayK)), pickT(C.displayTasks(st, k, sid, 'small', todayK)), pickE(C.displayEvents(st, k, sid))]);
      if (a1 === a2) same++; else diff.push(`${todayK}/${dsh} ${k} ${sid}\n      앱  ${a1}\n      서버 ${a2}`);
    }));
  }));
  sc.eq('120 경우 모두 앱과 같다', diff, []);
  sc.eq('…견준 경우의 수', same + diff.length, 120);
  const app = appFor('2026-10-20', 0);
  sc.eq('(자료 확인) 10/22 회의는 뺀 날', pickE(app.getDisplayEvents('2026-10-22', 'am')), []);
  sc.eq('(자료 확인) 10/21 구글 여러 날 일정이 이어짐', pickE(app.getDisplayEvents('2026-10-21', 'pm')), [['여행', '']]);
}

console.log('\n⑦ 말씀 고르기');
{
  const st = B7({});
  let cur, got = [];
  for (let i = 0; i < 4; i++) { const r = C.pickVerse(st, 'block7', 'added', cur); cur = r.cur; got.push(r.verse.ref); }
  sc.eq('등록순 — 한 바퀴 돌고 처음으로', got, ['요 3:16', '창 1:1', '롬 8:28', '요 3:16']);
  cur = undefined; got = [];
  for (let i = 0; i < 3; i++) { const r = C.pickVerse(st, 'block7', 'bible', cur); cur = r.cur; got.push(r.verse.ref); }
  sc.eq('성경순 — 창 · 요 · 롬', got, ['창 1:1', '요 3:16', '롬 8:28']);
  cur = undefined; got = [];
  for (let i = 0; i < 2; i++) { const r = C.pickVerse(st, 'block7', 'recent', cur); cur = r.cur; got.push(r.verse.ref); }
  sc.eq('최신순 — 목록 끝부터', got, ['롬 8:28', '창 1:1']);
  const liked = B7({}, { verseLikeLog: { '2026-10-20': [{ ref: '창 1:1' }, { ref: '창 1:1' }], '2026-10-21': [{ ref: '롬 8:28' }] } });
  cur = undefined; got = [];
  for (let i = 0; i < 3; i++) { const r = C.pickVerse(liked, 'block7', 'like', cur); cur = r.cur; got.push(r.verse.ref); }
  sc.eq('좋아요순 — 많은 것부터 돈다', got, ['창 1:1', '롬 8:28', '요 3:16']);
  const r1 = C.pickVerse(st, 'block7', 'random', { last: '요 3:16' }, () => 0);
  sc.eq('랜덤 — 방금 보낸 것은 피한다', r1.verse.ref !== '요 3:16', true);
  const prop = C.verseMsg(st, 'block7', POOL[2]);
  sc.eq('명제 열쇠(key)로 열고, 보이는 글은 장절', [prop.ref, prop.body.endsWith('롬 8:28')], ['p7:A:P0001', true]);
  sc.eq('제목 — 대분류 · 소주제', C.verseMsg(st, 'block7', POOL[0]).title, '복음 · 사랑');
  sc.eq('목록이 비면 안 보냄', C.pickVerse({ settings: {} }, 'block7', 'random').verse, null);
  sc.eq('TTL — 10분 간격이면 10분', C.verseMsg(B7({ versePush: VP() }), 'block7', POOL[0]).ttl, 600);
}

sc.done();
