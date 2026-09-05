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
function _keepRepaintLists(){}   // 화면 다시 그리기는 이 시험의 관심사가 아니다
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

console.log('\n시나리오 4 — 목록 차례 (v26-0831-19, HB)');
{
  // ⚠️ '기본' 을 맨 앞에 못 박던 규칙은 없앴다 — 기본 목록을 만들지 않기로 했다.
  //    차례는 사용자가 고른 정렬을 그대로 따른다.
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00',lst:'오래된 것'}],
    '2026-08-29':[{ref:R2,time:'09:00',lst:'최근 것'},{ref:P2,time:'09:01',lst:'최근 것'}],
    '2026-08-25':[{ref:P1,time:'09:00'}]      // lst 없음 → 옛 '기본' 기록
  };
  ST.settings={};
  sc.eq('기본값은 최근 저장 순',
        _keepLists().map(x=>x.n), ['최근 것',KEEP_DEFAULT_LIST,'오래된 것']);
  // 등록순 = 목록이 **처음 생긴** 때 (여기서는 한 항목뿐이라 저장 때와 같다)
  keepSetSort('reg');
  sc.eq('등록순', _keepLists().map(x=>x.n), ['오래된 것',KEEP_DEFAULT_LIST,'최근 것']);
  keepSetSort('alpha');
  sc.eq('ㄱㄴㄷ순', _keepLists().map(x=>x.n),
        ['기본','오래된 것','최근 것'].sort((a,b)=>a.localeCompare(b,'ko')));
  keepSetSort('count');
  sc.eq('많은순', _keepLists().map(x=>x.n), ['최근 것',KEEP_DEFAULT_LIST,'오래된 것']);
  ST.verseKeepLog = {
    '2026-08-20':[
      {ref:R1,time:'09:00',lst:'🔥 나눔'},
      {ref:R2,time:'09:01',lst:'🙏 가나다'},
      {ref:P1,time:'09:02',lst:'Apple'}
    ]
  };
  keepSetSort('alpha');
  sc.eq('ㄱㄴㄷ순은 앞의 이모지를 빼고 목록 이름을 비교한다',
        _keepLists().map(x=>x.n), ['🙏 가나다','🔥 나눔','Apple']);
  keepSetSort('count');
  ST.verseKeepLog = {
    '2026-08-20':[
      {ref:R1,time:'09:00',lst:'Zebra'}, {ref:R2,time:'09:01',lst:'Zebra'},
      {ref:R1,time:'09:02',lst:'가나다'}, {ref:R2,time:'09:03',lst:'가나다'},
      {ref:R1,time:'09:04',lst:'Apple'}, {ref:R2,time:'09:05',lst:'Apple'},
      {ref:R1,time:'09:06',lst:'나다라'}, {ref:R2,time:'09:07',lst:'나다라'}
    ]
  };
  sc.eq('많은순 동률은 한글 먼저 ㄱㄴㄷ·그 뒤 알파벳순',
        _keepLists().map(x=>x.n), ['가나다','나다라','Apple','Zebra']);
  ST.verseKeepLog = {
    '2026-08-20':[{ref:R1,time:'09:00',lst:'오래된 것'}],
    '2026-08-29':[{ref:R2,time:'09:00',lst:'최근 것'},{ref:P2,time:'09:01',lst:'최근 것'}],
    '2026-08-25':[{ref:P1,time:'09:00'}]
  };
  // 내순서 — 손으로 정한 차례. 표에 없는 목록은 뒤에 최근순으로 붙는다.
  keepSetSort('manual');
  _keepSetOrder(['오래된 것','최근 것']);
  sc.eq('내순서', _keepLists().map(x=>x.n), ['오래된 것','최근 것',KEEP_DEFAULT_LIST]);
  _keepSetOrder([]);
  sc.eq('표가 비면 최근순으로', _keepLists().map(x=>x.n), ['최근 것',KEEP_DEFAULT_LIST,'오래된 것']);
  // 최신순 ⇄ 등록순은 칩 하나가 두 몫 (활동 목록과 같은 방식)
  keepSetSort('recent'); keepTogglePairSort();
  sc.eq('누르면 등록순', _keepSort(), 'reg');
  keepTogglePairSort();
  sc.eq('다시 누르면 최신순', _keepSort(), 'recent');
  // 짝 외의 정렬을 고르면 첫 짝은 비활성이지만, 글자는 마지막 선택을 기억한다.
  keepSetSort('reg'); keepSetSort('alpha');
  sc.eq('비활성이 되어도 등록순을 기억', _keepPairSort(), 'reg');
  keepTogglePairSort();
  sc.eq('비활 짝을 누르면 보이던 등록순으로', _keepSort(), 'reg');
  keepSetSort('alpha'); keepTogglePairSort();
  sc.eq('비활 등록순을 다시 눌러도 등록순', _keepSort(), 'reg');
  keepTogglePairSort();
  sc.eq('활성인 등록순을 누르면 최신순', _keepSort(), 'recent');
  // ⚠️ 차례·내순서는 **설정 안**에 둔다 (설정은 키마다 따로 병합된다)
  sc.eq('설정에 담는다', typeof ST.settings.keepListSort, 'string');
  keepSetSort('manual'); _keepSetOrder(['가']);
  sc.eq('내순서도 설정에', ST.settings.keepListOrder, ['가']);
  ST.settings={};
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
  sc.eq('같은 팝업을 쓴다', /function openKeepListPopup[\s\S]{0,900}vAggModal/.test(SRC_DEV), true);
}

console.log('\n시나리오 10 — 좌측 정렬 칩: 최신순 ⇄ 등록순 (HB)');
{
  // 칩을 늘리지 않고 **하나가 두 몫**을 한다 (UI 원칙: 나란히 늘리지 말고 교체)
  sc.eq('짝이 정해져 있다', /_VL_SORT_PAIR=\[\['recent','최신순'\],\['reg','등록순'\]\]/.test(SRC_DEV), true);
  sc.eq('누르면 뒤집힌다', SRC_DEV.includes('function vlTogglePairSort('), true);
  sc.eq('비활이면 표시된 짝으로 돌아간다',
        SRC_DEV.includes("vlSetSort(kind,pairOn?(pairKey==='recent'?'reg':'recent'):pairKey);"), true);
  sc.eq('활동 목록의 세 번째는 많은순', /mem:\['count','많은순'\]/.test(SRC_DEV), true);
  sc.eq('저장 목록의 세 번째는 성경순', /keep:\['bible','성경순'\]/.test(SRC_DEV), true);
  sc.eq('등록순은 모음에 실린 차례', SRC_DEV.includes('function _vlRegIdx('), true);
  sc.eq('성경순은 이미 있던 자로 잰다', SRC_DEV.includes("sort==='bible'"), true);
  // 기간 칩 5개는 그대로
  sc.eq('기간 칩은 그대로 다섯',
        /_VL_PERIODS=\[\['week','주간'\],\['month','월간'\],\['year','연간'\],\['all','전체'\],\['custom','직접'\]\]/.test(SRC_DEV), true);
}

console.log('\n시나리오 11 — 저장 단추는 좋아요 바로 아래, 늘 보인다 (HB)');
{
  const acts = (SRC_DEV.match(/id="vfAct(?:keep|like|mem|deeper|even|share)"/g)||[])
                 .map(x=>x.slice(9,-1));
  sc.eq('차례가 좋아요·저장…', acts.slice(0,2), ['like','keep']);
  // 예전처럼 감추지 않는다 — BLOCK7 에도 꺼내 볼 자리가 생겼다
  sc.eq('감추던 규칙을 없앴다', SRC_DEV.includes('.vf-act-keep{display:none;}'), false);
  sc.eq('제품·종류를 가리지 않는다',
        SRC_DEV.includes("const show=((typeof _swOn==='function')&&_swOn())||_vfIsProp(v);"), false);
  // 채운 책갈피는 **담긴 데가 있는가**만 본다 (제품·종류를 안 본다).
  // v26-0902-1 — 숫자를 0 으로도 적어야 해서 목록 수를 한 번만 세고 그것으로 판단한다
  // (_swIsKept(ref) 와 같은 뜻이다 — 두 번 세지 않을 뿐).
  sc.eq('저장 여부만 본다',
        SRC_DEV.includes('const n=_keepListsOf(ref).size;')&&SRC_DEV.includes('const on=n>0;'), true);
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
  // v26-0904-7 — 컨트롤 줄은 팝업·위젯 공용이 됐다. 위젯에서 부를 때만
  // argId(위젯 id)를 넘긴다 (저장 폴더 이름을 onclick 에 적지 않기 위해서다).
  sc.eq('컨트롤 줄은 여전히 공용',
        SRC_DEV.includes('function _vListControlsHTML(kind,extra,argId){'), true);
  sc.eq('팝업은 예전처럼 갈래만 넘긴다', SRC_DEV.includes('_vListControlsHTML(kind)'), true);
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
  // v26-0831-18, HB — 태그는 아예 줄이지 않는다 (말줄임이 태그 글자를 잘랐다)
  sc.eq('태그는 안 줄인다',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTag{flex:0 0 auto;}'), true);
  sc.eq('소주제가 마지막',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTopic{flex-shrink:1;}'), true);
  sc.eq('태그가 세 배 빨리 줄던 값은 없앴다',
        SRC_DEV.includes('#verseBarInner.sneak-mode #verseBarTag{flex-shrink:3;}'), false);
}

console.log('\n시나리오 18 — 기본 목록을 만들지 않는다 (v26-0831-19, HB)');
{
  // HB — "저장목록에 '기본' 없애자. 불필요하고 지저분해"
  // ⚠️ 다만 예전에 기본으로 저장된 기록(lst 가 없는 항목)은 그대로 '기본' 이라는
  //    이름으로 보인다 — 그러지 않으면 그 기록이 어디에도 안 보인다.
  sc.eq('빈 기본을 미리 보여 주지 않는다',
        SRC_DEV.includes("if(!names.includes(KEEP_DEFAULT_LIST))names.unshift(KEEP_DEFAULT_LIST);"), false);
  sc.eq('기본을 맨 앞에 못 박지 않는다',
        SRC_DEV.includes("if(a.n===KEEP_DEFAULT_LIST)return-1;"), false);
  // Sweeter 타일의 책갈피도 목록을 고르게 한다 (기본에 몰래 담지 않는다)
  sc.eq('타일도 목록을 고르게 한다', SRC_DEV.includes('}else openKeepPicker(rk);'), true);
  // 실제로 — 목록이 하나도 없으면 아무 이름도 안 나온다
  ST.verseKeepLog={}; ST.settings={};
  sc.eq('목록이 없으면 비어 있다', _keepLists().length, 0);
  // lst 없이 담긴 옛 기록은 '기본' 으로 보인다
  ST.verseKeepLog={'2026-08-20':[{ref:R1,time:'09:00'}]};
  sc.eq('옛 기록은 기본으로 보인다', _keepLists().map(x=>x.n), [KEEP_DEFAULT_LIST]);
  ST.verseKeepLog={}; ST.settings={};
}

console.log('\n시나리오 19 — 목록 손보기: 정렬 · 내순서 · ⋯ 메뉴 · 이름 (HB 4)');
{
  // 4-1-2 / 4-2-1 — 정렬 칩 줄 (두 자리가 **같은 것**을 쓴다)
  sc.eq('정렬 칩 줄이 하나', SRC_DEV.includes('function _keepSortRowHTML(){'), true);
  sc.eq('고르기 창이 쓴다', SRC_DEV.includes("srt.innerHTML=_keepSortRowHTML();"), true);
  sc.eq('좌상단 메뉴도 쓴다', SRC_DEV.includes('</div>`+_keepSortRowHTML()+`<div class="task-menu-sep"></div>`'), true);
  sc.eq('최신순 ⇄ 등록순', SRC_DEV.includes('function keepTogglePairSort(){'), true);
  // 4-1-1 — 이름은 좌정렬
  sc.eq('이름은 좌정렬', /\.keep-pick-nm\{flex:1;min-width:0;text-align:left;/.test(SRC_DEV), true);
  // '내순서' 를 켜야 손잡이가 나온다
  sc.eq('내순서일 때만 손잡이', SRC_DEV.includes("const drag=_keepSort()==='manual';"), true);
  sc.eq('끌어서 차례 바꾸기', SRC_DEV.includes('function _keepBindDrag(box){'), true);
  sc.eq('내순서는 행 전체에서 끌기 시작',
        SRC_DEV.includes("el=e.target.closest('[data-keepname]');"), true);
  sc.eq('저장하는 목록의 ⋯ 버튼은 끌기에서 제외',
        SRC_DEV.includes("if(e.target.closest('.keep-row-more'))return;"), true);
  // v26-0831-21, HB — **스위터 방식**이다. 잡은 줄은 손가락을 따라 그 자리에서
  //   떠서 움직이고(그림자 복제를 만들지 않는다), 나머지는 FLIP 으로 비켜 준다.
  //   시간·곡선은 스위터 타일판과 **똑같은 값**(_SW_SLIDE · _SW_EASE)을 쓴다.
  sc.eq('그림자 복제를 만들지 않는다', SRC_DEV.includes("keep-ghost"), false);
  sc.eq('도착지 선도 없앴다', SRC_DEV.includes("keep-dropline"), false);
  sc.eq('잡은 줄이 떠서 따라온다', /\.keep-dragging\{position:relative;z-index:30;/.test(SRC_DEV), true);
  sc.eq('스위터의 속도·곡선 그대로',
        SRC_DEV.includes("r.style.transition='transform '+(_SW_SLIDE/1000)+'s '+_SW_EASE;"), true);
  // ⚠️ 자리 셈은 화면 좌표가 아니라 offsetTop 으로 — 애니메이션 중에 떨리지 않게
  sc.eq('진짜 자리로 센다',
        SRC_DEV.includes("const c=el.offsetTop+(lastY-grabY)+el.offsetHeight/2;"), true);
  // 1-2 — 손잡이는 줄의 **맨 오른쪽**, 그림은 = 두 줄
  sc.eq('손잡이가 맨 오른쪽(좌상단 메뉴)',
        SRC_DEV.indexOf('<span class="task-menu-side" style="pointer-events:none;color:var(--tx3);font-size:10px;">${L.cnt}</span>`\n    +(drag?`<span class="keep-grip" data-keepgrip="1">')>=0, true);
  sc.eq('손잡이가 ⋯ 오른쪽(고르기 창)',
        SRC_DEV.indexOf('${_KEEP_DOTS}</button>`\n      +(drag?`<span class="keep-grip" data-keepgrip="1">')>=0, true);
  sc.eq('= 두 줄 손잡이', SRC_DEV.includes("<path d=\"M2.5 4.5h9\"/><path d=\"M2.5 8.5h9\"/>"), true);
  sc.eq('세 줄 점 손잡이는 없앴다', SRC_DEV.includes('<circle cx="4" cy="13" r="1.2"/>'), false);
  // ⚠️ '내순서' 에서도 목록을 고를 수 있어야 한다 (HB 신고)
  sc.eq('내순서에서도 고를 수 있다',
        SRC_DEV.includes("if(_keepSort()==='manual')return;      // 차례를 고치는 중에는 담기지 않는다"), false);
  sc.eq('메뉴에서도 들어갈 수 있다',
        SRC_DEV.includes("+(drag?'':` onclick=\"openKeepListPopup("), false);
  // 끌고 난 직후의 클릭은 삼킨다 (엉뚱한 목록이 골라지지 않게)
  sc.eq('끌린 뒤 클릭은 삼킨다', SRC_DEV.includes('if(box._keepSwallow&&Date.now()-box._keepSwallow<400){'), true);
  // 4-1-3 — ⋯ 메뉴 (말씀 모음 롱터치 메뉴와 같은 디자인)
  sc.eq('⋯ 단추가 있다', SRC_DEV.includes('class="keep-row-more"'), true);
  sc.eq('같은 디자인의 메뉴', SRC_DEV.includes('<div class="task-menu" id="keepRowMenu"'), true);
  sc.eq('수정과 삭제', SRC_DEV.includes('onclick="keepRowEdit()"')&&SRC_DEV.includes('onclick="keepRowDelete()"'), true);
  sc.eq('삭제는 빨강', /onclick="keepRowDelete\(\)" style="color:var\(--danger/.test(SRC_DEV), true);
  sc.eq('ESC 로도 닫힌다', /\['keepRowMenu',\s*\(\)=>closeKeepRowMenu\(\)\]/.test(SRC_DEV), true);
  // 4-1-4 — 고른 것은 줄 전체의 음영으로
  sc.eq('고른 줄은 음영', /\.keep-pick-row\.on\{background:var\(--s2/.test(SRC_DEV), true);
  sc.eq('왼쪽 체크는 안 쓴다', SRC_DEV.includes('class="keep-pick-ck"'), false);
  // 4-2-2 — 팝업 제목을 눌러 이름을 바로 고친다
  sc.eq('제목이 고쳐 쓰는 자리', SRC_DEV.includes('id="vAggKeepName" class="keep-name-edit" contenteditable="true"'), true);
  sc.eq('바깥을 누르면 저장', SRC_DEV.includes('onblur="_keepNameCommit()"'), true);
  // 4-2-3 — 팝업 좌상단 햄버거 → 목록 바꾸기
  sc.eq('좌상단 햄버거', SRC_DEV.includes('id="vAggMenuBtn"')&&SRC_DEV.includes('onclick="toggleKeepSwitch()"'), true);
  sc.eq('저장 목록일 때만 보인다', SRC_DEV.includes("if(mb)mb.style.display='none';       // 활동 목록에는 바꿀 목록이 없다"), true);
  sc.eq('제목줄 아래로 미끄러진다', /#keepSwitchBox\{[^}]*transition:max-height/.test(SRC_DEV), true);
  // ⚠️ v26-0831-21, HB — ① 아래 깔린 말씀 목록과 **색이 갈려야** 인지가 된다
  //    ② 닫히는 움직임도 보여야 한다 (display:none 을 그 자리에서 주면 뚝 끊긴다)
  sc.eq('배경이 갈린다', /#keepSwitchBox\{[^}]*background:var\(--s2\)/.test(SRC_DEV), true);
  sc.eq('테두리와 그림자로 떠 보인다',
        /#keepSwitchBox\{[^}]*box-shadow:0 6px 16px/.test(SRC_DEV), true);
  sc.eq('접히는 자세까지 움직인다', /#keepSwitchBox\{[^}]*transform:translateY\(-6px\)/.test(SRC_DEV), true);
  sc.eq('닫히는 움직임이 끝난 뒤 감춘다',
        SRC_DEV.includes("box._keepHide=setTimeout(()=>{ if(!box.classList.contains('on'))box.style.display='none'; },280);"), true);
}

console.log('\n시나리오 20 — 많은순 · 고르기 개수 · 전체화면 저장 개수 (HB 7·8)');
{
  sc.eq('많은순이 ㄱㄴㄷ순 다음',
        SRC_DEV.includes("['alpha','ㄱㄴㄷ순'],['count','많은순'],['manual','내순서']"), true);
  sc.eq('고르기 목록에도 개수', SRC_DEV.includes('class="keep-pick-cnt"'), true);
  sc.eq('책갈피 아래는 저장 목록 수', SRC_DEV.includes('const n=_keepListsOf(ref).size;'), true);
}

console.log('\n시나리오 21 — 한 목록에 겹쳐 담기지 않는다 · 안 담겼으면 0 (v26-0902-1, HB)');
{
  // HB — "좋아요·암송 같은 활동 단추는 여러 번 눌러 카운트가 올라가지만,
  //       저장은 한 폴더(목록)에 중복으로 여러 번 저장되지 못하게 막아줘.
  //       대신 각기 다른 폴더(목록)에 저장되는 건 얼마든지 가능하게."
  //
  // 21-1 이 기기에서 여러 번 눌러도 하나 — 담는 자리(swKeepSet)에서 막는다
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  swKeepSet(R1, '설교 준비', true);
  swKeepSet(R1, '설교 준비', true);
  sc.eq('세 번 담아도 기록은 하나', Object.values(ST.verseKeepLog).flat().length, 1);
  sc.eq('목록 옆 숫자도 1', _keepLists()[0].cnt, 1);

  // 21-2 다른 목록에는 얼마든지 담긴다 (막는 것은 **같은 목록**뿐이다)
  swKeepSet(R1, '아이들과', true);
  swKeepSet(R1, '저녁 묵상', true);
  sc.eq('세 목록에 담긴다', _keepListsOf(R1).size, 3);
  sc.eq('목록마다 하나씩', _keepLists().map(x=>x.cnt), [1,1,1]);

  // 21-3 ⚠️ 기기 두 대가 각각 담은 것이 병합돼 들어온 모양.
  //   담는 자리로는 못 막는다 (상대 기기가 쓴 기록이다) — 읽을 때 하나로 접는다.
  ST.verseKeepLog = {
    '2026-08-30': [{ ref:R1, time:'09:00' }],
    '2026-08-31': [{ ref:R1, time:'21:30' }],
  };
  sc.eq('겹쳐 들어와도 목록 옆 숫자는 1', _keepLists()[0].cnt, 1);
  sc.eq('들어 있는 목록도 하나', _keepListsOf(R1).size, 1);
  sc.eq('열어 보면 한 줄', _swKeeps(0, KEEP_DEFAULT_LIST).length, 1);
  sc.eq('담은 때는 마지막에 담은 때', _keepLists()[0].when, '2026-08-31 21:30');
  sc.eq('등록순 기준은 처음 담은 때 그대로', _keepLists()[0].first, '2026-08-30 09:00');
  // ⚠️⚠️ 기록 자체는 **한 글자도 지우지 않는다.** 지우면 병합이 그것을
  //    "사용자가 뺐다"로 읽어 **다른 기기의 저장까지** 지운다 (26-0831 사고).
  sc.eq('기록은 그대로 둔다', Object.values(ST.verseKeepLog).flat().length, 2);

  // 21-4 목록이 다르면 겹침이 아니다 — 접지 않는다
  ST.verseKeepLog = {
    '2026-08-30': [{ ref:R1, time:'09:00' }],
    '2026-08-31': [{ ref:R1, time:'21:30', lst:'설교 준비' }],
  };
  sc.eq('목록이 다르면 둘 다 남는다', _keepListsOf(R1).size, 2);
  sc.eq('목록마다 하나씩 센다', _keepLists().map(x=>x.cnt), [1,1]);

  // 21-5 전체화면 우하단 책갈피 아래 숫자 — 담긴 데가 없으면 0
  ST.verseKeepLog = {};
  sc.eq('안 담겼으면 0', _keepListsOf(R1).size, 0);
  const vf = sliceDev('function _vfSyncCounts()', '// ── 말씀 공유');
  sc.eq('숫자는 담긴 목록 수', vf.includes('const n=_keepListsOf(ref).size;'), true);
  sc.eq('그 값을 그대로 적는다 (0 도)', vf.includes("setText('keep',n);"), true);
  sc.eq('한 군데라도 담겼을 때만 채운 책갈피', vf.includes('const on=n>0;'), true);
  // 처음 그려지기 전에도 빈칸이 아니라 0 이다
  sc.eq('HTML 기본값도 0',
        SRC_DEV.includes('<span class="vf-cnt" id="vfCntkeep">0</span>'), true);
  sc.eq('빈칸을 안 쓴다', SRC_DEV.includes('id="vfCntkeep">&nbsp;'), false);
}

console.log('\n시나리오 22 — 저장 목록의 삭제 (v26-0902-2, HB 신고)');
{
  // HB — "중복된 여분을 삭제하려는데 '삭제할 기록이 없어요' 라고 나와"
  //
  // 까닭 — deleteLatestVerseEvent 가 kind 를 like·even 만 가려내고 **나머지를
  //   전부 Deeper 로** 봤다. 'keep' 이 그리로 떨어져 Deeper 기록을 뒤졌다.
  //   못 찾으면 헛말이 뜨고, **찾으면 남의 기록(Deeper)이 지워진다.**
  const DEEPER = {};
  let TOASTS = [];
  function showToast(m){ TOASTS.push(m); }
  function rawSave(){}
  function refreshVerseMarksLive(){}
  function _keepAfterChange(){}
  function getMemLog(){ return {}; }
  function getLikeLog(){ return {}; }
  function getEvenDeeperLog(){ return {}; }
  function getDeeperLog(){ return DEEPER; }
  function _renderVAggBody(){}
  const window = { _vAggKeepList:null, _vAggKind:'keep' };
  const document = { getElementById: () => null };
  let CONFIRM_SAY = true, CONFIRM_MSG = '';
  function confirm(m){ CONFIRM_MSG = m; return CONFIRM_SAY; }
  eval(asVar(sliceDev('function deleteLatestVerseEvent(', '// ── 로고 메뉴에서 여는 집계 목록 팝업 ──')));

  // 22-1 목록을 열고 지우면 그 목록에서만 빠진다
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  swKeepSet(R1, '아이들과', true);
  TOASTS = []; window._vAggKeepList = '설교 준비';
  deleteLatestVerseEvent('keep', R1);
  sc.eq('그 목록에서 빠진다', _swIsKept(R1,'설교 준비'), false);
  sc.eq('다른 목록은 그대로', _swIsKept(R1,'아이들과'), true);
  sc.eq('헛말이 안 뜬다', TOASTS.includes('삭제할 기록이 없어요'), false);
  sc.eq('무엇을 했는지 말해 준다', TOASTS[0], "'설교 준비' 에서 뺐어요");

  // 22-2 ⚠️ 겹쳐 들어온 기록도 한 번에 같이 빠진다 (하나만 남지 않는다)
  ST.verseKeepLog = {
    '2026-08-30': [{ ref:R1, time:'09:00' }],
    '2026-08-31': [{ ref:R1, time:'21:30' }],
  };
  TOASTS = []; window._vAggKeepList = KEEP_DEFAULT_LIST;
  deleteLatestVerseEvent('keep', R1);
  sc.eq('겹친 기록까지 전부 빠진다', Object.values(ST.verseKeepLog).flat().length, 0);

  // 22-3 ⚠️⚠️ Deeper 기록은 건드리지 않는다 (이것이 진짜 위험했던 자리다)
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  DEEPER['2026-08-31'] = [{ ref:R1, time:'08:00' }];
  TOASTS = []; window._vAggKeepList = '설교 준비';
  deleteLatestVerseEvent('keep', R1);
  sc.eq('Deeper 기록은 그대로', (DEEPER['2026-08-31']||[]).length, 1);
  sc.eq('저장만 빠졌다', _swIsKept(R1), false);
  delete DEEPER['2026-08-31'];

  // 22-4 '전체' 로 볼 때는 담긴 데가 여럿이면 묻는다
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  swKeepSet(R1, '아이들과', true);
  TOASTS = []; window._vAggKeepList = null; CONFIRM_SAY = false;
  deleteLatestVerseEvent('keep', R1);
  sc.eq('아니라고 하면 그대로', _keepListsOf(R1).size, 2);
  sc.eq('몇 군데인지 묻는다', CONFIRM_MSG.includes('2개 목록'), true);
  CONFIRM_SAY = true;
  deleteLatestVerseEvent('keep', R1);
  sc.eq('그렇다고 하면 전부 빠진다', _keepListsOf(R1).size, 0);

  // 22-5 한 군데뿐이면 묻지 않는다
  ST.verseKeepLog = {};
  swKeepSet(R1, '설교 준비', true);
  CONFIRM_MSG = ''; window._vAggKeepList = null;
  deleteLatestVerseEvent('keep', R1);
  sc.eq('한 군데면 그냥 뺀다', _keepListsOf(R1).size, 0);
  sc.eq('묻지 않았다', CONFIRM_MSG, '');

  // 22-6 담긴 데가 없으면 조용히 알려 준다 (엉뚱한 기록을 뒤지지 않는다)
  TOASTS = [];
  deleteLatestVerseEvent('keep', R2);
  sc.eq('없다고 말해 준다', TOASTS[0], '저장한 데가 없어요');

  // 22-7 메뉴 글자도 하는 일에 맞춘다 — '삭제' 는 말씀을 지우는 것으로 읽힌다
  sc.eq('글자에 이름표가 있다', SRC_DEV.includes('<span id="vliDelLabel">삭제</span>'), true);
  sc.eq('목록을 보는 중이면 빼기', SRC_DEV.includes("?(window._vAggKeepList?'이 목록에서 빼기':'저장 풀기')"), true);
}

sc.done();
