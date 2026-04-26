// 4단계 구직자 성장 루프 — 시각적 사이클 (select → do → feedback → refine)

import { IconTarget, IconZap, IconChart, IconRefresh, IconLoop } from '@/components/Icon';

const STEPS = [
  {
    n: '01',
    Icon: IconTarget,
    title: '선택',
    sub: '관심 직무를 히트맵에서',
    detail: 'NCS 세분류 셀 클릭 → 진행중 공고 3개 중 택1',
    time: '1분',
  },
  {
    n: '02',
    Icon: IconZap,
    title: '수행',
    sub: 'AI가 JD 기반 과제 설계',
    detail: '입사 후 30일 업무 축소 · 제약 명시 · 시간 타이머',
    time: '2–4시간',
  },
  {
    n: '03',
    Icon: IconChart,
    title: '피드백',
    sub: 'S~D × KSA 루브릭 + 해설',
    detail: 'STAR 구조 · 다중 평가자 κ ≥ 0.80 검증',
    time: '24시간 내',
  },
  {
    n: '04',
    Icon: IconRefresh,
    title: '보완',
    sub: '약점 영역 추천 과제로 재도전',
    detail: '같은 NCS 세분류의 다른 시나리오 자동 생성',
    time: '반복 가능',
  },
];

export function LearningLoop() {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className="relative flex flex-col gap-2 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 transition hover:border-[color:var(--color-primary)] hover:shadow-[0_18px_40px_-16px_rgba(0,108,209,0.2)]"
          >
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute right-[-14px] top-1/2 hidden -translate-y-1/2 text-[20px] font-bold text-[color:var(--color-neutral-300)] lg:block"
              >
                →
              </span>
            )}

            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-700)]">
                  <s.Icon size={22} />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-neutral-500)]">
                  STEP {s.n}
                </span>
              </div>
              <span className="rounded-full bg-[color:var(--color-primary-light)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-primary)]">
                {s.time}
              </span>
            </div>

            <div className="text-[22px] font-bold leading-tight text-[color:var(--color-neutral-800)]">
              {s.title}
            </div>
            <div className="text-[15px] font-medium text-[color:var(--color-primary)]">
              {s.sub}
            </div>
            <div className="text-[13px] leading-[1.55] text-[color:var(--color-neutral-700)]">
              {s.detail}
            </div>
          </div>
        ))}
      </div>

      {/* 루프 안내 */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-light)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-primary)]">
        <IconLoop size={16} />
        <span>
          04 → 01로 다시 · 루프가 돌 때마다 도메인 지도 +1칸, 평균 점수 재계산
        </span>
      </div>
    </div>
  );
}
