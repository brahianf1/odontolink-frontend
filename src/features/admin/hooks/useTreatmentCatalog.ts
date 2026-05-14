import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listMasterTreatments } from '../../../services/api/treatmentService';
import type { TreatmentResponseDTO } from '../../../types/practitioner.types';

interface UseTreatmentCatalogState {
  treatments: TreatmentResponseDTO[];
  filtered: TreatmentResponseDTO[];
  areas: string[];
  loading: boolean;
  error: string | null;
  search: string;
  area: string;
  setSearch: (value: string) => void;
  setArea: (value: string) => void;
  refresh: () => Promise<void>;
  prependTreatment: (item: TreatmentResponseDTO) => void;
}

const SEARCH_DEBOUNCE_MS = 250;

const normalize = (value: string | undefined | null): string =>
  (value ?? '').toLocaleLowerCase('es-AR').trim();

export const useTreatmentCatalog = (): UseTreatmentCatalogState => {
  const [treatments, setTreatments] = useState<TreatmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [area, setArea] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMasterTreatments();
      if (isMounted.current) setTreatments(data);
    } catch (err) {
      if (isMounted.current) {
        const message =
          (err as { message?: string })?.message ||
          'No se pudo cargar el catálogo de tratamientos.';
        setError(message);
        setTreatments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    for (const item of treatments) {
      if (item.area && item.area.trim().length > 0) {
        set.add(item.area.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es-AR'));
  }, [treatments]);

  const filtered = useMemo(() => {
    const term = normalize(debouncedSearch);
    const areaFilter = area.trim();
    return treatments.filter((item) => {
      if (areaFilter && (item.area ?? '').trim() !== areaFilter) return false;
      if (!term) return true;
      return (
        normalize(item.name).includes(term) ||
        normalize(item.description).includes(term) ||
        normalize(item.area).includes(term)
      );
    });
  }, [treatments, debouncedSearch, area]);

  const prependTreatment = useCallback((item: TreatmentResponseDTO) => {
    setTreatments((prev) => [item, ...prev]);
  }, []);

  return {
    treatments,
    filtered,
    areas,
    loading,
    error,
    search,
    area,
    setSearch,
    setArea,
    refresh: load,
    prependTreatment,
  };
};
