import { useCallback, useEffect, useMemo, useState } from 'react';
import nonWorkingDayService from '../services/api/nonWorkingDayService';
import type { NonWorkingDayDTO } from '../types/nonWorkingDay.types';

const yearCache = new Map<number, Map<string, NonWorkingDayDTO>>();
const pendingFetches = new Map<number, Promise<Map<string, NonWorkingDayDTO>>>();

function fetchYear(year: number): Promise<Map<string, NonWorkingDayDTO>> {
  const cached = yearCache.get(year);
  if (cached) return Promise.resolve(cached);

  const pending = pendingFetches.get(year);
  if (pending) return pending;

  const promise = nonWorkingDayService
    .getByYear(year)
    .then((days) => {
      const map = new Map(days.map((d) => [d.date, d]));
      yearCache.set(year, map);
      pendingFetches.delete(year);
      return map;
    })
    .catch((err) => {
      pendingFetches.delete(year);
      throw err;
    });

  pendingFetches.set(year, promise);
  return promise;
}

export interface UseNonWorkingDaysResult {
  nonWorkingDays: Map<string, NonWorkingDayDTO>;
  loading: boolean;
  isNonWorkingDay: (dateKey: string) => boolean;
  getNonWorkingDayName: (dateKey: string) => string | null;
}

export function useNonWorkingDays(years: number[]): UseNonWorkingDaysResult {
  const [nonWorkingDays, setNonWorkingDays] = useState<Map<string, NonWorkingDayDTO>>(new Map());
  const [loading, setLoading] = useState(false);

  const sortedKey = useMemo(() => [...new Set(years)].sort().join(','), [years]);

  useEffect(() => {
    const uniqueYears = sortedKey ? sortedKey.split(',').map(Number) : [];
    if (uniqueYears.length === 0) {
      setNonWorkingDays(new Map());
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(uniqueYears.map(fetchYear))
      .then((results) => {
        if (cancelled) return;
        const merged = new Map<string, NonWorkingDayDTO>();
        results.forEach((m) => m.forEach((v, k) => merged.set(k, v)));
        setNonWorkingDays(merged);
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sortedKey]);

  const isNonWorkingDay = useCallback(
    (dateKey: string): boolean => nonWorkingDays.has(dateKey),
    [nonWorkingDays],
  );

  const getNonWorkingDayName = useCallback(
    (dateKey: string): string | null => nonWorkingDays.get(dateKey)?.name ?? null,
    [nonWorkingDays],
  );

  return { nonWorkingDays, loading, isNonWorkingDay, getNonWorkingDayName };
}
