"""KECO xlsx 시트·컬럼 구조 탐색 (의존성 없는 raw XML 파싱)"""
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
RR = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data' / 'source' / 'keco-2025.xlsx'

if not SRC.exists():
    print(f'❌ 없음: {SRC}')
    sys.exit(1)

print(f'📂 {SRC} ({SRC.stat().st_size/1024:.1f} KB)')


def col_letter_to_idx(s):
    n = 0
    for c in s:
        n = n*26 + (ord(c) - ord('A') + 1)
    return n - 1


def cell_col(ref):
    return col_letter_to_idx(''.join(c for c in ref if c.isalpha()))


with zipfile.ZipFile(SRC) as z:
    # 1) workbook 시트 목록
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    sheets = []
    for s in wb.findall(f'{W}sheets/{W}sheet'):
        sheets.append((s.get('name'), s.get(f'{RR}id'), s.get('sheetId')))
    print(f'\n📑 sheets ({len(sheets)}):')
    for n, rid, sid in sheets:
        print(f'   - sheetId={sid} name="{n}" rId={rid}')

    # 2) workbook rels → sheet xml path 매핑
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid2target = {r.get('Id'): r.get('Target') for r in rels.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

    # 3) sharedStrings 로드
    ss = []
    if 'xl/sharedStrings.xml' in z.namelist():
        sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in sst.findall(f'{W}si'):
            t_text = ''
            t_node = si.find(f'{W}t')
            if t_node is not None and t_node.text is not None:
                t_text = t_node.text
            else:
                # rich text: concat all r/t
                t_text = ''.join((r.text or '') for r in si.findall(f'{W}r/{W}t'))
            ss.append(t_text)
    print(f'   sharedStrings: {len(ss)} items')

    # 4) 각 시트 첫 5행 출력
    for name, rid, sid in sheets:
        target = rid2target.get(rid)
        if not target:
            continue
        path = f'xl/{target}' if not target.startswith('xl/') else target
        if path.startswith('/'):
            path = path[1:]
        try:
            xml_bytes = z.read(path)
        except KeyError:
            print(f'   ⚠ no path for {name}: {path}')
            continue
        sheet_xml = ET.fromstring(xml_bytes)
        rows = sheet_xml.findall(f'{W}sheetData/{W}row')
        total_rows = len(rows)
        print(f'\n--- 시트 "{name}" — total {total_rows} rows ---')
        for ri, row in enumerate(rows[:8]):
            cells_dump = []
            for c in row.findall(f'{W}c'):
                ref = c.get('r', '')
                t = c.get('t')
                v_node = c.find(f'{W}v')
                inline = c.find(f'{W}is/{W}t')
                if t == 's' and v_node is not None:
                    val = ss[int(v_node.text)] if v_node.text else ''
                elif t == 'inlineStr' and inline is not None:
                    val = inline.text or ''
                elif v_node is not None:
                    val = v_node.text
                else:
                    val = ''
                cells_dump.append(f'{ref}={val}')
            print(f'  row{ri+1}: {" | ".join(cells_dump)}')
