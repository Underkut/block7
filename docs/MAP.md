# index.html 구역 지도

> ⚠️ **이 문서는 `./tools/make-map.sh` 가 만듭니다. 손으로 고치지 마세요.**
> index.html 을 고쳤으면 다시 돌려서 함께 커밋합니다.

기준 버전 **v. 26-0907-1** · 전체 35,561줄 · 구역 314개 · 함수 1852개

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
| 410~4,339 | 3,930줄 (11%) | CSS | 화면 꾸미기 (색·크기·배치) |
| 4,340~4,570 | 231줄 (1%) | JS | 동작 (자바스크립트) |
| 4,588~6,826 | 2,239줄 (6%) | HTML | 화면 뼈대 (버튼·팝업의 HTML) |
| 6,827~35,558 | 28,732줄 (81%) | JS | 동작 (자바스크립트) |

---

## 2. 꾸미기(CSS) 구역

색·크기·배치를 고칠 때 여기서 찾습니다.

| 대략 줄 | 구역 (grep 키워드) |
|---|---|
| 454 | 색상 테마 토큰의 기본값 (테마를 안 고른 상태 = 지금까지의 BLOCK7 색) |
| 527 | 전체화면·타일뷰가 떠 있는 동안엔 **뒤 배경도 같은 색으로** 칠한다 |
| 560 | HEADER |
| 565 | GNB 위쪽 여백 (v26-0903-6, HB 스크린샷) |
| 600 | Verse bar (네비게이토 180) |
| 601 | Verse bar outer wrapper |
| 602 | 말씀 전체 화면 (릴스형) |
| 619 | 태그 그림 (v26-0825-3, 자리는 v26-0826-3에 바뀜) |
| 759 | 저장소에 직접 올린 글씨체 (v26-0901-9, HB 가 눈누에서 받아 줌) |
| 772 | 글씨체 스물두 벌 더 (v26-0902-8, HB 가 눈누에서 받아 줌) |
| 793 | 설정창 단추 미리보기용 초소형 글꼴 (v26-0902-8) |
| 876 | 누를 수 있는 자리를 손끝만큼 넓힌다 (v26-0904-4, HB — "저장 버튼이 종종 |
| 1,003 | 순환·셔플 전환 (v26-0817-16, HB 3) |
| 1,125 | 말씀 타일 그리드 (필터 → 인스타형 타일뷰) |
| 1,168 | '제외' 글자 버튼 + 스테퍼 (v26-0817-13, HB 14-2) |
| 1,400 | 스닉픽 한 줄 |
| 1,554 | DATE NAV |
| 1,572 | GNB 날짜 (#hDate) |
| 1,595 | DATE SWIPE OVERLAY |
| 1,597 | MINI MOVE MENU |
| 1,616 | DATE PICKER OVERLAY |
| 1,712 | TIME SECTION |
| 1,743 | Event chips (shown inline in the section header, next to the |
| 1,869 | BLOCK SWIPE WRAPPER |
| 1,892 | BIG BLOCK (E method: colored left bar, no indent) |
| 2,004 | SMALL BLOCK (E method: 1px left bar, indented, smaller text) |
| 2,082 | @닉네임 텍스트 스타일 (할일 텍스트 내) |
| 2,087 | 연락처 관리 모달 |
| 2,113 | @닉네임 태그 할일 모아보기 |
| 2,164 | 헤더 슬라이드 입력창 (B안) |
| 2,190 | 헤더 + 버튼 (할일 추가) |
| 2,209 | ▲ 숨기기 버튼 |
| 2,241 | TRASH PANEL |
| 2,287 | DATE NAV |
| 2,340 | TASK MOVE MINI MENU |
| 2,410 | 받은 쪽지: 미확인 뱃지 · 접기 · 스와이프 삭제 |
| 2,435 | Event add modal |
| 2,574 | WEEKLY/MONTHLY |
| 2,669 | D뷰 좌우 분할 (넓은 화면) |
| 2,680 | 공통: 경계선(14px + 1px + 14px), 위젯 컬럼(sticky+자체 스크롤) |
| 2,703 | 2단: flex — 좌(할일) \| 경계선2 \| 우(위젯 병합) |
| 2,710 | 3단: grid — 주간뷰가 두 컬럼을 가로지를 수 있도록 |
| 3,141 | LOGIN / AUTH SCREEN |
| 3,217 | SETTINGS PANEL |
| 3,258 | 설정 등급(이지·미드·파워) 고르기 |
| 3,281 | 선 그림만으로 고른 것을 나타내는 자리 |
| 3,419 | 강조 표시 고르는 줄 (v26-0812-15) |
| 3,439 | 공유 이미지 설정 — 미리보기를 가운데 두고 네 귀퉁이에 버튼 (v26-0812-15) |
| 3,599 | 시간 구간 경계선 |
| 3,654 | 말씀 대시보드 |
| 3,698 | 대시보드 위쪽 전환 (분포 ⇄ 흐름) |
| 3,702 | 흐름(추이) |
| 3,730 | 손으로 만든 슬라이더 (v26-0906-2, HB 5-1) |
| 3,801 | 작은 발견 (v26-0906-5, HB 2) |
| 3,827 | 성경 지도 (v26-0906-5, HB 1) |
| 3,852 | 연결 (주제 ↔ 성경) (v26-0906-5, HB 1-4) |
| 3,855 | 주간 리듬 (잔디) |
| 3,942 | 색상 테마: 뷰 탭 요약 줄 |
| 3,959 | 색상 테마 선택 화면 |
| 4,052 | 미리보기 목업 |
| 4,288 | 편집 모드 |
| 4,321 | 값 넘기기: 설정창 탭과 **같은 방식**이다 (v26-0830-7) |

---

## 4. 동작(JS) 구역

기능을 고칠 때 여기서 찾습니다. 오른쪽 칸의 함수 이름으로 grep 하면 가장 정확합니다.

| 대략 줄 | 구역 (grep 키워드) | 이 구역의 함수 |
|---|---|---|
| 153 | 색 계산 도구 | `_thRgb`, `_thHex`, `_thMix`, `_thLin`, `_thLum`, `_thContrast`, `_thRound`, `_thWorst`, `_thFade`, `_thOn`, `_thRgba` |
| 187 | 선택·활성 표시의 세기 (--ac-tint-k) | `_thLabF`, `_thLab`, `_thDeltaE`, `_thTintDE`, `_thLabFi`, `_thUnlin`, `_thLabRgb`, `y` |
| 226 | 글자용 강조색 (--ac-tx) | `_thReadable`, `dir`, `_thAcText`, `_thAcPush`, `away`, `_thPanelMix`, `_thTintK`, `_themeTokens`, `p`, `isDark`, `applyThemeVars` |
| 391 | 조기 적용 (첫 페인트 전) | – |
| 4,520 | 이 기기에서 알림 받기 (기기별 스위치) | `_devNotifOn`, `_devNotifSet`, `_psIsDefault`, `_psOverlay`, `mine`, `_psProject`, `src`, `getDOW`, `monthLabel`, `monthTitleHTML` |
| 6,866 | 네비게이토 180 암송성구 데이터 | – |
| 6,893 | Color presets | – |
| 6,911 | 네비게이토 180 verse bar | – |
| 6,912 | 커스텀 구절 통합 계층 | `getCustomVerses` |
| 6,928 | 말씀 모음(컬렉션) 헬퍼 | `getVerseCollections`, `getActiveColls`, `isCollActive`, `findColl`, `_genCollId`, `ALL_VERSES`, `VERSE_TOTAL` |
| 6,968 | 모음별 하위 필터 (전체/대분류별/소주제별/성경별, 복수선택) | `_getCollFilter`, `_collRawVerses` |
| 6,983 | 성경책 이름 하나로 모으기 | `_bookCanon`, `_bookAbbr`, `_booksOf`, `_bookNorm`, `_bookOfRef`, `_bookSel`, `_bibleRankOfRef`, `m`, `_groupVersesBy`, `_sortGroups`, `_groupVersesByMulti` |
| 7,104 | 필터 적용 방식: 네 카테고리(대분류/소주제/태그/성경)의 "교집합" | `_collVersePassesFilter`, `_collPeriodPass`, `_collFilteredVerses`, `_collPeriodVerses`, `_cfHasSel`, `_cfClearSel` |
| 7,171 | 현재 켜진 말씀 모음의 구절 집합 (말씀바·전체목록·선택이 따라감) | `ACTIVE_VERSES`, `ACTIVE_TOTAL` |
| 7,209 | 커스텀 구절 관리 (설정 → 암송 말씀) | `_invalidateVerseCaches` |
| 7,215 | 말씀 모음 버튼 줄 렌더링 + 켜기/끄기 | `_collIsProp`, `renderCollButtons`, `mkBtn`, `renderSubButtons` |
| 7,303 | 켜진 각 모음의 하위 필터 패널 (전체/대분류별/소주제별/성경별) | `_collLabel`, `_updateCfAllCount`, `renderCollFilterPanels`, `_buildCollFilterPanel`, `mkDate`, `syncP`, `_renderPickerInto`, `_cfSortKey`, `_cfSelKey`, `_buildGroupPicker`, `_renderGroupList`, `_buildBookPicker`, `_renderBookList`, `openCollAddMenu` … 외 2개 |
| 7,621 | 구독 받기 (상위 레벨) | `openSubscribeDialog`, `closeSubscribeDialog`, `doSubscribe`, `code`, `verses`, `toggleColl`, `_syncVersePushPool`, `_afterActiveVersesChanged`, `addNewCollection`, `name` |
| 7,734 | 롱터치 액션 메뉴 ([수정][공유][삭제]) | `openCollMenu`, `closeCollMenu`, `collMenuAction`, `deleteCollection`, `n` |
| 7,785 | 수정 페이지 | `_currentColl`, `openCollEdit`, `closeCollEdit`, `renameCurrentColl`, `name`, `_ceFillSelects`, `ceSelectMethod` |
| 7,859 | 수정 페이지 목록 상태 | `ceSetSort`, `ceToggleFilter`, `_refKey`, `m`, `_ceSortedIdx`, `K`, `_ceMakeRow`, `renderCeVerseList`, `totalActive`, `_ceUpdateDeleteBtn`, `_ceUpdateTrashBadge`, `n`, `ceOpenDeletePopup`, `ceCloseDeletePopup` … 외 1개 |
| 7,977 | 휴지통 뷰 | `ceOpenTrash`, `ceCloseTrash`, `_ceVerseSide`, `renderCeTrash`, `_ceToggleTrashSel`, `_ceUpdateRestoreBtn`, `ceRestoreSelected`, `ceMoveTrash` |
| 8,059 | 현재 수정 중인 모음에 구절 추가 | `_addVersesToColl`, `_addVersesToCurrentColl`, `_verseIdentity`, `_gSrcId`, `_syncSheetVersesIntoColl`, `gid` |
| 8,202 | 시트에서 사라진 구절 정리 | `addCustomVerseFromForm`, `chap`, `vrs`, `text`, `topic`, `_parseCsv`, `_parseVDate`, `_looksLikeRef`, `_sheetRowsSane`, `_isPropSheet`, `_propRefs`, `_propBooks`, `_propRowsToItems`, `col` … 외 6개 |
| 8,600 | 구글 시트 다중 링크 (현재 수정 중인 모음) | `renderCeGoogleList`, `ceAddGoogleLink`, `url`, `name`, `ceRemoveGoogleLink`, `ceToggleGoogleAuto`, `ceImportGoogleLink` |
| 8,703 | 수동 전체 업데이트 (로고 롱터치/우클릭) | `verseSyncAllNow` |
| 8,776 | 하루 시작 시간 자동 동기화 | `runVerseSheetAutoSync` |
| 8,815 | 공유 (Firestore shared/{code}) | `_fbReady`, `_generateUniqueShareCode`, `_sharedVerseOut`, `_sharedVerseIn`, `_publishSharedColl`, `openShareDialog`, `closeShareDialog`, `_shareMessage`, `shareCopyCode`, `done`, `_fallbackCopy`, `shareVia`, `_fmtSubDate`, `runSharedCollSync` … 외 4개 |
| 9,047 | 자동으로 다음 구절 | `_fillVerseBarDOM`, `barTags`, `barRef`, `_menuArmOnNextPress`, `on`, `closeVerseMemMenuFromOverlay`, `_vmmSyncFirstItem`, `openVerseMemMenu`, `closeVerseMemMenu`, `onVerseMemRecord` |
| 9,297 | Verse bar interaction | `_verseBarSlideNav`, `_initVerseBarSwipe`, `_verseBarModeFlip`, `onVerseBarClick`, `setVerseIdx`, `nextVerseManual`, `prevVerseManual`, `randomVerseManual`, `toggleVerseBarOn`, `openVerseSettingsModal`, `closeVerseSettingsModal`, `_verseSettingsOpen`, `_escShown`, `_vstabList` … 외 7개 |
| 9,828 | 인앱 말씀 팝업 | – |
| 9,832 | 말씀 푸시 알림 설정 | `_vpEveryLabel`, `getVersePush`, `_vpSave` |
| 9,860 | 말씀 알림 스위치 | `_vpTurnOn`, `setVersePush`, `setVersePushInterval`, `vpToggleDay`, `vpAddTime`, `vpSetTime`, `vpDelTime`, `_syncVersePushUI` |
| 9,949 | 정해진 시각 목록 (v26-0817-15, HB 2) | `_syncVpTimeList`, `_syncVpTimeField`, `_vpToMin`, `getVerseAlarm`, `renderVerseAlarmSettings`, `renderVerseAlarmCustomList`, `openVerseAlarmCustomTimePopup`, `_initVerseAlarmPicker`, `closeVerseAlarmCustomTimePopup`, `addVerseAlarmCustomTime`, `removeVerseAlarmCustomTime`, `onVerseAlarmToggle`, `toggleVerseAlarmContent`, `_bibleChapters` … 외 1개 |
| 10,170 | Alarm scheduler | `getVersePoolVerses`, `scheduleVerseAlarms` |
| 10,181 | 말씀 인앱 팝업 기능은 v0731-1 에서 없앴다 | `checkVerseAlarm`, `showVersePopup`, `closeVersePopup` |
| 10,246 | 암송 관리 | `getMemLog` |
| 10,253 | ref 기반 헬퍼 | `verseByRef`, `verseForEntry`, `_nowHM` |
| 10,276 | 좋아요 로그 (누적 이벤트형) | `getLikeLog`, `_calKey`, `recordVerseLike` |
| 10,299 | 공유 로그 (누적 이벤트형) — ST.verseShareLog = {"YYYY-MM-DD":[{ref,time}]} | `getShareLog`, `recordVerseShare` |
| 10,310 | Deeper 로그 (누적 이벤트형, 열람할 때마다) | `getDeeperLog`, `recordVerseDeeper`, `openDeeperFromRef` |
| 10,330 | Even Deeper 로그 (Deeper와 동일한 누적 이벤트형) | `getEvenDeeperLog`, `recordVerseEvenDeeper`, `_evenDeeperShortRef`, `book`, `openEvenDeeperFromRef`, `go`, `_currentSecId`, `recordMemorizationByRef`, `recordMemorization`, `_wkVerseMarksHTML`, `_mviewRowHTML`, `_mviewEventCountsHTML`, `likeN`, `deeperN` … 외 3개 |
| 10,498 | BibleLinkProvider | `showMemorizationPopup`, `closeMemRecPopup`, `_dismissToast` |
| 10,690 | 진행 중 토스트 (v26-0901-3, HB) | `showBusyToast`, `hideBusyToast`, `showToast`, `act`, `body` |
| 10,784 | 아이콘 전용 토스트 (말씀 반응: 좋아요·암송) | `_dismissReactToast`, `showReactionToast`, `_reactWithToast`, `openMemorizationHistory`, `closeMemorizationHistory`, `_renderMemHistoryDash`, `_renderMemHistoryList`, `logoMenuToggleVerse`, `logoMenuNextVerse`, `logoMenuPrevVerse`, `openVerseFull` |
| 11,019 | 전체화면이 덮은 화면들 (닫을 때 복원) | `_vfHideCoversNow`, `_vfHideCovers`, `closeVerseFull`, `_vfSyncPageBg`, `_verseFullIsOpen` |
| 11,102 | 본문 줄바꿈 + 글자 크기 자동 맞춤 | – |
| 11,110 | 한국어 맥락 줄바꿈 (전체화면·타일뷰·공유카드 공용) | `_vfIsHeotdoeException`, `_vfPairKeep`, `_vfGeException`, `_vfIsSubject`, `_vfAdvStart`, `_vfApplyAdvRule`, `_vfClauseStart`, `_vfApplyClauseRule`, `_vfObjTailLen`, `_vfObjStart`, `_vfApplyObjRule`, `_vfIsParallelWord`, `_vfParallelRuns`, `_vfApplyParallelRule` … 외 21개 |
| 11,729 | 겹쳐쓰기 (v26-0812-15, 옛 '섞어서 쓰기'를 대신한다) | `_hiOverlap`, `_hiHash`, `_hiShuffle`, `_hiPickAt` |
| 11,767 | 한 본문에 별을 몇 개까지 (v26-0812-16) | `_hiStarMax`, `_hiAssign`, `_hiRng`, `s`, `_hiSmooth`, `_hiRibbon`, `_hiWob`, `_hiWavePoly`, `tilt`, `_hiStarPoly`, `rot`, `_hiHTML`, `_hiOverlay`, `put` … 외 8개 |
| 12,104 | 명제 본문 앉히기 + HB 줄바꿈 규칙 (v26-0901-6) | `_vfLayoutPropText`, `fit`, `_vfApplyPropAlign`, `_vfReadWrappedLines`, `raw`, `_vfRedrawPropInk` |
| 12,204 | 구독자 전체 집계 카운터 (verseStats/{ref}) | `_statRefKey` |
| 12,210 | 명제의 '구독자 전체' 집계 칸 이름 (v26-0831-7, HB) | `_statDocKey`, `_bumpVerseStat`, `bump`, `_fetchVerseStat` |
| 12,258 | 스닉픽 한 줄 최대 가로 폭 (px) | `_sneakMaxWDefault`, `_sneakMaxW`, `_applySneakMaxW`, `_initSneakMaxWPicker`, `setVerseSneakMaxW`, `_syncLinkOpenModeUI`, `setLinkOpenMode`, `setVerseCountScope`, `_isReactPid`, `_reactKey`, `_reactKeyParts`, `_verseEventCount`, `_vfSyncCounts`, `setCnt` … 외 1개 |
| 12,407 | 명제에서는 안 쓰는 단추를 감춘다 (v26-0903-10) | – |
| 12,443 | 말씀 공유 (우하단 종이비행기 → 이미지 / 텍스트) | `_vfShareSizeRow`, `openVfShareFor`, `openVfShare`, `closeVfShare`, `vfShareBg`, `vfShareDo`, `_dataURLtoBlob`, `_cardActionCount`, `_cardTextLS`, `cx`, `_noiseTile`, `_cardGrain` |
| 12,556 | 공유 이미지 = 전체화면을 "그대로" 옮겨 그리기 | `_shotFont`, `_withFullscreenLayout`, `wasOpen`, `_vfRenderCard`, `needTemp`, `draw`, `_shotDraw`, `SC` |
| 12,659 | 명제 대표 문구 타이틀 (v26-0901-3, HB 신고 — "공유 이미지에 대표 문구가 | – |
| 12,922 | 공유 이미지 고정 크기 | `_shareSizeKey`, `shareSizeOf`, `setShareSize`, `_syncShareSizeUI`, `_refDigitsPad`, `pad`, `vw`, `_shareFileName`, `ref`, `safe`, `_vfShareImage`, `isTouch`, `download`, `copy` … 외 6개 |
| 13,064 | 전체화면 롱터치 메뉴의 '본문 복사' (v26-0818-1, HB 4) | `vfCopyBodyOnly`, `body` |
| 13,079 | 공유 설정 (말씀 설정창) : 칩 on/off · 장절 형식 · 미리보기 | `toggleImgIncl`, `_syncHiUI`, `_syncHiOverlapRow`, `toggleTxtIncl`, `setTxtRefStyle`, `setTxtRefBracket`, `setTxtRefPos`, `_renderSharePreview`, `_syncShareSettingsUI`, `_rgba`, `_vfSelectedPatterns`, `_vfSecIdNow`, `_vfPatternPool`, `map` … 외 3개 |
| 13,310 | 명제 대표 문구의 자리·기울기 (v26-0831-3) | – |
| 13,324 | 대표 문구 글씨체 (v26-0901-5, HB) | – |
| 13,338 | 명조 | – |
| 13,342 | 고딕 | – |
| 13,345 | 손글씨 | `_ptFontsOn`, `a`, `_ptFontFor`, `_ptFont`, `_PT_FAMS`, `_ptBag`, `_ptSample`, `_ptMissing`, `_ptFontPending`, `_ptWarmup`, `_ptLinkGoogle`, `_ptEnsureFont`, `finish`, `_ptFontLoaded` … 외 2개 |
| 13,583 | 대표 문구가 둘인 명제 (v26-0904-4, HB) | `_propHiList`, `_propHiPick`, `_vfIsProp`, `_vfTheme`, `_vfTextScale`, `setVfTextScale`, `_tsTouchDist`, `_tsFine`, `_tsNearest`, `_tsPinchBusy`, `_tsPinchArm`, `_attachTextPinch`, `_syncVfTextScaleUI`, `_vfBgCss` … 외 16개 |
| 13,898 | 크기 (v26-0905-2, HB — "말씀 모음 설정에 비해 홈과 책갈피가 | – |
| 13,910 | 홈 아이콘 두 벌 (v26-0905-7, HB) | – |
| 13,925 | 전체화면 상단 중앙 순환·셔플 전환 (v26-0817-16, HB 3) | `_vfCycleMode`, `vfToggleCycleMode`, `_vfSyncCycleIcon`, `_vfShufReset`, `_vfShufPos`, `_vfShufGo`, `_vfShufPush`, `_vfSetNav`, `_vfClearNav` |
| 14,023 | 지금 보는 것이 '말씀 설정에서 정한 그 모음' 그대로인가 | `_vfAtCollection`, `_vfHomeStash`, `vfHomeAction`, `vfOpenCollSettings`, `closeVfKeepSwitch`, `_vfKeepSortHead`, `tab`, `_vfRenderKeepSwitch`, `toggleVfKeepSwitch`, `_vfKeepNav`, `vfOpenKeepList`, `vfOpenKeepGrid`, `_vfSyncTopBar`, `_vfCurrentVerse` |
| 14,222 | 고르기 | `_tagartAliasMap`, `_tagartOn`, `_tagartStyle`, `_tagartHay`, `_tagartHit`, `_tagartPick`, `_tagartSvg`, `org`, `_tagartSwatchSvg`, `org`, `_vfRenderTagArt`, `clear`, `key`, `_vfPlaceTagArt` … 외 3개 |
| 14,454 | 설정창 (말씀설정 → 전체화면 탭) | `toggleVfArt`, `togglePropTitleFont`, `_ptSyncFontUI` |
| 14,516 | 무리를 접었다 편다 (v26-0902-15, HB) | `_ptGroupInit`, `togglePropTitleGroupOpen`, `togglePropTitleGroup`, `setVfArtStyle`, `_vfArtSyncUI`, `_verseFullRender`, `tags` |
| 14,618 | 장절 줄 | `_vfRenderRef`, `rs`, `_vgOpenFromRef` |
| 14,640 | 대표 문구 줄바꿈 (v26-0901-3, HB) | `_ptLen`, `_ptSplitOnce`, `pick`, `_ptWrapTitle`, `k` |
| 14,688 | 명제 대표 문구 타이틀 | – |
| 14,691 | 대표 문구 크기는 **본문이 몇 줄이 되느냐**에 따라 달라진다 (v26-0902-13, HB) | `_ptLineK`, `_vfSizePropTitle`, `_ptDrawnLines`, `_vfRenderPropTitle`, `_vfPropInk`, `x`, `y`, `_vfBottomEl`, `_vfNavCommit` |
| 14,844 | 셔플의 '뒤로'는 무작위가 아니라 **방금 본 말씀** (v26-0831-19, HB) | `_vfShufPickRandom`, `verseFullNav`, `_initEdgeBack`, `paint`, `clearPaint`, `_vfHeartBurst`, `_vfDoubleLike`, `_initVerseFullGestures`, `inner0`, `snapBack`, `stopLt`, `dropDrag` |
| 15,124 | 다른 앱에 갔다 돌아왔을 때 (v26-0904-5, HB '그림이 아래로 내려와 글자와 겹친다') | `_vgEscAttr`, `_vgRawPool`, `_vgMatch`, `_vgFilteredPool`, `pool`, `_vgHomeLabel`, `openVerseGridHome`, `_vgDate`, `_vgSort`, `_vgBookOne`, `_vgGroupKey`, `_vgGroupLabel`, `_vgShortRef`, `ab` … 외 20개 |
| 15,426 | 태그·성경 필터일 때의 좌상단 제목 | – |
| 15,431 | 태그 목록에서 '구절이 적은 태그' 빼기 (v26-0817-13, HB 14) | `_vgExclKeys`, `_vgExclOn`, `_vgExclMax`, `_vgExclAxisNow`, `_vgAxisItems`, `_vgAxisLabel`, `_vgSyncFilterLabel`, `prev`, `next` |
| 15,532 | 롤링피커 바로 우측의 '제외' 글자 버튼 + 스테퍼 (v26-0817-13/14, HB 14-2·14B) | `_vgSyncExcl` |
| 15,559 | 타일뷰의 '제외' 버튼 — 지금 보고 있는 축(태그 또는 성경)을 켜고 끈다 | `vgToggleTileExcl`, `vgStepTileExcl` |
| 15,583 | 말씀 설정 → 뷰 탭의 '태그 목록' 항목 (14-1, 태그 전용) | `vgToggleTagExcl`, `vgStepTagExcl`, `_vgSyncTagSettingsUI`, `vgPickAxis` |
| 15,620 | 개발자 전용: 지금 말씀이 온 구글 시트를 그 셀로 열기 | `_sheetUrlForVerse`, `vfCatTap`, `_initVfCatSheet`, `stopTimer`, `vfOpenSheetForCat`, `_sheetGo`, `_sheetCopyPending`, `_vgOpenFromReels`, `openVerseGrid`, `_vgScrollToVerse`, `_vgHighlightTile`, `_vgRestoreHighlight`, `closeVerseGrid`, `_vgIsOpen` … 외 10개 |
| 16,054 | 떠 있는 메뉴의 높이를 화면에 맞춘다 | `_menuFitHeight` |
| 16,068 | 메뉴 안의 밀기를 메뉴 안에서 끝낸다 | `_menuLockScroll`, `openLogoMenu`, `closeLogoMenu`, `logoMenuOpenListSub`, `logoMenuOpenKeepSub`, `_logoMenuSubScheduleClose`, `_logoMenuSubCancelClose`, `_logoMenuSubHideFloat`, `logoMenuBackToMain`, `_tryCloseLogoMenu` |
| 16,204 | 네비게이토 180 전체 목록 (검색 + 대분류 필터) | `renderVerseListPies`, `openVerseListModal`, `closeVerseListModal`, `renderVerseListCatRow`, `renderVerseListResults`, `syncSecsFromState` |
| 16,315 | 경계선 모델로 옮기기 (v26-0806-7) | `defaultState`, `load`, `_localOwner`, `_setLocalOwner`, `resetStateToDefaults` |
| 16,414 | 설정 등급(이지/미드/파워) 첫 값 | – |
| 16,426 | 암송 기록 마이그레이션: verseIdx → ref | `rawSave`, `snapshot`, `beforeSave`, `save`, `applySnapshot`, `doUndo`, `doRedo`, `updateUrBtns`, `saveText`, `z` |
| 16,549 | Event time display format | `formatEventTime`, `esc`, `getDay`, `getBigs`, `getSmalls`, `secHasPendingTodo`, `secHasEvent`, `getEvents`, `weekOfMonth`, `eventRepeatsOnDate`, `eventOccursOnOwnDate`, `getDisplayEvents`, `sortEventsByTime`, `renderSecEvents` |
| 16,772 | 시각 없는 일정을 다른 시간구간으로 옮기기 (v26-0817-12, HB 9) | `_evSecAt`, `_evMarkDropSec`, `_evMoveToSec`, `attachEventChipInteraction`, `getContainer`, `getChips`, `openMenuForThis`, `startDrag`, `moveDrag` |
| 16,884 | 다른 시간구간 위로 넘어가면 그 구간으로 옮겨 붙인다 (v26-0817-12, HB 9) | `endDrag` |
| 16,924 | 다른 시간구간에 놓았으면 그 구간으로 옮긴다 (v26-0817-12, HB 9) | – |
| 16,962 | Desktop: mouse press — click opens the edit/delete menu, a | – |
| 16,996 | Mobile: touch long-press (same LONG_PRESS_TOUCH timing as tasks) | `getTrash`, `totalBigCount`, `logicalNow`, `tKey`, `todayKey`, `addDays`, `isToday`, `_t2m`, `_m2t`, `v`, `_secOffsets`, `n`, `base`, `_secNormalizeTimes` … 외 21개 |
| 17,243 | '시간 개념 없음' 구간 | `_secNoTime`, `_secIsCustom`, `isNowWithinSection` |
| 17,265 | 일정 정렬 | `_sortEventsKeepingTimeless` |
| 17,277 | 일정 재배치 | `_reassignTimedEvents`, `home`, `_secsCommit`, `moved` |
| 17,329 | 지운 구간 보관 | `_secArchiveCapture`, `_secStripData`, `_secArchiveApply`, `put`, `sendToTrash`, `updateTrashBadge`, `openTrash`, `closeTrash`, `trashBgClick`, `renderTrashList`, `restoreFromTrash`, `clearTrash`, `sw`, `renderToday` … 외 3개 |
| 17,587 | 구버전(todoCol 소유 모델) 자동 이전: todo를 해당 컬럼 맨 위에 주입 | `_colKey` |
| 17,667 | 기기 형태 판정 | `_devShortSide`, `b`, `_isTouchDevice`, `_layFormMode`, `_syncLayFormUI`, `setLayFormMode`, `_isPhoneForm`, `portrait`, `_layMode`, `applyUiScale`, `_timeStep`, `_fillMinOptions`, `_makeTimeRollPair`, `mk` … 외 14개 |
| 17,902 | 부드러운 전환 (커튼 오버레이) | `laySetWeekly`, `_rpMonthOf`, `_rpNormMonth`, `_rpMonthGridHTML`, `_rpMGridH`, `hh`, `_rpSetMGridH`, `_rpVListH`, `hh`, `_rpSetVListH`, `_rpAttachVResize`, `rpChMonth` |
| 18,119 | 암송/좋아요/Deeper 집계 | `_flatMemEntries`, `_flatSimpleEntries`, `_aggByRef`, `_aggEntriesForKind`, `out` |
| 18,175 | 범위(scope)별 집계 (v26-0904-7, HB) | `_vlKindEntries`, `_vlKeepEntries`, `_vlHomeEntries`, `_vlReactTotals`, `_vlExtraSortFor`, `_vlEntriesForScope` |
| 18,231 | C단계: 목록별 정렬·기간 설정 | `_vlPref`, `_vListRange` |
| 18,266 | 정렬 (v26-0831-11, HB) | – |
| 18,270 | 갈래 탭 (v26-0831-15, HB) | `_vlIsProp`, `v`, `_vlRegIdx`, `_vlClearRegIdx`, `_vlApplySort`, `_vlDispRef`, `v`, `vlToggleCtrl`, `_vlwKey`, `vlwSetSort`, `vlwTogglePairSort`, `vlwSetPeriod`, `vlwSetCustom`, `_vListControlsHTML` … 외 25개 |
| 18,608 | 저장은 '한 건'이 없다 (v26-0902-2, HB) | – |
| 18,678 | 로고 메뉴에서 여는 집계 목록 팝업 | `_renderVAggBody`, `openVerseAggPopup` |
| 18,704 | 목록 차례 칩 줄 (고르기 창 · 좌상단 메뉴가 함께 쓴다) | `_keepSortRowHTML`, `pairOn`, `_keepRepaintLists`, `_keepAttr` |
| 18,736 | 끌어서 차례 바꾸기 (v26-0831-21, HB) | `_keepBindDrag`, `rowsOf`, `put`, `want`, `clear`, `done`, `openKeepListPopup`, `_vAggSyncKeepTitle`, `_keepNameKey`, `_keepNameCommit` |
| 18,913 | 팝업 좌상단 햄버거 → 목록 바꾸기 (4-2-3, HB) | `toggleKeepSwitch`, `closeKeepSwitch`, `_renderKeepSwitch` |
| 18,948 | 좌상단 말씀메뉴 → '저장 목록' 하위 뎁스 | `_renderKeepSubMenu`, `openKeepPicker`, `closeKeepPicker`, `_renderKeepPicker` |
| 19,033 | 목록이 자리를 옮길 때의 움직임 (v26-0904-4, HB) | `_keepFlipRender`, `keepPickToggle`, `keepPickNew`, `n` |
| 19,087 | 목록 한 줄의 ⋯ 메뉴 (수정 · 삭제) | `openKeepRowMenu`, `x`, `closeKeepRowMenu`, `keepRowEdit`, `to`, `keepRowDelete`, `cnt`, `_keepAfterChange`, `_vDashKeyCmp`, `_vDashQ`, `_vDashPref`, `_vDashEntries`, `_vDashHomeAgg`, `_vDashVerse` … 외 14개 |
| 19,357 | 위쪽 전환: 분포(파이) ⇄ 흐름(꺾은선) | `_vDashView`, `vDashSetView`, `_vDashViewTabsHTML`, `renderVerseDashboard`, `_vTrPref`, `_vTrSort`, `vTrSortBy`, `_vTrSpan`, `_vTrInsMax`, `_vTrInsN`, `vTrSet` |
| 19,495 | 기간 슬라이더 | `_vTrOtherSpan`, `vTrSpanSet` |
| 19,517 | 부드럽게 끌리는 슬라이더 | `_vTrRailBind`, `paint`, `_vTrBindRails`, `vTrInsSet`, `vTrToggleSeries`, `vTrToggleExp`, `vTrOpenBook`, `on`, `vTrCloseBook`, `_vTrEntries`, `_vTrBucketOf`, `_vTrBucketList`, `_vTrBucketLabel`, `_vTrUnitWord` … 외 1개 |
| 19,668 | 그 성경 안에서 이 말씀이 걸리는 '장' | `_vTrChapterKeys`, `rs`, `_vTrChapNo`, `_vTrChapCmp`, `_vTrData`, `unit`, `add`, `_vTrGeo`, `bw`, `_vTrHFromX`, `_vTrChartSVG`, `nameTx` |
| 19,770 | 견주는 두 구간을 그림 안에 그린다 (v26-0906-1 · v26-0906-2, HB 4) | `markOf` |
| 19,909 | 그림 안의 띠를 끌어 견주는 구간(h)을 바꾼다 (v26-0906-2, HB 4-1) | `_vTrBindBand`, `paint`, `_vTrChipsHTML`, `_vTrRailHTML`, `f`, `pct`, `_vTrSpanRowHTML`, `unit`, `_vTrRowsOf`, `sum`, `_vTrDiffHTML`, `_vTrInsightHTML`, `enough` |
| 20,055 | 작은 발견 (v26-0906-5, HB 2) | `_vTrFindings`, `sum`, `_vTrFindingsHTML`, `card`, `put` |
| 20,120 | 표 정렬 (v26-0906-2, HB 7) | `_vTrNameCmp`, `_vTrSortRows`, `_vTrTheadHTML`, `_vTrRowHTML`, `renderVDashTrend`, `form`, `unit` |
| 20,199 | 소제목 차례: 갈래 - 범위 - 무엇을 - 기간 - 모양 (v26-0906-1, HB 3) | `_vDashWinEntries`, `_vDashScope`, `vDashSetMapAll`, `_vDashScopeCtlHTML` |
| 20,301 | 지도 | `_vMapMode`, `vDashMapPick`, `_vMapStats`, `_vMapStep`, `_vMapShade`, `_vMapInk`, `_vMapCellHTML`, `_vWeeksSince`, `renderVDashMap`, `grid` |
| 20,438 | 연결 (주제 ↔ 성경) | `_vLinkAxis`, `renderVDashLink`, `yOf` |
| 20,519 | 주간 리듬 (잔디) | `_vRhyWeeks`, `renderVDashRhythm` |
| 20,584 | 장절 느슨한 대조 | `_refNorm` |
| 20,621 | 알림에 실어 보내는 명제 열쇠 (v26-0901-3, HB) | `_pushKey`, `_pushKeyPid`, `_findVerseByRefLoose` |
| 20,663 | 중복 구절 일회성 정리 (5-2) | `_dupVerseScan`, `_rewriteLogRefs`, `mergeDuplicateVerses` |
| 20,746 | 셀에서 바깥으로 나가는 동작들 | `_vDashMarkReturn`, `_vDashMaybeReturn`, `vDashOpenFilter`, `vDashOpenVerse`, `_vsetGoTab`, `_vsetGoColl`, `_vsetFlashTab`, `openVerseSettingsFromMenu`, `openVcCollSettings`, `_vsetRestoreBack`, `vDashOpenCollSettings`, `openVerseCollSettings` |
| 20,870 | 파이차트 상세 팝업 | `_vDashPieDetailSVG`, `_vDashDetailDotsHTML`, `vDashOpenDetail`, `_vDashDetailGo`, `_vDashDetailSlide`, `_initVDashDetailSwipe`, `slide`, `bodyEl`, `finish`, `_vDashDetailKey`, `closeVDashDetail`, `openVerseDashboard`, `closeVerseDashboard`, `closeVerseAggPopup` … 외 10개 |
| 21,238 | 위젯이 보는 범위 (v26-0904-7, HB) | `_vcScope`, `_vcScopeIsHome`, `_vcScopeCount`, `_vcSyncKind`, `_vcView`, `_vcScopeKey`, `_vcScopeIcon`, `_vcScopeLabel`, `_vcScopeParts` |
| 21,301 | 자동 넘김 (v26-0904-10, HB) | `_vcAutoOn`, `_vcAutoMin`, `_vcAutoOffset`, `_vcAutoSlot` |
| 21,328 | 앱을 껐다 켤 때 (v26-0905-10, HB) | `_vcAutoAnchors`, `_vcAutoSaveAnchors`, `_vcAutoSetAnchor`, `_vcAutoResetAnchors`, `setVcAuto`, `setVcAutoMin` |
| 21,384 | 이름 넘김 방식·간격 (v26-0905-8, HB) | `_vcRollSec`, `_vcRollMode`, `_vcRollOpt`, `_rollSecLabel`, `setVcRollMode`, `setVcRollSec`, `vcRollSecInput`, `_vcHeadMode`, `setVcHeadMode`, `_vcIs`, `_vcIdOf`, `_vcAll`, `_vcGet`, `_vcNewId` … 외 5개 |
| 21,492 | 카드가 도는 범위 | `_vcListItems`, `_vcVerseOf`, `hit`, `_vcKeyOf` |
| 21,523 | 명제의 대표 문구 (v26-0904-10, HB) | `_vcHiSplit`, `_vcVerses`, `_vcCurrent` |
| 21,583 | 자동 넘김 시계 | `_vcAutoChanged`, `_vcAutoSlide`, `finish`, `_vcAutoTick`, `_vcAutoStart`, `_vcFilterLabel` |
| 21,658 | 카드 테마 | `_vcHash`, `_vcPatternKey`, `_vcThemeVars`, `fam`, `_vcTextScale` |
| 21,698 | 카드 높이 (드래그로 조절, 위젯마다 따로) | `_rpVCardH`, `hh`, `_rpSetVCardH` |
| 21,709 | 표시 항목 | `_vcShow`, `_vcGroupOf`, `_vcGroupOn`, `v`, `_vcShowFor` |
| 21,730 | 카드 한 장 HTML | `_vcCardHTML` |
| 21,813 | 본문 줄바꿈·크기 맞춤 | `_vcLayoutOne`, `raw`, `padH`, `padV`, `refH`, `_vcLayoutAll`, `_vcSyncCounts`, `put`, `putText` |
| 21,906 | 카드 동작 | `_vcReactKeyOf`, `vcAct`, `vcOpenFilter`, `vcClearFilter`, `_vcApplyNav`, `_vcSlideEl`, `_vcCurX`, `_vcSlideCommit`, `to`, `vcNav`, `vcOpenFull`, `_vcUnplacedForKind` |
| 22,046 | 카드 ⇄ 목록 | `vcSetView`, `vcToggleView`, `vcAddCard`, `_vwScopeOpts`, `openVwScope`, `closeVwScope`, `renderVwScope`, `row`, `_vwKeepSortHTML`, `chip`, `_vwScopeBindHold`, `go`, `vwScopeCollSettings`, `vwScopePick` … 외 3개 |
| 22,220 | 말씀 목록 모습 한 벌 | `_vcListHTML`, `_vcAttachGestures` |
| 22,361 | 카드 설정 팝업 (위젯 하나하나마다 따로) | `openVcSettings`, `closeVcSettings`, `renderVcSettings`, `themeChip`, `swTitle`, `swRow`, `scopeTxt`, `hmBtn`, `rmBtn`, `setVcShow`, `setVcShowAll`, `setVcTextScale`, `vcSetTextScaleLive`, `vcStepTextScale` … 외 4개 |
| 22,663 | 컬럼별 위젯 스택 계산 (todo 포함) | – |
| 22,683 | 각 컬럼 렌더링 | – |
| 22,703 | todayView 실제 DOM 이동: todo placeholder 슬롯 or 1단은 colL 직속 | – |
| 22,711 | 설정(햄버거) 버튼: GNB 로고 우측, 2단부터 표시 (3-3) | – |
| 22,724 | 3단 주간뷰 패널 | – |
| 22,748 | 폭 적용 + 인터랙션 연결 | `_rpAddBtnHTML`, `_rpAttachSwipes` |
| 22,786 | 위젯 설정 팝업 | `openRpConfig`, `closeRpConfig`, `renderRpConfigList`, `_rpAttachChipDrag` |
| 22,915 | 드래그 재정렬 공용 헬퍼 (고스트 이미지 + 타겟 라인) | `_ghostDragStart`, `offTest`, `pickContainer`, `place` |
| 23,000 | 스팬 라인 모드 (opt.lineFor): 주간뷰처럼 두 단에 걸치는 위젯은 | `up`, `_rpAttachHeaderDrag`, `bindHold`, `_attachWeeklyPaneDrag`, `begin`, `_rpCurrentRatio`, `_layApplyWidths`, `_layInitDividers`, `attach`, `W`, `clamp`, `renderAddRow`, `defIds`, `appendMarkerFilterBtn` … 외 3개 |
| 23,742 | 시계 버튼: 탭=일정추가, 롱터치=시간순정렬 | – |
| 23,743 | 시계 버튼: 일정이 있을 때만 표시, 탭=시간순정렬 | – |
| 23,766 | + 버튼: 탭=빅블럭추가, 롱터치=스몰블럭추가 | – |
| 23,820 | ▲ 버튼: 섹션 숨기기 | `updateSecSummary`, `manuallyCollapsed` |
| 23,948 | 받은 쪽지 뷰어 (개발자 계정 전용) | `_isDevAccount`, `_syncDevInboxVisibility`, `_devReadLocal`, `_devReadIds`, `_devMigrateRead`, `_devMarkRead`, `_devTrashGet`, `_devTrashSet`, `_devWhen`, `ms`, `_devWhenTxt`, `devInboxUpdateBadge`, `devInboxRefreshBadge`, `devInboxToggleAll` … 외 8개 |
| 24,187 | 휴지통 | `devTrashToggle`, `devTrashRender`, `devTrashDelete`, `devTrashEmpty` |
| 24,223 | 개발자 쪽지 (설정창 계정탭) | – |
| 24,235 | 첨부 처리 방식 | `_devCompressFile`, `devNoteHandleFile`, `devNoteSend`, `openInlineInput`, `_openGhostInput`, `closeInlineInput`, `renderSecBody` |
| 24,628 | 슬라이드 인라인 입력창 (헤더 바로 아래, B안) | `makeSwipeWrap`, `onTouchStart`, `onTouchMove`, `onTouchEnd`, `taskMarkerFilterPass`, `makeBigWrap`, `getCarryCount`, `populateCarryBadge`, `color`, `autoSizeInput`, `measure`, `makeBigItem`, `isOver`, `makeBigGhost` … 외 10개 |
| 25,378 | Desktop: drag handle mousedown (instant drag — power users) | – |
| 25,383 | Desktop: long-press anywhere on the row (mirrors mobile touch UX) | `cancelMousePress` |
| 25,422 | Desktop: right-click → task move context menu | – |
| 25,429 | Mobile: long-press anywhere on element (including input/button areas) | `cancelPressTimer` |
| 25,627 | Hold off the browser's scroll gesture WHILE the long-press | `getSecColor`, `clearDropIndicators`, `showDropIndicator` |
| 25,685 | Drop target: closest-item snap (no fallback flicker) | `getDropTarget` |
| 25,700 | 구간 헤더(.ts-hd) 위에 놓았을 때도 받는다 (v26-0817-7, HB 13번) | – |
| 25,753 | 좌우 절반으로 빅/스몰 결정 | `getStableDt`, `moveG`, `_dragZoneMid`, `_updateDragHintBounds`, `cancelDragKeepingItem`, `endDrag`, `navigateDate`, `updateHeaderDate` |
| 26,116 | GNB 날짜의 광학 보정 | `_syncHdrDateOptical`, `_dNavEl`, `initDateSwipe`, `isSwipeZone`, `isExcluded`, `onStart`, `onMove`, `onEnd`, `onCancel`, `IS_TOUCH`, `itemKey`, `parseItemKey`, `buildFlatList`, `findFlatIndex` … 외 10개 |
| 26,455 | Lane model for ⇧⌘↑/↓ reordering | `buildLanes`, `findLaneIndex`, `moveActiveItems` |
| 26,522 | Move the entire active group by exactly one flat step | `moveActiveItemsAcrossSection` |
| 26,670 | While editing a big/small task's text | – |
| 26,699 | Not editing text: arrow-key driven selection | – |
| 26,730 | View-switching and date-navigation shortcuts (desktop, D/W/M views) | `wireActivateClick`, `openTaskMenu`, `arr`, `CONTACT_PICKER_SUPPORTED`, `findMentionedContacts`, `renderTaskTextHTML`, `makeContactBadges`, `contactBadgeCountChanged` |
| 26,945 | @배지 액션 메뉴 | `openContactMenu`, `phone`, `email`, `closeContactMenu`, `contactAction` |
| 27,022 | @닉네임으로 태그된 할일 모아보기 | `getTasksTaggedWithContact`, `showContactTasksPopup`, `closeContactTasksPopup` |
| 27,096 | 연락처 관리 모달 | `openContactsModal`, `closeContactsModal`, `clearContactForm`, `startEditContact`, `editContact`, `c`, `renderContactsList`, `submitContact`, `dup`, `pickFromDeviceContacts` |
| 27,197 | Event add modal | `syncRollDisplays` |
| 27,224 | 일정 등록창의 시·분 목록 | `_evFillMins`, `_evSyncRange`, `sec`, `keep`, `openEventModal`, `openEventModalForDate`, `setEventTimeToggle`, `_syncEventDateUI`, `onEventDateChange`, `closeEventModal`, `onEventTimeToggle`, `submitEventModal`, `repeat`, `secId` |
| 27,470 | 매일/매주 repeat buttons | `renderRepeatButtons`, `toggleEventDaily`, `toggleEventWeekly`, `attachRepeatBtnInteraction` |
| 27,537 | Touch | – |
| 27,569 | Mouse (desktop only — skipped when a touch already handled it) | `_attachRepeatButtons`, `attachFastTap`, `openRepeatSubPicker`, `closeRepeatSubPicker`, `openEventEditMenu`, `closeEventEditMenu`, `editEventFromMenu`, `deleteEventFromMenu`, `closeTaskMenu`, `toggleTaskFlag`, `toggleTaskContact`, `toggleDailyRepeat`, `ensureDailyRepeats`, `moveTaskTo` … 외 15개 |
| 28,082 | 옮긴 뒤 "그 날짜로 가 볼까요?" (v26-0904-3, HB) | `_toastWithJump`, `_flashPendingTask`, `sel`, `_dayTaskCount`, `_fillTaskMenuCounts`, `weekOffsetLabel`, `setWMViewMode`, `_makeWMViewBtnsHTML`, `_wkPaneActive`, `renderWeekly`, `daysFromToday`, `getDayFadeClass`, `navigateWeek`, `attachPullToToday` … 외 9개 |
| 28,604 | 주간/월간 블럭 우클릭/롱터치 → 바로 입력 | `_cellDefaultSec`, `now`, `vis`, `_renderSecPick`, `list`, `openCellInput`, `mode`, `_openCellEvent`, `_openCellEventRepaint`, `_openCellTodo`, `sec`, `closeCellTodo`, `cellTodoSave`, `text` … 외 24개 |
| 29,119 | GNB 날짜 롱터치/우클릭 달력 | `openHdrCalendar`, `closeHdrCalendar`, `_closeHdrCalendarNow`, `hdrCalNav`, `hdrCalPick`, `hdrCalGoToday`, `_hdrCalRender`, `_initHdrDateLongPress`, `goToDate` |
| 29,223 | Theme (dark / light / system) | `_effectiveMode`, `applyTheme`, `shown`, `_themeSummaryText`, `_renderThemeSummary`, `strip`, `openThemePicker`, `closeThemePicker`, `themePickerApply`, `themePickerPick`, `themePickerGroup`, `_renderThemePicker`, `_themePreviewHTML`, `resizeAllInputs` … 외 15개 |
| 29,775 | Section editor (name / color / add / remove / drag-reorder / star-select) | – |
| 29,776 | Color preset picker (built-in BASIC/SPR/SMR/AUT/WNT + user-saved) | `currentMatchingPresetName`, `renderPresetList`, `makePresetChip`, `applyPreset`, `renderSectionEditor` |
| 29,848 | 이 구간 위의 경계선 | `_makeBoundaryRow`, `_makeBoundaryRoll`, `sel`, `mk`, `paint`, `updateSectionBoundary`, `toggleStarSection` |
| 30,129 | 아이콘 두 벌 | `uiLevelIconSet`, `_uiLvIconSVG`, `_renderUiLevelIcons`, `_renderVerseUiLevelIcons`, `setUiLevelIconSet`, `uiLevel`, `v`, `setUiLevel`, `_stabList`, `_lvApplyIn`, `applyUiLevel`, `verseUiLevel`, `v`, `setVerseUiLevel` … 외 3개 |
| 30,304 | "앞의 스위치를 켰을 때만 나오는" 줄들 | `_syncCondRows`, `n`, `switchSettingsTab`, `_initSettingsSwipe`, `N`, `getTrack`, `resolveTarget`, `toggleSectionExclude`, `updateSectionField` |
| 30,458 | Drag-to-reorder for the section editor rows (mouse + touch) | `attachSecRowDrag`, `getWraps`, `onDown`, `onMove`, `onUp`, `addNewSection` |
| 30,555 | 커스텀 구간 지우기 | `deleteSection`, `closeSecDelModal`, `_secDataCount`, `secDelDo`, `sec` |
| 30,630 | 보관해 둔 구간 되살리기 | `renderSecArchive`, `restoreSecArchive`, `dropSecArchive` |
| 30,687 | Full section-configuration presets (name + color + order + count | `renderSectionConfigList`, `saveCurrentSectionConfig`, `applySectionConfig`, `deleteSectionConfig` |
| 30,776 | Backup / restore | `exportBackup`, `_backupDownload`, `buildBackupFilename`, `email`, `emailTag`, `n`, `importBackup` |
| 30,904 | Auto carry-over of unfinished tasks | `runAutoCarryOver`, `testAutoCarryOver`, `_carryScope`, `setCarryScope`, `_syncCarryScopeBtns`, `_carryDateInScope`, `_carryPendingCount`, `_doCarry`, `runCarryNow` |
| 31,046 | 푸시 알림을 눌러 들어왔을 때 그 말씀 전체화면 띄우기 | – |
| 31,051 | 알림 진단 기록 (서비스워커와 같은 캐시를 공유) | `_notifLog` |
| 31,073 | 진단 기록 보조 저장소 (localStorage) | – |
| 31,077 | IndexedDB (서비스워커와 같은 저장소) | `_withTimeout`, `_withOutcome`, `_outcomeText`, `_idbForget`, `_idbOpen`, `_idbRaw`, `_idbGetRaw`, `_idbSetRaw`, `_idbDelRaw`, `_idbGet`, `_idbSet`, `_idbDel`, `_idbGetOutcome`, `_idbSetOutcome` … 외 30개 |
| 31,655 | 말씀 클릭 경로 테스트 | `testVerseClickPath` |
| 31,687 | 알림 진단 기록 뷰어 (말씀 설정 → 알림 탭) | `_vpDiagFmt`, `_vpDiagHead`, `vpDiagRender`, `vpDiagToggle`, `vpDiagClear`, `vpDiagCopy`, `build`, `_vpDiagCopyFallback`, `initAppUI` |
| 31,793 | 푸시 말씀 목록을 앱 켤 때 한 번 맞춘다 (v26-0901-4, HB) | – |
| 31,809 | Day-change catch-up on wake | – |
| 31,860 | 첫 화면 빠른 그리기 (인계문서 5-3 · v26-0803-2) | `paintAppUIFromLocal`, `_notifySupport`, `_notifyGet`, `renderSuffixPickers`, `setNotifySuffix`, `addCustomSuffix`, `appConfirm`, `_appConfirmResolve` |
| 32,030 | 커스텀 문구 칩 컨텍스트 메뉴 (수정/삭제) | `openSfxMenu`, `left`, `closeSfxMenu`, `sfxMenuAction`, `renameCustomSuffix`, `removeCustomSuffix`, `refreshNotifyUI` |
| 32,125 | 푸시 배관(토큰) 공용 | – |
| 32,136 | 기기 구분 | `_deviceId`, `_deviceLabel`, `touch`, `_ensurePushToken`, `_releasePushTokenIfIdle` |
| 32,245 | 이 기기에서 알림 받기 (기기별 스위치, v26-0828-7) | `setDeviceNotify`, `_syncDeviceNotifyUI` |
| 32,273 | 할일 알림 스위치 (일반설정 → 푸시 알림) | `onNotifyMasterToggle`, `updateNotifySub`, `initForegroundPush` |
| 32,307 | 서비스워커 자기 복구 (v26-0802-5) | – |
| 32,318 | 앱이 화면에 떠 있을 때 도착한 푸시 (foreground) | – |
| 32,349 | 알림 테스트 | `testLocalNotification`, `sendTestPush`, `authToggleMode`, `authSetLoading`, `authSubmit`, `authErrorMessage`, `authSignOut` |
| 32,489 | Firestore doc path: one document per user, holding their entire ST | `userDocRef`, `_fbSetBase`, `_fbLoadPersistedBase`, `_fbClearBase`, `_fbBaseObj` |
| 32,560 | 3자 병합 엔진 | `_fbIsUserEdit`, `_fbDeviceIdle` |
| 32,598 | 앱 버전 비교 ("v. YY-MMDD-N") | `_verNums`, `_verCmp`, `_fbVerIsOlder`, `_mgWhole`, `_mgContainerKeys`, `_mgCountBag`, `_mgEntryArray`, `_mgLogFlat`, `_mgLogNested`, `_mgTaskArray`, `_mgTaskOne`, `_mgDay`, `_mgById`, `_fbHasAdoptedCloud` … 외 18개 |
| 32,954 | 안쪽 이름표를 사람 말로 | `_dfSeg`, `_dfSegPath`, `_dfWord`, `_dfValS`, `_dfVal` |
| 33,012 | 값 두 벌에서 **다른 자리만** 뽑는다 | `_dfDeep`, `_dfDeepLines`, `_dfKindName`, `_dfToday`, `_dfPush` |
| 33,049 | 할일 한 구간(배열) | `_dfTaskKey`, `_dfArr` |
| 33,098 | 날짜별 할일·일정 | `_dfDays`, `A` |
| 33,116 | 말씀 모음 하나 | `_dfVKey`, `_dfColl1`, `_dfColls` |
| 33,142 | 연락처 하나 | `_dfContact1`, `_dfContacts` |
| 33,155 | 기록(암송·좋아요·담아두기·나눔·Deeper) | `_dfLogRefs`, `_dfLogs` |
| 33,184 | 설정 | `_dfSettings`, `A` |
| 33,199 | 본체 — 상태 a(이전) 에서 b(이후) 로 무엇이 달라졌나 | `_dfDiff`, `_dfBrief`, `_dfScale`, `k`, `days`, `_dfScaleText`, `_cfJ`, `_cfDiffer`, `_cfId`, `_cfSecLabel`, `_cfKindLabel`, `_cfText`, `_cfMake`, `_cfScanSection` … 외 11개 |
| 33,553 | 충돌 보관 · 화면 | `_cfLoadLocal`, `_cfTrimmed`, `_cfSaveLocal`, `_cfOpenCount`, `_cfStore`, `_cfPushCloud`, `_cfFetchCloud`, `_cfSyncVisibility`, `_fbCollectConflicts`, `_fbNoteConflicts` |
| 33,661 | 화면 | `_cfWhoLabel`, `l`, `_cfEsc`, `_cfNiceLabel`, `_cfGroupName`, `_cfChoiceLabel`, `_cfCutRaw`, `_cfExplain`, `cfToggleRaw`, `_cfBaseLine`, `_cfCardHTML`, `auto`, `laterLocal`, `side` … 외 12개 |
| 34,040 | 데이터 복구: 로컬(localStorage) ↔ 클라우드(Firestore) 비교 | `_dayHasContent`, `_recoverySummary`, `inspectRecoveryDate`, `checkDataRecovery`, `cleanupEmptyDays`, `fbForceUploadLocal` |
| 34,214 | 자동 백업 보기·복원 (동기화 충돌 병합 시 남는 3슬롯) | `_abLocalState`, `_abRankLabel`, `showAutoBackups`, `restoreAutoBackup`, `applyRemoteState`, `_fbWarnLegacyWriter`, `_fbHealFromLegacy`, `first`, `_fbMaybeSelfUpdate`, `fbStartListening`, `_swOn` |
| 34,595 | 담아두기 | `getKeepLog` |
| 34,608 | 저장 목록 (v26-0831-11, HB) | `_keepListOf`, `n`, `_keepEntries`, `_keepLists` |
| 34,678 | 목록 차례 (v26-0831-19, HB) | `_keepSort`, `v`, `_keepPairSort`, `v`, `keepSetSort`, `keepTogglePairSort`, `_keepOrder`, `a`, `_keepSetOrder`, `_keepSortLists`, `recent`, `byName`, `_keepListsOf`, `_swIsKept` … 외 10개 |
| 34,872 | 저장 | `_swLoadTiles`, `raw`, `_swSaveTiles`, `_swSpareKinds` |
| 34,893 | 값 만들기 (진짜 데이터) | `_swLastVerses`, `_swSermons`, `_swBooks`, `_swTags`, `_swReacts`, `_swValues`, `_swStrip` |
| 34,995 | 한 타일의 얼굴 | `_swEsc`, `_swArtHTML`, `_swPipsHTML`, `_swCellHTML`, `_swFace` |
| 35,083 | 그리기 | `_swTileClass`, `_swRender` |
| 35,110 | 편집 모드 | `_swEditOn`, `swToggleEdit`, `_swAddTile`, `_swKillTile`, `_swSizeCells`, `_swNoMotion`, `_swTrack`, `_swTrackTo`, `_swRepaint` |
| 35,188 | 누르면 전체화면 | `_swOpenVerse`, `_swVersesFor`, `_swTileOpen` |
| 35,244 | 몸짓 (좌우만 — 세로는 스크롤에게 양보) | – |
| 35,263 | 편집: 끌어서 자리 바꾸기 | `_swDragStart`, `_swDragMove`, `_swDragHole`, `_swDragHoleOff`, `_swReorder`, `_swInitGestures`, `_swFinishSwipe`, `_swSnap` |
| 35,513 | 켜고 끄기 | `swToggleHome`, `_swBoot` |
| 35,536 | DEV MODE BOOTSTRAP | `fbPushState`, `authSignOut`, `checkDataRecovery`, `fbForceUploadLocal`, `showAutoBackups`, `restoreAutoBackup`, `openSyncConflicts`, `closeSyncConflicts`, `cfChoose`, `cfMergeAll` |

---

## 5. 함수 이름 색인

찾는 기능의 함수 이름이 기억날 때 여기서 확인하고 바로 grep 하세요.

`_abLocalState`  `_abRankLabel`  `_addVersesToColl`  `_addVersesToCurrentColl`  `_afterActiveVersesChanged`  `_aggByRef`
`_aggEntriesForKind`  `_appConfirmResolve`  `_applySneakMaxW`  `_attachRepeatButtons`  `_attachTextPinch`  `_attachVliMenus`
`_attachWeeklyPaneDrag`  `_avgHex`  `_backupDownload`  `_bibleChapters`  `_bibleRankOfRef`  `_bibleShort`
`_bookAbbr`  `_bookCanon`  `_bookNorm`  `_bookOfRef`  `_bookSel`  `_booksOf`
`_buildBookPicker`  `_buildCollFilterPanel`  `_buildGroupPicker`  `_buildShareText`  `_bumpVerseStat`  `_calKey`
`_cardActionCount`  `_cardGrain`  `_cardTextLS`  `_carryDateInScope`  `_carryPendingCount`  `_carryScope`
`_ceFillSelects`  `_cellDefaultSec`  `_ceMakeRow`  `_ceSortedIdx`  `_ceToggleTrashSel`  `_ceUpdateDeleteBtn`
`_ceUpdateRestoreBtn`  `_ceUpdateTrashBadge`  `_ceVerseSide`  `_cfApply`  `_cfBaseLine`  `_cfCanMerge`
`_cfCardHTML`  `_cfChoiceLabel`  `_cfClearSel`  `_cfCutRaw`  `_cfDetect`  `_cfDiffer`
`_cfEsc`  `_cfExplain`  `_cfFetchCloud`  `_cfGroupName`  `_cfHasSel`  `_cfId`
`_cfJ`  `_cfKindLabel`  `_cfLoadLocal`  `_cfMake`  `_cfNiceLabel`  `_cfOpenCount`
`_cfPushCloud`  `_cfSaveLocal`  `_cfScanById`  `_cfScanKeys`  `_cfScanSection`  `_cfSecLabel`
`_cfSelKey`  `_cfShrink`  `_cfSortKey`  `_cfStore`  `_cfSyncVisibility`  `_cfText`
`_cfTrimmed`  `_cfUnion`  `_cfWhoLabel`  `_chk`  `_clearPendingVerse`  `_closeHdrCalendarNow`
`_colKey`  `_collFilteredVerses`  `_collIsProp`  `_collLabel`  `_collPeriodPass`  `_collPeriodVerses`
`_collRawVerses`  `_collVersePassesFilter`  `_copyTextFallback`  `_crossSwipeAllowed`  `_currentColl`  `_currentSecId`
`_dataURLtoBlob`  `_datePickArmed`  `_dayHasContent`  `_dayLabel`  `_dayTaskCount`  `_desat`
`_devAttachSwipe`  `_devCompressFile`  `_devFilesHTML`  `_deviceBaseW`  `_deviceId`  `_deviceLabel`
`_devInboxButton`  `_devMarkRead`  `_devMigrateRead`  `_devNotifOn`  `_devNotifSet`  `_devReadIds`
`_devReadLocal`  `_devShortSide`  `_devTrashGet`  `_devTrashSet`  `_devWhen`  `_devWhenTxt`
`_dfAgo`  `_dfArr`  `_dfBrief`  `_dfColl1`  `_dfColls`  `_dfContact1`
`_dfContacts`  `_dfCut`  `_dfDay`  `_dfDays`  `_dfDeep`  `_dfDeepLines`
`_dfDiff`  `_dfFieldLabel`  `_dfJ`  `_dfJosa`  `_dfKindName`  `_dfLogRefs`
`_dfLogs`  `_dfPush`  `_dfQ`  `_dfRo`  `_dfSame`  `_dfScale`
`_dfScaleText`  `_dfSeg`  `_dfSegPath`  `_dfSetLabel`  `_dfSettings`  `_dfTaskKey`
`_dfToday`  `_dfVal`  `_dfValS`  `_dfVKey`  `_dfWhen`  `_dfWord`
`_dismissReactToast`  `_dismissToast`  `_dlog`  `_dlogScroll`  `_dNavEl`  `_doCarry`
`_dragZoneMid`  `_dropStalePending`  `_dsCapture`  `_dsOverlay`  `_dsProject`  `_dsRead`
`_dsWrite`  `_dupVerseScan`  `_effectiveMode`  `_ensurePushToken`  `_entrySecId`  `_escShown`
`_evenDeeperShortRef`  `_evFillMins`  `_evMarkDropSec`  `_evMoveToSec`  `_evSecAt`  `_evSyncRange`
`_fallbackCopy`  `_fbApplyRenders`  `_fbApplyStateToApp`  `_fbBaseObj`  `_fbBulkLoss`  `_fbClearBase`
`_fbCollectConflicts`  `_fbCommit`  `_fbCountArrays`  `_fbCountByKind`  `_fbCountItems`  `_fbDeviceIdle`
`_fbEnsureSync`  `_fbForceWrite`  `_fbHasAdoptedCloud`  `_fbHealFromLegacy`  `_fbIsUserEdit`  `_fbLoadPersistedBase`
`_fbMaybeSelfUpdate`  `_fbMerge`  `_fbMergeGuarded`  `_fbNoteConflicts`  `_fbReady`  `_fbScheduleRetry`
`_fbSetBase`  `_fbVerIsOlder`  `_fbWarnLegacyWriter`  `_fbWriteBackup`  `_fetchSheetCsv`  `_fetchVerseStat`
`_fillMinOptions`  `_fillTaskMenuCounts`  `_fillVerseBarDOM`  `_findVerseByRefLoose`  `_flashPendingTask`  `_flatMemEntries`
`_flatSimpleEntries`  `_fmtRefForText`  `_fmtSubDate`  `_freshTaskCopy`  `_genCollId`  `_generateUniqueShareCode`
`_getCollFilter`  `_ghostDragStart`  `_groupVersesBy`  `_groupVersesByMulti`  `_gSrcId`  `_hdrCalRender`
`_hexNum`  `_hiAssign`  `_hiBold`  `_hiFw`  `_hiHash`  `_hiHTML`
`_hiKindsOn`  `_hiLinesHTML`  `_hiOn`  `_hiOverlap`  `_hiOverlay`  `_hiPen`
`_hiPhrases`  `_hiPickAt`  `_hiRanges`  `_hiRefreshAll`  `_hiRibbon`  `_hiRng`
`_hiShuffle`  `_hiSmooth`  `_hiSquash`  `_hiStar`  `_hiStarMax`  `_hiStarPoly`
`_hiWave`  `_hiWavePoly`  `_hiWob`  `_idbDel`  `_idbDelOutcome`  `_idbDelRaw`
`_idbForget`  `_idbGet`  `_idbGetOutcome`  `_idbGetRaw`  `_idbOpen`  `_idbRaw`
`_idbSet`  `_idbSetOutcome`  `_idbSetRaw`  `_importVerseRows`  `_initEdgeBack`  `_initHdrDateLongPress`
`_initSettingsSwipe`  `_initSneakMaxWPicker`  `_initVDashDetailSwipe`  `_initVerseAlarmPicker`  `_initVerseBarSwipe`  `_initVerseFullGestures`
`_initVerseGridGestures`  `_initVerseNotifBridge`  `_initVerseSettingsSwipe`  `_initVfCatSheet`  `_invalidateVerseCaches`  `_isDevAccount`
`_isPhoneForm`  `_isPropSheet`  `_isReactPid`  `_isTouchDevice`  `_keepAfterChange`  `_keepAttr`
`_keepBindDrag`  `_keepDeleteList`  `_keepEntries`  `_keepFlipRender`  `_keepListOf`  `_keepLists`
`_keepListsOf`  `_keepNameCommit`  `_keepNameKey`  `_keepOrder`  `_keepPairSort`  `_keepRenameList`
`_keepRepaintLists`  `_keepSetOrder`  `_keepSort`  `_keepSortLists`  `_keepSortRowHTML`  `_lay`
`_layApplyWidths`  `_layFormMode`  `_layInitDividers`  `_layIsKnownType`  `_layMode`  `_loadSheetJs`
`_localOwner`  `_logoMenuSubCancelClose`  `_logoMenuSubHideFloat`  `_logoMenuSubScheduleClose`  `_looksLikeRef`  `_lvApplyIn`
`_m2t`  `_makeBoundaryRoll`  `_makeBoundaryRow`  `_makeTimeRollPair`  `_makeWMViewBtnsHTML`  `_menuArmOnNextPress`
`_menuFitHeight`  `_menuLockScroll`  `_mgById`  `_mgContainerKeys`  `_mgCountBag`  `_mgDay`
`_mgEntryArray`  `_mgLogFlat`  `_mgLogNested`  `_mgTaskArray`  `_mgTaskOne`  `_mgWhole`
`_moveDateToastMsg`  `_mviewEventCountsHTML`  `_mviewRowHTML`  `_noiseTile`  `_notifAckToSW`  `_notifAnnounceReady`
`_notifAuthBlocking`  `_notifIntentClear`  `_notifIntentFrom`  `_notifIntentLoad`  `_notifIntentSave`  `_notifLog`
`_notifLogLSPush`  `_notifLogLSRead`  `_notifLogRead`  `_notifMark`  `_notifNewId`  `_notifPid`
`_notifSameRef`  `_notifShortId`  `_notifShowing`  `_notifStage`  `_notifStep`  `_notifStop`
`_notifTakeIntent`  `_notifyGet`  `_notifySupport`  `_nowHM`  `_numHex`  `_openCellEvent`
`_openCellEventRepaint`  `_openCellTodo`  `_openGhostInput`  `_openPropDeeper`  `_openVerseByRef`  `_openVerseFromLink`
`_outcomeText`  `_parseCsv`  `_parseVDate`  `_populateMorningTimePickers`  `_propBooks`  `_propHiList`
`_propHiPick`  `_propRefs`  `_propRowsToItems`  `_psIsDefault`  `_psOverlay`  `_psProject`
`_PT_FAMS`  `_ptBag`  `_ptDrawnLines`  `_ptEnsureFont`  `_ptFont`  `_ptFontFor`
`_ptFontLoaded`  `_ptFontPending`  `_ptFontsOn`  `_ptGroupInit`  `_ptLen`  `_ptLineK`
`_ptLinkGoogle`  `_ptMissing`  `_ptSample`  `_ptSplitOnce`  `_ptStillTrying`  `_ptSyncFontUI`
`_ptWarmup`  `_ptWrapTitle`  `_publishSharedColl`  `_pushKey`  `_pushKeyPid`  `_reactKey`
`_reactKeyParts`  `_reactWithToast`  `_readPendingVerse`  `_reassignTimedEvents`  `_recoverySummary`  `_refDigitsPad`
`_refKey`  `_refNorm`  `_releasePushTokenIfIdle`  `_renderBookList`  `_renderGroupList`  `_renderKeepPicker`
`_renderKeepSubMenu`  `_renderKeepSwitch`  `_renderMemHistoryDash`  `_renderMemHistoryList`  `_renderMonthTitleFormatBtns`  `_renderPickerInto`
`_renderSecPick`  `_renderSharePreview`  `_renderThemePicker`  `_renderThemeSummary`  `_renderUiLevelIcons`  `_renderVAggBody`
`_renderVerseUiLevelIcons`  `_renderVfSecAssign`  `_renderVfThemeChips`  `_rewriteLogRefs`  `_rgba`  `_rollFit`
`_rollHTML`  `_rollIdx`  `_rollNoTr`  `_rollSecLabel`  `_rollShow`  `_rollStart`
`_rollTick`  `_rowsToItems`  `_rpAddBtnHTML`  `_rpAttachChipDrag`  `_rpAttachHeaderDrag`  `_rpAttachSwipes`
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
`_tagartOn`  `_tagartPick`  `_tagartStyle`  `_tagartSvg`  `_tagartSwatchSvg`  `_thAcPush`
`_thAcText`  `_thContrast`  `_thDeltaE`  `_themePreviewHTML`  `_themeSummaryText`  `_themeTokens`
`_thFade`  `_thHex`  `_thLab`  `_thLabF`  `_thLabFi`  `_thLabRgb`
`_thLin`  `_thLum`  `_thMix`  `_thOn`  `_thPanelMix`  `_thReadable`
`_thRgb`  `_thRgba`  `_thRound`  `_thTintDE`  `_thTintK`  `_thUnlin`
`_thWorst`  `_timeStep`  `_toastWithJump`  `_toThisMonth`  `_tryCloseLogoMenu`  `_tsFine`
`_tsNearest`  `_tsPinchArm`  `_tsPinchBusy`  `_tsTouchDist`  `_uiLvIconSVG`  `_uiScaleGet`
`_uiScaleSliderPaint`  `_updateCfAllCount`  `_updateDragHintBounds`  `_vAggSyncKeepTitle`  `_vcAll`  `_vcApplyNav`
`_vcAttachGestures`  `_vcAutoAnchors`  `_vcAutoChanged`  `_vcAutoMin`  `_vcAutoOffset`  `_vcAutoOn`
`_vcAutoResetAnchors`  `_vcAutoSaveAnchors`  `_vcAutoSetAnchor`  `_vcAutoSlide`  `_vcAutoSlot`  `_vcAutoStart`
`_vcAutoTick`  `_vcCardHTML`  `_vcCreate`  `_vcCurrent`  `_vcCurX`  `_vcFilterLabel`
`_vcGet`  `_vcGroupOf`  `_vcGroupOn`  `_vcHash`  `_vcHeadMode`  `_vcHiSplit`
`_vcIdOf`  `_vcIs`  `_vcKeyOf`  `_vcLayoutAll`  `_vcLayoutOne`  `_vcListHTML`
`_vcListItems`  `_vcNewId`  `_vcPatternKey`  `_vcReactKeyOf`  `_vcRemove`  `_vcRollMode`
`_vcRollOpt`  `_vcRollSec`  `_vcScope`  `_vcScopeBtnHTML`  `_vcScopeCount`  `_vcScopeIcon`
`_vcScopeIsHome`  `_vcScopeKey`  `_vcScopeLabel`  `_vcScopeParts`  `_vcShow`  `_vcShowFor`
`_vcSlideCommit`  `_vcSlideEl`  `_vcSyncCounts`  `_vcSyncKind`  `_vcTextScale`  `_vcThemeVars`
`_vcUnplacedForKind`  `_vcVerseOf`  `_vcVerses`  `_vcView`  `_vDashAxisLabel`  `_vDashBuckets`
`_vDashCellHTML`  `_vDashDetailDotsHTML`  `_vDashDetailGo`  `_vDashDetailKey`  `_vDashDetailSlide`  `_vDashEntries`
`_vDashHomeAgg`  `_vDashIsPlaceholder`  `_vDashKeyCmp`  `_vDashKeysOf`  `_vDashKindLabel`  `_vDashMarkReturn`
`_vDashMaybeReturn`  `_vDashPeriodBtnsHTML`  `_vDashPieDetailSVG`  `_vDashPieSVG`  `_vDashPref`  `_vDashQ`
`_vDashRefLabel`  `_vDashRowHeadHTML`  `_vDashScope`  `_vDashScopeCtlHTML`  `_vDashSlices`  `_vDashVerse`
`_vDashView`  `_vDashViewTabsHTML`  `_vDashWinEntries`  `_verCmp`  `_verNums`  `_verseBarModeFlip`
`_verseBarSlideNav`  `_verseEventCount`  `_verseFullIsOpen`  `_verseFullRender`  `_verseIdentity`  `_verseIdxForSec`
`_verseRefFromUrl`  `_verseSettingsOpen`  `_vfAdvStart`  `_vfApplyAdvRule`  `_vfApplyClauseRule`  `_vfApplyObjRule`
`_vfApplyParallelRule`  `_vfApplyPropAlign`  `_vfArtRecheck`  `_vfArtSyncUI`  `_vfAtCollection`  `_vfBg1Css`
`_vfBgCss`  `_vfBottomEl`  `_vfBreakClass`  `_vfCanBreakAt`  `_vfClauseStart`  `_vfClearNav`
`_vfCurrentVerse`  `_vfCycleMode`  `_vfDeeperRefs`  `_vfDemoteShortForced`  `_vfDoubleLike`  `_vfEnsureFont`
`_vfFixWidow`  `_vfGeException`  `_vfHeartBurst`  `_vfHideCovers`  `_vfHideCoversNow`  `_vfHomeStash`
`_vfIsHeotdoeException`  `_vfIsParallelWord`  `_vfIsProp`  `_vfIsSubject`  `_vfKeepNav`  `_vfKeepSortHead`
`_vfLayoutIfResized`  `_vfLayoutPropText`  `_vfLayoutText`  `_vfNavCommit`  `_vfObjStart`  `_vfObjTailLen`
`_vfPairKeep`  `_vfParallelRuns`  `_vfPatternKey`  `_vfPatternPool`  `_vfPlaceTagArt`  `_vfPropInk`
`_vfReadWrappedLines`  `_vfRedrawPropInk`  `_vfRelayoutSoon`  `_vfRenderCard`  `_vfRenderKeepSwitch`  `_vfRenderPropTitle`
`_vfRenderRef`  `_vfRenderTagArt`  `_vfRollProp`  `_vfRollVariant`  `_vfSecIdNow`  `_vfSelectedPatterns`
`_vfSetNav`  `_vfShareImage`  `_vfShareSizeRow`  `_vfShareText`  `_vfShortOK`  `_vfShufGo`
`_vfShufPickRandom`  `_vfShufPos`  `_vfShufPush`  `_vfShufReset`  `_vfSizePropTitle`  `_vfSkipsForced`
`_vfSyncCounts`  `_vfSyncCycleIcon`  `_vfSyncPageBg`  `_vfSyncTopBar`  `_vfTextScale`  `_vfTheme`
`_vfWrapFit`  `_vgAxisItems`  `_vgAxisLabel`  `_vgBookOne`  `_vgDate`  `_vgEscAttr`
`_vgExclAxisNow`  `_vgExclKeys`  `_vgExclMax`  `_vgExclOn`  `_vgFamily`  `_vgFilteredPool`
`_vgFilterLabelText`  `_vgFlatPresets`  `_vgGroupKey`  `_vgGroupLabel`  `_vgHighlightTile`  `_vgHomeLabel`
`_vgIsOpen`  `_vgMatch`  `_vgOpenFromReels`  `_vgOpenFromRef`  `_vgPinchSteps`  `_vgRawPool`
`_vgRenderTabs`  `_vgRestoreHighlight`  `_vgScrollToVerse`  `_vgSetCols`  `_vgShortRef`  `_vgSort`
`_vgSyncExcl`  `_vgSyncFilterLabel`  `_vgSyncSortUI`  `_vgSyncTagSettingsUI`  `_vgTab`  `_vgTileHtml`
`_vgTilePreset`  `_vgTileStyle`  `_vlApplySort`  `_vlClearRegIdx`  `_vlDispRef`  `_vlEntriesForScope`
`_vlExtraSortFor`  `_vlHomeEntries`  `_vLinkAxis`  `_vliOpenFull`  `_vliOpenFullForWidget`  `_vlIsProp`
`_vListControlsHTML`  `_vListRange`  `_vListRefresh`  `_vListRowsHTML`  `_vlKeepEntries`  `_vlKindEntries`
`_vlPref`  `_vlReactTotals`  `_vlRegIdx`  `_vlTab`  `_vlTabsHTML`  `_vlwKey`
`_vMapCellHTML`  `_vMapInk`  `_vMapMode`  `_vMapShade`  `_vMapStats`  `_vMapStep`
`_vmmSyncFirstItem`  `_vpDiagCopyFallback`  `_vpDiagFmt`  `_vpDiagHead`  `_vpEveryLabel`  `_vpSave`
`_vpToMin`  `_vpTurnOn`  `_vRhyWeeks`  `_vsetFlashTab`  `_vsetGoColl`  `_vsetGoTab`
`_vsetRestoreBack`  `_vstabList`  `_vTrBindBand`  `_vTrBindRails`  `_vTrBucketLabel`  `_vTrBucketList`
`_vTrBucketOf`  `_vTrChapCmp`  `_vTrChapNo`  `_vTrChapterKeys`  `_vTrChartSVG`  `_vTrChipsHTML`
`_vTrData`  `_vTrDiffHTML`  `_vTrEntries`  `_vTrFindings`  `_vTrFindingsHTML`  `_vTrGeo`
`_vTrHFromX`  `_vTrInsightHTML`  `_vTrInsMax`  `_vTrInsN`  `_vTrJosaGa`  `_vTrNameCmp`
`_vTrOtherSpan`  `_vTrPref`  `_vTrRailBind`  `_vTrRailHTML`  `_vTrRowHTML`  `_vTrRowsOf`
`_vTrSort`  `_vTrSortRows`  `_vTrSpan`  `_vTrSpanRowHTML`  `_vTrTheadHTML`  `_vTrUnitWord`
`_vWeeksSince`  `_vwKeepSortHTML`  `_vwScopeBindHold`  `_vwScopeOpts`  `_vwSize`  `_wireTaskMenuDateRow`
`_withFullscreenLayout`  `_withOutcome`  `_withTimeout`  `_wkPaneActive`  `_wkVerseMarksHTML`  `A`
`a`  `ab`  `act`  `activateItem`  `ACTIVE_TOTAL`  `ACTIVE_VERSES`
`add`  `addCustomSuffix`  `addCustomVerseFromForm`  `addDays`  `addNewCollection`  `addNewSection`
`addVerseAlarmCustomTime`  `ALL_VERSES`  `anchor`  `appConfirm`  `appendMarkerFilterBtn`  `applyPreset`
`applyRemoteState`  `applySectionConfig`  `applySnapshot`  `applyTheme`  `applyThemeVars`  `applyUiLevel`
`applyUiScale`  `applyUiScaleNow`  `applyVerseUiLevel`  `applyVfTheme`  `arr`  `assigned`
`attach`  `attachDrag`  `attachEventChipInteraction`  `attachFastTap`  `attachHdSwipe`  `attachPullToToday`
`attachRepeatBtnInteraction`  `attachSecRowDrag`  `authErrorMessage`  `authSetLoading`  `authSignOut`  `authSubmit`
`authToggleMode`  `auto`  `autoSizeInput`  `away`  `b`  `barRef`
`barTags`  `base`  `beforeBlock`  `beforeSave`  `begin`  `bindHold`
`body`  `bodyEl`  `book`  `build`  `buildBackupFilename`  `buildFlatList`
`buildLanes`  `bump`  `bw`  `byName`  `C`  `c`
`cancelDragKeepingItem`  `cancelMousePress`  `cancelPressTimer`  `card`  `ceAddGoogleLink`  `ceCloseDeletePopup`
`ceCloseTrash`  `ceDeleteSelected`  `ceImportGoogleLink`  `cellTodoSave`  `ceMoveTrash`  `ceOpenDeletePopup`
`ceOpenTrash`  `ceRemoveGoogleLink`  `ceRestoreSelected`  `ceSelectMethod`  `ceSetSort`  `ceToggleFilter`
`ceToggleGoogleAuto`  `cfChoose`  `cfMergeAll`  `cfRender`  `cfToggleRaw`  `chap`
`checkDataRecovery`  `checkVerseAlarm`  `chip`  `chM`  `clamp`  `cleanupEmptyDays`
`clear`  `clearActive`  `clearContactForm`  `clearDropIndicators`  `clearPaint`  `clearTrash`
`closeAccountSensitiveModals`  `closeCellTodo`  `closeCollAddMenu`  `closeCollEdit`  `closeCollMenu`  `closeContactMenu`
`closeContactsModal`  `closeContactTasksPopup`  `closeDatePicker`  `closeEventEditMenu`  `closeEventModal`  `closeHdrCalendar`
`closeInlineInput`  `closeKeepPicker`  `closeKeepRowMenu`  `closeKeepSwitch`  `closeLogoMenu`  `closeMemorizationHistory`
`closeMemRecPopup`  `closeRepeatSubPicker`  `closeRpConfig`  `closeSecDelModal`  `closeSettings`  `closeSettingsOnBg`
`closeSfxMenu`  `closeShareDialog`  `closeSmGhost`  `closeSubscribeDialog`  `closeSyncConflicts`  `closeTaskMenu`
`closeTaskMenu_keepCtx`  `closeThemePicker`  `closeTrash`  `closeVcSettings`  `closeVDashDetail`  `closeVerseAggPopup`
`closeVerseAlarmCustomTimePopup`  `closeVerseDashboard`  `closeVerseFull`  `closeVerseGrid`  `closeVerseListModal`  `closeVerseMemMenu`
`closeVerseMemMenuFromOverlay`  `closeVersePopup`  `closeVerseSettingsModal`  `closeVfDeeperPicker`  `closeVfKeepSwitch`  `closeVfShare`
`closeVliMenu`  `closeVliMenuFromOverlay`  `closeVwScope`  `cnt`  `code`  `col`
`collAddAction`  `collMenuAction`  `color`  `commit`  `confirmDatePicker`  `CONTACT_PICKER_SUPPORTED`
`contactAction`  `contactBadgeCountChanged`  `copy`  `core`  `cur`  `currentMatchingPresetName`
`currentViewKey`  `curSecId`  `cx`  `damp`  `dayOfYearVerseIdx`  `days`
`daysFromToday`  `deeperN`  `defaultState`  `defIds`  `deleteCollection`  `deleteEventFromMenu`
`deleteLatestVerseEvent`  `deleteSection`  `deleteSectionConfig`  `devInboxDelete`  `devInboxLoad`  `devInboxRefreshBadge`
`devInboxToggleAll`  `devInboxUpdateBadge`  `devNoteHandleFile`  `devNoteSend`  `devNoteToggle`  `devTrashDelete`
`devTrashEmpty`  `devTrashRender`  `devTrashToggle`  `dir`  `done`  `doRedo`
`doSubscribe`  `doUndo`  `download`  `draw`  `dropDrag`  `dropSecArchive`
`dup`  `duplicateTaskTo`  `duplicateTaskToPickedDate`  `editContact`  `editEventFromMenu`  `el`
`email`  `emailTag`  `endDrag`  `endPinch`  `enough`  `ensureDailyRepeats`
`esc`  `evenN`  `eventOccursOnOwnDate`  `eventRepeatsOnDate`  `exportBackup`  `f`
`fam`  `fbForceUploadLocal`  `fbPushState`  `fbStartListening`  `fill`  `findColl`
`findFlatIndex`  `findLaneIndex`  `findMentionedContacts`  `finish`  `first`  `fit`
`focusItemInput`  `form`  `formatEventTime`  `getActiveColls`  `getBigs`  `getCarryCount`
`getChips`  `getContainer`  `getCustomVerses`  `getDay`  `getDayFadeClass`  `getDeeperLog`
`getDisplayEvents`  `getDOW`  `getDropTarget`  `getEvenDeeperLog`  `getEvents`  `getKeepLog`
`getLikeLog`  `getMemLog`  `getMemorizationsForDate`  `getMemorizationsForSection`  `getRowEl`  `getSecColor`
`getShareLog`  `getSmalls`  `getStableDt`  `getTasksTaggedWithContact`  `getTrack`  `getTrash`
`getVerseAlarm`  `getVerseByIdx`  `getVerseCollections`  `getVersePoolVerses`  `getVersePush`  `getWeekFadeClass`
`getWraps`  `gid`  `go`  `goToDate`  `grid`  `hdrCalGoToday`
`hdrCalNav`  `hdrCalPick`  `hh`  `hideBusyToast`  `hit`  `hmBtn`
`home`  `importBackup`  `importFromFile`  `initAppUI`  `initCrossViewSwipe`  `initDateSwipe`
`initForegroundPush`  `initMonthlySwipe`  `initTopDateSwipe`  `initWeeklySwipe`  `inner0`  `inspectRecoveryDate`
`IS_TOUCH`  `isAnyInputFocused`  `isCollActive`  `isDark`  `isExcluded`  `isNowWithinSection`
`isOver`  `isSwipeZone`  `isToday`  `isTouch`  `itemKey`  `j`
`K`  `k`  `keep`  `keepPickNew`  `keepPickToggle`  `keepRowDelete`
`keepRowEdit`  `keepSetSort`  `keepTogglePairSort`  `key`  `L`  `l`
`l0`  `laterLocal`  `laySetBp`  `laySetWeekly`  `left`  `likeN`
`limit`  `list`  `lo`  `load`  `logicalNow`  `logoMenuBackToMain`
`logoMenuNextVerse`  `logoMenuOpenKeepSub`  `logoMenuOpenListSub`  `logoMenuPrevVerse`  `logoMenuRandomVerse`  `logoMenuToggleVerse`
`loose`  `LS_KEY`  `m`  `makeBigGhost`  `makeBigItem`  `makeBigWrap`
`makeContactBadges`  `makePresetChip`  `makeSmInlineGhost`  `makeSmItem`  `makeSmWrap`  `makeSwipeWrap`
`manuallyCollapsed`  `map`  `markOf`  `me`  `measure`  `mergeDuplicateVerses`
`mine`  `mk`  `mkBtn`  `mkDate`  `mode`  `monthLabel`
`monthTitleHTML`  `moveActiveItems`  `moveActiveItemsAcrossSection`  `moveActiveSelection`  `moved`  `moveDrag`
`moveG`  `moveTaskTo`  `moveTaskToPickedDate`  `ms`  `N`  `n`
`n0`  `name`  `nameTx`  `navigateDate`  `navigateWeek`  `needTemp`
`next`  `nextVerseManual`  `now`  `offTest`  `on`  `onCancel`
`onDown`  `onEnd`  `onEventDateChange`  `onEventTimeToggle`  `onMove`  `onNotifyMasterToggle`
`onStart`  `onTouchEnd`  `onTouchMove`  `onTouchStart`  `onUp`  `onVerseAlarmToggle`
`onVerseBarClick`  `onVerseMemRecord`  `openCellInput`  `openCollAddMenu`  `openCollEdit`  `openCollMenu`
`openContactMenu`  `openContactsModal`  `openDeeperFromRef`  `openEvenDeeperFromRef`  `openEventEditMenu`  `openEventModal`
`openEventModalForDate`  `openHdrCalendar`  `openInlineInput`  `openKeepListPopup`  `openKeepPicker`  `openKeepRowMenu`
`openLogoMenu`  `openMemorizationHistory`  `openMenuForThis`  `openRepeatSubPicker`  `openRpConfig`  `openSettings`
`openSfxMenu`  `openShareDialog`  `openSmGhost`  `openSubscribeDialog`  `openSyncConflicts`  `openTaskMenu`
`openThemePicker`  `openTrash`  `openVcCollSettings`  `openVcSettings`  `openVerseAggPopup`  `openVerseAlarmCustomTimePopup`
`openVerseCollSettings`  `openVerseDashboard`  `openVerseFull`  `openVerseGrid`  `openVerseGridHome`  `openVerseListModal`
`openVerseMemMenu`  `openVerseSettingsFromMenu`  `openVerseSettingsModal`  `openVfDeeper`  `openVfShare`  `openVfShareFor`
`openVliMenu`  `openVwScope`  `org`  `out`  `overflows`  `p`
`pad`  `padH`  `padV`  `paint`  `paintAppUIFromLocal`  `pairKey`
`pairOn`  `parseItemKey`  `pcEl`  `pct`  `perBtn`  `phone`
`pick`  `pickContainer`  `pickFromDeviceContacts`  `pickVfDeeper`  `place`  `pool`
`populateCarryBadge`  `portrait`  `prepDatePicker`  `prepDupDatePicker`  `prepTaskMenuDatePicker`  `prev`
`prevOff`  `prevVerseManual`  `put`  `putText`  `randomVerseManual`  `raw`
`rawSave`  `recent`  `recheck`  `recheckBurst`  `recordMemorization`  `recordMemorizationByRef`
`recordVerseDeeper`  `recordVerseEvenDeeper`  `recordVerseLike`  `recordVerseShare`  `ref`  `refH`
`refLine`  `refOnly`  `refreshActiveVisuals`  `refreshNotifyUI`  `refreshTaskViewsLive`  `refreshVerseMarksLive`
`refs`  `removeCustomSuffix`  `removeVerseAlarmCustomTime`  `renameCurrentColl`  `renameCustomSuffix`  `renderAddRow`
`renderCeGoogleList`  `renderCeTrash`  `renderCeVerseList`  `renderCollButtons`  `renderCollFilterPanels`  `renderContactsList`
`renderLayout`  `renderMonthly`  `renderPresetList`  `renderRepeatButtons`  `renderRpConfigList`  `renderSecArchive`
`renderSecBody`  `renderSecEvents`  `renderSecs`  `renderSectionConfigList`  `renderSectionEditor`  `renderSettingsPanel`
`renderSmList`  `renderSubButtons`  `renderSuffixPickers`  `renderTaskTextHTML`  `renderToday`  `renderTrashList`
`renderVcSettings`  `renderVDashLink`  `renderVDashMap`  `renderVDashRhythm`  `renderVDashTrend`  `renderVerseAlarmCustomList`
`renderVerseAlarmSettings`  `renderVerseBar`  `renderVerseDashboard`  `renderVerseGrid`  `renderVerseListCatRow`  `renderVerseListPies`
`renderVerseListResults`  `renderVerseSettingsModal`  `renderVwScope`  `renderWeekly`  `repeat`  `resetStateToDefaults`
`resizeAllInputs`  `resolveTarget`  `resolveTargetIdx`  `restoreAutoBackup`  `restoreFromTrash`  `restoreSecArchive`
`rmBtn`  `rot`  `row`  `rowsOf`  `rpChMonth`  `rs`
`runAutoCarryOver`  `runCarryNow`  `runSharedCollSync`  `runVerseSheetAutoSync`  `s`  `safe`
`save`  `saveCurrentSectionConfig`  `saveText`  `SC`  `scheduleVerseAlarms`  `scopeTxt`
`scrollActiveIntoView`  `scrollFlatIdxIntoView`  `sec`  `secDelDo`  `secHasEvent`  `secHasPendingTodo`
`secId`  `secName`  `sel`  `sendTestPush`  `sendToTrash`  `setActiveSingle`
`setCarryScope`  `setCnt`  `setDeviceNotify`  `setEventTimeToggle`  `setLayFormMode`  `setLinkOpenMode`
`setNotifySuffix`  `setShareSize`  `setText`  `setTimeStep`  `settle`  `setTxtRefBracket`
`setTxtRefPos`  `setTxtRefStyle`  `setUiLevel`  `setUiLevelIconSet`  `setupCrossViewSwipeZones`  `setVcAuto`
`setVcAutoMin`  `setVcHeadMode`  `setVcRollMode`  `setVcRollSec`  `setVcShow`  `setVcShowAll`
`setVcTextScale`  `setVcTheme`  `setVerseCountScope`  `setVerseIdx`  `setVersePush`  `setVersePushInterval`
`setVerseSneakMaxW`  `setVerseSneakStyle`  `setVerseUiLevel`  `setVfArtStyle`  `setVfTextScale`  `setWMViewMode`
`sfxMenuAction`  `shareCopyCode`  `shareSizeOf`  `shareVia`  `showAutoBackups`  `showBusyToast`
`showContactTasksPopup`  `showDropIndicator`  `showMemorizationPopup`  `shown`  `showReactionToast`  `showToast`
`showVersePopup`  `side`  `slide`  `snapBack`  `snapshot`  `solve`
`sortBtn`  `sortEventsByTime`  `span`  `src`  `start`  `startDrag`
`startEditContact`  `stepHiOverlap`  `stepHiStarMax`  `stopLt`  `stopTimer`  `strip`
`submitContact`  `submitEventModal`  `sum`  `sw`  `switchSettingsTab`  `switchToViewIndex`
`switchVerseSettingsTab`  `swKeepSet`  `swRow`  `swTitle`  `swToggleEdit`  `swToggleHome`
`swToggleKeep`  `syncP`  `syncRollDisplays`  `syncSecsFromState`  `syncVis`  `tab`
`tags`  `taskMarkerFilterPass`  `testAutoCarryOver`  `testLocalNotification`  `testVerseClickPath`  `text`
`themeById`  `themeChip`  `themePickerApply`  `themePickerGroup`  `themePickerPick`  `tilt`
`tKey`  `to`  `todayKey`  `toggleColl`  `toggleDailyRepeat`  `toggleEventDaily`
`toggleEventWeekly`  `toggleHiMark`  `toggleImgIncl`  `toggleKeepSwitch`  `togglePropTitleFont`  `togglePropTitleGroup`
`togglePropTitleGroupOpen`  `toggleSectionExclude`  `toggleStarSection`  `toggleTaskContact`  `toggleTaskFlag`  `toggleTxtIncl`
`toggleVerseAlarmContent`  `toggleVerseBarOn`  `toggleVfArt`  `toggleVfKeepSwitch`  `toggleVfPattern`  `toggleVfSecPattern`
`topic`  `totalActive`  `totalBigCount`  `touch`  `trashBgClick`  `uiLevel`
`uiLevelIconSet`  `uiScaleSet`  `uiScaleSlideCommit`  `uiScaleSlideInput`  `unit`  `up`
`updateHeaderDate`  `updateNotifySub`  `updateSecSummary`  `updateSectionBoundary`  `updateSectionField`  `updateSetting`
`updateSmCnt`  `updateTotal`  `updateTrashBadge`  `updateUrBtns`  `url`  `userDocRef`
`v`  `vbShuffleVerse`  `vcAct`  `vcAddCard`  `vcClearFilter`  `vcNav`
`vcOpenFilter`  `vcOpenFull`  `vcRollSecInput`  `vcSetTextScaleLive`  `vcSetView`  `vcStepTextScale`
`vcToggleView`  `vDashMapPick`  `vDashOpenCollSettings`  `vDashOpenDetail`  `vDashOpenFilter`  `vDashOpenVerse`
`vDashSetCustom`  `vDashSetMapAll`  `vDashSetPeriod`  `vDashSetView`  `VERSE_TOTAL`  `verseByRef`
`verseForEntry`  `verseFullNav`  `verses`  `verseSyncAllNow`  `verseUiLevel`  `vfAct`
`vfCatTap`  `vfCopyBodyOnly`  `vfHomeAction`  `vfOpenCollSettings`  `vfOpenKeepGrid`  `vfOpenKeepList`
`vfOpenSheetForCat`  `vfShareBg`  `vfShareDo`  `vfToggleCycleMode`  `vgPick`  `vgPickAxis`
`vgSetBibleSort`  `vgSetTab`  `vgStepTagExcl`  `vgStepTileExcl`  `vgTapDateSort`  `vgToggleExpand`
`vgToggleGroup`  `vgToggleTagExcl`  `vgToggleTileExcl`  `vis`  `vliAction`  `vlSetCustom`
`vlSetPeriod`  `vlSetSort`  `vlSetTab`  `vlToggleCtrl`  `vlTogglePairSort`  `vlwSetCustom`
`vlwSetPeriod`  `vlwSetSort`  `vlwTogglePairSort`  `vpAddTime`  `vpDelTime`  `vpDiagClear`
`vpDiagCopy`  `vpDiagRender`  `vpDiagToggle`  `vpSetTime`  `vpToggleDay`  `vrs`
`vTrCloseBook`  `vTrInsSet`  `vTrOpenBook`  `vTrSet`  `vTrSortBy`  `vTrSpanSet`
`vTrToggleExp`  `vTrToggleSeries`  `vw`  `vwScopeClearFilter`  `vwScopeCollSettings`  `vwScopePick`
`vwScopeToggleMode`  `W`  `want`  `wasOpen`  `weekOffsetLabel`  `weekOfMonth`
`weeksFromToday`  `wireActivateClick`  `words`  `x`  `y`  `yOf`
`z`

