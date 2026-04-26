import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { NcsTree, NcsLclas, NcsMclas, NcsSclas } from './types';

const ROOT = process.cwd();
const FULL_PATH = path.join(ROOT, 'data', 'ncs-tree.json');
const SEED_PATH = path.join(ROOT, 'data', 'ncs-tree.seed.json');

let cached: NcsTree | null = null;
const CACHE = process.env.NODE_ENV === 'production';

export function loadNcsTree(): NcsTree {
  if (CACHE && cached) return cached;
  const file = existsSync(FULL_PATH) ? FULL_PATH : SEED_PATH;
  const raw = readFileSync(file, 'utf8');
  const tree = JSON.parse(raw) as NcsTree;
  if (CACHE) cached = tree;
  return tree;
}

export function isSeedTree(): boolean {
  return !existsSync(FULL_PATH);
}

export function findLclas(code: string): NcsLclas | undefined {
  return loadNcsTree().lclas.find((l) => l.code === code);
}

export function findMclas(lclasCode: string, mclasCode: string): NcsMclas | undefined {
  return findLclas(lclasCode)?.mclas.find((m) => m.code === mclasCode);
}

export function findSclas(
  lclasCode: string,
  mclasCode: string,
  sclasCode: string
): NcsSclas | undefined {
  return findMclas(lclasCode, mclasCode)?.sclas.find((s) => s.code === sclasCode);
}
