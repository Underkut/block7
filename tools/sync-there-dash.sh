#!/usr/bin/env bash
# There 대시보드 덩어리(tools/there-dash.js)를 두 앱에 같은 글자로 넣는다.
#   index.html      — BLOCK7 · Sweeter (넣은 뒤 make-dev.sh · make-sweeter.sh · make-map.sh 도 돌린다)
#   pray/index.html — 기도노트
# 덩어리가 없으면 </body> 바로 앞에 새로 만든다.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - "$@" <<'PY'
import sys, re
src = open('tools/there-dash.js', encoding='utf-8').read()
targets = sys.argv[1:] or ['index.html', 'pray/index.html']
for p in targets:
    s = open(p, encoding='utf-8').read()
    block = '<script id="there-dash">\n' + src + '</script>'
    m = re.search(r'<script id="there-dash">.*?</script>', s, re.S)
    if m:
        s = s[:m.start()] + block + s[m.end():]
    else:
        i = s.rindex('</body>')
        s = s[:i] + block + '\n' + s[i:]
    open(p, 'w', encoding='utf-8').write(s)
    print('there-dash →', p)
PY
