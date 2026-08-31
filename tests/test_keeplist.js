// 저장 목록 — 유튜브·인스타처럼 여러 목록에 나눠 담는다 (v26-0831-11)
//
// HB — "저장 목록은 유튜브, 인스타와 같이 저장을 여러 목록으로 만들어서
//       저장할 수 있는 시스템으로 해줘. 이 저장 시스템은 말씀과 명제 둘 다."
//
// ⚠️⚠️ **새 저장 항목(ST.xxx)을 만들지 않는다.** 26-0831 사고의 교훈이다 —
//    새 항목 하나마다 기본값·부팅·병합·대량손실·원격반영 **다섯 곳**에 등록해야
//    하고, 한 곳만 빠져도 그 기기가 "사용자가 지웠다"로 읽어 통째로 날린다.
//    → 목록 이름은 이미 있는 기록의 **항목 안(lst)** 에 담는다.
//      ST.verseKeepLog = { "YYYY-MM-DD": [{ref, time, lst?}] }
//      병합기(_mgEntryArray)는 항목을 통째로 세므로 목록이 다른 두 항목은
//      저절로 다른 것으로 다뤄진다 — 병합 코드를 한 줄도 고치지 않았다.
//
// ⚠️ 목록은 **저장할 때 생긴다** (인스타 방식). 빈 목록은 없다 — 마지막 항목을
//    빼면 목록도 사라진다. 그래서 이름을 따로 저장할 자리가 필요 없다.
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();
const asVar = s => s.replace(/^(?:const|let) /gm, 'var ');

let ST = { verseKeepLog:{}, settings:{} };
function save(){}
const TODAY = '2026-08-31';
function _calKey(){ return TODAY; }
const WORLD = {};
function _findVerseByRefLoose(ref){ return WORLD[ref] || null; }
eval(asVar(sliceDev('function getKeepLog(', 'function _swRepaintKeepTiles(')));

const R1 = '요한복음 3:16';
const R2 = '로마서 8:28';
const P1 = 'P123456P0001';   // 명제 (반응 키)
const P2 = 'P123456P0002';   // 같은 설교의 다른 명제
[R1,R2,P1,P2].forEach(r=>{ WORLD[r] = { ref:r, krText:'…' }; });

console.log('시나리오 1 — 목록 없이 저장하면 기본 목록');
{
  ST.verseKeepLog = {};
  sc.eq('저장 전에는 아니다', _swIsKept(R1), false);
  sc.eq('저장하면 켜진다', swToggleKeep(R1), true);
  sc.eq('저장됐다', _swIsKept(R1), true);
  sc.eq('기본 목록에 들어갔다', [..._keepListsOf(R1)], [KEEP_DEFAULT_LIST]);
  // ⚠️ 기본 목록은 lst 를 안 쓴다 — 예전 기록과 **글자 하나 다르지 않아야** 한다
  const e = ST.verseKeepLog[TODAY][0];
  sc.eq('기본 목록은 lst 를 안 쓴다', e.lst === undefined, true);
  sc.eq('예전 항목 모양 그대로', Object.keys(e).sort().join(','), 'ref,time');
  sc.eq('다시 누르면 풀린다', swToggleKeep(R1), false);
  sc.eq('풀렸다', _swIsKept(R1), false);
}

console.log('\n시나리오 2 — 목록을 골라 저장한다');
{
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  swKeepSet(R1, '아이들과', true);
  sc.eq('두 목록에 함께 담긴다', [..._keepListsOf(R1)].sort(), ['설교 준비','아이들과']);
  sc.eq('어느 목록에든 있으면 저장된 것', _swIsKept(R1), true);
  sc.eq('그 목록에 있는가', _swIsKept(R1,'설교 준비'), true);
  sc.eq('없는 목록에는 없다', _swIsKept(R1,'저녁 묵상'), false);
  // 한 목록에서만 뺀다 — 다른 목록은 그대로 (유튜브·인스타의 방식)
  swKeepSet(R1, '설교 준비', false);
  sc.eq('그 목록에서만 빠진다', [..._keepListsOf(R1)], ['아이들과']);
  sc.eq('아직 저장된 것', _swIsKept(R1), true);
  swKeepSet(R2, '아이들과', true); swKeepSet(R2, '아이들과', true);
  const n = Object.values(ST.verseKeepLog).flat().filter(e=>e.ref===R2).length;
  sc.eq('겹쳐 담기지 않는다', n, 1);
}

console.log('\n시나리오 3 — 목록은 저장할 때 생기고 비면 사라진다');
{
  ST.verseKeepLog = {};
  sc.eq('처음엔 목록이 없다', _keepLists().length, 0);
  swKeepSet(R1, '설교 준비', true);
  sc.eq('저장하면 생긴다', _keepLists().map(x=>x.n), ['설교 준비']);
  sc.eq('개수도 센다', _keepLists()[0].cnt, 1);
  swKeepSet(R2, '설교 준비', true);
  sc.eq('두 개가 됐다', _keepLists()[0].cnt, 2);
  swKeepSet(R1, '설교 준비', false);
  swKeepSet(R2, '설교 준비', false);
  sc.eq('마지막을 빼면 목록도 사라진다', _keepLists().length, 0);
  swToggleKeep(R1);
  sc.eq('기본 목록도 저장할 때 생긴다', _keepLists().map(x=>x.n), [KEEP_DEFAULT_LIST]);
}

console.log('\n시나리오 4 — 목록 차례: 기본 목록이 맨 앞, 그 뒤는 최근 저장 순');
{
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00',lst:'오래된 것'}],
    '2026-08-29':[{ref:R2,time:'09:00',lst:'최근 것'}],
    '2026-08-25':[{ref:P1,time:'09:00'}]
  };
  sc.eq('기본이 맨 앞, 그 뒤 최근순',
        _keepLists().map(x=>x.n), [KEEP_DEFAULT_LIST,'최근 것','오래된 것']);
}

console.log('\n시나리오 5 — 말씀과 명제를 한 목록에 섞어 담는다 (HB)');
{
  ST.verseKeepLog = {};
  swKeepSet(R1, '주일 준비', true);
  swKeepSet(P1, '주일 준비', true);
  sc.eq('말씀도 명제도 담긴다', _keepLists()[0].cnt, 2);
  sc.eq('둘 다 목록에 나온다', _swKeeps(0,'주일 준비').map(x=>x.ref).sort(), [P1,R1].sort());
  // ⚠️ 명제는 반응 키로 담긴다 — 한 설교의 다른 명제와 안 섞인다
  sc.eq('명제는 명제 키로 담긴다', _swIsKept(P1,'주일 준비'), true);
  sc.eq('같은 설교의 다른 명제는 아니다', _swIsKept(P2,'주일 준비'), false);
}

console.log('\n시나리오 6 — 목록으로 걸러 본다');
{
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00',lst:'가'}],
    '2026-08-21':[{ref:R2,time:'09:00',lst:'나'}],
    '2026-08-22':[{ref:P1,time:'09:00'}]
  };
  sc.eq('목록을 주면 그것만', _swKeeps(0,'가').map(x=>x.ref), [R1]);
  sc.eq('기본 목록도 고를 수 있다', _swKeeps(0,KEEP_DEFAULT_LIST).map(x=>x.ref), [P1]);
  sc.eq('안 주면 전부', _swKeeps(0).length, 3);
  sc.eq('전부는 최근 저장 순', _swKeeps(0).map(x=>x.ref), [P1,R2,R1]);
  sc.eq('오래된 순도 된다', _swKeeps(1).map(x=>x.ref), [R1,R2,P1]);
  ST.verseKeepLog['2026-08-23']=[{ref:R1,time:'09:00',lst:'나'}];
  sc.eq('전부에서는 한 번만', _swKeeps(0).filter(x=>x.ref===R1).length, 1);
  sc.eq('목록별로는 양쪽에', _swKeeps(0,'나').length, 2);
}

console.log('\n시나리오 7 — 목록 이름 바꾸기·목록 지우기');
{
  ST.verseKeepLog = {};
  swKeepSet(R1,'가',true); swKeepSet(R2,'가',true); swKeepSet(P1,'나',true);
  _keepRenameList('가','새 이름');
  sc.eq('이름이 바뀐다', _keepLists().map(x=>x.n).sort(), ['나','새 이름']);
  sc.eq('항목은 그대로 따라온다', _swKeeps(0,'새 이름').length, 2);
  sc.eq('다른 목록은 안 건드린다', _swKeeps(0,'나').length, 1);
  // 이미 있는 이름으로 바꾸면 **합친다** (겹치는 것은 하나로)
  swKeepSet(R1,'나',true);
  _keepRenameList('새 이름','나');
  sc.eq('합쳐진다', _keepLists().map(x=>x.n), ['나']);
  sc.eq('겹친 것은 하나로', _swKeeps(0,'나').length, 3);
  // 목록 지우기 = 그 목록의 항목만 뺀다
  ST.verseKeepLog = {};
  swKeepSet(R1,'가',true); swKeepSet(R1,'나',true); swKeepSet(R2,'가',true);
  _keepDeleteList('가');
  sc.eq('그 목록만 사라진다', _keepLists().map(x=>x.n), ['나']);
  sc.eq('다른 목록에 있던 것은 남는다', _swIsKept(R1), true);
  sc.eq('그 목록에만 있던 것은 빠진다', _swIsKept(R2), false);
}

console.log('\n시나리오 8 — 기본 목록 이름을 쓴 기록도 같은 것으로 본다');
{
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00'}],
    '2026-08-21':[{ref:R2,time:'09:00',lst:KEEP_DEFAULT_LIST}]
  };
  sc.eq('한 목록으로 보인다', _keepLists().length, 1);
  sc.eq('둘 다 들어 있다', _swKeeps(0,KEEP_DEFAULT_LIST).length, 2);
  ST.verseKeepLog['2026-08-22']=[{ref:P1,time:'09:00',lst:'  '}];
  sc.eq('빈 이름도 기본 목록', _keepLists().length, 1);

  // v26-0831-16, HB — 기본 목록 이름이 '저장됨' → '기본' 으로 바뀌었다.
  // ⚠️ 기본 목록은 기록에 lst 를 **안 쓰므로** 이미 쌓인 기록은 저절로 따라온다.
  //    다만 옛 이름이 적힌 기록(그 이름으로 목록을 손수 만들었을 수 있다)이
  //    남아 있으면 목록이 둘로 갈려 보인다 → 같은 것으로 읽어 준다.
  sc.eq('기본 목록 이름', KEEP_DEFAULT_LIST, '기본');
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00'}],
    '2026-08-21':[{ref:R2,time:'09:00',lst:'저장됨'}]
  };
  sc.eq('옛 이름도 기본 목록', _keepLists().map(x=>x.n), ['기본']);
  sc.eq('둘 다 기본에 들어 있다', _swKeeps(0,'기본').length, 2);
  sc.eq('옛 이름으로 물어도 같다', _swIsKept(R2,'기본'), true);
  // 옛 이름으로 담으면 기본에 담긴다 (목록이 새로 생기면 안 된다)
  ST.verseKeepLog = {};
  swKeepSet(P1,'저장됨',true);
  sc.eq('옛 이름으로 담아도 기본', _keepLists().map(x=>x.n), ['기본']);
  sc.eq('기록에는 lst 를 안 쓴다',
        ST.verseKeepLog[TODAY][0].lst === undefined, true);
}

console.log('\n시나리오 9 — 좌상단 말씀메뉴의 두 갈래 (HB)');
{
  // '말씀 목록' → '활동 목록', 그 아래 '저장 목록' (v26-0831-15, HB)
  // ⚠️ 용어 — '말씀' = 성경 구절 하나, '명제' = 설교 명제 하나.
  //    둘을 아우르는 한 단어는 만들지 않는다. 아우를 자리에서는 이름을 짧게 둔다.
  sc.eq('활동 목록', SRC_DEV.includes('<span style="flex:1;">활동 목록</span>'), true);
  sc.eq('저장 목록', SRC_DEV.includes('<span style="flex:1;">저장 목록</span>'), true);
  sc.eq('이름에서 말씀을 뗐다', SRC_DEV.includes('말씀 활동 목록'), false);
  sc.eq('옛 이름은 메뉴에 없다', /flex:1;">말씀 목록</.test(SRC_DEV), false);
  sc.eq('저장 목록 줄이 있다', SRC_DEV.includes('onclick="logoMenuOpenKeepSub()"'), true);
  sc.eq('하위 뎁스 상자가 있다', SRC_DEV.includes('id="logoMenuKeepSub"'), true);
  sc.eq('만들어 둔 목록만큼 그린다', SRC_DEV.includes('function _renderKeepSubMenu('), true);
  sc.eq('목록을 누르면 팝업', SRC_DEV.includes('onclick="openKeepListPopup('), true);
  // 활동 목록과 **같은 팝업**을 쓴다 (필터 줄도 그대로 따라온다)
  sc.eq('같은 팝업을 쓴다', /function openKeepListPopup[\s\S]{0,500}vAggModal/.test(SRC_DEV), true);
}

console.log('\n시나리오 10 — 좌측 정렬 칩: 최신순 ⇄ 등록순 (HB)');
{
  // 칩을 늘리지 않고 **하나가 두 몫**을 한다 (UI 원칙: 나란히 늘리지 말고 교체)
  sc.eq('짝이 정해져 있다', /_VL_SORT_PAIR=\[\['recent','최신순'\],\['reg','등록순'\]\]/.test(SRC_DEV), true);
  sc.eq('누르면 뒤집힌다', SRC_DEV.includes('function vlTogglePairSort('), true);
  sc.eq('활동 목록의 세 번째는 많은순', /mem:\['count','많은순'\]/.test(SRC_DEV), true);
  sc.eq('저장 목록의 세 번째는 성경순', /keep:\['bible','성경순'\]/.test(SRC_DEV), true);
  sc.eq('등록순은 모음에 실린 차례', SRC_DEV.includes('function _vlRegIdx('), true);
  sc.eq('성경순은 이미 있던 자로 잰다', SRC_DEV.includes("sort==='bible'"), true);
  // 기간 칩 5개는 그대로
  sc.eq('기간 칩은 그대로 다섯',
        /_VL_PERIODS=\[\['week','주간'\],\['month','월간'\],\['year','연간'\],\['all','전체'\],\['custom','직접'\]\]/.test(SRC_DEV), true);
}

console.log('\n시나리오 11 — 저장 단추는 공유 바로 위, 늘 보인다 (HB)');
{
  const acts = (SRC_DEV.match(/id="vfAct(?:keep|like|mem|deeper|even|share)"/g)||[])
                 .map(x=>x.slice(9,-1));
  sc.eq('차례가 …저장·공유', acts.slice(-2), ['keep','share']);
  // 예전처럼 감추지 않는다 — BLOCK7 에도 꺼내 볼 자리가 생겼다
  sc.eq('감추던 규칙을 없앴다', SRC_DEV.includes('.vf-act-keep{display:none;}'), false);
  sc.eq('제품·종류를 가리지 않는다',
        SRC_DEV.includes("const show=((typeof _swOn==='function')&&_swOn())||_vfIsProp(v);"), false);
  sc.eq('저장 여부만 본다', SRC_DEV.includes('const on=_swIsKept(ref);'), true);
  // v26-0831-13, HB — **탭 한 번**에 목록 고르기 창. 롱터치를 알아야만 쓸 수
  //   있으면 아무도 목록을 못 고른다. 저장 여부는 그 창의 체크로 정한다.
  sc.eq('고르기 창이 있다', SRC_DEV.includes('id="keepPickModal"'), true);
  sc.eq('탭 한 번에 열린다',
        /else if\(kind==='keep'\)\{[\s\S]{0,300}openKeepPicker\(_reactKey\(v\)\);/.test(SRC_DEV), true);
  sc.eq('롱터치 장치는 없앴다', SRC_DEV.includes('_bindKeepLongPress'), false);
  sc.eq('바로 저장해 버리지 않는다',
        /else if\(kind==='keep'\)\{[\s\S]{0,300}swToggleKeep/.test(SRC_DEV), false);
  sc.eq('새 목록을 만들 수 있다', SRC_DEV.includes('function keepPickNew('), true);
  // v26-0831-14, HB — 하단 가운데에 작은 '확인'. 고른 것은 누르는 즉시
  //   저장되므로 이 단추는 "다 골랐다"는 뜻이다 (하단엔 실행 버튼만: UI 원칙).
  sc.eq('하단 가운데 확인 단추',
        SRC_DEV.includes('<button class="keep-pick-ok" onclick="closeKeepPicker()">확인</button>'), true);
  sc.eq('가운데에 놓는다',
        /justify-content:center;padding-top:10px;">\s*<button class="keep-pick-ok"/.test(SRC_DEV), true);
  sc.eq('ESC 로도 닫힌다', /\['keepPickModal',\s*\(\)=>closeKeepPicker\(\)\]/.test(SRC_DEV), true);
  sc.eq('바깥을 눌러도 닫힌다', SRC_DEV.includes("['keepPickOverlay','keepPickModal']"), true);
}

console.log('\n시나리오 12 — 저장 기록은 예전과 **같은 자리**에 남는다');
{
  // ⚠️ 여기 다섯 줄이 깨지면 26-0831 사고가 되풀이된다
  sc.eq('① 기본 상태에 있다', /defaultState[\s\S]{0,1200}verseKeepLog:\{\}/.test(SRC_DEV), true);
  sc.eq('② 시작할 때 채운다',
        SRC_DEV.includes('if(!ST.verseKeepLog)ST.verseKeepLog={};'), true);
  sc.eq('③ 병합이 로그로 다룬다',
        SRC_DEV.includes("||k==='verseKeepLog')v=_mgLogFlat(bv,lv,cv,baseKnown);"), true);
  sc.eq('④ 대량 손실 방어가 센다',
        SRC_DEV.includes('verseLogs:_fbCountArrays(o.verseKeepLog||{},0)'), true);
  sc.eq('⑤ 클라우드에서 받아 반영한다',
        SRC_DEV.includes('if(remote.verseKeepLog)ST.verseKeepLog=remote.verseKeepLog;'), true);
  // 새 저장 항목을 만들지 않았다는 증거
  sc.eq('목록 이름을 따로 저장하지 않는다', SRC_DEV.includes('ST.keepLists'), false);
}

console.log('\n시나리오 13 — 상단 말씀영역은 첫 성경만 (HB)');
{
  // 한 줄짜리 자리라 셋을 다 쓰면 본문이 밀린다 → 첫 번째 + '..'
  sc.eq('첫 번째만 쓰고 .. 를 붙인다',
        SRC_DEV.includes("return rs.length>1?(rs[0]+'..'):((v&&v.ref)||'');"), true);
  sc.eq('풀 모드가 그 값을 쓴다',
        SRC_DEV.includes('refEl.textContent  = s.verseFullRef!==false ? barRef : ;'.replace(' ;',` '';`)), true);
  sc.eq('스닉 모드도 그 값을 쓴다',
        SRC_DEV.includes('[refEl,   abbrevRef(barRef), s.verseSneakRef!==false],'), true);
  // 전체화면은 그대로 셋을 다 쓴다 (거기서는 하나하나가 제 필터다)
  sc.eq('전체화면은 셋을 다 쓴다', SRC_DEV.includes('function _vfRenderRef('), true);
}

console.log('\n시나리오 14 — 갈래 탭: 전체 · 말씀 · 명제 (HB)');
{
  sc.eq('탭 셋', /_VL_TABS=\[\['all','전체'\],\['verse','말씀'\],\['prop','명제'\]\]/.test(SRC_DEV), true);
  sc.eq('팝업이 탭 줄을 먼저 그린다',
        SRC_DEV.includes("_vlTabsHTML(kind)+_vListControlsHTML(kind)"), true);
  sc.eq('고른 갈래로 목록을 만든다',
        SRC_DEV.includes("_vListRowsHTML(_aggEntriesForKind(kind,tab),0,kind,tab==='all')"), true);
  sc.eq('명제인지 가린다', SRC_DEV.includes('function _vlIsProp('), true);
  // ⚠️ '전체' 에서만 줄마다 '명제' 표시 — 갈라 놓은 탭에서는 소음이다
  //    (자리와 모양은 시나리오 16 이 지킨다)
  sc.eq('전체에서만 표시를 단다', SRC_DEV.includes('(markProp&&v&&v.pid)'), true);
  // 줄이 하나 느는 자리라 높이를 최소로 (글자 10.5px)
  sc.eq('탭 높이를 최소로', SRC_DEV.includes('font-size:10.5px;line-height:1.3;'), true);
  sc.eq('테두리·박스 없이 글자만', /\.vl-tab\{background:none;border:0;padding:0;/.test(SRC_DEV), true);
  // 전체화면 이전/다음도 같은 탭을 따른다 (보이는 것과 도는 것이 어긋나면 안 된다)
  sc.eq('전체화면 명단도 같은 탭',
        SRC_DEV.includes('const rows=_aggEntriesForKind(kind,_vlTab(kind));'), true);
  // 오른쪽 판의 작은 위젯에는 탭을 넣지 않는다 (자리가 없다)
  sc.eq('위젯은 예전 그대로', SRC_DEV.includes('function _vListControlsHTML(kind){'), true);
}

console.log('\n시나리오 15 — 탭을 바꿔도 팝업이 움직이지 않는다 (v26-0831-17, HB)');
{
  // HB — "탭 변경 때 목록 양에 따라 팝업 세로 길이가 달라지면서 헤더 위치가 바뀐다"
  // ⚠️ max-height 만 두면 줄 수에 따라 상자가 늘었다 줄었다 하고, 가운데
  //    정렬이라 제목이 위아래로 움직인다 → **height 를 고정**한다.
  sc.eq('높이를 고정한다',
        SRC_DEV.includes('id="vAggModal" style="display:none;z-index:4360;width:320px;height:80vh;max-height:80vh;'), true);
  sc.eq('목록 칸이 남는 자리를 먹는다',
        SRC_DEV.includes('id="vAggList" style="overflow-y:auto;flex:1;min-height:0;"'), true);
}

console.log('\n시나리오 16 — 명제 표시는 오른쪽 묶음 맨 왼쪽에, 음영으로 (HB)');
{
  // HB — "명제 표시가 성경 장절의 얼라인을 깨뜨린다. 오른쪽 표시들의 왼쪽 끝으로.
  //       글자만이라 가독성이 떨어지니 음영으로. 크기는 그대로."
  sc.eq('장절 옆에는 안 붙인다',
        SRC_DEV.includes("sub.push('<span class=\"coll-propmark\""), false);
  sc.eq('오른쪽 묶음 맨 왼쪽',
        SRC_DEV.includes("${(markProp&&v&&v.pid)?'<span class=\"vli-propmark\">명제</span>':''}<span"), true);
  sc.eq('음영을 깐다', /\.vli-propmark\{[^}]*background:var\(--s2/.test(SRC_DEV), true);
  sc.eq('크기는 그대로 9px', /\.vli-propmark\{font-size:9px;/.test(SRC_DEV), true);
  sc.eq('줄어들지 않는다', /\.vli-propmark\{[^}]*flex-shrink:0;/.test(SRC_DEV), true);
}

console.log('\n시나리오 17 — 상단 말씀영역의 태그 (v26-0831-17, HB)');
{
  // 풀 모드는 여섯 번째부터, 스닉픽은 두 번째부터 '..'
  sc.eq('풀 모드는 다섯 개까지', SRC_DEV.includes('const _VB_TAG_MAX_FULL=5;'), true);
  sc.eq('스닉픽은 한 개까지', SRC_DEV.includes('const _VB_TAG_MAX_SNEAK=1;'), true);
  sc.eq('넘치면 .. 하나로',
        SRC_DEV.includes("return a.length>max?a.slice(0,max).join(' ')+' ..':a.join(' ');"), true);
  sc.eq('풀 모드가 쓴다', SRC_DEV.includes('barTags(tagListFull,_VB_TAG_MAX_FULL)'), true);
  sc.eq('스닉픽도 쓴다', SRC_DEV.includes('barTags(((v&&v.tags)||[]),_VB_TAG_MAX_SNEAK)'), true);

  // ⚠️ HB 신고 — "스닉픽에서 태그를 켜도 안 보인다". 폭 0 으로 짜부라져 있었다.
  //    태그의 flex-shrink 가 3, 본문이 1 이라 태그가 세 배 빨리 줄어 먼저 사라졌다.
  //    (주석의 "본문 → 태그 → 소주제" 차례와 값이 거꾸로였다)
  sc.eq('본문이 가장 많이 줄어든다', SRC_DEV.includes('flex:0 8 auto;min-width:0;'), true);
  sc.eq('태그는 그 다음',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTag{flex-shrink:2;}'), true);
  sc.eq('소주제가 마지막',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTopic{flex-shrink:1;}'), true);
  sc.eq('태그가 세 배 빨리 줄던 값은 없앴다',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTag{flex-shrink:3;}'), false);
}

sc.done();
