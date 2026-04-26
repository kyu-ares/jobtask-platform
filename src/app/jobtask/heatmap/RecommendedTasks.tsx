// 구직자 맞춤 추천 과제 — mock
// 실제 구현: 도메인 지도 + 6축 프로필 + 진행중 공고 + 인접 NCS 기반 랭킹

import Link from 'next/link';
import { IconClock } from '@/components/Icon';

const RECS = [
  {
    code: '20010101',
    ncs: '정보통신 · 정보기술전략',
    title: '대기업 DX 전략 제안서 초안 작성',
    from: '한전KDN · 진행중 공고 기반',
    reason: '주력 도메인 · 깊이 Lv 2 → Lv 3',
    time: '3시간',
    difficulty: 'A',
    tags: ['전략', 'DX', 'B2G'],
    tone: 'primary' as const,
  },
  {
    code: '17010101',
    ncs: '화학·바이오 · 화학물질분석',
    title: '신제품 원료 분석 리포트',
    from: '한국화학연구원 · JD 동기화',
    reason: '다음 목표 도메인 · 첫 진입',
    time: '2시간',
    difficulty: 'B',
    tags: ['분석', '리포트', 'QC'],
    tone: 'emerald' as const,
  },
  {
    code: '02020101',
    ncs: '경영·회계·사무 · 경영기획',
    title: '분기 OKR 재설계 시뮬레이션',
    from: 'IBK기업은행 · 진행중 공고',
    reason: '인접 도메인 확장 · 리더십 시그널',
    time: '4시간',
    difficulty: 'A',
    tags: ['OKR', '기획', '리더십'],
    tone: 'neutral' as const,
  },
  {
    code: '20010203',
    ncs: '정보통신 · UX/UI 디자인',
    title: '검색 히트맵 UX 개선 케이스',
    from: '가상 시나리오 (RJP)',
    reason: '주력 도메인의 다른 시나리오',
    time: '3시간',
    difficulty: 'B',
    tags: ['UX', '히트맵', 'Fig'],
    tone: 'primary' as const,
  },
];

const TONE: Record<
  'primary' | 'emerald' | 'neutral',
  { border: string; bg: string; badge: string }
> = {
  primary: {
    border: 'border-[color:var(--color-primary)]/30',
    bg: 'bg-[color:var(--color-primary-light)]',
    badge: 'bg-[color:var(--color-primary)] text-white',
  },
  emerald: {
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-500 text-white',
  },
  neutral: {
    border: 'border-[color:var(--color-neutral-200)]',
    bg: 'bg-white',
    badge: 'bg-[color:var(--color-neutral-700)] text-white',
  },
};

export function RecommendedTasks() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {RECS.map((r) => {
        const t = TONE[r.tone];
        return (
          <Link
            key={r.code + r.title}
            href={`/jobtask/${r.code}`}
            className={`card-lift group flex flex-col gap-3 rounded-2xl border ${t.border} ${t.bg} p-5 transition hover:shadow-[0_18px_40px_-16px_rgba(0,108,209,0.18)]`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-wider text-[color:var(--color-neutral-500)]">
                  NCS {r.code} · {r.ncs}
                </div>
                <h3 className="mt-1 text-[19px] font-bold leading-tight text-[color:var(--color-neutral-800)]">
                  {r.title}
                </h3>
                <div className="mt-0.5 text-[13px] text-[color:var(--color-neutral-500)]">
                  {r.from}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold tabular ${t.badge}`}
              >
                {r.difficulty}
              </span>
            </div>

            <div className="rounded-lg bg-white/70 p-2.5 text-[13px] leading-[1.55]">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
                왜 추천
              </div>
              <div className="mt-0.5 text-[color:var(--color-neutral-700)]">
                {r.reason}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-2 py-0.5 text-[12px] font-medium text-[color:var(--color-neutral-700)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="flex items-center gap-1 font-mono text-[color:var(--color-neutral-500)]">
                  <IconClock size={14} />
                  {r.time}
                </span>
                <span className="font-semibold text-[color:var(--color-primary)] transition group-hover:translate-x-0.5">
                  시작 →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
