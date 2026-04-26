"""
인사혁신처 공공채용정보 CSV (26,360건) → 정규화 JSON

입력:  data/source/openings-source.csv (5.9MB UTF-8 BOM)
출력:  data/openings.json (정규화 채용공고 배열)
       data/openings-summary.json (집계: 기관구분/채용정보구분/시도별 카운트)

지역·NCS 매핑은 휴리스틱:
- 지역: 선발기관명에서 17 시도 키워드 매칭 → 시도 코드
- NCS: 제목+직급에서 24 대분류 키워드 매칭 → 대분류 코드 후보 리스트
"""

import csv
import json
import os
import re
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get('OPENINGS_CSV', ROOT / 'data' / 'source' / 'openings-source.csv'))
OUT = ROOT / 'data' / 'openings.json'
OUT_SUMMARY = ROOT / 'data' / 'openings-summary.json'

if not SRC.exists():
    raise SystemExit(f'❌ 입력 없음: {SRC}')

# 시도 키워드 (선발기관명에서 매칭) — 우선순위 순
SIDO_KEYWORDS = [
    ('11', ['서울', '강남', '강북', '강동', '강서', '관악', '광진', '구로', '금천', '노원',
            '도봉', '동대문', '동작', '마포', '서대문', '서초', '성동', '성북', '송파',
            '양천', '영등포', '용산', '은평', '종로', '중랑', '동작구', '서울특별시']),
    ('21', ['부산', '해운대', '사상구', '연제구', '수영구']),
    ('22', ['대구', '수성구', '달서구', '중구']),
    ('23', ['인천', '연수구', '남동구', '계양구']),
    ('24', ['광주', '북구', '서구']),
    ('25', ['대전', '유성구']),
    ('26', ['울산']),
    ('29', ['세종']),
    ('31', ['경기', '수원', '성남', '용인', '고양', '부천', '안산', '안양', '의정부',
            '평택', '시흥', '파주', '김포', '광명', '군포', '하남', '오산', '이천',
            '안성', '구리', '남양주', '의왕', '양주', '동두천', '과천', '여주', '포천',
            '연천', '가평', '양평', '화성']),
    ('32', ['강원', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천',
            '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양']),
    ('33', ['충북', '청주', '충주', '제천', '보은', '옥천', '영동', '증평', '진천',
            '괴산', '음성', '단양']),
    ('34', ['충남', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진',
            '금산', '부여', '서천', '청양', '홍성', '예산', '태안']),
    ('35', ['전북', '전주', '군산', '익산', '정읍', '남원', '김제', '완주', '진안',
            '무주', '장수', '임실', '순창', '고창', '부안']),
    ('36', ['전남', '목포', '여수', '순천', '나주', '광양', '담양', '곡성', '구례',
            '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평',
            '영광', '장성', '완도', '진도', '신안']),
    ('37', ['경북', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주',
            '문경', '경산', '군위', '의성', '청송', '영양', '영덕', '청도', '고령',
            '성주', '칠곡', '예천', '봉화', '울진', '울릉']),
    ('38', ['경남', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산',
            '의령', '함안', '창녕', '남해', '하동', '산청', '함양', '거창', '합천']),
    ('39', ['제주', '서귀포']),
]

# NCS 24 대분류 키워드
NCS_KEYWORDS = [
    ('01', '사업관리', ['사업관리', '프로젝트', 'PM', '연구사업']),
    ('02', '경영·회계·사무', ['행정', '사무', '경영', '회계', '재무', '인사', '총무', '서무',
                              '기획', '관리', '비서', '운영', '감사', '재정', '예산']),
    ('03', '금융·보험', ['금융', '보험', '투자', '대출', '신용']),
    ('04', '교육·자연·사회과학', ['교사', '교수', '교원', '연구원', '교육', '강사', '학예사', '교직']),
    ('05', '법률·경찰·소방·교도·국방', ['법무', '변호', '판사', '검사', '법원', '경찰', '소방',
                                         '교도', '국방', '군무원', '수사']),
    ('06', '보건·의료', ['의무', '의사', '간호', '의료', '약사', '병원', '보건', '치과', '의무직']),
    ('07', '사회복지·종교', ['사회복지', '복지', '상담']),
    ('08', '문화·예술·디자인·방송', ['문화', '예술', '디자인', '방송', '미디어', '학예', '큐레이터']),
    ('09', '운전·운송', ['운전', '운송', '교통', '운수', '항공', '철도']),
    ('10', '영업판매', ['영업', '판매', '마케팅']),
    ('11', '경비·청소', ['경비', '청소', '시설관리']),
    ('12', '이용·숙박·여행·오락·스포츠', ['관광', '숙박', '체육', '스포츠', '레저']),
    ('13', '음식서비스', ['조리', '음식', '식음료']),
    ('14', '건설', ['건설', '토목', '건축', '시공', '설계', '안전관리']),
    ('15', '기계', ['기계', '설비', '제조', '생산']),
    ('16', '재료', ['재료', '소재', '금속', '화학물질']),
    ('17', '화학·바이오', ['화학', '바이오', '제약', '생명', '환경분석']),
    ('18', '섬유·의복', ['섬유', '의복', '봉제']),
    ('19', '전기·전자', ['전기', '전자', '통신설비']),
    ('20', '정보통신', ['전산', 'IT', '정보통신', '소프트웨어', 'SW', '시스템', '네트워크',
                       '데이터', '개발', '프로그래밍', '빅데이터', 'AI', '인공지능', '보안']),
    ('21', '식품가공', ['식품']),
    ('22', '인쇄·목재·가구·공예', ['인쇄', '목재', '공예']),
    ('23', '환경·에너지·안전', ['환경', '에너지', '원자력', '안전', '재난', '기상']),
    ('24', '농림어업', ['농업', '임업', '어업', '수산', '농촌', '산림']),
]


def detect_sido(text: str) -> str | None:
    for code, kws in SIDO_KEYWORDS:
        for kw in kws:
            if kw in text:
                return code
    return None


def detect_ncs(*texts: str) -> list[str]:
    blob = ' '.join(texts)
    hits = []
    for code, _name, kws in NCS_KEYWORDS:
        for kw in kws:
            if kw in blob:
                hits.append(code)
                break
    return hits


def parse_date(s: str) -> str | None:
    s = (s or '').strip()
    if not s:
        return None
    m = re.match(r'(\d{4})-(\d{1,2})-(\d{1,2})', s)
    if not m:
        return None
    return f'{m[1]}-{int(m[2]):02d}-{int(m[3]):02d}'


def days_until(d: str | None) -> int | None:
    if not d:
        return None
    try:
        y, m, d2 = (int(x) for x in d.split('-'))
        return (date(y, m, d2) - date.today()).days
    except Exception:
        return None


print(f'📂 source: {SRC} ({SRC.stat().st_size / 1024 / 1024:.1f} MB)')

openings = []
sido_counter = Counter()
ncs_counter = Counter()
inst_kind_counter = Counter()
job_kind_counter = Counter()
no_sido = 0
no_ncs = 0

with SRC.open(encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        title = row.get('제목', '').strip()
        org = row.get('선발기관명', '').strip()
        kind_inst = row.get('기관구분', '').strip()
        kind_job = row.get('채용정보구분', '').strip()
        rank = row.get('선발예정직급', '').strip()
        n_pick = row.get('선발예정인원', '').strip()

        sido = detect_sido(org) or detect_sido(title)
        ncs = detect_ncs(title, rank, kind_job)
        if not sido:
            no_sido += 1
        if not ncs:
            no_ncs += 1

        try:
            n_pick_int = int(n_pick) if n_pick.isdigit() else None
        except Exception:
            n_pick_int = None
        try:
            views = int(row.get('조회수', '0') or '0')
        except Exception:
            views = 0

        rec = {
            'id': row.get('일련번호', '').strip(),
            'org': org,
            'instKind': kind_inst,
            'jobKind': kind_job,
            'title': title,
            'rank': rank,
            'pick': n_pick_int,
            'views': views,
            'startAt': parse_date(row.get('접수시작일', '')),
            'endAt': parse_date(row.get('접수마감일', '')),
            'disabledHire': row.get('장애인채용여부', '') == 'Y',
            'disabledPref': row.get('장애인우대여부', '') == 'Y',
            'sido': sido,    # 17 시도 코드 또는 None
            'ncs': ncs,      # 매칭된 NCS 대분류 코드 리스트
        }
        openings.append(rec)

        if sido:
            sido_counter[sido] += 1
        for c in ncs:
            ncs_counter[c] += 1
        if kind_inst:
            inst_kind_counter[kind_inst] += 1
        if kind_job:
            job_kind_counter[kind_job] += 1

# 마감일 정렬 — 마감 임박 우선 (오늘 기준 deadline 양수 우선)
def sort_key(r):
    d = days_until(r['endAt'])
    if d is None:
        return (3, 999999)
    if d < 0:
        return (2, -d)  # 마감된 것은 뒤로 (최근 마감 우선)
    return (1, d)       # 진행 중 — 임박순

openings.sort(key=sort_key)

n_total = len(openings)
n_active = sum(1 for r in openings if (days_until(r['endAt']) or -1) >= 0)
print(f'\n✅ total: {n_total:,}, active(미마감): {n_active:,}')
print(f'   sido 매칭 실패: {no_sido:,} ({no_sido*100/n_total:.0f}%)')
print(f'   ncs 매칭 실패: {no_ncs:,} ({no_ncs*100/n_total:.0f}%)')
print(f'\n   기관구분 top: {inst_kind_counter.most_common(8)}')
print(f'   채용정보구분 top: {job_kind_counter.most_common(8)}')
print(f'   시도 top: {sido_counter.most_common(10)}')
print(f'   NCS 대분류 top: {ncs_counter.most_common(10)}')

OUT.write_text(json.dumps(openings, ensure_ascii=False), encoding='utf-8')
print(f'\n💾 saved → {OUT} ({OUT.stat().st_size / 1024 / 1024:.1f} MB)')

summary = {
    'total': n_total,
    'active': n_active,
    'noSido': no_sido,
    'noNcs': no_ncs,
    'instKind': dict(inst_kind_counter),
    'jobKind': dict(job_kind_counter),
    'sido': dict(sido_counter),
    'ncs': dict(ncs_counter),
}
OUT_SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'💾 saved → {OUT_SUMMARY}')
