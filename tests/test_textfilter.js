// D뷰 맨 끝 깔때기 단추 — 설정에 적은 글자(@이름 포함)가 든 할일만 보이게 한다 (v. 26-1112-10).
// 지어낸 이름만 쓴다.
const { SRC, makeScorer, slice } = require('./_load');
const sc = makeScorer();

eval(slice('function _textFilterTerms(q){', '// ═══════ 하위 할일(subs) · 메모(memo)'));

console.log('시나리오 1 — 글자 풀이: 쉼표로 가르고 빈 칸은 버린다');
sc.eq('한 개', _textFilterTerms('심방'), ['심방']);
sc.eq('여러 개(반각·전각 쉼표) · 공백 정리', _textFilterTerms(' @홍길동 , 심방，  '), ['@홍길동', '심방']);
sc.eq('비었거나 없으면 빈 목록', [_textFilterTerms(''), _textFilterTerms(null), _textFilterTerms(undefined), _textFilterTerms(' , ')], [[], [], [], []]);
sc.eq('영문은 소문자로', _textFilterTerms('Call'), ['call']);

console.log('시나리오 2 — 판정: 제목 · 메모에 들어 있으면 통과');
const A = { text: '@홍길동 전화하기' }, B = { text: '장보기' }, C = { text: '병원', memo: '홍길동 어머니 안부' };
sc.eq('@이름 이 든 제목 (이름만 적어도)', _textFilterPass(A, '홍길동'), true);
sc.eq('@ 붙여 적어도', _textFilterPass(A, '@홍길동'), true);
sc.eq('안 든 제목은 가려진다', _textFilterPass(B, '홍길동'), false);
sc.eq('메모에 든 것도 통과', _textFilterPass(C, '홍길동'), true);
sc.eq('@ 붙인 글자는 메모의 이름만으로는 안 맞는다(@ 가 없으므로)', _textFilterPass(C, '@홍길동'), false);
sc.eq('여러 개는 하나만 맞아도 통과(또는)', [_textFilterPass(A, '장보기, @홍길동'), _textFilterPass(B, '장보기, @홍길동'), _textFilterPass(C, '심방, 장보기')], [true, true, false]);
sc.eq('영문 대소문자 안 가림', _textFilterPass({ text: 'Call Mom' }, 'call'), true);
sc.eq('글자가 비면 모두 통과', [_textFilterPass(B, ''), _textFilterPass(B, '  '), _textFilterPass(B, null)], [true, true, true]);
sc.eq('이상한 항목은 가려지고 터지지 않는다', [_textFilterPass(null, '가'), _textFilterPass(undefined, '가'), _textFilterPass({}, '가')], [false, false, false]);
sc.eq('항목을 고치지 않는다', JSON.stringify(A), JSON.stringify({ text: '@홍길동 전화하기' }));

console.log('시나리오 3 — 단추 · 설정이 끝까지 이어져 있다 (글자 점검)');
sc.eq('필터 판정이 taskMarkerFilterPass 에 이어짐', /markerFilter==='text'\)return _textFilterPass\(item,ST\.settings&&ST\.settings\.textFilterQuery\)/.test(SRC), true);
sc.eq('단추는 설정이 켜졌을 때만, 단추 줄 맨 끝(연락 단추 뒤 · 구분선 앞)',
  /showContactFilterBtn===true\)\{[\s\S]{0,900}showTextFilterBtn===true\)\{[\s\S]{0,1700}const sep=document\.createElement\('div'\);sep\.className='preset-sep'/.test(SRC), true);
sc.eq('단추 기본 꺼짐 · 글자 기본 빈 칸', /showTextFilterBtn:false,textFilterQuery:'',/.test(SRC), true);
sc.eq('설정창: 미드·파워에만 (이지 X)', /data-lv="mp">\s*<div class="settings-row-text"><div class="settings-row-label"><span class="preset-btn btnprev">[\s\S]{0,300}id="setShowTextFilterBtn"/.test(SRC), true);
sc.eq('설정창: 글자 입력칸', /id="setTextFilterQuery"[^>]*onchange="updateSetting\('textFilterQuery',this\.value\)"/.test(SRC), true);
sc.eq('깔때기는 채워진 모양(fill=currentColor)', /btn\.id='btnTextFilter'[\s\S]{0,1100}fill="currentColor" stroke="none"><path d="M3 4\.5h18/.test(SRC), true);
sc.eq('구간을 손으로 켜고 꺼도 깔때기는 안 풀린다', /preset!=='contactFilter'&&ST\.preset!=='textFilter'\)ST\.preset=null/.test(SRC), true);
sc.eq('단추를 감추면 거르기도 풀린다', /key==='showTextFilterBtn'&&!value&&ST\.preset==='textFilter'/.test(SRC), true);

console.log('시나리오 4 — 이 기능은 데이터 계층을 건드리지 않는다');
sc.eq('필터 함수 안에 저장 호출이 없다', /save\(|rawSave\(/.test(slice('function _textFilterTerms(q){', '// ═══════ 하위 할일(subs) · 메모(memo)')), false);

sc.done();
