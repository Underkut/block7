#!/usr/bin/env bash
# lab/vf-bg-lab.html 을 만든다 (손으로 고치지 말 것 — 여기서 만든다).
#   조각:  lab/vf-bg/lab-shell.html + vf-bg.css + vf-bg.html + vf-bg.js
#   그리고 index.html 에서 **테마 표(VF_PATTERNS)를 그대로 떠 온다** —
#   실험실이 앱과 같은 색을 보여야 비교가 된다.
# 돌리는 법:  ./lab/vf-bg/build-lab.sh
set -eu
cd "$(dirname "$0")/../.."
python3 - <<'PY'
import re,sys,pathlib
root=pathlib.Path('.')
shell=(root/'lab/vf-bg/lab-shell.html').read_text(encoding='utf-8')
css  =(root/'lab/vf-bg/vf-bg.css').read_text(encoding='utf-8')
html =(root/'lab/vf-bg/vf-bg.html').read_text(encoding='utf-8')
js   =(root/'lab/vf-bg/vf-bg.js').read_text(encoding='utf-8')
src  =(root/'index.html').read_text(encoding='utf-8')

# index.html 에서 테마 표를 떠 온다 (VF_SERIF ~ _rgba 까지)
a=src.index('const VF_SERIF=')
b=src.index('// 패턴 선택 = 다중 선택',a)
appbits=src[a:b].rstrip()
if 'VF_PATTERNS' not in appbits or '_rgba' not in appbits:
    sys.exit('index.html 에서 테마 표를 못 떠 왔어요 — 표시 문자열이 바뀌었나 봅니다')

# vf-bg.html 을 둘로 가른다 (설정창 조각 / body 조각)
m=re.search(r'<!-- ═══ ② .*?═+ -->', html, re.S)
if not m: sys.exit('vf-bg.html 의 ② 표시를 못 찾았어요')
part1=html[:m.start()]
part2=html[m.end():]
# 설정창 조각에서 맨 위 주석 덩어리는 뺀다 (실험실 화면에서는 군더더기)
part1=re.sub(r'^<!--.*?-->\s*','',part1,flags=re.S)
part1=re.sub(r'^<!-- ═══ ① .*?-->\s*','',part1,flags=re.S)

out=(shell
  .replace('/*VFBG_CSS*/',css)
  .replace('<!--VFBG_HTML_SETTINGS-->',part1.strip())
  .replace('<!--VFBG_HTML_BODY-->',part2.strip())
  .replace('<!--VFBG_JS-->','<script>\n'+js+'\n</script>')
  .replace('/*VFBG_APPBITS*/',appbits))
if '/*VFBG_' in out or '<!--VFBG_' in out:
    sys.exit('채우지 못한 자리가 남았어요: '+re.findall(r'(/\*VFBG_\w+\*/|<!--VFBG_\w+-->)',out)[0])
(root/'lab/vf-bg-lab.html').write_text(out,encoding='utf-8')
print('lab/vf-bg-lab.html 만들었어요 ('+str(len(out)//1024)+'KB)')
PY
