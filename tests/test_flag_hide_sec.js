// 깃발만 보기 중에 구간을 숨기면 깃발 모드가 풀리던 것 (v. 26-1031-5, HB 1031-2)
//
// ST.preset 한 칸을 '구간 보기'(A · ★ · 할일 · 일정)와 '할일 거르기'(깃발 · 연락)가 같이 쓴다.
// 구간 머리 오른쪽 꺽쇠(▲)로 구간을 숨기면 ST.preset=null 로 비워서 깃발 거르기까지 꺼졌다.
// → 구간을 손으로 켜고 끄는 다섯 곳이 _presetVisTouched() 하나를 부른다.
const { makeScorer, SRC } = require('./_load');
const sc = makeScorer();
const a = SRC.indexOf('function _presetVisTouched(){');
const b = SRC.indexOf('function _secClosed(secId){', a);
const ST = {};
eval(SRC.slice(a, b));

console.log('시나리오 1 — 깃발 · 연락 거르기는 구간을 숨겨도 남는다');
for (const p of ['flagFilter', 'contactFilter']) {
  ST.preset = p; ST.prevVis = ['am'];
  _presetVisTouched();
  sc.eq(p + ' 그대로', ST.preset, p);
  sc.eq(p + ' · prevVis 는 비운다', ST.prevVis, null);
}

console.log('\n시나리오 2 — 구간 보기 단추는 예전처럼 풀린다');
for (const p of ['all', 'star', 'todoFilterFilled', 'eventFilterOn', null]) {
  ST.preset = p; ST.prevVis = ['am'];
  _presetVisTouched();
  sc.eq(String(p) + ' → null', ST.preset, null);
}

console.log('\n시나리오 3 — 구간을 손으로 켜고 끄는 자리는 모두 이 함수를 쓴다');
const hideBtn = SRC.slice(SRC.indexOf("rm.className='ts-hide-sec'"), SRC.indexOf("rm.className='ts-hide-sec'") + 900);
sc.eq('▲ 꺽쇠', hideBtn.includes('_presetVisTouched();') && !hideBtn.includes('ST.preset=null'), true);
const sw = SRC.slice(SRC.indexOf('const hideSection=()=>{'), SRC.indexOf('const hideSection=()=>{') + 200);
sc.eq('밀어서 숨기기', sw.includes('_presetVisTouched();'), true);
sc.eq('주간 이름 눌러 숨기기', /onclick="beforeSave\(\);_presetVisTouched\(\);ST\.vis=ST\.vis\.filter/.test(SRC), true);
// 남은 ST.preset=null 은 A · ★ 단추 자신이 '이전 보기로' 돌아갈 때뿐이다
sc.eq('그 밖의 ST.preset=null 은 A · ★ 두 곳뿐', (SRC.match(/ST\.preset=null;ST\.prevVis=null;/g) || []).length, 2);

// 검색에서 간 할일이 깃발 · 연락 거르기에 가려졌을 때만 푼다 (v. 26-1031-10) — 구간 보기 단추 상태는 안 건드린다
const uf = SRC.slice(SRC.indexOf('function _srchUnfilter(r){'), SRC.indexOf('function _srchUnfilter(r){') + 900);
sc.eq('검색 → 거르기 풀기는 fix.marker 일 때만', /if\(fix\.marker\)\{\s*ST\.preset=null;/.test(uf) && (uf.match(/ST\.preset=/g) || []).length === 1, true);

sc.done();
