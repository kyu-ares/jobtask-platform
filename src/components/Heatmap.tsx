// TradingView × FoamTree 하이브리드 트리맵 (Blaybus 톤)
// - 라이트 베이스, primary 단일 액센트
// - 다크 패널은 히트맵 컨테이너 한 곳만 임팩트 자리로 사용
// - 그루핑/SIZE/COLOR 토글로 측정 기준 자유 변경
// - 부모 그룹은 반투명 + 자식 셀이 squarified 트리맵으로 미리보기
// - 호버 시 마우스 옆에 floating preview card

'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import type { NcsTree } from '@/lib/ncs/types';
import {
  buildGroups,
  colorOf,
  heatColor,
  sizeOf,
  textOnHeat,
  COLOR_METRICS,
  SIZE_METRICS,
  type ColorMetric,
  type Grouping,
  type SizeMetric,
} from '@/lib/ncs/metrics';

interface CellNode {
  name: string;
  code: string;
  size: number;
  color: number;
  href: string;
  isGroup?: boolean;
  children?: CellNode[];
}

interface HoverState {
  data: CellNode;
  x: number;
  y: number;
  parent?: string;
}

export function Heatmap({
  tree,
  width = 1320,
  height = 760,
  viewportHeight,
  leafHrefPrefix,
  initialGrouping = 'lclas',
  focusLclas,
  focusMclas,
  leafHrefPattern,
  groupHrefPattern,
  hideToolbar = false,
}: {
  tree: NcsTree;
  width?: number;
  height?: number;
  /** 보이는 영역 높이(뷰포트). height보다 작으면 세로 스크롤 발생 */
  viewportHeight?: number;
  leafHrefPrefix?: string;
  initialGrouping?: Grouping;
  focusLclas?: string;
  focusMclas?: string;
  /** 리프 셀 href 패턴. `{cell}`=셀 코드, `{group}`=그룹 코드 치환 */
  leafHrefPattern?: string;
  /** 그룹 헤더 href 패턴. `{group}`=그룹 코드 치환 */
  groupHrefPattern?: string;
  hideToolbar?: boolean;
}) {
  const lockedGrouping: Grouping | null = focusMclas
    ? 'sclas'
    : focusLclas
    ? 'mclas'
    : null;
  const [grouping, setGrouping] = useState<Grouping>(lockedGrouping ?? initialGrouping);
  const effectiveGrouping = lockedGrouping ?? grouping;
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('jobCount');
  const [colorMetric, setColorMetric] = useState<ColorMetric>('demand');

  // focus에 맞춰 tree 서브셋
  const scopedTree = useMemo<NcsTree>(() => {
    if (!focusLclas && !focusMclas) return tree;
    let lclasList = tree.lclas;
    if (focusLclas) {
      lclasList = lclasList.filter((l) => l.code === focusLclas);
    }
    if (focusMclas) {
      lclasList = lclasList.map((l) => ({
        ...l,
        mclas: l.mclas.filter((m) => m.code === focusMclas),
      }));
    }
    return { summary: tree.summary, lclas: lclasList };
  }, [tree, focusLclas, focusMclas]);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(
    () => buildGroups(scopedTree, effectiveGrouping),
    [scopedTree, effectiveGrouping]
  );

  const groupRoot = useMemo(() => {
    const data: CellNode = {
      name: 'root',
      code: 'root',
      size: 0,
      color: 0,
      href: '#',
      isGroup: true,
      children: groups.map((g) => {
        const childSize = g.cells.reduce(
          (a, c) => a + sizeOf({ code: c.code }, sizeMetric),
          0
        );
        return {
          name: g.group.name,
          code: g.group.code,
          size: Math.max(childSize, 1),
          color: 0,
          href: `/categories/${g.group.code}`,
          isGroup: true,
          children: g.cells.map((c) => ({
            name: c.name,
            code: c.code,
            size: sizeOf({ code: c.code }, sizeMetric),
            color: colorOf(c.code, colorMetric),
            href: leafHrefPattern
              ? leafHrefPattern.replace('{cell}', c.code).replace('{group}', g.group.code)
              : effectiveGrouping === 'lclas'
              ? `/categories/${g.group.code}/${c.code}`
              : effectiveGrouping === 'mclas'
              ? `/categories/${g.group.code.slice(0, 2)}/${g.group.code}/${c.code}`
              : `${leafHrefPrefix ?? '/jobs'}/${c.code}`,
          })),
        };
      }),
    };
    const root = hierarchy(data)
      .sum((d) => (d.children ? 0 : d.size))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    treemap<CellNode>()
      .tile(treemapSquarify)
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(28)
      .paddingInner(3)
      .round(true)(root);
    return root;
  }, [groups, sizeMetric, colorMetric, effectiveGrouping, width, height, leafHrefPattern, leafHrefPrefix]);

  function trackMouse(e: React.MouseEvent, data: CellNode, parent?: string) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({
      data,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      parent,
    });
  }

  return (
    <div className="space-y-4">
      {!hideToolbar && (
        <Toolbar
          grouping={effectiveGrouping}
          sizeMetric={sizeMetric}
          colorMetric={colorMetric}
          onGroupingChange={lockedGrouping ? () => {} : setGrouping}
          onSizeMetricChange={setSizeMetric}
          onColorMetricChange={setColorMetric}
          disableGrouping={!!lockedGrouping}
        />
      )}

      <div
        ref={containerRef}
        className="bg-hero-dark relative rounded-2xl p-3 shadow-[0_24px_60px_-20px_rgba(10,30,61,0.35)]"
        style={
          viewportHeight
            ? { maxHeight: viewportHeight, overflowY: 'auto', overflowX: 'hidden' }
            : { overflow: 'hidden' }
        }
        onMouseLeave={() => {
          setHover(null);
          setHoverGroup(null);
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMin meet"
          className="w-full"
          style={{ height: 'auto', display: 'block' }}
          role="img"
          aria-label="NCS Heatmap"
        >
          {groupRoot.children?.map((g) => {
            const x = g.x0!;
            const y = g.y0!;
            const w = g.x1! - g.x0!;
            const h = g.y1! - g.y0!;
            const isHover = hoverGroup === g.data.code;
            const groupHref = groupHrefPattern
              ? groupHrefPattern.replace('{group}', g.data.code)
              : null;
            const headerH = Math.min(30, h);
            return (
              <g key={g.data.code}>
                {/* 1) 배경 rect — 클릭 X, 셀들이 이 위에 렌더됨 */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="rgba(124,200,255,0.05)"
                  stroke={
                    groupHref && isHover
                      ? 'rgba(124,200,255,1)'
                      : isHover
                      ? 'rgba(124,200,255,0.85)'
                      : 'rgba(255,255,255,0.10)'
                  }
                  strokeWidth={isHover ? 1.5 : 1}
                  rx={10}
                  pointerEvents="none"
                />

                {/* 2) 헤더 영역만 Link로 감쌈 (셀 영역과 분리) */}
                {groupHref ? (
                  <Link href={groupHref} scroll={false}>
                    <g
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoverGroup(g.data.code)}
                      onMouseLeave={() => setHoverGroup(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={headerH}
                        fill="transparent"
                      />
                      {w > 110 && h > 36 && (
                        <>
                          <text
                            x={x + 12}
                            y={y + 18}
                            fontSize={14}
                            fontWeight={500}
                            fill="rgba(255,255,255,0.55)"
                            pointerEvents="none"
                          >
                            {g.data.code}
                          </text>
                          <text
                            x={x + w - 12}
                            y={y + 18}
                            textAnchor="end"
                            fontSize={15}
                            fontWeight={600}
                            fill={isHover ? '#7CC8FF' : 'rgba(255,255,255,0.95)'}
                            pointerEvents="none"
                          >
                            {g.data.name}
                            <tspan dx="6" fontSize={12} fill="rgba(124,200,255,0.75)">
                              →
                            </tspan>
                          </text>
                        </>
                      )}
                    </g>
                  </Link>
                ) : (
                  w > 110 &&
                  h > 36 && (
                    <>
                      <text
                        x={x + 12}
                        y={y + 18}
                        fontSize={14}
                        fontWeight={500}
                        fill="rgba(255,255,255,0.55)"
                        pointerEvents="none"
                      >
                        {g.data.code}
                      </text>
                      <text
                        x={x + w - 12}
                        y={y + 18}
                        textAnchor="end"
                        fontSize={15}
                        fontWeight={600}
                        fill="rgba(255,255,255,0.95)"
                        pointerEvents="none"
                      >
                        {g.data.name}
                      </text>
                    </>
                  )
                )}
              </g>
            );
          })}

          {groupRoot.leaves().map((leaf) => {
            const x = leaf.x0!;
            const y = leaf.y0!;
            const w = leaf.x1! - leaf.x0!;
            const h = leaf.y1! - leaf.y0!;
            if (w < 2 || h < 2) return null;
            const c = leaf.data;
            const fill = heatColor(c.color, 0.94);
            const fg = textOnHeat(c.color);
            const showCode = w > 56 && h > 28;
            const showName = w > 80 && h > 46;
            const showSize = w > 96 && h > 70;
            const parentCode = leaf.parent?.data.code ?? c.code;
            return (
              <Link key={c.code} href={c.href} scroll={false}>
                <g
                  className="cell cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoverGroup(parentCode);
                    trackMouse(e, c, parentCode);
                  }}
                  onMouseMove={(e) => trackMouse(e, c, parentCode)}
                  onMouseLeave={() => {
                    setHover(null);
                  }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke="rgba(10,30,61,0.18)"
                    strokeWidth={0.6}
                    rx={4}
                  />
                  {showCode && (
                    <text
                      x={x + 8}
                      y={y + 16}
                      fontSize={12}
                      fontWeight={500}
                      fill={fg === '#ffffff' ? 'rgba(255,255,255,0.7)' : '#6B7280'}
                    >
                      {c.code}
                    </text>
                  )}
                  {showName && (
                    <text
                      x={x + 8}
                      y={y + 32}
                      fontSize={Math.min(14, Math.max(12, w / 11))}
                      fontWeight={600}
                      fill={fg}
                    >
                      {truncate(c.name, Math.floor(w / 8))}
                    </text>
                  )}
                  {showSize && (
                    <text
                      x={x + 8}
                      y={y + h - 10}
                      fontSize={12}
                      fontWeight={500}
                      fill={fg === '#ffffff' ? 'rgba(255,255,255,0.78)' : '#333333'}
                    >
                      {Math.round(c.size).toLocaleString()}
                      {SIZE_METRICS[sizeMetric].suffix}
                    </text>
                  )}
                </g>
              </Link>
            );
          })}
        </svg>

        {hover && (
          <HoverCard
            data={hover.data}
            x={hover.x}
            y={hover.y}
            sizeMetric={sizeMetric}
            colorMetric={colorMetric}
          />
        )}

        <Legend colorMetric={colorMetric} />
      </div>
    </div>
  );
}

function HoverCard({
  data,
  x,
  y,
  sizeMetric,
  colorMetric,
}: {
  data: CellNode;
  x: number;
  y: number;
  sizeMetric: SizeMetric;
  colorMetric: ColorMetric;
}) {
  const sizeMeta = SIZE_METRICS[sizeMetric];
  const colorMeta = COLOR_METRICS[colorMetric];
  // 마우스 우측 12px 아래 배치, 우측 경계 가까우면 좌측으로
  const flipX = x > 1080;
  const flipY = y > 600;
  const style: React.CSSProperties = {
    left: flipX ? undefined : x + 14,
    right: flipX ? 1320 - x + 14 : undefined,
    top: flipY ? undefined : y + 14,
    bottom: flipY ? 760 - y + 14 : undefined,
  };
  return (
    <div
      className="pointer-events-none absolute z-10 w-[260px] rounded-xl border border-white/15 bg-white/95 p-3.5 text-[color:var(--color-neutral-800)] shadow-[0_18px_40px_-12px_rgba(10,30,61,0.35)] backdrop-blur"
      style={style}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tabular text-[color:var(--color-neutral-500)]">
          {data.code}
        </span>
        <span className="rounded-full bg-[color:var(--color-primary-light)] px-2 py-0.5 text-[12px] font-semibold text-[color:var(--color-primary)]">
          진입 →
        </span>
      </div>
      <div className="mt-1.5 text-[15px] font-semibold leading-tight text-[color:var(--color-neutral-800)]">
        {data.name}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[color:var(--color-neutral-100)] pt-3">
        <div>
          <div className="text-[11px] font-medium text-[color:var(--color-neutral-500)]">
            {sizeMeta.label}
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tabular">
            {Math.round(data.size).toLocaleString()}
            <span className="ml-0.5 text-[12px] font-medium text-[color:var(--color-neutral-500)]">
              {sizeMeta.suffix ?? ''}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[color:var(--color-neutral-500)]">
            {colorMeta.label}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold tabular">
            <span
              className="inline-block h-3 w-3 rounded"
              style={{ background: heatColor(data.color, 1) }}
            />
            {(data.color * 100).toFixed(0)}
            <span className="text-[12px] font-medium text-[color:var(--color-neutral-500)]">
              {colorMeta.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, Math.max(1, n - 1)) + '…';
}

function Toolbar({
  grouping,
  sizeMetric,
  colorMetric,
  onGroupingChange,
  onSizeMetricChange,
  onColorMetricChange,
  disableGrouping,
}: {
  grouping: Grouping;
  sizeMetric: SizeMetric;
  colorMetric: ColorMetric;
  onGroupingChange: (g: Grouping) => void;
  onSizeMetricChange: (m: SizeMetric) => void;
  onColorMetricChange: (m: ColorMetric) => void;
  disableGrouping?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-4 py-3 text-[15px]">
      {!disableGrouping && (
        <>
          <Segment
            label="그룹"
            value={grouping}
            options={[
              { v: 'lclas', l: '대분류' },
              { v: 'mclas', l: '중분류' },
              { v: 'sclas', l: '소분류' },
            ]}
            onChange={(v) => onGroupingChange(v as Grouping)}
          />
          <Divider />
        </>
      )}
      <Segment
        label="면적"
        value={sizeMetric}
        options={Object.entries(SIZE_METRICS).map(([k, v]) => ({ v: k, l: v.label }))}
        onChange={(v) => onSizeMetricChange(v as SizeMetric)}
      />
      <Divider />
      <Segment
        label="색상"
        value={colorMetric}
        options={Object.entries(COLOR_METRICS).map(([k, v]) => ({ v: k, l: v.label }))}
        onChange={(v) => onColorMetricChange(v as ColorMetric)}
      />
    </div>
  );
}

function Segment({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { v: string; l: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[15px] font-semibold text-[color:var(--color-neutral-500)]">
        {label}
      </span>
      <div className="flex overflow-hidden rounded-xl border border-[color:var(--color-neutral-100)]">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={
              'px-4 py-1.5 text-[15px] font-medium transition ' +
              (value === o.v
                ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
                : 'text-[color:var(--color-neutral-500)] hover:bg-[color:var(--color-neutral-50)] hover:text-[color:var(--color-neutral-800)]')
            }
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="h-5 w-px bg-[color:var(--color-neutral-100)]" />;
}

function Legend({ colorMetric }: { colorMetric: ColorMetric }) {
  const { label, unit } = COLOR_METRICS[colorMetric];
  return (
    <div className="sticky bottom-2 ml-auto mr-2 mt-[-44px] flex w-fit items-center gap-3 rounded-xl border border-white/15 bg-[#0a1e3d]/70 px-3.5 py-2 text-[14px] text-white backdrop-blur">
      <span className="font-semibold">{label}</span>
      <div
        className="h-2.5 w-36 rounded-full"
        style={{
          background:
            'linear-gradient(to right, rgb(220,38,38), rgb(243,244,246), rgb(0,108,209))',
        }}
      />
      <span className="text-white/75">−{unit}</span>
      <span className="text-white/75">+{unit}</span>
    </div>
  );
}
