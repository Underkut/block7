// 심방 녹음(plaudhub) 보안 규칙 시험 — 에뮬레이터에서 돈다 (tests/rules/README.md).
// HB 만 읽고 씀 · 칸 이름 못 박기(일감 칸에 제목 없음) · 녹음 번호 꼴 · 맡은 시각 = 파이어베이스 시계 · 요청 이름 목록 · 남 · 로그인 안 한 사람.
// 두 Mac 이 같은 일감을 동시에 집을 때 한 대만 되는지도 실제 트랜잭션으로 본다. 이름은 모두 지어낸 것.
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import fs from 'fs';
const env = await initializeTestEnvironment({ projectId: 'demo-plaud', firestore: { rules: fs.readFileSync('plaud.rules', 'utf8'), host: '127.0.0.1', port: 8089 } });
const ID = 'f_' + 'a1'.repeat(16), ID2 = 'f_' + 'b2'.repeat(16);
await env.withSecurityRulesDisabled(async c => {
  const db = c.firestore();
  await db.doc('plaud/hb').set({ kw: ['심방'], days: 14 });
  await db.doc('plaud/hb/rec/' + ID).set({ n: '김하늘 집사 심방', t: 1, c: 1, d: 60 });
  await db.doc('plaud/hb/job/' + ID).set({ pick: 'in' });
});
const hb = env.authenticatedContext('hb', { email: 'hb@example.com' }).firestore(), out = env.authenticatedContext('uzz', { email: 'zz@example.com' }).firestore(), anon = env.unauthenticatedContext().firestore();
let n = 0, bad = 0; const t = async (name, p, ok) => { n++; try { await (ok ? assertSucceeds(p) : assertFails(p)); console.log('  ✓', name); } catch (e) { bad++; console.log('  ✗', name, e.message); } };
const ST = firebase.firestore.FieldValue.serverTimestamp();

// 설정
await t('HB 는 설정을 읽는다', hb.doc('plaud/hb').get(), true);
await t('HB 는 키워드 · 기간 · 모델을 쓴다', hb.doc('plaud/hb').set({ kw: ['심방', '상담'], days: 30, model: 'medium-q5_0' }, { merge: true }), true);
await t('설정에 모르는 칸(memo)은 못 넣는다', hb.doc('plaud/hb').set({ memo: '전사문' }, { merge: true }), false);
await t('키워드는 20개까지', hb.doc('plaud/hb').set({ kw: Array.from({ length: 21 }, (_, i) => 'k' + i) }, { merge: true }), false);
await t('(P3b) Mac 마다 자동 전사 켜기 · 끄기', hb.doc('plaud/hb').set({ auto: { 사무실: false } }, { merge: true }), true);
await t('(P3b) 잠금 표지(소금 · 반복 수 · iv · 잠근 표지)', hb.doc('plaud/hb').set({ kdf: { s: 'c2FsdA==', it: 600000, iv: 'aXY=', c: 'Y3Q=' } }, { merge: true }), true);
await t('(P3b) 표지에 암호 칸(pass)은 못 넣는다', hb.doc('plaud/hb').set({ kdf: { s: 'x', it: 1, iv: 'x', c: 'x', pass: '비밀' } }, { merge: true }), false);
await t('(P3b) auto 는 묶음(map) 꼴만', hb.doc('plaud/hb').set({ auto: false }, { merge: true }), false);
await t('남은 설정을 못 읽는다', out.doc('plaud/hb').get(), false);
await t('로그인 안 하면 못 읽는다', anon.doc('plaud/hb').get(), false);
await t('남은 HB 칸에 못 쓴다', out.doc('plaud/hb').set({ kw: [] }), false);
await t('남도 자기 칸은 따로 쓴다(남남)', out.doc('plaud/uzz').set({ kw: ['x'] }), true);
// 녹음 줄
await t('HB 는 녹음 줄을 쓴다(제목 · 시각 · 길이)', hb.doc('plaud/hb/rec/' + ID2).set({ n: '박소망 성도 전화심방', t: 5, c: 6, d: 700 }), true);
await t('HB 는 녹음 줄을 읽는다', hb.collection('plaud/hb/rec').get(), true);
await t('녹음 줄에 전사문 칸(text)은 못 넣는다', hb.doc('plaud/hb/rec/' + ID2).set({ text: '…' }, { merge: true }), false);
await t('녹음 번호 꼴이 아니면 못 쓴다', hb.doc('plaud/hb/rec/a.b').set({ n: 'x' }), false);
await t('제목이 너무 길면(300자 넘게) 못 쓴다', hb.doc('plaud/hb/rec/' + ID2).set({ n: 'ㄱ'.repeat(301) }, { merge: true }), false);
await t('남은 녹음 줄을 못 읽는다', out.doc('plaud/hb/rec/' + ID).get(), false);
await t('HB 는 녹음 줄을 지운다(PLAUD 에서 지워진 것)', hb.doc('plaud/hb/rec/' + ID2).delete(), true);
// 일감
await t('HB 는 계기판에서 고르고 뺀다(pick)', hb.doc('plaud/hb/job/' + ID).set({ pick: 'out' }, { merge: true }), true);
await t('처음 고르는 녹음(일감 줄이 아직 없음)도 고른다', hb.doc('plaud/hb/job/' + 'f_' + 'd4'.repeat(16)).set({ pick: 'in' }, { merge: true }), true);
await t('pick 은 in · out 만', hb.doc('plaud/hb/job/' + ID).set({ pick: 'maybe' }, { merge: true }), false);
await t('맡기: 상태 · 단계 · Mac · 파이어베이스 시계', hb.doc('plaud/hb/job/' + ID).set({ st: 'work', step: 'get', mac: '집', at: ST }, { merge: true }), true);
await t('맡은 시각을 Mac 시계(숫자)로는 못 찍는다', hb.doc('plaud/hb/job/' + ID).set({ at: 12345 }, { merge: true }), false);
await t('맡은 시각을 그대로 두고 pick 만 바꾼다', hb.doc('plaud/hb/job/' + ID).set({ pick: 'in' }, { merge: true }), true);
await t('일감 칸에 제목(n)은 못 넣는다', hb.doc('plaud/hb/job/' + ID).set({ n: '김하늘 집사 심방' }, { merge: true }), false);
await t('일감 칸에 전사문(text)은 못 넣는다', hb.doc('plaud/hb/job/' + ID).set({ text: '…' }, { merge: true }), false);
await t('모르는 상태(st: maybe)는 못 쓴다', hb.doc('plaud/hb/job/' + ID).set({ st: 'maybe' }, { merge: true }), false);
await t('모르는 단계는 못 쓴다', hb.doc('plaud/hb/job/' + ID).set({ step: 'send' }, { merge: true }), false);
await t('실패 까닭은 120자까지', hb.doc('plaud/hb/job/' + ID).set({ st: 'fail', err: 'x'.repeat(121) }, { merge: true }), false);
await t('남은 일감을 못 읽는다', out.doc('plaud/hb/job/' + ID).get(), false);
await t('남은 일감을 못 집는다', out.doc('plaud/hb/job/' + ID).set({ st: 'work', mac: '남', at: ST }, { merge: true }), false);
// 두 Mac 이 같은 녹음을 동시에 집기 — 트랜잭션이라 한 대만 된다(같은 계정 둘 = 집 · 사무실)
{
  const home = env.authenticatedContext('hb').firestore(), office = env.authenticatedContext('hb').firestore();
  const ID3 = 'f_' + 'c3'.repeat(16);
  const grab = (db, mac) => db.runTransaction(async tx => {
    const ref = db.doc('plaud/hb/job/' + ID3), s = await tx.get(ref);
    if (s.exists && s.data().st === 'work') return 'busy';
    await new Promise(r => setTimeout(r, 120));   // 둘이 모두 '비었음' 을 본 뒤에 쓰게
    tx.set(ref, { st: 'work', step: 'get', mac, at: ST }, { merge: true }); return 'took';
  });
  const r = await Promise.all([grab(home, '집'), grab(office, '사무실')]);
  const s = await home.doc('plaud/hb/job/' + ID3).get();
  n++; const ok = r.filter(x => x === 'took').length === 1 && r.includes('busy') && ['집', '사무실'].includes(s.data().mac);
  if (ok) console.log('  ✓ 동시에 집으면 한 대만 맡는다 (' + s.data().mac + ')'); else { bad++; console.log('  ✗ 동시에 집으면 한 대만 맡는다', JSON.stringify(r)); }
}
// Mac 소식
await t('도우미는 소식을 파이어베이스 시계로 쓴다', hb.doc('plaud/hb/mac/집').set({ at: ST, doing: '쉼', ready: { brew: true }, v: 'h. 26-1123-1', err: '', cli: 'plaud 0.3.15' }), true);
await t('소식 시각을 Mac 시계로는 못 쓴다', hb.doc('plaud/hb/mac/집').set({ at: 1, doing: '쉼' }), false);
await t('소식에 모르는 칸(path)은 못 넣는다', hb.doc('plaud/hb/mac/집').set({ at: ST, path: '/Users/…' }), false);
await t('(P3) 소식에 깔린 모델 목록 · 모델 시험 결과(시간 · 빠르기)', hb.doc('plaud/hb/mac/집').set({ at: ST, doing: '전사 중 3분째', models: ['large-v3-turbo-q5_0'],
  test: { at: 1, len: 600, r: { 'large-v3-turbo-q5_0': { s: 130, x: 4.6 } } } }, { merge: true }), true);
await t('(P3) 모델 목록은 목록 꼴 · 10개까지', hb.doc('plaud/hb/mac/집').set({ at: ST, models: Array.from({ length: 11 }, (_, i) => 'm' + i) }, { merge: true }), false);
await t('(P3) 모델 시험 결과는 묶음(map) 꼴만', hb.doc('plaud/hb/mac/집').set({ at: ST, test: '시험 전사 글' }, { merge: true }), false);
await t('(P3) 소식에 전사 글 칸(text)은 못 넣는다', hb.doc('plaud/hb/mac/집').set({ at: ST, text: '…' }, { merge: true }), false);
await t('(P3b) 소식에 저장 공간(남은 공간 · 모델 · 임시 파일 크기)', hb.doc('plaud/hb/mac/집').set({ at: ST, disk: { free: 41e9, models: 1e9, work: { [ID]: 2e7 } } }, { merge: true }), true);
await t('Mac 이름이 너무 길면 못 쓴다', hb.doc('plaud/hb/mac/' + '가'.repeat(25)).set({ at: ST }), false);
await t('계기판은 Mac 카드를 지운다', hb.doc('plaud/hb/mac/집').delete(), true);
await t('남은 소식을 못 읽는다', out.collection('plaud/hb/mac').get(), false);
// 요청
await t('설치 요청(정해 둔 이름)', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'ffmpeg', st: 'new', at: ST }), true);
await t('모델 요청은 고른 모델 이름을 싣는다', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'model', arg: 'medium-q5_0', st: 'new', at: ST }), true);
await t('(P3) 모델 시험 요청(mtest + 녹음 번호)', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'mtest', arg: ID, st: 'new', at: ST }), true);
await t('(P3b) 안 쓰는 모델 지우기 요청', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'rmmodel', arg: 'medium-q5_0', st: 'new', at: ST }), true);
await t('(P3b) 임시 파일 비우기 요청', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'clean', st: 'new', at: ST }), true);
await t('(P3) 전사 · 드라이브는 요청 이름이 아니다(저절로 함)', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'transcribe', st: 'new' }), false);
await t('정해 두지 않은 요청(sh)은 못 넣는다', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'sh', st: 'new' }), false);
await t('요청에 명령 글(argv)은 못 싣는다', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'ffmpeg', st: 'new', argv: ['rm', '-rf', '/'] }), false);
await t('모르는 요청 상태는 못 쓴다', hb.collection('plaud/hb/cmd').add({ mac: '집', what: 'check', st: 'maybe' }), false);
await t('남은 요청을 못 넣는다', out.collection('plaud/hb/cmd').add({ mac: '집', what: 'ffmpeg', st: 'new' }), false);
await t('로그인 안 하면 요청을 못 넣는다', anon.collection('plaud/hb/cmd').add({ mac: '집', what: 'ffmpeg', st: 'new' }), false);
// 잠근 사본(P3b)
await t('(P3b) HB 는 잠근 사본(c · iv · v)을 쓴다', hb.doc('plaud/hb/txt/' + ID).set({ c: 'QUJD', iv: 'aXZpdml2aXY=', v: 1 }), true);
await t('(P3b) HB 는 잠근 사본을 읽는다', hb.doc('plaud/hb/txt/' + ID).get(), true);
await t('(P3b) 잠근 사본 칸에 평문(text) · 제목(n)은 못 넣는다', hb.doc('plaud/hb/txt/' + ID).set({ c: 'QUJD', iv: 'aXY=', v: 1, text: '전사 글' }), false);
await t('(P3b) 잠근 글이 너무 크면(90만 자 넘게) 못 쓴다', hb.doc('plaud/hb/txt/' + ID).set({ c: 'A'.repeat(900001), iv: 'aXY=', v: 1 }), false);
await t('(P3b) 녹음 번호 꼴이 아니면 못 쓴다', hb.doc('plaud/hb/txt/a.b').set({ c: 'QUJD', iv: 'aXY=', v: 1 }), false);
await t('(P3b) 남은 잠근 사본을 못 읽는다', out.doc('plaud/hb/txt/' + ID).get(), false);
await t('(P3b) 로그인 안 하면 못 읽는다', anon.doc('plaud/hb/txt/' + ID).get(), false);
await t('(P3b) HB 는 잠근 사본을 지운다', hb.doc('plaud/hb/txt/' + ID).delete(), true);
// 다른 앱 칸은 그대로 잠김(이 덩어리는 plaud 만)
await t('이 규칙은 users/{uid} 를 열지 않는다', hb.doc('users/hb').get(), false);
console.log(`결과: 통과 ${n - bad} / 실패 ${bad}`);
await env.cleanup(); process.exit(bad ? 1 : 0);
