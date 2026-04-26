// Server-side opening loader — 10MB JSON을 모듈-level 메모리에 1회 로드 후 캐시.
// dev 에선 매 요청마다 fresh, prod 에선 싱글톤.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Opening, OpeningsSummary } from './types';

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'data', 'openings.json');
const SUMMARY = path.join(ROOT, 'data', 'openings-summary.json');

let cached: Opening[] | null = null;
let cachedSummary: OpeningsSummary | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function hasOpenings(): boolean {
  return existsSync(FILE);
}

export function loadOpenings(): Opening[] {
  if (CACHE && cached) return cached;
  if (!existsSync(FILE)) return [];
  const raw = readFileSync(FILE, 'utf8');
  const list = JSON.parse(raw) as Opening[];
  if (CACHE) cached = list;
  return list;
}

export function loadOpeningsSummary(): OpeningsSummary | null {
  if (CACHE && cachedSummary) return cachedSummary;
  if (!existsSync(SUMMARY)) return null;
  const raw = readFileSync(SUMMARY, 'utf8');
  const s = JSON.parse(raw) as OpeningsSummary;
  if (CACHE) cachedSummary = s;
  return s;
}

export interface OpeningQuery {
  q?: string;          // 키워드 (제목·기관 부분 일치)
  sido?: string[];     // 17 시도 코드
  instKind?: string[]; // 기관구분
  jobKind?: string[];  // 채용정보구분
  ncs?: string[];      // NCS 대분류 코드
  status?: 'active' | 'closed' | 'all';
  sort?: 'deadline' | 'recent' | 'views';
  page?: number;
  pageSize?: number;
}

function daysLeft(end: string | null): number | null {
  if (!end) return null;
  const [y, m, d] = end.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((target - today) / 86400000);
}

export function openingDaysLeft(o: { endAt: string | null; daysLeft?: number | null }) {
  if (typeof o.daysLeft === 'number') return o.daysLeft;
  return daysLeft(o.endAt);
}

export function openingIsActive(o: { ongoing?: boolean; endAt: string | null; daysLeft?: number | null }) {
  if (typeof o.ongoing === 'boolean') return o.ongoing;
  const d = openingDaysLeft(o);
  return d !== null && d >= 0;
}

export function queryOpenings(q: OpeningQuery): {
  total: number;
  page: number;
  pageSize: number;
  items: Opening[];
} {
  const all = loadOpenings();
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, q.pageSize ?? 24));

  const status = q.status ?? 'all';
  const ks = (q.q ?? '').trim().toLowerCase();

  const filtered = all.filter((o) => {
    if (q.sido?.length && (!o.sido || !q.sido.includes(o.sido))) return false;
    if (q.instKind?.length && !q.instKind.includes(o.instKind)) return false;
    if (q.jobKind?.length && !q.jobKind.includes(o.jobKind)) return false;
    if (q.ncs?.length && !q.ncs.some((c) => o.ncs.includes(c))) return false;
    if (status !== 'all') {
      const isActive = openingIsActive(o);
      if (status === 'active' && !isActive) return false;
      if (status === 'closed' && isActive) return false;
    }
    if (ks) {
      const blob = (o.title + ' ' + o.org + ' ' + o.rank).toLowerCase();
      if (!blob.includes(ks)) return false;
    }
    return true;
  });

  const sorted =
    q.sort === 'recent'
      ? filtered.slice().sort((a, b) => (b.startAt ?? '').localeCompare(a.startAt ?? ''))
      : q.sort === 'views'
      ? filtered.slice().sort((a, b) => b.views - a.views)
      : filtered; // 기본: build 시점에 마감 임박 순으로 정렬됨

  const start = (page - 1) * pageSize;
  return {
    total: filtered.length,
    page,
    pageSize,
    items: sorted.slice(start, start + pageSize),
  };
}

export function openingsByNcsLclas(code: string, limit = 8): Opening[] {
  return loadOpenings().filter((o) => o.ncs.includes(code)).slice(0, limit);
}

export function openingsBySido(sido: string): Opening[] {
  return loadOpenings().filter((o) => o.sido === sido);
}

export { daysLeft };
