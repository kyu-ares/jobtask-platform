// 플랫폼 전체 통일 stats — 모든 페이지가 같은 정의 사용
//
// 4단계 기준:
//   1. 참여 공공기관 (전체 / 진행중)
//   2. 누적 공고 (10년치)
//   3. 올해 등록 공고 (현 연도)
//   4. 진행중 공고 (오늘 지원 가능, 기본값)
//
// 기본 status는 항상 'active' (진행중) — 사용자에게 가장 의미 있는 것

import { loadOpenings, openingIsActive } from './load';

export interface PlatformStats {
  total: number;          // 누적 공고
  active: number;         // 진행중 공고
  thisYear: number;       // 올해 등록 공고
  year: number;           // 현 연도 (e.g. 2026)
  instTotal: number;      // 누적 기관 수
  instActive: number;     // 현재 채용중 기관 수
  instThisYear: number;   // 올해 채용 기관 수
}

let cached: PlatformStats | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function loadPlatformStats(): PlatformStats {
  if (CACHE && cached) return cached;
  const all = loadOpenings();
  const year = new Date().getFullYear();
  const yearStr = String(year);

  let active = 0;
  let thisYear = 0;
  const instAll = new Set<string>();
  const instActive = new Set<string>();
  const instThisYear = new Set<string>();

  for (const o of all) {
    if (o.org) instAll.add(o.org);
    const isActive = openingIsActive(o);
    if (isActive) {
      active++;
      if (o.org) instActive.add(o.org);
    }
    if ((o.startAt ?? '').startsWith(yearStr)) {
      thisYear++;
      if (o.org) instThisYear.add(o.org);
    }
  }

  const stats: PlatformStats = {
    total: all.length,
    active,
    thisYear,
    year,
    instTotal: instAll.size,
    instActive: instActive.size,
    instThisYear: instThisYear.size,
  };
  if (CACHE) cached = stats;
  return stats;
}
