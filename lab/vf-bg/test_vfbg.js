// 말씀 전체화면 '내 배경'(사진 배경) 시나리오 테스트.
//
// 왜 있나 — 이 기능은 ① 사진을 기기에 담고 ② 설정(클라우드로 동기화되는 것)에
// 작은 정보를 남긴다. 즉 **저장 계층을 건드린다.** CLAUDE.md 규칙대로 화면을
// 만들기 전에 시나리오를 먼저 못 박는다.
//
// 돌리는 법:  node lab/vf-bg/test_vfbg.js
// ⚠️ index.html 에 합친 뒤에는 이 파일을 tests/ 로 옮기기만 하면 된다 —
//    아래 SRC 는 index.html 에 표시(VFBG:PURE-START)가 있으면 그쪽을 먼저 본다.
const fs=require('fs'),path=require('path');

const ROOT=path.join(__dirname,'..','..');
const CANDIDATES=[
  path.join(ROOT,'index-dev.html'),
  path.join(ROOT,'index.html'),
  path.join(__dirname,'vf-bg.js')
];
let SRC=null,WHOSE='';
for(const f of CANDIDATES){
  if(!fs.existsSync(f))continue;
  const t=fs.readFileSync(f,'utf-8');
  if(t.indexOf('VFBG:PURE-START')>=0){SRC=t;WHOSE=path.basename(f);break;}
}
if(!SRC){
  console.error('VFBG:PURE-START 표시를 어디서도 못 찾았어요. lab/vf-bg/vf-bg.js 가 있나요?');
  process.exit(2);
}
function slice(a,b){
  const i=SRC.indexOf(a),j=SRC.indexOf(b,i);
  if(i<0||j<0)throw new Error('[로더] 표시를 찾지 못했어요: '+(i<0?a:b));
  return SRC.slice(i,j);
}
const CODE=slice('const VFBG_MAX=','// ══════════════════ VFBG:PURE-END');

// 앱의 색 파생 함수 하나만 빌려 온다 (내 배경도 같은 규칙으로 보조색을 만든다)
global._rgba=function(c,a){
  let s=String(c||'').replace('#','');
  if(s.length===3)s=s.split('').map(x=>x+x).join('');
  const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);
  if([r,g,b].some(isNaN))return c;
  return`rgba(${r},${g},${b},${a})`;
};
// ⚠️ eval 안의 const 는 밖으로 새어 나오지 않는다 (function 만 나온다).
//    그래서 쓸 이름을 **한 곳에 적어** 돌려받는다 — 이 목록이 곧 이 계층의
//    공개 면(面)이고, 이름이 바뀌면 여기서 바로 걸린다.
const NAMES=['VFBG_MAX','VFBG_THUMB_MAX','VFBG_LONG','VFBG_PREFIX',
  'VFBG_TEMPLATES','VFBG_TPL_ORDER',
  '_vfbgRgb','_vfbgHex','_vfbgLum','_vfbgContrast','_vfbgMix','_vfbgScrimHex',
  '_vfbgAutoScrim','_vfbgAutoInk','_vfbgCover','_vfbgBlurPx','_vfbgScrimCss',
  '_vfbgBgCss','_vfbgShadowCss','_vfbgTplOf','_vfbgIsUserKey','_vfbgFind',
  '_vfbgNew','_vfbgApplyTpl','_vfbgCheck','_vfbgAsPattern','_vfbgThemeOf'];
const API=eval(CODE+'\n;({'+NAMES.join(',')+'})');
NAMES.forEach(n=>{
  if(API[n]===undefined){console.error('[로더] 이름이 사라졌어요:',n);process.exit(2);}
  global[n]=API[n];
});

let pass=0,fail=0;
const eq=(name,got,want)=>{
  const a=JSON.stringify(got),b=JSON.stringify(want);
  if(a===b){pass++;console.log('  ✓',name);}
  else{fail++;console.log('  ✗',name,'\n    결과:',a,'\n    기대:',b);}
};
const ok=(name,cond)=>eq(name,!!cond,true);

console.log('불러온 곳:',WHOSE);

// ═══ 0. 순수 구간에 브라우저가 섞이지 않았는가 ═══
// 이 구간은 화면 없이도 돌아야 한다 — 그래야 배포 전 점검에서 검사된다.
console.log('\n시나리오 0 — 계산 구간은 브라우저 없이 돈다');
{
  const bad=['document.','window.','localStorage','indexedDB','createElement'];
  bad.forEach(w=>eq('계산 구간에 '+w+' 없음',CODE.indexOf(w)>=0,false));
}

// ═══ 1. 자동 가독성 — 사진 위에서 글씨가 읽히는가 ═══
// 이 기능의 존재 이유다. 밤하늘이든 눈밭이든, 저장된 값 그대로 4.5:1 을 넘겨야 한다.
console.log('\n시나리오 1 — 어떤 사진이든 자동값이면 글씨가 읽힌다');
{
  const 사진들=[
    ['밤하늘','#0b1220'],['눈밭','#eef2f6'],['노을','#c96a3c'],
    ['숲','#25402c'],['모래','#d9c9a8'],['회색벽','#7d7d80']
  ];
  사진들.forEach(([이름,avg])=>{
    const ink=_vfbgAutoInk(avg);
    const color=ink==='dark'?_vfbgMix(avg,'#000000',.86):_vfbgMix(avg,'#ffffff',.92);
    const a=_vfbgAutoScrim(avg,color,4.5);
    const 실제=_vfbgContrast(_vfbgMix(avg,_vfbgScrimHex(color),a),color);
    ok(이름+' — 명암비 4.5 이상 ('+실제.toFixed(1)+':1)',실제>=4.5);
    ok(이름+' — 스크림이 지나치지 않다 ('+a+')',a<=.86);
  });
}
console.log('\n시나리오 1-2 — 밝은 사진에서는 어두운 글씨를 고른다');
{
  eq('눈밭 → 어두운 글씨',_vfbgAutoInk('#eef2f6'),'dark');
  eq('밤하늘 → 밝은 글씨',_vfbgAutoInk('#0b1220'),'light');
  eq('밝은 글씨의 스크림은 검정',_vfbgScrimHex('#ffffff'),'#000000');
  eq('어두운 글씨의 스크림은 흰색',_vfbgScrimHex('#111111'),'#ffffff');
}

// ═══ 2. 화면·공유 이미지·미리보기가 같은 그림인가 ═══
// 셋이 다른 계산을 하면 "화면에서 본 것과 저장된 이미지가 다르다" 가 된다.
console.log('\n시나리오 2 — cover 계산은 CSS 와 같은 규칙');
{
  // 가로 사진(1600×900)을 세로 화면(400×800)에 — 좌우가 잘린다
  const r=_vfbgCover(1600,900,400,800,.5,.5);
  eq('세로를 꽉 채운다',Math.round(r.h),800);
  ok('가로가 넘친다',r.w>400);
  eq('가운데면 좌우가 같게 잘린다',Math.round(r.x),Math.round(400-(r.x+r.w)));
  const l=_vfbgCover(1600,900,400,800,0,.5),g=_vfbgCover(1600,900,400,800,1,.5);
  eq('focus 0 이면 왼쪽 끝',Math.round(l.x),0);
  eq('focus 1 이면 오른쪽 끝',Math.round(g.x+g.w),400);
  // 세로 사진을 가로 화면에 (PC 전체화면)
  const v=_vfbgCover(900,1600,1200,700,.5,.4);
  eq('가로를 꽉 채운다',Math.round(v.w),1200);
  ok('세로가 넘친다',v.h>700);
}
console.log('\n시나리오 2-2 — 흐림은 상자 크기에 비례한다 (작은 미리보기 = 큰 사진)');
{
  eq('0 이면 0',_vfbgBlurPx(0,360),0);
  const 작=_vfbgBlurPx(.4,360),큰=_vfbgBlurPx(.4,1080);
  eq('상자가 3배면 흐림도 3배',Math.round(큰/작),3);
}

// ═══ 3. 배경 CSS — 층 순서와 대체 배경 ═══
console.log('\n시나리오 3 — 사진이 있을 때와 없을 때');
{
  const p=_vfbgNew('starry',{bg:['#0b1220','#141d33'],avg:'#0f1626',ac:'#7da2ff',lum:.02},'밤하늘','ub_t1');
  const 있음=_vfbgBgCss(p,'data:image/webp;base64,AAA');
  ok('사진이 들어간다',있음.indexOf("url('data:image/webp")>=0);
  eq('style 속성을 깨뜨리는 큰따옴표가 없다',있음.indexOf('"')>=0,false);
  ok('스크림이 사진보다 앞에 온다(위에 덮인다)',
     있음.indexOf('gradient')>=0&&있음.indexOf('gradient')<있음.indexOf('url('));
  ok('별밤은 이미 어두운 사진에서도 템플릿의 깊이를 지킨다',
     p.ed.dark>=VFBG_TEMPLATES.starry.dark-0.001);
  ok('맨 뒤에 색이 깔린다(사진이 늦게 떠도 흰 화면이 없다)',있음.indexOf('#0b1220')>=0);
  const 없음=_vfbgBgCss(p,null);
  eq('사진이 없으면 url 이 없다',없음.indexOf('url(')>=0,false);
  ok('그래도 색은 남는다',없음.indexOf('#0b1220')>=0&&없음.indexOf('#141d33')>=0);
}
console.log('\n시나리오 3-2 — 사진이 아직 안 온 기기에서도 화면이 비지 않는다');
{
  const p=_vfbgNew('glass',{bg:['#2b1c3a','#4a2f52'],avg:'#3a2545',ac:'#c084fc'},'보라','ub_t2');
  p.hasPhoto=true;
  const t=_vfbgThemeOf(p,null);       // 다른 기기: 사진이 없다
  ok('배경값이 비어 있지 않다',!!t.photoCss&&t.photoCss.length>10);
  eq('글자색이 그대로다',t.tx,p.tx.color);
  ok('보조색이 앱 규칙(_rgba)으로 파생된다',/^rgba\(/.test(t.tx2));
  eq('그레인이 템플릿 값 그대로',t.grain,p.ed.grain);
}

// ═══ 4. 저장 상한 — 설정은 클라우드 문서에 실려 다닌다 ═══
console.log('\n시나리오 4 — 개수·용량 상한');
{
  const list=[];
  for(let i=0;i<VFBG_MAX;i++)list.push(_vfbgNew('starry',null,'배경'+i,'ub_'+i));
  eq('가득 찼을 때 새 배경은 거절',/12개까지/.test(_vfbgCheck(list,_vfbgNew('starry',null,'또','ub_new'))||''),true);
  eq('가득 차도 있던 것 고치기는 통과',_vfbgCheck(list,list[3]),null);
  const big=_vfbgNew('starry',null,'큰것','ub_big');
  big.thumb='d'.repeat(VFBG_THUMB_MAX+1);
  ok('미리보기가 크면 거절',/미리보기/.test(_vfbgCheck([],big)||''));
  const noPal=_vfbgNew('starry',null,'색없음','ub_np');noPal.pal={bg:[]};
  ok('색을 못 뽑았으면 거절',/색/.test(_vfbgCheck([],noPal)||''));
  eq('멀쩡한 것은 통과',_vfbgCheck([],_vfbgNew('film',null,'필름','ub_ok')),null);
}
console.log('\n시나리오 4-2 — 설정에 실리는 무게');
{
  // 12개를 가득 채운 뒤 JSON 크기. 클라우드 문서 한도(1MB)에 견주어 넉넉해야 한다.
  const list=[];
  for(let i=0;i<VFBG_MAX;i++){
    const p=_vfbgNew('starry',null,'배경'+i,'ub_'+i);
    p.thumb='d'.repeat(VFBG_THUMB_MAX);      // 최악(미리보기 상한을 꽉 채운 경우)
    list.push(p);
  }
  const kb=JSON.stringify(list).length/1024;
  ok('가득 채워도 30KB 아래 ('+kb.toFixed(1)+'KB)',kb<30);
}

// ═══ 5. 템플릿 — 틀만 갈아 끼운다 ═══
console.log('\n시나리오 5 — 템플릿을 바꿔도 사진·자리·이름은 그대로');
{
  const p=_vfbgNew('starry',{bg:['#0b1220','#141d33'],avg:'#0f1626',ac:'#7da2ff'},'밤하늘','ub_t3');
  p.hasPhoto=true;p.thumb='data:x';p.ed.focusX=.2;p.ed.focusY=.8;p.ed.zoom=1.6;
  _vfbgApplyTpl(p,'inkphoto');
  eq('이름 그대로',p.name,'밤하늘');
  eq('사진 그대로',p.thumb,'data:x');
  eq('자리 그대로',[p.ed.focusX,p.ed.focusY,p.ed.zoom],[.2,.8,1.6]);
  eq('틀이 바뀐다(먹지=흑백)',p.ed.sat,0);
  eq('글씨체도 틀을 따른다',p.tx.font,'serif');
  ok('바꾼 뒤에도 읽힌다',_vfbgContrast(_vfbgMix(p.pal.avg,_vfbgScrimHex(p.tx.color),p.ed.dark),p.tx.color)>=4.5);
  eq('모든 템플릿이 label 을 갖는다',VFBG_TPL_ORDER.filter(k=>!(VFBG_TEMPLATES[k]&&VFBG_TEMPLATES[k].label)).length,0);
}

// ═══ 6. 기본 테마와 절대 안 겹친다 ═══
console.log('\n시나리오 6 — 프리셋 키는 기본 테마 여덟 개와 갈린다');
{
  ['paper','ink','dawn','sanctuary','night','aurora','riso','neon'].forEach(k=>
    eq(k+' 는 내 배경이 아니다',_vfbgIsUserKey(k),false));
  eq('내 배경 id 는 ub_ 로 시작',_vfbgIsUserKey(_vfbgNew('starry',null,'x','ub_zz').id),true);
  eq('없는 id 를 찾으면 null',_vfbgFind([],'ub_없음'),null);
}

// ═══ 7. 기본 테마 모양으로 읽힌다 (기존 코드가 그대로 쓴다) ═══
console.log('\n시나리오 7 — VF_PATTERNS 한 칸과 같은 모양');
{
  const p=_vfbgNew('poster',{bg:['#123','#456'],avg:'#234567',ac:'#ffcc00'},'포스터','ub_t4');
  const pat=_vfbgAsPattern(p);
  ['label','font','fw','grain','vig','ls','ang','variants'].forEach(k=>
    ok('칸 '+k+' 이 있다',pat[k]!==undefined));
  eq('색 변형은 한 벌',pat.variants.length,1);
  ['bg','tx','ac'].forEach(k=>ok('변형에 '+k,pat.variants[0][k]!==undefined));
  eq('font 는 serif 아니면 sans',['serif','sans'].indexOf(pat.font)>=0,true);
}

// ═══ 8. 글씨 그림자 ═══
console.log('\n시나리오 8 — 그림자는 글씨색의 반대편');
{
  const light=_vfbgNew('starry',{bg:['#000','#111'],avg:'#0a0a0a',ac:'#fff'},'a','ub_t5');
  ok('밝은 글씨 → 검은 그림자',_vfbgShadowCss(light).indexOf('rgba(0,0,0')>=0);
  const dark=_vfbgNew('window',{bg:['#fff','#eee'],avg:'#f0f0f0',ac:'#333'},'b','ub_t6');
  ok('어두운 글씨 → 흰 번짐',_vfbgShadowCss(dark).indexOf('rgba(255,255,255')>=0);
  const none=_vfbgNew('starry',null,'c','ub_t7');none.tx.shadow=0;
  eq('0 이면 아무것도 없다',_vfbgShadowCss(none),'');
}

// ═══ 9. 사진을 지우는 길은 하나뿐인가 (2026-08-02 대량 삭제 규칙) ═══
// 원격에서 목록이 비어 와도, 사진첩을 훑어 지우는 코드가 있으면 안 된다.
console.log('\n시나리오 9 — 사진을 지우는 자리는 사용자 손 하나뿐');
{
  const 본문=fs.existsSync(path.join(__dirname,'vf-bg.js'))
    ?fs.readFileSync(path.join(__dirname,'vf-bg.js'),'utf-8'):SRC;
  const 부른곳=(본문.match(/_vfbgDrop\(/g)||[]).length;
  eq('_vfbgDrop 은 정의 1 + 호출 1 뿐',부른곳,2);
  ok('지우기는 확인 대화 뒤에 있다',/appConfirm\([^)]*지울까요[\s\S]{0,400}_vfbgDrop\(/.test(본문));
  eq('목록을 훑어 지우는 코드가 없다',/forEach\([^)]*_vfbgDrop/.test(본문),false);
  eq('보관소를 통째로 비우는 코드가 없다',/\.clear\(/.test(본문),false);
  eq('보관소를 직접 열어 훑는 코드가 없다',/objectStore\(|openCursor/.test(본문),false);
}

console.log('\n결과: 통과',pass,'/ 실패',fail);
process.exit(fail?1:0);
