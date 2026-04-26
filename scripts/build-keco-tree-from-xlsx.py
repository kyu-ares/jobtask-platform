"""
KECO 2025 개정 항목표 xlsx → 4계층 트리 JSON

입력:  data/source/keco-2025.xlsx (시트: "2025 개정 한국고용직업분류 항목표")
출력:  data/keco-tree.json

행 구조 (헤더는 row 3, 데이터는 row 4~):
  A=대코드(1) | B=대명 | C=중코드(2) | D=중명 | E=소코드(3) | F=소명 | G=세코드(4) | H=세명

머지 셀 처리: 상위 컬럼 빈 셀은 직전 비-빈 값 carry-forward.
"""

import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RR = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data' / 'source' / 'keco-2025.xlsx'
OUT = ROOT / 'data' / 'keco-tree.json'
TARGET_SHEET = '2025 개정 한국고용직업분류 항목표'

if not SRC.exists():
    print(f'없음: {SRC}', file=sys.stderr)
    sys.exit(1)


def col_letter_to_idx(s):
    n = 0
    for c in s:
        n = n*26 + (ord(c) - ord('A') + 1)
    return n - 1


def cell_col(ref):
    return col_letter_to_idx(''.join(c for c in ref if c.isalpha()))


def load_shared_strings(z):
    if 'xl/sharedStrings.xml' not in z.namelist():
        return []
    sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
    out = []
    for si in sst.findall(f'{W}si'):
        t = si.find(f'{W}t')
        if t is not None and t.text is not None:
            out.append(t.text)
        else:
            out.append(''.join((r.text or '') for r in si.findall(f'{W}r/{W}t')))
    return out


def parse_sheet_rows(z, sheet_path, ss):
    """시트 row → 컬럼 인덱스 → 값 dict 리스트"""
    sx = ET.fromstring(z.read(sheet_path))
    rows = []
    for row in sx.findall(f'{W}sheetData/{W}row'):
        row_cells = {}
        for c in row.findall(f'{W}c'):
            ref = c.get('r')
            if not ref:
                continue
            ci = cell_col(ref)
            t = c.get('t')
            v = c.find(f'{W}v')
            inline = c.find(f'{W}is/{W}t')
            if t == 's' and v is not None and v.text is not None:
                val = ss[int(v.text)]
            elif t == 'inlineStr' and inline is not None:
                val = inline.text or ''
            elif v is not None:
                val = v.text or ''
            else:
                val = ''
            row_cells[ci] = (val or '').strip()
        rows.append(row_cells)
    return rows


def find_target_sheet_path(z, sheet_name):
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    sheets = wb.findall(f'{W}sheets/{W}sheet')
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid2target = {r.get('Id'): r.get('Target') for r in rels.findall(
        '{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}
    for s in sheets:
        if s.get('name') == sheet_name:
            target = rid2target[s.get(f'{RR}id')]
            return target if target.startswith('xl/') else f'xl/{target}'
    return None


def build_tree():
    with zipfile.ZipFile(SRC) as z:
        ss = load_shared_strings(z)
        sheet_path = find_target_sheet_path(z, TARGET_SHEET)
        if not sheet_path:
            print(f'시트 못 찾음: {TARGET_SHEET}', file=sys.stderr)
            sys.exit(1)
        rows = parse_sheet_rows(z, sheet_path, ss)

    # 컬럼 인덱스: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7
    COL_LCD, COL_LNM, COL_MCD, COL_MNM, COL_SCD, COL_SNM, COL_DCD, COL_DNM = 0, 1, 2, 3, 4, 5, 6, 7

    # 헤더는 row index 0,1,2 (1-based로 row 1~3). 데이터는 row 4~ → index 3+.
    # carry-forward
    cur_l = (None, None)
    cur_m = (None, None)
    cur_s = (None, None)

    nodes = []  # (lcd, lnm, mcd, mnm, scd, snm, dcd, dnm)
    for ri, row in enumerate(rows):
        if ri < 3:
            continue  # 헤더 건너뜀
        lcd = row.get(COL_LCD, '')
        lnm = row.get(COL_LNM, '')
        mcd = row.get(COL_MCD, '')
        mnm = row.get(COL_MNM, '')
        scd = row.get(COL_SCD, '')
        snm = row.get(COL_SNM, '')
        dcd = row.get(COL_DCD, '')
        dnm = row.get(COL_DNM, '')

        if lcd:
            cur_l = (lcd, lnm)
        if mcd:
            cur_m = (mcd, mnm)
        if scd:
            cur_s = (scd, snm)

        if not dcd:
            continue  # 진짜 비어있는 행
        # 세분류명 비어있으면 skip
        if not dnm:
            continue
        nodes.append((
            cur_l[0], cur_l[1], cur_m[0], cur_m[1], cur_s[0], cur_s[1], dcd, dnm
        ))

    # 트리 빌드
    lclas_map = {}
    for lcd, lnm, mcd, mnm, scd, snm, dcd, dnm in nodes:
        L = lclas_map.setdefault(lcd, {'code': lcd, 'name': lnm, 'mclas': {}})
        if not L['name']:
            L['name'] = lnm
        M = L['mclas'].setdefault(mcd, {'code': mcd, 'name': mnm, 'sclas': {}})
        if not M['name']:
            M['name'] = mnm
        S = M['sclas'].setdefault(scd, {'code': scd, 'name': snm, 'subd': {}})
        if not S['name']:
            S['name'] = snm
        # 세분류 (terminal)
        S['subd'][dcd] = {'code': dcd, 'name': dnm, 'unitCount': 0, 'units': []}

    # dict → array + 정렬
    lclas = []
    for L in sorted(lclas_map.values(), key=lambda x: x['code']):
        L_out = {
            'code': L['code'],
            'name': (L['name'] or '').strip(),
            'mclas': []
        }
        for M in sorted(L['mclas'].values(), key=lambda x: x['code']):
            M_out = {
                'code': M['code'],
                'name': (M['name'] or '').strip().rstrip('　'),
                'sclas': []
            }
            for S in sorted(M['sclas'].values(), key=lambda x: x['code']):
                S_out = {
                    'code': S['code'],
                    'name': (S['name'] or '').strip().rstrip('　'),
                    'subd': sorted(
                        ({'code': D['code'], 'name': D['name'].strip().rstrip('　'),
                          'unitCount': 0, 'units': []}
                         for D in S['subd'].values()),
                        key=lambda x: x['code'])
                }
                M_out['sclas'].append(S_out)
            L_out['mclas'].append(M_out)
        lclas.append(L_out)

    summary = {
        'lclas': len(lclas),
        'mclas': sum(len(L['mclas']) for L in lclas),
        'sclas': sum(len(M['sclas']) for L in lclas for M in L['mclas']),
        'subd': sum(len(S['subd']) for L in lclas for M in L['mclas'] for S in M['sclas']),
        'units': 0,
    }

    OUT.write_text(json.dumps({'summary': summary, 'lclas': lclas},
                              ensure_ascii=False, indent=2),
                   encoding='utf-8')
    print(f'tree summary: {summary}')
    print(f'saved → {OUT}')


if __name__ == '__main__':
    build_tree()
