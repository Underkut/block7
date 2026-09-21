// Sweeter 설정창 병합 — 뷰 탭(4-4) · 계정 탭(4-5)  v26-0921-8
//
// ⚠️ 두 제품이 **같은 설정창 HTML** 을 쓴다. Sweeter 는 필요한 칸을 복제하지 않고
//    **옮긴다** — 복제하면 id 가 두 벌이 되어, 값을 채우는 기존 배선
//    (renderSettingsPanel 등)이 어느 쪽을 잡는지 알 수 없어진다.
// ⭐ 그러니 BLOCK7 에서는 한 칸도 움직이면 안 된다. 그걸 못 박는 시험이다.
const { SRC, sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 아주 작은 가짜 DOM ────────────────────────────────────────────
class El {
  constructor(id, attrs){ this.id=id; this.children=[]; this.parent=null;
    this.dataset={}; this.attrs=attrs||{}; this.textContent=''; this._cls=new Set(); }
  get firstElementChild(){ return this.children[0]||null; }
  _detach(n){ if(n.parent){ const i=n.parent.children.indexOf(n); if(i>=0)n.parent.children.splice(i,1); } }
  appendChild(n){ this._detach(n); n.parent=this; this.children.push(n); return n; }
  insertBefore(n,ref){ this._detach(n);
    const i=ref?this.children.indexOf(ref):-1;
    n.parent=this;
    if(i<0)this.children.push(n); else this.children.splice(i,0,n);
    return n; }
  getAttribute(k){ return this.attrs[k]!==undefined?this.attrs[k]:null; }
  querySelectorAll(q){ const out=[];
    const walk=n=>n.children.forEach(c=>{ if(q==='[data-lv]'&&c.attrs['data-lv']!==undefined)out.push(c); walk(c); });
    walk(this); return out; }
  querySelector(){ return null; }
  get classList(){ const s=this._cls; return { toggle:(c,on)=>{on?s.add(c):s.delete(c);}, contains:c=>s.has(c) }; }
}
const REG={};
function mk(id,attrs){ return REG[id]=new El(id,attrs); }
global.document={ getElementById:id=>REG[id]||null, querySelector:()=>null };

let APP_PRODUCT='sweeter';
function _swOn(){ return APP_PRODUCT==='sweeter'; }
function verseUiLevel(){ return 'power'; }
const _UILV_KEY={easy:'e',mid:'m',power:'p'};
function _lvApplyIn(root,level){
  const key=_UILV_KEY[level||'power'];
  (root||document).querySelectorAll('[data-lv]')
    .forEach(el=>el.classList.toggle('lv-hide',!el.getAttribute('data-lv').includes(key)));
}
function _cfSyncVisibility(){}

// BLOCK7 일반설정창 '뷰' 탭에 실제로 있는 칸들 (docs/MAP.md 순서대로)
const VIEW_SECTIONS=[
  ['secUiLevelSet',{'data-lv':'p'}], ['secUiScale',{}], ['secBrightness',{}],
  ['secColorTheme',{}], ['secDow',{'data-lv':'mp'}], ['secMonthTitle',{'data-lv':'p'}],
  ['secCarryBadge',{'data-lv':'p'}], ['secMoveSec',{'data-lv':'p'}],
  ['secDoneFx',{'data-lv':'p'}], ['secBlock',{}], ['secViewSwitch',{'data-lv':'p'}],
  ['secLayoutSplit',{'data-lv':'p'}]
];
function build(){
  Object.keys(REG).forEach(k=>delete REG[k]);
  const sv=mk('stab-view'), vv=mk('vstab-view');
  VIEW_SECTIONS.forEach(([id,a])=>sv.appendChild(mk(id,a)));
  vv.appendChild(mk('vsecDviewMark',{})); vv.appendChild(mk('vsecTagTile',{}));
  const sa=mk('stab-account'), va=mk('vstab-account');
  ['secBackup','syncConflictSection','dataRecoverySection','secAccount','devInboxSection','secDevNote']
    .forEach(id=>sa.appendChild(mk(id,{})));
  mk('backupScopeDesc');
  return {sv,vv,sa,va};
}
const ids=n=>n.children.map(c=>c.id);

eval(sliceDev("// ── Sweeter 설정창 '계정' 탭", '\nfunction _swMount(){')
       .replace(/^const /gm,'var '));

// ═══ 1. Sweeter — 뷰 탭으로 옮겨 온다 ═══
console.log('시나리오 1 — Sweeter 뷰 탭 병합');
{
  APP_PRODUCT='sweeter';
  const {sv,vv}=build();
  _swMergeViewTab();
  sc.eq('가져온 넷이 맨 위에', ids(vv).slice(0,4),
        ['secUiLevelSet','secUiScale','secBrightness','secColorTheme']);
  sc.eq('원래 있던 것은 그 뒤에', ids(vv).slice(4), ['vsecDviewMark','vsecTagTile']);
  // ⚠️ 제외 항목 — 달력·할일 전용이라 넘어오면 안 된다
  ['secDow','secMonthTitle','secCarryBadge','secMoveSec','secDoneFx',
   'secBlock','secViewSwitch','secLayoutSplit'].forEach(id=>
    sc.eq('안 넘어온다: '+id, ids(vv).includes(id), false));
  sc.eq('제외 항목은 제자리에', ids(sv),
        ['secDow','secMonthTitle','secCarryBadge','secMoveSec','secDoneFx',
         'secBlock','secViewSwitch','secLayoutSplit']);
  sc.eq('등급을 다시 맞춘다(파워라 다 보인다)',
        REG.secUiLevelSet.classList.contains('lv-hide'), false);
}

// ═══ 2. ⭐ BLOCK7 은 한 칸도 안 움직인다 ═══
console.log('\n시나리오 2 — ⭐ BLOCK7 은 그대로');
{
  APP_PRODUCT='block7';
  const {sv,vv}=build();
  _swMergeViewTab();
  sc.eq('⭐ 뷰 탭 그대로', ids(sv), VIEW_SECTIONS.map(v=>v[0]));
  sc.eq('⭐ 말씀설정 뷰 탭도 그대로', ids(vv), ['vsecDviewMark','vsecTagTile']);
  sc.eq('표시를 남기지 않는다', vv.dataset.swMerged, undefined);
}

// ═══ 3. 두 번 불러도 안전 ═══
console.log('\n시나리오 3 — 두 번 불러도 같다');
{
  APP_PRODUCT='sweeter';
  const {vv}=build();
  _swMergeViewTab();
  const first=ids(vv).join(',');
  _swMergeViewTab(); _swMergeViewTab();
  sc.eq('그대로', ids(vv).join(','), first);
}

// ═══ 4. 계정 탭 ═══
console.log('\n시나리오 4 — 계정 탭');
{
  APP_PRODUCT='sweeter';
  const {sa,va}=build();
  _swMergeAccountTab();
  sc.eq('통째로 옮겨 온다', ids(va),
        ['secBackup','syncConflictSection','dataRecoverySection','secAccount','devInboxSection','secDevNote']);
  sc.eq('원래 자리는 빈다', ids(sa), []);
  sc.eq('백업 설명이 말씀 쪽으로 바뀐다',
        /할일은 담기지 않아요/.test(REG.backupScopeDesc.textContent), true);

  APP_PRODUCT='block7';
  const b=build();
  _swMergeAccountTab();
  sc.eq('⭐ BLOCK7 은 그대로', ids(b.sa).length, 6);
  sc.eq('⭐ 말씀설정 계정 탭은 빈 채로', ids(b.va), []);
}

// ═══ 5. 충돌 목록 — Sweeter 는 말씀 쪽만 ═══
console.log('\n시나리오 5 — 충돌 목록 거르기');
{
  var _cfList=[];
  eval(sliceDev("// ── Sweeter 에서는 '말씀 쪽' 충돌만", '\n// 같은 자리의 충돌은')
         .replace(/^const /gm,'var '));
  _cfList=[
    {conflictId:'1',kind:'todo',entityId:'days/2026-09-20/todo/am/t1'},
    {conflictId:'2',kind:'setting',entityId:'settings/bigLimit'},
    {conflictId:'3',kind:'collection',entityId:'verseCollections/c1'},
    {conflictId:'4',kind:'contact',entityId:'contacts/p1'},
    {conflictId:'5',kind:'bulk',entityId:'bulk/days'},
    {conflictId:'6',kind:'bulk',entityId:'bulk/verseCollections'},
    {conflictId:'7',kind:'shrink',entityId:'shrink/memorizationLog'},
    {conflictId:'8',kind:'collection',entityId:'verseCollections/c2',resolvedAt:1}
  ];
  APP_PRODUCT='block7';
  sc.eq('⭐ BLOCK7 은 전부 본다', _cfOpen().map(r=>r.conflictId), ['1','2','3','4','5','6','7']);
  APP_PRODUCT='sweeter';
  sc.eq('Sweeter 는 말씀 쪽만', _cfOpen().map(r=>r.conflictId), ['3','6','7']);
  sc.eq('개수도 따라간다', _cfOpenCount(), 3);
  sc.eq('정해 둔 것은 양쪽 다 안 나온다', _cfOpen().some(r=>r.conflictId==='8'), false);
}

// ═══ 5-2. 일반설정창의 '계정' 탭은 Sweeter 에서 빈 채로 남지 않는다 ═══
console.log('\n시나리오 5-2 — 빈 탭이 남지 않는다');
{
  var SETTINGS_TABS=['general','notify','view','buttons','sections','account'];
  var _UILV='power';
  function uiLevel(){ return _UILV; }
  eval(sliceDev('function _stabList(){', '\n// 어떤 상자 안의 data-lv')
         .replace(/^const /gm,'var '));
  APP_PRODUCT='block7';
  sc.eq('⭐ BLOCK7 은 여섯 탭 그대로', _stabList(), SETTINGS_TABS);
  APP_PRODUCT='sweeter';
  sc.eq('Sweeter 는 계정 탭이 빠진다', _stabList(),
        ['general','notify','view','buttons','sections']);
  _UILV='easy';
  sc.eq('이지 규칙도 그대로 걸린다', _stabList(), ['general','notify','view','sections']);
  _UILV='power';
}

// ═══ 6. 붙박이 — 코드가 이 약속을 지키고 있나 ═══
console.log('\n시나리오 6 — 붙박이');
{
  sc.eq('옮길 칸 목록은 한 곳에',
        SRC.includes("const _SW_VIEWTAB_MOVE=['secUiLevelSet','secUiScale','secBrightness','secColorTheme'];"), true);
  ['secUiLevelSet','secUiScale','secBrightness','secColorTheme'].forEach(id=>
    sc.eq('HTML 에 손잡이가 있다: '+id, SRC.includes(`class="settings-section" id="${id}"`)
      || SRC.includes(`class="settings-section" id="${id}" data-lv`), true));
  sc.eq('보이는 첫 탭은 Sweeter 도 뷰', SRC.includes("switchVerseSettingsTab(_vstabList()[0]||'view',null,'direct')"), true);
  sc.eq('설정창을 열 때도 병합한다', /openVerseSettingsModal\(\)\{\s*\n\s*_swMergeViewTab\(\);[\s\S]{0,120}_swMergeAccountTab\(\);/.test(SRC), true);
  // ⚠️ 여는 함수 안에 중괄호를 들이지 않는다 — 여러 테스트가 slice(…, '}') 로
  //    이 함수를 떠 가서, 중괄호가 하나 생기면 거기서 잘려 엉뚱하게 실패한다.
  sc.eq('여는 함수는 한 줄짜리 호출만', /function openVerseSettingsModal\(\)\{([^{}]*)\}/.test(SRC), true);
  sc.eq('값 채우기는 따로 뺐다', SRC.includes('function _swFillMovedRows(){'), true);
  sc.eq('열 때 값도 채운다', /openVerseSettingsModal\(\)\{[\s\S]{0,200}_swFillMovedRows\(\);/.test(SRC), true);
  sc.eq('첫 그림에서도 병합한다', /_swBoot\(\)\{[\s\S]{0,300}_swMergeViewTab\(\);\s*\n\s*_swMergeAccountTab\(\);/.test(SRC), true);
}

sc.done();
