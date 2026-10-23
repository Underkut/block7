# 구글 캘린더 연결 — 서버 설정 (HB, 한 번만)

BLOCK7 은 이메일로 로그인해서 구글 캘린더 권한이 없어요. 그래서 **구글에 "BLOCK7 이 내 캘린더를 봐도 돼요" 하는 문**을
하나 만들고, 그 열쇠를 맡아 둘 작은 서버(`gcal-functions/`)를 올려야 해요. 아래 세 가지를 순서대로 하면 돼요.
이걸 하기 전에는 설정창의 **구글 캘린더 연결하기** 를 눌러도 "서버가 아직 준비되지 않았어요" 만 나와요.

## 1. 구글 클라우드 — 캘린더 API 켜기

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인
2. 위 검색창에 **Google Calendar API** → 결과를 눌러 **사용** (파란 단추)

## 2. 구글 클라우드 — 로그인 문(OAuth) 만들기

왼쪽 메뉴 ☰ → **API 및 서비스** → **OAuth 동의 화면** (새 화면에서는 이름이 **Google 인증 플랫폼**이에요)

1. 처음이면 **시작하기** → 앱 이름 `BLOCK7` · 사용자 지원 이메일 = HB 메일 → 다음
   → 대상 **외부** → 연락처 이메일 = HB 메일 → 동의 → **만들기**
2. 왼쪽 **데이터 액세스** → **범위 추가 또는 삭제** → 아래 칸에 두 줄을 차례로 붙여 넣고 체크 → **업데이트** → 아래 **저장**
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
3. 왼쪽 **대상** → 게시 상태가 '테스트' 면 **앱 게시** → 확인
   - ⚠️ '테스트' 로 두면 **7일마다 연결이 끊겨요.** 게시해도 구글 심사는 필요 없어요 (HB 혼자 쓰니까요).
     대신 연결할 때 "Google 에서 확인하지 않은 앱" 경고가 한 번 나와요 (아래 3번에서 넘기는 법).
4. 왼쪽 **클라이언트** → **+ 클라이언트 만들기**
   - 애플리케이션 유형: **웹 애플리케이션** · 이름: `BLOCK7 캘린더`
   - **승인된 리디렉션 URI** → **+ URI 추가** → 아래를 그대로:
     `https://asia-northeast3-block7-8f24e.cloudfunctions.net/gcal/cb`
   - **만들기** → 뜬 창의 **클라이언트 ID** 와 **클라이언트 보안 비밀번호** 를 메모장에 복사해 두세요
     (보안 비밀번호는 아무에게도, 채팅창에도 붙이지 마세요)

## 3. 서버 올리기 (구글 Cloud Shell)

1. https://console.cloud.google.com → 프로젝트 **block7-8f24e** → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd gcal-functions/src && npm install && cd ..
firebase functions:secrets:set GCAL_CLIENT_ID
```
   → `Enter a value` 가 나오면 **클라이언트 ID** 를 붙여 넣고 엔터 (화면에 안 보여도 들어가요)
```
firebase functions:secrets:set GCAL_CLIENT_SECRET
```
   → **클라이언트 보안 비밀번호** 를 붙여 넣고 엔터
```
firebase deploy --only functions:gcal
```
- `block7` 폴더가 없다고 나오면 첫 줄 대신 `git clone https://github.com/Underkut/block7.git && cd block7/gcal-functions/src && npm install && cd ..`
- "API 를 켤까요?(enable)" 를 물으면 **Y** (비밀번호 보관함 Secret Manager — 한 달 몇십 원 수준)
- 성공 표시: `gcal(asia-northeast3)` 가 **Successful create operation**
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**

## 확인 (아이폰 홈 화면 BLOCK7 에서)

1. 설정 → **계정** 탭 → **구글 캘린더** → **구글 캘린더 연결하기**
2. 구글 계정 고르기 → "Google 에서 확인하지 않은 앱" 이 나오면 **고급** → **BLOCK7(으)로 이동** → 두 칸 다 체크 → **계속**
3. BLOCK7 으로 돌아오면 가운데에 "구글 캘린더를 연결했어요" — 기본 캘린더 하나가 켜져 있어요
4. 같은 자리에서 가져올 캘린더를 켜고 끄고, 아래 **BLOCK7 에서 만든 일정이 들어갈 캘린더** 를 골라요
5. 내일 구글 캘린더에 일정 하나 → 1분 안쪽에 BLOCK7 내일 칸의 그 시각 구간에 '일정' 으로 보여요
6. BLOCK7 에서 내일 일정 하나 만들기 → 구글 캘린더 앱에 생겨요 (기본 길이 1시간)
7. 한쪽에서 제목·시각을 고치거나 지우면 다른 쪽도 따라가요

**언제 맞추나요?** 앱을 열 때 · 앱으로 돌아올 때 · 일정을 고치고 몇 초 뒤 · 열어 둔 동안 3분마다.
앱을 닫아 둔 동안에는 맞추지 않아요 — 다음에 열 때 한꺼번에 맞춰요.

**아직 안 되는 것 (다음 단계)**
- BLOCK7 의 **반복 일정**(매일·매주)은 아직 구글로 안 가요. 구글의 반복 일정은 날마다 하나씩 들어와요.
- 범위는 **지난 30일 ~ 앞으로 180일**. BLOCK7 에서 구글로 보내는 것은 **오늘부터** 의 일정만이에요(지난 일정을 쏟아붓지 않게).
- 구글 일정의 장소·메모·끝나는 시각은 BLOCK7 에 보이지 않아요(구글 쪽에는 그대로 남아요).
