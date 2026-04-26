// 8단계 채용 로드맵 — 각 단계마다 [입력 방식] + [자동 산출물] 표시
// ⑥ 직무 과제는 Section B 파이프라인(#deep-dive)으로 anchor 점프 → 클릭 가능 카드

const STEPS = [
  {
    n: '01',
    title: '회사 비전 정의',
    sub: '사업 방향·목표·인력 구조',
    inputs: ['홈페이지 URL 붙여넣기', '직접 작성', '업종 템플릿'],
    output: '목표 3 · 핵심가치 5',
    actor: '경영진',
    refs: ['L5'],
  },
  {
    n: '02',
    title: '팀 목표 도출',
    sub: '비전 → 팀 산출물 분해',
    inputs: ['①에서 자동 제안', '팀 리더 보완'],
    output: 'OKR · 분기 KPI',
    actor: '팀 리더',
    refs: ['L5'],
  },
  {
    n: '03',
    title: '포지션 역설계',
    sub: '필요 역할을 전략에서 도출',
    inputs: ['②에서 자동 제안', '역할 재정의'],
    output: '직무 목록 + 우선순위',
    actor: 'TA + 경영진',
    refs: ['L5'],
  },
  {
    n: '04',
    title: '역량 설계 (KSA)',
    sub: 'NCS + SHL UCF 매핑',
    inputs: ['③직무 선택', '자동 매핑 결과 조정'],
    output: 'KSA 3축 + 가중치',
    actor: '시스템 + HR',
    refs: ['L1', 'L3', 'L4'],
  },
  {
    n: '05',
    title: 'JD 통합·생성',
    sub: '기존 JD + AI 초안 · 삼각측량',
    inputs: ['기존 JD 업로드', 'AI 자동 생성', 'Diff 머지 + 공정성 flag'],
    output: '통합 JD + NCS back-link',
    actor: '시스템 + 현업 SME',
    refs: ['L1', 'L6'],
  },
  {
    n: '06',
    title: '직무 과제',
    sub: '입사 후 30일 축소 (= RJP)',
    inputs: ['JD 선택 → 시나리오', '루브릭 자동'],
    output: '과제 + S~D 채점표',
    actor: '구직자',
    refs: ['L1', 'L2', 'L4'],
    highlight: true,
    href: '#deep-dive',
    cta: '파이프라인 보기 →',
  },
  {
    n: '07',
    title: '팀핏 + DNA 인터뷰',
    sub: '컬처핏 + 팀핏 분리 검증',
    inputs: ['팀 선택 → 질문 생성', 'STAR 면접'],
    output: '적합도 스코어카드',
    actor: 'TA + 팀',
    refs: ['L3', 'L5'],
  },
  {
    n: '08',
    title: '공정성 검증',
    sub: '4/5 Rule + 데이터 누적',
    inputs: ['자동 (수동 개입 X)'],
    output: '편향 리포트 + KPI',
    actor: '시스템',
    refs: ['L1', 'L6'],
    highlight: true,
  },
];

export function Roadmap8Steps() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => {
        const clickable = !!s.href;
        const cardClass =
          'group relative flex flex-col gap-3 rounded-2xl border p-5 transition ' +
          (s.highlight
            ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)]'
            : 'border-[color:var(--color-neutral-100)] bg-white hover:border-[color:var(--color-neutral-300)]') +
          (clickable
            ? ' cursor-pointer hover:shadow-[0_18px_40px_-16px_rgba(0,108,209,0.35)] hover:-translate-y-0.5'
            : '');

        const inner = (
          <>
            {i < STEPS.length - 1 && i % 4 !== 3 && (
              <span
                aria-hidden
                className="pointer-events-none absolute right-[-14px] top-1/2 hidden -translate-y-1/2 text-[20px] font-bold text-[color:var(--color-neutral-300)] lg:block"
              >
                →
              </span>
            )}

            <div className="flex items-baseline justify-between">
              <span
                className={
                  'text-[36px] font-bold tabular leading-none ' +
                  (s.highlight
                    ? 'text-[color:var(--color-primary)]'
                    : 'text-[color:var(--color-neutral-300)]')
                }
              >
                {s.n}
              </span>
              <span
                className={
                  'text-[12px] font-medium ' +
                  (s.highlight
                    ? 'text-[color:var(--color-primary)]'
                    : 'text-[color:var(--color-neutral-500)]')
                }
              >
                {s.actor}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="text-[20px] font-bold leading-tight text-[color:var(--color-neutral-800)]">
                  {s.title}
                </div>
                {clickable && (
                  <span className="rounded-full bg-[color:var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold text-white transition group-hover:translate-x-0.5">
                    LIVE
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[14px] text-[color:var(--color-neutral-500)]">
                {s.sub}
              </div>
            </div>

            <div className="rounded-lg border border-[color:var(--color-neutral-100)] bg-white/70 p-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
                입력 방식
              </div>
              <ul className="mt-1 space-y-0.5">
                {s.inputs.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-1.5 text-[13px] text-[color:var(--color-neutral-700)]"
                  >
                    <span className="mt-1.5 inline-block h-1 w-1 flex-none rounded-full bg-[color:var(--color-neutral-400)]" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={
                'rounded-lg p-2.5 ' +
                (s.highlight
                  ? 'bg-[color:var(--color-primary)] text-white'
                  : 'bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-800)]')
              }
            >
              <div
                className={
                  'text-[10px] font-mono uppercase tracking-wider ' +
                  (s.highlight ? 'text-white/80' : 'text-[color:var(--color-neutral-500)]')
                }
              >
                자동 산출
              </div>
              <div className="mt-0.5 text-[13px] font-semibold">{s.output}</div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {s.refs.map((r) => (
                  <span
                    key={r}
                    className={
                      'rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ' +
                      (s.highlight
                        ? 'bg-white text-[color:var(--color-primary)]'
                        : 'bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-500)]')
                    }
                  >
                    {r}
                  </span>
                ))}
              </div>
              {clickable && s.cta && (
                <span className="text-[12px] font-semibold text-[color:var(--color-primary)] transition group-hover:translate-x-0.5">
                  {s.cta}
                </span>
              )}
            </div>
          </>
        );

        if (clickable) {
          return (
            <a key={s.n} href={s.href} className={cardClass} aria-label={`${s.title} 상세 파이프라인으로 이동`}>
              {inner}
            </a>
          );
        }
        return (
          <div key={s.n} className={cardClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
