// Sunburst 방사형 시각화 — 4계층 동심원 (대→중→소→세)
// Blaybus 톤: primary 단일 농도 (링별로 진해짐), 다크 패널 위에 표시
// 클릭 시 해당 sector를 root로 줌인, 중앙 클릭 시 줌아웃

'use client';

import { useMemo, useState } from 'react';
import { hierarchy, partition, type HierarchyRectangularNode } from 'd3-hierarchy';
import { arc as d3arc } from 'd3-shape';
import Link from 'next/link';
import type { NcsTree } from '@/lib/ncs/types';

interface Node {
  name: string;
  code: string;
  href: string;
  value: number;
  children?: Node[];
}

function buildData(tree: NcsTree): Node {
  return {
    name: 'NCS',
    code: 'root',
    href: '/categories',
    value: 0,
    children: tree.lclas.map((l) => ({
      name: l.name,
      code: l.code,
      href: `/categories/${l.code}`,
      value: l.mclas.length === 0 ? 1 : 0,
      children:
        l.mclas.length === 0
          ? undefined
          : l.mclas.map((m) => ({
              name: m.name,
              code: m.code,
              href: `/categories/${l.code}/${m.code}`,
              value: m.sclas.length === 0 ? 1 : 0,
              children:
                m.sclas.length === 0
                  ? undefined
                  : m.sclas.map((s) => ({
                      name: s.name,
                      code: s.code,
                      href: `/categories/${l.code}/${m.code}/${s.code}`,
                      value: s.subd.length === 0 ? 1 : 0,
                      children:
                        s.subd.length === 0
                          ? undefined
                          : s.subd.map((d) => ({
                              name: d.name,
                              code: d.code,
                              href: `/jobs/${d.code}`,
                              value: Math.max(d.unitCount, 1),
                            })),
                    })),
            })),
    })),
  };
}

// 링 깊이별 primary 농도 (1=가장 진함, 4=가장 옅음)
function ringFill(depth: number, hover: boolean) {
  const map = [
    { fill: 'rgba(0,108,209,0.92)', text: '#fff' },     // depth 1 (lclas)
    { fill: 'rgba(0,108,209,0.62)', text: '#fff' },     // depth 2 (mclas)
    { fill: 'rgba(0,108,209,0.36)', text: '#0A1E3D' },  // depth 3 (sclas)
    { fill: 'rgba(0,108,209,0.18)', text: '#0A1E3D' },  // depth 4 (subd)
  ];
  const t = map[Math.min(depth - 1, 3)];
  return {
    fill: hover ? 'rgba(124,200,255,0.95)' : t.fill,
    text: hover ? '#0A1E3D' : t.text,
  };
}

export function Sunburst({
  tree,
  size = 720,
}: {
  tree: NcsTree;
  size?: number;
}) {
  const radius = size / 2;
  const root = useMemo(() => {
    const data = buildData(tree);
    return hierarchy<Node>(data)
      .sum((d) => (d.children ? 0 : d.value))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [tree]);

  const [focusCode, setFocusCode] = useState<string>('root');

  // 현재 focus node를 찾아 그 서브트리만 렌더
  const focused = useMemo(() => {
    const find = (
      n: HierarchyRectangularNode<Node> | ReturnType<typeof root.descendants>[number]
    ): typeof n | null => {
      if (n.data.code === focusCode) return n as never;
      for (const c of n.children ?? []) {
        const f = find(c as never);
        if (f) return f;
      }
      return null;
    };
    const laid = partition<Node>().size([2 * Math.PI, radius])(root) as HierarchyRectangularNode<Node>;
    const f = (find(laid) as HierarchyRectangularNode<Node> | null) ?? laid;
    // focus를 새 root로 두고 다시 partition (레이아웃 정규화)
    const sub = hierarchy<Node>(f.data)
      .sum((d) => (d.children ? 0 : d.value))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    const sublaid = partition<Node>().size([2 * Math.PI, radius])(sub);
    return sublaid;
  }, [root, focusCode, radius]);

  const arcGen = d3arc<HierarchyRectangularNode<Node>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1)
    .padAngle(0.005)
    .padRadius(radius / 4)
    .cornerRadius(2);

  const [hover, setHover] = useState<HierarchyRectangularNode<Node> | null>(null);
  const focusName = focused.data.name === 'NCS' ? 'NCS 전체' : focused.data.name;
  const focusCount = focused.descendants().length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--color-neutral-100)] bg-white px-4 py-3">
        <span className="text-[15px] font-semibold text-[color:var(--color-neutral-500)]">
          포커스
        </span>
        <span className="rounded-full bg-[color:var(--color-primary-light)] px-3 py-1 text-[15px] font-semibold text-[color:var(--color-primary)]">
          {focusName}
        </span>
        <span className="text-[15px] text-[color:var(--color-neutral-500)]">
          하위 {focusCount.toLocaleString()}개
        </span>
        {focusCode !== 'root' && (
          <button
            type="button"
            onClick={() => setFocusCode('root')}
            className="ml-auto rounded-xl border border-[color:var(--color-primary)] px-3 py-1.5 text-[15px] font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary-light)]"
          >
            전체로 돌아가기
          </button>
        )}
      </div>

      <div className="bg-hero-dark relative overflow-hidden rounded-2xl p-6 shadow-[0_24px_60px_-20px_rgba(10,30,61,0.35)]">
        <svg
          viewBox={`-${radius} -${radius} ${size} ${size}`}
          className="block w-full h-auto max-h-[720px]"
          role="img"
          aria-label="NCS Sunburst"
        >
          {focused.descendants().filter((d) => d.depth > 0).map((d) => {
            const h = hover?.data.code === d.data.code;
            const { fill, text } = ringFill(d.depth, h);
            const path = arcGen(d) || '';
            // 텍스트 위치
            const ang = (d.x0 + d.x1) / 2;
            const r = (d.y0 + d.y1) / 2;
            const x = Math.sin(ang) * r;
            const y = -Math.cos(ang) * r;
            const arcSize = (d.x1 - d.x0) * r;
            const showText = arcSize > 28 && d.y1 - d.y0 > 18;
            const rotation = ((ang * 180) / Math.PI) - 90;
            const flip = ang > Math.PI;

            return (
              <Link key={d.data.code + '-' + d.depth} href={d.data.href}>
                <g
                  className="cursor-pointer transition"
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    if ((d.children?.length ?? 0) > 0) {
                      e.preventDefault();
                      setFocusCode(d.data.code);
                    }
                  }}
                >
                  <path d={path} fill={fill} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
                  {showText && (
                    <text
                      x={x}
                      y={y}
                      transform={`rotate(${flip ? rotation + 180 : rotation}, ${x}, ${y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.min(13, Math.max(11, arcSize / 8))}
                      fontWeight={600}
                      fill={text}
                      style={{ pointerEvents: 'none' }}
                    >
                      {truncate(d.data.name, Math.floor(arcSize / 7))}
                    </text>
                  )}
                </g>
              </Link>
            );
          })}

          {/* 중앙 라벨 */}
          <g style={{ pointerEvents: 'none' }}>
            <circle r={radius * 0.18} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" />
            <text textAnchor="middle" y={-4} fontSize={13} fill="rgba(255,255,255,0.7)" fontWeight={500}>
              {focusName}
            </text>
            <text textAnchor="middle" y={14} fontSize={11} fill="rgba(255,255,255,0.5)">
              {focusCount.toLocaleString()} items
            </text>
          </g>
        </svg>

        {hover && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
            <div className="text-[13px] tabular text-white/70">{hover.data.code}</div>
            <div className="mt-0.5 text-[16px] font-semibold">{hover.data.name}</div>
            <div className="mt-1 text-[13px] text-white/70">
              {hover.children?.length ? `자식 ${hover.children.length}개 · 클릭하여 줌인` : '직무 진입'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function truncate(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, Math.max(1, n - 1)) + '…';
}
