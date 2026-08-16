// 말씀 모음으로 가는 '책 3권' 버튼 (v26-0817-8, HB 20 / 20-1 / 20-2)
//
// 20   말씀카드 설정 좌상단에 신규 버튼 — 말씀설정의 말씀모음 탭으로
// 20-1 '현재 말씀 모음' 팝업의 햄버거도 같은 디자인으로
// 20-2 말씀설정을 닫으면 원래 보던 팝업으로 되돌아간다
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 두 곳 모두 같은 책 아이콘을 쓴다');
{
  const books = (SRC.match(/M2\.6 6\.2 L9\.6 3\.2 L17\.4 5\.4 L10\.4 8\.4 Z/g)||[]).length;
  sc.eq('책 아이콘이 두 곳에 있다', books, 2);
  // 한 아이콘은 책 3권 = path 3개
  const slabs = (SRC.match(/M2\.6 (6\.2|10\.4|14\.6) /g)||[]).length;
  sc.eq('한 벌에 책 3권씩, 두 벌', slabs, 6);
  // 예전 햄버거(가로줄 3개)는 사라져야 한다
  sc.eq('햄버거 가로줄은 없앴다',
        SRC.includes('<line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/>'), false);
  // UI 원칙 — 테두리·박스 없이 아이콘만 (.modal-x 를 그대로 쓴다)
  sc.eq('목록 팝업은 modal-x-inline',
        /class="modal-x modal-x-inline" onclick="openVerseCollSettings\(\)"/.test(SRC), true);
  sc.eq('카드설정도 modal-x-inline',
        /class="modal-x modal-x-inline" onclick="openVcCollSettings\(\)"/.test(SRC), true);
  // 카드설정 헤더의 빈 자리(modal-head-gap)가 버튼으로 바뀌었다
  sc.eq('카드설정 헤더에 빈칸 대신 버튼',
        /<span class="modal-head-gap"><\/span>\s*<div class="event-modal-title" style="margin:0;flex:1;">말씀카드 설정/.test(SRC), false);
}

console.log('\n시나리오 2 — 둘 다 말씀모음 탭으로 간다');
{
  const go = SRC.slice(SRC.indexOf('function _vsetGoColl(){'), SRC.indexOf('function openVcCollSettings(){'));
  sc.eq('말씀설정을 연다', go.includes('openVerseSettingsModal();'), true);
  sc.eq("'coll' 탭을 고른다", go.includes(`.includes("'coll'")`), true);
  sc.eq('탭 버튼이 없으면 함수로 직접',
        go.includes("switchVerseSettingsTab('coll',null);"), true);
}

console.log('\n시나리오 3 — 닫으면 원래 팝업으로 되돌아간다 (20-2)');
{
  sc.eq('어디서 왔는지 적어 둔다', SRC.includes('let _vsetBackTo=null, _vsetBackId=null;'), true);
  sc.eq('목록에서 왔으면 표시', SRC.includes("_vsetBackTo='verseList';"), true);
  sc.eq('카드설정에서 왔으면 표시(카드 id 까지)',
        SRC.includes("_vsetBackTo='vcSet';_vsetBackId=(typeof _vcSetId!=='undefined')?_vcSetId:null;"), true);

  const back = SRC.slice(SRC.indexOf('function _vsetRestoreBack(){'), SRC.indexOf('// 말씀 목록 헤더의 책 버튼'));
  // ⚠️ 먼저 지우지 않으면 다음에 말씀설정을 그냥 열었다 닫아도 엉뚱한 팝업이 되살아난다
  sc.eq('되살리기 전에 먼저 지운다',
        back.indexOf('_vsetBackTo=null;_vsetBackId=null;') < back.indexOf("if(to==='vcSet'"), true);
  sc.eq('카드설정으로 되돌린다', back.includes("if(to==='vcSet'&&id&&typeof openVcSettings==='function')openVcSettings(id);"), true);
  sc.eq('목록으로 되돌린다', back.includes("to==='verseList'"), true);

  const close = SRC.slice(SRC.indexOf('function closeVerseSettingsModal(e){'), SRC.indexOf('function _verseSettingsOpen(){'));
  sc.eq('닫을 때 되살리기를 부른다', close.includes('_vsetRestoreBack();'), true);
  sc.eq('닫는 동작 자체는 그대로', close.includes("classList.remove('open');"), true);
}
sc.done();
