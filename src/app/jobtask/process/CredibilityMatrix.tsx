// 6중 공신력 매트릭스 — Light 카드형
// 첨부 4중 (L1~L4) + 신규 L5 조직정렬 + L6 공정성

const LAYERS = [
  {
    id: 'L1',
    color: 'purple',
    title: '법·제도적 근거',
    sub: '국가 표준 — 최상위 공신력',
    items: [
      {
        kind: '법령',
        name: 'NCS 국가직무능력표준 (자격기본법 §19)',
        url: 'www.ncs.go.kr · 한국산업인력공단',
        desc: '대분류 24 → 세분류 1,083 → 능력단위 → 수행준거 + KSA. 직무 평가 기준의 법적 근거.',
      },
      {
        kind: '가이드',
        name: 'NCS 기반 능력중심채용 가이드',
        url: '고용노동부 공식 · 2017~',
        desc: '302개 공기업·공공기관 전면 의무 도입. JD → 직무기술서 → 과제/필기/면접 공식 프로세스.',
      },
      {
        kind: '한국법',
        name: '채용절차의 공정화에 관한 법률',
        url: '법제처',
        desc: '구직자 개인정보 보호 + 채용 차별 금지. 우리 플랫폼이 자동 준수해야 할 한국 기준.',
      },
    ],
  },
  {
    id: 'L2',
    color: 'blue',
    title: '학술적 근거',
    sub: '산업조직심리학 — 최신 메타분석',
    items: [
      {
        kind: '메타 2024',
        name: 'Sackett, Demeke et al. (2024)',
        url: 'Journal of Applied Psychology, 109(5), 687–713',
        desc: 'Schmidt&Hunter 1998 재보정. 기존 r 값 0.10~0.20 하향 필요. WST는 여전히 면접·학력보다 강력한 예측 변수.',
      },
      {
        kind: 'WST 메타',
        name: 'Roth, Bobko & McFarland (2005)',
        url: 'Personnel Psychology',
        desc: 'WST 타당도 r=0.33 (메타분석 업데이트). 첨부 0.54는 7개 연구 기반 구버전.',
      },
      {
        kind: 'RJP 메타',
        name: 'Phillips (1998), Earnest et al. (2011)',
        url: 'AOM Journal · 40 studies meta-analysis',
        desc: 'Realistic Job Preview 제공 시 이직률 12% 평균 감소 (최대 48%). 우리 직무과제 = 자연스러운 RJP.',
      },
      {
        kind: '국내 박사',
        name: '서울대 박주용 (2025)',
        url: 's-space.snu.ac.kr/handle/10371/222215',
        desc: '구성형 과제(논술·시뮬레이션)가 선다형 적성검사 대비 분석적 사고·문제해결·직무수행 예측력 모두 유의미하게 높음.',
      },
    ],
  },
  {
    id: 'L3',
    color: 'teal',
    title: '산업 표준 + 벤치마크',
    sub: '글로벌 + 국내 사례',
    items: [
      {
        kind: '글로벌',
        name: 'SHL Universal Competency Framework (UCF)',
        url: 'shl.com · 20 competencies × 3 categories',
        desc: 'Thinking · Interacting · Achieving 3축. NCS 능력단위와 cross-mapping으로 외국계·MNC 대응.',
      },
      {
        kind: '글로벌',
        name: 'Lominger 67 Competencies',
        url: 'Korn Ferry · 1991',
        desc: '리더십·역량 개발 표준 67개. 직책별 가중치 설계 근거.',
      },
      {
        kind: '국내',
        name: '인터엑스 KEY ENGINE 1·2·3',
        url: '조직 전략 미팅 · 사전과제 · 구조화 검증',
        desc: '"채용은 현업 요청 X, 조직 전략의 산출물" — 비즈니스 설계자 모델.',
      },
      {
        kind: '국내',
        name: '카카오 블라인드 코딩테스트, 위메프 콜드콜, 데이트팝 JD 과제',
        url: '각 기업 기술블로그',
        desc: '국내 대기업·스타트업의 실제 직무과제 운영 사례.',
      },
    ],
  },
  {
    id: 'L4',
    color: 'amber',
    title: '실무 방법론',
    sub: 'KSA + 루브릭 + STAR + 캘리브레이션',
    items: [
      {
        kind: '평가',
        name: 'STAR (Situation·Task·Action·Result)',
        url: 'DDI · MIT CAPD',
        desc: '구조화 행동면접 표준. SHRM 2025: 구조화가 비구조화 대비 2배 정확.',
      },
      {
        kind: '평가',
        name: 'S/A/B/C/D 5등급 × KSA 가중치 루브릭',
        url: '위펀(WEFUN) · 클랩(CLAP) · Prism',
        desc: '직책별 가중치 → 등급 환산. Inter-rater Reliability 0.85 이상 목표.',
      },
      {
        kind: '평가',
        name: '평가자 캘리브레이션',
        url: '인사 실무 표준',
        desc: '복수 평가자 채점 → 편차 0.5 이상 시 합의 회의. 단일 평가자 편향 제거.',
      },
    ],
  },
  {
    id: 'L5',
    color: 'green',
    title: '조직 정렬 (NEW)',
    sub: '인터엑스 비즈니스 설계자 모델',
    items: [
      {
        kind: 'KEY 1',
        name: '조직 전략 미팅 구조화',
        url: '매주 30분 경영진 ↔ TA',
        desc: '현업 요청 전에 TA가 먼저 제안. 사업 방향·목표·인력 구조 분석 → 포지션 역설계.',
      },
      {
        kind: 'KEY 2',
        name: '채용–온보딩–성장 통합 여정',
        url: '인터엑스 채용 검증 3원칙',
        desc: '"서류·면접 중심 판단 최소화, 실제 업무 맥락에서 검증, 통합 여정 설계."',
      },
      {
        kind: 'KEY 3',
        name: 'IX DNA 우선검증 (핵심가치 12)',
        url: '인터엑스 사례',
        desc: '스킬보다 DNA 먼저 — 2차 면접에서 별도 검증. 우리 모델: 팀핏 + 컬처핏 분리.',
      },
    ],
  },
  {
    id: 'L6',
    color: 'red',
    title: '공정성 + 윤리 (NEW)',
    sub: 'EEOC + 한국 채용절차법',
    items: [
      {
        kind: 'EEOC',
        name: '4/5 Rule (80% Rule)',
        url: 'EEOC Uniform Guidelines',
        desc: '보호집단 선발률이 다수집단의 80% 미만이면 차별 가능성. 자동 모니터링.',
      },
      {
        kind: 'EEOC',
        name: 'AI Adverse Impact Guidance (2023)',
        url: 'eeoc.gov · Title VII 책임',
        desc: 'AI 채용 도구도 차별 책임. 우리 평가 알고리즘은 편향 검증 통과 필수.',
      },
      {
        kind: '한국법',
        name: '채용절차의 공정화에 관한 법률',
        url: '법제처 · 2014 시행',
        desc: '개인정보 최소 수집, 차별 금지, 채용 비용 청구 금지. 우리 플랫폼 default 준수.',
      },
      {
        kind: '윤리',
        name: '데이터 누적 → 자체 KPI 공시',
        url: '플랫폼 자체 약속',
        desc: '인용된 r 값을 자체 데이터로 검증·갱신. 매년 채용 후 성과 예측력 공개.',
      },
    ],
  },
];

const COLOR_CLASSES: Record<string, { border: string; bg: string; tag: string; sub: string }> = {
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    tag: 'bg-purple-100 text-purple-700',
    sub: 'text-purple-600',
  },
  blue: {
    border: 'border-[color:var(--color-primary)]/20',
    bg: 'bg-[color:var(--color-primary-light)]',
    tag: 'bg-white text-[color:var(--color-primary)]',
    sub: 'text-[color:var(--color-primary)]',
  },
  teal: {
    border: 'border-teal-200',
    bg: 'bg-teal-50',
    tag: 'bg-teal-100 text-teal-700',
    sub: 'text-teal-700',
  },
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    tag: 'bg-amber-100 text-amber-800',
    sub: 'text-amber-700',
  },
  green: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    tag: 'bg-emerald-100 text-emerald-700',
    sub: 'text-emerald-700',
  },
  red: {
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    tag: 'bg-rose-100 text-rose-700',
    sub: 'text-rose-700',
  },
};

export function CredibilityMatrix() {
  return (
    <div className="space-y-4">
      {LAYERS.map((layer) => {
        const c = COLOR_CLASSES[layer.color];
        return (
          <div
            key={layer.id}
            className={`overflow-hidden rounded-2xl border ${c.border}`}
          >
            <div className={`flex items-center gap-3 px-6 py-4 ${c.bg}`}>
              <span className={`rounded-md px-2.5 py-1 font-mono text-[12px] font-bold ${c.tag}`}>
                {layer.id}
              </span>
              <div>
                <div className="text-[18px] font-bold text-[color:var(--color-neutral-800)]">
                  {layer.title}
                </div>
                <div className={`text-[13px] font-medium ${c.sub}`}>{layer.sub}</div>
              </div>
            </div>
            <div className="bg-white">
              {layer.items.map((item, i) => (
                <div
                  key={item.name}
                  className={
                    'grid gap-3 px-6 py-4 lg:grid-cols-[180px_1fr] ' +
                    (i < layer.items.length - 1
                      ? 'border-b border-[color:var(--color-neutral-100)]'
                      : '')
                  }
                >
                  <div>
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${c.tag}`}>
                      {item.kind}
                    </span>
                    <div className="mt-1 text-[14px] font-mono text-[color:var(--color-neutral-500)]">
                      {item.url}
                    </div>
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-[color:var(--color-neutral-800)]">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[14px] leading-[1.6] text-[color:var(--color-neutral-700)]">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-6 rounded-2xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 p-5 text-[14px] leading-[1.7] text-[color:var(--color-warning)]">
        <strong className="text-[color:var(--color-neutral-800)]">투명성 안내</strong>
        <p className="mt-1 text-[color:var(--color-neutral-700)]">
          위 출처는 공개 검증 가능한 학술/제도 근거입니다. Schmidt &amp; Hunter (1998) 원본의 r=0.54는
          Sackett et al. (2024) 재분석으로 0.10~0.20 하향 보정이 필요하므로, 본 플랫폼은
          <strong className="text-[color:var(--color-primary)]"> 보수적인 r=0.33 이상</strong>으로
          KPI를 약속하고, 자체 데이터로 매년 갱신·공시합니다.
        </p>
      </div>
    </div>
  );
}
