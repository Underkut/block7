#!/usr/bin/env bash
# index.html(운영본) → sweeter-dev.html (Sweeter 개발본) 생성.
#
# Sweeter 는 BLOCK7 과 **같은 코드**에서 뽑아내는 말씀 전용 제품이다.
# 손으로 만들면 빠뜨리기 쉬워서 make-dev.sh 와 같은 방식으로 고정한다.
#
# 바꾸는 곳 다섯 군데:
#   ① 2번째 줄 주석          [production] → [SWEETER DEV]
#   ② const APP_PRODUCT      block7 → sweeter (설정 칸막이가 여기서 깨어난다)
#   ③ manifest.json          → manifest-sweeter-dev.json
#   ④ apple-mobile-web-app-title  BLOCK7 → Sweeter DEV
#   ⑤ <title>                → Sweeter DEV
#
# ② 가 핵심이다. 이 한 줄로 LS_KEY 가 'b7v1_sweeter' 로 갈리고,
# 설정 칸막이(_psOverlay·_psProject)가 깨어난다.
#
# ⚠️ DEV_MODE 는 **건드리지 않는다**(false 그대로) — 즉 Sweeter 개발본도
#    Firebase 에 붙는다 (v26-0830-16, HB 승인). 로그인해야 HB 가 실제로 쓰는
#    말씀모음이 보이기 때문이다. 클라우드 문서는 BLOCK7 과 **같은 한 통**
#    (users/{uid}/data/state) 이고, 제품마다 갈라야 할 설정만
#    _PRODUCT_SCOPED 가 productSettings 안으로 나눠 담는다.
#    알림(notify·verseAlarm)은 제품별로 갈려 있어 기본이 꺼짐이다 —
#    Sweeter 를 켰다고 푸시가 두 번 오지 않는다.
#
# ⚠️ 운영본(sweeter.html)은 아직 만들지 않는다. sweeter.my 도메인이 준비되고
#    HB 가 개발본으로 확인한 뒤에 이 스크립트에 더한다.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f index.html ] || { echo "index.html 이 없습니다"; exit 1; }

python3 - <<'PY'
import io,sys,re

src=io.open('index.html',encoding='utf-8').read()

m=re.search(r'^<!-- BLOCK7\s+(v\. \d{2}-\d{4}-\d+)\s+\[production\]\s+-->$',src,re.M)
if not m:
    sys.exit('2번째 줄 버전 주석을 못 찾았습니다. 형식: <!-- BLOCK7  v. YY-MMDD-N  [production]  -->')
ver=m.group(1)
out=src.replace(m.group(0),
    '<!-- BLOCK7  %s  [SWEETER DEV]  -->'%ver,1)

def sub_once(text,a,b,what):
    if text.count(a)!=1:
        sys.exit('%s: %d곳 발견 (1곳이어야 함)'%(what,text.count(a)))
    return text.replace(a,b,1)

out=sub_once(out,'const APP_PRODUCT = "block7";','const APP_PRODUCT = "sweeter";','APP_PRODUCT')
out=sub_once(out,'<link rel="manifest" href="manifest.json">',
                 '<link rel="manifest" href="manifest-sweeter-dev.json">','manifest 링크')
out=sub_once(out,'<meta name="apple-mobile-web-app-title" content="BLOCK7">',
                 '<meta name="apple-mobile-web-app-title" content="Sweeter DEV">','앱 이름')
out=sub_once(out,'<title>BLOCK 7</title>','<title>Sweeter DEV</title>','탭 제목')

io.open('sweeter-dev.html','w',encoding='utf-8').write(out)
print('sweeter-dev.html 생성 완료 — %s'%ver)
PY
