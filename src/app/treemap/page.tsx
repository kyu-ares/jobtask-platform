import { loadNcsTree, isSeedTree } from '@/lib/ncs/data';
import { Heatmap } from '@/components/Heatmap';
import { TopBar } from '@/components/TopBar';

export default function TreemapPage() {
  const tree = loadNcsTree();
  const seed = isSeedTree();

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
        <section className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="mb-6">
            <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
              NCS Heatmap
            </p>
            <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
              직무 우주를 한 화면에
            </h1>
            <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
              면적은 직무 수, 색은 수요 지표. 그루핑·면적·색상 기준을 자유롭게 바꿔보세요.
            </p>
          </div>

          {seed && (
            <div className="mb-4 rounded-xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 px-4 py-3 text-[15px] text-[color:var(--color-warning)]">
              시드 단계 — 셀 면적 동일. 큐넷 키 활성화 후 자동으로 실수치 반영.
            </div>
          )}

          <Heatmap tree={tree} />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Tip
              title="그룹"
              desc="대/중/소 단위로 그루핑 토글. 그룹 컨테이너는 반투명, 안쪽 셀은 자식 분류."
            />
            <Tip
              title="면적"
              desc="셀 크기의 기준. 직무 수, 채용공고, 평균 연봉 중 선택."
            />
            <Tip
              title="색상"
              desc="셀 색의 기준. 수요 / 성장률 / 연봉 / 난이도. (실데이터 연결 전 mock)"
            />
          </div>
        </section>
      </main>
    </>
  );
}

function Tip({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <div className="text-[15px] font-semibold text-[color:var(--color-primary)]">{title}</div>
      <div className="mt-2 text-[16px] leading-[1.6] text-[color:var(--color-neutral-700)]">
        {desc}
      </div>
    </div>
  );
}
