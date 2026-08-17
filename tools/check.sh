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
  out=$(node "$f" 2>&1); rc=$?
  # ⚠️ node 의 종료코드는 **바로 여기서** 받아야 한다. 아래 echo 를 지나고 나서
  #    $? 를 보면 그건 echo 의 결과다 — 그 탓에 v26-0817-13 까지 **터진 테스트가
  #    통과로 세어졌다** (test_tagsingles.js 가 죽었는데 '전체 점검 통과' 가 떴다).
  echo "$out" | tail -1
  # 터졌거나 / 실패가 있거나 / 결과 줄 자체가 없으면(중간에 죽음) 실패로 본다
  if [ $rc -ne 0 ] || echo "$out" | grep -q '실패 [1-9]' || ! echo "$out" | grep -q '결과: 통과'; then
    echo "$out" | grep -A3 '✗'
    [ $rc -ne 0 ] && echo "   ↑ 테스트가 도중에 죽었습니다 (종료코드 $rc)"
    fail=1
  fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "✗ 점검 실패 — 배포하지 마세요"
  exit 1
fi
echo "✓ 전체 점검 통과"
