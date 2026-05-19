import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProviderGuardrailsBootstrapInfo,
  listProviderGuardrails,
  refreshProviderGuardrails,
  updateProviderGuardrailAttachment,
} from '../../../../services/api/aiAgentService';
import type {
  ProviderGuardrailBootstrapInfoResponseDTO,
  ProviderGuardrailResponseDTO,
  UpdateProviderGuardrailAttachmentRequestDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';
import { useAiAgentContext } from '../components/AiAgentContext';

interface UseProviderGuardrailsResult {
  items: ProviderGuardrailResponseDTO[];
  loading: boolean;
  refreshing: boolean;
  mutatingId: number | null;
  error: string | null;
  bootstrapInfo: ProviderGuardrailBootstrapInfoResponseDTO | null;
  bootstrapLoading: boolean;
  refreshFromList: () => Promise<void>;
  refreshFromProvider: () => Promise<void>;
  updateAttachment: (
    id: number,
    payload: UpdateProviderGuardrailAttachmentRequestDTO
  ) => Promise<ProviderGuardrailResponseDTO>;
}

const sortItems = (items: ProviderGuardrailResponseDTO[]): ProviderGuardrailResponseDTO[] =>
  [...items].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const an = a.displayName ?? '';
    const bn = b.displayName ?? '';
    return an.localeCompare(bn, 'es');
  });

export function useProviderGuardrails(): UseProviderGuardrailsResult {
  // No invocamos refreshHealth: los provider guardrails no participan de
  // missingRequirements del AiAgentHealth. Sí marcamos la configuration
  // como DRAFT porque el backend confirma que updateAttachment revierte el
  // lifecycle (la intención se reconcilia en el próximo publish()).
  const { markConfigurationDraft } = useAiAgentContext();
  const [items, setItems] = useState<ProviderGuardrailResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapInfo, setBootstrapInfo] =
    useState<ProviderGuardrailBootstrapInfoResponseDTO | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // DO Gradient no expone un catálogo público de guardrails: el admin tiene
  // que vincular al menos uno desde el dashboard de DO la primera vez. Si la
  // lista local viene vacía, pedimos bootstrap-info para mostrar un banner
  // accionable con el deep link al dashboard. Si la lista tiene items,
  // limpiamos el bootstrapInfo para que el banner desaparezca.
  const maybeFetchBootstrapInfo = useCallback(
    async (currentItems: ProviderGuardrailResponseDTO[]) => {
      if (currentItems.length > 0) {
        if (mountedRef.current) setBootstrapInfo(null);
        return;
      }
      setBootstrapLoading(true);
      try {
        const info = await getProviderGuardrailsBootstrapInfo();
        if (!mountedRef.current) return;
        setBootstrapInfo(info);
      } catch {
        // Silent fallback: si el endpoint falla, el componente cae al empty
        // state simple sin romper el módulo.
        if (mountedRef.current) setBootstrapInfo(null);
      } finally {
        if (mountedRef.current) setBootstrapLoading(false);
      }
    },
    []
  );

  const refreshFromList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProviderGuardrails();
      if (!mountedRef.current) return;
      const sorted = sortItems(data);
      setItems(sorted);
      await maybeFetchBootstrapInfo(sorted);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudieron cargar los filtros de plataforma.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setItems([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [maybeFetchBootstrapInfo]);

  useEffect(() => {
    void refreshFromList();
  }, [refreshFromList]);

  const refreshFromProvider = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await refreshProviderGuardrails();
      if (!mountedRef.current) return;
      const sorted = sortItems(data);
      setItems(sorted);
      await maybeFetchBootstrapInfo(sorted);
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  }, [maybeFetchBootstrapInfo]);

  const updateAttachment = useCallback(
    async (id: number, payload: UpdateProviderGuardrailAttachmentRequestDTO) => {
      setMutatingId(id);
      try {
        const updated = await updateProviderGuardrailAttachment(id, payload);
        if (mountedRef.current) {
          setItems((prev) => sortItems(prev.map((it) => (it.id === id ? updated : it))));
        }
        markConfigurationDraft();
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [markConfigurationDraft]
  );

  return {
    items,
    loading,
    refreshing,
    mutatingId,
    error,
    bootstrapInfo,
    bootstrapLoading,
    refreshFromList,
    refreshFromProvider,
    updateAttachment,
  };
}
