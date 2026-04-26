// 트리맵 셀에 입힐 metric 정의 — 면적 = sizeMetric, 색 = colorMetric
// 데이터가 아직 없을 땐 deterministic mock으로 미리 시각 효과를 검증한다.

import type { NcsMclas, NcsTree } from './types';

export type SizeMetric = 'jobCount' | 'openings' | 'avgSalary';
export type ColorMetric = 'demand' | 'growth' | 'salary' | 'difficulty';
export type Grouping = 'lclas' | 'mclas' | 'sclas';

export const SIZE_METRICS: Record<SizeMetric, { label: string; suffix?: string }> = {
  jobCount: { label: '직무 수', suffix: '개' },
  openings: { label: '채용공고', suffix: '건' },
  avgSalary: { label: '평균 연봉', suffix: '만원' },
};

export const COLOR_METRICS: Record<ColorMetric, { label: string; unit: string }> = {
  demand: { label: '수요지수', unit: '%' },
  growth: { label: '성장률', unit: '%' },
  salary: { label: '연봉지수', unit: '' },
  difficulty: { label: '난이도', unit: 'lv' },
};

function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

export function sizeOf(
  node: { code: string; mclas?: NcsMclas[]; subdCount?: number; unitCount?: number },
  metric: SizeMetric
): number {
  const childCount =
    'mclas' in node && node.mclas
      ? node.mclas.reduce(
          (a, m) => a + m.sclas.reduce((b, s) => b + s.subd.length, 0),
          0
        ) || node.mclas.length
      : node.subdCount ?? node.unitCount ?? 1;
  const base = Math.max(childCount, 1);
  switch (metric) {
    case 'jobCount':
      return base;
    case 'openings':
      return base * (10 + hash01(node.code, 1) * 90);
    case 'avgSalary':
      return base * (3500 + hash01(node.code, 2) * 4000);
  }
}

// returns [-1, 1]
export function colorOf(code: string, metric: ColorMetric): number {
  const r = hash01(code, metric.charCodeAt(0));
  switch (metric) {
    case 'demand':
      return r * 2 - 1;
    case 'growth':
      return (r - 0.45) * 2;
    case 'salary':
      return r * 2 - 1;
    case 'difficulty':
      return r * 2 - 1;
  }
}

// Blaybus 톤: 음수=error red 톤, 0=neutral light, 양수=primary blue 톤
// 단일 컬러 투명도 + 양극 시맨틱(error→neutral→primary)
export function heatColor(v: number, opacity = 1): string {
  const x = Math.max(-1, Math.min(1, v));
  if (x === 0) return `rgba(243,244,246,${opacity})`; // neutral-100
  if (x > 0) {
    // primary blue 농도: 0.2 → primary-light, 1.0 → primary
    const t = x;
    // #EBF3FF (235,243,255) → #006CD1 (0,108,209)
    const r = Math.round(235 + (0 - 235) * t);
    const g = Math.round(243 + (108 - 243) * t);
    const b = Math.round(255 + (209 - 255) * t);
    return `rgba(${r},${g},${b},${opacity})`;
  } else {
    const t = -x;
    // #FEF2F2 (254,242,242) → #DC2626 (220,38,38)
    const r = Math.round(254 + (220 - 254) * t);
    const g = Math.round(242 + (38 - 242) * t);
    const b = Math.round(242 + (38 - 242) * t);
    return `rgba(${r},${g},${b},${opacity})`;
  }
}

// 셀 위 텍스트 색을 배경 명도에 맞춰 결정
export function textOnHeat(v: number): string {
  const x = Math.abs(v);
  return x > 0.45 ? '#ffffff' : '#1A1A1A';
}

export interface CellGroup {
  group: { code: string; name: string };
  cells: { code: string; name: string; parentCode: string }[];
}

export function buildGroups(tree: NcsTree, grouping: Grouping): CellGroup[] {
  if (grouping === 'lclas') {
    return tree.lclas.map((l) => ({
      group: { code: l.code, name: l.name },
      cells:
        l.mclas.length > 0
          ? l.mclas.map((m) => ({ code: m.code, name: m.name, parentCode: l.code }))
          : [{ code: l.code, name: l.name, parentCode: l.code }],
    }));
  }
  if (grouping === 'mclas') {
    const out: CellGroup[] = [];
    for (const l of tree.lclas) {
      for (const m of l.mclas) {
        out.push({
          group: { code: m.code, name: `${l.name} · ${m.name}` },
          cells: m.sclas.map((s) => ({ code: s.code, name: s.name, parentCode: m.code })),
        });
      }
    }
    return out;
  }
  const out: CellGroup[] = [];
  for (const l of tree.lclas) {
    for (const m of l.mclas) {
      for (const s of m.sclas) {
        out.push({
          group: { code: s.code, name: `${m.name} · ${s.name}` },
          cells: s.subd.map((d) => ({ code: d.code, name: d.name, parentCode: s.code })),
        });
      }
    }
  }
  return out;
}
