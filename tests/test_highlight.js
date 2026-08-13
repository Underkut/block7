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
  '_hiLinesHTML,_hiOn,_hiBold,_hiPen,_hiFw,_hiHash,_hiWave,_hiStar,'+
  '_hiKindsOn,_hiOverlap,_hiShuffle,_hiPickAt,HI_KINDS,_hiStarMax,_hiAssign,'+
  '_hiRng,_hiSmooth,_hiRibbon,_hiWob,_hiWavePoly,_hiStarPoly,HI_ART,HI_POS});'
);

const TEXT = '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라';
const marks = html => (html.match(/<span class="hi-mark[^"]*">(.*?)<\/span>/g) || [])
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
        /\.hi-mark\.hi-p\{[^}]*padding:/.test(SRC), false);
  // 네 효과가 각각 걸린다 — **조각에 붙은 클래스**로 (겹쳐쓰기 때문에 조각마다 다르다)
  sc.eq('굵게 CSS', SRC.includes('.hi-mark.hi-b{font-weight:var(--hi-fw,700);}'), true);
  sc.eq('형광펜 CSS', SRC.includes('.hi-mark.hi-p{'), true);
  // ⚠️ 뿌리 표식으로 되돌리면 한 구절의 모든 문구가 같은 효과가 되어 겹쳐쓰기가 뜻을 잃는다
  sc.eq('뿌리 표식으로 걸지 않는다', /html\[data-hi(bold|pen|mix)=/.test(SRC), false);
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
  // 0812-15: 붙여 놓은 한 덩어리(세그먼티드) · 복수 선택 · 아이콘
  const seg = full.slice(full.indexOf('class="hi-seg"'), full.indexOf('hi-step-wrap'));
  sc.eq('한 덩어리로 묶었다', full.includes('<div class="hi-seg"'), true);
  sc.eq('네 칸 차례', [...seg.matchAll(/<button id="(setHi\w+)"/g)].map(m => m[1]),
        ['setHiBold', 'setHiPen', 'setHiWave', 'setHiStar']);
  sc.eq('굵게 칸', seg.includes(`id="setHiBold" class="on" onclick="toggleHiMark('hiBold','setHiBold')"`), true);
  sc.eq('형광펜 칸', seg.includes(`id="setHiPen" onclick="toggleHiMark('hiPen','setHiPen')"`), true);
  sc.eq('물결 칸', seg.includes(`id="setHiWave" onclick="toggleHiMark('hiWave','setHiWave')"`), true);
  sc.eq('별 칸', seg.includes(`id="setHiStar" onclick="toggleHiMark('hiStar','setHiStar')"`), true);
  // 글자 대신 그림이라 읽어 줄 이름이 따로 있어야 한다
  sc.eq('네 칸 모두 이름표', (seg.match(/<button [^>]*aria-label="/g) || []).length, 4);
  sc.eq('토글은 안 쓴다', full.includes('setHiBold" onchange'), false);
  // 칸끼리 맞붙는다 — 칸 사이 선 하나로 나눈다 (칸마다 테두리를 두르지 않는다)
  sc.eq('칸을 맞붙인다', SRC.includes('.hi-seg{'), true);
  sc.eq('칸 사이는 선 하나', SRC.includes('.hi-seg button:first-child{border-left:0;}'), true);
  // 겹쳐쓰기 스테퍼 — 자리가 있으면 우측, 없으면 아래로 (flex-wrap 이 해 준다)
  sc.eq('스테퍼가 있다', full.includes('<div class="hi-step">'), true);
  sc.eq('빼기·더하기', full.includes('stepHiOverlap(-1)') && full.includes('stepHiOverlap(1)'), true);
  sc.eq('우측 아니면 하방', /\.hi-ctl-row\{[^}]*flex-wrap:wrap/.test(SRC), true);
  // 누르면 바로 반영 — 화면 둘 + 공유 미리보기
  sc.eq('바로 반영', SRC.includes('function toggleHiMark(key,btnId){'), true);
  sc.eq('전체화면 다시 그리기', /function _hiRefreshAll[\s\S]*?if\(_verseFullIsOpen\(\)\)_vfLayoutText\(\);/.test(SRC), true);
  sc.eq('말씀카드 다시 그리기', /function _hiRefreshAll[\s\S]*?renderRightPanel\(\);/.test(SRC), true);
  sc.eq('공유 미리보기도', /function _hiRefreshAll[\s\S]*?_renderSharePreview\(\);/.test(SRC), true);
  sc.eq('버튼 상태 맞추기', SRC.includes("document.getElementById('setHiBold')?.classList.toggle('on',s.hiBold!==false)"), true);
  // ⚠️ 이 UI 는 **말씀 설정창**에 있다 — 일반 설정창만 맞춰 주면 켜진 표시가 어긋난다
  sc.eq('맞추는 함수가 하나', SRC.includes('function _syncHiUI()'), true);
  sc.eq('말씀 설정창도 부른다',
        /function _syncShareSettingsUI\(\)[\s\S]*?_syncHiUI\(\);/.test(SRC), true);
  sc.eq('일반 설정창도 부른다',
        /function renderSettingsPanel\(\)[\s\S]*?_syncHiUI\(\);/.test(SRC), true);
  // ⚠️ 첫 사용자는 **볼드만** 켜져 있어야 한다
  sc.eq('새 사용자 기본값', SRC.includes('hiBold:true,hiPen:false,hiWave:false,hiStar:false,hiOverlap:1,'), true);
}

// ═══ 10. 공유 이미지 — 화면과 따로 정한다 ═══
console.log('\n시나리오 10 — 공유 이미지의 강조');
{
  const share = SRC.slice(SRC.indexOf('id="vstab-share"'), SRC.indexOf('공유 이미지 크기'));
  // 0812-15: 미리보기를 가운데 두고 네 귀퉁이에 버튼 — 자리가 곧 설명이다
  sc.eq('네 귀퉁이 배치', share.includes('class="img-corners"'), true);
  sc.eq('가운데가 미리보기',
        /\.img-corners\{[^}]*grid-template-areas:"tl mid tr" "bl mid br"/.test(SRC), true);
  sc.eq('버튼 차례',
        [...share.matchAll(/<button id="(img\w+)"/g)].map(m => m[1]),
        ['imgHi', 'imgBlock7', 'imgLeft', 'imgActions']);
  sc.eq('좌상단은 강조', share.includes('style="grid-area:tl;" onclick="toggleImgIncl(\'imgHi\',\'imgHi\')">강조 표시<'), true);
  sc.eq('우상단은 BLOCK7', share.includes('style="grid-area:tr;"') && share.includes('>BLOCK7<'), true);
  sc.eq('좌하단은 주제·태그', share.includes('style="grid-area:bl;"') && share.includes('>주제, 태그<'), true);
  sc.eq('우하단은 아이콘만', share.includes('style="grid-area:br;"') && share.includes('class="img-ic-row"'), true);
  sc.eq('아이콘 다섯 개',
        (share.slice(share.indexOf('img-ic-row')).match(/<svg /g) || []).length, 5);
  sc.eq('우하단에 글자를 넣지 않는다',
        /[가-힣]/.test(share.slice(share.indexOf('img-ic-row'), share.indexOf('</button>', share.indexOf('img-ic-row')))), false);
  // 종류별 버튼과 '섞어서 쓰기' 는 공유 탭에서 없앴다 (화면 설정 하나만 따른다)
  sc.eq('종류별 버튼 없음', /id="imgHi(Bold|Pen|Wave|Star|Mix)"/.test(SRC), false);
  sc.eq('공유 기본값은 켬', SRC.includes('imgHi:true,'), true);
  sc.eq('공유는 켜고 끄기만', SRC.includes('const hiOn=opt.hiOn!==undefined?opt.hiOn:(s.imgHi!==false);'), true);
  sc.eq('종류는 화면 설정 그대로', SRC.includes('const kindsOn=o.hiOn===false?[]:_hiKindsOn();'), true);
  sc.eq('설정창에서 상태 맞추기', SRC.includes("set('imgHi',s.imgHi!==false);"), true);
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

// ═══ 12. 겹쳐쓰기 (0812-15, 옛 '섞어서 쓰기'를 대신한다) ═══
console.log('\n시나리오 12 — 문구마다 효과 몇 개를 겹칠지');
{
  // ⚠️ 여기서 미끄러지기 쉬운 것:
  //   ① 켠 종류보다 큰 수를 고를 수 있으면 안 된다 (둘만 켰는데 3 은 뜻이 없다)
  //   ② 순수 무작위로 뽑으면 한 구절의 문구가 죄다 같은 효과가 되기도 한다
  //   ③ 다시 그릴 때마다 바뀌면 깜빡인다
  ST.settings = {};
  sc.eq('처음엔 1', _hiOverlap(), 1);
  ST.settings.hiOverlap = 3;
  sc.eq('고른 값을 읽는다', _hiOverlap(), 3);
  ST.settings.hiOverlap = 9;
  sc.eq('범위 밖은 1 로', _hiOverlap(), 1);
  ST.settings = {};

  // 켠 종류 모으기 — 차례는 늘 굵게·형광펜·물결·별
  sc.eq('종류 차례가 고정', HI_KINDS, ['b', 'p', 'w', 's']);
  ST.settings = {};
  sc.eq('기본은 굵게만', _hiKindsOn(), ['b']);
  ST.settings = { hiBold: true, hiPen: true, hiWave: true, hiStar: true };
  sc.eq('넷 다 켜면 넷', _hiKindsOn(), ['b', 'p', 'w', 's']);
  ST.settings = { hiBold: false, hiPen: true, hiStar: true };
  sc.eq('켠 것만, 차례대로', _hiKindsOn(), ['p', 's']);
  ST.settings = {};

  const seed = '태초에 말씀이 계시니라';
  const K4 = ['b', 'p', 'w', 's'];

  // ① 한 가지만 켰으면 겹쳐쓰기와 무관하게 그 하나
  sc.eq('하나만 켜면 그 하나', _hiPickAt(seed, 0, ['b'], 3), ['b']);
  sc.eq('아무것도 없으면 빈 손', _hiPickAt(seed, 0, [], 2), []);

  // ② 겹쳐쓰기 1 — 문구마다 하나씩, 이웃끼리는 다르다
  const one = [0, 1, 2, 3].map(i => _hiPickAt(seed, i, K4, 1));
  sc.eq('1 이면 하나씩', one.every(k => k.length === 1), true);
  sc.eq('이웃끼리 다르다', one.every((k, i) => i === 0 || k[0] !== one[i - 1][0]), true);
  sc.eq('네 문구에 네 가지가 골고루', new Set(one.map(k => k[0])).size, 4);

  // ③ 겹쳐쓰기 2·3 — 그 수만큼 겹친다
  const two = [0, 1, 2, 3].map(i => _hiPickAt(seed, i, K4, 2));
  sc.eq('2 면 두 개씩', two.every(k => k.length === 2), true);
  sc.eq('같은 것을 두 번 넣지 않는다', two.every(k => new Set(k).size === 2), true);
  sc.eq('3 이면 세 개씩',
        [0, 1, 2].map(i => _hiPickAt(seed, i, K4, 3)).every(k => k.length === 3), true);

  // ④ 겹쳐쓰기 4 — 모든 문구에 네 가지 한꺼번에
  const four = [0, 1, 2, 3].map(i => _hiPickAt(seed, i, K4, 4));
  sc.eq('4 면 전부', four.every(k => k.length === 4), true);
  sc.eq('4 면 문구마다 똑같다', four.every(k => JSON.stringify(k) === JSON.stringify(K4)), true);

  // ⑤ 켠 종류보다 크게 고르면 켠 만큼만
  sc.eq('둘만 켰는데 4 를 고르면 둘', _hiPickAt(seed, 0, ['b', 'p'], 4), ['b', 'p']);
  sc.eq('0 이나 음수는 1 로', _hiPickAt(seed, 0, K4, 0).length, 1);

  // ⑥ 결과 차례는 늘 HI_KINDS 순 — 화면과 공유 이미지가 어긋나지 않게
  sc.eq('늘 정해진 차례로 준다',
        [0, 1, 2, 3, 4, 5].every(i => {
          const k = _hiPickAt(seed, i, K4, 3);
          return JSON.stringify(k) === JSON.stringify(K4.filter(x => k.indexOf(x) >= 0));
        }), true);

  // ⑦ 같은 본문이면 늘 같다 (다시 그려도 안 깜빡인다)
  sc.eq('같은 본문이면 늘 같다',
        JSON.stringify([0, 1, 2, 3].map(i => _hiPickAt(seed, i, K4, 2))), JSON.stringify(two));
  sc.eq('해시는 늘 같은 값', _hiHash(seed), _hiHash(seed));
  sc.eq('해시는 음수가 아니다', _hiHash(seed) >= 0, true);
  // 구절이 다르면 차례도 달라진다 (그래서 '무작위'로 느껴진다)
  const firsts = ['씨앗A', '씨앗B', '씨앗C', '씨앗D', '씨앗E', '씨앗F']
    .map(x => _hiPickAt(x, 0, K4, 1)[0]);
  sc.eq('구절마다 시작이 다르다', new Set(firsts).size > 1, true);
  // 섞기 자체도 늘 같은 결과여야 한다
  sc.eq('섞기도 늘 같다',
        JSON.stringify(_hiShuffle(K4, seed)), JSON.stringify(_hiShuffle(K4, seed)));
  sc.eq('섞어도 네 개 그대로',
        JSON.stringify(_hiShuffle(K4, seed).slice().sort()), JSON.stringify(K4.slice().sort()));

  // 줄 그리기 — 조각마다 걸린 효과를 클래스로 단다
  const lines = ['가나다 라마바', '사아자 차카타'];
  const html = _hiLinesHTML(lines, [[0, 3], [8, 11]], i => (i === 0 ? ['b'] : ['p', 'w']));
  sc.eq('굵게 몫에 hi-b', html.includes('<span class="hi-mark hi-b hi-end">가나다</span>'), true);
  sc.eq('겹친 몫에 둘 다', html.includes('<span class="hi-mark hi-p hi-w hi-end">사아자</span>'), true);

  // 설정 — 두 가지 이상 켰을 때만 보인다
  sc.eq('두 개 이상일 때만 보이게', SRC.includes('function _syncHiOverlapRow()'), true);
  sc.eq('조건은 켠 종류 두 개',
        SRC.includes("document.getElementById('setHiOverlapWrap')?.classList.toggle('cond-hide',!showOvl);")
        && SRC.includes('const showOvl=kinds.length>=2;'), true);
  // ⚠️ 설정창 등급이 .lv-hide 로 감추는 것과 싸우지 않게 style.display 를 안 쓴다
  const ovFn = SRC.slice(SRC.indexOf('function _syncHiOverlapRow()'));
  sc.eq('클래스로만 감춘다', ovFn.slice(0, ovFn.indexOf('\n}')).includes('style.display'), false);
  // 켠 종류가 줄면 값도 따라 줄어야 한다 (둘만 켰는데 3 이 남아 있으면 안 된다)
  sc.eq('종류가 줄면 값도 줄인다', ovFn.includes('let n=Math.min(max,_hiOverlap());'), true);
  sc.eq('더 못 올리면 막는다', ovFn.includes('pl.disabled=(n>=max);'), true);
  sc.eq('스테퍼도 가둔다',
        SRC.includes('const n=Math.min(max,Math.max(1,_hiOverlap()+d));'), true);
  sc.eq('기본값 1', SRC.includes('hiOverlap:1,'), true);
  // 옛 '섞어서 쓰기' 는 걷어냈다
  sc.eq('섞어서 쓰기 흔적 없음', /hiMix|_hiKindAt/.test(SRC), false);
  sc.eq('옛 이름은 주석에만', (SRC.match(/섞어서 쓰기/g) || []).length, 1);
  // 공유 이미지도 같은 함수로 배정한다
  sc.eq('공유 이미지도 같은 배정',
        SRC.includes('const assigned=_hiAssign(flat,ranges.length,kindsOn,_hiOverlap(),_hiStarMax());'), true);
  sc.eq('화면도 같은 배정',
        SRC.includes('const kinds=_hiAssign(flat,ranges.length,_hiKindsOn(),_hiOverlap(),_hiStarMax());'), true);
  ST.settings = {};
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

  // ⚠️ 0813-3 HB 신고 — 위 두 곳만 보고 있었는데, **공유 모음**을 주고받는 길에도
  //    구절을 새로 조립하는 곳이 둘 더 있었다. 거기에 hi 가 없어서 구독자에게만
  //    강조가 통째로 빠졌다. 소유자 화면은 멀쩡해서 한참 몰랐다.
  sc.eq('공유 게시가 강조를 담는다',
        SRC.includes("tags:v.tags||[],hi:v.hi||'',d:v.d||''"), true);
  sc.eq('구독 받기가 강조를 담는다',
        SRC.includes("tags:v.tags||[],hi:String(v.hi||''),src:'shared'"), true);
  // 게시와 구독은 항목이 같아야 한다 — 한쪽만 고치면 그대로 샌다
  const pub = /verses:\(coll\.verses\|\|\[\]\)[^\n]*/.exec(SRC)[0];
  const sub = /const verses=\(data\.verses\|\|\[\]\)[^\n]*/.exec(SRC)[0];
  const fields = t => (t.match(/(\w+):/g) || []).map(x => x.slice(0, -1)).sort();
  sc.eq('게시에 hi 가 있다', fields(pub).indexOf('hi') >= 0, true);
  sc.eq('구독에 hi 가 있다', fields(sub).indexOf('hi') >= 0, true);
  // 구독 모음의 매일 갱신은 시트 동기화 함수를 그대로 쓴다 → 거기도 hi 를 다룬다
  sc.eq('갱신도 같은 길',
        SRC.includes("_syncSheetVersesIntoColl(c,d.verses||[],{kind:'share'})"), true);
  sc.eq('갱신이 강조를 넣는다', SRC.includes("hi:String(it.hi||'')"), true);
  sc.eq('갱신이 강조를 고친다', SRC.includes('ex.tags=newTags;ex.hi=newHi;'), true);

  // ⚠️ 0813-4 — 받는 쪽만 고쳐서는 소용이 없었다. 게시가 **편집창을 닫거나
  //    공유창을 열 때만** 일어나서, 시트에 나중에 적은 강조 문구가 구독자에게
  //    영영 가지 않았다 (구독자는 아무리 동기화해도 "새로운 내용이 없어요").
  //    소유자가 동기화할 때도 다시 게시해야 한다.
  sc.eq('동기화할 때도 다시 게시한다',
        SRC.includes('if(c.shareCode&&_fbReady()){try{await _publishSharedColl(c);}catch(e){}}'), true);
  // 시트를 다 받은 **뒤에** 게시해야 최신 내용이 올라간다
  const loop = SRC.slice(SRC.indexOf('for(const g of (c.google||[])){'),
                         SRC.indexOf('if(c.importCode&&_fbReady()){'));
  sc.eq('시트를 받은 뒤에 게시',
        loop.indexOf('_syncSheetVersesIntoColl(c,items') < loop.indexOf('_publishSharedColl(c)'), true);
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
  sc.eq('화면은 hi-end 일 때만 별', SRC.includes("wantS&&m.classList.contains('hi-end')"), true);
  sc.eq('공유도 마지막 조각만 별', SRC.includes('if(sg.s&&sg.last)'), true);
  // ⚠️ 겹쳐쓰기 때문에 조각마다 효과가 다르다 → 덮개는 전체 설정이 아니라 클래스를 본다
  sc.eq('덮개는 조각 클래스를 본다',
        SRC.includes("const wantW=m.classList.contains('hi-w'),wantS=m.classList.contains('hi-s');"), true);

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
  sc.eq('버튼 상태 맞추기',
        SRC.includes("document.getElementById('setHiWave')?.classList.toggle('on',s.hiWave===true)"), true);

  // 곧은 밑줄은 되살리지 않았다 (2026-08-12 에 걷어낸 것)
  sc.eq('곧은 밑줄 CSS 없음', /\.hi-mark\{[^}]*text-decoration/.test(SRC), false);
}

// ═══ 15. 한 본문에 별 몇 개까지 (0812-16) ═══
console.log('\n시나리오 15 — 별 개수 제한');
{
  // ⚠️ 별 개수는 **구절 전체**를 봐야 정할 수 있다 (문구 하나만 봐서는 못 센다).
  //    그래서 _hiPickAt(문구별) 위에 _hiAssign(구절 전체)이 한 겹 더 있다.
  ST.settings = {};
  sc.eq('기본은 4', _hiStarMax(), 4);
  ST.settings.hiStarMax = 2;
  sc.eq('고른 값을 읽는다', _hiStarMax(), 2);
  ST.settings.hiStarMax = 7;
  sc.eq('범위 밖은 4 로', _hiStarMax(), 4);
  ST.settings.hiStarMax = 0;
  sc.eq('0 도 4 로', _hiStarMax(), 4);
  ST.settings = {};

  const seed = '태초에 말씀이 계시니라 이 말씀이';
  const countStars = a => a.filter(k => k.indexOf('s') >= 0).length;

  // 별만 켜고 문구 8개 — 제한이 그대로 지켜진다
  const only = ['s'];
  [1, 2, 3, 4].forEach(m => {
    sc.eq('별만 켜고 제한 ' + m, countStars(_hiAssign(seed, 8, only, 1, m)), m);
  });
  // 문구가 제한보다 적으면 있는 만큼만 (억지로 늘리지 않는다)
  sc.eq('문구가 적으면 그만큼', countStars(_hiAssign(seed, 2, only, 1, 4)), 2);
  sc.eq('문구가 없으면 0', _hiAssign(seed, 0, only, 1, 4).length, 0);

  // 넷 다 켜고 전부 겹칠 때 — 모든 문구가 별을 받지만 제한이 걸린다
  const K4 = ['b', 'p', 'w', 's'];
  sc.eq('전부 겹쳐도 제한이 이긴다', countStars(_hiAssign(seed, 9, K4, 4, 3)), 3);
  // 별을 뺀 자리에 다른 효과는 그대로 남는다
  const cut = _hiAssign(seed, 9, K4, 4, 2);
  sc.eq('별만 덜어낸다', cut.every(k => ['b', 'p', 'w'].every(x => k.indexOf(x) >= 0)), true);

  // ⚠️ 0813-1 HB 신고 — 별만 빼고 끝내면 그 문구는 겹쳐쓰기 수보다 하나 모자라진다.
  //    (별 1개 제한 + 겹쳐쓰기 2 인데 한 가지만 걸린 문구가 섞여 보였다)
  //    뺀 자리를 다른 효과로 **채워** 수를 그대로 지켜야 한다.
  [1, 2, 3].forEach(m => {
    [2, 3].forEach(ovl => {
      const a = _hiAssign(seed, 9, K4, ovl, m);
      sc.eq(`별 ${m}개 제한 · 겹쳐쓰기 ${ovl} — 수가 안 줄어든다`,
            a.every(k => k.length === ovl), true);
      sc.eq(`별 ${m}개 제한 · 겹쳐쓰기 ${ovl} — 별은 그 수만큼`, countStars(a), m);
    });
  });
  // 채운 뒤에도 같은 효과를 두 번 넣지 않는다
  sc.eq('중복 없이 채운다',
        _hiAssign(seed, 9, K4, 3, 1).every(k => new Set(k).size === k.length), true);
  // 채운 결과도 늘 HI_KINDS 차례 (화면과 공유 이미지가 어긋나지 않게)
  sc.eq('채운 뒤에도 차례가 같다',
        _hiAssign(seed, 9, K4, 2, 1)
          .every(k => JSON.stringify(k) === JSON.stringify(K4.filter(x => k.indexOf(x) >= 0))), true);
  // 채울 것이 없으면(별 말고 켠 게 없으면) 그 문구는 비는 게 맞다
  sc.eq('채울 게 없으면 빈다',
        _hiAssign(seed, 5, ['s'], 2, 1).filter(k => k.length === 0).length, 4);
  // 별을 뺀 나머지가 겹쳐쓰기 수보다 적으면 있는 만큼만
  sc.eq('나머지가 모자라면 그만큼',
        _hiAssign(seed, 6, ['b', 's'], 2, 1).filter(k => k.indexOf('s') < 0)
          .every(k => JSON.stringify(k) === JSON.stringify(['b'])), true);
  // 채우기도 늘 같은 결과여야 한다 (다시 그려도 안 깜빡인다)
  sc.eq('채우기도 늘 같다',
        JSON.stringify(_hiAssign(seed, 9, K4, 2, 1)),
        JSON.stringify(_hiAssign(seed, 9, K4, 2, 1)));

  // ⚠️ 앞에서부터 자르면 별이 구절 앞쪽에만 몰린다
  const idx = [];
  _hiAssign(seed, 10, only, 1, 3).forEach((k, i) => { if (k.indexOf('s') >= 0) idx.push(i); });
  sc.eq('세 개가 남는다', idx.length, 3);
  sc.eq('앞쪽에 몰리지 않는다', JSON.stringify(idx) === JSON.stringify([0, 1, 2]), false);

  // 같은 구절이면 늘 같은 자리 (다시 그려도 안 깜빡인다)
  sc.eq('같은 구절이면 늘 같다',
        JSON.stringify(_hiAssign(seed, 10, only, 1, 3)),
        JSON.stringify(_hiAssign(seed, 10, only, 1, 3)));
  // 구절이 다르면 남는 자리도 달라진다
  const pos = t => JSON.stringify(_hiAssign(t, 10, only, 1, 3));
  sc.eq('구절마다 다르다', pos('구절가') === pos('구절나'), false);

  // 제한이 안 걸리면 _hiPickAt 결과 그대로여야 한다
  sc.eq('제한이 넉넉하면 그대로',
        JSON.stringify(_hiAssign(seed, 3, K4, 2, 4)),
        JSON.stringify([0, 1, 2].map(i => _hiPickAt(seed, i, K4, 2))));

  // 설정 UI — 별을 켰을 때만 보인다
  sc.eq('스테퍼가 있다', SRC.includes('<div class="hi-step-wrap" id="setHiStarMaxWrap">'), true);
  sc.eq('빼기·더하기', SRC.includes('stepHiStarMax(-1)') && SRC.includes('stepHiStarMax(1)'), true);
  sc.eq('별을 켰을 때만',
        SRC.includes("document.getElementById('setHiStarMaxWrap')?.classList.toggle('cond-hide',!showStar);")
        && SRC.includes('const showStar=_hiStar(),sm=_hiStarMax();'), true);
  sc.eq('1 아래로 못 내린다', SRC.includes('smi.disabled=(sm<=1);'), true);
  sc.eq('4 위로 못 올린다', SRC.includes('spl.disabled=(sm>=4);'), true);
  sc.eq('스테퍼도 가둔다',
        SRC.includes("updateSetting('hiStarMax',Math.min(4,Math.max(1,_hiStarMax()+d)));"), true);
  // 0813-7: 첫 사용자 기본값을 4 → 1 로 바꿨다 (HB 요청 — 별을 과하게 켜지 않게)
  sc.eq('기본값 1', SRC.includes('hiStarMax:1,'), true);
  ST.settings = {};
}

// ═══ 16. 공유 설정 미리보기 비율 (0812-16) ═══
console.log('\n시나리오 16 — 미리보기 여백');
{
  // ⚠️ 크기를 안 주면 지금 화면 비로 그려진다. 폰은 세로로 길어 미리보기가
  //    가늘고 길어지고, 네 귀퉁이 요소가 너무 작아 켜졌는지 안 보였다 (HB 신고).
  sc.eq('미리보기 전용 크기가 있다', SRC.includes('const _SHARE_PREVIEW_SIZE=[880,900];'), true);
  sc.eq('미리보기가 그 크기를 쓴다',
        SRC.includes('_vfRenderCard({verse:ex,size:_SHARE_PREVIEW_SIZE,'), true);
  // 네모에 가까워야 여백이 준다 (세로가 가로의 1.2배를 넘지 않게)
  const m = /_SHARE_PREVIEW_SIZE=\[(\d+),(\d+)\]/.exec(SRC);
  sc.eq('네모에 가깝다', (+m[2]) / (+m[1]) < 1.2, true);
  // 실제 저장 크기와는 상관없다 — 그쪽은 설정에서 따로 고른다
  sc.eq('저장 크기는 따로', SRC.includes("function setShareSize("), true);
}

sc.done();
