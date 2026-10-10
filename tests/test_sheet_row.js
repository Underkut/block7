// 대분류를 길게 눌러(우클릭) 구글 시트의 **그 행** 으로 열기 (v26-1010-13, HB 신고).
//
// HB: "PC 에서 말씀은 정확한데, 명제는 그 시트로는 가는데 **다른 행**으로 간다."
//
// 까닭 — _sheetUrlForVerse 가 명제도 **장절·대분류·소주제** 로 찾았다. 명제는
//   한 설교에서 여럿 나와 그 셋이 다 같다 → 늘 그 설교의 **첫 명제** 행으로 갔다.
//   2026-10-10 실제 시트(명제 455개)를 앱 코드 그대로 돌려 보니 77개만 맞고
//   378개가 다른 행이었다. → 명제는 **명제 ID 하나로만** 찾는다.
//
// 덤으로 — _parseCsv 가 빈 줄을 버린 뒤 i+1 로 세어서, 시트 위나 중간에 빈 줄이
//   하나만 있어도 그 아래 행 번호가 전부 밀렸다. → 빈 줄까지 센 진짜 행 번호(_r).
//
// 시트 모양은 짐작하지 않았다 — 2026-10-10 HB 의 'BLOCK7 설교 명제 DB' 를 열어
// 머리글을 그대로 옮겼다 (docs/명제집.md '실제 시트 모양').
const { slice, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
global.showToast = () => {};
function z(n){return String(n).padStart(2,'0');}
eval(slice('function _parseCsv(', '// rows → items'));
eval(slice('function _parseVDate(', 'function _looksLikeRef(').replace(/^const /gm,'var '));
eval(slice('function _looksLikeRef(', 'function _sheetRowsSane'));
eval(slice('// ══ 명제집(설교 명제 DB) 시트 읽기', '// 파일/직접용 임포트'));
eval(slice('function _verseIdentity(', 'function addCustomVerseFromForm'));
// 성경권 뽑기는 이 시험의 관심사가 아니다 — 최소한만 흉내낸다
function _bookOfRef(ref){const m=String(ref||'').trim().match(/^([가-힣0-9\s]+?)\s*\d/);return m?m[1].trim():'';}
function _bookNorm(n){return String(n||'').trim();}
function _calKey(){return '2026-10-10';}
let COLLS=[];
global.getVerseCollections=()=>COLLS;
eval(slice('function _sheetUrlForVerse(', '// 대분류 탭 — 롱터치로'));

// ── 시트 흉내 ─────────────────────────────────────────────────────────
// 실제 '명제 DB' 탭 머리글 (2026-10-10 열어서 확인 — 31열)
const DB_HEAD=['명제 ID','날짜','카테고리','설교 제목','설교자','설교 본문','성경권','인용 본문',
  '명제','대표 문구 1','대표 문구 2','분류','대표 명제','핵심 주제','주제 태그','조직신학',
  '성경신학/구속사','성경 인물·소재','상황 태그','적용 대상','관련 본문','적용송','설교 흐름 위치',
  '한 줄 요약','원문 상태','관련 명제 ID','비고','관련 암송말씀','공개용 문구','검토 메모','데이터 상태'];
// 실제 '성도 공유용' 탭 머리글 (16열)
const SH_HEAD=['주제','상황/필요','명제','본문','분류','묵상 질문','설교 제목','날짜','명제 ID',
  '공개 여부','검수 상태','공개 제목','공개 해설','기도문','공유 슬러그','공개 순서'];
const VS_HEAD=['카테고리','주제','본문','장절','태그','날짜','강조 문구'];
const cell=s=>/[",\n\r]/.test(s)?'"'+String(s).replace(/"/g,'""')+'"':String(s);
// lines: 머리글 열 이름 → 값 객체의 배열. null 은 **빈 줄**.
// 진짜 행 번호(빈 줄까지 센다)를 따로 적어 둔다 — _parseCsv 와 상관없이 정답을 안다.
function sheet(head,lines){
  const out=[head.map(cell).join(',')];
  const rowOf={},rowOfText={};
  lines.forEach(o=>{
    if(!o){out.push(head.map(()=>'').join(','));return;}
    out.push(head.map(h=>cell(o[h]==null?'':o[h])).join(','));
    const n=out.length;
    if(o['명제 ID'])rowOf[o['명제 ID']]=n;
    if(o['본문'])rowOfText[o['본문']]=n;
  });
  return{text:out.join('\n')+'\n',rowOf,rowOfText};
}
// 한 설교 = 같은 날짜·카테고리·설교 제목·설교 본문. 명제만 다르다.
const SERMONS=[
  {d:'2026-06-21',cat:'주일예배',title:'언덕 위의 도시: 빛과 소금의 삶',ref:'마태복음 5:13-16',ids:['P0001','P0002','P0003','P0004']},
  {d:'2026-06-28',cat:'주일예배',title:'두 기초',ref:'마태복음 7:24-27',ids:['P0005','P0006','P0007']},
  {d:'2026-07-01',cat:'수요예배',title:'겨자씨 한 알',ref:'',ids:['P0008','P0009']},   // 설교 본문이 빈 설교
];
const TEXT={};   // 명제 ID → 명제 글
SERMONS.forEach(s=>s.ids.forEach((id,k)=>{TEXT[id]=`${s.title} — 명제 ${k+1}`;}));
TEXT.P0003='첫 줄입니다\n둘째 줄도 한 칸 안입니다';   // 따옴표 안 줄바꿈 — 행을 늘리지 않는다
function dbLine(s,id){
  return {'명제 ID':id,'날짜':s.d,'카테고리':s.cat,'설교 제목':s.title,'설교 본문':s.ref,
    '명제':TEXT[id],'대표 문구 1':TEXT[id].slice(0,6),'주제 태그':'제자도, 정체성',
    '관련 명제 ID':s.ids.filter(x=>x!==id).join(', '),'데이터 상태':'활성'};
}
function shLine(s,id){
  return {'주제':'정체성','상황/필요':'흔들릴 때','명제':TEXT[id],'본문':s.ref,'분류':'',
    '묵상 질문':'오늘 나는?','설교 제목':s.title,'날짜':s.d,'명제 ID':id};
}
const byId=id=>SERMONS.find(s=>s.ids.includes(id));
// 화면에 오는 말씀 모양 — ACTIVE_VERSES 가 다시 조립한다. **row·gid·src 는 없다.**
const shown=v=>({ref:v.ref||'',cat:v.cat||'',topic:v.topic||'',krText:v.krText||'',pid:v.pid||''});
const gidOf=url=>(url.match(/#gid=(\d+)/)||[])[1];
const rowOfUrl=url=>{const m=url.match(/&range=A(\d+):G\1$/);return m?+m[1]:0;};

// ═══ 1. 한 설교의 명제 여럿 — 저마다 제 행으로 (이번 신고) ═══
console.log('시나리오 1 — 같은 설교의 명제가 저마다 제 행으로 간다');
{
  const lines=[];SERMONS.forEach(s=>s.ids.forEach(id=>lines.push(dbLine(s,id))));
  const db=sheet(DB_HEAD,lines);
  const c={id:'c1',name:'TLC 명제집',verses:[],
    google:[{name:'명제 DB',url:'https://docs.google.com/spreadsheets/d/PROPDB/edit#gid=0'}]};
  _syncCollSheets(c,[{g:c.google[0],rows:_parseCsv(db.text)}]);
  COLLS=[c];
  sc.eq('명제 9개가 다 들어왔다',c.verses.filter(v=>v.pid).length,9);
  // 옛 방식이 왜 틀렸는지 — 한 설교의 명제 넷이 장절·대분류·소주제가 다 같다
  const s1=c.verses.filter(v=>['P0001','P0002','P0003','P0004'].includes(v.pid));
  sc.eq('한 설교의 명제 넷은 장절·대분류·소주제가 같다',
    new Set(s1.map(v=>[v.ref,v.cat,v.topic].join('|'))).size,1);
  let right=0;const wrong=[];
  c.verses.forEach(v=>{
    const t=_sheetUrlForVerse(shown(v));
    if(t&&t.row===db.rowOf[v.pid]&&rowOfUrl(t.url)===db.rowOf[v.pid])right++;
    else wrong.push(v.pid+'→'+(t&&t.row));
  });
  sc.eq('9개 모두 제 행으로 (예전엔 설교마다 첫 명제 행으로 갔다)',wrong,[]);
  sc.eq('넷째 명제는 5행 (머리글 1행 + 넷째 줄)',_sheetUrlForVerse(shown(c.verses.find(v=>v.pid==='P0004'))).row,5);
  // 따옴표 안 줄바꿈이 있는 P0003 뒤의 줄도 밀리지 않는다
  sc.eq('따옴표 안 줄바꿈 뒤의 줄도 제 행',_sheetUrlForVerse(shown(c.verses.find(v=>v.pid==='P0004'))).row,db.rowOf.P0004);
  // 설교 본문이 빈 명제 — 예전엔 장절이 없다고 아예 못 열었다
  const p8=c.verses.find(v=>v.pid==='P0008');
  sc.eq('설교 본문이 빈 명제도 연다',(_sheetUrlForVerse(shown(p8))||{}).row,db.rowOf.P0008);
  sc.eq('주소에는 실제 탭 번호',gidOf(_sheetUrlForVerse(shown(p8)).url),'0');
}

// ═══ 2. 한 모음에 두 탭(명제 DB + 성도 공유용) — 탭과 행이 늘 한 쌍 ═══
// 명제가 두 탭에 다 있으면 **마지막으로 받아 온 탭** 의 그 행으로 간다
// (= 화면의 명제 글이 온 곳). 탭(gid)과 행(row)이 따로 놀면 엉뚱한 행이 열린다.
console.log('\n시나리오 2 — 두 탭을 함께 연결해도 탭과 행이 짝이 맞는다');
{
  const lines=[];SERMONS.forEach(s=>s.ids.forEach(id=>lines.push(dbLine(s,id))));
  const db=sheet(DB_HEAD,lines);
  // 성도 공유용은 일부만, 순서도 다르다 (실제 탭도 그렇다)
  const shareIds=['P0006','P0001','P0003','P0009'];
  const sh=sheet(SH_HEAD,shareIds.map(id=>shLine(byId(id),id)));
  const mk=order=>{
    const L={db:{name:'명제 DB',url:'https://docs.google.com/spreadsheets/d/PROPDB/edit#gid=0'},
             sh:{name:'성도 공유용',url:'https://docs.google.com/spreadsheets/d/PROPDB/edit?gid=777#gid=777'}};
    const T={db,sh};
    const c={id:'c1',name:'TLC 명제집',verses:[],google:order.map(k=>L[k])};
    _syncCollSheets(c,order.map(k=>({g:L[k],rows:_parseCsv(T[k].text)})));
    return c;
  };
  for(const order of [['db','sh'],['sh','db']]){
    const c=mk(order);COLLS=[c];
    const last=order[order.length-1];
    let ok=0;const bad=[];
    c.verses.forEach(v=>{
      const t=_sheetUrlForVerse(shown(v));
      const g=gidOf(t.url);
      const want=(g==='777'?sh:db).rowOf[v.pid];
      if(want&&t.row===want)ok++;else bad.push(v.pid);
    });
    sc.eq(`연결 순서 ${order.join('→')}: 9개 모두 '간 탭' 의 제 행`,bad,[]);
    // 두 탭에 다 있는 명제는 마지막에 받은 탭으로
    const t1=_sheetUrlForVerse(shown(c.verses.find(v=>v.pid==='P0001')));
    sc.eq(`연결 순서 ${order.join('→')}: 두 탭에 다 있으면 마지막 탭(${last})으로`,
      gidOf(t1.url),last==='sh'?'777':'0');
    // 한 탭에만 있는 명제는 그 탭으로
    const t2=_sheetUrlForVerse(shown(c.verses.find(v=>v.pid==='P0002')));
    sc.eq(`연결 순서 ${order.join('→')}: 명제 DB 에만 있으면 명제 DB 로`,[gidOf(t2.url),t2.row],['0',db.rowOf.P0002]);
  }
}

// ═══ 3. 빈 줄 — 시트 위·중간에 빈 줄이 있어도 행 번호가 밀리지 않는다 ═══
console.log('\n시나리오 3 — 빈 줄이 있어도 진짜 행 번호');
{
  // 머리글 위에 빈 줄 둘, 설교 사이마다 빈 줄 하나
  const lines=[];
  SERMONS.forEach((s,k)=>{if(k)lines.push(null);s.ids.forEach(id=>lines.push(dbLine(s,id)));});
  const head=DB_HEAD.map(cell).join(',');
  const blank=DB_HEAD.map(()=>'').join(',');
  const body=sheet(DB_HEAD,lines);
  const text=[blank,blank].join('\n')+'\n'+body.text;
  const rows=_parseCsv(text);
  sc.eq('빈 줄은 예전처럼 버린다 (머리글 + 명제 9줄)',rows.length,10);
  sc.eq('머리글의 진짜 행은 3',rows[0]._r,3);
  sc.eq('칸 내용은 예전과 똑같다 (이름표는 JSON 에 안 나온다)',
    JSON.stringify(rows[0]),JSON.stringify(head.split(',')));
  const items=_rowsToItems(rows);
  const want=id=>body.rowOf[id]+2;   // 위에 빈 줄 둘
  sc.eq('명제 9개 모두 진짜 행',items.map(it=>it.row),items.map(it=>want(it.pid)));
  sc.eq('마지막 설교 첫 명제 — 빈 줄 둘(위) + 빈 줄 둘(설교 사이)을 다 센다',
    items.find(it=>it.pid==='P0008').row,2+1+4+1+3+1+1);
  // 말씀 시트도 같다
  const vs=sheet(VS_HEAD,[
    {'카테고리':'주일예배','주제':'빛과 소금','본문':'너희는 세상의 소금이니','장절':'마태복음 5:13','날짜':'2026-06-21'},
    null,null,
    {'카테고리':'주일예배','주제':'두 기초','본문':'그러므로 누구든지 나의 이 말을 듣고','장절':'마태복음 7:24','날짜':'2026-06-28'},
  ]);
  const vit=_rowsToItems(_parseCsv(vs.text));
  sc.eq('말씀 시트 — 빈 줄 둘 뒤의 말씀은 5행',vit.map(it=>it.row),[2,5]);
  // 엑셀 파일처럼 _r 이 없는 표는 예전처럼 센다
  sc.eq('_r 이 없는 표는 예전처럼 i+1',
    _rowsToItems([VS_HEAD,['주일예배','x','본문','요한복음 3:16','','','']]).map(it=>it.row),[2]);
}

// ═══ 4. 말씀 — 예전 그대로 맞고, 명제를 잘못 집지 않는다 ═══
console.log('\n시나리오 4 — 말씀은 예전 그대로 · 명제를 집지 않는다');
{
  const vs=sheet(VS_HEAD,[
    {'카테고리':'주일예배','주제':'언덕 위의 도시: 빛과 소금의 삶','본문':'너희는 세상의 소금이니','장절':'마태복음 5:13-16','날짜':'2026-06-21'},
    {'카테고리':'주일예배','주제':'두 기초','본문':'그러므로 누구든지','장절':'마태복음 7:24-27','날짜':'2026-06-28'},
  ]);
  const vc={id:'cv',name:'암송',verses:[],
    google:[{name:'암송 시트',url:'https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5'}]};
  _syncCollSheets(vc,[{g:vc.google[0],rows:_parseCsv(vs.text)}]);
  const lines=[];SERMONS.forEach(s=>s.ids.forEach(id=>lines.push(dbLine(s,id))));
  const pc={id:'cp',name:'TLC 명제집',verses:[],
    google:[{name:'명제 DB',url:'https://docs.google.com/spreadsheets/d/PROPDB/edit#gid=0'}]};
  _syncCollSheets(pc,[{g:pc.google[0],rows:_parseCsv(sheet(DB_HEAD,lines).text)}]);
  // ⚠️ 명제집이 앞에 있다 — 예전 코드는 장절·대분류·소주제가 같은 **명제** 를 먼저 집었다
  COLLS=[pc,vc];
  const v=vc.verses.find(x=>x.ref==='마태복음 5:13-16');
  const t=_sheetUrlForVerse(shown(v));
  sc.eq('말씀은 말씀 시트로',t.url.includes('/d/VERSES/'),true);
  sc.eq('말씀 시트의 제 행',[gidOf(t.url),t.row],['5',vs.rowOfText['너희는 세상의 소금이니']]);
  sc.eq('주소 모양은 예전 그대로 (A행:G행)',t.url,
    'https://docs.google.com/spreadsheets/d/VERSES/edit#gid=5&range=A2:G2');
  // 휴지통에 간 짝이 앞 모음에 있어도 살아 있는 쪽을 고른다
  const trash={id:'ct',name:'옛 모음',google:[{id:'gx',url:'https://docs.google.com/spreadsheets/d/OLD/edit#gid=9'}],
    verses:[Object.assign({},v,{gid:'gx',row:99,del:'simple'})]};
  COLLS=[trash,vc];
  sc.eq('휴지통 짝보다 살아 있는 말씀',_sheetUrlForVerse(shown(v)).url.includes('/d/VERSES/'),true);
  // 행을 모르는 옛 말씀(v26-0811-2 이전) — 탭까지만 연다 (예전 그대로)
  COLLS=[{id:'c0',name:'옛',google:[{id:'g0',url:'https://docs.google.com/spreadsheets/d/AAA/edit#gid=3'}],
    verses:[{ref:'요한복음 3:16',cat:'',topic:'',krText:'하나님이',src:'google',gid:'g0'}]}];
  sc.eq('행을 모르면 탭까지만',_sheetUrlForVerse({ref:'요한복음 3:16'}).url,
    'https://docs.google.com/spreadsheets/d/AAA/edit#gid=3');
  // 시트에서 오지 않은 말씀은 열지 않는다
  COLLS=[{id:'c9',name:'직접',google:[],verses:[{ref:'시편 23:1',cat:'',topic:'',krText:'여호와는',src:'direct'}]}];
  sc.eq('시트에서 오지 않은 말씀은 null',_sheetUrlForVerse({ref:'시편 23:1'}),null);
}

// ═══ 5. 같은 명제 ID 를 쓰는 모음이 둘 — 본문으로 가른다 ═══
// 교회마다 명제 ID 를 P0001 부터 매긴다. 시트가 다른 두 명제집을 함께 쓰면 ID 가 겹친다.
console.log('\n시나리오 5 — 다른 시트의 같은 명제 ID');
{
  const a={id:'ca',name:'교회 A',google:[{id:'ga',url:'https://docs.google.com/spreadsheets/d/AAA/edit#gid=0'}],
    verses:[{pid:'P0001',kind:'prop',ref:'요한복음 1:1',cat:'주일예배',topic:'말씀',krText:'A 교회 명제',src:'google',gid:'ga',row:2}]};
  const b={id:'cb',name:'교회 B',google:[{id:'gb',url:'https://docs.google.com/spreadsheets/d/BBB/edit#gid=0'}],
    verses:[{pid:'P0001',kind:'prop',ref:'로마서 8:28',cat:'주일예배',topic:'섭리',krText:'B 교회 명제',src:'google',gid:'gb',row:40}]};
  COLLS=[a,b];
  const t=_sheetUrlForVerse(shown(b.verses[0]));
  sc.eq('본문이 같은 쪽(B)으로',[t.url.includes('/d/BBB/'),t.row],[true,40]);
  const ta=_sheetUrlForVerse(shown(a.verses[0]));
  sc.eq('A 는 A 로',[ta.url.includes('/d/AAA/'),ta.row],[true,2]);
  // 명제 ID 가 없는 모음에서 장절로 헛짚지 않는다 — 명제는 명제 ID 로만
  COLLS=[{id:'cx',name:'말씀',google:[{id:'gx',url:'https://docs.google.com/spreadsheets/d/XXX/edit#gid=0'}],
    verses:[{ref:'요한복음 1:1',cat:'주일예배',topic:'말씀',krText:'태초에',src:'google',gid:'gx',row:7}]}];
  sc.eq('명제 ID 가 없는 말씀을 명제로 착각하지 않는다',_sheetUrlForVerse(shown(a.verses[0])),null);
  // ⚠️ v26-1010-15, Codex 리뷰(PR #544) — **구독한** 다른 교회 명제를 길게 눌렀을 때.
  //    구독 모음에는 시트 링크가 없다. 명제 ID 만으로 다른 모음까지 넘어가 찾으면,
  //    내 시트에 같은 P0001 이 있을 때 **본문이 다른 남의 행**을 연다 → 본문까지 같을 때만 연다.
  const sub={id:'cs',name:'구독: 이웃 교회',importCode:'123456',google:[],
    verses:[{pid:'P0001',kind:'prop',ref:'시편 23:1',cat:'주일예배',topic:'목자',krText:'이웃 교회 명제',src:'google'}]};
  COLLS=[sub,a];
  sc.eq('구독 명제가 같은 ID 의 내 시트 행을 열지 않는다',_sheetUrlForVerse(shown(sub.verses[0])),null);
  // 같은 명제(본문까지 같음)를 내 시트에서 받아 둔 경우 — 그 행이 맞는 행이다
  const mine={id:'cm',name:'내 명제집',google:[{id:'gm',url:'https://docs.google.com/spreadsheets/d/MINE/edit#gid=0'}],
    verses:[{pid:'P0001',kind:'prop',ref:'시편 23:1',cat:'주일예배',topic:'목자',krText:'이웃 교회 명제',src:'google',gid:'gm',row:9}]};
  COLLS=[sub,mine];
  const tm=_sheetUrlForVerse(shown(sub.verses[0]));
  sc.eq('본문까지 같으면 그 시트의 행을 연다',[tm&&tm.url.includes('/d/MINE/'),tm&&tm.row],[true,9]);
}

sc.done();
