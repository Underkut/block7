#!/usr/bin/env bash
# index.html 의 버전을 version.txt 로 적어 둔다 (v26-0921-10).
#
# 왜 이 파일이 필요한가 —
#   앱은 자기가 낡았는지 알 길이 없다. index.html 은 1.4MB 라 확인하려고
#   통째로 받아 올 수는 없다. 그래서 **몇 글자짜리 파일 하나**를 옆에 두고
#   그것만 no-store 로 읽어 견준다 (_upCheck).
#
# ⚠️ 손으로 고치지 말 것. 낡으면 **새 버전을 영영 못 받는다** — check.sh 가 막는다.
set -euo pipefail
cd "$(dirname "$0")/.."

ver=$(grep -m1 -o 'const APP_VERSION = "v\. [0-9-]*"' index.html | sed 's/.*"\(v\. [0-9-]*\)"/\1/')
[ -n "$ver" ] || { echo "index.html 에서 APP_VERSION 을 못 찾았습니다"; exit 1; }
printf '%s\n' "$ver" > version.txt
echo "version.txt 생성 완료 — $ver"
