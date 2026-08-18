// 말씀 모음으로 가는 '책 3권' 버튼 (v26-0817-8, HB 20 / 20-1 / 20-2)
//
// 20   말씀카드 설정 좌상단에 신규 버튼 — 말씀설정의 말씀모음 탭으로
// 20-1 '현재 말씀 모음' 팝업의 햄버거도 같은 디자인으로
// 20-2 말씀설정을 닫으면 원래 보던 팝업으로 되돌아간다
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 세 곳 모두 같은 책 실루엣을 쓴다');
{
  // ⚠️ 책 몸통(3권 실루엣)이 **HB 가 캡쳐해서 직접 고른 최종본**이다 (v26-0817-10).
  //    이 대화에서 실루엣 사각·회전 직사각형·계단형 등 여러 판을 그렸다가
  //    전부 퇴짜맞았다. 꽉 찬 평행사변형 3장이 비스듬히 쌓인 이 모양으로 확정.
  //    **몸통 자체는 다시 그리지 말 것.**
  // v26-0818-6, HB — 그 위 커버에 십자가(현재 말씀 모음 팝업·카드설정)
  // 또는 4줄(좌상단 말씀메뉴 '현재 말씀 모음')을 얹었다. 그래서 이 몸통
  // 실루엣을 쓰는 자리가 셋으로 늘었다.
  const books = (SRC.match(/M3\.8 8\.2 L12\.6 2\.6 L20\.2 6 L20\.2 7\.5 L11\.4 13\.1 L3\.8 9\.7 Z/g)||[]).length;
  sc.eq('책 실루엣이 세 곳에 있다', books, 3);
  // 위 커버(첫 조각)는 이제 fill-rule=evenodd 로 십자가/4줄과 한 path 에 있어
  // 예전처럼 단독으로 시작하지 않는다 — 가운데·아래 두 조각(3권 중 나머지)만 센다
  const slabs = (SRC.match(/<path d="M3\.8 (12\.2|16\.2) /g)||[]).length;
  sc.eq('세 곳 모두 아래 두 권은 그대로', slabs, 6);
  sc.eq('세 곳 모두 컷아웃 방식(evenodd)',
        (SRC.match(/fill-rule="evenodd"/g)||[]).length, 3);
  // v26-0818-7, HB — 메뉴의 다른 아이콘들에 비해 여백이 커 보인다는 지적으로
  // viewBox 를 도형 실제 bbox 에 바짝 맞춰 크롭했다(디자인·각도는 그대로, 여백만 축소).
  sc.eq('꽉 찬 실루엣으로 그린다',
        (SRC.match(/viewBox="3\.2 2 17\.6 19\.7" fill="currentColor" stroke="currentColor" stroke-width="0\.7" stroke-linejoin="round"/g)||[]).length, 3);
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

console.log('\n시나리오 1-1 — 커버 컷아웃 모양 (십자가 vs 4줄)');
{
  // 십자가 컷아웃 — '현재 말씀 모음' 팝업, 말씀카드 설정 두 곳
  const crossCount = (SRC.match(/M15\.07 4\.36 L16\.53 5\.01 L14\.47 6\.32 L16\.66 7\.30 L15\.31 8\.16 L13\.12 7\.18 L8\.93 9\.84 L7\.47 9\.19 L11\.66 6\.53 L9\.47 5\.55 L10\.82 4\.69 L13\.01 5\.67 Z/g)||[]).length;
  sc.eq('십자가 컷아웃이 두 곳', crossCount, 2);
  // 4줄(마지막 절반) 컷아웃 — 좌상단 말씀메뉴의 '현재 말씀 모음' 항목
  const linesCount = (SRC.match(/M5\.53 7\.95 L11\.55 10\.65 L12\.65 9\.95 L6\.63 7\.26 Z/g)||[]).length;
  sc.eq('4줄 컷아웃이 한 곳(좌상단 말씀메뉴)', linesCount, 1);
  const menuIcon = SRC.slice(SRC.indexOf('onclick="openVerseListModal()"'), SRC.indexOf('onclick="openVerseListModal()"')+600);
  sc.eq('좌상단 말씀메뉴 항목이 4줄 아이콘을 쓴다', menuIcon.includes('M5.53 7.95'), true);
}

console.log('\n시나리오 1-2 — 좌상단 말씀메뉴 가운데 구분선 제거 (v26-0818-6, HB)');
{
  const main = SRC.slice(SRC.indexOf('<div id="logoMenuMain">'), SRC.indexOf('<div id="logoMenuListSub"'));
  sc.eq('메인 뎁스 안에는 구분선이 없다', main.includes('task-menu-sep'), false);
  // 하위 뎁스(말씀 목록)의 뒤로가기 줄 아래 구분선은 그대로 둔다 — 없앤 건 메인 것뿐
  const sub = SRC.slice(SRC.indexOf('<div id="logoMenuListSub"'), SRC.indexOf('</div>\n</div>\n\n<!-- 암송/좋아요/Deeper 집계'));
  sc.eq('하위 뎁스 헤더 아래 구분선은 그대로', sub.includes('task-menu-sep'), true);
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
