// 전체화면 손질 네 가지 (v26-0904-4, HB)
//
//  1. 좌상단 저장 폴더 목록 — 반투명 + 블러로 뒤 글자가 어렴풋이 비친다
//  2. 위·아래 1/4 탭으로 넘기기는 **PC 에서만**. 폰에서는 아예 없다
//  3. 우하단 반응 단추가 잘 안 눌리던 것 (특히 저장)
//  4. Deeper 책 아이콘의 가운데 세로선이 두 겹이라 진했던 것
//
// 여기 있는 것은 전부 "화면에서 눈으로 보면 아는" 것들이지만, 한 번 고치면
// 다음 사람이 무심코 되돌리기 쉬운 자리들이다 (예전에 실제로 몇 번 그랬다).
// 그래서 **왜 그렇게 두었는지**를 검사로 남긴다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

// ═══ 1. 저장 폴더 목록 = 반투명 유리 ═══
console.log('시나리오 1 — 저장 폴더 목록이 반투명 + 블러다');
{
  // ⚠️ 배경 그림(--vf-bgimg 는 linear-gradient 일 수 있다)에는 투명도를 줄 수
  //    없다. 그래서 테마의 첫 색 한 가지(--vf-bg1)를 따로 흘려보내 그것에
  //    투명도를 준다. 이 변수가 없어지면 목록이 통째로 var(--bg) 로 떨어진다.
  sc.eq('테마가 --vf-bg1 을 함께 흘려보낸다', SRC.includes("'--vf-bg1':_vfBg1Css(t)"), true);
  sc.eq('말씀카드 미리보기에도 같이 간다', SRC.includes("'--vf-bg1':_vfBg1Css({bg:v.bg})"), true);
  sc.eq('_vfBg1Css 는 첫 색 하나를 준다 (그라디언트가 아니다)',
        /function _vfBg1Css\(t\)\{[\s\S]{0,160}?t\.bg\[0\]/.test(SRC), true);

  sc.eq('목록 배경이 반투명',
        /\.vf-keep-switch\{[\s\S]{0,700}background:color-mix\(in srgb,var\(--vf-bg1,var\(--bg\)\) 52%,transparent\)/.test(SRC), true);
  sc.eq('목록에 블러가 걸린다',
        /\.vf-keep-switch\{[\s\S]{0,800}backdrop-filter:blur\(18px\)/.test(SRC), true);
  // 사파리(아이폰)는 아직 -webkit- 접두사가 있어야 한다 — 빠지면 폰에서만 안 흐려진다
  sc.eq('아이폰용 접두사도 함께',
        /\.vf-keep-switch\{[\s\S]{0,800}-webkit-backdrop-filter:blur\(18px\)/.test(SRC), true);
  // 머리줄은 목록이 그 아래로 지나간다 — 더 진해야 글자가 겹쳐 읽힌다
  sc.eq('머리줄은 더 진하다',
        /\.vf-keep-head\{[\s\S]{0,320}var\(--vf-bg1,var\(--bg\)\) 78%/.test(SRC), true);
  sc.eq('머리줄에도 블러',
        /\.vf-keep-head\{[\s\S]{0,400}backdrop-filter:blur\(12px\)/.test(SRC), true);
  // 예전의 불투명 배경이 남아 있으면 안 된다
  sc.eq('불투명 배경은 안 남아 있다',
        /\.vf-keep-switch\{[\s\S]{0,700}background:var\(--vf-bgimg/.test(SRC), false);
}

// ═══ 2. 위·아래 1/4 탭 = PC 에서만 ═══
console.log('\n시나리오 2 — 탭으로 넘기기는 PC 에서만');
{
  // ⚠️ 손가락으로 밀어 넘기다 살짝 스친 것까지 탭으로 읽혀 말씀이 제멋대로
  //    넘어갔다. 터치 기기에서는 이 영역을 통과시킨다.
  sc.eq('터치 기기에서는 통과시킨다',
        /@media \(hover:none\) and \(pointer:coarse\)\{[\s\S]{0,120}\.vf-nav\{pointer-events:none;\}/.test(SRC), true);
  sc.eq('눌리지 않는 화살표는 감춘다',
        /@media \(hover:none\) and \(pointer:coarse\)\{[\s\S]{0,160}\.vf-nav i\{display:none;\}/.test(SRC), true);
  // PC 는 그대로다 — 영역도, 마우스를 올렸을 때 진해지는 화살표도
  sc.eq('PC 의 1/4 영역은 그대로', /\.vf-nav\{[\s\S]{0,120}height:25%;/.test(SRC), true);
  sc.eq('PC 의 화살표 반응도 그대로',
        SRC.includes('@media (hover:hover) and (pointer:fine){\n  .vf-nav:hover i{opacity:.8;}'), true);
  // 넘기는 길 자체(밀어 넘기기·더블탭 좋아요)는 #verseFull 이 직접 받으므로 살아 있다
  sc.eq('밀어 넘기기는 그대로 있다', SRC.includes('if(Math.abs(dy)>=COMMIT)_vfNavCommit(dy<0?1:-1);'), true);
}

// ═══ 3. 우하단 단추가 잘 안 눌리던 것 ═══
console.log('\n시나리오 3 — 반응 단추를 손끝만큼 넓혔다');
{
  // ⚠️ 단추에 padding 을 주면 안 된다. 공유 이미지가 이 단추들의 실제 상자를
  //    재서 BLOCK7 서명 자리를 잡기 때문에(_shotDraw), 상자가 커지면 이미지의
  //    서명이 밀린다. 자리를 안 차지하는 덧자리(::after)만 넓힌다.
  sc.eq('덧자리로 넓힌다',
        SRC.includes(".vf-act::after{content:'';position:absolute;left:-12px;right:-14px;top:-6px;bottom:-6px;}"), true);
  sc.eq('덧자리의 기준이 되게 position:relative', /\.vf-act\{[\s\S]{0,400}position:relative;/.test(SRC), true);
  sc.eq('단추 자체에는 여전히 padding 이 없다', /\.vf-act\{[\s\S]{0,120}padding:0;/.test(SRC), true);
  // 화면이 낮으면 단추 사이 간격(gap)이 줄어든다. 넓히는 양도 함께 줄여야
  // 이웃 단추의 자리를 덮지 않는다.
  [[760,10,4],[620,7,3],[500,5,2],[400,3,1]].forEach(([h,gap,pad])=>{
    sc.eq(`max-height:${h} — gap ${gap} 에 맞춰 ${pad}px 만 넓힌다`,
      SRC.includes(`@media (max-height:${h}px){\n  .vf-actions{gap:${gap}px;}\n  .vf-act::after{top:-${pad}px;bottom:-${pad}px;}`), true);
    sc.eq(`max-height:${h} — 간격의 절반을 넘지 않는다`, pad * 2 < gap, true);
  });

  // ⚠️ 진짜 원인은 넓이만이 아니었다. 손끝은 누르는 동안 10px 쯤 저절로
  //    흔들리는데, 그것이 **세로 드래그의 시작**으로 읽혀 touchend 가
  //    preventDefault 를 하고 스냅백만 하고 끝났다 — 클릭이 아예 안 생겼다.
  sc.eq('반응 단추 위에서 시작한 터치인지 기억한다',
        SRC.includes("onAct=!!(e.target&&e.target.closest&&e.target.closest('.vf-act'));"), true);
  sc.eq('그 위에서의 흔들림은 드래그로 키우지 않는다',
        SRC.includes("if(onAct){dir='h';return;}"), true);
  // 'v' 로 정해지기 **전에** 걸러야 한다 — 뒤에 두면 이미 dragging 이 켜진다
  const mv = slice("el.addEventListener('touchmove',e=>{", "if(!dragging)return;");
  sc.eq('세로/가로를 정하기 전에 거른다',
        mv.indexOf("if(onAct){dir='h';return;}") < mv.indexOf("dir=Math.abs(ddy)>=Math.abs(ddx)"), true);
}

// ═══ 4. Deeper 책 아이콘 — 가운데 선이 두 겹이었다 ═══
console.log('\n시나리오 4 — Deeper 아이콘의 가운데 선');
{
  // 예전엔 좌·우 반쪽을 각각 닫힌 도형으로 그렸는데, 두 반쪽이 가운데
  // 세로선(x=12)을 똑같이 한 번씩 그어서 그 한 줄만 두 겹으로 진했다.
  const old = 'M3 5.5v13Q7.5 17 12 18.6V5.5Q7.5 3.6 3 5.5Z';
  sc.eq('두 겹으로 긋던 옛 path 는 한 군데도 안 남았다', SRC.includes(old), false);
  // 바깥 테두리 하나 + 가운데 세로선 하나 (화면 3곳 + 공유 이미지 1곳)
  const outer = 'M3 5.5v13Q7.5 17 12 18.6Q16.5 17 21 18.5V5.5Q16.5 3.6 12 5.5Q7.5 3.6 3 5.5Z';
  sc.eq('바깥 테두리는 네 곳 모두 같은 path', (SRC.match(new RegExp(outer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length, 4);
  sc.eq('가운데 선은 따로 한 번만', (SRC.match(/M12 5\.5v13\.1/g)||[]).length, 4);
  // 채움(눌린 상태)은 원래 겹치지 않았다 — 건드리지 않는다
  sc.eq('채움 아이콘은 그대로', SRC.includes("fill:['M3 5.5v13Q7.5 17 11 18.4V5.4Q7.5 3.6 3 5.5Z','M21 5.5v13Q16.5 17 13 18.4V5.4Q16.5 3.6 21 5.5Z']"), true);
}

// ═══ 5. 가장자리 흰 줄 (v26-0904-5, HB 신고) ═══
console.log('\n시나리오 5 — 화면 끝에 흰 줄이 생기지 않는다');
{
  // 왜 생겼나 — 기기에 따라 화면 폭·높이가 정수가 아니다(안드로이드 411.43px 같은
  // 값). inset:0 으로 화면에 딱 맞춘 상자는 그 소수점 탓에 마지막 한 픽셀을
  // 못 칠하는 때가 있고, 그 틈으로 아래 있던 앱 배경(밝은 테마면 흰색)이
  // 오른쪽·아래 끝에 한 줄 비쳤다. 사방으로 1px 씩 넘겨 칠해 막는다.
  sc.eq('전체화면은 1px 넘겨 칠한다',
        SRC.includes('position:fixed;inset:-1px;z-index:190;background:var(--vf-bgimg,var(--bg));'), true);
  sc.eq('타일뷰도 같다',
        SRC.includes('position:fixed;inset:-1px;z-index:195;background:var(--vf-bgimg,var(--bg));'), true);
  // ⚠️ 그림자(box-shadow)로 한 겹 덧칠하는 방법은 색이 하나뿐이라 그라디언트
  //    테마에서 가장자리 색이 어긋난다. 배경 자체를 넓히는 것이 맞다.
  sc.eq('전체화면 규칙 자체에는 그림자를 쓰지 않는다',
        slice('#verseFull{', '\n}').replace(/\/\*[\s\S]*?\*\//g, '').includes('box-shadow'), false);

  // ⚠️ v26-0904-6 — 위의 1px 넘겨 칠하기만으로는 HB 기기에서 안 잡혔다.
  //    틈으로 보이는 것은 **앱 바탕**(html·body = var(--bg))인데 밝은 테마면
  //    거의 흰색(#f5f6fa)이다. 그래서 전체화면이 떠 있는 동안엔 바탕도 같은
  //    배경으로 칠해 둔다 — 어디서 한 줄이 새든 같은 색이 보인다.
  sc.eq('전체화면이 떠 있으면 바탕(html)도 같은 배경',
        SRC.includes('html.vf-open{background:var(--vf-page-bg,var(--bg));}'), true);
  sc.eq('body 는 !important 라 같은 세기로 덮는다',
        SRC.includes('html.vf-open body{background:var(--vf-page-bg,var(--bg)) !important;}'), true);
  sc.eq('테마를 흘려보낼 때 바탕용 값도 함께',
        SRC.includes("document.documentElement.style.setProperty('--vf-page-bg',vars['--vf-bgimg']);"), true);
  // ⚠️ --vf-bgimg 를 뿌리에 얹으면 말씀 카드(.vc-body)가 할일 화면에서도 그 배경을
  //    물려받아 색이 바뀐다. 그래서 바탕 전용 변수를 따로 둔다 — 합치지 말 것.
  sc.eq('--vf-bgimg 를 뿌리에 얹지 않는다',
        /documentElement\.style\.setProperty\('--vf-bgimg'/.test(SRC), false);
  // 여닫는 네 곳에서 바탕을 맞춘다 (전체화면 열기·닫기, 타일뷰 열기·닫기)
  sc.eq('네 곳에서 바탕을 맞춘다',
        (SRC.match(/_vfSyncPageBg\(\);/g) || []).length, 4);
  sc.eq('타일뷰가 남아 있으면 바탕을 되돌리지 않는다',
        slice('function _vfSyncPageBg(){', '\n}').includes('_verseFullIsOpen()||(typeof _vgIsOpen'), true);
}

sc.done();
