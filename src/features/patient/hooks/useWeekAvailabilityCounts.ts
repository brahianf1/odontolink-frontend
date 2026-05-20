import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import patientService from '../../../services/api/patientService';

export interface WeekAvailabilityResult {
  counts: Map<string, number>;
  loading: boolean;
}

const todayKey = (): string => format(new Date(), 'yyyy-MM-dd');

const countValidSlots = (slots: string[], dateKey: string): number => {
  if (dateKey !== todayKey()) return slots.length;
  const now = Date.now();
  return slots.filter((slot) => parseISO(slot).getTime() > now).length;
};

export function useWeekAvailabilityCounts(
  treatmentId: number | null,
  dateStrings: string[],
  enabled: boolean = true
): WeekAvailabilityResult {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Map<number, Map<string, number>>>(new Map());

  const serializedDates = dateStrings.join(',');

  useEffect(() => {
    if (!enabled || !treatmentId || dateStrings.length === 0) {
      setCounts(new Map());
      return;
    }

    let treatmentCache = cacheRef.current.get(treatmentId);
    if (!treatmentCache) {
      treatmentCache = new Map<string, number>();
      cacheRef.current.set(treatmentId, treatmentCache);
    }

    const missing = dateStrings.filter((d) => !treatmentCache!.has(d));

    if (missing.length === 0) {
      setCounts(
        new Map(dateStrings.map((d) => [d, treatmentCache!.get(d) ?? 0]))
      );
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      missing.map((dateKey) =>
        patientService
          .getAvailableSlots(treatmentId, dateKey)
          .then((slots) => ({
            dateKey,
            count: countValidSlots(slots, dateKey),
            ok: true,
          }))
          .catch(() => ({ dateKey, count: 0, ok: false }))
      )
    ).then((results) => {
      if (cancelled) return;
      results.forEach(({ dateKey, count, ok }) => {
        if (ok) treatmentCache!.set(dateKey, count);
      });
      setCounts(
        new Map(dateStrings.map((d) => [d, treatmentCache!.get(d) ?? 0]))
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentId, serializedDates, enabled]);

  return { counts, loading };
}
