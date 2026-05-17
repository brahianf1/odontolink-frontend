import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listVersions,
  rollbackVersion,
} from '../../../../services/api/aiAgentService';
import type { PageResponse } from '../../../../types/common.types';
import type {
  AiAgentConfigurationVersionResponseDTO,
  VersionsQuery,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseVersionsResult {
  page: PageResponse<AiAgentConfigurationVersionResponseDTO> | null;
  loading: boolean;
  rollingBackVersion: number | null;
  error: string | null;
  query: VersionsQuery;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => Promise<void>;
  rollback: (versionNumber: number) => Promise<AiAgentConfigurationVersionResponseDTO>;
}

const DEFAULT_PAGE_SIZE = 10;

export function useVersions(): UseVersionsResult {
  const { refreshConfiguration, refreshHealth } = useAiAgentContext();
  const [page, setPage] = useState<PageResponse<AiAgentConfigurationVersionResponseDTO> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [rollingBackVersion, setRollingBackVersion] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<VersionsQuery>({ page: 0, size: DEFAULT_PAGE_SIZE });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (q: VersionsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listVersions(q);
      if (!mountedRef.current) return;
      setPage(data);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar las versiones.');
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

  const setPageNumber = useCallback((p: number) => {
    setQuery((prev) => ({ ...prev, page: p }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setQuery((prev) => ({ ...prev, size, page: 0 }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchPage(query);
  }, [fetchPage, query]);

  const rollback = useCallback(
    async (versionNumber: number) => {
      setRollingBackVersion(versionNumber);
      try {
        const updated = await rollbackVersion(versionNumber);
        await fetchPage(query);
        // Rollback genera una nueva versión publicada → refrescar configuration y health.
        void refreshConfiguration();
        void refreshHealth();
        return updated;
      } finally {
        if (mountedRef.current) setRollingBackVersion(null);
      }
    },
    [fetchPage, query, refreshConfiguration, refreshHealth]
  );

  return {
    page,
    loading,
    rollingBackVersion,
    error,
    query,
    setPage: setPageNumber,
    setPageSize,
    refresh,
    rollback,
  };
}
