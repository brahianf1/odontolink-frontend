import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeedbackDashboard } from '../../../services/api/supervisorService';
import type {
  FeedbackDashboardQuery,
  FeedbackDashboardResponseDTO,
} from '../../../types/supervisor.types';

interface UseFeedbackDashboardState {
  data: FeedbackDashboardResponseDTO | null;
  loading: boolean;
  error: string | null;
  query: FeedbackDashboardQuery;
  setQuery: (updater: (prev: FeedbackDashboardQuery) => FeedbackDashboardQuery) => void;
  refresh: () => Promise<void>;
}

const DEFAULT_QUERY: FeedbackDashboardQuery = {
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

export const useFeedbackDashboard = (
  initialQuery: Partial<FeedbackDashboardQuery> = {}
): UseFeedbackDashboardState => {
  const [data, setData] = useState<FeedbackDashboardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState<FeedbackDashboardQuery>({
    ...DEFAULT_QUERY,
    ...initialQuery,
  });
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
      const response = await getFeedbackDashboard(query);
      if (isMounted.current) setData(response);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudo cargar el panel de feedback.';
        setError(message);
        setData(null);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const setQuery: UseFeedbackDashboardState['setQuery'] = useCallback((updater) => {
    setQueryState((prev) => updater(prev));
  }, []);

  return { data, loading, error, query, setQuery, refresh: fetchData };
};
