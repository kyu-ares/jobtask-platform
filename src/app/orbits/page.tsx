import { loadNcsTree, isSeedTree } from '@/lib/ncs/data';
import { Sunburst } from '@/components/Sunburst';
import { TopBar } from '@/components/TopBar';

export default function OrbitsPage() {
  const tree = loadNcsTree();
  const seed = isSeedTree();

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
        <section className="mx-auto max-w-[1200px] px-6 py-12">
          <div className="mb-6">
            <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
              NCS Sunburst
            </p>
            <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
              직무 우주의 궤도
            </h1>
            <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
              중앙은 NCS 전체, 바깥으로 갈수록 좁혀지는 분류. 섹터를 클릭해 그 안의 우주만 들여다보세요.
            </p>
          </div>

          {seed && (
            <div className="mb-4 rounded-xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 px-4 py-3 text-[15px] text-[color:var(--color-warning)]">
              시드 단계 — 1개 링(대분류 24)만 표시. 큐넷 키 활성화 후 4링 전부 표시.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Sunburst tree={tree} size={720} />
            <aside className="space-y-4">
              <Card title="읽는 법">
                <Step n="1" desc="가장 안쪽 링 = 대분류, 바깥으로 중·소·세분류" />
                <Step n="2" desc="섹터 클릭 → 그 그룹만 풀화면으로 줌인" />
                <Step n="3" desc="중앙 또는 ‘전체로 돌아가기’ → 줌아웃" />
                <Step n="4" desc="가장 바깥 셀 클릭 → 직무 상세 진입" />
              </Card>
              <Card title="히트맵과의 차이">
                <p className="text-[16px] leading-[1.7] text-[color:var(--color-neutral-700)]">
                  같은 데이터를 다른 메타포로 본다.
                  <span className="font-semibold text-[color:var(--color-primary)]"> 히트맵</span>은 면적으로 규모를,
                  <span className="font-semibold text-[color:var(--color-primary)]"> Sunburst</span>는 깊이로 계층을 강조한다.
                </p>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">
        {title}
      </h3>
      <div className="mt-3 space-y-2.5">{children}</div>
    </div>
  );
}

function Step({ n, desc }: { n: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--color-primary-light)] text-[14px] font-semibold text-[color:var(--color-primary)] tabular">
        {n}
      </span>
      <span className="text-[16px] leading-[1.6] text-[color:var(--color-neutral-700)]">
        {desc}
      </span>
    </div>
  );
}
