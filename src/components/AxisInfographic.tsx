// "NCS 대분류와 동일 위계의 6개 채용 기준" — /explore 상단 교육 섹션
// 사용자가 정의한 6축 분석을 시각적으로 그대로 옮긴 인포그래픽

const AXES = [
  {
    n: '①',
    title: '직무·직종 분류',
    items: [
      '사람인·잡코리아: 직군 대분류 약 20개 (IT개발·영업·마케팅·생산 등)',
      '원티드·점프잇: 직군 분류 (개발·디자인·마케팅 등)',
      'NCS와 직접 매핑 가능 — 같은 위계의 직종 분류 체계',
    ],
  },
  {
    n: '②',
    title: '고용형태 분류',
    items: [
      '정규직 · 계약직 · 파견직 · 프리랜서 · 인턴',
      '모든 플랫폼이 동급의 독립 필터로 채택',
      '근로기준법 기반 고용형태 분류와 동일 위계',
    ],
  },
  {
    n: '③',
    title: '경력 단계 분류',
    items: [
      '신입 · 경력 1–3년 · 경력 3–7년 · 시니어 · 임원급',
      'NCS 능력수준 8단계(lv 1–8)와 동일 위계 구조',
      '구직자·구인자 모두 독립 필터로 활용',
    ],
  },
  {
    n: '④',
    title: '학력 분류',
    items: [
      '고졸 · 전문대졸 · 대졸 · 석사 · 박사 · 학력무관',
      'NCS 도입 이전 핵심 분류 — 지금도 독립 필터',
      '캐치 · 사람인 · 잡코리아 모두 동일 체계 사용',
    ],
  },
  {
    n: '⑤',
    title: '기업 규모·형태',
    items: [
      '대기업 · 중견 · 중소 · 스타트업 · 외국계 · 공기업',
      '공정거래위·중기부 기준과 동일 위계',
      '구직자 선택 기준의 핵심 대분류로 작동',
    ],
  },
  {
    n: '⑥',
    title: '지역·근무지',
    items: [
      '서울 · 경기 · 부산 · 대구 · 인천 · 해외 등 17개 광역',
      '행정구역 대분류와 정확히 일치',
      '모든 플랫폼 공통 독립 필터',
    ],
  },
];

export function AxisInfographic() {
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
            왜 6개 축인가
          </p>
          <h2 className="mt-1 text-[22px] font-bold tracking-tight sm:text-[28px]">
            NCS 대분류와 동일 위계의 채용 기준
          </h2>
        </div>
        <p className="hidden text-[14px] text-[color:var(--color-neutral-500)] sm:block">
          상호배타성 · 포괄성 · 독립 분류체계
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AXES.map((a) => (
          <div
            key={a.n}
            className="rounded-xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary-light)] p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-[color:var(--color-primary)] tabular">
                {a.n}
              </span>
              <span className="text-[18px] font-bold text-[color:var(--color-neutral-800)]">
                {a.title}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {a.items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[14px] leading-[1.55] text-[color:var(--color-neutral-700)]"
                >
                  <span className="mt-2 inline-block h-1 w-1 flex-none rounded-full bg-[color:var(--color-primary)]" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[color:var(--color-neutral-50)] p-4 text-[14px] leading-[1.6] text-[color:var(--color-neutral-700)]">
        <span className="font-semibold text-[color:var(--color-neutral-800)]">동일 위계 X:</span>{' '}
        연봉 · 복리후생 · 워라밸 · 자격증 · 기술스택 · 컬처핏은 독립 분류체계가 아니라 <strong>속성·조건</strong>이므로,
        2depth 이하 보조 필터로 다룬다 (자격증 = NCS 세분류 하위, 기술스택 = 직종 내 세부 스킬).
      </div>
    </div>
  );
}
