# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-1031-10** · 전체 57,014줄 · 구역 486개 · 함수 3160개

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
| 456~6,726 | 6,271줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 6,727~7,022 | 296줄 (1%) | JS | 동작 (자바스크립트) |
| 7,049~7,075 | 27줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 7,076~7,145 | 70줄 (0%) | JS | 동작 (자바스크립트) |
| 7,146~7,183 | 38줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 7,198~9,935 | 2,738줄 (5%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 9,936~10,422 | 487줄 (1%) | JS | 동작 (자바스크립트) |
| 10,423~56,136 | 45,714줄 (80%) | JS | 동작 (자바스크립트) |
| 56,137~57,011 | 875줄 (2%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 500 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 573 | 전체화면·타일뷰가 떠 있는 동안엔 **뒤 배경도 같은 색으로** 칠한다 |
| 614 | HEADER |
| 619 | GNB 위쪽 여백 (v26-0903-6, HB 스크린샷) |
| 654 | Verse bar (네비게이토 180) |
| 655 | Verse bar outer wrapper |
| 656 | 말씀 전체 화면 (릴스형) |
| 673 | There — 기도·예배 전체화면 (v26-0923-5, HB) |
| 737 | There 말씀 (v. 26-1024-14, HB) |
| 771 | There 단추 자리들 (v26-0923-5 T-4) |
| 840 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 1,002 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 1,015 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 1,036 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 1,119 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 1,137 | 기다리는 동안 보여 줄 것 셋 더 (v26-1010-9, HB) |
| 1,299 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,421 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,466 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,750 | 스닉픽 한 줄 |
| 1,899 | 검색 (v. 26-1031-8, HB 1031 1-2) |
| 2,031 | DATE NAV |
| 2,049 | GNB 날짜 (#hDate) |
| 2,072 | DATE SWIPE OVERLAY |
| 2,074 | MINI MOVE MENU |
| 2,093 | DATE PICKER OVERLAY |
| 2,173 | 모음 구역 (v26-0916-2, HB) |
| 2,243 | TIME SECTION |
| 2,274 | Event chips (shown inline in the section header, next to the |
| 2,398 | BLOCK SWIPE WRAPPER |
| 2,421 | BIG BLOCK (E method: colored left bar, no indent) |
| 2,571 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,691 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,696 | 연락처 관리 모달 |
| 2,722 | @닉네임 태그 할일 모아보기 |
| 2,782 | 하위 할일 판 |
| 2,838 | 메모 팝업 |
| 2,889 | 헤더 슬라이드 입력창 (B안) |
| 2,915 | 헤더 + 버튼 (할일 추가) |
| 2,934 | ▲ 숨기기 버튼 |
| 2,970 | TRASH PANEL |
| 3,019 | DATE NAV |
| 3,072 | TASK MOVE MINI MENU |
| 3,127 | 구간 판 — 옮길 시간 구간을 고르고, 그 구간에 무엇이 있는지 본다 |
| 3,202 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 3,226 | 할일 메뉴 '기도 노트로' 의 오른쪽 판 (v26-1013-5) — 그룹 → 서브 그룹. 메뉴와 같은 모습 |
| 3,240 | Event add modal |
| 3,400 | WEEKLY/MONTHLY |
| 3,510 | D뷰 좌우 분할 (넓은 화면) |
| 3,521 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 3,544 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 3,551 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 4,114 | LOGIN / AUTH SCREEN |
| 4,190 | SETTINGS PANEL |
| 4,247 | 설정 등급(이지·미드·파워) 고르기 |
| 4,270 | 선 그림만으로 고른 것을 나타내는 자리 |
| 4,425 | 강조 표시 고르는 줄 (v26-0812-15) |
| 4,445 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 4,612 | 시간 구간 경계선 |
| 4,734 | 고른 것 = 강조색으로 꽉 채움 (v26-1024-18, HB "선택된 버튼이 뭔지 잘 안 보인다") |
| 4,799 | 말씀 대시보드 |
| 4,843 | 대시보드 위쪽 전환 (분포 ⇄ 흐름) |
| 4,855 | 흐름(추이) |
| 4,919 | 손으로 만든 슬라이더 (v26-0906-2, HB 5-1) |
| 5,018 | 작은 발견 (v26-0906-5, HB 2) |
| 5,044 | 성경 지도 (v26-0906-5, HB 1) |
| 5,073 | 파이 상세: 조각 수 슬라이더 · '기타' 켜고 끄기 (v26-0907-4, HB 4) |
| 5,110 | 연결 — 그래프 뷰 (v26-0907-4 · v26-0907-5, HB 7) |
| 5,161 | 짝 목록 (v26-0907-6, HB 3) |
| 5,286 | 리듬 (요일 × 한 시간) (v26-0907-3, HB 5) |
| 5,410 | 색상 테마: 뷰 탭 요약 줄 |
| 5,427 | 색상 테마 선택 화면 |
| 5,520 | 미리보기 목업 |
| 5,798 | 본문에 긋기 (v26-1007-19) |
| 5,966 | 성경 읽기 대시보드 (v26-1007-9 · 시안 MmxtwQwAy2xr4DbScFJM7m) — 색은 남색 하나를 진하기로만 |
| 6,056 | 첫 그림의 색은 **테마를 따르지 않는다** (v26-0922-23, HB) |
| 6,093 | 꿀벌집 — 아래에서부터 한 칸씩 차오른다 (v26-0922-22, HB) |
| 6,169 | PC: 넓어지면 **열이 는다** (v26-0922-11, HB 4) |
| 6,430 | 유튜브 썸네일은 **제 색을 더 많이 남긴다** (v26-0922-14, HB) |
| 6,577 | 편집 모드 |
| 6,601 | PC: 자판이 보고 있는 위젯 (v26-0921-13, HB) |
| 6,611 | PC: 자판이 보고 있는 타일 (v26-0921-12, HB) |
| 6,658 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 188 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 222 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 261 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 426 | 조기 적용 (첫 페인트 전) | – |
| 6,970 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `base`, `_swBootOff`, `gcalPad`, `gcalKeyOf`, `gcalAddDays`, `gcalDayDiff`, `gcalWindow` … 외 7개 |
| 9,998 | 반복 일정 → 구글 반복 규칙 (v26-1024-3, 3단계 ①) | `gcalYmd`, `gcalRecur`, `days`, `weeks`, `until`, `gcalHashEv`, `rc`, `gcalSeriesBody`, `gcalPatchBody`, `gcalCollect` |
| 10,073 | 구글 반복 → BLOCK7 반복 (v26-1024-7, 3단계 ②) | `gcalRuleHits`, `gcalDateOf`, `gcalParseRecur`, `gcalStamp`, `gcalExModified`, `gcalRf`, `gcalInstMaster`, `gcalInstDate`, `_gcalRepOn`, `_gcalRepNew` |
| 10,159 | 판단 | `gcalPlan`, `mastOf`, `instIdOf`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 10,462 | 네비게이토 180 암송성구 데이터 | – |
| 10,489 | Color presets | – |
| 10,507 | 네비게이토 180 verse bar | – |
| 10,508 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 10,524 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 10,564 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 10,582 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 10,703 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses`, `_collPeriodVerses`, `_cfHasSel`, `_cfClearSel`, `_plusKeyOf`, `_plusHas`, `_collVerseShows`, `_collVersePassesOnly`, `_plusVisibleMask`, `_plusVerses`, `_plusPrune`, `_plusTidy` … 외 3개 |
| 10,878 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_VERSES_ALL`, `_activeVersesFrom`, `ACTIVE_TOTAL` |
| 10,927 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 10,933 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 11,023 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_collHue`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList` … 외 3개 |
| 11,376 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 11,470 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 11,528 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 11,602 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 11,720 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 11,802 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `_pick`, `gid`, `_bump` |
| 12,009 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `endRow`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propImg`, `_propYt` … 외 4개 |
| 12,310 | 상황/필요 · 묵상 질문 (v26-0922-3, HB) | `colX` |
| 12,398 | '설교 목록' 탭을 그대로 연결하기 (v26-0922-8, HB) | `_isSermonListSheet`, `_sermonCatNorm`, `_sermonListMap`, `h`, `at`, `_sermonYtFor`, `_applySermonListSheet` |
| 12,491 | 영상이 없는 설교 (v26-1005-1, HB) | – |
| 12,501 | 알리지 않는 예배 (v26-1010-7 · 침례식·특별 추가 26-1010-8, HB) | `_sermonSkipNoVideo`, `_sermonNoVideo` |
| 12,544 | 한 모음에 연결된 시트 여럿을 **한 번에** 반영한다 (v26-1004-1, HB 신고) | `_syncVerseFp`, `_syncCollSheets`, `_rowsToItems`, `_importVerseRows`, `_sheetCsvEndpoints`, `_fetchSheetCsv`, `_loadSheetJs`, `importFromFile` |
| 12,747 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 12,865 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 12,943 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 12,994 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_shareCopy`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `_grpNameNorm`, `_grpNameValid`, `_grpAddrUrl`, `_grpAddrShow`, `_grpFetch`, `_subscribeShared`, `verses`, `_grpSync` |
| 13,202 | 빼기 | `runGroupSync`, `_joinRead`, `_joinClear`, `_joinFromPath`, `_joinApply` |
| 13,319 | 그룹 만들기·고치기 (교회 쪽 화면) | `openGroupDialog`, `closeGroupDialog`, `_grpAddrPreview`, `_grpRenderColls`, `doSaveGroup`, `gname`, `_grpShowAddr`, `openShareDialog`, `closeShareDialog`, `_shareResetBigText`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy` … 외 6개 |
| 13,601 | GNB 의 There · 성경 · 1단 롤링 피커 (v26-1006-6, HB 8) | `_gnbExtrasSync`, `_gnbPickerOn`, `_gnbPickerStep`, `_gnbRpMenu`, `cur`, `go`, `renderVerseBar` |
| 13,703 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_vbThereEl`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncItems`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 13,960 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseResizeThreshold`, `_verseResizeOpacity`, `_verseModeTextEls`, `_verseModeSession`, `_verseModeSettle` |
| 14,169 | 크기 전환 드래그의 공통 손잡이 | `_verseDragBegin`, `_verseDragMove`, `travel`, `_verseDragEnd`, `_initVerseBarResize`, `_verseBandHit`, `bottom`, `_initVerseBandDrag`, `decide`, `unwatch`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual` … 외 15개 |
| 14,706 | 상단 › 다음 구절로 (v26-1024-16, HB 설정창 정리) | `_verseNextMode`, `_syncVerseNextBtns`, `setVerseNext`, `renderVerseSettingsModal` |
| 14,785 | 인앱 말씀 팝업 | – |
| 14,789 | 말씀 푸시 알림 설정 | `_vpOrders`, `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 14,820 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 14,909 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent`, `_bibleChapters` … 외 1개 |
| 15,130 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 15,141 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 15,206 | 암송 관리 | `getMemLog` |
| 15,213 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 15,236 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 15,259 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare`, `getThereLog`, `_thereBegin`, `_thereCommit`, `_thereEach`, `_thereTotalSec`, `_thereCountFor`, `_thereClock`, `_thereDurWords` |
| 15,333 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 15,353 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 15,521 | BibleLinkProvider | `_brKey`, `getBibleMarks`, `getBibleReadLog`, `getBibleNotes`, `_brSetMark`, `_brNoteSave`, `_brNotesAt`, `_brMigrateNotes`, `_brReadMs`, `_brHistory`, `_brHistHide`, `_brReadAdd`, `_brDev`, `_brParseRef` … 외 6개 |
| 15,793 | 성경 읽기 대시보드 — 기록 → 숫자 (v26-1007-9, B-9) | `_brDashRows`, `_brDashStart`, `_brSeenOf`, `_brDashStats` |
| 15,885 | 본문에 긋는 표시 (v26-1007-19, HB — 시안 FsJa1z2zfw4PHv9gCAwrrs 그대로) | `getBibleInk`, `_brInkId`, `_brInkSpansFrom`, `_brInkStepPos`, `_brInkCut`, `_brInkAdd`, `one`, `_brInkErase`, `_brInkHits`, `_brInkQuery` |
| 15,930 | 원어찾기 기록 (v26-1009-2, HB) | `getBibleOrig`, `_brOrigAdd`, `_brOrigNote`, `_brOrigWords` |
| 15,945 | 읽을 곳 (v26-1009-8, HB) — 장 단위 '읽을 거리'. 본문 위 오른쪽부터 매달린 탭 | `getBibleToRead`, `_brTRHas`, `_brTRToggle`, `_brTRKey`, `_brTRList`, `_brTRSetOrder`, `_brUrl`, `_brFetchJSON`, `_brGet`, `_brBook`, `_brVerseObj`, `bibleStartPreload`, `_sheetDrag`, `_sheetDragBindSettings` … 외 49개 |
| 16,348 | 읽는 시간 · 본 절 — 장을 펼친 순간부터 다음 장·닫기·앱 벗어남까지 | `_brSessEnd`, `_brSessStep`, `_brDiagStuck`, `_brDiagSync`, `_brDiagStore`, `_brDiagText`, `_brBusy`, `_brActiveWin`, `_brSessStart`, `bibleOpenLast`, `_brPosSave`, `bibleOpenRef`, `bibleOpen`, `bibleClose` … 외 7개 |
| 16,548 | 헤더·하단 접기 (v26-1007-7, HB — 갓피플 방식) | `_brChromeApply`, `_brChrome`, `_brChromeFreeze`, `_brOnScroll`, `_brProgSync`, `_brOpenDash`, `_brFmtMin`, `_brDashRender`, `pd`, `q`, `_brUnpark` |
| 16,693 | 절 롱터치·우클릭 메뉴 (v26-1007-8, HB) | `_brVmOpen`, `_brVmClose`, `_brViewVs`, `_brViewRef`, `_brVmRun` |
| 16,742 | 시트 | `_brOpenSheet`, `_brCloseSheets`, `_brOpenAct`, `_brDate`, `_brOpenMemo`, `_brCopy`, `done`, `_brCopyFallback` |
| 16,796 | 고르기 판 | `_brRecent`, `_brRenderPick` |
| 16,840 | 글자와 화면 | `_brApplyLook`, `_brLzGet`, `_brLzPaint`, `f`, `_brSyncAa`, `_brSet` |
| 16,869 | 내 표시 목록 | `_brRow`, `_brRenderList`, `txt`, `_brNoteInline`, `_brNoteHTML`, `flush` |
| 16,951 | 원어 목록 (v26-1009-3) | `_brOrigListHTML`, `note`, `_brListDelete`, `_brRowGone`, `_brSwipeBind` |
| 17,011 | 검색 | `_brRunFind`, `_brSyncScope` |
| 17,049 | 묶기 (한 번만) | `_brBind`, `TOUCH`, `inkStart`, `inkMove` |
| 17,120 | 스크롤 기록 (v26-1010-11, HB — 아이패드 미니에서만 걸림. 기기 없이 두 번 헛짚었다) | `selRef`, `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 17,583 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 17,677 | 기다리는 동안 보여 줄 것 넷 (v26-1010-9, HB) | `_toastSpin` |
| 17,697 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 17,933 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `_vfRestoreCovers`, `closeVerseFull`, `_vfSyncPageBg`, `_verseFullIsOpen` |
| 18,027 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 18,035 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `hit`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns` … 외 22개 |
| 18,671 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 18,709 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 8개 |
| 19,050 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 19,156 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 19,162 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 19,210 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `_syncDeeperOpenUI`, `setDeeperOpen`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount` … 외 3개 |
| 19,373 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | `_thereIconKey`, `_thereIconSync`, `_thereIcHTML`, `setThereIcon` |
| 19,465 | 세팅 (이 기기에만) | `_tfDevKind`, `_tfLoad`, `_tfStore`, `_tfGet`, `_thereStripHanja`, `_thereWordFromVerse`, `_thereWordFromBible`, `pages` |
| 19,518 | 말씀 세팅 (이 기기에만 — 다른 There 세팅과 같은 칸 _lsk('thereFx')) | `_tfW`, `_tfBreathAt`, `x`, `_TF_NOISE`, `_tfNoise`, `_tfCandleAt`, `_tfFlickerAt`, `_tfFlickerParams` |
| 19,580 | 그리기 | `_tfHex2Hsl`, `_tfHsl2Rgb`, `_tfSprites`, `_tfPick`, `_tfBuildSprites`, `_tfSize`, `_tfSpawn`, `_tfDrawCross`, `_tfFrame`, `el` |
| 19,680 | 세팅 판 | `_tfSyncUI`, `_tfWire`, `thereTuneClock`, `thereTuneReset`, `thereTuneFold` |
| 19,743 | There 말씀 그리기 (v. 26-1024-14, HB) | `_tfQuiet`, `_tfWordSet`, `_tfWordApply`, `_tfWordRender`, `_tfWordFit`, `_tfWordRect`, `_tfWordToggle`, `_tfWordGo`, `_tfWordMulti`, `_tfWordWire`, `mvEl`, `_tfWordSyncUI`, `_tfWordChanged`, `thereWordSw` … 외 1개 |
| 19,912 | 테마 입히기 (v26-0923-8, HB) | `_tfApplyTheme`, `set`, `mix` |
| 19,942 | 열기·닫기 | `_thereIsOpen`, `openThere`, `closeThere`, `_thereRecorded`, `openThereFromVf`, `openThereTune` |
| 19,995 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 20,108 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 20,211 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 20,488 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 20,630 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 20,645 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 20,879 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 20,894 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 20,908 | 명조 | – |
| 20,912 | 고딕 | – |
| 20,915 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptPreloadVerse`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish` … 외 3개 |
| 21,162 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 21,477 | 크기 (v26-0905-2, HB — "말씀 모음 설정에 비해 홈과 책갈피가 | – |
| 21,489 | 홈 아이콘 두 벌 (v26-0905-7, HB) | – |
| 21,504 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfPrepareNext`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav` |
| 21,627 | 지금 보는 것이 '말씀 설정에서 정한 그 모음' 그대로인가 | `_vfAtCollection`, `_vfHomeStash`, `vfHomeAction`, `vfOpenDashboard`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab`, `_vfRenderKeepSwitch`, `toggleVfKeepSwitch`, `_vfKeepNav`, `vfOpenKeepList`, `vfOpenKeepGrid`, `_vfTitleTileFn` … 외 3개 |
| 21,895 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 22,127 | 설정창 (말씀설정 → 전체화면 탭) | `_ptMotionOn`, `_ptPickMotion`, `togglePropTitleMotion`, `_ptSyncMotionUI`, `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 22,203 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 22,311 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 22,333 | 명제 **본문** 가르개 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 22,385 | 명제 대표 문구 타이틀 | – |
| 22,388 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines` |
| 22,464 | 대표 문구 줄바꿈 (v26-0913-4, HB) | – |
| 22,501 | 끊으면 말이 두 동강 나는 자리 (v26-0913-5, HB) | – |
| 22,527 | v26-0913-6, HB 가 준 예로 더 넣은 것 | `_ptGlued`, `_ptCutPoint`, `mid`, `_ptCutTitle` |
| 22,621 | 정한 줄을 **폭을 아는 자리에서** 다시 정한다 (v26-0913-6, HB) | `_ptAvailW`, `pad`, `_ptRelines`, `widest`, `_ptPaint`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 22,810 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 23,099 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 22개 |
| 23,437 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 23,442 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 23,543 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 23,570 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 23,594 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 23,631 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_vfCatCue`, `_initVfCatSheet`, `stopTimer`, `disarm`, `vfOpenSheetForCat`, `prop`, `_sheetCopyThenGo`, `go`, `_sheetIsPc` |
| 23,828 | 명제는 늘 '명제 DB' 탭으로 (v26-1010-16 PC · v26-1010-17 휴대폰, HB) | `_sheetMainTtl`, `_sheetMainBuild`, `links`, `_sheetMainLoad`, `_sheetMainReady`, `_sheetMainWarm`, `_sheetGoMain`, `_sheetOpenPropMain`, `_sheetGo`, `_sheetCopyPending`, `_sheetEditUrlNorm`, `_sheetEditCall`, `u`, `ctl` … 외 21개 |
| 24,418 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight`, `top` |
| 24,436 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_logoMenuEsc`, `_tryCloseLogoMenu` |
| 24,585 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `renderVerseListPies`, `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 24,696 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 24,804 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 24,824 | 암송 기록 마이그레이션: verseIdx → ref | – |
| 24,860 | 이 기기에 ST 적기 (v26-1010-12, HB — 읽기 계획 탭이 두 번 통째로 사라졌다) | `_lsStKey`, `_lsDropBase`, `_lsPutST`, `put`, `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 24,969 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `_repRule`, `_repUntil`, `_repEx`, `_repBlocked`, `_dayKeyBefore` … 외 6개 |
| 25,240 | 긴 일정 이름 (v26-1024-9, HB) — 할일행 머리의 일정 칩 글자 수 | `_evChipN`, `_evChipCut`, `_evChipPreview`, `_evChipLabel`, `_evChipSync`, `evChipMaxInput`, `evChipMaxCommit` |
| 25,284 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 25,396 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 25,436 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 25,474 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 25,508 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 25,756 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 25,778 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 25,790 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 25,842 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put` |
| 25,947 | 휴지통 (v. 26-1031-6, HB 1031 1-1-4) | `_trashClone`, `sendToTrash`, `_trashTs`, `_trashDay`, `_trashCut`, `_trashAll`, `_trashCount`, `_trashPurgeOld`, `updateTrashBadge` |
| 26,020 | 톱니 (GNB B안, v. 26-1031-7, HB 1031 1-1-3) | `_gnbGearSync`, `_gnbGearMenu`, `_gnbGearTap`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `_trashRestored`, `restoreFromTrash`, `clearTrash` |
| 26,130 | 검색 엔진 | `_srchNorm`, `_srchHas`, `_srchDayNum`, `_srchQuickTask`, `_srchRun`, `secIds`, `byNear`, `fold`, `_srchMark`, `_srchSnippet`, `_srchEvDest`, `_srchWeekOff`, `_srchFilterFix` |
| 26,275 | 검색 엔진 끝 | – |
| 26,276 | 검색 화면 | `_srchRecent`, `_srchRemember`, `_srchForget`, `_srchIsOpen`, `openSearch`, `closeSearch`, `_srchInput`, `_srchKey`, `_srchClear`, `_srchPick`, `_srchPickQuick`, `_srchSetKind`, `_srchSetRange`, `_srchSecs` … 외 17개 |
| 26,482 | 일정 → D/W/M 그 칸 (4단계) | `_srchEvSync`, `_srchOpenWidgets`, `_srchFlash`, `_srchGoEvent` |
| 26,535 | 동그라미 = 바로 완료 (4단계) | `_srchItemOf`, `_srchStale`, `_srchToggleDone` |
| 26,567 | 결과 롱터치 · 우클릭 메뉴 (4단계, 시안 '1-2 결과 롱터치 메뉴') | `_srchContactTel`, `_srchActOpen`, `_srchActClose`, `_srchActBg`, `_srchActDraw`, `B`, `R`, `_srchKeyAdd`, `_srchWithTask`, `_srchActDone`, `_srchActDo`, `_srchActDate`, `_srchBindLongPress`, `cancel` … 외 5개 |
| 26,823 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | – |
| 26,829 | 주간뷰도 칸 안에 자리를 갖는다 (v. 26-1030-2, HB) — 예전엔 3단에서만 두 칸 위를 가로질렀다. | – |
| 26,907 | 2단 배치 (v. 26-1030-4, HB (가)) — 처음엔 예전 2단 화면 그대로(좌 = 좌, 우 = 중+우)에서 시작한다 | `_colKey` |
| 26,929 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 27,167 | 부드러운 전환 (커튼 오버레이) | `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpWkH`, `hh`, `_rpSetWkH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 27,440 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 27,496 | 범위(scope)별 집계 (v26-0904-7, HB) | `_vlKindEntries`, `_vlKeepEntries`, `_vlHomeEntries`, `_vlReactTotals`, `_vlExtraSortFor`, `_vlEntriesForScope` |
| 27,556 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 27,591 | 정렬 (v26-0831-11, HB) | – |
| 27,595 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vlwKey`, `vlwSetSort`, `vlwTogglePairSort`, `vlwSetPeriod`, `vlwSetCustom`, `_vListControlsHTML` … 외 28개 |
| 27,951 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 28,021 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 28,047 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 28,079 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 28,265 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `_keepSwitchIsOpen`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 28,304 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 28,387 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 28,441 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashMaxSlice`, `_vDashShowEtc`, `_vDashEtcColor`, `vDashSetSlices`, `vDashToggleEtc`, `_vDashKeyCmp` … 외 19개 |
| 28,778 | 위쪽 전환: 분포(파이) ⇄ 흐름(꺾은선) | `_vDashView`, `vDashSetView`, `_vDashCommonHTML`, `_vDashViewTabsHTML`, `renderVerseDashboard`, `_tdLoadPray`, `_tdOpts`, `renderVDashThere`, `openThereDash`, `_tdBindLong`, `_tdBindAll`, `renderVDashPie`, `_vDashPieInsightHTML`, `_vTrPref` … 외 10개 |
| 29,076 | 기간 슬라이더 | `_vTrOtherSpan`, `vTrSpanSet` |
| 29,100 | 부드럽게 끌리는 슬라이더 | `_vTrRailBind`, `paint`, `fire` |
| 29,168 | 양쪽 손잡이 슬라이더 (v26-0907-3, HB 6-3) | `_vTrExclLabel`, `_vTrRail2Bind`, `paint`, `_vTrBindRails`, `vTrInsSet`, `vTrToggleSeries`, `vTrToggleExp`, `vTrOpenBook`, `on`, `vTrCloseBook`, `_vTrEntries`, `_vTrBucketOf`, `_vTrBucketRange`, `_vTrNowBucket` … 외 10개 |
| 29,462 | 그 성경 안에서 이 말씀이 걸리는 '장' | `_vTrChapterKeys`, `rs`, `_vTrChapNo`, `_vTrChapCmp`, `_vTrData`, `unit`, `add`, `_vTrGeo`, `bw`, `_vTrHFromX`, `_vTrChartSVG`, `nameTx` |
| 29,567 | 견주는 두 구간을 그림 안에 그린다 (v26-0906-1 · v26-0906-2, HB 4) | `markOf` |
| 29,728 | 그림 안의 띠를 끌어 견주는 구간(h)을 바꾼다 (v26-0906-2, HB 4-1) | `_vTrBindBand`, `fitPill`, `paint`, `_vTrChipsHTML`, `_vTrRailHTML`, `f`, `pct`, `_vTrRail2HTML`, `_vTrSpanRowHTML`, `unit`, `_vTrRowsOf`, `sum`, `_vTrDiffHTML`, `_vTrInsightHTML` … 외 1개 |
| 29,965 | 작은 발견 (v26-0906-5, HB 2) | `_vTrFindings`, `sum`, `_vTrFindingsHTML`, `card`, `put` |
| 30,030 | 표 정렬 (v26-0906-2, HB 7) | `_vTrNameCmp`, `_vTrSortRows`, `_vTrTheadHTML`, `_vTrRowHTML`, `renderVDashTrend`, `form`, `unit` |
| 30,121 | 소제목 차례: 범위 - 무엇을 - 모양 | `_vDashSubKind`, `_vDashSubArmed`, `_vDashSubRefSet`, `vDashSubToggle`, `vDashKindPick`, `_vDashWinEntries`, `sc`, `keys`, `from`, `to`, `_vDashSpanWords`, `_vDashScope`, `_vDashScopeCtlHTML`, `_vDashVerbWord` … 외 8개 |
| 30,376 | 지도 | `_vMapMode`, `vDashMapPick`, `_vMapStats`, `_vMapStep`, `_vMapShade`, `_vMapInk`, `_vMapGroups`, `_vMapRange`, `lo`, `hi`, `_vMapRanks`, `_vIdKey`, `k`, `_vMapChapMap` … 외 9개 |
| 30,644 | 3-2 · 고른 조건이 만든 줄들 | `grid` |
| 30,796 | 연결 (주제 ↔ 성경) | `_vLinkAxis`, `_vgStop` |
| 30,836 | 배치 값 (2-1) | `_vgCfg`, `cl`, `vgCfgSet`, `vgCfgReset` |
| 30,871 | 골라 보기 (1-1) | `_vgSel`, `_vgDepth`, `vgDepthSet` |
| 30,887 | 노출 순위창 (2-1·2-2) — "몇 등부터 몇 등까지 그래프에 보일지". | `_vgRankPref`, `_vgRankOf`, `vgRankSet`, `_vgRankRailBind`, `paintRows`, `paint`, `vgSetSelOnly`, `vgToggleSel`, `vgClearSel`, `vgSearch`, `_vgSeeds`, `_vgReach`, `_vgDepthCounts`, `_vgApplyFilter` … 외 2개 |
| 31,133 | 껍데기를 먼저 넣는다 | – |
| 31,166 | 이제 그래프가 실제로 차지한 폭을 재고, 그 폭으로 점을 만든다 | `push`, `_vgShow`, `vgToggle`, `vDashLinkRelayout`, `_vgClamp` |
| 31,237 | 물리와 그리기 | `_vgRun` |
| 31,282 | 2-2 · 키울 때 점과 글자는 **제곱근만큼만** 커진다 | `applyScale`, `mark`, `paint` |
| 31,314 | 한 판 — 척력 · 용수철 · 가운데로 · 감쇠 | `stickOf`, `_rep2`, `tick`, `loop` |
| 31,408 | 손가락 · 마우스 | `applyView`, `toGraph`, `_vfSetTabPool`, `_vfTabList`, `_vpOtherAxis`, `_vpFacetCandidates`, `_vpFiltMulti`, `vpToggleFilt`, `_vpFiltRefSet`, `_vpTabName`, `_vpRep`, `_vpShortRef`, `_vpPool`, `_vpList` … 외 22개 |
| 31,899 | 주간 리듬 (잔디) | – |
| 31,900 | 리듬 (요일 × 한 시간) | `_vRhyKind` |
| 31,914 | There (v26-0923-7, HB) — 범위 맨 끝 '저장' 다음 | `_vRhyThereSplit`, `_vRhyBands`, `secs`, `renderVDashRhythm`, `dow`, `_lord` |
| 32,114 | 장절 느슨한 대조 | `_refNorm` |
| 32,151 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 32,195 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 32,278 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoTab`, `_vsetGoColl`, `_vsetFlashTab`, `openVerseSettingsFromMenu`, `openVerseSettingsFromLogo`, `openVerseCollFromListMenu`, `openVcCollSettings`, `_vsetRestoreBack`, `vsetGoDashboard`, `vDashOpenCollSettings` … 외 1개 |
| 32,439 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `_vDashDetailDotsHTML`, `vDashOpenDetail`, `_vDashDetailGo`, `_vDashDetailSlide`, `_initVDashDetailSwipe`, `slide`, `bodyEl`, `finish`, `_vDashDetailKey`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup` … 외 10개 |
| 32,836 | 위젯이 보는 범위 (v26-0904-7, HB) | `_vcScope`, `_vcScopeIsHome`, `_vcScopeCount`, `_vcSyncKind`, `_vcView`, `_vcScopeKey`, `_vcScopeIcon`, `_vcScopeLabel`, `_vcScopeParts` |
| 32,899 | 자동 넘김 (v26-0904-10, HB) | `_vcAutoOn`, `_vcAutoMin`, `_vcAutoSeq`, `_vcAutoOffset`, `_vcAutoSlot` |
| 32,948 | 앱을 껐다 켤 때 (v26-0905-10, HB) | `_vcAutoAnchors`, `_vcAutoSaveAnchors`, `_vcAutoSetAnchor`, `_vcAutoResetAnchors`, `setVcAuto`, `setVcAutoMin` |
| 33,004 | 이름 넘김 방식·간격 (v26-0905-8, HB) | `_vcRollSec`, `_vcRollMode`, `_vcRollOpt`, `_rollSecLabel`, `setVcRollMode`, `setVcRollSec`, `vcRollSecInput`, `_vcHeadMode`, `setVcHeadMode`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId` … 외 5개 |
| 33,112 | 카드가 도는 범위 | `_vcListItems`, `_vcVerseOf`, `hit`, `_vcKeyOf` |
| 33,143 | 명제의 대표 문구 (v26-0904-10, HB) | `_vcHiSplit`, `_vcVerses`, `_vcCurrent` |
| 33,203 | 자동 넘김 시계 | `_vcAutoChanged`, `_vcAutoSlide`, `finish`, `_vcAutoTick`, `_vcAutoStart`, `_vcFilterLabel` |
| 33,285 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 33,325 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 33,336 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 33,357 | 카드 한 장 HTML | `_vcCardHTML` |
| 33,441 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 33,535 | 카드 동작 | `_vcReactKeyOf`, `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind` |
| 33,676 | 카드 ⇄ 목록 | `vcSetView`, `vcToggleView`, `vcAddCard`, `_vwScopeOpts`, `openVwScope`, `closeVwScope`, `renderVwScope`, `row`, `_vwKeepSortHTML`, `chip`, `_vwScopeBindHold`, `go`, `vwScopeCollSettings`, `vwScopePick` … 외 3개 |
| 33,851 | 말씀 목록 모습 한 벌 | `_vcListHTML`, `_vcAttachGestures` |
| 33,992 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `hmBtn`, `rmBtn`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale` … 외 2개 |
| 34,220 | 월간뷰 위젯 1단 / 2단 (HB 2026-10-27 B1) | `_layColsFor`, `_layColKeys`, `_layColOf`, `_layAllPlaced`, `_layDrop`, `_wkWideSide`, `_monthWideSide`, `_laySpanSide`, `rpMonthWideMenu`, `rpWeeklyWideMenu` |
| 34,274 | 주간 ⇄ 월간 바꾸기 [W\|M] (v. 26-1030-8, HB) | `_rpWMSegOn`, `_rpWMSegHTML`, `_rpWMBodyEls`, `_rpWMSwap` |
| 34,333 | 주간 · 월간 위젯 접기 (v. 26-1030-9, HB) | `_rpFoldOf`, `f`, `_rpFoldData`, `_rpFoldDayLabel`, `_rpFoldEvHTML`, `_rpFoldFlagTxt`, `_rpFoldLineRow`, `_rpFoldSumH`, `v`, `_rpFoldSumHTML`, `more`, `flrow`, `_rpFoldFitSum`, `_rpFoldFit` … 외 4개 |
| 34,518 | 한 줄 ⇄ 요약을 손가락으로 — 부채처럼 펼쳐지고 접힌다 (v. 26-1031-3, HB) | `_rpMorphStart`, `cl`, `draw`, `finish`, `springTo`, `rpFoldCycle`, `done`, `_rpAttachFoldTap`, `rpSwapWM`, `outEls`, `go`, `_rpWMSegResume`, `_b7PopClose`, `_b7Pop` … 외 6개 |
| 34,938 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 34,956 | 각 컬럼 렌더링 | – |
| 34,976 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 34,984 | There · 성경: 상단 말씀이 켜졌을 때만 (_gnbExtrasSync) | – |
| 34,987 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 35,000 | 두 칸 자리(#weeklyPane) · 주간뷰 | – |
| 35,030 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 35,072 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 35,190 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 35,285 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `placeM`, `up`, `_rpAttachHeaderDrag`, `bindHold`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn`, `curSecId` … 외 2개 |
| 35,968 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 35,969 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 35,992 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 36,046 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 36,174 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount` |
| 36,186 | Even Deeper 는 **개발자 계정에만** 보인다 (v26-0922-17, HB) | `_evenOn`, `_syncEvenVisibility`, `_syncDevVerBadge`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge` … 외 10개 |
| 36,439 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 36,475 | 개발자 쪽지 (설정창 계정탭) | – |
| 36,487 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 36,882 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass` |
| 37,093 | 하위·메모: 자료 다루기 (순수 함수) | `_subsOf`, `_subStat`, `_subParse`, `_subSyncParent`, `want`, `_subSetAll`, `_subsCopy`, `_carryTaskExtras` |
| 37,148 | 메모 안에서 알아보는 것 (URL·전화·이메일·날짜) | `_memoScan`, `_memoDateKey`, `_memoTelDigits` |
| 37,199 | 하위·메모: 화면 | `_taskArrOf`, `_subRerender` |
| 37,212 | 줄 끝의 작은 원형 게이지 | `_subGaugeSVG`, `r`, `_subGaugeFill`, `_memoBadgeFill`, `_wireSubHandle`, `clearLp`, `_subToggleBadgeFill`, `makeSubToggleBadge`, `_attachSubMemoBadges`, `_subPrune`, `_subKey`, `_subIsOpen`, `_subToggleOpen`, `open` … 외 2개 |
| 37,344 | 하위 할일 판 | `makeSubPanel` |
| 37,362 | 하위 줄 끌어 순서 바꾸기 (HB 2026-10-29) | `_subReorder`, `_sdrRows`, `_sdrQuiet`, `_sdrStart`, `_sdrPlace`, `_sdrMove`, `_sdrEnd`, `finish`, `_wireSubDrag` |
| 37,460 | 터치: 60ms 넘게 가만히 있으면 '누르는 중' — 그때부터 스크롤을 붙잡고, LONG_PRESS_TOUCH 에 들린다 | `clear` |
| 37,492 | 마우스: 눌린 채 4px 움직이면 들린다 (빅블럭의 빈 자리 끌기와 같다). 고치는 중인 글자 칸은 글자 고르기 | `_makeSubRow`, `_makeSubGhost`, `fit`, `commit`, `_subAdd`, `_subRemove` |
| 37,672 | 하위 줄 메뉴 (위로 · 아래로 · 꺼내기 · 삭제) | `openSubRowMenu`, `row`, `closeSubRowMenu`, `_subMoveFromMenu`, `_subRemoveFromMenu`, `_subPromoteFromMenu`, `openTaskMemo`, `closeTaskMemo` |
| 37,773 | 메모 팝업 크기 — 네 모서리로 조절, 이 기기에만 기억 (v26-1028-8, HB) | `_memoClampSize`, `_memoApplySize`, `toggleTaskMemoEdit`, `_memoItem`, `_memoSaveEdit`, `_memoRender`, `_memoViewHTML` |
| 37,881 | 알아본 것을 눌렀을 때의 동작 메뉴 | `openMemoActMenu`, `row`, `closeMemoActMenu`, `_memoCopyText`, `memoActRun`, `_memoMoveTaskToDate`, `_memoSaveToPhone`, `name`, `openContactsModalWith`, `set` |
| 38,067 | 할일 메뉴의 두 줄 ('하위 할일' · '메모') | `openSubsFromMenu`, `openMemoFromMenu`, `_prayDb`, `_prayUid`, `_prayTree`, `_prayLoadGroups`, `_prayPickClose`, `_prayPlace`, `_prayPanel`, `_prayOpenGroups`, `_prayOpenKids`, `_prayPickHover`, `_prayPickTap`, `_praySend` … 외 10개 |
| 38,352 | 시리: 앱에 잇는 자리 | `_siriPlace`, `_siriSaved`, `_siriRenderSettings`, `siriMakeKey`, `_siriMakeKeyNow`, `siriCopyUrl`, `ok`, `makeBigWrap`, `getCarryCount`, `_playDoneFx`, `style`, `_fxGlow`, `_fxRipple`, `populateCarryBadge` … 외 3개 |
| 38,623 | 행보다 긴 할일 (H-6, HB 2026-10-22) | `_ovfQueue`, `_ovfMode`, `_ovfClear`, `_ovfRun`, `_syncTaskOvfBtns`, `v` |
| 38,691 | 긴 할일 고치기 — 여러 줄 칸 (H-6, HB 2026-10-22) | `_longEditOpen`, `close`, `back`, `_makeUrgentBadgeHTML`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal`, `makeSmWrap`, `makeSmItem`, `makeSmInlineGhost`, `openSmGhost`, `closeSmGhost`, `renderSmList` … 외 3개 |
| 39,277 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 39,282 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `beginMouseDrag`, `cancelMousePress` |
| 39,355 | Desktop: right-click → task move context menu | – |
| 39,363 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 39,568 | Hold off the browser's scroll gesture WHILE the long-press | – |
| 39,596 | 더블탭 = 중요 표시 토글, 트리플탭 = 긴급 표시 토글 | – |
| 39,630 | 끌 때 줄들이 비켜 주기 (HB 2026-10-28 B7-2) | `_drTy`, `_drRect`, `_drFlipEls`, `_drSlotBegin`, `_drPlace`, `_drSlotEnd`, `_drGhostLand`, `_drBlurTaskInput`, `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 39,768 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 39,783 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 39,836 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 40,218 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey` |
| 40,393 | 휴대폰 자판의 '이동' 키 = 다음 칸으로 (v. 26-1030-7, HB) | `_softEnter`, `_taskEnterNext`, `arrOf`, `nRow`, `go`, `_finishEditKeepRow`, `buildFlatList`, `findFlatIndex`, `getRowEl`, `refreshActiveVisuals`, `clearActive`, `setActiveSingle`, `isAnyInputFocused`, `activateItem` … 외 4개 |
| 40,602 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 40,669 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 40,817 | While editing a big/small task's text | – |
| 40,829 | Not editing text: arrow-key driven selection | – |
| 40,860 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `_kbWOn`, `_kbWEls`, `_kbWName`, `_kbWSync`, `_kbWSet`, `_kbWStep`, `_kbWGo`, `_kbWPage`, `_kbWEnter` |
| 41,031 | 할일 다루기 | `_kbSelItems`, `_kbAnchor`, `_kbSecId`, `_kbToggleDone`, `_kbReactivate`, `_kbDelete`, `_kbOneSel`, `arr`, `_b7TaskKey` |
| 41,131 | 들어오는 문 | `_b7KbReady`, `_b7BoardKey` |
| 41,154 | 위젯 포커스를 잡은 동안 | – |
| 41,169 | 포커스를 잡기 전 — 여기서만 새 글쇠를 받는다 | `_kbWHint`, `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `_contactTaskSvg`, `_wireContactTaskBadge`, `makeContactBadges`, `contactBadgeCountChanged` |
| 41,452 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 41,529 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 41,603 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 41,704 | Event add modal | `syncRollDisplays` |
| 41,732 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 42,014 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 42,081 | Touch | – |
| 42,113 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `deleteEventFromModal`, `_evDeleteAt`, `_gcalTz`, `_gcalDsh`, `_gcalCfg`, `_gcalSetCfg` … 외 10개 |
| 42,409 | 구글 쪽 바뀜 알아채기 (v26-1024-8, HB '구글에서 고친 것이 늦거나 안 온다') | `_gcalSeen`, `_gcalProbe`, `_gcalDefSec`, `_gcalFind`, `_gcalGone`, `_gcalTomb`, `_gcalOnSave`, `_gcalKick`, `_gcalRunRemote`, `bad`, `_gcalApplyLocal`, `gcalSync`, `_gcalBoot`, `_gcalAfterConnect` … 외 13개 |
| 42,775 | 일정 입력창의 캘린더 고르기 (v26-1024-1, HB) | `_gcalPickRender`, `opts`, `draw` |
| 42,808 | 여러 날 일정 (v26-1024-2, HB) | `_gcalSpanN`, `dsh`, `_gcalMD`, `_gcalSpanTag`, `_gcalLanes`, `_gcalMonthLanes`, `_wmEvClick`, `wmEvEdit`, `_gcalSegHTML`, `lb`, `_gcalPickApply`, `_gcalPickApplyV`, `closeTaskMenu`, `toggleTaskFlag` … 외 4개 |
| 43,006 | 긴급 표시 스포트라이트 | `_applyUrgentSpotlight`, `_ensureUrgentSpotlightObserver`, `_urgentItemsOn`, `_clearUrgentOnDone`, `_doToggleUrgent`, `toggleTaskUrgent`, `toggleUrgentRank`, `_newTask`, `_autoContactMark`, `toggleTaskContact`, `_repBadgeFill`, `body`, `_taskRepDefault`, `_taskRepWeekly` … 외 7개 |
| 43,266 | 옛 자료 옮겨심기 | `_migrateTaskRepeats` |
| 43,300 | 그 날짜의 실체 만들기 | `materializeRepeatsFor`, `ensureDailyRepeats`, `ensureRepeatsForView` |
| 43,342 | 보여주기용 앞날 미리보기 (저장하지 않는다) | `getDisplayTasks`, `own` |
| 43,366 | 매일/매주 반복 켜고 끄기 | `toggleDailyRepeat`, `toggleWeeklyRepeat`, `_taskSetRepeat`, `_REP_SCOPE_IC`, `_repScopeAsk`, `kindWord`, `verb`, `closeRepScope`, `_repScopePick` |
| 43,487 | 묶음을 훑어 지우기 | `_repPurgeTasks`, `_repPurgeEvents`, `_repAddEx`, `_repHiddenOn` |
| 43,542 | 일정의 원본 찾기 | `_evRepRootOf`, `_evInSeries` |
| 43,562 | 규칙을 물려줄 때 끝날·뺀 날은 잃지 않는다 | `_repKeepMarks` |
| 43,575 | 일정 범위 묻기에 쓰는 말 (v. 26-1030-5, HB) | `_evMd`, `_evScopeRows`, `root`, `_toastName`, `_evGcalNote`, `_evSecFor`, `_evRehome`, `_evEditApply`, `putOverride`, `_evOverrideDays`, `_evInheritCal`, `_evDeleteApply`, `_evMoveAsk`, `_evMoveApply` … 외 12개 |
| 43,956 | 반복 할일 옮기기 (HB 2026-10-28 B3-2, tests/test_repeat_move.js) | `_taskIsRep`, `_repPlain`, `_repMoveApply`, `_repMoveAsk`, `item`, `_dayKeyDiff`, `moveTaskTo`, `_moveLabel`, `_freshTaskCopy`, `_dupDoneSync`, `_dupDoneReset`, `_dupDoneToggle`, `_finishOriginal`, `duplicateTaskTo` … 외 14개 |
| 44,295 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | – |
| 44,302 | 구간 열어 보이기 (v26-1015-9, HB) | – |
| 44,305 | 구간을 손으로 켜고 끌 때 보기 단추 풀기 (v. 26-1031-5, HB) | `_presetVisTouched`, `_secClosed`, `_revealSec`, `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_dayTaskSecs`, `_fillTaskMenuCounts`, `_tmSubPanel`, `_tmSubReset`, `_tmSubHide`, `_tmSubOpen`, `_tmSlide` … 외 5개 |
| 44,530 | 완료 후 다음 할일 | `nextAfterDoneTo`, `nextAfterDoneYesterday`, `_todayDateObj`, `nextAfterDoneYday`, `nextAfterDoneYdayPicked`, `nextAfterDonePicked`, `_focusNewTaskInput`, `sel`, `_secPickOn`, `_daySecTasks`, `_secPickSecs`, `_secPickSpecFor`, `_secPickFloat`, `_secPickRender` … 외 35개 |
| 45,378 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 18개 |
| 45,806 | M뷰 칸 높이 (v26-1024-6, HB) | `_mGridH`, `_mGridSetH`, `_mFitCells`, `_mGridApplyH`, `fit`, `minH`, `initMonthlySwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd` |
| 45,951 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender` |
| 46,016 | 성경 단추 길게 누르기 · 우클릭 = 읽기 계획(읽기모음) 메뉴 (HB 2026-10-27 A1) | `bibleToReadMenu`, `_bibleBtnLongPress`, `_EMBED`, `_embedPost`, `_embedIdleSoon`, `_embedAllClosed`, `_embedDone`, `_embedClean`, `_embedOn`, `_embedTheme`, `_embedRun`, `_embedWatchPeek`, `check`, `_embedStart` … 외 3개 |
| 46,172 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` |
| 46,353 | 설정창은 이 기기에서 마지막에 쓰던 탭으로 열린다 (v26-1024-19, HB) | `_setTabMemKey`, `_setTabMemGet`, `_setTabMemPut`, `_vsetStartTab`, `openAccountSettings`, `openSettings`, `_flashSettingsTab`, `closeSettings`, `closeSettingsOnBg`, `closeAccountSensitiveModals`, `renderSettingsPanel`, `_chk`, `_syncBpPickers`, `fill` … 외 7개 |
| 46,792 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 46,793 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 46,865 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 47,146 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 47,327 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n` |
| 47,344 | 설정창 묶음 카드 (v26-1024-15, HB — 타이머 설정창처럼 · 세 창 공통 규칙) | `_sgEdges`, `sgFold` |
| 47,366 | 묶음 접기 — 기기 폭에 따라 (v26-1024-20, HB S-5) | `_sgDevClass`, `_sgTitle`, `_sgFoldMem`, `_sgFoldMemPut`, `_sgFoldDefaultOpen`, `_sgFoldInit`, `sgGroupToggle`, `_sgFoldSum`, `_sgFoldSumAll`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget` … 외 2개 |
| 47,690 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 47,787 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 47,862 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 47,919 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 48,008 | Backup / restore | – |
| 48,009 | 백업에 담는 '말씀 쪽' (v26-0921-8, HB 4-5) | `_myProductSettings`, `_backupPayload`, `sw`, `exportBackup`, `_backupDownload`, `_bakDevice`, `buildBackupFilename`, `email`, `emailTag`, `bkKey`, `n`, `importBackup` |
| 48,218 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount` |
| 48,323 | 반복 할일의 이월 (HB 2026-10-28 B3-0 · B3-1, tests/test_carry_repeat.js) | `_carryIsRep`, `_carryWants`, `_repOnDay`, `_doCarry`, `runCarryNow` |
| 48,394 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 48,399 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 48,421 | 진단 기록 보조 저장소 (localStorage) | – |
| 48,425 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 49,003 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 49,035 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 49,142 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 49,158 | Day-change catch-up on wake | – |
| 49,211 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 49,386 | 말씀 모음 동기화 결과 화면 (v26-0913) | `_escHtml`, `showSyncResultModal`, `totalChg` |
| 49,463 | 영상 링크가 없는 설교 (v26-1005-1, HB) | `_syncNoVideoHTML`, `a` |
| 49,489 | "새로 들어온 말씀을 목록에 포함시키기" (v26-0916-2, HB) | `_syncIncludeInit`, `total`, `_syncGoBtn`, `syncIncludeOpenFull`, `list`, `_syncIncludeRender`, `bub`, `syncIncludeNow`, `syncIncludeUndo`, `_syncCatWeight`, `_syncGroupWeight`, `w`, `closeSyncResultModal` |
| 49,619 | 따로 포함한 목록 (v26-0916-2, HB) | `openPlusList`, `closePlusList`, `setPlusTab`, `_plusAfterChange`, `plusRemoveKeys`, `plusRemoveCat`, `plusRemoveTopic`, `plusClearAll`, `renderPlusList`, `addRow` |
| 49,734 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 49,829 | 푸시 배관(토큰) 공용 | – |
| 49,840 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 49,954 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 49,982 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub` |
| 50,012 | 알림 서버에 '예약을 다시 짜 주세요' (v26-1024-13) | `_pushReplan` |
| 50,027 | 기기 등록에 앱 표시 (v26-1024-13) | `_pushTagProduct`, `initForegroundPush` |
| 50,056 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 50,068 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 50,099 | 알림 테스트 | `testLocalNotification`, `sendTestPush` |
| 50,137 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_upTries`, `_upSetTries`, `_upClearTries`, `_verTap`, `_upReloadFresh`, `_upSafeNow`, `_upApply`, `_upCheck`, `_fbSyncReady`, `authToggleMode`, `authSetLoading`, `authSubmit` … 외 2개 |
| 50,369 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 50,456 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle`, `_fbVerIsOlder`, `_mgWhole` |
| 50,519 | 처음값 채우기는 편집이 아니다 (v. 26-1025-9, ROADMAP B-2) | `_mgIsFill`, `_mgFillSide`, `_mgSetting`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay` |
| 50,659 | 긴급 표시 한도(하루 2개)를 병합 뒤에도 지킨다 (v26-0914-3) | `_mgEnforceUrgentCap`, `_mgById`, `_fbHasAdoptedCloud`, `_fbCountArrays`, `_fbCountByKind`, `_fbCountItems`, `_fbBulkLoss`, `_fbMergeGuarded`, `_fbMerge`, `_dfJ`, `_dfSame`, `_dfCut`, `_dfQ`, `_dfDay` … 외 7개 |
| 50,932 | 안쪽 이름표를 사람 말로 | `_dfSeg`, `_dfSegPath`, `_dfWord`, `_dfValS`, `_dfVal` |
| 50,990 | 값 두 벌에서 **다른 자리만** 뽑는다 | `_dfDeep`, `_dfDeepLines`, `_dfKindName`, `_dfToday`, `_dfPush` |
| 51,027 | 할일 한 구간(배열) | `_dfTaskKey`, `_dfArr` |
| 51,076 | 날짜별 할일·일정 | `_dfDays`, `A` |
| 51,094 | 말씀 모음 하나 | `_dfVKey`, `_dfColl1`, `_dfColls` |
| 51,120 | 연락처 하나 | `_dfContact1`, `_dfContacts` |
| 51,133 | 기록(암송·좋아요·담아두기·나눔·Deeper) | `_dfLogRefs`, `_dfLogs` |
| 51,162 | 설정 | `_dfSettings`, `A` |
| 51,177 | 본체 — 상태 a(이전) 에서 b(이후) 로 무엇이 달라졌나 | `_dfDiff`, `_dfBrief`, `_dfScale`, `k`, `days`, `_dfScaleText`, `_cfJ`, `_cfDiffer`, `_cfId`, `_cfSecLabel`, `_cfKindLabel`, `_cfText`, `_cfMake`, `_cfScanSection` … 외 11개 |
| 51,536 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal` |
| 51,566 | Sweeter 에서는 '말씀 쪽' 충돌만 보여 준다 (v26-0921-8, HB 4-5) | `_cfMine`, `_cfDevOnly`, `_cfOpen`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 51,678 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfNiceLabel`, `_cfGroupName`, `_cfChoiceLabel`, `_cfCutRaw`, `_cfIsStamp`, `_cfStampNice`, `_cfExplain`, `cfToggleRaw`, `_cfBaseLine`, `_cfCardHTML`, `auto` … 외 10개 |
| 51,964 | 올리기 실패 진단 (v26-1025-3) | – |
| 51,967 | 클라우드 문서 포장 (v26-1025-5) | `_fbUnz`, `u8`, `_fbDocJson`, `_fbZ`, `_fbZField`, `_fbDocBytes`, `_fbBytes`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync`, `_fbForceWrite` |
| 52,111 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `_fbSizeRows`, `_fbSizeBlock`, `_inboxDiagBlock`, `L`, `items`, `_fbDiagBlock`, `pend`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 52,348 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `_abLocalState`, `_abRankLabel`, `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn`, `_swBoardOn` |
| 52,777 | 2차 (v26-0922-2, HB) | – |
| 52,788 | 3차 (v26-0922-3, HB) — 시트의 '상황 태그'·'묵상 질문' 에서 나온다 | – |
| 52,796 | 비었을 때의 안내는 **보는 사람에 따라 달라야 한다** (v26-0923-2) | `_swWin`, `roll`, `_swInWin`, `_swPool`, `_swRecIn`, `_swEmptyText`, `who` |
| 52,886 | 담아두기 | `getKeepLog` |
| 52,899 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 52,969 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 53,164 | 저장 | `_swTilesRaw`, `_swVerRaw`, `_swLoadTiles`, `_swSaveTiles`, `_swSpareKinds` |
| 53,216 | BLOCK7 에서 내 말씀 가져오기 | `_swCountVerses`, `_swBlock7Src`, `_swImportApply`, `swImportFromBlock7`, `_swSyncNotice` |
| 53,313 | 말씀 모음 타일 | `_swColls`, `a` |
| 53,337 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermonPool`, `_swSermons`, `_swSermonVerses`, `_swBooks`, `_swTags`, `_swEvenOn`, `_swReacts` |
| 53,463 | 까닭 한 줄 (v26-0922-1, HB 2번 선택) | `_swAgo`, `_swLastTouch`, `add`, `_swWhyOf`, `key` |
| 53,522 | 오늘의 말씀 (표지 카드) | `_swToday`, `_swAxisKeys`, `_swCount`, `_swFlow`, `_swMyWeight`, `_swMD` |
| 53,618 | 기간 안의 흐름 (v26-1005-5, HB) | `_swSvcKey`, `_swInsightsWin`, `push`, `_swInsights`, `push`, `_swVersesForInsight`, `_swRhythmGrid`, `_swRhythm`, `_swSigRhythm` |
| 53,844 | 상황 태그를 **말투로** 바꾼다 (v26-0922-4 → -5 에서 전면 손질, HB) | `_swNeedSkip`, `_swNeedSay`, `bat`, `_swNeeds`, `_swAsks`, `_swValues`, `_swStrip`, `_swCountText` |
| 54,230 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swHandFont`, `day`, `_swHiText`, `_swHiHTML`, `_swLoadPhotos`, `_swPhotoPick`, `_swPhotoFor`, `_swPhotoHTML`, `_swIllHTML`, `_swBigHTML`, `_swSigWrap` … 외 6개 |
| 54,528 | 유튜브 썸네일 (v26-0922-10, HB: "타일 위아래가 비어서 안 이뻐") | `_swYtThumbFail`, `_swCellHTML` |
| 54,652 | 타일마다 바탕 사진 켜고 끄기 (v26-0922-13, HB) | `_swPhIcon`, `_swPhOn`, `_swEditBtns`, `_swTogglePhoto`, `_swArrowHTML`, `_swThereHTML`, `_swFace`, `chip`, `_swOffTileEl` |
| 54,767 | 그리기 | `_swTileClass` |
| 54,772 | 첫 그림에 쓸 말씀을 미리 뽑아 둔다 (v26-0922-21, HB) | `_swSaveBootVerses`, `_swIntroSpan`, `_swRender` |
| 54,868 | 편집 모드 | `_swEditOn`, `_swEditBtnSync`, `mine`, `board`, `swOpenCollFilter`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `w`, `_swNoMotion`, `_swTrack`, `_swTrackTo` |
| 54,977 | 한 칸 넘기기 (PC 꺽쇠·자판이 쓴다) | `_swStep`, `_swRepaint` |
| 55,004 | 누르면 전체화면 | `_swOpenVerse`, `_swGridTile`, `facet`, `_swVersesFor`, `_swTileOpen`, `md`, `label` |
| 55,119 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 55,151 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swDragHover` |
| 55,201 | 판 끝에 닿으면 저절로 굴러간다 (v26-0922-15, HB) | `_swAutoScroll`, `_swAutoStop`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap`, `_swKbTiles`, `_swKbSync`, `_swKbSet`, `_swKbStep`, `_swKbGo`, `_swKbGoX`, `_swKbPage`, `_swKbSort` … 외 5개 |
| 55,736 | 자판 단축키 도움말 | `_swKbHelpOpen`, `_kbHelpRows`, `sw`, `_swKbHelpFill`, `_kbHelpKey`, `openSwKbHelp`, `closeSwKbHelp` |
| 55,875 | 형제 앱 열기 (v26-0921-2, HB) | `_sisterApp`, `dev`, `cross`, `_sisterFill`, `swCrossToggle`, `_swCrossBtnSync`, `_sisterStandalone`, `_sisterIsIOS`, `sisterGo`, `_swBoot` |
| 55,983 | Sweeter 설정창 '계정' 탭 (v26-0921-8, HB 4-5) | `_swMergeAccountTab` |
| 56,007 | Sweeter 설정창 '뷰' 탭 병합 (v26-0921-8, HB 4-4) | `_swFillMovedRows`, `_swMergeViewTab`, `_swCoverOn`, `_swMount` |
| 56,085 | 좌상단 로고 — BLOCK7 과 **같은 손버릇**이다 (v26-0921-1, HB) | – |
| 56,095 | 우상단 톱니 — 탭 = 설정 · 롱터치 = 설정 '계정' 탭 바로 (v26-1024-17, HB) | – |
| 56,106 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `TDASH`, `add`, `dur` |
| 56,183 | 모으기: 두 기록 → 한 모양 [{date,t,time,d,app,src,label}] | `collect`, `mapPrayers`, `focusPrayers`, `dayFlow`, `mergeFlow`, `wordPray`, `wpLegend`, `hueIndex`, `hueOf`, `itemName`, `edRow`, `mapTop`, `dayTotals`, `inRange` … 외 3개 |
| 56,382 | 그리기 | `injectCSS`, `legend`, `bigNum`, `cmpLine`, `topRefs`, `bySrc`, `bySlot`, `viewWeek`, `heat`, `viewMonth`, `viewDay`, `nav`, `html` |
| 56,685 | 판 하나를 el 안에 연다 | `mount` |
| 56,749 | 부드러운 전환 (HB 2026-10-15) — 바꿀 때는 늘 옆으로 스르륵: 나가고 → 그리고 → 들어온다. 밀기는 손가락을 따라간다 | `pageTint`, `open`, `close`, `isOpen`, `redraw` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_abLocalState`  `_abRankLabel`  `_activeVersesFrom`  `_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`
`_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`  `_applySermonListSheet`  `_applySneakMaxW`  `_applyUrgentSpotlight`
`_attachRepeatButtons`  `_attachSecPickLongPress`  `_attachSubMemoBadges`  `_attachTextPinch`  `_attachVliMenus`  `_autoContactMark`
`_avgHex`  `_b7BoardKey`  `_b7KbReady`  `_b7Pop`  `_b7PopClose`  `_b7PopMount`
`_b7PopSeg`  `_b7TaskKey`  `_backupDownload`  `_backupPayload`  `_bakDevice`  `_bibleBtnLongPress`
`_bibleChapters`  `_bibleRankOfRef`  `_bibleShort`  `_bookAbbr`  `_bookCanon`  `_bookNorm`
`_bookOfRef`  `_bookSel`  `_booksOf`  `_brActiveWin`  `_brApplyLook`  `_brBind`
`_brBook`  `_brBooks`  `_brBusy`  `_brCharAt`  `_brCharAtGeo`  `_brCharRect`
`_brChrome`  `_brChromeApply`  `_brChromeFreeze`  `_brChVerses`  `_brCloseSheets`  `_brCopy`
`_brCopyFallback`  `_brCopyText`  `_brCover`  `_brCovered`  `_brDashRender`  `_brDashRows`
`_brDashStart`  `_brDashStats`  `_brDate`  `_brDev`  `_brDiagStore`  `_brDiagStuck`
`_brDiagSync`  `_brDiagText`  `_brEl`  `_brEsc`  `_brFetchJSON`  `_brFindWords`
`_brFmtMin`  `_brFmtRef`  `_brGet`  `_brHistHide`  `_brHistory`  `_brInkAdd`
`_brInkBlob`  `_brInkCut`  `_brInkDo`  `_brInkDot`  `_brInkErase`  `_brInkHeart`
`_brInkHitAt`  `_brInkHits`  `_brInkHl`  `_brInkIcon`  `_brInkId`  `_brInkInside`
`_brInkOpen`  `_brInkOrigin`  `_brInkPaint`  `_brInkPref`  `_brInkPrefSet`  `_brInkQuery`
`_brInkRefresh`  `_brInkRot`  `_brInkSpans`  `_brInkSpansFrom`  `_brInkStepPos`  `_brInkStroke`
`_brInkSym`  `_brInkSymParts`  `_brInkSync`  `_brInkTx`  `_brInkUl`  `_brIsOpen`
`_brKey`  `_brListDelete`  `_brLoadSerif`  `_brLoupe`  `_brLzGet`  `_brLzPaint`
`_brMatch`  `_brMigrateNotes`  `_brNoteHTML`  `_brNoteInline`  `_brNotesAt`  `_brNoteSave`
`_brOnScroll`  `_brOpenAct`  `_brOpenDash`  `_brOpenMemo`  `_brOpenSheet`  `_brOrigAdd`
`_brOrigHitAt`  `_brOrigLines`  `_brOrigListHTML`  `_brOrigNote`  `_brOrigOpen`  `_brOrigSend`
`_brOrigWords`  `_brParseRef`  `_brPosGet`  `_brPosSave`  `_brPosSet`  `_brProgSync`
`_brRangeOf`  `_brReadAdd`  `_brReadMs`  `_brRecent`  `_brRenderList`  `_brRenderPick`
`_brRerender`  `_brRow`  `_brRowGone`  `_brRunFind`  `_brS`  `_brSeenOf`
`_brSessEnd`  `_brSessStart`  `_brSessStep`  `_brSet`  `_brSetMark`  `_brShow`
`_brSpanLines`  `_brStep`  `_brSwipeBind`  `_brSyncAa`  `_brSyncScope`  `_brToast`
`_brTRHas`  `_brTRKey`  `_brTRList`  `_brTRRender`  `_brTRSetOrder`  `_brTRToggle`
`_brTxIdx`  `_brTxNode`  `_brTxOf`  `_brUnit`  `_brUnpark`  `_brUrl`
`_brVerseList`  `_brVerseObj`  `_brViewRef`  `_brViewVs`  `_brVmClose`  `_brVmOpen`
`_brVmRun`  `_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`  `_buildShareText`  `_bump`
`_bumpVerseStat`  `_calKey`  `_cardActionCount`  `_cardGrain`  `_cardTextLS`  `_carryDateInScope`
`_carryIsRep`  `_carryPendingCount`  `_carryScope`  `_carryTaskExtras`  `_carryWants`  `_ceFillSelects`
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
`_dNavEl`  `_doCarry`  `_doToggleFlag`  `_doToggleUrgent`  `_dragZoneMid`  `_drBlurTaskInput`
`_drFlipEls`  `_drGhostLand`  `_dropStalePending`  `_drPlace`  `_drRect`  `_drSlotBegin`
`_drSlotEnd`  `_drTy`  `_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`
`_dsStrip`  `_dsWrite`  `_dupDoneReset`  `_dupDoneSync`  `_dupDoneToggle`  `_dupVerseScan`
`_effectiveMode`  `_EMBED`  `_embedAllClosed`  `_embedClean`  `_embedDone`  `_embedIdleSoon`
`_embedOn`  `_embedPost`  `_embedRun`  `_embedStart`  `_embedTheme`  `_embedWatchPeek`
`_ensurePushToken`  `_ensureUrgentSpotlightObserver`  `_entrySecId`  `_escHtml`  `_escShown`  `_euroRo`
`_evChipCut`  `_evChipLabel`  `_evChipN`  `_evChipPreview`  `_evChipSync`  `_evDeleteApply`
`_evDeleteAt`  `_evEditApply`  `_evenDeeperShortRef`  `_evenOn`  `_evFillMins`  `_evGcalNote`
`_evInheritCal`  `_evInSeries`  `_evMarkDropSec`  `_evMd`  `_evMoveApply`  `_evMoveAsk`
`_evMoveToSec`  `_evOverrideDays`  `_evRehome`  `_evRepRootOf`  `_evScopeRows`  `_evSecAt`
`_evSecFor`  `_evSyncRange`  `_fallbackCopy`  `_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`
`_fbBulkLoss`  `_fbBytes`  `_fbClearBase`  `_fbCollectConflicts`  `_fbCommit`  `_fbCountArrays`
`_fbCountByKind`  `_fbCountItems`  `_fbDeviceIdle`  `_fbDiagBlock`  `_fbDocBytes`  `_fbDocJson`
`_fbEnsureSync`  `_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`  `_fbIsUserEdit`  `_fbLoadPersistedBase`
`_fbMaybeSelfUpdate`  `_fbMerge`  `_fbMergeGuarded`  `_fbNoteConflicts`  `_fbReady`  `_fbScheduleRetry`
`_fbSetBase`  `_fbSizeBlock`  `_fbSizeRows`  `_fbSyncReady`  `_fbUnz`  `_fbVerIsOlder`
`_fbWarnLegacyWriter`  `_fbWriteBackup`  `_fbZ`  `_fbZField`  `_fetchSheetCsv`  `_fetchVerseStat`
`_fillMinOptions`  `_fillTaskMenuCounts`  `_fillVerseBarDOM`  `_findVerseByRefLoose`  `_finishEditKeepRow`  `_finishOriginal`
`_flashPendingTask`  `_flashSettingsTab`  `_flatMemEntries`  `_flatSimpleEntries`  `_fmtRefForText`  `_fmtSubDate`
`_focusNewTaskInput`  `_freshTaskCopy`  `_fxGlow`  `_fxRipple`  `_gcalAfterConnect`  `_gcalApi`
`_gcalApplyLocal`  `_gcalBoot`  `_gcalCfg`  `_gcalDefSec`  `_gcalDsh`  `_gcalEvColor`
`_gcalEvTx`  `_gcalFetchCal`  `_gcalFetchInst`  `_gcalFind`  `_gcalFn`  `_gcalGone`
`_gcalKick`  `_gcalLanes`  `_gcalListCals`  `_gcalMD`  `_gcalMonthLanes`  `_gcalOnSave`
`_gcalPickApply`  `_gcalPickApplyV`  `_gcalPickRender`  `_gcalProbe`  `_gcalRenderSettings`  `_gcalRenderStatus`
`_gcalRepNew`  `_gcalRepOn`  `_gcalRunRemote`  `_gcalSeen`  `_gcalSegHTML`  `_gcalSetCfg`
`_gcalSpanN`  `_gcalSpanTag`  `_gcalTintChip`  `_gcalToken`  `_gcalTomb`  `_gcalTz`
`_gcalUsable`  `_gcalUser`  `_gcalWinQ`  `_genCollId`  `_generateUniqueShareCode`  `_getCollFilter`
`_ghostDragStart`  `_gnbExtrasSync`  `_gnbGearMenu`  `_gnbGearSync`  `_gnbGearTap`  `_gnbPickerOn`
`_gnbPickerStep`  `_gnbRpMenu`  `_groupVersesBy`  `_groupVersesByMulti`  `_grpAddrPreview`  `_grpAddrShow`
`_grpAddrUrl`  `_grpFetch`  `_grpNameNorm`  `_grpNameValid`  `_grpRenderColls`  `_grpShowAddr`
`_grpSync`  `_gSrcId`  `_hdrCalRender`  `_hexNum`  `_hiAssign`  `_hiBold`
`_hiFw`  `_hiHash`  `_hiHTML`  `_hiKindsOn`  `_hiLinesHTML`  `_hiOn`
`_hiOverlap`  `_hiOverlay`  `_hiPen`  `_hiPhrases`  `_hiPickAt`  `_hiRanges`
`_hiRefreshAll`  `_hiRibbon`  `_hiRng`  `_hiShuffle`  `_hiSmooth`  `_hiSquash`
`_hiStar`  `_hiStarMax`  `_hiStarPoly`  `_hiWave`  `_hiWavePoly`  `_hiWob`
`_idbDel`  `_idbDelOutcome`  `_idbDelRaw`  `_idbForget`  `_idbGet`  `_idbGetOutcome`
`_idbGetRaw`  `_idbOpen`  `_idbRaw`  `_idbSet`  `_idbSetOutcome`  `_idbSetRaw`
`_importVerseRows`  `_inboxDiagBlock`  `_initBibleBtnMenus`  `_initEdgeBack`  `_initHdrDateLongPress`  `_initSettingsSwipe`
`_initSneakMaxWPicker`  `_initVDashDetailSwipe`  `_initVerseAlarmPicker`  `_initVerseBandDrag`  `_initVerseBarResize`  `_initVerseBarSwipe`
`_initVerseFullGestures`  `_initVerseGridGestures`  `_initVerseNotifBridge`  `_initVerseSettingsSwipe`  `_initVfCatSheet`  `_invalidateVerseCaches`
`_isDevAccount`  `_isPhoneForm`  `_isPropSheet`  `_isReactPid`  `_isRepRoot`  `_isSermonListSheet`
`_isTouchDevice`  `_joinApply`  `_joinClear`  `_joinFromPath`  `_joinRead`  `_kbAnchor`
`_kbDelete`  `_kbHelpKey`  `_kbHelpRows`  `_kbOneSel`  `_kbOverlayOpen`  `_kbReactivate`
`_kbSecId`  `_kbSelItems`  `_kbToggleDone`  `_kbWEls`  `_kbWEnter`  `_kbWGo`
`_kbWHint`  `_kbWName`  `_kbWOn`  `_kbWPage`  `_kbWSet`  `_kbWStep`
`_kbWSync`  `_keepAfterChange`  `_keepAttr`  `_keepBindDrag`  `_keepDeleteList`  `_keepEntries`
`_keepFlipRender`  `_keepListOf`  `_keepLists`  `_keepListsOf`  `_keepNameCommit`  `_keepNameKey`
`_keepOrder`  `_keepPairSort`  `_keepRenameList`  `_keepRepaintLists`  `_keepSetOrder`  `_keepSort`
`_keepSortLists`  `_keepSortRowHTML`  `_keepSwitchIsOpen`  `_lay`  `_layAllPlaced`  `_layApplyWidths`
`_layColKeys`  `_layColOf`  `_layColsFor`  `_layDrop`  `_layFormMode`  `_layInitDividers`
`_layIsKnownType`  `_layMode`  `_laySpanSide`  `_loadSheetJs`  `_localOwner`  `_logoMenuEsc`
`_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_longEditOpen`  `_looksLikeRef`  `_lord`
`_lsDropBase`  `_lsk`  `_lsPutST`  `_lsStKey`  `_lvApplyIn`  `_m2t`
`_makeBoundaryRoll`  `_makeBoundaryRow`  `_makeSubGhost`  `_makeSubRow`  `_makeTimeRollPair`  `_makeUrgentBadgeHTML`
`_makeWMViewBtnsHTML`  `_memoApplySize`  `_memoBadgeFill`  `_memoClampSize`  `_memoCopyText`  `_memoDateKey`
`_memoItem`  `_memoMoveTaskToDate`  `_memoRender`  `_memoSaveEdit`  `_memoSaveToPhone`  `_memoScan`
`_memoTelDigits`  `_memoViewHTML`  `_menuArmOnNextPress`  `_menuFitHeight`  `_menuLockScroll`  `_mFitCells`
`_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`  `_mgEnforceUrgentCap`  `_mgEntryArray`
`_mgFillSide`  `_mgIsFill`  `_mgLogFlat`  `_mgLogNested`  `_mGridApplyH`  `_mGridH`
`_mGridSetH`  `_mgSetting`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`  `_migrateTaskRepeats`
`_monthWideSide`  `_moveDateToastMsg`  `_movedTaskCopy`  `_moveLabel`  `_mviewEventCountsHTML`  `_mviewRowHTML`
`_myProductSettings`  `_newRid`  `_newTask`  `_noiseTile`  `_notifAckToSW`  `_notifAnnounceReady`
`_notifAuthBlocking`  `_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`  `_notifLog`
`_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifMark`  `_notifNewId`  `_notifPid`
`_notifSameRef`  `_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`  `_notifStop`
`_notifTakeIntent`  `_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`  `_openCellEvent`
`_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openPropDeeper`  `_openVerseByRef`  `_openVerseFromLink`
`_outcomeText`  `_ovfClear`  `_ovfMode`  `_ovfQueue`  `_ovfRun`  `_parseCsv`
`_parseVDate`  `_pick`  `_playDoneFx`  `_plusAdd`  `_plusAfterChange`  `_plusGroups`
`_plusHas`  `_plusHiddenKeys`  `_plusKeyOf`  `_plusPrune`  `_plusTidy`  `_plusVerses`
`_plusVisibleMask`  `_populateMorningTimePickers`  `_prayDb`  `_prayLoadGroups`  `_prayOpenGroups`  `_prayOpenKids`
`_prayPanel`  `_prayPickClose`  `_prayPickHover`  `_prayPickTap`  `_prayPlace`  `_praySend`
`_prayTodoPlace`  `_prayTodoPull`  `_prayTodoWatch`  `_prayTree`  `_prayUid`  `_presetVisTouched`
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
`_renderVfSecAssign`  `_renderVfThemeChips`  `_reorderTaskPriority`  `_rep2`  `_REP_SCOPE_IC`  `_repAddEx`
`_repBadgeFill`  `_repBlocked`  `_repEx`  `_repHiddenOn`  `_repKeepMarks`  `_repKindOf`
`_repMoveApply`  `_repMoveAsk`  `_repOnDay`  `_repPlain`  `_repPurgeEvents`  `_repPurgeTasks`
`_repRule`  `_repScopeAsk`  `_repScopePick`  `_repUntil`  `_revealSec`  `_rewriteLogRefs`
`_rgba`  `_ridPresentOn`  `_rollFit`  `_rollHTML`  `_rollIdx`  `_rollNoTr`
`_rollSecLabel`  `_rollShow`  `_rollStart`  `_rollTick`  `_rowsToItems`  `_rpAddBtnHTML`
`_rpAttachChipDrag`  `_rpAttachFoldTap`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`  `_rpAttachVResize`  `_rpChipName`
`_rpCurrentRatio`  `_rpFoldData`  `_rpFoldDayLabel`  `_rpFoldEvHTML`  `_rpFoldFit`  `_rpFoldFitAll`
`_rpFoldFitOne`  `_rpFoldFitSum`  `_rpFoldFlagTxt`  `_rpFoldHandleHTML`  `_rpFoldLineRow`  `_rpFoldOf`
`_rpFoldSet`  `_rpFoldSumH`  `_rpFoldSumHTML`  `_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`
`_rpMonthOf`  `_rpMorphStart`  `_rpNormMonth`  `_rpSetMGridH`  `_rpSetVCardH`  `_rpSetVListH`
`_rpSetWkH`  `_rpTypeOk`  `_rpVCardH`  `_rpVListH`  `_rpWidgetHTML`  `_rpWidgetName`
`_rpWkH`  `_rpWMBodyEls`  `_rpWMSegHTML`  `_rpWMSegOn`  `_rpWMSegResume`  `_rpWMSwap`
`_sdrEnd`  `_sdrMove`  `_sdrPlace`  `_sdrQuiet`  `_sdrRows`  `_sdrStart`
`_secArchiveApply`  `_secArchiveCapture`  `_secBoundaryChoices`  `_secClosed`  `_secDataCount`  `_secFirstBoundary`
`_secIdForTime`  `_secIdNowAll`  `_secIsCustom`  `_secLenMin`  `_secMoveTo`  `_secNormalizeTimes`
`_secNoTime`  `_secOffsets`  `_secPickBack`  `_secPickCancelClose`  `_secPickChoose`  `_secPickFloat`
`_secPickOn`  `_secPickOpen`  `_secPickOpenFromRow`  `_secPickRender`  `_secPickScheduleClose`  `_secPickSecs`
`_secPickSpecFor`  `_secsCommit`  `_secStripData`  `_secTimeChoices`  `_secWouldEmptyDay`  `_sermonCatNorm`
`_sermonListMap`  `_sermonNoVideo`  `_sermonSkipNoVideo`  `_sermonYtFor`  `_setLocalOwner`  `_setTabMemGet`
`_setTabMemKey`  `_setTabMemPut`  `_sgDevClass`  `_sgEdges`  `_sgFoldDefaultOpen`  `_sgFoldInit`
`_sgFoldMem`  `_sgFoldMemPut`  `_sgFoldSum`  `_sgFoldSumAll`  `_sgTitle`  `_shareCopy`
`_sharedVerseIn`  `_sharedVerseOut`  `_shareFileName`  `_shareMessage`  `_shareResetBigText`  `_shareSizeKey`
`_sheetCopyPending`  `_sheetCopyThenGo`  `_sheetCsvEndpoints`  `_sheetDrag`  `_sheetDragBindSettings`  `_sheetEditCall`
`_sheetEditErrText`  `_sheetEditProbe`  `_sheetEditUrlNorm`  `_sheetGo`  `_sheetGoMain`  `_sheetIsPc`
`_sheetMainBuild`  `_sheetMainLoad`  `_sheetMainReady`  `_sheetMainTtl`  `_sheetMainWarm`  `_sheetOpenPropMain`
`_sheetRowsSane`  `_sheetUrlForVerse`  `_shotDraw`  `_shotFont`  `_siriDate`  `_siriDayLabel`
`_siriMakeKeyNow`  `_siriParse`  `_siriPlace`  `_siriRenderSettings`  `_siriSaved`  `_siriSecAt`
`_siriT2m`  `_siriYmd`  `_sisterApp`  `_sisterFill`  `_sisterIsIOS`  `_sisterStandalone`
`_sneakMaxW`  `_sneakMaxWDefault`  `_softEnter`  `_sortEventsKeepingTimeless`  `_sortGroups`  `_srchActBg`
`_srchActClose`  `_srchActDate`  `_srchActDo`  `_srchActDone`  `_srchActDraw`  `_srchActOpen`
`_srchBackToast`  `_srchBindLongPress`  `_srchChip`  `_srchClear`  `_srchContactTel`  `_srchDayNum`
`_srchDayTxt`  `_srchEvDest`  `_srchEventHTML`  `_srchEvSync`  `_srchFilterFix`  `_srchFlash`
`_srchForget`  `_srchGoDay`  `_srchGoEvent`  `_srchGoTask`  `_srchHas`  `_srchInput`
`_srchIsOpen`  `_srchItemOf`  `_srchKey`  `_srchKeyAdd`  `_srchMark`  `_srchNorm`
`_srchOpenVerse`  `_srchOpenWidgets`  `_srchPick`  `_srchPickQuick`  `_srchQuickTask`  `_srchRecent`
`_srchRemember`  `_srchRender`  `_srchResult`  `_srchRun`  `_srchSecOf`  `_srchSecs`
`_srchSetKind`  `_srchSetRange`  `_srchSnippet`  `_srchStale`  `_srchTap`  `_srchTaskHTML`
`_srchToggleDone`  `_srchUnfilter`  `_srchVerseHTML`  `_srchVerses`  `_srchWeekOff`  `_srchWithTask`
`_stabList`  `_statDocKey`  `_statRefKey`  `_subAdd`  `_subFocusGhost`  `_subGaugeFill`
`_subGaugeSVG`  `_subGhostId`  `_subIsOpen`  `_subKey`  `_subMoveFromMenu`  `_subParse`
`_subPromoteFromMenu`  `_subPrune`  `_subRemove`  `_subRemoveFromMenu`  `_subReorder`  `_subRerender`
`_subsCopy`  `_subscribeShared`  `_subSetAll`  `_subsOf`  `_subStat`  `_subSyncParent`
`_subToggleBadgeFill`  `_subToggleOpen`  `_swAddTile`  `_swAgo`  `_swArrowHTML`  `_swArtHTML`
`_swAsks`  `_swAutoScroll`  `_swAutoStop`  `_swAxisKeys`  `_swBigHTML`  `_swBlock7Src`
`_swBoardKey`  `_swBoardOn`  `_swBooks`  `_swBoot`  `_swBootOff`  `_swCellHTML`
`_swColls`  `_swCount`  `_swCountText`  `_swCountVerses`  `_swCoverOn`  `_swCrossBtnSync`
`_swDragHole`  `_swDragHoleOff`  `_swDragHover`  `_swDragMove`  `_swDragStart`  `_swEditBtns`
`_swEditBtnSync`  `_swEditOn`  `_swEmptyText`  `_swEsc`  `_swEvenOn`  `_swFace`
`_swFillMovedRows`  `_swFinishSwipe`  `_swFlow`  `_swGridTile`  `_swHandFont`  `_swHiHTML`
`_swHiText`  `_swIllHTML`  `_swImportApply`  `_swInitGestures`  `_swInsights`  `_swInsightsWin`
`_swIntroSpan`  `_swInWin`  `_swIsKept`  `_swKbGo`  `_swKbGoX`  `_swKbHelpFill`
`_swKbHelpOpen`  `_swKbHint`  `_swKbKeep`  `_swKbMove`  `_swKbPage`  `_swKbReady`
`_swKbSet`  `_swKbSort`  `_swKbStep`  `_swKbSync`  `_swKbTiles`  `_swKeeps`
`_swKillTile`  `_swLastTouch`  `_swLastVerses`  `_swLoadPhotos`  `_swLoadTiles`  `_swMD`
`_swMergeAccountTab`  `_swMergeViewTab`  `_swMount`  `_swMyWeight`  `_swNeeds`  `_swNeedSay`
`_swNeedSkip`  `_swNoMotion`  `_swOffTileEl`  `_swOn`  `_swOpenVerse`  `_swPhIcon`
`_swPhOn`  `_swPhotoFor`  `_swPhotoHTML`  `_swPhotoPick`  `_swPipsHTML`  `_swPool`
`_swReacts`  `_swRecIn`  `_swRender`  `_swReorder`  `_swRepaint`  `_swRepaintKeepTiles`
`_swRhythm`  `_swRhythmGrid`  `_swSaveBootVerses`  `_swSaveTiles`  `_swSermonPool`  `_swSermons`
`_swSermonVerses`  `_swSigBook`  `_swSigColl`  `_swSigHTML`  `_swSigReact`  `_swSigRhythm`
`_swSigSermon`  `_swSigTag`  `_swSigWrap`  `_swSizeCells`  `_swSnap`  `_swSpareKinds`
`_swStep`  `_swStrip`  `_swSvcKey`  `_swSyncNotice`  `_swTags`  `_swThereHTML`
`_swTileClass`  `_swTileOpen`  `_swTilesRaw`  `_swToday`  `_swTogglePhoto`  `_swTrack`
`_swTrackTo`  `_swValues`  `_swVerRaw`  `_swVersesFor`  `_swVersesForInsight`  `_swWhyOf`
`_swWin`  `_swYtThumbFail`  `_syncBpPickers`  `_syncCarryScopeBtns`  `_syncCatWeight`  `_syncCollSheets`
`_syncCondRows`  `_syncDeeperOpenUI`  `_syncDeviceNotifyUI`  `_syncDevInboxVisibility`  `_syncDevVerBadge`  `_syncEventDateUI`
`_syncEvenVisibility`  `_syncGoBtn`  `_syncGroupWeight`  `_syncHdrDateOptical`  `_syncHiOverlapRow`  `_syncHiUI`
`_syncIncludeInit`  `_syncIncludeRender`  `_syncLayFormUI`  `_syncLinkOpenModeUI`  `_syncNoVideoHTML`  `_syncShareSettingsUI`
`_syncShareSizeUI`  `_syncSheetVersesIntoColl`  `_syncTaskOvfBtns`  `_syncTimeStepBtns`  `_syncUiScaleBtns`  `_syncVerseCondRows`
`_syncVerseFp`  `_syncVerseNextBtns`  `_syncVersePushPool`  `_syncVersePushUI`  `_syncVfTextScaleUI`  `_syncVpTimeField`
`_syncVpTimeList`  `_t2m`  `_tagartAliasMap`  `_tagartDrawOn`  `_tagartHay`  `_tagartHit`
`_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`  `_taskArrOf`
`_taskDeleteApply`  `_taskDeleteAt`  `_taskEnterNext`  `_taskFlipRender`  `_taskIsRep`  `_taskPriorityRank`
`_taskRepDefault`  `_taskRepFallback`  `_taskRepInstances`  `_taskRepRootOf`  `_taskRepRoots`  `_taskRepWeekly`
`_taskSetRepeat`  `_taskTextApply`  `_taskTextCommit`  `_tdBindAll`  `_tdBindLong`  `_tdLoadPray`
`_tdOpts`  `_TF_NOISE`  `_tfApplyTheme`  `_tfBreathAt`  `_tfBuildSprites`  `_tfCandleAt`
`_tfDevKind`  `_tfDrawCross`  `_tfFlickerAt`  `_tfFlickerParams`  `_tfFrame`  `_tfGet`
`_tfHex2Hsl`  `_tfHsl2Rgb`  `_tfLoad`  `_tfNoise`  `_tfPick`  `_tfQuiet`
`_tfSize`  `_tfSpawn`  `_tfSprites`  `_tfStore`  `_tfSyncUI`  `_tfW`
`_tfWire`  `_tfWordApply`  `_tfWordChanged`  `_tfWordFit`  `_tfWordGo`  `_tfWordMulti`
`_tfWordRect`  `_tfWordRender`  `_tfWordSet`  `_tfWordSyncUI`  `_tfWordToggle`  `_tfWordWire`
`_thAcPush`  `_thAcText`  `_thContrast`  `_thDeltaE`  `_themePreviewHTML`  `_themeSummaryText`
`_themeTokens`  `_thereBegin`  `_thereClock`  `_thereCommit`  `_thereCountFor`  `_thereDurWords`
`_thereEach`  `_thereIcHTML`  `_thereIconKey`  `_thereIconSync`  `_thereIsOpen`  `_thereRecorded`
`_thereStripHanja`  `_thereTotalSec`  `_thereWordFromBible`  `_thereWordFromVerse`  `_thFade`  `_thHex`
`_thLab`  `_thLabF`  `_thLabFi`  `_thLabRgb`  `_thLin`  `_thLum`
`_thMix`  `_thOn`  `_thPanelMix`  `_thReadable`  `_thRgb`  `_thRgba`
`_thRound`  `_thTintDE`  `_thTintK`  `_thUnlin`  `_thWorst`  `_timeStep`
`_tmFloatOK`  `_tmSlide`  `_tmSubCancelClose`  `_tmSubHide`  `_tmSubOpen`  `_tmSubPanel`
`_tmSubReset`  `_tmSubScheduleClose`  `_tmSubTap`  `_toastName`  `_toastSpin`  `_toastWithJump`
`_todayDateObj`  `_todoInboxToast`  `_toThisMonth`  `_trashAll`  `_trashClone`  `_trashCount`
`_trashCut`  `_trashDay`  `_trashPurgeOld`  `_trashRestored`  `_trashTs`  `_tryCloseLogoMenu`
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
`_vwScopeOpts`  `_vwSize`  `_wireContactTaskBadge`  `_wireSecPickRows`  `_wireSubDrag`  `_wireSubHandle`
`_wireTaskMenuDateRow`  `_wireTmSub`  `_withFullscreenLayout`  `_withOutcome`  `_withSecRo`  `_withTimeout`
`_wkFixH`  `_wkPaneActive`  `_wkVerseMarksHTML`  `_wkWideSide`  `_wmEvClick`  `_wmFsApply`
`_wmFsHTML`  `_wmFsVal`  `A`  `a`  `ab`  `act`
`activateItem`  `ACTIVE_TOTAL`  `ACTIVE_VERSES`  `ACTIVE_VERSES_ALL`  `add`  `addCustomSuffix`
`addCustomVerseFromForm`  `addDays`  `addNewCollection`  `addNewSection`  `addRow`  `addVerseAlarmCustomTime`
`ALL_VERSES`  `anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`  `applyRemoteState`
`applyScale`  `applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`
`applyUiScale`  `applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `applyView`  `arr`
`arrOf`  `assigned`  `at`  `attach`  `attachDrag`  `attachEventChipInteraction`
`attachFastTap`  `attachHdSwipe`  `attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`
`authSetLoading`  `authSignOut`  `authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`
`away`  `axisName`  `B`  `b`  `back`  `bad`
`barRef`  `barTags`  `base`  `bat`  `beforeBlock`  `beforeSave`
`beginMouseDrag`  `bibleClose`  `bibleOpen`  `bibleOpenLast`  `bibleOpenRef`  `bibleStartPreload`
`bibleToReadMenu`  `bigNum`  `bindHold`  `bkKey`  `board`  `body`
`bodyEl`  `book`  `bottom`  `bub`  `build`  `buildBackupFilename`
`buildFlatList`  `buildLanes`  `bump`  `bw`  `byName`  `byNear`
`bySlot`  `bySrc`  `C`  `c`  `cal`  `cancel`
`cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `card`  `ceAddGoogleLink`  `ceCloseDeletePopup`
`ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`  `ceOpenDeletePopup`
`ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`  `ceToggleFilter`
`ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `cfToggleRaw`  `chap`
`check`  `checkDataRecovery`  `checkVerseAlarm`  `chip`  `chM`  `cl`
`clamp`  `cleanupEmptyDays`  `clear`  `clearActive`  `clearContactForm`  `clearDropIndicators`
`clearLp`  `clearPaint`  `clearTrash`  `close`  `closeAccountSensitiveModals`  `closeCellTodo`
`closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`  `closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`
`closeDatePicker`  `closeEventEditMenu`  `closeEventModal`  `closeGroupDialog`  `closeHdrCalendar`  `closeInlineInput`
`closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`  `closeLogoMenu`  `closeMemoActMenu`  `closeMemorizationHistory`
`closeMemRecPopup`  `closePlusList`  `closeRepeatSubPicker`  `closeRepScope`  `closeRpConfig`  `closeSearch`
`closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`  `closeSfxMenu`  `closeShareDialog`  `closeSmGhost`
`closeSubRowMenu`  `closeSubscribeDialog`  `closeSwKbHelp`  `closeSyncConflicts`  `closeSyncResultModal`  `closeTaskMemo`
`closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`  `closeThere`  `closeTrash`  `closeVcSettings`
`closeVDashDetail`  `closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`  `closeVerseFull`  `closeVerseGrid`
`closeVerseListModal`  `closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`  `closeVersePopup`  `closeVerseSettingsModal`  `closeVfDeeperPicker`
`closeVfKeepSwitch`  `closeVfShare`  `closeVliMenu`  `closeVliMenuFromOverlay`  `closeVPair`  `closeVwScope`
`cmpLine`  `cnt`  `code`  `col`  `collAddAction`  `collect`
`collMenuAction`  `color`  `colX`  `commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`
`contactAction`  `contactBadgeCountChanged`  `copy`  `core`  `cross`  `ctl`
`cur`  `currentMatchingPresetName`  `currentViewKey`  `curSecId`  `cx`  `damp`
`day`  `dayFlow`  `dayOfYearVerseIdx`  `days`  `daysFromToday`  `dayTotals`
`decide`  `deeperN`  `defaultState`  `defIds`  `deleteCollection`  `deleteEventFromMenu`
`deleteEventFromModal`  `deleteLatestVerseEvent`  `deleteSection`  `deleteSectionConfig`  `dev`  `devInboxDelete`
`devInboxLoad`  `devInboxRefreshBadge`  `devInboxToggleAll`  `devInboxUpdateBadge`  `devNoteHandleFile`  `devNoteSend`
`devNoteToggle`  `devTrashDelete`  `devTrashEmpty`  `devTrashRender`  `devTrashToggle`  `dir`
`disarm`  `done`  `doRedo`  `doSaveGroup`  `doSubscribe`  `doUndo`
`dow`  `download`  `draw`  `dropDrag`  `dropSecArchive`  `dropTarget`
`dsh`  `dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`  `dur`  `editContact`
`editEventFromMenu`  `edRow`  `el`  `email`  `emailTag`  `endDrag`
`endPinch`  `endRow`  `enough`  `ensureDailyRepeats`  `ensureRepeatsForView`  `esc`
`evChipMaxCommit`  `evChipMaxInput`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`  `exportBackup`
`f`  `facet`  `fam`  `fbForceUploadLocal`  `fbPushState`  `fbStartListening`
`fill`  `findColl`  `findFlatIndex`  `findLaneIndex`  `findMentionedContacts`  `finish`
`fire`  `first`  `fit`  `fitPill`  `flrow`  `flush`
`focusItemInput`  `focusPrayers`  `fold`  `form`  `formatEventTime`  `from`
`gcalAddDays`  `gcalB7IdFor`  `gcalBody`  `gcalCollect`  `gcalConnect`  `gcalDateOf`
`gcalDayDiff`  `gcalDisconnect`  `gcalExModified`  `gcalFromG`  `gcalGidFor`  `gcalGKey`
`gcalHash`  `gcalHashEv`  `gcalInstDate`  `gcalInstMaster`  `gcalKeyOf`  `gcalPad`
`gcalParseRecur`  `gcalPatchBody`  `gcalPlan`  `gcalRecur`  `gcalRf`  `gcalRuleHits`
`gcalSeriesBody`  `gcalSetColor`  `gcalSetWrite`  `gcalStamp`  `gcalSync`  `gcalToG`
`gcalToggleCal`  `gcalToggleList`  `gcalWindow`  `gcalYmd`  `getActiveColls`  `getBibleInk`
`getBibleMarks`  `getBibleNotes`  `getBibleOrig`  `getBibleReadLog`  `getBibleToRead`  `getBigs`
`getCarryCount`  `getChips`  `getContainer`  `getCustomVerses`  `getDay`  `getDayFadeClass`
`getDeeperLog`  `getDisplayEvents`  `getDisplayTasks`  `getDOW`  `getDropTarget`  `getEvenDeeperLog`
`getEvents`  `getKeepLog`  `getLikeLog`  `getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`
`getRowEl`  `getSecColor`  `getShareLog`  `getSmalls`  `getStableDt`  `getTasksTaggedWithContact`
`getThereLog`  `getTrack`  `getTrash`  `getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`
`getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`  `getWraps`  `gid`  `gname`
`go`  `goToDate`  `grid`  `group`  `h`  `hdrCalGoToday`
`hdrCalNav`  `hdrCalPick`  `heat`  `hh`  `hi`  `hideBusyToast`
`hit`  `hmBtn`  `home`  `html`  `hueIndex`  `hueOf`
`importBackup`  `importFromFile`  `initAppUI`  `initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`
`initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`  `injectCSS`  `inkMove`  `inkStart`
`inner0`  `inRange`  `inspectRecoveryDate`  `instIdOf`  `IS_TOUCH`  `isAnyInputFocused`
`isCollActive`  `isDark`  `isExcluded`  `isNowWithinSection`  `isOpen`  `isOver`
`isSwipeZone`  `isToday`  `isTouch`  `item`  `itemKey`  `itemName`
`items`  `j`  `jong`  `K`  `k`  `keep`
`keepPickNew`  `keepPickToggle`  `keepRowDelete`  `keepRowEdit`  `keepSetSort`  `keepTogglePairSort`
`key`  `keys`  `kindWord`  `L`  `l`  `l0`
`label`  `laterLocal`  `laySetBp`  `lb`  `left`  `legend`
`likeN`  `limit`  `line`  `links`  `list`  `lo`
`load`  `logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`
`logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`  `loop`  `loose`  `LS_KEY`
`m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`  `makeContactBadges`  `makePresetChip`
`makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSubPanel`  `makeSubToggleBadge`  `makeSwipeWrap`
`manuallyCollapsed`  `map`  `mapPrayers`  `mapTop`  `mark`  `markOf`
`mastOf`  `materializeRepeatsFor`  `md`  `me`  `measure`  `memoActRun`
`mergeDuplicateVerses`  `mergeFlow`  `mid`  `mine`  `minH`  `mix`
`mk`  `mkBtn`  `mkDate`  `mode`  `monthLabel`  `monthTitleHTML`
`more`  `mount`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`
`moveDrag`  `moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`  `mvEl`
`N`  `n`  `n0`  `name`  `nameTx`  `nav`
`navigateDate`  `navigateWeek`  `needTemp`  `next`  `nextAfterDonePicked`  `nextAfterDoneTo`
`nextAfterDoneYday`  `nextAfterDoneYdayPicked`  `nextAfterDoneYesterday`  `nextVerseManual`  `note`  `now`
`nRow`  `o`  `offTest`  `ok`  `on`  `onCancel`
`onDown`  `one`  `onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`
`onNotifyMasterToggle`  `onStart`  `onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`
`onVerseAlarmToggle`  `onVerseBarClick`  `onVerseMemRecord`  `open`  `openAccountSettings`  `openCellInput`
`openCollAddMenu`  `openCollEdit`  `openCollMenu`  `openContactMenu`  `openContactsModal`  `openContactsModalWith`
`openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`  `openEventModalForDate`  `openGroupDialog`
`openHdrCalendar`  `openInlineInput`  `openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`  `openLogoMenu`
`openMemoActMenu`  `openMemoFromMenu`  `openMemorizationHistory`  `openMenuForThis`  `openPlusList`  `openRepeatSubPicker`
`openRpConfig`  `openSearch`  `openSettings`  `openSfxMenu`  `openShareDialog`  `openSmGhost`
`openSubRowMenu`  `openSubscribeDialog`  `openSubsFromMenu`  `openSwKbHelp`  `openSyncConflicts`  `openTaskMemo`
`openTaskMenu`  `openThemePicker`  `openThere`  `openThereDash`  `openThereFromVf`  `openThereTune`
`openTrash`  `openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`  `openVerseCollFromListMenu`
`openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`  `openVerseGrid`  `openVerseGridHome`  `openVerseListModal`
`openVerseMemMenu`  `openVerseSettingsFromLogo`  `openVerseSettingsFromMenu`  `openVerseSettingsModal`  `openVfDeeper`  `openVfShare`
`openVfShareFor`  `openVliMenu`  `openVPair`  `openVwScope`  `opts`  `org`
`out`  `outEls`  `overflows`  `own`  `p`  `pad`
`padH`  `padV`  `pages`  `pageTint`  `paint`  `paintAppUIFromLocal`
`paintRows`  `pairKey`  `pairOn`  `pane`  `paneHTML`  `parseItemKey`
`pass`  `pcEl`  `pct`  `pd`  `pend`  `perBtn`
`phone`  `pick`  `pickContainer`  `pickFromDeviceContacts`  `pickVfDeeper`  `place`
`placeM`  `plusClearAll`  `plusRemoveCat`  `plusRemoveKeys`  `plusRemoveTopic`  `pool`
`populateCarryBadge`  `portrait`  `prepDatePicker`  `prepDupDatePicker`  `prepNextDatePicker`  `prepNextYDatePicker`
`prepTaskMenuDatePicker`  `prev`  `prevOff`  `prevVerseManual`  `prop`  `push`
`put`  `putOverride`  `putText`  `q`  `R`  `r`
`randomVerseManual`  `rankHTML`  `raw`  `rawSave`  `rc`  `recent`
`recheck`  `recheckBurst`  `recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`
`recordVerseLike`  `recordVerseShare`  `redraw`  `ref`  `refH`  `refLine`
`refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`  `refreshVerseMarksLive`  `refs`
`removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`  `renderCeGoogleList`
`renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`  `renderLayout`
`renderMonthly`  `renderPlusList`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`
`renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`
`renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`
`renderVcSettings`  `renderVDashLink`  `renderVDashMap`  `renderVDashPie`  `renderVDashRhythm`  `renderVDashThere`
`renderVDashTrend`  `renderVerseAlarmCustomList`  `renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`
`renderVerseListCatRow`  `renderVerseListPies`  `renderVerseListResults`  `renderVerseSettingsModal`  `renderVgCfg`  `renderVgPick`
`renderVPair`  `renderVwScope`  `renderWeekly`  `repeat`  `resetStateToDefaults`  `resizeAllInputs`
`resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`  `rmBtn`
`roll`  `root`  `rot`  `row`  `rows`  `rowsOf`
`rpChMonth`  `rpFoldCycle`  `rpMonthWideMenu`  `rpSetMonthWide`  `rpSetWeeklyWide`  `rpSwapWM`
`rpWeeklyWideMenu`  `rs`  `runAutoCarryOver`  `runCarryNow`  `runGroupSync`  `runSharedCollSync`
`runVerseSheetAutoSync`  `s`  `safe`  `save`  `saveCurrentSectionConfig`  `saveText`
`say`  `SC`  `sc`  `scheduleVerseAlarms`  `scopeTxt`  `scrollActiveIntoView`
`scrollFlatIdxIntoView`  `sec`  `secDelDo`  `secHasEvent`  `secHasPendingTodo`  `secId`
`secIds`  `secs`  `sel`  `selRef`  `sendTestPush`  `sendToTrash`
`set`  `setActiveSingle`  `setCarryScope`  `setCnt`  `setDeeperOpen`  `setDeviceNotify`
`setEventTimeToggle`  `setLayFormMode`  `setLinkOpenMode`  `setNotifySuffix`  `setPlusTab`  `setShareSize`
`setText`  `setThereIcon`  `setTimeStep`  `settle`  `setTxtRefBracket`  `setTxtRefPos`
`setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`  `setupCrossViewSwipeZones`  `setVcAuto`  `setVcAutoMin`
`setVcHeadMode`  `setVcRollMode`  `setVcRollSec`  `setVcShow`  `setVcShowAll`  `setVcTextScale`
`setVcTheme`  `setVerseCountScope`  `setVerseIdx`  `setVerseNext`  `setVersePush`  `setVersePushInterval`
`setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`  `setVfArtStyle`  `setVfTextScale`  `setWMViewMode`
`sfxMenuAction`  `sgFold`  `sgGroupToggle`  `shareCopyCode`  `shareSizeOf`  `shareVia`
`sheetEditCheck`  `showAutoBackups`  `showBusyToast`  `showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`
`shown`  `showReactionToast`  `showSyncResultModal`  `showToast`  `showVersePopup`  `side`
`siriCopyUrl`  `siriMakeKey`  `sisterGo`  `slide`  `slotOf`  `snapBack`
`snapshot`  `solve`  `sortBtn`  `sortEventsByTime`  `span`  `springTo`
`src`  `srcName`  `start`  `startDrag`  `startEditContact`  `stepHiOverlap`
`stepHiStarMax`  `stickOf`  `stopLt`  `stopTimer`  `strip`  `style`
`submitContact`  `submitEventModal`  `sum`  `sumBy`  `sw`  `swCrossToggle`
`swImportFromBlock7`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`  `swKeepSet`  `swOpenCollFilter`
`swRow`  `swTitle`  `swToggleEdit`  `swToggleKeep`  `syncIncludeNow`  `syncIncludeOpenFull`
`syncIncludeUndo`  `syncP`  `syncRollDisplays`  `syncSecsFromState`  `syncVis`  `t`
`tab`  `tags`  `taskMarkerFilterPass`  `TDASH`  `testAutoCarryOver`  `testLocalNotification`
`testVerseClickPath`  `text`  `themeById`  `themeChip`  `themeNo`  `themePickerApply`
`themePickerGroup`  `themePickerPick`  `thereTuneClock`  `thereTuneFold`  `thereTuneReset`  `thereWordReset`
`thereWordSw`  `tick`  `tilt`  `tKey`  `to`  `todayKey`
`toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`  `toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`
`toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`  `togglePropTitleGroupOpen`  `togglePropTitleMotion`  `toggleSectionExclude`
`toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`  `toggleTaskMemoEdit`  `toggleTaskUrgent`  `toggleTxtIncl`
`toggleUrgentRank`  `toggleVerseAlarmContent`  `toggleVerseBarOn`  `toggleVfArt`  `toggleVfKeepSwitch`  `toggleVfPattern`
`toggleVfSecPattern`  `toggleWeeklyRepeat`  `toGraph`  `top`  `topic`  `topRefs`
`total`  `totalActive`  `totalBigCount`  `totalChg`  `TOUCH`  `touch`
`trashBgClick`  `travel`  `txt`  `u`  `u8`  `uiLevel`
`uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`  `unit`  `until`
`unwatch`  `up`  `updateHeaderDate`  `updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`
`updateSectionField`  `updateSetting`  `updateSmCnt`  `updateTotal`  `updateTrashBadge`  `updateUrBtns`
`url`  `userDocRef`  `v`  `vbShuffleVerse`  `vcAct`  `vcAddCard`
`vcClearFilter`  `vcNav`  `vcOpenFilter`  `vcOpenFull`  `vcRollSecInput`  `vcSetTextScaleLive`
`vcSetView`  `vcStepTextScale`  `vcToggleView`  `vDashKindPick`  `vDashLinkRelayout`  `vDashMapPick`
`vDashOpenCollSettings`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`  `vDashSetCustom`  `vDashSetSlices`
`vDashSetSpanMode`  `vDashSetView`  `vDashSubToggle`  `vDashToggleEtc`  `verb`  `VERSE_TOTAL`
`verseByRef`  `verseForEntry`  `verseFullNav`  `verses`  `verseSyncAllNow`  `verseUiLevel`
`vfAct`  `vfCatTap`  `vfCopyBodyOnly`  `vfHomeAction`  `vfOpenCollSettings`  `vfOpenDashboard`
`vfOpenKeepGrid`  `vfOpenKeepList`  `vfOpenNavTile`  `vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`
`vfToggleCycleMode`  `vgCfgReset`  `vgCfgSet`  `vgClearSel`  `vgCycleTab`  `vgDepthSet`
`vgPick`  `vgPickAxis`  `vgRankSet`  `vgSearch`  `vgSetBibleSort`  `vgSetSelOnly`
`vgSetTab`  `vgShowHelp`  `vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`  `vgToggle`
`vgToggleExpand`  `vgToggleGroup`  `vgToggleSel`  `vgToggleTagExcl`  `vgToggleTileExcl`  `viewDay`
`viewMonth`  `viewWeek`  `vis`  `vliAction`  `vlSetCustom`  `vlSetPeriod`
`vlSetSort`  `vlSetTab`  `vlToggleCtrl`  `vlTogglePairSort`  `vlwSetCustom`  `vlwSetPeriod`
`vlwSetSort`  `vlwTogglePairSort`  `vMapOpenChapter`  `vMapOpenGrid`  `vMapRangeSet`  `vMapToggleFold`
`vpAddTime`  `vpCycleFullTab`  `vpDelTime`  `vpDiagClear`  `vpDiagCopy`  `vpDiagRender`
`vpDiagToggle`  `vpFull`  `vpGoToFilteredTile`  `vpOpenVerse`  `vpSetTime`  `vpTile`
`vpToggleDay`  `vpToggleFilt`  `vrs`  `vsetGoDashboard`  `vTrCloseBook`  `vTrInsSet`
`vTrOpenBook`  `vTrSet`  `vTrSortBy`  `vTrSpanSet`  `vTrToggleExp`  `vTrToggleSeries`
`vw`  `vwScopeClearFilter`  `vwScopeCollSettings`  `vwScopePick`  `vwScopeToggleMode`  `W`
`w`  `want`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`  `weeks`
`weeksFromToday`  `who`  `widest`  `wireActivateClick`  `wmEvEdit`  `wmFs`
`wordPray`  `words`  `wpLegend`  `x`  `y`  `z`

