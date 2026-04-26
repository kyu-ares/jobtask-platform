import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findLclas, findMclas, isSeedTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { Crumbs } from '@/components/Crumbs';
import { OpeningsRelated } from '@/components/OpeningsRelated';

export default async function MclasPage({
  params,
}: {
  params: Promise<{ lclas: string; mclas: string }>;
}) {
  const { lclas, mclas } = await params;
  const lNode = findLclas(lclas);
  const mNode = findMclas(lclas, mclas);
  if (!lNode || !mNode) notFound();
  const seed = isSeedTree();

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-[1200px] px-6 py-12">
          <Crumbs
            items={[
              { href: '/', label: '홈' },
              { href: '/categories', label: '카테고리' },
              { href: `/categories/${lNode.code}`, label: lNode.name },
              { href: `/categories/${lNode.code}/${mNode.code}`, label: mNode.name },
            ]}
          />

          <div className="mt-8 mb-10">
            <p className="text-[15px] font-semibold tabular text-[color:var(--color-primary)]">
              {mNode.code} · 중분류
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
              {mNode.name}
            </h1>
            <p className="mt-3 text-[18px] text-[color:var(--color-neutral-500)]">
              소분류 {mNode.sclas.length}개
            </p>
          </div>

          <OpeningsRelated lclasCode={lNode.code} lclasName={lNode.name} limit={4} scope="중분류" />

          <div className="mt-12 mb-4 text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
            소분류로 좁혀가기
          </div>
          {mNode.sclas.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 p-6 text-[16px] text-[color:var(--color-warning)]">
              {seed
                ? '시드 데이터엔 소분류가 없습니다.'
                : '하위 소분류 정보가 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mNode.sclas.map((s) => (
                <Link
                  key={s.code}
                  href={`/categories/${lNode.code}/${mNode.code}/${s.code}`}
                  className="card-lift group flex flex-col gap-2 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-6 py-5"
                >
                  <span className="text-[15px] font-semibold tabular text-[color:var(--color-neutral-500)] group-hover:text-[color:var(--color-primary)]">
                    {s.code}
                  </span>
                  <span className="text-[20px] font-semibold text-[color:var(--color-neutral-800)]">
                    {s.name}
                  </span>
                  <span className="mt-2 text-[15px] text-[color:var(--color-neutral-500)]">
                    세분류 {s.subd.length}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
