#!/usr/bin/env python3
# 개역한글 본문(HB 가 준 66개 txt, CP949) → bible/krv/  (앱이 읽는 JSON)
#
#   python3 tools/make-bible.py <원본 폴더 또는 .zip>
#
# 원본은 저장소에 넣지 않는다 (2026-10-06 HB 가 대화창으로 준 zip).
# 결과물 bible/krv/ 만 커밋한다. 다시 돌릴 일은 원본을 고칠 때뿐이다.
#
# 원본 모양:  1번째 줄 = 책 이름,  "장:절 본문" 한 줄에 한 절.
#   ⚠️ 긴 절은 약 96바이트에서 **낱말 한가운데서도** 강제로 줄이 바뀌어 있다
#      ("아\n니하고"). 낱말 사이에서 끊긴 곳은 앞줄 끝에 공백이 남아 있다.
#      → 이어지는 줄은 공백 없이 그대로 붙인다. 겹공백은 하나로.
#
# 만드는 것:
#   bible/krv/01.json … 66.json   {"b":"창세기","c":[["1절","2절",…],…]}  c[장-1][절-1]
#   bible/krv/index.json          {"v":"krv","name":"개역한글","books":[{"b","n":장수,"vc":[장별 절 수]}…]}
#
# ⛔️ 원본에서 틀린 곳은 아래 PATCHES 에서만 고친다. 각 줄이 **정확히 한 번**
#    맞아야 하고, 안 맞으면 멈춘다 (원본이 바뀌었는데 조용히 넘어가지 않게).
import io, os, re, sys, json, zipfile

OT = ['창세기','출애굽기','레위기','민수기','신명기','여호수아','사사기','룻기','사무엘상','사무엘하','열왕기상','열왕기하','역대상','역대하','에스라','느헤미야','에스더','욥기','시편','잠언','전도서','아가','이사야','예레미야','예레미야애가','에스겔','다니엘','호세아','요엘','아모스','오바댜','요나','미가','나훔','하박국','스바냐','학개','스가랴','말라기']
NT = ['마태복음','마가복음','누가복음','요한복음','사도행전','로마서','고린도전서','고린도후서','갈라디아서','에베소서','빌립보서','골로새서','데살로니가전서','데살로니가후서','디모데전서','디모데후서','디도서','빌레몬서','히브리서','야고보서','베드로전서','베드로후서','요한1서','요한2서','요한3서','유다서','요한계시록']
BOOKS = OT + NT
# index.html 의 BIBLE_CHAPTERS_OT/NT 와 같은 값 (tests/test_bible_data.js 가 둘을 대조한다)
CHAPTERS = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,
            28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22]

# (책, 원본 줄이 이렇게 시작하면, 이 줄들로 바꾼다)
# 원본 줄 = 강제 줄바꿈을 이어 붙이기 **전**의 첫 줄. 바꾼 결과는 여러 줄이어도 된다.
PATCHES = [
    # 같은 절 번호가 두 번 — 두 번째가 22절
    ('창세기', '19:21 그리로 속희 도망하라', ['19:22 그리로 속히 도망하라']),
    # 8절과 9절이 한 줄에 붙어 있다
    ('창세기', '33:8 에서가 또 가로되', None),   # 아래 SPLITS 에서 나눈다
    # 52절 본문이 통째로 빠지고 53절이 52절 번호를 달고 있다.
    # ⚠️ 빠진 52절은 원본에 없어 채워 넣은 것이다 — HB 확인 필요 (ROADMAP 참고)
    ('사사기', '9:52 한 여인이 맷돌', ['9:52 아비멜렉이 망대 앞에 이르러 쳐서 망대 문에 가까이 나아가서 그것을 불사르려 하더니',
                                   '9:53 한 여인이 맷돌']),
    # 24절 본문이 통째로 빠지고 25절이 24절 번호를 달고 있다. (위와 같이 HB 확인 필요)
    ('역대상', '2:24 헤스론의 맏아들', ['2:24 갈렙이 갈렙 에브라다에서 죽은 후에 헤스론의 아내 아비야가 저로 말미암아 아스훌을 낳았으니 저는 드고아의 아비며',
                                    '2:25 헤스론의 맏아들']),
    ('잠언', '30:31 만일 네가 미련하여', ['30:32 만일 네가 미련하여']),
    ('전도서', '8 지혜자와 같은 자', ['8:1 지혜자와 같은 자']),
    ('사도행전', '22:17 바울이 한 백부장을', ['23:17 바울이 한 백부장을']),
]
# 이어 붙인 뒤의 절 하나를 둘로 나눈다: (책, 장, 절, 이 글자 앞에서 끊는다)
SPLITS = [
    ('창세기', 33, 8, '에서가 가로되 내 동생아'),
]
# 이어 붙인 뒤의 글자 고치기: (책, 장, 절, 틀린 것, 바른 것)
FIXES = [
    ('창세기', 33, 9, '네게두라', '네게 두라'),
]

VRE = re.compile(r'^(\d+):(\d+) +(.*)$')


def read_sources(src):
    out = {}
    if os.path.isdir(src):
        for fn in os.listdir(src):
            if fn.lower().endswith('.txt'):
                out[fn[:2]] = open(os.path.join(src, fn), 'rb').read()
    else:
        with zipfile.ZipFile(src) as z:
            for info in z.infolist():
                fn = os.path.basename(info.filename)
                if fn.lower().endswith('.txt'):
                    out[fn[:2]] = z.read(info)
    return out


def main():
    if len(sys.argv) != 2:
        sys.exit('쓰는 법: python3 tools/make-bible.py <원본 폴더 또는 .zip>')
    raw = read_sources(sys.argv[1])
    if sorted(raw) != ['%02d' % i for i in range(1, 67)]:
        sys.exit('66권(01~66)이 아닙니다: %s' % sorted(raw))
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    out_dir = os.path.join(root, 'bible', 'krv')
    os.makedirs(out_dir, exist_ok=True)

    used = [0] * len(PATCHES)
    index = []
    total = 0
    problems = []
    for bi, book in enumerate(BOOKS):
        lines = raw['%02d' % (bi + 1)].decode('cp949').split('\r\n')
        # 1번째 줄 책 이름 (요한1서는 원본에 '요한일서', 열왕기상은 '열왕기 상')
        t = lines[0].replace(' ', '').replace('일서', '1서').replace('이서', '2서').replace('삼서', '3서')
        if t != book:
            problems.append('책 이름이 다름: %s ↔ %s' % (book, lines[0]))
        fixed = []
        for ln in lines[1:]:
            for pi, (pb, pre, rep) in enumerate(PATCHES):
                if pb == book and ln.startswith(pre):
                    used[pi] += 1
                    if rep is not None:
                        ln = '\n'.join(rep[:-1] + [rep[-1] + ln[len(pre):]]) if rep else ln
            fixed.extend(ln.split('\n'))
        chapters = {}
        cur = None
        for ln in fixed:
            if not ln.strip():
                continue
            m = VRE.match(ln)
            if m:
                c, v = int(m.group(1)), int(m.group(2))
                if v in chapters.setdefault(c, {}):
                    problems.append('같은 절이 두 번: %s %d:%d' % (book, c, v))
                cur = [m.group(3)]
                chapters[c][v] = cur
            else:
                if cur is None:
                    problems.append('절 번호 없는 줄: %s %r' % (book, ln[:30]))
                    continue
                cur[0] += ln
        for (sb, c, v, at) in SPLITS:
            if sb != book:
                continue
            txt = chapters[c][v][0]
            if txt.count(at) != 1:
                sys.exit('나눌 자리를 못 찾음: %s %d:%d %r' % (sb, c, v, at))
            if v + 1 in chapters[c]:
                sys.exit('나눌 자리 뒤 절이 이미 있음: %s %d:%d' % (sb, c, v + 1))
            k = txt.index(at)
            chapters[c][v] = [txt[:k]]
            chapters[c][v + 1] = [txt[k:]]
        cs = []
        if sorted(chapters) != list(range(1, CHAPTERS[bi] + 1)):
            problems.append('장 수가 다름: %s %d ↔ %d' % (book, len(chapters), CHAPTERS[bi]))
        for c in sorted(chapters):
            vs = chapters[c]
            if sorted(vs) != list(range(1, max(vs) + 1)):
                missing = sorted(set(range(1, max(vs) + 1)) - set(vs))
                problems.append('빠진 절: %s %d장 %s' % (book, c, missing))
            arr = []
            for v in range(1, max(vs) + 1):
                txt = re.sub(r'\s+', ' ', vs.get(v, [''])[0]).strip()
                for (fb, fc, fv, a, b) in FIXES:
                    if fb == book and fc == c and fv == v:
                        if txt.count(a) != 1:
                            sys.exit('고칠 글자를 못 찾음: %s %d:%d %r' % (fb, fc, fv, a))
                        txt = txt.replace(a, b)
                if not txt:
                    problems.append('빈 절: %s %d:%d' % (book, c, v))
                arr.append(txt)
            cs.append(arr)
        total += sum(len(a) for a in cs)
        index.append({'b': book, 'n': len(cs), 'vc': [len(a) for a in cs]})
        with io.open(os.path.join(out_dir, '%02d.json' % (bi + 1)), 'w', encoding='utf-8', newline='\n') as f:
            json.dump({'b': book, 'c': cs}, f, ensure_ascii=False, separators=(',', ':'))
            f.write('\n')
    for pi, n in enumerate(used):
        if n != 1:
            problems.append('고침 %r 이 %d번 맞음 (1번이어야 함)' % (PATCHES[pi][:2], n))
    if problems:
        for p in problems:
            print('✗', p)
        sys.exit('원본에 손볼 곳이 남았습니다 — 위 목록')
    with io.open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'v': 'krv', 'name': '개역한글', 'total': total, 'books': index},
                  f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print('bible/krv/ — 66권 · %d절' % total)


if __name__ == '__main__':
    main()
