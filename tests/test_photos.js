// 타일 바탕 사진첩 (photos/) — v26-0922-12, HB 가 모아 준 24장.
//
// 이 시험이 지키는 것은 셋이다.
//   ① 표(manifest.json)와 실제 파일이 **한 장도 어긋나지 않는다.**
//      어긋나면 앱은 조용히 404 를 내고 그 사진만 안 뜬다 — 아무도 모른다.
//   ② 한 장이 **200KB 를 넘지 않는다.** 타일은 손톱만 하게 쓰는데 원본을 그대로
//      넣으면 앱만 무거워진다 (photos/README.md 의 규격).
//   ③ 출처(by)가 **반드시** 적혀 있다. 나중에 저작권을 되짚을 수 있어야 한다.
// 그리고 sweeter.my 로도 함께 올라가는지 본다 — 안 그러면 거기선 한 장도 안 깔린다.
const fs=require('fs'),path=require('path');
const { makeScorer } = require('./_load');
const sc = makeScorer();
const DIR=path.join(__dirname,'..','photos');
const LIMIT=200*1024;

console.log('시나리오 1 — 표와 실제 파일이 맞는가');
const raw=fs.readFileSync(path.join(DIR,'manifest.json'),'utf-8');
let man=null;
try{man=JSON.parse(raw);}catch(e){man=null;}
sc.eq('manifest.json 이 읽힌다', !!man, true);
const list=(man&&Array.isArray(man.photos))?man.photos:[];
const files=fs.readdirSync(DIR).filter(f=>/\.jpe?g$/i.test(f)).sort();
sc.eq('표에 적힌 장수', list.length, files.length);
sc.eq('스물네 장', files.length, 24);
const inMan=list.map(x=>x.f).sort();
sc.eq('표 ↔ 파일이 한 장도 안 어긋난다', inMan.join('|'), files.join('|'));

console.log('\n시나리오 2 — 규격 (photos/README.md)');
{
  let tooBig=[],noFor=[],noBy=[],badName=[];
  list.forEach(x=>{
    const f=path.join(DIR,x.f);
    if(fs.existsSync(f)&&fs.statSync(f).size>LIMIT)tooBig.push(x.f);
    if(!Array.isArray(x.for)||!x.for.length)noFor.push(x.f);
    if(!x.by||!String(x.by).trim())noBy.push(x.f);
    // 이름은 영문 소문자와 붙임표만 — 한글·공백이 섞이면 주소에서 깨진다
    if(!/^[a-z0-9-]+\.jpg$/.test(x.f))badName.push(x.f);
  });
  sc.eq('200KB 를 넘는 장이 없다', tooBig, []);
  sc.eq('어울리는 말이 빠진 장이 없다', noFor, []);
  sc.eq('출처가 빠진 장이 없다', noBy, []);
  sc.eq('이름이 영문 소문자와 붙임표뿐', badName, []);
  // ⚠️ 같은 파일을 두 줄로 적으면 뽑기에서 그 장만 두 배로 나온다
  sc.eq('같은 장을 두 번 적지 않았다', new Set(inMan).size, inMan.length);
}

console.log('\n시나리오 3 — 모으기 목록(WANTED.md)과 어울리는 말이 같은가');
{
  // ⚠️ `for` 는 **시트에 실제로 있는 말**이라야 한다. 앱은 말씀의 태그·상황·
  //    소주제·대분류를 그 말과 견줘 사진을 고른다 (_swPhotoPick).
  //    WANTED.md 는 시트의 실제 분포에서 뽑은 표다 — 둘이 어긋나면 안 된다.
  const want=new Map();
  fs.readFileSync(path.join(DIR,'WANTED.md'),'utf-8').split('\n').forEach(l=>{
    const m=l.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*[^|]+\|\s*([^|]+?)\s*\|\s*$/);
    if(m)want.set(m[1], m[2].split('·').map(s=>s.trim()).filter(Boolean).join('|'));
  });
  sc.eq('목록도 스물네 장', want.size, 24);
  const off=list.filter(x=>want.get(x.f)!==x.for.join('|')).map(x=>x.f);
  sc.eq('어울리는 말이 목록과 같다', off, []);
}

console.log('\n시나리오 4 — sweeter.my 로도 함께 올라가는가');
{
  // ⚠️ block7.my 는 깃헙 페이지가 저장소째 내보내 저절로 되지만, sweeter.my 는
  //    build-sweeter/ 에 담은 것만 올라간다. 빠뜨리면 거기선 한 장도 안 깔린다.
  const sh=fs.readFileSync(path.join(__dirname,'..','tools','make-sweeter-prod.sh'),'utf-8');
  sc.eq('표를 담는다', sh.includes('cp photos/manifest.json "$OUT/photos/manifest.json"'), true);
  sc.eq('그림도 담는다', sh.includes('cp photos/*.jpg "$OUT/photos/"'), true);
  // 글(README·WANTED)은 우리끼리 볼 것이라 올리지 않는다
  sc.eq('글은 안 담는다', /cp -r photos "\$OUT/.test(sh), false);
  const yml=fs.readFileSync(path.join(__dirname,'..','.github','workflows','deploy-sweeter.yml'),'utf-8');
  sc.eq('사진이 바뀌면 배포가 돈다', yml.includes("      - 'photos/**'"), true);
}

sc.done();
