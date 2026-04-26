// 기재부 공공기관 채용정보 OpenAPI → data/openings.json 갱신 (실시간 데이터)
//
// 호출 사양:
//   GET https://apis.data.go.kr/1051000/recruitment/list
//   params: serviceKey, pageNo, numOfRows (max 1000), resultType=json
//
// 응답 핵심:
//   - totalCount, result[]
//   - recrutPblntSn / instNm / ncsCdNmLst / workRgnNmLst / hireTypeNmLst /
//     recrutSeNm / acbgCondNmLst / pbancBgngYmd, pbancEndYmd / recrutPbancTtl /
//     srcUrl / recrutNope / ongoingYn / decimalDay / aplyQlfcCn / prefCn
//
// 사용:
//   node scripts/fetch-openings-live.mjs            전체 fetch (~110 pages, 1000/page)
//   node scripts/fetch-openings-live.mjs --pages=5  처음 5페이지만 (테스트용)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const KEY = env.NCS_SERVICE_KEY;
if (!KEY) throw new Error('.env 의 NCS_SERVICE_KEY 가 비어있습니다.');

const BASE = 'https://apis.data.go.kr/1051000/recruitment/list';
const PAGE_SIZE = 1000;

// ---- 6축 매핑 (응답 한글명 → 우리 axes 코드) ----

const SIDO_NAME_TO_CODE = new Map([
  ['서울', '11'], ['부산', '21'], ['대구', '22'], ['인천', '23'], ['광주', '24'],
  ['대전', '25'], ['울산', '26'], ['세종', '29'], ['경기', '31'], ['강원', '32'],
  ['충북', '33'], ['충남', '34'], ['전북', '35'], ['전남', '36'], ['경북', '37'],
  ['경남', '38'], ['제주', '39'],
]);

// 응답의 hireType → 6축 employment 코드
const HIRE_NAME_TO_CODE = (name) => {
  const n = name || '';
  if (n.includes('정규직')) return n.includes('비정규') ? 'contract' : 'full';
  if (n.includes('계약')) return 'contract';
  if (n.includes('인턴')) return 'intern';
  if (n.includes('파견')) return 'dispatch';
  if (n.includes('파트') || n.includes('단시간')) return 'part';
  if (n.includes('프리')) return 'freelance';
  return null;
};

// recruitSe → career codes (배열 가능: '신입+경력' → entry + junior)
const CAREER_NAMES_TO_CODES = (name) => {
  const n = name || '';
  const out = new Set();
  if (n.includes('신입')) out.add('entry');
  if (n.includes('경력')) {
    out.add('junior');
    out.add('mid');
    out.add('senior');
  }
  if (n.includes('임원') || n.includes('관리자')) out.add('exec');
  return Array.from(out);
};

// 학력
const EDU_NAME_TO_CODE = (name) => {
  const n = name || '';
  if (n.includes('무관')) return 'any';
  if (n.includes('박사')) return 'phd';
  if (n.includes('석사')) return 'ms';
  if (n.includes('학사') || n.includes('대졸') || n.includes('대학교 졸업')) return 'bs';
  if (n.includes('전문')) return 'col2';
  if (n.includes('고졸') || n.includes('고등학교')) return 'high';
  return null;
};

// NCS 한글명 → 24 대분류 코드 (CSV 휴리스틱과 동일)
const NCS_KEYWORDS = [
  ['01', ['사업관리']],
  ['02', ['행정', '사무', '경영', '회계', '재무', '인사', '총무', '서무', '기획', '관리', '비서', '운영', '감사', '재정', '예산']],
  ['03', ['금융', '보험', '투자', '대출', '신용']],
  ['04', ['교사', '교수', '교원', '연구', '교육', '강사', '학예', '교직']],
  ['05', ['법무', '변호', '판사', '검사', '법원', '경찰', '소방', '교도', '국방', '군무원', '수사']],
  ['06', ['의무', '의사', '간호', '의료', '약사', '병원', '보건', '치과']],
  ['07', ['사회복지', '복지', '상담']],
  ['08', ['문화', '예술', '디자인', '방송', '미디어']],
  ['09', ['운전', '운송', '교통', '운수', '항공', '철도']],
  ['10', ['영업', '판매', '마케팅']],
  ['11', ['경비', '청소', '시설관리']],
  ['12', ['관광', '숙박', '체육', '스포츠', '레저']],
  ['13', ['조리', '음식', '식음료']],
  ['14', ['건설', '토목', '건축', '시공', '설계']],
  ['15', ['기계', '설비', '제조', '생산']],
  ['16', ['재료', '소재', '금속']],
  ['17', ['화학', '바이오', '제약', '생명']],
  ['18', ['섬유', '의복', '봉제']],
  ['19', ['전기', '전자', '통신설비']],
  ['20', ['전산', 'IT', '정보통신', '소프트웨어', 'SW', '시스템', '네트워크', '데이터', '개발', '프로그래밍', '빅데이터', 'AI', '인공지능', '보안']],
  ['21', ['식품']],
  ['22', ['인쇄', '목재', '공예']],
  ['23', ['환경', '에너지', '원자력', '안전', '재난', '기상']],
  ['24', ['농업', '임업', '어업', '수산', '농촌', '산림']],
];

function ncsNamesToLclas(names) {
  const blob = (names || '').toLowerCase();
  const hits = new Set();
  for (const [code, kws] of NCS_KEYWORDS) {
    for (const kw of kws) {
      if (blob.includes(kw.toLowerCase())) {
        hits.add(code);
        break;
      }
    }
  }
  return Array.from(hits);
}

function regionNamesToSidoCodes(names) {
  const blob = names || '';
  const codes = new Set();
  for (const [name, code] of SIDO_NAME_TO_CODE) {
    if (blob.includes(name)) codes.add(code);
  }
  return Array.from(codes);
}

function ymdToIso(s) {
  if (!s || s.length !== 8) return null;
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function instKindFrom(name) {
  const n = name || '';
  if (n.includes('교육청') || n.includes('교육')) return '교육청';
  if (/(대학교|대학)/.test(n)) return '교육';
  if (/(시청|군청|구청|도청|광역시)/.test(n)) return '지자체';
  if (/(부|청|처|위원회|국립|국회|법원|검찰|경찰)/.test(n)) return '국가기관';
  return '공공기관';
}

// ---- fetch loop ----

async function fetchPage(pageNo, numOfRows = PAGE_SIZE) {
  const url = `${BASE}?serviceKey=${encodeURIComponent(KEY)}&pageNo=${pageNo}&numOfRows=${numOfRows}&resultType=json`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`JSON parse fail: ${text.slice(0, 300)}`);
  }
  if (json.resultCode !== 200 && json.resultCode !== '00') {
    throw new Error(`API error: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json;
}

function normalize(item) {
  const sidoCodes = regionNamesToSidoCodes(item.workRgnNmLst);
  const ncsCodes = ncsNamesToLclas(item.ncsCdNmLst);
  const empCode = HIRE_NAME_TO_CODE(item.hireTypeNmLst);
  const careerCodes = CAREER_NAMES_TO_CODES(item.recrutSeNm);
  const eduCode = EDU_NAME_TO_CODE(item.acbgCondNmLst);
  return {
    id: String(item.recrutPblntSn ?? ''),
    org: item.instNm ?? '',
    instKind: instKindFrom(item.instNm),
    jobKind: item.recrutSeNm ?? '',
    title: item.recrutPbancTtl ?? '',
    rank: '',
    pick: typeof item.recrutNope === 'number' ? item.recrutNope : null,
    views: 0,
    startAt: ymdToIso(item.pbancBgngYmd),
    endAt: ymdToIso(item.pbancEndYmd),
    disabledHire: false,
    disabledPref: /장애인/.test(item.prefCondCn || ''),
    sido: sidoCodes[0] ?? null,
    sidos: sidoCodes,
    ncs: ncsCodes,
    // 추가 필드 (API 전용)
    src: 'apiV1',
    srcUrl: item.srcUrl ?? null,
    employment: empCode,
    career: careerCodes,
    education: eduCode,
    rawNcsNames: item.ncsCdNmLst ?? '',
    rawRegionNames: item.workRgnNmLst ?? '',
    rawHireType: item.hireTypeNmLst ?? '',
    rawAcbg: item.acbgCondNmLst ?? '',
    // 본문 텍스트 — 시군구·동 위치 정규식 매칭용
    rawAplyQlfc: item.aplyQlfcCn ?? '',
    rawScrnMethod: item.scrnprcdrMthdExpln ?? '',
    rawPref: item.prefCn ?? '',
    rawPrefCond: item.prefCondCn ?? '',
    ongoing: item.ongoingYn === 'Y',
    daysLeft: typeof item.decimalDay === 'number' ? item.decimalDay : null,
  };
}

// CLI args
const args = process.argv.slice(2).reduce((a, s) => {
  const m = s.match(/^--(\w+)=(.+)$/);
  if (m) a[m[1]] = m[2];
  return a;
}, {});

const limitPages = args.pages ? parseInt(args.pages, 10) : null;

console.log('🔌 fetching first page to discover totalCount...');
const first = await fetchPage(1, PAGE_SIZE);
const total = first.totalCount;
const totalPages = Math.ceil(total / PAGE_SIZE);
const targetPages = limitPages ? Math.min(limitPages, totalPages) : totalPages;
console.log(`📊 total=${total.toLocaleString()}, pages=${totalPages}, fetching ${targetPages}`);

const all = first.result.map(normalize);
for (let p = 2; p <= targetPages; p++) {
  process.stdout.write(`\r  page ${p}/${targetPages}...`);
  const j = await fetchPage(p, PAGE_SIZE);
  for (const it of j.result || []) all.push(normalize(it));
  await new Promise((r) => setTimeout(r, 60)); // gentle
}
console.log(`\n✅ collected ${all.length.toLocaleString()} openings`);

// 정렬: 진행중 먼저 (daysLeft asc), 그 후 마감
all.sort((a, b) => {
  const ax = a.ongoing ? 0 : 1;
  const bx = b.ongoing ? 0 : 1;
  if (ax !== bx) return ax - bx;
  return (a.daysLeft ?? 999999) - (b.daysLeft ?? 999999);
});

// 요약
const sidoCount = {};
const ncsCount = {};
const instCount = {};
const jobCount = {};
const empCount = {};
const eduCount = {};
let active = 0;
let noSido = 0;
let noNcs = 0;
for (const o of all) {
  if (o.ongoing) active++;
  if (!o.sido) noSido++;
  if (o.ncs.length === 0) noNcs++;
  if (o.sido) sidoCount[o.sido] = (sidoCount[o.sido] ?? 0) + 1;
  for (const c of o.ncs) ncsCount[c] = (ncsCount[c] ?? 0) + 1;
  if (o.instKind) instCount[o.instKind] = (instCount[o.instKind] ?? 0) + 1;
  if (o.jobKind) jobCount[o.jobKind] = (jobCount[o.jobKind] ?? 0) + 1;
  if (o.employment) empCount[o.employment] = (empCount[o.employment] ?? 0) + 1;
  if (o.education) eduCount[o.education] = (eduCount[o.education] ?? 0) + 1;
}

const summary = {
  total: all.length,
  active,
  noSido,
  noNcs,
  fetchedAt: new Date().toISOString(),
  source: '기재부 공공기관 채용정보 OpenAPI v1',
  instKind: instCount,
  jobKind: jobCount,
  sido: sidoCount,
  ncs: ncsCount,
  employment: empCount,
  education: eduCount,
};

if (!existsSync(join(ROOT, 'data'))) mkdirSync(join(ROOT, 'data'));
const outPath = join(ROOT, 'data', 'openings.json');
const summaryPath = join(ROOT, 'data', 'openings-summary.json');
writeFileSync(outPath, JSON.stringify(all), 'utf8');
writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

console.log(
  `\n📈 active(진행중): ${active.toLocaleString()} / ${all.length.toLocaleString()}`
);
console.log(`   sido 매칭 실패: ${noSido} (${((noSido * 100) / all.length).toFixed(0)}%)`);
console.log(`   ncs 매칭 실패: ${noNcs} (${((noNcs * 100) / all.length).toFixed(0)}%)`);
console.log(`💾 saved → ${outPath}`);
console.log(`💾 saved → ${summaryPath}`);
