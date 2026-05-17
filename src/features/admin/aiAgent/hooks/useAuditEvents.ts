import { useCallback, useEffect, useRef, useState } from 'react';
import { listAuditEvents } from '../../../../services/api/aiAgentService';
import type { PageResponse } from '../../../../types/common.types';
import type {
  AiAdminAuditEventResponseDTO,
  AuditEventsQuery,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';

interface UseAuditEventsResult {
  page: PageResponse<AiAdminAuditEventResponseDTO> | null;
  loading: boolean;
  error: string | null;
  query: AuditEventsQuery;
  setQuery: (q: Partial<AuditEventsQuery>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 25;

export function useAuditEvents(): UseAuditEventsResult {
  const [page, setPage] = useState<PageResponse<AiAdminAuditEventResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState<AuditEventsQuery>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (q: AuditEventsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAuditEvents(q);
      if (!mountedRef.current) return;
      setPage(data);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar los eventos de auditoría.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setPage(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPage(query);
  }, [query, fetchPage]);

  const setQuery = useCallback((q: Partial<AuditEventsQuery>) => {
    setQueryState((prev) => ({ ...prev, ...q, page: q.page ?? 0 }));
  }, []);

  const setPageNumber = useCallback((p: number) => {
    setQueryState((prev) => ({ ...prev, page: p }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setQueryState((prev) => ({ ...prev, size, page: 0 }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchPage(query);
  }, [fetchPage, query]);

  return {
    page,
    loading,
    error,
    query,
    setQuery,
    setPage: setPageNumber,
    setPageSize,
    refresh,
  };
}
