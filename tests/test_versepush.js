// 말씀 푸시 '정해진 시각' — 수정할 때마다 입력창이 닫히던 것 + 분 단위 미적용 (v26-0817-15, HB 2)
//
// 실측 원인 두 가지:
//  ① vpSetTime()이 값을 바꿀 때마다 v.times.sort() 를 했다 → 배열 순서가
//     바뀌어 방금 만지던 칩이 다른 자리로 튀었다.
//  ② _syncVersePushUI()가 시각을 하나만 바꿔도 #vpTimeList 를 innerHTML 로
//     통째로 다시 그렸다 → <input type="time"> 자체가 지워지고 새로 생겨,
//     아이폰에서 열려 있던 시각 휠이 값을 고르자마자 그대로 닫혔다.
//  게다가 <input type="time"> 은 네이티브라 앱의 분 단위 설정(timeStepMin)을
//  아예 보지 않았다 — "일정 등록·시간구간의 시각"과는 따로 놀았다.
//
// 고침: 목록·간격 시작/끝 모두 앱 공통 롤 픽커(_makeTimeRollPair)로 바꿨다.
//  · 개수가 그대로면(값만 바뀔 때) 목록을 다시 그리지 않는다.
//  · 정렬은 편집 중엔 하지 않고, 요약 문구를 만들 때만 보기 좋게 정렬한다.
//  · 분 단위는 _makeTimeRollPair 안의 _fillMinOptions 가 timeStepMin 을 그대로 따른다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 값을 바꿔도 목록을 다시 그리지 않는다 (닫힘 버그의 핵심)');
{
  const fn = slice('function _syncVpTimeList(v){', 'function _syncVpTimeField');
  sc.eq('개수가 그대로면 손대지 않고 나간다',
        fn.includes('if(list.children.length===v.times.length)return;'), true);
  // ⚠️ 이 줄이 없으면 매번 innerHTML 을 다시 그려 지금 만지던 칩까지 지운다
  sc.eq('개수가 바뀔 때만 innerHTML 을 다시 그린다',
        fn.indexOf('if(list.children.length===v.times.length)return;') < fn.indexOf("list.innerHTML=''"), true);
  sc.eq('공통 롤 픽커를 쓴다', fn.includes('_makeTimeRollPair(t,val=>vpSetTime(i,val),true)'), true);
}

console.log('\n시나리오 2 — 값을 바꿔도 자리가 안 튄다 (정렬을 편집 중엔 안 한다)');
{
  const fn = slice('function vpSetTime(i,val){', 'function vpDelTime');
  // ⚠️ 예전 버그를 설명하는 주석 자체에 ".sort()" 라는 글자가 들어 있어
  //    문자열 포함만 보면 안 된다 — 실제 실행 줄에서만 확인한다.
  sc.eq('값만 그 자리에 넣는다', fn.includes('v.times[i]=val;_vpSave(v);'), true);
  sc.eq('실행문에는 sort 호출이 없다',
        /v\.times\[i\]=val;_vpSave\(v\);\s*\}/.test(fn), true);

  // 요약 문구에서만 보기 좋게 정렬 — 저장 배열 자체는 안 건드린다
  sc.eq("요약은 복사본을 정렬한다 ([...v.times].sort())",
        SRC.includes("parts.push([...v.times].sort().join(', '));"), true);
}

console.log('\n시나리오 3 — 간격 시작·끝도 같은 방식 (닫힘까지는 아니어도 분 단위는 안 맞았다)');
{
  const fn = slice('function _syncVpTimeField(wrapId,val,onCommit){', 'function _vpToMin');
  // ⚠️ 자기가 방금 커밋한 값이면 다시 그리지 않는다 — 안 그러면 무한 재생성 위험
  sc.eq('자기가 만든 변화면 다시 그리지 않는다', fn.includes('w.dataset.cur===val)return;'), true);
  sc.eq('커밋 전에 먼저 dataset 을 갱신한다',
        fn.indexOf('w.dataset.cur=v2;onCommit(v2);') > -1, true);
  sc.eq('공통 롤 픽커를 쓴다', fn.includes('_makeTimeRollPair(val,'), true);

  sc.eq('네이티브 time input 은 없앴다', SRC.includes('<input type="time" id="vpFrom"'), false);
  sc.eq('네이티브 time input 은 없앴다(vpTo)', SRC.includes('<input type="time" id="vpTo"'), false);
  sc.eq('대신 빈 자리만 둔다', SRC.includes('<span id="vpFromWrap"></span>') && SRC.includes('<span id="vpToWrap"></span>'), true);
}

console.log('\n시나리오 4 — 분 단위 설정을 실제로 따른다 (_makeTimeRollPair 경유)');
{
  // _makeTimeRollPair 자체가 _fillMinOptions(→_timeStep())를 쓰는 것은
  // 아침 요약 시각에서 이미 검증됐다. 여기선 우리가 그 함수를 "제대로 호출하는지"만 본다.
  const list = slice('function _syncVpTimeList(v){', 'function _syncVpTimeField');
  const field = slice('function _syncVpTimeField(wrapId,val,onCommit){', 'function _vpToMin');
  sc.eq('목록 쪽도 _makeTimeRollPair 를 쓴다 (자체 <input type=time> 아님)',
        list.includes('_makeTimeRollPair('), true);
  sc.eq('간격 쪽도 _makeTimeRollPair 를 쓴다', field.includes('_makeTimeRollPair('), true);
}

console.log('\n시나리오 5 — 추가·삭제는 개수가 바뀌므로 정상적으로 다시 그려진다');
{
  const del = slice('function vpDelTime(i){', 'function _syncVersePushUI');
  sc.eq('삭제는 배열에서 실제로 뺀다', del.includes('v.times.splice(i,1);_vpSave(v);'), true);
  const add = slice('function vpAddTime(){', 'function vpSetTime');
  sc.eq('추가는 배열에 실제로 늘린다', add.includes("v.times.push('12:00');_vpSave(v);"), true);
}

console.log('\n시나리오 6 — 알림이 명제를 정확히 가리킨다 (v26-0901-3, HB)');
{
  // HB 신고 — "아이폰에서 알림으로 온 명제를 열면 대표 문구가 빠져 있고,
  //   우하단 버튼도 명제용이 아니라 말씀용이 나열되어 있다."
  // 까닭 — 푸시에 실리는 것은 **장절 한 줄**뿐이다. 명제의 장절은 같은 장절의
  //   말씀(기본 180 등)과 겹치므로, 앱이 그 장절로 되찾을 때 말씀 쪽을 집었다.
  //   그래서 명제가 아닌 것으로 그려졌다 (대표 문구도 단추도 말씀 것).
  const pool = slice('function _syncVersePushPool(){', 'function _afterActiveVersesChanged');
  sc.eq('명제에는 열쇠를 함께 담는다',
        pool.includes('const k=_pushKey(v);\n      if(k)e.key=k;'), true);
  // ⚠️ 반응 키를 그대로 보내지 않는다 — 그것은 제어문자로 조각을 가르는데,
  //    FCM 과 주소를 지나오는 동안 제어문자는 조용히 사라질 수 있다.
  sc.eq('제어문자 없는 모양', SRC.includes("const _PUSH_PID_PREFIX='p7:';"), true);
  sc.eq('반응 키를 그대로 보내지 않는다', pool.includes('_reactKey(v)'), false);
  sc.eq('앱이 그 모양을 되읽는다', SRC.includes('function _pushKeyPid(k){'), true);
  sc.eq('되읽은 명제 ID 로 찾는다',
        SRC.includes('return (ACTIVE_VERSES()||[]).find(v=>v&&v.pid===pk)'), true);
  // ⚠️ 알림에 **보이는 글**은 예전 그대로다 (열쇠는 되돌려 줄 값에만 쓴다)
  sc.eq('보이는 글은 그대로', pool.includes("krText:v.krText||''"), true);
  // 앱이 그 열쇠를 되받아 그 명제를 찾아낸다 (이미 있던 길)
  sc.eq('열쇠로 찾는 길이 있다', SRC.includes('if(_isReactPid(ref)){'), true);

  // 푸시 함수 쪽 — 같은 저장소의 versepush/index.js
  const fs = require('fs'), path = require('path');
  const PUSH = fs.readFileSync(path.join(__dirname, '..', 'versepush', 'index.js'), 'utf8');
  sc.eq('열쇠가 있으면 그것을 보낸다',
        PUSH.includes('const openKey = verse.key || verse.ref;')
        || PUSH.includes("const openKey = verse.key || verse.ref || '';"), true);
  sc.eq('알림 data 에 그 값이 실린다',
        PUSH.includes("data: { type: 'verse', ref: openKey },"), true);
  // ⚠️ 알림 본문은 장절 그대로 — 열쇠가 사람 눈에 보이면 안 된다
  sc.eq('본문은 장절 그대로',
        PUSH.includes('const body = `${(verse.krText || \'\').trim()}\\n${verse.ref || \'\'}`.trim();'), true);
}

console.log('\n시나리오 6-2 — 앱을 켤 때 푸시 목록을 한 번 맞춘다 (v26-0901-4, HB)');
{
  // ⚠️ 이 목록은 여태 말씀 모음을 건드리거나 푸시 설정을 저장할 때만 다시
  //    만들어졌다. 그래서 v26-0901-3 이 넣은 명제 열쇠가 클라우드에 영영
  //    안 올라갈 수 있었다 (푸시 서버는 클라우드에 적힌 이 목록만 읽는다).
  sc.eq('켤 때 맞춘다',
        SRC.includes('if(_syncVersePushPool())save();\n    }catch(e){}\n  },2600);'), true);
  // ⚠️ 클라우드에서 상태가 오기 전에는 손대지 않는다 — 빈 목록을 올려 두면
  //    서버가 보낼 말씀을 잃는다.
  sc.eq('비었으면 손대지 않는다',
        SRC.includes('if(!(ACTIVE_VERSES()||[]).length)return;'), true);
  // 바뀐 것이 없으면 저장하지 않는다 (켤 때마다 쓰기가 생기면 안 된다)
  const pool2 = slice('function _syncVersePushPool(){', 'function _afterActiveVersesChanged');
  sc.eq('바뀔 때만 저장한다',
        pool2.includes('if(prev!==next){ST.settings.versePushPool=list;return true;}'), true);
}

console.log('\n시나리오 7 — 알림으로 연 말씀이 \'지금 자리\'가 된다 (v26-0901-3, HB)');
{
  // 안 그러면 다음/이전으로 넘길 때 알림 이전에 보던 순번에서 이어진다
  sc.eq('찾은 말씀으로 자리를 맞춘다',
        SRC.includes('try{ if(hit.idx&&getVerseByIdx(hit.idx)===hit)setVerseIdx(hit.idx); }catch(_){}'), true);
  // ⚠️ 그래도 지정은 유지한다 — 목록에 없는 말씀이면 순번이 못 따라간다
  sc.eq('지정도 그대로 둔다',
        /setVerseIdx\(hit\.idx\); \}catch\(_\)\{\}\s*\n\s*_vfOverrideVerse=hit;/.test(SRC), true);
}

sc.done();
