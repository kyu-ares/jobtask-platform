"""
NCS↔KECO 공식 매핑 CSV → 양방향 인덱스 JSON
출처: data.go.kr 15154290 (한국고용정보원, 2025-11)
입력:  data/source/ncs-keco-map.csv
출력:  data/ncs-keco-map.json
"""

import csv
import json
import sys
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'data' / 'source' / 'ncs-keco-map.csv'
OUT = ROOT / 'data' / 'ncs-keco-map.json'

if not SRC.exists():
    print(f'없음: {SRC}', file=sys.stderr)
    sys.exit(1)

ncs_to_keco = defaultdict(dict)  # ncs6 → { keco4: name }
keco_to_ncs = defaultdict(dict)  # keco4 → { ncs6: name }
ncs_names = {}
keco_names = {}

with SRC.open(encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

for r in rows:
    ncs = (r.get('NCS 코드') or '').strip()
    ncs_nm = (r.get('NCS 코드명') or '').strip()
    keco = (r.get('KECO 코드') or '').strip()
    keco_nm = (r.get('KECO 코드명') or '').strip()
    if not ncs or not keco:
        continue
    ncs_to_keco[ncs][keco] = keco_nm
    keco_to_ncs[keco][ncs] = ncs_nm
    if ncs_nm:
        ncs_names[ncs] = ncs_nm
    if keco_nm:
        keco_names[keco] = keco_nm

ncs_to_keco_out = {
    n: [{'code': k, 'name': nm} for k, nm in sorted(d.items())]
    for n, d in ncs_to_keco.items()
}
keco_to_ncs_out = {
    k: [{'code': n, 'name': nm} for n, nm in sorted(d.items())]
    for k, d in keco_to_ncs.items()
}

summary = {
    'totalRows': len(rows),
    'uniqueNcs': len(ncs_to_keco_out),
    'uniqueKeco': len(keco_to_ncs_out),
    'avgKecoPerNcs': round(sum(len(v) for v in ncs_to_keco_out.values())/max(1, len(ncs_to_keco_out)), 2),
    'avgNcsPerKeco': round(sum(len(v) for v in keco_to_ncs_out.values())/max(1, len(keco_to_ncs_out)), 2),
}

OUT.write_text(json.dumps({
    'description': 'NCS 소분류(6자리) ↔ KECO 2025 세분류(4자리) 양방향 매핑. data.go.kr 15154290 (2025-11) 기반',
    'summary': summary,
    'ncsNames': ncs_names,
    'kecoNames': keco_names,
    'ncsToKeco': ncs_to_keco_out,
    'kecoToNcs': keco_to_ncs_out,
}, ensure_ascii=False, indent=2), encoding='utf-8')

print(f'summary: {summary}')
print(f'saved → {OUT}')
