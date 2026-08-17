// 태그 목록에서 '구절 1개뿐인 태그' 빼기 (v26-0817-12, HB 14 / 14-1 / 14-2)
//
// 왜 필요했나 — 네비게이토 180 에 태그가 들어오면서 태그가 400개가 됐는데
// 그중 240개가 구절 하나뿐이다. 롤링피커를 아무리 굴려도 원하는 태그를
// 못 찾는다. 빼고 나면 158개로 줄어든다.
//
// 두 자리에 스위치가 있고 **한 값을 본다**:
//   14-1 말씀 설정 → 뷰 탭 맨 아래
//   14-2 타일뷰 좌상단 태그 롤링피커 바로 우측 미니 스위치 + '1 제외'
// 첫 사용자 기본값은 둘 다 켬(제외 ON).
const { slice, makeScorer, SRC } = require('./_load');
const sc = makeScorer();

console.log('시나리오 1 — 기본값은 켬');
{
  sc.eq('_settingsDefaults 에 켬으로 들어 있다',
        SRC.includes('vgTagHideSingles:true'), true);
  // ⚠️ 기본이 '켬'이므로 판정은 !==false 여야 한다. !!s.x 로 하면 값이 없는
  //    기존 기기에서 꺼진 것으로 읽힌다.
  sc.eq('값이 없으면 켠 것으로 본다',
        SRC.includes('function _vgHideSingles(){return ST.settings.vgTagHideSingles!==false;}'), true);
  sc.eq('설정창도 !==false 로 읽는다',
        SRC.includes("e.checked=s.vgTagHideSingles!==false;"), true);
}

console.log('\n시나리오 2 — 목록에서 1개짜리를 뺀다');
{
  const ax = slice('function _vgAxisItems(kind){', 'function _vgAxisLabel');
  sc.eq('켜져 있을 때만 거른다', ax.includes('if(_vgHideSingles())keys=keys.filter('), true);
  sc.eq('2개 이상만 남긴다', ax.includes('cnt.get(k)>1'), true);
  // ⚠️ 지금 보고 있는 태그는 1개짜리여도 남겨야 한다 — 빼면 제목이 빈칸이 되고
  //    롤링피커가 현재 위치를 잃는다
  sc.eq('보고 있는 태그는 남긴다', ax.includes('||k===_vgState.val'), true);
  sc.eq('성경 필터는 안 건드린다', ax.indexOf('_vgHideSingles()') < ax.indexOf("if(kind==='book')"), true);

  // 실제 계산 — 거르는 규칙을 그대로 돌려본다
  const filt=(cnt,cur,on)=>[...cnt.keys()].filter(k=>!on||cnt.get(k)>1||k===cur);
  const cnt=new Map([['많음',3],['둘',2],['하나',1],['하나둘',1]]);
  sc.eq('켜면 2개 이상만', filt(cnt,null,true).join(','), '많음,둘');
  sc.eq('끄면 전부', filt(cnt,null,false).length, 4);
  sc.eq('보던 1개짜리는 남는다', filt(cnt,'하나',true).join(','), '많음,둘,하나');
}

console.log('\n시나리오 3 — 두 스위치가 한 값을 본다 (연동)');
{
  const tg = slice('function vgToggleTagSingles(on){', '// 릴스 좌하단 대분류/소주제 터치 진입');
  sc.eq('타일뷰에서 누르면 설정값을 쓴다', tg.includes('ST.settings.vgTagHideSingles=!!on;'), true);
  sc.eq('beforeSave 가 먼저', tg.indexOf('beforeSave();') < tg.indexOf('ST.settings.vgTagHideSingles'), true);
  sc.eq('저장한다', tg.includes('save();'), true);
  sc.eq('설정창 스위치를 따라 맞춘다', tg.includes("document.getElementById('setVgTagHideSingles')"), true);
  sc.eq('제목을 다시 그린다', tg.includes('_vgSyncFilterLabel();'), true);

  const us = slice('function updateSetting(key,value){', "if(key==='dayStartHour')");
  sc.eq('설정창에서 누르면 타일뷰 스위치를 맞춘다',
        us.includes("if(key==='vgTagHideSingles')"), true);
  sc.eq('타일뷰 미니 스위치를 맞춘다', us.includes("document.getElementById('vgSinglesChk')"), true);
  sc.eq('타일뷰가 태그 필터일 때만 다시 그린다',
        us.includes("_vgState.kind==='tag')_vgSyncFilterLabel();"), true);
}

console.log('\n시나리오 4 — 14-2 미니 스위치의 자리와 모양');
{
  sc.eq('롤링피커 바로 뒤에 있다',
        /<div class="vg-filter" id="vgFilterLabel"><\/div>[\s\S]{0,200}<div class="vg-singles" id="vgSinglesBox"/.test(SRC), true);
  sc.eq("라벨은 작고 회색인 '1 제외'", SRC.includes('<span class="vg-singles-lbl">1 제외</span>'), true);
  sc.eq('라벨 색은 tx3', /\.vg-singles-lbl\{[^}]*color:var\(--tx3\)/.test(SRC), true);
  sc.eq('스위치는 작다 (22x12)', /\.vg-mini-toggle\{[^}]*width:22px;height:12px/.test(SRC), true);
  // UI 원칙 — 테두리·박스 금지
  sc.eq('테두리를 두르지 않는다', /\.vg-mini-track\{[^}]*border:/.test(SRC), false);

  const sy = slice('function _vgSyncSinglesToggle(){', 'function vgToggleTagSingles');
  sc.eq('태그 필터일 때만 보인다', sy.includes("const on=_vgState.kind==='tag';"), true);
  sc.eq('아니면 숨긴다', sy.includes("box.style.display=on?'':'none';"), true);
  // ⚠️ 제목은 innerHTML 로 통째로 다시 그려진다 — 스위치를 그 안에 넣으면 같이 지워진다
  sc.eq('제목을 다시 그릴 때마다 스위치를 맞춘다',
        slice('function _vgSyncFilterLabel(){', '// ── 롤링피커 우측').includes('_vgSyncSinglesToggle();'), true);
}

console.log('\n시나리오 5 — 14-1 설정창 항목');
{
  sc.eq('말씀설정 뷰탭에 있다',
        /<div class="settings-section" data-lv="mp">\s*<div class="settings-section-title">태그 목록<\/div>/.test(SRC), true);
  sc.eq('스위치 id 가 맞다', SRC.includes(`id="setVgTagHideSingles" onchange="updateSetting('vgTagHideSingles',this.checked)"`), true);
  // CLAUDE.md — 설정창 새 항목은 data-lv 를 반드시 정한다
  sc.eq('등급을 정해 뒀다 (미드·파워)', /태그 목록[\s\S]{0,40}/.test(SRC) && SRC.includes('data-lv="mp">\n        <div class="settings-section-title">태그 목록'), true);
  // 뷰탭 안이어야 한다 — 알림탭 앞에 있는지로 확인
  sc.eq('뷰탭(vstab-general) 안이다',
        SRC.indexOf('<div class="settings-section-title">태그 목록') < SRC.indexOf('id="vstab-alarm"'), true);
}

sc.done();
