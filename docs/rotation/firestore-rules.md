# 교역자 로테이션 — 보안 규칙 (HB)

로테이션 자료는 HB 파이어베이스(block7-8f24e)의 `rota/{HB uid}` 문서 한 장에 있다.
BLOCK7 · Sweeter · 기도노트 · 셀 inside 의 규칙은 건드리지 않고 **로테이션 덩어리 하나만** 바꾼다.

## 지금 붙일 덩어리 (2026-11-26, 1122-V S3 — 로그인 신청 칸 `rjoin` · 자기 표지 `rotahome` · 승인된 예배위원(성도) 읽기 · 설정 `sv/cfg` 를 교역자 · 성도에게 엶 · 1123-B B3 — 카톡 글 프리셋 칸 `kt` 더함 · 1122-V S1b — 분당 예배위원 칸 `sv` · `svm` 더함 · 1121-G G2 구글 자료 칸 `gs` · R13 예배팀 일정 · R6 교역자 함께 쓰기)

1. https://console.firebase.google.com → **block7-8f24e** → 왼쪽 **빌드** → **Firestore Database** → 위쪽 **규칙** 탭
2. `// ── 교역자 로테이션(rota) — 여기서부터 ──` 줄부터 `// ── 교역자 로테이션 — 여기까지 ──` 줄까지를 **통째로 지운다**
   (그 아래 `// ── 셀 inside(cellbook) — 여기서부터 ──` 줄은 남긴다. 콘솔에는 옛 이름 `셀 한눈에(cellbook)` 일 수 있다 — 같은 줄이다).
3. 지운 그 자리에 아래 덩어리를 붙여 넣는다.
4. 오른쪽 위 **게시**. 붙여 넣은 줄이 연한 핑크 바탕이면 '아직 게시 안 한 변경' 표시라 괜찮다.
   줄 번호 옆 빨간 표시나 빨간 물결선이 있으면 게시하지 말고 캡처해서 보여 준다.

```
    // ── 교역자 로테이션(rota) — 여기서부터 ──
    match /rota/{uid} {
      function signedIn() { return request.auth != null; }
      function isOwner() { return signedIn() && request.auth.uid == uid; }
      function verified() { return signedIn() && request.auth.token.email_verified == true; }
      function inTeam(d) { return verified() && request.auth.token.email in d.get('team', []); }
      function isMember() { return inTeam(get(/databases/$(database)/documents/rota/$(uid)).data); }
      function joinDoc() { return /databases/$(database)/documents/rota/$(uid)/rjoin/$(request.auth.uid); }
      function isServer() { return verified() && exists(joinDoc()) && get(joinDoc()).data.st == 'ok'; }
      function joinOk(d) { return d.uid == request.auth.uid && d.email == request.auth.token.email && d.st == 'wait'
        && d.name is string && d.name.size() > 0 && d.name.size() <= 20 && d.at is number; }
      allow read: if isOwner() || inTeam(resource.data);
      allow write: if isOwner();
      match /img/{id} {
        allow read: if isOwner() || isMember();
        allow create: if isOwner() || (isMember() && request.resource.data.by == request.auth.uid);
        allow update, delete: if isOwner() || (isMember() && resource.data.by == request.auth.uid);
      }
      match /staff/{sid} {
        allow read: if isOwner() || isMember();
        allow create, update: if isMember() && request.auth.uid == sid
          && request.resource.data.email == request.auth.token.email
          && request.resource.data.keys().hasOnly(['email', 'at', 'v', 'visits', 'away', 'awayAt', 'can', 'canAt', 'ui']);
        allow delete: if isOwner() || (signedIn() && request.auth.uid == sid);
      }
      match /ext/{id} {
        allow read: if isOwner() || isMember();
      }
      match /gs/{k} {
        allow read: if isOwner() || (k != 'src' && isMember());
        allow write: if isOwner();
      }
      match /sv/{k} {
        allow read: if isOwner() || (k == 'cfg' && (isMember() || isServer()));
        allow write: if isOwner();
      }
      match /svm/{ym} {
        allow read: if isOwner() || isMember() || (isServer() && resource.data.st == 'open');
        allow write: if isOwner();
      }
      match /rjoin/{jid} {
        allow read: if isOwner() || (signedIn() && request.auth.uid == jid);
        allow create: if verified() && request.auth.uid == jid && joinOk(request.resource.data)
          && request.resource.data.keys().hasOnly(['uid', 'email', 'name', 'at', 'v', 'st']);
        allow update: if isOwner() || (verified() && request.auth.uid == jid && resource.data.st in ['wait', 'no']
          && joinOk(request.resource.data) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'at', 'v', 'st']));
        allow delete: if isOwner() || (signedIn() && request.auth.uid == jid && resource.data.st != 'ok');
      }
      match /kt/{k} {
        allow read: if isOwner() || (isMember() && (k == 'share' || k == request.auth.uid));
        allow write: if isOwner() || (isMember() && k == request.auth.uid && k != 'share' && k != 'hb');
      }
    }
    match /rotahome/{u} {
      allow read, delete: if request.auth != null && request.auth.uid == u;
      allow create, update: if request.auth != null && request.auth.uid == u
        && request.resource.data.keys().hasOnly(['team', 'at']) && request.resource.data.team is string && request.resource.data.team.size() <= 128;
    }
    // ── 교역자 로테이션 — 여기까지 ──
```

### 이 덩어리가 하는 일 (일상어)

- **HB**: 예전과 똑같다. 자기 책을 읽고 쓰고, 사진을 올리고 지운다.
- **팀 교역자**(사람 탭에 '계정 이메일' 을 넣은 분): HB 책을 **읽기만** 한다. 쓰는 곳은 **자기 칸**(`staff/{자기 uid}`) 하나 —
  거기에 자기 숙소 · 교통 · 부재 · 가능 일정을 적으면, HB 앱이 그중 **그분 자신의 것만** 골라 책에 받아들인다.
  자기 이름(`by`)으로 숙소 사진을 올리고 자기 사진만 지운다.
- **팀 밖 사람 · 로그인 안 한 사람**: 아무것도 못 본다. 사람 탭에서 이메일을 지우면 그분은 바로 못 들어온다.
- 이메일 확인이 안 된 계정은 팀 이메일이라도 못 들어온다(구글 로그인은 늘 확인된 이메일).
- **예배팀 일정**(`ext/worship`, R13): 서버가 2시간마다 받아 둔 것. HB 와 팀 교역자는 **읽기만**, 쓰기는 아무도 못 한다(서버는 규칙과 상관없이 씀).
- **구글 자료**(`gs/…`, 1121-G G2): HB 앱이 부산 예배팀 · 예배위원 시트를 읽어 둔 표(`gs/bteam` · `gs/bserve`). HB 만 쓰고, 팀 교역자는 **읽기만**.
  HB 가 고른 시트 파일 id(`gs/src`)는 **HB 만** 읽는다 — 교역자에게 시트 주소를 보이지 않는다.

- **분당 예배위원**(1122-V S1b): 시트에서 가져온 달마다의 배치표(`svm/2026-11` …)는 HB 만 쓰고 팀 교역자는 **읽기만**.
  성도 명단 · 고른 시트 파일(`sv/people` · `sv/src`)은 **HB 만** 읽고 쓴다 — 명단에는 이메일 · 메모가 들어가므로 교역자에게도 열지 않는다(배치표 칸에는 보이는 이름이 함께 있어 명단 없이도 표가 보인다).
  설정(`sv/cfg` — 담당 교역자 이름 · 예배 시각)은 HB 가 쓰고, 팀 교역자와 승인된 예배위원은 **읽기만**(S3).
- **로그인 신청**(`rjoin/{신청한 분 uid}`, 1122-V S3): 구글로 들어온 분이 이름을 내는 문서. 그분은 **자기 문서만** 읽고, 쓸 수 있는 칸은 uid · 로그인 이메일 · 이름(20자까지) · 때 · 상태 '기다림' 뿐이다.
  승인 · 거절 · 명단 사람과 잇기는 **HB 만** 한다. 승인된 문서는 그분이 고치지도 지우지도 못한다. 거절된 분은 이름을 고쳐 다시 낼 수 있다. 팀 교역자도 신청을 못 본다.
- **승인된 예배위원(성도)**: 그 팀의 **공개된 달 배치표**(`svm` 중 공개 상태인 달)와 설정만 읽는다. 초안 달 · 교역자 책 · 명단 · 교역자 칸 · 구글 자료 · 카톡 글은 못 읽고, 아무 데도 못 쓴다. HB 가 승인을 풀면 바로 못 읽는다.
- **자기 표지**(`rotahome/{자기 uid}`): 초대 링크로 신청한 팀을 그분 계정에 적어 둔 것 — 다른 기기 · 홈 화면 앱에서 링크 없이 열어도 같은 팀을 찾게. **그분만** 읽고 쓴다(남이 못 바꾼다).
- **카톡 글 프리셋**(`kt/…`, 1123-B B3): 예배 순서 판 '카톡 글' 의 문장 틀. HB 것은 `kt/hb`(전부 — **HB 만**)와 `kt/share`(HB 가 '교역자와 함께 쓰기' 를 켠 것만 — HB 가 쓰고 팀 교역자는 **읽기만**) 두 장,
  교역자 것은 `kt/{자기 uid}` — **그분 자신만** 읽고 쓴다(다른 교역자도 못 봄). 문서를 나눈 까닭: 규칙은 문서 안의 어느 칸인지 못 가려서, 안 나눈 HB 프리셋을 교역자가 못 읽게 하려면 문서가 따로여야 한다.
  성도 이름은 여기 들지 않는다(틀만 — 이름은 그 주 시트 표에서 그때그때 채움).

### 붙이기 전 · 후

- 붙이기 전에도 HB 앱은 예전처럼 돈다(교역자 칸을 못 읽을 뿐 — 조용히 넘어간다).
- 이 덩어리는 파이어베이스 에뮬레이터로 시험했다(`tests/rules/` — HB · 팀 교역자 · 팀 밖 · 확인 안 된 계정 · 팀 검색 · 사진 · 교역자 칸 · 예배팀 일정 · 구글 자료).
- 붙이기 전에도 앱은 돈다 — 예배위원 가져오기 판은 '계정에 둘 권한이 아직 없습니다' 라고 알린다. 구글 자료 판이 '계정에 둘 권한이 아직 없습니다' 라고 알릴 뿐, 표는 그 기기 화면에서 그대로 보인다.

## 확인

1. `sweeter.my/rotation/` → 첫 화면 맨 아래 **관리자 로그인** → BLOCK7 과 같은 이메일 · 비밀번호로 로그인 (HB 는 **구글 로그인을 누르지 말 것** — 아래 '주의')
2. **사람** 탭에서 이름 하나를 고쳐 본다 → 다른 기기에서 같은 계정으로 보이면 HB 쪽은 그대로다

## 주의 — HB 는 지금처럼 이메일 · 비밀번호로

HB 계정은 BLOCK7 과 같은 이메일 · 비밀번호 계정이다. 같은 지메일로 '구글로 로그인' 을 누르면 파이어베이스가 두 로그인을 한 계정으로 합치면서
**비밀번호 로그인이 풀릴 수 있다**(BLOCK7 로그인이 흔들림). 구글 로그인은 교역자분들 몫이다(R6b).

## 클라우드 모양 (참고)

- `rota/{HB uid}`
  - `b16`: { v, at, people[], slots[], visits[], marks[], opts[], shows[], specs[], buls[], adtx[] } — 옛 칸 `book` · `b2` ~ `b15` 은 읽어 합친 뒤 지운다(같은 책이 여러 벌 쌓여 1MB 를 넘지 않게).
  - `ui`(R8b): HB 의 화면 취향 — 첫 화면 · 내 이름 모양 · 알림 판 기간(`al`) · 시트와 맞춰 보기에서 넘긴 줄(`gsk`, 1121-G G4 — 자리 + 지문, 이름은 안 듦). 주인 문서라 규칙을 고칠 것은 없다.
  - `team`: 이 책을 읽어도 되는 이메일 목록 — 사람 탭 '계정 이메일' 에서 앱이 저절로 만든다(손으로 고칠 것 없음).
  - 줄마다 `at`(고친 때) · `by`(누가). 지우면 내용을 비운 표지(`del: true`)만 남는다.
  - 숙소 줄의 `status`(1116-2 C): `''` 미정 · `pre` 예약 전(호텔) / 대화 전(성도님 댁) · `ask` 대화 중(성도님 댁만) · `done` 예약 완료 / 대화 완료 · `cancel` 취소. 옛 호텔의 `ask`(예전 글자 '대화 중')는 읽을 때 `pre` 로 옮긴다. 성도님 댁은 취소 기한이 없다.
  - 숙소 · 교통 · 모임(방문) · 부재 · 가능 일정(사람)은 칸마다 고친 때(`stayAt` …)와 교역자가 적었으면 그 사람(`stayBy` …)이 따로 있다 — 나중에 적은 쪽이 이긴다.
- `rota/{HB uid}/staff/{교역자 uid}` — 교역자 한 분의 칸: `email` · `visits`(방문마다 `stay` · `travel` · `meet`(모임, 1116-2 B) · `bs`(부산 상영) · `tx`(전달용 텍스트, 1117-Z 4) + 고친 때 — 규칙은 `visits` 안을 가리지 않으니 칸이 늘어도 규칙을 고칠 것은 없다) · `away` · `can` + 고친 때. 교역자 앱만 쓴다.
- `rota/{HB uid}/kt/{hb | share | 교역자 uid}` (1123-B B3) — 카톡 글 프리셋: `{ v, items: { id: { n(이름) · t(문장 틀) · ord(차례) · share · del · at } } }`. 프리셋 한 줄씩 합쳐 쓰고 지우기는 표지(`del`). 기본 다섯(봉독 · 안내 · 헌금 · 예배팀 인도 · 금요)은 앱 안에 있어 HB 가 고치거나 끌 때만 줄이 생긴다.
- `rota/{HB uid}/img/{id}` — 숙소 예약 화면 사진 한 장(`d`: 줄인 JPEG, `visit`, `at`, 교역자가 올렸으면 `by`). 책에는 사진 id 만 들어 있다.
- 모양과 맞추는 규칙은 `rotation/index.html` 의 `rotation-core`, 시험은 `tests/test_rotation.js`.
- 문서 한 장은 1MB 까지다. 앱은 900KB 를 넘기면 올리지 않고 알린다.
- `users/{uid}`(BLOCK7 · Sweeter)는 건드리지 않는다. `cellbook/{uid}`(셀 inside)는 **AI 열쇠를 읽기만**(R9 — 예약 사진 · 메일 읽기). 셀 inside 규칙이 이미 본인 읽기를 허락하므로 규칙을 고칠 것은 없다.

## 예전 덩어리 (기록)

- 1122-V S3 (rotation v. 26-1126-6): 함수 셋(`joinDoc` · `isServer` · `joinOk`) · `sv` 에 설정 읽기 · `svm` 에 성도 읽기 · `match /rjoin/{jid}` · 맨 끝 `match /rotahome/{u}` 더함.
  붙이기 전에는 성도가 이름을 내면 '신청을 보내지 못했습니다' 가 뜨고, 교역자 화면은 담당 교역자 이름 없이 그대로 돈다(HB 앱은 그대로).

- 1123-B B3 (rotation v. 26-1123-14): 안에 `match /kt/{k}` 네 줄(카톡 글 프리셋) 더함. 붙이기 전에는 프리셋을 고쳐도 그 기기에만 남고(판이 '계정에 둘 권한이 아직 없습니다' 라고 알림), 기본 다섯 · 복사는 그대로 된다.

- R1 (v. 26-1114-1): `rota/{uid}` 를 본인만 읽고 쓰기.
- R3b (v. 26-1114-5): 안에 `match /img/{id}` 세 줄(사진) 더함.
- R6a (v. 26-1115-1): 팀 읽기(`team`) · 교역자 칸(`staff/{uid}`).
- R8b (v. 26-1115-4): 교역자 칸에 넣을 수 있는 칸 이름에 **`'ui'` 한 낱말** 더함 — 교역자의 '첫 화면 · 내 이름 보이는 모양' 을 계정에 두려고. 붙이기 전에는 교역자 기기 안에서만 기억된다(다른 것은 그대로 돈다).
