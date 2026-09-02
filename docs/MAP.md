# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-0902-16** · 전체 31,118줄 · 구역 264개 · 함수 1559개

---

## 이 문서를 쓰는 법

index.html 은 146만 자라 **통째로 읽으면 안 됩니다.** 고칠 자리를 찾는 순서:

1. 아래 목록에서 고치려는 기능의 **구역 이름**이나 **함수 이름**을 찾는다
2. 그 이름으로 `grep -n` 한다 — 구역 이름은 주석에 그대로 들어 있어 한 번에 걸린다
3. 걸린 줄 앞뒤 필요한 만큼만 읽는다

**줄 번호는 편집 한 번에 전부 밀립니다.** 여기 적힌 번호는 "대략 어디쯤"을 가늠하는
용도이지, 그 줄을 바로 열라는 뜻이 아닙니다. 믿을 것은 이름(grep 키워드)입니다.

---

## 1. 큰 덩어리

| 대략 줄 | 분량 | 종류 | 무엇이 있나 |
|---|---|---|---|
| 7~35 | 29줄 (0%) | JS | 동작 (자바스크립트) |
| 36~62 | 27줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 63~374 | 312줄 (1%) | JS | 동작 (자바스크립트) |
| 377~3,795 | 3,419줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 3,796~4,026 | 231줄 (1%) | JS | 동작 (자바스크립트) |
| 4,044~6,204 | 2,161줄 (7%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,205~31,115 | 24,911줄 (80%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 421 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 505 | HEADER |
| 522 | Verse bar (네비게이토 180) |
| 523 | Verse bar outer wrapper |
| 524 | 말씀 전체 화면 (릴스형) |
| 532 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 672 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 699 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 750 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 877 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 975 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,017 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,249 | 스닉픽 한 줄 |
| 1,399 | DATE NAV |
| 1,417 | GNB 날짜 (#hDate) |
| 1,440 | DATE SWIPE OVERLAY |
| 1,442 | MINI MOVE MENU |
| 1,461 | DATE PICKER OVERLAY |
| 1,557 | TIME SECTION |
| 1,588 | Event chips (shown inline in the section header, next to the |
| 1,714 | BLOCK SWIPE WRAPPER |
| 1,737 | BIG BLOCK (E method: colored left bar, no indent) |
| 1,849 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 1,923 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 1,928 | 연락처 관리 모달 |
| 1,954 | @닉네임 태그 할일 모아보기 |
| 2,005 | 헤더 슬라이드 입력창 (B안) |
| 2,031 | 헤더 + 버튼 (할일 추가) |
| 2,050 | ▲ 숨기기 버튼 |
| 2,082 | TRASH PANEL |
| 2,128 | DATE NAV |
| 2,181 | TASK MOVE MINI MENU |
| 2,228 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 2,251 | Event add modal |
| 2,377 | WEEKLY/MONTHLY |
| 2,472 | D뷰 좌우 분할 (넓은 화면) |
| 2,483 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 2,506 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 2,513 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 2,841 | LOGIN / AUTH SCREEN |
| 2,917 | SETTINGS PANEL |
| 2,958 | 설정 등급(이지·미드·파워) 고르기 |
| 3,106 | 강조 표시 고르는 줄 (v26-0812-15) |
| 3,126 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 3,286 | 시간 구간 경계선 |
| 3,326 | 말씀 대시보드 |
| 3,415 | 색상 테마: 뷰 탭 요약 줄 |
| 3,432 | 색상 테마 선택 화면 |
| 3,525 | 미리보기 목업 |
| 3,744 | 편집 모드 |
| 3,777 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 153 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 187 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 226 | 글자용 강조색 (--ac-tx) | `_thAcText`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 358 | 조기 적용 (첫 페인트 전) | – |
| 3,976 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 6,244 | 네비게이토 180 암송성구 데이터 | – |
| 6,271 | Color presets | – |
| 6,289 | 네비게이토 180 verse bar | – |
| 6,290 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 6,305 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 6,344 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 6,359 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 6,480 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses` |
| 6,527 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_TOTAL` |
| 6,565 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 6,571 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 6,659 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList`, `openCollAddMenu` … 외 2개 |
| 6,955 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `verses`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 7,068 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 7,119 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 7,193 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 7,311 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 7,393 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid` |
| 7,531 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propBooks`, `_propRowsToItems`, `col` … 외 6개 |
| 7,919 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 8,022 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 8,095 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 8,134 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `openShareDialog`, `closeShareDialog`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy`, `shareVia`, `_fmtSubDate`, `runSharedCollSync` … 외 4개 |
| 8,364 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncFirstItem`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 8,607 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseBarModeFlip`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual`, `randomVerseManual`, `toggleVerseBarOn`, `openVerseSettingsModal`, `closeVerseSettingsModal`, `_verseSettingsOpen`, `_escShown`, `_vstabList` … 외 7개 |
| 9,126 | 인앱 말씀 팝업 | – |
| 9,130 | 말씀 푸시 알림 설정 | `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 9,158 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 9,247 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent` |
| 9,438 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 9,449 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 9,514 | 암송 관리 | `getMemLog` |
| 9,521 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 9,544 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 9,567 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare` |
| 9,578 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 9,598 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 9,766 | BibleLinkProvider | `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 9,954 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast` |
| 10,025 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 10,258 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `closeVerseFull`, `_verseFullIsOpen` |
| 10,331 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 10,339 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns`, `_vfApplyParallelRule` … 외 21개 |
| 10,958 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 10,996 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 6개 |
| 11,301 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 11,401 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 11,407 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 11,455 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount`, `_vfSyncCounts`, `setCnt` … 외 1개 |
| 11,604 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0831-7, HB 승인) | – |
| 11,641 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 11,750 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 11,851 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 12,114 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 12,256 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 12,271 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 12,502 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 12,515 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 12,529 | 명조 | – |
| 12,537 | 고딕 | – |
| 12,546 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptEnsureFont`, `finish`, `_ptFontLoaded`, `_ptStillTrying` … 외 22개 |
| 13,020 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav`, `vfHomeAction`, `_vfSyncTopBar`, `_vfCurrentVerse` |
| 13,188 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 2개 |
| 13,392 | 설정창 (말씀설정 → 전체화면 탭) | `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 13,451 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 13,553 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 13,575 | 대표 문구 줄바꿈 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 13,623 | 명제 대표 문구 타이틀 | – |
| 13,626 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 13,779 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag`, `_vgEscAttr`, `_vgRawPool` … 외 32개 |
| 14,313 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 14,318 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 14,419 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 14,446 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 14,470 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 14,507 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 19개 |
| 15,045 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 15,135 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 15,232 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 15,244 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 15,367 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `eventRepeatsOnDate`, `eventOccursOnOwnDate`, `getDisplayEvents`, `sortEventsByTime`, `renderSecEvents` |
| 15,590 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 15,702 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 15,742 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 15,780 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 15,814 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 16,061 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 16,083 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 16,095 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 16,147 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 16,403 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 16,460 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 16,695 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 16,910 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 16,966 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 17,001 | 정렬 (v26-0831-11, HB) | – |
| 17,005 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vListControlsHTML`, `sortBtn`, `pairKey`, `pairOn`, `perBtn`, `_vlTabsHTML` … 외 17개 |
| 17,290 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 17,360 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 17,386 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairKey`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 17,415 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 17,560 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 17,595 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker`, `keepPickToggle`, `keepPickNew`, `n` |
| 17,684 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashPref`, `_vDashEntries`, `_vDashVerse`, `_vDashKeysOf`, `tags`, `_vDashSlices` … 외 6개 |
| 17,880 | 장절 느슨한 대조 | `_refNorm` |
| 17,917 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 17,959 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 18,042 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoColl`, `openVcCollSettings`, `_vsetRestoreBack`, `openVerseCollSettings` |
| 18,117 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `vDashOpenDetail`, `kindLabel`, `axisLabel`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId`, `_vcCreate` … 외 4개 |
| 18,274 | 카드가 도는 범위 | `_vcVerses`, `_vcCurrent`, `_vcFilterLabel` |
| 18,314 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 18,354 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 18,365 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 18,386 | 카드 한 장 HTML | `_vcCardHTML` |
| 18,465 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 18,554 | 카드 동작 | `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind`, `vcBackToList`, `vlToCard`, `vcAddCard` … 외 1개 |
| 18,834 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale`, `next`, `setVcTheme` … 외 2개 |
| 19,101 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 19,121 | 각 컬럼 렌더링 | – |
| 19,141 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 19,149 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 19,162 | 3단 주간뷰 패널 | – |
| 19,186 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 19,222 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 19,351 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 19,436 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `curSecId` … 외 2개 |
| 20,158 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 20,159 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 20,182 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 20,236 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 20,364 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge`, `devInboxRefreshBadge`, `devInboxToggleAll` … 외 8개 |
| 20,603 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 20,639 | 개발자 쪽지 (설정창 계정탭) | – |
| 20,651 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 21,044 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `makeBigWrap`, `getCarryCount`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal` … 외 9개 |
| 21,776 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 21,781 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 21,820 | Desktop: right-click → task move context menu | – |
| 21,827 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 22,025 | Hold off the browser's scroll gesture WHILE the long-press | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 22,083 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 22,098 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 22,151 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 22,509 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 22,848 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 22,915 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 23,063 | While editing a big/small task's text | – |
| 23,092 | Not editing text: arrow-key driven selection | – |
| 23,123 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 23,350 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 23,427 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 23,501 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 23,602 | Event add modal | `syncRollDisplays` |
| 23,629 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 23,875 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 23,942 | Touch | – |
| 23,974 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `toggleDailyRepeat`, `ensureDailyRepeats`, `moveTaskTo`, `prepDatePicker` … 외 24개 |
| 24,822 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 25,337 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 25,441 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 15개 |
| 25,991 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 25,992 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 26,064 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 26,345 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 26,520 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 26,674 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 26,771 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 26,846 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 26,903 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 26,992 | Backup / restore | `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 27,120 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 27,262 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 27,267 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 27,289 | 진단 기록 보조 저장소 (localStorage) | – |
| 27,293 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 27,871 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 27,903 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 28,007 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 28,023 | Day-change catch-up on wake | – |
| 28,074 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 28,244 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 28,339 | 푸시 배관(토큰) 공용 | – |
| 28,350 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 28,459 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 28,487 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 28,521 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 28,532 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 28,563 | 알림 테스트 | `testLocalNotification`, `sendTestPush`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage`, `authSignOut` |
| 28,703 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 28,774 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle` |
| 28,812 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay`, `_mgById`, `_fbHasAdoptedCloud` … 외 25개 |
| 29,376 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 29,484 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfCardHTML`, `auto`, `cfRender`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `fbPushState`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync` … 외 1개 |
| 29,695 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 29,834 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn` |
| 30,172 | 담아두기 | `getKeepLog` |
| 30,185 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 30,255 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept`, `swKeepSet`, `l0` … 외 8개 |
| 30,429 | 저장 | `_swLoadTiles`, `raw`, `_swSaveTiles`, `_swSpareKinds` |
| 30,450 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermons`, `_swBooks`, `_swTags`, `_swReacts`, `_swValues`, `_swStrip` |
| 30,552 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swCellHTML`, `_swFace` |
| 30,640 | 그리기 | `_swTileClass`, `_swRender` |
| 30,667 | 편집 모드 | `_swEditOn`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `_swNoMotion`, `_swTrack`, `_swTrackTo`, `_swRepaint` |
| 30,745 | 누르면 전체화면 | `_swOpenVerse`, `_swVersesFor`, `_swTileOpen` |
| 30,801 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 30,820 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap` |
| 31,070 | 켜고 끄기 | `swToggleHome`, `_swBoot` |
| 31,093 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`  `_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`
`_applySneakMaxW`  `_attachRepeatButtons`  `_attachTextPinch`  `_attachVliMenus`  `_attachWeeklyPaneDrag`  `_avgHex`
`_backupDownload`  `_bibleRankOfRef`  `_bookAbbr`  `_bookCanon`  `_bookNorm`  `_bookOfRef`
`_bookSel`  `_booksOf`  `_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`  `_buildShareText`
`_bumpVerseStat`  `_calKey`  `_cardActionCount`  `_cardGrain`  `_cardTextLS`  `_carryDateInScope`
`_carryPendingCount`  `_carryScope`  `_ceFillSelects`  `_cellDefaultSec`  `_ceMakeRow`  `_ceSortedIdx`
`_ceToggleTrashSel`  `_ceUpdateDeleteBtn`  `_ceUpdateRestoreBtn`  `_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfApply`
`_cfCanMerge`  `_cfCardHTML`  `_cfDetect`  `_cfDiffer`  `_cfEsc`  `_cfFetchCloud`
`_cfId`  `_cfJ`  `_cfKindLabel`  `_cfLoadLocal`  `_cfMake`  `_cfOpenCount`
`_cfPushCloud`  `_cfSaveLocal`  `_cfScanById`  `_cfScanKeys`  `_cfScanSection`  `_cfSecLabel`
`_cfSelKey`  `_cfShrink`  `_cfSortKey`  `_cfStore`  `_cfSyncVisibility`  `_cfText`
`_cfTrimmed`  `_cfUnion`  `_cfWhoLabel`  `_chk`  `_clearPendingVerse`  `_closeHdrCalendarNow`
`_colKey`  `_collFilteredVerses`  `_collIsProp`  `_collLabel`  `_collPeriodPass`  `_collRawVerses`
`_collVersePassesFilter`  `_copyTextFallback`  `_crossSwipeAllowed`  `_currentColl`  `_currentSecId`  `_dataURLtoBlob`
`_dayHasContent`  `_desat`  `_devAttachSwipe`  `_devCompressFile`  `_devFilesHTML`  `_deviceBaseW`
`_deviceId`  `_deviceLabel`  `_devInboxButton`  `_devMarkRead`  `_devMigrateRead`  `_devNotifOn`
`_devNotifSet`  `_devReadIds`  `_devReadLocal`  `_devShortSide`  `_devTrashGet`  `_devTrashSet`
`_devWhen`  `_devWhenTxt`  `_dismissReactToast`  `_dismissToast`  `_dlog`  `_dlogScroll`
`_dNavEl`  `_doCarry`  `_dragZoneMid`  `_dropStalePending`  `_dsCapture`  `_dsOverlay`
`_dsProject`  `_dsRead`  `_dsWrite`  `_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`
`_entrySecId`  `_escShown`  `_evenDeeperShortRef`  `_evFillMins`  `_evMarkDropSec`  `_evMoveToSec`
`_evSecAt`  `_evSyncRange`  `_fallbackCopy`  `_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`
`_fbBulkLoss`  `_fbClearBase`  `_fbCollectConflicts`  `_fbCommit`  `_fbCountArrays`  `_fbCountByKind`
`_fbCountItems`  `_fbDeviceIdle`  `_fbEnsureSync`  `_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`
`_fbIsUserEdit`  `_fbLoadPersistedBase`  `_fbMaybeSelfUpdate`  `_fbMerge`  `_fbMergeGuarded`  `_fbNoteConflicts`
`_fbReady`  `_fbScheduleRetry`  `_fbSetBase`  `_fbVerIsOlder`  `_fbWarnLegacyWriter`  `_fbWriteBackup`
`_fetchSheetCsv`  `_fetchVerseStat`  `_fillMinOptions`  `_fillVerseBarDOM`  `_findVerseByRefLoose`  `_flatMemEntries`
`_flatSimpleEntries`  `_fmtRefForText`  `_fmtSubDate`  `_genCollId`  `_generateUniqueShareCode`  `_getCollFilter`
`_ghostDragStart`  `_groupVersesBy`  `_groupVersesByMulti`  `_gSrcId`  `_hdrCalRender`  `_hexNum`
`_hiAssign`  `_hiBold`  `_hiFw`  `_hiHash`  `_hiHTML`  `_hiKindsOn`
`_hiLinesHTML`  `_hiOn`  `_hiOverlap`  `_hiOverlay`  `_hiPen`  `_hiPhrases`
`_hiPickAt`  `_hiRanges`  `_hiRefreshAll`  `_hiRibbon`  `_hiRng`  `_hiShuffle`
`_hiSmooth`  `_hiSquash`  `_hiStar`  `_hiStarMax`  `_hiStarPoly`  `_hiWave`
`_hiWavePoly`  `_hiWob`  `_idbDel`  `_idbDelOutcome`  `_idbDelRaw`  `_idbForget`
`_idbGet`  `_idbGetOutcome`  `_idbGetRaw`  `_idbOpen`  `_idbRaw`  `_idbSet`
`_idbSetOutcome`  `_idbSetRaw`  `_importVerseRows`  `_initEdgeBack`  `_initHdrDateLongPress`  `_initSettingsSwipe`
`_initSneakMaxWPicker`  `_initVerseAlarmPicker`  `_initVerseBarSwipe`  `_initVerseFullGestures`  `_initVerseGridGestures`  `_initVerseNotifBridge`
`_initVerseSettingsSwipe`  `_initVfCatSheet`  `_invalidateVerseCaches`  `_isDevAccount`  `_isPhoneForm`  `_isPropSheet`
`_isReactPid`  `_isTouchDevice`  `_keepAfterChange`  `_keepAttr`  `_keepBindDrag`  `_keepDeleteList`
`_keepEntries`  `_keepListOf`  `_keepLists`  `_keepListsOf`  `_keepNameCommit`  `_keepNameKey`
`_keepOrder`  `_keepRenameList`  `_keepRepaintLists`  `_keepSetOrder`  `_keepSort`  `_keepSortLists`
`_keepSortRowHTML`  `_lay`  `_layApplyWidths`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`
`_layMode`  `_loadSheetJs`  `_localOwner`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`
`_looksLikeRef`  `_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`  `_makeTimeRollPair`
`_makeWMViewBtnsHTML`  `_menuArmOnNextPress`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`
`_mgEntryArray`  `_mgLogFlat`  `_mgLogNested`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`
`_moveDateToastMsg`  `_mviewEventCountsHTML`  `_mviewRowHTML`  `_noiseTile`  `_notifAckToSW`  `_notifAnnounceReady`
`_notifAuthBlocking`  `_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`  `_notifLog`
`_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifMark`  `_notifNewId`  `_notifPid`
`_notifSameRef`  `_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`  `_notifStop`
`_notifTakeIntent`  `_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`  `_openCellEvent`
`_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openVerseByRef`  `_openVerseFromLink`  `_outcomeText`
`_parseCsv`  `_parseVDate`  `_populateMorningTimePickers`  `_propBooks`  `_propRefs`  `_propRowsToItems`
`_psIsDefault`  `_psOverlay`  `_psProject`  `_PT_FAMS`  `_ptBag`  `_ptDrawnLines`
`_ptEnsureFont`  `_ptFont`  `_ptFontFor`  `_ptFontLoaded`  `_ptFontPending`  `_ptFontsOn`
`_ptGroupInit`  `_ptLen`  `_ptLineK`  `_ptMissing`  `_ptSample`  `_ptSplitOnce`
`_ptStillTrying`  `_ptSyncFontUI`  `_ptWarmup`  `_ptWrapTitle`  `_publishSharedColl`  `_pushKey`
`_pushKeyPid`  `_reactKey`  `_reactKeyParts`  `_reactWithToast`  `_readPendingVerse`  `_reassignTimedEvents`
`_recoverySummary`  `_refDigitsPad`  `_refKey`  `_refNorm`  `_releasePushTokenIfIdle`  `_renderBookList`
`_renderGroupList`  `_renderKeepPicker`  `_renderKeepSubMenu`  `_renderKeepSwitch`  `_renderMemHistoryDash`  `_renderMemHistoryList`
`_renderMonthTitleFormatBtns`  `_renderPickerInto`  `_renderSecPick`  `_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`
`_renderUiLevelIcons`  `_renderVAggBody`  `_renderVerseUiLevelIcons`  `_renderVfSecAssign`  `_renderVfThemeChips`  `_rewriteLogRefs`
`_rgba`  `_rowsToItems`  `_rpAddBtnHTML`  `_rpAttachChipDrag`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`
`_rpAttachVResize`  `_rpChipName`  `_rpCurrentRatio`  `_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`
`_rpMonthOf`  `_rpNormMonth`  `_rpSetMGridH`  `_rpSetVCardH`  `_rpSetVListH`  `_rpTypeOk`
`_rpVCardH`  `_rpVListH`  `_rpWidgetHTML`  `_rpWidgetName`  `_secArchiveApply`  `_secArchiveCapture`
`_secBoundaryChoices`  `_secDataCount`  `_secFirstBoundary`  `_secIdForTime`  `_secIdNowAll`  `_secIsCustom`
`_secLenMin`  `_secMoveTo`  `_secNormalizeTimes`  `_secNoTime`  `_secOffsets`  `_secsCommit`
`_secStripData`  `_secTimeChoices`  `_secWouldEmptyDay`  `_setLocalOwner`  `_sharedVerseIn`  `_sharedVerseOut`
`_shareFileName`  `_shareMessage`  `_shareSizeKey`  `_sheetCopyPending`  `_sheetGo`  `_sheetRowsSane`
`_sheetUrlForVerse`  `_shotDraw`  `_shotFont`  `_sneakMaxW`  `_sneakMaxWDefault`  `_sortEventsKeepingTimeless`
`_sortGroups`  `_stabList`  `_statDocKey`  `_statRefKey`  `_swAddTile`  `_swArtHTML`
`_swBooks`  `_swBoot`  `_swCellHTML`  `_swDragHole`  `_swDragHoleOff`  `_swDragMove`
`_swDragStart`  `_swEditOn`  `_swEsc`  `_swFace`  `_swFinishSwipe`  `_swInitGestures`
`_swIsKept`  `_swKeeps`  `_swKillTile`  `_swLastVerses`  `_swLoadTiles`  `_swNoMotion`
`_swOn`  `_swOpenVerse`  `_swPipsHTML`  `_swReacts`  `_swRender`  `_swReorder`
`_swRepaint`  `_swRepaintKeepTiles`  `_swSaveTiles`  `_swSermons`  `_swSizeCells`  `_swSnap`
`_swSpareKinds`  `_swStrip`  `_swTags`  `_swTileClass`  `_swTileOpen`  `_swTrack`
`_swTrackTo`  `_swValues`  `_swVersesFor`  `_syncBpPickers`  `_syncCarryScopeBtns`  `_syncCondRows`
`_syncDeviceNotifyUI`  `_syncDevInboxVisibility`  `_syncEventDateUI`  `_syncHdrDateOptical`  `_syncHiOverlapRow`  `_syncHiUI`
`_syncLayFormUI`  `_syncLinkOpenModeUI`  `_syncShareSettingsUI`  `_syncShareSizeUI`  `_syncSheetVersesIntoColl`  `_syncTimeStepBtns`
`_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVersePushPool`  `_syncVersePushUI`  `_syncVfTextScaleUI`  `_syncVpTimeField`
`_syncVpTimeList`  `_t2m`  `_tagartAliasMap`  `_tagartDrawOn`  `_tagartHay`  `_tagartHit`
`_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`  `_thAcText`
`_thContrast`  `_thDeltaE`  `_themePreviewHTML`  `_themeSummaryText`  `_themeTokens`  `_thFade`
`_thHex`  `_thLab`  `_thLabF`  `_thLabFi`  `_thLabRgb`  `_thLin`
`_thLum`  `_thMix`  `_thOn`  `_thPanelMix`  `_thRgb`  `_thRgba`
`_thRound`  `_thTintDE`  `_thTintK`  `_thUnlin`  `_thWorst`  `_timeStep`
`_toThisMonth`  `_tryCloseLogoMenu`  `_tsFine`  `_tsNearest`  `_tsPinchArm`  `_tsPinchBusy`
`_tsTouchDist`  `_uiLvIconSVG`  `_uiScaleGet`  `_uiScaleSliderPaint`  `_updateCfAllCount`  `_updateDragHintBounds`
`_vAggSyncKeepTitle`  `_vcAll`  `_vcApplyNav`  `_vcAttachGestures`  `_vcCardHTML`  `_vcCreate`
`_vcCurrent`  `_vcCurX`  `_vcFilterLabel`  `_vcGet`  `_vcGroupOf`  `_vcGroupOn`
`_vcHash`  `_vcIdOf`  `_vcIs`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcNewId`
`_vcPatternKey`  `_vcRemove`  `_vcShow`  `_vcShowFor`  `_vcSlideCommit`  `_vcSlideEl`
`_vcSyncCounts`  `_vcTextScale`  `_vcThemeVars`  `_vcUnplacedForKind`  `_vcVerses`  `_vDashCellHTML`
`_vDashEntries`  `_vDashKeysOf`  `_vDashMarkReturn`  `_vDashMaybeReturn`  `_vDashPeriodBtnsHTML`  `_vDashPieDetailSVG`
`_vDashPieSVG`  `_vDashPref`  `_vDashSlices`  `_vDashVerse`  `_verCmp`  `_verNums`
`_verseBarModeFlip`  `_verseBarSlideNav`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`  `_verseIdentity`
`_verseIdxForSec`  `_verseRefFromUrl`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`  `_vfApplyClauseRule`
`_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfApplyPropAlign`  `_vfArtSyncUI`  `_vfBgCss`  `_vfBottomEl`
`_vfBreakClass`  `_vfCanBreakAt`  `_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`  `_vfCycleMode`
`_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`  `_vfGeException`  `_vfHeartBurst`
`_vfHideCovers`  `_vfHideCoversNow`  `_vfIsHeotdoeException`  `_vfIsParallelWord`  `_vfIsProp`  `_vfIsSubject`
`_vfLayoutPropText`  `_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`
`_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`  `_vfPlaceTagArt`  `_vfPropInk`  `_vfReadWrappedLines`
`_vfRedrawPropInk`  `_vfRenderCard`  `_vfRenderPropTitle`  `_vfRenderRef`  `_vfRenderTagArt`  `_vfRollProp`
`_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`  `_vfSetNav`  `_vfShareImage`  `_vfShareSizeRow`
`_vfShareText`  `_vfShortOK`  `_vfShufGo`  `_vfShufPickRandom`  `_vfShufPos`  `_vfShufPush`
`_vfShufReset`  `_vfSizePropTitle`  `_vfSkipsForced`  `_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncTopBar`
`_vfTextScale`  `_vfTheme`  `_vfWrapFit`  `_vgAxisItems`  `_vgAxisLabel`  `_vgBookOne`
`_vgDate`  `_vgEscAttr`  `_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`
`_vgFamily`  `_vgFilteredPool`  `_vgFilterLabelText`  `_vgFlatPresets`  `_vgGroupKey`  `_vgGroupLabel`
`_vgHighlightTile`  `_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`  `_vgOpenFromRef`
`_vgPinchSteps`  `_vgRawPool`  `_vgRenderTabs`  `_vgRestoreHighlight`  `_vgScrollToVerse`  `_vgSetCols`
`_vgShortRef`  `_vgSort`  `_vgSyncExcl`  `_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`
`_vgTab`  `_vgTileHtml`  `_vgTilePreset`  `_vgTileStyle`  `_vlApplySort`  `_vlClearRegIdx`
`_vlDispRef`  `_vliOpenFull`  `_vlIsProp`  `_vListControlsHTML`  `_vListRange`  `_vListRefresh`
`_vListRowsHTML`  `_vlPref`  `_vlRegIdx`  `_vlTab`  `_vlTabsHTML`  `_vmmSyncFirstItem`
`_vpDiagCopyFallback`  `_vpDiagFmt`  `_vpDiagHead`  `_vpEveryLabel`  `_vpSave`  `_vpToMin`
`_vpTurnOn`  `_vsetGoColl`  `_vsetRestoreBack`  `_vstabList`  `_vwSize`  `_withFullscreenLayout`
`_withOutcome`  `_withTimeout`  `_wkPaneActive`  `_wkVerseMarksHTML`  `a`  `ab`
`activateItem`  `ACTIVE_TOTAL`  `ACTIVE_VERSES`  `addCustomSuffix`  `addCustomVerseFromForm`  `addDays`
`addNewCollection`  `addNewSection`  `addVerseAlarmCustomTime`  `ALL_VERSES`  `anchor`  `appConfirm`
`applyPreset`  `applyRemoteState`  `applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`
`applyUiLevel`  `applyUiScale`  `applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `arr`
`assigned`  `attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`
`attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authSetLoading`  `authSignOut`
`authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`  `away`  `axisLabel`
`b`  `barRef`  `barTags`  `base`  `beforeSave`  `begin`
`bindHold`  `body`  `book`  `build`  `buildBackupFilename`  `buildFlatList`
`buildLanes`  `bump`  `byName`  `c`  `cancelDragKeepingItem`  `cancelMousePress`
`cancelPressTimer`  `ceAddGoogleLink`  `ceCloseDeletePopup`  `ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`
`cellTodoSave`  `ceMoveTrash`  `ceOpenDeletePopup`  `ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`
`ceSelectMethod`  `ceSetSort`  `ceToggleFilter`  `ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`
`cfRender`  `chap`  `checkDataRecovery`  `checkVerseAlarm`  `chM`  `clamp`
`cleanupEmptyDays`  `clear`  `clearActive`  `clearContactForm`  `clearDropIndicators`  `clearPaint`
`clearTrash`  `closeAccountSensitiveModals`  `closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`
`closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`
`closeHdrCalendar`  `closeInlineInput`  `closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`  `closeLogoMenu`
`closeMemorizationHistory`  `closeMemRecPopup`  `closeRepeatSubPicker`  `closeRpConfig`  `closeSecDelModal`  `closeSettings`
`closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`  `closeSmGhost`  `closeSubscribeDialog`  `closeSyncConflicts`
`closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`  `closeTrash`  `closeVcSettings`  `closeVDashDetail`
`closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`  `closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`
`closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`  `closeVerseSettingsModal`  `closeVfShare`  `closeVliMenu`
`closeVliMenuFromOverlay`  `cnt`  `code`  `col`  `collAddAction`  `collMenuAction`
`color`  `commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`  `contactAction`  `contactBadgeCountChanged`
`copy`  `core`  `cur`  `currentMatchingPresetName`  `currentViewKey`  `curSecId`
`cx`  `damp`  `dayOfYearVerseIdx`  `daysFromToday`  `deeperN`  `defaultState`
`defIds`  `deleteCollection`  `deleteEventFromMenu`  `deleteLatestVerseEvent`  `deleteSection`  `deleteSectionConfig`
`devInboxDelete`  `devInboxLoad`  `devInboxRefreshBadge`  `devInboxToggleAll`  `devInboxUpdateBadge`  `devNoteHandleFile`
`devNoteSend`  `devNoteToggle`  `devTrashDelete`  `devTrashEmpty`  `devTrashRender`  `devTrashToggle`
`done`  `doRedo`  `doSubscribe`  `doUndo`  `download`  `draw`
`dropDrag`  `dropSecArchive`  `dup`  `editContact`  `editEventFromMenu`  `el`
`email`  `emailTag`  `endDrag`  `endPinch`  `ensureDailyRepeats`  `esc`
`evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`  `exportBackup`  `fam`  `fbForceUploadLocal`
`fbPushState`  `fbStartListening`  `fill`  `findColl`  `findFlatIndex`  `findLaneIndex`
`findMentionedContacts`  `finish`  `first`  `fit`  `focusItemInput`  `formatEventTime`
`getActiveColls`  `getBigs`  `getCarryCount`  `getChips`  `getContainer`  `getCustomVerses`
`getDay`  `getDayFadeClass`  `getDeeperLog`  `getDisplayEvents`  `getDOW`  `getDropTarget`
`getEvenDeeperLog`  `getEvents`  `getKeepLog`  `getLikeLog`  `getMemLog`  `getMemorizationsForDate`
`getMemorizationsForSection`  `getRowEl`  `getSecColor`  `getShareLog`  `getSmalls`  `getStableDt`
`getTasksTaggedWithContact`  `getTrack`  `getTrash`  `getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`
`getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`  `getWraps`  `gid`  `go`
`goToDate`  `hdrCalGoToday`  `hdrCalNav`  `hdrCalPick`  `hh`  `hideBusyToast`
`hit`  `home`  `importBackup`  `importFromFile`  `initAppUI`  `initCrossViewSwipe`
`initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`  `inner0`
`inspectRecoveryDate`  `IS_TOUCH`  `isAnyInputFocused`  `isCollActive`  `isDark`  `isExcluded`
`isNowWithinSection`  `isOver`  `isSwipeZone`  `isToday`  `isTouch`  `itemKey`
`K`  `k`  `keep`  `keepPickNew`  `keepPickToggle`  `keepRowDelete`
`keepRowEdit`  `keepSetSort`  `keepTogglePairSort`  `key`  `kindLabel`  `L`
`l`  `l0`  `laySetBp`  `laySetWeekly`  `left`  `likeN`
`limit`  `list`  `lo`  `load`  `logicalNow`  `logoMenuBackToMain`
`logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`  `logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`
`loose`  `LS_KEY`  `m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`
`makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSwipeWrap`
`manuallyCollapsed`  `map`  `measure`  `mergeDuplicateVerses`  `mine`  `mk`
`mkBtn`  `mkDate`  `mode`  `monthLabel`  `monthTitleHTML`  `moveActiveItems`
`moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`  `moveDrag`  `moveG`  `moveTaskTo`
`moveTaskToPickedDate`  `ms`  `N`  `n`  `n0`  `name`
`navigateDate`  `navigateWeek`  `needTemp`  `next`  `nextVerseManual`  `now`
`offTest`  `on`  `onCancel`  `onDown`  `onEnd`  `onEventDateChange`
`onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`  `onStart`  `onTouchEnd`  `onTouchMove`
`onTouchStart`  `onUp`  `onVerseAlarmToggle`  `onVerseBarClick`  `onVerseMemRecord`  `openCellInput`
`openCollAddMenu`  `openCollEdit`  `openCollMenu`  `openContactMenu`  `openContactsModal`  `openDeeperFromRef`
`openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`  `openEventModalForDate`  `openHdrCalendar`  `openInlineInput`
`openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`  `openLogoMenu`  `openMemorizationHistory`  `openMenuForThis`
`openRepeatSubPicker`  `openRpConfig`  `openSettings`  `openSfxMenu`  `openShareDialog`  `openSmGhost`
`openSubscribeDialog`  `openSyncConflicts`  `openTaskMenu`  `openThemePicker`  `openTrash`  `openVcCollSettings`
`openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`
`openVerseGrid`  `openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsModal`  `openVfShare`
`openVfShareFor`  `openVliMenu`  `org`  `out`  `overflows`  `p`
`pad`  `padH`  `padV`  `paint`  `paintAppUIFromLocal`  `pairKey`
`pairOn`  `parseItemKey`  `pcEl`  `perBtn`  `phone`  `pick`
`pickContainer`  `pickFromDeviceContacts`  `place`  `pool`  `populateCarryBadge`  `portrait`
`prepDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `put`  `putText`
`randomVerseManual`  `raw`  `rawSave`  `recent`  `recheck`  `recheckBurst`
`recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`
`ref`  `refH`  `refLine`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`
`refreshTaskViewsLive`  `refreshVerseMarksLive`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`
`renderAddRow`  `renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`
`renderContactsList`  `renderLayout`  `renderMonthly`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`
`renderSecArchive`  `renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`
`renderSettingsPanel`  `renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`
`renderTrashList`  `renderVcSettings`  `renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`
`renderVerseGrid`  `renderVerseListCatRow`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderWeekly`  `repeat`
`resetStateToDefaults`  `resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`
`restoreSecArchive`  `rot`  `rowsOf`  `rpChMonth`  `rs`  `runAutoCarryOver`
`runCarryNow`  `runSharedCollSync`  `runVerseSheetAutoSync`  `s`  `safe`  `save`
`saveCurrentSectionConfig`  `saveText`  `SC`  `scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`
`scrollFlatIdxIntoView`  `sec`  `secDelDo`  `secHasEvent`  `secHasPendingTodo`  `secId`
`secName`  `sel`  `sendTestPush`  `sendToTrash`  `setActiveSingle`  `setCarryScope`
`setCnt`  `setDeviceNotify`  `setEventTimeToggle`  `setLayFormMode`  `setLinkOpenMode`  `setNotifySuffix`
`setShareSize`  `setText`  `setTimeStep`  `settle`  `setTxtRefBracket`  `setTxtRefPos`
`setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`  `setupCrossViewSwipeZones`  `setVcShow`  `setVcShowAll`
`setVcTextScale`  `setVcTheme`  `setVerseCountScope`  `setVerseIdx`  `setVersePush`  `setVersePushInterval`
`setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`  `setVfArtStyle`  `setVfTextScale`  `setWMViewMode`
`sfxMenuAction`  `shareCopyCode`  `shareSizeOf`  `shareVia`  `showAutoBackups`  `showBusyToast`
`showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`  `showReactionToast`  `showToast`
`showVersePopup`  `snapBack`  `snapshot`  `solve`  `sortBtn`  `sortEventsByTime`
`span`  `src`  `start`  `startDrag`  `startEditContact`  `stepHiOverlap`
`stepHiStarMax`  `stopLt`  `stopTimer`  `strip`  `submitContact`  `submitEventModal`
`sw`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`  `swKeepSet`  `swRow`
`swTitle`  `swToggleEdit`  `swToggleHome`  `swToggleKeep`  `syncP`  `syncRollDisplays`
`syncSecsFromState`  `syncVis`  `tags`  `testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`
`text`  `themeById`  `themeChip`  `themePickerApply`  `themePickerGroup`  `themePickerPick`
`tilt`  `tKey`  `to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`
`toggleEventDaily`  `toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`
`togglePropTitleGroup`  `togglePropTitleGroupOpen`  `toggleSectionExclude`  `toggleStarSection`  `toggleTaskFlag`  `toggleTxtIncl`
`toggleVerseAlarmContent`  `toggleVerseBarOn`  `toggleVfArt`  `toggleVfPattern`  `toggleVfSecPattern`  `topic`
`totalActive`  `totalBigCount`  `touch`  `trashBgClick`  `uiLevel`  `uiLevelIconSet`
`uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`  `up`  `updateHeaderDate`  `updateNotifySub`
`updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`  `updateSmCnt`  `updateTotal`
`updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`  `v`  `vbShuffleVerse`
`vcAct`  `vcAddCard`  `vcBackToList`  `vcClearFilter`  `vcNav`  `vcOpenFilter`
`vcOpenFull`  `vcSetTextScaleLive`  `vcStepTextScale`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`
`vDashSetCustom`  `vDashSetPeriod`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`  `verseFullNav`
`verses`  `verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`  `vfCopyBodyOnly`
`vfHomeAction`  `vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgPick`
`vgPickAxis`  `vgSetBibleSort`  `vgSetTab`  `vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`
`vgToggleExpand`  `vgToggleGroup`  `vgToggleTagExcl`  `vgToggleTileExcl`  `vis`  `vliAction`
`vlSetCustom`  `vlSetPeriod`  `vlSetSort`  `vlSetTab`  `vlToCard`  `vlToggleCtrl`
`vlTogglePairSort`  `vpAddTime`  `vpDelTime`  `vpDiagClear`  `vpDiagCopy`  `vpDiagRender`
`vpDiagToggle`  `vpSetTime`  `vpToggleDay`  `vrs`  `vw`  `W`
`want`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`  `weeksFromToday`  `wireActivateClick`
`words`  `x`  `y`  `z`

