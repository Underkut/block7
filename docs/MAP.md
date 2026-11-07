# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-1107-9** · 전체 59,064줄 · 구역 498개 · 함수 3307개

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
| 467~6,910 | 6,444줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 6,911~7,206 | 296줄 (1%) | JS | 동작 (자바스크립트) |
| 7,233~7,259 | 27줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 7,260~7,329 | 70줄 (0%) | JS | 동작 (자바스크립트) |
| 7,330~7,369 | 40줄 (0%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 7,384~10,143 | 2,760줄 (5%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 10,144~10,630 | 487줄 (1%) | JS | 동작 (자바스크립트) |
| 10,631~58,186 | 47,556줄 (81%) | JS | 동작 (자바스크립트) |
| 58,187~59,061 | 875줄 (1%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 509 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 582 | 전체화면·타일뷰가 떠 있는 동안엔 **뒤 배경도 같은 색으로** 칠한다 |
| 623 | HEADER |
| 628 | GNB 위쪽 여백 (v26-0903-6, HB 스크린샷) |
| 663 | Verse bar (네비게이토 180) |
| 664 | Verse bar outer wrapper |
| 665 | 말씀 전체 화면 (릴스형) |
| 682 | There — 기도·예배 전체화면 (v26-0923-5, HB) |
| 746 | There 말씀 (v. 26-1024-14, HB) |
| 780 | There 단추 자리들 (v26-0923-5 T-4) |
| 860 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 1,022 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 1,035 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 1,056 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 1,139 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 1,157 | 기다리는 동안 보여 줄 것 셋 더 (v26-1010-9, HB) |
| 1,320 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,442 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,487 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,771 | 스닉픽 한 줄 |
| 1,927 | 검색 (v. 26-1031-8, HB 1031 1-2) |
| 2,106 | DATE NAV |
| 2,124 | GNB 날짜 (#hDate) |
| 2,147 | DATE SWIPE OVERLAY |
| 2,149 | MINI MOVE MENU |
| 2,168 | DATE PICKER OVERLAY |
| 2,252 | 모음 구역 (v26-0916-2, HB) |
| 2,322 | TIME SECTION |
| 2,353 | Event chips (shown inline in the section header, next to the |
| 2,477 | BLOCK SWIPE WRAPPER |
| 2,500 | BIG BLOCK (E method: colored left bar, no indent) |
| 2,650 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,770 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,775 | 연락처 관리 모달 |
| 2,801 | @닉네임 태그 할일 모아보기 |
| 2,861 | 하위 할일 판 |
| 2,922 | 메모 팝업 |
| 2,978 | 헤더 슬라이드 입력창 (B안) |
| 3,004 | 헤더 + 버튼 (할일 추가) |
| 3,023 | ▲ 숨기기 버튼 |
| 3,059 | TRASH PANEL |
| 3,108 | DATE NAV |
| 3,161 | TASK MOVE MINI MENU |
| 3,217 | 구간 판 — 옮길 시간 구간을 고르고, 그 구간에 무엇이 있는지 본다 |
| 3,292 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 3,316 | 할일 메뉴 '기도 노트로' 의 오른쪽 판 (v26-1013-5) — 그룹 → 서브 그룹. 메뉴와 같은 모습 |
| 3,330 | Event add modal |
| 3,490 | WEEKLY/MONTHLY |
| 3,600 | D뷰 좌우 분할 (넓은 화면) |
| 3,611 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 3,634 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 3,641 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 4,239 | LOGIN / AUTH SCREEN |
| 4,320 | SETTINGS PANEL |
| 4,377 | 설정 등급(이지·미드·파워) 고르기 |
| 4,400 | 선 그림만으로 고른 것을 나타내는 자리 |
| 4,555 | 강조 표시 고르는 줄 (v26-0812-15) |
| 4,575 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 4,742 | 시간 구간 경계선 |
| 4,875 | 고른 것 = 강조색으로 꽉 채움 (v26-1024-18, HB "선택된 버튼이 뭔지 잘 안 보인다") |
| 4,940 | 말씀 대시보드 |
| 4,984 | 대시보드 위쪽 전환 (분포 ⇄ 흐름) |
| 4,996 | 흐름(추이) |
| 5,060 | 손으로 만든 슬라이더 (v26-0906-2, HB 5-1) |
| 5,159 | 작은 발견 (v26-0906-5, HB 2) |
| 5,185 | 성경 지도 (v26-0906-5, HB 1) |
| 5,214 | 파이 상세: 조각 수 슬라이더 · '기타' 켜고 끄기 (v26-0907-4, HB 4) |
| 5,251 | 연결 — 그래프 뷰 (v26-0907-4 · v26-0907-5, HB 7) |
| 5,302 | 짝 목록 (v26-0907-6, HB 3) |
| 5,427 | 리듬 (요일 × 한 시간) (v26-0907-3, HB 5) |
| 5,551 | 색상 테마: 뷰 탭 요약 줄 |
| 5,568 | 색상 테마 선택 화면 |
| 5,661 | 미리보기 목업 |
| 5,940 | 본문에 긋기 (v26-1007-19) |
| 6,108 | 성경 읽기 대시보드 (v26-1007-9 · 시안 MmxtwQwAy2xr4DbScFJM7m) — 색은 남색 하나를 진하기로만 |
| 6,198 | 첫 그림의 색은 **테마를 따르지 않는다** (v26-0922-23, HB) |
| 6,235 | 꿀벌집 — 아래에서부터 한 칸씩 차오른다 (v26-0922-22, HB) |
| 6,311 | PC: 넓어지면 **열이 는다** (v26-0922-11, HB 4) |
| 6,579 | 유튜브 썸네일은 **제 색을 더 많이 남긴다** (v26-0922-14, HB) |
| 6,761 | 편집 모드 |
| 6,785 | PC: 자판이 보고 있는 위젯 (v26-0921-13, HB) |
| 6,795 | PC: 자판이 보고 있는 타일 (v26-0921-12, HB) |
| 6,842 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 188 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 222 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 261 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 426 | 조기 적용 (첫 페인트 전) | – |
| 7,154 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `base`, `_swBootOff`, `gcalPad`, `gcalKeyOf`, `gcalAddDays`, `gcalDayDiff`, `gcalWindow` … 외 7개 |
| 10,206 | 반복 일정 → 구글 반복 규칙 (v26-1024-3, 3단계 ①) | `gcalYmd`, `gcalRecur`, `days`, `weeks`, `until`, `gcalHashEv`, `rc`, `gcalSeriesBody`, `gcalPatchBody`, `gcalCollect` |
| 10,281 | 구글 반복 → BLOCK7 반복 (v26-1024-7, 3단계 ②) | `gcalRuleHits`, `gcalDateOf`, `gcalParseRecur`, `gcalStamp`, `gcalExModified`, `gcalRf`, `gcalInstMaster`, `gcalInstDate`, `_gcalRepOn`, `_gcalRepNew` |
| 10,367 | 판단 | `gcalPlan`, `mastOf`, `instIdOf`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 10,670 | 네비게이토 180 암송성구 데이터 | – |
| 10,697 | Color presets | – |
| 10,715 | 네비게이토 180 verse bar | – |
| 10,716 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 10,732 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 10,772 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 10,790 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 10,911 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses`, `_collPeriodVerses`, `_cfHasSel`, `_cfClearSel`, `_plusKeyOf`, `_plusHas`, `_collVerseShows`, `_collVersePassesOnly`, `_plusVisibleMask`, `_plusVerses`, `_plusPrune`, `_plusTidy` … 외 3개 |
| 11,086 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_VERSES_ALL`, `_activeVersesFrom`, `ACTIVE_TOTAL` |
| 11,135 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 11,141 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 11,231 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_collHue`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList` … 외 3개 |
| 11,584 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 11,678 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 11,736 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 11,810 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 11,928 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 12,010 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `_pick`, `gid`, `_bump` |
| 12,217 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `endRow`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propImg`, `_propYt` … 외 4개 |
| 12,518 | 상황/필요 · 묵상 질문 (v26-0922-3, HB) | `colX` |
| 12,606 | '설교 목록' 탭을 그대로 연결하기 (v26-0922-8, HB) | `_isSermonListSheet`, `_sermonCatNorm`, `_sermonListMap`, `h`, `at`, `_sermonYtFor`, `_applySermonListSheet` |
| 12,699 | 영상이 없는 설교 (v26-1005-1, HB) | – |
| 12,709 | 알리지 않는 예배 (v26-1010-7 · 침례식·특별 추가 26-1010-8, HB) | `_sermonSkipNoVideo`, `_sermonNoVideo` |
| 12,752 | 한 모음에 연결된 시트 여럿을 **한 번에** 반영한다 (v26-1004-1, HB 신고) | `_syncVerseFp`, `_syncCollSheets`, `_rowsToItems`, `_importVerseRows`, `_sheetCsvEndpoints`, `_fetchSheetCsv`, `_loadSheetJs`, `importFromFile` |
| 12,955 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 13,073 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 13,151 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 13,202 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_shareCopy`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `_grpNameNorm`, `_grpNameValid`, `_grpAddrUrl`, `_grpAddrShow`, `_grpFetch`, `_subscribeShared`, `verses`, `_grpSync` |
| 13,410 | 빼기 | `runGroupSync`, `_joinRead`, `_joinClear`, `_joinFromPath`, `_joinApply` |
| 13,527 | 그룹 만들기·고치기 (교회 쪽 화면) | `openGroupDialog`, `closeGroupDialog`, `_grpAddrPreview`, `_grpRenderColls`, `doSaveGroup`, `gname`, `_grpShowAddr`, `openShareDialog`, `closeShareDialog`, `_shareResetBigText`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy` … 외 6개 |
| 13,809 | GNB 의 There · 성경 · 1단 롤링 피커 (v26-1006-6, HB 8) | `_gnbExtrasSync`, `_gnbPickerOn`, `_gnbPickerStep`, `_gnbRpMenu`, `cur`, `go`, `renderVerseBar` |
| 13,911 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_vbThereEl`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncItems`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 14,168 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseResizeThreshold`, `_verseResizeOpacity`, `_verseModeTextEls`, `_verseModeSession`, `_verseModeSettle` |
| 14,377 | 크기 전환 드래그의 공통 손잡이 | `_verseDragBegin`, `_verseDragMove`, `travel`, `_verseDragEnd`, `_initVerseBarResize`, `_verseBandHit`, `bottom`, `_initVerseBandDrag`, `decide`, `unwatch`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual` … 외 15개 |
| 14,915 | 상단 › 다음 구절로 (v26-1024-16, HB 설정창 정리) | `_verseNextMode`, `_syncVerseNextBtns`, `setVerseNext`, `renderVerseSettingsModal` |
| 14,994 | 인앱 말씀 팝업 | – |
| 14,998 | 말씀 푸시 알림 설정 | `_vpOrders`, `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 15,029 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 15,118 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent`, `_bibleChapters` … 외 1개 |
| 15,339 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 15,350 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 15,415 | 암송 관리 | `getMemLog` |
| 15,422 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 15,445 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 15,468 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare`, `getThereLog`, `_thereBegin`, `_thereCommit`, `_thereEach`, `_thereTotalSec`, `_thereCountFor`, `_thereClock`, `_thereDurWords` |
| 15,542 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 15,562 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 15,730 | BibleLinkProvider | `_brKey`, `getBibleMarks`, `getBibleReadLog`, `getBibleNotes`, `_brSetMark`, `_brNoteSave`, `_brNotesAt`, `_brMigrateNotes`, `_brReadMs`, `_brHistory`, `_brHistHide`, `_brReadAdd`, `_brDev`, `_brParseRef` … 외 6개 |
| 16,002 | 성경 읽기 대시보드 — 기록 → 숫자 (v26-1007-9, B-9) | `_brDashRows`, `_brDashStart`, `_brSeenOf`, `_brDashStats` |
| 16,094 | 본문에 긋는 표시 (v26-1007-19, HB — 시안 FsJa1z2zfw4PHv9gCAwrrs 그대로) | `getBibleInk`, `_brInkId`, `_brInkSpansFrom`, `_brInkStepPos`, `_brInkCut`, `_brInkAdd`, `one`, `_brInkErase`, `_brInkHits`, `_brInkQuery` |
| 16,139 | 원어찾기 기록 (v26-1009-2, HB) | `getBibleOrig`, `_brOrigAdd`, `_brOrigNote`, `_brOrigWords` |
| 16,154 | 읽을 곳 (v26-1009-8, HB) — 장 단위 '읽을 거리'. 본문 위 오른쪽부터 매달린 탭 | `getBibleToRead`, `_brTRHas`, `_brTRToggle`, `_brTRKey`, `_brTRList`, `_brTRSetOrder`, `_brUrl`, `_brFetchJSON`, `_brGet`, `_brBook`, `_brVerseObj`, `bibleStartPreload`, `_sheetDrag`, `_sheetDragBindSettings` … 외 56개 |
| 16,597 | 읽는 시간 · 본 절 — 장을 펼친 순간부터 다음 장·닫기·앱 벗어남까지 | `_brSessEnd`, `_brSessStep`, `_brDiagStuck`, `_brDiagSync`, `_brDiagStore`, `_brDiagText`, `_brBusy`, `_brActiveWin`, `_brSessStart`, `bibleOpenLast`, `_brPosSave`, `bibleOpenRef`, `bibleOpen`, `bibleClose` … 외 7개 |
| 16,797 | 헤더·하단 접기 (v26-1007-7, HB — 갓피플 방식) | `_brChromeApply`, `_brChrome`, `_brChromeFreeze`, `_brOnScroll`, `_brProgSync`, `_brOpenDash`, `_brFmtMin`, `_brDashRender`, `pd`, `q`, `_brUnpark` |
| 16,942 | 절 롱터치·우클릭 메뉴 (v26-1007-8, HB) | `_brVmOpen`, `_brVmClose`, `_brViewVs`, `_brViewRef`, `_brVmRun` |
| 16,991 | 시트 | `_brOpenSheet`, `_brCloseSheets`, `_brOpenAct`, `_brDate`, `_brOpenMemo`, `_brCopy`, `done`, `_brCopyFallback` |
| 17,045 | 고르기 판 | `_brRecent`, `_brRenderPick` |
| 17,089 | 글자와 화면 | `_brApplyLook`, `_brLzGet`, `_brLzPaint`, `f`, `_brSyncAa`, `_brSet` |
| 17,118 | 내 표시 목록 | `_brRow`, `_brRenderList`, `txt`, `_brNoteInline`, `_brNoteHTML`, `flush` |
| 17,200 | 원어 목록 (v26-1009-3) | `_brOrigListHTML`, `note`, `_brListDelete`, `_brRowGone`, `_brSwipeBind` |
| 17,260 | 검색 | `_brRunFind`, `_brSyncScope` |
| 17,298 | 묶기 (한 번만) | `_brBind`, `TOUCH`, `inkStart`, `inkDisarm`, `inkMove` |
| 17,376 | 스크롤 기록 (v26-1010-11, HB — 아이패드 미니에서만 걸림. 기기 없이 두 번 헛짚었다) | `selRef`, `swOff`, `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 17,854 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 17,948 | 기다리는 동안 보여 줄 것 넷 (v26-1010-9, HB) | `_toastSpin` |
| 17,968 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 18,204 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `_vfRestoreCovers`, `closeVerseFull`, `_vfSyncPageBg`, `_verseFullIsOpen` |
| 18,298 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 18,306 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `hit`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns` … 외 22개 |
| 18,942 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 18,980 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 8개 |
| 19,321 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 19,427 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 19,433 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 19,481 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `_syncDeeperOpenUI`, `setDeeperOpen`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount` … 외 3개 |
| 19,644 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | `_thereIconKey`, `_thereIconSync`, `_thereIcHTML`, `setThereIcon` |
| 19,736 | 세팅 (이 기기에만) | `_tfDevKind`, `_tfLoad`, `_tfStore`, `_tfGet`, `_thereStripHanja`, `_thereWordFromVerse`, `_thereWordFromBible`, `pages` |
| 19,789 | 말씀 세팅 (이 기기에만 — 다른 There 세팅과 같은 칸 _lsk('thereFx')) | `_tfW`, `_tfBreathAt`, `x`, `_TF_NOISE`, `_tfNoise`, `_tfCandleAt`, `_tfFlickerAt`, `_tfFlickerParams` |
| 19,851 | 그리기 | `_tfHex2Hsl`, `_tfHsl2Rgb`, `_tfSprites`, `_tfPick`, `_tfBuildSprites`, `_tfSize`, `_tfSpawn`, `_tfDrawCross`, `_tfFrame`, `el` |
| 19,951 | 세팅 판 | `_tfSyncUI`, `_tfWire`, `thereTuneClock`, `thereTuneReset`, `thereTuneFold` |
| 20,014 | There 말씀 그리기 (v. 26-1024-14, HB) | `_tfQuiet`, `_tfWordSet`, `_tfWordApply`, `_tfWordRender`, `_tfWordFit`, `_tfWordRect`, `_tfWordToggle`, `_tfWordGo`, `_tfWordMulti`, `_tfWordWire`, `mvEl`, `_tfWordSyncUI`, `_tfWordChanged`, `thereWordSw` … 외 1개 |
| 20,183 | 테마 입히기 (v26-0923-8, HB) | `_tfApplyTheme`, `set`, `mix` |
| 20,213 | 열기·닫기 | `_thereIsOpen`, `openThere`, `closeThere`, `_thereRecorded`, `openThereFromVf`, `openThereTune` |
| 20,266 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 20,379 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 20,482 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 20,759 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 20,901 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 20,916 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 21,150 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 21,165 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 21,179 | 명조 | – |
| 21,183 | 고딕 | – |
| 21,186 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptPreloadVerse`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish` … 외 3개 |
| 21,433 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 21,748 | 크기 (v26-0905-2, HB — "말씀 모음 설정에 비해 홈과 책갈피가 | – |
| 21,760 | 홈 아이콘 두 벌 (v26-0905-7, HB) | – |
| 21,775 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfPrepareNext`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav` |
| 21,898 | 지금 보는 것이 '말씀 설정에서 정한 그 모음' 그대로인가 | `_vfAtCollection`, `_vfHomeStash`, `vfHomeAction`, `vfOpenDashboard`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab`, `_vfRenderKeepSwitch`, `toggleVfKeepSwitch`, `_vfKeepNav`, `vfOpenKeepList`, `vfOpenKeepGrid`, `_vfTitleTileFn` … 외 3개 |
| 22,166 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 22,398 | 설정창 (말씀설정 → 전체화면 탭) | `_ptMotionOn`, `_ptPickMotion`, `togglePropTitleMotion`, `_ptSyncMotionUI`, `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 22,474 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 22,582 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 22,604 | 명제 **본문** 가르개 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 22,656 | 명제 대표 문구 타이틀 | – |
| 22,659 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines` |
| 22,735 | 대표 문구 줄바꿈 (v26-0913-4, HB) | – |
| 22,772 | 끊으면 말이 두 동강 나는 자리 (v26-0913-5, HB) | – |
| 22,798 | v26-0913-6, HB 가 준 예로 더 넣은 것 | `_ptGlued`, `_ptCutPoint`, `mid`, `_ptCutTitle` |
| 22,892 | 정한 줄을 **폭을 아는 자리에서** 다시 정한다 (v26-0913-6, HB) | `_ptAvailW`, `pad`, `_ptRelines`, `widest`, `_ptPaint`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 23,081 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 23,370 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 22개 |
| 23,708 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 23,713 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 23,814 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 23,841 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 23,865 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 23,902 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_vfCatCue`, `_initVfCatSheet`, `stopTimer`, `disarm`, `vfOpenSheetForCat`, `prop`, `_sheetCopyThenGo`, `go`, `_sheetIsPc` |
| 24,099 | 명제는 늘 '명제 DB' 탭으로 (v26-1010-16 PC · v26-1010-17 휴대폰, HB) | `_sheetMainTtl`, `_sheetMainBuild`, `links`, `_sheetMainLoad`, `_sheetMainReady`, `_sheetMainWarm`, `_sheetGoMain`, `_sheetOpenPropMain`, `_sheetGo`, `_sheetCopyPending`, `_sheetEditUrlNorm`, `_sheetEditCall`, `u`, `ctl` … 외 21개 |
| 24,689 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight`, `top` |
| 24,707 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_logoMenuEsc`, `_tryCloseLogoMenu` |
| 24,856 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `renderVerseListPies`, `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 24,967 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 25,075 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 25,095 | 암송 기록 마이그레이션: verseIdx → ref | – |
| 25,131 | 이 기기에 ST 적기 (v26-1010-12, HB — 읽기 계획 탭이 두 번 통째로 사라졌다) | `_lsStKey`, `_lsDropBase`, `_lsPutST`, `put`, `rawSave` |
| 25,159 | 이 기기 저장 칸 진단 (v. 26-1107-8, 1107-SW 6 — HB) | `_lsdFamily`, `_lsdAppName`, `_lsDiagCalc`, `_lsdN`, `_lsDiagSumText`, `_lsDiagRead`, `_lsDiagRender`, `line` |
| 25,237 | 이 기기 저장 칸 진단 끝 | `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 25,319 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `_repRule`, `_repUntil`, `_repEx`, `_repBlocked`, `_dayKeyBefore` … 외 6개 |
| 25,590 | 긴 일정 이름 (v26-1024-9, HB) — 할일행 머리의 일정 칩 글자 수 | `_evChipN`, `_evChipCut`, `_evChipPreview`, `_evChipLabel`, `_evChipSync`, `evChipMaxInput`, `evChipMaxCommit` |
| 25,634 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 25,746 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 25,786 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 25,824 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 25,858 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 26,106 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 26,128 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 26,140 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 26,192 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put` |
| 26,297 | 휴지통 (v. 26-1031-6, HB 1031 1-1-4) | `_trashClone`, `sendToTrash`, `_trashTs`, `_trashDay`, `_trashCut`, `_trashAll`, `_trashCount`, `_trashPurgeOld`, `updateTrashBadge` |
| 26,370 | 톱니 (GNB B안, v. 26-1031-7, HB 1031 1-1-3) | `_gnbGearSync`, `_gnbNarrow`, `_gnbGearMenu`, `_gnbGearTap`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `_trashRestored`, `restoreFromTrash`, `clearTrash` |
| 26,487 | 검색 엔진 | `_srchNorm`, `_srchHas`, `_srchDayNum`, `_srchCarryMin`, `_srchQuickLabel`, `_srchQuickTask` |
| 26,520 | 검색어 해석 (v. 26-1031-13, HB 5-1) | `_srchKeyOf`, `_srchMd`, `_srchPeriod`, `day`, `month`, `_srchParse`, `_srchRun`, `secIds`, `byNear`, `fold`, `_srchMark`, `_srchSnippet`, `_srchEvDest`, `_srchWeekOff` … 외 6개 |
| 26,747 | 검색 엔진 끝 | – |
| 26,748 | 검색 화면 | `_srchQOpenLoad`, `_srchQOpenSave`, `_srchRecent`, `_srchRemember`, `_srchAutoRemember`, `_srchForget`, `_srchIsOpen`, `openSearch`, `closeSearch`, `_srchInput`, `_srchKey`, `_srchClear`, `_srchPick`, `_srchPickQuick` … 외 21개 |
| 26,965 | 바로 모아 보기 — 접힌 줄 + 펼친 요약 (v. 26-1031-14, HB 시안 B+A · C) | `_srchQuickRowHTML`, `_srchMiniHTML`, `carry`, `_srchQuickToggle`, `_srchRefLabel`, `_srchOpenBible`, `_srchBackToast`, `_srchGoDay`, `_srchGoTask`, `_srchUnfilter`, `_srchOpenVerse` |
| 27,088 | 일정 → D/W/M 그 칸 (4단계) | `_srchEvSync`, `_srchOpenWidgets`, `_srchFlash`, `_srchGoEvent` |
| 27,141 | 동그라미 = 바로 완료 (4단계) | `_srchItemOf`, `_srchStale`, `_srchToggleDone` |
| 27,173 | 결과 롱터치 · 우클릭 메뉴 (4단계, 시안 '1-2 결과 롱터치 메뉴') | `_srchContactTel`, `_srchActOpen`, `_srchActClose`, `_srchActBg`, `_srchActDraw`, `B`, `R`, `_srchKeyAdd`, `_srchWithTask`, `_srchActDone`, `_srchActDo`, `_srchActDate` |
| 27,320 | 결과 할일 밀기 (v. 26-1102-15, HB) — 오른쪽 → 완료(완료면 풀기) · 왼쪽 → 삭제 | `_srchDelToast`, `_srchSwPaint`, `_srchSwEnd`, `clean`, `_srchSwCommit`, `act`, `_srchBindSwipe`, `end`, `_srchSwAtNow`, `_srchBindLongPress`, `cancel`, `sw`, `renderToday`, `_rpGetWidgets` … 외 2개 |
| 27,507 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | – |
| 27,513 | 주간뷰도 칸 안에 자리를 갖는다 (v. 26-1030-2, HB) — 예전엔 3단에서만 두 칸 위를 가로질렀다. | – |
| 27,591 | 2단 배치 (v. 26-1030-4, HB (가)) — 처음엔 예전 2단 화면 그대로(좌 = 좌, 우 = 중+우)에서 시작한다 | `_colKey` |
| 27,613 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 27,851 | 부드러운 전환 (커튼 오버레이) | `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpWkH`, `hh`, `_rpSetWkH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 28,124 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 28,180 | 범위(scope)별 집계 (v26-0904-7, HB) | `_vlKindEntries`, `_vlKeepEntries`, `_vlHomeEntries`, `_vlReactTotals`, `_vlExtraSortFor`, `_vlEntriesForScope` |
| 28,240 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 28,275 | 정렬 (v26-0831-11, HB) | – |
| 28,279 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vlwKey`, `vlwSetSort`, `vlwTogglePairSort`, `vlwSetPeriod`, `vlwSetCustom`, `_vListControlsHTML` … 외 28개 |
| 28,635 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 28,705 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 28,731 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 28,763 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 28,949 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `_keepSwitchIsOpen`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 28,988 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 29,071 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 29,125 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashMaxSlice`, `_vDashShowEtc`, `_vDashEtcColor`, `vDashSetSlices`, `vDashToggleEtc`, `_vDashKeyCmp` … 외 19개 |
| 29,462 | 위쪽 전환: 분포(파이) ⇄ 흐름(꺾은선) | `_vDashView`, `vDashSetView`, `_vDashCommonHTML`, `_vDashViewTabsHTML`, `renderVerseDashboard`, `_tdLoadPray`, `_tdOpts`, `renderVDashThere`, `openThereDash`, `_tdBindLong`, `_tdBindAll`, `renderVDashPie`, `_vDashPieInsightHTML`, `_vTrPref` … 외 10개 |
| 29,760 | 기간 슬라이더 | `_vTrOtherSpan`, `vTrSpanSet` |
| 29,784 | 부드럽게 끌리는 슬라이더 | `_vTrRailBind`, `paint`, `fire` |
| 29,852 | 양쪽 손잡이 슬라이더 (v26-0907-3, HB 6-3) | `_vTrExclLabel`, `_vTrRail2Bind`, `paint`, `_vTrBindRails`, `vTrInsSet`, `vTrToggleSeries`, `vTrToggleExp`, `vTrOpenBook`, `on`, `vTrCloseBook`, `_vTrEntries`, `_vTrBucketOf`, `_vTrBucketRange`, `_vTrNowBucket` … 외 10개 |
| 30,146 | 그 성경 안에서 이 말씀이 걸리는 '장' | `_vTrChapterKeys`, `rs`, `_vTrChapNo`, `_vTrChapCmp`, `_vTrData`, `unit`, `add`, `_vTrGeo`, `bw`, `_vTrHFromX`, `_vTrChartSVG`, `nameTx` |
| 30,251 | 견주는 두 구간을 그림 안에 그린다 (v26-0906-1 · v26-0906-2, HB 4) | `markOf` |
| 30,412 | 그림 안의 띠를 끌어 견주는 구간(h)을 바꾼다 (v26-0906-2, HB 4-1) | `_vTrBindBand`, `fitPill`, `paint`, `_vTrChipsHTML`, `_vTrRailHTML`, `f`, `pct`, `_vTrRail2HTML`, `_vTrSpanRowHTML`, `unit`, `_vTrRowsOf`, `sum`, `_vTrDiffHTML`, `_vTrInsightHTML` … 외 1개 |
| 30,649 | 작은 발견 (v26-0906-5, HB 2) | `_vTrFindings`, `sum`, `_vTrFindingsHTML`, `card`, `put` |
| 30,714 | 표 정렬 (v26-0906-2, HB 7) | `_vTrNameCmp`, `_vTrSortRows`, `_vTrTheadHTML`, `_vTrRowHTML`, `renderVDashTrend`, `form`, `unit` |
| 30,805 | 소제목 차례: 범위 - 무엇을 - 모양 | `_vDashSubKind`, `_vDashSubArmed`, `_vDashSubRefSet`, `vDashSubToggle`, `vDashKindPick`, `_vDashWinEntries`, `sc`, `keys`, `from`, `to`, `_vDashSpanWords`, `_vDashScope`, `_vDashScopeCtlHTML`, `_vDashVerbWord` … 외 8개 |
| 31,060 | 지도 | `_vMapMode`, `vDashMapPick`, `_vMapStats`, `_vMapStep`, `_vMapShade`, `_vMapInk`, `_vMapGroups`, `_vMapRange`, `lo`, `hi`, `_vMapRanks`, `_vIdKey`, `k`, `_vMapChapMap` … 외 9개 |
| 31,328 | 3-2 · 고른 조건이 만든 줄들 | `grid` |
| 31,480 | 연결 (주제 ↔ 성경) | `_vLinkAxis`, `_vgStop` |
| 31,520 | 배치 값 (2-1) | `_vgCfg`, `cl`, `vgCfgSet`, `vgCfgReset` |
| 31,555 | 골라 보기 (1-1) | `_vgSel`, `_vgDepth`, `vgDepthSet` |
| 31,571 | 노출 순위창 (2-1·2-2) — "몇 등부터 몇 등까지 그래프에 보일지". | `_vgRankPref`, `_vgRankOf`, `vgRankSet`, `_vgRankRailBind`, `paintRows`, `paint`, `vgSetSelOnly`, `vgToggleSel`, `vgClearSel`, `vgSearch`, `_vgSeeds`, `_vgReach`, `_vgDepthCounts`, `_vgApplyFilter` … 외 2개 |
| 31,817 | 껍데기를 먼저 넣는다 | – |
| 31,850 | 이제 그래프가 실제로 차지한 폭을 재고, 그 폭으로 점을 만든다 | `push`, `_vgShow`, `vgToggle`, `vDashLinkRelayout`, `_vgClamp` |
| 31,921 | 물리와 그리기 | `_vgRun` |
| 31,966 | 2-2 · 키울 때 점과 글자는 **제곱근만큼만** 커진다 | `applyScale`, `mark`, `paint` |
| 31,998 | 한 판 — 척력 · 용수철 · 가운데로 · 감쇠 | `stickOf`, `_rep2`, `tick`, `loop` |
| 32,092 | 손가락 · 마우스 | `applyView`, `toGraph`, `_vfSetTabPool`, `_vfTabList`, `_vpOtherAxis`, `_vpFacetCandidates`, `_vpFiltMulti`, `vpToggleFilt`, `_vpFiltRefSet`, `_vpTabName`, `_vpRep`, `_vpShortRef`, `_vpPool`, `_vpList` … 외 22개 |
| 32,583 | 주간 리듬 (잔디) | – |
| 32,584 | 리듬 (요일 × 한 시간) | `_vRhyKind` |
| 32,598 | There (v26-0923-7, HB) — 범위 맨 끝 '저장' 다음 | `_vRhyThereSplit`, `_vRhyBands`, `secs`, `renderVDashRhythm`, `dow`, `_lord` |
| 32,798 | 장절 느슨한 대조 | `_refNorm` |
| 32,835 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 32,879 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 32,962 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoTab`, `_vsetGoColl`, `_vsetFlashTab`, `openVerseSettingsFromMenu`, `openVerseSettingsFromLogo`, `openVerseCollFromListMenu`, `openVcCollSettings`, `_vsetRestoreBack`, `vsetGoDashboard`, `vDashOpenCollSettings` … 외 1개 |
| 33,123 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `_vDashDetailDotsHTML`, `vDashOpenDetail`, `_vDashDetailGo`, `_vDashDetailSlide`, `_initVDashDetailSwipe`, `slide`, `bodyEl`, `finish`, `_vDashDetailKey`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup` … 외 10개 |
| 33,520 | 위젯이 보는 범위 (v26-0904-7, HB) | `_vcScope`, `_vcScopeIsHome`, `_vcScopeCount`, `_vcSyncKind`, `_vcView`, `_vcScopeKey`, `_vcScopeIcon`, `_vcScopeLabel`, `_vcScopeParts` |
| 33,583 | 자동 넘김 (v26-0904-10, HB) | `_vcAutoOn`, `_vcAutoMin`, `_vcAutoSeq`, `_vcAutoOffset`, `_vcAutoSlot` |
| 33,632 | 앱을 껐다 켤 때 (v26-0905-10, HB) | `_vcAutoAnchors`, `_vcAutoSaveAnchors`, `_vcAutoSetAnchor`, `_vcAutoResetAnchors`, `setVcAuto`, `setVcAutoMin` |
| 33,688 | 이름 넘김 방식·간격 (v26-0905-8, HB) | `_vcRollSec`, `_vcRollMode`, `_vcRollOpt`, `_rollSecLabel`, `setVcRollMode`, `setVcRollSec`, `vcRollSecInput`, `_vcHeadMode`, `setVcHeadMode`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId` … 외 5개 |
| 33,796 | 카드가 도는 범위 | `_vcListItems`, `_vcVerseOf`, `hit`, `_vcKeyOf` |
| 33,827 | 명제의 대표 문구 (v26-0904-10, HB) | `_vcHiSplit`, `_vcVerses`, `_vcCurrent` |
| 33,887 | 자동 넘김 시계 | `_vcAutoChanged`, `_vcAutoSlide`, `finish`, `_vcAutoTick`, `_vcAutoStart`, `_vcFilterLabel` |
| 33,969 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 34,009 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 34,020 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 34,041 | 카드 한 장 HTML | `_vcCardHTML` |
| 34,125 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 34,219 | 카드 동작 | `_vcReactKeyOf`, `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind` |
| 34,360 | 카드 ⇄ 목록 | `vcSetView`, `vcToggleView`, `vcAddCard`, `_vwScopeOpts`, `openVwScope`, `closeVwScope`, `renderVwScope`, `row`, `_vwKeepSortHTML`, `chip`, `_vwScopeBindHold`, `go`, `vwScopeCollSettings`, `vwScopePick` … 외 3개 |
| 34,535 | 말씀 목록 모습 한 벌 | `_vcListHTML`, `_vcAttachGestures` |
| 34,676 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `hmBtn`, `rmBtn`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale` … 외 2개 |
| 34,904 | 월간뷰 위젯 1단 / 2단 (HB 2026-10-27 B1) | `_layColsFor`, `_layColKeys`, `_layColOf`, `_layAllPlaced`, `_layDrop`, `_wkWideSide`, `_monthWideSide`, `_laySpanSide`, `_foldSwGroup`, `rpMonthWideMenu`, `rpWeeklyWideMenu` |
| 34,960 | 주간 ⇄ 월간 바꾸기 [W\|M] (v. 26-1030-8, HB) | `_rpWMSegOn`, `_rpWMSegHTML`, `_foldSwMode`, `_foldSwSync`, `_rpFoldSegHTML`, `_rpWMSegHTML0`, `_rpWMBodyEls`, `_rpWMSwap` |
| 35,037 | 주간 · 월간 위젯 접기 (v. 26-1030-9, HB) | `_rpFoldOf`, `f`, `_evLeadMin`, `_rpFoldEvCmp`, `_rpFoldData`, `_rpFoldDayLabel`, `_rpFoldEvHTML`, `_rpFoldFlagTxt`, `_rpFoldFlagBar`, `_rpFoldLineRow`, `_rpFoldSumH`, `v`, `_rpFoldSumHTML`, `more` … 외 3개 |
| 35,238 | 가로폭이 바뀔 때 (경계선 끌기 · 창 크기) — 글자가 툭 켜지고 꺼지지 않게 (v. 26-1102-10, HB) | `_rpfScan`, `_rpfGhost`, `_rpFoldFitOne`, `_rpFoldFitAll`, `_rpFoldHandleHTML`, `_rpFoldSet` |
| 35,334 | 한 줄 ⇄ 요약을 손가락으로 — 부채처럼 펼쳐지고 접힌다 (v. 26-1031-3, HB) | `_rpMorphStart`, `stops`, `cl`, `draw`, `finish`, `springTo`, `rpFoldCycle`, `_rpFoldTxApply`, `rpSetFold`, `_rpFoldSegResume`, `_rpAttachFoldTap`, `rpSwapWM`, `outEls`, `go` … 외 11개 |
| 35,861 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 35,879 | 각 컬럼 렌더링 | – |
| 35,899 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 35,907 | There · 성경: 상단 말씀이 켜졌을 때만 (_gnbExtrasSync) | – |
| 35,910 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 35,923 | 두 칸 자리(#weeklyPane) · 주간뷰 | – |
| 35,953 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 35,997 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 36,115 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 36,210 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `placeM`, `up`, `_rpAttachHeaderDrag`, `bindHold`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn`, `curSecId` … 외 2개 |
| 36,911 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 36,912 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 36,935 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 36,989 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 37,117 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount` |
| 37,129 | Even Deeper 는 **개발자 계정에만** 보인다 (v26-0922-17, HB) | `_evenOn`, `_syncEvenVisibility`, `_syncDevVerBadge`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge` … 외 10개 |
| 37,382 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 37,418 | 개발자 쪽지 (설정창 계정탭) | – |
| 37,430 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 37,827 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass` |
| 38,042 | 하위·메모: 자료 다루기 (순수 함수) | `_subsOf`, `_subStat`, `_subParse`, `_subSyncParent`, `want`, `_subSetAll`, `_subsCopy`, `_carryTaskExtras` |
| 38,099 | 메모 안에서 알아보는 것 (URL·전화·이메일·날짜) | `_memoScan`, `_memoDateKey`, `_memoTelDigits` |
| 38,150 | 하위·메모: 화면 | `_taskArrOf`, `_subRerender` |
| 38,163 | 줄 끝의 작은 원형 게이지 | `_subGaugeSVG`, `r`, `_subGaugeFill`, `_memoBadgeFill`, `_wireSubHandle`, `clearLp`, `_subToggleBadgeFill`, `makeSubToggleBadge`, `_attachSubMemoBadges`, `_subPrune`, `_subKey`, `_subIsOpen`, `_subToggleOpen`, `open` … 외 2개 |
| 38,296 | 하위 할일 판 | `makeSubPanel` |
| 38,314 | 하위 줄 끌어 순서 바꾸기 (HB 2026-10-29) | `_subReorder`, `_sdrRows`, `_sdrQuiet`, `_sdrStart`, `_sdrPlace`, `_sdrMove`, `_sdrEnd`, `finish`, `_wireSubDrag` |
| 38,414 | 터치: 60ms 넘게 가만히 있으면 '누르는 중' — 그때부터 스크롤을 붙잡고, LONG_PRESS_TOUCH 에 들린다 | `clear` |
| 38,446 | 마우스: 눌린 채 4px 움직이면 들린다 (빅블럭의 빈 자리 끌기와 같다). 고치는 중인 글자 칸은 글자 고르기 | `_makeSubRow`, `_makeSubGhost`, `fit`, `commit` |
| 38,603 | 반복 할일의 보조 속성 — 언제 물을까 (HB 2026-11-01 B1 · C안 v. 26-1101-4) | `_repPropBegin`, `_repPropCommit`, `_repPropSoon`, `_repPropIdx`, `_repScopeOpen`, `_repPropEditing`, `_repPropBusy`, `_repPropTick`, `_subEditPanel`, `_subEditEnd`, `_repPropFlushNow`, `H`, `H`, `_repSubDiffWord` … 외 5개 |
| 38,836 | 하위 줄 메뉴 (위로 · 아래로 · 꺼내기 · 삭제) | `openSubRowMenu`, `row`, `closeSubRowMenu`, `_subMoveFromMenu`, `_subRemoveFromMenu`, `_subPromoteFromMenu`, `openTaskMemo`, `closeTaskMemo` |
| 38,940 | 메모 팝업 크기 — 네 모서리로 조절, 이 기기에만 기억 (v26-1028-8, HB) | `_memoClampSize`, `_memoApplySize`, `toggleTaskMemoEdit`, `_memoItem`, `_memoSaveEdit`, `deleteTaskMemo`, `_memoRender`, `_memoViewHTML` |
| 39,067 | 알아본 것을 눌렀을 때의 동작 메뉴 | `openMemoActMenu`, `row`, `closeMemoActMenu`, `_memoCopyText`, `memoActRun`, `_memoMoveTaskToDate`, `_memoSaveToPhone`, `name`, `openContactsModalWith`, `set` |
| 39,253 | 할일 메뉴의 두 줄 ('하위 할일' · '메모') | `openSubsFromMenu`, `_subRemoveAll`, `openMemoFromMenu`, `_prayDb`, `_prayUid`, `_prayTree`, `_prayLoadGroups`, `_prayPickClose`, `_prayPlace`, `_prayPanel`, `_prayOpenGroups`, `_prayOpenKids`, `_prayPickHover`, `_prayPickTap` … 외 11개 |
| 39,560 | 시리: 앱에 잇는 자리 | `_siriPlace`, `_siriSaved`, `_siriRenderSettings`, `siriMakeKey`, `_siriMakeKeyNow`, `siriCopyUrl`, `ok`, `makeBigWrap`, `getCarryCount`, `_playDoneFx`, `style`, `_fxGlow`, `_fxRipple`, `populateCarryBadge` … 외 3개 |
| 39,831 | 행보다 긴 할일 (H-6, HB 2026-10-22) | `_ovfQueue`, `_ovfMode`, `_ovfClear`, `_ovfRun`, `_syncTaskOvfBtns`, `v` |
| 39,899 | 긴 할일 고치기 — 여러 줄 칸 (H-6, HB 2026-10-22) | `_longEditOpen`, `close`, `back`, `_makeUrgentBadgeHTML`, `makeBigItem`, `isOver`, `makeBigGhost`, `updateTotal`, `makeSmWrap`, `makeSmItem`, `makeSmInlineGhost`, `openSmGhost`, `closeSmGhost`, `renderSmList` … 외 3개 |
| 40,488 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 40,493 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `beginMouseDrag`, `cancelMousePress` |
| 40,568 | Desktop: right-click → task move context menu | – |
| 40,580 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 40,785 | Hold off the browser's scroll gesture WHILE the long-press | – |
| 40,813 | 더블탭 = 중요 표시 토글, 트리플탭 = 긴급 표시 토글 | – |
| 40,853 | 끌 때 줄들이 비켜 주기 (HB 2026-10-28 B7-2) | `_drTy`, `_drRect`, `_drFlipEls`, `_drSlotBegin`, `_drPlace`, `_drSlotEnd`, `_drGhostLand`, `_drBlurTaskInput`, `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 40,991 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 41,006 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 41,059 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 41,444 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey` |
| 41,619 | 휴대폰 자판의 '이동' 키 = 다음 칸으로 (v. 26-1030-7, HB) | `_softEnter`, `_taskEnterNext`, `arrOf`, `nRow`, `go`, `_finishEditKeepRow`, `buildFlatList`, `findFlatIndex`, `getRowEl`, `refreshActiveVisuals`, `clearActive`, `setActiveSingle`, `isAnyInputFocused`, `_txEditEl` … 외 5개 |
| 41,784 | 위쪽이 안 보이게 막힌 화면 되살리기 (1101-E1 ①, HB 아이패드 사진) | `heal`, `soon`, `_txeDefer`, `activateItem`, `focusItemInput`, `moveActiveSelection`, `scrollFlatIdxIntoView`, `scrollActiveIntoView` |
| 41,940 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 42,007 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 42,155 | While editing a big/small task's text | – |
| 42,167 | Not editing text: arrow-key driven selection | – |
| 42,198 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `_kbWOn`, `_kbWEls`, `_kbWName`, `_kbWSync`, `_kbWSet`, `_kbWStep`, `_kbWGo`, `_kbWPage`, `_kbWEnter` |
| 42,369 | 할일 다루기 | `_kbSelItems`, `_kbAnchor`, `_kbSecId`, `_kbToggleDone`, `_kbReactivate`, `_kbDelete`, `_kbOneSel`, `arr`, `_b7TaskKey` |
| 42,469 | 들어오는 문 | `_b7KbReady`, `_b7BoardKey` |
| 42,492 | 위젯 포커스를 잡은 동안 | – |
| 42,507 | 포커스를 잡기 전 — 여기서만 새 글쇠를 받는다 | `_kbWHint`, `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `_contactTaskSvg`, `_wireContactTaskBadge`, `makeContactBadges`, `contactBadgeCountChanged` |
| 42,790 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 42,867 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 42,941 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `_mlContactParse`, `em`, `ph`, `_mlAddContacts`, `pickFromDeviceContacts` |
| 43,073 | Event add modal | `syncRollDisplays` |
| 43,101 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 43,383 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 43,450 | Touch | – |
| 43,482 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `deleteEventFromModal`, `_evDeleteAt`, `_gcalTz`, `_gcalDsh`, `_gcalCfg`, `_gcalSetCfg` … 외 10개 |
| 43,778 | 구글 쪽 바뀜 알아채기 (v26-1024-8, HB '구글에서 고친 것이 늦거나 안 온다') | `_gcalSeen`, `_gcalProbe`, `_gcalDefSec`, `_gcalFind`, `_gcalGone`, `_gcalTomb`, `_gcalOnSave`, `_gcalKick`, `_gcalRunRemote`, `bad`, `_gcalApplyLocal`, `gcalSync`, `_gcalBoot`, `_gcalAfterConnect` … 외 13개 |
| 44,146 | 일정 입력창의 캘린더 고르기 (v26-1024-1, HB) | `_gcalPickRender`, `opts`, `draw` |
| 44,179 | 여러 날 일정 (v26-1024-2, HB) | `_gcalSpanN`, `dsh`, `_gcalMD`, `_gcalSpanTag`, `_gcalLanes`, `_gcalMonthLanes`, `_wmEvClick`, `wmEvEdit`, `_gcalSegHTML`, `lb`, `_gcalPickApply`, `_gcalPickApplyV`, `closeTaskMenu`, `toggleTaskFlag` … 외 4개 |
| 44,379 | 긴급 표시 스포트라이트 | `_applyUrgentSpotlight`, `_ensureUrgentSpotlightObserver`, `_urgentItemsOn`, `_clearUrgentOnDone`, `_doToggleUrgent`, `toggleTaskUrgent`, `toggleUrgentRank`, `_ctNow`, `_newTask` |
| 44,522 | 여러 줄 붙여넣기 → 할일 여럿 한꺼번에 (v. 26-1104-3, HB) | `_mlLines`, `_mlBind`, `_mlPaste`, `run`, `_mlAddTasks`, `_autoContactMark`, `toggleTaskContact`, `_repBadgeFill`, `body`, `_taskRepDefault`, `_taskRepWeekly`, `_repKindOf`, `_taskRepFallback`, `_isRepRoot` … 외 4개 |
| 44,708 | 옛 자료 옮겨심기 | `_migrateTaskRepeats` |
| 44,742 | 그 날짜의 실체 만들기 | `materializeRepeatsFor`, `ensureDailyRepeats`, `ensureRepeatsForView` |
| 44,784 | 보여주기용 앞날 미리보기 (저장하지 않는다) | `getDisplayTasks`, `own` |
| 44,808 | 매일/매주 반복 켜고 끄기 | `toggleDailyRepeat`, `toggleWeeklyRepeat`, `_taskSetRepeat`, `_REP_SCOPE_IC`, `_repScopeAsk`, `kindWord`, `verb`, `closeRepScope`, `_repScopePick` |
| 44,929 | 묶음을 훑어 지우기 | `_repPurgeTasks`, `_repPurgeEvents`, `_repAddEx`, `_repHiddenOn`, `_repVisIdx` |
| 44,994 | 일정의 원본 찾기 | `_evRepRootOf`, `_evInSeries` |
| 45,014 | 규칙을 물려줄 때 끝날·뺀 날은 잃지 않는다 | `_repKeepMarks` |
| 45,027 | 일정 범위 묻기에 쓰는 말 (v. 26-1030-5, HB) | `_evMd`, `_evScopeRows`, `root`, `_toastName`, `_evGcalNote`, `_evSecFor`, `_evRehome`, `_evEditApply`, `putOverride`, `_evOverrideDays`, `_evInheritCal`, `_evDeleteApply`, `_evMoveAsk`, `_evMoveApply` … 외 19개 |
| 45,534 | 반복 할일 옮기기 (HB 2026-10-28 B3-2, tests/test_repeat_move.js) | `_taskIsRep`, `_repPlain`, `_repMoveApply`, `_repMoveAsk`, `item`, `_dayKeyDiff`, `moveTaskTo`, `_moveLabel`, `_freshTaskCopy`, `_dupDoneSync`, `_dupDoneReset`, `_dupDoneToggle`, `_finishOriginal`, `duplicateTaskTo` … 외 14개 |
| 45,875 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | – |
| 45,882 | 구간 열어 보이기 (v26-1015-9, HB) | – |
| 45,885 | 구간을 손으로 켜고 끌 때 보기 단추 풀기 (v. 26-1031-5, HB) | `_presetVisTouched`, `_secClosed`, `_revealSec`, `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_dayTaskSecs`, `_fillTaskMenuCounts`, `_tmSubPanel`, `_tmSubReset`, `_tmSubHide`, `_tmSubOpen`, `_tmSlide` … 외 5개 |
| 46,110 | 완료 후 다음 할일 | `nextAfterDoneTo`, `nextAfterDoneYesterday`, `_todayDateObj`, `nextAfterDoneYday`, `nextAfterDoneYdayPicked`, `nextAfterDonePicked`, `_focusNewTaskInput`, `sel`, `_secPickOn`, `_daySecTasks`, `_secPickSecs`, `_secPickSpecFor`, `_secPickFloat`, `_secPickRender` … 외 35개 |
| 46,959 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `_cellTodoAddMany`, `limit`, `closeCellTodo` … 외 20개 |
| 47,411 | M뷰 칸 높이 (v26-1024-6, HB) | `_mGridH`, `_mGridSetH`, `_mFitCells`, `_mGridApplyH`, `fit`, `minH`, `initMonthlySwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd` |
| 47,556 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender` |
| 47,621 | 성경 단추 길게 누르기 · 우클릭 = 읽기 계획(읽기모음) 메뉴 (HB 2026-10-27 A1) | `bibleToReadMenu`, `_bibleBtnLongPress`, `_EMBED`, `_embedPost`, `_embedIdleSoon`, `_embedAllClosed`, `_embedDone`, `_embedClean`, `_embedOn`, `_embedTheme`, `_embedRun`, `_embedWatchPeek`, `check`, `_embedStart` … 외 3개 |
| 47,777 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` |
| 47,958 | 설정창은 이 기기에서 마지막에 쓰던 탭으로 열린다 (v26-1024-19, HB) | `_setTabMemKey`, `_setTabMemGet`, `_setTabMemPut`, `_vsetStartTab`, `openAccountSettings`, `openSettings`, `_flashSettingsTab`, `closeSettings`, `closeSettingsOnBg`, `closeAccountSensitiveModals`, `renderSettingsPanel`, `_chk`, `_syncBpPickers`, `fill` … 외 7개 |
| 48,402 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 48,403 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 48,475 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 48,756 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 48,937 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n` |
| 48,954 | 설정창 묶음 카드 (v26-1024-15, HB — 타이머 설정창처럼 · 세 창 공통 규칙) | `_sgEdges`, `sgFold` |
| 48,976 | 묶음 접기 — 기기 폭에 따라 (v26-1024-20, HB S-5) | `_sgDevClass`, `_sgTitle`, `_sgFoldMem`, `_sgFoldMemPut`, `_sgFoldDefaultOpen`, `_sgFoldInit`, `sgGroupToggle`, `_sgFoldSum`, `_sgFoldSumAll`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget` … 외 2개 |
| 49,304 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 49,401 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 49,476 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 49,533 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 49,622 | Backup / restore | – |
| 49,623 | 백업에 담는 '말씀 쪽' (v26-0921-8, HB 4-5) | `_myProductSettings`, `_backupPayload`, `sw`, `exportBackup`, `_backupDownload`, `_bakDevice`, `buildBackupFilename`, `email`, `emailTag`, `bkKey`, `n`, `importBackup` |
| 49,832 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount` |
| 49,937 | 반복 할일의 이월 (HB 2026-10-28 B3-0 · B3-1, tests/test_carry_repeat.js) | `_carryIsRep`, `_carryWants`, `_repOnDay`, `_doCarry`, `runCarryNow` |
| 50,010 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 50,015 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 50,037 | 진단 기록 보조 저장소 (localStorage) | – |
| 50,041 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 50,619 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 50,651 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 50,758 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 50,774 | Day-change catch-up on wake | – |
| 50,827 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 51,011 | 말씀 모음 동기화 결과 화면 (v26-0913) | `_escHtml`, `showSyncResultModal`, `totalChg` |
| 51,088 | 영상 링크가 없는 설교 (v26-1005-1, HB) | `_syncNoVideoHTML`, `a` |
| 51,114 | "새로 들어온 말씀을 목록에 포함시키기" (v26-0916-2, HB) | `_syncIncludeInit`, `total`, `_syncGoBtn`, `syncIncludeOpenFull`, `list`, `_syncIncludeRender`, `bub`, `syncIncludeNow`, `syncIncludeUndo`, `_syncCatWeight`, `_syncGroupWeight`, `w`, `closeSyncResultModal` |
| 51,244 | 따로 포함한 목록 (v26-0916-2, HB) | `openPlusList`, `closePlusList`, `setPlusTab`, `_plusAfterChange`, `plusRemoveKeys`, `plusRemoveCat`, `plusRemoveTopic`, `plusClearAll`, `renderPlusList`, `addRow` |
| 51,359 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 51,454 | 푸시 배관(토큰) 공용 | – |
| 51,465 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 51,579 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 51,607 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub` |
| 51,637 | 알림 서버에 '예약을 다시 짜 주세요' (v26-1024-13) | `_pushReplan` |
| 51,652 | 기기 등록에 앱 표시 (v26-1024-13) | `_pushTagProduct`, `initForegroundPush` |
| 51,681 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 51,693 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 51,724 | 알림 테스트 | `testLocalNotification`, `sendTestPush` |
| 51,762 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_upTries`, `_upSetTries`, `_upClearTries`, `_verTap`, `_upReloadFresh`, `_upSafeNow`, `_upBusyScreen`, `_upWaitHome`, `_upHold`, `_upApply`, `_upCheck`, `_fbSyncReady` … 외 6개 |
| 52,066 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 52,151 | 기준점 압축 (v. 26-1107-9, 1107-SW 6 — HB 아이패드 BLOCK7 64% · Sweeter 59%) | `_lszPack`, `_lszUnpack` |
| 52,203 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle`, `_fbVerIsOlder`, `_mgWhole` |
| 52,266 | 처음값 채우기는 편집이 아니다 (v. 26-1025-9, ROADMAP B-2) | `_mgIsFill`, `_mgFillSide`, `_mgSetting`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay` |
| 52,406 | 긴급 표시 한도(하루 2개)를 병합 뒤에도 지킨다 (v26-0914-3) | `_mgEnforceUrgentCap`, `_mgById`, `_fbHasAdoptedCloud`, `_fbCountArrays`, `_fbCountByKind`, `_fbCountItems`, `_fbBulkLoss`, `_fbMergeGuarded`, `_fbMerge`, `_dfJ`, `_dfSame`, `_dfCut`, `_dfQ`, `_dfDay` … 외 7개 |
| 52,679 | 안쪽 이름표를 사람 말로 | `_dfSeg`, `_dfSegPath`, `_dfWord`, `_dfValS`, `_dfVal` |
| 52,737 | 값 두 벌에서 **다른 자리만** 뽑는다 | `_dfDeep`, `_dfDeepLines`, `_dfKindName`, `_dfToday`, `_dfPush` |
| 52,774 | 할일 한 구간(배열) | `_dfTaskKey`, `_dfArr` |
| 52,823 | 날짜별 할일·일정 | `_dfDays`, `A` |
| 52,841 | 말씀 모음 하나 | `_dfVKey`, `_dfColl1`, `_dfColls` |
| 52,867 | 연락처 하나 | `_dfContact1`, `_dfContacts` |
| 52,880 | 기록(암송·좋아요·담아두기·나눔·Deeper) | `_dfLogRefs`, `_dfLogs` |
| 52,909 | 설정 | `_dfSettings`, `A` |
| 52,924 | 본체 — 상태 a(이전) 에서 b(이후) 로 무엇이 달라졌나 | `_dfDiff`, `_dfBrief`, `_dfScale`, `k`, `days`, `_dfScaleText`, `_cfJ`, `_cfDiffer`, `_cfId`, `_cfSecLabel`, `_cfKindLabel`, `_cfText`, `_cfMake`, `_cfScanSection` … 외 11개 |
| 53,286 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal` |
| 53,316 | Sweeter 에서는 '말씀 쪽' 충돌만 보여 준다 (v26-0921-8, HB 4-5) | `_cfMine`, `_cfDevOnly`, `_cfOpen`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 53,428 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfNiceLabel`, `_cfGroupName`, `_cfChoiceLabel`, `_cfCutRaw`, `_cfIsStamp`, `_cfStampNice`, `_cfExplain`, `cfToggleRaw`, `_cfBaseLine`, `_cfCardHTML`, `auto` … 외 10개 |
| 53,714 | 올리기 실패 진단 (v26-1025-3) | – |
| 53,717 | 클라우드 문서 포장 (v26-1025-5) | `_fbUnz`, `u8`, `_fbDocJson`, `_fbZ`, `_fbZField`, `_fbDocBytes`, `_fbBytes`, `_fbCommit`, `_fbScheduleRetry`, `_fbEnsureSync`, `_fbForceWrite` |
| 53,861 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `_fbSizeRows`, `_fbSizeBlock`, `_inboxDiagBlock`, `L`, `items`, `_fbDiagBlock`, `pend`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 54,098 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `_abLocalState`, `_abRankLabel`, `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn`, `_swBoardOn` |
| 54,527 | 2차 (v26-0922-2, HB) | – |
| 54,538 | 3차 (v26-0922-3, HB) — 시트의 '상황 태그'·'묵상 질문' 에서 나온다 | – |
| 54,546 | 비었을 때의 안내는 **보는 사람에 따라 달라야 한다** (v26-0923-2) | `_swWin`, `roll`, `_swInWin`, `_swPool`, `_swRecIn`, `_swEmptyText`, `who` |
| 54,636 | 담아두기 | `getKeepLog` |
| 54,649 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 54,719 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 54,914 | 저장 | `_swTilesRaw`, `_swVerRaw`, `_swLoadTiles`, `_swSaveTiles`, `_swSpareKinds` |
| 54,966 | BLOCK7 에서 내 말씀 가져오기 | `_swCountVerses`, `_swBlock7Src`, `_swImportApply`, `swImportFromBlock7`, `_swSyncNotice` |
| 55,063 | 말씀 모음 타일 | `_swColls`, `a` |
| 55,091 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermonPool` |
| 55,122 | 설교 날짜가 하나도 없는가 = '주제' 로 읽을 때 (1107-SW 9, HB 2026-11-07) | `_swSermonTopic`, `_swSermons`, `_swSermonVerses`, `_swBooks`, `_swTags`, `_swEvenOn`, `_swReacts` |
| 55,229 | 까닭 한 줄 (v26-0922-1, HB 2번 선택) | `_swAgo`, `_swLastTouch`, `add`, `_swWhyOf`, `key` |
| 55,288 | 오늘의 말씀 (표지 카드) | `_swToday`, `_churchCfg`, `_svcRank`, `list`, `_svcCmp`, `_swAxisKeys`, `_swCount`, `_swFlow`, `_swMyWeight`, `_swMD` |
| 55,420 | 기간 안의 흐름 (v26-1005-5, HB) | `_swSvcKey`, `_swSvcOf` |
| 55,424 | 흐름 카드 그림 (C안, v. 26-1102-12, HB 2026-11-02) | `_swJo`, `_swFlowDay`, `_swFlowShape`, `list`, `lane`, `_swInsightsWin`, `push`, `_swInsights`, `push`, `_swVersesForInsight`, `_swRhythmGrid`, `_swRhythm`, `_swSigRhythm` |
| 55,736 | 상황 태그를 **말투로** 바꾼다 (v26-0922-4 → -5 에서 전면 손질, HB) | `_swNeedSkip`, `_swNeedSay`, `bat`, `_swNeeds`, `_swAsks`, `_swValues`, `_swStrip`, `_swCountText`, `_swFlowHTML`, `clause` |
| 56,159 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swHandFont`, `day`, `_swHiText`, `_swHiHTML`, `_swLoadPhotos`, `_swPhotoPick`, `_swPhotoFor`, `_swPhotoHTML`, `_swIllHTML`, `_swBigHTML`, `_swSigWrap` … 외 6개 |
| 56,457 | 유튜브 썸네일 (v26-0922-10, HB: "타일 위아래가 비어서 안 이뻐") | `_swYtThumbFail`, `_swCellHTML` |
| 56,584 | 타일마다 바탕 사진 켜고 끄기 (v26-0922-13, HB) | `_swPhIcon`, `_swPhOn`, `_swEditBtns`, `_swTogglePhoto`, `_swArrowHTML`, `_swThereHTML`, `_swFaceSafe`, `_swFace`, `chip`, `_swOffTileEl` |
| 56,715 | 그리기 | `_swTileClass`, `_swQuiet`, `_swIxOf`, `_swTypeName`, `_swSortName`, `_swQuietCalc`, `_swColsNow`, `_swIxCalc`, `free`, `_swRenumber` |
| 56,798 | 첫 그림에 쓸 말씀을 미리 뽑아 둔다 (v26-0922-21, HB) | `_swSaveBootVerses`, `_swIntroSpan`, `_swRender` |
| 56,897 | 편집 모드 | `_swEditOn`, `_swEditBtnSync`, `mine`, `board`, `swOpenCollFilter`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `w`, `_swNoMotion`, `_swTrack`, `_swTrackTo` |
| 57,014 | 한 칸 넘기기 (PC 꺽쇠·자판이 쓴다) | `_swStep`, `_swRepaint` |
| 57,041 | 누르면 전체화면 | `_swOpenVerse`, `_swGridTile`, `facet`, `_swVersesFor`, `_swTileOpen`, `md`, `label` |
| 57,156 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 57,188 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swDragHover` |
| 57,238 | 판 끝에 닿으면 저절로 굴러간다 (v26-0922-15, HB) | `_swAutoScroll`, `_swAutoStop`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap`, `_swKbTiles`, `_swKbSync`, `_swKbSet`, `_swKbStep`, `_swKbGo`, `_swKbGoX`, `_swKbPage`, `_swKbSort` … 외 5개 |
| 57,786 | 자판 단축키 도움말 | `_swKbHelpOpen`, `_kbHelpRows`, `sw`, `_swKbHelpFill`, `_kbHelpKey`, `openSwKbHelp`, `closeSwKbHelp` |
| 57,925 | 형제 앱 열기 (v26-0921-2, HB) | `_sisterApp`, `dev`, `cross`, `_sisterFill`, `swCrossToggle`, `_swCrossBtnSync`, `_sisterStandalone`, `_sisterIsIOS`, `sisterGo`, `_swBoot` |
| 58,033 | Sweeter 설정창 '계정' 탭 (v26-0921-8, HB 4-5) | `_swMergeAccountTab` |
| 58,057 | Sweeter 설정창 '뷰' 탭 병합 (v26-0921-8, HB 4-4) | `_swFillMovedRows`, `_swMergeViewTab`, `_swCoverOn`, `_swMount` |
| 58,135 | 좌상단 로고 — BLOCK7 과 **같은 손버릇**이다 (v26-0921-1, HB) | – |
| 58,145 | 우상단 톱니 — 탭 = 설정 · 롱터치 = 설정 '계정' 탭 바로 (v26-1024-17, HB) | – |
| 58,156 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll`, `TDASH`, `add`, `dur` |
| 58,233 | 모으기: 두 기록 → 한 모양 [{date,t,time,d,app,src,label}] | `collect`, `mapPrayers`, `focusPrayers`, `dayFlow`, `mergeFlow`, `wordPray`, `wpLegend`, `hueIndex`, `hueOf`, `itemName`, `edRow`, `mapTop`, `dayTotals`, `inRange` … 외 3개 |
| 58,432 | 그리기 | `injectCSS`, `legend`, `bigNum`, `cmpLine`, `topRefs`, `bySrc`, `bySlot`, `viewWeek`, `heat`, `viewMonth`, `viewDay`, `nav`, `html` |
| 58,735 | 판 하나를 el 안에 연다 | `mount` |
| 58,799 | 부드러운 전환 (HB 2026-10-15) — 바꿀 때는 늘 옆으로 스르륵: 나가고 → 그리고 → 들어온다. 밀기는 손가락을 따라간다 | `pageTint`, `open`, `close`, `isOpen`, `redraw` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_abLocalState`  `_abRankLabel`  `_activeVersesFrom`  `_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`
`_aggByRef`  `_aggEntriesForKind`  `_appConfirmResolve`  `_applySermonListSheet`  `_applySneakMaxW`  `_applyUrgentSpotlight`
`_attachRepeatButtons`  `_attachSecPickLongPress`  `_attachSubMemoBadges`  `_attachTextPinch`  `_attachVliMenus`  `_autoContactMark`
`_avgHex`  `_b7BoardKey`  `_b7KbReady`  `_b7Pop`  `_b7PopClose`  `_b7PopMount`
`_b7PopSeg`  `_b7PopSegs`  `_b7TaskKey`  `_backupDownload`  `_backupPayload`  `_bakDevice`
`_bibleBtnLongPress`  `_bibleChapters`  `_bibleRankOfRef`  `_bibleShort`  `_bookAbbr`  `_bookCanon`
`_bookNorm`  `_bookOfRef`  `_bookSel`  `_booksOf`  `_brActiveWin`  `_brApplyLook`
`_brBind`  `_brBook`  `_brBooks`  `_brBusy`  `_brCharAt`  `_brCharAtGeo`
`_brCharRect`  `_brChrome`  `_brChromeApply`  `_brChromeFreeze`  `_brChVerses`  `_brCloseSheets`
`_brCopy`  `_brCopyFallback`  `_brCopyText`  `_brCover`  `_brCovered`  `_brDashRender`
`_brDashRows`  `_brDashStart`  `_brDashStats`  `_brDate`  `_brDev`  `_brDiagStore`
`_brDiagStuck`  `_brDiagSync`  `_brDiagText`  `_brEl`  `_brEsc`  `_brFetchJSON`
`_brFindWords`  `_brFmtMin`  `_brFmtRef`  `_brGet`  `_brHistHide`  `_brHistory`
`_brInkAdd`  `_brInkBlob`  `_brInkCut`  `_brInkDo`  `_brInkDot`  `_brInkErase`
`_brInkHeart`  `_brInkHitAt`  `_brInkHits`  `_brInkHl`  `_brInkIcon`  `_brInkId`
`_brInkInside`  `_brInkOpen`  `_brInkOrigin`  `_brInkPaint`  `_brInkPref`  `_brInkPrefSet`
`_brInkQuery`  `_brInkRefresh`  `_brInkRot`  `_brInkSpans`  `_brInkSpansFrom`  `_brInkStepPos`
`_brInkStroke`  `_brInkSym`  `_brInkSymParts`  `_brInkSync`  `_brInkTx`  `_brInkUl`
`_brIsOpen`  `_brKey`  `_brListDelete`  `_brLoadSerif`  `_brLoupe`  `_brLzGet`
`_brLzPaint`  `_brMatch`  `_brMigrateNotes`  `_brNoteHTML`  `_brNoteInline`  `_brNotesAt`
`_brNoteSave`  `_brOnScroll`  `_brOpenAct`  `_brOpenDash`  `_brOpenMemo`  `_brOpenSheet`
`_brOrigAdd`  `_brOrigHitAt`  `_brOrigLines`  `_brOrigListHTML`  `_brOrigNote`  `_brOrigOpen`
`_brOrigSend`  `_brOrigWords`  `_brParseRef`  `_brPosGet`  `_brPosSave`  `_brPosSet`
`_brProgSync`  `_brRangeOf`  `_brReadAdd`  `_brReadMs`  `_brRecent`  `_brRenderList`
`_brRenderPick`  `_brRerender`  `_brRow`  `_brRowGone`  `_brRunFind`  `_brS`
`_brSeenOf`  `_brSessEnd`  `_brSessStart`  `_brSessStep`  `_brSet`  `_brSetMark`
`_brShow`  `_brSpanLines`  `_brStep`  `_brStepAnim`  `_brSwBack`  `_brSwCan`
`_brSwFollow`  `_brSwipeBind`  `_brSwPage`  `_brSwQuiet`  `_brSwRelease`  `_brSyncAa`
`_brSyncScope`  `_brToast`  `_brTRHas`  `_brTRKey`  `_brTRList`  `_brTRRender`
`_brTRSetOrder`  `_brTRToggle`  `_brTxIdx`  `_brTxNode`  `_brTxOf`  `_brUnit`
`_brUnpark`  `_brUrl`  `_brVerseList`  `_brVerseObj`  `_brViewRef`  `_brViewVs`
`_brVmClose`  `_brVmOpen`  `_brVmRun`  `_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`
`_buildShareText`  `_bump`  `_bumpVerseStat`  `_calKey`  `_cardActionCount`  `_cardGrain`
`_cardTextLS`  `_carryDateInScope`  `_carryIsRep`  `_carryPendingCount`  `_carryScope`  `_carryTaskExtras`
`_carryWants`  `_ceFillSelects`  `_cellDefaultSec`  `_cellTodoAddMany`  `_ceMakeRow`  `_ceSortedIdx`
`_ceToggleTrashSel`  `_ceUpdateDeleteBtn`  `_ceUpdateRestoreBtn`  `_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfApply`
`_cfBaseLine`  `_cfCanMerge`  `_cfCardHTML`  `_cfChoiceLabel`  `_cfClearSel`  `_cfCutRaw`
`_cfDetect`  `_cfDevOnly`  `_cfDiffer`  `_cfEsc`  `_cfExplain`  `_cfFetchCloud`
`_cfGroupName`  `_cfHasSel`  `_cfId`  `_cfIsStamp`  `_cfJ`  `_cfKindLabel`
`_cfLoadLocal`  `_cfMake`  `_cfMine`  `_cfNiceLabel`  `_cfOpen`  `_cfOpenCount`
`_cfPushCloud`  `_cfSaveLocal`  `_cfScanById`  `_cfScanKeys`  `_cfScanSection`  `_cfSecLabel`
`_cfSelKey`  `_cfShrink`  `_cfSortKey`  `_cfStampNice`  `_cfStore`  `_cfSyncVisibility`
`_cfText`  `_cfTrimmed`  `_cfUnion`  `_cfWhoLabel`  `_chk`  `_churchCfg`
`_clearPendingVerse`  `_clearUrgentOnDone`  `_closeHdrCalendarNow`  `_colKey`  `_collFilteredVerses`  `_collHue`
`_collIsProp`  `_collLabel`  `_collPeriodPass`  `_collPeriodVerses`  `_collRawVerses`  `_collVersePassesFilter`
`_collVersePassesOnly`  `_collVerseShows`  `_contactTaskSvg`  `_copyTextFallback`  `_crossSwipeAllowed`  `_ctNow`
`_currentColl`  `_currentSecId`  `_dataURLtoBlob`  `_datePickArmed`  `_dayHasContent`  `_dayKeyAfter`
`_dayKeyBefore`  `_dayKeyDiff`  `_dayLabel`  `_daySecTasks`  `_dayTaskCount`  `_dayTaskSecs`
`_desat`  `_devAttachSwipe`  `_devCompressFile`  `_devFilesHTML`  `_deviceBaseW`  `_deviceId`
`_deviceLabel`  `_devInboxButton`  `_devMarkRead`  `_devMigrateRead`  `_devNotifOn`  `_devNotifSet`
`_devReadIds`  `_devReadLocal`  `_devShortSide`  `_devTrashGet`  `_devTrashSet`  `_devWhen`
`_devWhenTxt`  `_dfAgo`  `_dfArr`  `_dfBrief`  `_dfColl1`  `_dfColls`
`_dfContact1`  `_dfContacts`  `_dfCut`  `_dfDay`  `_dfDays`  `_dfDeep`
`_dfDeepLines`  `_dfDiff`  `_dfFieldLabel`  `_dfJ`  `_dfJosa`  `_dfKindName`
`_dfLogRefs`  `_dfLogs`  `_dfPush`  `_dfQ`  `_dfRo`  `_dfSame`
`_dfScale`  `_dfScaleText`  `_dfSeg`  `_dfSegPath`  `_dfSetLabel`  `_dfSettings`
`_dfTaskKey`  `_dfToday`  `_dfVal`  `_dfValS`  `_dfVKey`  `_dfWhen`
`_dfWord`  `_dismissReactToast`  `_dismissToast`  `_dlog`  `_dlogScroll`  `_dNavEl`
`_doCarry`  `_doToggleFlag`  `_doToggleUrgent`  `_dragZoneMid`  `_drBlurTaskInput`  `_drFlipEls`
`_drGhostLand`  `_dropStalePending`  `_drPlace`  `_drRect`  `_drSlotBegin`  `_drSlotEnd`
`_drTy`  `_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`  `_dsStrip`
`_dsWrite`  `_dupDoneReset`  `_dupDoneSync`  `_dupDoneToggle`  `_dupVerseScan`  `_effectiveMode`
`_EMBED`  `_embedAllClosed`  `_embedClean`  `_embedDone`  `_embedIdleSoon`  `_embedOn`
`_embedPost`  `_embedRun`  `_embedStart`  `_embedTheme`  `_embedWatchPeek`  `_ensurePushToken`
`_ensureUrgentSpotlightObserver`  `_entrySecId`  `_escHtml`  `_escShown`  `_euroRo`  `_evChipCut`
`_evChipLabel`  `_evChipN`  `_evChipPreview`  `_evChipSync`  `_evDeleteApply`  `_evDeleteAt`
`_evEditApply`  `_evenDeeperShortRef`  `_evenOn`  `_evFillMins`  `_evGcalNote`  `_evInheritCal`
`_evInSeries`  `_evLeadMin`  `_evMarkDropSec`  `_evMd`  `_evMoveApply`  `_evMoveAsk`
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
`_focusNewTaskInput`  `_foldSwGroup`  `_foldSwMode`  `_foldSwSync`  `_freshTaskCopy`  `_fxGlow`
`_fxRipple`  `_gcalAfterConnect`  `_gcalApi`  `_gcalApplyLocal`  `_gcalBoot`  `_gcalCfg`
`_gcalDefSec`  `_gcalDsh`  `_gcalEvColor`  `_gcalEvTx`  `_gcalFetchCal`  `_gcalFetchInst`
`_gcalFind`  `_gcalFn`  `_gcalGone`  `_gcalKick`  `_gcalLanes`  `_gcalListCals`
`_gcalMD`  `_gcalMonthLanes`  `_gcalOnSave`  `_gcalPickApply`  `_gcalPickApplyV`  `_gcalPickRender`
`_gcalProbe`  `_gcalRenderSettings`  `_gcalRenderStatus`  `_gcalRepNew`  `_gcalRepOn`  `_gcalRunRemote`
`_gcalSeen`  `_gcalSegHTML`  `_gcalSetCfg`  `_gcalSpanN`  `_gcalSpanTag`  `_gcalTintChip`
`_gcalToken`  `_gcalTomb`  `_gcalTz`  `_gcalUsable`  `_gcalUser`  `_gcalWinQ`
`_genCollId`  `_generateUniqueShareCode`  `_getCollFilter`  `_ghostDragStart`  `_gnbExtrasSync`  `_gnbGearMenu`
`_gnbGearSync`  `_gnbGearTap`  `_gnbNarrow`  `_gnbPickerOn`  `_gnbPickerStep`  `_gnbRpMenu`
`_groupVersesBy`  `_groupVersesByMulti`  `_grpAddrPreview`  `_grpAddrShow`  `_grpAddrUrl`  `_grpFetch`
`_grpNameNorm`  `_grpNameValid`  `_grpRenderColls`  `_grpShowAddr`  `_grpSync`  `_gSrcId`
`_hdrCalRender`  `_hexNum`  `_hiAssign`  `_hiBold`  `_hiFw`  `_hiHash`
`_hiHTML`  `_hiKindsOn`  `_hiLinesHTML`  `_hiOn`  `_hiOverlap`  `_hiOverlay`
`_hiPen`  `_hiPhrases`  `_hiPickAt`  `_hiRanges`  `_hiRefreshAll`  `_hiRibbon`
`_hiRng`  `_hiShuffle`  `_hiSmooth`  `_hiSquash`  `_hiStar`  `_hiStarMax`
`_hiStarPoly`  `_hiWave`  `_hiWavePoly`  `_hiWob`  `_idbDel`  `_idbDelOutcome`
`_idbDelRaw`  `_idbForget`  `_idbGet`  `_idbGetOutcome`  `_idbGetRaw`  `_idbOpen`
`_idbRaw`  `_idbSet`  `_idbSetOutcome`  `_idbSetRaw`  `_importVerseRows`  `_inboxDiagBlock`
`_initBibleBtnMenus`  `_initEdgeBack`  `_initHdrDateLongPress`  `_initSettingsSwipe`  `_initSneakMaxWPicker`  `_initVDashDetailSwipe`
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
`_keepSwitchIsOpen`  `_lay`  `_layAllPlaced`  `_layApplyWidths`  `_layColKeys`  `_layColOf`
`_layColsFor`  `_layDrop`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`  `_layMode`
`_laySpanSide`  `_loadSheetJs`  `_localOwner`  `_logoMenuEsc`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`
`_logoMenuSubScheduleClose`  `_longEditOpen`  `_looksLikeRef`  `_lord`  `_lsdAppName`  `_lsdFamily`
`_lsDiagCalc`  `_lsDiagRead`  `_lsDiagRender`  `_lsDiagSumText`  `_lsdN`  `_lsDropBase`
`_lsk`  `_lsPutST`  `_lsStKey`  `_lszPack`  `_lszUnpack`  `_lvApplyIn`
`_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`  `_makeSubGhost`  `_makeSubRow`  `_makeTimeRollPair`
`_makeUrgentBadgeHTML`  `_makeWMViewBtnsHTML`  `_memoApplySize`  `_memoBadgeFill`  `_memoClampSize`  `_memoCopyText`
`_memoDateKey`  `_memoItem`  `_memoMoveTaskToDate`  `_memoRender`  `_memoSaveEdit`  `_memoSaveToPhone`
`_memoScan`  `_memoTelDigits`  `_memoViewHTML`  `_menuArmOnNextPress`  `_menuFitHeight`  `_menuLockScroll`
`_mFitCells`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`  `_mgEnforceUrgentCap`
`_mgEntryArray`  `_mgFillSide`  `_mgIsFill`  `_mgLogFlat`  `_mgLogNested`  `_mGridApplyH`
`_mGridH`  `_mGridSetH`  `_mgSetting`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`
`_migrateTaskRepeats`  `_mlAddContacts`  `_mlAddTasks`  `_mlBind`  `_mlContactParse`  `_mlLines`
`_mlPaste`  `_monthWideSide`  `_moveDateToastMsg`  `_movedTaskCopy`  `_moveLabel`  `_mviewEventCountsHTML`
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
`_presetVisTouched`  `_propBooks`  `_propHiList`  `_propHiPick`  `_propImg`  `_propRefs`
`_propRowsToItems`  `_propSits`  `_propYt`  `_psIsDefault`  `_psOverlay`  `_psProject`
`_PT_FAMS`  `_ptAvailW`  `_ptBag`  `_ptCutPoint`  `_ptCutTitle`  `_ptDrawnLines`
`_ptEnsureFont`  `_ptFont`  `_ptFontFor`  `_ptFontLoaded`  `_ptFontPending`  `_ptFontsOn`
`_ptGlued`  `_ptGroupInit`  `_ptLen`  `_ptLineK`  `_ptLinkGoogle`  `_ptMissing`
`_ptMotionOn`  `_ptPaint`  `_ptPickMotion`  `_ptPreloadVerse`  `_ptRelines`  `_ptSample`
`_ptSplitOnce`  `_ptStillTrying`  `_ptSyncFontUI`  `_ptSyncMotionUI`  `_ptWarmup`  `_ptWrapTitle`
`_publishSharedColl`  `_pushKey`  `_pushKeyPid`  `_pushReplan`  `_pushTagProduct`  `_rcKeepNative`
`_reactKey`  `_reactKeyParts`  `_reactWithToast`  `_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`
`_refDigitsPad`  `_refKey`  `_refNorm`  `_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`
`_renderKeepPicker`  `_renderKeepSubMenu`  `_renderKeepSwitch`  `_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`
`_renderPickerInto`  `_renderSecPick`  `_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`
`_renderVAggBody`  `_renderVerseUiLevelIcons`  `_renderVfSecAssign`  `_renderVfThemeChips`  `_reorderTaskPriority`  `_rep2`
`_REP_SCOPE_IC`  `_repAddEx`  `_repBadgeFill`  `_repBlocked`  `_repEx`  `_repHiddenOn`
`_repKeepMarks`  `_repKindOf`  `_repMoveApply`  `_repMoveAsk`  `_repOnDay`  `_repPlain`
`_repPropApply`  `_repPropAskNow`  `_repPropBegin`  `_repPropBusy`  `_repPropCommit`  `_repPropEditing`
`_repPropFlushNow`  `_repPropIdx`  `_repPropKey`  `_repPropPut`  `_repPropRestore`  `_repPropSnap`
`_repPropSoon`  `_repPropTick`  `_repPurgeEvents`  `_repPurgeTasks`  `_repRule`  `_repScopeAsk`
`_repScopeOpen`  `_repScopeOvClick`  `_repScopePick`  `_repSubDiffWord`  `_repUntil`  `_repVisIdx`
`_revealSec`  `_rewriteLogRefs`  `_rgba`  `_ridPresentOn`  `_rollFit`  `_rollHTML`
`_rollIdx`  `_rollNoTr`  `_rollSecLabel`  `_rollShow`  `_rollStart`  `_rollTick`
`_rowsToItems`  `_rpAddBtnHTML`  `_rpAttachChipDrag`  `_rpAttachFoldTap`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`
`_rpAttachVResize`  `_rpChipName`  `_rpCurrentRatio`  `_rpfFitFlags`  `_rpfGhost`  `_rpFoldData`
`_rpFoldDayLabel`  `_rpFoldEvCmp`  `_rpFoldEvHTML`  `_rpFoldFit`  `_rpFoldFitAll`  `_rpFoldFitOne`
`_rpFoldFitSum`  `_rpFoldFlagBar`  `_rpFoldFlagTxt`  `_rpFoldHandleHTML`  `_rpFoldLineRow`  `_rpFoldOf`
`_rpFoldSegHTML`  `_rpFoldSegResume`  `_rpFoldSet`  `_rpFoldSumH`  `_rpFoldSumHTML`  `_rpFoldTxApply`
`_rpfScan`  `_rpGetWidgets`  `_rpMGridH`  `_rpMonthGridHTML`  `_rpMonthOf`  `_rpMorphStart`
`_rpNormMonth`  `_rpSetMGridH`  `_rpSetVCardH`  `_rpSetVListH`  `_rpSetWkH`  `_rpTypeOk`
`_rpVCardH`  `_rpVListH`  `_rpWidgetHTML`  `_rpWidgetName`  `_rpWkH`  `_rpWMBodyEls`
`_rpWMSegHTML`  `_rpWMSegHTML0`  `_rpWMSegOn`  `_rpWMSegResume`  `_rpWMSwap`  `_sdrEnd`
`_sdrMove`  `_sdrPlace`  `_sdrQuiet`  `_sdrRows`  `_sdrStart`  `_secArchiveApply`
`_secArchiveCapture`  `_secBoundaryChoices`  `_secClosed`  `_secDataCount`  `_secFirstBoundary`  `_secIdForTime`
`_secIdNowAll`  `_secIsCustom`  `_secLenMin`  `_secMoveTo`  `_secNormalizeTimes`  `_secNoTime`
`_secOffsets`  `_secPickBack`  `_secPickCancelClose`  `_secPickChoose`  `_secPickFloat`  `_secPickOn`
`_secPickOpen`  `_secPickOpenFromRow`  `_secPickRender`  `_secPickScheduleClose`  `_secPickSecs`  `_secPickSpecFor`
`_secsCommit`  `_secStripData`  `_secTimeChoices`  `_secWouldEmptyDay`  `_sermonCatNorm`  `_sermonListMap`
`_sermonNoVideo`  `_sermonSkipNoVideo`  `_sermonYtFor`  `_setLocalOwner`  `_setTabMemGet`  `_setTabMemKey`
`_setTabMemPut`  `_sgDevClass`  `_sgEdges`  `_sgFoldDefaultOpen`  `_sgFoldInit`  `_sgFoldMem`
`_sgFoldMemPut`  `_sgFoldSum`  `_sgFoldSumAll`  `_sgTitle`  `_shareCopy`  `_sharedVerseIn`
`_sharedVerseOut`  `_shareFileName`  `_shareMessage`  `_shareResetBigText`  `_shareSizeKey`  `_sheetCopyPending`
`_sheetCopyThenGo`  `_sheetCsvEndpoints`  `_sheetDrag`  `_sheetDragBindSettings`  `_sheetEditCall`  `_sheetEditErrText`
`_sheetEditProbe`  `_sheetEditUrlNorm`  `_sheetGo`  `_sheetGoMain`  `_sheetIsPc`  `_sheetMainBuild`
`_sheetMainLoad`  `_sheetMainReady`  `_sheetMainTtl`  `_sheetMainWarm`  `_sheetOpenPropMain`  `_sheetRowsSane`
`_sheetUrlForVerse`  `_shotDraw`  `_shotFont`  `_siriDate`  `_siriDayLabel`  `_siriMakeKeyNow`
`_siriParse`  `_siriPlace`  `_siriRenderSettings`  `_siriSaved`  `_siriSecAt`  `_siriT2m`
`_siriYmd`  `_sisterApp`  `_sisterFill`  `_sisterIsIOS`  `_sisterStandalone`  `_sneakMaxW`
`_sneakMaxWDefault`  `_softEnter`  `_sortEventsKeepingTimeless`  `_sortGroups`  `_srchActBg`  `_srchActClose`
`_srchActDate`  `_srchActDo`  `_srchActDone`  `_srchActDraw`  `_srchActOpen`  `_srchAutoRemember`
`_srchBackToast`  `_srchBindLongPress`  `_srchBindSwipe`  `_srchCarryMin`  `_srchChip`  `_srchClear`
`_srchContactTel`  `_srchDayNum`  `_srchDayTxt`  `_srchDelToast`  `_srchEvDest`  `_srchEventHTML`
`_srchEvSync`  `_srchFilterFix`  `_srchFlash`  `_srchForget`  `_srchGoDay`  `_srchGoEvent`
`_srchGoTask`  `_srchHas`  `_srchInput`  `_srchIsOpen`  `_srchItemOf`  `_srchKey`
`_srchKeyAdd`  `_srchKeyOf`  `_srchMark`  `_srchMd`  `_srchMiniHTML`  `_srchNorm`
`_srchOpenBible`  `_srchOpenVerse`  `_srchOpenWidgets`  `_srchParse`  `_srchPeriod`  `_srchPick`
`_srchPickQuick`  `_srchQOpenLoad`  `_srchQOpenSave`  `_srchQuickLabel`  `_srchQuickRowHTML`  `_srchQuickTask`
`_srchQuickToggle`  `_srchRecent`  `_srchRefLabel`  `_srchRemember`  `_srchRender`  `_srchResult`
`_srchRun`  `_srchSecOf`  `_srchSecs`  `_srchSetKind`  `_srchSetRange`  `_srchSetSort`
`_srchSnippet`  `_srchSort`  `_srchSortBar`  `_srchSortGet`  `_srchSortMode`  `_srchStale`
`_srchSwAtNow`  `_srchSwCommit`  `_srchSwEnd`  `_srchSwPaint`  `_srchTap`  `_srchTaskHTML`
`_srchToggleDone`  `_srchUnfilter`  `_srchVerseHTML`  `_srchVerses`  `_srchWeekOff`  `_srchWithTask`
`_stabList`  `_statDocKey`  `_statRefKey`  `_subAdd`  `_subEditEnd`  `_subEditPanel`
`_subFocusGhost`  `_subGaugeFill`  `_subGaugeSVG`  `_subGhostId`  `_subIsOpen`  `_subKey`
`_subMoveFromMenu`  `_subParse`  `_subPromoteFromMenu`  `_subPrune`  `_subRemove`  `_subRemoveAll`
`_subRemoveFromMenu`  `_subReorder`  `_subRerender`  `_subsCopy`  `_subscribeShared`  `_subSetAll`
`_subsOf`  `_subStat`  `_subSyncParent`  `_subToggleBadgeFill`  `_subToggleOpen`  `_svcCmp`
`_svcRank`  `_swAddTile`  `_swAgo`  `_swArrowHTML`  `_swArtHTML`  `_swAsks`
`_swAutoScroll`  `_swAutoStop`  `_swAxisKeys`  `_swBigHTML`  `_swBlock7Src`  `_swBoardKey`
`_swBoardOn`  `_swBooks`  `_swBoot`  `_swBootOff`  `_swCellHTML`  `_swColls`
`_swColsNow`  `_swCount`  `_swCountText`  `_swCountVerses`  `_swCoverOn`  `_swCrossBtnSync`
`_swDragHole`  `_swDragHoleOff`  `_swDragHover`  `_swDragMove`  `_swDragStart`  `_swEditBtns`
`_swEditBtnSync`  `_swEditOn`  `_swEmptyText`  `_swEsc`  `_swEvenOn`  `_swFace`
`_swFaceSafe`  `_swFillMovedRows`  `_swFinishSwipe`  `_swFlow`  `_swFlowDay`  `_swFlowHTML`
`_swFlowShape`  `_swGridTile`  `_swHandFont`  `_swHiHTML`  `_swHiText`  `_swIllHTML`
`_swImportApply`  `_swInitGestures`  `_swInsights`  `_swInsightsWin`  `_swIntroSpan`  `_swInWin`
`_swIsKept`  `_swIxCalc`  `_swIxOf`  `_swJo`  `_swKbGo`  `_swKbGoX`
`_swKbHelpFill`  `_swKbHelpOpen`  `_swKbHint`  `_swKbKeep`  `_swKbMove`  `_swKbPage`
`_swKbReady`  `_swKbSet`  `_swKbSort`  `_swKbStep`  `_swKbSync`  `_swKbTiles`
`_swKeeps`  `_swKillTile`  `_swLastTouch`  `_swLastVerses`  `_swLoadPhotos`  `_swLoadTiles`
`_swMD`  `_swMergeAccountTab`  `_swMergeViewTab`  `_swMount`  `_swMyWeight`  `_swNeeds`
`_swNeedSay`  `_swNeedSkip`  `_swNoMotion`  `_swOffTileEl`  `_swOn`  `_swOpenVerse`
`_swPhIcon`  `_swPhOn`  `_swPhotoFor`  `_swPhotoHTML`  `_swPhotoPick`  `_swPipsHTML`
`_swPool`  `_swQuiet`  `_swQuietCalc`  `_swReacts`  `_swRecIn`  `_swRender`
`_swRenumber`  `_swReorder`  `_swRepaint`  `_swRepaintKeepTiles`  `_swRhythm`  `_swRhythmGrid`
`_swSaveBootVerses`  `_swSaveTiles`  `_swSermonPool`  `_swSermons`  `_swSermonTopic`  `_swSermonVerses`
`_swSigBook`  `_swSigColl`  `_swSigHTML`  `_swSigReact`  `_swSigRhythm`  `_swSigSermon`
`_swSigTag`  `_swSigWrap`  `_swSizeCells`  `_swSnap`  `_swSortName`  `_swSpareKinds`
`_swStep`  `_swStrip`  `_swSvcKey`  `_swSvcOf`  `_swSyncNotice`  `_swTags`
`_swThereHTML`  `_swTileClass`  `_swTileOpen`  `_swTilesRaw`  `_swToday`  `_swTogglePhoto`
`_swTrack`  `_swTrackTo`  `_swTypeName`  `_swValues`  `_swVerRaw`  `_swVersesFor`
`_swVersesForInsight`  `_swWhyOf`  `_swWin`  `_swYtThumbFail`  `_syncBpPickers`  `_syncCarryScopeBtns`
`_syncCatWeight`  `_syncCollSheets`  `_syncCondRows`  `_syncDeeperOpenUI`  `_syncDeviceNotifyUI`  `_syncDevInboxVisibility`
`_syncDevVerBadge`  `_syncEventDateUI`  `_syncEvenVisibility`  `_syncGoBtn`  `_syncGroupWeight`  `_syncHdrDateOptical`
`_syncHiOverlapRow`  `_syncHiUI`  `_syncIncludeInit`  `_syncIncludeRender`  `_syncLayFormUI`  `_syncLinkOpenModeUI`
`_syncNoVideoHTML`  `_syncShareSettingsUI`  `_syncShareSizeUI`  `_syncSheetVersesIntoColl`  `_syncTaskOvfBtns`  `_syncTimeStepBtns`
`_syncUiScaleBtns`  `_syncVerseCondRows`  `_syncVerseFp`  `_syncVerseNextBtns`  `_syncVersePushPool`  `_syncVersePushUI`
`_syncVfTextScaleUI`  `_syncVpTimeField`  `_syncVpTimeList`  `_t2m`  `_tagartAliasMap`  `_tagartDrawOn`
`_tagartHay`  `_tagartHit`  `_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`
`_tagartSwatchSvg`  `_taskArrOf`  `_taskDeleteApply`  `_taskDeleteAt`  `_taskEnterNext`  `_taskFlipRender`
`_taskIsRep`  `_taskPriorityRank`  `_taskRepDefault`  `_taskRepFallback`  `_taskRepInstances`  `_taskRepRootOf`
`_taskRepRoots`  `_taskRepWeekly`  `_taskSetRepeat`  `_taskTextApply`  `_taskTextCommit`  `_tdBindAll`
`_tdBindLong`  `_tdLoadPray`  `_tdOpts`  `_TF_NOISE`  `_tfApplyTheme`  `_tfBreathAt`
`_tfBuildSprites`  `_tfCandleAt`  `_tfDevKind`  `_tfDrawCross`  `_tfFlickerAt`  `_tfFlickerParams`
`_tfFrame`  `_tfGet`  `_tfHex2Hsl`  `_tfHsl2Rgb`  `_tfLoad`  `_tfNoise`
`_tfPick`  `_tfQuiet`  `_tfSize`  `_tfSpawn`  `_tfSprites`  `_tfStore`
`_tfSyncUI`  `_tfW`  `_tfWire`  `_tfWordApply`  `_tfWordChanged`  `_tfWordFit`
`_tfWordGo`  `_tfWordMulti`  `_tfWordRect`  `_tfWordRender`  `_tfWordSet`  `_tfWordSyncUI`
`_tfWordToggle`  `_tfWordWire`  `_thAcPush`  `_thAcText`  `_thContrast`  `_thDeltaE`
`_themePreviewHTML`  `_themeSummaryText`  `_themeTokens`  `_thereBegin`  `_thereClock`  `_thereCommit`
`_thereCountFor`  `_thereDurWords`  `_thereEach`  `_thereIcHTML`  `_thereIconKey`  `_thereIconSync`
`_thereIsOpen`  `_thereRecorded`  `_thereStripHanja`  `_thereTotalSec`  `_thereWordFromBible`  `_thereWordFromVerse`
`_thFade`  `_thHex`  `_thLab`  `_thLabF`  `_thLabFi`  `_thLabRgb`
`_thLin`  `_thLum`  `_thMix`  `_thOn`  `_thPanelMix`  `_thReadable`
`_thRgb`  `_thRgba`  `_thRound`  `_thTintDE`  `_thTintK`  `_thUnlin`
`_thWorst`  `_timeStep`  `_tmFloatOK`  `_tmSlide`  `_tmSubCancelClose`  `_tmSubHide`
`_tmSubOpen`  `_tmSubPanel`  `_tmSubReset`  `_tmSubScheduleClose`  `_tmSubTap`  `_toastName`
`_toastSpin`  `_toastWithJump`  `_todayDateObj`  `_todoInboxToast`  `_toThisMonth`  `_trashAll`
`_trashClone`  `_trashCount`  `_trashCut`  `_trashDay`  `_trashPurgeOld`  `_trashRestored`
`_trashTs`  `_tryCloseLogoMenu`  `_tsFine`  `_tsNearest`  `_tsPinchArm`  `_tsPinchBusy`
`_tsTouchDist`  `_txeDefer`  `_txEditEl`  `_txeMove`  `_txeMoveOff`  `_txeMoveOn`
`_txeZone`  `_uiLvIconSVG`  `_uiScaleGet`  `_uiScaleSliderPaint`  `_upApply`  `_upBusyScreen`
`_upCheck`  `_upClearTries`  `_updateCfAllCount`  `_updateDragHintBounds`  `_upHold`  `_upReloadFresh`
`_upSafeNow`  `_upSetTries`  `_upTries`  `_upWaitHome`  `_urgentItemsOn`  `_vAggSyncKeepTitle`
`_vAxisIconHTML`  `_vbThereEl`  `_vcAll`  `_vcApplyNav`  `_vcAttachGestures`  `_vcAutoAnchors`
`_vcAutoChanged`  `_vcAutoMin`  `_vcAutoOffset`  `_vcAutoOn`  `_vcAutoResetAnchors`  `_vcAutoSaveAnchors`
`_vcAutoSeq`  `_vcAutoSetAnchor`  `_vcAutoSlide`  `_vcAutoSlot`  `_vcAutoStart`  `_vcAutoTick`
`_vcCardHTML`  `_vcCreate`  `_vcCurrent`  `_vcCurX`  `_vcFilterLabel`  `_vcGet`
`_vcGroupOf`  `_vcGroupOn`  `_vcHash`  `_vcHeadMode`  `_vcHiSplit`  `_vcIdOf`
`_vcIs`  `_vcKeyOf`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcListHTML`  `_vcListItems`
`_vcNewId`  `_vcPatternKey`  `_vcReactKeyOf`  `_vcRemove`  `_vcRollMode`  `_vcRollOpt`
`_vcRollSec`  `_vcScope`  `_vcScopeBtnHTML`  `_vcScopeCount`  `_vcScopeIcon`  `_vcScopeIsHome`
`_vcScopeKey`  `_vcScopeLabel`  `_vcScopeParts`  `_vcShow`  `_vcShowFor`  `_vcSlideCommit`
`_vcSlideEl`  `_vcSyncCounts`  `_vcSyncKind`  `_vcTextScale`  `_vcThemeVars`  `_vcUnplacedForKind`
`_vcVerseOf`  `_vcVerses`  `_vcView`  `_vDashAxisLabel`  `_vDashBuckets`  `_vDashCellHTML`
`_vDashCommonHTML`  `_vDashCondWords`  `_vDashDateBtn`  `_vDashDateLb`  `_vDashDetailDotsHTML`  `_vDashDetailGo`
`_vDashDetailKey`  `_vDashDetailSlide`  `_vDashEntries`  `_vDashEtcColor`  `_vDashHomeAgg`  `_vDashIsPlaceholder`
`_vDashKeyCmp`  `_vDashKeysOf`  `_vDashKindLabel`  `_vDashKindName`  `_vDashKindRowHTML`  `_vDashMarkReturn`
`_vDashMaxSlice`  `_vDashMaybeReturn`  `_vDashNextLine`  `_vDashPieDetailSVG`  `_vDashPieInsightHTML`  `_vDashPieSVG`
`_vDashPref`  `_vDashQ`  `_vDashRefLabel`  `_vDashRowHeadHTML`  `_vDashScope`  `_vDashScopeCtlHTML`
`_vDashScopeTitle`  `_vDashShowEtc`  `_vDashSlices`  `_vDashSpanWords`  `_vDashSubArmed`  `_vDashSubKind`
`_vDashSubRefSet`  `_vDashSubWords`  `_vDashTabWords`  `_vDashVerbWord`  `_vDashVerse`  `_vDashView`
`_vDashViewTabsHTML`  `_vDashWinEntries`  `_verCmp`  `_verNums`  `_verseBandHit`  `_verseBarSlideNav`
`_verseDragBegin`  `_verseDragEnd`  `_verseDragMove`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`
`_verseIdentity`  `_verseIdxForSec`  `_verseModeSession`  `_verseModeSettle`  `_verseModeTextEls`  `_verseNextMode`
`_verseRefFromUrl`  `_verseResizeOpacity`  `_verseResizeThreshold`  `_verseSettingsOpen`  `_verTap`  `_vfAdvStart`
`_vfApplyAdvRule`  `_vfApplyClauseRule`  `_vfApplyObjRule`  `_vfApplyParallelRule`  `_vfApplyPropAlign`  `_vfArtRecheck`
`_vfArtSyncUI`  `_vfAtCollection`  `_vfBg1Css`  `_vfBgCss`  `_vfBottomEl`  `_vfBreakClass`
`_vfCanBreakAt`  `_vfCatCue`  `_vfClauseStart`  `_vfClearNav`  `_vfCurrentVerse`  `_vfCycleMode`
`_vfDeeperRefs`  `_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`  `_vfFixWidow`  `_vfGeException`
`_vfHeartBurst`  `_vfHideCovers`  `_vfHideCoversNow`  `_vfHomeStash`  `_vfIsHeotdoeException`  `_vfIsParallelWord`
`_vfIsProp`  `_vfIsSubject`  `_vfKeepNav`  `_vfKeepSortHead`  `_vfLayoutIfResized`  `_vfLayoutPropText`
`_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`  `_vfPairKeep`  `_vfParallelRuns`
`_vfPatternKey`  `_vfPatternPool`  `_vfPlaceTagArt`  `_vfPrepareNext`  `_vfPropInk`  `_vfReadWrappedLines`
`_vfRedrawPropInk`  `_vfRelayoutSoon`  `_vfRenderCard`  `_vfRenderKeepSwitch`  `_vfRenderPropTitle`  `_vfRenderRef`
`_vfRenderTagArt`  `_vfRestoreCovers`  `_vfRollProp`  `_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`
`_vfSetNav`  `_vfSetTabPool`  `_vfShareImage`  `_vfShareSizeRow`  `_vfShareText`  `_vfShortOK`
`_vfShufGo`  `_vfShufPickRandom`  `_vfShufPos`  `_vfShufPush`  `_vfShufReset`  `_vfSizePropTitle`
`_vfSkipsForced`  `_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncPageBg`  `_vfSyncTopBar`  `_vfTabList`
`_vfTextScale`  `_vfTheme`  `_vfTitleTileFn`  `_vfWrapFit`  `_vgApplyFilter`  `_vgAxisItems`
`_vgAxisLabel`  `_vgBookOne`  `_vgCfg`  `_vgClamp`  `_vgDate`  `_vgDepth`
`_vgDepthCounts`  `_vgEscAttr`  `_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`
`_vgFamily`  `_vgFilteredPool`  `_vgFilterLabelText`  `_vgFilterNoteHTML`  `_vgFlatPresets`  `_vgGroupKey`
`_vgGroupLabel`  `_vgHighlightTile`  `_vgHomeLabel`  `_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`
`_vgOpenFromRef`  `_vgPinchSteps`  `_vgRankOf`  `_vgRankPref`  `_vgRankRailBind`  `_vgRawPool`
`_vgReach`  `_vgRenderTabs`  `_vgRestoreHighlight`  `_vgRun`  `_vgScrollToVerse`  `_vgSeeds`
`_vgSel`  `_vgSetCols`  `_vgShortRef`  `_vgShow`  `_vgSort`  `_vgStop`
`_vgSyncExcl`  `_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTab`  `_vgTileHtml`
`_vgTilePreset`  `_vgTileStyle`  `_vIdKey`  `_vlApplySort`  `_vlClearRegIdx`  `_vlDispRef`
`_vlEntriesForScope`  `_vlExtraSortFor`  `_vlHomeEntries`  `_vliCopyBody`  `_vLinkAxis`  `_vliOpenFull`
`_vliOpenFullForWidget`  `_vlIsProp`  `_vListControlsHTML`  `_vListRange`  `_vListRefresh`  `_vListRowsHTML`
`_vliVerse`  `_vlKeepEntries`  `_vlKindEntries`  `_vlPref`  `_vlReactTotals`  `_vlRegIdx`
`_vlTab`  `_vlTabsHTML`  `_vlwKey`  `_vMapCellHTML`  `_vMapChapList`  `_vMapChapMap`
`_vMapGroups`  `_vMapInk`  `_vMapLimitSet`  `_vMapMode`  `_vMapRange`  `_vMapRanks`
`_vMapShade`  `_vMapStats`  `_vMapStep`  `_vmmSyncItems`  `_vpDiagCopyFallback`  `_vpDiagFmt`
`_vpDiagHead`  `_vpEveryLabel`  `_vpFacetCandidates`  `_vpFacetRowHTML`  `_vpFiltMulti`  `_vpFiltRefSet`
`_vpGoFull`  `_vpList`  `_vpModeChipHTML`  `_vpNextTab`  `_vpOrders`  `_vpOtherAxis`
`_vpPool`  `_vpRep`  `_vpSave`  `_vpShortRef`  `_vpTabName`  `_vpToMin`
`_vpTurnOn`  `_vRhyBands`  `_vRhyKind`  `_vRhyThereSplit`  `_vsetFlashTab`  `_vsetGoColl`
`_vsetGoTab`  `_vsetRestoreBack`  `_vsetStartTab`  `_vsetTitleSync`  `_vstabList`  `_vTrBindBand`
`_vTrBindRails`  `_vTrBucketLabel`  `_vTrBucketList`  `_vTrBucketOf`  `_vTrBucketRange`  `_vTrChapCmp`
`_vTrChapNo`  `_vTrChapterKeys`  `_vTrChartSVG`  `_vTrChipsHTML`  `_vTrData`  `_vTrDiffHTML`
`_vTrEntries`  `_vTrExclLabel`  `_vTrFindings`  `_vTrFindingsHTML`  `_vTrGeo`  `_vTrHFromX`
`_vTrInsightHTML`  `_vTrInsMax`  `_vTrInsN`  `_vTrJosaEun`  `_vTrJosaGa`  `_vTrJosaRo`
`_vTrJosaYeyo`  `_vTrNameCmp`  `_vTrNowBucket`  `_vTrNowN`  `_vTrOtherSpan`  `_vTrPref`
`_vTrRail2Bind`  `_vTrRail2HTML`  `_vTrRailBind`  `_vTrRailHTML`  `_vTrRowHTML`  `_vTrRowsOf`
`_vTrScopeKeys`  `_vTrSort`  `_vTrSortRows`  `_vTrSpan`  `_vTrSpanMode`  `_vTrSpanRowHTML`
`_vTrTheadHTML`  `_vTrUnitWord`  `_vWeeksSince`  `_vwKeepSortHTML`  `_vwScopeBindHold`  `_vwScopeOpts`
`_vwSize`  `_wireContactTaskBadge`  `_wireSecPickRows`  `_wireSubDrag`  `_wireSubHandle`  `_wireTaskMenuDateRow`
`_wireTmSub`  `_withFullscreenLayout`  `_withOutcome`  `_withSecRo`  `_withTimeout`  `_wkFixH`
`_wkPaneActive`  `_wkVerseMarksHTML`  `_wkWideSide`  `_wmEvClick`  `_wmFsApply`  `_wmFsHTML`
`_wmFsVal`  `A`  `a`  `ab`  `act`  `activateItem`
`ACTIVE_TOTAL`  `ACTIVE_VERSES`  `ACTIVE_VERSES_ALL`  `add`  `addCustomSuffix`  `addCustomVerseFromForm`
`addDays`  `addNewCollection`  `addNewSection`  `addRow`  `addVerseAlarmCustomTime`  `ALL_VERSES`
`anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`  `applyRemoteState`  `applyScale`
`applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`  `applyUiScale`
`applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `applyView`  `arr`  `arrOf`
`assigned`  `at`  `attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`
`attachHdSwipe`  `attachPullToToday`  `attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authForgot`
`authSetLoading`  `authSignOut`  `authSubmit`  `authToggleMode`  `auto`  `autoSizeInput`
`away`  `axisName`  `B`  `b`  `back`  `bad`
`barRef`  `barTags`  `base`  `bat`  `beforeBlock`  `beforeSave`
`beginMouseDrag`  `bibleClose`  `bibleOpen`  `bibleOpenLast`  `bibleOpenRef`  `bibleStartPreload`
`bibleToReadMenu`  `bigNum`  `bindHold`  `bkKey`  `board`  `body`
`bodyEl`  `book`  `bottom`  `bub`  `build`  `buildBackupFilename`
`buildFlatList`  `buildLanes`  `bump`  `bw`  `byName`  `byNear`
`bySlot`  `bySrc`  `C`  `c`  `cal`  `cancel`
`cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `card`  `carry`  `ceAddGoogleLink`
`ceCloseDeletePopup`  `ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`
`ceOpenDeletePopup`  `ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`
`ceToggleFilter`  `ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `cfToggleRaw`
`chap`  `check`  `checkDataRecovery`  `checkVerseAlarm`  `chip`  `chM`
`cl`  `clamp`  `clause`  `clean`  `cleanupEmptyDays`  `clear`
`clearActive`  `clearContactForm`  `clearDropIndicators`  `clearLp`  `clearPaint`  `clearTrash`
`close`  `closeAccountSensitiveModals`  `closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`
`closeContactMenu`  `closeContactsModal`  `closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`
`closeGroupDialog`  `closeHdrCalendar`  `closeInlineInput`  `closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`
`closeLogoMenu`  `closeMemoActMenu`  `closeMemorizationHistory`  `closeMemRecPopup`  `closePlusList`  `closeRepeatSubPicker`
`closeRepScope`  `closeRpConfig`  `closeSearch`  `closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`
`closeSfxMenu`  `closeShareDialog`  `closeSmGhost`  `closeSubRowMenu`  `closeSubscribeDialog`  `closeSwKbHelp`
`closeSyncConflicts`  `closeSyncResultModal`  `closeTaskMemo`  `closeTaskMenu`  `closeTaskMenu_keepCtx`  `closeThemePicker`
`closeThere`  `closeTrash`  `closeVcSettings`  `closeVDashDetail`  `closeVerseAggPopup`  `closeVerseAlarmCustomTimePopup`
`closeVerseDashboard`  `closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`  `closeVerseMemMenu`  `closeVerseMemMenuFromOverlay`
`closeVersePopup`  `closeVerseSettingsModal`  `closeVfDeeperPicker`  `closeVfKeepSwitch`  `closeVfShare`  `closeVliMenu`
`closeVliMenuFromOverlay`  `closeVPair`  `closeVwScope`  `cmpLine`  `cnt`  `code`
`col`  `collAddAction`  `collect`  `collMenuAction`  `color`  `colX`
`commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`  `contactAction`  `contactBadgeCountChanged`  `copy`
`core`  `cross`  `ctl`  `cur`  `currentMatchingPresetName`  `currentViewKey`
`curSecId`  `cx`  `damp`  `day`  `dayAsc`  `dayFlow`
`dayOfYearVerseIdx`  `days`  `daysFromToday`  `dayTotals`  `decide`  `deeperN`
`defaultState`  `defIds`  `deleteCollection`  `deleteEventFromMenu`  `deleteEventFromModal`  `deleteLatestVerseEvent`
`deleteSection`  `deleteSectionConfig`  `deleteTaskMemo`  `dev`  `devInboxDelete`  `devInboxLoad`
`devInboxRefreshBadge`  `devInboxToggleAll`  `devInboxUpdateBadge`  `devNoteHandleFile`  `devNoteSend`  `devNoteToggle`
`devTrashDelete`  `devTrashEmpty`  `devTrashRender`  `devTrashToggle`  `dir`  `disarm`
`done`  `doRedo`  `doSaveGroup`  `doSubscribe`  `doUndo`  `dow`
`download`  `draw`  `dropDrag`  `dropSecArchive`  `dropTarget`  `dsh`
`dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`  `dur`  `editContact`  `editEventFromMenu`
`edRow`  `el`  `em`  `email`  `emailTag`  `end`
`endDrag`  `endPinch`  `endRow`  `enough`  `ensureDailyRepeats`  `ensureRepeatsForView`
`esc`  `evChipMaxCommit`  `evChipMaxInput`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`
`exportBackup`  `f`  `facet`  `fam`  `fbForceUploadLocal`  `fbPushState`
`fbStartListening`  `fill`  `findColl`  `findFlatIndex`  `findLaneIndex`  `findMentionedContacts`
`finish`  `fire`  `first`  `fit`  `fitPill`  `flush`
`focusItemInput`  `focusPrayers`  `fold`  `form`  `formatEventTime`  `free`
`from`  `gcalAddDays`  `gcalB7IdFor`  `gcalBody`  `gcalCollect`  `gcalConnect`
`gcalDateOf`  `gcalDayDiff`  `gcalDisconnect`  `gcalExModified`  `gcalFromG`  `gcalGidFor`
`gcalGKey`  `gcalHash`  `gcalHashEv`  `gcalInstDate`  `gcalInstMaster`  `gcalKeyOf`
`gcalPad`  `gcalParseRecur`  `gcalPatchBody`  `gcalPlan`  `gcalRecur`  `gcalRf`
`gcalRuleHits`  `gcalSeriesBody`  `gcalSetColor`  `gcalSetWrite`  `gcalStamp`  `gcalSync`
`gcalToG`  `gcalToggleCal`  `gcalToggleList`  `gcalWindow`  `gcalYmd`  `getActiveColls`
`getBibleInk`  `getBibleMarks`  `getBibleNotes`  `getBibleOrig`  `getBibleReadLog`  `getBibleToRead`
`getBigs`  `getCarryCount`  `getChips`  `getContainer`  `getCustomVerses`  `getDay`
`getDayFadeClass`  `getDeeperLog`  `getDisplayEvents`  `getDisplayTasks`  `getDOW`  `getDropTarget`
`getEvenDeeperLog`  `getEvents`  `getKeepLog`  `getLikeLog`  `getMemLog`  `getMemorizationsForDate`
`getMemorizationsForSection`  `getRowEl`  `getSecColor`  `getShareLog`  `getSmalls`  `getStableDt`
`getTasksTaggedWithContact`  `getThereLog`  `getTrack`  `getTrash`  `getVerseAlarm`  `getVerseByIdx`
`getVerseCollections`  `getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`  `getWraps`  `gid`
`gname`  `go`  `goToDate`  `grid`  `group`  `H`
`h`  `hdrCalGoToday`  `hdrCalNav`  `hdrCalPick`  `heal`  `heat`
`hh`  `hi`  `hideBusyToast`  `hit`  `hmBtn`  `home`
`html`  `hueIndex`  `hueOf`  `importBackup`  `importFromFile`  `initAppUI`
`initCrossViewSwipe`  `initDateSwipe`  `initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`
`injectCSS`  `inkDisarm`  `inkMove`  `inkStart`  `inner0`  `inRange`
`inspectRecoveryDate`  `instIdOf`  `IS_TOUCH`  `isAnyInputFocused`  `isCollActive`  `isDark`
`isExcluded`  `isNowWithinSection`  `isOpen`  `isOver`  `isSwipeZone`  `isToday`
`isTouch`  `item`  `itemKey`  `itemName`  `items`  `j`
`jong`  `K`  `k`  `keep`  `keepPickNew`  `keepPickToggle`
`keepRowDelete`  `keepRowEdit`  `keepSetSort`  `keepTogglePairSort`  `key`  `keys`
`kindWord`  `L`  `l`  `l0`  `label`  `lane`
`laterLocal`  `lay`  `laySetBp`  `lb`  `left`  `legend`
`likeN`  `limit`  `line`  `links`  `list`  `lo`
`load`  `logicalNow`  `logoMenuBackToMain`  `logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`
`logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`  `loop`  `loose`  `LS_KEY`
`m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`  `makeContactBadges`  `makePresetChip`
`makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSubPanel`  `makeSubToggleBadge`  `makeSwipeWrap`
`manuallyCollapsed`  `map`  `mapPrayers`  `mapTop`  `mark`  `markOf`
`mastOf`  `materializeRepeatsFor`  `md`  `me`  `measure`  `memoActRun`
`mergeDuplicateVerses`  `mergeFlow`  `mid`  `mine`  `minH`  `mix`
`mk`  `mkBtn`  `mkDate`  `mode`  `month`  `monthLabel`
`monthTitleHTML`  `more`  `mount`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`
`moved`  `moveDrag`  `moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`
`mvEl`  `N`  `n`  `n0`  `name`  `nameTx`
`nav`  `navigateDate`  `navigateWeek`  `near`  `needTemp`  `next`
`nextAfterDonePicked`  `nextAfterDoneTo`  `nextAfterDoneYday`  `nextAfterDoneYdayPicked`  `nextAfterDoneYesterday`  `nextVerseManual`
`note`  `now`  `nRow`  `o`  `offTest`  `ok`
`on`  `onCancel`  `onDown`  `one`  `onEnd`  `onEventDateChange`
`onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`  `onStart`  `onTouchEnd`  `onTouchMove`
`onTouchStart`  `onUp`  `onVerseAlarmToggle`  `onVerseBarClick`  `onVerseMemRecord`  `open`
`openAccountSettings`  `openCellInput`  `openCollAddMenu`  `openCollEdit`  `openCollMenu`  `openContactMenu`
`openContactsModal`  `openContactsModalWith`  `openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`
`openEventModalForDate`  `openGroupDialog`  `openHdrCalendar`  `openInlineInput`  `openKeepListPopup`  `openKeepPicker`
`openKeepRowMenu`  `openLogoMenu`  `openMemoActMenu`  `openMemoFromMenu`  `openMemorizationHistory`  `openMenuForThis`
`openPlusList`  `openRepeatSubPicker`  `openRpConfig`  `openSearch`  `openSettings`  `openSfxMenu`
`openShareDialog`  `openSmGhost`  `openSubRowMenu`  `openSubscribeDialog`  `openSubsFromMenu`  `openSwKbHelp`
`openSyncConflicts`  `openTaskMemo`  `openTaskMenu`  `openThemePicker`  `openThere`  `openThereDash`
`openThereFromVf`  `openThereTune`  `openTrash`  `openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`
`openVerseAlarmCustomTimePopup`  `openVerseCollFromListMenu`  `openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`  `openVerseGrid`
`openVerseGridHome`  `openVerseListModal`  `openVerseMemMenu`  `openVerseSettingsFromLogo`  `openVerseSettingsFromMenu`  `openVerseSettingsModal`
`openVfDeeper`  `openVfShare`  `openVfShareFor`  `openVliMenu`  `openVPair`  `openVwScope`
`opts`  `order`  `org`  `out`  `outEls`  `overflows`
`own`  `p`  `pad`  `padH`  `padV`  `pages`
`pageTint`  `paint`  `paintAppUIFromLocal`  `paintRows`  `pairKey`  `pairOn`
`pane`  `paneHTML`  `parseItemKey`  `pass`  `pcEl`  `pct`
`pd`  `pend`  `perBtn`  `ph`  `phone`  `pick`
`pickContainer`  `pickFromDeviceContacts`  `pickVfDeeper`  `place`  `placeM`  `plusClearAll`
`plusRemoveCat`  `plusRemoveKeys`  `plusRemoveTopic`  `pool`  `populateCarryBadge`  `portrait`
`prepDatePicker`  `prepDupDatePicker`  `prepNextDatePicker`  `prepNextYDatePicker`  `prepTaskMenuDatePicker`  `prev`
`prevOff`  `prevVerseManual`  `prop`  `push`  `put`  `putOverride`
`putText`  `q`  `R`  `r`  `randomVerseManual`  `rankHTML`
`raw`  `rawSave`  `rc`  `recent`  `recheck`  `recheckBurst`
`recordMemorization`  `recordMemorizationByRef`  `recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`
`redraw`  `ref`  `refH`  `refLine`  `refOnly`  `refreshActiveVisuals`
`refreshNotifyUI`  `refreshTaskViewsLive`  `refreshVerseMarksLive`  `refs`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`
`renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`  `renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`
`renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`  `renderLayout`  `renderMonthly`  `renderPlusList`
`renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`  `renderSecBody`  `renderSecEvents`
`renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`  `renderSmList`  `renderSubButtons`
`renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`  `renderVcSettings`  `renderVDashLink`
`renderVDashMap`  `renderVDashPie`  `renderVDashRhythm`  `renderVDashThere`  `renderVDashTrend`  `renderVerseAlarmCustomList`
`renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`  `renderVerseListCatRow`  `renderVerseListPies`
`renderVerseListResults`  `renderVerseSettingsModal`  `renderVgCfg`  `renderVgPick`  `renderVPair`  `renderVwScope`
`renderWeekly`  `repeat`  `resetStateToDefaults`  `resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`
`restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`  `rmBtn`  `roll`  `root`
`rot`  `row`  `rows`  `rowsOf`  `rpChMonth`  `rpFoldCycle`
`rpMonthWideMenu`  `rpSetFold`  `rpSetMonthWide`  `rpSetWeeklyWide`  `rpSwapWM`  `rpWeeklyWideMenu`
`rs`  `run`  `runAutoCarryOver`  `runCarryNow`  `runGroupSync`  `runSharedCollSync`
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
`snapshot`  `solve`  `soon`  `sortBtn`  `sortEventsByTime`  `span`
`springTo`  `src`  `srcName`  `start`  `startDrag`  `startEditContact`
`stepHiOverlap`  `stepHiStarMax`  `stickOf`  `stopLt`  `stops`  `stopTimer`
`strip`  `style`  `submitContact`  `submitEventModal`  `sum`  `sumBy`
`sw`  `swCrossToggle`  `swImportFromBlock7`  `switchSettingsTab`  `switchToViewIndex`  `switchVerseSettingsTab`
`swKeepSet`  `swOff`  `swOpenCollFilter`  `swRow`  `swTitle`  `swToggleEdit`
`swToggleKeep`  `syncIncludeNow`  `syncIncludeOpenFull`  `syncIncludeUndo`  `syncP`  `syncRollDisplays`
`syncSecsFromState`  `syncVis`  `t`  `tab`  `tags`  `taskMarkerFilterPass`
`TDASH`  `testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`  `text`  `themeById`
`themeChip`  `themeNo`  `themePickerApply`  `themePickerGroup`  `themePickerPick`  `thereTuneClock`
`thereTuneFold`  `thereTuneReset`  `thereWordReset`  `thereWordSw`  `tick`  `tilt`
`tKey`  `to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`
`toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`
`togglePropTitleGroupOpen`  `togglePropTitleMotion`  `toggleSectionExclude`  `toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`
`toggleTaskMemoEdit`  `toggleTaskUrgent`  `toggleTxtIncl`  `toggleUrgentRank`  `toggleVerseAlarmContent`  `toggleVerseBarOn`
`toggleVfArt`  `toggleVfKeepSwitch`  `toggleVfPattern`  `toggleVfSecPattern`  `toggleWeeklyRepeat`  `toGraph`
`top`  `topic`  `topRefs`  `total`  `totalActive`  `totalBigCount`
`totalChg`  `TOUCH`  `touch`  `trashBgClick`  `travel`  `txt`
`u`  `u8`  `uiLevel`  `uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`
`uiScaleSlideInput`  `unit`  `until`  `unwatch`  `up`  `updateHeaderDate`
`updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`  `updateSmCnt`
`updateTotal`  `updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`  `v`
`vbShuffleVerse`  `vcAct`  `vcAddCard`  `vcClearFilter`  `vcNav`  `vcOpenFilter`
`vcOpenFull`  `vcRollSecInput`  `vcSetTextScaleLive`  `vcSetView`  `vcStepTextScale`  `vcToggleView`
`vDashKindPick`  `vDashLinkRelayout`  `vDashMapPick`  `vDashOpenCollSettings`  `vDashOpenDetail`  `vDashOpenFilter`
`vDashOpenVerse`  `vDashSetCustom`  `vDashSetSlices`  `vDashSetSpanMode`  `vDashSetView`  `vDashSubToggle`
`vDashToggleEtc`  `verb`  `VERSE_TOTAL`  `verseByRef`  `verseForEntry`  `verseFullNav`
`verses`  `verseSyncAllNow`  `verseUiLevel`  `vfAct`  `vfCatTap`  `vfCopyBodyOnly`
`vfHomeAction`  `vfOpenCollSettings`  `vfOpenDashboard`  `vfOpenKeepGrid`  `vfOpenKeepList`  `vfOpenNavTile`
`vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgCfgReset`  `vgCfgSet`
`vgClearSel`  `vgCycleTab`  `vgDepthSet`  `vgPick`  `vgPickAxis`  `vgRankSet`
`vgSearch`  `vgSetBibleSort`  `vgSetSelOnly`  `vgSetTab`  `vgShowHelp`  `vgStepTagExcl`
`vgStepTileExcl`  `vgTapDateSort`  `vgToggle`  `vgToggleExpand`  `vgToggleGroup`  `vgToggleSel`
`vgToggleTagExcl`  `vgToggleTileExcl`  `viewDay`  `viewMonth`  `viewWeek`  `vis`
`vliAction`  `vlSetCustom`  `vlSetPeriod`  `vlSetSort`  `vlSetTab`  `vlToggleCtrl`
`vlTogglePairSort`  `vlwSetCustom`  `vlwSetPeriod`  `vlwSetSort`  `vlwTogglePairSort`  `vMapOpenChapter`
`vMapOpenGrid`  `vMapRangeSet`  `vMapToggleFold`  `vpAddTime`  `vpCycleFullTab`  `vpDelTime`
`vpDiagClear`  `vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`  `vpFull`  `vpGoToFilteredTile`
`vpOpenVerse`  `vpSetTime`  `vpTile`  `vpToggleDay`  `vpToggleFilt`  `vrs`
`vsetGoDashboard`  `vTrCloseBook`  `vTrInsSet`  `vTrOpenBook`  `vTrSet`  `vTrSortBy`
`vTrSpanSet`  `vTrToggleExp`  `vTrToggleSeries`  `vw`  `vwScopeClearFilter`  `vwScopeCollSettings`
`vwScopePick`  `vwScopeToggleMode`  `W`  `w`  `want`  `wasOpen`
`weekOffsetLabel`  `weekOfMonth`  `weeks`  `weeksFromToday`  `who`  `widest`
`wireActivateClick`  `wmEvEdit`  `wmFs`  `wordPray`  `words`  `wpLegend`
`x`  `y`  `z`

