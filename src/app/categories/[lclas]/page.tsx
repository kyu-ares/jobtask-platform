import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findLclas, isSeedTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { Crumbs } from '@/components/Crumbs';
import { OpeningsRelated } from '@/components/OpeningsRelated';

export default async function LclasPage({
  params,
}: {
  params: Promise<{ lclas: string }>;
}) {
  const { lclas } = await params;
  const node = findLclas(lclas);
  if (!node) notFound();
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
              { href: `/categories/${node.code}`, label: node.name },
            ]}
          />

          <div className="mt-8 mb-10">
            <p className="text-[15px] font-semibold tabular text-[color:var(--color-primary)]">
              {node.code} · 대분류
            </p>
            <h1 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
              {node.name}
            </h1>
            <p className="mt-3 text-[18px] text-[color:var(--color-neutral-500)]">
              중분류 {node.mclas.length}개
            </p>
          </div>

          <OpeningsRelated lclasCode={node.code} lclasName={node.name} limit={6} scope="대분류" />

          <div className="mt-12 mb-4 text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
            중분류로 좁혀가기
          </div>
          {node.mclas.length === 0 ? (
            <Empty seed={seed} level="중분류" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {node.mclas.map((m) => (
                <Link
                  key={m.code}
                  href={`/categories/${node.code}/${m.code}`}
                  className="card-lift group flex flex-col gap-2 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-6 py-5"
                >
                  <span className="text-[15px] font-semibold tabular text-[color:var(--color-neutral-500)] group-hover:text-[color:var(--color-primary)]">
                    {m.code}
                  </span>
                  <span className="text-[20px] font-semibold text-[color:var(--color-neutral-800)]">
                    {m.name}
                  </span>
                  <span className="mt-2 text-[15px] text-[color:var(--color-neutral-500)]">
                    소분류 {m.sclas.length}
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

function Empty({ seed, level }: { seed: boolean; level: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 p-6 text-[16px] text-[color:var(--color-warning)]">
      {seed
        ? `시드 데이터엔 ${level} 정보가 없습니다. 큐넷 API 키 활성화 후 표시됩니다.`
        : `하위 ${level} 정보가 없습니다.`}
    </div>
  );
}
