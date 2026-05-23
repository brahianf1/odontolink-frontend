import { useEffect, useState } from 'react';
import { getFeedbackCriteria } from '../../../services/api/feedbackService';
import type { FeedbackCriterionDTO, FeedbackDirection } from '../../../types/feedback.types';

interface UseFeedbackCriteriaResult {
  criteria: FeedbackCriterionDTO[];
  loading: boolean;
  error: string | null;
}

export function useFeedbackCriteria(direction?: FeedbackDirection): UseFeedbackCriteriaResult {
  const [criteria, setCriteria] = useState<FeedbackCriterionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFeedbackCriteria(direction)
      .then((data) => {
        if (!cancelled) {
          setCriteria(data.sort((a, b) => a.displayOrder - b.displayOrder));
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los criterios de evaluación.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [direction]);

  return { criteria, loading, error };
}
