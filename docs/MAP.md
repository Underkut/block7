# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-1008-1** · 전체 49,430줄 · 구역 420개 · 함수 2608개

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
| 456~6,087 | 5,632줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 6,088~6,344 | 257줄 (1%) | JS | 동작 (자바스크립트) |
| 6,362~6,392 | 31줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,393~6,462 | 70줄 (0%) | JS | 동작 (자바스크립트) |
| 6,463~6,500 | 38줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,515~9,236 | 2,722줄 (6%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 9,237~49,427 | 40,191줄 (81%) | JS | 동작 (자바스크립트) |

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
| 734 | There 단추 자리들 (v26-0923-5 T-4) |
| 800 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 962 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 975 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 996 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 1,079 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 1,227 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,349 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,392 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,676 | 스닉픽 한 줄 |
| 1,830 | DATE NAV |
| 1,848 | GNB 날짜 (#hDate) |
| 1,871 | DATE SWIPE OVERLAY |
| 1,873 | MINI MOVE MENU |
| 1,892 | DATE PICKER OVERLAY |
| 1,972 | 모음 구역 (v26-0916-2, HB) |
| 2,042 | TIME SECTION |
| 2,073 | Event chips (shown inline in the section header, next to the |
| 2,199 | BLOCK SWIPE WRAPPER |
| 2,222 | BIG BLOCK (E method: colored left bar, no indent) |
| 2,364 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,481 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,486 | 연락처 관리 모달 |
| 2,512 | @닉네임 태그 할일 모아보기 |
| 2,572 | 하위 할일 판 |
| 2,628 | 메모 팝업 |
| 2,667 | 헤더 슬라이드 입력창 (B안) |
| 2,693 | 헤더 + 버튼 (할일 추가) |
| 2,712 | ▲ 숨기기 버튼 |
| 2,744 | TRASH PANEL |
| 2,790 | DATE NAV |
| 2,843 | TASK MOVE MINI MENU |
| 2,896 | 구간 판 — 옮길 시간 구간을 고르고, 그 구간에 무엇이 있는지 본다 |
| 2,956 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 2,981 | Event add modal |
| 3,138 | WEEKLY/MONTHLY |
| 3,233 | D뷰 좌우 분할 (넓은 화면) |
| 3,244 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 3,267 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 3,274 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 3,705 | LOGIN / AUTH SCREEN |
| 3,781 | SETTINGS PANEL |
| 3,834 | 설정 등급(이지·미드·파워) 고르기 |
| 3,857 | 선 그림만으로 고른 것을 나타내는 자리 |
| 4,007 | 강조 표시 고르는 줄 (v26-0812-15) |
| 4,027 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 4,194 | 시간 구간 경계선 |
| 4,256 | 말씀 대시보드 |
| 4,300 | 대시보드 위쪽 전환 (분포 ⇄ 흐름) |
| 4,308 | 흐름(추이) |
| 4,372 | 손으로 만든 슬라이더 (v26-0906-2, HB 5-1) |
| 4,471 | 작은 발견 (v26-0906-5, HB 2) |
| 4,497 | 성경 지도 (v26-0906-5, HB 1) |
| 4,526 | 파이 상세: 조각 수 슬라이더 · '기타' 켜고 끄기 (v26-0907-4, HB 4) |
| 4,563 | 연결 — 그래프 뷰 (v26-0907-4 · v26-0907-5, HB 7) |
| 4,614 | 짝 목록 (v26-0907-6, HB 3) |
| 4,739 | 리듬 (요일 × 한 시간) (v26-0907-3, HB 5) |
| 4,858 | 색상 테마: 뷰 탭 요약 줄 |
| 4,875 | 색상 테마 선택 화면 |
| 4,968 | 미리보기 목업 |
| 5,205 | 본문에 긋기 (v26-1007-19) |
| 5,328 | 성경 읽기 대시보드 (v26-1007-9 · 시안 MmxtwQwAy2xr4DbScFJM7m) — 색은 남색 하나를 진하기로만 |
| 5,417 | 첫 그림의 색은 **테마를 따르지 않는다** (v26-0922-23, HB) |
| 5,454 | 꿀벌집 — 아래에서부터 한 칸씩 차오른다 (v26-0922-22, HB) |
| 5,530 | PC: 넓어지면 **열이 는다** (v26-0922-11, HB 4) |
| 5,791 | 유튜브 썸네일은 **제 색을 더 많이 남긴다** (v26-0922-14, HB) |
| 5,938 | 편집 모드 |
| 5,962 | PC: 자판이 보고 있는 위젯 (v26-0921-13, HB) |
| 5,972 | PC: 자판이 보고 있는 타일 (v26-0921-12, HB) |
| 6,019 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 188 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 222 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 261 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 426 | 조기 적용 (첫 페인트 전) | – |
| 6,294 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `base`, `_swBootOff`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 9,276 | 네비게이토 180 암송성구 데이터 | – |
| 9,303 | Color presets | – |
| 9,321 | 네비게이토 180 verse bar | – |
| 9,322 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 9,338 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 9,378 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 9,396 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 9,517 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses`, `_collPeriodVerses`, `_cfHasSel`, `_cfClearSel`, `_plusKeyOf`, `_plusHas`, `_collVerseShows`, `_collVersePassesOnly`, `_plusVisibleMask`, `_plusVerses`, `_plusPrune`, `_plusTidy` … 외 3개 |
| 9,692 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_VERSES_ALL`, `_activeVersesFrom`, `ACTIVE_TOTAL` |
| 9,741 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 9,747 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 9,837 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_collHue`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList` … 외 3개 |
| 10,190 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 10,282 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 10,340 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 10,414 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 10,532 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 10,614 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid`, `_bump` |
| 10,801 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propImg`, `_propYt`, `_propSits` … 외 3개 |
| 11,081 | 상황/필요 · 묵상 질문 (v26-0922-3, HB) | `colX` |
| 11,168 | '설교 목록' 탭을 그대로 연결하기 (v26-0922-8, HB) | `_isSermonListSheet`, `_sermonCatNorm`, `_sermonListMap`, `h`, `at`, `_sermonYtFor`, `_applySermonListSheet` |
| 11,261 | 영상이 없는 설교 (v26-1005-1, HB) | `_sermonNoVideo` |
| 11,293 | 한 모음에 연결된 시트 여럿을 **한 번에** 반영한다 (v26-1004-1, HB 신고) | `_syncVerseFp`, `_syncCollSheets`, `_rowsToItems`, `_importVerseRows`, `_sheetCsvEndpoints`, `_fetchSheetCsv`, `_loadSheetJs`, `importFromFile` |
| 11,495 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 11,613 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 11,691 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 11,742 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_shareCopy`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `_grpNameNorm`, `_grpNameValid`, `_grpAddrUrl`, `_grpAddrShow`, `_grpFetch`, `_subscribeShared`, `verses`, `_grpSync` |
| 11,950 | 빼기 | `runGroupSync`, `_joinRead`, `_joinClear`, `_joinFromPath`, `_joinApply` |
| 12,067 | 그룹 만들기·고치기 (교회 쪽 화면) | `openGroupDialog`, `closeGroupDialog`, `_grpAddrPreview`, `_grpRenderColls`, `doSaveGroup`, `gname`, `_grpShowAddr`, `openShareDialog`, `closeShareDialog`, `_shareResetBigText`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy` … 외 6개 |
| 12,349 | GNB 의 There · 성경 · 1단 롤링 피커 (v26-1006-6, HB 8) | `_gnbExtrasSync`, `_gnbPickerOn`, `_gnbPickerStep`, `_gnbRpMenu`, `cur`, `go`, `renderVerseBar` |
| 12,450 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_vbThereEl`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncItems`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 12,707 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseResizeThreshold`, `_verseResizeOpacity`, `_verseModeTextEls`, `_verseModeSession`, `_verseModeSettle` |
| 12,916 | 크기 전환 드래그의 공통 손잡이 | `_verseDragBegin`, `_verseDragMove`, `travel`, `_verseDragEnd`, `_initVerseBarResize`, `_verseBandHit`, `bottom`, `_initVerseBandDrag`, `decide`, `unwatch`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual` … 외 16개 |
| 13,494 | 인앱 말씀 팝업 | – |
| 13,498 | 말씀 푸시 알림 설정 | `_vpOrders`, `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 13,528 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 13,617 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent`, `_bibleChapters` … 외 1개 |
| 13,838 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 13,849 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 13,914 | 암송 관리 | `getMemLog` |
| 13,921 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 13,944 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 13,967 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare`, `getThereLog`, `_thereBegin`, `_thereCommit`, `_thereEach`, `_thereTotalSec`, `_thereCountFor`, `_thereClock`, `_thereDurWords` |
| 14,037 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 14,057 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 14,225 | BibleLinkProvider | `_brKey`, `getBibleMarks`, `getBibleReadLog`, `getBibleNotes`, `_brSetMark`, `_brNoteSave`, `_brNotesAt`, `_brMigrateNotes`, `_brReadMs`, `_brHistory`, `_brHistHide`, `_brReadAdd`, `_brDev`, `_brParseRef` … 외 6개 |
| 14,497 | 성경 읽기 대시보드 — 기록 → 숫자 (v26-1007-9, B-9) | `_brDashRows`, `_brDashStart`, `_brSeenOf`, `_brDashStats` |
| 14,588 | 본문에 긋는 표시 (v26-1007-19, HB — 시안 FsJa1z2zfw4PHv9gCAwrrs 그대로) | `getBibleInk`, `_brInkId`, `_brInkSpansFrom`, `_brInkStepPos`, `_brInkCut`, `_brInkAdd`, `one`, `_brInkErase`, `_brInkHits`, `_brInkQuery`, `_brUrl`, `_brFetchJSON`, `_brGet`, `_brBook` … 외 47개 |
| 14,972 | 읽는 시간 · 본 절 — 장을 펼친 순간부터 다음 장·닫기·앱 벗어남까지 | `_brSessEnd`, `_brSessStep`, `_brBusy`, `_brActiveWin`, `_brSessStart`, `bibleOpenLast`, `bibleOpenRef`, `bibleOpen`, `bibleClose`, `_brIsOpen`, `_brEsc`, `_brShow`, `_brStep`, `_brRerender` |
| 15,125 | 헤더·하단 접기 (v26-1007-7, HB — 갓피플 방식) | `_brChromeApply`, `_brChrome`, `_brOnScroll`, `_brProgSync`, `_brOpenDash`, `_brFmtMin`, `_brDashRender`, `pd`, `q`, `_brUnpark` |
| 15,262 | 절 롱터치·우클릭 메뉴 (v26-1007-8, HB) | `_brVmOpen`, `_brVmClose`, `_brViewRef`, `_brVmRun` |
| 15,307 | 시트 | `_brOpenSheet`, `_brCloseSheets`, `_brOpenAct`, `_brDate`, `_brOpenMemo`, `_brCopy`, `done`, `_brCopyFallback` |
| 15,361 | 고르기 판 | `_brRecent`, `_brRenderPick` |
| 15,397 | 글자와 화면 | `_brApplyLook`, `_brSyncAa`, `_brSet` |
| 15,420 | 내 표시 목록 | `_brRow`, `_brRenderList`, `txt`, `_brListDelete`, `_brRowGone`, `_brSwipeBind` |
| 15,504 | 검색 | `_brRunFind`, `_brSyncScope` |
| 15,542 | 묶기 (한 번만) | `_brBind`, `selRef`, `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 15,926 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 16,021 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 16,257 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `_vfRestoreCovers`, `closeVerseFull`, `_vfSyncPageBg`, `_verseFullIsOpen` |
| 16,349 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 16,357 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `hit`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns` … 외 22개 |
| 16,993 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 17,031 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 8개 |
| 17,372 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 17,478 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 17,484 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 17,532 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `_syncDeeperOpenUI`, `setDeeperOpen`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount` … 외 3개 |
| 17,695 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | `_thereIconKey`, `_thereIconSync`, `_thereIcHTML`, `setThereIcon` |
| 17,787 | 세팅 (이 기기에만) | `_tfDevKind`, `_tfLoad`, `_tfStore`, `_tfGet` |
| 17,821 | 그리기 | `_tfHex2Hsl`, `_tfHsl2Rgb`, `_tfSprites`, `_tfPick`, `_tfBuildSprites`, `_tfSize`, `_tfSpawn`, `_tfDrawCross`, `_tfFrame`, `el` |
| 17,905 | 세팅 판 | `_tfSyncUI`, `_tfWire`, `thereTuneClock`, `thereTuneReset`, `thereTuneFold` |
| 17,956 | 테마 입히기 (v26-0923-8, HB) | `_tfApplyTheme`, `set`, `mix` |
| 17,986 | 열기·닫기 | `_thereIsOpen`, `openThere`, `closeThere`, `_thereRecorded`, `openThereFromVf`, `openThereTune` |
| 18,033 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 18,146 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 18,249 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 18,526 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 18,668 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 18,683 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 18,917 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 18,932 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 18,946 | 명조 | – |
| 18,950 | 고딕 | – |
| 18,953 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptPreloadVerse`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish` … 외 3개 |
| 19,200 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 19,515 | 크기 (v26-0905-2, HB — "말씀 모음 설정에 비해 홈과 책갈피가 | – |
| 19,527 | 홈 아이콘 두 벌 (v26-0905-7, HB) | – |
| 19,542 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfPrepareNext`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav` |
| 19,665 | 지금 보는 것이 '말씀 설정에서 정한 그 모음' 그대로인가 | `_vfAtCollection`, `_vfHomeStash`, `vfHomeAction`, `vfOpenDashboard`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab`, `_vfRenderKeepSwitch`, `toggleVfKeepSwitch`, `_vfKeepNav`, `vfOpenKeepList`, `vfOpenKeepGrid`, `_vfTitleTileFn` … 외 3개 |
| 19,933 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 20,165 | 설정창 (말씀설정 → 전체화면 탭) | `_ptMotionOn`, `_ptPickMotion`, `togglePropTitleMotion`, `_ptSyncMotionUI`, `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 20,241 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 20,346 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 20,368 | 명제 **본문** 가르개 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 20,420 | 명제 대표 문구 타이틀 | – |
| 20,423 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines` |
| 20,499 | 대표 문구 줄바꿈 (v26-0913-4, HB) | – |
| 20,536 | 끊으면 말이 두 동강 나는 자리 (v26-0913-5, HB) | – |
| 20,562 | v26-0913-6, HB 가 준 예로 더 넣은 것 | `_ptGlued`, `_ptCutPoint`, `mid`, `_ptCutTitle` |
| 20,656 | 정한 줄을 **폭을 아는 자리에서** 다시 정한다 (v26-0913-6, HB) | `_ptAvailW`, `pad`, `_ptRelines`, `widest`, `_ptPaint`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 20,845 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 21,134 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 22개 |
| 21,472 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 21,477 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 21,578 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 21,605 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 21,629 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 21,666 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 10개 |
| 22,119 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight`, `top` |
| 22,137 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_logoMenuEsc`, `_tryCloseLogoMenu` |
| 22,286 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `renderVerseListPies`, `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 22,397 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 22,503 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 22,521 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 22,644 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `_repRule`, `_repUntil`, `_repEx`, `_repBlocked`, `_dayKeyBefore` … 외 6개 |
| 22,898 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 23,010 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 23,050 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 23,088 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 23,122 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 23,370 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 23,392 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 23,404 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 23,456 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 23,719 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 23,799 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 24,037 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 24,254 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 24,310 | 범위(scope)별 집계 (v26-0904-7, HB) | `_vlKindEntries`, `_vlKeepEntries`, `_vlHomeEntries`, `_vlReactTotals`, `_vlExtraSortFor`, `_vlEntriesForScope` |
| 24,370 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 24,405 | 정렬 (v26-0831-11, HB) | – |
| 24,409 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vlwKey`, `vlwSetSort`, `vlwTogglePairSort`, `vlwSetPeriod`, `vlwSetCustom`, `_vListControlsHTML` … 외 28개 |
| 24,765 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 24,835 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 24,861 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 24,893 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 25,079 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `_keepSwitchIsOpen`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 25,118 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 25,201 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 25,255 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashMaxSlice`, `_vDashShowEtc`, `_vDashEtcColor`, `vDashSetSlices`, `vDashToggleEtc`, `_vDashKeyCmp` … 외 19개 |
| 25,592 | 위쪽 전환: 분포(파이) ⇄ 흐름(꺾은선) | `_vDashView`, `vDashSetView`, `_vDashCommonHTML`, `_vDashViewTabsHTML`, `renderVerseDashboard`, `renderVDashPie`, `_vDashPieInsightHTML`, `_vTrPref`, `_vTrSpanMode`, `vDashSetSpanMode`, `_vTrSort`, `vTrSortBy`, `_vTrSpan`, `_vTrNowN` … 외 4개 |
| 25,837 | 기간 슬라이더 | `_vTrOtherSpan`, `vTrSpanSet` |
| 25,861 | 부드럽게 끌리는 슬라이더 | `_vTrRailBind`, `paint`, `fire` |
| 25,929 | 양쪽 손잡이 슬라이더 (v26-0907-3, HB 6-3) | `_vTrExclLabel`, `_vTrRail2Bind`, `paint`, `_vTrBindRails`, `vTrInsSet`, `vTrToggleSeries`, `vTrToggleExp`, `vTrOpenBook`, `on`, `vTrCloseBook`, `_vTrEntries`, `_vTrBucketOf`, `_vTrBucketRange`, `_vTrNowBucket` … 외 10개 |
| 26,223 | 그 성경 안에서 이 말씀이 걸리는 '장' | `_vTrChapterKeys`, `rs`, `_vTrChapNo`, `_vTrChapCmp`, `_vTrData`, `unit`, `add`, `_vTrGeo`, `bw`, `_vTrHFromX`, `_vTrChartSVG`, `nameTx` |
| 26,328 | 견주는 두 구간을 그림 안에 그린다 (v26-0906-1 · v26-0906-2, HB 4) | `markOf` |
| 26,489 | 그림 안의 띠를 끌어 견주는 구간(h)을 바꾼다 (v26-0906-2, HB 4-1) | `_vTrBindBand`, `fitPill`, `paint`, `_vTrChipsHTML`, `_vTrRailHTML`, `f`, `pct`, `_vTrRail2HTML`, `_vTrSpanRowHTML`, `unit`, `_vTrRowsOf`, `sum`, `_vTrDiffHTML`, `_vTrInsightHTML` … 외 1개 |
| 26,726 | 작은 발견 (v26-0906-5, HB 2) | `_vTrFindings`, `sum`, `_vTrFindingsHTML`, `card`, `put` |
| 26,791 | 표 정렬 (v26-0906-2, HB 7) | `_vTrNameCmp`, `_vTrSortRows`, `_vTrTheadHTML`, `_vTrRowHTML`, `renderVDashTrend`, `form`, `unit` |
| 26,882 | 소제목 차례: 범위 - 무엇을 - 모양 | `_vDashSubKind`, `_vDashSubArmed`, `_vDashSubRefSet`, `vDashSubToggle`, `vDashKindPick`, `_vDashWinEntries`, `sc`, `keys`, `from`, `to`, `_vDashSpanWords`, `_vDashScope`, `_vDashScopeCtlHTML`, `_vDashVerbWord` … 외 8개 |
| 27,137 | 지도 | `_vMapMode`, `vDashMapPick`, `_vMapStats`, `_vMapStep`, `_vMapShade`, `_vMapInk`, `_vMapGroups`, `_vMapRange`, `lo`, `hi`, `_vMapRanks`, `_vIdKey`, `k`, `_vMapChapMap` … 외 9개 |
| 27,405 | 3-2 · 고른 조건이 만든 줄들 | `grid` |
| 27,557 | 연결 (주제 ↔ 성경) | `_vLinkAxis`, `_vgStop` |
| 27,597 | 배치 값 (2-1) | `_vgCfg`, `cl`, `vgCfgSet`, `vgCfgReset` |
| 27,632 | 골라 보기 (1-1) | `_vgSel`, `_vgDepth`, `vgDepthSet` |
| 27,648 | 노출 순위창 (2-1·2-2) — "몇 등부터 몇 등까지 그래프에 보일지". | `_vgRankPref`, `_vgRankOf`, `vgRankSet`, `_vgRankRailBind`, `paintRows`, `paint`, `vgSetSelOnly`, `vgToggleSel`, `vgClearSel`, `vgSearch`, `_vgSeeds`, `_vgReach`, `_vgDepthCounts`, `_vgApplyFilter` … 외 2개 |
| 27,894 | 껍데기를 먼저 넣는다 | – |
| 27,927 | 이제 그래프가 실제로 차지한 폭을 재고, 그 폭으로 점을 만든다 | `push`, `_vgShow`, `vgToggle`, `vDashLinkRelayout`, `_vgClamp` |
| 27,998 | 물리와 그리기 | `_vgRun` |
| 28,043 | 2-2 · 키울 때 점과 글자는 **제곱근만큼만** 커진다 | `applyScale`, `mark`, `paint` |
| 28,075 | 한 판 — 척력 · 용수철 · 가운데로 · 감쇠 | `stickOf`, `_rep2`, `tick`, `loop` |
| 28,169 | 손가락 · 마우스 | `applyView`, `toGraph`, `_vfSetTabPool`, `_vfTabList`, `_vpOtherAxis`, `_vpFacetCandidates`, `_vpFiltMulti`, `vpToggleFilt`, `_vpFiltRefSet`, `_vpTabName`, `_vpRep`, `_vpShortRef`, `_vpPool`, `_vpList` … 외 22개 |
| 28,660 | 주간 리듬 (잔디) | – |
| 28,661 | 리듬 (요일 × 한 시간) | `_vRhyKind` |
| 28,675 | There (v26-0923-7, HB) — 범위 맨 끝 '저장' 다음 | `_vRhyThereSplit`, `_vRhyBands`, `secs`, `renderVDashRhythm`, `dow`, `_lord` |
| 28,875 | 장절 느슨한 대조 | `_refNorm` |
| 28,912 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 28,956 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 29,039 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoTab`, `_vsetGoColl`, `_vsetFlashTab`, `openVerseSettingsFromMenu`, `openVerseSettingsFromLogo`, `openVerseCollFromListMenu`, `openVcCollSettings`, `_vsetRestoreBack`, `vsetGoDashboard`, `vDashOpenCollSettings` … 외 1개 |
| 29,194 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `_vDashDetailDotsHTML`, `vDashOpenDetail`, `_vDashDetailGo`, `_vDashDetailSlide`, `_initVDashDetailSwipe`, `slide`, `bodyEl`, `finish`, `_vDashDetailKey`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup` … 외 10개 |
| 29,589 | 위젯이 보는 범위 (v26-0904-7, HB) | `_vcScope`, `_vcScopeIsHome`, `_vcScopeCount`, `_vcSyncKind`, `_vcView`, `_vcScopeKey`, `_vcScopeIcon`, `_vcScopeLabel`, `_vcScopeParts` |
| 29,652 | 자동 넘김 (v26-0904-10, HB) | `_vcAutoOn`, `_vcAutoMin`, `_vcAutoSeq`, `_vcAutoOffset`, `_vcAutoSlot` |
| 29,701 | 앱을 껐다 켤 때 (v26-0905-10, HB) | `_vcAutoAnchors`, `_vcAutoSaveAnchors`, `_vcAutoSetAnchor`, `_vcAutoResetAnchors`, `setVcAuto`, `setVcAutoMin` |
| 29,757 | 이름 넘김 방식·간격 (v26-0905-8, HB) | `_vcRollSec`, `_vcRollMode`, `_vcRollOpt`, `_rollSecLabel`, `setVcRollMode`, `setVcRollSec`, `vcRollSecInput`, `_vcHeadMode`, `setVcHeadMode`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId` … 외 5개 |
| 29,865 | 카드가 도는 범위 | `_vcListItems`, `_vcVerseOf`, `hit`, `_vcKeyOf` |
| 29,896 | 명제의 대표 문구 (v26-0904-10, HB) | `_vcHiSplit`, `_vcVerses`, `_vcCurrent` |
| 29,956 | 자동 넘김 시계 | `_vcAutoChanged`, `_vcAutoSlide`, `finish`, `_vcAutoTick`, `_vcAutoStart`, `_vcFilterLabel` |
| 30,037 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 30,077 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 30,088 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 30,109 | 카드 한 장 HTML | `_vcCardHTML` |
| 30,193 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 30,287 | 카드 동작 | `_vcReactKeyOf`, `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind` |
| 30,428 | 카드 ⇄ 목록 | `vcSetView`, `vcToggleView`, `vcAddCard`, `_vwScopeOpts`, `openVwScope`, `closeVwScope`, `renderVwScope`, `row`, `_vwKeepSortHTML`, `chip`, `_vwScopeBindHold`, `go`, `vwScopeCollSettings`, `vwScopePick` … 외 3개 |
| 30,602 | 말씀 목록 모습 한 벌 | `_vcListHTML`, `_vcAttachGestures` |
| 30,743 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `hmBtn`, `rmBtn`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale` … 외 4개 |
| 31,046 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 31,066 | 각 컬럼 렌더링 | – |
| 31,086 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 31,094 | There · 성경: 상단 말씀이 켜졌을 때만 (_gnbExtrasSync) | – |
| 31,097 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 31,110 | 3단 주간뷰 패널 | – |
| 31,134 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 31,173 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 31,303 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 31,388 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn` … 외 3개 |
| 32,130 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 32,131 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 32,154 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 32,208 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 32,336 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount` |
| 32,348 | Even Deeper 는 **개발자 계정에만** 보인다 (v26-0922-17, HB) | `_evenOn`, `_syncEvenVisibility`, `_syncDevVerBadge`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge` … 외 10개 |
| 32,601 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 32,637 | 개발자 쪽지 (설정창 계정탭) | – |
| 32,649 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 33,042 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass` |
| 33,253 | 하위·메모: 자료 다루기 (순수 함수) | `_subsOf`, `_subStat`, `_subParse`, `_subSyncParent`, `want`, `_subSetAll`, `_subsCopy`, `_carryTaskExtras` |
| 33,308 | 메모 안에서 알아보는 것 (URL·전화·이메일·날짜) | `_memoScan`, `_memoDateKey`, `_memoTelDigits` |
| 33,359 | 하위·메모: 화면 | `_taskArrOf`, `_subRerender` |
| 33,372 | 줄 끝의 작은 원형 게이지 | `_subGaugeSVG`, `r`, `_subGaugeFill`, `_memoBadgeFill`, `_wireSubHandle`, `clearLp`, `_subToggleBadgeFill`, `makeSubToggleBadge`, `_attachSubMemoBadges`, `_subPrune`, `_subKey`, `_subIsOpen`, `_subToggleOpen`, `open` … 외 2개 |
| 33,504 | 하위 할일 판 | `makeSubPanel`, `_makeSubRow`, `clearLp`, `_makeSubGhost`, `fit`, `commit`, `_subAdd`, `_subRemove` |
| 33,674 | 하위 줄 메뉴 (위로 · 아래로 · 꺼내기 · 삭제) | `openSubRowMenu`, `row`, `closeSubRowMenu`, `_subMoveFromMenu`, `_subRemoveFromMenu`, `_subPromoteFromMenu`, `openTaskMemo`, `closeTaskMemo`, `toggleTaskMemoEdit`, `_memoItem`, `_memoSaveEdit`, `_memoRender`, `_memoViewHTML` |
| 33,848 | 알아본 것을 눌렀을 때의 동작 메뉴 | `openMemoActMenu`, `row`, `closeMemoActMenu`, `_memoCopyText`, `memoActRun`, `_memoMoveTaskToDate`, `_memoSaveToPhone`, `name`, `openContactsModalWith`, `set` |
| 34,030 | 할일 메뉴의 두 줄 ('하위 할일' · '메모') | `openSubsFromMenu`, `openMemoFromMenu`, `makeBigWrap`, `getCarryCount`, `_playDoneFx`, `style`, `_fxGlow`, `_fxRipple`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `_makeUrgentBadgeHTML`, `makeBigItem` … 외 12개 |
| 34,761 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 34,766 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 34,814 | Desktop: right-click → task move context menu | – |
| 34,822 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 35,027 | Hold off the browser's scroll gesture WHILE the long-press | – |
| 35,055 | 더블탭 = 중요 표시 토글, 트리플탭 = 긴급 표시 토글 | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 35,118 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 35,133 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 35,186 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 35,549 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 35,888 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 35,955 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 36,103 | While editing a big/small task's text | – |
| 36,132 | Not editing text: arrow-key driven selection | – |
| 36,163 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `_kbWOn`, `_kbWEls`, `_kbWName`, `_kbWSync`, `_kbWSet`, `_kbWStep`, `_kbWGo`, `_kbWPage`, `_kbWEnter` |
| 36,335 | 할일 다루기 | `_kbSelItems`, `_kbAnchor`, `_kbSecId`, `_kbToggleDone`, `_kbReactivate`, `_kbDelete`, `_kbOneSel`, `arr`, `_b7TaskKey` |
| 36,435 | 들어오는 문 | `_b7KbReady`, `_b7BoardKey` |
| 36,458 | 위젯 포커스를 잡은 동안 | – |
| 36,473 | 포커스를 잡기 전 — 여기서만 새 글쇠를 받는다 | `_kbWHint`, `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 36,733 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 36,810 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 36,884 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 36,985 | Event add modal | `syncRollDisplays` |
| 37,013 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 37,280 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 37,347 | Touch | – |
| 37,379 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `_taskPriorityRank`, `_reorderTaskPriority`, `_taskFlipRender`, `_doToggleFlag` |
| 37,669 | 긴급 표시 스포트라이트 | `_applyUrgentSpotlight`, `_ensureUrgentSpotlightObserver`, `_urgentItemsOn`, `_clearUrgentOnDone`, `_doToggleUrgent`, `toggleTaskUrgent`, `toggleUrgentRank`, `toggleTaskContact`, `_repBadgeFill`, `body`, `_taskRepDefault`, `_taskRepWeekly`, `_repKindOf`, `_taskRepFallback` … 외 5개 |
| 37,909 | 옛 자료 옮겨심기 | `_migrateTaskRepeats` |
| 37,943 | 그 날짜의 실체 만들기 | `materializeRepeatsFor`, `ensureDailyRepeats`, `ensureRepeatsForView` |
| 37,985 | 보여주기용 앞날 미리보기 (저장하지 않는다) | `getDisplayTasks`, `own` |
| 38,009 | 매일/매주 반복 켜고 끄기 | `toggleDailyRepeat`, `toggleWeeklyRepeat`, `_taskSetRepeat`, `_repScopeAsk`, `kindWord`, `verb`, `closeRepScope`, `_repScopePick` |
| 38,119 | 묶음을 훑어 지우기 | `_repPurgeTasks`, `_repPurgeEvents`, `_repAddEx`, `_repHiddenOn` |
| 38,173 | 일정의 원본 찾기 | `_evRepRootOf`, `_evInSeries` |
| 38,193 | 규칙을 물려줄 때 끝날·뺀 날은 잃지 않는다 | `_repKeepMarks`, `_evEditApply`, `putOverride`, `_evDeleteApply`, `_taskDeleteAt`, `arr`, `_taskDeleteApply`, `arr`, `_taskTextCommit`, `arr`, `_taskTextApply`, `arr`, `_dayKeyAfter`, `_movedTaskCopy` … 외 18개 |
| 38,701 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_dayTaskSecs`, `_fillTaskMenuCounts`, `_secPickOn`, `_daySecTasks`, `_secPickSecs`, `_secPickSpecFor`, `_secPickFloat`, `_secPickRender`, `_secPickOpen`, `_secPickOpenFromRow` … 외 28개 |
| 39,478 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 39,994 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 40,098 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 16개 |
| 40,670 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 40,671 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 40,743 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 41,024 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 41,205 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 41,359 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 41,456 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 41,531 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 41,588 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 41,677 | Backup / restore | – |
| 41,678 | 백업에 담는 '말씀 쪽' (v26-0921-8, HB 4-5) | `_myProductSettings`, `_backupPayload`, `sw`, `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 41,864 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 42,011 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 42,016 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 42,038 | 진단 기록 보조 저장소 (localStorage) | – |
| 42,042 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 42,620 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 42,652 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 42,759 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 42,775 | Day-change catch-up on wake | – |
| 42,826 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 43,001 | 말씀 모음 동기화 결과 화면 (v26-0913) | `_escHtml`, `showSyncResultModal`, `totalChg` |
| 43,078 | 영상 링크가 없는 설교 (v26-1005-1, HB) | `_syncNoVideoHTML`, `a` |
| 43,104 | "새로 들어온 말씀을 목록에 포함시키기" (v26-0916-2, HB) | `_syncIncludeInit`, `total`, `_syncGoBtn`, `syncIncludeOpenFull`, `list`, `_syncIncludeRender`, `bub`, `syncIncludeNow`, `syncIncludeUndo`, `_syncCatWeight`, `_syncGroupWeight`, `w`, `closeSyncResultModal` |
| 43,234 | 따로 포함한 목록 (v26-0916-2, HB) | `openPlusList`, `closePlusList`, `setPlusTab`, `_plusAfterChange`, `plusRemoveKeys`, `plusRemoveCat`, `plusRemoveTopic`, `plusClearAll`, `renderPlusList`, `addRow` |
| 43,349 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 43,444 | 푸시 배관(토큰) 공용 | – |
| 43,455 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 43,566 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 43,594 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 43,628 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 43,639 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 43,670 | 알림 테스트 | `testLocalNotification`, `sendTestPush` |
| 43,702 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_upTries`, `_upSetTries`, `_upClearTries`, `_upReloadFresh`, `_upSafeNow`, `_upApply`, `_upCheck`, `_fbSyncReady`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage` … 외 1개 |
| 43,908 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 43,987 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay` |
| 44,156 | 긴급 표시 한도(하루 2개)를 병합 뒤에도 지킨다 (v26-0914-3) | `_mgEnforceUrgentCap`, `_mgById`, `_fbHasAdoptedCloud`, `_fbCountArrays`, `_fbCountByKind`, `_fbCountItems`, `_fbBulkLoss`, `_fbMergeGuarded`, `_fbMerge`, `_dfJ`, `_dfSame`, `_dfCut`, `_dfQ`, `_dfDay` … 외 7개 |
| 44,405 | 안쪽 이름표를 사람 말로 | `_dfSeg`, `_dfSegPath`, `_dfWord`, `_dfValS`, `_dfVal` |
| 44,463 | 값 두 벌에서 **다른 자리만** 뽑는다 | `_dfDeep`, `_dfDeepLines`, `_dfKindName`, `_dfToday`, `_dfPush` |
| 44,500 | 할일 한 구간(배열) | `_dfTaskKey`, `_dfArr` |
| 44,549 | 날짜별 할일·일정 | `_dfDays`, `A` |
| 44,567 | 말씀 모음 하나 | `_dfVKey`, `_dfColl1`, `_dfColls` |
| 44,593 | 연락처 하나 | `_dfContact1`, `_dfContacts` |
| 44,606 | 기록(암송·좋아요·담아두기·나눔·Deeper) | `_dfLogRefs`, `_dfLogs` |
| 44,635 | 설정 | `_dfSettings`, `A` |
| 44,650 | 본체 — 상태 a(이전) 에서 b(이후) 로 무엇이 달라졌나 | `_dfDiff`, `_dfBrief`, `_dfScale`, `k`, `days`, `_dfScaleText`, `_cfJ`, `_cfDiffer`, `_cfId`, `_cfSecLabel`, `_cfKindLabel`, `_cfText`, `_cfMake`, `_cfScanSection` … 외 11개 |
| 45,004 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal` |
| 45,034 | Sweeter 에서는 '말씀 쪽' 충돌만 보여 준다 (v26-0921-8, HB 4-5) | `_cfMine`, `_cfOpen`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 45,133 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfNiceLabel`, `_cfGroupName`, `_cfChoiceLabel`, `_cfCutRaw`, `_cfExplain`, `cfToggleRaw`, `_cfBaseLine`, `_cfCardHTML`, `auto`, `laterLocal`, `side` … 외 12개 |
| 45,512 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 45,686 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `_abLocalState`, `_abRankLabel`, `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn`, `_swBoardOn` |
| 46,104 | 2차 (v26-0922-2, HB) | – |
| 46,115 | 3차 (v26-0922-3, HB) — 시트의 '상황 태그'·'묵상 질문' 에서 나온다 | – |
| 46,123 | 비었을 때의 안내는 **보는 사람에 따라 달라야 한다** (v26-0923-2) | `_swWin`, `roll`, `_swInWin`, `_swPool`, `_swRecIn`, `_swEmptyText`, `who` |
| 46,213 | 담아두기 | `getKeepLog` |
| 46,226 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 46,296 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 46,491 | 저장 | `_swTilesRaw`, `_swVerRaw`, `_swLoadTiles`, `_swSaveTiles`, `_swSpareKinds` |
| 46,543 | BLOCK7 에서 내 말씀 가져오기 | `_swCountVerses`, `_swBlock7Src`, `_swImportApply`, `swImportFromBlock7`, `_swSyncNotice` |
| 46,640 | 말씀 모음 타일 | `_swColls`, `a` |
| 46,664 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermonPool`, `_swSermons`, `_swSermonVerses`, `_swBooks`, `_swTags`, `_swEvenOn`, `_swReacts` |
| 46,790 | 까닭 한 줄 (v26-0922-1, HB 2번 선택) | `_swAgo`, `_swLastTouch`, `add`, `_swWhyOf`, `key` |
| 46,849 | 오늘의 말씀 (표지 카드) | `_swToday`, `_swAxisKeys`, `_swCount`, `_swFlow`, `_swMyWeight`, `_swMD` |
| 46,945 | 기간 안의 흐름 (v26-1005-5, HB) | `_swSvcKey`, `_swInsightsWin`, `push`, `_swInsights`, `push`, `_swVersesForInsight`, `_swRhythmGrid`, `_swRhythm`, `_swSigRhythm` |
| 47,171 | 상황 태그를 **말투로** 바꾼다 (v26-0922-4 → -5 에서 전면 손질, HB) | `_swNeedSkip`, `_swNeedSay`, `bat`, `_swNeeds`, `_swAsks`, `_swValues`, `_swStrip`, `_swCountText` |
| 47,557 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swHandFont`, `day`, `_swHiText`, `_swHiHTML`, `_swLoadPhotos`, `_swPhotoPick`, `_swPhotoFor`, `_swPhotoHTML`, `_swIllHTML`, `_swBigHTML`, `_swSigWrap` … 외 6개 |
| 47,855 | 유튜브 썸네일 (v26-0922-10, HB: "타일 위아래가 비어서 안 이뻐") | `_swYtThumbFail`, `_swCellHTML` |
| 47,979 | 타일마다 바탕 사진 켜고 끄기 (v26-0922-13, HB) | `_swPhIcon`, `_swPhOn`, `_swEditBtns`, `_swTogglePhoto`, `_swArrowHTML`, `_swThereHTML`, `_swFace`, `chip`, `_swOffTileEl` |
| 48,094 | 그리기 | `_swTileClass` |
| 48,099 | 첫 그림에 쓸 말씀을 미리 뽑아 둔다 (v26-0922-21, HB) | `_swSaveBootVerses`, `_swIntroSpan`, `_swRender` |
| 48,195 | 편집 모드 | `_swEditOn`, `_swEditBtnSync`, `mine`, `board`, `swOpenCollFilter`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `w`, `_swNoMotion`, `_swTrack`, `_swTrackTo` |
| 48,304 | 한 칸 넘기기 (PC 꺽쇠·자판이 쓴다) | `_swStep`, `_swRepaint` |
| 48,331 | 누르면 전체화면 | `_swOpenVerse`, `_swGridTile`, `facet`, `_swVersesFor`, `_swTileOpen`, `md`, `label` |
| 48,446 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 48,478 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swDragHover` |
| 48,528 | 판 끝에 닿으면 저절로 굴러간다 (v26-0922-15, HB) | `_swAutoScroll`, `_swAutoStop`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap`, `_swKbTiles`, `_swKbSync`, `_swKbSet`, `_swKbStep`, `_swKbGo`, `_swKbGoX`, `_swKbPage`, `_swKbSort` … 외 5개 |
| 49,062 | 자판 단축키 도움말 | `_swKbHelpOpen`, `_kbHelpRows`, `sw`, `_swKbHelpFill`, `_kbHelpKey`, `openSwKbHelp`, `closeSwKbHelp` |
| 49,176 | 형제 앱 열기 (v26-0921-2, HB) | `_sisterApp`, `dev`, `cross`, `_sisterFill`, `swCrossToggle`, `_swCrossBtnSync`, `_sisterStandalone`, `_sisterIsIOS`, `sisterGo`, `_swBoot` |
| 49,284 | Sweeter 설정창 '계정' 탭 (v26-0921-8, HB 4-5) | `_swMergeAccountTab` |
| 49,308 | Sweeter 설정창 '뷰' 탭 병합 (v26-0921-8, HB 4-4) | `_swFillMovedRows`, `_swMergeViewTab`, `_swCoverOn`, `_swMount` |
| 49,376 | 좌상단 로고 — BLOCK7 과 **같은 손버릇**이다 (v26-0921-1, HB) | – |
| 49,386 | 우상단 톱니 — 탭 = 말씀 설정 · 롱터치 = 일반 설정 | – |
| 49,397 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_abLocalState`  `_abRankLabel`  `_activeVersesFrom`  `_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`
`_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`  `_applySermonListSheet`  `_applySneakMaxW`  `_applyUrgentSpotlight`
`_attachRepeatButtons`  `_attachSecPickLongPress`  `_attachSubMemoBadges`  `_attachTextPinch`  `_attachVliMenus`  `_attachWeeklyPaneDrag`
`_avgHex`  `_b7BoardKey`  `_b7KbReady`  `_b7TaskKey`  `_backupDownload`  `_backupPayload`
`_bibleChapters`  `_bibleRankOfRef`  `_bibleShort`  `_bookAbbr`  `_bookCanon`  `_bookNorm`
`_bookOfRef`  `_bookSel`  `_booksOf`  `_brActiveWin`  `_brApplyLook`  `_brBind`
`_brBook`  `_brBooks`  `_brBusy`  `_brCharAt`  `_brCharRect`  `_brChrome`
`_brChromeApply`  `_brChVerses`  `_brCloseSheets`  `_brCopy`  `_brCopyFallback`  `_brCopyText`
`_brDashRender`  `_brDashRows`  `_brDashStart`  `_brDashStats`  `_brDate`  `_brDev`
`_brEl`  `_brEsc`  `_brFetchJSON`  `_brFindWords`  `_brFmtMin`  `_brFmtRef`
`_brGet`  `_brHistHide`  `_brHistory`  `_brInkAdd`  `_brInkBlob`  `_brInkCut`
`_brInkDo`  `_brInkDot`  `_brInkErase`  `_brInkHeart`  `_brInkHitAt`  `_brInkHits`
`_brInkHl`  `_brInkIcon`  `_brInkId`  `_brInkInside`  `_brInkOpen`  `_brInkOrigin`
`_brInkPaint`  `_brInkPref`  `_brInkPrefSet`  `_brInkQuery`  `_brInkRefresh`  `_brInkRot`
`_brInkSpans`  `_brInkSpansFrom`  `_brInkStepPos`  `_brInkStroke`  `_brInkSym`  `_brInkSymParts`
`_brInkSync`  `_brInkTx`  `_brInkUl`  `_brIsOpen`  `_brKey`  `_brListDelete`
`_brLoadSerif`  `_brLoupe`  `_brMatch`  `_brMigrateNotes`  `_brNotesAt`  `_brNoteSave`
`_brOnScroll`  `_brOpenAct`  `_brOpenDash`  `_brOpenMemo`  `_brOpenSheet`  `_brParseRef`
`_brPosGet`  `_brPosSet`  `_brProgSync`  `_brRangeOf`  `_brReadAdd`  `_brReadMs`
`_brRecent`  `_brRenderList`  `_brRenderPick`  `_brRerender`  `_brRow`  `_brRowGone`
`_brRunFind`  `_brS`  `_brSeenOf`  `_brSessEnd`  `_brSessStart`  `_brSessStep`
`_brSet`  `_brSetMark`  `_brShow`  `_brSpanLines`  `_brStep`  `_brSwipeBind`
`_brSyncAa`  `_brSyncScope`  `_brToast`  `_brTxIdx`  `_brTxNode`  `_brTxOf`
`_brUnit`  `_brUnpark`  `_brUrl`  `_brVerseList`  `_brVerseObj`  `_brViewRef`
`_brVmClose`  `_brVmOpen`  `_brVmRun`  `_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`
`_buildShareText`  `_bump`  `_bumpVerseStat`  `_calKey`  `_cardActionCount`  `_cardGrain`
`_cardTextLS`  `_carryDateInScope`  `_carryPendingCount`  `_carryScope`  `_carryTaskExtras`  `_ceFillSelects`
`_cellDefaultSec`  `_ceMakeRow`  `_ceSortedIdx`  `_ceToggleTrashSel`  `_ceUpdateDeleteBtn`  `_ceUpdateRestoreBtn`
`_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfApply`  `_cfBaseLine`  `_cfCanMerge`  `_cfCardHTML`
`_cfChoiceLabel`  `_cfClearSel`  `_cfCutRaw`  `_cfDetect`  `_cfDiffer`  `_cfEsc`
`_cfExplain`  `_cfFetchCloud`  `_cfGroupName`  `_cfHasSel`  `_cfId`  `_cfJ`
`_cfKindLabel`  `_cfLoadLocal`  `_cfMake`  `_cfMine`  `_cfNiceLabel`  `_cfOpen`
`_cfOpenCount`  `_cfPushCloud`  `_cfSaveLocal`  `_cfScanById`  `_cfScanKeys`  `_cfScanSection`
`_cfSecLabel`  `_cfSelKey`  `_cfShrink`  `_cfSortKey`  `_cfStore`  `_cfSyncVisibility`
`_cfText`  `_cfTrimmed`  `_cfUnion`  `_cfWhoLabel`  `_chk`  `_clearPendingVerse`
`_clearUrgentOnDone`  `_closeHdrCalendarNow`  `_colKey`  `_collFilteredVerses`  `_collHue`  `_collIsProp`
`_collLabel`  `_collPeriodPass`  `_collPeriodVerses`  `_collRawVerses`  `_collVersePassesFilter`  `_collVersePassesOnly`
`_collVerseShows`  `_copyTextFallback`  `_crossSwipeAllowed`  `_currentColl`  `_currentSecId`  `_dataURLtoBlob`
`_datePickArmed`  `_dayHasContent`  `_dayKeyAfter`  `_dayKeyBefore`  `_dayKeyDiff`  `_dayLabel`
`_daySecTasks`  `_dayTaskCount`  `_dayTaskSecs`  `_desat`  `_devAttachSwipe`  `_devCompressFile`
`_devFilesHTML`  `_deviceBaseW`  `_deviceId`  `_deviceLabel`  `_devInboxButton`  `_devMarkRead`
`_devMigrateRead`  `_devNotifOn`  `_devNotifSet`  `_devReadIds`  `_devReadLocal`  `_devShortSide`
`_devTrashGet`  `_devTrashSet`  `_devWhen`  `_devWhenTxt`  `_dfAgo`  `_dfArr`
`_dfBrief`  `_dfColl1`  `_dfColls`  `_dfContact1`  `_dfContacts`  `_dfCut`
`_dfDay`  `_dfDays`  `_dfDeep`  `_dfDeepLines`  `_dfDiff`  `_dfFieldLabel`
`_dfJ`  `_dfJosa`  `_dfKindName`  `_dfLogRefs`  `_dfLogs`  `_dfPush`
`_dfQ`  `_dfRo`  `_dfSame`  `_dfScale`  `_dfScaleText`  `_dfSeg`
`_dfSegPath`  `_dfSetLabel`  `_dfSettings`  `_dfTaskKey`  `_dfToday`  `_dfVal`
`_dfValS`  `_dfVKey`  `_dfWhen`  `_dfWord`  `_dismissReactToast`  `_dismissToast`
`_dlog`  `_dlogScroll`  `_dNavEl`  `_doCarry`  `_doToggleFlag`  `_doToggleUrgent`
`_dragZoneMid`  `_dropStalePending`  `_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`
`_dsWrite`  `_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`  `_ensureUrgentSpotlightObserver`  `_entrySecId`
`_escHtml`  `_escShown`  `_euroRo`  `_evDeleteApply`  `_evEditApply`  `_evenDeeperShortRef`
`_evenOn`  `_evFillMins`  `_evInSeries`  `_evMarkDropSec`  `_evMoveToSec`  `_evRepRootOf`
`_evSecAt`  `_evSyncRange`  `_fallbackCopy`  `_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`
`_fbBulkLoss`  `_fbClearBase`  `_fbCollectConflicts`  `_fbCommit`  `_fbCountArrays`  `_fbCountByKind`
`_fbCountItems`  `_fbDeviceIdle`  `_fbEnsureSync`  `_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`
`_fbIsUserEdit`  `_fbLoadPersistedBase`  `_fbMaybeSelfUpdate`  `_fbMerge`  `_fbMergeGuarded`  `_fbNoteConflicts`
`_fbReady`  `_fbScheduleRetry`  `_fbSetBase`  `_fbSyncReady`  `_fbVerIsOlder`  `_fbWarnLegacyWriter`
`_fbWriteBackup`  `_fetchSheetCsv`  `_fetchVerseStat`  `_fillMinOptions`  `_fillTaskMenuCounts`  `_fillVerseBarDOM`
`_findVerseByRefLoose`  `_flashPendingTask`  `_flashSettingsTab`  `_flatMemEntries`  `_flatSimpleEntries`  `_fmtRefForText`
`_fmtSubDate`  `_freshTaskCopy`  `_fxGlow`  `_fxRipple`  `_genCollId`  `_generateUniqueShareCode`
`_getCollFilter`  `_ghostDragStart`  `_gnbExtrasSync`  `_gnbPickerOn`  `_gnbPickerStep`  `_gnbRpMenu`
`_groupVersesBy`  `_groupVersesByMulti`  `_grpAddrPreview`  `_grpAddrShow`  `_grpAddrUrl`  `_grpFetch`
`_grpNameNorm`  `_grpNameValid`  `_grpRenderColls`  `_grpShowAddr`  `_grpSync`  `_gSrcId`
`_hdrCalRender`  `_hexNum`  `_hiAssign`  `_hiBold`  `_hiFw`  `_hiHash`
`_hiHTML`  `_hiKindsOn`  `_hiLinesHTML`  `_hiOn`  `_hiOverlap`  `_hiOverlay`
`_hiPen`  `_hiPhrases`  `_hiPickAt`  `_hiRanges`  `_hiRefreshAll`  `_hiRibbon`
`_hiRng`  `_hiShuffle`  `_hiSmooth`  `_hiSquash`  `_hiStar`  `_hiStarMax`
`_hiStarPoly`  `_hiWave`  `_hiWavePoly`  `_hiWob`  `_idbDel`  `_idbDelOutcome`
`_idbDelRaw`  `_idbForget`  `_idbGet`  `_idbGetOutcome`  `_idbGetRaw`  `_idbOpen`
`_idbRaw`  `_idbSet`  `_idbSetOutcome`  `_idbSetRaw`  `_importVerseRows`  `_initEdgeBack`
`_initHdrDateLongPress`  `_initSettingsSwipe`  `_initSneakMaxWPicker`  `_initVDashDetailSwipe`  `_initVerseAlarmPicker`  `_initVerseBandDrag`
`_initVerseBarResize`  `_initVerseBarSwipe`  `_initVerseFullGestures`  `_initVerseGridGestures`  `_initVerseNotifBridge`  `_initVerseSettingsSwipe`
`_initVfCatSheet`  `_invalidateVerseCaches`  `_isDevAccount`  `_isPhoneForm`  `_isPropSheet`  `_isReactPid`
`_isRepRoot`  `_isSermonListSheet`  `_isTouchDevice`  `_joinApply`  `_joinClear`  `_joinFromPath`
`_joinRead`  `_kbAnchor`  `_kbDelete`  `_kbHelpKey`  `_kbHelpRows`  `_kbOneSel`
`_kbOverlayOpen`  `_kbReactivate`  `_kbSecId`  `_kbSelItems`  `_kbToggleDone`  `_kbWEls`
`_kbWEnter`  `_kbWGo`  `_kbWHint`  `_kbWName`  `_kbWOn`  `_kbWPage`
`_kbWSet`  `_kbWStep`  `_kbWSync`  `_keepAfterChange`  `_keepAttr`  `_keepBindDrag`
`_keepDeleteList`  `_keepEntries`  `_keepFlipRender`  `_keepListOf`  `_keepLists`  `_keepListsOf`
`_keepNameCommit`  `_keepNameKey`  `_keepOrder`  `_keepPairSort`  `_keepRenameList`  `_keepRepaintLists`
`_keepSetOrder`  `_keepSort`  `_keepSortLists`  `_keepSortRowHTML`  `_keepSwitchIsOpen`  `_lay`
`_layApplyWidths`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`  `_layMode`  `_loadSheetJs`
`_localOwner`  `_logoMenuEsc`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_looksLikeRef`
`_lord`  `_lsk`  `_lvApplyIn`  `_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`
`_makeSubGhost`  `_makeSubRow`  `_makeTimeRollPair`  `_makeUrgentBadgeHTML`  `_makeWMViewBtnsHTML`  `_memoBadgeFill`
`_memoCopyText`  `_memoDateKey`  `_memoItem`  `_memoMoveTaskToDate`  `_memoRender`  `_memoSaveEdit`
`_memoSaveToPhone`  `_memoScan`  `_memoTelDigits`  `_memoViewHTML`  `_menuArmOnNextPress`  `_menuFitHeight`
`_menuLockScroll`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`  `_mgEnforceUrgentCap`
`_mgEntryArray`  `_mgLogFlat`  `_mgLogNested`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`
`_migrateTaskRepeats`  `_moveDateToastMsg`  `_movedTaskCopy`  `_moveLabel`  `_mviewEventCountsHTML`  `_mviewRowHTML`
`_myProductSettings`  `_newRid`  `_noiseTile`  `_notifAckToSW`  `_notifAnnounceReady`  `_notifAuthBlocking`
`_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`  `_notifLog`  `_notifLogLSPush`
`_notifLogLSRead`  `_notifLogRead`  `_notifMark`  `_notifNewId`  `_notifPid`  `_notifSameRef`
`_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`  `_notifStop`  `_notifTakeIntent`
`_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`  `_openCellEvent`  `_openCellEventRepaint`
`_openCellTodo`  `_openGhostInput`  `_openPropDeeper`  `_openVerseByRef`  `_openVerseFromLink`  `_outcomeText`
`_parseCsv`  `_parseVDate`  `_playDoneFx`  `_plusAdd`  `_plusAfterChange`  `_plusGroups`
`_plusHas`  `_plusHiddenKeys`  `_plusKeyOf`  `_plusPrune`  `_plusTidy`  `_plusVerses`
`_plusVisibleMask`  `_populateMorningTimePickers`  `_propBooks`  `_propHiList`  `_propHiPick`  `_propImg`
`_propRefs`  `_propRowsToItems`  `_propSits`  `_propYt`  `_psIsDefault`  `_psOverlay`
`_psProject`  `_PT_FAMS`  `_ptAvailW`  `_ptBag`  `_ptCutPoint`  `_ptCutTitle`
`_ptDrawnLines`  `_ptEnsureFont`  `_ptFont`  `_ptFontFor`  `_ptFontLoaded`  `_ptFontPending`
`_ptFontsOn`  `_ptGlued`  `_ptGroupInit`  `_ptLen`  `_ptLineK`  `_ptLinkGoogle`
`_ptMissing`  `_ptMotionOn`  `_ptPaint`  `_ptPickMotion`  `_ptPreloadVerse`  `_ptRelines`
`_ptSample`  `_ptSplitOnce`  `_ptStillTrying`  `_ptSyncFontUI`  `_ptSyncMotionUI`  `_ptWarmup`
`_ptWrapTitle`  `_publishSharedColl`  `_pushKey`  `_pushKeyPid`  `_reactKey`  `_reactKeyParts`
`_reactWithToast`  `_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`  `_refKey`
`_refNorm`  `_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`  `_renderKeepPicker`  `_renderKeepSubMenu`
`_renderKeepSwitch`  `_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`  `_renderPickerInto`  `_renderSecPick`
`_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`  `_renderVAggBody`  `_renderVerseUiLevelIcons`
`_renderVfSecAssign`  `_renderVfThemeChips`  `_reorderTaskPriority`  `_rep2`  `_repAddEx`  `_repBadgeFill`
`_repBlocked`  `_repEx`  `_repHiddenOn`  `_repKeepMarks`  `_repKindOf`  `_repPurgeEvents`
`_repPurgeTasks`  `_repRule`  `_repScopeAsk`  `_repScopePick`  `_repUntil`  `_rewriteLogRefs`
`_rgba`  `_ridPresentOn`  `_rollFit`  `_rollHTML`  `_rollIdx`  `_rollNoTr`
`_rollSecLabel`  `_rollShow`  `_rollStart`  `_rollTick`  `_rowsToItems`  `_rpAddBtnHTML`
`_rpAttachChipDrag`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`  `_rpAttachVResize`  `_rpChipName`  `_rpCurrentRatio`
`_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`  `_rpMonthOf`  `_rpNormMonth`  `_rpSetMGridH`
`_rpSetVCardH`  `_rpSetVListH`  `_rpTypeOk`  `_rpVCardH`  `_rpVListH`  `_rpWidgetHTML`
`_rpWidgetName`  `_secArchiveApply`  `_secArchiveCapture`  `_secBoundaryChoices`  `_secDataCount`  `_secFirstBoundary`
`_secIdForTime`  `_secIdNowAll`  `_secIsCustom`  `_secLenMin`  `_secMoveTo`  `_secNormalizeTimes`
`_secNoTime`  `_secOffsets`  `_secPickBack`  `_secPickCancelClose`  `_secPickChoose`  `_secPickFloat`
`_secPickOn`  `_secPickOpen`  `_secPickOpenFromRow`  `_secPickRender`  `_secPickScheduleClose`  `_secPickSecs`
`_secPickSpecFor`  `_secsCommit`  `_secStripData`  `_secTimeChoices`  `_secWouldEmptyDay`  `_sermonCatNorm`
`_sermonListMap`  `_sermonNoVideo`  `_sermonYtFor`  `_setLocalOwner`  `_shareCopy`  `_sharedVerseIn`
`_sharedVerseOut`  `_shareFileName`  `_shareMessage`  `_shareResetBigText`  `_shareSizeKey`  `_sheetCopyPending`
`_sheetCsvEndpoints`  `_sheetDrag`  `_sheetDragBindSettings`  `_sheetGo`  `_sheetRowsSane`  `_sheetUrlForVerse`
`_shotDraw`  `_shotFont`  `_sisterApp`  `_sisterFill`  `_sisterIsIOS`  `_sisterStandalone`
`_sneakMaxW`  `_sneakMaxWDefault`  `_sortEventsKeepingTimeless`  `_sortGroups`  `_stabList`  `_statDocKey`
`_statRefKey`  `_subAdd`  `_subFocusGhost`  `_subGaugeFill`  `_subGaugeSVG`  `_subGhostId`
`_subIsOpen`  `_subKey`  `_subMoveFromMenu`  `_subParse`  `_subPromoteFromMenu`  `_subPrune`
`_subRemove`  `_subRemoveFromMenu`  `_subRerender`  `_subsCopy`  `_subscribeShared`  `_subSetAll`
`_subsOf`  `_subStat`  `_subSyncParent`  `_subToggleBadgeFill`  `_subToggleOpen`  `_swAddTile`
`_swAgo`  `_swArrowHTML`  `_swArtHTML`  `_swAsks`  `_swAutoScroll`  `_swAutoStop`
`_swAxisKeys`  `_swBigHTML`  `_swBlock7Src`  `_swBoardKey`  `_swBoardOn`  `_swBooks`
`_swBoot`  `_swBootOff`  `_swCellHTML`  `_swColls`  `_swCount`  `_swCountText`
`_swCountVerses`  `_swCoverOn`  `_swCrossBtnSync`  `_swDragHole`  `_swDragHoleOff`  `_swDragHover`
`_swDragMove`  `_swDragStart`  `_swEditBtns`  `_swEditBtnSync`  `_swEditOn`  `_swEmptyText`
`_swEsc`  `_swEvenOn`  `_swFace`  `_swFillMovedRows`  `_swFinishSwipe`  `_swFlow`
`_swGridTile`  `_swHandFont`  `_swHiHTML`  `_swHiText`  `_swIllHTML`  `_swImportApply`
`_swInitGestures`  `_swInsights`  `_swInsightsWin`  `_swIntroSpan`  `_swInWin`  `_swIsKept`
`_swKbGo`  `_swKbGoX`  `_swKbHelpFill`  `_swKbHelpOpen`  `_swKbHint`  `_swKbKeep`
`_swKbMove`  `_swKbPage`  `_swKbReady`  `_swKbSet`  `_swKbSort`  `_swKbStep`
`_swKbSync`  `_swKbTiles`  `_swKeeps`  `_swKillTile`  `_swLastTouch`  `_swLastVerses`
`_swLoadPhotos`  `_swLoadTiles`  `_swMD`  `_swMergeAccountTab`  `_swMergeViewTab`  `_swMount`
`_swMyWeight`  `_swNeeds`  `_swNeedSay`  `_swNeedSkip`  `_swNoMotion`  `_swOffTileEl`
`_swOn`  `_swOpenVerse`  `_swPhIcon`  `_swPhOn`  `_swPhotoFor`  `_swPhotoHTML`
`_swPhotoPick`  `_swPipsHTML`  `_swPool`  `_swReacts`  `_swRecIn`  `_swRender`
`_swReorder`  `_swRepaint`  `_swRepaintKeepTiles`  `_swRhythm`  `_swRhythmGrid`  `_swSaveBootVerses`
`_swSaveTiles`  `_swSermonPool`  `_swSermons`  `_swSermonVerses`  `_swSigBook`  `_swSigColl`
`_swSigHTML`  `_swSigReact`  `_swSigRhythm`  `_swSigSermon`  `_swSigTag`  `_swSigWrap`
`_swSizeCells`  `_swSnap`  `_swSpareKinds`  `_swStep`  `_swStrip`  `_swSvcKey`
`_swSyncNotice`  `_swTags`  `_swThereHTML`  `_swTileClass`  `_swTileOpen`  `_swTilesRaw`
`_swToday`  `_swTogglePhoto`  `_swTrack`  `_swTrackTo`  `_swValues`  `_swVerRaw`
`_swVersesFor`  `_swVersesForInsight`  `_swWhyOf`  `_swWin`  `_swYtThumbFail`  `_syncBpPickers`
`_syncCarryScopeBtns`  `_syncCatWeight`  `_syncCollSheets`  `_syncCondRows`  `_syncDeeperOpenUI`  `_syncDeviceNotifyUI`
`_syncDevInboxVisibility`  `_syncDevVerBadge`  `_syncEventDateUI`  `_syncEvenVisibility`  `_syncGoBtn`  `_syncGroupWeight`
`_syncHdrDateOptical`  `_syncHiOverlapRow`  `_syncHiUI`  `_syncIncludeInit`  `_syncIncludeRender`  `_syncLayFormUI`
`_syncLinkOpenModeUI`  `_syncNoVideoHTML`  `_syncShareSettingsUI`  `_syncShareSizeUI`  `_syncSheetVersesIntoColl`  `_syncTimeStepBtns`
`_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVerseFp`  `_syncVersePushPool`  `_syncVersePushUI`  `_syncVfTextScaleUI`
`_syncVpTimeField`  `_syncVpTimeList`  `_t2m`  `_tagartAliasMap`  `_tagartDrawOn`  `_tagartHay`
`_tagartHit`  `_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`
`_taskArrOf`  `_taskDeleteApply`  `_taskDeleteAt`  `_taskFlipRender`  `_taskPriorityRank`  `_taskRepDefault`
`_taskRepFallback`  `_taskRepInstances`  `_taskRepRootOf`  `_taskRepRoots`  `_taskRepWeekly`  `_taskSetRepeat`
`_taskTextApply`  `_taskTextCommit`  `_tfApplyTheme`  `_tfBuildSprites`  `_tfDevKind`  `_tfDrawCross`
`_tfFrame`  `_tfGet`  `_tfHex2Hsl`  `_tfHsl2Rgb`  `_tfLoad`  `_tfPick`
`_tfSize`  `_tfSpawn`  `_tfSprites`  `_tfStore`  `_tfSyncUI`  `_tfWire`
`_thAcPush`  `_thAcText`  `_thContrast`  `_thDeltaE`  `_themePreviewHTML`  `_themeSummaryText`
`_themeTokens`  `_thereBegin`  `_thereClock`  `_thereCommit`  `_thereCountFor`  `_thereDurWords`
`_thereEach`  `_thereIcHTML`  `_thereIconKey`  `_thereIconSync`  `_thereIsOpen`  `_thereRecorded`
`_thereTotalSec`  `_thFade`  `_thHex`  `_thLab`  `_thLabF`  `_thLabFi`
`_thLabRgb`  `_thLin`  `_thLum`  `_thMix`  `_thOn`  `_thPanelMix`
`_thReadable`  `_thRgb`  `_thRgba`  `_thRound`  `_thTintDE`  `_thTintK`
`_thUnlin`  `_thWorst`  `_timeStep`  `_toastWithJump`  `_toThisMonth`  `_tryCloseLogoMenu`
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
`_verseRefFromUrl`  `_verseResizeOpacity`  `_verseResizeThreshold`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`
`_vfApplyClauseRule`  `_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfApplyPropAlign`  `_vfArtRecheck`  `_vfArtSyncUI`
`_vfAtCollection`  `_vfBg1Css`  `_vfBgCss`  `_vfBottomEl`  `_vfBreakClass`  `_vfCanBreakAt`
`_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`  `_vfCycleMode`  `_vfDeeperRefs`  `_vfDemoteShortForced`
`_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`  `_vfGeException`  `_vfHeartBurst`  `_vfHideCovers`
`_vfHideCoversNow`  `_vfHomeStash`  `_vfIsHeotdoeException`  `_vfIsParallelWord`  `_vfIsProp`  `_vfIsSubject`
`_vfKeepNav`  `_vfKeepSortHead`  `_vfLayoutIfResized`  `_vfLayoutPropText`  `_vfLayoutText`  `_vfNavCommit`
`_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`  `_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`
`_vfPlaceTagArt`  `_vfPrepareNext`  `_vfPropInk`  `_vfReadWrappedLines`  `_vfRedrawPropInk`  `_vfRelayoutSoon`
`_vfRenderCard`  `_vfRenderKeepSwitch`  `_vfRenderPropTitle`  `_vfRenderRef`  `_vfRenderTagArt`  `_vfRestoreCovers`
`_vfRollProp`  `_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`  `_vfSetNav`  `_vfSetTabPool`
`_vfShareImage`  `_vfShareSizeRow`  `_vfShareText`  `_vfShortOK`  `_vfShufGo`  `_vfShufPickRandom`
`_vfShufPos`  `_vfShufPush`  `_vfShufReset`  `_vfSizePropTitle`  `_vfSkipsForced`  `_vfSyncCounts`
`_vfSyncCycleIcon`  `_vfSyncPageBg`  `_vfSyncTopBar`  `_vfTabList`  `_vfTextScale`  `_vfTheme`
`_vfTitleTileFn`  `_vfWrapFit`  `_vgApplyFilter`  `_vgAxisItems`  `_vgAxisLabel`  `_vgBookOne`
`_vgCfg`  `_vgClamp`  `_vgDate`  `_vgDepth`  `_vgDepthCounts`  `_vgEscAttr`
`_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`  `_vgFamily`  `_vgFilteredPool`
`_vgFilterLabelText`  `_vgFilterNoteHTML`  `_vgFlatPresets`  `_vgGroupKey`  `_vgGroupLabel`  `_vgHighlightTile`
`_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`  `_vgOpenFromRef`  `_vgPinchSteps`
`_vgRankOf`  `_vgRankPref`  `_vgRankRailBind`  `_vgRawPool`  `_vgReach`  `_vgRenderTabs`
`_vgRestoreHighlight`  `_vgRun`  `_vgScrollToVerse`  `_vgSeeds`  `_vgSel`  `_vgSetCols`
`_vgShortRef`  `_vgShow`  `_vgSort`  `_vgStop`  `_vgSyncExcl`  `_vgSyncFilterLabel`
`_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTab`  `_vgTileHtml`  `_vgTilePreset`  `_vgTileStyle`
`_vIdKey`  `_vlApplySort`  `_vlClearRegIdx`  `_vlDispRef`  `_vlEntriesForScope`  `_vlExtraSortFor`
`_vlHomeEntries`  `_vliCopyBody`  `_vLinkAxis`  `_vliOpenFull`  `_vliOpenFullForWidget`  `_vlIsProp`
`_vListControlsHTML`  `_vListRange`  `_vListRefresh`  `_vListRowsHTML`  `_vliVerse`  `_vlKeepEntries`
`_vlKindEntries`  `_vlPref`  `_vlReactTotals`  `_vlRegIdx`  `_vlTab`  `_vlTabsHTML`
`_vlwKey`  `_vMapCellHTML`  `_vMapChapList`  `_vMapChapMap`  `_vMapGroups`  `_vMapInk`
`_vMapLimitSet`  `_vMapMode`  `_vMapRange`  `_vMapRanks`  `_vMapShade`  `_vMapStats`
`_vMapStep`  `_vmmSyncItems`  `_vpDiagCopyFallback`  `_vpDiagFmt`  `_vpDiagHead`  `_vpEveryLabel`
`_vpFacetCandidates`  `_vpFacetRowHTML`  `_vpFiltMulti`  `_vpFiltRefSet`  `_vpGoFull`  `_vpList`
`_vpModeChipHTML`  `_vpNextTab`  `_vpOrders`  `_vpOtherAxis`  `_vpPool`  `_vpRep`
`_vpSave`  `_vpShortRef`  `_vpTabName`  `_vpToMin`  `_vpTurnOn`  `_vRhyBands`
`_vRhyKind`  `_vRhyThereSplit`  `_vsetFlashTab`  `_vsetGoColl`  `_vsetGoTab`  `_vsetRestoreBack`
`_vsetTitleSync`  `_vstabList`  `_vTrBindBand`  `_vTrBindRails`  `_vTrBucketLabel`  `_vTrBucketList`
`_vTrBucketOf`  `_vTrBucketRange`  `_vTrChapCmp`  `_vTrChapNo`  `_vTrChapterKeys`  `_vTrChartSVG`
`_vTrChipsHTML`  `_vTrData`  `_vTrDiffHTML`  `_vTrEntries`  `_vTrExclLabel`  `_vTrFindings`
`_vTrFindingsHTML`  `_vTrGeo`  `_vTrHFromX`  `_vTrInsightHTML`  `_vTrInsMax`  `_vTrInsN`
`_vTrJosaEun`  `_vTrJosaGa`  `_vTrJosaRo`  `_vTrJosaYeyo`  `_vTrNameCmp`  `_vTrNowBucket`
`_vTrNowN`  `_vTrOtherSpan`  `_vTrPref`  `_vTrRail2Bind`  `_vTrRail2HTML`  `_vTrRailBind`
`_vTrRailHTML`  `_vTrRowHTML`  `_vTrRowsOf`  `_vTrScopeKeys`  `_vTrSort`  `_vTrSortRows`
`_vTrSpan`  `_vTrSpanMode`  `_vTrSpanRowHTML`  `_vTrTheadHTML`  `_vTrUnitWord`  `_vWeeksSince`
`_vwKeepSortHTML`  `_vwScopeBindHold`  `_vwScopeOpts`  `_vwSize`  `_wireSecPickRows`  `_wireSubHandle`
`_wireTaskMenuDateRow`  `_withFullscreenLayout`  `_withOutcome`  `_withSecRo`  `_withTimeout`  `_wkPaneActive`
`_wkVerseMarksHTML`  `A`  `a`  `ab`  `act`  `activateItem`
`ACTIVE_TOTAL`  `ACTIVE_VERSES`  `ACTIVE_VERSES_ALL`  `add`  `addCustomSuffix`  `addCustomVerseFromForm`
`addDays`  `addNewCollection`  `addNewSection`  `addRow`  `addVerseAlarmCustomTime`  `ALL_VERSES`
`anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`  `applyRemoteState`  `applyScale`
`applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`  `applyUiScale`
`applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `applyView`  `arr`  `assigned`
`at`  `attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`
`attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authSetLoading`  `authSignOut`
`authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`  `away`  `axisName`
`b`  `barRef`  `barTags`  `base`  `bat`  `beforeBlock`
`beforeSave`  `begin`  `bibleClose`  `bibleOpen`  `bibleOpenLast`  `bibleOpenRef`
`bibleStartPreload`  `bindHold`  `board`  `body`  `bodyEl`  `book`
`bottom`  `bub`  `build`  `buildBackupFilename`  `buildFlatList`  `buildLanes`
`bump`  `bw`  `byName`  `C`  `c`  `cancelDragKeepingItem`
`cancelMousePress`  `cancelPressTimer`  `card`  `ceAddGoogleLink`  `ceCloseDeletePopup`  `ceCloseTrash`
`ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`  `ceOpenDeletePopup`  `ceOpenTrash`
`ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`  `ceToggleFilter`  `ceToggleGoogleAuto`
`cfChoose`  `cfMergeAll`  `cfRender`  `cfToggleRaw`  `chap`  `checkDataRecovery`
`checkVerseAlarm`  `chip`  `chM`  `cl`  `clamp`  `cleanupEmptyDays`
`clear`  `clearActive`  `clearContactForm`  `clearDropIndicators`  `clearLp`  `clearPaint`
`clearTrash`  `closeAccountSensitiveModals`  `closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`
`closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`
`closeGroupDialog`  `closeHdrCalendar`  `closeInlineInput`  `closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`
`closeLogoMenu`  `closeMemoActMenu`  `closeMemorizationHistory`  `closeMemRecPopup`  `closePlusList`  `closeRepeatSubPicker`
`closeRepScope`  `closeRpConfig`  `closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`
`closeShareDialog`  `closeSmGhost`  `closeSubRowMenu`  `closeSubscribeDialog`  `closeSwKbHelp`  `closeSyncConflicts`
`closeSyncResultModal`  `closeTaskMemo`  `closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`  `closeThere`
`closeTrash`  `closeVcSettings`  `closeVDashDetail`  `closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`
`closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`  `closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`
`closeVerseSettingsModal`  `closeVfDeeperPicker`  `closeVfKeepSwitch`  `closeVfShare`  `closeVliMenu`  `closeVliMenuFromOverlay`
`closeVPair`  `closeVwScope`  `cnt`  `code`  `col`  `collAddAction`
`collMenuAction`  `color`  `colX`  `commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`
`contactAction`  `contactBadgeCountChanged`  `copy`  `core`  `cross`  `cur`
`currentMatchingPresetName`  `currentViewKey`  `curSecId`  `cx`  `damp`  `day`
`dayOfYearVerseIdx`  `days`  `daysFromToday`  `decide`  `deeperN`  `defaultState`
`defIds`  `deleteCollection`  `deleteEventFromMenu`  `deleteLatestVerseEvent`  `deleteSection`  `deleteSectionConfig`
`dev`  `devInboxDelete`  `devInboxLoad`  `devInboxRefreshBadge`  `devInboxToggleAll`  `devInboxUpdateBadge`
`devNoteHandleFile`  `devNoteSend`  `devNoteToggle`  `devTrashDelete`  `devTrashEmpty`  `devTrashRender`
`devTrashToggle`  `dir`  `done`  `doRedo`  `doSaveGroup`  `doSubscribe`
`doUndo`  `dow`  `download`  `draw`  `dropDrag`  `dropSecArchive`
`dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`  `editContact`  `editEventFromMenu`  `el`
`email`  `emailTag`  `endDrag`  `endPinch`  `enough`  `ensureDailyRepeats`
`ensureRepeatsForView`  `esc`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`  `exportBackup`
`f`  `facet`  `fam`  `fbForceUploadLocal`  `fbPushState`  `fbStartListening`
`fill`  `findColl`  `findFlatIndex`  `findLaneIndex`  `findMentionedContacts`  `finish`
`fire`  `first`  `fit`  `fitPill`  `focusItemInput`  `form`
`formatEventTime`  `from`  `getActiveColls`  `getBibleInk`  `getBibleMarks`  `getBibleNotes`
`getBibleReadLog`  `getBigs`  `getCarryCount`  `getChips`  `getContainer`  `getCustomVerses`
`getDay`  `getDayFadeClass`  `getDeeperLog`  `getDisplayEvents`  `getDisplayTasks`  `getDOW`
`getDropTarget`  `getEvenDeeperLog`  `getEvents`  `getKeepLog`  `getLikeLog`  `getMemLog`
`getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`  `getSecColor`  `getShareLog`  `getSmalls`
`getStableDt`  `getTasksTaggedWithContact`  `getThereLog`  `getTrack`  `getTrash`  `getVerseAlarm`
`getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`  `getWraps`
`gid`  `gname`  `go`  `goToDate`  `grid`  `h`
`hdrCalGoToday`  `hdrCalNav`  `hdrCalPick`  `hh`  `hi`  `hideBusyToast`
`hit`  `hmBtn`  `home`  `importBackup`  `importFromFile`  `initAppUI`
`initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`
`inner0`  `inspectRecoveryDate`  `IS_TOUCH`  `isAnyInputFocused`  `isCollActive`  `isDark`
`isExcluded`  `isNowWithinSection`  `isOver`  `isSwipeZone`  `isToday`  `isTouch`
`itemKey`  `j`  `jong`  `K`  `k`  `keep`
`keepPickNew`  `keepPickToggle`  `keepRowDelete`  `keepRowEdit`  `keepSetSort`  `keepTogglePairSort`
`key`  `keys`  `kindWord`  `L`  `l`  `l0`
`label`  `laterLocal`  `laySetBp`  `laySetWeekly`  `left`  `likeN`
`limit`  `line`  `list`  `lo`  `load`  `logicalNow`
`logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`  `logoMenuPrevVerse`  `logoMenuRandomVerse`
`logoMenuToggleVerse`  `loop`  `loose`  `LS_KEY`  `m`  `makeBigGhost`
`makeBigItem`  `makeBigWrap`  `makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`  `makeSmItem`
`makeSmWrap`  `makeSubPanel`  `makeSubToggleBadge`  `makeSwipeWrap`  `manuallyCollapsed`  `map`
`mark`  `markOf`  `materializeRepeatsFor`  `md`  `me`  `measure`
`memoActRun`  `mergeDuplicateVerses`  `mid`  `mine`  `mix`  `mk`
`mkBtn`  `mkDate`  `mode`  `monthLabel`  `monthTitleHTML`  `moveActiveItems`
`moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`  `moveDrag`  `moveG`  `moveTaskTo`
`moveTaskToPickedDate`  `ms`  `N`  `n`  `n0`  `name`
`nameTx`  `navigateDate`  `navigateWeek`  `needTemp`  `next`  `nextVerseManual`
`now`  `o`  `offTest`  `on`  `onCancel`  `onDown`
`one`  `onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`
`onStart`  `onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`  `onVerseAlarmToggle`
`onVerseBarClick`  `onVerseMemRecord`  `open`  `openCellInput`  `openCollAddMenu`  `openCollEdit`
`openCollMenu`  `openContactMenu`  `openContactsModal`  `openContactsModalWith`  `openDeeperFromRef`  `openEvenDeeperFromRef`
`openEventEditMenu`  `openEventModal`  `openEventModalForDate`  `openGroupDialog`  `openHdrCalendar`  `openInlineInput`
`openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`  `openLogoMenu`  `openMemoActMenu`  `openMemoFromMenu`
`openMemorizationHistory`  `openMenuForThis`  `openPlusList`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`
`openSfxMenu`  `openShareDialog`  `openSmGhost`  `openSubRowMenu`  `openSubscribeDialog`  `openSubsFromMenu`
`openSwKbHelp`  `openSyncConflicts`  `openTaskMemo`  `openTaskMenu`  `openThemePicker`  `openThere`
`openThereFromVf`  `openThereTune`  `openTrash`  `openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`
`openVerseAlarmCustomTimePopup`  `openVerseCollFromListMenu`  `openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`  `openVerseGrid`
`openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsFromLogo`  `openVerseSettingsFromMenu`  `openVerseSettingsModal`
`openVfDeeper`  `openVfShare`  `openVfShareFor`  `openVliMenu`  `openVPair`  `openVwScope`
`org`  `out`  `overflows`  `own`  `p`  `pad`
`padH`  `padV`  `paint`  `paintAppUIFromLocal`  `paintRows`  `pairKey`
`pairOn`  `pane`  `paneHTML`  `parseItemKey`  `pass`  `pcEl`
`pct`  `pd`  `perBtn`  `phone`  `pick`  `pickContainer`
`pickFromDeviceContacts`  `pickVfDeeper`  `place`  `plusClearAll`  `plusRemoveCat`  `plusRemoveKeys`
`plusRemoveTopic`  `pool`  `populateCarryBadge`  `portrait`  `prepDatePicker`  `prepDupDatePicker`
`prepTaskMenuDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `push`  `put`
`putOverride`  `putText`  `q`  `r`  `randomVerseManual`  `rankHTML`
`raw`  `rawSave`  `recent`  `recheck`  `recheckBurst`  `recordMemorization`
`recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`  `ref`
`refH`  `refLine`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`
`refreshVerseMarksLive`  `refs`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`
`renderAddRow`  `renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`
`renderContactsList`  `renderLayout`  `renderMonthly`  `renderPlusList`  `renderPresetList`  `renderRepeatButtons`
`renderRpConfigList`  `renderSecArchive`  `renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`
`renderSectionEditor`  `renderSettingsPanel`  `renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`
`renderToday`  `renderTrashList`  `renderVcSettings`  `renderVDashLink`  `renderVDashMap`  `renderVDashPie`
`renderVDashRhythm`  `renderVDashTrend`  `renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`
`renderVerseGrid`  `renderVerseListCatRow`  `renderVerseListPies`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderVgCfg`
`renderVgPick`  `renderVPair`  `renderVwScope`  `renderWeekly`  `repeat`  `resetStateToDefaults`
`resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`
`rmBtn`  `roll`  `rot`  `row`  `rows`  `rowsOf`
`rpChMonth`  `rs`  `runAutoCarryOver`  `runCarryNow`  `runGroupSync`  `runSharedCollSync`
`runVerseSheetAutoSync`  `s`  `safe`  `save`  `saveCurrentSectionConfig`  `saveText`
`SC`  `sc`  `scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`  `scrollFlatIdxIntoView`
`sec`  `secDelDo`  `secHasEvent`  `secHasPendingTodo`  `secId`  `secs`
`sel`  `selRef`  `sendTestPush`  `sendToTrash`  `set`  `setActiveSingle`
`setCarryScope`  `setCnt`  `setDeeperOpen`  `setDeviceNotify`  `setEventTimeToggle`  `setLayFormMode`
`setLinkOpenMode`  `setNotifySuffix`  `setPlusTab`  `setShareSize`  `setText`  `setThereIcon`
`setTimeStep`  `settle`  `setTxtRefBracket`  `setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`
`setUiLevelIconSet`  `setupCrossViewSwipeZones`  `setVcAuto`  `setVcAutoMin`  `setVcHeadMode`  `setVcRollMode`
`setVcRollSec`  `setVcShow`  `setVcShowAll`  `setVcTextScale`  `setVcTheme`  `setVerseCountScope`
`setVerseIdx`  `setVersePush`  `setVersePushInterval`  `setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`
`setVfArtStyle`  `setVfTextScale`  `setWMViewMode`  `sfxMenuAction`  `shareCopyCode`  `shareSizeOf`
`shareVia`  `showAutoBackups`  `showBusyToast`  `showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`
`shown`  `showReactionToast`  `showSyncResultModal`  `showToast`  `showVersePopup`  `side`
`sisterGo`  `slide`  `snapBack`  `snapshot`  `solve`  `sortBtn`
`sortEventsByTime`  `span`  `src`  `start`  `startDrag`  `startEditContact`
`stepHiOverlap`  `stepHiStarMax`  `stickOf`  `stopLt`  `stopTimer`  `strip`
`style`  `submitContact`  `submitEventModal`  `sum`  `sw`  `swCrossToggle`
`swImportFromBlock7`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`  `swKeepSet`  `swOpenCollFilter`
`swRow`  `swTitle`  `swToggleEdit`  `swToggleKeep`  `syncIncludeNow`  `syncIncludeOpenFull`
`syncIncludeUndo`  `syncP`  `syncRollDisplays`  `syncSecsFromState`  `syncVis`  `t`
`tab`  `tags`  `taskMarkerFilterPass`  `testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`
`text`  `themeById`  `themeChip`  `themeNo`  `themePickerApply`  `themePickerGroup`
`themePickerPick`  `thereTuneClock`  `thereTuneFold`  `thereTuneReset`  `tick`  `tilt`
`tKey`  `to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`
`toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`
`togglePropTitleGroupOpen`  `togglePropTitleMotion`  `toggleSectionExclude`  `toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`
`toggleTaskMemoEdit`  `toggleTaskUrgent`  `toggleTxtIncl`  `toggleUrgentRank`  `toggleVerseAlarmContent`  `toggleVerseBarOn`
`toggleVfArt`  `toggleVfKeepSwitch`  `toggleVfPattern`  `toggleVfSecPattern`  `toggleWeeklyRepeat`  `toGraph`
`top`  `topic`  `total`  `totalActive`  `totalBigCount`  `totalChg`
`touch`  `trashBgClick`  `travel`  `txt`  `uiLevel`  `uiLevelIconSet`
`uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`  `unit`  `unwatch`  `up`
`updateHeaderDate`  `updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`
`updateSmCnt`  `updateTotal`  `updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`
`v`  `vbShuffleVerse`  `vcAct`  `vcAddCard`  `vcClearFilter`  `vcNav`
`vcOpenFilter`  `vcOpenFull`  `vcRollSecInput`  `vcSetTextScaleLive`  `vcSetView`  `vcStepTextScale`
`vcToggleView`  `vDashKindPick`  `vDashLinkRelayout`  `vDashMapPick`  `vDashOpenCollSettings`  `vDashOpenDetail`
`vDashOpenFilter`  `vDashOpenVerse`  `vDashSetCustom`  `vDashSetSlices`  `vDashSetSpanMode`  `vDashSetView`
`vDashSubToggle`  `vDashToggleEtc`  `verb`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`
`verseFullNav`  `verses`  `verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`
`vfCopyBodyOnly`  `vfHomeAction`  `vfOpenCollSettings`  `vfOpenDashboard`  `vfOpenKeepGrid`  `vfOpenKeepList`
`vfOpenNavTile`  `vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgCfgReset`
`vgCfgSet`  `vgClearSel`  `vgCycleTab`  `vgDepthSet`  `vgPick`  `vgPickAxis`
`vgRankSet`  `vgSearch`  `vgSetBibleSort`  `vgSetSelOnly`  `vgSetTab`  `vgShowHelp`
`vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`  `vgToggle`  `vgToggleExpand`  `vgToggleGroup`
`vgToggleSel`  `vgToggleTagExcl`  `vgToggleTileExcl`  `vis`  `vliAction`  `vlSetCustom`
`vlSetPeriod`  `vlSetSort`  `vlSetTab`  `vlToggleCtrl`  `vlTogglePairSort`  `vlwSetCustom`
`vlwSetPeriod`  `vlwSetSort`  `vlwTogglePairSort`  `vMapOpenChapter`  `vMapOpenGrid`  `vMapRangeSet`
`vMapToggleFold`  `vpAddTime`  `vpCycleFullTab`  `vpDelTime`  `vpDiagClear`  `vpDiagCopy`
`vpDiagRender`  `vpDiagToggle`  `vpFull`  `vpGoToFilteredTile`  `vpOpenVerse`  `vpSetTime`
`vpTile`  `vpToggleDay`  `vpToggleFilt`  `vrs`  `vsetGoDashboard`  `vTrCloseBook`
`vTrInsSet`  `vTrOpenBook`  `vTrSet`  `vTrSortBy`  `vTrSpanSet`  `vTrToggleExp`
`vTrToggleSeries`  `vw`  `vwScopeClearFilter`  `vwScopeCollSettings`  `vwScopePick`  `vwScopeToggleMode`
`W`  `w`  `want`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`
`weeksFromToday`  `who`  `widest`  `wireActivateClick`  `words`  `x`
`y`  `z`

