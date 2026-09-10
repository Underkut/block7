// v26-0909-17 — 말씀·명제 우클릭 메뉴 검토표 반영
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const mem = slice('<div class="task-menu" id="verseMemMenu"', '<!-- 암송 기록 팝업');
const list = slice('<div class="task-menu" id="vliMenu"', '<!-- 암송/좋아요/Deeper 집계');
const labels = html => [...html.matchAll(/<\/svg><\/span>([^<]+)/g)].map(m=>m[1].trim());

console.log('시나리오 1 — 상단·전체화면·타일뷰 공용 메뉴 순서');
{
  sc.eq('검토표 순서대로 배치', labels(mem),
    ['전체 화면','본문 복사','좋아요','저장','암송 완료 체크','Deeper…','Even Deeper…','공유','말씀 설정']);
  sc.eq('본문 복사는 본문 전용 함수', mem.includes('closeVerseMemMenu();vfCopyBodyOnly()'), true);
  sc.eq('저장은 목록 선택기를 연다', mem.includes('openKeepPicker(_reactKey(_vfCurrentVerse()))'), true);
}

console.log('\n시나리오 2 — 활동·저장 목록과 두 위젯 공용 메뉴 순서');
{
  sc.eq('전체 화면·저장 목록 항목은 빼고 검토표 순서대로 배치', labels(list),
    ['본문 복사','좋아요','저장','암송 완료 체크','Deeper…','Even Deeper…','공유','말씀 설정']);
  sc.eq('삭제 행은 동적 문구 자리를 유지', list.includes('id="vliDelLabel">이 목록에서 빼기</span>'), true);
  sc.eq('말씀 설정과 삭제 사이 가로선 (v26-0910-2, HB 검토표 결정)', /말씀 설정<\/div>\s*<div class="task-menu-sep"><\/div>\s*<div class="task-menu-item" onclick="vliAction\('del'\)/.test(list), true);
  const open = slice('function openVliMenu(x,y,ref,kind){', 'function closeVliMenu');
  sc.eq('명제에서는 암송 완료 체크만 감춘다', open.includes("mem.style.display=_vfIsProp(verse)?'none':'flex'"), true);
  const act = slice('function vliAction(act){', '// 해당 목록');
  sc.eq('본문 복사 동작', act.includes("if(act==='copy')_vliCopyBody(ref)"), true);
  sc.eq('저장 동작', act.includes("else if(act==='keep')openKeepPicker(ref)"), true);
}

console.log('\n시나리오 3 — 통일 아이콘');
{
  const plane='<path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2Z"/>';
  sc.eq('두 메뉴 공유가 종이비행기', mem.includes(plane) && list.includes(plane), true);
  sc.eq('삭제·이 목록에서 빼기 휴지통 안에 세로선 하나', list.includes('<path d="M10 9v5"/>'), true);
}

console.log('\n시나리오 4 — iOS 본문 복사는 클릭 흐름에서 곧바로 시작');
{
  const fn=slice('function _vliCopyBody(ref){','\n}');
  sc.eq('본문 krText만 복사', fn.includes("const body=(_vliVerse(ref).krText||'').trim();"), true);
  sc.eq('clipboard를 await 없이 즉시 호출', fn.includes('navigator.clipboard.writeText(body)'), true);
  sc.eq('복사 실패 폴백', fn.includes('_copyTextFallback(body)'), true);
}

sc.done();
