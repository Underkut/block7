// 타일뷰 '제외' — 태그(14/14-1/14-2) + 성경(14B) 두 축 (v26-0817-13/14)
//
// 왜 필요했나 — 네비게이토 180 에 태그가 들어오면서 태그가 400개가 됐는데
// 그중 240개가 구절 하나뿐이다. 롤링피커를 아무리 굴려도 원하는 태그를
// 못 찾는다.
//
// 0817-12 는 '1개짜리만' 빼는 켬/끔 스위치, 0817-13 에서 기준을 스테퍼로:
//   · 기준 N 은 **N개 이하를 뺀다**는 뜻이다. N=1 이면 예전과 똑같다.
//   · '제외' 글자 버튼을 눌러 켜야 스테퍼가 나온다.
// 0817-14 에서 성경 필터(HB 14B)에도 같은 시스템을 넣었다. 태그·성경은 서로
// 값이 다르므로(태그 400개짜리 목록 / 성경 66권) **켬·기준을 축마다 따로
// 저장한다** — vgTagExclude* 와 vgBookExclude*.
//
// 자리(HB 14-2):
//   14-1 말씀 설정 → 뷰 탭 맨 아래 — 태그 전용 (켬/끔 + 기준 개수)
//   14-2 타일뷰 좌상단 태그 롤링피커 바로 우측 — 태그·성경 필터에서만 보이고
//        **대분류·소주제 타일뷰에서는 반드시 사라진다**
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 기본값과 값 읽기 (두 축 모두)');
{
  sc.eq('태그 기본은 켬', SRC.includes('vgTagExcludeOn:true'), true);
  sc.eq('태그 기본 기준은 1', SRC.includes('vgTagExcludeMax:1'), true);
  sc.eq('성경 기본은 켬', SRC.includes('vgBookExcludeOn:true'), true);
  sc.eq('성경 기본 기준은 1', SRC.includes('vgBookExcludeMax:1'), true);
  sc.eq('범위는 1~9', SRC.includes('const VG_EXCL_MIN=1, VG_EXCL_MAX=9;'), true);

  // ⚠️ 기본이 '켬'이므로 판정은 !==false 여야 한다.
  const on = slice('function _vgExclOn(axis){', 'function _vgExclMax');
  sc.eq('값이 없으면 켠 것으로 본다', on.includes('ST.settings[_vgExclKeys(axis).on]!==false'), true);
  sc.eq('축 이름을 태그/성경 둘로만 좁힌다', on.includes("axis=(axis==='book')?'book':'tag';"), true);

  const keys = slice('function _vgExclKeys(axis){', 'function _vgExclOn');
  sc.eq('태그 설정 키', keys.includes("{on:'vgTagExcludeOn',max:'vgTagExcludeMax'}"), true);
  sc.eq('성경 설정 키', keys.includes("{on:'vgBookExcludeOn',max:'vgBookExcludeMax'}"), true);
}

console.log('\n시나리오 2 — 기준 이하를 뺀다 (정확히 N 이 아니다, 두 축 공용 규칙)');
{
  const ax = slice('function _vgAxisItems(kind){', 'function _vgAxisLabel');
  sc.eq('태그: 켜져 있을 때만 거른다', ax.includes("if(_vgExclOn('tag')){"), true);
  sc.eq('태그: 기준 초과만 남긴다', ax.includes('cnt.get(k)>mx||k===_vgState.val'), true);
  sc.eq('성경: 켜져 있을 때만 거른다', ax.includes("if(_vgExclOn('book')){"), true);
  sc.eq('성경: 기준 초과만 남긴다', ax.includes('x.n>mx||x.key===_vgState.val'), true);

  // 거르는 규칙을 그대로 돌려본다 (두 축이 같은 규칙을 쓰므로 한 번만 검증)
  const filt = (cnt, cur, on, mx) =>
    [...cnt.keys()].filter(k => !on || cnt.get(k) > mx || k === cur);
  const cnt = new Map([['다섯',5],['셋',3],['둘',2],['하나',1],['하나또',1]]);
  sc.eq('N=1 이면 1개짜리만 빠진다', filt(cnt,null,true,1).join(','), '다섯,셋,둘');
  sc.eq('N=2 면 2개 이하가 빠진다', filt(cnt,null,true,2).join(','), '다섯,셋');
  sc.eq('N=3 이면 3개 이하가 빠진다', filt(cnt,null,true,3).join(','), '다섯');
  // ⚠️ '정확히 N' 이었다면 N=3 에서 1·2개짜리가 되살아나 5개가 됐을 것이다
  sc.eq('기준을 올릴수록 목록이 짧아진다',
        filt(cnt,null,true,1).length > filt(cnt,null,true,2).length &&
        filt(cnt,null,true,2).length > filt(cnt,null,true,3).length, true);
  sc.eq('끄면 전부', filt(cnt,null,false,3).length, 5);
  sc.eq('보던 것은 기준에 걸려도 남는다', filt(cnt,'하나',true,3).join(','), '다섯,하나');
}

console.log('\n시나리오 3 — 대분류·소주제에서는 반드시 사라진다 (HB 14-2 재요청)');
{
  const axis = slice('function _vgExclAxisNow(){', 'function _vgAxisItems');
  // ⚠️ 태그·성경 두 값만 축으로 인정한다 — 그 밖(대분류·소주제 등)은 전부 null.
  //    화이트리스트 방식이라 새 필터 종류가 생겨도 저절로 안전하게 숨는다.
  sc.eq("허용 목록은 'tag'·'book' 뿐",
        axis.includes("(_vgState.kind==='tag'||_vgState.kind==='book')?_vgState.kind:null")||
        /_vgState\.kind===['"]tag['"]\s*\|\|\s*_vgState\.kind===['"]book['"]/.test(axis), true);

  const sy = slice('function _vgSyncExcl(){', '// ── 타일뷰의');
  sc.eq('보일지 말지를 축 판정 함수 하나로 정한다', sy.includes('const axis=_vgExclAxisNow();'), true);
  sc.eq('축이 없으면(대분류·소주제 등) 숨긴다', sy.includes("box.style.display=axis?'':'none';"), true);

  // 실제로 kind 를 하나씩 넣어 axis 판정을 재현해 본다
  const decide = kind => (kind === 'tag' || kind === 'book') ? kind : null;
  sc.eq('태그는 보인다', decide('tag'), 'tag');
  sc.eq('성경도 보인다', decide('book'), 'book');
  sc.eq('대분류는 숨는다', decide('cat'), null);
  sc.eq('소주제도 숨는다', decide('topic'), null);

  // ⚠️ 실제로 터졌던 버그 — 판정 함수는 맞아도 **부르는 자리**가 빠지면
  //    이전 화면(태그·성경)에서 켜졌던 display 값이 그대로 남는다.
  //    태그 → 대분류로 넘어가도 박스가 안 사라지던 원인이 이거였다.
  const lbl = slice('function _vgSyncFilterLabel(){', '// ── 롤링피커 바로 우측');
  const other = lbl.slice(lbl.indexOf("kind!=="), lbl.indexOf("const items=_vgAxisItems"));
  sc.eq("축이 아닌 갈래(대분류·소주제)에서도 _vgSyncExcl 을 부른다",
        other.includes('_vgSyncExcl();') && other.indexOf('_vgSyncExcl();') < other.lastIndexOf('return;'), true);
}

console.log('\n시나리오 4 — 타일뷰 버튼은 지금 축을 보고 그 축의 값을 바꾼다');
{
  const tg = slice('function vgToggleTileExcl(){', 'function vgStepTileExcl');
  sc.eq('축이 없으면 아무 것도 안 한다', tg.includes('if(!axis)return;'), true);
  sc.eq('그 축의 설정 키를 쓴다', tg.includes('ST.settings[_vgExclKeys(axis).on]=on;'), true);
  sc.eq('beforeSave 가 먼저', tg.indexOf('beforeSave();') < tg.indexOf('ST.settings[_vgExclKeys(axis).on]'), true);
  sc.eq('저장한다', tg.includes('save();'), true);
  sc.eq('태그일 때만 설정창도 맞춘다', tg.includes("if(axis==='tag')_vgSyncTagSettingsUI();"), true);
  sc.eq('제목을 다시 그린다', tg.includes('_vgSyncFilterLabel();'), true);

  const st = slice('function vgStepTileExcl(d){', '// ── 말씀 설정');
  sc.eq('축이 없으면 아무 것도 안 한다', st.includes('if(!axis)return;'), true);
  sc.eq('범위를 넘지 않는다',
        st.includes('Math.max(VG_EXCL_MIN,Math.min(VG_EXCL_MAX,_vgExclMax(axis)+d))'), true);
  sc.eq('안 바뀌면 저장도 안 한다', st.includes('if(n===_vgExclMax(axis))return;'), true);
}

console.log('\n시나리오 5 — 설정창(14-1)은 항상 태그 고정, 타일뷰와 연동');
{
  const tg = slice('function vgToggleTagExcl(){', 'function vgStepTagExcl');
  sc.eq("축을 'tag' 로 고정한다 (타일뷰가 뭘 보고 있든 상관없다)",
        tg.includes("ST.settings.vgTagExcludeOn=on;") && tg.includes("!_vgExclOn('tag')"), true);
  sc.eq('설정창 UI를 맞춘다', tg.includes('_vgSyncTagSettingsUI();'), true);
  sc.eq('타일뷰가 태그를 보고 있으면 같이 새로 그린다',
        tg.includes("if(_vgState.kind==='tag')_vgSyncFilterLabel(); else _vgSyncExcl();"), true);

  const us = slice('function updateSetting(key,value){', "if(key==='dayStartHour')");
  sc.eq('설정창 스위치를 눌러도 같은 값을 쓴다',
        us.includes("if(key==='vgTagExcludeOn'||key==='vgTagExcludeMax')"), true);
  sc.eq('설정창 UI 를 맞춘다', us.includes('_vgSyncTagSettingsUI();'), true);
}

console.log('\n시나리오 6 — 14-2·14B 자리와 모양');
{
  sc.eq('롤링피커 바로 뒤에 있다',
        /<div class="vg-filter" id="vgFilterLabel"><\/div>[\s\S]{0,260}<div class="vg-excl" id="vgExclBox"/.test(SRC), true);
  sc.eq('제목이 남는 자리를 먹지 않는다', SRC.includes('.vg-filter{flex:0 1 auto;'), true);
  sc.eq('남는 자리는 .vg-sp 가 먹는다', SRC.includes('.vg-sp{flex:1;'), true);

  sc.eq('버튼은 타일뷰 전용 함수를 부른다', SRC.includes('onclick="vgToggleTileExcl()"'), true);
  sc.eq('스테퍼도 타일뷰 전용 함수를 부른다',
        SRC.includes('onclick="vgStepTileExcl(-1)"') && SRC.includes('onclick="vgStepTileExcl(1)"'), true);
  sc.eq("글자는 '제외'", /onclick="vgToggleTileExcl\(\)"[^>]*>제외<\/button>/.test(SRC), true);
  // UI 원칙 — 테두리·박스 금지
  sc.eq('버튼에 테두리·바탕이 없다', /\.vg-excl-btn\{[^}]*background:none;border:none/.test(SRC), true);
  sc.eq('켜지면 강조색', SRC.includes('.vg-excl-btn.on{color:var(--ac);'), true);
  // v26-0817-17 — HB: 색만 바뀌고 볼드는 넣지 말 것
  sc.eq('켜져도 볼드는 안 준다', SRC.includes('.vg-excl-btn.on{color:var(--ac);font-weight:700;}'), false);

  // ⚠️ 제목은 innerHTML 로 통째로 다시 그려진다 — 버튼을 그 안에 넣으면 같이 지워진다
  sc.eq('제목을 다시 그릴 때마다 맞춘다',
        slice('function _vgSyncFilterLabel(){', '// ── 롤링피커 바로 우측').includes('_vgSyncExcl();'), true);
}

console.log('\n시나리오 7 — 타일뷰 테마 색을 따른다 (기존 확인 유지)');
{
  // ⚠️ 타일뷰는 앱 기본색이 아니라 말씀 전체화면 테마(--vf-*)를 쓴다.
  //    var(--tx) 를 그냥 쓰면 어두운 테마에서 글자가 배경에 묻힌다.
  sc.eq('숫자가 테마 본문색을 쓴다',
        SRC.includes('#verseGrid .vg-excl-step span{color:var(--vf-tx,var(--tx));'), true);
  sc.eq('꺼진 제외는 테마 흐린색', SRC.includes('#verseGrid .vg-excl-btn{color:var(--vf-tx3,var(--tx3));}'), true);
  sc.eq('켜진 제외는 테마 강조색', SRC.includes('#verseGrid .vg-excl-btn.on{color:var(--vf-ac,var(--ac));}'), true);
}

console.log('\n시나리오 8 — 14-1 설정창 항목 (태그 전용, 그대로)');
{
  sc.eq('말씀설정 뷰탭에 있다',
        /<div class="settings-section" data-lv="mp">\s*<div class="settings-section-title">태그 목록<\/div>/.test(SRC), true);
  sc.eq('켬/끔 스위치', SRC.includes(`id="setVgTagExclOn" onchange="updateSetting('vgTagExcludeOn',this.checked)"`), true);
  sc.eq('기준 스테퍼도 있다', SRC.includes('id="setVgExclVal"'), true);
  sc.eq('설정창 스테퍼는 설정창 전용 함수를 부른다',
        SRC.includes('onclick="vgStepTagExcl(-1)"') && SRC.includes('onclick="vgStepTagExcl(1)"'), true);
  sc.eq('스테퍼는 기존 .hi-step 을 쓴다',
        /<div class="hi-step">\s*<button id="setVgExclMinus"/.test(SRC), true);
  sc.eq('뷰탭(vstab-general) 안이다',
        SRC.indexOf('<div class="settings-section-title">태그 목록') < SRC.indexOf('id="vstab-alarm"'), true);
  // 성경 축은 설정창에 없다 — HB 14B 는 타일뷰만 요청했다
  sc.eq('성경 전용 설정창 UI 는 없다', SRC.includes('id="setVgBookExclOn"'), false);
}

sc.done();
