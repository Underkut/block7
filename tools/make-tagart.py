#!/usr/bin/env python3
# docs/tag-art-marks.html 의 <defs> 도안과 tools/tag-groups.py 의 묶음표를 읽어
# index.html 에 심을 JS 덩어리를 만든다.
#
# 왜 자동으로 만드나: 도안을 손으로 두 벌(도안집·index.html) 관리하면 반드시
# 어긋난다. 도안집이 원본이고 여기서 뽑아 쓴다.
#
# 원·타원은 path 로 바꾼다 — 공유 이미지는 캔버스에 Path2D 로 다시 그리는데
# 그때 도형이 아니라 path 하나로 통일돼 있어야 코드가 단순해진다.
#
#   사용법:  python3 tools/make-tagart.py          (JS 를 표준출력으로)

import re, sys, importlib.util, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / 'docs' / 'tag-art-marks.html'
GROUPS = ROOT / 'tools' / 'tag-groups.py'


def load_groups():
    spec = importlib.util.spec_from_file_location('tg', GROUPS)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def num(s):
    f = float(s)
    return int(f) if f == int(f) else f


def circle_to_path(cx, cy, r):
    cx, cy, r = num(cx), num(cy), num(r)
    return f'M{num(cx - r)} {cy}A{r} {r} 0 1 0 {num(cx + r)} {cy}A{r} {r} 0 1 0 {num(cx - r)} {cy}Z'


def ellipse_to_path(cx, cy, rx, ry):
    cx, cy, rx, ry = num(cx), num(cy), num(rx), num(ry)
    return (f'M{num(cx - rx)} {cy}A{rx} {ry} 0 1 0 {num(cx + rx)} {cy}'
            f'A{rx} {ry} 0 1 0 {num(cx - rx)} {cy}Z')


def attrs(tag):
    return dict(re.findall(r'([a-z-]+)="([^"]*)"', tag))


def parse_marks():
    src = HTML.read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r'<g id="(m-[a-z]+)"([^>]*)>(.*?)</g>\s*(?=<g id="m-|</defs>)',
                         src, re.S):
        mid, gattr, body = m.group(1), attrs(m.group(2)), m.group(3)
        paths = []
        for el in re.finditer(r'<(path|circle|ellipse)\b([^>]*)/>', body):
            kind, a = el.group(1), attrs(el.group(2))
            if kind == 'path':
                d = a['d']
            elif kind == 'circle':
                d = circle_to_path(a['cx'], a['cy'], a['r'])
            else:
                d = ellipse_to_path(a['cx'], a['cy'], a['rx'], a['ry'])
            o = {}
            if 'stroke-width' in a:
                o['w'] = num(a['stroke-width'])
            if 'stroke-dasharray' in a:
                o['dash'] = [num(x) for x in re.split(r'[ ,]+', a['stroke-dasharray'].strip())]
            if 'stroke-dashoffset' in a:
                o['off'] = num(a['stroke-dashoffset'])
            if a.get('fill') not in (None, 'none'):
                o['fill'] = 1
            paths.append((d, o))
        g = {}
        if gattr.get('stroke-linecap'):
            g['cap'] = gattr['stroke-linecap']
        if gattr.get('stroke-linejoin'):
            g['join'] = gattr['stroke-linejoin']
        out[mid] = (g, paths)
    return out


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    marks = parse_marks()
    tg = load_groups()

    need = {i for v in tg.MARK.values() for i in v}
    missing = need - set(marks)
    if missing:
        sys.exit(f'도안집에 없는 id: {sorted(missing)}')
    unused = set(marks) - need
    if unused:
        sys.exit(f'묶음표가 안 쓰는 id: {sorted(unused)}')

    L = []
    L.append('// ══ 태그 그림 (v26-0825-3) ══')
    L.append('// 도안집(docs/tag-art-marks.html)과 묶음표(tools/tag-groups.py)에서')
    L.append('// tools/make-tagart.py 가 만든다. **손으로 고치지 말 것** — 도안을 바꾸려면')
    L.append('// 도안집을 고치고 그 스크립트를 다시 돌린다. 규칙은 docs/TAG-ART.md.')
    L.append('const _TAGART_MARKS={')
    for mid in sorted(marks):
        g, paths = marks[mid]
        head = ''.join(f"{k}:{js_str(v)}," for k, v in g.items())
        ps = []
        for d, o in paths:
            if o:
                bits = ','.join(
                    (f'dash:[{",".join(str(x) for x in v)}]' if k == 'dash' else f'{k}:{v}')
                    for k, v in o.items())
                ps.append(f'[{js_str(d)},{{{bits}}}]')
            else:
                ps.append(f'[{js_str(d)}]')
        L.append(f'{js_str(mid)}:{{{head}p:[' + ','.join(ps) + ']},')
    L.append('};')

    L.append('// 묶음 → 도안 id (여럿이면 본문 낱말로 고르고, 못 고르면 무작위)')
    L.append('const _TAGART_MARKOF={' + ','.join(
        f'{js_str(k)}:[' + ','.join(js_str(i) for i in v) + ']'
        for k, v in tg.MARK.items()) + '};')

    L.append('// 도안 id → 본문에서 찾을 낱말')
    L.append('const _TAGART_PICK={' + ','.join(
        f'{js_str(k)}:[' + ','.join(js_str(w) for w in v) + ']'
        for k, v in tg.PICK.items()) + '};')

    L.append('// 태그 → 묶음. 자리를 아끼려고 묶음마다 태그를 이어 두고 처음 쓸 때 표로 편다.')
    L.append("// ⚠️ 구분자는 반드시 '|' 다. 공백으로 이으면 '성령 충만'·'하나님의 뜻'처럼")
    L.append('//    띄어쓰기 있는 태그가 조각나서 영영 안 걸린다 (369개 중 101개가 그렇다).')
    L.append('const _TAGART_GROUPSRC={' + ','.join(
        f'{js_str(k)}:{js_str("|".join(v))}' for k, v in tg.G.items()) + '};')

    print('\n'.join(L))


if __name__ == '__main__':
    main()
