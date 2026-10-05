// 자동 이월 알림 — Sweeter 에서는 뜨지 않는다 (v26-1005-6, HB)
//
// "완료하지 못한 할일 N개를 오늘로 가져왔어요" 는 할일 화면이 있는
// BLOCK7 에서만 뜻이 있다. Sweeter 에는 할일 화면이 없다.
// ⚠️ 이월 자체는 두 제품이 똑같이 한다 — 할일은 같이 쓰는 상태라,
//    한쪽만 건너뛰면 제품마다 할일의 모양이 갈린다. 감추는 것은 알림뿐이다.
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

let APP_PRODUCT = 'block7';
function _swOn(){ return APP_PRODUCT === 'sweeter'; }
let TOASTS = [];
function showToast(m){ TOASTS.push(m); }
function rawSave(){} function beforeSave(){}
function todayKey(){ return '2026-10-05'; }
function _carryDateInScope(){ return true; }
let ST;
function _carryPendingCount(){ return 2; }
function _doCarry(){ return { movedCount: 2 }; }

eval(slice('function runAutoCarryOver(', '// "어제 미완료 할일 가져오기"'));

function run(product){
  APP_PRODUCT = product; TOASTS = [];
  ST = { settings:{ autoCarryOver:true }, lastCarryKey:'2026-10-04',
         days:{ '2026-10-04':{} } };
  runAutoCarryOver();
  return { toasts: TOASTS.length, stamped: ST.lastCarryKey };
}

console.log('1. BLOCK7 — 이월하고 알린다');
sc.eq('알림 한 번', run('block7').toasts, 1);
sc.eq('오늘로 스탬프', run('block7').stamped, '2026-10-05');

console.log('2. Sweeter — 이월은 하되 알리지 않는다');
sc.eq('알림 없음', run('sweeter').toasts, 0);
sc.eq('그래도 오늘로 스탬프 (이월은 했다)', run('sweeter').stamped, '2026-10-05');

sc.done();
