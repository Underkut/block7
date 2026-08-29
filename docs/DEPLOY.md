# 배포하는 법 · 지금 무엇이 올라가 있나

## 지금 상태 (2026-08-28)

**대기 중인 것이 없다.** 아래 모두 운영에 올라가 있다.

| 파일 | 버전 |
|---|---|
| `index.html` (운영) | v. 26-0828-7 |
| `index-dev.html` (개발본) | v. 26-0828-7 |
| `sweeter-dev.html` | v. 26-0828-7 |
| `firebase-messaging-sw.js` (서비스워커) | v. 26-0828-7 |

### v. 26-0828-4 ~ -7 에 담긴 것

| 버전 | 무엇 | 문서 |
|---|---|---|
| -4 | 알림 클릭 경로 단계별 진단 · 조기 브리지 · 클릭 경로 테스트 버튼 | `docs/NOTIF-CLICK.md` |
| -5 | 같은 날·같은 구간 할일을 **항목 단위**로 합치기 | 인계문서 7-2-6 |
| -6 | 충돌 격리 + 동기화 충돌 해결 화면 | 인계문서 7-2-7 |
| -7 | 기기별 설정 — '이 기기에서 알림 받기' · '지금 보는 말씀' 동기화 제외 | 인계문서 7-2-8 |

⚠️ **버전을 올린 날에는 아이폰·맥 모든 기기를 한 번씩 새로고침**하는 것이 가장 확실하다
(인계문서 7-2-2 의 마지막 문단). 홈 화면 앱은 껐다가 다시 열면 된다.

---

## 평소 순서 (CLAUDE.md 규칙)

1. **개발본만 담은 PR** 로 올리고 바로 병합 → HB 가 `block7.my/index-dev.html` 에서 확인
2. HB 가 **"운영본 배포해"** 라고 하면 그때 운영본을 담은 PR

작업 폴더의 운영본은 커밋되지 않은 채로 남는데, 세션이 끝나도 **잃는 것은 없다**:

```bash
./tools/make-prod.sh        # index.html 을 index-dev.html 에서 되살린다
./tools/make-sweeter.sh     # sweeter-dev.html
./tools/make-map.sh         # docs/MAP.md
```

---

## 운영본 배포 절차

```bash
git fetch origin main                       # ① 늘 여기서 시작
git log -20 --oneline                       # ② 그사이 코덱스가 뭘 했는지 본다
git checkout -B <새 브랜치> origin/main

./tools/make-prod.sh                        # ③ 개발본 → 운영본
./tools/make-sweeter.sh                     # ④ 산출물 3종 맞추기
./tools/make-map.sh
./tools/check.sh                            # ⑤ 전체 통과 확인 — 실패하면 배포 금지
```

PR → 병합 → `github.com/Underkut/block7/actions` 에서
"pages build and deployment" 초록 체크까지 확인 (약 1분).

---

## ⚠️ 서비스워커는 개발본이 없다

`firebase-messaging-sw.js` 를 고치면 **곧바로 운영**이다.

- 개발본(`index-dev.html`)은 Firebase 가 꺼져 있어 푸시를 받을 수 없다.
- 같은 스코프(`/`)에 워커를 두 개 등록할 수도 없다 — 등록은 스크립트 주소가 아니라
  **스코프**로 하나만 잡히므로, 개발용을 등록하면 **운영 워커가 대체된다.**

그래서 워커를 고칠 때는 **`tests/test_notif_sw.js` 로 먼저 검증한다**
(importScripts 앞부분을 가짜 워커 환경에서 돌린다). 그다음에 올린다.

기기에서는 앱을 껐다 켜면 새 워커로 바뀐다 (`skipWaiting` + `clients.claim`).

---

## 되돌리는 법

| 무엇 | 어떻게 |
|---|---|
| 앱만 되돌리기 | 직전 `index.html` 로 되돌려 커밋 → 배포 |
| 워커만 되돌리기 | 직전 `firebase-messaging-sw.js` 로 되돌려 커밋 → 배포. 기기에서 앱을 껐다 켜면 바뀐다 |
| 데이터가 이상해졌을 때 | 설정 → 계정 → 데이터 복구 → **자동 백업 보기** (`backup_0~2`) |
| 충돌 화면에서 잘못 골랐을 때 | 고른 뒤에도 원본이 `users/{uid}/data/conflicts` 의 `restore` 에 남아 있다 |
| 이 기기만 알림을 멈추고 싶을 때 | 설정 → 알림 → **이 기기에서 알림 받기** 끄기 (다른 기기는 그대로) |
