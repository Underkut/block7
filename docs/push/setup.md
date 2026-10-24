# 새 알림 서버 올리기 — BLOCK7·Sweeter 말씀 알림 · 할일 알림 (2026-10-24)

예전 서버 둘(말씀 `versepush` · 할일 `block7Notify`)을 **새 서버 하나**(`b7push`)로 바꿉니다.
새 서버는 용돈·공부 친구들·타이머 서버와 **같은 묶음**이라, 올리는 명령도 그때와 똑같아요.

무엇이 좋아지나:
- **할일 알림이 다시 와요.** (예전 서버는 9월 무렵부터 아예 돌지 않았어요)
- **Sweeter 말씀 알림**을 BLOCK7 과 따로 켜고 따로 받을 수 있어요.
- 서버가 1분마다 모든 사람의 자료를 통째로 읽던 일이 없어져요. 데이터베이스 읽기가 크게 줄어요.
- 말씀 순서 '성경순 · 등록순 · 최신순 · 좋아요순' 이 이제 **한 바퀴씩 돌아요.** (예전엔 성경순은 랜덤, 나머지는 늘 같은 말씀 하나만 왔어요)

⚠️ **순서가 중요해요 — 1번(옛 말씀 서버 멈추기)을 먼저 하세요.** 둘이 같이 돌면 말씀 알림이 두 번 와요.

## 1. 옛 말씀 알림 예약 멈추기 (지우지 말고 '일시중지')

1. https://console.cloud.google.com/cloudscheduler 접속 → 위쪽 프로젝트가 **block7-8f24e** 인지 확인
2. 목록에서 **대상(Target)** 주소가 `…run.app` 이고 `key=block7-secret-2026` 가 들어 있는 줄을 찾아요
   (이름은 `versepush` 비슷한 것일 거예요. `firebase-schedule-studyTick…` · `firebase-schedule-walletEvening…` 은 **건드리지 마세요**)
3. 그 줄 오른쪽 **⋮ → 일시중지(Pause)**
4. `firebase-schedule-block7Notify…` 줄이 있으면 그것도 **일시중지** (없으면 넘어가요)

## 2. 새 서버 올리기 (구글 Cloud Shell)

1. https://console.cloud.google.com → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 아래를 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd wallet-functions/src && npm install && cd ..
firebase deploy --only functions:wallet
```

- `block7` 폴더가 없다고 나오면 첫 줄 대신 `git clone https://github.com/Underkut/block7.git && cd block7/wallet-functions/src && npm install && cd ..`
- 성공 표시: `b7push(asia-northeast3)` 가 **Successful create operation**, `studyTick(asia-northeast3)` 가 **Successful update operation**
- 같은 묶음이라 **시리로 할일 넣기 서버**(`b7siri`)도 함께 올라가요 — `b7siri(asia-northeast3)` 도 **Successful create operation** (`docs/siri/setup.md`)
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**

올리고 **1~2분 안에** 서버가 모든 사람의 알림 예약을 한 번 짜요. 그다음부터는 1분마다 '지금 보낼 사람' 만 봐요.

## 3. 확인

1. **BLOCK7 서버 시험** — BLOCK7 → 일반설정 → 알림 탭 맨 아래 **알림 테스트 [서버]** → 8초 안에 홈 화면으로 나가기
   → 'BLOCK7 시험 알림' 배너가 오면 새 서버가 살아 있는 거예요.
2. **말씀 알림** — 지금 간격(예: 10분) 그대로 계속 오는지 한두 번 봐요.
3. **할일 알림** — 다음 '알림 시각'(기본 아침 7시) · 구간 시작 시각에 오는지 봐요.
   알림 시각을 바꾸면 **1분 안에** 새 시각으로 예약돼요.
4. **Sweeter 말씀 알림** — 아이폰에서 sweeter.my 홈 화면 앱 → 말씀 설정 → **알림** 탭 → '정해진 시각' 이나 '일정 간격' 켜기
   (처음엔 꺼져 있어요 — BLOCK7 설정을 물려받지 않게 했어요) → 같은 탭의 **[서버]** 시험 → 'Sweeter 시험 알림'
   → 알림을 누르면 **Sweeter** 가 열려야 해요.

## 4. 며칠 써 보고 괜찮으면 — 옛 서버 지우기

1. Cloud Scheduler(1번 화면)에서 일시중지한 줄 → **⋮ → 삭제**
2. https://console.cloud.google.com/run → `versepush` 서비스 → 위쪽 **삭제**
3. https://console.firebase.google.com → block7 → Functions → `block7Notify` · `block7TestPush` 각각 **⋮ → 함수 삭제**
   (둘 다 2026-10-30 에 지원이 끝나는 Node 20 위에 있어요 — 지우면 그 숙제도 끝나요)

## 문제가 생기면 (되돌리기)

새 서버가 이상하면 1번 화면에서 옛 말씀 예약을 **재개(Resume)** 하면 예전처럼 와요.
그리고 새 서버의 BLOCK7 말씀 알림이 두 번 오지 않게 클로드에게 말해 주세요.

## 어떻게 도는가 (클로드용)

- 코드: `wallet-functions/src/b7push.js`(Firebase 연결) · `b7push-core.js`(규칙, `tests/test_b7push.js`)
- 예약표 `b7plan/{uid}` = `{at, rev, sig, fired, cur}` — 보안 규칙에 없다(앱은 못 읽음, 서버만)
- 1분 틱은 `studyTick` 에 얹었다(Cloud Scheduler 는 계정당 3개까지 무료). `at <= 지금` 만 묻고, 보낼 때 **그때 상태로 다시 판정**한다.
- 30분마다(그리고 서버가 새로 뜰 때) `rev` 만 읽어(fieldMask) 바뀐 사람만 예약을 다시 짠다. 앱은 알림 설정을 바꾸면 6초 뒤 `/replan` 을 부른다.
- 기기 등록(`pushTokens`)의 `product` 로 BLOCK7 · Sweeter 를 가른다. 표시 없는 옛 등록은 BLOCK7.
- Firestore 트리거를 안 쓴 까닭: 데이터베이스 위치 · Eventarc 를 켜야 하고, 상태 문서가 커서 이벤트 크기 제한에 걸릴 수 있다.
