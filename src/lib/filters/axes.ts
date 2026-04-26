// NCS 대분류와 동일 위계의 6개 분류 축 (1depth 필터)
//
// 동일 위계 조건:
//  1) 상호배타성 — 항목끼리 겹치지 않음
//  2) 포괄성 — 전체 경우를 다 커버
//  3) 독립 분류체계 — 그 자체로 완결된 분류 구조
//
// 6개 축: NCS 직무 / 고용형태 / 경력 / 학력 / 기업규모 / 지역

export type AxisKey = 'ncs' | 'employment' | 'career' | 'education' | 'company' | 'region';

export interface AxisOption {
  code: string;
  label: string;
  hint?: string;
}

export interface AxisDef {
  key: AxisKey;
  label: string;
  short: string;
  description: string;
  options: AxisOption[];
}

// NCS 직무 — 24 대분류는 별도 트리에서 관리하므로 여기선 placeholder
export const NCS_AXIS: AxisDef = {
  key: 'ncs',
  label: 'NCS 직무',
  short: '직무',
  description: '국가직무능력표준 24 대분류 → 1,083 세분류',
  options: [], // tree에서 동적 채움
};

export const EMPLOYMENT_AXIS: AxisDef = {
  key: 'employment',
  label: '고용형태',
  short: '고용',
  description: '근로기준법 기반 분류',
  options: [
    { code: 'full', label: '정규직' },
    { code: 'contract', label: '계약직', hint: '기간제' },
    { code: 'intern', label: '인턴' },
    { code: 'part', label: '파트타임' },
    { code: 'freelance', label: '프리랜서' },
    { code: 'dispatch', label: '파견·도급' },
  ],
};

export const CAREER_AXIS: AxisDef = {
  key: 'career',
  label: '경력 단계',
  short: '경력',
  description: 'NCS 능력수준 8단계와 동일 위계',
  options: [
    { code: 'entry', label: '신입', hint: 'lv 1–2' },
    { code: 'junior', label: '경력 1–3년', hint: 'lv 3–4' },
    { code: 'mid', label: '경력 3–7년', hint: 'lv 5' },
    { code: 'senior', label: '시니어', hint: 'lv 6–7 · 8–14년' },
    { code: 'exec', label: '임원급', hint: 'lv 8 · 15년+' },
  ],
};

export const EDUCATION_AXIS: AxisDef = {
  key: 'education',
  label: '학력',
  short: '학력',
  description: '학력 무관 옵션 포함 완결 분류',
  options: [
    { code: 'any', label: '학력 무관' },
    { code: 'high', label: '고졸 이하' },
    { code: 'col2', label: '전문대 졸' },
    { code: 'bs', label: '학사' },
    { code: 'ms', label: '석사' },
    { code: 'phd', label: '박사' },
  ],
};

export const COMPANY_AXIS: AxisDef = {
  key: 'company',
  label: '기업 규모·형태',
  short: '기업',
  description: '공정위·중기부 기준',
  options: [
    { code: 'large', label: '대기업', hint: '1,001+' },
    { code: 'midcap', label: '중견기업', hint: '301–1,000' },
    { code: 'sme', label: '중소기업', hint: '51–300' },
    { code: 'startup', label: '스타트업', hint: '1–50명' },
    { code: 'foreign', label: '외국계' },
    { code: 'public', label: '공기업' },
  ],
};

export const REGION_AXIS: AxisDef = {
  key: 'region',
  label: '지역·근무지',
  short: '지역',
  description: '행정구역 17 광역시·도 + 재택',
  options: [
    { code: 'remote', label: '재택·원격' },
    { code: 'overseas', label: '해외' },
    { code: '11', label: '서울' },
    { code: '21', label: '부산' },
    { code: '22', label: '대구' },
    { code: '23', label: '인천' },
    { code: '24', label: '광주' },
    { code: '25', label: '대전' },
    { code: '26', label: '울산' },
    { code: '29', label: '세종' },
    { code: '31', label: '경기' },
    { code: '32', label: '강원' },
    { code: '33', label: '충북' },
    { code: '34', label: '충남' },
    { code: '35', label: '전북' },
    { code: '36', label: '전남' },
    { code: '37', label: '경북' },
    { code: '38', label: '경남' },
    { code: '39', label: '제주' },
  ],
};

export const FILTER_AXES: AxisDef[] = [
  EMPLOYMENT_AXIS,
  CAREER_AXIS,
  EDUCATION_AXIS,
  COMPANY_AXIS,
  REGION_AXIS,
];

export const AXIS_BY_KEY: Record<AxisKey, AxisDef> = {
  ncs: NCS_AXIS,
  employment: EMPLOYMENT_AXIS,
  career: CAREER_AXIS,
  education: EDUCATION_AXIS,
  company: COMPANY_AXIS,
  region: REGION_AXIS,
};
