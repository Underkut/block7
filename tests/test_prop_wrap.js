// ── 대표 문구 줄바꿈 규칙 (v26-0913-4, HB) ────────────────────────────
// HB 26-0913 —
//   "대표 문구는 더욱 의미로 끊어야 한다고 생각해.
//    '하나님이 우리를 사랑하시는 이유는' 은
//    '하나님이 / 우리를 사랑하시는 이유' 가 되면 좋겠어."
//   "한쪽이 짧아도 나는 괜찮아. 의미로 끊는 것이 그만큼 중요해."
//   "대표 문구에 '아니라'라는 말이 있거나 ','가 있으면 줄바꿈 하면 돼."
//   "대표문구가 3줄 될 일은 없어. 그렇게 길지 않아."
//
// → 순위: ① 쉼표 뒤  ② '아니라' 뒤  ③ 주어 뒤  ④ 본문 엔진 등급이 가장 높은 자리
//   길이 균형은 **보지 않는다** (한쪽이 짧아도 그대로 둔다).
//
// 그리고 HB 신고 — "한 단어 낱말도 잘라져서 두 글자짜리 낱말인데 한 글자만
//   2행에 위치되는 일이 다반사야." 까닭은 타이핑 모션이었다: 글자마다
//   inline-block 상자를 만드는데 **상자 사이는 어디서나 끊긴다** (CSS 의
//   word-break:keep-all 은 글자 상자에는 통하지 않는다).
const { SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 규칙이 한 곳에 모여 있다');
{
  sc.eq('쉼표 자리', SRC_DEV.includes('const _PT_CUT_COMMA=/[,，]$/;'), true);
  // v26-0913-7, HB — '아니라'·'아닌'은 그 **앞에서** 끊는다 (방향이 바뀌었다)
  sc.eq("'아니라'·'아닌' 자리", SRC_DEV.includes('const _PT_CUT_NOT=/^(아니라|아닌)/;'), true);
  sc.eq('비교의 보다 자리', SRC_DEV.includes('const _PT_CUT_CMP=/.보다$/;'), true);
  sc.eq('부사어는 주어가 아니다', SRC_DEV.includes('const _PT_NOT_SUBJ='), true);
  sc.eq('주어 자리', SRC_DEV.includes('const _PT_CUT_SUBJ=/(이|가|은|는)$/;'), true);
  sc.eq('관형형 거르개가 있다', SRC_DEV.includes('const _PT_ADNOM='), true);
  sc.eq('가르개가 있다', SRC_DEV.includes('function _ptCutTitle(text){'), true);
  // ④ 는 본문 엔진의 등급을 그대로 쓴다 — 점수표를 두 벌 만들지 않는다
  sc.eq('본문 엔진의 등급을 빌려 쓴다',
        /function _ptCutPoint\(words\)\{[\s\S]{0,1600}_PT_BREAK_SCORE\[_vfBreakClass\(/.test(SRC_DEV), true);
}

console.log('\n시나리오 2 — 실제로 돌려 본다 (HB 가 준 예 그대로)');
{
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_CUT_COMMA='),
                            SRC_DEV.indexOf('// 줄 배열을 화면에 얹는다.'));
  if (!src) throw new Error('[테스트] 대표 문구 규칙 구간을 찾지 못했어요.');
  const box = {};
  // 등급은 흉내만 낸다 — 이 시험의 관심사는 **고르는 순위**이지 등급표가 아니다.
  const cls = w => /(고|니|며|면)$/.test(w) ? 'ok' : 'soft';
  const AUX = /^(못|아니|말고|말라|말며|하|버리|주|지|오|가|있|없|보|놓|두|내|드리|계시|싶|만들)/;
  new Function('box', '_vfBreakClass', '_PT_BREAK_SCORE', '_VF_AUX_NEXT',
               src + ';box.cut=_ptCutTitle;box.at=_ptCutPoint;')
    (box, cls, { forced: 4, must: 3, ok: 2, soft: 1, no: 0 }, AUX);

  // ③ 주어 뒤 — HB 가 준 바로 그 예
  sc.eq('주어 뒤에서 끊는다',
        box.cut('하나님이 우리를 사랑하시는 이유는'),
        ['하나님이', '우리를 사랑하시는 이유는']);
  // ⚠️ 한쪽이 아주 짧아도 그대로 둔다 (균형을 보지 않는다 — HB 확인)
  sc.eq('짧아도 무르지 않는다', box.cut('하나님이 우리를 사랑하시는 이유는')[0], '하나님이');

  // ② '아니라' **앞** (v26-0913-7 에 방향이 바뀌었다 — HB 가 준 예 셋이 모두 앞)
  sc.eq("'아니라' 앞에서 끊는다",
        box.cut('우리가 잘나서가 아니라 그분이 먼저 택하셨다'),
        ['우리가 잘나서가', '아니라 그분이 먼저 택하셨다']);
  // '아니라' 는 주어(③)보다 세다 — '우리가' 가 앞에 있어도 '아니라' 가 이긴다
  sc.eq("'아니라' 가 주어보다 앞선다",
        box.cut('우리가 잘나서가 아니라 그분이 먼저 택하셨다')[1].startsWith('아니라'), true);

  // ① 쉼표 뒤 — 가장 세다
  sc.eq('쉼표 뒤에서 끊는다',
        box.cut('주는 나의 목자시니, 내게 부족함이 없으리로다'),
        ['주는 나의 목자시니,', '내게 부족함이 없으리로다']);
  sc.eq('쉼표가 아니라보다 앞선다',
        box.cut('은혜가 아니라, 값없이 주신 선물이다')[0], '은혜가 아니라,');

  // ③ 의 걸림돌 — 관형형('사랑하시는')은 주어가 아니다
  sc.eq('관형형 뒤에서는 안 끊는다',
        box.cut('사랑하시는 하나님이 우리를 부르신다')[0] !== '사랑하시는', true);
  sc.eq('그 대신 진짜 주어 뒤에서',
        box.cut('사랑하시는 하나님이 우리를 부르신다'),
        ['사랑하시는 하나님이', '우리를 부르신다']);

  // 두 줄까지다 — 세 줄로는 안 간다
  const long = '우리가 함께 걸어가며 서로를 돌아보고 마침내 한 몸으로 자라나기까지';
  sc.eq('언제나 두 줄까지', box.cut(long).length <= 2, true);
  sc.eq('글자는 하나도 안 잃는다', box.cut(long).join(' '), long);

  // 낱말이 하나뿐이면 가를 수 없다
  sc.eq('한 낱말은 그대로', box.cut('은혜'), ['은혜']);
  sc.eq('빈 값은 빈 배열', box.cut(''), []);
}

console.log('\n시나리오 2-2 — 끊으면 말이 두 동강 나는 자리 (v26-0913-5, HB)');
{
  // HB 26-0913 신고 —
  //   "현재: 세는 것조차 잊을/만큼        선호: 세는 것조차/잊을 만큼"
  //   "현재: 용서하라/하신 주님을 신뢰합니다  선호: 용서하라 하신 주님을/신뢰합니다"
  // 둘 다 **꾸미는 말과 꾸밈 받는 말이 갈라진** 경우다.
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_CUT_COMMA='),
                            SRC_DEV.indexOf('// 줄 배열을 화면에 얹는다.'));
  const box = {};
  const cls = w => /(고|니|며|면)$/.test(w) ? 'ok' : 'soft';
  const AUX = /^(못|아니|말고|말라|말며|하|버리|주|지|오|가|있|없|보|놓|두|내|드리|계시|싶|만들)/;
  new Function('box', '_vfBreakClass', '_PT_BREAK_SCORE', '_VF_AUX_NEXT',
               src + ';box.cut=_ptCutTitle;box.glued=_ptGlued;')
    (box, cls, { forced: 4, must: 3, ok: 2, soft: 1, no: 0 }, AUX);

  // 나 — 의존명사('만큼'·'것조차')는 앞말과 떼지 않는다
  sc.eq('의존명사를 떼어내지 않는다',
        box.cut('세는 것조차 잊을 만큼'), ['세는 것조차', '잊을 만큼']);
  // 다 — 인용한 말과 인용동사('용서하라 하신')는 붙어 있다
  // 가 — 관형형('하신')은 꾸밈 받는 말('주님을')과 붙어 있다
  sc.eq('인용과 인용동사를 떼지 않는다',
        box.cut('용서하라 하신 주님을 신뢰합니다'), ['용서하라 하신 주님을', '신뢰합니다']);

  // 자리 판정 자체도 확인한다
  sc.eq("'잊을 | 만큼' 은 붙은 자리", box.glued(['잊을', '만큼'], 0), true);
  sc.eq("'세는 | 것조차' 도 붙은 자리", box.glued(['세는', '것조차'], 0), true);
  sc.eq("'용서하라 | 하신' 도 붙은 자리", box.glued(['용서하라', '하신'], 0), true);
  sc.eq("'하신 | 주님을' 도 붙은 자리", box.glued(['하신', '주님을'], 0), true);
  // ⚠️ 우연히 같은 글자로 시작하는 말은 걸리면 안 된다
  sc.eq("'수많은' 은 의존명사가 아니다", box.glued(['받은', '수많은'], 0), false);
  sc.eq("'바라보는' 도 아니다", box.glued(['주를', '바라보는'], 0), false);
  // ⚠️ '내게'(나에게)가 보조용언 '내다'로 걸리면 쉼표 규칙까지 깨진다
  sc.eq("'내게' 는 보조용언이 아니다", box.glued(['목자시니,', '내게'], 0), false);
  sc.eq('그래서 쉼표 규칙이 그대로 산다',
        box.cut('주는 나의 목자시니, 내게 부족함이 없으리로다'),
        ['주는 나의 목자시니,', '내게 부족함이 없으리로다']);

  // 빼고 나서 하나도 안 남으면 예전처럼 전부에서 고른다 — 안 끊기는 일은 없다
  sc.eq('막다른 골목에서도 끊는다', box.cut('잊을 만큼').length, 2);
}

console.log('\n시나리오 2-3 — HB 가 준 예 열 개 (v26-0913-6)');
{
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_CUT_COMMA='),
                            SRC_DEV.indexOf('// ── 정한 줄을 **폭을 아는 자리에서**'));
  if (!src) throw new Error('[테스트] 대표 문구 규칙 구간을 찾지 못했어요.');
  const box = {};
  const cls = w => /(고|니|며|면)$/.test(w) ? 'ok' : 'soft';
  const AUX = /^(못|아니|말고|말라|말며|하|버리|주|지|오|가|있|없|보|놓|두|내|드리|계시|싶|만들)/;
  new Function('box', '_vfBreakClass', '_PT_BREAK_SCORE', '_VF_AUX_NEXT',
               src + ';box.cut=_ptCutTitle;')
    (box, cls, { forced: 4, must: 3, ok: 2, soft: 1, no: 0 }, AUX);

  const want = [
    // [문구, 1행, 2행, 어느 규칙이 잡는가]
    ['세는 것조차 잊을 만큼',            '세는 것조차', '잊을 만큼',            '나: 의존명사 앞'],
    ['하나님을 하나님 때문에',            '하나님을', '하나님 때문에',          '나: 때문에'],
    ['내 손으로는 해하지 않겠다',         '내 손으로는', '해하지 않겠다',        '사: 지+않'],
    ['저 사람이 아니라, 하나님 앞의 나',  '저 사람이 아니라,', '하나님 앞의 나', '①: 쉼표'],
    ['부활이 두려움을 거둔다',            '부활이', '두려움을 거둔다',          '③: 주어'],
    ['용서는 손해가 아니다',              '용서는', '손해가 아니다',            '바: 아니다 앞'],
    ['예수님은 피해자가 아니셨다',        '예수님은', '피해자가 아니셨다',      '바: 아니셨다 앞'],
    ['소비자가 아닌, 하나님 나라의 투자자','소비자가 아닌,', '하나님 나라의 투자자','①: 쉼표'],
    ['우리의 힘보다 하나님의 선의',       '우리의 힘보다', '하나님의 선의',      '②-2: 비교의 보다'],
    // ⚠️ HB — "1행·2행 길이 차이가 많이 나지만 이대로 유지가 좋은 예"
    ['의무로는 만들 수 없는 사랑',        '의무로는 만들 수 없는', '사랑',       '마: 수 뒤 + 부사어는 주어가 아니다'],
  ];
  for (const [t, a, b, why] of want) sc.eq(`${t}  (${why})`, box.cut(t), [a, b]);
}

console.log('\n시나리오 2-4 — HB 가 준 예 넷 (v26-0913-7)');
{
  const src = SRC_DEV.slice(SRC_DEV.indexOf('const _PT_CUT_COMMA='),
                            SRC_DEV.indexOf('// ── 정한 줄을 **폭을 아는 자리에서**'));
  const box = {};
  const cls = w => /(고|니|며|면)$/.test(w) ? 'ok' : 'soft';
  const AUX = /^(못|아니|말고|말라|말며|하|버리|주|지|오|가|있|없|보|놓|두|내|드리|계시|싶|만들)/;
  new Function('box', '_vfBreakClass', '_PT_BREAK_SCORE', '_VF_AUX_NEXT',
               src + ';box.cut=_ptCutTitle;')
    (box, cls, { forced: 4, must: 3, ok: 2, soft: 1, no: 0 }, AUX);

  // ⚠️ ② 의 방향이 바뀌었다 — '아니라' **앞**에서 끊는다.
  //    HB: "기존에 보여준 예시는 주로 '내가' 다음에 끊는 게 맞는데,
  //         이런 경우는 다른 경우로 보여."
  sc.eq('아니라 앞에서 끊는다 ①',
        box.cut('내가 듣고 싶은 말이 아니라'), ['내가 듣고 싶은 말이', '아니라']);
  sc.eq('아니라 앞에서 끊는다 ②',
        box.cut('물의 움직임이 아니라 하나님의 손길이다'),
        ['물의 움직임이', '아니라 하나님의 손길이다']);
  sc.eq('아니라 앞에서 끊는다 ③',
        box.cut('그 사람을 믿어서가 아니라 하나님을 믿어서다'),
        ['그 사람을 믿어서가', '아니라 하나님을 믿어서다']);
  // 아 — 부사 '중히'는 바로 뒤 용언('여긴')을 꾸민다
  sc.eq('부사 뒤에서 안 끊는다',
        box.cut('왕의 생명을 중히 여긴 것 같이'), ['왕의 생명을', '중히 여긴 것 같이']);

  // ⚠️ 쉼표가 붙으면 ① 이 먼저 잡아 **뒤에서** 끊는다 — 둘은 어긋나지 않는다
  sc.eq("'아니라,' 는 여전히 뒤에서",
        box.cut('저 사람이 아니라, 하나님 앞의 나'),
        ['저 사람이 아니라,', '하나님 앞의 나']);
  sc.eq("'아닌,' 도 여전히 뒤에서",
        box.cut('소비자가 아닌, 하나님 나라의 투자자'),
        ['소비자가 아닌,', '하나님 나라의 투자자']);
  // 서술어 '아니다'는 그대로 — 앞에서 끊지 않는다
  sc.eq("'아니다' 앞은 그대로 막는다",
        box.cut('용서는 손해가 아니다'), ['용서는', '손해가 아니다']);
  sc.eq("'아니셨다' 앞도 그대로",
        box.cut('예수님은 피해자가 아니셨다'), ['예수님은', '피해자가 아니셨다']);
}

console.log('\n시나리오 3 — 정한 줄이 화면에 실제로 반영된다 (v26-0913-6, HB)');
{
  // ⚠️⚠️ HB 26-0913 신고 — "쉼표 규칙, '아니라' 규칙이 왜 적용이 안 됐지?"
  //    규칙이 안 걸린 게 아니라 **정한 줄이 화면에 반영되지 않았다.** 차례 탓이다:
  //    대표 문구를 그리는 때에는 아직 상자 폭이 안 잡혀 "한 줄에 들어간다"고
  //    잘못 읽었고, 그 뒤 _vfSizePropTitle 이 글자 크기를 바꾸는데 거기서
  //    줄을 다시 정하는 곳이 없었다. 그래서 브라우저가 아무 자리에서나 접었다.
  sc.eq('줄을 다시 정하는 함수가 있다', SRC_DEV.includes('function _ptRelines(el){'), true);
  // 재는 것은 **글자 폭**이다 — 그려 보고 재면 아직 안 앉은 화면에서 또 틀린다
  sc.eq('글자 폭으로 잰다',
        /function _ptRelines\(el\)\{[\s\S]{0,900}ctx\.measureText\(t\)\.width>availW/.test(SRC_DEV), true);
  sc.eq('상자에서 폭을 얻는다', SRC_DEV.includes('function _ptAvailW(){'), true);
  sc.eq('아직 못 재면 손대지 않는다',
        /function _ptRelines\(el\)\{[\s\S]{0,400}if\(availW<40\)return false;/.test(SRC_DEV), true);
  // ⚠️ 줄이 그대로면 다시 그리지 않는다 — 타이핑 모션이 처음부터 되감긴다
  sc.eq('줄이 같으면 다시 그리지 않는다',
        /now\.every\(\(l,i\)=>l===want\[i\]\)\)return false;/.test(SRC_DEV), true);

  // **폭을 아는 자리**(본문을 앉힌 뒤)에서 반드시 다시 정해야 한다
  const lay = SRC_DEV.slice(SRC_DEV.indexOf("if(el.classList.contains('prop')){"),
                            SRC_DEV.indexOf('function _vfLayoutPropText('));
  sc.eq('본문을 앉힌 뒤 다시 정한다', lay.includes('_ptRelines(ptEl)'), true);
  // 줄이 바뀌면 타이틀 높이가 달라진다 → 본문도 다시 앉힌다
  sc.eq('줄이 바뀌면 본문도 다시 앉힌다', lay.includes('if(ptSized||ptRelined){'), true);

  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle(v){'),
                           SRC_DEV.indexOf('function _vfPropInk(el){'));
  sc.eq('그릴 때도 한 번 정한다', fn.includes('_ptRelines(el);'), true);
  sc.eq('모션을 적어 둔다(다시 그릴 때 같은 모션)', fn.includes('el._motion=motion;'), true);
  // 공유 이미지가 이 배열을 그대로 그린다
  sc.eq('줄 배열을 남긴다', fn.includes('el._lines=[t];'), true);
}

console.log('\n시나리오 4 — 우리가 정한 줄을 <br> 로 못 박는다');
{
  // 그러지 않으면 브라우저가 폭에 맞춰 한 번 더 접어, 의도한 자리와 보이는
  // 자리가 달라진다 (공유 이미지와도 어긋난다).
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _ptPaint(el,lines,motion){'),
                           SRC_DEV.indexOf('function _vfRenderPropTitle(v){'));
  sc.eq('모션이 없으면 그대로 <br>',
        fn.includes("el.innerHTML='<span class=\"pt-w\">'+lines.map(esc).join('<br>')+'</span>';"), true);
  sc.eq('타이핑도 줄마다 <br>', fn.includes(".join('<br>')"), true);
}

console.log('\n시나리오 5 — 타이핑 모션에서 낱말이 쪼개지지 않는다 (HB 26-0913 신고)');
{
  // ⚠️ 글자마다 inline-block 상자를 만들면 **상자 사이가 전부 줄바꿈 자리**가 된다.
  //    CSS 의 word-break:keep-all 은 글자 상자에는 통하지 않는다 — 그래서
  //    두 글자 낱말의 한 글자만 다음 줄로 넘어갔다. 낱말을 상자로 한 번 더 묶는다.
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _ptPaint(el,lines,motion){'),
                           SRC_DEV.indexOf('function _vfRenderPropTitle(v){'));
  sc.eq('낱말마다 상자로 묶는다', fn.includes('<span class="pt-wd">'), true);
  sc.eq('낱말 사이는 띄어쓰기로 남긴다', fn.includes(".join(' ')"), true);
  sc.eq('그 상자가 CSS 에 있다',
        SRC_DEV.includes('.vf-ptitle.pt-motion-typing .pt-wd{display:inline-block;}'), true);
  // 글자 상자는 그대로 살아 있어야 한다 (한 글자씩 떠오르는 효과 자체)
  sc.eq('글자 상자는 그대로', SRC_DEV.includes('.vf-ptitle.pt-motion-typing .pt-ch{display:inline-block;'), true);
}

sc.done();
