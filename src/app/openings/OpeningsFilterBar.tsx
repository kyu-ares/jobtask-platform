'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

interface Option {
  code: string;
  label: string;
  n: number;
}

interface Current {
  q: string;
  sido: string[];
  inst: string[];
  job: string[];
  ncs: string[];
  status: 'active' | 'closed' | 'all';
  sort: 'deadline' | 'recent' | 'views';
}

export function OpeningsFilterBar({
  sidoOptions,
  instOptions,
  jobOptions,
  ncsOptions,
  current,
}: {
  sidoOptions: Option[];
  instOptions: Option[];
  jobOptions: Option[];
  ncsOptions: Option[];
  current: Current;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(current.q);

  function update(patch: Partial<Record<string, string | string[] | null>>) {
    const params = new URLSearchParams(sp.toString());
    params.delete('page');
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || (Array.isArray(v) && v.length === 0) || v === '') {
        params.delete(k);
      } else if (Array.isArray(v)) {
        params.set(k, v.join(','));
      } else {
        params.set(k, v);
      }
    }
    startTransition(() => router.push(`/openings?${params.toString()}`));
  }

  function toggleArray(key: 'sido' | 'inst' | 'job' | 'ncs', code: string) {
    const cur = current[key];
    const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code];
    update({ [key]: next });
  }

  function clearAll() {
    startTransition(() => router.push('/openings'));
    setQ('');
  }

  const totalActive =
    current.sido.length +
    current.inst.length +
    current.job.length +
    current.ncs.length +
    (current.q ? 1 : 0) +
    (current.status !== 'all' ? 1 : 0);

  return (
    <div className="rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: q.trim() });
          }}
          className="flex flex-1 min-w-[260px] items-center gap-2 rounded-xl border border-[color:var(--color-neutral-300)] bg-white px-3 focus-within:border-[color:var(--color-primary)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·기관·직급 검색"
            className="flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[color:var(--color-neutral-500)]"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                update({ q: null });
              }}
              className="text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-neutral-800)]"
            >
              ×
            </button>
          )}
        </form>

        <Segmented
          value={current.status}
          onChange={(v) => update({ status: v === 'active' ? null : v })}
          options={[
            { v: 'active', l: '진행중' },
            { v: 'closed', l: '마감' },
            { v: 'all', l: '누적' },
          ]}
        />

        <Segmented
          value={current.sort}
          onChange={(v) => update({ sort: v === 'deadline' ? null : v })}
          options={[
            { v: 'deadline', l: '마감 임박' },
            { v: 'recent', l: '최신순' },
            { v: 'views', l: '조회순' },
          ]}
        />

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
        <Dropdown
          label="지역"
          short="시도"
          options={sidoOptions}
          selected={current.sido}
          onToggle={(c) => toggleArray('sido', c)}
          onClear={() => update({ sido: null })}
        />
        <Dropdown
          label="기관구분"
          short="기관"
          options={instOptions}
          selected={current.inst}
          onToggle={(c) => toggleArray('inst', c)}
          onClear={() => update({ inst: null })}
        />
        <Dropdown
          label="채용 종류"
          short="종류"
          options={jobOptions}
          selected={current.job}
          onToggle={(c) => toggleArray('job', c)}
          onClear={() => update({ job: null })}
        />
        <Dropdown
          label="NCS 대분류"
          short="NCS"
          options={ncsOptions}
          selected={current.ncs}
          onToggle={(c) => toggleArray('ncs', c)}
          onClear={() => update({ ncs: null })}
        />
      </div>
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-[color:var(--color-neutral-300)]">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={
            'px-3 py-1.5 text-[14px] font-medium transition ' +
            (value === o.v
              ? 'bg-[color:var(--color-primary-light)] text-[color:var(--color-primary)]'
              : 'text-[color:var(--color-neutral-700)] hover:bg-[color:var(--color-neutral-50)]')
          }
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Dropdown({
  label,
  short,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  short: string;
  options: Option[];
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
        <span>{short}</span>
        {active && (
          <span className="rounded-full bg-[color:var(--color-primary)] px-1.5 text-[12px] font-semibold text-white tabular">
            {selected.length}
          </span>
        )}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 4l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[320px] rounded-2xl border border-[color:var(--color-neutral-100)] bg-white p-3 shadow-[0_18px_40px_-12px_rgba(10,30,61,0.18)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[color:var(--color-neutral-800)]">
              {label}
            </span>
            {active && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-[13px] font-medium text-[color:var(--color-neutral-500)] hover:text-[color:var(--color-error)]"
              >
                해제
              </button>
            )}
          </div>
          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {options.map((o) => {
              const sel = selected.includes(o.code);
              return (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => onToggle(o.code)}
                  className={
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ' +
                    (sel
                      ? 'bg-[color:var(--color-primary-light)]'
                      : 'hover:bg-[color:var(--color-neutral-50)]')
                  }
                >
                  <span
                    className={
                      'text-[14px] ' +
                      (sel
                        ? 'font-semibold text-[color:var(--color-primary)]'
                        : 'text-[color:var(--color-neutral-800)]')
                    }
                  >
                    {o.label}
                  </span>
                  <span className="text-[13px] tabular text-[color:var(--color-neutral-500)]">
                    {o.n.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
