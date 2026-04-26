'use client';

import { FILTER_AXES, type AxisDef, type AxisKey } from '@/lib/filters/axes';
import { useFilters } from '@/lib/filters/useFilters';
import { useEffect, useRef, useState } from 'react';

export function FilterBar({ compact = false }: { compact?: boolean }) {
  const { filter, toggle, clearAxis, clearAll } = useFilters();
  const totalActive = (Object.values(filter) as string[][]).reduce(
    (a, b) => a + b.length,
    0
  );

  return (
    <div
      className={
        'rounded-2xl border border-[color:var(--color-neutral-100)] bg-white ' +
        (compact ? 'p-3' : 'p-4')
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[color:var(--color-neutral-700)]">
            필터
          </span>
          <span className="text-[14px] text-[color:var(--color-neutral-500)]">
            NCS 동급 위계 5개 축
          </span>
        </div>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[14px] font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-error)]"
          >
            전체 초기화 · {totalActive}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_AXES.map((axis) => (
          <AxisDropdown
            key={axis.key}
            axis={axis}
            selected={filter[axis.key as keyof typeof filter] ?? []}
            onToggle={(code) => toggle(axis.key as keyof typeof filter, code)}
            onClear={() => clearAxis(axis.key as keyof typeof filter)}
          />
        ))}
      </div>
    </div>
  );
}

function AxisDropdown({
  axis,
  selected,
  onToggle,
  onClear,
}: {
  axis: AxisDef;
  selected: string[];
  onToggle: (code: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const active = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[15px] font-medium transition ' +
          (active
            ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
            : 'border-[color:var(--color-neutral-300)] bg-white text-[color:var(--color-neutral-700)] hover:border-[color:var(--color-neutral-500)]')
        }
      >
        <span>{axis.short}</span>
        {active && (
          <span className="rounded-full bg-[color:var(--color-primary)] px-1.5 text-[12px] font-semibold text-white tabular">
            {selected.length}
          </span>
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 4l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[280px] rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-3 shadow-[0_18px_40px_-12px_rgba(10,30,61,0.18)]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
                {axis.label}
              </div>
              <div className="text-[13px] text-[color:var(--color-neutral-500)]">
                {axis.description}
              </div>
            </div>
            {active && (
              <button
                type="button"
                onClick={onClear}
                className="text-[13px] font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-error)]"
              >
                해제
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {axis.options.map((opt) => {
              const sel = selected.includes(opt.code);
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onToggle(opt.code)}
                  className={
                    'flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition ' +
                    (sel
                      ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-light)]'
                      : 'border-[color:var(--color-neutral-100)] bg-white hover:border-[color:var(--color-neutral-300)]')
                  }
                >
                  <span
                    className={
                      'text-[14px] font-semibold ' +
                      (sel
                        ? 'text-[color:var(--color-primary)]'
                        : 'text-[color:var(--color-neutral-800)]')
                    }
                  >
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span className="text-[12px] text-[color:var(--color-neutral-500)]">
                      {opt.hint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActiveFilterChips() {
  const { filter, toggle } = useFilters();
  const chips: { axisKey: AxisKey; code: string; label: string }[] = [];
  for (const axis of FILTER_AXES) {
    for (const code of filter[axis.key as keyof typeof filter] ?? []) {
      const opt = axis.options.find((o) => o.code === code);
      if (opt)
        chips.push({
          axisKey: axis.key,
          code,
          label: `${axis.short} · ${opt.label}`,
        });
    }
  }
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <button
          key={c.axisKey + c.code}
          type="button"
          onClick={() => toggle(c.axisKey as keyof typeof filter, c.code)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary-light)] px-3 py-1 text-[14px] font-medium text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-subtle)]"
        >
          {c.label}
          <span className="text-[12px] opacity-70">×</span>
        </button>
      ))}
    </div>
  );
}
