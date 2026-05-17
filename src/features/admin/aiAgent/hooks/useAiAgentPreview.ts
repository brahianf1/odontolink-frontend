import { useCallback, useEffect, useRef, useState } from 'react';
import { getInstructionPreview } from '../../../../services/api/aiAgentService';
import type { AiAgentInstructionPreviewResponseDTO } from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';

interface UseAiAgentPreviewResult {
  preview: AiAgentInstructionPreviewResponseDTO | null;
  loading: boolean;
  error: string | null;
  isNotConfigured: boolean;
  refresh: () => Promise<void>;
}

export function useAiAgentPreview(enabled = true): UseAiAgentPreviewResult {
  const [preview, setPreview] = useState<AiAgentInstructionPreviewResponseDTO | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isNotConfigured, setIsNotConfigured] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    setIsNotConfigured(false);
    try {
      const data = await getInstructionPreview();
      if (!mountedRef.current) return;
      setPreview(data);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cargar la previsualización.');
      if (!mountedRef.current) return;
      if (mapped.isNotConfigured) {
        setIsNotConfigured(true);
        setPreview(null);
      } else {
        setError(mapped.message);
        setPreview(null);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) void refresh();
  }, [enabled, refresh]);

  return { preview, loading, error, isNotConfigured, refresh };
}
