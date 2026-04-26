import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { Roadmap8Steps } from './Roadmap8Steps';
import { TaskDeepDive } from './TaskDeepDive';
import { CredibilityMatrix } from './CredibilityMatrix';
import { BuilderJourney } from './BuilderJourney';
import { TechMoat } from './TechMoat';

export const metadata = {
  title: '직무과제 설계 로드맵 · NCS Jobtask',
  description:
    '조직 전략부터 채용까지 — 8단계 로드맵 + 직무과제 7단계 + 6중 공신력 매트릭스',
};

export default function ProcessPage() {
  return (
    <>
      <TopBar />
      <main className="bg-white">
        {/* HERO */}
        <section className="bg-hero-light relative border-b border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-light)] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
              <span className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Jobtask · 6중 공신력 채용 설계
              </span>
            </div>
            <h1 className="max-w-3xl text-[40px] font-bold leading-[1.15] tracking-tight text-[color:var(--color-neutral-800)] sm:text-[56px]">
              <span className="block">조직 전략부터 채용까지,</span>
              <span className="block text-[color:var(--color-primary)]">
                8단계로 설계한다
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-[1.7] text-[color:var(--color-neutral-700)] sm:text-[20px]">
              NCS 법령 · 산업조직심리학 메타분석(2024) · 글로벌 역량 프레임워크 · EEOC 공정성 ·
              인터엑스 비즈니스 설계자 — 4중을 6중으로 강화한 신뢰 구조 위에서 직무과제를 자동 설계합니다.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/jobtask/heatmap"
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-7 py-4 text-[17px] font-semibold text-white transition hover:bg-[color:var(--color-primary-hover)]"
              >
                실제 직무 과제 보기
                <span aria-hidden>→</span>
              </Link>
              <a
                href="#deep-dive"
                className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-7 py-4 text-[17px] font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary-light)]"
              >
                과제 설계 로직
              </a>
            </div>
          </div>
        </section>

        {/* SECTION A: 8단계 로드맵 */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1280px] px-6 py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Section A · 채용 로드맵
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                8단계 채용 설계 흐름
              </h2>
              <p className="mt-3 text-[18px] text-[color:var(--color-neutral-700)]">
                채용은 현업의 요청이 아니라 <strong className="text-[color:var(--color-primary)]">조직 전략의 산출물</strong>이다.
                ⑥ 직무과제와 ⑧ 공정성 검증이 우리 플랫폼의 핵심 차별화.
              </p>
            </div>
            <Roadmap8Steps />
          </div>
        </section>

        {/* SECTION A2: 구인자 여정 미리보기 — 가상 회사 "블레이버스" 8단계 */}
        <section className="bg-[color:var(--color-neutral-50)] border-t border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-24">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                  Section A+ · 구인자 여정 미리보기
                </p>
                <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                  블레이버스가 첫 팀원 뽑는 3주
                </h2>
                <p className="mt-3 text-[18px] text-[color:var(--color-neutral-700)]">
                  각 단계마다 <strong>어떤 입력</strong>을 넣고 <strong>어떤 산출</strong>이 나오는지.
                  실제 UI 그대로. 의문 없이 ①→⑧으로 흐릅니다.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary-light)] px-3 py-1 text-[13px] font-semibold text-[color:var(--color-primary)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
                </svg>
                가상 스타트업 · 8명 → 15명 성장 중
              </span>
            </div>
            <BuilderJourney />
          </div>
        </section>

        {/* SECTION B: 직무과제 7단계 Deep Dive (다크 패널 — 1회만 임팩트) */}
        <section
          id="deep-dive"
          className="bg-hero-dark relative border-y border-[color:var(--color-neutral-900)]"
        >
          <div className="mx-auto max-w-[1280px] px-6 py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-sky)]">
                Section B · ⑥ 직무과제 Deep Dive
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
                서류·면접 아닌, <span className="text-[color:var(--color-sky)]">‘일’</span>로 검증한다
              </h2>
              <p className="mt-3 text-[18px] leading-[1.7] text-white/80">
                5단계 파이프라인 — JD 파싱 → NCS 매핑 → 시나리오 설계 → 루브릭 → 공신력 레이어.
                각 단계는 실제 데이터 구조·Cross-mapping·통계 공식까지 공개합니다.
              </p>
            </div>
            <TaskDeepDive />
          </div>
        </section>

        {/* SECTION C: 6중 공신력 매트릭스 */}
        <section className="bg-[color:var(--color-neutral-50)]">
          <div className="mx-auto max-w-[1280px] px-6 py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Section C · 공신력 매트릭스
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                4중 → 6중 공신력 강화
              </h2>
              <p className="mt-3 text-[18px] text-[color:var(--color-neutral-700)]">
                Schmidt&amp;Hunter (1998) → <strong>Sackett et al. (2024)</strong> 최신 재보정,
                RJP 메타분석, EEOC 4/5 Rule, 인터엑스 KEY ENGINE — 6중으로 신뢰의 두께를 늘렸습니다.
              </p>
            </div>
            <CredibilityMatrix />
          </div>
        </section>

        {/* SECTION C+: 기술 진입장벽 (Moat) */}
        <section className="bg-white border-t border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Section C+ · 왜 우리만
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                이건 다른 플랫폼이 따라오기 어렵다
              </h2>
              <p className="mt-3 text-[18px] text-[color:var(--color-neutral-700)]">
                5가지 기술 Moat — 단순 UI가 아닌 <strong>데이터·프레임워크·학술·공신력·네트워크</strong> 복합 진입장벽.
                NCS 1,083 × 실시간 채용 × 6중 공신력은 하루아침에 복제되지 않습니다.
              </p>
            </div>
            <TechMoat />
          </div>
        </section>

        {/* SECTION D: 양면 가치 */}
        <section className="bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Section D · 양면 가치
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                구직자도 구인자도 이긴다
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* 구직자 */}
              <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-primary-light)] px-3 py-1 text-[13px] font-semibold text-[color:var(--color-primary)]">
                  구직자 가치
                </div>
                <h3 className="text-[24px] font-bold tracking-tight">
                  이력서가 아닌, 일로 검증된다
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    {
                      t: 'NCS 능력단위 기반 객관 검증',
                      d: '24 대분류 → 1,083 직무 어디든 동일 기준',
                    },
                    {
                      t: '직무 미리체험 (Realistic Job Preview)',
                      d: '입사 후 30일 업무를 사전에 시뮬레이션 — 메타분석 이직률 12% 감소',
                    },
                    {
                      t: '도메인 지도가 쌓인다',
                      d: '과제 누적 = 내 NCS 영역의 깊이 데이터, 다음 채용에 자동 자산화',
                    },
                    {
                      t: '공정한 평가',
                      d: 'EEOC 4/5 Rule 자동 모니터링, 편향 없는 다중 평가자 캘리브레이션',
                    },
                  ].map((it) => (
                    <li key={it.t} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full bg-[color:var(--color-primary)]" />
                      <div>
                        <div className="text-[16px] font-semibold text-[color:var(--color-neutral-800)]">
                          {it.t}
                        </div>
                        <div className="mt-0.5 text-[15px] text-[color:var(--color-neutral-500)]">
                          {it.d}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 구인자 */}
              <div className="rounded-2xl border-[1.5px] border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] p-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[color:var(--color-primary)]">
                  구인자 가치
                </div>
                <h3 className="text-[24px] font-bold tracking-tight">
                  ‘비즈니스 설계자’가 된다
                </h3>
                <ul className="mt-5 space-y-3">
                  {[
                    {
                      t: '1주 내 직무 적합도 확인',
                      d: '서류·면접 4주 → 과제 1주 (인터엑스 검증된 흐름)',
                    },
                    {
                      t: '도메인 + 깊이 데이터로 채용',
                      d: '단순 이력 X · 후보자가 어떤 NCS 영역에서 얼마나 검증됐는지',
                    },
                    {
                      t: '팀핏 사전 검증',
                      d: '컬처핏 + 팀핏 분리 (2026 트렌드 1순위, 원티드/캐치)',
                    },
                    {
                      t: '8단계 채용 자동 설계',
                      d: '비전 → 팀 → 포지션 역설계 → JD → 과제 → 면접 → 공정성 검증',
                    },
                  ].map((it) => (
                    <li key={it.t} className="flex items-start gap-3">
                      <span className="mt-1.5 inline-block h-2 w-2 flex-none rounded-full bg-[color:var(--color-primary)]" />
                      <div>
                        <div className="text-[16px] font-semibold text-[color:var(--color-neutral-800)]">
                          {it.t}
                        </div>
                        <div className="mt-0.5 text-[15px] text-[color:var(--color-neutral-700)]">
                          {it.d}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E: KPI 약속 */}
        <section className="bg-[color:var(--color-neutral-50)] border-t border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1280px] px-6 py-20">
            <div className="mb-10 max-w-2xl">
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Section E · KPI
              </p>
              <h2 className="mt-2 text-[32px] font-bold tracking-tight sm:text-[40px]">
                실증 가능한 수치로 약속한다
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KPI
                value="90%"
                label="과제 제출률"
                source="인터엑스 KPI · 스크린콜 사전 안내"
              />
              <KPI
                value="r 0.33+"
                label="직무 성과 예측 타당도"
                source="Sackett et al. 2024 · WST 메타분석"
              />
              <KPI
                value="−12%"
                label="이직률 감소"
                source="RJP 메타분석 · AOM Journal"
              />
              <KPI
                value="≥80%"
                label="선발률 균형 (4/5 Rule)"
                source="EEOC Adverse Impact 자동 모니터"
                highlight
              />
            </div>
            <div className="mt-6 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 text-[15px] leading-[1.7] text-[color:var(--color-neutral-700)]">
              <strong className="text-[color:var(--color-neutral-800)]">데이터 누적 약속</strong>:
              플랫폼이 운영되면서 자체 채용 후 6개월 성과 데이터를 누적해, 매년 r 값을 공시합니다.
              구인자에게는 "이 과제로 채용한 인재의 성과 예측력 = N" 같은 자체 증거를 제공.
            </div>
          </div>
        </section>

        {/* SECTION F: CTA */}
        <section className="bg-white border-t border-[color:var(--color-neutral-100)]">
          <div className="mx-auto max-w-[1200px] px-6 py-24">
            <div className="grid gap-5 lg:grid-cols-2">
              <Link
                href="/jobtask/heatmap"
                className="card-lift group flex flex-col gap-3 rounded-2xl border-[1.5px] border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] p-8"
              >
                <span className="text-[14px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                  구직자 / 신입·경력
                </span>
                <span className="text-[28px] font-bold tracking-tight text-[color:var(--color-neutral-800)]">
                  내 직무 과제 찾기 →
                </span>
                <span className="text-[16px] text-[color:var(--color-neutral-700)]">
                  NCS 1,083개 직무 중 내 영역의 검증된 과제로 도메인 지도를 채워나가세요.
                </span>
              </Link>
              <div className="card-lift flex flex-col gap-3 rounded-2xl border border-[color:var(--color-neutral-300)] bg-white p-8">
                <span className="text-[14px] font-semibold tracking-wide text-[color:var(--color-neutral-500)]">
                  구인자 / Talent Acquisition
                </span>
                <span className="text-[28px] font-bold tracking-tight text-[color:var(--color-neutral-800)]">
                  우리 회사 채용 설계 (준비중)
                </span>
                <span className="text-[16px] text-[color:var(--color-neutral-700)]">
                  비전 → 팀 → 포지션 역설계 → 직무과제 자동 생성. Phase 2 출시 예정.
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-[color:var(--color-neutral-500)]">
                  소식 받기 →
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function KPI({
  value,
  label,
  source,
  highlight,
}: {
  value: string;
  label: string;
  source: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        'flex flex-col gap-1 rounded-2xl border px-5 py-5 ' +
        (highlight
          ? 'border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary-light)]'
          : 'border-[color:var(--color-neutral-100)] bg-white')
      }
    >
      <div
        className={
          'text-[36px] font-bold tabular leading-none ' +
          (highlight
            ? 'text-[color:var(--color-primary)]'
            : 'text-[color:var(--color-neutral-800)]')
        }
      >
        {value}
      </div>
      <div className="mt-2 text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
        {label}
      </div>
      <div className="text-[12px] leading-[1.5] text-[color:var(--color-neutral-500)]">
        {source}
      </div>
    </div>
  );
}
