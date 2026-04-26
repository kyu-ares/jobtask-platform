import { Suspense } from 'react';
import { loadNcsTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { AxisInfographic } from '@/components/AxisInfographic';
import { ExploreClient } from './ExploreClient';
import { hasOpenings, loadOpenings, openingIsActive } from '@/lib/openings/load';
import { loadPlatformStats } from '@/lib/openings/stats';

interface FlatJob {
  code: string;
  name: string;
  unitCount: number;
  lclas: string;
  lclasCode: string;
  mclas: string;
  sclas: string;
}

function flatten(): FlatJob[] {
  const tree = loadNcsTree();
  const out: FlatJob[] = [];
  for (const l of tree.lclas) {
    for (const m of l.mclas) {
      for (const s of m.sclas) {
        for (const d of s.subd) {
          out.push({
            code: d.code,
            name: d.name,
            unitCount: d.unitCount,
            lclas: l.name,
            lclasCode: l.code,
            mclas: m.name,
            sclas: s.name,
          });
        }
      }
    }
  }
  return out;
}

// NCS 대분류 코드별 진행중 채용공고 수 사전 집계 (lite payload, 24 entry)
function activeByLclas(): Record<string, number> {
  if (!hasOpenings()) return {};
  const all = loadOpenings();
  const m: Record<string, number> = {};
  for (const o of all) {
    if (!openingIsActive(o)) continue;
    for (const c of o.ncs) m[c] = (m[c] ?? 0) + 1;
  }
  return m;
}

export default function ExplorePage() {
  const jobs = flatten();
  const lclasOpenings = activeByLclas();
  const stats = hasOpenings() ? loadPlatformStats() : null;

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
        <section className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="mb-6">
            <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
              Explore · 다축 탐색
            </p>
            <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
              직무 카탈로그를 6개 축으로 좁히기
            </h1>
            <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
              <strong className="text-[color:var(--color-neutral-800)]">NCS 직무 {jobs.length.toLocaleString()}개</strong>
              {' '}(분류 체계의 모든 세분류) 중 6개 축에 부합하는 직무를 찾고,
              {stats && (
                <>
                  {' '}각 직무의 <strong className="text-[color:var(--color-primary)]">진행중 공고 {stats.active.toLocaleString()}건</strong>으로 바로 진입.
                </>
              )}
            </p>
          </div>

          <div className="mb-6">
            <AxisInfographic />
          </div>

          <Suspense
            fallback={
              <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-8 text-[16px] text-[color:var(--color-neutral-500)]">
                로딩 중…
              </div>
            }
          >
            <ExploreClient jobs={jobs} lclasOpenings={lclasOpenings} />
          </Suspense>
        </section>
      </main>
    </>
  );
}
