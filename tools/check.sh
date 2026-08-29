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
echo "━━━ 3. 공유 문서 동기화 ━━━"

# AGENTS.md 는 CLAUDE.md 에서 만든다. 한쪽만 고치면 두 도구가 다른 규칙으로
# 일하게 된다 — 그게 이 검사가 있는 유일한 이유다. 생성물을 임시로 다시 만들어
# 지금 커밋된 것과 같은지만 본다 (작업 폴더의 AGENTS.md 는 건드리지 않는다).
if [ ! -f AGENTS.md ]; then
  echo "AGENTS.md 가 없습니다 ✗  → ./tools/make-agents.sh 를 돌리세요"
  fail=1
else
  _tmp=$(mktemp)
  cp AGENTS.md "$_tmp"
  ./tools/make-agents.sh >/dev/null
  if diff -q "$_tmp" AGENTS.md >/dev/null; then
    echo "AGENTS.md ↔ CLAUDE.md 동기화됨 ✓"
  else
    echo "AGENTS.md 가 CLAUDE.md 와 어긋났습니다 ✗"
    echo "   → ./tools/make-agents.sh 로 다시 만들고 함께 커밋하세요"
    fail=1
  fi
  rm -f "$_tmp"
fi

# 개발본도 index.html 에서 만든다. 어긋나면 block7.my/index-dev.html 이 옛 코드를
# 보여줄 뿐 아니라, **개발본에서 코드를 떠오는 테스트가 옛 코드를 검사하게 된다**
# (tests/_load.js 의 sliceDev). 그래서 sweeter-dev.html 과 같은 급으로 배포를 막는다.
if [ ! -f index-dev.html ]; then
  echo "index-dev.html 이 없습니다 ✗  → ./tools/make-dev.sh 를 돌리세요"
  fail=1
else
  _tmp4=$(mktemp)
  cp index-dev.html "$_tmp4"
  ./tools/make-dev.sh >/dev/null
  if diff -q "$_tmp4" index-dev.html >/dev/null; then
    echo "index-dev.html ↔ index.html 동기화됨 ✓"
  else
    echo "index-dev.html 이 index.html 보다 낡았습니다 ✗"
    echo "   → ./tools/make-dev.sh 로 다시 만들고 함께 커밋하세요"
    fail=1
  fi
  rm -f "$_tmp4"
fi

# Sweeter 개발본도 index.html 에서 만든다. 어긋나면 block7.my/sweeter-dev.html
# 이 옛 코드를 보여 주므로, AGENTS.md 와 같은 급으로 배포를 막는다.
if [ ! -f sweeter-dev.html ]; then
  echo "sweeter-dev.html 이 없습니다 ✗  → ./tools/make-sweeter.sh 를 돌리세요"
  fail=1
else
  _tmp3=$(mktemp)
  cp sweeter-dev.html "$_tmp3"
  ./tools/make-sweeter.sh >/dev/null
  if diff -q "$_tmp3" sweeter-dev.html >/dev/null; then
    echo "sweeter-dev.html ↔ index.html 동기화됨 ✓"
  else
    echo "sweeter-dev.html 이 index.html 보다 낡았습니다 ✗"
    echo "   → ./tools/make-sweeter.sh 로 다시 만들고 함께 커밋하세요"
    fail=1
  fi
  rm -f "$_tmp3"
fi

# 구역 지도는 문서일 뿐이라 낡았다고 배포를 막지는 않는다 — 알림만 둔다.
if [ ! -f docs/MAP.md ]; then
  echo "docs/MAP.md 가 없습니다 (경고)  → ./tools/make-map.sh"
else
  _tmp2=$(mktemp)
  cp docs/MAP.md "$_tmp2"
  ./tools/make-map.sh >/dev/null
  if diff -q "$_tmp2" docs/MAP.md >/dev/null; then
    echo "docs/MAP.md 최신 ✓"
  else
    echo "docs/MAP.md 가 index.html 보다 낡았습니다 (경고, 배포는 막지 않음)"
    echo "   → ./tools/make-map.sh 로 다시 만들어 함께 커밋하세요"
  fi
  rm -f "$_tmp2"
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "✗ 점검 실패 — 배포하지 마세요"
  exit 1
fi
echo "✓ 전체 점검 통과"
