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
  const titles = [...SRC.matchAll(/<div class="sg-h">([^<]+)/g)].map(m => m[1].trim());
  const missing = Object.keys(_SG_FOLD).filter(k => titles.filter(t => t === k).length !== 1);
  sc.eq('표의 제목마다 묶음이 꼭 하나', missing, []);
  sc.eq('값은 phone · tablet 뿐', Object.values(_SG_FOLD).every(v => v === 'phone' || v === 'tablet'), true);
  const core = ['시간 구간', '말씀 알림', '지금 쓰는 모음', '모양', '다음 구절로'];
  sc.eq('탭의 본론은 접지 않는다', core.filter(k => k in _SG_FOLD), []);
}

console.log('\n시나리오 2 — 기기 폭에 따라 처음 모양');
{
  const f = new Function(slice('function _sgFoldDefaultOpen(rule,dev){', '// 설정창을 열 때마다 부른다') + 'return _sgFoldDefaultOpen;')();
  sc.eq('폰: phone 묶음 접힘', f('phone', 'phone'), false);
  sc.eq('폰: tablet 묶음 접힘', f('tablet', 'phone'), false);
  sc.eq('태블릿: phone 묶음 펴짐', f('phone', 'tablet'), true);
  sc.eq('태블릿: tablet 묶음 접힘', f('tablet', 'tablet'), false);
  sc.eq('PC: 다 펴짐', [f('phone', 'pc'), f('tablet', 'pc')], [true, true]);
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

sc.done();
