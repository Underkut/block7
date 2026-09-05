# 합치는 법 — '내 배경'을 index.html 에 넣기

> 이 폴더의 코드는 **아직 앱에 없다.** 아래 대로 붙이면 들어간다.
> 지금 앱은 한 글자도 안 바뀐 상태다 (사진 배경을 만들기 전에는 `--vf-tsh` 가
> 비어 있어 그림자도 안 나온다).

붙일 조각은 넷이다.

| 조각 | 무엇 |
|---|---|
| `vf-bg.js` | 런타임 + 편집기 (본문 전체를 그대로) |
| `vf-bg.css` | 스타일 |
| `vf-bg.html` | 설정창 구역 하나 + 팝업 셋 |
| `test_vfbg.js` | 시나리오 테스트 → `tests/` 로 옮긴다 |

---

## 1. 큰 덩어리 세 개 붙이기

| 무엇 | 어디 (grep 키워드) |
|---|---|
| `vf-bg.css` 의 **②③** (①은 아래 3번에서 따로) | `/* ── 태그 그림 (v26-0825-3` **앞** — 전체화면 CSS 구역 안 |
| `vf-bg.html` 의 **①** (설정창 '내 배경' 구역) | `<div id="vfSecAssign"` 이 든 `</div>` **다음 줄** (테마 구역 바로 아래) |
| `vf-bg.html` 의 **②** (파일 입력 · 칩 메뉴 · 편집기) | `<div id="vfDeeperModal"` 근처, body 끝 팝업들 옆 |
| `vf-bg.js` 전체 | `// ═══ 말씀 전체화면 테마` 구역 **바로 뒤** (VF_PATTERNS 정의 다음) |

⚠️ `vf-bg.js` 안의 `// ══ VFBG:PURE-START ══` / `PURE-END` 두 줄을 **지우지 말 것.**
테스트가 그 사이를 떠서 검사한다.

---

## 2. 기존 함수에 손대는 곳 — 전부 합쳐 열두 줄

`VF_PATTERNS[키]` 를 직접 읽던 자리를 `_vfPat(키)` / `_vfPatOk(키)` 로 바꾼다.
그게 전부다 — 그러면 사용자 배경이 기본 테마와 **같은 자격**으로 흐른다.

| # | 찾을 것 (grep) | 바꿀 것 |
|---|---|---|
| 1 | `return sel.filter(k=>VF_PATTERNS[k]);` | `return sel.filter(k=>_vfPatOk(k));` |
| 2 | `const assigned=(map[_vfSecIdNow()]\|\|[]).filter(k=>VF_PATTERNS[k]&&sel.indexOf(k)>=0);` | `…filter(k=>_vfPatOk(k)&&sel.indexOf(k)>=0);` |
| 3 | `if(!_vfCurPattern\|\|!VF_PATTERNS[_vfCurPattern])` | `if(!_vfCurPattern\|\|!_vfPatOk(_vfCurPattern))` |
| 4 | `const p=VF_PATTERNS[_vfCurPattern];` (`_vfRollVariant` 안) | `const p=_vfPat(_vfCurPattern)\|\|VF_PATTERNS.night;` |
| 5 | `if(!VF_PATTERNS[key])return;` (`toggleVfPattern` 첫 줄) | `if(!_vfPatOk(key))return;` |
| 6 | `const key=_vfPatternKey(),p=VF_PATTERNS[key];` (`_vfTheme`) | 아래 ⓐ |
| 7 | `if(!t.bg\|\|!t.bg.length)return'var(--bg)';` (`_vfBgCss`) | **앞에** `if(t&&t.photoCss)return t.photoCss;` 한 줄 |
| 8 | `'--vf-ls':t.ls\|\|'0','--vf-grain':String(t.grain\|\|0),` (`applyVfTheme`) | 같은 객체에 `'--vf-tsh':t.tsh\|\|'none',` 한 줄 |
| 9 | `  }).join('');`⏎`  _renderVfSecAssign();` (`_renderVfThemeChips` 끝) | 그 아래 `  _vfbgRenderChips();` 한 줄 |
| 10 | `if(th.grain\|\|th.vig)_cardGrain(ctx,W,H,` (`_shotDraw`) | **앞에** `if(th.user)_vfbgDrawPhoto(ctx,th,W,H);` 한 줄 |
| 11 | `const p=VF_PATTERNS[key]\|\|VF_PATTERNS[VF_THEME_ORDER[0]];` (`_vcThemeVars`) | **앞에** `if(_vfbgIsUserKey(key)){const cv=_vfbgCardVars(key);if(cv)return cv;}` |
| 12 | `vfThemeBySec:{},vfTextScale:0.6,` (`_settingsDefaults`) | `vfBgs:[],` 를 끼워 넣는다 |

**ⓐ `_vfTheme()` 첫머리** — 두 줄을 더한다:
```js
function _vfTheme(){
  const key=_vfPatternKey();
  if(_vfbgIsUserKey(key)){const t=_vfbgTheme(key);if(t)return t;}   // ← 더하는 줄
  const p=VF_PATTERNS[key]||VF_PATTERNS.night;                      // ← 원래 줄을 쪼갠 것
  …이하 그대로…
```

**공유 이미지의 글씨 그림자** (`_shotDraw`, 있으면 좋고 없어도 도는 것):
태그 그림을 그린 블록 **바로 뒤**에 `_vfbgShadowOn(ctx,th,SC);`,
캔버스를 돌려주기 직전에 `_vfbgShadowOff(ctx);`.

**ESC 표** (`_ESC_CLOSERS`) — `['vfDeeperModal', …]` 줄 **위에** 두 줄:
```js
  ['vfbgEdit',        ()=>closeVfbgEdit()],
  ['vfbgMenu',        ()=>closeVfbgMenu()],
```

---

## 3. 앱 CSS 에 더하는 다섯 줄 (`vf-bg.css` 의 ①)

전체화면 글씨에 그림자 자리를 낸다. 값은 사진 배경일 때만 들어온다.
```css
#vfText{text-shadow:var(--vf-tsh,none);}
.vf-ptitle{text-shadow:var(--vf-tsh,none);}
#vfRef{text-shadow:var(--vf-tsh,none);}
.vf-meta,.vf-act,.vf-top{text-shadow:var(--vf-tsh,none);}
```
그리고 **종이결·비네트는 그림을 두 벌로 만들지 않는다** — 이미 있는 두 선택자에
`,#vfbgStage` 만 덧붙이고 `vf-bg.css` 안의 `#vfbgStage::after/::before` 덩이는 지운다:
```css
#verseFull::after,#verseGrid::after,.vc-body::after,#vfbgStage::after{ … }
#verseFull::before,#verseGrid::before,.vc-body::before,#vfbgStage::before{ … }
```

---

## 4. 제품(Sweeter)과의 관계 — `_PRODUCT_SCOPED` 는 **건드리지 않는다**

- `vfBgs`(만든 배경 목록)는 두 제품이 **함께 쓴다.** 같은 사람이 올린 같은 사진이다.
- 어느 배경을 켜 두는지는 `vfThemes` 가 정하는데 그건 **이미 제품별**이라,
  BLOCK7 과 Sweeter 는 저절로 다른 배경을 쓸 수 있다.
- 사진 보관 키(`b7bg:*`)에 제품 이름을 넣지 않는 것도 같은 까닭이다.
  ⚠️ 2026-08-31 사고는 "저장 키는 갈렸는데 **동기화 기준점**은 안 갈려서" 난 것이고,
  여기서 갈리는 것은 없다 (기준점 세 키를 건드리지 않는다).

## 5. 마무리

1. `node tests/test_vfbg.js` (옮긴 뒤) → 전부 통과
2. `./tools/check.sh` 전체 통과
3. `./tools/make-dev.sh` · `./tools/make-sweeter.sh` · `./tools/make-map.sh` 다시 돌려 함께 커밋
4. 버전 두 줄(2번째 줄 주석 · `APP_VERSION`)을 `main` 의 마지막 값 +1 로

## 6. 합친 뒤에도 남는 숙제

- **다른 기기로 사진 옮기기.** 지금은 기기마다 사진을 고른다. 옮기려면
  프리셋 하나를 파일(.json, 사진 포함)로 내보내고 불러오는 길을 만들면 된다
  (클라우드는 건드리지 않는다 — 설계.md 3장).
- **말씀 위젯**은 아직 사진 배경을 안 쓴다 (색만).
- 편집기의 '이름 바꾸기'는 지금 브라우저 `prompt()` 다. 앱의 입력 팝업으로
  바꾸려면 그 자리 한 줄만 갈아 끼우면 된다.
