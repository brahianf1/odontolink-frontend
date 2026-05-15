import { useCallback, useEffect, useRef, useState } from 'react';
import { listPractitionerAttentions } from '../../../services/api/supervisorService';
import type { AttentionResponseDTO } from '../../../types/attention.types';

interface UsePractitionerAttentionsState {
  attentions: AttentionResponseDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePractitionerAttentions = (
  practitionerId: number | null
): UsePractitionerAttentionsState => {
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (practitionerId === null || Number.isNaN(practitionerId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listPractitionerAttentions(practitionerId);
      if (isMounted.current) setAttentions(data);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudieron cargar las atenciones del practicante.';
        setError(message);
        setAttentions([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [practitionerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { attentions, loading, error, refresh: load };
};
