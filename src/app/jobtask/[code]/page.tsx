// 세분류 직무과제 상세 — 현재는 진입 플레이스홀더 (Phase 2에서 전체 과제 워크플로우 구현)

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadNcsTree } from '@/lib/ncs/data';
import { TopBar } from '@/components/TopBar';
import { IconTarget, IconZap, IconChart, IconRefresh } from '@/components/Icon';

export default async function JobtaskDetailPage({
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
          <nav className="font-mono text-[13px] text-[color:var(--color-neutral-500)]">
            <Link href="/jobtask/heatmap" className="hover:text-[color:var(--color-primary)]">
              히트맵
            </Link>
            <span className="mx-2">/</span>
            <span>{found.lclas.name}</span>
            <span className="mx-2">/</span>
            <span className="text-[color:var(--color-primary)]">{found.subd.name}</span>
          </nav>

          <div className="mt-6 mb-10">
            <p className="font-mono text-[14px] font-semibold text-[color:var(--color-primary)]">
              {found.subd.code} · 직무 과제
            </p>
            <h1 className="mt-2 text-[40px] font-bold tracking-tight sm:text-[48px]">
              {found.subd.name}
            </h1>
            <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
              {found.lclas.name} › {found.mclas.name} › {found.sclas.name} · 능력단위{' '}
              {found.subd.unitCount}개
            </p>
          </div>

          {/* 진입 상태 카드 — Phase 2 구현 예고 */}
          <div className="rounded-2xl border-[1.5px] border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[color:var(--color-primary)]">
              COMING SOON · Phase 2
            </div>
            <h2 className="mt-3 text-[26px] font-bold tracking-tight">
              AI 과제 설계 파이프라인
            </h2>
            <p className="mt-2 text-[16px] leading-[1.7] text-[color:var(--color-neutral-700)]">
              세분류 <strong>{found.subd.name}</strong>의 능력단위 {found.subd.unitCount}개 + 실 채용 JD를 결합해
              AI가 30일 축소 시나리오를 생성합니다. 수행 후 S~D × KSA × STAR 루브릭 + 해설 피드백.
            </p>

            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { Icon: IconTarget, title: '① JD & 능력단위 동기화', desc: '실 채용공고 중 선택 → NCS 수행준거 자동 매핑' },
                { Icon: IconZap, title: '② 과제 생성', desc: '시나리오 + 제약 + 산출물 + 타이머' },
                { Icon: IconChart, title: '③ 루브릭 채점', desc: 'S~D × K/S/A + STAR · κ ≥ 0.80 검증' },
                { Icon: IconRefresh, title: '④ 보완 제안', desc: '약점 영역에서 다른 시나리오 자동 생성' },
              ].map(({ Icon, title, desc }) => (
                <li key={title} className="rounded-xl bg-white p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-700)]">
                      <Icon size={18} />
                    </span>
                    <span className="text-[16px] font-bold">{title}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.5] text-[color:var(--color-neutral-700)]">
                    {desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* 현재 이용 가능한 탭으로 유도 */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/openings?status=active&ncs=${found.lclas.code}`}
              className="card-lift rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5"
            >
              <div className="text-[14px] font-semibold text-[color:var(--color-primary)]">
                지금 할 수 있는 것 →
              </div>
              <div className="mt-1 text-[17px] font-bold">
                이 분야 진행중 채용공고 보기
              </div>
              <div className="mt-0.5 text-[14px] text-[color:var(--color-neutral-500)]">
                {found.lclas.name} 대분류 active openings
              </div>
            </Link>
            <Link
              href="/jobtask/process"
              className="card-lift rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5"
            >
              <div className="text-[14px] font-semibold text-[color:var(--color-primary)]">
                설계 로직 →
              </div>
              <div className="mt-1 text-[17px] font-bold">
                AI가 과제를 어떻게 만드는지
              </div>
              <div className="mt-0.5 text-[14px] text-[color:var(--color-neutral-500)]">
                5단계 파이프라인 + 6중 공신력
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
