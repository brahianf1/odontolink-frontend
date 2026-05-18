import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEmergencyKeyword,
  deleteEmergencyKeyword,
  listEmergencyKeywords,
  updateEmergencyKeyword,
} from '../../../../services/api/aiAgentService';
import type {
  CreateEmergencyKeywordRequestDTO,
  EmergencyKeywordResponseDTO,
  UpdateEmergencyKeywordRequestDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';

interface UseEmergencyKeywordsResult {
  keywords: EmergencyKeywordResponseDTO[];
  loading: boolean;
  mutatingId: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  create: (payload: CreateEmergencyKeywordRequestDTO) => Promise<EmergencyKeywordResponseDTO>;
  update: (
    id: number,
    payload: UpdateEmergencyKeywordRequestDTO
  ) => Promise<EmergencyKeywordResponseDTO>;
  remove: (id: number) => Promise<void>;
  toggleActive: (
    keyword: EmergencyKeywordResponseDTO,
    active: boolean
  ) => Promise<EmergencyKeywordResponseDTO>;
}

const sortKeywords = (
  items: EmergencyKeywordResponseDTO[]
): EmergencyKeywordResponseDTO[] =>
  [...items].sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));

export function useEmergencyKeywords(): UseEmergencyKeywordsResult {
  const [keywords, setKeywords] = useState<EmergencyKeywordResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEmergencyKeywords();
      if (!mountedRef.current) return;
      setKeywords(sortKeywords(data));
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar las palabras de emergencia.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setKeywords([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (payload: CreateEmergencyKeywordRequestDTO) => {
    setMutatingId(-1);
    try {
      const created = await createEmergencyKeyword(payload);
      if (mountedRef.current) setKeywords((prev) => sortKeywords([...prev, created]));
      return created;
    } finally {
      if (mountedRef.current) setMutatingId(null);
    }
  }, []);

  const update = useCallback(
    async (id: number, payload: UpdateEmergencyKeywordRequestDTO) => {
      setMutatingId(id);
      try {
        const updated = await updateEmergencyKeyword(id, payload);
        if (mountedRef.current) {
          setKeywords((prev) =>
            sortKeywords(prev.map((k) => (k.id === id ? updated : k)))
          );
        }
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    []
  );

  const remove = useCallback(async (id: number) => {
    setMutatingId(id);
    try {
      await deleteEmergencyKeyword(id);
      if (mountedRef.current) {
        setKeywords((prev) => prev.filter((k) => k.id !== id));
      }
    } finally {
      if (mountedRef.current) setMutatingId(null);
    }
  }, []);

  const toggleActive = useCallback(
    async (keyword: EmergencyKeywordResponseDTO, active: boolean) => {
      setMutatingId(keyword.id);
      try {
        const updated = await updateEmergencyKeyword(keyword.id, {
          term: keyword.term,
          active,
        });
        if (mountedRef.current) {
          setKeywords((prev) =>
            sortKeywords(prev.map((k) => (k.id === keyword.id ? updated : k)))
          );
        }
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    []
  );

  return { keywords, loading, mutatingId, error, refresh, create, update, remove, toggleActive };
}
