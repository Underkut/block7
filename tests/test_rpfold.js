// 주간 · 월간 위젯 접기 (v. 26-1030-9, HB)
//   헤더 빈 곳을 누를 때마다 펼침 → 요약 → 한 줄 → 펼침 (HB (나)).
//   접으면 늘 오늘부터 앞으로 — 일정 위주, 할일은 깃발(중요)만, 암송은 뺀다 (HB 시안).
// 그리고 같은 작업에서 고친 것: 두 칸 위젯 머리줄을 '누르기만' 해도 좌+중 ↔ 중+우 로 옮겨지던 것.
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const NOW = new Date(2026, 9, 30, 12, 0);          // 2026-10-30 (금) 12:00
const z = n => String(n).padStart(2, '0');
const key = n => { const d = new Date(2026, 9, 30 + n); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`; };
let EV = {}, TK = [];
global.z = z;
global.ST = { settings: { layout: {} } };
global._lay = () => ST.settings.layout;
global.logicalNow = () => new Date(NOW);
global.todayKey = () => key(0);
global.SECS = [{ id: 'am' }, { id: 'pm' }];
global.getDisplayEvents = (k, sec) => (EV[k] && EV[k][sec]) || [];
global.getDisplayTasks = (k, sec, ty) => (k === key(0) && ty === 'big' && sec === 'am') ? TK : [];
global.esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
global.formatEventTime = t => t;
global._gcalEvTx = () => 'blue';

eval(slice('const _RP_FOLD_NEXT=', 'function rpFoldCycle(')
   + ';Object.assign(globalThis,{_RP_FOLD_NEXT,_rpFoldOf,_rpFoldData,_rpFoldLineRow,_rpFoldSumHTML});');

console.log('시나리오 1 — 누를 때마다 펼침 → 요약 → 한 줄 → 펼침 (HB (나))');
{
  const seq = []; let f = '';
  for (let i = 0; i < 4; i++) { f = _RP_FOLD_NEXT[f]; seq.push(f || '펼침'); }
  sc.eq('순서', seq, ['sum', 'line', '펼침', 'sum']);
  ST.settings.layout = { fold: { weekly: 'line', monthSingle: '이상한값' } };
  sc.eq('저장된 접힘', [_rpFoldOf('weekly'), _rpFoldOf('monthSingle'), _rpFoldOf('todo')], ['line', '', '']);
}

console.log('\n시나리오 2 — 오늘부터 앞으로의 일정만');
{
  EV = {
    [key(-1)]: { am: [{ text: '어제 일정', time: '10:00' }] },
    [key(0)]: { am: [{ text: '아침 기도', time: '06:00' }, { text: '종일 일정' }], pm: [{ text: '보수교육', time: '19:30' }, { text: '셀', time: '20:30' }] },
    [key(1)]: { am: [{ text: '지결', time: '09:00' }] },
    [key(3)]: { am: [{ text: '다음 주 월요일', time: '10:00' }] },
    [key(10)]: { am: [{ text: '열흘 뒤', time: '10:00' }] },
  };
  TK = [];
  let D = _rpFoldData('weekly');
  sc.eq('⭐ 주간은 오늘부터 7일 (v. 26-1031-1 — 예전 \'이번 주 남은 날\' 은 토요일엔 오늘뿐)', D.days.map(x => x.i), [0, 1, 3]);
  sc.eq('오늘: 이미 지난 일정은 빼고, 종일 먼저 · 시간순', D.days[0].evs.map(e => e.text), ['종일 일정', '보수교육', '셀']);
  D = _rpFoldData('monthSingle');
  sc.eq('월간은 30일 안', D.days.map(x => x.i), [0, 1, 3, 10]);
  // 여러 날 일정은 한 번만
  EV = { [key(0)]: { am: [{ text: '여행', _spanN: 3, _spanFrom: key(-1) }] }, [key(1)]: { am: [{ text: '여행', _spanN: 3, _spanFrom: key(-1) }] } };
  D = _rpFoldData('weekly');
  sc.eq('여러 날 일정은 처음 보이는 날 한 번', D.days.map(x => x.evs.length), [1]);
}

console.log('\n시나리오 3 — 할일은 오늘의 깃발(중요)만, 끝난 것 빼고');
{
  EV = {};
  TK = [{ text: '주보글', flag: true }, { text: '끝남', flag: true, done: true }, { text: '보통' }, { text: '  ', flag: true }, { text: '영상기획', flag: true }];
  sc.eq('깃발 할일', _rpFoldData('weekly').flags.map(t => t.text), ['주보글', '영상기획']);
}

console.log('\n시나리오 4 — 그리는 모양 (v. 26-1031-1: 넓으면 빈자리를 쓴다)');
{
  EV = { [key(0)]: { pm: [{ text: '보수교육', time: '19:30' }, { text: '셀', time: '20:30' }, { text: '기도회', time: '21:00' }, { text: '넷째', time: '22:00' }] }, [key(1)]: { am: [{ text: '지결', time: '09:00' }] } };
  TK = [{ text: 'A', flag: true }, { text: 'B', flag: true }, { text: 'C', flag: true }, { text: 'D', flag: true }];
  const line = _rpFoldLineRow('weekly');
  sc.eq('한 줄: 후보를 다 그려 둔다 (폭에 맞춰 숨기는 것은 그린 뒤 _rpFoldFit)', (line.match(/class="rpf-it"/g) || []).length, 5);
  sc.eq('한 줄: 같은 날 둘째부터는 날 이름을 안 쓴다', [(line.match(/>오늘</g) || []).length, (line.match(/>내일</g) || []).length], [1, 1]);
  sc.eq('한 줄: ⚑ 숫자(좁을 때)와 이름(넓을 때)을 둘 다 갖고 있다', [/rpf-flcnt">4</.test(line), (line.match(/class="rpf-fi"/g) || []).length], [true, 4]);
  sc.eq('한 줄은 머리줄(끌어 옮기는 손잡이) 자리에 들어간다', /class="rp-widget-title rp-fold rp-fold-line"/.test(line), true);
  const sum = _rpFoldSumHTML('weekly');
  sc.eq('요약 넓은 모양: 날 칸 둘', (sum.match(/class="rpf-col"/g) || []).length, 2);
  sc.eq('요약 넓은 모양: 한 칸에 일정 셋 + 나머지 수', /넷째/.test(sum.split('rpf-narrow')[0]) === false && /\+1<\/span><\/div>/.test(sum), true);
  sc.eq('요약 넓은 모양: ⚑ 칸 — 셋 + 나머지 수', /⚑ 오늘 깃발[\s\S]*C<\/span><span class="rpf-more">\+1/.test(sum), true);
  const narrow = sum.split('class="rpf-narrow"')[1] || '';
  sc.eq('요약 좁은 모양: 한 날 일정 하나 + 나머지 수 (중간에서 안 잘리게)', /보수교육<\/span><\/span> <span class="rpf-more">\+3/.test(narrow), true);
  sc.eq('요약 좁은 모양: ⚑ 하나 + 나머지 수', /A <span class="rpf-more">\+3/.test(narrow), true);
  EV = {}; TK = [];
  sc.eq('일정 없으면 알린다', /다가오는 일정 없음/.test(_rpFoldLineRow('weekly')) && /다가오는 일정 없음/.test(_rpFoldSumHTML('weekly')), true);
  sc.eq('깃발 없으면 ⚑ 를 뺀다', /⚑/.test(_rpFoldSumHTML('weekly')), false);
  sc.eq('암송은 다루지 않는다', /Memoriz|getMemorizations|LikeLog/.test(slice('function _rpFoldData(', 'function rpFoldCycle(')), false);
  sc.eq('폭은 위젯 자신의 폭으로 — 요약은 컨테이너 쿼리, 한 줄은 그린 뒤 잰다', /\.rp-fold-sum\{container-type:inline-size/.test(SRC) && /_RPF_LINE_WIDE=560/.test(SRC), true);
}

console.log('\n시나리오 5 — 누르기만 하면 옮겨지지 않는다 (두 칸 위젯이 좌+중 ↔ 중+우 로 오가던 것)');
{
  const ghost = slice('function _ghostDragStart(opt){', '// D뷰: 위젯 헤더를 직접 잡고 드래그해');
  sc.eq('한 번도 안 움직이고 놓으면 아무 일도 없다', /window\._rpDragEndTs=Date\.now\(\);[\s\S]{0,80}if\(!moved\)return;\s*if\(offHit/.test(ghost), true);
  const hdr = slice('function _rpAttachHeaderDrag(host){', '// (예전 _attachWeeklyPaneDrag');
  sc.eq('마우스는 5px 넘게 움직여야 끌기 시작', /Math\.hypot\(ev\.clientX-sx,ev\.clientY-sy\)>5/.test(hdr), true);
  sc.eq('끌어 놓은 직후 click 은 접기가 무시', /_rpDragEndTs\|\|0\)<400\)return;/.test(SRC), true);
}

console.log('\n시나리오 6 — [W|M] 은 좌상단 … 바로 오른쪽에 고정');
{
  sc.eq('… 오른쪽 자리', /\.rp-wm-seg\.rp-wm-abs\{position:absolute;left:38px;top:3px;/.test(SRC), true);
  sc.eq('주간 내용 줄(− + 옆)에는 더 이상 없다', /_rpWMSegHTML\('weekly'\):'';\s*if\(ar/.test(SRC), false);
}

sc.done();
