# 용돈 친구들 — 가족 계정 서버 설정 (HB 가 한 번만)

가족 연결(부모 보고서)이 동작하려면 파이어베이스 콘솔에서 **두 가지**를 해야 해요.
BLOCK7 의 기존 규칙·데이터는 건드리지 않아요 — **덧붙이기만** 해요.
(이 덩어리는 에뮬레이터로 시험했어요: 남은 못 읽음 · 아이는 자기 칸에만 씀 · 가족 문서는 부모만 고침)

## 1. 익명 로그인 켜기 (아이 폰용)

1. https://console.firebase.google.com → **block7-8f24e** 프로젝트
2. 왼쪽 메뉴 **빌드 → Authentication**
3. 위쪽 탭 **로그인 방법(Sign-in method)**
4. **새 제공업체 추가** → **익명(Anonymous)** → **사용 설정** 스위치 켜기 → **저장**

(이메일/비밀번호는 BLOCK7 이 이미 켜 두었어요 — 부모님 로그인은 그걸 써요)

## 2. 보안 규칙에 덩어리 붙여 넣기

1. 왼쪽 메뉴 **빌드 → Firestore Database**
2. 위쪽 탭 **규칙(Rules)**
3. 규칙 맨 위쪽에 이런 줄이 있어요:
   ```
   match /databases/{database}/documents {
   ```
   ⚠️ 중괄호 안 이름이 `{database}` 인지 보세요. 다른 이름(예: `{db}`)이면 아래 덩어리의 `$(database)` 를 모두 그 이름으로 바꿔야 해요 — 모르겠으면 화면을 캡처해서 보여 주세요.
4. 그 줄 **바로 다음 줄**에 커서를 두고, 아래 덩어리를 통째로 붙여 넣어요.
5. 오른쪽 위 **게시(Publish)**. 빨간 오류가 나오면 게시하지 말고 캡처해서 보여 주세요.

```
    // ── 용돈 친구들(wallet) 가족 계정 — 여기서부터 ──
    function wIn() { return request.auth != null; }
    function wFull() { return request.auth != null && request.auth.token.firebase.sign_in_provider != 'anonymous'; }
    function wMem(fid) { return wIn() && exists(/databases/$(database)/documents/families/$(fid)/members/$(request.auth.uid)); }
    function wMe(fid) { return get(/databases/$(database)/documents/families/$(fid)/members/$(request.auth.uid)).data; }
    function wParent(fid) { return wMem(fid) && wMe(fid).role == 'parent'; }
    function wJoinOk(fid, d) {
      let j = get(/databases/$(database)/documents/wjoins/$(d.code)).data;
      return j.fid == fid && j.exp > request.time && j.role == d.role
        && (d.role == 'kid' ? (j.kidId == d.kidId) : wFull());
    }
    match /wusers/{uid} {
      allow read, write: if wFull() && request.auth.uid == uid;
    }
    match /wjoins/{code} {
      allow get: if wIn();
      allow create: if wFull() && wParent(request.resource.data.fid) && request.resource.data.exp is timestamp;
      allow delete: if wIn() && wMem(resource.data.fid);
    }
    match /families/{fid} {
      allow create: if wFull() && fid == request.auth.uid && request.resource.data.owner == request.auth.uid;
      allow get: if wMem(fid);
      allow update: if wParent(fid);
      match /members/{uid} {
        allow read: if wMem(fid);
        allow create: if wIn() && uid == request.auth.uid && (
          (request.resource.data.role == 'parent' && wFull() && fid == request.auth.uid)
          || wJoinOk(fid, request.resource.data));
        allow delete: if wParent(fid) || (wIn() && uid == request.auth.uid);
      }
      match /kids/{kid} {
        allow read: if wMem(fid);
        allow create, update: if wMem(fid) && wMe(fid).role == 'kid' && wMe(fid).kidId == kid;
        allow delete: if wParent(fid);
      }
    }
    // ── 용돈 친구들 — 여기까지 ──
```

## 확인

- 부모 폰: 용돈 친구들 → 설정(톱니) → **부모님이에요 (로그인)** → BLOCK7 계정으로 로그인 → 보고서 화면
- 보고서 맨 아래 **아이 폰 연결하기** → 아이 이름 → 6자리 코드
- 아이 폰: 설정 → **아이 폰 연결하기 (코드 넣기)** → 코드 → "가족과 연결됐어요!"
- 부모 폰 보고서에 아이 이름과 기록이 몇 초 안에 나와요.

익명 로그인을 안 켰으면 아이 폰에서 "아직 서버에서 이 로그인이 켜지지 않았어요",
규칙을 안 붙였으면 "권한이 없어요" 가 나와요.
