// 강조 표시 — 구글 시트 '강조 문구' 열을 본문에 칠한다 (v26-0812-12)
//
// 시트에는 **무엇을** 강조할지(문구)만 적고, **어떻게** 보일지는 앱이 정한다.
// 그래야 나중에 보기 방식을 바꿀 때 시트를 통째로 고치지 않아도 된다.
//
// ⚠️ 이 기능에서 미끄러지기 쉬운 곳 세 가지 — 이 파일이 그것을 고정한다:
//   ① 시트에 손으로 적은 문구는 본문과 **띄어쓰기·문장부호가 다를 수 있다.**
//   ② 강조가 **줄바꿈에 걸칠 수 있다.** 줄마다 잘라서 칠해야 한다.
//   ③ 본문에 없는 문구가 들어와도 **조용히 넘어가야** 한다 (시트를 채우는 중이다).
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();

global.ST = { settings: {} };
global.esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
global.document = { documentElement: { setAttribute(){} } };

eval(
  slice("// ══════ 강조 표시 — 구글 시트 '강조 문구' 열을 본문에 칠한다 ══════",
        '// ══════ 강조 표시 끝 ══════') +
  ';Object.assign(globalThis,{HI_SPLIT,_hiPhrases,_hiSquash,_hiRanges,' +
  '_hiLinesHTML,_hiOn,_hiBold,_hiPen,_hiFw,_hiMix,_hiHash,_hiKindAt,_hiWave,_hiStar,'+
  '_hiRng,_hiSmooth,_hiRibbon,_hiWob,_hiWavePoly,_hiStarPoly,HI_ART,HI_POS});'
);

const TEXT = '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라';
const marks = html => (html.match(/<span class="hi-mark(?: hi-end)?">(.*?)<\/span>/g) || [])
  .map(s => s.replace(/<[^>]+>/g, ''));

// ═══ 1. 한 칸에 여러 문구 ═══
console.log('시나리오 1 — 문구 나누기');
{
  // '/' 로 나눈다. 실제 성경 본문 180구절에 '/' 는 한 번도 없어 안전하다.
  sc.eq('/ 로 나눈다', _hiPhrases({ hi: '가나 / 다라' }), ['가나', '다라']);
  sc.eq('| 로 적어도 알아듣는다', _hiPhrases({ hi: '가나|다라' }), ['가나', '다라']);
  sc.eq('줄바꿈으로 적어도', _hiPhrases({ hi: '가나\n다라' }), ['가나', '다라']);
  sc.eq('섞여 있어도', _hiPhrases({ hi: '가나 / 다라 | 마바' }), ['가나', '다라', '마바']);
  sc.eq('앞뒤 빈칸은 턴다', _hiPhrases({ hi: '  가나  /  다라  ' }), ['가나', '다라']);
  sc.eq('빈 칸은 버린다', _hiPhrases({ hi: '가나 // 다라 /' }), ['가나', '다라']);
  // 시트를 채우는 중이라 빈 칸이 많다 — 그때는 아무 일도 없어야 한다
  sc.eq('비어 있으면 없음', _hiPhrases({ hi: '' }), []);
  sc.eq('아예 없어도 안전', _hiPhrases({}), []);
  sc.eq('구절이 없어도 안전', _hiPhrases(null), []);
}

// ═══ 2. ⚠️ 띄어쓰기·문장부호가 달라도 찾는다 ═══
console.log('\n시나리오 2 — 손으로 적은 문구와 본문의 차이를 견딘다');
{
  const r = p => _hiRanges(TEXT, [p]).map(([a, b]) => TEXT.slice(a, b));
  sc.eq('그대로 적으면 그대로', r('말씀이 계시니라'), ['말씀이 계시니라']);
  sc.eq('띄어쓰기가 달라도', r('말씀이계시니라'), ['말씀이 계시니라']);
  sc.eq('빈칸을 더 넣어도', r('말씀이   계시니라'), ['말씀이 계시니라']);
  sc.eq('마침표를 붙여도', r('말씀이 계시니라.'), ['말씀이 계시니라']);
  sc.eq('따옴표가 섞여도', r('“말씀이 계시니라”'), ['말씀이 계시니라']);
  sc.eq('쉼표가 섞여도', r('말씀이, 계시니라'), ['말씀이 계시니라']);
  // ③ 본문에 없는 문구는 조용히 넘어간다
  sc.eq('본문에 없으면 무시', r('없는 문구입니다'), []);
  sc.eq('빈 문구도 무시', _hiRanges(TEXT, ['']), []);
  sc.eq('문장부호만 있으면 무시', _hiRanges(TEXT, ['...']), []);
  sc.eq('본문이 비면 무시', _hiRanges('', ['가나']), []);
}

// ═══ 3. 여러 곳 · 겹침 ═══
console.log('\n시나리오 3 — 여러 곳을 칠할 때');
{
  const r = ps => _hiRanges(TEXT, ps).map(([a, b]) => TEXT.slice(a, b));
  sc.eq('두 곳', r(['태초에', '하나님이시니라']), ['태초에', '하나님이시니라']);
  sc.eq('앞에서부터 차례로', _hiRanges(TEXT, ['하나님이시니라', '태초에'])[0][0], 0);
  // 같은 말이 본문에 여러 번 나오면 모두 칠한다
  sc.eq('같은 말이 여러 번이면 모두', r(['말씀이']).length, 2);
  // 겹치거나 잇닿은 구간은 하나로 합친다 (span 이 겹쳐 깨지지 않게)
  sc.eq('겹치면 하나로', r(['태초에 말씀이', '말씀이 계시니라']), ['태초에 말씀이 계시니라']);
  sc.eq('같은 문구를 두 번 적어도 하나로', r(['태초에', '태초에']), ['태초에']);
}

// ═══ 4. ⚠️ 줄바꿈에 걸친 강조 ═══
console.log('\n시나리오 4 — 강조가 줄바꿈에 걸칠 때');
{
  // 본문은 줄 단위로 그려진다. 줄은 words.slice(i,j).join(' ') 이라
  // 줄 사이는 늘 빈칸 한 칸 — 그 규칙 위에서 위치를 센다.
  const lines = ['태초에 말씀이 계시니라', '이 말씀이 하나님과 함께 계셨으니', '이 말씀은 곧 하나님이시니라'];
  const flat = lines.join(' ');
  const html = _hiLinesHTML(lines, _hiRanges(flat, ['계시니라 이 말씀이']));
  sc.eq('두 줄에 걸치면 두 조각', marks(html).length, 2);
  sc.eq('첫 줄 조각', marks(html)[0], '계시니라');
  sc.eq('둘째 줄 조각', marks(html)[1], '이 말씀이');
  sc.eq('줄 수는 그대로', html.split('<br>').length, 3);

  // 한 줄 안에 두 곳
  const h2 = _hiLinesHTML(lines, _hiRanges(flat, ['태초에', '계시니라']));
  sc.eq('한 줄 안에 두 곳', marks(h2), ['태초에', '계시니라']);

  // 강조가 없으면 예전과 똑같이 그린다
  sc.eq('강조가 없으면 그대로', _hiLinesHTML(lines, []), lines.join('<br>'));
  sc.eq('null 이어도 그대로', _hiLinesHTML(lines, null), lines.join('<br>'));

  // 세 줄 전체를 강조 — 조각이 줄마다 하나씩
  const h3 = _hiLinesHTML(lines, _hiRanges(flat, [flat]));
  sc.eq('전체를 강조하면 줄마다 하나', marks(h3).length, 3);
  sc.eq('내용이 그대로 살아 있다', marks(h3).join(' '), flat);
}

// ═══ 5. HTML 로 새는 글자가 없어야 한다 ═══
console.log('\n시나리오 5 — 위험한 글자 막기');
{
  const lines = ['<script>alert(1)</script> 그리고 & 기호'];
  const html = _hiLinesHTML(lines, _hiRanges(lines[0], ['그리고 &']));
  sc.eq('꺾쇠는 그대로 안 나간다', html.includes('<script>'), false);
  sc.eq('꺾쇠를 바꿔 놓는다', html.includes('&lt;script&gt;'), true);
  sc.eq('& 도 바꿔 놓는다', html.includes('&amp;'), true);
  sc.eq('강조는 제대로 걸렸다', marks(html), ['그리고 &amp;']);
}

// ═══ 6. 두 개의 독립 스위치 ═══
console.log('\n시나리오 6 — 굵게 · 형광펜');
{
  // HB가 고른 것: 굵게는 처음부터 켬, 형광펜은 옵션으로 끔. 밑줄은 만들지 않는다.
  ST.settings = {};
  sc.eq('굵게는 처음부터 켜짐', _hiBold(), true);
  sc.eq('형광펜은 처음엔 꺼짐', _hiPen(), false);
  sc.eq('그래서 강조는 켜진 상태', _hiOn(), true);

  ST.settings = { hiBold: false };
  sc.eq('굵게를 끄면 꺼진다', _hiBold(), false);
  sc.eq('둘 다 꺼지면 강조 없음', _hiOn(), false);

  ST.settings = { hiBold: false, hiPen: true };
  sc.eq('형광펜만 켜도 강조는 켜짐', _hiOn(), true);
  sc.eq('그때 굵게는 꺼진 채', _hiBold(), false);

  ST.settings = { hiBold: true, hiPen: true };
  sc.eq('둘 다 켤 수 있다', [_hiBold(), _hiPen()], [true, true]);
  ST.settings = {};
}

// ═══ 7. ⚠️ 구절이 화면까지 오는 길목 ═══
console.log('\n시나리오 7 — 새 항목이 걸러지지 않는가');
{
  // ACTIVE_VERSES() 는 구절을 **정해진 항목만 골라 새로 조립**한다.
  // 여기에 넣지 않으면 강조 문구가 화면까지 오지 못한다 (실제로 그랬다).
  sc.eq('ACTIVE_VERSES 가 강조 문구를 넘겨준다',
        SRC.includes("tags:v.tags||[],hi:v.hi||''"), true);
  // 두 화면 모두 그 값을 요소에 실어 둔다
  sc.eq('전체화면이 실어 둔다', SRC.includes("text.setAttribute('data-hi',v.hi||'');"), true);
  sc.eq('말씀카드가 실어 둔다', SRC.includes('data-hi="${_vgEscAttr(v.hi||\'\')}"'), true);
  // 두 화면의 본문 그리기가 같은 입구를 쓴다 (전체화면·말씀카드 각 한 번)
  sc.eq('전체화면이 그 입구로 그린다', SRC.includes('el.innerHTML=_hiHTML(el,pick.lines);'), true);
  sc.eq('말씀카드도 그 입구로 그린다', SRC.includes('el.innerHTML=_hiHTML(el,lines);'), true);
  // ⚠️ 형광펜에 좌우 여백을 주면 그만큼 폭이 늘어 줄이 밀려난다 (실측 60구절 중 11번)
  // ⚠️ 규칙 **한 덩어리 안**만 본다 ([^}] — 다음 규칙까지 넘어가면 늘 걸린다)
  sc.eq('형광펜에 좌우 여백을 주지 않는다',
        /html\[data-hipen="1"\] \.hi-mark\{[^}]*padding:/.test(SRC), false);
  // 두 스위치가 각각 걸린다
  sc.eq('굵게 CSS', SRC.includes('html[data-hibold="1"] .hi-mark{font-weight:var(--hi-fw,700);}'), true);
  sc.eq('형광펜 CSS', SRC.includes('html[data-hipen="1"] .hi-mark{'), true);
  // ⚠️ 밑줄은 만들었다가 없앴다 — 되살아나지 않았는지 본다
  sc.eq('밑줄은 없앴다', SRC.includes('data-histyle'), false);
  sc.eq('밑줄 CSS 도 없다', /\.hi-mark\{[^}]*text-decoration:underline/.test(SRC), false);
}

// ═══ 8. 구글 시트에서 읽어 오는 길 ═══
console.log('\n시나리오 8 — 시트 열 읽기');
{
  // 열 자리를 고정하지 않는다 — 머리글에서 '강조'가 든 열을 찾고, 없으면 G열
  sc.eq('머리글에 강조 문구', SRC.includes("const HEAD=['카테고리','주제','본문','장절','태그','날짜','강조 문구'];"), true);
  sc.eq('머리글에서 찾는다', SRC.includes("hiCol=h.findIndex(c=>String(c||'').includes('강조'));"), true);
  sc.eq('머리글이 없으면 G열', SRC.includes('if(hiCol<0)hiCol=6;'), true);
  sc.eq('행에서 읽는다', SRC.includes("hi:String(r[hiCol]||'').trim(),"), true);
  // ⚠️ 시트를 채워 나가는 중이라, 다시 동기화하면 나중에 적은 것도 반영돼야 한다
  sc.eq('다시 동기화하면 갱신된다', SRC.includes("String(ex.hi||'')!==newHi"), true);
  sc.eq('갱신할 때 실제로 넣는다', SRC.includes('ex.tags=newTags;ex.hi=newHi;'), true);
  sc.eq('새로 추가할 때도', SRC.includes("tags:newTags,hi:String(it.hi||''),src:'google'"), true);
  // 개발자용 '그 셀로 열기' 도 G열까지
  sc.eq('시트 셀 링크도 G열까지', SRC.includes('&range=A${hit.row}:G${hit.row}'), true);
}

// ═══ 9. 설정창 — 말씀 설정 → 전체화면 탭 ═══
console.log('\n시나리오 9 — 화면 설정 (전체화면 탭)');
{
  // ⚠️ 0812-8: 뷰 탭 → 전체화면 탭으로 옮겼다. 차례는 글자 크기 → 강조 표시 → 테마.
  const full = SRC.slice(SRC.indexOf('id="vstab-full"'), SRC.indexOf('id="vstab-share"'));
  sc.eq('전체화면 탭에 있다', full.includes('>강조 표시</div>'), true);
  sc.eq('뷰 탭에는 없다',
        SRC.slice(SRC.indexOf('id="vstab-general"'), SRC.indexOf('id="vstab-alarm"')).includes('setHiBold'), false);
  sc.eq('차례는 글자 크기 → 강조 표시 → 테마',
        [...full.matchAll(/<div class="settings-section-title">([^<]+)</g)].map(m => m[1]).slice(0, 3),
        ['글자 크기', '강조 표시', '테마']);
  // 제목은 소제목이 아니라 구역 제목(굵게)
  sc.eq('구역 제목으로', full.includes('<div class="settings-section-title">강조 표시</div>'), true);
  sc.eq('소제목이 아니다', /font-weight:600;color:var\(--tx2\);">강조 표시</.test(SRC), false);
  // 토글이 아니라 사각 테두리 버튼 · 복수 선택
  sc.eq('굵게 버튼', SRC.includes(`id="setHiBold" class="settings-btn on" onclick="toggleHiMark('hiBold','setHiBold')"`), true);
  sc.eq('형광펜 버튼', SRC.includes(`id="setHiPen" class="settings-btn" onclick="toggleHiMark('hiPen','setHiPen')"`), true);
  sc.eq('물결 버튼', SRC.includes(`id="setHiWave" class="settings-btn" onclick="toggleHiMark('hiWave','setHiWave')"`), true);
  sc.eq('별 버튼', SRC.includes(`id="setHiStar" class="settings-btn" onclick="toggleHiMark('hiStar','setHiStar')"`), true);
  sc.eq('네 개가 2×2 격자', /강조 표시<\/div>[\s\S]{0,400}?grid-template-columns:repeat\(2,1fr\)/.test(SRC), true);
  sc.eq('토글은 안 쓴다', full.includes('setHiBold" onchange'), false);
  // 누르면 바로 반영 — 화면 둘 + 공유 미리보기
  sc.eq('바로 반영', SRC.includes('function toggleHiMark(key,btnId){'), true);
  sc.eq('전체화면 다시 그리기', /function toggleHiMark[\s\S]*?if\(_verseFullIsOpen\(\)\)_vfLayoutText\(\);/.test(SRC), true);
  sc.eq('말씀카드 다시 그리기', /function toggleHiMark[\s\S]*?renderRightPanel\(\);/.test(SRC), true);
  sc.eq('버튼 상태 맞추기', SRC.includes("document.getElementById('setHiBold')?.classList.toggle('on',s.hiBold!==false)"), true);
  sc.eq('새 사용자 기본값', SRC.includes('hiBold:true,hiPen:false,'), true);
}

// ═══ 10. 공유 이미지 — 화면과 따로 정한다 ═══
console.log('\n시나리오 10 — 공유 이미지의 강조');
{
  const share = SRC.slice(SRC.indexOf('id="vstab-share"'), SRC.indexOf('공유 이미지 크기'));
  // 3열 두 줄 — 1행 굵게강조·형광펜·BLOCK7 / 2행 좌하단·(빈칸)·우하단
  sc.eq('3열 격자', share.includes('grid-template-columns:repeat(3,1fr)'), true);
  sc.eq('버튼 차례',
        [...share.matchAll(/<button id="(img\w+)"/g)].map(m => m[1]),
        ['imgHiBold', 'imgHiPen', 'imgHiWave', 'imgHiStar', 'imgBlock7', 'imgLeft', 'imgActions']);
  sc.eq('가운데 칸을 비운다', /<button id="imgLeft"[^>]*>[^<]*<\/button>\s*\n\s*<div><\/div>/.test(share), true);
  // 공유 전용 값 — 화면 설정(hiBold/hiPen)과 섞이지 않는다
  sc.eq('공유 전용 기본값', SRC.includes('imgHiBold:true,imgHiPen:false,'), true);
  sc.eq('공유 값을 따로 읽는다', SRC.includes('const hiBold=opt.hiBold!==undefined?opt.hiBold:(s.imgHiBold!==false);'), true);
  sc.eq('형광펜도 따로', SRC.includes('const hiPen=opt.hiPen!==undefined?opt.hiPen:(s.imgHiPen===true);'), true);
  // ⚠️ toggleImgIncl 은 "값이 없으면 켜짐"으로 읽는다 — 기본 꺼짐인 것은 따로 적어 둬야 한다
  sc.eq('기본 꺼짐 목록', SRC.includes("const _IMG_OFF_BY_DEFAULT=['imgHiPen','imgHiMix','imgHiWave','imgHiStar'];"), true);
  sc.eq('그 목록을 실제로 쓴다', SRC.includes('_IMG_OFF_BY_DEFAULT.includes(key)?(ST.settings[key]===true)'), true);
  sc.eq('설정창에서 상태 맞추기', SRC.includes("set('imgHiBold',s.imgHiBold!==false);set('imgHiPen',s.imgHiPen===true);"), true);
  // 그리는 쪽 — 줄을 조각으로 나눠 굵기·형광펜을 입힌다
  sc.eq('조각으로 나눠 그린다', SRC.includes('segs.push({t:ln.slice(st-a,en-a),hi:true,'), true);
  sc.eq('조각 폭을 각자의 글꼴로 잰다',
        SRC.includes('segs.forEach(sg=>{ctx.font=fontOf(!!sg.b);tot+=ctx.measureText(sg.t).width;});'), true);
  sc.eq('줄 전체를 가운데에 놓는다', SRC.includes('let x=cx-tot/2;'), true);
  sc.eq('형광펜 띠를 먼저 칠한다', SRC.includes('ctx.fillRect(x,y+fs*0.072,w,fs*0.528);'), true);
  sc.eq('강조가 없으면 예전 그대로', SRC.includes("ctx.font=fontOf(false);ctx.textAlign='center';"), true);
  // 설정 미리보기에서도 보이게 예시 구절에 강조를 넣어 뒀다
  sc.eq('미리보기 예시에 강조', SRC.includes("hi:'나의 목자시니'"), true);
}

// ═══ 11. 서체마다 다른 굵기 ═══
console.log('\n시나리오 11 — 고딕은 한 단계 더 굵게');
{
  // ⚠️ 고딕(Pretendard)은 본문이 300 이라 600 으로는 굵어진 티가 잘 안 난다.
  //    명조(고운바탕)는 400/700 두 벌뿐이라 600 이 이미 700 으로 그려진다.
  //    (HB 확인 2026-08-12 — 명조는 그대로, 고딕만 한 단계 더)
  sc.eq('고딕은 700', _hiFw('sans'), 700);
  sc.eq('명조는 600', _hiFw('serif'), 600);
  sc.eq('모르는 값은 고딕 쪽으로', _hiFw(''), 700);
  sc.eq('고딕이 더 굵다', _hiFw('sans') > _hiFw('serif'), true);
  // 굵기는 CSS 변수 하나로 흘려보낸다 — 전체화면·말씀카드가 각자 자기 테마로
  sc.eq('전체화면이 변수를 넣는다', SRC.includes("'--hi-fw':String(_hiFw(t.font)),"), true);
  sc.eq('말씀카드도 넣는다', SRC.includes("'--hi-fw':String(_hiFw(p.font)),"), true);
  // 공유 이미지도 같은 굵기로 그린다 (화면과 달라 보이면 안 된다)
  sc.eq('공유 이미지도 같은 굵기', SRC.includes('const hiFw=_hiFw(th.font);'), true);
  sc.eq('조각 글꼴이 그 값을 쓴다',
        SRC.includes('const fontOf=b=>`${b?hiFw:cs.fontWeight} ${fs}px ${cs.fontFamily}`;'), true);
  // 굵기를 숫자로 박아 두지 않는다 (테마마다 달라야 한다)
  sc.eq('600 을 박아 두지 않는다', SRC.includes('.hi-mark{font-weight:600;}'), false);
}

// ═══ 12. 섞어서 쓰기 ═══
console.log('\n시나리오 12 — 굵게와 형광펜을 문구마다 나눠 걸기');
{
  ST.settings = {};
  sc.eq('처음엔 꺼짐', _hiMix(), false);
  ST.settings.hiMix = true;
  sc.eq('켜면 켜짐', _hiMix(), true);
  ST.settings = {};

  // 둘 다 켜고 섞기를 켰을 때만 나뉜다
  sc.eq('굵게만이면 안 나눈다', _hiKindAt('씨앗', 0, true, false, true), 'both');
  sc.eq('형광펜만이면 안 나눈다', _hiKindAt('씨앗', 0, false, true, true), 'both');
  sc.eq('섞기를 끄면 겹쳐 쓴다', _hiKindAt('씨앗', 0, true, true, false), 'both');
  // ⚠️ 문구마다 하나씩 — 이웃끼리는 늘 다르다
  const seed = '태초에 말씀이 계시니라';
  const kinds = [0, 1, 2, 3].map(i => _hiKindAt(seed, i, true, true, true));
  sc.eq('둘 중 하나씩만', kinds.every(k => k === 'b' || k === 'p'), true);
  sc.eq('이웃끼리 번갈아', kinds.every((k, i) => i === 0 || k !== kinds[i - 1]), true);
  sc.eq('굵게도 형광펜도 나온다', new Set(kinds).size, 2);
  // ⚠️ 다시 그릴 때마다 바뀌면 깜빡인다 — 같은 본문이면 늘 같아야 한다
  sc.eq('같은 본문이면 늘 같다',
        [0, 1, 2, 3].map(i => _hiKindAt(seed, i, true, true, true)), kinds);
  sc.eq('해시는 늘 같은 값', _hiHash(seed), _hiHash(seed));
  sc.eq('해시는 음수가 아니다', _hiHash(seed) >= 0, true);
  // 구절이 다르면 시작점도 달라질 수 있다 (그래서 '무작위'로 느껴진다)
  const other = ['씨앗A', '씨앗B', '씨앗C', '씨앗D', '씨앗E', '씨앗F']
    .map(x => _hiKindAt(x, 0, true, true, true));
  sc.eq('구절마다 시작이 다르다', new Set(other).size, 2);

  // 줄 그리기 — 문구마다 표식을 단다
  const lines = ['가나다 라마바', '사아자 차카타'];
  const html = _hiLinesHTML(lines, [[0, 3], [8, 11]], i => (i === 0 ? 'b' : 'p'));
  sc.eq('굵게 몫에 hi-b', html.includes('<span class="hi-mark hi-b hi-end">가나다</span>'), true);
  sc.eq('형광펜 몫에 hi-p', html.includes('<span class="hi-mark hi-p hi-end">사아자</span>'), true);
  sc.eq('안 나누면 표식 없음',
        _hiLinesHTML(lines, [[0, 3]]).includes('<span class="hi-mark hi-end">가나다</span>'), true);

  // CSS — 섞을 때 형광펜 몫은 굵기를 되돌리고, 굵게 몫은 띠를 뺀다
  sc.eq('형광펜 몫은 굵기 되돌림',
        SRC.includes('html[data-himix="1"] .hi-mark.hi-p{font-weight:inherit;}'), true);
  sc.eq('굵게 몫은 띠 없음',
        SRC.includes('html[data-himix="1"] .hi-mark.hi-b{background:none;}'), true);
  sc.eq('뿌리 표식은 둘 다 켰을 때만',
        SRC.includes("r.setAttribute('data-himix',(_hiBold()&&_hiPen()&&_hiMix())?'1':'0');"), true);

  // 설정 — 화면·공유 각각 체크박스. 둘 다 켰을 때만 보인다
  // 0812-12: 체크박스 → 앱의 표준 토글 스위치 (다른 설정 줄과 같은 모양)
  sc.eq('화면 토글', SRC.includes(`id="setHiMix" onchange="toggleHiMark('hiMix','setHiMix')"`), true);
  sc.eq('공유 토글', SRC.includes(`id="imgHiMix" onchange="toggleImgIncl('imgHiMix','imgHiMix')"`), true);
  const mixRow = id => {
    const i = SRC.indexOf(`class="settings-row" id="${id}Row"`);
    return i < 0 ? '' : SRC.slice(i, SRC.indexOf('</div>', SRC.indexOf('settings-toggle-track', i)));
  };
  sc.eq('화면은 토글 껍데기 안에', mixRow('setHiMix').includes('<label class="settings-toggle">'), true);
  sc.eq('공유도 토글 껍데기 안에', mixRow('imgHiMix').includes('<label class="settings-toggle">'), true);
  sc.eq('둘 다 트랙이 있다',
        [mixRow('setHiMix'), mixRow('imgHiMix')].every(x => x.includes('settings-toggle-track')), true);
  // 맨몸 체크박스는 남기지 않는다 (그 모양이 낡아 보였다).
  // ⚠️ 이 줄들만 본다 — 앱 다른 곳(.sec-edit-exclude-chk)에는 원래 맨몸 체크박스가 있다
  sc.eq('맨몸 체크박스 없음',
        [mixRow('setHiMix'), mixRow('imgHiMix')].some(x => x.includes('accent-color')), false);
  sc.eq('둘 다 켰을 때만 보이게', SRC.includes('function _syncHiMixRows()'), true);
  sc.eq('화면 조건', SRC.includes("set('setHiMixRow','setHiMix',_hiBold()&&_hiPen(),s.hiMix===true);"), true);
  sc.eq('공유 조건',
        SRC.includes("set('imgHiMixRow','imgHiMix',(s.imgHiBold!==false)&&(s.imgHiPen===true),s.imgHiMix===true);"), true);
  // ⚠️ 설정창 등급이 .lv-hide 로 감추는 것과 싸우지 않게 style.display 를 안 쓴다
  const mixFn = SRC.slice(SRC.indexOf('function _syncHiMixRows()'));
  sc.eq('클래스로만 감춘다', mixFn.slice(0, mixFn.indexOf('\n}')).includes('style.display'), false);
  sc.eq('기본값 둘 다 꺼짐', SRC.includes('hiMix:false,') && SRC.includes('imgHiMix:false,'), true);
  sc.eq('공유 기본 꺼짐 목록에 있다', SRC.includes("const _IMG_OFF_BY_DEFAULT=['imgHiPen','imgHiMix','imgHiWave','imgHiStar'];"), true);
  // 공유 이미지도 같은 방식으로 나눈다
  sc.eq('공유 이미지도 나눈다', SRC.includes('const kindAt=i=>_hiKindAt(flat,i,hb,hp,hm);'), true);
  sc.eq('조각마다 굵게·띠를 따로 정한다',
        SRC.includes("b:hb&&(k!=='p'),p:hp&&(k!=='b')"), true);
}

// ═══ 13. ⚠️ 알림으로 들어올 때도 강조가 온다 ═══
console.log('\n시나리오 13 — 알림 경로');
{
  // ⚠️ ALL_VERSES() 도 ACTIVE_VERSES() 처럼 '정해진 항목만 골라 새로 조립'한다.
  //    알림은 _findVerseByRefLoose → ALL_VERSES 를 타므로, 여기에 hi 가 없으면
  //    알림으로 들어왔을 때만 강조가 조용히 빠진다 (2026-08-12 신고).
  sc.eq('ALL_VERSES 가 강조 문구를 넘겨준다',
        SRC.includes("tags:c.tags||[],hi:c.hi||''};"), true);
  sc.eq('ACTIVE_VERSES 도 그대로',
        SRC.includes("enText:v.enText||'',tags:v.tags||[],hi:v.hi||''};"), true);
  // 구절을 새로 조립하는 곳은 이 둘뿐이어야 한다 (또 생기면 같은 사고가 난다)
  sc.eq('재조립하는 곳은 두 곳뿐', (SRC.match(/enText:\w+\.enText\|\|''/g) || []).length, 2);
}

// ═══ 14. 손글씨 물결 밑줄 · 별 (v26-0812-13) ═══
console.log('\n시나리오 14 — 손글씨 물결·별');
{
  // ⚠️ 이 기능이 미끄러지기 쉬운 곳 네 가지를 여기서 고정한다:
  //   ① 같은 문구는 **늘 같은 모양**이어야 한다 (다시 그릴 때 깜빡이면 안 된다)
  //   ② 글자 폭을 **1px도 늘리면 안 된다** (늘면 줄이 밀려난다)
  //   ③ 글자 크기가 달라도 **같은 느낌**이어야 한다 (말씀카드는 글자가 훨씬 작다)
  //   ④ 화면과 공유 이미지가 **같은 그림**이어야 한다

  // ① 씨앗이 같으면 결과가 똑같다
  const w1 = _hiWavePoly(120, 19, 1234), w2 = _hiWavePoly(120, 19, 1234);
  sc.eq('같은 씨앗 → 같은 물결', JSON.stringify(w1), JSON.stringify(w2));
  sc.eq('다른 씨앗 → 다른 물결',
        JSON.stringify(_hiWavePoly(120, 19, 9999)) === JSON.stringify(w1), false);
  const s1 = _hiStarPoly(19, 77), s2 = _hiStarPoly(19, 77);
  sc.eq('같은 씨앗 → 같은 별', JSON.stringify(s1), JSON.stringify(s2));

  // 그려지는 도형이 실제로 나온다 (빈 배열이면 아무것도 안 보인다)
  sc.eq('물결에 점이 있다', w1.length > 20, true);
  sc.eq('별에 점이 있다', s1.length > 20, true);
  sc.eq('점은 모두 숫자', w1.concat(s1).every(p => isFinite(p.x) && isFinite(p.y)), true);

  // ② 물결은 문구 폭 안에 놓인다 (양 끝 삐침은 선 굵기 몇 배 안쪽)
  const W = 120, fs = 19;
  const over = Math.max(...w1.map(p => p.x)) - W, under = -Math.min(...w1.map(p => p.x));
  sc.eq('오른쪽 삐침이 과하지 않다', over < fs * 0.6, true);
  sc.eq('왼쪽 삐침이 과하지 않다', under < fs * 0.6, true);
  // 덮개 CSS 에 폭·여백이 없어야 한다 (있으면 줄이 밀려난다)
  sc.eq('덮개는 자리를 차지하지 않는다',
        SRC.includes('.hi-ov{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;}'), true);
  sc.eq('덮개에 여백을 주지 않았다', /\.hi-ov\{[^}]*(padding|margin|width)/.test(SRC), false);

  // ③ 글자 크기에 비례한다 — 두 배 글자면 물결도 두 배
  const big = _hiWavePoly(240, 38, 1234);
  const hOf = a => Math.max(...a.map(p => p.y)) - Math.min(...a.map(p => p.y));
  sc.eq('글자가 두 배면 물결도 두 배', Math.abs(hOf(big) / hOf(w1) - 2) < 0.02, true);
  const bigStar = _hiStarPoly(38, 77);
  sc.eq('별도 두 배', Math.abs(hOf(bigStar) / hOf(s1) - 2) < 0.02, true);
  sc.eq('픽셀을 박아 두지 않았다', /HI_ART=\{base:\.\d+,amp:\.\d+,per:1\.\d+/.test(SRC), true);

  // ④ 화면과 공유 이미지가 같은 함수를 쓴다
  sc.eq('화면이 덮개를 그린다', SRC.includes('function _hiOverlay(el){'), true);
  sc.eq('전체화면에서 부른다',
        /el\.innerHTML=_hiHTML\(el,pick\.lines\);\s*\n\s*_hiOverlay\(el\);/.test(SRC), true);
  sc.eq('말씀카드에서도 부른다',
        /el\.innerHTML=_hiHTML\(el,lines\);\s*\n\s*_hiOverlay\(el\);/.test(SRC), true);
  sc.eq('공유 이미지도 같은 물결 함수', SRC.includes('art.push({pts:_hiWavePoly(w,fs,seed)'), true);
  sc.eq('공유 이미지도 같은 별 함수', SRC.includes('art.push({pts:_hiStarPoly(fs,seed)'), true);
  // 씨앗을 만드는 방식이 화면과 공유 이미지에서 같아야 한다 (다르면 그림이 어긋난다)
  sc.eq('화면 씨앗', SRC.includes("_hiHash(m.textContent+'|'+mi)"), true);
  sc.eq('공유 씨앗', SRC.includes("_hiHash(sg.t+'|'+mi)"), true);

  // 별은 문구의 **마지막 조각**에만 — 줄바꿈에 걸려도 하나만 찍힌다
  // '가나다 라마바' + ' ' + '사아자 차카타' → 이어 붙이면 0..14
  const lines = ['가나다 라마바', '사아자 차카타'];
  const html = _hiLinesHTML(lines, [[0, 11]]);   // 두 줄에 걸치는 한 문구
  sc.eq('두 조각으로 갈린다', (html.match(/hi-mark/g) || []).length, 2);
  sc.eq('hi-end 는 하나뿐', (html.match(/hi-end/g) || []).length, 1);
  sc.eq('끝 조각이 둘째 줄', html.includes('hi-end">사아자</span>'), true);
  // 본문 맨 끝까지 강조해도 끝 표시가 붙는다
  sc.eq('끝까지 강조해도 붙는다',
        (_hiLinesHTML(lines, [[0, 15]]).match(/hi-end/g) || []).length, 1);
  // 한 줄 안에서 끝나는 문구는 그 자리에서 바로 끝 조각이다
  sc.eq('한 줄짜리도 끝 표시', _hiLinesHTML(lines, [[0, 3]]).includes('hi-end">가나다</span>'), true);
  sc.eq('화면은 hi-end 일 때만 별', SRC.includes("_hiStar()&&m.classList.contains('hi-end')"), true);
  sc.eq('공유도 마지막 조각만 별', SRC.includes('if(hs&&sg.last)'), true);

  // 스위치 — 물결·별만 켜도 강조 조각이 만들어져야 한다 (덮개를 놓을 자리)
  ST.settings = {};
  sc.eq('둘 다 기본 꺼짐', [_hiWave(), _hiStar()], [false, false]);
  ST.settings = { hiBold: false, hiPen: false, hiWave: true };
  sc.eq('물결만 켜도 강조가 산다', _hiOn(), true);
  ST.settings = { hiBold: false, hiPen: false, hiStar: true };
  sc.eq('별만 켜도 강조가 산다', _hiOn(), true);
  ST.settings = { hiBold: false, hiPen: false };
  sc.eq('전부 끄면 강조가 없다', _hiOn(), false);
  ST.settings = {};
  sc.eq('새 사용자 기본값', SRC.includes('hiWave:false,hiStar:false,'), true);
  sc.eq('공유 전용 기본값', SRC.includes('imgHiWave:false,imgHiStar:false'), true);
  sc.eq('공유 값을 따로 읽는다',
        SRC.includes('const hiWave=opt.hiWave!==undefined?opt.hiWave:(s.imgHiWave===true);'), true);
  sc.eq('버튼 상태 맞추기',
        SRC.includes("document.getElementById('setHiWave')?.classList.toggle('on',s.hiWave===true)"), true);

  // 곧은 밑줄은 되살리지 않았다 (2026-08-12 에 걷어낸 것)
  sc.eq('곧은 밑줄 CSS 없음', /\.hi-mark\{[^}]*text-decoration/.test(SRC), false);
}

sc.done();
