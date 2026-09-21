#!/usr/bin/env bash
# index.html(BLOCK7 운영본) → build-sweeter/  (sweeter.my 에 올릴 Sweeter 운영본)
#
# ⚠️⚠️ 이 산출물은 **저장소에 커밋하지 않는다.**
#    깃헙 페이지는 저장소의 모든 파일을 block7.my/… 로 내보낸다. 그래서
#    sweeter.html 을 커밋하면 block7.my/sweeter.html 이 **"같은 도메인에서
#    로그인이 켜진 Sweeter"** 가 되어 버린다 — CLAUDE.md 가 말리는 그 모양이다.
#    → 배포할 때만 만든다. build-sweeter/ 는 .gitignore 에 있다.
#      (.github/workflows/deploy-sweeter.yml 이 이 스크립트를 부른다)
#
# 개발본(make-sweeter.sh)과 **딱 한 가지가 다르다: DEV_MODE 를 안 건드린다.**
# false 그대로 둬서 Firebase 가 켜진다 — 그게 이 파일의 존재 이유다.
# 켜도 되는 까닭은 v26-0919-5 에서 기준점 키를 제품별로 갈랐기 때문이다
# (tests/test_product_syncbase.js 시나리오 3·4 가 사고 재현과 증명을 들고 있다).
#
# 바꾸는 곳:
#   ① 2번째 줄 주석                [production] → [SWEETER — production]
#   ② const APP_PRODUCT            block7 → sweeter   ← 핵심 한 줄
#   ③ apple-mobile-web-app-title   BLOCK7 → Sweeter
#   ④ <title>                      → Sweeter
#   ⑤ 공유 카드(OG·트위터)         BLOCK7 → Sweeter, 이미지 줄은 뺀다
#
# ⚠️ manifest 링크는 **안 바꾼다.** 담는 폴더가 다르므로 이름은 manifest.json
#    그대로 두고 내용물만 manifest-sweeter.json 으로 갈아 넣는다.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f index.html ] || { echo "index.html 이 없습니다"; exit 1; }
[ -f manifest-sweeter.json ] || { echo "manifest-sweeter.json 이 없습니다"; exit 1; }

OUT=build-sweeter
rm -rf "$OUT"
mkdir -p "$OUT"

python3 - <<'PY'
import io,sys,re

src=io.open('index.html',encoding='utf-8').read()

m=re.search(r'^<!-- BLOCK7\s+(v\. \d{2}-\d{4}-\d+)\s+\[production\]\s+-->$',src,re.M)
if not m:
    sys.exit('2번째 줄 버전 주석을 못 찾았습니다. 형식: <!-- BLOCK7  v. YY-MMDD-N  [production]  -->')
ver=m.group(1)
out=src.replace(m.group(0),
    '<!-- BLOCK7  %s  [SWEETER — production]  -->'%ver,1)

def sub_once(text,a,b,what):
    if text.count(a)!=1:
        sys.exit('%s: %d곳 발견 (1곳이어야 함)'%(what,text.count(a)))
    return text.replace(a,b,1)

# ② 핵심 한 줄. 이것으로 저장 키·기준점 키·설정 칸막이가 전부 갈린다.
out=sub_once(out,'const APP_PRODUCT = "block7";','const APP_PRODUCT = "sweeter";','APP_PRODUCT')

# ⛔️ DEV_MODE 는 **건드리지 않는다.** 여기서 false 인지 한 번 확인만 한다 —
#    실수로 true 가 섞여 들어오면 로그인이 없는 앱이 sweeter.my 에 올라간다.
if out.count('const DEV_MODE = false;')!=1:
    sys.exit('DEV_MODE 가 false 가 아닙니다 — 운영본을 만들 수 없습니다')

out=sub_once(out,'<meta name="apple-mobile-web-app-title" content="BLOCK7">',
                 '<meta name="apple-mobile-web-app-title" content="Sweeter">','앱 이름')
out=sub_once(out,'<title>BLOCK 7</title>','<title>Sweeter</title>','탭 제목')

# ⚠️⚠️ 파비콘·홈화면 아이콘은 **파일 이름을 바꿔서** 가리킨다 (icon-sweeter.png).
#    내용만 갈아 끼우면 안 된다 — 첫 배포(v26-0919-6)가 sweeter.my/icon.png 로
#    **BLOCK7 아이콘**을 내보냈고, 그 뒤 내용을 Sweeter 것으로 바꿨는데도
#    브라우저가 같은 주소의 옛 그림을 계속 물고 있었다. 크롬 탭에 스위터 로고와
#    블럭7 로고가 번갈아 뜬 까닭이 이것이다 (HB 신고 2026-09-21).
#    → 주소가 바뀌면 캐시가 걸릴 자리가 없다.
out=sub_once(out,'<link rel="icon" href="icon.png">',
                 '<link rel="icon" href="icon-sweeter.png">','파비콘')
out=sub_once(out,'<link rel="apple-touch-icon" href="icon.png">',
                 '<link rel="apple-touch-icon" href="icon-sweeter.png">','홈화면 아이콘')

# ⚠️⚠️ 판을 **첫 그림부터** 덮게 한다 (class="on").
#    안 그러면 로그인이 풀리기 전까지 paintAppUIFromLocal() 이 그린
#    **BLOCK7 홈이 번쩍 보였다 넘어간다** (HB 신고 2026-09-21).
#    JS 로 켜는 것은 늦다 — HTML 에 박혀 있어야 첫 그림부터 덮는다.
out=sub_once(out,'<div id="swHome">','<div id="swHome" class="on">','판 첫 그림')

# ⚠️ 제품 표시 — 제품별로 보이고 감추는 CSS 한 쌍(data-prod)이 이걸 본다.
#    JS 로 붙이면 첫 그림에 늦어 깜빡인다. HTML 에 박아야 한다.
out=sub_once(out,'<html lang="ko">','<html lang="ko" data-product="sweeter">','제품 표시')
# 로그인 화면의 로고 그림 — BLOCK7 에는 src 가 없어 받아오지도 않는다.
out=sub_once(out,'<img class="auth-mark" id="authMark" alt="">',
                 '<img class="auth-mark" id="authMark" src="icon-sweeter.png" alt="">','로그인 로고 그림')


# ⚠️ 로그인 화면도 Sweeter 것으로. 안 바꾸면 sweeter.my 로 들어온 사람이
#    **BLOCK7 로그인 화면**을 먼저 본다 (HB 신고 2026-09-21 의 한 갈래).
out=sub_once(out,'<div class="auth-logo" id="authLogo">BLOCK<b>7</b></div>',
                 '<div class="auth-logo" id="authLogo">Sweeter</div>','로그인 로고')
out=sub_once(out,'<div class="auth-sub" id="authSub">One beautiful day. Seven simple blocks.</div>',
                 '<div class="auth-sub" id="authSub">말씀과 함께하는 하루</div>','로그인 부제')



# ⑤ 공유 카드. 이름과 설명은 갈고, **이미지는 뺀다** —
#    BLOCK7 그림을 그대로 쓰면 이름과 그림이 어긋난다 (Sweeter 그림은 아직 없다).
out=sub_once(out,'<meta name="description" content="아름다운 하루 · 일곱 블럭">',
                 '<meta name="description" content="말씀과 함께하는 하루">','description')
out=sub_once(out,'<meta property="og:site_name" content="BLOCK7">',
                 '<meta property="og:site_name" content="Sweeter">','og:site_name')
out=sub_once(out,'<meta property="og:title" content="BLOCK7">',
                 '<meta property="og:title" content="Sweeter">','og:title')
out=sub_once(out,'<meta property="og:description" content="아름다운 하루 · 일곱 블럭">',
                 '<meta property="og:description" content="말씀과 함께하는 하루">','og:description')
out=sub_once(out,'<meta property="og:url" content="https://block7.my/">',
                 '<meta property="og:url" content="https://sweeter.my/">','og:url')
out=sub_once(out,'<meta name="twitter:title" content="BLOCK7">',
                 '<meta name="twitter:title" content="Sweeter">','twitter:title')
out=sub_once(out,'<meta name="twitter:description" content="아름다운 하루 · 일곱 블럭">',
                 '<meta name="twitter:description" content="말씀과 함께하는 하루">','twitter:description')
# 이미지를 뺐으니 카드 종류도 큰 그림용이 아니라 작은 것으로 바꾼다
out=sub_once(out,'<meta name="twitter:card" content="summary_large_image">',
                 '<meta name="twitter:card" content="summary">','twitter:card')
for line in ['<meta property="og:image" content="https://block7.my/og-image.png?v=260730d">\n',
             '<meta property="og:image:width" content="1200">\n',
             '<meta property="og:image:height" content="630">\n',
             '<meta name="twitter:image" content="https://block7.my/og-image.png?v=260730d">\n']:
    out=sub_once(out,line,'','공유 이미지 줄 빼기')

io.open('build-sweeter/index.html','w',encoding='utf-8').write(out)
print('build-sweeter/index.html — %s'%ver)
PY

cp manifest-sweeter.json "$OUT/manifest.json"
# ⚠️ 아이콘은 **이름을 그대로 두고 내용물만** Sweeter 것으로 갈아 넣는다.
#    담는 폴더가 다르니 HTML 의 icon.png 링크를 안 건드려도 된다.
cp icon-sweeter.png "$OUT/icon.png"
# 형제 앱 아이콘 두 개도 함께. **어느 빌드에서나 같은 이름으로 부를 수 있게**
# 하려는 것이다 — 안 그러면 "여기선 이 이름, 저기선 저 이름" 이 되어
# 로고 메뉴의 형제 줄 그림이 빌드마다 깨진다.
cp icon-sweeter.png "$OUT/icon-sweeter.png"
cp icon-block7.png  "$OUT/icon-block7.png"
cp firebase-messaging-sw.js "$OUT/firebase-messaging-sw.js"
cp -r fonts "$OUT/fonts"

echo "build-sweeter/ 준비 완료 — $(find "$OUT" -type f | wc -l) 개 파일"
