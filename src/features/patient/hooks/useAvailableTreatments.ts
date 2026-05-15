import { useCallback, useEffect, useMemo, useState } from 'react';
import patientService from '../../../services/api/patientService';
import type { OfferedTreatmentResponseDTO } from '../../../types/practitioner.types';
import type {
  DayOfWeek,
  OfferedTreatmentSortField,
  SortDirection,
} from '../../../types/patient.types';
import { useDebouncedValue } from './useDebouncedValue';
import { mapBusinessError } from '../utils/apiErrors';

export interface TreatmentFilters {
  keyword: string;
  specialty: string;
  availability: DayOfWeek | '';
  sortBy: OfferedTreatmentSortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: TreatmentFilters = {
  keyword: '',
  specialty: '',
  availability: '',
  sortBy: 'treatmentName',
  sortDirection: 'ASC',
};

interface UseAvailableTreatmentsResult {
  treatments: OfferedTreatmentResponseDTO[];
  filters: TreatmentFilters;
  setFilters: (next: Partial<TreatmentFilters>) => void;
  resetFilters: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAvailableTreatments(initialSize = 12): UseAvailableTreatmentsResult {
  const [filters, setFiltersState] = useState<TreatmentFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [treatments, setTreatments] = useState<OfferedTreatmentResponseDTO[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedKeyword = useDebouncedValue(filters.keyword, 400);

  const queryParams = useMemo(
    () => ({
      keyword: debouncedKeyword,
      specialty: filters.specialty,
      availability: filters.availability || undefined,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      page,
      size,
    }),
    [debouncedKeyword, filters.specialty, filters.availability, filters.sortBy, filters.sortDirection, page, size]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientService.searchAvailableTreatments(queryParams);
      setTreatments(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      const { message } = mapBusinessError(err, 'No pudimos cargar el catálogo de tratamientos.');
      setError(message);
      setTreatments([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setFilters = useCallback((next: Partial<TreatmentFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(0);
  }, []);

  return {
    treatments,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    loading,
    error,
    reload,
  };
}
