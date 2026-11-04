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
global._gcalEvColor = ev => ev && ev.col || '';

global.save = () => {};
eval(slice('const _RP_FOLD_NEXT=', 'function rpFoldCycle(')
   + ';Object.assign(globalThis,{_evLeadMin,_rpFoldEvCmp,_rpFoldEvHTML,_RP_FOLD_NEXT,_rpFoldOf,_rpFoldData,_rpFoldLineRow,_rpFoldSumHTML,_rpFoldSet,_rpFoldHandleHTML,_rpFoldSumH,RPF_SUM_MIN});');

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
  sc.eq('한 줄: ⚑ 숫자(좁을 때)와 이름(넓을 때)을 둘 다 갖고 있다', [/rpf-flcnt" data-k="fcnt">4</.test(line), (line.match(/class="rpf-fi"/g) || []).length], [true, 4]);
  sc.eq('한 줄은 머리줄(끌어 옮기는 손잡이) 자리에 들어간다', /class="rp-widget-title rp-fold rp-fold-line"/.test(line), true);
  const sum = _rpFoldSumHTML('weekly');
  sc.eq('요약 넓은 모양: 날 칸 둘', (sum.match(/class="rpf-col"/g) || []).length, 2);
  sc.eq('요약 넓은 모양: 칸마다 일정을 다 그려 두고 몇 개인지 적어 둔다 (몇 개 보일지는 그린 뒤 _rpFoldFitSum)', /class="rpf-col" data-n="4"/.test(sum) && (sum.split('rpf-narrow')[0].match(/rpf-ci/g) || []).length === 5 + 4, true);
  sc.eq('높이를 안 정했으면 칸마다 셋 (예전 모양)', /const RPF_SUM_CAP=3;/.test(SRC), true);
  sc.eq('요약 넓은 모양: ⚑ 칸', /<span data-k="fl">⚑<\/span> <span data-k="flh">오늘 중요/.test(sum) && /class="rpf-flcol" data-n="4"/.test(sum), true);
  const narrow = sum.split('class="rpf-narrow"')[1] || '';
  sc.eq('요약 좁은 모양: 한 날 일정 하나 + 나머지 수 (중간에서 안 잘리게)', /보수교육<\/span><\/span> <span class="rpf-more" data-k="m0">\+3/.test(narrow), true);
  sc.eq('요약 좁은 모양: ⚑ 는 한 줄에 하나씩 다 그려 두고(보일 수는 그린 뒤 _rpfFitFlags) 처음엔 하나', /class="rpf-fll" data-n="4" data-cap="1"/.test(narrow) && (narrow.match(/rpf-fbi/g) || []).length === 4, true);
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


console.log('\n시나리오 7 — 아래 핸들 (v. 26-1031-2): 요약 높이 · 끝까지 올리면 한 줄 · 한 줄은 끌어 내리면 요약');
{
  ST.settings.layout = { fold: { weekly: 'sum' } };
  ST.settings.rpWidgetHeights = {};
  sc.eq('높이를 안 정했으면 예전 모양(고정 높이 없음)', /rpf-fixed/.test(_rpFoldSumHTML('weekly')), false);
  _rpFoldSet('weekly', 'sum', 120.4);
  sc.eq('요약 높이를 기기별 위젯 높이 칸에', ST.settings.rpWidgetHeights['fold#weekly'], 120);
  sc.eq('그 높이로 그린다 (넘치는 것은 그린 뒤 아래부터 숨김)', /class="rp-fold rp-fold-sum rpf-fixed" style="height:120px"/.test(_rpFoldSumHTML('weekly')), true);
  _rpFoldSet('weekly', 'line');
  sc.eq('끝까지 올리면 한 줄로 — 높이 기억은 그대로', [_rpFoldOf('weekly'), ST.settings.rpWidgetHeights['fold#weekly']], ['line', 120]);
  _rpFoldSet('weekly', 'sum', 80);
  sc.eq('한 줄을 끌어 내리면 그 높이의 요약으로', [_rpFoldOf('weekly'), _rpFoldSumH('weekly')], ['sum', 80]);
  _rpFoldSet('weekly', 'sum', 1);
  sc.eq('너무 작은 값은 최소로', _rpFoldSumH('weekly'), RPF_SUM_MIN);
  sc.eq('요약 핸들 = 보통 핸들', /class="rp-vresize" data-vrtype="fold#weekly"/.test(_rpFoldHandleHTML('weekly', 'sum')), true);
  sc.eq('한 줄 핸들 = 얇은 핸들', /class="rp-vresize rp-vresize-slim" data-vrtype="foldline#weekly"/.test(_rpFoldHandleHTML('weekly', 'line')), true);
  sc.eq('핸들을 놓은 직후 click 은 접기 순환으로 안 간다', /window\._rpDragEndTs=Date\.now\(\);   \/\/ 핸들을 놓으며/.test(SRC), true);
}


console.log('\n시나리오 8 — 한 줄 ⇄ 요약 움직임 (v. 26-1031-3): 같은 글자를 짝짓는 이름표 · 핸들');
{
  EV = { [key(0)]: { pm: [{ text: '보수교육', time: '19:30' }, { text: '셀', time: '20:30' }] }, [key(1)]: { am: [{ text: '지결', time: '09:00' }] } };
  TK = [{ text: 'A', flag: true }, { text: 'B', flag: true }];
  const line = _rpFoldLineRow('weekly'), sum = _rpFoldSumHTML('weekly');
  const keys = h => [...h.matchAll(/data-k="([^"]+)"/g)].map(m => m[1]);
  const kl = new Set(keys(line)), ks = new Set(keys(sum));
  ['d0', 'e0-0', 'e0-1', 'd1', 'e1-0', 'fl', 'f0', 'f1'].forEach(k => sc.eq(`'${k}' 가 두 모양 모두에 있다`, kl.has(k) && ks.has(k), true));
  sc.eq('한 줄에만 있는 것 (⚑ 숫자)', kl.has('fcnt') && !ks.has('fcnt'), true);
  sc.eq('요약에만 있는 것 (⚑ 칸 머리)', ks.has('flh') && !kl.has('flh'), true);
  const hd = slice("const _RPF_H2=", "function _rpFoldSet(");
  sc.eq('한 줄 핸들 = 다른 핸들과 같은 크기의 선 하나 (윗줄과 같은 길이 · 두께)', /_RPF_H1='<svg width="16" height="6" viewBox="0 0 20 8"[^']*stroke-width="1\.6"[^']*<line x1="4" y1="4" x2="16" y2="4"\/><\/svg>'/.test(SRC), true);
  sc.eq('한 줄 핸들이 그 그림을 쓴다', /rp-vresize-slim[^`]*\$\{_RPF_H1\}/.test(hd), true);
  sc.eq('움직이는 동안 핸들은 두 그림을 겹쳐 엇갈려 보인다 (선을 옮기지 않아 두께가 안 흔들림)', /class="rpf-hx"><span class="h1">\$\{_RPF_H1\}<\/span><span class="h2">\$\{_RPF_H2\}/.test(SRC), true);
  sc.eq('끝나면 진짜 화면을 다시 그린다', /function finish\(state,target\)\{[\s\S]{0,400}renderLayout\(\);/.test(SRC), true);
  sc.eq('모션 줄이기면 예전처럼 바로', /\(isFold\|\|isFoldLine\)&&!_tfQuiet\(\)/.test(SRC), true);
}


console.log('\n시나리오 9 — 한 줄 여백 · 핸들 자리 (v. 26-1031-4, HB)');
{
  sc.eq('한 줄 핸들은 줄을 차지하지 않고 바닥에 얹힌다 (글자 위아래 여백이 같게)', /\.rp-vresize\.rp-vresize-slim\{position:absolute;left:0;right:0;bottom:0;/.test(SRC), true);
  sc.eq('움직이는 동안 핸들은 위젯 바닥에 붙어 손을 따라간다', /\.rp-widget\.rpf-morphing>\.rp-vresize\{position:absolute;/.test(SRC) && /hd\.style\.bottom=lerp\(-2,4,eIO\(P\)\)/.test(SRC), true);
}


console.log('\n시나리오 10 — 요약 ⚑ 목록은 높이만큼 (v. 26-1102-4) · 달성 줄 ⚑숫자 (HB (가))');
{
  global.document = global.document || {};
  eval(slice('function _rpfFitFlags(', 'function _rpFoldFitSum(') + ';globalThis._rpfFitFlags=_rpfFitFlags;');
  const rows = [0, 1, 2, 3].map(() => { const m = { textContent: '' }; return { hidden: false, querySelector: () => m, m }; });
  const list = { dataset: { n: '6' }, querySelectorAll: () => rows, querySelector: () => null };
  _rpfFitFlags(list, 2);
  sc.eq('앞 둘만 보이고 둘째 끝에 +4', [rows.map(r => r.hidden), rows[1].m.textContent, rows[0].m.textContent], [[false, false, true, true], '+4', '']);
  _rpfFitFlags(list, 4);
  sc.eq('넷 다 보이면(그려 둔 것 다) 남은 두 개만 +2', rows[3].m.textContent, '+2');
  sc.eq('칸 아래 ⚑ 는 처음 둘, 정한 높이면 늘린다', /flList\(2\)/.test(SRC) && /while\(k>1&&below\.getBoundingClientRect\(\)\.bottom>lim\)_rpfFitFlags\(fll,--k\);/.test(SRC), true);
  const ut = slice('function updateTotal(){', '\n}\n');
  sc.eq('달성 줄: 남은 중요 할일 ⚑숫자 · 다 끝내면 ⚑✓ · 없으면 안 보임', /fAll=all\.filter\(b=>b\.flag\),fLeft=fAll\.filter\(b=>!b\.done\)\.length/.test(ut) && /fLeft\|\|'✓'/.test(ut) && /fAll\.length\?/.test(ut), true);
  sc.eq('⚑ 는 n / m 과 띄어 둔다', /\.total-fl\{margin-left:9px;/.test(SRC), true);
}

console.log('\n시나리오 11 — ⚑ 할일 왼쪽 시간구간 색 세로줄 · "오늘 중요" (v. 26-1102-7)');
{
  const fd = slice('function _rpFoldData(', 'function _rpFoldDayLabel(');
  sc.eq('깃발마다 놓인 시간구간 색을 함께 돌려준다', /flagCols\.push\(sc\.color\|\|''\)/.test(fd) && /return\{days,flags,flagCols\}/.test(fd), true);
  SECS = [{ id: 'am', color: '#28d880' }, { id: 'pm', color: '#3eaaf8' }];
  EV = { [key(0)]: { pm: [{ text: '셀', time: '23:00' }] } };
  TK = [{ text: 'A', flag: true }, { text: 'B', flag: true }, { text: 'C', flag: true }, { text: 'D', flag: true }];
  const sum = _rpFoldSumHTML('weekly');
  sc.eq('오른쪽 ⚑ 칸: 글자는 "오늘 중요" · 할일마다 구간 색 세로줄', !/오늘 깃발/.test(sum) && (sum.match(/class="rpf-ell rpf-flt rpf-ci rpf-fbar" style="--fc:#[0-9a-fA-F]+"/g) || []).length === 4, true);
  sc.eq('아래 ⚑ 목록: "⚑ 오늘 중요" 머리글 하나 + 할일마다 색 세로줄 (앞 칸 52px 을 없애 여백을 줄임)', (sum.match(/class="rpf-flhd rpf-d rpf-fl"/g) || []).length === 2 && (sum.match(/rpf-fbi rpf-fbar" style="--fc:#/g) || []).length === 8 && !/rpf-d rpf-fl"><\/span><span class="rpf-evs">/.test(sum), true);
  sc.eq('세로줄 CSS: 구간 색(--fc) · 살짝 들임', /\.rpf-fbar\{border-left:2px solid var\(--fc,var\(--ac\)\);margin-left:2px;/.test(SRC), true);
  const rows = [0, 1].map(() => { const m = { textContent: '' }; return { hidden: false, querySelector: () => m, m }; });
  const hd = { hidden: false };
  const list = { dataset: { n: '2' }, querySelectorAll: () => rows, querySelector: q => q === '.rpf-flhd' ? hd : rows[0].m };
  _rpfFitFlags(list, 2);
  const open = hd.hidden;
  _rpfFitFlags(list, 0);
  sc.eq('보이는 깃발이 없으면 머리글도 접는다', [open, hd.hidden], [false, true]);
  // v. 26-1102-8 — 움직임 판(한 줄 ⇄ 요약): 세로줄은 글자 사본에 붙이지 않고 따로 그린다
  const ms = slice('function _rpMorphStart(', 'function rpFoldCycle(');
  sc.eq('움직임 판: 글자 사본에서 세로줄(rpf-fbar)을 떼고 줄은 따로(rpf-mbar) 그려 글자와 함께 움직인다', /src\.classList\.remove\('rpf-fbar'\)/.test(ms) && /className='rpf-mbar'/.test(ms) && /bd\.n\.style\.transform=`translate\(\$\{x-bd\.dx\}px,\$\{y-bd\.dy\}px\)`/.test(ms), true);
  sc.eq('움직임 판: 줄 크기는 접는 계산 전에 잰다 (뒤에 재면 숨겨진 줄이 높이 0)', /o\[k\]\.bar=\{dx:/.test(ms) || /\.bar=\{dx:o\[k\]\.x-br\.x/.test(ms), true);
  sc.eq('움직임 판 원점은 위젯 테두리 안쪽 — 테두리만큼 빼야 끝난 뒤 화면과 안 어긋난다', /x:r\.left-wr\.left-w\.clientLeft,y:r\.top-wr\.top-w\.clientTop/.test(ms), true);
  sc.eq('움직임 판 세로줄 CSS', /\.rpf-morph \.rpf-mbar\{position:absolute;/.test(SRC), true);
  // v. 26-1102-9 — 글자가 툭툭 켜지고 꺼지던 것 → 연속
  sc.eq('드러남은 보임/안 보임 둘이 아니라 0~1 연속(rv) — 들어가는 높이에서 온전해지고 그 앞 RW 동안 서서히', /rv\[k\]=cl\(\(lim-\(need\[k\]!=null\?need\[k\]:B\[k\]\.y\+B\[k\]\.h\)\)\/RW\+1,0,1\)/.test(ms) && !/const vis=\{\}/.test(ms), true);
  sc.eq('줄 아래 끝은 줄 상자 기준(세로줄 달린 ⚑ 줄 여백 포함) — 진짜 화면의 맞춤과 같게', /const botOf=k=>\{const r=B\[k\];return r\.bar\?r\.y-r\.bar\.dy\+r\.bar\.h:r\.y\+r\.h;\};/.test(ms), true);
  sc.eq('놓으면 글자 줄의 아래 끝(stops)에 멈춘다 — 20px 반올림 아님', /springTo\(snapH\(h\),'sum'\)/.test(ms) && !/Math\.round\(\(h-minH\)\/_RPM_SNAP\)/.test(ms), true);
  // v. 26-1102-10 — 가로폭이 바뀔 때도 같은 결
  const fo = slice('const _RPF_UNITS=', 'function _rpFoldFitAll(');
  sc.eq('가로폭: 맞춘 직후 새로 보이는 조각은 제자리에서 나타나고 사라진 조각은 복제본이 옅어진다', /kind:'in'/.test(fo) && /kind:'out'/.test(fo) && /\{opacity:0\},\{opacity:1\}\],\{duration:200/.test(fo) && /\{opacity:1\},\{opacity:0\}\],\{duration:140/.test(fo), true);
  sc.eq('가로폭: 모양이 갈려 크게(40px↑) 옮겨진 조각은 옛 자리에서 옅어지며 새 자리에서 나타난다 — 조금씩 이어 바뀌는 것은 안 건드림', /Math\.abs\(o\.x-b\.x\)>40\|\|Math\.abs\(o\.y-b\.y\)>40/.test(fo) && /kind:'jump'/.test(fo), true);
  sc.eq('가로폭: 조각은 DOM 노드 자체가 열쇠(모양이 갈리면 노드가 달라 저절로 맞바뀜) · 묶음 안 조각은 따로 안 함', /old\.m\.get\(n\)/.test(fo) && /nested=true/.test(fo), true);
  sc.eq('가로폭: 높이가 6px 넘게 달라지면 위젯 상자를 스르륵(.24s)', /Math\.abs\(nh-old\.h\)>=6/.test(fo) && /\{duration:240,easing:'cubic-bezier\(\.22,\.8,\.24,1\)'\}/.test(fo), true);
  sc.eq('가로폭: 처음 그릴 때 · 움직임 판 · 측정 사본 · 모션 줄이기에서는 효과를 건너뛴다', /!old\|\|!w\|\|!el\.animate\|\|_rpMorphNow\|\|w\.classList\.contains\('rpf-morphing'\)\|\|w\.classList\.contains\('rpf-meas'\)\|\|_tfQuiet\(\)/.test(fo), true);
  sc.eq('복제본(.rpf-ghost)은 조각으로 다시 세지 않는다 — 세면 복제본이 사라질 때 또 복제본이 생기는 연쇄로 끄는 내내 번쩍인다', /n\.closest\('\[hidden\],\.rpf-ghost'\)/.test(fo), true);
  sc.eq('복제본은 한 줄 안에서 줄바꿈 금지', /white-space:nowrap;/.test(fo), true);
  sc.eq('불투명도만 뭉근하게(.14s) · 끝낼 땐 전환이 끝난 뒤 갈아끼움(170ms)', /\.rpf-morph \.rpf-m,\.rpf-morph \.rpf-mbar\{transition:opacity \.14s linear;\}/.test(SRC) && /setTimeout\(\(\)=>finish\(state,target\),170\)/.test(ms) && /if\(fin\)return;fin=true;/.test(ms), true);
}

console.log('시나리오 — 특별일정(종일) 맨 위 · 제목 앞 시각 읽기 · 소속 캘린더 색 바탕 (v. 26-1104-1, HB)');
{
  sc.eq('9.3 → 9시 30분', _evLeadMin('9.3 치과'), 570);
  sc.eq('19.45 → 19:45', _evLeadMin('19.45 청년부'), 1185);
  sc.eq('7.15 → 7:15', _evLeadMin('7.15 새벽기도'), 435);
  sc.eq('시각이 없으면 null', _evLeadMin('가족 여행'), null);
  sc.eq('25.1 · 9.75 는 시각이 아니다', [_evLeadMin('25.1 가'), _evLeadMin('9.75 가')], [null, null]);
  sc.eq('1.2.3 같은 번호는 시각이 아니다', _evLeadMin('1.2.3 버전'), null);
  const mk = (text, time, col) => ({ text, time, col });
  const day = [mk('팀 미팅', '10:00'), mk('19.45 청년부'), mk('가족 여행'), mk('14:00 말고', '09:00'), mk('7.15 새벽기도'), mk('9.3 치과'), mk('교회 수련회')];
  const out = day.slice().sort(_rpFoldEvCmp).map(e => e.text);
  sc.eq('순서: 시각 없는 특별 → 시각 적힌 특별(시각순) → 일반 시간일정(시각순)',
    out, ['가족 여행', '교회 수련회', '7.15 새벽기도', '9.3 치과', '19.45 청년부', '14:00 말고', '팀 미팅']);
  sc.eq('시각 없는 특별일정끼리는 들어온 순서 그대로', ['가족 여행', '교회 수련회'], out.slice(0, 2));
  const h1 = _rpFoldEvHTML(mk('가족 여행', '', '#3b6fd4'), '', true);
  sc.eq('특별일정 행에는 캘린더 색 24% 바탕', /rpf-allday/.test(h1) && /#3b6fd4 24%/.test(h1), true);
  const h2 = _rpFoldEvHTML(mk('치과', '10:00', '#3b6fd4'), '', true);
  sc.eq('시간일정에는 바탕을 깔지 않는다', /rpf-allday/.test(h2), false);
  const h3 = _rpFoldEvHTML(mk('가족 여행', '', '#3b6fd4'));
  sc.eq('한 줄 모양(tint 없음)에는 바탕이 없다', /rpf-allday/.test(h3), false);
  const h4 = _rpFoldEvHTML(mk('가족 여행', ''), '', true);
  sc.eq('캘린더 색이 없으면 앱 강조색 바탕', /var\(--ac\) 20%/.test(h4), true);
}

sc.done();
