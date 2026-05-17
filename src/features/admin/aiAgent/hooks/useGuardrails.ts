import { useCallback, useEffect, useRef, useState } from 'react';
import {
  activateGuardrail,
  createGuardrail,
  deactivateGuardrail,
  deleteGuardrail,
  listGuardrails,
  updateGuardrail,
} from '../../../../services/api/aiAgentService';
import type {
  GuardrailRequestDTO,
  GuardrailResponseDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseGuardrailsResult {
  guardrails: GuardrailResponseDTO[];
  loading: boolean;
  mutatingId: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  create: (payload: GuardrailRequestDTO) => Promise<GuardrailResponseDTO>;
  update: (id: number, payload: GuardrailRequestDTO) => Promise<GuardrailResponseDTO>;
  remove: (id: number) => Promise<void>;
  setActive: (id: number, active: boolean) => Promise<GuardrailResponseDTO>;
}

const sortGuardrails = (items: GuardrailResponseDTO[]): GuardrailResponseDTO[] =>
  [...items].sort((a, b) => a.label.localeCompare(b.label, 'es'));

export function useGuardrails(): UseGuardrailsResult {
  const { refreshHealth } = useAiAgentContext();
  const [guardrails, setGuardrails] = useState<GuardrailResponseDTO[]>([]);
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
      const data = await listGuardrails();
      if (!mountedRef.current) return;
      setGuardrails(sortGuardrails(data));
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar los guardrails.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setGuardrails([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: GuardrailRequestDTO) => {
      setMutatingId(-1);
      try {
        const created = await createGuardrail(payload);
        if (mountedRef.current) setGuardrails((prev) => sortGuardrails([...prev, created]));
        void refreshHealth();
        return created;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth]
  );

  const update = useCallback(
    async (id: number, payload: GuardrailRequestDTO) => {
      setMutatingId(id);
      try {
        const updated = await updateGuardrail(id, payload);
        if (mountedRef.current) {
          setGuardrails((prev) => sortGuardrails(prev.map((g) => (g.id === id ? updated : g))));
        }
        void refreshHealth();
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth]
  );

  const remove = useCallback(
    async (id: number) => {
      setMutatingId(id);
      try {
        await deleteGuardrail(id);
        if (mountedRef.current) {
          setGuardrails((prev) => prev.filter((g) => g.id !== id));
        }
        void refreshHealth();
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth]
  );

  const setActive = useCallback(
    async (id: number, active: boolean) => {
      setMutatingId(id);
      try {
        const updated = active ? await activateGuardrail(id) : await deactivateGuardrail(id);
        if (mountedRef.current) {
          setGuardrails((prev) => sortGuardrails(prev.map((g) => (g.id === id ? updated : g))));
        }
        void refreshHealth();
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [refreshHealth]
  );

  return { guardrails, loading, mutatingId, error, refresh, create, update, remove, setActive };
}
