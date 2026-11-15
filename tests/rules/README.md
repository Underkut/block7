# 보안 규칙 시험 (파이어베이스 에뮬레이터)

`check.sh` 는 이 폴더를 돌리지 않는다(자바 · 에뮬레이터를 받아야 해서). 규칙을 고칠 때 손으로 돌린다.

```
cd tests/rules
npm init -y && npm i firebase-tools@13 @firebase/rules-unit-testing@3 firebase@10
npx firebase emulators:exec --only firestore --project demo-rota "node rota.test.mjs"
```

- `rota.rules` — 교역자 로테이션 규칙 덩어리를 감싼 시험용 전체 규칙. **콘솔에 붙이는 덩어리는 `docs/rotation/firestore-rules.md`** 이고,
  둘이 같은지 `tests/test_rotation.js` ㉓ 이 지킨다.
- `rota.test.mjs` — HB · 팀 교역자 · 팀 밖 사람 · 이메일 확인 안 된 계정으로 읽기 · 쓰기 · 팀 검색 · 사진 · 교역자 칸을 시험(지어낸 이메일).
