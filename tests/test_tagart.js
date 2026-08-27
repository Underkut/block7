// 태그 그림 — 말씀 전체화면에 태그 그림을 옅게 띄우는 기능 (v26-0825-3)
//
// 왜 필요했나 — HB 의 말씀에 붙은 태그가 430개다. 하나씩 그릴 수 없어서 뜻이
// 같은 것끼리 묶어 도안 33개로 줄였고, 태그 → 묶음 → 도안 표를 거쳐 그림을
// 고른다. 그 표가 어긋나면 그림이 조용히 안 뜨거나 엉뚱한 게 뜬다.
//
// 도안과 표는 tools/make-tagart.py 가 docs/tag-art-marks.html 과
// tools/tag-groups.py 에서 만들어 index.html 에 심는다. 규칙은 docs/TAG-ART.md.
//
// ⚠️ 이 시나리오들이 지키는 것 —
//   · 후보는 **그림이 있는 태그만** 모은다. 그러지 않으면 그림 없는 태그가
//     뽑힐 때마다 아무것도 안 뜬다 (HB 말씀은 태그가 평균 4.5개인데 그중
//     그림 있는 게 보통 2~3개다).
//   · 본문 낱말 판정은 **부분일치가 터지지 않아야** 한다. '불' 하나만 두었더니
//     "바람이 임의로 **불**매"(요 3:8)가 불꽃으로 뽑혔다. 회귀 테스트를 둔다.
//   · 그림은 본문 **아래**에 깔리고 제스처를 막지 않는다.

const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

// 데이터와 고르기 함수를 떠서 실행한다
const CODE = slice('const _TAGART_MARKS={', '// ── 설정창 (말씀설정 → 전체화면 탭) ──');
const box = {};
new Function('box', CODE + '\nbox._TAGART_MARKS=_TAGART_MARKS;box._TAGART_MARKOF=_TAGART_MARKOF;'
  + 'box._TAGART_PICK=_TAGART_PICK;box._TAGART_GROUPSRC=_TAGART_GROUPSRC;'
  + 'box.alias=_tagartAliasMap;box.pick=_tagartPick;box.svg=_tagartSvg;'
  + 'box.swatch=_tagartSwatchSvg;')(box);

const V = (text, tags) => ({ ref: '테스트 1:1', krText: text, tags });

console.log('시나리오 1 — 도안과 표가 서로 맞는다');
{
  const marks = Object.keys(box._TAGART_MARKS);
  sc.eq('도안 50개 (성령 3종·고난 4종이라 묶음보다 넷 많다)', marks.length, 50);
  sc.eq('묶음 46개', Object.keys(box._TAGART_MARKOF).length, 46);
  sc.eq('별칭 369개', Object.keys(box.alias()).length, 369);
  // v26-0826-6 에 큰 묶음을 쪼개며 새로 그린 열하나
  sc.eq('4차 도안 11개가 다 있다',
    ['m-holy','m-onefold','m-idol','m-newman','m-mature','m-create',
     'm-just','m-rise','m-sin','m-sift','m-path'].filter(i => !marks.includes(i)), []);
  // 5차 — HB 가 손으로 그려 준 도안 둘 (v26-0826-7)
  sc.eq('HB 손그림 도안 둘이 있다', ['m-unite','m-medal'].filter(i => !marks.includes(i)), []);
  sc.eq("'복' 묶음이 공급에 흡수돼 m-fill 은 없앴다", marks.includes('m-fill'), false);

  const need = new Set();
  Object.values(box._TAGART_MARKOF).forEach(a => a.forEach(i => need.add(i)));
  sc.eq('묶음표가 쓰는 도안이 모두 있다', [...need].filter(i => !marks.includes(i)), []);
  sc.eq('안 쓰이는 도안이 없다', marks.filter(i => !need.has(i)), []);

  sc.eq('그리스도는 십자가 도안을 함께 쓴다',
    box._TAGART_MARKOF['그리스도'], box._TAGART_MARKOF['십자가']);
  sc.eq('도안이 여럿인 묶음은 성령·고난 둘뿐이다',
    Object.entries(box._TAGART_MARKOF).filter(([, v]) => v.length > 1).map(([k]) => k).sort(),
    ['고난', '성령'].sort());
  sc.eq('고난은 도안 4종을 랜덤으로 쓴다',
    box._TAGART_MARKOF['고난'], ['m-narrow', 'm-narrowb', 'm-narrowc', 'm-narrowd']);
  sc.eq('모든 도안에 그릴 선이 있다',
    marks.filter(i => !(box._TAGART_MARKS[i].p || []).length), []);
}

console.log('\n시나리오 2 — 그림이 있는 태그만 후보로 삼는다');
{
  sc.eq('그림 없는 태그뿐이면 아무것도 안 그린다',
    box.pick(V('본문', ['듣도보도못한태그', '또다른없는것'])), null);
  sc.eq('태그가 없어도 안 그린다', box.pick(V('본문', [])), null);
  sc.eq('말씀이 없으면 안 그린다', box.pick(null), null);

  // 그림 있는 태그 하나 + 없는 태그 여럿 → 언제나 있는 쪽이 뽑혀야 한다
  const got = new Set();
  for (let i = 0; i < 300; i++) {
    const p = box.pick(V('본문', ['없는것1', '순종', '없는것2', '없는것3']));
    got.add(p && p.id);
  }
  sc.eq('없는 태그에 걸려 빈손으로 돌아오지 않는다', [...got], ['m-bow']);

  sc.eq('앞뒤 공백이 있어도 찾는다', box.pick(V('본문', ['  순종  '])).id, 'm-bow');
}

console.log('\n시나리오 2-1 — 띄어쓰기 있는 태그도 찾는다 (v26-0826-6 회귀)');
{
  // ⚠️ _TAGART_GROUPSRC 는 묶음마다 태그를 이어 붙여 두고 처음 쓸 때 편다.
  //    그 구분자가 **공백**이면 '성령 충만'·'하나님의 뜻' 같은 태그가 조각나서
  //    영영 안 걸린다. 369개 중 101개(27%)가 그랬고, 말씀 240개 중 104개(43%)가
  //    표가 정한 것과 다른 그림을 받고 있었다. 구분자는 반드시 '|' 여야 한다.
  const a = box.alias();
  [['하나님의 의', '공의'], ['성령 충만', '성령'], ['새 언약', '언약'],
   ['일용할 양식', '공급'], ['하나님의 뜻', '주권'], ['왕 같은 제사장', '언약'],
   ['City On A Hill', '빛']].forEach(([t, g]) => sc.eq('"' + t + '" → ' + g, a[t], g));
  sc.eq('묶음 원본을 공백으로 잇지 않는다',
    Object.values(box._TAGART_GROUPSRC).some(v => / /.test(v.replace(/\|/g, ''))
      && v.split('|').every(t => !/ /.test(t))), false);
  // 표에 있는 태그는 하나도 빠짐없이 찾아져야 한다
  const miss = [];
  Object.entries(box._TAGART_GROUPSRC).forEach(([g, v]) =>
    v.split('|').forEach(t => { if (a[t] === undefined) miss.push(t); }));
  sc.eq('표에 적힌 태그가 모두 찾아진다', miss, []);
}

console.log('\n시나리오 2-2 — HB 가 지시한 묶음 재편 (v26-0826-7)');
{
  const a = box.alias(), of = t => box._TAGART_MARKOF[a[t]];
  // ① 복 계열은 '공급'이 채워 주시는 것 → 공급으로. 상 계열만 따로 '상급'.
  ['복', '팔복', '신령한 복'].forEach(t => sc.eq('"' + t + '" 은 공급', a[t], '공급'));
  ['기쁨', '희락', '즐거움', '행복'].forEach(t => sc.eq('"' + t + '" 은 기쁨', a[t], '기쁨'));
  sc.eq('기쁨은 반짝이는 별 도안', box._TAGART_MARKOF['기쁨'], ['m-spark']);
  ['상', '상급', '기업', '유업', '상속'].forEach(t => sc.eq('"' + t + '" 은 상급', a[t], '상급'));
  sc.eq('공급은 원래 그림 그대로', of('복'), ['m-provide']);
  sc.eq('상급은 새 그림(메달)', of('상급'), ['m-medal']);
  // ② 한마음 쪼개기 — 우선순위 / 연합(퍼즐) / 예수 중심은 십자가로
  ['우선순위', '가치', '한 가지', '정렬'].forEach(t => sc.eq('"' + t + '" 은 우선순위', a[t], '우선순위'));
  sc.eq('우선순위는 쓰던 그림 그대로', of('우선순위'), ['m-onefold']);
  ['연합', '그리스도와의 연합'].forEach(t => sc.eq('"' + t + '" 은 연합', a[t], '연합'));
  sc.eq('연합은 퍼즐 한 조각', of('연합'), ['m-unite']);
  ['예수 중심', '그리스도 중심'].forEach(t => sc.eq('"' + t + '" 은 십자가', a[t], '십자가'));
  sc.eq('예수 중심은 십자가 그림', of('예수 중심'), ['m-cross']);
}

console.log('\n시나리오 3 — 본문 낱말로 성령 그림을 고른다 (부분일치 사고 방지)');
{
  const many = (text, n) => {
    const s = new Set();
    for (let i = 0; i < (n || 60); i++) s.add(box.pick(V(text, ['성령'])).id);
    return [...s].sort();
  };
  // ⚠️ 회귀 — '불'만 낱말로 두었을 때 이 구절이 불꽃으로 뽑혔다
  sc.eq('요 3:8 "임의로 불매" 는 불꽃이 아니라 바람', many('바람이 임의로 불매 네가 그 소리는 들어도'), ['m-wind']);
  sc.eq('행 2:3 "불의 혀" 는 불꽃', many('불의 혀같이 갈라지는 것들이 각 사람 위에 임하여'), ['m-flame']);
  sc.eq('요 7:38 "생수의 강" 은 물', many('그 배에서 생수의 강이 흘러나오리라'), ['m-water']);
  sc.eq('맞는 낱말이 없으면 셋 중에서 고른다',
    many('아무 낱말도 없는 본문입니다', 300), ['m-flame', 'm-water', 'm-wind']);

  // 흔한 낱말이 엉뚱하게 **걸려서 하나로 고정되지** 않는지.
  // (아무것도 안 걸리면 셋 중 랜덤이 정상이므로 '안 나온다'가 아니라
  //  '셋 다 나온다'로 본다 — 하나로 좁혀졌다면 그게 오탐이다)
  const ALL3 = ['m-flame', 'm-water', 'm-wind'];
  sc.eq('"재물" 이 물로 고정되지 않는다', many('재물을 하늘에 쌓아 두라', 300), ALL3);
  sc.eq('"만물" 이 물로 고정되지 않는다', many('만물이 그로 말미암아 지은 바 되었으니', 300), ALL3);
  sc.eq('"불의" 가 불꽃으로 고정되지 않는다', many('모든 불의를 깨끗하게 하실 것이요', 300), ALL3);
  sc.eq('"숨기다" 가 바람으로 고정되지 않는다', many('숨기어 둔 것이 드러나지 않을 것이 없나니', 300), ALL3);
}

console.log('\n시나리오 4 — 자리는 본문 바로 위·가운데 (v26-0826-3)');
{
  // 고르기는 이제 도안만 돌려준다. 자리는 _vfPlaceTagArt() 가 본문을 재서 잡는다.
  sc.eq('고른 결과에 모서리가 없다', 'corner' in box.pick(V('본문', ['순종'])), false);
  const fn = slice('function _vfPlaceTagArt(){', '// 공유 이미지(캔버스)에');
  sc.eq('본문(#vfText) 을 기준으로 잰다', fn.includes("getElementById('vfText')"), true);
  sc.eq('본문 위쪽에 놓는다', fn.includes('(txTop-gap-size)'), true);
  sc.eq('크기 규칙은 CSS 하나뿐 — 인라인 폭을 비우고 다시 읽는다',
    fn.includes("el.style.width='';") && fn.includes('el.offsetWidth'), true);
  sc.eq('자리가 모자라면 줄인다', fn.includes('Math.min(base,txTop-topMin-gap)'), true);
  sc.eq('그래도 안 되면 안 그린다', fn.includes("el.style.visibility='hidden'"), true);
  // ⚠️ 회귀 (v26-0826-3) — 첫 화면만 뜨고 그 다음 말씀부터 안 뜬 사고.
  //    말씀을 넘기는 동안 #verseFullInner 는 translateY 로 화면 밖에 나가 있는데
  //    _verseFullRender() 가 바로 그때 돈다. getBoundingClientRect 로 재면 본문이
  //    화면 밖으로 나와 "자리 없음"이 되고 그 상태로 굳는다.
  //    offsetTop 은 transform 을 타지 않으므로 넘기는 중에도 참값이 나온다.
  sc.eq('본문 자리를 transform 안 타는 offsetTop 으로 잰다',
    fn.includes('const txTop=tx.offsetTop;'), true);
  sc.eq('넘기는 중에 흔들리는 getBoundingClientRect 를 안 쓴다',
    /\.getBoundingClientRect\(/.test(fn), false);
  // ⚠️ 회귀 (v26-0826-5) — 말씀을 넘길 때 본문만 밀려가고 그림은 제자리에 남던 문제.
  //    넘기기 애니메이션은 #verseFullInner 를 통째로 옮기므로, 그림이 그 **안에**
  //    있어야 본문과 함께 움직인다. 밖으로 빼면 다시 어긋난다.
  sc.eq('그림이 본문과 같은 #verseFullInner 안에 있다',
    SRC.indexOf('id="verseFullInner"') < SRC.indexOf('id="vfArt"'), true);
  // 본문 크기가 정해진 뒤라야 잴 수 있다 → _vfLayoutText() 끝에서 부른다
  sc.eq('본문 배치가 끝난 뒤에 자리를 잡는다',
    slice('function _vfLayoutText(){', '// ── 구독자 전체 집계 카운터').includes('_vfPlaceTagArt();'), true);
}

console.log('\n시나리오 5 — 그림체 두 벌이 같은 도안을 쓴다');
{
  const mn = box.svg('m-wind', 'minimal'), og = box.svg('m-wind', 'organic');
  sc.eq('minimal 은 필터를 안 쓴다', mn.includes('filter='), false);
  sc.eq('organic 은 손떨림·연필결 두 겹', og.includes('url(#tagartWb)') && og.includes('url(#tagartGr)'), true);
  const dOf = s => (s.match(/ d="[^"]+"/g) || []).join('|');
  sc.eq('두 그림체의 선(path)은 완전히 같다', dOf(mn), dOf(og));
  sc.eq('없는 도안을 부르면 빈 문자열', box.svg('m-없는것', 'minimal'), '');
}

console.log('\n시나리오 5-1 — 설정창 미리보기는 획 하나 (v26-0826-3)');
{
  // v26-0826-2 는 도안을 확대해서 잘라 썼는데, 옆 획까지 걸려 위아래가 칠해진 것처럼
  // 보였다. 이제 미리보기 전용 획을 따로 그린다 — 도안과 아무 상관이 없어야 한다.
  const mn = box.swatch('minimal'), og = box.swatch('organic');
  sc.eq('획이 하나뿐이다', (mn.match(/<path /g) || []).length, 1);
  sc.eq('도안을 잘라 쓰지 않는다 — 자체 viewBox', mn.includes('viewBox="0 0 140 20"'), true);
  sc.eq('minimal 은 필터를 안 쓴다', mn.includes('filter='), false);
  sc.eq('organic 은 손떨림·연필결 두 겹',
    og.includes('url(#tagartSwWb)') && og.includes('url(#tagartSwGr)'), true);
  // 도안 필터와 id 가 겹치면 문서에 둘 다 떴을 때 서로 잡아먹는다
  sc.eq('도안 필터와 id 가 겹치지 않는다',
    og.includes('id="tagartWb"') || og.includes('id="tagartGr"'), false);
  sc.eq('두 그림체의 획은 완전히 같다',
    (mn.match(/ d="[^"]+"/g) || []).join('|'), (og.match(/ d="[^"]+"/g) || []).join('|'));
  sc.eq('설정창이 이 함수를 쓴다',
    SRC.includes("_tagartSwatchSvg('minimal')") && SRC.includes("_tagartSwatchSvg('organic')"), true);
}

console.log('\n시나리오 6 — 기본값과 저장 키');
{
  sc.eq('전체화면 그림은 기본 켜짐', SRC.includes('vfArtOn:true'), true);
  sc.eq('그림체 기본은 organic', SRC.includes("vfArtStyle:'organic'"), true);
  sc.eq('공유 이미지에는 기본 켜짐', SRC.includes('imgInclArt:true'), true);
  sc.eq('켜짐 판정 함수가 있다', SRC.includes('function _tagartOn(){return !!(ST.settings||{}).vfArtOn;}'), true);
  sc.eq('공유는 켬 기본에 맞는 판정', SRC.includes('s.imgInclArt!==false'), true);
}

console.log('\n시나리오 7 — 화면에서 본문을 가리지 않는다');
{
  const css = slice('.vf-art{', '.vfart-pv{');
  sc.eq('본문 아래로 깔린다', css.includes('z-index:0'), true);
  sc.eq('제스처를 막지 않는다', css.includes('pointer-events:none'), true);
  sc.eq('오패시티 20%', css.includes('opacity:.2;'), true);
  // 모바일은 같은 값이라도 더 옅게 느껴진다 (HB 확인) → 한 단계 진하게
  sc.eq('모바일만 30%', /@media\(hover:none\)\{\.vf-art\{opacity:\.3;\}\}/.test(SRC), true);
  sc.eq('가로는 가운데 고정', css.includes('left:50%') && css.includes('translateX(-50%)'), true);
  sc.eq('옛 모서리 자리는 없앴다',
    ['.vf-art.tl{', '.vf-art.tr{', '.vf-art.bl{', '.vf-art.br{'].some(k => css.includes(k)), false);
  // DOM 에서 본문보다 앞에 있어야 아래로 깔린다
  sc.eq('#vfArt 가 #vfText 보다 앞에 있다',
    SRC.indexOf('id="vfArt"') < SRC.indexOf('id="vfText"'), true);
}

console.log('\n시나리오 8 — 전체화면과 공유 이미지가 같은 그림을 쓴다');
{
  const fn = slice('function _vfRenderTagArt(v){', '// 공유 이미지(캔버스)에');
  sc.eq('꺼져 있으면 비우고 끝낸다', fn.includes("if(!_tagartOn()||!v){"), true);
  sc.eq('구절이 바뀌거나 새로 열 때만 다시 뽑는다',
    fn.includes('if(_vfArtForce||key!==_vfArtKey||!_vfArtCur)'), true);
  sc.eq('전체화면을 열면 다시 뽑는다', SRC.includes('_vfArtForce=true;'), true);
  // 공유 이미지는 화면이 고른 것(_vfArtCur)을 그대로 쓴다 — 다시 뽑으면 화면과 달라진다
  const shot = slice('if(o.inclArt!==false&&_tagartOn()&&_vfArtCur){', '// 본문 — 화면에 그려진');
  sc.eq('공유는 화면이 고른 도안을 그대로 그린다', shot.includes('_tagartDrawOn(ctx,_vfArtCur.id'), true);
  // 공유는 숫자를 또 적지 않고 **화면에 적용된 값**을 읽는다 —
  // 안 그러면 모바일만 30% 같은 규칙이 생길 때 화면과 어긋난다
  sc.eq('공유 오패시티는 화면 값을 그대로 읽는다',
    shot.includes("parseFloat(getComputedStyle(ae).opacity)")
    && shot.includes('aop>0?aop:.2'), true);
  sc.eq('배경 바로 위·본문 아래에 그린다',
    SRC.indexOf('if(o.inclArt!==false&&_tagartOn()&&_vfArtCur){') < SRC.indexOf("const tEl=document.getElementById('vfText');"), true);
  sc.eq('공유 켬/끔 값을 넘긴다', SRC.includes('const inclArt=opt.inclArt!==undefined?opt.inclArt:(s.imgInclArt!==false);'), true);
}

console.log('\n시나리오 9 — 설정창');
{
  sc.eq('전체화면 탭 안이다',
    SRC.indexOf('id="vstab-full"') < SRC.indexOf('<div class="settings-section-title">이미지 삽입')
    && SRC.indexOf('<div class="settings-section-title">이미지 삽입') < SRC.indexOf('id="vstab-share"'), true);
  sc.eq('그림체 줄은 켰을 때만 나온다', SRC.includes('data-cond="vfArt"'), true);
  sc.eq('등급은 파워 전용', /data-lv="p">\s*<div class="settings-section-title">이미지 삽입/.test(SRC), true);
  // ⚠️ 설정창을 다시 열 때 버튼이 저장값과 어긋나면 안 된다 (0813-5 와 같은 함정)
  sc.eq('설정창을 그릴 때 버튼 상태를 맞춘다',
    slice('function renderVerseSettingsModal(){', '_renderVfThemeChips();').includes('_vfArtSyncUI();'), true);
  sc.eq('공유탭 버튼 이름은 "그림"', SRC.includes(">그림</button>"), true);
  sc.eq('공유탭 버튼도 저장값과 맞춘다',
    slice('function _syncShareSettingsUI(){', '_renderSharePreview();').includes("set('imgArt',s.imgInclArt!==false)"), true);
}

sc.done();
