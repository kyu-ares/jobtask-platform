// 정규화된 공공채용 공고 타입
// 소스: 인사혁신처 공공채용정보 CSV (data/openings.json)
// 추후 OpenAPI 들어오면 동일 타입으로 어댑터만 교체

export interface Opening {
  id: string;
  org: string;            // 선발기관명
  instKind: string;       // 기관구분 (국가기관/교육청/지자체/공공기관)
  jobKind: string;        // 채용정보구분 (신입+경력 / 공무원 채용 등)
  title: string;
  rank: string;           // 선발예정직급
  pick: number | null;    // 선발예정인원
  views: number;
  startAt: string | null; // YYYY-MM-DD
  endAt: string | null;
  disabledHire: boolean;
  disabledPref: boolean;
  sido: string | null;    // 17 시도 코드 (휴리스틱) 또는 null
  ncs: string[];          // 매칭된 NCS 대분류 코드

  // === apiV1 (기재부 OpenAPI v1) 추가 필드 ===
  src?: 'apiV1' | 'csv';
  srcUrl?: string | null;            // 원본 채용공고 URL
  sidos?: string[];                  // 다중 근무지역
  employment?: string | null;        // 6축 employment code (full/contract/intern...)
  career?: string[];                 // 6축 career codes
  education?: string | null;         // 6축 education code
  ongoing?: boolean;                 // API의 진행중 여부 (Y/N)
  daysLeft?: number | null;          // API가 제공하는 D-day
  rawNcsNames?: string;              // 원본 NCS 이름 (콤마 구분)
  rawRegionNames?: string;           // 원본 지역명
  rawHireType?: string;
  rawAcbg?: string;
  // === 본문 정규식 매칭으로 추출된 정확한 위치 ===
  sgg?: string | null;               // 5자리 시군구 코드 (매칭된 경우만)
  dong?: string | null;              // 7자리 동·읍·면 코드 (매칭된 경우만)
}

export interface OpeningsSummary {
  total: number;
  active: number;
  noSido: number;
  noNcs: number;
  instKind: Record<string, number>;
  jobKind: Record<string, number>;
  sido: Record<string, number>;
  ncs: Record<string, number>;
}
