# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-0904-5** · 전체 31,944줄 · 구역 273개 · 함수 1606개

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
| 63~407 | 345줄 (1%) | JS | 동작 (자바스크립트) |
| 410~3,963 | 3,554줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 3,964~4,194 | 231줄 (1%) | JS | 동작 (자바스크립트) |
| 4,212~6,415 | 2,204줄 (7%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,416~31,941 | 25,526줄 (80%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 454 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 547 | HEADER |
| 552 | GNB 위쪽 여백 (v26-0903-6, HB 스크린샷) |
| 587 | Verse bar (네비게이토 180) |
| 588 | Verse bar outer wrapper |
| 589 | 말씀 전체 화면 (릴스형) |
| 606 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 746 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 759 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 780 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 863 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 970 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,084 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,127 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,359 | 스닉픽 한 줄 |
| 1,513 | DATE NAV |
| 1,531 | GNB 날짜 (#hDate) |
| 1,554 | DATE SWIPE OVERLAY |
| 1,556 | MINI MOVE MENU |
| 1,575 | DATE PICKER OVERLAY |
| 1,671 | TIME SECTION |
| 1,702 | Event chips (shown inline in the section header, next to the |
| 1,828 | BLOCK SWIPE WRAPPER |
| 1,851 | BIG BLOCK (E method: colored left bar, no indent) |
| 1,963 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,041 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,046 | 연락처 관리 모달 |
| 2,072 | @닉네임 태그 할일 모아보기 |
| 2,123 | 헤더 슬라이드 입력창 (B안) |
| 2,149 | 헤더 + 버튼 (할일 추가) |
| 2,168 | ▲ 숨기기 버튼 |
| 2,200 | TRASH PANEL |
| 2,246 | DATE NAV |
| 2,299 | TASK MOVE MINI MENU |
| 2,369 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 2,394 | Event add modal |
| 2,520 | WEEKLY/MONTHLY |
| 2,615 | D뷰 좌우 분할 (넓은 화면) |
| 2,626 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 2,649 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 2,656 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 2,993 | LOGIN / AUTH SCREEN |
| 3,069 | SETTINGS PANEL |
| 3,110 | 설정 등급(이지·미드·파워) 고르기 |
| 3,133 | 선 그림만으로 고른 것을 나타내는 자리 |
| 3,271 | 강조 표시 고르는 줄 (v26-0812-15) |
| 3,291 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 3,451 | 시간 구간 경계선 |
| 3,491 | 말씀 대시보드 |
| 3,580 | 색상 테마: 뷰 탭 요약 줄 |
| 3,597 | 색상 테마 선택 화면 |
| 3,690 | 미리보기 목업 |
| 3,912 | 편집 모드 |
| 3,945 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 153 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 187 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 226 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 391 | 조기 적용 (첫 페인트 전) | – |
| 4,144 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 6,455 | 네비게이토 180 암송성구 데이터 | – |
| 6,482 | Color presets | – |
| 6,500 | 네비게이토 180 verse bar | – |
| 6,501 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 6,517 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 6,557 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 6,572 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 6,693 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses` |
| 6,740 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_TOTAL` |
| 6,778 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 6,784 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 6,872 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList`, `openCollAddMenu` … 외 2개 |
| 7,168 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `verses`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 7,281 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 7,332 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 7,406 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 7,524 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 7,606 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid` |
| 7,749 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propBooks`, `_propRowsToItems`, `col` … 외 6개 |
| 8,147 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 8,250 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 8,323 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 8,362 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `openShareDialog`, `closeShareDialog`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy`, `shareVia`, `_fmtSubDate`, `runSharedCollSync` … 외 4개 |
| 8,594 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncFirstItem`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 8,837 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseBarModeFlip`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual`, `randomVerseManual`, `toggleVerseBarOn`, `openVerseSettingsModal`, `closeVerseSettingsModal`, `_verseSettingsOpen`, `_escShown`, `_vstabList` … 외 7개 |
| 9,357 | 인앱 말씀 팝업 | – |
| 9,361 | 말씀 푸시 알림 설정 | `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 9,389 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 9,478 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent` |
| 9,669 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 9,680 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 9,745 | 암송 관리 | `getMemLog` |
| 9,752 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 9,775 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 9,798 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare` |
| 9,809 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 9,829 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 9,997 | BibleLinkProvider | `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 10,189 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 10,283 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 10,516 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `closeVerseFull`, `_verseFullIsOpen` |
| 10,599 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 10,607 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns`, `_vfApplyParallelRule` … 외 21개 |
| 11,226 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 11,264 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 7개 |
| 11,586 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 11,686 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 11,692 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 11,740 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount`, `_vfSyncCounts`, `setCnt` … 외 1개 |
| 11,889 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | – |
| 11,925 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 12,038 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 12,141 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 12,404 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 12,546 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 12,561 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 12,792 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 12,806 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 12,820 | 명조 | – |
| 12,824 | 고딕 | – |
| 12,827 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish`, `_ptFontLoaded` … 외 2개 |
| 13,065 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 13,358 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav`, `vfHomeAction`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab` … 외 7개 |
| 13,584 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 13,816 | 설정창 (말씀설정 → 전체화면 탭) | `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 13,878 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 13,980 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 14,002 | 대표 문구 줄바꿈 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 14,050 | 명제 대표 문구 타이틀 | – |
| 14,053 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 14,206 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 14,474 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 20개 |
| 14,776 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 14,781 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 14,882 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 14,909 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 14,933 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 14,970 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 10개 |
| 15,398 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight` |
| 15,412 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_tryCloseLogoMenu` |
| 15,548 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 15,638 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 15,737 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 15,749 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 15,872 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `eventRepeatsOnDate`, `eventOccursOnOwnDate`, `getDisplayEvents`, `sortEventsByTime`, `renderSecEvents` |
| 16,095 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 16,207 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 16,247 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 16,285 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 16,319 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 16,566 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 16,588 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 16,600 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 16,652 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 16,910 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 16,967 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 17,202 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 17,417 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 17,473 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 17,508 | 정렬 (v26-0831-11, HB) | – |
| 17,512 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vListControlsHTML`, `sortBtn`, `pairKey`, `pairOn`, `perBtn`, `_vlTabsHTML` … 외 18개 |
| 17,809 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 17,879 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 17,905 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 17,937 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 18,114 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 18,149 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 18,221 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 18,275 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashPref`, `_vDashEntries`, `_vDashVerse`, `_vDashKeysOf`, `tags`, `_vDashSlices` … 외 6개 |
| 18,471 | 장절 느슨한 대조 | `_refNorm` |
| 18,508 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 18,550 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 18,633 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoColl`, `openVcCollSettings`, `_vsetRestoreBack`, `openVerseCollSettings` |
| 18,708 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `vDashOpenDetail`, `kindLabel`, `axisLabel`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId`, `_vcCreate` … 외 4개 |
| 18,865 | 카드가 도는 범위 | `_vcVerses`, `_vcCurrent`, `_vcFilterLabel` |
| 18,905 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 18,945 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 18,956 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 18,977 | 카드 한 장 HTML | `_vcCardHTML` |
| 19,056 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 19,145 | 카드 동작 | `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind`, `vcBackToList`, `vlToCard`, `vcAddCard` … 외 1개 |
| 19,425 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale`, `next`, `setVcTheme` … 외 2개 |
| 19,692 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 19,712 | 각 컬럼 렌더링 | – |
| 19,732 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 19,740 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 19,753 | 3단 주간뷰 패널 | – |
| 19,777 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 19,813 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 19,942 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 20,027 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn` … 외 3개 |
| 20,767 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 20,768 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 20,791 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 20,845 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 20,973 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge`, `devInboxRefreshBadge`, `devInboxToggleAll` … 외 8개 |
| 21,212 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 21,248 | 개발자 쪽지 (설정창 계정탭) | – |
| 21,260 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 21,653 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass`, `makeBigWrap`, `getCarryCount`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `makeBigItem`, `isOver`, `makeBigGhost` … 외 10개 |
| 22,403 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 22,408 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 22,447 | Desktop: right-click → task move context menu | – |
| 22,454 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 22,652 | Hold off the browser's scroll gesture WHILE the long-press | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 22,710 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 22,725 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 22,778 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 23,141 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 23,480 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 23,547 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 23,695 | While editing a big/small task's text | – |
| 23,724 | Not editing text: arrow-key driven selection | – |
| 23,755 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 23,970 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 24,047 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 24,121 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 24,222 | Event add modal | `syncRollDisplays` |
| 24,249 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 24,495 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 24,562 | Touch | – |
| 24,594 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `toggleTaskContact`, `toggleDailyRepeat`, `ensureDailyRepeats`, `moveTaskTo` … 외 15개 |
| 25,107 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_fillTaskMenuCounts`, `weekOffsetLabel`, `setWMViewMode`, `_makeWMViewBtnsHTML`, `_wkPaneActive`, `renderWeekly`, `daysFromToday`, `getDayFadeClass`, `navigateWeek`, `attachPullToToday` … 외 9개 |
| 25,629 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 26,144 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 26,248 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 15개 |
| 26,800 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 26,801 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 26,873 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 27,154 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 27,329 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 27,483 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 27,580 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 27,655 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 27,712 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 27,801 | Backup / restore | `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 27,929 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 28,071 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 28,076 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 28,098 | 진단 기록 보조 저장소 (localStorage) | – |
| 28,102 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 28,680 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 28,712 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 28,816 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 28,832 | Day-change catch-up on wake | – |
| 28,883 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 29,053 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 29,148 | 푸시 배관(토큰) 공용 | – |
| 29,159 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 29,268 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 29,296 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 29,330 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 29,341 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 29,372 | 알림 테스트 | `testLocalNotification`, `sendTestPush`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage`, `authSignOut` |
| 29,512 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 29,583 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle` |
| 29,621 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay`, `_mgById`, `_fbHasAdoptedCloud` … 외 25개 |
| 30,185 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 30,293 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfCardHTML`, `auto`, `cfRender`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `fbPushState`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync` … 외 1개 |
| 30,504 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 30,643 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn` |
| 30,981 | 담아두기 | `getKeepLog` |
| 30,994 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 31,064 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 31,255 | 저장 | `_swLoadTiles`, `raw`, `_swSaveTiles`, `_swSpareKinds` |
| 31,276 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermons`, `_swBooks`, `_swTags`, `_swReacts`, `_swValues`, `_swStrip` |
| 31,378 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swCellHTML`, `_swFace` |
| 31,466 | 그리기 | `_swTileClass`, `_swRender` |
| 31,493 | 편집 모드 | `_swEditOn`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `_swNoMotion`, `_swTrack`, `_swTrackTo`, `_swRepaint` |
| 31,571 | 누르면 전체화면 | `_swOpenVerse`, `_swVersesFor`, `_swTileOpen` |
| 31,627 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 31,646 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap` |
| 31,896 | 켜고 끄기 | `swToggleHome`, `_swBoot` |
| 31,919 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll` |

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
`_datePickArmed`  `_dayHasContent`  `_dayLabel`  `_dayTaskCount`  `_desat`  `_devAttachSwipe`
`_devCompressFile`  `_devFilesHTML`  `_deviceBaseW`  `_deviceId`  `_deviceLabel`  `_devInboxButton`
`_devMarkRead`  `_devMigrateRead`  `_devNotifOn`  `_devNotifSet`  `_devReadIds`  `_devReadLocal`
`_devShortSide`  `_devTrashGet`  `_devTrashSet`  `_devWhen`  `_devWhenTxt`  `_dismissReactToast`
`_dismissToast`  `_dlog`  `_dlogScroll`  `_dNavEl`  `_doCarry`  `_dragZoneMid`
`_dropStalePending`  `_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`  `_dsWrite`
`_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`  `_entrySecId`  `_escShown`  `_evenDeeperShortRef`
`_evFillMins`  `_evMarkDropSec`  `_evMoveToSec`  `_evSecAt`  `_evSyncRange`  `_fallbackCopy`
`_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`  `_fbBulkLoss`  `_fbClearBase`  `_fbCollectConflicts`
`_fbCommit`  `_fbCountArrays`  `_fbCountByKind`  `_fbCountItems`  `_fbDeviceIdle`  `_fbEnsureSync`
`_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`  `_fbIsUserEdit`  `_fbLoadPersistedBase`  `_fbMaybeSelfUpdate`
`_fbMerge`  `_fbMergeGuarded`  `_fbNoteConflicts`  `_fbReady`  `_fbScheduleRetry`  `_fbSetBase`
`_fbVerIsOlder`  `_fbWarnLegacyWriter`  `_fbWriteBackup`  `_fetchSheetCsv`  `_fetchVerseStat`  `_fillMinOptions`
`_fillTaskMenuCounts`  `_fillVerseBarDOM`  `_findVerseByRefLoose`  `_flashPendingTask`  `_flatMemEntries`  `_flatSimpleEntries`
`_fmtRefForText`  `_fmtSubDate`  `_freshTaskCopy`  `_genCollId`  `_generateUniqueShareCode`  `_getCollFilter`
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
`_keepEntries`  `_keepFlipRender`  `_keepListOf`  `_keepLists`  `_keepListsOf`  `_keepNameCommit`
`_keepNameKey`  `_keepOrder`  `_keepPairSort`  `_keepRenameList`  `_keepRepaintLists`  `_keepSetOrder`
`_keepSort`  `_keepSortLists`  `_keepSortRowHTML`  `_lay`  `_layApplyWidths`  `_layFormMode`
`_layInitDividers`  `_layIsKnownType`  `_layMode`  `_loadSheetJs`  `_localOwner`  `_logoMenuSubCancelClose`
`_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_looksLikeRef`  `_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`
`_makeBoundaryRow`  `_makeTimeRollPair`  `_makeWMViewBtnsHTML`  `_menuArmOnNextPress`  `_menuFitHeight`  `_menuLockScroll`
`_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`  `_mgEntryArray`  `_mgLogFlat`
`_mgLogNested`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`  `_moveDateToastMsg`  `_mviewEventCountsHTML`
`_mviewRowHTML`  `_noiseTile`  `_notifAckToSW`  `_notifAnnounceReady`  `_notifAuthBlocking`  `_notifIntentClear`
`_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`  `_notifLog`  `_notifLogLSPush`  `_notifLogLSRead`
`_notifLogRead`  `_notifMark`  `_notifNewId`  `_notifPid`  `_notifSameRef`  `_notifShortId`
`_notifShowing`  `_notifStage`  `_notifStep`  `_notifStop`  `_notifTakeIntent`  `_notifyGet`
`_notifySupport`  `_nowHM`  `_numHex`  `_openCellEvent`  `_openCellEventRepaint`  `_openCellTodo`
`_openGhostInput`  `_openPropDeeper`  `_openVerseByRef`  `_openVerseFromLink`  `_outcomeText`  `_parseCsv`
`_parseVDate`  `_populateMorningTimePickers`  `_propBooks`  `_propHiList`  `_propHiPick`  `_propRefs`
`_propRowsToItems`  `_psIsDefault`  `_psOverlay`  `_psProject`  `_PT_FAMS`  `_ptBag`
`_ptDrawnLines`  `_ptEnsureFont`  `_ptFont`  `_ptFontFor`  `_ptFontLoaded`  `_ptFontPending`
`_ptFontsOn`  `_ptGroupInit`  `_ptLen`  `_ptLineK`  `_ptLinkGoogle`  `_ptMissing`
`_ptSample`  `_ptSplitOnce`  `_ptStillTrying`  `_ptSyncFontUI`  `_ptWarmup`  `_ptWrapTitle`
`_publishSharedColl`  `_pushKey`  `_pushKeyPid`  `_reactKey`  `_reactKeyParts`  `_reactWithToast`
`_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`  `_refKey`  `_refNorm`
`_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`  `_renderKeepPicker`  `_renderKeepSubMenu`  `_renderKeepSwitch`
`_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`  `_renderPickerInto`  `_renderSecPick`  `_renderSharePreview`
`_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`  `_renderVAggBody`  `_renderVerseUiLevelIcons`  `_renderVfSecAssign`
`_renderVfThemeChips`  `_rewriteLogRefs`  `_rgba`  `_rowsToItems`  `_rpAddBtnHTML`  `_rpAttachChipDrag`
`_rpAttachHeaderDrag`  `_rpAttachSwipes`  `_rpAttachVResize`  `_rpChipName`  `_rpCurrentRatio`  `_rpGetWidgets`
`_rpMGridH`  `_rpMonthGridHTML`  `_rpMonthOf`  `_rpNormMonth`  `_rpSetMGridH`  `_rpSetVCardH`
`_rpSetVListH`  `_rpTypeOk`  `_rpVCardH`  `_rpVListH`  `_rpWidgetHTML`  `_rpWidgetName`
`_secArchiveApply`  `_secArchiveCapture`  `_secBoundaryChoices`  `_secDataCount`  `_secFirstBoundary`  `_secIdForTime`
`_secIdNowAll`  `_secIsCustom`  `_secLenMin`  `_secMoveTo`  `_secNormalizeTimes`  `_secNoTime`
`_secOffsets`  `_secsCommit`  `_secStripData`  `_secTimeChoices`  `_secWouldEmptyDay`  `_setLocalOwner`
`_sharedVerseIn`  `_sharedVerseOut`  `_shareFileName`  `_shareMessage`  `_shareSizeKey`  `_sheetCopyPending`
`_sheetGo`  `_sheetRowsSane`  `_sheetUrlForVerse`  `_shotDraw`  `_shotFont`  `_sneakMaxW`
`_sneakMaxWDefault`  `_sortEventsKeepingTimeless`  `_sortGroups`  `_stabList`  `_statDocKey`  `_statRefKey`
`_swAddTile`  `_swArtHTML`  `_swBooks`  `_swBoot`  `_swCellHTML`  `_swDragHole`
`_swDragHoleOff`  `_swDragMove`  `_swDragStart`  `_swEditOn`  `_swEsc`  `_swFace`
`_swFinishSwipe`  `_swInitGestures`  `_swIsKept`  `_swKeeps`  `_swKillTile`  `_swLastVerses`
`_swLoadTiles`  `_swNoMotion`  `_swOn`  `_swOpenVerse`  `_swPipsHTML`  `_swReacts`
`_swRender`  `_swReorder`  `_swRepaint`  `_swRepaintKeepTiles`  `_swSaveTiles`  `_swSermons`
`_swSizeCells`  `_swSnap`  `_swSpareKinds`  `_swStrip`  `_swTags`  `_swTileClass`
`_swTileOpen`  `_swTrack`  `_swTrackTo`  `_swValues`  `_swVersesFor`  `_syncBpPickers`
`_syncCarryScopeBtns`  `_syncCondRows`  `_syncDeviceNotifyUI`  `_syncDevInboxVisibility`  `_syncEventDateUI`  `_syncHdrDateOptical`
`_syncHiOverlapRow`  `_syncHiUI`  `_syncLayFormUI`  `_syncLinkOpenModeUI`  `_syncShareSettingsUI`  `_syncShareSizeUI`
`_syncSheetVersesIntoColl`  `_syncTimeStepBtns`  `_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVersePushPool`  `_syncVersePushUI`
`_syncVfTextScaleUI`  `_syncVpTimeField`  `_syncVpTimeList`  `_t2m`  `_tagartAliasMap`  `_tagartDrawOn`
`_tagartHay`  `_tagartHit`  `_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`
`_tagartSwatchSvg`  `_thAcPush`  `_thAcText`  `_thContrast`  `_thDeltaE`  `_themePreviewHTML`
`_themeSummaryText`  `_themeTokens`  `_thFade`  `_thHex`  `_thLab`  `_thLabF`
`_thLabFi`  `_thLabRgb`  `_thLin`  `_thLum`  `_thMix`  `_thOn`
`_thPanelMix`  `_thReadable`  `_thRgb`  `_thRgba`  `_thRound`  `_thTintDE`
`_thTintK`  `_thUnlin`  `_thWorst`  `_timeStep`  `_toastWithJump`  `_toThisMonth`
`_tryCloseLogoMenu`  `_tsFine`  `_tsNearest`  `_tsPinchArm`  `_tsPinchBusy`  `_tsTouchDist`
`_uiLvIconSVG`  `_uiScaleGet`  `_uiScaleSliderPaint`  `_updateCfAllCount`  `_updateDragHintBounds`  `_vAggSyncKeepTitle`
`_vcAll`  `_vcApplyNav`  `_vcAttachGestures`  `_vcCardHTML`  `_vcCreate`  `_vcCurrent`
`_vcCurX`  `_vcFilterLabel`  `_vcGet`  `_vcGroupOf`  `_vcGroupOn`  `_vcHash`
`_vcIdOf`  `_vcIs`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcNewId`  `_vcPatternKey`
`_vcRemove`  `_vcShow`  `_vcShowFor`  `_vcSlideCommit`  `_vcSlideEl`  `_vcSyncCounts`
`_vcTextScale`  `_vcThemeVars`  `_vcUnplacedForKind`  `_vcVerses`  `_vDashCellHTML`  `_vDashEntries`
`_vDashKeysOf`  `_vDashMarkReturn`  `_vDashMaybeReturn`  `_vDashPeriodBtnsHTML`  `_vDashPieDetailSVG`  `_vDashPieSVG`
`_vDashPref`  `_vDashSlices`  `_vDashVerse`  `_verCmp`  `_verNums`  `_verseBarModeFlip`
`_verseBarSlideNav`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`  `_verseIdentity`  `_verseIdxForSec`
`_verseRefFromUrl`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`  `_vfApplyClauseRule`  `_vfApplyObjRule`
`_vfApplyParallelRule`  `_vfApplyPropAlign`  `_vfArtRecheck`  `_vfArtSyncUI`  `_vfBg1Css`  `_vfBgCss`
`_vfBottomEl`  `_vfBreakClass`  `_vfCanBreakAt`  `_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`
`_vfCycleMode`  `_vfDeeperRefs`  `_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`
`_vfGeException`  `_vfHeartBurst`  `_vfHideCovers`  `_vfHideCoversNow`  `_vfIsHeotdoeException`  `_vfIsParallelWord`
`_vfIsProp`  `_vfIsSubject`  `_vfKeepNav`  `_vfKeepSortHead`  `_vfLayoutPropText`  `_vfLayoutText`
`_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`  `_vfParallelRuns`  `_vfPatternKey`
`_vfPatternPool`  `_vfPlaceTagArt`  `_vfPropInk`  `_vfReadWrappedLines`  `_vfRedrawPropInk`  `_vfRelayoutSoon`
`_vfRenderCard`  `_vfRenderKeepSwitch`  `_vfRenderPropTitle`  `_vfRenderRef`  `_vfRenderTagArt`  `_vfRollProp`
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
`_vpTurnOn`  `_vsetGoColl`  `_vsetRestoreBack`  `_vstabList`  `_vwSize`  `_wireTaskMenuDateRow`
`_withFullscreenLayout`  `_withOutcome`  `_withTimeout`  `_wkPaneActive`  `_wkVerseMarksHTML`  `a`
`ab`  `act`  `activateItem`  `ACTIVE_TOTAL`  `ACTIVE_VERSES`  `addCustomSuffix`
`addCustomVerseFromForm`  `addDays`  `addNewCollection`  `addNewSection`  `addVerseAlarmCustomTime`  `ALL_VERSES`
`anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`  `applyRemoteState`  `applySectionConfig`
`applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`  `applyUiScale`  `applyUiScaleNow`
`applyVerseUiLevel`  `applyVfTheme`  `arr`  `assigned`  `attach`  `attachDrag`
`attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`  `attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`
`authErrorMessage`  `authSetLoading`  `authSignOut`  `authSubmit`  `authToggleMode`  `auto`
`autoSizeInput`  `away`  `axisLabel`  `b`  `barRef`  `barTags`
`base`  `beforeSave`  `begin`  `bindHold`  `body`  `book`
`build`  `buildBackupFilename`  `buildFlatList`  `buildLanes`  `bump`  `byName`
`c`  `cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `ceAddGoogleLink`  `ceCloseDeletePopup`
`ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`  `ceOpenDeletePopup`
`ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`  `ceToggleFilter`
`ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `chap`  `checkDataRecovery`
`checkVerseAlarm`  `chM`  `clamp`  `cleanupEmptyDays`  `clear`  `clearActive`
`clearContactForm`  `clearDropIndicators`  `clearPaint`  `clearTrash`  `closeAccountSensitiveModals`  `closeCellTodo`
`closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`  `closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`
`closeDatePicker`  `closeEventEditMenu`  `closeEventModal`  `closeHdrCalendar`  `closeInlineInput`  `closeKeepPicker`
`closeKeepRowMenu`  `closeKeepSwitch`  `closeLogoMenu`  `closeMemorizationHistory`  `closeMemRecPopup`  `closeRepeatSubPicker`
`closeRpConfig`  `closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`
`closeSmGhost`  `closeSubscribeDialog`  `closeSyncConflicts`  `closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`
`closeTrash`  `closeVcSettings`  `closeVDashDetail`  `closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`
`closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`  `closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`
`closeVerseSettingsModal`  `closeVfDeeperPicker`  `closeVfKeepSwitch`  `closeVfShare`  `closeVliMenu`  `closeVliMenuFromOverlay`
`cnt`  `code`  `col`  `collAddAction`  `collMenuAction`  `color`
`commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`  `contactAction`  `contactBadgeCountChanged`  `copy`
`core`  `cur`  `currentMatchingPresetName`  `currentViewKey`  `curSecId`  `cx`
`damp`  `dayOfYearVerseIdx`  `daysFromToday`  `deeperN`  `defaultState`  `defIds`
`deleteCollection`  `deleteEventFromMenu`  `deleteLatestVerseEvent`  `deleteSection`  `deleteSectionConfig`  `devInboxDelete`
`devInboxLoad`  `devInboxRefreshBadge`  `devInboxToggleAll`  `devInboxUpdateBadge`  `devNoteHandleFile`  `devNoteSend`
`devNoteToggle`  `devTrashDelete`  `devTrashEmpty`  `devTrashRender`  `devTrashToggle`  `dir`
`done`  `doRedo`  `doSubscribe`  `doUndo`  `download`  `draw`
`dropDrag`  `dropSecArchive`  `dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`  `editContact`
`editEventFromMenu`  `el`  `email`  `emailTag`  `endDrag`  `endPinch`
`ensureDailyRepeats`  `esc`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`  `exportBackup`
`fam`  `fbForceUploadLocal`  `fbPushState`  `fbStartListening`  `fill`  `findColl`
`findFlatIndex`  `findLaneIndex`  `findMentionedContacts`  `finish`  `first`  `fit`
`focusItemInput`  `formatEventTime`  `getActiveColls`  `getBigs`  `getCarryCount`  `getChips`
`getContainer`  `getCustomVerses`  `getDay`  `getDayFadeClass`  `getDeeperLog`  `getDisplayEvents`
`getDOW`  `getDropTarget`  `getEvenDeeperLog`  `getEvents`  `getKeepLog`  `getLikeLog`
`getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`  `getSecColor`  `getShareLog`
`getSmalls`  `getStableDt`  `getTasksTaggedWithContact`  `getTrack`  `getTrash`  `getVerseAlarm`
`getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`  `getWraps`
`gid`  `go`  `goToDate`  `hdrCalGoToday`  `hdrCalNav`  `hdrCalPick`
`hh`  `hideBusyToast`  `hit`  `home`  `importBackup`  `importFromFile`
`initAppUI`  `initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`
`initWeeklySwipe`  `inner0`  `inspectRecoveryDate`  `IS_TOUCH`  `isAnyInputFocused`  `isCollActive`
`isDark`  `isExcluded`  `isNowWithinSection`  `isOver`  `isSwipeZone`  `isToday`
`isTouch`  `itemKey`  `K`  `k`  `keep`  `keepPickNew`
`keepPickToggle`  `keepRowDelete`  `keepRowEdit`  `keepSetSort`  `keepTogglePairSort`  `key`
`kindLabel`  `L`  `l`  `l0`  `laySetBp`  `laySetWeekly`
`left`  `likeN`  `limit`  `list`  `lo`  `load`
`logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`  `logoMenuPrevVerse`
`logoMenuRandomVerse`  `logoMenuToggleVerse`  `loose`  `LS_KEY`  `m`  `makeBigGhost`
`makeBigItem`  `makeBigWrap`  `makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`  `makeSmItem`
`makeSmWrap`  `makeSwipeWrap`  `manuallyCollapsed`  `map`  `measure`  `mergeDuplicateVerses`
`mine`  `mk`  `mkBtn`  `mkDate`  `mode`  `monthLabel`
`monthTitleHTML`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`  `moveDrag`
`moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`  `N`  `n`
`n0`  `name`  `navigateDate`  `navigateWeek`  `needTemp`  `next`
`nextVerseManual`  `now`  `offTest`  `on`  `onCancel`  `onDown`
`onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`  `onStart`
`onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`  `onVerseAlarmToggle`  `onVerseBarClick`
`onVerseMemRecord`  `openCellInput`  `openCollAddMenu`  `openCollEdit`  `openCollMenu`  `openContactMenu`
`openContactsModal`  `openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`  `openEventModalForDate`
`openHdrCalendar`  `openInlineInput`  `openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`  `openLogoMenu`
`openMemorizationHistory`  `openMenuForThis`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`  `openSfxMenu`
`openShareDialog`  `openSmGhost`  `openSubscribeDialog`  `openSyncConflicts`  `openTaskMenu`  `openThemePicker`
`openTrash`  `openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollSettings`
`openVerseDashboard`  `openVerseFull`  `openVerseGrid`  `openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`
`openVerseSettingsModal`  `openVfDeeper`  `openVfShare`  `openVfShareFor`  `openVliMenu`  `org`
`out`  `overflows`  `p`  `pad`  `padH`  `padV`
`paint`  `paintAppUIFromLocal`  `pairKey`  `pairOn`  `parseItemKey`  `pcEl`
`perBtn`  `phone`  `pick`  `pickContainer`  `pickFromDeviceContacts`  `pickVfDeeper`
`place`  `pool`  `populateCarryBadge`  `portrait`  `prepDatePicker`  `prepDupDatePicker`
`prepTaskMenuDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `put`  `putText`
`randomVerseManual`  `raw`  `rawSave`  `recent`  `recheck`  `recheckBurst`
`recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`
`ref`  `refH`  `refLine`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`
`refreshTaskViewsLive`  `refreshVerseMarksLive`  `refs`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`
`renameCustomSuffix`  `renderAddRow`  `renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`  `renderCollButtons`
`renderCollFilterPanels`  `renderContactsList`  `renderLayout`  `renderMonthly`  `renderPresetList`  `renderRepeatButtons`
`renderRpConfigList`  `renderSecArchive`  `renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`
`renderSectionEditor`  `renderSettingsPanel`  `renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`
`renderToday`  `renderTrashList`  `renderVcSettings`  `renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`
`renderVerseDashboard`  `renderVerseGrid`  `renderVerseListCatRow`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderWeekly`
`repeat`  `resetStateToDefaults`  `resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`
`restoreFromTrash`  `restoreSecArchive`  `rot`  `rowsOf`  `rpChMonth`  `rs`
`runAutoCarryOver`  `runCarryNow`  `runSharedCollSync`  `runVerseSheetAutoSync`  `s`  `safe`
`save`  `saveCurrentSectionConfig`  `saveText`  `SC`  `scheduleVerseAlarms`  `scopeTxt`
`scrollActiveIntoView`  `scrollFlatIdxIntoView`  `sec`  `secDelDo`  `secHasEvent`  `secHasPendingTodo`
`secId`  `secName`  `sel`  `sendTestPush`  `sendToTrash`  `setActiveSingle`
`setCarryScope`  `setCnt`  `setDeviceNotify`  `setEventTimeToggle`  `setLayFormMode`  `setLinkOpenMode`
`setNotifySuffix`  `setShareSize`  `setText`  `setTimeStep`  `settle`  `setTxtRefBracket`
`setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`  `setupCrossViewSwipeZones`  `setVcShow`
`setVcShowAll`  `setVcTextScale`  `setVcTheme`  `setVerseCountScope`  `setVerseIdx`  `setVersePush`
`setVersePushInterval`  `setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`  `setVfArtStyle`  `setVfTextScale`
`setWMViewMode`  `sfxMenuAction`  `shareCopyCode`  `shareSizeOf`  `shareVia`  `showAutoBackups`
`showBusyToast`  `showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`  `showReactionToast`
`showToast`  `showVersePopup`  `snapBack`  `snapshot`  `solve`  `sortBtn`
`sortEventsByTime`  `span`  `src`  `start`  `startDrag`  `startEditContact`
`stepHiOverlap`  `stepHiStarMax`  `stopLt`  `stopTimer`  `strip`  `submitContact`
`submitEventModal`  `sw`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`  `swKeepSet`
`swRow`  `swTitle`  `swToggleEdit`  `swToggleHome`  `swToggleKeep`  `syncP`
`syncRollDisplays`  `syncSecsFromState`  `syncVis`  `tab`  `tags`  `taskMarkerFilterPass`
`testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`  `text`  `themeById`  `themeChip`
`themePickerApply`  `themePickerGroup`  `themePickerPick`  `tilt`  `tKey`  `to`
`todayKey`  `toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`  `toggleEventWeekly`  `toggleHiMark`
`toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`  `togglePropTitleGroupOpen`  `toggleSectionExclude`
`toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`  `toggleTxtIncl`  `toggleVerseAlarmContent`  `toggleVerseBarOn`
`toggleVfArt`  `toggleVfKeepSwitch`  `toggleVfPattern`  `toggleVfSecPattern`  `topic`  `totalActive`
`totalBigCount`  `touch`  `trashBgClick`  `uiLevel`  `uiLevelIconSet`  `uiScaleSet`
`uiScaleSlideCommit`  `uiScaleSlideInput`  `up`  `updateHeaderDate`  `updateNotifySub`  `updateSecSummary`
`updateSectionBoundary`  `updateSectionField`  `updateSetting`  `updateSmCnt`  `updateTotal`  `updateTrashBadge`
`updateUrBtns`  `url`  `userDocRef`  `v`  `vbShuffleVerse`  `vcAct`
`vcAddCard`  `vcBackToList`  `vcClearFilter`  `vcNav`  `vcOpenFilter`  `vcOpenFull`
`vcSetTextScaleLive`  `vcStepTextScale`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`  `vDashSetCustom`
`vDashSetPeriod`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`  `verseFullNav`  `verses`
`verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`  `vfCopyBodyOnly`  `vfHomeAction`
`vfOpenCollSettings`  `vfOpenKeepGrid`  `vfOpenKeepList`  `vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`
`vfToggleCycleMode`  `vgPick`  `vgPickAxis`  `vgSetBibleSort`  `vgSetTab`  `vgStepTagExcl`
`vgStepTileExcl`  `vgTapDateSort`  `vgToggleExpand`  `vgToggleGroup`  `vgToggleTagExcl`  `vgToggleTileExcl`
`vis`  `vliAction`  `vlSetCustom`  `vlSetPeriod`  `vlSetSort`  `vlSetTab`
`vlToCard`  `vlToggleCtrl`  `vlTogglePairSort`  `vpAddTime`  `vpDelTime`  `vpDiagClear`
`vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`  `vpSetTime`  `vpToggleDay`  `vrs`
`vw`  `W`  `want`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`
`weeksFromToday`  `wireActivateClick`  `words`  `x`  `y`  `z`

