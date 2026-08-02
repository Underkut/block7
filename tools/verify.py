#!/usr/bin/env python3
# BLOCK7 배포 전 검증 4종
import re, subprocess, sys, os, tempfile

path = sys.argv[1]
src = open(path, encoding='utf-8').read()
fails = []

# ── 1. 인라인 <script> 각각 node --check ──
scripts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', src, re.S)
ok_syntax = 0
for i, body in enumerate(scripts):
    if not body.strip():
        continue
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(body)
        tmp = f.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    os.unlink(tmp)
    if r.returncode != 0:
        fails.append(f'[구문] script #{i}: {r.stderr.strip()[:500]}')
    else:
        ok_syntax += 1
print(f'1) 인라인 스크립트 {len(scripts)}개 중 {ok_syntax}개 구문 통과')

# ── 2. const ST=load() 정확히 1개 ──
n = len(re.findall(r'const ST\s*=\s*load\(\)', src))
print(f'2) const ST=load() = {n}개' + (' ✓' if n == 1 else ' ✗'))
if n != 1:
    fails.append(f'[상태] const ST=load() {n}개 (1개여야 함)')

# ── 3. div / button / svg 균형 ──
for tag, allowed_diff in (('div', 0), ('button', 1), ('svg', 0)):
    opens = len(re.findall(r'<' + tag + r'(?=[\s>])', src))
    closes = len(re.findall(r'</' + tag + r'>', src))
    diff = opens - closes
    mark = '✓' if diff == allowed_diff else '✗'
    note = ' (주석 예시 1개 불균형 정상)' if tag == 'button' else ''
    print(f'3) <{tag}> {opens} / </{tag}> {closes} → 차이 {diff}{note} {mark}')
    if diff != allowed_diff:
        fails.append(f'[균형] {tag}: 여는 {opens} / 닫는 {closes}')

# ── 4. 미정의 참조 스캔 ──
js = '\n'.join(scripts)
defined = set()
for m in re.finditer(r'\bfunction\s+([A-Za-z_$][\w$]*)', js): defined.add(m.group(1))
for m in re.finditer(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)', js): defined.add(m.group(1))
for m in re.finditer(r'window\.([A-Za-z_$][\w$]*)\s*=', js): defined.add(m.group(1))
for m in re.finditer(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)+)', js):
    for name in re.split(r'\s*,\s*', m.group(1)): defined.add(name.strip())
builtins = set('''document window console localStorage navigator location history screen alert confirm prompt fetch setTimeout setInterval clearTimeout clearInterval requestAnimationFrame cancelAnimationFrame JSON Math Date Object Array String Number Boolean Promise Set Map RegExp Error TypeError parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent btoa atob Blob File FileReader URL URLSearchParams FormData Image Audio CustomEvent Event KeyboardEvent MouseEvent TouchEvent Notification firebase emailjs performance crypto structuredClone getComputedStyle matchMedia caches indexedDB undefined null true false this arguments Intl Infinity NaN globalThis queueMicrotask ClipboardItem AbortController XMLSerializer DOMParser MutationObserver ResizeObserver IntersectionObserver'''.split())
# HTML 이벤트 핸들러 속성 안에서 호출되는 함수명
handler_calls = set()
for m in re.finditer(r'on(?:click|change|input|submit|keydown|keyup|touchstart|touchend|load|error|blur|focus)\s*=\s*"([^"]*)"', src):
    for c in re.finditer(r'(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(', m.group(1)):
        if c.group(1) not in ('if','for','while','switch','return','function','var','let','const','typeof','new','catch'):
            handler_calls.add(c.group(1))
missing = sorted(h for h in handler_calls if h not in defined and h not in builtins and h not in ('event',))
print(f'4) HTML 핸들러 호출 함수 {len(handler_calls)}개 스캔 → 미정의 {len(missing)}개' + (' ✓' if not missing else ' ✗'))
if missing:
    fails.append('[미정의] ' + ', '.join(missing[:30]))
# 이번 수정에서 새로 도입/제거한 이름 점검
for name in ['_fbCommit','_fbMerge','_fbSetBase','_fbLoadPersistedBase','_fbClearBase','_fbBaseObj',
             '_fbApplyStateToApp','_fbWriteBackup','_fbEnsureSync','_fbScheduleRetry','_fbForceWrite',
             '_mgWhole','_mgContainerKeys','_mgEntryArray','_mgLogFlat','_mgLogNested','_mgDay','_mgById',
             'showAutoBackups','restoreAutoBackup']:
    if name not in defined:
        fails.append(f'[미정의] 새 함수 {name} 정의 없음')
if re.search(r'_fbLastLocalEditTs', src):
    fails.append('[잔재] _fbLastLocalEditTs 참조가 남아 있음 (제거돼야 함)')

print()
if fails:
    print('✗ 실패:')
    for f in fails: print('  -', f)
    sys.exit(1)
print('✓ 4종 검증 모두 통과')
