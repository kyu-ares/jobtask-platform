// KSIC (한국표준산업분류 11차) 업종등급목록 API 프로브
// 한국무역보험공사 / data.go.kr 15144476
//
//   GET https://apis.data.go.kr/B552696/industryLevel/getIndustryLevelList
//   params: serviceKey | industryLevel(1~4) | industryCd(상위 코드, 옵션)
//
// 사용법:
//   node scripts/probe-ksic.mjs                  → level 1 전체 (대분류) 미리보기
//   node scripts/probe-ksic.mjs 2 A              → level 2, 상위 = A (농업,임업,어업 등)
//   node scripts/probe-ksic.mjs 3 01             → level 3, 상위 = 01
//   node scripts/probe-ksic.mjs 4 011            → level 4, 상위 = 011

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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
if (!KEY) throw new Error('.env 의 KSIC_SERVICE_KEY 또는 NCS_SERVICE_KEY 가 비어있습니다.');

const BASE = 'https://apis.data.go.kr/B552696/industryLevel/getIndustryLevelList';

const level = process.argv[2] ?? '1';
const parentCd = process.argv[3];

const url = new URL(BASE);
url.searchParams.set('serviceKey', KEY);
url.searchParams.set('industryLevel', level);
url.searchParams.set('type', 'json');
url.searchParams.set('numOfRows', '500');
url.searchParams.set('pageNo', '1');
if (parentCd) url.searchParams.set('industryCd', parentCd);

console.log(`🔌 GET ${url.toString().replace(KEY, KEY.slice(0, 6) + '...')}`);

const res = await fetch(url);
const text = await res.text();
console.log(`📬 HTTP ${res.status} · ${text.length} bytes`);

let json;
try {
  json = JSON.parse(text);
} catch {
  console.log('--- raw (head) ---');
  console.log(text.slice(0, 600));
  process.exit(1);
}

console.log('--- raw response (head) ---');
console.log(JSON.stringify(json, null, 2).slice(0, 1500));

// items 추출
const candidates = [
  json?.response?.body?.items?.item,
  json?.response?.body?.items,
  json?.body?.items?.item,
  json?.items?.item,
  json?.items,
];
let items = null;
for (const c of candidates) {
  if (Array.isArray(c)) { items = c; break; }
  if (c && typeof c === 'object' && (c.industryCd || c.item)) {
    items = Array.isArray(c.item) ? c.item : [c];
    break;
  }
}
const total =
  json?.response?.body?.totalCount ??
  json?.body?.totalCount ??
  json?.totalCount ??
  null;

console.log(`\n📊 level=${level} parent=${parentCd ?? '(none)'} total=${total} items=${items?.length ?? 0}`);
if (items?.length) {
  console.log('\n--- first 10 items ---');
  for (const it of items.slice(0, 10)) {
    console.log(
      `  ${it.industryClass ?? '?'}  ${it.industryCd ?? '?'}  [parent ${it.parentIndustryCd ?? '-'}]  ${it.industryNm ?? ''}`
    );
  }
}
