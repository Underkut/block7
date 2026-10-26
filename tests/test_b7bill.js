// 요금 알림(wallet-functions/src/b7bill-core.js) — 매일 오후 3시, 개발자 한 사람에게
//   ① 언제 보내나 — 15:00 넘었고 오늘 아직 (늦은 틱 · 3시 넘어 서버를 올린 날도 그날 한 번)
//   ② 무엇을 — 화면과 같은 세 숫자: 원래 비용 − 절감액 = 결과
//   ③ 이 달 중간에 내보내기를 켰으면 그 날부터 센 것이라고 밝힌다
//   ④ 질의는 이번 달(invoice.month)만, 표 이름 끝은 * 로
//   ⑤ 받는 사람은 개발자 계정 하나 (b7bill.js 의 글자를 직접 확인)
const fs = require('fs');
const path = require('path');
const { makeScorer } = require('./_load');
const B = require(path.join(__dirname, '..', 'wallet-functions', 'src', 'b7bill-core.js'));
const sc = makeScorer();
const at = (s) => Date.parse(s + ':00+09:00');

console.log('\n① 언제 보내나');
sc.eq('14:59 — 아직', B.shouldRun(at('2026-10-27T14:59'), null), false);
sc.eq('15:00 — 보냄', B.shouldRun(at('2026-10-27T15:00'), null), true);
sc.eq('15:00 — 오늘 이미 했으면 안 보냄', B.shouldRun(at('2026-10-27T15:00'), { day: '2026-10-27' }), false);
sc.eq('어제 했으면 오늘 3시에 다시', B.shouldRun(at('2026-10-27T15:01'), { day: '2026-10-26' }), true);
sc.eq('밤 11시에 서버를 올려도 그날 한 번', B.shouldRun(at('2026-10-27T23:10'), { day: '2026-10-26' }), true);
sc.eq('자정 넘어 새벽 — 아직 3시 전', B.shouldRun(at('2026-10-28T00:30'), { day: '2026-10-27' }), false);
sc.eq('날짜는 한국 날짜 (UTC 로는 전날 15시)', B.dayKey(at('2026-10-28T00:30')), '2026-10-28');
sc.eq('이번 달 키', B.monthKey(at('2026-11-01T00:10')), '202611');

console.log('\n② 세 숫자');
{
  const m = B.message({ cost: 2650.4, credits: -1648.9, currency: 'KRW', first: { value: '2026-10-01T00:00:00Z' }, n: 120 }, at('2026-10-27T15:00'));
  sc.eq('제목', m.title, '10월 요금 · 27일 오후 3시');
  sc.eq('본문 — 원래 − 절감 = 결과', m.body, '원래 2,650원 − 절감 1,649원\n= 1,002원');
  const usd = B.message({ cost: 1.5, credits: 0, currency: 'USD', first: '2026-10-01T00:00:00Z', n: 3 }, at('2026-10-27T15:00'));
  sc.eq('원화가 아니면 단위를 밝힌다', usd.body.split('\n')[1], '= 2원 (USD)');
  const none = B.message({ cost: null, credits: null, n: 0 }, at('2026-10-27T15:00'));
  sc.eq('기록이 아직 없으면 그렇게 말한다', none.body.startsWith('아직 결제 기록이 안 들어왔어요'), true);
}

console.log('\n③ 이 달 중간에 켠 경우');
{
  const mid = B.message({ cost: 300, credits: -100, first: { value: '2026-10-27T03:00:00Z' }, n: 5 }, at('2026-10-28T15:00'));
  sc.eq('10월 27일부터 센 금액이라고 밝힘', mid.body.split('\n')[2], '※ 10월 27일부터 센 금액이에요');
  const full = B.message({ cost: 300, credits: -100, first: new Date('2026-11-01T00:00:00-07:00'), n: 5 }, at('2026-11-05T15:00'));
  sc.eq('다음 달은 처음부터라 덧말 없음', full.body.split('\n').length, 2);
}

console.log('\n④ 질의');
{
  const q = B.query('block7-8f24e', 'billing');
  sc.eq('표 이름 끝을 * 로', q.includes('`block7-8f24e.billing.gcp_billing_export_v1_*`'), true);
  sc.eq('이번 달만', q.includes('invoice.month = @month'), true);
  sc.eq('절감액(credits) 을 더한다', /UNNEST\(credits\)/.test(q), true);
  sc.eq('설정이 안 됐을 때 알림', B.failMessage(at('2026-10-27T15:00'), 'Not found: Dataset block7-8f24e:billing').body.startsWith('결제 내보내기가 아직 안 켜져 있어요'), true);
}

console.log('\n⑤ 받는 사람은 개발자 한 사람');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'b7bill.js'), 'utf-8');
  const app = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const appEmail = (/const DEV_INBOX_EMAIL='([^']+)'/.exec(app) || [])[1];
  sc.eq('서버의 이메일 = 앱의 개발자 이메일', (/const DEV_EMAIL = "([^"]+)"/.exec(src) || [])[1], appEmail);
  sc.eq('그 계정 하나의 기기에만 (getUserByEmail → 그 사람 pushTokens)', /getUserByEmail\(DEV_EMAIL\)[\s\S]*users\/\$\{uid\}\/pushTokens/.test(src), true);
  sc.eq('모든 사용자를 훑는 코드가 없다', /collection\("users"\)\.(get|listDocuments)/.test(src), false);
  const tick = fs.readFileSync(path.join(__dirname, '..', 'wallet-functions', 'src', 'b7push.js'), 'utf-8');
  sc.eq('1분 틱(b7Due)이 부른다 — 예약 작업을 늘리지 않음', /require\("\.\/b7bill"\)\.b7Bill\(now\)/.test(tick), true);
}

sc.done();
