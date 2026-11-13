# 심방 노트 — 'ChatGPT 가 보낸 기록' 알림 켜기 (HB, 한 번만)

ChatGPT 가 대기함(시트 'AI 입력대기' 탭)에 기록을 넣으면 폰 · 패드 · PC 로 알려 주는 기능입니다.
알림 서버가 **10분마다** 그 탭을 **읽기만** 해서 처음 보는 '대기' 줄이 있으면 알립니다.
알림에는 **이름과 건수만** 나오고 심방 내용은 싣지 않습니다. 서버에도 내용을 두지 않습니다.

## 1. 서버 올리기 (구글 Cloud Shell) — 용돈 · BLOCK7 · 셀 inside 알림 서버와 같은 명령

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인
2. 오른쪽 위 **>_ (Cloud Shell 활성화)**
3. 아래를 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd wallet-functions/src && npm install && cd ..
firebase deploy --only functions:wallet
```

- `block7` 폴더가 없다고 나오면 첫 줄 대신 `git clone https://github.com/Underkut/block7.git && cd block7/wallet-functions/src && npm install && cd ..`
- 성공 표시: `carepush(asia-northeast3)` 가 **Successful create operation**, `studyTick(asia-northeast3)` 가 **Successful update operation**
- 도중에 "GCAL_CLIENT_ID … 비밀값 접근 권한을 줄까요?" 같은 물음이 나오면 **Y** (구글 캘린더 연결 때 넣어 둔 값을 알림 서버도 읽게 하는 것 — 새로 넣을 값은 없습니다)
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**

보안 규칙은 **고칠 것이 없습니다.** 기기 등록은 앱이 못 읽는 `carepush` 칸(규칙에 없음 = 서버만)에 서버가 대신 적습니다.

## 2. 기기마다 켜기 (폰 · 패드 · PC 크롬 — 한 번씩)

1. 심방 노트를 엽니다. **아이폰 · 아이패드는 홈 화면 아이콘으로** (사파리 탭에서는 알림이 막힙니다)
2. 설정(톱니) → **연결** → **새 기록 알림** → **이 기기 켜기** → 알림 허용
3. 같은 줄의 **시험 알림** → '심방 노트 시험 알림' 배너가 오면 끝
4. 다른 기기에서도 2 ~ 3 을 한 번씩

- 알림을 누르면 심방 노트가 대기함부터 열립니다.
- ChatGPT 가 보낸 뒤 **최대 10분** 늦을 수 있습니다.
- 처음 켤 때 이미 대기함에 있던 줄은 알리지 않습니다.

## 끄기

설정 → 연결 → 새 기록 알림 → **이 기기 끄기**. 마지막 기기를 끄면 서버도 시트 읽기를 멈춥니다.

## 어떻게 도는가 (클로드용)

- 코드: `wallet-functions/src/carepush.js`(파이어베이스 · 네트워크) · `carepush-core.js`(규칙, `tests/test_carepush.js`) · 앱 `care/index.html` '1113-P' (`pushOn` · `pushRowHtml`) · 워커 `care/sw.js`(범위 `/care/`)
- 서버는 `studyTick`(1분)에 얹혀 10분의 5분 자리에만 돈다(`C.due`). `carepush/{uid}` 가 on 인 계정마다: `users/{uid}/data/care` 의 시트 id → `gcalTokens/{uid}` 의 구글 열쇠(gcal 이 맡아 둔 것, `drive.file`)로 탭 GET → `C.waiting` → `C.diff(seen)` → 새 줄이 있으면 FCM.
- 열쇠(seen)는 원본ID(없으면 패킷 글 해시) — 접수ID 는 앱이 나중에 붙이므로 쓰지 않는다. 대기에서 빠진 줄은 잊는다.
- 구글 연결 · 시트가 끊기면(`gone`) 끄고 한 번 알린다. 계속 두드리지 않는다.
- 시험 시트 모드는 이 기기만의 것이라 서버는 **계정에 저장된 운영 시트**를 읽는다. 시험 중에는 설정에 이 줄이 안 보인다.
