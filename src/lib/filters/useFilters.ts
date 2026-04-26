// nuqs 기반 URL 동기화 필터 훅 — 모든 페이지에서 동일한 필터 상태 공유

'use client';

import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { FilterState } from './match';

const PARSERS = {
  employment: parseAsArrayOf(parseAsString).withDefault([]),
  career: parseAsArrayOf(parseAsString).withDefault([]),
  education: parseAsArrayOf(parseAsString).withDefault([]),
  company: parseAsArrayOf(parseAsString).withDefault([]),
  region: parseAsArrayOf(parseAsString).withDefault([]),
};

export function useFilters() {
  const [state, setState] = useQueryStates(PARSERS, { history: 'push' });

  const filter: FilterState = useMemo(
    () => ({
      employment: state.employment ?? [],
      career: state.career ?? [],
      education: state.education ?? [],
      company: state.company ?? [],
      region: state.region ?? [],
    }),
    [state]
  );

  function toggle(axis: keyof FilterState, code: string) {
    const cur = filter[axis];
    const next = cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code];
    setState({ [axis]: next });
  }

  function clearAxis(axis: keyof FilterState) {
    setState({ [axis]: [] });
  }

  function clearAll() {
    setState({
      employment: [],
      career: [],
      education: [],
      company: [],
      region: [],
    });
  }

  return { filter, toggle, clearAxis, clearAll };
}
