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
  sc.eq("'아니라' 자리", SRC_DEV.includes('const _PT_CUT_NOT=/아니라[,，]?$/;'), true);
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
  new Function('box', '_vfBreakClass', '_PT_BREAK_SCORE',
               src + ';box.cut=_ptCutTitle;box.at=_ptCutPoint;')
    (box, cls, { forced: 4, must: 3, ok: 2, soft: 1, no: 0 });

  // ③ 주어 뒤 — HB 가 준 바로 그 예
  sc.eq('주어 뒤에서 끊는다',
        box.cut('하나님이 우리를 사랑하시는 이유는'),
        ['하나님이', '우리를 사랑하시는 이유는']);
  // ⚠️ 한쪽이 아주 짧아도 그대로 둔다 (균형을 보지 않는다 — HB 확인)
  sc.eq('짧아도 무르지 않는다', box.cut('하나님이 우리를 사랑하시는 이유는')[0], '하나님이');

  // ② '아니라' 뒤
  sc.eq("'아니라' 뒤에서 끊는다",
        box.cut('우리가 잘나서가 아니라 그분이 먼저 택하셨다'),
        ['우리가 잘나서가 아니라', '그분이 먼저 택하셨다']);
  // '아니라' 는 주어(③)보다 세다 — '우리가' 가 앞에 있어도 '아니라' 가 이긴다
  sc.eq("'아니라' 가 주어보다 앞선다",
        box.cut('우리가 잘나서가 아니라 그분이 먼저 택하셨다')[0].endsWith('아니라'), true);

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

console.log('\n시나리오 3 — 한 줄에 들어가면 끊지 않는다 (앉혀 보고 정한다)');
{
  const fn = SRC_DEV.slice(SRC_DEV.indexOf('function _vfRenderPropTitle(v){'),
                           SRC_DEV.indexOf('function _vfPropInk(el){'));
  // ⚠️ 글자 수로 셈하면 안 된다 — 글씨가 커서 일고여덟 자만 넘어도 접힌다.
  //    한 줄로 그려 크기를 잡아 보고, **그래도 넘칠 때만** 가른다.
  sc.eq('한 줄로 먼저 그린다', fn.includes('let lines=[t];'), true);
  sc.eq('그려 보고 잰다', fn.includes('if(_ptDrawnLines(el)>1){'), true);
  sc.eq('그때만 가른다', fn.includes('const cut=_ptCutTitle(t);'), true);
  sc.eq('가른 뒤 크기를 다시 잡는다',
        /lines=cut;\s*\n\s*_ptPaint\(el,lines,motion\);\s*\n\s*_vfSizePropTitle\(/.test(fn), true);
  // 공유 이미지가 이 배열을 그대로 그린다
  sc.eq('줄 배열을 남긴다', fn.includes('el._lines=lines;'), true);
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
