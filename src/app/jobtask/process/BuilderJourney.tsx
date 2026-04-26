// 구인자 여정 — 가상 스타트업 "블레이버스"가 8단계를 거치는 인터랙티브 미리보기
// 각 단계마다 실제 입력 필드 + 시스템 응답 + 자동 산출물 목업

const JOURNEY = [
  {
    n: '01',
    title: '회사 비전 정의',
    persona: '창업자 · CEO',
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            입력 방법
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button className="rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] px-3 py-1 text-[12px] font-semibold text-[color:var(--color-primary)]">
              홈페이지 URL
            </button>
            <button className="rounded-full border border-[color:var(--color-neutral-300)] bg-white px-3 py-1 text-[12px] text-[color:var(--color-neutral-700)]">
              직접 작성
            </button>
            <button className="rounded-full border border-[color:var(--color-neutral-300)] bg-white px-3 py-1 text-[12px] text-[color:var(--color-neutral-700)]">
              업종 템플릿
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-[color:var(--color-neutral-300)] bg-[color:var(--color-neutral-50)] px-3 py-2">
            <span className="text-[12px] font-mono text-[color:var(--color-neutral-500)]">
              https://
            </span>
            <span className="flex-1 text-[13px] text-[color:var(--color-neutral-800)]">
              blaybus.com
            </span>
            <button className="rounded-md bg-[color:var(--color-primary)] px-2.5 py-0.5 text-[11px] font-semibold text-white">
              분석 →
            </button>
          </div>
        </div>
        <OutputCard
          title="자동 산출"
          rows={[
            ['미션', '밴드를 위한 지속 가능한 수익 구조'],
            ['핵심 가치', '예술성 · 지속성 · 연결 · 실험'],
            ['주력 사업', 'B2B 기업 공연 + 아티스트 매칭'],
            ['인력 구조', '현 8명 · 내년 15명 (성장 +87%)'],
          ]}
        />
      </div>
    ),
  },
  {
    n: '02',
    title: '팀 목표 도출',
    persona: 'TA · 팀 리더',
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary-light)] p-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
              ①에서 자동 제안
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-[13px] text-[color:var(--color-neutral-800)]">
            <div>· 기업 공연팀 신설 — Q3 런칭</div>
            <div>· 아티스트 풀 200→500 확장</div>
            <div>· 매칭 전환율 25% → 40%</div>
          </div>
          <button className="mt-2 text-[11px] font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline">
            + 팀 리더 보완
          </button>
        </div>
        <OutputCard
          title="OKR 자동 구성"
          rows={[
            ['O', '2026 Q3 B2B 공연 10개 체결'],
            ['KR1', '영업 파이프라인 50개'],
            ['KR2', '평균 계약 단가 800만원'],
            ['KR3', '재계약률 60%'],
          ]}
        />
      </div>
    ),
  },
  {
    n: '03',
    title: '포지션 역설계',
    persona: 'TA + 경영진',
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            ②에서 자동 도출된 필요 직무
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              ['B2B 세일즈 리드', '즉시', '우선순위 1'],
              ['공연 PM', 'Q3 전', '우선순위 2'],
              ['아티스트 매칭 PM', 'Q4', '우선순위 3'],
            ].map(([role, when, rank]) => (
              <div
                key={role}
                className="flex items-center justify-between rounded-md bg-[color:var(--color-neutral-50)] px-2.5 py-1.5"
              >
                <span className="text-[13px] font-semibold">{role}</span>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-[color:var(--color-primary-light)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-primary)]">
                    {when}
                  </span>
                  <span className="text-[11px] text-[color:var(--color-neutral-500)]">
                    {rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <OutputCard
          title="Q3 채용 로드맵 확정"
          rows={[
            ['우선 채용', 'B2B 세일즈 리드 1명'],
            ['채용 기간', '3주 (과제 1주 포함)'],
            ['예산', '연봉 6,000만 · 사인온 500만'],
          ]}
        />
      </div>
    ),
  },
  {
    n: '04',
    title: '역량 설계 (KSA)',
    persona: '시스템 자동 + HR 확인',
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            NCS × SHL UCF 자동 매핑
          </div>
          <div className="mt-2 grid gap-1.5">
            <KSARow axis="지식 (K)" weight={30} items="B2B 세일즈 프로세스 · CRM" />
            <KSARow axis="기술 (S)" weight={50} items="제안서 · 협상 · 파이프라인" primary />
            <KSARow axis="태도 (A)" weight={20} items="장기적 관계 · 데이터 기반 의사결정" />
          </div>
        </div>
        <OutputCard
          title="필요 역량 프로파일"
          rows={[
            ['NCS 코드', '10020201 (기업영업 - B2B 판매)'],
            ['SHL UCF', 'Achieving · Interacting'],
            ['경력', '경력 3–7년 (민수)'],
          ]}
        />
      </div>
    ),
  },
  {
    n: '05',
    title: 'JD 통합·생성',
    persona: '시스템 + 현업 SME',
    mockup: (
      <div className="space-y-3">
        {/* 입력 소스 선택 */}
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            JD 소스 · 3가지 (복수 선택 가능)
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button className="rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] px-3 py-1 text-[12px] font-semibold text-[color:var(--color-primary)]">
              ✓ 기존 JD 업로드
            </button>
            <button className="rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] px-3 py-1 text-[12px] font-semibold text-[color:var(--color-primary)]">
              ✓ AI 자동 생성
            </button>
            <button className="rounded-full border border-[color:var(--color-neutral-300)] bg-white px-3 py-1 text-[12px] text-[color:var(--color-neutral-700)]">
              업종 템플릿
            </button>
          </div>
        </div>

        {/* Diff 병합 뷰 */}
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
              Diff 머지 · 체크박스로 선택
            </div>
            <span className="rounded-full bg-[color:var(--color-success)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--color-success)]">
              원문 68% 보존
            </span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {/* 기존 JD */}
            <div className="rounded bg-[color:var(--color-neutral-50)] p-2">
              <div className="mb-1 text-[10px] font-semibold text-[color:var(--color-neutral-500)]">
                기존 JD (현업 작성)
              </div>
              <div className="space-y-1 text-[12px] text-[color:var(--color-neutral-800)]">
                <label className="flex items-start gap-1.5">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>기업 공연 영업 전반 담당</span>
                </label>
                <label className="flex items-start gap-1.5">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>공연 기획팀과 협업</span>
                </label>
                <label className="flex items-start gap-1.5 opacity-60">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-[color:var(--color-error)] line-through">
                    남성 선호 · 35세 이하
                  </span>
                  <span className="rounded bg-[color:var(--color-error)]/10 px-1 text-[10px] font-bold text-[color:var(--color-error)]">
                    차별
                  </span>
                </label>
              </div>
            </div>
            {/* AI 초안 */}
            <div className="rounded bg-[color:var(--color-primary-light)] p-2">
              <div className="mb-1 text-[10px] font-semibold text-[color:var(--color-primary)]">
                AI 초안 (NCS 기반)
              </div>
              <div className="space-y-1 text-[12px] text-[color:var(--color-neutral-800)]">
                <label className="flex items-start gap-1.5">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>파이프라인 구축 · 계약 체결</span>
                </label>
                <label className="flex items-start gap-1.5">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>C-level 협상 · 제안서 작성</span>
                </label>
                <label className="flex items-start gap-1.5">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>사후관리 · 재계약 (NCS 10020204)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <OutputCard
          title="통합 JD 확정 (NCS back-link · 공정성 리포트)"
          rows={[
            ['원문 보존율', '68%'],
            ['차별 표현 감지', '1건 제거 (35세 이하)'],
            ['NCS 수행준거', '10020201 · 10020202 · 10020204'],
            ['SME 승인', '필수 (자동 확정 X)'],
          ]}
          highlight
        />
      </div>
    ),
  },
  {
    n: '06',
    title: '직무 과제 생성',
    persona: '구직자 실제 수행',
    primary: true,
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
            자동 생성된 과제 (입사 30일 축소)
          </div>
          <div className="mt-2 text-[13px] leading-[1.55] text-[color:var(--color-neutral-800)]">
            <div className="font-semibold">
              · 시나리오 · 가상 F&B 프랜차이즈 창립 10주년 행사 제안
            </div>
            <div className="mt-1 text-[color:var(--color-neutral-700)]">
              예산 3,000만 · 300명 규모 · 2주 안에 계약 성사해야 합니다. 파이프라인 접근 방식과
              제안서 초안을 제출하세요.
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
              <div className="rounded bg-white px-2 py-1">
                <span className="text-[color:var(--color-neutral-500)]">시간</span>{' '}
                <strong>3시간</strong>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <span className="text-[color:var(--color-neutral-500)]">자료</span>{' '}
                <strong>가상 CRM 제공</strong>
              </div>
              <div className="rounded bg-white px-2 py-1">
                <span className="text-[color:var(--color-neutral-500)]">산출</span>{' '}
                <strong>제안서 + 전략</strong>
              </div>
            </div>
          </div>
        </div>
        <OutputCard
          title="루브릭 자동 생성 (S~D × KSA)"
          rows={[
            ['S', '문제 접근 + 논리 구조 + 실행 가능성 모두 충족'],
            ['A', '2/3 충족'],
            ['B', '1/3 충족'],
            ['C', '부분적 이해만 드러남'],
          ]}
          highlight
        />
      </div>
    ),
  },
  {
    n: '07',
    title: '팀핏 + DNA 인터뷰',
    persona: 'TA + 팀 멤버',
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-neutral-200)] bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            자동 생성된 STAR 질문 (팀핏)
          </div>
          <div className="mt-2 space-y-1.5 text-[13px] text-[color:var(--color-neutral-800)]">
            <div>
              <strong>S</strong> · 마감 임박 공연 계약이 깨질 뻔한 상황
            </div>
            <div>
              <strong>T</strong> · 어떤 역할을 했나요?
            </div>
            <div>
              <strong>A</strong> · 구체적으로 어떤 행동을?
            </div>
            <div>
              <strong>R</strong> · 결과 + 배운 점
            </div>
          </div>
        </div>
        <OutputCard
          title="적합도 스코어카드"
          rows={[
            ['직무 스킬', 'A (과제 점수 기반)'],
            ['팀핏', 'A — 실행력·협업 매치'],
            ['DNA (핵심가치)', 'B+ — 실험 점수 높음'],
            ['권고', '✓ 최종 면접 추천'],
          ]}
        />
      </div>
    ),
  },
  {
    n: '08',
    title: '공정성 검증',
    persona: '시스템 자동',
    primary: true,
    mockup: (
      <div className="space-y-3">
        <div className="rounded-lg border border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
            EEOC 4/5 Rule 자동 리포트
          </div>
          <div className="mt-2 space-y-1 text-[13px] text-[color:var(--color-neutral-800)]">
            <div className="flex items-center justify-between">
              <span>성별 선발률 균형</span>
              <span className="font-mono font-semibold text-[color:var(--color-success)]">
                0.92 ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>연령대 균형</span>
              <span className="font-mono font-semibold text-[color:var(--color-success)]">
                0.88 ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>학력 편향</span>
              <span className="font-mono font-semibold text-[color:var(--color-success)]">
                0.95 ✓
              </span>
            </div>
          </div>
        </div>
        <OutputCard
          title="자체 KPI 누적"
          rows={[
            ['과제 점수 → 6개월 성과 상관', 'r 0.41'],
            ['채용 후 6개월 리텐션', '94%'],
            ['평균 채용 기간', '1주 → 과제 포함 3주'],
          ]}
          highlight
        />
      </div>
    ),
  },
];

function OutputCard({
  title,
  rows,
  highlight,
}: {
  title: string;
  rows: [string, string][];
  highlight?: boolean;
}) {
  return (
    <div
      className={
        'rounded-lg border p-3 ' +
        (highlight
          ? 'border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary-light)]/60'
          : 'border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-50)]')
      }
    >
      <div
        className={
          'mb-1.5 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider ' +
          (highlight
            ? 'text-[color:var(--color-primary)]'
            : 'text-[color:var(--color-neutral-500)]')
        }
      >
        <span className="inline-block h-1 w-1 rounded-full bg-current" />
        {title}
      </div>
      <div className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 text-[13px]">
            <span className="flex-none font-semibold text-[color:var(--color-neutral-500)]">
              {k}
            </span>
            <span className="text-right text-[color:var(--color-neutral-800)]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KSARow({
  axis,
  weight,
  items,
  primary,
}: {
  axis: string;
  weight: number;
  items: string;
  primary?: boolean;
}) {
  return (
    <div
      className={
        'rounded-md px-2.5 py-1.5 ' +
        (primary
          ? 'bg-[color:var(--color-primary-light)]'
          : 'bg-[color:var(--color-neutral-50)]')
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            'text-[12px] font-semibold ' +
            (primary
              ? 'text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-neutral-700)]')
          }
        >
          {axis}
        </span>
        <span className="font-mono text-[11px] tabular text-[color:var(--color-neutral-500)]">
          {weight}%
        </span>
      </div>
      <div className="mt-0.5 text-[12px] text-[color:var(--color-neutral-700)]">{items}</div>
    </div>
  );
}

export function BuilderJourney() {
  return (
    <div className="space-y-4">
      {JOURNEY.map((step, i) => (
        <div
          key={step.n}
          className={
            'rounded-2xl border p-6 ' +
            (step.primary
              ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)]/40'
              : 'border-[color:var(--color-neutral-100)] bg-white')
          }
        >
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* 좌: step info */}
            <div>
              <div className="flex items-baseline gap-3">
                <span
                  className={
                    'text-[48px] font-bold tabular leading-none ' +
                    (step.primary
                      ? 'text-[color:var(--color-primary)]'
                      : 'text-[color:var(--color-neutral-300)]')
                  }
                >
                  {step.n}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-neutral-500)]">
                  STEP {i + 1} / {JOURNEY.length}
                </span>
              </div>
              <h3 className="mt-3 text-[22px] font-bold leading-tight text-[color:var(--color-neutral-800)]">
                {step.title}
              </h3>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-neutral-50)] px-3 py-1 text-[12px] font-semibold text-[color:var(--color-neutral-700)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
                </svg>
                {step.persona}
              </div>
            </div>

            {/* 우: mockup */}
            <div>{step.mockup}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
