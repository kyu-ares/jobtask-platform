// 기술 진입장벽 (Moat) — "왜 우리만 할 수 있나"
// 5가지 기술 차별화, 각각 "경쟁사 한계 → 우리 해결 방식"

const MOATS = [
  {
    n: '01',
    label: 'Data Moat',
    title: 'NCS 1,083 직무 × 6축 × 실시간 채용 교차',
    challenge:
      '다른 채용 플랫폼: 직무 태그는 20개, 지역은 시·도 단위, 실시간 채용 데이터는 민간 API 유료.',
    solution: [
      'NCS 법정 분류 대분류 24 → 세분류 1,083',
      '공공 OpenAPI 109,347건 실시간 + 본문 정규식 + 본사 주소 DB',
      '시도·시군구·동 3단계 drill-down + 6축 필터',
    ],
    tags: ['NCS', 'OpenAPI', '본문 정규식', '지오 매칭'],
  },
  {
    n: '02',
    label: 'Framework Moat',
    title: 'NCS × SHL UCF × Lominger 67 × EEOC Cross-Mapping',
    challenge:
      '다른 HR tech: 자체 역량 모델만 제공 (외부 표준 없음). 외국계 대응 불가, 법적 방어력 없음.',
    solution: [
      'NCS 능력단위 ↔ SHL UCF 20 자동 매핑 (MNC 호환)',
      'Lominger 67 직책별 가중치 프리셋',
      'EEOC 4/5 Rule + 한국 채용절차법 기본 준수',
    ],
    tags: ['SHL UCF', 'Lominger', 'EEOC', '채용절차법'],
  },
  {
    n: '03',
    label: 'Academic Moat',
    title: '최신 2024 메타분석 + 자체 예측 타당도 공시',
    challenge:
      '다른 서비스: 2014년 인용, 2024 Sackett 재보정 미반영. 자체 r 값 한 번도 공시한 적 없음.',
    solution: [
      'Sackett et al. 2024 최신 보정 적용',
      'RJP 메타분석 (AOM 40 studies) 직무과제에 통합',
      '자체 채용 후 6개월 성과 누적 → 매년 r 값 공시 약속',
    ],
    tags: ['Sackett 2024', 'RJP', '자체 KPI'],
  },
  {
    n: '04',
    label: 'Credibility Moat',
    title: '6중 공신력 자동 출처 표기',
    challenge:
      '다른 평가 툴: "우리가 잘 했어요" 말뿐. 학술·법령 출처 없어 지원자·구인자 모두 신뢰 어려움.',
    solution: [
      '과제 화면 하단 L1~L6 출처 자동 렌더',
      '모든 평가 기준에 NCS 수행준거 코드 인용',
      '"왜 이 과제인지" 공개 검증 가능',
    ],
    tags: ['L1 법령', 'L2 학술', 'L6 공정성'],
  },
  {
    n: '05',
    label: 'Network Moat',
    title: '도메인 + 깊이 데이터의 복리 효과',
    challenge:
      '다른 플랫폼: 이력서 기반 → 다음 채용에 자산화 안 됨. 구직자가 매번 새로 증명.',
    solution: [
      '과제 수행 이력 = NCS 영역별 깊이 데이터',
      '구인자는 이력 대신 "이 사람의 정보통신 0201 영역 깊이" 확인',
      '세그먼트가 축적될수록 광고·서비스 확장성 기하급수 (당근 메타포)',
    ],
    tags: ['도메인 지도', '세그먼트', '장기 자산'],
  },
];

export function TechMoat() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {MOATS.map((m) => (
        <div
          key={m.n}
          className="flex flex-col gap-4 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-6"
        >
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-[36px] font-bold tabular leading-none text-[color:var(--color-neutral-300)]">
                {m.n}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-primary)]">
                {m.label}
              </span>
            </div>
          </div>

          <h3 className="text-[20px] font-bold leading-tight text-[color:var(--color-neutral-800)]">
            {m.title}
          </h3>

          <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-[color:var(--color-neutral-50)] p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-error)]">
              경쟁사 한계
            </div>
            <div className="mt-1 text-[14px] leading-[1.55] text-[color:var(--color-neutral-700)]">
              {m.challenge}
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary-light)] p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
              우리 방식
            </div>
            <ul className="mt-2 space-y-1.5">
              {m.solution.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-[14px] leading-[1.55] text-[color:var(--color-neutral-800)]"
                >
                  <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--color-primary)]" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {m.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[12px] font-semibold text-[color:var(--color-neutral-700)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
