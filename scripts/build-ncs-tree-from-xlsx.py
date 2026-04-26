"""
NCS 정보망 DB(.xlsx)에서 4계층 분류 트리 추출 → data/ncs-tree.json

입력:  data/ncs-db-source.xlsx (24 시트, 대분류별)
출력:  data/ncs-tree.json (App에서 자동 로드)

스트리밍 파서로 200MB xlsx 처리 — 시트별로 필요한 컬럼만 읽고 dedupe.
"""

import json
import os
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
ROOT = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get('NCS_XLSX', ROOT / 'data' / 'ncs-db-source.xlsx'))
OUT = ROOT / 'data' / 'ncs-tree.json'

if not SRC.exists():
    print(f'❌ 입력 파일 없음: {SRC}')
    sys.exit(1)

print(f'📂 source: {SRC} ({SRC.stat().st_size / 1024 / 1024:.1f} MB)')


def col_letter_to_idx(letter: str) -> int:
    """A→0, B→1, ..., Z→25, AA→26"""
    n = 0
    for c in letter:
        n = n * 26 + (ord(c) - ord('A') + 1)
    return n - 1


def cell_ref_to_col(ref: str) -> int:
    letters = ''.join(ch for ch in ref if ch.isalpha())
    return col_letter_to_idx(letters)


with zipfile.ZipFile(SRC) as z:
    # 1) shared strings 로드
    print('📖 shared strings 로딩...')
    sst_xml = z.read('xl/sharedStrings.xml').decode('utf-8')
    sst_root = ET.fromstring(sst_xml)
    sst = []
    for si in sst_root.findall(f'{W}si'):
        txt = ''.join(t.text or '' for t in si.iter(f'{W}t'))
        sst.append(txt)
    sst_root.clear()
    print(f'   {len(sst):,} strings')

    # 2) workbook의 sheet 이름·rId 매핑
    wb_xml = z.read('xl/workbook.xml').decode('utf-8')
    wb = ET.fromstring(wb_xml)
    rels_xml = z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    rels = ET.fromstring(rels_xml)
    rid_to_target = {}
    REL = '{http://schemas.openxmlformats.org/package/2006/relationships}'
    for r in rels.findall(f'{REL}Relationship'):
        rid_to_target[r.get('Id')] = r.get('Target')
    sheets = []
    R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
    for s in wb.findall(f'{W}sheets/{W}sheet'):
        rid = s.get(f'{R}id')
        target = rid_to_target.get(rid, '')
        if not target.startswith('xl/'):
            target = 'xl/' + target.lstrip('/')
        sheets.append({'name': s.get('name'), 'path': target})
    print(f'📑 sheets: {len(sheets)}')

    # 3) 시트 순회
    # 컬럼 인덱스 (header에서 뽑지만, 모두 동일하다고 가정)
    HEADERS = {
        'lclas_code': 0,    # 대분류코드
        'lclas_name': 1,    # 대분류코드명
        'mclas_code': 2,
        'mclas_name': 3,
        'sclas_code': 4,
        'sclas_name': 5,
        'subd_code': 6,
        'subd_name': 7,
        'unit_code': 8,     # 능력단위분류번호
        'unit_name': 9,
        'unit_level': 10,
    }

    # 트리 구성 (dedupe 위해 dict)
    lclas_dict = {}  # code → {code,name,mclas:dict}
    units_seen = set()
    total_rows = 0

    for sh in sheets:
        sh_path = sh['path']
        print(f'   ▸ {sh["name"]} 처리 중...', end='', flush=True)
        rows_count = 0

        with z.open(sh_path) as fp:
            for event, elem in ET.iterparse(fp, events=('end',)):
                if elem.tag != f'{W}row':
                    continue
                row_idx = int(elem.get('r', '0'))
                if row_idx == 1:
                    elem.clear()
                    continue  # 헤더 skip

                # cells
                vals = {}
                for c in elem.findall(f'{W}c'):
                    ref = c.get('r', '')
                    col_idx = cell_ref_to_col(ref) if ref else None
                    if col_idx is None or col_idx > 10:
                        continue
                    t = c.get('t')
                    v = c.find(f'{W}v')
                    if v is None or v.text is None:
                        vals[col_idx] = ''
                    elif t == 's':
                        vals[col_idx] = sst[int(v.text)]
                    elif t == 'inlineStr':
                        is_node = c.find(f'{W}is')
                        if is_node is not None:
                            vals[col_idx] = ''.join(
                                t.text or '' for t in is_node.iter(f'{W}t')
                            )
                        else:
                            vals[col_idx] = ''
                    else:
                        vals[col_idx] = v.text

                lc = vals.get(0, '').strip()
                lcn = vals.get(1, '').strip()
                mc = vals.get(2, '').strip()
                mcn = vals.get(3, '').strip()
                sc = vals.get(4, '').strip()
                scn = vals.get(5, '').strip()
                dc = vals.get(6, '').strip()
                dcn = vals.get(7, '').strip()
                uc = vals.get(8, '').strip()
                ucn = vals.get(9, '').strip()
                ulv = vals.get(10, '').strip()

                if not lc:
                    elem.clear()
                    continue

                rows_count += 1

                # full codes
                lc2 = lc.zfill(2)
                mc4 = lc2 + mc.zfill(2)
                sc6 = mc4 + sc.zfill(2)
                dc8 = sc6 + dc.zfill(2)

                L = lclas_dict.setdefault(
                    lc2, {'code': lc2, 'name': lcn, '_m': {}}
                )
                M = L['_m'].setdefault(
                    mc4, {'code': mc4, 'name': mcn, '_s': {}}
                )
                S = M['_s'].setdefault(
                    sc6, {'code': sc6, 'name': scn, '_d': {}}
                )
                D = S['_d'].setdefault(
                    dc8,
                    {
                        'code': dc8,
                        'name': dcn,
                        'unitCount': 0,
                        '_units': {},
                    },
                )

                if uc and uc not in units_seen:
                    units_seen.add(uc)
                    D['_units'][uc] = {
                        'code': uc,
                        'name': ucn,
                        'level': ulv,
                    }
                    D['unitCount'] = len(D['_units'])

                elem.clear()

        total_rows += rows_count
        print(f' {rows_count:,} rows')

# 4) dict → 정렬된 리스트로 변환
def to_list(L):
    return {
        'code': L['code'],
        'name': L['name'],
        'mclas': sorted(
            [
                {
                    'code': M['code'],
                    'name': M['name'],
                    'sclas': sorted(
                        [
                            {
                                'code': S['code'],
                                'name': S['name'],
                                'subd': sorted(
                                    [
                                        {
                                            'code': D['code'],
                                            'name': D['name'],
                                            'unitCount': D['unitCount'],
                                            'units': list(D['_units'].values()),
                                        }
                                        for D in S['_d'].values()
                                    ],
                                    key=lambda x: x['code'],
                                ),
                            }
                            for S in M['_s'].values()
                        ],
                        key=lambda x: x['code'],
                    ),
                }
                for M in L['_m'].values()
            ],
            key=lambda x: x['code'],
        ),
    }


lclas_list = sorted(
    [to_list(L) for L in lclas_dict.values()], key=lambda x: x['code']
)

# summary
n_l = len(lclas_list)
n_m = sum(len(L['mclas']) for L in lclas_list)
n_s = sum(len(M['sclas']) for L in lclas_list for M in L['mclas'])
n_d = sum(len(S['subd']) for L in lclas_list for M in L['mclas'] for S in M['sclas'])
n_u = sum(
    D['unitCount']
    for L in lclas_list
    for M in L['mclas']
    for S in M['sclas']
    for D in S['subd']
)

tree = {
    'summary': {
        'lclas': n_l,
        'mclas': n_m,
        'sclas': n_s,
        'subd': n_d,
        'units': n_u,
    },
    'lclas': lclas_list,
}

print(f'\n✅ summary: lclas={n_l}, mclas={n_m}, sclas={n_s}, subd={n_d}, units={n_u}')
print(f'   total rows scanned: {total_rows:,}')

OUT.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'💾 saved → {OUT} ({OUT.stat().st_size / 1024 / 1024:.1f} MB)')
