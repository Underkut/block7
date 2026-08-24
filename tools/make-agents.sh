#!/usr/bin/env bash
# CLAUDE.md(원본) → AGENTS.md(GPT Codex 가 읽는 파일) 생성.
#
# 왜 있나: 클로드 코드는 CLAUDE.md 를, GPT Codex 는 AGENTS.md 를 자동으로 읽는다.
# 이름이 다르다고 규칙을 두 벌로 손수 관리하면 **반드시 갈라진다** — 한쪽만 고치는
# 날이 오고, 그때부터 두 도구가 서로 다른 규칙으로 일한다.
# 그래서 CLAUDE.md 하나만 손으로 고치고, AGENTS.md 는 여기서 만든다.
# ./tools/check.sh 가 둘이 어긋났는지 검사하므로 빠뜨리면 배포 전에 걸린다.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f CLAUDE.md ] || { echo "CLAUDE.md 가 없습니다"; exit 1; }

{
cat <<'HDR'
<!-- ⚠️ 이 파일은 ./tools/make-agents.sh 가 CLAUDE.md 로부터 만듭니다.
     여기를 고치지 마세요 — 다음 생성 때 통째로 덮어써집니다.
     규칙을 바꾸려면 CLAUDE.md 를 고치고 ./tools/make-agents.sh 를 다시 돌리세요. -->

# GPT Codex 에게 — 먼저 읽을 것

이 아래는 `CLAUDE.md` 전문입니다. **클로드 코드와 GPT Codex 가 똑같이 지키는 규칙**이며,
"클로드"라고 적힌 곳은 **지금 이 저장소에서 일하는 도구 자신**을 가리킵니다.

## Codex 가 특히 걸리는 함정 두 가지

**1. 인계 문서 이름이 검색되지 않습니다.**
`BLOCK7-작업인계.md` 는 파일 이름이 디스크에 **NFD(자모 분리) 방식**으로 저장되어
있습니다. 대화창에서 타이핑한 이름으로 `ls`·`cat`·`grep` 하면 **"그런 파일 없음"** 이
나옵니다. 파일은 분명히 있습니다. 이렇게 여세요:

```bash
ls *.md                 # 실제 이름을 눈으로 확인
cat "$(ls | grep 작업인계)"
```

과거에 이 함정 때문에 "인계 문서가 없다"고 잘못 단정한 사고가 있었습니다
(인계 문서 0-1절). **없다고 결론 내리기 전에 위 명령을 반드시 해 보세요.**

**2. `index.html` 은 146만 자입니다.** 통째로 읽으려 하지 마세요.
`docs/MAP.md`(구역 지도)에서 grep 키워드를 먼저 찾고, 그 자리만 여세요.

---

HDR
cat CLAUDE.md
} > AGENTS.md

echo "AGENTS.md 생성 완료 ($(wc -l < AGENTS.md)줄)"
