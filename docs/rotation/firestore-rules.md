# 교역자 로테이션 — 보안 규칙 (HB)

로테이션 자료는 HB 파이어베이스(block7-8f24e)의 `rota/{HB uid}` 문서 한 장에 있다.
BLOCK7 · Sweeter · 기도노트 · 셀 inside 의 규칙은 건드리지 않고 **로테이션 덩어리 하나만** 바꾼다.

## 지금 붙일 덩어리 (2026-11-16, R13 — 예배팀 일정 읽기 칸 더함 · R6 교역자 함께 쓰기)

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

### 붙이기 전 · 후

- 붙이기 전에도 HB 앱은 예전처럼 돈다(교역자 칸을 못 읽을 뿐 — 조용히 넘어간다).
- 이 덩어리는 파이어베이스 에뮬레이터로 39가지 경우를 시험했다(`tests/rules/` — HB · 팀 교역자 · 팀 밖 · 확인 안 된 계정 · 팀 검색 · 사진 · 교역자 칸 · 예배팀 일정).

## 확인

1. `sweeter.my/rotation/` → 오른쪽 위 **…** → BLOCK7 과 같은 이메일 · 비밀번호로 로그인 (HB 는 **구글 로그인을 누르지 말 것** — 아래 '주의')
2. **사람** 탭에서 이름 하나를 고쳐 본다 → 다른 기기에서 같은 계정으로 보이면 HB 쪽은 그대로다

## 주의 — HB 는 지금처럼 이메일 · 비밀번호로

HB 계정은 BLOCK7 과 같은 이메일 · 비밀번호 계정이다. 같은 지메일로 '구글로 로그인' 을 누르면 파이어베이스가 두 로그인을 한 계정으로 합치면서
**비밀번호 로그인이 풀릴 수 있다**(BLOCK7 로그인이 흔들림). 구글 로그인은 교역자분들 몫이다(R6b).

## 클라우드 모양 (참고)

- `rota/{HB uid}`
  - `b12`: { v, at, people[], slots[], visits[], marks[], opts[], shows[] } — 옛 칸 `book` · `b2` ~ `b11` 은 읽어 합친 뒤 지운다(같은 책이 여러 벌 쌓여 1MB 를 넘지 않게).
  - `team`: 이 책을 읽어도 되는 이메일 목록 — 사람 탭 '계정 이메일' 에서 앱이 저절로 만든다(손으로 고칠 것 없음).
  - 줄마다 `at`(고친 때) · `by`(누가). 지우면 내용을 비운 표지(`del: true`)만 남는다.
  - 숙소 줄의 `status`(1116-2 C): `''` 미정 · `pre` 예약 전(호텔) / 대화 전(성도님 댁) · `ask` 대화 중(성도님 댁만) · `done` 예약 완료 / 대화 완료 · `cancel` 취소. 옛 호텔의 `ask`(예전 글자 '대화 중')는 읽을 때 `pre` 로 옮긴다. 성도님 댁은 취소 기한이 없다.
  - 숙소 · 교통 · 모임(방문) · 부재 · 가능 일정(사람)은 칸마다 고친 때(`stayAt` …)와 교역자가 적었으면 그 사람(`stayBy` …)이 따로 있다 — 나중에 적은 쪽이 이긴다.
- `rota/{HB uid}/staff/{교역자 uid}` — 교역자 한 분의 칸: `email` · `visits`(방문마다 `stay` · `travel` · `meet`(모임, 1116-2 B) · `bs`(부산 상영) + 고친 때 — 규칙은 `visits` 안을 가리지 않으니 칸이 늘어도 규칙을 고칠 것은 없다) · `away` · `can` + 고친 때. 교역자 앱만 쓴다.
- `rota/{HB uid}/img/{id}` — 숙소 예약 화면 사진 한 장(`d`: 줄인 JPEG, `visit`, `at`, 교역자가 올렸으면 `by`). 책에는 사진 id 만 들어 있다.
- 모양과 맞추는 규칙은 `rotation/index.html` 의 `rotation-core`, 시험은 `tests/test_rotation.js`.
- 문서 한 장은 1MB 까지다. 앱은 900KB 를 넘기면 올리지 않고 알린다.
- `users/{uid}`(BLOCK7 · Sweeter)는 건드리지 않는다. `cellbook/{uid}`(셀 inside)는 **AI 열쇠를 읽기만**(R9 — 예약 사진 · 메일 읽기). 셀 inside 규칙이 이미 본인 읽기를 허락하므로 규칙을 고칠 것은 없다.

## 예전 덩어리 (기록)

- R1 (v. 26-1114-1): `rota/{uid}` 를 본인만 읽고 쓰기.
- R3b (v. 26-1114-5): 안에 `match /img/{id}` 세 줄(사진) 더함.
- R6a (v. 26-1115-1): 팀 읽기(`team`) · 교역자 칸(`staff/{uid}`).
- R8b (v. 26-1115-4): 교역자 칸에 넣을 수 있는 칸 이름에 **`'ui'` 한 낱말** 더함 — 교역자의 '첫 화면 · 내 이름 보이는 모양' 을 계정에 두려고. 붙이기 전에는 교역자 기기 안에서만 기억된다(다른 것은 그대로 돈다).
