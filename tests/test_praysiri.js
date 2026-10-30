// 기도노트 시리로 기도 넣기 — 서버 쪽 (wallet-functions/src/praysiri.js · praysiri-core.js, docs/ROADMAP.md '기도노트 시리로 기도 넣기')
// ⚠️ 이름은 전부 지어낸 것이다 (공개 저장소 — CLAUDE.md '기도노트도 따로 돈다').
// 지키는 것:
//  ① 말 끝 떼기 — '…이라고 기도 추가해 줘' · '서브그룹 추가' · '그룹 만들어 줘' · 낱말에 붙은 것은 안 뗀다 · 받침 맞는 조사만
//  ② 한 번에 말하기 — 그룹 › 서브그룹 › 항목 · 띄어쓰기 무시 · 가장 긴 이름 · 낱말 가운데서 안 끊음 · 한 글자 틀림 · 같은 서브그룹 이름은 모호
//  ③ ⭐ 다시 묻기(HB 결정 1) — 첫 번째(try=1)에 못 알아들으면 쓰지 않고 '다시 말해' · 둘째에 그룹만 말해도 첫 말과 이어 푼다 · 그래도 안 되면 받은 기도
//  ④ 골라서 넣기 — 그룹 목록 · 그 그룹 목록(여기에 바로 · 서브그룹 · 새 서브그룹) · 고른 길로 넣기
//  ⑤ ⭐ 처리기 — 앱별 열쇠(기도노트 열쇠를 새로 만들어도 BLOCK7 주소는 그대로 · 서로의 주소로는 못 보냄) · 우체통에 한 줄 · 차림표만 읽는다 · 50개 상한
//  ⑥ ⭐ 끝까지 — 서버가 넣은 쪽지를 앱(pray-core inboxApply)이 그대로 그 자리 맨 위에 넣는다
const fs = require('fs'), path = require('path'), vm = require('vm'), Module = require('module');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const SRCDIR = path.join(__dirname, '..', 'wallet-functions', 'src');
const C = require(path.join(SRCDIR, 'praysiri-core.js'));
const K = require(path.join(SRCDIR, 'b7siri-core.js'));

const RAW = { v: 1, g: [
  { i: 'yo', n: '청년부', p: '', a: [] }, { i: 'y1', n: '1셀', p: 'yo', a: [] }, { i: 'y2', n: '2셀', p: 'yo', a: [] },
  { i: 'fa', n: '가족', p: '', a: [] }, { i: 'f1', n: '첫째', p: 'fa', a: [] }, { i: 'sh', n: '공동 기도', p: 'fa', a: ['yo'] },
  { i: 'in', n: '스데반 인턴십', p: '', a: [] }, { i: 'i1', n: '1셀', p: 'in', a: [] },
  { i: 'ch', n: '청년', p: '', a: [] }] };
const D = C.dirOf(RAW);
const P = (t) => { const r = C.parse(t, D); return r.ok ? [r.kind, r.gid, r.text] : [r.why]; };

console.log('\n① 말 끝 떼기');
sc.eq('…이라고 기도 추가해줘 · 라고 추가해 줘 · 넣어줘 · 넣기', ['김가나 회복이라고 기도 추가해줘', '수련회라고 추가해 줘', '이사 넣어줘', '이사 넣기'].map(t => C.cutEnd(t).body), ['김가나 회복', '수련회', '이사', '이사']);
sc.eq('⭐ 종류 — 서브그룹 · 하위 그룹 · 그룹 · 기도 항목', ['새가족이라고 서브그룹 추가해줘', '새가족을 하위 그룹으로 만들어 줘', '중보팀이라고 그룹 만들어줘', '중보팀 그룹 추가', '감사 기도 추가'].map(t => [C.cutEnd(t).body, C.cutEnd(t).kind]),
  [['새가족', 'sub'], ['새가족', 'sub'], ['중보팀', 'group'], ['중보팀', 'group'], ['감사', 'item']]);
sc.eq('⭐ 낱말에 붙은 것은 안 뗀다 — 새벽기도 · 등록금 · 기도모임', ['새벽기도 추가', '대학 등록금', '기도모임'].map(t => C.cutEnd(t).body), ['새벽기도', '대학 등록금', '기도모임']);
sc.eq('⭐ 받침 맞는 조사만 — 아이라고 · 마을을 · 회복이라고 · 학교로', ['아이라고 추가', '마을을 추가', '회복이라고 추가', '학교로 추가'].map(t => C.cutEnd(t).body), ['아이', '마을', '회복', '학교']);
sc.eq('동사가 없으면 조사(을/를/로)는 그대로 · 라고는 뗀다', ['마을을', '회복이라고'].map(t => C.cutEnd(t).body), ['마을을', '회복']);

console.log('\n② 한 번에 말하기');
sc.eq('⭐ 그룹 › 서브그룹 › 항목', P('청년부에 1셀에 김가나 회복이라고 기도 추가해줘'), ['item', 'y1', '김가나 회복']);
sc.eq('⭐ 그룹 › 항목', P('청년부에 수련회 장소라고 추가해 줘'), ['item', 'yo', '수련회 장소']);
sc.eq('⭐ 그룹 › 새 서브그룹', P('청년부에 새가족이라고 서브그룹 추가해줘'), ['sub', 'yo', '새가족']);
sc.eq('⭐ 새 그룹 · "A 에 B 라고 그룹 추가" 는 A 아래 서브그룹', [P('중보팀이라고 그룹 추가해줘'), P('가족에 둘째라고 그룹 추가')], [['group', '', '중보팀'], ['sub', 'fa', '둘째']]);
sc.eq('서브그룹 이름이 하나뿐이면 그룹 없이도', P('첫째에 수능이라고 기도 추가'), ['item', 'f1', '수능']);
sc.eq('⭐ 같은 서브그룹 이름이 두 그룹에 → 모호', P('1셀에 다라 기도 추가'), ['amb']);
sc.eq('연동한 서브그룹은 두 그룹 아래서 다 찾는다', [P('청년부에 공동 기도에 감사'), P('가족에 공동기도에 감사')], [['item', 'sh', '감사'], ['item', 'sh', '감사']]);
sc.eq('⭐ 띄어쓰기 무시 · 조사 없이 띄어 말해도', [P('스데반인턴십에 마을 잔치를 추가'), P('청년 부에 가나'), P('청년부에1셀에 가나'), P('청년부 2셀 마바')], [['item', 'in', '마을 잔치'], ['item', 'yo', '가나'], ['item', 'y1', '가나'], ['item', 'y2', '마바']]);
sc.eq('⭐ 가장 긴 이름 먼저 (청년 · 청년부) · 낱말 가운데서 안 끊는다', [P('청년부에 가나'), P('청년에 가나'), P('청년단체에 가나')], [['item', 'yo', '가나'], ['item', 'ch', '가나'], ['nogroup']]);
sc.eq('이름 뒤가 띄어쓰기면 조사로 안 뗀다 (로마서)', P('청년부 로마서 묵상'), ['item', 'yo', '로마서 묵상']);
sc.eq('⭐ 한 글자 틀림은 알아듣는다 (세 글자 넘는 이름 · 하나로 정해질 때)', [P('청연부에 2셀에 마바 이직'), P('스테반 인턴십에 리더')], [['item', 'y2', '마바 이직'], ['item', 'in', '리더']]);
sc.eq('그룹 없음 · 그룹만 말함 · 빈 말', [P('김가나 회복'), P('청년부'), P('  ')], [['nogroup'], ['notext'], ['notext']]);
sc.eq('있는 서브그룹 · 있는 그룹은 또 안 만든다', [P('청년부에 1셀이라고 서브그룹 추가'), P('가족이라고 그룹 추가')], [['dup'], ['dup']]);

console.log('\n③ 다시 묻기 (HB 결정 1)');
const T = (b) => C.decide(b, RAW);
{
  const a = T({ text: '김가나 회복이라고 추가해줘', try: '1' });
  sc.eq('⭐ 첫 번째에 못 알아들으면 쓰지 않고 다시 묻는다 (단축어 만약 — "다시 말해")', [!!a.r, a.reply.code, /다시 말해/.test(a.reply.msg)], [false, 'retry', true]);
  sc.eq('다시 물을 때 그룹 이름을 읽어 준다 (받침 맞게)', /그룹은 청년부, 가족, 스데반 인턴십, 청년이 있어요/.test(a.reply.msg), true);
  const b = T({ text: '가족', prev: '김가나 회복이라고 추가해줘' });
  sc.eq('⭐ 둘째에 그룹만 — 첫 말의 내용과 이어 넣는다', [b.r.gid, b.r.text, b.reply.msg], ['fa', '김가나 회복', '가족에 넣었어요. 김가나 회복']);
  const c = T({ text: '청년부', prev: '청연뷰에 2셀에 마바 이직이라고 기도 추가' });
  sc.eq('⭐ 둘째에 그룹만 — 첫 말의 못 알아들은 그룹 자리를 갈아 끼운다 (서브그룹 · 내용은 첫 말에서)', [c.r.gid, c.r.text], ['y2', '마바 이직']);
  const d = T({ text: '김가나 회복', prev: '청년부' });
  sc.eq('첫 말이 그룹뿐이었으면 둘째는 내용', [d.r.gid, d.r.text], ['yo', '김가나 회복']);
  const e = T({ text: '가족에 첫째 수능', prev: '어딘가에 다른 것' });
  sc.eq('둘째에 통째로 다시 말하면 그것', [e.r.gid, e.r.text], ['f1', '수능']);
  const f = T({ text: '없는부', prev: '청연뷰에 다라 회복이라고 추가' });
  sc.eq('⭐ 두 번째도 못 알아들으면 받은 기도 — 첫 말을 그대로(잃지 않게) · 시리가 그렇다고', [f.r.hold, f.r.text, f.reply.code, /시리로 받은 기도/.test(f.reply.msg), /다시 말해/.test(f.reply.msg)], [true, '청연뷰에 다라 회복', 'hold', true, false]);
  const g = T({ text: '김가나 회복' });
  sc.eq('try 가 없으면(만약 없는 단축어) 처음부터 마지막 — 받은 기도', [g.r.hold, g.reply.code], [true, 'hold']);
  sc.eq('빈 말 — 첫 번째는 다시 묻고 · 마지막은 안 넣는다', [T({ text: '', try: '1' }).reply.code, T({ text: '' }).reply.code, !!T({ text: '' }).r], ['retry', 'notext', false]);
  sc.eq('그룹만 말함 — 무엇을 넣을지 다시', T({ text: '청년부', try: '1' }).reply.msg, '청년부에 무엇을 넣을지 다시 말해 주세요.');
  sc.eq('모호 — 그룹 이름을 다시', /1셀이 여러 그룹에 있어요\. 그룹 이름을 다시 말해/.test(T({ text: '1셀에 다라', try: '1' }).reply.msg), true);
  sc.eq('이미 있으면 안 쓰고 그렇다고', [!!T({ text: '가족이라고 그룹 추가', try: '1' }).r, T({ text: '가족이라고 그룹 추가', try: '1' }).reply.msg], [false, '가족 그룹이 이미 있어요.']);
  const n = C.decide({ text: '청년부에 가나', try: '1' }, null);
  sc.eq('⭐ 차림표가 없으면(앱이 아직 안 씀) 받은 기도 + 기도노트를 열어 달라', [n.r.hold, n.reply.code], [true, 'nodir']);
  sc.eq('다시 묻는 대답에만 "다시 말해" (단축어 만약이 이것으로 갈린다)', ['ok', 'sub', 'group', 'hold'].map(k => /다시 말해/.test(C.REPLY.ok({ kind: k === 'ok' ? 'item' : k === 'hold' ? 'item' : k, hold: k === 'hold', top: '가', sub: '나', text: '다' }).msg)).concat([/다시 말해/.test(C.REPLY.noDir.msg), /다시 말해/.test(C.REPLY.noText.msg), /다시 말해/.test(C.REPLY.full.msg), /다시 말해/.test(C.REPLY.fail.msg), /다시 말해/.test(C.REPLY.badKey.msg)]), [false, false, false, false, false, false, false, false, false]);
}

console.log('\n④ 골라서 넣기');
sc.eq('⭐ 그룹 목록 — 지도 차례 + 새 그룹 만들기', C.listText({ list: '1' }, RAW).split('\n'), ['청년부', '가족', '스데반 인턴십', '청년', C.NEW_GROUP]);
sc.eq('⭐ 그 그룹 목록 — 여기에 바로 · 서브그룹(연동 포함) · 새 서브그룹', C.listText({ list: '1', g: '청년부' }, RAW).split('\n'), [C.HERE, '1셀', '2셀', '공동 기도', C.NEW_SUB]);
sc.eq('새 그룹 만들기를 고르면 이름 말하기 하나', C.listText({ list: '1', g: C.NEW_GROUP }, RAW), C.SAY_NAME);
sc.eq('차림표가 없으면 열어 달라는 한 줄', C.listText({ list: '1' }, null), '기도노트를 한 번 열어 주세요');
const Q = (g, s, text) => { const d = T({ g, s, text }); return d.r ? [d.r.kind, d.r.gid, d.r.text, !!d.r.hold] : [d.reply.code]; };
sc.eq('⭐ 고른 길로 — 여기에 바로 · 서브그룹 · 새 서브그룹 · 새 그룹', [Q('청년부', C.HERE, '수련회'), Q('청년부', '2셀', '마바 이직이라고 추가해 줘'), Q('가족', C.NEW_SUB, '둘째'), Q(C.NEW_GROUP, C.SAY_NAME, '중보팀')],
  [['item', 'yo', '수련회', false], ['item', 'y2', '마바 이직', false], ['sub', 'fa', '둘째', false], ['group', '', '중보팀', false]]);
sc.eq('그새 서브그룹이 사라졌으면 그룹에 · 그룹이 사라졌으면 받은 기도', [Q('청년부', '9셀', '가나'), Q('없는 그룹', C.HERE, '가나')], [['item', 'yo', '가나', false], ['item', '', '가나', true]]);
sc.eq('받은 기도 그룹이 이미 있으면 그 id 로', C.decide({ text: '가나' }, { v: 1, g: RAW.g.concat([{ i: 'hd', n: C.HOLD, p: '' }]) }).r.gid, 'hd');

console.log('\n⑤ 처리기');
const store = new Map(), writes = [], reads = [];
const AU = (v) => ({ __au: v });
function put(p, data, merge) {
  writes.push(p);
  const cur = merge ? Object.assign({}, store.get(p) || {}) : {};
  for (const [k, v] of Object.entries(data)) {
    if (v && v.__au) { const arr = Array.isArray(cur[k]) ? cur[k].slice() : []; v.__au.forEach(x => arr.push(x)); cur[k] = arr; } else cur[k] = v;
  }
  store.set(p, cur);
}
const snap = (p) => { reads.push(p); const d = store.get(p); return { exists: !!d, data: () => d, get: (k) => d && d[k], ref: docRef(p) }; };
function docRef(p) { return { path: p, get: async () => snap(p), set: async (d, o) => put(p, d, o && o.merge) }; }
const fakeDb = {
  doc: (p) => docRef(p),
  collection: (c) => ({
    doc: (id) => docRef(c + '/' + id),
    where: (f, op, v) => ({ get: async () => ({ docs: [...store.keys()].filter(k => k.startsWith(c + '/') && k.split('/').length === 2 && store.get(k)[f] === v).map(k => ({ ref: docRef(k), get: (x) => store.get(k)[x] })) }) }),
  }),
  batch: () => { const ops = []; return { delete: (r) => ops.push(() => { writes.push(r.path); store.delete(r.path); }), set: (r, d) => ops.push(() => put(r.path, d)), commit: async () => ops.forEach(f => f()) }; },
  runTransaction: async (fn) => fn({ get: async (r) => snap(r.path), set: (r, d, o) => put(r.path, d, o && o.merge) }),
};
const TOKENS = { 'tok-hb': 'uidHB' };
const stubs = {
  'firebase-functions/v2/https': { onRequest: (opt, h) => h },
  'firebase-admin/firestore': { getFirestore: () => fakeDb, FieldValue: { arrayUnion: (...v) => AU(v) } },
  'firebase-admin/auth': { getAuth: () => ({ verifyIdToken: async (t) => { if (!TOKENS[t]) throw new Error('bad'); return { uid: TOKENS[t] }; } }) },
};
const _load = Module._load;
Module._load = function (req, ...rest) { return stubs[req] || _load.call(this, req, ...rest); };
const H = require(path.join(SRCDIR, 'b7siri.js')).b7siri;
Module._load = _load;
async function call(o) {
  const res = { code: 0, body: null, hdr: {}, status(c) { this.code = c; return this; }, set(k, v) { this.hdr[k] = v; return this; }, type() { return this; }, json(b) { if (!this.code) this.code = 200; this.body = b; return this; }, send(b) { if (!this.code) this.code = 200; this.body = b; return this; } };
  await H(Object.assign({ path: '/', method: 'POST', headers: {}, query: {}, body: {} }, o), res);
  return res;
}
const BOX = () => (store.get('pray/uidHB/c/inbox') || {}).items || [];
const AUTHZ = { authorization: 'Bearer tok-hb' };

(async () => {
  sc.eq('주소 만들기 — 로그인 토큰 없으면 401', (await call({ path: '/pray/key' })).code, 401);
  const b7key = (await call({ path: '/key', headers: AUTHZ })).body.key;
  const pk1 = (await call({ path: '/pray/key', headers: AUTHZ })).body.key;
  sc.eq('⭐ 기도노트 열쇠 — app:pray · 해시만', [K.keyOk(pk1), store.get('b7siri/' + K.hashKey(pk1)).app, [...store.keys()].some(k => k.indexOf(pk1) >= 0)], [true, 'pray', false]);
  sc.eq('⭐ 기도노트 열쇠를 만들어도 BLOCK7 열쇠는 그대로', store.has('b7siri/' + K.hashKey(b7key)), true);
  const pk2 = (await call({ path: '/pray/key', headers: AUTHZ })).body.key;
  sc.eq('⭐ 기도노트 열쇠를 새로 만들면 옛 기도노트 열쇠만 멈춘다', [store.has('b7siri/' + K.hashKey(pk1)), store.has('b7siri/' + K.hashKey(pk2)), store.has('b7siri/' + K.hashKey(b7key))], [false, true, true]);
  const b7key2 = (await call({ path: '/key', headers: AUTHZ })).body.key;
  sc.eq('⭐ BLOCK7 열쇠를 새로 만들어도 기도노트 열쇠는 그대로', [store.has('b7siri/' + K.hashKey(pk2)), store.has('b7siri/' + K.hashKey(b7key)), store.has('b7siri/' + K.hashKey(b7key2))], [true, false, true]);

  writes.length = 0; reads.length = 0;
  const cross1 = await call({ path: '/pray', query: { k: b7key2 }, body: { text: '청년부에 가나' } });
  const cross2 = await call({ path: '/', query: { k: pk2 }, body: { text: '내일 우유' } });
  sc.eq('⭐ 서로의 주소로는 못 보낸다 (BLOCK7 열쇠 → 기도노트 · 기도노트 열쇠 → 할일) · 아무것도 안 쓴다', [cross1.hdr['X-B7-Siri'], cross2.hdr['X-B7-Siri'], writes.length], ['badkey', 'badkey', 0]);
  sc.eq('틀린 열쇠', (await call({ path: '/pray', query: { k: 'x' }, body: { text: '가나' } })).hdr['X-B7-Siri'], 'badkey');

  const nodir = await call({ path: '/pray', query: { k: pk2 }, body: { text: '청년부에 가나', try: '1' } });
  sc.eq('차림표 없음 → 받은 기도에 넣고 열어 달라', [nodir.hdr['X-B7-Siri'], BOX().length, BOX()[0] && BOX()[0].hold], ['nodir', 1, 1]);
  store.delete('pray/uidHB/c/inbox');
  store.set('pray/uidHB/c/siridir', RAW);

  writes.length = 0; reads.length = 0;
  const ok = await call({ path: '/pray', query: { k: pk2 }, body: { text: '청년부에 1셀에 김가나 회복이라고 기도 추가해줘', try: '1' } });
  sc.eq('⭐ 받으면 200 · 들어간 자리를 되읽는다', [ok.code, ok.hdr['X-B7-Siri'], ok.body], [200, 'ok', '청년부의 1셀에 넣었어요. 김가나 회복']);
  sc.eq('⭐ 우체통 쪽지 — 앱이 받는 모양', BOX().map(x => [x.from, x.gid, x.text, x.say, /^siri-/.test(x.id), typeof x.at]), [['siri', 'y1', '김가나 회복', '청년부에 1셀에 김가나 회복이라고 기도 추가해줘', true, 'number']]);
  sc.eq('⭐ 쓴 자리는 우체통 하나 · 읽은 자리는 열쇠 · 차림표 · 우체통', [writes, reads.filter(p => !/^b7siri\//.test(p))], [['pray/uidHB/c/inbox'], ['pray/uidHB/c/siridir', 'pray/uidHB/c/inbox']]);
  const r1 = await call({ path: '/pray', query: { k: pk2 }, body: JSON.stringify({ text: '김가나 회복', try: '1' }) });
  sc.eq('⭐ 첫 번째에 못 알아들으면 쓰지 않는다', [r1.hdr['X-B7-Siri'], BOX().length], ['retry', 1]);
  const r2 = await call({ path: '/pray', query: { k: pk2 }, body: { text: '가족', prev: '김가나 회복' } });
  sc.eq('⭐ 둘째 — 이어 풀어 넣고 들은 말은 둘 다 남긴다', [r2.hdr['X-B7-Siri'], BOX()[1].gid, BOX()[1].text, BOX()[1].say], ['ok', 'fa', '김가나 회복', '김가나 회복 / 가족']);
  const sub = await call({ path: '/pray', query: { k: pk2 }, body: { g: '청년부', s: C.NEW_SUB, text: '새가족' } });
  sc.eq('골라서 — 새 서브그룹 쪽지', [sub.body, BOX()[2].kind, BOX()[2].gid, BOX()[2].text], ['청년부에 서브그룹 새가족을 만들었어요.', 'sub', 'yo', '새가족']);
  const ls = await call({ path: '/pray', query: { k: pk2 }, body: { list: '1', g: '가족' } });
  sc.eq('⭐ 목록 — 글 한 줄에 하나 · 쓰지 않는다', [ls.hdr['X-B7-Siri'], ls.body.split('\n'), BOX().length], ['list', [C.HERE, '첫째', '공동 기도', C.NEW_SUB], 3]);
  const lsGet = await call({ path: '/pray', method: 'GET', query: { k: pk2, list: '1' }, body: undefined });
  sc.eq('브라우저 시험 GET ?list=1', lsGet.body.split('\n')[0], '청년부');
  for (let i = 0; i < 60; i++) await call({ path: '/pray', query: { k: pk2 }, body: { text: '가족에 기도 ' + i } });
  const full = await call({ path: '/pray', query: { k: pk2 }, body: { text: '가족에 넘침' } });
  sc.eq('⭐ 우체통 50개에서 멈춘다', [BOX().length, full.hdr['X-B7-Siri'], /기도노트를 한 번 열어/.test(full.body)], [50, 'full', true]);
  const keep = fakeDb.runTransaction; fakeDb.runTransaction = async () => { throw new Error('down'); };
  store.delete('pray/uidHB/c/inbox');
  const down = await call({ path: '/pray', query: { k: pk2 }, body: { text: '가족에 가나' } });
  fakeDb.runTransaction = keep;
  sc.eq('서버가 아프면 200 + 잠시 뒤에', [down.code, down.hdr['X-B7-Siri']], [200, 'fail']);

  const CODE = fs.readFileSync(path.join(SRCDIR, 'praysiri.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  sc.eq('⭐ 코드 — 기도노트 자료 덩어리 · users/ 를 안 건드린다 (차림표 · 우체통만)', [(CODE.match(/doc\(`([^`]+)`\)/g) || []), /users\//.test(CODE)], [['doc(`pray/${uid}/c/siridir`)', 'doc(`pray/${uid}/c/inbox`)'], false]);

  console.log('\n⑥ 끝까지 — 서버 쪽지 → 앱 inboxApply');
  {
    const HTML = fs.readFileSync(path.join(__dirname, '..', 'pray', 'index.html'), 'utf8');
    const m = HTML.match(/<script id="pray-core">([\s\S]*?)<\/script>/);
    const ctx = { console }; vm.createContext(ctx);
    vm.runInContext(m[1] + '\nthis.A = { emptyDB, newGroup, newTarget, inboxApply, siriDir, topGroups, kidsOf, findT, SIRI_HOLD };', ctx);
    const A = ctx.A, db = A.emptyDB();
    const yo = A.newGroup('청년부', '#123456'), y1 = A.newGroup('1셀', '#123456'); y1.parent = yo.id; db.G.push(yo, y1);
    const fa = A.newGroup('가족', '#654321'); db.G.push(fa);
    db.T.push(A.newTarget('person', '김가나'));
    const dir = JSON.parse(JSON.stringify(A.siriDir(db)));   // 앱이 쓴 차림표 그대로 서버가 읽는다
    sc.eq('앱 차림표의 이름 · 글자 수', [C.SAY_NAME.length > 0, A.SIRI_HOLD === C.HOLD], [true, true]);
    const notes = [];
    const send = (b) => { const d = C.decide(b, dir); if (d.r) notes.push(C.note(d.r, b.text, 1000 + notes.length, 'x' + notes.length)); return d.reply; };
    send({ text: '청년부에 1셀에 김가나라고 기도 추가해줘', try: '1' });
    send({ text: '청년부에 새가족이라고 서브그룹 추가해줘', try: '1' });
    send({ text: '중보팀이라고 그룹 추가', try: '1' });
    send({ g: '가족', s: C.HERE, text: '이사' });
    send({ text: '아무데나', prev: '모르는 것' });
    const r = A.inboxApply(db, notes);
    const names = (g) => g.lines.map(l => A.findT(db, l.segs[0][0])).map(t => t.name + ':' + t.kind);
    sc.eq('⭐ 들어간 수 · 만든 수 · 받은 기도', [r.n, r.made, r.held, r.siri], [3, 2, 1, 5]);
    sc.eq('⭐ 1셀 맨 위에 김가나 — 이미 있는 사람 카드', names(y1), ['김가나:person']);
    sc.eq('⭐ 청년부 아래 새가족 · 지도 맨 위에 받은 기도 · 중보팀', [A.kidsOf(db, yo.id).map(k => k.name), A.topGroups(db).map(g => g.name)], [['새가족', '1셀'], [C.HOLD, '중보팀', '청년부', '가족']]);
    sc.eq('가족에 이사 · 받은 기도에 첫 말 그대로', [names(fa), names(A.topGroups(db)[0])], [['이사:item'], ['모르는 것:item']]);
  }

  sc.eq('⑤ 묶음 — b7siri 가 /pray 를 praysiri 로', /require\("\.\/praysiri"\)/.test(fs.readFileSync(path.join(SRCDIR, 'b7siri.js'), 'utf8')), true);
  const PH = fs.readFileSync(path.join(__dirname, '..', 'pray', 'index.html'), 'utf8');
  sc.eq('앱의 주소와 서버 이름 · 지역이 같다', /const SIRI_FN = 'https:\/\/asia-northeast3-block7-8f24e\.cloudfunctions\.net\/b7siri'/.test(PH) && /SIRI_FN \+ '\/pray\/key'/.test(PH) && /SIRI_FN \+ '\/pray\?k='/.test(PH), true);
  sc.eq('앱이 차림표를 쓰는 자리 = 서버가 읽는 자리', /'pray\/' \+ who \+ '\/c\/siridir'/.test(PH), true);
  sc.done();
})().catch(e => { console.error(e); process.exit(1); });
