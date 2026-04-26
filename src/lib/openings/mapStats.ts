// 지도용 사전 집계 (server-side)
// 시도/시군구/동 단위 모두 실 매칭 카운트 + sample
// 매칭 안 된 공고는 시·도 단위만 집계

import { loadOpenings, openingIsActive } from './load';
import type { Opening } from './types';

export interface RegionStats {
  total: number;
  active: number;
  ncs: Record<string, number>;
}

export interface MapData {
  bySido: Record<string, RegionStats>;
  bySgg: Record<string, RegionStats>;
  byDong: Record<string, RegionStats>;
  sampleBySido: Record<string, Opening[]>;
  sampleBySgg: Record<string, Opening[]>;
  sampleByDong: Record<string, Opening[]>;
  totals: { all: number; active: number; sggMatched: number; dongMatched: number };
  fetchedAt: string | null;
}

const SAMPLE_SIZE = 100;

let cached: MapData | null = null;
const CACHE = process.env.NODE_ENV === 'production';

function ensure(rec: Record<string, RegionStats>, code: string): RegionStats {
  let s = rec[code];
  if (!s) {
    s = { total: 0, active: 0, ncs: {} };
    rec[code] = s;
  }
  return s;
}

function pushSample(rec: Record<string, Opening[]>, code: string, o: Opening) {
  const arr = rec[code] ?? [];
  if (arr.length < SAMPLE_SIZE) {
    arr.push(o);
    rec[code] = arr;
  }
}

export function loadMapData(): MapData {
  if (CACHE && cached) return cached;

  const all = loadOpenings();
  const bySido: Record<string, RegionStats> = {};
  const bySgg: Record<string, RegionStats> = {};
  const byDong: Record<string, RegionStats> = {};
  const sampleBySido: Record<string, Opening[]> = {};
  const sampleBySgg: Record<string, Opening[]> = {};
  const sampleByDong: Record<string, Opening[]> = {};

  let activeCount = 0;
  let sggMatched = 0;
  let dongMatched = 0;

  // 진행중 + 마감 임박 우선 정렬 (sample 우선순위 결정)
  const sorted = all.slice().sort((a, b) => {
    const aA = openingIsActive(a) ? 0 : 1;
    const bA = openingIsActive(b) ? 0 : 1;
    if (aA !== bA) return aA - bA;
    return (a.daysLeft ?? 999999) - (b.daysLeft ?? 999999);
  });

  for (const o of sorted) {
    const isActive = openingIsActive(o);
    if (isActive) activeCount++;

    const sidos = o.sidos && o.sidos.length > 0 ? o.sidos : o.sido ? [o.sido] : [];

    // SIDO 단위 집계 (모든 공고)
    for (const sc of sidos) {
      const stats = ensure(bySido, sc);
      stats.total += 1;
      if (isActive) {
        stats.active += 1;
        for (const c of o.ncs) stats.ncs[c] = (stats.ncs[c] ?? 0) + 1;
        pushSample(sampleBySido, sc, o);
      }
    }

    // SGG 단위 집계 (본문 매칭된 것만)
    if (o.sgg) {
      sggMatched++;
      const stats = ensure(bySgg, o.sgg);
      stats.total += 1;
      if (isActive) {
        stats.active += 1;
        for (const c of o.ncs) stats.ncs[c] = (stats.ncs[c] ?? 0) + 1;
        pushSample(sampleBySgg, o.sgg, o);
      }
    }

    // DONG 단위 집계 (본문 매칭된 것만)
    if (o.dong) {
      dongMatched++;
      const stats = ensure(byDong, o.dong);
      stats.total += 1;
      if (isActive) {
        stats.active += 1;
        for (const c of o.ncs) stats.ncs[c] = (stats.ncs[c] ?? 0) + 1;
        pushSample(sampleByDong, o.dong, o);
      }
    }
  }

  const data: MapData = {
    bySido,
    bySgg,
    byDong,
    sampleBySido,
    sampleBySgg,
    sampleByDong,
    totals: { all: all.length, active: activeCount, sggMatched, dongMatched },
    fetchedAt: null,
  };
  if (CACHE) cached = data;
  return data;
}

// 호환 유지
export type SidoStats = RegionStats;
