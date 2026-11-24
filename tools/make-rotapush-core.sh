#!/usr/bin/env bash
# 교역자 로테이션 알림 서버(wallet-functions/src/rotapush.js)가 쓸 판단 덩어리를 앱에서 떼어 온다 (1123-B B4).
#   rotation/index.html 의 <script id="rotation-core"> → wallet-functions/src/rotation-core.gen.js
# 서버와 앱이 알림 글 · 보낼 때를 **같은 코드로** 정하게 하려는 것이다 — 서버에 규칙을 두 벌 쓰지 않는다.
# ⚠️ 만들어진 파일을 손으로 고치지 말 것. rotation/index.html 의 core 를 고쳤으면 이것을 돌려 함께 커밋한다(check.sh 가 검사).
set -eu
cd "$(dirname "$0")/.."
node - <<'JS'
const fs = require('fs');
const H = fs.readFileSync('rotation/index.html', 'utf8');
const m = H.match(/<script id="rotation-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('rotation-core 덩어리를 못 찾았습니다'); process.exit(2); }
const names = ['APP_VERSION', 'RP_MAX', 'RP_LATE', 'RP_APP', 'rpNorm', 'rpOne', 'rpDefault', 'rpDue', 'rpNext', 'rpNeeds', 'rpMine', 'rpMsg', 'rpLink', 'rpPreview', 'rpYmd',
  'gsUnpack', 'pickDoc', 'normBook', 'ktList', 'ktStaff', 'visitSun', 'teamOf'];
const out = '/* ⚠️ 만들어진 파일 — 손으로 고치지 말 것. tools/make-rotapush-core.sh 가 rotation/index.html 의 <script id="rotation-core"> 에서 떼어 만든다.\n' +
  ' * 교역자 로테이션 알림 서버(rotapush.js)가 앱과 같은 판단(알림 글 · 보낼 때 · 시트 표 읽기)을 쓰려고. */\n' +
  'module.exports = (function () {\n' + m[1].replace(/\s+$/, '') + '\n\nreturn { ' + names.join(', ') + ' };\n})();\n';
fs.writeFileSync('wallet-functions/src/rotation-core.gen.js', out);
JS
echo "wallet-functions/src/rotation-core.gen.js 를 다시 만들었습니다"
