// 태그 목록에서 '구절 적은 태그' 빼기 (v26-0817-13, HB 14 / 14-1 / 14-2)
//
// 왜 필요했나 — 네비게이토 180 에 태그가 들어오면서 태그가 400개가 됐는데
// 그중 240개가 구절 하나뿐이다. 롤링피커를 아무리 굴려도 원하는 태그를
// 못 찾는다.
//
// 0817-12 는 '1개짜리만' 빼는 켬/끔 스위치였다. 0817-13 에서 HB 요청으로
// 기준을 스테퍼로 고르게 바꿨다:
//   · 기준 N 은 **N개 이하를 뺀다**는 뜻이다. N=1 이면 예전과 똑같다.
//     ('정확히 N개'로 하면 N=3 일 때 1·2개짜리가 되살아나 목록이 되레 늘어난다)
//   · '제외' 글자 버튼을 눌러 켜야 스테퍼가 나온다.
//
// 두 자리에 있고 **한 값을 본다**:
//   14-1 말씀 설정 → 뷰 탭 맨 아래 (켬/끔 + 기준 개수)
//   14-2 타일뷰 좌상단 태그 롤링피커 **바로 우측** '제외' + 스테퍼
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 기본값과 값 읽기');
{
  sc.eq('기본은 켬', SRC.includes('vgTagExcludeOn:true'), true);
  sc.eq('기본 기준은 1', SRC.includes('vgTagExcludeMax:1'), true);
  // ⚠️ 기본이 '켬'이므로 판정은 !==false 여야 한다. !!s.x 로 하면 값이 없는
  //    기존 기기에서 꺼진 것으로 읽힌다.
  sc.eq('값이 없으면 켠 것으로 본다',
        SRC.includes('function _vgExclOn(){return ST.settings.vgTagExcludeOn!==false;}'), true);

  const mx = slice('function _vgExclMax(){', 'function _vgAxisItems');
  sc.eq('숫자가 아니면 최소값으로', mx.includes('if(isNaN(n))return VG_TAG_EXCL_MIN;'), true);
  sc.eq('범위를 벗어나면 잘라 준다',
        mx.includes('Math.max(VG_TAG_EXCL_MIN,Math.min(VG_TAG_EXCL_MAX,n))'), true);
  sc.eq('범위는 1~9', SRC.includes('const VG_TAG_EXCL_MIN=1, VG_TAG_EXCL_MAX=9;'), true);
}

console.log('\n시나리오 2 — 기준 이하를 뺀다 (정확히 N 이 아니다)');
{
  const ax = slice('function _vgAxisItems(kind){', 'function _vgAxisLabel');
  sc.eq('켜져 있을 때만 거른다', ax.includes('if(_vgExclOn()){'), true);
  // 핵심 — 초과만 남긴다 = 이하를 뺀다
  sc.eq('기준 초과만 남긴다', ax.includes('cnt.get(k)>mx'), true);
  // ⚠️ 보고 있는 태그는 기준에 걸려도 남겨야 한다 — 빼면 제목이 빈칸이 되고
  //    롤링피커가 현재 위치를 잃는다
  sc.eq('보고 있는 태그는 남긴다', ax.includes('||k===_vgState.val'), true);
  sc.eq('성경 필터는 안 건드린다', ax.indexOf('_vgExclOn()') < ax.indexOf("if(kind==='book')"), true);

  // 거르는 규칙을 그대로 돌려본다
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

console.log('\n시나리오 3 — 두 자리가 한 값을 본다 (연동)');
{
  const tg = slice('function vgToggleTagExcl(){', 'function vgStepTagExcl');
  sc.eq('누르면 뒤집는다', tg.includes('const on=!_vgExclOn();'), true);
  sc.eq('beforeSave 가 먼저', tg.indexOf('beforeSave();') < tg.indexOf('ST.settings.vgTagExcludeOn'), true);
  sc.eq('저장한다', tg.includes('save();'), true);
  sc.eq('두 자리를 한꺼번에 맞춘다', tg.includes('_vgSyncExclEverywhere();'), true);

  const st = slice('function vgStepTagExcl(d){', 'function _vgSyncExclEverywhere');
  sc.eq('범위를 넘지 않는다',
        st.includes('Math.max(VG_TAG_EXCL_MIN,Math.min(VG_TAG_EXCL_MAX,_vgExclMax()+d))'), true);
  sc.eq('안 바뀌면 저장도 안 한다', st.includes('if(n===_vgExclMax())return;'), true);

  const sy = slice('function _vgSyncExclEverywhere(){', '// 릴스 좌하단 대분류/소주제 터치 진입');
  sc.eq('설정창 켬/끔을 맞춘다', sy.includes("document.getElementById('setVgTagExclOn')"), true);
  sc.eq('설정창 숫자를 맞춘다', sy.includes("document.getElementById('setVgExclVal')"), true);
  sc.eq("설정창 '켰을 때만' 줄을 여닫는다",
        sy.includes("sw.style.display=_vgExclOn()?'':'none';"), true);
  sc.eq('목록이 달라졌으니 제목을 다시 그린다', sy.includes('_vgSyncFilterLabel();'), true);

  const us = slice('function updateSetting(key,value){', "if(key==='dayStartHour')");
  sc.eq('설정창에서 눌러도 같은 함수를 탄다',
        us.includes("if(key==='vgTagExcludeOn'||key==='vgTagExcludeMax')"), true);
}

console.log('\n시나리오 4 — 14-2 자리와 모양');
{
  // ⚠️ HB 재요청의 핵심 — 롤링피커 **바로 우측**이어야 한다.
  //    0817-12 엔 정렬 버튼 옆까지 밀려나 있었다.
  sc.eq('롤링피커 바로 뒤에 있다',
        /<div class="vg-filter" id="vgFilterLabel"><\/div>[\s\S]{0,220}<div class="vg-excl" id="vgExclBox"/.test(SRC), true);
  // 밀려났던 진짜 원인 — 제목이 flex:1 로 남는 자리를 다 먹었다
  sc.eq('제목이 남는 자리를 먹지 않는다', SRC.includes('.vg-filter{flex:0 1 auto;'), true);
  sc.eq('남는 자리는 .vg-sp 가 먹는다', SRC.includes('.vg-sp{flex:1;'), true);
  sc.eq('.vg-sp 가 제외 버튼과 정렬 사이에 있다',
        /<span class="vg-sp"><\/span>\s*<div class="vg-sort">/.test(SRC), true);

  sc.eq('글자 버튼이다', SRC.includes('<button class="vg-excl-btn" id="vgExclBtn"'), true);
  sc.eq("글자는 '제외'", /onclick="vgToggleTagExcl\(\)"[^>]*>제외<\/button>/.test(SRC), true);
  // UI 원칙 — 테두리·박스 금지
  sc.eq('버튼에 테두리·바탕이 없다', /\.vg-excl-btn\{[^}]*background:none;border:none/.test(SRC), true);
  sc.eq('켜지면 강조색', SRC.includes('.vg-excl-btn.on{color:var(--ac);'), true);

  const sy = slice('function _vgSyncExcl(){', '// 켬/끔. 두 자리');
  sc.eq('태그 필터일 때만 보인다', sy.includes("const show=_vgState.kind==='tag';"), true);
  sc.eq('꺼져 있으면 스테퍼는 숨는다', sy.includes("st.style.display=on?'':'none';"), true);
  sc.eq('끝에 닿으면 버튼을 잠근다',
        sy.includes('mi.disabled=n<=VG_TAG_EXCL_MIN;') && sy.includes('pl.disabled=n>=VG_TAG_EXCL_MAX;'), true);
  // ⚠️ 제목은 innerHTML 로 통째로 다시 그려진다 — 버튼을 그 안에 넣으면 같이 지워진다
  sc.eq('제목을 다시 그릴 때마다 맞춘다',
        slice('function _vgSyncFilterLabel(){', '// ── 롤링피커 바로 우측').includes('_vgSyncExcl();'), true);
}

console.log('\n시나리오 6 — 타일뷰 테마 색을 따른다');
{
  // ⚠️ 타일뷰는 앱 기본색이 아니라 말씀 전체화면 테마(--vf-*)를 쓴다.
  //    var(--tx) 를 그냥 쓰면 어두운 테마에서 글자가 배경에 묻힌다 —
  //    0817-13 첫 판에서 스테퍼 숫자가 안 보였다.
  sc.eq('숫자가 테마 본문색을 쓴다',
        SRC.includes('#verseGrid .vg-excl-step span{color:var(--vf-tx,var(--tx));'), true);
  sc.eq('꺼진 제외는 테마 흐린색', SRC.includes('#verseGrid .vg-excl-btn{color:var(--vf-tx3,var(--tx3));}'), true);
  sc.eq('켜진 제외는 테마 강조색', SRC.includes('#verseGrid .vg-excl-btn.on{color:var(--vf-ac,var(--ac));}'), true);
  sc.eq('스테퍼 테두리도 테마색', SRC.includes('#verseGrid .vg-excl-step{border-color:var(--vf-tx3,var(--tx3));}'), true);
  sc.eq('가운데 칸 세로선도 테마색',
        /#verseGrid \.vg-excl-step span\{[\s\S]{0,140}border-left-color:var\(--vf-tx3/.test(SRC), true);
}

console.log('\n시나리오 5 — 14-1 설정창 항목');
{
  sc.eq('말씀설정 뷰탭에 있다',
        /<div class="settings-section" data-lv="mp">\s*<div class="settings-section-title">태그 목록<\/div>/.test(SRC), true);
  sc.eq('켬/끔 스위치', SRC.includes(`id="setVgTagExclOn" onchange="updateSetting('vgTagExcludeOn',this.checked)"`), true);
  sc.eq('기준 스테퍼도 있다', SRC.includes('id="setVgExclVal"'), true);
  sc.eq('스테퍼는 기존 .hi-step 을 쓴다',
        /<div class="hi-step">\s*<button id="setVgExclMinus"/.test(SRC), true);
  sc.eq("설명에 '이하'라고 적어 뒀다", SRC.includes('구절이 이 개수 <b>이하</b>인 태그를 빼요'), true);
  // 뷰탭 안이어야 한다 — 알림탭 앞에 있는지로 확인
  sc.eq('뷰탭(vstab-general) 안이다',
        SRC.indexOf('<div class="settings-section-title">태그 목록') < SRC.indexOf('id="vstab-alarm"'), true);
}

sc.done();
