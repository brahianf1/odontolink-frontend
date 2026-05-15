import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyAttentions } from '../../../services/api/practitionerService';
import type { AttentionResponseDTO } from '../../../types/attention.types';
import { mapPractitionerError } from '../utils/apiErrors';

interface UseMyAttentionsResult {
  attentions: AttentionResponseDTO[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useMyAttentions(): UseMyAttentionsResult {
  const [attentions, setAttentions] = useState<AttentionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAttentions();
      setAttentions(data);
    } catch (err) {
      const mapped = mapPractitionerError(err, 'No se pudieron cargar tus atenciones.');
      setError(mapped.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return useMemo(
    () => ({ attentions, loading, error, reload }),
    [attentions, loading, error, reload]
  );
}
