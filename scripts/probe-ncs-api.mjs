// NCS OpenAPI 연결 테스트 스크립트
// 사용법:  node scripts/probe-ncs-api.mjs
//
// 공공데이터포털 NCS API의 정확한 endpoint path는
// 마이페이지 → 오픈API → 활용신청 현황 → [신청한 API 클릭] → "참고문서" 다운로드
// 안의 워드 파일에 명시되어 있습니다.
//
// 아래 ENDPOINTS 배열은 자주 쓰이는 추측 path들이라 일부는 404가 정상입니다.
// 200 OK 나오는 path 한 개 찾으면, 그 path를 src/lib/ncs/client.ts 에 박아넣고 본격 호출합니다.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('='))
);

const KEY = env.NCS_SERVICE_KEY;
if (!KEY) {
  console.error('❌ .env 에 NCS_SERVICE_KEY 가 없습니다.');
  process.exit(1);
}

// 데이터셋 15063879 (NCS 관련 정보 서비스) 추측 path 후보
const ENDPOINTS = [
  'https://apis.data.go.kr/B552223/ncsAbility/getNcsAbilityList',
  'https://apis.data.go.kr/B552223/getNcsList/getNcsList',
  'https://apis.data.go.kr/1492000/ncsAbilityInfoService/getNcsAbilityList',
  'https://apis.data.go.kr/1492000/ncsClsf/getNcsClsfList',
];

async function probe(url) {
  const full = `${url}?serviceKey=${KEY}&numOfRows=3&pageNo=1&type=json`;
  try {
    const res = await fetch(full);
    const text = await res.text();
    const head = text.slice(0, 200).replace(/\s+/g, ' ');
    return { url, status: res.status, ok: res.ok, head };
  } catch (e) {
    return { url, status: 'ERR', ok: false, head: e.message };
  }
}

console.log('🔍 NCS API endpoint 후보 probe 중...\n');
for (const url of ENDPOINTS) {
  const r = await probe(url);
  const icon = r.ok ? '✅' : '❌';
  console.log(`${icon} [${r.status}] ${r.url}`);
  console.log(`   ${r.head}\n`);
}

console.log(
  '\n👉 200 OK 가 하나도 없으면, 공공데이터포털 마이페이지에서 참고문서를 받아 정확한 path 를 알려주세요.'
);
