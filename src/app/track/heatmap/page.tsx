import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadTrackTreeAsNcs, loadTrackTree } from '@/lib/track/data';
import { loadKsicTree } from '@/lib/ksic/data';
import { Heatmap } from '@/components/Heatmap';
import { TopBar } from '@/components/TopBar';
import { CategoryPicker } from '@/components/CategoryPicker';
import { IconBulb } from '@/components/Icon';

export const metadata = {
  title: '직무 체계 히트맵 · 실무 관점 20 카테고리',
  description:
    '리멤버 커리어 패턴 기반 17 대분류 × 43 중분류 × 235 세부직무. NCS/KSIC과 병렬 운영되는 실무 직관형 분류.',
};

type SP = { lclas?: string; mclas?: string };

const RE_2 = /^\d{2}$/;
const RE_4 = /^\d{4}$/;

export default async function TrackHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const trackRaw = loadTrackTree();
  const tree = loadTrackTreeAsNcs();
  const ksicTree = loadKsicTree();
  const sp = await searchParams;
  const focusLclas = sp.lclas && RE_2.test(sp.lclas) ? sp.lclas : undefined;
  const focusMclas = sp.mclas && RE_4.test(sp.mclas) ? sp.mclas : undefined;

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
    return qs ? `/track/heatmap?${qs}` : '/track/heatmap';
  }

  // drill-down은 level 0→1만 허용 (track은 실제 3단, Ncs호환 포맷에선 level 1에서 sclas=세부직무가 terminal)
  const leafHrefPattern =
    level === 0 ? '/track/heatmap?lclas={group}' : undefined;
  const groupHrefPattern =
    level === 0 ? '/track/heatmap?lclas={group}' : undefined;

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
                    Job Track · 실무 관점 3단
                  </span>
                </div>
                <h1 className="text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[52px]">
                  <span className="block">원하는 직무로</span>
                  <span className="block text-[color:var(--color-primary)]">
                    3번 클릭 안에 도달
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)]">
                  <strong className="text-[color:var(--color-primary)]">
                    {trackRaw.summary.lclas} 대분류 · {trackRaw.summary.mclas} 중분류 · {trackRaw.summary.subd} 세부직무
                  </strong>
                  의 실무 직관형 체계. "온라인 MD" 같은 경계 직무도 슬래시 네이밍으로
                  자연스럽게 흡수합니다. 상단 <strong>[직무]</strong>·<strong>[산업·업종]</strong>{' '}
                  버튼으로 바로 찍어서 고를 수도 있어요.
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
                  href="/industry/heatmap"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-neutral-300)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  KSIC 관점 →
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
                <Link
                  href="/industry/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  KSIC 21
                </Link>
                <span className="rounded-full bg-[color:var(--color-primary-light)] px-3.5 py-1 font-semibold text-[color:var(--color-primary)]">
                  Job Track {trackRaw.summary.lclas} ← 현재
                </span>
                <Link
                  href="/occupation/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  KECO 10
                </Link>
              </div>
              <div className="ml-auto">
                <CategoryPicker trackTree={trackRaw} ksicTree={ksicTree} />
              </div>
            </div>
          </div>
        </section>

        {/* HEATMAP */}
        <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1400px] px-6 py-16">
            <div className="mb-4">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Job Track 히트맵 · 2단계 Drill-Down
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                {level === 0
                  ? '어느 트랙부터 볼까'
                  : level === 1
                  ? `${lclasNode?.name} · 중분류로 좁혀보기`
                  : `${mclasNode?.name} · 세부 직무`}
              </h2>
              <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                {level === 0
                  ? '대분류 그룹 또는 중분류 셀을 클릭하면 그 트랙의 세부 직무로 바로 드릴다운.'
                  : level === 1
                  ? '셀이 곧 최종 직무. 클릭하면 해당 직무의 과제·공고로 이동합니다.'
                  : '(세부 직무 상세는 향후 /track/[code] 라우트에서 제공)'}
              </p>
            </div>

            <nav className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
              <Link
                href="/track/heatmap"
                scroll={false}
                className={
                  level === 0
                    ? 'font-semibold text-[color:var(--color-primary)]'
                    : 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
                }
              >
                전체 {trackRaw.summary.lclas} 대분류
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
                      : '/track/heatmap'
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
              leafHrefPrefix="/track"
              hideToolbar={level > 0}
              width={1320}
              height={1200}
              viewportHeight={720}
            />

            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-[color:var(--color-neutral-500)]">
              <IconBulb size={14} className="mt-0.5 flex-none" />
              <span>
                Track 체계는 NCS/KSIC과 달리 실무 용어 기반이라 "온라인 MD", "PM/PO",
                "그로스 마케터"처럼 민간 플랫폼 표준 네이밍을 씁니다. 내부적으론 NCS·KSIC와
                N:N 매핑될 예정.
              </span>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
