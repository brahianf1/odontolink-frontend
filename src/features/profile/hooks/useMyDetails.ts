import { useCallback, useEffect, useState } from 'react';
import { getMyDetails } from '../../../services/api/profileService';
import type { MyDetailsDTO } from '../../../types/profile.types';
import { getErrorMessage } from '../utils/apiErrors';

interface UseMyDetailsResult {
  details: MyDetailsDTO | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<MyDetailsDTO | null>;
}

export function useMyDetails(): UseMyDetailsResult {
  const [details, setDetails] = useState<MyDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyDetails();
      setDetails(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar tus datos específicos.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { details, loading, error, refresh: load };
}
