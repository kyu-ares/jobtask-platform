"""
공고 본문 텍스트에서 시·군·구·동 위치 추출 → opening.sgg / opening.dong 필드 추가

입력: data/openings.json (re-fetch with raw 본문)
출력: data/openings.json (sgg, dong 필드 보강)

알고리즘:
1. 시군구·동 사전 빌드 (이름 → [(code, parent_code), ...])
2. 각 공고의 본문 텍스트 (title, org, rawAplyQlfc, rawScrnMethod, rawPref, rawPrefCond) 합쳐서 텍스트 blob 생성
3. 동 매칭: '거진읍', '사직동', '토성면' 등 접미사 포함 패턴
4. 시군구 매칭: '종로구', '고성군', '수원시' 등 접미사 포함 패턴
5. 시도 일치하는 후보 우선 (false positive 방지)
"""

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 1) 사전 빌드
with open(ROOT / 'public' / 'korea-sgg.geo.json', encoding='utf-8') as f:
    sgg_geo = json.load(f)
with open(ROOT / 'public' / 'korea-dong.geo.json', encoding='utf-8') as f:
    dong_geo = json.load(f)

# sgg name → [(code, sido_code)]
sgg_lookup: dict[str, list[tuple[str, str]]] = defaultdict(list)
for ft in sgg_geo['features']:
    name = ft['properties']['name']
    code = ft['properties']['code']
    sgg_lookup[name].append((code, code[:2]))

# dong name → [(code, sgg_code, sido_code)]
dong_lookup: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
for ft in dong_geo['features']:
    name = ft['properties']['name']
    code = ft['properties']['code']
    dong_lookup[name].append((code, code[:5], code[:2]))

# 짧은 이름(2자) 동·면은 false positive 위험 → 접미사 보강된 패턴만 사용
print(f'📚 sgg names: {len(sgg_lookup):,}, dong names: {len(dong_lookup):,}')

# 패턴: 동/읍/면/가/동, 구/시/군/도 접미사로 끝나는 것만 매칭
# (텍스트 안에서 자연스럽게 등장하는 형태)
sgg_pattern = re.compile(r'([가-힣]{2,5}(?:구|시|군))')
dong_pattern = re.compile(r'([가-힣]{1,5}(?:동|읍|면|가))')

def detect_sgg(text: str, sido_hint: str | None) -> tuple[str | None, str | None]:
    """시군구 매칭. sido_hint 일치하는 후보만 반환 (false positive 방지)."""
    matches = sgg_pattern.findall(text)
    for m in matches:
        if m not in sgg_lookup:
            continue
        candidates = sgg_lookup[m]
        # 시도 hint 있으면 그것과 일치해야만
        if sido_hint:
            for code, sido in candidates:
                if sido == sido_hint:
                    return code, sido
            continue  # 일치 없음 → 이 매칭은 skip하고 다음
        # sido hint 없을 때만 모호한 후보 첫 번째 사용
        if len(candidates) == 1:
            return candidates[0]
    return None, None


def detect_dong(text: str, sgg_hint: str | None, sido_hint: str | None) -> tuple[str | None, str | None, str | None]:
    """동·읍·면 매칭. sgg_hint > sido_hint 우선. 둘 다 안 맞으면 skip."""
    matches = dong_pattern.findall(text)
    for m in matches:
        if len(m) < 2:
            continue
        if m not in dong_lookup:
            continue
        candidates = dong_lookup[m]
        # sgg 일치 최우선
        if sgg_hint:
            for code, sgg, sido in candidates:
                if sgg == sgg_hint:
                    return code, sgg, sido
        # sgg 없거나 일치 없으면 sido 일치
        if sido_hint:
            for code, sgg, sido in candidates:
                if sido == sido_hint:
                    return code, sgg, sido
            continue  # sido hint 있는데 일치 없음 → skip
        # hint 없을 때만 단일 후보 허용
        if len(candidates) == 1:
            return candidates[0]
    return None, None, None


# 1.5) 기관 본사 매핑 사전 (강한 신호)
inst_hq_path = ROOT / 'data' / 'inst-headquarters.json'
inst_hq: dict[str, dict] = {}
if inst_hq_path.exists():
    raw = json.load(open(inst_hq_path, encoding='utf-8'))
    inst_hq = {k: v for k, v in raw.items() if not k.startswith('_')}
    print(f'🏢 기관 본사 매핑: {len(inst_hq):,}개')


def detect_by_inst(org: str, sido_hint: str | None) -> tuple[str | None, str | None, str | None]:
    """기관명에서 본사 자치구 매핑 lookup. (sgg, dong, sido)"""
    if not org:
        return None, None, None
    # 정확 일치 우선
    if org in inst_hq:
        info = inst_hq[org]
        if not sido_hint or info.get('sido') == sido_hint:
            return info.get('sgg'), info.get('dong'), info.get('sido')
    # 부분 일치 (긴 키부터, false positive 방지)
    for key in sorted(inst_hq.keys(), key=len, reverse=True):
        if key in org:
            info = inst_hq[key]
            if not sido_hint or info.get('sido') == sido_hint:
                return info.get('sgg'), info.get('dong'), info.get('sido')
    return None, None, None


# 2) 공고 enrich
with open(ROOT / 'data' / 'openings.json', encoding='utf-8') as f:
    openings = json.load(f)

print(f'📂 loaded {len(openings):,} openings')

stat_sgg = 0
stat_dong = 0
stat_sgg_only = 0
sgg_count = Counter()
dong_count = Counter()

for o in openings:
    text = ' '.join([
        o.get('title') or '',
        o.get('org') or '',
        o.get('rawAplyQlfc') or '',
        o.get('rawScrnMethod') or '',
        o.get('rawPref') or '',
        o.get('rawPrefCond') or '',
    ])

    sido_hint = o.get('sido')

    # (1) 본문 정규식 매칭 (가장 정확 — 텍스트에 위치 명시되어 있을 때)
    sgg_code, sido_from_sgg = detect_sgg(text, sido_hint)
    dong_code, dong_sgg, dong_sido = detect_dong(text, sgg_code, sido_hint)

    # 동을 매칭했는데 시군구 없으면 → 동의 sgg 사용
    if dong_code and not sgg_code:
        sgg_code = dong_sgg

    # (2) 기관 본사 매핑 fallback — 본문 매칭 실패 시
    src = 'body-regex' if sgg_code else None
    if not sgg_code:
        hq_sgg, hq_dong, hq_sido = detect_by_inst(o.get('org', ''), sido_hint)
        if hq_sgg:
            sgg_code = hq_sgg
            if not dong_code and hq_dong:
                dong_code = hq_dong
            src = 'inst-hq'

    o['sgg'] = sgg_code
    o['dong'] = dong_code
    o['locSrc'] = src  # 'body-regex' / 'inst-hq' / null

    if sgg_code:
        stat_sgg += 1
        sgg_count[sgg_code] += 1
    if dong_code:
        stat_dong += 1
        dong_count[dong_code] += 1
    if sgg_code and not dong_code:
        stat_sgg_only += 1

# 3) raw 본문 필드 제거 (payload 절감 — 동·시군구 매칭 결과만 보존)
for o in openings:
    for k in ('rawAplyQlfc', 'rawScrnMethod', 'rawPref', 'rawPrefCond'):
        o.pop(k, None)

n = len(openings)
src_counter = Counter(o.get('locSrc') for o in openings)
print(f'\n✅ enrich 완료')
print(f'   시군구 매칭: {stat_sgg:,} ({stat_sgg*100/n:.1f}%)')
print(f'     - 본문 정규식: {src_counter.get("body-regex", 0):,}')
print(f'     - 기관 본사: {src_counter.get("inst-hq", 0):,}')
print(f'   동·읍·면 매칭: {stat_dong:,} ({stat_dong*100/n:.1f}%)')
print(f'   시군구만 (동 없음): {stat_sgg_only:,}')
print(f'\n   시군구 top 10: {sgg_count.most_common(10)}')
print(f'   동 top 10: {dong_count.most_common(10)}')

with open(ROOT / 'data' / 'openings.json', 'w', encoding='utf-8') as f:
    json.dump(openings, f, ensure_ascii=False)
print(f'\n💾 saved → data/openings.json')
