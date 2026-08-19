// v26-0819-2, HB 2 — 구글시트 "블럭세븐 앱 개발 Block7" 의 '말씀설정창' 탭 스펙을
// 말씀 설정창에 반영. 탭 신설·이동·순서변경·이름변경·등급(이지/미드/파워) 배정.
//
// 시트 표기 규칙
//   ">"      기존 것을 '기존>변경' 으로 교체
//   "(신규)"  새로 추가하는 탭/제목/소제목
//   "(이동)"  소속 탭이나 상위 뎁스가 옮겨졌다
//   "(순서변경)" 소속은 그대로, 그 안에서 자리만 바뀌었다
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

const idx = t => SRC.indexOf(`id="vstab-${t}"`);
const panel = t => {
  const order = ['top','widget','view','alarm','full','share','coll'];
  const i = order.indexOf(t);
  const from = idx(t);
  const to = i + 1 < order.length ? idx(order[i + 1]) : SRC.indexOf('/verseSettingsTabTrack');
  return SRC.slice(from, to);
};

console.log('시나리오 1 — 탭 구성 (상단 말씀·말씀 위젯 신설, 뷰 분리)');
{
  sc.eq('탭 목록이 시트 순서 그대로',
        SRC.includes("const VERSE_SETTINGS_TABS=['top','widget','view','alarm','full','share','coll'];"), true);
  // v26-0819-3, HB 1 — 탭이 7개로 늘면서 이름에 스페이스가 있으면 구분이 잘 안 돼
  // 보여지는 탭 이름에서만 스페이스를 뺐다(내부 id·다른 화면 문구는 그대로).
  [['top','상단말씀'],['widget','말씀위젯'],['view','뷰']].forEach(([id,label])=>{
    sc.eq(`'${label}' 탭 버튼`, SRC.includes(`switchVerseSettingsTab('${id}',this)">${label}<`), true);
  });
  sc.eq("'말씀모음' 탭 버튼", SRC.includes(`switchVerseSettingsTab('coll',this)">말씀모음<`), true);
  sc.eq('트랙 칸 수 7', SRC.includes('id="verseSettingsTabTrack" style="--stab-count:7;"'), true);
  sc.eq('예전 vstab-general 은 사라졌다', SRC.includes('id="vstab-general"'), false);
  // 탭 순서가 실제 문서 순서와도 맞아야 트랙 이동이 맞는다
  sc.eq('문서 순서 = 탭 순서',
        idx('top') < idx('widget') && idx('widget') < idx('view') && idx('view') < idx('alarm')
        && idx('alarm') < idx('full') && idx('full') < idx('share') && idx('share') < idx('coll'), true);
}

console.log('\n시나리오 2 — 이지유저는 말씀 위젯·공유 탭 자체가 안 보인다');
{
  const fn = slice('function _vstabList(){', '}');
  sc.eq("이지에서 widget·share 를 뺀다",
        fn.includes("(id==='widget'||id==='share')&&lv==='easy'"), true);
  const apply = slice('function applyVerseUiLevel(){', '\n}');
  sc.eq('감춘 탭은 버튼도 함께 뺀다', apply.includes("bar.querySelectorAll('.settings-tab')"), true);
  sc.eq('감춘 탭은 내용(패널)도 함께 뺀다', apply.includes("getElementById('vstab-'+id)"), true);
  sc.eq('폭 계산(--stab-count)도 보이는 탭 수로', apply.includes("track.style.setProperty('--stab-count',vis.length)"), true);
  // ⚠️ 일반설정창 setUiLevel 과 같은 함정 — 등급을 바꾸기 전에 탭 '이름'을 붙잡아야 한다
  const setFn = slice('function setVerseUiLevel(v){', '\n}');
  sc.eq('등급을 바꾸기 전에 보던 탭 이름을 붙잡는다',
        setFn.indexOf('_vstabList()[_currentVerseSettingsTabIdx]') < setFn.indexOf('ST.settings.verseUiLevel=v;'), true);
  // v26-0819-3, HB 2 — 무조건 첫 탭이 아니라 '바로 앞 탭'으로 돌아간다.
  // (말씀위젯 바로 앞은 원래도 상단말씀=첫 탭이라 이미 맞았지만, 공유 바로 앞은
  // 전체화면이라 예전 방식(list[0])으로는 상단말씀으로 튀는 게 문제였다)
  sc.eq('전체 목록을 뒤로 훑어 아직 보이는 탭을 찾는다',
        setFn.includes('VERSE_SETTINGS_TABS.indexOf(curId)') && setFn.includes('for(let i=fullIdx-1;i>=0;i--)'), true);
}

console.log('\n시나리오 3 — 상단 말씀 탭 (뎁스1 두 덩어리)');
{
  const p = panel('top');
  sc.eq('뎁스1: 자동으로 다음 구절', p.includes('<div class="settings-section-title">자동으로 다음 구절</div>'), true);
  sc.eq('뎁스1: 보여줄 항목(신규)', p.includes('<div class="settings-section-title">보여줄 항목</div>'), true);
  // 이름 교체 — '풀 모드에서 표시할 항목' > '풀 모드', '스닉픽 모드에서 표시할 항목' > '스닉픽 모드'
  sc.eq("뎁스2: '풀 모드'", p.includes('<div class="settings-subtitle subtitle-lg" data-lv="mp">풀 모드</div>'), true);
  sc.eq("뎁스2: '스닉픽 모드'", p.includes('<div class="settings-subtitle subtitle-lg" data-lv="mp">스닉픽 모드</div>'), true);
  sc.eq('옛 긴 이름은 안 남았다',
        SRC.includes('풀 모드에서 표시할 항목') || SRC.includes('스닉픽 모드에서 표시할 항목'), false);
  sc.eq('스닉픽 서식은 파워만', p.includes('<div class="settings-subtitle subtitle-lg" data-lv="p">스닉픽 서식</div>'), true);
  sc.eq('한 줄 최대 가로 폭은 파워만', p.includes('<div class="settings-subtitle subtitle-lg" data-lv="p">한 줄 최대 가로 폭</div>'), true);
  sc.eq('매일·매 시간구간은 모든 등급(등급 표시 없음)',
        /<div class="settings-row">\s*<div class="settings-row-text">\s*<div class="settings-row-label">매일<\/div>/.test(p), true);
}

console.log('\n시나리오 3-1 — 한 줄 최대 가로 폭은 슬라이더로 바뀌었다(시트: 방식 슬라이더(변경))');
{
  sc.eq('range 입력', /<input type="range"[^>]*id="setVerseSneakMaxW"/.test(SRC), true);
  sc.eq('예전 롤 피커(select)는 없앴다', SRC.includes('<select id="setVerseSneakMaxW"'), false);
  const fn = slice('function _initSneakMaxWPicker(){', '}');
  sc.eq('열 때 지금 값으로 슬라이더를 맞춘다', fn.includes("sl.value=String(cur);"), true);
  sc.eq('폰 기본 폭 400 (시트: 모바일 400)', SRC.includes('if(w<768)return 400;'), true);
}

console.log('\n시나리오 4 — 말씀 위젯 탭 (뷰탭에서 이동)');
{
  const p = panel('widget');
  sc.eq('뎁스1: 보여줄 항목 (미드·파워)', p.includes('<div class="settings-section" data-lv="mp">'), true);
  sc.eq('뎁스1: 글자 크기 (파워만)', p.includes('<div class="settings-section" data-lv="p">'), true);
  sc.eq('위젯 항목 버튼이 여기로 옮겨왔다', p.includes('setVerseWidgetText') && p.includes('setVWRefSize3'), true);
  sc.eq('본문/장절은 항목 이름 서식(뎁스 규칙)',
        (p.match(/<div class="settings-row-label">(본문|장절)<\/div>/g) || []).length, 2);
}

console.log('\n시나리오 5 — 뷰탭 (순서변경: 할일뷰 → 월간뷰 → 태그 타일뷰)');
{
  const p = panel('view');
  const a = p.indexOf('할일뷰 말씀 표시'), b = p.indexOf('월간 뷰 암송 표시'), c = p.indexOf('태그 타일뷰');
  sc.eq('할일뷰 → 월간뷰 → 태그 타일뷰 순', a >= 0 && a < b && b < c, true);
  // 신규 — 하위 4개의 켬/끔은 그대로 둔 채 통째로 보일지만 정하는 전체 스위치
  sc.eq('전체 스위치(신규)가 있다', p.includes('id="setDviewMarkOn"'), true);
  // v26-0819-3, HB 3-3 — 전체 스위치 줄이 항목 이름(row-label) 대신 소제목(subtitle)
  // 서식으로 바뀌었고, 이지/미드에서는 그 오른쪽에 아이콘 미리보기가 함께 나온다.
  sc.eq('전체 스위치는 모든 등급, 소제목 서식',
        /<div class="settings-subtitle subtitle-lg" style="margin:0;flex:1;">할일뷰에 표시<\/div>/.test(p), true);
  sc.eq('전체 스위치 줄에 아이콘 미리보기(이지·미드 전용)',
        /<span data-lv="em"[^>]*>(<svg[\s\S]*?<\/svg>){4}<\/span>/.test(p), true);
  sc.eq('하위 네 줄은 파워 전용 + 전체 스위치에 딸린 줄',
        (p.match(/data-lv="p" data-cond="dviewMark"/g) || []).length, 4);
  sc.eq('월간 뷰 암송 표시는 파워만',
        /<div class="settings-section" data-lv="p">\s*<div class="settings-section-title">월간 뷰 암송 표시/.test(p), true);
}

console.log('\n시나리오 5-1 — 전체 스위치가 꺼지면 할일뷰에 아무것도 안 그린다');
{
  // 하위 네 개의 저장값은 건드리지 않는다 — 그리기만 건너뛴다
  sc.eq('그리기 직전에 전체 스위치를 읽는다', SRC.includes('const _dvOn=_s.dviewMarkOn!==false;'), true);
  ['Like','Mem','Deeper','Even'].forEach(k=>{
    sc.eq(`${k} 도 전체 스위치를 함께 본다`, SRC.includes(`if(_dvOn&&_s.dviewMark${k}!==false){`), true);
  });
  // ⚠️ 끝 앵커를 '}' 로 주면 (ST.settings||{}) 의 중괄호에서 잘린다
  const fn = slice('function _syncVerseCondRows(){', '// ── "앞의 스위치를 켰을 때만');
  // v26-0819-3, HB 3-2 — 접히던 것을 흐리게(cond-dim)만 하는 것으로 바꿨다
  // (말씀카드 설정 '오른쪽 아래 - 말씀 반응' 과 같은 방식) — 값은 그대로 살아 있다.
  sc.eq('꺼지면 하위 줄을 .cond-dim 으로 흐리게만 한다(접지 않는다)', fn.includes("classList.toggle('cond-dim',!on)"), true);
  sc.eq('예전처럼 통째로 감추던 cond-hide 는 더 이상 안 쓴다', fn.includes('cond-hide'), false);
  sc.eq('등급과 다른 클래스를 써서 둘 중 하나만 풀려도 안 보인다', fn.includes('lv-hide'), false);
}

console.log('\n시나리오 6 — 알림탭 (순서변경 + 성경순 신규)');
{
  const p = panel('alarm');
  const t = p.indexOf('정해진 시각에 알림'), i = p.indexOf('일정 간격으로 알림'),
        d = p.indexOf('>요일<'), o = p.indexOf('어떤 순서로');
  sc.eq('시각 → 간격 → 요일 → 순서', t >= 0 && t < i && i < d && d < o, true);
  sc.eq('요일은 미드·파워', p.includes('<div class="settings-subtitle" data-lv="mp">요일</div>'), true);
  sc.eq('어떤 순서로는 파워만', p.includes('<div class="settings-subtitle" data-lv="p">어떤 순서로</div>'), true);
  sc.eq("'성경순' 신규 옵션", SRC.includes("{v:'bible',l:'성경순'}"), true);
  sc.eq('성경순은 등록순과 좋아요순 사이',
        SRC.indexOf("{v:'added'") < SRC.indexOf("{v:'bible'")
        && SRC.indexOf("{v:'bible'") < SRC.indexOf("{v:'like'"), true);
  sc.eq('간격 기본값 오전 6시~오후 6시 1시간마다',
        SRC.includes("interval:{on:false,from:'06:00',to:'18:00',everyMin:60}"), true);
  // 알림 진단 기록은 개발자 계정에서만 (시트: 이지·미드·파워 모두 X, 개발자 아이디 O)
  sc.eq('진단 기록 줄에 id 를 달았다', p.includes('id="vpDiagRow"'), true);
  sc.eq('개발자 전용 목록에 넣었다',
        SRC.includes("['vpDiagRow'],['vpDiagBody']"), true);
}

console.log('\n시나리오 7 — 전체화면·공유·말씀 모음 탭');
{
  const f = panel('full');
  sc.eq('반응 카운터는 미드·파워',
        /<div class="settings-section" data-lv="mp">\s*<div class="settings-section-title">반응 카운터/.test(f), true);
  sc.eq('링크 열기는 미드·파워',
        /<div class="settings-section" data-lv="mp">\s*<div class="settings-section-title">링크 열기/.test(f), true);

  const sh = panel('share');
  sc.eq("'공유 이미지' > '공유 이미지 요소'",
        sh.includes('<div class="settings-section-title">공유 이미지 요소</div>'), true);
  sc.eq('공유 이미지 크기는 파워만',
        /<div class="settings-section" data-lv="p">\s*<div class="settings-section-title">공유 이미지 크기/.test(sh), true);
  sc.eq("'추가 항목' 소제목 신규", sh.includes('<div class="settings-subtitle subtitle-lg">추가 항목</div>'), true);
  sc.eq("'장절 형식'도 소제목 서식으로", sh.includes('<div class="settings-subtitle subtitle-lg">장절 형식</div>'), true);
  sc.eq('모바일/PC/SNS 도 소제목 서식으로',
        (sh.match(/<div class="settings-subtitle subtitle-lg">(모바일|PC|SNS \(정사각\))<\/div>/g) || []).length, 3);

  const c = panel('coll');
  sc.eq("'말씀 모음 (어느 구절에서 뽑을지)' > '말씀 모음' (뎁스1 제목, 탭 이름은 '말씀모음'으로 붙여씀)",
        c.includes('<div class="settings-section-title">말씀 모음</div>'), true);
  sc.eq('대신 설명 문구로 적었다',
        c.includes('선택한 말씀 모음에서 성경 구절을 뽑아서 알림, 말씀카드, 상단말씀에 사용합니다.'), true);
}

console.log('\n시나리오 8 — 시트가 정한 기본값');
{
  const D = slice('const _settingsDefaults={', '};');
  sc.eq('스닉픽 서식 2번(회색 단색)', D.includes("verseSneakStyle:'mono'"), true);
  sc.eq('스닉픽 모드 본문·장절만 ON',
        D.includes('verseSneakCat:false,verseSneakTopic:false,verseSneakRef:true,verseSneakFirstWord:true,verseSneakTag:false,'), true);
  sc.eq('말씀 위젯 글자 크기 2/2', D.includes('verseWidgetTextSize:2,verseWidgetRefSize:2,'), true);
  sc.eq('할일뷰 말씀 표시 전체 ON + 넷 다 ON',
        D.includes('dviewMarkOn:true,dviewMarkLike:true,dviewMarkMem:true,dviewMarkDeeper:true,dviewMarkEven:true,'), true);
  sc.eq('태그 기준 개수 3', D.includes('vgTagExcludeMax:3'), true);
  sc.eq('전체화면 글자 크기 옵션2', D.includes('vfTextScale:0.6,'), true);
  sc.eq('겹쳐쓰기 2', D.includes('hiOverlap:2,'), true);
  sc.eq('링크 열기 크롬', D.includes("linkOpenMode:'chrome'"), true);
  sc.eq('장절 형식 3가지 모두 옵션1', D.includes("txtRefStyle:'short',txtRefBracket:'square',txtRefPos:'before',"), true);
}

sc.done();
