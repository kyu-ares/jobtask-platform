import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import {
  hasOpenings,
  loadOpeningsSummary,
  openingDaysLeft,
  openingIsActive,
  queryOpenings,
} from '@/lib/openings/load';
import { SIDO_BY_CODE, SIDO_LIST } from '@/lib/korea/sido';
import { OpeningsFilterBar } from './OpeningsFilterBar';
import { NCS_KEYWORD_MAP } from './ncsLabels';

interface SP {
  q?: string;
  sido?: string;
  inst?: string;
  job?: string;
  ncs?: string;
  status?: string;
  sort?: string;
  page?: string;
}

function parseList(v: string | undefined): string[] {
  if (!v) return [];
  return v.split(',').filter(Boolean);
}

export default async function OpeningsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  if (!hasOpenings()) {
    return (
      <>
        <TopBar />
        <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
          <section className="mx-auto max-w-[1200px] px-6 py-12">
            <div className="rounded-2xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 p-8 text-[16px] text-[color:var(--color-warning)]">
              <strong>data/openings.json</strong> 이 없습니다. <code>python scripts/build-openings.py</code> 로 먼저 생성하세요.
            </div>
          </section>
        </main>
      </>
    );
  }

  const summary = loadOpeningsSummary();
  const result = queryOpenings({
    q: sp.q,
    sido: parseList(sp.sido),
    instKind: parseList(sp.inst),
    jobKind: parseList(sp.job),
    ncs: parseList(sp.ncs),
    status: (sp.status as 'active' | 'closed' | 'all') ?? 'active',
    sort: (sp.sort as 'deadline' | 'recent' | 'views') ?? 'deadline',
    page: Number(sp.page) || 1,
    pageSize: 24,
  });
  const statusMode = (sp.status as 'active' | 'closed' | 'all') ?? 'active';

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const sidoOptions = SIDO_LIST.map((s) => ({
    code: s.code,
    label: s.name,
    n: summary?.sido[s.code] ?? 0,
  }));
  const instOptions = Object.entries(summary?.instKind ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([code, n]) => ({ code, label: code, n }));
  const jobOptions = Object.entries(summary?.jobKind ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([code, n]) => ({ code, label: code, n }));
  const ncsOptions = Object.entries(summary?.ncs ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([code, n]) => ({
      code,
      label: NCS_KEYWORD_MAP[code] ?? code,
      n,
    }));

  return (
    <>
      <TopBar />
      <main className="min-h-screen bg-[color:var(--color-neutral-50)]">
        <section className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
                Public Openings · 기재부 공공채용 OpenAPI
              </p>
              <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[40px]">
                {statusMode === 'active' ? '진행중 공고' : statusMode === 'closed' ? '마감된 공고' : '전체 공고'}
              </h1>
              <p className="mt-2 text-[18px] text-[color:var(--color-neutral-500)]">
                {statusMode === 'active' ? (
                  <>오늘 마감일이 안 지난 라이브 채용공고. 누적 아카이브는 ‘전체’ 탭에서.</>
                ) : (
                  <>10년치 공공기관 채용 아카이브. 분석·트렌드 추적용.</>
                )}
              </p>
            </div>
            <div className="text-right text-[13px] text-[color:var(--color-neutral-500)]">
              실시간 OpenAPI · apis.data.go.kr<br />
              기재부 공공기관 채용정보
            </div>
          </div>

          <OpeningsFilterBar
            sidoOptions={sidoOptions}
            instOptions={instOptions}
            jobOptions={jobOptions}
            ncsOptions={ncsOptions}
            current={{
              q: sp.q ?? '',
              sido: parseList(sp.sido),
              inst: parseList(sp.inst),
              job: parseList(sp.job),
              ncs: parseList(sp.ncs),
              status: (sp.status as 'active' | 'closed' | 'all') ?? 'all',
              sort: (sp.sort as 'deadline' | 'recent' | 'views') ?? 'deadline',
            }}
          />

          <div className="my-5 flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-[16px] text-[color:var(--color-neutral-700)]">
              <span className="text-[24px] font-bold tabular text-[color:var(--color-primary)]">
                {result.total.toLocaleString()}
              </span>
              <span className="ml-1.5">
                건 {statusMode === 'active' ? '진행중' : statusMode === 'closed' ? '마감' : '누적'}
              </span>
              <span className="ml-3 text-[14px] text-[color:var(--color-neutral-500)]">
                · {result.page} / {totalPages.toLocaleString()} 페이지
              </span>
            </div>
            {summary && (
              <div className="text-[13px] text-[color:var(--color-neutral-500)]">
                참고 — 진행중 {summary.active?.toLocaleString() ?? '-'} / 누적 {summary.total.toLocaleString()}
              </div>
            )}
          </div>

          {result.items.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-10 text-center">
              <div className="text-[20px] font-semibold text-[color:var(--color-neutral-700)]">
                매칭 공고가 없습니다
              </div>
              <div className="mt-2 text-[15px] text-[color:var(--color-neutral-500)]">
                필터를 일부 해제해 보세요.
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {result.items.map((o) => {
                const left = openingDaysLeft(o);
                const isActive = openingIsActive(o);
                const sidoMeta = o.sido ? SIDO_BY_CODE.get(o.sido) : null;
                const ncsLabels = o.ncs
                  .map((c) => NCS_KEYWORD_MAP[c] ?? c)
                  .slice(0, 3);
                const hasUrl = !!o.srcUrl;
                return (
                  <li key={o.id}>
                    <a
                      href={o.srcUrl ?? '#'}
                      target={hasUrl ? '_blank' : undefined}
                      rel={hasUrl ? 'noopener noreferrer' : undefined}
                      className={
                        'card-lift block rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 transition ' +
                        (hasUrl ? 'hover:border-[color:var(--color-primary)] cursor-pointer' : 'cursor-default')
                      }
                      aria-disabled={!hasUrl}
                    >
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Pill label={o.instKind} />
                      <Pill label={o.jobKind} variant="primary" />
                      {sidoMeta && <Pill label={sidoMeta.name} />}
                      {o.disabledHire && <Pill label="장애인 채용" variant="warn" />}
                      {o.disabledPref && <Pill label="장애인 우대" variant="warn" />}
                      {hasUrl && (
                        <span className="ml-auto text-[12px] font-semibold text-[color:var(--color-primary)]">
                          원본 →
                        </span>
                      )}
                    </div>
                    <h3 className="text-[18px] font-semibold leading-snug text-[color:var(--color-neutral-800)]">
                      {o.title}
                    </h3>
                    <p className="mt-1 text-[14px] text-[color:var(--color-neutral-500)]">
                      {o.org}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[color:var(--color-neutral-700)]">
                      <span>
                        <span className="text-[color:var(--color-neutral-500)]">직급</span>{' '}
                        <span className="font-medium">{o.rank || '-'}</span>
                      </span>
                      {o.pick !== null && (
                        <span>
                          <span className="text-[color:var(--color-neutral-500)]">인원</span>{' '}
                          <span className="font-medium">{o.pick.toLocaleString()}명</span>
                        </span>
                      )}
                      <span>
                        <span className="text-[color:var(--color-neutral-500)]">접수</span>{' '}
                        <span className="font-medium">
                          {o.startAt ?? '-'} ~ {o.endAt ?? '-'}
                        </span>
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {ncsLabels.map((l) => (
                          <span
                            key={l}
                            className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[13px] font-medium text-[color:var(--color-neutral-700)]"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                      <span
                        className={
                          'rounded-full px-2.5 py-1 text-[13px] font-semibold ' +
                          (isActive
                            ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
                            : 'bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-500)]')
                        }
                      >
                        {isActive
                          ? left === 0
                            ? '오늘 마감'
                            : `D-${left}`
                          : '마감'}
                      </span>
                    </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPages > 1 && (
            <Pagination
              page={result.page}
              total={totalPages}
              sp={sp}
            />
          )}
        </section>
      </main>
    </>
  );
}

function Pill({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: 'neutral' | 'primary' | 'warn';
}) {
  const cls =
    variant === 'primary'
      ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
      : variant === 'warn'
      ? 'bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]'
      : 'bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-700)]';
  return (
    <span className={'rounded-full px-2.5 py-0.5 text-[13px] font-semibold ' + cls}>
      {label}
    </span>
  );
}

function Pagination({
  page,
  total,
  sp,
}: {
  page: number;
  total: number;
  sp: SP;
}) {
  const make = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === 'page' || !v) continue;
      params.set(k, String(v));
    }
    params.set('page', String(p));
    return `?${params.toString()}`;
  };
  const around = 2;
  const lo = Math.max(1, page - around);
  const hi = Math.min(total, page + around);
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={make(page - 1)}
          className="rounded-xl border border-[color:var(--color-neutral-300)] px-3 py-2 text-[14px] font-medium text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
        >
          ← 이전
        </Link>
      )}
      {lo > 1 && (
        <>
          <Link href={make(1)} className="px-3 py-2 text-[14px] text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]">1</Link>
          {lo > 2 && <span className="text-[color:var(--color-neutral-300)]">…</span>}
        </>
      )}
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((p) => (
        <Link
          key={p}
          href={make(p)}
          className={
            'rounded-xl px-3 py-2 text-[14px] font-medium tabular ' +
            (p === page
              ? 'bg-[color:var(--color-primary)] text-white'
              : 'text-[color:var(--color-neutral-700)] hover:text-[color:var(--color-primary)]')
          }
        >
          {p}
        </Link>
      ))}
      {hi < total && (
        <>
          {hi < total - 1 && <span className="text-[color:var(--color-neutral-300)]">…</span>}
          <Link href={make(total)} className="px-3 py-2 text-[14px] text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]">
            {total.toLocaleString()}
          </Link>
        </>
      )}
      {page < total && (
        <Link
          href={make(page + 1)}
          className="rounded-xl border border-[color:var(--color-neutral-300)] px-3 py-2 text-[14px] font-medium text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
        >
          다음 →
        </Link>
      )}
    </nav>
  );
}
