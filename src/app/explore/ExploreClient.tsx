'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ActiveFilterChips, FilterBar } from '@/components/FilterBar';
import { matches } from '@/lib/filters/match';
import { useFilters } from '@/lib/filters/useFilters';

interface FlatJob {
  code: string;
  name: string;
  unitCount: number;
  lclas: string;
  lclasCode: string;
  mclas: string;
  sclas: string;
}

const PAGE = 60;

export function ExploreClient({
  jobs,
  lclasOpenings,
}: {
  jobs: FlatJob[];
  lclasOpenings: Record<string, number>;
}) {
  const { filter } = useFilters();
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    return jobs.filter((j) => matches(j.code, filter));
  }, [jobs, filter]);

  // 매칭된 직무들의 NCS 대분류 set → 그 대분류들의 진행중 공고 수 합산
  const matchedLclasSet = useMemo(() => {
    const s = new Set<string>();
    for (const j of filtered) s.add(j.lclasCode);
    return s;
  }, [filtered]);

  const matchedOpeningsCount = useMemo(() => {
    let n = 0;
    for (const c of matchedLclasSet) n += lclasOpenings[c] ?? 0;
    return n;
  }, [matchedLclasSet, lclasOpenings]);

  const totalOpenings = useMemo(
    () => Object.values(lclasOpenings).reduce((a, b) => a + b, 0),
    [lclasOpenings]
  );

  const lclasSummary = useMemo(() => {
    const map = new Map<string, { code: string; name: string; n: number; openings: number }>();
    for (const j of filtered) {
      const cur = map.get(j.lclasCode) ?? {
        code: j.lclasCode,
        name: j.lclas,
        n: 0,
        openings: lclasOpenings[j.lclasCode] ?? 0,
      };
      cur.n += 1;
      map.set(j.lclasCode, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.openings - a.openings);
  }, [filtered, lclasOpenings]);

  // 액티브 필터 → /openings 진입 시 ncs 파라미터로 전달
  const openingsHref = useMemo(() => {
    const ncsCodes = Array.from(matchedLclasSet).sort();
    if (ncsCodes.length === 0 || ncsCodes.length === 24) return '/openings?status=active';
    return `/openings?status=active&ncs=${ncsCodes.join(',')}`;
  }, [matchedLclasSet]);

  return (
    <div className="space-y-5">
      <FilterBar />
      <ActiveFilterChips />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Side summary */}
        <aside className="space-y-4">
          {/* 매칭 카운트 — 두 단위 동시 표시 */}
          <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-4">
            <div className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--color-neutral-500)]">
              필터 적용 결과
            </div>

            {/* NCS 직무 카탈로그 */}
            <div className="rounded-xl border border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-50)] p-3">
              <div className="text-[13px] font-medium text-[color:var(--color-neutral-500)]">
                NCS 직무 (분류 체계)
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold tabular text-[color:var(--color-neutral-800)]">
                  {filtered.length.toLocaleString()}
                </span>
                <span className="text-[13px] text-[color:var(--color-neutral-500)]">
                  / {jobs.length.toLocaleString()}개
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-neutral-100)]">
                <div
                  className="h-full rounded-full bg-[color:var(--color-neutral-700)] transition-[width]"
                  style={{
                    width: `${Math.max(2, (filtered.length / jobs.length) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1 text-[12px] text-[color:var(--color-neutral-500)]">
                정의된 직무 종류 (정적 분류)
              </div>
            </div>

            {/* 진행중 채용공고 */}
            <div className="mt-3 rounded-xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary-light)] p-3">
              <div className="text-[13px] font-semibold text-[color:var(--color-primary)]">
                진행중 채용공고 (실시간)
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-[28px] font-bold tabular text-[color:var(--color-primary)]">
                  {matchedOpeningsCount.toLocaleString()}
                </span>
                <span className="text-[13px] text-[color:var(--color-neutral-500)]">
                  / {totalOpenings.toLocaleString()}건
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-primary-subtle)]">
                <div
                  className="h-full rounded-full bg-[color:var(--color-primary)] transition-[width]"
                  style={{
                    width: `${Math.max(2, totalOpenings > 0 ? (matchedOpeningsCount / totalOpenings) * 100 : 0)}%`,
                  }}
                />
              </div>
              <Link
                href={openingsHref}
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
              >
                공고 보기 →
              </Link>
            </div>

            <div className="mt-3 text-[11px] leading-[1.5] text-[color:var(--color-neutral-500)]">
              직무 = 분류 체계의 정적 정의 (1,083 카탈로그)<br />
              공고 = OpenAPI 실시간 라이브 (오늘 지원 가능)
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-4">
            <div className="mb-2 text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
              대분류 분포 (직무 / 공고)
            </div>
            <ol className="space-y-1.5">
              {lclasSummary.slice(0, 10).map((g) => (
                <li
                  key={g.code}
                  className="flex items-center gap-2 text-[14px] text-[color:var(--color-neutral-700)]"
                >
                  <span className="font-semibold tabular text-[color:var(--color-neutral-500)]">
                    {g.code}
                  </span>
                  <span className="flex-1 truncate">{g.name}</span>
                  <span className="font-medium tabular text-[color:var(--color-neutral-700)]">
                    {g.n.toLocaleString()}
                  </span>
                  <span className="font-semibold tabular text-[color:var(--color-primary)]">
                    · {g.openings.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* Result grid */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-10 text-center">
              <div className="text-[20px] font-semibold text-[color:var(--color-neutral-700)]">
                매칭되는 직무가 없습니다
              </div>
              <div className="mt-2 text-[15px] text-[color:var(--color-neutral-500)]">
                필터를 일부 해제해 보세요.
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, shown).map((j) => {
                  const openings = lclasOpenings[j.lclasCode] ?? 0;
                  return (
                    <Link
                      key={j.code}
                      href={`/jobs/${j.code}`}
                      className="card-lift group flex flex-col gap-1 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-5 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold tabular text-[color:var(--color-neutral-500)] group-hover:text-[color:var(--color-primary)]">
                          {j.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="rounded-full bg-[color:var(--color-neutral-50)] px-2 py-0.5 text-[12px] font-medium text-[color:var(--color-neutral-700)] tabular">
                            능력단위 {j.unitCount}
                          </span>
                          {openings > 0 && (
                            <span className="rounded-full bg-[color:var(--color-primary-light)] px-2 py-0.5 text-[12px] font-semibold text-[color:var(--color-primary)] tabular">
                              공고 {openings.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[18px] font-semibold leading-tight text-[color:var(--color-neutral-800)]">
                        {j.name}
                      </div>
                      <div className="text-[14px] text-[color:var(--color-neutral-500)]">
                        {j.lclas} › {j.mclas} › {j.sclas}
                      </div>
                    </Link>
                  );
                })}
              </div>
              {shown < filtered.length && (
                <button
                  type="button"
                  onClick={() => setShown((s) => s + PAGE)}
                  className="w-full rounded-2xl border-[1.5px] border-[color:var(--color-primary)] bg-white py-4 text-[16px] font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary-light)]"
                >
                  더 불러오기 · {Math.min(PAGE, filtered.length - shown).toLocaleString()}개
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
