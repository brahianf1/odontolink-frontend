import { useCallback, useEffect, useRef, useState } from 'react';
import { getInfo } from '../../../services/api/chatbotService';
import { useAuthStore } from '../../../store/authStore';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.userId ?? null);

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

  // Re-fetch al montar y cuando cambia el auth state (login, logout, swap
  // de usuario). `force: true` invalida el cache de 5 min para que la
  // transición sea inmediata: el FAB aparece/desaparece apenas el backend
  // confirma si el visitante actual tiene acceso. Sin esto, el cache haría
  // que un user privado siga viendo (o no viendo) el chat hasta 5 min.
  useEffect(() => {
    void refresh({ force: true });
  }, [isAuthenticated, userId, refresh]);

  return { info, loading, error, refresh, lastFetchedAt: lastFetchedAtRef.current };
}
