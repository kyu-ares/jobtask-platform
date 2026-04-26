import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadKecoTree, loadNcsKecoMap } from '@/lib/keco/data';
import { loadKsicTree } from '@/lib/ksic/data';
import { loadTrackTree } from '@/lib/track/data';
import { Heatmap } from '@/components/Heatmap';
import { TopBar } from '@/components/TopBar';
import { CategoryPicker } from '@/components/CategoryPicker';
import { IconBulb } from '@/components/Icon';

export const metadata = {
  title: '한국고용직업분류(KECO 2025) 히트맵',
  description:
    '고용노동부 고시 KECO 2025 개정 — 대 10 / 중 35 / 소 140 / 세 495. NCS와 공식 1,820행 매핑 보유',
};

type SP = { lclas?: string; mclas?: string };

const RE_1 = /^\d$/;
const RE_2 = /^\d{2}$/;

export default async function OccupationHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const tree = loadKecoTree();
  const ksicTree = loadKsicTree();
  const trackTree = loadTrackTree();
  const map = loadNcsKecoMap();
  const sp = await searchParams;
  const focusLclas = sp.lclas && RE_1.test(sp.lclas) ? sp.lclas : undefined;
  const focusMclas = sp.mclas && RE_2.test(sp.mclas) ? sp.mclas : undefined;

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
    return qs ? `/occupation/heatmap?${qs}` : '/occupation/heatmap';
  }

  const leafHrefPattern =
    level === 0
      ? '/occupation/heatmap?lclas={group}'
      : level === 1
      ? `/occupation/heatmap?lclas=${focusLclas}&mclas={group}`
      : undefined;

  const groupHrefPattern =
    level === 0
      ? '/occupation/heatmap?lclas={group}'
      : level === 1
      ? `/occupation/heatmap?lclas=${focusLclas}&mclas={group}`
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
                    Occupation · KECO 2025
                  </span>
                </div>
                <h1 className="text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[52px]">
                  <span className="block">법정 직업분류로</span>
                  <span className="block text-[color:var(--color-primary)]">
                    NCS와 공식 매핑
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)]">
                  고용노동부 고시 제2024-63호{' '}
                  <strong className="text-[color:var(--color-primary)]">
                    KECO 2025 개정 — 대 {tree.summary.lclas} · 중 {tree.summary.mclas} · 소 {tree.summary.sclas} · 세 {tree.summary.subd}
                  </strong>
                  . 워크넷·고용보험·HRD-Net의 법정 기반. NCS 소분류와{' '}
                  <strong className="text-[color:var(--color-primary)]">{map.summary.totalRows}행 공식 매핑</strong>이 있어
                  Track/KSIC와 달리 법적·통계적 정합성을 보장합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/jobtask/heatmap"
                  className="rounded-xl border-[1.5px] border-[color:var(--color-neutral-300)] bg-white px-5 py-3 text-[15px] font-semibold text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  NCS →
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

        {/* 4-TAB TOGGLE + PICKER */}
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
                <Link
                  href="/track/heatmap"
                  className="rounded-full border border-[color:var(--color-neutral-200)] bg-white px-3.5 py-1 font-medium text-[color:var(--color-neutral-600)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  Job Track {trackTree.summary.lclas}
                </Link>
                <span className="rounded-full bg-[color:var(--color-primary-light)] px-3.5 py-1 font-semibold text-[color:var(--color-primary)]">
                  KECO {tree.summary.lclas} ← 현재
                </span>
              </div>
              <div className="ml-auto">
                <CategoryPicker trackTree={trackTree} ksicTree={ksicTree} />
              </div>
            </div>
          </div>
        </section>

        {/* HEATMAP */}
        <section className="bg-[color:var(--color-neutral-50)] border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1400px] px-6 py-16">
            <div className="mb-4">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                KECO 2025 히트맵 · 3단계 Drill-Down
              </p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[36px]">
                {level === 0
                  ? '법정 직업체계로 보기'
                  : level === 1
                  ? `${lclasNode?.name} · 중분류로 좁혀보기`
                  : `${mclasNode?.name} · 소분류·세분류 직업`}
              </h2>
              <p className="mt-2 text-[17px] text-[color:var(--color-neutral-700)]">
                {level === 0
                  ? '대분류 그룹(0~9) 또는 중분류 셀을 클릭하면 다음 단계로 좁혀집니다.'
                  : level === 1
                  ? '중분류 그룹 헤더 또는 소분류 셀을 클릭하면 세분류 히트맵이 열립니다.'
                  : '세분류 셀(4자리)이 KECO의 말단 직업입니다.'}
              </p>
            </div>

            <nav className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
              <Link
                href="/occupation/heatmap"
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
                      : '/occupation/heatmap'
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
              leafHrefPrefix="/occupation"
              hideToolbar={level > 0}
              width={1320}
              height={1400}
              viewportHeight={720}
            />

            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-[color:var(--color-neutral-500)]">
              <IconBulb size={14} className="mt-0.5 flex-none" />
              <span>
                KECO는 NCS 소분류와 <strong>{map.summary.totalRows}행 공식 매핑</strong>(NCS{' '}
                {map.summary.uniqueNcs}개 ↔ KECO {map.summary.uniqueKeco}개, 평균 NCS 1개당 KECO{' '}
                {map.summary.avgKecoPerNcs}개)이 있어 Track/KSIC와 달리 법적·통계적 크로스워크를 제공합니다.
              </span>
            </p>
          </div>
        </section>

        {/* 매핑 정보 카드 */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1280px] px-6 py-12">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="공식 매핑 행" value={map.summary.totalRows.toLocaleString()} unit="행" />
              <Stat label="연결된 NCS 소분류" value={map.summary.uniqueNcs} unit="개" />
              <Stat label="연결된 KECO 직업" value={map.summary.uniqueKeco} unit="개" />
            </div>
            <p className="mt-4 text-[13px] text-[color:var(--color-neutral-500)]">
              출처: 공공데이터포털{' '}
              <a
                href="https://www.data.go.kr/data/15154290/fileData.do"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-primary)] hover:underline"
              >
                #15154290 한국고용정보원_직업능력 코드매핑정보
              </a>{' '}
              · 고용노동부 고시 제2024-63호 (KECO 2025 개정).
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-50)] p-5">
      <div className="text-[13px] font-medium text-[color:var(--color-neutral-500)]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[32px] font-bold tabular text-[color:var(--color-primary)]">{value}</span>
        <span className="text-[14px] font-medium text-[color:var(--color-neutral-500)]">{unit}</span>
      </div>
    </div>
  );
}
