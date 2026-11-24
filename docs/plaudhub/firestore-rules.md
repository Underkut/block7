# 심방 녹음(plaudhub) — 보안 규칙 (HB)

PLAUD 도우미 자료는 HB 파이어베이스(block7-8f24e)의 `plaud/{HB uid}` 아래에 있다 — 설정(키워드 · 기간 · 모델) 한 장과
`rec`(녹음 제목 · 시각 · 길이) · `job`(고름 · 맡은 Mac · 단계) · `mac`(두 Mac 소식 · 준비 상태 · 깔린 모델 · 모델 시험 시간) · `cmd`(설치 요청) · `txt`(HB 암호 문구로 잠근 전사 글 — 파이어베이스 · 구글 쪽에서는 풀 수 없음) 여섯 칸.
BLOCK7 · Sweeter · 기도노트 · 셀 inside · 교역자 로테이션의 규칙은 건드리지 않고 **이 덩어리 하나만 더한다.**

## 다시 붙이기 (2026-11-24 오후, 1122-P P3e — 도우미 h. 26-1124-3)

P3e 에서 바뀐 곳: 녹음 줄에 **PLAUD 전사가 있는지(`p`)**, 일감에 **어디서 온 전사인지(`src` — p = PLAUD · w = whisper) · 전사 의심(`odd`)**.
다시 붙이지 않으면 새 도우미가 녹음 목록 · 끝남 표시를 못 적어 목록이 멈춘다. 아래 '붙이는 순서' 5번 괄호(지우고 그 자리에)대로.

## 다시 붙이기 (2026-11-24, 1122-P P3c — 도우미 h. 26-1124-1)

P3c 에서 바뀐 곳: 일감에 **드라이브에 없음 표시(`gone`)**, Mac 소식에 **목록 읽은 때(`listed`)**, 요청에 **`kick`(지금 시작) · `rmtxt`(전사 txt 지우기) · `redo`(다시 전사)**.
다시 붙이지 않으면 새 도우미의 소식 쓰기가 거절되어 Mac 이 '꺼짐' 으로 보이고, [지금] · txt 지우기 · 다시 전사가 '보내지 못했습니다' 가 된다. 아래 '붙이는 순서' 5번 괄호(지우고 그 자리에)대로.

## 다시 붙이기 (2026-11-23 저녁, 1122-P P3b — 도우미 h. 26-1123-3)

P3b 에서 바뀐 곳: 설정에 **Mac 마다 자동 전사 켜기 · 끄기(`auto`) · 잠금 암호 표지(`kdf` — 소금 · 반복 수 · 맞는지 보는 표지뿐, 암호 자체는 없음)**,
Mac 소식에 **저장 공간(`disk`)**, 요청에 **`rmmodel`(안 쓰는 모델 지우기) · `clean`(임시 소리 파일 비우기)**, 새 칸 **`txt`(HB 암호 문구로 잠근 전사 글 — 폰 · 패드에서 복사 · 받기)**.
이 덩어리를 다시 붙이지 않으면 새 도우미의 소식 쓰기가 거절되어 Mac 이 '꺼짐' 으로 보이고, 자동 스위치 · 암호 정하기 · 복사가 '저장하지 못했습니다' 가 된다.
아래 '붙이는 순서' 의 5번 괄호(지우고 그 자리에)대로 하면 된다.

## 다시 붙이기 (2026-11-23, 1122-P P3 — 도우미 h. 26-1123-2)

P3 에서 두 곳이 바뀌었다: Mac 소식(`mac`)에 **깔린 모델 목록(`models`) · 모델 시험 결과(`test` — 걸린 시간 · 빠르기만, 글 없음)**, 요청(`cmd`)에 **`mtest`(모델 시험)**.
**이 덩어리를 다시 붙이지 않으면** 새 도우미의 소식 쓰기가 거절되어 계기판에서 Mac 이 '꺼짐' 으로 보이고, '모델 시험' 단추가 '보내지 못했습니다' 가 된다.
아래 '붙이는 순서' 의 5번 괄호(이미 붙였다면 — 지우고 그 자리에)대로 하면 된다.

## 붙이는 순서 (처음 한 번 · 2026-11-23, 1122-P P2)

1. https://console.firebase.google.com 을 연다 → 프로젝트 **block7-8f24e** 를 누른다
2. 왼쪽 메뉴 **빌드** → **Firestore Database** → 위쪽 **규칙** 탭
3. 규칙 글에서 `// ── 교역자 로테이션(rota) — 여기서부터 ──` 줄을 찾는다(키보드 ⌘F 로 '교역자 로테이션' 을 찾으면 빠르다)
4. 그 줄 **바로 위**에 빈 줄을 하나 만들고 커서를 둔다 — 다른 줄은 지우지 않는다
5. 아래 덩어리를 통째로 복사해 거기에 붙여 넣는다
   (이미 한 번 붙였다면: `// ── PLAUD 도우미(plaud) — 여기서부터 ──` 줄부터 `// ── PLAUD 도우미 — 여기까지 ──` 줄까지를 지우고 그 자리에 붙인다)
6. 오른쪽 위 **게시** 를 누른다. 붙인 줄이 연한 핑크 바탕이면 '아직 게시 안 한 변경' 표시라 괜찮다.
   줄 번호 옆 빨간 표시나 빨간 물결선이 있으면 게시하지 말고 화면을 캡처해 보여 준다.
7. 계기판(`block7.my/plaudhub/`)을 새로 고친다 — 맨 위에 '계정 칸이 잠겨 있습니다' 가 사라지면 됐다.

```
    // ── PLAUD 도우미(plaud) — 여기서부터 ──
    match /plaud/{uid} {
      function own() { return request.auth != null && request.auth.uid == uid; }
      function d() { return request.resource.data; }
      function idOk(id) { return id.matches('^[A-Za-z0-9_]{8,64}$'); }
      // 맡은 시각(at)은 파이어베이스 시계로만 찍는다(두 Mac 시계가 달라도 맡김 판단이 같게) — 안 바꾸면 그대로 둬도 된다
      function atOk() { return !('at' in d()) || d().at == request.time || (resource != null && 'at' in resource.data && resource.data.at == d().at); }
      allow read, delete: if own();
      allow create, update: if own() && d().keys().hasOnly(['kw', 'days', 'model', 'auto', 'kdf'])
        && (!('kw' in d()) || (d().kw is list && d().kw.size() <= 20))
        && (!('auto' in d()) || (d().auto is map && d().auto.size() <= 12))
        && (!('kdf' in d()) || (d().kdf is map && d().kdf.keys().hasOnly(['s', 'it', 'iv', 'c'])));
      match /rec/{id} {
        allow read, delete: if own();
        allow create, update: if own() && idOk(id) && d().keys().hasOnly(['n', 't', 'c', 'd', 'p'])
          && (!('p' in d()) || d().p is bool)
          && (!('n' in d()) || (d().n is string && d().n.size() <= 300));
      }
      match /job/{id} {
        allow read, delete: if own();
        allow create, update: if own() && idOk(id) && d().keys().hasOnly(['st', 'step', 'mac', 'at', 'pick', 'err', 'gone', 'src', 'odd'])
          && (!('st' in d()) || d().st in ['work', 'done', 'fail'])
          && (!('step' in d()) || d().step in ['get', 'stt', 'drive'])
          && (!('pick' in d()) || d().pick in ['in', 'out'])
          && (!('err' in d()) || (d().err is string && d().err.size() <= 120))
          && (!('gone' in d()) || d().gone is bool)
          && (!('src' in d()) || d().src in ['p', 'w'])
          && (!('odd' in d()) || d().odd is bool)
          && atOk();
      }
      match /mac/{name} {
        allow read, delete: if own();
        allow create, update: if own() && name.size() <= 24 && d().keys().hasOnly(['at', 'doing', 'ready', 'v', 'err', 'cli', 'models', 'test', 'disk', 'listed'])
          && d().at == request.time
          && (!('models' in d()) || (d().models is list && d().models.size() <= 10))
          && (!('test' in d()) || d().test is map)
          && (!('disk' in d()) || d().disk is map);
      }
      match /cmd/{id} {
        allow read, delete: if own();
        allow create, update: if own() && d().keys().hasOnly(['mac', 'what', 'st', 'at', 'arg', 'log'])
          && d().what in ['ffmpeg', 'whisper', 'plaud', 'model', 'login', 'update', 'refresh', 'check', 'mtest', 'rmmodel', 'clean', 'kick', 'rmtxt', 'redo']
          && d().st in ['new', 'run', 'ok', 'fail'];
      }
      // 잠근 사본(P3b) — HB 암호 문구로 잠근 전사 글만(c · iv). 평문 칸은 없다
      match /txt/{id} {
        allow read, delete: if own();
        allow create, update: if own() && idOk(id) && d().keys().hasOnly(['c', 'iv', 'v'])
          && d().c is string && d().c.size() <= 900000 && d().iv is string && d().iv.size() <= 40;
      }
    }
    // ── PLAUD 도우미 — 여기까지 ──
```

### 이 덩어리가 하는 일 (일상어)

- **HB 만** 읽고 쓴다. 다른 계정 · 로그인 안 한 사람은 아무것도 못 본다.
- 칸마다 **넣을 수 있는 이름을 못 박았다** — 일감 칸(`job`)에는 녹음 제목 · 이름 · 전사문이 들어갈 자리가 없다. 실수로 넣으려 하면 파이어베이스가 쓰기를 거절한다.
  녹음 제목은 `rec` 칸에만(HB 결정 11/23 — 폰에서도 보려고). 전사문은 **평문으로는 어느 칸에도 없다**(원본은 구글 드라이브) — `txt` 칸에는 HB 만 아는 암호 문구로 잠근 글자만 받는다(HB 결정 11/23 '가').
- 녹음 번호 꼴(영문 · 숫자 · 밑줄 8 ~ 64자)이 아니면 받지 않는다.
- 맡은 시각 · Mac 소식 시각은 **파이어베이스 시계로만** 찍힌다 — 두 Mac 시계가 달라도 '30분 지나면 풀림' 이 똑같이 셈해진다.
- 설치 요청(`cmd`)은 정해 둔 열네 가지 이름만 받는다(ffmpeg · whisper · plaud · model · login · update · refresh · check · mtest · rmmodel · clean · kick · rmtxt · redo). Mac 도우미도 그 표에 있는 명령만 돌린다.
- Mac 소식(`mac`)의 모델 시험 결과(`test`)에는 모델별 걸린 시간 · 빠르기만 — 시험 전사 글은 그 Mac 안(`~/Library/Application Support/plaudhub/test`)에만 있다.

### 시험

`tests/rules/plaud.rules`(이 덩어리를 감싼 것)를 에뮬레이터로 시험한다 — `tests/rules/README.md`. 둘이 같은지는 `tests/test_plaudhub.js` ⑪ 이 지킨다.
