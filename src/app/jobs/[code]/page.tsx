import { notFound } from 'next/navigation';
import { loadNcsTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { Crumbs } from '@/components/Crumbs';
import { OpeningsRelated } from '@/components/OpeningsRelated';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (code.length !== 8) notFound();

  const tree = loadNcsTree();
  let found:
    | {
        lclas: { code: string; name: string };
        mclas: { code: string; name: string };
        sclas: { code: string; name: string };
        subd: { code: string; name: string; unitCount: number };
      }
    | null = null;

  for (const l of tree.lclas) {
    for (const m of l.mclas) {
      for (const s of m.sclas) {
        for (const d of s.subd) {
          if (d.code === code) {
            found = {
              lclas: { code: l.code, name: l.name },
              mclas: { code: m.code, name: m.name },
              sclas: { code: s.code, name: s.name },
              subd: { code: d.code, name: d.name, unitCount: d.unitCount },
            };
          }
        }
      }
    }
  }

  if (!found) notFound();

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-[960px] px-6 py-12">
          <Crumbs
            items={[
              { href: '/', label: '홈' },
              { href: `/categories/${found.lclas.code}`, label: found.lclas.name },
              {
                href: `/categories/${found.lclas.code}/${found.mclas.code}`,
                label: found.mclas.name,
              },
              {
                href: `/categories/${found.lclas.code}/${found.mclas.code}/${found.sclas.code}`,
                label: found.sclas.name,
              },
              { href: '#', label: found.subd.name },
            ]}
          />

          <div className="mt-8 mb-10">
            <p className="text-[15px] font-semibold tabular text-[color:var(--color-primary)]">
              {found.subd.code} · 직무
            </p>
            <h1 className="mt-2 text-[40px] font-bold tracking-tight sm:text-[48px]">
              {found.subd.name}
            </h1>
            <p className="mt-3 text-[18px] text-[color:var(--color-neutral-500)]">
              능력단위 {found.subd.unitCount}개
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-[color:var(--color-neutral-50)] p-8">
            <h2 className="text-[20px] font-semibold">직무 상세</h2>
            <p className="mt-3 text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)]">
              능력단위 상세, 직무 과제 공고는 다음 단계에서 채워집니다.
            </p>
          </div>

          <OpeningsRelated
            lclasCode={found.lclas.code}
            lclasName={found.lclas.name}
            limit={6}
            scope="직무"
          />
        </section>
      </main>
    </>
  );
}
