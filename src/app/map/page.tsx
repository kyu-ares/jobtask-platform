import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Suspense } from 'react';
import { KoreaMap } from '@/components/KoreaMap';
import { TopBar } from '@/components/TopBar';
import { hasOpenings } from '@/lib/openings/load';
import { loadMapData } from '@/lib/openings/mapStats';

export default function MapPage() {
  const sidoPath = path.join(process.cwd(), 'public', 'korea-sido.geo.json');
  const sggPath = path.join(process.cwd(), 'public', 'korea-sgg.geo.json');
  const dongPath = path.join(process.cwd(), 'public', 'korea-dong.geo.json');
  const sidoGeo = JSON.parse(readFileSync(sidoPath, 'utf8'));
  const sggGeo = JSON.parse(readFileSync(sggPath, 'utf8'));
  const dongGeo = JSON.parse(readFileSync(dongPath, 'utf8'));

  const haveLive = hasOpenings();
  const mapData = haveLive
    ? loadMapData()
    : {
        bySido: {},
        sampleBySido: {},
        totals: { all: 0, active: 0 },
        fetchedAt: null,
      };

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
        <section className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="mb-6">
            <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
              Korea Map · 실시간 공공 채용
            </p>
            <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
              전국 → 시·도 → 시·군·구 → 동·읍·면
            </h1>
            <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
              <strong className="font-semibold text-[color:var(--color-primary)]">
                진행중 {mapData.totals.active.toLocaleString()}건
              </strong>
              {' '}(누적 {mapData.totals.all.toLocaleString()}건 아카이브 · 10년치). 한 번 클릭할 때마다 한 단계씩 좁혀집니다.
            </p>
          </div>

          {!haveLive && (
            <div className="mb-4 rounded-xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 px-4 py-3 text-[15px] text-[color:var(--color-warning)]">
              <code>data/openings.json</code> 이 없습니다. <code>node scripts/fetch-openings-live.mjs</code> 실행 필요.
            </div>
          )}

          <Suspense
            fallback={
              <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-8 text-[16px] text-[color:var(--color-neutral-500)]">
                지도 로딩 중…
              </div>
            }
          >
            <KoreaMap
              sidoGeo={sidoGeo}
              sggGeo={sggGeo}
              dongGeo={dongGeo}
              mapData={mapData}
            />
          </Suspense>
        </section>
      </main>
    </>
  );
}
