// KSIC (한국표준산업분류 11차) 트리 로더
// 구조는 NCS와 동일 (대 21 / 중 78 / 소 239 / 세 540 + 세세 1384 units)
// 대분류 코드: 알파벳 1자리 (A~U)
// 중분류: 숫자 2자리  /  소분류: 3자리  /  세분류: 4자리  /  세세분류(units): 5자리

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { NcsTree, NcsLclas, NcsMclas, NcsSclas } from '@/lib/ncs/types';

const ROOT = process.cwd();
const FULL_PATH = path.join(ROOT, 'data', 'ksic-tree.json');

let cached: NcsTree | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function loadKsicTree(): NcsTree {
  if (CACHE && cached) return cached;
  if (!existsSync(FULL_PATH)) {
    throw new Error(
      `KSIC 트리 파일이 없습니다: ${FULL_PATH}\n  → node scripts/fetch-ksic.mjs --tree 로 생성하세요.`
    );
  }
  const raw = readFileSync(FULL_PATH, 'utf8');
  const tree = JSON.parse(raw) as NcsTree;
  if (CACHE) cached = tree;
  return tree;
}

export function findKsicLclas(code: string): NcsLclas | undefined {
  return loadKsicTree().lclas.find((l) => l.code === code);
}

export function findKsicMclas(lclasCode: string, mclasCode: string): NcsMclas | undefined {
  return findKsicLclas(lclasCode)?.mclas.find((m) => m.code === mclasCode);
}

export function findKsicSclas(
  lclasCode: string,
  mclasCode: string,
  sclasCode: string
): NcsSclas | undefined {
  return findKsicMclas(lclasCode, mclasCode)?.sclas.find((s) => s.code === sclasCode);
}
