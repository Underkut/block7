// 저장 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB)
//
// 전체화면 우하단 저장(책갈피)을 누르면 뜨는 '저장 목록' 창.
// '최신순' 에서 폴더를 고르면 그 줄이 맨 위로 올라가고, 고르기를 풀면
// 제자리로 돌아간다. 예전에는 다시 그리는 순간 **순간이동**해서 어느 줄이
// 어디로 갔는지 눈으로 못 따라갔다.
//
// → '내순서' 로 끌어 옮길 때(_keepBindDrag)와 **같은 방법·같은 곡선**을 쓴다.
//   ⚠️ 두 곳이 각자 다른 시간·곡선을 쓰면 같은 창 안에서 움직임이 따로 논다.
//      그래서 시간·곡선은 스위터 값(_SW_SLIDE·_SW_EASE) 하나만 쓴다.
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 다시 그릴 때 옛 자리에서 미끄러져 온다 (FLIP)');
{
  const fn = slice('function _keepFlipRender(box,render){', 'function keepPickToggle(');
  // ① 옮기기 전 자리를 잰다  ② 다시 그린다  ③ 옛 자리로 되돌려 놓고 0 으로 보낸다
  sc.eq('옛 자리를 먼저 잰다', /was\.set\([\s\S]{0,120}getBoundingClientRect\(\)\.top/.test(fn), true);
  sc.eq('그 다음 다시 그린다', fn.indexOf('\n  render();') > fn.indexOf('was.set('), true);
  sc.eq('되돌려 놓고', fn.includes("r.style.transform='translateY('+dy+'px)';"), true);
  sc.eq('0 으로 보낸다', /requestAnimationFrame\(\(\)=>\{[\s\S]{0,200}r\.style\.transform='';/.test(fn), true);

  // ⚠️ 줄을 알아보는 열쇠는 목록 이름이다. innerHTML 을 갈아끼우면 요소 자체는
  //    새것이 되므로, 이름으로 옛 자리를 찾아야 한다.
  sc.eq('줄의 신원은 data-keepname', (fn.match(/data-keepname/g)||[]).length >= 2, true);

  // ⚠️ innerHTML 을 갈아끼우면 스크롤이 맨 위로 튄다. 재 둔 자리와 어긋나므로
  //    다시 그린 **직후, 재기 전에** 되돌려 놓아야 한다.
  sc.eq('스크롤 자리를 지킨다', fn.includes('box.scrollTop=top;'), true);
  sc.eq('되그리기 직후에 되돌린다',
        fn.indexOf('box.scrollTop=top;') > fn.indexOf('render();') &&
        fn.indexOf('box.scrollTop=top;') < fn.indexOf('const dy='), true);

  // ⚠️ 끝나면 흔적(transform·transition)을 지운다. 남겨 두면 다음에 손으로
  //    끌 때(_keepBindDrag) 그 값을 물고 줄이 어긋난 자리에서 시작한다.
  sc.eq('끝나면 흔적을 지운다',
        /setTimeout\(\(\)=>\{r\.style\.transition='';r\.style\.transform='';\},_SW_SLIDE\+80\)/.test(fn), true);

  // 새로 생긴 목록은 옛 자리가 없다 — 그냥 나타난다 (0 에서 튀어나오면 어지럽다)
  sc.eq('옛 자리가 없으면 건드리지 않는다', fn.includes('if(o==null)return;'), true);
}

console.log('\n시나리오 2 — 끌어 옮길 때와 같은 시간·곡선');
{
  const flip = slice('function _keepFlipRender(box,render){', 'function keepPickToggle(');
  const drag = slice('function _keepBindDrag(box){', 'function openKeepPicker(');
  const tr = /r\.style\.transition='transform '\+\(_SW_SLIDE\/1000\)\+'s '\+_SW_EASE;/;
  sc.eq('고를 때', tr.test(flip), true);
  sc.eq('끌 때', tr.test(drag), true);
  // 스위터 타일판에서 HB 가 고른 값 그대로다 — 여기서 따로 정하지 않는다
  sc.eq('시간은 한 곳에서 온다', SRC.includes('const _SW_SLIDE=420;'), true);
  sc.eq('곡선도 한 곳에서 온다', SRC.includes("const _SW_EASE='cubic-bezier(.45,-0.05,.3,1.22)';"), true);
}

console.log('\n시나리오 3 — 이 움직임을 쓰는 자리들');
{
  // 고르기·고르기 풀기 (HB 가 말한 그 자리)
  sc.eq('폴더를 고를 때',
        /function keepPickToggle\(name\)\{[\s\S]{0,420}?_keepFlipRender\(document\.getElementById\('keepPickBody'\),_renderKeepPicker\);/.test(SRC), true);
  sc.eq('새 목록을 만들 때',
        /function keepPickNew\(\)\{[\s\S]{0,300}?_keepFlipRender\(document\.getElementById\('keepPickBody'\),_renderKeepPicker\);/.test(SRC), true);
  // 정렬 칩을 바꿀 때도 같은 곡선으로 미끄러진다 (HB — "통일성 있게")
  sc.eq('정렬을 바꿀 때',
        /function _keepRepaintLists\(\)\{[\s\S]{0,420}?_keepFlipRender\(document\.getElementById\('keepPickBody'\),_renderKeepPicker\)/.test(SRC), true);
  // 순간이동하던 옛 호출이 남아 있으면 그 자리만 딱딱하다
  sc.eq('고르기에 순간이동이 안 남았다',
        /function keepPickToggle\(name\)\{[\s\S]{0,420}?\n  _renderKeepPicker\(\);/.test(SRC), false);

  // 고른 표시(음영)도 스르르 든다 — 자리는 미끄러지는데 색만 딱 켜지면 따로 논다
  sc.eq('고른 표시도 스르르', /\.keep-pick-row\{[\s\S]{0,400}transition:background-color \.22s ease;/.test(SRC), true);
}

sc.done();
