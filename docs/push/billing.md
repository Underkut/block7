# 요금 알림 켜기 — 매일 오후 3시, HB 폰으로 (2026-10-27)

매일 오후 3시에 BLOCK7 으로 이런 알림이 와요 (**HB 계정에만** — 다른 사용자에게는 안 가요):

```
10월 요금 · 27일 오후 3시
원래 2,650원 − 절감 1,650원
= 1,010원
```

알림을 누르면 Firebase '사용량 및 결제' 화면이 열려요.
숫자는 결제 화면과 같은 기록에서 세요 — 그 기록을 우리 쪽 저장소(BigQuery)에 복사해 두도록 **한 번만** 켜면 돼요.

## 1. 저장할 곳 만들기 (BigQuery 데이터 세트)

1. https://console.cloud.google.com/bigquery?project=block7-8f24e 접속
   ('BigQuery API 사용 설정' 을 물으면 **사용**)
2. 왼쪽 '탐색기' 에서 **block7-8f24e** 줄 오른쪽 **⋮ → 데이터 세트 만들기**
3. 칸 채우기
   - 데이터 세트 ID: **billing** (꼭 이 글자 그대로)
   - 위치 유형: **리전** → **asia-northeast3 (서울)**
   - 나머지는 그대로
4. **데이터 세트 만들기**

## 2. 결제 기록 복사 켜기

1. https://console.cloud.google.com/billing → **Firebase 결제** 누르기
2. 왼쪽 메뉴 **결제 내보내기** → 위쪽 탭 **BigQuery 내보내기**
3. **표준 사용량 비용** 아래 **설정 수정**
4. 프로젝트: **block7** · 데이터 세트: **billing** → **저장**

기록이 처음 들어오기까지 **몇 시간** 걸려요. 켠 날 이전 날짜는 구글이 채워 주지 않을 수도 있어요 —
그러면 10월 알림에만 "※ 10월 27일부터 센 금액이에요" 가 붙고, **11월부터는 한 달 전체**가 맞게 나와요.

## 3. 서버 다시 올리기 (구글 Cloud Shell)

1. https://console.cloud.google.com → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd wallet-functions/src && npm install && cd ..
firebase deploy --only functions:wallet
```

- 성공 표시: `studyTick(asia-northeast3)` 등이 **Successful update operation**
- ⚠️ 삭제(deletion)를 묻는 화면이 나오면 반드시 **N**

## 확인

- 오후 3시가 지나서 올렸으면 **1분 안에** 첫 알림이 와요. 3시 전이면 그날 3시에.
- 처음 알림이 "아직 결제 기록이 안 들어왔어요" 면 2번이 아직 몇 시간 안 된 거예요 — 다음 날 3시 알림을 보면 돼요.
- "결제 내보내기가 아직 안 켜져 있어요" 면 1번의 데이터 세트 이름(`billing`)이나 위치(서울)를 다시 봐 주세요.
- 첫 숫자를 결제 화면(개요의 비용 · 절감액 · 총비용)과 견줘 보세요. 하루 정도 늦은 숫자일 수 있어요.

## 어떻게 도는가 (클로드용)

- `wallet-functions/src/b7bill.js` · `b7bill-core.js`(규칙, `tests/test_b7bill.js`). 1분 틱 `b7Due` 가 부른다 — 예약 작업을 늘리지 않음.
- 15:00 넘었고 `b7meta/bill.day` 가 오늘이 아니면: 먼저 오늘을 적고(실패해도 하루 한 번) → BigQuery 질의 → 개발자 계정(`DEV_EMAIL`)의 BLOCK7 기기로 푸시.
- 질의: ``block7-8f24e.billing.gcp_billing_export_v1_*`` 에서 `invoice.month` = 이번 달, `SUM(cost)` · `SUM(credits.amount)`(음수).
- 함수의 기본 서비스 계정이 프로젝트 편집자라 BigQuery 를 읽을 수 있다. 권한 오류가 나면 그 계정에 'BigQuery 작업 사용자' · '데이터 뷰어'.
