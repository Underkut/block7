# 용돈 친구들 — 가족 계정 서버 설정 (HB)

BLOCK7 의 기존 규칙·함수·데이터는 건드리지 않아요 — **덧붙이기만** 해요.
모든 덩어리는 에뮬레이터(서버 흉내 장치)로 시험했어요.

## ✅ 1. 익명 로그인 켜기 — 2026-10-09 완료

Authentication → 로그인 방법 → 익명 → 사용 설정.

## 2. 보안 규칙 (2026-10-09 두 번째 판 — 우체통·알림 칸 추가)

> 첫 판을 이미 붙여 넣었다면: 규칙 화면에서 `// ── 용돈 친구들(wallet) 가족 계정 — 여기서부터 ──` 줄부터
> `// ── 용돈 친구들 — 여기까지 ──` 줄까지를 **통째로 지우고**, 아래 새 덩어리를 그 자리에 붙여 넣어요.

1. https://console.firebase.google.com → **block7-8f24e** → 빌드 → **Firestore Database** → **규칙** 탭
2. (처음이면) 맨 위 `match /databases/{database}/documents {` 줄 **바로 다음 줄**에 붙여 넣어요.
   중괄호 안 이름이 `{database}` 가 아니면 게시하지 말고 캡처해서 보여 주세요.
3. 오른쪽 위 **게시**. 빨간 오류가 나오면 게시하지 말고 캡처해서 보여 주세요.

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
        allow update: if wIn() && uid == request.auth.uid
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['pname', 'notify', 'tokens']);
        allow delete: if wParent(fid) || (wIn() && uid == request.auth.uid);
      }
      match /msgs/{mid} {
        allow read: if wParent(fid) || (wMem(fid) && resource.data.kidId == wMe(fid).kidId);
        allow create: if wMem(fid) && request.resource.data.at == request.time && (
          (wMe(fid).role == 'parent' && request.resource.data.from == 'parent')
          || (wMe(fid).role == 'kid' && request.resource.data.from == 'kid'
              && request.resource.data.kidId == wMe(fid).kidId
              && request.resource.data.type in ['note', 'req', 'cpreq']
              && request.resource.data.status in [null, 'open']));
        allow update: if wParent(fid) || (wMem(fid) && wMe(fid).role == 'kid' && resource.data.kidId == wMe(fid).kidId
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['readKid', 'keep', 'hide', 'status', 'doneAt'])
          && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['status'])
              || (resource.data.type == 'mission' && resource.data.status == 'open' && request.resource.data.status == 'done')));
        allow delete: if wParent(fid);
      }
      match /alerts/{aid} {
        allow read, update: if wParent(fid);
      }
      match /kids/{kid} {
        allow read: if wMem(fid);
        allow create, update: if wMem(fid) && wMe(fid).role == 'kid' && wMe(fid).kidId == kid;
        allow delete: if wParent(fid);
      }
    }
    // ── 용돈 친구들 — 여기까지 ──
```

## 3. 알림 서버 올리기 (구글 Cloud Shell — 설치할 것 없음)

BLOCK7 할일 알림(`functions/`)과 **따로 묶인** 서버예요(`wallet-functions/`, 묶음 이름 `wallet`).
아래 명령은 **지갑 알림만** 올리고 BLOCK7 함수는 건드리지 않아요.

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인 → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 아래를 한 줄씩 붙여 넣고 엔터:

```
git clone https://github.com/Underkut/block7.git
cd block7/wallet-functions/src
npm install
cd ..
firebase login --no-localhost
firebase deploy --only functions:wallet
```

- 이미 `block7` 폴더가 있으면 첫 줄 대신 `cd block7 && git pull && cd ..`
- `npm warn` · `deprecated` 는 무시해도 돼요.
- 성공 표시: `✔ functions[walletPing(asia-northeast3)] Successful create operation.` 와 `walletEvening` 두 줄
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**
- 처음 올릴 때 "API 를 켤까요?(enable)" 를 물으면 **Y**

## 확인

- 부모 폰: 용돈 친구들 → 우상단 톱니 → **알림 설정** → **이 폰으로 알림 받기** → 허락
  (아이폰은 Safari 에서 '홈 화면에 추가'한 용돈 친구들에서만 알림이 와요)
- 아이 폰에서 무언가 기록 → 몇 초 안에 부모 폰에 알림. 알림을 누르면 그 기록이 열려요.
- 부모 폰 → 우체통 탭 → **알림 내역**에 쌓여요.

규칙을 안 바꿨으면 우체통에서 "권한이 없어요", 서버를 안 올렸으면 알림 내역이 비어 있어요
(쪽지·도장·미션·승인은 서버 없이도 돼요 — 알림만 안 와요).
