// 백업 파일 이름 — 기기 칸 · 오프라인 규칙 (v26-1021-3, HB 2026-10-21 D-1)
//
//   {앱}-{이메일 앞 3글자}-{기기}-{YY}-{MMDD}-{그날의 번호}.json
//   예) B7-hbk-phn-26-1021-1.json   ·  Sweeter 는 Sw-…
//   오프라인(로그인 안 됨 · 인터넷 끊김) → 번호 자리에 off+HHMM, 번호표는 그대로.
//
// ⚠️ 번호표(ST.settings.backupCounts)는 동기화로 기기끼리 이어진다 — 데이터 계층이라
//    두 기기 · 날짜 바뀜 · 연속 저장 · 오프라인을 시나리오로 못박는다.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { SRC, makeScorer } = require('./_load');
const sc = makeScorer();

const START = '// 백업 파일 이름 (v26-1021-3';
const END = 'function importBackup(file){';
function codeOf(text) {
  const a = text.indexOf(START), b = text.indexOf(END, a);
  if (a < 0 || b < 0) throw new Error('[로더] 백업 이름 구간을 찾지 못했어요');
  return text.slice(a, b);
}
const CODE = codeOf(SRC);

const UA = {
  iphone: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', maxTouchPoints: 5 },
  ipad: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5 },
  mac: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 },
  galaxy: { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918N) Mobile Safari', maxTouchPoints: 5 },
  tab: { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X710) Safari', maxTouchPoints: 5 },
  win: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 10 },
};

// 한 기기 — ST 는 바깥에서 넘긴다(동기화로 같은 settings 를 보는 두 기기를 흉내 낸다)
function device(ST, opt) {
  const now = opt.now || new Date(2026, 9, 21, 15, 34);
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(now.getTime()); } }
  const nav = Object.assign({ onLine: opt.online !== false }, UA[opt.ua || 'iphone']);
  const ctx = {
    ST, Date: FakeDate, navigator: nav, screen: opt.screen || { width: 390, height: 844 },
    APP_PRODUCT: opt.product || 'block7',
    _fbUser: opt.email === null ? null : { email: opt.email || 'hbkim@gmail.com' },
    localStorage: { getItem: k => (opt.legacy || {})[k] || null },
    z: n => String(n).padStart(2, '0'),
    saves: 0,
  };
  ctx.save = () => { ctx.saves++; };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx);
  return { name: () => vm.runInContext('buildBackupFilename()', ctx), dev: () => vm.runInContext('_bakDevice()', ctx), ctx };
}
const newST = () => ({ settings: {} });

console.log('시나리오 1 — 같은 날 연속 저장은 1, 2, 3');
{
  const ST = newST(), d = device(ST, {});
  sc.eq('첫 번째', d.name(), 'B7-hbk-phn-26-1021-1.json');
  sc.eq('두 번째', d.name(), 'B7-hbk-phn-26-1021-2.json');
  sc.eq('세 번째', d.name(), 'B7-hbk-phn-26-1021-3.json');
  sc.eq('번호표는 예전 열쇠 그대로', ST.settings.backupCounts, { 'hbk-261021': 3 });
  sc.eq('저장(동기화)을 부른다', d.ctx.saves, 3);
}

console.log('\n시나리오 2 — 두 기기 번호가 이어진다 (폰 1 → 패드 2)');
{
  const ST = newST();   // 동기화로 같은 settings 를 본다
  const phone = device(ST, { ua: 'iphone' }), pad = device(ST, { ua: 'ipad', screen: { width: 820, height: 1180 } });
  sc.eq('폰에서', phone.name(), 'B7-hbk-phn-26-1021-1.json');
  sc.eq('패드에서', pad.name(), 'B7-hbk-pad-26-1021-2.json');
  sc.eq('다시 폰에서', phone.name(), 'B7-hbk-phn-26-1021-3.json');
}

console.log('\n시나리오 3 — 날짜가 바뀌면 1부터');
{
  const ST = newST();
  device(ST, { now: new Date(2026, 9, 21, 23, 50) }).name();
  device(ST, { now: new Date(2026, 9, 21, 23, 55) }).name();
  sc.eq('다음 날 첫 저장', device(ST, { now: new Date(2026, 9, 22, 0, 5) }).name(), 'B7-hbk-phn-26-1022-1.json');
  sc.eq('어제 칸은 그대로', ST.settings.backupCounts['hbk-261021'], 2);
}

console.log('\n시나리오 4 — 오프라인이면 off+HHMM, 번호표는 그대로');
{
  const ST = newST();
  device(ST, {}).name();
  const off = device(ST, { online: false, now: new Date(2026, 9, 21, 9, 5) });
  sc.eq('인터넷 끊김', off.name(), 'B7-hbk-phn-26-1021-off0905.json');
  sc.eq('번호표 안 올림', ST.settings.backupCounts['hbk-261021'], 1);
  sc.eq('저장(동기화)도 안 부름', off.ctx.saves, 0);
  sc.eq('로그인 안 됨(개발본 포함)', device(ST, { email: null, ua: 'mac' }).name(), 'B7-usr-pc-26-1021-off1534.json');
  sc.eq('다시 온라인이면 이어서', device(ST, {}).name(), 'B7-hbk-phn-26-1021-2.json');
}

console.log('\n시나리오 5 — 기기 판정');
{
  const k = (ua, scr) => device(newST(), { ua, screen: scr }).dev();
  sc.eq('아이폰', k('iphone'), 'phn');
  sc.eq('아이패드(데스크톱 UA)', k('ipad'), 'pad');
  sc.eq('맥', k('mac'), 'pc');
  sc.eq('안드로이드 폰', k('galaxy'), 'phn');
  sc.eq('안드로이드 태블릿', k('tab'), 'pad');
  sc.eq('터치 되는 윈도우 노트북', k('win', { width: 1920, height: 1080 }), 'pc');
}

console.log('\n시나리오 6 — 옛 기기별 번호를 한 번 이어받는다(그대로)');
{
  const ST = newST();
  sc.eq('옛 값 4 → 5', device(ST, { legacy: { 'b7backupCount-hbk-261021': '4' } }).name(), 'B7-hbk-phn-26-1021-5.json');
}

console.log('\n시나리오 7 — Sweeter 는 Sw, 번호는 BLOCK7 과 따로 센다(앱 사이 연동 없음)');
{
  const ST = newST();
  device(ST, {}).name(); device(ST, {}).name();
  sc.eq('Sweeter 첫 저장', device(ST, { product: 'sweeter' }).name(), 'Sw-hbk-phn-26-1021-1.json');
  sc.eq('BLOCK7 은 이어서', device(ST, {}).name(), 'B7-hbk-phn-26-1021-3.json');
  sc.eq('Sweeter 칸은 따로', ST.settings.backupCounts['Sw-hbk-261021'], 1);
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sweeter-dev.html'), 'utf-8');
  sc.eq('sweeter-dev 도 같은 코드', codeOf(sw), CODE);
}

sc.done();
