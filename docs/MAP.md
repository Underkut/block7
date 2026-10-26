# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-1026-5** · 전체 54,180줄 · 구역 460개 · 함수 2955개

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
| 7~45 | 39줄 (0%) | JS | 동작 (자바스크립트) |
| 46~74 | 29줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 75~453 | 379줄 (1%) | JS | 동작 (자바스크립트) |
| 456~6,434 | 5,979줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 6,435~6,708 | 274줄 (1%) | JS | 동작 (자바스크립트) |
| 6,735~6,761 | 27줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,762~6,831 | 70줄 (0%) | JS | 동작 (자바스크립트) |
| 6,832~6,869 | 38줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,884~9,591 | 2,708줄 (5%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 9,592~10,078 | 487줄 (1%) | JS | 동작 (자바스크립트) |
| 10,079~53,552 | 43,474줄 (80%) | JS | 동작 (자바스크립트) |
| 53,553~54,177 | 625줄 (1%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 500 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 573 | 전체화면·타일뷰가 떠 있는 동안엔 **뒤 배경도 같은 색으로** 칠한다 |
| 606 | HEADER |
| 611 | GNB 위쪽 여백 (v26-0903-6, HB 스크린샷) |
| 646 | Verse bar (네비게이토 180) |
| 647 | Verse bar outer wrapper |
| 648 | 말씀 전체 화면 (릴스형) |
| 665 | There — 기도·예배 전체화면 (v26-0923-5, HB) |
| 729 | There 말씀 (v. 26-1024-14, HB) |
| 763 | There 단추 자리들 (v26-0923-5 T-4) |
| 832 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 994 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 1,007 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 1,028 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 1,111 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 1,129 | 기다리는 동안 보여 줄 것 셋 더 (v26-1010-9, HB) |
| 1,291 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,413 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,456 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,740 | 스닉픽 한 줄 |
| 1,894 | DATE NAV |
| 1,912 | GNB 날짜 (#hDate) |
| 1,935 | DATE SWIPE OVERLAY |
| 1,937 | MINI MOVE MENU |
| 1,956 | DATE PICKER OVERLAY |
| 2,036 | 모음 구역 (v26-0916-2, HB) |
| 2,106 | TIME SECTION |
| 2,137 | Event chips (shown inline in the section header, next to the |
| 2,261 | BLOCK SWIPE WRAPPER |
| 2,284 | BIG BLOCK (E method: colored left bar, no indent) |
| 2,434 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,554 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,559 | 연락처 관리 모달 |
| 2,585 | @닉네임 태그 할일 모아보기 |
| 2,645 | 하위 할일 판 |
| 2,701 | 메모 팝업 |
| 2,740 | 헤더 슬라이드 입력창 (B안) |
| 2,766 | 헤더 + 버튼 (할일 추가) |
| 2,785 | ▲ 숨기기 버튼 |
| 2,817 | TRASH PANEL |
| 2,863 | DATE NAV |
| 2,916 | TASK MOVE MINI MENU |
| 2,971 | 구간 판 — 옮길 시간 구간을 고르고, 그 구간에 무엇이 있는지 본다 |
| 3,046 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 3,070 | 할일 메뉴 '기도 노트로' 의 오른쪽 판 (v26-1013-5) — 그룹 → 서브 그룹. 메뉴와 같은 모습 |
| 3,084 | Event add modal |
| 3,241 | WEEKLY/MONTHLY |
| 3,346 | D뷰 좌우 분할 (넓은 화면) |
| 3,357 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 3,380 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 3,387 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 3,822 | LOGIN / AUTH SCREEN |
| 3,898 | SETTINGS PANEL |
| 3,955 | 설정 등급(이지·미드·파워) 고르기 |
| 3,978 | 선 그림만으로 고른 것을 나타내는 자리 |
| 4,133 | 강조 표시 고르는 줄 (v26-0812-15) |
| 4,153 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 4,320 | 시간 구간 경계선 |
| 4,442 | 고른 것 = 강조색으로 꽉 채움 (v26-1024-18, HB "선택된 버튼이 뭔지 잘 안 보인다") |
| 4,507 | 말씀 대시보드 |
| 4,551 | 대시보드 위쪽 전환 (분포 ⇄ 흐름) |
| 4,563 | 흐름(추이) |
| 4,627 | 손으로 만든 슬라이더 (v26-0906-2, HB 5-1) |
| 4,726 | 작은 발견 (v26-0906-5, HB 2) |
| 4,752 | 성경 지도 (v26-0906-5, HB 1) |
| 4,781 | 파이 상세: 조각 수 슬라이더 · '기타' 켜고 끄기 (v26-0907-4, HB 4) |
| 4,818 | 연결 — 그래프 뷰 (v26-0907-4 · v26-0907-5, HB 7) |
| 4,869 | 짝 목록 (v26-0907-6, HB 3) |
| 4,994 | 리듬 (요일 × 한 시간) (v26-0907-3, HB 5) |
| 5,118 | 색상 테마: 뷰 탭 요약 줄 |
| 5,135 | 색상 테마 선택 화면 |
| 5,228 | 미리보기 목업 |
| 5,506 | 본문에 긋기 (v26-1007-19) |
| 5,674 | 성경 읽기 대시보드 (v26-1007-9 · 시안 MmxtwQwAy2xr4DbScFJM7m) — 색은 남색 하나를 진하기로만 |
| 5,764 | 첫 그림의 색은 **테마를 따르지 않는다** (v26-0922-23, HB) |
| 5,801 | 꿀벌집 — 아래에서부터 한 칸씩 차오른다 (v26-0922-22, HB) |
| 5,877 | PC: 넓어지면 **열이 는다** (v26-0922-11, HB 4) |
| 6,138 | 유튜브 썸네일은 **제 색을 더 많이 남긴다** (v26-0922-14, HB) |
| 6,285 | 편집 모드 |
| 6,309 | PC: 자판이 보고 있는 위젯 (v26-0921-13, HB) |
| 6,319 | PC: 자판이 보고 있는 타일 (v26-0921-12, HB) |
| 6,366 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 188 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 222 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 261 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 426 | 조기 적용 (첫 페인트 전) | – |
| 6,656 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `base`, `_swBootOff`, `gcalPad`, `gcalKeyOf`, `gcalAddDays`, `gcalDayDiff`, `gcalWindow` … 외 7개 |
| 9,654 | 반복 일정 → 구글 반복 규칙 (v26-1024-3, 3단계 ①) | `gcalYmd`, `gcalRecur`, `days`, `weeks`, `until`, `gcalHashEv`, `rc`, `gcalSeriesBody`, `gcalPatchBody`, `gcalCollect` |
| 9,729 | 구글 반복 → BLOCK7 반복 (v26-1024-7, 3단계 ②) | `gcalRuleHits`, `gcalDateOf`, `gcalParseRecur`, `gcalStamp`, `gcalExModified`, `gcalRf`, `gcalInstMaster`, `gcalInstDate`, `_gcalRepOn`, `_gcalRepNew` |
| 9,815 | 판단 | `gcalPlan`, `mastOf`, `instIdOf`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 10,118 | 네비게이토 180 암송성구 데이터 | – |
| 10,145 | Color presets | – |
| 10,163 | 네비게이토 180 verse bar | – |
| 10,164 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 10,180 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 10,220 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 10,238 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 10,359 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses`, `_collPeriodVerses`, `_cfHasSel`, `_cfClearSel`, `_plusKeyOf`, `_plusHas`, `_collVerseShows`, `_collVersePassesOnly`, `_plusVisibleMask`, `_plusVerses`, `_plusPrune`, `_plusTidy` … 외 3개 |
| 10,534 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_VERSES_ALL`, `_activeVersesFrom`, `ACTIVE_TOTAL` |
| 10,583 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 10,589 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 10,679 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_collHue`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList` … 외 3개 |
| 11,032 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 11,126 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 11,184 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 11,258 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 11,376 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 11,458 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `_pick`, `gid`, `_bump` |
| 11,665 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `endRow`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propImg`, `_propYt` … 외 4개 |
| 11,966 | 상황/필요 · 묵상 질문 (v26-0922-3, HB) | `colX` |
| 12,054 | '설교 목록' 탭을 그대로 연결하기 (v26-0922-8, HB) | `_isSermonListSheet`, `_sermonCatNorm`, `_sermonListMap`, `h`, `at`, `_sermonYtFor`, `_applySermonListSheet` |
| 12,147 | 영상이 없는 설교 (v26-1005-1, HB) | – |
| 12,157 | 알리지 않는 예배 (v26-1010-7 · 침례식·특별 추가 26-1010-8, HB) | `_sermonSkipNoVideo`, `_sermonNoVideo` |
| 12,200 | 한 모음에 연결된 시트 여럿을 **한 번에** 반영한다 (v26-1004-1, HB 신고) | `_syncVerseFp`, `_syncCollSheets`, `_rowsToItems`, `_importVerseRows`, `_sheetCsvEndpoints`, `_fetchSheetCsv`, `_loadSheetJs`, `importFromFile` |
| 12,403 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 12,521 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 12,599 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 12,650 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_shareCopy`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `_grpNameNorm`, `_grpNameValid`, `_grpAddrUrl`, `_grpAddrShow`, `_grpFetch`, `_subscribeShared`, `verses`, `_grpSync` |
| 12,858 | 빼기 | `runGroupSync`, `_joinRead`, `_joinClear`, `_joinFromPath`, `_joinApply` |
| 12,975 | 그룹 만들기·고치기 (교회 쪽 화면) | `openGroupDialog`, `closeGroupDialog`, `_grpAddrPreview`, `_grpRenderColls`, `doSaveGroup`, `gname`, `_grpShowAddr`, `openShareDialog`, `closeShareDialog`, `_shareResetBigText`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy` … 외 6개 |
| 13,257 | GNB 의 There · 성경 · 1단 롤링 피커 (v26-1006-6, HB 8) | `_gnbExtrasSync`, `_gnbPickerOn`, `_gnbPickerStep`, `_gnbRpMenu`, `cur`, `go`, `renderVerseBar` |
| 13,359 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_vbThereEl`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncItems`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 13,616 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseResizeThreshold`, `_verseResizeOpacity`, `_verseModeTextEls`, `_verseModeSession`, `_verseModeSettle` |
| 13,825 | 크기 전환 드래그의 공통 손잡이 | `_verseDragBegin`, `_verseDragMove`, `travel`, `_verseDragEnd`, `_initVerseBarResize`, `_verseBandHit`, `bottom`, `_initVerseBandDrag`, `decide`, `unwatch`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual` … 외 15개 |
| 14,359 | 상단 › 다음 구절로 (v26-1024-16, HB 설정창 정리) | `_verseNextMode`, `_syncVerseNextBtns`, `setVerseNext`, `renderVerseSettingsModal` |
| 14,438 | 인앱 말씀 팝업 | – |
| 14,442 | 말씀 푸시 알림 설정 | `_vpOrders`, `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 14,473 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 14,562 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent`, `_bibleChapters` … 외 1개 |
| 14,783 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 14,794 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 14,859 | 암송 관리 | `getMemLog` |
| 14,866 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 14,889 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 14,912 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare`, `getThereLog`, `_thereBegin`, `_thereCommit`, `_thereEach`, `_thereTotalSec`, `_thereCountFor`, `_thereClock`, `_thereDurWords` |
| 14,986 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 15,006 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 15,174 | BibleLinkProvider | `_brKey`, `getBibleMarks`, `getBibleReadLog`, `getBibleNotes`, `_brSetMark`, `_brNoteSave`, `_brNotesAt`, `_brMigrateNotes`, `_brReadMs`, `_brHistory`, `_brHistHide`, `_brReadAdd`, `_brDev`, `_brParseRef` … 외 6개 |
| 15,446 | 성경 읽기 대시보드 — 기록 → 숫자 (v26-1007-9, B-9) | `_brDashRows`, `_brDashStart`, `_brSeenOf`, `_brDashStats` |
| 15,538 | 본문에 긋는 표시 (v26-1007-19, HB — 시안 FsJa1z2zfw4PHv9gCAwrrs 그대로) | `getBibleInk`, `_brInkId`, `_brInkSpansFrom`, `_brInkStepPos`, `_brInkCut`, `_brInkAdd`, `one`, `_brInkErase`, `_brInkHits`, `_brInkQuery` |
| 15,583 | 원어찾기 기록 (v26-1009-2, HB) | `getBibleOrig`, `_brOrigAdd`, `_brOrigNote`, `_brOrigWords` |
| 15,598 | 읽을 곳 (v26-1009-8, HB) — 장 단위 '읽을 거리'. 본문 위 오른쪽부터 매달린 탭 | `getBibleToRead`, `_brTRHas`, `_brTRToggle`, `_brTRKey`, `_brTRList`, `_brTRSetOrder`, `_brUrl`, `_brFetchJSON`, `_brGet`, `_brBook`, `_brVerseObj`, `bibleStartPreload`, `_sheetDrag`, `_sheetDragBindSettings` … 외 49개 |
| 16,001 | 읽는 시간 · 본 절 — 장을 펼친 순간부터 다음 장·닫기·앱 벗어남까지 | `_brSessEnd`, `_brSessStep`, `_brDiagStuck`, `_brDiagSync`, `_brDiagStore`, `_brDiagText`, `_brBusy`, `_brActiveWin`, `_brSessStart`, `bibleOpenLast`, `_brPosSave`, `bibleOpenRef`, `bibleOpen`, `bibleClose` … 외 7개 |
| 16,200 | 헤더·하단 접기 (v26-1007-7, HB — 갓피플 방식) | `_brChromeApply`, `_brChrome`, `_brChromeFreeze`, `_brOnScroll`, `_brProgSync`, `_brOpenDash`, `_brFmtMin`, `_brDashRender`, `pd`, `q`, `_brUnpark` |
| 16,345 | 절 롱터치·우클릭 메뉴 (v26-1007-8, HB) | `_brVmOpen`, `_brVmClose`, `_brViewVs`, `_brViewRef`, `_brVmRun` |
| 16,394 | 시트 | `_brOpenSheet`, `_brCloseSheets`, `_brOpenAct`, `_brDate`, `_brOpenMemo`, `_brCopy`, `done`, `_brCopyFallback` |
| 16,448 | 고르기 판 | `_brRecent`, `_brRenderPick` |
| 16,492 | 글자와 화면 | `_brApplyLook`, `_brLzGet`, `_brLzPaint`, `f`, `_brSyncAa`, `_brSet` |
| 16,521 | 내 표시 목록 | `_brRow`, `_brRenderList`, `txt`, `_brNoteInline`, `_brNoteHTML`, `flush` |
| 16,603 | 원어 목록 (v26-1009-3) | `_brOrigListHTML`, `note`, `_brListDelete`, `_brRowGone`, `_brSwipeBind` |
| 16,663 | 검색 | `_brRunFind`, `_brSyncScope` |
| 16,701 | 묶기 (한 번만) | `_brBind`, `TOUCH`, `inkStart`, `inkMove` |
| 16,772 | 스크롤 기록 (v26-1010-11, HB — 아이패드 미니에서만 걸림. 기기 없이 두 번 헛짚었다) | `selRef`, `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 17,235 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 17,329 | 기다리는 동안 보여 줄 것 넷 (v26-1010-9, HB) | `_toastSpin` |
| 17,349 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 17,585 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `_vfRestoreCovers`, `closeVerseFull`, `_vfSyncPageBg`, `_verseFullIsOpen` |
| 17,677 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 17,685 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `hit`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns` … 외 22개 |
| 18,321 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 18,359 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 8개 |
| 18,700 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 18,806 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 18,812 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 18,860 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `_syncDeeperOpenUI`, `setDeeperOpen`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount` … 외 3개 |
| 19,023 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | `_thereIconKey`, `_thereIconSync`, `_thereIcHTML`, `setThereIcon` |
| 19,115 | 세팅 (이 기기에만) | `_tfDevKind`, `_tfLoad`, `_tfStore`, `_tfGet`, `_thereStripHanja`, `_thereWordFromVerse`, `_thereWordFromBible`, `pages` |
| 19,168 | 말씀 세팅 (이 기기에만 — 다른 There 세팅과 같은 칸 _lsk('thereFx')) | `_tfW`, `_tfBreathAt`, `x`, `_TF_NOISE`, `_tfNoise`, `_tfCandleAt`, `_tfFlickerAt`, `_tfFlickerParams` |
| 19,230 | 그리기 | `_tfHex2Hsl`, `_tfHsl2Rgb`, `_tfSprites`, `_tfPick`, `_tfBuildSprites`, `_tfSize`, `_tfSpawn`, `_tfDrawCross`, `_tfFrame`, `el` |
| 19,330 | 세팅 판 | `_tfSyncUI`, `_tfWire`, `thereTuneClock`, `thereTuneReset`, `thereTuneFold` |
| 19,393 | There 말씀 그리기 (v. 26-1024-14, HB) | `_tfQuiet`, `_tfWordSet`, `_tfWordApply`, `_tfWordRender`, `_tfWordFit`, `_tfWordRect`, `_tfWordToggle`, `_tfWordGo`, `_tfWordMulti`, `_tfWordWire`, `mvEl`, `_tfWordSyncUI`, `_tfWordChanged`, `thereWordSw` … 외 1개 |
| 19,562 | 테마 입히기 (v26-0923-8, HB) | `_tfApplyTheme`, `set`, `mix` |
| 19,592 | 열기·닫기 | `_thereIsOpen`, `openThere`, `closeThere`, `_thereRecorded`, `openThereFromVf`, `openThereTune` |
| 19,645 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 19,758 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 19,861 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 20,138 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 20,280 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 20,295 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 20,529 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 20,544 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 20,558 | 명조 | – |
| 20,562 | 고딕 | – |
| 20,565 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptPreloadVerse`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish` … 외 3개 |
| 20,812 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 21,127 | 크기 (v26-0905-2, HB — "말씀 모음 설정에 비해 홈과 책갈피가 | – |
| 21,139 | 홈 아이콘 두 벌 (v26-0905-7, HB) | – |
| 21,154 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfPrepareNext`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav` |
| 21,277 | 지금 보는 것이 '말씀 설정에서 정한 그 모음' 그대로인가 | `_vfAtCollection`, `_vfHomeStash`, `vfHomeAction`, `vfOpenDashboard`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab`, `_vfRenderKeepSwitch`, `toggleVfKeepSwitch`, `_vfKeepNav`, `vfOpenKeepList`, `vfOpenKeepGrid`, `_vfTitleTileFn` … 외 3개 |
| 21,545 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 21,777 | 설정창 (말씀설정 → 전체화면 탭) | `_ptMotionOn`, `_ptPickMotion`, `togglePropTitleMotion`, `_ptSyncMotionUI`, `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 21,853 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 21,961 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 21,983 | 명제 **본문** 가르개 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 22,035 | 명제 대표 문구 타이틀 | – |
| 22,038 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines` |
| 22,114 | 대표 문구 줄바꿈 (v26-0913-4, HB) | – |
| 22,151 | 끊으면 말이 두 동강 나는 자리 (v26-0913-5, HB) | – |
| 22,177 | v26-0913-6, HB 가 준 예로 더 넣은 것 | `_ptGlued`, `_ptCutPoint`, `mid`, `_ptCutTitle` |
| 22,271 | 정한 줄을 **폭을 아는 자리에서** 다시 정한다 (v26-0913-6, HB) | `_ptAvailW`, `pad`, `_ptRelines`, `widest`, `_ptPaint`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 22,460 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 22,749 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 22개 |
| 23,087 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 23,092 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 23,193 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 23,220 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 23,244 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 23,281 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_vfCatCue`, `_initVfCatSheet`, `stopTimer`, `disarm`, `vfOpenSheetForCat`, `prop`, `_sheetCopyThenGo`, `go`, `_sheetIsPc` |
| 23,478 | 명제는 늘 '명제 DB' 탭으로 (v26-1010-16 PC · v26-1010-17 휴대폰, HB) | `_sheetMainTtl`, `_sheetMainBuild`, `links`, `_sheetMainLoad`, `_sheetMainReady`, `_sheetMainWarm`, `_sheetGoMain`, `_sheetOpenPropMain`, `_sheetGo`, `_sheetCopyPending`, `_sheetEditUrlNorm`, `_sheetEditCall`, `u`, `ctl` … 외 21개 |
| 24,045 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight`, `top` |
| 24,063 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_logoMenuEsc`, `_tryCloseLogoMenu` |
| 24,212 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `renderVerseListPies`, `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 24,323 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 24,431 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 24,451 | 암송 기록 마이그레이션: verseIdx → ref | – |
| 24,487 | 이 기기에 ST 적기 (v26-1010-12, HB — 읽기 계획 탭이 두 번 통째로 사라졌다) | `_lsStKey`, `_lsDropBase`, `_lsPutST`, `put`, `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 24,596 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `_repRule`, `_repUntil`, `_repEx`, `_repBlocked`, `_dayKeyBefore` … 외 6개 |
| 24,858 | 긴 일정 이름 (v26-1024-9, HB) — 할일행 머리의 일정 칩 글자 수 | `_evChipN`, `_evChipCut`, `_evChipPreview`, `_evChipLabel`, `_evChipSync`, `evChipMaxInput`, `evChipMaxCommit` |
| 24,897 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 25,009 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 25,049 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 25,087 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 25,121 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 25,369 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 25,391 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 25,403 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 25,455 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 25,718 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 25,798 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 26,036 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 26,256 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 26,312 | 범위(scope)별 집계 (v26-0904-7, HB) | `_vlKindEntries`, `_vlKeepEntries`, `_vlHomeEntries`, `_vlReactTotals`, `_vlExtraSortFor`, `_vlEntriesForScope` |
| 26,372 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 26,407 | 정렬 (v26-0831-11, HB) | – |
| 26,411 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vlwKey`, `vlwSetSort`, `vlwTogglePairSort`, `vlwSetPeriod`, `vlwSetCustom`, `_vListControlsHTML` … 외 28개 |
| 26,767 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 26,837 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 26,863 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 26,895 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 27,081 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `_keepSwitchIsOpen`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 27,120 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 27,203 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 27,257 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashMaxSlice`, `_vDashShowEtc`, `_vDashEtcColor`, `vDashSetSlices`, `vDashToggleEtc`, `_vDashKeyCmp` … 외 19개 |
| 27,594 | 위쪽 전환: 분포(파이) ⇄ 흐름(꺾은선) | `_vDashView`, `vDashSetView`, `_vDashCommonHTML`, `_vDashViewTabsHTML`, `renderVerseDashboard`, `_tdLoadPray`, `_tdOpts`, `renderVDashThere`, `openThereDash`, `_tdBindLong`, `_tdBindAll`, `renderVDashPie`, `_vDashPieInsightHTML`, `_vTrPref` … 외 10개 |
| 27,892 | 기간 슬라이더 | `_vTrOtherSpan`, `vTrSpanSet` |
| 27,916 | 부드럽게 끌리는 슬라이더 | `_vTrRailBind`, `paint`, `fire` |
| 27,984 | 양쪽 손잡이 슬라이더 (v26-0907-3, HB 6-3) | `_vTrExclLabel`, `_vTrRail2Bind`, `paint`, `_vTrBindRails`, `vTrInsSet`, `vTrToggleSeries`, `vTrToggleExp`, `vTrOpenBook`, `on`, `vTrCloseBook`, `_vTrEntries`, `_vTrBucketOf`, `_vTrBucketRange`, `_vTrNowBucket` … 외 10개 |
| 28,278 | 그 성경 안에서 이 말씀이 걸리는 '장' | `_vTrChapterKeys`, `rs`, `_vTrChapNo`, `_vTrChapCmp`, `_vTrData`, `unit`, `add`, `_vTrGeo`, `bw`, `_vTrHFromX`, `_vTrChartSVG`, `nameTx` |
| 28,383 | 견주는 두 구간을 그림 안에 그린다 (v26-0906-1 · v26-0906-2, HB 4) | `markOf` |
| 28,544 | 그림 안의 띠를 끌어 견주는 구간(h)을 바꾼다 (v26-0906-2, HB 4-1) | `_vTrBindBand`, `fitPill`, `paint`, `_vTrChipsHTML`, `_vTrRailHTML`, `f`, `pct`, `_vTrRail2HTML`, `_vTrSpanRowHTML`, `unit`, `_vTrRowsOf`, `sum`, `_vTrDiffHTML`, `_vTrInsightHTML` … 외 1개 |
| 28,781 | 작은 발견 (v26-0906-5, HB 2) | `_vTrFindings`, `sum`, `_vTrFindingsHTML`, `card`, `put` |
| 28,846 | 표 정렬 (v26-0906-2, HB 7) | `_vTrNameCmp`, `_vTrSortRows`, `_vTrTheadHTML`, `_vTrRowHTML`, `renderVDashTrend`, `form`, `unit` |
| 28,937 | 소제목 차례: 범위 - 무엇을 - 모양 | `_vDashSubKind`, `_vDashSubArmed`, `_vDashSubRefSet`, `vDashSubToggle`, `vDashKindPick`, `_vDashWinEntries`, `sc`, `keys`, `from`, `to`, `_vDashSpanWords`, `_vDashScope`, `_vDashScopeCtlHTML`, `_vDashVerbWord` … 외 8개 |
| 29,192 | 지도 | `_vMapMode`, `vDashMapPick`, `_vMapStats`, `_vMapStep`, `_vMapShade`, `_vMapInk`, `_vMapGroups`, `_vMapRange`, `lo`, `hi`, `_vMapRanks`, `_vIdKey`, `k`, `_vMapChapMap` … 외 9개 |
| 29,460 | 3-2 · 고른 조건이 만든 줄들 | `grid` |
| 29,612 | 연결 (주제 ↔ 성경) | `_vLinkAxis`, `_vgStop` |
| 29,652 | 배치 값 (2-1) | `_vgCfg`, `cl`, `vgCfgSet`, `vgCfgReset` |
| 29,687 | 골라 보기 (1-1) | `_vgSel`, `_vgDepth`, `vgDepthSet` |
| 29,703 | 노출 순위창 (2-1·2-2) — "몇 등부터 몇 등까지 그래프에 보일지". | `_vgRankPref`, `_vgRankOf`, `vgRankSet`, `_vgRankRailBind`, `paintRows`, `paint`, `vgSetSelOnly`, `vgToggleSel`, `vgClearSel`, `vgSearch`, `_vgSeeds`, `_vgReach`, `_vgDepthCounts`, `_vgApplyFilter` … 외 2개 |
| 29,949 | 껍데기를 먼저 넣는다 | – |
| 29,982 | 이제 그래프가 실제로 차지한 폭을 재고, 그 폭으로 점을 만든다 | `push`, `_vgShow`, `vgToggle`, `vDashLinkRelayout`, `_vgClamp` |
| 30,053 | 물리와 그리기 | `_vgRun` |
| 30,098 | 2-2 · 키울 때 점과 글자는 **제곱근만큼만** 커진다 | `applyScale`, `mark`, `paint` |
| 30,130 | 한 판 — 척력 · 용수철 · 가운데로 · 감쇠 | `stickOf`, `_rep2`, `tick`, `loop` |
| 30,224 | 손가락 · 마우스 | `applyView`, `toGraph`, `_vfSetTabPool`, `_vfTabList`, `_vpOtherAxis`, `_vpFacetCandidates`, `_vpFiltMulti`, `vpToggleFilt`, `_vpFiltRefSet`, `_vpTabName`, `_vpRep`, `_vpShortRef`, `_vpPool`, `_vpList` … 외 22개 |
| 30,715 | 주간 리듬 (잔디) | – |
| 30,716 | 리듬 (요일 × 한 시간) | `_vRhyKind` |
| 30,730 | There (v26-0923-7, HB) — 범위 맨 끝 '저장' 다음 | `_vRhyThereSplit`, `_vRhyBands`, `secs`, `renderVDashRhythm`, `dow`, `_lord` |
| 30,930 | 장절 느슨한 대조 | `_refNorm` |
| 30,967 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 31,011 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 31,094 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoTab`, `_vsetGoColl`, `_vsetFlashTab`, `openVerseSettingsFromMenu`, `openVerseSettingsFromLogo`, `openVerseCollFromListMenu`, `openVcCollSettings`, `_vsetRestoreBack`, `vsetGoDashboard`, `vDashOpenCollSettings` … 외 1개 |
| 31,255 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `_vDashDetailDotsHTML`, `vDashOpenDetail`, `_vDashDetailGo`, `_vDashDetailSlide`, `_initVDashDetailSwipe`, `slide`, `bodyEl`, `finish`, `_vDashDetailKey`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup` … 외 10개 |
| 31,651 | 위젯이 보는 범위 (v26-0904-7, HB) | `_vcScope`, `_vcScopeIsHome`, `_vcScopeCount`, `_vcSyncKind`, `_vcView`, `_vcScopeKey`, `_vcScopeIcon`, `_vcScopeLabel`, `_vcScopeParts` |
| 31,714 | 자동 넘김 (v26-0904-10, HB) | `_vcAutoOn`, `_vcAutoMin`, `_vcAutoSeq`, `_vcAutoOffset`, `_vcAutoSlot` |
| 31,763 | 앱을 껐다 켤 때 (v26-0905-10, HB) | `_vcAutoAnchors`, `_vcAutoSaveAnchors`, `_vcAutoSetAnchor`, `_vcAutoResetAnchors`, `setVcAuto`, `setVcAutoMin` |
| 31,819 | 이름 넘김 방식·간격 (v26-0905-8, HB) | `_vcRollSec`, `_vcRollMode`, `_vcRollOpt`, `_rollSecLabel`, `setVcRollMode`, `setVcRollSec`, `vcRollSecInput`, `_vcHeadMode`, `setVcHeadMode`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId` … 외 5개 |
| 31,927 | 카드가 도는 범위 | `_vcListItems`, `_vcVerseOf`, `hit`, `_vcKeyOf` |
| 31,958 | 명제의 대표 문구 (v26-0904-10, HB) | `_vcHiSplit`, `_vcVerses`, `_vcCurrent` |
| 32,018 | 자동 넘김 시계 | `_vcAutoChanged`, `_vcAutoSlide`, `finish`, `_vcAutoTick`, `_vcAutoStart`, `_vcFilterLabel` |
| 32,100 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 32,140 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 32,151 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 32,172 | 카드 한 장 HTML | `_vcCardHTML` |
| 32,256 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 32,350 | 카드 동작 | `_vcReactKeyOf`, `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind` |
| 32,491 | 카드 ⇄ 목록 | `vcSetView`, `vcToggleView`, `vcAddCard`, `_vwScopeOpts`, `openVwScope`, `closeVwScope`, `renderVwScope`, `row`, `_vwKeepSortHTML`, `chip`, `_vwScopeBindHold`, `go`, `vwScopeCollSettings`, `vwScopePick` … 외 3개 |
| 32,666 | 말씀 목록 모습 한 벌 | `_vcListHTML`, `_vcAttachGestures` |
| 32,807 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `hmBtn`, `rmBtn`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale` … 외 4개 |
| 33,110 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 33,130 | 각 컬럼 렌더링 | – |
| 33,150 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 33,158 | There · 성경: 상단 말씀이 켜졌을 때만 (_gnbExtrasSync) | – |
| 33,161 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 33,174 | 3단 주간뷰 패널 | – |
| 33,198 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 33,238 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 33,368 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 33,453 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn` … 외 3개 |
| 34,198 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 34,199 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 34,222 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 34,276 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 34,404 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount` |
| 34,416 | Even Deeper 는 **개발자 계정에만** 보인다 (v26-0922-17, HB) | `_evenOn`, `_syncEvenVisibility`, `_syncDevVerBadge`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge` … 외 10개 |
| 34,669 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 34,705 | 개발자 쪽지 (설정창 계정탭) | – |
| 34,717 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 35,110 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass` |
| 35,321 | 하위·메모: 자료 다루기 (순수 함수) | `_subsOf`, `_subStat`, `_subParse`, `_subSyncParent`, `want`, `_subSetAll`, `_subsCopy`, `_carryTaskExtras` |
| 35,376 | 메모 안에서 알아보는 것 (URL·전화·이메일·날짜) | `_memoScan`, `_memoDateKey`, `_memoTelDigits` |
| 35,427 | 하위·메모: 화면 | `_taskArrOf`, `_subRerender` |
| 35,440 | 줄 끝의 작은 원형 게이지 | `_subGaugeSVG`, `r`, `_subGaugeFill`, `_memoBadgeFill`, `_wireSubHandle`, `clearLp`, `_subToggleBadgeFill`, `makeSubToggleBadge`, `_attachSubMemoBadges`, `_subPrune`, `_subKey`, `_subIsOpen`, `_subToggleOpen`, `open` … 외 2개 |
| 35,572 | 하위 할일 판 | `makeSubPanel`, `_makeSubRow`, `clearLp`, `_makeSubGhost`, `fit`, `commit`, `_subAdd`, `_subRemove` |
| 35,742 | 하위 줄 메뉴 (위로 · 아래로 · 꺼내기 · 삭제) | `openSubRowMenu`, `row`, `closeSubRowMenu`, `_subMoveFromMenu`, `_subRemoveFromMenu`, `_subPromoteFromMenu`, `openTaskMemo`, `closeTaskMemo`, `toggleTaskMemoEdit`, `_memoItem`, `_memoSaveEdit`, `_memoRender`, `_memoViewHTML` |
| 35,916 | 알아본 것을 눌렀을 때의 동작 메뉴 | `openMemoActMenu`, `row`, `closeMemoActMenu`, `_memoCopyText`, `memoActRun`, `_memoMoveTaskToDate`, `_memoSaveToPhone`, `name`, `openContactsModalWith`, `set` |
| 36,098 | 할일 메뉴의 두 줄 ('하위 할일' · '메모') | `openSubsFromMenu`, `openMemoFromMenu`, `_prayDb`, `_prayUid`, `_prayTree`, `_prayLoadGroups`, `_prayPickClose`, `_prayPlace`, `_prayPanel`, `_prayOpenGroups`, `_prayOpenKids`, `_prayPickHover`, `_prayPickTap`, `_praySend` … 외 10개 |
| 36,383 | 시리: 앱에 잇는 자리 | `_siriPlace`, `_siriSaved`, `_siriRenderSettings`, `siriMakeKey`, `_siriMakeKeyNow`, `siriCopyUrl`, `ok`, `makeBigWrap`, `getCarryCount`, `_playDoneFx`, `style`, `_fxGlow`, `_fxRipple`, `populateCarryBadge` … 외 3개 |
| 36,654 | 행보다 긴 할일 (H-6, HB 2026-10-22) | `_ovfQueue`, `_ovfMode`, `_ovfClear`, `_ovfRun`, `_syncTaskOvfBtns`, `v` |
| 36,722 | 긴 할일 고치기 — 여러 줄 칸 (H-6, HB 2026-10-22) | `_longEditOpen`, `close`, `back`, `_makeUrgentBadgeHTML`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal`, `makeSmWrap`, `makeSmItem`, `makeSmInlineGhost`, `openSmGhost`, `closeSmGhost`, `renderSmList` … 외 3개 |
| 37,293 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 37,298 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `beginMouseDrag`, `cancelMousePress` |
| 37,365 | Desktop: right-click → task move context menu | – |
| 37,373 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 37,578 | Hold off the browser's scroll gesture WHILE the long-press | – |
| 37,606 | 더블탭 = 중요 표시 토글, 트리플탭 = 긴급 표시 토글 | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 37,669 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 37,684 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 37,737 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 38,105 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `_finishEditKeepRow`, `buildFlatList` … 외 11개 |
| 38,457 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 38,524 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 38,672 | While editing a big/small task's text | – |
| 38,701 | Not editing text: arrow-key driven selection | – |
| 38,732 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `_kbWOn`, `_kbWEls`, `_kbWName`, `_kbWSync`, `_kbWSet`, `_kbWStep`, `_kbWGo`, `_kbWPage`, `_kbWEnter` |
| 38,904 | 할일 다루기 | `_kbSelItems`, `_kbAnchor`, `_kbSecId`, `_kbToggleDone`, `_kbReactivate`, `_kbDelete`, `_kbOneSel`, `arr`, `_b7TaskKey` |
| 39,004 | 들어오는 문 | `_b7KbReady`, `_b7BoardKey` |
| 39,027 | 위젯 포커스를 잡은 동안 | – |
| 39,042 | 포커스를 잡기 전 — 여기서만 새 글쇠를 받는다 | `_kbWHint`, `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `_contactTaskSvg`, `_wireContactTaskBadge`, `makeContactBadges`, `contactBadgeCountChanged` |
| 39,325 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 39,402 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 39,476 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 39,577 | Event add modal | `syncRollDisplays` |
| 39,605 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 39,878 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 39,945 | Touch | – |
| 39,977 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `_gcalTz`, `_gcalDsh`, `_gcalCfg`, `_gcalSetCfg`, `_gcalUser`, `_gcalUsable` … 외 8개 |
| 40,261 | 구글 쪽 바뀜 알아채기 (v26-1024-8, HB '구글에서 고친 것이 늦거나 안 온다') | `_gcalSeen`, `_gcalProbe`, `_gcalDefSec`, `_gcalFind`, `_gcalGone`, `_gcalTomb`, `_gcalOnSave`, `_gcalKick`, `_gcalRunRemote`, `bad`, `_gcalApplyLocal`, `gcalSync`, `_gcalBoot`, `_gcalAfterConnect` … 외 12개 |
| 40,621 | 일정 입력창의 캘린더 고르기 (v26-1024-1, HB) | `_gcalPickRender`, `opts`, `draw` |
| 40,654 | 여러 날 일정 (v26-1024-2, HB) | `_gcalSpanN`, `dsh`, `_gcalMD`, `_gcalSpanTag`, `_gcalLanes`, `_gcalMonthLanes`, `_gcalSegHTML`, `lb`, `_gcalPickApply`, `_gcalPickApplyV`, `closeTaskMenu`, `toggleTaskFlag`, `_taskPriorityRank`, `_reorderTaskPriority` … 외 2개 |
| 40,838 | 긴급 표시 스포트라이트 | `_applyUrgentSpotlight`, `_ensureUrgentSpotlightObserver`, `_urgentItemsOn`, `_clearUrgentOnDone`, `_doToggleUrgent`, `toggleTaskUrgent`, `toggleUrgentRank`, `_newTask`, `_autoContactMark`, `toggleTaskContact`, `_repBadgeFill`, `body`, `_taskRepDefault`, `_taskRepWeekly` … 외 7개 |
| 41,098 | 옛 자료 옮겨심기 | `_migrateTaskRepeats` |
| 41,132 | 그 날짜의 실체 만들기 | `materializeRepeatsFor`, `ensureDailyRepeats`, `ensureRepeatsForView` |
| 41,174 | 보여주기용 앞날 미리보기 (저장하지 않는다) | `getDisplayTasks`, `own` |
| 41,198 | 매일/매주 반복 켜고 끄기 | `toggleDailyRepeat`, `toggleWeeklyRepeat`, `_taskSetRepeat`, `_repScopeAsk`, `kindWord`, `verb`, `closeRepScope`, `_repScopePick` |
| 41,308 | 묶음을 훑어 지우기 | `_repPurgeTasks`, `_repPurgeEvents`, `_repAddEx`, `_repHiddenOn` |
| 41,363 | 일정의 원본 찾기 | `_evRepRootOf`, `_evInSeries` |
| 41,383 | 규칙을 물려줄 때 끝날·뺀 날은 잃지 않는다 | `_repKeepMarks`, `_evEditApply`, `putOverride`, `_evOverrideDays`, `_evInheritCal`, `_evDeleteApply`, `_taskDeleteAt`, `arr`, `_taskDeleteApply`, `arr`, `_taskTextCommit`, `arr`, `_taskTextApply`, `arr` … 외 26개 |
| 41,937 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | – |
| 41,944 | 구간 열어 보이기 (v26-1015-9, HB) | `_secClosed`, `_revealSec`, `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_dayTaskSecs`, `_fillTaskMenuCounts`, `_tmSubPanel`, `_tmSubReset`, `_tmSubHide`, `_tmSubOpen`, `_tmSlide`, `_tmFloatOK` … 외 4개 |
| 42,163 | 완료 후 다음 할일 | `nextAfterDoneTo`, `nextAfterDoneYesterday`, `_todayDateObj`, `nextAfterDoneYday`, `nextAfterDoneYdayPicked`, `nextAfterDonePicked`, `_focusNewTaskInput`, `sel`, `_secPickOn`, `_daySecTasks`, `_secPickSecs`, `_secPickSpecFor`, `_secPickFloat`, `_secPickRender` … 외 30개 |
| 42,987 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 18개 |
| 43,413 | M뷰 칸 높이 (v26-1024-6, HB) | `_mGridH`, `_mGridSetH`, `_mFitCells`, `_mGridApplyH`, `fit`, `minH`, `initMonthlySwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd` |
| 43,558 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 43,662 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` |
| 43,843 | 설정창은 이 기기에서 마지막에 쓰던 탭으로 열린다 (v26-1024-19, HB) | `_setTabMemKey`, `_setTabMemGet`, `_setTabMemPut`, `_vsetStartTab`, `openAccountSettings`, `openSettings`, `_flashSettingsTab`, `closeSettings`, `closeSettingsOnBg`, `closeAccountSensitiveModals`, `renderSettingsPanel`, `_chk`, `_syncBpPickers`, `fill` … 외 7개 |
| 44,280 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 44,281 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 44,353 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 44,634 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 44,815 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n` |
| 44,832 | 설정창 묶음 카드 (v26-1024-15, HB — 타이머 설정창처럼 · 세 창 공통 규칙) | `_sgEdges`, `sgFold` |
| 44,854 | 묶음 접기 — 기기 폭에 따라 (v26-1024-20, HB S-5) | `_sgDevClass`, `_sgTitle`, `_sgFoldMem`, `_sgFoldMemPut`, `_sgFoldDefaultOpen`, `_sgFoldInit`, `sgGroupToggle`, `_sgFoldSum`, `_sgFoldSumAll`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget` … 외 2개 |
| 45,141 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 45,238 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 45,313 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 45,370 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 45,459 | Backup / restore | – |
| 45,460 | 백업에 담는 '말씀 쪽' (v26-0921-8, HB 4-5) | `_myProductSettings`, `_backupPayload`, `sw`, `exportBackup`, `_backupDownload`, `_bakDevice`, `buildBackupFilename`, `email`, `emailTag`, `bkKey`, `n`, `importBackup` |
| 45,669 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 45,816 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 45,821 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 45,843 | 진단 기록 보조 저장소 (localStorage) | – |
| 45,847 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 46,425 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 46,457 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 46,564 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 46,580 | Day-change catch-up on wake | – |
| 46,631 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 46,806 | 말씀 모음 동기화 결과 화면 (v26-0913) | `_escHtml`, `showSyncResultModal`, `totalChg` |
| 46,883 | 영상 링크가 없는 설교 (v26-1005-1, HB) | `_syncNoVideoHTML`, `a` |
| 46,909 | "새로 들어온 말씀을 목록에 포함시키기" (v26-0916-2, HB) | `_syncIncludeInit`, `total`, `_syncGoBtn`, `syncIncludeOpenFull`, `list`, `_syncIncludeRender`, `bub`, `syncIncludeNow`, `syncIncludeUndo`, `_syncCatWeight`, `_syncGroupWeight`, `w`, `closeSyncResultModal` |
| 47,039 | 따로 포함한 목록 (v26-0916-2, HB) | `openPlusList`, `closePlusList`, `setPlusTab`, `_plusAfterChange`, `plusRemoveKeys`, `plusRemoveCat`, `plusRemoveTopic`, `plusClearAll`, `renderPlusList`, `addRow` |
| 47,154 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 47,249 | 푸시 배관(토큰) 공용 | – |
| 47,260 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 47,374 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 47,402 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub` |
| 47,432 | 알림 서버에 '예약을 다시 짜 주세요' (v26-1024-13) | `_pushReplan` |
| 47,447 | 기기 등록에 앱 표시 (v26-1024-13) | `_pushTagProduct`, `initForegroundPush` |
| 47,476 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 47,488 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 47,519 | 알림 테스트 | `testLocalNotification`, `sendTestPush` |
| 47,557 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_upTries`, `_upSetTries`, `_upClearTries`, `_verTap`, `_upReloadFresh`, `_upSafeNow`, `_upApply`, `_upCheck`, `_fbSyncReady`, `authToggleMode`, `authSetLoading`, `authSubmit` … 외 2개 |
| 47,789 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 47,876 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle`, `_fbVerIsOlder`, `_mgWhole` |
| 47,939 | 처음값 채우기는 편집이 아니다 (v. 26-1025-9, ROADMAP B-2) | `_mgIsFill`, `_mgFillSide`, `_mgSetting`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay` |
| 48,079 | 긴급 표시 한도(하루 2개)를 병합 뒤에도 지킨다 (v26-0914-3) | `_mgEnforceUrgentCap`, `_mgById`, `_fbHasAdoptedCloud`, `_fbCountArrays`, `_fbCountByKind`, `_fbCountItems`, `_fbBulkLoss`, `_fbMergeGuarded`, `_fbMerge`, `_dfJ`, `_dfSame`, `_dfCut`, `_dfQ`, `_dfDay` … 외 7개 |
| 48,349 | 안쪽 이름표를 사람 말로 | `_dfSeg`, `_dfSegPath`, `_dfWord`, `_dfValS`, `_dfVal` |
| 48,407 | 값 두 벌에서 **다른 자리만** 뽑는다 | `_dfDeep`, `_dfDeepLines`, `_dfKindName`, `_dfToday`, `_dfPush` |
| 48,444 | 할일 한 구간(배열) | `_dfTaskKey`, `_dfArr` |
| 48,493 | 날짜별 할일·일정 | `_dfDays`, `A` |
| 48,511 | 말씀 모음 하나 | `_dfVKey`, `_dfColl1`, `_dfColls` |
| 48,537 | 연락처 하나 | `_dfContact1`, `_dfContacts` |
| 48,550 | 기록(암송·좋아요·담아두기·나눔·Deeper) | `_dfLogRefs`, `_dfLogs` |
| 48,579 | 설정 | `_dfSettings`, `A` |
| 48,594 | 본체 — 상태 a(이전) 에서 b(이후) 로 무엇이 달라졌나 | `_dfDiff`, `_dfBrief`, `_dfScale`, `k`, `days`, `_dfScaleText`, `_cfJ`, `_cfDiffer`, `_cfId`, `_cfSecLabel`, `_cfKindLabel`, `_cfText`, `_cfMake`, `_cfScanSection` … 외 11개 |
| 48,953 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal` |
| 48,983 | Sweeter 에서는 '말씀 쪽' 충돌만 보여 준다 (v26-0921-8, HB 4-5) | `_cfMine`, `_cfDevOnly`, `_cfOpen`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 49,095 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfNiceLabel`, `_cfGroupName`, `_cfChoiceLabel`, `_cfCutRaw`, `_cfIsStamp`, `_cfStampNice`, `_cfExplain`, `cfToggleRaw`, `_cfBaseLine`, `_cfCardHTML`, `auto` … 외 10개 |
| 49,381 | 올리기 실패 진단 (v26-1025-3) | – |
| 49,384 | 클라우드 문서 포장 (v26-1025-5) | `_fbUnz`, `u8`, `_fbDocJson`, `_fbZ`, `_fbZField`, `_fbDocBytes`, `_fbBytes`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync`, `_fbForceWrite` |
| 49,528 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `_fbSizeRows`, `_fbSizeBlock`, `_inboxDiagBlock`, `L`, `items`, `_fbDiagBlock`, `pend`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 49,765 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `_abLocalState`, `_abRankLabel`, `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn`, `_swBoardOn` |
| 50,194 | 2차 (v26-0922-2, HB) | – |
| 50,205 | 3차 (v26-0922-3, HB) — 시트의 '상황 태그'·'묵상 질문' 에서 나온다 | – |
| 50,213 | 비었을 때의 안내는 **보는 사람에 따라 달라야 한다** (v26-0923-2) | `_swWin`, `roll`, `_swInWin`, `_swPool`, `_swRecIn`, `_swEmptyText`, `who` |
| 50,303 | 담아두기 | `getKeepLog` |
| 50,316 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 50,386 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 50,581 | 저장 | `_swTilesRaw`, `_swVerRaw`, `_swLoadTiles`, `_swSaveTiles`, `_swSpareKinds` |
| 50,633 | BLOCK7 에서 내 말씀 가져오기 | `_swCountVerses`, `_swBlock7Src`, `_swImportApply`, `swImportFromBlock7`, `_swSyncNotice` |
| 50,730 | 말씀 모음 타일 | `_swColls`, `a` |
| 50,754 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermonPool`, `_swSermons`, `_swSermonVerses`, `_swBooks`, `_swTags`, `_swEvenOn`, `_swReacts` |
| 50,880 | 까닭 한 줄 (v26-0922-1, HB 2번 선택) | `_swAgo`, `_swLastTouch`, `add`, `_swWhyOf`, `key` |
| 50,939 | 오늘의 말씀 (표지 카드) | `_swToday`, `_swAxisKeys`, `_swCount`, `_swFlow`, `_swMyWeight`, `_swMD` |
| 51,035 | 기간 안의 흐름 (v26-1005-5, HB) | `_swSvcKey`, `_swInsightsWin`, `push`, `_swInsights`, `push`, `_swVersesForInsight`, `_swRhythmGrid`, `_swRhythm`, `_swSigRhythm` |
| 51,261 | 상황 태그를 **말투로** 바꾼다 (v26-0922-4 → -5 에서 전면 손질, HB) | `_swNeedSkip`, `_swNeedSay`, `bat`, `_swNeeds`, `_swAsks`, `_swValues`, `_swStrip`, `_swCountText` |
| 51,647 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swHandFont`, `day`, `_swHiText`, `_swHiHTML`, `_swLoadPhotos`, `_swPhotoPick`, `_swPhotoFor`, `_swPhotoHTML`, `_swIllHTML`, `_swBigHTML`, `_swSigWrap` … 외 6개 |
| 51,945 | 유튜브 썸네일 (v26-0922-10, HB: "타일 위아래가 비어서 안 이뻐") | `_swYtThumbFail`, `_swCellHTML` |
| 52,069 | 타일마다 바탕 사진 켜고 끄기 (v26-0922-13, HB) | `_swPhIcon`, `_swPhOn`, `_swEditBtns`, `_swTogglePhoto`, `_swArrowHTML`, `_swThereHTML`, `_swFace`, `chip`, `_swOffTileEl` |
| 52,184 | 그리기 | `_swTileClass` |
| 52,189 | 첫 그림에 쓸 말씀을 미리 뽑아 둔다 (v26-0922-21, HB) | `_swSaveBootVerses`, `_swIntroSpan`, `_swRender` |
| 52,285 | 편집 모드 | `_swEditOn`, `_swEditBtnSync`, `mine`, `board`, `swOpenCollFilter`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `w`, `_swNoMotion`, `_swTrack`, `_swTrackTo` |
| 52,394 | 한 칸 넘기기 (PC 꺽쇠·자판이 쓴다) | `_swStep`, `_swRepaint` |
| 52,421 | 누르면 전체화면 | `_swOpenVerse`, `_swGridTile`, `facet`, `_swVersesFor`, `_swTileOpen`, `md`, `label` |
| 52,536 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 52,568 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swDragHover` |
| 52,618 | 판 끝에 닿으면 저절로 굴러간다 (v26-0922-15, HB) | `_swAutoScroll`, `_swAutoStop`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap`, `_swKbTiles`, `_swKbSync`, `_swKbSet`, `_swKbStep`, `_swKbGo`, `_swKbGoX`, `_swKbPage`, `_swKbSort` … 외 5개 |
| 53,153 | 자판 단축키 도움말 | `_swKbHelpOpen`, `_kbHelpRows`, `sw`, `_swKbHelpFill`, `_kbHelpKey`, `openSwKbHelp`, `closeSwKbHelp` |
| 53,291 | 형제 앱 열기 (v26-0921-2, HB) | `_sisterApp`, `dev`, `cross`, `_sisterFill`, `swCrossToggle`, `_swCrossBtnSync`, `_sisterStandalone`, `_sisterIsIOS`, `sisterGo`, `_swBoot` |
| 53,399 | Sweeter 설정창 '계정' 탭 (v26-0921-8, HB 4-5) | `_swMergeAccountTab` |
| 53,423 | Sweeter 설정창 '뷰' 탭 병합 (v26-0921-8, HB 4-4) | `_swFillMovedRows`, `_swMergeViewTab`, `_swCoverOn`, `_swMount` |
| 53,501 | 좌상단 로고 — BLOCK7 과 **같은 손버릇**이다 (v26-0921-1, HB) | – |
| 53,511 | 우상단 톱니 — 탭 = 설정 · 롱터치 = 설정 '계정' 탭 바로 (v26-1024-17, HB) | – |
| 53,522 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `TDASH`, `add`, `dur` |
| 53,599 | 모으기: 두 기록 → 한 모양 [{date,t,time,d,app,src,label}] | `collect`, `mapPrayers`, `focusPrayers`, `mapTop`, `dayTotals`, `inRange`, `sumBy`, `slotOf`, `srcName` |
| 53,692 | 그리기 | `injectCSS`, `legend`, `bigNum`, `cmpLine`, `topRefs`, `bySrc`, `bySlot`, `viewWeek`, `heat`, `viewMonth`, `viewDay`, `nav`, `html` |
| 53,945 | 판 하나를 el 안에 연다 | `mount` |
| 53,981 | 부드러운 전환 (HB 2026-10-15) — 바꿀 때는 늘 옆으로 스르륵: 나가고 → 그리고 → 들어온다. 밀기는 손가락을 따라간다 | `pageTint`, `open`, `close`, `isOpen` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_abLocalState`  `_abRankLabel`  `_activeVersesFrom`  `_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`
`_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`  `_applySermonListSheet`  `_applySneakMaxW`  `_applyUrgentSpotlight`
`_attachRepeatButtons`  `_attachSecPickLongPress`  `_attachSubMemoBadges`  `_attachTextPinch`  `_attachVliMenus`  `_attachWeeklyPaneDrag`
`_autoContactMark`  `_avgHex`  `_b7BoardKey`  `_b7KbReady`  `_b7TaskKey`  `_backupDownload`
`_backupPayload`  `_bakDevice`  `_bibleChapters`  `_bibleRankOfRef`  `_bibleShort`  `_bookAbbr`
`_bookCanon`  `_bookNorm`  `_bookOfRef`  `_bookSel`  `_booksOf`  `_brActiveWin`
`_brApplyLook`  `_brBind`  `_brBook`  `_brBooks`  `_brBusy`  `_brCharAt`
`_brCharAtGeo`  `_brCharRect`  `_brChrome`  `_brChromeApply`  `_brChromeFreeze`  `_brChVerses`
`_brCloseSheets`  `_brCopy`  `_brCopyFallback`  `_brCopyText`  `_brCover`  `_brCovered`
`_brDashRender`  `_brDashRows`  `_brDashStart`  `_brDashStats`  `_brDate`  `_brDev`
`_brDiagStore`  `_brDiagStuck`  `_brDiagSync`  `_brDiagText`  `_brEl`  `_brEsc`
`_brFetchJSON`  `_brFindWords`  `_brFmtMin`  `_brFmtRef`  `_brGet`  `_brHistHide`
`_brHistory`  `_brInkAdd`  `_brInkBlob`  `_brInkCut`  `_brInkDo`  `_brInkDot`
`_brInkErase`  `_brInkHeart`  `_brInkHitAt`  `_brInkHits`  `_brInkHl`  `_brInkIcon`
`_brInkId`  `_brInkInside`  `_brInkOpen`  `_brInkOrigin`  `_brInkPaint`  `_brInkPref`
`_brInkPrefSet`  `_brInkQuery`  `_brInkRefresh`  `_brInkRot`  `_brInkSpans`  `_brInkSpansFrom`
`_brInkStepPos`  `_brInkStroke`  `_brInkSym`  `_brInkSymParts`  `_brInkSync`  `_brInkTx`
`_brInkUl`  `_brIsOpen`  `_brKey`  `_brListDelete`  `_brLoadSerif`  `_brLoupe`
`_brLzGet`  `_brLzPaint`  `_brMatch`  `_brMigrateNotes`  `_brNoteHTML`  `_brNoteInline`
`_brNotesAt`  `_brNoteSave`  `_brOnScroll`  `_brOpenAct`  `_brOpenDash`  `_brOpenMemo`
`_brOpenSheet`  `_brOrigAdd`  `_brOrigHitAt`  `_brOrigLines`  `_brOrigListHTML`  `_brOrigNote`
`_brOrigOpen`  `_brOrigSend`  `_brOrigWords`  `_brParseRef`  `_brPosGet`  `_brPosSave`
`_brPosSet`  `_brProgSync`  `_brRangeOf`  `_brReadAdd`  `_brReadMs`  `_brRecent`
`_brRenderList`  `_brRenderPick`  `_brRerender`  `_brRow`  `_brRowGone`  `_brRunFind`
`_brS`  `_brSeenOf`  `_brSessEnd`  `_brSessStart`  `_brSessStep`  `_brSet`
`_brSetMark`  `_brShow`  `_brSpanLines`  `_brStep`  `_brSwipeBind`  `_brSyncAa`
`_brSyncScope`  `_brToast`  `_brTRHas`  `_brTRKey`  `_brTRList`  `_brTRRender`
`_brTRSetOrder`  `_brTRToggle`  `_brTxIdx`  `_brTxNode`  `_brTxOf`  `_brUnit`
`_brUnpark`  `_brUrl`  `_brVerseList`  `_brVerseObj`  `_brViewRef`  `_brViewVs`
`_brVmClose`  `_brVmOpen`  `_brVmRun`  `_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`
`_buildShareText`  `_bump`  `_bumpVerseStat`  `_calKey`  `_cardActionCount`  `_cardGrain`
`_cardTextLS`  `_carryDateInScope`  `_carryPendingCount`  `_carryScope`  `_carryTaskExtras`  `_ceFillSelects`
`_cellDefaultSec`  `_ceMakeRow`  `_ceSortedIdx`  `_ceToggleTrashSel`  `_ceUpdateDeleteBtn`  `_ceUpdateRestoreBtn`
`_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfApply`  `_cfBaseLine`  `_cfCanMerge`  `_cfCardHTML`
`_cfChoiceLabel`  `_cfClearSel`  `_cfCutRaw`  `_cfDetect`  `_cfDevOnly`  `_cfDiffer`
`_cfEsc`  `_cfExplain`  `_cfFetchCloud`  `_cfGroupName`  `_cfHasSel`  `_cfId`
`_cfIsStamp`  `_cfJ`  `_cfKindLabel`  `_cfLoadLocal`  `_cfMake`  `_cfMine`
`_cfNiceLabel`  `_cfOpen`  `_cfOpenCount`  `_cfPushCloud`  `_cfSaveLocal`  `_cfScanById`
`_cfScanKeys`  `_cfScanSection`  `_cfSecLabel`  `_cfSelKey`  `_cfShrink`  `_cfSortKey`
`_cfStampNice`  `_cfStore`  `_cfSyncVisibility`  `_cfText`  `_cfTrimmed`  `_cfUnion`
`_cfWhoLabel`  `_chk`  `_clearPendingVerse`  `_clearUrgentOnDone`  `_closeHdrCalendarNow`  `_colKey`
`_collFilteredVerses`  `_collHue`  `_collIsProp`  `_collLabel`  `_collPeriodPass`  `_collPeriodVerses`
`_collRawVerses`  `_collVersePassesFilter`  `_collVersePassesOnly`  `_collVerseShows`  `_contactTaskSvg`  `_copyTextFallback`
`_crossSwipeAllowed`  `_currentColl`  `_currentSecId`  `_dataURLtoBlob`  `_datePickArmed`  `_dayHasContent`
`_dayKeyAfter`  `_dayKeyBefore`  `_dayKeyDiff`  `_dayLabel`  `_daySecTasks`  `_dayTaskCount`
`_dayTaskSecs`  `_desat`  `_devAttachSwipe`  `_devCompressFile`  `_devFilesHTML`  `_deviceBaseW`
`_deviceId`  `_deviceLabel`  `_devInboxButton`  `_devMarkRead`  `_devMigrateRead`  `_devNotifOn`
`_devNotifSet`  `_devReadIds`  `_devReadLocal`  `_devShortSide`  `_devTrashGet`  `_devTrashSet`
`_devWhen`  `_devWhenTxt`  `_dfAgo`  `_dfArr`  `_dfBrief`  `_dfColl1`
`_dfColls`  `_dfContact1`  `_dfContacts`  `_dfCut`  `_dfDay`  `_dfDays`
`_dfDeep`  `_dfDeepLines`  `_dfDiff`  `_dfFieldLabel`  `_dfJ`  `_dfJosa`
`_dfKindName`  `_dfLogRefs`  `_dfLogs`  `_dfPush`  `_dfQ`  `_dfRo`
`_dfSame`  `_dfScale`  `_dfScaleText`  `_dfSeg`  `_dfSegPath`  `_dfSetLabel`
`_dfSettings`  `_dfTaskKey`  `_dfToday`  `_dfVal`  `_dfValS`  `_dfVKey`
`_dfWhen`  `_dfWord`  `_dismissReactToast`  `_dismissToast`  `_dlog`  `_dlogScroll`
`_dNavEl`  `_doCarry`  `_doToggleFlag`  `_doToggleUrgent`  `_dragZoneMid`  `_dropStalePending`
`_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`  `_dsStrip`  `_dsWrite`
`_dupDoneReset`  `_dupDoneSync`  `_dupDoneToggle`  `_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`
`_ensureUrgentSpotlightObserver`  `_entrySecId`  `_escHtml`  `_escShown`  `_euroRo`  `_evChipCut`
`_evChipLabel`  `_evChipN`  `_evChipPreview`  `_evChipSync`  `_evDeleteApply`  `_evEditApply`
`_evenDeeperShortRef`  `_evenOn`  `_evFillMins`  `_evInheritCal`  `_evInSeries`  `_evMarkDropSec`
`_evMoveToSec`  `_evOverrideDays`  `_evRepRootOf`  `_evSecAt`  `_evSyncRange`  `_fallbackCopy`
`_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`  `_fbBulkLoss`  `_fbBytes`  `_fbClearBase`
`_fbCollectConflicts`  `_fbCommit`  `_fbCountArrays`  `_fbCountByKind`  `_fbCountItems`  `_fbDeviceIdle`
`_fbDiagBlock`  `_fbDocBytes`  `_fbDocJson`  `_fbEnsureSync`  `_fbForceWrite`  `_fbHasAdoptedCloud`
`_fbHealFromLegacy`  `_fbIsUserEdit`  `_fbLoadPersistedBase`  `_fbMaybeSelfUpdate`  `_fbMerge`  `_fbMergeGuarded`
`_fbNoteConflicts`  `_fbReady`  `_fbScheduleRetry`  `_fbSetBase`  `_fbSizeBlock`  `_fbSizeRows`
`_fbSyncReady`  `_fbUnz`  `_fbVerIsOlder`  `_fbWarnLegacyWriter`  `_fbWriteBackup`  `_fbZ`
`_fbZField`  `_fetchSheetCsv`  `_fetchVerseStat`  `_fillMinOptions`  `_fillTaskMenuCounts`  `_fillVerseBarDOM`
`_findVerseByRefLoose`  `_finishEditKeepRow`  `_finishOriginal`  `_flashPendingTask`  `_flashSettingsTab`  `_flatMemEntries`
`_flatSimpleEntries`  `_fmtRefForText`  `_fmtSubDate`  `_focusNewTaskInput`  `_freshTaskCopy`  `_fxGlow`
`_fxRipple`  `_gcalAfterConnect`  `_gcalApi`  `_gcalApplyLocal`  `_gcalBoot`  `_gcalCfg`
`_gcalDefSec`  `_gcalDsh`  `_gcalEvColor`  `_gcalFetchCal`  `_gcalFetchInst`  `_gcalFind`
`_gcalFn`  `_gcalGone`  `_gcalKick`  `_gcalLanes`  `_gcalListCals`  `_gcalMD`
`_gcalMonthLanes`  `_gcalOnSave`  `_gcalPickApply`  `_gcalPickApplyV`  `_gcalPickRender`  `_gcalProbe`
`_gcalRenderSettings`  `_gcalRenderStatus`  `_gcalRepNew`  `_gcalRepOn`  `_gcalRunRemote`  `_gcalSeen`
`_gcalSegHTML`  `_gcalSetCfg`  `_gcalSpanN`  `_gcalSpanTag`  `_gcalTintChip`  `_gcalToken`
`_gcalTomb`  `_gcalTz`  `_gcalUsable`  `_gcalUser`  `_gcalWinQ`  `_genCollId`
`_generateUniqueShareCode`  `_getCollFilter`  `_ghostDragStart`  `_gnbExtrasSync`  `_gnbPickerOn`  `_gnbPickerStep`
`_gnbRpMenu`  `_groupVersesBy`  `_groupVersesByMulti`  `_grpAddrPreview`  `_grpAddrShow`  `_grpAddrUrl`
`_grpFetch`  `_grpNameNorm`  `_grpNameValid`  `_grpRenderColls`  `_grpShowAddr`  `_grpSync`
`_gSrcId`  `_hdrCalRender`  `_hexNum`  `_hiAssign`  `_hiBold`  `_hiFw`
`_hiHash`  `_hiHTML`  `_hiKindsOn`  `_hiLinesHTML`  `_hiOn`  `_hiOverlap`
`_hiOverlay`  `_hiPen`  `_hiPhrases`  `_hiPickAt`  `_hiRanges`  `_hiRefreshAll`
`_hiRibbon`  `_hiRng`  `_hiShuffle`  `_hiSmooth`  `_hiSquash`  `_hiStar`
`_hiStarMax`  `_hiStarPoly`  `_hiWave`  `_hiWavePoly`  `_hiWob`  `_idbDel`
`_idbDelOutcome`  `_idbDelRaw`  `_idbForget`  `_idbGet`  `_idbGetOutcome`  `_idbGetRaw`
`_idbOpen`  `_idbRaw`  `_idbSet`  `_idbSetOutcome`  `_idbSetRaw`  `_importVerseRows`
`_inboxDiagBlock`  `_initEdgeBack`  `_initHdrDateLongPress`  `_initSettingsSwipe`  `_initSneakMaxWPicker`  `_initVDashDetailSwipe`
`_initVerseAlarmPicker`  `_initVerseBandDrag`  `_initVerseBarResize`  `_initVerseBarSwipe`  `_initVerseFullGestures`  `_initVerseGridGestures`
`_initVerseNotifBridge`  `_initVerseSettingsSwipe`  `_initVfCatSheet`  `_invalidateVerseCaches`  `_isDevAccount`  `_isPhoneForm`
`_isPropSheet`  `_isReactPid`  `_isRepRoot`  `_isSermonListSheet`  `_isTouchDevice`  `_joinApply`
`_joinClear`  `_joinFromPath`  `_joinRead`  `_kbAnchor`  `_kbDelete`  `_kbHelpKey`
`_kbHelpRows`  `_kbOneSel`  `_kbOverlayOpen`  `_kbReactivate`  `_kbSecId`  `_kbSelItems`
`_kbToggleDone`  `_kbWEls`  `_kbWEnter`  `_kbWGo`  `_kbWHint`  `_kbWName`
`_kbWOn`  `_kbWPage`  `_kbWSet`  `_kbWStep`  `_kbWSync`  `_keepAfterChange`
`_keepAttr`  `_keepBindDrag`  `_keepDeleteList`  `_keepEntries`  `_keepFlipRender`  `_keepListOf`
`_keepLists`  `_keepListsOf`  `_keepNameCommit`  `_keepNameKey`  `_keepOrder`  `_keepPairSort`
`_keepRenameList`  `_keepRepaintLists`  `_keepSetOrder`  `_keepSort`  `_keepSortLists`  `_keepSortRowHTML`
`_keepSwitchIsOpen`  `_lay`  `_layApplyWidths`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`
`_layMode`  `_loadSheetJs`  `_localOwner`  `_logoMenuEsc`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`
`_logoMenuSubScheduleClose`  `_longEditOpen`  `_looksLikeRef`  `_lord`  `_lsDropBase`  `_lsk`
`_lsPutST`  `_lsStKey`  `_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`
`_makeSubGhost`  `_makeSubRow`  `_makeTimeRollPair`  `_makeUrgentBadgeHTML`  `_makeWMViewBtnsHTML`  `_memoBadgeFill`
`_memoCopyText`  `_memoDateKey`  `_memoItem`  `_memoMoveTaskToDate`  `_memoRender`  `_memoSaveEdit`
`_memoSaveToPhone`  `_memoScan`  `_memoTelDigits`  `_memoViewHTML`  `_menuArmOnNextPress`  `_menuFitHeight`
`_menuLockScroll`  `_mFitCells`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`
`_mgEnforceUrgentCap`  `_mgEntryArray`  `_mgFillSide`  `_mgIsFill`  `_mgLogFlat`  `_mgLogNested`
`_mGridApplyH`  `_mGridH`  `_mGridSetH`  `_mgSetting`  `_mgTaskArray`  `_mgTaskOne`
`_mgWhole`  `_migrateTaskRepeats`  `_moveDateToastMsg`  `_movedTaskCopy`  `_moveLabel`  `_mviewEventCountsHTML`
`_mviewRowHTML`  `_myProductSettings`  `_newRid`  `_newTask`  `_noiseTile`  `_notifAckToSW`
`_notifAnnounceReady`  `_notifAuthBlocking`  `_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`
`_notifLog`  `_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifMark`  `_notifNewId`
`_notifPid`  `_notifSameRef`  `_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`
`_notifStop`  `_notifTakeIntent`  `_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`
`_openCellEvent`  `_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openPropDeeper`  `_openVerseByRef`
`_openVerseFromLink`  `_outcomeText`  `_ovfClear`  `_ovfMode`  `_ovfQueue`  `_ovfRun`
`_parseCsv`  `_parseVDate`  `_pick`  `_playDoneFx`  `_plusAdd`  `_plusAfterChange`
`_plusGroups`  `_plusHas`  `_plusHiddenKeys`  `_plusKeyOf`  `_plusPrune`  `_plusTidy`
`_plusVerses`  `_plusVisibleMask`  `_populateMorningTimePickers`  `_prayDb`  `_prayLoadGroups`  `_prayOpenGroups`
`_prayOpenKids`  `_prayPanel`  `_prayPickClose`  `_prayPickHover`  `_prayPickTap`  `_prayPlace`
`_praySend`  `_prayTodoPlace`  `_prayTodoPull`  `_prayTodoWatch`  `_prayTree`  `_prayUid`
`_propBooks`  `_propHiList`  `_propHiPick`  `_propImg`  `_propRefs`  `_propRowsToItems`
`_propSits`  `_propYt`  `_psIsDefault`  `_psOverlay`  `_psProject`  `_PT_FAMS`
`_ptAvailW`  `_ptBag`  `_ptCutPoint`  `_ptCutTitle`  `_ptDrawnLines`  `_ptEnsureFont`
`_ptFont`  `_ptFontFor`  `_ptFontLoaded`  `_ptFontPending`  `_ptFontsOn`  `_ptGlued`
`_ptGroupInit`  `_ptLen`  `_ptLineK`  `_ptLinkGoogle`  `_ptMissing`  `_ptMotionOn`
`_ptPaint`  `_ptPickMotion`  `_ptPreloadVerse`  `_ptRelines`  `_ptSample`  `_ptSplitOnce`
`_ptStillTrying`  `_ptSyncFontUI`  `_ptSyncMotionUI`  `_ptWarmup`  `_ptWrapTitle`  `_publishSharedColl`
`_pushKey`  `_pushKeyPid`  `_pushReplan`  `_pushTagProduct`  `_reactKey`  `_reactKeyParts`
`_reactWithToast`  `_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`  `_refKey`
`_refNorm`  `_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`  `_renderKeepPicker`  `_renderKeepSubMenu`
`_renderKeepSwitch`  `_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`  `_renderPickerInto`  `_renderSecPick`
`_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`  `_renderVAggBody`  `_renderVerseUiLevelIcons`
`_renderVfSecAssign`  `_renderVfThemeChips`  `_reorderTaskPriority`  `_rep2`  `_repAddEx`  `_repBadgeFill`
`_repBlocked`  `_repEx`  `_repHiddenOn`  `_repKeepMarks`  `_repKindOf`  `_repPurgeEvents`
`_repPurgeTasks`  `_repRule`  `_repScopeAsk`  `_repScopePick`  `_repUntil`  `_revealSec`
`_rewriteLogRefs`  `_rgba`  `_ridPresentOn`  `_rollFit`  `_rollHTML`  `_rollIdx`
`_rollNoTr`  `_rollSecLabel`  `_rollShow`  `_rollStart`  `_rollTick`  `_rowsToItems`
`_rpAddBtnHTML`  `_rpAttachChipDrag`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`  `_rpAttachVResize`  `_rpChipName`
`_rpCurrentRatio`  `_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`  `_rpMonthOf`  `_rpNormMonth`
`_rpSetMGridH`  `_rpSetVCardH`  `_rpSetVListH`  `_rpTypeOk`  `_rpVCardH`  `_rpVListH`
`_rpWidgetHTML`  `_rpWidgetName`  `_secArchiveApply`  `_secArchiveCapture`  `_secBoundaryChoices`  `_secClosed`
`_secDataCount`  `_secFirstBoundary`  `_secIdForTime`  `_secIdNowAll`  `_secIsCustom`  `_secLenMin`
`_secMoveTo`  `_secNormalizeTimes`  `_secNoTime`  `_secOffsets`  `_secPickBack`  `_secPickCancelClose`
`_secPickChoose`  `_secPickFloat`  `_secPickOn`  `_secPickOpen`  `_secPickOpenFromRow`  `_secPickRender`
`_secPickScheduleClose`  `_secPickSecs`  `_secPickSpecFor`  `_secsCommit`  `_secStripData`  `_secTimeChoices`
`_secWouldEmptyDay`  `_sermonCatNorm`  `_sermonListMap`  `_sermonNoVideo`  `_sermonSkipNoVideo`  `_sermonYtFor`
`_setLocalOwner`  `_setTabMemGet`  `_setTabMemKey`  `_setTabMemPut`  `_sgDevClass`  `_sgEdges`
`_sgFoldDefaultOpen`  `_sgFoldInit`  `_sgFoldMem`  `_sgFoldMemPut`  `_sgFoldSum`  `_sgFoldSumAll`
`_sgTitle`  `_shareCopy`  `_sharedVerseIn`  `_sharedVerseOut`  `_shareFileName`  `_shareMessage`
`_shareResetBigText`  `_shareSizeKey`  `_sheetCopyPending`  `_sheetCopyThenGo`  `_sheetCsvEndpoints`  `_sheetDrag`
`_sheetDragBindSettings`  `_sheetEditCall`  `_sheetEditErrText`  `_sheetEditProbe`  `_sheetEditUrlNorm`  `_sheetGo`
`_sheetGoMain`  `_sheetIsPc`  `_sheetMainBuild`  `_sheetMainLoad`  `_sheetMainReady`  `_sheetMainTtl`
`_sheetMainWarm`  `_sheetOpenPropMain`  `_sheetRowsSane`  `_sheetUrlForVerse`  `_shotDraw`  `_shotFont`
`_siriDate`  `_siriDayLabel`  `_siriMakeKeyNow`  `_siriParse`  `_siriPlace`  `_siriRenderSettings`
`_siriSaved`  `_siriSecAt`  `_siriT2m`  `_siriYmd`  `_sisterApp`  `_sisterFill`
`_sisterIsIOS`  `_sisterStandalone`  `_sneakMaxW`  `_sneakMaxWDefault`  `_sortEventsKeepingTimeless`  `_sortGroups`
`_stabList`  `_statDocKey`  `_statRefKey`  `_subAdd`  `_subFocusGhost`  `_subGaugeFill`
`_subGaugeSVG`  `_subGhostId`  `_subIsOpen`  `_subKey`  `_subMoveFromMenu`  `_subParse`
`_subPromoteFromMenu`  `_subPrune`  `_subRemove`  `_subRemoveFromMenu`  `_subRerender`  `_subsCopy`
`_subscribeShared`  `_subSetAll`  `_subsOf`  `_subStat`  `_subSyncParent`  `_subToggleBadgeFill`
`_subToggleOpen`  `_swAddTile`  `_swAgo`  `_swArrowHTML`  `_swArtHTML`  `_swAsks`
`_swAutoScroll`  `_swAutoStop`  `_swAxisKeys`  `_swBigHTML`  `_swBlock7Src`  `_swBoardKey`
`_swBoardOn`  `_swBooks`  `_swBoot`  `_swBootOff`  `_swCellHTML`  `_swColls`
`_swCount`  `_swCountText`  `_swCountVerses`  `_swCoverOn`  `_swCrossBtnSync`  `_swDragHole`
`_swDragHoleOff`  `_swDragHover`  `_swDragMove`  `_swDragStart`  `_swEditBtns`  `_swEditBtnSync`
`_swEditOn`  `_swEmptyText`  `_swEsc`  `_swEvenOn`  `_swFace`  `_swFillMovedRows`
`_swFinishSwipe`  `_swFlow`  `_swGridTile`  `_swHandFont`  `_swHiHTML`  `_swHiText`
`_swIllHTML`  `_swImportApply`  `_swInitGestures`  `_swInsights`  `_swInsightsWin`  `_swIntroSpan`
`_swInWin`  `_swIsKept`  `_swKbGo`  `_swKbGoX`  `_swKbHelpFill`  `_swKbHelpOpen`
`_swKbHint`  `_swKbKeep`  `_swKbMove`  `_swKbPage`  `_swKbReady`  `_swKbSet`
`_swKbSort`  `_swKbStep`  `_swKbSync`  `_swKbTiles`  `_swKeeps`  `_swKillTile`
`_swLastTouch`  `_swLastVerses`  `_swLoadPhotos`  `_swLoadTiles`  `_swMD`  `_swMergeAccountTab`
`_swMergeViewTab`  `_swMount`  `_swMyWeight`  `_swNeeds`  `_swNeedSay`  `_swNeedSkip`
`_swNoMotion`  `_swOffTileEl`  `_swOn`  `_swOpenVerse`  `_swPhIcon`  `_swPhOn`
`_swPhotoFor`  `_swPhotoHTML`  `_swPhotoPick`  `_swPipsHTML`  `_swPool`  `_swReacts`
`_swRecIn`  `_swRender`  `_swReorder`  `_swRepaint`  `_swRepaintKeepTiles`  `_swRhythm`
`_swRhythmGrid`  `_swSaveBootVerses`  `_swSaveTiles`  `_swSermonPool`  `_swSermons`  `_swSermonVerses`
`_swSigBook`  `_swSigColl`  `_swSigHTML`  `_swSigReact`  `_swSigRhythm`  `_swSigSermon`
`_swSigTag`  `_swSigWrap`  `_swSizeCells`  `_swSnap`  `_swSpareKinds`  `_swStep`
`_swStrip`  `_swSvcKey`  `_swSyncNotice`  `_swTags`  `_swThereHTML`  `_swTileClass`
`_swTileOpen`  `_swTilesRaw`  `_swToday`  `_swTogglePhoto`  `_swTrack`  `_swTrackTo`
`_swValues`  `_swVerRaw`  `_swVersesFor`  `_swVersesForInsight`  `_swWhyOf`  `_swWin`
`_swYtThumbFail`  `_syncBpPickers`  `_syncCarryScopeBtns`  `_syncCatWeight`  `_syncCollSheets`  `_syncCondRows`
`_syncDeeperOpenUI`  `_syncDeviceNotifyUI`  `_syncDevInboxVisibility`  `_syncDevVerBadge`  `_syncEventDateUI`  `_syncEvenVisibility`
`_syncGoBtn`  `_syncGroupWeight`  `_syncHdrDateOptical`  `_syncHiOverlapRow`  `_syncHiUI`  `_syncIncludeInit`
`_syncIncludeRender`  `_syncLayFormUI`  `_syncLinkOpenModeUI`  `_syncNoVideoHTML`  `_syncShareSettingsUI`  `_syncShareSizeUI`
`_syncSheetVersesIntoColl`  `_syncTaskOvfBtns`  `_syncTimeStepBtns`  `_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVerseFp`
`_syncVerseNextBtns`  `_syncVersePushPool`  `_syncVersePushUI`  `_syncVfTextScaleUI`  `_syncVpTimeField`  `_syncVpTimeList`
`_t2m`  `_tagartAliasMap`  `_tagartDrawOn`  `_tagartHay`  `_tagartHit`  `_tagartOn`
`_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`  `_taskArrOf`  `_taskDeleteApply`
`_taskDeleteAt`  `_taskFlipRender`  `_taskPriorityRank`  `_taskRepDefault`  `_taskRepFallback`  `_taskRepInstances`
`_taskRepRootOf`  `_taskRepRoots`  `_taskRepWeekly`  `_taskSetRepeat`  `_taskTextApply`  `_taskTextCommit`
`_tdBindAll`  `_tdBindLong`  `_tdLoadPray`  `_tdOpts`  `_TF_NOISE`  `_tfApplyTheme`
`_tfBreathAt`  `_tfBuildSprites`  `_tfCandleAt`  `_tfDevKind`  `_tfDrawCross`  `_tfFlickerAt`
`_tfFlickerParams`  `_tfFrame`  `_tfGet`  `_tfHex2Hsl`  `_tfHsl2Rgb`  `_tfLoad`
`_tfNoise`  `_tfPick`  `_tfQuiet`  `_tfSize`  `_tfSpawn`  `_tfSprites`
`_tfStore`  `_tfSyncUI`  `_tfW`  `_tfWire`  `_tfWordApply`  `_tfWordChanged`
`_tfWordFit`  `_tfWordGo`  `_tfWordMulti`  `_tfWordRect`  `_tfWordRender`  `_tfWordSet`
`_tfWordSyncUI`  `_tfWordToggle`  `_tfWordWire`  `_thAcPush`  `_thAcText`  `_thContrast`
`_thDeltaE`  `_themePreviewHTML`  `_themeSummaryText`  `_themeTokens`  `_thereBegin`  `_thereClock`
`_thereCommit`  `_thereCountFor`  `_thereDurWords`  `_thereEach`  `_thereIcHTML`  `_thereIconKey`
`_thereIconSync`  `_thereIsOpen`  `_thereRecorded`  `_thereStripHanja`  `_thereTotalSec`  `_thereWordFromBible`
`_thereWordFromVerse`  `_thFade`  `_thHex`  `_thLab`  `_thLabF`  `_thLabFi`
`_thLabRgb`  `_thLin`  `_thLum`  `_thMix`  `_thOn`  `_thPanelMix`
`_thReadable`  `_thRgb`  `_thRgba`  `_thRound`  `_thTintDE`  `_thTintK`
`_thUnlin`  `_thWorst`  `_timeStep`  `_tmFloatOK`  `_tmSlide`  `_tmSubCancelClose`
`_tmSubHide`  `_tmSubOpen`  `_tmSubPanel`  `_tmSubReset`  `_tmSubScheduleClose`  `_tmSubTap`
`_toastSpin`  `_toastWithJump`  `_todayDateObj`  `_todoInboxToast`  `_toThisMonth`  `_tryCloseLogoMenu`
`_tsFine`  `_tsNearest`  `_tsPinchArm`  `_tsPinchBusy`  `_tsTouchDist`  `_uiLvIconSVG`
`_uiScaleGet`  `_uiScaleSliderPaint`  `_upApply`  `_upCheck`  `_upClearTries`  `_updateCfAllCount`
`_updateDragHintBounds`  `_upReloadFresh`  `_upSafeNow`  `_upSetTries`  `_upTries`  `_urgentItemsOn`
`_vAggSyncKeepTitle`  `_vAxisIconHTML`  `_vbThereEl`  `_vcAll`  `_vcApplyNav`  `_vcAttachGestures`
`_vcAutoAnchors`  `_vcAutoChanged`  `_vcAutoMin`  `_vcAutoOffset`  `_vcAutoOn`  `_vcAutoResetAnchors`
`_vcAutoSaveAnchors`  `_vcAutoSeq`  `_vcAutoSetAnchor`  `_vcAutoSlide`  `_vcAutoSlot`  `_vcAutoStart`
`_vcAutoTick`  `_vcCardHTML`  `_vcCreate`  `_vcCurrent`  `_vcCurX`  `_vcFilterLabel`
`_vcGet`  `_vcGroupOf`  `_vcGroupOn`  `_vcHash`  `_vcHeadMode`  `_vcHiSplit`
`_vcIdOf`  `_vcIs`  `_vcKeyOf`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcListHTML`
`_vcListItems`  `_vcNewId`  `_vcPatternKey`  `_vcReactKeyOf`  `_vcRemove`  `_vcRollMode`
`_vcRollOpt`  `_vcRollSec`  `_vcScope`  `_vcScopeBtnHTML`  `_vcScopeCount`  `_vcScopeIcon`
`_vcScopeIsHome`  `_vcScopeKey`  `_vcScopeLabel`  `_vcScopeParts`  `_vcShow`  `_vcShowFor`
`_vcSlideCommit`  `_vcSlideEl`  `_vcSyncCounts`  `_vcSyncKind`  `_vcTextScale`  `_vcThemeVars`
`_vcUnplacedForKind`  `_vcVerseOf`  `_vcVerses`  `_vcView`  `_vDashAxisLabel`  `_vDashBuckets`
`_vDashCellHTML`  `_vDashCommonHTML`  `_vDashCondWords`  `_vDashDateBtn`  `_vDashDateLb`  `_vDashDetailDotsHTML`
`_vDashDetailGo`  `_vDashDetailKey`  `_vDashDetailSlide`  `_vDashEntries`  `_vDashEtcColor`  `_vDashHomeAgg`
`_vDashIsPlaceholder`  `_vDashKeyCmp`  `_vDashKeysOf`  `_vDashKindLabel`  `_vDashKindName`  `_vDashKindRowHTML`
`_vDashMarkReturn`  `_vDashMaxSlice`  `_vDashMaybeReturn`  `_vDashNextLine`  `_vDashPieDetailSVG`  `_vDashPieInsightHTML`
`_vDashPieSVG`  `_vDashPref`  `_vDashQ`  `_vDashRefLabel`  `_vDashRowHeadHTML`  `_vDashScope`
`_vDashScopeCtlHTML`  `_vDashScopeTitle`  `_vDashShowEtc`  `_vDashSlices`  `_vDashSpanWords`  `_vDashSubArmed`
`_vDashSubKind`  `_vDashSubRefSet`  `_vDashSubWords`  `_vDashTabWords`  `_vDashVerbWord`  `_vDashVerse`
`_vDashView`  `_vDashViewTabsHTML`  `_vDashWinEntries`  `_verCmp`  `_verNums`  `_verseBandHit`
`_verseBarSlideNav`  `_verseDragBegin`  `_verseDragEnd`  `_verseDragMove`  `_verseEventCount`  `_verseFullIsOpen`
`_verseFullRender`  `_verseIdentity`  `_verseIdxForSec`  `_verseModeSession`  `_verseModeSettle`  `_verseModeTextEls`
`_verseNextMode`  `_verseRefFromUrl`  `_verseResizeOpacity`  `_verseResizeThreshold`  `_verseSettingsOpen`  `_verTap`
`_vfAdvStart`  `_vfApplyAdvRule`  `_vfApplyClauseRule`  `_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfApplyPropAlign`
`_vfArtRecheck`  `_vfArtSyncUI`  `_vfAtCollection`  `_vfBg1Css`  `_vfBgCss`  `_vfBottomEl`
`_vfBreakClass`  `_vfCanBreakAt`  `_vfCatCue`  `_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`
`_vfCycleMode`  `_vfDeeperRefs`  `_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`
`_vfGeException`  `_vfHeartBurst`  `_vfHideCovers`  `_vfHideCoversNow`  `_vfHomeStash`  `_vfIsHeotdoeException`
`_vfIsParallelWord`  `_vfIsProp`  `_vfIsSubject`  `_vfKeepNav`  `_vfKeepSortHead`  `_vfLayoutIfResized`
`_vfLayoutPropText`  `_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`
`_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`  `_vfPlaceTagArt`  `_vfPrepareNext`  `_vfPropInk`
`_vfReadWrappedLines`  `_vfRedrawPropInk`  `_vfRelayoutSoon`  `_vfRenderCard`  `_vfRenderKeepSwitch`  `_vfRenderPropTitle`
`_vfRenderRef`  `_vfRenderTagArt`  `_vfRestoreCovers`  `_vfRollProp`  `_vfRollVariant`  `_vfSecIdNow`
`_vfSelectedPatterns`  `_vfSetNav`  `_vfSetTabPool`  `_vfShareImage`  `_vfShareSizeRow`  `_vfShareText`
`_vfShortOK`  `_vfShufGo`  `_vfShufPickRandom`  `_vfShufPos`  `_vfShufPush`  `_vfShufReset`
`_vfSizePropTitle`  `_vfSkipsForced`  `_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncPageBg`  `_vfSyncTopBar`
`_vfTabList`  `_vfTextScale`  `_vfTheme`  `_vfTitleTileFn`  `_vfWrapFit`  `_vgApplyFilter`
`_vgAxisItems`  `_vgAxisLabel`  `_vgBookOne`  `_vgCfg`  `_vgClamp`  `_vgDate`
`_vgDepth`  `_vgDepthCounts`  `_vgEscAttr`  `_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`
`_vgExclOn`  `_vgFamily`  `_vgFilteredPool`  `_vgFilterLabelText`  `_vgFilterNoteHTML`  `_vgFlatPresets`
`_vgGroupKey`  `_vgGroupLabel`  `_vgHighlightTile`  `_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`
`_vgOpenFromReels`  `_vgOpenFromRef`  `_vgPinchSteps`  `_vgRankOf`  `_vgRankPref`  `_vgRankRailBind`
`_vgRawPool`  `_vgReach`  `_vgRenderTabs`  `_vgRestoreHighlight`  `_vgRun`  `_vgScrollToVerse`
`_vgSeeds`  `_vgSel`  `_vgSetCols`  `_vgShortRef`  `_vgShow`  `_vgSort`
`_vgStop`  `_vgSyncExcl`  `_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTab`
`_vgTileHtml`  `_vgTilePreset`  `_vgTileStyle`  `_vIdKey`  `_vlApplySort`  `_vlClearRegIdx`
`_vlDispRef`  `_vlEntriesForScope`  `_vlExtraSortFor`  `_vlHomeEntries`  `_vliCopyBody`  `_vLinkAxis`
`_vliOpenFull`  `_vliOpenFullForWidget`  `_vlIsProp`  `_vListControlsHTML`  `_vListRange`  `_vListRefresh`
`_vListRowsHTML`  `_vliVerse`  `_vlKeepEntries`  `_vlKindEntries`  `_vlPref`  `_vlReactTotals`
`_vlRegIdx`  `_vlTab`  `_vlTabsHTML`  `_vlwKey`  `_vMapCellHTML`  `_vMapChapList`
`_vMapChapMap`  `_vMapGroups`  `_vMapInk`  `_vMapLimitSet`  `_vMapMode`  `_vMapRange`
`_vMapRanks`  `_vMapShade`  `_vMapStats`  `_vMapStep`  `_vmmSyncItems`  `_vpDiagCopyFallback`
`_vpDiagFmt`  `_vpDiagHead`  `_vpEveryLabel`  `_vpFacetCandidates`  `_vpFacetRowHTML`  `_vpFiltMulti`
`_vpFiltRefSet`  `_vpGoFull`  `_vpList`  `_vpModeChipHTML`  `_vpNextTab`  `_vpOrders`
`_vpOtherAxis`  `_vpPool`  `_vpRep`  `_vpSave`  `_vpShortRef`  `_vpTabName`
`_vpToMin`  `_vpTurnOn`  `_vRhyBands`  `_vRhyKind`  `_vRhyThereSplit`  `_vsetFlashTab`
`_vsetGoColl`  `_vsetGoTab`  `_vsetRestoreBack`  `_vsetStartTab`  `_vsetTitleSync`  `_vstabList`
`_vTrBindBand`  `_vTrBindRails`  `_vTrBucketLabel`  `_vTrBucketList`  `_vTrBucketOf`  `_vTrBucketRange`
`_vTrChapCmp`  `_vTrChapNo`  `_vTrChapterKeys`  `_vTrChartSVG`  `_vTrChipsHTML`  `_vTrData`
`_vTrDiffHTML`  `_vTrEntries`  `_vTrExclLabel`  `_vTrFindings`  `_vTrFindingsHTML`  `_vTrGeo`
`_vTrHFromX`  `_vTrInsightHTML`  `_vTrInsMax`  `_vTrInsN`  `_vTrJosaEun`  `_vTrJosaGa`
`_vTrJosaRo`  `_vTrJosaYeyo`  `_vTrNameCmp`  `_vTrNowBucket`  `_vTrNowN`  `_vTrOtherSpan`
`_vTrPref`  `_vTrRail2Bind`  `_vTrRail2HTML`  `_vTrRailBind`  `_vTrRailHTML`  `_vTrRowHTML`
`_vTrRowsOf`  `_vTrScopeKeys`  `_vTrSort`  `_vTrSortRows`  `_vTrSpan`  `_vTrSpanMode`
`_vTrSpanRowHTML`  `_vTrTheadHTML`  `_vTrUnitWord`  `_vWeeksSince`  `_vwKeepSortHTML`  `_vwScopeBindHold`
`_vwScopeOpts`  `_vwSize`  `_wireContactTaskBadge`  `_wireSecPickRows`  `_wireSubHandle`  `_wireTaskMenuDateRow`
`_wireTmSub`  `_withFullscreenLayout`  `_withOutcome`  `_withSecRo`  `_withTimeout`  `_wkPaneActive`
`_wkVerseMarksHTML`  `A`  `a`  `ab`  `act`  `activateItem`
`ACTIVE_TOTAL`  `ACTIVE_VERSES`  `ACTIVE_VERSES_ALL`  `add`  `addCustomSuffix`  `addCustomVerseFromForm`
`addDays`  `addNewCollection`  `addNewSection`  `addRow`  `addVerseAlarmCustomTime`  `ALL_VERSES`
`anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`  `applyRemoteState`  `applyScale`
`applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`  `applyUiScale`
`applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `applyView`  `arr`  `assigned`
`at`  `attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`
`attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authSetLoading`  `authSignOut`
`authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`  `away`  `axisName`
`b`  `back`  `bad`  `barRef`  `barTags`  `base`
`bat`  `beforeBlock`  `beforeSave`  `begin`  `beginMouseDrag`  `bibleClose`
`bibleOpen`  `bibleOpenLast`  `bibleOpenRef`  `bibleStartPreload`  `bigNum`  `bindHold`
`bkKey`  `board`  `body`  `bodyEl`  `book`  `bottom`
`bub`  `build`  `buildBackupFilename`  `buildFlatList`  `buildLanes`  `bump`
`bw`  `byName`  `bySlot`  `bySrc`  `C`  `c`
`cal`  `cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `card`  `ceAddGoogleLink`
`ceCloseDeletePopup`  `ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`
`ceOpenDeletePopup`  `ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`
`ceToggleFilter`  `ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `cfToggleRaw`
`chap`  `checkDataRecovery`  `checkVerseAlarm`  `chip`  `chM`  `cl`
`clamp`  `cleanupEmptyDays`  `clear`  `clearActive`  `clearContactForm`  `clearDropIndicators`
`clearLp`  `clearPaint`  `clearTrash`  `close`  `closeAccountSensitiveModals`  `closeCellTodo`
`closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`  `closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`
`closeDatePicker`  `closeEventEditMenu`  `closeEventModal`  `closeGroupDialog`  `closeHdrCalendar`  `closeInlineInput`
`closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`  `closeLogoMenu`  `closeMemoActMenu`  `closeMemorizationHistory`
`closeMemRecPopup`  `closePlusList`  `closeRepeatSubPicker`  `closeRepScope`  `closeRpConfig`  `closeSecDelModal`
`closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`  `closeSmGhost`  `closeSubRowMenu`
`closeSubscribeDialog`  `closeSwKbHelp`  `closeSyncConflicts`  `closeSyncResultModal`  `closeTaskMemo`  `closeTaskMenu`
`closeTaskMenu_keepCtx`  `closeThemePicker`  `closeThere`  `closeTrash`  `closeVcSettings`  `closeVDashDetail`
`closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`  `closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`
`closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`  `closeVerseSettingsModal`  `closeVfDeeperPicker`  `closeVfKeepSwitch`
`closeVfShare`  `closeVliMenu`  `closeVliMenuFromOverlay`  `closeVPair`  `closeVwScope`  `cmpLine`
`cnt`  `code`  `col`  `collAddAction`  `collect`  `collMenuAction`
`color`  `colX`  `commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`  `contactAction`
`contactBadgeCountChanged`  `copy`  `core`  `cross`  `ctl`  `cur`
`currentMatchingPresetName`  `currentViewKey`  `curSecId`  `cx`  `damp`  `day`
`dayOfYearVerseIdx`  `days`  `daysFromToday`  `dayTotals`  `decide`  `deeperN`
`defaultState`  `defIds`  `deleteCollection`  `deleteEventFromMenu`  `deleteLatestVerseEvent`  `deleteSection`
`deleteSectionConfig`  `dev`  `devInboxDelete`  `devInboxLoad`  `devInboxRefreshBadge`  `devInboxToggleAll`
`devInboxUpdateBadge`  `devNoteHandleFile`  `devNoteSend`  `devNoteToggle`  `devTrashDelete`  `devTrashEmpty`
`devTrashRender`  `devTrashToggle`  `dir`  `disarm`  `done`  `doRedo`
`doSaveGroup`  `doSubscribe`  `doUndo`  `dow`  `download`  `draw`
`dropDrag`  `dropSecArchive`  `dsh`  `dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`
`dur`  `editContact`  `editEventFromMenu`  `el`  `email`  `emailTag`
`endDrag`  `endPinch`  `endRow`  `enough`  `ensureDailyRepeats`  `ensureRepeatsForView`
`esc`  `evChipMaxCommit`  `evChipMaxInput`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`
`exportBackup`  `f`  `facet`  `fam`  `fbForceUploadLocal`  `fbPushState`
`fbStartListening`  `fill`  `findColl`  `findFlatIndex`  `findLaneIndex`  `findMentionedContacts`
`finish`  `fire`  `first`  `fit`  `fitPill`  `flush`
`focusItemInput`  `focusPrayers`  `form`  `formatEventTime`  `from`  `gcalAddDays`
`gcalB7IdFor`  `gcalBody`  `gcalCollect`  `gcalConnect`  `gcalDateOf`  `gcalDayDiff`
`gcalDisconnect`  `gcalExModified`  `gcalFromG`  `gcalGidFor`  `gcalGKey`  `gcalHash`
`gcalHashEv`  `gcalInstDate`  `gcalInstMaster`  `gcalKeyOf`  `gcalPad`  `gcalParseRecur`
`gcalPatchBody`  `gcalPlan`  `gcalRecur`  `gcalRf`  `gcalRuleHits`  `gcalSeriesBody`
`gcalSetColor`  `gcalSetWrite`  `gcalStamp`  `gcalSync`  `gcalToG`  `gcalToggleCal`
`gcalToggleList`  `gcalWindow`  `gcalYmd`  `getActiveColls`  `getBibleInk`  `getBibleMarks`
`getBibleNotes`  `getBibleOrig`  `getBibleReadLog`  `getBibleToRead`  `getBigs`  `getCarryCount`
`getChips`  `getContainer`  `getCustomVerses`  `getDay`  `getDayFadeClass`  `getDeeperLog`
`getDisplayEvents`  `getDisplayTasks`  `getDOW`  `getDropTarget`  `getEvenDeeperLog`  `getEvents`
`getKeepLog`  `getLikeLog`  `getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`
`getSecColor`  `getShareLog`  `getSmalls`  `getStableDt`  `getTasksTaggedWithContact`  `getThereLog`
`getTrack`  `getTrash`  `getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`
`getVersePush`  `getWeekFadeClass`  `getWraps`  `gid`  `gname`  `go`
`goToDate`  `grid`  `h`  `hdrCalGoToday`  `hdrCalNav`  `hdrCalPick`
`heat`  `hh`  `hi`  `hideBusyToast`  `hit`  `hmBtn`
`home`  `html`  `importBackup`  `importFromFile`  `initAppUI`  `initCrossViewSwipe`
`initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`  `injectCSS`
`inkMove`  `inkStart`  `inner0`  `inRange`  `inspectRecoveryDate`  `instIdOf`
`IS_TOUCH`  `isAnyInputFocused`  `isCollActive`  `isDark`  `isExcluded`  `isNowWithinSection`
`isOpen`  `isOver`  `isSwipeZone`  `isToday`  `isTouch`  `itemKey`
`items`  `j`  `jong`  `K`  `k`  `keep`
`keepPickNew`  `keepPickToggle`  `keepRowDelete`  `keepRowEdit`  `keepSetSort`  `keepTogglePairSort`
`key`  `keys`  `kindWord`  `L`  `l`  `l0`
`label`  `laterLocal`  `laySetBp`  `laySetWeekly`  `lb`  `left`
`legend`  `likeN`  `limit`  `line`  `links`  `list`
`lo`  `load`  `logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`
`logoMenuOpenListSub`  `logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`  `loop`  `loose`
`LS_KEY`  `m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`  `makeContactBadges`
`makePresetChip`  `makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSubPanel`  `makeSubToggleBadge`
`makeSwipeWrap`  `manuallyCollapsed`  `map`  `mapPrayers`  `mapTop`  `mark`
`markOf`  `mastOf`  `materializeRepeatsFor`  `md`  `me`  `measure`
`memoActRun`  `mergeDuplicateVerses`  `mid`  `mine`  `minH`  `mix`
`mk`  `mkBtn`  `mkDate`  `mode`  `monthLabel`  `monthTitleHTML`
`mount`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`  `moveDrag`
`moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`  `mvEl`  `N`
`n`  `n0`  `name`  `nameTx`  `nav`  `navigateDate`
`navigateWeek`  `needTemp`  `next`  `nextAfterDonePicked`  `nextAfterDoneTo`  `nextAfterDoneYday`
`nextAfterDoneYdayPicked`  `nextAfterDoneYesterday`  `nextVerseManual`  `note`  `now`  `o`
`offTest`  `ok`  `on`  `onCancel`  `onDown`  `one`
`onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`  `onStart`
`onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`  `onVerseAlarmToggle`  `onVerseBarClick`
`onVerseMemRecord`  `open`  `openAccountSettings`  `openCellInput`  `openCollAddMenu`  `openCollEdit`
`openCollMenu`  `openContactMenu`  `openContactsModal`  `openContactsModalWith`  `openDeeperFromRef`  `openEvenDeeperFromRef`
`openEventEditMenu`  `openEventModal`  `openEventModalForDate`  `openGroupDialog`  `openHdrCalendar`  `openInlineInput`
`openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`  `openLogoMenu`  `openMemoActMenu`  `openMemoFromMenu`
`openMemorizationHistory`  `openMenuForThis`  `openPlusList`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`
`openSfxMenu`  `openShareDialog`  `openSmGhost`  `openSubRowMenu`  `openSubscribeDialog`  `openSubsFromMenu`
`openSwKbHelp`  `openSyncConflicts`  `openTaskMemo`  `openTaskMenu`  `openThemePicker`  `openThere`
`openThereDash`  `openThereFromVf`  `openThereTune`  `openTrash`  `openVcCollSettings`  `openVcSettings`
`openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollFromListMenu`  `openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`
`openVerseGrid`  `openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsFromLogo`  `openVerseSettingsFromMenu`
`openVerseSettingsModal`  `openVfDeeper`  `openVfShare`  `openVfShareFor`  `openVliMenu`  `openVPair`
`openVwScope`  `opts`  `org`  `out`  `overflows`  `own`
`p`  `pad`  `padH`  `padV`  `pages`  `pageTint`
`paint`  `paintAppUIFromLocal`  `paintRows`  `pairKey`  `pairOn`  `pane`
`paneHTML`  `parseItemKey`  `pass`  `pcEl`  `pct`  `pd`
`pend`  `perBtn`  `phone`  `pick`  `pickContainer`  `pickFromDeviceContacts`
`pickVfDeeper`  `place`  `plusClearAll`  `plusRemoveCat`  `plusRemoveKeys`  `plusRemoveTopic`
`pool`  `populateCarryBadge`  `portrait`  `prepDatePicker`  `prepDupDatePicker`  `prepNextDatePicker`
`prepNextYDatePicker`  `prepTaskMenuDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `prop`
`push`  `put`  `putOverride`  `putText`  `q`  `r`
`randomVerseManual`  `rankHTML`  `raw`  `rawSave`  `rc`  `recent`
`recheck`  `recheckBurst`  `recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`
`recordVerseLike`  `recordVerseShare`  `ref`  `refH`  `refLine`  `refOnly`
`refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`  `refreshVerseMarksLive`  `refs`  `removeCustomSuffix`
`removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`  `renderCeGoogleList`  `renderCeTrash`
`renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`  `renderLayout`  `renderMonthly`
`renderPlusList`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`  `renderSecBody`
`renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`  `renderSmList`
`renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`  `renderVcSettings`
`renderVDashLink`  `renderVDashMap`  `renderVDashPie`  `renderVDashRhythm`  `renderVDashThere`  `renderVDashTrend`
`renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`  `renderVerseListCatRow`
`renderVerseListPies`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderVgCfg`  `renderVgPick`  `renderVPair`
`renderVwScope`  `renderWeekly`  `repeat`  `resetStateToDefaults`  `resizeAllInputs`  `resolveTarget`
`resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`  `rmBtn`  `roll`
`rot`  `row`  `rows`  `rowsOf`  `rpChMonth`  `rs`
`runAutoCarryOver`  `runCarryNow`  `runGroupSync`  `runSharedCollSync`  `runVerseSheetAutoSync`  `s`
`safe`  `save`  `saveCurrentSectionConfig`  `saveText`  `say`  `SC`
`sc`  `scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`  `scrollFlatIdxIntoView`  `sec`
`secDelDo`  `secHasEvent`  `secHasPendingTodo`  `secId`  `secs`  `sel`
`selRef`  `sendTestPush`  `sendToTrash`  `set`  `setActiveSingle`  `setCarryScope`
`setCnt`  `setDeeperOpen`  `setDeviceNotify`  `setEventTimeToggle`  `setLayFormMode`  `setLinkOpenMode`
`setNotifySuffix`  `setPlusTab`  `setShareSize`  `setText`  `setThereIcon`  `setTimeStep`
`settle`  `setTxtRefBracket`  `setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`
`setupCrossViewSwipeZones`  `setVcAuto`  `setVcAutoMin`  `setVcHeadMode`  `setVcRollMode`  `setVcRollSec`
`setVcShow`  `setVcShowAll`  `setVcTextScale`  `setVcTheme`  `setVerseCountScope`  `setVerseIdx`
`setVerseNext`  `setVersePush`  `setVersePushInterval`  `setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`
`setVfArtStyle`  `setVfTextScale`  `setWMViewMode`  `sfxMenuAction`  `sgFold`  `sgGroupToggle`
`shareCopyCode`  `shareSizeOf`  `shareVia`  `sheetEditCheck`  `showAutoBackups`  `showBusyToast`
`showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`  `showReactionToast`  `showSyncResultModal`
`showToast`  `showVersePopup`  `side`  `siriCopyUrl`  `siriMakeKey`  `sisterGo`
`slide`  `slotOf`  `snapBack`  `snapshot`  `solve`  `sortBtn`
`sortEventsByTime`  `span`  `src`  `srcName`  `start`  `startDrag`
`startEditContact`  `stepHiOverlap`  `stepHiStarMax`  `stickOf`  `stopLt`  `stopTimer`
`strip`  `style`  `submitContact`  `submitEventModal`  `sum`  `sumBy`
`sw`  `swCrossToggle`  `swImportFromBlock7`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`
`swKeepSet`  `swOpenCollFilter`  `swRow`  `swTitle`  `swToggleEdit`  `swToggleKeep`
`syncIncludeNow`  `syncIncludeOpenFull`  `syncIncludeUndo`  `syncP`  `syncRollDisplays`  `syncSecsFromState`
`syncVis`  `t`  `tab`  `tags`  `taskMarkerFilterPass`  `TDASH`
`testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`  `text`  `themeById`  `themeChip`
`themeNo`  `themePickerApply`  `themePickerGroup`  `themePickerPick`  `thereTuneClock`  `thereTuneFold`
`thereTuneReset`  `thereWordReset`  `thereWordSw`  `tick`  `tilt`  `tKey`
`to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`  `toggleEventWeekly`
`toggleHiMark`  `toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`  `togglePropTitleGroupOpen`
`togglePropTitleMotion`  `toggleSectionExclude`  `toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`  `toggleTaskMemoEdit`
`toggleTaskUrgent`  `toggleTxtIncl`  `toggleUrgentRank`  `toggleVerseAlarmContent`  `toggleVerseBarOn`  `toggleVfArt`
`toggleVfKeepSwitch`  `toggleVfPattern`  `toggleVfSecPattern`  `toggleWeeklyRepeat`  `toGraph`  `top`
`topic`  `topRefs`  `total`  `totalActive`  `totalBigCount`  `totalChg`
`TOUCH`  `touch`  `trashBgClick`  `travel`  `txt`  `u`
`u8`  `uiLevel`  `uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`
`unit`  `until`  `unwatch`  `up`  `updateHeaderDate`  `updateNotifySub`
`updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`  `updateSmCnt`  `updateTotal`
`updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`  `v`  `vbShuffleVerse`
`vcAct`  `vcAddCard`  `vcClearFilter`  `vcNav`  `vcOpenFilter`  `vcOpenFull`
`vcRollSecInput`  `vcSetTextScaleLive`  `vcSetView`  `vcStepTextScale`  `vcToggleView`  `vDashKindPick`
`vDashLinkRelayout`  `vDashMapPick`  `vDashOpenCollSettings`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`
`vDashSetCustom`  `vDashSetSlices`  `vDashSetSpanMode`  `vDashSetView`  `vDashSubToggle`  `vDashToggleEtc`
`verb`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`  `verseFullNav`  `verses`
`verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`  `vfCopyBodyOnly`  `vfHomeAction`
`vfOpenCollSettings`  `vfOpenDashboard`  `vfOpenKeepGrid`  `vfOpenKeepList`  `vfOpenNavTile`  `vfOpenSheetForCat`
`vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgCfgReset`  `vgCfgSet`  `vgClearSel`
`vgCycleTab`  `vgDepthSet`  `vgPick`  `vgPickAxis`  `vgRankSet`  `vgSearch`
`vgSetBibleSort`  `vgSetSelOnly`  `vgSetTab`  `vgShowHelp`  `vgStepTagExcl`  `vgStepTileExcl`
`vgTapDateSort`  `vgToggle`  `vgToggleExpand`  `vgToggleGroup`  `vgToggleSel`  `vgToggleTagExcl`
`vgToggleTileExcl`  `viewDay`  `viewMonth`  `viewWeek`  `vis`  `vliAction`
`vlSetCustom`  `vlSetPeriod`  `vlSetSort`  `vlSetTab`  `vlToggleCtrl`  `vlTogglePairSort`
`vlwSetCustom`  `vlwSetPeriod`  `vlwSetSort`  `vlwTogglePairSort`  `vMapOpenChapter`  `vMapOpenGrid`
`vMapRangeSet`  `vMapToggleFold`  `vpAddTime`  `vpCycleFullTab`  `vpDelTime`  `vpDiagClear`
`vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`  `vpFull`  `vpGoToFilteredTile`  `vpOpenVerse`
`vpSetTime`  `vpTile`  `vpToggleDay`  `vpToggleFilt`  `vrs`  `vsetGoDashboard`
`vTrCloseBook`  `vTrInsSet`  `vTrOpenBook`  `vTrSet`  `vTrSortBy`  `vTrSpanSet`
`vTrToggleExp`  `vTrToggleSeries`  `vw`  `vwScopeClearFilter`  `vwScopeCollSettings`  `vwScopePick`
`vwScopeToggleMode`  `W`  `w`  `want`  `wasOpen`  `weekOffsetLabel`
`weekOfMonth`  `weeks`  `weeksFromToday`  `who`  `widest`  `wireActivateClick`
`words`  `x`  `y`  `z`

