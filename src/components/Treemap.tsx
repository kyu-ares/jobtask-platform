// 서버 컴포넌트로 동작 가능한 D3 treemap 렌더러
// 클릭 시 해당 카테고리 페이지로 이동하는 SSR-friendly 구현

import { hierarchy, treemap, type HierarchyRectangularNode } from 'd3-hierarchy';
import Link from 'next/link';
import type { NcsTree, NcsLclas } from '@/lib/ncs/types';

interface TreemapNode {
  name: string;
  code: string;
  href: string;
  value: number;
  children?: TreemapNode[];
}

function lclasToNode(l: NcsLclas): TreemapNode {
  // 시드 단계에서 mclas가 비어있을 수 있어 최소 1로 보정
  const value =
    l.mclas.reduce(
      (acc, m) => acc + m.sclas.reduce((a, s) => a + s.subd.length || 1, 0) || 1,
      0
    ) || 1;
  return {
    name: l.name,
    code: l.code,
    href: `/categories/${l.code}`,
    value,
  };
}

const PALETTE = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#06b6d4', '#84cc16', '#f43f5e', '#6366f1', '#14b8a6',
  '#eab308', '#a855f7', '#22c55e', '#0ea5e9', '#d946ef',
  '#f97316', '#0891b2', '#7c3aed', '#dc2626', '#0d9488',
  '#65a30d', '#c026d3', '#0284c7', '#4f46e5',
];

export function Treemap({
  tree,
  width = 1200,
  height = 700,
}: {
  tree: NcsTree;
  width?: number;
  height?: number;
}) {
  const root = hierarchy<TreemapNode>({
    name: 'NCS',
    code: 'root',
    href: '/',
    value: 0,
    children: tree.lclas.map(lclasToNode),
  })
    .sum((d) => d.value)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const layout = treemap<TreemapNode>().size([width, height]).padding(3).round(true);
  const laidOut = layout(root) as HierarchyRectangularNode<TreemapNode>;

  const leaves = laidOut.leaves();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      role="img"
      aria-label="NCS 대분류 트리맵"
    >
      {leaves.map((node, i) => {
        const x = node.x0!;
        const y = node.y0!;
        const w = node.x1! - node.x0!;
        const h = node.y1! - node.y0!;
        const data = node.data;
        const fill = PALETTE[i % PALETTE.length];
        const showLabel = w > 60 && h > 28;
        return (
          <Link key={data.code} href={data.href}>
            <g className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={fill}
                fillOpacity={0.85}
                className="transition-[fill-opacity] group-hover:fill-opacity-100"
              />
              {showLabel && (
                <>
                  <text
                    x={x + 8}
                    y={y + 18}
                    fontSize={10}
                    fontFamily="ui-monospace, monospace"
                    fill="rgba(255,255,255,0.85)"
                  >
                    {data.code}
                  </text>
                  <text
                    x={x + 8}
                    y={y + 36}
                    fontSize={13}
                    fontWeight={600}
                    fill="#fff"
                  >
                    {data.name}
                  </text>
                </>
              )}
            </g>
          </Link>
        );
      })}
    </svg>
  );
}
