// 직무코드 ↔ 5개 축 옵션 deterministic mock 매핑
// 실제 채용공고 DB 연결 전까지 시각화·필터 동작 검증용
//
// 각 직무는 다음 분포로 매칭됨:
//  - employment: 1~3개 옵션 (정규직 우선)
//  - career: 1~2개 단계
//  - education: 1~2개 (학력 무관 우선)
//  - company: 2~4개 규모
//  - region: 2~5개 지역 (수도권 우선)
//
// 같은 직무코드 → 항상 동일 결과

import {
  CAREER_AXIS,
  COMPANY_AXIS,
  EDUCATION_AXIS,
  EMPLOYMENT_AXIS,
  REGION_AXIS,
  type AxisKey,
} from './axes';

function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

function pickN<T>(items: T[], n: number, code: string, salt: number): T[] {
  const arr = items.slice();
  const result: T[] = [];
  for (let i = 0; i < n && arr.length > 0; i++) {
    const idx = Math.floor(hash01(code, salt + i) * arr.length);
    result.push(arr.splice(idx, 1)[0]);
  }
  return result;
}

export interface JobAxisProfile {
  employment: string[];
  career: string[];
  education: string[];
  company: string[];
  region: string[];
}

const cache = new Map<string, JobAxisProfile>();

export function profileOf(jobCode: string): JobAxisProfile {
  const hit = cache.get(jobCode);
  if (hit) return hit;

  const eN = 1 + Math.floor(hash01(jobCode, 1) * 3); // 1-3
  const cN = 1 + Math.floor(hash01(jobCode, 2) * 2); // 1-2
  const dN = 1 + Math.floor(hash01(jobCode, 3) * 2); // 1-2
  const oN = 2 + Math.floor(hash01(jobCode, 4) * 3); // 2-4
  const rN = 2 + Math.floor(hash01(jobCode, 5) * 4); // 2-5

  // 정규직 가중치 — 60% 확률로 정규직 포함
  const empPool = EMPLOYMENT_AXIS.options.map((o) => o.code);
  const employment =
    hash01(jobCode, 11) < 0.6
      ? ['full', ...pickN(empPool.filter((x) => x !== 'full'), eN - 1, jobCode, 12)]
      : pickN(empPool, eN, jobCode, 13);

  const career = pickN(
    CAREER_AXIS.options.map((o) => o.code),
    cN,
    jobCode,
    21
  );

  // 학력 무관 35% 확률
  const eduPool = EDUCATION_AXIS.options.map((o) => o.code);
  const education =
    hash01(jobCode, 31) < 0.35
      ? ['any']
      : pickN(eduPool.filter((x) => x !== 'any'), dN, jobCode, 32);

  const company = pickN(
    COMPANY_AXIS.options.map((o) => o.code),
    oN,
    jobCode,
    41
  );

  // 수도권 가중치 — 70% 확률로 서울/경기 중 하나 포함
  const regPool = REGION_AXIS.options.map((o) => o.code);
  const seedRegions: string[] = [];
  if (hash01(jobCode, 51) < 0.7) {
    seedRegions.push(hash01(jobCode, 52) < 0.6 ? '11' : '31');
  }
  const remainingRN = Math.max(1, rN - seedRegions.length);
  const region = [
    ...seedRegions,
    ...pickN(
      regPool.filter((x) => !seedRegions.includes(x)),
      remainingRN,
      jobCode,
      53
    ),
  ];

  const profile: JobAxisProfile = {
    employment: dedupe(employment),
    career,
    education: dedupe(education),
    company,
    region: dedupe(region),
  };
  cache.set(jobCode, profile);
  return profile;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export interface FilterState {
  employment: string[];
  career: string[];
  education: string[];
  company: string[];
  region: string[];
}

export const EMPTY_FILTER: FilterState = {
  employment: [],
  career: [],
  education: [],
  company: [],
  region: [],
};

export function isEmptyFilter(f: FilterState): boolean {
  return (Object.keys(f) as Array<keyof FilterState>).every((k) => f[k].length === 0);
}

export function countActiveFilters(f: FilterState): number {
  return (Object.keys(f) as Array<keyof FilterState>).reduce(
    (a, k) => a + f[k].length,
    0
  );
}

// 직무가 필터를 통과하는지 — 각 축은 OR(선택 옵션 중 하나라도 매칭), 축 사이는 AND
export function matches(jobCode: string, f: FilterState): boolean {
  if (isEmptyFilter(f)) return true;
  const p = profileOf(jobCode);
  for (const k of Object.keys(f) as Array<keyof FilterState>) {
    const sel = f[k];
    if (sel.length === 0) continue;
    if (!sel.some((s) => p[k].includes(s))) return false;
  }
  return true;
}

export function activeAxisKeys(f: FilterState): AxisKey[] {
  return (['employment', 'career', 'education', 'company', 'region'] as AxisKey[]).filter(
    (k) => (f as Record<string, string[]>)[k]?.length > 0
  );
}
