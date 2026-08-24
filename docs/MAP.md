# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-0824-1** · 전체 26,065줄 · 구역 211개 · 함수 1255개

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
| 63~273 | 211줄 (1%) | JS | 동작 (자바스크립트) |
| 276~3,223 | 2,948줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 3,224~3,328 | 105줄 (0%) | JS | 동작 (자바스크립트) |
| 3,346~5,320 | 1,975줄 (8%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 5,321~26,062 | 20,742줄 (80%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 317 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 396 | HEADER |
| 413 | Verse bar (네비게이토 180) |
| 414 | Verse bar outer wrapper |
| 415 | 말씀 전체 화면 (릴스형) |
| 547 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 645 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 687 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 919 | 스닉픽 한 줄 |
| 1,056 | DATE NAV |
| 1,074 | GNB 날짜 (#hDate) |
| 1,097 | DATE SWIPE OVERLAY |
| 1,099 | MINI MOVE MENU |
| 1,118 | DATE PICKER OVERLAY |
| 1,192 | TIME SECTION |
| 1,223 | Event chips (shown inline in the section header, next to the |
| 1,349 | BLOCK SWIPE WRAPPER |
| 1,372 | BIG BLOCK (E method: colored left bar, no indent) |
| 1,484 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 1,558 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 1,563 | 연락처 관리 모달 |
| 1,589 | @닉네임 태그 할일 모아보기 |
| 1,640 | 헤더 슬라이드 입력창 (B안) |
| 1,666 | 헤더 + 버튼 (할일 추가) |
| 1,685 | ▲ 숨기기 버튼 |
| 1,717 | TRASH PANEL |
| 1,763 | DATE NAV |
| 1,816 | TASK MOVE MINI MENU |
| 1,863 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 1,886 | Event add modal |
| 2,012 | WEEKLY/MONTHLY |
| 2,107 | D뷰 좌우 분할 (넓은 화면) |
| 2,118 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 2,141 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 2,148 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 2,476 | LOGIN / AUTH SCREEN |
| 2,552 | SETTINGS PANEL |
| 2,593 | 설정 등급(이지·미드·파워) 고르기 |
| 2,739 | 강조 표시 고르는 줄 (v26-0812-15) |
| 2,759 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 2,919 | 시간 구간 경계선 |
| 2,959 | 말씀 대시보드 |
| 3,048 | 색상 테마: 뷰 탭 요약 줄 |
| 3,065 | 색상 테마 선택 화면 |
| 3,158 | 미리보기 목업 |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 153 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba`, `_themeTokens`, `p`, `isDark` … 외 1개 |
| 257 | 조기 적용 (첫 페인트 전) | – |
| 5,360 | 네비게이토 180 암송성구 데이터 | – |
| 5,387 | Color presets | – |
| 5,405 | 네비게이토 180 verse bar | – |
| 5,406 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 5,421 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 5,460 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 5,475 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 5,574 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses` |
| 5,619 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_TOTAL` |
| 5,644 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 5,650 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 5,723 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList`, `openCollAddMenu` … 외 2개 |
| 6,009 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `verses`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 6,111 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 6,162 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 6,236 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 6,354 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 6,436 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid` |
| 6,535 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_rowsToItems`, `_importVerseRows`, `_fetchSheetCsv`, `m`, `_loadSheetJs` … 외 1개 |
| 6,781 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 6,882 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 6,941 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 6,980 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_publishSharedColl`, `openShareDialog`, `closeShareDialog`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy`, `shareVia`, `_fmtSubDate`, `runSharedCollSync`, `getVerseByIdx`, `_verseIdxForSec` … 외 2개 |
| 7,178 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncFirstItem`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 7,398 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseBarModeFlip`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual`, `randomVerseManual`, `toggleVerseBarOn`, `openVerseSettingsModal`, `closeVerseSettingsModal`, `_verseSettingsOpen`, `_escShown`, `_vstabList` … 외 7개 |
| 7,913 | 인앱 말씀 팝업 | – |
| 7,917 | 말씀 푸시 알림 설정 | `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 7,945 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 8,033 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent` |
| 8,224 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 8,235 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 8,300 | 암송 관리 | `getMemLog` |
| 8,307 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 8,330 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 8,353 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare` |
| 8,364 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 8,384 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 8,552 | BibleLinkProvider | `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast`, `showToast` |
| 8,788 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 9,016 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `closeVerseFull`, `_verseFullIsOpen` |
| 9,083 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 9,091 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns`, `_vfApplyParallelRule` … 외 21개 |
| 9,710 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 9,748 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 6개 |
| 10,009 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 10,047 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `setLinkOpenMode`, `setVerseCountScope`, `_verseEventCount`, `_vfSyncCounts`, `setCnt`, `setText` |
| 10,163 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 10,269 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 10,573 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 10,715 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 10,730 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 23개 |
| 11,189 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfSetNav`, `_vfClearNav`, `vfHomeAction`, `_vfSyncTopBar`, `_vfCurrentVerse`, `_verseFullRender`, `tags`, `_vfBottomEl`, `_vfNavCommit`, `verseFullNav`, `_initEdgeBack` … 외 37개 |
| 11,755 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 11,760 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 11,861 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 11,888 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 11,912 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 11,949 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 18개 |
| 12,471 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 12,561 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 12,649 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 12,660 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 12,780 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `eventRepeatsOnDate`, `eventOccursOnOwnDate`, `getDisplayEvents`, `sortEventsByTime`, `renderSecEvents` |
| 13,003 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 13,115 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 13,155 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 13,193 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 13,227 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 13,474 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 13,496 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 13,508 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 13,560 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 13,816 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 13,873 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 14,104 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 14,319 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind` |
| 14,369 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange`, `vlToggleCtrl`, `_vListControlsHTML`, `sortBtn`, `perBtn`, `_vListRefresh`, `vlSetSort`, `vlSetPeriod`, `vlSetCustom`, `_vwSize`, `_vListRowsHTML`, `_attachVliMenus`, `closeVliMenuFromOverlay` … 외 6개 |
| 14,641 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup`, `_vDashPref`, `_vDashEntries`, `_vDashVerse`, `_vDashKeysOf`, `tags`, `_vDashSlices`, `_vDashPieSVG`, `_vDashCellHTML`, `_vDashPeriodBtnsHTML`, `vDashSetPeriod`, `vDashSetCustom`, `renderVerseDashboard` |
| 14,805 | 장절 느슨한 대조 | `_refNorm`, `_findVerseByRefLoose` |
| 14,849 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 14,932 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoColl`, `openVcCollSettings`, `_vsetRestoreBack`, `openVerseCollSettings` |
| 15,007 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `vDashOpenDetail`, `kindLabel`, `axisLabel`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId`, `_vcCreate` … 외 4개 |
| 15,163 | 카드가 도는 범위 | `_vcVerses`, `_vcCurrent`, `_vcFilterLabel` |
| 15,203 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 15,243 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 15,254 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 15,275 | 카드 한 장 HTML | `_vcCardHTML` |
| 15,354 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 15,443 | 카드 동작 | `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind`, `vcBackToList`, `vlToCard`, `vcAddCard` … 외 1개 |
| 15,723 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale`, `next`, `setVcTheme` … 외 2개 |
| 15,990 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 16,010 | 각 컬럼 렌더링 | – |
| 16,030 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 16,038 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 16,051 | 3단 주간뷰 패널 | – |
| 16,075 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 16,111 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 16,240 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 16,325 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `curSecId` … 외 2개 |
| 17,033 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 17,034 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 17,057 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 17,111 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 17,239 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge`, `devInboxRefreshBadge`, `devInboxToggleAll` … 외 7개 |
| 17,453 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 17,489 | 개발자 쪽지 (설정창 계정탭) | – |
| 17,501 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 17,894 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `makeBigWrap`, `getCarryCount`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal` … 외 9개 |
| 18,624 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 18,629 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 18,668 | Desktop: right-click → task move context menu | – |
| 18,675 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 18,873 | Hold off the browser's scroll gesture WHILE the long-press | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 18,931 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 18,946 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 18,999 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 19,356 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 19,695 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 19,762 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 19,910 | While editing a big/small task's text | – |
| 19,939 | Not editing text: arrow-key driven selection | – |
| 19,970 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 20,197 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 20,274 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 20,348 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 20,449 | Event add modal | `syncRollDisplays` |
| 20,476 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 20,722 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 20,789 | Touch | – |
| 20,821 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `toggleDailyRepeat`, `ensureDailyRepeats`, `moveTaskTo`, `prepDatePicker` … 외 24개 |
| 21,669 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 22,184 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 22,288 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 15개 |
| 22,834 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 22,835 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 22,907 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 23,188 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 23,363 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 23,517 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 23,614 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 23,689 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 23,746 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 23,835 | Backup / restore | `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 23,963 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 24,105 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 24,110 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 24,132 | 진단 기록 보조 저장소 (localStorage) | – |
| 24,136 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_idbOpen`, `_idbGet`, `_idbSet`, `_idbDel`, `_notifLogLSRead`, `_notifLogLSPush`, `_notifLogRead`, `_notifSameRef`, `_notifShowing`, `_notifStop`, `_notifStep`, `_openVerseByRef`, `_readPendingVerse` … 외 6개 |
| 24,427 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 24,517 | Day-change catch-up on wake | – |
| 24,567 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 24,737 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 24,831 | 푸시 배관(토큰) 공용 | – |
| 24,842 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle`, `vp` |
| 24,942 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 24,976 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 24,987 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 25,018 | 알림 테스트 | `testLocalNotification`, `sendTestPush`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage`, `authSignOut` |
| 25,158 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 25,229 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle` |
| 25,267 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgDay`, `_mgById`, `_fbHasAdoptedCloud`, `_fbCountArrays`, `_fbCountByKind` … 외 12개 |
| 25,631 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 25,770 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening` |
| 26,044 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`  `_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`
`_applySneakMaxW`  `_attachRepeatButtons`  `_attachTextPinch`  `_attachVliMenus`  `_attachWeeklyPaneDrag`  `_avgHex`
`_backupDownload`  `_bibleRankOfRef`  `_bookAbbr`  `_bookCanon`  `_bookOfRef`  `_bookSel`
`_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`  `_buildShareText`  `_bumpVerseStat`  `_calKey`
`_cardActionCount`  `_cardGrain`  `_cardTextLS`  `_carryDateInScope`  `_carryPendingCount`  `_carryScope`
`_ceFillSelects`  `_cellDefaultSec`  `_ceMakeRow`  `_ceSortedIdx`  `_ceToggleTrashSel`  `_ceUpdateDeleteBtn`
`_ceUpdateRestoreBtn`  `_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfSelKey`  `_cfSortKey`  `_chk`
`_clearPendingVerse`  `_closeHdrCalendarNow`  `_colKey`  `_collFilteredVerses`  `_collLabel`  `_collPeriodPass`
`_collRawVerses`  `_collVersePassesFilter`  `_copyTextFallback`  `_crossSwipeAllowed`  `_currentColl`  `_currentSecId`
`_dataURLtoBlob`  `_dayHasContent`  `_desat`  `_devAttachSwipe`  `_devCompressFile`  `_devFilesHTML`
`_deviceBaseW`  `_deviceId`  `_deviceLabel`  `_devMarkRead`  `_devMigrateRead`  `_devReadIds`
`_devReadLocal`  `_devShortSide`  `_devTrashGet`  `_devTrashSet`  `_devWhen`  `_devWhenTxt`
`_dismissReactToast`  `_dismissToast`  `_dlog`  `_dlogScroll`  `_dNavEl`  `_doCarry`
`_dragZoneMid`  `_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`  `_entrySecId`  `_escShown`
`_evenDeeperShortRef`  `_evFillMins`  `_evMarkDropSec`  `_evMoveToSec`  `_evSecAt`  `_evSyncRange`
`_fallbackCopy`  `_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`  `_fbBulkLoss`  `_fbClearBase`
`_fbCommit`  `_fbCountArrays`  `_fbCountByKind`  `_fbCountItems`  `_fbDeviceIdle`  `_fbEnsureSync`
`_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`  `_fbIsUserEdit`  `_fbLoadPersistedBase`  `_fbMaybeSelfUpdate`
`_fbMerge`  `_fbMergeGuarded`  `_fbReady`  `_fbScheduleRetry`  `_fbSetBase`  `_fbVerIsOlder`
`_fbWarnLegacyWriter`  `_fbWriteBackup`  `_fetchSheetCsv`  `_fetchVerseStat`  `_fillMinOptions`  `_fillVerseBarDOM`
`_findVerseByRefLoose`  `_flatMemEntries`  `_flatSimpleEntries`  `_fmtRefForText`  `_fmtSubDate`  `_genCollId`
`_generateUniqueShareCode`  `_getCollFilter`  `_ghostDragStart`  `_groupVersesBy`  `_groupVersesByMulti`  `_gSrcId`
`_hdrCalRender`  `_hexNum`  `_hiAssign`  `_hiBold`  `_hiFw`  `_hiHash`
`_hiHTML`  `_hiKindsOn`  `_hiLinesHTML`  `_hiOn`  `_hiOverlap`  `_hiOverlay`
`_hiPen`  `_hiPhrases`  `_hiPickAt`  `_hiRanges`  `_hiRefreshAll`  `_hiRibbon`
`_hiRng`  `_hiShuffle`  `_hiSmooth`  `_hiSquash`  `_hiStar`  `_hiStarMax`
`_hiStarPoly`  `_hiWave`  `_hiWavePoly`  `_hiWob`  `_idbDel`  `_idbGet`
`_idbOpen`  `_idbSet`  `_importVerseRows`  `_initEdgeBack`  `_initHdrDateLongPress`  `_initSettingsSwipe`
`_initSneakMaxWPicker`  `_initVerseAlarmPicker`  `_initVerseBarSwipe`  `_initVerseFullGestures`  `_initVerseGridGestures`  `_initVerseNotifBridge`
`_initVerseSettingsSwipe`  `_initVfCatSheet`  `_invalidateVerseCaches`  `_isDevAccount`  `_isPhoneForm`  `_isTouchDevice`
`_lay`  `_layApplyWidths`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`  `_layMode`
`_loadSheetJs`  `_localOwner`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_looksLikeRef`
`_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`  `_makeTimeRollPair`  `_makeWMViewBtnsHTML`
`_menuArmOnNextPress`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`  `_mgEntryArray`
`_mgLogFlat`  `_mgLogNested`  `_mgWhole`  `_moveDateToastMsg`  `_mviewEventCountsHTML`  `_mviewRowHTML`
`_noiseTile`  `_notifLog`  `_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifSameRef`
`_notifShowing`  `_notifStep`  `_notifStop`  `_notifyGet`  `_notifySupport`  `_nowHM`
`_numHex`  `_openCellEvent`  `_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openVerseByRef`
`_openVerseFromLink`  `_parseCsv`  `_parseVDate`  `_populateMorningTimePickers`  `_publishSharedColl`  `_reactWithToast`
`_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`  `_refKey`  `_refNorm`
`_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`  `_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`
`_renderPickerInto`  `_renderSecPick`  `_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`
`_renderVAggBody`  `_renderVerseUiLevelIcons`  `_renderVfSecAssign`  `_renderVfThemeChips`  `_rewriteLogRefs`  `_rgba`
`_rowsToItems`  `_rpAddBtnHTML`  `_rpAttachChipDrag`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`  `_rpAttachVResize`
`_rpChipName`  `_rpCurrentRatio`  `_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`  `_rpMonthOf`
`_rpNormMonth`  `_rpSetMGridH`  `_rpSetVCardH`  `_rpSetVListH`  `_rpTypeOk`  `_rpVCardH`
`_rpVListH`  `_rpWidgetHTML`  `_rpWidgetName`  `_secArchiveApply`  `_secArchiveCapture`  `_secBoundaryChoices`
`_secDataCount`  `_secFirstBoundary`  `_secIdForTime`  `_secIdNowAll`  `_secIsCustom`  `_secLenMin`
`_secMoveTo`  `_secNormalizeTimes`  `_secNoTime`  `_secOffsets`  `_secsCommit`  `_secStripData`
`_secTimeChoices`  `_secWouldEmptyDay`  `_setLocalOwner`  `_shareFileName`  `_shareMessage`  `_shareSizeKey`
`_sheetCopyPending`  `_sheetGo`  `_sheetRowsSane`  `_sheetUrlForVerse`  `_shotDraw`  `_shotFont`
`_sneakMaxW`  `_sneakMaxWDefault`  `_sortEventsKeepingTimeless`  `_sortGroups`  `_stabList`  `_statRefKey`
`_syncBpPickers`  `_syncCarryScopeBtns`  `_syncCondRows`  `_syncDevInboxVisibility`  `_syncEventDateUI`  `_syncHdrDateOptical`
`_syncHiOverlapRow`  `_syncHiUI`  `_syncLayFormUI`  `_syncLinkOpenModeUI`  `_syncShareSettingsUI`  `_syncShareSizeUI`
`_syncSheetVersesIntoColl`  `_syncTimeStepBtns`  `_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVersePushPool`  `_syncVersePushUI`
`_syncVfTextScaleUI`  `_syncVpTimeField`  `_syncVpTimeList`  `_t2m`  `_thContrast`  `_themePreviewHTML`
`_themeSummaryText`  `_themeTokens`  `_thFade`  `_thHex`  `_thLin`  `_thLum`
`_thMix`  `_thOn`  `_thRgb`  `_thRgba`  `_thRound`  `_thWorst`
`_timeStep`  `_toThisMonth`  `_tryCloseLogoMenu`  `_tsFine`  `_tsNearest`  `_tsPinchArm`
`_tsPinchBusy`  `_tsTouchDist`  `_uiLvIconSVG`  `_uiScaleGet`  `_uiScaleSliderPaint`  `_updateCfAllCount`
`_updateDragHintBounds`  `_vcAll`  `_vcApplyNav`  `_vcAttachGestures`  `_vcCardHTML`  `_vcCreate`
`_vcCurrent`  `_vcCurX`  `_vcFilterLabel`  `_vcGet`  `_vcGroupOf`  `_vcGroupOn`
`_vcHash`  `_vcIdOf`  `_vcIs`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcNewId`
`_vcPatternKey`  `_vcRemove`  `_vcShow`  `_vcShowFor`  `_vcSlideCommit`  `_vcSlideEl`
`_vcSyncCounts`  `_vcTextScale`  `_vcThemeVars`  `_vcUnplacedForKind`  `_vcVerses`  `_vDashCellHTML`
`_vDashEntries`  `_vDashKeysOf`  `_vDashMarkReturn`  `_vDashMaybeReturn`  `_vDashPeriodBtnsHTML`  `_vDashPieDetailSVG`
`_vDashPieSVG`  `_vDashPref`  `_vDashSlices`  `_vDashVerse`  `_verCmp`  `_verNums`
`_verseBarModeFlip`  `_verseBarSlideNav`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`  `_verseIdentity`
`_verseIdxForSec`  `_verseRefFromUrl`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`  `_vfApplyClauseRule`
`_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfBgCss`  `_vfBottomEl`  `_vfBreakClass`  `_vfCanBreakAt`
`_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`  `_vfCycleMode`  `_vfDemoteShortForced`  `_vfDoubleLike`
`_vfEnsureFont`  `_vfFixWidow`  `_vfGeException`  `_vfHeartBurst`  `_vfHideCovers`  `_vfHideCoversNow`
`_vfIsHeotdoeException`  `_vfIsParallelWord`  `_vfIsSubject`  `_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`
`_vfObjTailLen`  `_vfPairKeep`  `_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`  `_vfRenderCard`
`_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`  `_vfSetNav`  `_vfShareImage`  `_vfShareSizeRow`
`_vfShareText`  `_vfShortOK`  `_vfSkipsForced`  `_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncTopBar`
`_vfTextScale`  `_vfTheme`  `_vfWrapFit`  `_vgAxisItems`  `_vgAxisLabel`  `_vgDate`
`_vgEscAttr`  `_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`  `_vgFamily`
`_vgFilteredPool`  `_vgFilterLabelText`  `_vgFlatPresets`  `_vgGroupKey`  `_vgGroupLabel`  `_vgHighlightTile`
`_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`  `_vgPinchSteps`  `_vgRawPool`
`_vgRestoreHighlight`  `_vgScrollToVerse`  `_vgSetCols`  `_vgShortRef`  `_vgSort`  `_vgSyncExcl`
`_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTileHtml`  `_vgTilePreset`  `_vgTileStyle`
`_vliOpenFull`  `_vListControlsHTML`  `_vListRange`  `_vListRefresh`  `_vListRowsHTML`  `_vlPref`
`_vmmSyncFirstItem`  `_vpDiagCopyFallback`  `_vpDiagFmt`  `_vpEveryLabel`  `_vpSave`  `_vpToMin`
`_vpTurnOn`  `_vsetGoColl`  `_vsetRestoreBack`  `_vstabList`  `_vwSize`  `_withFullscreenLayout`
`_withTimeout`  `_wkPaneActive`  `_wkVerseMarksHTML`  `ab`  `activateItem`  `ACTIVE_TOTAL`
`ACTIVE_VERSES`  `addCustomSuffix`  `addCustomVerseFromForm`  `addDays`  `addNewCollection`  `addNewSection`
`addVerseAlarmCustomTime`  `ALL_VERSES`  `appConfirm`  `applyPreset`  `applyRemoteState`  `applySectionConfig`
`applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`  `applyUiScale`  `applyUiScaleNow`
`applyVerseUiLevel`  `applyVfTheme`  `arr`  `assigned`  `attach`  `attachDrag`
`attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`  `attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`
`authErrorMessage`  `authSetLoading`  `authSignOut`  `authSubmit`  `authToggleMode`  `autoSizeInput`
`axisLabel`  `b`  `base`  `beforeSave`  `begin`  `bindHold`
`body`  `book`  `build`  `buildBackupFilename`  `buildFlatList`  `buildLanes`
`bump`  `c`  `cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `ceAddGoogleLink`
`ceCloseDeletePopup`  `ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`
`ceOpenDeletePopup`  `ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`
`ceToggleFilter`  `ceToggleGoogleAuto`  `chap`  `checkDataRecovery`  `checkVerseAlarm`  `chM`
`clamp`  `cleanupEmptyDays`  `clearActive`  `clearContactForm`  `clearDropIndicators`  `clearPaint`
`clearTrash`  `closeAccountSensitiveModals`  `closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`
`closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`
`closeHdrCalendar`  `closeInlineInput`  `closeLogoMenu`  `closeMemorizationHistory`  `closeMemRecPopup`  `closeRepeatSubPicker`
`closeRpConfig`  `closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`
`closeSmGhost`  `closeSubscribeDialog`  `closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`  `closeTrash`
`closeVcSettings`  `closeVDashDetail`  `closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`  `closeVerseFull`
`closeVerseGrid`  `closeVerseListModal`  `closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`  `closeVerseSettingsModal`
`closeVfShare`  `closeVliMenu`  `closeVliMenuFromOverlay`  `code`  `collAddAction`  `collMenuAction`
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
`findMentionedContacts`  `first`  `focusItemInput`  `formatEventTime`  `getActiveColls`  `getBigs`
`getCarryCount`  `getChips`  `getContainer`  `getCustomVerses`  `getDay`  `getDayFadeClass`
`getDeeperLog`  `getDisplayEvents`  `getDOW`  `getDropTarget`  `getEvenDeeperLog`  `getEvents`
`getLikeLog`  `getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`  `getSecColor`
`getShareLog`  `getSmalls`  `getStableDt`  `getTasksTaggedWithContact`  `getTrack`  `getTrash`
`getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`
`getWraps`  `gid`  `go`  `goToDate`  `hdrCalGoToday`  `hdrCalNav`
`hdrCalPick`  `hh`  `hit`  `home`  `importBackup`  `importFromFile`
`initAppUI`  `initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`
`initWeeklySwipe`  `inner0`  `inspectRecoveryDate`  `IS_TOUCH`  `isAnyInputFocused`  `isCollActive`
`isDark`  `isExcluded`  `isNowWithinSection`  `isOver`  `isSwipeZone`  `isToday`
`isTouch`  `itemKey`  `K`  `keep`  `kindLabel`  `laySetBp`
`laySetWeekly`  `left`  `likeN`  `limit`  `list`  `lo`
`load`  `logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenListSub`  `logoMenuPrevVerse`
`logoMenuRandomVerse`  `logoMenuToggleVerse`  `m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`
`makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSwipeWrap`
`manuallyCollapsed`  `map`  `measure`  `mergeDuplicateVerses`  `mk`  `mkBtn`
`mkDate`  `mode`  `monthLabel`  `monthTitleHTML`  `moveActiveItems`  `moveActiveItemsAcrossSection`
`moveActiveSelection`  `moved`  `moveDrag`  `moveG`  `moveTaskTo`  `moveTaskToPickedDate`
`ms`  `n`  `N`  `name`  `navigateDate`  `navigateWeek`
`needTemp`  `next`  `nextVerseManual`  `now`  `offTest`  `on`
`onCancel`  `onDown`  `onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`
`onNotifyMasterToggle`  `onStart`  `onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`
`onVerseAlarmToggle`  `onVerseBarClick`  `onVerseMemRecord`  `openCellInput`  `openCollAddMenu`  `openCollEdit`
`openCollMenu`  `openContactMenu`  `openContactsModal`  `openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`
`openEventModal`  `openEventModalForDate`  `openHdrCalendar`  `openInlineInput`  `openLogoMenu`  `openMemorizationHistory`
`openMenuForThis`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`  `openSfxMenu`  `openShareDialog`
`openSmGhost`  `openSubscribeDialog`  `openTaskMenu`  `openThemePicker`  `openTrash`  `openVcCollSettings`
`openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`
`openVerseGrid`  `openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsModal`  `openVfShare`
`openVfShareFor`  `openVliMenu`  `overflows`  `p`  `pad`  `padH`
`padV`  `paint`  `paintAppUIFromLocal`  `parseItemKey`  `pcEl`  `perBtn`
`phone`  `pickContainer`  `pickFromDeviceContacts`  `place`  `pool`  `populateCarryBadge`
`portrait`  `prepDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `put`
`putText`  `randomVerseManual`  `raw`  `rawSave`  `recheck`  `recheckBurst`
`recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`
`ref`  `refH`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`
`refreshVerseMarksLive`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`
`renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`
`renderLayout`  `renderMonthly`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`
`renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`
`renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`
`renderVcSettings`  `renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`
`renderVerseListCatRow`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderWeekly`  `repeat`  `resetStateToDefaults`
`resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`
`rot`  `rpChMonth`  `runAutoCarryOver`  `runCarryNow`  `runSharedCollSync`  `runVerseSheetAutoSync`
`s`  `safe`  `save`  `saveCurrentSectionConfig`  `saveText`  `SC`
`scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`  `scrollFlatIdxIntoView`  `sec`  `secDelDo`
`secHasEvent`  `secHasPendingTodo`  `secId`  `secName`  `sel`  `sendTestPush`
`sendToTrash`  `setActiveSingle`  `setCarryScope`  `setCnt`  `setEventTimeToggle`  `setLayFormMode`
`setLinkOpenMode`  `setNotifySuffix`  `setShareSize`  `setText`  `setTimeStep`  `settle`
`setTxtRefBracket`  `setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`  `setupCrossViewSwipeZones`
`setVcShow`  `setVcShowAll`  `setVcTextScale`  `setVcTheme`  `setVerseCountScope`  `setVerseIdx`
`setVersePush`  `setVersePushInterval`  `setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`  `setVfTextScale`
`setWMViewMode`  `sfxMenuAction`  `shareCopyCode`  `shareSizeOf`  `shareVia`  `showAutoBackups`
`showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`  `showReactionToast`  `showToast`
`showVersePopup`  `snapBack`  `snapshot`  `solve`  `sortBtn`  `sortEventsByTime`
`span`  `start`  `startDrag`  `startEditContact`  `stepHiOverlap`  `stepHiStarMax`
`stopLt`  `stopTimer`  `strip`  `submitContact`  `submitEventModal`  `sw`
`switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`  `swRow`  `swTitle`  `syncP`
`syncRollDisplays`  `syncSecsFromState`  `syncVis`  `tags`  `testAutoCarryOver`  `testLocalNotification`
`text`  `themeById`  `themeChip`  `themePickerApply`  `themePickerGroup`  `themePickerPick`
`tilt`  `tKey`  `to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`
`toggleEventDaily`  `toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`  `toggleSectionExclude`  `toggleStarSection`
`toggleTaskFlag`  `toggleTxtIncl`  `toggleVerseAlarmContent`  `toggleVerseBarOn`  `toggleVfPattern`  `toggleVfSecPattern`
`topic`  `totalActive`  `totalBigCount`  `touch`  `trashBgClick`  `uiLevel`
`uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`  `up`  `updateHeaderDate`
`updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`  `updateSmCnt`
`updateTotal`  `updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`  `v`
`vbShuffleVerse`  `vcAct`  `vcAddCard`  `vcBackToList`  `vcClearFilter`  `vcNav`
`vcOpenFilter`  `vcOpenFull`  `vcSetTextScaleLive`  `vcStepTextScale`  `vDashOpenDetail`  `vDashOpenFilter`
`vDashOpenVerse`  `vDashSetCustom`  `vDashSetPeriod`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`
`verseFullNav`  `verses`  `verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`
`vfCopyBodyOnly`  `vfHomeAction`  `vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`  `vfToggleCycleMode`
`vgPick`  `vgPickAxis`  `vgSetBibleSort`  `vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`
`vgToggleExpand`  `vgToggleGroup`  `vgToggleTagExcl`  `vgToggleTileExcl`  `vis`  `vliAction`
`vlSetCustom`  `vlSetPeriod`  `vlSetSort`  `vlToCard`  `vlToggleCtrl`  `vp`
`vpAddTime`  `vpDelTime`  `vpDiagClear`  `vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`
`vpSetTime`  `vpToggleDay`  `vrs`  `vw`  `W`  `wasOpen`
`weekOffsetLabel`  `weekOfMonth`  `weeksFromToday`  `wireActivateClick`  `words`  `z`

