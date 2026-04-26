// KECO 2025 (한국고용직업분류 8차 개정) 트리 로더
// 구조: 대 10 / 중 35 / 소 140 / 세 495
// 코드 자릿수: 대 1 / 중 2 / 소 3 / 세 4
// 출처: 고용노동부 고시 제2024-63호 항목표 (2024-12-12 고시, 2025 시행)

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { NcsTree, NcsLclas, NcsMclas, NcsSclas } from '@/lib/ncs/types';

const ROOT = process.cwd();
const FULL_PATH = path.join(ROOT, 'data', 'keco-tree.json');

let cached: NcsTree | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function loadKecoTree(): NcsTree {
  if (CACHE && cached) return cached;
  if (!existsSync(FULL_PATH)) {
    throw new Error(
      `KECO 트리 없음: ${FULL_PATH}\n  → python scripts/build-keco-tree-from-xlsx.py 실행하세요.`
    );
  }
  const tree = JSON.parse(readFileSync(FULL_PATH, 'utf8')) as NcsTree;
  if (CACHE) cached = tree;
  return tree;
}

export function findKecoLclas(code: string): NcsLclas | undefined {
  return loadKecoTree().lclas.find((l) => l.code === code);
}

export function findKecoMclas(lclas: string, mclas: string): NcsMclas | undefined {
  return findKecoLclas(lclas)?.mclas.find((m) => m.code === mclas);
}

export function findKecoSclas(
  lclas: string,
  mclas: string,
  sclas: string
): NcsSclas | undefined {
  return findKecoMclas(lclas, mclas)?.sclas.find((s) => s.code === sclas);
}

// NCS↔KECO 매핑 로더 (양방향 인덱스)
const MAP_PATH = path.join(ROOT, 'data', 'ncs-keco-map.json');
let mapCached: NcsKecoMap | null = null;

export interface NcsKecoMap {
  description: string;
  summary: { totalRows: number; uniqueNcs: number; uniqueKeco: number; avgKecoPerNcs: number; avgNcsPerKeco: number };
  ncsNames: Record<string, string>;
  kecoNames: Record<string, string>;
  ncsToKeco: Record<string, { code: string; name: string }[]>;
  kecoToNcs: Record<string, { code: string; name: string }[]>;
}

export function loadNcsKecoMap(): NcsKecoMap {
  if (CACHE && mapCached) return mapCached;
  if (!existsSync(MAP_PATH)) {
    throw new Error(`NCS↔KECO 매핑 없음: ${MAP_PATH}`);
  }
  const m = JSON.parse(readFileSync(MAP_PATH, 'utf8')) as NcsKecoMap;
  if (CACHE) mapCached = m;
  return m;
}
