// 강조 표시 — 구글 시트 '강조 문구' 열을 본문에 칠한다 (작업 중, v26-0812-6+)
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
  ';Object.assign(globalThis,{HI_SPLIT,HI_STYLES,_hiPhrases,_hiSquash,_hiRanges,' +
  '_hiLinesHTML,_hiOn,_hiStyle});'
);

const TEXT = '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라';
const marks = html => (html.match(/<span class="hi-mark">(.*?)<\/span>/g) || [])
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

// ═══ 6. 켜고 끄기 · 보기 방식 ═══
console.log('\n시나리오 6 — 설정');
{
  ST.settings = {};
  sc.eq('처음엔 켜져 있다', _hiOn(), true);
  ST.settings.hiOn = false;
  sc.eq('끄면 꺼진다', _hiOn(), false);
  ST.settings.hiOn = true;
  sc.eq('다시 켜면 켜진다', _hiOn(), true);

  ST.settings = {};
  sc.eq('기본 보기 방식', _hiStyle(), 'u1');
  ST.settings.hiStyle = 'bold';
  sc.eq('고르면 그것', _hiStyle(), 'bold');
  ST.settings.hiStyle = '없는것';
  sc.eq('모르는 값이면 기본으로', _hiStyle(), 'u1');
  sc.eq('고를 수 있는 것들', HI_STYLES, ['u1', 'u2', 'u3', 'pen', 'bold']);
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
        /html\[data-histyle="pen"\] \.hi-mark\{[^}]*padding:/.test(SRC), false);
}

sc.done();
