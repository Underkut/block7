// 올리기 실패 진단 (v26-1025-3) — 아이폰처럼 콘솔이 없는 기기에서 '왜 안 올라가나' 를 데이터 복구 화면에 보인다
// 지키는 것:
//  ① 동작은 그대로 — 실패하면 기록만 하고 재시도 예약(_fbScheduleRetry)은 예전처럼 · 성공하면 기록을 지운다
//  ② 크기는 바이트로 잰다 (한글 3바이트) · 1MiB 를 넘으면 그렇다고 말한다
//  ③ 비교 화면이 클라우드 문서 크기와 이 기기 올리기 상태를 보여 준다
const { SRC, slice, makeScorer } = require('./_load');
const sc = makeScorer();
const C = slice('async function _fbCommit(){', 'function _fbScheduleRetry(){');
sc.eq('① 실패 → 기록 + 재시도 예약 그대로', /_fbLastErr=\{code:[\s\S]*bytes:outJson\?_fbBytes\(outJson\):0\};\}catch\(e\)\{\}\s*_fbScheduleRetry\(\);/.test(C), true);
sc.eq('① 성공 → 기록 지움', /ok=true;_fbLastErr=null;/.test(C), true);
const B = new Function(slice('let _fbLastErr=null;', 'async function _fbCommit(){') + '; return _fbBytes;')();
sc.eq('② 바이트 — 영문 1 · 한글 3', [B('ab'), B('가나'), B(''), B(null)], [2, 6, 0, 0]);
const D = slice('function _fbDiagBlock(){', 'window.checkDataRecovery=');
const mk = (err, clean, dirty) => new Function('_fbLastErr', '_fbCleanSeq', '_fbDirtySeq', '_cfEsc', '_dfWhen', D + '; return _fbDiagBlock();')(err, clean, dirty, s => String(s), () => '방금');
sc.eq('③ 실패 없음 · 남은 것 없음', /실패 기록 없음/.test(mk(null, 1, 1)), true);
sc.eq('③ 실패 없음 · 남은 것 있음', /올릴 것이 남아 있어요/.test(mk(null, 1, 2)), true);
const big = mk({ code: 'invalid-argument', msg: 'Document exceeds maximum size', at: 1, bytes: 1100000 }, 1, 2);
sc.eq('② 1MiB 넘음 → 한도를 넘었다고', [/실패하고 있어요/.test(big), /invalid-argument/.test(big), /1,074 KB/.test(big), /한도\(1MB\)를 넘어/.test(big)], [true, true, true, true]);
sc.eq('② 다른 까닭이면 한도 말은 없음', /한도\(1MB\)를 넘어/.test(mk({ code: 'permission-denied', msg: 'x', at: 1, bytes: 5000 }, 1, 2)), false);
const R = slice('window.checkDataRecovery=async function(){', '<button class="settings-btn" style="width:100%;background:var(--ac)');
sc.eq('③ 비교 화면에 문서 크기 · 올리기 상태', [/bytes:_fbBytes\(d\.json\)/.test(R), /문서 크기:/.test(R), /\$\{_fbDiagBlock\(\)\}/.test(R)], [true, true, true]);
sc.done();
