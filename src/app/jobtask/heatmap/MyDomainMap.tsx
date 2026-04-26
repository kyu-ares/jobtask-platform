// 구직자 상단 요약 — 내 도메인 지도 (현재 mock, 추후 유저 프로필 연결)
// 도메인 당근마켓 비전: 과제 누적 = 도메인 깊이 데이터

'use client';

import { IconFlame } from '@/components/Icon';

const MOCK = {
  userName: '김지원',
  completed: 3,
  inProgress: 1,
  avgScore: 'A−',
  topDomain: { code: '20', name: '정보통신', depth: 2 },
  nextGoal: '화학·바이오 (17) 영역 첫 과제',
  streakDays: 7,
  // 대분류별 내가 수행한 과제 수 (sparkline 느낌)
  domainHeatmap: [
    { code: '02', name: '경영·회계', count: 1 },
    { code: '08', name: '문화·예술', count: 0 },
    { code: '14', name: '건설', count: 0 },
    { code: '15', name: '기계', count: 0 },
    { code: '17', name: '화학·바이오', count: 0, next: true },
    { code: '19', name: '전기·전자', count: 0 },
    { code: '20', name: '정보통신', count: 2, top: true },
    { code: '23', name: '환경·에너지', count: 0 },
  ],
};

export function MyDomainMap() {
  const maxCount = Math.max(...MOCK.domainHeatmap.map((d) => d.count), 1);
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* 좌: 프로필 요약 */}
      <div className="rounded-2xl border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary-light)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[18px] font-bold text-white">
            {MOCK.userName[0]}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
              {MOCK.userName}님의 도메인 지도
            </div>
            <div className="flex items-center gap-1 text-[13px] text-[color:var(--color-neutral-500)]">
              <IconFlame size={13} className="text-[color:var(--color-neutral-500)]" />
              {MOCK.streakDays}일 연속 수행 중
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={MOCK.completed} label="완료" />
          <Stat value={MOCK.inProgress} label="진행중" accent />
          <Stat value={MOCK.avgScore} label="평균" />
        </div>

        <div className="mt-4 rounded-xl bg-white p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-neutral-500)]">
            주력 도메인
          </div>
          <div className="mt-0.5 text-[16px] font-bold text-[color:var(--color-neutral-800)]">
            {MOCK.topDomain.code} {MOCK.topDomain.name}
          </div>
          <div className="text-[13px] text-[color:var(--color-neutral-500)]">
            깊이 <strong>Lv {MOCK.topDomain.depth}</strong> · 과제 2개 누적
          </div>
        </div>

        <div className="mt-2 rounded-xl bg-white/70 p-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--color-primary)]">
            다음 목표
          </div>
          <div className="mt-0.5 text-[14px] font-semibold text-[color:var(--color-neutral-800)]">
            {MOCK.nextGoal}
          </div>
        </div>
      </div>

      {/* 우: 대분류 heatmap 바 */}
      <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <div className="text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
              NCS 대분류별 경험 분포
            </div>
            <div className="text-[13px] text-[color:var(--color-neutral-500)]">
              채운 칸 = 도메인 지도. 비어있는 영역 = 다음 탐험 기회
            </div>
          </div>
          <span className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[12px] font-semibold text-[color:var(--color-neutral-600)]">
            24 대분류 중 2개 진입
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {MOCK.domainHeatmap.map((d) => {
            const filled = d.count > 0;
            const intensity = d.count / maxCount;
            const bg = filled
              ? `rgba(0, 108, 209, ${0.2 + intensity * 0.8})`
              : 'rgba(0, 0, 0, 0.03)';
            return (
              <div
                key={d.code}
                className={
                  'group relative rounded-lg border px-2 py-3 transition ' +
                  (d.top
                    ? 'border-[color:var(--color-primary)] ring-1 ring-[color:var(--color-primary)]/40'
                    : d.next
                    ? 'border-[color:var(--color-primary)] border-dashed'
                    : 'border-[color:var(--color-neutral-100)]')
                }
                style={{ background: bg }}
                title={`${d.name} · 과제 ${d.count}개`}
              >
                <div
                  className={
                    'font-mono text-[10px] ' +
                    (filled
                      ? 'text-white font-semibold'
                      : 'text-[color:var(--color-neutral-500)]')
                  }
                >
                  {d.code}
                </div>
                <div
                  className={
                    'mt-0.5 text-[12px] font-semibold leading-tight ' +
                    (filled ? 'text-white' : 'text-[color:var(--color-neutral-700)]')
                  }
                >
                  {d.name}
                </div>
                <div
                  className={
                    'mt-1 text-[11px] font-mono ' +
                    (filled ? 'text-white/80' : 'text-[color:var(--color-neutral-500)]')
                  }
                >
                  {d.count > 0 ? `${d.count}개 완료` : d.next ? '다음 도전 →' : '—'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-[12px] leading-[1.5] text-[color:var(--color-neutral-500)]">
          구인자는 이 지도를 기반으로 <strong>도메인 + 깊이 데이터</strong>를 확인합니다. 이력서 대신 일로 증명된 프로필.
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        'rounded-lg px-3 py-2 ' + (accent ? 'bg-white' : 'bg-white/60')
      }
    >
      <div
        className={
          'text-[22px] font-bold tabular leading-none ' +
          (accent
            ? 'text-[color:var(--color-primary)]'
            : 'text-[color:var(--color-neutral-800)]')
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[color:var(--color-neutral-500)]">
        {label}
      </div>
    </div>
  );
}
