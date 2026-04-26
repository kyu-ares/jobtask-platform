// Track 트리 로더
// 원본 3단 구조(lclas/mclas/subd)와 NCS 4단 호환 포맷(subd=sclas로 승격, NCS subd는 빈 배열) 두 형태 제공.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { TrackTree } from './types';
import type { NcsTree } from '@/lib/ncs/types';

const ROOT = process.cwd();
const FULL_PATH = path.join(ROOT, 'data', 'track-tree.json');

let cachedRaw: TrackTree | null = null;
let cachedNcs: NcsTree | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function loadTrackTree(): TrackTree {
  if (CACHE && cachedRaw) return cachedRaw;
  if (!existsSync(FULL_PATH)) {
    throw new Error(`Track 트리 파일이 없습니다: ${FULL_PATH}`);
  }
  const raw = readFileSync(FULL_PATH, 'utf8');
  const tree = JSON.parse(raw) as TrackTree;
  if (CACHE) cachedRaw = tree;
  return tree;
}

/**
 * Heatmap 컴포넌트가 요구하는 NcsTree 포맷(4단)으로 변환:
 *   track.lclas → ncs.lclas
 *   track.mclas → ncs.mclas
 *   track.subd  → ncs.sclas (소분류로 승격)
 *   ncs.subd    → [] (빈 4단째)
 * 드릴다운: level 0(대→중), level 1(중→세부). level 2 이후는 비어있어 드릴 차단.
 */
export function loadTrackTreeAsNcs(): NcsTree {
  if (CACHE && cachedNcs) return cachedNcs;
  const raw = loadTrackTree();
  const lclas = raw.lclas.map((L) => ({
    code: L.code,
    name: L.name,
    mclas: L.mclas.map((M) => ({
      code: M.code,
      name: M.name,
      sclas: M.subd.map((S) => ({
        code: S.code,
        name: S.name,
        subd: [] as { code: string; name: string; unitCount: number }[],
      })),
    })),
  }));
  const tree: NcsTree = {
    summary: {
      lclas: lclas.length,
      mclas: lclas.reduce((a, L) => a + L.mclas.length, 0),
      sclas: lclas.reduce((a, L) => a + L.mclas.reduce((b, M) => b + M.sclas.length, 0), 0),
      subd: 0,
      units: 0,
    },
    lclas,
  };
  if (CACHE) cachedNcs = tree;
  return tree;
}

export function findTrackLclas(code: string) {
  return loadTrackTree().lclas.find((l) => l.code === code);
}
