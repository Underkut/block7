// 휴지통 — 모든 날 한 목록 · 30일 · 속성 통째 보관 (v. 26-1031-6, HB 1031 1-1-4)
//
// 예전: ① 보고 있는 날짜의 휴지통만 보였다 ② 되살리면 긴급·메모·하위 할일이 사라졌다
//       (글자·완료·깃발·연락·밀림만 남겼다) ③ 오래된 것이 끝없이 쌓였다.
// 저장 모양(ST.days[k].trash)은 그대로다 — 동기화 병합이 날짜 단위라 손대지 않는다.
const { makeScorer, slice } = require('./_load');
const sc = makeScorer();
const SRC_T = slice('// ═══════ TRASH ═══════', '// ═══════ TABS ═══════');

function boot(days, today) {
  const env = { toasts: [], saves: 0, confirmAns: true, rendered: [] };
  const ST = { days: days || {} };
  const SECS = [{ id: 'am', name: '오전' }, { id: 'pm', name: '오후' }];
  const getDay = k => { if (!ST.days[k]) ST.days[k] = { big: {}, small: {}, trash: [] }; if (!ST.days[k].trash) ST.days[k].trash = []; return ST.days[k]; };
  const getTrash = k => getDay(k).trash;
  const getBigs = (k, s) => { const d = getDay(k); return d.big[s] || (d.big[s] = []); };
  const getSmalls = (k, s) => { const d = getDay(k); return d.small[s] || (d.small[s] = []); };
  const tKey = () => today || '2026-10-31';
  const els = {};
  const document = { getElementById: id => els[id] || (els[id] = { classList: { add() {}, remove() {} }, appendChild(c) { (this.kids = this.kids || []).push(c); }, set innerHTML(v) { this.kids = []; this._h = v; }, get innerHTML() { return this._h; } }),
    createElement: () => ({ append() {}, appendChild() {} }) };
  const _dfDay = k => k;
  const _toastName = t => t + '\n';
  const fn = new Function('ST', 'SECS', 'getDay', 'getTrash', 'getBigs', 'getSmalls', 'tKey', 'document', '_toastName', 'env',
    `const save=()=>env.saves++,rawSave=()=>{},beforeSave=()=>{},showToast=t=>env.toasts.push(t),
     renderSecBody=s=>env.rendered.push(s),updateTotal=()=>{},refreshTaskViewsLive=()=>{},confirm=()=>env.confirmAns;
     ${SRC_T}
     return {sendToTrash,_trashAll,_trashCount,_trashPurgeOld,restoreFromTrash,clearTrash,openTrash,_trashRestored};`);
  const api = fn(ST, SECS, getDay, getTrash, getBigs, getSmalls, tKey, document, _toastName, env);
  return { ST, env, api, getBigs, getSmalls, getTrash };
}
const NOW = Date.now();
const D = n => NOW - n * 86400000;

console.log('시나리오 1 — 지웠다 되살리면 속성이 전부 돌아온다');
{
  const { api, getBigs, getTrash } = boot();
  const t = { text: '수련회 준비', done: false, flag: true, urgent: true, memo: '숙소 두 곳 비교', subs: [{ text: '숙소', done: true }, { text: '차량', done: false }], contactTask: true, autoCarryCount: 2 };
  api.sendToTrash('2026-10-31', 'big', 'am', t);
  t.subs[0].text = '바뀜';   // 원본을 나중에 고쳐도 휴지통 것은 그대로여야 한다(복사)
  sc.eq('휴지통에 들어갔다', getTrash('2026-10-31').length, 1);
  api.restoreFromTrash('2026-10-31', 0);
  const r = getBigs('2026-10-31', 'am')[0];
  sc.eq('긴급', r.urgent, true);
  sc.eq('메모', r.memo, '숙소 두 곳 비교');
  sc.eq('하위 할일 둘', r.subs.length, 2);
  sc.eq('하위 할일 글자는 지울 때 그대로(복사)', r.subs[0].text, '숙소');
  sc.eq('깃발 · 연락 · 밀림', [r.flag, r.contactTask, r.autoCarryCount], [true, true, 2]);
  sc.eq('휴지통은 비었다', getTrash('2026-10-31').length, 0);
}

console.log('\n시나리오 2 — 반복 묶음 표시는 떼고 되살린다 (하루짜리)');
{
  const { api, getSmalls } = boot();
  api.sendToTrash('2026-10-30', 'small', 'pm', { text: '찬양 콘티', rid: 'r1', repeat: { freq: 'weekly' }, urgent: true });
  api.restoreFromTrash('2026-10-30', 0);
  const r = getSmalls('2026-10-30', 'pm')[0];
  sc.eq('rid 없음', r.rid, undefined);
  sc.eq('repeat 없음', r.repeat, undefined);
  sc.eq('긴급은 남음', r.urgent, true);
}

console.log('\n시나리오 3 — 모든 날을 모아 최근 것이 위 · 지운 그 날로 되살린다');
{
  const { api, env, getBigs } = boot({
    '2026-10-28': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', secName: '오전', text: '사흘 전', ts: D(3) }] },
    '2026-10-31': { big: {}, small: {}, trash: [{ type: 'big', secId: 'pm', secName: '오후', text: '방금', ts: D(0) }] }
  });
  const all = api._trashAll();
  sc.eq('두 건', all.length, 2);
  sc.eq('최근 것이 위', all.map(x => x.e.text), ['방금', '사흘 전']);
  sc.eq('보는 날이 아닌 날도 센다', api._trashCount(), 2);
  api.restoreFromTrash('2026-10-28', 0);
  sc.eq('10.28 오전으로 돌아갔다', getBigs('2026-10-28', 'am').map(x => x.text), ['사흘 전']);
  sc.eq('오늘 칸에는 안 생긴다', getBigs('2026-10-31', 'am').length, 0);
  sc.eq('다른 날이면 토스트로 알린다', env.toasts.length === 1 && env.toasts[0].includes('10월 28일'), true);
}

console.log('\n시나리오 4 — 예전 항목(item 없음)은 예전 필드로 되살린다');
{
  const { api, getBigs } = boot({ '2026-10-31': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', text: '옛것', done: true, flag: true, daily: true, ts: D(1) }] } });
  api.restoreFromTrash('2026-10-31', 0);
  sc.eq('옛 필드', getBigs('2026-10-31', 'am')[0], { text: '옛것', done: true, daily: true, flag: true });
}

console.log('\n시나리오 5 — 30일 지난 것: 목록에서 빠지고, 열면 비운다 (휴지통 안의 것만)');
{
  const { api, ST, env } = boot({
    '2026-09-01': { big: { am: [{ text: '그날 할일' }] }, small: {}, trash: [{ type: 'big', secId: 'am', text: '오래됨', ts: D(40) }] },
    '2026-10-20': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', text: '열흘', ts: D(10) }, { type: 'big', secId: 'am', text: '서른하루', ts: D(31) }] },
    '2026-01-01': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', text: 'ts 없음 아주 옛것' }] }
  });
  sc.eq('목록은 30일 안의 것만', api._trashAll().map(x => x.e.text), ['열흘']);
  api.openTrash();
  sc.eq('열면 지난 것이 비워진다', ST.days['2026-10-20'].trash.map(x => x.text), ['열흘']);
  sc.eq('ts 없는 옛것은 그 날짜로 쳐서 비운다', ST.days['2026-01-01'].trash.length, 0);
  sc.eq('날 문서의 할일은 그대로', ST.days['2026-09-01'].big.am.length, 1);
  sc.eq('지운 게 있으니 저장', env.saves, 1);
  api.openTrash();
  sc.eq('지울 게 없으면 저장 안 함', env.saves, 1);
}

console.log('\n시나리오 6 — 전체 삭제는 모든 날 · 묻고 나서');
{
  const { api, ST, env } = boot({
    '2026-10-28': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', text: 'a', ts: D(3) }] },
    '2026-10-31': { big: {}, small: {}, trash: [{ type: 'big', secId: 'am', text: 'b', ts: D(0) }] }
  });
  env.confirmAns = false; api.clearTrash();
  sc.eq('아니오면 그대로', api._trashCount(), 2);
  env.confirmAns = true; api.clearTrash();
  sc.eq('예면 모든 날 비움', [ST.days['2026-10-28'].trash.length, ST.days['2026-10-31'].trash.length], [0, 0]);
}

sc.done();
