import Link from 'next/link';
import { loadNcsTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';

export default function CategoriesPage() {
  const tree = loadNcsTree();
  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
            카테고리
          </p>
          <h1 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
            대분류 24개
          </h1>
          <p className="mt-3 text-[18px] text-[color:var(--color-neutral-500)]">
            한 단계씩 좁혀 들어가며 직무를 탐색하세요.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tree.lclas.map((l) => (
              <Link
                key={l.code}
                href={`/categories/${l.code}`}
                className="card-lift group flex flex-col gap-2 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-6 py-6"
              >
                <span className="text-[15px] font-semibold tabular text-[color:var(--color-neutral-500)] group-hover:text-[color:var(--color-primary)]">
                  {l.code}
                </span>
                <span className="text-[20px] font-semibold text-[color:var(--color-neutral-800)]">
                  {l.name}
                </span>
                {l.mclas.length > 0 && (
                  <span className="mt-2 text-[15px] text-[color:var(--color-neutral-500)]">
                    중분류 {l.mclas.length}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
