// 한국 17개 시도 베이스 메타 + 시군구 mock 데이터 생성기

import type { NcsTree } from '@/lib/ncs/types';

export interface SidoBase {
  code: string;
  name: string;
  nameEng: string;
}

export const SIDO_LIST: SidoBase[] = [
  { code: '11', name: '서울특별시', nameEng: 'Seoul' },
  { code: '21', name: '부산광역시', nameEng: 'Busan' },
  { code: '22', name: '대구광역시', nameEng: 'Daegu' },
  { code: '23', name: '인천광역시', nameEng: 'Incheon' },
  { code: '24', name: '광주광역시', nameEng: 'Gwangju' },
  { code: '25', name: '대전광역시', nameEng: 'Daejeon' },
  { code: '26', name: '울산광역시', nameEng: 'Ulsan' },
  { code: '29', name: '세종특별자치시', nameEng: 'Sejong' },
  { code: '31', name: '경기도', nameEng: 'Gyeonggi' },
  { code: '32', name: '강원도', nameEng: 'Gangwon' },
  { code: '33', name: '충청북도', nameEng: 'Chungbuk' },
  { code: '34', name: '충청남도', nameEng: 'Chungnam' },
  { code: '35', name: '전라북도', nameEng: 'Jeonbuk' },
  { code: '36', name: '전라남도', nameEng: 'Jeonnam' },
  { code: '37', name: '경상북도', nameEng: 'Gyeongbuk' },
  { code: '38', name: '경상남도', nameEng: 'Gyeongnam' },
  { code: '39', name: '제주특별자치도', nameEng: 'Jeju' },
];

export const SIDO_BY_CODE = new Map(SIDO_LIST.map((s) => [s.code, s]));

export function shortName(name: string): string {
  return name
    .replace(/특별시$/, '')
    .replace(/광역시$/, '')
    .replace(/특별자치시$/, '')
    .replace(/특별자치도$/, '')
    .replace(/도$/, '');
}

// primary 농도 — 0..max → primary-light → primary
export function primaryFill(value: number, max: number): string {
  const t = Math.max(0.05, Math.min(1, value / max));
  const r = Math.round(235 + (0 - 235) * t);
  const g = Math.round(243 + (108 - 243) * t);
  const b = Math.round(255 + (209 - 255) * t);
  return `rgb(${r},${g},${b})`;
}

export function fgOnPrimary(value: number, max: number): string {
  return value / max > 0.5 ? '#ffffff' : '#0A1E3D';
}

function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

// (deprecated) 단일 시군구 mock — sum 보존 안 됨. 새 코드는 distributeChildren 사용.
export function sggOpeningsMock(sggCode: string, parentTotal: number, sggCount: number): number {
  const base = parentTotal / Math.max(sggCount, 1);
  const jitter = 0.4 + hash01(sggCode, 91) * 1.2;
  return Math.round(base * jitter);
}

// Largest Remainder Method 기반 sum-preserving 분배.
// parentTotal 을 codes 길이만큼 정수로 분배하여 합이 parentTotal 과 정확히 일치.
// hash 기반 jitter로 deterministic·차등 분배.
export function distributeChildren(
  parentTotal: number,
  codes: string[],
  salt = 91
): Map<string, number> {
  const result = new Map<string, number>();
  if (codes.length === 0) return result;
  if (parentTotal <= 0) {
    for (const c of codes) result.set(c, 0);
    return result;
  }

  const weights = codes.map((c) => 0.4 + hash01(c, salt) * 1.2);
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (parentTotal * w) / sumW);
  const floors = raw.map((r) => Math.floor(r));
  const remainder = parentTotal - floors.reduce((a, b) => a + b, 0);
  const fracs = raw.map((r, i) => ({ i, f: r - floors[i] }));
  fracs.sort((a, b) => b.f - a.f);
  for (let k = 0; k < remainder; k++) floors[fracs[k].i] += 1;

  for (let i = 0; i < codes.length; i++) result.set(codes[i], floors[i]);
  return result;
}

// 트리에서 평탄화된 직무 리스트
export interface FlatJob {
  code: string;
  name: string;
  unitCount: number;
  lclasCode: string;
  lclasName: string;
}

export function flattenJobs(tree: NcsTree): FlatJob[] {
  const out: FlatJob[] = [];
  for (const l of tree.lclas) {
    for (const m of l.mclas) {
      for (const s of m.sclas) {
        for (const d of s.subd) {
          out.push({
            code: d.code,
            name: d.name,
            unitCount: d.unitCount,
            lclasCode: l.code,
            lclasName: l.name,
          });
        }
      }
    }
  }
  return out;
}
