// 클라우드 문서 압축 — 1단계 읽기 (v26-1025-5) · 3단계 쓰기 (v26-1025-6, docs/ROADMAP.md '클라우드 문서 1MB 한도')
// 문서는 두 모양 — 예전 { json } · 압축 { jz: 바이트(UTF-8 JSON 의 raw DEFLATE) }. 이 단계에서는 **읽기만** 둘 다 한다(쓰기는 예전 그대로).
// 지키는 것:
//  ① 두 모양 다 읽는다 · jz 가 먼저 · 웹 SDK 의 Bytes(toUint8Array) · Node 의 Buffer
//  ② ⭐ jz 를 못 풀면 **던진다** ('자료 없음' 으로 읽으면 올리기가 클라우드를 덮어쓴다)
//  ③ ⭐ 올리기 · 받기 · 첫 읽기 · 비교 · 자동 백업이 모두 _fbDocJson 을 거친다 (data.json 을 직접 읽는 곳이 없다)
//  ④ 앱의 압축(fflate) ↔ 서버의 zlib 이 서로 푼다 (3단계 쓰기 대비)
//  ⑤ 새 알림 서버 · 기도노트도 두 모양을 읽는다
//  ⑥ ⭐ 3단계 — 쓰는 곳 셋(올리기 · 강제 쓰기 · 자동 백업)이 모두 jz 로만 쓴다 · json 을 쓰는 곳이 없다 · 도구가 없으면 던진다
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
const FFJS = slice('<script id="fflate">', '</script>').replace('<script id="fflate">', '');
new Function(FFJS)();
const ff = globalThis.fflate;
sc.eq('fflate 가 들어 있다', [typeof ff.deflateSync, typeof ff.inflateSync, typeof ff.strFromU8], ['function', 'function', 'function']);
const F = new Function(slice('// ── 클라우드 문서 포장 (v26-1025-5)', 'let _fbLastErr=null;') + slice('function _fbBytes(str){', 'async function _fbCommit(){') + '; return {_fbDocJson,_fbUnz,_fbDocBytes};')();
const J = JSON.stringify({ days: { '2026-10-25': { big: { am: [{ text: '우유 사기', done: false }] } } }, verseCollections: [{ name: 'TLC', verses: ['태초에 하나님이 천지를 창조하시니라'] }] });
const Z = zlib.deflateRawSync(Buffer.from(J));

console.log('\n① 두 모양');
sc.eq('예전 json', F._fbDocJson({ json: J }), J);
sc.eq('압축 jz (Node Buffer)', F._fbDocJson({ jz: Z }), J);
sc.eq('압축 jz (웹 SDK Bytes)', F._fbDocJson({ jz: { toUint8Array: () => new Uint8Array(Z) } }), J);
sc.eq('둘 다 있으면 jz', F._fbDocJson({ jz: Z, json: '{"old":1}' }), J);
sc.eq('없음 · 빈 json · undefined', [F._fbDocJson({}), F._fbDocJson({ json: '' }), F._fbDocJson(undefined)], [null, null, null]);
sc.eq('저장된 크기 — 압축이면 압축된 크기', [F._fbDocBytes({ jz: Z }) === Z.length, F._fbDocBytes({ json: '가' })], [true, 3]);

console.log('\n② 못 풀면 던진다');
const throws = (d) => { try { F._fbDocJson(d); return false; } catch (e) { return true; } };
sc.eq('⭐ 깨진 jz · 이상한 jz → 던짐', [throws({ jz: Buffer.from('깨진 것') }), throws({ jz: 'abc' }), throws({ jz: {} })], [true, true, true]);

console.log('\n③ 모든 읽는 곳이 _fbDocJson 을 거친다');
const COMMIT = slice('async function _fbCommit(){', 'function _fbScheduleRetry(){');
sc.eq('⭐ 올리기 — 트랜잭션 안에서 풀고(던지면 쓰지 않음) 그 값으로 판정 · 병합 · 백업', [
  /const cloudJson=_fbDocJson\(data\);/.test(COMMIT), /!snap\.exists\|\|!cloudJson\|\|/.test(COMMIT),
  /JSON\.parse\(cloudJson\)/.test(COMMIT), /backupJson=cloudJson;/.test(COMMIT), /data\.json/.test(COMMIT)], [true, true, true, true, false]);
const LIS = slice('window.fbStartListening=function(uid){', 'fbAuth.onAuthStateChanged(');
sc.eq('⭐ 받기 — 못 풀면 건너뜀(적용 안 함)', [/try\{djson=_fbDocJson\(data\);\}catch\(e\)\{[^}]*return;\}/.test(LIS), /data\.json/.test(LIS), (LIS.match(/_fbSetBase\(djson,/g) || []).length], [true, false, 2]);
const INIT = slice('fbAuth.onAuthStateChanged(', 'fbStartListening(user.uid);');
sc.eq('⭐ 첫 읽기 — 풀기가 _fbInitLoaded=true 보다 앞(던지면 쓰기 막힘)', INIT.indexOf('const initJson=doc.exists?_fbDocJson(doc.data()):null;') >= 0 && INIT.indexOf('const initJson') < INIT.indexOf('_fbInitLoaded=true'), true);
sc.eq('첫 읽기 — data.json 을 직접 안 읽음', /data\.json|\.data\(\)\.json/.test(INIT), false);
sc.eq('비교 · 자동 백업', [/const dj=_fbDocJson\(d\);/.test(SRC), /try\{j=_fbDocJson\(d\);\}catch\(e\)\{\}/.test(SRC)], [true, true]);

console.log('\n④ 앱 압축 ↔ 서버 zlib');
const big = JSON.stringify({ v: Array.from({ length: 300 }, (_, i) => ({ krText: '여호와는 나의 목자시니 내게 부족함이 없으리로다 ' + i, ref: '시 23:' + i })) });
const az = ff.deflateSync(ff.strToU8(big), { level: 6 });
sc.eq('fflate 로 줄인 것을 zlib 이 · zlib 로 줄인 것을 앱이', [zlib.inflateRawSync(Buffer.from(az)).toString() === big, F._fbDocJson({ jz: zlib.deflateRawSync(Buffer.from(big)) }) === big], [true, true]);
sc.eq('한글 말씀 4배 넘게 준다', Buffer.byteLength(big) / az.length > 4, true);

console.log('\n⑤ 새 알림 서버 · 기도노트');
const C = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'b7push-core.js'));
sc.eq('서버 parseState — 두 모양 · 깨진 것은 null', [C.parseState({ jz: Z }).verseCollections[0].name, C.parseState({ json: J }).verseCollections[0].name, C.parseState({ jz: Buffer.from('x') })], ['TLC', 'TLC', null]);
const PR = fs.readFileSync(path.join(__dirname, '..', 'pray', 'index.html'), 'utf8');
sc.eq('기도노트 — b7DocJson 으로 읽는다', [/async function b7DocJson\(d\)/.test(PR), /JSON\.parse\(await b7DocJson\(r\[0\]\.data\(\) \|\| \{\}\)/.test(PR), /DecompressionStream\('deflate-raw'\)/.test(PR)], [true, true, true]);
console.log('\n⑥ 쓰기 (3단계)');
const Z3 = new Function('fflate', slice('// 쓰는 모양 (v26-1025-6)', '// 저장된 크기(바이트)') + '; return {_fbZ};');
const zz = Z3(ff)._fbZ(J);
sc.eq('⭐ 앱이 쓴 jz 를 앱 · 서버가 그대로 푼다', [F._fbDocJson({ jz: zz }) === J, C.parseState({ jz: Buffer.from(zz) }).verseCollections[0].name], [true, 'TLC']);
sc.eq('⭐ 도구가 없으면 던진다 (쓰지 않음)', (() => { try { Z3(undefined)._fbZ(J); return false; } catch (e) { return true; } })(), true);
sc.eq('⭐ 올리기 — 트랜잭션 안에서 jz 로 · json 은 안 씀', [/const outZ=_fbZ\(outJson\);outZBytes=outZ\.length;\s*tx\.set\(userDocRef\(uid\),\{\s*jz:firebase\.firestore\.Blob\.fromUint8Array\(outZ\),rev:outRev,/.test(COMMIT), /json:outJson/.test(COMMIT)], [true, false]);
sc.eq('강제 쓰기 · 자동 백업도 jz', [/tx\.set\(userDocRef\(uid\),\{jz:_fbZField\(json\),rev,/.test(SRC), /\.set\(\{jz:_fbZField\(json\),rev:rev\|\|0,ts:/.test(SRC)], [true, true]);
sc.eq('⭐ 클라우드에 json 을 쓰는 곳이 없다 (기기 안 기준점은 제외)', /tx\.set\(userDocRef\(uid\),\{\s*json|json:outJson|\.set\(\{json/.test(SRC), false);
sc.done();
