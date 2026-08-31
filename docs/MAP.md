# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-0831-14** · 전체 29,445줄 · 구역 238개 · 함수 1463개

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
| 276~3,438 | 3,163줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 3,439~3,669 | 231줄 (1%) | JS | 동작 (자바스크립트) |
| 3,687~5,810 | 2,124줄 (7%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 5,811~29,442 | 23,632줄 (80%) | JS | 동작 (자바스크립트) |

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
| 423 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 614 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 712 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 754 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 986 | 스닉픽 한 줄 |
| 1,123 | DATE NAV |
| 1,141 | GNB 날짜 (#hDate) |
| 1,164 | DATE SWIPE OVERLAY |
| 1,166 | MINI MOVE MENU |
| 1,185 | DATE PICKER OVERLAY |
| 1,265 | TIME SECTION |
| 1,296 | Event chips (shown inline in the section header, next to the |
| 1,422 | BLOCK SWIPE WRAPPER |
| 1,445 | BIG BLOCK (E method: colored left bar, no indent) |
| 1,557 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 1,631 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 1,636 | 연락처 관리 모달 |
| 1,662 | @닉네임 태그 할일 모아보기 |
| 1,713 | 헤더 슬라이드 입력창 (B안) |
| 1,739 | 헤더 + 버튼 (할일 추가) |
| 1,758 | ▲ 숨기기 버튼 |
| 1,790 | TRASH PANEL |
| 1,836 | DATE NAV |
| 1,889 | TASK MOVE MINI MENU |
| 1,936 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 1,959 | Event add modal |
| 2,085 | WEEKLY/MONTHLY |
| 2,180 | D뷰 좌우 분할 (넓은 화면) |
| 2,191 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 2,214 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 2,221 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 2,549 | LOGIN / AUTH SCREEN |
| 2,625 | SETTINGS PANEL |
| 2,666 | 설정 등급(이지·미드·파워) 고르기 |
| 2,812 | 강조 표시 고르는 줄 (v26-0812-15) |
| 2,832 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 2,992 | 시간 구간 경계선 |
| 3,032 | 말씀 대시보드 |
| 3,121 | 색상 테마: 뷰 탭 요약 줄 |
| 3,138 | 색상 테마 선택 화면 |
| 3,231 | 미리보기 목업 |
| 3,387 | 편집 모드 |
| 3,420 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 153 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba`, `_themeTokens`, `p`, `isDark` … 외 1개 |
| 257 | 조기 적용 (첫 페인트 전) | – |
| 3,619 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 5,850 | 네비게이토 180 암송성구 데이터 | – |
| 5,877 | Color presets | – |
| 5,895 | 네비게이토 180 verse bar | – |
| 5,896 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 5,911 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 5,950 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 5,965 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 6,086 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses` |
| 6,133 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_TOTAL` |
| 6,171 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 6,177 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 6,266 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList`, `openCollAddMenu` … 외 2개 |
| 6,562 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `verses`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 6,663 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 6,714 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 6,788 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 6,906 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 6,988 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid` |
| 7,117 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propBooks`, `_propRowsToItems`, `_rowsToItems` … 외 5개 |
| 7,454 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 7,555 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 7,614 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 7,653 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `openShareDialog`, `closeShareDialog`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy`, `shareVia`, `_fmtSubDate`, `runSharedCollSync` … 외 4개 |
| 7,883 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barRef`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncFirstItem`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 8,110 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseBarModeFlip`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual`, `randomVerseManual`, `toggleVerseBarOn`, `openVerseSettingsModal`, `closeVerseSettingsModal`, `_verseSettingsOpen`, `_escShown`, `_vstabList` … 외 7개 |
| 8,628 | 인앱 말씀 팝업 | – |
| 8,632 | 말씀 푸시 알림 설정 | `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 8,660 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 8,749 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent` |
| 8,940 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 8,951 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 9,016 | 암송 관리 | `getMemLog` |
| 9,023 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 9,046 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 9,069 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare` |
| 9,080 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 9,100 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 9,268 | BibleLinkProvider | `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast`, `showToast` |
| 9,504 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 9,733 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `closeVerseFull`, `_verseFullIsOpen` |
| 9,806 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 9,814 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns`, `_vfApplyParallelRule` … 외 21개 |
| 10,433 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 10,471 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 10개 |
| 10,808 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 10,814 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 10,862 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount`, `_vfSyncCounts`, `setCnt` … 외 1개 |
| 11,011 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0831-7, HB 승인) | – |
| 11,042 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 11,151 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 11,469 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 11,611 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 11,626 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 11,857 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | `_ptFont`, `v`, `_ptEnsureFont`, `_ptFontLoaded`, `_vfRollProp`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm` … 외 12개 |
| 12,184 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfSetNav`, `_vfClearNav`, `vfHomeAction`, `_vfSyncTopBar`, `_vfCurrentVerse` |
| 12,306 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 2개 |
| 12,510 | 설정창 (말씀설정 → 전체화면 탭) | `toggleVfArt`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 12,568 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 12,590 | 명제 대표 문구 타이틀 | `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0` … 외 31개 |
| 13,144 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 13,149 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 13,250 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 13,277 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 13,301 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 13,338 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 19개 |
| 13,876 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 13,966 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 14,063 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 14,075 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 14,198 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `eventRepeatsOnDate`, `eventOccursOnOwnDate`, `getDisplayEvents`, `sortEventsByTime`, `renderSecEvents` |
| 14,421 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 14,533 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 14,573 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 14,611 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 14,645 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 14,892 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 14,914 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 14,926 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 14,978 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 15,234 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 15,291 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 15,522 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 15,737 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind` |
| 15,789 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 15,824 | 정렬 (v26-0831-11, HB) | `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vListControlsHTML`, `sortBtn`, `pairKey`, `pairOn`, `perBtn`, `_vListRefresh`, `vlSetSort`, `vlTogglePairSort` … 외 12개 |
| 16,119 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup`, `openKeepListPopup`, `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker`, `keepPickToggle`, `keepPickNew`, `n`, `_keepAfterChange`, `_vDashPref`, `_vDashEntries`, `_vDashVerse` … 외 9개 |
| 16,374 | 장절 느슨한 대조 | `_refNorm`, `_findVerseByRefLoose` |
| 16,431 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 16,514 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoColl`, `openVcCollSettings`, `_vsetRestoreBack`, `openVerseCollSettings` |
| 16,589 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `vDashOpenDetail`, `kindLabel`, `axisLabel`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId`, `_vcCreate` … 외 4개 |
| 16,745 | 카드가 도는 범위 | `_vcVerses`, `_vcCurrent`, `_vcFilterLabel` |
| 16,785 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 16,825 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 16,836 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 16,857 | 카드 한 장 HTML | `_vcCardHTML` |
| 16,936 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 17,025 | 카드 동작 | `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind`, `vcBackToList`, `vlToCard`, `vcAddCard` … 외 1개 |
| 17,305 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale`, `next`, `setVcTheme` … 외 2개 |
| 17,572 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 17,592 | 각 컬럼 렌더링 | – |
| 17,612 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 17,620 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 17,633 | 3단 주간뷰 패널 | – |
| 17,657 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 17,693 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 17,822 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 17,907 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `curSecId` … 외 2개 |
| 18,629 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 18,630 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 18,653 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 18,707 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 18,835 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge`, `devInboxRefreshBadge`, `devInboxToggleAll` … 외 8개 |
| 19,074 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 19,110 | 개발자 쪽지 (설정창 계정탭) | – |
| 19,122 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 19,515 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `makeBigWrap`, `getCarryCount`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal` … 외 9개 |
| 20,247 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 20,252 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 20,291 | Desktop: right-click → task move context menu | – |
| 20,298 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 20,496 | Hold off the browser's scroll gesture WHILE the long-press | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 20,554 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 20,569 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 20,622 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 20,980 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 21,319 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 21,386 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 21,534 | While editing a big/small task's text | – |
| 21,563 | Not editing text: arrow-key driven selection | – |
| 21,594 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 21,821 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 21,898 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 21,972 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 22,073 | Event add modal | `syncRollDisplays` |
| 22,100 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 22,346 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 22,413 | Touch | – |
| 22,445 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `toggleDailyRepeat`, `ensureDailyRepeats`, `moveTaskTo`, `prepDatePicker` … 외 24개 |
| 23,293 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 23,808 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 23,912 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 15개 |
| 24,462 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 24,463 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 24,535 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 24,816 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 24,991 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 25,145 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 25,242 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 25,317 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 25,374 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 25,463 | Backup / restore | `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 25,591 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 25,733 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 25,738 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 25,760 | 진단 기록 보조 저장소 (localStorage) | – |
| 25,764 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 29개 |
| 26,307 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 26,339 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 26,442 | Day-change catch-up on wake | – |
| 26,493 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 26,663 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 26,758 | 푸시 배관(토큰) 공용 | – |
| 26,769 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 26,878 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 26,906 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 26,940 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 26,951 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 26,982 | 알림 테스트 | `testLocalNotification`, `sendTestPush`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage`, `authSignOut` |
| 27,122 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 27,193 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle` |
| 27,231 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay`, `_mgById`, `_fbHasAdoptedCloud` … 외 25개 |
| 27,795 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 27,903 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfCardHTML`, `auto`, `cfRender`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `fbPushState`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync` … 외 1개 |
| 28,114 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 28,253 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn` |
| 28,591 | 담아두기 | `getKeepLog` |
| 28,604 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists`, `_keepListsOf`, `_swIsKept`, `swKeepSet`, `swToggleKeep`, `_keepRenameList`, `A`, `B`, `_keepDeleteList`, `L`, `_swKeeps` … 외 1개 |
| 28,764 | 저장 | `_swLoadTiles`, `raw`, `_swSaveTiles`, `_swSpareKinds` |
| 28,785 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermons`, `_swBooks`, `_swTags`, `_swReacts`, `_swValues`, `_swStrip` |
| 28,884 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swCellHTML`, `_swFace` |
| 28,972 | 그리기 | `_swTileClass`, `_swRender` |
| 28,999 | 편집 모드 | `_swEditOn`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `_swNoMotion`, `_swTrack`, `_swTrackTo`, `_swRepaint` |
| 29,077 | 누르면 전체화면 | `_swOpenVerse`, `_swVersesFor`, `_swTileOpen` |
| 29,133 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 29,152 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap` |
| 29,397 | 켜고 끄기 | `swToggleHome`, `_swBoot` |
| 29,420 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll` |

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
`_isReactPid`  `_isTouchDevice`  `_keepAfterChange`  `_keepDeleteList`  `_keepEntries`  `_keepListOf`
`_keepLists`  `_keepListsOf`  `_keepRenameList`  `_lay`  `_layApplyWidths`  `_layFormMode`
`_layInitDividers`  `_layIsKnownType`  `_layMode`  `_loadSheetJs`  `_localOwner`  `_logoMenuSubCancelClose`
`_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_looksLikeRef`  `_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`
`_makeBoundaryRow`  `_makeTimeRollPair`  `_makeWMViewBtnsHTML`  `_menuArmOnNextPress`  `_mgById`  `_mgContainerKeys`
`_mgCountBag`  `_mgDay`  `_mgEntryArray`  `_mgLogFlat`  `_mgLogNested`  `_mgTaskArray`
`_mgTaskOne`  `_mgWhole`  `_moveDateToastMsg`  `_mviewEventCountsHTML`  `_mviewRowHTML`  `_noiseTile`
`_notifAckToSW`  `_notifAnnounceReady`  `_notifAuthBlocking`  `_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`
`_notifIntentSave`  `_notifLog`  `_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifMark`
`_notifNewId`  `_notifSameRef`  `_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`
`_notifStop`  `_notifTakeIntent`  `_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`
`_openCellEvent`  `_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openVerseByRef`  `_openVerseFromLink`
`_outcomeText`  `_parseCsv`  `_parseVDate`  `_populateMorningTimePickers`  `_propBooks`  `_propRefs`
`_propRowsToItems`  `_psIsDefault`  `_psOverlay`  `_psProject`  `_ptEnsureFont`  `_ptFont`
`_ptFontLoaded`  `_publishSharedColl`  `_reactKey`  `_reactKeyParts`  `_reactWithToast`  `_readPendingVerse`
`_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`  `_refKey`  `_refNorm`  `_releasePushTokenIfIdle`
`_renderBookList`  `_renderGroupList`  `_renderKeepPicker`  `_renderKeepSubMenu`  `_renderMemHistoryDash`  `_renderMemHistoryList`
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
`_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`  `_thContrast`
`_themePreviewHTML`  `_themeSummaryText`  `_themeTokens`  `_thFade`  `_thHex`  `_thLin`
`_thLum`  `_thMix`  `_thOn`  `_thRgb`  `_thRgba`  `_thRound`
`_thWorst`  `_timeStep`  `_toThisMonth`  `_tryCloseLogoMenu`  `_tsFine`  `_tsNearest`
`_tsPinchArm`  `_tsPinchBusy`  `_tsTouchDist`  `_uiLvIconSVG`  `_uiScaleGet`  `_uiScaleSliderPaint`
`_updateCfAllCount`  `_updateDragHintBounds`  `_vcAll`  `_vcApplyNav`  `_vcAttachGestures`  `_vcCardHTML`
`_vcCreate`  `_vcCurrent`  `_vcCurX`  `_vcFilterLabel`  `_vcGet`  `_vcGroupOf`
`_vcGroupOn`  `_vcHash`  `_vcIdOf`  `_vcIs`  `_vcLayoutAll`  `_vcLayoutOne`
`_vcNewId`  `_vcPatternKey`  `_vcRemove`  `_vcShow`  `_vcShowFor`  `_vcSlideCommit`
`_vcSlideEl`  `_vcSyncCounts`  `_vcTextScale`  `_vcThemeVars`  `_vcUnplacedForKind`  `_vcVerses`
`_vDashCellHTML`  `_vDashEntries`  `_vDashKeysOf`  `_vDashMarkReturn`  `_vDashMaybeReturn`  `_vDashPeriodBtnsHTML`
`_vDashPieDetailSVG`  `_vDashPieSVG`  `_vDashPref`  `_vDashSlices`  `_vDashVerse`  `_verCmp`
`_verNums`  `_verseBarModeFlip`  `_verseBarSlideNav`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`
`_verseIdentity`  `_verseIdxForSec`  `_verseRefFromUrl`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`
`_vfApplyClauseRule`  `_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfArtSyncUI`  `_vfBgCss`  `_vfBottomEl`
`_vfBreakClass`  `_vfCanBreakAt`  `_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`  `_vfCycleMode`
`_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`  `_vfGeException`  `_vfHeartBurst`
`_vfHideCovers`  `_vfHideCoversNow`  `_vfIsHeotdoeException`  `_vfIsParallelWord`  `_vfIsProp`  `_vfIsSubject`
`_vfLayoutPropText`  `_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`
`_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`  `_vfPlaceTagArt`  `_vfPropInk`  `_vfReadWrappedLines`
`_vfRedrawPropInk`  `_vfRenderCard`  `_vfRenderPropTitle`  `_vfRenderRef`  `_vfRenderTagArt`  `_vfRollProp`
`_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`  `_vfSetNav`  `_vfShareImage`  `_vfShareSizeRow`
`_vfShareText`  `_vfShortOK`  `_vfSkipsForced`  `_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncTopBar`
`_vfTextScale`  `_vfTheme`  `_vfWrapFit`  `_vgAxisItems`  `_vgAxisLabel`  `_vgDate`
`_vgEscAttr`  `_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`  `_vgFamily`
`_vgFilteredPool`  `_vgFilterLabelText`  `_vgFlatPresets`  `_vgGroupKey`  `_vgGroupLabel`  `_vgHighlightTile`
`_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`  `_vgOpenFromRef`  `_vgPinchSteps`
`_vgRawPool`  `_vgRestoreHighlight`  `_vgScrollToVerse`  `_vgSetCols`  `_vgShortRef`  `_vgSort`
`_vgSyncExcl`  `_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTileHtml`  `_vgTilePreset`
`_vgTileStyle`  `_vlApplySort`  `_vlClearRegIdx`  `_vlDispRef`  `_vliOpenFull`  `_vListControlsHTML`
`_vListRange`  `_vListRefresh`  `_vListRowsHTML`  `_vlPref`  `_vlRegIdx`  `_vmmSyncFirstItem`
`_vpDiagCopyFallback`  `_vpDiagFmt`  `_vpDiagHead`  `_vpEveryLabel`  `_vpSave`  `_vpToMin`
`_vpTurnOn`  `_vsetGoColl`  `_vsetRestoreBack`  `_vstabList`  `_vwSize`  `_withFullscreenLayout`
`_withOutcome`  `_withTimeout`  `_wkPaneActive`  `_wkVerseMarksHTML`  `A`  `ab`
`activateItem`  `ACTIVE_TOTAL`  `ACTIVE_VERSES`  `addCustomSuffix`  `addCustomVerseFromForm`  `addDays`
`addNewCollection`  `addNewSection`  `addVerseAlarmCustomTime`  `ALL_VERSES`  `anchor`  `appConfirm`
`applyPreset`  `applyRemoteState`  `applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`
`applyUiLevel`  `applyUiScale`  `applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `arr`
`assigned`  `attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`
`attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authSetLoading`  `authSignOut`
`authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`  `axisLabel`  `B`
`b`  `barRef`  `base`  `beforeSave`  `begin`  `bindHold`
`body`  `book`  `build`  `buildBackupFilename`  `buildFlatList`  `buildLanes`
`bump`  `c`  `cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `ceAddGoogleLink`
`ceCloseDeletePopup`  `ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`
`ceOpenDeletePopup`  `ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`
`ceToggleFilter`  `ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `chap`
`checkDataRecovery`  `checkVerseAlarm`  `chM`  `clamp`  `cleanupEmptyDays`  `clear`
`clearActive`  `clearContactForm`  `clearDropIndicators`  `clearPaint`  `clearTrash`  `closeAccountSensitiveModals`
`closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`  `closeContactMenu`  `closeContactsModal`
`closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`  `closeHdrCalendar`  `closeInlineInput`
`closeKeepPicker`  `closeLogoMenu`  `closeMemorizationHistory`  `closeMemRecPopup`  `closeRepeatSubPicker`  `closeRpConfig`
`closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`  `closeSmGhost`
`closeSubscribeDialog`  `closeSyncConflicts`  `closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`  `closeTrash`
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
`getKeepLog`  `getLikeLog`  `getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`
`getSecColor`  `getShareLog`  `getSmalls`  `getStableDt`  `getTasksTaggedWithContact`  `getTrack`
`getTrash`  `getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`  `getVersePush`
`getWeekFadeClass`  `getWraps`  `gid`  `go`  `goToDate`  `hdrCalGoToday`
`hdrCalNav`  `hdrCalPick`  `hh`  `hit`  `home`  `importBackup`
`importFromFile`  `initAppUI`  `initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`
`initTopDateSwipe`  `initWeeklySwipe`  `inner0`  `inspectRecoveryDate`  `IS_TOUCH`  `isAnyInputFocused`
`isCollActive`  `isDark`  `isExcluded`  `isNowWithinSection`  `isOver`  `isSwipeZone`
`isToday`  `isTouch`  `itemKey`  `K`  `keep`  `keepPickNew`
`keepPickToggle`  `key`  `kindLabel`  `L`  `l`  `laySetBp`
`laySetWeekly`  `left`  `likeN`  `limit`  `list`  `lo`
`load`  `logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`
`logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`  `loose`  `LS_KEY`  `m`
`makeBigGhost`  `makeBigItem`  `makeBigWrap`  `makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`
`makeSmItem`  `makeSmWrap`  `makeSwipeWrap`  `manuallyCollapsed`  `map`  `measure`
`mergeDuplicateVerses`  `mine`  `mk`  `mkBtn`  `mkDate`  `mode`
`monthLabel`  `monthTitleHTML`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`
`moveDrag`  `moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`  `N`
`n`  `name`  `navigateDate`  `navigateWeek`  `needTemp`  `next`
`nextVerseManual`  `now`  `offTest`  `on`  `onCancel`  `onDown`
`onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`  `onStart`
`onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`  `onVerseAlarmToggle`  `onVerseBarClick`
`onVerseMemRecord`  `openCellInput`  `openCollAddMenu`  `openCollEdit`  `openCollMenu`  `openContactMenu`
`openContactsModal`  `openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`  `openEventModalForDate`
`openHdrCalendar`  `openInlineInput`  `openKeepListPopup`  `openKeepPicker`  `openLogoMenu`  `openMemorizationHistory`
`openMenuForThis`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`  `openSfxMenu`  `openShareDialog`
`openSmGhost`  `openSubscribeDialog`  `openSyncConflicts`  `openTaskMenu`  `openThemePicker`  `openTrash`
`openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollSettings`  `openVerseDashboard`
`openVerseFull`  `openVerseGrid`  `openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsModal`
`openVfShare`  `openVfShareFor`  `openVliMenu`  `org`  `overflows`  `p`
`pad`  `padH`  `padV`  `paint`  `paintAppUIFromLocal`  `pairKey`
`pairOn`  `parseItemKey`  `pcEl`  `perBtn`  `phone`  `pick`
`pickContainer`  `pickFromDeviceContacts`  `place`  `pool`  `populateCarryBadge`  `portrait`
`prepDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `put`  `putText`
`randomVerseManual`  `raw`  `rawSave`  `recheck`  `recheckBurst`  `recordMemorization`
`recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`  `ref`
`refH`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`  `refreshVerseMarksLive`
`removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`  `renderCeGoogleList`
`renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`  `renderLayout`
`renderMonthly`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`  `renderSecBody`
`renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`  `renderSmList`
`renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`  `renderVcSettings`
`renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`  `renderVerseListCatRow`
`renderVerseListResults`  `renderVerseSettingsModal`  `renderWeekly`  `repeat`  `resetStateToDefaults`  `resizeAllInputs`
`resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`  `rot`
`rpChMonth`  `rs`  `runAutoCarryOver`  `runCarryNow`  `runSharedCollSync`  `runVerseSheetAutoSync`
`s`  `safe`  `save`  `saveCurrentSectionConfig`  `saveText`  `SC`
`scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`  `scrollFlatIdxIntoView`  `sec`  `secDelDo`
`secHasEvent`  `secHasPendingTodo`  `secId`  `secName`  `sel`  `sendTestPush`
`sendToTrash`  `setActiveSingle`  `setCarryScope`  `setCnt`  `setDeviceNotify`  `setEventTimeToggle`
`setLayFormMode`  `setLinkOpenMode`  `setNotifySuffix`  `setShareSize`  `setText`  `setTimeStep`
`settle`  `setTxtRefBracket`  `setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`
`setupCrossViewSwipeZones`  `setVcShow`  `setVcShowAll`  `setVcTextScale`  `setVcTheme`  `setVerseCountScope`
`setVerseIdx`  `setVersePush`  `setVersePushInterval`  `setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`
`setVfArtStyle`  `setVfTextScale`  `setWMViewMode`  `sfxMenuAction`  `shareCopyCode`  `shareSizeOf`
`shareVia`  `showAutoBackups`  `showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`
`showReactionToast`  `showToast`  `showVersePopup`  `snapBack`  `snapshot`  `solve`
`sortBtn`  `sortEventsByTime`  `span`  `src`  `start`  `startDrag`
`startEditContact`  `stepHiOverlap`  `stepHiStarMax`  `stopLt`  `stopTimer`  `strip`
`submitContact`  `submitEventModal`  `sw`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`
`swKeepSet`  `swRow`  `swTitle`  `swToggleEdit`  `swToggleHome`  `swToggleKeep`
`syncP`  `syncRollDisplays`  `syncSecsFromState`  `syncVis`  `tags`  `testAutoCarryOver`
`testLocalNotification`  `testVerseClickPath`  `text`  `themeById`  `themeChip`  `themePickerApply`
`themePickerGroup`  `themePickerPick`  `tilt`  `tKey`  `to`  `todayKey`
`toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`  `toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`
`toggleSectionExclude`  `toggleStarSection`  `toggleTaskFlag`  `toggleTxtIncl`  `toggleVerseAlarmContent`  `toggleVerseBarOn`
`toggleVfArt`  `toggleVfPattern`  `toggleVfSecPattern`  `topic`  `totalActive`  `totalBigCount`
`touch`  `trashBgClick`  `uiLevel`  `uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`
`uiScaleSlideInput`  `up`  `updateHeaderDate`  `updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`
`updateSectionField`  `updateSetting`  `updateSmCnt`  `updateTotal`  `updateTrashBadge`  `updateUrBtns`
`url`  `userDocRef`  `v`  `vbShuffleVerse`  `vcAct`  `vcAddCard`
`vcBackToList`  `vcClearFilter`  `vcNav`  `vcOpenFilter`  `vcOpenFull`  `vcSetTextScaleLive`
`vcStepTextScale`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`  `vDashSetCustom`  `vDashSetPeriod`
`VERSE_TOTAL`  `verseByRef`  `verseForEntry`  `verseFullNav`  `verses`  `verseSyncAllNow`
`verseUiLevel`  `vfAct`  `vfCatTap`  `vfCopyBodyOnly`  `vfHomeAction`  `vfOpenSheetForCat`
`vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgPick`  `vgPickAxis`  `vgSetBibleSort`
`vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`  `vgToggleExpand`  `vgToggleGroup`  `vgToggleTagExcl`
`vgToggleTileExcl`  `vis`  `vliAction`  `vlSetCustom`  `vlSetPeriod`  `vlSetSort`
`vlToCard`  `vlToggleCtrl`  `vlTogglePairSort`  `vpAddTime`  `vpDelTime`  `vpDiagClear`
`vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`  `vpSetTime`  `vpToggleDay`  `vrs`
`vw`  `W`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`  `weeksFromToday`
`wireActivateClick`  `words`  `x`  `y`  `z`

