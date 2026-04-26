// NCS 4계층 분류체계 타입
// 코드 자릿수: 대분류 2 / 중분류 4 / 소분류 6 / 세분류(직무) 8

export interface NcsUnit {
  code: string;        // 능력단위코드 (예: "0101010101_17v2")
  name: string;        // 능력단위명
  level: string;       // 능력단위수준 1~8
}

export interface NcsSubd {
  code: string;        // 8자리 세분류 코드
  name: string;
  unitCount: number;
  units?: NcsUnit[];   // 상세 페이지 진입시에만 필요
}

export interface NcsSclas {
  code: string;        // 6자리
  name: string;
  subd: NcsSubd[];
}

export interface NcsMclas {
  code: string;        // 4자리
  name: string;
  sclas: NcsSclas[];
}

export interface NcsLclas {
  code: string;        // 2자리
  name: string;
  mclas: NcsMclas[];
}

export interface NcsTree {
  summary: {
    lclas: number;
    mclas: number;
    sclas: number;
    subd: number;
    units: number;
  };
  lclas: NcsLclas[];
}

// 트리맵 입력용 평탄화 노드
export interface NcsFlatNode {
  code: string;
  name: string;
  level: 'lclas' | 'mclas' | 'sclas' | 'subd';
  parentCode: string | null;
  size: number; // 면적 가중치 (자식 수 또는 직무 수)
}
