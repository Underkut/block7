#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# index.html 구역 지도 생성기 → docs/MAP.md
#
# 왜 있나: index.html 은 146만 자라 어떤 도구도 통째로 읽지 못한다.
# 그래서 매번 grep 으로 자리를 찾는데, "무엇으로 grep 할지"를 모르면 헤맨다.
# 이 스크립트가 파일 안의 구역 표시 주석과 함수 이름을 뽑아 지도를 만든다.
#
# ⚠️ 줄 번호는 편집 한 번에 전부 밀린다. 지도에서 믿을 것은 **grep 키워드**다.
#    줄 번호는 "대략 어디쯤"을 가늠하는 용도로만 쓴다.
import io, re, sys, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC_PATH = os.path.join(ROOT, 'index.html')
OUT_PATH = os.path.join(ROOT, 'docs', 'MAP.md')

if not os.path.exists(SRC_PATH):
    sys.exit('index.html 이 없습니다. 저장소 최상위에서 ./tools/make-map.sh 로 실행하세요.')

src = io.open(SRC_PATH, encoding='utf-8').read()
lines = src.split('\n')
N = len(lines)

m = re.search(r'APP_VERSION\s*=\s*"([^"]+)"', src)
version = m.group(1) if m else '(버전 불명)'

# ── 1. 큰 덩어리 경계 찾기 ──────────────────────────────────────────
# <style>/<script> 여는 줄과 닫는 줄을 훑어 구간을 만든다.
blocks = []          # (시작줄, 끝줄, 종류)
open_tag = None
for i, ln in enumerate(lines, 1):
    s = ln.strip()
    if open_tag is None:
        if s.startswith('<style'):
            open_tag = (i, 'CSS')
        elif s.startswith('<script') and not s.endswith('</script>') and 'src=' not in s:
            open_tag = (i, 'JS')
    else:
        if (open_tag[1] == 'CSS' and '</style>' in s) or (open_tag[1] == 'JS' and '</script>' in s):
            blocks.append((open_tag[0], i, open_tag[1]))
            open_tag = None

def kind_at(lineno):
    for a, b, k in blocks:
        if a <= lineno <= b:
            return k
    return 'HTML'

# ── 2. 구역 표시 주석 뽑기 ──────────────────────────────────────────
# CSS:  /* ── 이름 ── */      JS:  // ── 이름 ──
# 이 저장소는 오래전부터 이 서식을 써 왔다. 여러 줄로 이어지는 것도 첫 줄만 쓴다.
SEC_RE = re.compile(r'^\s*(?:/\*|//)\s*[─━=]{2,}\s*(.+?)\s*(?:[─━=]{2,}.*)?$')
sections = []        # (줄번호, 이름, 종류)
for i, ln in enumerate(lines, 1):
    mm = SEC_RE.match(ln)
    if not mm:
        continue
    name = mm.group(1).strip().rstrip('*/').strip()
    name = re.sub(r'[─━=]+$', '', name).strip()
    if not name or len(name) > 90:
        continue
    sections.append((i, name, kind_at(i)))

# ── 3. 함수 이름 뽑기 ───────────────────────────────────────────────
# 들여쓰기 2칸 이하만 센다 — 함수 **안**에 있는 임시 변수(`const p = (` 같은 것)까지
# 세면 지도가 잡음으로 뒤덮인다. 바깥에 있는 것만이 다른 곳에서 부를 수 있는 이름이다.
FUNC_RES = [
    re.compile(r'^(\s*)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\('),
    re.compile(r'^(\s*)(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\()'),
    re.compile(r'^(\s*)window\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b'),
]
funcs = []           # (줄번호, 이름)
for i, ln in enumerate(lines, 1):
    if kind_at(i) != 'JS':
        continue
    for r in FUNC_RES:
        mm = r.match(ln)
        if mm:
            if len(mm.group(1)) <= 2:
                funcs.append((i, mm.group(2)))
            break

# 각 함수를 바로 앞 구역에 붙인다
sec_starts = [s[0] for s in sections]
def owner_of(lineno):
    lo, hi, best = 0, len(sec_starts) - 1, None
    while lo <= hi:
        mid = (lo + hi) // 2
        if sec_starts[mid] <= lineno:
            best = mid; lo = mid + 1
        else:
            hi = mid - 1
    return best

owned = {}
for ln_no, name in funcs:
    k = owner_of(ln_no)
    owned.setdefault(k, []).append(name)

# ── 4. 문서 쓰기 ────────────────────────────────────────────────────
def fmt(n): return '{:,}'.format(n)

out = []
w = out.append
w('# index.html 구역 지도')
w('')
w('> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**')
w('> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.')
w('')
w('기준 버전 **%s** · 전체 %s줄 · 구역 %d개 · 함수 %d개' % (version, fmt(N), len(sections), len(funcs)))
w('')
w('---')
w('')
w('## 이 문서를 쓰는 법')
w('')
w('index.html 은 146만 자라 **통째로 읽으면 안 됩니다.** 고칠 자리를 찾는 순서:')
w('')
w('1. 아래 목록에서 고치려는 기능의 **구역 이름**이나 **함수 이름**을 찾는다')
w('2. 그 이름으로 `grep -n` 한다 — 구역 이름은 주석에 그대로 들어 있어 한 번에 걸린다')
w('3. 걸린 줄 앞뒤 필요한 만큼만 읽는다')
w('')
w('**줄 번호는 편집 한 번에 전부 밀립니다.** 여기 적힌 번호는 "대략 어디쯤"을 가늠하는')
w('용도이지, 그 줄을 바로 열라는 뜻이 아닙니다. 믿을 것은 이름(grep 키워드)입니다.')
w('')
w('---')
w('')
w('## 1. 큰 덩어리')
w('')
w('| 대략 줄 | 분량 | 종류 | 무엇이 있나 |')
w('|---|---|---|---|')
DESC = {
    'CSS': '화면 꾸미기 (색·크기·배치)',
    'JS': '동작 (자바스크립트)',
}
prev_end = 0
rows = []
for a, b, k in blocks:
    if a - prev_end > 1:
        rows.append((prev_end + 1, a - 1, 'HTML'))
    rows.append((a, b, k))
    prev_end = b
if prev_end < N:
    rows.append((prev_end + 1, N, 'HTML'))
for a, b, k in rows:
    size = b - a + 1
    if size < 20:
        continue
    pct = round(size * 100.0 / N)
    desc = DESC.get(k, '화면 뼈대 (버튼·팝업의 HTML)')
    w('| %s~%s | %s줄 (%d%%) | %s | %s |' % (fmt(a), fmt(b), fmt(size), pct, k, desc))
w('')
w('---')
w('')

for kind, title, note in [
    ('CSS', '2. 꾸미기(CSS) 구역', '색·크기·배치를 고칠 때 여기서 찾습니다.'),
    ('HTML', '3. 화면 뼈대(HTML) 구역', '버튼·팝업 자체를 넣고 뺄 때 여기서 찾습니다.'),
    ('JS', '4. 동작(JS) 구역', '기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.'),
]:
    picked = [(i, (idx, nm)) for idx, (i, nm, k) in enumerate(sections) if k == kind]
    if not picked:
        continue
    w('## %s' % title)
    w('')
    w(note)
    w('')
    if kind == 'JS':
        w('| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |')
        w('|---|---|---|')
        for ln_no, (idx, nm) in picked:
            fl = owned.get(idx, [])
            shown = ', '.join('`%s`' % f for f in fl[:14])
            if len(fl) > 14:
                shown += ' … 외 %d개' % (len(fl) - 14)
            w('| %s | %s | %s |' % (fmt(ln_no), nm.replace('|', '\\|'), shown or '–'))
    else:
        w('| 대략 줄 | 구역 (grep 키워드) |')
        w('|---|---|')
        for ln_no, (idx, nm) in picked:
            w('| %s | %s |' % (fmt(ln_no), nm.replace('|', '\\|')))
    w('')
    w('---')
    w('')

w('## 5. 함수 이름 색인')
w('')
w('찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.')
w('')
by_name = sorted(set(n for _, n in funcs), key=lambda s: s.lower())
per_line = 6
for i in range(0, len(by_name), per_line):
    w('  '.join('`%s`' % n for n in by_name[i:i + per_line]))
w('')

io.open(OUT_PATH, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('docs/MAP.md 생성 완료 — %s · 구역 %d개 · 함수 %d개' % (version, len(sections), len(funcs)))
