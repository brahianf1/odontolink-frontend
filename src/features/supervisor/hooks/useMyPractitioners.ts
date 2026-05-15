import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyPractitioners } from '../../../services/api/supervisorService';
import type { PractitionerDTO } from '../../../types/supervisor.types';

interface UseMyPractitionersState {
  practitioners: PractitionerDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  removeLocal: (practitionerId: number) => void;
  addLocal: (practitioner: PractitionerDTO) => void;
}

export const useMyPractitioners = (): UseMyPractitionersState => {
  const [practitioners, setPractitioners] = useState<PractitionerDTO[]>([]);
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
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPractitioners();
      if (isMounted.current) setPractitioners(data);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudo cargar la lista de practicantes a cargo.';
        setError(message);
        setPractitioners([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const removeLocal = useCallback((practitionerId: number) => {
    setPractitioners((prev) => prev.filter((p) => p.id !== practitionerId));
  }, []);

  const addLocal = useCallback((practitioner: PractitionerDTO) => {
    setPractitioners((prev) => {
      if (prev.some((p) => p.id === practitioner.id)) return prev;
      return [practitioner, ...prev];
    });
  }, []);

  return { practitioners, loading, error, refresh: load, removeLocal, addLocal };
};
