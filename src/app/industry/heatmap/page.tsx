import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadKsicTree } from '@/lib/ksic/data';
import { loadTrackTree } from '@/lib/track/data';
import { Heatmap } from '@/components/Heatmap';
import { TopBar } from '@/components/TopBar';
import { CategoryPicker } from '@/components/CategoryPicker';
import { IconBulb } from '@/components/Icon';

export const metadata = {
  title: '산업·업종 히트맵 (KSIC 11차) · Jobtask',
  description:
    'KSIC 한국표준산업분류 제11차 기준 21개 대분류 → 78 중분류 → 239 소분류 → 540 세분류 드릴다운',
};

type SP = { lclas?: string; mclas?: string };

// KSIC 코드 자릿수: 대분류 알파벳 1 / 중분류 숫자 2 / 소분류 숫자 3 / 세분류 숫자 4
const RE_LCLAS = /^[A-U]$/;
const RE_MCLAS = /^\d{2}$/;

export default async function IndustryHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const tree = loadKsicTree();
  const trackTree = loadTrackTree();
  const sp = await searchParams;
  const focusLclas = sp.lclas && RE_LCLAS.test(sp.lclas) ? sp.lclas : undefined;
  const focusMclas = sp.mclas && RE_MCLAS.test(sp.mclas) ? sp.mclas : undefined;

  const lclasNode = focusLclas ? tree.lclas.find((l) => l.code === focusLclas) : null;
  const mclasNode =
    focusMclas && lclasNode
      ? lclasNode.mclas.find((m) => m.code === focusMclas)
      : null;
  if (focusLclas && !lclasNode) notFound();
  if (focusMclas && !mclasNode) notFound();

  const level = mclasNode ? 2 : lclasNode ? 1 : 0;

  function buildHref(patch: { lclas?: string | null; mclas?: string | null }) {
    const p = new URLSearchParams();
    const nextLclas = patch.lclas === undefined ? focusLclas : patch.lclas ?? undefined;
    const nextMclas = patch.mclas === undefined ? focusMclas : patch.mclas ?? undefined;
    if (nextLclas) p.set('lclas', nextLclas);
    if (nextMclas) p.set('mclas', nextMclas);
    const qs = p.toString();
    return qs ? `/industry/heatmap?${qs}` : '/industry/heatmap';
  }

  const leafHrefPattern =
    level === 0
      ? '/industry/heatmap?lclas={group}'
      : level === 1
      ? `/industry/heatmap?lclas=${focusLclas}&mclas={group}`
      : undefined;

  const groupHrefPattern =
    level === 0
      ? '/industry/heatmap?lclas={group}'
      : level === 1
      ? `/industry/heatmap?lclas=${focusLclas}&mclas={group}`
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
                    Industry Heatmap · KSIC 11차
                  </span>
                </div>
                <h1 className="text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[52px]">
                  <span className="block">산업·업종별로</span>
                  <span className="block text-[color:var(--color-primary)]">
                    어느 쪽이 내 필드인지
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)]">
                  한국표준산업분류(KSIC) 제11차 기준{' '}
                  <strong className="text-[color:var(--color-primary)]">{tree.summary.lclas} 대분류 · {tree.summary.mclas} 중분류 · {tree.summary.sclas} 소분류 · {tree.summary.subd} 세분류</strong>.
                  "직무"가 아닌 <strong className="text-[color:var(--color-primary)]">"산업"</strong> 관점에서 분포를 탐색하고,
                  NCS 직무 지도와 결합해 내 커리어의 양 축을 동시에 본다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/jobtask/heatmap"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-neutral-300)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  NCS 관점 →
                </Link>
                <Link
                  href="/track/heatmap"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-neutral-300)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  Job Track →
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
                <Link
                  href="/jobtask/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  NCS 24
                </Link>
                <span className="rounded-full bg-[color:var(--color-primary-light)] px-3.5 py-1 font-semibold text-[color:var(--color-primary)]">
                  KSIC {tree.summary.lclas} ← 현재
                </span>
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
                <CategoryPicker trackTree={trackTree} ksicTree={tree} />
              </div>
            </div>
          </div>
        </section>

        {/* HEATMAP — Drill-down */}
        <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1400px] px-6 py-16">
            <div className="mb-4">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                KSIC 히트맵 · 3단계 Drill-Down
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                {level === 0
                  ? '어느 산업부터 들여다볼까'
                  : level === 1
                  ? `${lclasNode?.name} · 중분류로 좁혀보기`
                  : `${mclasNode?.name} · 세분류 업종 선택`}
              </h2>
              <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                {level === 0
                  ? '대분류 그룹(알파벳) 또는 중분류 셀을 클릭하면 다음 단계로 좁혀집니다.'
                  : level === 1
                  ? '중분류 그룹 헤더 또는 소분류 셀을 클릭하면 세분류 히트맵이 열립니다.'
                  : '세분류 셀을 클릭하면 이 업종의 세세분류(KSIC 5자리) 목록과 관련 NCS 직무가 나타납니다.'}
              </p>
            </div>

            {/* Breadcrumb */}
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
              <Link
                href="/industry/heatmap"
                scroll={false}
                className={
                  level === 0
                    ? 'font-semibold text-[color:var(--color-primary)]'
                    : 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
                }
              >
                전체 {tree.summary.lclas} 대분류
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
                      : '/industry/heatmap'
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
              leafHrefPrefix="/industry"
              hideToolbar={level > 0}
              width={1320}
              height={1400}
              viewportHeight={720}
            />

            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-[color:var(--color-neutral-500)]">
              <IconBulb size={14} className="mt-0.5 flex-none" />
              <span>
                {level === 0
                  ? '그룹 헤더 "C 제조업 →" 클릭 또는 "10 식료품 제조업" 같은 셀 클릭 → 그 대분류 안의 중분류 히트맵이 열립니다.'
                  : level === 1
                  ? '중분류 그룹 헤더 클릭 → 세분류 히트맵 · 소분류 셀 클릭 → 같은 중분류의 소분류 히트맵으로 줌인.'
                  : '세분류는 KSIC의 말단(4자리). 추가로 세세분류(5자리) 단위는 내부적으로 유지하고 있습니다.'}
              </span>
            </p>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-16 text-center">
            <h2 className="text-[32px] font-bold tracking-tight sm:text-[40px]">
              직무 × 산업, 두 개의 축
            </h2>
            <p className="mt-3 text-[17px] text-[color:var(--color-neutral-700)]">
              같은 "데이터 분석" 직무라도 금융(K)이냐 제조(C)냐에 따라 요구 역량이 달라진다.
              두 축을 겹쳐 보면 내 커리어 좌표가 선명해진다.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/jobtask/heatmap"
                className="rounded-xl bg-[color:var(--color-primary)] px-6 py-3.5 text-[16px] font-semibold text-white hover:bg-[color:var(--color-primary-hover)]"
              >
                직무(NCS) 히트맵으로 →
              </Link>
              <Link
                href="/openings?status=active"
                className="rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-6 py-3.5 text-[16px] font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-light)]"
              >
                진행중 공고 보기
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
