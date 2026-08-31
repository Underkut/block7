#!/usr/bin/env bash
# index.html(운영본) → sweeter-dev.html (Sweeter 개발본) 생성.
#
# Sweeter 는 BLOCK7 과 **같은 코드**에서 뽑아내는 말씀 전용 제품이다.
# 손으로 만들면 빠뜨리기 쉬워서 make-dev.sh 와 같은 방식으로 고정한다.
#
# 바꾸는 곳 여섯 군데:
#   ① 2번째 줄 주석          [production] → [SWEETER DEV — no Firebase]
#   ② const DEV_MODE         false → true
#   ③ const APP_PRODUCT      block7 → sweeter (설정 칸막이가 여기서 깨어난다)
#   ④ manifest.json          → manifest-sweeter-dev.json
#   ⑤ apple-mobile-web-app-title  BLOCK7 → Sweeter DEV
#   ⑥ <title>                → Sweeter DEV
#
# ③ 이 핵심이다. 이 한 줄로 LS_KEY 가 'b7v1_sweeter_dev' 로 갈리고,
# 설정 칸막이(_psOverlay·_psProject)가 깨어난다.
#
# ⛔️ **DEV_MODE 를 false 로 두지 말 것 (Firebase 를 켜지 말 것).**
#    v26-0830-16 에서 한 번 켰다가 계정 데이터를 통째로 날렸다 (2026-08-31 사고).
#    까닭: 동기화 기준점(b7v1_syncbase)·소유자(b7v1_owner)가 **제품별로
#    갈려 있지 않다.** 같은 도메인에 두 제품이 있으면 Sweeter 는
#    저장 키(b7v1_sweeter)가 비어 ST 가 기본값인데, 기준점은 BLOCK7 의
#    가득 찬 상태를 그대로 읽는다. 3자 병합이 그것을 "사용자가 전부 지웠다"
#    로 읽고 빈 상태를 클라우드에 올려 모든 기기를 지운다.
#    ⚠️ _fbBulkLoss 대량 손실 방어는 base 를 모를 때만 돈다 — 이 경로는
#       base 가 있어서 방어가 아예 켜지지 않는다.
#    → 기준점 세 키(b7v1_owner·b7v1_syncbase·b7v1_syncmeta)를 제품별로
#      가르고 시나리오 시험을 먼저 쓴 뒤에야 다시 켤 수 있다.
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
    '<!-- BLOCK7  %s  [SWEETER DEV — no Firebase]  -->'%ver,1)

def sub_once(text,a,b,what):
    if text.count(a)!=1:
        sys.exit('%s: %d곳 발견 (1곳이어야 함)'%(what,text.count(a)))
    return text.replace(a,b,1)

out=sub_once(out,'const DEV_MODE = false;','const DEV_MODE = true;','DEV_MODE')
out=sub_once(out,'const APP_PRODUCT = "block7";','const APP_PRODUCT = "sweeter";','APP_PRODUCT')
out=sub_once(out,'<link rel="manifest" href="manifest.json">',
                 '<link rel="manifest" href="manifest-sweeter-dev.json">','manifest 링크')
out=sub_once(out,'<meta name="apple-mobile-web-app-title" content="BLOCK7">',
                 '<meta name="apple-mobile-web-app-title" content="Sweeter DEV">','앱 이름')
out=sub_once(out,'<title>BLOCK 7</title>','<title>Sweeter DEV</title>','탭 제목')

io.open('sweeter-dev.html','w',encoding='utf-8').write(out)
print('sweeter-dev.html 생성 완료 — %s'%ver)
PY
