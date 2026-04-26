import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadNcsTree, isSeedTree } from '@/lib/ncs/data';
import { loadKsicTree } from '@/lib/ksic/data';
import { loadTrackTree } from '@/lib/track/data';
import { Heatmap } from '@/components/Heatmap';
import { TopBar } from '@/components/TopBar';
import { CategoryPicker } from '@/components/CategoryPicker';
import { MyDomainMap } from './MyDomainMap';
import { LearningLoop } from './LearningLoop';
import { RecommendedTasks } from './RecommendedTasks';
import { IconBulb } from '@/components/Icon';

export const metadata = {
  title: '직무 과제 히트맵 · NCS Jobtask',
  description:
    'NCS 1,083개 직무 중 내가 성장할 분야를 찾고, AI 설계 과제로 실전 경험을 쌓기',
};

type SP = { lclas?: string; mclas?: string };

export default async function JobtaskHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const tree = loadNcsTree();
  const ksicTree = loadKsicTree();
  const trackTree = loadTrackTree();
  const seed = isSeedTree();
  const sp = await searchParams;
  const focusLclas = sp.lclas && /^\d{2}$/.test(sp.lclas) ? sp.lclas : undefined;
  const focusMclas = sp.mclas && /^\d{4}$/.test(sp.mclas) ? sp.mclas : undefined;

  // 유효성: focus 코드가 실제 NCS에 있는지 + 계층 일치
  const lclasNode = focusLclas ? tree.lclas.find((l) => l.code === focusLclas) : null;
  const mclasNode =
    focusMclas && lclasNode
      ? lclasNode.mclas.find((m) => m.code === focusMclas)
      : null;
  if (focusLclas && !lclasNode) notFound();
  if (focusMclas && !mclasNode) notFound();

  // drill level: 0(전체) / 1(대분류) / 2(중분류)
  const level = mclasNode ? 2 : lclasNode ? 1 : 0;

  // URL 빌더 (그룹/셀 클릭 시 href)
  function buildHref(patch: { lclas?: string | null; mclas?: string | null }) {
    const p = new URLSearchParams();
    const nextLclas = patch.lclas === undefined ? focusLclas : patch.lclas ?? undefined;
    const nextMclas = patch.mclas === undefined ? focusMclas : patch.mclas ?? undefined;
    if (nextLclas) p.set('lclas', nextLclas);
    if (nextMclas) p.set('mclas', nextMclas);
    const qs = p.toString();
    return qs ? `/jobtask/heatmap?${qs}` : '/jobtask/heatmap';
  }

  // 레벨별 동작:
  // Level 0 — 그루핑 lclas(그룹=대분류) × 셀=중분류 → 그룹 클릭 = 대분류 drill, 셀 클릭 = 대분류 drill(셀의 상위 대분류)
  // Level 1 — 그루핑 mclas(그룹=중분류) × 셀=소분류 → 그룹 클릭 = 중분류 drill, 셀 클릭 = 중분류 drill(셀 상위 중분류)
  // Level 2 — 그루핑 sclas(그룹=소분류) × 셀=세분류 → 셀 클릭 = /jobtask/{세분류코드} 상세

  // pattern 문자열 (server → client 경계 통과)
  const leafHrefPattern =
    level === 0
      ? '/jobtask/heatmap?lclas={group}'
      : level === 1
      ? `/jobtask/heatmap?lclas=${focusLclas}&mclas={group}`
      : undefined;

  const groupHrefPattern =
    level === 0
      ? '/jobtask/heatmap?lclas={group}'
      : level === 1
      ? `/jobtask/heatmap?lclas=${focusLclas}&mclas={group}`
      : undefined;

  return (
    <>
      <TopBar />
      <main className="bg-white">
        {/* HERO */}
        <section className="bg-hero-light border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-light)] px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
                  <span className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                    Jobtask Heatmap · 구직자 성장 루프
                  </span>
                </div>
                <h1 className="text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[52px]">
                  <span className="block">내 직무 우주에서</span>
                  <span className="block text-[color:var(--color-primary)]">
                    한 칸씩 채워나간다
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)]">
                  NCS {tree.summary.subd.toLocaleString()}개 직무 중 관심 분야를 찾고,
                  실제 채용 JD 기반 <strong className="text-[color:var(--color-primary)]">AI 설계 과제</strong>를 수행하고,
                  루브릭 피드백으로 보완하세요. 매 과제가 내 <strong className="text-[color:var(--color-primary)]">도메인 지도</strong>에 누적됩니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/track/heatmap"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-neutral-300)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  Job Track →
                </Link>
                <Link
                  href="/jobtask/process"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-light)]"
                >
                  설계 로직 보기 →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* VIEW TOGGLE + PICKER */}
        <section className="border-b border-[color:var(--color-neutral-100)] bg-white">
          <div className="mx-auto max-w-[1400px] px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2 text-[14px]">
                <span className="font-semibold text-[color:var(--color-neutral-500)] mr-2">
                  관점
                </span>
                <span className="rounded-full bg-[color:var(--color-primary-light)] px-3.5 py-1 font-semibold text-[color:var(--color-primary)]">
                  NCS {tree.summary.lclas} ← 현재
                </span>
                <Link
                  href="/industry/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  KSIC 21
                </Link>
                <Link
                  href="/track/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  Job Track {trackTree.summary.lclas}
                </Link>
                <Link
                  href="/occupation/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  KECO 10
                </Link>
              </div>
              <div className="ml-auto">
                <CategoryPicker trackTree={trackTree} ksicTree={ksicTree} />
              </div>
            </div>
          </div>
        </section>

        {seed && (
          <div className="border-b border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 px-6 py-2.5 text-center text-[14px] text-[color:var(--color-warning)]">
            시드 모드 · NCS 트리 미완 상태. 전체 데이터 로드 후 히트맵이 정상 표시됩니다.
          </div>
        )}

        {/* MY DOMAIN MAP */}
        <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-10">
            <MyDomainMap />
          </div>
        </section>

        {/* LEARNING LOOP */}
        <section className="bg-white border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-16">
            <div className="mb-8 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Learning Loop
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                과제 하나 = 도메인 한 칸
              </h2>
              <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                선택 → 수행 → 피드백 → 보완. 루프가 돌 때마다 내 지도가 두꺼워집니다.
              </p>
            </div>
            <LearningLoop />
          </div>
        </section>

        {/* HEATMAP — Drill-down */}
        <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1400px] px-6 py-16">
            <div className="mb-4">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                NCS 히트맵 · 3단계 Drill-Down
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                {level === 0
                  ? '어느 직무부터 해볼까'
                  : level === 1
                  ? `${lclasNode?.name} · 중분류로 좁혀보기`
                  : `${mclasNode?.name} · 세분류 직무 선택`}
              </h2>
              <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                {level === 0
                  ? '대분류 그룹 또는 중분류 셀을 클릭하면 다음 단계로 좁혀집니다.'
                  : level === 1
                  ? '중분류 그룹 헤더 또는 소분류 셀을 클릭하면 세분류 히트맵이 열립니다.'
                  : '세분류 셀을 클릭하면 AI가 이 직무의 실전 과제를 설계합니다.'}
              </p>
            </div>

            {/* Breadcrumb + 상위로 이동 */}
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
              <Link
                href="/jobtask/heatmap"
                scroll={false}
                className={
                  level === 0
                    ? 'font-semibold text-[color:var(--color-primary)]'
                    : 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
                }
              >
                전체 24 대분류
              </Link>
              {lclasNode && (
                <>
                  <span className="text-[color:var(--color-neutral-300)]">/</span>
                  <Link
                    href={buildHref({ lclas: focusLclas, mclas: null })}
                    scroll={false}
                    className={
                      level === 1
                        ? 'font-semibold text-[color:var(--color-primary)]'
                        : 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
                    }
                  >
                    <span className="font-mono text-[12px] text-[color:var(--color-neutral-400)] mr-1">
                      {lclasNode.code}
                    </span>
                    {lclasNode.name}
                  </Link>
                </>
              )}
              {mclasNode && (
                <>
                  <span className="text-[color:var(--color-neutral-300)]">/</span>
                  <span className="font-semibold text-[color:var(--color-primary)]">
                    <span className="font-mono text-[12px] text-[color:var(--color-primary)]/70 mr-1">
                      {mclasNode.code}
                    </span>
                    {mclasNode.name}
                  </span>
                </>
              )}
              {level > 0 && (
                <Link
                  href={
                    level === 2
                      ? buildHref({ mclas: null })
                      : '/jobtask/heatmap'
                  }
                  scroll={false}
                  className="ml-auto rounded-full border border-[color:var(--color-neutral-300)] bg-white px-3 py-1 text-[13px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  ← 상위로
                </Link>
              )}
            </nav>

            <Heatmap
              tree={tree}
              focusLclas={focusLclas}
              focusMclas={focusMclas}
              leafHrefPattern={leafHrefPattern}
              groupHrefPattern={groupHrefPattern}
              leafHrefPrefix="/jobtask"
              hideToolbar={level > 0}
              width={1320}
              height={1400}
              viewportHeight={720}
            />

            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-[color:var(--color-neutral-500)]">
              <IconBulb size={14} className="mt-0.5 flex-none" />
              <span>
                {level === 0
                  ? '그룹 헤더 "02 경영·회계·사무 →" 클릭 또는 "0201 기획사무" 같은 셀 클릭 → 그 대분류 안의 중분류 히트맵이 열립니다.'
                  : level === 1
                  ? '중분류 그룹 헤더 클릭 → 세분류 히트맵 · 소분류 셀 클릭 → 같은 중분류의 소분류 히트맵으로 줌인.'
                  : '같은 셀을 여러 번 눌러 같은 직무의 다른 과제 버전을 도전하세요. AI가 JD를 다양화해 매번 새 시나리오를 생성합니다.'}
              </span>
            </p>
          </div>
        </section>

        {level === 0 && (
          <>
            {/* RECOMMENDED */}
            <section className="bg-white border-b border-[color:var(--color-neutral-100)]">
              <div className="mx-auto max-w-[1280px] px-6 py-16">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                      Recommended
                    </p>
                    <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                      너의 다음 도전
                    </h2>
                    <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                      지금까지 행적 + 진행중 공고 기반 추천. 인접 도메인으로 지도를 넓히는 설계.
                    </p>
                  </div>
                  <Link
                    href="/jobtask/process"
                    className="text-[15px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
                  >
                    추천 로직 자세히 →
                  </Link>
                </div>
                <RecommendedTasks />
              </div>
            </section>

            {/* BOTTOM CTA */}
            <section className="bg-[color:var(--color-neutral-50)]">
              <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
                <h2 className="text-[32px] font-bold tracking-tight sm:text-[40px]">
                  이력서 대신, 일로 증명한다
                </h2>
                <p className="mt-3 text-[17px] text-[color:var(--color-neutral-700)]">
                  한 달에 과제 4개씩만 해도 1년이면 48개. 그게 곧 내 도메인 지도.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/openings?status=active"
                    className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3.5 text-[16px] font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
                  >
                    진행중 공고 보기 →
                  </Link>
                  <Link
                    href="/explore"
                    className="rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-6 py-3.5 text-[16px] font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-light)]"
                  >
                    6축으로 좁혀 탐색
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
