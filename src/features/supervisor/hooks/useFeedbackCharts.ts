import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getTopByCriterion,
  getPractitionersRanking,
} from '../../../services/api/supervisorService';
import type {
  TopByCriterionResponseDTO,
  PractitionersRankingResponseDTO,
} from '../../../types/feedback.types';

interface UseFeedbackChartsResult {
  criterionCharts: TopByCriterionResponseDTO[];
  combinedRanking: PractitionersRankingResponseDTO | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFeedbackCharts(): UseFeedbackChartsResult {
  const [criterionCharts, setCriterionCharts] = useState<TopByCriterionResponseDTO[]>([]);
  const [combinedRanking, setCombinedRanking] = useState<PractitionersRankingResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ranking = await getPractitionersRanking();
      if (!isMounted.current) return;
      setCombinedRanking(ranking);

      const charts = await Promise.all(
        ranking.criteriaUsed.map((c) =>
          getTopByCriterion({ criterionCode: c.code })
        )
      );
      if (!isMounted.current) return;
      setCriterionCharts(charts);
    } catch {
      if (isMounted.current) {
        setError('No se pudieron cargar los gráficos de feedback.');
        setCriterionCharts([]);
        setCombinedRanking(null);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { criterionCharts, combinedRanking, loading, error, refresh: fetchData };
}
