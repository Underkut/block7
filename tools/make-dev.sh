#!/usr/bin/env bash
# index.html(운영본) → index-dev.html(개발본) 생성.
#
# 손으로 고치면 빠뜨리기 쉬워서 스크립트로 고정한다. 바꾸는 곳은 네 군데:
#   ① 2번째 줄 주석          [production] → [DEV — no Firebase]
#   ② const DEV_MODE         false → true
#   ③ manifest.json          → manifest-dev.json   (홈화면에 따로 설치되게)
#   ④ apple-mobile-web-app-title  BLOCK7 → BLOCK7 DEV  (아이콘 이름 구분)
#
# ③④ 가 있어야 아이폰 홈화면에 "BLOCK7 DEV" 아이콘을 운영본과 따로 둘 수 있다.
# (없으면 개발본을 홈화면에 추가해도 manifest 의 start_url 때문에 운영본이 열린다)
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f index.html ] || { echo "index.html 이 없습니다"; exit 1; }

python3 - <<'PY'
import io,sys,re

src=io.open('index.html',encoding='utf-8').read()

# ① 2번째 줄 버전 주석
m=re.search(r'^<!-- BLOCK7\s+(v\. \d{2}-\d{4}-\d+)\s+\[production\]\s+-->$',src,re.M)
if not m:
    sys.exit('2번째 줄 버전 주석을 못 찾았습니다. 형식: <!-- BLOCK7  v. YY-MMDD-N  [production]  -->')
ver=m.group(1)
out=src.replace(m.group(0),
    '<!-- BLOCK7  %s  [DEV — no Firebase]  -->'%ver,1)

def sub_once(text,a,b,what):
    if text.count(a)!=1:
        sys.exit('%s: %d곳 발견 (1곳이어야 함)'%(what,text.count(a)))
    return text.replace(a,b,1)

# ② DEV_MODE
out=sub_once(out,'const DEV_MODE = false;','const DEV_MODE = true;','DEV_MODE')
# ③ 개발본 전용 manifest
out=sub_once(out,'<link rel="manifest" href="manifest.json">',
                 '<link rel="manifest" href="manifest-dev.json">','manifest 링크')
# ④ 홈화면 아이콘 이름
out=sub_once(out,'<meta name="apple-mobile-web-app-title" content="BLOCK7">',
                 '<meta name="apple-mobile-web-app-title" content="BLOCK7 DEV">','앱 이름')
# ⑤ 브라우저 탭 제목 — 어느 것이 개발본인지 탭만 보고도 알 수 있게
out=sub_once(out,'<title>BLOCK 7</title>','<title>BLOCK7 DEV</title>','탭 제목')

io.open('index-dev.html','w',encoding='utf-8').write(out)
print('index-dev.html 생성 완료 — %s'%ver)
PY
