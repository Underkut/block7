// index.html 안의 함수 덩어리를 잘라내 테스트에서 쓰기 위한 공용 로더.
// BLOCK7은 단일 파일이라 모듈 import가 없으므로, 시작·끝 표시 문자열로
// 구간을 떠서 eval 한다. 표시 문자열이 사라지면 즉시 큰 소리로 실패한다.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'index.html');
if (!fs.existsSync(FILE)) {
  console.error('index.html 을 찾지 못했어요. 저장소 최상위에서 실행해주세요.');
  process.exit(2);
}
const SRC = fs.readFileSync(FILE, 'utf-8');

function slice(startMark, endMark) {
  const a = SRC.indexOf(startMark);
  if (a < 0) throw new Error(`[로더] 시작 표시를 찾지 못했어요: ${startMark}\n  → index.html이 바뀌었다면 tests/*.js 의 표시 문자열을 맞춰주세요.`);
  const b = SRC.indexOf(endMark, a);
  if (b < 0) throw new Error(`[로더] 끝 표시를 찾지 못했어요: ${endMark}`);
  return SRC.slice(a, b);
}

// ── 개발본에서 떠오기 ──
// ⚠️ 운영본(index.html)은 HB 가 개발본으로 확인하기 전에는 커밋되지 않는다
//    (CLAUDE.md 규칙). 그래서 아직 운영본에 없는 코드를 검사하는 테스트는
//    **개발본(index-dev.html)** 에서 떠와야 한다 — 둘은 5줄(DEV_MODE 등)만
//    다르고 앱 코드는 글자 하나까지 같다.
const DEV_FILE = path.join(__dirname, '..', 'index-dev.html');
const SRC_DEV = fs.existsSync(DEV_FILE) ? fs.readFileSync(DEV_FILE, 'utf-8') : SRC;

function sliceFrom(text, startMark, endMark, whose) {
  const a = text.indexOf(startMark);
  if (a < 0) throw new Error(`[로더] 시작 표시를 찾지 못했어요(${whose}): ${startMark}`);
  const b = text.indexOf(endMark, a);
  if (b < 0) throw new Error(`[로더] 끝 표시를 찾지 못했어요(${whose}): ${endMark}`);
  return text.slice(a, b);
}
function sliceDev(startMark, endMark) {
  return sliceFrom(SRC_DEV, startMark, endMark, 'index-dev.html');
}

// 채점기
function makeScorer() {
  const s = { pass: 0, fail: 0 };
  s.eq = (name, got, want) => {
    const a = JSON.stringify(got), b = JSON.stringify(want);
    if (a === b) { s.pass++; console.log('  ✓', name); }
    else { s.fail++; console.log('  ✗', name, '\n    결과:', a, '\n    기대:', b); }
  };
  s.done = () => {
    console.log('\n결과: 통과', s.pass, '/ 실패', s.fail);
    process.exit(s.fail ? 1 : 0);
  };
  return s;
}

module.exports = { SRC, SRC_DEV, slice, sliceDev, makeScorer };
