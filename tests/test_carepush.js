// 심방 노트 'ChatGPT 가 보낸 기록' 알림 서버(wallet-functions/src/carepush-core.js · carepush.js) — 지어낸 이름만 (공개 저장소)
//
// 지키는 것:
//   ① 시트는 **읽기만**(GET 하나) · 대기함 탭 하나만
//   ② 대기 줄만 · 깨진 JSON 은 알리지 않음 · 열쇠는 원본ID(없으면 글 해시) — 접수ID 가 나중에 붙어도 같은 줄
//   ③ 처음 켤 때 이미 있던 줄은 알리지 않음 · 그 뒤 처음 보는 것만 · 저장돼 빠진 줄은 잊음
//   ④ 알림에는 건수 · 이름만 — **심방 내용을 싣지 않는다** · 서버에 내용을 적지 않는다
//   ⑤ 10분에 한 번(셀 inside 와 엇갈리게) · 1분 틱에 얹음 · 앱과 같은 탭 이름 · 상태값
const fs = require('fs'), path = require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const C = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'carepush-core.js'));
const R = n => fs.readFileSync(path.join(__dirname, '..', n), 'utf8');
const SRV = R('wallet-functions/src/carepush.js'), CORE = R('wallet-functions/src/carepush-core.js'), APP = R('care/index.html'), TICK = R('wallet-functions/src/study.js'), IDX = R('wallet-functions/src/index.js');
const J = v => JSON.parse(JSON.stringify(v));
const pk = (names, src, secret) => JSON.stringify({ schema_version: 'hb-care.v1', source: { source_id: src || null }, records: names.map(n => ({ person_name: n, summary_line: secret || '아주 사적인 이야기', brief_note: '비밀 내용' })) });
const H = ['접수ID', '접수시각', '스키마버전', '패킷JSON', '상태', '오류', '원본ID', '생성된 기록ID', '처리시각'];

console.log('\n① 읽기만');
sc.eq('① 서버가 구글에 보내는 것은 열쇠 받기(POST token)와 시트 GET 뿐 — 시트에 쓰는 요청 없음', [/method:\s*"(PUT|PATCH|DELETE)"/.test(SRV + CORE), (SRV.match(/fetch\(/g) || []).length, /values:batchUpdate|:append|:clear/.test(SRV + CORE)], [false, 2, false]);
sc.eq('① 읽는 곳은 대기함 탭 하나', decodeURIComponent(C.sheetUrl('S1')), "https://sheets.googleapis.com/v4/spreadsheets/S1/values/'AI 입력대기'!A1:I400");

console.log('\n② 대기 줄');
const V = [H, ['Q1', '', '', pk(['가나다 성도'], 'f1'), '대기', '', 'f1', '', ''], ['', '', '', pk(['라마바', '사아자(성 미확인)'], ''), '대기', '', '', '', ''], ['Q3', '', '', '{깨짐', '대기', '', 'f3', '', ''],
  ['Q4', '', '', pk(['차카타'], 'f4'), '완료', '', 'f4', 'C1', ''], ['Q5', '', '', pk(['파하'], 'f5'), '오류', 'x', 'f5', '', ''], ['Q6', '', '', pk(['가나다'], 'f1'), '대기', '', 'f1', '', '']];
const W = C.waiting(V);
sc.eq('② 대기만 · 깨진 JSON · 완료 · 오류 빼고 · 같은 녹음 두 줄은 하나 · 이름(호칭 · 괄호 뗌)', J(W.map(x => [x.key.slice(0, 2), x.names])), [['s:', ['가나다']], [W[1].key.slice(0, 2), ['라마바', '사아자']]]);
sc.eq('② 원본ID 가 없으면 글 해시 · 접수ID 가 나중에 붙어도 같은 열쇠', [W[1].key[0], C.waiting([H, ['QNEW', '', '', V[2][3], '대기', '', '', '', '']])[0].key === W[1].key], ['h', true]);
sc.eq('② 열 순서가 달라도 머리글 이름으로 · 탭이 비면 빈 목록', [C.waiting([['상태', '패킷JSON'], ['대기', pk(['가'], 'z')]]).length, C.waiting([]).length, C.waiting([['다른', '머리글']]).length], [1, 0, 0]);

console.log('\n③ 처음 보는 것만');
const d0 = C.diff(null, W);
sc.eq('③ 처음 켤 때 — 이미 있던 줄은 알리지 않고 기억만', [d0.fresh.length, d0.seen.length], [0, 2]);
const W2 = W.concat([{ key: 's:f9', names: ['새분'] }]), d1 = C.diff(d0.seen, W2);
sc.eq('③ 새 줄만 알림', J(d1.fresh), [{ key: 's:f9', names: ['새분'] }]);
sc.eq('③ 다시 물어도 또 알리지 않음', C.diff(d1.seen, W2).fresh.length, 0);
sc.eq('③ 저장돼 대기에서 빠진 줄은 잊는다(목록이 끝없이 늘지 않게)', C.diff(d1.seen, [W2[2]]).seen, ['s:f9']);

console.log('\n④ 알림 글');
const m = C.messageOf([{ key: 'a', names: ['가나다'] }, { key: 'b', names: ['라마바', '사아자', '차카타', '파하', '거너더'] }]);
sc.eq('④ 건수 · 이름(넷까지, 넘으면 외 N명) · 누르면 대기함', J(m), { title: '심방 노트', body: 'ChatGPT 가 보낸 기록 2건 — 가나다, 라마바, 사아자, 차카타 외 2명', link: 'https://sweeter.my/care/?inbox=1', tag: 'care-inbox' });
sc.eq('④ 새 것이 없으면 알림 없음', C.messageOf([]), null);
sc.eq('④ 읽은 줄에서 꺼내는 것은 열쇠 · 이름뿐 — 내용(핵심 한줄 · 메모)은 어디에도 안 남는다', [JSON.stringify(W).includes('사적인'), JSON.stringify(W).includes('비밀'), JSON.stringify(m).includes('사적인')], [false, false, false]);
sc.eq('④ 서버가 적는 칸은 on · tokens · seen · last · err 뿐 · 로그에 줄 내용을 찍지 않는다', [[...SRV.matchAll(/\.set\(\{([^}]*)/g)].every(x => /^[\s\S]*$/.test(x[1]) && !/json|body|summary|records/i.test(x[1])), /console\.(log|warn)\([^)]*(values|list|JSON\.stringify)/.test(SRV)], [true, false]);

console.log('\n⑤ 때 · 얹기 · 앱과 같은 이름');
sc.eq('⑤ 10분에 한 번(5분 자리 — 셀 inside 의 0분과 엇갈림)', [0, 5, 10, 15, 16].map(n => C.due(n * 60000)), [false, true, false, true, false]);
sc.eq('⑤ 1분 틱에 얹고 비밀값을 함께 준다 · HTTP 하나', [/require\("\.\/carepush"\)\.careDue\(\)/.test(TICK), /secrets: require\("\.\/carepush"\)\.SECRETS/.test(TICK), /exports\.carepush = require\("\.\/carepush"\)\.carepush/.test(IDX)], [true, true, true]);
sc.eq('⑤ 앱과 같은 탭 이름 · 대기 상태값 · 서버 주소 · 알림 워커', [APP.includes("const INBOX_TAB = '" + C.TAB + "'"), APP.includes("wait: '" + C.WAIT + "'"), APP.includes('cloudfunctions.net/carepush'), fs.existsSync(path.join(__dirname, '..', 'care', 'sw.js'))], [true, true, true, true]);
sc.eq('⑤ 구글 열쇠는 gcal 것 그대로(새 권한 없음) · 고른 시트는 계정 설정에서', [SRV.includes('gcalTokens/${uid}'), SRV.includes('users/${uid}/data/care'), /scope/.test(SRV)], [true, true, false]);

sc.done();
