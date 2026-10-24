// 시리로 할일 넣기 — 서버 쪽 (wallet-functions/src/b7siri.js · b7siri-core.js, docs/ROADMAP.md '시리로 할일 넣기')
// 지키는 것:
//  ① 단축어가 어떤 모양으로 보내도 받는다 — JSON {text} · 양식 · 글 그대로 · ?t= · 공백 정리 · 200자
//  ② 주소 열쇠 — 24글자 · 서버는 해시만 둔다 · ⭐ 새로 만들면 그 사람의 옛 열쇠는 멈춘다 · 로그인 토큰 없으면 못 만든다
//  ③ ⭐ 받으면 쪽지함(pray/{uid}/c/b7inbox)에 한 줄 — 앱이 받는 모양 {id,from:'siri',say,at,date,text}
//  ④ ⭐ 쓰는 자리는 쪽지함 · b7siri 두 곳뿐 — users/ 는 읽지도 쓰지도 않는다
//  ⑤ 쪽지함이 50개면 더 받지 않는다 (외부 입력 규모 상한) · 틀린 열쇠 · 빈 말은 아무것도 안 쓴다
//  ⑥ 대답은 늘 200 + 시리가 읽을 글 (단축어 '결과 보기')
//  ⑦ ⭐ 끝까지 — 서버가 넣은 쪽지를 앱의 받기 · 풀기가 그대로 날 · 구간 · 내용으로 넣는다
//  ⑧ 묶음(index.js)이 내보낸다
const fs = require('fs'), path = require('path'), Module = require('module');
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
const SRCDIR = path.join(__dirname, '..', 'wallet-functions', 'src');
const C = require(path.join(SRCDIR, 'b7siri-core.js'));

console.log('\n① 받은 말 고르기');
sc.eq('JSON {text}', C.textOf({ body: { text: '내일 오전 우유 사기' } }), '내일 오전 우유 사기');
sc.eq('글 그대로 · Buffer · JSON 글', [C.textOf({ body: '  내일   우유 ' }), C.textOf({ body: Buffer.from('모레 심방') }), C.textOf({ body: '{"text":"글피 병원"}' })], ['내일 우유', '모레 심방', '글피 병원']);
sc.eq('양식 t= · 주소 ?t=', [C.textOf({ body: { t: '점심 약' } }), C.textOf({ body: {}, query: { t: '저녁 운동' } })], ['점심 약', '저녁 운동']);
sc.eq('200자 · 없음 · 이상한 값', [C.textOf({ body: { text: 'ㄱ'.repeat(300) } }).length, C.textOf({}), C.textOf({ body: { text: { a: 1 } } }), C.textOf(null)], [200, '', '', '']);
sc.eq('열쇠는 주소 ?k= (또는 본문 k)', [C.keyOf({ query: { k: 'abc' } }), C.keyOf({ query: {}, body: { k: 'xyz' } }), C.keyOf({})], ['abc', 'xyz', '']);

console.log('\n② 열쇠');
const k1 = C.newKey();
sc.eq('24글자 · 주소에 그대로 넣을 수 있는 글자', [k1.length, /^[A-Za-z0-9_-]+$/.test(k1), C.keyOk(k1)], [24, true, true]);
sc.eq('매번 다르다', C.newKey() !== C.newKey(), true);
sc.eq('틀린 모양은 거른다', [C.keyOk(''), C.keyOk('짧다'), C.keyOk('a'.repeat(19)), C.keyOk('a b'.repeat(10)), C.keyOk(null)], [false, false, false, false, false]);
sc.eq('해시는 같은 열쇠에 늘 같고, 열쇠 그대로가 아니다', [C.hashKey(k1) === C.hashKey(k1), C.hashKey(k1).length, C.hashKey(k1).indexOf(k1)], [true, 64, -1]);

console.log('\n③ 쪽지 모양');
{
  const now = Date.parse('2026-10-25T23:30:00+09:00');
  const it = C.item('내일 오전 우유', now, 'ab12');
  sc.eq('앱이 받는 모양', [it.from, it.say, it.text, it.sec, it.at, /^siri-/.test(it.id)], ['siri', '내일 오전 우유', '내일 오전 우유', '', now, true]);
  sc.eq('date = 한국 날짜 (밤 11시 30분 → 그날)', it.date, '2026-10-25');
  sc.eq('한국 자정 넘기면 다음 날', C.kstDate(Date.parse('2026-10-26T00:10:00+09:00')), '2026-10-26');
}

// ── 가짜 Firestore · Functions — 처리기(b7siri.js)를 그대로 돌린다 ──
const store = new Map();   // 경로 → 자료
const writes = [];         // 쓴 경로
const reads = [];          // 읽은 경로
const AU = (v) => ({ __au: v });
function put(p, data, merge) {
  writes.push(p);
  const cur = merge ? Object.assign({}, store.get(p) || {}) : {};
  for (const [k, v] of Object.entries(data)) {
    if (v && v.__au) { const arr = Array.isArray(cur[k]) ? cur[k].slice() : []; v.__au.forEach(x => { if (!arr.some(y => JSON.stringify(y) === JSON.stringify(x))) arr.push(x); }); cur[k] = arr; }
    else cur[k] = v;
  }
  store.set(p, cur);
}
const snap = (p) => { reads.push(p); const d = store.get(p); return { exists: !!d, data: () => d, get: (k) => d && d[k], ref: docRef(p) }; };
function docRef(p) { return { path: p, get: async () => snap(p), set: async (d, o) => put(p, d, o && o.merge), delete: async () => { writes.push(p); store.delete(p); } }; }
const fakeDb = {
  doc: (p) => docRef(p),
  collection: (c) => ({
    doc: (id) => docRef(c + '/' + id),
    where: (f, op, v) => ({ get: async () => { reads.push(c + '?' + f); return { docs: [...store.keys()].filter(k => k.startsWith(c + '/') && k.split('/').length === 2 && store.get(k)[f] === v).map(k => ({ ref: docRef(k) })) }; } }),
  }),
  batch: () => { const ops = []; return { delete: (r) => ops.push(() => { writes.push(r.path); store.delete(r.path); }), set: (r, d) => ops.push(() => put(r.path, d)), commit: async () => ops.forEach(f => f()) }; },
  runTransaction: async (fn) => fn({ get: async (r) => snap(r.path), set: (r, d, o) => put(r.path, d, o && o.merge), update: (r, d) => put(r.path, d, true) }),
};
const TOKENS = { 'tok-hb': 'uidHB', 'tok-kim': 'uidKIM' };
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
const BOX = (uid) => store.get('pray/' + uid + '/c/b7inbox');

(async () => {
  console.log('\n② 주소 만들기 (/key)');
  const r0 = await call({ path: '/key', headers: {} });
  sc.eq('로그인 토큰 없으면 401 · 아무것도 안 쓴다', [r0.code, writes.length], [401, 0]);
  sc.eq('GET 은 405', (await call({ path: '/key', method: 'GET', headers: { authorization: 'Bearer tok-hb' } })).code, 405);
  const r1 = await call({ path: '/key', headers: { authorization: 'Bearer tok-hb' } });
  const key1 = r1.body && r1.body.key;
  sc.eq('열쇠를 준다', [r1.code, C.keyOk(key1)], [200, true]);
  sc.eq('⭐ 서버에는 해시만 — b7siri/{해시} = {uid}', [store.has('b7siri/' + C.hashKey(key1)), store.get('b7siri/' + C.hashKey(key1)).uid, [...store.keys()].some(k => k.indexOf(key1) >= 0)], [true, 'uidHB', false]);
  const rk = await call({ path: '/key', headers: { authorization: 'Bearer tok-kim' } });
  const key2 = (await call({ path: '/key', headers: { authorization: 'Bearer tok-hb' } })).body.key;
  sc.eq('⭐ 새로 만들면 옛 열쇠는 지운다 (다른 사람 열쇠는 그대로)', [store.has('b7siri/' + C.hashKey(key1)), store.has('b7siri/' + C.hashKey(key2)), store.has('b7siri/' + C.hashKey(rk.body.key))], [false, true, true]);

  console.log('\n③ ⑤ ⑥ 받기 (단축어)');
  writes.length = 0;
  const old = await call({ query: { k: key1 }, body: { text: '내일 오전 우유 사기' } });
  sc.eq('⭐ 멈춘 옛 열쇠 → 주소가 맞지 않다 · 아무것도 안 쓴다', [old.code, old.hdr['X-B7-Siri'], /주소가 맞지 않아요/.test(old.body), writes.length], [200, 'badkey', true, 0]);
  const bad = await call({ query: { k: 'x' }, body: { text: '우유' } });
  sc.eq('모양이 틀린 열쇠', [bad.hdr['X-B7-Siri'], writes.length], ['badkey', 0]);
  const empty = await call({ query: { k: key2 }, body: { text: '   ' } });
  sc.eq('빈 말 → 다시 말해 달라 · 안 쓴다', [empty.hdr['X-B7-Siri'], /다시 말해/.test(empty.body), writes.length], ['notext', true, 0]);
  const ok = await call({ query: { k: key2 }, body: { text: '  모레   저녁 심방 ' } });
  sc.eq('⭐ 받으면 200 · 시리가 읽을 글', [ok.code, ok.hdr['X-B7-Siri'], ok.body], [200, 'ok', '블럭세븐에 보냈어요. 모레 저녁 심방']);
  const box = BOX('uidHB');
  sc.eq('⭐ 쪽지함에 한 줄', [box && box.items.length, box && box.items[0].from, box && box.items[0].say], [1, 'siri', '모레 저녁 심방']);
  sc.eq('⭐ 쓴 자리는 쪽지함 하나', writes, ['pray/uidHB/c/b7inbox']);
  sc.eq('⭐ users/ 는 읽지 않는다', reads.some(p => /^users\//.test(p)), false);
  // 기도노트가 넣어 둔 쪽지와 함께 산다 (merge · arrayUnion)
  store.set('pray/uidKIM/c/b7inbox', { items: [{ id: 'p1', date: '2026-10-26', sec: 'pm', text: '가족 심방', at: 1 }] });
  await call({ query: { k: rk.body.key }, body: '내일 우유' });
  sc.eq('기도노트 쪽지는 그대로 두고 뒤에 붙인다', BOX('uidKIM').items.map(x => x.id === 'p1' ? 'p1' : x.from), ['p1', 'siri']);
  for (let i = 0; i < 60; i++) await call({ query: { k: key2 }, body: { text: '할일 ' + i } });
  const full = await call({ query: { k: key2 }, body: { text: '넘침' } });
  sc.eq('⭐ 50개에서 멈춘다 · 그 뒤는 열어 달라는 대답', [BOX('uidHB').items.length, full.hdr['X-B7-Siri'], /블럭세븐을 한 번 열어/.test(full.body)], [50, 'full', true]);
  const g = await call({ method: 'GET', query: { k: rk.body.key, t: '글피 병원' }, body: undefined });
  sc.eq('브라우저 시험 GET ?t=', g.hdr['X-B7-Siri'], 'ok');
  // 데이터베이스가 터져도 대답은 200 + 다시 해 달라
  const keep = fakeDb.runTransaction; fakeDb.runTransaction = async () => { throw new Error('down'); };
  const down = await call({ query: { k: key2 }, body: { text: '우유' } });
  fakeDb.runTransaction = keep;
  sc.eq('서버가 아프면 다시 해 달라는 대답', [down.code, down.hdr['X-B7-Siri']], [200, 'fail']);

  console.log('\n④ 쓰는 자리 — 코드에서');
  const CODE = fs.readFileSync(path.join(SRCDIR, 'b7siri.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  sc.eq('⭐ users/ 가 코드에 없다', /users\//.test(CODE), false);
  sc.eq('쓰는 자리는 b7siri · pray/{uid}/c/b7inbox 뿐', [(CODE.match(/collection\("([^"]+)"\)/g) || []), (CODE.match(/doc\(`([^`]+)`\)/g) || [])], [['collection("b7siri")'], ['doc(`pray/${uid}/c/b7inbox`)']]);

  console.log('\n⑦ 끝까지 — 서버 쪽지 → 앱 받기 · 풀기');
  {
    const B0 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 ('), B1 = SRC.indexOf('// ═══════ 기도노트 → 할일 받기 끝', B0);
    const BLOCK = SRC.slice(B0, B1);
    const place = new Function(BLOCK.slice(BLOCK.indexOf('const _PRAY_TODO_MAX'), BLOCK.indexOf('let _prayTodoUnsub')) + '; return _prayTodoPlace;')();
    const F = new Function(slice('// ═══════ 시리 → 할일 (', '// ── 시리: 앱에 잇는 자리 ──') + '; return {_siriParse};')();
    const d0 = SRC.indexOf('const DEFAULT_SECS=['), DEF = new Function(SRC.slice(d0, SRC.indexOf('];', d0) + 2) + '; return DEFAULT_SECS;')();
    const parse = (n) => n.from === 'siri' ? F._siriParse(n.say, n.at, DEF, ['am', 'pm', 'night'], 0) : null;
    const at = new Date(2026, 9, 25, 8, 0).getTime();
    const items = ['내일 오전 우유 사기', '10월 30일 저녁 심방', '점심때 약 먹기'].map((t, i) => C.item(C.textOf({ body: { text: t } }), at, 'x' + i));
    sc.eq('⭐ 날 · 구간 · 내용으로 들어간다', place(items, DEF.map(s => s.id), parse).map(p => [p.date, p.sec, p.text]),
      [['2026-10-26', 'am', '우유 사기'], ['2026-10-30', 'eve', '심방'], ['2026-10-25', 'morn', '약 먹기']]);
  }

  console.log('\n⑧ 묶음');
  const IDX = fs.readFileSync(path.join(SRCDIR, 'index.js'), 'utf8');
  sc.eq('index.js 가 b7siri 를 내보낸다', /exports\.b7siri = require\("\.\/b7siri"\)\.b7siri;/.test(IDX), true);
  sc.eq('앱의 주소와 서버 이름 · 지역이 같다', [/B7SIRI_FN='https:\/\/asia-northeast3-block7-8f24e\.cloudfunctions\.net\/b7siri'/.test(SRC), /const REGION = "asia-northeast3";/.test(fs.readFileSync(path.join(SRCDIR, 'b7siri.js'), 'utf8'))], [true, true]);
  sc.done();
})().catch(e => { console.error(e); process.exit(1); });
