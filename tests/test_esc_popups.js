// ESC 로 팝업·메뉴 닫기 + ⌘/ 단축키 표 — v26-1007-2 (HB 요청 2026-10-07)
//
// "모든 팝업이나 메뉴들은 ESC 로 이전 화면 혹은 닫기로. 예: 할일 메모 팝업은 ESC 로 안 닫힌다."
//
// 병의 뿌리: 공용 ESC 맨 앞의 "글자를 입력하는 중이면 비켜선다" 가드가 **팝업 안의 입력칸**까지
// 막았다. 메모창은 열자마자 textarea 에 커서를 주므로 언제나 걸렸다.
//
// 이 테스트가 지키는 것
//  ① 팝업 **안**의 입력칸에서도 ESC 가 팝업을 닫는다
//  ⭐② 팝업 **밖**의 입력칸(인라인 할일 편집)은 예전 그대로 제 ESC 를 쓴다 — 건드리지 않는다
//  ⭐③ 자체 ESC 를 가진 칸(preventDefault)은 두 번 처리되지 않는다
//   ④ 한글 조합 중의 ESC 는 팝업을 닫지 않는다 (조합 취소다)
//   ⑤ 공용 확인창의 ESC 는 '취소' — 확인(onYes)은 절대 안 부른다
//   ⑥ 하위 단계가 있는 것은 한 단계 뒤로 먼저
//   ⑦ ESC = ×  (말씀 설정창이 ×와 다른 길이었다)
//   ⑧ ⌘/ 로 단축키 표를 여닫는다
const { sliceDev, SRC_DEV, makeScorer } = require('./_load');
const sc = makeScorer();

// ── 가짜 DOM ─────────────────────────────────────────────
const LOG = [];
function mkEl(id, z, inputs){
  const e = { id, _shown:false, _z:String(z), children:[], style:{},
    contains(n){ return n===this || this.children.includes(n); },
    getClientRects(){ return this._shown ? [{}] : []; } };
  (inputs||[]).forEach(i => { i.parent=e; e.children.push(i); });
  return e;
}
const EL = {};
function reg(e){ EL[e.id]=e; return e; }
global.document = {
  getElementById: id => EL[id] || null,
  addEventListener: (type, fn, cap) => { LISTENERS.push({type, fn, cap:!!cap}); },
  querySelector: () => null,
};
const LISTENERS = [];
global.getComputedStyle = el => ({ zIndex: el._z, visibility:'visible' });
global.window = { addEventListener(){}, matchMedia: ()=>({matches:false}) };

// ── 닫기 함수들: 불렸다는 기록만 남긴다 ─────────────────
const closers = [
  'closeEventEditMenu','closeContactMenu','closeSubRowMenu','closeMemoActMenu','closeCollAddMenu',
  'closeCollMenu','closeSfxMenu','closeVliMenu','closeVerseMemMenu','closeRepeatSubPicker','closeRepScope',
  'closeVPair','closeSyncConflicts','closePlusList','closeSyncResultModal','closeVerseAlarmCustomTimePopup',
  'closeContactsModal','closeCellTodo','closeGroupDialog','closeSubscribeDialog','closeShareDialog',
  'closeHdrCalendar','closeVDashDetail','closeVerseDashboard','closeVerseAggPopup','closeVfDeeperPicker',
  'closeKeepPicker','closeKeepRowMenu','closeVcSettings','closeVwScope','closeRpConfig','closeCollEdit',
  'closeVfShare','closeMemorizationHistory','closeMemRecPopup','closeVersePopup','closeContactTasksPopup',
  'closeEventModal','closeSecDelModal','closeThemePicker','closeSettings','closeVerseListModal','closeTrash',
  'closeThere','closeVerseGrid','closeVerseFull','closeSwKbHelp','closeLogoMenu','closeTaskMenu',
  'ceCloseDeletePopup','closeVerseSettingsModal'];
closers.forEach(n => { global[n] = () => LOG.push(n); });
global.closeTaskMemo = () => LOG.push('closeTaskMemo');
global._secPickSpec = null; global._secPickBack = () => LOG.push('_secPickBack');
global._brEsc = () => LOG.push('_brEsc'); global._brIsOpen = () => false;
global._thereIsOpen = () => false;
let YES = 0;
global._appConfirmCb = () => { YES++; };
global._appConfirmResolve = ok => { LOG.push('confirm:'+ok); if(ok) YES++; };

// ── 진짜 소스 떠오기: ESC 표 · 공용 ESC 핸들러 · 도우미들 ──
eval(sliceDev('const _ESC_CLOSERS=[', 'function _escShown(').replace(/^const /m,'var '));
function _escShown(el){ return el.getClientRects().length>0; }
eval(sliceDev('function _kbOverlayOpen(', "document.addEventListener('keydown'"));
// 공용 ESC 핸들러 (이름 없는 리스너라 떠다가 등록 함수를 가로챈다)
const _escSrc = sliceDev("document.addEventListener('keydown',e=>{\n  if(e.key!=='Escape'||e.defaultPrevented)return;",
                         '// 대시보드 상세 팝업');
eval(_escSrc);
const ESC_HANDLER = LISTENERS.filter(l => l.type==='keydown').pop().fn;
// 로고 메뉴 · keepSwitch 도우미
let SUB_OPEN = false, KEEP_ON = false, BACKS = 0;
global.logoMenuBackToMain = () => { BACKS++; SUB_OPEN=false; LOG.push('logoBack'); };
eval(sliceDev('function _logoMenuEsc(', 'function _tryCloseLogoMenu'));
eval(sliceDev('function _keepSwitchIsOpen(', 'function closeKeepSwitch'));
global.closeKeepSwitch = () => { KEEP_ON=false; LOG.push('closeKeepSwitch'); };
// ⌘/ 도우미 — 등록되는 캡처 리스너까지 함께 떠온다
let HELP_OPEN = false;
global._swKbHelpOpen = () => HELP_OPEN;
global.openSwKbHelp = () => { HELP_OPEN = true; LOG.push('openHelp'); };
const _helpSrc = sliceDev('function _kbHelpKey(', 'function openSwKbHelp(){');
eval(_helpSrc);
const HELP_HANDLER = LISTENERS.filter(l => l.type==='keydown' && l.cap).pop().fn;

// ── 장면 ─────────────────────────────────────────────────
function scene(){
  Object.keys(EL).forEach(k => delete EL[k]);
  LOG.length = 0; YES = 0; BACKS = 0; SUB_OPEN=false; KEEP_ON=false; HELP_OPEN=false;
  // 실제 z-index 를 쓴다 (index.html 의 인라인 값)
  reg(mkEl('taskMemoModal', 5201, [{tagName:'TEXTAREA'}]));
  reg(mkEl('memoActMenu', 5300));
  reg(mkEl('eventModal', 300, [{tagName:'INPUT'}]));
  reg(mkEl('appConfirmModal', 4450));
  reg(mkEl('ceDeletePopup', 4410));
  reg(mkEl('logoMenu', 199));
  reg(mkEl('vAggModal', 4360));
  reg(mkEl('verseSettingsOverlay', 4000));
  reg(mkEl('cellTodoModal', 4500, [{tagName:'INPUT'}]));
  EL.logoMenuListSub = mkEl('logoMenuListSub', 0);
  EL.logoMenuKeepSub = mkEl('logoMenuKeepSub', 0);
  EL.keepSwitchBox = { style:{display:'block'}, classList:{contains:c=>c==='on'&&KEEP_ON} };
}
const OUTSIDE = { tagName:'INPUT', parent:null };     // 팝업 밖의 입력칸(인라인 할일 등)
function esc(target, extra){
  const ev = Object.assign({ key:'Escape', target:target||null, defaultPrevented:false,
    isComposing:false, keyCode:27, _prevented:0, _stopped:0,
    preventDefault(){ this._prevented++; this.defaultPrevented=true; },
    stopImmediatePropagation(){ this._stopped++; } }, extra||{});
  ESC_HANDLER(ev);
  return ev;
}
const memoTa = () => EL.taskMemoModal.children[0];

// ═══ 1. 팝업 안의 입력칸에서도 닫힌다 ═══
console.log('시나리오 1 — 팝업 안의 입력칸에서 ESC');
{
  scene(); EL.taskMemoModal._shown = true;
  const ev = esc(memoTa());
  sc.eq('⭐ 메모창 — textarea 에 커서가 있어도 ESC 로 닫힌다', LOG, ['closeTaskMemo']);
  sc.eq('브라우저 기본 동작은 막는다', ev._prevented, 1);
  sc.eq('아래 옛 ESC 처리와 겹치지 않게 전파를 끊는다', ev._stopped, 1);

  scene(); EL.eventModal._shown = true;
  esc(EL.eventModal.children[0]);
  sc.eq('일정 팝업 — 입력칸에서도 닫힌다', LOG, ['closeEventModal']);

  // 글자를 치지 않는 때(버튼 등)는 예전과 같다
  scene(); EL.taskMemoModal._shown = true;
  esc({ tagName:'BUTTON' });
  sc.eq('입력칸이 아닌 곳에서도 닫힌다 (예전 그대로)', LOG, ['closeTaskMemo']);
}

// ═══ 2. ⭐ 팝업 밖의 입력칸은 건드리지 않는다 ═══
console.log('\n시나리오 2 — ⭐ 인라인 편집(팝업 밖)은 예전 그대로');
{
  scene();   // 열린 팝업이 하나도 없다
  const ev = esc(OUTSIDE);
  sc.eq('팝업이 없으면 아무것도 안 한다', [LOG.length, ev._prevented], [0, 0]);

  // 팝업이 하나 떠 있어도, 그 **밖**에서 글자를 치고 있으면 그 칸의 ESC 가 먼저다
  scene(); EL.taskMemoModal._shown = true;
  const ev2 = esc(OUTSIDE);
  sc.eq('⭐ 팝업 밖의 입력칸 — 팝업을 닫지 않는다', LOG, []);
  sc.eq('기본 동작도 막지 않는다 (그 칸의 ESC 가 일하게)', ev2._prevented, 0);
  esc({ tagName:'DIV', isContentEditable:true });
  sc.eq('contenteditable 도 마찬가지', LOG, []);
}

// ═══ 3. ⭐ 자체 ESC 를 가진 칸은 두 번 처리되지 않는다 ═══
console.log('\n시나리오 3 — ⭐ 자체 ESC 는 겹치지 않는다');
{
  scene(); EL.cellTodoModal._shown = true;
  // 셀 할일 칸은 onkeydown 에서 preventDefault() 하고 제 팝업을 닫는다 → 공용은 비켜선다
  const ev = esc(EL.cellTodoModal.children[0], { defaultPrevented:true });
  sc.eq('defaultPrevented 면 공용 ESC 는 아무것도 안 한다', LOG, []);
  sc.eq('다시 막지도 않는다', ev._prevented, 0);
  // 소스: 자체 ESC 를 단 곳은 전부 preventDefault 를 부른다 (안 부르면 '내 처리 + 팝업 닫힘' 이 겹친다)
  const lines = SRC_DEV.split('\n').map((t,i)=>({t,i}))
    .filter(x => /e\.key===?'Escape'/.test(x.t) || /event\.key==='Escape'/.test(x.t));
  // 팝업 안에서 쓰이는 자체 ESC 만 본다 — 인라인 새 할일(고스트)은 팝업 밖이라 제외
  const popupOwn = lines.filter(x => /preventDefault/.test(SRC_DEV.split('\n').slice(x.i, x.i+4).join(' ')));
  sc.eq('자체 ESC 가 있는 줄들을 찾았다', lines.length >= 8, true);
  sc.eq('그중 대부분이 preventDefault 를 부른다', popupOwn.length >= 8, true);
}

// ═══ 4. 한글 조합 중에는 닫지 않는다 ═══
console.log('\n시나리오 4 — 조합(IME) 중의 ESC');
{
  scene(); EL.taskMemoModal._shown = true;
  esc(memoTa(), { isComposing:true });
  sc.eq('⭐ 조합 중의 ESC 는 팝업을 닫지 않는다', LOG, []);
  esc(memoTa(), { keyCode:229 });
  sc.eq('keyCode 229 도 마찬가지', LOG, []);
  esc(memoTa());
  sc.eq('조합이 끝나면 닫힌다', LOG, ['closeTaskMemo']);
}

// ═══ 5. 공용 확인창 · 삭제 방식 팝업 ═══
console.log('\n시나리오 5 — 표에 빠져 있던 둘');
{
  scene(); EL.appConfirmModal._shown = true;
  esc();
  sc.eq('⭐ 공용 확인창 — ESC 는 취소다', LOG, ['confirm:false']);
  sc.eq('⭐ 확인(onYes)은 절대 안 불린다', YES, 0);

  scene(); EL.ceDeletePopup._shown = true;
  esc();
  sc.eq('삭제 방식 팝업 — 닫힌다', LOG, ['ceCloseDeletePopup']);
}

// ═══ 6. 겹쳐 있으면 위엣것부터, 하위 단계는 한 단계 뒤로 ═══
console.log('\n시나리오 6 — 한 겹씩 · 한 단계 뒤로');
{
  scene(); EL.taskMemoModal._shown = true; EL.memoActMenu._shown = true;
  esc(memoTa());
  sc.eq('메모 위의 메뉴(5300)가 먼저 닫힌다', LOG, ['closeMemoActMenu']);
  EL.memoActMenu._shown = false;
  esc(memoTa());
  sc.eq('그다음에 메모창', LOG, ['closeMemoActMenu','closeTaskMemo']);

  // 로고 메뉴
  scene(); EL.logoMenu._shown = true; EL.logoMenuListSub._shown = true;
  esc();
  sc.eq('⭐ 하위 단계가 떠 있으면 한 단계 뒤로', LOG, ['logoBack']);
  EL.logoMenuListSub._shown = false;
  esc();
  sc.eq('메인이면 닫는다', LOG, ['logoBack','closeLogoMenu']);

  // 목록 바꾸기 슬라이드가 vAgg 팝업 안에서 열려 있으면 그것부터
  scene(); EL.vAggModal._shown = true; KEEP_ON = true;
  esc();
  sc.eq('⭐ 목록 바꾸기 상자가 열려 있으면 그것부터', LOG, ['closeKeepSwitch']);
  esc();
  sc.eq('닫힌 뒤엔 팝업', LOG, ['closeKeepSwitch','closeVerseAggPopup']);

  // 공용 확인창이 다른 팝업 위(4450)에 뜨면 확인창이 먼저다
  scene(); EL.eventModal._shown = true; EL.appConfirmModal._shown = true;
  esc();
  sc.eq('확인창이 위에 있으면 확인창이 먼저 (취소)', LOG, ['confirm:false']);
}

// ═══ 7. ESC = × ═══
console.log('\n시나리오 7 — ESC 는 ×와 같은 길');
{
  scene(); EL.verseSettingsOverlay._shown = true;
  esc();
  sc.eq('⭐ 말씀 설정창 — ×와 같은 함수를 부른다', LOG, ['closeVerseSettingsModal']);
  sc.eq("예전처럼 classList 만 지우지 않는다 (_vsetRestoreBack 을 건너뛰었다)",
        /\['verseSettingsOverlay',\(\)=>document\.getElementById\('verseSettingsOverlay'\)\.classList\.remove/.test(SRC_DEV), false);
  sc.eq('옛 보조 ESC 도 같은 길', /closeVerseSettingsModal\(\);\s*\/\/ ×와 같은 길/.test(SRC_DEV), true);
  // ×(HTML)가 부르는 함수와 표가 부르는 함수가 같은가 — 바꾼 둘만 본다
  sc.eq('말씀 설정창 × 의 onclick', SRC_DEV.includes('<button class="settings-close" onclick="closeVerseSettingsModal()">'), true);
}

// ═══ 8. 표에 올랐는가 ═══
console.log('\n시나리오 8 — ESC 표');
{
  const ids = _ESC_CLOSERS.map(x => x[0]);
  sc.eq('공용 확인창이 표에 있다', ids.includes('appConfirmModal'), true);
  sc.eq('삭제 방식 팝업이 표에 있다', ids.includes('ceDeletePopup'), true);
  sc.eq('메모창은 처음부터 표에 있었다', ids.includes('taskMemoModal'), true);
  // 자판 단축키가 뒤로 새지 않게 하는 판정(_kbOverlayOpen)도 같은 표를 쓴다 → 저절로 막힌다
  scene(); EL.appConfirmModal._shown = true;
  sc.eq('확인창이 떠 있으면 자판 단축키도 안 받는다', _kbOverlayOpen(), true);
}

// ═══ 9. ⌘/ ═══
console.log('\n시나리오 9 — ⌘/ 단축키 표');
{
  const K = o => Object.assign({ code:'Slash', key:'/', metaKey:true, ctrlKey:false, altKey:false,
    shiftKey:false, defaultPrevented:false, _p:0, _s:0, target:null,
    preventDefault(){ this._p++; }, stopPropagation(){ this._s++; }, stopImmediatePropagation(){ this._s++; } }, o||{});
  scene();
  let ev = K(); HELP_HANDLER(ev);
  sc.eq('⌘/ 로 표를 연다', LOG, ['openHelp']);
  sc.eq('기본 동작을 막고 전파를 끊는다', [ev._p>0, ev._s>0], [true, true]);
  ev = K(); HELP_HANDLER(ev);
  sc.eq('떠 있으면 한 번 더 눌러 닫는다', LOG, ['openHelp','closeSwKbHelp']);

  // 글자를 치는 중에도 먹는다 — '?' 와 다른 점
  scene(); EL.taskMemoModal._shown = false;
  ev = K({ target:{ tagName:'INPUT' } }); HELP_HANDLER(ev);
  sc.eq('⭐ 입력칸에서도 열린다 (글자가 아니므로)', LOG, ['openHelp']);

  // 다른 팝업이 떠 있으면 안 연다
  scene(); EL.taskMemoModal._shown = true;
  ev = K(); HELP_HANDLER(ev);
  sc.eq('⭐ 다른 팝업이 떠 있으면 안 연다 (표가 아래에 깔린다)', LOG, []);
  sc.eq('그때는 막지도 않는다', ev._p, 0);

  scene();
  HELP_HANDLER(K({ ctrlKey:true, metaKey:false })); sc.eq('Ctrl+/ 는 아니다 (맥 전용 요청)', LOG, []);
  HELP_HANDLER(K({ metaKey:false }));               sc.eq('/ 만으로는 안 열린다', LOG, []);
  HELP_HANDLER(K({ altKey:true }));                 sc.eq('⌘⌥/ 는 아니다', LOG, []);
  HELP_HANDLER(K({ code:'KeyA' }));                 sc.eq('다른 글쇠는 아니다', LOG, []);
  HELP_HANDLER(K({ shiftKey:true }));
  sc.eq('⌘⇧/ (= ⌘?) 도 연다', LOG, ['openHelp']);
  // 한글 자판: key 는 달라도 code 는 Slash 다
  scene();
  HELP_HANDLER(K({ key:'ㅗ' }));
  sc.eq('⭐ 한글 자판에서도 열린다 (e.code)', LOG, ['openHelp']);

  // ⭐ ⌘/ 는 글자를 치는 중에도 먹으므로 표가 떠 있어도 커서는 뒤의 입력칸에 남는다.
  //    그 칸의 자체 ESC(편집 취소)가 먼저 받으면 표는 안 닫히고 쓰던 글자만 취소된다.
  scene(); HELP_OPEN = true;
  ev = K({ code:'Escape', key:'Escape', metaKey:false, target:{ tagName:'INPUT' } }); HELP_HANDLER(ev);
  sc.eq('⭐ 표가 떠 있으면 ESC 는 표가 먼저 받는다 (뒤의 입력칸이 아니라)', LOG, ['closeSwKbHelp']);
  sc.eq('그 칸에 닿지 않게 전파를 끊는다', [ev._p>0, ev._s>0], [true, true]);
  scene();
  ev = K({ code:'Escape', key:'Escape', metaKey:false }); HELP_HANDLER(ev);
  sc.eq('표가 없으면 ESC 에 손대지 않는다', [LOG.length, ev._p], [0, 0]);
  scene(); HELP_OPEN = true;
  ev = K({ code:'Escape', key:'Escape', metaKey:false, isComposing:true }); HELP_HANDLER(ev);
  sc.eq('조합 중의 ESC 는 비켜선다', LOG, []);

  sc.eq('캡처 단계로 붙인다 (입력칸·마스터 핸들러보다 먼저)',
        /if\(_kbHelpKey\(e\)\)\{[^}]*\}\n\},true\);/.test(SRC_DEV), true);
  sc.eq('표 안내에 ⌘/ 가 적혀 있다', SRC_DEV.includes("['? · ⌘/'"), true);
}

sc.done();
