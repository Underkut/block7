# 교역자 로테이션 — 보안 규칙 (HB, 한 번만)

로테이션 자료는 HB 파이어베이스(block7-8f24e)의 `rota/{uid}` 문서 한 장에만 저장한다.
BLOCK7 · Sweeter · 기도노트 · 셀 inside 의 규칙은 건드리지 않고 **한 덩어리를 덧붙이기만** 한다.
이걸 붙이기 전에는 로그인은 되지만 화면 위에 **"서버 권한이 아직 없습니다"** 가 뜨고, 자료는 그 기기에만 남는다.

## 보안 규칙 붙여 넣기

1. https://console.firebase.google.com → **block7-8f24e** → 왼쪽 **빌드** → **Firestore Database** → 위쪽 **규칙** 탭
2. `// ── 셀 inside(cellbook) — 여기서부터 ──` 줄을 찾는다(콘솔에는 옛 이름 `셀 한눈에(cellbook)` 로 남아 있을 수 있다 — 같은 줄이다). 그 **바로 위**에 아래 덩어리를 붙여 넣는다.
   `//` 로 시작하는 줄은 메모라 이름을 고쳐도 안 고쳐도 규칙에는 상관없다.
3. 오른쪽 위 **게시**. 붙여 넣은 줄이 연한 핑크 바탕이면 '아직 게시 안 한 변경' 표시라 괜찮다.
   줄 번호 옆 빨간 표시나 빨간 물결선이 있으면 게시하지 말고 캡처해서 보여 준다.

```
    // ── 교역자 로테이션(rota) — 여기서부터 ──
    match /rota/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    // ── 교역자 로테이션 — 여기까지 ──
```

로그인 방법(이메일/비밀번호)은 BLOCK7 이 이미 쓰고 있어서 따로 켤 것이 없다.

## 확인

1. `sweeter.my/rotation/` → 오른쪽 위 **…** → BLOCK7 과 같은 이메일 · 비밀번호로 로그인
2. **사람** 탭에서 이름 하나를 더한다
3. 다른 기기(아이패드 · PC)에서 같은 계정으로 로그인하면 같은 이름이 보인다

## 클라우드 모양 (참고)

- `rota/{uid}` — `book`: { v, at, people[], slots[], visits[], marks[] } · `v`(앱 버전) · `at`
  - 줄마다 `at`(고친 때) · `by`(누가). 지우면 내용을 비운 표지(`del: true`)만 남는다.
  - 모양과 맞추는 규칙은 `rotation/index.html` 의 `rotation-core`, 시험은 `tests/test_rotation.js`.
- 문서 한 장은 1MB 까지다. 앱은 900KB 를 넘기면 올리지 않고 알린다(몇 해 치를 담아도 한참 남는다).
- R6(교역자 각자 가능 / 불가 입력) 때는 `rota/{uid}/avail/{교역자 uid}` 처럼 **각자 자기 칸에만 쓰는** 규칙을 더한다. 그때 이 문서를 고친다.
- `users/{uid}`(BLOCK7 · Sweeter) · `cellbook/{uid}`(셀 inside)는 건드리지 않는다.
