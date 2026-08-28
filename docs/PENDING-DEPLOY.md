# 운영본 배포 대기 목록 (2026-08-28)

HB가 **"운영본 배포해"** 라고 말하면 이 문서대로 하면 된다.
그전까지 운영 사이트(`block7.my`)는 **v. 26-0828-3 그대로**다.

---

## 1. 지금 어떤 상태인가

| 파일 | 저장소(main) | 뜻 |
|---|---|---|
| `index-dev.html` | **v. 26-0828-6** | 새 코드가 여기 있다 → `block7.my/index-dev.html` |
| `index.html` | v. 26-0828-3 | 운영 사이트. **아직 안 올렸다** |
| `sweeter-dev.html` | v. 26-0828-3 | `index.html` 에서 나오므로 함께 기다린다 |
| `firebase-messaging-sw.js` | v. 26-0803-9 | 지금 도는 서비스워커. **아직 안 올렸다** |
| `firebase-messaging-sw-next.js` | v. 26-0828-4 | 새 워커. **아무 데서도 등록하지 않는다** |
| `docs/MAP.md` | v. 26-0828-3 기준 | `index.html` 에서 나오므로 함께 기다린다 |

**왜 나눠 뒀나** — HB가 개발본으로 먼저 확인한 뒤에 운영본을 올린다는 규칙
(`CLAUDE.md`), 그리고 이번 작업의 지시 사항("운영본 배포해 라고 하기 전까지 PR에
넣지 말 것") 때문이다.

⚠️ 서비스워커는 **개발본이 따로 없다.** 개발본은 Firebase 가 꺼져 있어 푸시를 받을 수
없고, 같은 스코프(`/`)에 워커를 두 개 등록할 수도 없다(등록은 스크립트 주소가 아니라
**스코프**로 하나만 잡혀서, 개발용을 등록하면 **운영 워커가 대체된다**).
그래서 새 워커를 `-next.js` 로 만들어 두고 기다린다.

---

## 2. 담긴 것 (v. 26-0828-4 ~ -6)

| 버전 | 무엇 | 문서 |
|---|---|---|
| 26-0828-4 | 알림 클릭 경로 단계별 진단 · 조기 브리지 · 클릭 경로 테스트 버튼 | `docs/NOTIF-CLICK.md` |
| 26-0828-5 | 같은 날·같은 구간의 할일을 **항목 단위**로 합친다 | 인계문서 7-2-6 |
| 26-0828-6 | 충돌 격리 + 동기화 충돌 해결 화면 | 인계문서 7-2-7 |

---

## 3. 배포 절차

```bash
git fetch origin main                       # ① 늘 여기서 시작
git log -20 --oneline                       # ② 그사이 코덱스가 뭘 했는지 본다
git checkout -B <새 브랜치> origin/main

./tools/make-prod.sh                        # ③ 개발본 → 운영본 (손실 없이 되살린다)
cp firebase-messaging-sw-next.js firebase-messaging-sw.js   # ④ 워커 교체
#    그리고 firebase-messaging-sw.js 맨 위의 "대기본" 머리말 문단을 지운다
git rm firebase-messaging-sw-next.js        # ⑤ 대기본은 역할이 끝났다
#    tests/test_notif_sw.js 가 읽는 파일 이름도 firebase-messaging-sw.js 로 바꾼다

./tools/make-sweeter.sh                     # ⑥ 산출물 3종 맞추기
./tools/make-map.sh
./tools/check.sh                            # ⑦ 전체 통과 확인 — 실패하면 배포 금지
```

그다음 PR → 병합 → `github.com/Underkut/block7/actions` 에서
"pages build and deployment" 초록 체크까지 확인 (약 1분).

⚠️ **배포한 날에는 모든 기기를 한 번씩 새로고침**하는 것이 가장 확실하다
(인계문서 7-2-2 의 마지막 문단).

---

## 4. 새 세션에서 이어받을 때

작업 폴더는 세션이 끝나면 사라지지만 **잃는 것은 없다.**

```bash
./tools/make-prod.sh        # index.html 을 index-dev.html 에서 정확히 되살린다
./tools/make-sweeter.sh     # sweeter-dev.html
./tools/make-map.sh         # docs/MAP.md
```

서비스워커는 저장소의 `firebase-messaging-sw-next.js` 에 그대로 있다.

---

## 5. 되돌리는 법

| 무엇 | 어떻게 |
|---|---|
| 아직 배포 전 | 아무것도 안 해도 된다. 운영 사이트는 그대로다 |
| 배포한 뒤 앱만 되돌리기 | 직전 `index.html` 로 되돌려 커밋 → 배포 |
| 배포한 뒤 워커만 되돌리기 | 직전 `firebase-messaging-sw.js` 로 되돌려 커밋 → 배포. 기기에서 앱을 껐다 켜면 바뀐다 (`skipWaiting` + `clients.claim`) |
| 데이터가 이상해졌을 때 | 설정 → 계정 → 데이터 복구 → **자동 백업 보기** (`backup_0~2`) |
| 충돌 화면에서 잘못 골랐을 때 | 고른 뒤에도 원본은 `users/{uid}/data/conflicts` 의 `restore` 에 남아 있다 |
