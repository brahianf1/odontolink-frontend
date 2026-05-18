import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import type { ChatbotSessionStored } from '../../../types/chatbot.types';
import { CHATBOT_SESSION_KEY, CHATBOT_SESSION_TTL_MS } from '../utils/storageKeys';

interface UseChatbotSessionResult {
  session: ChatbotSessionStored | null;
  saveSession: (data: {
    sessionId: string;
    anonymousToken?: string | null;
  }) => ChatbotSessionStored;
  clearSession: () => void;
}

const readFromStorage = (): ChatbotSessionStored | null => {
  try {
    const raw = window.localStorage.getItem(CHATBOT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ChatbotSessionStored>;
    if (
      !parsed ||
      typeof parsed.sessionId !== 'string' ||
      typeof parsed.startedAt !== 'string' ||
      (parsed.mode !== 'anonymous' && parsed.mode !== 'authenticated')
    ) {
      return null;
    }
    const startedMs = Date.parse(parsed.startedAt);
    if (Number.isNaN(startedMs)) return null;
    if (Date.now() - startedMs > CHATBOT_SESSION_TTL_MS) return null;
    return parsed as ChatbotSessionStored;
  } catch {
    return null;
  }
};

const writeToStorage = (data: ChatbotSessionStored): void => {
  try {
    window.localStorage.setItem(CHATBOT_SESSION_KEY, JSON.stringify(data));
  } catch {
    // Quota or privacy mode — silently ignore.
  }
};

const removeFromStorage = (): void => {
  try {
    window.localStorage.removeItem(CHATBOT_SESSION_KEY);
  } catch {
    // Ignore.
  }
};

export function useChatbotSession(): UseChatbotSessionResult {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.userId ?? null);
  const [session, setSession] = useState<ChatbotSessionStored | null>(() => readFromStorage());
  const lastModeRef = useRef<{
    mode: 'anonymous' | 'authenticated';
    userId: number | null;
  } | null>(
    session ? { mode: session.mode, userId: session.userId ?? null } : null
  );

  useEffect(() => {
    const currentMode: 'anonymous' | 'authenticated' = isAuthenticated
      ? 'authenticated'
      : 'anonymous';
    const previous = lastModeRef.current;
    const sessionExists = session !== null;

    // Detect auth mode transitions: anon→auth, auth→anon, or auth user change.
    const modeChanged =
      sessionExists &&
      (session.mode !== currentMode ||
        (currentMode === 'authenticated' && (session.userId ?? null) !== userId));

    if (modeChanged) {
      removeFromStorage();
      setSession(null);
      lastModeRef.current = { mode: currentMode, userId };
      return;
    }

    if (!previous) {
      lastModeRef.current = { mode: currentMode, userId };
    } else {
      previous.mode = currentMode;
      previous.userId = userId;
    }
  }, [isAuthenticated, userId, session]);

  const saveSession = useCallback(
    ({
      sessionId,
      anonymousToken,
    }: {
      sessionId: string;
      anonymousToken?: string | null;
    }): ChatbotSessionStored => {
      const mode: 'anonymous' | 'authenticated' = isAuthenticated
        ? 'authenticated'
        : 'anonymous';
      const data: ChatbotSessionStored = {
        sessionId,
        startedAt: new Date().toISOString(),
        mode,
        ...(mode === 'anonymous' && anonymousToken
          ? { anonymousToken }
          : {}),
        ...(mode === 'authenticated' && userId !== null ? { userId } : {}),
      };
      writeToStorage(data);
      setSession(data);
      lastModeRef.current = { mode, userId };
      return data;
    },
    [isAuthenticated, userId]
  );

  const clearSession = useCallback(() => {
    removeFromStorage();
    setSession(null);
  }, []);

  return { session, saveSession, clearSession };
}
