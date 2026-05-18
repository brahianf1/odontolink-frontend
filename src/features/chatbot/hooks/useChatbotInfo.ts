import { useCallback, useEffect, useRef, useState } from 'react';
import { getInfo } from '../../../services/api/chatbotService';
import type { ChatbotPublicInfoResponseDTO } from '../../../types/chatbot.types';
import { mapChatbotError } from '../utils/chatbotApiErrors';

const INFO_CACHE_TTL_MS = 5 * 60 * 1000;

interface UseChatbotInfoResult {
  info: ChatbotPublicInfoResponseDTO | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  lastFetchedAt: number | null;
}

export function useChatbotInfo(): UseChatbotInfoResult {
  const [info, setInfo] = useState<ChatbotPublicInfoResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAtRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force === true;
    if (inFlightRef.current) return;
    if (
      !force &&
      lastFetchedAtRef.current !== null &&
      Date.now() - lastFetchedAtRef.current < INFO_CACHE_TTL_MS
    ) {
      return;
    }
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await getInfo();
      if (!mountedRef.current) return;
      setInfo(data);
      lastFetchedAtRef.current = Date.now();
    } catch (err) {
      const mapped = mapChatbotError(err, 'No se pudo cargar la información del chatbot.');
      if (!mountedRef.current) return;
      setError(mapped.message);
      setInfo(null);
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { info, loading, error, refresh, lastFetchedAt: lastFetchedAtRef.current };
}
