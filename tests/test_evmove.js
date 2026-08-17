// 시각 없는 일정을 드래그로 다른 시간구간에 옮기기 (v26-0817-12, HB 9)
//
// ⚠️ 저장 계층(ST.days[k].events)을 건드리는 기능이다. 옮기다 잃어버리면
//    사용자 일정이 그대로 사라지므로, "빼고 넣는" 한 걸음마다 확인한다.
//
// 예전엔 일정 칩을 끌어도 **자기 구간 안에서 순서만** 바뀌었다. 시각이 없는
// 일정은 시각으로 구간을 정할 수 없어, 한번 잘못 넣으면 지우고 다시 만드는
// 수밖에 없었다. 이제 구간을 넘어 옮길 수 있다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 옮기는 함수가 있고, 시각 있는 일정은 옮기지 않는다');
{
  sc.eq('구간 찾기 함수', SRC.includes('function _evSecAt(cx,cy){'), true);
  sc.eq('옮기기 함수', SRC.includes('function _evMoveToSec(fromSec,toSec,chip,ev){'), true);

  const mv = slice('function _evMoveToSec(', '// Long-press/long-click + drag');
  // 시각 있는 일정은 시각이 구간을 정한다 — 여기까지 와도 되돌린다
  sc.eq('시각 있으면 옮기지 않는다', /if\(!moving\|\|moving\.time\)/.test(mv), true);
  // 같은 구간이면 할 일이 없다
  sc.eq('같은 구간이면 그냥 나간다', mv.includes('if(!fromSec||!toSec||fromSec===toSec)return false;'), true);
  // 가상 칩(다른 날에서 비친 반복 일정)은 저장 자리가 없다
  sc.eq('저장 자리 없는 칩은 옮기지 않는다', mv.includes('if(isNaN(ownIdx))return false;'), true);
}

console.log('\n시나리오 2 — 빼고 넣는 순서가 맞다 (일정을 잃지 않는다)');
{
  const mv = slice('function _evMoveToSec(', '// Long-press/long-click + drag');
  // ⚠️ beforeSave() 가 splice 보다 먼저여야 되돌리기가 옮기기 전 상태를 잡는다
  sc.eq('beforeSave 가 먼저', mv.indexOf('beforeSave();') < mv.indexOf('from.splice('), true);
  sc.eq('원래 구간에서 뺀다', mv.includes('from.splice(ownIdx,1);'), true);
  sc.eq('새 구간에 넣는다', /to\.splice\(at,0,moving\);/.test(mv), true);
  sc.eq('자리를 못 정하면 맨 끝', mv.includes('if(at<0||at>to.length)to.push(moving);'), true);
  sc.eq('넣은 뒤 시간순으로 다시 세운다',
        mv.includes('ST.days[k].events[toSec]=_sortEventsKeepingTimeless(to);'), true);
  sc.eq('저장한다', mv.includes('save();'), true);
  sc.eq('두 구간 모두 다시 그린다',
        mv.includes('renderSecEvents(fromSec);') && mv.includes('renderSecEvents(toSec);'), true);
  sc.eq('두 구간 요약도 다시 센다',
        mv.includes('updateSecSummary(fromSec);updateSecSummary(toSec);'), true);
}

console.log('\n시나리오 3 — 실제로 옮겨 보고 개수를 센다');
{
  // 저장 배열만 흉내내어 _evMoveToSec 의 계산 부분을 그대로 돌려본다.
  // (DOM 없이 도는 부분만 떼어 확인 — 배열이 맞게 움직이는지가 핵심)
  const move = (from, to, ownIdx, at) => {
    const moving = from[ownIdx];
    from.splice(ownIdx, 1);
    if (at < 0 || at > to.length) to.push(moving); else to.splice(at, 0, moving);
    return { from, to };
  };
  {
    const r = move([{ text: 'A' }, { text: 'B' }, { text: 'C' }], [{ text: 'X' }], 1, 0);
    sc.eq('가운데 것을 빼면 나머지는 그대로', r.from.map(e => e.text).join(''), 'AC');
    sc.eq('받는 쪽 맨 앞에 들어간다', r.to.map(e => e.text).join(''), 'BX');
  }
  {
    const r = move([{ text: 'A' }], [{ text: 'X' }, { text: 'Y' }], 0, -1);
    sc.eq('자리를 못 정하면 맨 끝에', r.to.map(e => e.text).join(''), 'XYA');
    sc.eq('원래 구간은 비었다', r.from.length, 0);
  }
  {
    // 잃어버리지 않는다 — 옮기기 전후 전체 개수가 같다
    const from = [{ text: 'A' }, { text: 'B' }], to = [{ text: 'X' }];
    const before = from.length + to.length;
    const r = move(from, to, 0, 1);
    sc.eq('전체 개수가 그대로', r.from.length + r.to.length, before);
    sc.eq('받는 쪽 자리도 맞다', r.to.map(e => e.text).join(''), 'XA');
  }
}

console.log('\n시나리오 4 — 끌고 가는 동안의 표시');
{
  const at = slice('function attachEventChipInteraction(chip,secId,i,ev){', 'function _secNoTime');
  sc.eq('지금 놓일 구간을 따로 들고 있다', at.includes('let curSec=secId;'), true);
  sc.eq('시작할 때 자기 구간으로 되돌린다', at.includes('curSec=secId;\n    placeholder='), true);
  sc.eq('다른 구간 위로 가면 그 구간으로 옮겨 붙인다',
        /const over=_evSecAt\(clientX,clientY\);[\s\S]{0,260}curSec=over;/.test(at), true);
  sc.eq('놓을 자리를 세로선으로 보여준다', at.includes("placeholder.className='ev-chip-placeholder';"), true);
  sc.eq('세로선은 그 구간 색', at.includes("placeholder.style.background=getSecColor(curSec)||'';"), true);
  sc.eq('놓고 나면 구간 표시를 지운다', at.includes('_evMarkDropSec(null);'), true);
  // ⚠️ 옮긴 뒤에는 curSec 을 되돌려야 다음 드래그가 엉뚱한 구간에서 시작하지 않는다
  sc.eq('옮긴 뒤 curSec 을 되돌린다', /const moved=_evMoveToSec\(secId,curSec,chip,ev\);\s*curSec=secId;/.test(at), true);
}

console.log('\n시나리오 5 — 세로선·구간표시 CSS 가 있다');
{
  sc.eq('세로선 스타일', /\.ev-chip-placeholder\{[\s\S]{0,200}width:2px/.test(SRC), true);
  sc.eq('구간 표시 스타일', SRC.includes('.ts.ev-drop-in>.ts-hd{'), true);
}

sc.done();
