// 명제 전체화면 (v26-0831-3)
//
// 명제집은 암송 말씀과 **같은 화면**을 쓰되 세 가지가 다르다:
//   ① 대표 문구가 화면 위쪽 **타이틀**로 선다 (자리는 좌·중앙·우 무작위)
//   ② 명제 본문은 산문이라 **좌정렬 + 자연스러운 줄바꿈**이다
//   ③ 강조 칠하기를 **끈다** — 대표 문구는 본문 안의 구절이 아니라 제목이라
//      본문에서 찾을 것이 없다 (우연히 걸리면 엉뚱한 자리가 칠해진다)
//
// ⚠️ 여기서 지키려는 것은 "명제가 달라진다"가 아니라 **"말씀은 안 달라진다"**
//    이기도 하다. 갈림길이 하나라도 새면 암송 말씀 화면이 함께 바뀐다.
const { SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 명제인지 판정하는 곳은 한 곳뿐');
{
  // pid 가 명제의 신분증이다 (kind 는 pid 에서 파생된다 — test_share_prop 참고).
  sc.eq('판정 함수가 있다',
        SRC_DEV.includes("function _vfIsProp(v){return !!(v&&(v.pid||v.kind==='prop'));}"), true);
  // 화면 곳곳이 각자 판정하면 한쪽만 고쳐져 어긋난다 → 전부 이 함수를 지난다
  const uses = (SRC_DEV.match(/_vfIsProp\(/g) || []).length;
  sc.eq('여러 곳이 그 함수를 쓴다', uses >= 4, true);
  sc.eq('kind 를 직접 비교하는 갈림길은 없다',
        /\bv\.kind==='prop'\s*\?/.test(SRC_DEV), false);
}

console.log('\n시나리오 2 — 타이틀 자리·기울기는 넘길 때 한 번만 뽑는다');
{
  // ⚠️ 그리는 쪽에서 뽑으면 다시 그릴 때(글자 크기 변경·회전·화면 회전)마다
  //    자리가 튀어 어지럽다. 뽑는 곳은 _vfRollProp() 하나뿐이어야 한다.
  sc.eq('뽑는 함수가 있다', SRC_DEV.includes('function _vfRollProp(){'), true);
  sc.eq('넘길 때마다 부른다',
        /function _vfRollVariant\(\)\{[\s\S]{0,400}_vfRollProp\(\);/.test(SRC_DEV), true);
  sc.eq('세 자리 중에서 고른다',
        SRC_DEV.includes("const _VF_PT_ALIGN=['al-l','al-c','al-r'];"), true);
  // 그리는 함수 안에서 다시 뽑지 않는다
  const draw = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle('),
                             SRC_DEV.indexOf('function _vfPropInk('));
  sc.eq('그릴 때는 다시 안 뽑는다', draw.includes('_vfRollProp('), false);
  sc.eq('뽑아 둔 자리를 쓴다', draw.includes('_vfPropAlign'), true);
  // 세 자리 CSS 가 다 있다
  ['al-l','al-c','al-r'].forEach(k=>{
    sc.eq(k+' 자리 CSS', SRC_DEV.includes('.vf-ptitle.'+k+'{'), true);
  });
}

console.log('\n시나리오 3 — 명제 본문은 좌정렬 · 자연스러운 줄바꿈');
{
  sc.eq('명제일 때만 prop 클래스',
        SRC_DEV.includes("text.classList.toggle('prop',_vfIsProp(v));"), true);
  sc.eq('좌정렬 CSS', SRC_DEV.includes('#vfText.prop{text-align:left;}'), true);
  // ⚠️ 말씀의 줄바꿈(_vfWrapFit)은 짧은 구절을 의미 단위로 끊기 위한 것이다.
  //    산문에 씌우면 낱말 하나가 혼자 한 줄에 남는다 → 명제는 그 앞에서 갈린다.
  sc.eq('명제는 말씀 줄바꿈을 안 쓴다',
        /if\(el\.classList\.contains\('prop'\)\)\{[\s\S]{0,200}_vfLayoutPropText\(/.test(SRC_DEV), true);
  const idxBranch = SRC_DEV.indexOf("if(el.classList.contains('prop')){");
  const idxWrap = SRC_DEV.indexOf('_vfWrapFit(words,ctx,availW)');
  sc.eq('갈림길이 줄바꿈보다 앞에 있다', idxBranch > 0 && idxBranch < idxWrap, true);
  sc.eq('산문 줄간격을 따로 둔다', SRC_DEV.includes('const _VF_PROP_LH=1.62;'), true);
}

console.log('\n시나리오 4 — 강조는 명제에서 끈다 (말씀은 그대로)');
{
  sc.eq('명제면 빈 값을 싣는다',
        SRC_DEV.includes("text.setAttribute('data-hi',_vfIsProp(v)?'':(v.hi||''));"), true);
  // 말씀 쪽 길이 살아 있는지 — 이게 깨지면 암송 말씀의 강조가 통째로 사라진다
  sc.eq('말씀은 예전처럼 hi 를 싣는다',
        SRC_DEV.includes("_vfIsProp(v)?'':(v.hi||'')"), true);
  sc.eq('본문 그리는 입구는 그대로',
        SRC_DEV.includes('el.innerHTML=_hiHTML(el,pick.lines);'), true);
}

console.log('\n시나리오 5 — 타이틀이 본문보다 작아지지 않는다');
{
  // ⚠️ 처음엔 글자 수만 보고 크기를 정했더니 대표 문구가 길 때 본문보다
  //    작아져 위계가 뒤집혔다 (실측: 타이틀 17px, 본문 19px).
  //    이제 **본문이 쓸 수 있는 가장 큰 크기**에 배수를 곱한다.
  const draw = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle('),
                             SRC_DEV.indexOf('function _vfPropInk('));
  sc.eq('본문 최대 크기를 기준으로 잡는다', draw.includes('bodyMax'), true);
  // 배수는 전부 1 이상이어야 한다 (하나라도 1 미만이면 뒤집힐 수 있다)
  const m = draw.match(/const k=([^;]+);/);
  sc.eq('배수 식을 찾았다', !!m, true);
  if (m) {
    const ks = (m[1].match(/\d+\.\d+/g) || []).map(Number);
    sc.eq('배수가 다섯 단계', ks.length, 5);
    sc.eq('전부 1 이상', ks.every(k => k >= 1), true);
    sc.eq('짧을수록 크다', ks.join(',') === [...ks].sort((a,b)=>b-a).join(','), true);
  }
}

console.log('\n시나리오 6 — 타이틀이 차지하는 자리를 본문 계산이 안다');
{
  // ⚠️ 빼지 않으면 긴 명제가 화면 밖으로 밀린다
  sc.eq('타이틀 높이를 잰다',
        SRC_DEV.includes("const ptEl=document.getElementById('vfPTitle');"), true);
  sc.eq('여백까지 함께 센다',
        SRC_DEV.includes("ptH=ptEl.offsetHeight+(parseFloat(pcs.marginBottom)||0);"), true);
  sc.eq('쓸 수 있는 높이에서 뺀다',
        SRC_DEV.includes('const availH=Math.max(60,inner.clientHeight-padV-refH-ptH-6);'), true);
  // 태그 그림도 타이틀을 피해야 한다 (본문 기준으로 잡으면 타이틀 위에 겹친다)
  sc.eq('태그 그림이 타이틀을 기준으로 잡는다',
        SRC_DEV.includes("const anchor=(pt&&pt.classList.contains('on')&&pt.offsetHeight)?pt:tx;"), true);
}

console.log('\n시나리오 7 — 손으로 그은 획은 앱의 붓을 그대로 쓴다');
{
  // ⚠️ _hiWavePoly 는 **점 배열**을 준다 (path 문자열이 아니다). 앱의 물결
  //    덮개(_hiOverlay 의 put)와 같은 방식으로 이어야 같은 그림이 된다.
  //    한때 반환값을 그대로 d 속성에 넣어 **아무것도 안 그려졌다.**
  sc.eq('앱의 붓을 쓴다', SRC_DEV.includes('_hiWavePoly(lw,fs*0.92,_vfPropSeed)'), true);
  sc.eq('점 배열을 path 로 잇는다',
        SRC_DEV.includes("'M'+pts.map(q=>(q.x+x).toFixed(2)+' '+(q.y+y).toFixed(2)).join('L')+'Z'"), true);
  sc.eq('빈 배열이면 조용히 나간다', SRC_DEV.includes('if(!pts||!pts.length)return;'), true);
  // 세로 자리도 앱이 이미 정해 둔 값을 쓴다 (제 값을 지어내지 않는다)
  sc.eq('앱의 물결 위치를 쓴다',
        SRC_DEV.includes('last.height*HI_POS.wave'), true);
  // ⚠️ 획은 자리를 차지하면 안 된다 — 차지하면 문구가 밀려난다
  sc.eq('획은 자리를 차지하지 않는다',
        /\.vf-ptitle \.pt-ink\{position:absolute;/.test(SRC_DEV), true);
  sc.eq('마지막 줄에만 긋는다', SRC_DEV.includes('const last=rects[rects.length-1];'), true);
}

sc.done();
