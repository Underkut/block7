// 같은 날 · 같은 구간의 할일을 **항목 단위**로 합친다 (v26-0828-5)
//
// ⚠️ 이 파일이 고정하는 것은 HB가 매일 겪는 그 증상이다:
//    "아이폰에서 오전에 할일 하나, 맥에서도 오전에 할일 하나를 넣었는데
//     둘 중 하나만 남는다."
//
//    예전 규칙은 하루 안의 big/small/events 를 **구간(secId) 배열 통째로** 3자
//    병합했다. 그래서 양쪽이 각각 새 할일을 더하면 "둘 다 바꿨다 → 손에 든 쪽"
//    으로 판정돼 **상대 기기의 그 구간이 통째로 버려졌다.**
//
//    새 규칙은 항목에 고유번호가 없다는 사실을 인정하고 **줄 수와 자리**로만
//    판단한다. 한쪽이라도 base 보다 짧아지면(삭제·재정렬) 예전 규칙 그대로 간다 —
//    고유번호 없이 그것까지 자동으로 정하려 들면 오히려 데이터가 섞인다.
//    (그건 Sync V2 의 몫 — docs/SYNC-V2.md 3-2)
// ⚠️ 병합 엔진은 **개발본(index-dev.html)** 에서 떠온다. 운영본(index.html)은
//    HB 가 개발본으로 확인하기 전까지 커밋되지 않기 때문이다 (CLAUDE.md 규칙).
//    두 산출물의 앱 코드는 글자 하나까지 같다.
const { sliceDev, makeScorer } = require('./_load');
const sc = makeScorer();
global.document = { visibilityState: 'visible', addEventListener: () => {} };
eval(sliceDev('let _fbLastTouchTs=', '// 원격/병합 상태를 화면'));

const clone = o => JSON.parse(JSON.stringify(o));
const day = (arr) => ({ big: { am: arr }, small: {}, trash: [] });
const texts = m => m.days['2026-08-28'].big.am.map(t => t.text);

// ═══ 1. ⚠️ 핵심: 두 기기가 같은 날 · 같은 구간에 각각 다른 할일 추가 ═══
console.log('시나리오 1 — 같은 구간에 각각 새 할일 (둘 다 살아야 한다)');
{
  const base = { days: { '2026-08-28': day([{ text: '설교 준비', done: false }]) } };
  const local = clone(base);
  local.days['2026-08-28'].big.am.push({ text: '맥에서 넣은 것', done: false });
  const cloud = clone(base);
  cloud.days['2026-08-28'].big.am.push({ text: '아이폰에서 넣은 것', done: false });
  const m = _fbMerge(base, local, cloud);
  sc.eq('원래 할일 그대로', texts(m)[0], '설교 준비');
  sc.eq('이 기기가 넣은 것 생존', texts(m).includes('맥에서 넣은 것'), true);
  sc.eq('다른 기기가 넣은 것도 생존', texts(m).includes('아이폰에서 넣은 것'), true);
  sc.eq('셋이 된다', texts(m).length, 3);
}

// ═══ 2. 한쪽만 추가하면 그대로 (예전과 같다) ═══
console.log('\n시나리오 2 — 한쪽만 추가');
{
  const base = { days: { '2026-08-28': day([{ text: 'A', done: false }]) } };
  const local = clone(base);
  const cloud = clone(base);
  cloud.days['2026-08-28'].big.am.push({ text: 'B', done: false });
  const m = _fbMerge(base, local, cloud);
  sc.eq('상대가 넣은 것을 받는다', texts(m), ['A', 'B']);
}

// ═══ 3. 같은 할일의 **다른 칸**을 각각 고치면 둘 다 산다 ═══
//     (제목이 같은 동안에만 칸 단위로 합친다 — 자리만 같고 제목이 다르면
//      순서가 바뀐 것일 수 있어 통째로 고른다)
console.log('\n시나리오 3 — 같은 할일의 다른 칸 (완료 vs 중요)');
{
  const base = { days: { '2026-08-28': day([{ text: '심방', done: false, star: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].done = true;
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].star = true;
  const m = _fbMerge(base, local, cloud);
  const t = m.days['2026-08-28'].big.am[0];
  sc.eq('이 기기의 완료 체크 생존', t.done, true);
  sc.eq('다른 기기의 중요 표시 생존', t.star, true);
  sc.eq('제목은 그대로', t.text, '심방');
}

// ═══ 4. 같은 할일의 **같은 칸**을 다르게 고치면 예전 규칙 (손에 든 쪽) ═══
console.log('\n시나리오 4 — 같은 칸 충돌은 예전 규칙 그대로');
{
  const base = { days: { '2026-08-28': day([{ text: 'A', done: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].text = 'A-이 기기';
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].text = 'A-다른 기기';
  const m = _fbMerge(base, local, cloud);
  sc.eq('손에 든 쪽이 이긴다', texts(m)[0], 'A-이 기기');
  sc.eq('항목 수는 그대로', texts(m).length, 1);
}

// ═══ 5. ⚠️ 삭제가 섞이면 자동으로 합치지 않는다 (예전 규칙) ═══
//     고유번호가 없으므로 "지웠다"와 "순서를 바꿨다"를 구별할 수 없다.
//     여기서 억지로 합치면 지운 할일이 되살아난다.
console.log('\n시나리오 5 — 한쪽이 지우면 예전 규칙으로 물러난다');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }, { text: 'B' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am = [{ text: 'A' }];  // B 삭제
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: 'C' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('지운 것이 되살아나지 않는다', texts(m).includes('B'), false);
  sc.eq('손에 든 쪽 판이 그대로', texts(m), ['A']);
}

// ═══ 6. 순서를 바꾸면 예전 규칙 (줄 수는 같지만 자리가 어긋난다) ═══
console.log('\n시나리오 6 — 순서 변경은 예전 규칙 그대로');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }, { text: 'B' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am = [{ text: 'B' }, { text: 'A' }];
  const cloud = clone(base); cloud.days['2026-08-28'].big.am[0].done = true;
  const m = _fbMerge(base, local, cloud);
  sc.eq('뒤섞인 항목이 생기지 않는다', texts(m), ['B', 'A']);
  sc.eq('항목 수 그대로', texts(m).length, 2);
}

// ═══ 7. 양쪽이 여러 개씩 추가 ═══
console.log('\n시나리오 7 — 양쪽이 여러 개씩 추가');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const local = clone(base);
  local.days['2026-08-28'].big.am.push({ text: 'L1' }, { text: 'L2' });
  const cloud = clone(base);
  cloud.days['2026-08-28'].big.am.push({ text: 'C1' }, { text: 'C2' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('다섯이 된다', texts(m).length, 5);
  sc.eq('이 기기 것이 먼저, 다른 기기 것이 뒤', texts(m), ['A', 'L1', 'L2', 'C1', 'C2']);
}

// ═══ 8. 추가 + 기존 항목 수정이 겹쳐도 둘 다 산다 ═══
console.log('\n시나리오 8 — 한쪽은 완료 체크, 한쪽은 새 할일 추가');
{
  const base = { days: { '2026-08-28': day([{ text: 'A', done: false }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am[0].done = true;
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: '새 할일' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('완료 체크 생존', m.days['2026-08-28'].big.am[0].done, true);
  sc.eq('새 할일도 생존', texts(m), ['A', '새 할일']);
}

// ═══ 9. 스몰블럭 · 일정에도 같은 규칙이 적용된다 ═══
console.log('\n시나리오 9 — small · events 도 같다');
{
  const base = { days: { '2026-08-28': { big: {}, small: { pm: [{ text: 'S' }] },
                                          events: { pm: [{ text: 'E', startTime: '10:00' }] }, trash: [] } } };
  const local = clone(base);
  local.days['2026-08-28'].small.pm.push({ text: 'S-맥' });
  local.days['2026-08-28'].events.pm.push({ text: 'E-맥', startTime: '11:00' });
  const cloud = clone(base);
  cloud.days['2026-08-28'].small.pm.push({ text: 'S-폰' });
  cloud.days['2026-08-28'].events.pm.push({ text: 'E-폰', startTime: '12:00' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('스몰블럭 셋', m.days['2026-08-28'].small.pm.map(x => x.text), ['S', 'S-맥', 'S-폰']);
  sc.eq('일정 셋', m.days['2026-08-28'].events.pm.map(x => x.text), ['E', 'E-맥', 'E-폰']);
}

// ═══ 10. base 를 모르면 예전 규칙 그대로 (복구 경로를 건드리지 않는다) ═══
console.log('\n시나리오 10 — base 없음(복구 경로)에서는 예전 규칙');
{
  const local = { days: { '2026-08-28': day([{ text: 'L' }]) } };
  const cloud = { days: { '2026-08-28': day([{ text: 'C' }]) } };
  const m = _fbMerge(null, local, cloud, false);   // 로컬 우선 복구
  sc.eq('로컬 우선이 유지된다', texts(m), ['L']);
}

// ═══ 11. 다른 구간 · 다른 날짜는 예전처럼 그대로 공존 ═══
console.log('\n시나리오 11 — 다른 구간·다른 날짜는 그대로 공존');
{
  const base = { days: { '2026-08-28': { big: { am: [{ text: 'A' }] }, small: {}, trash: [] } } };
  const local = clone(base);
  local.days['2026-08-28'].big.pm = [{ text: '맥-오후' }];
  const cloud = clone(base);
  cloud.days['2026-08-29'] = day([{ text: '폰-내일' }]);
  const m = _fbMerge(base, local, cloud);
  sc.eq('맥의 오후 구간 생존', m.days['2026-08-28'].big.pm[0].text, '맥-오후');
  sc.eq('폰의 내일 날짜 생존', m.days['2026-08-29'].big.am[0].text, '폰-내일');
}

// ═══ 12. 양쪽 판이 **글자 하나까지 같으면** 합치지 않는다 ═══
//     이건 "둘 다 같은 것을 적었다" 와 "내 쓰기가 메아리로 돌아왔다" 를
//     구별할 수 없는 자리다. 합치면 동기화가 한 바퀴 돌 때마다 할일이
//     하나씩 불어난다 → 같으면 그대로 둔다.
console.log('\n시나리오 12 — 양쪽 판이 완전히 같으면 그대로');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am.push({ text: '전화' });
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: '전화' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('메아리로 늘어나지 않는다', texts(m), ['A', '전화']);
}

// ═══ 13. 다른 내용을 각각 더하면 겹쳐 남는다 (12번과 대비) ═══
console.log('\n시나리오 13 — 내용이 다르면 둘 다 남는다');
{
  const base = { days: { '2026-08-28': day([{ text: 'A' }]) } };
  const local = clone(base); local.days['2026-08-28'].big.am.push({ text: '전화' });
  const cloud = clone(base); cloud.days['2026-08-28'].big.am.push({ text: '전화 2' });
  const m = _fbMerge(base, local, cloud);
  sc.eq('둘 다 남는다', texts(m), ['A', '전화', '전화 2']);
}

sc.done();
