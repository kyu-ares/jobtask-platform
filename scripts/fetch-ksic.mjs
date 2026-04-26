// KSIC (한국표준산업분류 11차) 업종등급 전체 수집
//   한국무역보험공사 공공데이터포털 #15144476
//   GET https://apis.data.go.kr/B552696/industryLevel/getIndustryLevelList
//   params: serviceKey | industryLevel(1~4) | industryCd(상위)
//
// 이 API의 4단계 = 실제 KSIC의 중/소/세/세세 분류 (대분류 A~U는 본 API에 없음 → 수동 시드로 맵핑)
//
// 사용법:
//   node scripts/fetch-ksic.mjs            → level 1~4 전체 수집, data/ksic-raw.json 저장
//   node scripts/fetch-ksic.mjs --tree     → raw → data/ksic-tree.json (대/중/소/세 4계층 + 세세 첨부)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx), l.slice(idx + 1)];
    })
);
const KEY = env.KSIC_SERVICE_KEY || env.NCS_SERVICE_KEY;
if (!KEY) throw new Error('.env 의 KSIC_SERVICE_KEY / NCS_SERVICE_KEY 가 비어있습니다.');

const BASE = 'https://apis.data.go.kr/B552696/industryLevel/getIndustryLevelList';
const SLEEP_MS = 60; // TPS 보호

async function fetchLevel(level, parentCd) {
  const url = new URL(BASE);
  url.searchParams.set('serviceKey', KEY);
  url.searchParams.set('industryLevel', String(level));
  url.searchParams.set('type', 'json');
  url.searchParams.set('numOfRows', '500');
  url.searchParams.set('pageNo', '1');
  if (parentCd) url.searchParams.set('industryCd', parentCd);
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} @ L${level} parent=${parentCd}: ${text.slice(0, 200)}`);
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`JSON parse @ L${level} parent=${parentCd}: ${text.slice(0, 200)}`); }
  const raw = json?.response?.body?.items?.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const rc = json?.response?.header?.resultCode;
  if (rc !== undefined && String(rc) !== '0' && String(rc) !== '00') {
    throw new Error(`resultCode=${rc} msg=${json?.response?.header?.resultMsg} @ L${level} parent=${parentCd}`);
  }
  return items;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAll() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  // Level 1 (중분류 ~78)
  console.log('🌱 Level 1 (KSIC 중분류)...');
  const L1 = await fetchLevel(1);
  console.log(`  → ${L1.length} items`);

  // Level 2 (소분류 ~234)
  console.log(`🌿 Level 2 (KSIC 소분류) — ${L1.length} parents...`);
  const L2 = [];
  for (let i = 0; i < L1.length; i++) {
    const p = L1[i].industryCd;
    process.stdout.write(`\r  [${i + 1}/${L1.length}] parent=${p}  cum=${L2.length}`);
    try {
      const kids = await fetchLevel(2, p);
      L2.push(...kids);
    } catch (e) {
      console.log(`\n  ⚠ L2 parent=${p} failed: ${e.message}`);
    }
    await sleep(SLEEP_MS);
  }
  console.log(`\n  → ${L2.length} items`);

  // Level 3 (세분류 ~495)
  console.log(`🌳 Level 3 (KSIC 세분류) — ${L2.length} parents...`);
  const L3 = [];
  for (let i = 0; i < L2.length; i++) {
    const p = L2[i].industryCd;
    if (i % 20 === 0) process.stdout.write(`\r  [${i + 1}/${L2.length}] parent=${p}  cum=${L3.length}`);
    try {
      const kids = await fetchLevel(3, p);
      L3.push(...kids);
    } catch (e) {
      console.log(`\n  ⚠ L3 parent=${p} failed: ${e.message}`);
    }
    await sleep(SLEEP_MS);
  }
  console.log(`\n  → ${L3.length} items`);

  // Level 4 (세세분류 ~1200)
  console.log(`🌲 Level 4 (KSIC 세세분류) — ${L3.length} parents...`);
  const L4 = [];
  for (let i = 0; i < L3.length; i++) {
    const p = L3[i].industryCd;
    if (i % 30 === 0) process.stdout.write(`\r  [${i + 1}/${L3.length}] parent=${p}  cum=${L4.length}`);
    try {
      const kids = await fetchLevel(4, p);
      L4.push(...kids);
    } catch (e) {
      console.log(`\n  ⚠ L4 parent=${p} failed: ${e.message}`);
    }
    await sleep(SLEEP_MS);
  }
  console.log(`\n  → ${L4.length} items`);

  const raw = { L1, L2, L3, L4 };
  const outPath = join(DATA_DIR, 'ksic-raw.json');
  writeFileSync(outPath, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`💾 saved raw → ${outPath}`);
  console.log(`📊 counts: L1=${L1.length} L2=${L2.length} L3=${L3.length} L4=${L4.length}`);
  return raw;
}

// ─── KSIC 11차 알파벳 대분류 수동 시드 + 중분류(2자리 코드) → 알파벳 매핑 ───
// 근거: 통계청 고시 제2024-2호(2024.7.1 시행) KSIC 제11차 개정. 2자리 중분류 범위로 귀속
const KSIC_LCLAS_SEED = [
  { code: 'A', name: '농업, 임업 및 어업', range: ['01', '02', '03'] },
  { code: 'B', name: '광업', range: ['05', '06', '07', '08'] },
  {
    code: 'C',
    name: '제조업',
    range: Array.from({ length: 24 }, (_, i) => String(10 + i).padStart(2, '0')), // 10~33
  },
  { code: 'D', name: '전기, 가스, 증기 및 공기조절 공급업', range: ['35'] },
  { code: 'E', name: '수도, 하수 및 폐기물 처리, 원료 재생업', range: ['36', '37', '38', '39'] },
  { code: 'F', name: '건설업', range: ['41', '42'] },
  { code: 'G', name: '도매 및 소매업', range: ['45', '46', '47'] },
  { code: 'H', name: '운수 및 창고업', range: ['49', '50', '51', '52'] },
  { code: 'I', name: '숙박 및 음식점업', range: ['55', '56'] },
  { code: 'J', name: '정보통신업', range: ['58', '59', '60', '61', '62', '63'] },
  { code: 'K', name: '금융 및 보험업', range: ['64', '65', '66'] },
  { code: 'L', name: '부동산업', range: ['68'] },
  { code: 'M', name: '전문, 과학 및 기술 서비스업', range: ['70', '71', '72', '73'] },
  {
    code: 'N',
    name: '사업시설 관리, 사업 지원 및 임대 서비스업',
    range: ['69', '74', '75', '76'],
  },
  { code: 'O', name: '공공행정, 국방 및 사회보장 행정', range: ['84'] },
  { code: 'P', name: '교육 서비스업', range: ['85'] },
  { code: 'Q', name: '보건업 및 사회복지 서비스업', range: ['86', '87'] },
  { code: 'R', name: '예술, 스포츠 및 여가관련 서비스업', range: ['90', '91'] },
  {
    code: 'S',
    name: '협회 및 단체, 수리 및 기타 개인 서비스업',
    range: ['34', '94', '95', '96'],
  },
  {
    code: 'T',
    name: '가구 내 고용활동 및 달리 분류되지 않은 자가소비 생산활동',
    range: ['97', '98'],
  },
  { code: 'U', name: '국제 및 외국기관', range: ['99'] },
];

function mapToLclas(mclasCd) {
  for (const L of KSIC_LCLAS_SEED) {
    if (L.range.includes(mclasCd)) return L.code;
  }
  return null;
}

function buildTree(raw) {
  // 목적 구조: NCS와 호환되는 4계층
  //   대(알파벳 1) → 중(2자리) → 소(3자리) → 세(4자리). 세세(5자리)는 세에 매달아 units-like.
  const tree = new Map(); // code → lclas
  for (const L of KSIC_LCLAS_SEED) {
    tree.set(L.code, { code: L.code, name: L.name, mclas: new Map() });
  }
  const orphans = [];

  // L1 (중분류)
  for (const it of raw.L1) {
    const mc = String(it.industryCd);
    const lclasCode = mapToLclas(mc);
    if (!lclasCode) { orphans.push({ level: 1, ...it }); continue; }
    const L = tree.get(lclasCode);
    L.mclas.set(mc, { code: mc, name: it.industryNm, sclas: new Map() });
  }

  // L2 (소분류)
  for (const it of raw.L2) {
    const sc = String(it.industryCd);
    const mc = String(it.parentIndustryCd);
    const lclasCode = mapToLclas(mc);
    if (!lclasCode) { orphans.push({ level: 2, ...it }); continue; }
    const M = tree.get(lclasCode)?.mclas.get(mc);
    if (!M) { orphans.push({ level: 2, reason: 'no mclas', ...it }); continue; }
    M.sclas.set(sc, { code: sc, name: it.industryNm, subd: new Map() });
  }

  // L3 (세분류)
  for (const it of raw.L3) {
    const dc = String(it.industryCd);
    const sc = String(it.parentIndustryCd);
    const mc = sc.slice(0, 2);
    const lclasCode = mapToLclas(mc);
    if (!lclasCode) { orphans.push({ level: 3, ...it }); continue; }
    const S = tree.get(lclasCode)?.mclas.get(mc)?.sclas.get(sc);
    if (!S) { orphans.push({ level: 3, reason: 'no sclas', ...it }); continue; }
    S.subd.set(dc, { code: dc, name: it.industryNm, unitCount: 0, units: [] });
  }

  // L4 (세세분류) → 세분류.units
  for (const it of raw.L4) {
    const uc = String(it.industryCd);
    const dc = String(it.parentIndustryCd);
    const sc = dc.slice(0, 3);
    const mc = dc.slice(0, 2);
    const lclasCode = mapToLclas(mc);
    if (!lclasCode) { orphans.push({ level: 4, ...it }); continue; }
    const D = tree.get(lclasCode)?.mclas.get(mc)?.sclas.get(sc)?.subd.get(dc);
    if (!D) { orphans.push({ level: 4, reason: 'no subd', ...it }); continue; }
    D.units.push({ code: uc, name: it.industryNm, level: '4' });
    D.unitCount += 1;
  }

  // Map → Array + 정렬
  const lclas = [...tree.values()]
    .map((L) => ({
      code: L.code,
      name: L.name,
      mclas: [...L.mclas.values()]
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((M) => ({
          code: M.code,
          name: M.name,
          sclas: [...M.sclas.values()]
            .sort((a, b) => a.code.localeCompare(b.code))
            .map((S) => ({
              code: S.code,
              name: S.name,
              subd: [...S.subd.values()].sort((a, b) => a.code.localeCompare(b.code)),
            })),
        })),
    }))
    .filter((L) => L.mclas.length > 0); // 비어있는 대분류 제거

  const summary = {
    lclas: lclas.length,
    mclas: lclas.reduce((a, L) => a + L.mclas.length, 0),
    sclas: lclas.reduce((a, L) => a + L.mclas.reduce((b, M) => b + M.sclas.length, 0), 0),
    subd: lclas.reduce(
      (a, L) => a + L.mclas.reduce((b, M) => b + M.sclas.reduce((c, S) => c + S.subd.length, 0), 0),
      0
    ),
    units: lclas.reduce(
      (a, L) =>
        a +
        L.mclas.reduce(
          (b, M) =>
            b +
            M.sclas.reduce(
              (c, S) => c + S.subd.reduce((d, D) => d + D.units.length, 0),
              0
            ),
          0
        ),
      0
    ),
    orphans: orphans.length,
  };
  return { summary, lclas, orphans };
}

const args = new Set(process.argv.slice(2));
if (args.has('--tree')) {
  const rawPath = join(DATA_DIR, 'ksic-raw.json');
  let raw;
  if (existsSync(rawPath)) {
    raw = JSON.parse(readFileSync(rawPath, 'utf8'));
    console.log(`📂 loaded raw → L1=${raw.L1.length} L2=${raw.L2.length} L3=${raw.L3.length} L4=${raw.L4.length}`);
  } else {
    raw = await fetchAll();
  }
  const { summary, lclas, orphans } = buildTree(raw);
  console.log('🌳 tree summary:', summary);
  if (orphans.length) {
    console.log(`⚠ ${orphans.length} orphan items (매핑 실패). 처음 5개:`);
    for (const o of orphans.slice(0, 5)) console.log('  ', o);
  }
  const out = join(DATA_DIR, 'ksic-tree.json');
  writeFileSync(out, JSON.stringify({ summary, lclas }, null, 2), 'utf8');
  console.log(`💾 saved → ${out}`);
} else {
  await fetchAll();
}
