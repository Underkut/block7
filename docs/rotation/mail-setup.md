# 교역자 로테이션 — 메일에서 숙소 예약 찾기 설정 (HB, 한 번만)

부산 탭 **'메일에서 숙소 예약 찾기'** 가 HB 지메일의 아고다 · 트립닷컴 예약 메일을 읽으려면 아래 세 가지가 필요합니다 (R9b).
메일 열쇠는 BLOCK7 캘린더 · 심방 노트 열쇠와 **따로** 맡겨집니다(`gmailTokens/{uid}`) — 캘린더 쪽 앱이 메일을 읽게 되지 않습니다.
권한은 **읽기만**(`gmail.readonly`). 메일 내용은 어디에도 저장하지 않습니다.

## 1. 구글 클라우드 — Gmail API 켜기

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인
2. 위 검색창에 **Gmail API** → 결과를 눌러 **사용** (파란 단추)

## 2. 구글 클라우드 — 메일 읽기 범위 적어 두기

왼쪽 메뉴 ☰ → **API 및 서비스** → **OAuth 동의 화면**(새 화면에서는 **Google 인증 플랫폼**)

1. 왼쪽 **데이터 액세스** → **범위 추가 또는 삭제** → 아래 '직접 범위 추가' 칸에 한 줄을 붙여 넣고 **표에 추가** → **업데이트** → 맨 아래 **저장**
   - `https://www.googleapis.com/auth/gmail.readonly`
   - '제한된 범위' 라고 표시돼도 괜찮습니다. **'확인(verification) 제출'** 을 묻는 창은 누르지 말고 닫습니다 — HB 혼자 쓰는 앱이라 심사가 필요 없습니다.
2. 왼쪽 **대상** → 게시 상태가 **'프로덕션 단계'** 인지 봅니다 (BLOCK7 캘린더 연결 때 게시했으면 그대로입니다).
   - ⚠️ **'테스트 중'** 이면 메일 연결이 **7일마다 끊깁니다.** 그때는 앱의 '구글 메일 연결' 을 한 번 더 누르면 됩니다.

## 3. 서버 다시 올리기 (구글 Cloud Shell)

1. https://console.cloud.google.com → 프로젝트 **block7-8f24e** → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 한 줄을 붙여 넣고 엔터:

```
cd ~/block7 && git pull && cd gcal-functions && firebase deploy --only functions:gcal
```
- 성공 표시: `gcal(asia-northeast3)` 옆에 **Successful update operation**
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**
- `block7` 폴더가 없다고 나오면: `git clone https://github.com/Underkut/block7.git && cd block7/gcal-functions/src && npm install && cd .. && firebase deploy --only functions:gcal`

## 4. 앱에서 연결

1. `sweeter.my/rotation/` → **부산** 탭 → 오른쪽 **메일에서 숙소 예약 찾기** → **구글 메일 연결**
2. 구글 계정 고르기 → **'Google 에서 확인하지 않은 앱'** 이 나오면 왼쪽 아래 **고급** → **BLOCK7(으)로 이동(안전하지 않음)**
3. '이메일 메시지 및 설정 보기' 에 체크 → **계속**
4. 앱으로 돌아오면 바로 메일을 찾습니다. 맞는 방문 옆 **넣기** → 숙소 판에 채워짐 → 보고 **저장**

- 연결을 거두려면: 같은 판 맨 아래 **메일 연결 끊기** (구글에 맡긴 열쇠도 돌려줍니다)
- "Gmail API 를 아직 켜지 않았습니다" 가 나오면 1번을, "서버를 아직 다시 올리지 않았습니다" 가 나오면 3번을 합니다.

## AI 열쇠

메일 · 사진에서 예약을 뽑는 것은 **셀 inside 에 넣은 제미나이 열쇠**를 함께 씁니다(같은 sweeter.my, 계정 `cellbook/{uid}` 의 `ai.key` 를 읽기만).
열쇠가 없다고 나오면 셀 inside 메뉴(⋯) › AI 요약에서 넣습니다.
보내기 전에 메일 주소 · 전화번호 · 링크는 지웁니다.
