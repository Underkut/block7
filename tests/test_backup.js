// 백업 내보내기 — 아이폰 흰 화면(v26-0817-7)
//
// ⚠️ 실기기 로그로 원인 확정 (v26-0817-5):
//      88ms [백업] window.pagehide          url=https://block7.my/index-dev.html
//      88ms [백업] window.visibilitychange  hidden=true  url=(같음)
//    URL 이 전혀 안 바뀌었다 → blob: 으로 이동한 게 아니라, 아이폰이 내려받은
//    JSON 을 전체화면 미리보기로 덮은 것이 "흰 화면 번쩍" 이었다.
//    → 아이폰에서만 공유 시트로 넘긴다.
//
// ⚠️ 데이터를 내보내는 경로다. 담기는 항목이 빠지면 백업이 반쪽이 되므로
//    payload 구성도 함께 못박는다 (CLAUDE.md: 데이터 계층은 테스트 먼저).
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const fn = SRC.slice(SRC.indexOf('function exportBackup(){'),
                     SRC.indexOf('// Filename format: B7bak-'));

console.log('시나리오 1 — 백업에 담기는 것이 빠지지 않는다');
{
  ['secs:SECS', 'secArchive:ST.secArchive||[]', 'settings:ST.settings',
   'days:ST.days', 'vis:ST.vis', 'collapsed:ST.collapsed'
  ].forEach(k => sc.eq('담긴다: ' + k, fn.includes(k), true));
  sc.eq('앱 이름표', fn.includes("app:'BLOCK7'"), true);
  sc.eq('내보낸 시각', fn.includes('exportedAt:new Date().toISOString()'), true);
}

console.log('\n시나리오 2 — 아이폰은 공유 시트, 나머지는 예전 방식');
{
  sc.eq('아이폰 판정', /const isIOS=\/iP\(hone\|ad\|od\)\//.test(fn), true);
  sc.eq('공유 가능한지 먼저 묻는다', fn.includes('navigator.canShare({files:[file]})'), true);
  sc.eq('파일로 넘긴다', fn.includes("new File([json],name,{type:'application/json'})"), true);
  sc.eq('공유 시트를 부른다', fn.includes('navigator.share({files:[file]})'), true);
  // 사용자가 취소한 것(AbortError)까지 예전 방식으로 되돌리면 흰 화면이 다시 뜬다
  sc.eq('취소는 되돌리지 않는다', fn.includes("if(n==='AbortError')return;"), true);
  sc.eq('그 밖의 실패는 예전 방식으로', fn.includes('_backupDownload(json,name);'), true);
  sc.eq('아이폰이 아니면 곧장 예전 방식',
        fn.lastIndexOf('_backupDownload(json,name);') > fn.indexOf('navigator.share'), true);
  sc.eq('예전 방식 함수는 그대로 있다', SRC.includes('function _backupDownload(json,name){'), true);
}

console.log('\n시나리오 3 — 제스처를 잃지 않는다');
{
  // ⚠️ navigator.share 는 사용자 조작 안에서 동기적으로 불러야 한다.
  //    앞에 await 가 끼면 아이폰이 거절한다 (시트 복사에서 겪은 것과 같은 함정).
  sc.eq('exportBackup 은 async 가 아니다', SRC.includes('async function exportBackup'), false);
  sc.eq('share 앞에 await 가 없다', /await[\s\S]{0,80}navigator\.share/.test(fn), false);
}

const dl = SRC.slice(SRC.indexOf('function _backupDownload(json,name){'),
                     SRC.indexOf('// Filename format: B7bak-'));
console.log('\n시나리오 4 — 예전 방식(PC·안드로이드)은 그대로 동작한다');
{
  sc.eq('blob 을 만든다', dl.includes("new Blob([json],{type:'application/json'})"), true);
  sc.eq('파일 이름을 붙인다', dl.includes('a.download=name;'), true);
  sc.eq('클릭으로 내려받는다', dl.includes('a.click();'), true);
  sc.eq('주소를 나중에 반납한다', dl.includes('URL.revokeObjectURL(url)'), true);
  sc.eq('안내 토스트', dl.includes("showToast('백업 파일을 다운로드했어요')"), true);
}

sc.done();
