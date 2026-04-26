// Track 3단 분류 타입 (리멤버 커리어 스타일)
// 대분류(2자리) → 중분류(4자리) → 세부직무(6자리)

export interface TrackSubd {
  code: string; // 6자리
  name: string;
}

export interface TrackMclas {
  code: string; // 4자리
  name: string;
  subd: TrackSubd[];
}

export interface TrackLclas {
  code: string; // 2자리
  name: string;
  mclas: TrackMclas[];
}

export interface TrackTree {
  summary: { lclas: number; mclas: number; subd: number };
  lclas: TrackLclas[];
}
