// 심방 녹음(plaudhub/index.html) 판단 덩어리 — <script id="plaudhub-core"> 만 떼어 시험한다. Mac 도우미(helper.mjs)도 같은 덩어리를 쓴다.
//
// 지키는 것 (이름은 모두 지어낸 것):
//  ① CLI 글 표 읽기 — recent 의 '  번호  제목  날짜  길이' (제목 안의 두 칸 띄움 · 빈 제목 · 색 글자) · 길이 꼴
//  ② 모양이 바뀌면 멈춤 — 모르는 줄 · 첫 줄 없음 · 건수 다름 · 이상한 번호 · 이상한 길이 → ok:false, 까닭에 제목을 싣지 않음
//  ③ file 상세 읽기 — 키:값 줄 · start_at 이 없으면 created_at · 모양이 바뀌면 멈춤
//  ④ 세계 표준시 → 한국 시각 (자정 넘김 · 해 넘김 · 시간대 없는 글은 Z 로)
//  ⑤ 키워드 메뉴 — 다듬기 · 겹침 · 20개 · 20자 · 빼기 · 대소문자
//  ⑥ 고르기 — 키워드 저절로 · 직접 넣기 · 빼기 · 누르면 뒤집힘 · **긴 녹음(5시간)도 빼지 않음**(HB 결정 ④)
//  ⑦ 계기판 목록 — 기간 안만 · 새것부터 · 전사 어림
//  ⑧ 두 Mac 일감 맡기 — 동시에 집으면 한 대 · 꺼진 Mac 일감은 30분 뒤 풀림 · 새로 찍으면 안 풀림 · 끝난 것 · 뺀 것 · 이어받으면 처음 단계부터
//  ⑨ 녹음 줄 계획 — 바뀐 줄만 · PLAUD 에서 사라진 줄 지움 · 한꺼번에 많이 사라지면 안 지움(규모 상한)
//  ⑩ 파이어베이스 REST 값 바꾸기 왕복
//  ⑪ 요청 이름 목록 = 보안 규칙 · 문서 덩어리 = 에뮬레이터 규칙 · 일감 칸에 제목 자리 없음
//  ⑫ 도우미 — 판 맞음 · 계기판 파일에서 덩어리를 떼어 돌림 · 연결 자리는 block7.my 에서 온 것만 · 주소 지우기
//  ⑬ 설치 한 줄 — sudo 없음 · 묻고 나서 · 두 번째 Mac 도 같은 줄 · 지우기 · users/{uid} 안 건드림
//  ⑭ Mac 카드 — 켜짐 · 꺼짐 · 낡은 도우미 · 이름 다듬기
//  ⑮ (P3) 맡기기 — 실패는 한 시간 뒤 · 하는 동안 HB 가 빼면 멈춤 · 잃으면 멈춤 · 두 Mac 이 번갈아 집어도 한 대씩 · 맡을 차례
//  ⑯ (P3) 공간 모자람 — 5시간 녹음 · 모자라면 맡지 않음 · Mac 카드 글 · 준비 상태가 모자라면 안 함
//  ⑰ (P3) 음성 주소 지우기 — 'Audio Download URL:' 다음 줄 · 명령 줄에 주소 없음(-K - 표준 입력) · 까닭 · 기록에 주소 없음 · 모르는 꼴은 멈춤
//  ⑱ (P3) 드라이브 txt — 이름 = 녹음번호.txt · 머리말(+09:00 시각) · 이미 있으면 만들지 않음 · 임시 이름 → 이름 바꾸기 · 받은 소리 · WAV 지움
//  ⑲ (P3) 전사 진행 · 모델 시험 — whisper 진행 % · '전사 중 n분째' · 잰 빠르기로 어림 고침 · 시험 요청 · 시험 글은 계정에 안 감
//  ⑳ (P3b) 파일 이름 — PLAUD 제목 날짜 'YYYY-MM-DD HH:MM:SS 글' → 'YY-MMDD HH;MM 글' · 날짜 없으면 녹음 시각 · ':' '/' 걷기 · 같은 이름 (2) · 머리말 ID 로 같은 녹음 찾기
//  ㉑ (P3b) Mac 마다 자동 전사 · 쓰는 모델은 못 지움 · 임시 파일 크기 합계 · 비우기는 전사 중에도
//  ㉓ (P3c) 녹음 목록 B2 · D1 — 탭 나누기 · 제목에서 날짜 떼기 · 시각 · 날짜 묶음(오늘 · 어제) · 지금 · txt 지우기 · 다시 전사 요청 · 드라이브에 없음(규모 상한) · 끝난 줄 · 그림 단추 · 버전 단추
//  ㉔ (P3d) 온라인 전용 드라이브 파일 — 머리말을 못 읽어도 이름으로 찾기(기억한 이름 · 녹음번호.txt · 제목 이름) · 남의 파일은 안 집음 · 틀림없을 때만 이름 바꿈
//  ㉕ (P3e) PLAUD 전사문 — file 의 transcript 줄 · 'MM-DD' 떼기 · 'p' 이름 · 6시간 기다림 · whisper 되풀이(-mc 0 · 의심) · 끝냄에 src · odd · P/W 알약
//  ㉖ (P4) AI 초안 — 모델 목록 · 기본 모델 · 지침(기본 v2.2 · 고친 것) + 늘 붙는 답 꼴 · 받은 글 읽기 · 심방 노트 규격(care-core) 통과 · 저절로(키워드만) ·
//      두 Mac 겹침 없이 집기 · 이미 보낸 것은 다시 안 만듦 · 대기함 한 줄(머리줄 차례) · 같은 녹음 확인 · 열쇠는 그 Mac 에만 · 까닭에 값 · 이름 없음
//  ㉒ (P3b) 잠근 사본 — 암호 문구 → 키 · 맞는 암호만 열림 · 잠근 글에 평문이 없음 · 표지에 암호가 없음 · 계기판 복사(누른 자리에서 시작) · 받기 이름
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), os = require('os');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'plaudhub', 'index.html'), 'utf8');
const m = HTML.match(/<script id="plaudhub-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('plaudhub-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error, crypto: globalThis.crypto, TextEncoder, TextDecoder, btoa, atob };
vm.createContext(ctx); vm.runInContext(m[1] + '\n;this.__PH = PH;', ctx);
const A = ctx.__PH;
const J = x => JSON.parse(JSON.stringify(x));
const ID = c => 'f_' + String(c).repeat(32).slice(0, 32);

(async () => {
// ① recent 글 표
const RECENT = '\nRecordings in the last 14 days: 4\n\n'
  + '  ' + ID('a') + '  김하늘 집사 심방  2026-11-22  48m00s\n'
  + '  ' + ID('b') + '  박소망  성도 전화심방  2026-11-21  12m03s\n'
  + '  ' + ID('c') + '    2026-11-20  6s\n'
  + '  ' + ID('d') + '  교역자 회의  2026-11-19  4h05m\n\n';
{
  const p = A.parseRecent(RECENT);
  sc.eq('① 읽힘', p.ok, true);
  sc.eq('① 네 줄', p.rows.length, 4);
  sc.eq('① 번호 · 제목 · 날짜 · 길이(초)', J(p.rows[0]), { id: ID('a'), name: '김하늘 집사 심방', date: '2026-11-22', d: 2880 });
  sc.eq('① 제목 안의 두 칸 띄움은 제목으로', p.rows[1].name, '박소망  성도 전화심방');
  sc.eq('① 빈 제목', p.rows[2].name, '');
  sc.eq('① 4시간 5분 = 14700초', p.rows[3].d, 14700);
  const color = RECENT.replace(/(f_[a-z0-9]{32})/g, '\x1b[36m$1\x1b[39m').replace(/(\d{4}-\d{2}-\d{2})/g, '\x1b[90m$1\x1b[39m');
  sc.eq('① 색 글자(터미널 꾸밈)가 섞여도 같다', J(A.parseRecent(color)), J(p));
  sc.eq('① 녹음 없음', J(A.parseRecent('No recordings in the last 14 days.\n')), { ok: true, rows: [] });
  sc.eq('① 길이 꼴', [A.durSec('1h05m'), A.durSec('12m03s'), A.durSec('45s'), A.durSec('-'), A.durSec('12:03')], [3900, 723, 45, 0, null]);
}
// ② 모양이 바뀌면 멈춤
{
  const bad = [
    ['모르는 줄', RECENT.replace('\n\n  ', '\n\n  NEW COLUMN\n  ')],
    ['첫 줄 없음', RECENT.replace('Recordings in the last 14 days: 4', '')],
    ['건수 다름', RECENT.replace(': 4', ': 5')],
    ['길이 꼴이 바뀜', RECENT.replace('48m00s', '48:00')],
    ['번호 꼴이 아님', RECENT.replace(ID('a'), 'f-a/b')],
    ['JSON 으로 바뀜', '[{"id":"' + ID('a') + '","name":"김하늘 집사 심방"}]'],
    ['빈 글', ''],
    ['없다면서 줄이 있음', 'No recordings in the last 14 days.\n  ' + ID('a') + '  x  2026-11-22  1s\n'],
  ];
  for (const [k, t] of bad) { const p = A.parseRecent(t); sc.eq('② 멈춤: ' + k, [p.ok, !!p.err], [false, true]); }
  const p = A.parseRecent(RECENT.replace('\n\n  ', '\n\n  김하늘 모르는 줄\n  '));
  sc.eq('② 까닭에 줄 내용(제목 · 이름)을 싣지 않는다', /김하늘/.test(p.err), false);
}
// ③ file 상세
const FILE = '\nFile Details:\n\n  id:           ' + ID('a') + '\n  name:         김하늘 집사 심방\n  created_at:   2026-11-22T06:53:00\n  start_at:     2026-11-22T06:05:00\n'
  + '  duration:     48m00s\n  serial_number: 8810B30000000000\n  audio:        unknown (run `plaud audio` to check)\n  transcript:   unavailable\n  summary:      unavailable\n\n';
{
  const q = A.parseFileDetail(FILE);
  sc.eq('③ 읽힘', q.ok, true);
  sc.eq('③ 시작 = start_at (세계 표준시)', q.t, Date.UTC(2026, 10, 22, 6, 5));
  sc.eq('③ 만든 때 = created_at', q.c, Date.UTC(2026, 10, 22, 6, 53));
  sc.eq('③ 길이 · 제목', [q.d, q.name], [2880, '김하늘 집사 심방']);
  sc.eq('③ start_at 이 - 이면 created_at', A.parseFileDetail(FILE.replace('2026-11-22T06:05:00', '-')).t, Date.UTC(2026, 10, 22, 6, 53));
  { const e = A.parseFileDetail(FILE.replace('  name:         김하늘 집사 심방\n', '  name:\n')); sc.eq('③ 제목 없는 녹음(name: 뒤가 빔)도 읽음', [e.ok, e.name], [true, '']); }
  sc.eq('③ 모르는 줄이 끼면 멈춤', A.parseFileDetail(FILE.replace('  summary:', 'SUMMARY\n  summary:')).ok, false);
  sc.eq('③ id 가 없으면 멈춤', A.parseFileDetail(FILE.replace(/  id: .*\n/, '')).ok, false);
  sc.eq('③ 시각을 못 읽으면 멈춤', A.parseFileDetail(FILE.replace('2026-11-22T06:53:00', '어제')).ok, false);
}
// ④ 한국 시각
{
  sc.eq('④ 시간대 없는 글은 세계 표준시', A.apiMs('2026-11-22T06:05:00'), Date.UTC(2026, 10, 22, 6, 5));
  sc.eq('④ Z · +09:00 꼴', [A.apiMs('2026-11-22T06:05:00Z'), A.apiMs('2026-11-22T15:05:00+09:00')], [Date.UTC(2026, 10, 22, 6, 5), Date.UTC(2026, 10, 22, 6, 5)]);
  sc.eq('④ 숫자 꼴(천분의 1초 · 초)', [A.apiMs('1763791500000'), A.apiMs('1763791500')], [1763791500000, 1763791500000]);
  const now = Date.UTC(2026, 10, 23, 1, 0);
  sc.eq('④ 06:05Z = 오후 3:05 (일)', A.kstLabel(Date.UTC(2026, 10, 22, 6, 5), now), '11. 22. (일) 오후 3:05');
  sc.eq('④ 16:30Z = 다음 날 오전 1:30 (월)', A.kstLabel(Date.UTC(2026, 10, 22, 16, 30), now), '11. 23. (월) 오전 1:30');
  sc.eq('④ 03:00Z = 정오 12:00', A.kstLabel(Date.UTC(2026, 10, 22, 3, 0), now), '11. 22. (일) 오후 12:00');
  sc.eq('④ 15:00Z = 자정 0시 → 오전 12:00', A.kstLabel(Date.UTC(2026, 10, 22, 15, 0), now), '11. 23. (월) 오전 12:00');
  sc.eq('④ 해가 다르면 해를 붙임 (12/31 20:00Z = 새해 1/1)', A.kstLabel(Date.UTC(2025, 11, 31, 20, 0), Date.UTC(2025, 11, 31, 10, 0)), '2026. 1. 1. (목) 오전 5:00');
  sc.eq('④ 시각 모름', A.kstLabel(NaN, now), '시각 모름');
  sc.eq('④ 길이 글', [A.durLabel(2880), A.durLabel(14700), A.durLabel(6)], ['48분', '4시간 5분', '6초']);
}
// ⑤ 키워드 메뉴
{
  sc.eq('⑤ 저장이 없으면 기본 \'심방\'', J(A.normKw(undefined)), ['심방']);
  sc.eq('⑤ 다 지운 목록은 빈 채로(직접 고른 것만)', J(A.normKw([])), []);
  sc.eq('⑤ 다듬기 · 겹침 · 빈 것', J(A.normKw(['  심방 ', '심방', '', '상담', 'PLAUD', 'plaud'])), ['심방', '상담', 'PLAUD']);
  sc.eq('⑤ 더하기', J(A.addKw(['심방'], ' 상담 ')), { list: ['심방', '상담'], err: '' });
  sc.eq('⑤ 같은 것은 안 더함', A.addKw(['심방'], '심방').err, '이미 있습니다');
  sc.eq('⑤ 빈 글자', A.addKw(['심방'], '   ').err, '빈 글자는 넣을 수 없습니다');
  sc.eq('⑤ 20개까지', A.addKw(Array.from({ length: 20 }, (_, i) => 'k' + i), 'x').err, '키워드는 20개까지입니다');
  sc.eq('⑤ 20자에서 자름', A.addKw([], '가'.repeat(30)).list[0].length, 20);
  sc.eq('⑤ 빼기', J(A.removeKw(['심방', '상담'], '심방')), ['상담']);
  sc.eq('⑤ 대소문자 없이 찾기', A.kwHit('Visit 기록', ['visit']), 'visit');
}
// ⑥ 고르기
{
  const r = (n, d) => ({ id: ID('a'), n, d: d || 60 });
  sc.eq('⑥ 제목에 키워드 → 저절로', A.pickState(r('김하늘 집사 심방'), null, ['심방']), 'auto');
  sc.eq('⑥ 키워드 없으면 안 고름', A.pickState(r('교역자 회의'), null, ['심방']), 'none');
  sc.eq('⑥ 제목 없는 녹음도 직접 넣음', A.pickState(r(''), { pick: 'in' }, ['심방']), 'in');
  sc.eq('⑥ 키워드가 있어도 직접 빼면 뺌', A.pickState(r('김하늘 집사 심방'), { pick: 'out' }, ['심방']), 'out');
  sc.eq('⑥ 누르면 뒤집힘', [A.tapPick('auto'), A.tapPick('in'), A.tapPick('out'), A.tapPick('none')], ['out', 'out', 'in', 'in']);
  sc.eq('⑥ 5시간 회의도 키워드면 고름 (길이로 빼지 않음)', A.pickState(r('구역 심방 모임', 5 * 3600), null, ['심방']), 'auto');
  sc.eq('⑥ 5시간 회의를 직접 넣을 수 있음', A.isPicked(A.pickState(r('교역자 회의', 5 * 3600), { pick: 'in' }, ['심방'])), true);
  sc.eq('⑥ 설정 다듬기 (모르는 기간 · 모델은 기본 = 터보, HB 11/23)', J(A.settingsOf({ kw: ['상담'], days: 99, model: 'tiny' })), { kw: ['상담'], days: 14, model: 'large-v3-turbo-q5_0' });
  sc.eq('⑥ 고른 모델은 그대로', A.settingsOf({ model: 'medium-q5_0' }).model, 'medium-q5_0');
}
// ⑦ 계기판 목록
{
  const now = Date.UTC(2026, 10, 23, 1, 0), H = 3600e3;
  const recs = {
    [ID('a')]: { id: ID('a'), n: '김하늘 집사 심방', t: now - 3 * H, c: now - 2 * H, d: 2880 },
    [ID('b')]: { id: ID('b'), n: '교역자 회의', t: now - 30 * H, c: now - 29 * H, d: 4 * 3600 },
    [ID('c')]: { id: ID('c'), n: '옛 심방', t: now - 20 * 24 * H, c: now - 20 * 24 * H, d: 60 },
  };
  const v = A.listView(recs, { [ID('b')]: { pick: 'in' } }, { kw: ['심방'], days: 14 }, now);
  sc.eq('⑦ 기간(14일) 안만', v.map(x => x.id), [ID('a'), ID('b')]);
  sc.eq('⑦ 새것부터 · 고름 표시', v.map(x => [x.st, x.picked]), [['auto', true], ['in', true]]);
  sc.eq('⑦ 한국 시각 글', v[0].when, '11. 23. (월) 오전 7:00');
  sc.eq('⑦ 전사 어림 = 길이 ÷ 모델 빠르기 + 1분 (기본 터보 = 6배)', [v[0].est, v[1].est], [Math.ceil(48 / 6) + 1, 40 + 1]);
  sc.eq('⑦ 중간 모델(4배)이면 더 길게 어림', A.estMin(4 * 3600, 'medium-q5_0'), 61);
  const v2 = A.listView(recs, {}, { kw: ['심방'], days: 14 }, now, { 'large-v3-turbo-q5_0': 3 });
  sc.eq('⑦ 잰 빠르기(모델 시험 3배)가 있으면 그것으로 어림', v2[0].est, 16 + 1);
}
// ⑧ 두 Mac 일감 맡기 — 조건부 쓰기(파이어베이스 트랜잭션과 같은 뜻)를 흉내 내는 가게
{
  const store = () => {
    const S = { docs: {}, now: 1e12 };
    S.io = mac => ({
      read: async id => ({ job: S.docs[id] ? J(S.docs[id].v) : null, ver: S.docs[id] ? S.docs[id].ver : null, now: S.now }),
      write: async (id, patch, ver) => { const cur = S.docs[id]; if ((cur ? cur.ver : null) !== ver) return false;
        S.docs[id] = { v: Object.assign({}, cur ? cur.v : {}, patch, { at: S.now }), ver: (cur ? cur.ver : 0) + 1 }; return true; },
    });
    return S;
  };
  const id = ID('a');
  // 동시에: 둘이 같은 판을 읽은 뒤 쓴다
  {
    const S = store(), home = S.io('집'), office = S.io('사무실');
    const r1 = await home.read(id), r2 = await office.read(id);
    const w1 = await home.write(id, { st: 'work', step: 'get', mac: '집' }, r1.ver), w2 = await office.write(id, { st: 'work', step: 'get', mac: '사무실' }, r2.ver);
    sc.eq('⑧ 같은 판을 읽고 둘이 쓰면 하나만 들어감', [w1, w2], [true, false]);
    const c = await A.tryClaim(office, id, '사무실');
    sc.eq('⑧ 진 쪽은 다시 읽고 \'다른 Mac 이 하는 중\' 으로 물러남', J(c), { ok: false, why: 'busy', mac: '집' });
    sc.eq('⑧ 맡은 Mac 은 그대로 집', S.docs[id].v.mac, '집');
  }
  // tryClaim 둘을 엇갈려 돌려도 한 대만
  {
    const S = store();
    const rs = await Promise.all([A.tryClaim(S.io('집'), id, '집'), A.tryClaim(S.io('사무실'), id, '사무실')]);
    sc.eq('⑧ tryClaim 둘을 함께 돌려도 한 대만 맡음', rs.filter(r => r.ok).length, 1);
  }
  // 꺼진 Mac
  {
    const S = store(); await A.tryClaim(S.io('집'), id, '집');
    S.now += 29 * 60e3; sc.eq('⑧ 29분: 아직 집 Mac 몫', (await A.tryClaim(S.io('사무실'), id, '사무실')).why, 'busy');
    S.now += 2 * 60e3; const c = await A.tryClaim(S.io('사무실'), id, '사무실');
    sc.eq('⑧ 31분: 꺼진 집 Mac 일감이 풀려 사무실이 이어받음', [c.ok, c.how, c.from, S.docs[id].v.mac], [true, 'expired', '집', '사무실']);
    sc.eq('⑧ 이어받으면 처음 단계(받기)부터', S.docs[id].v.step, 'get');
    sc.eq('⑧ 뒤늦게 깨어난 집 Mac 은 새로 찍지 못하고 멈춤', J(await A.renew(S.io('집'), id, '집', 'stt')), { ok: false, why: 'lost' });
    sc.eq('⑧ … 끝냈다고도 못 적음', (await A.finish(S.io('집'), id, '집', true)).ok, false);
  }
  // 긴 녹음 — 일하는 동안 새로 찍으면 안 풀림
  {
    const S = store(); await A.tryClaim(S.io('집'), id, '집');
    for (let i = 0; i < 12; i++) { S.now += A.RENEW_MS; await A.renew(S.io('집'), id, '집', 'stt'); }   // 1시간 전사
    sc.eq('⑧ 1시간 전사 중 5분마다 새로 찍으면 사무실이 못 가져감', (await A.tryClaim(S.io('사무실'), id, '사무실')).why, 'busy');
    sc.eq('⑧ 새로 찍을 때 단계도 적음', S.docs[id].v.step, 'stt');
    sc.eq('⑧ 같은 Mac 이 다시 켜지면 하던 단계에서', (await A.tryClaim(S.io('집'), id, '집')).step, 'stt');
    sc.eq('⑧ 끝냄', (await A.finish(S.io('집'), id, '집', true)).ok, true);
    S.now += 2 * A.LEASE_MS; sc.eq('⑧ 끝난 것은 다시 안 집음', (await A.tryClaim(S.io('사무실'), id, '사무실')).why, 'done');
  }
  sc.eq('⑧ HB 가 뺀 것은 안 집음', A.claimCheck({ pick: 'out' }, '집', 0).why, 'out');
  sc.eq('⑧ 실패는 다시 집을 수 있음', A.claimCheck({ st: 'fail', step: 'stt' }, '집', 0).ok, true);
  { const S = store(); await A.tryClaim(S.io('집'), id, '집'); await A.finish(S.io('집'), id, '집', false, 'x'.repeat(300));
    sc.eq('⑧ 실패 까닭은 120자까지 · 상태 fail', [S.docs[id].v.err.length, S.docs[id].v.st], [120, 'fail']); }
  {
    const now = 1e12, recs = { [ID('a')]: { id: ID('a'), n: '김하늘 심방', t: 3 }, [ID('b')]: { id: ID('b'), n: '회의', t: 1 }, [ID('c')]: { id: ID('c'), n: '박소망 심방', t: 2 }, [ID('d')]: { id: ID('d'), n: '이은혜 심방', t: 0 } };
    const jobs = { [ID('b')]: { pick: 'in' }, [ID('d')]: { st: 'work', mac: '사무실', at: now - 60e3 } };
    sc.eq('⑧ 맡을 차례: 고른 것 · 남이 하지 않는 것 · 오래된 것부터', J(A.wantedJobs(recs, jobs, { kw: ['심방'] }, '집', now)), [ID('b'), ID('c'), ID('a')]);
  }
}
// ⑨ 녹음 줄 계획
{
  const from = 1000, old = { [ID('a')]: { id: ID('a'), n: '김하늘 심방', t: 5, c: 2000, d: 60 }, [ID('b')]: { id: ID('b'), n: '박소망 심방', t: 5, c: 2000, d: 60 }, [ID('z')]: { id: ID('z'), n: '옛것', t: 1, c: 10, d: 1 } };
  const rows = [{ id: ID('a'), name: '김하늘 심방', t: 5, c: 2000, d: 60 }, { id: ID('c'), name: '새 녹음', t: 9, c: 3000, d: 30 }];
  const p = A.recPlan(old, rows, from);
  sc.eq('⑨ 같은 줄은 안 씀 · 새 줄만 씀', p.put.map(x => x.id), [ID('c')]);
  sc.eq('⑨ 기간 안에서 사라진 줄은 지움 · 기간 밖 옛것은 둠', [p.del, p.held], [[ID('b')], 0]);
  sc.eq('⑨ 쓰는 칸은 제목 · 시작 · 만든 때 · 길이 · PLAUD 전사 있음(p)뿐', Object.keys(p.put[0].v).sort(), ['c', 'd', 'n', 'p', 't']);
  sc.eq('⑨ 제목이 바뀌면 씀', A.recPlan(old, [{ id: ID('a'), name: '김하늘 집사 심방', t: 5, c: 2000, d: 60 }, { id: ID('b'), name: '박소망 심방', t: 5, c: 2000, d: 60 }], from).put.length, 1);
  const many = {}; for (let i = 0; i < 20; i++) many['f_' + String(i).padStart(32, '0')] = { id: 'f_' + String(i).padStart(32, '0'), n: 'x', t: 1, c: 5000, d: 1 };
  const q = A.recPlan(many, [], from);
  sc.eq('⑨ 한꺼번에 20개가 사라지면 지우지 않고 알림(규모 상한)', [q.del.length, q.held], [0, 20]);
}
// ⑩ REST 값
{
  const v = { n: '김하늘 심방', t: 1763791500000, d: 2880, f: 1.5, ok: true, no: null, kw: ['심방', '상담'], ready: { brew: true, model: false } };
  const enc = {}; for (const k of Object.keys(v)) enc[k] = A.fsEnc(v[k]);
  const back = A.fsDoc({ name: 'projects/p/databases/(default)/documents/plaud/u/rec/' + ID('a'), fields: enc, updateTime: '2026-11-23T00:00:00.000001Z' });
  sc.eq('⑩ 왕복', J(Object.assign({}, back, { id: undefined, _ut: undefined })), J(v));
  sc.eq('⑩ 문서 이름 · 판', [back.id, back._ut], [ID('a'), '2026-11-23T00:00:00.000001Z']);
  sc.eq('⑩ 큰 정수는 글로(파이어베이스 꼴)', A.fsEnc(1763791500000), { integerValue: '1763791500000' });
  sc.eq('⑩ 시각 값 → 천분의 1초', A.fsDec({ timestampValue: '2026-11-22T06:05:00Z' }), Date.UTC(2026, 10, 22, 6, 5));
}
// ⑪ 규칙 · 문서
{
  const rules = fs.readFileSync(path.join(__dirname, 'rules', 'plaud.rules'), 'utf8'), doc = fs.readFileSync(path.join(ROOT, 'docs', 'plaudhub', 'firestore-rules.md'), 'utf8');
  const blk = s => { const a = s.indexOf('    // ── PLAUD 도우미(plaud) — 여기서부터 ──'), b = s.indexOf('    // ── PLAUD 도우미 — 여기까지 ──'); return a >= 0 && b > a ? s.slice(a, b) : null; };
  sc.eq('⑪ 문서의 규칙 덩어리 = 에뮬레이터로 시험한 규칙', [!!blk(doc), blk(doc) === blk(rules)], [true, true]);
  const what = (/d\(\)\.what in \[([^\]]*)\]/.exec(rules) || [])[1] || '';
  sc.eq('⑪ 규칙이 받는 요청 이름 = 도우미가 아는 이름(INSTALLS)', what.split(',').map(s => s.trim().replace(/'/g, '')), J(A.CMD_WHAT));
  const jobKeys = (/match \/job\/\{id\}[\s\S]*?hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ 일감 칸에는 제목 · 전사문 자리가 없다', jobKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['st', 'step', 'mac', 'at', 'pick', 'err', 'gone', 'src', 'odd', 'dr', 'dre']);
  sc.eq('⑪ 녹음 번호 꼴 = 판단 덩어리와 같음', rules.includes("'^[A-Za-z0-9_]{8,64}$'") && String(A.ID_RE) === '/^[A-Za-z0-9_]{8,64}$/', true);
  sc.eq('⑪ 규칙은 plaud 칸만 (users 를 열지 않음)', /match \/users/.test(rules), false);
  const macKeys = (/match \/mac\/\{name\}[\s\S]*?hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ Mac 소식 칸: 깔린 모델 · 모델 시험 결과가 더해짐(글 자리는 없음)', macKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['at', 'doing', 'ready', 'v', 'err', 'cli', 'models', 'test', 'disk', 'listed', 'aik', 'aim']);
  const setKeys = (/allow create, update: if own\(\) && d\(\)\.keys\(\)\.hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ (P3b) 설정 칸: Mac 마다 자동 · 잠금 표지(암호 자체는 없음)', setKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['kw', 'days', 'model', 'auto', 'kdf', 'ai']);
  const txtKeys = (/match \/txt\/\{id\}[\s\S]*?hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ (P3b) 잠근 사본 칸: 잠근 글 · iv · 판뿐(평문 · 제목 칸 없음)', txtKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['c', 'iv', 'v']);
  const drKeys = (/match \/draft\/\{id\}[\s\S]*?hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '', cfgKeys = (/match \/cfg\/\{id\}[\s\S]*?hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ (P4) 초안 · 지침 칸: 잠근 글뿐(평문 · 모델 열쇠 칸 없음)', [drKeys, cfgKeys].map(x => x.split(',').map(s => s.trim().replace(/'/g, ''))), [['c', 'iv', 'v', 'fc', 'fiv'], ['c', 'iv', 'v']]);
  const aiKeys = (/d\(\)\.ai\.keys\(\)\.hasOnly\(\[([^\]]*)\]\)/.exec(rules) || [])[1] || '';
  sc.eq('⑪ (P4) 설정 ai 칸: 켜기 · 모델뿐(OpenAI 열쇠 자리 없음)', aiKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['on', 'model']);
  sc.eq('⑪ (P4) 규칙의 초안 상태 = 판단 덩어리의 DR_ST', ((/d\(\)\.dr in \[([^\]]*)\]/.exec(rules) || [])[1] || '').split(',').map(s => s.trim().replace(/'/g, '')), J(A.DR_ST));
}
// ⑫ 도우미
{
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8');
  sc.eq('⑫ 도우미 판 = 계기판이 아는 최신 판', (/export const HELPER_VERSION = '([^']+)'/.exec(HELPER) || [])[1], A.HELPER_LATEST);
  sc.eq('⑫ 도우미는 판단을 두 벌로 갖지 않는다(parseRecent 를 스스로 정의하지 않음)', /function parseRecent|function claimCheck/.test(HELPER), false);
  sc.eq('⑫ 도우미는 PLAUD 사용 통계 · 새 판 알림을 끈다', /PLAUD_TELEMETRY_DISABLED = '1'/.test(HELPER) && /PLAUD_NO_UPDATE_NOTIFIER = '1'/.test(HELPER), true);
  sc.eq('⑫ 전사 길의 명령은 core 의 PIPE 표로만(도우미에 ffmpeg · curl · whisper 명령 글이 없음)', /run\(\s*'(ffmpeg|curl|whisper-cli|whisper-cpp)'|\['(ffmpeg|whisper-cli)',/.test(HELPER) || !/runP\('audio'/.test(HELPER), false);
  sc.eq('⑫ 받은 소리 · WAV 는 끝나면 지운다', /finally \{[\s\S]{0,200}rmQuiet\(ogg, wav/.test(HELPER), true);
  sc.eq('⑫ sudo 를 부르지 않는다', /['"]sudo['"]/.test(HELPER), false);
  sc.eq('⑫ 주소 지우기 (24시간 열쇠가 기록에 남지 않게)', A.clean('받기 실패 https://x.example/a.ogg?X-Amz-Signature=abc 다시'), '받기 실패 [주소] 다시');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'plaudhub-'));
  process.env.PLAUDHUB_DIR = tmp; process.env.PLAUDHUB_PORT = '47919'; process.env.PLAUDHUB_DEV_ORIGIN = 'http://127.0.0.1:8765';
  const H = await import(path.join(ROOT, 'plaudhub', 'helper.mjs'));
  const PH2 = H.runCore(H.extractCore(HTML));
  sc.eq('⑫ 도우미가 계기판 파일에서 덩어리를 떼어 돌림', [PH2.APP_VERSION, PH2.parseRecent(RECENT).rows.length], [A.APP_VERSION, 4]);
  H._setCore(PH2);
  sc.eq('⑫ 덩어리가 없으면 비었다고 함', H.extractCore('<html></html>'), '');
  let paired = null;
  const srv = H.makeServer(async j => { paired = j; });
  await new Promise(r => srv.listen(47919, '127.0.0.1', r));
  const req = (method, p, headers, body) => new Promise(res => {
    const q = http.request({ host: '127.0.0.1', port: 47919, method, path: p, headers }, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res({ code: r.statusCode, h: r.headers, b })); });
    if (body) q.write(body); q.end();
  });
  const ok = { origin: 'https://block7.my', host: '127.0.0.1:47919' };
  let r = await req('GET', '/hello', ok);
  sc.eq('⑫ block7.my 에서 온 인사에 답함', [r.code, JSON.parse(r.b).app, r.h['access-control-allow-origin'], r.h['access-control-allow-private-network']], [200, 'plaudhub', 'https://block7.my', 'true']);
  r = await req('GET', '/hello', { origin: 'https://evil.example', host: '127.0.0.1:47919' });
  sc.eq('⑫ 다른 사이트는 막음', [r.code, r.h['access-control-allow-origin']], [403, undefined]);
  r = await req('GET', '/hello', { host: '127.0.0.1:47919' });
  sc.eq('⑫ 출처 없는 요청(다른 프로그램)도 막음', r.code, 403);
  r = await req('GET', '/hello', { origin: 'https://block7.my', host: 'evil.example:47919' });
  sc.eq('⑫ 주소를 바꿔치기한 요청(DNS 바꿔치기)도 막음', r.code, 403);
  r = await req('POST', '/pair', Object.assign({ 'content-type': 'application/json' }, ok), JSON.stringify({ rt: 'x', uid: 'u', mac: '집' }));
  sc.eq('⑫ 연결 요청을 넘김', [r.code, paired && paired.mac], [200, '집']);
  r = await req('POST', '/pair', { origin: 'https://evil.example', host: '127.0.0.1:47919', 'content-type': 'application/json' }, JSON.stringify({ rt: 'y', uid: 'u', mac: '남' }));
  sc.eq('⑫ 다른 사이트의 연결 요청은 받지 않음', [r.code, paired.mac], [403, '집']);
  r = await req('OPTIONS', '/pair', ok);
  sc.eq('⑫ 미리 묻기(OPTIONS)에 답함', r.code, 204);
  srv.close();
  sc.eq('⑫ 도우미 폴더는 내 폴더 안(시스템 폴더 아님)', /path\.join\(HOME, 'Library', 'Application Support', 'plaudhub'\)/.test(HELPER), true);
  sc.eq('⑫ 열쇠 파일은 나만 읽기(600)', /writeJson\('token\.json', [^)]*, true\)/.test(HELPER) && /0o600/.test(HELPER), true);
  fs.rmSync(tmp, { recursive: true, force: true });
}
// ⑬ 설치 한 줄
{
  const SH = fs.readFileSync(path.join(ROOT, 'plaudhub', 'install.sh'), 'utf8'), code = SH.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');
  sc.eq('⑬ sudo 를 쓰지 않는다', /\bsudo\s+(?!없이)/.test(code.replace(/say "[^"]*"/g, '')), false);
  sc.eq('⑬ 묻는 것은 터미널에서 직접 받는다(붙여 넣기로 돌아도)', /read -r a <\/dev\/tty/.test(SH), true);
  sc.eq('⑬ 시작 전에 묻는다', /ask "시작할까요\?"/.test(SH), true);
  sc.eq('⑬ Node 를 깔기 전에 묻는다', /ask "깔까요\?"[\s\S]*"\$BREW" install node/.test(SH), true);
  sc.eq('⑬ 자동 시작 표 이름 · 도우미 자리', /LABEL="my\.block7\.plaudhub"/.test(SH) && /Library\/Application Support\/plaudhub/.test(SH), true);
  sc.eq('⑬ 같은 줄을 다시 붙여도 됨(옛 것을 내리고 다시 켬)', /launchctl bootout[\s\S]*launchctl bootstrap/.test(SH), true);
  sc.eq('⑬ 지우기 한 줄이 있음', /"\$\{1:-\}" = "uninstall"/.test(SH), true);
  sc.eq('⑬ 계기판 설치 안내 = 실제 주소', HTML.includes("'curl -fsSL ' + SITE + 'install.sh | bash'") && A.SITE === 'https://block7.my/plaudhub/', true);
  // (P4) 계기판은 심방 노트가 고른 시트 id 를 읽으려고 users/{uid}/data/care 를 **읽기만** 한 곳 — 쓰기 · 다른 칸은 없다. 도우미는 아예 없음
  sc.eq('⑬ 계기판 · 도우미는 users/{uid} 에 쓰지 않음(계기판은 심방 노트 설정 읽기 한 곳)', [(HTML.match(/collection\('users'\)/g) || []).length, /collection\('users'\)\.doc\(FB\.user\.uid\)\.collection\('data'\)\.doc\('care'\)\.get\(\)/.test(HTML), /\/users\//.test(HTML), /users/.test(fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'))], [1, true, false, false]);
}
// ⑭ Mac 카드
{
  const now = 1e12;
  const v = A.macView({ id: '집', at: now - 60e3, doing: '쉼', v: A.HELPER_LATEST, ready: { brew: true, whisper: false } }, now);
  sc.eq('⑭ 1분 전 소식 = 켜짐', [v.alive, v.ago, v.doing], [true, '방금', '쉼']);
  sc.eq('⑭ 준비 상태 ✓ ✗ 모름', v.ready.filter(x => ['brew', 'whisper', 'model'].includes(x.k)).map(x => x.ok), [true, false, null]);
  const w = A.macView({ id: '사무실', at: now - 7 * 60e3, doing: '목록 읽는 중', v: 'h. 26-1101-1' }, now);
  sc.eq('⑭ 7분 소식 없음 = 꺼짐 · 낡은 도우미', [w.alive, w.doing, w.old], [false, '꺼짐', true]);
  sc.eq('⑭ 이름 다듬기', [A.normMac(' 집 '), A.normMac('a/b'), A.normMac(''), A.normMac('가'.repeat(13)), A.normMac('__x__')], ['집', '', '', '', '']);
  sc.eq('⑭ 버전 형식 · 2번째 줄 주석', [/^v\. \d{2}-\d{4}-\d+$/.test(A.APP_VERSION), HTML.split('\n')[1]], [true, '<!-- PLAUDHUB ' + A.APP_VERSION + ' -->']);
  sc.eq('⑭ 미리보기 녹음 제목은 지어낸 이름(실제 이름 목록과 따로)', /김하늘|박소망|이은혜|최기쁨/.test(HTML), true);
}
// ⑮ (P3) 맡기기 · renew
{
  const store = () => {
    const S = { docs: {}, now: 1e12 };
    S.io = () => ({
      read: async id => ({ job: S.docs[id] ? J(S.docs[id].v) : null, ver: S.docs[id] ? S.docs[id].ver : null, now: S.now }),
      write: async (id, patch, ver) => { const cur = S.docs[id]; if ((cur ? cur.ver : null) !== ver) return false;
        S.docs[id] = { v: Object.assign({}, cur ? cur.v : {}, patch, { at: S.now }), ver: (cur ? cur.ver : 0) + 1 }; return true; },
    });
    S.hb = (id, patch) => { const cur = S.docs[id]; S.docs[id] = { v: Object.assign({}, cur ? cur.v : {}, patch), ver: (cur ? cur.ver : 0) + 1 }; };   // 계기판(HB)이 pick 을 고침 — at 은 그대로
    return S;
  };
  const id = ID('a');
  {
    const S = store(); await A.tryClaim(S.io(), id, '집'); await A.finish(S.io(), id, '집', false, '소리를 받지 못함 (curl 22)');
    sc.eq('⑮ 실패한 일감은 곧바로 다시 집지 않음(한 시간 기다림)', (await A.tryClaim(S.io(), id, '사무실')).why, 'wait');
    S.now += A.FAIL_WAIT_MS + 1000;
    const c = await A.tryClaim(S.io(), id, '사무실');
    sc.eq('⑮ 한 시간 뒤에는 어느 Mac 이든 다시 집음 · 받기부터', [c.ok, S.docs[id].v.st, S.docs[id].v.step, S.docs[id].v.mac], [true, 'work', 'get', '사무실']);
    sc.eq('⑮ 실패 까닭은 짧은 글(제목 없음)', /김하늘/.test(S.docs[id].v.err || ''), false);
  }
  {
    const S = store(); await A.tryClaim(S.io(), id, '집');
    S.hb(id, { pick: 'out' });
    sc.eq('⑮ 하는 동안 HB 가 목록에서 빼면 renew 가 \'out\' 으로 멈추게 함', J(await A.renew(S.io(), id, '집', 'stt')), { ok: false, why: 'out' });
    sc.eq('⑮ … 뺀 줄을 실패로 적을 수 있음(맡은 Mac 이 아직 나)', (await A.finish(S.io(), id, '집', false, '목록에서 뺌')).ok, true);
    sc.eq('⑮ … 뺀 것은 아무도 다시 안 집음', (await A.tryClaim(S.io(), id, '사무실')).why, 'out');
  }
  {
    const S = store(); await A.tryClaim(S.io(), id, '집');
    S.hb(id, { pick: 'in' });   // HB 가 고름을 다시 눌러도(판이 바뀜) 맡김은 그대로
    sc.eq('⑮ HB 가 pick 을 고쳐도 renew 는 다시 읽고 이어 감', (await A.renew(S.io(), id, '집', 'stt')).ok, true);
    // 맡은 Mac 이 renew 를 4번(20분) 놓쳐도 아직 안 풀림 · 31분이면 풀림
    S.now += 20 * 60e3; sc.eq('⑮ 20분 renew 가 없어도 아직 집 몫', (await A.tryClaim(S.io(), id, '사무실')).why, 'busy');
    S.now += 11 * 60e3; const c = await A.tryClaim(S.io(), id, '사무실');
    sc.eq('⑮ 31분이면 사무실이 이어받음 → 집은 renew 에서 \'lost\' 로 멈춤', [c.how, (await A.renew(S.io(), id, '집', 'stt')).why], ['expired', 'lost']);
  }
  {
    // 두 Mac 이 같은 목록을 보고 번갈아 집어도 녹음마다 한 대씩
    const S = store(), recs = {}; for (const k of 'abcde') recs[ID(k)] = { id: ID(k), n: '심방 ' + k, t: k.charCodeAt(0) };
    const got = { 집: [], 사무실: [] };
    for (let round = 0; round < 6; round++) for (const mac of ['집', '사무실']) {
      const jobs = Object.fromEntries(Object.entries(S.docs).map(([k, d]) => [k, d.v]));
      for (const x of A.wantedJobs(recs, jobs, { kw: ['심방'] }, mac, S.now)) { const c = await A.tryClaim(S.io(), x, mac); if (c.ok) { got[mac].push(x); await A.finish(S.io(), x, mac, true); break; } }
    }
    const all = got['집'].concat(got['사무실']);
    sc.eq('⑮ 다섯 녹음을 두 Mac 이 나눠 함 · 겹친 것 없음 · 빠진 것 없음', [all.length, new Set(all).size, got['집'].length > 0 && got['사무실'].length > 0], [5, 5, true]);
    sc.eq('⑮ 끝난 것은 맡을 차례에 다시 안 나옴', A.wantedJobs(recs, Object.fromEntries(Object.entries(S.docs).map(([k, d]) => [k, d.v])), { kw: ['심방'] }, '집', S.now).length, 0);
  }
  sc.eq('⑮ 요청 이름 mtest(모델 시험)는 녹음 번호를 실어야', [A.cmdFor({ mac: '집', what: 'mtest', st: 'new', arg: ID('a') }, '집', 0), A.cmdFor({ mac: '집', what: 'mtest', st: 'new', arg: 'x/y' }, '집', 0)], [true, false]);
  sc.eq('⑮ 전사 · 시험 중에 미루지 않는 요청 — 다시 보기 · 목록 읽기 · 비우기 · 지금 · txt 지우기 · 다시 전사', J(A.CMD_WHILE_BUSY), ['check', 'refresh', 'clean', 'kick', 'rmtxt', 'redo']);
}
// ⑯ (P3) 공간 모자람
{
  const five = 5 * 3600;
  sc.eq('⑯ 5시간 녹음에 필요한 공간 = 받은 소리 + WAV + 여유 2GB (약 2.7GB)', A.gbLabel(A.needBytes(five)), '2.7GB');
  sc.eq('⑯ 1GB 남은 Mac 은 48분 녹음도 맡지 않음', A.spaceCheck(1e9, 48 * 60).ok, false);
  sc.eq('⑯ 20GB 남으면 맡음', A.spaceCheck(20e9, five).ok, true);
  sc.eq('⑯ 공간을 모르면(읽지 못함) 막지 않음', A.spaceCheck(Infinity, five).ok, true);
  const msg = A.spaceMsg(A.spaceCheck(0.4e9, 48 * 60));
  sc.eq('⑯ Mac 카드 글: 남음 · 필요 · 다른 Mac 이 함', /남음 0\.4GB/.test(msg) && /필요 2\.1GB/.test(msg) && /다른 Mac/.test(msg), true);
  sc.eq('⑯ 준비 상태가 모자라면 전사를 맡지 않음(무엇이 모자란지)', J(A.workBlock({ ffmpeg: true, whisper: true, model: false, plaud: true, login: true, drive: false })), ['model', 'drive']);
  sc.eq('⑯ 다 갖추면 맡음', A.workBlock({ ffmpeg: true, whisper: true, model: true, plaud: true, login: true, drive: true }).length, 0);
}
// ⑰ (P3) 음성 주소 지우기
{
  const URL1 = 'https://plaud-audio.example.com/f/abc.ogg?X-Amz-Credential=AK%2F1&X-Amz-Signature=deadbeef';
  const AUDIO = '\n\x1b[32mAudio Download URL:\x1b[39m\n' + URL1 + '\n\n(valid for 24 hours)\n';
  const p = A.parseAudioUrl(AUDIO);
  sc.eq('⑰ \'Audio Download URL:\' 다음 줄의 주소를 읽음(색 글자 섞여도)', [p.ok, p.url], [true, URL1]);
  sc.eq('⑰ 같은 줄에 있어도 읽음', A.parseAudioUrl('Audio Download URL: ' + URL1).url, URL1);
  sc.eq('⑰ 모르는 꼴(줄 이름이 바뀜)은 멈춤', A.parseAudioUrl('Download: ' + URL1).ok, false);
  sc.eq('⑰ 주소 자리에 주소가 아닌 것은 멈춤', A.parseAudioUrl('Audio Download URL:\nnot available yet\n').ok, false);
  sc.eq('⑰ 멈춤 까닭에 주소를 싣지 않음', /amazonaws|example|deadbeef/.test(A.parseAudioUrl('Audio Download URL:\n' + URL1 + ' x\n').err || ''), false);
  const get = A.pipeArgv('get', { ogg: '/x/work/a.ogg' });
  sc.eq('⑰ 받기 명령 줄에는 주소가 없음(curl -K - 로 표준 입력에서)', [get.join(' ').includes('http'), get.slice(-4)], [false, ['-K', '-', '-o', '/x/work/a.ogg']]);
  sc.eq('⑰ curl 에 넘기는 글', A.curlConf(URL1), 'url = "' + URL1 + '"\n');
  let threw = ''; try { A.curlConf('https://x.example/a" -o /etc/x'); } catch (e) { threw = e.message; }
  sc.eq('⑰ 따옴표 · 빈칸이 든 주소는 넘기지 않음(설정 글 끼워 넣기 막기)', [!!threw, threw.includes('x.example')], [true, false]);
  sc.eq('⑰ 기록 · 화면에 남기기 전에 주소를 지움', A.clean('curl 실패 ' + URL1 + ' (22)'), 'curl 실패 [주소] (22)');
  sc.eq('⑰ 명령 표에 없는 이름 · 빈 칸은 거절', (() => { try { A.pipeArgv('rm', {}); return 'ran'; } catch (_) { } try { A.pipeArgv('wav', { ogg: '/a' }); return 'ran'; } catch (_) { return 'no'; } })(), 'no');
  sc.eq('⑰ 전사 도구 이름은 whisper-cli · whisper-cpp 만', (() => { try { A.pipeArgv('stt', { bin: 'sh', model: 'm', wav: 'w', out: 'o' }); return 'ran'; } catch (_) { return 'no'; } })(), 'no');
  sc.eq('⑰ 전사 명령: 계정 설정 모델 · 한국어 · 글 파일 · 진행 표시', A.pipeArgv('stt', { bin: 'whisper-cli', model: '/m/ggml-large-v3-turbo-q5_0.bin', wav: '/w/a.wav', out: '/w/a.whisper' }),
    ['whisper-cli', '-m', '/m/ggml-large-v3-turbo-q5_0.bin', '-l', 'ko', '-mc', '0', '-f', '/w/a.wav', '-otxt', '-of', '/w/a.whisper', '-pp']);
  sc.eq('⑰ 소리 바꾸기: 16kHz · 모노 · WAV', A.pipeArgv('wav', { ogg: 'a.ogg', wav: 'a.wav' }).join(' ').includes('-ar 16000 -ac 1 -c:a pcm_s16le a.wav'), true);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8');
  sc.eq('⑰ 도우미는 받은 주소를 표준 입력으로만(curlConf → input)', /input: PH\.curlConf\(u\.url\)/.test(HELPER), true);
  sc.eq('⑰ 도우미는 plaud audio 글(주소가 든)을 기록하지 않음', /log\([^)]*\ba\.out|log\([^)]*u\.url/.test(HELPER), false);
}
// ⑱ (P3) 드라이브 txt
{
  sc.eq('⑱ 파일 이름 = 녹음번호.txt', A.txtName(ID('a')), ID('a') + '.txt');
  sc.eq('⑱ 녹음 번호 꼴이 아니면 이름을 만들지 않음(폴더 밖 쓰기 막기)', (() => { try { A.txtName('../x'); return 'ran'; } catch (_) { return 'no'; } })(), 'no');
  sc.eq('⑱ 한국 시각 +09:00 꼴(ChatGPT 지침 recorded_at)', A.kstIso(Date.UTC(2026, 10, 22, 6, 5, 7)), '2026-11-22T15:05:07+09:00');
  const t = A.txtOf({ id: ID('a'), n: '김하늘 집사 심방', t: Date.UTC(2026, 10, 22, 6, 5), d: 2880, model: 'large-v3-turbo-q5_0', mac: '집', at: Date.UTC(2026, 10, 23, 1, 0) }, ' 안녕하세요.\n\n 네 목사님.\r\n');
  const head = t.split('\n---\n')[0].split('\n');
  sc.eq('⑱ 머리말: 녹음 ID · 제목 · 녹음 시각 · 길이 · 전사(모델 · Mac)', head, ['PLAUD 녹음 ID: ' + ID('a'), '제목: 김하늘 집사 심방', '녹음 시각: 2026-11-22T15:05:00+09:00', '길이: 48분',
    '전사: whisper.cpp large-v3-turbo-q5_0 · 집 Mac · 2026-11-23T10:00:00+09:00']);
  sc.eq('⑱ 본문: 줄 앞뒤 빈칸 · 빈 줄을 걷음', t.split('\n---\n\n')[1], '안녕하세요.\n네 목사님.\n');
  sc.eq('⑱ 제목 없는 녹음', /제목: \(제목 없음\)/.test(A.txtOf({ id: ID('c'), n: '', t: 1, d: 6 }, 'x')), true);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), w = /async function workOne[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('⑱ 맡은 뒤 드라이브에 그 녹음 ID 파일이 이미 있으면 받지도 않고 끝냄(겹 둘)', w.indexOf('let loc = already(); if (loc) return await doneAlready(loc);') >= 0 && w.indexOf('let loc = already()') < w.indexOf('fetchAudio'), true);
  sc.eq('⑱ 쓰기 바로 앞에 맡김을 다시 확인하고 · 또 있는지 봄', w.indexOf("setStep(J, 'drive')") < w.lastIndexOf('loc = already(); if (loc) return await doneAlready(loc);') && w.lastIndexOf('loc = already(); if (loc)') < w.indexOf('writeFileSync(part'), true);
  const pt = /function placeTxt[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('⑱ 임시 이름(일 폴더) → 이름 바꾸기로만 드라이브에 넣음', /writeFileSync\(part, content\)[\s\S]*placeTxt\(drive, part/.test(w) && /renameSync\(part, final\)/.test(pt) && !/writeFileSync\(final/.test(HELPER), true);
  sc.eq('⑱ 전사 글은 계정에 쓰지 않음(upd 에 text 가 없음)', /upd\([^)]*\btext\b/.test(HELPER), false);
  sc.eq('⑱ 기록(log)에 제목 · 전사 글을 넣지 않음', /log\([^)]*(rec\.n|\btext\b)/.test(HELPER), false);
}
// ⑲ (P3) 전사 진행 · 모델 시험
{
  sc.eq('⑲ whisper 진행 % (마지막 값)', [A.parseProgress('whisper_print_progress_callback: progress =   5%\nwhisper_print_progress_callback: progress =  42%\n'), A.parseProgress('x')], [42, null]);
  const t0 = 1e12;
  sc.eq('⑲ 하는 일 글', [A.workLabel({ step: 'get', t0 }, t0), A.workLabel({ step: 'stt', t0, pct: 42 }, t0 + 6.5 * 60e3), A.workLabel({ step: 'drive', t0 }, t0), A.workLabel(null, t0)],
    ['녹음 받는 중', '전사 중 7분째 (42%)', '드라이브에 쓰는 중', '쉼']);
  sc.eq('⑲ 모델 시험 중 글', A.workLabel({ kind: 'test', step: 'stt', model: '터보 · 양자화', k: 1, of: 2, t0 }, t0), '모델 시험 — 터보 · 양자화 전사 중 · 1/2');
  const macs = [{ id: '집', test: { at: 5, len: 600, r: { 'large-v3-turbo-q5_0': { s: 130, x: 4.6 }, 'medium-q5_0': { s: 200, x: 3 } } } },
    { id: '사무실', test: { at: 9, len: 600, r: { 'large-v3-turbo-q5_0': { s: 100, x: 6 }, 'tiny': { s: 1, x: 99 } } } }, { id: '서재' }];
  sc.eq('⑲ 잰 빠르기 = 모델마다 가장 새 시험 · 모르는 모델은 버림', J(A.speedsOf(macs)), { 'large-v3-turbo-q5_0': 6, 'medium-q5_0': 3 });
  sc.eq('⑲ \'녹음 1분당\' 글', [A.perMinLabel(4.6), A.perMinLabel(0.5), A.perMinLabel(0)], ['녹음 1분에 13초', '녹음 1분에 2분', '']);
  const tv = A.testView(macs[0].test);
  sc.eq('⑲ Mac 카드의 시험 결과 줄', [tv.len, tv.rows.map(r => [r.label, r.took, r.per])], ['10분', [['중간 · 양자화', '3분', '녹음 1분에 20초'], ['터보 · 양자화', '2분', '녹음 1분에 13초']]]);
  sc.eq('⑲ 시험 결과에는 걸린 시간 · 빠르기만(글 칸이 없음)', Object.keys(macs[0].test.r['medium-q5_0']).sort(), ['s', 'x']);
  sc.eq('⑲ 시험은 앞 10분', A.TEST_SEC, 600);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), mt = /async function modelTest[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('⑲ 시험 글은 그 Mac 의 test 폴더에만 · 계정에는 { at, len, r }', /writeFileSync\(path\.join\(TESTDIR\(\)/.test(mt) && /test: \{ at: serverNow\(\), len, r \}/.test(mt) && !/drive/i.test(mt), true);
  sc.eq('⑲ 깔리지 않은 모델은 시험하지 않음(깔린 것만)', /const ms = installedModels\(\)/.test(mt), true);
  sc.eq('⑲ 계기판: 모델 시험 판에 안 깔린 모델의 설치 단추', /data-act="mtinstall"/.test(HTML) && /data-act="mtrun"/.test(HTML), true);
  sc.eq('⑲ 계기판 새로고침 아이콘: 마우스 글 · 토스트', HTML.includes('title="녹음 목록 지금 다시 읽기" aria-label="녹음 목록 지금 다시 읽기"') && HTML.includes("toast('녹음 목록을 다시 읽어 오라고 보냈습니다\\n1분 안에 새 녹음이 나타납니다')"), true);
}
// ⑳ (P3b) 파일 이름
{
  const t = Date.UTC(2026, 10, 21, 1, 0);   // 한국 11-21 오전 10:00
  sc.eq('⑳ PLAUD 제목 날짜 · 시각 → YY-MMDD HH;MM + 덧붙인 글', A.txtBase({ n: '2026-11-22 15:05:00 김하늘 집사 심방', t }), '26-1122 15;05 김하늘 집사 심방');
  sc.eq('⑳ 덧붙인 글이 없으면 날짜 · 시각만', A.txtBase({ n: '2026-11-22 09:05:07', t }), '26-1122 09;05');
  sc.eq('⑳ 제목의 날짜를 그대로 씀(녹음 시각과 달라도)', A.txtBase({ n: '2026-01-02 23:59:00 송구영신 전화심방', t }), '26-0102 23;59 송구영신 전화심방');
  sc.eq('⑳ 제목에 날짜가 없으면 녹음 시작 시각(한국)을 앞에', A.txtBase({ n: '박소망 성도 전화심방', t }), '26-1121 10;00 박소망 성도 전화심방');
  sc.eq('⑳ 제목이 비면 시각만', A.txtBase({ n: '', t }), '26-1121 10;00');
  sc.eq('⑳ 파일 이름에 못 쓰는 글자: \':\' → \';\' · \'/\' → \'-\' · 줄바꿈 → 빈칸', A.txtBase({ n: '2026-11-22 15:05:00 김하늘: 심방/상담\n메모', t }), '26-1122 15;05 김하늘; 심방-상담 메모');
  sc.eq('⑳ 너무 긴 제목은 120자에서 자름', A.txtBase({ n: '2026-11-22 15:05:00 ' + '가'.repeat(300), t }).length, 120);
  sc.eq('⑳ 같은 이름이 있으면 (2) · (3) (대소문자 안 가림)', [A.uniqueName('26-1122 15;05 a', new Set()), A.uniqueName('26-1122 15;05 a', new Set(['26-1122 15;05 a.txt'])), A.uniqueName('X', new Set(['x.txt', 'x (2).txt']))],
    ['26-1122 15;05 a.txt', '26-1122 15;05 a (2).txt', 'X (3).txt']);
  sc.eq('⑳ 이미 맞는 이름인지(제목이 그대로면 안 바꿈 · (2) 도 맞음)', [A.nameFits('a b.txt', 'a b'), A.nameFits('a b (2).txt', 'a b'), A.nameFits('a b (x).txt', 'a b'), A.nameFits(ID('a') + '.txt', 'a b')], [true, true, false, false]);
  sc.eq('⑳ 같은 녹음인지는 머리말 첫 줄의 녹음 ID 로', A.idFromTxt('26-1122 15;05 아무 이름.txt', 'PLAUD 녹음 ID: ' + ID('a') + '\n제목: …'), ID('a'));
  sc.eq('⑳ P3 때 이름(f_….txt)도 알아봄(새 이름으로 바꾸려고)', A.idFromTxt(ID('b') + '.txt', '이미 있던 파일'), ID('b'));
  sc.eq('⑳ 모르는 txt 는 건드리지 않음', A.idFromTxt('메모.txt', '그냥 메모'), '');
  const full = A.txtOf({ id: ID('a'), n: 'x', t, d: 60, model: 'm', mac: '집', at: t }, '첫 줄\n둘째 줄');
  sc.eq('⑳ 머리말 아래 본문만 떼기(잠근 사본 · 복사 · 받기에 씀)', A.txtBody(full), '첫 줄\n둘째 줄\n');
}
// ㉑ (P3b) Mac 마다 자동 · 모델 지우기 · 임시 파일
{
  sc.eq('㉑ 적힌 것이 없으면 켜짐(지금처럼)', [A.autoOn(undefined, '집'), A.autoOn({}, '집'), A.autoOn({ auto: {} }, '집')], [true, true, true]);
  sc.eq('㉑ Mac 마다 따로 — 사무실만 끔', [A.autoOn({ auto: { 사무실: false } }, '집'), A.autoOn({ auto: { 사무실: false } }, '사무실'), A.autoOn({ auto: { 사무실: true } }, '사무실')], [true, false, true]);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), pw = /async function pickWork[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('㉑ 꺼진 Mac 은 새 일감을 맡지 않음(맡기 전에 봄) · 하던 전사는 끝냄(멈추게 하지 않음)', pw.indexOf('PH.autoOn(settings, st.mac)') >= 0 && pw.indexOf('PH.autoOn(settings, st.mac)') < pw.indexOf('tryClaim') && !/autoOn/.test(/async function keep[\s\S]*?\n}\n/.exec(HELPER)[0]), true);
  sc.eq('㉑ 지금 쓰는 모델(계정 설정)은 못 지움 · 안 쓰는 것은 지움', [A.canRemoveModel('large-v3-turbo-q5_0', {}), A.canRemoveModel('medium-q5_0', {}), A.canRemoveModel('medium-q5_0', { model: 'medium-q5_0' }), A.canRemoveModel('tiny', {})], [false, true, false, false]);
  sc.eq('㉑ 도우미도 쓰는 모델 지우기는 거절', /c\.what === 'rmmodel'[\s\S]{0,200}PH\.canRemoveModel\(c\.arg, settings\)/.test(HELPER), true);
  sc.eq('㉑ 모델 지우기 요청은 모델 이름을 실어야', [A.cmdFor({ mac: '집', what: 'rmmodel', st: 'new', arg: 'medium-q5_0' }, '집', 0), A.cmdFor({ mac: '집', what: 'rmmodel', st: 'new', arg: '../x' }, '집', 0)], [true, false]);
  const ws = A.workSizes([{ id: '집', disk: { work: { [ID('a')]: 23e6, test: 1e6 } } }, { id: '사무실', disk: { work: { [ID('b')]: 5e6 } } }, { id: '서재', disk: { work: {} } }, { id: '옛 도우미' }]);
  sc.eq('㉑ 임시 파일: 녹음별 · 합계 · 파일이 있는 Mac', [ws.by[ID('a')], ws.by[ID('b')], ws.total, J(ws.macs)], [23e6, 5e6, 29e6, ['집', '사무실']]);
  sc.eq('㉑ 크기 글', [A.bytesLabel(0), A.bytesLabel(800), A.bytesLabel(23.4e6), A.bytesLabel(41.25e9)], ['0KB', '1KB', '23MB', '41.3GB']);
  sc.eq('㉑ 비우기는 하던 전사를 멈추고(실패 \'임시 파일을 비움\') 일 폴더를 지움', /c\.what === 'clean'[\s\S]{0,300}stopJob\(J, 'clean'\)[\s\S]{0,200}rmQuiet\(WORK\(\)\)/.test(HELPER) && /clean: '임시 파일을 비움'/.test(HELPER), true);
  sc.eq('㉑ 계기판: 줄마다 임시 파일 · 맨 위 합계 · 비우기', HTML.includes("'<span class=\"tmp\">임시 파일 '") && HTML.includes('임시 소리 파일 합계') && HTML.includes('data-act="cleanask"'), true);
}
// ㉓ (P3c) 녹음 목록 B2 · D1
{
  const now = Date.UTC(2026, 10, 24, 3, 0), H = 3600e3;   // 한국 11-24 정오
  sc.eq('㉓ 제목에서 PLAUD 날짜 · 시각 떼기', [A.titleRest('2026-11-23 16:55:33 솔빛마을'), A.titleRest('2026-11-23 16:55:33'), A.titleRest('11-16 부산 전화심방'), A.titleRest('')], ['솔빛마을', '', '부산 전화심방', '']);
  sc.eq('㉓ 시각 칸(한국)', A.hhmm(Date.UTC(2026, 10, 23, 7, 55)), '16:55');
  sc.eq('㉓ 날짜 묶음 이름 — 오늘 · 어제 · 그 전', [A.dayLabel(now - H, now), A.dayLabel(now - 24 * H, now), A.dayLabel(now - 72 * H, now), A.dayLabel(Date.UTC(2025, 11, 30, 3), now)],
    ['오늘 · 11. 24. (화)', '어제 · 11. 23. (월)', '11. 21. (토)', '2025. 12. 30. (화)']);
  const rec = (k, n, h) => ({ id: ID(k), n, t: now - h * H, c: now - h * H + 60e3, d: 600 });
  const recs = Object.fromEntries([rec('a', '2026-11-24 10:00:00 솔빛마을', 2), rec('b', '김하늘 심방', 3), rec('c', '', 4), rec('d', '박소망 심방', 5), rec('e', '회의', 6), rec('f', '', 7), rec('g', '이은혜 심방', 8)].map(r => [r.id, r]));
  const jobs = { [ID('c')]: { pick: 'in' }, [ID('d')]: { st: 'done', step: 'drive', mac: '집' }, [ID('e')]: { pick: 'out' }, [ID('f')]: { pick: 'in', st: 'fail', err: 'x', at: 1 }, [ID('g')]: { st: 'done', gone: true } };
  const v = A.listView(recs, jobs, { kw: ['심방'], days: 14 }, now), tabOf = k => v.find(x => x.id === ID(k)).tab;
  sc.eq('㉓ 탭 — 새 녹음(손대지 않음) · 할 것(고름 · 키워드 · 실패 · 드라이브에 없음) · 끝남 · 뺌', ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(tabOf), ['new', 'todo', 'todo', 'done', 'out', 'todo', 'todo']);
  sc.eq('㉓ 탭 세기 — 전체는 모두(뺀 것 포함)', A.TABS.map(([k]) => v.filter(x => A.inTab(x, k)).length), [1, 4, 1, 7]);
  const a = v.find(x => x.id === ID('a'));
  sc.eq('㉓ 줄 — 제목은 덧붙인 글만 · 시각 · 날짜 열쇠', [a.rest, a.tm, a.day], ['솔빛마을', '10:00', '2026-11-24']);
  sc.eq('㉓ 끝난 것 중 드라이브에서 지운 것은 gone', [v.find(x => x.id === ID('g')).gone, v.find(x => x.id === ID('d')).gone], [true, false]);
  sc.eq('㉓ 지금 · txt 지우기 · 다시 전사 요청 — 녹음 번호 꼴만(지금은 번호 없어도 됨)', [
    A.cmdFor({ mac: '집', what: 'kick', st: 'new' }, '집', 0), A.cmdFor({ mac: '집', what: 'kick', st: 'new', arg: ID('a') }, '집', 0), A.cmdFor({ mac: '집', what: 'kick', st: 'new', arg: '../x' }, '집', 0),
    A.cmdFor({ mac: '집', what: 'rmtxt', st: 'new', arg: ID('a') }, '집', 0), A.cmdFor({ mac: '집', what: 'rmtxt', st: 'new' }, '집', 0), A.cmdFor({ mac: '집', what: 'redo', st: 'new', arg: ID('a') }, '집', 0)], [true, true, false, true, false, true]);
  sc.eq('㉓ 드라이브에 없음 — 셋까지는 적고 · 넷 넘게 한꺼번에면 적지 않고 알림(드라이브 앱이 잠깐 비어 보일 때)', [J(A.gonePlan(['x', 'y'])), J(A.gonePlan(['1', '2', '3', '4']))], [{ set: ['x', 'y'], held: 0 }, { set: [], held: 4 }]);
  sc.eq('㉓ 드라이브에서 지운 것은 저절로 다시 전사하지 않음(끝남 그대로)', A.claimCheck({ st: 'done', gone: true }, '집', 0).why, 'done');
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), dt = /async function dropTxt[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('㉓ txt 지우기 · 다시 전사 — 머리말 ID 파일 · 잠근 사본을 지우고 일감을 새로(뺌 · 고름)', /locate\(driveIndex\(drive\), id\)/.test(dt) && /fs\.rmSync\(path\.join\(drive, loc\.file\)\)/.test(dt) && /\{ delete: docName\('txt', id\) \}/.test(dt) && /pick: PH\.fsEnc\(again \? 'in' : 'out'\)/.test(dt), true);
  sc.eq('㉓ 지금 — 누른 녹음부터 맡음', /if \(kick && want\.includes\(kick\)\) want = \[kick\]/.test(HELPER), true);
  sc.eq('㉓ 끝난 줄: 왼쪽 동그라미는 빈 채 · 눌러도 고름이 안 바뀜(data-act 없음) · 보기 · 복사 · 받기 · ⋯ 차례', /\(fin \? '' : ' data-act="pick"/.test(HTML) && /ib\('view', r\.id\) \+ ib\('copy', r\.id\) \+ ib\('save', r\.id\) \+ ib\('more', r\.id\)/.test(HTML), true);
  sc.eq('㉓ 보기 아이콘 = HB 가 준 모양(둥근 네모 안 세 줄, 마지막이 짧음)', /view: '<svg viewBox="0 0 24 24"><rect x="3\.5" y="3\.5" width="17" height="17" rx="2\.5"\/><path d="M7\.5 9h9M7\.5 12\.5h9M7\.5 16h5"\/><\/svg>'/.test(HTML), true);
  sc.eq('㉓ Mac 카드: 모두 ✓ 면 접고(기기마다 펼친 것 기억) · ✕ 가 있으면 저절로 펼침 · 꺼진 Mac 은 한 줄', /open = bad \|\| S\.open\.has\(v\.name\)/.test(HTML) && /\(open \? '<ul class="ready">'/.test(HTML) && /if \(!v\.alive\) return '<div class="card mac off">' \+ head \+ '<\/div>'/.test(HTML), true);
  sc.eq('㉓ 맨 위 버전 단추(새 버전이면 받기) · 다시 읽기 단추 설명', /id="verbtn" data-act="ver"/.test(HTML) && /title="녹음 목록 지금 다시 읽기"/.test(HTML), true);
}
// ㉔ (P3d) 온라인 전용 파일
{
  const id = ID('a'), other = ID('b'), rec = { n: '2026-11-16 12:56:00 이하늘 전화심방', t: 1 }, base = '26-1116 12;56 이하늘 전화심방';
  sc.eq('㉔ 머리말을 읽은 파일이 먼저', J(A.locateTxt(id, rec, ['x.txt', base + '.txt'], { 'x.txt': id }, {})), { file: 'x.txt', sure: true });
  sc.eq('㉔ 머리말을 못 읽어도(온라인 전용) 제목으로 만든 이름이면 찾음 — 드라이브에 없음으로 보지 않음', J(A.locateTxt(id, rec, [base + '.txt'], {}, {})), { file: base + '.txt', sure: false });
  sc.eq('㉔ 같은 제목 (2) 이름도 찾음', A.locateTxt(id, rec, [base + ' (2).txt'], {}, {}).file, base + ' (2).txt');
  sc.eq('㉔ 머리말을 못 읽는 P3 때 이름(녹음번호.txt)도 틀림없는 것으로 — 새 이름으로 바꿈', J(A.locateTxt(id, rec, [id + '.txt'], {}, {})), { file: id + '.txt', sure: true });
  sc.eq('㉔ 이 Mac 이 쓴 이름 기억(PLAUD 제목을 고친 뒤에도 옛 이름 파일을 찾음)', J(A.locateTxt(id, { n: '고친 제목', t: 1 }, ['옛 이름.txt'], {}, { [id]: '옛 이름.txt' })), { file: '옛 이름.txt', sure: true });
  sc.eq('㉔ 머리말이 다른 녹음인 파일은 이름이 같아도 집지 않음', A.locateTxt(id, rec, [base + '.txt'], { [base + '.txt']: other }, {}), null);
  sc.eq('㉔ 아무 길로도 없으면 없음', A.locateTxt(id, rec, ['메모.txt'], {}, {}), null);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), sd = /async function syncDrive[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('㉔ 이름 바꾸기는 틀림없을 때만(sure) · 바꾼 이름은 기억', /if \(loc\.sure && !PH\.nameFits\(cur, base\)/.test(sd) && /rememberName\(id, to\)/.test(sd), true);
  sc.eq('㉔ 이름으로만 알아본 파일도 기억(제목이 바뀌어도 계속 찾음 — 온라인 전용 + PLAUD 제목 바꿈)', /else if \(D\.map\[id\] !== cur\) rememberName\(id, cur\)/.test(sd), true);
  sc.eq('㉔ 있는데 \'드라이브에 없음\' 으로 적힌 것은 되돌림(gone: false)', /upd\(\['job', id\], \{ gone: false \}\)/.test(sd), true);
  sc.eq('㉔ 끝난 줄 · 드라이브에 없음 줄 모두 왼쪽 동그라미가 빈 채(눌러도 고름이 안 바뀜)', /fin = r\.job === 'done'/.test(HTML), true);
}
// ㉕ (P3e) PLAUD 전사문
{
  const q = A.parseFileDetail(FILE.replace('transcript:   unavailable', 'transcript:   available'));
  sc.eq('㉕ plaud file 의 transcript: available → p', [q.ok, q.p, A.parseFileDetail(FILE).p], [true, true, false]);
  const t = Date.UTC(2026, 10, 13, 2, 42);   // 한국 11-13 오전 11:42
  sc.eq('㉕ PLAUD 가 붙인 제목 앞 MM-DD 떼기(목록 · 파일 이름)', [A.stripMd('11-13 김하늘 전화심방: 면담'), A.stripMd('11-16'), A.stripMd('12-345 x'), A.titleRest('11-13 김하늘 전화심방')], ['김하늘 전화심방: 면담', '11-16', '12-345 x', '김하늘 전화심방']);
  sc.eq('㉕ PLAUD 전사문 파일 이름 = YY-MMDD HH;MM p 글', A.txtBase({ n: '11-13 김하늘 전화심방: 면담 일정', t }, 'p'), '26-1113 11;42 p 김하늘 전화심방; 면담 일정');
  sc.eq('㉕ whisper 파일 이름(MM-DD 도 뗌)', A.txtBase({ n: '11-13 김하늘 전화심방', t }), '26-1113 11;42 김하늘 전화심방');
  sc.eq('㉕ p 이름 알아보기', [A.isPName('26-1113 11;42 p 김하늘.txt'), A.isPName('26-1113 11;42 p.txt'), A.isPName('26-1113 11;42 p (2).txt'), A.isPName('26-1113 11;42 박소망.txt'), A.isPName('26-1113 11;42 pd.txt')], [true, true, true, false, false]);
  sc.eq('㉕ 이름으로 찾기에 p 꼴도', A.locateTxt(ID('a'), { n: '11-13 김하늘', t }, ['26-1113 11;42 p 김하늘.txt'], {}, {}).file, '26-1113 11;42 p 김하늘.txt');
  const now = Date.UTC(2026, 10, 24, 3, 0), H = 3600e3;
  sc.eq('㉕ PLAUD 전사가 없으면 녹음 뒤 6시간 기다림 · 있으면 안 기다림', [A.waitPlaud({ c: now - 2 * H }, now), A.waitPlaud({ c: now - 7 * H }, now), A.waitPlaud({ c: now - H, p: true }, now), A.plaudWaitUntil({ c: now - 2 * H })], [true, false, false, now + 4 * H]);
  const recs = { [ID('a')]: { id: ID('a'), n: '김하늘 심방', t: now - H, c: now - H, d: 60 }, [ID('b')]: { id: ID('b'), n: '박소망 심방', t: now - H, c: now - H, d: 60, p: true } };
  const v = A.listView(recs, {}, { kw: ['심방'] }, now);
  sc.eq('㉕ 계기판: 기다리는 줄에 기다림 끝 시각 · PLAUD 전사가 있는 줄은 안 기다림', [v.find(x => x.id === ID('a')).wait, v.find(x => x.id === ID('b')).wait, v.find(x => x.id === ID('b')).p], [now + 5 * H, 0, true]);
  sc.eq('㉕ whisper 되풀이 알아보기(말소리가 거의 없는 짧은 녹음 꼴)', [A.looksStuck(Array(20).fill('모델은 \'모델\'의 \'모델\'입니다.').join('\n')), A.looksStuck('안녕하세요.\n네 목사님.\n지난주 이야기요.\n네.\n감사합니다.\n기도할게요.\n네.')], [true, false]);
  const S2 = { docs: {} }, io = { read: async id => ({ job: S2.docs[id] ? J(S2.docs[id].v) : null, ver: S2.docs[id] ? S2.docs[id].ver : null, now: 1 }),
    write: async (id, patch, ver) => { const cur = S2.docs[id]; if ((cur ? cur.ver : null) !== ver) return false; S2.docs[id] = { v: Object.assign({}, cur ? cur.v : {}, patch), ver: (cur ? cur.ver : 0) + 1 }; return true; } };
  await A.tryClaim(io, ID('a'), '집'); await A.finish(io, ID('a'), '집', true, '', { src: 'w', odd: true });
  sc.eq('㉕ 끝냄에 어디서 온 전사인지 · 의심', [S2.docs[ID('a')].v.src, S2.docs[ID('a')].v.odd], ['w', true]);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8'), wo = /async function workOne[\s\S]*?\n}\n/.exec(HELPER)[0];
  sc.eq('㉕ PLAUD 전사문을 먼저 받고, 없을 때만 소리를 받아 whisper', wo.indexOf('plaudTxt(J, trf)') > 0 && wo.indexOf('plaudTxt(J, trf)') < wo.indexOf('fetchAudio'), true);
  sc.eq('㉕ PLAUD 전사문 명령은 PIPE 표로 · -o 파일로', J(A.pipeArgv('tr', { id: ID('a'), out: '/w/a.plaud.txt' })), ['plaud', 'transcript', ID('a'), '-o', '/w/a.plaud.txt']);
  sc.eq('㉕ 기다림은 [지금] 누른 녹음만 건너뜀', /filter\(id => id === kick \|\| !PH\.waitPlaud\(st\.recs\[id\], now\)\)/.test(HELPER), true);
  sc.eq('㉕ whisper 로 만든 것에 PLAUD 전사가 생기면 바꿈 — 한 차례 2개 · 드라이브에서 지운 것 · 뺀 것 · 이미 p 는 그대로', /j\.src === 'p' \|\| j\.gone \|\| j\.pick === 'out'/.test(HELPER) && /if \(n\+\+ >= 2\) break;/.test(HELPER) && /dropTxt\(id, true\)/.test(HELPER), true);
  sc.eq('㉕ 계기판: 보기 단추 앞 P · W 알약(W 빨강 = 의심)', /'<span class="pill p" title="PLAUD 전사문을 가져옴">P<\/span>'/.test(HTML) && /'<span class="pill w' \+ \(r\.odd \? ' odd' : ''\)/.test(HTML) && /if \(done\) right = len \+ drb \+ pill \+ '<span class="ibs">' \+ ib\('view'/.test(HTML), true);
  // (P4b) 화면 다듬기 — 로고 머리줄 · 알약 색 · 회색 단추 · 모든 줄 길이 · 성공한 요청의 옛 실패 감춤
  const MAN = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'plaudhub', 'manifest.json'), 'utf8')), SW = fs.readFileSync(path.join(__dirname, '..', 'plaudhub', 'sw.js'), 'utf8');
  sc.eq('㉗ 앱 이름 PLAUD HUB (title · manifest · 홈 화면 이름)', [/<title>PLAUD HUB<\/title>/.test(HTML), /apple-mobile-web-app-title" content="PLAUD HUB"/.test(HTML), MAN.name, MAN.short_name], [true, true, 'PLAUD HUB', 'PLAUD HUB']);
  sc.eq('㉗ 로고 그림 — 파비콘 · apple-touch-icon · manifest 192/512 png · icon.svg 안 씀 · 서비스 워커 목록', [/rel="icon" href="favicon-32\.png"/.test(HTML), /rel="apple-touch-icon" href="apple-touch-icon\.png"/.test(HTML), MAN.icons.map(i => i.sizes + i.type).join(), /icon\.svg/.test(HTML + SW + JSON.stringify(MAN)), ['logo-192.png', 'logo-512.png', 'apple-touch-icon.png', 'favicon-32.png', 'manifest.json'].every(f => SW.includes("'" + f + "'") && fs.existsSync(path.join(__dirname, '..', 'plaudhub', f)))],
    [true, true, true && '192x192image/png,512x512image/png,180x180image/png', false, true]);
  sc.eq('㉗ 머리줄 차례: 로고 → PLAUD HUB → 버전 단추 … 새로 읽기 → 메뉴(맨 끝)', /<img class="logo"[^>]*>\s*<h1>PLAUD HUB<\/h1>\s*<button class="verb" id="verbtn" data-act="ver"><\/button>[\s\S]*data-act="reload"[\s\S]*data-act="menu"[\s\S]*<\/header>/.test(HTML), true);
  sc.eq('㉗ 알약 색 — P 붉은 계열 · W 청록 #2BCFCF 계열 · W 빨강은 테두리로 구별', [/\.pill\.p\{color:var\(--bad\)/.test(HTML), /--teal:#2BCFCF/.test(HTML) && /\.pill\.w\{color:var\(--teal-ink\)/.test(HTML), /\.pill\.w\.odd\{[^}]*inset 0 0 0 1\.5px var\(--bad\)/.test(HTML)], [true, true, true]);
  sc.eq('㉗ 줄 오른쪽 단추는 회색(초안 실패만 빨강)', [/\.ib\{[^}]*color:var\(--sub\)/.test(HTML), /\.lnk\{color:var\(--sub\)/.test(HTML), /\.lnk\.bad\{color:var\(--bad\)\}/.test(HTML), /\.ib\{[^}]*var\(--ac\)/.test(HTML)], [true, true, true, false]);
  sc.eq('㉗ 모든 줄에 길이 — 끝남 · 드라이브에 없음 · 하는 중 · 고름 · 새 녹음', [/if \(done\) right = len \+/.test(HTML), /right = len \+ '<span class="s fail">드라이브에 없음/.test(HTML), /right = len \+ '<span class="s work">/.test(HTML), /\(r\.job === 'fail' \? '<span class="s fail">실패<\/span>' : len\)/.test(HTML), /else right = \(r\.st === 'out'[^;]*\+ len;/.test(HTML)], [true, true, true, true, true]);
  sc.eq('㉗ 폰 폭에서 끝난 · 하는 중 줄은 두 줄(길이 왼쪽 · 단추 오른쪽)', /@media \(max-width:480px\)\{ \.rec\.wr\{flex-wrap:wrap/.test(HTML) && /\.rec\.wr \.right \.lw\{margin-right:auto/.test(HTML), true);
  { const lb = new Function('return ' + /function lenBars[\s\S]*?\n}\n/.exec(HTML)[0].replace(/^function lenBars/, 'function'))(), M = 60;
    const f = d => { const h = lb(d * M), c = /class="lb (\w)"/.exec(h); return h ? [c[1], (h.match(/<i class="on"/g) || []).length, /<em>\+<\/em>/.test(h)] : null; };
    sc.eq('㉘ 길이 칸 — 1시간 이하는 한 칸 15분 · 30분까지 청록 · 넘으면 노랑', [f(1), f(15), f(16), f(30), f(31), f(45), f(46), f(60)], [['t', 1, false], ['t', 1, false], ['t', 2, false], ['t', 2, false], ['y', 3, false], ['y', 3, false], ['y', 4, false], ['y', 4, false]]);
    sc.eq('㉘ 길이 칸 — 1시간 넘으면 빨강 · 한 칸 1시간 · 4시간 넘으면 +', [f(61), f(77), f(120), f(121), f(240), f(241), f(332)], [['r', 2, false], ['r', 2, false], ['r', 2, false], ['r', 3, false], ['r', 4, false], ['r', 4, true], ['r', 4, true]]);
    sc.eq('㉘ 길이를 모르면(0) 칸을 그리지 않음', lb(0), ''); }
  sc.eq('㉘ 초안 글자 — 정상 초안 = 앱 초록(--ok) · 보냄 = 파랑(--ac) · 실패 = 빨강 · 만드는 중 = 흐림', [/\.lnk\.dr\{[^}]*color:var\(--ok\)/.test(HTML), /\.lnk\.dr\.sent\{color:var\(--ac\)\}/.test(HTML), /\.lnk\.dr\.bad\{color:var\(--bad\)\}/.test(HTML), /r\.dr === 'sent' \? ' sent'/.test(HTML)], [true, true, true, true]);
  sc.eq('㉗ Mac 카드의 빨간 실패 줄 — 같은 Mac · 같은 요청이 뒤에 성공(ok)했으면 감춤', /\.find\(f => !Object\.values\(S\.cmds\)\.some\(o => o\.mac === v\.name && o\.what === f\.what && o\.st === 'ok' && \(o\.at \|\| 0\) > \(f\.at \|\| 0\)\)\)/.test(HTML), true);
}
// ㉖ (P4) AI 초안
{
  const now = 1.8e12, H = 3600e3;
  sc.eq('㉖ 모델 목록: 글 모델만(소리 · 그림 · 임베딩 · 날짜 사본 · 미세조정 빼고)', J(A.aiModels(['gpt-9', 'gpt-9-mini', 'gpt-9-audio-preview', 'text-embedding-3-large', 'dall-e-3', 'gpt-9-2026-01-01', 'ft:gpt-9:x', 'o7', 'whisper-1', 'gpt-image-1', 'gpt-9-transcribe'])), ['gpt-9', 'gpt-9-mini', 'o7']);
  sc.eq('㉖ 기본 모델 = 가장 높은 번호의 본판(mini · nano 아님)', [A.aiPick(['gpt-8', 'gpt-9-mini', 'gpt-9', 'gpt-8.5', 'o7']), A.aiPick(['gpt-9-mini', 'o7']), A.aiPick([])], ['gpt-9', 'gpt-9-mini', '']);
  sc.eq('㉖ HB 가 고른 모델이 먼저 · 없으면 Mac 목록에서', [A.aiModelOf({ ai: { model: 'gpt-8' } }, [{ aim: ['gpt-9'] }]), A.aiModelOf({}, [{ aim: ['gpt-9'] }, { aim: ['gpt-10'] }])], ['gpt-8', 'gpt-10']);
  sc.eq('㉖ 설정 ai 기본 = 저절로 켜짐(HB \'가\')', [A.aiOf({}).on, A.aiOf({ ai: { on: false } }).on], [true, false]);
  const meta = { id: ID('a'), n: '2026-11-22 15:05:00 김하늘 집사 심방', t: Date.UTC(2026, 10, 22, 6, 5), d: 3600 };
  let msgs = A.aiMessages(meta, '전사 글', '', null, '');
  sc.eq('㉖ 기본 지침 = 운영 지침 v2.2 의 초안 꼴(①~⑧) · 추측 금지', /① 핵심 한줄[\s\S]*⑧ 상세 기록/.test(msgs[0].content) && /추측하지 않는다/.test(msgs[0].content), true);
  sc.eq('㉖ 답 꼴(hb-care.v1)은 늘 덧붙음 — 고친 지침에도', [/hb-care\.v1/.test(msgs[0].content), A.aiMessages(meta, 't', '내 지침: 짧게', null, '')[0].content.startsWith('내 지침: 짧게') && /hb-care\.v1/.test(A.aiMessages(meta, 't', '내 지침', null, '')[0].content), /추측하지 않는다/.test(A.aiMessages(meta, 't', '내 지침', null, '')[0].content)], [true, true, false]);
  sc.eq('㉖ 보내는 말: 녹음 ID · 제목 · 한국 시각 · 길이 + 전사', /녹음 ID: f_a+[\s\S]*녹음 시각: 2026-11-22T15:05:00\+09:00[\s\S]*길이: 1시간[\s\S]*전사문:\n전사 글/.test(msgs[1].content), true);
  const prev = { md: '앞 초안', packet: { a: 1 } }, m2 = A.aiMessages(meta, '전사 글', '', prev, '우선순위는 이번주로');
  sc.eq('㉖ 다시 만들기: 앞 초안 + 고칠 점(이 부분만)', [m2.length, m2[2].role, /앞 초안/.test(m2[2].content), /이 부분만[\s\S]*우선순위는 이번주로/.test(m2[3].content)], [4, 'assistant', true, true]);
  // 받은 글 → 묶음 → 심방 노트 규격(care-core 를 그대로)
  const care = (() => { const h = fs.readFileSync(path.join(ROOT, 'care', 'index.html'), 'utf8'), code = /<script id="care-core">([\s\S]*?)<\/script>/.exec(h)[1];
    const H2 = require('vm'), c = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error, URL, Intl, encodeURIComponent, decodeURIComponent };
    H2.createContext(c); H2.runInContext(code + '\n;this.__C = { pkValidate, PK_VER, INBOX_TAB, NX_TABS };', c); return c.__C; })();
  const good = { draft_markdown: '기본 정보: …\n① 핵심 한줄 — 지어낸 내용', packet: { schema_version: 'x', event: { kind: 'visit', date: '2026-11-22', title: '김하늘 집사 심방', group_summary: '', details_markdown: '', location: null },
    records: [{ person_name: '김하늘', person_confirmed: true, speaker_label: null, category: null, contact_method: '만남', depth: '중간', summary_line: '지어낸 한줄', brief_note: '지어낸 내용', detailed_note_markdown: '### 사실\n…', priority: '일반', long_term_watch: '', information_basis: '직접', tags: [], next_questions: ['지어낸 질문'],
      actions: [{ text: '전화 드리기', authority: 'AI 제안', owner: null, due_date: null, priority: '일반', kind: '기타', target_person: null }] }], unknown_speakers: [], mentioned_people: [], import_notes: '' } };
  let p = A.aiParse(JSON.stringify(good), meta);
  sc.eq('㉖ 받은 글 읽기 · source 는 우리가 아는 값으로(녹음 ID · 시각 · 길이 · 날짜 뗀 제목)', [p.ok, p.packet.schema_version, J(p.packet.source)], [true, 'hb-care.v1', { kind: 'plaud', source_id: ID('a'), source_url: null, title: '김하늘 집사 심방', recorded_at: '2026-11-22T15:05:00+09:00', duration_ms: 3600000 }]);
  sc.eq('㉖ 심방 노트 규격(care-core pkValidate) 통과 · 판단 덩어리의 칸 이름 = 심방 노트 탭', [J(care.pkValidate(p.packet)), care.PK_VER === A.PK_VERSION, care.INBOX_TAB === A.INBOX_TAB_NAME, J(care.NX_TABS['AI 입력대기'])], [[], true, true, J(A.INBOX_COLS)]);
  const bad = J(good); bad.packet.records[0].priority = '높음'; p = A.aiParse('여기 있습니다:\n' + JSON.stringify(bad) + '\n끝', meta);
  const errs = care.pkValidate(p.packet);
  sc.eq('㉖ 앞뒤 말이 붙어도 읽음 · 규격에 걸리면 까닭을 붙여 한 번 더', [p.ok, errs.length > 0, /records\[0\]\.priority/.test(A.aiRetry([], 'x', errs)[1].content)], [true, true, true]);
  sc.eq('㉖ JSON 이 아니거나 칸이 없으면 실패', [A.aiParse('죄송합니다', meta).ok, A.aiParse('{"draft_markdown":"x"}', meta).ok], [false, false]);
  sc.eq('㉖ OpenAI 오류 → 짧은 까닭(열쇠 · 한도 · 모델)', [/열쇠가 맞지 않습니다/.test(A.aiErr(401, {})), /한도 · 결제/.test(A.aiErr(429, { error: { code: 'insufficient_quota' } })), /모델/.test(A.aiErr(404, {})), A.aiErr(500, {}).length <= 120], [true, true, true, true]);
  // 저절로 · 집기
  const rec = { id: ID('a'), n: '김하늘 집사 심방' };
  sc.eq('㉖ 저절로는 키워드로 골라진 것만(직접 고른 것 · 뺀 것 · 꺼짐은 아님)', [A.drAuto(rec, null, { kw: ['심방'] }), A.drAuto({ n: '교역자 회의' }, { pick: 'in' }, { kw: ['심방'] }), A.drAuto(rec, { pick: 'out' }, { kw: ['심방'] }), A.drAuto(rec, null, { kw: ['심방'], ai: { on: false } })], [true, false, false, false]);
  sc.eq('㉖ 집을 수 있는 것: 끝난 녹음의 wait · 15분 넘게 멈춘 run', [A.drTake({ st: 'done', dr: 'wait' }, now, now), A.drTake({ st: 'done', dr: 'run' }, now - 5 * 60e3, now), A.drTake({ st: 'done', dr: 'run' }, now - 16 * 60e3, now), A.drTake({ st: 'work', dr: 'wait' }, now, now), A.drTake({ st: 'done', dr: 'ok' }, 0, now)], [true, false, true, false, false]);
  const S3 = { docs: {} }, io3 = { read: async id => ({ job: S3.docs[id] ? J(S3.docs[id].v) : null, ver: S3.docs[id] ? S3.docs[id].ver : null, now: 1 }),
    write: async (id, patch, ver) => { const cur = S3.docs[id]; if ((cur ? cur.ver : null) !== ver) return false; S3.docs[id] = { v: Object.assign({}, cur ? cur.v : {}, patch), ver: (cur ? cur.ver : 0) + 1 }; return true; } };
  await A.tryClaim(io3, ID('a'), '집'); await A.finish(io3, ID('a'), '집', true, '', { src: 'w', dr: 'wait' });
  S3.docs[ID('b')] = { v: { dr: 'sent', pick: 'in' }, ver: 7 }; await A.tryClaim(io3, ID('b'), '집'); await A.finish(io3, ID('b'), '집', true, '', { src: 'p', dr: 'wait' });
  sc.eq('㉖ 끝냄에 초안 기다림 · 이미 대기함에 넣은 녹음(다시 전사)은 다시 만들지 않음', [S3.docs[ID('a')].v.dr, S3.docs[ID('b')].v.dr], ['wait', 'sent']);
  // 대기함 한 줄 · 같은 녹음 확인
  const head = ['접수ID', '접수시각', '스키마버전', '패킷JSON', '상태', '오류', '원본ID', '생성된 기록ID', '처리시각'];
  const row = A.inboxRow({ a: 1 }, ID('a'), Date.UTC(2026, 10, 24, 8, 21), head);
  sc.eq('㉖ 대기함 한 줄 = 지침 6항 5 (접수ID 비움 · 한국 시각 · 규격 · JSON · 대기 · 빈 오류 · 녹음 ID)', J(row), ['', '2026-11-24T17:21:00+09:00', 'hb-care.v1', '{"a":1}', '대기', '', ID('a'), '', '']);
  sc.eq('㉖ 머리줄 차례가 달라도 이름대로', J(A.inboxRow({ a: 1 }, ID('a'), 0, ['상태', '원본ID', '패킷JSON'])), ['대기', ID('a'), '{"a":1}']);
  const V = [head, ['k1', '', '', '{}', '오류', '', ID('a')], ['k2', '', '', '{}', '완료', '', ID('b')]];
  sc.eq('㉖ 같은 녹음이 대기 · 완료면 넣지 않음(오류 줄은 다시 넣어도 됨 — 지침 7항)', [A.inboxHas(V, ID('a')).has, A.inboxHas(V, ID('b')).has, A.inboxHas(V, ID('b')).st, A.inboxHas([['이름']], ID('a')).ok], [false, true, '완료', false]);
  // 도우미 · 계기판
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8');
  sc.eq('㉖ OpenAI 열쇠는 그 Mac 의 ai.json(600)에만 — 계정 소식에는 있음 · 없음(aik)만', /writeJson\('ai\.json', \{ k \}, true\)/.test(HELPER) && /aik: !!st\.ai, aim: st\.aim/.test(HELPER) && !/upd\([^)]*\bai: st\.ai\b/.test(HELPER), true);
  sc.eq('㉖ 열쇠는 모델 목록을 물어 맞는지 본 뒤에만 둠', /const list = await aiList\(k\);[\s\S]{0,140}writeJson\('ai\.json'/.test(HELPER), true);
  sc.eq('㉖ 초안은 잠가서만 계정에 · 시트에는 쓰지 않음(도우미에 sheets 주소 없음)', /PH\.encText\(st\.key, JSON\.stringify\(\{ md: got\.md/.test(HELPER) && !/sheets\.googleapis/.test(HELPER) && !/docName\('draft', id\), fields: \{ md/.test(HELPER), true);
  sc.eq('㉖ 규격은 심방 노트 파일에서 떼어 씀(두 벌 아님)', /new URL\('\.\.\/care\/index\.html', SITE\)/.test(HELPER) && !/function pkValidate/.test(HELPER), true);
  sc.eq('㉖ 실패 까닭에는 칸 자리만(값 · 이름 없음)', /split\(' — '\)\[0\]/.test(HELPER), true);
  sc.eq('㉖ 집기 · 적기는 조건부 쓰기(두 Mac 겹침 · 그 사이 [다시 만들기])', /upd\(\['job', id\], \{ dr: 'run' \}, \{ pre: \{ updateTime: js\[id\]\._ut \}/.test(HELPER) && /upd\(\['job', id\], \{ dr: 'ok' \}, Object\.assign\(\{ del: \['dre'\] \}, ver \? \{ pre: \{ updateTime: ver \} \}/.test(HELPER), true);
  sc.eq('㉖ 다시 전사해도 보낸 것(sent)은 남기고, 아니면 낡은 초안을 지움', /const sent = [\s\S]{0,120}\.dr === 'sent'/.test(HELPER) && /sent \? \[\] : \[\{ delete: docName\('draft', id\) \}\]/.test(HELPER), true);
  sc.eq('㉖ 계기판 승인: 같은 녹음 확인 → RAW 로 한 줄 → 다시 읽어 확인한 뒤에만 sent', /chk = await read\(\); if \(!chk\.ok\) throw[\s\S]*:append\?valueInputOption=RAW&insertDataOption=INSERT_ROWS[\s\S]*chk = await read\(\); if \(!chk\.ok \|\| !chk\.has\) throw[\s\S]*dr: 'sent'/.test(HTML), true);
  sc.eq('㉖ 계기판: 고칠 점 · 지침은 잠가서 계정에', /encText\(k, fb\.slice\(0, FB_MAX\)\); await dref\.set\(\{ fc: e\.c, fiv: e\.iv \}/.test(HTML) && /collection\('cfg'\)\.doc\('guide'\)\.set\(\{ c: e\.c, iv: e\.iv, v: 1 \}\)/.test(HTML), true);
  sc.eq('㉖ 열쇠 넣기 자리는 이 Mac(127.0.0.1)뿐 — 계정에 열쇠를 쓰지 않음', /helperCall\('\/aikey', \{ k \}/.test(HTML) && !/ai: \{[^}]*\bk\b/.test(HTML), true);
}
// ㉒ (P3b) 잠근 사본
{
  const r = await A.newKdf('지어낸 암호 문구');
  sc.eq('㉒ 표지 칸: 소금 · 반복 수 · iv · 잠근 표지 — 암호 · 키는 없음', [Object.keys(r.kdf).sort(), JSON.stringify(r.kdf).includes('지어낸') || JSON.stringify(r.kdf).includes(r.key)], [['c', 'it', 'iv', 's'], false]);
  sc.eq('㉒ 반복 수 60만(기기마다 한 번만 셈)', r.kdf.it, 600000);
  sc.eq('㉒ 같은 암호 문구 → 같은 키(다른 기기에서도)', await A.unlockKey('지어낸 암호 문구', r.kdf), r.key);
  sc.eq('㉒ 틀린 암호는 안 열림', await A.unlockKey('지어낸 암호 문구!', r.kdf), '');
  sc.eq('㉒ 너무 짧은 암호 문구는 정하지 않음', await A.newKdf('12345').then(() => 'ok', e => e.message), '암호 문구는 6자 이상');
  const body = '안녕하세요 목사님. 김하늘 집사입니다.\n'.repeat(50), e = await A.encText(r.key, body);
  sc.eq('㉒ 잠근 글에는 평문이 없음 · 매번 다른 iv', [Buffer.from(e.c, 'base64').toString('utf8').includes('김하늘'), e.c.includes('김하늘'), (await A.encText(r.key, body)).iv !== e.iv], [false, false, true]);
  sc.eq('㉒ 맞는 키로만 풀림', [await A.decText(r.key, e), await A.decText((await A.newKdf('다른 암호 문구')).key, e).then(() => 'opened', () => 'no')], [body, 'no']);
  sc.eq('㉒ 5시간 전사(약 9만 자)도 한 칸에 들어감', (await A.encText(r.key, '가'.repeat(90000))).c.length < A.TXT_MAX, true);
  sc.eq('㉒ 키가 바뀌면(남이 소금을 바꿈) 맞는 키로 안 봄', await A.checkKey(r.key, (await A.newKdf('지어낸 암호 문구')).kdf), false);
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8');
  sc.eq('㉒ 도우미는 계정 표지로 맞는 키인지 본 뒤에만 둠(600)', /PH\.checkKey\(k, doc\.kdf\)[\s\S]{0,120}writeJson\('key\.json', \{ k \}, true\)/.test(HELPER), true);
  sc.eq('㉒ 도우미가 계정에 올리는 txt 칸은 잠근 글(c · iv · v)뿐', /upd\(\['txt', id\], \{ c: e\.c, iv: e\.iv, v: 1 \}\)/.test(HELPER) && (HELPER.match(/\['txt'/g) || []).length === 1, true);
  sc.eq('㉒ 계기판 복사는 누른 자리에서 시작(ClipboardItem 에 약속) — 아이폰', /new ClipboardItem\(\{ 'text\/plain': p\.then/.test(HTML), true);
  sc.eq('㉒ 받기 파일 이름 = 드라이브 이름', /a\.download = fileOf\(id\)/.test(HTML) && /function fileOf\(id\) \{ return txtBase\(/.test(HTML), true);
  sc.eq('㉒ 계기판 키는 이 기기에만(계정에 쓰지 않음)', /localStorage\.setItem\(KEY_LS/.test(HTML) && !/set\(\{[^}]*\bkey\b/.test(HTML), true);
}
sc.done();
})().catch(e => { console.error(e); process.exit(1); });
