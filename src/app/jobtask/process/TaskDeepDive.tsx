// ⑥ 직무과제 5단계 파이프라인 — 와이어프레임 스타일 도식
// JD 파싱 → NCS 매핑 → 시나리오 설계 → 평가 루브릭 → 공신력 레이어
// 각 단계는 입력/처리/출력이 명시된 데이터 플로우 블록

export function TaskDeepDive() {
  return (
    <div className="space-y-5">
      {/* Flowchart — 5단계 파이프라인 전체 도식 */}
      <PipelineFlowchart />

      {/* Step 01 — JD 파싱 */}
      <Step
        n="01"
        title="JD 파싱"
        sub="채용공고에서 동사(주요업무) + 명사(자격요건) 자동 추출"
        tags={['NLP', '정규식', 'JD → Tokens']}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <CodeBlock
            label="INPUT · Raw JD"
            lines={[
              '"B2B 세일즈 리드 채용"',
              '· 기업 공연 파이프라인 구축',
              '· C-level 협상 및 제안서 작성',
              '· 연봉 협의 · 5~7년 경력',
            ]}
          />
          <ArrowCol />
          <div className="grid gap-2">
            <CodeBlock
              label="VERBS · 주요 업무"
              tone="primary"
              lines={['구축하다', '협상하다', '작성하다']}
            />
            <CodeBlock
              label="NOUNS · 자격 요건"
              tone="primary"
              lines={['파이프라인', 'C-level', '제안서', '경력 5–7년']}
            />
          </div>
        </div>
        <TechNote>
          <strong>알고리즘</strong> · 형태소 분석기(Mecab-ko) → POS 태깅 →
          동사/명사 추출 → 불용어 제거 → NCS 수행준거 키워드와 fuzzy match (Jaccard ≥ 0.7)
        </TechNote>
      </Step>

      {/* Step 02 — NCS 매핑 */}
      <Step
        n="02"
        title="NCS 매핑"
        sub="세분류 코드 → 능력단위 → 수행준거 3~5개 선택"
        tags={['NCS 법정 표준', 'Content Validity', 'L1']}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock
            label="LOOKUP · NCS 세분류"
            lines={[
              'job  = "B2B 세일즈"',
              'code = 10020201',
              '└ 능력단위 [8개]',
              '  ├ 10020201_17v3 고객사 발굴',
              '  ├ 10020202_17v3 제안·협상',
              '  └ 10020204_17v3 사후관리',
            ]}
          />
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
              SELECTED · 수행준거 3개 (과제 뼈대)
            </div>
            <ol className="mt-2 space-y-1.5 text-[13px] text-white/90">
              <li>
                <span className="font-mono text-[color:var(--color-sky)]">·</span> 경쟁사 대비
                자사 강점을 분석하여 <strong>전략 방향을 제시할 수 있다</strong>
              </li>
              <li>
                <span className="font-mono text-[color:var(--color-sky)]">·</span> 고객 니즈를
                파악해 <strong>맞춤형 제안서를 작성할 수 있다</strong>
              </li>
              <li>
                <span className="font-mono text-[color:var(--color-sky)]">·</span>{' '}
                <strong>계약 조건을 협상하여 합의에 도달할 수 있다</strong>
              </li>
            </ol>
          </div>
        </div>
        <TechNote>
          <strong>근거</strong> · NCS는 자격기본법 §19에 따른 국가 표준. "~할 수 있다" 형태의
          수행준거는 평가 기준의 <span className="text-[color:var(--color-sky)]">법적 인용</span>
          이 가능한 유일한 구조.
        </TechNote>
      </Step>

      {/* Step 03 — 시나리오 설계 */}
      <Step
        n="03"
        title="시나리오 설계"
        sub="수행준거를 실제 업무 상황으로 변환 (= RJP)"
        tags={['Work Sample Test', 'RJP (AOM meta)', 'L2']}
      >
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-white/45">
            변환 공식 · 수행준거 → 시나리오
          </div>
          <div className="space-y-2 font-mono text-[13px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[color:var(--color-sky)]/15 px-2 py-1 text-[color:var(--color-sky)]">
                [수행준거]
              </span>
              <span className="text-white/50">→</span>
              <span className="rounded bg-white/10 px-2 py-1 text-white">[가상 상황 부여]</span>
              <span className="text-white/50">→</span>
              <span className="rounded bg-white/10 px-2 py-1 text-white">[제약 조건]</span>
              <span className="text-white/50">→</span>
              <span className="rounded bg-[color:var(--color-primary)]/30 px-2 py-1 text-white">
                [산출물 정의]
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CodeBlock
            label="SCENARIO · 시나리오"
            tone="primary"
            lines={[
              '가상 F&B 프랜차이즈',
              '창립 10주년 행사 제안',
              '· 예산 3,000만원',
              '· 300명 규모',
              '· 2주 안 계약',
            ]}
          />
          <CodeBlock
            label="DELIVERABLE · 제출물"
            tone="primary"
            lines={[
              '제안서 초안 (PDF)',
              '파이프라인 접근 플랜',
              '예상 일정표',
              '→ 3시간 내 제출',
            ]}
          />
        </div>
        <TechNote>
          <strong>RJP 효과</strong> · 입사 후 30일 업무를 미리 체험 → Phillips (1998) 메타분석{' '}
          <span className="text-[color:var(--color-sky)]">이직률 평균 −12%</span>, 최대 −48%.
          본질적으로 "과제 = 직무 미리보기".
        </TechNote>
      </Step>

      {/* Step 04 — 평가 루브릭 + Cross-mapping */}
      <Step
        n="04"
        title="평가 루브릭"
        sub="S~D × KSA × STAR · Cross-mapping 기반 평가"
        tags={['STAR (DDI)', 'KSA 가중치', 'Cohen Kappa']}
      >
        {/* Cross-mapping triangle */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-5">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-wider text-white/45">
            Cross-mapping · NCS ⇄ SHL UCF ⇄ Lominger 67
          </div>
          <CrossMappingDiagram />
          <div className="mt-3 rounded-lg bg-white/[0.03] p-3 font-mono text-[12px] leading-[1.7] text-white/80">
            <div>
              <span className="text-[color:var(--color-sky)]">NCS</span> 수행준거 "경쟁사 대비
              자사 강점을 분석하여 전략 방향 제시"
            </div>
            <div className="ml-4">
              <span className="text-white/40">↕</span>{' '}
              <span className="text-[color:var(--color-sky)]">SHL UCF</span> Analysing (#4.3) +
              Creating & Innovating (#5.2)
            </div>
            <div className="ml-4">
              <span className="text-white/40">↕</span>{' '}
              <span className="text-[color:var(--color-sky)]">Lominger</span> Strategic Agility
              (#5) + Problem Solving (#4)
            </div>
          </div>
        </div>

        {/* S~D × KSA 루브릭 표 */}
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr] border-b border-white/10 bg-white/[0.03]">
            <Cell head>등급</Cell>
            <Cell head>
              Knowledge
              <span className="ml-1 font-mono text-[10px] text-white/45">(K)</span>
            </Cell>
            <Cell head>
              Skill
              <span className="ml-1 font-mono text-[10px] text-white/45">(S)</span>
            </Cell>
            <Cell head>
              Attitude
              <span className="ml-1 font-mono text-[10px] text-white/45">(A)</span>
            </Cell>
          </div>
          {[
            ['S', '도메인 지식 완전 + 확장', '문제 접근·논리 구조 탁월', '자기주도 + 협업 신호'],
            ['A', '핵심 지식 견고', '구조 명료 · 실행 가능', '주도적'],
            ['B', '기본 지식 수준', '논리 있으나 공백 있음', '수동적'],
            ['C', '일부 개념 혼동', '구조 부족', '태도 불명확'],
            ['D', '지식 공백 다수', '결과만 나열', '비협업'],
          ].map(([g, k, s, a]) => (
            <div
              key={g}
              className="grid grid-cols-[auto_1fr_1fr_1fr] border-b border-white/5 last:border-0"
            >
              <Cell mono primary>
                {g}
              </Cell>
              <Cell>{k}</Cell>
              <Cell>{s}</Cell>
              <Cell>{a}</Cell>
            </div>
          ))}
        </div>

        {/* KSA 가중치 비교 + STAR */}
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-white/45">
              KSA 가중치 · 직책별 (예시)
            </div>
            <WeightBar label="신입" rows={[['K', 40], ['S', 40], ['A', 20]]} />
            <div className="mt-3" />
            <WeightBar
              label="시니어"
              rows={[
                ['K', 20],
                ['S', 50],
                ['A', 30],
              ]}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-white/45">
              STAR 응답 구조 (DDI)
            </div>
            <ul className="space-y-1.5 font-mono text-[13px] text-white/90">
              {[
                ['S', 'Situation', '어떤 상황이었나'],
                ['T', 'Task', '어떤 역할·과제였나'],
                ['A', 'Action', '실제로 어떻게 했나'],
                ['R', 'Result', '결과가 어땠나'],
              ].map(([c, l, d]) => (
                <li key={c} className="flex items-start gap-2">
                  <span className="rounded bg-[color:var(--color-sky)]/20 px-1.5 py-0.5 text-[11px] font-bold text-[color:var(--color-sky)]">
                    {c}
                  </span>
                  <div>
                    <span className="font-semibold">{l}</span>
                    <span className="ml-2 text-white/60">— {d}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Inter-rater reliability 계산 */}
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-white/45">
            Inter-rater Reliability · Cohen's Kappa κ
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <KappaExample />
            <div className="text-center text-[color:var(--color-sky)]">→</div>
            <div className="rounded-lg bg-white/[0.03] p-3 text-[13px] text-white/90">
              <div className="font-mono text-[11px] text-white/45">해석</div>
              <ul className="mt-1 space-y-0.5">
                <li>
                  <span className="font-mono text-[color:var(--color-sky)]">κ ≥ 0.80</span> 거의
                  완벽 일치 ✓
                </li>
                <li>
                  <span className="font-mono text-white/60">0.60 ≤ κ &lt; 0.80</span> 상당 수준
                </li>
                <li>
                  <span className="font-mono text-[color:var(--color-warning)]">
                    κ &lt; 0.40
                  </span>{' '}
                  재검토 필요
                </li>
              </ul>
              <div className="mt-2 text-[12px] text-white/70">
                편차 0.4 이상 감지 시 자동 재채점 + 3번째 평가자 투입
              </div>
            </div>
          </div>
        </div>

        <TechNote>
          <strong>원칙</strong> · 단일 평가자 편향 제거. 2인 이상 블라인드 채점 → κ 실시간 계산 →
          루브릭이 명확하면 κ 0.80+ 달성 가능.
        </TechNote>
      </Step>

      {/* Step 05 — 공신력 레이어 + 4/5 Rule */}
      <Step
        n="05"
        title="공신력 레이어"
        sub="모든 과제 화면에 출처 자동 렌더 + EEOC 4/5 Rule 검증"
        tags={['L1~L6 자동 출처', 'EEOC 4/5', '한국 채용절차법']}
      >
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-wider text-white/45">
            과제 화면 하단 자동 첨부 (예시)
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3 font-mono text-[12px] leading-[1.7] text-white/85">
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 근거</span> NCS
              10020201_17v3 수행준거
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 역량</span> SHL UCF #4.3 · Lominger
              #5
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 타당도</span> Schmidt & Hunter
              (1998) → Sackett et al. (2024) 재보정 r 0.33+
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 검증</span> 현직자 2명 SME 리뷰
              완료 · κ 0.87
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 공정성</span> EEOC 4/5 Rule 통과
              (성별 0.92, 연령 0.88)
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">▸ 한국법</span> 채용절차의 공정화에
              관한 법률 준수 ✓
            </div>
          </div>
        </div>

        {/* EEOC 4/5 Rule 자동 계산 */}
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-wider text-white/45">
            EEOC 4/5 Rule · Adverse Impact 자동 검증
          </div>
          <FiveFifthsExample />
          <div className="mt-3 rounded-lg bg-[color:var(--color-primary)]/20 p-3 font-mono text-[12px] leading-[1.7] text-white/90">
            <div>
              <span className="text-[color:var(--color-sky)]">// 룰</span> impact_ratio =
              그룹A_합격률 / 최대그룹_합격률
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">// 기준</span> ratio &lt; 0.80 시
              adverse impact 시사
            </div>
            <div>
              <span className="text-[color:var(--color-sky)]">// 대응</span> 자동 flag →
              평가자·루브릭 재검토 · 선발 전 조정
            </div>
          </div>
        </div>

        <TechNote>
          <strong>6중 공신력의 의미</strong> · 출처 단독 인용은 쉽지만, L1 법령 + L2 학술 + L3 산업 +
          L4 실무 + L5 조직정렬 + L6 공정성이{' '}
          <span className="text-[color:var(--color-sky)]">한 과제 화면에 동시에</span> 자동 첨부되는
          플랫폼은 현재 국내외 거의 없음. 이게 기술 장벽.
        </TechNote>
      </Step>
    </div>
  );
}

/* ---------- shared components ---------- */

function Step({
  n,
  title,
  sub,
  tags,
  children,
}: {
  n: string;
  title: string;
  sub: string;
  tags: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
      <header className="mb-5 flex flex-col gap-2 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-[48px] font-bold tabular leading-none text-[color:var(--color-sky)]">
              {n}
            </span>
            <h3 className="text-[22px] font-bold text-white">{title}</h3>
          </div>
          <p className="mt-1 text-[14px] text-white/70">{sub}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[color:var(--color-sky)]/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-[color:var(--color-sky)]"
            >
              {t}
            </span>
          ))}
        </div>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CodeBlock({
  label,
  lines,
  tone,
}: {
  label: string;
  lines: string[];
  tone?: 'primary';
}) {
  return (
    <div
      className={
        'rounded-xl border p-4 ' +
        (tone === 'primary'
          ? 'border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10'
          : 'border-white/10 bg-black/30')
      }
    >
      <div
        className={
          'mb-2 text-[11px] font-mono uppercase tracking-wider ' +
          (tone === 'primary' ? 'text-[color:var(--color-sky)]' : 'text-white/45')
        }
      >
        {label}
      </div>
      <ul className="space-y-0.5 font-mono text-[12.5px] text-white/90">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function ArrowCol() {
  return (
    <div className="hidden flex-col items-center justify-center lg:flex">
      <span className="font-mono text-[32px] text-[color:var(--color-sky)]">→</span>
      <span className="text-[11px] font-mono text-white/40">parse</span>
    </div>
  );
}

function TechNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[color:var(--color-sky)]/20 bg-[color:var(--color-sky)]/5 px-4 py-3 text-[13px] leading-[1.6] text-white/85">
      {children}
    </div>
  );
}

function Cell({
  children,
  head,
  mono,
  primary,
}: {
  children: React.ReactNode;
  head?: boolean;
  mono?: boolean;
  primary?: boolean;
}) {
  return (
    <div
      className={
        'border-r border-white/5 px-3 py-2 text-[13px] last:border-0 ' +
        (head
          ? 'font-mono text-[11px] font-semibold uppercase tracking-wider text-white/60'
          : 'text-white/85') +
        (mono ? ' font-mono font-bold' : '') +
        (primary ? ' bg-[color:var(--color-primary)]/15 text-[color:var(--color-sky)]' : '')
      }
    >
      {children}
    </div>
  );
}

function WeightBar({
  label,
  rows,
}: {
  label: string;
  rows: [string, number][];
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-semibold text-white/90">{label}</span>
        <span className="font-mono text-white/50">합 100%</span>
      </div>
      <div className="flex h-7 overflow-hidden rounded-md">
        {rows.map(([k, p], i) => (
          <div
            key={k}
            className={
              'flex items-center justify-center font-mono text-[11px] font-bold text-white ' +
              [
                'bg-[color:var(--color-primary)]/70',
                'bg-[color:var(--color-sky)]/70',
                'bg-white/20',
              ][i]
            }
            style={{ width: `${p}%` }}
          >
            {k} {p}%
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineFlowchart() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-sky)]">
          System Flowchart · Task Pipeline
        </div>
        <div className="font-mono text-[11px] text-white/45">
          input → 5 stages → output
        </div>
      </div>

      <svg viewBox="0 0 1200 440" className="w-full h-auto" aria-label="Task pipeline flowchart">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#7CC8FF" />
          </marker>
          <marker id="arrow-dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,0.25)" />
          </marker>
          <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124,200,255,0.12)" />
            <stop offset="100%" stopColor="rgba(0,108,209,0.2)" />
          </linearGradient>
        </defs>

        {/* === Top row: External data sources === */}
        <text x="600" y="22" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(255,255,255,0.45)" letterSpacing="0.1em">
          EXTERNAL SOURCES
        </text>

        {[
          { x: 120, label: '채용공고 API', sub: '기재부 OpenAPI' },
          { x: 340, label: 'NCS 법령 DB', sub: '1,083 세분류' },
          { x: 560, label: 'SHL UCF · Lominger', sub: 'L3 글로벌 프레임' },
          { x: 780, label: 'EEOC · 채용절차법', sub: 'L6 공정성' },
          { x: 1000, label: '현직자 SME', sub: 'κ ≥ 0.80 검증' },
        ].map((s) => (
          <g key={s.label}>
            <rect
              x={s.x - 90}
              y={40}
              width={180}
              height={44}
              rx={6}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.12)"
            />
            <text x={s.x} y={58} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#ffffff" fontWeight="600">
              {s.label}
            </text>
            <text x={s.x} y={74} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">
              {s.sub}
            </text>
          </g>
        ))}

        {/* === Feed-in dashed lines from sources to stages === */}
        {[
          { from: 120, to: 150 },
          { from: 340, to: 370 },
          { from: 560, to: 590 },
          { from: 780, to: 810 },
          { from: 1000, to: 1030 },
        ].map((l, i) => (
          <path
            key={i}
            d={`M ${l.from} 84 L ${l.to} 188`}
            stroke="rgba(124,200,255,0.3)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
        ))}

        {/* === Main pipeline nodes === */}
        {[
          { x: 60, n: '①', title: 'JD 파싱', io: 'verbs + nouns', proc: 'POS tag · fuzzy match' },
          { x: 280, n: '②', title: 'NCS 매핑', io: '수행준거 3–5', proc: 'lookup · §19 인용' },
          { x: 500, n: '③', title: '시나리오 설계', io: '30일 축소 RJP', proc: '상황·제약·산출물' },
          { x: 720, n: '④', title: '평가 루브릭', io: 'S~D × KSA × STAR', proc: 'cross-map · κ 0.87' },
          { x: 940, n: '⑤', title: '공신력 레이어', io: '6중 출처 + 4/5', proc: 'EEOC · impact ratio' },
        ].map((node, i) => {
          const isOut = i === 4;
          return (
            <g key={node.n}>
              <rect
                x={node.x}
                y={188}
                width={180}
                height={96}
                rx={10}
                fill={isOut ? 'rgba(0,108,209,0.35)' : 'url(#nodeGrad)'}
                stroke={isOut ? '#7CC8FF' : 'rgba(124,200,255,0.5)'}
                strokeWidth={isOut ? 2 : 1.2}
              />
              <text
                x={node.x + 14}
                y={218}
                fontSize="28"
                fontFamily="monospace"
                fill="#7CC8FF"
                fontWeight="700"
              >
                {node.n}
              </text>
              <text
                x={node.x + 50}
                y={218}
                fontSize="14"
                fill="#ffffff"
                fontWeight="700"
              >
                {node.title}
              </text>
              <line
                x1={node.x + 14}
                y1={232}
                x2={node.x + 166}
                y2={232}
                stroke="rgba(124,200,255,0.2)"
                strokeWidth="1"
              />
              <text
                x={node.x + 14}
                y={250}
                fontSize="10"
                fontFamily="monospace"
                fill="rgba(124,200,255,0.8)"
              >
                I/O · {node.io}
              </text>
              <text
                x={node.x + 14}
                y={268}
                fontSize="10"
                fontFamily="monospace"
                fill="rgba(255,255,255,0.55)"
              >
                fn · {node.proc}
              </text>
            </g>
          );
        })}

        {/* === Horizontal arrows between stages === */}
        {[
          { x1: 240, x2: 280, y: 236, label: 'tokens' },
          { x1: 460, x2: 500, y: 236, label: 'codes' },
          { x1: 680, x2: 720, y: 236, label: 'scenario' },
          { x1: 900, x2: 940, y: 236, label: 'matrix' },
        ].map((a) => (
          <g key={a.label}>
            <line
              x1={a.x1}
              y1={a.y}
              x2={a.x2 - 4}
              y2={a.y}
              stroke="#7CC8FF"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <text
              x={(a.x1 + a.x2) / 2}
              y={a.y - 6}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="rgba(124,200,255,0.7)"
              fontStyle="italic"
            >
              {a.label}
            </text>
          </g>
        ))}

        {/* === Output row: final artifacts === */}
        <text x="600" y="334" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(255,255,255,0.45)" letterSpacing="0.1em">
          FINAL ARTIFACTS
        </text>

        {[
          { x: 300, title: '직무 과제 화면', sub: '지원자 제출' },
          { x: 600, title: '루브릭 + 평가자 대시보드', sub: 'S~D 채점' },
          { x: 900, title: '6중 공신력 리포트', sub: 'NCS + 학술 + 4/5' },
        ].map((a) => (
          <g key={a.title}>
            <rect
              x={a.x - 120}
              y={352}
              width={240}
              height={52}
              rx={8}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(124,200,255,0.4)"
            />
            <text x={a.x} y={372} textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="600">
              {a.title}
            </text>
            <text x={a.x} y={390} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(255,255,255,0.6)">
              {a.sub}
            </text>
          </g>
        ))}

        {/* Output feed arrows */}
        {[
          { from: 150, to: 300 },
          { from: 590, to: 600 },
          { from: 1030, to: 900 },
        ].map((l, i) => (
          <path
            key={i}
            d={`M ${l.from} 288 L ${l.to} 350`}
            stroke="rgba(124,200,255,0.45)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrow-dim)"
          />
        ))}

        {/* Loopback — 데이터 누적 */}
        <path
          d="M 1120 236 Q 1170 236 1170 420 Q 1170 430 20 430 Q 10 430 10 236 Q 10 236 60 236"
          stroke="rgba(124,200,255,0.25)"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
          markerEnd="url(#arrow-dim)"
        />
        <text x="600" y="426" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(124,200,255,0.55)" fontStyle="italic">
          데이터 누적 · 자체 r 값 갱신 (연 1회 공시)
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[11px] text-white/55">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[color:var(--color-sky)]/30" />
          외부 데이터 소스
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-3"
            style={{
              background: 'linear-gradient(180deg, rgba(124,200,255,0.12), rgba(0,108,209,0.2))',
              border: '1px solid rgba(124,200,255,0.5)',
            }}
          />
          5단계 파이프라인
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[1px] w-5 bg-[color:var(--color-sky)]" />
          실선 · 데이터 흐름
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[1px] w-5" style={{ backgroundImage: 'linear-gradient(90deg, rgba(124,200,255,0.4) 50%, transparent 0)', backgroundSize: '6px 1px' }} />
          점선 · 피드인·피드백
        </span>
      </div>
    </div>
  );
}

function CrossMappingDiagram() {
  return (
    <svg
      viewBox="0 0 720 280"
      className="w-full h-auto"
      aria-label="Cross-mapping diagram"
    >
      {/* 삼각 라인 */}
      <line x1="120" y1="80" x2="360" y2="220" stroke="#7CC8FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      <line x1="600" y1="80" x2="360" y2="220" stroke="#7CC8FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
      <line x1="120" y1="80" x2="600" y2="80" stroke="#7CC8FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

      {/* 중앙 NCS 노드 */}
      <g>
        <rect x="260" y="190" width="200" height="60" rx="8" fill="#006CD1" stroke="#7CC8FF" strokeWidth="1.5" />
        <text x="360" y="212" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#7CC8FF" fontWeight="600">
          L1 · NCS (법정 표준)
        </text>
        <text x="360" y="232" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="600">
          수행준거 10020201_17v3
        </text>
      </g>

      {/* 좌측 SHL */}
      <g>
        <rect x="20" y="50" width="200" height="60" rx="8" fill="rgba(255,255,255,0.05)" stroke="#7CC8FF" strokeWidth="1" />
        <text x="120" y="72" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#7CC8FF" fontWeight="600">
          L3 · SHL UCF (글로벌 20)
        </text>
        <text x="120" y="92" textAnchor="middle" fontSize="12" fill="#fff">
          Analysing (#4.3)
        </text>
      </g>

      {/* 우측 Lominger */}
      <g>
        <rect x="500" y="50" width="200" height="60" rx="8" fill="rgba(255,255,255,0.05)" stroke="#7CC8FF" strokeWidth="1" />
        <text x="600" y="72" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#7CC8FF" fontWeight="600">
          L3 · Lominger 67
        </text>
        <text x="600" y="92" textAnchor="middle" fontSize="12" fill="#fff">
          Strategic Agility (#5)
        </text>
      </g>

      {/* 화살표 방향 표시 */}
      <text x="200" y="150" fontSize="16" fill="#7CC8FF" opacity="0.6">↕</text>
      <text x="510" y="150" fontSize="16" fill="#7CC8FF" opacity="0.6">↕</text>
      <text x="360" y="40" textAnchor="middle" fontSize="16" fill="#7CC8FF" opacity="0.6">↕</text>

      {/* 타이틀 */}
      <text x="360" y="20" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#ffffff" opacity="0.5">
        하나의 역량 · 세 체계에 의해 증명
      </text>
    </svg>
  );
}

function KappaExample() {
  return (
    <div className="rounded-lg bg-black/40 p-3 font-mono text-[11.5px] leading-[1.7] text-white/85">
      <div className="text-white/50">평가자 A · B · 30명 채점 결과</div>
      <div className="mt-2 grid grid-cols-[auto_repeat(5,1fr)] gap-px text-center">
        <div className="bg-white/5 px-2 py-1 text-white/45">A \ B</div>
        {['S', 'A', 'B', 'C', 'D'].map((g) => (
          <div key={g} className="bg-white/5 px-2 py-1 text-[color:var(--color-sky)]">
            {g}
          </div>
        ))}
        {[
          ['S', 4, 1, 0, 0, 0],
          ['A', 1, 6, 1, 0, 0],
          ['B', 0, 1, 7, 1, 0],
          ['C', 0, 0, 1, 5, 0],
          ['D', 0, 0, 0, 0, 2],
        ].map(([g, ...row], ri) => (
          <div key={ri as number} className="contents">
            <div className="bg-white/5 px-2 py-1 text-[color:var(--color-sky)]">
              {g as string}
            </div>
            {(row as number[]).map((v, ci) => (
              <div
                key={ci}
                className={
                  'px-2 py-1 ' +
                  (ri === ci ? 'bg-[color:var(--color-primary)]/30 text-white font-bold' : 'bg-white/[0.02] text-white/70')
                }
              >
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-0.5 text-white/80">
        <div>
          <span className="text-white/45">p_o = (4+6+7+5+2) / 30 =</span>{' '}
          <span className="text-[color:var(--color-sky)]">0.800</span>
        </div>
        <div>
          <span className="text-white/45">p_e ≈</span> 0.236
        </div>
        <div>
          <span className="text-white/45">κ =</span> (0.800 − 0.236) / (1 − 0.236) ={' '}
          <span className="text-[color:var(--color-sky)] font-bold">0.74</span>
        </div>
      </div>
    </div>
  );
}

function FiveFifthsExample() {
  const groups = [
    { name: '그룹 A (기준)', total: 100, passed: 60, rate: 0.6, ratio: 1.0 },
    { name: '그룹 B', total: 100, passed: 55, rate: 0.55, ratio: 0.92 },
    { name: '그룹 C', total: 100, passed: 42, rate: 0.42, ratio: 0.7 },
  ];
  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const fail = g.ratio < 0.8;
        return (
          <div
            key={g.name}
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[12.5px] font-mono text-white/85"
          >
            <div>{g.name}</div>
            <div className="text-white/60">
              {g.passed}/{g.total}
            </div>
            <div className="tabular text-white">{(g.rate * 100).toFixed(0)}%</div>
            <div
              className={
                'rounded px-2 py-0.5 text-[11px] font-bold ' +
                (fail
                  ? 'bg-[color:var(--color-error)]/20 text-[color:var(--color-error)]'
                  : 'bg-[color:var(--color-success)]/20 text-[color:var(--color-success)]')
              }
            >
              ratio {g.ratio.toFixed(2)} {fail ? '✗ FLAG' : '✓'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
