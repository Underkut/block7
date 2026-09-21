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
#   ⑦ 파비콘·홈화면 아이콘     icon.png → icon-sweeter.png
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
# ⑦ 아이콘 — 개발본은 block7.my 에 얹혀 살아 icon.png 가 **BLOCK7 것**이다.
#    그래서 파비콘·홈화면 아이콘을 Sweeter 전용 파일로 가리킨다.
out=sub_once(out,'<link rel="icon" href="icon.png">',
                 '<link rel="icon" href="icon-sweeter.png">','파비콘')
out=sub_once(out,'<link rel="apple-touch-icon" href="icon.png">',
                 '<link rel="apple-touch-icon" href="icon-sweeter.png">','홈화면 아이콘')

# ⚠️⚠️ 판을 **첫 그림부터** 덮게 한다 (class="on").
#    안 그러면 로그인이 풀리기 전까지 paintAppUIFromLocal() 이 그린
#    **BLOCK7 홈이 번쩍 보였다 넘어간다** (HB 신고 2026-09-21).
#    JS 로 켜는 것은 늦다 — HTML 에 박혀 있어야 첫 그림부터 덮는다.
out=sub_once(out,'<div id="swHome">','<div id="swHome" class="on">','판 첫 그림')

# ⚠️ 로그인 화면도 Sweeter 것으로. 안 바꾸면 sweeter.my 로 들어온 사람이
#    **BLOCK7 로그인 화면**을 먼저 본다 (HB 신고 2026-09-21 의 한 갈래).
out=sub_once(out,'<div class="auth-logo" id="authLogo">BLOCK<b>7</b></div>',
                 '<div class="auth-logo" id="authLogo">Sweeter</div>','로그인 로고')
out=sub_once(out,'<div class="auth-sub" id="authSub">One beautiful day. Seven simple blocks.</div>',
                 '<div class="auth-sub" id="authSub">말씀과 함께하는 하루</div>','로그인 부제')



io.open('sweeter-dev.html','w',encoding='utf-8').write(out)
print('sweeter-dev.html 생성 완료 — %s'%ver)
PY
