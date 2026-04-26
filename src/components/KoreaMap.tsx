'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { geoIdentity, geoPath } from 'd3-geo';
import { parseAsString, useQueryStates } from 'nuqs';
import { useFilters } from '@/lib/filters/useFilters';
import { FilterBar, ActiveFilterChips } from '@/components/FilterBar';
import {
  SIDO_BY_CODE,
  SIDO_LIST,
  fgOnPrimary,
  primaryFill,
  shortName,
} from '@/lib/korea/sido';
import type { Opening } from '@/lib/openings/types';
import type { MapData, RegionStats } from '@/lib/openings/mapStats';

interface FeatureProps {
  code: string;
  name: string;
  name_eng?: string;
}
interface Feature {
  type: 'Feature';
  properties: FeatureProps;
  geometry: GeoJSON.Geometry;
}
interface FC {
  type: 'FeatureCollection';
  features: Feature[];
}

const VB_W = 720;
const VB_H = 820;
const SVG_PADDING = 16;

type Level = 'nation' | 'sido' | 'sgg' | 'dong';
type StatusMode = 'active' | 'all';

const NCS_LABEL: Record<string, string> = {
  '01': '사업관리', '02': '경영·회계·사무', '03': '금융·보험', '04': '교육·자연·사회과학',
  '05': '법률·경찰·소방·교도·국방', '06': '보건·의료', '07': '사회복지·종교',
  '08': '문화·예술·디자인·방송', '09': '운전·운송', '10': '영업판매', '11': '경비·청소',
  '12': '이용·숙박·여행·오락·스포츠', '13': '음식서비스', '14': '건설', '15': '기계',
  '16': '재료', '17': '화학·바이오', '18': '섬유·의복', '19': '전기·전자', '20': '정보통신',
  '21': '식품가공', '22': '인쇄·목재·가구·공예', '23': '환경·에너지·안전', '24': '농림어업',
};

export function KoreaMap({
  sidoGeo,
  sggGeo,
  dongGeo,
  mapData,
}: {
  sidoGeo: FC;
  sggGeo: FC;
  dongGeo: FC;
  mapData: MapData;
}) {
  const [{ sido: sidoFocus, sgg: sggFocus, dong: dongFocus, status: statusRaw }, setUrl] = useQueryStates(
    {
      sido: parseAsString.withDefault(''),
      sgg: parseAsString.withDefault(''),
      dong: parseAsString.withDefault(''),
      status: parseAsString.withDefault('active'),
    },
    { history: 'push' }
  );
  const status = (statusRaw === 'all' ? 'all' : 'active') as StatusMode;

  const level: Level = dongFocus ? 'dong' : sggFocus ? 'sgg' : sidoFocus ? 'sido' : 'nation';

  const { filter } = useFilters();
  const [hover, setHover] = useState<{ code: string; name: string; value: number; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1) 시도 카운트 (실 OpenAPI)
  const sidoCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of SIDO_LIST) m.set(s.code, 0);
    const regionFilter = filter.region.length > 0 ? new Set(filter.region) : null;
    for (const [code, stats] of Object.entries(mapData.bySido)) {
      if (regionFilter && !regionFilter.has(code)) continue;
      m.set(code, status === 'active' ? stats.active : stats.total);
    }
    return m;
  }, [mapData, status, filter.region]);
  const maxSido = Math.max(...Array.from(sidoCounts.values()), 1);

  // 2) 시군구 카운트 — 본문 정규식 매칭만 (mock 분배 X)
  const sggInFocus = useMemo(() => {
    if (!sidoFocus) return [];
    return sggGeo.features.filter((f) => f.properties.code.startsWith(sidoFocus));
  }, [sggGeo, sidoFocus]);

  const sggCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of sggInFocus) {
      const stats = mapData.bySgg[f.properties.code];
      m.set(f.properties.code, stats ? (status === 'active' ? stats.active : stats.total) : 0);
    }
    return m;
  }, [sggInFocus, mapData, status]);
  const maxSgg = Math.max(...Array.from(sggCounts.values()), 1);

  // 3) 동·읍·면 카운트 — 본문 정규식 매칭만
  const dongInFocus = useMemo(() => {
    if (!sggFocus) return [];
    return dongGeo.features.filter((f) => f.properties.code.startsWith(sggFocus));
  }, [dongGeo, sggFocus]);

  const dongCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of dongInFocus) {
      const stats = mapData.byDong[f.properties.code];
      m.set(f.properties.code, stats ? (status === 'active' ? stats.active : stats.total) : 0);
    }
    return m;
  }, [dongInFocus, mapData, status]);
  const maxDong = Math.max(...Array.from(dongCounts.values()), 1);

  // 4) 투영
  const projection = useMemo(() => {
    if (level === 'nation') {
      return geoIdentity().reflectY(true).fitExtent(
        [[SVG_PADDING, SVG_PADDING], [VB_W - SVG_PADDING, VB_H - SVG_PADDING]],
        sidoGeo as never
      );
    }
    if (level === 'sido') {
      const fc = {
        type: 'FeatureCollection' as const,
        features: sggGeo.features.filter((f) => f.properties.code.startsWith(sidoFocus)),
      };
      const target = fc.features.length > 0 ? fc : sidoGeo.features.find((f) => f.properties.code === sidoFocus);
      if (target) {
        return geoIdentity().reflectY(true).fitExtent(
          [[SVG_PADDING, SVG_PADDING], [VB_W - SVG_PADDING, VB_H - SVG_PADDING]],
          target as never
        );
      }
    }
    const fc = {
      type: 'FeatureCollection' as const,
      features: dongGeo.features.filter((f) => f.properties.code.startsWith(sggFocus)),
    };
    const target = fc.features.length > 0 ? fc : sggGeo.features.find((f) => f.properties.code === sggFocus);
    if (target) {
      return geoIdentity().reflectY(true).fitExtent(
        [[SVG_PADDING * 2, SVG_PADDING * 2], [VB_W - SVG_PADDING * 2, VB_H - SVG_PADDING * 2]],
        target as never
      );
    }
    return geoIdentity().reflectY(true).fitSize([VB_W, VB_H], sidoGeo as never);
  }, [sidoGeo, sggGeo, dongGeo, level, sidoFocus, sggFocus]);

  const path = useMemo(() => geoPath(projection), [projection]);

  // 5) 메타
  const sidoMeta = sidoFocus ? SIDO_BY_CODE.get(sidoFocus) ?? null : null;
  const sggFeat = sggFocus ? sggGeo.features.find((f) => f.properties.code === sggFocus) : null;
  const dongFeat = dongFocus ? dongGeo.features.find((f) => f.properties.code === dongFocus) : null;

  // 6) NCS 분포
  const sidoStats: RegionStats | null = sidoFocus ? mapData.bySido[sidoFocus] ?? null : null;
  const sggStats: RegionStats | null = sggFocus ? mapData.bySgg[sggFocus] ?? null : null;
  const dongStats: RegionStats | null = dongFocus ? mapData.byDong[dongFocus] ?? null : null;
  const focusStats: RegionStats | null = dongStats ?? sggStats ?? sidoStats;
  const lclasDist = useMemo(() => {
    if (focusStats) {
      return Object.entries(focusStats.ncs)
        .map(([code, n]) => ({ code, name: NCS_LABEL[code] ?? code, n }))
        .sort((a, b) => b.n - a.n);
    }
    const m = new Map<string, number>();
    for (const stats of Object.values(mapData.bySido)) {
      for (const [code, n] of Object.entries(stats.ncs)) {
        m.set(code, (m.get(code) ?? 0) + n);
      }
    }
    return Array.from(m.entries())
      .map(([code, n]) => ({ code, name: NCS_LABEL[code] ?? code, n }))
      .sort((a, b) => b.n - a.n);
  }, [focusStats, mapData]);
  const lclasMax = lclasDist[0]?.n ?? 1;

  // 7) panel sample — 현재 포커스 단위에서 실 매칭만
  const panelSamples: Opening[] = useMemo(() => {
    if (level === 'dong' && dongFocus) return mapData.sampleByDong[dongFocus] ?? [];
    if (level === 'sgg' && sggFocus) return mapData.sampleBySgg[sggFocus] ?? [];
    if (level === 'sido' && sidoFocus) return (mapData.sampleBySido[sidoFocus] ?? []).slice(0, 8);
    return [];
  }, [level, dongFocus, sggFocus, sidoFocus, mapData]);

  function updateHover(e: React.MouseEvent, code: string, name: string, value: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ code, name, value, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function goNation() { setUrl({ sido: null, sgg: null, dong: null }); }
  function goSido(code: string) { setUrl({ sido: code, sgg: null, dong: null }); }
  function goSgg(code: string) { setUrl({ sgg: code, dong: null }); }
  function goDong(code: string) { setUrl({ dong: code }); }
  function goSidoFromCurrent() { sidoFocus && setUrl({ sgg: null, dong: null }); }
  function goSggFromCurrent() { sggFocus && setUrl({ dong: null }); }
  function setStatus(s: StatusMode) { setUrl({ status: s === 'active' ? null : s }); }

  return (
    <div className="space-y-4">
      <FilterBar />
      <ActiveFilterChips />

      <div className="flex flex-wrap items-center gap-3">
        <Breadcrumb
          sidoMeta={sidoMeta}
          sggName={sggFeat?.properties.name ?? null}
          dongName={dongFeat?.properties.name ?? null}
          onNation={goNation}
          onSido={goSidoFromCurrent}
          onSgg={goSggFromCurrent}
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[14px] text-[color:var(--color-neutral-500)]">표시</span>
          <div className="flex overflow-hidden rounded-xl border border-[color:var(--color-neutral-300)]">
            {[{ v: 'active', l: '진행중' }, { v: 'all', l: '누적' }].map((o) => (
              <button key={o.v} type="button" onClick={() => setStatus(o.v as StatusMode)}
                className={'px-3 py-1.5 text-[14px] font-medium transition ' +
                  (status === o.v
                    ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
                    : 'text-[color:var(--color-neutral-700)] hover:bg-[color:var(--color-neutral-50)]')}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <div ref={containerRef}
          className="bg-hero-dark relative overflow-hidden rounded-2xl p-4 shadow-[0_24px_60px_-20px_rgba(10,30,61,0.35)]"
          onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto" role="img"
            aria-label={
              level === 'nation' ? '한국 시도 채용 지도'
              : level === 'sido' ? `${sidoMeta?.name} 시군구 지도`
              : `${sggFeat?.properties.name} 행정동 지도`
            }>
            {level === 'nation' &&
              sidoGeo.features.map((ft) => {
                const code = ft.properties.code;
                const meta = SIDO_BY_CODE.get(code);
                if (!meta) return null;
                const value = sidoCounts.get(code) ?? 0;
                const d = path(ft as never) || '';
                const [cx, cy] = path.centroid(ft as never);
                const fill = primaryFill(value, maxSido);
                const fg = fgOnPrimary(value, maxSido);
                const isHover = hover?.code === code;
                return (
                  <g key={code} className="cursor-pointer"
                    onMouseEnter={(e) => updateHover(e, code, meta.name, value)}
                    onMouseMove={(e) => updateHover(e, code, meta.name, value)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => goSido(code)}>
                    <path d={d} fill={fill}
                      stroke={isHover ? '#ffffff' : 'rgba(10,30,61,0.25)'}
                      strokeWidth={isHover ? 1.6 : 0.6}
                      style={{ transition: 'stroke 160ms' }} />
                    {value > maxSido * 0.08 && (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                        fontSize={11} fontWeight={600} fill={fg} style={{ pointerEvents: 'none' }}>
                        {shortName(meta.name)}
                      </text>
                    )}
                    {value > maxSido * 0.18 && (
                      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill={fg}
                        style={{ pointerEvents: 'none', opacity: 0.85 }}>
                        {value.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}

            {level === 'sido' &&
              sggInFocus.map((ft) => {
                const code = ft.properties.code;
                const value = sggCounts.get(code) ?? 0;
                const d = path(ft as never) || '';
                const [cx, cy] = path.centroid(ft as never);
                // 매칭 0: 옅은 흰색으로 영역·라벨 명확히. 매칭 있음: primary 농도.
                const fill = value > 0 ? primaryFill(value, maxSgg) : 'rgba(255,255,255,0.14)';
                const fg = value > 0 ? fgOnPrimary(value, maxSgg) : 'rgba(255,255,255,0.92)';
                const stroke =
                  value > 0
                    ? 'rgba(10,30,61,0.18)'
                    : 'rgba(255,255,255,0.32)';
                const isHover = hover?.code === code;
                return (
                  <g key={code} className="cursor-pointer"
                    onMouseEnter={(e) => updateHover(e, code, ft.properties.name, value)}
                    onMouseMove={(e) => updateHover(e, code, ft.properties.name, value)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => goSgg(code)}>
                    <path d={d} fill={fill}
                      stroke={isHover ? '#ffffff' : stroke}
                      strokeWidth={isHover ? 1.6 : 0.8}
                      style={{ transition: 'stroke 160ms, fill 160ms' }} />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                      fontSize={11} fontWeight={value > 0 ? 700 : 500} fill={fg}
                      style={{ pointerEvents: 'none' }}>
                      {ft.properties.name}
                    </text>
                    {value > 0 && (
                      <text
                        x={cx} y={cy + 13} textAnchor="middle"
                        fontSize={10} fontWeight={500} fill={fg}
                        style={{ pointerEvents: 'none', opacity: 0.85 }}
                      >
                        {value.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}

            {(level === 'sgg' || level === 'dong') &&
              dongInFocus.map((ft) => {
                const code = ft.properties.code;
                const value = dongCounts.get(code) ?? 0;
                const d = path(ft as never) || '';
                const [cx, cy] = path.centroid(ft as never);
                const fill = value > 0 ? primaryFill(value, maxDong) : 'rgba(255,255,255,0.10)';
                const fg = value > 0 ? fgOnPrimary(value, maxDong) : 'rgba(255,255,255,0.85)';
                const stroke =
                  value > 0 ? 'rgba(10,30,61,0.14)' : 'rgba(255,255,255,0.25)';
                const isHover = hover?.code === code;
                const isSelected = dongFocus === code;
                return (
                  <g key={code} className="cursor-pointer"
                    onMouseEnter={(e) => updateHover(e, code, ft.properties.name, value)}
                    onMouseMove={(e) => updateHover(e, code, ft.properties.name, value)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => goDong(code)}>
                    <path d={d} fill={fill}
                      stroke={isSelected ? '#7CC8FF' : isHover ? '#ffffff' : stroke}
                      strokeWidth={isSelected ? 1.8 : isHover ? 1.4 : 0.6}
                      style={{ transition: 'stroke 160ms, fill 160ms' }} />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                      fontSize={9} fontWeight={value > 0 ? 700 : 500} fill={fg}
                      style={{ pointerEvents: 'none' }}>
                      {ft.properties.name.replace(/(동|읍|면|가)$/, '')}
                    </text>
                  </g>
                );
              })}
          </svg>

          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-[14px] text-white backdrop-blur">
            <span className="font-semibold">
              {status === 'active' ? '진행중 채용공고' : '누적 채용공고'}
            </span>
            <div className="h-2.5 w-32 rounded-full"
              style={{ background: 'linear-gradient(to right, #EBF3FF, #006CD1)' }} />
            <span className="text-white/75">적음</span>
            <span className="text-white/75">많음</span>
          </div>

          {hover && <HoverCard hover={hover} level={level} status={status} />}

          {level !== 'nation' && (
            <button type="button"
              onClick={() => {
                if (level === 'dong') setUrl({ dong: null });
                else if (level === 'sgg') setUrl({ sgg: null });
                else goNation();
              }}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[14px] font-semibold text-white backdrop-blur hover:bg-white/20">
              ← {level === 'dong' ? `${sggFeat?.properties.name ?? '시군구'}로`
                : level === 'sgg' ? `${sidoMeta?.name ?? '시도'}로`
                : '전국으로'}
            </button>
          )}
        </div>

        {/* RIGHT PANEL */}
        <aside className="space-y-4">
          {level === 'nation' && (
            <NationPanel totals={mapData.totals} status={status} />
          )}
          {level === 'sido' && sidoMeta && sidoStats && (
            <>
              <SidoSelectedPanel
                meta={sidoMeta} stats={sidoStats} status={status} maxSido={maxSido}
                sggMatched={Object.keys(mapData.bySgg).filter((c) => c.startsWith(sidoMeta.code)).length}
              />
              {sggInFocus.length > 0 && Array.from(sggCounts.values()).every((v) => v === 0) && (
                <div className="rounded-2xl border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/5 p-4 text-[14px] leading-[1.6] text-[color:var(--color-warning)]">
                  <strong>이 시·도의 시·군·구별 매칭이 0건입니다.</strong>
                  <p className="mt-1 text-[color:var(--color-neutral-600)]">
                    OpenAPI는 시·도까지 제공하고, 시·군·구는 공고 본문에서 정규식으로 추출합니다.
                    {sidoMeta.name} 공고는 본문에 자치구명이 명시되지 않은 경우가 많아요.
                    <br />다음 단계: 공공기관 본사·지사 주소 DB 조인으로 정확도 향상 예정.
                  </p>
                </div>
              )}
            </>
          )}
          {(level === 'sgg' || level === 'dong') && sggFeat && (
            <SubSelectedPanel
              parentName={sidoMeta?.name ?? ''}
              sggName={sggFeat.properties.name}
              sggCode={sggFeat.properties.code}
              sggValue={sggCounts.get(sggFeat.properties.code) ?? 0}
              sggMax={maxSgg}
              dongFeat={dongFeat ?? null}
              dongValue={dongFeat ? dongCounts.get(dongFeat.properties.code) ?? 0 : null}
              dongMax={maxDong}
              status={status}
            />
          )}

          <DistChart
            title={
              level === 'nation' ? '전국 NCS 대분류 분포'
              : level === 'sgg' && sggFeat ? `${sggFeat.properties.name} NCS 대분류`
              : level === 'dong' && dongFeat ? `${dongFeat.properties.name} NCS 대분류`
              : `${sidoMeta?.name ?? ''} NCS 대분류`
            }
            items={lclasDist.slice(0, 8)}
            max={lclasMax}
          />

          {level === 'nation' && <RankPanel counts={sidoCounts} onSelect={goSido} />}

          {level === 'sido' && sggInFocus.length > 0 && (
            <SggRankPanel
              items={sggInFocus.map((f) => ({
                code: f.properties.code,
                name: f.properties.name,
                n: sggCounts.get(f.properties.code) ?? 0,
              }))}
              onSelect={goSgg}
            />
          )}

          {level !== 'nation' && panelSamples.length > 0 && (
            <OpeningsPanel
              title={openingsPanelTitle(level, sidoMeta?.name, sggFeat?.properties.name, dongFeat?.properties.name)}
              note={openingsPanelNote(level, panelSamples.length)}
              openings={panelSamples}
              moreHref={`/openings?status=active&sido=${sidoFocus}`}
            />
          )}
          {level !== 'nation' && panelSamples.length === 0 && (
            <NoSamplePanel
              level={level}
              regionName={
                level === 'dong' ? dongFeat?.properties.name
                : level === 'sgg' ? sggFeat?.properties.name
                : sidoMeta?.name
              }
              moreHref={`/openings?status=active&sido=${sidoFocus}`}
              moreLabel={`${sidoMeta?.name ?? '이 시·도'} 진행중 공고 전체 보기`}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function openingsPanelTitle(level: Level, sidoName?: string, sggName?: string, dongName?: string): string {
  if (level === 'dong' && dongName) return `${dongName} 진행중 공고`;
  if (level === 'sgg' && sggName) return `${sggName} 진행중 공고`;
  return `${sidoName ?? '이 지역'} 진행중 공고`;
}

function openingsPanelNote(level: Level, n: number): string | null {
  if (level === 'dong' || level === 'sgg')
    return `※ 공고 본문에서 위치 키워드를 매칭한 ${n}건 — 정확도 약 12% (시군구) / 8% (동·읍·면)`;
  return null;
}

function Breadcrumb({
  sidoMeta, sggName, dongName, onNation, onSido, onSgg,
}: {
  sidoMeta: { code: string; name: string } | null;
  sggName: string | null;
  dongName: string | null;
  onNation: () => void;
  onSido: () => void;
  onSgg: () => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[15px]">
      <button type="button" onClick={onNation}
        className={sidoMeta
          ? 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
          : 'font-semibold text-[color:var(--color-primary)]'}>
        전국
      </button>
      {sidoMeta && (
        <>
          <span className="text-[color:var(--color-neutral-300)]">/</span>
          <button type="button" onClick={onSido}
            className={sggName
              ? 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
              : 'font-semibold text-[color:var(--color-primary)]'}>
            {sidoMeta.name}
          </button>
        </>
      )}
      {sggName && (
        <>
          <span className="text-[color:var(--color-neutral-300)]">/</span>
          <button type="button" onClick={onSgg}
            className={dongName
              ? 'font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-primary)]'
              : 'font-semibold text-[color:var(--color-primary)]'}>
            {sggName}
          </button>
        </>
      )}
      {dongName && (
        <>
          <span className="text-[color:var(--color-neutral-300)]">/</span>
          <span className="font-semibold text-[color:var(--color-primary)]">{dongName}</span>
        </>
      )}
    </nav>
  );
}

function HoverCard({
  hover, level, status,
}: {
  hover: { code: string; name: string; value: number; x: number; y: number };
  level: Level;
  status: StatusMode;
}) {
  const flipX = hover.x > VB_W * 0.7;
  const flipY = hover.y > VB_H * 0.78;
  const style: React.CSSProperties = {
    left: flipX ? undefined : hover.x + 14,
    right: flipX ? 16 : undefined,
    top: flipY ? undefined : hover.y + 14,
    bottom: flipY ? 16 : undefined,
  };
  const hint =
    level === 'nation' ? '클릭하여 시·군·구로 줌인'
    : level === 'sido' ? '클릭하여 동·읍·면으로 줌인'
    : level === 'sgg' || level === 'dong' ? '클릭하여 패널에 공고 표시'
    : '';
  return (
    <div className="pointer-events-none absolute z-10 w-[220px] rounded-xl border border-white/15 bg-white/95 p-3 shadow-[0_18px_40px_-12px_rgba(10,30,61,0.35)] backdrop-blur" style={style}>
      <div className="text-[13px] tabular text-[color:var(--color-neutral-500)]">{hover.code}</div>
      <div className="mt-0.5 text-[16px] font-semibold leading-tight text-[color:var(--color-neutral-800)]">
        {hover.name}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-[22px] font-bold tabular text-[color:var(--color-primary)]">
          {hover.value.toLocaleString()}
        </span>
        <span className="text-[13px] text-[color:var(--color-neutral-500)]">
          {status === 'active' ? '진행중 공고' : '누적 공고'}
        </span>
      </div>
      <div className="mt-1.5 text-[12px] text-[color:var(--color-neutral-500)]">{hint}</div>
    </div>
  );
}

function NationPanel({ totals, status }: { totals: { all: number; active: number; sggMatched: number; dongMatched: number }; status: StatusMode }) {
  const value = status === 'active' ? totals.active : totals.all;
  const ratio = totals.all > 0 ? (value / totals.all) * 100 : 0;
  return (
    <div className="rounded-2xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary-light)] p-5">
      <div className="text-[15px] font-semibold text-[color:var(--color-primary)]">전국</div>
      <h2 className="mt-0.5 text-[24px] font-bold text-[color:var(--color-neutral-800)]">대한민국</h2>
      <div className="mt-5 rounded-xl bg-white p-4">
        <div className="text-[15px] font-medium text-[color:var(--color-neutral-500)]">
          {status === 'active' ? '진행중 채용공고' : '누적 채용공고'}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[36px] font-bold tabular text-[color:var(--color-primary)]">
            {value.toLocaleString()}
          </span>
          <span className="text-[15px] text-[color:var(--color-neutral-500)]">/ {totals.all.toLocaleString()}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-primary-subtle)]">
          <div className="h-full rounded-full bg-[color:var(--color-primary)]"
            style={{ width: `${Math.max(2, ratio)}%` }} />
        </div>
        <div className="mt-1 text-[14px] text-[color:var(--color-neutral-500)]">
          전체의 {ratio.toFixed(1)}%
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[color:var(--color-neutral-100)] pt-3 text-[14px]">
          <div>
            <div className="text-[12px] text-[color:var(--color-neutral-500)]">시군구 매칭</div>
            <div className="font-semibold tabular text-[color:var(--color-primary)]">
              {totals.sggMatched.toLocaleString()}건
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[color:var(--color-neutral-500)]">동·읍·면 매칭</div>
            <div className="font-semibold tabular text-[color:var(--color-primary)]">
              {totals.dongMatched.toLocaleString()}건
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-[14px] leading-[1.6] text-[color:var(--color-neutral-700)]">
        실시간 OpenAPI · 기재부 공공기관 채용정보. OpenAPI는 시·도까지 제공되며, 시·군·구·동은 공고 본문 정규식 매칭으로 추출.
      </p>
    </div>
  );
}

function SidoSelectedPanel({
  meta, stats, status, maxSido, sggMatched,
}: {
  meta: { code: string; name: string; nameEng: string };
  stats: RegionStats;
  status: StatusMode;
  maxSido: number;
  sggMatched: number;
}) {
  const value = status === 'active' ? stats.active : stats.total;
  const ratio = maxSido > 0 ? (value / maxSido) * 100 : 0;
  return (
    <div className="rounded-2xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary-light)] p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[15px] font-semibold text-[color:var(--color-primary)]">{meta.nameEng}</div>
          <h2 className="mt-0.5 text-[24px] font-bold text-[color:var(--color-neutral-800)]">{meta.name}</h2>
        </div>
        <span className="text-[15px] tabular text-[color:var(--color-neutral-500)]">{meta.code}</span>
      </div>
      <div className="mt-5 rounded-xl bg-white p-4">
        <div className="text-[15px] font-medium text-[color:var(--color-neutral-500)]">
          {status === 'active' ? '진행중 채용공고' : '누적 채용공고'}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[36px] font-bold tabular text-[color:var(--color-primary)]">
            {value.toLocaleString()}
          </span>
          <span className="text-[15px] text-[color:var(--color-neutral-500)]">건</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-primary-subtle)]">
          <div className="h-full rounded-full bg-[color:var(--color-primary)]"
            style={{ width: `${Math.max(2, ratio)}%` }} />
        </div>
        <div className="mt-1 text-[14px] text-[color:var(--color-neutral-500)]">
          전국 1위 대비 {ratio.toFixed(0)}%
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[color:var(--color-neutral-100)] pt-3 text-[14px]">
          <div>
            <div className="text-[12px] text-[color:var(--color-neutral-500)]">진행중</div>
            <div className="font-semibold tabular text-[color:var(--color-primary)]">
              {stats.active.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[color:var(--color-neutral-500)]">누적</div>
            <div className="font-semibold tabular text-[color:var(--color-neutral-700)]">
              {stats.total.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[12px] text-[color:var(--color-neutral-500)]">위치 매칭</div>
            <div className="font-semibold tabular text-[color:var(--color-neutral-700)]">
              {sggMatched.toLocaleString()} sgg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubSelectedPanel({
  parentName, sggName, sggCode, sggValue, sggMax, dongFeat, dongValue, dongMax, status,
}: {
  parentName: string;
  sggName: string;
  sggCode: string;
  sggValue: number;
  sggMax: number;
  dongFeat: Feature | null;
  dongValue: number | null;
  dongMax: number;
  status: StatusMode;
}) {
  const sggRatio = sggMax > 0 ? (sggValue / sggMax) * 100 : 0;
  const dongRatio = dongFeat && dongMax > 0 && dongValue !== null ? (dongValue / dongMax) * 100 : 0;
  const focusValue = dongFeat && dongValue !== null ? dongValue : sggValue;
  const focusName = dongFeat ? dongFeat.properties.name : sggName;
  const focusRatio = dongFeat ? dongRatio : sggRatio;
  const focusParentName = dongFeat ? sggName : parentName;
  return (
    <div className="rounded-2xl border border-[color:var(--color-primary)]/15 bg-[color:var(--color-primary-light)] p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[15px] font-semibold text-[color:var(--color-primary)]">
            {parentName}{dongFeat ? ` · ${sggName}` : ''}
          </div>
          <h2 className="mt-0.5 text-[24px] font-bold text-[color:var(--color-neutral-800)]">{focusName}</h2>
        </div>
        <span className="text-[15px] tabular text-[color:var(--color-neutral-500)]">
          {dongFeat?.properties.code ?? sggCode}
        </span>
      </div>
      <div className="mt-5 rounded-xl bg-white p-4">
        <div className="text-[15px] font-medium text-[color:var(--color-neutral-500)]">
          {status === 'active' ? '진행중 채용공고' : '누적 채용공고'}
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[36px] font-bold tabular text-[color:var(--color-primary)]">
            {focusValue.toLocaleString()}
          </span>
          <span className="text-[15px] text-[color:var(--color-neutral-500)]">건</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--color-primary-subtle)]">
          <div className="h-full rounded-full bg-[color:var(--color-primary)]"
            style={{ width: `${Math.max(2, focusRatio)}%` }} />
        </div>
        <div className="mt-1 text-[14px] text-[color:var(--color-neutral-500)]">
          {focusParentName} 1위 대비 {focusRatio.toFixed(0)}%
        </div>
      </div>
      <div className="mt-3 text-[12px] leading-[1.5] text-[color:var(--color-neutral-500)]">
        ※ 공고 본문(지원자격·전형방법 등)에서 시·군·구·동 키워드를 정규식 매칭한 결과.<br />
        OpenAPI는 시·도 단위만 제공하므로 본문에 위치가 명시되지 않은 공고는 카운트되지 않습니다.
      </div>
    </div>
  );
}

function DistChart({
  title, items, max,
}: {
  title: string;
  items: { code: string; name: string; n: number }[];
  max: number;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">{title}</h3>
      <ol className="mt-3 space-y-2.5">
        {items.map((g) => {
          const w = (g.n / max) * 100;
          return (
            <li key={g.code}>
              <div className="flex items-center justify-between gap-2 text-[14px]">
                <Link href={`/categories/${g.code}`}
                  className="flex min-w-0 items-center gap-2 text-[color:var(--color-neutral-700)] hover:text-[color:var(--color-primary)]">
                  <span className="font-semibold tabular text-[color:var(--color-neutral-500)]">{g.code}</span>
                  <span className="truncate">{g.name}</span>
                </Link>
                <span className="font-semibold tabular text-[color:var(--color-primary)]">
                  {g.n.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[color:var(--color-primary-subtle)]">
                <div className="h-full rounded-full bg-[color:var(--color-primary)]"
                  style={{ width: `${Math.max(2, w)}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RankPanel({ counts, onSelect }: { counts: Map<string, number>; onSelect: (code: string) => void }) {
  const top = SIDO_LIST.map((s) => ({ ...s, n: counts.get(s.code) ?? 0 }))
    .sort((a, b) => b.n - a.n).slice(0, 5);
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">시·도 Top 5</h3>
      <ol className="mt-3 space-y-2">
        {top.map((m, i) => (
          <li key={m.code} className="flex items-center gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--color-primary-light)] text-[14px] font-semibold text-[color:var(--color-primary)] tabular">
              {i + 1}
            </span>
            <button type="button" onClick={() => onSelect(m.code)}
              className="flex-1 text-left text-[16px] font-medium text-[color:var(--color-neutral-800)] hover:text-[color:var(--color-primary)]">
              {m.name}
            </button>
            <span className="text-[15px] font-semibold tabular text-[color:var(--color-primary)]">
              {m.n.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SggRankPanel({
  items, onSelect,
}: { items: { code: string; name: string; n: number }[]; onSelect: (code: string) => void }) {
  const top = items.slice().filter((m) => m.n > 0).sort((a, b) => b.n - a.n).slice(0, 8);
  if (top.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5 text-[14px] text-[color:var(--color-neutral-500)]">
        본문에 시·군·구가 명시된 공고가 없습니다.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">시·군·구 Top 8 (실 매칭)</h3>
      <ol className="mt-3 space-y-2">
        {top.map((m, i) => (
          <li key={m.code} className="flex items-center gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--color-primary-light)] text-[14px] font-semibold text-[color:var(--color-primary)] tabular">
              {i + 1}
            </span>
            <button type="button" onClick={() => onSelect(m.code)}
              className="flex-1 text-left text-[16px] font-medium text-[color:var(--color-neutral-800)] hover:text-[color:var(--color-primary)]">
              {m.name}
            </button>
            <span className="text-[15px] font-semibold tabular text-[color:var(--color-primary)]">
              {m.n.toLocaleString()}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OpeningsPanel({
  title, note, openings, moreHref,
}: {
  title: string;
  note?: string | null;
  openings: Opening[];
  moreHref: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">{title}</h3>
        <Link href={moreHref}
          className="text-[13px] font-semibold text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)]">
          전체 →
        </Link>
      </div>
      {note && <div className="mb-3 text-[12px] text-[color:var(--color-neutral-500)]">{note}</div>}
      <ul className="space-y-2">
        {openings.map((o) => {
          const left = typeof o.daysLeft === 'number' ? o.daysLeft : null;
          return (
            <li key={o.id}>
              <a href={o.srcUrl ?? '#'}
                target={o.srcUrl ? '_blank' : undefined}
                rel={o.srcUrl ? 'noopener noreferrer' : undefined}
                className="block rounded-lg bg-[color:var(--color-neutral-50)] px-3 py-2.5 transition hover:bg-[color:var(--color-primary-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-neutral-700)]">
                    {o.instKind}
                  </span>
                  {left !== null && left >= 0 && (
                    <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[11px] font-semibold text-white tabular">
                      {left === 0 ? '오늘 마감' : `D-${left}`}
                    </span>
                  )}
                  <span className="ml-auto text-[12px] text-[color:var(--color-neutral-500)]">
                    {o.rawHireType ?? ''}
                  </span>
                </div>
                <div className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-snug text-[color:var(--color-neutral-800)]">
                  {o.title}
                </div>
                <div className="mt-1 truncate text-[12px] text-[color:var(--color-neutral-500)]">
                  {o.org} · {o.rawNcsNames || (o.ncs || []).map((c) => NCS_LABEL[c] ?? c).join(', ')}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NoSamplePanel({
  level, regionName, moreHref, moreLabel,
}: {
  level: Level;
  regionName?: string;
  moreHref: string;
  moreLabel: string;
}) {
  const unit = level === 'dong' ? '동·읍·면' : level === 'sgg' ? '시·군·구' : '시·도';
  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-5">
      <h3 className="text-[18px] font-semibold text-[color:var(--color-neutral-800)]">
        {regionName ?? '이 지역'} 진행중 공고
      </h3>
      <p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--color-neutral-700)]">
        본문에 <strong>{regionName}</strong>이 명시된 진행중 공고가 없습니다.
      </p>
      <div className="mt-3 rounded-lg bg-[color:var(--color-neutral-50)] p-3 text-[12px] leading-[1.6] text-[color:var(--color-neutral-500)]">
        OpenAPI는 시·도 단위까지만 제공하며, {unit} 단위 카운트는 공고 본문에서 위치 키워드를 정규식 매칭한 결과만 표시합니다.
        본문에 위치가 명시되지 않은 공고는 카운트되지 않아요.
      </div>
      <Link href={moreHref}
        className="mt-3 inline-flex items-center gap-1 rounded-xl border-[1.5px] border-[color:var(--color-primary)] bg-white px-3 py-2 text-[14px] font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-light)]">
        {moreLabel} →
      </Link>
    </div>
  );
}
