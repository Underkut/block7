// v26-1024-20 — 설정창 묶음 접기, 기기 폭에 따라 (HB 2026-10-24, ROADMAP S-5)
// HB: "어떤 박스는 접어 두는 게 낫고, 어떤 건 안 접어도 되는데 기기마다 달라 보인다 —
//      폰은 접으면 좋겠는 게 많고, 태블릿은 좀 괜찮고, PC 는 다 괜찮다."
// 지키는 것:
//  ① 접을 묶음은 표(_SG_FOLD) 한 곳 — 표의 제목은 실제 묶음 제목과 한 글자도 다르지 않다
//  ② 폰 = 표의 묶음 다 접힘 · 태블릿 = 'tablet' 만 접힘 · PC = 다 펴짐
//  ③ 사람이 접고 편 것은 이 기기 전용 이름(_lsk('sgFold'))에 남아 기기 폭 기본값보다 먼저
//  ④ 탭의 본론은 접지 않는다
//  ⑤ 높이가 스르륵 · 움직임 줄이기 설정이면 끈다
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

const tableSrc = slice('const _SG_FOLD={', '};') + '};';
const _SG_FOLD = new Function(tableSrc.replace('const _SG_FOLD=', 'return ').replace(/;\s*$/, ''))();

console.log('시나리오 1 — 표의 제목은 실제 묶음 제목');
{
  const dupKeys = [...SRC.matchAll(/<div class="sg"[^>]*data-fold-key="([^"]+)"/g)].map(m => m[1]);
  const titles = [...SRC.matchAll(/<div class="sg-h">([^<]+)/g)].map(m => m[1].trim())
    .concat([...SRC.matchAll(/<div class="sg-h">\s*<span[^>]*>([^<]+)<\/span>/g)].map(m => m[1].trim()))   // 제목이 span 안에 (지금 쓰는 모음)
    .concat(dupKeys);
  const missing = Object.keys(_SG_FOLD).filter(k => titles.filter(t => t === k).length !== 1);
  sc.eq('표의 제목마다 묶음이 꼭 하나', missing, []);
  sc.eq('값은 phone · tablet · all · open 뿐 (all = 어느 기기든 처음엔 접힘, open = 처음엔 펴짐)', Object.values(_SG_FOLD).every(v => ['phone', 'tablet', 'all', 'open'].includes(v)), true);
  sc.eq('구글 캘린더 · 데이터 복구 · 시리로 할일 넣기는 처음엔 접힘', [_SG_FOLD['구글 캘린더'], _SG_FOLD['데이터 복구'], _SG_FOLD['시리로 할일 넣기']], ['all', 'all', 'all']);
  const core = ['시간 구간', '말씀 알림', '지금 쓰는 모음', '모양', '다음 구절로'];
  sc.eq('탭의 본론은 접을 수 있되 처음엔 펴짐 (v26-1025-15, HB "최대한 다 접게")', core.map(k => _SG_FOLD[k]), core.map(() => 'open'));
  sc.eq('같은 제목(글자 크기) 둘은 열쇠를 따로', dupKeys.sort(), ['위젯 글자 크기', '전체화면 글자 크기']);
  sc.eq('제목 읽기는 따로 둔 열쇠 먼저', slice('function _sgTitle(g){', 'function _sgFoldMem').includes('if(g.dataset.foldKey)return g.dataset.foldKey;'), true);
}

console.log('\n시나리오 2 — 기기 폭에 따라 처음 모양');
{
  const f = new Function(slice('function _sgFoldDefaultOpen(rule,dev){', '// 설정창을 열 때마다 부른다') + 'return _sgFoldDefaultOpen;')();
  sc.eq('폰: phone 묶음 접힘', f('phone', 'phone'), false);
  sc.eq('폰: tablet 묶음 접힘', f('tablet', 'phone'), false);
  sc.eq('태블릿: phone 묶음 펴짐', f('phone', 'tablet'), true);
  sc.eq('태블릿: tablet 묶음 접힘', f('tablet', 'tablet'), false);
  sc.eq('PC: 다 펴짐', [f('phone', 'pc'), f('tablet', 'pc')], [true, true]);
  sc.eq('open: 어느 기기든 펴짐', [f('open', 'phone'), f('open', 'tablet'), f('open', 'pc')], [true, true, true]);
  const dc = slice('function _sgDevClass(){', 'function _sgTitle');
  sc.eq('폭은 clientWidth (안드로이드)', dc.includes('document.documentElement.clientWidth'), true);
  sc.eq('폰 600 미만 · 태블릿 1024 미만', dc.includes("w<600?'phone':w<1024?'tablet':'pc'"), true);
}

console.log('\n시나리오 3 — 사람이 고른 것을 기억한다 (이 기기)');
{
  const store = {};
  const api = new Function('store', `
    const LS_KEY='b7v1';function _lsk(n){return LS_KEY+'_'+n;}
    const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}};
    ${slice('function _sgFoldMem(){', '// 접기 기본값')}
    return {get:_sgFoldMem,put:_sgFoldMemPut};`)(store);
  sc.eq('처음엔 비어 있다', api.get(), {});
  api.put('이미지 크기', true); api.put('테마', false);
  sc.eq('묶음마다 열림 1 · 닫힘 0', api.get(), { '이미지 크기': 1, '테마': 0 });
  sc.eq('이 기기 전용 이름(_lsk)', Object.keys(store), ['b7v1_sgFold']);
  const init = slice('function _sgFoldInit(){', 'function sgGroupToggle');
  sc.eq('기억이 있으면 그것, 없으면 기기 폭', init.includes('const open=(k in mem)?!!mem[k]:_sgFoldDefaultOpen(rule,dev);'), true);
  sc.eq('사람이 누르면 적는다', slice('function sgGroupToggle(g){', '// 접힌 묶음의 지금 값').includes('_sgFoldMemPut(_sgTitle(g),open);'), true);
}

console.log('\n시나리오 4 — 배선 · 움직임');
{
  sc.eq('일반 설정을 열 때', /function openSettings\(tabId,flashTabId\)\{[\s\S]{0,200}_sgFoldInit\(\);/.test(SRC), true);
  sc.eq('말씀 설정을 열 때 (중괄호 없이)', /function openVerseSettingsModal\(\)\{[^{}]*_sgFoldInit\(\);[^{}]*\}/.test(SRC), true);
  sc.eq('높이가 스르륵 (grid 0fr → 1fr)', /\.sg-fbody\{display:grid;grid-template-rows:0fr;transition:grid-template-rows/.test(SRC)
        && SRC.includes('.sg-foldable.open>.sg-fbody{grid-template-rows:1fr;}'), true);
  sc.eq('열 때 맞추는 것은 전환 없이', SRC.includes("g.classList.add('sg-noanim');"), true);
  sc.eq('움직임 줄이기면 끈다', /@media \(prefers-reduced-motion:reduce\)\{\.sg-fbody,\.sg-fin/.test(SRC), true);
  sc.eq('키보드로도 (Enter · 스페이스)', SRC.includes("if(e.key==='Enter'||e.key===' '){e.preventDefault();sgGroupToggle(g);}"), true);
  sc.eq('값이 바뀌면 요약도', SRC.includes("p.addEventListener('click',later);p.addEventListener('change',later);"), true);
}

console.log('\n시나리오 5 — 접힌 제목 왼쪽 끝 아이콘 (v26-1025-14)');
{
  const icSrc = slice('const _SG_FOLD_IC={', '};') + '};';
  const IC = new Function(icSrc.replace('const _SG_FOLD_IC=', 'return ').replace(/;\s*$/, ''))();
  sc.eq('접는 묶음마다 아이콘이 꼭 하나 (빠진 것 없음)', Object.keys(_SG_FOLD).filter(k => !IC[k]), []);
  sc.eq('표에 없는 제목의 아이콘은 없다', Object.keys(IC).filter(k => !(k in _SG_FOLD)), []);
  sc.eq('그림은 path · rect · circle 뿐 (따옴표 깨짐 없음)', Object.values(IC).every(v => /^(<(path|rect|circle)\b[^<>']*\/>)+$/.test(v)), true);
  const init = slice('function _sgFoldInit(){', 'function sgGroupToggle');
  sc.eq('제목 줄 맨 앞에 넣는다', init.includes("h.insertAdjacentHTML('afterbegin','<svg class=\"sg-fic\""), true);
  sc.eq('제목 읽기는 svg 를 건너뛴다 (기억 열쇠가 안 바뀐다)', slice('function _sgTitle(g){', 'function _sgFoldMem').includes('svg'), true);
  sc.eq('펴면 폭이 줄며 사라진다', SRC.includes('.sg-foldable.open>.sg-h .sg-fic{width:0;margin-right:-12px;opacity:0;}'), true);
  sc.eq('움직임 줄이기면 끈다', /prefers-reduced-motion:reduce\)\{[^}]*\.sg-foldable \.sg-fic\{transition:none;\}/.test(SRC), true);
}

console.log('\n시나리오 6 — 펼친 줄 아이콘 다시 그림 (v26-1027-1, HB 시안)');
{
  const rowIc = label => { const p = SRC.search(new RegExp('<div class="settings-row-label"[^>]*>' + label + '\\s*<'));
    const a = SRC.lastIndexOf('<svg class="sr-ic"', p); return SRC.slice(a, SRC.indexOf('</svg>', a)); };
  sc.eq('주일을 빨갛게: 점만 주일 빨강', rowIc('주일을 빨갛게').includes('fill="var(--sun-red)"'), true);
  sc.eq('연도도 보이기: M 대신 Y', rowIc('연도도 보이기').includes('M5 7l4 5 4-5M9 12v5'), true);
  sc.eq('같던 그림이 이제 서로 다르다 (스몰 블럭 쓰기 · 경고)', rowIc('스몰 블럭 쓰기') !== rowIc('스몰 블럭 경고'), true);
  sc.eq('제목 끝말 · 구간 알림 끝말은 같은 그림 (HB)', rowIc('제목 끝말').split('>').slice(1).join('>'), rowIc('구간 알림 끝말').split('>').slice(1).join('>'));
  sc.eq('줄 아이콘 수 38 (v. 26-1031-12 밀린 할일 기준 줄 포함, v. 26-1031-9 "검색에서 일정을 누르면" 한 줄 더)', (SRC.match(/<svg class="sr-ic"/g) || []).length, 38);
}

sc.done();
