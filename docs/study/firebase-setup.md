# 공부 친구들 — 서버 설정 (HB)

용돈 친구들과 **같은 파이어베이스 · 같은 가족 칸**을 써요. BLOCK7 의 규칙·함수·데이터는 건드리지 않아요.
아래 덩어리는 에뮬레이터(서버 흉내 장치)로 시험했어요 (`tests/test_study_rules.js` 가 이 파일의 덩어리를 그대로 읽어 시험해요).

이 세 가지를 하기 전에도 앱은 **기기 안에서는 전부 돌아요** (계획 · 타이머 · 앱 안 알림).
가족 연결(아이 계정 · 부모 확인)과 앱을 닫아 둔 때의 알림만 서버가 필요해요.

## 1. 보안 규칙 바꾸기 (세 번째 판 — 공부 친구들 칸 추가)

1. https://console.firebase.google.com → **block7-8f24e** → 빌드 → **Firestore Database** → **규칙** 탭
2. 규칙 화면에서 `// ── 용돈 친구들(wallet) 가족 계정 — 여기서부터 ──` 줄부터
   `// ── 용돈 친구들 — 여기까지 ──` 줄까지를 **통째로 지우고**, 아래 덩어리를 그 자리에 붙여 넣어요.
3. 오른쪽 위 **게시**. 빨간 오류가 나오면 게시하지 말고 캡처해서 보여 주세요.

```
    // ── 용돈 친구들(wallet) 가족 계정 — 여기서부터 ── (세 번째 판: 공부 친구들 포함 2026-10-13)
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
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['pname', 'notify', 'tokens', 'stokens']);
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
      // 공부 친구들(study) — 아이 폰이 원본, 부모님은 읽고 확인(sreviews)·약속(spromises)만 쓴다
      match /study/{kid} {
        allow read: if wMem(fid) && (wMe(fid).role == 'parent' || wMe(fid).kidId == kid);
        allow create, update: if wMem(fid) && wMe(fid).role == 'kid' && wMe(fid).kidId == kid;
        allow delete: if wParent(fid);
      }
      match /sphotos/{sid} {
        allow read: if wParent(fid) || (wMem(fid) && resource.data.kidId == wMe(fid).kidId);
        allow create, update: if wMem(fid) && wMe(fid).role == 'kid' && request.resource.data.kidId == wMe(fid).kidId;
        allow delete: if wParent(fid);
      }
      match /sreviews/{rid} {
        allow read: if wParent(fid) || (wMem(fid) && resource.data.kidId == wMe(fid).kidId);
        allow create, update, delete: if wParent(fid);
      }
      match /spromises/{pid} {
        allow read: if wParent(fid) || (wMem(fid) && resource.data.kidId == wMe(fid).kidId);
        allow create, update, delete: if wParent(fid);
      }
    }
    // 공부 친구들 — 알림 예약 (서버가 시각이 되면 보내고 지운다)
    match /sremind/{rid} {
      allow read, delete: if wIn() && resource.data.uid == request.auth.uid;
      allow create, update: if wIn() && request.resource.data.uid == request.auth.uid && wMem(request.resource.data.fid);
    }
    // ── 용돈 친구들 — 여기까지 ──
```

## 2. 이메일 로그인 확인 (이미 켜져 있을 거예요)

Authentication → 로그인 방법 → **이메일/비밀번호** 가 '사용 설정됨' 인지만 봐 주세요.
아이 계정은 이메일 없이 '아이디 + 숫자 6자리' 로 만들지만, 속으로는 이 방식을 써요 (주소는 `아이디@kid.block7.my` — 실제 메일은 가지 않아요).

## 3. 알림 서버 다시 올리기 (구글 Cloud Shell)

용돈 친구들 알림 서버(`wallet-functions/`)에 공부 친구들 몫(`studyPing` · `studyTick`)을 함께 넣었어요.
`docs/wallet/firestore-rules.md` 3번과 **같은 명령**이에요:

1. https://console.cloud.google.com → 위쪽 프로젝트가 **block7-8f24e** 인지 확인 → 오른쪽 위 **>_ (Cloud Shell 활성화)**
2. 아래를 한 줄씩 붙여 넣고 엔터:

```
cd block7 && git pull && cd wallet-functions/src && npm install && cd ..
firebase deploy --only functions:wallet
```

- `block7` 폴더가 없다고 나오면 첫 줄 대신 `git clone https://github.com/Underkut/block7.git && cd block7/wallet-functions/src && npm install && cd ..`
- 성공 표시: `studyPing(asia-northeast3)` · `studyTick(asia-northeast3)` 두 줄이 **Successful create operation**
- ⚠️ 배포 중에 **삭제(deletion)를 묻는 화면이 나오면 반드시 N**
- "API 를 켤까요?(enable)" 를 물으면 **Y** (studyTick 은 1분마다 도는 예약 작업이라 Cloud Scheduler 를 써요 — 한 달 몇십 원 수준)

## 확인

1. **부모 폰**: 공부 친구들(`block7.my/study/`) → 우상단 톱니 → **부모님이에요** → 용돈 친구들과 같은 이메일로 로그인
   → 부모 화면 **아이 계정** 탭 → (용돈 친구들의 그 아이) **계정 만들기** → 아이디 · 숫자 6자리
2. **아이 폰**: 공부 친구들 → 톱니 → **아이 계정으로 로그인** → 그 아이디 · 숫자
3. 아이 폰에서 공부 하나 끝내고 **엄마 아빠에게 보내기** → 부모 화면 **확인할 것** 에 와요 → 도장 · 별 · 허락권 고르고 **확인 · 보내기**
4. 아이 폰에 별 · 도장이 붙고, 허락권은 **아이 폰의 용돈 친구들 우체통**으로 가요.
5. 알림: 두 폰 모두 톱니 → **이 폰으로 알림 받기**. 아이폰은 Safari 에서 '홈 화면에 추가' 한 앱에서만 돼요.
   아이 폰은 앱을 닫아 두어도 공부 시각에 [시작] [미루기] 알림이 와요 (아이폰은 단추 없이 알림만 — 누르면 앱 안 알림 화면).

규칙을 안 바꿨으면 로그인 뒤 "권한이 없어요", 서버를 안 올렸으면 알림과 '숫자 다시 정하기' 만 안 돼요.
