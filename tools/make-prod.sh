#!/usr/bin/env bash
# index-dev.html(개발본) → index.html(운영본) 되돌리기. make-dev.sh 의 반대.
#
# 왜 필요한가:
#   운영본은 "HB가 개발본으로 확인한 뒤에만" 커밋한다(CLAUDE.md 규칙). 그래서
#   확인을 기다리는 동안 index.html 이 커밋되지 않은 채 작업 폴더에만 남는데,
#   세션이 끝나면 그 폴더는 사라진다. 그때 이 스크립트로 개발본에서 그대로
#   되살린다 — 두 파일은 아래 네 곳만 다르기 때문에 손실이 없다.
#
# 쓰는 법:  ./tools/make-prod.sh      → index.html 을 개발본 내용으로 다시 만든다
#           그 뒤 ./tools/check.sh 로 확인할 것.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f index-dev.html ] || { echo "index-dev.html 이 없습니다"; exit 1; }

python3 - <<'PY'
import io,sys,re

src=io.open('index-dev.html',encoding='utf-8').read()

m=re.search(r'^<!-- BLOCK7\s+(v\. \d{2}-\d{4}-\d+)\s+\[DEV — no Firebase\]\s+-->$',src,re.M)
if not m:
    sys.exit('2번째 줄 버전 주석을 못 찾았습니다. 형식: <!-- BLOCK7  v. YY-MMDD-N  [DEV — no Firebase]  -->')
ver=m.group(1)
out=src.replace(m.group(0),'<!-- BLOCK7  %s  [production]  -->'%ver,1)

def sub_once(text,a,b,what):
    if text.count(a)!=1:
        sys.exit('%s: %d곳 발견 (1곳이어야 함)'%(what,text.count(a)))
    return text.replace(a,b,1)

out=sub_once(out,'const DEV_MODE = true;','const DEV_MODE = false;','DEV_MODE')
out=sub_once(out,'<link rel="manifest" href="manifest-dev.json">',
                 '<link rel="manifest" href="manifest.json">','manifest 링크')
out=sub_once(out,'<meta name="apple-mobile-web-app-title" content="BLOCK7 DEV">',
                 '<meta name="apple-mobile-web-app-title" content="BLOCK7">','앱 이름')
out=sub_once(out,'<title>BLOCK7 DEV</title>','<title>BLOCK 7</title>','탭 제목')

io.open('index.html','w',encoding='utf-8').write(out)
print('index.html 생성 완료 — %s'%ver)
PY
