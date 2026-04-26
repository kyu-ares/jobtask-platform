// NCS 관련 정보 서비스 호출 (큐넷)
//   GET https://c.q-net.or.kr/openapi/Ncs1info/ncsinfo.do
//   params: type=json | pageNo | numOfRows | ServiceKey(URL-encoded)
//
// 사용법:
//   node scripts/fetch-ncs-info.mjs            → 첫 페이지 5건 미리보기
//   node scripts/fetch-ncs-info.mjs --all      → 1,306건 전부 가져와 data/ncs-raw.json 으로 저장
//   node scripts/fetch-ncs-info.mjs --tree     → --all 결과를 4계층 트리(data/ncs-tree.json)로 변환

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
const KEY = env.NCS_SERVICE_KEY;
if (!KEY) throw new Error('.env 의 NCS_SERVICE_KEY 가 비어있습니다.');

const BASE = 'https://c.q-net.or.kr/openapi/Ncs1info/ncsinfo.do';

async function fetchPage(pageNo, numOfRows = 100) {
  const url = `${BASE}?type=json&pageNo=${pageNo}&numOfRows=${numOfRows}&ServiceKey=${encodeURIComponent(KEY)}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`JSON parse fail. body head: ${text.slice(0, 300)}`);
  }
  return json;
}

function extractItems(json) {
  // 응답 구조 추정: response.body.root.items.ncsInfo[]  또는 단순 items[]
  // 실제 응답을 보고 유연하게 파싱
  const candidates = [
    json?.response?.body?.root?.items?.ncsInfo,
    json?.response?.body?.items?.ncsInfo,
    json?.response?.body?.items,
    json?.items?.ncsInfo,
    json?.items,
    json?.body?.items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === 'object') return [c];
  }
  return [];
}

function extractTotal(json) {
  const candidates = [
    json?.response?.body?.root?.info?.totalCount,
    json?.response?.body?.totalCount,
    json?.totalCount,
    json?.body?.totalCount,
  ];
  for (const c of candidates) {
    if (c != null) return Number(c);
  }
  return null;
}

async function preview() {
  console.log('🔌 첫 페이지(5건) 호출 중...');
  const json = await fetchPage(1, 5);
  console.log('--- raw response (head) ---');
  console.log(JSON.stringify(json, null, 2).slice(0, 1500));
  const items = extractItems(json);
  const total = extractTotal(json);
  console.log(`\n📊 totalCount: ${total}, items in page: ${items.length}`);
  if (items[0]) {
    console.log('--- first item keys ---');
    console.log(Object.keys(items[0]));
  }
}

async function fetchAll() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const PAGE_SIZE = 200;
  const first = await fetchPage(1, PAGE_SIZE);
  const total = extractTotal(first) ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  console.log(`📊 total=${total}, pages=${totalPages}, pageSize=${PAGE_SIZE}`);

  const all = [...extractItems(first)];
  for (let p = 2; p <= totalPages; p++) {
    process.stdout.write(`\r  fetching page ${p}/${totalPages}...`);
    const j = await fetchPage(p, PAGE_SIZE);
    all.push(...extractItems(j));
    await new Promise((r) => setTimeout(r, 50)); // TPS 50 대비
  }
  console.log(`\n✅ collected ${all.length} items`);
  const outPath = join(DATA_DIR, 'ncs-raw.json');
  writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
  console.log(`💾 saved → ${outPath}`);
  return all;
}

function buildTree(items) {
  // 능력단위코드 ncsClCd: '0101010101_17v2' → 대2/중2/소2/세2/능력단위2 + _버전
  const tree = {}; // { lclasCd: { name, mids: { mclasCd: { name, sclas: {...} } } } }
  for (const it of items) {
    const code = it.ncsClCd || '';
    const baseCode = code.split('_')[0]; // 0101010101
    if (baseCode.length < 8) continue;
    const lc = baseCode.slice(0, 2);
    const mc = baseCode.slice(0, 4);
    const sc = baseCode.slice(0, 6);
    const dc = baseCode.slice(0, 8);

    if (!tree[lc]) tree[lc] = { code: lc, name: it.ncsLclasCdnm, mids: {} };
    if (!tree[lc].mids[mc])
      tree[lc].mids[mc] = { code: mc, name: it.ncsMclasCdnm, sclas: {} };
    if (!tree[lc].mids[mc].sclas[sc])
      tree[lc].mids[mc].sclas[sc] = { code: sc, name: it.ncsSclasCdnm, subd: {} };
    if (!tree[lc].mids[mc].sclas[sc].subd[dc])
      tree[lc].mids[mc].sclas[sc].subd[dc] = {
        code: dc,
        name: it.ncsSubdCdnm,
        units: [],
      };
    tree[lc].mids[mc].sclas[sc].subd[dc].units.push({
      code: it.ncsClCd,
      name: it.compeUnitName,
      level: it.compeUnitLevel,
    });
  }

  // 카운트 + 정렬된 배열로 변환
  const lclas = Object.values(tree)
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((L) => ({
      code: L.code,
      name: L.name,
      mclas: Object.values(L.mids)
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((M) => ({
          code: M.code,
          name: M.name,
          sclas: Object.values(M.sclas)
            .sort((a, b) => a.code.localeCompare(b.code))
            .map((S) => ({
              code: S.code,
              name: S.name,
              subd: Object.values(S.subd)
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((D) => ({
                  code: D.code,
                  name: D.name,
                  unitCount: D.units.length,
                  units: D.units,
                })),
            })),
        })),
    }));

  const summary = {
    lclas: lclas.length,
    mclas: lclas.reduce((a, L) => a + L.mclas.length, 0),
    sclas: lclas.reduce(
      (a, L) => a + L.mclas.reduce((b, M) => b + M.sclas.length, 0),
      0
    ),
    subd: lclas.reduce(
      (a, L) =>
        a +
        L.mclas.reduce(
          (b, M) => b + M.sclas.reduce((c, S) => c + S.subd.length, 0),
          0
        ),
      0
    ),
    units: items.length,
  };
  return { summary, lclas };
}

const args = new Set(process.argv.slice(2));
if (args.has('--all') || args.has('--tree')) {
  const items = await fetchAll();
  if (args.has('--tree')) {
    const tree = buildTree(items);
    console.log('🌳 tree summary:', tree.summary);
    const out = join(DATA_DIR, 'ncs-tree.json');
    writeFileSync(out, JSON.stringify(tree, null, 2), 'utf8');
    console.log(`💾 saved → ${out}`);
  }
} else {
  await preview();
}
