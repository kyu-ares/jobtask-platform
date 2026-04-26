import Link from 'next/link';
import { loadNcsTree, isSeedTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { hasOpenings } from '@/lib/openings/load';
import { loadPlatformStats } from '@/lib/openings/stats';

export default function Home() {
  const tree = loadNcsTree();
  const seed = isSeedTree();
  const haveLive = hasOpenings();
  const stats = haveLive ? loadPlatformStats() : null;

  return (
    <>
      <TopBar />
      <main className="bg-white">
        {/* HERO */}
        <section className="bg-hero-light relative border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-light)] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              <span className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                국가직무능력표준 · {stats?.year ?? 2026}
              </span>
            </div>
            <h1 className="max-w-3xl text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[56px]">
              <span className="block">{tree.summary.subd.toLocaleString()}개의 직무를</span>
              <span className="block text-[color:var(--color-primary)]">한 화면에서 본다.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)] sm:text-[20px]">
              NCS 4계층 분류 — {tree.summary.lclas} 대분류, {tree.summary.mclas} 중분류,{' '}
              {tree.summary.sclas} 소분류, {tree.summary.subd.toLocaleString()} 세분류 직무.
              {stats && (
                <>
                  {' '}오늘 지원 가능한 공공채용 공고는{' '}
                  <strong className="font-semibold text-[color:var(--color-primary)]">
                    {stats.active.toLocaleString()}건
                  </strong>{' '}({stats.instActive}개 기관).
                </>
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/openings?status=active"
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-7 py-4 text-[17px] font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                진행중 공고 보기
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-7 py-4 text-[17px] font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary-light)]"
              >
                6개 축으로 탐색
              </Link>
            </div>
          </div>
        </section>

        {seed && (
          <div className="border-b border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 px-6 py-3 text-center text-[15px] text-[color:var(--color-warning)]">
            시드 모드 · 24개 대분류만 로드됨. 큐넷 키 활성화 후 전체 트리 동기화 예정.
          </div>
        )}

        {/* STATS — 4단계 통일 기준 */}
        {stats && (
          <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
            <div className="mx-auto max-w-[1200px] px-6 py-20">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                플랫폼 데이터 · 통일 기준
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
                지금 무엇이 살아있나
              </h2>
              <p className="mt-2 text-[16px] text-[color:var(--color-neutral-500)]">
                4단계 카운트로 데이터를 명확히 분리합니다. 모든 화면 기본은 <strong>진행중</strong>.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BigStat
                  rank={1}
                  highlight
                  topLabel="오늘 지원 가능"
                  value={stats.active}
                  unit="건"
                  bottom={`${stats.instActive}개 기관 채용중`}
                  description="모든 화면 기본 카운트"
                />
                <BigStat
                  rank={2}
                  topLabel={`${stats.year}년 등록`}
                  value={stats.thisYear}
                  unit="건"
                  bottom={`${stats.instThisYear}개 기관`}
                  description="올해 새로 올라온 공고"
                />
                <BigStat
                  rank={3}
                  topLabel="누적 공고"
                  value={stats.total}
                  unit="건"
                  bottom={`${stats.instTotal}개 기관 (10년치)`}
                  description="2016~현재 아카이브 (분석용)"
                />
                <BigStat
                  rank={4}
                  topLabel="NCS 직무"
                  value={tree.summary.subd}
                  unit="개"
                  bottom={`${tree.summary.units.toLocaleString()}개 능력단위`}
                  description={`${tree.summary.lclas} 대분류 → ${tree.summary.mclas} 중분류`}
                />
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 text-[14px] leading-[1.6] text-[color:var(--color-neutral-700)] sm:grid-cols-2">
                <div>
                  <strong className="text-[color:var(--color-primary)]">왜 카운트가 다른가</strong>
                  <p className="mt-1 text-[color:var(--color-neutral-500)]">
                    OpenAPI는 공공기관이 등록한 모든 채용공고를 시점 무관 누적으로 제공합니다 (109K = 10년치).
                    그중 오늘 마감일이 안 지난 라이브 공고만 진행중으로 분류.
                  </p>
                </div>
                <div>
                  <strong className="text-[color:var(--color-primary)]">기준 통일 정책</strong>
                  <p className="mt-1 text-[color:var(--color-neutral-500)]">
                    모든 시각화/지도/리스트 기본 모드 = 진행중 ({stats.active.toLocaleString()}).
                    누적·올해는 토글 또는 분석 차트에서 사용.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY GRID */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-24">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                  대분류 {tree.summary.lclas}
                </p>
                <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
                  관심 영역에서 시작하기
                </h2>
              </div>
              <Link
                href="/treemap"
                className="hidden text-[15px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] sm:inline"
              >
                히트맵으로 보기 →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tree.lclas.map((l) => (
                <Link
                  key={l.code}
                  href={`/categories/${l.code}`}
                  className="card-lift group flex flex-col gap-2 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-5 py-5"
                >
                  <span className="text-[15px] font-semibold tabular text-[color:var(--color-neutral-500)] group-hover:text-[color:var(--color-primary)]">
                    {l.code}
                  </span>
                  <span className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">
                    {l.name}
                  </span>
                  {l.mclas.length > 0 && (
                    <span className="mt-auto text-[15px] text-[color:var(--color-neutral-500)]">
                      중분류 {l.mclas.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function BigStat({
  rank,
  topLabel,
  value,
  unit,
  bottom,
  description,
  highlight,
}: {
  rank: number;
  topLabel: string;
  value: number;
  unit: string;
  bottom: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        'flex flex-col gap-1.5 rounded-2xl border px-5 py-5 ' +
        (highlight
          ? 'border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary-light)]'
          : 'border-[color:var(--color-neutral-100)] bg-white')
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            'text-[14px] font-semibold ' +
            (highlight ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-neutral-500)]')
          }
        >
          {topLabel}
        </span>
        <span
          className={
            'flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold tabular ' +
            (highlight
              ? 'bg-[color:var(--color-primary)] text-white'
              : 'bg-[color:var(--color-neutral-100)] text-[color:var(--color-neutral-500)]')
          }
        >
          {rank}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={
            'text-[36px] font-bold tabular leading-none ' +
            (highlight ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-neutral-800)]')
          }
        >
          {value.toLocaleString()}
        </span>
        <span className="text-[15px] text-[color:var(--color-neutral-500)]">{unit}</span>
      </div>
      <div className="text-[14px] font-medium text-[color:var(--color-neutral-700)]">{bottom}</div>
      <div className="text-[12px] text-[color:var(--color-neutral-500)]">{description}</div>
    </div>
  );
}
