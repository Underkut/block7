# 보안 규칙 시험 (파이어베이스 에뮬레이터)

`check.sh` 는 이 폴더를 돌리지 않는다(자바 · 에뮬레이터를 받아야 해서). 규칙을 고칠 때 손으로 돌린다.

```
cd tests/rules
npm init -y && npm i firebase-tools@13 @firebase/rules-unit-testing@3 firebase@10
npx firebase emulators:exec --only firestore --project demo-rota "node rota.test.mjs"
# 실제 앱 화면까지(R6): 저장소 맨 위에서 python3 -m http.server 8765 를 띄운 뒤
npx firebase emulators:exec --only firestore,auth --project demo-rota "node rota.e2e.mjs"
```

- `rota.rules` — 교역자 로테이션 규칙 덩어리를 감싼 시험용 전체 규칙. **콘솔에 붙이는 덩어리는 `docs/rotation/firestore-rules.md`** 이고,
  둘이 같은지 `tests/test_rotation.js` ㉓ 이 지킨다.
- `rota.test.mjs` — HB · 팀 교역자 · 팀 밖 사람 · 이메일 확인 안 된 계정으로 읽기 · 쓰기 · 팀 검색 · 사진 · 교역자 칸을 시험(지어낸 이메일).
- `rota.e2e.mjs` — 실제 앱(`rotation/index.html`)을 브라우저로 열어 에뮬레이터(로그인 + 저장 + 규칙)에 붙인다. 파이어베이스 도구는 CDN 대신 `node_modules/firebase` 의 같은 파일을 내준다.
  ① HB 빈 기기 로그인(자료 그대로 · team 적힘) ② 교역자 구글 로그인(보기만 · 남의 방문 · 자리 고르기 막힘 · 자기 숙소 · 부재 · 가능 일정은 자기 칸에)
  ③ HB 앱이 받아들임(메모를 고쳐도 교역자 숙소 그대로) ④ 팀 밖 사람(못 봄 · 문서 안 만듦) ⑤ HB 두 번째 빈 기기 ⑥ 이메일을 지우면 못 들어옴 ⑦(R8b) 첫 화면 · 내 이름 모양은 교역자 칸 · HB 문서 맨 위 `ui` 에, 책은 그대로
  ⑧(R12 A) 옛 칸 b8(옛 인도 모양)을 b10 · `lead` 로 옮김 · HB 가 방문 창에서 금요 · 주일 · LL 인도를 교역자 / 성도 / 중계로 고르면 계정 · 교역자 화면까지, 교역자는 못 고침
  ⑨(R12 C4b) 부산 상영: 토요일인 척 + 영상 광고를 읽은 기기 → 맨 위 경고 줄 · 알약(영상이 없으면 안 띄움) · 내려가는 교역자가 고르면 자기 칸의 그 방문 줄 → HB 앱이 계정 책(b10) 주일 줄로 · 남의 방문 주일은 잠김 · HB 가 나중에 고치면 HB 것 ·
  빈 기기 로그인(예전 이 기기 선택은 다가오는 주일 · 계정에 없는 것만 옮기고 지움) · 낡은 앱(b9)이 써도 상영 남음. Monday 서버 함수는 시험 안에서 지어낸 답으로 대신한다 — 51가지.
