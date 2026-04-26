// 카테고리·직무 페이지에서 공통으로 쓰는 "관련 공공채용 공고" 섹션
// 트리맵 / 궤도 / 카테고리 드릴다운 → 클릭 → 이 섹션 → 원본 사이트 진입

import Link from 'next/link';
import { openingDaysLeft, openingIsActive, openingsByNcsLclas } from '@/lib/openings/load';
import { SIDO_BY_CODE } from '@/lib/korea/sido';

const NCS_LABEL: Record<string, string> = {
  '01': '사업관리', '02': '경영·회계·사무', '03': '금융·보험', '04': '교육·자연·사회과학',
  '05': '법률·경찰·소방·교도·국방', '06': '보건·의료', '07': '사회복지·종교',
  '08': '문화·예술·디자인·방송', '09': '운전·운송', '10': '영업판매', '11': '경비·청소',
  '12': '이용·숙박·여행·오락·스포츠', '13': '음식서비스', '14': '건설', '15': '기계',
  '16': '재료', '17': '화학·바이오', '18': '섬유·의복', '19': '전기·전자', '20': '정보통신',
  '21': '식품가공', '22': '인쇄·목재·가구·공예', '23': '환경·에너지·안전', '24': '농림어업',
};

export function OpeningsRelated({
  lclasCode,
  lclasName,
  limit = 6,
  scope = '대분류',
}: {
  lclasCode: string;
  lclasName: string;
  limit?: number;
  scope?: string;
}) {
  // active 우선, 그 다음 마감
  const all = openingsByNcsLclas(lclasCode, 200);
  const active = all.filter((o) => openingIsActive(o));
  const items = (active.length >= limit ? active : [...active, ...all.filter((o) => !openingIsActive(o))]).slice(0, limit);

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-wide text-[color:var(--color-primary)]">
            관련 공공채용 공고
          </p>
          <h2 className="mt-1 text-[24px] font-bold">
            {lclasName} 분야 채용 ·{' '}
            <span className="text-[color:var(--color-primary)]">{active.length.toLocaleString()}</span>
            <span className="text-[15px] font-medium text-[color:var(--color-neutral-500)]"> 진행중</span>
          </h2>
        </div>
        <Link
          href={`/openings?status=active&ncs=${lclasCode}`}
          className="text-[15px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]"
        >
          전체 보기 →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-6 text-[16px] text-[color:var(--color-neutral-500)]">
          이 {scope}에 매칭되는 공공채용 공고가 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((o) => {
            const left = openingDaysLeft(o);
            const isActive = openingIsActive(o);
            const sidoMeta = o.sido ? SIDO_BY_CODE.get(o.sido) : null;
            const ncsLabels = o.ncs.map((c) => NCS_LABEL[c] ?? c).slice(0, 3);
            return (
              <li key={o.id}>
                <a
                  href={o.srcUrl ?? '#'}
                  target={o.srcUrl ? '_blank' : undefined}
                  rel={o.srcUrl ? 'noopener noreferrer' : undefined}
                  className="card-lift block h-full rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 transition hover:border-[color:var(--color-primary)]"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[13px] font-semibold text-[color:var(--color-neutral-700)]">
                      {o.instKind}
                    </span>
                    {sidoMeta && (
                      <span className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[13px] font-semibold text-[color:var(--color-neutral-700)]">
                        {sidoMeta.name}
                      </span>
                    )}
                    {o.rawHireType && (
                      <span className="rounded-full bg-[color:var(--color-neutral-50)] px-2.5 py-0.5 text-[13px] font-medium text-[color:var(--color-neutral-700)]">
                        {o.rawHireType}
                      </span>
                    )}
                    <span
                      className={
                        'ml-auto rounded-full px-2.5 py-0.5 text-[13px] font-semibold ' +
                        (isActive
                          ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
                          : 'bg-[color:var(--color-neutral-50)] text-[color:var(--color-neutral-500)]')
                      }
                    >
                      {isActive
                        ? left === 0
                          ? '오늘 마감'
                          : left !== null
                          ? `D-${left}`
                          : '진행중'
                        : '마감'}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-semibold leading-snug text-[color:var(--color-neutral-800)]">
                    {o.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-[color:var(--color-neutral-500)]">
                    {o.org}
                    {o.pick !== null ? ` · ${o.pick}명` : ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {ncsLabels.map((l) => (
                        <span
                          key={l}
                          className="rounded-full bg-[color:var(--color-neutral-50)] px-2 py-0.5 text-[12px] font-medium text-[color:var(--color-neutral-700)]"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                    <span className="text-[14px] font-semibold tabular text-[color:var(--color-primary)]">
                      {o.srcUrl ? '원본 →' : ''}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
