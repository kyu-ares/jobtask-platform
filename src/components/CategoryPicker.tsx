'use client';

// 리멤버 커리어 스타일 3컬럼 캐스케이딩 카테고리 피커
// - 1열: 대분류 (단일 선택 = 호버/클릭으로 2열 갱신)
// - 2열: 중분류 (단일 선택 = 클릭으로 3열 갱신)
// - 3열: 세부 (다중 선택, 칩 UI)
// - 직무(Track) / 산업(KSIC) 2 모드 탭 상단 전환
// - 다크 오버레이 모달 + 하단: 선택 초기화 / 닫기 / 적용

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TrackTree } from '@/lib/track/types';
import type { NcsTree } from '@/lib/ncs/types';

type Mode = 'job' | 'industry';

interface Props {
  trackTree: TrackTree;
  ksicTree: NcsTree;
  /** 버튼/트리거 렌더. 전달 안 하면 기본 트리거(칩 두 개) */
  renderTrigger?: (open: (mode: Mode) => void, selectedCount: { job: number; industry: number }) => React.ReactNode;
  /** 초기 모드 (기본 job) */
  initialMode?: Mode;
}

export function CategoryPicker({ trackTree, ksicTree, renderTrigger, initialMode = 'job' }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [lclasCode, setLclasCode] = useState<string | null>(null);
  const [mclasCode, setMclasCode] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [selectedInds, setSelectedInds] = useState<Set<string>>(new Set());
  const router = useRouter();

  // ESC 닫기 + body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 모드 변경 시 컬럼 선택 리셋
  useEffect(() => {
    setLclasCode(null);
    setMclasCode(null);
  }, [mode]);

  // 현재 트리 (모드별)
  const tree = mode === 'job' ? trackTree : ksicTree;

  const lclasList = tree.lclas;
  const currentLclas = lclasCode ? lclasList.find((l) => l.code === lclasCode) : null;
  const mclasList = currentLclas?.mclas ?? [];
  const currentMclas = mclasCode ? mclasList.find((m) => m.code === mclasCode) : null;

  // 3열 subd 목록 (모드별 타입이 달라서 통일)
  const subdList: { code: string; name: string }[] = useMemo(() => {
    if (!currentMclas) return [];
    if (mode === 'job') {
      // TrackMclas.subd
      return (currentMclas as TrackTree['lclas'][number]['mclas'][number]).subd;
    }
    // KSIC (NcsTree): mclas.sclas → 3열에 표시
    const sclas = (currentMclas as NcsTree['lclas'][number]['mclas'][number]).sclas;
    return sclas.map((s) => ({ code: s.code, name: s.name }));
  }, [currentMclas, mode]);

  const selectedSet = mode === 'job' ? selectedJobs : selectedInds;
  const setSelected = mode === 'job' ? setSelectedJobs : setSelectedInds;

  function toggleSubd(code: string) {
    const next = new Set(selectedSet);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelected(next);
  }

  function resetAll() {
    if (mode === 'job') setSelectedJobs(new Set());
    else setSelectedInds(new Set());
    setLclasCode(null);
    setMclasCode(null);
  }

  function apply() {
    // 선택된 코드들을 URL 쿼리로 전달해 히트맵/리스트 필터링에 사용
    const p = new URLSearchParams();
    if (selectedJobs.size) p.set('track', [...selectedJobs].join(','));
    if (selectedInds.size) p.set('ksic', [...selectedInds].join(','));
    const q = p.toString();
    // 모드별 기본 목적지. 추후 /openings?filters 로 붙여도 됨.
    const dest = mode === 'job' ? '/track/heatmap' : '/industry/heatmap';
    router.push(q ? `${dest}?${q}` : dest);
    setOpen(false);
  }

  const trigger = renderTrigger ? (
    renderTrigger(
      (m) => {
        setMode(m);
        setOpen(true);
      },
      { job: selectedJobs.size, industry: selectedInds.size }
    )
  ) : (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setMode('job');
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-neutral-200)] bg-white px-4 py-2 text-[14px] font-semibold text-[color:var(--color-neutral-800)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
      >
        <span>직무</span>
        {selectedJobs.size > 0 && (
          <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[11px] font-bold text-white">
            {selectedJobs.size}
          </span>
        )}
        <span className="text-[color:var(--color-neutral-400)]">▾</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setMode('industry');
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-neutral-200)] bg-white px-4 py-2 text-[14px] font-semibold text-[color:var(--color-neutral-800)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
      >
        <span>산업·업종</span>
        {selectedInds.size > 0 && (
          <span className="rounded-full bg-[color:var(--color-primary)] px-2 py-0.5 text-[11px] font-bold text-white">
            {selectedInds.size}
          </span>
        )}
        <span className="text-[color:var(--color-neutral-400)]">▾</span>
      </button>
    </div>
  );

  return (
    <>
      {trigger}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="flex w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl bg-[#1A1D24] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header + mode tabs */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 pt-5 pb-3">
              <div className="flex items-center gap-6">
                <h3 className="text-[20px] font-bold">
                  {mode === 'job' ? '직무 선택' : '업종 선택'}
                </h3>
                <div className="flex gap-1 rounded-full bg-white/5 p-1 text-[13px]">
                  <button
                    type="button"
                    onClick={() => setMode('job')}
                    className={
                      'rounded-full px-3.5 py-1 font-semibold transition ' +
                      (mode === 'job'
                        ? 'bg-white text-[#1A1D24]'
                        : 'text-white/60 hover:text-white')
                    }
                  >
                    직무
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('industry')}
                    className={
                      'rounded-full px-3.5 py-1 font-semibold transition ' +
                      (mode === 'industry'
                        ? 'bg-white text-[#1A1D24]'
                        : 'text-white/60 hover:text-white')
                    }
                  >
                    산업·업종
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 3 columns */}
            <div className="grid grid-cols-3 divide-x divide-white/10">
              <Column>
                {lclasList.map((l) => {
                  const active = lclasCode === l.code;
                  return (
                    <RowButton
                      key={l.code}
                      onClick={() => {
                        setLclasCode(l.code);
                        setMclasCode(null);
                      }}
                      active={active}
                    >
                      <span className="flex-1 truncate">{l.name}</span>
                      <span className="text-white/30 group-hover:text-white/60">›</span>
                    </RowButton>
                  );
                })}
              </Column>

              <Column>
                {mclasList.length === 0 ? (
                  <EmptyHint>대분류를 먼저 선택하세요</EmptyHint>
                ) : (
                  mclasList.map((m) => {
                    const active = mclasCode === m.code;
                    return (
                      <RowButton
                        key={m.code}
                        onClick={() => setMclasCode(m.code)}
                        active={active}
                      >
                        <span className="flex-1 truncate">{m.name}</span>
                        <span className="text-white/30 group-hover:text-white/60">›</span>
                      </RowButton>
                    );
                  })
                )}
              </Column>

              <Column>
                {subdList.length === 0 ? (
                  <EmptyHint>중분류를 선택하세요</EmptyHint>
                ) : (
                  <div className="flex flex-wrap gap-2 p-4">
                    {subdList.map((s) => {
                      const isOn = selectedSet.has(s.code);
                      return (
                        <button
                          key={s.code}
                          type="button"
                          onClick={() => toggleSubd(s.code)}
                          className={
                            'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ' +
                            (isOn
                              ? 'bg-[#2B7BD6] text-white'
                              : 'bg-white/8 text-white/80 hover:bg-white/15')
                          }
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Column>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-[#14171C] px-6 py-4">
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white"
              >
                <span>↻</span>
                <span>선택 초기화</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="text-[13px] text-white/55">
                  직무 <span className="font-semibold text-white">{selectedJobs.size}</span> · 업종{' '}
                  <span className="font-semibold text-white">{selectedInds.size}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/15 px-5 py-2 text-[14px] font-semibold text-white/90 hover:bg-white/5"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={apply}
                  disabled={selectedJobs.size + selectedInds.size === 0}
                  className="rounded-xl bg-[color:var(--color-primary)] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[color:var(--color-primary-hover)] disabled:bg-white/15 disabled:text-white/40"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[540px] min-h-[420px] overflow-y-auto py-2">{children}</div>
  );
}

function RowButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'group flex w-full items-center gap-2 px-5 py-2.5 text-left text-[14px] transition ' +
        (active
          ? 'bg-white/10 font-semibold text-white'
          : 'font-medium text-white/75 hover:bg-white/5 hover:text-white')
      }
    >
      <span
        className={
          'flex h-[14px] w-[14px] flex-none items-center justify-center rounded-full border ' +
          (active
            ? 'border-[#2B7BD6] bg-[#2B7BD6]'
            : 'border-white/25 group-hover:border-white/45')
        }
      >
        {active && <span className="h-[6px] w-[6px] rounded-full bg-white" />}
      </span>
      {children}
    </button>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center text-[13px] text-white/40">
      {children}
    </div>
  );
}
