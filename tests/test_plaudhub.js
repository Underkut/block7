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
const fs = require('fs'), path = require('path'), vm = require('vm'), http = require('http'), os = require('os');
const { makeScorer } = require('./_load');
const sc = makeScorer();

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'plaudhub', 'index.html'), 'utf8');
const m = HTML.match(/<script id="plaudhub-core">([\s\S]*?)<\/script>/);
if (!m) { console.error('plaudhub-core 덩어리를 못 찾았습니다'); process.exit(2); }
const ctx = { console, Math, JSON, Number, Object, Set, Map, Array, String, Date, RegExp, Promise, Error };
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
  sc.eq('⑥ 설정 다듬기 (모르는 기간 · 모델은 기본)', J(A.settingsOf({ kw: ['상담'], days: 99, model: 'tiny' })), { kw: ['상담'], days: 14, model: 'medium-q5_0' });
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
  sc.eq('⑦ 전사 어림 = 길이 ÷ 모델 빠르기 + 1분', [v[0].est, v[1].est], [Math.ceil(48 / 4) + 1, 60 + 1]);
  sc.eq('⑦ 터보 모델이면 더 짧게 어림', A.estMin(4 * 3600, 'large-v3-turbo-q5_0'), 41);
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
  sc.eq('⑨ 쓰는 칸은 제목 · 시작 · 만든 때 · 길이뿐', Object.keys(p.put[0].v).sort(), ['c', 'd', 'n', 't']);
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
  sc.eq('⑪ 일감 칸에는 제목 · 전사문 자리가 없다', jobKeys.split(',').map(s => s.trim().replace(/'/g, '')), ['st', 'step', 'mac', 'at', 'pick', 'err']);
  sc.eq('⑪ 녹음 번호 꼴 = 판단 덩어리와 같음', rules.includes("'^[A-Za-z0-9_]{8,64}$'") && String(A.ID_RE) === '/^[A-Za-z0-9_]{8,64}$/', true);
  sc.eq('⑪ 규칙은 plaud 칸만 (users 를 열지 않음)', /match \/users/.test(rules), false);
}
// ⑫ 도우미
{
  const HELPER = fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8');
  sc.eq('⑫ 도우미 판 = 계기판이 아는 최신 판', (/export const HELPER_VERSION = '([^']+)'/.exec(HELPER) || [])[1], A.HELPER_LATEST);
  sc.eq('⑫ 도우미는 판단을 두 벌로 갖지 않는다(parseRecent 를 스스로 정의하지 않음)', /function parseRecent|function claimCheck/.test(HELPER), false);
  sc.eq('⑫ 도우미는 PLAUD 사용 통계 · 새 판 알림을 끈다', /PLAUD_TELEMETRY_DISABLED = '1'/.test(HELPER) && /PLAUD_NO_UPDATE_NOTIFIER = '1'/.test(HELPER), true);
  sc.eq('⑫ 도우미는 음성 주소를 묻지 않는다(P2 — plaud audio 없음)', /'audio'/.test(HELPER), false);
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
  sc.eq('⑬ 계기판 · 도우미는 users/{uid} 를 건드리지 않음', /collection\('users'\)|\/users\//.test(HTML + fs.readFileSync(path.join(ROOT, 'plaudhub', 'helper.mjs'), 'utf8')), false);
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
sc.done();
})().catch(e => { console.error(e); process.exit(1); });
