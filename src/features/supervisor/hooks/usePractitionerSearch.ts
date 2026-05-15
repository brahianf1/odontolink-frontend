import { useCallback, useEffect, useRef, useState } from 'react';
import { searchPractitioners } from '../../../services/api/supervisorService';
import type { PractitionerDTO } from '../../../types/supervisor.types';

interface UsePractitionerSearchState {
  results: PractitionerDTO[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (value: string) => void;
}

const DEBOUNCE_MS = 350;

export const usePractitionerSearch = (
  enabled: boolean = true
): UsePractitionerSearchState => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<PractitionerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  const fetchResults = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchPractitioners(debounced);
      if (isMounted.current) setResults(data);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudo realizar la búsqueda.';
        setError(message);
        setResults([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [debounced, enabled]);

  useEffect(() => {
    if (enabled) void fetchResults();
  }, [fetchResults, enabled]);

  return { results, loading, error, query, setQuery };
};
