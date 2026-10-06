// 성경 본문 데이터 (bible/krv/ — 개역한글, v26-1006-4)
//
// 본문은 index.html 에 넣지 않고 책마다 파일 하나로 둔다 (66개 + index.json).
// tools/make-bible.py 가 HB 가 준 원본(CP949 txt)에서 만든다.
// 이 시험은 그 결과물이 앱의 책 순서·장 수 표와 어긋나지 않는지 지킨다 —
// 어긋나면 '사무엘상 31장을 열었는데 없다' 같은 일이 기기에서 처음 드러난다.
const fs = require('fs');
const path = require('path');
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();

eval(slice('const BIBLE_ORDER_OT=', 'let _BIBLE_CHAP_MAP=null;') +
  ';Object.assign(globalThis,{BIBLE_ORDER_OT,BIBLE_ORDER_NT,BIBLE_CHAPTERS_OT,BIBLE_CHAPTERS_NT});');

const DIR = path.join(__dirname, '..', 'bible', 'krv');
const BOOKS = [...BIBLE_ORDER_OT, ...BIBLE_ORDER_NT];
const CHAPS = [...BIBLE_CHAPTERS_OT, ...BIBLE_CHAPTERS_NT];
const ix = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));

console.log('시나리오 1 — 66권이 앱의 순서·장 수와 같다');
{
  sc.eq('index.json 의 책이 66권', ix.books.length, 66);
  sc.eq('index.json 의 책 차례 = BIBLE_ORDER_OT+NT', ix.books.map(b => b.b).join(','), BOOKS.join(','));
  sc.eq('index.json 의 장 수 = BIBLE_CHAPTERS_OT+NT', ix.books.map(b => b.n).join(','), CHAPS.join(','));
  sc.eq('역본 표시', ix.v + '/' + ix.name, 'krv/개역한글');
}

console.log('\n시나리오 2 — 책 파일마다 빈 절·빠진 장이 없다');
{
  let total = 0, bad = [];
  BOOKS.forEach((b, i) => {
    const f = path.join(DIR, String(i + 1).padStart(2, '0') + '.json');
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (d.b !== b) bad.push('책 이름 ' + f + ' ' + d.b);
    if (d.c.length !== CHAPS[i]) bad.push(b + ' 장 수 ' + d.c.length);
    d.c.forEach((ch, ci) => {
      if (ch.length !== ix.books[i].vc[ci]) bad.push(b + ' ' + (ci + 1) + '장 절 수가 index 와 다름');
      ch.forEach((t, vi) => {
        if (typeof t !== 'string' || !t.trim()) bad.push(b + ' ' + (ci + 1) + ':' + (vi + 1) + ' 비었음');
        else if (/\s{2}|^\s|\s$|\d+:\d+ /.test(t)) bad.push(b + ' ' + (ci + 1) + ':' + (vi + 1) + ' 공백·절번호 흔적');
      });
      total += ch.length;
    });
  });
  sc.eq('문제 없음', bad.slice(0, 5).join(' | '), '');
  sc.eq('전체 절 수 = index.total', total, ix.total);
  sc.eq('전체 절 수 31,101 (원본 기준 — 늘거나 줄면 원본을 다시 볼 것)', total, 31101);
}

console.log('\n시나리오 3 — 원본에서 고친 자리 (tools/make-bible.py 의 PATCHES)');
{
  const v = (n, c, s) => JSON.parse(fs.readFileSync(path.join(DIR, String(n).padStart(2, '0') + '.json'), 'utf8')).c[c - 1][s - 1];
  sc.eq('창 1:1', v(1, 1, 1), '태초에 하나님이 천지를 창조하시니라');
  sc.eq('창 19:22 (원본은 21절 번호가 두 번)', v(1, 19, 22).startsWith('그리로 속히 도망하라'), true);
  sc.eq('창 33:9 (원본은 8절에 붙어 있었다)', v(1, 33, 9), '에서가 가로되 내 동생아 내게 있는 것이 족하니 네 소유는 네게 두라');
  sc.eq('삿 9:53 (원본은 52절 번호)', v(7, 9, 53).startsWith('한 여인이 맷돌'), true);
  sc.eq('대상 2:25 (원본은 24절 번호)', v(13, 2, 25).startsWith('헤스론의 맏아들'), true);
  sc.eq('잠 30:32', v(20, 30, 32).startsWith('만일 네가 미련하여'), true);
  sc.eq('전 8:1 (원본은 "8" 만)', v(21, 8, 1).startsWith('지혜자와 같은 자'), true);
  sc.eq('행 23:17 (원본은 22:17)', v(44, 23, 17).startsWith('바울이 한 백부장을'), true);
  sc.eq('강제 줄바꿈이 낱말 가운데서 이어졌다 (시 1:1)', v(19, 1, 1), '복 있는 사람은 악인의 꾀를 좇지 아니하며 죄인의 길에 서지 아니하며 오만한 자의 자리에 앉지 아니하고');
  sc.eq('계 22:21', v(66, 22, 21), '주 예수의 은혜가 모든 자들에게 있을지어다 아멘');
}

console.log('\n시나리오 4 — Sweeter 운영본도 본문을 싣는다');
{
  const sh = fs.readFileSync(path.join(__dirname, '..', 'tools', 'make-sweeter-prod.sh'), 'utf8');
  sc.eq('make-sweeter-prod.sh 가 bible/ 을 build-sweeter 로 복사', /cp -r bible "\$OUT\/bible"/.test(sh), true);
  const wf = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'deploy-sweeter.yml'), 'utf8');
  sc.eq('본문만 바뀌어도 sweeter.my 배포가 돈다', /- 'bible\/\*\*'/.test(wf), true);
}

sc.done();
