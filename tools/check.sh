#!/usr/bin/env bash
# BLOCK7 배포 전 전체 점검 — 저장소 최상위에서 ./tools/check.sh 로 실행
set -u
cd "$(dirname "$0")/.."
fail=0

echo "━━━ 1. 배포 전 검증 4종 ━━━"
python3 tools/verify.py index.html || fail=1

echo
echo "━━━ 2. 시나리오 테스트 ━━━"
for f in tests/test_*.js; do
  printf '%-26s ' "$f"
  out=$(node "$f" 2>&1)
  echo "$out" | tail -1
  if [ $? -ne 0 ] || echo "$out" | grep -q '실패 [1-9]'; then
    echo "$out" | grep -A3 '✗'
    fail=1
  fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "✗ 점검 실패 — 배포하지 마세요"
  exit 1
fi
echo "✓ 전체 점검 통과"
