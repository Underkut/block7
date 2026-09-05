/* ══════════════════════════════════════════════════════════════════════════
   BLOCK7 — 말씀 전체화면 '내 배경' (사진 배경 + 템플릿 프리셋)
   ──────────────────────────────────────────────────────────────────────────
   ⚠️ 아직 index.html 에 들어가지 않은 코드다. 붙이는 자리는
      lab/vf-bg/INTEGRATION.md 에 한 줄씩 적어 두었다.

   무엇인가 —
     사용자가 자기 사진(예: 밤하늘)을 올려 전체화면 배경으로 쓴다.
     사진 한 장 + 템플릿 하나 = 배경 프리셋 하나. 만들어진 프리셋은
     기본 테마 여덟 개와 **똑같은 자격**으로 칩에 서고, 시간구간 배정에도
     그대로 들어간다.

   설계의 뼈대 (자세한 것은 lab/vf-bg/설계.md) —
     ① 이음매는 CSS 변수 --vf-bgimg **한 곳**이다. 전체화면·타일뷰·앱 바탕이
        이미 이 값을 쓰고 있으므로, 사진도 그 값에 얹으면 화면 구조를 하나도
        안 건드린다. #verseFull 안에 새 요소를 넣지 않는다.
     ② 사진은 **미리 구워서**(crop·축소·흐림·색감까지 적용) 한 장으로 둔다.
        화면에서는 filter 를 돌리지 않는다 — 넘길 때 버벅이지 않게.
        어둡기(스크림)·그레인·비네트만 CSS 로 얹는다 (언제든 즉시 바뀐다).
     ③ 사진은 **클라우드에 올리지 않는다.** IndexedDB(기기)에만 둔다.
        설정에는 작은 정보(이름·템플릿·편집값·팔레트·1KB 미리보기)만 남아
        동기화된다. 사진이 없는 기기는 팔레트 그라디언트와 미리보기로
        같은 분위기를 낸다 — 화면이 비지 않는다.
     ④ 사진을 **자동으로 지우는 길은 없다.** 원격에서 프리셋 목록이 비어
        와도 IndexedDB 는 건드리지 않는다 (2026-08-02 대량 삭제 사고 규칙).
   ══════════════════════════════════════════════════════════════════════════ */

// 프리셋 개수 상한. 설정(클라우드 문서)에 실려 다니는 값이라 상한이 필요하다.
const VFBG_MAX=12;
// 설정에 넣는 미리보기 이미지의 글자수 상한(base64). 12개 × 1.6KB ≈ 19KB.
const VFBG_THUMB_MAX=1600;
const VFBG_LONG=1400;        // 구운 사진 긴 변(px) — 4K 공유 이미지에도 충분하다
const VFBG_SRC_LONG=1800;    // 재편집용 원본 긴 변(px)
const VFBG_PREFIX='ub_';     // 프리셋 id 접두 — 기본 테마 키와 절대 안 겹친다

// ── 템플릿 (사진 위에 얹는 '틀') ─────────────────────────────────────────
// 사진을 올리면 이 중 하나를 고르는 것만으로 완성된다. 세부는 그 뒤에 만진다.
// ⚠️ 값의 뜻: blur/sat/warm 은 **구워 넣는 것**, dark/grain/vig/shadow 는
//    화면에서 CSS 로 얹는 것. 나누는 기준은 "나중에 바꿔도 사진을 다시
//    굽지 않아도 되는가" 이다.
const VFBG_TEMPLATES={
  starry:{label:'별밤',desc:'밤하늘·야경. 깊게 가라앉히고 흰 글씨를 얹어요.',
    font:'sans',fw:300,ls:'0',blur:.06,sat:1.05,warm:-.06,
    dark:.46,scrim:'center',grain:.10,vig:.62,shadow:.35,ink:'light'},
  window:{label:'창가',desc:'밝은 사진. 하얗게 덮고 검은 명조를 얹어요.',
    font:'serif',fw:400,ls:'.01em',blur:.10,sat:.92,warm:.08,
    dark:.30,scrim:'even',grain:.16,vig:.14,shadow:.12,ink:'dark'},
  glass:{label:'유리',desc:'사진을 크게 흐려 색만 남겨요. 어떤 사진이든 안전해요.',
    font:'sans',fw:300,ls:'.02em',blur:.42,sat:1.12,warm:0,
    dark:.34,scrim:'even',grain:.06,vig:.38,shadow:.20,ink:'light'},
  film:{label:'필름',desc:'채도를 낮추고 거친 결을 얹어요.',
    font:'sans',fw:300,ls:'0',blur:0,sat:.74,warm:.16,
    dark:.34,scrim:'updown',grain:.44,vig:.30,shadow:.30,ink:'light'},
  inkphoto:{label:'먹지',desc:'흑백으로 바꾸고 종이결을 얹어요. 명조체.',
    font:'serif',fw:400,ls:'.01em',blur:.03,sat:0,warm:.05,
    dark:.38,scrim:'center',grain:.40,vig:.26,shadow:.22,ink:'light'},
  poster:{label:'포스터',desc:'또렷하게. 사진을 살리고 글씨만 세워요.',
    font:'sans',fw:400,ls:'.01em',blur:0,sat:1.18,warm:0,
    dark:.52,scrim:'updown',grain:.08,vig:.46,shadow:.45,ink:'light'}
};
const VFBG_TPL_ORDER=['starry','window','glass','film','inkphoto','poster'];

// ══════════════════ VFBG:PURE-START ══════════════════
// 여기부터 PURE-END 까지는 **브라우저 없이도 도는 계산**이다.
// lab/vf-bg/test_vfbg.js 가 이 구간을 그대로 떠서 검사한다.
// ⚠️ 이 두 표시줄을 지우지 말 것 — 지우면 테스트가 큰 소리로 죽는다.

function _vfbgRgb(c){
  let s=String(c||'').trim().replace('#','');
  if(s.length===3)s=s.split('').map(x=>x+x).join('');
  const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);
  return[r,g,b].some(isNaN)?{r:0,g:0,b:0}:{r,g,b};
}
function _vfbgHex(r,g,b){
  const h=n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
  return'#'+h(r)+h(g)+h(b);
}
// WCAG 상대 휘도 (0=검정 … 1=흰색)
function _vfbgLum(c){
  const{r,g,b}=_vfbgRgb(c);
  const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
  return .2126*f(r)+.7152*f(g)+.0722*f(b);
}
// 명암비 1(같은 색) ~ 21(검정↔흰색). 4.5 가 본문 글씨의 통상 기준선이다.
function _vfbgContrast(a,b){
  const x=_vfbgLum(a),y=_vfbgLum(b);
  return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function _vfbgMix(a,b,t){
  const A=_vfbgRgb(a),B=_vfbgRgb(b);
  return _vfbgHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t);
}
// 스크림은 무슨 색인가 — 글씨가 밝으면 검정, 글씨가 어두우면 흰색.
function _vfbgScrimHex(txHex){return _vfbgLum(txHex)>.5?'#000000':'#ffffff';}
// ── 자동 가독성 ───────────────────────────────────────────────────────
// 사진의 본문 자리 평균색 위에 스크림을 얼마나 덮어야 글씨가 읽히는가.
// 알파를 0 부터 조금씩 올려 보며 **처음으로 기준(want)을 넘는 값**을 준다.
// ⚠️ 휘도끼리 섞으면 안 된다 — 화면에서 섞이는 것은 색(sRGB)이다.
function _vfbgAutoScrim(avgHex,txHex,want){
  const goal=want||4.5,sc=_vfbgScrimHex(txHex);
  for(let a=0;a<=.86;a+=.02){
    if(_vfbgContrast(_vfbgMix(avgHex,sc,a),txHex)>=goal)return Math.round(a*100)/100;
  }
  return .86;
}
// 이 사진에는 밝은 글씨인가 어두운 글씨인가 (평균색에서 더 잘 읽히는 쪽)
function _vfbgAutoInk(avgHex){
  return _vfbgContrast(avgHex,'#ffffff')>=_vfbgContrast(avgHex,'#111111')?'light':'dark';
}

// ── 사진을 상자에 'cover' 로 앉힐 때의 자리 ────────────────────────────
// CSS `background-size:cover` + `background-position:fx% fy%` 와 **같은 계산**이다.
// 화면(CSS)과 공유 이미지(캔버스)가 같은 그림이 되려면 여기 하나만 봐야 한다.
function _vfbgCover(iw,ih,W,H,fx,fy){
  const k=Math.max(W/iw,H/ih),w=iw*k,h=ih*k;
  return{x:(W-w)*(fx==null?.5:fx),y:(H-h)*(fy==null?.5:fy),w,h};
}
// 흐림 세기(0~1)를 실제 픽셀로. 상자의 짧은 변을 기준으로 잡아야
// 미리보기(작은 상자)와 구운 사진(큰 상자)이 **같은 정도로** 흐려진다.
function _vfbgBlurPx(v,shortEdge){return Math.round((v||0)*.085*(shortEdge||360));}

// ── 스크림 CSS 한 겹 ───────────────────────────────────────────────────
function _vfbgScrimCss(p){
  const ed=p.ed||{},a=Math.max(0,Math.min(.9,ed.dark||0));
  if(a<=0)return'';
  const{r,g,b}=_vfbgRgb(_vfbgScrimHex((p.tx||{}).color||'#ffffff'));
  const c=t=>`rgba(${r},${g},${b},${Math.round(a*t*1000)/1000})`;
  if(ed.scrim==='center')                       // 본문 자리만 눌러 준다
    return`radial-gradient(120% 78% at 50% 46%,${c(1)} 0%,${c(.55)} 58%,${c(.18)} 100%)`;
  if(ed.scrim==='updown')                       // 사진 가운데를 살린다
    return`linear-gradient(180deg,${c(1)} 0%,${c(.22)} 42%,${c(.28)} 58%,${c(1)} 100%)`;
  return`linear-gradient(0deg,${c(1)},${c(1)})`;// 고르게
}
// 최종 background 값. 사진이 있으면 [스크림 → 사진 → 팔레트색],
// 없으면 팔레트 그라디언트만 (다른 기기·불러오기 전에도 화면이 비지 않는다).
function _vfbgBgCss(p,src){
  const pal=(p.pal&&p.pal.bg&&p.pal.bg.length)?p.pal.bg:['#12141a','#1b1f28'];
  const grad=pal.length===1?pal[0]:`linear-gradient(165deg,${pal.join(',')})`;
  if(!src)return grad;
  const ed=p.ed||{},fx=Math.round((ed.focusX==null?.5:ed.focusX)*100);
  const fy=Math.round((ed.focusY==null?.5:ed.focusY)*100);
  const sc=_vfbgScrimCss(p);
  // ⚠️ url 은 **작은따옴표**로 감싼다. 이 값은 style="…" 안에도 그대로 들어가는데
  //    큰따옴표를 쓰면 거기서 속성이 끊겨 칩 미리보기가 통째로 깨진다.
  return`${sc?sc+',':''}url('${src}') ${fx}% ${fy}%/cover no-repeat,${grad}`;
}
// 글씨 그림자 — 사진 위에서 글자가 뜨게 한다. 밝은 글씨는 검은 그림자,
// 어두운 글씨는 흰 번짐(사진의 밝은 부분에서도 읽히게).
function _vfbgShadowCss(p){
  const s=Math.max(0,Math.min(1,(p.tx||{}).shadow||0));
  if(s<=0.01)return'';
  const dark=_vfbgLum((p.tx||{}).color||'#fff')>.5;
  const c=a=>dark?`rgba(0,0,0,${Math.round(a*1000)/1000})`:`rgba(255,255,255,${Math.round(a*1000)/1000})`;
  return`0 1px 2px ${c(s*.45)},0 2px ${Math.round(6+s*18)}px ${c(s*.55)}`;
}

// ── 프리셋 만들기 · 검사 ───────────────────────────────────────────────
function _vfbgTplOf(key){return VFBG_TEMPLATES[key]||VFBG_TEMPLATES.starry;}
function _vfbgIsUserKey(k){return typeof k==='string'&&k.indexOf(VFBG_PREFIX)===0;}
function _vfbgFind(list,id){
  return(Array.isArray(list)?list:[]).find(p=>p&&p.id===id)||null;
}
// 팔레트(사진에서 뽑은 색) 위에 템플릿을 얹어 프리셋 한 개를 만든다.
function _vfbgNew(tplKey,pal,name,id){
  const t=_vfbgTplOf(tplKey);
  const P=pal||{bg:['#12141a','#1b1f28'],avg:'#20242c',ac:'#8fb4ff',lum:.12};
  const ink=t.ink==='auto'?_vfbgAutoInk(P.avg):t.ink;
  const color=ink==='dark'?_vfbgMix(P.avg,'#000000',.86):_vfbgMix(P.avg,'#ffffff',.92);
  return{
    id:id||(VFBG_PREFIX+Date.now().toString(36)+Math.random().toString(36).slice(2,5)),
    name:name||t.label,tpl:tplKey,hasPhoto:false,photoAt:0,thumb:'',
    pal:{bg:P.bg.slice(),avg:P.avg,lum:P.lum},
    // ⚠️ 어둡기는 **템플릿의 분위기와 가독성 바닥선 중 큰 값**이다.
    //    자동값만 쓰면 밤하늘처럼 이미 어두운 사진에서 스크림이 0 이 되어
    //    템플릿(별밤)이 의도한 깊이가 사라진다. 반대로 템플릿 값만 쓰면
    //    밝은 사진에서 글씨가 묻힌다.
    ed:{focusX:.5,focusY:.45,zoom:1,blur:t.blur,sat:t.sat,warm:t.warm,
        dark:Math.max(t.dark,_vfbgAutoScrim(P.avg,color,4.5)),
        scrim:t.scrim,grain:t.grain,vig:t.vig},
    tx:{font:t.font,fw:t.fw,ls:t.ls,color,ac:P.ac||_vfbgMix(color,P.avg,.45),shadow:t.shadow},
    ver:1
  };
}
// 템플릿만 갈아 끼운다 — 사진·자리·이름은 그대로 두고 '틀'만 바꾼다.
function _vfbgApplyTpl(p,tplKey){
  const t=_vfbgTplOf(tplKey),P=p.pal||{};
  const ink=t.ink==='auto'?_vfbgAutoInk(P.avg||'#202020'):t.ink;
  const color=ink==='dark'?_vfbgMix(P.avg||'#202020','#000000',.86)
                          :_vfbgMix(P.avg||'#202020','#ffffff',.92);
  p.tpl=tplKey;
  p.ed=Object.assign({},p.ed,{blur:t.blur,sat:t.sat,warm:t.warm,scrim:t.scrim,
                              grain:t.grain,vig:t.vig});
  p.tx=Object.assign({},p.tx,{font:t.font,fw:t.fw,ls:t.ls,color,shadow:t.shadow});
  p.ed.dark=Math.max(t.dark,_vfbgAutoScrim(P.avg||'#202020',color,4.5));
  return p;
}
// 저장해도 되는가. 안 되면 **까닭을 한국어로** 돌려준다 (그대로 토스트에 쓴다).
function _vfbgCheck(list,one){
  const arr=Array.isArray(list)?list:[];
  if(!one||!one.id)return'배경을 만들지 못했어요';
  const isNew=!_vfbgFind(arr,one.id);
  if(isNew&&arr.length>=VFBG_MAX)return`배경은 ${VFBG_MAX}개까지 만들 수 있어요. 하나를 지우고 다시 해주세요`;
  if((one.thumb||'').length>VFBG_THUMB_MAX)return'미리보기가 너무 커요 (다시 만들어 주세요)';
  if(!one.pal||!Array.isArray(one.pal.bg)||!one.pal.bg.length)return'사진에서 색을 뽑지 못했어요';
  return null;
}
// 기본 테마 모양(VF_PATTERNS 의 한 칸)으로 바꿔 준다.
// 이렇게 해 두면 칩·시간구간 배정·말씀카드 같은 **기존 코드가 그대로** 읽는다.
function _vfbgAsPattern(p){
  const t=_vfbgTplOf(p.tpl),tx=p.tx||{},ed=p.ed||{},pal=p.pal||{};
  return{label:p.name||t.label,font:tx.font==='serif'?'serif':'sans',
    fw:tx.fw||t.fw,grain:ed.grain||0,vig:ed.vig||0,ls:tx.ls||'0',ang:165,
    user:true,id:p.id,
    variants:[{bg:(pal.bg&&pal.bg.length)?pal.bg:['#12141a','#1b1f28'],
               tx:tx.color||'#ffffff',ac:tx.ac||'#9ab6ff'}]};
}
// _vfTheme() 이 돌려주는 것과 **같은 모양** + 사진 관련 몇 가지.
// rgba 는 앱의 _rgba 를 그대로 쓴다 (색 파생 규칙이 두 벌이 되면 반드시 어긋난다).
function _vfbgThemeOf(p,src){
  const pat=_vfbgAsPattern(p),v=pat.variants[0],ed=p.ed||{};
  return{label:pat.label,font:pat.font,fw:pat.fw,grain:pat.grain,vig:pat.vig,
    ls:pat.ls,ang:pat.ang,bg:v.bg,tx:v.tx,ac:v.ac,
    tx2:_rgba(v.tx,.60),tx3:_rgba(v.tx,.42),tile:_rgba(v.tx,.06),
    user:true,id:p.id,
    photoCss:_vfbgBgCss(p,src),photoSrc:src||null,
    focus:[ed.focusX==null?.5:ed.focusX,ed.focusY==null?.45:ed.focusY],
    scrim:{hex:_vfbgScrimHex(v.tx),a:Math.max(0,Math.min(.9,ed.dark||0)),mode:ed.scrim||'even'},
    tsh:_vfbgShadowCss(p)};
}
// ══════════════════ VFBG:PURE-END ══════════════════

// ══════════════════════════════════════════════════════════════════════════
//  사진 보관 (IndexedDB) — 앱의 _idbGet/_idbSet/_idbDel 을 그대로 쓴다
//  ⚠️ 사진은 클라우드에 올라가지 않는다. 여기 있는 것이 전부다.
//  ⚠️ **자동으로 지우는 길을 만들지 말 것.** 지우는 곳은 _vfbgDrop 한 곳이고,
//     그것을 부르는 곳은 사용자가 '배경 지우기' 를 누른 자리 하나뿐이다.
// ══════════════════════════════════════════════════════════════════════════
const _vfbgCache={};      // id → 구운 사진 dataURL (이 세션 동안)
const _vfbgImgs={};       // id → Image (공유 이미지 캔버스가 바로 그릴 수 있게)
const _vfbgAsking={};     // id → true (중복 요청 막기)

function _vfbgIdbKey(id,which){return'b7bg:'+id+(which==='src'?':src':'');}
function _vfbgList(){
  const s=(typeof ST!=='undefined'&&ST.settings)||{};
  return Array.isArray(s.vfBgs)?s.vfBgs:[];
}
// 지금 당장 쓸 수 있는 사진 (없으면 null — 부르는 쪽이 미리보기로 대신한다)
function _vfbgPhotoNow(id){return _vfbgCache[id]||null;}
// 사진을 보관소에서 불러온다. 오면 화면을 한 번 다시 칠한다.
function _vfbgEnsure(id){
  if(_vfbgCache[id]||_vfbgAsking[id])return;
  _vfbgAsking[id]=true;
  Promise.resolve(_idbGet(_vfbgIdbKey(id))).then(v=>{
    _vfbgAsking[id]=false;
    if(!v||!v.full)return;
    _vfbgCache[id]=v.full;
    _vfbgPreload(id);
    // 사진이 이제 왔으니 배경을 다시 흘려보낸다 (미리보기 → 진짜 사진)
    if(typeof applyVfTheme==='function')applyVfTheme();
  }).catch(()=>{_vfbgAsking[id]=false;});
}
// 공유 이미지(캔버스)는 기다려 주지 않는다 — 미리 Image 로 풀어 둔다.
function _vfbgPreload(id){
  const src=_vfbgCache[id];if(!src)return;
  if(_vfbgImgs[id]&&_vfbgImgs[id].src===src)return;
  const im=new Image();im.decoding='async';im.src=src;_vfbgImgs[id]=im;
}
function _vfbgPut(id,full,src){
  _vfbgCache[id]=full;_vfbgPreload(id);
  return Promise.resolve(_idbSet(_vfbgIdbKey(id),{full,at:Date.now()}))
    .then(()=>src?_idbSet(_vfbgIdbKey(id,'src'),{src,at:Date.now()}):true);
}
function _vfbgGetSrc(id){
  return Promise.resolve(_idbGet(_vfbgIdbKey(id,'src'))).then(v=>(v&&v.src)||null).catch(()=>null);
}
function _vfbgDrop(id){
  delete _vfbgCache[id];delete _vfbgImgs[id];
  return Promise.all([_idbDel(_vfbgIdbKey(id)),_idbDel(_vfbgIdbKey(id,'src'))]).catch(()=>{});
}

// ══════════════════════════════════════════════════════════════════════════
//  사진 굽기 — 고른 사진 한 장을 '화면에 바로 깔 수 있는 한 장'으로 만든다
//  자르기(zoom·focus) · 축소 · 흐림 · 채도 · 색온도까지 여기서 끝낸다.
//  ⚠️ 화면에서 filter 를 돌리지 않는 까닭: 전체화면은 손가락으로 넘기는
//     화면이다. 배경에 blur 가 걸려 있으면 넘길 때마다 다시 계산되어 버벅인다.
// ══════════════════════════════════════════════════════════════════════════
function _vfbgDecode(file){
  // 아이폰 사진은 회전 정보(EXIF)가 따로 붙어 온다 — from-image 로 바로잡는다.
  if(typeof createImageBitmap==='function'){
    return createImageBitmap(file,{imageOrientation:'from-image'}).catch(()=>_vfbgDecodeImg(file));
  }
  return _vfbgDecodeImg(file);
}
function _vfbgDecodeImg(file){
  return new Promise((res,rej)=>{
    const u=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{URL.revokeObjectURL(u);res(im);};
    im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('사진을 읽지 못했어요'));};
    im.src=u;
  });
}
function _vfbgSize(im){
  return{w:im.naturalWidth||im.width,h:im.naturalHeight||im.height};
}
// 긴 변을 long 으로 맞춘 크기 (원본이 더 작으면 키우지 않는다)
function _vfbgFit(w,h,long){
  const k=Math.min(1,long/Math.max(w,h));
  return{w:Math.max(1,Math.round(w*k)),h:Math.max(1,Math.round(h*k))};
}
// webp 를 쓸 수 있으면 webp(같은 화질에 30~40% 작다), 안 되면 jpeg
let _vfbgFmt=null;
function _vfbgEncode(cv,q){
  if(_vfbgFmt===null){
    try{_vfbgFmt=cv.toDataURL('image/webp',.5).indexOf('image/webp')>0?'image/webp':'image/jpeg';}
    catch(e){_vfbgFmt='image/jpeg';}
  }
  return cv.toDataURL(_vfbgFmt,q);
}
// 흐림 + 채도를 **한 번에** 건다.
// ⚠️ ctx.filter 는 통째로 갈아치우는 값이다 — blur 와 saturate 를 따로 걸면
//    뒤에 건 것만 남아 채도가 조용히 사라진다.
// ctx.filter 가 없는 브라우저(옛 사파리)에서는 줄였다 키우는 옛 수법으로 흐린다.
function _vfbgBlurDraw(ctx,im,sx,sy,sw,sh,dx,dy,dw,dh,px,filt){
  if('filter' in ctx){
    ctx.save();if(filt)ctx.filter=filt;
    ctx.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);
    ctx.restore();return;
  }
  if(!px){ctx.drawImage(im,sx,sy,sw,sh,dx,dy,dw,dh);return;}
  const k=Math.max(2,Math.round(px/1.5));
  const tw=Math.max(2,Math.round(dw/k)),th=Math.max(2,Math.round(dh/k));
  const t=document.createElement('canvas');t.width=tw;t.height=th;
  t.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,tw,th);
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.drawImage(t,0,0,tw,th,dx,dy,dw,dh);ctx.restore();
}
// 사진 한 장 굽기 → {full, thumb, pal, w, h}
// ⚠️ 흐림은 가장자리를 갉아먹는다(바깥의 빈 곳을 함께 섞기 때문에).
//    그래서 상자보다 조금 크게 그린 뒤 흐린다 — 가장자리에 흰 테가 안 생긴다.
function _vfbgBake(im,ed){
  const s=_vfbgSize(im);
  const zoom=Math.max(1,Math.min(3,(ed&&ed.zoom)||1));
  // 확대한 만큼 원본을 잘라 낸다 (자리는 focus 를 따른다)
  const cw=s.w/zoom,ch=s.h/zoom;
  const cx=(s.w-cw)*((ed&&ed.focusX)==null?.5:ed.focusX);
  const cy=(s.h-ch)*((ed&&ed.focusY)==null?.45:ed.focusY);
  const out=_vfbgFit(cw,ch,VFBG_LONG);
  const cv=document.createElement('canvas');cv.width=out.w;cv.height=out.h;
  const ctx=cv.getContext('2d');
  const px=_vfbgBlurPx((ed&&ed.blur)||0,Math.min(out.w,out.h));
  const over=px?Math.ceil(px*2):0;                 // 가장자리 여유
  const sat=Math.max(0,(ed&&ed.sat)==null?1:ed.sat);
  const filt=`blur(${px}px) saturate(${sat})`;
  _vfbgBlurDraw(ctx,im,cx,cy,cw,ch,-over,-over,out.w+over*2,out.h+over*2,px,filt);
  // 채도 필터가 없는 브라우저 대비 — 흑백만은 손으로도 만들 수 있다 ('먹지' 템플릿)
  if(!('filter' in ctx)&&sat===0)_vfbgGrayscale(ctx,out.w,out.h);
  // 색온도 — 따뜻하게/차갑게 (overlay 로 얹어야 밝기를 안 잃는다)
  const warm=(ed&&ed.warm)||0;
  if(Math.abs(warm)>.01){
    ctx.save();ctx.globalCompositeOperation='overlay';
    ctx.fillStyle=warm>0?`rgba(255,170,80,${Math.min(.5,warm*.55)})`
                        :`rgba(90,150,255,${Math.min(.5,-warm*.55)})`;
    ctx.fillRect(0,0,out.w,out.h);ctx.restore();
  }
  return{full:_vfbgEncode(cv,.86),thumb:_vfbgThumbOf(cv),pal:_vfbgPalette(cv),w:out.w,h:out.h};
}
function _vfbgGrayscale(ctx,w,h){
  try{
    const d=ctx.getImageData(0,0,w,h),a=d.data;
    for(let i=0;i<a.length;i+=4){
      const y=a[i]*.2126+a[i+1]*.7152+a[i+2]*.0722;
      a[i]=a[i+1]=a[i+2]=y;
    }
    ctx.putImageData(d,0,0);
  }catch(e){}
}
// 아주 작은 미리보기 — 설정(클라우드)에 실려 다닌다. 1KB 안쪽이어야 한다.
// 작으니 흐릿하게 보이는데, 그게 오히려 사진 오기 전 배경으로 알맞다.
function _vfbgThumbOf(cv){
  const w=20,h=Math.max(8,Math.round(20*cv.height/cv.width));
  const t=document.createElement('canvas');t.width=w;t.height=h;
  t.getContext('2d').drawImage(cv,0,0,w,h);
  let out=_vfbgEncode(t,.6);
  if(out.length>VFBG_THUMB_MAX)out=_vfbgEncode(t,.35);
  return out.length<=VFBG_THUMB_MAX?out:'';
}
// 사진에서 색 뽑기 — 배경 그라디언트 두 색 · 본문 자리 평균색 · 강조색.
// ⚠️ 평균색은 **본문이 앉는 가운데 띠**에서 잰다. 화면 전체로 재면 하늘만
//    밝고 땅은 캄캄한 사진에서 "평균은 중간" 이 되어 글씨가 안 읽힌다.
function _vfbgPalette(cv){
  const N=24,t=document.createElement('canvas');
  const h=Math.max(4,Math.round(N*cv.height/cv.width));
  t.width=N;t.height=h;
  const c=t.getContext('2d');c.drawImage(cv,0,0,N,h);
  let d;try{d=c.getImageData(0,0,N,h).data;}catch(e){
    return{bg:['#12141a','#1b1f28'],avg:'#20242c',ac:'#8fb4ff',lum:.12};
  }
  const sum=(y0,y1)=>{
    let r=0,g=0,b=0,n=0;
    for(let y=Math.max(0,y0);y<Math.min(h,y1);y++)for(let x=0;x<N;x++){
      const i=(y*N+x)*4;r+=d[i];g+=d[i+1];b+=d[i+2];n++;
    }
    return n?{r:r/n,g:g/n,b:b/n}:{r:32,g:36,b:44};
  };
  const top=sum(0,Math.round(h*.45)),bot=sum(Math.round(h*.55),h);
  const mid=sum(Math.round(h*.28),Math.round(h*.78));   // 본문이 앉는 자리
  // 강조색 — 가장 쨍한 화소 하나 (없으면 평균에서 만든다)
  let best=null,bs=-1;
  for(let i=0;i<d.length;i+=4){
    const r=d[i],g=d[i+1],b=d[i+2];
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
    const s=mx?(mx-mn)/mx:0,v=mx/255;
    const score=s*.75+v*.25;
    if(s>.22&&v>.28&&score>bs){bs=score;best=[r,g,b];}
  }
  const avg=_vfbgHex(mid.r,mid.g,mid.b);
  return{
    bg:[_vfbgHex(top.r,top.g,top.b),_vfbgHex(bot.r,bot.g,bot.b)],
    avg,
    ac:best?_vfbgHex(best[0],best[1],best[2]):_vfbgMix(avg,'#ffffff',.55),
    lum:Math.round(_vfbgLum(avg)*1000)/1000
  };
}

// ══════════════════════════════════════════════════════════════════════════
//  앱에 흘려보내기 — 여기 세 함수가 기존 코드와 만나는 자리다
// ══════════════════════════════════════════════════════════════════════════
// 테마 키 하나를 '패턴' 으로. 기본 8종이면 VF_PATTERNS, 내 배경이면 프리셋.
function _vfPat(key){
  if(typeof VF_PATTERNS!=='undefined'&&VF_PATTERNS[key])return VF_PATTERNS[key];
  const p=_vfbgFind(_vfbgList(),key);
  return p?_vfbgAsPattern(p):null;
}
function _vfPatOk(key){return !!_vfPat(key);}
// 내 배경의 테마. 사진이 아직 안 왔으면 미리보기(1KB)로라도 그린다.
function _vfbgTheme(key){
  const p=_vfbgFind(_vfbgList(),key);
  if(!p)return null;
  if(p.hasPhoto)_vfbgEnsure(p.id);
  return _vfbgThemeOf(p,_vfbgPhotoNow(p.id)||p.thumb||null);
}
// 말씀 카드(_vcThemeVars)도 같은 배경을 쓸 수 있게 — 그쪽이 쓰는 모양 그대로 돌려준다.
function _vfbgCardVars(key){
  const t=_vfbgTheme(key);
  if(!t)return null;
  const fam=(t.font==='serif')?VF_SERIF:VF_SANS;
  return{font:t.font,vars:{
    '--vf-bgimg':t.photoCss,'--vf-bg1':(t.bg&&t.bg[0])||'var(--bg)',
    '--vf-tx':t.tx,'--vf-tx2':t.tx2,'--vf-tx3':t.tx3,'--vf-ac':t.ac,
    '--vf-font':fam,'--vf-fw':String(t.fw),'--hi-fw':String(_hiFw(t.font)),
    '--vf-ls':t.ls||'0','--vf-grain':String(t.grain||0),'--vf-vig':String(t.vig||0),
    '--vf-tsh':t.tsh||'none',
    '--vf-reffont':(t.font==='serif')?fam:'var(--font-number)'
  }};
}
// 공유 이미지(캔버스)에 사진 + 스크림 그리기. 그렸으면 true.
// ⚠️ 화면과 **같은 _vfbgCover** 를 쓴다. 여기서 따로 계산하면 반드시 어긋난다.
function _vfbgDrawPhoto(ctx,th,W,H){
  const im=th&&th.id?_vfbgImgs[th.id]:null;
  if(im&&im.complete&&im.naturalWidth){
    const r=_vfbgCover(im.naturalWidth,im.naturalHeight,W,H,th.focus[0],th.focus[1]);
    ctx.drawImage(im,r.x,r.y,r.w,r.h);
  }else if(!th||!th.photoSrc)return false;
  _vfbgDrawScrim(ctx,th,W,H);
  return true;
}
function _vfbgDrawScrim(ctx,th,W,H){
  const s=th.scrim;if(!s||s.a<=0)return;
  const{r,g,b}=_vfbgRgb(s.hex);
  const c=t=>`rgba(${r},${g},${b},${s.a*t})`;
  if(s.mode==='center'){
    const g2=ctx.createRadialGradient(W*.5,H*.46,0,W*.5,H*.46,Math.max(W*.6,H*.39)*1.6);
    g2.addColorStop(0,c(1));g2.addColorStop(.58,c(.55));g2.addColorStop(1,c(.18));
    ctx.fillStyle=g2;
  }else if(s.mode==='updown'){
    const g2=ctx.createLinearGradient(0,0,0,H);
    g2.addColorStop(0,c(1));g2.addColorStop(.42,c(.22));
    g2.addColorStop(.58,c(.28));g2.addColorStop(1,c(1));
    ctx.fillStyle=g2;
  }else ctx.fillStyle=c(1);
  ctx.fillRect(0,0,W,H);
}
// 글씨 그림자 — 화면의 text-shadow 를 캔버스에도 (사진 위에서 글자가 뜨게)
function _vfbgShadowOn(ctx,th,SC){
  if(!th||!th.tsh)return;
  const dark=_vfbgLum(th.tx||'#fff')>.5;
  ctx.shadowColor=dark?'rgba(0,0,0,.5)':'rgba(255,255,255,.5)';
  ctx.shadowBlur=Math.max(2,10*(SC||1));
  ctx.shadowOffsetY=Math.max(1,1.5*(SC||1));
}
function _vfbgShadowOff(ctx){
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
}

// ══════════════════════════════════════════════════════════════════════════
//  설정창 칩 — '테마' 구역 아래 '내 배경'
//  기본 테마 칩과 같은 생김새·같은 크기다. 눌러서 켜고 끄고, 길게 눌러 메뉴.
// ══════════════════════════════════════════════════════════════════════════
function _vfbgChipBg(p){
  const src=_vfbgPhotoNow(p.id)||p.thumb||null;
  return _vfbgBgCss(p,src);
}
function _vfbgRenderChips(){
  const box=document.getElementById('vfbgChips');if(!box)return;
  const list=_vfbgList();
  const sel=(typeof _vfSelectedPatterns==='function')?_vfSelectedPatterns():[];
  list.forEach(p=>{if(p.hasPhoto)_vfbgEnsure(p.id);});
  const add=`<div id="vfbgAdd" onclick="vfbgPickPhoto()" style="cursor:pointer;border-radius:9px;overflow:hidden;-webkit-tap-highlight-color:transparent;">
      <div style="height:46px;display:flex;align-items:center;justify-content:center;border:1px dashed var(--bd2);border-radius:9px;box-sizing:border-box;">
        <span style="color:var(--tx3);font-size:18px;line-height:1;">+</span>
      </div>
      <div style="font-size:10px;color:var(--tx3);text-align:center;padding:4px 0 2px;">사진</div>
    </div>`;
  const chips=list.map(p=>{
    const on=sel.indexOf(p.id)>=0;
    const t=_vfbgThemeOf(p,_vfbgPhotoNow(p.id)||p.thumb||null);
    return`<div data-vfbg="${p.id}" onclick="vfbgChipTap('${p.id}')" style="cursor:pointer;border-radius:9px;overflow:hidden;-webkit-tap-highlight-color:transparent;outline:${on?'2px solid var(--ac)':'none'};outline-offset:1px;opacity:${on?1:.45};">
      <div style="background-color:${(p.pal&&p.pal.bg&&p.pal.bg[0])||'#111'};background:${t.photoCss};height:46px;display:flex;align-items:center;justify-content:center;">
        <span style="color:${t.tx};font-size:11px;font-weight:${t.fw};text-shadow:${t.tsh||'none'};font-family:${t.font==='serif'?VF_SERIF:VF_SANS};">가나다</span>
      </div>
      <div style="font-size:10px;color:var(--tx3);text-align:center;padding:4px 0 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(p.name||'')}</div>
    </div>`;
  }).join('');
  box.innerHTML=add+chips;
  list.forEach(p=>{
    const el=box.querySelector(`[data-vfbg="${p.id}"]`);
    if(el)_vfbgLongPress(el,()=>vfbgChipMenu(p.id));
  });
}
// 보조 동작은 길게 누르기 (앱 전체가 같은 규칙이다). PC 는 우클릭.
function _vfbgLongPress(el,fn){
  let t=null,moved=false;
  const stop=()=>{if(t)clearTimeout(t);t=null;};
  el.addEventListener('touchstart',()=>{moved=false;stop();t=setTimeout(()=>{if(!moved)fn();},520);},{passive:true});
  el.addEventListener('touchmove',()=>{moved=true;stop();},{passive:true});
  el.addEventListener('touchend',stop,{passive:true});
  el.addEventListener('touchcancel',stop,{passive:true});
  el.addEventListener('contextmenu',e=>{e.preventDefault();fn();});
}
function vfbgChipTap(id){
  // 기본 테마 칩과 똑같이 — 켜고 끄기. (고르는 규칙은 한 곳, toggleVfPattern)
  if(typeof toggleVfPattern==='function')toggleVfPattern(id);
  _vfbgRenderChips();
}
function vfbgChipMenu(id){
  const p=_vfbgFind(_vfbgList(),id);if(!p)return;
  _vfbgMenuFor=id;
  const box=document.getElementById('vfbgMenu');if(!box){vfbgEditExisting(id);return;}
  box.style.display='block';
  const nm=document.getElementById('vfbgMenuName');
  if(nm)nm.textContent=p.name||'내 배경';
}
let _vfbgMenuFor=null;
function closeVfbgMenu(){const b=document.getElementById('vfbgMenu');if(b)b.style.display='none';_vfbgMenuFor=null;}
function vfbgMenuEdit(){const id=_vfbgMenuFor;closeVfbgMenu();if(id)vfbgEditExisting(id);}
function vfbgMenuRename(){
  const id=_vfbgMenuFor;closeVfbgMenu();
  const p=_vfbgFind(_vfbgList(),id);if(!p)return;
  const v=prompt('배경 이름',p.name||'');
  if(v==null)return;
  p.name=String(v).trim().slice(0,12)||p.name;
  save();_vfbgRenderChips();applyVfTheme();
}
function vfbgMenuDelete(){
  const id=_vfbgMenuFor;closeVfbgMenu();
  const p=_vfbgFind(_vfbgList(),id);if(!p)return;
  appConfirm(`'${p.name||'내 배경'}' 배경을 지울까요? 사진도 이 기기에서 지워져요.`,()=>{
    // ⚠️ 사진을 지우는 **유일한** 자리다. 사용자가 지금 누른 그 하나만 지운다.
    _vfbgDrop(id);
    const s=ST.settings;
    s.vfBgs=_vfbgList().filter(x=>x.id!==id);
    // 고른 목록에서도 빼 준다 (없는 키가 남으면 배경이 기본값으로 튄다)
    if(Array.isArray(s.vfThemes))s.vfThemes=s.vfThemes.filter(k=>k!==id);
    if(!s.vfThemes||!s.vfThemes.length)s.vfThemes=['night'];
    const map=s.vfThemeBySec||{};
    Object.keys(map).forEach(k=>{map[k]=(map[k]||[]).filter(x=>x!==id);});
    save();
    if(typeof _vfCurPattern!=='undefined'){_vfCurPattern=null;_vfVariantIdx=null;}
    applyVfTheme();_vfbgRenderChips();
    if(typeof _renderVfThemeChips==='function')_renderVfThemeChips();
    showToast('배경을 지웠어요');
  });
}

// ══════════════════════════════════════════════════════════════════════════
//  편집기 — 사진을 고른 뒤 여기서 완성한다
//  ⚠️ 미리보기는 **실제 화면과 같은 그림**이어야 한다. 그래서 미리보기에서는
//     아직 굽지 않은 사진에 CSS filter 를 걸어 같은 값을 흉내내고,
//     저장할 때 그 값 그대로 구워 넣는다 (_vfbgBlurPx 를 둘이 같이 쓴다).
// ══════════════════════════════════════════════════════════════════════════
let _vfbgEd=null;     // {p, src, isNew}

function vfbgPickPhoto(){
  const inp=document.getElementById('vfbgFile');
  if(!inp)return;
  inp.value='';inp.click();
}
function _vfbgOnFile(file){
  if(!file)return;
  if(!/^image\//.test(file.type||'')){showToast('사진 파일만 쓸 수 있어요');return;}
  showToast('사진을 읽는 중…');
  _vfbgDecode(file).then(im=>{
    const src=_vfbgNormalize(im);                 // 재편집·미리보기용 원본
    const first=_vfbgBake(im,{zoom:1,focusX:.5,focusY:.45,blur:0,sat:1,warm:0});
    const p=_vfbgNew('starry',first.pal,'');
    p.hasPhoto=true;p.thumb=first.thumb;
    openVfbgEdit(p,src,true);
  }).catch(e=>showToast((e&&e.message)||'사진을 읽지 못했어요'));
}
function _vfbgNormalize(im){
  const s=_vfbgSize(im),out=_vfbgFit(s.w,s.h,VFBG_SRC_LONG);
  const cv=document.createElement('canvas');cv.width=out.w;cv.height=out.h;
  cv.getContext('2d').drawImage(im,0,0,out.w,out.h);
  return _vfbgEncode(cv,.85);
}
function vfbgEditExisting(id){
  const p=_vfbgFind(_vfbgList(),id);if(!p)return;
  _vfbgGetSrc(id).then(src=>{
    if(!src&&p.hasPhoto){
      showToast('이 기기에 원본이 없어요 — 사진을 다시 골라 주세요');
    }
    openVfbgEdit(JSON.parse(JSON.stringify(p)),src||_vfbgPhotoNow(id)||p.thumb||'',false);
  });
}
function openVfbgEdit(p,src,isNew){
  _vfbgEd={p,src:src||'',isNew:!!isNew};
  const md=document.getElementById('vfbgEdit');if(!md)return;
  md.style.display='flex';
  document.body.classList.add('vfbg-editing');
  _vfbgInitDrag();          // 손가락으로 사진 옮기기 (한 번만 붙는다)
  _vfbgEditRender();
}
function closeVfbgEdit(){
  const md=document.getElementById('vfbgEdit');if(md)md.style.display='none';
  document.body.classList.remove('vfbg-editing');
  _vfbgEd=null;
}
function _vfbgEditIsOpen(){
  const md=document.getElementById('vfbgEdit');
  return !!(md&&md.style.display==='flex');
}
// 미리보기 한 장 그리기 (화면과 같은 층: 사진 → 색온도 → 스크림 → 결/비네트 → 글자)
function _vfbgEditRender(){
  if(!_vfbgEd)return;
  const p=_vfbgEd.p,ed=p.ed,tx=p.tx;
  const stage=document.getElementById('vfbgStage');
  const ph=document.getElementById('vfbgPhoto');
  const wm=document.getElementById('vfbgTint');
  const sc=document.getElementById('vfbgScrim');
  const tt=document.getElementById('vfbgSample');
  if(stage&&ph){
    // ── 미리보기가 실제 화면과 **같은 그림**이 되는 계산 ──────────────────
    // 화면에서는 [원본을 zoom·focus 로 자른 사진] 을 cover 로 깐다.
    // 여기서는 [원본을 cover 로 깔고] focus 자리를 축으로 zoom 배 키운다.
    //   → 둘은 같은 결과다 (자른 뒤 cover = cover 뒤 그 점에서 확대).
    // 흐림은 transform 뒤에 곱해지므로 zoom 으로 나눠 둔다 — 그래야 화면에
    // 나타나는 흐림 정도가 확대와 무관하게 같다.
    const W=stage.clientWidth||320,H=stage.clientHeight||560;
    const px=_vfbgBlurPx(ed.blur,Math.min(W,H));
    const B=px/Math.max(1,ed.zoom);
    const over=1+(B?4*B/W:0);        // 흐릴 때 가장자리가 갉이지 않게 살짝 넓게
    ph.style.backgroundImage=_vfbgEd.src?`url('${_vfbgEd.src}')`:'none';
    ph.style.backgroundColor=(p.pal&&p.pal.bg&&p.pal.bg[0])||'#111';
    ph.style.backgroundSize='cover';
    ph.style.backgroundPosition=`${Math.round(ed.focusX*100)}% ${Math.round(ed.focusY*100)}%`;
    ph.style.transformOrigin=`${Math.round(ed.focusX*100)}% ${Math.round(ed.focusY*100)}%`;
    ph.style.transform=`scale(${ed.zoom*over})`;
    ph.style.filter=`blur(${B}px) saturate(${ed.sat})`;
  }
  if(wm){
    const w=ed.warm||0;
    wm.style.background=Math.abs(w)<.01?'transparent'
      :(w>0?`rgba(255,170,80,${Math.min(.5,w*.55)})`:`rgba(90,150,255,${Math.min(.5,-w*.55)})`);
  }
  if(sc)sc.style.background=_vfbgScrimCss(p)||'transparent';
  if(stage){
    stage.style.setProperty('--vf-grain',String(ed.grain||0));
    stage.style.setProperty('--vf-vig',String(ed.vig||0));
  }
  if(tt){
    tt.style.color=tx.color;
    tt.style.fontFamily=(tx.font==='serif')?VF_SERIF:VF_SANS;
    tt.style.fontWeight=String(tx.fw);
    tt.style.letterSpacing=tx.ls||'0';
    tt.style.textShadow=_vfbgShadowCss(p)||'none';
    const rf=document.getElementById('vfbgSampleRef');
    if(rf){rf.style.color=_rgba(tx.color,.42);rf.style.textShadow=_vfbgShadowCss(p)||'none';}
  }
  // 조절 막대와 템플릿 칩의 현재 값
  const set=(id,v)=>{const e=document.getElementById(id);if(e&&e.value!==String(v))e.value=v;};
  set('vfbgDark',Math.round(ed.dark*100));
  set('vfbgBlur',Math.round(ed.blur*100));
  set('vfbgSat',Math.round(ed.sat*100));
  set('vfbgWarm',Math.round(ed.warm*100));
  set('vfbgGrain',Math.round(ed.grain*100));
  set('vfbgVig',Math.round(ed.vig*100));
  set('vfbgShadow',Math.round((tx.shadow||0)*100));
  const tb=document.getElementById('vfbgTplRow');
  if(tb)tb.innerHTML=VFBG_TPL_ORDER.map(k=>{
    const t=VFBG_TEMPLATES[k],on=p.tpl===k;
    return`<button class="vfbg-tpl${on?' on':''}" onclick="vfbgSetTpl('${k}')">${t.label}</button>`;
  }).join('');
  const ink=document.getElementById('vfbgInkBtn');
  if(ink)ink.textContent=_vfbgLum(tx.color)>.5?'글씨 밝게':'글씨 어둡게';
  const fb=document.getElementById('vfbgFontBtn');
  if(fb)fb.textContent=tx.font==='serif'?'명조':'고딕';
  const ct=document.getElementById('vfbgContrast');
  if(ct){
    const mix=_vfbgMix(p.pal.avg,_vfbgScrimHex(tx.color),ed.dark);
    const r=_vfbgContrast(mix,tx.color);
    ct.textContent=(r>=4.5?'읽기 좋아요':(r>=3?'조금 흐려요':'글씨가 묻혀요'))+' · '+r.toFixed(1)+':1';
    ct.style.color=r>=4.5?'var(--tx3)':(r>=3?'#d9a441':'#e06a5a');
  }
}
function vfbgSetTpl(k){
  if(!_vfbgEd)return;
  _vfbgApplyTpl(_vfbgEd.p,k);
  _vfbgEditRender();
}
function vfbgSetNum(field,v){
  if(!_vfbgEd)return;
  const p=_vfbgEd.p,n=parseFloat(v)/100;
  if(field==='shadow')p.tx.shadow=n;else p.ed[field]=n;
  _vfbgEditRender();
}
function vfbgToggleInk(){
  if(!_vfbgEd)return;
  const p=_vfbgEd.p,light=_vfbgLum(p.tx.color)>.5;
  p.tx.color=light?_vfbgMix(p.pal.avg,'#000000',.86):_vfbgMix(p.pal.avg,'#ffffff',.92);
  p.ed.dark=_vfbgAutoScrim(p.pal.avg,p.tx.color,4.5);
  _vfbgEditRender();
}
function vfbgToggleFont(){
  if(!_vfbgEd)return;
  _vfbgEd.p.tx.font=_vfbgEd.p.tx.font==='serif'?'sans':'serif';
  _vfbgEditRender();
}
function vfbgAutoRead(){
  if(!_vfbgEd)return;
  const p=_vfbgEd.p;
  const ink=_vfbgAutoInk(p.pal.avg);
  p.tx.color=ink==='dark'?_vfbgMix(p.pal.avg,'#000000',.86):_vfbgMix(p.pal.avg,'#ffffff',.92);
  p.ed.dark=_vfbgAutoScrim(p.pal.avg,p.tx.color,4.5);
  _vfbgEditRender();
  showToast('읽기 좋게 맞췄어요');
}
function vfbgScrimMode(){
  if(!_vfbgEd)return;
  const m=['even','center','updown'],p=_vfbgEd.p;
  p.ed.scrim=m[(m.indexOf(p.ed.scrim)+1)%m.length];
  _vfbgEditRender();
}
// 사진 자리 옮기기 — 미리보기를 손가락으로 끌면 그대로 움직인다
function _vfbgInitDrag(){
  const stage=document.getElementById('vfbgStage');if(!stage||stage._vfbgDrag)return;
  stage._vfbgDrag=true;
  let sx=0,sy=0,fx=0,fy=0,on=false,d0=0,z0=1;
  const pt=e=>e.touches?e.touches[0]:e;
  const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  const down=e=>{
    if(!_vfbgEd)return;
    if(e.touches&&e.touches.length===2){d0=dist(e.touches)||1;z0=_vfbgEd.p.ed.zoom;on=false;return;}
    on=true;const q=pt(e);sx=q.clientX;sy=q.clientY;
    fx=_vfbgEd.p.ed.focusX;fy=_vfbgEd.p.ed.focusY;
  };
  const move=e=>{
    if(!_vfbgEd)return;
    if(e.touches&&e.touches.length===2){
      e.preventDefault();
      const k=dist(e.touches)/d0;
      _vfbgEd.p.ed.zoom=Math.max(1,Math.min(3,z0*k));
      _vfbgEditRender();return;
    }
    if(!on)return;
    const q=pt(e),w=stage.clientWidth||320,h=stage.clientHeight||560;
    _vfbgEd.p.ed.focusX=Math.max(0,Math.min(1,fx-(q.clientX-sx)/w));
    _vfbgEd.p.ed.focusY=Math.max(0,Math.min(1,fy-(q.clientY-sy)/h));
    _vfbgEditRender();
  };
  const up=()=>{on=false;};
  stage.addEventListener('touchstart',down,{passive:true});
  stage.addEventListener('touchmove',move,{passive:false});
  stage.addEventListener('touchend',up,{passive:true});
  stage.addEventListener('mousedown',down);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  stage.addEventListener('wheel',e=>{
    if(!_vfbgEd)return;
    e.preventDefault();
    _vfbgEd.p.ed.zoom=Math.max(1,Math.min(3,_vfbgEd.p.ed.zoom*(e.deltaY<0?1.06:.94)));
    _vfbgEditRender();
  },{passive:false});
}
// 저장 — 여기서 한 번 굽는다 (화면에서 filter 를 안 돌리기 위해)
function vfbgSave(){
  if(!_vfbgEd)return;
  const p=_vfbgEd.p,src=_vfbgEd.src;
  const done=baked=>{
    if(baked){p.thumb=baked.thumb;p.hasPhoto=true;p.photoAt=Date.now();
      // 팔레트는 **구운 뒤** 색으로 다시 잡는다 (흑백·색온도가 반영된 색이라야
      // 사진이 없는 기기에서도 같은 분위기가 난다)
      p.pal=Object.assign({},p.pal,{bg:baked.pal.bg});}
    const err=_vfbgCheck(_vfbgList(),p);
    if(err){showToast(err);return;}
    const s=ST.settings;
    const list=_vfbgList().slice();
    const i=list.findIndex(x=>x.id===p.id);
    if(i>=0)list[i]=p;else list.push(p);
    s.vfBgs=list;
    // 새로 만든 배경은 바로 켜 준다 (안 그러면 만들고도 아무 일이 없다)
    if(_vfbgEd.isNew){
      const sel=Array.isArray(s.vfThemes)?s.vfThemes.slice():[];
      if(sel.indexOf(p.id)<0)sel.push(p.id);
      s.vfThemes=sel;
      if(typeof _vfCurPattern!=='undefined'){_vfCurPattern=p.id;_vfVariantIdx=0;}
    }
    save();
    const store=baked?_vfbgPut(p.id,baked.full,src):Promise.resolve();
    store.then(()=>{
      applyVfTheme();_vfbgRenderChips();
      if(typeof _renderVfThemeChips==='function')_renderVfThemeChips();
      if(typeof _verseFullIsOpen==='function'&&_verseFullIsOpen()&&typeof _vfLayoutText==='function')_vfLayoutText();
      closeVfbgEdit();
      showToast('배경을 저장했어요');
    }).catch(()=>{
      closeVfbgEdit();
      showToast('사진을 이 기기에 못 담았어요 (색만 저장했어요)');
    });
  };
  if(!src){done(null);return;}
  showToast('배경을 만드는 중…');
  const im=new Image();
  im.onload=()=>{try{done(_vfbgBake(im,p.ed));}catch(e){showToast('사진을 굽지 못했어요');}};
  im.onerror=()=>showToast('사진을 읽지 못했어요');
  im.src=src;
}
