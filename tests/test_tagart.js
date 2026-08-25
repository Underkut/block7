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
  + 'box.alias=_tagartAliasMap;box.pick=_tagartPick;box.svg=_tagartSvg;')(box);

const V = (text, tags) => ({ ref: '테스트 1:1', krText: text, tags });

console.log('시나리오 1 — 도안과 표가 서로 맞는다');
{
  const marks = Object.keys(box._TAGART_MARKS);
  sc.eq('도안 34개 (성령이 바람·불꽃·물 셋이라 묶음보다 하나 많다)', marks.length, 34);
  sc.eq('묶음 33개', Object.keys(box._TAGART_MARKOF).length, 33);
  sc.eq('별칭 369개', Object.keys(box.alias()).length, 369);

  const need = new Set();
  Object.values(box._TAGART_MARKOF).forEach(a => a.forEach(i => need.add(i)));
  sc.eq('묶음표가 쓰는 도안이 모두 있다', [...need].filter(i => !marks.includes(i)), []);
  sc.eq('안 쓰이는 도안이 없다', marks.filter(i => !need.has(i)), []);

  sc.eq('그리스도는 십자가 도안을 함께 쓴다',
    box._TAGART_MARKOF['그리스도'], box._TAGART_MARKOF['십자가']);
  sc.eq('성령만 도안이 여럿이다',
    Object.entries(box._TAGART_MARKOF).filter(([, v]) => v.length > 1).map(([k]) => k), ['성령']);
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

console.log('\n시나리오 4 — 자리는 네 모서리 중 무작위');
{
  const c = new Set();
  for (let i = 0; i < 400; i++) c.add(box.pick(V('본문', ['순종'])).corner);
  sc.eq('네 모서리가 다 나온다', [...c].sort(), ['bl', 'br', 'tl', 'tr']);
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

console.log('\n시나리오 6 — 기본값과 저장 키');
{
  sc.eq('전체화면 그림은 기본 꺼짐', SRC.includes('vfArtOn:false'), true);
  sc.eq('그림체 기본은 minimal', SRC.includes("vfArtStyle:'minimal'"), true);
  sc.eq('공유 이미지에는 기본 켜짐', SRC.includes('imgInclArt:true'), true);
  // ⚠️ 기본이 꺼짐이므로 판정은 !! 여야 한다 (!==false 로 두면 켜진 것으로 읽힌다)
  sc.eq('꺼짐 기본에 맞는 판정', SRC.includes('function _tagartOn(){return !!(ST.settings||{}).vfArtOn;}'), true);
  sc.eq('공유는 켬 기본에 맞는 판정', SRC.includes('s.imgInclArt!==false'), true);
}

console.log('\n시나리오 7 — 화면에서 본문을 가리지 않는다');
{
  const css = slice('.vf-art{', '.vfart-pv{');
  sc.eq('본문 아래로 깔린다', css.includes('z-index:0'), true);
  sc.eq('제스처를 막지 않는다', css.includes('pointer-events:none'), true);
  sc.eq('오패시티 30%', css.includes('opacity:.3'), true);
  sc.eq('네 모서리 자리가 다 있다',
    ['.vf-art.tl{', '.vf-art.tr{', '.vf-art.bl{', '.vf-art.br{'].every(k => css.includes(k)), true);
  // DOM 에서 본문보다 앞에 있어야 아래로 깔린다
  sc.eq('#vfArt 가 #verseFullInner 보다 앞에 있다',
    SRC.indexOf('id="vfArt"') < SRC.indexOf('id="verseFullInner"'), true);
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
  sc.eq('공유도 오패시티 30%', shot.includes(',.3,_tagartStyle())'), true);
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
  sc.eq('등급은 미드·파워', /data-lv="mp">\s*<div class="settings-section-title">이미지 삽입/.test(SRC), true);
  // ⚠️ 설정창을 다시 열 때 버튼이 저장값과 어긋나면 안 된다 (0813-5 와 같은 함정)
  sc.eq('설정창을 그릴 때 버튼 상태를 맞춘다',
    slice('function renderVerseSettingsModal(){', '_renderVfThemeChips();').includes('_vfArtSyncUI();'), true);
  sc.eq('공유탭 버튼 이름은 "그림"', SRC.includes(">그림</button>"), true);
  sc.eq('공유탭 버튼도 저장값과 맞춘다',
    slice('function _syncShareSettingsUI(){', '_renderSharePreview();').includes("set('imgArt',s.imgInclArt!==false)"), true);
}

sc.done();
