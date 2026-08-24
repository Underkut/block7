#!/usr/bin/env bash
# index.html → docs/MAP.md (구역 지도) 생성.
# index.html 을 고쳤으면 이걸 돌리고 MAP.md 도 함께 커밋한다.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/make-map.py
