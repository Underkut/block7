# 셀 inside — 새 코멘트 알림 켜기 (HB, 한 번만)

새 담임 · 사모 코멘트가 달리면 휴대폰으로 알려 주는 기능입니다.
알림 서버가 **10분마다** 셀 케어를 **읽기만** 해서 처음 보는 코멘트가 있으면 알려 드려요.
알림에는 **누가 · 어느 셀**만 나오고 코멘트 내용은 싣지 않습니다.

## 1. 서버 올리기 (구글 Cloud Shell) — 용돈 · BLOCK7 알림 서버와 같은 명령

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인
2. 오른쪽 위 **>_ (Cloud Shell 활성화)**
3. 아래를 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd wallet-functions/src && npm install && cd ..
firebase deploy --only functions:wallet
```

- `block7` 폴더가 없다고 나오면 첫 줄 대신 `git clone https://github.com/Underkut/block7.git && cd block7/wallet-functions/src && npm install && cd ..`
- 성공 표시: `cellpush(asia-northeast3)` 가 **Successful create operation**, `studyTick(asia-northeast3)` 가 **Successful update operation**
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**

보안 규칙은 **고칠 것이 없습니다.** 기기 등록은 원래 쓰던 `cellbook` 칸에, 맡긴 로그인은 앱이 못 읽는 `cellpush` 칸(규칙에 없음 = 서버만)에 둡니다.

## 2. 아이폰에서 켜기

1. 셀 inside 를 **홈 화면 아이콘**으로 엽니다 (사파리 탭에서는 아이폰이 알림을 막아요)
2. 오른쪽 위 `⋯` → **명단 · 전화번호** 에서 BLOCK7 계정으로 로그인되어 있는지 봅니다 (전화번호가 보이면 됨)
3. `⋯` → **새 코멘트 알림** → **알림 켜기** → 알림 허용
4. 셀 케어 숫자 코드가 메일로 한 번 더 옵니다 → 넣고 **확인**
   (알림 서버만 쓰는 로그인을 따로 만드는 것이라 지금 앱 로그인은 그대로예요)
5. **시험 알림** → 'cell inside 시험 알림' 배너가 오면 끝
6. 아이패드도 받으려면 아이패드에서 3번의 **이 기기도 받기**만 누르면 됩니다 (코드 다시 안 받음)

## 끄기

`⋯` → **새 코멘트 알림** → **알림 끄기** → 서버에 맡긴 셀 케어 로그인도 지웁니다.

## 어떻게 도는가 (클로드용)

- 코드: `wallet-functions/src/cellpush.js`(파이어베이스 · 네트워크) · `cellpush-core.js`(규칙, `tests/test_cellpush.js`) · 앱 `cell/index.html` 'L4 새 코멘트 알림' · 워커 `cell/sw.js`
- 1분 틱(`studyTick`)이 `cellDue()` 를 부르고, 10분에 한 번만 실제로 묻는다. 묻는 것: get_my_context · leadership_assignments · get_week_status(이번 주 · 지난주) · senior_comment_list(내 담당 셀 · 낸 보고서)
- `cellpush/{uid}` = { on, rt(셀 케어 refresh 열쇠, 쓸 때마다 새것으로), seen(본 코멘트 id, 800개), last, err }
- 기기 등록: `cellbook/{uid}.push.tokens.{토큰}` — 죽은 토큰은 보낼 때 걷어낸다
- 셀 케어 로그인이 끊기면(400 · 401) 끄고 열쇠를 지우고 '알림이 꺼졌습니다' 를 한 번 보낸다
- 앱 로그아웃은 `signOut({ scope: 'local' })` — 전체 로그아웃이면 서버 몫도 끊긴다
